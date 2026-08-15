package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.CrmLeadStageRecorder;
import com.zhehang.erp.modules.crm.service.CrmPoolRuleService;
import com.zhehang.erp.modules.crm.service.ICrmHoldingService;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.company.domain.CompanyInfo;
import com.zhehang.erp.modules.company.service.CompanyInfoService;
import com.zhehang.erp.modules.system.service.GovernedFieldValueValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmLeadServiceImpl extends ServiceImpl<CrmLeadMapper, CrmLead> implements ICrmLeadService {

    /** 释放后冷却:原跟进人 15 天内不可再领同一线索 */
    private static final String COOLDOWN_KEY = "crm:claim:cooldown:";
    /** 每日领取上限 */
    private static final String DAILY_KEY = "crm:claim:daily:";
    private static final long DAILY_LIMIT = 1000L;
    /** 客资保护期(天):领取/分配/跟进后顺延;到期仍未跟进则被回收引擎(autoRecycle)释放回公海 */
    /** 自动回收阈值(天):持有线索连续 N 天未跟进且已过保护期,则回收回公海 */
    /** 回收预警(天):保护期将在 N 天内到期的客资提示电销尽快跟进,避免被自动回收 */
    private static final Set<String> SALES_STAGES = Set.of(
            "线索接收", "需求沟通", "需求答疑", "签单收款", "移交结束交付");
    private static final Set<String> CUSTOMER_LEVELS = Set.of("A", "B", "C", "D", "E");
    private static final Set<String> HISTORY_LEVELS = Set.of("D", "E");

    private final CrmLeadMapper leadMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final CrmFollowMapper followMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ICrmHoldingService holdingService;
    private final DataScopeHelper dataScopeHelper;
    private final CompanyInfoService companyInfoService;
    private final CrmLeadStageRecorder stageRecorder;
    private final CrmPoolRuleService ruleService;
    private final GovernedFieldValueValidator governedFieldValueValidator;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createManualLead(CrmLead lead) {
        if (lead == null) {
            throw new BusinessException("线索不能为空");
        }
        if (Integer.valueOf(1).equals(ruleService.current().getDuplicateBlockEnabled())) {
            assertNoDuplicate(lead);
        }
        ruleService.consumeDaily(CrmPoolRuleService.MANUAL_ENTRY, 1);
        if (!save(lead)) {
            throw new BusinessException("线索创建失败，请稍后重试");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public boolean save(CrmLead entity) {
        if (entity == null) {
            return false;
        }
        entity.setConsultBusiness(governedFieldValueValidator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "咨询业务", entity.getConsultBusiness(), false));
        entity.setDealBusiness(governedFieldValueValidator.validateNewValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS,
                "实际成交业务", entity.getDealBusiness(), true));
        // 公司名标准化(去首尾空格),保证去重/带出一致
        if (entity.getCompany() != null) {
            entity.setCompany(entity.getCompany().trim());
        }
        // 新客必须从“未分级”开始，不能继承数据库历史默认C；只有真实沟通后才形成A-E。
        if (!StringUtils.hasText(entity.getCustomerLevel())) {
            entity.setCustomerLevel(null);
        }
        if (!StringUtils.hasText(entity.getIntentLevel())) {
            entity.setIntentLevel(null);
        }
        if (!StringUtils.hasText(entity.getLegalPerson()) && StringUtils.hasText(entity.getName())
                && !entity.getName().equals(entity.getCompany())) {
            entity.setLegalPerson(entity.getName().trim());
        }
        if (!StringUtils.hasText(entity.getName()) && StringUtils.hasText(entity.getLegalPerson())) {
            entity.setName(entity.getLegalPerson().trim());
        }
        // 自动补工商信息:填了公司名但工商字段为空时,从工商库带出补全(区域/规模/注册资本/成立日期)
        enrichFromCompany(entity);
        // 新建线索:若已指定负责人(私海)则补归属部门;无负责人(进公海)保持无部门,待领取时再写
        if (entity.getOwnerId() != null && entity.getDeptId() == null) {
            entity.setDeptId(dataScopeHelper.deptIdOfUser(entity.getOwnerId()));
        }
        // 投流:客户编号为空则自动生成唯一编号(TL+yyyyMMdd+6位),保证唯一(命中则重试几次)
        if (!StringUtils.hasText(entity.getLeadNo())) {
            entity.setLeadNo(generateLeadNo());
        }
        // 投流:新建即带「线索接收」状态时,顺手写入接收时点(用于算响应时间)
        if ("线索接收".equals(entity.getFollowStatus()) && entity.getReceiveTime() == null) {
            entity.setReceiveTime(LocalDateTime.now());
        }
        boolean saved = super.save(entity);
        if (saved) {
            stageRecorder.recordCreation(entity, "LEAD", entity.getId());
        }
        return saved;
    }

    /** 生成唯一客户编号:TL + yyyyMMdd + 6位序号;若撞库最多重试 5 次,仍撞则退回时间戳后缀兜底 */
    private String generateLeadNo() {
        String prefix = "TL" + LocalDate.now().format(java.time.format.DateTimeFormatter.BASIC_ISO_DATE);
        for (int i = 0; i < 5; i++) {
            String candidate = prefix + String.format("%06d", java.util.concurrent.ThreadLocalRandom.current().nextInt(1_000_000));
            Long exist = leadMapper.selectCount(new LambdaQueryWrapper<CrmLead>().eq(CrmLead::getLeadNo, candidate));
            if (exist == null || exist == 0) {
                return candidate;
            }
        }
        // 极端并发/巧合下退回毫秒时间戳后6位,尽量唯一(未加DB唯一约束,彻底唯一需DB约束)
        return prefix + String.format("%06d", System.currentTimeMillis() % 1_000_000);
    }

    /** 自动补工商信息:有公司名且工商字段为空时,调工商带出补全。失败不阻断建线索。 */
    private void enrichFromCompany(CrmLead lead) {
        if (lead == null || !StringUtils.hasText(lead.getCompany())) {
            return;
        }
        // 已手填区域+规模则视为不需补全,避免覆盖
        if (StringUtils.hasText(lead.getRegion()) && StringUtils.hasText(lead.getEnterpriseScale())) {
            return;
        }
        try {
            CompanyInfo info = companyInfoService.detail(lead.getCompany());
            if (info == null) {
                return;
            }
            if (!StringUtils.hasText(lead.getRegion())) {
                lead.setRegion(StringUtils.hasText(info.getCity()) ? info.getCity() : info.getProvince());
            }
            if (!StringUtils.hasText(lead.getLegalPerson()) && StringUtils.hasText(info.getLegalPerson())) {
                lead.setLegalPerson(info.getLegalPerson());
            }
            if (!StringUtils.hasText(lead.getName()) && StringUtils.hasText(info.getLegalPerson())) {
                lead.setName(info.getLegalPerson());
            }
            if (!StringUtils.hasText(lead.getRegisterStatus()) && StringUtils.hasText(info.getBusinessStatus())) {
                lead.setRegisterStatus(info.getBusinessStatus());
            }
            if (!StringUtils.hasText(lead.getEnterpriseType()) && StringUtils.hasText(info.getCompanyType())) {
                lead.setEnterpriseType(info.getCompanyType());
            }
            if (!StringUtils.hasText(lead.getCreditCode()) && StringUtils.hasText(info.getCreditCode())) {
                lead.setCreditCode(info.getCreditCode());
            }
            if (!StringUtils.hasText(lead.getRegisterAddress()) && StringUtils.hasText(info.getAddress())) {
                lead.setRegisterAddress(info.getAddress());
            }
            if (StringUtils.hasText(info.getIndustry())) {
                appendIndustryToRemark(lead, info.getIndustry());
            }
            if (!StringUtils.hasText(lead.getEnterpriseScale()) && StringUtils.hasText(info.getEmployeeScale())) {
                lead.setEnterpriseScale(info.getEmployeeScale());
            }
            if (lead.getRegisteredCapital() == null) {
                lead.setRegisteredCapital(parseCapital(info.getRegisteredCapital()));
            }
            if (lead.getEstablishedDate() == null) {
                lead.setEstablishedDate(parseDate(info.getEstablishDate()));
            }
        } catch (Exception ignore) {
            // 工商带出失败(无网/未命中)不影响建线索
        }
    }

    /** 从"1000万元"之类字符串提取数值;失败返回 null */
    private BigDecimal parseCapital(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        java.util.regex.Matcher m = java.util.regex.Pattern.compile("[0-9]+(\\.[0-9]+)?").matcher(s);
        if (m.find()) {
            try {
                return new BigDecimal(m.group());
            } catch (Exception e) {
                log.debug("注册资本解析失败,原值[{}]", s);
                return null;
            }
        }
        return null;
    }

    /** 宽松解析成立日期(yyyy-MM-dd / yyyy/MM/dd);失败返回 null */
    private LocalDate parseDate(String s) {
        if (!StringUtils.hasText(s)) {
            return null;
        }
        try {
            String t = s.trim().replace('/', '-');
            return LocalDate.parse(t.substring(0, Math.min(10, t.length())));
        } catch (Exception e) {
            log.debug("成立日期解析失败,原值[{}]", s);
            return null;
        }
    }

    @Override
    public IPage<CrmLead> selectPage(int pageNum, int pageSize, String name, Integer source, Integer status, Long ownerId) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        // 数据权限:电销只看自己、主管看本部门、管理员看全部;前端传的 ownerId 只能在可见范围内收窄
        dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        applyKeyword(wrapper, name)
               .eq(source != null, CrmLead::getSource, source)
               .eq(status != null, CrmLead::getStatus, status)
               .eq(ownerId != null, CrmLead::getOwnerId, ownerId)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void convertToCustomer(Long id) {
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new BusinessException("无权转化该线索(不在你的数据范围内)");
        }
        if (lead.getStatus() != null && lead.getStatus() == 3) {
            throw new BusinessException("该线索已转化");
        }
        if (lead.getStatus() != null && lead.getStatus() == 4) {
            throw new BusinessException("无效线索不能直接转为客户");
        }

        // 创建客户
        CrmCustomer customer = new CrmCustomer();
        customer.setName(lead.getCompany() != null ? lead.getCompany() : lead.getName());
        customer.setSource("线索转化");
        customer.setLevel("C");
        customer.setTaxpayerType(1);
        customer.setStatus(0);
        customer.setOwnerId(lead.getOwnerId());
        customer.setDeptId(lead.getDeptId());
        customer.setCampaignId(lead.getCampaignId()); // 营销活动归因从线索带到客户(成交ROI用)
        customer.setCreditCode(lead.getCreditCode());
        // 行业是工商属性，不能从“来源说明”直接带入。新数据优先从备注标记解析。
        customer.setIndustry(industryFromRemark(lead.getRemark()));
        customer.setScale(lead.getEnterpriseScale());
        customer.setAddress(StringUtils.hasText(lead.getRegisterAddress()) ? lead.getRegisterAddress() : lead.getLatestAddress());
        // 转客户时带工商信息(统一社会信用代码/行业/规模/地址),供客户税务档案按信用代码勾稽
        if (StringUtils.hasText(customer.getName())) {
            try {
                CompanyInfo info = companyInfoService.detail(customer.getName());
                if (info != null) {
                    if (!StringUtils.hasText(customer.getCreditCode())) {
                        customer.setCreditCode(info.getCreditCode());
                    }
                    if (!StringUtils.hasText(customer.getIndustry())) {
                        customer.setIndustry(info.getIndustry());
                    }
                    if (!StringUtils.hasText(customer.getScale())) {
                        customer.setScale(info.getEmployeeScale());
                    }
                    if (!StringUtils.hasText(customer.getAddress())) {
                        customer.setAddress(info.getAddress());
                    }
                }
            } catch (Exception ignore) {
                // 工商带出失败不阻断转化
            }
        }
        // 兼容历史数据：只有旧记录没有来源平台和批次归因时，才把 sourceDetail 当行业兜底。
        if (!StringUtils.hasText(customer.getIndustry())
                && !StringUtils.hasText(lead.getSourcePlatform())
                && !StringUtils.hasText(lead.getChannel())
                && StringUtils.hasText(lead.getSourceDetail())) {
            customer.setIndustry(limit(lead.getSourceDetail(), 64));
        }
        customerMapper.insert(customer);

        // 创建联系人
        CrmContact contact = new CrmContact();
        contact.setCustomerId(customer.getId());
        contact.setName(StringUtils.hasText(lead.getLegalPerson()) ? lead.getLegalPerson() : lead.getName());
        contact.setPhone(StringUtils.hasText(lead.getPhone()) ? lead.getPhone() : lead.getCompanyPhone());
        contact.setEmail(lead.getEmail());
        contact.setIsPrimary(1);
        contactMapper.insert(contact);

        // 更新线索状态为已转化
        LambdaUpdateWrapper<CrmLead> converted = new LambdaUpdateWrapper<>();
        converted.eq(CrmLead::getId, id)
                .and(w -> w.in(CrmLead::getStatus, 1, 2).or().isNull(CrmLead::getStatus))
                .set(CrmLead::getStatus, 3)
                .set(CrmLead::getFollowStatus, "移交结束交付")
                .set(CrmLead::getConvertedCustomerId, customer.getId())
                .set(CrmLead::getNextActionTime, null)
                .set(CrmLead::getNextActionType, null)
                .set(CrmLead::getNextFollowTime, null);
        int updated = leadMapper.update(null, converted);
        if (updated != 1) {
            throw new BusinessException("线索状态已变化,请刷新后重试");
        }
        stageRecorder.recordTransition(lead, "移交结束交付", 3,
                lead.getOwnerId(), lead.getDeptId(), "CONVERTED", "CUSTOMER",
                customer.getId(), "convert:" + id + ":" + customer.getId());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void assignLead(Long id, Long ownerId) {
        requireManager("分配线索");
        assertTargetVisible(ownerId);
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        assertManagerCanOperateLead(lead);
        assertHoldingCapacity(ownerId, 1);
        if (lead.getStatus() != null && (lead.getStatus() == 3 || lead.getStatus() == 4)) {
            throw new BusinessException("已结束的线索不能重新分配");
        }
        CrmLead before = stageSnapshot(lead);
        lead.setOwnerId(ownerId);
        lead.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
        lead.setOwnership("private");
        lead.setClaimTime(LocalDateTime.now());
        lead.setProtectionExpireDate(LocalDate.now().plusDays(ruleService.current().getProtectionDays()));
        if (lead.getStatus() == null || lead.getStatus() == 1) {
            lead.setStatus(2);
        }
        leadMapper.updateById(lead);
        stageRecorder.recordTransition(before,
                lead.getFollowStatus(), lead.getStatus(), lead.getOwnerId(), lead.getDeptId(),
                "STAGE_CHANGED", "ASSIGN", ownerId, "assign:" + id + ":" + lead.getClaimTime());
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void updateLead(CrmLead patch) {
        if (patch == null || patch.getId() == null) {
            throw new BusinessException("缺少线索ID");
        }
        CrmLead existing = leadMapper.selectById(patch.getId());
        if (existing == null) {
            throw new BusinessException("线索不存在");
        }
        boolean manager = dataScopeHelper.isManagerOrAdmin();
        if ("pool".equalsIgnoreCase(existing.getOwnership())) {
            if (!manager) {
                throw new BusinessException("公海线索请先领取后再编辑");
            }
        } else if (!dataScopeHelper.canAccess(existing.getOwnerId(), existing.getDeptId())) {
            throw new BusinessException("无权编辑该线索");
        }

        patch.setConsultBusiness(governedFieldValueValidator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS, "咨询业务",
                existing.getConsultBusiness(), patch.getConsultBusiness(), false));
        patch.setDealBusiness(governedFieldValueValidator.validateChangedValue(
                GovernedFieldValueValidator.CRM_CONSULT_BUSINESS, "实际成交业务",
                existing.getDealBusiness(), patch.getDealBusiness(), true));

        String targetLevel = normalizeCustomerLevel(patch.getCustomerLevel());
        if (targetLevel != null && !CUSTOMER_LEVELS.contains(targetLevel)) {
            throw new BusinessException("客户意向等级仅支持A、B、C、D、E");
        }
        boolean moveToHistory = targetLevel != null && HISTORY_LEVELS.contains(targetLevel)
                && !Integer.valueOf(3).equals(existing.getStatus())
                && !Integer.valueOf(4).equals(existing.getStatus());
        patch.setCustomerLevel(targetLevel);
        if (targetLevel != null) {
            patch.setIntentLevel(targetLevel);
        }

        // 资料编辑不允许顺带篡改归属、转化和回收；D/E意向等级是唯一允许驱动生命周期的资料字段。
        patch.setOwnerId(existing.getOwnerId());
        patch.setDeptId(existing.getDeptId());
        patch.setOwnership(existing.getOwnership());
        patch.setPoolId(existing.getPoolId());
        patch.setStatus(moveToHistory ? 4 : existing.getStatus());
        patch.setInvalidReason(moveToHistory ? historyReason(targetLevel) : existing.getInvalidReason());
        patch.setValidity(moveToHistory ? "无效" : patch.getValidity());
        patch.setConvertedCustomerId(existing.getConvertedCustomerId());
        patch.setClaimTime(existing.getClaimTime());
        patch.setLastFollowTime(existing.getLastFollowTime());
        patch.setNextFollowTime(moveToHistory ? null : existing.getNextFollowTime());
        patch.setNextActionTime(moveToHistory ? null : existing.getNextActionTime());
        patch.setNextActionType(moveToHistory ? null : existing.getNextActionType());
        patch.setLastFollowContent(existing.getLastFollowContent());
        patch.setFollowCount(existing.getFollowCount());
        patch.setProtectionExpireDate(existing.getProtectionExpireDate());
        patch.setRecycleCount(existing.getRecycleCount());
        patch.setLastRecycleTime(existing.getLastRecycleTime());
        if (StringUtils.hasText(patch.getFollowStatus())
                && !SALES_STAGES.contains(patch.getFollowStatus().trim())) {
            throw new BusinessException("销售阶段不正确");
        }
        if ("线索接收".equals(patch.getFollowStatus())
                && existing.getReceiveTime() == null && patch.getReceiveTime() == null) {
            patch.setReceiveTime(LocalDateTime.now());
        }
        leadMapper.updateById(patch);
        if (moveToHistory) {
            leadMapper.update(null, new LambdaUpdateWrapper<CrmLead>()
                    .eq(CrmLead::getId, patch.getId())
                    .set(CrmLead::getNextFollowTime, null)
                    .set(CrmLead::getNextActionTime, null)
                    .set(CrmLead::getNextActionType, null));
        }
        String targetFollowStatus = patch.getFollowStatus() == null
                ? existing.getFollowStatus() : patch.getFollowStatus();
        stageRecorder.recordTransition(existing, targetFollowStatus, moveToHistory ? 4 : existing.getStatus(),
                existing.getOwnerId(), existing.getDeptId(), "STAGE_CHANGED", "LEAD_EDIT",
                patch.getId(), null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void removeLead(Long id) {
        requireManager("永久删除线索");
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            return;
        }
        assertManagerCanOperateLead(lead);
        leadMapper.deleteById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void markInvalid(Long id, String reason) {
        if (!StringUtils.hasText(reason)) {
            throw new BusinessException("请填写无效原因");
        }
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if ("pool".equalsIgnoreCase(lead.getOwnership())) {
            requireManager("标记公海线索无效");
        } else if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new BusinessException("无权操作该线索");
        }
        String cleanReason = limit(reason, 255);
        String prev = lead.getRemark() == null ? "" : lead.getRemark();
        String stamp = "【标记无效】" + cleanReason;
        LambdaUpdateWrapper<CrmLead> update = new LambdaUpdateWrapper<>();
        update.eq(CrmLead::getId, id)
                .set(CrmLead::getStatus, 4)
                .set(CrmLead::getValidity, "无效")
                .set(CrmLead::getInvalidReason, cleanReason)
                .set(CrmLead::getRemark, prev.isEmpty() ? stamp : prev + "\n" + stamp)
                .set(CrmLead::getNextFollowTime, null)
                .set(CrmLead::getNextActionTime, null)
                .set(CrmLead::getNextActionType, null);
        int updated = leadMapper.update(null, update);
        if (updated != 1) {
            throw new BusinessException("线索状态已变化,请刷新后重试");
        }
        stageRecorder.recordTransition(lead, lead.getFollowStatus(), 4,
                lead.getOwnerId(), lead.getDeptId(), "INVALIDATED", "LEAD",
                id, "invalid:" + id);
    }

    @Override
    public IPage<CrmLead> selectPoolPage(int pageNum, int pageSize, String name, Long poolId,
                                         Integer source, Integer status, String customerLevel) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "pool")
               .eq(poolId != null, CrmLead::getPoolId, poolId)
               .eq(source != null, CrmLead::getSource, source)
               .eq(StringUtils.hasText(customerLevel), CrmLead::getCustomerLevel, customerLevel);
        if (status != null) {
            wrapper.eq(CrmLead::getStatus, status);
        } else {
            wrapper.in(CrmLead::getStatus, 1, 2);
        }
        applyKeyword(wrapper, name);
        wrapper.orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public IPage<CrmLead> selectMyPage(int pageNum, int pageSize, String name, Integer source,
                                       Integer status, String followStatus, String intentLevel, String scope) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "private")
               .eq(source != null, CrmLead::getSource, source);
        applyFollowStatusFilter(wrapper, followStatus);
        applyIntentLevelFilter(wrapper, intentLevel);
        if (status != null) {
            wrapper.eq(CrmLead::getStatus, status);
        } else {
            wrapper.in(CrmLead::getStatus, 1, 2);
        }
        applyRequestedScope(wrapper, scope);
        applyKeyword(wrapper, name);
        wrapper.orderByDesc(CrmLead::getLastFollowTime)
               .orderByDesc(CrmLead::getCreateTime);
        IPage<CrmLead> page = leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        fillOwnerNames(page.getRecords());
        return page;
    }

    /** 批量给线索填充负责人姓名(全公司/本部门视角下,表格要看出每条是谁的) */
    private void fillOwnerNames(java.util.List<CrmLead> records) {
        if (records == null || records.isEmpty()) {
            return;
        }
        java.util.Set<Long> ids = records.stream()
                .map(CrmLead::getOwnerId).filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
        java.util.Map<Long, String> names = dataScopeHelper.resolveUserNames(ids);
        records.forEach(r -> r.setOwnerName(names.get(r.getOwnerId())));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void claim(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("未登录,无法领取");
        }
        var rules = ruleService.current();
        if (ids.size() > rules.getSingleClaimLimit()) {
            throw new BusinessException("单次最多领取 " + rules.getSingleClaimLimit() + " 条");
        }
        // 每日领取上限校验
        long todayCount = currentDailyClaim(userId);
        if (exceedsDailyClaimLimit(todayCount, ids.size(), rules.getDailyClaimLimit())) {
            throw new BusinessException("超出每日领取上限(" + rules.getDailyClaimLimit() + "),今日已领取 " + todayCount + " 条");
        }
        // 持有上限校验:当前私海持有 + 本次领取不得超过角色上限
        Map<String, Object> holding = holdingService.currentHolding(userId);
        long currentHolding = ((Number) holding.get("current")).longValue();
        int maxHolding = ((Number) holding.get("max")).intValue();
        if (currentHolding + ids.size() > maxHolding) {
            throw new BusinessException("超出持有上限(" + maxHolding + "),当前已持有 " + currentHolding + " 条,请先跟进或释放部分客资");
        }

        Map<Long, CrmLead> beforeById = leadMapper.selectBatchIds(ids).stream()
                .collect(java.util.stream.Collectors.toMap(CrmLead::getId,
                        java.util.function.Function.identity(), (left, right) -> left));
        Long targetDeptId = dataScopeHelper.deptIdOfUser(userId);
        LocalDateTime now = LocalDateTime.now();
        for (Long id : ids) {
            CrmLead before = beforeById.get(id);
            // 冷却期:原跟进人释放后 15 天内不可再领
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(COOLDOWN_KEY + userId + ":" + id))) {
                throw new BusinessException("线索「" + (before != null ? before.getName() : id) + "」处于冷却期,暂不可再次领取");
            }
            // 原子领取:仅当线索仍在公海时更新成功(DB 行锁保证并发下只有一人成功,
            // 避免"读-判断-写"在事务提交前被其他事务读到旧值导致的双重领取)
            boolean claimed = lambdaUpdate()
                    .eq(CrmLead::getId, id)
                    .eq(CrmLead::getOwnership, "pool")
                    .in(CrmLead::getStatus, 1, 2)
                    .set(CrmLead::getOwnerId, userId)
                    .set(CrmLead::getDeptId, targetDeptId)
                    .set(CrmLead::getOwnership, "private")
                    .set(CrmLead::getClaimTime, now)
                    .set(CrmLead::getProtectionExpireDate, LocalDate.now().plusDays(rules.getProtectionDays()))
                    .set(CrmLead::getStatus, 2)
                    .update();
            if (!claimed) {
                CrmLead l = leadMapper.selectById(id);
                throw new BusinessException("线索「" + (l != null ? l.getName() : id) + "」已被领取或不存在");
            }
            if (before != null) {
                stageRecorder.recordTransition(before, before.getFollowStatus(), 2,
                        userId, targetDeptId, "STAGE_CHANGED", "CLAIM", id,
                        "claim:" + id + ":" + userId + ":" + now);
            }
            incrDailyClaim(userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reactivateHistory(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        List<Long> distinctIds = ids.stream().filter(java.util.Objects::nonNull).distinct().toList();
        if (distinctIds.isEmpty()) {
            return;
        }
        if (distinctIds.size() > 100) {
            throw new BusinessException("单次最多重新激活 100 条历史客资");
        }
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("未登录，无法重新激活历史客资");
        }
        Map<Long, CrmLead> beforeById = leadMapper.selectBatchIds(distinctIds).stream()
                .collect(java.util.stream.Collectors.toMap(CrmLead::getId,
                        java.util.function.Function.identity(), (left, right) -> left));
        if (beforeById.size() != distinctIds.size()) {
            throw new BusinessException("部分历史客资不存在或已被删除");
        }
        for (Long id : distinctIds) {
            CrmLead lead = beforeById.get(id);
            if (!"private".equalsIgnoreCase(lead.getOwnership())) {
                throw new BusinessException("线索「" + lead.getName() + "」已不在历史回收池，请刷新后重试");
            }
            boolean ownHistory = java.util.Objects.equals(lead.getOwnerId(), userId);
            boolean managerVisibleHistory = dataScopeHelper.isManagerOrAdmin()
                    && dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId());
            if (!ownHistory && !managerVisibleHistory) {
                throw new BusinessException("只能领取本人或管理范围内的历史客资");
            }
            if (!java.util.Objects.equals(lead.getStatus(), 4)) {
                throw new BusinessException("线索「" + lead.getName() + "」已不是历史客资，请刷新后重试");
            }
        }
        assertHoldingCapacity(userId, distinctIds.size());

        var rules = ruleService.current();
        Long deptId = dataScopeHelper.deptIdOfUser(userId);
        LocalDateTime now = LocalDateTime.now();
        LocalDate protectionDate = LocalDate.now().plusDays(rules.getProtectionDays());
        for (Long id : distinctIds) {
            CrmLead before = beforeById.get(id);
            LambdaUpdateWrapper<CrmLead> update = new LambdaUpdateWrapper<>();
            update.eq(CrmLead::getId, id)
                    .eq(CrmLead::getOwnerId, before.getOwnerId())
                    .eq(CrmLead::getOwnership, "private")
                    .eq(CrmLead::getStatus, 4)
                    .set(CrmLead::getOwnerId, userId)
                    .set(CrmLead::getDeptId, deptId)
                    .set(CrmLead::getStatus, 2)
                    .set(CrmLead::getFollowStatus, "需求沟通")
                    .set(CrmLead::getValidity, "待定")
                    .set(CrmLead::getInvalidReason, null)
                    .set(CrmLead::getClaimTime, now)
                    .set(CrmLead::getProtectionExpireDate, protectionDate);
            if (leadMapper.update(null, update) != 1) {
                throw new BusinessException("线索「" + before.getName() + "」状态已变化，请刷新后重试");
            }
            stageRecorder.recordTransition(before, "需求沟通", 2,
                    userId, deptId, "STAGE_CHANGED", "REACTIVATE", id,
                    "reactivate:" + id + ":" + userId + ":" + now);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnToPool(List<Long> ids, String reason) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        long cooldownDays = ruleService.current().getReleaseCooldownDays();
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
                throw new BusinessException("无权释放线索「" + (lead.getCompany() != null ? lead.getCompany() : id) + "」");
            }
            if (lead.getStatus() != null && (lead.getStatus() == 3 || lead.getStatus() == 4)) {
                throw new BusinessException("已结束的线索不能退回公海");
            }
            // 退回前,给原跟进人设置 15 天冷却,期内不可再领同一线索
            if (lead.getOwnerId() != null) {
                if (cooldownDays > 0) {
                    stringRedisTemplate.opsForValue().set(
                            COOLDOWN_KEY + lead.getOwnerId() + ":" + id, "1", cooldownDays, TimeUnit.DAYS);
                }
            }
            // 用 lambdaUpdate 显式置 null:updateById 默认跳过 null 字段,直接 setOwnerId(null) 不会清空 owner_id
            lambdaUpdate()
                    .eq(CrmLead::getId, id)
                    .set(CrmLead::getOwnerId, null)
                    .set(CrmLead::getDeptId, null)
                    .set(CrmLead::getOwnership, "pool")
                    .set(CrmLead::getProtectionExpireDate, null)
                    // 退回公海即恢复"未分配"状态(status=1),与自动回收一致,避免公海线索仍显示"跟进中"
                    .set(lead.getStatus() != null && lead.getStatus() != 3, CrmLead::getStatus, 1)
                    .set(StringUtils.hasText(reason), CrmLead::getLastFollowContent, "退回公海:" + reason)
                    .update();
            stageRecorder.recordTransition(lead, lead.getFollowStatus(), 1,
                    null, null, "STAGE_CHANGED", "RETURN_POOL", id, null);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int autoRecycle() {
        Long currentTenant = SecurityUtils.getCurrentTenantId();
        if (currentTenant != null) {
            return autoRecycleTenant(currentTenant);
        }
        int total = 0;
        for (Long tenantId : ruleService.tenantIdsWithLeads()) {
            total += autoRecycleTenant(tenantId);
        }
        return total;
    }

    private int autoRecycleTenant(Long tenantId) {
        var rules = ruleService.current(tenantId);
        LocalDate today = LocalDate.now();
        LocalDateTime staleBefore = LocalDateTime.now().minusDays(rules.getRecycleNoFollowDays());
        // 候选:持有(private)且有负责人、未转化(status!=3)、保护期已过(或未设)、久未跟进。
        // COALESCE(最后跟进,领取时间,epoch):从未跟进/无领取时间一律视为极久未动→可回收。
        LambdaQueryWrapper<CrmLead> q = new LambdaQueryWrapper<>();
        q.eq(CrmLead::getTenantId, tenantId)
         .eq(CrmLead::getOwnership, "private")
         .isNotNull(CrmLead::getOwnerId)
         .in(CrmLead::getStatus, 1, 2)
         .and(w -> w.lt(CrmLead::getProtectionExpireDate, today)
                    .or().isNull(CrmLead::getProtectionExpireDate))
         .apply("COALESCE(last_follow_time, claim_time, '1970-01-01 00:00:00') < {0}", staleBefore);
        List<CrmLead> candidates = leadMapper.selectList(q);
        if (candidates.isEmpty()) {
            return 0;
        }
        LocalDateTime now = LocalDateTime.now();
        for (CrmLead lead : candidates) {
            // 给原跟进人加 15 天冷却,促使线索重新分配给他人而非立即被同一人再领
            if (lead.getOwnerId() != null) {
                if (rules.getReleaseCooldownDays() > 0) {
                    stringRedisTemplate.opsForValue().set(
                            COOLDOWN_KEY + lead.getOwnerId() + ":" + lead.getId(), "1",
                            rules.getReleaseCooldownDays(), TimeUnit.DAYS);
                }
            }
            // 显式置 null + 原子累加回收次数(updateById 会跳过 null,故用 lambdaUpdate/setSql)
            lambdaUpdate()
                    .eq(CrmLead::getId, lead.getId())
                    .set(CrmLead::getOwnerId, null)
                    .set(CrmLead::getDeptId, null)
                    .set(CrmLead::getOwnership, "pool")
                    .set(CrmLead::getProtectionExpireDate, null)
                    .set(CrmLead::getStatus, 1)
                    .set(CrmLead::getLastRecycleTime, now)
                    .setSql("recycle_count = IFNULL(recycle_count, 0) + 1")
                    .update();
            stageRecorder.recordTransition(lead, lead.getFollowStatus(), 1,
                    null, null, "STAGE_CHANGED", "AUTO_RECYCLE", lead.getId(),
                    "recycle:" + lead.getId() + ":" + now);
        }
        log.info("自动回收线索 tenantId={}, count={}, noFollowDays={}", tenantId, candidates.size(),
                rules.getRecycleNoFollowDays());
        return candidates.size();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void distribute(List<Long> ids, Long ownerId) {
        if (ids == null || ids.isEmpty() || ownerId == null) {
            return;
        }
        requireManager("分配线索");
        assertTargetVisible(ownerId);
        assertHoldingCapacity(ownerId, ids.size());
        int protectionDays = ruleService.current().getProtectionDays();
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            assertManagerCanOperateLead(lead);
            if (lead.getStatus() != null && (lead.getStatus() == 3 || lead.getStatus() == 4)) {
                throw new BusinessException("已结束的线索不能重新分配");
            }
            CrmLead before = stageSnapshot(lead);
            lead.setOwnerId(ownerId);
            lead.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
            lead.setOwnership("private");
            lead.setClaimTime(LocalDateTime.now());
            lead.setProtectionExpireDate(LocalDate.now().plusDays(protectionDays));
            if (lead.getStatus() == null || lead.getStatus() == 1) {
                lead.setStatus(2);
            }
            leadMapper.updateById(lead);
            stageRecorder.recordTransition(before, lead.getFollowStatus(), lead.getStatus(),
                    lead.getOwnerId(), lead.getDeptId(), "STAGE_CHANGED", "DISTRIBUTE",
                    ownerId, "distribute:" + id + ":" + lead.getClaimTime());
        }
    }

    @Override
    public IPage<CrmLead> selectTodoFollow(int pageNum, int pageSize, String name, Integer source,
                                           String followStatus, String intentLevel, String scope) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        applyRequestedScope(wrapper, scope);
        wrapper.eq(CrmLead::getOwnership, "private")
               .in(CrmLead::getStatus, 1, 2)
               .eq(source != null, CrmLead::getSource, source)
               // 新数据优先用精确下一步时间;老数据继续兼容 next_follow_time。
               .and(q -> q.le(CrmLead::getNextActionTime, LocalDateTime.now())
                       .or(old -> old.isNull(CrmLead::getNextActionTime)
                               .and(x -> x.le(CrmLead::getNextFollowTime, LocalDate.now())
                                       .or().isNull(CrmLead::getNextFollowTime))))
               .orderByAsc(CrmLead::getNextFollowTime)
               .orderByAsc(CrmLead::getNextActionTime)
               .orderByAsc(CrmLead::getProtectionExpireDate);
        applyFollowStatusFilter(wrapper, followStatus);
        applyIntentLevelFilter(wrapper, intentLevel);
        applyKeyword(wrapper, name);
        IPage<CrmLead> page = leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        fillOwnerNames(page.getRecords());
        return page;
    }

    @Override
    public IPage<CrmLead> selectRecycleWarning(int pageNum, int pageSize, String name, Integer source,
                                               String followStatus, String intentLevel, String scope) {
        int warningDays = ruleService.current().getRecycleWarningDays();
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        applyRequestedScope(wrapper, scope);
        wrapper.eq(CrmLead::getOwnership, "private")
               .in(CrmLead::getStatus, 1, 2)
               .eq(source != null, CrmLead::getSource, source)
               // 保护期将在 N 天内到期(或已过期但尚未被回收)→ 即将被自动回收,提示尽快跟进
               .isNotNull(CrmLead::getProtectionExpireDate)
               .le(CrmLead::getProtectionExpireDate, LocalDate.now().plusDays(warningDays))
               .orderByAsc(CrmLead::getProtectionExpireDate);
        applyFollowStatusFilter(wrapper, followStatus);
        applyIntentLevelFilter(wrapper, intentLevel);
        applyKeyword(wrapper, name);
        IPage<CrmLead> page = leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
        fillOwnerNames(page.getRecords());
        return page;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addFollow(Long leadId, CrmLeadFollowDTO dto) {
        addFollow(leadId, dto, false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addFollow(Long leadId, CrmLeadFollowDTO dto, boolean allowWithoutNextAction) {
        if (dto == null || !StringUtils.hasText(dto.getContent())) {
            throw new BusinessException("请填写本次沟通内容");
        }
        if (dto.getType() == null || dto.getType() < 1 || dto.getType() > 5) {
            throw new BusinessException("请选择正确的跟进方式");
        }
        String customerLevel = normalizeCustomerLevel(dto.getCustomerLevel());
        if (customerLevel != null && !CUSTOMER_LEVELS.contains(customerLevel)) {
            throw new BusinessException("客户意向等级仅支持A、B、C、D、E");
        }
        boolean moveToHistory = customerLevel != null && HISTORY_LEVELS.contains(customerLevel);
        if (moveToHistory) {
            dto.setNextTime(null);
            dto.setNextContent(null);
            dto.setNextActionType(null);
        }
        if (dto.getNextTime() != null && dto.getNextTime().isBefore(LocalDateTime.now().minusMinutes(1))) {
            throw new BusinessException("下一步跟进时间不能早于当前时间");
        }
        if (!allowWithoutNextAction && !moveToHistory
                && (dto.getNextTime() == null || !StringUtils.hasText(dto.getNextActionType()))) {
            throw new BusinessException("请安排下一步动作和具体时间");
        }
        if ((dto.getNextTime() == null) != !StringUtils.hasText(dto.getNextActionType())) {
            throw new BusinessException("下一步动作和时间必须同时填写");
        }
        if (StringUtils.hasText(dto.getFollowStatus()) && !SALES_STAGES.contains(dto.getFollowStatus().trim())) {
            throw new BusinessException("销售阶段不正确");
        }
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new AccessDeniedException("无权跟进该线索或线索不存在");
        }
        if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new AccessDeniedException("无权跟进该线索(不在你的数据范围内)");
        }
        if (lead.getStatus() != null && (lead.getStatus() == 3 || lead.getStatus() == 4)) {
            throw new BusinessException(lead.getStatus() == 3 ? "线索已转为客户,请在客户档案继续跟进" : "无效线索不能继续跟进");
        }
        // 1) 落库跟进记录
        CrmFollow follow = new CrmFollow();
        follow.setLeadId(leadId);
        follow.setType(dto.getType());
        String followContent = intentChangeEvidence(currentIntentLevel(lead), customerLevel, dto.getContent());
        follow.setContent(limit(followContent, 500));
        follow.setNextTime(dto.getNextTime());
        follow.setNextContent(limit(dto.getNextContent(), 500));
        followMapper.insert(follow);
        // 2) 回写线索:lambdaUpdate + setSql 原子自增 followCount(避免并发跟进丢计数);
        //    顺延保护期=跟进即续命(回收引擎按 lastFollowTime/保护期判超时,避免误回收活跃客资)
        boolean updated = lambdaUpdate()
                .eq(CrmLead::getId, leadId)
                .set(CrmLead::getLastFollowTime, LocalDateTime.now())
                .set(CrmLead::getLastFollowContent, limit(followContent, 500))
                .set(moveToHistory, CrmLead::getStatus, 4)
                .set(!moveToHistory && (lead.getStatus() == null || lead.getStatus() == 1),
                        CrmLead::getStatus, 2)
                .set(StringUtils.hasText(dto.getFollowStatus()), CrmLead::getFollowStatus,
                        StringUtils.hasText(dto.getFollowStatus()) ? dto.getFollowStatus().trim() : null)
                .set(customerLevel != null, CrmLead::getCustomerLevel, customerLevel)
                .set(customerLevel != null, CrmLead::getIntentLevel, customerLevel)
                .set(moveToHistory, CrmLead::getValidity, "无效")
                .set(moveToHistory, CrmLead::getInvalidReason, historyReason(customerLevel))
                .set(dto.getNextTime() != null, CrmLead::getNextFollowTime,
                        dto.getNextTime() != null ? dto.getNextTime().toLocalDate() : null)
                .set(dto.getNextTime() != null, CrmLead::getNextActionTime, dto.getNextTime())
                .set(StringUtils.hasText(dto.getNextActionType()), CrmLead::getNextActionType,
                        limit(dto.getNextActionType(), 32))
                .set(moveToHistory, CrmLead::getNextFollowTime, null)
                .set(moveToHistory, CrmLead::getNextActionTime, null)
                .set(moveToHistory, CrmLead::getNextActionType, null)
                .set("线索接收".equals(dto.getFollowStatus()) && lead.getReceiveTime() == null,
                        CrmLead::getReceiveTime, LocalDateTime.now())
                .set(CrmLead::getProtectionExpireDate,
                        LocalDate.now().plusDays(ruleService.current().getProtectionDays()))
                .setSql("follow_count = IFNULL(follow_count, 0) + 1")
                .update();
        if (!updated) {
            throw new BusinessException("线索状态已变化,请刷新后重试");
        }
        Integer targetStatus = moveToHistory
                ? 4 : (lead.getStatus() == null || lead.getStatus() == 1 ? 2 : lead.getStatus());
        String targetFollowStatus = StringUtils.hasText(dto.getFollowStatus())
                ? dto.getFollowStatus().trim() : lead.getFollowStatus();
        stageRecorder.recordTransition(lead, targetFollowStatus, targetStatus,
                lead.getOwnerId(), lead.getDeptId(), "STAGE_CHANGED", "FOLLOW",
                follow.getId(), "follow:" + follow.getId());
    }

    @Override
    public Map<String, Object> workbenchSummary(String scope) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("myLeadTotal", countWorkbench(scope, w -> { }));
        result.put("followingCount", countWorkbench(scope, w -> w.eq(CrmLead::getStatus, 2)));
        result.put("todoTotal", countWorkbench(scope, w -> w.in(CrmLead::getStatus, 1, 2)
                .and(q -> q.le(CrmLead::getNextActionTime, LocalDateTime.now())
                        .or(old -> old.isNull(CrmLead::getNextActionTime)
                                .and(x -> x.le(CrmLead::getNextFollowTime, LocalDate.now())
                                        .or().isNull(CrmLead::getNextFollowTime))))));
        result.put("warningTotal", countWorkbench(scope, w -> w.in(CrmLead::getStatus, 1, 2)
                .isNotNull(CrmLead::getProtectionExpireDate)
                .le(CrmLead::getProtectionExpireDate,
                        LocalDate.now().plusDays(ruleService.current().getRecycleWarningDays()))));

        Map<String, Long> levels = new java.util.LinkedHashMap<>();
        for (String level : List.of("A", "B", "C", "D", "E")) {
            levels.put(level, countWorkbench(scope, w -> w.eq(CrmLead::getCustomerLevel, level)));
        }
        levels.put("none", countWorkbench(scope, w -> w.and(x -> x.isNull(CrmLead::getCustomerLevel)
                .or().eq(CrmLead::getCustomerLevel, ""))));
        result.put("levelCounts", levels);
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int importFromCompanyLibrary(String keyword, int limit) {
        int requested = limit <= 0 ? 20 : limit;
        int singleLimit = ruleService.current().getSingleImportLimit();
        if (requested > singleLimit) {
            throw new BusinessException("单次最多导入 " + singleLimit + " 条");
        }
        ruleService.assertDailyCapacity(CrmPoolRuleService.BATCH_IMPORT, requested);
        java.util.List<CompanyInfo> list = companyInfoService.suggest(keyword, limit <= 0 ? 20 : limit);
        if (list == null || list.isEmpty()) {
            return 0;
        }
        int created = 0;
        for (CompanyInfo info : list) {
            if (info == null || !StringUtils.hasText(info.getName())) {
                continue;
            }
            String cname = info.getName().trim();
            // 去重:同名公司(标准化后)已有线索则跳过(尽力去重;并发/已删记录的彻底去重需DB唯一约束,见卡片)
            Long exist = leadMapper.selectCount(new LambdaQueryWrapper<CrmLead>()
                    .eq(CrmLead::getCompany, cname));
            if (exist != null && exist > 0) {
                continue;
            }
            CrmLead lead = new CrmLead();
            String legalPerson = info.getLegalPerson();
            lead.setName(StringUtils.hasText(legalPerson) ? legalPerson : cname);
            lead.setCompany(cname);
            lead.setLegalPerson(limit(legalPerson, 100));
            lead.setRegisterStatus(limit(info.getBusinessStatus(), 50));
            lead.setEnterpriseType(limit(info.getCompanyType(), 100));
            lead.setCreditCode(limit(info.getCreditCode(), 64));
            lead.setRegisterAddress(limit(info.getAddress(), 500));
            lead.setOwnership("pool"); // 进公海待领取/分配
            lead.setStatus(1);
            lead.setRemark("工商库导入");
            appendIndustryToRemark(lead, info.getIndustry());
            // 保存前再做一次同名校验:缩小"先查后插"并发窗口,避免同一公司被并发导入建重复线索
            // (未加DB唯一约束,存量可能已有重复;此处为尽力幂等,彻底去重需DB约束,见卡片)
            Long recheck = leadMapper.selectCount(new LambdaQueryWrapper<CrmLead>()
                    .eq(CrmLead::getCompany, cname));
            if (recheck != null && recheck > 0) {
                continue;
            }
            save(lead); // 走 save():自动补工商信息;无负责人则不写dept,保持公海
            created++;
        }
        // 关键词可能是公司名称或名单条件，服务日志只保留数量，不记录原文。
        log.info("工商库导入线索完成,新建 {} 条", created);
        ruleService.consumeDaily(CrmPoolRuleService.BATCH_IMPORT, created);
        return created;
    }

    private String limit(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return "";
        }
        String trimmed = value.trim();
        if (maxLength <= 0 || trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength);
    }

    private String historyReason(String customerLevel) {
        return "D".equals(customerLevel)
                ? "D类-无意向,转入历史客资"
                : "E类-无效客户,暂停拨打";
    }

    private String normalizeCustomerLevel(String customerLevel) {
        if (!StringUtils.hasText(customerLevel)) {
            return null;
        }
        return customerLevel.trim().toUpperCase();
    }

    private String currentIntentLevel(CrmLead lead) {
        if (lead == null) {
            return null;
        }
        return StringUtils.hasText(lead.getIntentLevel())
                ? lead.getIntentLevel() : lead.getCustomerLevel();
    }

    private String intentChangeEvidence(String previousLevel, String nextLevel, String content) {
        if (!StringUtils.hasText(nextLevel)
                || Objects.equals(normalizeCustomerLevel(previousLevel), nextLevel)) {
            return content.trim();
        }
        String before = StringUtils.hasText(previousLevel)
                ? previousLevel.trim().toUpperCase() : "未分级";
        return "【意向等级：" + before + "→" + nextLevel + "】" + content.trim();
    }

    /** 工商行业作为客户属性保存在备注的结构化行，不占用获客来源说明。 */
    private void appendIndustryToRemark(CrmLead lead, String industry) {
        if (lead == null || !StringUtils.hasText(industry)) {
            return;
        }
        String value = limit(industry, 100);
        String line = "行业门类: " + value;
        String remark = StringUtils.hasText(lead.getRemark()) ? lead.getRemark().trim() : "";
        if (remark.lines().anyMatch(existing -> existing.trim().equals(line))) {
            return;
        }
        lead.setRemark(remark.isEmpty() ? line : remark + "\n" + line);
    }

    /** 读取批量导入/工商补全写入备注的行业标记。 */
    private String industryFromRemark(String remark) {
        if (!StringUtils.hasText(remark)) {
            return null;
        }
        for (String line : remark.lines().toList()) {
            String trimmed = line.trim();
            if (trimmed.startsWith("行业门类:") || trimmed.startsWith("行业门类：")) {
                int colon = Math.max(trimmed.indexOf(':'), trimmed.indexOf('：'));
                String value = colon >= 0 ? trimmed.substring(colon + 1).trim() : "";
                return StringUtils.hasText(value) ? limit(value, 64) : null;
            }
        }
        return null;
    }

    @Override
    public List<CrmLead> checkDuplicate(String phone, String name) {
        boolean hasPhone = StringUtils.hasText(phone);
        boolean hasName = StringUtils.hasText(name);
        if (!hasPhone && !hasName) {
            return Collections.emptyList();
        }
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w
                .eq(hasPhone, CrmLead::getPhone, phone)
                .or(hasPhone && hasName)
                .eq(hasName, CrmLead::getName, name)
                .or(hasName)
                .eq(hasName, CrmLead::getCompany, name)
                .or(hasPhone)
                .eq(hasPhone, CrmLead::getCompanyPhone, phone));
        return leadMapper.selectList(wrapper).stream().map(this::safeDuplicateLead).toList();
    }

    private CrmLead safeDuplicateLead(CrmLead lead) {
        if (lead == null || "pool".equalsIgnoreCase(lead.getOwnership())
                || dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            if (lead != null) {
                lead.setOwnerName(dataScopeHelper.resolveUserNames(
                        java.util.Collections.singleton(lead.getOwnerId())).get(lead.getOwnerId()));
            }
            return lead;
        }
        CrmLead masked = new CrmLead();
        masked.setCompany("该客资已由其他销售跟进");
        masked.setOwnership("private");
        masked.setOwnerName("其他销售");
        return masked;
    }

    private LambdaQueryWrapper<CrmLead> applyKeyword(LambdaQueryWrapper<CrmLead> wrapper, String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return wrapper;
        }
        return wrapper.and(w -> w
                .like(CrmLead::getCompany, keyword)
                .or()
                .like(CrmLead::getName, keyword)
                .or()
                .like(CrmLead::getLegalPerson, keyword)
                .or()
                .like(CrmLead::getPhone, keyword)
                .or()
                .like(CrmLead::getCompanyPhone, keyword));
    }

    @Override
    public List<Map<String, Object>> sourceStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("source", "COUNT(*) AS cnt");
        applyScopeToQueryWrapper(qw);
        qw.groupBy("source").orderByDesc("cnt");
        return leadMapper.selectMaps(qw);
    }

    @Override
    public List<Map<String, Object>> stageStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("COALESCE(NULLIF(follow_status, ''), CASE status "
                        + "WHEN 1 THEN '线索接收' WHEN 2 THEN '需求沟通' "
                        + "WHEN 3 THEN '移交结束交付' WHEN 4 THEN '无效' ELSE '未设置' END) AS stage",
                "COUNT(*) AS cnt");
        applyScopeToQueryWrapper(qw);
        qw.groupBy("stage").orderByDesc("cnt");
        return leadMapper.selectMaps(qw);
    }

    @Override
    public Map<String, Object> conversionSummary() {
        long total = countScoped(null);
        long converted = countScoped(3);   // 3已转化
        long converting = countScoped(2);  // 2跟进中
        long newLeads = countScoped(1);    // 1新建
        long invalid = countScoped(4);     // 4无效
        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("total", total);
        m.put("newLeads", newLeads);
        m.put("converting", converting);
        m.put("converted", converted);
        m.put("invalid", invalid);
        // 转化率 = 已转化 / 总数,保留两位百分比
        m.put("conversionRate", total == 0 ? 0.0 : Math.round(converted * 10000.0 / total) / 100.0);
        return m;
    }

    @Override
    public Map<String, Object> touliuSummary() {
        LocalDate today = LocalDate.now();
        // 本月:当月1日 00:00 → 下月1日 00:00 前
        LocalDateTime monthStart = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime monthEnd = monthStart.plusMonths(1);
        // 本年:当年1月1日 00:00 → 次年1月1日 00:00 前
        LocalDateTime yearStart = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime yearEnd = yearStart.plusYears(1);
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("month", summaryBucket(monthStart, monthEnd));
        result.put("year", summaryBucket(yearStart, yearEnd));
        return result;
    }

    /**
     * 单个时间桶(本月/本年)的投流客资聚合。所有条件用 LambdaQueryWrapper 参数化(无注入)。
     * 口径:
     *   validLeads       有效客资 = validity='有效'(明确标记有效才计,老数据无 validity 不计)
     *   sealValidLeads   刻章有效 = 有效 且 consult_business='刻章业务'
     *   nonSealValidLeads 非刻章有效 = 有效 且 consult_business != '刻章业务'(含未填咨询业务)
     *   nonSealConverted 非刻章转化 = 非刻章有效 且 已成交(status=3 已转化 或 follow_status='签单收款')
     *   nonSealConvRate  非刻章转化率 = 非刻章转化 / 非刻章有效
     *   nonSealDealAmount 非刻章成交额 = 非刻章有效范围内 sum(deal_amount)
     */
    private Map<String, Object> summaryBucket(LocalDateTime start, LocalDateTime end) {
        // 有效客资
        long validLeads = countTouliu(start, end, w -> w.eq(CrmLead::getValidity, "有效"));
        // 刻章有效
        long sealValid = countTouliu(start, end,
                w -> w.eq(CrmLead::getValidity, "有效").eq(CrmLead::getConsultBusiness, "刻章业务"));
        // 非刻章有效(有效 且 咨询业务非「刻章业务」,含未填)
        long nonSealValid = countTouliu(start, end,
                w -> w.eq(CrmLead::getValidity, "有效")
                      .and(x -> x.ne(CrmLead::getConsultBusiness, "刻章业务").or().isNull(CrmLead::getConsultBusiness)));
        // 非刻章转化(非刻章有效 且 已成交:老 status=3 已转化 或 新 follow_status=签单收款)
        long nonSealConverted = countTouliu(start, end,
                w -> w.eq(CrmLead::getValidity, "有效")
                      .and(x -> x.ne(CrmLead::getConsultBusiness, "刻章业务").or().isNull(CrmLead::getConsultBusiness))
                      .and(x -> x.eq(CrmLead::getStatus, 3).or().eq(CrmLead::getFollowStatus, "签单收款")));
        // 非刻章成交额:非刻章有效范围内 sum(deal_amount)
        BigDecimal nonSealDealAmount = sumDealAmount(start, end);

        double convRate = nonSealValid == 0 ? 0.0
                : Math.round(nonSealConverted * 10000.0 / nonSealValid) / 100.0;

        Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("validLeads", validLeads);
        m.put("sealValidLeads", sealValid);
        m.put("nonSealValidLeads", nonSealValid);
        m.put("nonSealConverted", nonSealConverted);
        m.put("nonSealConvRate", convRate);
        m.put("nonSealDealAmount", nonSealDealAmount);
        return m;
    }

    /** 数据范围 + create_time 落 [start,end) + 额外条件,计数 */
    private long countTouliu(LocalDateTime start, LocalDateTime end,
                             java.util.function.Consumer<LambdaQueryWrapper<CrmLead>> extra) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        wrapper.ge(CrmLead::getCreateTime, start).lt(CrmLead::getCreateTime, end);
        extra.accept(wrapper);
        return leadMapper.selectCount(wrapper);
    }

    /** 非刻章有效范围内的成交金额合计(数据范围 + 时间窗 + 有效 + 非刻章),null 归零 */
    private BigDecimal sumDealAmount(LocalDateTime start, LocalDateTime end) {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        LambdaQueryWrapper<CrmLead> scope = new LambdaQueryWrapper<>();
        dataScopeHelper.apply(scope, CrmLead::getOwnerId, CrmLead::getDeptId);
        // 把数据范围条件并入 QueryWrapper(用 lambda 生成的片段)——两者列名一致,直接复用条件
        qw.lambda()
          .ge(CrmLead::getCreateTime, start).lt(CrmLead::getCreateTime, end)
          .eq(CrmLead::getValidity, "有效")
          .and(x -> x.ne(CrmLead::getConsultBusiness, "刻章业务").or().isNull(CrmLead::getConsultBusiness));
        // 复用 dataScopeHelper 生成的范围条件(合并到同一 wrapper)
        applyScopeToQueryWrapper(qw);
        qw.select("IFNULL(SUM(deal_amount),0) AS amt");
        Map<String, Object> row = leadMapper.selectMaps(qw).stream().findFirst().orElse(null);
        if (row == null || row.get("amt") == null) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(row.get("amt").toString());
    }

    /** 把当前用户数据范围条件注入到 QueryWrapper(与 DataScopeHelper.apply 同口径,聚合查询用) */
    private void applyScopeToQueryWrapper(com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw) {
        if (SecurityUtils.isCurrentAdmin()) {
            return;
        }
        Integer scopeVal = SecurityUtils.getCurrentDataScope();
        if (scopeVal != null && scopeVal == 1) {
            return; // 全部
        }
        Long deptId = SecurityUtils.getCurrentDeptId();
        Long userId = SecurityUtils.getCurrentUserId();
        if (deptId != null && scopeVal != null && scopeVal == 3) {
            qw.lambda().eq(CrmLead::getDeptId, deptId);
            return;
        }
        if (deptId != null && scopeVal != null && scopeVal == 4) {
            qw.lambda().in(CrmLead::getDeptId, dataScopeHelper.deptSelfAndChildren(deptId));
            return;
        }
        qw.lambda().eq(CrmLead::getOwnerId, userId);
    }

    /** 在当前用户数据范围内按状态计数(status 为 null 则计总数) */
    private long countScoped(Integer status) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        wrapper.eq(status != null, CrmLead::getStatus, status);
        return leadMapper.selectCount(wrapper);
    }

    /** 工作台范围:scope=all 才按角色放大到部门/公司,否则严格本人。 */
    private void applyRequestedScope(LambdaQueryWrapper<CrmLead> wrapper, String scope) {
        if ("all".equalsIgnoreCase(scope)) {
            dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        } else {
            wrapper.eq(CrmLead::getOwnerId, SecurityUtils.getCurrentUserId());
        }
    }

    private long countWorkbench(String scope,
                                java.util.function.Consumer<LambdaQueryWrapper<CrmLead>> extra) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        applyRequestedScope(wrapper, scope);
        wrapper.eq(CrmLead::getOwnership, "private");
        wrapper.in(CrmLead::getStatus, 1, 2);
        extra.accept(wrapper);
        return leadMapper.selectCount(wrapper);
    }

    /** 存量线索 follow_status 为空时按生命周期给出兼容阶段,不需要批量改历史数据。 */
    private void applyFollowStatusFilter(LambdaQueryWrapper<CrmLead> wrapper, String followStatus) {
        if (!StringUtils.hasText(followStatus)) {
            return;
        }
        String stage = followStatus.trim();
        if ("线索接收".equals(stage)) {
            wrapper.and(w -> w.eq(CrmLead::getFollowStatus, stage)
                    .or(old -> old.isNull(CrmLead::getFollowStatus).eq(CrmLead::getStatus, 1)));
        } else if ("需求沟通".equals(stage)) {
            wrapper.and(w -> w.eq(CrmLead::getFollowStatus, stage)
                    .or(old -> old.isNull(CrmLead::getFollowStatus).eq(CrmLead::getStatus, 2)));
        } else {
            wrapper.eq(CrmLead::getFollowStatus, stage);
        }
    }

    /** “我的客户”只按客户跟进形成的A-E意向等级筛选。 */
    private void applyIntentLevelFilter(LambdaQueryWrapper<CrmLead> wrapper, String intentLevel) {
        if (!StringUtils.hasText(intentLevel)) {
            return;
        }
        String level = intentLevel.trim().toUpperCase();
        if (!CUSTOMER_LEVELS.contains(level)) {
            throw new BusinessException("意向等级仅支持A-E");
        }
        wrapper.eq(CrmLead::getIntentLevel, level);
    }

    private CrmLead stageSnapshot(CrmLead source) {
        CrmLead snapshot = new CrmLead();
        snapshot.setId(source.getId());
        snapshot.setTenantId(source.getTenantId());
        snapshot.setStatus(source.getStatus());
        snapshot.setFollowStatus(source.getFollowStatus());
        snapshot.setOwnerId(source.getOwnerId());
        snapshot.setDeptId(source.getDeptId());
        snapshot.setCreateTime(source.getCreateTime());
        return snapshot;
    }

    private void requireManager(String action) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            throw new BusinessException("仅主管、老板或管理员可" + action);
        }
    }

    private void assertTargetVisible(Long ownerId) {
        if (ownerId == null) {
            throw new BusinessException("请选择负责人");
        }
        if (!dataScopeHelper.canAccessOwner(ownerId)) {
            throw new BusinessException("不能把线索分配给数据范围外的员工");
        }
    }

    private void assertManagerCanOperateLead(CrmLead lead) {
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (!"pool".equalsIgnoreCase(lead.getOwnership())
                && !dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new BusinessException("无权操作数据范围外的线索");
        }
    }

    /** 当前用户今日已领取数量 */
    private long currentDailyClaim(Long userId) {
        String v = stringRedisTemplate.opsForValue().get(DAILY_KEY + userId + ":" + LocalDate.now());
        return v == null ? 0L : Long.parseLong(v);
    }

    static boolean exceedsDailyClaimLimit(long claimedToday, int requestedCount) {
        return claimedToday + requestedCount > DAILY_LIMIT;
    }

    static boolean exceedsDailyClaimLimit(long claimedToday, int requestedCount, int limit) {
        return claimedToday + requestedCount > limit;
    }

    private void assertHoldingCapacity(Long ownerId, int requested) {
        Map<String, Object> holding = holdingService.currentHolding(ownerId);
        long current = ((Number) holding.get("current")).longValue();
        int max = ((Number) holding.get("max")).intValue();
        if (current + requested > max) {
            throw new BusinessException("负责人私海容量不足：上限 " + max + " 条，当前已持有 " + current + " 条");
        }
    }

    private void assertNoDuplicate(CrmLead lead) {
        String company = StringUtils.hasText(lead.getCompany()) ? lead.getCompany().trim() : null;
        String creditCode = StringUtils.hasText(lead.getCreditCode()) ? lead.getCreditCode().trim() : null;
        String phone = StringUtils.hasText(lead.getPhone()) ? lead.getPhone().trim() : null;
        if (!StringUtils.hasText(company) && !StringUtils.hasText(creditCode) && !StringUtils.hasText(phone)) {
            return;
        }
        LambdaQueryWrapper<CrmLead> leadQuery = new LambdaQueryWrapper<>();
        leadQuery.and(w -> {
            boolean next = false;
            if (StringUtils.hasText(creditCode)) {
                w.eq(CrmLead::getCreditCode, creditCode);
                next = true;
            }
            if (StringUtils.hasText(company)) {
                if (next) w.or();
                w.eq(CrmLead::getCompany, company);
                next = true;
            }
            if (StringUtils.hasText(phone)) {
                if (next) w.or();
                w.eq(CrmLead::getPhone, phone).or().eq(CrmLead::getCompanyPhone, phone);
            }
        });
        if (leadMapper.selectCount(leadQuery) > 0) {
            throw new BusinessException(409, "该公司、信用代码或联系电话已有线索，请先查重后处理");
        }
        LambdaQueryWrapper<CrmCustomer> customerQuery = new LambdaQueryWrapper<>();
        customerQuery.and(w -> {
            if (StringUtils.hasText(creditCode)) {
                w.eq(CrmCustomer::getCreditCode, creditCode);
            }
            if (StringUtils.hasText(company)) {
                if (StringUtils.hasText(creditCode)) w.or();
                w.eq(CrmCustomer::getName, company);
            }
        });
        if (customerMapper.selectCount(customerQuery) > 0) {
            throw new BusinessException(409, "该企业已是正式客户，请到“我的客户”处理");
        }
        if (StringUtils.hasText(phone)) {
            long contactMatches = contactMapper.selectCount(new LambdaQueryWrapper<CrmContact>()
                    .eq(CrmContact::getMobile, phone)
                    .or()
                    .eq(CrmContact::getPhone, phone));
            if (contactMatches > 0) {
                throw new BusinessException(409, "该联系电话已属于正式客户，请到“我的客户”处理");
            }
        }
    }

    /** 今日领取计数 +1,首次写入时设置当日过期 */
    private void incrDailyClaim(Long userId) {
        String key = DAILY_KEY + userId + ":" + LocalDate.now();
        Long c = stringRedisTemplate.opsForValue().increment(key);
        if (c != null && c == 1L) {
            long secs = Duration.between(LocalDateTime.now(), LocalDate.now().atTime(LocalTime.MAX)).getSeconds() + 1;
            stringRedisTemplate.expire(key, secs, TimeUnit.SECONDS);
        }
    }
}

package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmContact;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.domain.entity.CrmFollow;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.CrmContactMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmFollowMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.ICrmHoldingService;
import com.zhehang.erp.modules.crm.service.ICrmLeadService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.company.domain.CompanyInfo;
import com.zhehang.erp.modules.company.service.CompanyInfoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
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
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmLeadServiceImpl extends ServiceImpl<CrmLeadMapper, CrmLead> implements ICrmLeadService {

    /** 释放后冷却:原跟进人 15 天内不可再领同一线索 */
    private static final String COOLDOWN_KEY = "crm:claim:cooldown:";
    private static final long COOLDOWN_DAYS = 15L;
    /** 每日领取上限 */
    private static final String DAILY_KEY = "crm:claim:daily:";
    private static final long DAILY_LIMIT = 50L;
    /** 客资保护期(天):领取/分配/跟进后顺延;到期仍未跟进则被回收引擎(scanAndRecycle)释放回公海 */
    private static final long PROTECTION_DAYS = 15L;

    private final CrmLeadMapper leadMapper;
    private final CrmCustomerMapper customerMapper;
    private final CrmContactMapper contactMapper;
    private final CrmFollowMapper followMapper;
    private final StringRedisTemplate stringRedisTemplate;
    private final ICrmHoldingService holdingService;
    private final DataScopeHelper dataScopeHelper;
    private final CompanyInfoService companyInfoService;

    @Override
    public boolean save(CrmLead entity) {
        // 公司名标准化(去首尾空格),保证去重/带出一致
        if (entity != null && entity.getCompany() != null) {
            entity.setCompany(entity.getCompany().trim());
        }
        // 自动补工商信息:填了公司名但工商字段为空时,从工商库带出补全(区域/规模/注册资本/成立日期)
        enrichFromCompany(entity);
        // 新建线索:若已指定负责人(私海)则补归属部门;无负责人(进公海)保持无部门,待领取时再写
        if (entity.getOwnerId() != null && entity.getDeptId() == null) {
            entity.setDeptId(dataScopeHelper.deptIdOfUser(entity.getOwnerId()));
        }
        return super.save(entity);
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
        wrapper.like(StringUtils.hasText(name), CrmLead::getName, name)
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
        if (lead.getStatus() == 3) {
            throw new BusinessException("该线索已转化");
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
        // 转客户时带工商信息(统一社会信用代码/行业/规模/地址),供客户税务档案按信用代码勾稽
        if (StringUtils.hasText(customer.getName())) {
            try {
                CompanyInfo info = companyInfoService.detail(customer.getName());
                if (info != null) {
                    customer.setCreditCode(info.getCreditCode());
                    customer.setIndustry(info.getIndustry());
                    customer.setScale(info.getEmployeeScale());
                    customer.setAddress(info.getAddress());
                }
            } catch (Exception ignore) {
                // 工商带出失败不阻断转化
            }
        }
        customerMapper.insert(customer);

        // 创建联系人
        CrmContact contact = new CrmContact();
        contact.setCustomerId(customer.getId());
        contact.setName(lead.getName());
        contact.setPhone(lead.getPhone());
        contact.setEmail(lead.getEmail());
        contact.setIsPrimary(1);
        contactMapper.insert(contact);

        // 更新线索状态为已转化
        lead.setStatus(3);
        leadMapper.updateById(lead);
    }

    @Override
    public void assignLead(Long id, Long ownerId) {
        CrmLead lead = leadMapper.selectById(id);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        lead.setOwnerId(ownerId);
        lead.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
        leadMapper.updateById(lead);
    }

    @Override
    public IPage<CrmLead> selectPoolPage(int pageNum, int pageSize, String name, Long poolId) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnership, "pool")
               .like(StringUtils.hasText(name), CrmLead::getName, name)
               .eq(poolId != null, CrmLead::getPoolId, poolId)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    public IPage<CrmLead> selectMyPage(int pageNum, int pageSize, String name, Integer status) {
        Long userId = SecurityUtils.getCurrentUserId();
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmLead::getOwnerId, userId)
               .eq(CrmLead::getOwnership, "private")
               .like(StringUtils.hasText(name), CrmLead::getName, name)
               .eq(status != null, CrmLead::getStatus, status)
               .orderByDesc(CrmLead::getLastFollowTime)
               .orderByDesc(CrmLead::getCreateTime);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
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
        // 每日领取上限校验
        long todayCount = currentDailyClaim(userId);
        if (todayCount + ids.size() > DAILY_LIMIT) {
            throw new BusinessException("超出每日领取上限(" + DAILY_LIMIT + "),今日已领取 " + todayCount + " 条");
        }
        // 持有上限校验:当前私海持有 + 本次领取不得超过角色上限
        Map<String, Object> holding = holdingService.currentHolding(userId);
        long currentHolding = ((Number) holding.get("current")).longValue();
        int maxHolding = ((Number) holding.get("max")).intValue();
        if (currentHolding + ids.size() > maxHolding) {
            throw new BusinessException("超出持有上限(" + maxHolding + "),当前已持有 " + currentHolding + " 条,请先跟进或释放部分客资");
        }

        LocalDateTime now = LocalDateTime.now();
        for (Long id : ids) {
            // 冷却期:原跟进人释放后 15 天内不可再领
            if (Boolean.TRUE.equals(stringRedisTemplate.hasKey(COOLDOWN_KEY + userId + ":" + id))) {
                CrmLead l = leadMapper.selectById(id);
                throw new BusinessException("线索「" + (l != null ? l.getName() : id) + "」处于冷却期,暂不可再次领取");
            }
            // 原子领取:仅当线索仍在公海时更新成功(DB 行锁保证并发下只有一人成功,
            // 避免"读-判断-写"在事务提交前被其他事务读到旧值导致的双重领取)
            boolean claimed = lambdaUpdate()
                    .eq(CrmLead::getId, id)
                    .eq(CrmLead::getOwnership, "pool")
                    .set(CrmLead::getOwnerId, userId)
                    .set(CrmLead::getDeptId, dataScopeHelper.deptIdOfUser(userId))
                    .set(CrmLead::getOwnership, "private")
                    .set(CrmLead::getClaimTime, now)
                    .set(CrmLead::getProtectionExpireDate, LocalDate.now().plusDays(PROTECTION_DAYS))
                    .set(CrmLead::getStatus, 2)
                    .update();
            if (!claimed) {
                CrmLead l = leadMapper.selectById(id);
                throw new BusinessException("线索「" + (l != null ? l.getName() : id) + "」已被领取或不存在");
            }
            incrDailyClaim(userId);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void returnToPool(List<Long> ids, String reason) {
        if (ids == null || ids.isEmpty()) {
            return;
        }
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            // 退回前,给原跟进人设置 15 天冷却,期内不可再领同一线索
            if (lead.getOwnerId() != null) {
                stringRedisTemplate.opsForValue().set(
                        COOLDOWN_KEY + lead.getOwnerId() + ":" + id, "1", COOLDOWN_DAYS, TimeUnit.DAYS);
            }
            // 用 lambdaUpdate 显式置 null:updateById 默认跳过 null 字段,直接 setOwnerId(null) 不会清空 owner_id
            lambdaUpdate()
                    .eq(CrmLead::getId, id)
                    .set(CrmLead::getOwnerId, null)
                    .set(CrmLead::getDeptId, null)
                    .set(CrmLead::getOwnership, "pool")
                    .set(CrmLead::getProtectionExpireDate, null)
                    .set(StringUtils.hasText(reason), CrmLead::getLastFollowContent, "退回公海:" + reason)
                    .update();
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void distribute(List<Long> ids, Long ownerId) {
        if (ids == null || ids.isEmpty() || ownerId == null) {
            return;
        }
        for (Long id : ids) {
            CrmLead lead = leadMapper.selectById(id);
            if (lead == null) {
                continue;
            }
            lead.setOwnerId(ownerId);
            lead.setDeptId(dataScopeHelper.deptIdOfUser(ownerId));
            lead.setOwnership("private");
            lead.setClaimTime(LocalDateTime.now());
            lead.setProtectionExpireDate(LocalDate.now().plusDays(PROTECTION_DAYS));
            leadMapper.updateById(lead);
        }
    }

    @Override
    public IPage<CrmLead> selectTodoFollow(int pageNum, int pageSize) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        // 数据范围:电销看自己、主管看本部门
        dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        wrapper.eq(CrmLead::getOwnership, "private")
               // 下次跟进时间已到/逾期,或从未设置(从没跟进)
               .and(q -> q.le(CrmLead::getNextFollowTime, LocalDate.now())
                          .or()
                          .isNull(CrmLead::getNextFollowTime))
               // 从未跟进(null)排最前,其次按下次跟进时间升序,再按保护期临近
               .orderByAsc(CrmLead::getNextFollowTime)
               .orderByAsc(CrmLead::getProtectionExpireDate);
        return leadMapper.selectPage(new Page<>(pageNum, pageSize), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addFollow(Long leadId, Integer type, String content, LocalDateTime nextTime, String nextContent) {
        CrmLead lead = leadMapper.selectById(leadId);
        if (lead == null) {
            throw new BusinessException("线索不存在");
        }
        if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new BusinessException("无权跟进该线索(不在你的数据范围内)");
        }
        // 1) 落库跟进记录
        CrmFollow follow = new CrmFollow();
        follow.setLeadId(leadId);
        follow.setType(type);
        follow.setContent(content);
        follow.setNextTime(nextTime);
        follow.setNextContent(nextContent);
        followMapper.insert(follow);
        // 2) 回写线索:lambdaUpdate + setSql 原子自增 followCount(避免并发跟进丢计数);
        //    顺延保护期=跟进即续命(回收引擎按 lastFollowTime/保护期判超时,避免误回收活跃客资)
        lambdaUpdate()
                .eq(CrmLead::getId, leadId)
                .set(CrmLead::getLastFollowTime, LocalDateTime.now())
                .set(CrmLead::getLastFollowContent, content)
                .set(nextTime != null, CrmLead::getNextFollowTime, nextTime != null ? nextTime.toLocalDate() : null)
                .set(CrmLead::getProtectionExpireDate, LocalDate.now().plusDays(PROTECTION_DAYS))
                .setSql("follow_count = IFNULL(follow_count, 0) + 1")
                .update();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int importFromCompanyLibrary(String keyword, int limit) {
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
            lead.setName(cname);
            lead.setCompany(cname);
            lead.setOwnership("pool"); // 进公海待领取/分配
            lead.setStatus(1);
            lead.setRemark("工商库导入");
            save(lead); // 走 save():自动补工商信息;无负责人则不写dept,保持公海
            created++;
        }
        log.info("工商库导入线索完成,关键词[{}],新建 {} 条", keyword, created);
        return created;
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
                .eq(hasName, CrmLead::getName, name));
        return leadMapper.selectList(wrapper);
    }

    @Override
    public List<Map<String, Object>> sourceStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("source", "COUNT(*) AS cnt").groupBy("source").orderByDesc("cnt");
        return leadMapper.selectMaps(qw);
    }

    @Override
    public List<Map<String, Object>> stageStats() {
        com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<CrmLead> qw =
                new com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<>();
        qw.select("status", "COUNT(*) AS cnt").groupBy("status").orderByAsc("status");
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

    /** 在当前用户数据范围内按状态计数(status 为 null 则计总数) */
    private long countScoped(Integer status) {
        LambdaQueryWrapper<CrmLead> wrapper = new LambdaQueryWrapper<>();
        dataScopeHelper.apply(wrapper, CrmLead::getOwnerId, CrmLead::getDeptId);
        wrapper.eq(status != null, CrmLead::getStatus, status);
        return leadMapper.selectCount(wrapper);
    }

    /** 当前用户今日已领取数量 */
    private long currentDailyClaim(Long userId) {
        String v = stringRedisTemplate.opsForValue().get(DAILY_KEY + userId + ":" + LocalDate.now());
        return v == null ? 0L : Long.parseLong(v);
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

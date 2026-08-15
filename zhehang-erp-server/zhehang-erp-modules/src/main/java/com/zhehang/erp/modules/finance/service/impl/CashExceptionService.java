package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.dto.CashExceptionActionRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionCase;
import com.zhehang.erp.modules.finance.domain.entity.FinCashExceptionEvent;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.mapper.FinCashExceptionCaseMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashExceptionEventMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

/** 异常案件当前状态与不可覆盖事件的闭环服务。 */
@Service
@RequiredArgsConstructor
public class CashExceptionService {

    private static final Set<String> TYPES = new HashSet<>(java.util.Arrays.asList(
            "付款方不明", "客户不匹配", "金额不一致", "重复疑似", "无凭证",
            "报单缺失", "客户争议", "账户差异", "退款退回", "银行冲正", "其他"));
    private static final Set<String> PRIORITIES = Set.of("P0", "P1", "P2");
    private static final DateTimeFormatter CASE_TIME = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    private final FinCashExceptionCaseMapper caseMapper;
    private final FinCashExceptionEventMapper eventMapper;
    private final FinCashJournalMapper journalMapper;
    private final SysUserMapper sysUserMapper;
    private final CashNotificationService notificationService;
    private final DataScopeHelper dataScopeHelper;

    public IPage<FinCashExceptionCase> page(Integer pageNum,
                                            Integer pageSize,
                                            String status,
                                            String exceptionType,
                                            String priority,
                                            Long ownerId) {
        LambdaQueryWrapper<FinCashExceptionCase> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(StringUtils.hasText(status), FinCashExceptionCase::getStatus, status)
                .eq(StringUtils.hasText(exceptionType), FinCashExceptionCase::getExceptionType, exceptionType)
                .eq(StringUtils.hasText(priority), FinCashExceptionCase::getPriority, priority)
                .eq(ownerId != null, FinCashExceptionCase::getOwnerId, ownerId)
                .orderByAsc(FinCashExceptionCase::getStatus)
                .orderByAsc(FinCashExceptionCase::getPriority)
                .orderByAsc(FinCashExceptionCase::getNextFollowUpTime)
                .orderByDesc(FinCashExceptionCase::getUpdateTime);
        if (!canManage()) {
            dataScopeHelper.applyFinancial(wrapper, FinCashExceptionCase::getOwnerId, FinCashExceptionCase::getOwnerDeptId);
        }
        IPage<FinCashExceptionCase> page = caseMapper.selectPage(
                new Page<>(positive(pageNum, 1), Math.min(positive(pageSize, 20), 200)), wrapper);
        fillJournalSnapshots(page.getRecords());
        return page;
    }

    public FinCashExceptionCase caseForJournal(Long journalId) {
        if (journalId == null) {
            return null;
        }
        return caseMapper.selectOne(new LambdaQueryWrapper<FinCashExceptionCase>()
                .eq(FinCashExceptionCase::getJournalId, journalId)
                .last("LIMIT 1"));
    }

    public FinCashExceptionCase detail(Long id) {
        FinCashExceptionCase entity = requireCase(id);
        fillJournalSnapshots(List.of(entity));
        return entity;
    }

    public FinCashExceptionCase caseForDailyClose(Long closeId) {
        if (closeId == null) {
            return null;
        }
        return caseMapper.selectOne(new LambdaQueryWrapper<FinCashExceptionCase>()
                .eq(FinCashExceptionCase::getDailyCloseId, closeId)
                .orderByDesc(FinCashExceptionCase::getId)
                .last("LIMIT 1"));
    }

    public List<FinCashExceptionEvent> events(Long caseId) {
        requireCase(caseId);
        return eventMapper.selectList(new LambdaQueryWrapper<FinCashExceptionEvent>()
                .eq(FinCashExceptionEvent::getCaseId, caseId)
                .orderByDesc(FinCashExceptionEvent::getActionTime)
                .orderByDesc(FinCashExceptionEvent::getId));
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase create(CashExceptionActionRequest request) {
        if (request == null || (request.getJournalId() == null && request.getDailyCloseId() == null)) {
            throw new BusinessException("异常必须关联收款或日结");
        }
        String type = validType(request.getExceptionType());
        FinCashJournal journal = null;
        if (request.getJournalId() != null) {
            journal = journalMapper.selectById(request.getJournalId());
            if (journal == null) {
                throw new BusinessException("关联收款不存在");
            }
            if (!canManage() && !dataScopeHelper.canAccess(journal.getOwnerId(), journal.getOwnerDeptId())) {
                throw new BusinessException("无权为该收款创建异常");
            }
            FinCashExceptionCase existing = caseForJournal(journal.getId());
            if (existing != null && !"resolved".equals(existing.getStatus())) {
                throw new BusinessException("该收款已有未解决异常，请在原异常中继续处理");
            }
            if (existing != null) {
                return reopenExisting(existing, request, type, "manual");
            }
        }
        return createCase(journal, request.getDailyCloseId(), type,
                validPriority(request.getPriority()), "manual", request.getOwnerId(),
                request.getNextAction(), request.getNextFollowUpTime(), request.getNote());
    }

    /** 新收款/导入/日结规则命中时创建或重新打开案件，不覆盖人工正在处理的异常类型。 */
    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase ensureSystemCase(FinCashJournal journal,
                                                 Long dailyCloseId,
                                                 String type,
                                                 String priority,
                                                 String sourceType,
                                                 String note) {
        if (journal == null && dailyCloseId == null) {
            return null;
        }
        FinCashExceptionCase existing = journal != null
                ? caseForJournal(journal.getId()) : caseForDailyClose(dailyCloseId);
        if (existing != null && !"resolved".equals(existing.getStatus())) {
            addEvent(existing, "progress", existing.getStatus(), existing.getStatus(),
                    StringUtils.hasText(note) ? note : "系统再次检测到异常", null);
            return existing;
        }
        CashExceptionActionRequest request = new CashExceptionActionRequest();
        request.setJournalId(journal == null ? null : journal.getId());
        request.setDailyCloseId(dailyCloseId);
        request.setExceptionType(validType(type));
        request.setPriority(validPriority(priority));
        request.setNote(note);
        if (existing != null) {
            return reopenExisting(existing, request, request.getExceptionType(), sourceType);
        }
        Long ownerId = journal == null ? SecurityUtils.getCurrentUserId()
                : (journal.getOwnerId() != null ? journal.getOwnerId() : journal.getCreateBy());
        return createCase(journal, dailyCloseId, request.getExceptionType(), request.getPriority(),
                sourceType, ownerId, null, null, note);
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase claim(Long id, CashExceptionActionRequest request) {
        FinCashExceptionCase entity = requireCase(id);
        requireOpen(entity);
        Long uid = SecurityUtils.getCurrentUserId();
        if (entity.getOwnerId() != null && !Objects.equals(entity.getOwnerId(), uid) && !canManage()) {
            throw new BusinessException("该异常已由其他负责人认领");
        }
        requireNextStep(request);
        String before = entity.getStatus();
        fillOwner(entity, uid);
        entity.setStatus("processing");
        entity.setNextAction(request.getNextAction().trim());
        entity.setNextFollowUpTime(request.getNextFollowUpTime());
        entity.setLatestNote(textOr(request.getNote(), "已认领并开始处理"));
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "processing");
        addEvent(entity, "claim", before, entity.getStatus(), entity.getLatestNote(), request.getMetadataJson());
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase transfer(Long id, CashExceptionActionRequest request) {
        FinCashExceptionCase entity = requireOwnedOrManage(id);
        requireOpen(entity);
        if (request == null || request.getOwnerId() == null) {
            throw new BusinessException("请选择转交负责人");
        }
        SysUser targetOwner = sysUserMapper.selectById(request.getOwnerId());
        if (targetOwner == null) throw new BusinessException("转交负责人不存在");
        if (!canManage() && !dataScopeHelper.canAccess(targetOwner.getId(), targetOwner.getDeptId())) {
            throw new BusinessException("只能在本人数据权限范围内转交异常");
        }
        requireNextStep(request);
        String before = entity.getStatus();
        fillOwner(entity, request.getOwnerId());
        entity.setStatus("processing");
        entity.setNextAction(request.getNextAction().trim());
        entity.setNextFollowUpTime(request.getNextFollowUpTime());
        entity.setLatestNote(textOr(request.getNote(), "异常已转交"));
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "processing");
        addEvent(entity, "transfer", before, entity.getStatus(), entity.getLatestNote(), request.getMetadataJson());
        notificationService.exceptionAssigned(entity.getTenantId(), entity.getOwnerId(), entity.getId(),
                entity.getExceptionType(), entity.getPriority(), entity.getNextAction(), LocalDateTime.now());
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase progress(Long id, CashExceptionActionRequest request) {
        FinCashExceptionCase entity = requireOwnedOrManage(id);
        requireOpen(entity);
        requireNextStep(request);
        if (!StringUtils.hasText(request.getNote())) {
            throw new BusinessException("请填写本次处理进展");
        }
        String before = entity.getStatus();
        entity.setStatus("processing");
        entity.setNextAction(request.getNextAction().trim());
        entity.setNextFollowUpTime(request.getNextFollowUpTime());
        entity.setLatestNote(request.getNote().trim());
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "processing");
        addEvent(entity, "progress", before, entity.getStatus(), entity.getLatestNote(), request.getMetadataJson());
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase resolve(Long id, CashExceptionActionRequest request) {
        FinCashExceptionCase entity = requireOwnedOrManage(id);
        requireOpen(entity);
        if (request == null || !StringUtils.hasText(request.getResolution())) {
            throw new BusinessException("解决异常必须填写处理结果");
        }
        String before = entity.getStatus();
        entity.setStatus("resolved");
        entity.setResolution(request.getResolution().trim());
        entity.setLatestNote(textOr(request.getNote(), entity.getResolution()));
        entity.setResolvedBy(SecurityUtils.getCurrentUserId());
        entity.setResolvedAt(LocalDateTime.now());
        entity.setNextAction(null);
        entity.setNextFollowUpTime(null);
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "resolved");
        addEvent(entity, "resolve", before, entity.getStatus(), entity.getResolution(), request.getMetadataJson());
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public FinCashExceptionCase reopen(Long id, CashExceptionActionRequest request) {
        FinCashExceptionCase entity = requireOwnedOrManage(id);
        if (!"resolved".equals(entity.getStatus())) {
            throw new BusinessException("仅已解决异常可重新打开");
        }
        if (request == null || !StringUtils.hasText(request.getNote())) {
            throw new BusinessException("重新打开必须填写原因");
        }
        return reopenExisting(entity, request,
                StringUtils.hasText(request.getExceptionType()) ? validType(request.getExceptionType()) : entity.getExceptionType(),
                entity.getSourceType());
    }

    public boolean hasUnresolvedForJournal(Long journalId) {
        return journalId != null && caseMapper.selectCount(new LambdaQueryWrapper<FinCashExceptionCase>()
                .eq(FinCashExceptionCase::getJournalId, journalId)
                .in(FinCashExceptionCase::getStatus, "pending", "processing")) > 0;
    }

    /** 字段补全后自动解决系统生成的基础资料异常，人工争议/重复疑似必须人工结案。 */
    @Transactional(rollbackFor = Exception.class)
    public void resolveSystemJournalCase(Long journalId, String resolution) {
        FinCashExceptionCase entity = caseForJournal(journalId);
        if (entity == null || "resolved".equals(entity.getStatus()) || !"system".equals(entity.getSourceType())) {
            return;
        }
        if (!("付款方不明".equals(entity.getExceptionType())
                || "客户不匹配".equals(entity.getExceptionType())
                || "无凭证".equals(entity.getExceptionType())
                || "报单缺失".equals(entity.getExceptionType()))) {
            return;
        }
        String before = entity.getStatus();
        entity.setStatus("resolved");
        entity.setResolution(textOr(resolution, "基础资料已补全"));
        entity.setLatestNote(entity.getResolution());
        entity.setResolvedBy(SecurityUtils.getCurrentUserId());
        entity.setResolvedAt(LocalDateTime.now());
        entity.setNextAction(null);
        entity.setNextFollowUpTime(null);
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "resolved");
        addEvent(entity, "resolve", before, "resolved", entity.getResolution(), null);
    }

    /** 日结重新核对一致时，仅自动解决系统创建的账户差异，不碰人工异常。 */
    @Transactional(rollbackFor = Exception.class)
    public void resolveSystemDailyCloseCase(Long closeId, String resolution) {
        FinCashExceptionCase entity = caseForDailyClose(closeId);
        if (entity == null || "resolved".equals(entity.getStatus())
                || !"daily_close".equals(entity.getSourceType())) {
            return;
        }
        String before = entity.getStatus();
        entity.setStatus("resolved");
        entity.setResolution(textOr(resolution, "日结差异已核对一致"));
        entity.setLatestNote(entity.getResolution());
        entity.setResolvedBy(SecurityUtils.getCurrentUserId());
        entity.setResolvedAt(LocalDateTime.now());
        entity.setNextAction(null);
        entity.setNextFollowUpTime(null);
        caseMapper.updateById(entity);
        addEvent(entity, "resolve", before, "resolved", entity.getResolution(), null);
    }

    public boolean hasUnresolvedForDailyClose(Long closeId) {
        return closeId != null && caseMapper.selectCount(new LambdaQueryWrapper<FinCashExceptionCase>()
                .eq(FinCashExceptionCase::getDailyCloseId, closeId)
                .in(FinCashExceptionCase::getStatus, "pending", "processing")) > 0;
    }

    private FinCashExceptionCase createCase(FinCashJournal journal,
                                            Long dailyCloseId,
                                            String type,
                                            String priority,
                                            String sourceType,
                                            Long ownerId,
                                            String nextAction,
                                            LocalDateTime nextFollowUp,
                                            String note) {
        FinCashExceptionCase entity = new FinCashExceptionCase();
        entity.setCaseNo(generateCaseNo());
        entity.setJournalId(journal == null ? null : journal.getId());
        entity.setDailyCloseId(dailyCloseId);
        entity.setExceptionType(type);
        entity.setPriority(priority);
        entity.setStatus("pending");
        entity.setSourceType(StringUtils.hasText(sourceType) ? sourceType : "system");
        fillOwner(entity, ownerId);
        entity.setNextAction(trimToNull(nextAction));
        entity.setNextFollowUpTime(nextFollowUp);
        entity.setLatestNote(textOr(note, "创建异常：" + type));
        caseMapper.insert(entity);
        syncJournalStatus(entity, "pending");
        addEvent(entity, "create", null, "pending", entity.getLatestNote(), null);
        notificationService.exceptionAssigned(entity.getTenantId(), entity.getOwnerId(), entity.getId(),
                entity.getExceptionType(), entity.getPriority(),
                textOr(entity.getNextAction(), entity.getLatestNote()), LocalDateTime.now());
        return entity;
    }

    private FinCashExceptionCase reopenExisting(FinCashExceptionCase entity,
                                                CashExceptionActionRequest request,
                                                String type,
                                                String sourceType) {
        String before = entity.getStatus();
        entity.setExceptionType(type);
        entity.setPriority(validPriority(request.getPriority() != null ? request.getPriority() : entity.getPriority()));
        entity.setStatus("pending");
        entity.setSourceType(StringUtils.hasText(sourceType) ? sourceType : entity.getSourceType());
        if (request.getOwnerId() != null) {
            fillOwner(entity, request.getOwnerId());
        }
        entity.setNextAction(trimToNull(request.getNextAction()));
        entity.setNextFollowUpTime(request.getNextFollowUpTime());
        entity.setLatestNote(textOr(request.getNote(), "异常重新打开"));
        entity.setResolution(null);
        entity.setResolvedBy(null);
        entity.setResolvedAt(null);
        caseMapper.updateById(entity);
        syncJournalStatus(entity, "pending");
        addEvent(entity, "reopen", before, "pending", entity.getLatestNote(), request.getMetadataJson());
        notificationService.exceptionAssigned(entity.getTenantId(), entity.getOwnerId(), entity.getId(),
                entity.getExceptionType(), entity.getPriority(),
                textOr(entity.getNextAction(), entity.getLatestNote()), LocalDateTime.now());
        return entity;
    }

    private void addEvent(FinCashExceptionCase entity,
                          String action,
                          String from,
                          String to,
                          String content,
                          String metadataJson) {
        FinCashExceptionEvent event = new FinCashExceptionEvent();
        event.setCaseId(entity.getId());
        event.setActionType(action);
        event.setFromStatus(from);
        event.setToStatus(to);
        event.setContent(textOr(content, action));
        event.setOperatorId(SecurityUtils.getCurrentUserId());
        event.setOperatorName(currentActorName());
        event.setActionTime(LocalDateTime.now());
        event.setMetadataJson(trimToNull(metadataJson));
        eventMapper.insert(event);
    }

    private void syncJournalStatus(FinCashExceptionCase entity, String status) {
        if (entity.getJournalId() == null) {
            return;
        }
        FinCashJournal journal = journalMapper.selectById(entity.getJournalId());
        if (journal != null) {
            journal.setExceptionStatus(status);
            journalMapper.updateById(journal);
        }
    }

    private void fillJournalSnapshots(List<FinCashExceptionCase> cases) {
        if (cases == null || cases.isEmpty()) {
            return;
        }
        List<Long> ids = cases.stream().map(FinCashExceptionCase::getJournalId)
                .filter(Objects::nonNull).distinct().collect(Collectors.toList());
        if (ids.isEmpty()) {
            return;
        }
        Map<Long, FinCashJournal> journals = journalMapper.selectBatchIds(ids).stream()
                .collect(Collectors.toMap(FinCashJournal::getId, v -> v));
        for (FinCashExceptionCase entity : cases) {
            FinCashJournal journal = journals.get(entity.getJournalId());
            if (journal != null) {
                entity.setReceiptNo(journal.getReceiptNo());
                entity.setReceiptAmount(journal.getAmount());
                entity.setPayerName(journal.getPayerName());
                entity.setCustomerName(journal.getCustomerName());
            }
        }
    }

    private FinCashExceptionCase requireCase(Long id) {
        FinCashExceptionCase entity = id == null ? null : caseMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException("异常案件不存在");
        }
        if (!canAccessCase(entity)) {
            throw new BusinessException("无权访问该异常案件");
        }
        return entity;
    }

    private boolean canAccessCase(FinCashExceptionCase entity) {
        if (canManage()) return true;
        if (dataScopeHelper.canAccess(entity.getOwnerId(), entity.getOwnerDeptId())) return true;
        if (entity.getJournalId() == null) return false;
        FinCashJournal journal = journalMapper.selectById(entity.getJournalId());
        return journal != null && dataScopeHelper.canAccess(journal.getOwnerId(), journal.getOwnerDeptId());
    }

    private FinCashExceptionCase requireOwnedOrManage(Long id) {
        FinCashExceptionCase entity = requireCase(id);
        Long uid = SecurityUtils.getCurrentUserId();
        if (!canManage() && entity.getOwnerId() != null && !Objects.equals(entity.getOwnerId(), uid)) {
            throw new BusinessException("仅异常负责人或财务负责人可处理");
        }
        return entity;
    }

    private void requireOpen(FinCashExceptionCase entity) {
        if ("resolved".equals(entity.getStatus())) {
            throw new BusinessException("异常已解决，如需继续处理请先重新打开");
        }
    }

    private void requireNextStep(CashExceptionActionRequest request) {
        if (request == null || !StringUtils.hasText(request.getNextAction()) || request.getNextFollowUpTime() == null) {
            throw new BusinessException("处理中异常必须填写下一步动作和下次跟进时间");
        }
    }

    private void fillOwner(FinCashExceptionCase entity, Long ownerId) {
        entity.setOwnerId(ownerId);
        entity.setOwnerName(null);
        entity.setOwnerDeptId(null);
        if (ownerId == null) {
            return;
        }
        SysUser user = sysUserMapper.selectById(ownerId);
        if (user != null) {
            entity.setOwnerName(StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername());
            entity.setOwnerDeptId(user.getDeptId());
        }
    }

    private String currentActorName() {
        Long uid = SecurityUtils.getCurrentUserId();
        if (uid != null) {
            SysUser user = sysUserMapper.selectById(uid);
            if (user != null) {
                return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
            }
        }
        return SecurityUtils.getCurrentUsername();
    }

    private boolean canManage() {
        return SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss");
    }

    private String validType(String value) {
        if (!StringUtils.hasText(value)) {
            throw new BusinessException("请选择异常类型");
        }
        String type = value.trim();
        if (!TYPES.contains(type)) {
            throw new BusinessException("异常类型不合法");
        }
        return type;
    }

    private String validPriority(String value) {
        String priority = StringUtils.hasText(value) ? value.trim().toUpperCase() : "P1";
        if (!PRIORITIES.contains(priority)) {
            throw new BusinessException("异常优先级不合法");
        }
        return priority;
    }

    private String generateCaseNo() {
        return "EXC" + LocalDateTime.now().format(CASE_TIME)
                + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }

    private String textOr(String value, String fallback) {
        return StringUtils.hasText(value) ? value.trim() : fallback;
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }

    private int positive(Integer value, int fallback) {
        return value != null && value > 0 ? value : fallback;
    }
}

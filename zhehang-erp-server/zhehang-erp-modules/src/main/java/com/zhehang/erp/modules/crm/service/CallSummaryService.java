package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.BizCallRecord;
import com.zhehang.erp.modules.crm.domain.dto.CallSummaryDTO;
import com.zhehang.erp.modules.crm.domain.dto.CrmLeadFollowDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.mapper.BizCallRecordMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

/**
 * 外呼小结闭环:一笔事务同时保存话单、跟进历史、线索阶段和下一步动作。
 */
@Service
@RequiredArgsConstructor
public class CallSummaryService {

    private static final Set<String> TERMINAL_RESULTS = Set.of("号码无效", "明确拒绝");
    private static final Set<String> HISTORY_INTENT_LEVELS = Set.of("D", "E");
    private static final Set<String> INTENT_LEVELS = Set.of("A", "B", "C", "D", "E");

    private final BizCallRecordMapper callRecordMapper;
    private final CrmLeadMapper leadMapper;
    private final ICrmLeadService leadService;
    private final DataScopeHelper dataScopeHelper;

    @Transactional(rollbackFor = Exception.class)
    public Long saveSummary(CallSummaryDTO summary) {
        Long tenantId = requireTenantId();
        validateSummary(summary);
        CrmLead lead = loadAccessibleLead(summary.getLeadId());

        BizCallRecord record = findByPlatformCallId(summary.getPlatformCallId(), tenantId);
        assertRecordWritable(record, summary.getLeadId());
        boolean create = record == null;
        if (create) {
            record = new BizCallRecord();
        }
        fillRecord(record, summary, tenantId);
        if (create) {
            callRecordMapper.insert(record);
        } else {
            callRecordMapper.updateById(record);
        }

        if (lead != null) {
            saveLeadFollowup(lead, summary);
        }
        return record.getId();
    }

    /** 兼容旧调用方的单独话单保存;仍强制按当前登录人归属和校验线索数据范围。 */
    @Transactional(rollbackFor = Exception.class)
    public Long saveRecordOnly(BizCallRecord input) {
        if (input == null) {
            throw new BusinessException("通话记录不能为空");
        }
        Long tenantId = requireTenantId();
        loadAccessibleLead(input.getLeadId());
        BizCallRecord record = findByPlatformCallId(input.getPlatformCallId(), tenantId);
        assertRecordWritable(record, input.getLeadId());
        boolean create = record == null;
        if (create) {
            record = new BizCallRecord();
        }
        Long userId = currentUserId();
        if (input.getLeadId() != null && input.getLeadId() > 0) {
            record.setLeadId(input.getLeadId());
        }
        record.setCustomerName(limit(input.getCustomerName(), 200));
        record.setPhone(limit(input.getPhone(), 32));
        record.setAgentId(userId);
        record.setAgentName(resolveCurrentUserName(userId));
        record.setCallType(StringUtils.hasText(input.getPlatformCallId()) ? "platform" : "manual");
        record.setCallTime(input.getCallTime() == null ? LocalDateTime.now() : input.getCallTime());
        record.setDuration(nonNegative(input.getDuration()));
        record.setConnected(normalizeConnected(input.getConnected()));
        record.setResult(limit(input.getResult(), 32));
        // 录音地址只允许由云客同步链路写入。手工登记不得新增或覆盖平台事实源。
        record.setPlatformCallId(limit(input.getPlatformCallId(), 64));
        record.setRemark(limit(input.getRemark(), 500));
        record.setIntentLevel(limit(input.getIntentLevel(), 8));
        record.setNeedType(limit(input.getNeedType(), 255));
        record.setQuoteStatus(limit(input.getQuoteStatus(), 16));
        record.setCreateBy(userId);
        record.setTenantId(tenantId);
        if (create) {
            callRecordMapper.insert(record);
        } else {
            callRecordMapper.updateById(record);
        }
        return record.getId();
    }

    private void validateSummary(CallSummaryDTO summary) {
        if (summary == null) {
            throw new BusinessException("通话小结不能为空");
        }
        if (!StringUtils.hasText(summary.getResult())) {
            throw new BusinessException("请选择通话结果");
        }
        int connected = normalizeConnected(summary.getConnected());
        if (connected == 1 && !StringUtils.hasText(summary.getRemark())) {
            throw new BusinessException("接通后请填写客户反馈或本次结论");
        }
        String intentLevel = resolveIntentLevel(summary);
        if (connected == 1 && !StringUtils.hasText(intentLevel)) {
            throw new BusinessException("请选择客户意向等级");
        }
        if (StringUtils.hasText(intentLevel) && !INTENT_LEVELS.contains(intentLevel)) {
            throw new BusinessException("客户意向等级仅支持A、B、C、D、E");
        }
        boolean terminal = isTerminal(summary, intentLevel);
        if (summary.getLeadId() != null && summary.getLeadId() > 0
                && !terminal) {
            if (summary.getNextActionTime() == null) {
                throw new BusinessException("请安排下一步跟进时间,避免客户漏跟");
            }
            if (summary.getNextActionTime().isBefore(LocalDateTime.now().minusMinutes(1))) {
                throw new BusinessException("下一步跟进时间不能早于当前时间");
            }
            if (!StringUtils.hasText(summary.getNextActionType())) {
                throw new BusinessException("请选择下一步动作");
            }
        }
    }

    private CrmLead loadAccessibleLead(Long leadId) {
        if (leadId == null || leadId <= 0) {
            return null;
        }
        CrmLead lead = leadMapper.selectOne(new LambdaQueryWrapper<CrmLead>()
                .eq(CrmLead::getId, leadId)
                .eq(CrmLead::getTenantId, requireTenantId())
                .last("LIMIT 1"));
        if (lead == null) {
            throw new AccessDeniedException("无权操作该线索或线索不存在");
        }
        if (!dataScopeHelper.canAccess(lead.getOwnerId(), lead.getDeptId())) {
            throw new AccessDeniedException("无权操作该线索");
        }
        return lead;
    }

    private BizCallRecord findByPlatformCallId(String platformCallId, Long tenantId) {
        if (!StringUtils.hasText(platformCallId)) {
            return null;
        }
        return callRecordMapper.selectOne(new LambdaQueryWrapper<BizCallRecord>()
                .eq(BizCallRecord::getTenantId, tenantId)
                .eq(BizCallRecord::getPlatformCallId, platformCallId.trim())
                .last("LIMIT 1"));
    }

    private void assertRecordWritable(BizCallRecord record, Long requestedLeadId) {
        if (record == null) {
            return;
        }
        if (!Objects.equals(record.getTenantId(), requireTenantId())) {
            throw new AccessDeniedException("无权修改其他租户的通话记录");
        }
        if (record.getAgentId() != null && !dataScopeHelper.canAccessOwner(record.getAgentId())) {
            throw new AccessDeniedException("无权修改其他坐席的通话记录");
        }
        if (record.getLeadId() != null) {
            loadAccessibleLead(record.getLeadId());
            if (requestedLeadId != null && requestedLeadId > 0 && !record.getLeadId().equals(requestedLeadId)) {
                throw new AccessDeniedException("外呼记录已关联其他线索,不能覆盖");
            }
            return;
        }
        if (record.getAgentId() == null && !dataScopeHelper.isManagerOrAdmin()) {
            throw new AccessDeniedException("该历史话单尚未映射坐席,请联系主管处理");
        }
    }

    private void fillRecord(BizCallRecord record, CallSummaryDTO summary, Long tenantId) {
        Long userId = currentUserId();
        if (summary.getLeadId() != null && summary.getLeadId() > 0) {
            record.setLeadId(summary.getLeadId());
        }
        record.setCustomerName(limit(summary.getCustomerName(), 200));
        record.setPhone(limit(summary.getPhone(), 32));
        record.setAgentId(userId);
        record.setAgentName(resolveCurrentUserName(userId));
        record.setCallType(StringUtils.hasText(summary.getPlatformCallId()) ? "platform" : "manual");
        if (record.getCallTime() == null) {
            record.setCallTime(LocalDateTime.now());
        }
        record.setDuration(nonNegative(summary.getDuration()));
        record.setConnected(normalizeConnected(summary.getConnected()));
        record.setResult(limit(summary.getResult(), 32));
        record.setPlatformCallId(limit(summary.getPlatformCallId(), 64));
        record.setRemark(limit(summary.getRemark(), 500));
        record.setIntentLevel(resolveIntentLevel(summary));
        record.setNeedType(limit(summary.getNeedType(), 255));
        record.setQuoteStatus(limit(summary.getQuoteStatus(), 16));
        if (record.getCreateBy() == null) {
            record.setCreateBy(userId);
        }
        record.setTenantId(tenantId);
    }

    private void saveLeadFollowup(CrmLead lead, CallSummaryDTO summary) {
        String result = summary.getResult().trim();
        String intentLevel = resolveIntentLevel(summary);
        boolean terminal = isTerminal(summary, intentLevel);
        String followContent = "【外呼-" + result + "】";
        if (StringUtils.hasText(summary.getRemark())) {
            followContent += summary.getRemark().trim();
        }

        CrmLeadFollowDTO follow = new CrmLeadFollowDTO();
        follow.setType(1);
        follow.setContent(limit(followContent, 500));
        follow.setNextTime(terminal ? null : summary.getNextActionTime());
        follow.setNextContent(terminal ? null : limit(summary.getNextActionContent(), 500));
        follow.setFollowStatus(resolveFollowStatus(lead, summary));
        follow.setCustomerLevel(intentLevel);
        follow.setNextActionType(terminal ? null : summary.getNextActionType());
        leadService.addFollow(lead.getId(), follow, terminal);

        boolean hasIntentLevel = StringUtils.hasText(intentLevel);
        boolean hasNeedType = StringUtils.hasText(summary.getNeedType());
        boolean hasQuoteStatus = StringUtils.hasText(summary.getQuoteStatus());
        boolean connected = normalizeConnected(summary.getConnected()) == 1;
        LambdaUpdateWrapper<CrmLead> update = new LambdaUpdateWrapper<>();
        update.eq(CrmLead::getId, lead.getId())
                .eq(CrmLead::getTenantId, requireTenantId())
                .set(hasIntentLevel, CrmLead::getIntentLevel, intentLevel)
                .set(hasIntentLevel, CrmLead::getCustomerLevel, intentLevel)
                .set(hasNeedType, CrmLead::getNeedType,
                        limit(summary.getNeedType(), 255))
                .set(hasQuoteStatus, CrmLead::getQuoteStatus,
                        limit(summary.getQuoteStatus(), 16));
        if (terminal) {
            String reason = historyReason(intentLevel, result, summary.getRemark());
            update.set(CrmLead::getStatus, 4)
                    .set(CrmLead::getValidity, "无效")
                    .set(CrmLead::getInvalidReason, limit(reason, 255))
                    .set(CrmLead::getNextActionTime, null)
                    .set(CrmLead::getNextActionType, null)
                    .set(CrmLead::getNextFollowTime, null);
        } else if (connected) {
            update.set(CrmLead::getStatus, 2)
                    .set(CrmLead::getValidity, "有效")
                    .set(CrmLead::getInvalidReason, null);
        }
        if (hasIntentLevel || hasNeedType || hasQuoteStatus || terminal || connected) {
            leadMapper.update(null, update);
        }
    }

    private String resolveIntentLevel(CallSummaryDTO summary) {
        if ("号码无效".equals(summary.getResult())) {
            return "E";
        }
        if ("明确拒绝".equals(summary.getResult())) {
            return "E".equalsIgnoreCase(summary.getCustomerLevel()) ? "E" : "D";
        }
        String level = StringUtils.hasText(summary.getCustomerLevel())
                ? summary.getCustomerLevel() : summary.getIntentLevel();
        if (StringUtils.hasText(level)) {
            return level.trim().toUpperCase(Locale.ROOT);
        }
        return null;
    }

    private boolean isTerminal(CallSummaryDTO summary, String intentLevel) {
        return TERMINAL_RESULTS.contains(summary.getResult())
                || (StringUtils.hasText(intentLevel) && HISTORY_INTENT_LEVELS.contains(intentLevel));
    }

    private String historyReason(String intentLevel, String result, String remark) {
        String prefix = "D".equals(intentLevel)
                ? "D类-无意向,转入历史客资"
                : "E".equals(intentLevel) ? "E类-无效客户,暂停拨打" : result;
        return prefix + (StringUtils.hasText(remark) ? ":" + remark.trim() : "");
    }

    private String resolveFollowStatus(CrmLead lead, CallSummaryDTO summary) {
        if (StringUtils.hasText(summary.getFollowStatus())) {
            return summary.getFollowStatus().trim();
        }
        if (normalizeConnected(summary.getConnected()) == 1) {
            if ("已成交".equals(summary.getQuoteStatus())) {
                return "签单收款";
            }
            return "已报价".equals(summary.getQuoteStatus()) ? "需求答疑" : "需求沟通";
        }
        return StringUtils.hasText(lead.getFollowStatus()) ? lead.getFollowStatus() : "线索接收";
    }

    private Long currentUserId() {
        Long userId = SecurityUtils.getCurrentUserId();
        if (userId == null) {
            throw new BusinessException("登录已失效,请重新登录");
        }
        return userId;
    }

    private Long requireTenantId() {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        if (tenantId == null || tenantId <= 0) {
            throw new BusinessException("缺少租户上下文,请重新登录");
        }
        return tenantId;
    }

    private String resolveCurrentUserName(Long userId) {
        return dataScopeHelper.resolveUserNames(Collections.singleton(userId))
                .getOrDefault(userId, SecurityUtils.getCurrentUsername());
    }

    private int normalizeConnected(Integer connected) {
        return connected != null && connected == 1 ? 1 : 0;
    }

    private int nonNegative(Integer value) {
        return value == null ? 0 : Math.max(value, 0);
    }

    private String limit(String value, int maxLength) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        String text = value.trim();
        return text.length() <= maxLength ? text : text.substring(0, maxLength);
    }
}

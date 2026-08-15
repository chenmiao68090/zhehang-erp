package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmLead;
import com.zhehang.erp.modules.crm.domain.entity.CrmLeadStageEvent;
import com.zhehang.erp.modules.crm.mapper.CrmLeadStageEventMapper;
import com.zhehang.erp.modules.crm.support.SalesStage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CrmLeadStageRecorder {

    private final CrmLeadStageEventMapper eventMapper;

    public void recordCreation(CrmLead lead, String sourceType, Long sourceId) {
        if (lead == null || lead.getId() == null) {
            throw new BusinessException("销售阶段记录缺少线索ID");
        }
        SalesStage target = SalesStage.fromLead(lead);
        write(lead.getTenantId(), lead.getId(), null, target, "CREATED", sourceType, sourceId,
                lead.getOwnerId(), lead.getDeptId(), "create:" + lead.getId(),
                lead.getCreateTime() != null ? lead.getCreateTime() : LocalDateTime.now());
    }

    public void recordTransition(CrmLead before,
                                 String targetFollowStatus,
                                 Integer targetLifecycleStatus,
                                 Long targetOwnerId,
                                 Long targetDeptId,
                                 String eventType,
                                 String sourceType,
                                 Long sourceId,
                                 String eventKey) {
        if (before == null || before.getId() == null) {
            throw new BusinessException("销售阶段变化缺少原线索");
        }
        SalesStage from = SalesStage.fromLead(before);
        SalesStage target = SalesStage.resolve(targetFollowStatus, targetLifecycleStatus);
        if (from == target) {
            return;
        }
        write(before.getTenantId(), before.getId(), from, target, eventType, sourceType, sourceId,
                targetOwnerId, targetDeptId, eventKey, LocalDateTime.now());
    }

    private void write(Long entityTenantId,
                       Long leadId,
                       SalesStage from,
                       SalesStage target,
                       String eventType,
                       String sourceType,
                       Long sourceId,
                       Long ownerId,
                       Long deptId,
                       String eventKey,
                       LocalDateTime occurredAt) {
        Long tenantId = SecurityUtils.getCurrentTenantId();
        Long operatorId = SecurityUtils.getCurrentUserId();
        if (tenantId == null) {
            tenantId = entityTenantId;
        }
        if (operatorId == null) {
            operatorId = 0L;
        }
        if (tenantId == null || target == null) {
            throw new BusinessException("销售阶段记录缺少租户或目标阶段");
        }
        LocalDateTime now = LocalDateTime.now();
        CrmLeadStageEvent event = new CrmLeadStageEvent();
        event.setTenantId(tenantId);
        event.setLeadId(leadId);
        event.setEventKey(limit(eventKey == null || eventKey.isBlank()
                ? eventType.toLowerCase() + ":" + leadId + ":" + UUID.randomUUID()
                : eventKey, 128));
        event.setFromStageCode(from == null ? null : from.getCode());
        event.setToStageCode(target.getCode());
        event.setEventType(limit(eventType, 32));
        event.setSourceType(limit(sourceType, 32));
        event.setSourceId(sourceId);
        event.setOwnerId(ownerId);
        event.setDeptId(deptId);
        event.setOperatorId(operatorId);
        event.setOccurredAt(occurredAt == null ? now : occurredAt);
        event.setCreateTime(now);
        event.setUpdateTime(now);
        event.setCreateBy(operatorId);
        event.setUpdateBy(operatorId);
        eventMapper.insertIgnore(event);
    }

    private String limit(String value, int max) {
        if (value == null || value.length() <= max) {
            return value;
        }
        return value.substring(0, max);
    }
}

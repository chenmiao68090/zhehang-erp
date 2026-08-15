package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 销售阶段变化事件，只从功能上线后开始积累。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_lead_stage_event")
public class CrmLeadStageEvent extends BaseEntity {
    private Long leadId;
    private String eventKey;
    private String fromStageCode;
    private String toStageCode;
    private String eventType;
    private String sourceType;
    private Long sourceId;
    private Long ownerId;
    private Long deptId;
    private Long operatorId;
    private LocalDateTime occurredAt;
}

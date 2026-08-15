package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.Version;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_order_bridge_run")
public class FeigeOrderTaskBridgeRun extends BaseEntity {
    private Long ruleId;
    private String ruleCode;
    private String triggerEvent;
    private String targetTaskType;
    private Long orderId;
    private String orderNo;
    private Long businessOwnerId;
    private Long deptId;
    private Long operatorId;
    private String operatorName;
    private String runStatus;
    private Long targetTaskId;
    private Integer attemptCount;
    private LocalDateTime nextRetryAt;
    private String errorCode;
    private String errorMessage;
    private LocalDateTime processedAt;
    @Version
    private Integer version;
}

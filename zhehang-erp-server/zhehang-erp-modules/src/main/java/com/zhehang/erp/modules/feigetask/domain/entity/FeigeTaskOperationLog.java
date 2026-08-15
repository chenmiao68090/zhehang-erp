package com.zhehang.erp.modules.feigetask.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_task_operation_log")
public class FeigeTaskOperationLog extends BaseEntity {
    private String domainType;
    private Long businessId;
    private String eventType;
    private String fromStatus;
    private String toStatus;
    private Long operatorId;
    private String operatorName;
    private String detail;
    private String payloadJson;
}

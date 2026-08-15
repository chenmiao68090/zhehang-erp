package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_order_operation_log")
public class FeigeOrderOperationLog extends BaseEntity {
    private Long orderId;
    private String operationType;
    private String operationDesc;
    private Long operatorId;
    private String operatorName;
    private String beforeData;
    private String afterData;
    private String changedFields;
    private String remarks;
}

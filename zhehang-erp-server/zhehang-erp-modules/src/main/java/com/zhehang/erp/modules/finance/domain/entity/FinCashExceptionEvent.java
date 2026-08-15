package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 收款异常处理事件，只追加、不覆盖。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_exception_event")
public class FinCashExceptionEvent extends BaseEntity {
    private Long caseId;
    private String actionType;
    private String fromStatus;
    private String toStatus;
    private String content;
    private Long operatorId;
    private String operatorName;
    private LocalDateTime actionTime;
    private String metadataJson;
}

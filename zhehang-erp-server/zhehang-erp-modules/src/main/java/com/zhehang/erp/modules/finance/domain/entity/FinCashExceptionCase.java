package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/** 收款异常案件的当前状态；历史变化由 FinCashExceptionEvent 保存。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cash_exception_case")
public class FinCashExceptionCase extends BaseEntity {
    private String caseNo;
    private Long journalId;
    private Long dailyCloseId;
    private String exceptionType;
    private String priority;
    private String status;
    private String sourceType;
    private Long ownerId;
    private String ownerName;
    private Long ownerDeptId;
    private String nextAction;
    private LocalDateTime nextFollowUpTime;
    private String latestNote;
    private String resolution;
    private Long resolvedBy;
    private LocalDateTime resolvedAt;

    @TableField(exist = false)
    private String receiptNo;
    @TableField(exist = false)
    private java.math.BigDecimal receiptAmount;
    @TableField(exist = false)
    private String payerName;
    @TableField(exist = false)
    private String customerName;
}

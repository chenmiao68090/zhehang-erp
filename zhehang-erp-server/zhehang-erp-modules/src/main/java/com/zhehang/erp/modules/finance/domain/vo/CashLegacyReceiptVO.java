package com.zhehang.erp.modules.finance.domain.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 尚未关联真实收款日记账的历史回款记录。 */
@Data
public class CashLegacyReceiptVO {
    private Long logId;
    private Long receivableId;
    private Long customerId;
    private String customerName;
    private String serviceType;
    private String receivableMonth;
    private BigDecimal paymentAmount;
    private BigDecimal legacyReceivedAmount;
    private LocalDateTime actionTime;
    private String operatorName;
    private String content;
    private String sourceType;
}

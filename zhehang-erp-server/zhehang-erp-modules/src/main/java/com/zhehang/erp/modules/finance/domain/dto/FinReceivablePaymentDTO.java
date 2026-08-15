package com.zhehang.erp.modules.finance.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** 回款续费记录收款入参。 */
@Data
public class FinReceivablePaymentDTO {
    private Long id;
    /** 选择已有收款日记账；为空时由本请求创建真实收款。 */
    private Long cashJournalId;
    private BigDecimal amount;
    private LocalDateTime paymentTime;
    private String paymentMethod;
    private String receiveAccount;
    private Long cashAccountId;
    private String payerName;
    private String payerPhone;
    private String bankSerialNo;
    private String voucherFile;
    private String remark;
}

package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FeigePaymentRequest {
    @NotNull(message = "收款金额不能为空")
    @DecimalMin(value = "0.01", message = "收款金额必须大于0")
    private BigDecimal amount;
    private LocalDateTime paymentTime;
    private String paymentMethod;
    private String accountNumber;
    private String voucher;
    @Size(max = 500, message = "备注不能超过500字")
    private String remarks;
}

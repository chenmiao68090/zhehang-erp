package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class FeigeRefundRequest {
    @NotNull(message = "退费金额不能为空")
    @DecimalMin(value = "0.01", message = "退费金额必须大于0")
    private BigDecimal refundAmount;
    @NotBlank(message = "退费原因不能为空")
    @Size(max = 500, message = "退费原因不能超过500字")
    private String reason;
}

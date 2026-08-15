package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FeigeContractRenewalRequest {
    private LocalDate startDate;

    @NotNull(message = "续费截止日期不能为空")
    private LocalDate expireDate;

    @NotNull(message = "续费金额不能为空")
    @DecimalMin(value = "0.01", message = "续费金额必须大于0")
    private BigDecimal amount;

    private Integer giftMonth;
    private String payType;

    @Size(max = 1000, message = "续费备注不能超过1000字")
    private String remark;
}

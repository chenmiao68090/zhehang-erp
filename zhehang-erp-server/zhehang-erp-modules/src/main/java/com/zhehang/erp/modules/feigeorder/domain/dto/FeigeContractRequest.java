package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class FeigeContractRequest {
    private Long orderId;
    @NotBlank(message = "客户名称不能为空")
    @Size(max = 200, message = "客户名称不能超过200字")
    private String companyName;
    private Long salesmanId;
    private Long servicePersonId;
    private String serviceStaffJson;
    @DecimalMin(value = "0.00", message = "合同金额不能小于0")
    private BigDecimal contractAmount;
    private LocalDate signDate;
    private LocalDate expireDate;
    private String contractStatus;
    private Integer lossFlag;
    private String lossReason;
    private String retentionMeasure;
    private String finalDecision;
    private Integer backupFlag;
    @Size(max = 1000, message = "备注不能超过1000字")
    private String remarks;
    private String payType;
    private Integer giftMonth;
    private String enterpriseNature;
    private String manualBusinessTag;
    private BigDecimal paidAmount;
    private String customerSource;
    private String signerName;
    private String productName;
    private String renewalStatus;
    private String enterpriseLevel;
    private String businessTag;
    private Long financeDirectorId;
    private Long financeAdvisorId;
    private Long accountantId;
}

package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

@Data
public class FeigeOrderRequest {
    @NotBlank(message = "客户名称不能为空")
    @Size(max = 200, message = "客户名称不能超过200字")
    private String companyName;
    @Size(max = 100, message = "联系人不能超过100字")
    private String contacts;
    @Size(max = 100, message = "联系电话不能超过100字")
    private String contactPhone;
    private LocalDate orderDate;
    private String region;
    private String address;
    private Long salesmanId;
    @NotBlank(message = "业务类型不能为空")
    private String businessType;
    private String opportunitySource;
    private String deliveryMethod;
    @DecimalMin(value = "0.00", message = "订单金额不能小于0")
    private BigDecimal orderAmount;
    @DecimalMin(value = "0.00", message = "合同金额不能小于0")
    private BigDecimal contractAmount;
    @DecimalMin(value = "0.00", message = "尾款金额不能小于0")
    private BigDecimal finalPaymentAmount;
    @DecimalMin(value = "0.00", message = "已收金额不能小于0")
    private BigDecimal receivedAmount;
    private LocalDateTime collectionTime;
    private String collectionAccountNumber;
    private Integer recurring;
    private String voucher;
    @Size(max = 1000, message = "备注不能超过1000字")
    private String remarks;

    private Boolean createContract;
    private LocalDate contractSignDate;
    private LocalDate contractExpireDate;
    private String contractPayType;
    private Integer contractGiftMonth;
    private String enterpriseNature;
    private String teamName;
    private Long companyId;
    private String customerSource;
    private String sourceDetail;
    private String companyNature;
    private Map<String, Object> businessData;
}

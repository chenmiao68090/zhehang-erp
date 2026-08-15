package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_order")
public class FeigeOrder extends BaseEntity {
    private String orderNo;
    private LocalDate orderDate;
    private String companyName;
    private String contacts;
    private String contactPhone;
    private String region;
    private String address;
    private Long salesmanId;
    private String salesmanName;
    private Long deptId;
    private String businessType;
    private String opportunitySource;
    private String deliveryMethod;
    private BigDecimal orderAmount;
    private BigDecimal contractAmount;
    private BigDecimal finalPaymentAmount;
    private BigDecimal receivedAmount;
    private LocalDateTime collectionTime;
    private String collectionAccountNumber;
    private Integer recurring;
    private String voucher;
    private String status;
    private String remarks;
    private String teamName;
    private Long companyId;
    private String customerSource;
    private String sourceDetail;
    private String auditStatus;
    private String auditRemark;
    private Long auditorId;
    private String auditorName;
    private LocalDateTime auditTime;
    private String flowProgress;
    private String currentStep;
    private String taskStatus;
    private Integer repurchaseCount;
    private String companyNature;
    private String businessData;

    @TableField(exist = false)
    private BigDecimal outstandingAmount;
}

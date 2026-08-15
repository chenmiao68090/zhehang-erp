package com.zhehang.erp.modules.feigeorder.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("feige_accounting_contract")
public class FeigeAccountingContract extends BaseEntity {
    private String contractNo;
    private Long orderId;
    private String orderNo;
    private String companyName;
    private Long salesmanId;
    private String salesmanName;
    private Long deptId;
    private Long servicePersonId;
    private String servicePersonName;
    private String serviceStaffJson;
    private BigDecimal contractAmount;
    private LocalDate signDate;
    private LocalDate expireDate;
    private String contractStatus;
    private Integer lossFlag;
    private String lossReason;
    private String retentionMeasure;
    private String finalDecision;
    private Integer backupFlag;
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
    private BigDecimal totalSpending;
    private Integer customerOrderCount;
    private Integer referralCount;
    private Integer followupCount;
    private Integer collectionCount;
    private Integer serviceMonths;
    private String enterpriseLevel;
    private String businessTag;
    private String relatedCompanyName;
    private String relatedStatus;
    private Integer weworkGroupBound;
    private Long financeDirectorId;
    private String financeDirectorName;
    private Long financeAdvisorId;
    private String financeAdvisorName;
    private Long accountantId;
    private String accountantName;
}

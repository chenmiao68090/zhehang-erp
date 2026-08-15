package com.zhehang.erp.modules.renewal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 地址续费资源库。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_address_renewal")
public class BizAddressRenewal extends BaseEntity {
    private String companyName;
    private String subjectType;
    private LocalDate signDate;
    private String mountAddress;
    private String legalPerson;
    private String phone;
    private String salesName;
    private BigDecimal receivable;
    private BigDecimal channelShare;
    private BigDecimal ourIncome;
    /** 付款状态:unpaid未支付/paid已支付 */
    private String payStatus;
    private String channelCompany;
    private LocalDate expireDate;
    private String expireMonth;
    private BigDecimal renewPrice26;
    private BigDecimal renewPrice25;
    /** 续费情况 */
    private String renewStatus;
    private String supplierContact;
    private BigDecimal addressCost;
    private BigDecimal peerRebate;
    private BigDecimal otherExpense;
    /** 合同图片文件ID */
    private String contractFile;
    /** 其他附件 JSON */
    private String attachments;
    private String remark;
}

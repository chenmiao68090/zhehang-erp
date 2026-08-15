package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 人力组织-社保公积金台账。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_social_fund")
public class HrmSocialFund extends BaseEntity {
    private String recordMonth;
    private Long employeeId;
    private String employeeName;
    private String idCard;
    private String phone;
    private BigDecimal pensionCompany;
    private BigDecimal pensionPersonal;
    private BigDecimal unemploymentCompany;
    private BigDecimal unemploymentPersonal;
    private BigDecimal workInjuryCompany;
    private BigDecimal workInjuryPersonal;
    private BigDecimal medicalCompany;
    private BigDecimal medicalPersonal;
    private String socialFirstMonth;
    private BigDecimal housingFundCompany;
    private BigDecimal housingFundPersonal;
    private String fundFirstMonth;
    private String remark;
}

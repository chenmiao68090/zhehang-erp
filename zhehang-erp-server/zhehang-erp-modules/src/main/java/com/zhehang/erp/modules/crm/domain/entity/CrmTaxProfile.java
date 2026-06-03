package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户税务档案。
 *
 * <p>独立于 crm_customer 表，以「统一社会信用代码」为业务关联主键（勾稽主键），
 * 承接「填公司名自动带出工商信息」，并补齐报税所需的税务要素，
 * 是后续「报税日历 / 申报提醒」的配置源头。</p>
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_tax_profile")
public class CrmTaxProfile extends BaseEntity {
    /** 关联客户ID（可空，按需回填） */
    private Long customerId;
    /** 统一社会信用代码（= 纳税人识别号，业务关联主键） */
    private String creditCode;
    /** 企业名称（冗余，便于展示） */
    private String companyName;
    /** 纳税人资格：1 一般纳税人 / 2 小规模纳税人 */
    private Integer taxpayerType;
    /** 征收方式：查账征收 / 核定征收 */
    private String collectionType;
    /** 主管税务局 */
    private String taxAuthority;
    /** 办税人 */
    private String taxOfficer;
    /** 办税人电话 */
    private String taxOfficerPhone;
    /** 税务报到日期 yyyy-MM-dd */
    private String registerDate;
    /** 票种核定 */
    private String invoiceType;
    /** 涉及税种清单（JSON 数组字符串，如 ["增值税","附加税","企业所得税"]） */
    private String taxTypes;
    /** 主申报周期：月报 / 季报 / 年报 */
    private String filingCycle;
    /** 状态：0 正常 */
    private Integer status;
    /** 备注 */
    private String remark;
}

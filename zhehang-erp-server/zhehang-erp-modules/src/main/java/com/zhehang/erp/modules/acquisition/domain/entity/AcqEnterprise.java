package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_enterprise")
public class AcqEnterprise extends BaseEntity {
    /** 企业名称 */
    private String companyName;
    /** 统一社会信用代码 */
    private String creditCode;
    /** 法定代表人 */
    private String legalPerson;
    /** 注册省份 */
    private String registerRegionProvince;
    /** 注册城市 */
    private String registerRegionCity;
    /** 注册区县 */
    private String registerRegionDistrict;
    /** 注册地址 */
    private String registerAddress;
    /** 成立日期 */
    private LocalDate establishmentDate;
    /** 注册资本(万元) */
    private BigDecimal registeredCapital;
    /** 实缴资本(万元) */
    private BigDecimal paidCapital;
    /** 企业类型 */
    private String enterpriseType;
    /** 行业代码 */
    private String industryCode;
    /** 行业名称 */
    private String industryName;
    /** 经营范围 */
    private String businessScope;
    /** 人员规模下限 */
    private Integer staffCountMin;
    /** 人员规模上限 */
    private Integer staffCountMax;
    /** 年营业额(万元) */
    private BigDecimal annualRevenue;
    /** 经营状态 */
    private String enterpriseStatus;
    /** 纳税资质 */
    private String taxQualification;
    /** 税务非正常户状态 */
    private String taxAbnormalStatus;
    /** 是否有欠税公告 */
    private Integer hasTaxArrears;
    /** 欠税金额(元) */
    private BigDecimal taxArrearsAmount;
    /** 是否有重大税收违法 */
    private Integer hasMajorTaxViolation;
    /** 是否有税务行政处罚 */
    private Integer hasTaxPenalty;
    /** 是否在经营异常名录 */
    private Integer isInAbnormalOperationList;
    /** 当前待处理异常数 */
    private Integer pendingAbnormalCount;
    /** 可解锁联系方式数量 */
    private Integer contactCount;
    /** 是否有联系方式 */
    private Integer hasContact;
    /** 企业风险评分(0-100) */
    private Integer enterpriseRiskScore;
    /** AI潜力评分(0-100) */
    private Integer aiPotentialScore;
    /** 是否HOT标记 */
    private Integer isHot;
    /** 营业期限类型 */
    private String businessTermType;
    /** 营业期限到期日 */
    private LocalDate businessTermEnd;
    /** 年报状态 */
    private String annualReportStatus;
}

package com.zhehang.erp.modules.acquisition.domain.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class EnterpriseQueryDTO {
    /** 当前页 */
    private Integer page = 1;
    /** 每页大小 */
    private Integer pageSize = 20;
    /** 排序: comprehensive/establishment_date_desc/establishment_date_asc/registered_capital_desc 等 */
    private String sortBy = "comprehensive";
    /** 客群编码 */
    private String segmentCode;
    /** Tab筛选编码 */
    private String tabCode;

    /** 注册省份 */
    private String registerRegionProvince;
    /** 注册城市 */
    private String registerRegionCity;
    /** 成立时间(起) */
    private String establishmentDateFrom;
    /** 成立时间(止) */
    private String establishmentDateTo;
    /** 注册资本下限 */
    private BigDecimal registeredCapitalMin;
    /** 注册资本上限 */
    private BigDecimal registeredCapitalMax;
    /** 企业类型(多选) */
    private List<String> enterpriseType;
    /** 税务资质(多选) */
    private List<String> taxQualification;
    /** 经营状态 */
    private String enterpriseStatus;
    /** 关键词(企业名称) */
    private String keyword;
    /** 是否有联系方式 */
    private Boolean hasContact;
    /** 是否在经营异常名录 */
    private Boolean isInAbnormalOperationList;
    /** 税务非正常户状态 */
    private String taxAbnormalStatus;
}

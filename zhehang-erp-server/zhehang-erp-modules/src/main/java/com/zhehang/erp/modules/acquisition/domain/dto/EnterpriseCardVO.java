package com.zhehang.erp.modules.acquisition.domain.dto;

import com.zhehang.erp.modules.acquisition.domain.entity.AcqEnterpriseAbnormal;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class EnterpriseCardVO {
    private Long id;
    private String companyName;
    private String creditCode;
    private String registerRegionCity;
    private String establishmentDate;
    private BigDecimal registeredCapital;
    private String enterpriseType;
    private String industryName;
    private Integer staffCountMin;
    private Integer staffCountMax;
    private BigDecimal annualRevenue;
    private String enterpriseStatus;
    private String taxQualification;
    private String taxAbnormalStatus;
    private Boolean isInAbnormalOperationList;
    private Integer pendingAbnormalCount;
    private Integer contactCount;
    private Boolean hasContact;
    private Integer aiPotentialScore;
    private Boolean isHot;
    private String registerAddress;
    /** 异常明细列表 */
    private List<AcqEnterpriseAbnormal> abnormals;
}

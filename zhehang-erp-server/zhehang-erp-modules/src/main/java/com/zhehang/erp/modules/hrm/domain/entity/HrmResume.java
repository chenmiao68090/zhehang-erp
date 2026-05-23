package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_resume")
public class HrmResume extends BaseEntity {
    private Long recruitId;
    private String name;
    private String phone;
    private String email;
    private String education;
    private Integer experienceYears;
    private String currentCompany;
    private BigDecimal expectedSalary;
    private String resumeUrl;
    private Integer status;
    private String evaluation;
}

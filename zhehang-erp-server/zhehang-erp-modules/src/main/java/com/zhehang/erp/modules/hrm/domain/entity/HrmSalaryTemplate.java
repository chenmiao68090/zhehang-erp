package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * HR·岗位薪酬模板(各岗位差异薪酬)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_salary_template")
public class HrmSalaryTemplate extends BaseEntity {
    private Long postId;
    private String postName;
    private BigDecimal baseSalary;
    private BigDecimal performanceBase;
    /** 绩效系数 */
    private BigDecimal perfCoefficient;
    private BigDecimal allowance;
    /** 奖金 */
    private BigDecimal bonus;
    /** 奖金说明 */
    private String bonusRule;
    /** 提成说明 */
    private String commissionRule;
    /** 绩效考核说明(各岗位不同) */
    private String perfRule;
    private String remark;
}

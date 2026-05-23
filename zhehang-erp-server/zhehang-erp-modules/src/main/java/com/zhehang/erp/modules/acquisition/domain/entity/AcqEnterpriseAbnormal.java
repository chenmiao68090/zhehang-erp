package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_enterprise_abnormal")
public class AcqEnterpriseAbnormal extends BaseEntity {
    /** 企业ID */
    private Long enterpriseId;
    /** 异常分类 */
    private String abnormalCategory;
    /** 异常类型 */
    private String abnormalType;
    /** 列入原因 */
    private String inclusionReason;
    /** 列入/发生日期 */
    private LocalDate inclusionDate;
    /** 移出日期 */
    private LocalDate removalDate;
    /** 决定机关 */
    private String decisionOrg;
    /** 状态(active/resolved/cancelled) */
    private String abnormalStatus;
    /** 金额 */
    private BigDecimal amount;
}

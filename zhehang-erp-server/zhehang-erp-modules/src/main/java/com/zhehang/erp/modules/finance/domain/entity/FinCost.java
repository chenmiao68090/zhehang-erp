package com.zhehang.erp.modules.finance.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/** 管理成本实体。对应前端 views/finance/cost.vue(非渠道成本);模式参照 BizChannelPartner。 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("fin_cost")
public class FinCost extends BaseEntity {
    /** 成本科目 */
    private String category;
    /** 归属部门 */
    private String ownerDept;
    /** 所属月份(yyyy-MM) */
    private String period;
    /** 本月金额 */
    private BigDecimal amount;
    /** 月度预算 */
    private BigDecimal budgetAmount;
    /** 上月金额(算环比) */
    private BigDecimal lastAmount;
    /** 状态(normal/warning/over_risk) */
    private String status;
    /** 责任人/角色 */
    private String ownerRole;
    /** 备注 */
    private String remark;
}

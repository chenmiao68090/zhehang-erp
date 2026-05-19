package com.zhehang.erp.modules.supply.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_purchase_req")
public class SupplyPurchaseReq extends BaseEntity {
    /** 申请单号 */
    private String reqNo;
    /** 申请人ID */
    private Long applicantId;
    /** 部门ID */
    private Long deptId;
    /** 申请事由 */
    private String reason;
    /** 合计金额 */
    private BigDecimal totalAmount;
    /** 状态 0草稿 1待审批 2已通过 3已驳回 4已生成订单 */
    private Integer status;
}

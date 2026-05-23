package com.zhehang.erp.modules.supply.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_return")
public class SupplyReturn extends BaseEntity {
    /** 退货单号 */
    private String returnNo;
    /** 关联采购订单ID */
    private Long orderId;
    /** 供应商ID */
    private Long vendorId;
    /** 退货原因 */
    private String reason;
    /** 退货金额 */
    private BigDecimal amount;
    /** 状态 0待处理 1处理中 2已完成 */
    private Integer status;
}

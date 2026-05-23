package com.zhehang.erp.modules.supply.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_purchase_order")
public class SupplyPurchaseOrder extends BaseEntity {
    /** 订单编号 */
    private String orderNo;
    /** 供应商ID */
    private Long vendorId;
    /** 关联申请单ID */
    private Long reqId;
    /** 合计金额 */
    private BigDecimal totalAmount;
    /** 状态 0待确认 1已确认 2生产中 3已发货 4已到货 5已验收 */
    private Integer status;
    /** 预计到货日期 */
    private LocalDate expectedDate;
    /** 实际到货日期 */
    private LocalDate actualDate;
}

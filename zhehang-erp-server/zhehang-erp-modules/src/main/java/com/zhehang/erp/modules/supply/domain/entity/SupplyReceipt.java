package com.zhehang.erp.modules.supply.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("supply_receipt")
public class SupplyReceipt extends BaseEntity {
    /** 入库单号 */
    private String receiptNo;
    /** 关联采购订单ID */
    private Long orderId;
    /** 供应商ID */
    private Long vendorId;
    /** 入库日期 */
    private LocalDate receiptDate;
    /** 状态 0待验收 1验收通过 2验收不通过 */
    private Integer status;
    /** 验收人ID */
    private Long inspectorId;
}

package com.zhehang.erp.modules.order.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 订单服务子项实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_order_item")
public class BizOrderItem extends BaseEntity {
    /** 订单ID */
    private Long orderId;
    /** 服务项目编号 */
    private String itemCode;
    /** 服务项目名称 */
    private String itemName;
    /** 服务类型 */
    private String itemType;
    /** 单价 */
    private BigDecimal unitPrice;
    /** 数量 */
    private Integer quantity;
    /** 折扣率(0-100) */
    private BigDecimal discountRate;
    /** 小计金额 */
    private BigDecimal subtotal;
    /** 服务时长(月) */
    private Integer serviceMonths;
    /** 描述 */
    private String description;
    /** 排序 */
    private Integer sortOrder;
}

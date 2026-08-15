package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 刻章·印章耗材库存。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_stock")
public class BizSealStock extends BaseEntity {
    /** 品名 */
    private String itemName;
    /** 规格 */
    private String spec;
    /** 单位 */
    private String unit;
    /** 当前库存数量 */
    private Integer quantity;
    /** 安全库存(预警线) */
    private Integer safetyStock;
    /** 参考单价 */
    private BigDecimal unitPrice;
    /** 采购日期 */
    private java.time.LocalDate purchaseDate;
    /** 购买数量 */
    private Integer buyQty;
    /** 购入价 */
    private BigDecimal buyPrice;
    /** 优惠总计 */
    private BigDecimal discount;
    /** 发票是否开具:1是 */
    private Integer invoiceDone;
    /** 发票附件 */
    private String invoiceFile;
    /** 采购链接 */
    private String purchaseLink;
    /** 常用供应商 */
    private String supplier;
    /** 备注 */
    private String remark;
}

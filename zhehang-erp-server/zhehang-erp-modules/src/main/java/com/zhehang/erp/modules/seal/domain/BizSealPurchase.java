package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 刻章·印章耗材采购记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_purchase")
public class BizSealPurchase extends BaseEntity {
    /** 采购品名 */
    private String itemName;
    /** 规格 */
    private String spec;
    /** 采购数量 */
    private Integer quantity;
    /** 采购单价 */
    private BigDecimal unitPrice;
    /** 采购金额 */
    private BigDecimal amount;
    /** 供应商 */
    private String supplier;
    /** 采购日期 */
    private LocalDate purchaseDate;
    /** 采购人 */
    private String operator;
    /** 状态:ordered已下单/arrived已到货入库 */
    private String status;
    /** 备注 */
    private String remark;
}

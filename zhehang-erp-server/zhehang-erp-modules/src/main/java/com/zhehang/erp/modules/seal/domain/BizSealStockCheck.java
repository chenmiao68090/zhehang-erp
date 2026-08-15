package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 刻章·印章库存盘点记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_stock_check")
public class BizSealStockCheck extends BaseEntity {
    /** 品名 */
    private String itemName;
    /** 账面库存 */
    private Integer bookQty;
    /** 实际盘点数 */
    private Integer actualQty;
    /** 差异(实际-账面) */
    private Integer diff;
    /** 盘点日期 */
    private LocalDate checkDate;
    /** 盘点人 */
    private String operator;
    /** 备注 */
    private String remark;
}

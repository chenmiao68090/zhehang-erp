package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 刻章·印章库存调整日志。每次入库/出库记一条,含事由。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_stock_log")
public class BizSealStockLog extends BaseEntity {
    /** 库存项ID */
    private Long stockId;
    /** 物料名(冗余,便于展示) */
    private String itemName;
    /** 变动量,正=入库 负=出库 */
    private Integer delta;
    /** 调整前数量 */
    private Integer beforeQty;
    /** 调整后数量 */
    private Integer afterQty;
    /** 调整事由 */
    private String reason;
}

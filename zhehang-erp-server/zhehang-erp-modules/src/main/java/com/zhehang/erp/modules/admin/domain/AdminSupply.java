package com.zhehang.erp.modules.admin.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 行政·办公用品管理(分类物料台账 + 入库采购)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("admin_supply")
public class AdminSupply extends BaseEntity {
    /** 入库单号 */
    private String supplyNo;
    /** 品名 */
    private String supplyName;
    /** 分类:通用办公耗材/业务专用耗材/劳保福利品 */
    private String category;
    /** 规格 */
    private String spec;
    /** 单位 */
    private String unit;
    /** 当前库存 */
    private Integer quantity;
    /** 低库存预警(安全库存) */
    private Integer safetyStock;
    /** 入库时间 */
    private LocalDate inDate;
    /** 含税总金额 */
    private BigDecimal amount;
    /** 经办人 */
    private String operator;
    /** 关联采购审批单号 */
    private String relatedApproval;
    /** 状态:待验收/已入库/已驳回 */
    private String status;
    /** 附件 URL/说明 */
    private String attach;
    /** 备注 */
    private String remark;
}

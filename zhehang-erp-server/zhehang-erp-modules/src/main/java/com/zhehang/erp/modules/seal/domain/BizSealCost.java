package com.zhehang.erp.modules.seal.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 刻章成本明细(按月):某月某成本类型一条,印章业务看板据此汇算总成本。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("biz_seal_cost")
public class BizSealCost extends BaseEntity {
    /** 年份 如2026 */
    private String costYear;
    /** 月份 YYYY-MM */
    private String costMonth;
    /** 成本类型(京东快递费用/印章消耗费用/刻章固定工资等) */
    private String costType;
    /** 成本分类:固定/可变 */
    private String costCategory;
    /** 金额 */
    private BigDecimal amount;
    /** 说明 */
    private String description;
    /** 附件 [{fileId,fileName}] JSON */
    private String attachment;
    /** 备注 */
    private String remark;
}

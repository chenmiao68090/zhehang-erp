package com.zhehang.erp.modules.admin.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 行政·固定资产流水(全生命周期动作记录:入库/领用/归还/维保/报废)。
 * 每次对资产执行动作都会落一条流水,资产主表 admin_asset 同步更新当前状态/领用人。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("admin_asset_record")
public class AdminAssetRecord extends BaseEntity {
    /** 关联资产ID(admin_asset.id) */
    private Long assetId;
    /** 资产名称(冗余,便于流水直接展示) */
    private String assetName;
    /** 流水类型:入库/领用/归还/维保/报废 */
    private String type;
    /** 领用/归还人员工ID */
    private Long employeeId;
    /** 领用/归还人姓名 */
    private String employeeName;
    /** 动作发生日期 */
    private LocalDate recordDate;
    /** 数量 */
    private Integer qty;
    /** 金额(维保费用等) */
    private BigDecimal amount;
    /** 动作后资产状态 */
    private String status;
    /** 经办人(操作人姓名) */
    private String operator;
    /** 备注 */
    private String remark;
}

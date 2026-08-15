package com.zhehang.erp.modules.admin.domain;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 行政·固定资产管理(全生命周期台账:采购入库→领用分配→维保维修→报废)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("admin_asset")
public class AdminAsset extends BaseEntity {
    /** 入库单号/资产编号 */
    private String assetNo;
    /** 资产名称 */
    private String assetName;
    /** 资产分类:办公设备/电子设备/税控专用设备/家具/其他 */
    private String category;
    /** 数量 */
    private Integer quantity;
    /** 总金额 */
    private BigDecimal amount;
    /** 入库时间 */
    private LocalDate inDate;
    /** 经办人 */
    private String operator;
    /** 关联采购审批单号 */
    private String relatedApproval;
    /** 状态:待验收/已入库/领用中/已归还/维修中/已报废/已驳回 */
    private String status;
    /** 当前领用人员工ID(org_employee.id) */
    private Long holderId;
    /** 领用人 */
    private String holder;
    /** 所属部门 */
    private String holderDept;
    /** 领用日期 */
    private LocalDate useDate;
    /** 领用类型:永久领用/临时领用 */
    private String useType;
    /** 维保类型:故障维修/定期保养 */
    private String maintainType;
    /** 故障描述 */
    private String faultDesc;
    /** 维修费用 */
    private BigDecimal maintainFee;
    /** 附件URL */
    private String attach;
    /** 备注 */
    private String remark;
}

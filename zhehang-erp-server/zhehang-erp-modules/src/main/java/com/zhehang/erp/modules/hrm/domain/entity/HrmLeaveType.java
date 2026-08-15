package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * HR·假期类型配置(可配置的假期类型,取代写死枚举)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_leave_type")
public class HrmLeaveType extends BaseEntity {
    /** 稳定编码 */
    private String typeCode;
    /** 假期类型名 */
    private String typeName;
    /** 展示顺序 */
    private Integer displayOrder;
    /** 时长单位:1=半天/2=天 */
    private Integer durationUnit;
    /** 余额规则:1=限额/2=不限额 */
    private Integer balanceRule;
    /** 状态:1=已启用/0=已停用 */
    private Integer status;
    /** 备注 */
    private String remark;
}

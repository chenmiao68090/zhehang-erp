package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_holding_config")
public class CrmHoldingConfig extends BaseEntity {
    /** 角色类型 */
    private String roleType;
    /** 角色标签 */
    private String roleLabel;
    /** 最大持有量 */
    private Integer maxHolding;
    /** 超时容忍率 */
    private BigDecimal overtimeToleranceRate;
    /** 超时释放小时数 */
    private Integer overtimeReleaseHours;
    /** 描述 */
    private String description;
    /** 状态(0正常 1禁用) */
    private Integer status;
}

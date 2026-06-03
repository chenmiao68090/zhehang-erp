package com.zhehang.erp.modules.crm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("crm_recycle_rule")
public class CrmRecycleRule extends BaseEntity {
    /** 规则名称 */
    private String ruleName;
    /** 规则编码 */
    private String ruleCode;
    /** 触发类型 */
    private String triggerType;
    /** 适用范围 */
    private String applyScope;
    /** 条件JSON */
    private String conditionJson;
    /** 回收天数 */
    private Integer recycleDays;
    /** 绿色预警天数 */
    private Integer warningDaysGreen;
    /** 黄色预警天数 */
    private Integer warningDaysYellow;
    /** 红色预警天数 */
    private Integer warningDaysRed;
    /** 目标公海池ID */
    private Long targetPoolId;
    /** 优先级 */
    private Integer priority;
    /** 状态(0正常 1禁用) */
    private Integer status;
}

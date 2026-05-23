package com.zhehang.erp.modules.acquisition.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("acq_segment_rule")
public class AcqSegmentRule extends BaseEntity {
    /** 客群编码 */
    private String segmentCode;
    /** 规则字段 */
    private String ruleField;
    /** 操作符 */
    private String ruleOperator;
    /** 规则值(JSON格式) */
    private String ruleValue;
    /** 与其他条件的逻辑关系(AND/OR) */
    private String ruleLogic;
    /** 排序号 */
    private Integer sortOrder;
}

package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * HR·绩效考核模板(参考 tita,按岗位设考核模板)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_perf_template")
public class HrmPerfTemplate extends BaseEntity {
    /** 模板名称 */
    private String templateName;
    /** 适用岗位 */
    private String postName;
    /** 考核周期:月度/季度/年度 */
    private String period;
    /** 评价方式:评分式/等级式 */
    private String scoreType;
    /**
     * 考核指标维度(JSON 数组字符串),如:
     * [{"name":"工作业绩","weight":70,"indicators":[{"name":"销售额","weight":60,"standard":"..."}]}]
     */
    private String dimensions;
    /** 考核总分上限 */
    private Integer totalScore;
    /** 备注 */
    private String remark;
}

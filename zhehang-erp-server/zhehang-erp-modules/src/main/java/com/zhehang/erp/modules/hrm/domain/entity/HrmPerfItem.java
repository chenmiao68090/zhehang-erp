package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * HR·绩效考核指标明细(每个考核任务下的逐项指标,来源于模板的 dimensions)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_perf_item")
public class HrmPerfItem extends BaseEntity {
    /** 关联考核任务ID */
    private Long taskId;
    /** 考核指标名(如:工作业绩/工作态度) */
    private String dimension;
    /** 权重(%) */
    private Integer weight;
    /** 指标目标/说明 */
    private String target;
    /** 自评分 */
    private BigDecimal selfScore;
    /** 自评说明 */
    private String selfComment;
    /** 上级评分 */
    private BigDecimal managerScore;
    /** 上级评语 */
    private String managerComment;
}

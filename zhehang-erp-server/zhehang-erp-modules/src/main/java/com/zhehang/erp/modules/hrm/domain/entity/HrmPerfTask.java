package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * HR·绩效考核任务(完整流程):下发→自评→上级评价→校准→结果确认→申诉。
 * 状态机:self_eval待自评→manager_eval待上级评价→calibrate待校准→confirm待确认→done已完成;另有 appeal申诉中。
 * employeeId / evaluatorId 均存 org_employee.id(员工ID)。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_perf_task")
public class HrmPerfTask extends BaseEntity {
    /** 来源考核模板ID */
    private Long templateId;
    /** 考核名称(如:2026年6月销售月度KPI) */
    private String taskName;
    /** 考核周期(2026-06/2026Q2 等) */
    private String period;
    /** 被考核员工ID(org_employee.id) */
    private Long employeeId;
    /** 被考核员工姓名 */
    private String employeeName;
    /** 部门 */
    private String dept;
    /** 上级评价人ID(org_employee.id) */
    private Long evaluatorId;
    /** 上级评价人姓名 */
    private String evaluatorName;
    /** 状态:self_eval/manager_eval/calibrate/confirm/done/appeal */
    private String status;
    /** 自评总分 */
    private BigDecimal selfScore;
    /** 上级评分 */
    private BigDecimal managerScore;
    /** 校准后分 */
    private BigDecimal calibrateScore;
    /** 最终得分 */
    private BigDecimal finalScore;
    /** 等级 S/A/B/C/D */
    private String grade;
    /** 自评总结 */
    private String selfComment;
    /** 上级评语 */
    private String managerComment;
    /** 校准说明 */
    private String calibrateComment;
    /** 申诉理由 */
    private String appealReason;
    /** 申诉答复 */
    private String appealReply;
}

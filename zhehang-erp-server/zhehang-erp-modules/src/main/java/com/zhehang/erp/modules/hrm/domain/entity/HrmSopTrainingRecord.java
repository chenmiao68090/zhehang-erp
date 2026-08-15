package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_sop_training_record")
public class HrmSopTrainingRecord extends BaseEntity {
    private Long employeeId;
    private String employeeName;
    private Long employeeUserId;
    private String trainingTheme;
    private Long sopId;
    private String sopTitle;
    /** 分配时锁定 SOP 版本,避免后续 SOP 升版影响历史培训记录 */
    private String sopVersion;
    private LocalDateTime trainingTime;
    private Boolean completed;
    private LocalDateTime completedTime;
    /** 待考核/通过/未通过 */
    private String assessmentResult;
    private String improvement;
    private LocalDateTime retrainTime;
    private Long reviewerId;
    private String reviewerName;
    private LocalDateTime reviewTime;
    private Long assignerId;
    private String assignerName;
}

package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_learning_record")
public class HrmTrainingLearningRecord extends BaseEntity {
    private Long employeeId;
    private String employeeName;
    private Long employeeUserId;
    private Long courseId;
    private String courseTitle;
    private String courseVersion;
    private Long sopId;
    private String sopTitle;
    private String sopVersion;
    private Long pathId;
    private String pathName;
    private String status;
    private Integer progressPercent;
    private LocalDateTime assignedTime;
    private LocalDateTime dueTime;
    private LocalDateTime startedTime;
    private LocalDateTime completedTime;
    private Boolean requiredCourse;
    private Boolean certificationRequired;
    private Integer currentAttempt;
    private Integer bestScore;
    private Boolean passed;
    private LocalDateTime passTime;
    private Boolean retrainRequired;
    private LocalDateTime retrainTime;
    private String improvement;
    private Long lastExamRecordId;
    private Integer reminderCount;
    private Long assignerId;
    private String assignerName;
}

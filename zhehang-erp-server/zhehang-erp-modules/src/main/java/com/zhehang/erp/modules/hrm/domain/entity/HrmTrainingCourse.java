package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_course")
public class HrmTrainingCourse extends BaseEntity {
    private String courseCode;
    private String courseTitle;
    private String courseCategory;
    private Long sopId;
    private String sopTitle;
    private String sopVersion;
    private String applicablePositions;
    private String applicableStage;
    private String businessScenario;
    private String courseType;
    private String summary;
    private Integer learningMinutesRequired;
    private Integer credit;
    private Boolean requiredCourse;
    private Integer passScore;
    private Integer examDurationMinutes;
    private Boolean allowRetake;
    private Integer maxRetakeTimes;
    private Boolean certificationEnabled;
    private String certificationName;
    private Long ownerId;
    private String ownerName;
    private String lecturerName;
    private String versionNo;
    private Boolean enabled;
    private String courseStatus;
    private Integer usageCount;
    private LocalDateTime lastUsedTime;
}

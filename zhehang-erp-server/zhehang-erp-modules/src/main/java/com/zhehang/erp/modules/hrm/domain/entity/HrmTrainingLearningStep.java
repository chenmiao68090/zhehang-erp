package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_learning_step")
public class HrmTrainingLearningStep extends BaseEntity {
    private Long learningRecordId;
    private Long employeeId;
    private Long employeeUserId;
    private Long courseId;
    private String courseVersion;
    private Integer studyCycle;
    private Long materialId;
    private Integer stepIndex;
    private String stepType;
    private String source;
    private Boolean completed;
    private Integer positionSeconds;
    private LocalDateTime completedTime;
    private LocalDateTime lastSeenTime;
    private Integer durationSeconds;
    private String watchedRangesJson;
    private Integer validWatchedSeconds;
    private Integer coveragePercent;
    private String playbackSessionId;
    private LocalDateTime lastHeartbeatTime;
    private BigDecimal playbackRate;
    private String deviceType;
    private String completionReason;
}

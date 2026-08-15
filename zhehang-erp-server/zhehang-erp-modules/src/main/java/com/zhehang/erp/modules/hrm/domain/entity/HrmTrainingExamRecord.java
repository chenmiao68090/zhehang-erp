package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_exam_record")
public class HrmTrainingExamRecord extends BaseEntity {
    private Long learningRecordId;
    private Long employeeId;
    private String employeeName;
    private Long courseId;
    private String courseTitle;
    private String courseVersion;
    private Integer attemptNo;
    private Integer objectiveScore;
    private Integer thinkingScore;
    private Integer totalScore;
    private Integer passScore;
    private Boolean passed;
    private String manualReviewStatus;
    private LocalDateTime submittedTime;
    private LocalDateTime reviewedTime;
    private Long reviewerId;
    private String reviewerName;
    private String wrongQuestionsJson;
    private String improvement;
    private String status;
}

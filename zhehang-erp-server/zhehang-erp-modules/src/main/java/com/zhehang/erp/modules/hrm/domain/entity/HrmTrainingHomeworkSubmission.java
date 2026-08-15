package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_homework_submission")
public class HrmTrainingHomeworkSubmission extends BaseEntity {
    private Long homeworkId;
    private Long courseId;
    private Long learningRecordId;
    private Long employeeId;
    private String employeeName;
    private Long employeeUserId;
    private String submitContent;
    private Long attachmentFileId;
    private String attachmentName;
    private String status;
    private Integer score;
    private Boolean passed;
    private Long reviewerId;
    private String reviewerName;
    private String reviewerComment;
    private LocalDateTime submittedTime;
    private LocalDateTime reviewedTime;
}

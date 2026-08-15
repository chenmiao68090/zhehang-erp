package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_answer")
public class HrmTrainingAnswer extends BaseEntity {
    private Long examRecordId;
    private Long questionId;
    private String questionType;
    private String questionTitle;
    private String answerJson;
    private String standardAnswerJson;
    private Integer score;
    private Integer maxScore;
    private Boolean correctFlag;
    private String reviewerComment;
}

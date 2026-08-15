package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_exam_question")
public class HrmTrainingExamQuestion extends BaseEntity {
    private Long courseId;
    private String questionPosition;
    private String questionType;
    private String difficulty;
    private String questionTitle;
    private String optionsJson;
    private String answerJson;
    private String analysis;
    private Integer score;
    private String scoringStandard;
    private Integer sortOrder;
    private Boolean enabled;
}

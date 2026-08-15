package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_skill_course")
public class HrmTrainingSkillCourse extends BaseEntity {
    private Long skillId;
    private Long courseId;
    private String courseTitle;
    private Boolean requiredCourse;
    private Integer sortOrder;
}

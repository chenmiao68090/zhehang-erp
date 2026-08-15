package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_path_course")
public class HrmTrainingPathCourse extends BaseEntity {
    private Long pathId;
    private Long courseId;
    private String courseTitle;
    private Long prerequisiteCourseId;
    private Integer sortOrder;
    private Integer unlockDay;
    private Boolean requiredCourse;
}

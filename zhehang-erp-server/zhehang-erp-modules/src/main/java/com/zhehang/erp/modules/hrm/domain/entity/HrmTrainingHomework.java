package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_homework")
public class HrmTrainingHomework extends BaseEntity {
    private Long courseId;
    private String homeworkName;
    private String homeworkType;
    private String submitInstruction;
    private Long attachmentFileId;
    private String attachmentName;
    private Integer passScore;
    private Integer credit;
    private Boolean enabled;
    private Integer sortOrder;
}

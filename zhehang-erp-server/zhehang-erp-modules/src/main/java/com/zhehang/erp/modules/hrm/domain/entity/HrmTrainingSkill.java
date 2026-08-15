package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_skill")
public class HrmTrainingSkill extends BaseEntity {
    private String skillName;
    private String applicablePosition;
    private String skillCategory;
    private String requiredLevel;
    private String description;
    private Boolean enabled;
    private Integer sortOrder;
}

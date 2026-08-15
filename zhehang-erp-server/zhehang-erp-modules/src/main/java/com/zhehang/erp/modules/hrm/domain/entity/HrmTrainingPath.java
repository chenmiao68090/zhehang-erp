package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_path")
public class HrmTrainingPath extends BaseEntity {
    private String pathName;
    private String applicablePosition;
    private String description;
    private Boolean requiredPath;
    private Boolean enabled;
    private Long ownerId;
    private String ownerName;
    private String versionNo;
}

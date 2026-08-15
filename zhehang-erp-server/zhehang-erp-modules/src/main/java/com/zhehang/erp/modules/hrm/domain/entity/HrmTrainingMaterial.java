package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_material")
public class HrmTrainingMaterial extends BaseEntity {
    private Long courseId;
    private String materialType;
    private String materialName;
    private String materialUrl;
    private Long fileId;
    private String fileName;
    private String materialContent;
    private Integer durationMinutes;
    private Integer sortOrder;
    private Boolean requiredMaterial;
    private Boolean enabled;
    private String mediaProvider;
    private String providerMediaId;
    private String transcodeStatus;
    private Integer durationSeconds;
    private String coverUrl;
    private String subtitleUrl;
    private Integer minWatchPercent;
    private Boolean allowSpeed;
    private Boolean watermarkEnabled;
    private String playbackPolicy;
}

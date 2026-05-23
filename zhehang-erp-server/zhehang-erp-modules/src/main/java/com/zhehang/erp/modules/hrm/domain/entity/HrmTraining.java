package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training")
public class HrmTraining extends BaseEntity {
    private String title;
    private String trainer;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String location;
    private String content;
    private Integer maxParticipants;
    private Integer status;
}

package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_certification")
public class HrmTrainingCertification extends BaseEntity {
    private Long employeeId;
    private String employeeName;
    private String positionName;
    private Long courseId;
    private String courseTitle;
    private Long pathId;
    private String pathName;
    private String certificationName;
    private String status;
    private LocalDateTime certifiedTime;
    private LocalDateTime expireTime;
    private Integer bestScore;
}

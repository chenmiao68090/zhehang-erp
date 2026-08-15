package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_training_credit_log")
public class HrmTrainingCreditLog extends BaseEntity {
    private Long employeeId;
    private String employeeName;
    private String sourceType;
    private Long sourceId;
    private String sourceTitle;
    private Integer credit;
    private LocalDateTime grantTime;
    private String remark;
}

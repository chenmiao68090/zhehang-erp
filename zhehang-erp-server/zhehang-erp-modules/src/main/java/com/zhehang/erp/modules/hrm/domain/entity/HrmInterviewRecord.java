package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_interview_record")
public class HrmInterviewRecord extends BaseEntity {
    private Long resumeId;
    private Long recruitId;
    private String stage;
    private String result;
    private String interviewer;
    /** 面试官 userId(关联员工/账号);interviewer 保留姓名文本用于回显 */
    private Long interviewerId;
    private LocalDateTime interviewTime;
    private LocalDateTime nextInterviewTime;
    private String evaluation;
    private String rejectReason;
}

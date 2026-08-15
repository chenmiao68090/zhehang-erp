package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_resume")
public class HrmResume extends BaseEntity {
    private Long recruitId;
    private String positionName;
    private String name;
    private Integer age;
    private String phone;
    private String email;
    private String education;
    private Integer experienceYears;
    private String currentCompany;
    private BigDecimal expectedSalary;
    private String resumeUrl;
    private Long resumeFileId;
    private String resumeFileName;
    private String tags;
    private LocalDateTime firstInterviewTime;
    private Boolean needReInterview;
    private LocalDateTime reInterviewTime;
    private String interviewer;
    /** 面试官 userId(关联员工/账号);interviewer 保留姓名文本用于回显 */
    private Long interviewerId;
    private Integer status;
    private String evaluation;
    private String rejectReason;
    private String notJoinReason;
}

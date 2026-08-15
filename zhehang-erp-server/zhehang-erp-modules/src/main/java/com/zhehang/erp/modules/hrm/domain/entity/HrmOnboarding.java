package com.zhehang.erp.modules.hrm.domain.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.zhehang.erp.common.core.domain.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("hrm_onboarding")
public class HrmOnboarding extends BaseEntity {
    private Long resumeId;
    private Long recruitId;
    private Long employeeId;
    private String name;
    private String phone;
    private String email;
    private String positionName;
    /** 0待发登记 1已提交登记 2信息已确认 3Offer已生成 4Offer已发送 5员工草稿 6已入职 7取消 */
    private Integer status;
    private String formToken;
    private LocalDateTime tokenExpiresAt;
    private LocalDateTime tokenUsedTime;
    private Integer publicSubmitCount;
    private LocalDateTime publicLastSubmitTime;
    private String publicLastSubmitIp;
    private String formSchema;
    private String formData;
    private LocalDate expectedHireDate;
    private LocalDateTime submittedTime;
    private LocalDateTime confirmedTime;
    private String offerTemplate;
    private String offerContent;
    /** 0未发送 1已标记发送 2发送失败 */
    private Integer offerSendStatus;
    private LocalDateTime offerSentTime;
    private String offerSendError;
    private String remark;
}

package com.zhehang.erp.modules.crm.domain.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SalesAiDraftRequest {
    @NotNull
    @Positive
    private Long leadId;

    @Positive
    private Long callRecordId;

    @Size(max = 128)
    private String platformCallId;

    @Min(0)
    @Max(1)
    private Integer connected;

    @Size(max = 32)
    private String result;

    /** 当前员工已输入的草稿。它是不可信业务资料，不能改变服务端提示词。 */
    @Size(max = 2000)
    private String userNote;
}

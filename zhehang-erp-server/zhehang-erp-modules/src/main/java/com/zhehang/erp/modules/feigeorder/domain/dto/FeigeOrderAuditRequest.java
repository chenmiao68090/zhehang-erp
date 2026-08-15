package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeigeOrderAuditRequest {
    @NotBlank(message = "审核结果不能为空")
    @Pattern(regexp = "approved|rejected", message = "审核结果无效")
    private String result;

    @Size(max = 500, message = "审核意见不能超过500字")
    private String remark;
}

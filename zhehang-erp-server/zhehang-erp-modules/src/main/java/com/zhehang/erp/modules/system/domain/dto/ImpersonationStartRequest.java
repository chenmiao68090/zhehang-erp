package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ImpersonationStartRequest {

    @NotNull(message = "请选择要查看的员工")
    private Long targetUserId;

    @NotBlank(message = "请填写切换员工视角的原因")
    @Size(min = 2, max = 200, message = "切换原因需为2到200个字符")
    private String reason;

    /** 当前浏览器标签页标识，仅用于防止旧请求串入新身份。 */
    @NotBlank(message = "当前标签页标识缺失，请刷新后重试")
    @Size(max = 64, message = "标签页标识格式不正确")
    private String tabId;
}

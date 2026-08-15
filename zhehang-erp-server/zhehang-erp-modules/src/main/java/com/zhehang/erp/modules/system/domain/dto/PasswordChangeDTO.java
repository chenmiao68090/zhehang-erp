package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PasswordChangeDTO {
    @NotBlank(message = "原密码不能为空")
    @Size(max = 128, message = "原密码长度不能超过128位")
    private String oldPassword;
    @NotBlank(message = "新密码不能为空")
    @Size(min = 10, max = 128, message = "新密码长度必须为10至128位")
    private String newPassword;
}

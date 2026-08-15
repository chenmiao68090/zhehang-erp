package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PasswordResetDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
}

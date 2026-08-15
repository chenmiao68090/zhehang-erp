package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ImpersonationEndRequest {

    @Size(max = 200, message = "退出说明不能超过200个字符")
    private String reason;
}

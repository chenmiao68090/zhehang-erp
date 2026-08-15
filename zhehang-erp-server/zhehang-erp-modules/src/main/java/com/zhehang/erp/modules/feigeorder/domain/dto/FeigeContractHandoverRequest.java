package com.zhehang.erp.modules.feigeorder.domain.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FeigeContractHandoverRequest {
    private Long sourceStaffId;

    @NotNull(message = "目标服务人员不能为空")
    private Long targetStaffId;

    @NotBlank(message = "服务角色不能为空")
    private String serviceRole;
}

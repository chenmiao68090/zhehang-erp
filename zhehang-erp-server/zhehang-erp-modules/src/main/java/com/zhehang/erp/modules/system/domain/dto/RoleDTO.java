package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class RoleDTO {
    private Long id;
    @NotBlank(message = "角色名称不能为空")
    private String roleName;
    @NotBlank(message = "角色标识不能为空")
    private String roleKey;
    private Integer roleSort;
    private Integer status;
    private Integer dataScope;
    private String remark;
    private List<Long> menuIds;
}

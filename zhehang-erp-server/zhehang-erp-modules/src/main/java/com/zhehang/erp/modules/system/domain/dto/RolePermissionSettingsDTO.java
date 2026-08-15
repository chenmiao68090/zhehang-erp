package com.zhehang.erp.modules.system.domain.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/** 角色权限页原子保存参数。 */
@Data
public class RolePermissionSettingsDTO {

    @NotNull(message = "角色ID不能为空")
    private Long roleId;

    @NotNull(message = "数据范围不能为空")
    private Integer dataScope;

    /** 顶层模块路径，逗号分隔；null 表示不限制，空白字符串非法。 */
    private String visibleModules;

    /** 页面/按钮/API 权限所对应的完整菜单 ID 集合，必须与上述两项原子保存。 */
    @NotNull(message = "操作权限不能为空")
    private List<Long> menuIds;
}

package com.zhehang.erp.modules.system.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.entity.SysPermission;
import com.zhehang.erp.modules.system.service.ISysPermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 权限点（业务操作权限唯一可配置口径）。
 *
 * <p>仅提供查询（供角色编辑页勾选）；角色 ↔ 权限点的写入走
 * {@code SysRoleController} 的 /{roleId}/permissions 端点，与角色同事务。</p>
 */
@RestController
@RequestMapping("/system/permission")
@RequiredArgsConstructor
public class SysPermissionController {

    private final ISysPermissionService permissionService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<List<SysPermission>> list() {
        return R.ok(permissionService.listAll());
    }
}

package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.service.ISysRoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/system/role")
@RequiredArgsConstructor
public class SysRoleController {

    private final ISysRoleService roleService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasPermission('system:role:list')")
    public R<IPage<SysRole>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String roleName,
            @RequestParam(required = false) String roleKey,
            @RequestParam(required = false) Integer status) {
        return R.ok(roleService.selectRolePage(pageNum, pageSize, roleName, roleKey, status));
    }

    @GetMapping("/all")
    @PreAuthorize("@perm.hasPermission('system:role:list')")
    public R<List<SysRole>> all() {
        return R.ok(roleService.list(
                new LambdaQueryWrapper<SysRole>()
                        .eq(SysRole::getStatus, 0)
                        .orderByAsc(SysRole::getRoleSort)
        ));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:role:query')")
    public R<SysRole> getInfo(@PathVariable Long id) {
        return R.ok(roleService.getById(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasPermission('system:role:add')")
    @Log(module = "角色管理", type = Log.OperationType.INSERT)
    public R<Void> add(@Valid @RequestBody RoleDTO dto) {
        roleService.createRole(dto);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@Valid @RequestBody RoleDTO dto) {
        roleService.updateRole(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:role:remove')")
    @Log(module = "角色管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        roleService.deleteRole(id);
        return R.ok();
    }

    @PutMapping("/{roleId}/menus")
    @PreAuthorize("@perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> assignMenus(@PathVariable Long roleId, @RequestBody List<Long> menuIds) {
        roleService.assignMenus(roleId, menuIds);
        return R.ok();
    }

    @PutMapping("/dataScope")
    @PreAuthorize("@perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> dataScope(@RequestBody Map<String, Object> params) {
        Long roleId = Long.valueOf(params.get("roleId").toString());
        Integer dataScope = Integer.valueOf(params.get("dataScope").toString());
        roleService.updateDataScope(roleId, dataScope);
        return R.ok();
    }
}

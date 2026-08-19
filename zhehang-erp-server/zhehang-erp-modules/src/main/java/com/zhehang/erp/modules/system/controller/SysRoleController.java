package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.dto.RoleDTO;
import com.zhehang.erp.modules.system.domain.dto.RolePermissionSettingsDTO;
import com.zhehang.erp.modules.system.domain.entity.SysRole;
import com.zhehang.erp.modules.system.service.ISysPermissionService;
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
    private final ISysPermissionService permissionService;

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
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<SysRole> getInfo(@PathVariable Long id) {
        return R.ok(roleService.getRoleDetail(id));
    }

    @PostMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:add')")
    @Log(module = "角色管理", type = Log.OperationType.INSERT)
    public R<Void> add(@Valid @RequestBody RoleDTO dto) {
        roleService.createRole(dto);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@Valid @RequestBody RoleDTO dto) {
        roleService.updateRole(dto);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:remove')")
    @Log(module = "角色管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        roleService.deleteRole(id);
        return R.ok();
    }

    /** 唯一权限写入端点：数据范围、页面可见性、按钮/API 权限同事务生效。 */
    @PutMapping("/permissionSettings")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> permissionSettings(@Valid @RequestBody RolePermissionSettingsDTO dto) {
        roleService.updatePermissionSettings(dto);
        return R.ok();
    }

    // ===== 业务权限点（唯一可配置口径，阶段2：仅登记，未接入业务判断） =====

    /** 查某角色已关联的业务权限点 ID。 */
    @GetMapping("/{roleId}/permissions")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<List<Long>> rolePermissions(@PathVariable Long roleId) {
        return R.ok(permissionService.listPermissionIdsByRoleId(roleId));
    }

    /** 全量覆盖某角色的业务权限点关联（先删后插，同事务）。 */
    @PutMapping("/{roleId}/permissions")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.UPDATE)
    public R<Void> saveRolePermissions(@PathVariable Long roleId, @RequestBody Map<String, Object> params) {
        Object raw = params.get("permissionIds");
        List<Long> permissionIds = new java.util.ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                if (o != null) {
                    permissionIds.add(Long.valueOf(o.toString()));
                }
            }
        }
        permissionService.saveRolePermissions(roleId, permissionIds);
        return R.ok();
    }

    // ===== 角色成员(给角色分配对应人员) =====

    /** 查角色已绑定的成员列表 */
    @GetMapping("/{roleId}/members")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<List<Map<String, Object>>> members(@PathVariable Long roleId) {
        return R.ok(roleService.listRoleMembers(roleId));
    }

    /** 候选员工列表(挑人加入角色用;keyword 支持昵称/账号/手机模糊) */
    @GetMapping("/candidates")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<List<Map<String, Object>>> candidates(@RequestParam(required = false) String keyword) {
        return R.ok(roleService.listMemberCandidates(keyword));
    }

    /** 批量把用户加入角色 */
    @PostMapping("/{roleId}/members")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.INSERT)
    public R<Integer> addMembers(@PathVariable Long roleId, @RequestBody Map<String, Object> params) {
        Object raw = params.get("userIds");
        List<Long> userIds = new java.util.ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                if (o != null) {
                    userIds.add(Long.valueOf(o.toString()));
                }
            }
        }
        if (userIds.isEmpty()) {
            return R.fail("请选择要加入的人员");
        }
        return R.ok(roleService.addRoleMembers(roleId, userIds));
    }

    /** 把某用户移出角色 */
    @DeleteMapping("/{roleId}/members/{userId}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:edit')")
    @Log(module = "角色管理", type = Log.OperationType.DELETE)
    public R<Void> removeMember(@PathVariable Long roleId, @PathVariable Long userId) {
        roleService.removeRoleMember(roleId, userId);
        return R.ok();
    }
}

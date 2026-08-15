package com.zhehang.erp.modules.system.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.vo.MenuTreeVO;
import com.zhehang.erp.modules.system.domain.vo.RouterVO;
import com.zhehang.erp.modules.system.service.ISysMenuService;
import com.zhehang.erp.modules.system.service.ISysRoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/system/menu")
@RequiredArgsConstructor
public class SysMenuController {

    private final ISysMenuService menuService;
    private final ISysRoleService roleService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:list')")
    public R<List<SysMenu>> list(@RequestParam(required = false) String menuName, @RequestParam(required = false) Integer status) {
        return R.ok(menuService.selectMenuList(menuName, status));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:query')")
    public R<SysMenu> getInfo(@PathVariable Long id) {
        return R.ok(menuService.getById(id));
    }

    @GetMapping("/tree")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:list')")
    public R<List<MenuTreeVO>> tree() {
        return R.ok(menuService.selectMenuTree());
    }

    @GetMapping("/tree/role/{roleId}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:role:query')")
    public R<Map<String, Object>> roleMenuTree(@PathVariable Long roleId) {
        // 先通过带租户条件的角色详情查询确认目标归属，
        // 再读无 tenant_id 的 sys_role_menu 关联表，防止改 roleId 枚举其他租户权限。
        roleService.getRoleDetail(roleId);
        Map<String, Object> data = new HashMap<>();
        data.put("menus", menuService.selectMenuTree());
        data.put("menuIds", menuService.selectMenuIdsByRoleId(roleId));
        data.put("checkedKeys", menuService.selectCheckedMenuIdsByRoleId(roleId));
        return R.ok(data);
    }

    @GetMapping({"/routers", "/routes"})
    public R<List<RouterVO>> getRouters() {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.ok(menuService.buildRouters(userId));
    }

    @PostMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:add')")
    @Log(module = "菜单管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SysMenu menu) {
        menuService.createMenu(menu);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:edit')")
    @Log(module = "菜单管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SysMenu menu) {
        menuService.updateMenu(menu);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasAnyRole('boss', 'super_admin') and @perm.hasPermission('system:menu:remove')")
    @Log(module = "菜单管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return R.ok();
    }
}

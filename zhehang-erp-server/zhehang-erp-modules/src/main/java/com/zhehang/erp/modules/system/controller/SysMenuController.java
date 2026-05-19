package com.zhehang.erp.modules.system.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.system.domain.entity.SysMenu;
import com.zhehang.erp.modules.system.domain.vo.MenuTreeVO;
import com.zhehang.erp.modules.system.domain.vo.RouterVO;
import com.zhehang.erp.modules.system.service.ISysMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/system/menu")
@RequiredArgsConstructor
public class SysMenuController {

    private final ISysMenuService menuService;

    @GetMapping("/list")
    @PreAuthorize("@perm.hasPermission('system:menu:list')")
    public R<List<SysMenu>> list(@RequestParam(required = false) String menuName, @RequestParam(required = false) Integer status) {
        return R.ok(menuService.selectMenuList(menuName, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:menu:query')")
    public R<SysMenu> getInfo(@PathVariable Long id) {
        return R.ok(menuService.getById(id));
    }

    @GetMapping("/tree")
    public R<List<MenuTreeVO>> tree() {
        return R.ok(menuService.selectMenuTree());
    }

    @GetMapping("/tree/role/{roleId}")
    public R<List<MenuTreeVO>> roleMenuTree(@PathVariable Long roleId) {
        return R.ok(menuService.selectMenuTreeByRoleId(roleId));
    }

    @GetMapping("/routers")
    public R<List<RouterVO>> getRouters() {
        Long userId = SecurityUtils.getCurrentUserId();
        return R.ok(menuService.buildRouters(userId));
    }

    @PostMapping
    @PreAuthorize("@perm.hasPermission('system:menu:add')")
    @Log(module = "菜单管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SysMenu menu) {
        menuService.createMenu(menu);
        return R.ok();
    }

    @PutMapping
    @PreAuthorize("@perm.hasPermission('system:menu:edit')")
    @Log(module = "菜单管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SysMenu menu) {
        menuService.updateMenu(menu);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@perm.hasPermission('system:menu:remove')")
    @Log(module = "菜单管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        menuService.deleteMenu(id);
        return R.ok();
    }
}

package com.zhehang.erp.security.service;

import com.zhehang.erp.security.domain.LoginUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

@Service("perm")
public class PermissionService {

    public boolean hasPermission(String permission) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            return false;
        }
        if (loginUser.isAdmin() || Long.valueOf(1L).equals(loginUser.getUserId())) {
            return true;
        }
        if (CollectionUtils.isEmpty(loginUser.getPermissions())) {
            return false;
        }
        return loginUser.getPermissions().contains("*:*:*") || loginUser.getPermissions().contains(permission);
    }

    public boolean hasAnyPermission(String... permissions) {
        for (String permission : permissions) {
            if (hasPermission(permission)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 管理接口的角色门禁。唯一超级管理员直接放行，其余用户按角色标识判断。
     * 复制角色标识形如 dept_manager__xxxx，按模板角色 dept_manager 处理。
     */
    public boolean hasAnyRole(String... roleKeys) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            return false;
        }
        if (loginUser.isAdmin() || Long.valueOf(1L).equals(loginUser.getUserId())) {
            return true;
        }
        if (roleKeys == null || roleKeys.length == 0 || CollectionUtils.isEmpty(loginUser.getRoleKeys())) {
            return false;
        }
        for (String owned : loginUser.getRoleKeys()) {
            if (owned == null || owned.isBlank()) {
                continue;
            }
            int separator = owned.indexOf("__");
            String base = separator > 0 ? owned.substring(0, separator) : owned;
            String effective = separator > 0 && !isPrivilegedRole(base) ? base : owned;
            for (String expected : roleKeys) {
                if (owned.equals(expected) || effective.equals(expected)) {
                    return true;
                }
            }
        }
        return false;
    }

    private boolean isPrivilegedRole(String roleKey) {
        return "admin".equals(roleKey) || "super_admin".equals(roleKey)
                || "sys_admin".equals(roleKey) || "boss".equals(roleKey);
    }

    /**
     * 模块级权限:用户是否拥有该模块的任意权限(perms 以 "module:" 开头)。
     * admin / *:*:* 直接放行。用于给整个业务模块的 controller 做粗粒度拦截。
     */
    public boolean hasModule(String module) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof LoginUser loginUser)) {
            return false;
        }
        if (loginUser.isAdmin() || Long.valueOf(1L).equals(loginUser.getUserId())) {
            return true;
        }
        if (CollectionUtils.isEmpty(loginUser.getPermissions())) {
            return false;
        }
        if (loginUser.getPermissions().contains("*:*:*")) {
            return true;
        }
        String prefix = module + ":";
        return loginUser.getPermissions().stream().anyMatch(p -> p != null && p.startsWith(prefix));
    }
}

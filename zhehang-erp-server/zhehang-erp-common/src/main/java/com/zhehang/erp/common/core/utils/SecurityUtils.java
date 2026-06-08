package com.zhehang.erp.common.core.utils;

import com.zhehang.erp.common.core.domain.AuthUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class SecurityUtils {

    private static final BCryptPasswordEncoder ENCODER = new BCryptPasswordEncoder();

    private static AuthUser currentAuthUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthUser authUser) {
            return authUser;
        }
        return null;
    }

    public static Long getCurrentUserId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getUserId() : null;
    }

    public static Long getCurrentTenantId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getTenantId() : null;
    }

    /** 当前用户所属部门 ID(未登录或未设置时为 null) */
    public static Long getCurrentDeptId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getDeptId() : null;
    }

    /** 当前数据范围(1全部 2自定义 3本部门 4本部门及以下 5本人);未取到时为 null,调用方按最严格(本人)兜底 */
    public static Integer getCurrentDataScope() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getDataScope() : null;
    }

    /** 是否管理员(看全部)。兼容旧 token:userId==1 或 username==admin 也视为管理员 */
    public static boolean isCurrentAdmin() {
        AuthUser authUser = currentAuthUser();
        if (authUser == null) {
            return false;
        }
        if (authUser.isAdmin()) {
            return true;
        }
        return Long.valueOf(1L).equals(authUser.getUserId()) || "admin".equals(authUser.getUsername());
    }

    /** 当前用户角色标识列表(未取到时空列表) */
    public static java.util.List<String> getCurrentRoleKeys() {
        AuthUser authUser = currentAuthUser();
        java.util.List<String> keys = authUser != null ? authUser.getRoleKeys() : null;
        return keys != null ? keys : java.util.Collections.emptyList();
    }

    /** 当前用户是否拥有指定角色中的任意一个 */
    public static boolean hasAnyRole(String... roleKeys) {
        if (roleKeys == null || roleKeys.length == 0) {
            return false;
        }
        java.util.List<String> mine = getCurrentRoleKeys();
        for (String r : roleKeys) {
            if (mine.contains(r)) {
                return true;
            }
        }
        return false;
    }

    public static String getCurrentUsername() {
        AuthUser authUser = currentAuthUser();
        if (authUser != null) {
            return authUser.getUsername();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    public static String encryptPassword(String password) {
        return ENCODER.encode(password);
    }

    public static boolean matchesPassword(String rawPassword, String encodedPassword) {
        return ENCODER.matches(rawPassword, encodedPassword);
    }
}
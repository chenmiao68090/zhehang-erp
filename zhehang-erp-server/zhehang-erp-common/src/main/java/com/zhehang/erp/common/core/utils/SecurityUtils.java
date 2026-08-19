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

    /** 当前 SecurityContext 是否已绑定系统登录用户。 */
    public static boolean hasAuthenticatedUser() {
        return currentAuthUser() != null;
    }

    public static Long getCurrentUserId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getUserId() : null;
    }

    /** 当前参与权限与数据范围判断的用户 ID；等价于现有 currentUserId 语义。 */
    public static Long getCurrentEffectiveUserId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getEffectiveUserId() : null;
    }

    /**
     * 实际操作人 ID。普通登录等于当前用户 ID；代登录时与 effective 用户分离，
     * 供安全门禁和审计使用，业务数据查询不得使用它代替 {@link #getCurrentUserId()}。
     */
    public static Long getCurrentActorUserId() {
        AuthUser authUser = currentAuthUser();
        if (authUser == null) {
            return null;
        }
        Long actorUserId = authUser.getActorUserId();
        return actorUserId != null ? actorUserId : authUser.getUserId();
    }

    /** 当前请求是否处于代登录状态。 */
    public static boolean isImpersonating() {
        AuthUser authUser = currentAuthUser();
        return authUser != null && authUser.isImpersonating();
    }

    /** 当前代登录审计会话 ID；普通登录为 null。 */
    public static String getCurrentImpersonationSessionId() {
        AuthUser authUser = currentAuthUser();
        return authUser != null ? authUser.getImpersonationSessionId() : null;
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

    /** 是否管理员(看全部)：仅认证快照中的唯一超管口径或平台根账号 userId=1。 */
    public static boolean isCurrentAdmin() {
        AuthUser authUser = currentAuthUser();
        if (authUser == null) {
            return false;
        }
        if (authUser.isAdmin()) {
            return true;
        }
        return Long.valueOf(1L).equals(authUser.getUserId());
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
        for (String owned : mine) {
            if (owned == null || owned.isBlank()) {
                continue;
            }
            // 普通模板复制角色继承模板语义；老板/超管等特权角色禁止通过前缀继承。
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

    /** 当前用户是否拥有指定权限点(超管/全权限通配符直接放行)。 */
    public static boolean hasPermission(String permission) {
        if (isCurrentAdmin()) {
            return true;
        }
        AuthUser authUser = currentAuthUser();
        if (authUser == null || permission == null) {
            return false;
        }
        java.util.Set<String> perms = authUser.getPermissions();
        if (perms == null) {
            return false;
        }
        return perms.contains("*:*:*") || perms.contains(permission);
    }

    /**
     * 是否允许维护租户内唯一最高角色及账号安全。
     * 平台账号和持有精确 super_admin 角色的真实登录人可操作；代登录一律拒绝。
     */
    public static boolean canManageTenantSuperAdmin() {
        if (isImpersonating()) {
            return false;
        }
        if (Long.valueOf(1L).equals(getCurrentUserId())) {
            return true;
        }
        return getCurrentRoleKeys().stream().anyMatch("super_admin"::equals);
    }

    private static boolean isPrivilegedRole(String roleKey) {
        return "admin".equals(roleKey) || "super_admin".equals(roleKey)
                || "sys_admin".equals(roleKey) || "boss".equals(roleKey);
    }

    public static String getCurrentUsername() {
        AuthUser authUser = currentAuthUser();
        if (authUser != null) {
            return authUser.getUsername();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null ? authentication.getName() : null;
    }

    /** 实际操作人账号名；业务展示当前员工时仍应使用 {@link #getCurrentUsername()}。 */
    public static String getCurrentActorUsername() {
        AuthUser authUser = currentAuthUser();
        if (authUser == null) {
            return getCurrentUsername();
        }
        String actorUsername = authUser.getActorUsername();
        return actorUsername != null ? actorUsername : authUser.getUsername();
    }

    public static String encryptPassword(String password) {
        return ENCODER.encode(password);
    }

    public static boolean matchesPassword(String rawPassword, String encodedPassword) {
        return ENCODER.matches(rawPassword, encodedPassword);
    }
}

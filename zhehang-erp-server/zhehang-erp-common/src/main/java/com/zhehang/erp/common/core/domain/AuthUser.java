package com.zhehang.erp.common.core.domain;

/**
 * 当前登录用户在 common 层的抽象。
 *
 * <p>SecurityUtils 位于 common 模块,无法依赖 security 模块的 LoginUser(会形成循环依赖)。
 * 通过本接口让 security 的 LoginUser 实现它,使 common 能从 SecurityContext 的 principal
 * 中安全地取出 userId / tenantId / username。</p>
 */
public interface AuthUser {

    /** 当前用户 ID */
    Long getUserId();

    /** 当前租户 ID(未启用多租户时可为 null) */
    Long getTenantId();

    /** 当前用户名 */
    String getUsername();

    /** 当前用户所属部门 ID(未设置时可为 null) */
    Long getDeptId();

    /** 数据范围(1全部 2自定义 3本部门 4本部门及以下 5本人);多角色取范围最大者(数值最小)。可为 null */
    Integer getDataScope();

    /** 是否管理员(看全部数据,数据权限直接放行) */
    boolean isAdmin();

    /** 当前用户角色标识列表(如 sales/finance/dept_manager);用于角色感知的数据范围。可为 null */
    java.util.List<String> getRoleKeys();

    /**
     * 实际发起请求的账号 ID。普通登录与 {@link #getUserId()} 相同；
     * 代登录时为固定平台超级管理员，{@link #getUserId()} 仍表示被查看员工。
     */
    default Long getActorUserId() {
        return getUserId();
    }

    /** 当前真正参与权限与数据范围判断的用户 ID。 */
    default Long getEffectiveUserId() {
        return getUserId();
    }

    /** 实际发起请求的账号名；普通登录回退为当前账号名。 */
    default String getActorUsername() {
        return getUsername();
    }

    /** 当前请求是否来自独立的代登录会话。 */
    default boolean isImpersonating() {
        return false;
    }

    /** 代登录审计会话 ID；普通登录为 null。 */
    default String getImpersonationSessionId() {
        return null;
    }
}

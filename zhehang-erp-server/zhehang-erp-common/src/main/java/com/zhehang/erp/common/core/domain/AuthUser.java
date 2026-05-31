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
}

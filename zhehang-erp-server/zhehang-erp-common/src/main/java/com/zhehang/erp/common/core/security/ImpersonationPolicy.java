package com.zhehang.erp.common.core.security;

import java.util.Objects;

/**
 * 员工视角的固定账号安全边界。
 *
 * <p>授权主体只认老板当前实际登录账号 userId=3，不读取角色名或前端状态。
 * 平台根账号 userId=1 与授权主体本身都不得成为代登录目标。</p>
 */
public final class ImpersonationPolicy {

    public static final long PLATFORM_ROOT_USER_ID = 1L;
    public static final long AUTHORIZED_ACTOR_USER_ID = 3L;

    private ImpersonationPolicy() {
    }

    public static boolean isAuthorizedActor(Long userId) {
        return Objects.equals(userId, AUTHORIZED_ACTOR_USER_ID);
    }

    public static boolean isForbiddenTarget(Long userId) {
        return userId == null
                || Objects.equals(userId, PLATFORM_ROOT_USER_ID)
                || Objects.equals(userId, AUTHORIZED_ACTOR_USER_ID);
    }
}

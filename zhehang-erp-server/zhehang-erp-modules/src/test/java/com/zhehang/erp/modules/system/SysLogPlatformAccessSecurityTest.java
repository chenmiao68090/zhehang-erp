package com.zhehang.erp.modules.system;

import com.zhehang.erp.modules.system.controller.SysLogController;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class SysLogPlatformAccessSecurityTest {

    private static final String PLATFORM_ADMIN_ONLY =
            "T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())";

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void globalLogsUseExactPlatformAccountGate() {
        PreAuthorize annotation = SysLogController.class.getAnnotation(PreAuthorize.class);

        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(PLATFORM_ADMIN_ONLY);
    }

    @Test
    void tenantBossIsRejectedEvenWhenMarkedAdminButUserOnePasses() {
        PreAuthorize annotation = SysLogController.class.getAnnotation(PreAuthorize.class);
        SpelExpressionParser parser = new SpelExpressionParser();

        login(32L, true, List.of("boss"));
        assertThat(parser.parseExpression(annotation.value()).getValue(Boolean.class)).isFalse();

        login(1L, false, List.of());
        assertThat(parser.parseExpression(annotation.value()).getValue(Boolean.class)).isTrue();
    }

    private void login(Long userId, boolean admin, List<String> roles) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("test-" + userId);
        loginUser.setAdmin(admin);
        loginUser.setTenantId(7L);
        loginUser.setRoleKeys(roles);
        loginUser.setPermissions(Set.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities()));
    }
}

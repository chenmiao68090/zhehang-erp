package com.zhehang.erp.common.config;

import com.zhehang.erp.security.domain.LoginUser;
import net.sf.jsqlparser.expression.LongValue;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ErpTenantHandlerSecurityTest {

    private final ErpTenantHandler handler = new ErpTenantHandler();

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void authenticatedUserWithoutTenantFailsClosedInsteadOfReadingAllRows() {
        login(18L, null);

        assertThat(handler.ignoreTable("sys_user")).isFalse();
        assertThatThrownBy(handler::getTenantId)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("缺少租户");
    }

    @Test
    void authenticatedTenantIsAppliedAndAssociationTablesRemainExplicitlyIgnored() {
        login(19L, 7L);

        assertThat(handler.ignoreTable("sys_user")).isFalse();
        assertThat(handler.ignoreTable("sys_impersonation_session")).isFalse();
        assertThat(handler.ignoreTable("sys_user_role")).isTrue();
        assertThat(handler.ignoreTable("biz_call_record")).isFalse();
        assertThat(handler.ignoreTable("biz_wechat_chat")).isFalse();
        assertThat(handler.getTenantId()).isInstanceOf(LongValue.class);
        assertThat(((LongValue) handler.getTenantId()).getValue()).isEqualTo(7L);
    }

    @Test
    void unauthenticatedLoginLookupCanRunWithoutTenantContext() {
        assertThat(handler.ignoreTable("sys_user")).isTrue();
    }

    private void login(Long userId, Long tenantId) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("user-" + userId);
        loginUser.setTenantId(tenantId);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, List.of()));
    }
}

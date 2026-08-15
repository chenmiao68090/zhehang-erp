package com.zhehang.erp.modules.im.realtime;

import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.access.AccessDeniedException;

import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImRealtimeTicketServiceImpersonationTest {

    @Mock
    private StringRedisTemplate redisTemplate;
    @Mock
    private ValueOperations<String, String> valueOperations;
    @Mock
    private TokenService tokenService;

    private ImRealtimeTicketService ticketService;

    @BeforeEach
    void setUp() {
        ticketService = new ImRealtimeTicketService(redisTemplate, tokenService);
    }

    @Test
    void refusesToIssueRealtimeTicketForImpersonatedLogin() {
        LoginUser loginUser = impersonatedLogin();
        when(tokenService.getLoginUser("imp-token")).thenReturn(loginUser);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer imp-token");

        assertThatThrownBy(() -> ticketService.issue(request))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("私人消息");

        verifyNoInteractions(redisTemplate);
    }

    @Test
    void refusesToConsumePreviouslyIssuedTicketWithImpersonatedSnapshot() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.getAndDelete("im:ws:ticket:one-time-ticket"))
                .thenReturn("imp-token");
        when(tokenService.getLoginUser("imp-token")).thenReturn(impersonatedLogin());

        assertThat(ticketService.consume("one-time-ticket")).isNull();

        verify(valueOperations).getAndDelete("im:ws:ticket:one-time-ticket");
    }

    @Test
    void keepsOrdinaryRealtimeTicketFlowAvailable() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(27L);
        loginUser.setTenantId(9L);
        when(tokenService.getLoginUser("normal-token")).thenReturn(loginUser);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer normal-token");

        String ticket = ticketService.issue(request);

        assertThat(ticket).hasSize(32);
        verify(valueOperations).set(
                "im:ws:ticket:" + ticket, "normal-token", 60L, TimeUnit.SECONDS);
    }

    private LoginUser impersonatedLogin() {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(27L);
        loginUser.setTenantId(9L);
        loginUser.setActorUserId(3L);
        loginUser.setImpersonationSessionId("imp-session-1");
        return loginUser;
    }
}

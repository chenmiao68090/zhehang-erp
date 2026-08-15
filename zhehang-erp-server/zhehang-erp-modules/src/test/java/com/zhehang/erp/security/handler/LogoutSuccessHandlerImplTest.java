package com.zhehang.erp.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.security.service.RefreshTokenCookieService;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.ArgumentMatchers.same;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LogoutSuccessHandlerImplTest {

    @Test
    void actualSpringLogoutHandlerPassesRefreshTokenForLegacyPairCleanup() throws Exception {
        TokenService tokenService = mock(TokenService.class);
        RefreshTokenCookieService cookieService = mock(RefreshTokenCookieService.class);
        LogoutSuccessHandlerImpl handler = new LogoutSuccessHandlerImpl(tokenService, cookieService, new ObjectMapper());
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContentType("application/json");
        request.setContent("{\"refreshToken\":\"legacy-refresh\"}".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();
        when(cookieService.preferCookie(same(request), eq("legacy-refresh")))
                .thenReturn("legacy-refresh");

        handler.onLogoutSuccess(request, response, null);

        verify(tokenService).removeToken(same(request), eq("legacy-refresh"));
        verify(cookieService).clear(same(response));
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).contains("登出成功");
    }

    @Test
    void malformedLogoutBodyStillRevokesAuthorizationSession() throws Exception {
        TokenService tokenService = mock(TokenService.class);
        RefreshTokenCookieService cookieService = mock(RefreshTokenCookieService.class);
        LogoutSuccessHandlerImpl handler = new LogoutSuccessHandlerImpl(tokenService, cookieService, new ObjectMapper());
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setContentType("application/json");
        request.setContent("not-json".getBytes(StandardCharsets.UTF_8));
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.onLogoutSuccess(request, response, null);

        verify(tokenService).removeToken(same(request), isNull());
        assertThat(response.getStatus()).isEqualTo(200);
    }

    @Test
    void semanticRevocationFailureStillClearsCookieAndReturnsUnavailable() throws Exception {
        TokenService tokenService = mock(TokenService.class);
        RefreshTokenCookieService cookieService = mock(RefreshTokenCookieService.class);
        LogoutSuccessHandlerImpl handler = new LogoutSuccessHandlerImpl(tokenService, cookieService, new ObjectMapper());
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        doThrow(new IllegalStateException("redis unavailable"))
                .when(tokenService).removeToken(same(request), isNull());

        handler.onLogoutSuccess(request, response, null);

        verify(cookieService).clear(same(response));
        assertThat(response.getStatus()).isEqualTo(503);
        assertThat(response.getContentAsString())
                .contains("退出未完全完成")
                .doesNotContain("redis unavailable")
                .doesNotContain("登出成功");
    }
}

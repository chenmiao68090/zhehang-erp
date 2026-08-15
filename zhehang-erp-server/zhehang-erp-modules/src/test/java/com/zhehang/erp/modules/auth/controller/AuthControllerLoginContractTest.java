package com.zhehang.erp.modules.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.modules.auth.service.AccountSecurityService;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.system.service.ISysLogService;
import com.zhehang.erp.modules.system.service.ISysRoleService;
import com.zhehang.erp.modules.system.service.ISysUserService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.LoginService;
import com.zhehang.erp.security.service.RefreshTokenCookieService;
import com.zhehang.erp.security.service.TokenService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AuthControllerLoginContractTest {

    private static final String REFRESH_COOKIE_NAME = "zhehang_refresh";
    private static final String REFRESH_COOKIE_PATH = "/api/auth";
    private static final int REFRESH_COOKIE_MAX_AGE_SECONDS = 604800;
    private static final String ACCESS_TOKEN = "contract-test-access-token";
    private static final String REFRESH_TOKEN = "contract-test-refresh-token";

    @Test
    void authenticatedLoginReturnsOnlyAccessTokenAndMovesRefreshTokenToSecureCookie() throws Exception {
        LoginService loginService = mock(LoginService.class);
        AccountSecurityService accountSecurityService = mock(AccountSecurityService.class);
        TokenService tokenService = mock(TokenService.class);
        RefreshTokenCookieService cookieService = productionCookieService();
        ISysUserService userService = mock(ISysUserService.class);
        ISysLogService logService = mock(ISysLogService.class);
        SysUserMapper userMapper = mock(SysUserMapper.class);
        OrgEmployeeMapper employeeMapper = mock(OrgEmployeeMapper.class);
        ISysRoleService roleService = mock(ISysRoleService.class);

        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(9001L);
        loginUser.setUsername("contract-test-user");

        Map<String, Object> serviceResult = new LinkedHashMap<>();
        serviceResult.put("action", AccountSecurityService.ACTION_AUTHENTICATED);
        serviceResult.put("accessToken", ACCESS_TOKEN);
        serviceResult.put("refreshToken", REFRESH_TOKEN);

        when(loginService.authenticate(eq("contract-test-user"), eq("not-a-real-password")))
                .thenReturn(loginUser);
        when(accountSecurityService.continueAfterPassword(loginUser)).thenReturn(serviceResult);

        AuthController controller = new AuthController(
                loginService,
                accountSecurityService,
                tokenService,
                cookieService,
                userService,
                logService,
                userMapper,
                employeeMapper,
                roleService);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
        ObjectMapper objectMapper = new ObjectMapper();

        MvcResult result = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "username", "contract-test-user",
                                "password", "not-a-real-password"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.action")
                        .value(AccountSecurityService.ACTION_AUTHENTICATED))
                .andExpect(jsonPath("$.data.accessToken").value(ACCESS_TOKEN))
                .andExpect(cookie().value(REFRESH_COOKIE_NAME, REFRESH_TOKEN))
                .andExpect(cookie().path(REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH))
                .andExpect(cookie().maxAge(REFRESH_COOKIE_NAME, REFRESH_COOKIE_MAX_AGE_SECONDS))
                .andExpect(cookie().secure(REFRESH_COOKIE_NAME, true))
                .andExpect(cookie().httpOnly(REFRESH_COOKIE_NAME, true))
                .andExpect(cookie().sameSite(REFRESH_COOKIE_NAME, "Strict"))
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        var data = objectMapper.readTree(responseBody).path("data");
        assertThat(data.isObject()).isTrue();
        assertThat(data.size()).isEqualTo(2);
        assertThat(data.has("action")).isTrue();
        assertThat(data.has("accessToken")).isTrue();
        assertThat(data.has("refreshToken")).isFalse();
        assertThat(responseBody).doesNotContain(REFRESH_TOKEN);

        assertThat(result.getResponse().getHeaders(HttpHeaders.SET_COOKIE)).hasSize(1);
        assertThat(result.getResponse().getCookie(REFRESH_COOKIE_NAME)).isNotNull();
        assertThat(result.getResponse().getCookie(REFRESH_COOKIE_NAME).getDomain()).isNull();
    }

    private RefreshTokenCookieService productionCookieService() {
        RefreshTokenCookieService service = new RefreshTokenCookieService();
        ReflectionTestUtils.setField(service, "cookieName", REFRESH_COOKIE_NAME);
        ReflectionTestUtils.setField(service, "cookiePath", REFRESH_COOKIE_PATH);
        ReflectionTestUtils.setField(service, "secure", true);
        ReflectionTestUtils.setField(service, "sameSite", "Strict");
        ReflectionTestUtils.setField(service, "refreshTokenExpiration", 604800000L);
        return service;
    }
}

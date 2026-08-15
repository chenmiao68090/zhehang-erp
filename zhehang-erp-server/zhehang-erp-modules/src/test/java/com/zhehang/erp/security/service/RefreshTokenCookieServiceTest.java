package com.zhehang.erp.security.service;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class RefreshTokenCookieServiceTest {

    @Test
    void writesHttpOnlySecureStrictCookieAndClearsIt() {
        RefreshTokenCookieService service = configured(true);
        MockHttpServletResponse response = new MockHttpServletResponse();

        service.write(response, "server-only-refresh");

        assertThat(response.getHeader("Set-Cookie"))
                .contains("zhehang_refresh=server-only-refresh")
                .contains("Path=/api/auth")
                .contains("HttpOnly")
                .contains("Secure")
                .contains("SameSite=Strict")
                .doesNotContain("Domain=");

        MockHttpServletResponse cleared = new MockHttpServletResponse();
        service.clear(cleared);
        assertThat(cleared.getHeader("Set-Cookie")).contains("Max-Age=0");
    }

    @Test
    void cookieWinsOverLegacyBodyToken() {
        RefreshTokenCookieService service = configured(false);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setCookies(new Cookie("zhehang_refresh", "cookie-token"));

        assertThat(service.preferCookie(request, "legacy-body-token")).isEqualTo("cookie-token");
    }

    private RefreshTokenCookieService configured(boolean secure) {
        RefreshTokenCookieService service = new RefreshTokenCookieService();
        ReflectionTestUtils.setField(service, "cookieName", "zhehang_refresh");
        ReflectionTestUtils.setField(service, "cookiePath", "/api/auth");
        ReflectionTestUtils.setField(service, "secure", secure);
        ReflectionTestUtils.setField(service, "sameSite", "Strict");
        ReflectionTestUtils.setField(service, "refreshTokenExpiration", 604800000L);
        return service;
    }
}

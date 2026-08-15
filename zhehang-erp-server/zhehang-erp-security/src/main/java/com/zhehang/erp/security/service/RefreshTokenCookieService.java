package com.zhehang.erp.security.service;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.Duration;

/** Keeps the renewable credential outside browser script-readable storage. */
@Service
public class RefreshTokenCookieService {

    @Value("${security.auth.refresh-cookie.name:zhehang_refresh}")
    private String cookieName;

    @Value("${security.auth.refresh-cookie.path:/api/auth}")
    private String cookiePath;

    @Value("${security.auth.refresh-cookie.secure:false}")
    private boolean secure;

    @Value("${security.auth.refresh-cookie.same-site:Strict}")
    private String sameSite;

    @Value("${jwt.refresh-token-expiration:604800000}")
    private long refreshTokenExpiration;

    public String read(HttpServletRequest request) {
        if (request == null || request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (cookieName.equals(cookie.getName()) && StringUtils.hasText(cookie.getValue())) {
                return cookie.getValue();
            }
        }
        return null;
    }

    public String preferCookie(HttpServletRequest request, String legacyBodyToken) {
        String cookieToken = read(request);
        return StringUtils.hasText(cookieToken) ? cookieToken : legacyBodyToken;
    }

    public void write(HttpServletResponse response, String refreshToken) {
        if (response == null || !StringUtils.hasText(refreshToken)) {
            return;
        }
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(refreshToken,
                Duration.ofMillis(refreshTokenExpiration)).toString());
    }

    public void clear(HttpServletResponse response) {
        if (response == null) {
            return;
        }
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
    }

    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path(cookiePath)
                .maxAge(maxAge)
                .build();
    }
}

package com.zhehang.erp.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.security.service.TokenService;
import com.zhehang.erp.security.service.RefreshTokenCookieService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class LogoutSuccessHandlerImpl implements LogoutSuccessHandler {

    private static final long MAX_LOGOUT_BODY_BYTES = 4096L;

    private final TokenService tokenService;
    private final RefreshTokenCookieService refreshTokenCookieService;
    private final ObjectMapper objectMapper;

    @Override
    public void onLogoutSuccess(HttpServletRequest request,
                                HttpServletResponse response,
                                Authentication authentication) throws IOException {
        RuntimeException revokeFailure = null;
        try {
            tokenService.removeToken(request,
                    refreshTokenCookieService.preferCookie(request, readRefreshToken(request)));
        } catch (RuntimeException exception) {
            revokeFailure = exception;
        } finally {
            // 即使 Redis/会话撤销暂时失败，也必须先让浏览器丢弃 HttpOnly 刷新凭证。
            refreshTokenCookieService.clear(response);
        }

        response.setStatus(revokeFailure == null
                ? HttpServletResponse.SC_OK
                : HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        R<?> result = revokeFailure == null
                ? R.ok()
                : R.fail(HttpServletResponse.SC_SERVICE_UNAVAILABLE, "退出未完全完成，请刷新后重试");
        if (revokeFailure == null) {
            result.setMessage("登出成功");
        }
        response.getWriter().write(objectMapper.writeValueAsString(result));
    }

    private String readRefreshToken(HttpServletRequest request) {
        try {
            long contentLength = request.getContentLengthLong();
            if (contentLength <= 0 || contentLength > MAX_LOGOUT_BODY_BYTES) {
                return null;
            }
            Map<?, ?> body = objectMapper.readValue(request.getInputStream(), Map.class);
            Object refreshToken = body.get("refreshToken");
            return refreshToken instanceof String value && !value.isBlank() ? value : null;
        } catch (Exception ignored) {
            // 退出必须保持幂等；请求体无效时仍撤销Authorization中的当前会话。
            return null;
        }
    }
}

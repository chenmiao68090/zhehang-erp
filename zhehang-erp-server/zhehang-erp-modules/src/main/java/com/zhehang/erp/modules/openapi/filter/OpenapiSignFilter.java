package com.zhehang.erp.modules.openapi.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.openapi.domain.entity.OpenapiApp;
import com.zhehang.erp.modules.openapi.service.IOpenapiAppService;
import com.zhehang.erp.modules.openapi.util.AesEncryptUtils;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/**
 * 开放API签名鉴权过滤器
 * 拦截 /openapi/** 路径
 * 校验 header: X-App-Key, X-Timestamp, X-Nonce, X-Sign
 * 签名算法: sha256(app_secret + timestamp + nonce + body)
 * 时间戳5分钟有效
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OpenapiSignFilter implements Filter {

    private static final long TIMESTAMP_VALID_MS = 5 * 60 * 1000L; // 5分钟
    private final IOpenapiAppService openapiAppService;
    private final ObjectMapper objectMapper;

    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        String appKey = request.getHeader("X-App-Key");
        String timestamp = request.getHeader("X-Timestamp");
        String nonce = request.getHeader("X-Nonce");
        String sign = request.getHeader("X-Sign");

        // 1. 参数完整性检查
        if (appKey == null || timestamp == null || nonce == null || sign == null) {
            writeError(response, 401, "缺少签名参数 (X-App-Key/X-Timestamp/X-Nonce/X-Sign)");
            return;
        }

        // 2. 时间戳有效性
        try {
            long ts = Long.parseLong(timestamp);
            if (Math.abs(System.currentTimeMillis() - ts) > TIMESTAMP_VALID_MS) {
                writeError(response, 401, "请求已过期，时间戳超过5分钟");
                return;
            }
        } catch (NumberFormatException e) {
            writeError(response, 401, "时间戳格式错误");
            return;
        }

        // 3. 查询应用
        OpenapiApp app = openapiAppService.getByAppKey(appKey);
        if (app == null || app.getStatus() != 1) {
            writeError(response, 401, "应用不存在或已禁用");
            return;
        }

        // 4. 验证签名
        String decryptedSecret = AesEncryptUtils.decrypt(app.getAppSecret());
        String body = "";  // GET 请求无 body
        if ("POST".equalsIgnoreCase(request.getMethod()) || "PUT".equalsIgnoreCase(request.getMethod())) {
            // 包装 request 以支持多次读取 body
            CachedBodyHttpServletRequest cachedRequest = new CachedBodyHttpServletRequest(request);
            body = new String(cachedRequest.getCachedBody(), StandardCharsets.UTF_8);
            request = cachedRequest;
        }

        String expectedSign = sha256(decryptedSecret + timestamp + nonce + body);
        if (!expectedSign.equals(sign)) {
            writeError(response, 401, "签名验证失败");
            return;
        }

        // 5. 注入 appId 到 attribute
        request.setAttribute("openapi_app_id", app.getId());
        request.setAttribute("openapi_app_key", app.getAppKey());
        request.setAttribute("openapi_rate_limit", app.getRateLimit());

        chain.doFilter(request, response);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("SHA-256计算失败", e);
        }
    }

    private void writeError(HttpServletResponse response, int code, String message) throws IOException {
        response.setStatus(code);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(R.fail(code, message)));
    }
}

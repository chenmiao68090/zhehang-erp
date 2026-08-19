package com.zhehang.erp.modules.common.interceptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.domain.R;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * 旧模块只读拦截器 —— 阻止向已迁移到飞哥体系的旧模块写入新数据。
 * <p>拦截范围：POST/PUT/DELETE 到 /api/order、/api/task 路径。</p>
 * <p>排除列表（这些仍在使用的子路径不拦截）见 LegacyModuleConfig 的 excludePathPatterns。</p>
 */
@Slf4j
@Component
public class LegacyReadOnlyInterceptor implements HandlerInterceptor {

    private static final String MESSAGE = "该功能已迁移至新系统，请使用「订单与合同」或「任务工单」模块";

    private final ObjectMapper objectMapper;

    public LegacyReadOnlyInterceptor(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String method = request.getMethod();
        // GET/HEAD/OPTIONS 全部放行，保留历史数据只读访问
        if ("GET".equalsIgnoreCase(method) || "OPTIONS".equalsIgnoreCase(method) || "HEAD".equalsIgnoreCase(method)) {
            return true;
        }
        // 写入操作被拦截
        log.info("拦截旧模块写入请求: {} {}", method, request.getRequestURI());
        response.setStatus(HttpServletResponse.SC_OK);
        response.setContentType("application/json;charset=UTF-8");
        R<?> result = R.fail(MESSAGE);
        response.getWriter().write(objectMapper.writeValueAsString(result));
        return false;
    }
}

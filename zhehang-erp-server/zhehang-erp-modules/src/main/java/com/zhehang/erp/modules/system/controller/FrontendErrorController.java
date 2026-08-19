package com.zhehang.erp.modules.system.controller;

import com.zhehang.erp.common.core.domain.R;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 前端运行时错误上报。未登录页面也会出错，故该端点免鉴权，
 * 由 SensitiveEndpointRateLimitFilter 按 IP 限流兜住日志刷量。
 */
@RestController
@RequestMapping("/frontend-error")
public class FrontendErrorController {

    private static final Logger FRONTEND_LOGGER = LoggerFactory.getLogger("frontend-error");

    /** 单字段截断长度：堆栈放宽，其余按短文本收紧，避免日志被超长内容撑爆 */
    private static final int MAX_STACK_LENGTH = 2000;
    private static final int MAX_FIELD_LENGTH = 500;

    @PostMapping
    public R<Void> reportError(@RequestBody Map<String, Object> errorInfo) {
        FRONTEND_LOGGER.error("前端错误上报: message={}, url={}, userId={}, userAgent={}, timestamp={}, stack={}",
                clean(errorInfo.get("message"), MAX_FIELD_LENGTH),
                clean(errorInfo.get("url"), MAX_FIELD_LENGTH),
                clean(errorInfo.get("userId"), 64),
                clean(errorInfo.get("userAgent"), MAX_FIELD_LENGTH),
                clean(errorInfo.get("timestamp"), 64),
                clean(errorInfo.get("stack"), MAX_STACK_LENGTH));
        return R.ok();
    }

    /** 上报内容来自公网，换行会伪造日志行，需先压平再截断 */
    private String clean(Object value, int maxLength) {
        if (value == null) {
            return "-";
        }
        String text = String.valueOf(value).replaceAll("[\\r\\n]+", " ").trim();
        if (text.isEmpty()) {
            return "-";
        }
        return text.length() <= maxLength ? text : text.substring(0, maxLength) + "...(truncated)";
    }
}

package com.zhehang.erp.common.core.exception;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.i18n.MessageUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Global exception handler.
 * All response messages are resolved through {@link MessageUtils}, which selects
 * the locale based on the current request's Accept-Language header.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public R<?> handleBusinessException(BusinessException e, HttpServletRequest request) {
        log.error("BusinessException: {} - URI: {}", e.getMessage(), request.getRequestURI());
        // BusinessException already carries a localized or specific message
        return R.fail(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public R<?> handleValidationException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError() != null
                ? e.getBindingResult().getFieldError().getDefaultMessage()
                : MessageUtils.getMessage("error.params.invalid");
        return R.fail(400, message);
    }

    @ExceptionHandler(BindException.class)
    public R<?> handleBindException(BindException e) {
        String message = e.getFieldError() != null
                ? e.getFieldError().getDefaultMessage()
                : MessageUtils.getMessage("error.params.invalid");
        return R.fail(400, message);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public R<?> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return R.fail(405, MessageUtils.getMessage("error.method.not.supported") + ": " + e.getMethod());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public R<?> handleAccessDenied(AccessDeniedException e, HttpServletRequest request,
                                   HttpServletResponse response) {
        log.warn("AccessDenied: {} - URI: {}", e.getMessage(), request.getRequestURI());
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        return R.fail(403, MessageUtils.getMessage("error.permission.denied"));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public R<?> handleIllegalArgument(IllegalArgumentException e) {
        return R.fail(400, MessageUtils.getMessageOrDefault("error.params.invalid", e.getMessage()));
    }

    /** 缺少必填请求参数(@RequestParam 未传)→ 400,而非误判为系统500 */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public R<?> handleMissingParam(MissingServletRequestParameterException e) {
        return R.fail(400, MessageUtils.getMessage("error.params.missing", e.getParameterName()));
    }

    /** 参数类型不匹配(如把字母传给 Long id)→ 400 */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public R<?> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return R.fail(400, MessageUtils.getMessage("error.params.format", e.getName()));
    }

    /** 请求体缺失或 JSON 格式错误(@RequestBody 解析失败)→ 400 */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public R<?> handleNotReadable(HttpMessageNotReadableException e) {
        return R.fail(400, MessageUtils.getMessage("error.body.unreadable"));
    }

    /** 上传文件超过大小限制 → 明确提示,而非笼统的系统500(超过 spring.servlet.multipart 上限时触发) */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public R<?> handleMaxUploadSize(MaxUploadSizeExceededException e) {
        return R.fail(413, "上传文件过大,单个文件不能超过 30MB");
    }

    /** 数据库约束冲突(内容过长、唯一键重复等)→ 明确提示,而非笼统的系统500 */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public R<?> handleDataIntegrity(DataIntegrityViolationException e, HttpServletRequest request) {
        log.error("DataIntegrityViolation: {} - URI: {}", e.getMostSpecificCause().getMessage(), request.getRequestURI());
        return R.fail(400, "数据保存失败:内容过长或与已有数据冲突,请检查后重试");
    }

    /**
     * 请求了不存在的路径。
     *
     * <p>旧缓存的前端构建、网络扫描、链接写错都会走到这里。它们不是服务端故障,
     * 不能当成 500 系统异常连堆栈一起打到 ERROR,否则一个循环轮询的页面就能持续刷满错误日志,
     * 淹掉真正的告警。这里降为 WARN 单行并如实返回 404。</p>
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public R<?> handleNoResourceFound(NoResourceFoundException e, HttpServletRequest request) {
        log.warn("请求路径不存在 - URI: {}", request.getRequestURI());
        return R.fail(404, "请求的接口不存在，请刷新页面后重试");
    }

    @ExceptionHandler(Exception.class)
    public R<?> handleException(Exception e, HttpServletRequest request) {
        log.error("System error: {} - URI: {}", e.getMessage(), request.getRequestURI(), e);
        return R.fail(500, MessageUtils.getMessage("error.system"));
    }
}

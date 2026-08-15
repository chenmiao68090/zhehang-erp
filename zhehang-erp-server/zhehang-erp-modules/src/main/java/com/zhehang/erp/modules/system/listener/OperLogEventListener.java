package com.zhehang.erp.modules.system.listener;

import com.zhehang.erp.common.core.aspect.LogAspect;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.service.ISysLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class OperLogEventListener {

    private final ISysLogService logService;

    @Async
    @EventListener
    public void handleOperLogEvent(LogAspect.OperLogEvent event) {
        try {
            Map<String, Object> logData = event.getLogData();
            SysOperLog operLog = new SysOperLog();
            operLog.setModule((String) logData.get("module"));
            operLog.setOperType((String) logData.get("operType"));
            operLog.setOperator((String) logData.get("operator"));
            Object operatorId = logData.get("operatorId");
            if (operatorId instanceof Number number) {
                operLog.setOperatorId(number.longValue());
            }
            Object actorUserId = logData.get("actorUserId");
            if (actorUserId instanceof Number number) {
                operLog.setActorUserId(number.longValue());
            }
            Object actorUsername = logData.get("actorUsername");
            if (actorUsername instanceof String value && !value.isBlank()) {
                operLog.setActorUsername(value);
            }
            Object effectiveUserId = logData.get("effectiveUserId");
            if (effectiveUserId instanceof Number number) {
                operLog.setEffectiveUserId(number.longValue());
            }
            Object effectiveUsername = logData.get("effectiveUsername");
            if (effectiveUsername instanceof String value && !value.isBlank()) {
                operLog.setEffectiveUsername(value);
            }
            Object impersonationSessionId = logData.get("impersonationSessionId");
            if (impersonationSessionId instanceof String value && !value.isBlank()) {
                operLog.setImpersonationSessionId(value);
            }
            Object tenantId = logData.get("tenantId");
            if (tenantId instanceof Number number) {
                operLog.setTenantId(number.longValue());
            }
            operLog.setMethod((String) logData.get("method"));
            operLog.setRequestUri((String) logData.get("requestUri"));
            operLog.setRequestMethod((String) logData.get("requestMethod"));
            operLog.setRequestParams((String) logData.get("requestParams"));
            operLog.setResponseResult((String) logData.get("responseResult"));
            operLog.setStatus((Integer) logData.get("status"));
            operLog.setErrorMsg((String) logData.get("errorMsg"));
            operLog.setIpAddr((String) logData.get("ipAddr"));
            operLog.setCostTime((Long) logData.get("costTime"));
            operLog.setOperTime(LocalDateTime.now());
            logService.saveOperLog(operLog);
        } catch (Exception e) {
            log.error("Failed to persist operation log: {}", e.getMessage());
        }
    }
}

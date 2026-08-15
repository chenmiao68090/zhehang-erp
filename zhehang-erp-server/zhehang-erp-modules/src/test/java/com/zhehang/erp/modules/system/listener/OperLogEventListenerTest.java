package com.zhehang.erp.modules.system.listener;

import com.zhehang.erp.common.core.aspect.LogAspect;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.service.ISysLogService;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class OperLogEventListenerTest {

    @Test
    void persistsBothActorAndEffectiveIdentityForImpersonatedOperation() {
        ISysLogService logService = mock(ISysLogService.class);
        OperLogEventListener listener = new OperLogEventListener(logService);
        Map<String, Object> logData = new HashMap<>();
        logData.put("module", "代登录审计");
        logData.put("operType", "QUERY");
        logData.put("operator", "platform-super-admin");
        logData.put("operatorId", 3L);
        logData.put("actorUserId", 3L);
        logData.put("actorUsername", "platform-super-admin");
        logData.put("effectiveUserId", 27L);
        logData.put("effectiveUsername", "target-employee");
        logData.put("impersonationSessionId", "imp-session-1");
        logData.put("tenantId", 9L);
        logData.put("method", "fixture.list");
        logData.put("requestUri", "/crm/customer/list");
        logData.put("requestMethod", "GET");
        logData.put("requestParams", "");
        logData.put("responseResult", "");
        logData.put("status", 0);
        logData.put("errorMsg", "");
        logData.put("ipAddr", "127.0.0.1");
        logData.put("costTime", 3L);

        listener.handleOperLogEvent(new LogAspect.OperLogEvent(logData));

        org.mockito.ArgumentCaptor<SysOperLog> captor =
                org.mockito.ArgumentCaptor.forClass(SysOperLog.class);
        verify(logService).saveOperLog(captor.capture());
        SysOperLog saved = captor.getValue();
        assertThat(saved.getOperator()).isEqualTo("platform-super-admin");
        assertThat(saved.getOperatorId()).isEqualTo(3L);
        assertThat(saved.getActorUserId()).isEqualTo(3L);
        assertThat(saved.getActorUsername()).isEqualTo("platform-super-admin");
        assertThat(saved.getEffectiveUserId()).isEqualTo(27L);
        assertThat(saved.getEffectiveUsername()).isEqualTo("target-employee");
        assertThat(saved.getImpersonationSessionId()).isEqualTo("imp-session-1");
        assertThat(saved.getTenantId()).isEqualTo(9L);
        assertThat(saved.getOperTime()).isNotNull();
    }
}

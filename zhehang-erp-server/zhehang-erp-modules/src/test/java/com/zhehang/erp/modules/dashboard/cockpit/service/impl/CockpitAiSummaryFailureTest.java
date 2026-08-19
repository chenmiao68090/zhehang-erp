package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.AiSummaryVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.AlertVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CockpitKpiVO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.when;

class CockpitAiSummaryFailureTest {

    @Test
    void successfulAiSummaryKeepsProviderReply() {
        AiService aiService = mock(AiService.class);
        CockpitServiceImpl service = service(aiService);
        when(aiService.chat(anyString(), anyMap())).thenReturn("真实AI摘要");
        when(aiService.getProviderName()).thenReturn("qwen");

        AiSummaryVO result = service.getAiSummary();

        assertThat(result.getContent()).isEqualTo("真实AI摘要");
        assertThat(result.getProvider()).isEqualTo("qwen");
        assertThat(result.getGeneratedAt()).isNotBlank();
    }

    @Test
    void aiFailureReturnsMarkedFallbackInsteadOfSilentSuccess() {
        AiService aiService = mock(AiService.class);
        CockpitServiceImpl service = service(aiService);
        when(aiService.chat(anyString(), anyMap()))
                .thenThrow(new BusinessException(AiService.SERVICE_UNAVAILABLE_MESSAGE));

        AiSummaryVO result = service.getAiSummary();

        // 降级返回必须带 provider=fallback 标记，让前端/调用方可识别，不构成"静默成功"
        assertThat(result.getProvider()).isEqualTo("fallback");
        assertThat(result.getContent()).isNotBlank();
    }

    private CockpitServiceImpl service(AiService aiService) {
        CockpitServiceImpl service = spy(new CockpitServiceImpl(
                aiService,
                mock(SalesMetricService.class),
                mock(TaskMetricService.class),
                mock(FinanceMetricService.class)));
        CockpitKpiVO kpi = new CockpitKpiVO();
        kpi.setTotalRevenue(BigDecimal.ZERO);
        kpi.setMonthReceipt(BigDecimal.ZERO);
        AlertVO alert = new AlertVO();
        doReturn(kpi).when(service).getKpi("month", null, null);
        doReturn(alert).when(service).getAlerts("month", null, null);
        return service;
    }
}

package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.ai.service.AiService;
import com.zhehang.erp.modules.contract.mapper.BizContractMapper;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.AiSummaryVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.AlertVO;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CockpitKpiVO;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
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
    void aiFailurePropagatesInsteadOfReturningFallbackSummaryAsSuccess() {
        AiService aiService = mock(AiService.class);
        CockpitServiceImpl service = service(aiService);
        when(aiService.chat(anyString(), anyMap()))
                .thenThrow(new BusinessException(AiService.SERVICE_UNAVAILABLE_MESSAGE));

        assertThatThrownBy(service::getAiSummary)
                .isInstanceOf(BusinessException.class)
                .hasMessage(AiService.SERVICE_UNAVAILABLE_MESSAGE);
    }

    private CockpitServiceImpl service(AiService aiService) {
        CockpitServiceImpl service = spy(new CockpitServiceImpl(
                aiService,
                mock(CrmCustomerMapper.class),
                mock(CrmLeadMapper.class),
                mock(BizOrderMapper.class),
                mock(BizReceiptMapper.class),
                mock(BizContractMapper.class),
                mock(BizTaskMapper.class),
                mock(OrgEmployeeMapper.class),
                mock(SysDeptMapper.class)));
        CockpitKpiVO kpi = new CockpitKpiVO();
        kpi.setTotalRevenue(BigDecimal.ZERO);
        kpi.setMonthReceipt(BigDecimal.ZERO);
        AlertVO alert = new AlertVO();
        doReturn(kpi).when(service).getKpi("month", null, null);
        doReturn(alert).when(service).getAlerts("month", null, null);
        return service;
    }
}

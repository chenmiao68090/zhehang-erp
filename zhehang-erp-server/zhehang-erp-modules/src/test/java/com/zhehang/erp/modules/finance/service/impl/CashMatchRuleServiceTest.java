package com.zhehang.erp.modules.finance.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.dto.CashMatchRuleRequest;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleConfig;
import com.zhehang.erp.modules.finance.domain.entity.FinCashMatchRuleEvent;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchRuleConfigMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchRuleEventMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

class CashMatchRuleServiceTest {
    private FinCashMatchRuleConfigMapper configMapper;
    private FinCashMatchRuleEventMapper eventMapper;
    private CashMatchRuleService service;

    @BeforeEach
    void setUp() {
        configMapper = mock(FinCashMatchRuleConfigMapper.class);
        eventMapper = mock(FinCashMatchRuleEventMapper.class);
        service = new CashMatchRuleService(configMapper, eventMapper, mock(SysUserMapper.class),
                new ObjectMapper().findAndRegisterModules());
    }

    @Test
    void returnsExecutableDefaultsBeforeTenantCreatesConfiguration() {
        FinCashMatchRuleConfig result = service.current();
        assertThat(result.getCustomerExactWeight()).isEqualTo(50);
        assertThat(result.getHighThreshold()).isEqualTo(80);
        assertThat(result.getAmountToleranceRate()).isEqualByComparingTo("0.0100");
    }

    @Test
    void savesRuleAndWritesImmutableChangeEvent() {
        AtomicReference<FinCashMatchRuleConfig> inserted = new AtomicReference<>();
        AtomicReference<FinCashMatchRuleEvent> event = new AtomicReference<>();
        when(configMapper.insert(any())).thenAnswer(invocation -> {
            FinCashMatchRuleConfig entity = invocation.getArgument(0);
            entity.setId(18L);
            inserted.set(entity);
            return 1;
        });
        when(eventMapper.insert(any())).thenAnswer(invocation -> {
            event.set(invocation.getArgument(0));
            return 1;
        });
        CashMatchRuleRequest request = new CashMatchRuleRequest();
        request.setOrderNoWeight(55);
        request.setReason("报单号是当前最可靠线索");

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(7L);
            FinCashMatchRuleConfig result = service.save(request);

            assertThat(result.getId()).isEqualTo(18L);
            assertThat(inserted.get().getOrderNoWeight()).isEqualTo(55);
            assertThat(event.get().getActionType()).isEqualTo("create");
            assertThat(event.get().getReason()).isEqualTo("报单号是当前最可靠线索");
            assertThat(event.get().getAfterJson()).contains("orderNoWeight").contains("55");
        }
    }

    @Test
    void rejectsInvalidConfidenceThresholdsDuringSimulation() {
        CashMatchRuleRequest request = new CashMatchRuleRequest();
        request.setHighThreshold(50);
        request.setMediumThreshold(60);
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::isCurrentAdmin).thenReturn(true);
            assertThatThrownBy(() -> service.draft(request))
                    .isInstanceOf(BusinessException.class)
                    .hasMessageContaining("高置信度阈值");
        }
    }
}

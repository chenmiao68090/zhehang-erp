package com.zhehang.erp.modules.crm.service.impl;

import com.zhehang.erp.modules.crm.domain.entity.CrmHoldingConfig;
import com.zhehang.erp.modules.crm.mapper.CrmHoldingConfigMapper;
import com.zhehang.erp.modules.crm.mapper.CrmLeadMapper;
import com.zhehang.erp.modules.crm.service.CrmPoolRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CrmHoldingServiceImplTest {

    @Mock
    private CrmHoldingConfigMapper holdingConfigMapper;
    @Mock
    private CrmLeadMapper leadMapper;
    @Mock
    private CrmPoolRuleService ruleService;

    private CrmHoldingServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CrmHoldingServiceImpl(holdingConfigMapper, leadMapper, ruleService);
    }

    @Test
    void noConfigUsesOneThousandAsDefaultLimit() {
        when(holdingConfigMapper.selectList(any())).thenReturn(List.of());
        when(leadMapper.selectCount(any())).thenReturn(999L, 1000L);

        Map<String, Object> beforeLimit = service.checkLimit(10L);
        Map<String, Object> atLimit = service.checkLimit(10L);

        assertTrue((Boolean) beforeLimit.get("canClaim"));
        assertFalse((Boolean) atLimit.get("canClaim"));
        assertTrue(String.valueOf(atLimit.get("reason")).contains("1000"));
    }

    @Test
    void enabledConfigUsesHighestConfiguredLimit() {
        CrmHoldingConfig junior = new CrmHoldingConfig();
        junior.setMaxHolding(500);
        CrmHoldingConfig unified = new CrmHoldingConfig();
        unified.setMaxHolding(1000);
        when(holdingConfigMapper.selectList(any())).thenReturn(List.of(junior, unified));
        when(leadMapper.selectCount(any())).thenReturn(600L);

        Map<String, Object> holding = service.currentHolding(10L);

        assertEquals(600L, holding.get("current"));
        assertEquals(1000, holding.get("max"));
    }
}

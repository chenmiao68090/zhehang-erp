package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.mapper.CrmTaxProfileMapper;
import com.zhehang.erp.modules.crm.service.impl.CrmTaxProfileServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
class CrmTaxProfileServiceImplTest {

    @Mock
    private CrmTaxProfileMapper taxProfileMapper;

    private CrmTaxProfileServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new CrmTaxProfileServiceImpl(taxProfileMapper);
    }

    @Test
    void taxCalendarMustNotInventDeadlineOrFilingStatusWithoutVerifiedSource() {
        BusinessException error = assertThrows(BusinessException.class,
                () -> service.taxCalendar("2026-07"));

        assertEquals(503, error.getCode());
        assertTrue(error.getMessage().contains("尚未接入可核验的申报期限"));
        assertTrue(error.getMessage().contains("真实申报结果"));
        verifyNoInteractions(taxProfileMapper);
    }
}

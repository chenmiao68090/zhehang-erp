package com.zhehang.erp.modules.crm.service.impl;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CrmLeadDailyClaimLimitTest {

    @Test
    void allowsTheThousandthLead() {
        assertFalse(CrmLeadServiceImpl.exceedsDailyClaimLimit(999L, 1));
    }

    @Test
    void rejectsAfterOneThousand() {
        assertTrue(CrmLeadServiceImpl.exceedsDailyClaimLimit(1000L, 1));
    }

    @Test
    void rejectsBatchCrossingOneThousand() {
        assertTrue(CrmLeadServiceImpl.exceedsDailyClaimLimit(999L, 2));
    }
}

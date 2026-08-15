package com.zhehang.erp.modules.crm.support;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class SalesStageTest {

    @Test
    void lifecycleStatusHasPriorityOverLegacyFollowStatus() {
        assertThat(SalesStage.resolve("需求沟通", 3)).isEqualTo(SalesStage.HANDOFF_DELIVERY);
        assertThat(SalesStage.resolve("签单收款", 4)).isEqualTo(SalesStage.INVALID);
    }

    @Test
    void oldLeadFallsBackToStableFunnelStage() {
        assertThat(SalesStage.resolve(null, 1)).isEqualTo(SalesStage.LEAD_RECEIVED);
        assertThat(SalesStage.resolve(null, 2)).isEqualTo(SalesStage.NEEDS_COMMUNICATION);
    }
}

package com.zhehang.erp.modules.finance.mapper;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;

class CashAccountLedgerMapperSqlTest {
    @Test
    void unifiedLedgerUsesBoundParametersAndExplicitTenantScope() throws IOException {
        try (var stream = getClass().getResourceAsStream("/mapper/finance/CashAccountLedgerMapper.xml")) {
            assertThat(stream).isNotNull();
            String xml = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            assertThat(xml).contains("j.tenant_id = #{tenantId}")
                    .contains("a.tenant_id = #{tenantId}")
                    .contains("UNION ALL")
                    .contains("a.status IN ('active', 'reversed')")
                    .contains("a.reversal_of_id AS reversal_of_id")
                    .doesNotContain("${");
        }
    }
}

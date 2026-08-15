package com.zhehang.erp.modules.feigeorder;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeOrderStateMachineV207ContractTest {

    @Test
    void orderLifecycleEmitsBridgeEventsAndClosesBypassTransitions() throws Exception {
        String source = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigeorder/service/FeigeOrderContractService.java"));

        assertTrue(source.contains("enqueueTaskBridge(order, FeigeOrderTaskBridgeService.ORDER_CREATED)"));
        assertTrue(source.contains("enqueueTaskBridge(order, FeigeOrderTaskBridgeService.FINANCE_APPROVED)"));
        assertTrue(source.contains("public void rejectOrder(Long id, String reason) {\n        requireFinanceReviewer();"));
        assertTrue(source.contains("public void confirmOrder(Long id) {\n        requireFinanceReviewer();"));
        assertTrue(source.contains("if (!\"pending\".equals(order.getAuditStatus())"
                + " || !ORDER_PENDING.equals(order.getStatus()))"));
        assertTrue(source.contains("!\"approved\".equals(order.getAuditStatus())"
                + " || !ORDER_IN_PROGRESS.equals(order.getStatus())"));
    }

    @Test
    void conversionStaysInFeigeTablesAndV207AddsOnlyTheActiveContractInvariant() throws Exception {
        String service = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigeorder/service/FeigeTaskContractConversionService.java"));
        String migration = Files.readString(Path.of(
                "../../zhehang-erp-db/migration/V207_feige_contract_conversion_idempotency.sql"));

        assertTrue(service.contains("last(\"FOR UPDATE\")"));
        assertTrue(service.contains("FeigeAccountingContract"));
        assertTrue(service.contains("contract_convert_from_task"));
        assertTrue(service.contains("task_conversion"));
        assertTrue(service.contains("setAfterData(snapshot(contract))"));
        assertTrue(service.contains("validateTrustedContractFields(order)"));
        assertTrue(service.contains("getCurrentTenantId()"));
        assertFalse(service.contains("biz_"));
        assertTrue(migration.contains("uk_feige_contract_active_order"));
        assertTrue(migration.contains("contract_status IN ('draft', 'executing')"));
        assertFalse(migration.matches("(?s).*(ALTER|UPDATE|DELETE FROM|INSERT INTO)\\s+(biz_|crm_|sys_).*"));
    }
}

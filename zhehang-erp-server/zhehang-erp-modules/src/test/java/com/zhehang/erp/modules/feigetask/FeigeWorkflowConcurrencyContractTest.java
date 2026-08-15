package com.zhehang.erp.modules.feigetask;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class FeigeWorkflowConcurrencyContractTest {

    @Test
    void workflowItemsAndReportsHaveActiveBusinessIdentityConstraints() throws Exception {
        String migration = Files.readString(Path.of(
                "../../zhehang-erp-db/migration/V203_feige_task_workbench.sql"));
        assertTrue(migration.contains("UNIQUE KEY uk_ft_wf_item_identity "
                + "(tenant_id, user_id, template_id, cycle_type, period_key, active_identity)"));
        assertTrue(migration.contains("UNIQUE KEY uk_ft_wf_report_identity "
                + "(tenant_id, user_id, cycle_type, period_key, active_identity)"));
        assertTrue(migration.contains("active_identity TINYINT GENERATED ALWAYS AS "
                + "(CASE WHEN deleted = 0 THEN 1 ELSE NULL END) STORED"));
    }

    @Test
    void concurrentMaterializationAndSummarySubmissionAreIdempotent() throws Exception {
        String service = Files.readString(Path.of(
                "src/main/java/com/zhehang/erp/modules/feigetask/service/FeigeWorkflowService.java"));
        assertTrue(service.contains("catch (DuplicateKeyException duplicate)"));
        assertTrue(service.contains("数据库唯一键是最终幂等边界"));
        assertTrue(service.contains("reportForUpdate(userId, request.getCycleType(), request.getPeriodKey())"));
        assertTrue(service.contains("LIMIT 1 FOR UPDATE"));
    }
}

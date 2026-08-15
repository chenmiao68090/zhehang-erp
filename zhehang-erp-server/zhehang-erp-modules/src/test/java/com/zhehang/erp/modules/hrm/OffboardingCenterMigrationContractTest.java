package com.zhehang.erp.modules.hrm;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class OffboardingCenterMigrationContractTest {

    @Test
    void migrationIsIdempotentAdditiveAndDoesNotInventBusinessData() throws IOException {
        String sql = Files.readString(findFromProjectRoot("zhehang-erp-db/migration/V183_offboarding_center.sql"));

        assertThat(sql).contains(
                "CREATE PROCEDURE `apply_v183_offboarding_center`",
                "MODIFY COLUMN `id` BIGINT NOT NULL AUTO_INCREMENT",
                "TABLE_NAME = 'org_employee'",
                "COLUMN_NAME = 'resign_date'",
                "COLUMN_NAME = 'handover_to_employee_id'",
                "COLUMN_NAME = 'customer_check_status'",
                "COLUMN_NAME = 'task_check_status'",
                "COLUMN_NAME = 'document_check_status'",
                "COLUMN_NAME = 'asset_check_status'",
                "COLUMN_NAME = 'settlement_check_status'",
                "COLUMN_NAME = 'archive_time'",
                "COLUMN_NAME = 'record_version'",
                "INDEX_NAME = 'idx_emp_resign_center'",
                "INDEX_NAME = 'idx_rh_employee_latest'",
                "INDEX_NAME = 'idx_rh_receiver'");
        assertThat(sql).doesNotContain(
                "UPDATE `org_employee`",
                "UPDATE `hrm_resign_handover`",
                "INSERT INTO `org_employee`",
                "INSERT INTO `hrm_resign_handover`",
                "DELETE FROM `org_employee`",
                "DELETE FROM `hrm_resign_handover`");
    }

    @Test
    void centerQueryProjectsOnlySafeEmployeeFields() throws IOException {
        String xml = Files.readString(findFromProjectRoot(
                "zhehang-erp-server/zhehang-erp-modules/src/main/resources/mapper/hrm/HrmResignHandoverMapper.xml"));

        assertThat(xml).contains(
                "e.id AS employee_id",
                "e.emp_code",
                "e.name",
                "e.resign_date",
                "COALESCE(h.customer_check_status, 0)",
                "THEN 'CLOSED'",
                "THEN 'HIGH'",
                "ELSE 'MEDIUM'");
        assertThat(xml).doesNotContain(
                "SELECT e.*",
                "e.phone",
                "e.id_card",
                "e.address",
                "e.emergency_phone");
    }

    private Path findFromProjectRoot(String relative) {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 7 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve(relative);
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到项目文件: " + relative);
    }
}

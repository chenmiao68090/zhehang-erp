package com.zhehang.erp.modules.system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class RolePermissionSingleSourceMigrationContractTest {

    @Test
    void migrationBackfillsOnlyAuditedRolesAndPreservesNoRoleAccount() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql)
                .contains("target user count is no longer twelve")
                .contains("no automatic assignment allowed")
                .contains("v_no_role_users <> 1")
                .contains("v_count <> 136")
                .contains("INSERT IGNORE INTO sys_role_menu")
                .contains("/customer/ad-leads", "/customer/lead")
                .doesNotContain("INSERT INTO sys_user_role", "UPDATE sys_user_role", "DELETE FROM sys_user_role");
    }

    @Test
    void migrationUsesExactAuditedRoleIdsAndFailsOnPartialPermissionState() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql)
                .contains("(11, 'dept_manager__mr8wdpphxtn', 1)")
                .contains("(12, 'staff__mr8wgtn3xzs', 3)")
                .contains("(13, 'dept_manager__mr8wi48zgyr', 1)")
                .contains("(14, 'dept_manager__mr8wifwj9qx', 1)")
                .contains("(15, 'staff__mr8wilh72cd', 2)")
                .contains("(18, 'dept_manager__mr8wj7zy2lr', 1)")
                .contains("(19, 'dept_manager__mr8wjgxoug3', 1)")
                .contains("(20, 'staff__mr8wjr8jnty', 1)")
                .contains("(91, 'staff__mrlnm70jedy', 1)")
                .contains("v_existing_relations NOT IN (0, 136)")
                .contains("target role permissions changed or are partially applied");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 8 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V184_role_permission_single_source.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V184_role_permission_single_source.sql");
    }
}

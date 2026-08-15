package com.zhehang.erp.modules.system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class ImpersonationMigrationContractTest {

    @Test
    void migrationCreatesIsolatedSessionAuditWithoutChangingRoleRelations() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "CREATE TABLE IF NOT EXISTS `sys_impersonation_session`",
                "`session_id`",
                "`actor_user_id`",
                "`effective_user_id`",
                "`reason`",
                "`expire_time`",
                "`status`",
                "`ip_addr`",
                "`user_agent`",
                "`tab_id`",
                "`active_tab_guard`",
                "UNIQUE KEY `uk_imp_active_actor_tab`",
                "ADD COLUMN `impersonation_session_id`",
                "ADD INDEX `idx_impersonation_session`");
        assertThat(sql).doesNotContain(
                "INSERT INTO `sys_user_role`",
                "UPDATE `sys_user_role`",
                "DELETE FROM `sys_user_role`",
                "INSERT INTO `sys_role_menu`",
                "UPDATE `sys_role_menu`",
                "DELETE FROM `sys_role_menu`");
    }

    @Test
    void migrationNeverStoresPasswordsOrTokens() throws IOException {
        String sql = Files.readString(findMigration()).toLowerCase();

        assertThat(sql).doesNotContain("`password`");
        assertThat(sql).doesNotContain("`access_token`");
        assertThat(sql).doesNotContain("`refresh_token`");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V174_super_admin_impersonation.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V174_super_admin_impersonation.sql");
    }
}

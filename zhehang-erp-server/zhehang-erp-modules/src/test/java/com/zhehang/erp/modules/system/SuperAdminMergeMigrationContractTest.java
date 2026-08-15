package com.zhehang.erp.modules.system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class SuperAdminMergeMigrationContractTest {

    @Test
    void migrationPreservesMembersBeforeRemovingLegacyRoles() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql)
                .contains("INSERT IGNORE INTO tmp_v181_top_users")
                .contains("INSERT IGNORE INTO sys_user_role (user_id, role_id)")
                .contains("DELETE ur")
                .contains("COALESCE(u.deleted, 0) <> 0")
                .contains("DELETE FROM sys_user_role WHERE role_id IN (21, 90)")
                .contains("v_before_members <> v_after_members")
                .contains("ROLLBACK")
                .contains("RESIGNAL");
    }

    @Test
    void migrationPinsTheAuditedRoleIdentities() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql)
                .contains("id = 1 AND tenant_id = 1")
                .contains("role_key = 'super_admin'")
                .contains("id = 21 AND role_key = 'super_admin__mr9plur8jyh'")
                .contains("id = 90 AND role_key = 'boss'")
                .contains("audited legacy roles are missing")
                .contains("invalid tenant user")
                .contains("v_total_members <> 7")
                .contains("v_deleted_members <> 2")
                .contains("v_before_members <> 5")
                .contains("data_scope = 1")
                .contains("visible_modules = NULL");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 8 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V181_merge_super_admin_roles.sql");
            if (Files.exists(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V181_merge_super_admin_roles.sql");
    }
}

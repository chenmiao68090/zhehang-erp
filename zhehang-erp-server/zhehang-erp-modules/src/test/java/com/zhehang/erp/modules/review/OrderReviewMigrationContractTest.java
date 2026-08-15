package com.zhehang.erp.modules.review;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class OrderReviewMigrationContractTest {

    @Test
    void migrationCreatesAllReviewTablesWithTenantAwareIndexes() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "CREATE TABLE IF NOT EXISTS `biz_order_review`",
                "CREATE TABLE IF NOT EXISTS `biz_order_review_record`",
                "CREATE TABLE IF NOT EXISTS `biz_order_review_contract`",
                "CREATE TABLE IF NOT EXISTS `biz_order_review_payment`",
                "CREATE TABLE IF NOT EXISTS `biz_order_review_accept`",
                "CREATE TABLE IF NOT EXISTS `biz_order_review_complete`");
        assertThat(sql).contains(
                "UNIQUE KEY `uk_review_tenant_no` (`tenant_id`,`review_no`)",
                "UNIQUE KEY `uk_review_tenant_order` (`tenant_id`,`order_type`,`order_id`)",
                "KEY `idx_review_tenant_deadline` (`tenant_id`,`deadline`,`id`)",
                "KEY `idx_review_tenant_status_deadline` (`tenant_id`,`review_status`,`deadline`,`id`)",
                "KEY `idx_review_tenant_dept_status` (`tenant_id`,`dept_id`,`review_status`,`deadline`)",
                "KEY `idx_review_record_tenant_time` (`tenant_id`,`review_id`,`operated_at`,`id`)",
                "UNIQUE KEY `uk_review_contract_tenant` (`tenant_id`,`review_id`)",
                "UNIQUE KEY `uk_review_payment_tenant` (`tenant_id`,`review_id`)",
                "KEY `idx_review_payment_confirmer` (`tenant_id`,`confirmer_id`,`review_id`)",
                "UNIQUE KEY `uk_review_accept_tenant` (`tenant_id`,`review_id`)",
                "UNIQUE KEY `uk_review_complete_tenant` (`tenant_id`,`review_id`)");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V141_order_review.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V141_order_review.sql");
    }
}

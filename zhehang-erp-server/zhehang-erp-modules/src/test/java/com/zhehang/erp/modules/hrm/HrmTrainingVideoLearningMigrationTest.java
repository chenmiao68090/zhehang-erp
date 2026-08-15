package com.zhehang.erp.modules.hrm;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class HrmTrainingVideoLearningMigrationTest {

    @Test
    void migrationIsAdditiveAndContainsUploadAndCoverageContracts() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "CREATE PROCEDURE add_training_video_column",
                "'hrm_training_material', 'media_provider'",
                "'hrm_training_material', 'min_watch_percent'",
                "'hrm_training_learning_step', 'watched_ranges_json'",
                "'hrm_training_learning_step', 'coverage_percent'",
                "'file_info', 'access_scope'",
                "CREATE TABLE IF NOT EXISTS `hrm_training_video_upload`",
                "`file_fingerprint` VARCHAR(128) NOT NULL",
                "UNIQUE KEY `uk_training_video_upload_token`",
                "idx_training_step_video_dashboard");
        assertThat(sql).doesNotContain(
                "DROP TABLE",
                "DELETE FROM hrm_training",
                "UPDATE hrm_training_course",
                "UPDATE hrm_training_learning_record");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V163_training_video_learning.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V163_training_video_learning.sql");
    }
}

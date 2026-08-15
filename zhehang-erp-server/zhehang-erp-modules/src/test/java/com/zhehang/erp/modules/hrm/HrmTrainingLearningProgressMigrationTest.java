package com.zhehang.erp.modules.hrm;

import com.zhehang.erp.modules.hrm.mapper.HrmTrainingLearningStepMapper;
import org.apache.ibatis.annotations.Insert;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class HrmTrainingLearningProgressMigrationTest {

    @Test
    void migrationCreatesTenantAndCycleAwareIdempotentProgressTable() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "CREATE TABLE IF NOT EXISTS `hrm_training_learning_step`",
                "`learning_record_id` BIGINT NOT NULL",
                "`course_version` VARCHAR(32) NOT NULL",
                "`study_cycle` INT NOT NULL DEFAULT 1",
                "`material_id` BIGINT NOT NULL",
                "`step_index` INT NOT NULL DEFAULT 0",
                "`completed` TINYINT(1) NOT NULL DEFAULT 0",
                "`position_seconds` INT NULL",
                "`last_seen_time` DATETIME(3) NOT NULL",
                "UNIQUE KEY `uk_training_step_scope` (`tenant_id`,`learning_record_id`,`study_cycle`,`course_version`,`material_id`,`step_index`)",
                "KEY `idx_training_step_record_cycle` (`tenant_id`,`learning_record_id`,`study_cycle`,`last_seen_time`,`id`)");
        assertThat(sql).doesNotContain("UPDATE `hrm_training_learning_record`");
    }

    @Test
    void progressUpsertIsMonotonicAndRevivesTheScopedRow() throws NoSuchMethodException {
        Insert annotation = HrmTrainingLearningStepMapper.class
                .getMethod("upsert", com.zhehang.erp.modules.hrm.domain.entity.HrmTrainingLearningStep.class)
                .getAnnotation(Insert.class);
        String sql = String.join(" ", annotation.value());

        assertThat(sql).contains(
                "ON DUPLICATE KEY UPDATE",
                "completed_time = CASE WHEN completed = 0 AND VALUES(completed) = 1",
                "completed = GREATEST(completed, VALUES(completed))",
                "position_seconds = CASE WHEN VALUES(step_type) = 'VIDEO' THEN VALUES(position_seconds)",
                "ELSE GREATEST(IFNULL(position_seconds, 0), IFNULL(VALUES(position_seconds), 0)) END",
                "deleted = 0");
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 6 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve("zhehang-erp-db/migration/V160_training_learning_progress.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V160_training_learning_progress.sql");
    }
}

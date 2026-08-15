package com.zhehang.erp.modules.system;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class SettingsGovernanceMigrationContractTest {

    private static final Pattern CREATED_TABLE = Pattern.compile(
            "(?i)CREATE\\s+TABLE\\s+IF\\s+NOT\\s+EXISTS\\s+`([^`]+)`");
    private static final Pattern TYPE_SEED = Pattern.compile(
            "\\('(?:[^']|'')*','([^']+)',\\s*0,");
    private static final Pattern DATA_SEED = Pattern.compile(
            "\\('([^']+)','(?:[^']|'')*','(?:[^']|'')*',\\s*\\d+,");

    @Test
    void migrationUsesTenantCompositeUniqueKeysForStableCodes() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "UNIQUE KEY `uk_sys_dict_type_tenant_code` (`tenant_id`,`dict_type`)",
                "UNIQUE KEY `uk_sys_dict_data_tenant_value` (`tenant_id`,`dict_type`,`dict_value`)",
                "engine = 'InnoDB'",
                "tenant_id' AND data_type='bigint' AND is_nullable='NO'",
                "sys_dict_type has an extra global/business unique index",
                "sys_dict_data has an extra global/business unique index");
        assertThat(sql).doesNotContain("ALTER TABLE `sys_dict_type`", "ALTER TABLE `sys_dict_data`");
    }

    @Test
    void migrationSeedsExactlyThreeGovernedTypesAndNineteenStableValues() throws IOException {
        String sql = Files.readString(findMigration());
        List<String> typeCodes = captures(insertValues(sql, "sys_dict_type"), TYPE_SEED);
        List<String> valueTypeCodes = captures(insertValues(sql, "sys_dict_data"), DATA_SEED);

        assertThat(typeCodes).containsExactly(
                "crm_consult_business", "memo_category", "hr_labor_contract_type");
        assertThat(valueTypeCodes).hasSize(19);
        assertThat(valueTypeCodes.stream().filter("crm_consult_business"::equals).toList()).hasSize(10);
        assertThat(valueTypeCodes.stream().filter("memo_category"::equals).toList()).hasSize(6);
        assertThat(valueTypeCodes.stream().filter("hr_labor_contract_type"::equals).toList()).hasSize(3);
        assertThat(sql).contains(
                "one or more governed dictionary types are missing",
                "one or more governed dictionary seed values are missing");
    }

    @Test
    void migrationRejectsLegacyOrPartialSchemasBeforeSeeding() throws IOException {
        String sql = Files.readString(findMigration());

        assertThat(sql).contains(
                "only one dictionary table exists",
                "mapped columns differ from V235",
                "both dictionary tables require PRIMARY KEY(id)",
                "orphan dictionary values require manual repair");
        assertThat(sql.indexOf("CALL preflight_v235_dictionary_schema()"))
                .isLessThan(sql.indexOf("CREATE TABLE IF NOT EXISTS `sys_dict_type`"));
        assertThat(sql.indexOf("CREATE TABLE IF NOT EXISTS `sys_dict_data`"))
                .isLessThan(sql.indexOf("INSERT INTO `sys_dict_type`"));
    }

    @Test
    void migrationCreatesOnlyDictionaryTablesAndNoUniversalRuleStore() throws IOException {
        String sql = Files.readString(findMigration());
        List<String> tables = captures(sql, CREATED_TABLE);

        assertThat(tables).containsExactly("sys_dict_type", "sys_dict_data");
        assertThat(tables).noneMatch(table -> table.toLowerCase().contains("rule"));
    }

    @Test
    void migrationHasReadOnlyPrecheckAndExplicitRollbackBoundary() throws IOException {
        Path migration = findMigration();
        Path metaDir = migration.getParent().getParent().resolve("migration-meta/V235");
        String precheck = Files.readString(metaDir.resolve("precheck.sql"));
        String rollback = Files.readString(metaDir.resolve("rollback.md"));

        assertThat(precheck).contains(
                "A_NEW_TABLES",
                "BLOCKED_PARTIAL_SCHEMA",
                "information_schema.tables",
                "information_schema.columns",
                "information_schema.statistics",
                "preflight_v235_dictionary_schema",
                "seed_v235_governed_fields");
        assertThat(precheck.toUpperCase()).doesNotContain(
                "CREATE TABLE", "ALTER TABLE", "INSERT INTO", "UPDATE `", "DELETE FROM", "DROP TABLE");
        assertThat(rollback).contains(
                "迁移前明确为`0/0`",
                "3类19项",
                "禁止删除表或配置数据",
                "不得运行全量迁移脚本");
    }

    private String insertValues(String sql, String table) {
        int insertAt = sql.indexOf("INSERT INTO `" + table + "`");
        int valuesAt = sql.indexOf("VALUES", insertAt);
        int endAt = sql.indexOf("ON DUPLICATE KEY UPDATE", valuesAt);
        assertThat(insertAt).as("insert for %s", table).isGreaterThanOrEqualTo(0);
        assertThat(valuesAt).as("VALUES for %s", table).isGreaterThan(insertAt);
        assertThat(endAt).as("upsert boundary for %s", table).isGreaterThan(valuesAt);
        return sql.substring(valuesAt + "VALUES".length(), endAt);
    }

    private List<String> captures(String text, Pattern pattern) {
        Matcher matcher = pattern.matcher(text);
        return matcher.results().map(result -> result.group(1)).toList();
    }

    private Path findMigration() {
        Path cursor = Path.of("").toAbsolutePath();
        for (int i = 0; i < 8 && cursor != null; i++, cursor = cursor.getParent()) {
            Path candidate = cursor.resolve(
                    "zhehang-erp-db/migration/V235_settings_rule_field_governance.sql");
            if (Files.isRegularFile(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("找不到 V235_settings_rule_field_governance.sql");
    }
}

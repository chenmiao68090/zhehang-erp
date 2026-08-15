package com.zhehang.erp.modules.crm.mapper;

import com.zhehang.erp.modules.crm.support.SalesConsoleQueryContext;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.io.Resources;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class SalesOperatingConsoleMapperXmlTest {

    @Test
    void mapperXmlParsesAndRegistersAllConsoleQueries() throws Exception {
        Configuration configuration = loadConfiguration();

        String namespace = SalesOperatingConsoleMapper.class.getName() + ".";
        assertThat(configuration.hasStatement(namespace + "selectLeadSummary")).isTrue();
        assertThat(configuration.hasStatement(namespace + "selectStageEventFlows")).isTrue();
        assertThat(configuration.hasStatement(namespace + "selectStageCustomers")).isTrue();
        assertThat(configuration.hasStatement(namespace + "selectSourceQuality")).isTrue();
        assertThat(configuration.hasStatement(namespace + "selectLossReasons")).isTrue();
    }

    @Test
    void consoleUsesIntentLevelAsCanonicalClassificationWithLegacyFallback() throws Exception {
        Configuration configuration = loadConfiguration();
        SalesConsoleQueryContext context = SalesConsoleQueryContext.builder()
                .tenantId(9L)
                .scopeMode("SELF")
                .userId(31L)
                .build();

        String summarySql = configuration.getMappedStatement(
                        SalesOperatingConsoleMapper.class.getName() + ".selectLeadSummary")
                .getBoundSql(Map.of("ctx", context))
                .getSql().replaceAll("\\s+", " ").trim();

        assertThat(summarySql)
                .contains("COALESCE(NULLIF(l.intent_level, ''), l.customer_level) IN ('A','B')")
                .doesNotContain("l.intent_level = '高'");
    }

    @Test
    void aiAggregatesKeepTenantDateAndDepartmentScope() throws Exception {
        Configuration configuration = loadConfiguration();
        SalesConsoleQueryContext context = SalesConsoleQueryContext.builder()
                .tenantId(9L)
                .scopeMode("DEPARTMENT")
                .deptIds(List.of(5L, 6L))
                .build();

        String sourceSql = sql(configuration, "selectSourceQuality", context, 12);
        assertThat(sourceSql)
                .contains("l.create_time >= ?")
                .contains("l.create_time < ?")
                .contains("l.tenant_id = ?")
                .contains("l.deleted = 0")
                .contains("l.dept_id IN")
                .contains("GROUP BY sourceName")
                .contains("LIMIT ?");

        String lossSql = sql(configuration, "selectLossReasons", context, 10);
        assertThat(lossSql)
                .contains("l.update_time >= ?")
                .contains("l.update_time < ?")
                .contains("l.tenant_id = ?")
                .contains("l.deleted = 0")
                .contains("l.dept_id IN")
                .contains("'其他已归档原因'")
                .contains("GROUP BY reason")
                .doesNotContain("AS invalidReason");
    }

    @Test
    void departmentOptionsOrdersWithoutAnInvalidDistinctProjection() throws Exception {
        Configuration configuration = loadConfiguration();
        SalesConsoleQueryContext context = SalesConsoleQueryContext.builder()
                .tenantId(1L)
                .scopeMode("COMPANY")
                .deptIds(List.of())
                .build();
        String statement = SalesOperatingConsoleMapper.class.getName() + ".selectDepartmentOptions";
        BoundSql boundSql = configuration.getMappedStatement(statement)
                .getBoundSql(Map.of("ctx", context));
        String sql = boundSql.getSql().replaceAll("\\s+", " ").trim();

        assertThat(sql)
                .contains("SELECT d.id, d.dept_name AS name")
                .doesNotContain("SELECT DISTINCT")
                .contains("ORDER BY d.sort, d.id");
    }

    private Configuration loadConfiguration() throws Exception {
        Configuration configuration = new Configuration();
        String resource = "mapper/crm/SalesOperatingConsoleMapper.xml";
        try (InputStream input = Resources.getResourceAsStream(resource)) {
            new XMLMapperBuilder(input, configuration, resource, configuration.getSqlFragments()).parse();
        }
        return configuration;
    }

    private String sql(Configuration configuration,
                       String statementName,
                       SalesConsoleQueryContext context,
                       int limit) {
        String statement = SalesOperatingConsoleMapper.class.getName() + "." + statementName;
        return configuration.getMappedStatement(statement)
                .getBoundSql(Map.of("ctx", context, "limit", limit))
                .getSql().replaceAll("\\s+", " ").trim();
    }
}

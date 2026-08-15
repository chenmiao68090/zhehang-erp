package com.zhehang.erp.modules.im.mapper;

import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.mapping.MappedStatement;
import org.apache.ibatis.session.Configuration;
import org.junit.jupiter.api.Test;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class ImTaskQueryMapperXmlTest {
    private static final String RESOURCE = "mapper/im/ImTaskQueryMapper.xml";
    private static final String STATEMENT = ImTaskQueryMapper.class.getName() + ".activeUserIdsByRoleKeys";

    @Test
    void roleRecipientQueryBuildsForNormalAndPrivilegedRoles() {
        MappedStatement statement = mappedStatement();
        Map<String, Object> params = new HashMap<>();
        params.put("tenantId", 7L);
        params.put("roleKeys", List.of("finance_hq", "boss"));

        assertThatCode(() -> statement.getBoundSql(params)).doesNotThrowAnyException();
        String sql = statement.getBoundSql(params).getSql().replaceAll("\\s+", " ").trim();
        assertThat(sql).contains("r.tenant_id = ?", "r.role_key = ?", "LEFT(r.role_key", "NOT IN");
    }

    @Test
    void emptyRoleListFailsClosedInsteadOfProducingInvalidSql() {
        MappedStatement statement = mappedStatement();
        Map<String, Object> params = new HashMap<>();
        params.put("tenantId", 7L);
        params.put("roleKeys", List.of());

        String sql = statement.getBoundSql(params).getSql().replaceAll("\\s+", " ").trim();
        assertThat(sql).contains("1 = 0");
    }

    private MappedStatement mappedStatement() {
        Configuration configuration = new Configuration();
        try (InputStream input = getClass().getClassLoader().getResourceAsStream(RESOURCE)) {
            assertThat(input).as("mapper resource").isNotNull();
            new XMLMapperBuilder(input, configuration, RESOURCE, configuration.getSqlFragments()).parse();
            return configuration.getMappedStatement(STATEMENT);
        } catch (Exception error) {
            throw new AssertionError("无法解析 IM Mapper XML", error);
        }
    }
}

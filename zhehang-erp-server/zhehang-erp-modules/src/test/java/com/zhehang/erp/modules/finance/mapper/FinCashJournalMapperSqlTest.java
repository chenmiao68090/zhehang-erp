package com.zhehang.erp.modules.finance.mapper;

import net.sf.jsqlparser.expression.Function;
import net.sf.jsqlparser.expression.LongValue;
import net.sf.jsqlparser.parser.CCJSqlParserUtil;
import net.sf.jsqlparser.statement.select.PlainSelect;
import net.sf.jsqlparser.statement.select.SelectExpressionItem;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.mapping.BoundSql;
import org.apache.ibatis.mapping.SqlSource;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.scripting.xmltags.XMLLanguageDriver;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class FinCashJournalMapperSqlTest {

    @Test
    void dynamicSummarySqlIsValidXmlScript() throws Exception {
        assertThatCode(this::summarySqlSource)
                .doesNotThrowAnyException();
    }

    @Test
    void emptyLedgerSummaryKeepsAllTwelveMetricsNonNullWithCoalesceZero() throws Exception {
        PlainSelect select = parsedSummary(null);

        assertThat(select.getSelectItems()).hasSize(12);
        assertThat(select.getSelectItems()).allSatisfy(item -> {
            assertThat(item).isInstanceOf(SelectExpressionItem.class);
            SelectExpressionItem expressionItem = (SelectExpressionItem) item;
            assertThat(expressionItem.getExpression()).isInstanceOf(Function.class);
            Function coalesce = (Function) expressionItem.getExpression();
            assertThat(coalesce.getName()).isEqualToIgnoringCase("COALESCE");
            assertThat(coalesce.getParameters()).isNotNull();
            assertThat(coalesce.getParameters().getExpressions()).hasSize(2);
            assertThat(coalesce.getParameters().getExpressions().get(1))
                    .isInstanceOfSatisfying(LongValue.class,
                            zero -> assertThat(zero.getValue()).isZero());
        });
        assertThat(select.getSelectItems()).extracting(item ->
                        ((SelectExpressionItem) item).getAlias().getName())
                .containsExactlyInAnyOrder(
                        "todayAmount", "todayCount", "todayMatched", "todayUnmatched",
                        "monthAmount", "monthMatched", "monthUnmatched",
                        "waitingCount", "partialCount", "pendingReviewCount",
                        "exceptionCount", "over24hCount");
    }

    @Test
    void summarySqlBuildsBothCompanyWideAndOwnerScopedForms() throws Exception {
        PlainSelect companyWide = parsedSummary(null);
        PlainSelect scoped = parsedSummary(List.of(11L, 12L));

        assertThat(companyWide.getWhere().toString())
                .containsIgnoringCase("deleted = 0")
                .containsIgnoringCase("record_status = 'active'")
                .doesNotContainIgnoringCase("review_status =")
                .doesNotContainIgnoringCase("owner_id");
        assertThat(scoped.getWhere().toString())
                .containsIgnoringCase("owner_id IN")
                .contains("?, ?");
    }

    @Test
    void legacySearchSqlIsValidXmlScript() throws Exception {
        Method method = FinReceivableCollectionLogMapper.class.getMethod(
                "selectLegacyPage", com.baomidou.mybatisplus.extension.plugins.pagination.Page.class, String.class);
        String script = String.join(" ", method.getAnnotation(Select.class).value());

        assertThatCode(() -> new XMLLanguageDriver()
                .createSqlSource(new Configuration(), script, Map.class))
                .doesNotThrowAnyException();
    }

    private PlainSelect parsedSummary(List<Long> visibleOwnerIds) throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("today", LocalDate.of(2026, 8, 15));
        params.put("monthStart", LocalDate.of(2026, 8, 1));
        params.put("nextMonth", LocalDate.of(2026, 9, 1));
        params.put("visibleOwnerIds", visibleOwnerIds);
        BoundSql boundSql = summarySqlSource().getBoundSql(params);

        net.sf.jsqlparser.statement.select.Select parsed =
                (net.sf.jsqlparser.statement.select.Select) CCJSqlParserUtil.parse(boundSql.getSql());
        return parsed.getSelectBody(PlainSelect.class);
    }

    private SqlSource summarySqlSource() throws Exception {
        Method method = FinCashJournalMapper.class.getMethod(
                "selectSummary", LocalDate.class, LocalDate.class, LocalDate.class, List.class);
        String script = String.join(" ", method.getAnnotation(Select.class).value());
        return new XMLLanguageDriver().createSqlSource(new Configuration(), script, Map.class);
    }
}

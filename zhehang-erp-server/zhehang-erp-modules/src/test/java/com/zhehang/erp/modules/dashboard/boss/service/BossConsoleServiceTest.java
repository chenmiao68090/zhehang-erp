package com.zhehang.erp.modules.dashboard.boss.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.dashboard.boss.mapper.BossConsoleMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BossConsoleServiceTest {

    @Test
    @SuppressWarnings("unchecked")
    void genuineEmptyResultsStillNormalizeToZeroAndEmptyLists() {
        BossConsoleMapper mapper = mock(BossConsoleMapper.class);

        Map<String, Object> result = new BossConsoleService(mapper).overview();

        assertThat((Map<String, Object>) result.get("customerIssue"))
                .containsEntry("todayNew", 0L)
                .containsEntry("unhandled", 0L)
                .containsEntry("overdue", 0L)
                .containsEntry("p0", 0L);
        assertThat((Map<String, Object>) result.get("sales"))
                .containsEntry("todayLeads", 0L)
                .containsEntry("expectAmount", BigDecimal.ZERO);
        assertThat((Map<String, Object>) result.get("receipt"))
                .containsEntry("todayDue", BigDecimal.ZERO)
                .containsEntry("arrearsCount", 0L);
        assertThat((List<Map<String, Object>>) result.get("employees")).isEmpty();
        assertThat(((Map<String, List<Map<String, Object>>>) result.get("exceptions")).values())
                .allSatisfy(items -> assertThat(items).isEmpty());
    }

    @Test
    @SuppressWarnings("unchecked")
    void successfulBusinessValuesRemainUnchanged() {
        BossConsoleMapper mapper = mock(BossConsoleMapper.class);
        when(mapper.customerIssueStat()).thenReturn(Map.of(
                "todayNew", 3L, "unhandled", 4L, "overdue", 1L, "p0", 2L));
        when(mapper.bookkeepingStat()).thenReturn(Map.of(
                "active", 20L, "completed", 8L, "processing", 10L, "overdue", 2L));
        when(mapper.countTodayLeads()).thenReturn(5L);
        when(mapper.countTodayFollows()).thenReturn(9L);
        when(mapper.sumExpectAmount()).thenReturn(new BigDecimal("123.45"));
        when(mapper.sumDealAmountThisMonth()).thenReturn(new BigDecimal("67.89"));
        when(mapper.sumTodayDue()).thenReturn(new BigDecimal("10.00"));
        when(mapper.sumTodayReceived()).thenReturn(new BigDecimal("8.00"));
        when(mapper.sumOverdueArrears()).thenReturn(new BigDecimal("2.00"));
        when(mapper.countArrearsCustomers()).thenReturn(1L);
        Map<String, Object> employee = new HashMap<>();
        employee.put("doneCount", 3L);
        employee.put("totalCount", 4L);
        when(mapper.employeeExec()).thenReturn(new ArrayList<>(List.of(employee)));

        Map<String, Object> result = new BossConsoleService(mapper).overview();

        assertThat((Map<String, Object>) result.get("customerIssue"))
                .containsEntry("todayNew", 3L)
                .containsEntry("p0", 2L);
        assertThat((Map<String, Object>) result.get("sales"))
                .containsEntry("todayLeads", 5L)
                .containsEntry("expectAmount", new BigDecimal("123.45"));
        assertThat((Map<String, Object>) result.get("receipt"))
                .containsEntry("todayReceived", new BigDecimal("8.00"))
                .containsEntry("arrearsCount", 1L);
        assertThat(((List<Map<String, Object>>) result.get("employees")).get(0))
                .containsEntry("doneRate", 75L);
    }

    @Test
    void databaseFailureIsNotReturnedAsAllZeroDashboard() {
        BossConsoleMapper mapper = mock(BossConsoleMapper.class);
        when(mapper.customerIssueStat()).thenThrow(new IllegalStateException("database offline"));

        assertThatThrownBy(() -> new BossConsoleService(mapper).overview())
                .isInstanceOf(BusinessException.class)
                .hasMessage("老板总控台数据加载失败，请稍后重试");
    }

    @Test
    void malformedNumericDataIsNotReturnedAsZero() {
        BossConsoleMapper mapper = mock(BossConsoleMapper.class);
        when(mapper.customerIssueStat()).thenReturn(Map.of("todayNew", "not-a-number"));

        assertThatThrownBy(() -> new BossConsoleService(mapper).overview())
                .isInstanceOf(BusinessException.class)
                .hasMessage("老板总控台数据加载失败，请稍后重试");
    }
}

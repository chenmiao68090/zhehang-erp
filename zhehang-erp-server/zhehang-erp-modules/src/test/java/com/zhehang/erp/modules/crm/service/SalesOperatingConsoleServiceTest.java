package com.zhehang.erp.modules.crm.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.dto.SalesConsoleQuery;
import com.zhehang.erp.modules.crm.mapper.SalesOperatingConsoleMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.crm.support.SalesConsoleQueryContext;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SalesOperatingConsoleServiceTest {

    @Mock private SalesOperatingConsoleMapper mapper;
    @Mock private DataScopeHelper dataScopeHelper;
    private SalesOperatingConsoleService service;

    @BeforeEach
    void setUp() {
        service = new SalesOperatingConsoleService(mapper, dataScopeHelper);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void bossRoleAlwaysUsesCompanyScope() {
        authenticate(7L, 2L, 5, List.of("boss"), false);

        var overview = service.overview(new SalesConsoleQuery());
        assertThat(overview.getViewMode()).isEqualTo("boss");
        assertThat(overview.isHistoryAvailable()).isFalse();
        assertThat(overview.getNewBusinessFunnel())
                .allSatisfy(stage -> assertThat(stage.getConversionRate()).isNull());

        ArgumentCaptor<SalesConsoleQueryContext> captor = ArgumentCaptor.forClass(SalesConsoleQueryContext.class);
        verify(mapper).selectLeadSummary(captor.capture());
        assertThat(captor.getValue().getScopeMode()).isEqualTo("COMPANY");
        assertThat(captor.getValue().getOwnerId()).isNull();
    }

    @Test
    void managerCanOnlyUseOwnDepartmentTree() {
        authenticate(20L, 5L, 4, List.of("dept_manager"), false);
        when(dataScopeHelper.deptSelfAndChildren(5L)).thenReturn(List.of(5L, 6L));
        SalesConsoleQuery query = new SalesConsoleQuery();
        query.setDeptId(9L);

        assertThatThrownBy(() -> service.overview(query))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("数据范围");
    }

    @Test
    void managerCannotForgeEmployeeOutsideDepartmentTree() {
        authenticate(20L, 5L, 4, List.of("dept_manager"), false);
        when(dataScopeHelper.deptSelfAndChildren(5L)).thenReturn(List.of(5L, 6L));
        when(dataScopeHelper.canAccessOwner(99L)).thenReturn(false);
        SalesConsoleQuery query = new SalesConsoleQuery();
        query.setOwnerId(99L);

        assertThatThrownBy(() -> service.overview(query))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("数据范围");
    }

    @Test
    void employeeCannotForgeAnotherEmployee() {
        authenticate(31L, 8L, 5, List.of("sales"), false);
        SalesConsoleQuery query = new SalesConsoleQuery();
        query.setOwnerId(32L);

        assertThatThrownBy(() -> service.overview(query))
                .isInstanceOf(AccessDeniedException.class)
                .hasMessageContaining("自己");
    }

    @Test
    void employeeQueryIsForcedToCurrentUser() {
        authenticate(31L, 8L, 5, List.of("sales"), false);

        assertThat(service.overview(new SalesConsoleQuery()).getViewMode()).isEqualTo("employee");

        ArgumentCaptor<SalesConsoleQueryContext> captor = ArgumentCaptor.forClass(SalesConsoleQueryContext.class);
        verify(mapper).selectLeadSummary(captor.capture());
        assertThat(captor.getValue().getScopeMode()).isEqualTo("SELF");
        assertThat(captor.getValue().getOwnerId()).isEqualTo(31L);
    }

    @Test
    void aiAggregatesUseTheSameEmployeeAndTenantScope() {
        authenticate(31L, 8L, 5, List.of("sales"), false);
        when(mapper.selectSourceQuality(any(), eq(12)))
                .thenReturn(List.of(Map.of("sourceName", "工商公开名单", "leadCount", 3L)));
        when(mapper.selectLossReasons(any(), eq(10)))
                .thenReturn(List.of(Map.of("reason", "无意向或明确拒绝", "leadCount", 1L)));

        Map<String, Object> facts = service.aiAggregateFacts(new SalesConsoleQuery());

        assertThat(facts).containsKeys("sourceQuality", "lossReasons");
        ArgumentCaptor<SalesConsoleQueryContext> captor = ArgumentCaptor.forClass(SalesConsoleQueryContext.class);
        verify(mapper).selectSourceQuality(captor.capture(), eq(12));
        assertThat(captor.getValue().getTenantId()).isEqualTo(9L);
        assertThat(captor.getValue().getScopeMode()).isEqualTo("SELF");
        assertThat(captor.getValue().getOwnerId()).isEqualTo(31L);
    }

    @Test
    void rejectsInvalidDateRange() {
        authenticate(31L, 8L, 5, List.of("sales"), false);
        SalesConsoleQuery query = new SalesConsoleQuery();
        query.setStartDate(LocalDate.now());
        query.setEndDate(LocalDate.now().minusDays(1));

        assertThatThrownBy(() -> service.overview(query))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("结束日期");
    }

    private void authenticate(Long userId, Long deptId, Integer dataScope,
                              List<String> roles, boolean admin) {
        LoginUser user = new LoginUser();
        user.setUserId(userId);
        user.setTenantId(9L);
        user.setDeptId(deptId);
        user.setDataScope(dataScope);
        user.setRoleKeys(roles);
        user.setAdmin(admin);
        user.setUsername("test-user");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));
    }
}

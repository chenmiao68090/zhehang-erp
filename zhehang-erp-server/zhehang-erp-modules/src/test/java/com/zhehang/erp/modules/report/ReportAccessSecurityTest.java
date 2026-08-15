package com.zhehang.erp.modules.report;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.report.controller.ReportDataController;
import com.zhehang.erp.modules.report.controller.ReportDefinitionController;
import com.zhehang.erp.modules.report.controller.ReportScheduleController;
import com.zhehang.erp.modules.report.domain.entity.ReportDataset;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import com.zhehang.erp.modules.report.domain.entity.ReportSchedule;
import com.zhehang.erp.modules.report.mapper.ReportDefinitionMapper;
import com.zhehang.erp.modules.report.service.IReportDefinitionService;
import com.zhehang.erp.modules.report.service.impl.ReportDatasetServiceImpl;
import com.zhehang.erp.modules.report.service.impl.ReportDefinitionServiceImpl;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.mockito.ArgumentCaptor;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReportAccessSecurityTest {

    private static final String PLATFORM_ADMIN_ONLY =
            "T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())";
    private static final String REPORT_READER_GATE =
            "@perm.hasAnyRole('boss', 'super_admin')";

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void tenantBossCannotExecuteCustomSqlButPlatformAccountCan() {
        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
        ReportDefinition sqlReport = definition("sqlQuery", "SELECT 1 AS value");
        when(mapper.selectById(8L)).thenReturn(sqlReport);

        login(22L, true, List.of("boss"));
        assertThatThrownBy(() -> service.executeReport(8L))
                .isInstanceOf(AccessDeniedException.class);
        verify(mapper, never()).executeSelect(anyString());

        login(1L, false, List.of());
        when(mapper.executeSelect("SELECT 1 AS value"))
                .thenReturn(List.of(Map.of("value", 1)));

        assertThat(service.executeReport(8L))
                .containsExactly(Map.of("value", 1));
    }

    @Test
    void tenantBossCanStillExecutePresetReport() {
        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
        ReportDefinition preset = definition("preset", "crm.customer.byLevel");
        when(mapper.selectById(9L)).thenReturn(preset);
        when(mapper.executeSelect(anyString())).thenReturn(List.of(Map.of("value", 3)));

        login(23L, false, List.of("boss"));

        assertThat(service.executeReport(9L))
                .containsExactly(Map.of("value", 3));
    }

    @Test
    void presetQueryFailureIsReportedInsteadOfReturningFabricatedRows() {
        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
        when(mapper.selectById(11L))
                .thenReturn(definition("preset", "crm.customer.byLevel"));
        when(mapper.executeSelect(anyString()))
                .thenThrow(new IllegalStateException("table unavailable"));

        assertThatThrownBy(() -> service.executeReport(11L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("报表数据查询失败");
    }

    @Test
    void unknownPresetAndUnsupportedSourceTypeFailClosed() {
        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
        when(mapper.selectById(12L))
                .thenReturn(definition("preset", "removed.preset"));
        when(mapper.selectById(13L))
                .thenReturn(definition("demo", "anything"));

        assertThatThrownBy(() -> service.executeReport(12L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("预设数据源不存在");
        assertThatThrownBy(() -> service.executeReport(13L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不支持的报表数据源类型");
        verify(mapper, never()).executeSelect(anyString());
    }

    @Test
    void blankCustomSqlFailsClosedForPlatformAccount() {
        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
        when(mapper.selectById(14L)).thenReturn(definition("sql", "  "));
        login(1L, false, List.of());

        assertThatThrownBy(() -> service.executeReport(14L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("自定义 SQL 不能为空");
        verify(mapper, never()).executeSelect(anyString());
    }

    @Test
    void correctedPresetsUseCurrentBusinessTablesAndColumns() {
        Map<String, List<String>> expectedFragments = Map.of(
                "finance.income.monthly", List.of("FROM fin_cash_journal", "receipt_date", "record_status='active'"),
                "hrm.employee.byDept", List.of("d.dept_name", "FROM org_employee"),
                "hrm.attendance.monthly", List.of("attendance_date", "FROM hrm_attendance"),
                "sales.order.monthly", List.of("FROM biz_order", "SUM(total_amount)"),
                "supply.purchase.monthly", List.of("FROM supply_purchase_order", "SUM(total_amount)"));

        for (Map.Entry<String, List<String>> entry : expectedFragments.entrySet()) {
            ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
            ReportDatasetServiceImpl service = new ReportDatasetServiceImpl(mapper);
            when(mapper.selectById(15L)).thenReturn(definition("preset", entry.getKey()));
            when(mapper.executeSelect(anyString())).thenReturn(List.of());

            service.executeReport(15L);

            ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
            verify(mapper).executeSelect(sql.capture());
            assertThat(sql.getValue()).contains(entry.getValue().toArray(String[]::new));
        }
    }

    @Test
    void reportReadGateExcludesDepartmentManagersUntilPresetDataHasDataScope() {
        assertThat(ReportDefinitionController.class.getAnnotation(PreAuthorize.class).value())
                .isEqualTo(REPORT_READER_GATE);
        assertThat(ReportDataController.class.getAnnotation(PreAuthorize.class).value())
                .isEqualTo(REPORT_READER_GATE);
        assertThat(ReportScheduleController.class.getAnnotation(PreAuthorize.class).value())
                .isEqualTo(REPORT_READER_GATE);
    }

    @Test
    void tenantBossListResponseDoesNotExposeCustomSqlDefinition() {
        IReportDefinitionService definitionService = mock(IReportDefinitionService.class);
        ReportDefinitionController controller = new ReportDefinitionController(definitionService);
        Page<ReportDefinition> page = new Page<>(1, 10);
        page.setRecords(new ArrayList<>(List.of(
                definition("sql", "SELECT secret FROM tenant_table"),
                definition("sqlQuery", "SELECT other_secret FROM tenant_table"),
                definition("preset", "crm.customer.byLevel"))));
        when(definitionService.selectPage(1, 10, null, null, null, null)).thenReturn(page);
        when(definitionService.listByCategory("crm"))
                .thenReturn(new ArrayList<>(page.getRecords()));

        login(26L, true, List.of("boss"));

        assertThat(controller.list(1, 10, null, null, null, null).getData().getRecords())
                .extracting(ReportDefinition::getDataSourceType)
                .containsExactly("preset");
        assertThat(controller.listByCategory("crm").getData())
                .extracting(ReportDefinition::getDataSourceType)
                .containsExactly("preset");
    }

    @Test
    void tenantBossCannotReadCustomSqlDefinitionOrDatasetMetadata() {
        ReportDefinition sqlReport = definition("sql", "SELECT secret FROM tenant_table");
        IReportDefinitionService definitionService = mock(IReportDefinitionService.class);
        when(definitionService.getById(10L)).thenReturn(sqlReport);
        ReportDefinitionController controller = new ReportDefinitionController(definitionService);

        ReportDefinitionMapper mapper = mock(ReportDefinitionMapper.class);
        when(mapper.selectById(10L)).thenReturn(sqlReport);
        ReportDatasetServiceImpl datasetService = new ReportDatasetServiceImpl(mapper);

        login(24L, true, List.of("boss"));

        assertThatThrownBy(() -> controller.getInfo(10L))
                .isInstanceOf(AccessDeniedException.class);
        assertThatThrownBy(() -> datasetService.listByReportId(10L))
                .isInstanceOf(AccessDeniedException.class);
    }

    @Test
    void reportWritesRequireExactPlatformAccountInsteadOfClassManagerGate() throws Exception {
        assertPlatformGate(ReportDefinitionController.class, "add", ReportDefinition.class);
        assertPlatformGate(ReportDefinitionController.class, "edit", ReportDefinition.class);
        assertPlatformGate(ReportDefinitionController.class, "remove", Long.class);
        assertPlatformGate(ReportDefinitionController.class, "copy", Long.class);

        assertPlatformGate(ReportDataController.class, "addDataset", ReportDataset.class);
        assertPlatformGate(ReportDataController.class, "updateDataset", ReportDataset.class);
        assertPlatformGate(ReportDataController.class, "removeDataset", Long.class);

        assertPlatformGate(ReportScheduleController.class, "add", ReportSchedule.class);
        assertPlatformGate(ReportScheduleController.class, "edit", ReportSchedule.class);
        assertPlatformGate(ReportScheduleController.class, "remove", Long.class);
    }

    @Test
    void copyServiceAlsoFailsClosedWhenCalledOutsideControllerProxy() {
        ReportDefinitionServiceImpl service = new ReportDefinitionServiceImpl();
        login(25L, true, List.of("boss"));

        assertThatThrownBy(() -> service.copyReport(1L))
                .isInstanceOf(AccessDeniedException.class);
    }

    private ReportDefinition definition(String dataSourceType, String sqlQuery) {
        ReportDefinition definition = new ReportDefinition();
        definition.setDataSourceType(dataSourceType);
        definition.setSqlQuery(sqlQuery);
        return definition;
    }

    private void login(Long userId, boolean admin, List<String> roles) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(userId);
        loginUser.setUsername("test-" + userId);
        loginUser.setAdmin(admin);
        loginUser.setTenantId(7L);
        loginUser.setRoleKeys(roles);
        loginUser.setPermissions(Set.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities()));
    }

    private void assertPlatformGate(Class<?> controllerClass, String methodName,
                                    Class<?>... parameterTypes) throws Exception {
        Method method = controllerClass.getDeclaredMethod(methodName, parameterTypes);
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertThat(annotation)
                .as("%s.%s must be restricted to the unique platform account",
                        controllerClass.getSimpleName(), methodName)
                .isNotNull();
        assertThat(annotation.value()).isEqualTo(PLATFORM_ADMIN_ONLY);
    }
}

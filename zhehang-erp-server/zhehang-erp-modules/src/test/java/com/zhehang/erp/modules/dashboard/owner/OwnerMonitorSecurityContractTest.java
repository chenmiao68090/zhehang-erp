package com.zhehang.erp.modules.dashboard.owner;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.controller.CrmCustomerIssueController;
import com.zhehang.erp.modules.crm.service.ICrmCustomerIssueService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.dashboard.cockpit.controller.CockpitController;
import com.zhehang.erp.modules.dashboard.owner.controller.OwnerMonitorController;
import com.zhehang.erp.modules.finance.service.ICashJournalService;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.BinaryOperator;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class OwnerMonitorSecurityContractTest {

    private static final String OWNER_ROLE_GATE =
            "@perm.hasAnyRole('boss', 'super_admin')";

    private static final Set<String> SENSITIVE_COCKPIT_ENDPOINTS = Set.of(
            "GET /kpi",
            "GET /revenue-trend",
            "GET /revenue-drill",
            "GET /customer-source",
            "GET /recent-events",
            "GET /region-distribution",
            "GET /alerts",
            "POST /ai-summary"
    );

    private static final Set<String> EMPLOYEE_COCKPIT_ENDPOINTS = Set.of(
            "GET /sales-rank",
            "GET /biz-perf",
            "GET /perf-rank"
    );

    @Test
    void ownerMonitorHasExactOwnerGateAndStableRoute() throws Exception {
        RequestMapping controllerRoute = OwnerMonitorController.class.getAnnotation(RequestMapping.class);
        PreAuthorize controllerGate = OwnerMonitorController.class.getAnnotation(PreAuthorize.class);
        Method cashStats = OwnerMonitorController.class.getDeclaredMethod("cashStats");
        GetMapping cashStatsRoute = cashStats.getAnnotation(GetMapping.class);

        assertThat(controllerRoute).isNotNull();
        assertThat(controllerRoute.value()).containsExactly("/dashboard/owner-monitor");
        assertThat(controllerGate).isNotNull();
        assertThat(controllerGate.value()).isEqualTo(OWNER_ROLE_GATE);
        assertThat(cashStatsRoute).isNotNull();
        assertThat(cashStatsRoute.value()).containsExactly("/cash-stats");
    }

    @Test
    void cashStatsDelegatesToTheExistingCashJournalSourceOfTruth() {
        ICashJournalService cashJournalService = mock(ICashJournalService.class);
        Map<String, Object> registeredCash = new LinkedHashMap<>();
        registeredCash.put("todayAmount", 1200);
        registeredCash.put("pendingReviewCount", 2);
        when(cashJournalService.stats()).thenReturn(registeredCash);

        R<Map<String, Object>> response = new OwnerMonitorController(cashJournalService).cashStats();

        assertThat(response.getCode()).isEqualTo(200);
        assertThat(response.getData()).isSameAs(registeredCash);
        verify(cashJournalService).stats();
    }

    @Test
    void allEightSensitiveCockpitEndpointsKeepTheExactOwnerGate() {
        assertThat(CockpitController.class.getAnnotation(PreAuthorize.class))
                .as("Cockpit must not use a class gate that would also block employee endpoints")
                .isNull();

        Map<String, Method> methodsByEndpoint = cockpitMethodsByEndpoint();
        assertThat(methodsByEndpoint.keySet()).containsAll(SENSITIVE_COCKPIT_ENDPOINTS);

        for (String endpoint : SENSITIVE_COCKPIT_ENDPOINTS) {
            Method method = methodsByEndpoint.get(endpoint);
            assertThat(method.getAnnotation(PreAuthorize.class))
                    .as("%s must keep its owner-only backend gate", endpoint)
                    .isNotNull()
                    .extracting(PreAuthorize::value)
                    .isEqualTo(OWNER_ROLE_GATE);
        }
    }

    @Test
    void employeeCockpitEndpointsRemainOutsideTheOwnerOnlyGate() {
        Map<String, Method> methodsByEndpoint = cockpitMethodsByEndpoint();
        assertThat(methodsByEndpoint.keySet()).containsAll(EMPLOYEE_COCKPIT_ENDPOINTS);

        for (String endpoint : EMPLOYEE_COCKPIT_ENDPOINTS) {
            assertThat(methodsByEndpoint.get(endpoint).getAnnotation(PreAuthorize.class))
                    .as("%s must remain available at its existing authenticated-user boundary", endpoint)
                    .isNull();
        }
    }

    @Test
    void customerIssueDrillDownForwardsTheSameOpenFiltersAsTheBossCards() {
        ICrmCustomerIssueService issueService = mock(ICrmCustomerIssueService.class);
        CrmCustomerIssueController controller = new CrmCustomerIssueController(
                issueService, mock(DataScopeHelper.class));

        controller.list(1, 20, null, null, null, null, null,
                false, true, true);
        controller.list(1, 20, null, null, null, "P0", null,
                false, true, false);

        verify(issueService).selectPage(1, 20, null, null, null, null, null,
                false, true, true);
        verify(issueService).selectPage(1, 20, null, null, null, "P0", null,
                false, true, false);
    }

    private Map<String, Method> cockpitMethodsByEndpoint() {
        return Arrays.stream(CockpitController.class.getDeclaredMethods())
                .flatMap(method -> endpointKeys(method).stream().map(key -> Map.entry(key, method)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        duplicateEndpoint(), LinkedHashMap::new));
    }

    private List<String> endpointKeys(Method method) {
        GetMapping get = method.getAnnotation(GetMapping.class);
        if (get != null) {
            return Arrays.stream(get.value()).map(path -> "GET " + path).toList();
        }
        PostMapping post = method.getAnnotation(PostMapping.class);
        if (post != null) {
            return Arrays.stream(post.value()).map(path -> "POST " + path).toList();
        }
        return List.of();
    }

    private BinaryOperator<Method> duplicateEndpoint() {
        return (first, second) -> {
            throw new AssertionError("Cockpit contains duplicate endpoint mappings");
        };
    }
}

package com.zhehang.erp.modules.seal.controller;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import com.zhehang.erp.modules.seal.service.SealPublicTokenService;
import com.zhehang.erp.security.domain.LoginUser;
import com.zhehang.erp.security.service.PermissionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.Method;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class SealPublicControllerSecurityTest {

    private static final String TOKEN = "d".repeat(64);
    private static final String ISSUE_TOKEN_ROLE_GATE =
            "@perm.hasAnyRole('boss', 'manager', 'dept_manager', 'finance', 'finance_hq', 'sales', 'online_sales')";
    private static final String[] ISSUE_TOKEN_ROLES =
            {"boss", "manager", "dept_manager", "finance", "finance_hq", "sales", "online_sales"};

    private BizSealOrderMapper orderMapper;
    private SealPublicTokenService tokenService;
    private SealPublicController controller;

    @BeforeEach
    void setUp() {
        orderMapper = mock(BizSealOrderMapper.class);
        tokenService = mock(SealPublicTokenService.class);
        controller = new SealPublicController(orderMapper, tokenService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void issueTokenAllowsOrderCenterRole() throws Exception {
        assertIssueTokenRoleGate();
        loginAs("sales");

        assertThat(new PermissionService().hasAnyRole(ISSUE_TOKEN_ROLES)).isTrue();
    }

    @Test
    void issueTokenRejectsUnrelatedRole() throws Exception {
        assertIssueTokenRoleGate();
        loginAs("hr");

        assertThat(new PermissionService().hasAnyRole(ISSUE_TOKEN_ROLES)).isFalse();
    }

    @Test
    void publicSubmissionUsesTicketTenantAndNeverAcceptsInternalFinancialFields() {
        when(tokenService.beginSubmission(TOKEN)).thenReturn(new SealPublicTokenService.Ticket(7L, 19L));
        when(orderMapper.insert(any(BizSealOrder.class))).thenReturn(1);
        BizSealOrder payload = validPayload();
        payload.setTenantId(999L);
        payload.setFee(new java.math.BigDecimal("99999"));
        payload.setStatus("done");
        payload.setIdCardFront("88");

        controller.submit(TOKEN, payload);

        ArgumentCaptor<BizSealOrder> captor = ArgumentCaptor.forClass(BizSealOrder.class);
        verify(orderMapper).insert(captor.capture());
        BizSealOrder saved = captor.getValue();
        assertThat(saved.getTenantId()).isEqualTo(7L);
        assertThat(saved.getCreateBy()).isEqualTo(19L);
        assertThat(saved.getFee()).isNull();
        assertThat(saved.getStatus()).isEqualTo("pending");
        assertThat(saved.getIdCardFront()).isNull();
        verify(tokenService).completeSubmission(TOKEN);
    }

    @Test
    void failedInsertIsNotReportedAsSuccessAndKeepsTicketRetryable() {
        when(tokenService.beginSubmission(TOKEN)).thenReturn(new SealPublicTokenService.Ticket(7L, 19L));
        when(orderMapper.insert(any(BizSealOrder.class))).thenReturn(0);

        assertThatThrownBy(() -> controller.submit(TOKEN, validPayload()))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("保存失败");

        verify(tokenService, never()).completeSubmission(TOKEN);
        verify(tokenService).releaseSubmission(TOKEN);
    }

    private BizSealOrder validPayload() {
        BizSealOrder payload = new BizSealOrder();
        payload.setCompanyName("杭州测试企业有限公司");
        payload.setPhone("13800000000");
        payload.setSealStatus("新设刻章");
        payload.setSealCity("杭州");
        payload.setSealMaterial("光敏");
        payload.setSealTypes("法定名称章");
        payload.setRecordStatus("备案刻章");
        return payload;
    }

    private void assertIssueTokenRoleGate() throws Exception {
        Method method = SealPublicController.class.getDeclaredMethod("issueToken");
        PreAuthorize annotation = method.getAnnotation(PreAuthorize.class);
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(ISSUE_TOKEN_ROLE_GATE);
    }

    private void loginAs(String roleKey) {
        LoginUser loginUser = new LoginUser();
        loginUser.setUserId(99L);
        loginUser.setUsername("security-test");
        loginUser.setTenantId(7L);
        loginUser.setAdmin(false);
        loginUser.setRoleKeys(List.of(roleKey));
        loginUser.setPermissions(Set.of());
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(loginUser, null, loginUser.getAuthorities()));
    }
}

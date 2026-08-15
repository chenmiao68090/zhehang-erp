package com.zhehang.erp.modules.task.controller;

import com.zhehang.erp.modules.crm.domain.entity.CrmCustomer;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.task.domain.BizSatisfaction;
import com.zhehang.erp.modules.task.mapper.BizSatisfactionMapper;
import com.zhehang.erp.security.domain.LoginUser;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.ArgumentCaptor;

class BizSatisfactionControllerTest {

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void completeUpdatesPendingRecordInsteadOfCreatingDuplicate() {
        BizSatisfactionMapper mapper = mock(BizSatisfactionMapper.class);
        BizSatisfaction existing = new BizSatisfaction();
        existing.setId(12L);
        existing.setCustomerId(88L);
        existing.setVisitorId(7L);
        when(mapper.selectById(12L)).thenReturn(existing);
        when(mapper.update(any(BizSatisfaction.class), any())).thenReturn(1);

        BizSatisfaction submitted = new BizSatisfaction();
        submitted.setVisitMethod("phone");
        submitted.setScore(5);
        submitted.setProblems("服务满意");
        submitted.setVisitTime(LocalDateTime.of(2026, 7, 14, 9, 30));

        var response = controller(mapper).complete(12L, submitted);

        assertThat(response.getCode()).isEqualTo(200);
        assertThat(existing.getCustomerId()).isEqualTo(88L);
        ArgumentCaptor<BizSatisfaction> update = ArgumentCaptor.forClass(BizSatisfaction.class);
        verify(mapper).update(update.capture(), any());
        assertThat(update.getValue().getScore()).isEqualTo(5);
        assertThat(update.getValue().getVisitMethod()).isEqualTo("phone");
        assertThat(update.getValue().getProblems()).isEqualTo("服务满意");
        assertThat(update.getValue().getVisitTime()).isNotNull();
        verify(mapper, never()).insert(any());
    }

    @Test
    void completeIsIdempotentForAlreadyCompletedRecord() {
        BizSatisfactionMapper mapper = mock(BizSatisfactionMapper.class);
        BizSatisfaction existing = new BizSatisfaction();
        existing.setId(12L);
        existing.setVisitorId(7L);
        existing.setVisitTime(LocalDateTime.of(2026, 7, 14, 9, 30));
        existing.setScore(5);
        when(mapper.selectById(12L)).thenReturn(existing);

        var response = controller(mapper).complete(12L, new BizSatisfaction());

        assertThat(response.getCode()).isEqualTo(200);
        verify(mapper, never()).update(any(), any());
        verify(mapper, never()).insert(any());
    }

    @Test
    void completeRejectsMissingRealScoreWithoutChangingPendingRecord() {
        BizSatisfactionMapper mapper = mock(BizSatisfactionMapper.class);
        BizSatisfaction existing = new BizSatisfaction();
        existing.setId(12L);
        existing.setVisitorId(7L);
        when(mapper.selectById(12L)).thenReturn(existing);
        BizSatisfaction submitted = new BizSatisfaction();
        submitted.setVisitMethod("phone");

        var response = controller(mapper).complete(12L, submitted);

        assertThat(response.getCode()).isNotEqualTo(200);
        assertThat(existing.getVisitTime()).isNull();
        verify(mapper, never()).update(any(), any());
        verify(mapper, never()).insert(any());
    }

    @Test
    void addUsesProductionSchemaAndKeepsFiveStarScore() {
        BizSatisfactionMapper mapper = mock(BizSatisfactionMapper.class);
        BizSatisfaction submitted = new BizSatisfaction();
        submitted.setCustomerId(88L);
        submitted.setVisitMethod("meeting");
        submitted.setScore(5);
        submitted.setProblems("无");

        var response = controller(mapper).add(submitted);

        assertThat(response.getCode()).isEqualTo(200);
        ArgumentCaptor<BizSatisfaction> inserted = ArgumentCaptor.forClass(BizSatisfaction.class);
        verify(mapper).insert(inserted.capture());
        assertThat(inserted.getValue().getVisitNo()).startsWith("HF");
        assertThat(inserted.getValue().getVisitType()).isEqualTo("manual");
        assertThat(inserted.getValue().getScore()).isEqualTo(5);
        assertThat(inserted.getValue().getVisitTime()).isNotNull();
    }

    @Test
    void salesCannotCompleteAnotherVisitorsRecord() {
        BizSatisfactionMapper mapper = mock(BizSatisfactionMapper.class);
        BizSatisfaction existing = new BizSatisfaction();
        existing.setId(12L);
        existing.setVisitorId(8L);
        when(mapper.selectById(12L)).thenReturn(existing);

        BizSatisfaction submitted = new BizSatisfaction();
        submitted.setVisitMethod("phone");
        submitted.setScore(5);

        var response = controller(mapper).complete(12L, submitted);

        assertThat(response.getCode()).isNotEqualTo(200);
        assertThat(response.getMessage()).contains("无权");
        verify(mapper, never()).update(any(), any());
    }

    @Test
    void controllerRequiresARealBusinessRole() {
        PreAuthorize guard = BizSatisfactionController.class.getAnnotation(PreAuthorize.class);
        assertThat(guard).isNotNull();
        assertThat(guard.value()).contains("sales", "boss");
    }

    private BizSatisfactionController controller(BizSatisfactionMapper mapper) {
        LoginUser user = new LoginUser();
        user.setUserId(7L);
        user.setUsername("sales-user");
        user.setRoleKeys(List.of("sales"));
        user.setPermissions(Set.of("crm:lead:list"));
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities()));

        CrmCustomerMapper customerMapper = mock(CrmCustomerMapper.class);
        CrmCustomer customer = new CrmCustomer();
        customer.setId(88L);
        customer.setOwnerId(7L);
        customer.setDeptId(3L);
        when(customerMapper.selectById(88L)).thenReturn(customer);

        DataScopeHelper dataScopeHelper = mock(DataScopeHelper.class);
        when(dataScopeHelper.canAccess(7L, 3L)).thenReturn(true);
        return new BizSatisfactionController(mapper, customerMapper, dataScopeHelper);
    }
}

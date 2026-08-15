package com.zhehang.erp.modules.crm.service.impl;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.domain.entity.CrmCustomerIssue;
import com.zhehang.erp.modules.crm.mapper.CrmCustomerIssueLogMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImMessageMapper;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImAccessService;
import com.zhehang.erp.modules.im.service.ImMessagingService;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.mockStatic;

class CrmCustomerIssueStrictOutboxTest {
    private ImNotificationOutboxService outboxService;
    private ImTaskQueryMapper recipientMapper;
    private CrmCustomerIssueServiceImpl service;

    @BeforeEach
    void setUp() {
        outboxService = mock(ImNotificationOutboxService.class);
        recipientMapper = mock(ImTaskQueryMapper.class);
        service = new CrmCustomerIssueServiceImpl(
                mock(ImMessageMapper.class),
                mock(ImAccessService.class),
                mock(ImMessagingService.class),
                mock(CrmCustomerIssueLogMapper.class),
                mock(DataScopeHelper.class),
                mock(SysUserMapper.class),
                outboxService,
                recipientMapper);
    }

    @Test
    void customerIssueUsesStrictOutboxWithOwnerAndDepartmentManager() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(7L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);

            ReflectionTestUtils.invokeMethod(service, "notifyIssue", issue(), "assigned_88",
                    "客户问题已分配", "请及时处理", "P1");
        }

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getEventId()).isEqualTo("crm-issue:100:assigned_88");
        assertThat(event.getValue().getRecipientIds()).containsExactly(40L, 21L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(40L);
        assertThat(event.getValue().getActionUrl()).isEqualTo("/customer-issue/list?issueId=100");
        assertThat(event.getValue().getImportant()).isTrue();
    }

    @Test
    void customerIssueOutboxFailurePropagatesToRollbackBusinessTransaction() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(outboxService).enqueueBusinessEvent(any());

        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentTenantId).thenReturn(7L);
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);

            assertThatThrownBy(() -> ReflectionTestUtils.invokeMethod(service, "notifyIssue", issue(),
                    "created", "新客户问题待处理", "请及时处理", "P1"))
                    .isInstanceOf(IllegalStateException.class)
                    .hasMessageContaining("outbox unavailable");
        }
    }

    private CrmCustomerIssue issue() {
        CrmCustomerIssue issue = new CrmCustomerIssue();
        issue.setId(100L);
        issue.setIssueNo("GD20260712001");
        issue.setCustomerName("示例客户");
        issue.setOwnerId(40L);
        issue.setAssistId(null);
        issue.setDeptId(5L);
        issue.setStatus("pending");
        issue.setPriority("P1");
        issue.setDeadline(LocalDateTime.of(2026, 7, 13, 18, 0));
        return issue;
    }
}

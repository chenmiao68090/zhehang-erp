package com.zhehang.erp.modules.dashboard.service.impl;

import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.dashboard.domain.entity.DailyReport;
import com.zhehang.erp.modules.dashboard.mapper.DailyReportMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.MockedStatic;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.verify;

class DailyReportNotificationTest {
    private DailyReportMapper reportMapper;
    private ImBusinessNotificationPublisher publisher;
    private DailyReportServiceImpl service;

    @BeforeEach
    void setUp() {
        reportMapper = mock(DailyReportMapper.class);
        publisher = mock(ImBusinessNotificationPublisher.class);
        service = new DailyReportServiceImpl(mock(OrgEmployeeMapper.class), publisher);
        ReflectionTestUtils.setField(service, "baseMapper", reportMapper);
        doAnswer(invocation -> {
            DailyReport saved = invocation.getArgument(0);
            saved.setId(18L);
            return 1;
        }).when(reportMapper).insert(any(DailyReport.class));
    }

    @Test
    void ccUsesReportIdAndDashboardPageInsteadOfApiAddress() {
        withUser(() -> service.add(report()));

        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(publisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("daily-report:18:cc");
        assertThat(notice.getValue().getRecipientIds()).containsExactly(21L, 21L);
        assertThat(notice.getValue().getResponsibleId()).isEqualTo(9L);
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/dashboard/home");
    }

    @Test
    void outboxFailurePropagatesToRollbackReport() {
        doThrow(new IllegalStateException("outbox unavailable")).when(publisher).publish(any());

        assertThatThrownBy(() -> withUser(() -> service.add(report())))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    private DailyReport report() {
        DailyReport report = new DailyReport();
        report.setCcUserIds("21, 21, bad");
        return report;
    }

    private void withUser(Runnable action) {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(9L);
            security.when(SecurityUtils::getCurrentUsername).thenReturn("日报作者");
            action.run();
        }
    }
}

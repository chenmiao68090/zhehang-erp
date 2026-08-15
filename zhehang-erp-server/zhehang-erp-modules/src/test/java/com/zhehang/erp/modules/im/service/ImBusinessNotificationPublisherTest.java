package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImModels;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class ImBusinessNotificationPublisherTest {
    private ImNotificationOutboxService outboxService;
    private ImBusinessNotificationPublisher publisher;

    @BeforeEach
    void setUp() {
        outboxService = mock(ImNotificationOutboxService.class);
        publisher = new ImBusinessNotificationPublisher(outboxService);
    }

    @Test
    void normalizesRecipientsAndUsesStrictOutboxFacade() {
        publisher.publish(notice(Arrays.asList(21L, null, 21L, 22L)));

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getEventId()).isEqualTo("daily-report:18:cc");
        assertThat(event.getValue().getEventType()).isEqualTo("daily_report.cc");
        assertThat(event.getValue().getRecipientIds()).containsExactly(21L, 22L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(21L);
        assertThat(event.getValue().getBusinessType()).isEqualTo("daily_report");
        assertThat(event.getValue().getBusinessId()).isEqualTo(18L);
        assertThat(event.getValue().getActionUrl()).isEqualTo("/dashboard/home");
    }

    @Test
    void rejectsEmptyRecipientsBeforeWritingOutbox() {
        assertThatThrownBy(() -> publisher.publish(notice(Arrays.asList(null, null))))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("接收人");
        verify(outboxService, never()).enqueueBusinessEvent(any());
    }

    @Test
    void propagatesStrictOutboxFailureToBusinessCaller() {
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(outboxService).enqueueBusinessEvent(any());

        assertThatThrownBy(() -> publisher.publish(notice(List.of(21L))))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    private ImBusinessNotificationPublisher.Notice notice(List<Long> recipients) {
        return ImBusinessNotificationPublisher.Notice.builder()
                .eventId("daily-report:18:cc")
                .eventType("daily_report.cc")
                .title("工作日报抄送")
                .text("同事抄送了一份工作日报给你")
                .recipientIds(recipients)
                .businessType("daily_report")
                .businessId(18L)
                .currentStatus("submitted")
                .requirement("请查看")
                .actionLabel("查看日报")
                .actionUrl("/dashboard/home")
                .build();
    }
}

package com.zhehang.erp.modules.review.service;

import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImTaskQueryMapper;
import com.zhehang.erp.modules.im.service.ImNotificationOutboxService;
import com.zhehang.erp.modules.review.constant.ReviewConst;
import com.zhehang.erp.modules.review.domain.entity.OrderReview;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ReviewImNotificationServiceTest {
    private ImNotificationOutboxService outboxService;
    private ImTaskQueryMapper recipientMapper;
    private ReviewImNotificationService service;

    @BeforeEach
    void setUp() {
        outboxService = mock(ImNotificationOutboxService.class);
        recipientMapper = mock(ImTaskQueryMapper.class);
        service = new ReviewImNotificationService(outboxService, recipientMapper);
    }

    @Test
    void activatedReviewNotifiesSalesAndDepartmentManagerWithTraceableEvent() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));

        service.notifyTransition(review(), ReviewImNotificationService.ACTIVATED, 701L, 30L, "到账无误");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getEventId()).isEqualTo("review:100:activated:701");
        assertThat(event.getValue().getRecipientIds()).containsExactly(21L, 9L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(21L);
        assertThat(event.getValue().getBusinessType()).isEqualTo("review");
        assertThat(event.getValue().getBusinessId()).isEqualTo(100L);
        assertThat(event.getValue().getCurrentStatus()).isEqualTo("pending_assign");
        assertThat(event.getValue().getActionUrl()).isEqualTo("/business-review?reviewId=100");
        assertThat(event.getValue().getRequirement()).contains("指定办事人员");
    }

    @Test
    void assignmentOnlyNotifiesTheAssignedHandler() {
        OrderReview review = review();
        review.setHandlerUserId(40L);
        review.setHandlerName("办事员");

        service.notifyTransition(review, ReviewImNotificationService.HANDLER_ASSIGNED,
                702L, 21L, "两天内完成");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(40L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(40L);
        assertThat(event.getValue().getActionLabel()).isEqualTo("去接收");
        assertThat(event.getValue().getCurrentStatus()).isEqualTo("pending_accept");
    }

    @Test
    void activatedReviewEscalatesToBossWhenDepartmentHasNoManager() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of());
        when(recipientMapper.activeUserIdsByRoleKeys(List.of("boss"), 7L))
                .thenReturn(List.of(2L));

        service.notifyTransition(review(), ReviewImNotificationService.ACTIVATED,
                704L, 30L, null);

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(2L, 9L);
        assertThat(event.getValue().getResponsibleId()).isEqualTo(2L);
    }

    @Test
    void completionRejectionIsImportantAndReturnsToHandler() {
        OrderReview review = review();
        review.setHandlerUserId(40L);
        review.setReviewStatus(ReviewConst.COMPLETE_REJECTED);

        service.notifyTransition(review, ReviewImNotificationService.COMPLETE_REJECTED,
                703L, 9L, "凭证缺少盖章页");

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(40L);
        assertThat(event.getValue().getImportant()).isTrue();
        assertThat(event.getValue().getRequirement()).contains("凭证缺少盖章页");
    }

    @Test
    void outboxFailurePropagatesToRollbackReviewTransition() {
        when(recipientMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(21L));
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(outboxService).enqueueBusinessEvent(any());

        assertThatThrownBy(() -> service.notifyTransition(review(), ReviewImNotificationService.ACTIVATED,
                705L, 30L, null))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    @Test
    void missingHandlerFailsAssignmentInsteadOfSilentlyDroppingTheEvent() {
        OrderReview review = review();

        assertThatThrownBy(() -> service.notifyTransition(review, ReviewImNotificationService.HANDLER_ASSIGNED,
                706L, 21L, null))
                .isInstanceOf(com.zhehang.erp.common.core.exception.BusinessException.class)
                .hasMessageContaining("接收人");
        verify(outboxService, never()).enqueueBusinessEvent(any());
    }

    @Test
    void selfAssignedHandlerStillReceivesTheBusinessEvent() {
        OrderReview review = review();
        review.setHandlerUserId(21L);

        service.notifyTransition(review, ReviewImNotificationService.HANDLER_ASSIGNED,
                707L, 21L, null);

        ArgumentCaptor<ImModels.BusinessNotification> event =
                ArgumentCaptor.forClass(ImModels.BusinessNotification.class);
        verify(outboxService).enqueueBusinessEvent(event.capture());
        assertThat(event.getValue().getRecipientIds()).containsExactly(21L);
    }

    private OrderReview review() {
        OrderReview review = new OrderReview();
        review.setId(100L);
        review.setTenantId(7L);
        review.setReviewNo("SD202607120000100");
        review.setCustomerName("示例客户");
        review.setReceivableAmount(new BigDecimal("9800.00"));
        review.setSalesUserId(9L);
        review.setDeptId(5L);
        review.setReviewStatus(ReviewConst.ACCEPT_PENDING);
        return review;
    }
}

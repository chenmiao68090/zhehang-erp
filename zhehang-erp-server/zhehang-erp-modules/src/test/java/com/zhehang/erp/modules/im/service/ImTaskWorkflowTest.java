package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ImTaskWorkflowTest {
    @Test
    void supportsCompleteWorkLoopAndRework() {
        assertThatCode(() -> ImTaskWorkflow.requireTransition("pending_accept", "in_progress")).doesNotThrowAnyException();
        assertThatCode(() -> ImTaskWorkflow.requireTransition("in_progress", "pending_review")).doesNotThrowAnyException();
        assertThatCode(() -> ImTaskWorkflow.requireTransition("pending_review", "rejected")).doesNotThrowAnyException();
        assertThatCode(() -> ImTaskWorkflow.requireTransition("rejected", "pending_review")).doesNotThrowAnyException();
        assertThatCode(() -> ImTaskWorkflow.requireTransition("pending_review", "completed")).doesNotThrowAnyException();
    }

    @Test
    void rejectsSkippingAcceptanceOrReview() {
        assertThatThrownBy(() -> ImTaskWorkflow.requireTransition("pending_accept", "completed"))
                .isInstanceOf(BusinessException.class);
        assertThatThrownBy(() -> ImTaskWorkflow.requireTransition("in_progress", "completed"))
                .isInstanceOf(BusinessException.class);
    }

    @Test
    void overdueIsSupplementaryAndRejectedHasPriority() {
        assertThat(ImTaskWorkflow.displayState("in_progress", true)).isEqualTo("overdue");
        assertThat(ImTaskWorkflow.displayState("rejected", true)).isEqualTo("rejected");
        assertThat(ImTaskWorkflow.displayState("completed", true)).isEqualTo("completed");
    }
}

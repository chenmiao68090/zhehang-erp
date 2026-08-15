package com.zhehang.erp.modules.hrm.service.impl;

import com.zhehang.erp.modules.hrm.domain.entity.HrmInterviewRecord;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;
import com.zhehang.erp.modules.hrm.mapper.HrmInterviewRecordMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmResumeMapper;
import com.zhehang.erp.modules.hrm.service.IHrmOnboardingService;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HrmInterviewNotificationTest {
    private HrmInterviewRecordMapper recordMapper;
    private HrmResumeMapper resumeMapper;
    private IHrmOnboardingService onboardingService;
    private ImBusinessNotificationPublisher publisher;
    private HrmInterviewRecordServiceImpl service;

    @BeforeEach
    void setUp() {
        recordMapper = mock(HrmInterviewRecordMapper.class);
        resumeMapper = mock(HrmResumeMapper.class);
        onboardingService = mock(IHrmOnboardingService.class);
        publisher = mock(ImBusinessNotificationPublisher.class);
        service = new HrmInterviewRecordServiceImpl(recordMapper, resumeMapper, onboardingService, publisher);
    }

    @Test
    void createdInterviewUsesRecordIdForUniqueImEvent() {
        when(resumeMapper.selectById(12L)).thenReturn(resume());
        doAnswer(invocation -> {
            HrmInterviewRecord saved = invocation.getArgument(0);
            saved.setId(88L);
            return 1;
        }).when(recordMapper).insert(any(HrmInterviewRecord.class));

        service.createAndApply(record());

        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(publisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("hrm-interview:88:assigned:21");
        assertThat(notice.getValue().getBusinessId()).isEqualTo(88L);
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/hrm/recruit");
    }

    @Test
    void outboxFailurePropagatesToRollbackInterviewWrite() {
        when(resumeMapper.selectById(12L)).thenReturn(resume());
        doAnswer(invocation -> {
            HrmInterviewRecord saved = invocation.getArgument(0);
            saved.setId(88L);
            return 1;
        }).when(recordMapper).insert(any(HrmInterviewRecord.class));
        doThrow(new IllegalStateException("outbox unavailable")).when(publisher).publish(any());

        assertThatThrownBy(() -> service.createAndApply(record()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable");
    }

    private HrmResume resume() {
        HrmResume resume = new HrmResume();
        resume.setId(12L);
        resume.setName("候选人甲");
        resume.setStatus(0);
        return resume;
    }

    private HrmInterviewRecord record() {
        HrmInterviewRecord record = new HrmInterviewRecord();
        record.setResumeId(12L);
        record.setInterviewerId(21L);
        record.setStage("first");
        record.setResult("pending");
        return record;
    }
}

package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.ImTaskDetailMapper;
import com.zhehang.erp.modules.im.mapper.ImTaskParticipantMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImTaskAccessServiceTest {
    @Mock private ImAccessService imAccess;
    @Mock private ImTaskDetailMapper detailMapper;
    @Mock private ImTaskParticipantMapper participantMapper;
    @Mock private DataScopeHelper dataScopeHelper;
    private ImTaskAccessService service;
    private ImEntities.TaskDetail task;

    @BeforeEach
    void setUp() {
        service = new ImTaskAccessService(imAccess, detailMapper, participantMapper, dataScopeHelper);
        task = new ImEntities.TaskDetail();
        task.setTaskId(88L);
        task.setCreatorId(200L);
        task.setReviewerId(201L);
        task.setDeptId(5L);
        when(imAccess.currentUserId()).thenReturn(100L);
        when(detailMapper.selectOne(any())).thenReturn(task);
    }

    @Test
    void participantCanViewTask() {
        when(participantMapper.selectCount(any())).thenReturn(1L);
        assertThat(service.requireView(88L)).isSameAs(task);
    }

    @Test
    void unrelatedEmployeeCannotViewTask() {
        when(participantMapper.selectCount(any())).thenReturn(0L);
        assertThatThrownBy(() -> service.requireView(88L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("无权查看");
    }

    @Test
    void collaboratorCannotPerformResponsibleAction() {
        when(participantMapper.selectCount(any())).thenReturn(0L);
        assertThatThrownBy(() -> service.requireResponsible(88L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("责任人");
    }
}

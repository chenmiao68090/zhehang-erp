package com.zhehang.erp.modules.workflow.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.file.mapper.FileInfoMapper;
import com.zhehang.erp.modules.hrm.mapper.HrmLeaveBalanceMapper;
import com.zhehang.erp.modules.im.service.ImBusinessNotificationPublisher;
import com.zhehang.erp.modules.org.mapper.OrgEmployeeMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysDeptMapper;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import com.zhehang.erp.modules.workflow.domain.entity.WfInstance;
import com.zhehang.erp.modules.workflow.domain.entity.WfTask;
import com.zhehang.erp.modules.workflow.mapper.WfAttachmentMapper;
import com.zhehang.erp.modules.workflow.mapper.WfHistoryMapper;
import com.zhehang.erp.modules.workflow.mapper.WfInstanceMapper;
import com.zhehang.erp.modules.workflow.mapper.WfProcessDefMapper;
import com.zhehang.erp.modules.workflow.mapper.WfProcessVersionMapper;
import com.zhehang.erp.modules.workflow.mapper.WfTaskMapper;
import com.zhehang.erp.modules.workflow.service.ApprovalCallbackHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.ObjectProvider;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WfInstanceServiceImplAddCcTest {

    @Mock private WfProcessDefMapper processDefMapper;
    @Mock private WfProcessVersionMapper versionMapper;
    @Mock private WfInstanceMapper instanceMapper;
    @Mock private WfTaskMapper taskMapper;
    @Mock private WfHistoryMapper historyMapper;
    @Mock private WfAttachmentMapper attachmentMapper;
    @Mock private FileInfoMapper fileInfoMapper;
    @Mock private SysUserMapper userMapper;
    @Mock private SysDeptMapper deptMapper;
    @Mock private OrgEmployeeMapper orgEmployeeMapper;
    @Mock private HrmLeaveBalanceMapper leaveBalanceMapper;
    @Mock private ImBusinessNotificationPublisher notificationPublisher;
    @Mock private ObjectProvider<ApprovalCallbackHandler> callbackProvider;

    private WfInstanceServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new WfInstanceServiceImpl(processDefMapper, versionMapper, instanceMapper, taskMapper,
                historyMapper, attachmentMapper, fileInfoMapper, userMapper, deptMapper, orgEmployeeMapper,
                leaveBalanceMapper, notificationPublisher, new ObjectMapper(), callbackProvider);
        WfInstance instance = new WfInstance();
        instance.setId(1L);
        instance.setInitiatorId(100L);
        instance.setTitle("测试审批");
        when(instanceMapper.selectById(1L)).thenReturn(instance);
        when(taskMapper.selectCount(any())).thenReturn(0L);
    }

    @Test
    void rejectsWholeBatchWhenAnyRecipientIsOutsideTenantOrMissing() {
        when(userMapper.selectById(201L)).thenReturn(activeUser(201L));
        when(userMapper.selectById(202L)).thenReturn(null);

        withCurrentUser(100L, () -> assertThatThrownBy(() -> service.addCc(1L, List.of(201L, 202L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不存在或已停用"));

        verify(taskMapper, never()).insert(any(WfTask.class));
    }

    @Test
    void rejectsDisabledRecipientBeforeWriting() {
        SysUser disabled = activeUser(201L);
        disabled.setStatus(1);
        when(userMapper.selectById(201L)).thenReturn(disabled);

        withCurrentUser(100L, () -> assertThatThrownBy(() -> service.addCc(1L, List.of(201L)))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("不存在或已停用"));

        verify(taskMapper, never()).insert(any(WfTask.class));
    }

    @Test
    void validatesThenWritesEachDistinctActiveRecipientOnce() {
        when(userMapper.selectById(201L)).thenReturn(activeUser(201L));
        when(userMapper.selectById(100L)).thenReturn(activeUser(100L));
        doAnswer(invocation -> {
            WfTask saved = invocation.getArgument(0);
            saved.setId(301L);
            return 1;
        }).when(taskMapper).insert(any(WfTask.class));

        withCurrentUser(100L, () -> service.addCc(1L, List.of(201L, 201L)));

        ArgumentCaptor<WfTask> task = ArgumentCaptor.forClass(WfTask.class);
        verify(taskMapper).insert(task.capture());
        assertThat(task.getValue().getAssigneeId()).isEqualTo(201L);
        assertThat(task.getValue().getNodeType()).isEqualTo("cc");
        assertThat(task.getValue().getStatus()).isEqualTo(4);
        ArgumentCaptor<ImBusinessNotificationPublisher.Notice> notice =
                ArgumentCaptor.forClass(ImBusinessNotificationPublisher.Notice.class);
        verify(notificationPublisher).publish(notice.capture());
        assertThat(notice.getValue().getEventId()).isEqualTo("workflow:1:cc:301");
        assertThat(notice.getValue().getActionUrl()).isEqualTo("/approval/center?tab=cc");
    }

    @Test
    void outboxFailureEscapesForApprovalTransactionRollback() {
        when(userMapper.selectById(201L)).thenReturn(activeUser(201L));
        when(userMapper.selectById(100L)).thenReturn(activeUser(100L));
        doAnswer(invocation -> {
            WfTask saved = invocation.getArgument(0);
            saved.setId(301L);
            return 1;
        }).when(taskMapper).insert(any(WfTask.class));
        doThrow(new IllegalStateException("outbox unavailable"))
                .when(notificationPublisher).publish(any());

        withCurrentUser(100L, () -> assertThatThrownBy(() -> service.addCc(1L, List.of(201L)))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("outbox unavailable"));
    }

    private SysUser activeUser(Long id) {
        SysUser user = new SysUser();
        user.setId(id);
        user.setStatus(0);
        user.setNickname("用户" + id);
        return user;
    }

    private void withCurrentUser(Long userId, Runnable action) {
        try (MockedStatic<SecurityUtils> security = mockStatic(SecurityUtils.class)) {
            security.when(SecurityUtils::getCurrentUserId).thenReturn(userId);
            action.run();
        }
    }
}

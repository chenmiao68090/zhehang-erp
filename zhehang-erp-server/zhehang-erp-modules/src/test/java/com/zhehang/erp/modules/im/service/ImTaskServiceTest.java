package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.mapper.BizTaskMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.apache.ibatis.builder.MapperBuilderAssistant;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImTaskServiceTest {
    @Mock private ImAccessService access;
    @Mock private ImTaskAccessService taskAccess;
    @Mock private ImMessagingService messagingService;
    @Mock private ImMessageMapper messageMapper;
    @Mock private ImConversationMapper conversationMapper;
    @Mock private ImMemberMapper memberMapper;
    @Mock private ImAttachmentMapper attachmentMapper;
    @Mock private ImTaskDetailMapper detailMapper;
    @Mock private ImTaskParticipantMapper participantMapper;
    @Mock private ImTaskTimelineMapper timelineMapper;
    @Mock private ImTaskReminderMapper reminderMapper;
    @Mock private ImTaskAttachmentMapper taskAttachmentMapper;
    @Mock private ImTaskMessageLinkMapper taskMessageLinkMapper;
    @Mock private ImTaskQueryMapper taskQueryMapper;
    @Mock private ImQueryMapper queryMapper;
    @Mock private ImAuditMapper auditMapper;
    @Mock private BizTaskMapper bizTaskMapper;
    @Mock private ImEventPublisher eventPublisher;

    private ImTaskService service;

    @BeforeEach
    void setUp() {
        initTableInfo(ImEntities.Member.class);
        initTableInfo(ImEntities.TaskDetail.class);
        initTableInfo(ImEntities.TaskParticipant.class);
        initTableInfo(ImEntities.TaskReminder.class);
        initTableInfo(ImEntities.Attachment.class);
        initTableInfo(BizTask.class);
        service = new ImTaskService(access, taskAccess, messagingService, messageMapper, conversationMapper,
                memberMapper, attachmentMapper, detailMapper, participantMapper, timelineMapper, reminderMapper,
                taskAttachmentMapper, taskMessageLinkMapper, taskQueryMapper, queryMapper, auditMapper,
                bizTaskMapper, eventPublisher, new ObjectMapper());
    }

    @Test
    void createsTaskMirrorParticipantsRemindersAndChatCard() {
        when(access.currentUserId()).thenReturn(10L);
        when(access.currentTenantId()).thenReturn(7L);

        ImEntities.Message source = new ImEntities.Message();
        source.setId(31L);
        source.setConversationId(3L);
        source.setSenderId(10L);
        source.setMessageType("text");
        source.setStatus("sent");
        source.setContentJson("{\"text\":\"请处理客户异常\"}");
        when(messageMapper.selectById(31L)).thenReturn(source);

        ImEntities.Conversation conversation = new ImEntities.Conversation();
        conversation.setId(3L);
        when(access.requireConversation(3L)).thenReturn(conversation);

        ImModels.Contact responsible = new ImModels.Contact();
        responsible.setUserId(20L);
        responsible.setName("责任人");
        responsible.setDeptId(5L);
        when(access.requireActiveUsers(any())).thenReturn(List.of(responsible));

        ImEntities.Member creatorMember = member(10L);
        ImEntities.Member responsibleMember = member(20L);
        when(memberMapper.selectList(any())).thenReturn(List.of(creatorMember, responsibleMember));
        when(taskQueryMapper.departmentManagerIds(5L, 7L)).thenReturn(List.of(30L));

        when(bizTaskMapper.insert(any())).thenAnswer(invocation -> {
            BizTask task = invocation.getArgument(0);
            task.setId(100L);
            return 1;
        });
        when(detailMapper.insert(any())).thenAnswer(invocation -> {
            ImEntities.TaskDetail detail = invocation.getArgument(0);
            detail.setId(500L);
            return 1;
        });
        ImModels.Message card = new ImModels.Message();
        card.setId(200L);
        when(messagingService.sendStructuredMessage(eq(3L), eq("task:100:created"), eq("task"),
                anyString(), any(), anyBoolean(), any())).thenReturn(card);
        when(taskQueryMapper.taskById(100L, 7L)).thenReturn(workTask(100L, "pending_accept"));
        when(taskQueryMapper.participantsByTaskIds(any(), eq(7L))).thenReturn(List.of());

        ImModels.CreateTaskRequest request = new ImModels.CreateTaskRequest();
        request.setTitle("处理客户异常");
        request.setResponsibleIds(List.of(20L));
        request.setPriority("urgent");
        request.setDeadlineAt(LocalDateTime.now().plusDays(1));
        request.setReminderRules(List.of("due", "overdue_1h"));
        request.setAcceptanceStandard("上传处理凭证并由创建人验收");

        ImModels.WorkTask result = service.createFromMessage(31L, request);

        assertThat(result.getTaskId()).isEqualTo(100L);
        verify(bizTaskMapper).insert(any(BizTask.class));
        verify(detailMapper).insert(any(ImEntities.TaskDetail.class));
        verify(participantMapper).insert(any(ImEntities.TaskParticipant.class));
        verify(reminderMapper, times(4)).insert(any(ImEntities.TaskReminder.class));
        verify(taskMessageLinkMapper, times(2)).insert(any(ImEntities.TaskMessageLink.class));
        verify(messagingService).sendStructuredMessage(eq(3L), eq("task:100:created"), eq("task"),
                anyString(), any(), eq(true), any());
        verify(eventPublisher).publish(eq("task.updated"), any(), any());
    }

    @Test
    void rejectsConcurrentStateChangeBeforeWritingTimeline() {
        ImEntities.TaskDetail detail = new ImEntities.TaskDetail();
        detail.setId(500L);
        detail.setTaskId(100L);
        detail.setTenantId(7L);
        detail.setCompanyId(7L);
        detail.setConversationId(3L);
        detail.setWorkflowState("pending_accept");
        detail.setVersion(2);
        when(taskAccess.requireResponsible(100L)).thenReturn(detail);
        when(detailMapper.update(isNull(), any())).thenReturn(0);

        assertThatThrownBy(() -> service.accept(100L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("其他人更新");

        verify(timelineMapper, never()).insert(any());
        verify(bizTaskMapper, never()).update(any(), any());
        verifyNoInteractions(eventPublisher);
    }

    private ImEntities.Member member(Long userId) {
        ImEntities.Member member = new ImEntities.Member();
        member.setUserId(userId);
        member.setStatus("active");
        return member;
    }

    private void initTableInfo(Class<?> entityType) {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), entityType);
    }

    private ImModels.WorkTask workTask(Long taskId, String state) {
        ImModels.WorkTask task = new ImModels.WorkTask();
        task.setTaskId(taskId);
        task.setWorkflowState(state);
        task.setStatus(state);
        task.setReminderConfigJson("[]");
        task.setUpdatedAt(LocalDateTime.now());
        return task;
    }
}

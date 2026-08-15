package com.zhehang.erp.modules.im.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.apache.ibatis.builder.MapperBuilderAssistant;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImMessagingIdempotencyTest {
    @Mock private ImAccessService access;
    @Mock private ImContentPolicy contentPolicy;
    @Mock private ImConversationMapper conversationMapper;
    @Mock private ImMemberMapper memberMapper;
    @Mock private ImMessageMapper messageMapper;
    @Mock private ImAttachmentMapper attachmentMapper;
    @Mock private ImMentionMapper mentionMapper;
    @Mock private ImReactionMapper reactionMapper;
    @Mock private ImFavoriteMapper favoriteMapper;
    @Mock private ImHistoryMapper historyMapper;
    @Mock private ImAuditMapper auditMapper;
    @Mock private ImPreferenceMapper preferenceMapper;
    @Mock private ImQueryMapper queryMapper;
    @Mock private ImTaskQueryMapper taskQueryMapper;
    @Mock private ImTaskAccessService taskAccess;
    @Mock private ImEventPublisher eventPublisher;
    private ImMessagingService service;

    @BeforeEach
    void setUp() {
        TableInfoHelper.initTableInfo(new MapperBuilderAssistant(new MybatisConfiguration(), ""), ImEntities.Member.class);
        service = new ImMessagingService(access, contentPolicy, conversationMapper, memberMapper, messageMapper,
                attachmentMapper, mentionMapper, reactionMapper, favoriteMapper, historyMapper, auditMapper, preferenceMapper,
                queryMapper, taskQueryMapper, taskAccess, eventPublisher, new ObjectMapper());
    }

    @Test
    void repeatedClientMessageIdReturnsExistingMessageWithoutAllocatingNewSequence() {
        ImEntities.Conversation conversation = new ImEntities.Conversation();
        conversation.setId(7L);
        conversation.setLastSeq(12L);
        conversation.setStatus("active");
        ImEntities.Member member = new ImEntities.Member();
        member.setUserId(10L);
        member.setJoinSeq(0L);
        member.setLastReadSeq(0L);
        ImEntities.Message existing = new ImEntities.Message();
        existing.setId(99L);
        existing.setConversationId(7L);
        existing.setClientMessageId("client-duplicate-001");
        existing.setSeq(12L);
        existing.setSenderId(10L);
        existing.setMessageType("text");
        existing.setContentJson("{\"text\":\"只发送一次\"}");
        existing.setStatus("sent");
        existing.setCreatedAt(LocalDateTime.now());
        when(access.requireConversation(7L)).thenReturn(conversation);
        when(access.requireMember(7L)).thenReturn(member);
        when(access.currentUserId()).thenReturn(10L);
        when(messageMapper.selectOne(any())).thenReturn(existing);
        when(attachmentMapper.selectList(any())).thenReturn(List.of());
        when(mentionMapper.selectList(any())).thenReturn(List.of());
        when(reactionMapper.selectList(any())).thenReturn(List.of());
        when(favoriteMapper.selectList(any())).thenReturn(List.of());
        when(memberMapper.selectList(any())).thenReturn(List.of(member));
        when(queryMapper.contactsByIds(any())).thenReturn(List.of());

        ImModels.SendMessageRequest request = new ImModels.SendMessageRequest();
        request.setClientMessageId("client-duplicate-001");
        request.setText("重复点击");
        ImModels.Message result = service.send(7L, request);

        assertThat(result.getId()).isEqualTo(99L);
        assertThat(result.getText()).isEqualTo("只发送一次");
        verify(queryMapper, never()).incrementSequence(any());
        verify(messageMapper, never()).insert(any());
    }

    @Test
    void concurrentRetryRechecksClientIdAfterConversationLock() {
        ImEntities.Conversation conversation = conversation(7L);
        ImEntities.Member member = member(10L);
        ImEntities.Message existing = message(99L, 7L, "client-concurrent-001", 12L, 10L);
        when(access.requireConversation(7L)).thenReturn(conversation);
        when(access.requireMember(7L)).thenReturn(member);
        when(access.currentUserId()).thenReturn(10L);
        when(contentPolicy.requireMessageType("text")).thenReturn("text");
        when(contentPolicy.normalizeText("并发重试")).thenReturn("并发重试");
        when(messageMapper.selectOne(any())).thenReturn(null, existing);
        when(queryMapper.lockConversation(7L)).thenReturn(7L);
        stubEnrichment(member);

        ImModels.SendMessageRequest request = new ImModels.SendMessageRequest();
        request.setClientMessageId("client-concurrent-001");
        request.setText("并发重试");
        ImModels.Message result = service.send(7L, request);

        assertThat(result.getId()).isEqualTo(99L);
        verify(queryMapper).lockConversation(7L);
        verify(queryMapper, never()).incrementSequence(any());
        verify(messageMapper, never()).insert(any());
    }

    @Test
    void reusedClientIdFromAnotherConversationIsRejectedWithoutLeakingMessage() {
        ImEntities.Message existing = message(100L, 8L, "client-cross-conversation-001", 3L, 10L);
        when(access.requireConversation(7L)).thenReturn(conversation(7L));
        when(access.requireMember(7L)).thenReturn(member(10L));
        when(access.currentUserId()).thenReturn(10L);
        when(messageMapper.selectOne(any())).thenReturn(existing);

        ImModels.SendMessageRequest request = new ImModels.SendMessageRequest();
        request.setClientMessageId("client-cross-conversation-001");
        request.setText("不能串会话");

        assertThatThrownBy(() -> service.send(7L, request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("其他会话");
        verify(queryMapper, never()).lockConversation(any());
        verify(queryMapper, never()).incrementSequence(any());
        verify(messageMapper, never()).insert(any());
    }

    @Test
    void contactSearchUsesRealtimePresenceAndNewestLastActiveTime() {
        ImModels.Contact contact = new ImModels.Contact();
        contact.setUserId(20L);
        contact.setLastActiveAt(LocalDateTime.of(2026, 7, 12, 9, 0));
        LocalDateTime realtimeLastActive = LocalDateTime.of(2026, 7, 13, 6, 10);
        when(queryMapper.searchContacts(10L, "罗琪", 20)).thenReturn(List.of(contact));
        when(access.currentUserId()).thenReturn(10L);
        when(eventPublisher.isOnline(20L)).thenReturn(true);
        when(eventPublisher.lastActiveAt(20L)).thenReturn(realtimeLastActive);

        List<ImModels.Contact> result = service.searchContacts("罗琪", 20);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isOnline()).isTrue();
        assertThat(result.get(0).getLastActiveAt()).isEqualTo(realtimeLastActive);
    }

    @Test
    void directConversationIncludesPeerPresenceWithoutChangingGroupRows() {
        ImModels.Conversation direct = new ImModels.Conversation();
        direct.setId(7L);
        direct.setType("direct");
        direct.setPeerUserId(20L);
        direct.setLastMessageAt(LocalDateTime.of(2026, 7, 13, 6, 0));
        ImModels.Conversation group = new ImModels.Conversation();
        group.setId(8L);
        group.setType("group");
        group.setLastMessageAt(LocalDateTime.of(2026, 7, 13, 5, 0));
        LocalDateTime lastActive = LocalDateTime.of(2026, 7, 13, 6, 8);
        when(access.currentUserId()).thenReturn(10L);
        when(queryMapper.listConversations(eq(10L), isNull(), eq("all"), isNull(), isNull(), isNull(), isNull(), eq(21)))
                .thenReturn(List.of(direct, group));
        when(eventPublisher.isOnline(20L)).thenReturn(false);
        when(eventPublisher.lastActiveAt(20L)).thenReturn(lastActive);

        ImModels.CursorPage<ImModels.Conversation> result = service.listConversations("all", null, null, 20);

        assertThat(result.getItems()).hasSize(2);
        assertThat(result.getItems().get(0).isPeerOnline()).isFalse();
        assertThat(result.getItems().get(0).getPeerLastActiveAt()).isEqualTo(lastActive);
        verify(eventPublisher, never()).isOnline(8L);
    }

    private ImEntities.Conversation conversation(Long id) {
        ImEntities.Conversation conversation = new ImEntities.Conversation();
        conversation.setId(id);
        conversation.setLastSeq(12L);
        conversation.setStatus("active");
        return conversation;
    }

    private ImEntities.Member member(Long userId) {
        ImEntities.Member member = new ImEntities.Member();
        member.setUserId(userId);
        member.setJoinSeq(0L);
        member.setLastReadSeq(0L);
        member.setStatus("active");
        return member;
    }

    private ImEntities.Message message(Long id, Long conversationId, String clientId, Long seq, Long senderId) {
        ImEntities.Message message = new ImEntities.Message();
        message.setId(id);
        message.setConversationId(conversationId);
        message.setClientMessageId(clientId);
        message.setSeq(seq);
        message.setSenderId(senderId);
        message.setMessageType("text");
        message.setContentJson("{\"text\":\"只发送一次\"}");
        message.setStatus("sent");
        message.setCreatedAt(LocalDateTime.now());
        return message;
    }

    private void stubEnrichment(ImEntities.Member member) {
        when(attachmentMapper.selectList(any())).thenReturn(List.of());
        when(mentionMapper.selectList(any())).thenReturn(List.of());
        when(reactionMapper.selectList(any())).thenReturn(List.of());
        when(favoriteMapper.selectList(any())).thenReturn(List.of());
        when(memberMapper.selectList(any())).thenReturn(List.of(member));
        when(queryMapper.contactsByIds(any())).thenReturn(List.of());
    }
}

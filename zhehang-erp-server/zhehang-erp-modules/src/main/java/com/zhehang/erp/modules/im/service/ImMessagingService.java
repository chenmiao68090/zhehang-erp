package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.*;
import com.zhehang.erp.modules.im.realtime.ImEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImMessagingService {
    private static final Set<String> FILTERS = Set.of(
            "all", "unread", "mention", "important", "todo", "direct", "group", "department", "business", "announcement", "system");
    private static final Set<String> NOTIFICATION_LEVELS = Set.of("all", "mention", "none");

    private final ImAccessService access;
    private final ImContentPolicy contentPolicy;
    private final ImConversationMapper conversationMapper;
    private final ImMemberMapper memberMapper;
    private final ImMessageMapper messageMapper;
    private final ImAttachmentMapper attachmentMapper;
    private final ImMentionMapper mentionMapper;
    private final ImReactionMapper reactionMapper;
    private final ImFavoriteMapper favoriteMapper;
    private final ImHistoryMapper historyMapper;
    private final ImAuditMapper auditMapper;
    private final ImPreferenceMapper preferenceMapper;
    private final ImQueryMapper queryMapper;
    private final ImTaskQueryMapper taskQueryMapper;
    private final ImTaskAccessService taskAccess;
    private final ImEventPublisher eventPublisher;
    private final ObjectMapper objectMapper;

    @Value("${im.edit-window-minutes:15}")
    private long editWindowMinutes;

    @Value("${im.recall-window-minutes:120}")
    private long recallWindowMinutes;

    @Transactional(rollbackFor = Exception.class)
    public ImModels.Conversation createDirect(Long peerUserId) {
        Long me = access.currentUserId();
        if (Objects.equals(me, peerUserId)) throw new BusinessException("不能和自己创建单聊");
        access.requireActiveUsers(List.of(peerUserId));
        long first = Math.min(me, peerUserId);
        long second = Math.max(me, peerUserId);
        String directKey = first + ":" + second;
        ImEntities.Conversation conversation = conversationMapper.selectOne(
                new LambdaQueryWrapper<ImEntities.Conversation>()
                        .eq(ImEntities.Conversation::getDirectKey, directKey)
                        .last("LIMIT 1"));
        if (conversation == null) {
            conversation = newConversation("direct", null, me);
            conversation.setDirectKey(directKey);
            conversationMapper.insert(conversation);
            insertOrReviveMember(conversation, me, "member");
            insertOrReviveMember(conversation, peerUserId, "member");
        } else {
            if (!"active".equals(conversation.getStatus())) {
                conversation.setStatus("active");
                conversationMapper.updateById(conversation);
            }
            insertOrReviveMember(conversation, me, "member");
            insertOrReviveMember(conversation, peerUserId, "member");
        }
        return conversationById(conversation.getId());
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.Conversation createGroup(String name, Collection<Long> memberIds) {
        Long me = access.currentUserId();
        String cleanName = name == null ? "" : name.trim();
        if (!StringUtils.hasText(cleanName)) throw new BusinessException("群名称不能为空");
        if (cleanName.length() > 120) throw new BusinessException("群名称不能超过120个字符");
        LinkedHashSet<Long> ids = new LinkedHashSet<>();
        ids.add(me);
        if (memberIds != null) ids.addAll(memberIds);
        if (ids.size() < 2) throw new BusinessException("群聊至少需要2名成员");
        if (ids.size() > 100) throw new BusinessException("第一阶段单个群聊最多100人");
        access.requireActiveUsers(ids);
        ImEntities.Conversation conversation = newConversation("group", cleanName, me);
        conversation.setOwnerId(me);
        conversationMapper.insert(conversation);
        for (Long userId : ids) {
            insertOrReviveMember(conversation, userId, Objects.equals(me, userId) ? "owner" : "member");
        }
        ImModels.Conversation result = conversationById(conversation.getId());
        afterCommit(() -> eventPublisher.publish("conversation.updated", ids, Map.of("conversation", result)));
        return result;
    }

    public ImModels.CursorPage<ImModels.Conversation> listConversations(String filter, String keyword, String cursor, int pageSize) {
        Long me = access.currentUserId();
        String normalizedFilter = FILTERS.contains(filter) ? filter : "all";
        int limit = Math.max(10, Math.min(pageSize, 80));
        Cursor parsed = decodeCursor(cursor);
        List<ImModels.Conversation> rows = queryMapper.listConversations(
                me, null, normalizedFilter, trimToNull(keyword), parsed.pinned(), parsed.time(), parsed.id(), limit + 1);
        boolean hasMore = rows.size() > limit;
        if (hasMore) rows = new ArrayList<>(rows.subList(0, limit));
        boolean elevatedMention = SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("boss", "super_admin", "dept_manager");
        for (ImModels.Conversation row : rows) {
            row.setCanMentionAll(elevatedMention || "owner".equals(row.getMemberRole()) || "admin".equals(row.getMemberRole()));
            row.setCanLeave("group".equals(row.getType()) && !"owner".equals(row.getMemberRole()));
            applyDirectPresence(row);
        }
        ImModels.CursorPage<ImModels.Conversation> page = new ImModels.CursorPage<>();
        page.setItems(rows);
        page.setHasMore(hasMore);
        if (hasMore && !rows.isEmpty()) page.setNextCursor(encodeCursor(rows.get(rows.size() - 1)));
        return page;
    }

    public ImModels.Conversation conversationById(Long conversationId) {
        access.requireConversation(conversationId);
        List<ImModels.Conversation> rows = queryMapper.listConversations(
                access.currentUserId(), conversationId, "all", null, null, null, null, 1);
        if (rows.isEmpty()) throw new BusinessException("会话不存在");
        ImModels.Conversation row = rows.get(0);
        row.setCanMentionAll(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("boss", "super_admin", "dept_manager")
                || "owner".equals(row.getMemberRole()) || "admin".equals(row.getMemberRole()));
        row.setCanLeave("group".equals(row.getType()) && !"owner".equals(row.getMemberRole()));
        applyDirectPresence(row);
        return row;
    }

    public ImModels.UnreadSummary unreadSummary() {
        ImModels.UnreadSummary summary = queryMapper.unreadSummary(access.currentUserId());
        return summary != null ? summary : new ImModels.UnreadSummary();
    }

    public List<ImModels.Contact> searchContacts(String keyword, int limit) {
        List<ImModels.Contact> contacts = queryMapper.searchContacts(access.currentUserId(), trimToNull(keyword), Math.max(1, Math.min(limit, 100)));
        contacts.forEach(this::applyContactPresence);
        return contacts;
    }

    public List<ImModels.Contact> conversationMembers(Long conversationId) {
        access.requireConversation(conversationId);
        List<ImModels.Contact> members = queryMapper.conversationMembers(conversationId);
        members.forEach(this::applyContactPresence);
        return members;
    }

    public ImModels.CursorPage<ImModels.Message> listMessages(Long conversationId, Long beforeSeq, Long afterSeq, int pageSize) {
        ImEntities.Member member = access.requireMember(conversationId);
        int limit = Math.max(1, Math.min(pageSize, 100));
        LambdaQueryWrapper<ImEntities.Message> wrapper = new LambdaQueryWrapper<ImEntities.Message>()
                .eq(ImEntities.Message::getConversationId, conversationId)
                .ge(ImEntities.Message::getSeq, member.getJoinSeq());
        if (afterSeq != null) {
            wrapper.gt(ImEntities.Message::getSeq, afterSeq).orderByAsc(ImEntities.Message::getSeq);
        } else {
            if (beforeSeq != null) wrapper.lt(ImEntities.Message::getSeq, beforeSeq);
            wrapper.orderByDesc(ImEntities.Message::getSeq);
        }
        wrapper.last("LIMIT " + (limit + 1));
        List<ImEntities.Message> entities = messageMapper.selectList(wrapper);
        boolean hasMore = entities.size() > limit;
        if (hasMore) entities = new ArrayList<>(entities.subList(0, limit));
        if (afterSeq == null) Collections.reverse(entities);
        List<ImModels.Message> items = enrichMessages(entities, access.currentUserId());
        ImModels.CursorPage<ImModels.Message> page = new ImModels.CursorPage<>();
        page.setItems(items);
        page.setHasMore(hasMore);
        if (hasMore && !items.isEmpty()) page.setNextCursor(String.valueOf(items.get(0).getSeq()));
        return page;
    }

    public ImModels.CursorPage<ImModels.Message> searchMessages(Long conversationId, String keyword, Long beforeSeq, int pageSize) {
        ImEntities.Member member = access.requireMember(conversationId);
        String query = trimToNull(keyword);
        if (query == null) throw new BusinessException("请输入搜索内容");
        int limit = Math.max(1, Math.min(pageSize, 100));
        LambdaQueryWrapper<ImEntities.Message> wrapper = new LambdaQueryWrapper<ImEntities.Message>()
                .eq(ImEntities.Message::getConversationId, conversationId)
                .ge(ImEntities.Message::getSeq, member.getJoinSeq())
                .like(ImEntities.Message::getSearchText, query)
                .lt(beforeSeq != null, ImEntities.Message::getSeq, beforeSeq)
                .orderByDesc(ImEntities.Message::getSeq)
                .last("LIMIT " + (limit + 1));
        List<ImEntities.Message> entities = messageMapper.selectList(wrapper);
        boolean hasMore = entities.size() > limit;
        if (hasMore) entities = new ArrayList<>(entities.subList(0, limit));
        List<ImModels.Message> items = enrichMessages(entities, access.currentUserId());
        ImModels.CursorPage<ImModels.Message> page = new ImModels.CursorPage<>();
        page.setItems(items);
        page.setHasMore(hasMore);
        if (hasMore && !items.isEmpty()) page.setNextCursor(String.valueOf(items.get(items.size() - 1).getSeq()));
        return page;
    }

    public ImModels.Message messageById(Long messageId) {
        ImEntities.Message message = requireVisibleMessage(messageId);
        return enrichMessages(List.of(message), access.currentUserId()).get(0);
    }

    @Transactional(rollbackFor = Exception.class, noRollbackFor = DuplicateKeyException.class)
    public ImModels.Message send(Long conversationId, ImModels.SendMessageRequest request) {
        ImEntities.Conversation conversation = access.requireConversation(conversationId);
        ImEntities.Member senderMember = access.requireMember(conversationId);
        Long me = access.currentUserId();
        String clientId = request.getClientMessageId() == null ? "" : request.getClientMessageId().trim();
        if (clientId.length() < 8 || clientId.length() > 80 || !clientId.matches("[A-Za-z0-9._:-]+")) {
            throw new BusinessException("消息幂等编号格式不正确");
        }
        ImEntities.Message existing = findByClientId(me, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), me).get(0);

        String type = contentPolicy.requireMessageType(request.getMessageType());
        if (Set.of("task", "business", "system", "announcement").contains(type)) {
            throw new BusinessException("结构化消息必须通过对应业务操作发送");
        }
        String text = contentPolicy.normalizeText(request.getText());
        List<Long> attachmentIds = distinctIds(request.getAttachmentIds());
        if (!StringUtils.hasText(text) && attachmentIds.isEmpty() && request.getForwardedMessageId() == null) {
            throw new BusinessException("消息内容不能为空");
        }

        ImEntities.Message reply = null;
        if (request.getReplyToMessageId() != null) {
            reply = messageMapper.selectById(request.getReplyToMessageId());
            if (reply == null || !Objects.equals(reply.getConversationId(), conversationId)) {
                throw new BusinessException("引用的消息不属于当前会话");
            }
        }

        ImEntities.Message forwarded = null;
        if (request.getForwardedMessageId() != null) {
            forwarded = messageMapper.selectById(request.getForwardedMessageId());
            if (forwarded == null) throw new BusinessException("原消息不存在");
            access.requireMember(forwarded.getConversationId());
            type = "forward";
            if (!StringUtils.hasText(text)) text = extractText(forwarded.getContentJson());
        }

        List<ImEntities.Attachment> attachments = validatePendingAttachments(attachmentIds, conversationId, me);
        Set<Long> mentionUsers = resolveMentionUsers(conversation, senderMember, request);
        lockConversationForSend(conversationId);
        existing = findByClientId(me, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), me).get(0);
        long seq = allocateSequence(conversationId);
        LocalDateTime now = LocalDateTime.now();
        ImEntities.Message message = new ImEntities.Message();
        message.setTenantId(access.currentTenantId());
        message.setCompanyId(access.currentTenantId());
        message.setConversationId(conversationId);
        message.setClientMessageId(clientId);
        message.setSeq(seq);
        message.setSenderId(me);
        message.setMessageType(type);
        message.setContentJson(writeJson(messageContent(text, forwarded)));
        message.setSearchText(text);
        message.setReplyToMessageId(reply == null ? null : reply.getId());
        message.setRootMessageId(reply == null ? null : (reply.getRootMessageId() != null ? reply.getRootMessageId() : reply.getId()));
        message.setIsImportant(false);
        message.setStatus("sent");
        message.setCreatedAt(now);
        message.setUpdatedAt(now);
        try {
            messageMapper.insert(message);
        } catch (DuplicateKeyException duplicate) {
            ImEntities.Message duplicateMessage = findByClientId(me, clientId, conversationId);
            if (duplicateMessage != null) return enrichMessages(List.of(duplicateMessage), me).get(0);
            throw duplicate;
        }

        for (ImEntities.Attachment attachment : attachments) {
            attachment.setMessageId(message.getId());
            attachment.setUploadStatus("linked");
            attachmentMapper.updateById(attachment);
        }
        for (Long mentionedUserId : mentionUsers) {
            ImEntities.Mention mention = new ImEntities.Mention();
            mention.setTenantId(access.currentTenantId());
            mention.setCompanyId(access.currentTenantId());
            mention.setConversationId(conversationId);
            mention.setMessageId(message.getId());
            mention.setMentionedUserId(mentionedUserId);
            mention.setMentionType(Boolean.TRUE.equals(request.getMentionAll()) ? "all" : "user");
            mention.setCreatedAt(now);
            mentionMapper.insert(mention);
        }
        queryMapper.updateLastMessage(conversationId, message.getId(), seq, now);
        ImModels.Message result = enrichMessages(List.of(message), me).get(0);
        List<Long> recipients = activeMemberIds(conversationId);
        afterCommit(() -> {
            eventPublisher.publish("message.created", recipients, Map.of("conversationId", conversationId, "message", result));
            eventPublisher.publish("conversation.updated", recipients, Map.of("conversationId", conversationId, "lastSeq", seq));
        });
        return result;
    }

    /**
     * 由待办/业务服务在当前登录事务内发送结构化卡片。该入口不对 Controller 暴露，
     * 仍执行会话成员、@成员和幂等校验，防止业务服务绕过聊天权限。
     */
    @Transactional(rollbackFor = Exception.class, noRollbackFor = DuplicateKeyException.class)
    public ImModels.Message sendStructuredMessage(Long conversationId,
                                                   String clientMessageId,
                                                   String messageType,
                                                   String text,
                                                   Map<String, Object> extraContent,
                                                   boolean important,
                                                   Collection<Long> mentionedUserIds) {
        access.requireConversation(conversationId);
        access.requireMember(conversationId);
        Long me = access.currentUserId();
        String clientId = clientMessageId == null ? "" : clientMessageId.trim();
        if (clientId.length() < 8 || clientId.length() > 80 || !clientId.matches("[A-Za-z0-9._:-]+")) {
            throw new BusinessException("结构化消息幂等编号格式不正确");
        }
        String type = contentPolicy.requireMessageType(messageType);
        if (!Set.of("task", "business", "system", "announcement").contains(type)) {
            throw new BusinessException("结构化消息类型不正确");
        }
        ImEntities.Message existing = findByClientId(me, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), me).get(0);

        String normalizedText = contentPolicy.normalizeText(text);
        if (!StringUtils.hasText(normalizedText)) throw new BusinessException("结构化消息摘要不能为空");
        Set<Long> activeMembers = new LinkedHashSet<>(activeMemberIds(conversationId));
        Set<Long> mentions = new LinkedHashSet<>(distinctIds(mentionedUserIds));
        if (!activeMembers.containsAll(mentions)) throw new BusinessException("结构化消息只能提醒当前会话成员");

        lockConversationForSend(conversationId);
        existing = findByClientId(me, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), me).get(0);
        long seq = allocateSequence(conversationId);
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("text", normalizedText);
        if (extraContent != null) content.putAll(extraContent);

        ImEntities.Message message = new ImEntities.Message();
        message.setTenantId(access.currentTenantId());
        message.setCompanyId(access.currentTenantId());
        message.setConversationId(conversationId);
        message.setClientMessageId(clientId);
        message.setSeq(seq);
        message.setSenderId(me);
        message.setMessageType(type);
        message.setContentJson(writeJson(content));
        message.setSearchText(normalizedText);
        message.setIsImportant(important);
        message.setStatus("sent");
        message.setCreatedAt(now);
        message.setUpdatedAt(now);
        try {
            messageMapper.insert(message);
        } catch (DuplicateKeyException duplicate) {
            ImEntities.Message duplicateMessage = findByClientId(me, clientId, conversationId);
            if (duplicateMessage != null) return enrichMessages(List.of(duplicateMessage), me).get(0);
            throw duplicate;
        }

        for (Long userId : mentions) {
            ImEntities.Mention mention = new ImEntities.Mention();
            mention.setTenantId(access.currentTenantId());
            mention.setCompanyId(access.currentTenantId());
            mention.setConversationId(conversationId);
            mention.setMessageId(message.getId());
            mention.setMentionedUserId(userId);
            mention.setMentionType("user");
            mention.setCreatedAt(now);
            mentionMapper.insert(mention);
        }
        queryMapper.updateLastMessage(conversationId, message.getId(), seq, now);
        ImModels.Message result = enrichMessages(List.of(message), me).get(0);
        List<Long> recipients = List.copyOf(activeMembers);
        afterCommit(() -> {
            eventPublisher.publish("message.created", recipients, Map.of("conversationId", conversationId, "message", result));
            eventPublisher.publish("conversation.updated", recipients, Map.of("conversationId", conversationId, "lastSeq", seq));
        });
        return result;
    }

    /** 定时提醒/outbox 使用的系统消息入口。调用方必须传入已落库的租户、会话和事件幂等号。 */
    @Transactional(rollbackFor = Exception.class, noRollbackFor = DuplicateKeyException.class)
    public ImModels.Message sendServiceMessage(Long tenantId,
                                                Long companyId,
                                                Long conversationId,
                                                String clientMessageId,
                                                String messageType,
                                                String text,
                                                Map<String, Object> extraContent,
                                                boolean important,
                                                Collection<Long> mentionedUserIds) {
        if (tenantId == null || companyId == null || conversationId == null || !Objects.equals(tenantId, companyId)) {
            throw new BusinessException("系统消息组织信息不完整");
        }
        ImEntities.Conversation conversation = conversationMapper.selectById(conversationId);
        if (conversation == null || !Objects.equals(conversation.getTenantId(), tenantId)
                || !Objects.equals(conversation.getCompanyId(), companyId) || !"active".equals(conversation.getStatus())) {
            throw new BusinessException("系统消息目标会话不存在");
        }
        String clientId = clientMessageId == null ? "" : clientMessageId.trim();
        if (clientId.length() < 8 || clientId.length() > 80 || !clientId.matches("[A-Za-z0-9._:-]+")) {
            throw new BusinessException("系统消息幂等编号格式不正确");
        }
        ImEntities.Message existing = findByClientId(0L, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), 0L).get(0);
        String type = contentPolicy.requireMessageType(messageType);
        if (!Set.of("task", "business", "system", "announcement").contains(type)) {
            throw new BusinessException("系统消息类型不正确");
        }
        String normalizedText = contentPolicy.normalizeText(text);
        if (!StringUtils.hasText(normalizedText)) throw new BusinessException("系统消息摘要不能为空");

        List<ImEntities.Member> memberRows = memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, conversationId)
                .eq(ImEntities.Member::getStatus, "active"));
        Set<Long> activeMembers = memberRows.stream().map(ImEntities.Member::getUserId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Set<Long> mentions = new LinkedHashSet<>(distinctIds(mentionedUserIds));
        if (!activeMembers.containsAll(mentions)) throw new BusinessException("系统消息提醒对象不在目标会话中");

        lockConversationForSend(conversationId);
        existing = findByClientId(0L, clientId, conversationId);
        if (existing != null) return enrichMessages(List.of(existing), 0L).get(0);
        long seq = allocateSequence(conversationId);
        LocalDateTime now = LocalDateTime.now();
        Map<String, Object> content = new LinkedHashMap<>();
        content.put("text", normalizedText);
        content.put("systemSender", true);
        if (extraContent != null) content.putAll(extraContent);
        ImEntities.Message message = new ImEntities.Message();
        message.setTenantId(tenantId);
        message.setCompanyId(companyId);
        message.setConversationId(conversationId);
        message.setClientMessageId(clientId);
        message.setSeq(seq);
        message.setSenderId(0L);
        message.setMessageType(type);
        message.setContentJson(writeJson(content));
        message.setSearchText(normalizedText);
        message.setIsImportant(important);
        message.setStatus("sent");
        message.setCreatedAt(now);
        message.setUpdatedAt(now);
        try {
            messageMapper.insert(message);
        } catch (DuplicateKeyException duplicate) {
            ImEntities.Message duplicateMessage = findByClientId(0L, clientId, conversationId);
            if (duplicateMessage != null) return enrichMessages(List.of(duplicateMessage), 0L).get(0);
            throw duplicate;
        }
        for (Long userId : mentions) {
            ImEntities.Mention mention = new ImEntities.Mention();
            mention.setTenantId(tenantId);
            mention.setCompanyId(companyId);
            mention.setConversationId(conversationId);
            mention.setMessageId(message.getId());
            mention.setMentionedUserId(userId);
            mention.setMentionType("user");
            mention.setCreatedAt(now);
            mentionMapper.insert(mention);
        }
        queryMapper.updateLastMessage(conversationId, message.getId(), seq, now);
        ImModels.Message result = enrichMessages(List.of(message), 0L).get(0);
        List<Long> recipients = List.copyOf(activeMembers);
        afterCommit(() -> {
            eventPublisher.publish("message.created", recipients, Map.of("conversationId", conversationId, "message", result));
            eventPublisher.publish("conversation.updated", recipients, Map.of("conversationId", conversationId, "lastSeq", seq));
        });
        return result;
    }

    /** 为不在原业务群内的接收人创建个人系统通知会话，历史提醒仍永久保留。 */
    @Transactional(rollbackFor = Exception.class)
    public Long ensureSystemConversation(Long tenantId, Long companyId, Long userId) {
        if (tenantId == null || companyId == null || userId == null || !Objects.equals(tenantId, companyId)) {
            throw new BusinessException("系统通知接收人信息不完整");
        }
        if (queryMapper.activeUserInTenant(userId, tenantId) != 1) {
            throw new BusinessException("系统通知接收人已停用或不属于当前公司");
        }
        String directKey = "system:" + userId;
        ImEntities.Conversation conversation = conversationMapper.selectOne(
                new LambdaQueryWrapper<ImEntities.Conversation>()
                        .eq(ImEntities.Conversation::getCompanyId, companyId)
                        .eq(ImEntities.Conversation::getDirectKey, directKey)
                        .last("LIMIT 1"));
        if (conversation == null) {
            LocalDateTime now = LocalDateTime.now();
            conversation = new ImEntities.Conversation();
            conversation.setTenantId(tenantId);
            conversation.setCompanyId(companyId);
            conversation.setType("system");
            conversation.setName("系统通知");
            conversation.setDirectKey(directKey);
            conversation.setLastSeq(0L);
            conversation.setStatus("active");
            conversation.setCreatedBy(0L);
            conversation.setCreatedAt(now);
            conversation.setUpdatedAt(now);
            try {
                conversationMapper.insert(conversation);
            } catch (DuplicateKeyException duplicate) {
                conversation = conversationMapper.selectOne(new LambdaQueryWrapper<ImEntities.Conversation>()
                        .eq(ImEntities.Conversation::getCompanyId, companyId)
                        .eq(ImEntities.Conversation::getDirectKey, directKey)
                        .last("LIMIT 1"));
                if (conversation == null) throw duplicate;
            }
        }
        ImEntities.Member member = memberMapper.selectOne(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, conversation.getId())
                .eq(ImEntities.Member::getUserId, userId)
                .last("LIMIT 1"));
        LocalDateTime now = LocalDateTime.now();
        if (member == null) {
            member = new ImEntities.Member();
            member.setTenantId(tenantId);
            member.setCompanyId(companyId);
            member.setConversationId(conversation.getId());
            member.setUserId(userId);
            member.setMemberRole("member");
            member.setJoinSeq(0L);
            member.setLastReadSeq(0L);
            member.setManualUnreadSeq(0L);
            member.setLastDeliveredSeq(0L);
            member.setIsPinned(false);
            member.setIsMuted(false);
            member.setNotificationLevel("all");
            member.setIsHidden(false);
            member.setJoinedAt(now);
            member.setStatus("active");
            member.setCreatedAt(now);
            member.setUpdatedAt(now);
            memberMapper.insert(member);
        } else if (!"active".equals(member.getStatus())) {
            member.setStatus("active");
            member.setJoinedAt(now);
            member.setLeftAt(null);
            member.setUpdatedAt(now);
            memberMapper.updateById(member);
        }
        return conversation.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public ImModels.Message editMessage(Long messageId, String newText) {
        ImEntities.Message message = requireOwnMessage(messageId, editWindowMinutes, "编辑");
        String text = contentPolicy.requireEditableText(newText);
        saveHistory(message, "edit");
        message.setContentJson(writeJson(Map.of("text", text)));
        message.setSearchText(text);
        message.setEditedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.updateById(message);
        ImModels.Message result = enrichMessages(List.of(message), access.currentUserId()).get(0);
        publishConversationAfterCommit("message.updated", message.getConversationId(), Map.of("message", result));
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void recallMessage(Long messageId) {
        ImEntities.Message message = requireOwnMessage(messageId, recallWindowMinutes, "撤回");
        saveHistory(message, "recall");
        message.setContentJson(writeJson(Map.of("text", "")));
        message.setSearchText(null);
        message.setStatus("recalled");
        message.setRecalledAt(LocalDateTime.now());
        message.setRecalledBy(access.currentUserId());
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.updateById(message);
        mentionMapper.update(null, new LambdaUpdateWrapper<ImEntities.Mention>()
                .eq(ImEntities.Mention::getMessageId, messageId)
                .isNull(ImEntities.Mention::getReadAt)
                .set(ImEntities.Mention::getReadAt, LocalDateTime.now()));
        publishConversationAfterCommit("message.recalled", message.getConversationId(),
                Map.of("conversationId", message.getConversationId(), "messageId", messageId, "seq", message.getSeq()));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean toggleReaction(Long messageId, String reactionCode) {
        String code = contentPolicy.requireReaction(reactionCode);
        ImEntities.Message message = requireVisibleMessage(messageId);
        Long me = access.currentUserId();
        ImEntities.Reaction current = reactionMapper.selectOne(new LambdaQueryWrapper<ImEntities.Reaction>()
                .eq(ImEntities.Reaction::getMessageId, messageId)
                .eq(ImEntities.Reaction::getUserId, me)
                .eq(ImEntities.Reaction::getReactionCode, code)
                .last("LIMIT 1"));
        boolean active;
        if (current == null) {
            ImEntities.Reaction reaction = new ImEntities.Reaction();
            reaction.setTenantId(access.currentTenantId());
            reaction.setCompanyId(access.currentTenantId());
            reaction.setMessageId(messageId);
            reaction.setUserId(me);
            reaction.setReactionCode(code);
            reaction.setCreatedAt(LocalDateTime.now());
            reactionMapper.insert(reaction);
            active = true;
        } else {
            reactionMapper.deleteById(current.getId());
            active = false;
        }
        publishConversationAfterCommit("message.updated", message.getConversationId(),
                Map.of("conversationId", message.getConversationId(), "messageId", messageId));
        return active;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean toggleFavorite(Long messageId) {
        requireVisibleMessage(messageId);
        Long me = access.currentUserId();
        ImEntities.Favorite current = favoriteMapper.selectOne(new LambdaQueryWrapper<ImEntities.Favorite>()
                .eq(ImEntities.Favorite::getMessageId, messageId)
                .eq(ImEntities.Favorite::getUserId, me)
                .last("LIMIT 1"));
        if (current != null) {
            favoriteMapper.deleteById(current.getId());
            return false;
        }
        ImEntities.Favorite favorite = new ImEntities.Favorite();
        favorite.setTenantId(access.currentTenantId());
        favorite.setCompanyId(access.currentTenantId());
        favorite.setMessageId(messageId);
        favorite.setUserId(me);
        favorite.setCreatedAt(LocalDateTime.now());
        favoriteMapper.insert(favorite);
        return true;
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean toggleImportant(Long messageId) {
        ImEntities.Message message = requireVisibleMessage(messageId);
        boolean value = !Boolean.TRUE.equals(message.getIsImportant());
        message.setIsImportant(value);
        message.setUpdatedAt(LocalDateTime.now());
        messageMapper.updateById(message);
        publishConversationAfterCommit("message.updated", message.getConversationId(),
                Map.of("conversationId", message.getConversationId(), "messageId", messageId, "important", value));
        return value;
    }

    @Transactional(rollbackFor = Exception.class)
    public void markRead(Long conversationId, Long requestedSeq) {
        ImEntities.Conversation conversation = access.requireConversation(conversationId);
        long seq = Math.max(0, Math.min(requestedSeq == null ? 0 : requestedSeq, conversation.getLastSeq()));
        queryMapper.markRead(conversationId, access.currentUserId(), seq);
        queryMapper.markMentionsRead(conversationId, access.currentUserId(), seq);
        List<Long> recipients = activeMemberIds(conversationId);
        afterCommit(() -> eventPublisher.publish("receipt.read", recipients,
                Map.of("conversationId", conversationId, "userId", access.currentUserId(), "seq", seq)));
    }

    @Transactional(rollbackFor = Exception.class)
    public void markDelivered(Long conversationId, Long requestedSeq) {
        ImEntities.Conversation conversation = access.requireConversation(conversationId);
        ImEntities.Member member = access.requireMember(conversationId);
        long seq = Math.max(0, Math.min(requestedSeq == null ? 0 : requestedSeq, conversation.getLastSeq()));
        if (member.getLastDeliveredSeq() == null || member.getLastDeliveredSeq() < seq) {
            member.setLastDeliveredSeq(seq);
            member.setUpdatedAt(LocalDateTime.now());
            memberMapper.updateById(member);
            List<Long> recipients = activeMemberIds(conversationId);
            Long userId = access.currentUserId();
            afterCommit(() -> eventPublisher.publish("receipt.delivered", recipients,
                    Map.of("conversationId", conversationId, "userId", userId, "seq", seq)));
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void updateMemberSetting(Long conversationId, ImModels.MemberSettingRequest request) {
        ImEntities.Member member = access.requireMember(conversationId);
        ImEntities.Conversation conversation = conversationMapper.selectById(conversationId);
        if (request.getPinned() != null) {
            member.setIsPinned(request.getPinned());
            member.setPinnedAt(request.getPinned() ? LocalDateTime.now() : null);
        }
        if (request.getMuted() != null) member.setIsMuted(request.getMuted());
        if (request.getHidden() != null) {
            member.setIsHidden(request.getHidden());
            member.setHiddenAt(request.getHidden() ? LocalDateTime.now() : null);
        }
        if (request.getManualUnread() != null) {
            member.setManualUnreadSeq(request.getManualUnread() ? Math.max(1, conversation.getLastSeq()) : 0L);
        }
        if (request.getNotificationLevel() != null) {
            if (!NOTIFICATION_LEVELS.contains(request.getNotificationLevel())) throw new BusinessException("提醒级别不正确");
            member.setNotificationLevel(request.getNotificationLevel());
        }
        if (request.getDraft() != null) {
            String draft = contentPolicy.normalizeText(request.getDraft());
            member.setDraftJson(writeJson(Map.of("text", draft)));
        }
        member.setUpdatedAt(LocalDateTime.now());
        memberMapper.updateById(member);
        Long me = access.currentUserId();
        afterCommit(() -> eventPublisher.publish("conversation.updated", List.of(me), Map.of("conversationId", conversationId)));
    }

    @Transactional(rollbackFor = Exception.class)
    public void addMembers(Long conversationId, Collection<Long> userIds) {
        ImEntities.Conversation conversation = access.requireConversation(conversationId);
        ImEntities.Member operator = access.requireMember(conversationId);
        if (!Set.of("owner", "admin").contains(operator.getMemberRole()) && !SecurityUtils.isCurrentAdmin()) {
            throw new BusinessException("只有群主或群管理员可以添加成员");
        }
        if ("direct".equals(conversation.getType())) throw new BusinessException("单聊不能添加成员");
        List<ImModels.Contact> contacts = access.requireActiveUsers(userIds);
        for (ImModels.Contact contact : contacts) insertOrReviveMember(conversation, contact.getUserId(), "member");
        List<Long> recipients = activeMemberIds(conversationId);
        afterCommit(() -> eventPublisher.publish("member.joined", recipients,
                Map.of("conversationId", conversationId, "userIds", contacts.stream().map(ImModels.Contact::getUserId).toList())));
    }

    @Transactional(rollbackFor = Exception.class)
    public void leaveConversation(Long conversationId) {
        ImEntities.Conversation conversation = access.requireConversation(conversationId);
        ImEntities.Member member = access.requireMember(conversationId);
        if (!"group".equals(conversation.getType())) throw new BusinessException("该会话不允许自行退出");
        if ("owner".equals(member.getMemberRole())) throw new BusinessException("群主需先转让群主后再退出");
        member.setStatus("left");
        member.setLeftAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());
        memberMapper.updateById(member);
        List<Long> recipients = activeMemberIds(conversationId);
        afterCommit(() -> eventPublisher.publish("member.left", recipients,
                Map.of("conversationId", conversationId, "userId", access.currentUserId())));
    }

    public ImModels.ReadReceipt readReceipt(Long messageId) {
        ImEntities.Message message = requireVisibleMessage(messageId);
        List<ImEntities.Member> members = memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, message.getConversationId())
                .eq(ImEntities.Member::getStatus, "active"));
        Set<Long> readIds = members.stream()
                .filter(m -> !Objects.equals(m.getUserId(), message.getSenderId()))
                .filter(m -> m.getLastReadSeq() != null && m.getLastReadSeq() >= message.getSeq())
                .map(ImEntities.Member::getUserId).collect(Collectors.toCollection(LinkedHashSet::new));
        Set<Long> unreadIds = members.stream()
                .filter(m -> !Objects.equals(m.getUserId(), message.getSenderId()))
                .filter(m -> !readIds.contains(m.getUserId()))
                .map(ImEntities.Member::getUserId).collect(Collectors.toCollection(LinkedHashSet::new));
        List<Long> allIds = new ArrayList<>(readIds);
        allIds.addAll(unreadIds);
        Map<Long, ImModels.Contact> contactMap = contactsByIds(allIds);
        ImModels.ReadReceipt receipt = new ImModels.ReadReceipt();
        receipt.setMessageId(messageId);
        receipt.setSeq(message.getSeq());
        receipt.setReadUsers(readIds.stream().map(contactMap::get).filter(Objects::nonNull).toList());
        receipt.setUnreadUsers(unreadIds.stream().map(contactMap::get).filter(Objects::nonNull).toList());
        receipt.setReadCount(receipt.getReadUsers().size());
        receipt.setUnreadCount(receipt.getUnreadUsers().size());
        return receipt;
    }

    public ImEntities.Preference getPreference() {
        Long me = access.currentUserId();
        ImEntities.Preference preference = preferenceMapper.selectOne(new LambdaQueryWrapper<ImEntities.Preference>()
                .eq(ImEntities.Preference::getUserId, me).last("LIMIT 1"));
        if (preference == null) {
            preference = new ImEntities.Preference();
            preference.setUserId(me);
            preference.setBrowserNotification(false);
            preference.setSoundEnabled(true);
            preference.setDesktopEnabled(true);
        }
        return preference;
    }

    @Transactional(rollbackFor = Exception.class)
    public ImEntities.Preference updatePreference(ImModels.PreferenceRequest request) {
        ImEntities.Preference preference = getPreference();
        boolean fresh = preference.getId() == null;
        if (request.getBrowserNotification() != null) preference.setBrowserNotification(request.getBrowserNotification());
        if (request.getSoundEnabled() != null) preference.setSoundEnabled(request.getSoundEnabled());
        if (request.getDesktopEnabled() != null) preference.setDesktopEnabled(request.getDesktopEnabled());
        preference.setUpdatedAt(LocalDateTime.now());
        if (fresh) {
            preference.setTenantId(access.currentTenantId());
            preference.setCompanyId(access.currentTenantId());
            preference.setCreatedAt(LocalDateTime.now());
            preferenceMapper.insert(preference);
        } else {
            preferenceMapper.updateById(preference);
        }
        return preference;
    }

    private ImEntities.Conversation newConversation(String type, String name, Long creator) {
        ImEntities.Conversation conversation = new ImEntities.Conversation();
        conversation.setTenantId(access.currentTenantId());
        conversation.setCompanyId(access.currentTenantId());
        conversation.setType(type);
        conversation.setName(name);
        conversation.setLastSeq(0L);
        conversation.setStatus("active");
        conversation.setCreatedBy(creator);
        conversation.setCreatedAt(LocalDateTime.now());
        conversation.setUpdatedAt(LocalDateTime.now());
        return conversation;
    }

    private void insertOrReviveMember(ImEntities.Conversation conversation, Long userId, String role) {
        ImEntities.Member member = memberMapper.selectOne(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, conversation.getId())
                .eq(ImEntities.Member::getUserId, userId)
                .last("LIMIT 1"));
        if (member == null) {
            member = new ImEntities.Member();
            member.setTenantId(access.currentTenantId());
            member.setCompanyId(access.currentTenantId());
            member.setConversationId(conversation.getId());
            member.setUserId(userId);
            member.setMemberRole(role);
            member.setJoinSeq(conversation.getLastSeq());
            member.setLastReadSeq(conversation.getLastSeq());
            member.setManualUnreadSeq(0L);
            member.setLastDeliveredSeq(0L);
            member.setIsPinned(false);
            member.setIsMuted(false);
            member.setNotificationLevel("all");
            member.setIsHidden(false);
            member.setStatus("active");
            member.setJoinedAt(LocalDateTime.now());
            member.setCreatedAt(LocalDateTime.now());
            member.setUpdatedAt(LocalDateTime.now());
            memberMapper.insert(member);
        } else {
            member.setMemberRole(role);
            member.setStatus("active");
            member.setLeftAt(null);
            member.setIsHidden(false);
            member.setHiddenAt(null);
            member.setUpdatedAt(LocalDateTime.now());
            memberMapper.updateById(member);
        }
    }

    private long allocateSequence(Long conversationId) {
        if (queryMapper.incrementSequence(conversationId) != 1) throw new BusinessException("会话已归档，不能发送消息");
        Long seq = queryMapper.lastAllocatedSequence();
        if (seq == null || seq <= 0) throw new BusinessException("消息序号生成失败");
        return seq;
    }

    private Set<Long> resolveMentionUsers(ImEntities.Conversation conversation, ImEntities.Member sender,
                                           ImModels.SendMessageRequest request) {
        Set<Long> activeMembers = new LinkedHashSet<>(activeMemberIds(conversation.getId()));
        activeMembers.remove(access.currentUserId());
        if (Boolean.TRUE.equals(request.getMentionAll())) {
            if (!access.canMentionAll(conversation, sender)) throw new BusinessException("当前账号无权@所有人");
            return activeMembers;
        }
        Set<Long> mentions = new LinkedHashSet<>(distinctIds(request.getMentionedUserIds()));
        if (!activeMembers.containsAll(mentions)) throw new BusinessException("只能@当前会话内的成员");
        return mentions;
    }

    private List<ImEntities.Attachment> validatePendingAttachments(List<Long> ids, Long conversationId, Long uploaderId) {
        if (ids.isEmpty()) return List.of();
        List<ImEntities.Attachment> attachments = attachmentMapper.selectBatchIds(ids);
        if (attachments.size() != ids.size()) throw new BusinessException("部分附件不存在");
        for (ImEntities.Attachment attachment : attachments) {
            if (!Objects.equals(attachment.getConversationId(), conversationId)
                    || !Objects.equals(attachment.getUploaderId(), uploaderId)
                    || attachment.getMessageId() != null
                    || !"uploaded".equals(attachment.getUploadStatus())) {
                throw new BusinessException("附件不属于当前会话或已被使用");
            }
        }
        return attachments;
    }

    private ImEntities.Message requireVisibleMessage(Long messageId) {
        ImEntities.Message message = messageMapper.selectById(messageId);
        if (message == null) throw new BusinessException("消息不存在");
        access.requireMember(message.getConversationId());
        return message;
    }

    private ImEntities.Message requireOwnMessage(Long messageId, long windowMinutes, String action) {
        ImEntities.Message message = requireVisibleMessage(messageId);
        if (!Objects.equals(message.getSenderId(), access.currentUserId())) throw new BusinessException("只能" + action + "自己发送的消息");
        if (!"sent".equals(message.getStatus())) throw new BusinessException("当前消息状态不能" + action);
        if (message.getCreatedAt() == null || Duration.between(message.getCreatedAt(), LocalDateTime.now()).toMinutes() > windowMinutes) {
            throw new BusinessException("已超过" + action + "时限");
        }
        return message;
    }

    private void saveHistory(ImEntities.Message message, String action) {
        ImEntities.History history = new ImEntities.History();
        history.setTenantId(access.currentTenantId());
        history.setCompanyId(access.currentTenantId());
        history.setConversationId(message.getConversationId());
        history.setMessageId(message.getId());
        history.setOperatorId(access.currentUserId());
        history.setActionType(action);
        history.setContentJson(message.getContentJson());
        history.setCreatedAt(LocalDateTime.now());
        historyMapper.insert(history);

        ImEntities.AuditLog audit = new ImEntities.AuditLog();
        audit.setTenantId(access.currentTenantId());
        audit.setCompanyId(access.currentTenantId());
        audit.setOperatorId(access.currentUserId());
        audit.setActionType("message." + action);
        audit.setConversationId(message.getConversationId());
        audit.setMessageId(message.getId());
        audit.setCreatedAt(LocalDateTime.now());
        auditMapper.insert(audit);
    }

    private ImEntities.Message findByClientId(Long senderId, String clientId, Long conversationId) {
        ImEntities.Message existing = messageMapper.selectOne(new LambdaQueryWrapper<ImEntities.Message>()
                .eq(ImEntities.Message::getSenderId, senderId)
                .eq(ImEntities.Message::getClientMessageId, clientId)
                .last("LIMIT 1"));
        if (existing != null && !Objects.equals(existing.getConversationId(), conversationId)) {
            throw new BusinessException("消息幂等编号已用于其他会话，请重新发送");
        }
        return existing;
    }

    private void lockConversationForSend(Long conversationId) {
        if (queryMapper.lockConversation(conversationId) == null) {
            throw new BusinessException("会话已归档，不能发送消息");
        }
    }

    private List<Long> activeMemberIds(Long conversationId) {
        return memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                        .select(ImEntities.Member::getUserId)
                        .eq(ImEntities.Member::getConversationId, conversationId)
                        .eq(ImEntities.Member::getStatus, "active"))
                .stream().map(ImEntities.Member::getUserId).distinct().toList();
    }

    private List<ImModels.Message> enrichMessages(List<ImEntities.Message> source, Long viewerId) {
        if (source == null || source.isEmpty()) return List.of();
        List<ImEntities.Message> messages = new ArrayList<>(source);
        Set<Long> replyIds = messages.stream().map(ImEntities.Message::getReplyToMessageId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Map<Long, ImEntities.Message> replyMap = replyIds.isEmpty() ? Map.of()
                : messageMapper.selectBatchIds(replyIds).stream().collect(Collectors.toMap(ImEntities.Message::getId, Function.identity()));
        Set<Long> messageIds = messages.stream().map(ImEntities.Message::getId).collect(Collectors.toSet());
        Map<Long, Map<String, Object>> contentByMessage = messages.stream()
                .collect(Collectors.toMap(ImEntities.Message::getId, m -> readContent(m.getContentJson())));
        Set<Long> taskIds = contentByMessage.values().stream().map(content -> asLong(content.get("taskId")))
                .filter(Objects::nonNull).collect(Collectors.toCollection(LinkedHashSet::new));
        Map<Long, ImModels.WorkTask> tasksById = loadTaskCards(taskIds, viewerId, messages.get(0).getTenantId());
        Set<Long> userIds = messages.stream().map(ImEntities.Message::getSenderId).collect(Collectors.toSet());
        userIds.addAll(replyMap.values().stream().map(ImEntities.Message::getSenderId).toList());
        List<ImEntities.Attachment> attachments = attachmentMapper.selectList(new LambdaQueryWrapper<ImEntities.Attachment>()
                .in(ImEntities.Attachment::getMessageId, messageIds).eq(ImEntities.Attachment::getUploadStatus, "linked"));
        List<ImEntities.Mention> mentions = mentionMapper.selectList(new LambdaQueryWrapper<ImEntities.Mention>()
                .in(ImEntities.Mention::getMessageId, messageIds));
        userIds.addAll(mentions.stream().map(ImEntities.Mention::getMentionedUserId).toList());
        List<ImEntities.Reaction> reactions = reactionMapper.selectList(new LambdaQueryWrapper<ImEntities.Reaction>()
                .in(ImEntities.Reaction::getMessageId, messageIds));
        userIds.addAll(reactions.stream().map(ImEntities.Reaction::getUserId).toList());
        Set<Long> favoriteIds = favoriteMapper.selectList(new LambdaQueryWrapper<ImEntities.Favorite>()
                        .eq(ImEntities.Favorite::getUserId, viewerId)
                        .in(ImEntities.Favorite::getMessageId, messageIds))
                .stream().map(ImEntities.Favorite::getMessageId).collect(Collectors.toSet());
        Map<Long, ImModels.Contact> contactMap = contactsByIds(userIds);
        Map<Long, List<ImEntities.Attachment>> attachmentsByMessage = attachments.stream()
                .collect(Collectors.groupingBy(ImEntities.Attachment::getMessageId));
        Map<Long, List<ImEntities.Mention>> mentionsByMessage = mentions.stream()
                .collect(Collectors.groupingBy(ImEntities.Mention::getMessageId));
        Map<Long, List<ImEntities.Reaction>> reactionsByMessage = reactions.stream()
                .collect(Collectors.groupingBy(ImEntities.Reaction::getMessageId));
        Map<Long, List<ImEntities.Member>> membersByConversation = new HashMap<>();

        List<ImModels.Message> result = new ArrayList<>();
        for (ImEntities.Message entity : messages) {
            ImModels.Contact sender = contactMap.get(entity.getSenderId());
            ImModels.Message item = new ImModels.Message();
            item.setId(entity.getId());
            item.setConversationId(entity.getConversationId());
            item.setClientMessageId(entity.getClientMessageId());
            item.setSeq(entity.getSeq());
            item.setSenderId(entity.getSenderId());
            item.setSenderName(sender != null ? sender.getName()
                    : Objects.equals(entity.getSenderId(), 0L) ? "系统消息" : "已离职员工");
            item.setSenderAvatar(sender != null ? sender.getAvatar() : null);
            item.setMessageType(entity.getMessageType());
            item.setStatus(entity.getStatus());
            item.setRecalled("recalled".equals(entity.getStatus()));
            item.setText(item.isRecalled() ? "消息已撤回" : extractText(entity.getContentJson()));
            Map<String, Object> content = contentByMessage.getOrDefault(entity.getId(), Map.of());
            if (content.get("forwardedMessageId") != null) {
                ImModels.ForwardSource sourceInfo = new ImModels.ForwardSource();
                sourceInfo.setMessageId(asLong(content.get("forwardedMessageId")));
                sourceInfo.setConversationId(asLong(content.get("forwardedConversationId")));
                sourceInfo.setSenderId(asLong(content.get("forwardedSenderId")));
                sourceInfo.setSenderName(String.valueOf(content.getOrDefault("forwardedSenderName", "已离职员工")));
                sourceInfo.setConversationName(String.valueOf(content.getOrDefault("forwardedConversationName", "原会话")));
                item.setForwardedFrom(sourceInfo);
            }
            item.setImportant(Boolean.TRUE.equals(entity.getIsImportant()));
            item.setEdited(entity.getEditedAt() != null);
            item.setCreatedAt(entity.getCreatedAt());
            item.setMine(Objects.equals(entity.getSenderId(), viewerId));
            item.setFavorite(favoriteIds.contains(entity.getId()));

            ImEntities.Message reply = entity.getReplyToMessageId() == null ? null : replyMap.get(entity.getReplyToMessageId());
            if (reply != null) {
                ImModels.MessageSnippet snippet = new ImModels.MessageSnippet();
                snippet.setId(reply.getId());
                snippet.setSenderId(reply.getSenderId());
                ImModels.Contact replySender = contactMap.get(reply.getSenderId());
                snippet.setSenderName(replySender != null ? replySender.getName()
                        : Objects.equals(reply.getSenderId(), 0L) ? "系统消息" : "已离职员工");
                snippet.setStatus(reply.getStatus());
                snippet.setText("recalled".equals(reply.getStatus()) ? "原消息已撤回" : extractText(reply.getContentJson()));
                item.setReplyTo(snippet);
            }
            item.setAttachments(attachmentsByMessage.getOrDefault(entity.getId(), List.of()).stream()
                    .map(this::toAttachment).toList());
            item.setMentions(mentionsByMessage.getOrDefault(entity.getId(), List.of()).stream().map(m -> {
                ImModels.Mention mention = new ImModels.Mention();
                mention.setUserId(m.getMentionedUserId());
                ImModels.Contact contact = contactMap.get(m.getMentionedUserId());
                mention.setName(contact != null ? contact.getName() : "已离职员工");
                mention.setType(m.getMentionType());
                mention.setRead(m.getReadAt() != null);
                return mention;
            }).toList());
            item.setReactions(groupReactions(reactionsByMessage.getOrDefault(entity.getId(), List.of()), contactMap, viewerId));
            List<ImEntities.Member> convMembers = membersByConversation.computeIfAbsent(entity.getConversationId(), id ->
                    memberMapper.selectList(new LambdaQueryWrapper<ImEntities.Member>()
                            .eq(ImEntities.Member::getConversationId, id).eq(ImEntities.Member::getStatus, "active")));
            int readCount = (int) convMembers.stream()
                    .filter(m -> !Objects.equals(m.getUserId(), entity.getSenderId()))
                    .filter(m -> m.getLastReadSeq() != null && m.getLastReadSeq() >= entity.getSeq()).count();
            item.setReadCount(readCount);
            int deliveredCount = (int) convMembers.stream()
                    .filter(m -> !Objects.equals(m.getUserId(), entity.getSenderId()))
                    .filter(m -> m.getLastDeliveredSeq() != null && m.getLastDeliveredSeq() >= entity.getSeq()).count();
            item.setDeliveredCount(deliveredCount);
            boolean senderIsMember = convMembers.stream().anyMatch(m -> Objects.equals(m.getUserId(), entity.getSenderId()));
            item.setUnreadCount(Math.max(0, convMembers.size() - (senderIsMember ? 1 : 0) - readCount));
            Long taskId = asLong(content.get("taskId"));
            if (taskId != null) item.setTask(tasksById.get(taskId));
            if ("business".equals(entity.getMessageType()) || content.get("businessType") != null) {
                ImModels.BusinessCard business = new ImModels.BusinessCard();
                business.setEventId(stringValue(content.get("eventId")));
                business.setEventType(stringValue(content.get("eventType")));
                business.setTitle(stringValue(content.get("title")));
                business.setBusinessType(stringValue(content.get("businessType")));
                business.setBusinessId(asLong(content.get("businessId")));
                business.setCurrentStatus(stringValue(content.get("currentStatus")));
                business.setResponsibleId(asLong(content.get("responsibleId")));
                business.setResponsibleName(stringValue(content.get("responsibleName")));
                business.setOperatorId(asLong(content.get("operatorId")));
                business.setOperatorName(stringValue(content.get("operatorName")));
                business.setOccurredAt(asLocalDateTime(content.get("occurredAt")));
                business.setRequirement(stringValue(content.get("requirement")));
                business.setActionLabel(stringValue(content.get("actionLabel")));
                business.setActionUrl(stringValue(content.get("actionUrl")));
                item.setBusiness(business);
            }
            result.add(item);
        }
        return result;
    }

    private Map<Long, ImModels.WorkTask> loadTaskCards(Set<Long> taskIds, Long viewerId, Long tenantId) {
        if (taskIds == null || taskIds.isEmpty() || tenantId == null) return Map.of();
        List<ImModels.WorkTask> tasks = taskQueryMapper.tasksByIds(List.copyOf(taskIds), tenantId);
        if (tasks.isEmpty()) return Map.of();
        Map<Long, List<ImModels.TaskParticipant>> participants = taskQueryMapper
                .participantsByTaskIds(tasks.stream().map(ImModels.WorkTask::getTaskId).toList(), tenantId)
                .stream().collect(Collectors.groupingBy(ImModels.TaskParticipant::getTaskId));
        for (ImModels.WorkTask task : tasks) {
            List<ImModels.TaskParticipant> people = participants.getOrDefault(task.getTaskId(), List.of());
            task.setParticipants(people);
            boolean responsible = people.stream().anyMatch(p -> Objects.equals(p.getUserId(), viewerId)
                    && "responsible".equals(p.getRole()));
            boolean reviewer = Objects.equals(task.getReviewerId(), viewerId)
                    || taskAccess.isBoss() || taskAccess.isDepartmentManager(task.getDeptId());
            boolean creator = Objects.equals(task.getCreatorId(), viewerId);
            task.setCanAccept(responsible && Set.of("pending_accept", "rejected").contains(task.getWorkflowState()));
            task.setCanSubmit(responsible && Set.of("in_progress", "rejected").contains(task.getWorkflowState()));
            task.setCanReview(reviewer && "pending_review".equals(task.getWorkflowState()));
            task.setCanCancel((creator || taskAccess.isBoss() || taskAccess.isDepartmentManager(task.getDeptId()))
                    && !Set.of("completed", "cancelled").contains(task.getWorkflowState()));
        }
        return tasks.stream().collect(Collectors.toMap(ImModels.WorkTask::getTaskId, Function.identity()));
    }

    private List<ImModels.ReactionGroup> groupReactions(List<ImEntities.Reaction> reactions,
                                                         Map<Long, ImModels.Contact> contacts, Long viewerId) {
        Map<String, List<ImEntities.Reaction>> grouped = reactions.stream()
                .collect(Collectors.groupingBy(ImEntities.Reaction::getReactionCode, LinkedHashMap::new, Collectors.toList()));
        return grouped.entrySet().stream().map(entry -> {
            ImModels.ReactionGroup group = new ImModels.ReactionGroup();
            group.setCode(entry.getKey());
            group.setCount(entry.getValue().size());
            group.setReactedByMe(entry.getValue().stream().anyMatch(r -> Objects.equals(r.getUserId(), viewerId)));
            group.setUserNames(entry.getValue().stream().map(r -> contacts.get(r.getUserId()))
                    .filter(Objects::nonNull).map(ImModels.Contact::getName).toList());
            return group;
        }).toList();
    }

    private ImModels.Attachment toAttachment(ImEntities.Attachment entity) {
        ImModels.Attachment attachment = new ImModels.Attachment();
        attachment.setId(entity.getId());
        attachment.setMessageId(entity.getMessageId());
        attachment.setOriginalName(entity.getOriginalName());
        attachment.setMimeType(entity.getMimeType());
        attachment.setFileSize(entity.getFileSize());
        attachment.setImage(entity.getMimeType() != null && entity.getMimeType().startsWith("image/"));
        attachment.setPreviewUrl("/im/attachments/" + entity.getId() + "/inline");
        attachment.setDownloadUrl("/im/attachments/" + entity.getId() + "/download");
        attachment.setThumbnailUrl(entity.getThumbnailKey() == null ? null : "/im/attachments/" + entity.getId() + "/thumbnail");
        attachment.setCreatedAt(entity.getCreatedAt());
        return attachment;
    }

    private void applyContactPresence(ImModels.Contact contact) {
        if (contact == null || contact.getUserId() == null) return;
        contact.setOnline(eventPublisher.isOnline(contact.getUserId()));
        LocalDateTime realtimeLastActive = eventPublisher.lastActiveAt(contact.getUserId());
        if (realtimeLastActive != null && (contact.getLastActiveAt() == null
                || realtimeLastActive.isAfter(contact.getLastActiveAt()))) {
            contact.setLastActiveAt(realtimeLastActive);
        }
    }

    private void applyDirectPresence(ImModels.Conversation conversation) {
        if (conversation == null || !"direct".equals(conversation.getType())
                || conversation.getPeerUserId() == null) return;
        Long peerUserId = conversation.getPeerUserId();
        conversation.setPeerOnline(eventPublisher.isOnline(peerUserId));
        LocalDateTime realtimeLastActive = eventPublisher.lastActiveAt(peerUserId);
        if (realtimeLastActive != null && (conversation.getPeerLastActiveAt() == null
                || realtimeLastActive.isAfter(conversation.getPeerLastActiveAt()))) {
            conversation.setPeerLastActiveAt(realtimeLastActive);
        }
    }

    private Map<Long, ImModels.Contact> contactsByIds(Collection<Long> ids) {
        List<Long> unique = ids == null ? List.of() : ids.stream().filter(Objects::nonNull).distinct().toList();
        if (unique.isEmpty()) return Map.of();
        return queryMapper.contactsByIds(unique).stream()
                .collect(Collectors.toMap(ImModels.Contact::getUserId, Function.identity(), (left, right) -> left));
    }

    private Map<String, Object> messageContent(String text, ImEntities.Message forwarded) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("text", text == null ? "" : text);
        if (forwarded != null) {
            payload.put("forwardedMessageId", forwarded.getId());
            payload.put("forwardedConversationId", forwarded.getConversationId());
            payload.put("forwardedSenderId", forwarded.getSenderId());
            ImModels.Contact originalSender = contactsByIds(List.of(forwarded.getSenderId())).get(forwarded.getSenderId());
            payload.put("forwardedSenderName", originalSender != null ? originalSender.getName() : "已离职员工");
            try {
                payload.put("forwardedConversationName", conversationById(forwarded.getConversationId()).getName());
            } catch (BusinessException ignored) {
                payload.put("forwardedConversationName", "原会话");
            }
        }
        return payload;
    }

    private String extractText(String json) {
        Object text = readContent(json).get("text");
        return text == null ? "" : String.valueOf(text);
    }

    private Map<String, Object> readContent(String json) {
        if (!StringUtils.hasText(json)) return Map.of();
        try { return objectMapper.readValue(json, new TypeReference<>() {}); }
        catch (Exception ignored) { return Map.of(); }
    }

    private Long asLong(Object value) {
        if (value instanceof Number number) return number.longValue();
        try { return value == null ? null : Long.valueOf(String.valueOf(value)); }
        catch (NumberFormatException ignored) { return null; }
    }

    private LocalDateTime asLocalDateTime(Object value) {
        if (value instanceof LocalDateTime dateTime) return dateTime;
        try { return value == null ? null : LocalDateTime.parse(String.valueOf(value)); }
        catch (Exception ignored) { return null; }
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            throw new BusinessException("消息内容格式错误");
        }
    }

    private List<Long> distinctIds(Collection<Long> ids) {
        if (ids == null) return List.of();
        return ids.stream().filter(Objects::nonNull).distinct().toList();
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) return null;
        return value.trim();
    }

    private void publishConversationAfterCommit(String event, Long conversationId, Object data) {
        List<Long> recipients = activeMemberIds(conversationId);
        afterCommit(() -> eventPublisher.publish(event, recipients, data));
    }

    private void afterCommit(Runnable action) {
        if (TransactionSynchronizationManager.isActualTransactionActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override public void afterCommit() { action.run(); }
            });
        } else {
            action.run();
        }
    }

    private String encodeCursor(ImModels.Conversation row) {
        int pinned = row.isPinned() ? 1 : 0;
        LocalDateTime time = row.getSortTime() != null ? row.getSortTime() : LocalDateTime.of(1970, 1, 1, 0, 0);
        String raw = pinned + "|" + time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "|" + row.getId();
        return Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8));
    }

    private Cursor decodeCursor(String cursor) {
        if (!StringUtils.hasText(cursor)) return new Cursor(null, null, null);
        try {
            String raw = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
            String[] parts = raw.split("\\|", 3);
            return new Cursor(Integer.valueOf(parts[0]), LocalDateTime.parse(parts[1], DateTimeFormatter.ISO_LOCAL_DATE_TIME), Long.valueOf(parts[2]));
        } catch (Exception e) {
            throw new BusinessException("会话游标已失效，请刷新列表");
        }
    }

    private record Cursor(Integer pinned, LocalDateTime time, Long id) {}
}

package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.domain.ImModels;
import com.zhehang.erp.modules.im.mapper.ImConversationMapper;
import com.zhehang.erp.modules.im.mapper.ImMemberMapper;
import com.zhehang.erp.modules.im.mapper.ImQueryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/** 会话、订阅、搜索和附件共用同一套后端成员鉴权。 */
@Service
@RequiredArgsConstructor
public class ImAccessService {
    private final ImConversationMapper conversationMapper;
    private final ImMemberMapper memberMapper;
    private final ImQueryMapper queryMapper;

    public Long currentUserId() {
        Long id = SecurityUtils.getCurrentUserId();
        if (id == null) throw new BusinessException("登录已失效");
        return id;
    }

    public Long currentTenantId() {
        Long id = SecurityUtils.getCurrentTenantId();
        if (id == null) throw new BusinessException("当前账号未关联公司");
        return id;
    }

    public ImEntities.Member requireMember(Long conversationId) {
        if (conversationId == null) throw new BusinessException("会话不能为空");
        Long userId = currentUserId();
        ImEntities.Member member = memberMapper.selectOne(new LambdaQueryWrapper<ImEntities.Member>()
                .eq(ImEntities.Member::getConversationId, conversationId)
                .eq(ImEntities.Member::getUserId, userId)
                .eq(ImEntities.Member::getStatus, "active")
                .last("LIMIT 1"));
        if (member == null) throw new BusinessException("无权访问该会话");
        return member;
    }

    public ImEntities.Conversation requireConversation(Long conversationId) {
        requireMember(conversationId);
        ImEntities.Conversation conversation = conversationMapper.selectById(conversationId);
        if (conversation == null || !"active".equals(conversation.getStatus())) {
            throw new BusinessException("会话不存在或已归档");
        }
        return conversation;
    }

    public List<ImModels.Contact> requireActiveUsers(Collection<Long> requestedIds) {
        Set<Long> ids = new LinkedHashSet<>();
        if (requestedIds != null) requestedIds.stream().filter(java.util.Objects::nonNull).forEach(ids::add);
        if (ids.isEmpty()) return List.of();
        List<ImModels.Contact> contacts = queryMapper.contactsByIds(List.copyOf(ids));
        Set<Long> found = contacts.stream().map(ImModels.Contact::getUserId).collect(java.util.stream.Collectors.toSet());
        if (found.size() != ids.size() || !found.containsAll(ids)) {
            throw new BusinessException("包含已停用、已离职或不属于本公司的员工");
        }
        return contacts;
    }

    public boolean canMentionAll(ImEntities.Conversation conversation, ImEntities.Member member) {
        return SecurityUtils.isCurrentAdmin()
                || SecurityUtils.hasAnyRole("boss", "super_admin", "dept_manager")
                || "owner".equals(member.getMemberRole())
                || "admin".equals(member.getMemberRole())
                || java.util.Objects.equals(conversation.getOwnerId(), currentUserId());
    }
}

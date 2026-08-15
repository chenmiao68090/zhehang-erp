package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournal;
import com.zhehang.erp.modules.finance.domain.entity.FinCashJournalEvent;
import com.zhehang.erp.modules.finance.mapper.FinCashJournalEventMapper;
import com.zhehang.erp.modules.system.domain.entity.SysUser;
import com.zhehang.erp.modules.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

/** 资金动作审计只追加，业务备注修改不能覆盖它。 */
@Service
@RequiredArgsConstructor
public class CashJournalEventService {

    private final FinCashJournalEventMapper eventMapper;
    private final SysUserMapper sysUserMapper;
    private final ObjectMapper objectMapper;

    public void append(FinCashJournal journal,
                       String eventType,
                       String fromStatus,
                       String content,
                       Object metadata) {
        if (journal == null || journal.getId() == null) {
            return;
        }
        FinCashJournalEvent event = new FinCashJournalEvent();
        event.setJournalId(journal.getId());
        event.setEventType(eventType);
        event.setFromStatus(fromStatus);
        event.setToStatus(snapshot(journal));
        event.setContent(StringUtils.hasText(content) ? content : eventType);
        event.setOperatorId(SecurityUtils.getCurrentUserId());
        event.setOperatorName(currentActorName());
        event.setEventTime(LocalDateTime.now());
        event.setMetadataJson(toJson(metadata));
        eventMapper.insert(event);
    }

    public List<FinCashJournalEvent> list(Long journalId) {
        return eventMapper.selectList(new LambdaQueryWrapper<FinCashJournalEvent>()
                .eq(FinCashJournalEvent::getJournalId, journalId)
                .orderByDesc(FinCashJournalEvent::getEventTime)
                .orderByDesc(FinCashJournalEvent::getId));
    }

    public String snapshot(FinCashJournal journal) {
        if (journal == null) {
            return null;
        }
        return String.join("/",
                value(journal.getRecordStatus(), "active"),
                value(journal.getMatchStatus(), "waiting"),
                value(journal.getReviewStatus(), "draft"),
                value(journal.getExceptionStatus(), "none"));
    }

    private String currentActorName() {
        Long uid = SecurityUtils.getCurrentUserId();
        if (uid != null) {
            SysUser user = sysUserMapper.selectById(uid);
            if (user != null) {
                return StringUtils.hasText(user.getNickname()) ? user.getNickname() : user.getUsername();
            }
        }
        return SecurityUtils.getCurrentUsername();
    }

    private String toJson(Object metadata) {
        if (metadata == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (JsonProcessingException ignore) {
            return null;
        }
    }

    private String value(String value, String fallback) {
        return StringUtils.hasText(value) ? value : fallback;
    }
}

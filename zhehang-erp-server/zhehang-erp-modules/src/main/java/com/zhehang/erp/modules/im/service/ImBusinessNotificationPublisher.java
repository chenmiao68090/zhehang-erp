package com.zhehang.erp.modules.im.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImModels;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import lombok.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;

/**
 * 旧业务接入 IM outbox 的统一适配器。
 *
 * <p>这里只做事件字段归一和收件人去重，最终仍调用
 * {@link ImNotificationOutboxService#enqueueBusinessEvent(ImModels.BusinessNotification)}
 * 严格入队；调用方不得吞掉异常，确保业务数据与通知事件同成同败。</p>
 */
@Service
@RequiredArgsConstructor
public class ImBusinessNotificationPublisher {
    private final ImNotificationOutboxService outboxService;

    public Long publish(Notice notice) {
        if (notice == null) {
            throw new BusinessException("业务通知不能为空");
        }
        if (!StringUtils.hasText(notice.getEventId()) || !StringUtils.hasText(notice.getEventType())) {
            throw new BusinessException("业务通知缺少事件编号或类型");
        }
        if (!StringUtils.hasText(notice.getTitle()) || !StringUtils.hasText(notice.getText())) {
            throw new BusinessException("业务通知缺少标题或内容");
        }
        if (!StringUtils.hasText(notice.getBusinessType()) || notice.getBusinessId() == null) {
            throw new BusinessException("业务通知缺少业务定位");
        }

        LinkedHashSet<Long> uniqueRecipients = new LinkedHashSet<>();
        Collection<Long> requestedRecipients = notice.getRecipientIds();
        if (requestedRecipients != null) {
            requestedRecipients.stream()
                    .filter(java.util.Objects::nonNull)
                    .forEach(uniqueRecipients::add);
        }
        if (uniqueRecipients.isEmpty()) {
            throw new BusinessException("业务通知没有有效接收人");
        }
        List<Long> recipients = new ArrayList<>(uniqueRecipients);

        ImModels.BusinessNotification event = new ImModels.BusinessNotification();
        event.setEventId(notice.getEventId());
        event.setEventType(notice.getEventType());
        event.setTitle(notice.getTitle());
        event.setText(notice.getText());
        event.setRecipientIds(recipients);
        event.setBusinessType(notice.getBusinessType());
        event.setBusinessId(notice.getBusinessId());
        event.setCurrentStatus(notice.getCurrentStatus());
        event.setResponsibleId(notice.getResponsibleId() != null
                ? notice.getResponsibleId() : recipients.get(0));
        event.setOperatorId(notice.getOperatorId());
        event.setOccurredAt(notice.getOccurredAt() != null
                ? notice.getOccurredAt() : LocalDateTime.now());
        event.setRequirement(notice.getRequirement());
        event.setActionLabel(notice.getActionLabel());
        event.setActionUrl(notice.getActionUrl());
        event.setImportant(notice.isImportant());
        return outboxService.enqueueBusinessEvent(event);
    }

    @Value
    @Builder
    public static class Notice {
        String eventId;
        String eventType;
        String title;
        String text;
        Collection<Long> recipientIds;
        String businessType;
        Long businessId;
        String currentStatus;
        Long responsibleId;
        Long operatorId;
        LocalDateTime occurredAt;
        String requirement;
        String actionLabel;
        String actionUrl;
        boolean important;
    }
}

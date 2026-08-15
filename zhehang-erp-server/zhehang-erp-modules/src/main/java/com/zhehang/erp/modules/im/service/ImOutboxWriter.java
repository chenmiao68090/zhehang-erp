package com.zhehang.erp.modules.im.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.im.domain.ImEntities;
import com.zhehang.erp.modules.im.mapper.ImNotificationOutboxMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 写入 outbox；存在业务事务时加入同一事务，无事务时自行开启。 */
@Service
@RequiredArgsConstructor
public class ImOutboxWriter {
    private final ImNotificationOutboxMapper outboxMapper;

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public Long enqueue(Long tenantId, Long companyId, String eventId, String eventType, String payloadJson) {
        if (tenantId == null || companyId == null || !tenantId.equals(companyId)) {
            throw new BusinessException("通知事件缺少公司信息");
        }
        if (!StringUtils.hasText(eventId) || eventId.length() > 100
                || !eventId.matches("[A-Za-z0-9._:-]+")) {
            throw new BusinessException("通知事件编号格式不正确");
        }
        if (!StringUtils.hasText(eventType) || eventType.length() > 80) {
            throw new BusinessException("通知事件类型格式不正确");
        }
        if (!StringUtils.hasText(payloadJson)) throw new BusinessException("通知事件内容不能为空");

        ImEntities.NotificationOutbox row = new ImEntities.NotificationOutbox();
        row.setTenantId(tenantId);
        row.setCompanyId(companyId);
        row.setEventId(eventId);
        row.setEventType(eventType);
        row.setPayloadJson(payloadJson);
        row.setStatus("pending");
        row.setRetryCount(0);
        row.setNextRetryAt(LocalDateTime.now());
        row.setCreatedAt(LocalDateTime.now());
        row.setUpdatedAt(LocalDateTime.now());
        try {
            outboxMapper.insert(row);
            return row.getId();
        } catch (DuplicateKeyException duplicate) {
            ImEntities.NotificationOutbox existing = outboxMapper.selectOne(
                    new LambdaQueryWrapper<ImEntities.NotificationOutbox>()
                            .eq(ImEntities.NotificationOutbox::getCompanyId, companyId)
                            .eq(ImEntities.NotificationOutbox::getEventId, eventId)
                            .last("LIMIT 1"));
            if (existing != null) return existing.getId();
            throw duplicate;
        }
    }
}

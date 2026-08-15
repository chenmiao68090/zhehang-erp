package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.system.domain.entity.SysNotification;
import com.zhehang.erp.modules.system.domain.vo.NotificationVO;
import com.zhehang.erp.modules.system.mapper.SysNotificationMapper;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class SysNotificationServiceImpl extends ServiceImpl<SysNotificationMapper, SysNotification>
        implements ISysNotificationService {

    private final SysNotificationMapper notificationMapper;

    private static final Map<String, Integer> TYPE_CODE_MAP = Map.of(
            "system", 1,
            "approval", 2,
            "task", 3,
            "message", 4
    );

    private static final Map<Integer, String> TYPE_NAME_MAP = Map.of(
            1, "system",
            2, "approval",
            3, "task",
            4, "message"
    );

    @Override
    public IPage<NotificationVO> listNotification(Long userId, String type, Integer isRead, String keyword, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysNotification::getUserId, userId);
        Integer typeCode = StringUtils.hasText(type) ? TYPE_CODE_MAP.get(type) : null;
        wrapper.eq(typeCode != null, SysNotification::getType, typeCode);
        if (isRead != null) {
            wrapper.eq(SysNotification::getIsRead, isRead);
        }
        wrapper.and(StringUtils.hasText(keyword),
                w -> w.like(SysNotification::getTitle, keyword)
                      .or()
                      .like(SysNotification::getContent, keyword));
        wrapper.orderByDesc(SysNotification::getCreateTime);

        Page<SysNotification> page = new Page<>(pageNum, pageSize);
        IPage<SysNotification> result = notificationMapper.selectPage(page, wrapper);

        return result.convert(entity -> {
            NotificationVO vo = new NotificationVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setType(TYPE_NAME_MAP.getOrDefault(entity.getType(), "system"));
            vo.setIsRead(entity.getIsRead() != null && entity.getIsRead() == 1);
            return vo;
        });
    }

    @Override
    public void markAsRead(Long id, Long userId) {
        SysNotification notification = notificationMapper.selectById(id);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setIsRead(1);
            notification.setReadTime(LocalDateTime.now());
            notificationMapper.updateById(notification);
        }
    }

    @Override
    public void markAllAsRead(Long userId) {
        notificationMapper.markAllRead(userId);
    }

    @Override
    public void deleteNotification(Long id, Long userId) {
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysNotification::getId, id);
        wrapper.eq(SysNotification::getUserId, userId);
        notificationMapper.delete(wrapper);
    }

    @Override
    public int getUnreadCount(Long userId) {
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysNotification::getUserId, userId);
        wrapper.eq(SysNotification::getIsRead, 0);
        return Math.toIntExact(notificationMapper.selectCount(wrapper));
    }

    /** 业务待办类通知默认类型:3-task(见 SysNotification.type 注释)。 */
    private static final int DEFAULT_TYPE = 3;

    @Override
    public void send(Long userId, String title, String content, Integer type, String sender, String link) {
        insertNotification(null, userId, null, title, content, type, sender, link);
    }

    @Override
    public void sendOnce(Long userId, String eventId, String title, String content, Integer type, String sender, String link) {
        if (!StringUtils.hasText(eventId) || eventId.length() > 100
                || !eventId.matches("[A-Za-z0-9._:-]+")) {
            throw new IllegalArgumentException("通知事件号格式不正确");
        }
        insertNotification(null, userId, eventId, title, content, type, sender, link);
    }

    private void insertNotification(Long tenantId, Long userId, String eventId, String title, String content,
                                    Integer type, String sender, String link) {
        if (userId == null) {
            return;
        }
        SysNotification n = new SysNotification();
        n.setUserId(userId);
        n.setTitle(title);
        n.setContent(content);
        n.setType(type != null ? type : DEFAULT_TYPE);
        n.setIsRead(0);
        // V152 起 sender/link 真正落库，消息中心可展示业务发送方并跳转处理。
        n.setSender(sender);
        n.setLink(link);
        n.setEventId(eventId);
        if (tenantId != null) n.setTenantId(tenantId);
        try {
            notificationMapper.insert(n);
        } catch (DuplicateKeyException duplicate) {
            if (!StringUtils.hasText(eventId)) throw duplicate;
        }
    }

    @Override
    public void sendBatch(java.util.List<Long> userIds, String title, String content, Integer type, String sender, String link) {
        if (userIds == null || userIds.isEmpty()) {
            return;
        }
        userIds.stream()
                .filter(java.util.Objects::nonNull)
                .distinct()
                .forEach(uid -> send(uid, title, content, type, sender, link));
    }

    @Override
    public void sendBatchOnce(java.util.List<Long> userIds, String eventId, String title, String content,
                              Integer type, String sender, String link) {
        if (userIds == null || userIds.isEmpty()) return;
        userIds.stream().filter(java.util.Objects::nonNull).distinct()
                .forEach(uid -> sendOnce(uid, eventId, title, content, type, sender, link));
    }

    @Override
    public void sendBatchOnceForTenant(Long tenantId, java.util.List<Long> userIds, String eventId,
                                       String title, String content, Integer type, String sender, String link) {
        if (tenantId == null || userIds == null || userIds.isEmpty()) return;
        if (!StringUtils.hasText(eventId) || eventId.length() > 100
                || !eventId.matches("[A-Za-z0-9._:-]+")) {
            throw new IllegalArgumentException("通知事件号格式不正确");
        }
        userIds.stream().filter(java.util.Objects::nonNull).distinct()
                .forEach(uid -> insertNotification(tenantId, uid, eventId, title, content, type, sender, link));
    }
}

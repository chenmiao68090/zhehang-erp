package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.system.domain.vo.NotificationVO;

public interface ISysNotificationService {
    IPage<NotificationVO> listNotification(Long userId, String type, Integer isRead, String keyword, Integer pageNum, Integer pageSize);
    void markAsRead(Long id, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id, Long userId);
    int getUnreadCount(Long userId);
}

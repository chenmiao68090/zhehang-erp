package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.system.domain.vo.NotificationVO;

public interface ISysNotificationService {
    IPage<NotificationVO> listNotification(Long userId, String type, Integer isRead, String keyword, Integer pageNum, Integer pageSize);
    void markAsRead(Long id, Long userId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long id, Long userId);
    int getUnreadCount(Long userId);

    /**
     * 发送一条通知给单个收件人。
     * type 取值:1-system / 2-approval / 3-task(业务待办) / 4-message;
     * 业务待办类提醒统一传 3(见 SysNotification.type 注释)。
     * userId 为空则不发送。
     */
    void send(Long userId, String title, String content, Integer type, String sender, String link);

    /**
     * 批量发送:对去重后的每个 userId 各发一条(内部复用 send)。
     * userIds 为空/全空则不发送。
     */
    void sendBatch(java.util.List<Long> userIds, String title, String content, Integer type, String sender, String link);

    /** 使用业务事件号幂等发送，定时扫描重复命中时不重复入库。 */
    void sendOnce(Long userId, String eventId, String title, String content, Integer type, String sender, String link);

    /** 批量幂等发送，同一 eventId 可分别发给多个收件人。 */
    void sendBatchOnce(java.util.List<Long> userIds, String eventId, String title, String content,
                       Integer type, String sender, String link);

    /** 定时任务无登录上下文时，显式指定租户的幂等批量通知。 */
    void sendBatchOnceForTenant(Long tenantId, java.util.List<Long> userIds, String eventId,
                                String title, String content, Integer type, String sender, String link);
}

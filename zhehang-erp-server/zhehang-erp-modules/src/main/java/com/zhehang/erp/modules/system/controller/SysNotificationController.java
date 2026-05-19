package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.vo.NotificationVO;
import com.zhehang.erp.modules.system.service.ISysNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/notification")
@RequiredArgsConstructor
public class SysNotificationController {

    private final ISysNotificationService notificationService;

    /** 获取通知列表 */
    @GetMapping("/list")
    public R<IPage<NotificationVO>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer isRead,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "15") Integer pageSize) {
        // TODO: 从 SecurityContext 获取当前用户 ID
        Long userId = 1L;
        return R.ok(notificationService.listNotification(userId, type, isRead, pageNum, pageSize));
    }

    /** 标记单条已读 */
    @PutMapping("/read/{id}")
    public R<Void> markRead(@PathVariable Long id) {
        Long userId = 1L;
        notificationService.markAsRead(id, userId);
        return R.ok();
    }

    /** 全部标记已读 */
    @PutMapping("/readAll")
    public R<Void> markAllRead() {
        Long userId = 1L;
        notificationService.markAllAsRead(userId);
        return R.ok();
    }

    /** 删除通知 */
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) {
        Long userId = 1L;
        notificationService.deleteNotification(id, userId);
        return R.ok();
    }

    /** 获取未读数量 */
    @GetMapping("/unreadCount")
    public R<Integer> unreadCount() {
        Long userId = 1L;
        return R.ok(notificationService.getUnreadCount(userId));
    }
}

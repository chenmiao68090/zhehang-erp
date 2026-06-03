package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmReminder;
import com.zhehang.erp.modules.crm.service.ICrmReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/crm/reminder")
@RequiredArgsConstructor
public class CrmReminderController {

    private final ICrmReminderService reminderService;

    @GetMapping("/my")
    public R<List<CrmReminder>> my(@RequestParam Long userId) {
        return R.ok(reminderService.getMyReminders(userId));
    }

    @GetMapping("/unread-count")
    public R<Long> unreadCount(@RequestParam Long userId) {
        return R.ok(reminderService.getUnreadCount(userId));
    }

    @PutMapping("/read/{id}")
    @Log(module = "提醒中心", type = Log.OperationType.UPDATE)
    public R<Boolean> read(@PathVariable Long id) {
        return R.ok(reminderService.markAsRead(id));
    }

    @PutMapping("/read-all")
    @Log(module = "提醒中心", type = Log.OperationType.UPDATE)
    public R<Integer> readAll(@RequestParam Long userId) {
        return R.ok(reminderService.markAllAsRead(userId));
    }
}

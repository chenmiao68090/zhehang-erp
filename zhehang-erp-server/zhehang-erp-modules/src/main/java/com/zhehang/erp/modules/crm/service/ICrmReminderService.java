package com.zhehang.erp.modules.crm.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.zhehang.erp.modules.crm.domain.entity.CrmReminder;

import java.util.List;

public interface ICrmReminderService extends IService<CrmReminder> {
    /** 创建提醒 */
    boolean createReminder(CrmReminder reminder);

    /** 我的提醒列表 */
    List<CrmReminder> getMyReminders(Long userId);

    /** 标记已读 */
    boolean markAsRead(Long id);

    /** 全部已读 */
    int markAllAsRead(Long userId);

    /** 未读数量 */
    long getUnreadCount(Long userId);
}

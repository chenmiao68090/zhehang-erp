package com.zhehang.erp.modules.crm.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.crm.domain.entity.CrmReminder;
import com.zhehang.erp.modules.crm.mapper.CrmReminderMapper;
import com.zhehang.erp.modules.crm.service.ICrmReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CrmReminderServiceImpl extends ServiceImpl<CrmReminderMapper, CrmReminder> implements ICrmReminderService {

    private final CrmReminderMapper reminderMapper;

    @Override
    public boolean createReminder(CrmReminder reminder) {
        if (reminder.getStatus() == null) {
            reminder.setStatus(0);
        }
        if (reminder.getSentTime() == null) {
            reminder.setSentTime(LocalDateTime.now());
        }
        return reminderMapper.insert(reminder) > 0;
    }

    @Override
    public List<CrmReminder> getMyReminders(Long userId) {
        LambdaQueryWrapper<CrmReminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmReminder::getRecipientId, userId)
               .orderByDesc(CrmReminder::getSentTime);
        return reminderMapper.selectList(wrapper);
    }

    @Override
    public boolean markAsRead(Long id) {
        LambdaUpdateWrapper<CrmReminder> uw = new LambdaUpdateWrapper<>();
        uw.eq(CrmReminder::getId, id)
          .set(CrmReminder::getStatus, 1)
          .set(CrmReminder::getReadTime, LocalDateTime.now());
        return reminderMapper.update(null, uw) > 0;
    }

    @Override
    public int markAllAsRead(Long userId) {
        LambdaUpdateWrapper<CrmReminder> uw = new LambdaUpdateWrapper<>();
        uw.eq(CrmReminder::getRecipientId, userId)
          .eq(CrmReminder::getStatus, 0)
          .set(CrmReminder::getStatus, 1)
          .set(CrmReminder::getReadTime, LocalDateTime.now());
        return reminderMapper.update(null, uw);
    }

    @Override
    public long getUnreadCount(Long userId) {
        LambdaQueryWrapper<CrmReminder> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CrmReminder::getRecipientId, userId)
               .eq(CrmReminder::getStatus, 0);
        return reminderMapper.selectCount(wrapper);
    }
}

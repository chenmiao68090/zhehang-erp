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
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SysNotificationServiceImpl extends ServiceImpl<SysNotificationMapper, SysNotification>
        implements ISysNotificationService {

    private final SysNotificationMapper notificationMapper;

    @Override
    public IPage<NotificationVO> listNotification(Long userId, String type, Integer isRead, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<SysNotification> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SysNotification::getUserId, userId);
        if (type != null && !type.isEmpty()) {
            wrapper.eq(SysNotification::getType, type);
        }
        if (isRead != null) {
            wrapper.eq(SysNotification::getIsRead, isRead);
        }
        wrapper.orderByDesc(SysNotification::getCreateTime);

        Page<SysNotification> page = new Page<>(pageNum, pageSize);
        IPage<SysNotification> result = notificationMapper.selectPage(page, wrapper);

        return result.convert(entity -> {
            NotificationVO vo = new NotificationVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setIsRead(entity.getIsRead() != null && entity.getIsRead() == 1);
            return vo;
        });
    }

    @Override
    public void markAsRead(Long id, Long userId) {
        SysNotification notification = notificationMapper.selectById(id);
        if (notification != null && notification.getUserId().equals(userId)) {
            notification.setIsRead(1);
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
}

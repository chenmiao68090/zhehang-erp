package com.zhehang.erp.modules.system.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.zhehang.erp.modules.system.domain.entity.SysNotification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

@Mapper
public interface SysNotificationMapper extends BaseMapper<SysNotification> {

    @Update("UPDATE sys_notification SET is_read = 1, read_time = NOW() WHERE receiver_id = #{userId} AND is_read = 0 AND deleted = 0")
    int markAllRead(@Param("userId") Long userId);
}

package com.zhehang.erp.modules.system.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;

public interface ISysLogService {
    IPage<SysLoginLog> selectLoginLogPage(int pageNum, int pageSize, String username, String ipAddr, Integer status, String beginTime, String endTime);
    IPage<SysOperLog> selectOperLogPage(int pageNum, int pageSize, String module, String operType, String operator, String beginTime, String endTime);
    SysOperLog getOperLogById(Long id);
    void saveOperLog(SysOperLog operLog);
    void saveLoginLog(SysLoginLog loginLog);
    void cleanLoginLog();
    void cleanOperLog();
}

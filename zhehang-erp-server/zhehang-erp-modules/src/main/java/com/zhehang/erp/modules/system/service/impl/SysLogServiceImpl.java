package com.zhehang.erp.modules.system.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.mapper.SysLoginLogMapper;
import com.zhehang.erp.modules.system.mapper.SysOperLogMapper;
import com.zhehang.erp.modules.system.service.ISysLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class SysLogServiceImpl implements ISysLogService {

    private final SysLoginLogMapper loginLogMapper;
    private final SysOperLogMapper operLogMapper;

    @Override
    public IPage<SysLoginLog> selectLoginLogPage(int pageNum, int pageSize, String username, String ipAddr, Integer status, String beginTime, String endTime) {
        Page<SysLoginLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysLoginLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(username), SysLoginLog::getUsername, username)
               .like(StringUtils.hasText(ipAddr), SysLoginLog::getIpAddr, ipAddr)
               .eq(status != null, SysLoginLog::getStatus, status);
        if (StringUtils.hasText(beginTime)) {
            wrapper.ge(SysLoginLog::getLoginTime, LocalDateTime.of(LocalDate.parse(beginTime), LocalTime.MIN));
        }
        if (StringUtils.hasText(endTime)) {
            wrapper.le(SysLoginLog::getLoginTime, LocalDateTime.of(LocalDate.parse(endTime), LocalTime.MAX));
        }
        wrapper.orderByDesc(SysLoginLog::getLoginTime);
        return loginLogMapper.selectPage(page, wrapper);
    }

    @Override
    public IPage<SysOperLog> selectOperLogPage(int pageNum, int pageSize, String module, String operType, String operator, String beginTime, String endTime) {
        Page<SysOperLog> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<SysOperLog> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.hasText(module), SysOperLog::getModule, module)
               .eq(StringUtils.hasText(operType), SysOperLog::getOperType, operType)
               .like(StringUtils.hasText(operator), SysOperLog::getOperator, operator);
        if (StringUtils.hasText(beginTime)) {
            wrapper.ge(SysOperLog::getOperTime, LocalDateTime.of(LocalDate.parse(beginTime), LocalTime.MIN));
        }
        if (StringUtils.hasText(endTime)) {
            wrapper.le(SysOperLog::getOperTime, LocalDateTime.of(LocalDate.parse(endTime), LocalTime.MAX));
        }
        wrapper.orderByDesc(SysOperLog::getOperTime);
        return operLogMapper.selectPage(page, wrapper);
    }

    @Override
    public SysOperLog getOperLogById(Long id) {
        return operLogMapper.selectById(id);
    }

    @Override
    public void saveOperLog(SysOperLog operLog) {
        operLogMapper.insert(operLog);
    }

    @Override
    public void saveLoginLog(SysLoginLog loginLog) {
        loginLogMapper.insert(loginLog);
    }

    @Override
    public void cleanLoginLog() {
        loginLogMapper.delete(new LambdaQueryWrapper<>());
    }

    @Override
    public void cleanOperLog() {
        operLogMapper.delete(new LambdaQueryWrapper<>());
    }
}

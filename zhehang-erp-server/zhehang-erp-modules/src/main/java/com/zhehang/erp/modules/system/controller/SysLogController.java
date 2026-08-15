package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.service.ISysLogService;
import com.zhehang.erp.modules.system.util.CsvExportUtils;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

/**
 * 平台全局审计日志。
 *
 * <p>{@code sys_login_log} 无租户字段，且历史操作日志未稳定写入租户，
 * 不具备可靠的按租户查询条件。因此这里采取失败收紧：仅唯一平台管理账号
 * （userId=1）可查询、导出或清空全局日志，租户老板也不能访问跨租户审计数据。</p>
 */
@RestController
@RequestMapping("/system/log")
@RequiredArgsConstructor
@PreAuthorize("T(java.lang.Long).valueOf('1').equals(T(com.zhehang.erp.common.core.utils.SecurityUtils).getCurrentUserId())")
public class SysLogController {

    private final ISysLogService logService;

    @GetMapping("/login/list")
    public R<IPage<SysLoginLog>> loginLogList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String ipAddr,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime) {
        return R.ok(logService.selectLoginLogPage(pageNum, pageSize, username, ipAddr, status, beginTime, endTime));
    }

    @DeleteMapping("/login/clean")
    public R<Void> cleanLoginLog() {
        logService.cleanLoginLog();
        return R.ok();
    }

    @GetMapping("/login/export")
    public void exportLoginLog(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String ipAddr,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime,
            HttpServletResponse response) throws IOException {
        List<SysLoginLog> logs = logService.selectLoginLogPage(1, 10000, username, ipAddr, status, beginTime, endTime).getRecords();
        CsvExportUtils.write(response, "login-logs.csv",
                List.of("日志ID", "用户名", "IP地址", "登录地点", "浏览器", "操作系统", "状态", "消息", "登录时间"),
                logs,
                List.of(
                        SysLoginLog::getId,
                        SysLoginLog::getUsername,
                        SysLoginLog::getIpAddr,
                        SysLoginLog::getLoginLocation,
                        SysLoginLog::getBrowser,
                        SysLoginLog::getOs,
                        log -> log.getStatus() != null && log.getStatus() == 0 ? "成功" : "失败",
                        SysLoginLog::getMsg,
                        SysLoginLog::getLoginTime
                ));
    }

    @GetMapping("/oper/list")
    public R<IPage<SysOperLog>> operLogList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operType,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime) {
        return R.ok(logService.selectOperLogPage(pageNum, pageSize, module, operType, operator, beginTime, endTime));
    }

    @GetMapping("/oper/{id}")
    public R<SysOperLog> operLogDetail(@PathVariable Long id) {
        return R.ok(logService.getOperLogById(id));
    }

    @DeleteMapping("/oper/clean")
    public R<Void> cleanOperLog() {
        logService.cleanOperLog();
        return R.ok();
    }

    @GetMapping("/oper/export")
    public void exportOperLog(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operType,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime,
            HttpServletResponse response) throws IOException {
        List<SysOperLog> logs = logService.selectOperLogPage(1, 10000, module, operType, operator, beginTime, endTime).getRecords();
        CsvExportUtils.write(response, "operation-logs.csv",
                List.of("日志ID", "模块", "操作类型", "操作人", "请求地址", "请求方式", "状态", "耗时(ms)", "IP地址", "操作时间", "错误信息"),
                logs,
                List.of(
                        SysOperLog::getId,
                        SysOperLog::getModule,
                        SysOperLog::getOperType,
                        SysOperLog::getOperator,
                        SysOperLog::getRequestUri,
                        SysOperLog::getRequestMethod,
                        log -> log.getStatus() != null && log.getStatus() == 0 ? "成功" : "失败",
                        SysOperLog::getCostTime,
                        SysOperLog::getIpAddr,
                        SysOperLog::getOperTime,
                        SysOperLog::getErrorMsg
                ));
    }
}

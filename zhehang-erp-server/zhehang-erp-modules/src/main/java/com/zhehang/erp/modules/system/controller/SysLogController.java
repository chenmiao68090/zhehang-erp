package com.zhehang.erp.modules.system.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.system.domain.entity.SysLoginLog;
import com.zhehang.erp.modules.system.domain.entity.SysOperLog;
import com.zhehang.erp.modules.system.service.ISysLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/system/log")
@RequiredArgsConstructor
public class SysLogController {

    private final ISysLogService logService;

    @GetMapping("/login/list")
    @PreAuthorize("@perm.hasPermission('system:log:list')")
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
    @PreAuthorize("@perm.hasPermission('system:log:remove')")
    public R<Void> cleanLoginLog() {
        logService.cleanLoginLog();
        return R.ok();
    }

    @GetMapping("/login/export")
    @PreAuthorize("@perm.hasPermission('system:log:export')")
    public R<?> exportLoginLog(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String ipAddr,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime) {
        // TODO: Implement Excel export using POI or EasyExcel
        return R.ok(logService.selectLoginLogPage(1, 10000, username, ipAddr, status, beginTime, endTime));
    }

    @GetMapping("/oper/list")
    @PreAuthorize("@perm.hasPermission('system:log:list')")
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
    @PreAuthorize("@perm.hasPermission('system:log:list')")
    public R<SysOperLog> operLogDetail(@PathVariable Long id) {
        return R.ok(logService.getOperLogById(id));
    }

    @DeleteMapping("/oper/clean")
    @PreAuthorize("@perm.hasPermission('system:log:remove')")
    public R<Void> cleanOperLog() {
        logService.cleanOperLog();
        return R.ok();
    }

    @GetMapping("/oper/export")
    @PreAuthorize("@perm.hasPermission('system:log:export')")
    public R<?> exportOperLog(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String operType,
            @RequestParam(required = false) String operator,
            @RequestParam(required = false) String beginTime,
            @RequestParam(required = false) String endTime) {
        // TODO: Implement Excel export
        return R.ok(logService.selectOperLogPage(1, 10000, module, operType, operator, beginTime, endTime));
    }
}

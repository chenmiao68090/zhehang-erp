package com.zhehang.erp.modules.dashboard.boss.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.dashboard.boss.service.BossConsoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 老板总控台:一个接口返回今日全部关键统计 + 异常清单 + 员工执行排行。
 * 权限:仅老板/超级管理员(SecurityUtils.isCurrentAdmin 已含 boss/super_admin/sys_admin/admin)。
 */
@RestController
@RequestMapping("/dashboard/boss")
@RequiredArgsConstructor
public class BossConsoleController {

    private final BossConsoleService bossConsoleService;

    @GetMapping("/overview")
    public R<Map<String, Object>> overview() {
        // 只有老板权限才能看:非管理员/老板一律拒绝
        if (!SecurityUtils.isCurrentAdmin() && !SecurityUtils.hasAnyRole("boss", "super_admin")) {
            return R.fail(403, "无访问权限");
        }
        return R.ok(bossConsoleService.overview());
    }
}

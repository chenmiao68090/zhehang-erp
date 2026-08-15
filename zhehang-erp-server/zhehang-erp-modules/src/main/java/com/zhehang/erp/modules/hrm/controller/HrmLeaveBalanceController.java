package com.zhehang.erp.modules.hrm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeaveBalance;
import com.zhehang.erp.modules.hrm.service.IHrmLeaveBalanceService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 假期额度管理(假勤管理 → 假期余额)。设额度限HR/管理员/老板,员工不能自设。
 */
@RestController
@RequestMapping("/hrm/leave-balance")
@RequiredArgsConstructor
public class HrmLeaveBalanceController {

    private final IHrmLeaveBalanceService balanceService;
    private final DataScopeHelper dataScopeHelper;

    /** 全部额度(前端按 employeeId 映射员工名展示) */
    @GetMapping("/list")
    public R<List<HrmLeaveBalance>> list() {
        return R.ok(balanceService.listAll());
    }

    /** 某员工的额度 */
    @GetMapping("/by-employee/{employeeId}")
    public R<List<HrmLeaveBalance>> byEmployee(@PathVariable Long employeeId) {
        return R.ok(balanceService.listByEmployee(employeeId));
    }

    /** 当前登录人的额度(请假表单显示剩余用) */
    @GetMapping("/my")
    public R<List<HrmLeaveBalance>> my() {
        return R.ok(balanceService.listByCurrentUser());
    }

    /** 新增/修改额度(按 员工+假期类型 upsert) */
    @PostMapping
    @Log(module = "假期额度", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody HrmLeaveBalance dto) {
        if (!dataScopeHelper.isHrAdminOrBoss()) return R.fail("无权设置假期额度,仅HR/管理员/老板可操作");
        balanceService.saveBalance(dto);
        return R.ok();
    }

    /** 删除额度 */
    @DeleteMapping("/{id}")
    @Log(module = "假期额度", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!dataScopeHelper.isHrAdminOrBoss()) return R.fail("无权删除假期额度,仅HR/管理员/老板可操作");
        balanceService.removeById(id);
        return R.ok();
    }
}

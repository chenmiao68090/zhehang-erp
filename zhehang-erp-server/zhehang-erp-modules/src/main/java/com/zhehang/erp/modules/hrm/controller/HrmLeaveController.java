package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeave;
import com.zhehang.erp.modules.hrm.service.IHrmLeaveService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/leave")
@RequiredArgsConstructor
public class HrmLeaveController {

    private final IHrmLeaveService leaveService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<HrmLeave>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) Integer leaveType,
            @RequestParam(required = false) Integer status) {
        return R.ok(leaveService.selectPage(pageNum, pageSize, employeeId, leaveType, status));
    }

    @PostMapping
    @Log(module = "请假管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmLeave leave) {
        leave.setStatus(0);
        // 员工只能给自己建请假;HR/管理员/老板可代员工建假,保留传入员工
        if (!dataScopeHelper.isHrAdminOrBoss()) {
            Long myEmp = dataScopeHelper.currentEmployeeId();
            if (myEmp != null) {
                leave.setEmployeeId(myEmp);
            }
        }
        leaveService.save(leave);
        return R.ok();
    }

    // 原 PUT /approve 孤儿口已下线(2026-07-12 审批收编):前端零调用方;
    // 请假审批一律走审批中心 leave 流程,通过后由 HrmLeaveApprovalHandler 回调置 hrm_leave.status,
    // 考勤统计(只认 status=1)与年假余额从此真实联动。
}
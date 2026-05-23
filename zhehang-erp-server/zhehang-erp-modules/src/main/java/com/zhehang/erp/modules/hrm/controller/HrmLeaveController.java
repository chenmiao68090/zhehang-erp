package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmLeave;
import com.zhehang.erp.modules.hrm.service.IHrmLeaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/leave")
@RequiredArgsConstructor
public class HrmLeaveController {

    private final IHrmLeaveService leaveService;

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
        leaveService.save(leave);
        return R.ok();
    }

    @PutMapping("/approve")
    @Log(module = "请假管理", type = Log.OperationType.UPDATE)
    public R<Void> approve(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Long approverId = Long.valueOf(params.get("approverId").toString());
        boolean approved = Boolean.parseBoolean(params.get("approved").toString());
        leaveService.approve(id, approverId, approved);
        return R.ok();
    }
}
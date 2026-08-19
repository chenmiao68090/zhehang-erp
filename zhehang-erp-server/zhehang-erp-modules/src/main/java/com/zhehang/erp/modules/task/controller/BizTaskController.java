package com.zhehang.erp.modules.task.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.dto.HandoverCreateDTO;
import com.zhehang.erp.modules.task.domain.dto.HandoverItemUpdateDTO;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 客户交接流程接口。
 * V238 退役旧任务中心（/task/list、/task/{id}、指派/开始/完成/验收、进度汇报等零流量端点已删除，
 * 新业务走 {@link com.zhehang.erp.modules.feigetask.controller.FeigeTaskController}），
 * 本控制器只保留仍在使用的 /task/handover/** 交接链路。
 */
@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class BizTaskController {

    private final IBizTaskService taskService;

    @GetMapping("/handover/list")
    public R<IPage<BizTaskHandover>> handoverList(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {
        return R.ok(taskService.handoverList(pageNum, pageSize, customerId, status, keyword));
    }

    @GetMapping("/handover/stats")
    public R<Map<String, Object>> handoverStats() {
        return R.ok(taskService.handoverStats());
    }

    @GetMapping("/handover/{id}")
    public R<BizTaskHandover> handoverDetail(@PathVariable Long id) {
        return R.ok(taskService.handoverDetail(id));
    }

    @PostMapping("/handover")
    @Log(module = "客户交接", type = Log.OperationType.INSERT)
    public R<Long> createHandover(@Valid @RequestBody HandoverCreateDTO dto) {
        return R.ok(taskService.createHandover(dto));
    }

    @PostMapping("/handover/{id}/accept")
    @Log(module = "客户交接", type = Log.OperationType.UPDATE)
    public R<Void> acceptHandover(@PathVariable Long id) {
        taskService.acceptHandover(id);
        return R.ok();
    }

    @PutMapping("/handover/{id}/item")
    @Log(module = "客户交接", type = Log.OperationType.UPDATE)
    public R<Void> updateHandoverItem(@PathVariable Long id, @Valid @RequestBody HandoverItemUpdateDTO dto) {
        taskService.updateHandoverItem(id, dto);
        return R.ok();
    }

    @PostMapping("/handover/{id}/complete")
    @Log(module = "客户交接", type = Log.OperationType.UPDATE)
    public R<Void> completeHandover(@PathVariable Long id) {
        taskService.completeHandover(id);
        return R.ok();
    }
}

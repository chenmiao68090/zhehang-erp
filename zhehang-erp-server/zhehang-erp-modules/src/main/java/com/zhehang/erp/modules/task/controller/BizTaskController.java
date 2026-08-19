package com.zhehang.erp.modules.task.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.task.domain.BizTask;
import com.zhehang.erp.modules.task.domain.BizTaskHandover;
import com.zhehang.erp.modules.task.domain.BizTaskProgressReport;
import com.zhehang.erp.modules.task.domain.dto.HandoverCreateDTO;
import com.zhehang.erp.modules.task.domain.dto.HandoverItemUpdateDTO;
import com.zhehang.erp.modules.task.service.IBizTaskProgressReportService;
import com.zhehang.erp.modules.task.service.IBizTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * @deprecated 已迁移至飞哥任务工作台（FeigeTaskController），本控制器仅保留历史数据只读访问。
 * 新业务请使用 {@link com.zhehang.erp.modules.feigetask.controller.FeigeTaskController}
 */
@Deprecated(since = "V237", forRemoval = false)
@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
public class BizTaskController {

    private final IBizTaskService taskService;
    private final IBizTaskProgressReportService progressReportService;

    @GetMapping("/list")
    public R<IPage<BizTask>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long executorId) {
        return R.ok(taskService.selectPage(pageNum, pageSize, type, status, executorId));
    }

    @GetMapping("/{id}")
    public R<BizTask> detail(@PathVariable Long id) {
        return R.ok(taskService.getById(id));
    }

    @PostMapping
    @Log(module = "任务中心", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizTask task) {
        return R.ok(taskService.createTask(task));
    }

    @PutMapping("/{id}/assign")
    @Log(module = "任务中心", type = Log.OperationType.UPDATE)
    public R<Void> assign(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Long executorId = body.get("executorId") != null
                ? Long.valueOf(body.get("executorId").toString()) : null;
        String executorName = body.get("executorName") != null
                ? body.get("executorName").toString() : null;
        taskService.assign(id, executorId, executorName);
        return R.ok();
    }

    @PutMapping("/{id}/start")
    @Log(module = "任务中心", type = Log.OperationType.UPDATE)
    public R<Void> start(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        taskService.start(id, operatorId);
        return R.ok();
    }

    @PutMapping("/{id}/complete")
    @Log(module = "任务中心", type = Log.OperationType.UPDATE)
    public R<Void> complete(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String result = body != null && body.get("result") != null ? body.get("result").toString() : null;
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        taskService.complete(id, result, operatorId);
        return R.ok();
    }

    @PutMapping("/{id}/review")
    @Log(module = "任务中心", type = Log.OperationType.UPDATE)
    public R<Void> review(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        boolean pass = body.get("pass") != null && Boolean.parseBoolean(body.get("pass").toString());
        String comment = body.get("comment") != null ? body.get("comment").toString() : null;
        Long reviewerId = body.get("reviewerId") != null
                ? Long.valueOf(body.get("reviewerId").toString()) : null;
        taskService.review(id, pass, comment, reviewerId);
        return R.ok();
    }

    @GetMapping("/my-tasks")
    public R<IPage<BizTask>> myTasks(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam Long userId) {
        return R.ok(taskService.myTasks(pageNum, pageSize, userId));
    }

    @GetMapping("/overdue")
    public R<List<BizTask>> overdue() {
        return R.ok(taskService.overdueTasks());
    }

    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(taskService.stats());
    }

    @GetMapping("/{id}/reports")
    public R<List<BizTaskProgressReport>> reports(@PathVariable Long id) {
        return R.ok(progressReportService.listByTaskId(id));
    }

    @PostMapping("/{id}/reports")
    @Log(module = "任务进度汇报", type = Log.OperationType.INSERT)
    public R<BizTaskProgressReport> addReport(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        String content = body != null && body.get("content") != null ? body.get("content").toString() : null;
        return R.ok(progressReportService.addReport(id, content));
    }

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

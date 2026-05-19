package com.zhehang.erp.modules.project.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmTask;
import com.zhehang.erp.modules.project.service.IPmTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/project/task")
@RequiredArgsConstructor
public class TaskController {

    private final IPmTaskService taskService;

    @GetMapping("/tree")
    public R<List<PmTask>> tree(@RequestParam Long projectId) {
        return R.ok(taskService.getTaskTree(projectId));
    }

    @GetMapping("/gantt")
    public R<List<PmTask>> gantt(@RequestParam Long projectId) {
        return R.ok(taskService.getGanttData(projectId));
    }

    @GetMapping("/board")
    public R<Map<String, List<PmTask>>> board(@RequestParam Long projectId) {
        return R.ok(taskService.getBoardData(projectId));
    }

    @GetMapping("/{id}")
    public R<PmTask> getInfo(@PathVariable Long id) {
        return R.ok(taskService.getById(id));
    }

    @PostMapping
    @Log(module = "椤圭洰浠诲姟", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmTask task) {
        taskService.save(task);
        return R.ok();
    }

    @PutMapping
    @Log(module = "椤圭洰浠诲姟", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody PmTask task) {
        taskService.updateById(task);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "椤圭洰浠诲姟", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        taskService.removeById(id);
        return R.ok();
    }

    @PutMapping("/status")
    @Log(module = "椤圭洰浠诲姟", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        taskService.changeStatus(id, status);
        return R.ok();
    }
}

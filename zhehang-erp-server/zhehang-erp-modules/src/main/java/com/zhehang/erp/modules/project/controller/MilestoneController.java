package com.zhehang.erp.modules.project.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmMilestone;
import com.zhehang.erp.modules.project.service.IPmMilestoneService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project/milestone")
@RequiredArgsConstructor
public class MilestoneController {

    private final IPmMilestoneService milestoneService;

    @GetMapping("/list")
    public R<List<PmMilestone>> list(@RequestParam Long projectId) {
        return R.ok(milestoneService.listByProject(projectId));
    }

    @PostMapping
    @Log(module = "项目里程碑", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmMilestone milestone) {
        milestoneService.save(milestone);
        return R.ok();
    }

    @PutMapping
    @Log(module = "项目里程碑", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody PmMilestone milestone) {
        milestoneService.updateById(milestone);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "项目里程碑", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        milestoneService.removeById(id);
        return R.ok();
    }
}

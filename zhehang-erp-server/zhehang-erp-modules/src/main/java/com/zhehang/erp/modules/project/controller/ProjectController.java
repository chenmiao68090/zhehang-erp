package com.zhehang.erp.modules.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.project.domain.entity.PmProject;
import com.zhehang.erp.modules.project.service.IPmProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final IPmProjectService projectService;

    @GetMapping("/list")
    public R<IPage<PmProject>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer type,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) Long managerId) {
        return R.ok(projectService.selectPage(pageNum, pageSize, name, type, status, managerId));
    }

    @GetMapping("/{id}")
    public R<PmProject> getInfo(@PathVariable Long id) {
        return R.ok(projectService.getById(id));
    }

    @PostMapping
    @Log(module = "项目管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmProject project) {
        projectService.save(project);
        return R.ok();
    }

    @PutMapping
    @Log(module = "项目管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody PmProject project) {
        projectService.updateById(project);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "项目管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        projectService.removeById(id);
        return R.ok();
    }

    @GetMapping("/templates")
    public R<Object> templates() {
        // 返回预置模板列表
        return R.ok(java.util.Arrays.asList(
            Map.of("id", 1, "name", "软件开发项目", "description", "标准软件开发流程模板"),
            Map.of("id", 2, "name", "市场活动项目", "description", "市场营销活动项目模板"),
            Map.of("id", 3, "name", "产品研发项目", "description", "产品研发迭代模板")
        ));
    }
}

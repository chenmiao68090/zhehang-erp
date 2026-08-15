package com.zhehang.erp.modules.project.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.project.domain.entity.PmProject;
import com.zhehang.erp.modules.project.service.IPmProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/project")
@RequiredArgsConstructor
public class ProjectController {

    private final IPmProjectService projectService;
    private final DataScopeHelper dataScopeHelper;

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
        PmProject project = projectService.getById(id);
        if (project != null && !dataScopeHelper.canAccess(project.getCreateBy(), null)) {
            return R.fail("无权查看他人记录");
        }
        return R.ok(project);
    }

    @PostMapping
    @Log(module = "项目管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody PmProject project) {
        validateProject(project);
        projectService.save(project);
        return R.ok();
    }

    @PutMapping
    @Log(module = "项目管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody PmProject project) {
        PmProject existing = projectService.getById(project.getId());
        if (existing == null) {
            return R.fail("记录不存在");
        }
        if (!dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权修改他人记录");
        }
        validateProject(project);
        projectService.updateById(project);
        return R.ok();
    }

    private void validateProject(PmProject project) {
        if (project.getStartDate() != null && project.getEndDate() != null
                && project.getEndDate().isBefore(project.getStartDate())) {
            throw new BusinessException("结束日期不能早于开始日期");
        }
        if (project.getBudget() != null && project.getBudget().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("项目预算必须大于0");
        }
        if (project.getProgress() != null && (project.getProgress() < 0 || project.getProgress() > 100)) {
            throw new BusinessException("项目进度必须在0-100之间");
        }
    }

    @DeleteMapping("/{id}")
    @Log(module = "项目管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        PmProject project = projectService.getById(id);
        if (project != null && !dataScopeHelper.canAccess(project.getCreateBy(), null)) {
            return R.fail("无权删除他人记录");
        }
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

package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmResume;
import com.zhehang.erp.modules.hrm.service.IHrmResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/resume")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "员工简历包含个人敏感信息")
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('hrm')")
public class HrmResumeController {

    private final IHrmResumeService resumeService;

    @GetMapping("/list")
    public R<IPage<HrmResume>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long recruitId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String interviewDateStart,
            @RequestParam(required = false) String interviewDateEnd) {
        return R.ok(resumeService.selectPage(pageNum, pageSize, recruitId, keyword, status, tags,
                interviewDateStart, interviewDateEnd));
    }

    @PostMapping
    @Log(module = "简历管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmResume resume) {
        if (resume.getStatus() == null) {
            resume.setStatus(0);
        }
        resumeService.save(resume);
        return R.ok();
    }

    @PutMapping
    @Log(module = "简历管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmResume resume) {
        resumeService.updateById(resume);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "简历管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        resumeService.removeById(id);
        return R.ok();
    }

    @PutMapping("/status")
    @Log(module = "简历管理", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestBody Map<String, Object> params) {
        if (params.get("id") == null) {
            return R.fail("缺少简历ID");
        }
        if (params.get("status") == null) {
            return R.fail("缺少状态");
        }
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        String evaluation = params.get("evaluation") != null ? params.get("evaluation").toString() : null;
        resumeService.changeStatus(id, status, evaluation);
        return R.ok();
    }
}

package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
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
public class HrmResumeController {

    private final IHrmResumeService resumeService;

    @GetMapping("/list")
    public R<IPage<HrmResume>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long recruitId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer status) {
        return R.ok(resumeService.selectPage(pageNum, pageSize, recruitId, name, status));
    }

    @PostMapping
    @Log(module = "简历管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmResume resume) {
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
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        String evaluation = params.get("evaluation") != null ? params.get("evaluation").toString() : null;
        resumeService.changeStatus(id, status, evaluation);
        return R.ok();
    }
}
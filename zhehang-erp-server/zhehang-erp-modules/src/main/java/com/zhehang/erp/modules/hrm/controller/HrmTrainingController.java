package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmTraining;
import com.zhehang.erp.modules.hrm.service.IHrmTrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/training")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('hrm')")
public class HrmTrainingController {

    private final IHrmTrainingService trainingService;

    @GetMapping("/list")
    public R<IPage<HrmTraining>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Integer status) {
        return R.ok(trainingService.selectPage(pageNum, pageSize, title, status));
    }

    @PostMapping
    @Log(module = "培训管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmTraining training) {
        trainingService.save(training);
        return R.ok();
    }

    @PutMapping
    @Log(module = "培训管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmTraining training) {
        trainingService.updateById(training);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "培训管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        trainingService.removeById(id);
        return R.ok();
    }

    @PostMapping("/enroll")
    @Log(module = "培训管理", type = Log.OperationType.UPDATE)
    public R<Void> enroll(@RequestBody Map<String, Long> params) {
        trainingService.enroll(params.get("trainingId"), params.get("employeeId"));
        return R.ok();
    }
}
package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalary;
import com.zhehang.erp.modules.hrm.service.IHrmSalaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/salary")
@RequiredArgsConstructor
public class HrmSalaryController {

    private final IHrmSalaryService salaryService;

    @GetMapping("/list")
    public R<IPage<HrmSalary>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long employeeId,
            @RequestParam(required = false) String salaryMonth,
            @RequestParam(required = false) Integer status) {
        return R.ok(salaryService.selectPage(pageNum, pageSize, employeeId, salaryMonth, status));
    }

    @PostMapping("/calculate")
    @Log(module = "薪资管理", type = Log.OperationType.UPDATE)
    public R<Void> calculate(@RequestBody Map<String, String> params) {
        salaryService.calculate(params.get("salaryMonth"));
        return R.ok();
    }

    @PostMapping("/pay")
    @Log(module = "薪资管理", type = Log.OperationType.UPDATE)
    public R<Void> pay(@RequestBody Map<String, String> params) {
        salaryService.pay(params.get("salaryMonth"));
        return R.ok();
    }

    @GetMapping("/slip/{id}")
    public R<Map<String, Object>> paySlip(@PathVariable Long id) {
        return R.ok(salaryService.paySlip(id));
    }

    @PostMapping
    @Log(module = "薪资管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmSalary salary) {
        salary.setStatus(0);
        salaryService.save(salary);
        return R.ok();
    }

    @PutMapping
    @Log(module = "薪资管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmSalary salary) {
        salaryService.updateById(salary);
        return R.ok();
    }
}
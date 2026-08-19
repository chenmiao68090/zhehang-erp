package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalary;
import com.zhehang.erp.modules.hrm.service.IHrmSalaryService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/hrm/salary")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "工资及工资条")
public class HrmSalaryController {

    private final IHrmSalaryService salaryService;
    private final DataScopeHelper dataScopeHelper;

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
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可核算薪资");
        String salaryMonth = params.get("salaryMonth");
        if (salaryMonth == null || salaryMonth.isEmpty()) return R.fail("缺少薪资月份");
        salaryService.calculate(salaryMonth);
        return R.ok();
    }

    @PostMapping("/pay")
    @Log(module = "薪资管理", type = Log.OperationType.UPDATE)
    public R<Void> pay(@RequestBody Map<String, String> params) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可发放薪资");
        String salaryMonth = params.get("salaryMonth");
        if (salaryMonth == null || salaryMonth.isEmpty()) return R.fail("缺少薪资月份");
        salaryService.pay(salaryMonth);
        return R.ok();
    }

    /** 工资条:HR/管理员/老板可看任意人;其他人仅可看本人,防越权看他人工资条。 */
    @GetMapping("/slip/{id}")
    public R<Map<String, Object>> paySlip(@PathVariable Long id) {
        Map<String, Object> slip = salaryService.paySlip(id);
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) {
            HrmSalary s = (HrmSalary) slip.get("salary");
            Long myEmp = dataScopeHelper.currentEmployeeId();
            if (s == null || myEmp == null || !myEmp.equals(s.getEmployeeId())) {
                return R.fail("无权查看他人工资条");
            }
        }
        return R.ok(slip);
    }

    @PostMapping
    @Log(module = "薪资管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody HrmSalary salary) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可录入薪资");
        salary.setStatus(0);
        salaryService.save(salary);
        return R.ok();
    }

    @PutMapping
    @Log(module = "薪资管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody HrmSalary salary) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可修改薪资");
        salaryService.updateById(salary);
        return R.ok();
    }
}

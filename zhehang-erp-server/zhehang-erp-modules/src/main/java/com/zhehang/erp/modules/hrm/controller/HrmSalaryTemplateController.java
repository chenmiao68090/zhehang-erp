package com.zhehang.erp.modules.hrm.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.hrm.domain.entity.HrmSalaryTemplate;
import com.zhehang.erp.modules.hrm.mapper.HrmSalaryTemplateMapper;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * HR·岗位薪酬模板。薪酬结构属HR敏感配置,仅HR/管理员/老板可读写。
 */
@RestController
@RequestMapping("/hrm/salary-template")
@RequiredArgsConstructor
@DenyDuringImpersonation(reason = "薪酬敏感配置")
public class HrmSalaryTemplateController {

    private final HrmSalaryTemplateMapper templateMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<List<HrmSalaryTemplate>> list() {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可查看薪酬模板");
        return R.ok(templateMapper.selectList(new LambdaQueryWrapper<HrmSalaryTemplate>()
                .orderByDesc(HrmSalaryTemplate::getId)));
    }

    @PostMapping
    @Log(module = "薪酬模板", type = Log.OperationType.UPDATE)
    public R<Void> save(@RequestBody HrmSalaryTemplate t) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可编辑薪酬模板");
        if (t.getPostName() == null || t.getPostName().isBlank()) {
            return R.fail("请填写岗位名");
        }
        if ((t.getBaseSalary() != null && t.getBaseSalary().compareTo(BigDecimal.ZERO) < 0)
                || (t.getPerformanceBase() != null && t.getPerformanceBase().compareTo(BigDecimal.ZERO) < 0)
                || (t.getAllowance() != null && t.getAllowance().compareTo(BigDecimal.ZERO) < 0)
                || (t.getBonus() != null && t.getBonus().compareTo(BigDecimal.ZERO) < 0)) {
            throw new BusinessException("金额不能为负数");
        }
        if (t.getId() == null) {
            templateMapper.insert(t);
        } else {
            templateMapper.updateById(t);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "薪酬模板", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        if (!dataScopeHelper.hasPerm("hr:salary:manage")) return R.fail("无权限,仅HR/管理员/老板可删除薪酬模板");
        templateMapper.deleteById(id);
        return R.ok();
    }
}

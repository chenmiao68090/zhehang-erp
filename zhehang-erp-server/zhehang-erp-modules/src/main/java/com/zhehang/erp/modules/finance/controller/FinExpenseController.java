package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;
import com.zhehang.erp.modules.finance.mapper.FinExpenseMapper;
import com.zhehang.erp.modules.finance.service.IFinExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 业务支出 Controller。实际路径 = /api + /finance/expense/... */
@RestController
@RequestMapping("/finance/expense")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinExpenseController {

    private final IFinExpenseService expenseService;
    private final FinExpenseMapper expenseMapper;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<FinExpense>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status) {
        return R.ok(expenseService.expenseList(pageNum, pageSize, keyword, category, status));
    }

    @GetMapping("/{id}")
    public R<FinExpense> detail(@PathVariable Long id) {
        return R.ok(expenseMapper.selectById(id));
    }

    @PostMapping
    @Log(module = "业务支出", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody FinExpense entity) {
        entity.setId(null);
        return R.ok(expenseService.saveExpense(entity));
    }

    @PutMapping
    @Log(module = "业务支出", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody FinExpense entity) {
        return R.ok(expenseService.saveExpense(entity));
    }

    @PutMapping("/{id}/status")
    @Log(module = "业务支出", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam String status) {
        // 状态直改=事实上的审批动作:只放行审批角色(财务负责人/部门主管/管理员),
        // 不能让任何有 finance 模块的人裸改单据状态;操作人由 update_by 自动落库 + @Log 留痕
        if (!dataScopeHelper.isManagerOrAdmin() && !SecurityUtils.hasAnyRole("finance_hq")) {
            return R.fail(403, "无权变更单据状态,仅财务负责人/部门主管/管理员可操作");
        }
        expenseService.changeStatus(id, status);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "业务支出", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        expenseService.removeExpense(id);
        return R.ok();
    }
}

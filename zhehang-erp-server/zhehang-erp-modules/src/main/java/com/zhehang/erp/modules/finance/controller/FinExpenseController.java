package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinExpense;
import com.zhehang.erp.modules.finance.mapper.FinExpenseMapper;
import com.zhehang.erp.modules.finance.service.IFinExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 业务支出 Controller。实际路径 = /api + /finance/expense/... */
@RestController
@RequestMapping("/finance/expense")
@RequiredArgsConstructor
public class FinExpenseController {

    private final IFinExpenseService expenseService;
    private final FinExpenseMapper expenseMapper;

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

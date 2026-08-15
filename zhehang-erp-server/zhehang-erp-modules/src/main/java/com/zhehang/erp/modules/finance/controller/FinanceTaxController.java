package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceTax;
import com.zhehang.erp.modules.finance.service.impl.FinanceTaxServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/finance/tax")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceTaxController {

    private final FinanceTaxServiceImpl taxService;

    @GetMapping("/list")
    public R<IPage<FinanceTax>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) String taxType,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer status) {
        return R.ok(taxService.selectPage(pageNum, pageSize, customerId, taxType, period, status));
    }

    @PostMapping
    @Log(module = "Finance Tax", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody FinanceTax tax) {
        tax.setStatus(0);
        taxService.save(tax);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Finance Tax", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody FinanceTax tax) {
        taxService.updateById(tax);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Finance Tax", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        taxService.removeById(id);
        return R.ok();
    }

    @PutMapping("/declare/{id}")
    @Log(module = "Finance Tax", type = Log.OperationType.UPDATE)
    public R<Void> declare(@PathVariable Long id) {
        taxService.declare(id);
        return R.ok();
    }

    @GetMapping("/summary")
    public R<?> summary(@RequestParam(required = false) String period) {
        return R.ok(taxService.summary(period));
    }
}

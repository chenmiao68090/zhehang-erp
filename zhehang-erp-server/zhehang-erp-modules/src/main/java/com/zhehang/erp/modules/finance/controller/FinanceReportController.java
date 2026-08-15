package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReport;
import com.zhehang.erp.modules.finance.service.impl.FinanceReportServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance/report")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceReportController {

    private final FinanceReportServiceImpl reportService;

    @GetMapping("/list")
    public R<IPage<FinanceReport>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(reportService.selectPage(pageNum, pageSize));
    }

    @GetMapping("/{id}")
    public R<FinanceReport> getInfo(@PathVariable Long id) {
        return R.ok(reportService.getById(id));
    }

    @PostMapping("/generate")
    @Log(module = "Finance Report", type = Log.OperationType.INSERT)
    public R<Void> generate(@RequestBody Map<String, String> params) {
        reportService.generateReport(params.get("reportType"), params.get("period"));
        return R.ok();
    }

    @GetMapping("/balance-sheet")
    public R<List<Map<String, Object>>> balanceSheet(@RequestParam(required = false) String period) {
        return R.ok(reportService.getBalanceSheet(period));
    }

    @GetMapping("/income-statement")
    public R<List<Map<String, Object>>> incomeStatement(@RequestParam(required = false) String period) {
        return R.ok(reportService.getIncomeStatement(period));
    }

    @GetMapping("/cash-flow")
    public R<List<Map<String, Object>>> cashFlow(@RequestParam(required = false) String period) {
        return R.ok(reportService.getCashFlow(period));
    }
}

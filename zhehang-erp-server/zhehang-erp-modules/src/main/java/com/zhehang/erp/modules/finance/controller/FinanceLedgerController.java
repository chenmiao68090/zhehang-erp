package com.zhehang.erp.modules.finance.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.service.impl.FinanceLedgerServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/finance/ledger")
@RequiredArgsConstructor
public class FinanceLedgerController {

    private final FinanceLedgerServiceImpl ledgerService;

    @GetMapping("/general")
    public R<List<FinanceLedger>> general(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryGeneral(subjectCode, startPeriod, endPeriod));
    }

    @GetMapping("/detail")
    public R<List<FinanceLedger>> detail(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryGeneral(subjectCode, startPeriod, endPeriod));
    }

    @GetMapping("/balance")
    public R<List<FinanceLedger>> balance(
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryBalance(startPeriod, endPeriod));
    }

    @GetMapping("/journal")
    public R<List<FinanceLedger>> journal(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryGeneral(subjectCode, startPeriod, endPeriod));
    }
}

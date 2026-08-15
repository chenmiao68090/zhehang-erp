package com.zhehang.erp.modules.finance.controller;

import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.service.impl.FinanceLedgerServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance/ledger")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceLedgerController {

    private final FinanceLedgerServiceImpl ledgerService;

    /** 总账(科目汇总) */
    @GetMapping("/general")
    public R<List<FinanceLedger>> general(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryGeneral(subjectCode, startPeriod, endPeriod));
    }

    /** 明细账(按凭证分录逐笔流水) */
    @GetMapping("/detail")
    public R<List<Map<String, Object>>> detail(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryDetailFlow(subjectCode, startPeriod, endPeriod));
    }

    /** 余额表(科目期初/发生/期末) */
    @GetMapping("/balance")
    public R<List<FinanceLedger>> balance(
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryBalance(startPeriod, endPeriod));
    }

    /** 序时账(按凭证日期逐笔流水) */
    @GetMapping("/journal")
    public R<List<Map<String, Object>>> journal(
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) String startPeriod,
            @RequestParam(required = false) String endPeriod) {
        return R.ok(ledgerService.queryDetailFlow(subjectCode, startPeriod, endPeriod));
    }
}

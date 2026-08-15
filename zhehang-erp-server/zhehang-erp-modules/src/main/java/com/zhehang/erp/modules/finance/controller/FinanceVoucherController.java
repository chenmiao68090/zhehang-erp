package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucher;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucherEntry;
import com.zhehang.erp.modules.finance.service.impl.FinanceVoucherServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance/voucher")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinanceVoucherController {

    private final FinanceVoucherServiceImpl voucherService;

    @GetMapping("/list")
    public R<IPage<FinanceVoucher>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) String voucherType,
            @RequestParam(required = false) String voucherNo) {
        return R.ok(voucherService.selectPage(pageNum, pageSize, period, status, voucherType, voucherNo));
    }

    @GetMapping("/{id}")
    public R<Map<String, Object>> getInfo(@PathVariable Long id) {
        return R.ok(voucherService.getDetail(id));
    }

    @PostMapping
    @Log(module = "Finance Voucher", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody Map<String, Object> params) {
        FinanceVoucher voucher = parseVoucher(params);
        List<FinanceVoucherEntry> entries = parseEntries(params);
        voucherService.createVoucher(voucher, entries);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Finance Voucher", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody Map<String, Object> params) {
        FinanceVoucher voucher = parseVoucher(params);
        List<FinanceVoucherEntry> entries = parseEntries(params);
        voucherService.updateVoucher(voucher, entries);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Finance Voucher", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return R.ok();
    }

    @PutMapping("/audit/{id}")
    @Log(module = "Finance Voucher", type = Log.OperationType.UPDATE)
    public R<Void> audit(@PathVariable Long id) {
        voucherService.audit(id);
        return R.ok();
    }

    @PutMapping("/post/{id}")
    @Log(module = "Finance Voucher", type = Log.OperationType.UPDATE)
    public R<Void> post(@PathVariable Long id) {
        voucherService.postVoucher(id);
        return R.ok();
    }

    @PutMapping("/void/{id}")
    @Log(module = "Finance Voucher", type = Log.OperationType.UPDATE)
    public R<Void> voidVoucher(@PathVariable Long id) {
        voucherService.voidVoucher(id);
        return R.ok();
    }

    @SuppressWarnings("unchecked")
    private FinanceVoucher parseVoucher(Map<String, Object> params) {
        FinanceVoucher v = new FinanceVoucher();
        if (params.get("id") != null) v.setId(Long.valueOf(params.get("id").toString()));
        v.setVoucherNo((String) params.get("voucherNo"));
        if (params.get("voucherDate") != null) v.setVoucherDate(java.time.LocalDate.parse(params.get("voucherDate").toString()));
        v.setVoucherType((String) params.get("voucherType"));
        v.setSummary((String) params.get("summary"));
        return v;
    }

    @SuppressWarnings("unchecked")
    private List<FinanceVoucherEntry> parseEntries(Map<String, Object> params) {
        List<Map<String, Object>> list = (List<Map<String, Object>>) params.get("entries");
        if (list == null) return java.util.Collections.emptyList();
        return list.stream().map(m -> {
            FinanceVoucherEntry e = new FinanceVoucherEntry();
            e.setSubjectCode((String) m.get("subjectCode"));
            e.setSubjectName((String) m.get("subjectName"));
            e.setSummary((String) m.get("summary"));
            e.setDebitAmount(toAmount(m.get("debitAmount")));
            e.setCreditAmount(toAmount(m.get("creditAmount")));
            return e;
        }).collect(java.util.stream.Collectors.toList());
    }

    private java.math.BigDecimal toAmount(Object v) {
        if (v == null) return java.math.BigDecimal.ZERO;
        String s = v.toString().trim();
        return s.isEmpty() ? java.math.BigDecimal.ZERO : new java.math.BigDecimal(s);
    }
}

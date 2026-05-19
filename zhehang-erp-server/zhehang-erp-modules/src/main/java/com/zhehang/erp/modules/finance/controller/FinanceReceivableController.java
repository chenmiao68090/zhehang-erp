package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReceivable;
import com.zhehang.erp.modules.finance.service.impl.FinanceReceivableServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/finance/receivable")
@RequiredArgsConstructor
public class FinanceReceivableController {

    private final FinanceReceivableServiceImpl receivableService;

    @GetMapping("/list")
    public R<IPage<FinanceReceivable>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return R.ok(receivableService.selectPage(pageNum, pageSize, type, customerId, status));
    }

    @PostMapping
    @Log(module = "Finance Receivable", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody FinanceReceivable receivable) {
        receivable.setStatus(0);
        receivable.setReceivedAmount(BigDecimal.ZERO);
        receivable.setRemainingAmount(receivable.getAmount());
        receivableService.save(receivable);
        return R.ok();
    }

    @PutMapping("/receive")
    @Log(module = "Finance Receivable", type = Log.OperationType.UPDATE)
    public R<Void> receive(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        BigDecimal amount = new BigDecimal(params.get("amount").toString());
        receivableService.registerPayment(id, amount);
        return R.ok();
    }

    @GetMapping("/aging")
    public R<List<Map<String, Object>>> aging() {
        return R.ok(receivableService.getAgingAnalysis());
    }

    @GetMapping("/overdue")
    public R<List<FinanceReceivable>> overdue() {
        return R.ok(receivableService.getOverdue());
    }
}

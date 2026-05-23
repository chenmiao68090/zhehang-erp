package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReimburse;
import com.zhehang.erp.modules.finance.service.impl.FinanceReimburseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/finance/reimburse")
@RequiredArgsConstructor
public class FinanceReimburseController {

    private final FinanceReimburseServiceImpl reimburseService;

    @GetMapping("/list")
    public R<IPage<FinanceReimburse>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String reimburseNo,
            @RequestParam(required = false) Long applicantId,
            @RequestParam(required = false) Integer status) {
        return R.ok(reimburseService.selectPage(pageNum, pageSize, reimburseNo, applicantId, status));
    }

    @GetMapping("/{id}")
    public R<FinanceReimburse> getInfo(@PathVariable Long id) {
        return R.ok(reimburseService.getById(id));
    }

    @PostMapping
    @Log(module = "Finance Reimburse", type = Log.OperationType.INSERT)
    public R<Void> submit(@RequestBody FinanceReimburse reimburse) {
        reimburse.setStatus(1);
        reimburseService.save(reimburse);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody FinanceReimburse reimburse) {
        reimburseService.updateById(reimburse);
        return R.ok();
    }

    @PutMapping("/approve")
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> approve(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        boolean approved = Boolean.parseBoolean(params.get("approved").toString());
        reimburseService.approve(id, approved);
        return R.ok();
    }

    @PutMapping("/pay/{id}")
    @Log(module = "Finance Reimburse", type = Log.OperationType.UPDATE)
    public R<Void> pay(@PathVariable Long id) {
        reimburseService.pay(id);
        return R.ok();
    }
}

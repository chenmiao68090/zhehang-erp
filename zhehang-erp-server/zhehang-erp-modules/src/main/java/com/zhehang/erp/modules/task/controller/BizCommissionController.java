package com.zhehang.erp.modules.task.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.task.domain.BizCommission;
import com.zhehang.erp.modules.task.service.IBizCommissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/commission")
@RequiredArgsConstructor
public class BizCommissionController {

    private final IBizCommissionService commissionService;

    @GetMapping("/list")
    public R<IPage<BizCommission>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) Long salesmanId,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer status) {
        return R.ok(commissionService.selectPage(pageNum, pageSize, salesmanId, period, status));
    }

    @GetMapping("/{id}")
    public R<BizCommission> detail(@PathVariable Long id) {
        return R.ok(commissionService.getById(id));
    }

    @PostMapping("/generate")
    @Log(module = "提成结算", type = Log.OperationType.INSERT)
    public R<Long> generate(@RequestBody Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        String period = body.get("period") != null ? body.get("period").toString() : null;
        return R.ok(commissionService.generate(orderId, period));
    }

    @PostMapping("/{id}/confirm")
    @Log(module = "提成结算", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        commissionService.salesmanConfirm(id, operatorId);
        return R.ok();
    }

    @PostMapping("/{id}/review")
    @Log(module = "提成结算", type = Log.OperationType.UPDATE)
    public R<Void> review(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        boolean pass = body == null || body.get("pass") == null || Boolean.parseBoolean(body.get("pass").toString());
        String comment = body != null && body.get("comment") != null ? body.get("comment").toString() : null;
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        commissionService.review(id, pass, comment, operatorId);
        return R.ok();
    }

    @PostMapping("/{id}/finance-confirm")
    @Log(module = "提成结算", type = Log.OperationType.UPDATE)
    public R<Void> financeConfirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        commissionService.financeConfirm(id, operatorId);
        return R.ok();
    }

    @PostMapping("/{id}/boss-approve")
    @Log(module = "提成结算", type = Log.OperationType.UPDATE)
    public R<Void> bossApprove(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        boolean approved = body == null || body.get("approved") == null || Boolean.parseBoolean(body.get("approved").toString());
        Long operatorId = body != null && body.get("operatorId") != null
                ? Long.valueOf(body.get("operatorId").toString()) : null;
        commissionService.bossApprove(id, approved, operatorId);
        return R.ok();
    }
}

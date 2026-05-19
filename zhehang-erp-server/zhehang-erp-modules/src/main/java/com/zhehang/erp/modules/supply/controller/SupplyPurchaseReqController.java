package com.zhehang.erp.modules.supply.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.supply.domain.entity.SupplyPurchaseReq;
import com.zhehang.erp.modules.supply.service.impl.SupplyPurchaseReqServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/supply/purchase-req")
@RequiredArgsConstructor
public class SupplyPurchaseReqController {

    private final SupplyPurchaseReqServiceImpl reqService;

    @GetMapping("/list")
    public R<IPage<SupplyPurchaseReq>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String reqNo,
            @RequestParam(required = false) Integer status) {
        return R.ok(reqService.selectPage(pageNum, pageSize, reqNo, status));
    }

    @GetMapping("/{id}")
    public R<SupplyPurchaseReq> getInfo(@PathVariable Long id) {
        return R.ok(reqService.getById(id));
    }

    @PostMapping
    @Log(module = "Purchase Request", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SupplyPurchaseReq req) {
        req.setReqNo(reqService.generateReqNo());
        if (req.getStatus() == null) req.setStatus(0);
        reqService.save(req);
        return R.ok();
    }

    @PutMapping
    @Log(module = "Purchase Request", type = Log.OperationType.UPDATE)
    public R<Void> update(@RequestBody SupplyPurchaseReq req) {
        reqService.updateById(req);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "Purchase Request", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        reqService.removeById(id);
        return R.ok();
    }

    @PutMapping("/submit/{id}")
    @Log(module = "Purchase Request", type = Log.OperationType.UPDATE)
    public R<Void> submit(@PathVariable Long id) {
        reqService.submit(id);
        return R.ok();
    }

    @PutMapping("/approve/{id}")
    @Log(module = "Purchase Request", type = Log.OperationType.UPDATE)
    public R<Void> approve(@PathVariable Long id) {
        reqService.approve(id);
        return R.ok();
    }

    @PutMapping("/reject/{id}")
    @Log(module = "Purchase Request", type = Log.OperationType.UPDATE)
    public R<Void> reject(@PathVariable Long id) {
        reqService.reject(id);
        return R.ok();
    }
}

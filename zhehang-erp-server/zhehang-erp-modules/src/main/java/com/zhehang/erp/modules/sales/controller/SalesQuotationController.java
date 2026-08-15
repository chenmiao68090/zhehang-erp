package com.zhehang.erp.modules.sales.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.sales.domain.entity.SalesQuotation;
import com.zhehang.erp.modules.sales.service.ISalesQuotationService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sales/quotation")
@RequiredArgsConstructor
public class SalesQuotationController {

    private final ISalesQuotationService quotationService;
    private final DataScopeHelper dataScopeHelper;

    @GetMapping("/list")
    public R<IPage<SalesQuotation>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String quotationNo,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return R.ok(quotationService.selectPage(pageNum, pageSize, quotationNo, customerId, status));
    }

    @GetMapping("/{id}")
    public R<SalesQuotation> getInfo(@PathVariable Long id) {
        SalesQuotation quotation = quotationService.getById(id);
        if (quotation != null && !dataScopeHelper.canAccess(quotation.getCreateBy(), null)) {
            return R.fail("无权操作他人记录");
        }
        return R.ok(quotation);
    }

    @PostMapping
    @Log(module = "报价管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody SalesQuotation quotation) {
        quotationService.save(quotation);
        return R.ok();
    }

    @PutMapping
    @Log(module = "报价管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody SalesQuotation quotation) {
        SalesQuotation existing = quotationService.getById(quotation.getId());
        if (existing != null && !dataScopeHelper.canAccess(existing.getCreateBy(), null)) {
            return R.fail("无权修改他人记录");
        }
        quotationService.updateById(quotation);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "报价管理", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        SalesQuotation quotation = quotationService.getById(id);
        if (quotation != null && !dataScopeHelper.canAccess(quotation.getCreateBy(), null)) {
            return R.fail("无权操作他人记录");
        }
        quotationService.removeById(id);
        return R.ok();
    }

    @PostMapping("/send/{id}")
    @Log(module = "报价管理", type = Log.OperationType.UPDATE)
    public R<Void> send(@PathVariable Long id) {
        quotationService.send(id);
        return R.ok();
    }

    @PostMapping("/confirm/{id}")
    @Log(module = "报价管理", type = Log.OperationType.UPDATE)
    public R<Void> confirm(@PathVariable Long id) {
        if (!dataScopeHelper.isManagerOrAdmin()) {
            return R.fail("无权确认报价");
        }
        quotationService.confirm(id);
        return R.ok();
    }

    @PostMapping("/newVersion/{id}")
    @Log(module = "报价管理", type = Log.OperationType.INSERT)
    public R<SalesQuotation> newVersion(@PathVariable Long id) {
        SalesQuotation source = quotationService.getById(id);
        if (source == null) {
            return R.fail("记录不存在");
        }
        if (!dataScopeHelper.canAccess(source.getCreateBy(), null)) {
            return R.fail("无权基于他人报价派生新版本");
        }
        return R.ok(quotationService.newVersion(id));
    }
}

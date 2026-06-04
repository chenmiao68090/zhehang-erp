package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmTaxProfile;
import com.zhehang.erp.modules.crm.service.ICrmTaxProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 客户税务档案（承接工商带出，补齐报税要素，作为报税日历/提醒的配置源头）。
 */
@RestController
@RequestMapping("/crm/tax-profile")
@RequiredArgsConstructor
public class CrmTaxProfileController {

    private final ICrmTaxProfileService taxProfileService;

    /** 按统一社会信用代码获取税务档案 */
    @GetMapping
    public R<CrmTaxProfile> getByCreditCode(@RequestParam String creditCode) {
        return R.ok(taxProfileService.getByCreditCode(creditCode));
    }

    /** 保存（按统一社会信用代码 upsert） */
    @PostMapping
    @Log(module = "客户税务档案", type = Log.OperationType.UPDATE)
    public R<CrmTaxProfile> save(@RequestBody CrmTaxProfile profile) {
        return R.ok(taxProfileService.saveOrUpdateByCreditCode(profile));
    }

    /** 报税日历：某月各客户应申报的税种与截止日（month 形如 2026-06，缺省取当月） */
    @GetMapping("/calendar")
    public R<java.util.List<java.util.Map<String, Object>>> calendar(
            @RequestParam(required = false) String month) {
        return R.ok(taxProfileService.taxCalendar(month));
    }
}

package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmTaxProfile;
import com.zhehang.erp.modules.crm.service.ICrmTaxProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/**
 * 客户税务档案（承接工商带出并补齐税务要素；不包含法定申报期限或真实申报结果）。
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

    /**
     * 报税日历入口。可靠期限和申报结果数据源接入前返回明确的不可用错误，
     * 不得用固定日期或统一状态生成待办。
     */
    @GetMapping("/calendar")
    public R<java.util.List<java.util.Map<String, Object>>> calendar(
            @RequestParam(required = false) String month) {
        return R.ok(taxProfileService.taxCalendar(month));
    }
}

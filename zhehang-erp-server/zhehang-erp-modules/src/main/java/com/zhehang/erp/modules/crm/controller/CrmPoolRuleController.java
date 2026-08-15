package com.zhehang.erp.modules.crm.controller;

import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.dto.CrmPoolRuleConfigDTO;
import com.zhehang.erp.modules.crm.domain.entity.CrmPoolRuleVersion;
import com.zhehang.erp.modules.crm.service.CrmPoolRuleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crm/pool-rules")
@RequiredArgsConstructor
public class CrmPoolRuleController {
    private final CrmPoolRuleService ruleService;

    @GetMapping("/overview")
    public R<Map<String, Object>> overview() {
        return R.ok(ruleService.overview());
    }

    @GetMapping("/versions")
    public R<List<CrmPoolRuleVersion>> versions() {
        return R.ok(ruleService.versions());
    }

    @PostMapping("/draft")
    @Log(module = "公海私海规则", type = Log.OperationType.UPDATE)
    public R<CrmPoolRuleVersion> saveDraft(@RequestBody CrmPoolRuleConfigDTO input) {
        return R.ok(ruleService.saveDraft(input));
    }

    @PostMapping("/simulate")
    public R<Map<String, Object>> simulate(@RequestBody CrmPoolRuleConfigDTO input) {
        return R.ok(ruleService.simulate(input));
    }

    @PostMapping("/{id}/publish")
    @Log(module = "公海私海规则", type = Log.OperationType.UPDATE)
    public R<CrmPoolRuleVersion> publish(@PathVariable Long id,
                                         @RequestParam(defaultValue = "NEXT_DAY") String mode) {
        return R.ok(ruleService.publish(id, mode));
    }
}

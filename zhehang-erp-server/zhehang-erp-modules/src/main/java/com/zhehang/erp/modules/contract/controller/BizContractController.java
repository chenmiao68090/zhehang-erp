package com.zhehang.erp.modules.contract.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.domain.BizContractTemplate;
import com.zhehang.erp.modules.contract.service.IBizContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/contract-mgmt")
@RequiredArgsConstructor
public class BizContractController {

    private final IBizContractService contractService;

    @GetMapping("/list")
    public R<IPage<BizContract>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String contractNo,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return R.ok(contractService.selectPage(pageNum, pageSize, contractNo, customerId, status));
    }

    @GetMapping("/{id}")
    public R<BizContract> detail(@PathVariable Long id) {
        return R.ok(contractService.getById(id));
    }

    @PostMapping("/generate")
    @Log(module = "合同管理", type = Log.OperationType.INSERT)
    public R<Long> generate(@RequestBody Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        Long templateId = body.get("templateId") != null
                ? Long.valueOf(body.get("templateId").toString()) : null;
        String title = body.get("title") != null ? body.get("title").toString() : null;
        return R.ok(contractService.generateFromOrder(orderId, templateId, title));
    }

    @PutMapping("/{id}")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> update(@PathVariable Long id, @RequestBody BizContract contract) {
        contract.setId(id);
        contractService.updateById(contract);
        return R.ok();
    }

    @PostMapping("/{id}/send-sign")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> sendSign(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String signMode = body != null && body.get("signMode") != null ? body.get("signMode").toString() : null;
        contractService.sendSign(id, signMode);
        return R.ok();
    }

    @PostMapping("/{id}/confirm-sign")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> confirmSign(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String signerTheirs = body != null && body.get("signerTheirs") != null ? body.get("signerTheirs").toString() : null;
        contractService.confirmSign(id, signerTheirs);
        return R.ok();
    }

    @PostMapping("/{id}/renew")
    @Log(module = "合同管理", type = Log.OperationType.INSERT)
    public R<Long> renew(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String newTitle = body != null && body.get("title") != null ? body.get("title").toString() : null;
        return R.ok(contractService.renew(id, newTitle));
    }

    @PostMapping("/{id}/terminate")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> terminate(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        String reason = body != null && body.get("reason") != null ? body.get("reason").toString() : null;
        contractService.terminate(id, reason);
        return R.ok();
    }

    @GetMapping("/expiring")
    public R<List<BizContract>> expiring(@RequestParam(defaultValue = "30") Integer days) {
        return R.ok(contractService.getExpiring(days));
    }

    @GetMapping("/templates")
    public R<List<BizContractTemplate>> templates(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status) {
        return R.ok(contractService.listTemplates(category, status));
    }

    @PostMapping("/template")
    @Log(module = "合同模板", type = Log.OperationType.UPDATE)
    public R<Long> saveTemplate(@RequestBody BizContractTemplate template) {
        return R.ok(contractService.saveTemplate(template));
    }
}

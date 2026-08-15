package com.zhehang.erp.modules.contract.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.contract.domain.BizContract;
import com.zhehang.erp.modules.contract.domain.BizContractRenewStage;
import com.zhehang.erp.modules.contract.domain.BizContractTemplate;
import com.zhehang.erp.modules.contract.mapper.BizContractRenewStageMapper;
import com.zhehang.erp.modules.contract.service.IBizContractService;
import com.zhehang.erp.modules.crm.support.DataScopeHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/contract-mgmt")
@RequiredArgsConstructor
public class BizContractController {

    private final IBizContractService contractService;
    private final BizContractRenewStageMapper renewStageMapper;
    private final DataScopeHelper dataScopeHelper;

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
        BizContract contract = contractService.getById(id);
        if (contract != null && !dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId())) {
            throw new AccessDeniedException("无权查看数据范围外的合同");
        }
        return R.ok(contract);
    }

    @PostMapping("/generate")
    @Log(module = "合同管理", type = Log.OperationType.INSERT)
    public R<Long> generate(@RequestBody Map<String, Object> body) {
        if (body == null || body.get("orderId") == null) {
            return R.fail("订单ID不能为空");
        }
        Long orderId = Long.valueOf(body.get("orderId").toString());
        Long templateId = body.get("templateId") != null
                ? Long.valueOf(body.get("templateId").toString()) : null;
        String title = body.get("title") != null ? body.get("title").toString() : null;
        return R.ok(contractService.generateFromOrder(orderId, templateId, title));
    }

    @PutMapping("/{id}")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> update(@PathVariable Long id, @RequestBody BizContract contract) {
        BizContract existing = contractService.getById(id);
        if (existing == null) {
            return R.fail("合同不存在");
        }
        if (!dataScopeHelper.canAccess(existing.getSalesmanId(), existing.getDeptId())) {
            throw new AccessDeniedException("无权修改数据范围外的合同");
        }
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
    @PreAuthorize("@perm.hasAnyRole('dept_manager', 'manager', 'boss', 'super_admin')")
    public R<Long> saveTemplate(@RequestBody BizContractTemplate template) {
        return R.ok(contractService.saveTemplate(template));
    }

    /** 续费阶梯:返回本租户全部阶梯记录(前端按 contractId 分组) */
    @GetMapping("/renew-stages")
    public R<List<BizContractRenewStage>> renewStages() {
        List<BizContractRenewStage> stages = renewStageMapper.selectList(new LambdaQueryWrapper<BizContractRenewStage>()
                .orderByAsc(BizContractRenewStage::getContractId)
                .orderByDesc(BizContractRenewStage::getStage));
        Set<Long> contractIds = stages.stream().map(BizContractRenewStage::getContractId)
                .filter(java.util.Objects::nonNull).collect(Collectors.toSet());
        Set<Long> accessibleIds = contractIds.isEmpty() ? Set.of() : contractService.listByIds(contractIds).stream()
                .filter(contract -> dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId()))
                .map(BizContract::getId).collect(Collectors.toSet());
        stages.removeIf(stage -> !accessibleIds.contains(stage.getContractId()));
        return R.ok(stages);
    }

    /** 续费阶梯:更新某合同某阶梯的处理状态(按 合同+阶梯 upsert) */
    @PostMapping("/{id}/stage")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> saveStage(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        BizContract contract = contractService.getById(id);
        if (contract == null) {
            return R.fail("合同不存在");
        }
        if (!dataScopeHelper.canAccess(contract.getSalesmanId(), contract.getDeptId())) {
            throw new AccessDeniedException("无权修改数据范围外的合同阶段");
        }
        if (body == null || body.get("stage") == null) {
            return R.fail("阶段不能为空");
        }
        Integer stage = Integer.valueOf(body.get("stage").toString());
        String status = body.get("status") != null ? body.get("status").toString() : "pending";
        String handler = body.get("handler") != null ? body.get("handler").toString() : null;
        String note = body.get("note") != null ? body.get("note").toString() : null;
        BizContractRenewStage row = renewStageMapper.selectOne(new LambdaQueryWrapper<BizContractRenewStage>()
                .eq(BizContractRenewStage::getContractId, id)
                .eq(BizContractRenewStage::getStage, stage)
                .last("LIMIT 1"));
        if (row == null) {
            row = new BizContractRenewStage();
            row.setContractId(id);
            row.setStage(stage);
        }
        row.setStatus(status);
        if (handler != null) row.setHandler(handler);
        if (note != null) row.setNote(note);
        if ("done".equals(status)) row.setHandledAt(LocalDateTime.now());
        if (row.getId() == null) {
            renewStageMapper.insert(row);
        } else {
            renewStageMapper.updateById(row);
        }
        return R.ok();
    }
}

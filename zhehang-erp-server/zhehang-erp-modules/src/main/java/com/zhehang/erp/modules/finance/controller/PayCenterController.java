package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.DenyDuringImpersonation;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.dto.PayImportCommitDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnClaimDTO;
import com.zhehang.erp.modules.finance.domain.dto.PayTxnQuery;
import com.zhehang.erp.modules.finance.domain.entity.FinPayChannel;
import com.zhehang.erp.modules.finance.domain.entity.FinPayImportBatch;
import com.zhehang.erp.modules.finance.domain.entity.FinPayTransaction;
import com.zhehang.erp.modules.finance.service.IPayCenterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 收款中心:收款渠道 + 统一收款流水 + 认领生成收款登记 + 对账单导入。
 * 权限串复用收款登记(finance:company-journal:list),财务/老板无需新授权。
 */
@RestController
@RequestMapping("/finance/pay-center")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasPermission('finance:company-journal:list')")
@DenyDuringImpersonation(reason = "收款流水包含付款方账号与收款账户信息")
public class PayCenterController {

    private final IPayCenterService payCenterService;

    // ---------------- 总览 ----------------

    /** 总览统计:今日/本月/待认领 + 分渠道。 */
    @GetMapping("/stats")
    public R<Map<String, Object>> stats() {
        return R.ok(payCenterService.stats());
    }

    // ---------------- 渠道 ----------------

    @GetMapping("/channels")
    public R<List<FinPayChannel>> channels() {
        return R.ok(payCenterService.listChannels());
    }

    @PostMapping("/channel")
    @Log(module = "收款中心", type = Log.OperationType.UPDATE)
    public R<Long> saveChannel(@RequestBody FinPayChannel channel) {
        return R.ok(payCenterService.saveChannel(channel));
    }

    @PutMapping("/channel/{id}/status")
    @Log(module = "收款中心", type = Log.OperationType.UPDATE)
    public R<Void> channelStatus(@PathVariable Long id, @RequestParam Integer status) {
        payCenterService.updateChannelStatus(id, status);
        return R.ok();
    }

    @DeleteMapping("/channel/{id}")
    @Log(module = "收款中心", type = Log.OperationType.DELETE)
    public R<Void> removeChannel(@PathVariable Long id) {
        payCenterService.removeChannel(id);
        return R.ok();
    }

    // ---------------- 流水 ----------------

    @GetMapping("/transactions")
    public R<IPage<FinPayTransaction>> transactions(PayTxnQuery query) {
        return R.ok(payCenterService.pageTransactions(query));
    }

    /** 手工补录一笔收款。 */
    @PostMapping("/transaction")
    @Log(module = "收款中心", type = Log.OperationType.INSERT)
    public R<Long> createManual(@RequestBody FinPayTransaction txn) {
        return R.ok(payCenterService.createManual(txn));
    }

    /** 认领:生成收款登记草稿,返回收款登记id。 */
    @PostMapping("/transaction/{id}/claim")
    @Log(module = "收款中心", type = Log.OperationType.INSERT)
    public R<Long> claim(@PathVariable Long id, @Valid @RequestBody PayTxnClaimDTO dto) {
        return R.ok(payCenterService.claim(id, dto));
    }

    /** 撤销认领/取消不入账:回到待认领(已生成的收款登记不删,仅解除关联)。 */
    @PostMapping("/transaction/{id}/restore")
    @Log(module = "收款中心", type = Log.OperationType.UPDATE)
    public R<Void> restore(@PathVariable Long id) {
        payCenterService.restore(id);
        return R.ok();
    }

    /** 标记不入账(内部转账/测试款等)。 */
    @PostMapping("/transaction/{id}/ignore")
    @Log(module = "收款中心", type = Log.OperationType.UPDATE)
    public R<Void> ignore(@PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        payCenterService.ignore(id, body == null ? null : body.get("reason"));
        return R.ok();
    }

    // ---------------- 导入 ----------------

    @PostMapping("/import/preview")
    public R<Map<String, Object>> importPreview(@Valid @RequestBody PayImportCommitDTO dto) {
        return R.ok(payCenterService.importPreview(dto));
    }

    @PostMapping("/import/commit")
    @Log(module = "收款中心", type = Log.OperationType.IMPORT)
    public R<Map<String, Object>> importCommit(@Valid @RequestBody PayImportCommitDTO dto) {
        return R.ok(payCenterService.importCommit(dto));
    }

    @GetMapping("/import/batches")
    public R<List<FinPayImportBatch>> importBatches() {
        return R.ok(payCenterService.listImportBatches());
    }

    @PostMapping("/import/batch/{id}/rollback")
    @Log(module = "收款中心", type = Log.OperationType.DELETE)
    public R<Map<String, Object>> rollbackBatch(@PathVariable Long id) {
        return R.ok(payCenterService.rollbackBatch(id));
    }
}

package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.BookkeepingColleagueVO;
import com.zhehang.erp.modules.finance.domain.entity.FinBookkeepingLedger;
import com.zhehang.erp.modules.finance.mapper.FinBookkeepingLedgerMapper;
import com.zhehang.erp.modules.finance.service.IFinBookkeepingLedgerService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 代账客户台账 Controller(会计体系·代理记账业务线)。实际路径 = /api + /finance/bookkeeping-ledger/...
 * 新增文件,不改现有 finance controller;权限沿用 finance 模块级(@perm.hasModule('finance'))。
 */
@RestController
@RequestMapping("/finance/bookkeeping-ledger")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasModule('finance')")
public class FinBookkeepingLedgerController {

    private final IFinBookkeepingLedgerService ledgerService;
    private final FinBookkeepingLedgerMapper ledgerMapper;

    @GetMapping("/list")
    public R<IPage<FinBookkeepingLedger>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String period,
            @RequestParam(required = false) Integer bookkeepingStatus,
            @RequestParam(required = false) Integer taxFilingStatus) {
        return R.ok(ledgerService.ledgerList(pageNum, pageSize, keyword, period, bookkeepingStatus, taxFilingStatus));
    }

    /** 各记账/报税状态计数(供状态统计卡)。 */
    @GetMapping("/status-count")
    public R<Map<String, Long>> statusCount(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String period) {
        return R.ok(ledgerService.statusCount(keyword, period));
    }

    /** 可选负责会计(已开通账号的员工)。 */
    @GetMapping("/colleagues")
    public R<List<BookkeepingColleagueVO>> colleagues() {
        return R.ok(ledgerMapper.selectColleagues());
    }

    @GetMapping("/{id}")
    public R<FinBookkeepingLedger> detail(@PathVariable Long id) {
        return R.ok(ledgerMapper.selectById(id));
    }

    @PostMapping
    @Log(module = "代账客户台账", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody FinBookkeepingLedger entity) {
        entity.setId(null);
        return R.ok(ledgerService.saveLedger(entity));
    }

    @PutMapping
    @Log(module = "代账客户台账", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody FinBookkeepingLedger entity) {
        return R.ok(ledgerService.saveLedger(entity));
    }

    @DeleteMapping("/{id}")
    @Log(module = "代账客户台账", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        ledgerService.removeLedger(id);
        return R.ok();
    }
}

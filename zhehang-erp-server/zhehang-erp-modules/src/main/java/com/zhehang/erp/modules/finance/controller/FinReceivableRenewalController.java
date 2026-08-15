package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivableCollectionDTO;
import com.zhehang.erp.modules.finance.domain.dto.FinReceivablePaymentDTO;
import com.zhehang.erp.modules.finance.domain.entity.BookkeepingColleagueVO;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableCollectionLog;
import com.zhehang.erp.modules.finance.domain.entity.FinReceivableRenewal;
import com.zhehang.erp.modules.finance.domain.entity.ReceivableCustomerOptionVO;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import com.zhehang.erp.modules.finance.service.IFinReceivableRenewalService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** 回款续费模块。 */
@RestController
@RequestMapping("/finance/receivable-renewal")
@RequiredArgsConstructor
@PreAuthorize("@perm.hasModule('finance')")
public class FinReceivableRenewalController {

    private final IFinReceivableRenewalService receivableRenewalService;
    private final FinReceivableRenewalMapper receivableRenewalMapper;

    @GetMapping("/list")
    public R<IPage<FinReceivableRenewal>> list(@RequestParam(defaultValue = "1") Integer pageNum,
                                               @RequestParam(defaultValue = "10") Integer pageSize,
                                               @RequestParam(required = false) String keyword,
                                               @RequestParam(required = false) String serviceType,
                                               @RequestParam(required = false) String receivableMonth,
                                               @RequestParam(required = false) Integer receivableStatus,
                                               @RequestParam(required = false) String collectionStatus,
                                               @RequestParam(required = false) Long collectorId,
                                               @RequestParam(required = false) Boolean overdueOnly,
                                               @RequestParam(required = false) Boolean badRiskOnly) {
        return R.ok(receivableRenewalService.selectPage(pageNum, pageSize, keyword, serviceType, receivableMonth,
                receivableStatus, collectionStatus, collectorId, overdueOnly, badRiskOnly));
    }

    @GetMapping("/summary")
    public R<Map<String, Object>> summary() {
        return R.ok(receivableRenewalService.summary());
    }

    @GetMapping("/colleagues")
    public R<List<BookkeepingColleagueVO>> colleagues() {
        return R.ok(receivableRenewalMapper.selectColleagues());
    }

    @GetMapping("/customer-options")
    public R<List<ReceivableCustomerOptionVO>> customerOptions(@RequestParam(required = false) String keyword) {
        return R.ok(receivableRenewalMapper.selectCustomerOptions(keyword));
    }

    @GetMapping("/{id}")
    public R<FinReceivableRenewal> detail(@PathVariable Long id) {
        return R.ok(receivableRenewalService.detail(id));
    }

    @PostMapping
    @Log(module = "回款续费", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody FinReceivableRenewal entity) {
        entity.setId(null);
        return R.ok(receivableRenewalService.saveReceivable(entity));
    }

    @PutMapping
    @Log(module = "回款续费", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody FinReceivableRenewal entity) {
        return R.ok(receivableRenewalService.saveReceivable(entity));
    }

    @PostMapping("/receive")
    @Log(module = "回款续费", type = Log.OperationType.UPDATE)
    public R<Void> receive(@RequestBody FinReceivablePaymentDTO dto) {
        receivableRenewalService.receive(dto);
        return R.ok();
    }

    @PostMapping("/collect")
    @Log(module = "回款续费", type = Log.OperationType.UPDATE)
    public R<Void> collect(@RequestBody FinReceivableCollectionDTO dto) {
        receivableRenewalService.collect(dto);
        return R.ok();
    }

    @GetMapping("/logs/{id}")
    public R<List<FinReceivableCollectionLog>> logs(@PathVariable Long id) {
        return R.ok(receivableRenewalService.logs(id));
    }

    @DeleteMapping("/{id}")
    @Log(module = "回款续费", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        receivableRenewalService.removeReceivable(id);
        return R.ok();
    }
}

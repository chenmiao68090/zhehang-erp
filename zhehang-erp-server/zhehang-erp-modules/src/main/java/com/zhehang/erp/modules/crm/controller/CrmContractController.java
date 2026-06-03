package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.crm.domain.entity.CrmContract;
import com.zhehang.erp.modules.crm.service.ICrmContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/crm/contract")
@RequiredArgsConstructor
public class CrmContractController {

    private final ICrmContractService contractService;

    @GetMapping("/list")
    public R<IPage<CrmContract>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String contractNo,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Integer status) {
        return R.ok(contractService.selectPage(pageNum, pageSize, contractNo, customerId, status));
    }

    @GetMapping("/{id}")
    public R<CrmContract> getInfo(@PathVariable Long id) {
        return R.ok(contractService.getById(id));
    }

    @PostMapping
    @Log(module = "合同管理", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody CrmContract contract) {
        contractService.save(contract);
        return R.ok();
    }

    @PutMapping
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody CrmContract contract) {
        contractService.updateById(contract);
        return R.ok();
    }

    @PutMapping("/status")
    @Log(module = "合同管理", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@RequestBody Map<String, Object> params) {
        Long id = Long.valueOf(params.get("id").toString());
        Integer status = Integer.valueOf(params.get("status").toString());
        contractService.changeStatus(id, status);
        return R.ok();
    }

    /** 销售业绩(按签订人):合同数量 + 合同金额,可按签约年份/状态过滤 */
    @GetMapping("/performance")
    public R<List<Map<String, Object>>> performance(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer status) {
        return R.ok(contractService.performanceByOwner(year, status));
    }

    /** 合同月度趋势(签约金额/数量,12 月补零) */
    @GetMapping("/trend")
    public R<List<Map<String, Object>>> trend(@RequestParam(required = false) Integer year) {
        return R.ok(contractService.monthlyTrend(year));
    }
}

package com.zhehang.erp.modules.crm.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.crm.domain.entity.CrmPool;
import com.zhehang.erp.modules.crm.service.ICrmCustomerService;
import com.zhehang.erp.modules.crm.service.ICrmPoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/crm/pool")
@RequiredArgsConstructor
public class CrmPoolController {

    private final ICrmPoolService poolService;
    private final ICrmCustomerService customerService;

    @GetMapping("/list")
    public R<IPage<CrmPool>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return R.ok(poolService.selectPage(pageNum, pageSize));
    }

    @PostMapping("/claim/{id}")
    @Log(module = "公海池", type = Log.OperationType.UPDATE)
    public R<Void> claim(@PathVariable Long id, @RequestBody Map<String, Long> params) {
        // 路径上的 id 是公海记录 id,需先取出其 customerId 再认领,避免把公海记录 id 当客户 id 误传
        CrmPool pool = poolService.getById(id);
        if (pool == null) {
            throw new BusinessException("公海记录不存在");
        }
        customerService.claimFromPool(pool.getCustomerId(), params.get("ownerId"));
        return R.ok();
    }
}

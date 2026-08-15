package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.finance.domain.entity.FinPettyCash;
import com.zhehang.erp.modules.finance.mapper.FinPettyCashMapper;
import com.zhehang.erp.modules.finance.service.IFinPettyCashService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

/** 备用金 Controller。实际路径 = /api + /finance/petty-cash/... */
@RestController
@RequestMapping("/finance/petty-cash")
@RequiredArgsConstructor
@org.springframework.security.access.prepost.PreAuthorize("@perm.hasModule('finance')")
public class FinPettyCashController {

    private final IFinPettyCashService pettyCashService;
    private final FinPettyCashMapper pettyCashMapper;

    @GetMapping("/list")
    public R<IPage<FinPettyCash>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        return R.ok(pettyCashService.pettyCashList(pageNum, pageSize, keyword, status));
    }

    @GetMapping("/{id}")
    public R<FinPettyCash> detail(@PathVariable Long id) {
        return R.ok(pettyCashMapper.selectById(id));
    }

    @PostMapping
    @Log(module = "备用金", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody FinPettyCash entity) {
        entity.setId(null);
        return R.ok(pettyCashService.savePettyCash(entity));
    }

    @PutMapping
    @Log(module = "备用金", type = Log.OperationType.UPDATE)
    public R<Long> update(@RequestBody FinPettyCash entity) {
        return R.ok(pettyCashService.savePettyCash(entity));
    }

    @PutMapping("/{id}/status")
    @Log(module = "备用金", type = Log.OperationType.UPDATE)
    public R<Void> changeStatus(@PathVariable Long id, @RequestParam String status) {
        pettyCashService.changeStatus(id, status);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "备用金", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        pettyCashService.removePettyCash(id);
        return R.ok();
    }
}

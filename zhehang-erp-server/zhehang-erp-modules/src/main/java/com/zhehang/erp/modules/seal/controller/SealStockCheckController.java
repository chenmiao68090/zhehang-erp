package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealStockCheck;
import com.zhehang.erp.modules.seal.mapper.BizSealStockCheckMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 刻章·印章库存盘点。
 */
@RestController
@RequestMapping("/seal/stock-check")
@RequiredArgsConstructor
public class SealStockCheckController {

    private final BizSealStockCheckMapper stockCheckMapper;

    @GetMapping("/list")
    public R<List<BizSealStockCheck>> list() {
        LambdaQueryWrapper<BizSealStockCheck> qw = new LambdaQueryWrapper<BizSealStockCheck>()
                .orderByDesc(BizSealStockCheck::getId);
        return R.ok(stockCheckMapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "印章盘点", type = Log.OperationType.INSERT)
    public R<Void> save(@RequestBody BizSealStockCheck stockCheck) {
        // 差异 = 实际 - 账面;后端兜底计算,避免前端漏算
        int book = stockCheck.getBookQty() == null ? 0 : stockCheck.getBookQty();
        int actual = stockCheck.getActualQty() == null ? 0 : stockCheck.getActualQty();
        stockCheck.setDiff(actual - book);
        if (stockCheck.getId() == null) {
            stockCheckMapper.insert(stockCheck);
        } else {
            stockCheckMapper.updateById(stockCheck);
        }
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "印章盘点", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        stockCheckMapper.deleteById(id);
        return R.ok();
    }
}

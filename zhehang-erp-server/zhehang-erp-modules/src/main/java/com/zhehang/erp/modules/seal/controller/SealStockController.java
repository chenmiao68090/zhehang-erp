package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealStock;
import com.zhehang.erp.modules.seal.domain.BizSealStockLog;
import com.zhehang.erp.modules.seal.mapper.BizSealStockMapper;
import com.zhehang.erp.modules.seal.mapper.BizSealStockLogMapper;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 刻章·印章耗材库存。
 */
@RestController
@RequestMapping("/seal/stock")
@RequiredArgsConstructor
public class SealStockController {

    private final BizSealStockMapper stockMapper;
    private final BizSealStockLogMapper stockLogMapper;

    @GetMapping("/list")
    public R<List<BizSealStock>> list(@RequestParam(required = false) String keyword) {
        LambdaQueryWrapper<BizSealStock> qw = new LambdaQueryWrapper<BizSealStock>()
                .like(StringUtils.hasText(keyword), BizSealStock::getItemName, keyword)
                .orderByAsc(BizSealStock::getItemName)
                .orderByDesc(BizSealStock::getId);
        return R.ok(stockMapper.selectList(qw));
    }

    @PostMapping
    @Log(module = "印章库存", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizSealStock stock) {
        if (stock.getQuantity() == null) stock.setQuantity(0);
        stockMapper.insert(stock);
        return R.ok();
    }

    @PutMapping
    @Log(module = "印章库存", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizSealStock stock) {
        stockMapper.updateById(stock);
        return R.ok();
    }

    /** 入库/出库调整:delta 为正=入库,为负=出库;库存不允许调到负数。 */
    @PostMapping("/adjust")
    @Log(module = "印章库存", type = Log.OperationType.UPDATE)
    public R<Void> adjust(@RequestBody Map<String, Object> params) {
        Object idObj = params.get("id");
        if (idObj == null) return R.fail("缺少库存项ID");
        int delta = params.get("delta") == null ? 0 : Integer.parseInt(String.valueOf(params.get("delta")));
        BizSealStock stock = stockMapper.selectById(Long.valueOf(String.valueOf(idObj)));
        if (stock == null) return R.fail("库存项不存在");
        int now = stock.getQuantity() == null ? 0 : stock.getQuantity();
        int next = now + delta;
        if (next < 0) return R.fail("库存不足,出库后会变成负数");
        stock.setQuantity(next);
        stockMapper.updateById(stock);
        // 记录调整日志(含事由),便于审计追溯——此前前端填的reason被丢弃
        BizSealStockLog logRow = new BizSealStockLog();
        logRow.setStockId(stock.getId());
        logRow.setItemName(stock.getItemName());
        logRow.setDelta(delta);
        logRow.setBeforeQty(now);
        logRow.setAfterQty(next);
        Object reasonObj = params.get("reason");
        logRow.setReason(reasonObj == null ? null : String.valueOf(reasonObj));
        logRow.setCreateBy(SecurityUtils.getCurrentUserId());
        stockLogMapper.insert(logRow);
        return R.ok();
    }

    /** 某库存项的调整历史(倒序),用于审计追溯。 */
    @GetMapping("/{id}/logs")
    public R<List<BizSealStockLog>> logs(@PathVariable Long id) {
        return R.ok(stockLogMapper.selectList(new LambdaQueryWrapper<BizSealStockLog>()
                .eq(BizSealStockLog::getStockId, id)
                .orderByDesc(BizSealStockLog::getId)));
    }

    @DeleteMapping("/{id}")
    @Log(module = "印章库存", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        stockMapper.deleteById(id);
        return R.ok();
    }
}

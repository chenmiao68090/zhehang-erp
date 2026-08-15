package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealPurchase;
import com.zhehang.erp.modules.seal.domain.BizSealStock;
import com.zhehang.erp.modules.seal.mapper.BizSealPurchaseMapper;
import com.zhehang.erp.modules.seal.mapper.BizSealStockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * 刻章·印章耗材采购记录。
 */
@RestController
@RequestMapping("/seal/purchase")
@RequiredArgsConstructor
public class SealPurchaseController {

    private final BizSealPurchaseMapper purchaseMapper;
    private final BizSealStockMapper stockMapper;

    @GetMapping("/list")
    public R<IPage<BizSealPurchase>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        LambdaQueryWrapper<BizSealPurchase> qw = new LambdaQueryWrapper<BizSealPurchase>()
                .like(StringUtils.hasText(keyword), BizSealPurchase::getItemName, keyword)
                .eq(StringUtils.hasText(status), BizSealPurchase::getStatus, status)
                .orderByDesc(BizSealPurchase::getPurchaseDate)
                .orderByDesc(BizSealPurchase::getId);
        return R.ok(purchaseMapper.selectPage(new Page<>(pageNum, pageSize), qw));
    }

    @PostMapping
    @Log(module = "印章采购", type = Log.OperationType.INSERT)
    public R<Void> add(@RequestBody BizSealPurchase p) {
        fillAmount(p);
        if (p.getStatus() == null || p.getStatus().isBlank()) p.setStatus("ordered");
        purchaseMapper.insert(p);
        return R.ok();
    }

    @PutMapping
    @Log(module = "印章采购", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizSealPurchase p) {
        fillAmount(p);
        // 已到货采购单不可改状态,避免改回 ordered 后再次 arrive 重复加库存
        BizSealPurchase old = purchaseMapper.selectById(p.getId());
        if (old != null && "arrived".equals(old.getStatus())) {
            p.setStatus(old.getStatus());
        }
        purchaseMapper.updateById(p);
        return R.ok();
    }

    /** 到货入库:把采购数量加到同名库存项(没有则自动建一条),并把状态置为已到货。 */
    @PostMapping("/{id}/arrive")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "印章采购", type = Log.OperationType.UPDATE)
    public R<Void> arrive(@PathVariable Long id) {
        BizSealPurchase p = purchaseMapper.selectById(id);
        if (p == null) return R.fail("采购单不存在");
        if ("arrived".equals(p.getStatus())) return R.fail("该采购单已入库,请勿重复操作");
        int qty = p.getQuantity() == null ? 0 : p.getQuantity();
        // 按品名找库存(同租户,租户拦截器自动过滤)
        BizSealStock stock = stockMapper.selectOne(new LambdaQueryWrapper<BizSealStock>()
                .eq(BizSealStock::getItemName, p.getItemName())
                .last("limit 1"));
        if (stock == null) {
            stock = new BizSealStock();
            stock.setItemName(p.getItemName());
            stock.setSpec(p.getSpec());
            stock.setQuantity(qty);
            stock.setUnitPrice(p.getUnitPrice());
            stock.setSupplier(p.getSupplier());
            stockMapper.insert(stock);
        } else {
            int now = stock.getQuantity() == null ? 0 : stock.getQuantity();
            stock.setQuantity(now + qty);
            stockMapper.updateById(stock);
        }
        p.setStatus("arrived");
        purchaseMapper.updateById(p);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "印章采购", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        purchaseMapper.deleteById(id);
        return R.ok();
    }

    /** 金额 = 数量 × 单价(前端没传金额时兜底计算)。 */
    private void fillAmount(BizSealPurchase p) {
        if (p.getAmount() == null && p.getQuantity() != null && p.getUnitPrice() != null) {
            p.setAmount(p.getUnitPrice().multiply(BigDecimal.valueOf(p.getQuantity())));
        }
    }
}

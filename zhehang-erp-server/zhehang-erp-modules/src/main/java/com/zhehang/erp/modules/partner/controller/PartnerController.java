package com.zhehang.erp.modules.partner.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.zhehang.erp.common.core.annotation.Log;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.partner.domain.BizPartner;
import com.zhehang.erp.modules.partner.domain.BizPartnerHistory;
import com.zhehang.erp.modules.partner.domain.BizPartnerPrice;
import com.zhehang.erp.modules.partner.mapper.BizPartnerHistoryMapper;
import com.zhehang.erp.modules.partner.mapper.BizPartnerMapper;
import com.zhehang.erp.modules.partner.mapper.BizPartnerPriceMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 长期合作客户名录 + 合作价格。
 */
@RestController
@RequestMapping("/partner")
@RequiredArgsConstructor
public class PartnerController {

    private final BizPartnerMapper partnerMapper;
    private final BizPartnerPriceMapper priceMapper;
    private final BizPartnerHistoryMapper historyMapper;

    /* ---------- 客户 ---------- */

    @GetMapping("/list")
    public R<IPage<BizPartner>> list(
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String bizType) {
        LambdaQueryWrapper<BizPartner> qw = new LambdaQueryWrapper<BizPartner>()
                .like(StringUtils.hasText(keyword), BizPartner::getCompanyName, keyword)
                .eq(StringUtils.hasText(level), BizPartner::getLevel, level)
                .eq(StringUtils.hasText(bizType), BizPartner::getBizType, bizType)
                .orderByDesc(BizPartner::getId);
        IPage<BizPartner> page = partnerMapper.selectPage(new Page<>(pageNum, pageSize), qw);
        // 给列表每个客户带出其协议价(前端用来显示 新设/变更/单章 等标准价);一次 IN 查询,避免 N+1
        List<BizPartner> records = page.getRecords();
        if (records != null && !records.isEmpty()) {
            List<Long> ids = records.stream().map(BizPartner::getId).collect(Collectors.toList());
            List<BizPartnerPrice> allPrices = priceMapper.selectList(new LambdaQueryWrapper<BizPartnerPrice>()
                    .in(BizPartnerPrice::getPartnerId, ids)
                    .orderByAsc(BizPartnerPrice::getId));
            Map<Long, List<BizPartnerPrice>> byPartner = allPrices.stream()
                    .collect(Collectors.groupingBy(BizPartnerPrice::getPartnerId));
            for (BizPartner p : records) {
                p.setPrices(byPartner.getOrDefault(p.getId(), Collections.emptyList()));
            }
        }
        return R.ok(page);
    }

    @PostMapping
    @Log(module = "长期客户", type = Log.OperationType.INSERT)
    public R<Long> add(@RequestBody BizPartner partner) {
        if (partner.getLevel() == null || partner.getLevel().isBlank()) partner.setLevel("normal");
        partnerMapper.insert(partner);
        // 返回新客户ID,便于前端紧接着批量保存协议价
        return R.ok(partner.getId());
    }

    @PutMapping
    @Log(module = "长期客户", type = Log.OperationType.UPDATE)
    public R<Void> edit(@RequestBody BizPartner partner) {
        partnerMapper.updateById(partner);
        return R.ok();
    }

    @DeleteMapping("/{id}")
    @Log(module = "长期客户", type = Log.OperationType.DELETE)
    public R<Void> remove(@PathVariable Long id) {
        partnerMapper.deleteById(id);
        // 一并逻辑删除该客户的协议价 + 历史合作记录
        priceMapper.delete(new LambdaQueryWrapper<BizPartnerPrice>().eq(BizPartnerPrice::getPartnerId, id));
        historyMapper.delete(new LambdaQueryWrapper<BizPartnerHistory>().eq(BizPartnerHistory::getPartnerId, id));
        return R.ok();
    }

    /* ---------- 协议价明细 ---------- */

    @GetMapping("/{id}/prices")
    public R<List<BizPartnerPrice>> prices(@PathVariable Long id) {
        return R.ok(priceMapper.selectList(new LambdaQueryWrapper<BizPartnerPrice>()
                .eq(BizPartnerPrice::getPartnerId, id)
                .orderByAsc(BizPartnerPrice::getId)));
    }

    @PostMapping("/price")
    @Log(module = "长期客户", type = Log.OperationType.INSERT)
    public R<Void> addPrice(@RequestBody BizPartnerPrice price) {
        if (price.getPartnerId() == null) return R.fail("缺少所属客户");
        priceMapper.insert(price);
        return R.ok();
    }

    @PutMapping("/price")
    @Log(module = "长期客户", type = Log.OperationType.UPDATE)
    public R<Void> editPrice(@RequestBody BizPartnerPrice price) {
        priceMapper.updateById(price);
        return R.ok();
    }

    @DeleteMapping("/price/{id}")
    @Log(module = "长期客户", type = Log.OperationType.DELETE)
    public R<Void> removePrice(@PathVariable Long id) {
        priceMapper.deleteById(id);
        return R.ok();
    }

    /** 查某客户的协议价列表(行内编辑用) */
    @GetMapping("/price/list")
    public R<List<BizPartnerPrice>> priceList(@RequestParam Long partnerId) {
        return R.ok(priceMapper.selectList(new LambdaQueryWrapper<BizPartnerPrice>()
                .eq(BizPartnerPrice::getPartnerId, partnerId)
                .orderByAsc(BizPartnerPrice::getId)));
    }

    /** 批量保存某客户的协议价:先删该客户旧价,再批量插入新价 */
    @PostMapping("/price/batch")
    @Transactional(rollbackFor = Exception.class)
    @Log(module = "长期客户", type = Log.OperationType.UPDATE)
    public R<Void> batchSavePrice(@RequestBody PartnerPriceBatch body) {
        if (body == null || body.getPartnerId() == null) return R.fail("缺少所属客户");
        Long partnerId = body.getPartnerId();
        // 先删该客户旧价(逻辑删除)
        priceMapper.delete(new LambdaQueryWrapper<BizPartnerPrice>()
                .eq(BizPartnerPrice::getPartnerId, partnerId));
        List<BizPartnerPrice> prices = body.getPrices();
        if (prices != null) {
            for (BizPartnerPrice p : prices) {
                if (p == null || !StringUtils.hasText(p.getItemName())) continue;
                p.setId(null);
                p.setPartnerId(partnerId);
                priceMapper.insert(p);
            }
        }
        return R.ok();
    }

    /** 批量保存协议价入参 */
    @lombok.Data
    public static class PartnerPriceBatch {
        private Long partnerId;
        private List<BizPartnerPrice> prices;
    }

    /* ---------- 历史合作记录(按月) ---------- */

    /** 查某客户的历史合作记录(按月倒序) */
    @GetMapping("/{id}/history")
    public R<List<BizPartnerHistory>> history(@PathVariable Long id) {
        return R.ok(historyMapper.selectList(new LambdaQueryWrapper<BizPartnerHistory>()
                .eq(BizPartnerHistory::getPartnerId, id)
                .orderByDesc(BizPartnerHistory::getCoopMonth)
                .orderByDesc(BizPartnerHistory::getId)));
    }

    @PostMapping("/history")
    @Log(module = "长期客户", type = Log.OperationType.INSERT)
    public R<Void> addHistory(@RequestBody BizPartnerHistory h) {
        if (h.getPartnerId() == null) return R.fail("缺少所属客户");
        historyMapper.insert(h);
        return R.ok();
    }

    @PutMapping("/history")
    @Log(module = "长期客户", type = Log.OperationType.UPDATE)
    public R<Void> editHistory(@RequestBody BizPartnerHistory h) {
        historyMapper.updateById(h);
        return R.ok();
    }

    @DeleteMapping("/history/{id}")
    @Log(module = "长期客户", type = Log.OperationType.DELETE)
    public R<Void> removeHistory(@PathVariable Long id) {
        historyMapper.deleteById(id);
        return R.ok();
    }
}

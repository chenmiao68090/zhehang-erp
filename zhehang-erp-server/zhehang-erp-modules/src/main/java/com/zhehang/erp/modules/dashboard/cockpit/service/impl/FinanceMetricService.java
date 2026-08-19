package com.zhehang.erp.modules.dashboard.cockpit.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.zhehang.erp.modules.dashboard.cockpit.domain.vo.CockpitKpiVO;
import com.zhehang.erp.modules.receipt.domain.BizReceipt;
import com.zhehang.erp.modules.receipt.mapper.BizReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.RECEIPT_CONFIRMED;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.Range;
import static com.zhehang.erp.modules.dashboard.cockpit.service.impl.CockpitConstants.growthRate;

/**
 * 驾驶舱财务指标: 回款金额、回款趋势、待确认(逾期)应收。
 *
 * <p>仅被 {@link CockpitServiceImpl} 聚合调用, 故不单独定义接口。</p>
 */
@Service
@RequiredArgsConstructor
class FinanceMetricService {

    private final BizReceiptMapper receiptMapper;

    /** 回款金额(区间内已确认收款合计) + 环比 */
    void fillReceiptKpi(CockpitKpiVO vo, Range cur, Range prev) {
        BigDecimal receiptCur = sumReceiptAmount(cur);
        BigDecimal receiptPrev = sumReceiptAmount(prev);
        vo.setMonthReceipt(receiptCur);
        vo.setReceiptGrowthRate(growthRate(receiptCur.doubleValue(), receiptPrev.doubleValue()));
    }

    /** 区间内已确认收款金额合计 */
    private BigDecimal sumReceiptAmount(Range r) {
        // DB 聚合替代拉全表到内存累加
        QueryWrapper<BizReceipt> qw = new QueryWrapper<>();
        qw.select("COALESCE(SUM(amount), 0) AS total")
          .eq("status", RECEIPT_CONFIRMED)
          .between("create_time", r.start(), r.end());
        List<Map<String, Object>> rows = receiptMapper.selectMaps(qw);
        Object total = rows.isEmpty() ? null : rows.get(0).get("total");
        return total == null ? BigDecimal.ZERO : new BigDecimal(total.toString());
    }

    /**
     * 区间内已确认收款按创建时间分桶累加, 桶键由 fmt 决定(月/日粒度)。
     * 创建时间为空的记录跳过。
     */
    Map<String, BigDecimal> sumConfirmedReceiptAmountByBucket(LocalDateTime start, LocalDateTime end,
                                                              DateTimeFormatter fmt) {
        List<BizReceipt> receipts = receiptMapper.selectList(
                new LambdaQueryWrapper<BizReceipt>()
                        .eq(BizReceipt::getStatus, RECEIPT_CONFIRMED)
                        .between(BizReceipt::getCreateTime, start, end));
        Map<String, BigDecimal> buckets = new LinkedHashMap<>();
        for (BizReceipt re : receipts) {
            if (re.getCreateTime() == null || re.getAmount() == null) continue;
            buckets.merge(re.getCreateTime().toLocalDate().format(fmt), re.getAmount(), BigDecimal::add);
        }
        return buckets;
    }

    /** 逾期应收: 区间内仍处于"待确认"(status=1)的收款记录, 视为未到账 */
    PendingReceiptStat pendingReceiptStat(Range r) {
        List<BizReceipt> pendingReceipts = receiptMapper.selectList(
                new LambdaQueryWrapper<BizReceipt>()
                        .eq(BizReceipt::getStatus, 1)
                        .between(BizReceipt::getCreateTime, r.start(), r.end()));
        BigDecimal overdueAmount = BigDecimal.ZERO;
        for (BizReceipt re : pendingReceipts) {
            if (re.getAmount() != null) overdueAmount = overdueAmount.add(re.getAmount());
        }
        return new PendingReceiptStat(pendingReceipts.size(), overdueAmount);
    }

    /** 待确认收款笔数与金额合计 */
    record PendingReceiptStat(int count, BigDecimal amount) {}
}

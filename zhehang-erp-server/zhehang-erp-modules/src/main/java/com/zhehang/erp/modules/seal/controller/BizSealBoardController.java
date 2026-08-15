package com.zhehang.erp.modules.seal.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.seal.domain.BizSealCost;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealCostMapper;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * 印章业务看板:按月汇算 总收款/总成本/利润/利润率/刻章数量/单章均价/日刻章量/新签。
 * 收款与刻章数量来自提单(biz_seal_order),成本来自刻章成本明细(biz_seal_cost)。
 */
@RestController
@RequestMapping("/seal/board")
@RequiredArgsConstructor
public class BizSealBoardController {

    private final BizSealOrderMapper orderMapper;
    private final BizSealCostMapper costMapper;

    /** 某年各月的看板指标(只返回有提单或有成本的月份) */
    @GetMapping("/summary")
    public R<List<Map<String, Object>>> summary(@RequestParam String year) {
        int y;
        try { y = Integer.parseInt(year); } catch (Exception e) { return R.fail("年份不正确"); }

        List<BizSealOrder> orders = orderMapper.selectList(new LambdaQueryWrapper<BizSealOrder>()
                .ge(BizSealOrder::getRegDate, LocalDate.of(y, 1, 1))
                .le(BizSealOrder::getRegDate, LocalDate.of(y, 12, 31)));
        List<BizSealCost> costs = costMapper.selectList(new LambdaQueryWrapper<BizSealCost>()
                .eq(BizSealCost::getCostYear, year));

        // 每月聚合:[总收款, 刻章数, 新签个数, 新签金额]
        Map<String, double[]> agg = new HashMap<>();
        Map<String, Set<String>> opDays = new HashMap<>();
        for (BizSealOrder o : orders) {
            if (o.getRegDate() == null) continue;
            String m = o.getRegDate().toString().substring(0, 7);
            double[] a = agg.computeIfAbsent(m, k -> new double[4]);
            double fee = o.getFee() == null ? 0 : o.getFee().doubleValue();
            a[0] += fee;
            a[1] += countSeals(o.getSealTypes());
            if ("new".equals(o.getBizType())) { a[2] += 1; a[3] += fee; }
            opDays.computeIfAbsent(m, k -> new HashSet<>()).add(o.getRegDate().toString());
        }
        Map<String, Double> costByMonth = new HashMap<>();
        for (BizSealCost c : costs) {
            if (c.getCostMonth() == null) continue;
            costByMonth.merge(c.getCostMonth(), c.getAmount() == null ? 0 : c.getAmount().doubleValue(), Double::sum);
        }

        Set<String> months = new TreeSet<>();
        months.addAll(agg.keySet());
        months.addAll(costByMonth.keySet());

        List<Map<String, Object>> result = new ArrayList<>();
        for (String m : months) {
            double[] a = agg.getOrDefault(m, new double[4]);
            double revenue = a[0], sealCount = a[1], newCount = a[2], newAmount = a[3];
            double cost = costByMonth.getOrDefault(m, 0.0);
            double profit = revenue - cost;
            int dayCount = opDays.getOrDefault(m, Collections.emptySet()).size();
            Map<String, Object> mm = new LinkedHashMap<>();
            mm.put("month", m);
            mm.put("revenue", round2(revenue));
            mm.put("cost", round2(cost));
            mm.put("profit", round2(profit));
            mm.put("profitRate", revenue > 0 ? round4(profit / revenue) : 0);
            mm.put("sealCount", (int) sealCount);
            mm.put("avgPrice", sealCount > 0 ? round2(revenue / sealCount) : 0);
            mm.put("dailyCount", dayCount > 0 ? round1(sealCount / dayCount) : 0);
            mm.put("newCount", (int) newCount);
            mm.put("newAmount", round2(newAmount));
            result.add(mm);
        }
        return R.ok(result);
    }

    /** 刻章数量 = sealTypes 逗号分隔的非空项数(每个"材质-类型"组合算一枚) */
    private int countSeals(String s) {
        if (s == null || s.isBlank()) return 0;
        int c = 0;
        for (String p : s.split(",")) if (!p.trim().isEmpty()) c++;
        return c;
    }

    private double round1(double v) { return Math.round(v * 10) / 10.0; }
    private double round2(double v) { return Math.round(v * 100) / 100.0; }
    private double round4(double v) { return Math.round(v * 10000) / 10000.0; }
}

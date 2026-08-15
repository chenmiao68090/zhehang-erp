package com.zhehang.erp.modules.finance.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.zhehang.erp.common.core.domain.R;
import com.zhehang.erp.modules.order.domain.BizOrder;
import com.zhehang.erp.modules.order.mapper.BizOrderMapper;
import com.zhehang.erp.modules.seal.domain.BizSealOrder;
import com.zhehang.erp.modules.seal.mapper.BizSealOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 日记账:汇总提单系统(biz_order 财务已确认收款)与刻章业务(biz_seal_order 收费)的收款流水。
 * 纯聚合视图,只读,不落库。
 */
@RestController
@RequestMapping("/finance/journal")
@RequiredArgsConstructor
public class JournalController {

    private final BizOrderMapper orderMapper;
    private final BizSealOrderMapper sealOrderMapper;

    private static final Map<String, String> SEAL_STATUS = Map.of(
            "pending", "待刻", "engraved", "已刻", "mailed", "已邮寄", "done", "完成");

    /**
     * @param startDate yyyy-MM-dd(含)
     * @param endDate   yyyy-MM-dd(含)
     * @param source    bill / seal / 空=全部
     */
    @GetMapping("/list")
    public R<Map<String, Object>> list(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) String keyword) {
        LocalDate start = parse(startDate);
        LocalDate end = parse(endDate);
        List<Map<String, Object>> entries = new ArrayList<>();
        BigDecimal billTotal = BigDecimal.ZERO;
        BigDecimal sealTotal = BigDecimal.ZERO;

        // 提单收款:财务已确认(financeConfirmTime != null)即视为收款,按确认日期入账
        if (!"seal".equals(source)) {
            LambdaQueryWrapper<BizOrder> qw = new LambdaQueryWrapper<BizOrder>()
                    .isNotNull(BizOrder::getFinanceConfirmTime)
                    .like(StringUtils.hasText(keyword), BizOrder::getCustomerName, keyword);
            if (start != null) qw.ge(BizOrder::getFinanceConfirmTime, start.atStartOfDay());
            if (end != null) qw.le(BizOrder::getFinanceConfirmTime, end.atTime(LocalTime.MAX));
            for (BizOrder o : orderMapper.selectList(qw)) {
                BigDecimal amt = o.getPayableAmount() == null ? BigDecimal.ZERO : o.getPayableAmount();
                LocalDateTime t = o.getFinanceConfirmTime();
                entries.add(entry(t == null ? null : t.toLocalDate(), "bill", "提单", o.getCustomerName(), amt, "—", o.getOrderNo(), "已确认收款"));
                billTotal = billTotal.add(amt);
            }
        }

        // 刻章收款:每单收费金额按登记日期入账
        if (!"bill".equals(source)) {
            LambdaQueryWrapper<BizSealOrder> qw = new LambdaQueryWrapper<BizSealOrder>()
                    .gt(BizSealOrder::getFee, BigDecimal.ZERO)
                    .like(StringUtils.hasText(keyword), BizSealOrder::getCompanyName, keyword);
            if (start != null) qw.ge(BizSealOrder::getRegDate, start);
            if (end != null) qw.le(BizSealOrder::getRegDate, end);
            for (BizSealOrder s : sealOrderMapper.selectList(qw)) {
                BigDecimal amt = s.getFee() == null ? BigDecimal.ZERO : s.getFee();
                entries.add(entry(s.getRegDate(), "seal", "刻章", s.getCompanyName(), amt,
                        s.getPayAccount() == null ? "—" : s.getPayAccount(), "刻章登记",
                        SEAL_STATUS.getOrDefault(s.getStatus(), "—")));
                sealTotal = sealTotal.add(amt);
            }
        }

        // 按日期倒序(null 日期排最后)
        entries.sort(Comparator.comparing(
                (Map<String, Object> e) -> (LocalDate) e.get("date"),
                Comparator.nullsLast(Comparator.reverseOrder())));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("entries", entries);
        result.put("billTotal", billTotal);
        result.put("sealTotal", sealTotal);
        result.put("total", billTotal.add(sealTotal));
        result.put("count", entries.size());
        return R.ok(result);
    }

    private Map<String, Object> entry(LocalDate date, String source, String sourceLabel,
                                      String company, BigDecimal amount, String account, String ref, String status) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("date", date);
        m.put("source", source);
        m.put("sourceLabel", sourceLabel);
        m.put("company", company);
        m.put("amount", amount);
        m.put("account", account);
        m.put("ref", ref);
        m.put("status", status);
        return m;
    }

    private LocalDate parse(String s) {
        if (!StringUtils.hasText(s)) return null;
        try { return LocalDate.parse(s); } catch (Exception e) { return null; }
    }
}

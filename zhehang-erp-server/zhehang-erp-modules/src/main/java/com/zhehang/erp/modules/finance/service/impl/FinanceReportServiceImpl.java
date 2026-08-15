package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zhehang.erp.modules.finance.domain.entity.FinanceLedger;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReport;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucher;
import com.zhehang.erp.modules.finance.domain.entity.FinanceVoucherEntry;
import com.zhehang.erp.modules.finance.mapper.FinanceLedgerMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceReportMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherEntryMapper;
import com.zhehang.erp.modules.finance.mapper.FinanceVoucherMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * 财务报表服务:三大报表(资产负债表/利润表/现金流量表)均由总账 finance_ledger
 * 与已过账凭证分录真实聚合,按中国会计科目编码规则(1资产/2负债/3共同/4权益/5成本/6损益)归类。
 */
@Service
@RequiredArgsConstructor
public class FinanceReportServiceImpl extends ServiceImpl<FinanceReportMapper, FinanceReport> implements IFinanceReportService {

    private final FinanceLedgerMapper ledgerMapper;
    private final FinanceVoucherMapper voucherMapper;
    private final FinanceVoucherEntryMapper entryMapper;
    private static final ObjectMapper JSON = new ObjectMapper();

    public IPage<FinanceReport> selectPage(Integer pageNum, Integer pageSize) {
        return page(new Page<>(pageNum, pageSize),
                new LambdaQueryWrapper<FinanceReport>().orderByDesc(FinanceReport::getCreateTime));
    }

    /** 生成报表:实时计算指定类型报表并把数据快照存入 dataJson,便于历史留档。 */
    public void generateReport(String reportType, String period) {
        List<Map<String, Object>> data;
        String name;
        if ("incomeStatement".equals(reportType)) {
            data = getIncomeStatement(period);
            name = "利润表";
        } else if ("cashFlow".equals(reportType)) {
            data = getCashFlow(period);
            name = "现金流量表";
        } else {
            reportType = "balanceSheet";
            data = getBalanceSheet(period);
            name = "资产负债表";
        }
        FinanceReport report = new FinanceReport();
        report.setReportName(name + (StringUtils.hasText(period) ? " " + period : ""));
        report.setReportType(reportType);
        report.setPeriod(period);
        try {
            report.setDataJson(JSON.writeValueAsString(data));
        } catch (Exception e) {
            report.setDataJson("[]");
        }
        report.setStatus(1);
        save(report);
    }

    // ==================== 资产负债表 ====================
    public List<Map<String, Object>> getBalanceSheet(String period) {
        List<FinanceLedger> ledgers = loadLedger(period);
        if (ledgers.isEmpty()) return Collections.emptyList();
        List<FinanceLedger> sorted = ledgers.stream()
                .sorted(Comparator.comparing(FinanceLedger::getSubjectCode))
                .collect(Collectors.toList());
        BigDecimal netProfit = computeNetProfit(ledgers);

        List<Map<String, Object>> assets = new ArrayList<>();
        List<Map<String, Object>> liabs = new ArrayList<>();
        List<Map<String, Object>> equities = new ArrayList<>();
        BigDecimal assetTotal = BigDecimal.ZERO, liabTotal = BigDecimal.ZERO, equityTotal = BigDecimal.ZERO;
        for (FinanceLedger l : sorted) {
            String code = l.getSubjectCode();
            if (code == null) continue;
            BigDecimal end = nz(l.getClosingBalance());
            BigDecimal begin = nz(l.getOpeningBalance());
            if (code.startsWith("1")) {
                assets.add(itemRow("  " + l.getSubjectName(), end, begin));
                assetTotal = assetTotal.add(end);
            } else if (code.startsWith("2")) {
                liabs.add(itemRow("  " + l.getSubjectName(), end, begin));
                liabTotal = liabTotal.add(end);
            } else if (code.startsWith("3") || code.startsWith("4")) {
                equities.add(itemRow("  " + l.getSubjectName(), end, begin));
                equityTotal = equityTotal.add(end);
            }
        }
        // 本期净利润计入所有者权益(未分配利润)
        equities.add(itemRow("  未分配利润", netProfit, BigDecimal.ZERO));
        equityTotal = equityTotal.add(netProfit);

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(itemRow("一、资产合计", assetTotal, BigDecimal.ZERO));
        rows.addAll(assets);
        rows.add(itemRow("二、负债合计", liabTotal, BigDecimal.ZERO));
        rows.addAll(liabs);
        rows.add(itemRow("三、所有者权益合计", equityTotal, BigDecimal.ZERO));
        rows.addAll(equities);
        rows.add(itemRow("负债和所有者权益总计", liabTotal.add(equityTotal), BigDecimal.ZERO));
        return rows;
    }

    // ==================== 利润表 ====================
    public List<Map<String, Object>> getIncomeStatement(String period) {
        List<FinanceLedger> ledgers = loadLedger(period);
        if (ledgers.isEmpty()) return Collections.emptyList();

        BigDecimal revenue = sumCredit(ledgers, "6001", "6051");
        BigDecimal cost = sumDebit(ledgers, "6401", "6402");
        BigDecimal taxSur = sumDebit(ledgers, "6403");
        BigDecimal sellExp = sumDebit(ledgers, "6601");
        BigDecimal admExp = sumDebit(ledgers, "6602");
        BigDecimal finExp = sumDebit(ledgers, "6603");
        BigDecimal nonOpInc = sumCredit(ledgers, "6301");
        BigDecimal nonOpExp = sumDebit(ledgers, "6711");
        BigDecimal incomeTax = sumDebit(ledgers, "6801");

        BigDecimal opProfit = revenue.subtract(cost).subtract(taxSur)
                .subtract(sellExp).subtract(admExp).subtract(finExp);
        BigDecimal totalProfit = opProfit.add(nonOpInc).subtract(nonOpExp);
        BigDecimal netProfit = totalProfit.subtract(incomeTax);

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(incomeRow("一、营业收入", revenue));
        rows.add(incomeRow("  减:营业成本", cost));
        rows.add(incomeRow("  减:税金及附加", taxSur));
        rows.add(incomeRow("  减:销售费用", sellExp));
        rows.add(incomeRow("  减:管理费用", admExp));
        rows.add(incomeRow("  减:财务费用", finExp));
        rows.add(incomeRow("二、营业利润", opProfit));
        rows.add(incomeRow("  加:营业外收入", nonOpInc));
        rows.add(incomeRow("  减:营业外支出", nonOpExp));
        rows.add(incomeRow("三、利润总额", totalProfit));
        rows.add(incomeRow("  减:所得税费用", incomeTax));
        rows.add(incomeRow("四、净利润", netProfit));
        return rows;
    }

    // ==================== 现金流量表 ====================
    public List<Map<String, Object>> getCashFlow(String period) {
        LambdaQueryWrapper<FinanceVoucher> vw = new LambdaQueryWrapper<>();
        vw.eq(FinanceVoucher::getStatus, 2)
          .eq(StringUtils.hasText(period), FinanceVoucher::getPeriod, period);
        List<FinanceVoucher> vouchers = voucherMapper.selectList(vw);
        if (vouchers.isEmpty()) return Collections.emptyList();

        List<Long> vids = vouchers.stream().map(FinanceVoucher::getId).collect(Collectors.toList());
        List<FinanceVoucherEntry> allEntries = entryMapper.selectList(
                new LambdaQueryWrapper<FinanceVoucherEntry>().in(FinanceVoucherEntry::getVoucherId, vids));
        Map<Long, List<FinanceVoucherEntry>> byVoucher = new HashMap<>();
        for (FinanceVoucherEntry e : allEntries) {
            byVoucher.computeIfAbsent(e.getVoucherId(), k -> new ArrayList<>()).add(e);
        }

        BigDecimal saleIn = BigDecimal.ZERO, otherOpIn = BigDecimal.ZERO, opOut = BigDecimal.ZERO;
        BigDecimal salaryOut = BigDecimal.ZERO, taxOut = BigDecimal.ZERO;
        BigDecimal investIn = BigDecimal.ZERO, investOut = BigDecimal.ZERO;
        BigDecimal financeIn = BigDecimal.ZERO, financeOut = BigDecimal.ZERO;
        for (FinanceVoucher v : vouchers) {
            List<FinanceVoucherEntry> es = byVoucher.getOrDefault(v.getId(), Collections.emptyList());
            // 同一凭证里第一个非现金科目作为资金用途判定的对方科目
            String counter = es.stream().filter(x -> !isCash(x.getSubjectCode()))
                    .map(FinanceVoucherEntry::getSubjectCode).findFirst().orElse("");
            for (FinanceVoucherEntry cashE : es) {
                if (!isCash(cashE.getSubjectCode())) continue;
                BigDecimal inflow = nz(cashE.getDebitAmount());
                BigDecimal outflow = nz(cashE.getCreditAmount());
                if (inflow.signum() > 0) {
                    if (counter.startsWith("6")) saleIn = saleIn.add(inflow);
                    else if (counter.startsWith("4") || counter.startsWith("2001")) financeIn = financeIn.add(inflow);
                    else if (isLongAsset(counter)) investIn = investIn.add(inflow);
                    else otherOpIn = otherOpIn.add(inflow);
                }
                if (outflow.signum() > 0) {
                    if (isLongAsset(counter)) investOut = investOut.add(outflow);
                    else if (counter.startsWith("4") || counter.startsWith("2001")) financeOut = financeOut.add(outflow);
                    else if (counter.startsWith("2211")) salaryOut = salaryOut.add(outflow);
                    else if (counter.startsWith("2221")) taxOut = taxOut.add(outflow);
                    else opOut = opOut.add(outflow);
                }
            }
        }
        BigDecimal opNet = saleIn.add(otherOpIn).subtract(opOut).subtract(salaryOut).subtract(taxOut);
        BigDecimal investNet = investIn.subtract(investOut);
        BigDecimal financeNet = financeIn.subtract(financeOut);
        BigDecimal netInc = opNet.add(investNet).add(financeNet);

        List<Map<String, Object>> rows = new ArrayList<>();
        rows.add(cashRow("一、经营活动产生的现金流量净额", opNet));
        rows.add(cashRow("  销售商品、提供劳务收到的现金", saleIn));
        rows.add(cashRow("  收到的其他与经营活动有关的现金", otherOpIn));
        rows.add(cashRow("  购买商品、接受劳务支付的现金", opOut));
        rows.add(cashRow("  支付给职工以及为职工支付的现金", salaryOut));
        rows.add(cashRow("  支付的各项税费", taxOut));
        rows.add(cashRow("二、投资活动产生的现金流量净额", investNet));
        rows.add(cashRow("  购建固定资产等支付的现金", investOut));
        rows.add(cashRow("  处置资产等收回的现金", investIn));
        rows.add(cashRow("三、筹资活动产生的现金流量净额", financeNet));
        rows.add(cashRow("  吸收投资收到的现金", financeIn));
        rows.add(cashRow("  分配股利、偿还债务支付的现金", financeOut));
        rows.add(cashRow("四、现金及现金等价物净增加额", netInc));
        return rows;
    }

    // ==================== 内部辅助 ====================
    private List<FinanceLedger> loadLedger(String period) {
        LambdaQueryWrapper<FinanceLedger> w = new LambdaQueryWrapper<>();
        w.eq(StringUtils.hasText(period), FinanceLedger::getPeriod, period);
        return ledgerMapper.selectList(w);
    }

    /** 本期净利润 = 收入类贷方净额 - 成本费用类借方净额。 */
    private BigDecimal computeNetProfit(List<FinanceLedger> ledgers) {
        BigDecimal rev = sumCredit(ledgers, "6001", "6051", "6301");
        BigDecimal exp = sumDebit(ledgers, "6401", "6402", "6403", "6601", "6602", "6603", "6711", "6801");
        return rev.subtract(exp);
    }

    private BigDecimal sumCredit(List<FinanceLedger> ls, String... prefixes) {
        return ls.stream().filter(l -> anyPrefix(l.getSubjectCode(), prefixes))
                .map(l -> nz(l.getCreditTotal()).subtract(nz(l.getDebitTotal())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumDebit(List<FinanceLedger> ls, String... prefixes) {
        return ls.stream().filter(l -> anyPrefix(l.getSubjectCode(), prefixes))
                .map(l -> nz(l.getDebitTotal()).subtract(nz(l.getCreditTotal())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private boolean anyPrefix(String code, String... prefixes) {
        if (code == null) return false;
        for (String p : prefixes) if (code.startsWith(p)) return true;
        return false;
    }

    private boolean isCash(String code) {
        return code != null && (code.startsWith("1001") || code.startsWith("1002"));
    }

    private boolean isLongAsset(String code) {
        return code != null && (code.startsWith("15") || code.startsWith("16") || code.startsWith("17"));
    }

    private BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private Map<String, Object> itemRow(String item, BigDecimal end, BigDecimal begin) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("item", item);
        m.put("endBalance", end);
        m.put("beginBalance", begin);
        return m;
    }

    private Map<String, Object> incomeRow(String item, BigDecimal amount) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("item", item);
        m.put("currentAmount", amount);
        m.put("cumulativeAmount", amount);
        return m;
    }

    private Map<String, Object> cashRow(String item, BigDecimal amount) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("item", item);
        m.put("currentAmount", amount);
        return m;
    }
}

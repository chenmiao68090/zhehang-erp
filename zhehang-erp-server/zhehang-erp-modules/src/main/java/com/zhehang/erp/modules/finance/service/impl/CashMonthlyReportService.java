package com.zhehang.erp.modules.finance.service.impl;

import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.finance.mapper.CashMonthlyReportMapper;
import com.zhehang.erp.modules.finance.mapper.FinCashMatchMapper;
import com.zhehang.erp.modules.finance.mapper.FinReceivableRenewalMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 月结统一经营口径及无额外依赖的 Excel 2003 XML 导出。 */
@Service
@RequiredArgsConstructor
public class CashMonthlyReportService {
    private final CashMonthlyReportMapper reportMapper;
    private final FinCashMatchMapper matchMapper;
    private final FinReceivableRenewalMapper receivableMapper;

    public Map<String, Object> report(String monthValue) {
        requireManager();
        YearMonth month = parseMonth(monthValue);
        LocalDate start = month.atDay(1);
        LocalDate end = month.plusMonths(1).atDay(1);

        Map<String, Object> summary = safeMap(reportMapper.selectReceiptSummary(start, end));
        List<Map<String, Object>> income = safeList(matchMapper.selectMonthlyStructure(start, end));
        BigDecimal monthMatched = money(summary.get("monthMatched"));
        for (Map<String, Object> row : income) {
            BigDecimal amount = money(row.get("amount"));
            row.put("percent", monthMatched.signum() == 0 ? BigDecimal.ZERO
                    : amount.multiply(new BigDecimal("100")).divide(monthMatched, 2, RoundingMode.HALF_UP));
        }

        Map<String, Object> movement = safeMap(reportMapper.selectUnmatchedMovement(start, end));
        movement.putAll(safeMap(reportMapper.selectResolvedBacklog(start, end)));
        Map<String, Object> exception = safeMap(reportMapper.selectExceptionSummary(start, end));
        Map<String, Object> close = safeMap(reportMapper.selectDailyCloseSummary(start, end));
        Map<String, Object> risk = safeMap(receivableMapper.selectRiskSummary(LocalDate.now()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("month", month.toString());
        result.put("generatedAt", LocalDateTime.now());
        result.put("summary", summary);
        result.put("incomeStructure", income);
        result.put("fundNatureStructure", safeList(reportMapper.selectFundNatureStructure(start, end)));
        result.put("accountStructure", safeList(reportMapper.selectAccountStructure(start, end)));
        result.put("methodStructure", safeList(reportMapper.selectMethodStructure(start, end)));
        result.put("unmatchedMovement", movement);
        result.put("exceptionSummary", exception);
        result.put("dailyCloseSummary", close);
        result.put("receivableRisk", risk);
        result.put("reportText", buildBossReport(month, summary, income, exception, close, risk));
        result.put("reconstructionNote", "月初/月末未核销按当前有效收款与核销关系重建，未核销金额不会计入业务收入。");
        return result;
    }

    public void exportExcel(String monthValue, HttpServletResponse response) {
        Map<String, Object> data = report(monthValue);
        String month = String.valueOf(data.get("month"));
        String filename = "收款月结报告-" + month + ".xls";
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/vnd.ms-excel;charset=UTF-8");
        response.setHeader("Content-Disposition", "attachment; filename*=UTF-8''"
                + URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20"));
        try {
            response.getOutputStream().write(workbook(data).getBytes(StandardCharsets.UTF_8));
            response.getOutputStream().flush();
        } catch (IOException e) {
            throw new BusinessException("月结报告导出失败");
        }
    }

    @SuppressWarnings("unchecked")
    private String workbook(Map<String, Object> data) {
        Map<String, Object> summary = (Map<String, Object>) data.get("summary");
        Map<String, Object> movement = (Map<String, Object>) data.get("unmatchedMovement");
        Map<String, Object> exception = (Map<String, Object>) data.get("exceptionSummary");
        Map<String, Object> close = (Map<String, Object>) data.get("dailyCloseSummary");
        Map<String, Object> risk = (Map<String, Object>) data.get("receivableRisk");
        List<Map<String, Object>> income = (List<Map<String, Object>>) data.get("incomeStructure");
        List<Map<String, Object>> accounts = (List<Map<String, Object>>) data.get("accountStructure");
        List<Map<String, Object>> methods = (List<Map<String, Object>>) data.get("methodStructure");

        StringBuilder out = new StringBuilder(12000);
        out.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>")
                .append("<?mso-application progid=\"Excel.Sheet\"?>")
                .append("<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\" ")
                .append("xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\">")
                .append("<Styles><Style ss:ID=\"Header\"><Font ss:Bold=\"1\"/><Interior ss:Color=\"#E8F0FE\" ss:Pattern=\"Solid\"/></Style>")
                .append("<Style ss:ID=\"Money\"><NumberFormat ss:Format=\"¥#,##0.00\"/></Style></Styles>");

        List<List<Object>> overview = new ArrayList<>();
        overview.add(List.of("指标", "数值"));
        overview.add(List.of("月份", data.get("month")));
        overview.add(List.of("到账笔数", value(summary, "monthCount")));
        overview.add(List.of("到账金额", money(summary.get("monthAmount"))));
        overview.add(List.of("已核销", money(summary.get("monthMatched"))));
        overview.add(List.of("未核销", money(summary.get("monthUnmatched"))));
        overview.add(List.of("月初未核销", money(movement.get("monthStartUnmatched"))));
        overview.add(List.of("本月新增未核销", money(movement.get("monthNewUnmatched"))));
        overview.add(List.of("本月解决历史未核销", money(movement.get("monthResolvedUnmatched"))));
        overview.add(List.of("月末未核销", money(movement.get("monthEndUnmatched"))));
        overview.add(List.of("逾期未收", money(risk.get("overdueAmount"))));
        overview.add(List.of("坏账风险", money(risk.get("badRiskAmount"))));
        overview.add(List.of("老板摘要", data.get("reportText")));
        sheet(out, "经营总览", overview);

        sheet(out, "收入结构", tableRows(income, List.of("业务类型", "核销金额", "占比%"),
                List.of("bizType", "amount", "percent")));
        sheet(out, "账户结构", tableRows(accounts, List.of("收款账户", "笔数", "到账金额"),
                List.of("name", "count", "amount")));
        sheet(out, "收款方式", tableRows(methods, List.of("收款方式", "笔数", "到账金额"),
                List.of("name", "count", "amount")));

        List<List<Object>> risks = new ArrayList<>();
        risks.add(List.of("风险指标", "数值"));
        risks.add(List.of("异常新增", value(exception, "createdCount")));
        risks.add(List.of("异常已解决", value(exception, "resolvedCount")));
        risks.add(List.of("未解决异常", value(exception, "unresolvedCount")));
        risks.add(List.of("未解决P0", value(exception, "unresolvedP0Count")));
        risks.add(List.of("平均处理小时", value(exception, "averageResolveHours")));
        risks.add(List.of("日结差异次数", value(close, "differenceCount")));
        risks.add(List.of("未解决日结差异", value(close, "unresolvedDifferenceCount")));
        risks.add(List.of("差异绝对金额", money(close.get("differenceAmount"))));
        sheet(out, "风险与异常", risks);
        out.append("</Workbook>");
        return out.toString();
    }

    private void sheet(StringBuilder out, String name, List<List<Object>> rows) {
        out.append("<Worksheet ss:Name=\"").append(xml(name)).append("\"><Table>");
        for (int r = 0; r < rows.size(); r++) {
            out.append("<Row>");
            for (Object cell : rows.get(r)) {
                boolean number = cell instanceof Number;
                out.append("<Cell");
                if (r == 0) out.append(" ss:StyleID=\"Header\"");
                else if (cell instanceof BigDecimal) out.append(" ss:StyleID=\"Money\"");
                out.append("><Data ss:Type=\"").append(number ? "Number" : "String").append("\">")
                        .append(xml(cell == null ? "" : String.valueOf(cell)))
                        .append("</Data></Cell>");
            }
            out.append("</Row>");
        }
        out.append("</Table></Worksheet>");
    }

    private List<List<Object>> tableRows(List<Map<String, Object>> rows, List<String> headers, List<String> keys) {
        List<List<Object>> table = new ArrayList<>();
        table.add(new ArrayList<>(headers));
        for (Map<String, Object> row : rows) {
            List<Object> line = new ArrayList<>();
            for (String key : keys) line.add(row.get(key));
            table.add(line);
        }
        return table;
    }

    private String buildBossReport(YearMonth month,
                                   Map<String, Object> summary,
                                   List<Map<String, Object>> income,
                                   Map<String, Object> exception,
                                   Map<String, Object> close,
                                   Map<String, Object> risk) {
        Map<String, BigDecimal> structure = new LinkedHashMap<>();
        for (Map<String, Object> row : income) structure.put(String.valueOf(row.get("bizType")), money(row.get("amount")));
        return month + " 实际到账 ¥" + money(summary.get("monthAmount")) + "，共 " + value(summary, "monthCount")
                + " 笔；已核销 ¥" + money(summary.get("monthMatched")) + "，未核销 ¥" + money(summary.get("monthUnmatched"))
                + "；其中代账 ¥" + structure.getOrDefault("bookkeeping", BigDecimal.ZERO)
                + "、地址 ¥" + structure.getOrDefault("address", BigDecimal.ZERO)
                + "、工商 ¥" + structure.getOrDefault("gs", BigDecimal.ZERO)
                + "、刻章 ¥" + structure.getOrDefault("seal", BigDecimal.ZERO)
                + "、回款续费 ¥" + structure.getOrDefault("receivable", BigDecimal.ZERO)
                + "。当前逾期应收 ¥" + money(risk.get("overdueAmount")) + "，坏账风险 ¥" + money(risk.get("badRiskAmount"))
                + "。未解决异常 " + value(exception, "unresolvedCount") + " 笔，其中 P0 " + value(exception, "unresolvedP0Count")
                + " 笔；日结差异 " + value(close, "differenceCount") + " 次，未解决 " + value(close, "unresolvedDifferenceCount") + " 次。";
    }

    private YearMonth parseMonth(String value) {
        try {
            return StringUtils.hasText(value) ? YearMonth.parse(value.trim()) : YearMonth.now();
        } catch (Exception e) {
            throw new BusinessException("月份格式应为 yyyy-MM");
        }
    }

    private void requireManager() {
        if (!(SecurityUtils.isCurrentAdmin() || SecurityUtils.hasAnyRole("finance_hq", "boss"))) {
            throw new BusinessException("仅财务负责人/老板/管理员可查看全量月结报告");
        }
    }

    private Map<String, Object> safeMap(Map<String, Object> value) {
        return value == null ? new LinkedHashMap<>() : new LinkedHashMap<>(value);
    }

    private List<Map<String, Object>> safeList(List<Map<String, Object>> value) {
        return value == null ? new ArrayList<>() : new ArrayList<>(value);
    }

    private BigDecimal money(Object value) {
        try {
            return value == null ? BigDecimal.ZERO : new BigDecimal(String.valueOf(value)).setScale(2, RoundingMode.HALF_UP);
        } catch (NumberFormatException e) {
            return BigDecimal.ZERO;
        }
    }

    private Object value(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value == null ? 0 : value;
    }

    private String xml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace("\"", "&quot;").replace("'", "&apos;");
    }
}

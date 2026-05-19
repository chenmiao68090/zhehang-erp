package com.zhehang.erp.modules.finance.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.modules.finance.domain.entity.FinanceReport;
import com.zhehang.erp.modules.finance.mapper.FinanceReportMapper;
import com.zhehang.erp.modules.finance.service.IFinanceReportService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class FinanceReportServiceImpl extends ServiceImpl<FinanceReportMapper, FinanceReport> implements IFinanceReportService {

    public IPage<FinanceReport> selectPage(Integer pageNum, Integer pageSize) {
        return page(new Page<>(pageNum, pageSize), new LambdaQueryWrapper<FinanceReport>().orderByDesc(FinanceReport::getCreateTime));
    }

    public void generateReport(String reportType, String period) {
        FinanceReport report = new FinanceReport();
        report.setReportName(reportType + " - " + period);
        report.setReportType(reportType);
        report.setPeriod(period);
        report.setDataJson("{}");
        report.setStatus(1);
        save(report);
    }

    public List<Map<String, Object>> getBalanceSheet(String period) {
        // Calculate from ledger data - placeholder
        return Collections.emptyList();
    }

    public List<Map<String, Object>> getIncomeStatement(String period) {
        return Collections.emptyList();
    }

    public List<Map<String, Object>> getCashFlow(String period) {
        return Collections.emptyList();
    }
}

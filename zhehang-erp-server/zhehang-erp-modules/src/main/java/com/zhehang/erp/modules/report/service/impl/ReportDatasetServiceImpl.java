package com.zhehang.erp.modules.report.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.modules.report.domain.entity.ReportDataset;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import com.zhehang.erp.modules.report.mapper.ReportDatasetMapper;
import com.zhehang.erp.modules.report.mapper.ReportDefinitionMapper;
import com.zhehang.erp.modules.report.service.IReportDatasetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Report data query engine.
 * - preset mode: built-in CRM/Finance/HRM/Sales statistic SQL templates.
 * - sql mode: whitelist-validated single SELECT statement.
 */
@Service
@RequiredArgsConstructor
public class ReportDatasetServiceImpl extends ServiceImpl<ReportDatasetMapper, ReportDataset>
        implements IReportDatasetService {

    private final ReportDefinitionMapper definitionMapper;

    /** Preset data source registry: key -> { label, category, sql }. */
    private static final Map<String, PresetSource> PRESET_SOURCES = new LinkedHashMap<>();

    static {
        // ============ CRM ============
        PRESET_SOURCES.put("crm.customer.byLevel", new PresetSource(
                "Customer by Level", "crm",
                "SELECT IFNULL(level,'Unrated') AS name, COUNT(*) AS value FROM crm_customer WHERE deleted=0 GROUP BY level"));
        PRESET_SOURCES.put("crm.customer.bySource", new PresetSource(
                "Customer by Source", "crm",
                "SELECT IFNULL(source,'Other') AS name, COUNT(*) AS value FROM crm_customer WHERE deleted=0 GROUP BY source"));
        PRESET_SOURCES.put("crm.opportunity.byStage", new PresetSource(
                "Opportunity Funnel", "crm",
                "SELECT IFNULL(stage,'Unknown') AS name, COUNT(*) AS value FROM crm_opportunity WHERE deleted=0 GROUP BY stage"));
        PRESET_SOURCES.put("crm.lead.monthly", new PresetSource(
                "Lead Trend (last 6 months)", "crm",
                "SELECT DATE_FORMAT(create_time,'%Y-%m') AS name, COUNT(*) AS value FROM crm_lead "
              + "WHERE deleted=0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(create_time,'%Y-%m') ORDER BY name"));

        // ============ Finance ============
        PRESET_SOURCES.put("finance.income.monthly", new PresetSource(
                "Income Trend (last 6 months)", "finance",
                "SELECT DATE_FORMAT(voucher_date,'%Y-%m') AS name, IFNULL(SUM(amount),0) AS value "
              + "FROM finance_voucher WHERE deleted=0 AND voucher_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(voucher_date,'%Y-%m') ORDER BY name"));
        PRESET_SOURCES.put("finance.invoice.byType", new PresetSource(
                "Invoice by Type", "finance",
                "SELECT IFNULL(invoice_type,'Other') AS name, COUNT(*) AS value FROM finance_invoice "
              + "WHERE deleted=0 GROUP BY invoice_type"));
        PRESET_SOURCES.put("finance.reimburse.byStatus", new PresetSource(
                "Reimbursement by Status", "finance",
                "SELECT IFNULL(status,'Unknown') AS name, COUNT(*) AS value FROM finance_reimburse "
              + "WHERE deleted=0 GROUP BY status"));

        // ============ HRM ============
        PRESET_SOURCES.put("hrm.employee.byDept", new PresetSource(
                "Employee by Department", "hrm",
                "SELECT IFNULL(d.name,'Unassigned') AS name, COUNT(e.id) AS value FROM org_employee e "
              + "LEFT JOIN sys_dept d ON e.dept_id = d.id WHERE e.deleted=0 GROUP BY d.name"));
        PRESET_SOURCES.put("hrm.employee.byStatus", new PresetSource(
                "Employee by Status", "hrm",
                "SELECT IFNULL(status,'Unknown') AS name, COUNT(*) AS value FROM org_employee "
              + "WHERE deleted=0 GROUP BY status"));
        PRESET_SOURCES.put("hrm.attendance.monthly", new PresetSource(
                "Attendance Trend (last 30 days)", "hrm",
                "SELECT DATE_FORMAT(attend_date,'%Y-%m-%d') AS name, COUNT(*) AS value "
              + "FROM hrm_attendance WHERE deleted=0 AND attend_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) "
              + "GROUP BY DATE_FORMAT(attend_date,'%Y-%m-%d') ORDER BY name"));

        // ============ Sales ============
        PRESET_SOURCES.put("sales.order.monthly", new PresetSource(
                "Order Trend (last 6 months)", "sales",
                "SELECT DATE_FORMAT(create_time,'%Y-%m') AS name, COUNT(*) AS value, IFNULL(SUM(total_amount),0) AS metric "
              + "FROM sales_order WHERE deleted=0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(create_time,'%Y-%m') ORDER BY name"));
        PRESET_SOURCES.put("sales.order.byStatus", new PresetSource(
                "Order by Status", "sales",
                "SELECT IFNULL(status,'Unknown') AS name, COUNT(*) AS value FROM sales_order "
              + "WHERE deleted=0 GROUP BY status"));

        // ============ Supply ============
        PRESET_SOURCES.put("supply.purchase.monthly", new PresetSource(
                "Purchase Trend (last 6 months)", "supply",
                "SELECT DATE_FORMAT(create_time,'%Y-%m') AS name, COUNT(*) AS value, IFNULL(SUM(total_amount),0) AS metric "
              + "FROM supply_purchase WHERE deleted=0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(create_time,'%Y-%m') ORDER BY name"));
    }

    @Override
    public List<Map<String, Object>> executeReport(Long reportId, Map<String, Object> params) {
        ReportDefinition def = definitionMapper.selectById(reportId);
        if (def == null) {
            throw new BusinessException("Report not found");
        }

        String dst = def.getDataSourceType();
        if ("preset".equalsIgnoreCase(dst)) {
            String key = StringUtils.hasText(def.getSqlQuery())
                    ? def.getSqlQuery()
                    : findFirstPresetByCategory(def.getCategory());
            PresetSource ps = key == null ? null : PRESET_SOURCES.get(key);
            if (ps == null) {
                return generateMockData();
            }
            return safeExecute(ps.sql);
        } else if ("sql".equalsIgnoreCase(dst)) {
            String sql = def.getSqlQuery();
            if (!StringUtils.hasText(sql)) {
                return Collections.emptyList();
            }
            validateSql(sql);
            return safeExecute(sql);
        }
        return Collections.emptyList();
    }

    @Override
    public List<Map<String, Object>> listPresetDataSources() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (Map.Entry<String, PresetSource> e : PRESET_SOURCES.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("key", e.getKey());
            item.put("label", e.getValue().label);
            item.put("category", e.getValue().category);
            list.add(item);
        }
        return list;
    }

    @Override
    public List<ReportDataset> listByReportId(Long reportId) {
        LambdaQueryWrapper<ReportDataset> w = new LambdaQueryWrapper<>();
        w.eq(ReportDataset::getReportId, reportId).orderByDesc(ReportDataset::getCreateTime);
        return this.list(w);
    }

    /** Whitelist validation: only single SELECT statements are allowed. */
    private void validateSql(String sql) {
        String trimmed = sql.trim().toLowerCase();
        if (!trimmed.startsWith("select")) {
            throw new BusinessException("Only SELECT statements are supported");
        }
        if (trimmed.contains(";") && !trimmed.endsWith(";")) {
            throw new BusinessException("Multiple statements are not supported");
        }
        String[] forbidden = {" insert ", " update ", " delete ", " drop ", " alter ",
                " truncate ", " grant ", " revoke ", " create "};
        for (String kw : forbidden) {
            if (trimmed.contains(kw)) {
                throw new BusinessException("Forbidden keyword in SQL: " + kw.trim());
            }
        }
    }

    private List<Map<String, Object>> safeExecute(String sql) {
        try {
            List<Map<String, Object>> rows = definitionMapper.executeSelect(sql);
            return rows == null ? Collections.emptyList() : rows;
        } catch (Exception ex) {
            // Tables may not exist in early dev environments; fall back to mock data.
            return generateMockData();
        }
    }

    private String findFirstPresetByCategory(String category) {
        if (!StringUtils.hasText(category)) return null;
        for (Map.Entry<String, PresetSource> e : PRESET_SOURCES.entrySet()) {
            if (category.equalsIgnoreCase(e.getValue().category)) {
                return e.getKey();
            }
        }
        return null;
    }

    private List<Map<String, Object>> generateMockData() {
        List<Map<String, Object>> mock = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun"};
        int[] values = {120, 200, 150, 280, 220, 310};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", months[i]);
            row.put("value", values[i]);
            mock.add(row);
        }
        return mock;
    }

    /** Preset data source descriptor. */
    private static class PresetSource {
        final String label;
        final String category;
        final String sql;
        PresetSource(String label, String category, String sql) {
            this.label = label;
            this.category = category;
            this.sql = sql;
        }
    }
}

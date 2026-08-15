package com.zhehang.erp.modules.report.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zhehang.erp.common.core.exception.BusinessException;
import com.zhehang.erp.common.core.utils.SecurityUtils;
import com.zhehang.erp.modules.report.domain.entity.ReportDataset;
import com.zhehang.erp.modules.report.domain.entity.ReportDefinition;
import com.zhehang.erp.modules.report.mapper.ReportDatasetMapper;
import com.zhehang.erp.modules.report.mapper.ReportDefinitionMapper;
import com.zhehang.erp.modules.report.service.IReportDatasetService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.*;

/**
 * Report data query engine.
 * - preset mode: built-in CRM/Finance/HRM/Sales statistic SQL templates.
 * - sql mode: whitelist-validated single SELECT statement.
 */
@Service
@Slf4j
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
                "SELECT DATE_FORMAT(receipt_date,'%Y-%m') AS name, IFNULL(SUM(amount),0) AS value "
              + "FROM fin_cash_journal WHERE deleted=0 AND record_status='active' "
              + "AND receipt_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(receipt_date,'%Y-%m') ORDER BY name"));
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
                "SELECT IFNULL(d.dept_name,'Unassigned') AS name, COUNT(e.id) AS value FROM org_employee e "
              + "LEFT JOIN sys_dept d ON e.dept_id = d.id AND d.deleted=0 "
              + "WHERE e.deleted=0 GROUP BY d.dept_name"));
        PRESET_SOURCES.put("hrm.employee.byStatus", new PresetSource(
                "Employee by Status", "hrm",
                "SELECT IFNULL(status,'Unknown') AS name, COUNT(*) AS value FROM org_employee "
              + "WHERE deleted=0 GROUP BY status"));
        PRESET_SOURCES.put("hrm.attendance.monthly", new PresetSource(
                "Attendance Trend (last 30 days)", "hrm",
                "SELECT DATE_FORMAT(attendance_date,'%Y-%m-%d') AS name, COUNT(*) AS value "
              + "FROM hrm_attendance WHERE deleted=0 AND attendance_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) "
              + "GROUP BY DATE_FORMAT(attendance_date,'%Y-%m-%d') ORDER BY name"));

        // ============ Sales ============
        PRESET_SOURCES.put("sales.order.monthly", new PresetSource(
                "Order Trend (last 6 months)", "sales",
                "SELECT DATE_FORMAT(create_time,'%Y-%m') AS name, COUNT(*) AS value, IFNULL(SUM(total_amount),0) AS metric "
              + "FROM biz_order WHERE deleted=0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(create_time,'%Y-%m') ORDER BY name"));
        PRESET_SOURCES.put("sales.order.byStatus", new PresetSource(
                "Order by Status", "sales",
                "SELECT IFNULL(status,'Unknown') AS name, COUNT(*) AS value FROM biz_order "
              + "WHERE deleted=0 GROUP BY status"));

        // ============ Supply ============
        PRESET_SOURCES.put("supply.purchase.monthly", new PresetSource(
                "Purchase Trend (last 6 months)", "supply",
                "SELECT DATE_FORMAT(create_time,'%Y-%m') AS name, COUNT(*) AS value, IFNULL(SUM(total_amount),0) AS metric "
              + "FROM supply_purchase_order WHERE deleted=0 AND create_time >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) "
              + "GROUP BY DATE_FORMAT(create_time,'%Y-%m') ORDER BY name"));
    }

    @Override
    public List<Map<String, Object>> executeReport(Long reportId) {
        ReportDefinition def = definitionMapper.selectById(reportId);
        if (def == null) {
            throw new BusinessException("报表不存在");
        }

        String dst = def.getDataSourceType();
        if ("preset".equalsIgnoreCase(dst)) {
            String key = StringUtils.hasText(def.getSqlQuery())
                    ? def.getSqlQuery()
                    : findFirstPresetByCategory(def.getCategory());
            PresetSource ps = key == null ? null : PRESET_SOURCES.get(key);
            if (ps == null) {
                throw new BusinessException("预设数据源不存在或已停用");
            }
            return executeQuery(ps.sql);
        } else if (isCustomSql(dst)) {
            requirePlatformAdminForCustomSql();
            String sql = def.getSqlQuery();
            if (!StringUtils.hasText(sql)) {
                throw new BusinessException("自定义 SQL 不能为空");
            }
            validateSql(sql);
            return executeQuery(sql);
        }
        throw new BusinessException("不支持的报表数据源类型");
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
        ReportDefinition definition = definitionMapper.selectById(reportId);
        if (definition == null) {
            throw new BusinessException("报表不存在");
        }
        if (isCustomSql(definition.getDataSourceType())) {
            requirePlatformAdminForCustomSql();
        }
        LambdaQueryWrapper<ReportDataset> w = new LambdaQueryWrapper<>();
        w.eq(ReportDataset::getReportId, reportId).orderByDesc(ReportDataset::getCreateTime);
        return this.list(w);
    }

    private void requirePlatformAdminForCustomSql() {
        if (!Long.valueOf(1L).equals(SecurityUtils.getCurrentUserId())) {
            throw new AccessDeniedException("自定义 SQL 报表仅平台管理员可访问");
        }
    }

    private boolean isCustomSql(String dataSourceType) {
        return "sql".equalsIgnoreCase(dataSourceType) || "sqlQuery".equalsIgnoreCase(dataSourceType);
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
        // SQL 注释是绕过关键词校验的主要手段,报表查询不应包含注释
        if (trimmed.contains("--") || trimmed.contains("/*") || trimmed.contains("#")) {
            throw new BusinessException("SQL 注释不被允许");
        }
        String[] forbidden = {" insert ", " update ", " delete ", " drop ", " alter ",
                " truncate ", " grant ", " revoke ", " create ",
                // 文件读写、系统库、延时盲注:报表无正当用途,挡掉防数据泄露/RCE
                "into outfile", "into dumpfile", "load_file", "load data",
                "information_schema", "performance_schema", "mysql.", "sys.",
                "sleep(", "benchmark(", "extractvalue", "updatexml"};
        for (String kw : forbidden) {
            if (trimmed.contains(kw)) {
                throw new BusinessException("Forbidden keyword in SQL: " + kw.trim());
            }
        }
        // UNION 可拼接任意表数据绕过单表语义,正常报表不会用,直接挡掉
        if (trimmed.contains("union")) {
            throw new BusinessException("Forbidden keyword in SQL: union");
        }
        // 权限/账号相关敏感表与敏感列:报表无正当用途,挡掉防密码哈希等敏感信息泄露
        String[] forbiddenSensitive = {"sys_user_role", "sys_role_menu", "sys_user_oauth",
                "sys_oauth", "sys_user", "sys_role", "password"};
        for (String kw : forbiddenSensitive) {
            if (trimmed.contains(kw)) {
                throw new BusinessException("Forbidden keyword in SQL: " + kw);
            }
        }
    }

    private List<Map<String, Object>> executeQuery(String sql) {
        try {
            List<Map<String, Object>> rows = definitionMapper.executeSelect(sql);
            return rows == null ? Collections.emptyList() : rows;
        } catch (Exception ex) {
            log.error("报表数据源查询失败", ex);
            throw new BusinessException("报表数据查询失败，请检查数据源配置");
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

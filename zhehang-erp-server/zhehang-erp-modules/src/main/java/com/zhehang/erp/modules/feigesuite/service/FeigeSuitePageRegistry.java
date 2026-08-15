package com.zhehang.erp.modules.feigesuite.service;

import com.zhehang.erp.common.core.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** Server-side whitelist for all 55 migrated legacy pages. */
@Component
public class FeigeSuitePageRegistry {

    public enum Audience { AUTHENTICATED, MANAGER, FINANCE, HR, FINANCE_OR_MANAGER }
    public enum Scope { VISIBLE_USERS, SHARED }

    public record PageDefinition(
            String code,
            String title,
            String group,
            Audience audience,
            Scope scope,
            boolean managerWrite,
            String defaultStatus,
            Set<String> statuses,
            Set<String> actions) {
    }

    private static final Set<String> RECORD_STATUSES = ordered("draft", "active", "completed", "archived");
    private static final Set<String> RECORD_ACTIONS = ordered("complete", "archive", "restore");
    private static final Set<String> CONFIG_STATUSES = ordered("enabled", "disabled");
    private static final Set<String> CONFIG_ACTIONS = ordered("enable", "disable");
    private static final Set<String> APPROVAL_STATUSES = ordered("draft", "pending", "approved", "rejected", "completed");
    private static final Set<String> APPROVAL_ACTIONS = ordered("submit", "approve", "reject", "complete", "restore");
    private static final Set<String> EXAM_STATUSES = ordered("pending", "in_progress", "completed");
    private static final Set<String> EXAM_ACTIONS = ordered("start", "complete", "restore");
    private static final Set<String> NOTICE_STATUSES = ordered("draft", "published", "revoked");
    private static final Set<String> NOTICE_ACTIONS = ordered("publish", "revoke", "restore");
    private static final Set<String> SALARY_STATUSES = ordered("draft", "pending", "approved", "rejected", "paid", "locked");
    private static final Set<String> SALARY_ACTIONS = ordered("submit", "approve", "reject", "pay", "lock", "unlock");
    private static final Set<String> MESSAGE_STATUSES = ordered("unread", "read", "archived");
    private static final Set<String> MESSAGE_ACTIONS = ordered("mark-read", "archive", "restore");

    private final Map<String, PageDefinition> definitions = new LinkedHashMap<>();

    public FeigeSuitePageRegistry() {
        // 学习体系 11页
        exam("knowledge-exam", "知识考试", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        config("sop-template", "销售SOP模板", "learning", Audience.MANAGER, Scope.SHARED);
        config("exam-config", "考核配置", "learning", Audience.MANAGER, Scope.SHARED);
        config("scenario-config", "模拟场景配置", "learning", Audience.MANAGER, Scope.SHARED);
        exam("my-learn", "我的话术学习", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        exam("team-learn", "团队学习进度", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        exam("my-exam", "我的话术考试", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        exam("team-exam", "团队考试记录", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        exam("simulation", "话术模拟训练", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        record("practice-score", "实战评分", "learning", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        record("script-dashboard", "话术训练看板", "learning", Audience.MANAGER, Scope.VISIBLE_USERS, true);

        // 顾问体系 4页
        record("consultant-report", "顾问业绩报表", "consultant", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        record("all-performance", "全员绩效", "consultant", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        record("dept-performance", "部门绩效", "consultant", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        config("performance-template", "绩效模板", "consultant", Audience.MANAGER, Scope.SHARED);

        // 管理体系 9页
        approval("address-service", "地址服务中心", "management", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        record("supplier", "供应商管理", "management", Audience.MANAGER, Scope.SHARED, true);
        approval("accounting-handover", "代账交接审核", "management", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        approval("staff-handover", "人员交接工作台", "management", Audience.MANAGER, Scope.VISIBLE_USERS, true);
        config("enterprise-level", "企业星级配置", "management", Audience.MANAGER, Scope.SHARED);
        config("audit-process", "审核流程", "management", Audience.MANAGER, Scope.SHARED);
        config("business-process", "业务流程", "management", Audience.MANAGER, Scope.SHARED);
        config("dynamic-form", "动态表单", "management", Audience.MANAGER, Scope.SHARED);
        config("homepage-config", "首页配置", "management", Audience.MANAGER, Scope.SHARED);

        // 财务中心 7页
        record("fixed-asset", "固定资产", "finance", Audience.FINANCE, Scope.SHARED, true);
        approval("referral-audit", "转介绍审核", "finance", Audience.FINANCE, Scope.VISIBLE_USERS, true);
        approval("renewal-audit", "续费审核", "finance", Audience.FINANCE, Scope.VISIBLE_USERS, true);
        approval("bank-diary", "银行日记账", "finance", Audience.FINANCE, Scope.SHARED, true);
        approval("upgrade-management", "升级管理", "finance", Audience.FINANCE, Scope.VISIBLE_USERS, true);
        record("bank-account", "银行账户", "finance", Audience.FINANCE, Scope.SHARED, true);
        config("collection-script", "催收话术", "finance", Audience.FINANCE, Scope.SHARED);

        // 知识智库 4页
        record("product-knowledge", "产品知识库", "knowledge", Audience.AUTHENTICATED, Scope.SHARED, true);
        record("faq", "常见问题库", "knowledge", Audience.AUTHENTICATED, Scope.SHARED, true);
        record("settlement-rule", "产品结算规则", "knowledge", Audience.AUTHENTICATED, Scope.SHARED, true);
        record("ai-product", "AI产品中心", "knowledge", Audience.AUTHENTICATED, Scope.SHARED, true);

        // 人事中心 5页（菜单并入人事行政，数据仍保持feige隔离）
        approval("probation", "转正管理", "hr", Audience.HR, Scope.VISIBLE_USERS, true);
        approval("resignation", "离职管理", "hr", Audience.HR, Scope.VISIBLE_USERS, true);
        record("team", "团队管理", "hr", Audience.HR, Scope.SHARED, true);
        record("contact", "员工通讯录", "hr", Audience.AUTHENTICATED, Scope.SHARED, true);
        approval("dept-incentive", "部门激励", "hr", Audience.HR, Scope.VISIBLE_USERS, true);

        // 工资管理 8页
        salary("salary-info", "薪资信息", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        salary("salary-payment", "薪资发放", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail", "薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail-wx", "微信团队薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail-yy", "运营团队薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail-fb", "法务团队薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail-gs", "工商团队薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);
        salary("salary-detail-kj", "会计团队薪资明细", Audience.HR, Scope.VISIBLE_USERS, true);

        // 报销管理 2页
        reimbursement("reimbursement-list", "报销管理", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        record("reimbursement-analysis", "报销分析", "reimbursement", Audience.FINANCE_OR_MANAGER, Scope.VISIBLE_USERS, true);

        // 系统通告 5页
        notice("notice-list", "系统公告", Audience.AUTHENTICATED, Scope.SHARED, true);
        message("notice-mine", "我的消息", Audience.AUTHENTICATED, Scope.VISIBLE_USERS, false);
        notice("notice-message", "消息管理", Audience.MANAGER, Scope.SHARED, true);
        config("notice-template", "消息模板", "notice", Audience.MANAGER, Scope.SHARED);
        config("notice-rule", "通知规则", "notice", Audience.MANAGER, Scope.SHARED);

        if (definitions.size() != 55) {
            throw new IllegalStateException("飞哥业务页注册数量必须为55，当前=" + definitions.size());
        }
    }

    public PageDefinition require(String code) {
        PageDefinition definition = definitions.get(code);
        if (definition == null) {
            throw new BusinessException("未知的业务页面");
        }
        return definition;
    }

    public List<PageDefinition> all() {
        return new ArrayList<>(definitions.values());
    }

    public String targetStatus(PageDefinition definition, String action) {
        return switch (action) {
            case "start" -> "in_progress";
            case "submit" -> "pending";
            case "approve" -> "approved";
            case "reject" -> "rejected";
            case "complete" -> "completed";
            case "publish" -> "published";
            case "revoke" -> "revoked";
            case "enable" -> "enabled";
            case "disable" -> "disabled";
            case "pay" -> "paid";
            case "lock" -> "locked";
            case "unlock" -> "approved";
            case "mark-read" -> "read";
            case "archive" -> "archived";
            case "restore" -> restoreTarget(definition);
            default -> throw new BusinessException("不支持的业务操作");
        };
    }

    public boolean isActionAllowed(PageDefinition definition, String currentStatus, String action) {
        if (!definition.actions().contains(action)) return false;
        Set<String> allowedFrom = switch (action) {
            case "start" -> ordered("pending");
            case "submit" -> ordered("draft", "rejected");
            case "approve", "reject" -> ordered("pending");
            case "complete" -> ordered("active", "approved", "in_progress", "pending");
            case "archive" -> ordered("active", "completed", "read", "unread");
            case "restore" -> ordered("archived", "rejected", "revoked", "completed", "read");
            case "publish" -> ordered("draft", "revoked");
            case "revoke" -> ordered("published");
            case "enable" -> ordered("disabled");
            case "disable" -> ordered("enabled");
            case "pay" -> ordered("approved");
            case "lock" -> ordered("approved", "paid");
            case "unlock" -> ordered("locked");
            case "mark-read" -> ordered("unread");
            default -> Set.of();
        };
        return allowedFrom.contains(currentStatus);
    }

    private String restoreTarget(PageDefinition definition) {
        if (definition.statuses().contains("active")) return "active";
        if (definition.statuses().contains("draft")) return "draft";
        if (definition.statuses().contains("pending")) return "pending";
        if (definition.statuses().contains("unread")) return "unread";
        throw new BusinessException("当前页面不支持恢复操作");
    }

    private void exam(String code, String title, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, "learning", audience, scope, managerWrite, "pending", EXAM_STATUSES, EXAM_ACTIONS);
    }

    private void config(String code, String title, String group, Audience audience, Scope scope) {
        define(code, title, group, audience, scope, true, "enabled", CONFIG_STATUSES, CONFIG_ACTIONS);
    }

    private void approval(String code, String title, String group, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, group, audience, scope, managerWrite, "draft", APPROVAL_STATUSES, APPROVAL_ACTIONS);
    }

    private void salary(String code, String title, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, "salary", audience, scope, managerWrite, "draft", SALARY_STATUSES, SALARY_ACTIONS);
    }

    private void reimbursement(String code, String title, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, "reimbursement", audience, scope, managerWrite, "draft",
                ordered("draft", "pending", "approved", "rejected", "paid"),
                ordered("submit", "approve", "reject", "pay", "restore"));
    }

    private void notice(String code, String title, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, "notice", audience, scope, managerWrite, "draft", NOTICE_STATUSES, NOTICE_ACTIONS);
    }

    private void message(String code, String title, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, "notice", audience, scope, managerWrite, "unread", MESSAGE_STATUSES, MESSAGE_ACTIONS);
    }

    private void record(String code, String title, String group, Audience audience, Scope scope, boolean managerWrite) {
        define(code, title, group, audience, scope, managerWrite, "active", RECORD_STATUSES, RECORD_ACTIONS);
    }

    private void define(String code, String title, String group, Audience audience, Scope scope,
                        boolean managerWrite, String defaultStatus, Set<String> statuses, Set<String> actions) {
        PageDefinition previous = definitions.put(code, new PageDefinition(code, title, group, audience, scope,
                managerWrite, defaultStatus, statuses, actions));
        if (previous != null) {
            throw new IllegalStateException("重复的飞哥业务页面编码: " + code);
        }
    }

    private static Set<String> ordered(String... values) {
        return java.util.Collections.unmodifiableSet(new LinkedHashSet<>(List.of(values)));
    }
}

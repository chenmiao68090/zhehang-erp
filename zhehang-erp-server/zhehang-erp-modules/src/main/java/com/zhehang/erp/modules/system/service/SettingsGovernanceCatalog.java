package com.zhehang.erp.modules.system.service;

import com.zhehang.erp.modules.system.domain.vo.FieldDefinitionVO;
import com.zhehang.erp.modules.system.domain.vo.RuleDefinitionVO;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 系统规则与字段来源的代码级登记簿。
 *
 * <p>目录随版本发布，普通配置人员不能自行创建脚本、SQL、权限规则或状态机；
 * 具体规则值继续保存在各领域唯一事实源中。</p>
 */
@Service
public class SettingsGovernanceCatalog {

    /**
     * 字段治理表尚未安装或当前租户尚未配置类型时使用的版本内置白名单。
     *
     * <p>这里只登记已完成后端写入口校验的纯目录字段；状态机、实体和外部协议不得
     * 通过此白名单变成第二套可写配置。</p>
     */
    private static final Map<String, List<String>> FALLBACK_OPTIONS = Map.of(
            "crm_consult_business", List.of(
                    "工商注册", "工商变更", "代账", "代理记账", "税务合规",
                    "商标业务", "专利业务", "项目申报", "刻章业务", "未知业务"),
            "memo_category", List.of(
                    "客户跟进", "财务协同", "团队管理", "系统优化", "学习成长", "个人事项"),
            "hr_labor_contract_type", List.of(
                    "固定期限", "无固定期限", "以完成一定工作为期限")
    );

    /** 各稳定值必须先满足真实业务列长度，避免配置可保存、业务落库却报 Data too long。 */
    private static final Map<String, Integer> OPTION_VALUE_MAX_LENGTH = Map.of(
            "crm_consult_business", 32,
            "memo_category", 30,
            "hr_labor_contract_type", 30
    );

    /** 只有实际成交业务是逗号多值串；其物理列 crm_lead.deal_business 为 VARCHAR(255)。 */
    private static final Map<String, Integer> MULTI_VALUE_MAX_LENGTH = Map.of(
            "crm_consult_business", 255
    );

    private static final List<RuleDefinitionVO> RULES = List.of(
            rule("crm.pool.quota", "公海领取、录入与导入额度", "sales", "销售与客户",
                    "LIMIT", "VERSIONED_DOMAIN", "公海规则版本", "crm_pool_rule_version",
                    "/sys-flow/pool-admin", "HIGH", "DRAFT_SIMULATE_PUBLISH", "CONNECTED", true, true,
                    "统一每日/单次领取、手工录入、批量导入和私海持有上限。",
                    "公海领取、批量导入、销售私海容量与回收前置判断", null, 10),
            rule("crm.pool.definition", "公海池定义与启停", "sales", "销售与客户",
                    "ENTITY_POLICY", "DOMAIN_CONFIG", "公海池配置", "crm_pool_config",
                    "/sys-flow/pool-admin", "HIGH", "DOMAIN_SAVE", "CONNECTED", false, false,
                    "管理公海池身份、类型和启用状态；不复制额度规则。",
                    "线索进入哪个池、可见池和领取入口", "rules_json/distribute_mode 不是当前额度事实源。", 20),
            rule("crm.pool.recycle", "保护期、冷却期与自动回收", "sales", "销售与客户",
                    "LIFECYCLE", "VERSIONED_DOMAIN", "公海规则版本", "crm_pool_rule_version",
                    "/sys-flow/pool-admin", "HIGH", "DRAFT_SIMULATE_PUBLISH", "CONNECTED", true, true,
                    "统一保护天数、未跟进回收、回收预警和主动释放冷却期。",
                    "客户归属、历史客资重新激活、销售跟进节奏",
                    "crm_holding_config 仅异常兜底，crm_recycle_rule 当前无消费者，均不得成为第二写入口。", 30),
            rule("crm.collision", "撞单判定与处理", "sales", "销售与客户",
                    "MATCHING", "DOMAIN_CONFIG", "撞单管理", "crm_lead_collision",
                    "/sys-flow/collision", "MEDIUM", "DOMAIN_SAVE", "CONNECTED", false, false,
                    "按手机号、企业名称等业务事实识别重复线索，并记录处理结论。",
                    "线索新增、分配、合并建议与客户归属", null, 40),
            rule("sales.target", "销售拨打与跟进目标", "sales", "销售与客户",
                    "TARGET", "CODE_POLICY", "销售经营服务", null,
                    null, "MEDIUM", "VERSIONED_REQUIRED", "PLANNED", false, false,
                    "当前每日通话目标和预测完整度阈值仍有代码常量，尚不能在页面安全修改。",
                    "排行榜、员工目标、销售预测可信度", "不得修改今天规则后重算历史绩效；需先形成按岗位/期间的版本快照。", 50),
            rule("workflow.process", "审批流程与条件", "approval", "审批与流程",
                    "WORKFLOW", "VERSIONED_DOMAIN", "审批流程版本", "wf_process_def,wf_process_version",
                    "/sys-flow/workflow", "HIGH", "DRAFT_VALIDATE_PUBLISH", "CONNECTED", true, true,
                    "配置节点、审批人、条件、超时与撤回策略，发布后形成不可变版本。",
                    "订单、报销、采购、组织变更等人工审批路由", "只允许安全比较器，禁止任意脚本、SpEL、SQL和外部URL。", 100),
            rule("order.review", "订单审单与财务确认", "order", "提单与订单",
                    "DOMAIN_GUARD", "STATE_MACHINE", "订单领域状态机", "biz_order,biz_order_approval",
                    "/order/review", "HIGH", "READ_ONLY_GUARD", "PARTIAL", false, false,
                    "交易状态守卫仍由订单领域执行；人工审批路由应逐步引用已发布审批流程。",
                    "订单提交、主管审批、财务确认、审单和履约派单", "不能把交易状态任意开放为下拉项。", 110),
            rule("finance.cash.match", "到账与业务单自动匹配", "finance", "财务与资金",
                    "MATCHING", "VERSIONED_DOMAIN", "现金匹配规则", "fin_cash_match_rule_config,fin_cash_match_rule_event",
                    "/finance/cash-journal", "HIGH", "VALIDATE_SIMULATE_SAVE", "CONNECTED", true, true,
                    "配置匹配权重、金额容差、日期窗口、阈值和候选数量；结果只作核销建议。",
                    "到账登记、候选业务单、财务核销效率", "匹配建议不得自动过账；历史治理算法需明确为独立只读口径。", 200),
            rule("finance.accounting.guard", "核销、过账与冲正规则", "finance", "财务与资金",
                    "INTEGRITY_GUARD", "STATE_MACHINE", "财务领域守卫", "fin_cash_journal,fin_cash_match",
                    null, "CRITICAL", "READ_ONLY_GUARD", "READ_ONLY", false, false,
                    "核销不超余额、已过账不可直接删除、退款和冲正保留审计轨迹。",
                    "资金余额、凭证、退款、日结和财务审计", "会计恒等式和资金守卫永远不能在普通规则页关闭。", 210),
            rule("finance.reimburse", "报销审批与付款", "finance", "财务与资金",
                    "APPROVAL", "DOMAIN_AND_WORKFLOW", "报销单+审批流程", "finance_reimburse,wf_process_version",
                    "/finance/reimburse", "CRITICAL", "GOVERNANCE_REQUIRED", "PARTIAL", false, false,
                    "报销申请、审批与付款需要唯一流程和精确付款权限。",
                    "费用申请、审批流水、付款凭证和现金流水", "现有兼容直批属于待收紧旁路，不应成为规则中心第二套审批。", 220),
            rule("finance.commission", "提成计算与结算", "finance", "财务与资金",
                    "FORMULA", "CODE_POLICY", "提成领域", "biz_commission",
                    null, "CRITICAL", "VERSIONED_REQUIRED", "PLANNED", false, false,
                    "当前默认比例和审批/实付边界尚未形成可发布政策。",
                    "提成金额、薪资结算、主管/财务/老板审批", "必须先补精确后端权限、政策版本与计算快照，不能直接开放公式文本。", 230),
            rule("renewal.policy", "续费阶段与提醒节奏", "renewal", "续费与应收",
                    "LIFECYCLE", "CODE_POLICY", "续费领域", "biz_contract_renew_stage",
                    "/renewal-center/workbench", "HIGH", "VERSIONED_REQUIRED", "PLANNED", false, false,
                    "按服务类型统一提前天数、阶段、责任人、提醒、宽限和升级。",
                    "合同续费、应收催收、地址续费和客户流失", "阶段记录是业务事实，不是规则定义；新政策需让交易保存policyVersion。", 300),
            rule("notification.policy", "业务提醒与升级", "notification", "通知与待办",
                    "NOTIFICATION", "MULTI_DOMAIN", "各领域事件+通知投递", "sys_notification,im_notification_outbox,im_task_reminder",
                    "/message/center", "MEDIUM", "VERSIONED_REQUIRED", "PLANNED", false, false,
                    "统一事件、提前量、升级节奏、接收角色和渠道；展示、投递队列和计划实例仍分层。",
                    "审批超时、合同到期、回款待审、任务逾期和培训提醒", "重试次数、心跳、扫描批次等工程护栏不进入老板业务规则。", 400),
            rule("training.course", "课程考试与学习达标", "training", "培训与知识",
                    "COURSE_POLICY", "VERSIONED_DOMAIN", "课程版本", "hrm_training_course,hrm_training_material",
                    "/training/course", "MEDIUM", "COURSE_VERSION", "CONNECTED", false, true,
                    "及格分、考试时长、重考次数、最低观看比例随课程版本保存。",
                    "学习进度、考试、重训和证书", "在途考试继续使用快照；防作弊技术阈值受安全下限保护。", 500),
            rule("hr.attendance", "考勤与请假政策", "hr", "组织与人事",
                    "HR_POLICY", "MIXED", "考勤代码+请假类型", "hrm_leave_type,hrm_attendance",
                    "/hrm/attendance", "HIGH", "VERSIONED_REQUIRED", "PARTIAL", false, false,
                    "上下班时间、迟到口径、假期类型和余额规则需要稳定编码与版本。",
                    "考勤汇总、请假余额、审批和工资输入", "新增假期类型前必须补后端稳定code映射，不能仅添加中文名称。", 600),
            rule("hr.performance.salary", "绩效与薪资计算政策", "hr", "组织与人事",
                    "FORMULA", "MIXED", "绩效/薪资模板+代码", "hrm_perf_template,hrm_salary_template",
                    "/hrm/perf-template", "CRITICAL", "VERSIONED_REQUIRED", "PLANNED", false, false,
                    "权重、评级、奖金、提成和工资公式需按月度单据保存政策快照。",
                    "绩效结果、工资条、奖金与提成", "不得回算已发工资；需HR草稿、老板/财务复核后生效。", 610),
            rule("feige.task.bridge", "订单到任务桥接", "task", "任务与交付",
                    "EVENT_BRIDGE", "VERSIONED_DOMAIN", "订单任务桥接", "feige_task_order_bridge_rule",
                    "/task-workbench/rule", "HIGH", "VALIDATE_PUBLISH", "CONNECTED", true, true,
                    "决定订单事件何时生成哪类业务工作项，保留幂等和运行快照。",
                    "订单审核、合同转换、业务任务和交付责任", "桥接只负责生成工作项，不得演变为第二个通用审批引擎。", 700),
            rule("security.access", "角色、数据范围与认证安全", "security", "权限与安全",
                    "SECURITY_POLICY", "SECURITY_CORE", "角色权限/认证服务", "sys_role,sys_role_menu,sys_user_role",
                    "/sys-org/role", "CRITICAL", "SEPARATE_SECURITY_CENTER", "READ_ONLY", false, false,
                    "角色、菜单、接口、data_scope、MFA、代登录与限流独立治理。",
                    "全系统访问权限、敏感数据与账号安全", "业务规则中心绝不授予权限或降低认证、安全和跨租户边界。", 900)
    );

    private static final List<FieldDefinitionVO> FIELDS = List.of(
            field("crm.consultBusiness", "咨询/成交业务", "sales", "销售与客户",
                    List.of("找客户", "新增线索"), List.of("/customer/lead"), "crm_lead.consult_business/deal_business",
                    "SELECT_MULTI", "DICTIONARY", "受控选项", "crm_consult_business", "STRING", "MEDIUM",
                    "CONNECTED", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, 10, 2, "/sys-flow/field-mapping",
                    "允许新增展示项、排序和停用；已保存的存储值持续可回显。", "服务产品最终应升级为主数据，本批不负责价格和交付映射。", 10),
            field("crm.validity", "客资有效性", "sales", "销售与客户",
                    List.of("找客户", "新增线索"), List.of("/customer/lead"), "crm_lead.validity",
                    "SELECT", "STATE_MACHINE", "CRM有效性契约", null, "STRING", "HIGH",
                    "CONNECTED", "DISPLAY_ONLY", "KEEP_VALUE", false, 3, 2, null,
                    "有效、无效、待定由线索生命周期和经营统计共同消费，仅展示真实来源。",
                    "不得通过普通字典新增、停用或改名，否则会改变有效率和历史客资口径。", 20),
            field("crm.followStage", "销售跟进阶段", "sales", "销售与客户",
                    List.of("找客户", "新增线索"), List.of("/customer/lead"), "crm_lead.follow_status",
                    "SELECT", "STATE_MACHINE", "CRM销售阶段状态机", null, "STRING", "HIGH",
                    "CONNECTED", "DISPLAY_ONLY", "KEEP_VALUE", false, 5, 2, null,
                    "阶段由跟进、转化、历史重激活和漏斗状态机共同推进，仅展示真实来源。",
                    "不得通过普通字典新增或停用阶段；状态变更必须走领域动作和审计。", 30),
            field("crm.leadSource", "线索一级来源", "sales", "销售与客户",
                    List.of("找客户", "客户工作台", "批量导入"), List.of("/customer/lead", "/customer/workbench"), "crm_lead.source",
                    "SELECT", "CODE_CATALOG", "CRM来源契约", null, "NUMBER", "HIGH",
                    "READ_ONLY", "DISPLAY_ONLY", "PROTOCOL_LOCKED", true, 10, 5, null,
                    "数字1-10同时参与导入映射和统计。", "来源码不可增删改；后续只开放标签、颜色和平台别名。", 40),
            field("crm.sourcePlatform", "线索来源平台", "sales", "销售与客户",
                    List.of("找客户", "新增线索", "批量导入"), List.of("/customer/lead", "/customer/lead-import"), "crm_lead.source_platform",
                    "SELECT", "CODE_CATALOG", "CRM来源平台目录", null, "STRING", "MEDIUM",
                    "PENDING", "ALIAS_ADD_DISABLE", "KEEP_VALUE", false, 45, 3, null,
                    "可做历史别名、导入同义词和一级来源级联。", "必须保留平台到一级来源的确定映射。", 50),
            field("crm.lifecycle", "线索生命周期", "sales", "销售与客户",
                    List.of("找客户", "客户360"), List.of("/customer/lead"), "crm_lead.status",
                    "SELECT", "STATE_MACHINE", "CRM状态机", null, "NUMBER", "CRITICAL",
                    "READ_ONLY", "DISPLAY_ONLY", "SNAPSHOT", true, 4, 2, null,
                    "新建、跟进中、已转化、无效由领域动作推进。", "只能调整展示元数据，不能增删状态或从设置页改客户状态。", 60),
            field("crm.customerLevel", "客户/意向分级", "sales", "销售与客户",
                    List.of("找客户", "销售工作台", "客户工作台"), List.of("/customer/lead", "/customer/workbench"), "crm_lead.customer_level/intent_level",
                    "SELECT", "STATE_MACHINE", "销售分级契约", null, "STRING", "HIGH",
                    "READ_ONLY", "DISPLAY_ONLY", "KEEP_VALUE", false, 6, 3, null,
                    "A-F等级与意向等级是两个不同字段，中心分别登记不做COALESCE。", "不得再把intent_level统计冒充customer_level。", 70),
            field("crm.nextAction", "下一步行动", "sales", "销售与客户",
                    List.of("销售工作台", "通话小结"), List.of("/customer/workbench"), "crm_follow.next_action",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "LOW",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, null, 2, null,
                    "纯行动目录，适合作为下一批受控选项。", null, 80),
            field("crm.issueType", "客户问题类型", "sales", "客户服务",
                    List.of("客户问题"), List.of("/customer/issue"), "crm_customer_issue.issue_type",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "MEDIUM",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", true, null, 1, null,
                    "类型可新增和停用，SLA优先级与状态仍由领域守卫。", null, 90),
            field("crm.issuePriority", "客户问题优先级", "sales", "客户服务",
                    List.of("客户问题"), List.of("/customer/issue"), "crm_customer_issue.priority",
                    "SELECT", "STATE_MACHINE", "客户问题SLA", null, "STRING", "HIGH",
                    "READ_ONLY", "DISPLAY_ONLY", "SNAPSHOT", true, 3, 1, null,
                    "P0-P2会影响逾期和升级。", "不可作为普通字典任意增加优先级。", 100),
            field("memo.category", "备忘分类", "personal", "个人中心",
                    List.of("备忘录"), List.of("/dashboard/memo"), "dashboard_memo.category",
                    "SELECT", "DICTIONARY", "受控选项", "memo_category", "STRING", "LOW",
                    "CONNECTED", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, 6, 2, "/sys-flow/field-mapping",
                    "历史记录中的旧分类必须继续回显。", null, 110),
            field("asset.category", "资产/用品分类", "admin", "行政管理",
                    List.of("资产管理", "办公用品"), List.of("/admin/asset", "/admin/supply"), "admin_asset.category",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "LOW",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", true, null, 2, null,
                    "分类可受控新增、排序和停用。", "领用、归还、报废状态仍不可编辑。", 120),
            field("expense.category", "费用大类", "finance", "财务与行政",
                    List.of("费用报销"), List.of("/finance/reimburse"), "finance_reimburse.expense_type",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "MEDIUM",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", true, null, 1, null,
                    "只管理费用目录，不管理审批和付款。", null, 130),
            field("expense.invoiceType", "发票类型", "finance", "财务与行政",
                    List.of("费用报销"), List.of("/finance/reimburse"), "finance_reimburse.invoice_type",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "MEDIUM",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, null, 1, null,
                    "票种可受控停用；发票抬头属于公司主体实体。", null, 140),
            field("hr.hukou", "户口类型", "hr", "组织与人事",
                    List.of("员工档案"), List.of("/sys-org/employee"), "org_employee.hukou_type",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "LOW",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, null, 1, null,
                    "人口属性目录可新增和停用，历史档案值保留。", null, 150),
            field("hr.political", "政治面貌", "hr", "组织与人事",
                    List.of("员工档案"), List.of("/sys-org/employee"), "org_employee.political_status",
                    "SELECT", "CODE_CATALOG", "页面常量", null, "STRING", "LOW",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, null, 1, null,
                    "人口属性目录可新增和停用。", null, 160),
            field("hr.education", "学历", "hr", "组织与人事",
                    List.of("员工档案", "招聘"), List.of("/sys-org/employee", "/hrm/recruit"), "org_employee.education",
                    "SELECT", "CODE_CATALOG", "多个页面常量", null, "STRING", "LOW",
                    "PENDING", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", false, null, 2, null,
                    "应合并重复学历目录但保留历史别名。", null, 170),
            field("hr.contractType", "劳动合同类型", "hr", "组织与人事",
                    List.of("劳动合同"), List.of("/hrm/labor-contract"), "hrm_labor_contract.contract_type",
                    "SELECT", "DICTIONARY", "受控选项", "hr_labor_contract_type", "STRING", "MEDIUM",
                    "CONNECTED", "ADD_DISABLE_LOCK_VALUE", "KEEP_VALUE", true, 3, 1, "/sys-flow/field-mapping",
                    "合同类型可配置，合同状态仍由生命周期控制。", null, 180),
            field("hr.leaveType", "假期类型", "hr", "组织与人事",
                    List.of("请假", "考勤"), List.of("/hrm/leave", "/hrm/attendance"), "hrm_leave_type.code",
                    "SELECT", "ENTITY", "假期类型实体", null, "STRING", "HIGH",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", true, null, 2, "/hrm/leave-management",
                    "由假期类型实体管理余额和状态，字段中心只展示来源。", "新增稳定code前必须补审批回调映射。", 190),
            field("org.employee", "员工/审批人/负责人", "organization", "组织与权限",
                    List.of("全系统人员选择器"), List.of("/sys-org/employee"), "*_user_id",
                    "ENTITY_SELECT", "ENTITY", "员工与账号", null, "NUMBER", "CRITICAL",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", true, null, 50, "/sys-org/employee",
                    "按租户、在职状态和数据范围实时查询员工。", "绝不能在字段中心新增、删除或伪造员工。", 200),
            field("org.department", "部门", "organization", "组织与权限",
                    List.of("全系统部门选择器"), List.of("/sys-org/dept"), "*_dept_id",
                    "TREE_SELECT", "ENTITY", "部门管理", null, "NUMBER", "CRITICAL",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", false, null, 30, "/sys-org/dept",
                    "保留部门树、租户和数据范围。", "不可扁平化成字符串字典。", 210),
            field("org.role", "角色", "organization", "组织与权限",
                    List.of("角色成员", "审批流程"), List.of("/sys-org/role", "/sys-flow/workflow"), "sys_user_role.role_id",
                    "ENTITY_SELECT", "ENTITY", "角色与权限", null, "NUMBER", "CRITICAL",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", true, null, 8, "/sys-org/role",
                    "角色是唯一权限设置标准。", "字段中心不得成为第二套角色或权限入口。", 220),
            field("crm.customer", "客户/线索", "sales", "销售与客户",
                    List.of("订单", "合同", "任务", "收款"), List.of("/customer/portfolio"), "*_customer_id/*_lead_id",
                    "ENTITY_SELECT", "ENTITY", "CRM客户事实", null, "NUMBER", "CRITICAL",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", true, null, 20, "/customer/portfolio",
                    "使用稳定ID并服从客户数据范围。", "不可把公司名称列表复制成字典。", 230),
            field("service.product", "业务类型/服务产品", "order", "提单与订单",
                    List.of("找客户", "订单", "合同", "飞哥套件"), List.of("/customer/lead", "/order/bill"), "service_type/product_code",
                    "ENTITY_SELECT", "MIXED", "多组局部数组", null, "STRING", "HIGH",
                    "PENDING", "MAPPING_ONLY", "KEEP_VALUE", true, null, 12, null,
                    "中文和英文码并存，应先建立产品/服务主数据及域映射。", "中心首期只显示冲突，不能直接合并成一个普通字典。", 240),
            field("finance.account", "收款/付款账户", "finance", "财务与资金",
                    List.of("收款登记", "退款", "地址报单"), List.of("/finance/cash-journal"), "cash_account_id/account_number",
                    "ENTITY_SELECT", "ENTITY", "资金账户", null, "NUMBER", "CRITICAL",
                    "DOMAIN_MANAGED", "DOMAIN_MANAGED", "ENTITY_REFERENCE", true, null, 8, "/finance/cash-journal",
                    "账户必须有主体、状态、权限和审计。", "绝不能以任意下拉字符串代替真实资金账户。", 250),
            field("finance.paymentMethod", "收款渠道/付款方式", "finance", "财务与资金",
                    List.of("收款核验", "订单", "飞哥订单"), List.of("/finance/cash-journal", "/order/bill"), "payment_method/pay_method",
                    "SELECT", "MIXED", "中文值+英文码并存", "payment_method", "STRING", "HIGH",
                    "PENDING", "MAPPING_ONLY", "KEEP_VALUE", true, 11, 6, null,
                    "需要稳定码、历史中文别名和双向映射。", "当前 bank/银行转账/对公转账不等价，未完成映射前不得宣称已接入。", 260),
            field("workflow.dynamicOptions", "审批动态表单选项", "approval", "审批与流程",
                    List.of("审批发起", "流程设计器"), List.of("/sys-flow/workflow"), "wf_process_version.process_config",
                    "DYNAMIC_SELECT", "PROCESS_VERSION", "审批流程版本", null, "JSON", "HIGH",
                    "DOMAIN_MANAGED", "VERSIONED_REFERENCE", "SNAPSHOT", false, null, 2, "/sys-flow/workflow",
                    "选项随已发布流程版本回放。", "中心以后可供流程引用共享字典，但不能直接改已发布实例。", 270),
            field("external.messageType", "微信/云客消息类型与通话方向", "integration", "第三方对接",
                    List.of("微信会话", "云客通话"), List.of("/sys-inspect/yunke-config"), "provider_protocol_code",
                    "SELECT", "EXTERNAL_PROTOCOL", "供应商协议", null, "NUMBER", "CRITICAL",
                    "READ_ONLY", "DISPLAY_ONLY", "PROTOCOL_LOCKED", true, null, 5, "/sys-inspect/yunke-config",
                    "外部协议码只能做中文展示。", "增删协议码会破坏上游兼容。", 280),
            field("feige.optionGroups", "飞哥通用套件选项组", "feige", "飞哥兼容套件",
                    List.of("55个运行页"), List.of("/feige-suite"), "feige_suite_record.record_json",
                    "MIXED", "CODE_CATALOG", "catalog.ts 108组选项", null, "JSON", "HIGH",
                    "PENDING", "AUDIT_FIRST", "KEEP_VALUE", false, 108, 55, null,
                    "先把人员/部门实体、状态机和纯目录逐项分类。", "默认全部锁定；纯目录完成引用审计后才可迁入受控选项。", 900)
    );

    public List<RuleDefinitionVO> rules() {
        return RULES;
    }

    public List<FieldDefinitionVO> fields() {
        return FIELDS;
    }

    public Optional<FieldDefinitionVO> fieldByDictType(String dictType) {
        if (dictType == null || dictType.isBlank()) {
            return Optional.empty();
        }
        return FIELDS.stream().filter(field -> dictType.equals(field.getDictType())).findFirst();
    }

    public boolean isBoundDictionary(String dictType) {
        return fieldByDictType(dictType).isPresent();
    }

    public boolean isWritableDictionary(String dictType) {
        return fieldByDictType(dictType)
                .filter(field -> "DICTIONARY".equals(field.getSourceKind()))
                .filter(field -> "CONNECTED".equals(field.getIntegrationState()))
                .filter(field -> "ADD_DISABLE_LOCK_VALUE".equals(field.getEditPolicy()))
                .isPresent();
    }

    /** 返回缺表/未配置时的不可变版本白名单；未登记可写目录返回空列表。 */
    public List<String> fallbackValues(String dictType) {
        if (dictType == null || !isWritableDictionary(dictType)) {
            return List.of();
        }
        return FALLBACK_OPTIONS.getOrDefault(dictType, List.of());
    }

    /** 单个稳定存储值对应的业务列最大字符数。 */
    public Integer optionValueMaxLength(String dictType) {
        return OPTION_VALUE_MAX_LENGTH.get(dictType);
    }

    /** 业务字段最终落库值的最大字符数；多值字段按其组合串物理列限制。 */
    public Integer storageValueMaxLength(String dictType, boolean multiValue) {
        if (multiValue) {
            return MULTI_VALUE_MAX_LENGTH.get(dictType);
        }
        return optionValueMaxLength(dictType);
    }

    private static RuleDefinitionVO rule(String code, String name, String domainCode, String domainName,
                                         String type, String sourceKind, String sourceName, String sourceTable,
                                         String manageRoute, String riskLevel, String changeMode,
                                         String integrationState, boolean simulation, boolean rollback,
                                         String summary, String impactScope, String warning, int sort) {
        return RuleDefinitionVO.builder()
                .code(code).name(name).domainCode(domainCode).domainName(domainName)
                .type(type).sourceKind(sourceKind).sourceName(sourceName).sourceTable(sourceTable)
                .manageRoute(manageRoute).riskLevel(riskLevel).changeMode(changeMode)
                .integrationState(integrationState).supportsSimulation(simulation).supportsRollback(rollback)
                .summary(summary).impactScope(impactScope).legacyWarning(warning).sort(sort).build();
    }

    private static FieldDefinitionVO field(String key, String name, String moduleCode, String moduleName,
                                           List<String> pageNames, List<String> pageRoutes, String storageField,
                                           String controlType, String sourceKind, String sourceName, String dictType,
                                           String valueType, String riskLevel, String integrationState,
                                           String editPolicy, String historyPolicy, boolean required,
                                           Integer optionCount, Integer usageCount, String manageRoute,
                                           String description, String warning, int sort) {
        return FieldDefinitionVO.builder()
                .key(key).name(name).moduleCode(moduleCode).moduleName(moduleName)
                .pageNames(pageNames).pageRoutes(pageRoutes).storageField(storageField)
                .controlType(controlType).sourceKind(sourceKind).sourceName(sourceName).dictType(dictType)
                .valueType(valueType).riskLevel(riskLevel).integrationState(integrationState)
                .editPolicy(editPolicy).historyPolicy(historyPolicy).required(required)
                .optionCount(optionCount).usageCount(usageCount).manageRoute(manageRoute)
                .description(description).warning(warning).sort(sort).build();
    }
}

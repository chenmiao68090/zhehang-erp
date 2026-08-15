import type {
  FeigeSuiteActionConfig,
  FeigeSuiteColumnConfig,
  FeigeSuiteFieldConfig,
  FeigeSuiteGroupConfig,
  FeigeSuiteOption,
  FeigeSuitePageConfig
} from './types'

const option = (label: string, value = label): FeigeSuiteOption => ({ label, value })
const options = (...labels: string[]) => labels.map((label) => option(label))
const field = (
  key: string,
  label: string,
  type: FeigeSuiteFieldConfig['type'] = 'text',
  required = false,
  fieldOptions?: FeigeSuiteOption[],
  span: 1 | 2 = 1,
  unit?: string
): FeigeSuiteFieldConfig => ({ key, label, type, required, options: fieldOptions, span, unit })
const column = (
  key: string,
  label: string,
  type: FeigeSuiteColumnConfig['type'] = 'text',
  minWidth = 120,
  tooltip = true
): FeigeSuiteColumnConfig => ({ key, label, type, minWidth, tooltip })
const action = (key: string, label: string, type: FeigeSuiteActionConfig['type'] = 'primary', requiresRemark = false): FeigeSuiteActionConfig => ({ key, label, type, requiresRemark })

const STATUS_FILTER = field('status', '状态', 'select', false, options('全部', '草稿', '待处理', '进行中', '已完成', '已停用'))
const DATE_FILTER = field('bizDate', '业务日期', 'date')
const OWNER_FILTER = field('ownerId', '负责人', 'select')
const recordActions = [action('complete', '完成', 'success'), action('archive', '归档', 'warning'), action('restore', '恢复', 'primary')]
const configActions = [action('enable', '启用', 'success'), action('disable', '停用', 'warning')]
const approvalActions = [action('submit', '提交审核'), action('approve', '通过', 'success'), action('reject', '驳回', 'danger', true), action('complete', '办结', 'success'), action('restore', '恢复草稿')]
const salaryActions = [action('submit', '提交'), action('approve', '审核通过', 'success'), action('reject', '驳回', 'danger', true), action('pay', '确认发放', 'success'), action('lock', '锁定', 'warning'), action('unlock', '解锁')]

export const FEIGE_SUITE_GROUPS: FeigeSuiteGroupConfig[] = [
  { code: 'learning', title: '学习中心', basePath: '/feige-learning', icon: 'Reading', color: '#2563eb', description: '知识考试、销售话术学习、产品知识与团队学习分析' },
  { code: 'consultant', title: '管家中心', basePath: '/feige-consultant', icon: 'DataAnalysis', color: '#7c3aed', description: '顾问业绩、全员绩效、部门绩效与绩效模板' },
  { code: 'management', title: '管理体系', basePath: '/feige-management', icon: 'OfficeBuilding', color: '#0f766e', description: '地址服务、供应商、交接、审核流程和动态配置' },
  { code: 'finance', title: '财务中心', basePath: '/feige-finance', icon: 'Wallet', color: '#d97706', description: '资产、审核、银行日记账、银行账户和催收话术' },
  { code: 'knowledge', title: '知识智库', basePath: '/feige-knowledge', icon: 'Collection', color: '#0891b2', description: '产品知识、常见问题、结算规则和AI产品能力' },
  { code: 'hr', title: '人事中心', basePath: '/hrm', icon: 'UserFilled', color: '#dc2626', description: '人事流程并入浙杭人事行政，数据独立保存' },
  { code: 'salary', title: '工资管理', basePath: '/feige-salary', icon: 'Coin', color: '#16a34a', description: '薪资档案、发放和五类团队薪资明细' },
  { code: 'reimbursement', title: '报销管理', basePath: '/feige-reimbursement', icon: 'Document', color: '#ea580c', description: '报销申请审核与费用分析' },
  { code: 'notice', title: '系统通知', basePath: '/feige-notice', icon: 'Bell', color: '#475569', description: '公告、个人消息、消息管理、模板和通知规则' }
]

const pages: FeigeSuitePageConfig[] = [
  // 学习中心 11页
  {
    code: 'knowledge-exam', group: 'learning', title: '知识考试', icon: 'EditPen', kind: 'exam', primaryLabel: '创建试卷',
    legacyPath: '/knowledge-management/exam', description: '题库、试卷、在线考试与成绩记录。',
    filters: [field('questionType', '题目类型', 'select', false, options('单选题', '多选题', '判断题')), field('difficulty', '难度', 'select', false, options('简单', '中等', '困难'))],
    fields: [field('title', '试卷名称', 'text', true), field('questionCount', '题目数量', 'number', true, undefined, 1, '题'), field('duration', '考试时长', 'number', true, undefined, 1, '分钟'), field('passScore', '及格分', 'number', true, undefined, 1, '分'), field('description', '考试说明', 'textarea', false, undefined, 2)],
    columns: [column('title', '试卷'), column('questionCount', '题目数', 'text', 90), column('duration', '时长(分)', 'text', 100), column('passScore', '及格分', 'score', 90), column('score', '得分', 'score', 90), column('result', '结果', 'status', 100)],
    actions: [action('start', '开始考试'), action('complete', '提交试卷', 'success'), action('restore', '重新考试')], tabs: options('我的考试', '题库管理', '试卷管理', '成绩统计'), statLabels: ['待考试', '已完成', '平均分', '通过率']
  },
  {
    code: 'sop-template', group: 'learning', title: '销售SOP模板', icon: 'Document', kind: 'config', primaryLabel: '新增模板',
    legacyPath: '/sales-system/sales-script/sop-template', description: '配置适用团队、阶段顺序和标准销售话术。',
    filters: [field('team', '适用团队', 'select', false, options('全部团队', '销售一部', '销售二部', '顾问部')), STATUS_FILTER],
    fields: [field('title', '模板名称', 'text', true), field('team', '适用团队', 'select', true, options('销售一部', '销售二部', '顾问部')), field('stageCount', '阶段数量', 'number', true), field('sortNo', '排序号', 'number'), field('content', 'SOP说明', 'textarea', true, undefined, 2)],
    columns: [column('title', '模板名称'), column('team', '适用团队'), column('stageCount', '阶段数', 'text', 90), column('status', '当前状态', 'status', 100), column('sortNo', '排序号', 'text', 90), column('createTime', '创建时间', 'datetime', 165)], actions: configActions
  },
  {
    code: 'exam-config', group: 'learning', title: '考核配置', icon: 'SetUp', kind: 'config', primaryLabel: '新增考核',
    legacyPath: '/sales-system/sales-script/exam-config', description: '按SOP阶段设置及格分、尝试次数与考试时限。',
    filters: [field('template', 'SOP模板', 'select', false, options('新人开场SOP', '异议处理SOP', '成交推进SOP')), STATUS_FILTER],
    fields: [field('title', '考核名称', 'text', true), field('template', 'SOP模板', 'select', true, options('新人开场SOP', '异议处理SOP', '成交推进SOP')), field('stage', '关联阶段', 'select', true, options('开场', '需求确认', '异议处理', '成交')), field('passScore', '及格分', 'number', true), field('maxAttempts', '最大尝试', 'number', true), field('duration', '时限', 'number', true, undefined, 1, '分钟')],
    columns: [column('title', '考核名称'), column('template', 'SOP模板'), column('stage', '关联阶段'), column('passScore', '及格分', 'score', 90), column('maxAttempts', '最大尝试', 'text', 100), column('duration', '时限(分)', 'text', 100), column('status', '状态', 'status', 100)], actions: configActions
  },
  {
    code: 'scenario-config', group: 'learning', title: '模拟场景配置', icon: 'ChatLineSquare', kind: 'config', primaryLabel: '新增场景',
    legacyPath: '/sales-system/sales-script/scenario-config', description: '维护模拟客户话术、难度和期望回答要点。',
    filters: [field('template', 'SOP模板', 'select', false, options('新人开场SOP', '异议处理SOP')), field('scenarioType', '场景类型', 'select', false, options('价格异议', '信任异议', '需求挖掘'))],
    fields: [field('title', '场景名称', 'text', true), field('template', '关联模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('scenarioType', '场景类型', 'select', true, options('价格异议', '信任异议', '需求挖掘')), field('difficulty', '难度', 'select', true, options('简单', '中等', '困难')), field('customerSays', '模拟客户说', 'textarea', true, undefined, 2), field('expectedPoints', '期望要点', 'textarea', true, undefined, 2)],
    columns: [column('title', '场景名称'), column('template', '关联模板'), column('scenarioType', '场景类型'), column('difficulty', '难度', 'status', 90), column('customerSays', '模拟客户说', 'text', 220), column('status', '状态', 'status', 100)], actions: configActions
  },
  {
    code: 'my-learn', group: 'learning', title: '我的话术学习', icon: 'Reading', kind: 'cards', primaryLabel: '新增学习计划',
    legacyPath: '/sales-system/sales-script/my-learn', description: '按SOP阶段学习话术并记录个人进度。',
    filters: [field('template', 'SOP模板', 'select', false, options('新人开场SOP', '异议处理SOP')), field('stage', '场景类型', 'select', false, options('开场', '需求确认', '异议处理'))],
    fields: [field('title', '学习计划', 'text', true), field('template', 'SOP模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('stage', '当前阶段', 'select', true, options('开场', '需求确认', '异议处理', '成交')), field('progress', '学习进度', 'number', true, undefined, 1, '%'), field('notes', '学习笔记', 'textarea', false, undefined, 2)],
    columns: [column('title', '模板名称'), column('stage', '当前阶段'), column('progress', '学习进度', 'progress', 180), column('startTime', '开始时间', 'datetime', 165), column('lastLearnTime', '最近学习', 'datetime', 165), column('status', '学习状态', 'status', 100)], actions: [action('start', '开始学习'), action('complete', '完成本阶段', 'success'), action('restore', '重新学习')], statLabels: ['学习中', '已完成', '本周学习', '总学习时长']
  },
  {
    code: 'team-learn', group: 'learning', title: '团队学习进度', icon: 'DataLine', kind: 'dashboard', primaryLabel: '登记学习任务',
    legacyPath: '/sales-system/sales-script/team-learn', description: '主管查看成员学习进度、停滞阶段和完成情况。',
    filters: [field('template', 'SOP模板', 'select', false, options('新人开场SOP', '异议处理SOP')), OWNER_FILTER],
    fields: [field('title', '员工姓名', 'text', true), field('template', 'SOP模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('progress', '学习进度', 'number', true, undefined, 1, '%'), field('lastLearnTime', '最近学习', 'datetime')],
    columns: [column('ownerName', '员工姓名'), column('template', 'SOP模板'), column('progress', '学习进度', 'progress', 200), column('status', '学习状态', 'status', 100), column('startTime', '开始时间', 'datetime', 165), column('lastLearnTime', '最近学习', 'datetime', 165), column('completeTime', '完成时间', 'datetime', 165)], actions: [action('start', '提醒学习'), action('complete', '标记完成', 'success'), action('restore', '重新开启')], statLabels: ['应学人数', '已开始', '已完成', '完成率']
  },
  {
    code: 'my-exam', group: 'learning', title: '我的话术考试', icon: 'EditPen', kind: 'exam', primaryLabel: '安排考核',
    legacyPath: '/sales-system/sales-script/my-exam', description: '完成个人话术考核、逐阶段作答并查看成绩。',
    filters: [field('template', 'SOP模板', 'select', false, options('全部', '新人开场SOP', '异议处理SOP'))],
    fields: [field('title', '考核名称', 'text', true), field('template', 'SOP模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('stage', '关联阶段', 'select', true, options('开场', '需求确认', '异议处理')), field('passScore', '及格分', 'number', true), field('duration', '时限', 'number', true, undefined, 1, '分钟'), field('attempts', '尝试次数', 'number', true)],
    columns: [column('title', '考核名称'), column('template', 'SOP模板'), column('stage', '关联阶段'), column('passScore', '及格分', 'score', 90), column('duration', '时限(分)', 'text', 100), column('attempts', '尝试次数', 'text', 100), column('status', '状态', 'status', 100)], actions: [action('start', '开始考核'), action('complete', '提交考核', 'success'), action('restore', '再次考核')]
  },
  {
    code: 'team-exam', group: 'learning', title: '团队考试记录', icon: 'Tickets', kind: 'table', primaryLabel: '登记考试记录',
    legacyPath: '/sales-system/sales-script/team-exam', description: '汇总成员考试成绩、通过情况、次数和用时。',
    filters: [field('exam', '考核项目', 'select', false, options('全部', '新人基础考核', '异议处理考核')), OWNER_FILTER],
    fields: [field('title', '考试项目', 'text', true), field('score', '得分', 'number', true), field('passed', '是否通过', 'switch'), field('attempts', '尝试次数', 'number'), field('duration', '用时', 'number', false, undefined, 1, '分钟')],
    columns: [column('ownerName', '姓名'), column('title', '考核名称'), column('score', '得分', 'score', 90), column('passed', '是否通过', 'boolean', 100), column('attempts', '尝试次数', 'text', 100), column('duration', '用时(分)', 'text', 100), column('bizDate', '考试时间', 'date', 120)], actions: [action('complete', '确认成绩', 'success'), action('restore', '安排补考')]
  },
  {
    code: 'simulation', group: 'learning', title: '话术模拟训练', icon: 'ChatDotRound', kind: 'exam', primaryLabel: '新增题目',
    legacyPath: '/sales-system/sales-script/simulation', description: '模拟客户对话，记录过程并提交评分。',
    filters: [field('template', 'SOP模板', 'select', false, options('全部模板', '新人开场SOP', '异议处理SOP')), field('difficulty', '难度', 'select', false, options('简单', '中等', '困难'))],
    fields: [field('title', '场景描述', 'textarea', true, undefined, 2), field('template', '关联模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('scenarioType', '场景类型', 'select', true, options('价格异议', '信任异议', '需求挖掘')), field('difficulty', '难度', 'select', true, options('简单', '中等', '困难')), field('customerSays', '模拟客户说', 'textarea', true, undefined, 2), field('expectedPoints', '期望要点', 'textarea', true, undefined, 2)],
    columns: [column('title', '场景描述', 'text', 230), column('template', '关联模板'), column('scenarioType', '场景类型'), column('difficulty', '难度', 'status', 90), column('score', '评分', 'score', 90), column('practiceTime', '演练时间', 'datetime', 165), column('status', '状态', 'status', 100)], actions: [action('start', '开始演练'), action('complete', '提交评分', 'success'), action('restore', '重新演练')]
  },
  {
    code: 'practice-score', group: 'learning', title: '实战评分', icon: 'Star', kind: 'table', primaryLabel: '新增评分',
    legacyPath: '/sales-system/sales-script/practice-score', description: '主管对销售实战表现进行分项评分与总体评价。',
    filters: [OWNER_FILTER, field('template', 'SOP模板', 'select', false, options('新人开场SOP', '异议处理SOP'))],
    fields: [field('title', '评分对象', 'text', true), field('template', 'SOP模板', 'select', true, options('新人开场SOP', '异议处理SOP')), field('stage', '关联阶段', 'select', true, options('开场', '需求确认', '异议处理')), field('score', '总分', 'number', true), field('fullScore', '满分', 'number', true), field('evaluation', '总体评价', 'textarea', true, undefined, 2)],
    columns: [column('ownerName', '被评人'), column('title', '评分主题'), column('template', '模板'), column('stage', '关联阶段'), column('score', '得分', 'score', 90), column('fullScore', '满分', 'score', 90), column('bizDate', '评分日期', 'date', 120), column('evaluation', '总体评价', 'text', 220)], actions: recordActions
  },
  {
    code: 'script-dashboard', group: 'learning', title: '话术训练看板', icon: 'DataBoard', kind: 'dashboard', primaryLabel: '登记训练数据',
    legacyPath: '/sales-system/sales-script/dashboard', description: '查看学习覆盖、考试通过、模拟训练和实战评分趋势。',
    filters: [DATE_FILTER, OWNER_FILTER], fields: [field('title', '统计主题', 'text', true), field('learnProgress', '学习进度', 'number', true), field('examScore', '考试得分', 'number', true), field('simulationScore', '模拟评分', 'number', true), field('practiceScore', '实战评分', 'number', true)],
    columns: [column('ownerName', '姓名'), column('learnProgress', '学习进度', 'progress', 170), column('examScore', '考试得分', 'score', 100), column('simulationScore', '模拟评分', 'score', 100), column('practiceScore', '实战评分', 'score', 100), column('passRate', '通过率', 'progress', 170)], actions: recordActions, statLabels: ['应学人数', '学习完成率', '考试通过率', '平均实战分']
  },

  // 管家中心 4页
  {
    code: 'consultant-report', group: 'consultant', title: '顾问业绩报表', icon: 'TrendCharts', kind: 'dashboard', primaryLabel: '登记业绩',
    legacyPath: '/consultant-management/performance-report', description: '按年月分析顾问续费、服务、增减和目标完成情况。',
    filters: [field('year', '年份', 'select', false, options('2026', '2025')), field('month', '月份', 'month'), OWNER_FILTER],
    fields: [field('title', '业绩主题', 'text', true), field('target', '目标金额', 'money', true), field('actual', '完成金额', 'money', true), field('renewalRate', '续费率', 'number', true, undefined, 1, '%'), field('customerCount', '服务客户', 'number', true, undefined, 1, '户'), field('remark', '业绩说明', 'textarea', false, undefined, 2)],
    columns: [column('ownerName', '顾问'), column('deptName', '部门'), column('target', '目标金额', 'money', 130), column('actual', '完成金额', 'money', 130), column('renewalRate', '续费率', 'progress', 180), column('customerCount', '服务户数', 'text', 100), column('status', '目标状态', 'status', 110)], actions: recordActions, statLabels: ['目标金额', '完成金额', '续费率', '服务客户']
  },
  {
    code: 'all-performance', group: 'consultant', title: '全员绩效', icon: 'User', kind: 'table', primaryLabel: '新增绩效授权',
    legacyPath: '/consultant-management/all-performance', description: '授权并查看全员绩效数据范围。',
    filters: [OWNER_FILTER, field('permissionType', '权限类型', 'select', false, options('查看本人', '查看部门', '查看全员'))],
    fields: [field('title', '授权名称', 'text', true), field('permissionType', '权限类型', 'select', true, options('查看本人', '查看部门', '查看全员')), field('authorizedBy', '授权人', 'text', true), field('remark', '授权说明', 'textarea', false, undefined, 2)],
    columns: [column('ownerName', '姓名'), column('permissionType', '权限类型', 'status', 110), column('authorizedBy', '授权人'), column('bizDate', '授权时间', 'date', 120), column('status', '状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'dept-performance', group: 'consultant', title: '部门绩效', icon: 'Histogram', kind: 'analysis', primaryLabel: '登记部门绩效',
    legacyPath: '/consultant-management/dept-performance', description: '按部门和年度汇总目标、完成、排名与趋势。',
    filters: [field('year', '年份', 'select', false, options('2026', '2025')), field('dept', '部门', 'select', false, options('销售部', '顾问部', '会计部'))],
    fields: [field('title', '部门', 'text', true), field('target', '年度目标', 'money', true), field('actual', '实际完成', 'money', true), field('score', '绩效得分', 'number', true), field('headcount', '人数', 'number', true)],
    columns: [column('title', '部门'), column('target', '年度目标', 'money', 130), column('actual', '实际完成', 'money', 130), column('completionRate', '完成率', 'progress', 180), column('score', '绩效得分', 'score', 100), column('headcount', '人数', 'text', 90)], actions: recordActions, statLabels: ['部门数', '目标总额', '完成总额', '平均完成率']
  },
  {
    code: 'performance-template', group: 'consultant', title: '绩效模板', icon: 'Document', kind: 'config', primaryLabel: '新增绩效考核模板',
    legacyPath: '/consultant-management/performance-template', description: '配置考核分组、指标、权重、标准和适用人员。',
    filters: [field('groupName', '考核分组', 'select', false, options('业绩指标', '客户服务', '团队协作')), field('indicator', '考核指标')],
    fields: [field('title', '模板名称', 'text', true), field('groupName', '考核分组', 'select', true, options('业绩指标', '客户服务', '团队协作')), field('groupWeight', '分组权重', 'number', true, undefined, 1, '%'), field('indicator', '考核指标', 'text', true), field('indicatorWeight', '指标权重', 'number', true, undefined, 1, '%'), field('standard', '指标标准', 'textarea', true, undefined, 2)],
    columns: [column('title', '模板名称'), column('groupName', '考核分组'), column('groupWeight', '分组权重', 'progress', 170), column('indicator', '考核指标'), column('indicatorWeight', '指标权重', 'progress', 170), column('status', '状态', 'status', 100)], actions: configActions
  },

  // 管理体系 9页
  {
    code: 'address-service', group: 'management', title: '地址服务中心', icon: 'MapLocation', kind: 'table', primaryLabel: '新增地址服务',
    legacyPath: '/business-management/address', description: '管理托管地址、到期续费、服务人员、查重与报销。',
    filters: [field('enterpriseType', '企业性质', 'select', false, options('小规模', '一般纳税人', '个体户')), field('serviceStatus', '服务状态', 'select', false, options('服务中', '待续费', '已到期')), OWNER_FILTER],
    fields: [field('title', '公司名称', 'text', true), field('address', '托管地址', 'textarea', true, undefined, 2), field('enterpriseType', '企业性质', 'select', true, options('小规模', '一般纳税人', '个体户')), field('expireDate', '到期时间', 'date', true), field('serviceStaff', '服务人员', 'text', true), field('level', '企业等级', 'select', false, options('一星', '二星', '三星', '四星', '五星')), field('remark', '备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '公司名称', 'text', 210), column('address', '托管地址', 'text', 220), column('enterpriseType', '企业性质'), column('serviceStaff', '服务人员'), column('expireDate', '到期时间', 'date', 120), column('daysRemaining', '倒计天数', 'text', 100), column('level', '企业等级', 'status', 100), column('status', '服务状态', 'status', 110)], actions: approvalActions, tabs: options('全部客户', '即将到期', '服务人员缺失', '重复公司'), notes: ['支持导出、同步代账、公司查重、批量更换服务人员、续费记录和报销明细。']
  },
  {
    code: 'supplier', group: 'management', title: '供应商管理', icon: 'Shop', kind: 'table', primaryLabel: '新增地址商',
    legacyPath: '/business-management/supplier', description: '维护地址商户、联系人、电话和合作备注。',
    filters: [field('merchant', '地址商户'), field('contact', '联系人员')],
    fields: [field('title', '地址商户', 'text', true), field('contact', '联系人员', 'text', true), field('phone', '联系电话', 'text', true), field('address', '服务地址', 'textarea', false, undefined, 2), field('remark', '备注信息', 'textarea', false, undefined, 2)],
    columns: [column('title', '地址商户', 'text', 200), column('contact', '联系人员'), column('phone', '联系电话'), column('address', '服务地址', 'text', 220), column('remark', '备注信息', 'text', 220), column('status', '状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'accounting-handover', group: 'management', title: '代账交接审核', icon: 'Switch', kind: 'handover', primaryLabel: '新增交接单',
    legacyPath: '/accounting-management/handover', description: '核对订单与交接资料，审核后转为代账合同。',
    filters: [field('orderNo', '订单编号'), field('companyName', '公司名称'), STATUS_FILTER],
    fields: [field('title', '公司名称', 'text', true), field('orderNo', '订单编号', 'text', true), field('fromStaff', '移交人', 'text', true), field('toStaff', '接收人', 'text', true), field('handoverItems', '交接资料', 'textarea', true, undefined, 2), field('auditRemark', '审核备注', 'textarea', false, undefined, 2)],
    columns: [column('orderNo', '订单编号', 'text', 160), column('title', '公司名称', 'text', 210), column('fromStaff', '移交人'), column('toStaff', '接收人'), column('handoverStatus', '交接状态', 'status', 110), column('bizDate', '创建时间', 'date', 120), column('status', '审核状态', 'status', 110)], actions: approvalActions, tabs: options('待审核', '已通过', '已驳回', '已转合同'), notes: ['审核通过后可执行“转为合同”，正式转换仍需后续接入订单合同事实源。']
  },
  {
    code: 'staff-handover', group: 'management', title: '人员交接工作台', icon: 'Connection', kind: 'handover', primaryLabel: '发起人员交接',
    legacyPath: '/order/staffHandover/workbench', description: '预览并执行人员、合同、地址托管等责任交接。',
    filters: [field('fromStaff', '源人员'), field('toStaff', '目标人员'), STATUS_FILTER],
    fields: [field('title', '交接批次', 'text', true), field('fromStaff', '源人员', 'text', true), field('toStaff', '目标人员', 'text', true), field('handoverRole', '交接角色', 'select', true, options('财税主管', '财税顾问', '主办会计')), field('contractCount', '代账合同', 'number'), field('addressCount', '地址托管', 'number'), field('detail', '交接说明', 'textarea', false, undefined, 2)],
    columns: [column('title', '交接批次'), column('fromStaff', '源人员'), column('toStaff', '目标人员'), column('handoverRole', '交接角色'), column('contractCount', '代账合同', 'text', 100), column('addressCount', '地址托管', 'text', 100), column('bizDate', '操作时间', 'date', 120), column('status', '执行状态', 'status', 110)], actions: approvalActions, tabs: options('交接配置', '预览结果', '执行记录')
  },
  {
    code: 'enterprise-level', group: 'management', title: '企业等级配置', icon: 'Star', kind: 'config', primaryLabel: '新增星级标准',
    legacyPath: '/accounting-management/enterprise-level', description: '按消费、购买、服务时间和业务贡献配置企业星级。',
    filters: [field('level', '星级', 'select', false, options('一星', '二星', '三星', '四星', '五星'))],
    fields: [field('title', '星级名称', 'text', true), field('level', '星级', 'rate', true), field('consumption', '消费金额', 'money', true), field('purchaseCount', '购买次数', 'number', true), field('serviceMonths', '服务时间', 'number', true, undefined, 1, '月'), field('premiumBusiness', '高端业务', 'number'), field('referralCount', '转介绍数', 'number'), field('relationCount', '关联数量', 'number')],
    columns: [column('level', '星级', 'score', 100), column('consumption', '消费金额', 'money', 130), column('purchaseCount', '购买次数', 'text', 100), column('serviceMonths', '服务时间(月)', 'text', 120), column('premiumBusiness', '高端业务', 'text', 100), column('referralCount', '转介绍数', 'text', 100), column('relationCount', '关联数量', 'text', 100), column('status', '状态', 'status', 100)], actions: configActions
  },
  {
    code: 'audit-process', group: 'management', title: '审核流程', icon: 'Guide', kind: 'config', primaryLabel: '添加审核流程',
    legacyPath: '/management/audit-process', description: '维护流程编码、审核步骤、角色和启停状态。',
    filters: [field('processName', '流程名称'), field('processCode', '流程编码')],
    fields: [field('title', '流程名称', 'text', true), field('processCode', '流程编码', 'text', true), field('steps', '审核步骤', 'textarea', true, undefined, 2), field('description', '流程说明', 'textarea', false, undefined, 2)],
    columns: [column('title', '流程名称'), column('processCode', '流程编码'), column('steps', '审核步骤', 'text', 260), column('status', '状态', 'status', 100), column('updateTime', '更新时间', 'datetime', 165)], actions: configActions
  },
  {
    code: 'business-process', group: 'management', title: '业务流程', icon: 'Share', kind: 'config', primaryLabel: '添加业务流程',
    legacyPath: '/management/business-process', description: '配置业务步骤、负责人和业务状态流转。',
    filters: [field('processName', '流程名称'), field('processCode', '流程编码')],
    fields: [field('title', '流程名称', 'text', true), field('processCode', '流程编码', 'text', true), field('steps', '业务步骤', 'textarea', true, undefined, 2), field('description', '流程说明', 'textarea', false, undefined, 2)],
    columns: [column('title', '流程名称'), column('processCode', '流程编码'), column('steps', '业务步骤', 'text', 260), column('status', '状态', 'status', 100), column('updateTime', '更新时间', 'datetime', 165)], actions: configActions
  },
  {
    code: 'dynamic-form', group: 'management', title: '动态表单', icon: 'Grid', kind: 'config', primaryLabel: '添加表单',
    legacyPath: '/management/dynamic-form', description: '配置表单编码、版本、字段结构与业务绑定。',
    filters: [field('formName', '表单名称'), field('formCode', '表单编码')],
    fields: [field('title', '表单名称', 'text', true), field('formCode', '表单编码', 'text', true), field('description', '描述', 'textarea', false, undefined, 2), field('versionName', '当前版本', 'text', true), field('schema', '字段结构', 'textarea', true, undefined, 2)],
    columns: [column('title', '表单名称'), column('formCode', '表单编码'), column('description', '描述', 'text', 220), column('versionName', '当前版本'), column('status', '状态', 'status', 100), column('updateTime', '更新时间', 'datetime', 165)], actions: configActions, notes: ['支持复制表单和版本化保存；不会改写现有浙杭审批表单。']
  },
  {
    code: 'homepage-config', group: 'management', title: '首页配置', icon: 'Monitor', kind: 'config', primaryLabel: '新增首页模块',
    legacyPath: '/management/homepage-config', description: '编排首页模块、分类、布局模板和显示顺序。',
    filters: [field('moduleName', '模块名称'), field('moduleKey', '模块标识'), field('category', '所属分类', 'select', false, options('数据看板', '快捷入口', '待办提醒'))],
    fields: [field('title', '模块名称', 'text', true), field('moduleKey', '模块标识', 'text', true), field('category', '所属分类', 'select', true, options('数据看板', '快捷入口', '待办提醒')), field('layout', '应用布局模板', 'select', true, options('单列', '双列', '三列')), field('sortNo', '排序号', 'number'), field('description', '模块说明', 'textarea', false, undefined, 2)],
    columns: [column('title', '模块名称'), column('moduleKey', '模块标识'), column('category', '所属分类'), column('layout', '布局模板'), column('sortNo', '排序号', 'text', 90), column('status', '状态', 'status', 100)], actions: configActions, tabs: options('模块配置', '布局编排', '效果预览')
  },

  // 财务中心 7页
  {
    code: 'fixed-asset', group: 'finance', title: '固定资产', icon: 'Box', kind: 'table', primaryLabel: '新增资产',
    legacyPath: '/finance-management/fixed-asset', description: '登记资产采购、数量、金额、部门、使用人和状态。',
    filters: [field('assetName', '资产名称'), field('assetStatus', '资产状态', 'select', false, options('在用', '闲置', '维修', '报废'))],
    fields: [field('title', '资产名称', 'text', true), field('purchaseDate', '购买日期', 'date', true), field('quantity', '购买数量', 'number', true), field('amount', '购买金额', 'money', true), field('useDept', '使用部门', 'text', true), field('usePerson', '使用人员', 'text'), field('assetStatus', '资产状态', 'select', true, options('在用', '闲置', '维修', '报废')), field('remark', '备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '资产名称'), column('purchaseDate', '购买日期', 'date', 120), column('quantity', '购买数量', 'text', 100), column('amount', '购买金额', 'money', 120), column('useDept', '使用部门'), column('usePerson', '使用人员'), column('assetStatus', '资产状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'referral-audit', group: 'finance', title: '转介绍审核', icon: 'Connection', kind: 'table', primaryLabel: '新增转介绍',
    legacyPath: '/finance-management/referral-audit', description: '审核推荐公司、新签公司和转介绍奖励。',
    filters: [field('referrerCompany', '推荐公司'), field('newCompany', '新签公司'), STATUS_FILTER],
    fields: [field('title', '新签公司', 'text', true), field('referrerCompany', '推荐公司', 'text', true), field('newCompany', '新签公司', 'text', true), field('rewardAmount', '奖励金额', 'money', true), field('currentStep', '当前步骤', 'text'), field('remark', '审核备注', 'textarea', false, undefined, 2)],
    columns: [column('referrerCompany', '推荐公司', 'text', 200), column('newCompany', '新签公司', 'text', 200), column('rewardAmount', '奖励金额', 'money', 120), column('currentStep', '当前步骤'), column('bizDate', '提交时间', 'date', 120), column('status', '审核结果', 'status', 110), column('auditTime', '审核时间', 'datetime', 165)], actions: approvalActions
  },
  {
    code: 'renewal-audit', group: 'finance', title: '续费审核', icon: 'Refresh', kind: 'table', primaryLabel: '新增续费审核',
    legacyPath: '/finance-management/renewal-audit', description: '核对续费类型、应续金额、到款、账户和到期月份。',
    filters: [field('companyName', '公司名称'), field('renewalType', '续费类型', 'select', false, options('代理记账', '地址托管', '其他')), STATUS_FILTER],
    fields: [field('title', '公司名称', 'text', true), field('renewalType', '续费类型', 'select', true, options('代理记账', '地址托管', '其他')), field('receivableAmount', '应续费金额', 'money', true), field('receivedAmount', '到款金额', 'money', true), field('bankAccount', '到款账户', 'select', true, options('工商银行', '建设银行', '支付宝')), field('paymentTime', '收款时间', 'datetime'), field('expireMonth', '到期月份', 'month', true), field('remark', '备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '公司名称', 'text', 210), column('renewalType', '续费类型'), column('receivableAmount', '应续金额', 'money', 120), column('receivedAmount', '到款金额', 'money', 120), column('bankAccount', '到款账户'), column('paymentTime', '收款时间', 'datetime', 165), column('expireMonth', '到期月份'), column('status', '审核状态', 'status', 110)], actions: approvalActions, tabs: options('待审核', '审核通过', '已驳回', '差额待补')
  },
  {
    code: 'bank-diary', group: 'finance', title: '银行日记账', icon: 'Notebook', kind: 'table', primaryLabel: '新增银行日记',
    legacyPath: '/finance-management/bank-diary', description: '登记收支、资金转移、账户、类目和审核状态。',
    filters: [DATE_FILTER, field('companyName', '公司名称'), field('businessType', '业务类型', 'select', false, options('收入', '支出', '资金转移', '报销')), field('bankAccount', '银行账户')],
    fields: [field('title', '收付款单位/人', 'text', true), field('businessType', '业务类型', 'select', true, options('收入', '支出', '资金转移', '报销')), field('expenseCategory', '报销类目', 'select', false, options('差旅费', '办公费', '业务招待费')), field('bankAccount', '银行账户', 'text', true), field('sourceAccount', '源账户', 'text'), field('targetAccount', '目标账户', 'text'), field('amount', '金额', 'money', true), field('detail', '费用详情', 'textarea', false, undefined, 2)],
    columns: [column('bizDate', '创建日期', 'date', 120), column('title', '收付款单位/人', 'text', 190), column('businessType', '业务类型'), column('expenseCategory', '报销类目'), column('bankAccount', '银行账户'), column('amount', '收支金额', 'money', 120), column('status', '审核状态', 'status', 110)], actions: approvalActions, tabs: options('全部流水', '待确认', '收入', '支出', '资金转移')
  },
  {
    code: 'upgrade-management', group: 'finance', title: '升级管理', icon: 'Top', kind: 'table', primaryLabel: '新增升级申请',
    legacyPath: '/finance-management/upgrade-management', description: '核对合约金额、到款、尾款和升级审批。',
    filters: [field('companyName', '公司名称'), STATUS_FILTER],
    fields: [field('title', '公司名称', 'text', true), field('contractNo', '合约编号', 'text', true), field('contractAmount', '合约金额', 'money', true), field('receivedAmount', '到款金额', 'money', true), field('balanceAmount', '尾款金额', 'money'), field('difference', '金额差额', 'money'), field('remark', '说明', 'textarea', false, undefined, 2)],
    columns: [column('bizDate', '提交时间', 'date', 120), column('title', '公司名称', 'text', 210), column('contractNo', '合约编号', 'text', 160), column('contractAmount', '合约金额', 'money', 120), column('receivedAmount', '到款金额', 'money', 120), column('balanceAmount', '尾款金额', 'money', 120), column('difference', '金额差额', 'money', 120), column('status', '当前状态', 'status', 110)], actions: approvalActions
  },
  {
    code: 'bank-account', group: 'finance', title: '银行账户', icon: 'CreditCard', kind: 'table', primaryLabel: '新增账户',
    legacyPath: '/finance-management/bank-account', description: '维护收款主体、方式、账户、网点、备注与收款码。',
    filters: [field('payee', '收款单位/人'), field('account', '收款账户'), field('method', '收款方式', 'select', false, options('银行转账', '支付宝', '微信'))],
    fields: [field('title', '收款单位/人', 'text', true), field('method', '收款方式', 'select', true, options('银行转账', '支付宝', '微信')), field('account', '收款账户', 'text', true), field('branch', '网点名称', 'text'), field('hidden', '是否隐藏', 'switch'), field('qrCode', '收款码说明', 'text'), field('remark', '收款备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '收款单位/人', 'text', 180), column('method', '收款方式'), column('account', '收款账户', 'text', 190), column('branch', '网点名称', 'text', 180), column('qrCode', '收款码', 'text', 140), column('hidden', '是否隐藏', 'boolean', 100), column('status', '状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'collection-script', group: 'finance', title: '催收话术', icon: 'ChatLineRound', kind: 'config', primaryLabel: '新增话术',
    legacyPath: '/finance-management/collection-script', description: '按催收轮次和场景维护话术，并保留润色版本。',
    filters: [field('round', '催收轮次', 'select', false, options('首次提醒', '二次催收', '最后通知')), field('scene', '使用场景'), STATUS_FILTER],
    fields: [field('title', '话术标题', 'text', true), field('round', '催收轮次', 'select', true, options('首次提醒', '二次催收', '最后通知')), field('scene', '使用场景', 'text', true), field('content', '话术内容', 'textarea', true, undefined, 2), field('tone', '沟通语气', 'select', false, options('专业', '亲切', '简洁', '有说服力')), field('sortNo', '排序序号', 'number')],
    columns: [column('round', '催收轮次'), column('title', '话术标题', 'text', 200), column('scene', '使用场景', 'text', 180), column('content', '话术内容', 'text', 260), column('sortNo', '排序', 'text', 80), column('status', '状态', 'status', 100)], actions: configActions, notes: ['AI润色仅保留入口和版本记录；未接入真实AI前不会伪造润色结果。']
  },

  // 知识智库 4页
  {
    code: 'product-knowledge', group: 'knowledge', title: '产品知识库', icon: 'Reading', kind: 'cards', primaryLabel: '新增产品',
    legacyPath: '/knowledge-management/product', description: '维护产品分类、报价、交付时间、简介和浏览热度。',
    filters: [field('productName', '产品名称'), field('category', '所属分类', 'select', false, options('工商服务', '财税服务', '地址服务')), STATUS_FILTER],
    fields: [field('title', '产品名称', 'text', true), field('productCode', '产品编码', 'text', true), field('category', '所属分类', 'select', true, options('工商服务', '财税服务', '地址服务')), field('marketPrice', '市场报价', 'money', true), field('floorPrice', '最低报价', 'money', true), field('deliveryDays', '所需时间', 'number', true, undefined, 1, '天'), field('summary', '产品简介', 'textarea', true, undefined, 2), field('remark', '备注信息', 'textarea', false, undefined, 2)],
    columns: [column('title', '产品名称', 'text', 210), column('productCode', '产品编码'), column('category', '所属分类'), column('marketPrice', '市场报价', 'money', 120), column('floorPrice', '最低报价', 'money', 120), column('deliveryDays', '所需时间(天)', 'text', 120), column('views', '浏览量', 'text', 90), column('status', '状态', 'status', 100)], actions: recordActions, tabs: options('全部产品', '工商服务', '财税服务', '地址服务')
  },
  {
    code: 'faq', group: 'knowledge', title: '常见问题库', icon: 'QuestionFilled', kind: 'table', primaryLabel: '新增FAQ',
    legacyPath: '/knowledge-management/faq', description: '沉淀常见问题、分类、标准答案和可出题状态。',
    filters: [field('category', '分类', 'select', false, options('产品', '流程', '销售', '交付')), field('question', '搜索问题'), field('canQuestion', '可出题', 'select', false, options('是', '否'))],
    fields: [field('title', '问题', 'textarea', true, undefined, 2), field('category', '分类', 'select', true, options('产品', '流程', '销售', '交付')), field('answer', '标准答案', 'textarea', true, undefined, 2), field('canQuestion', '可出题', 'switch'), field('versionName', '版本', 'text', true)],
    columns: [column('title', '问题', 'text', 280), column('category', '分类'), column('answer', '标准答案', 'text', 300), column('canQuestion', '可出题', 'boolean', 90), column('versionName', '版本', 'text', 90), column('status', '状态', 'status', 100)], actions: recordActions, notes: ['支持分类管理和从已核准FAQ批量生成题目。']
  },
  {
    code: 'settlement-rule', group: 'knowledge', title: '产品结算规则', icon: 'DocumentChecked', kind: 'table', primaryLabel: '新增项目',
    legacyPath: '/knowledge-management/settlement', description: '维护交付部门、业务类型和内部结算标准。',
    filters: [field('deliveryDept', '交付部门', 'select', false, options('工商部', '会计部', '顾问部')), field('businessCategory', '业务大类')],
    fields: [field('title', '业务类型', 'text', true), field('deliveryDept', '交付部门', 'select', true, options('工商部', '会计部', '顾问部')), field('businessCategory', '业务大类', 'text', true), field('settlementStandard', '结算标准', 'money', true), field('remark', '备注信息', 'textarea', false, undefined, 2)],
    columns: [column('deliveryDept', '交付部门'), column('businessCategory', '业务大类'), column('title', '业务类型', 'text', 200), column('settlementStandard', '结算标准', 'money', 130), column('remark', '备注信息', 'text', 250), column('status', '状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'ai-product', group: 'knowledge', title: 'AI产品中心', icon: 'MagicStick', kind: 'cards', primaryLabel: '新增AI产品',
    legacyPath: '/knowledge/ai-products', description: '统一展示智能体、报告生成器和可用范围。',
    filters: [field('productName', '搜索智能体'), field('category', '产品分类', 'select', false, options('企业分析', '风险报告', '知识问答'))],
    fields: [field('title', 'AI产品名称', 'text', true), field('category', '产品分类', 'select', true, options('企业分析', '风险报告', '知识问答')), field('description', '产品说明', 'textarea', true, undefined, 2), field('inputFields', '输入字段', 'textarea', true, undefined, 2), field('outputType', '输出类型', 'select', true, options('在线报告', 'PPT', '问答结果'))],
    columns: [column('title', '产品名称', 'text', 200), column('category', '产品分类'), column('description', '能力说明', 'text', 260), column('outputType', '输出类型'), column('useCount', '使用次数', 'text', 100), column('status', '状态', 'status', 100)], actions: recordActions, tabs: options('全部智能体', '企业分析', '风险报告', '知识问答'), notes: ['产品卡片和输入表单可完整验收；真实生成能力必须后续接入事实接口，当前不生成虚假报告。']
  },

  // 人事中心 5页（路由并入/hrm）
  {
    code: 'probation', group: 'hr', title: '转正管理', icon: 'CircleCheck', kind: 'handover', primaryLabel: '发起转正申请',
    legacyPath: '/human-resource/probation', description: '转正申请、自评、综合考评、合同签署和审批记录。',
    filters: [field('employeeName', '姓名'), field('team', '所属团队', 'select', false, options('销售部', '顾问部', '会计部')), STATUS_FILTER],
    fields: [field('title', '员工姓名', 'text', true), field('account', '员工账号', 'text', true), field('team', '所属团队', 'select', true, options('销售部', '顾问部', '会计部')), field('joinDate', '入职时间', 'date', true), field('manager', '直属上级', 'text', true), field('selfEvaluation', '自我评价', 'textarea', true, undefined, 2), field('managerEvaluation', '综合考评', 'textarea', false, undefined, 2)],
    columns: [column('title', '员工姓名'), column('account', '员工账号'), column('team', '所属团队'), column('joinDate', '入职时间', 'date', 120), column('manager', '直属上级'), column('status', '当前状态', 'status', 110), column('updateTime', '最近处理', 'datetime', 165)], actions: approvalActions, tabs: options('转正申请', '自我评价', '综合考评', '审批记录'), notes: ['合同签署仅展示真实合同入口，不生成或覆盖现有劳动合同。']
  },
  {
    code: 'resignation', group: 'hr', title: '离职管理', icon: 'RemoveFilled', kind: 'handover', primaryLabel: '发起离职申请',
    legacyPath: '/human-resource/resign', description: '离职申请、工作/权限/财务/资产交接和审批。',
    filters: [field('employeeName', '姓名'), field('team', '所属团队', 'select', false, options('销售部', '顾问部', '会计部')), STATUS_FILTER],
    fields: [field('title', '员工姓名', 'text', true), field('account', '员工账号', 'text', true), field('team', '所属团队', 'select', true, options('销售部', '顾问部', '会计部')), field('leaveDate', '离职时间', 'date', true), field('manager', '直属上级', 'text', true), field('successor', '工作接手人', 'text', true), field('hrOwner', '人事专员', 'text', true), field('reason', '离职原因', 'textarea', true, undefined, 2), field('handoverItems', '交接明细', 'textarea', true, undefined, 2)],
    columns: [column('title', '员工姓名'), column('account', '员工账号'), column('team', '所属团队'), column('leaveDate', '离职时间', 'date', 120), column('successor', '接手人'), column('hrOwner', '人事专员'), column('status', '当前状态', 'status', 110)], actions: approvalActions, tabs: options('离职申请', '工作交接', '权限交接', '财务交接', '资产交接')
  },
  {
    code: 'team', group: 'hr', title: '团队管理', icon: 'UserFilled', kind: 'table', primaryLabel: '添加团队',
    legacyPath: '/human-resource/team', description: '维护团队名称、编码、负责人、描述和排序。',
    filters: [field('teamName', '团队名称'), field('teamCode', '团队编码'), STATUS_FILTER],
    fields: [field('title', '团队名称', 'text', true), field('teamCode', '团队编码', 'text', true), field('leader', '团队负责人', 'text', true), field('description', '团队描述', 'textarea', false, undefined, 2), field('sortNo', '排序号', 'number')],
    columns: [column('title', '团队名称'), column('teamCode', '团队编码'), column('leader', '团队负责人'), column('description', '团队描述', 'text', 250), column('status', '状态', 'status', 100), column('sortNo', '排序号', 'text', 90)], actions: recordActions
  },
  {
    code: 'contact', group: 'hr', title: '员工通讯录', icon: 'Postcard', kind: 'table', primaryLabel: '新增通讯录记录',
    legacyPath: '/human-resource/contact', description: '查看员工工作号码、私人号码、紧急联系人和团队。',
    filters: [field('employeeName', '员工姓名'), field('workPhone', '工作号码'), field('privatePhone', '私人号码')],
    fields: [field('title', '员工姓名', 'text', true), field('workPhone', '工作号码', 'text', true), field('privatePhone', '私人号码', 'text'), field('emergencyContact', '紧急联系人', 'text'), field('emergencyPhone', '紧急电话', 'text'), field('team', '所属团队', 'text', true)],
    columns: [column('title', '员工姓名'), column('workPhone', '工作号码'), column('privatePhone', '私人号码'), column('emergencyContact', '紧急联系'), column('emergencyPhone', '紧急电话'), column('team', '所属团队'), column('status', '当前状态', 'status', 100)], actions: recordActions
  },
  {
    code: 'dept-incentive', group: 'hr', title: '部门激励', icon: 'Trophy', kind: 'table', primaryLabel: '新增激励',
    legacyPath: '/human-resource/dept-incentive', description: '配置部门奖励项目、要求、达标人员和奖金。',
    filters: [field('sourceMonth', '源月份', 'month'), field('targetMonth', '目标月份', 'month'), field('dept', '参与部门')],
    fields: [field('title', '奖励项目', 'text', true), field('sourceMonth', '源月份', 'month', true), field('targetMonth', '目标月份', 'month', true), field('dept', '参与部门', 'text', true), field('rewardDetail', '奖励明细', 'textarea', true, undefined, 2), field('requirement', '奖励要求', 'textarea', true, undefined, 2), field('qualifiedPeople', '达标人员', 'text'), field('amount', '合计奖金', 'money', true)],
    columns: [column('title', '奖励项目'), column('dept', '参与部门'), column('rewardDetail', '奖励明细', 'text', 220), column('requirement', '奖励要求', 'text', 220), column('qualifiedPeople', '达标人员'), column('amount', '合计奖金', 'money', 120), column('status', '状态', 'status', 100)], actions: approvalActions, notes: ['一键生成只生成本模块草稿，不写入现有浙杭绩效或工资事实表。']
  },

  // 工资管理 8页
  {
    code: 'salary-info', group: 'salary', title: '薪资信息', icon: 'User', kind: 'salary', primaryLabel: '新增人员',
    legacyPath: '/salary-management/info', description: '维护员工职位、星级、基本工资、绩效和补贴。',
    filters: [OWNER_FILTER],
    fields: [field('title', '员工姓名', 'text', true), field('position', '当前职位', 'text', true), field('level', '当前星级', 'select', true, options('一星', '二星', '三星', '四星', '五星')), field('baseSalary', '基本工资', 'money', true), field('performanceSalary', '绩效工资', 'money'), field('fundAllowance', '公积金补贴', 'money'), field('remark', '备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '员工姓名'), column('position', '当前职位'), column('level', '当前星级', 'status', 100), column('baseSalary', '基本工资', 'money', 120), column('performanceSalary', '绩效工资', 'money', 120), column('fundAllowance', '公积金补贴', 'money', 130), column('status', '状态', 'status', 100)], actions: salaryActions
  },
  {
    code: 'salary-payment', group: 'salary', title: '薪资发放', icon: 'Money', kind: 'salary', primaryLabel: '批量创建',
    legacyPath: '/salary-management/payment', description: '按月份生成、审核、锁定并确认工资发放。',
    filters: [OWNER_FILTER, field('salaryMonth', '月份', 'month'), STATUS_FILTER],
    fields: [field('title', '员工姓名', 'text', true), field('position', '当前职位', 'text', true), field('level', '当前星级', 'select', true, options('一星', '二星', '三星', '四星', '五星')), field('salaryMonth', '发放月份', 'month', true), field('baseSalary', '基本工资', 'money', true), field('performanceSalary', '绩效工资', 'money'), field('fundAllowance', '公积金补贴', 'money'), field('deduction', '扣款', 'money'), field('netSalary', '实发工资', 'money', true)],
    columns: [column('title', '员工姓名'), column('position', '当前职位'), column('level', '当前星级', 'status', 100), column('salaryMonth', '发放月份'), column('baseSalary', '基本工资', 'money', 120), column('performanceSalary', '绩效工资', 'money', 120), column('fundAllowance', '公积金补贴', 'money', 130), column('netSalary', '实发工资', 'money', 120), column('status', '状态', 'status', 100)], actions: salaryActions, tabs: options('待生成', '待审核', '待发放', '已发放')
  },
  ...[
    ['salary-detail', '薪资明细', '/salary-management/detail', '代理记账团队薪资明细', '服务户数、单价、户数提成、星级奖励和实发提成。'],
    ['salary-detail-wx', '微信团队薪资明细', '/salary-management/detail-wx', '微信团队薪资明细', '微信团队服务户数、提成、星级奖励和业绩金额。'],
    ['salary-detail-yy', '运营团队薪资明细', '/salary-management/detail-yy', '运营团队薪资明细', '运营团队线索、代理记账和业绩提成。'],
    ['salary-detail-fb', '法务团队薪资明细', '/salary-management/detail-fb', '法务团队薪资明细', '法务团队一般纳税人、小规模和零申报户数计酬。'],
    ['salary-detail-gs', '工商团队薪资明细', '/salary-management/detail-gs', '工商团队薪资明细', '工商业务提成、审核流程和付款明细。'],
    ['salary-detail-kj', '会计团队薪资明细', '/salary-management/detail-kj', '会计团队薪资明细', '会计服务类型、户数、单价、星级和提成。']
  ].map(([code, title, legacyPath, primaryLabel, description]) => ({
    code, group: 'salary' as const, title, icon: 'Coin', kind: 'salary' as const, primaryLabel, legacyPath, description,
    filters: [field('salaryMonth', '月份', 'month'), OWNER_FILTER, field('team', '团队', 'select', false, options('微信团队', '运营团队', '法务团队', '工商团队', '会计团队'))],
    fields: [field('title', '员工姓名', 'text', true), field('salaryMonth', '月份', 'month', true), field('team', '团队', 'select', true, options('微信团队', '运营团队', '法务团队', '工商团队', '会计团队')), field('level', '星级', 'select', true, options('一星', '二星', '三星', '四星', '五星')), field('serviceCount', '服务户数', 'number'), field('unitPrice', '单价', 'money'), field('commission', '实发提成', 'money', true), field('performanceAmount', '业绩金额', 'money'), field('remark', '备注', 'textarea', false, undefined, 2)],
    columns: [column('title', '姓名'), column('salaryMonth', '月份'), column('team', '团队'), column('level', '星级', 'status', 90), column('serviceCount', '服务户数', 'text', 100), column('unitPrice', '单价', 'money', 100), column('commission', '实发提成', 'money', 120), column('performanceAmount', '业绩金额', 'money', 120), column('status', '状态', 'status', 100)],
    actions: salaryActions, tabs: options('薪资明细', '单价配置', '匹配条件', '人员范围'), notes: code === 'salary-detail-gs' ? ['工商页保留“提交审核、审核详情、驳回、转交审核人、提成配置”工作流。'] : ['支持单价配置、匹配条件、人员范围、导出、锁定和解锁。']
  })),

  // 报销管理 2页
  {
    code: 'reimbursement-list', group: 'reimbursement', title: '报销管理', icon: 'Document', kind: 'table', primaryLabel: '新增报销',
    legacyPath: '/reimbursement-management/list', description: '提交报销、补录未报成本并查看审核状态。',
    filters: [DATE_FILTER, OWNER_FILTER, field('category', '报销类目', 'select', false, options('差旅费', '办公费', '业务招待费', '地址成本')), STATUS_FILTER],
    fields: [field('title', '报销事项', 'text', true), field('category', '报销类目', 'select', true, options('差旅费', '办公费', '业务招待费', '地址成本')), field('companyName', '公司名称', 'text'), field('amount', '报销金额', 'money', true), field('expenseDate', '报销时间', 'date', true), field('team', '所属团队', 'text', true), field('remark', '备注信息', 'textarea', true, undefined, 2)],
    columns: [column('expenseDate', '报销时间', 'date', 120), column('ownerName', '报销人员'), column('team', '所属团队'), column('category', '报销类目'), column('companyName', '公司名称', 'text', 210), column('amount', '报销金额', 'money', 120), column('remark', '备注信息', 'text', 220), column('status', '审核状态', 'status', 110)], actions: [action('submit', '提交审核'), action('approve', '通过', 'success'), action('reject', '驳回', 'danger', true), action('pay', '确认付款', 'success'), action('restore', '恢复草稿')], tabs: options('全部报销', '我的报销', '待审核', '待付款', '已完成'), notes: ['保留“成本未报（地址）”和“成本未报（第三方）”入口。']
  },
  {
    code: 'reimbursement-analysis', group: 'reimbursement', title: '报销分析', icon: 'PieChart', kind: 'analysis', primaryLabel: '登记分析数据',
    legacyPath: '/reimbursement-management/analysis', description: '按年度、区间、部门和类目分析报销金额。',
    filters: [field('year', '统计年度', 'select', false, options('2026', '2025')), field('range', '自定义区间', 'date'), field('scope', '数据范围', 'select', false, options('本人', '本部门', '全公司'))],
    fields: [field('title', '分析主题', 'text', true), field('category', '报销类目', 'select', true, options('差旅费', '办公费', '业务招待费', '地址成本')), field('amount', '金额', 'money', true), field('team', '部门', 'text', true), field('count', '单据数', 'number', true)],
    columns: [column('category', '报销类目'), column('team', '部门'), column('amount', '报销金额', 'money', 130), column('count', '单据数', 'text', 100), column('ratio', '占比', 'progress', 180), column('trend', '同比', 'text', 100)], actions: recordActions, statLabels: ['报销总额', '单据数量', '人均报销', '待审核金额']
  },

  // 系统通知 5页
  {
    code: 'notice-list', group: 'notice', title: '系统公告', icon: 'BellFilled', kind: 'table', primaryLabel: '新增公告',
    legacyPath: '/system-notice/list', description: '发布有时效、优先级和对象范围的系统公告。',
    filters: [field('noticeTitle', '标题'), field('content', '内容'), STATUS_FILTER],
    fields: [field('title', '公告标题', 'text', true), field('content', '公告内容', 'textarea', true, undefined, 2), field('startTime', '开始时间', 'datetime', true), field('endTime', '结束时间', 'datetime', true), field('priority', '优先级', 'select', true, options('普通', '重要', '紧急')), field('audience', '通告对象', 'select', true, options('全员', '部门', '指定人员')), field('publisher', '发布人', 'text', true)],
    columns: [column('title', '标题', 'text', 220), column('startTime', '开始时间', 'datetime', 165), column('endTime', '结束时间', 'datetime', 165), column('publisher', '发布人'), column('priority', '优先级', 'status', 100), column('audience', '通告对象'), column('status', '状态', 'status', 100)], actions: [action('publish', '发布', 'success'), action('revoke', '撤回', 'warning', true), action('restore', '恢复草稿')], tabs: options('全部公告', '草稿', '已发布', '已撤回')
  },
  {
    code: 'notice-mine', group: 'notice', title: '我的消息', icon: 'Message', kind: 'cards', primaryLabel: '登记个人消息',
    legacyPath: '/system-notice/mine', description: '查看发给本人的公告与业务消息并管理已读状态。',
    filters: [field('noticeTitle', '标题'), field('publisher', '发布人'), field('readStatus', '阅读状态', 'select', false, options('未读', '已读', '已归档'))],
    fields: [field('title', '消息标题', 'text', true), field('messageType', '消息类型', 'select', true, options('系统公告', '业务提醒', '审批通知')), field('publisher', '发布人', 'text', true), field('content', '消息内容', 'textarea', true, undefined, 2), field('priority', '优先级', 'select', true, options('普通', '重要', '紧急'))],
    columns: [column('title', '标题', 'text', 230), column('messageType', '消息类型'), column('publisher', '发布人'), column('bizDate', '发布时间', 'date', 120), column('priority', '优先级', 'status', 100), column('status', '阅读状态', 'status', 100)], actions: [action('mark-read', '标为已读', 'success'), action('archive', '归档', 'warning'), action('restore', '恢复未读')], tabs: options('全部消息', '未读', '已读', '已归档')
  },
  {
    code: 'notice-message', group: 'notice', title: '消息管理', icon: 'ChatLineSquare', kind: 'table', primaryLabel: '新增消息',
    legacyPath: '/system-notice/message', description: '创建消息、选择接收人和发送方式，并查看发送结果。',
    filters: [field('messageTitle', '消息标题'), field('content', '发送内容'), field('receiver', '接收人'), STATUS_FILTER],
    fields: [field('title', '消息标题', 'text', true), field('content', '发送内容', 'textarea', true, undefined, 2), field('receiver', '接收人', 'text', true), field('sendMethod', '发送方式', 'select', true, options('站内信', '短信', '邮件')), field('sendTime', '发送时间', 'datetime')],
    columns: [column('title', '消息标题', 'text', 220), column('content', '发送内容', 'text', 280), column('receiver', '接收人'), column('sendCount', '发送次数', 'text', 100), column('status', '发送状态', 'status', 110), column('sendTime', '发送时间', 'datetime', 165), column('sendMethod', '发送方式')], actions: [action('publish', '发送', 'success'), action('revoke', '撤回', 'warning', true), action('restore', '恢复草稿')]
  },
  {
    code: 'notice-template', group: 'notice', title: '消息模板', icon: 'Document', kind: 'config', primaryLabel: '新增模板',
    legacyPath: '/system-notice/template', description: '维护模板编码、标题、内容和类型。',
    filters: [field('templateCode', '模板CODE'), field('templateTitle', '模板标题'), field('templateType', '模板类型')],
    fields: [field('title', '模板标题', 'text', true), field('templateCode', '模板CODE', 'text', true), field('templateType', '模板类型', 'select', true, options('系统公告', '业务提醒', '审批通知')), field('content', '模板内容', 'textarea', true, undefined, 2)],
    columns: [column('templateCode', '模板CODE'), column('title', '模板标题', 'text', 220), column('content', '模板内容', 'text', 300), column('templateType', '模板类型'), column('status', '状态', 'status', 100)], actions: configActions
  },
  {
    code: 'notice-rule', group: 'notice', title: '通知规则', icon: 'SetUp', kind: 'config', primaryLabel: '新增规则',
    legacyPath: '/system-notice/rule', description: '按事件、接收人类型、推送渠道和模板配置通知。',
    filters: [field('ruleName', '规则名称'), field('eventCode', '事件编码')],
    fields: [field('title', '规则名称', 'text', true), field('eventCode', '事件编码', 'text', true), field('eventName', '事件名称', 'text', true), field('receiverType', '接收人类型', 'select', true, options('发起人', '负责人', '部门主管', '指定人员')), field('channels', '推送渠道', 'text', true), field('template', '消息模板', 'text', true), field('testReceiver', '测试接收人', 'text')],
    columns: [column('title', '规则名称'), column('eventCode', '事件编码'), column('eventName', '事件名称'), column('receiverType', '接收人类型'), column('channels', '推送渠道'), column('template', '消息模板'), column('status', '启用', 'status', 100)], actions: configActions, notes: ['测试发送只对当前租户可见员工执行；上线前不连接短信或邮件生产通道。']
  }
]

export const FEIGE_SUITE_PAGES: FeigeSuitePageConfig[] = pages

export const FEIGE_SUITE_PAGE_MAP = new Map(FEIGE_SUITE_PAGES.map((page) => [page.code, page]))

export function requireFeigeSuitePage(code: string): FeigeSuitePageConfig {
  const page = FEIGE_SUITE_PAGE_MAP.get(code)
  if (!page) throw new Error(`Unknown feige suite page: ${code}`)
  return page
}

export function pagesByGroup(group: FeigeSuitePageConfig['group']): FeigeSuitePageConfig[] {
  return FEIGE_SUITE_PAGES.filter((page) => page.group === group)
}

if (FEIGE_SUITE_PAGES.length !== 55 || FEIGE_SUITE_PAGE_MAP.size !== 55) {
  throw new Error(`业务中心页面配置必须恰好55页，当前=${FEIGE_SUITE_PAGES.length}`)
}

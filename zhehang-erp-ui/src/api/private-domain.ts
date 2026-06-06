import { enterpriseApi, onlineLeadApi, type CompanyResolveResult, type EnterpriseEntity, type OnlineLeadCreatePayload } from './growth'

export type PrivateSource = '企业微信' | '个人微信' | '微信群' | '朋友圈' | '公众号' | '视频号' | '老客转介绍'
export type PrivateStage = 'new' | 'nurturing' | 'intent' | 'quoted' | 'ordered' | 'silent'
export type PrivateTaskStatus = 'pending' | 'done' | 'overdue'
export type IntegrationStatus = 'connected' | 'pending' | 'blocked'
export type OpsCheckStatus = 'ready' | 'partial' | 'missing'
export type DailyActionStatus = 'todo' | 'doing' | 'blocked' | 'done'
export type PrivateImportStatus = 'ready' | 'duplicate' | 'error'
export type PrivateDuplicateRisk = CompanyResolveResult['duplicateRisk']

export interface PrivateCompanyVerification {
  matched: boolean
  confidence: number
  source: string
  duplicateRisk: PrivateDuplicateRisk
  entityId?: number
  entityName?: string
  creditCode?: string
  legalPerson?: string
  registeredCapital?: string
  establishDate?: string
  businessStatus?: EnterpriseEntity['businessStatus']
  taxQualification?: string
  industry?: string
  address?: string
  riskTags: string[]
  linkageText: string
  suggestionText: string
  nextAction: string
}

export interface PrivateContact {
  id: number
  name: string
  companyName: string
  phone: string
  source: PrivateSource
  communityName: string
  ownerName: string
  tags: string[]
  stage: PrivateStage
  score: number
  demand: string
  serviceLine: string
  estimatedAmount: number
  lastTouchAt: string
  nextAction: string
  touchCount: number
  convertedLeadId?: number
  entityId?: number
  creditCode?: string
  verification?: PrivateCompanyVerification
}

export interface PrivateImportTemplateColumn {
  key: keyof PrivateContactImportRow
  label: string
  required: boolean
  example: string
  tip: string
}

export interface PrivateContactImportRow {
  companyName: string
  name: string
  phone: string
  source?: string
  communityName?: string
  ownerName?: string
  demand?: string
  serviceLine?: string
  estimatedAmount?: string | number
  tags?: string
  stage?: string
  nextAction?: string
  lastTouchAt?: string
}

export interface PrivateImportPreviewRow {
  rowNo: number
  data: PrivateContactImportRow
  status: PrivateImportStatus
  errors: string[]
  duplicateText?: string
  verification?: PrivateCompanyVerification
}

export interface PrivateImportResult {
  total: number
  imported: number
  duplicate: number
  failed: number
  contacts: PrivateContact[]
  preview: PrivateImportPreviewRow[]
}

export interface PrivateGroup {
  id: number
  name: string
  ownerName: string
  memberCount: number
  activeRate: number
  leadCount: number
  opportunityCount: number
  silentCount: number
  topic: string
  nextEvent: string
}

export interface PrivateContent {
  id: number
  title: string
  type: '朋友圈' | '社群推送' | '公众号文章' | '视频号直播' | '销售话术'
  target: string
  ownerName: string
  publishAt: string
  status: 'draft' | 'scheduled' | 'published'
  reachCount: number
  interactCount: number
  leadCount: number
  orderCount: number
  relatedService: string
}

export interface PrivateTask {
  id: number
  title: string
  contactName: string
  companyName: string
  ownerName: string
  dueTime: string
  priority: '高' | '中' | '低'
  status: PrivateTaskStatus
  action: string
}

export interface PrivateIntegration {
  key: string
  name: string
  status: IntegrationStatus
  ownerName: string
  scope: string
  lastSyncAt: string
  description: string
  required: string[]
}

export interface PrivateOpsProfile {
  companyName: string
  city: string
  privatePlatforms: PrivateSource[]
  departments: string[]
  keyServices: string[]
  requiredFields: string[]
  dailyLeadTarget: number
  handoffRule: string
  painPoints: string
  answers: Record<string, string>
  updatedAt: string
}

export interface PrivateOpsCheck {
  id: string
  name: string
  status: OpsCheckStatus
  ownerName: string
  current: string
  next: string
  path: string
}

export interface PrivateDailyAction {
  id: number
  roleName: string
  action: string
  target: string
  source: string
  status: DailyActionStatus
  path: string
}

export interface PrivateSummary {
  contactCount: number
  intentCount: number
  silentCount: number
  convertedCount: number
  groupCount: number
  touchCount: number
  estimatedAmount: number
  funnel: Array<{ stage: string; count: number; rate: number }>
  sourceStats: Array<{ source: PrivateSource; contacts: number; intents: number; converted: number }>
}

const CONTACT_KEY = 'biz_private_contacts'
const GROUP_KEY = 'biz_private_groups'
const CONTENT_KEY = 'biz_private_contents'
const TASK_KEY = 'biz_private_tasks'
const INTEGRATION_KEY = 'biz_private_integrations'
const PROFILE_KEY = 'biz_private_ops_profile'
const PRIVATE_SOURCE_OPTIONS: PrivateSource[] = ['企业微信', '个人微信', '微信群', '朋友圈', '公众号', '视频号', '老客转介绍']
const PRIVATE_STAGE_OPTIONS: PrivateStage[] = ['new', 'nurturing', 'intent', 'quoted', 'ordered', 'silent']
const ANSWER_OPTIONS = {
  sourceTruth: ['企微/微信群为主', '个人微信为主', '广告留资为主', '同行渠道为主', '多来源混合', '暂不确定'],
  ownerRule: ['谁先添加归谁', '来源部门优先', '销售主管分配', '渠道客户单独归属', '按客户等级分配', '暂不确定'],
  successMetric: ['新增线索/有效线索', '成交金额/回款', 'ROI/投产比', '交付逾期/客户风险', '员工产能/跟进量', '全部都要'],
  dataImport: ['先 Excel 导入', '先手工录入', '企微接口优先', '呼叫中心优先', '广告平台优先', '先做本地闭环']
}

export const privateImportTemplateColumns: PrivateImportTemplateColumn[] = [
  { key: 'companyName', label: '公司名称', required: true, example: '杭州启辰企业管理有限公司', tip: '必须填公司全称,后续用于工商核验和撞单。' },
  { key: 'name', label: '联系人', required: true, example: '张总', tip: '客户联系人姓名或称呼。' },
  { key: 'phone', label: '手机号', required: true, example: '18600008888', tip: '用于去重和后续电销触达。' },
  { key: 'source', label: '来源触点', required: true, example: '企业微信', tip: '可填企业微信、个人微信、微信群、朋友圈、公众号、视频号、老客转介绍。' },
  { key: 'communityName', label: '社群/触点名称', required: false, example: '新公司开办咨询群', tip: '微信群、企微标签、直播间或朋友圈主题。' },
  { key: 'ownerName', label: '负责人', required: true, example: '何海琳', tip: '当前跟进人或归属部门负责人。' },
  { key: 'demand', label: '客户需求', required: true, example: '新注册公司,需要税务报到和代理记账', tip: '写清楚客户要解决什么问题。' },
  { key: 'serviceLine', label: '业务线', required: true, example: '代理记账', tip: '例如代理记账、地址挂靠、异常解除、税务筹划、公司注销、同行渠道。' },
  { key: 'estimatedAmount', label: '预估金额', required: false, example: '12800', tip: '只填数字,用于老板看商机金额。' },
  { key: 'tags', label: '标签', required: false, example: '新设企业;代理记账;3日内跟进', tip: '多个标签用分号隔开。' },
  { key: 'stage', label: '阶段', required: false, example: '有意向', tip: '可填新触点、培育中、有意向、已报价、已成交、沉默。' },
  { key: 'nextAction', label: '下一步动作', required: false, example: '发送开办套餐报价并预约电话', tip: '不填时系统自动生成。' },
  { key: 'lastTouchAt', label: '最近互动时间', required: false, example: '2026-06-07 10:30', tip: '不填时使用导入时间。' }
]

export const privateImportTemplateSamples: PrivateContactImportRow[] = [
  {
    companyName: '杭州启辰企业管理有限公司',
    name: '张总',
    phone: '18600008888',
    source: '企业微信',
    communityName: '新公司开办咨询群',
    ownerName: '何海琳',
    demand: '刚注册公司,需要税务报到、代理记账和银行开户指导',
    serviceLine: '代理记账',
    estimatedAmount: 12800,
    tags: '新设企业;代理记账;3日内跟进',
    stage: '有意向',
    nextAction: '发送开办套餐报价并预约电话',
    lastTouchAt: '2026-06-07 10:30'
  },
  {
    companyName: '义乌市诚达财税服务部',
    name: '王经理',
    phone: '13900001111',
    source: '老客转介绍',
    communityName: '同行渠道合作',
    ownerName: '王舟',
    demand: '同行批量采购挂靠地址,希望月结',
    serviceLine: '同行渠道',
    estimatedAmount: 42000,
    tags: '同行渠道;地址挂靠;账期',
    stage: '有意向',
    nextAction: '核对供应商地址库存并申请账期',
    lastTouchAt: '2026-06-07 14:00'
  }
]

const delay = <T>(data: T, ms = 80) => new Promise<T>(resolve => setTimeout(() => resolve(data), ms))

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function ts(offsetDays = 0, hour = 10, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, minute, 0, 0)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function readList<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[]
  } catch {
    return []
  }
}

function writeList<T>(key: string, list: T[]) {
  localStorage.setItem(key, JSON.stringify(list))
}

function maxId<T extends { id: number }>(list: T[]) {
  return list.reduce((m, item) => Math.max(m, item.id), 0)
}

function defaultProfile(): PrivateOpsProfile {
  return {
    companyName: '浙杭集团',
    city: '杭州',
    privatePlatforms: ['企业微信', '个人微信', '微信群', '朋友圈', '公众号', '视频号', '老客转介绍'],
    departments: ['网销运营', '私域运营', '电销坐席', '销售顾问', '渠道经理', '财税交付'],
    keyServices: ['代理记账', '工商注册', '地址挂靠', '异常解除', '税务筹划', '公司注销', '同行渠道'],
    requiredFields: ['公司名称', '联系人', '手机号', '来源触点', '客户需求', '工商状态', '税务资质', '负责人', '下一步动作'],
    dailyLeadTarget: 80,
    handoffRule: '私域触点当天必须入库；高意向 30 分钟内分配顾问；涉及地址挂靠先查库存和同行价格；成交后自动生成交付任务。',
    painPoints: '当前需要把企微、个人微信、微信群、网销、电销、同行渠道的客户统一归集，避免重复跟进、漏跟进和成交后交付断档。',
    answers: {
      sourceTruth: '多来源混合',
      ownerRule: '来源部门优先',
      successMetric: '全部都要',
      dataImport: '先做本地闭环'
    },
    updatedAt: ts()
  }
}

function normalizeAnswers(answers: Record<string, string> = {}) {
  const defaults = defaultProfile().answers
  return Object.fromEntries(
    Object.entries(ANSWER_OPTIONS).map(([key, options]) => {
      const value = answers[key]
      return [key, options.includes(value) ? value : defaults[key]]
    })
  )
}

function readProfile(): PrivateOpsProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return defaultProfile()
    const parsed = { ...defaultProfile(), ...JSON.parse(raw) }
    return { ...parsed, answers: normalizeAnswers(parsed.answers) }
  } catch {
    return defaultProfile()
  }
}

function writeProfile(profile: PrivateOpsProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

function ensureSeeds() {
  if (!readList<PrivateContact>(CONTACT_KEY).length) {
    writeList<PrivateContact>(CONTACT_KEY, [
      {
        id: 1,
        name: '张总',
        companyName: '杭州启辰企业管理有限公司',
        phone: '18600008888',
        source: '企业微信',
        communityName: '新公司开办咨询群',
        ownerName: '何海琳',
        tags: ['新设企业', '代理记账', '3日内跟进'],
        stage: 'intent',
        score: 92,
        demand: '刚注册公司,需要税务报到、代理记账和银行开户指导',
        serviceLine: '代理记账',
        estimatedAmount: 12800,
        lastTouchAt: ts(0, 9, 32),
        nextAction: '发送开办套餐报价并预约电话',
        touchCount: 7
      },
      {
        id: 2,
        name: '陈女士',
        companyName: '浙江朗和装饰工程有限公司',
        phone: '17700006666',
        source: '微信群',
        communityName: '经营异常解除答疑群',
        ownerName: '陈思旭',
        tags: ['地址异常', '挂靠地址', '高客单'],
        stage: 'quoted',
        score: 89,
        demand: '注册地址异常,需要挂靠地址和异常解除方案',
        serviceLine: '地址挂靠',
        estimatedAmount: 23800,
        lastTouchAt: ts(0, 11, 18),
        nextAction: '确认地址库存和同行渠道价格',
        touchCount: 11
      },
      {
        id: 3,
        name: '刘总',
        companyName: '杭州麦田电子商务有限公司',
        phone: '15800007777',
        source: '朋友圈',
        communityName: '财税避坑内容互动',
        ownerName: '网销二组',
        tags: ['电商财税', '小规模', '朋友圈互动'],
        stage: 'nurturing',
        score: 76,
        demand: '想了解电商收入入账和税务合规',
        serviceLine: '税务筹划',
        estimatedAmount: 9800,
        lastTouchAt: ts(-1, 16, 42),
        nextAction: '推送电商合规案例并收集开票情况',
        touchCount: 5
      },
      {
        id: 4,
        name: '王经理',
        companyName: '义乌市诚达财税服务部',
        phone: '13900001111',
        source: '老客转介绍',
        communityName: '同行渠道合作',
        ownerName: '王舟',
        tags: ['同行渠道', '地址挂靠', '账期'],
        stage: 'intent',
        score: 95,
        demand: '同行批量采购挂靠地址,希望月结',
        serviceLine: '同行渠道',
        estimatedAmount: 42000,
        lastTouchAt: ts(0, 14, 8),
        nextAction: '核对供应商地址库存并申请账期',
        touchCount: 9
      },
      {
        id: 5,
        name: '周总',
        companyName: '宁波精密制造有限公司',
        phone: '18000002222',
        source: '公众号',
        communityName: '税务稽查文章留资',
        ownerName: '财税顾问组',
        tags: ['一般纳税人', '税务风险', '需专家'],
        stage: 'new',
        score: 82,
        demand: '看了税务风险文章,想做一次账务体检',
        serviceLine: '财税体检',
        estimatedAmount: 16800,
        lastTouchAt: ts(-1, 19, 20),
        nextAction: '安排财税专家初诊',
        touchCount: 2
      },
      {
        id: 6,
        name: '赵先生',
        companyName: '杭州栖木文化传媒有限公司',
        phone: '13100003333',
        source: '视频号',
        communityName: '直播间企业注销咨询',
        ownerName: '刘洋',
        tags: ['注销', '直播留资', '价格敏感'],
        stage: 'silent',
        score: 61,
        demand: '公司不经营,想了解注销流程和费用',
        serviceLine: '工商注销',
        estimatedAmount: 6800,
        lastTouchAt: ts(-8, 18, 4),
        nextAction: '7天未回复,进入沉默唤醒',
        touchCount: 3
      }
    ])
  }

  if (!readList<PrivateGroup>(GROUP_KEY).length) {
    writeList<PrivateGroup>(GROUP_KEY, [
      { id: 1, name: '新公司开办咨询群', ownerName: '何海琳', memberCount: 286, activeRate: 38, leadCount: 46, opportunityCount: 12, silentCount: 31, topic: '开办套餐、税务报到、银行开户', nextEvent: '今晚 20:00 直播答疑' },
      { id: 2, name: '经营异常解除答疑群', ownerName: '陈思旭', memberCount: 193, activeRate: 42, leadCount: 33, opportunityCount: 9, silentCount: 18, topic: '地址异常、税务异常、年报异常', nextEvent: '明早推送异常解除流程' },
      { id: 3, name: '同行渠道合作', ownerName: '王舟', memberCount: 97, activeRate: 51, leadCount: 21, opportunityCount: 8, silentCount: 9, topic: '挂靠地址库存、同行账期、渠道返点', nextEvent: '本周五渠道库存盘点' },
      { id: 4, name: '财税避坑内容互动', ownerName: '网销二组', memberCount: 428, activeRate: 24, leadCount: 58, opportunityCount: 10, silentCount: 76, topic: '电商财税、成本票、合规入账', nextEvent: '推送电商合规案例' }
    ])
  }

  if (!readList<PrivateContent>(CONTENT_KEY).length) {
    writeList<PrivateContent>(CONTENT_KEY, [
      { id: 1, title: '新公司开办后 30 天必须做的 5 件事', type: '朋友圈', target: '新设企业标签', ownerName: '网销一组', publishAt: ts(0, 18, 0), status: 'scheduled', reachCount: 1280, interactCount: 96, leadCount: 18, orderCount: 3, relatedService: '代理记账' },
      { id: 2, title: '地址异常解除流程与挂靠地址注意事项', type: '社群推送', target: '经营异常解除答疑群', ownerName: '陈思旭', publishAt: ts(-1, 20, 0), status: 'published', reachCount: 486, interactCount: 72, leadCount: 13, orderCount: 2, relatedService: '地址挂靠' },
      { id: 3, title: '同行渠道挂靠地址库存周报', type: '销售话术', target: '渠道经理', ownerName: '王舟', publishAt: ts(1, 10, 0), status: 'draft', reachCount: 0, interactCount: 0, leadCount: 0, orderCount: 0, relatedService: '同行渠道' },
      { id: 4, title: '电商客户如何判断是否需要一般纳税人', type: '公众号文章', target: '电商财税标签', ownerName: '财税顾问组', publishAt: ts(-2, 9, 30), status: 'published', reachCount: 2180, interactCount: 154, leadCount: 22, orderCount: 4, relatedService: '税务筹划' }
    ])
  }

  if (!readList<PrivateTask>(TASK_KEY).length) {
    writeList<PrivateTask>(TASK_KEY, [
      { id: 1, title: '发送开办套餐报价', contactName: '张总', companyName: '杭州启辰企业管理有限公司', ownerName: '何海琳', dueTime: ts(0, 17, 30), priority: '高', status: 'pending', action: '企微私聊 + 电话确认预算' },
      { id: 2, title: '核对地址库存', contactName: '陈女士', companyName: '浙江朗和装饰工程有限公司', ownerName: '陈思旭', dueTime: ts(0, 16, 0), priority: '高', status: 'pending', action: '同步供应商地址库存和异常解除资料' },
      { id: 3, title: '沉默客户唤醒', contactName: '赵先生', companyName: '杭州栖木文化传媒有限公司', ownerName: '刘洋', dueTime: ts(-1, 11, 0), priority: '中', status: 'overdue', action: '发送注销费用清单和限时咨询入口' }
    ])
  }

  if (!readList<PrivateIntegration>(INTEGRATION_KEY).length) {
    writeList<PrivateIntegration>(INTEGRATION_KEY, [
      { key: 'wecom-contact', name: '企业微信客户联系', status: 'pending', ownerName: '系统管理员', scope: '外部联系人/客户群/标签', lastSyncAt: '待授权', description: '同步外部联系人、企微客户群、员工归属和客户标签。', required: ['corpId', 'secret', '客户联系权限', '回调 Token/AESKey'] },
      { key: 'wechat-service', name: '微信客服/公众号', status: 'pending', ownerName: '网销主管', scope: '会话/留资/菜单点击', lastSyncAt: '待配置', description: '承接公众号、小程序、微信客服消息和留资表单。', required: ['appId', 'appSecret', '消息回调地址'] },
      { key: 'community', name: '社群运营', status: 'connected', ownerName: '社群运营', scope: '群活跃/群标签/群任务', lastSyncAt: ts(0, 8, 30), description: '先以运营台维护群数据,后续接企微客户群 API 自动同步。', required: ['群主映射', '群标签规范'] },
      { key: 'content', name: '内容触达', status: 'connected', ownerName: '内容运营', scope: '朋友圈/文章/直播/话术', lastSyncAt: ts(0, 9, 10), description: '统一管理朋友圈、社群推文、直播和销售话术的触达效果。', required: ['内容标签', '服务线映射'] }
    ])
  }

  if (!localStorage.getItem(PROFILE_KEY)) writeProfile(defaultProfile())
}

function calcSummary(contacts: PrivateContact[], groups: PrivateGroup[]): PrivateSummary {
  const intentStages: PrivateStage[] = ['intent', 'quoted', 'ordered']
  const stages: Array<{ key: PrivateStage; label: string }> = [
    { key: 'new', label: '新触点' },
    { key: 'nurturing', label: '培育中' },
    { key: 'intent', label: '有意向' },
    { key: 'quoted', label: '已报价' },
    { key: 'ordered', label: '已成交' }
  ]
  const sourceStats = Array.from(new Set(contacts.map(item => item.source))).map(source => {
    const rows = contacts.filter(item => item.source === source)
    return {
      source,
      contacts: rows.length,
      intents: rows.filter(item => intentStages.includes(item.stage)).length,
      converted: rows.filter(item => item.convertedLeadId).length
    }
  })
  return {
    contactCount: contacts.length,
    intentCount: contacts.filter(item => intentStages.includes(item.stage)).length,
    silentCount: contacts.filter(item => item.stage === 'silent').length,
    convertedCount: contacts.filter(item => item.convertedLeadId).length,
    groupCount: groups.length,
    touchCount: contacts.reduce((sum, item) => sum + item.touchCount, 0),
    estimatedAmount: contacts.filter(item => intentStages.includes(item.stage)).reduce((sum, item) => sum + item.estimatedAmount, 0),
    funnel: stages.map((stage, idx) => {
      const count = contacts.filter(item => item.stage === stage.key || (stage.key === 'intent' && item.stage === 'quoted')).length
      return {
        stage: stage.label,
        count,
        rate: idx === 0 ? 100 : contacts.length ? Math.round(count / contacts.length * 100) : 0
      }
    }),
    sourceStats
  }
}

function buildOpsChecks(profile: PrivateOpsProfile, integrations: PrivateIntegration[]): PrivateOpsCheck[] {
  const wecom = integrations.find(item => item.key === 'wecom-contact')
  const wechat = integrations.find(item => item.key === 'wechat-service')
  return [
    {
      id: 'source',
      name: '私域来源归集',
      status: wecom?.status === 'connected' && wechat?.status === 'connected' ? 'ready' : 'partial',
      ownerName: '私域运营',
      current: `已覆盖 ${profile.privatePlatforms.join('、')}`,
      next: wecom?.status === 'connected' ? '补齐公众号/个人微信留资映射' : '先授权企微客户联系,再接公众号/微信客服',
      path: '/leads/private-domain'
    },
    {
      id: 'company',
      name: '公司名自动带工商',
      status: 'ready',
      ownerName: '网销运营',
      current: '网销线索和私域导入均已接入工商核验、风险标签和撞单判断',
      next: '下一步接真实工商接口后,把待核验客户自动补全统一社会信用代码',
      path: '/customer/enterprise-master'
    },
    {
      id: 'assign',
      name: '分配与保护期',
      status: 'ready',
      ownerName: '销售主管',
      current: '已有分配规则、回收规则、公海私海和撞单管理',
      next: '把私域来源、同行渠道、地址挂靠分别配置不同保护期',
      path: '/system/distribute-config'
    },
    {
      id: 'follow',
      name: '跟进动作闭环',
      status: 'partial',
      ownerName: '电销/顾问',
      current: '可生成跟进任务,但跟进结果、报价、提单还需要强绑定',
      next: '将 A/B/C 意向、报价金额、下次跟进时间写成必填项',
      path: '/task-center/once'
    },
    {
      id: 'delivery',
      name: '成交后交付',
      status: 'partial',
      ownerName: '财税交付',
      current: '已有提单、财务核对、报税日历和任务中心',
      next: '按服务项目自动生成工商/财税/地址交付任务包',
      path: '/tax/calendar'
    },
    {
      id: 'boss',
      name: '老板经营看板',
      status: 'partial',
      ownerName: '老板/管理层',
      current: '首页和驾驶舱已有线索、ROI、回款、交付指标',
      next: '统一按来源、部门、个人、服务线做利润和转化追踪',
      path: '/dashboard/home'
    }
  ]
}

function buildDailyActions(profile: PrivateOpsProfile): PrivateDailyAction[] {
  return [
    { id: 1, roleName: '私域运营', action: '把昨晚到今天的企微/微信群/朋友圈互动客户入库', target: `不少于 ${Math.round(profile.dailyLeadTarget * 0.25)} 条`, source: '企业微信/微信群/朋友圈', status: 'todo', path: '/leads/private-domain' },
    { id: 2, roleName: '网销运营', action: '核验公司名称,补齐工商/税务/联系方式,剔除重复客户', target: '新线索当天清洗完', source: '官网/抖音/小红书/企微', status: 'doing', path: '/leads/online-leads' },
    { id: 3, roleName: '电销坐席', action: '优先外呼 A/B 级客户,记录通话结果和下次动作', target: '高意向 30 分钟内触达', source: '网销线索/拓客情报', status: 'todo', path: '/call-center/outbound' },
    { id: 4, roleName: '渠道经理', action: '核对挂靠地址库存、同行价格、账期和应收', target: '地址可售量低于阈值先补货', source: '同行渠道/地址供应商', status: 'blocked', path: '/supply/channel-partner' },
    { id: 5, roleName: '销售顾问', action: '对高意向客户输出套餐报价,成交后发起提单', target: '报价必须带服务项和回款节点', source: '私域/电销/网销', status: 'todo', path: '/order/bill' },
    { id: 6, roleName: '财税交付', action: '接收已核款订单,生成工商/代账/报税交付任务', target: '当日成交当日建任务', source: '提单/财务核对', status: 'doing', path: '/tax/calendar' }
  ]
}

function cleanText(value: unknown) {
  return String(value ?? '').trim()
}

function normalizePhone(value: unknown) {
  return cleanText(value).replace(/[^\d]/g, '')
}

function normalizeSource(value: unknown): PrivateSource | '' {
  const text = cleanText(value)
  if (!text) return ''
  if ((PRIVATE_SOURCE_OPTIONS as string[]).includes(text)) return text as PrivateSource
  if (text.includes('企微') || text.includes('企业微信')) return '企业微信'
  if (text.includes('个人') || text.includes('私微')) return '个人微信'
  if (text.includes('群')) return '微信群'
  if (text.includes('朋友圈')) return '朋友圈'
  if (text.includes('公众号')) return '公众号'
  if (text.includes('视频') || text.includes('直播')) return '视频号'
  if (text.includes('转介绍') || text.includes('老客')) return '老客转介绍'
  return ''
}

function normalizeStage(value: unknown): PrivateStage {
  const text = cleanText(value)
  const map: Record<string, PrivateStage> = {
    new: 'new',
    nurturing: 'nurturing',
    intent: 'intent',
    quoted: 'quoted',
    ordered: 'ordered',
    silent: 'silent',
    新触点: 'new',
    新线索: 'new',
    培育中: 'nurturing',
    培育: 'nurturing',
    有意向: 'intent',
    意向: 'intent',
    已报价: 'quoted',
    报价: 'quoted',
    已成交: 'ordered',
    成交: 'ordered',
    沉默: 'silent',
    无响应: 'silent'
  }
  return map[text] || 'new'
}

function validStage(value: unknown) {
  const text = cleanText(value)
  if (!text) return true
  return PRIVATE_STAGE_OPTIONS.includes(text as PrivateStage) || ['新触点', '新线索', '培育中', '培育', '有意向', '意向', '已报价', '报价', '已成交', '成交', '沉默', '无响应'].includes(text)
}

function tagList(value: unknown) {
  return cleanText(value)
    .split(/[;；,，、\s]+/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 8)
}

function amountOf(value: unknown) {
  const text = cleanText(value).replace(/[¥,，元\s]/g, '')
  const amount = Number(text || 0)
  return Number.isFinite(amount) && amount >= 0 ? amount : 0
}

function contactKey(companyName: string, phone: string) {
  return `${companyName.trim()}::${phone.trim()}`
}

function scoreOf(row: PrivateContactImportRow, stage: PrivateStage, tags: string[]) {
  let score = 66
  if (stage === 'intent') score += 14
  if (stage === 'quoted') score += 18
  if (stage === 'ordered') score += 22
  if (stage === 'silent') score -= 10
  const text = `${row.demand || ''}${row.serviceLine || ''}${tags.join('')}`
  if (/地址|异常|挂靠|同行|税务|注销|代理记账|出口退税/.test(text)) score += 8
  if (/高客单|账期|批量|月结|报价/.test(text)) score += 6
  if (amountOf(row.estimatedAmount) >= 20000) score += 6
  return Math.max(40, Math.min(98, score))
}

function validateImportRow(row: PrivateContactImportRow) {
  const errors: string[] = []
  const companyName = cleanText(row.companyName)
  const name = cleanText(row.name)
  const phone = normalizePhone(row.phone)
  const source = normalizeSource(row.source)
  if (!companyName) errors.push('公司名称必填')
  if (!name) errors.push('联系人必填')
  if (!phone) errors.push('手机号必填')
  if (phone && phone.length < 7) errors.push('手机号格式过短')
  if (!source) errors.push('来源触点不在可选范围内')
  if (!cleanText(row.ownerName)) errors.push('负责人必填')
  if (!cleanText(row.demand)) errors.push('客户需求必填')
  if (!cleanText(row.serviceLine)) errors.push('业务线必填')
  if (!validStage(row.stage)) errors.push('阶段不在可选范围内')
  return { errors, companyName, name, phone, source }
}

function verificationFromResolve(result: CompanyResolveResult): PrivateCompanyVerification {
  const entity = result.entity
  const linkage = result.linkage
  const linkageText = entity
    ? `线索${linkage.onlineLeads.count} / 客户${linkage.customers.count} / 订单${linkage.orders.count} / 任务${linkage.tasks.count}`
    : '主体库未命中'
  return {
    matched: result.matched,
    confidence: result.confidence,
    source: result.source,
    duplicateRisk: result.duplicateRisk,
    entityId: entity?.id,
    entityName: entity?.name,
    creditCode: entity?.creditCode,
    legalPerson: entity?.legalPerson,
    registeredCapital: entity?.registeredCapital,
    establishDate: entity?.establishDate,
    businessStatus: entity?.businessStatus,
    taxQualification: entity?.taxQualification,
    industry: entity?.industry,
    address: entity?.address,
    riskTags: entity?.riskTags?.length ? entity.riskTags : ['待工商核验'],
    linkageText,
    suggestionText: result.suggestions.slice(0, 2).map(item => `${item.service}(${item.priority})`).join('、') || '待补充服务建议',
    nextAction: result.nextActions[0] || (entity ? '可继续入库并按线索分配规则流转。' : '未命中工商库,先作为待核验客户入库。')
  }
}

async function resolveCompanyVerification(companyName: string) {
  try {
    return verificationFromResolve(await enterpriseApi.resolveCompany(companyName))
  } catch {
    return {
      matched: false,
      confidence: 0,
      source: '工商查询服务',
      duplicateRisk: 'none' as PrivateDuplicateRisk,
      riskTags: ['待工商核验'],
      linkageText: '工商服务暂不可用',
      suggestionText: '待补充服务建议',
      nextAction: '工商服务暂不可用,先作为待核验客户入库。'
    }
  }
}

function withVerificationTags(tags: string[], verification?: PrivateCompanyVerification) {
  const merged = new Set(tags)
  if (verification) {
    if (verification.matched) {
      merged.add('已核验工商')
      verification.riskTags.slice(0, 3).forEach(tag => merged.add(tag))
    } else {
      merged.add('待工商核验')
    }
    if (verification.duplicateRisk === 'possible') merged.add('疑似重复')
    if (verification.duplicateRisk === 'hit') merged.add('撞单强命中')
  }
  return Array.from(merged).filter(Boolean).slice(0, 8)
}

function scoreWithVerification(baseScore: number, verification?: PrivateCompanyVerification) {
  let score = baseScore
  if (verification?.matched && verification.confidence >= 90) score += 3
  if (verification?.riskTags.some(tag => /新企|税务|地址|异常|高开票/.test(tag))) score += 5
  if (verification?.duplicateRisk === 'possible') score -= 5
  if (verification?.duplicateRisk === 'hit') score -= 12
  return Math.max(35, Math.min(98, score))
}

function applyVerification(contact: PrivateContact, verification?: PrivateCompanyVerification): PrivateContact {
  if (!verification) return contact
  const tags = withVerificationTags(contact.tags, verification)
  const nextAction = verification.duplicateRisk === 'hit'
    ? '先进入撞单管理确认归属,再安排销售跟进'
    : contact.nextAction
  return {
    ...contact,
    companyName: verification.entityName || contact.companyName,
    tags,
    score: scoreWithVerification(contact.score, verification),
    nextAction,
    entityId: verification.entityId,
    creditCode: verification.creditCode,
    verification
  }
}

async function buildImportPreview(rows: PrivateContactImportRow[], contacts: PrivateContact[]) {
  const existingMap = new Map(contacts.map(item => [contactKey(item.companyName, item.phone), item.companyName]))
  const seenMap = new Map<string, number>()
  const preview: PrivateImportPreviewRow[] = []
  for (const [idx, raw] of rows.entries()) {
    const rowNo = idx + 2
    const data: PrivateContactImportRow = {
      companyName: cleanText(raw.companyName),
      name: cleanText(raw.name),
      phone: normalizePhone(raw.phone),
      source: cleanText(raw.source),
      communityName: cleanText(raw.communityName),
      ownerName: cleanText(raw.ownerName),
      demand: cleanText(raw.demand),
      serviceLine: cleanText(raw.serviceLine),
      estimatedAmount: cleanText(raw.estimatedAmount),
      tags: cleanText(raw.tags),
      stage: cleanText(raw.stage),
      nextAction: cleanText(raw.nextAction),
      lastTouchAt: cleanText(raw.lastTouchAt)
    }
    const checked = validateImportRow(data)
    const key = contactKey(checked.companyName, checked.phone)
    let duplicateText = ''
    let verification: PrivateCompanyVerification | undefined
    if (!checked.errors.length) {
      verification = await resolveCompanyVerification(data.companyName)
    }
    if (!checked.errors.length && existingMap.has(key)) duplicateText = `已存在: ${existingMap.get(key)}`
    if (!checked.errors.length && !duplicateText && seenMap.has(key)) duplicateText = `本次导入第 ${seenMap.get(key)} 行已出现`
    if (!checked.errors.length && !duplicateText && verification?.duplicateRisk === 'hit') {
      duplicateText = `工商撞单: ${verification.nextAction}`
    }
    if (!checked.errors.length && !duplicateText) seenMap.set(key, rowNo)
    preview.push({
      rowNo,
      data,
      status: checked.errors.length ? 'error' : duplicateText ? 'duplicate' : 'ready',
      errors: checked.errors,
      duplicateText,
      verification
    })
  }
  return preview
}

function contactFromImport(row: PrivateContactImportRow, id: number, verification?: PrivateCompanyVerification): PrivateContact {
  const stage = normalizeStage(row.stage)
  const tags = tagList(row.tags)
  const source = normalizeSource(row.source) || '企业微信'
  const amount = amountOf(row.estimatedAmount)
  const contact: PrivateContact = {
    id,
    name: cleanText(row.name),
    companyName: verification?.entityName || cleanText(row.companyName),
    phone: normalizePhone(row.phone),
    source,
    communityName: cleanText(row.communityName) || `${source}导入`,
    ownerName: cleanText(row.ownerName) || '待分配',
    tags: tags.length ? tags : [source, cleanText(row.serviceLine) || '待分类'],
    stage,
    score: scoreOf(row, stage, tags),
    demand: cleanText(row.demand),
    serviceLine: cleanText(row.serviceLine) || '综合财税',
    estimatedAmount: amount,
    lastTouchAt: cleanText(row.lastTouchAt) || ts(),
    nextAction: cleanText(row.nextAction) || '导入后 24 小时内完成首次触达',
    touchCount: 1
  }
  return applyVerification(contact, verification)
}

export const privateDomainApi = {
  importTemplate() {
    return delay({
      columns: privateImportTemplateColumns,
      samples: privateImportTemplateSamples
    })
  },
  async dashboard() {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const groups = readList<PrivateGroup>(GROUP_KEY)
    const contents = readList<PrivateContent>(CONTENT_KEY)
    const tasks = readList<PrivateTask>(TASK_KEY)
    const integrations = readList<PrivateIntegration>(INTEGRATION_KEY)
    const opsProfile = readProfile()
    return delay({
      summary: calcSummary(contacts, groups),
      contacts,
      groups,
      contents,
      tasks,
      integrations,
      opsProfile,
      opsChecks: buildOpsChecks(opsProfile, integrations),
      dailyActions: buildDailyActions(opsProfile)
    })
  },
  async getOpsProfile() {
    ensureSeeds()
    return delay(readProfile())
  },
  async saveOpsProfile(profile: PrivateOpsProfile) {
    ensureSeeds()
    const payload: PrivateOpsProfile = {
      ...defaultProfile(),
      ...profile,
      privatePlatforms: profile.privatePlatforms || [],
      departments: profile.departments || [],
      keyServices: profile.keyServices || [],
      requiredFields: profile.requiredFields || [],
      answers: normalizeAnswers(profile.answers),
      updatedAt: ts()
    }
    writeProfile(payload)
    return delay(payload)
  },
  async previewImport(rows: PrivateContactImportRow[]) {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    return delay(await buildImportPreview(rows, contacts))
  },
  async importContacts(rows: PrivateContactImportRow[]): Promise<PrivateImportResult> {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const preview = await buildImportPreview(rows, contacts)
    let nextId = maxId(contacts)
    const importedContacts = preview
      .filter(item => item.status === 'ready')
      .map(item => contactFromImport(item.data, ++nextId, item.verification))
    if (importedContacts.length) writeList(CONTACT_KEY, [...importedContacts, ...contacts])
    return delay({
      total: preview.length,
      imported: importedContacts.length,
      duplicate: preview.filter(item => item.status === 'duplicate').length,
      failed: preview.filter(item => item.status === 'error').length,
      contacts: importedContacts,
      preview
    })
  },
  async listContacts(params: { keyword?: string; source?: string; stage?: string } = {}) {
    ensureSeeds()
    const keyword = (params.keyword || '').trim()
    let contacts = readList<PrivateContact>(CONTACT_KEY)
    if (keyword) {
      contacts = contacts.filter(item => `${item.name}${item.companyName}${item.phone}${item.demand}${item.tags.join('')}`.includes(keyword))
    }
    if (params.source) contacts = contacts.filter(item => item.source === params.source)
    if (params.stage) contacts = contacts.filter(item => item.stage === params.stage)
    contacts = contacts.sort((a, b) => b.score - a.score || b.lastTouchAt.localeCompare(a.lastTouchAt))
    return delay(contacts)
  },
  async verifyContact(id: number) {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const idx = contacts.findIndex(item => item.id === id)
    if (idx < 0) throw new Error('私域客户不存在')
    const verification = await resolveCompanyVerification(contacts[idx].companyName)
    contacts[idx] = applyVerification({ ...contacts[idx], lastTouchAt: ts() }, verification)
    writeList(CONTACT_KEY, contacts)
    return delay(contacts[idx])
  },
  async updateStage(id: number, stage: PrivateStage) {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const idx = contacts.findIndex(item => item.id === id)
    if (idx < 0) throw new Error('私域客户不存在')
    contacts[idx] = { ...contacts[idx], stage, lastTouchAt: ts() }
    writeList(CONTACT_KEY, contacts)
    return delay(contacts[idx])
  },
  async createTaskFromContact(id: number) {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const contact = contacts.find(item => item.id === id)
    if (!contact) throw new Error('私域客户不存在')
    const tasks = readList<PrivateTask>(TASK_KEY)
    const task: PrivateTask = {
      id: maxId(tasks) + 1,
      title: contact.nextAction,
      contactName: contact.name,
      companyName: contact.companyName,
      ownerName: contact.ownerName,
      dueTime: ts(1, 10, 0),
      priority: contact.score >= 85 ? '高' : '中',
      status: 'pending',
      action: `${contact.source}触达 + CRM 跟进记录`
    }
    tasks.unshift(task)
    writeList(TASK_KEY, tasks)
    return delay(task)
  },
  async convertToOnlineLead(id: number) {
    ensureSeeds()
    const contacts = readList<PrivateContact>(CONTACT_KEY)
    const idx = contacts.findIndex(item => item.id === id)
    if (idx < 0) throw new Error('私域客户不存在')
    if (contacts[idx].convertedLeadId) return delay({ leadId: contacts[idx].convertedLeadId, reused: true })

    const channel: OnlineLeadCreatePayload['channel'] = contacts[idx].source === '老客转介绍' ? '老客转介绍' : '企微'
    const result = await onlineLeadApi.create({
      companyName: contacts[idx].companyName,
      channel,
      landingPage: `${contacts[idx].source}-${contacts[idx].communityName || '私域运营'}`,
      contactName: contacts[idx].name,
      phone: contacts[idx].phone,
      demand: contacts[idx].demand,
      utmCampaign: `private-domain-${contacts[idx].source}`,
      cost: 0
    })
    contacts[idx] = { ...contacts[idx], convertedLeadId: result.lead.id, stage: contacts[idx].stage === 'new' ? 'nurturing' : contacts[idx].stage }
    writeList(CONTACT_KEY, contacts)
    return delay({ leadId: result.lead.id, reused: false })
  }
}

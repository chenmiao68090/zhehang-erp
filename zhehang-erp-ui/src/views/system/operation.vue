<template>
  <div class="rule-center page-container">
    <header class="rule-header">
      <div>
        <span class="eyebrow">RULE CENTER</span>
        <h1>规则配置中心</h1>
        <p>统一维护分配、回收、呼叫、交付、渠道、财务、权限和清理规则，业务页面只保留执行动作、状态说明和必要跳转。</p>
      </div>
      <div class="header-actions">
        <el-button @click="activeTab = 'overview'">归并总览</el-button>
        <el-button type="primary" @click="saveSection(activeTab)">保存当前分类</el-button>
      </div>
    </header>

    <section class="summary-grid">
      <div v-for="item in summaryCards" :key="item.label" class="summary-item">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}</b>
        <em>{{ item.sub }}</em>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="rule-tabs">
      <el-tab-pane label="总览" name="overview">
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>归并结果</h2>
              <p>把“能改规则”的地方集中到一个责任入口，旧业务页只做执行和查看，避免同一规则被多处维护。</p>
            </div>
            <el-tag type="success" effect="plain">8 类规则</el-tag>
          </div>

          <el-table :data="ownershipRows" border stripe>
            <el-table-column prop="oldName" label="原入口/散落位置" min-width="180" />
            <el-table-column prop="conflict" label="问题" min-width="240" />
            <el-table-column prop="newOwner" label="归集到" width="160" />
            <el-table-column prop="boundary" label="业务页保留边界" min-width="220" />
            <el-table-column label="处理" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="row.level" effect="plain">{{ row.action }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="module-grid">
          <button
            v-for="item in moduleCards"
            :key="item.key"
            class="module-card"
            type="button"
            @click="activeTab = item.key"
          >
            <span>{{ item.code }}</span>
            <strong>{{ item.title }}</strong>
            <em>{{ item.desc }}</em>
            <small>{{ item.count }}</small>
          </button>
        </section>
      </el-tab-pane>

      <el-tab-pane
        v-for="module in moduleCards"
        :key="module.key"
        :label="module.title"
        :name="module.key"
      >
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>{{ module.title }}</h2>
              <p>{{ module.desc }}</p>
            </div>
            <el-tag effect="plain">{{ module.owner }}</el-tag>
          </div>

          <el-table :data="rulesForTab(module.key)" border stripe>
            <el-table-column prop="name" label="规则项" min-width="170" />
            <el-table-column prop="owner" label="责任页面/数据源" min-width="180" />
            <el-table-column prop="conflict" label="原冲突点" min-width="240" />
            <el-table-column prop="decision" label="统一口径" min-width="260" />
            <el-table-column label="状态" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="row.level" effect="plain">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="入口" width="110" align="center">
              <template #default="{ row }">
                <el-button v-if="row.path" link type="primary" @click="go(row.path)">打开</el-button>
                <span v-else class="muted">已收口</span>
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="check-grid">
          <article v-for="item in checksForTab(module.key)" :key="item.title" class="check-card">
            <span>{{ item.badge }}</span>
            <strong>{{ item.title }}</strong>
            <p>{{ item.desc }}</p>
          </article>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

type ModuleTab = 'distribution' | 'pool' | 'call' | 'delivery' | 'channel' | 'finance' | 'permission' | 'cleanup'
type RuleTab = 'overview' | ModuleTab
type TagLevel = 'success' | 'warning' | 'danger' | 'info' | 'primary'

interface ModuleCard {
  key: ModuleTab
  code: string
  title: string
  desc: string
  count: string
  owner: string
}

interface RuleRow {
  tab: ModuleTab
  name: string
  owner: string
  conflict: string
  decision: string
  status: string
  level: TagLevel
  path?: string
}

interface CheckItem {
  tab: ModuleTab
  badge: string
  title: string
  desc: string
}

const route = useRoute()
const router = useRouter()

const tabNames: RuleTab[] = ['overview', 'distribution', 'pool', 'call', 'delivery', 'channel', 'finance', 'permission', 'cleanup']
const queryTab = String(route.query.tab || '')
const activeTab = ref<RuleTab>(tabNames.includes(queryTab as RuleTab) ? queryTab as RuleTab : 'overview')

watch(() => route.query.tab, value => {
  const next = String(value || '')
  activeTab.value = tabNames.includes(next as RuleTab) ? next as RuleTab : 'overview'
})

watch(activeTab, tab => {
  const current = String(route.query.tab || '')
  const next = tab === 'overview' ? '' : tab
  if (current !== next) {
    router.replace({ path: '/system/operation', query: tab === 'overview' ? {} : { tab } })
  }
})

const moduleCards: ModuleCard[] = [
  { key: 'distribution', code: '01', title: '线索分配', desc: '电销、网销、私域、工商新注册线索的入池和派发策略。', count: '5 项', owner: '销售运营负责人' },
  { key: 'pool', code: '02', title: '公海私海', desc: '公海池、私海持有上限、保护期、回收和撞单处理口径。', count: '6 项', owner: '销售主管' },
  { key: 'call', code: '03', title: '呼叫中心', desc: '坐席、技能组、号码线路、IVR 和外呼任务规则。', count: '5 项', owner: '电销主管' },
  { key: 'delivery', code: '04', title: '财税交付', desc: '服务类型到任务模板、周期任务、交接和满意度升级规则。', count: '5 项', owner: '交付主管' },
  { key: 'channel', code: '05', title: '渠道合作', desc: '同行渠道、挂靠地址资源、报价毛利、账期额度和冻结规则。', count: '5 项', owner: '渠道负责人' },
  { key: 'finance', code: '06', title: '财务绩效', desc: '科目归集、费用审批、提成、薪酬绩效和凭证模板规则。', count: '6 项', owner: '财务负责人' },
  { key: 'permission', code: '07', title: '权限接入', desc: '角色数据范围、菜单按钮、三方登录、OpenAPI 和通知模板规则。', count: '6 项', owner: '系统管理员' },
  { key: 'cleanup', code: '08', title: '数据清理', desc: '重复客户、无效线索、超期归档、日志保留和定时任务。', count: '5 项', owner: '运营管理层' }
]

const ownershipRows = [
  { oldName: '分配规则 / 私域归属规则', conflict: '电销、网销、私域、公海各自维护分配口径，容易重复派发。', newOwner: '线索分配', boundary: '业务页只展示命中规则和执行分配。', action: '统一', level: 'success' as TagLevel },
  { oldName: '公海管理 / 回收规则 / 持有上限', conflict: '公海配置、回收天数、保护期、持有量散在多个页面。', newOwner: '公海私海', boundary: '公海页只做领取、转移、查看预警。', action: '隐藏旧菜单', level: 'success' as TagLevel },
  { oldName: '坐席管理 / 技能组 / 号码线路 / IVR', conflict: '呼叫配置和外呼执行混在同一模块，销售日常菜单过重。', newOwner: '呼叫中心', boundary: '呼叫中心只保留监控、通话、外呼、报表。', action: '隐藏旧菜单', level: 'success' as TagLevel },
  { oldName: '周期任务侧边规则 / 合同续费阶梯', conflict: '交付模板和任务执行页面混在一起，后续服务类型会越来越乱。', newOwner: '财税交付', boundary: '任务页只做派单、处理、验收和回访。', action: '收口', level: 'primary' as TagLevel },
  { oldName: '渠道价格卡 / 账期规则 / 地址资源规则', conflict: '渠道报价、额度和冻结规则藏在业务表格上方。', newOwner: '渠道合作', boundary: '渠道页只做客户、供应商、资源和采购动作。', action: '收口', level: 'primary' as TagLevel },
  { oldName: '成本科目 / 绩效提成 / 薪酬规则', conflict: '财务统计、发放、提成规则没有统一口径。', newOwner: '财务绩效', boundary: '财务页只做登记、审核、生成凭证。', action: '收口', level: 'primary' as TagLevel },
  { oldName: '角色权限 / 菜单 / OAuth / OpenAPI', conflict: '权限、接入、通知属于系统规则，不能分散在业务模块。', newOwner: '权限接入', boundary: '系统页保留细粒度维护，规则中心统一索引。', action: '索引', level: 'info' as TagLevel },
  { oldName: '查重、回收扫描、归档、日志保留', conflict: '数据生命周期规则没有统一体检入口。', newOwner: '数据清理', boundary: '业务页只展示清理结果和处理队列。', action: '新增', level: 'warning' as TagLevel }
]

const ruleRows: RuleRow[] = [
  { tab: 'distribution', name: '工商新注册线索路由', owner: '营销获客/拓客情报', conflict: '探迹线索、企业号码查询、私域留资都能建线索。', decision: '统一先查重，再按来源、地区、业务类型入池。', status: '已归集', level: 'success', path: '/system/operation?tab=distribution' },
  { tab: 'distribution', name: '电销/网销权重分配', owner: '客户中心/线索管理', conflict: '销售手动分配和自动分配并存。', decision: '用同一套权重公式：负载、转化率、角色、冷却期。', status: '已归集', level: 'success', path: '/system/distribute-config' },
  { tab: 'distribution', name: '私域来源归属', owner: '私域运营', conflict: '私域页面可编辑归属规则，和公海分配口径冲突。', decision: '私域页保留结果预览，规则主档挂到线索分配。', status: '待迁移接口', level: 'warning', path: '/leads/private-domain?tab=ownership' },
  { tab: 'distribution', name: '活动 ROI 归因', owner: '营销活动/网销投产比', conflict: '投放成本和线索归属如果分开，ROI 会算偏。', decision: '线索必须带 campaignId/sourceCost，订单回款反写 ROI。', status: '待接真数', level: 'warning', path: '/leads/online-roi' },
  { tab: 'distribution', name: '重复分配冷却', owner: '线索管理', conflict: '同一员工可能连续拿高价值线索。', decision: '按 24 小时高价值线索冷却和公平修正执行。', status: '规则定义', level: 'info' },

  { tab: 'pool', name: '公海池配置', owner: '公海管理', conflict: '公海类型、可见范围、操作范围原来在客户中心菜单里。', decision: '从客户中心隐藏，统一归属公海私海规则。', status: '菜单隐藏', level: 'success', path: '/customer/pool-admin' },
  { tab: 'pool', name: '回收规则', owner: '回收规则', conflict: '回收规则和自动化扫描重复。', decision: '回收天数、预警灯、去向池统一维护。', status: '已跳转', level: 'success', path: '/system/recycle-config' },
  { tab: 'pool', name: '持有上限', owner: '个人私海', conflict: '角色持有上限在页面和接口 Mock 中都有。', decision: '按角色维护 maxHolding、宽容率和超时释放。', status: '待接真数', level: 'warning', path: '/customer/personal-pool' },
  { tab: 'pool', name: '撞单仲裁', owner: '撞单管理', conflict: '查重规则、冲突处理规则和公海规则交叉。', decision: '规则中心定口径，撞单页只处理案件。', status: '保留案件页', level: 'primary', path: '/customer/collision-manage' },
  { tab: 'pool', name: '保护期策略', owner: '线索/客户主档', conflict: '不同来源保护期不一致。', decision: '按来源和客户价值维护保护期，回收不得早于保护期。', status: '规则定义', level: 'info' },
  { tab: 'pool', name: '连续回收降级', owner: '回收预警', conflict: '多次回收后是否降级没有统一动作。', decision: '3 次回收自动降级并限制原负责人重领。', status: '规则定义', level: 'info' },

  { tab: 'call', name: '坐席容量', owner: '坐席管理', conflict: '配置页占据呼叫中心日常菜单。', decision: '从左侧隐藏，归呼叫规则中心索引。', status: '菜单隐藏', level: 'success', path: '/call-center/agent' },
  { tab: 'call', name: '技能组路由', owner: '技能组', conflict: '技能组决定线索承接和 IVR 分流，不能散在呼叫页。', decision: '技能组作为呼叫规则主数据。', status: '菜单隐藏', level: 'success', path: '/call-center/skill' },
  { tab: 'call', name: '号码与线路', owner: '号码与线路', conflict: '线路异常会影响外呼和客户归属。', decision: '号码池、归属部门、可用时段统一维护。', status: '菜单隐藏', level: 'success', path: '/call-center/number' },
  { tab: 'call', name: 'IVR 流程', owner: 'IVR 流程', conflict: '流程配置偏后台，不应混在销售日常菜单。', decision: 'IVR 按业务线挂到呼叫规则。', status: '菜单隐藏', level: 'success', path: '/call-center/ivr' },
  { tab: 'call', name: '外呼任务节奏', owner: '外呼任务', conflict: '拨打频次和回收规则联动。', decision: '外呼页执行任务，频次策略在规则中心登记。', status: '已归集', level: 'primary', path: '/call-center/outbound' },

  { tab: 'delivery', name: '服务任务模板', owner: '周期性任务', conflict: '不同服务类型的任务清单写在页面静态规则里。', decision: '服务类型到任务模板统一建模。', status: '待迁移接口', level: 'warning', path: '/task-center/periodic' },
  { tab: 'delivery', name: '一次性任务分类', owner: '一次性任务', conflict: '工商、税务、异常解除任务拆分不统一。', decision: '按业务类型生成标准子任务和 SLA。', status: '规则定义', level: 'info', path: '/task-center/once' },
  { tab: 'delivery', name: '客户交接', owner: '客户交接', conflict: '销售转会计、会计转项目交接字段不统一。', decision: '交接资料、责任人和确认节点模板化。', status: '已归集', level: 'primary', path: '/task-center/handover' },
  { tab: 'delivery', name: '续费提醒阶梯', owner: '合同管理/续费管理', conflict: '合同页和续费页各自写提醒阶段。', decision: '统一按 30/15/7/3/1 天提醒并升级。', status: '已归集', level: 'primary', path: '/order/contract' },
  { tab: 'delivery', name: '满意度升级', owner: '满意度回访', conflict: '低评分后是否派 C/D 类任务不统一。', decision: '低评分自动升级项目部或老板任务。', status: '规则定义', level: 'info', path: '/task-center/satisfaction' },

  { tab: 'channel', name: '同行渠道等级', owner: '同行渠道', conflict: '等级、毛利和账期展示在渠道页卡片里。', decision: '等级决定售价、账期、额度和审批门槛。', status: '已归集', level: 'primary', path: '/supply/channel-partner' },
  { tab: 'channel', name: '挂靠地址资源定价', owner: '地址资源池', conflict: '资源底价、库存预警和报价规则分散。', decision: '地址资源先定底价，再按渠道等级加价。', status: '已归集', level: 'primary', path: '/supply/receipt' },
  { tab: 'channel', name: '地址供应商准入', owner: '地址供应商', conflict: '供应商资质和资源采购动作混在一起。', decision: '准入、续评、黑名单归渠道合作规则。', status: '规则定义', level: 'info', path: '/supply/vendor' },
  { tab: 'channel', name: '月结额度冻结', owner: '同行渠道', conflict: '逾期和额度超限后是否停单不明确。', decision: '超过额度 80% 预警，逾期 15 天冻结新单。', status: '规则定义', level: 'info', path: '/supply/channel-partner' },
  { tab: 'channel', name: '采购补货阈值', owner: '资源补充单', conflict: '库存低于多少补货缺统一阈值。', decision: '按区域、业务热度和交付 SLA 触发采购。', status: '规则定义', level: 'info', path: '/supply/purchase' },

  { tab: 'finance', name: '日记账科目归集', owner: '日记账', conflict: '二级科目口径不一致，影响老板看账。', decision: '按业务收入、渠道成本、运营投放、人力费用等一级模块归集。', status: '已归集', level: 'primary', path: '/finance/journal' },
  { tab: 'finance', name: '业务支出审批', owner: '业务支出管理', conflict: '支出、报销、备用金边界不清。', decision: '对公支出走业务支出，个人垫付走报销，预借走备用金。', status: '规则定义', level: 'info', path: '/finance/expense' },
  { tab: 'finance', name: '提成结算', owner: '提成结算/绩效提成', conflict: '销售业绩、任务提成、财务发放各有口径。', decision: '任务中心算明细，财务绩效做复核和发放入账。', status: '已归集', level: 'primary', path: '/task-center/commission' },
  { tab: 'finance', name: '成本预算', owner: '管理成本', conflict: '成本科目和部门预算规则在看板里展示。', decision: '预算规则归中心，成本页只看执行和偏差。', status: '待迁移接口', level: 'warning', path: '/finance/cost' },
  { tab: 'finance', name: '凭证模板', owner: '凭证管理', conflict: '业务动作生成凭证缺统一模板。', decision: '按收款、退款、成本、薪酬维护凭证模板。', status: '规则定义', level: 'info', path: '/finance/journal' },
  { tab: 'finance', name: '薪酬绩效', owner: '薪酬管理', conflict: '薪酬和绩效发放节奏不统一。', decision: '薪酬基数、绩效周期、扣减项统一登记。', status: '规则定义', level: 'info', path: '/finance/salary' },

  { tab: 'permission', name: '角色数据范围', owner: '角色管理', conflict: '不同模块看到的数据范围必须统一。', decision: '以角色 dataScope 为准，菜单和接口都遵守。', status: '已实现', level: 'success', path: '/system/role' },
  { tab: 'permission', name: '菜单按钮权限', owner: '菜单管理', conflict: '前端菜单和后端按钮权限容易脱节。', decision: '菜单作为路由源，按钮按权限码控制。', status: '已归集', level: 'primary', path: '/system/menu' },
  { tab: 'permission', name: '第三方登录', owner: '第三方登录配置', conflict: '企微、飞书、钉钉登录接入没有菜单。', decision: '配置页隐藏，规则中心提供管理员入口。', status: '新增入口', level: 'success', path: '/system/oauth-config' },
  { tab: 'permission', name: 'OpenAPI 应用', owner: '开放接口配置', conflict: '密钥、签名、限流属于接入规则。', decision: '配置页隐藏，统一从规则中心进入。', status: '新增入口', level: 'success', path: '/system/openapi' },
  { tab: 'permission', name: '通知模板', owner: '消息中心', conflict: '消息模板和业务通知策略混在一起。', decision: '消息中心负责内容，规则中心登记触发条件。', status: '已归集', level: 'primary', path: '/system/notification' },
  { tab: 'permission', name: '员工账号绑定', owner: '用户管理/员工管理', conflict: 'sys_user 和 org_employee 不绑定会导致数据归属错。', decision: '账号、员工、部门、角色必须一对一绑定。', status: 'P0 风险', level: 'danger', path: '/system/user' },

  { tab: 'cleanup', name: '重复客户归并', owner: '撞单管理/企业主体库', conflict: '同一个企业可能有多个客户主档。', decision: '强命中直接归并，弱命中进入仲裁。', status: '规则定义', level: 'info', path: '/customer/collision-manage' },
  { tab: 'cleanup', name: '无效线索归档', owner: '线索管理', conflict: '无效、空号、停机、注销公司没有统一归档。', decision: '按无效原因归档，保留审计和可恢复入口。', status: '规则定义', level: 'info', path: '/customer/lead' },
  { tab: 'cleanup', name: '回收扫描定时任务', owner: '回收预警', conflict: '手动回收和自动扫描混用。', decision: '定时任务只生成队列，主管可复核高价值客户。', status: '已归集', level: 'primary', path: '/system/recycle-config' },
  { tab: 'cleanup', name: '日志保留周期', owner: '操作日志/登录日志', conflict: '日志一直增长会影响系统稳定。', decision: '操作日志保留 180 天，登录日志保留 90 天，异常日志长期归档。', status: '规则定义', level: 'info', path: '/system/oper-log' },
  { tab: 'cleanup', name: '离职客户清理', owner: '员工异动/交接', conflict: '离职后客户和任务容易私下交接。', decision: '离职触发冻结、回收、转交、消息通知和审计。', status: '已归集', level: 'primary', path: '/task-center/handover' }
]

const checkItems: CheckItem[] = [
  { tab: 'distribution', badge: '校验', title: '每条线索必须有来源', desc: '没有 source/campaignId 的线索不能进入自动分配，否则 ROI 和责任人都会断。' },
  { tab: 'distribution', badge: '校验', title: '分配前先查重', desc: '手机号、公司名、统一社会信用代码命中后先冻结再分配。' },
  { tab: 'pool', badge: '校验', title: '保护期先于回收期', desc: '回收天数不能小于保护期，老客转介绍和同行渠道必须加长保护。' },
  { tab: 'pool', badge: '校验', title: '高价值客户主管复核', desc: '回款潜力高、已有合同、即将续费客户不能被自动粗暴回收。' },
  { tab: 'call', badge: '校验', title: '线路归属到团队', desc: '号码、技能组、坐席和销售团队要能对应，否则通话记录无法反算线索质量。' },
  { tab: 'call', badge: '校验', title: '外呼频次避开投诉', desc: '同一客户每日、每周呼叫次数要限额，空号和拒接要进入降频。' },
  { tab: 'delivery', badge: '校验', title: '服务类型生成任务清单', desc: '代理记账、工商注册、异常解除、挂靠地址必须有不同的交付模板。' },
  { tab: 'delivery', badge: '校验', title: '交付超期自动升级', desc: 'SLA 红灯后通知主管，连续超期进入老板任务。' },
  { tab: 'channel', badge: '校验', title: '渠道订单检查库存', desc: '地址资源不足时不能直接下单，要先触发采购或换区。' },
  { tab: 'channel', badge: '校验', title: '低毛利必须审批', desc: '低于等级毛利底线时，订单必须走主管审批。' },
  { tab: 'finance', badge: '校验', title: '业务发生即带科目', desc: '提单、收款、采购、投放、薪酬进入财务时必须带一级模块和二级科目。' },
  { tab: 'finance', badge: '校验', title: '提成以回款为准', desc: '未回款或被退款的订单不能直接进入可发放提成。' },
  { tab: 'permission', badge: '校验', title: '账号必须绑定员工', desc: '没有员工档案的账号不能参与提成、任务、考勤和数据范围判断。' },
  { tab: 'permission', badge: '校验', title: '老板视角和员工视角分离', desc: '老板看全局，主管看团队，员工只看自己负责的数据。' },
  { tab: 'cleanup', badge: '校验', title: '清理动作必须留痕', desc: '归并、删除、回收、归档都要有操作日志，方便复盘和追责。' },
  { tab: 'cleanup', badge: '校验', title: '清理前先可恢复', desc: '删除类动作先进入回收站或冻结库，确认后再物理清理。' }
]

const summaryCards = computed(() => {
  const hiddenMenus = ruleRows.filter(item => item.status.includes('菜单隐藏')).length
  const warningRules = ruleRows.filter(item => item.level === 'warning' || item.level === 'danger').length
  return [
    { label: '规则分类', value: `${moduleCards.length}`, sub: '按业务责任人归口' },
    { label: '已登记规则项', value: `${ruleRows.length}`, sub: '含旧入口处理方式' },
    { label: '隐藏旧菜单', value: `${hiddenMenus}`, sub: '保留旧地址不打断' },
    { label: '待落地风险', value: `${warningRules}`, sub: '接口/人员绑定优先处理' }
  ]
})

function rulesForTab(tab: ModuleTab) {
  return ruleRows.filter(item => item.tab === tab)
}

function checksForTab(tab: ModuleTab) {
  return checkItems.filter(item => item.tab === tab)
}

function saveSection(tab: RuleTab) {
  const title = tab === 'overview'
    ? '规则归并总览'
    : moduleCards.find(item => item.key === tab)?.title || '当前分类'
  ElMessage.success(`${title} 已记录为统一口径`)
}

function go(path: string) {
  router.push(path)
}
</script>

<style scoped>
.rule-center {
  color: #1f2937;
}

.rule-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 18px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
}

.eyebrow {
  display: block;
  margin-bottom: 6px;
  color: #3370ff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
}

.rule-header h1 {
  margin: 0 0 6px;
  font-size: 22px;
  font-weight: 750;
}

.rule-header p,
.section-head p,
.check-card p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

.header-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.summary-item {
  padding: 14px;
  border: 1px solid #e9edf5;
  border-radius: 8px;
  background: #fff;
}

.summary-item span,
.summary-item em {
  display: block;
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.summary-item b {
  display: block;
  margin: 6px 0 4px;
  color: #111827;
  font-size: 24px;
  font-weight: 760;
}

.rule-tabs {
  padding: 16px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
}

.section-block {
  margin-bottom: 14px;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 12px;
}

.section-head h2 {
  margin: 0 0 4px;
  font-size: 16px;
  font-weight: 720;
}

.module-grid,
.check-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.module-card,
.check-card {
  min-width: 0;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  background: #f8fafc;
}

.module-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  text-align: left;
  cursor: pointer;
}

.module-card:hover {
  border-color: #3370ff;
  background: #f5f9ff;
}

.module-card span,
.check-card span {
  color: #3370ff;
  font-size: 12px;
  font-weight: 700;
}

.module-card strong,
.check-card strong {
  color: #1f2937;
  font-size: 14px;
  font-weight: 720;
}

.module-card em,
.module-card small,
.check-card p,
.muted {
  color: #667085;
  font-size: 12px;
  font-style: normal;
  line-height: 1.6;
}

.check-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background: #edf1f7;
}

:deep(.el-table) {
  --el-table-border-color: #edf1f7;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #344054;
  color: #344054;
}

@media (max-width: 1180px) {
  .summary-grid,
  .module-grid,
  .check-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .rule-header,
  .section-head {
    flex-direction: column;
  }

  .summary-grid,
  .module-grid,
  .check-grid {
    grid-template-columns: 1fr;
  }
}
</style>

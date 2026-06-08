<template>
  <div class="rule-center page-container">
    <header class="rule-header">
      <div>
        <span class="eyebrow">RULE CENTER</span>
        <h1>规则配置中心</h1>
        <p>把分配、回收、自动化、权限和接入类规则统一维护,业务页面只保留执行入口和状态说明。</p>
      </div>
      <div class="header-actions">
        <el-button @click="activeTab = 'overview'">查看归并结果</el-button>
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
              <h2>规则归并结果</h2>
              <p>平级散落的规则页面已收口到这里,旧页面已删除,老地址保留跳转到对应分类。</p>
            </div>
            <el-tag type="success" effect="plain">已统一入口</el-tag>
          </div>
          <el-table :data="conflictItems" border stripe>
            <el-table-column prop="oldName" label="原入口/页面" width="180" />
            <el-table-column prop="problem" label="冲突点" min-width="240" />
            <el-table-column prop="newOwner" label="归集位置" width="180" />
            <el-table-column label="处理方式" width="160">
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

      <el-tab-pane label="线索分配" name="distribution">
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>渠道路由与分配规则</h2>
              <p>所有获客入口先进入统一分配引擎,再按池、团队、容量和权重决定负责人。</p>
            </div>
            <el-button type="primary" @click="addDistributionRoute">新增路由规则</el-button>
          </div>
          <el-table :data="distributionRoutes" border stripe>
            <el-table-column prop="source" label="来源" min-width="150" />
            <el-table-column prop="targetPool" label="目标池" width="130" />
            <el-table-column label="分配模式" width="150">
              <template #default="{ row }">
                <el-select v-model="row.mode" size="small">
                  <el-option label="自动分配" value="auto" />
                  <el-option label="主管手动" value="manual" />
                  <el-option label="主动抢单" value="grab" />
                  <el-option label="审批制" value="approval" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="承接团队" min-width="150">
              <template #default="{ row }">
                <el-input v-model="row.team" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="110" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.priority" :min="1" :max="9" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>权重公式</h2>
              <p>加权轮询只保留一套算法,业务页面不再各自维护分配逻辑。</p>
            </div>
            <el-tag :type="weightSum === 100 ? 'success' : 'danger'" effect="plain">合计 {{ weightSum }}%</el-tag>
          </div>
          <div class="factor-grid">
            <div v-for="item in weightFactors" :key="item.key" class="factor-row">
              <div>
                <strong>{{ item.label }}</strong>
                <span>{{ item.desc }}</span>
              </div>
              <el-slider v-model="item.value" :min="0" :max="100" show-input :show-input-controls="false" />
            </div>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="回收预警" name="recycle">
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>回收规则</h2>
              <p>客户保护期、超期回收、连续回收降级统一在这里配置。</p>
            </div>
            <el-button type="primary" @click="addRecycleRule">新增回收规则</el-button>
          </div>
          <el-table :data="recycleRules" border stripe>
            <el-table-column prop="name" label="规则名称" min-width="170" />
            <el-table-column prop="scope" label="适用范围" width="150" />
            <el-table-column label="回收天数" width="120" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.recycleDays" :min="1" :max="90" size="small" controls-position="right" />
              </template>
            </el-table-column>
            <el-table-column label="预警节奏" min-width="220">
              <template #default="{ row }">
                <span class="warning-seq">绿灯 {{ row.green }} 天 · 黄灯 {{ row.yellow }} 天 · 红灯 {{ row.red }} 天</span>
              </template>
            </el-table-column>
            <el-table-column prop="targetPool" label="回收去向" width="140" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
          </el-table>
        </section>

        <section class="policy-strip">
          <div v-for="item in recyclePolicies" :key="item.title">
            <span>{{ item.title }}</span>
            <b>{{ item.value }}</b>
            <em>{{ item.desc }}</em>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="自动化流程" name="automation">
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>自动化流程规则</h2>
              <p>新客入库、续费提醒、离职交接、异常升级统一编排,不再散在业务页。</p>
            </div>
          </div>
          <div class="workflow-grid">
            <article v-for="item in workflowRules" :key="item.key" class="workflow-card">
              <div class="workflow-top">
                <strong>{{ item.name }}</strong>
                <el-switch v-model="item.enabled" />
              </div>
              <p>{{ item.desc }}</p>
              <div class="workflow-steps">
                <span v-for="step in item.steps" :key="step">{{ step }}</span>
              </div>
              <footer>
                <span>触发: {{ item.trigger }}</span>
                <el-button link type="primary" @click="runFlow(item.name)">立即执行</el-button>
              </footer>
            </article>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="权限与接入" name="system">
        <section class="section-block">
          <div class="section-head">
            <div>
              <h2>系统规则归属</h2>
              <p>权限、菜单、三方登录、开放接口是系统规则,保留原业务页但从这里统一看归属和风险。</p>
            </div>
          </div>
          <el-table :data="systemRuleGroups" border stripe>
            <el-table-column prop="name" label="规则类型" width="160" />
            <el-table-column prop="owner" label="责任页面" width="180" />
            <el-table-column prop="desc" label="说明" min-width="260" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="row.level" effect="plain">{{ row.status }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="入口" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" @click="go(row.path)">打开</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

type RuleTab = 'overview' | 'distribution' | 'recycle' | 'automation' | 'system'

const route = useRoute()
const router = useRouter()
const tabNames: RuleTab[] = ['overview', 'distribution', 'recycle', 'automation', 'system']
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

const conflictItems = [
  { oldName: '分配规则', problem: '与公海局部规则、私域分配入口重复', newOwner: '线索分配', action: '删旧页留跳转', level: 'success' },
  { oldName: '回收规则', problem: '与自动化流程里的回收配置重复', newOwner: '回收预警', action: '删旧页留跳转', level: 'success' },
  { oldName: '流程引擎', problem: '命名偏技术,与规则配置并列后口径不清', newOwner: '自动化流程', action: '改为分类', level: 'primary' },
  { oldName: '公海规则弹窗', problem: '业务页可编辑规则,容易和系统规则冲突', newOwner: '线索分配/回收预警', action: '保留跳转', level: 'warning' }
]

const moduleCards = [
  { key: 'distribution' as RuleTab, code: '01', title: '线索分配', desc: '渠道路由、权重公式、公海池分配模式', count: '8 条规则' },
  { key: 'recycle' as RuleTab, code: '02', title: '回收预警', desc: '保护期、三色预警、超期回收去向', count: '4 条规则' },
  { key: 'automation' as RuleTab, code: '03', title: '自动化流程', desc: '新客、续费、离职交接、异常升级', count: '4 个流程' },
  { key: 'system' as RuleTab, code: '04', title: '权限与接入', desc: '角色菜单、三方登录、开放接口', count: '5 类规则' }
]

const distributionRoutes = ref([
  { source: '探迹/工商新注册公司', targetPool: '新企商机池', mode: 'auto', team: '网销运营组', priority: 1, enabled: true },
  { source: '官网表单/在线客服', targetPool: '网销线索池', mode: 'auto', team: '网销销售组', priority: 2, enabled: true },
  { source: '电销外呼导入', targetPool: '电销线索池', mode: 'manual', team: '电销主管', priority: 3, enabled: true },
  { source: '同行地址渠道', targetPool: '渠道客户池', mode: 'approval', team: '渠道地址组', priority: 2, enabled: true },
  { source: '回收池再激活', targetPool: '回收公海池', mode: 'grab', team: '销售全员', priority: 5, enabled: true }
])

const weightFactors = ref([
  { key: 'role', label: '角色职级', desc: '主管/高绩效销售基础权重更高', value: 25 },
  { key: 'load', label: '当前负载', desc: '持有量越低越容易分配到新线索', value: 35 },
  { key: 'ability', label: '成交能力', desc: '近 30 天转化率和成单率', value: 30 },
  { key: 'fairness', label: '公平修正', desc: '避免同一人连续获得高价值线索', value: 10 }
])

const recycleRules = ref([
  { name: '新线索 3 天未首跟', scope: '新企/网销/电销', recycleDays: 3, green: 2, yellow: 1, red: 0, targetPool: '回收公海池', enabled: true },
  { name: '普通客户 15 天未有效跟进', scope: '普通客户池', recycleDays: 15, green: 7, yellow: 3, red: 1, targetPool: '普通公海池', enabled: true },
  { name: '高意向客户 7 天未推进', scope: '高意向客户', recycleDays: 7, green: 4, yellow: 2, red: 1, targetPool: '主管复核池', enabled: true },
  { name: '地址渠道 30 天未成交', scope: '渠道地址池', recycleDays: 30, green: 10, yellow: 5, red: 2, targetPool: '渠道公海池', enabled: true }
])

const recyclePolicies = [
  { title: '连续回收降级', value: '3 次', desc: '连续回收后自动降级并限制再次分配' },
  { title: '原负责人冷却', value: '15 天', desc: '回收后原负责人冷却期内不可重领' },
  { title: '红灯通知', value: '老板/主管', desc: '高价值客户红灯同步管理层' }
]

const workflowRules = ref([
  { key: 'newLead', name: '新客入库流程', trigger: '新线索创建', enabled: true, desc: '查重、工商信息补全、标签识别、分配入池。', steps: ['查重', '补工商', '打标签', '分配'] },
  { key: 'recycle', name: '回收扫描流程', trigger: '每日 01:00', enabled: true, desc: '扫描超期客户,生成预警,执行回收入池。', steps: ['扫描', '预警', '回收', '通知'] },
  { key: 'renewal', name: '续费提醒流程', trigger: '合同到期前', enabled: true, desc: '按 30/15/7/3/1 天提醒负责人和主管。', steps: ['识别', '提醒', '升级', '复盘'] },
  { key: 'handover', name: '离职交接流程', trigger: '员工离职', enabled: true, desc: '客户、任务、合同和跟进记录自动转交。', steps: ['冻结', '转交', '通知', '审计'] }
])

const systemRuleGroups = [
  { name: '角色权限', owner: '角色管理', desc: '岗位角色、菜单权限和数据范围统一在角色管理维护。', status: '保留', level: 'success', path: '/system/role' },
  { name: '菜单规则', owner: '菜单管理', desc: '路由、菜单显示、按钮权限不再放到业务页配置。', status: '保留', level: 'success', path: '/system/menu' },
  { name: '三方登录', owner: '第三方登录配置', desc: '企业微信等 OAuth 接入属于系统接入规则,后续接入后归此类。', status: '待接入菜单', level: 'warning', path: '/system/operation?tab=system' },
  { name: '开放接口', owner: 'OpenAPI 应用', desc: '外部系统调用、签名、限流和密钥归接入规则。', status: '待接入菜单', level: 'warning', path: '/system/operation?tab=system' },
  { name: '通知规则', owner: '消息中心', desc: '消息模板与通知策略和飞书消息模块保持一致。', status: '保留', level: 'success', path: '/system/notification' }
]

const weightSum = computed(() => weightFactors.value.reduce((sum, item) => sum + item.value, 0))

const summaryCards = computed(() => {
  const enabledRoutes = distributionRoutes.value.filter(item => item.enabled).length
  const enabledRecycle = recycleRules.value.filter(item => item.enabled).length
  const enabledFlows = workflowRules.value.filter(item => item.enabled).length
  return [
    { label: '统一规则分类', value: '4', sub: '分配/回收/流程/系统' },
    { label: '启用分配路由', value: `${enabledRoutes}`, sub: '旧分配页已删除' },
    { label: '启用回收规则', value: `${enabledRecycle}`, sub: '旧回收页已删除' },
    { label: '自动化流程', value: `${enabledFlows}`, sub: '流程引擎已归并' }
  ]
})

function addDistributionRoute() {
  distributionRoutes.value.push({
    source: '新来源',
    targetPool: '待配置池',
    mode: 'manual',
    team: '待指定',
    priority: 9,
    enabled: false
  })
  ElMessage.success('已新增路由规则草稿')
}

function addRecycleRule() {
  recycleRules.value.push({
    name: '新回收规则',
    scope: '待配置',
    recycleDays: 7,
    green: 4,
    yellow: 2,
    red: 1,
    targetPool: '回收公海池',
    enabled: false
  })
  ElMessage.success('已新增回收规则草稿')
}

function saveSection(tab: RuleTab) {
  if (tab === 'distribution' && weightSum.value !== 100) {
    ElMessage.warning('权重合计必须等于 100%')
    return
  }
  ElMessage.success('当前分类规则已保存')
}

function runFlow(name: string) {
  ElMessage.success(`${name} 已加入执行队列`)
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
.workflow-card p {
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
.workflow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.module-card,
.workflow-card,
.factor-row,
.policy-strip div {
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
.module-card span {
  color: #3370ff;
  font-size: 12px;
  font-weight: 700;
}
.module-card strong,
.workflow-card strong,
.factor-row strong {
  color: #1f2937;
  font-size: 14px;
  font-weight: 720;
}
.module-card em,
.module-card small,
.factor-row span,
.policy-strip em {
  color: #667085;
  font-size: 12px;
  font-style: normal;
  line-height: 1.6;
}
.factor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.factor-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
}
.factor-row span {
  display: block;
  margin-top: 3px;
}
.warning-seq {
  color: #344054;
  font-size: 13px;
}
.policy-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.policy-strip div {
  padding: 14px;
}
.policy-strip span {
  display: block;
  color: #667085;
  font-size: 12px;
}
.policy-strip b {
  display: block;
  margin: 5px 0;
  color: #111827;
  font-size: 18px;
}
.workflow-card {
  padding: 14px;
}
.workflow-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.workflow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0;
}
.workflow-steps span {
  padding: 3px 8px;
  border-radius: 999px;
  background: #eef4ff;
  color: #3370ff;
  font-size: 12px;
}
.workflow-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: #667085;
  font-size: 12px;
}
@media (max-width: 1080px) {
  .summary-grid,
  .module-grid,
  .workflow-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .factor-grid,
  .policy-strip {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 760px) {
  .rule-header,
  .section-head,
  .workflow-card footer {
    flex-direction: column;
  }
  .summary-grid,
  .module-grid,
  .workflow-grid {
    grid-template-columns: 1fr;
  }
  .factor-row {
    grid-template-columns: 1fr;
  }
}
</style>

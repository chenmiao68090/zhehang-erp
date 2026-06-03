<template>
  <div class="growth-page">
    <section class="page-head">
      <div>
        <div class="eyebrow">P1 · PROSPECT INTELLIGENCE</div>
        <h1>拓客情报</h1>
        <p>围绕财税服务场景沉淀新企、税务异常、工商异常、年报、电商合规等高价值商机。</p>
      </div>
      <div class="head-actions">
        <el-button type="primary" @click="batchCall">加入电销队列</el-button>
        <el-button @click="batchPool">加入公海</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric">
        <span>情报总量</span>
        <b>{{ summary.total }}</b>
        <em>可转线索来源</em>
      </div>
      <div class="metric">
        <span>A 级情报</span>
        <b>{{ summary.high }}</b>
        <em>优先触达</em>
      </div>
      <div class="metric">
        <span>待外呼</span>
        <b>{{ summary.queued }}</b>
        <em>已加入电销队列</em>
      </div>
      <div class="metric">
        <span>预计客单</span>
        <b>{{ money(summary.amount) }}</b>
        <em>按服务类型估算</em>
      </div>
    </section>

    <section class="ops-panel">
      <div class="scenario-tabs">
        <button
          v-for="item in scenarioTabs"
          :key="item.value"
          class="scenario"
          :class="{ active: query.type === item.value }"
          @click="changeType(item.value)"
        >
          <strong>{{ item.label }}</strong>
          <span>{{ item.desc }}</span>
        </button>
      </div>

      <div class="filters">
        <el-input v-model="query.keyword" placeholder="搜索企业/异常原因/情报标题" clearable :prefix-icon="Search" @keyup.enter="load" />
        <el-select v-model="query.level" placeholder="等级" clearable>
          <el-option label="A 级" value="A" />
          <el-option label="B 级" value="B" />
          <el-option label="C 级" value="C" />
          <el-option label="D 级" value="D" />
        </el-select>
        <el-select v-model="query.status" placeholder="状态" clearable>
          <el-option label="新情报" value="new" />
          <el-option label="已入池" value="pooled" />
          <el-option label="已入电销" value="queued" />
          <el-option label="已成商机" value="opportunity" />
          <el-option label="已提单" value="ordered" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>

      <el-table
        v-loading="loading"
        :data="rows"
        border
        stripe
        height="560"
        @selection-change="selected = $event"
      >
        <el-table-column type="selection" width="44" />
        <el-table-column label="企业与情报" min-width="300" fixed="left">
          <template #default="{ row }">
            <div class="company-line">
              <button class="link-btn" @click="openDetail(row)">{{ row.entity?.name }}</button>
              <el-tag v-if="row.level === 'A'" size="small" type="danger">HOT</el-tag>
              <el-tag size="small" effect="plain">{{ row.typeLabel }}</el-tag>
            </div>
            <div class="signal-title">{{ row.title }}</div>
            <div class="sub-line">{{ row.scenario }}</div>
          </template>
        </el-table-column>
        <el-table-column label="工商/税务摘要" min-width="260">
          <template #default="{ row }">
            <div class="kv-line"><span>原因</span><b>{{ row.reason }}</b></div>
            <div class="kv-line"><span>机关</span><b>{{ row.authority }}</b></div>
            <div class="kv-line"><span>日期</span><b>{{ row.eventDate }}</b></div>
          </template>
        </el-table-column>
        <el-table-column label="企业信息" min-width="260">
          <template #default="{ row }">
            <div class="kv-line"><span>注册资本</span><b>{{ row.entity?.registeredCapital }}</b></div>
            <div class="kv-line"><span>税务资质</span><b>{{ row.entity?.taxQualification }}</b></div>
            <div class="kv-line"><span>注册地址</span><b>{{ row.entity?.address }}</b></div>
          </template>
        </el-table-column>
        <el-table-column label="评分" width="120" align="center">
          <template #default="{ row }">
            <div class="score" :class="`level-${row.level}`">{{ row.score }}</div>
            <div class="sub-line">{{ row.level }} 级</div>
          </template>
        </el-table-column>
        <el-table-column prop="contactCount" label="联系方式" width="100" align="right" />
        <el-table-column label="预计金额" width="120" align="right">
          <template #default="{ row }">{{ money(row.estimatedAmount) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="callOne(row)">入电销</el-button>
            <el-button link type="success" @click="poolOne(row)">入公海</el-button>
            <el-button link type="warning" @click="createOrder(row)">提单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="total"
          @current-change="load"
          @size-change="load"
        />
      </div>
    </section>

    <el-drawer v-model="drawer.visible" title="情报勾稽详情" size="560px">
      <template v-if="drawer.row">
        <div class="drawer-title">
          <div>
            <h2>{{ drawer.row.entity?.name }}</h2>
            <p>{{ drawer.row.title }}</p>
          </div>
          <div class="score big" :class="`level-${drawer.row.level}`">{{ drawer.row.score }}</div>
        </div>
        <div class="timeline">
          <div><span>市场情报</span><b>{{ drawer.row.typeLabel }} · {{ drawer.row.reason }}</b></div>
          <div><span>企业主体</span><b>{{ drawer.row.entity?.creditCode }} · {{ drawer.row.entity?.legalPerson }}</b></div>
          <div><span>推荐服务</span><b>{{ serviceLabel(drawer.row.expectedService) }} · {{ money(drawer.row.estimatedAmount) }}</b></div>
          <div><span>下一环节</span><b>加入公海 / 加入电销 / 生成提单，均按 entityId 归并防撞单</b></div>
        </div>
        <div class="drawer-actions">
          <el-button type="primary" @click="callOne(drawer.row)">加入电销队列</el-button>
          <el-button type="warning" @click="createOrder(drawer.row)">生成提单</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { growthLinkageApi, marketApi, type SignalType } from '@/api/growth'

const scenarioTabs: Array<{ value: SignalType | ''; label: string; desc: string }> = [
  { value: '', label: '全部情报', desc: '跨场景统一看' },
  { value: 'new_company', label: '新企商机', desc: 'T+1 / T+7' },
  { value: 'tax_abnormal', label: '税务异常', desc: '非正常户 / 欠税' },
  { value: 'business_abnormal', label: '经营异常', desc: '异常解除' },
  { value: 'address_abnormal', label: '地址异常', desc: '挂靠/变更' },
  { value: 'ecommerce_tax', label: '电商财税', desc: '合规/开票' },
  { value: 'peer_customer', label: '同行客户', desc: '替换机会' }
]

const loading = ref(false)
const rows = ref<any[]>([])
const total = ref(0)
const selected = ref<any[]>([])
const summary = reactive({ total: 0, high: 0, queued: 0, ordered: 0, amount: 0 })
const query = reactive<{ type: SignalType | ''; keyword: string; status: any; level: string; page: number; pageSize: number }>({
  type: '',
  keyword: '',
  status: '',
  level: '',
  page: 1,
  pageSize: 10
})
const drawer = reactive<{ visible: boolean; row: any | null }>({ visible: false, row: null })

function money(n: number) {
  if (!n) return '¥0'
  return `¥${Number(n).toLocaleString('zh-CN')}`
}

function statusLabel(status: string) {
  return ({
    new: '新情报',
    pooled: '已入池',
    queued: '已入电销',
    assigned: '已分配',
    opportunity: '已成商机',
    ordered: '已提单',
    ignored: '暂不跟进'
  } as Record<string, string>)[status] || status
}

function statusTag(status: string) {
  return ({
    new: 'info',
    pooled: 'success',
    queued: 'primary',
    assigned: 'warning',
    opportunity: 'danger',
    ordered: 'success',
    ignored: 'info'
  } as Record<string, any>)[status] || 'info'
}

function serviceLabel(type: string) {
  return ({
    bookkeeping: '代理记账',
    registration: '工商注册',
    tax_planning: '税务服务',
    qualification: '工商/资质',
    audit: '审计服务',
    cancellation: '注销清算',
    other: '综合财税'
  } as Record<string, string>)[type] || '综合财税'
}

function changeType(type: SignalType | '') {
  query.type = type
  query.page = 1
  load()
}

function openDetail(row: any) {
  drawer.row = row
  drawer.visible = true
}

async function load() {
  loading.value = true
  try {
    const [page, stat] = await Promise.all([
      marketApi.list(query),
      marketApi.summary()
    ])
    rows.value = page.list
    total.value = page.total
    Object.assign(summary, stat)
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(query, { type: '', keyword: '', status: '', level: '', page: 1, pageSize: 10 })
  load()
}

async function batchPool() {
  const ids = selected.value.map(row => row.id)
  if (!ids.length) return ElMessage.warning('请先选择情报')
  const res = await marketApi.addToPool(ids)
  ElMessage.success(`已加入公海 ${res.created} 条`)
  load()
}

async function batchCall() {
  const ids = selected.value.map(row => row.id)
  if (!ids.length) return ElMessage.warning('请先选择情报')
  const res = await marketApi.addToCallQueue(ids)
  ElMessage.success(`已加入电销队列 ${res.created} 条`)
  load()
}

async function poolOne(row: any) {
  const res = await marketApi.addToPool([row.id])
  ElMessage.success(`已加入公海 ${res.created} 条`)
  load()
}

async function callOne(row: any) {
  const res = await marketApi.addToCallQueue([row.id])
  ElMessage.success(`已加入电销队列 ${res.created} 条`)
  load()
}

async function createOrder(row: any) {
  const order = await growthLinkageApi.createOrderFromSignal(row.id)
  ElMessage.success(`已生成提单 ${order.orderNo}`)
  drawer.visible = false
  load()
}

onMounted(load)
</script>

<style scoped lang="scss">
.growth-page {
  padding: 20px;
  color: #1f2937;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}
.eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}
h1 {
  margin: 6px 0;
  font-size: 26px;
}
p {
  margin: 0;
  color: #64748b;
}
.head-actions {
  display: flex;
  gap: 10px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.metric,
.ops-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.metric {
  padding: 14px 16px;
}
.metric span,
.metric em {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}
.metric b {
  display: block;
  margin: 6px 0;
  font-size: 26px;
}
.ops-panel {
  padding: 14px;
}
.scenario-tabs {
  display: grid;
  grid-template-columns: repeat(7, minmax(110px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.scenario {
  text-align: left;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}
.scenario strong,
.scenario span {
  display: block;
}
.scenario span {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.scenario.active {
  border-color: #2563eb;
  background: #eff6ff;
  color: #1d4ed8;
}
.filters {
  display: grid;
  grid-template-columns: 1fr 130px 150px auto auto;
  gap: 10px;
  margin-bottom: 12px;
}
.company-line {
  display: flex;
  align-items: center;
  gap: 6px;
}
.link-btn {
  border: 0;
  padding: 0;
  background: transparent;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
}
.signal-title {
  margin-top: 6px;
  font-weight: 600;
}
.sub-line {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.kv-line {
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 8px;
  margin: 2px 0;
  font-size: 13px;
}
.kv-line span {
  color: #94a3b8;
}
.kv-line b {
  font-weight: 500;
}
.score {
  display: inline-grid;
  place-items: center;
  min-width: 44px;
  height: 28px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
  font-weight: 800;
}
.score.big {
  min-width: 58px;
  height: 40px;
}
.score.level-A {
  background: #fee2e2;
  color: #b91c1c;
}
.score.level-B {
  background: #fef3c7;
  color: #b45309;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
.drawer-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.drawer-title h2 {
  margin: 0 0 6px;
  font-size: 20px;
}
.timeline {
  display: grid;
  gap: 10px;
}
.timeline div {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}
.timeline span {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
}
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
@media (max-width: 1100px) {
  .metric-grid,
  .scenario-tabs {
    grid-template-columns: repeat(2, 1fr);
  }
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>

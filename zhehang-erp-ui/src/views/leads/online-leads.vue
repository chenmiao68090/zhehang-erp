<template>
  <div class="growth-page">
    <section class="page-head">
      <div>
        <div class="eyebrow">P3 · ONLINE ACQUISITION</div>
        <h1>网销线索</h1>
        <p>承接官网表单、企微、抖音、小红书、百度推广和老客转介绍，统一清洗、查重、转电销和提单。</p>
      </div>
      <div class="head-actions">
        <el-input v-model="query.keyword" placeholder="搜索公司/需求/电话" clearable :prefix-icon="Search" @keyup.enter="load" />
        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric"><span>网销线索</span><b>{{ summary.total }}</b><em>本地渠道汇总</em></div>
      <div class="metric"><span>有效线索</span><b>{{ summary.qualified }}</b><em>已完成清洗</em></div>
      <div class="metric"><span>转电销</span><b>{{ summary.queued }}</b><em>已进入外呼</em></div>
      <div class="metric"><span>已提单</span><b>{{ summary.ordered }}</b><em>进入订单链路</em></div>
    </section>

    <section class="intake-panel">
      <div class="intake-main">
        <div class="panel-title">
          <div>
            <h2>网销线索快速入库</h2>
            <p>模拟官网/抖音/企微表单：输入公司名称先自动核验工商主体，再入库并挂接 entityId。</p>
          </div>
          <el-tag type="success" effect="plain">公司名自动带出</el-tag>
        </div>
        <div class="intake-form">
          <el-autocomplete
            v-model="leadForm.companyName"
            :fetch-suggestions="queryEnterprise"
            value-key="name"
            placeholder="公司名称"
            clearable
            @select="selectLeadEntity"
            @keyup.enter="resolveLeadCompany"
          />
          <el-select v-model="leadForm.channel" placeholder="渠道">
            <el-option label="官网表单" value="官网表单" />
            <el-option label="企微" value="企微" />
            <el-option label="抖音" value="抖音" />
            <el-option label="小红书" value="小红书" />
            <el-option label="百度推广" value="百度推广" />
            <el-option label="老客转介绍" value="老客转介绍" />
          </el-select>
          <el-input v-model="leadForm.contactName" placeholder="联系人" />
          <el-input v-model="leadForm.phone" placeholder="联系电话" />
          <el-input v-model="leadForm.landingPage" placeholder="落地页" />
          <el-input-number v-model="leadForm.cost" :min="0" :precision="0" controls-position="right" placeholder="成本" style="width: 100%" />
          <el-input v-model="leadForm.demand" class="demand-input" placeholder="客户需求，例如：新公司税务报到、代理记账、工商异常解除" />
          <div class="intake-actions">
            <el-button :icon="Search" :loading="resolveLoading" @click="resolveLeadCompany">工商核验</el-button>
            <el-button type="primary" :loading="createLoading" @click="createLead">入库线索</el-button>
          </div>
        </div>
      </div>
      <div class="intake-side">
        <div v-if="leadResolve?.entity" class="verify-card">
          <div class="verify-head">
            <b>{{ leadResolve.entity.name }}</b>
            <el-tag :type="leadResolve.duplicateRisk === 'hit' ? 'danger' : leadResolve.duplicateRisk === 'possible' ? 'warning' : 'success'" size="small">
              {{ duplicateRiskText(leadResolve.duplicateRisk) }}
            </el-tag>
          </div>
          <p>{{ leadResolve.entity.creditCode }}</p>
          <div class="verify-grid">
            <span>法人 <b>{{ leadResolve.entity.legalPerson }}</b></span>
            <span>税务资质 <b>{{ leadResolve.entity.taxQualification }}</b></span>
            <span>联系方式 <b>{{ leadResolve.entity.contactCount }}</b></span>
            <span>置信度 <b>{{ leadResolve.confidence }}%</b></span>
          </div>
          <div class="verify-tags">
            <el-tag v-for="tag in leadResolve.entity.riskTags" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
          </div>
        </div>
        <div v-else class="verify-empty">
          <b>待工商核验</b>
          <span>命中主体后会显示统一社会信用代码、法人、税务资质、查重风险和推荐服务。</span>
        </div>
      </div>
    </section>

    <section class="channel-grid">
      <div v-for="c in summary.channels" :key="c.channel" class="channel-card" :class="{ active: query.channel === c.channel }" @click="selectChannel(c.channel)">
        <div>
          <b>{{ c.channel }}</b>
          <span>{{ c.leads }} 条 · 有效 {{ c.qualified }} 条</span>
        </div>
        <strong>{{ c.cost ? `¥${c.cost}` : '自然流量' }}</strong>
        <em>均分 {{ c.avgScore }}</em>
      </div>
    </section>

    <section class="ops-panel">
      <div class="filters">
        <el-select v-model="query.channel" placeholder="渠道" clearable>
          <el-option label="官网表单" value="官网表单" />
          <el-option label="企微" value="企微" />
          <el-option label="抖音" value="抖音" />
          <el-option label="小红书" value="小红书" />
          <el-option label="百度推广" value="百度推广" />
          <el-option label="老客转介绍" value="老客转介绍" />
        </el-select>
        <el-select v-model="query.status" placeholder="状态" clearable>
          <el-option label="新线索" value="new" />
          <el-option label="有效" value="qualified" />
          <el-option label="已转电销" value="queued" />
          <el-option label="已提单" value="ordered" />
          <el-option label="流失" value="lost" />
        </el-select>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="rows" stripe border height="560">
        <el-table-column label="线索信息" min-width="280" fixed="left">
          <template #default="{ row }">
            <button class="link-btn">{{ row.companyName }}</button>
            <div class="sub-line">{{ row.contactName }} · {{ row.phone }}</div>
          </template>
        </el-table-column>
        <el-table-column label="渠道" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.channel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="landingPage" label="落地页" min-width="170" />
        <el-table-column prop="demand" label="客户需求" min-width="260" />
        <el-table-column prop="utmCampaign" label="活动" width="160" />
        <el-table-column label="成本" width="90" align="right">
          <template #default="{ row }">{{ row.cost ? `¥${row.cost}` : '-' }}</template>
        </el-table-column>
        <el-table-column label="评分" width="90" align="center">
          <template #default="{ row }">
            <b :class="row.score >= 85 ? 'score-hot' : 'score'">{{ row.score }}</b>
          </template>
        </el-table-column>
        <el-table-column label="查重" width="110">
          <template #default="{ row }">
            <el-tag :type="riskTag(row.duplicateRisk)" size="small">{{ riskText(row.duplicateRisk) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="qualify(row)">清洗有效</el-button>
            <el-button link type="success" @click="toCall(row)">转电销</el-button>
            <el-button link type="warning" @click="createOrder(row)">提单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          layout="total, prev, pager, next"
          :total="total"
          @current-change="load"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import {
  enterpriseApi,
  growthLinkageApi,
  onlineLeadApi,
  type CompanyResolveResult,
  type EnterpriseEntity,
  type OnlineLead,
  type OnlineLeadCreatePayload
} from '@/api/growth'

const loading = ref(false)
const resolveLoading = ref(false)
const createLoading = ref(false)
const rows = ref<OnlineLead[]>([])
const total = ref(0)
const summary = reactive<any>({ total: 0, qualified: 0, queued: 0, ordered: 0, channels: [] })
const query = reactive({ keyword: '', channel: '', status: '', page: 1, pageSize: 10 })
const leadForm = reactive<OnlineLeadCreatePayload>({
  companyName: '浙江两杉生物科技有限公司',
  channel: '官网表单',
  landingPage: '新公司财税套餐',
  contactName: '周总',
  phone: '18600008888',
  demand: '新注册公司，需要税务报到、代理记账和银行三方协议',
  utmCampaign: 'manual-intake',
  cost: 0
})
const leadResolve = ref<CompanyResolveResult | null>(null)

function statusText(status: string) {
  return ({ new: '新线索', qualified: '有效', pooled: '已入池', queued: '已转电销', ordered: '已提单', lost: '流失' } as Record<string, string>)[status] || status
}
function statusTag(status: string) {
  return ({ new: 'info', qualified: 'primary', pooled: 'success', queued: 'warning', ordered: 'success', lost: 'info' } as Record<string, any>)[status] || 'info'
}
function riskText(risk: string) {
  return ({ none: '无重复', possible: '疑似重复', hit: '强命中' } as Record<string, string>)[risk] || risk
}
function riskTag(risk: string) {
  return ({ none: 'success', possible: 'warning', hit: 'danger' } as Record<string, any>)[risk] || 'info'
}
function duplicateRiskText(risk: CompanyResolveResult['duplicateRisk']) {
  return risk === 'hit' ? '已有关联' : risk === 'possible' ? '疑似重复' : '未重复'
}

async function queryEnterprise(keyword: string, cb: (rows: EnterpriseEntity[]) => void) {
  cb(await enterpriseApi.search(keyword))
}

function selectLeadEntity(row: EnterpriseEntity) {
  leadForm.companyName = row.name
  if (!leadForm.contactName) leadForm.contactName = row.contacts[0]?.name || ''
  if (!leadForm.phone) leadForm.phone = row.contacts[0]?.phone || ''
  resolveLeadCompany()
}

async function resolveLeadCompany() {
  if (!leadForm.companyName.trim()) {
    ElMessage.warning('请输入公司名称')
    return
  }
  resolveLoading.value = true
  try {
    leadResolve.value = await enterpriseApi.resolveCompany(leadForm.companyName)
    if (leadResolve.value.entity) {
      if (!leadForm.contactName) leadForm.contactName = leadResolve.value.entity.contacts[0]?.name || ''
      if (!leadForm.phone) leadForm.phone = leadResolve.value.entity.contacts[0]?.phone || ''
    }
  } finally {
    resolveLoading.value = false
  }
}

async function load() {
  loading.value = true
  try {
    const [page, stat] = await Promise.all([
      onlineLeadApi.list(query),
      onlineLeadApi.summary()
    ])
    rows.value = page.list
    total.value = page.total
    Object.assign(summary, stat)
  } finally {
    loading.value = false
  }
}

function selectChannel(channel: string) {
  query.channel = query.channel === channel ? '' : channel
  query.page = 1
  load()
}

function reset() {
  Object.assign(query, { keyword: '', channel: '', status: '', page: 1, pageSize: 10 })
  load()
}

async function qualify(row: OnlineLead) {
  await onlineLeadApi.qualify(row.id)
  ElMessage.success('已标记为有效线索')
  load()
}

async function toCall(row: OnlineLead) {
  await onlineLeadApi.addToCallQueue(row.id)
  ElMessage.success('已转入电销工作台')
  load()
}

async function createOrder(row: OnlineLead) {
  const order = await growthLinkageApi.createOrderFromOnlineLead(row.id)
  ElMessage.success(`已生成提单 ${order.orderNo}`)
  load()
}

async function createLead() {
  if (!leadForm.companyName.trim()) {
    ElMessage.warning('请输入公司名称')
    return
  }
  createLoading.value = true
  try {
    const result = await onlineLeadApi.create({ ...leadForm })
    ElMessage.success(`线索已入库：评分 ${result.lead.score}，查重 ${riskText(result.lead.duplicateRisk)}`)
    query.keyword = result.lead.companyName
    query.page = 1
    await load()
    leadResolve.value = await enterpriseApi.resolveCompany(result.lead.companyName)
  } finally {
    createLoading.value = false
  }
}

onMounted(async () => {
  await load()
  await resolveLeadCompany()
})
</script>

<style scoped lang="scss">
.growth-page {
  padding: 20px;
  color: #1f2937;
}
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
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
  display: grid;
  grid-template-columns: 280px auto;
  gap: 10px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.metric,
.channel-card,
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
.intake-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, .55fr);
  gap: 12px;
  margin-bottom: 14px;
}
.intake-main,
.intake-side {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
}
.panel-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.panel-title h2 {
  margin: 0 0 6px;
  font-size: 18px;
}
.panel-title p {
  font-size: 13px;
}
.intake-form {
  display: grid;
  grid-template-columns: minmax(240px, 1.2fr) 150px 120px 150px 180px 120px;
  gap: 10px;
  align-items: center;
}
.demand-input {
  grid-column: 1 / span 4;
}
.intake-actions {
  grid-column: 5 / span 2;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.verify-card {
  display: grid;
  gap: 10px;
}
.verify-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.verify-head b {
  color: #111827;
  font-size: 15px;
}
.verify-card p {
  font-size: 12px;
}
.verify-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}
.verify-grid span {
  display: grid;
  gap: 5px;
  padding: 9px;
  border: 1px solid #eef2f7;
  border-radius: 8px;
  color: #64748b;
  font-size: 12px;
}
.verify-grid b {
  color: #111827;
  font-size: 13px;
}
.verify-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.verify-empty {
  display: grid;
  place-items: center;
  min-height: 180px;
  padding: 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  text-align: center;
  color: #64748b;
}
.verify-empty b {
  color: #111827;
}
.verify-empty span {
  font-size: 13px;
  line-height: 1.6;
}
.channel-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.channel-card {
  padding: 12px;
  cursor: pointer;
}
.channel-card.active {
  border-color: #2563eb;
  background: #eff6ff;
}
.channel-card b,
.channel-card span,
.channel-card strong,
.channel-card em {
  display: block;
}
.channel-card span,
.channel-card em {
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}
.channel-card strong {
  margin: 8px 0 4px;
  font-size: 18px;
}
.ops-panel {
  padding: 14px;
}
.filters {
  display: grid;
  grid-template-columns: 150px 150px auto;
  gap: 10px;
  margin-bottom: 12px;
}
.link-btn {
  border: 0;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
}
.sub-line {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.score,
.score-hot {
  display: inline-grid;
  place-items: center;
  min-width: 42px;
  height: 26px;
  border-radius: 999px;
  background: #eef2ff;
  color: #4338ca;
}
.score-hot {
  background: #fee2e2;
  color: #b91c1c;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
@media (max-width: 1100px) {
  .page-head,
  .head-actions {
    display: block;
  }
  .metric-grid,
  .channel-grid,
  .intake-panel {
    grid-template-columns: repeat(2, 1fr);
  }
  .intake-panel {
    grid-template-columns: 1fr;
  }
  .intake-form,
  .filters {
    grid-template-columns: 1fr;
  }
  .demand-input,
  .intake-actions {
    grid-column: auto;
  }
  .intake-actions {
    justify-content: flex-start;
  }
}
</style>

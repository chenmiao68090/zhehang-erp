<template>
  <div class="growth-page">
    <section class="page-head">
      <div>
        <div class="eyebrow">P0 · ENTERPRISE MASTER</div>
        <h1>企业主体库</h1>
        <p>公司名称、统一社会信用代码、工商税务信息统一归档，作为线索、客户、订单、发票和任务的主数据根。</p>
      </div>
      <div class="head-actions">
        <el-autocomplete
          v-model="quickKeyword"
          :fetch-suggestions="querySearch"
          value-key="name"
          placeholder="输入公司名称自动联想"
          clearable
          class="quick-search"
          @select="openEntity"
        />
        <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric">
        <span>主体总数</span>
        <b>{{ stats.total }}</b>
        <em>统一 entityId 勾稽</em>
      </div>
      <div class="metric">
        <span>风险主体</span>
        <b>{{ stats.risky }}</b>
        <em>工商/税务异常</em>
      </div>
      <div class="metric">
        <span>新企商机</span>
        <b>{{ stats.newCompany }}</b>
        <em>T+1 / T+7 重点</em>
      </div>
      <div class="metric">
        <span>联系方式充足</span>
        <b>{{ stats.contactRich }}</b>
        <em>适合电销触达</em>
      </div>
    </section>

    <section class="resolve-panel">
      <div class="resolve-left">
        <div class="section-title">
          <div>
            <h2>公司名称自动带出工商信息</h2>
            <p>录入公司名称后，自动匹配主体库，带出工商税务信息、查重风险、服务建议和后续链路。</p>
          </div>
          <el-tag type="primary" effect="plain">entityId 勾稽</el-tag>
        </div>
        <div class="resolve-form">
          <el-autocomplete
            v-model="resolveForm.companyName"
            :fetch-suggestions="querySearch"
            value-key="name"
            placeholder="例如：浙江两杉生物科技有限公司"
            clearable
            @select="selectResolvedEntity"
            @keyup.enter="resolveCompany"
          />
          <el-button type="primary" :icon="Search" :loading="resolveLoading" @click="resolveCompany">自动带出</el-button>
          <el-button :disabled="!resolveResult?.entity" @click="createResolvedCustomer">生成客户</el-button>
        </div>
        <div v-if="resolveResult && !resolveResult.matched" class="resolve-empty">
          <b>未命中主体库</b>
          <span v-for="action in resolveResult.nextActions" :key="action">{{ action }}</span>
        </div>
        <div v-else-if="resolveResult?.entity" class="resolved-card">
          <div class="resolved-head">
            <div class="avatar">{{ resolveResult.entity.shortName.slice(0, 2) }}</div>
            <div>
              <h3>{{ resolveResult.entity.name }}</h3>
              <p>{{ resolveResult.entity.creditCode }} · {{ resolveResult.source }} · 置信度 {{ resolveResult.confidence }}%</p>
            </div>
            <el-tag :type="resolveResult.duplicateRisk === 'hit' ? 'danger' : resolveResult.duplicateRisk === 'possible' ? 'warning' : 'success'" effect="plain">
              {{ duplicateRiskText(resolveResult.duplicateRisk) }}
            </el-tag>
          </div>
          <div class="resolved-info">
            <div><span>法人</span><b>{{ resolveResult.entity.legalPerson }}</b></div>
            <div><span>注册资本</span><b>{{ resolveResult.entity.registeredCapital }}</b></div>
            <div><span>成立日期</span><b>{{ resolveResult.entity.establishDate }}</b></div>
            <div><span>税务资质</span><b>{{ resolveResult.entity.taxQualification }}</b></div>
            <div class="wide"><span>注册地址</span><b>{{ resolveResult.entity.address }}</b></div>
          </div>
          <div class="tag-list compact">
            <el-tag v-for="tag in resolveResult.entity.riskTags" :key="tag" type="warning" effect="plain">{{ tag }}</el-tag>
          </div>
        </div>
      </div>

      <div class="resolve-right">
        <div class="mini-block">
          <div class="mini-title">推荐服务</div>
          <div v-if="!resolveResult?.suggestions.length" class="muted-tip">命中企业后自动生成。</div>
          <div v-for="item in resolveResult?.suggestions || []" :key="item.service" class="suggestion-item">
            <div>
              <b>{{ item.service }}</b>
              <p>{{ item.reason }}</p>
            </div>
            <div class="suggestion-side">
              <el-tag :type="item.priority === '高' ? 'danger' : item.priority === '中' ? 'warning' : 'info'" size="small">{{ item.priority }}</el-tag>
              <span>{{ item.amount ? `¥${formatMoney(item.amount)}` : '动作' }}</span>
            </div>
          </div>
        </div>
        <div class="mini-block">
          <div class="mini-title">勾稽关系</div>
          <div class="linkage-grid">
            <div v-for="item in linkageCards" :key="item.label" class="linkage-card" :class="{ warn: item.warn }">
              <span>{{ item.label }}</span>
              <b>{{ item.value }}</b>
              <em>{{ item.desc }}</em>
            </div>
          </div>
          <div v-if="resolveResult?.nextActions.length" class="next-actions">
            <span v-for="action in resolveResult.nextActions" :key="action">{{ action }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="ops-panel">
      <div class="filters">
        <el-input v-model="query.keyword" placeholder="公司 / 法人 / 信用代码" clearable :prefix-icon="Search" />
        <el-select v-model="query.region" placeholder="区域" clearable>
          <el-option label="杭州市" value="杭州市" />
          <el-option label="宁波市" value="宁波市" />
          <el-option label="大连市" value="大连市" />
        </el-select>
        <el-select v-model="query.risk" placeholder="风险/标签" clearable>
          <el-option label="税务异常" value="税务" />
          <el-option label="地址异常" value="地址" />
          <el-option label="新企" value="新企" />
          <el-option label="电商" value="电商" />
        </el-select>
        <el-button :icon="Refresh" @click="reset">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="rows" stripe border height="560">
        <el-table-column prop="name" label="企业名称" min-width="240" fixed="left">
          <template #default="{ row }">
            <button class="link-btn" @click="openEntity(row)">{{ row.name }}</button>
            <div class="sub-line">{{ row.creditCode }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="legalPerson" label="法人" width="100" />
        <el-table-column prop="registeredCapital" label="注册资本" width="130" />
        <el-table-column prop="establishDate" label="成立日期" width="120" />
        <el-table-column prop="businessStatus" label="状态" width="92">
          <template #default="{ row }">
            <el-tag :type="row.businessStatus === '异常' ? 'danger' : row.businessStatus === '注销' ? 'info' : 'success'" size="small">
              {{ row.businessStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="industry" label="行业" min-width="180" />
        <el-table-column prop="taxQualification" label="税务资质" width="150" />
        <el-table-column prop="contactCount" label="联系方式" width="100" align="right" />
        <el-table-column label="风险标签" min-width="210">
          <template #default="{ row }">
            <el-tag v-for="tag in row.riskTags" :key="tag" size="small" class="tag-gap" effect="plain">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEntity(row)">详情</el-button>
            <el-button link type="success" @click="createCustomer(row)">生成客户</el-button>
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

    <el-drawer v-model="drawer.visible" title="企业工商税务档案" size="560px">
      <template v-if="drawer.entity">
        <div class="drawer-title">
          <div class="avatar">{{ drawer.entity.shortName.slice(0, 2) }}</div>
          <div>
            <h2>{{ drawer.entity.name }}</h2>
            <p>{{ drawer.entity.creditCode }}</p>
          </div>
        </div>
        <div class="detail-grid">
          <div><span>法人</span><b>{{ drawer.entity.legalPerson }}</b></div>
          <div><span>注册资本</span><b>{{ drawer.entity.registeredCapital }}</b></div>
          <div><span>成立日期</span><b>{{ drawer.entity.establishDate }}</b></div>
          <div><span>经营状态</span><b>{{ drawer.entity.businessStatus }}</b></div>
          <div><span>税号</span><b>{{ drawer.entity.taxNo }}</b></div>
          <div><span>税务资质</span><b>{{ drawer.entity.taxQualification }}</b></div>
          <div class="wide"><span>注册地址</span><b>{{ drawer.entity.address }}</b></div>
          <div class="wide"><span>所属行业</span><b>{{ drawer.entity.industry }}</b></div>
        </div>
        <div class="block-title">联系方式</div>
        <el-table :data="drawer.entity.contacts" size="small" border>
          <el-table-column prop="name" label="联系人" width="100" />
          <el-table-column prop="title" label="职务" width="110" />
          <el-table-column prop="phone" label="电话" />
        </el-table>
        <div class="block-title">风险与商机标签</div>
        <div class="tag-list">
          <el-tag v-for="tag in drawer.entity.riskTags" :key="tag" type="warning" effect="plain">
            {{ tag }}
          </el-tag>
        </div>
        <TaxProfilePanel :credit-code="drawer.entity.creditCode" :company-name="drawer.entity.name" />
        <div class="drawer-actions">
          <el-button type="primary" @click="createCustomer(drawer.entity)">生成客户主数据</el-button>
          <el-button @click="drawer.visible = false">关闭</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { enterpriseApi, type CompanyResolveResult, type EnterpriseEntity } from '@/api/growth'
import TaxProfilePanel from '@/components/TaxProfilePanel.vue'

const quickKeyword = ref('')
const loading = ref(false)
const resolveLoading = ref(false)
const rows = ref<EnterpriseEntity[]>([])
const total = ref(0)
const stats = reactive({ total: 0, risky: 0, newCompany: 0, contactRich: 0 })
const query = reactive({ keyword: '', region: '', risk: '', page: 1, pageSize: 10 })
const drawer = reactive<{ visible: boolean; entity: EnterpriseEntity | null }>({ visible: false, entity: null })
const resolveForm = reactive({ companyName: '浙江两杉生物科技有限公司' })
const resolveResult = ref<CompanyResolveResult | null>(null)

const linkageCards = computed(() => {
  const l = resolveResult.value?.linkage
  return [
    { label: '拓客情报', value: l?.signals.count || 0, desc: `未闭环 ${l?.signals.open || 0}`, warn: Boolean(l?.signals.open) },
    { label: '网销线索', value: l?.onlineLeads.count || 0, desc: `有效 ${l?.onlineLeads.qualified || 0}`, warn: false },
    { label: '客户主数据', value: l?.customers.count || 0, desc: l?.customers.count ? '已建档' : '未建档', warn: !l?.customers.count },
    { label: '订单', value: l?.orders.count || 0, desc: `¥${formatMoney(l?.orders.amount || 0)}`, warn: false },
    { label: '任务', value: l?.tasks.count || 0, desc: `逾期 ${l?.tasks.overdue || 0}`, warn: Boolean(l?.tasks.overdue) },
    { label: '回款', value: l?.receipts.count || 0, desc: `待收 ¥${formatMoney(l?.receipts.pendingAmount || 0)}`, warn: Boolean(l?.receipts.pendingAmount) }
  ]
})

async function querySearch(keyword: string, cb: (rows: EnterpriseEntity[]) => void) {
  const list = await enterpriseApi.search(keyword)
  cb(list)
}

function formatMoney(amount: number) {
  return Number(amount || 0).toLocaleString('zh-CN')
}

function duplicateRiskText(risk: CompanyResolveResult['duplicateRisk']) {
  return risk === 'hit' ? '已有关联客户/订单' : risk === 'possible' ? '疑似已有线索' : '未发现重复'
}

function selectResolvedEntity(row: EnterpriseEntity) {
  resolveForm.companyName = row.name
  resolveCompany()
}

async function resolveCompany() {
  if (!resolveForm.companyName.trim()) {
    ElMessage.warning('请输入公司名称或统一社会信用代码')
    return
  }
  resolveLoading.value = true
  try {
    resolveResult.value = await enterpriseApi.resolveCompany(resolveForm.companyName)
    if (resolveResult.value.entity) {
      query.keyword = resolveResult.value.entity.name
      query.page = 1
      await load()
    } else {
      ElMessage.warning('主体库未命中，建议先保存为待核验线索')
    }
  } finally {
    resolveLoading.value = false
  }
}

function openEntity(row: EnterpriseEntity) {
  drawer.entity = row
  drawer.visible = true
}

async function createCustomer(row: EnterpriseEntity) {
  const customer = await enterpriseApi.createCustomer(row.id)
  ElMessage.success(`已生成客户主数据：${customer.name || row.name}`)
  if (resolveResult.value?.entity?.id === row.id) {
    resolveResult.value = await enterpriseApi.resolveCompany(row.name)
  }
  load()
}

async function createResolvedCustomer() {
  if (!resolveResult.value?.entity) return
  await createCustomer(resolveResult.value.entity)
}

async function load() {
  loading.value = true
  try {
    const [page, stat] = await Promise.all([
      enterpriseApi.list(query),
      enterpriseApi.stats()
    ])
    rows.value = page.list
    total.value = page.total
    Object.assign(stats, stat)
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  if (quickKeyword.value && !query.keyword) query.keyword = quickKeyword.value
  query.page = 1
  load()
}

function reset() {
  Object.assign(query, { keyword: '', region: '', risk: '', page: 1, pageSize: 10 })
  quickKeyword.value = ''
  load()
}

onMounted(async () => {
  await load()
  await resolveCompany()
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
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .04em;
  color: #2563eb;
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
.quick-search {
  width: 320px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.metric {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
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
  font-size: 28px;
}
.resolve-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(360px, .75fr);
  gap: 14px;
  margin-bottom: 14px;
}
.resolve-left,
.resolve-right,
.mini-block {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.resolve-left {
  padding: 16px;
}
.resolve-right {
  display: grid;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
}
.section-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.section-title h2 {
  margin: 0 0 6px;
  font-size: 18px;
}
.section-title p {
  font-size: 13px;
}
.resolve-form {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto auto;
  gap: 10px;
  margin-bottom: 14px;
}
.resolve-empty {
  display: grid;
  gap: 8px;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}
.resolve-empty b {
  color: #1f2937;
}
.resolved-card {
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
  padding: 14px;
}
.resolved-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.resolved-head h3 {
  margin: 0 0 4px;
  font-size: 18px;
}
.resolved-head p {
  font-size: 12px;
}
.resolved-head .el-tag {
  margin-left: auto;
}
.resolved-info {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.resolved-info div {
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.resolved-info .wide {
  grid-column: 1 / -1;
}
.resolved-info span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}
.resolved-info b {
  font-size: 13px;
  line-height: 1.5;
}
.compact {
  margin-top: 12px;
}
.mini-block {
  padding: 12px;
}
.mini-title {
  margin-bottom: 10px;
  color: #111827;
  font-size: 14px;
  font-weight: 800;
}
.muted-tip {
  padding: 14px;
  color: #94a3b8;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
}
.suggestion-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #eef2f7;
}
.suggestion-item:last-child {
  border-bottom: 0;
}
.suggestion-item b {
  color: #111827;
  font-size: 14px;
}
.suggestion-item p {
  margin-top: 5px;
  font-size: 12px;
  line-height: 1.55;
}
.suggestion-side {
  display: grid;
  justify-items: end;
  gap: 6px;
  color: #2563eb;
  font-weight: 800;
  white-space: nowrap;
}
.linkage-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.linkage-card {
  min-height: 72px;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}
.linkage-card.warn {
  border-color: #fed7aa;
  background: #fff7ed;
}
.linkage-card span,
.linkage-card em {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}
.linkage-card b {
  display: block;
  margin: 5px 0;
  color: #111827;
  font-size: 20px;
}
.next-actions {
  display: grid;
  gap: 6px;
  margin-top: 12px;
}
.next-actions span {
  padding-left: 10px;
  border-left: 3px solid #2563eb;
  color: #475569;
  font-size: 12px;
  line-height: 1.5;
}
.ops-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px;
}
.filters {
  display: grid;
  grid-template-columns: 1fr 160px 160px auto;
  gap: 10px;
  margin-bottom: 12px;
}
.link-btn {
  border: 0;
  padding: 0;
  color: #2563eb;
  background: transparent;
  font-weight: 600;
  cursor: pointer;
}
.sub-line {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
}
.tag-gap {
  margin-right: 6px;
  margin-bottom: 4px;
}
.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
.drawer-title {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 18px;
}
.drawer-title h2 {
  margin: 0 0 4px;
  font-size: 20px;
}
.drawer-title p {
  font-size: 13px;
}
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: #eff6ff;
  color: #2563eb;
  font-weight: 800;
}
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.detail-grid div {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 10px;
}
.detail-grid .wide {
  grid-column: 1 / -1;
}
.detail-grid span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 6px;
}
.detail-grid b {
  font-size: 14px;
}
.block-title {
  margin: 18px 0 10px;
  font-weight: 700;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}
@media (max-width: 960px) {
  .page-head,
  .head-actions {
    display: block;
  }
  .quick-search {
    width: 100%;
    margin: 12px 0 8px;
  }
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .resolve-panel {
    grid-template-columns: 1fr;
  }
  .resolve-form,
  .filters {
    grid-template-columns: 1fr;
  }
  .resolved-info,
  .linkage-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

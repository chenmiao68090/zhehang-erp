<template>
  <div class="page-container campaign-page">
    <header class="campaign-head">
      <div>
        <h2>营销活动 · 获客 ROI</h2>
        <p>把网销投放、线索数量、点击转化和获客成本放到一张表里,给预算调整一个清楚依据。</p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
        <el-button @click="router.push('/leads/online-roi')">网销投产比</el-button>
        <el-button type="primary" :icon="Plus" @click="openAdd">新增活动</el-button>
      </div>
    </header>

    <section class="kpi-grid">
      <div class="kpi-card">
        <span>总投放花费</span>
        <strong>¥{{ fmt(summary.actualCost) }}</strong>
        <small>预算使用 {{ summary.budgetUsage }}%</small>
      </div>
      <div class="kpi-card">
        <span>累计线索</span>
        <strong>{{ fmtInt(summary.leads) }}</strong>
        <small>平均转线索率 {{ summary.leadRate }}%</small>
      </div>
      <div class="kpi-card">
        <span>平均 CAC</span>
        <strong :class="cacClass(summary.avgCac)">¥{{ fmt(summary.avgCac) }}</strong>
        <small>{{ cacLabel(summary.avgCac) }}</small>
      </div>
      <div class="kpi-card">
        <span>最佳活动</span>
        <strong class="best-name">{{ bestCampaign?.campaignName || '暂无' }}</strong>
        <small>{{ bestCampaign ? `CAC ¥${fmt(bestCampaign.cac)}` : '录入活动后生成' }}</small>
      </div>
    </section>

    <section class="efficiency-row">
      <div v-for="item in efficiencyCards" :key="item.key" class="eff-card" :class="item.key">
        <span>{{ item.label }}</span>
        <strong>{{ item.count }}</strong>
      </div>
    </section>

    <section class="campaign-shell">
      <div class="toolbar">
        <div>
          <h3>活动清单</h3>
          <p>共 {{ filteredList.length }} 个活动,优先处理 CAC 偏高和预算超支的投放。</p>
        </div>
        <div class="filters">
          <el-input v-model="filters.keyword" placeholder="搜索活动/渠道" clearable @keyup.enter="loadAll" @clear="loadAll">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select v-model="filters.channel" placeholder="渠道" clearable @change="loadAll">
            <el-option v-for="c in CHANNELS" :key="c" :label="c" :value="c" />
          </el-select>
          <el-select v-model="filters.status" placeholder="状态" clearable @change="loadAll">
            <el-option :value="1" label="进行中" />
            <el-option :value="2" label="已结束" />
          </el-select>
        </div>
      </div>

      <div class="campaign-cards">
        <article v-for="r in topCards" :key="r.id" class="campaign-card" :class="r.efficiency">
          <div class="cc-top">
            <div>
              <h4>{{ r.campaignName }}</h4>
              <span>{{ r.channel || '未设置渠道' }}</span>
            </div>
            <el-tag size="small" effect="plain" :type="efficiencyTag(r.efficiency)">
              {{ efficiencyText(r.efficiency) }}
            </el-tag>
          </div>
          <div class="cc-metrics">
            <div><span>花费</span><b>¥{{ fmt(r.actualCost) }}</b></div>
            <div><span>线索</span><b>{{ fmtInt(r.leadsCount) }}</b></div>
            <div><span>CAC</span><b :class="cacClass(r.cac)">¥{{ fmt(r.cac) }}</b></div>
          </div>
          <el-progress :percentage="progressValue(r.budgetUsage)" :stroke-width="6" :show-text="false" />
          <p>预算使用 {{ r.budgetUsage || 0 }}% · 点击率 {{ r.clickRate || 0 }}% · 转线索 {{ r.leadRate || 0 }}%</p>
        </article>
      </div>

      <el-table :data="filteredList" v-loading="loading" class="campaign-table" stripe>
        <el-table-column label="活动" min-width="220">
          <template #default="{ row }">
            <div class="name-cell">
              <strong>{{ row.campaignName }}</strong>
              <span>{{ row.channel || '未设置渠道' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="预算 / 花费" width="180" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <b>¥{{ fmt(row.actualCost) }}</b>
              <span>预算 ¥{{ fmt(row.budget) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="曝光/点击" width="150" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <b>{{ fmtInt(row.impressions) }}</b>
              <span>{{ fmtInt(row.clicks) }} 点击</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="线索" width="110" align="right">
          <template #default="{ row }"><span class="strong-num">{{ fmtInt(row.leadsCount) }}</span></template>
        </el-table-column>
        <el-table-column label="CAC" width="130" align="right">
          <template #default="{ row }"><span :class="['cac-pill', row.efficiency]">¥{{ fmt(row.cac) }}</span></template>
        </el-table-column>
        <el-table-column label="预算使用" width="150">
          <template #default="{ row }">
            <div class="usage-cell">
              <el-progress :percentage="progressValue(row.budgetUsage)" :stroke-width="6" :show-text="false" />
              <span>{{ row.budgetUsage || 0 }}%</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="效率" width="100">
          <template #default="{ row }">
            <el-tag :type="efficiencyTag(row.efficiency)" size="small" effect="plain">
              {{ efficiencyText(row.efficiency) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="96">
          <template #default="{ row }">
            <el-tag :type="row.status === 2 ? 'info' : 'success'" size="small">
              {{ row.status === 2 ? '已结束' : '进行中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
            <el-button link type="danger" @click="onRemove(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialog.visible" :title="dialog.id ? '编辑营销活动' : '新增营销活动'" width="600px">
      <el-form :model="form" label-width="94px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.campaignName" placeholder="如: 抖音-新公司财税套餐-Q1" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="渠道">
              <el-select v-model="form.channel" placeholder="选择渠道" clearable style="width:100%">
                <el-option v-for="c in CHANNELS" :key="c" :value="c" :label="c" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="form.status" style="width:100%">
                <el-option :value="1" label="进行中" />
                <el-option :value="2" label="已结束" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="预算">
              <el-input-number v-model="form.budget" :min="0" :step="1000" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际花费">
              <el-input-number v-model="form.actualCost" :min="0" :step="1000" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="起止日期">
              <el-date-picker
                v-model="dateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                start-placeholder="开始"
                end-placeholder="结束"
                style="width:100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="展示数">
              <el-input-number v-model="form.impressions" :min="0" :step="1000" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="点击数">
              <el-input-number v-model="form.clicks" :min="0" :step="100" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="线索数">
              <el-input-number v-model="form.leadsCount" :min="0" :step="10" controls-position="right" style="width:100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="记录素材、关键词、人群包、落地页等复盘信息" />
        </el-form-item>

        <div class="dialog-preview">
          <div><span>预算使用</span><b>{{ preview.budgetUsage }}%</b></div>
          <div><span>点击率</span><b>{{ preview.clickRate }}%</b></div>
          <div><span>转线索率</span><b>{{ preview.leadRate }}%</b></div>
          <div><span>CAC</span><b :class="cacClass(preview.cac)">¥{{ fmt(preview.cac) }}</b></div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Refresh, Search } from '@element-plus/icons-vue'
import { campaignApi, type Campaign, type CampaignRoi } from '@/api/marketing'

const CHANNELS = ['百度', '抖音', '小红书', '电销', '转介绍', '官网表单', '信息流', '其他']
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const roiList = ref<CampaignRoi[]>([])
const dateRange = ref<[string, string] | null>(null)
const dialog = reactive<{ visible: boolean; id?: number }>({ visible: false })
const form = reactive<Campaign>({ campaignName: '', status: 1 })
const filters = reactive<{ keyword: string; channel?: string; status?: number }>({ keyword: '' })

const filteredList = computed(() => roiList.value)
const topCards = computed(() => filteredList.value.slice(0, 4))
const bestCampaign = computed(() => {
  return filteredList.value
    .filter((item) => item.cac != null)
    .sort((a, b) => Number(a.cac || 0) - Number(b.cac || 0))[0]
})

const summary = computed(() => {
  const actualCost = filteredList.value.reduce((sum, item) => sum + Number(item.actualCost || 0), 0)
  const budget = filteredList.value.reduce((sum, item) => sum + Number(item.budget || 0), 0)
  const clicks = filteredList.value.reduce((sum, item) => sum + Number(item.clicks || 0), 0)
  const leads = filteredList.value.reduce((sum, item) => sum + Number(item.leadsCount || 0), 0)
  return {
    actualCost,
    leads,
    budgetUsage: budget > 0 ? round(actualCost / budget * 100) : 0,
    leadRate: clicks > 0 ? round(leads / clicks * 100) : 0,
    avgCac: leads > 0 ? round(actualCost / leads) : 0
  }
})

const efficiencyCards = computed(() => {
  const count = (key: CampaignRoi['efficiency']) => filteredList.value.filter((item) => item.efficiency === key).length
  return [
    { key: 'excellent', label: '优秀', count: count('excellent') },
    { key: 'good', label: '可放量', count: count('good') },
    { key: 'watch', label: '需观察', count: count('watch') },
    { key: 'risk', label: '高成本', count: count('risk') }
  ]
})

const preview = computed(() => {
  const actualCost = Number(form.actualCost || 0)
  const budget = Number(form.budget || 0)
  const impressions = Number(form.impressions || 0)
  const clicks = Number(form.clicks || 0)
  const leads = Number(form.leadsCount || 0)
  return {
    budgetUsage: budget > 0 ? round(actualCost / budget * 100) : 0,
    clickRate: impressions > 0 ? round(clicks / impressions * 100) : 0,
    leadRate: clicks > 0 ? round(leads / clicks * 100) : 0,
    cac: leads > 0 ? round(actualCost / leads) : 0
  }
})

function fmt(n?: number | null) {
  return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

function fmtInt(n?: number | null) {
  return n == null ? '0' : Number(n).toLocaleString('zh-CN')
}

function round(n: number) {
  return Math.round(n * 100) / 100
}

function progressValue(n?: number) {
  return Math.min(100, Math.max(0, Math.round(Number(n || 0))))
}

function cacClass(cac?: number | null) {
  if (cac == null || cac === 0) return ''
  if (cac <= 120) return 'cac-good'
  if (cac <= 220) return 'cac-mid'
  return 'cac-bad'
}

function cacLabel(cac?: number | null) {
  if (cac == null || cac === 0) return '暂无线索数据'
  if (cac <= 120) return '获客效率优秀'
  if (cac <= 220) return '可以继续放量'
  if (cac <= 360) return '需要观察优化'
  return '成本偏高,建议复盘'
}

function efficiencyText(type?: CampaignRoi['efficiency']) {
  const map = { excellent: '优秀', good: '可放量', watch: '观察', risk: '高成本' }
  return map[type || 'risk']
}

function efficiencyTag(type?: CampaignRoi['efficiency']) {
  const map = { excellent: 'success', good: 'primary', watch: 'warning', risk: 'danger' } as const
  return map[type || 'risk']
}

async function loadAll() {
  loading.value = true
  try {
    roiList.value = await campaignApi.roi()
    if (filters.keyword || filters.channel || filters.status) {
      const page = await campaignApi.list({ ...filters, pageNum: 1, pageSize: 500 })
      const ids = new Set((page.records || page.list || []).map((item) => item.id))
      roiList.value = roiList.value.filter((item) => ids.has(item.id))
    }
  } finally {
    loading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    id: undefined,
    campaignName: '',
    channel: undefined,
    budget: undefined,
    actualCost: undefined,
    startDate: undefined,
    endDate: undefined,
    impressions: undefined,
    clicks: undefined,
    leadsCount: undefined,
    status: 1,
    remark: undefined
  })
  dateRange.value = null
}

function openAdd() {
  resetForm()
  dialog.id = undefined
  dialog.visible = true
}

async function openEdit(id: number) {
  resetForm()
  dialog.id = id
  const data = await campaignApi.get(id)
  if (data) {
    Object.assign(form, data)
    if (data.startDate && data.endDate) dateRange.value = [data.startDate, data.endDate]
  }
  dialog.visible = true
}

async function onSave() {
  if (!form.campaignName?.trim()) {
    ElMessage.warning('请填写活动名称')
    return
  }
  saving.value = true
  try {
    form.startDate = dateRange.value?.[0]
    form.endDate = dateRange.value?.[1]
    if (dialog.id) {
      form.id = dialog.id
      await campaignApi.update({ ...form })
    } else {
      await campaignApi.add({ ...form })
    }
    ElMessage.success('已保存')
    dialog.visible = false
    await loadAll()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onRemove(id: number) {
  await ElMessageBox.confirm('确定删除该营销活动？', '提示', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
  await campaignApi.remove(id)
  ElMessage.success('已删除')
  await loadAll()
}

onMounted(loadAll)
</script>

<style scoped>
.campaign-page {
  padding: 16px;
}

.campaign-head,
.campaign-shell {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.campaign-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 18px;
}

.campaign-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 21px;
}

.campaign-head p {
  margin: 6px 0 0;
  color: var(--text-muted);
  font-size: 13px;
}

.head-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 12px;
}

.kpi-card,
.eff-card {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.kpi-card {
  display: grid;
  gap: 5px;
  min-height: 104px;
  padding: 16px;
}

.kpi-card span,
.kpi-card small {
  color: var(--text-muted);
  font-size: 12px;
}

.kpi-card strong {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 25px;
  line-height: 32px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-card .best-name {
  font-size: 18px;
}

.efficiency-row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.eff-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  border-left: 4px solid #3370ff;
}

.eff-card span {
  color: var(--text-body);
  font-size: 13px;
}

.eff-card strong {
  color: var(--text-primary);
  font-size: 20px;
}

.eff-card.excellent { border-left-color: #00b42a; }
.eff-card.good { border-left-color: #3370ff; }
.eff-card.watch { border-left-color: #ff7d00; }
.eff-card.risk { border-left-color: #f53f3f; }

.campaign-shell {
  padding: 14px;
}

.toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-soft);
}

.toolbar h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 17px;
}

.toolbar p {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.filters {
  display: grid;
  grid-template-columns: 220px 130px 120px;
  gap: 8px;
  flex-shrink: 0;
}

.campaign-cards {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin: 14px 0;
}

.campaign-card {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.campaign-card.excellent { background: #fbfffb; }
.campaign-card.good { background: #fbfdff; }
.campaign-card.watch { background: #fffdfa; }
.campaign-card.risk { background: #fffafa; }

.cc-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.cc-top h4 {
  display: -webkit-box;
  overflow: hidden;
  margin: 0 0 4px;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.cc-top span,
.campaign-card p {
  color: var(--text-muted);
  font-size: 12px;
}

.campaign-card p {
  margin: 0;
}

.cc-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.cc-metrics div {
  display: grid;
  gap: 3px;
}

.cc-metrics span {
  color: var(--text-muted);
  font-size: 12px;
}

.cc-metrics b,
.strong-num {
  color: var(--text-primary);
  font-weight: 700;
}

.campaign-table {
  margin-top: 4px;
}

.name-cell,
.amount-cell {
  display: grid;
  gap: 4px;
}

.name-cell strong,
.amount-cell b {
  color: var(--text-primary);
  font-weight: 650;
}

.name-cell span,
.amount-cell span {
  color: var(--text-muted);
  font-size: 12px;
}

.cac-pill {
  display: inline-flex;
  padding: 3px 9px;
  border-radius: 999px;
  background: #f2f3f5;
  color: var(--text-body);
  font-weight: 650;
}

.cac-pill.excellent,
.cac-good {
  background: #e8ffea;
  color: #00a024;
}

.cac-pill.good,
.cac-mid {
  background: #e8f3ff;
  color: #3370ff;
}

.cac-pill.watch {
  background: #fff7e8;
  color: #ff7d00;
}

.cac-pill.risk,
.cac-bad {
  background: #fff0f0;
  color: #f53f3f;
}

.usage-cell {
  display: grid;
  gap: 5px;
}

.usage-cell span {
  color: var(--text-muted);
  font-size: 12px;
}

.dialog-preview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-top: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #f7f8fa;
}

.dialog-preview div {
  display: grid;
  gap: 4px;
  text-align: center;
}

.dialog-preview span {
  color: var(--text-muted);
  font-size: 12px;
}

.dialog-preview b {
  color: var(--text-primary);
  font-size: 18px;
}

@media (max-width: 1180px) {
  .kpi-grid,
  .campaign-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    flex-direction: column;
  }

  .filters {
    width: 100%;
    grid-template-columns: 1fr 140px 130px;
  }
}

@media (max-width: 720px) {
  .campaign-head,
  .head-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .kpi-grid,
  .efficiency-row,
  .campaign-cards,
  .dialog-preview,
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>

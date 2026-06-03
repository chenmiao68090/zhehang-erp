<template>
  <div class="cc-page">
    <!-- 连续亏损预警条 -->
    <transition name="slide-down">
      <div v-if="negativeStreaks.length" class="streak-warn">
        <span class="sw-icon">📉</span>
        <div class="sw-body">
          <span class="sw-title">连续亏损预警：以下网销渠道连续 {{ negativeStreaks[0].months.length }} 个月 ROI &lt; 0，建议立即调整投放策略</span>
          <div class="sw-list">
            <span v-for="s in negativeStreaks" :key="s.channelType" class="sw-chip">
              <span class="sc-dot" :style="{ background: channelColor(s.channelType) }"></span>
              {{ s.channelName }} · {{ s.months.join(' / ') }}
            </span>
          </div>
        </div>
      </div>
    </transition>

    <!-- 顶部操作 -->
    <div class="page-head">
      <div class="head-title">
        <h2>网销投产比分析</h2>
        <p>跟踪线上运营网销渠道的投放成本、线索转化、成交回款与 ROI，指导预算分配。</p>
      </div>
      <div class="head-actions">
        <el-date-picker v-model="month" type="month" placeholder="选择月份" value-format="YYYY-MM" style="width:170px" />
        <el-button @click="router.push('/leads/campaign')">营销活动</el-button>
        <el-button type="primary" @click="openCreate">+ 录入投放数据</el-button>
      </div>
    </div>

    <!-- ROI 汇总卡片 -->
    <div class="overview">
      <div class="ov-card ov-1">
        <span class="ov-label">本月总投放</span>
        <span class="ov-value">¥{{ formatNum(summary.cost) }}</span>
        <span class="ov-foot">实际花费</span>
      </div>
      <div class="ov-card ov-2">
        <span class="ov-label">总线索数</span>
        <span class="ov-value">{{ formatNum(summary.leads) }}</span>
        <span class="ov-foot">单条均价 ¥{{ formatNum(summary.cpl) }}</span>
      </div>
      <div class="ov-card ov-3">
        <span class="ov-label">总成交数</span>
        <span class="ov-value">{{ formatNum(summary.conversions) }}</span>
        <span class="ov-foot">转化率 {{ summary.convRate }}%</span>
      </div>
      <div class="ov-card ov-4" :class="roiClass(summary.roi)">
        <span class="ov-label">平均 ROI</span>
        <span class="ov-value">{{ summary.roi }}%</span>
        <span class="ov-foot">{{ roiTag(summary.roi) }}</span>
      </div>
    </div>

    <!-- 渠道对比表 -->
    <el-card shadow="never" class="block-card">
      <template #header>
        <div class="block-header">
          <span class="block-title">网销渠道对比</span>
          <span class="block-sub">{{ month || '所有时段' }} · 共 {{ channelCompare.length }} 个网销渠道</span>
        </div>
      </template>
      <el-table :data="channelCompare" stripe :row-class-name="rowClass" style="width:100%">
        <el-table-column label="网销渠道" min-width="180">
          <template #default="{ row }">
            <div class="ch-cell">
              <span class="ch-dot" :style="{ background: channelColor(row.channelType) }"></span>
              <span class="ch-name">{{ row.channelName }}</span>
              <el-tag v-if="isNegativeStreak(row.channelType)" size="small" type="danger" effect="dark" class="streak-tag">连续亏损</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="投放费用" width="130" align="right"><template #default="{ row }"><span class="num">¥{{ formatNum(row.actualCost) }}</span></template></el-table-column>
        <el-table-column label="线索数" width="100" align="right"><template #default="{ row }"><span class="num">{{ formatNum(row.leadCount) }}</span></template></el-table-column>
        <el-table-column label="成交数" width="100" align="right"><template #default="{ row }"><span class="num accent">{{ formatNum(row.conversionCount) }}</span></template></el-table-column>
        <el-table-column label="转化率" width="100" align="right"><template #default="{ row }"><span class="num">{{ row.convRate }}%</span></template></el-table-column>
        <el-table-column label="成交总额" width="140" align="right"><template #default="{ row }"><span class="num revenue">¥{{ formatNum(row.conversionAmount) }}</span></template></el-table-column>
        <el-table-column label="ROI" width="120" align="right">
          <template #default="{ row }">
            <span class="roi-pill" :class="roiClass(row.roi)">{{ row.roi }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="线索成本" width="120" align="right"><template #default="{ row }"><span class="num">¥{{ formatNum(row.costPerLead) }}</span></template></el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="editRow(row)">编辑</el-button>
            <el-button link type="info" size="small">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 月度趋势 + 建议 -->
    <div class="bottom-grid">
      <el-card shadow="never" class="block-card">
        <template #header>
          <div class="block-header">
            <span class="block-title">月度趋势 (近6个月)</span>
          </div>
        </template>
        <el-table :data="monthlyTrend" stripe size="small">
          <el-table-column prop="month" label="月份" width="100">
            <template #default="{ row }"><span class="num">{{ row.month }}</span></template>
          </el-table-column>
          <el-table-column label="总投放" align="right"><template #default="{ row }"><span class="num">¥{{ formatNum(row.cost) }}</span></template></el-table-column>
          <el-table-column label="总线索" width="80" align="right"><template #default="{ row }"><span class="num">{{ row.leads }}</span></template></el-table-column>
          <el-table-column label="总成交" width="80" align="right"><template #default="{ row }"><span class="num accent">{{ row.conv }}</span></template></el-table-column>
          <el-table-column label="总成交额" align="right"><template #default="{ row }"><span class="num revenue">¥{{ formatNum(row.revenue) }}</span></template></el-table-column>
          <el-table-column label="综合 ROI" width="110" align="right">
            <template #default="{ row }"><span class="roi-pill" :class="roiClass(row.roi)">{{ row.roi }}%</span></template>
          </el-table-column>
        </el-table>
      </el-card>

      <el-card shadow="never" class="block-card advice-card">
        <template #header>
          <div class="block-header">
            <span class="block-title">网销投放建议</span>
            <span class="block-sub">基于 ROI 趋势</span>
          </div>
        </template>
        <div class="advice-list">
          <div v-for="(a, i) in adviceList" :key="i" :class="['advice-item', a.level]">
            <div class="ai-head">
              <span class="ai-dot" :style="{ background: channelColor(a.channelType) }"></span>
              <span class="ai-name">{{ a.channelName }}</span>
              <span class="ai-tag">{{ a.tag }}</span>
            </div>
            <p class="ai-text">{{ a.advice }}</p>
            <div class="ai-meta">
              <span>当月 ROI <b>{{ a.roi }}%</b></span>
              <span>线索成本 <b>¥{{ formatNum(a.cpl) }}</b></span>
            </div>
          </div>
          <div v-if="!adviceList.length" class="empty">暂无足够数据生成建议</div>
        </div>
      </el-card>
    </div>

    <!-- 录入 Dialog -->
    <el-dialog v-model="formVisible" :title="form.id ? '编辑投放数据' : '录入投放数据'" width="640px">
      <el-form :model="form" label-width="120px" label-position="left">
        <el-row :gutter="14">
          <el-col :span="12">
            <el-form-item label="网销渠道">
              <el-select v-model="form.channelType" style="width:100%" @change="onChannelChange">
                <el-option v-for="c in channelOptions" :key="c.value" :label="c.label" :value="c.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="投放月份"><el-date-picker v-model="form.month" type="month" value-format="YYYY-MM" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="投放费用"><el-input-number v-model="form.actualCost" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="预算金额"><el-input-number v-model="form.budgetAmount" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="展示次数"><el-input-number v-model="form.impressions" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="点击次数"><el-input-number v-model="form.clicks" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="线索数量"><el-input-number v-model="form.leadCount" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="成交数"><el-input-number v-model="form.conversionCount" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="成交总额"><el-input-number v-model="form.conversionAmount" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="投放策略说明"><el-input v-model="form.remark" type="textarea" :rows="3" placeholder="主推关键词/受众/创意方向等" /></el-form-item></el-col>
        </el-row>

        <div class="form-preview">
          <div class="fp-item"><span>线索成本</span><b>¥{{ formatNum(previewCpl) }}</b></div>
          <div class="fp-item"><span>转化率</span><b>{{ previewConvRate }}%</b></div>
          <div class="fp-item"><span>预计 ROI</span><b :class="'pv-' + roiClass(previewRoi)">{{ previewRoi }}%</b></div>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { channelCostApi, type BizChannelCost } from '@/api/channel'
const router = useRouter()
const channelOptions = [
  { value: 'baidu', label: '百度推广', color: '#2932e1' },
  { value: 'douyin', label: '抖音', color: '#000000' },
  { value: 'xiaohongshu', label: '小红书', color: '#ff2442' },
  { value: 'wuba', label: '58同城', color: '#fec601' },
  { value: 'seo', label: '官网SEO', color: '#0d7e7a' },
  { value: 'tencent', label: '腾讯广点通', color: '#1aad19' },
  { value: 'kuaishou', label: '快手', color: '#fe3666' },
  { value: 'zhihu', label: '知乎', color: '#0084ff' },
  { value: 'offline', label: '线下活动', color: '#7c3aed' },
  { value: 'other', label: '其他', color: '#64748b' }
]

const channelLabel = (t: string) => channelOptions.find(c => c.value === t)?.label || t
const channelColor = (t: string) => channelOptions.find(c => c.value === t)?.color || '#64748b'

const month = ref(new Date().toISOString().slice(0, 7))
const list = ref<BizChannelCost[]>([])
const negativeStreaks = ref<{ channelType: string; channelName: string; months: string[] }[]>([])

async function loadData () {
  const [res, streaks] = await Promise.all([
    channelCostApi.list({ pageSize: 500 }),
    channelCostApi.detectNegativeStreaks(2)
  ])
  list.value = (res as any).list as BizChannelCost[]
  negativeStreaks.value = streaks
}

function inMonth (c: BizChannelCost, ym: string) {
  if (!ym) return true
  return (c.startDate || '').startsWith(ym) || (c.endDate || '').startsWith(ym) || (c.createTime || '').startsWith(ym)
}

const currentList = computed(() => list.value.filter(c => inMonth(c, month.value)))

const summary = computed(() => {
  const cost = currentList.value.reduce((s, c) => s + c.actualCost, 0)
  const leads = currentList.value.reduce((s, c) => s + c.leadCount, 0)
  const conversions = currentList.value.reduce((s, c) => s + c.conversionCount, 0)
  const revenue = currentList.value.reduce((s, c) => s + c.conversionAmount, 0)
  const cpl = leads ? +(cost / leads).toFixed(2) : 0
  const roi = cost ? +((revenue - cost) / cost * 100).toFixed(1) : 0
  const convRate = leads ? +(conversions / leads * 100).toFixed(1) : 0
  return { cost, leads, conversions, revenue, cpl, roi, convRate }
})

const channelCompare = computed(() => {
  const m = new Map<string, any>()
  for (const c of currentList.value) {
    const e = m.get(c.channelType) || { channelType: c.channelType, channelName: channelLabel(c.channelType), actualCost: 0, leadCount: 0, conversionCount: 0, conversionAmount: 0 }
    e.actualCost += c.actualCost; e.leadCount += c.leadCount; e.conversionCount += c.conversionCount; e.conversionAmount += c.conversionAmount
    m.set(c.channelType, e)
  }
  return Array.from(m.values()).map(e => ({
    ...e,
    convRate: e.leadCount ? +(e.conversionCount / e.leadCount * 100).toFixed(1) : 0,
    costPerLead: e.leadCount ? +(e.actualCost / e.leadCount).toFixed(2) : 0,
    roi: e.actualCost ? +((e.conversionAmount - e.actualCost) / e.actualCost * 100).toFixed(1) : 0
  })).sort((a, b) => b.roi - a.roi)
})

const monthlyTrend = computed(() => {
  const months: string[] = []
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
  }
  return months.map(m => {
    const slice = list.value.filter(c => inMonth(c, m))
    const cost = slice.reduce((s, c) => s + c.actualCost, 0)
    const leads = slice.reduce((s, c) => s + c.leadCount, 0)
    const conv = slice.reduce((s, c) => s + c.conversionCount, 0)
    const revenue = slice.reduce((s, c) => s + c.conversionAmount, 0)
    const roi = cost ? +((revenue - cost) / cost * 100).toFixed(1) : 0
    return { month: m, cost, leads, conv, revenue, roi }
  })
})

const adviceList = computed(() => {
  const advices: any[] = []
  // 连续亏损优先
  for (const s of negativeStreaks.value) {
    advices.push({
      channelType: s.channelType,
      channelName: s.channelName,
      level: 'danger',
      tag: `连续${s.months.length}月亏损`,
      advice: `「${s.channelName}」连续 ${s.months.join(' / ')} ROI<0，建议立即暂停投放或重构创意。`,
      roi: 0, costPerLead: 0
    })
  }
  for (const ch of channelCompare.value) {
    if (advices.some(a => a.channelType === ch.channelType)) continue
    if (ch.roi < 0) {
      advices.push({ ...ch, level: 'danger', tag: '亏损警告', advice: `「${ch.channelName}」当月 ROI 为 ${ch.roi}%，建议减少或暂停该渠道投放。` })
    } else if (ch.roi >= 300) {
      advices.push({ ...ch, level: 'success', tag: '建议加大投入', advice: `「${ch.channelName}」表现优异 (ROI ${ch.roi}%)，建议适度增加预算以放大收益。` })
    } else if (ch.roi < 100 && ch.actualCost > 0) {
      advices.push({ ...ch, level: 'warning', tag: '需优化', advice: `「${ch.channelName}」ROI 偏低 (${ch.roi}%)，建议优化投放策略或调整目标受众。` })
    }
  }
  return advices.slice(0, 6).map(a => ({ ...a, cpl: a.costPerLead || 0 }))
})

function roiClass (roi: number) {
  if (roi < 0) return 'danger'
  if (roi < 100) return 'warning'
  if (roi < 300) return 'primary'
  return 'success'
}
function roiTag (roi: number) {
  if (roi < 0) return '亏损'
  if (roi < 100) return '一般'
  if (roi < 300) return '良好'
  return '优秀'
}
function rowClass ({ row }: any) {
  if (isNegativeStreak(row.channelType)) return 'roi-row-streak'
  return 'roi-row-' + roiClass(row.roi)
}
function isNegativeStreak (channelType: string) {
  return negativeStreaks.value.some(s => s.channelType === channelType)
}
function formatNum (n: number) { return Math.round(n || 0).toLocaleString('zh-CN') }

// form
const formVisible = ref(false)
const form = reactive<any>({
  id: 0, channelType: 'baidu', month: new Date().toISOString().slice(0, 7),
  actualCost: 10000, budgetAmount: 10000, impressions: 0, clicks: 0,
  leadCount: 0, conversionCount: 0, conversionAmount: 0, remark: ''
})
function resetForm () { Object.assign(form, { id: 0, channelType: 'baidu', month: new Date().toISOString().slice(0, 7), actualCost: 10000, budgetAmount: 10000, impressions: 0, clicks: 0, leadCount: 0, conversionCount: 0, conversionAmount: 0, remark: '' }) }
function openCreate () { resetForm(); formVisible.value = true }
function editRow (row: any) {
  resetForm()
  Object.assign(form, { channelType: row.channelType, actualCost: row.actualCost, leadCount: row.leadCount, conversionCount: row.conversionCount, conversionAmount: row.conversionAmount })
  formVisible.value = true
}
function onChannelChange () { /* placeholder for autofill */ }

const previewCpl = computed(() => form.leadCount ? +(form.actualCost / form.leadCount).toFixed(2) : 0)
const previewConvRate = computed(() => form.leadCount ? +(form.conversionCount / form.leadCount * 100).toFixed(1) : 0)
const previewRoi = computed(() => form.actualCost ? +((form.conversionAmount - form.actualCost) / form.actualCost * 100).toFixed(1) : 0)

async function submitForm () {
  await channelCostApi.create({
    channelType: form.channelType,
    channelName: channelLabel(form.channelType),
    campaignName: form.remark.slice(0, 30) || channelLabel(form.channelType),
    startDate: form.month + '-01', endDate: form.month + '-28',
    budgetAmount: form.budgetAmount, actualCost: form.actualCost,
    leadCount: form.leadCount, conversionCount: form.conversionCount, conversionAmount: form.conversionAmount,
    status: 'completed', remark: form.remark
  } as any)
  ElMessage.success('录入成功')
  formVisible.value = false
  loadData()
}

onMounted(loadData)
</script>

<style scoped>
.cc-page { padding: 16px; background: var(--bg-page); min-height: 100%; }
.streak-warn { display: flex; gap: 14px; padding: 14px 18px; margin-bottom: 14px; background: #fff0f0; border: 1px solid #ffd0d0; border-radius: 8px; color: var(--text-primary); box-shadow: none; }
.streak-warn .sw-icon { font-size: 28px; flex-shrink: 0; }
.streak-warn .sw-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
.streak-warn .sw-title { font-size: 13px; font-weight: 600; letter-spacing: 0; color: #f53f3f; }
.streak-warn .sw-list { display: flex; flex-wrap: wrap; gap: 8px; }
.streak-warn .sw-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fff; border: 1px solid #ffd0d0; border-radius: 999px; font-size: 12px; color: var(--text-body); }
.streak-warn .sc-dot { width: 8px; height: 8px; border-radius: 50%; box-shadow: 0 0 0 2px rgba(245, 63, 63, .12); }
.slide-down-enter-active, .slide-down-leave-active { transition: all .35s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-12px); }
.streak-tag { margin-left: 8px; }
:deep(.roi-row-streak) { background: #fef2f2 !important; box-shadow: inset 4px 0 0 #b91c1c; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; padding: 18px; background: #fff; border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); }
.head-title h2 { margin: 0; font-size: 20px; letter-spacing: 0; font-weight: 700; }
.head-title p { margin: 6px 0 0; font-size: 13px; color: var(--text-muted); opacity: 1; }
.head-actions { display: flex; gap: 10px; align-items: center; }
:deep(.head-actions .el-input__wrapper) { background: #fff; border: 1px solid var(--border-color); box-shadow: none; }
:deep(.head-actions .el-input__inner) { color: var(--text-primary); }

.overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
.ov-card { padding: 18px 20px; border-radius: 8px; background: #fff; border: 1px solid var(--border-color); display: flex; flex-direction: column; position: relative; overflow: hidden; }
.ov-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
.ov-1::before { background: #6366f1; } .ov-2::before { background: #f59e0b; } .ov-3::before { background: #14b8a6; }
.ov-4.success::before { background: #10b981; } .ov-4.primary::before { background: #3b82f6; }
.ov-4.warning::before { background: #f59e0b; } .ov-4.danger::before { background: #ef4444; }
.ov-label { font-size: 12px; color: #64748b; letter-spacing: .5px; }
.ov-value { font-size: 30px; font-weight: 700; font-family: 'JetBrains Mono', Consolas, monospace; color: #0f172a; margin: 4px 0 4px; letter-spacing: -.5px; }
.ov-foot { font-size: 12px; color: #94a3b8; }

.block-card { border-radius: 8px; margin-bottom: 14px; border-color: var(--border-color); }
.block-header { display: flex; justify-content: space-between; align-items: baseline; }
.block-title { font-weight: 600; color: #0f172a; }
.block-sub { font-size: 12px; color: #94a3b8; }

.ch-cell { display: flex; align-items: center; gap: 10px; }
.ch-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 3px rgba(0,0,0,.05); }
.ch-name { font-weight: 500; color: #0f172a; }
.num { font-family: 'JetBrains Mono', Consolas, monospace; }
.num.accent { color: #0d7e7a; font-weight: 600; }
.num.revenue { color: #b45309; font-weight: 600; }

.roi-pill { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; font-family: 'JetBrains Mono', monospace; }
.roi-pill.success { background: #d1fae5; color: #047857; }
.roi-pill.primary { background: #dbeafe; color: #1d4ed8; }
.roi-pill.warning { background: #fef3c7; color: #b45309; }
.roi-pill.danger { background: #fee2e2; color: #b91c1c; }

:deep(.roi-row-danger) { background: #fef2f2 !important; }
:deep(.roi-row-success) { background: #f0fdf4 !important; }

.bottom-grid { display: grid; grid-template-columns: 1.6fr 1fr; gap: 14px; }
.advice-list { display: flex; flex-direction: column; gap: 10px; max-height: 360px; overflow-y: auto; }
.advice-item { padding: 12px 14px; border-radius: 8px; border-left: 4px solid #e5e7eb; background: #f8fafc; }
.advice-item.success { border-left-color: #10b981; background: #ecfdf5; }
.advice-item.warning { border-left-color: #f59e0b; background: #fffbeb; }
.advice-item.danger { border-left-color: #ef4444; background: #fef2f2; }
.ai-head { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.ai-dot { width: 8px; height: 8px; border-radius: 50%; }
.ai-name { font-weight: 600; color: #0f172a; flex: 1; }
.ai-tag { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: rgba(0,0,0,.06); color: #475569; }
.advice-item.success .ai-tag { background: #a7f3d0; color: #047857; }
.advice-item.warning .ai-tag { background: #fde68a; color: #b45309; }
.advice-item.danger .ai-tag { background: #fecaca; color: #b91c1c; }
.ai-text { margin: 0 0 8px; font-size: 13px; color: #334155; line-height: 1.6; }
.ai-meta { display: flex; gap: 18px; font-size: 11px; color: #64748b; }
.ai-meta b { color: #0f172a; font-family: 'JetBrains Mono', monospace; margin-left: 4px; }
.empty { text-align: center; color: #94a3b8; padding: 30px 0; font-size: 13px; }

.form-preview { display: flex; gap: 12px; margin-top: 8px; padding: 10px; background: #f8fafc; border-radius: 6px; }
.fp-item { flex: 1; text-align: center; }
.fp-item span { display: block; font-size: 11px; color: #94a3b8; }
.fp-item b { font-family: 'JetBrains Mono', monospace; font-size: 18px; color: #0f172a; }
.fp-item b.pv-success { color: #047857; } .fp-item b.pv-primary { color: #1d4ed8; }
.fp-item b.pv-warning { color: #b45309; } .fp-item b.pv-danger { color: #b91c1c; }
</style>

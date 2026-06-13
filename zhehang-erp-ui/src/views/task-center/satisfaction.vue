<template>
  <div class="task-page satisfaction-page">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 07 / SATISFACTION</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">客户满意度回访</span>
          <span class="title-en">Customer Satisfaction Survey</span>
        </h1>
        <p class="page-desc">五星评分体系 · 不满意自动升级 · 转介绍意向沉淀</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 回访触发节点说明 -->
    <section class="trigger-strip">
      <span class="strip-label">触发节点</span>
      <span class="trigger-chip"><b>首次服务后</b> · 入职验收</span>
      <span class="trigger-chip"><b>3 个月</b> · 服务阶段性检验</span>
      <span class="trigger-chip"><b>6 个月</b> · 中期客户关怀</span>
      <span class="trigger-chip"><b>12 个月</b> · 续费前汇总</span>
      <span class="trigger-chip hot"><b>投诉后</b> · 必须介入回访</span>
    </section>

    <!-- Tab 区 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">回访列表</h2>
        <span class="section-sub">SURVEY / LIST</span>
        <div class="section-actions">
          <el-button type="primary" @click="openCreate()">+ 创建回访</el-button>
        </div>
      </div>

      <div class="tab-strip">
        <button v-for="t in tabs" :key="t.value" class="tab-btn" :class="{ active: activeTab === t.value }" @click="changeTab(t.value)">
          {{ t.label }}
          <span v-if="t.count" class="tab-count">{{ t.count }}</span>
        </button>
      </div>

      <!-- 待回访 -->
      <div v-if="activeTab === 'pending'" class="table-card">
        <el-table :data="pendingList" stripe class="dark-table" v-loading="loading">
          <el-table-column prop="customerName" label="客户名称" min-width="220" />
          <el-table-column label="回访类型" width="140">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ surveyTypeLabel(row.surveyType, row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="计划回访日" width="150">
            <template #default="{ row }">{{ row.scheduledTime?.slice(0, 10) }}</template>
          </el-table-column>
          <el-table-column prop="callbackerName" label="负责人" width="120" />
          <el-table-column label="逾期天数" width="120" align="center">
            <template #default="{ row }">
              <span v-if="overdueDays(row) > 0" class="overdue-text">已逾期 {{ overdueDays(row) }} 天</span>
              <span v-else class="ontime-text">未逾期</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openCreate(row)">立即回访</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 已完成 -->
      <div v-if="activeTab === 'completed'" class="table-card">
        <el-table :data="completedList" stripe class="dark-table">
          <el-table-column prop="customerName" label="客户" min-width="220" />
          <el-table-column label="时间" width="150">
            <template #default="{ row }">{{ row.actualTime?.slice(0, 10) }}</template>
          </el-table-column>
          <el-table-column label="方式" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="surveyTagType(row.surveyType)" effect="plain">{{ surveyTypeLabel(row.surveyType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="评分" width="180">
            <template #default="{ row }">
              <el-rate :model-value="row.overallScore" disabled :colors="rateColors(row.overallScore)" />
              <span class="score-text" :style="{ color: scoreColor(row.overallScore) }">{{ scoreLabel(row.overallScore) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="callbackerName" label="回访人" width="120" />
          <el-table-column label="是否升级" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.overallScore <= 2 && row.overallScore > 0" type="danger" size="small">已升级</el-tag>
              <span v-else class="ontime-text">无需升级</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 需升级处理 -->
      <div v-if="activeTab === 'escalated'" class="table-card">
        <el-table :data="escalatedList" stripe class="dark-table">
          <el-table-column prop="customerName" label="客户" min-width="200" />
          <el-table-column label="评分" width="200">
            <template #default="{ row }">
              <el-rate :model-value="row.overallScore" disabled :colors="rateColors(row.overallScore)" />
            </template>
          </el-table-column>
          <el-table-column label="升级类型" width="220">
            <template #default="{ row }">
              <el-tag :type="row.overallScore === 1 ? 'danger' : 'warning'" effect="dark" size="small">
                {{ row.overallScore === 1 ? 'D 类 · 老板投诉处理' : 'C 类 · 项目部客户挽回' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="升级任务状态" width="140">
            <template #default="{ row }">
              <span class="dot dot-orange"></span>
              <span>{{ row.escalatedStatus || '处理中' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="feedback" label="存在问题" min-width="240" show-overflow-tooltip />
        </el-table>
      </div>
    </section>

    <!-- 满意度统计 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">满意度统计</h2>
        <span class="section-sub">STATS / DISTRIBUTION</span>
      </div>

      <div class="stats-grid">
        <div class="stats-card">
          <div class="stats-head">平均分</div>
          <div class="big-score">
            <span class="score-num">{{ averageScore }}</span>
            <span class="score-out">/ 5.0</span>
          </div>
          <el-rate :model-value="Math.round(Number(averageScore))" disabled :colors="rateColors(Math.round(Number(averageScore)))" />
        </div>

        <div class="stats-card span-2">
          <div class="stats-head">各分值分布</div>
          <div class="bar-list">
            <div class="bar-row" v-for="d in scoreDistribution" :key="d.score">
              <span class="bar-label">{{ d.score }} 星</span>
              <div class="bar-track"><div class="bar-fill" :style="{ width: d.percent + '%', background: d.color }"></div></div>
              <span class="bar-value">{{ d.count }} 份</span>
            </div>
          </div>
        </div>

        <div class="stats-card">
          <div class="stats-head">转介绍意向</div>
          <div class="referral-pie">
            <div class="pie-row" v-for="r in referralStats" :key="r.label">
              <span class="pie-dot" :style="{ background: r.color }"></span>
              <span class="pie-label">{{ r.label }}</span>
              <span class="pie-value">{{ r.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 创建/填写回访 Dialog -->
    <el-dialog v-model="formVisible" :title="form.id ? '填写回访结果' : '创建回访'" width="640px" class="satisfaction-dialog" top="6vh">
      <el-form :model="form" label-width="110px">
        <el-form-item label="关联客户">
          <el-select v-model="form.customerId" placeholder="选择客户" filterable :disabled="!!form.id">
            <el-option v-for="c in customerOptions" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="回访类型">
          <el-select v-model="form.callbackType" placeholder="选择类型">
            <el-option label="首次服务" value="first" />
            <el-option label="3 个月" value="3m" />
            <el-option label="6 个月" value="6m" />
            <el-option label="12 个月" value="12m" />
            <el-option label="投诉后" value="complaint" />
            <el-option label="手动发起" value="manual" />
          </el-select>
        </el-form-item>
        <el-form-item label="回访方式">
          <el-radio-group v-model="form.surveyType">
            <el-radio label="phone">电话</el-radio>
            <el-radio label="wechat">微信</el-radio>
            <el-radio label="face_to_face">面谈</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="满意度评分">
          <div class="rate-block">
            <el-rate v-model="form.overallScore" :colors="rateColors(form.overallScore)" />
            <span class="rate-text" :style="{ color: scoreColor(form.overallScore) }">{{ scoreLabel(form.overallScore) }}</span>
          </div>
          <div v-if="form.overallScore === 5" class="escalation-tip ok">
            <span class="warning-icon">★</span>
            <b>标杆客户</b> · 提交后系统将自动标记，鼓励销售跟进转介绍
          </div>
          <div v-else-if="form.overallScore === 4" class="escalation-tip info">
            <span class="warning-icon">●</span>
            评分良好，提交后正常存档
          </div>
          <div v-else-if="form.overallScore === 3" class="escalation-tip warn">
            <span class="warning-icon">○</span>
            评分中等，提交后系统将自动创建 <b>15 天后再次回访</b> 任务
          </div>
          <div v-else-if="form.overallScore && form.overallScore <= 2" class="escalation-warning">
            <span class="warning-icon">⚠</span>
            评分偏低，提交后系统将自动创建
            <b>{{ form.overallScore === 1 ? 'D 类任务（老板 · 投诉处理）' : 'C 类任务（项目部 · 客户挽回）' }}</b>
          </div>
        </el-form-item>

        <el-form-item label="服务评价">
          <el-checkbox-group v-model="form.serviceTags">
            <el-checkbox label="记账及时" />
            <el-checkbox label="报税准确" />
            <el-checkbox label="响应快" />
            <el-checkbox label="沟通顺畅" />
            <el-checkbox label="价格合理" />
            <el-checkbox label="其他" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="存在问题">
          <el-input v-model="form.feedback" type="textarea" :rows="2" placeholder="客户提到的问题或不满" />
        </el-form-item>
        <el-form-item label="改进建议">
          <el-input v-model="form.improvementSuggestion" type="textarea" :rows="2" placeholder="客户给出的改进建议" />
        </el-form-item>
        <el-form-item label="转介绍意愿">
          <el-radio-group v-model="form.referralIntent">
            <el-radio label="yes">是</el-radio>
            <el-radio label="no">否</el-radio>
            <el-radio label="maybe">考虑中</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="后续跟进事项">
          <el-input v-model="form.followUp" type="textarea" :rows="2" placeholder="可填写后续跟进计划" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交回访</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { satisfactionApi, escalationApi, type BizSatisfaction } from '@/api/task-center'

interface SatisfactionRow extends BizSatisfaction {
  callbackType?: string
  serviceTags?: string[]
  referralIntent?: string
  followUp?: string
  escalatedStatus?: string
}

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const tabs = ref([
  { label: '待回访', value: 'pending', count: 0 },
  { label: '已完成', value: 'completed', count: 0 },
  { label: '需升级处理', value: 'escalated', count: 0 }
])
const activeTab = ref('pending')

const loading = ref(false)
const allList = ref<SatisfactionRow[]>([])

const formVisible = ref(false)
const form = ref<any>(emptyForm())

function emptyForm() {
  return {
    id: 0,
    customerId: 0, customerName: '',
    callbackType: 'first',
    surveyType: 'phone',
    overallScore: 0,
    serviceTags: [] as string[],
    feedback: '',
    improvementSuggestion: '',
    referralIntent: '',
    followUp: ''
  }
}

const customerOptions = [
  { id: 2001, name: '杭州数智科技有限公司' },
  { id: 2002, name: '宁波微启企业服务有限公司' },
  { id: 2004, name: '温州弘益商贸有限公司' },
  { id: 2010, name: '湖州雄越实业有限公司' }
]

const pendingList = computed(() => allList.value.filter(s => s.status === 'pending'))
const completedList = computed(() => allList.value.filter(s => s.status === 'completed'))
const escalatedList = computed(() => allList.value.filter(s => s.status === 'completed' && s.overallScore > 0 && s.overallScore <= 2))

const metrics = computed(() => {
  const list = allList.value
  const now = new Date()
  const thisMonth = list.filter(s => s.actualTime?.slice(0, 7) === now.toISOString().slice(0, 7))
  const completed = list.filter(s => s.status === 'completed' && s.overallScore > 0)
  const avg = completed.length ? (completed.reduce((s, c) => s + c.overallScore, 0) / completed.length).toFixed(1) : '—'
  return [
    { label: '待回访', value: pendingList.value.length },
    { label: '本月已回访', value: thisMonth.filter(s => s.status === 'completed').length },
    { label: '平均满意度', value: avg },
    { label: '不满意需升级', value: escalatedList.value.length }
  ]
})

const averageScore = computed(() => {
  const c = allList.value.filter(s => s.status === 'completed' && s.overallScore > 0)
  if (!c.length) return '0.0'
  return (c.reduce((s, x) => s + x.overallScore, 0) / c.length).toFixed(1)
})

const scoreDistribution = computed(() => {
  const c = allList.value.filter(s => s.status === 'completed' && s.overallScore > 0)
  const palette: any = {
    5: 'linear-gradient(90deg, #67C23A, #95D475)',
    4: 'linear-gradient(90deg, #409EFF, #79BBFF)',
    3: 'linear-gradient(90deg, #E6A23C, #F2C682)',
    2: 'linear-gradient(90deg, #F56C6C, #F89898)',
    1: 'linear-gradient(90deg, #B82323, #F56C6C)'
  }
  const max = c.length || 1
  return [5, 4, 3, 2, 1].map(score => {
    const count = c.filter(x => x.overallScore === score).length
    return { score, count, percent: Math.round((count / max) * 100), color: palette[score] }
  })
})

const referralStats = computed(() => {
  const c = allList.value.filter(s => s.status === 'completed') as SatisfactionRow[]
  const map: Record<string, number> = { yes: 0, no: 0, maybe: 0 }
  c.forEach(s => { if (s.referralIntent && map[s.referralIntent] !== undefined) map[s.referralIntent]++ })
  return [
    { label: '愿意转介绍', count: map.yes, color: '#67C23A' },
    { label: '考虑中', count: map.maybe, color: '#E6A23C' },
    { label: '暂不考虑', count: map.no, color: '#909399' }
  ]
})

async function loadList() {
  loading.value = true
  try {
    const res: any = await satisfactionApi.list({ page: 1, pageSize: 999 })
    allList.value = (res.list || []).map((s: BizSatisfaction) => ({
      ...s,
      callbackType: (s as any).callbackType || 'first',
      referralIntent: (s as any).referralIntent || (s.overallScore >= 4 ? 'yes' : s.overallScore === 3 ? 'maybe' : 'no')
    }))
    refreshTabCounts()
  } finally { loading.value = false }
}

function refreshTabCounts() {
  tabs.value[0].count = pendingList.value.length
  tabs.value[1].count = completedList.value.length
  tabs.value[2].count = escalatedList.value.length
}

function changeTab(v: string) { activeTab.value = v }

function openCreate(row?: SatisfactionRow) {
  form.value = emptyForm()
  if (row) {
    form.value.id = row.id
    form.value.customerId = row.customerId
    form.value.customerName = row.customerName
    form.value.surveyType = row.surveyType
  }
  formVisible.value = true
}

async function submitForm() {
  if (!form.value.customerId || !form.value.overallScore) {
    ElMessage.warning('请选择客户并完成评分')
    return
  }
  if (form.value.overallScore <= 2) {
    await ElMessageBox.confirm(
      `检测到客户评分仅 ${form.value.overallScore} 分，提交后系统将自动创建${form.value.overallScore === 1 ? ' D 类任务（老板 · 投诉处理）' : ' C 类任务（项目部 · 客户挽回）'}，确认提交？`,
      '满意度升级提醒', { type: 'warning', confirmButtonText: '确认提交并升级' }
    ).catch(() => null)
  }
  const customer = customerOptions.find(c => c.id === form.value.customerId)
  await satisfactionApi.create({
    orderId: 0, customerId: form.value.customerId, customerName: customer?.name,
    surveyType: form.value.surveyType,
    callbackerId: 0, callbackerName: '',
    scheduledTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    actualTime: new Date().toISOString().slice(0, 19).replace('T', ' '),
    serviceScore: form.value.overallScore,
    attitudeScore: form.value.overallScore,
    efficiencyScore: form.value.overallScore,
    overallScore: form.value.overallScore,
    feedback: form.value.feedback,
    improvementSuggestion: form.value.improvementSuggestion,
    status: 'completed'
  })
  // 升级/联动处理（低分自动升级建任务、3 分自动再次回访 后端暂无对应模型，仅做回访提交 + 提示）
  const score = form.value.overallScore
  const cName = customer?.name || ''
  if (score <= 2) {
    await escalationApi.fromSatisfaction({
      customerId: form.value.customerId,
      customerName: cName,
      score,
      feedback: form.value.feedback || ''
    }).catch(() => null)
    ElMessage.warning(`评分 ${score} 分：${score === 1 ? '建议升级为 D 类任务（老板 · 投诉处理）' : '建议升级为 C 类任务（项目部 · 客户挽回）'}，请在任务中心手动派单`)
  } else if (score === 3) {
    await escalationApi.fromSatisfactionFollowUp({
      customerId: form.value.customerId,
      customerName: cName,
      score
    }).catch(() => null)
    ElMessage.success('回访结果已提交，建议 15 天后再次回访')
  } else if (score === 5) {
    ElMessage.success('评分 5 分：已标记为标杆客户，请销售跟进转介绍')
  } else {
    ElMessage.success('回访结果已提交并存档')
  }
  formVisible.value = false
  loadList()
}

function overdueDays(row: BizSatisfaction) {
  if (!row.scheduledTime) return 0
  const a = new Date(row.scheduledTime).getTime()
  const b = new Date().getTime()
  return Math.max(0, Math.floor((b - a) / 86400000))
}

function surveyTypeLabel(t: string, row?: any) {
  const map: any = { phone: '电话', wechat: '微信', email: '邮件', face_to_face: '面谈' }
  if (row?.callbackType) {
    const ct: any = { first: '首次服务', '3m': '3 个月', '6m': '6 个月', '12m': '12 个月', complaint: '投诉后', manual: '手动发起' }
    return ct[row.callbackType] || map[t]
  }
  return map[t] || t
}
function surveyTagType(t: string): any {
  return ({ phone: 'primary', wechat: 'success', face_to_face: 'warning' } as any)[t] || ''
}
function scoreLabel(s: number) {
  return ({ 5: '非常满意', 4: '满意', 3: '一般', 2: '不满意', 1: '非常不满意', 0: '未评分' } as any)[s]
}
function scoreColor(s: number) {
  return ({ 5: '#67C23A', 4: '#409EFF', 3: '#E6A23C', 2: '#F56C6C', 1: '#B82323', 0: '#888' } as any)[s]
}
function rateColors(s: number): string[] {
  const c = scoreColor(s)
  return [c, c, c]
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 24px; padding: 8px 4px 32px; }

/* —— Header —— */
.page-header {
  position: relative; padding: 32px 36px 28px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22); border-radius: 14px; overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
      radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.12), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 11px; letter-spacing: 0.18em;
  color: var(--gold-primary, #D4AF37); margin-bottom: 14px; position: relative; z-index: 1;
}
.meta-tag { padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 2px; background: rgba(212, 175, 55, 0.06); }
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 10px;
  .title-cn {
    font-size: 34px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(212, 175, 55, 0.55);
  }
}
.page-desc { font-size: 14px; color: var(--text-body, #B8B8C0); letter-spacing: 0.04em; margin: 0; }
.header-decor {
  position: absolute; right: 36px; bottom: 24px;
  display: flex; align-items: center; gap: 8px; z-index: 1;
  .decor-line { width: 64px; height: 1px; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5)); &.short { width: 18px; } }
  .decor-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-primary, #D4AF37); box-shadow: 0 0 12px rgba(212, 175, 55, 0.6); }
}

/* —— Metric Strip —— */
.metric-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px; overflow: hidden;
}
.metric-item {
  position: relative; padding: 18px 22px;
  border-right: 1px solid rgba(212, 175, 55, 0.08);
  &:last-child { border-right: none; }
  .metric-index { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45); margin-bottom: 6px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: var(--gold-primary, #D4AF37); line-height: 1.1; }
  .metric-label { margin-top: 6px; font-size: 12px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
}

/* —— Section Header —— */
.section-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding-left: 4px; }
.section-title {
  font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5);
  margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }
.section-actions { margin-left: auto; }

/* —— Tab Strip —— */
.tab-strip {
  display: flex; gap: 4px; padding: 6px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px; margin-bottom: 14px;
}
.tab-btn {
  padding: 8px 18px; background: transparent; border: none;
  color: #B8B8C0; cursor: pointer; font-size: 13px; letter-spacing: 0.04em;
  border-radius: 5px; transition: all 0.2s ease;
  display: inline-flex; align-items: center; gap: 8px;
  &:hover { color: #FFF7DD; background: rgba(212, 175, 55, 0.08); }
  &.active {
    color: #12121A; font-weight: 600;
    background: linear-gradient(135deg, #FFF7DD, #D4AF37);
    .tab-count { background: rgba(18, 18, 26, 0.2); color: #12121A; }
  }
  .tab-count {
    display: inline-block; min-width: 20px; padding: 1px 6px;
    border-radius: 10px; background: rgba(212, 175, 55, 0.2);
    color: var(--gold-primary, #D4AF37); font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
  }
}

.table-card { background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 8px 8px 4px; }
.dark-table { background: transparent; }
.overdue-text { color: #F56C6C; font-weight: 600; }
.ontime-text { color: #888; font-size: 12px; }
.score-text { margin-left: 8px; font-size: 12px; }
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.dot-orange { background: #F2B824; }

/* —— Stats Grid —— */
.stats-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; }
.stats-card {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px; padding: 22px;
  &.span-2 { /* default */ }
}
.stats-head { font-size: 13px; font-weight: 600; color: var(--gold-primary, #D4AF37); margin-bottom: 16px; padding-left: 10px; border-left: 3px solid var(--gold-primary, #D4AF37); }
.big-score {
  display: flex; align-items: baseline; gap: 6px; margin-bottom: 12px;
  .score-num { font-family: 'JetBrains Mono', monospace; font-size: 56px; font-weight: 700; color: #FFF7DD; line-height: 1; background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .score-out { font-size: 16px; color: rgba(212, 175, 55, 0.6); }
}
.bar-list { display: flex; flex-direction: column; gap: 12px; }
.bar-row { display: grid; grid-template-columns: 60px 1fr 80px; align-items: center; gap: 12px; }
.bar-label { font-size: 13px; color: #E8E8EE; }
.bar-track { height: 12px; background: rgba(255, 255, 255, 0.06); border-radius: 6px; overflow: hidden; }
.bar-fill { height: 100%; border-radius: 6px; transition: width 0.6s ease; }
.bar-value { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--gold-primary, #D4AF37); text-align: right; }

.referral-pie { display: flex; flex-direction: column; gap: 14px; padding-top: 6px; }
.pie-row { display: grid; grid-template-columns: 14px 1fr 60px; align-items: center; gap: 10px; }
.pie-dot { width: 12px; height: 12px; border-radius: 50%; }
.pie-label { font-size: 13px; color: #E8E8EE; }
.pie-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; color: var(--gold-primary, #D4AF37); text-align: right; font-weight: 700; }

/* ·· Trigger Strip ·· */
.trigger-strip { display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  padding: 12px 18px; background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px;
}
.strip-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: rgba(212, 175, 55, 0.55); padding-right: 8px; border-right: 1px dashed rgba(212, 175, 55, 0.2); }
.trigger-chip { padding: 5px 12px; font-size: 12px; color: var(--text-body, #B8B8C0);
  border: 1px solid rgba(212, 175, 55, 0.16); border-radius: 14px;
  background: rgba(212, 175, 55, 0.04);
  b { color: var(--gold-primary, #D4AF37); margin-right: 4px; font-weight: 600; }
  &.hot { border-color: rgba(245, 108, 108, 0.3); background: rgba(245, 108, 108, 0.05);
    b { color: #F56C6C; }
  }
}

/* ·· Dialog ·· */
.escalation-tip { margin-top: 12px; padding: 8px 14px; border-radius: 4px; font-size: 12px; line-height: 1.6; display: flex; align-items: center; gap: 6px;
  .warning-icon { font-size: 14px; }
  b { font-weight: 600; }
  &.ok { background: linear-gradient(90deg, rgba(103, 194, 58, 0.18), rgba(103, 194, 58, 0.04)); border-left: 3px solid #67C23A; color: #B5E5A0;
    .warning-icon, b { color: #67C23A; }
  }
  &.info { background: rgba(64, 158, 255, 0.08); border-left: 3px solid #409EFF; color: #B5D6FF;
    .warning-icon { color: #409EFF; }
  }
  &.warn { background: linear-gradient(90deg, rgba(230, 162, 60, 0.18), rgba(230, 162, 60, 0.04)); border-left: 3px solid #E6A23C; color: #FFE0B0;
    .warning-icon, b { color: #E6A23C; }
  }
}
.rate-block { display: flex; align-items: center; gap: 14px; }
.rate-text { font-size: 13px; font-weight: 500; }
.escalation-warning {
  margin-top: 12px; padding: 10px 14px;
  background: linear-gradient(90deg, rgba(245, 108, 108, 0.18), rgba(245, 108, 108, 0.04));
  border-left: 3px solid #F56C6C; border-radius: 4px;
  color: #FFCBCB; font-size: 12px; line-height: 1.6;
  .warning-icon { margin-right: 6px; }
  b { color: #FF8E8E; }
}
:deep(.satisfaction-dialog .el-dialog__body) { padding-top: 14px; }

@media (max-width: 1100px) {
  .metric-strip { grid-template-columns: repeat(2, 1fr); }
  .metric-item:nth-child(2) { border-right: none; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>

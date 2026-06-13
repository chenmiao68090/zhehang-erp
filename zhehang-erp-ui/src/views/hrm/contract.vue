<template>
  <div class="task-page hrm-contract">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">HRM · 04 / CONTRACT</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">劳动合同管理</span>
          <span class="title-en">Labor Contract</span>
        </h1>
        <p class="page-desc">员工劳动合同的签订、续签与到期管理</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <el-alert
      class="contract-notice"
      type="info"
      :closable="false"
      show-icon
      title="合同台账基于员工档案中的合同起止日期实时生成"
      description="合同类型、电子签署、模板与续签审批等独立劳动合同模块尚在规划中,以下「合同类型」为按期限推断的示例标签,待专属接口开放后接入。"
    />

    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">合同工作台</h2>
        <span class="section-sub">CONTRACT / LIST</span>
      </div>
      <ModuleWorkbench
        v-loading="loading"
        title="劳动合同台账"
        eyebrow="SIGN / RENEW / TERMINATE"
        :columns="columns"
        :records="records"
        :steps="steps"
        :alerts="alerts"
        :actions="actions"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import ModuleWorkbench from '@/components/common/ModuleWorkbench.vue'
import { employeeApi } from '@/api/org'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)

const columns = [
  { prop: 'employee', label: '员工', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'type', label: '合同类型', width: 110 },
  { prop: 'startDate', label: '开始日期', width: 120 },
  { prop: 'endDate', label: '到期日期', width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 100 }
]

const records = ref<Record<string, string | number>[]>([])

const metrics = ref([
  { label: '生效中', value: '-' },
  { label: '即将到期', value: '-' },
  { label: '已过期', value: '-' },
  { label: '未登记', value: '-' }
])

const steps = [
  { title: '合同生成', desc: '根据岗位、薪酬和合同模板生成文本', status: 'done' as const },
  { title: '电子签署', desc: '同步员工签署状态和归档附件', status: 'active' as const },
  { title: '到期预警', desc: '提前 30/15/7 天提醒负责人续签', status: 'pending' as const },
  { title: '终止归档', desc: '离职或终止后沉淀历史合同记录', status: 'pending' as const }
]

const alerts = [
  '即将到期合同需要自动联动员工负责人和部门经理。',
  '合同模板应按城市、岗位类型和用工形式区分。',
  '电子签署附件需要同步进入人员档案。'
]

const actions = [
  { label: '新建合同', icon: 'add' as const },
  { label: '刷新台账', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出台账', type: 'info' as const, icon: 'export' as const }
]

function fmtDate(v: any): string {
  if (!v) return '-'
  return String(v).slice(0, 10)
}

// 依据合同起止日期推断状态:未登记 / 已过期 / 即将到期(90天内) / 生效中
function contractStatus(end: any): { label: string; bucket: string } {
  if (!end) return { label: '未登记', bucket: 'none' }
  const endTime = new Date(String(end).slice(0, 10)).getTime()
  if (Number.isNaN(endTime)) return { label: '未登记', bucket: 'none' }
  const now = Date.now()
  const days = Math.floor((endTime - now) / 86400000)
  if (days < 0) return { label: '已过期', bucket: 'expired' }
  if (days <= 90) return { label: '即将到期', bucket: 'expiring' }
  return { label: '生效中', bucket: 'active' }
}

// 按合同期限粗略推断类型(示例标签,非后端真实字段)
function contractType(start: any, end: any): string {
  if (!start || !end) return '—'
  const s = new Date(String(start).slice(0, 10)).getTime()
  const e = new Date(String(end).slice(0, 10)).getTime()
  if (Number.isNaN(s) || Number.isNaN(e)) return '—'
  const years = (e - s) / (86400000 * 365)
  if (years <= 1) return '固定期限(1年)'
  if (years <= 3) return '固定期限(3年)'
  return '固定期限'
}

async function loadData() {
  loading.value = true
  try {
    // 无独立劳动合同接口;复用 /org/employee/list 中的 contractStart/contractEnd 生成台账
    // 注:request 拦截器返回完整 R 包体,分页数据在 res.data.records
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 200 })
    const rows: any[] = res?.data?.records || []
    const counts = { active: 0, expiring: 0, expired: 0, none: 0 }
    records.value = rows.map((e) => {
      const st = contractStatus(e.contractEnd)
      counts[st.bucket as keyof typeof counts]++
      return {
        employee: e.name || '-',
        dept: e.deptName || '-',
        type: contractType(e.contractStart, e.contractEnd),
        startDate: fmtDate(e.contractStart),
        endDate: fmtDate(e.contractEnd),
        status: st.label
      }
    })
    metrics.value = [
      { label: '生效中', value: String(counts.active) },
      { label: '即将到期', value: String(counts.expiring) },
      { label: '已过期', value: String(counts.expired) },
      { label: '未登记', value: String(counts.none) }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './hrm-common.scss';

.contract-notice {
  margin-bottom: 16px;
}
</style>

<template>
  <div class="task-page hrm-interview">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">HRM · 02 / INTERVIEW</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">面试管理</span>
          <span class="title-en">Interview</span>
        </h1>
        <p class="page-desc">候选人面试进度、评估记录与录用跟踪</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">面试工作台</h2>
        <span class="section-sub">INTERVIEW / SCHEDULE</span>
      </div>
      <ModuleWorkbench
        v-loading="loading"
        title="候选人面试进度"
        eyebrow="CANDIDATE / INTERVIEW / OFFER"
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
import { resumeApi } from '@/api/hrm'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)

// 简历/面试状态:0待筛选 1面试中 2已录用 3已淘汰(与后端 HrmResume.status 一致)
const STATUS_MAP: Record<number, string> = { 0: '待筛选', 1: '面试中', 2: '已录用', 3: '已淘汰' }

const columns = [
  { prop: 'candidate', label: '候选人', width: 110 },
  { prop: 'education', label: '学历', width: 90 },
  { prop: 'experience', label: '工作年限', width: 100 },
  { prop: 'company', label: '现任公司', width: 150 },
  { prop: 'expectedSalary', label: '期望薪资', type: 'amount' as const, width: 110 },
  { prop: 'status', label: '面试状态', type: 'tag' as const, width: 100 },
  { prop: 'evaluation', label: '面试评价', width: 160 }
]

const records = ref<Record<string, string | number>[]>([])

const metrics = ref([
  { label: '候选人总数', value: '-' },
  { label: '待筛选', value: '-' },
  { label: '面试中', value: '-' },
  { label: '已录用', value: '-' }
])

const steps = [
  { title: '简历筛选', desc: '按岗位条件和来源质量完成初筛', status: 'done' as const },
  { title: '面试评估', desc: '记录面试评分和录用建议', status: 'active' as const },
  { title: '录用决策', desc: '汇总评价确定录用或淘汰', status: 'pending' as const },
  { title: 'Offer 跟进', desc: '录用后进入入职准备和建档', status: 'pending' as const }
]

const alerts = [
  '候选人简历含联系方式、期望薪资等敏感信息,仅 HR / 管理员可见。',
  '录用候选人应自动联动入职建档与人员档案。',
  '长期停留在面试中的候选人需要提醒面试官及时反馈。'
]

const actions = [
  { label: '登记候选人', icon: 'add' as const },
  { label: '刷新列表', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出名单', type: 'info' as const, icon: 'export' as const }
]

function fmtSalary(v: any): string {
  if (v === null || v === undefined || v === '') return '-'
  const n = Number(v)
  if (Number.isNaN(n)) return String(v)
  return `${(n / 1000).toFixed(0)}K`
}

async function loadData() {
  loading.value = true
  try {
    // /hrm/resume/list:候选人(简历)即面试管道;后端按 HR/管理员做数据范围,非授权返回空
    // 注:request 拦截器返回完整 R 包体,分页数据在 res.data.records / res.data.total
    const res: any = await resumeApi.list({ pageNum: 1, pageSize: 200 })
    const rows: any[] = res?.data?.records || []
    records.value = rows.map((r) => ({
      candidate: r.name || '-',
      education: r.education || '-',
      experience: r.experienceYears != null ? `${r.experienceYears} 年` : '-',
      company: r.currentCompany || '-',
      expectedSalary: fmtSalary(r.expectedSalary),
      status: STATUS_MAP[r.status] ?? '未知',
      evaluation: r.evaluation || '—'
    }))
    const total = res?.data?.total ?? rows.length
    metrics.value = [
      { label: '候选人总数', value: String(total) },
      { label: '待筛选', value: String(rows.filter((r) => r.status === 0).length) },
      { label: '面试中', value: String(rows.filter((r) => r.status === 1).length) },
      { label: '已录用', value: String(rows.filter((r) => r.status === 2).length) }
    ]
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './hrm-common.scss';
</style>

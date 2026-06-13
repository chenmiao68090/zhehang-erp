<template>
  <div class="task-page hrm-archive">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">HRM · 05 / ARCHIVE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">人员档案管理</span>
          <span class="title-en">Personnel Archive</span>
        </h1>
        <p class="page-desc">员工个人信息档案的建立与维护</p>
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
        <h2 class="section-title">档案工作台</h2>
        <span class="section-sub">ARCHIVE / RECORDS</span>
      </div>
      <ModuleWorkbench
        v-loading="loading"
        title="人员档案台账"
        eyebrow="PROFILE / DOCUMENT / HISTORY"
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

// 员工状态：1在职 2试用 3离职(与后端 OrgEmployee.status 一致)
const STATUS_MAP: Record<number, string> = { 1: '在职', 2: '试用', 3: '离职' }

const columns = [
  { prop: 'employee', label: '员工', width: 100 },
  { prop: 'empCode', label: '工号', width: 110 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'position', label: '岗位', width: 140 },
  { prop: 'entryDate', label: '入职日期', width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 90 },
  { prop: 'phone', label: '联系电话', width: 130 }
]

const records = ref<Record<string, string | number>[]>([])

const metrics = ref([
  { label: '在职人数', value: '-' },
  { label: '试用人数', value: '-' },
  { label: '离职人数', value: '-' },
  { label: '档案总数', value: '-' }
])

const steps = [
  { title: '入职建档', desc: '入职时创建基础信息和组织归属', status: 'done' as const },
  { title: '材料收集', desc: '身份证明、学历、银行卡和合同附件', status: 'active' as const },
  { title: '变动记录', desc: '记录调岗、调薪、合同和奖惩历史', status: 'pending' as const },
  { title: '离职封存', desc: '离职后归档交接、结算和证明材料', status: 'pending' as const }
]

const alerts = [
  '档案信息不完整的员工需要自动提醒补充材料。',
  '证件到期、合同附件缺失应进入人事待办。',
  '员工组织变动需要同步更新权限和审批链。'
]

const actions = [
  { label: '新增档案', icon: 'add' as const },
  { label: '刷新列表', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出名册', type: 'info' as const, icon: 'export' as const }
]

function fmtDate(v: any): string {
  if (!v) return '-'
  return String(v).slice(0, 10)
}

async function loadData() {
  loading.value = true
  try {
    // /org/employee/list 拉全量(分页取大页);敏感字段(身份证)不展示
    // 注:request 拦截器返回完整 R 包体,分页数据在 res.data.records / res.data.total
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 200 })
    const rows: any[] = res?.data?.records || []
    records.value = rows.map((e) => ({
      employee: e.name || '-',
      empCode: e.empCode || '-',
      dept: e.deptName || '-',
      position: e.postName || '-',
      entryDate: fmtDate(e.hireDate),
      status: STATUS_MAP[e.status] || '未知',
      phone: e.phone || '-'
    }))
    const total = res?.data?.total ?? rows.length
    const onJob = rows.filter((e) => e.status === 1).length
    const probation = rows.filter((e) => e.status === 2).length
    const left = rows.filter((e) => e.status === 3).length
    metrics.value = [
      { label: '在职人数', value: String(onJob) },
      { label: '试用人数', value: String(probation) },
      { label: '离职人数', value: String(left) },
      { label: '档案总数', value: String(total) }
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

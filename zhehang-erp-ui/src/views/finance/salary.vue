<template>
  <div class="task-page finance-salary">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 05 / SALARY</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">薪酬管理</span>
          <span class="title-en">Salary Management</span>
        </h1>
        <p class="page-desc">员工薪资核算、发放与统计分析</p>
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
        <h2 class="section-title">薪酬工作台</h2>
        <span class="section-sub">SALARY / DETAILS</span>
      </div>
      <ModuleWorkbench
        title="月度薪酬核算"
        eyebrow="PAYROLL / TAX / PAYMENT"
        :columns="columns"
        :records="records"
        :steps="steps"
        :alerts="alerts"
        :actions="actions"
      />
      <el-empty v-if="!loading && records.length === 0" description="暂无数据" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModuleWorkbench from '@/components/common/ModuleWorkbench.vue'
import { salaryApi } from '@/api/hrm'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:HrmSalaryController /hrm/salary/list（数据范围:HR/管理员看全部,其余只看自己工资条）
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '应发总额', value: '¥0' },
  { label: '实发总额', value: '¥0' },
  { label: '待发放', value: '0' },
  { label: '已发放', value: '0' }
])

const columns = [
  { prop: 'salaryMonth', label: '薪资月份', width: 120 },
  { prop: 'employeeId', label: '员工ID', width: 110 },
  { prop: 'gross', label: '应发', type: 'amount' as const, width: 120 },
  { prop: 'net', label: '实发', type: 'amount' as const, width: 120 },
  { prop: 'tax', label: '个税社保公积金', type: 'amount' as const, width: 140 },
  { prop: 'statusText', label: '状态', type: 'tag' as const, width: 110 }
]

const records = ref<Record<string, string | number>[]>([])

const steps = [
  { title: '考勤汇总', desc: '同步考勤、请假和入离职变动', status: 'done' as const },
  { title: '薪资计算', desc: '计算基本工资、绩效、提成和扣款', status: 'active' as const },
  { title: '人事确认', desc: '确认异常项并冻结本月批次', status: 'pending' as const },
  { title: '财务发放', desc: '生成付款单并回写发放结果', status: 'pending' as const }
]

const alerts = [
  '薪资批次冻结后仅允许通过调整单修正。',
  '发薪范围应自动排除已离职且无补发员工。',
  '薪酬明细导出需要按角色控制可见字段。'
]

const actions = [
  { label: '新建批次', icon: 'add' as const },
  { label: '重新计算', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出工资条', type: 'info' as const, icon: 'export' as const }
]

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const STATUS_MAP: Record<number, string> = { 0: '待核算', 1: '已核算', 2: '已发放' }

async function loadData() {
  loading.value = true
  try {
    const res: any = await salaryApi.list({ pageNum: 1, pageSize: 100 })
    const list: any[] = res?.records || []
    records.value = list.map((it) => {
      const base = Number(it.baseSalary ?? 0)
      const perf = Number(it.performanceBonus ?? 0)
      const ot = Number(it.overtimePay ?? 0)
      const allow = Number(it.allowance ?? 0)
      const gross = base + perf + ot + allow
      const taxSum = Number(it.tax ?? 0) + Number(it.socialInsurance ?? 0) + Number(it.housingFund ?? 0)
      return {
        salaryMonth: it.salaryMonth ?? '-',
        employeeId: it.employeeId ?? '-',
        gross: money(gross),
        net: money(it.actualSalary ?? (gross - taxSum - Number(it.deduction ?? 0))),
        tax: money(taxSum),
        statusText: STATUS_MAP[it.status] ?? '未知'
      }
    })

    // 指标:基于本页明细汇总
    const grossTotal = list.reduce((s, it) => s + Number(it.baseSalary ?? 0) + Number(it.performanceBonus ?? 0) + Number(it.overtimePay ?? 0) + Number(it.allowance ?? 0), 0)
    const netTotal = list.reduce((s, it) => s + Number(it.actualSalary ?? 0), 0)
    const pending = list.filter((it) => it.status === 0 || it.status === 1).length
    const paid = list.filter((it) => it.status === 2).length
    metrics.value = [
      { label: '应发总额', value: money(grossTotal) },
      { label: '实发总额', value: money(netTotal) },
      { label: '待发放', value: String(pending) },
      { label: '已发放', value: String(paid) }
    ]
  } catch (e) {
    records.value = []
  } finally {
    loading.value = false
  }
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

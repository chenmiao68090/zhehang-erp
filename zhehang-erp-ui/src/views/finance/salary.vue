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
    </section>
  </div>
</template>

<script setup lang="ts">
import ModuleWorkbench from '@/components/common/ModuleWorkbench.vue'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '应发总额', value: '¥812,400' },
  { label: '实发总额', value: '¥728,960' },
  { label: '待确认', value: '8' },
  { label: '已发放', value: '126' }
]

const columns = [
  { prop: 'batch', label: '批次', width: 120 },
  { prop: 'scope', label: '发薪范围' },
  { prop: 'gross', label: '应发', type: 'amount' as const, width: 120 },
  { prop: 'net', label: '实发', type: 'amount' as const, width: 120 },
  { prop: 'tax', label: '个税社保', type: 'amount' as const, width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '处理人', width: 100 }
]

const records = [
  { batch: 'PAY-2024-06', scope: '全员月薪', gross: '¥812,400', net: '¥728,960', tax: '¥83,440', status: '人事确认', owner: 'HRBP' },
  { batch: 'BON-2024-Q2', scope: '季度绩效奖金', gross: '¥186,000', net: '¥160,820', tax: '¥25,180', status: '财务复核', owner: '薪酬专员' },
  { batch: 'COM-2024-05', scope: '销售提成', gross: '¥94,500', net: '¥86,100', tax: '¥8,400', status: '待发放', owner: '财务' },
  { batch: 'ADJ-2024-05', scope: '补发调薪', gross: '¥18,600', net: '¥17,260', tax: '¥1,340', status: '已发放', owner: '出纳' }
]

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
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

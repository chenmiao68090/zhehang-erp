<template>
  <div class="task-page finance-expense">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 03 / EXPENSE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">业务支出管理</span>
          <span class="title-en">Business Expense</span>
        </h1>
        <p class="page-desc">业务相关支出的申请、审批与追踪</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="示例数据，对应后端模块待开发"
      description="“业务支出管理”暂无对应后端接口。以下内容为界面示例，接口就绪后接入真实数据。"
      class="demo-alert"
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
        <h2 class="section-title">支出工作台</h2>
        <span class="section-sub">EXPENSE / RECORDS</span>
      </div>
      <ModuleWorkbench
        title="业务支出审批"
        eyebrow="BUDGET / PAYMENT / TRACKING"
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
  { label: '本月支出', value: '¥386,420' },
  { label: '待审批', value: '14' },
  { label: '已通过', value: '52' },
  { label: '预算占用', value: '68%' }
]

const columns = [
  { prop: 'code', label: '单据号', width: 124 },
  { prop: 'category', label: '支出类别', width: 120 },
  { prop: 'project', label: '关联项目' },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 120 },
  { prop: 'payDate', label: '计划付款', width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '负责人', width: 100 }
]

const records = [
  { code: 'EX-240621', category: '市场投放', project: '华东线索增长计划', amount: '¥86,000', payDate: '06-06', status: '审批中', owner: '市场总监' },
  { code: 'EX-240617', category: '项目实施', project: '宁波海纳交付', amount: '¥42,800', payDate: '06-04', status: '待付款', owner: '财务' },
  { code: 'EX-240606', category: '渠道返点', project: '渠道合作激励', amount: '¥118,500', payDate: '06-10', status: '预算复核', owner: '经营办' },
  { code: 'EX-240598', category: '行政采购', project: '办公设备更新', amount: '¥19,120', payDate: '06-03', status: '已通过', owner: '行政' }
]

const steps = [
  { title: '支出立项', desc: '记录预算科目、项目归属和付款对象', status: 'done' as const },
  { title: '预算校验', desc: '校验预算余额并提示超支风险', status: 'active' as const },
  { title: '审批流转', desc: '按金额和科目自动匹配审批链路', status: 'pending' as const },
  { title: '付款归档', desc: '付款后同步日记账和凭证附件', status: 'pending' as const }
]

const alerts = [
  '市场投放类支出需要和线索转化效果关联。',
  '超过预算 80% 的科目应提前提醒经营负责人。',
  '付款完成后需自动生成费用归集记录。'
]

const actions = [
  { label: '新增支出', icon: 'add' as const },
  { label: '刷新预算', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出明细', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

<template>
  <div class="task-page finance-reimburse">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 04 / REIMBURSE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">报销管理</span>
          <span class="title-en">Reimbursement</span>
        </h1>
        <p class="page-desc">员工费用报销的提交、审批与结算</p>
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
        <h2 class="section-title">报销工作台</h2>
        <span class="section-sub">REIMBURSE / CLAIMS</span>
      </div>
      <ModuleWorkbench
        title="员工报销单据"
        eyebrow="CLAIM / APPROVAL / SETTLEMENT"
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
  { label: '待报销', value: '21' },
  { label: '审批中', value: '9' },
  { label: '已报销', value: '74' },
  { label: '本月总额', value: '¥92,360' }
]

const columns = [
  { prop: 'code', label: '报销号', width: 124 },
  { prop: 'employee', label: '员工', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'type', label: '费用类型', width: 120 },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'submitAt', label: '提交时间', width: 110 }
]

const records = [
  { code: 'RB-240702', employee: '林珂', dept: '销售二部', type: '差旅费', amount: '¥6,840', status: '主管审批', submitAt: '06-01' },
  { code: 'RB-240699', employee: '方敏', dept: '实施部', type: '住宿费', amount: '¥3,260', status: '财务复核', submitAt: '05-31' },
  { code: 'RB-240688', employee: '赵岩', dept: '渠道部', type: '招待费', amount: '¥2,480', status: '待补票', submitAt: '05-30' },
  { code: 'RB-240670', employee: '何晴', dept: '客服部', type: '交通费', amount: '¥680', status: '已报销', submitAt: '05-29' }
]

const steps = [
  { title: '票据提交', desc: '员工上传发票、行程和费用说明', status: 'done' as const },
  { title: '主管审批', desc: '确认费用真实性和业务关联性', status: 'active' as const },
  { title: '财务复核', desc: '校验票据合规性和报销标准', status: 'pending' as const },
  { title: '打款结算', desc: '批量付款并生成报销凭证', status: 'pending' as const }
]

const alerts = [
  '缺少发票或行程单的报销应进入待补票队列。',
  '招待费需要按客户和商机关联，便于成本核算。',
  '同一行程重复报销需要做金额和日期碰撞检查。'
]

const actions = [
  { label: '发起报销', icon: 'add' as const },
  { label: '批量审核', type: 'success' as const, icon: 'approve' as const },
  { label: '导出报表', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

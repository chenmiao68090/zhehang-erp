<template>
  <div class="task-page finance-petty-cash">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 02 / PETTY-CASH</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">备用金管理</span>
          <span class="title-en">Petty Cash</span>
        </h1>
        <p class="page-desc">备用金申领、使用与归还的全流程管理</p>
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
      description="“备用金管理”暂无对应后端接口。以下内容为界面示例，接口就绪后接入真实数据。"
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
        <h2 class="section-title">备用金工作台</h2>
        <span class="section-sub">PETTY-CASH / RECORDS</span>
      </div>
      <ModuleWorkbench
        title="备用金流转台账"
        eyebrow="APPLICATION / AUDIT / RETURN"
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
  { label: '备用金总额', value: '¥126,000' },
  { label: '已借出', value: '¥48,500' },
  { label: '已归还', value: '¥31,200' },
  { label: '待审批', value: '6' }
]

const columns = [
  { prop: 'code', label: '单号', width: 120 },
  { prop: 'applicant', label: '申请人', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 120 },
  { prop: 'purpose', label: '用途' },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '当前处理', width: 110 }
]

const records = [
  { code: 'PC-240601', applicant: '沈琳', dept: '销售一部', amount: '¥8,000', purpose: '客户拜访差旅周转', status: '财务复核', owner: '财务经理' },
  { code: 'PC-240598', applicant: '周琪', dept: '供应链部', amount: '¥12,500', purpose: '临时采购垫付', status: '待归还', owner: '申请人' },
  { code: 'PC-240586', applicant: '宋佳', dept: '行政部', amount: '¥3,200', purpose: '会议物料采购', status: '已结清', owner: '出纳' },
  { code: 'PC-240571', applicant: '蒋浩', dept: '实施部', amount: '¥24,800', purpose: '外地项目驻场', status: '逾期预警', owner: '部门负责人' }
]

const steps = [
  { title: '申领登记', desc: '申请人提交用途、预算和归还日期', status: 'done' as const },
  { title: '部门确认', desc: '负责人确认业务必要性和额度', status: 'done' as const },
  { title: '财务复核', desc: '核对预算科目并完成付款', status: 'active' as const },
  { title: '归还核销', desc: '凭票核销剩余额度并归档', status: 'pending' as const }
]

const alerts = [
  '超过归还日期的备用金需要自动生成催办。',
  '同一申请人连续借款时应校验未核销余额。',
  '备用金付款应和日记账流水形成关联凭证。'
]

const actions = [
  { label: '新建申请', icon: 'add' as const },
  { label: '批量复核', type: 'success' as const, icon: 'approve' as const },
  { label: '导出', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

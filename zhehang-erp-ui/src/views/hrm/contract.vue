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

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '生效中', value: '132' },
  { label: '即将到期', value: '11' },
  { label: '待续签', value: '7' },
  { label: '已终止', value: '4' }
]

const columns = [
  { prop: 'employee', label: '员工', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'type', label: '合同类型', width: 120 },
  { prop: 'startDate', label: '开始日期', width: 110 },
  { prop: 'endDate', label: '到期日期', width: 110 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '负责人', width: 100 }
]

const records = [
  { employee: '王若溪', dept: '销售中心', type: '固定期限', startDate: '2022-07-01', endDate: '2024-06-30', status: '待续签', owner: 'HRBP' },
  { employee: '丁凯', dept: '技术部', type: '无固定期限', startDate: '2021-04-15', endDate: '长期', status: '生效中', owner: '人事专员' },
  { employee: '刘佳', dept: '客服部', type: '固定期限', startDate: '2023-07-10', endDate: '2024-07-09', status: '即将到期', owner: 'HRBP' },
  { employee: '钱越', dept: '渠道部', type: '实习协议', startDate: '2024-04-01', endDate: '2024-09-30', status: '生效中', owner: '人事专员' }
]

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
  { label: '批量续签', type: 'success' as const, icon: 'approve' as const },
  { label: '导出台账', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './hrm-common.scss';
</style>

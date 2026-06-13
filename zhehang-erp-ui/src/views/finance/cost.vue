<template>
  <div class="task-page finance-cost">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 06 / COST</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">公司管理成本支出</span>
          <span class="title-en">Management Cost</span>
        </h1>
        <p class="page-desc">公司运营与管理成本的统计与控制</p>
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
      description="“公司管理成本支出”暂无对应后端接口（现有 BizChannelCostController 仅为渠道成本，非管理成本）。以下内容为界面示例，接口就绪后接入真实数据。"
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
        <h2 class="section-title">成本工作台</h2>
        <span class="section-sub">COST / BREAKDOWN</span>
      </div>
      <ModuleWorkbench
        title="管理成本归集"
        eyebrow="BUDGET / ALLOCATION / CONTROL"
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
  { label: '本月成本', value: '¥542,800' },
  { label: '环比增长', value: '+6.4%' },
  { label: '预算使用', value: '71%' },
  { label: '超支项', value: '3' }
]

const columns = [
  { prop: 'category', label: '成本科目', width: 140 },
  { prop: 'ownerDept', label: '归属部门', width: 120 },
  { prop: 'amount', label: '本月金额', type: 'amount' as const, width: 120 },
  { prop: 'budgetRate', label: '预算使用', width: 110 },
  { prop: 'trend', label: '趋势', width: 90 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '责任人', width: 100 }
]

const records = [
  { category: '办公租赁', ownerDept: '行政部', amount: '¥168,000', budgetRate: '74%', trend: '+2.1%', status: '正常', owner: '行政经理' },
  { category: '云服务资源', ownerDept: '技术部', amount: '¥72,600', budgetRate: '86%', trend: '+18.4%', status: '预警', owner: '技术负责人' },
  { category: '招聘渠道', ownerDept: '人事部', amount: '¥38,200', budgetRate: '93%', trend: '+22.8%', status: '超支风险', owner: 'HRD' },
  { category: '车辆与差旅', ownerDept: '销售部', amount: '¥96,500', budgetRate: '68%', trend: '-4.5%', status: '正常', owner: '销售总监' }
]

const steps = [
  { title: '科目建模', desc: '定义成本科目、归属部门和预算规则', status: 'done' as const },
  { title: '费用归集', desc: '从支出、报销和采购流水自动汇总', status: 'active' as const },
  { title: '预算预警', desc: '按月度预算阈值触发提醒和审批', status: 'pending' as const },
  { title: '经营分析', desc: '输出部门成本趋势和降本建议', status: 'pending' as const }
]

const alerts = [
  '云服务成本建议接入用量明细，定位增长来源。',
  '招聘渠道已接近预算上限，需要 HRD 确认后续投放。',
  '成本科目应和业务支出、报销模块共用枚举。'
]

const actions = [
  { label: '新增科目', icon: 'add' as const },
  { label: '刷新归集', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出分析', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

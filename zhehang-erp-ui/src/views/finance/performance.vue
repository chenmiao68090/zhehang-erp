<template>
  <div class="task-page finance-performance">
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FIN · 07 / PERFORMANCE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">绩效管理</span>
          <span class="title-en">Performance</span>
        </h1>
        <p class="page-desc">员工绩效考核指标设定与结果评估</p>
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
        <h2 class="section-title">绩效工作台</h2>
        <span class="section-sub">PERFORMANCE / EVALUATION</span>
      </div>
      <ModuleWorkbench
        title="绩效考核周期"
        eyebrow="TARGET / REVIEW / BONUS"
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
  { label: '考核周期', value: '2024 Q2' },
  { label: '待评估', value: '18' },
  { label: '已完成', value: '96' },
  { label: '平均得分', value: '86.5' }
]

const columns = [
  { prop: 'name', label: '考核对象', width: 120 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'target', label: '关键指标' },
  { prop: 'score', label: '当前得分', width: 100 },
  { prop: 'bonus', label: '奖金影响', type: 'amount' as const, width: 120 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'reviewer', label: '评估人', width: 100 }
]

const records = [
  { name: '销售一组', dept: '销售中心', target: '回款完成率 / 新签合同额', score: '91.2', bonus: '¥42,000', status: '已完成', reviewer: '销售总监' },
  { name: '实施交付组', dept: '交付中心', target: '项目准时率 / 客户满意度', score: '88.6', bonus: '¥28,000', status: '复核中', reviewer: '交付总监' },
  { name: '渠道运营组', dept: '渠道部', target: '渠道贡献 / 活跃伙伴数', score: '79.4', bonus: '¥16,000', status: '待评估', reviewer: '经营办' },
  { name: '客服团队', dept: '客服部', target: '响应时长 / 工单关闭率', score: '86.8', bonus: '¥21,000', status: '已完成', reviewer: '客服经理' }
]

const steps = [
  { title: '目标设定', desc: '按岗位、部门和业务目标设置指标权重', status: 'done' as const },
  { title: '过程采集', desc: '从业务、任务和财务模块汇总数据', status: 'done' as const },
  { title: '主管评分', desc: '结合定量结果和管理评价形成得分', status: 'active' as const },
  { title: '奖金联动', desc: '确认绩效系数并同步薪酬批次', status: 'pending' as const }
]

const alerts = [
  '绩效得分应保留数据来源，避免人工评分不可追溯。',
  '奖金影响需要和薪酬模块统一口径。',
  '低于 80 分的团队建议自动进入改进计划。'
]

const actions = [
  { label: '新建周期', icon: 'add' as const },
  { label: '批量评分', type: 'success' as const, icon: 'approve' as const },
  { label: '导出结果', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './finance-common.scss';
</style>

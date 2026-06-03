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
        <p class="page-desc">面试流程安排、评估记录与结果跟踪</p>
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
        title="候选人面试排期"
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

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '待面试', value: '24' },
  { label: '今日安排', value: '7' },
  { label: '已通过', value: '12' },
  { label: '待定', value: '5' }
]

const columns = [
  { prop: 'candidate', label: '候选人', width: 110 },
  { prop: 'position', label: '应聘岗位', width: 140 },
  { prop: 'round', label: '轮次', width: 90 },
  { prop: 'time', label: '面试时间', width: 130 },
  { prop: 'interviewer', label: '面试官', width: 110 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'source', label: '来源', width: 110 }
]

const records = [
  { candidate: '陈一诺', position: '客户成功经理', round: '二面', time: '06-01 14:00', interviewer: '林总', status: '待面试', source: 'Boss直聘' },
  { candidate: '许泽', position: 'Java工程师', round: '技术面', time: '06-01 16:30', interviewer: '技术负责人', status: '进行中', source: '内推' },
  { candidate: '叶青', position: '实施顾问', round: '终面', time: '06-02 10:00', interviewer: '交付总监', status: '已通过', source: '猎头' },
  { candidate: '罗鸣', position: '销售代表', round: '初面', time: '06-02 15:00', interviewer: '销售经理', status: '待定', source: '招聘会' }
]

const steps = [
  { title: '简历筛选', desc: '按岗位条件和来源质量完成初筛', status: 'done' as const },
  { title: '面试排期', desc: '协调候选人、面试官和会议资源', status: 'active' as const },
  { title: '评价汇总', desc: '沉淀面试评分和录用建议', status: 'pending' as const },
  { title: 'Offer 跟进', desc: '通过后进入录用审批和入职准备', status: 'pending' as const }
]

const alerts = [
  '终面通过候选人应自动生成 Offer 审批。',
  '超过 48 小时未填写评价的面试需要提醒面试官。',
  '候选人来源应同步到招聘渠道效果分析。'
]

const actions = [
  { label: '安排面试', icon: 'add' as const },
  { label: '同步日程', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出排期', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './hrm-common.scss';
</style>

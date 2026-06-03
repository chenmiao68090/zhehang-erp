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
        title="人员档案完整度"
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

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const metrics = [
  { label: '在职人数', value: '136' },
  { label: '本月入职', value: '8' },
  { label: '本月离职', value: '2' },
  { label: '待完善', value: '13' }
]

const columns = [
  { prop: 'employee', label: '员工', width: 100 },
  { prop: 'dept', label: '部门', width: 120 },
  { prop: 'position', label: '岗位', width: 140 },
  { prop: 'entryDate', label: '入职日期', width: 110 },
  { prop: 'completeRate', label: '完整度', width: 100 },
  { prop: 'status', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'owner', label: '负责人', width: 100 }
]

const records = [
  { employee: '沈一凡', dept: '实施部', position: '实施顾问', entryDate: '2024-05-20', completeRate: '92%', status: '正常', owner: 'HRBP' },
  { employee: '孟琪', dept: '销售中心', position: '销售代表', entryDate: '2024-05-27', completeRate: '76%', status: '待完善', owner: '人事专员' },
  { employee: '张逸', dept: '技术部', position: '前端工程师', entryDate: '2023-09-12', completeRate: '98%', status: '正常', owner: 'HRBP' },
  { employee: '顾航', dept: '渠道部', position: '渠道经理', entryDate: '2022-11-03', completeRate: '81%', status: '证件预警', owner: '人事专员' }
]

const steps = [
  { title: '入职建档', desc: '入职时创建基础信息和组织归属', status: 'done' as const },
  { title: '材料收集', desc: '身份证明、学历、银行卡和合同附件', status: 'active' as const },
  { title: '变动记录', desc: '记录调岗、调薪、合同和奖惩历史', status: 'pending' as const },
  { title: '离职封存', desc: '离职后归档交接、结算和证明材料', status: 'pending' as const }
]

const alerts = [
  '档案完整度低于 80% 的员工需要自动提醒补充材料。',
  '证件到期、合同附件缺失应进入人事待办。',
  '员工组织变动需要同步更新权限和审批链。'
]

const actions = [
  { label: '新增档案', icon: 'add' as const },
  { label: '刷新完整度', type: 'info' as const, icon: 'refresh' as const },
  { label: '导出名册', type: 'info' as const, icon: 'export' as const }
]
</script>

<style lang="scss" scoped>
@use './hrm-common.scss';
</style>

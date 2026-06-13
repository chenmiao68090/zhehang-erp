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
      <el-empty v-if="!loading && records.length === 0" description="暂无数据" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import ModuleWorkbench from '@/components/common/ModuleWorkbench.vue'
import { reimburseApi } from '@/api/finance'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// 真实接口:FinanceReimburseController /finance/reimburse/list（数据范围按申请人/财务）
const loading = ref(false)
const metrics = ref<{ label: string; value: string }[]>([
  { label: '待审批', value: '0' },
  { label: '已通过', value: '0' },
  { label: '已付款', value: '0' },
  { label: '报销总额', value: '¥0' }
])

const columns = [
  { prop: 'reimburseNo', label: '报销号', width: 160 },
  { prop: 'title', label: '报销事由' },
  { prop: 'applicantId', label: '申请人ID', width: 110 },
  { prop: 'amount', label: '金额', type: 'amount' as const, width: 130 },
  { prop: 'statusText', label: '状态', type: 'tag' as const, width: 110 },
  { prop: 'createTime', label: '提交时间', width: 170 }
]

const records = ref<Record<string, string | number>[]>([])

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

function money(val: any): string {
  const n = Number(val ?? 0)
  return '¥' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 0草稿 1待审 2通过 3驳回 4已付
const STATUS_MAP: Record<number, string> = { 0: '草稿', 1: '待审批', 2: '已通过', 3: '已驳回', 4: '已付款' }

async function loadData() {
  loading.value = true
  try {
    const res: any = await reimburseApi.list({ pageNum: 1, pageSize: 100 })
    const list: any[] = res?.records || []
    records.value = list.map((it) => ({
      reimburseNo: it.reimburseNo ?? '-',
      title: it.title ?? '-',
      applicantId: it.applicantId ?? '-',
      amount: money(it.totalAmount),
      statusText: STATUS_MAP[it.status] ?? '未知',
      createTime: it.createTime ?? '-'
    }))

    const total = list.reduce((s, it) => s + Number(it.totalAmount ?? 0), 0)
    const pending = list.filter((it) => it.status === 1).length
    const approved = list.filter((it) => it.status === 2).length
    const paid = list.filter((it) => it.status === 4).length
    metrics.value = [
      { label: '待审批', value: String(pending) },
      { label: '已通过', value: String(approved) },
      { label: '已付款', value: String(paid) },
      { label: '报销总额', value: money(total) }
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

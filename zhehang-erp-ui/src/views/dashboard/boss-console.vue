<template>
  <div class="bc-page" v-loading="loading">
    <!-- 顶部 -->
    <div class="bc-head">
      <div class="bc-head-l">
        <h2>老板总控台</h2>
        <span>{{ todayText }} · 只看今天最急的问题和结果</span>
      </div>
      <el-button size="small" @click="load">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <!-- ① 红灯告警:今天需要你关注 -->
    <div class="bc-alert">
      <div class="bc-alert-h"><el-icon><Warning /></el-icon> 今天需要你关注（点数字看名单）</div>
      <div class="bc-alert-grid">
        <div class="bc-alert-item" @click="go('/customer-issue/list', { view: 'overdue' })">
          <b>{{ issue.overdue }}</b><span>逾期工单</span>
        </div>
        <div class="bc-alert-item" @click="go('/customer-issue/list', { view: 'p0' })">
          <b>{{ issue.p0 }}</b><span>P0 工单</span>
        </div>
        <div class="bc-alert-item" @click="go('/order/bookkeeping', { view: 'overdue' })">
          <b>{{ book.overdue }}</b><span>代账逾期</span>
        </div>
        <div class="bc-alert-item">
          <b>{{ receipt.arrearsCount }}</b><span>欠费客户</span>
        </div>
      </div>
    </div>

    <!-- ② 全部指标(指标墙) -->
    <div class="bc-sec-title">全部指标</div>
    <div class="bc-groups">
      <div class="bc-group">
        <div class="bc-group-h">客户问题</div>
        <div class="bc-tiles">
          <div class="bc-tile" @click="go('/customer-issue/list')"><i class="lab">今日新增</i><b class="num">{{ issue.todayNew }}</b></div>
          <div class="bc-tile" @click="go('/customer-issue/list', { view: 'unhandled' })"><i class="lab">未处理</i><b class="num dg">{{ issue.unhandled }}</b></div>
          <div class="bc-tile" @click="go('/customer-issue/list', { view: 'overdue' })"><i class="lab">逾期</i><b class="num dg">{{ issue.overdue }}</b></div>
          <div class="bc-tile" @click="go('/customer-issue/list', { view: 'p0' })"><i class="lab">P0</i><b class="num dg">{{ issue.p0 }}</b></div>
        </div>
      </div>

      <div class="bc-group">
        <div class="bc-group-h">代账服务</div>
        <div class="bc-tiles">
          <div class="bc-tile" @click="go('/order/bookkeeping')"><i class="lab">在办</i><b class="num">{{ book.active }}</b></div>
          <div class="bc-tile" @click="go('/order/bookkeeping', { view: 'completed' })"><i class="lab">已完成</i><b class="num ok">{{ book.completed }}</b></div>
          <div class="bc-tile" @click="go('/order/bookkeeping', { view: 'processing' })"><i class="lab">处理中</i><b class="num">{{ book.processing }}</b></div>
          <div class="bc-tile" @click="go('/order/bookkeeping', { view: 'overdue' })"><i class="lab">逾期</i><b class="num dg">{{ book.overdue }}</b></div>
        </div>
      </div>

      <div class="bc-group">
        <div class="bc-group-h">销售线索</div>
        <div class="bc-tiles">
          <div class="bc-tile" @click="go('/customer/lead')"><i class="lab">今日新增线索</i><b class="num">{{ sales.todayLeads }}</b></div>
          <div class="bc-tile" @click="go('/customer/workbench')"><i class="lab">今日跟进</i><b class="num">{{ sales.todayFollows }}</b></div>
          <div class="bc-tile" @click="go('/customer/lead')"><i class="lab">预计成交</i><b class="num">{{ money(sales.expectAmount) }}</b></div>
          <div class="bc-tile" @click="go('/customer/lead')"><i class="lab">本月已成交</i><b class="num ok">{{ money(sales.dealAmount) }}</b></div>
        </div>
      </div>

      <div class="bc-group">
        <div class="bc-group-h">回款续费</div>
        <div class="bc-tiles">
          <div class="bc-tile"><i class="lab">今日应收</i><b class="num">{{ money(receipt.todayDue) }}</b></div>
          <div class="bc-tile"><i class="lab">今日已收</i><b class="num ok">{{ money(receipt.todayReceived) }}</b></div>
          <div class="bc-tile"><i class="lab">逾期欠费</i><b class="num dg">{{ money(receipt.overdueArrears) }}</b></div>
          <div class="bc-tile"><i class="lab">欠费客户</i><b class="num wn">{{ receipt.arrearsCount }}</b></div>
        </div>
      </div>
    </div>

    <!-- ③ 异常清单 -->
    <div class="bc-sec-title">需要处理（异常清单）</div>
    <div class="bc-ex-grid">
      <div class="bc-ex-card">
        <div class="bc-ex-h"><span>逾期工单</span><em class="dg">{{ ex.overdueIssues.length }}</em><a @click="go('/customer-issue/list', { view: 'overdue' })">全部 →</a></div>
        <div v-for="r in ex.overdueIssues.slice(0, 5)" :key="r.id" class="bc-ex-row">
          <span class="tag dg">逾期</span>
          <span class="bc-ex-name">{{ r.customerName || '客户' }}</span>
          <span class="bc-ex-sub">{{ r.ownerName || '-' }} · {{ fmtDate(r.deadline) }}</span>
        </div>
        <el-empty v-if="!ex.overdueIssues.length" description="无逾期工单" :image-size="46" />
      </div>

      <div class="bc-ex-card">
        <div class="bc-ex-h"><span>P0 工单</span><em class="dg">{{ ex.p0Issues.length }}</em><a @click="go('/customer-issue/list', { view: 'p0' })">全部 →</a></div>
        <div v-for="r in ex.p0Issues.slice(0, 5)" :key="r.id" class="bc-ex-row">
          <span class="tag dg">P0</span>
          <span class="bc-ex-name">{{ r.customerName || '客户' }}</span>
          <span class="bc-ex-sub">{{ r.ownerName || '-' }}</span>
        </div>
        <el-empty v-if="!ex.p0Issues.length" description="无 P0 工单" :image-size="46" />
      </div>

      <div class="bc-ex-card">
        <div class="bc-ex-h"><span>代账逾期</span><em class="dg">{{ ex.bookkeepingAbnormal.length }}</em><a @click="go('/order/bookkeeping', { view: 'overdue' })">全部 →</a></div>
        <div v-for="r in ex.bookkeepingAbnormal.slice(0, 5)" :key="r.id" class="bc-ex-row">
          <span class="tag wn">逾期</span>
          <span class="bc-ex-name">{{ r.companyName || '客户' }}</span>
          <span class="bc-ex-sub">{{ r.ownerName || '-' }} · 到期 {{ fmtDate(r.serviceEnd) }}</span>
        </div>
        <el-empty v-if="!ex.bookkeepingAbnormal.length" description="无逾期代账" :image-size="46" />
      </div>

      <div class="bc-ex-card">
        <div class="bc-ex-h"><span>欠费客户</span><em class="wn">{{ ex.arrears.length }}</em></div>
        <div v-for="r in ex.arrears.slice(0, 5)" :key="r.orderId" class="bc-ex-row">
          <span class="tag wn">欠 {{ money(r.arrears) }}</span>
          <span class="bc-ex-name">{{ r.customerName || ('订单#' + r.orderId) }}</span>
          <span class="bc-ex-sub">最早 {{ fmtDate(r.earliestDue) }}</span>
        </div>
        <el-empty v-if="!ex.arrears.length" description="无欠费客户" :image-size="46" />
      </div>
    </div>

    <!-- ④ 员工执行排行 -->
    <div class="bc-sec-title">员工执行排行（本月任务）</div>
    <div class="bc-rank-grid">
      <div class="bc-rank-card">
        <div class="bc-rank-h">逾期最多</div>
        <div v-for="(e, i) in rankOverdue" :key="e.executorId" class="bc-rank-row">
          <i class="rk">{{ i + 1 }}</i><span>{{ e.executorName || '未命名' }}</span><b class="dg">{{ e.overdueCount }}</b>
        </div>
        <el-empty v-if="!rankOverdue.length" description="暂无" :image-size="40" />
      </div>
      <div class="bc-rank-card">
        <div class="bc-rank-h">完成率最低</div>
        <div v-for="(e, i) in rankLowRate" :key="e.executorId" class="bc-rank-row">
          <i class="rk">{{ i + 1 }}</i><span>{{ e.executorName || '未命名' }}</span><b class="dg">{{ e.doneRate }}%</b>
        </div>
        <el-empty v-if="!rankLowRate.length" description="暂无" :image-size="40" />
      </div>
      <div class="bc-rank-card">
        <div class="bc-rank-h">处理最多</div>
        <div v-for="(e, i) in rankDone" :key="e.executorId" class="bc-rank-row">
          <i class="rk">{{ i + 1 }}</i><span>{{ e.executorName || '未命名' }}</span><b class="ok">{{ e.doneCount }}</b>
        </div>
        <el-empty v-if="!rankDone.length" description="暂无" :image-size="40" />
      </div>
    </div>

    <!-- 员工执行明细表 -->
    <el-table v-if="employees.length" :data="employees" size="small" class="bc-emp-table">
      <el-table-column type="index" label="#" width="50" />
      <el-table-column prop="executorName" label="员工" min-width="120" />
      <el-table-column prop="todayCount" label="今日任务" width="100" align="center" />
      <el-table-column prop="overdueCount" label="逾期" width="90" align="center">
        <template #default="{ row }"><span :class="{ 'bc-red': row.overdueCount > 0 }">{{ row.overdueCount }}</span></template>
      </el-table-column>
      <el-table-column prop="doneCount" label="已完成" width="90" align="center" />
      <el-table-column label="完成率" width="140">
        <template #default="{ row }">
          <el-progress :percentage="row.doneRate" :stroke-width="10" :color="rateColor(row.doneRate)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getBossOverview } from '@/api/dashboard'

const router = useRouter()
const loading = ref(false)

const issue = reactive({ todayNew: 0, unhandled: 0, overdue: 0, p0: 0 })
const book = reactive({ active: 0, completed: 0, processing: 0, overdue: 0 })
const sales = reactive({ todayLeads: 0, todayFollows: 0, expectAmount: 0, dealAmount: 0 })
const receipt = reactive({ todayDue: 0, todayReceived: 0, overdueArrears: 0, arrearsCount: 0 })
const employees = ref<any[]>([])
const ex = reactive<{ overdueIssues: any[]; p0Issues: any[]; bookkeepingAbnormal: any[]; arrears: any[] }>({
  overdueIssues: [], p0Issues: [], bookkeepingAbnormal: [], arrears: []
})

const todayText = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} 周${w}`
})

// 员工排行:从明细派生三个视角
const rankOverdue = computed(() => [...employees.value].filter(e => e.overdueCount > 0).sort((a, b) => b.overdueCount - a.overdueCount).slice(0, 5))
const rankLowRate = computed(() => [...employees.value].filter(e => e.totalCount >= 3).sort((a, b) => a.doneRate - b.doneRate).slice(0, 5))
const rankDone = computed(() => [...employees.value].filter(e => e.doneCount > 0).sort((a, b) => b.doneCount - a.doneCount).slice(0, 5))

function money(v: any): string {
  const n = Number(v) || 0
  if (n >= 10000) return '¥' + (n / 10000).toFixed(1) + '万'
  return '¥' + Math.round(n).toLocaleString()
}
function fmtDate(v: any): string {
  if (!v) return '-'
  const s = String(v)
  return s.length >= 10 ? s.slice(5, 10) : s
}
function rateColor(r: number): string {
  if (r >= 80) return '#0F6E56'
  if (r >= 50) return '#BA7517'
  return '#A32D2D'
}

function go(path: string, query?: Record<string, any>) {
  router.push({ path, query })
}

async function load() {
  loading.value = true
  try {
    const res: any = await getBossOverview()
    const d = res?.data ?? res ?? {}
    Object.assign(issue, d.customerIssue || {})
    Object.assign(book, d.bookkeeping || {})
    Object.assign(sales, d.sales || {})
    Object.assign(receipt, d.receipt || {})
    employees.value = Array.isArray(d.employees) ? d.employees : []
    const e = d.exceptions || {}
    ex.overdueIssues = e.overdueIssues || []
    ex.p0Issues = e.p0Issues || []
    ex.bookkeepingAbnormal = e.bookkeepingAbnormal || []
    ex.arrears = e.arrears || []
  } catch (err: any) {
    ElMessage.error(err?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.bc-page { padding: 16px; }
.bc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.bc-head-l h2 { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.bc-head-l span { font-size: 13px; color: var(--el-text-color-secondary); }

/* 红灯告警 */
.bc-alert { background: var(--el-color-danger-light-9); border: 1px solid var(--el-color-danger-light-5); border-radius: 12px; padding: 14px 16px; }
.bc-alert-h { font-size: 14px; font-weight: 600; color: var(--el-color-danger); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
.bc-alert-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.bc-alert-item { text-align: center; cursor: pointer; padding: 6px; border-radius: 8px; transition: background 0.2s; }
.bc-alert-item:hover { background: var(--el-color-danger-light-8); }
.bc-alert-item b { display: block; font-size: 30px; font-weight: 600; color: var(--el-color-danger); line-height: 1.1; }
.bc-alert-item span { font-size: 13px; color: var(--el-color-danger); }

.bc-sec-title { font-size: 15px; font-weight: 600; color: var(--el-text-color-primary); margin: 22px 0 12px; }

/* 指标墙 */
.bc-groups { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; }
.bc-group { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; padding: 12px 14px; }
.bc-group-h { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); margin-bottom: 10px; }
.bc-tiles { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.bc-tile { background: var(--el-fill-color-light); border-radius: 8px; padding: 8px 6px; text-align: center; cursor: pointer; transition: all 0.2s; }
.bc-tile:hover { background: var(--el-color-primary-light-9); }
.bc-tile .lab { display: block; font-size: 12px; color: var(--el-text-color-secondary); font-style: normal; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bc-tile .num { display: block; font-size: 20px; font-weight: 600; color: var(--el-color-primary); margin-top: 2px; }
.bc-tile .num.dg { color: var(--el-color-danger); }
.bc-tile .num.wn { color: var(--el-color-warning); }
.bc-tile .num.ok { color: var(--el-color-success); }

/* 异常清单 */
.bc-ex-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; }
.bc-ex-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; padding: 12px 14px; }
.bc-ex-h { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 6px; }
.bc-ex-h em { font-style: normal; font-size: 12px; padding: 0 7px; border-radius: 8px; background: var(--el-fill-color); }
.bc-ex-h em.dg { color: var(--el-color-danger); background: var(--el-color-danger-light-9); }
.bc-ex-h em.wn { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
.bc-ex-h a { margin-left: auto; font-size: 12px; color: var(--el-color-primary); cursor: pointer; }
.bc-ex-row { display: flex; align-items: center; gap: 8px; padding: 7px 0; border-top: 1px solid var(--el-border-color-lighter); font-size: 13px; }
.bc-ex-name { color: var(--el-text-color-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 120px; }
.bc-ex-sub { margin-left: auto; font-size: 12px; color: var(--el-text-color-secondary); white-space: nowrap; }
.tag { font-size: 11px; padding: 1px 7px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.tag.dg { background: var(--el-color-danger-light-9); color: var(--el-color-danger); }
.tag.wn { background: var(--el-color-warning-light-9); color: var(--el-color-warning); }

/* 员工排行 */
.bc-rank-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; margin-bottom: 14px; }
.bc-rank-card { background: var(--el-bg-color); border: 1px solid var(--el-border-color-lighter); border-radius: 12px; padding: 12px 14px; }
.bc-rank-h { font-size: 13px; font-weight: 600; color: var(--el-text-color-secondary); margin-bottom: 8px; }
.bc-rank-row { display: flex; align-items: center; gap: 10px; padding: 6px 0; font-size: 13px; }
.bc-rank-row .rk { width: 20px; height: 20px; border-radius: 50%; background: var(--el-fill-color); color: var(--el-text-color-secondary); font-size: 12px; font-style: normal; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bc-rank-row span { flex: 1; color: var(--el-text-color-primary); }
.bc-rank-row b { font-weight: 600; }
.bc-rank-row b.dg { color: var(--el-color-danger); }
.bc-rank-row b.ok { color: var(--el-color-success); }

.bc-emp-table { border: 1px solid var(--el-border-color-lighter); border-radius: 12px; overflow: hidden; cursor: pointer; }
.bc-red { color: var(--el-color-danger); font-weight: 600; }
</style>

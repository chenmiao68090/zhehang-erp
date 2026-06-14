<template>
  <div class="dashboard-home">
    <!-- 1. 顶部个人横幅 -->
    <div class="profile-banner">
      <div class="profile-left">
        <div class="profile-avatar">{{ avatarText }}</div>
        <div class="profile-meta">
          <div class="profile-name-row">
            <h2>{{ userName }}</h2>
            <span class="profile-position">{{ positionLabel }}</span>
          </div>
          <div class="profile-sub">
            <span class="profile-tenure">您已入职 <b>{{ tenureDays }}</b> 天</span>
            <span class="profile-divider">·</span>
            <span class="profile-slogan">{{ slogan }}</span>
          </div>
        </div>
      </div>
      <div class="profile-date">
        <el-icon :size="18"><Calendar /></el-icon>
        <span>{{ currentDateStr }}</span>
      </div>
    </div>

    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
        <!-- 2. 流程待办卡 -->
        <el-card class="flow-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">流程待办</span>
              <el-link type="primary" :underline="false" @click="goApprovalCenter('done')">
                已完成 {{ flow.done }} 件
              </el-link>
            </div>
          </template>
          <div class="flow-grid">
            <div class="flow-item" @click="goApprovalCenter('todo')">
              <div class="flow-num">{{ flow.todo }}</div>
              <div class="flow-label">待我审批</div>
            </div>
            <div class="flow-item" @click="goApprovalCenter('cc')">
              <div class="flow-num">{{ flow.cc }}</div>
              <div class="flow-label">抄送我</div>
            </div>
            <div class="flow-item" @click="goApprovalCenter('started')">
              <div class="flow-num">{{ flow.started }}</div>
              <div class="flow-label">我发起</div>
            </div>
          </div>
        </el-card>

        <!-- 3. 本月业绩卡 -->
        <el-card class="perf-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">本月业绩</span>
              <el-link type="primary" :underline="false" @click="router.push('/dashboard/cockpit')">查看详情</el-link>
            </div>
          </template>
          <div class="perf-grid">
            <div class="perf-item">
              <div class="perf-value">{{ perf.dealCount }}</div>
              <div class="perf-label">成单数</div>
            </div>
            <div class="perf-item">
              <div class="perf-value">{{ formatMoney(perf.dealAmount) }}</div>
              <div class="perf-label">成交金额</div>
            </div>
            <div class="perf-item">
              <div class="perf-value">{{ perf.conversionRate }}<em>%</em></div>
              <div class="perf-label">线索转化率</div>
            </div>
          </div>
          <p class="perf-note">成单数 / 成交金额取我的订单中本月已完成单据聚合；转化率取我数据范围内线索转化汇总。</p>
        </el-card>

        <!-- 4. 抄送我的 / 已完成事项 -->
        <el-card class="approval-card" shadow="never">
          <el-tabs v-model="activeTab" class="approval-tabs">
            <el-tab-pane name="cc" :label="`抄送我的 (${flow.cc})`">
              <div v-if="ccLoading" v-loading="true" class="tab-loading"></div>
              <div v-else-if="ccList.length === 0" class="empty-tip">暂无抄送给我的事项</div>
              <div v-else class="flow-list">
                <div v-for="item in ccList" :key="item.id" class="flow-row">
                  <div class="flow-row-main">
                    <span class="flow-row-title text-ellipsis">{{ item.title }}</span>
                    <span class="flow-row-meta">申请人：{{ item.applicant || '—' }} · 审批人：{{ item.approver || '—' }}</span>
                  </div>
                  <div class="flow-row-right">
                    <el-tag :type="item.statusType" size="small" effect="light">{{ item.statusLabel }}</el-tag>
                    <span class="flow-row-date">{{ item.date }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane name="done" :label="`已完成事项 (${flow.done})`">
              <div v-if="doneLoading" v-loading="true" class="tab-loading"></div>
              <div v-else-if="doneList.length === 0" class="empty-tip">暂无已完成事项</div>
              <div v-else class="flow-list">
                <div v-for="item in doneList" :key="item.id" class="flow-row" @click="openInstance(item.instanceId)">
                  <div class="flow-row-main">
                    <span class="flow-row-title text-ellipsis">{{ item.title }}</span>
                    <span class="flow-row-meta">申请人：{{ item.applicant || '—' }} · 审批人：{{ item.approver || '—' }}</span>
                  </div>
                  <div class="flow-row-right">
                    <el-tag :type="item.statusType" size="small" effect="light">{{ item.statusLabel }}</el-tag>
                    <span class="flow-row-date">{{ item.date }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <!-- 5. 工作日报 -->
        <el-card class="report-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">工作日报</span>
              <el-button type="primary" size="small" plain @click="openReportDialog">填写日报</el-button>
            </div>
          </template>
          <div v-if="reportList.length === 0" class="empty-tip report-empty" @click="openReportDialog">
            暂无日报记录，点击右上角填写
          </div>
          <div v-else class="report-list">
            <div v-for="r in reportList" :key="r.id" class="report-item">
              <div class="report-item-head">
                <span class="report-date">{{ r.date }}</span>
                <el-button link type="danger" size="small" @click="removeReport(r.id)">删除</el-button>
              </div>
              <div class="report-block">
                <span class="report-block-label">今日工作</span>
                <p>{{ r.today }}</p>
              </div>
              <div class="report-block" v-if="r.tomorrow">
                <span class="report-block-label">明日计划</span>
                <p>{{ r.tomorrow }}</p>
              </div>
            </div>
          </div>
          <p class="report-tip">日报后端待接入，当前数据仅保存在本浏览器（按账号区分）。</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 6. 我的订单 -->
    <el-card class="order-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">我的订单</span>
          <el-link type="primary" :underline="false" @click="router.push('/order/bill')">查看全部</el-link>
        </div>
      </template>
      <el-table
        :data="orderList"
        v-loading="orderLoading"
        size="default"
        empty-text="暂无订单记录"
        style="width: 100%"
      >
        <el-table-column prop="orderNo" label="订单编号" min-width="160" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" min-width="140" show-overflow-tooltip />
        <el-table-column label="业务类型" min-width="110">
          <template #default="{ row }">{{ row.serviceTypeLabel }}</template>
        </el-table-column>
        <el-table-column label="金额" min-width="120" align="right">
          <template #default="{ row }">{{ formatMoney(row.finalAmount) }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.statusType" size="small" effect="light">{{ row.statusLabel }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日期" min-width="120">
          <template #default="{ row }">{{ (row.submitTime || row.createTime || '').slice(0, 10) || '—' }}</template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 填写日报对话框 -->
    <el-dialog v-model="reportDialogVisible" title="填写工作日报" width="520px">
      <el-form label-position="top">
        <el-form-item label="日期">
          <el-date-picker v-model="reportForm.date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="今日工作">
          <el-input v-model="reportForm.today" type="textarea" :rows="4" placeholder="今天完成了哪些工作？" />
        </el-form-item>
        <el-form-item label="明日计划">
          <el-input v-model="reportForm.tomorrow" type="textarea" :rows="3" placeholder="明天准备做什么？（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReport">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 个人主页：参考利势 CRM 个人主页 6 块布局，全部接真实后端，无假数据。
// 数据来源：
//   1) 个人信息：/auth/info（getUserInfoApi）→ user.nickname / roles；职位用 ROLE_LABELS 映射 roles[0]。
//   2) 入职天数：/org/employee/list 找当前 userId 的 org_employee 取 hireDate 算天数；拿不到显示「--」。
//   3) 流程待办：/workflow/task/{todo|started|done} total；抄送(cc) 后端无端点 → 0（见 gapsNoBackend）。
//   4) 本月业绩：成单数/成交金额取 orderApi.stats()（本月已完成单据聚合）；转化率取 leadApi.conversionStats()。
//   5) 已完成事项：taskApi.done 列表；抄送列表后端无端点 → 空。
//   6) 我的订单：orderApi.list 最近 5 单。
// 工作日报：后端无日报接口 → 本地 localStorage 兜底（按账号 key 区分），UI 已标注「后端待接入」。
import { ref, computed, reactive, onMounted } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { SYSTEM_ROLES } from '@/stores/user'
import { taskApi } from '@/api/workflow'
import type { TaskItem, InstanceItem } from '@/api/workflow'
import { employeeApi } from '@/api/org'
import { orderApi, type BizOrder } from '@/api/order'
import { leadApi } from '@/api/crm'

const router = useRouter()
const userStore = useUserStore()

// ---------- 角色中文映射（与 Header.vue 的 ROLE_LABELS 对齐） ----------
const ROLE_LABELS: Record<string, string> = {
  admin: '超级管理员',
  super_admin: '超级管理员',
  sys_admin: '系统管理员',
  dept_manager: '部门主管',
  manager: '部门主管',
  boss: '老板',
  finance: '财务/会计',
  finance_hq: '财务部',
  sales: '电销',
  online_sales: '网销',
  hr: '人事',
  staff: '普通员工',
  user: '普通用户'
}

// ---------- 1. 个人信息 ----------
const userName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '用户')
const avatarText = computed(() => userName.value.slice(0, 1))
const positionLabel = computed(() => {
  const role = userStore.roles?.[0]
  if (!role) return '员工'
  return ROLE_LABELS[role] || SYSTEM_ROLES.find(r => r.value === role)?.label || role
})
const slogan = '遇到对的人，才可以一起走的更远！'
const tenureDays = ref<string | number>('--')

const currentDateStr = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六']
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${w[d.getDay()]}`
})

// ---------- 2. 流程待办 ----------
const flow = reactive({ todo: 0, cc: 0, started: 0, done: 0 })

function goApprovalCenter(tab: 'todo' | 'cc' | 'started' | 'done') {
  // 跳审批中心（/approval/index）。query 仅作前向参数，当前审批中心页默认进「审批管理」Tab。
  router.push({ path: '/approval/index', query: { tab } })
}

// ---------- 3. 本月业绩 ----------
const perf = reactive({ dealCount: 0, dealAmount: 0, conversionRate: 0 })

// ---------- 4. 抄送我的 / 已完成事项 ----------
const activeTab = ref<'cc' | 'done'>('done')
interface FlowRow {
  id: number
  instanceId: number
  title: string
  applicant: string
  approver: string
  date: string
  statusLabel: string
  statusType: 'success' | 'warning' | 'danger' | 'info' | 'primary'
}
const ccList = ref<FlowRow[]>([])
const doneList = ref<FlowRow[]>([])
const ccLoading = ref(false)
const doneLoading = ref(false)

// 审批任务状态码 → 中文（与 workflow 模块一致：1 待处理 2 同意 3 驳回 4 转交）
function taskStatusMeta(status: number): { label: string; type: FlowRow['statusType'] } {
  switch (Number(status)) {
    case 2: return { label: '已同意', type: 'success' }
    case 3: return { label: '已驳回', type: 'danger' }
    case 4: return { label: '已转交', type: 'info' }
    default: return { label: '待处理', type: 'warning' }
  }
}

function adaptTask(t: TaskItem): FlowRow {
  const meta = taskStatusMeta(t.status)
  return {
    id: t.id,
    instanceId: t.instanceId,
    title: t.instanceTitle || t.processName || '审批事项',
    applicant: t.initiatorName || '',
    approver: t.assigneeName || '',
    date: (t.handleTime || t.startTime || t.createTime || '').toString().replace('T', ' ').slice(0, 10),
    statusLabel: meta.label,
    statusType: meta.type
  }
}

function openInstance(instanceId: number) {
  if (!instanceId) return
  router.push({ path: '/approval/index', query: { instanceId } })
}

// ---------- 5. 工作日报（localStorage 兜底） ----------
interface DailyReport { id: number; date: string; today: string; tomorrow: string }
const reportList = ref<DailyReport[]>([])
const reportDialogVisible = ref(false)
const reportForm = reactive<{ date: string; today: string; tomorrow: string }>({
  date: new Date().toISOString().slice(0, 10),
  today: '',
  tomorrow: ''
})

function reportStorageKey() {
  const uid = userStore.userInfo?.id || userStore.userInfo?.username || 'anon'
  return `daily_report_${uid}`
}
function loadReports() {
  try {
    const raw = localStorage.getItem(reportStorageKey())
    reportList.value = raw ? JSON.parse(raw) : []
  } catch {
    reportList.value = []
  }
}
function persistReports() {
  try {
    localStorage.setItem(reportStorageKey(), JSON.stringify(reportList.value))
  } catch { /* ignore */ }
}
function openReportDialog() {
  reportForm.date = new Date().toISOString().slice(0, 10)
  reportForm.today = ''
  reportForm.tomorrow = ''
  reportDialogVisible.value = true
}
function submitReport() {
  if (!reportForm.today.trim()) {
    ElMessage.warning('请填写今日工作')
    return
  }
  reportList.value.unshift({
    id: Date.now(),
    date: reportForm.date,
    today: reportForm.today.trim(),
    tomorrow: reportForm.tomorrow.trim()
  })
  reportList.value = reportList.value.slice(0, 30)
  persistReports()
  reportDialogVisible.value = false
  ElMessage.success('日报已保存（本地）')
}
function removeReport(id: number) {
  reportList.value = reportList.value.filter(r => r.id !== id)
  persistReports()
}

// ---------- 6. 我的订单 ----------
interface OrderRow extends BizOrder { serviceTypeLabel: string; statusLabel: string; statusType: FlowRow['statusType'] }
const orderList = ref<OrderRow[]>([])
const orderLoading = ref(false)

const SERVICE_TYPE_LABELS: Record<string, string> = {
  bookkeeping: '代理记账',
  registration: '工商注册',
  tax_planning: '税务筹划',
  qualification: '资质办理',
  audit: '审计',
  cancellation: '注销',
  other: '其他'
}
const ORDER_STATUS_LABELS: Record<string, { label: string; type: FlowRow['statusType'] }> = {
  draft: { label: '草稿', type: 'info' },
  pending_approval: { label: '待审批', type: 'warning' },
  pending_finance: { label: '待财务确认', type: 'warning' },
  pending_boss: { label: '待终审', type: 'warning' },
  completed: { label: '已完成', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' },
  cancelled: { label: '已取消', type: 'info' }
}

function adaptOrderRow(o: BizOrder): OrderRow {
  const st = ORDER_STATUS_LABELS[o.status] || { label: o.status, type: 'info' as const }
  const firstType = o.items?.[0]?.serviceType
  return {
    ...o,
    serviceTypeLabel: SERVICE_TYPE_LABELS[firstType || ''] || '—',
    statusLabel: st.label,
    statusType: st.type
  }
}

// ---------- 工具 ----------
function formatMoney(n: number): string {
  const v = Number(n || 0)
  if (v >= 10000) return `¥${(v / 10000).toFixed(2)}万`
  return `¥${v.toLocaleString('zh-CN')}`
}

// ---------- 各块独立加载（一块失败不影响其它块） ----------
async function loadTenure() {
  const uid = Number(userStore.userInfo?.id || 0)
  if (!uid) return
  try {
    // 普通用户数据范围只返回自己那条；管理员可能拉到多条，按 userId 匹配自己
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 50 })
    const records = res?.records || res?.list || []
    const me = records.find((e: any) => Number(e.userId) === uid)
    if (me?.hireDate) {
      const diff = Date.now() - new Date(String(me.hireDate)).getTime()
      const days = Math.max(0, Math.floor(diff / 86400000))
      tenureDays.value = days
    }
  } catch {
    // 无员工档案（如 admin）→ 保持 '--'，不报错
  }
}

async function loadFlowCounts() {
  const tryTotal = async (fn: () => Promise<any>): Promise<number> => {
    try {
      const res: any = await fn()
      return Number(res?.total || 0)
    } catch {
      return 0
    }
  }
  flow.todo = await tryTotal(() => taskApi.todo({ pageNum: 1, pageSize: 1 }))
  flow.started = await tryTotal(() => taskApi.started({ pageNum: 1, pageSize: 1 }))
  flow.done = await tryTotal(() => taskApi.done({ pageNum: 1, pageSize: 1 }))
  flow.cc = 0 // 抄送：后端无端点（见 gapsNoBackend）
}

async function loadDoneList() {
  doneLoading.value = true
  try {
    const res: any = await taskApi.done({ pageNum: 1, pageSize: 8 })
    const records: TaskItem[] = res?.records || res?.list || []
    doneList.value = records.map(adaptTask)
  } catch {
    doneList.value = []
  } finally {
    doneLoading.value = false
  }
}

async function loadPerformance() {
  // 订单聚合（本月已完成单据）：成单数 = completedCount，成交金额 = monthAmount
  try {
    const stats = await orderApi.stats()
    perf.dealCount = stats.completedCount || 0
    perf.dealAmount = stats.monthAmount || 0
  } catch {
    perf.dealCount = 0
    perf.dealAmount = 0
  }
  // 线索转化率
  try {
    const conv: any = await leadApi.conversionStats()
    perf.conversionRate = Number(conv?.conversionRate || 0)
  } catch {
    perf.conversionRate = 0
  }
}

async function loadMyOrders() {
  orderLoading.value = true
  try {
    const res = await orderApi.list({ page: 1, pageSize: 5 })
    orderList.value = (res.list || []).map(adaptOrderRow)
  } catch {
    orderList.value = []
  } finally {
    orderLoading.value = false
  }
}

onMounted(() => {
  loadReports()
  // 并行加载各块，互不阻塞
  loadTenure()
  loadFlowCounts()
  loadDoneList()
  loadPerformance()
  loadMyOrders()
})
</script>

<style lang="scss" scoped>
.dashboard-home { display: flex; flex-direction: column; gap: 16px; }

/* 1. 个人横幅 */
.profile-banner {
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 118, 110, 0.08)),
    #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-card);
}
.profile-left { display: flex; align-items: center; gap: 18px; }
.profile-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2563eb, #0f766e);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.profile-name-row { display: flex; align-items: center; gap: 12px; }
.profile-name-row h2 { color: var(--text-primary); font-size: 20px; font-weight: 600; }
.profile-position {
  display: inline-flex;
  align-items: center;
  height: 22px;
  padding: 0 10px;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
  font-size: 12px;
}
.profile-sub {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-body);
  font-size: 14px;
}
.profile-tenure b { color: #2563eb; font-family: 'JetBrains Mono', monospace; }
.profile-divider { color: var(--text-muted); }
.profile-slogan { color: var(--text-muted); }
.profile-date {
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.68);
  padding: 8px 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.card-title { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.card-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }

:deep(.el-card) {
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}
:deep(.el-card__header) { padding: 14px 20px; border-bottom: 1px solid var(--border-soft); }
:deep(.el-card__body) { padding: 16px 20px; }

/* 2. 流程待办 */
.flow-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.flow-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 18px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #f8fbff;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover { border-color: #bfdbfe; transform: translateY(-1px); }
}
.flow-num { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; color: #2563eb; line-height: 1.1; }
.flow-label { font-size: 13px; color: var(--text-muted); }

/* 3. 本月业绩 */
.perf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.perf-item {
  text-align: center;
  padding: 18px 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #f8fbff;
}
.perf-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.1;

  em { font-size: 14px; font-style: normal; color: var(--text-muted); margin-left: 2px; }
}
.perf-label { margin-top: 8px; font-size: 13px; color: var(--text-muted); }
.perf-note { margin-top: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.5; }

/* 4. 抄送/已完成 Tabs */
.approval-tabs :deep(.el-tabs__header) { margin-bottom: 8px; }
.tab-loading { min-height: 80px; }
.flow-list { display: flex; flex-direction: column; gap: 2px; }
.flow-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 4px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover { background: #f8fbff; }
}
.flow-row-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1; }
.flow-row-title { font-size: 14px; color: var(--text-primary); }
.flow-row-meta { font-size: 12px; color: var(--text-muted); }
.flow-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.flow-row-date { font-size: 12px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

/* 5. 工作日报 */
.report-empty { cursor: pointer; }
.report-list { display: flex; flex-direction: column; gap: 12px; }
.report-item { border: 1px solid var(--border-soft); border-radius: 8px; padding: 12px; background: #f8fbff; }
.report-item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.report-date { font-size: 13px; font-weight: 600; color: #2563eb; font-family: 'JetBrains Mono', monospace; }
.report-block { margin-top: 6px; }
.report-block-label { font-size: 12px; color: var(--text-muted); }
.report-block p { margin-top: 2px; font-size: 13px; color: var(--text-body); line-height: 1.6; white-space: pre-wrap; }
.report-tip { margin-top: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.5; }

/* 通用空态 */
.empty-tip { text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 14px; }

@media (max-width: 768px) {
  .profile-banner { flex-direction: column; align-items: flex-start; gap: 14px; padding: 20px; }
}
</style>

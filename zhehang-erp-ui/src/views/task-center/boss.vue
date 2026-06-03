<template>
  <div class="task-page task-boss">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 04 / BOSS · 紧急</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">D 类 · 老板特殊安排</span>
          <span class="title-en">Executive Mission</span>
        </h1>
        <p class="page-desc">由老板直接下达的高优先级特殊任务 · 跨角色直派 · 强制汇报</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="btn-gold" @click="openCreate">+ 新建特殊任务</el-button>
      </div>
    </header>

    <!-- 权限提示 -->
    <el-alert title="权限提示：仅老板和管理员可创建 D 类任务 · 优先级强制锁定为紧急 · 执行人可从全公司任意角色中选择" type="error" :closable="false" class="perm-alert" />

    <!-- 老板视角面板 -->
    <section class="boss-board">
      <div class="board-head">
        <h2 class="board-title">EXECUTIVE BOARD · 老板视角</h2>
        <span class="board-sub">实时汇报 · 统一调度</span>
      </div>
      <div class="board-stats">
        <div class="stat-card"><span class="stat-num">{{ stats.total }}</span><span class="stat-label">紧急任务总数</span></div>
        <div class="stat-card warn"><span class="stat-num">{{ stats.running }}</span><span class="stat-label">执行中</span></div>
        <div class="stat-card hot"><span class="stat-num">{{ stats.overdue }}</span><span class="stat-label">已逾期</span></div>
        <div class="stat-card ok"><span class="stat-num">{{ stats.review }}</span><span class="stat-label">待老板验收</span></div>
      </div>
      <div class="recent-reports" v-if="recentReports.length">
        <div class="rr-head">最近汇报</div>
        <div class="rr-item" v-for="r in recentReports" :key="r.time + r.taskName">
          <span class="rr-time">{{ r.time.slice(5, 16) }}</span>
          <span class="rr-task">{{ r.taskName }}</span>
          <span class="rr-rep">{{ r.reporter }}</span>
          <span class="rr-content">{{ r.content }}</span>
        </div>
      </div>
    </section>

    <!-- Tabs + 列表 -->
    <section class="content-section">
      <div class="tab-bar">
        <button v-for="t in tabs" :key="t.value" class="tab" :class="{ active: tab === t.value }" @click="tab = t.value; loadList()">
          {{ t.label }}
          <span class="tab-num">{{ t.count }}</span>
        </button>
      </div>

      <el-table :data="list" v-loading="loading" :row-class-name="rowClass">
        <el-table-column prop="taskNo" label="任务编号" width="150" />
        <el-table-column prop="taskName" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column label="子类型" width="160">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row._subType || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assignerName" label="下达人" width="120" />
        <el-table-column prop="assigneeName" label="执行人" width="120" />
        <el-table-column prop="planEndDate" label="计划完成" width="120" />
        <el-table-column label="优先级" width="90">
          <template #default>
            <el-tag type="danger" size="small" effect="dark">紧急</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'assigned'" link type="success" @click="doStart(row)">开始执行</el-button>
            <el-button v-if="row.status === 'in_progress'" link type="warning" @click="openReport(row)">汇报进度</el-button>
            <el-button v-if="row.status === 'in_progress'" link type="primary" @click="doFinish(row)">提交完成</el-button>
            <el-button v-if="row.status === 'reviewing'" link type="success" @click="doApprove(row)">老板验收</el-button>
            <el-button link @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 创建任务 Dialog -->
    <el-dialog v-model="dlg.create" title="新建 D 类特殊任务" width="600px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="form.taskName" placeholder="如：VIP 客户专属服务跟进" />
        </el-form-item>
        <el-form-item label="子类型">
          <el-select v-model="form.subType" placeholder="选择子类型" style="width: 100%">
            <el-option v-for="t in SUB_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="form.assigneeName" placeholder="从全公司选择" style="width: 100%" filterable>
            <el-option v-for="p in PEOPLE" :key="p" :label="p" :value="p" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划完成">
          <el-date-picker v-model="form.planEndDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="form.taskContent" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-input model-value="紧急" disabled>
            <template #suffix><span class="readonly-tag">只读</span></template>
          </el-input>
        </el-form-item>
        <el-form-item label="特殊说明">
          <el-input v-model="form.special" type="textarea" :rows="2" placeholder="向老板汇报的关键节点 / 客户敏感事项" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.create = false">取消</el-button>
        <el-button type="primary" @click="doCreate">下达任务</el-button>
      </template>
    </el-dialog>

    <!-- 进度汇报 Dialog -->
    <el-dialog v-model="dlg.report" title="向老板汇报进度" width="540px">
      <el-form :model="reportForm" label-width="90px">
        <el-form-item label="任务">
          <span class="readonly-text">{{ current?.taskName }}</span>
        </el-form-item>
        <el-form-item label="进度内容">
          <el-input v-model="reportForm.content" type="textarea" :rows="4" placeholder="请描述当前进度、遇到的问题、下一步计划" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.report = false">取消</el-button>
        <el-button type="primary" @click="doReport">提交汇报</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Drawer 含汇报时间线 -->
    <el-drawer v-model="dlg.detail" :title="current?.taskName || '任务详情'" size="560px">
      <div v-if="current" class="detail-block">
        <div class="urgent-banner">
          <span class="dot"></span>
          <span>紧急 · 向老板汇报</span>
        </div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务编号">{{ current.taskNo }}</el-descriptions-item>
          <el-descriptions-item label="子类型">{{ current._subType }}</el-descriptions-item>
          <el-descriptions-item label="下达人">{{ current.assignerName }}</el-descriptions-item>
          <el-descriptions-item label="执行人">{{ current.assigneeName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusMap[current.status]?.type" size="small">{{ statusMap[current.status]?.label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计划完成">{{ current.planEndDate }}</el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">{{ current.taskContent }}</el-descriptions-item>
        </el-descriptions>

        <div class="report-block">
          <div class="report-head">
            <h3>汇报历史</h3>
            <el-button v-if="current.status === 'in_progress'" class="btn-ghost" size="small" @click="openReport(current)">+ 新增汇报</el-button>
          </div>
          <el-timeline v-if="reports.length">
            <el-timeline-item v-for="r in reports" :key="r.time" :timestamp="r.time" placement="top" :color="'#D4AF37'">
              <div class="report-card">
                <div class="reporter">{{ r.reporter }}</div>
                <div class="report-content">{{ r.content }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无汇报记录" :image-size="80" />
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { taskApi, type BizTask } from '@/api/task-center'

const SUB_TYPES = ['VIP客户专属服务', '紧急事务处理', '客户投诉处理', '内部审计检查', '特殊关系客户接待', '新业务试点']
const PEOPLE: string[] = []

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger' }> = {
  pending: { label: '待分配', type: 'info' },
  assigned: { label: '已下达', type: 'warning' },
  in_progress: { label: '执行中', type: 'primary' },
  reviewing: { label: '待验收', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已逾期', type: 'danger' },
  closed: { label: '已暂停', type: 'info' }
}

const REPORT_KEY = 'biz_d_reports'
const CURRENT_USER = ''

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)
const all = ref<(BizTask & { _subType: string })[]>([])
const tab = ref<'all' | 'mine_create' | 'mine_assigned'>('all')
const current = ref<(BizTask & { _subType: string }) | null>(null)
const reports = ref<{ time: string; reporter: string; content: string }[]>([])
const dlg = reactive({ create: false, report: false, detail: false })

const form = reactive({
  taskName: '', subType: '', assigneeName: '',
  planEndDate: '', taskContent: '', special: ''
})
const reportForm = reactive({ content: '' })

function parseRemark(remark: string) {
  const m = (remark || '').match(/^([A-D])\|([^|]+)\|?(.*)$/)
  if (m) return { cat: m[1], subType: m[2], rest: m[3] || '' }
  return { cat: '', subType: '', rest: remark || '' }
}
function buildRemark(cat: string, subType: string, rest = '') { return `${cat}|${subType}|${rest}` }
function dateOff(d: number) { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }

function ensureSeed() {
  const KEY = 'biz_tasks'
  const raw = localStorage.getItem(KEY)
  // 仅读取本地存储以保留原有逻辑兼容性，不再写入任何模拟种子数据
  if (raw) {
    try { JSON.parse(raw) } catch { /* ignore */ }
  }
}

function loadReports() {
  const raw = localStorage.getItem(REPORT_KEY)
  if (raw) try { return JSON.parse(raw) as Record<number, any[]> } catch { /* */ }
  return {}
}
function saveReports(map: Record<number, any[]>) { localStorage.setItem(REPORT_KEY, JSON.stringify(map)) }

async function loadList() {
  loading.value = true
  try {
    const res: any = await taskApi.list({ pageSize: 9999 })
    const tasks: (BizTask & { _subType: string })[] = (res.list as BizTask[])
      .filter(t => parseRemark(t.remark).cat === 'D')
      .map(t => ({ ...t, _subType: parseRemark(t.remark).subType }))
    all.value = tasks
  } finally { loading.value = false }
}

const filtered = computed(() => {
  if (tab.value === 'all') return all.value
  if (tab.value === 'mine_create') return all.value.filter(t => t.assignerName === CURRENT_USER || t.assignerName === '')
  return all.value.filter(t => t.assigneeName === CURRENT_USER)
})
const list = computed(() => filtered.value)

const tabs = computed(() => [
  { value: 'all', label: '全部', count: all.value.length },
  { value: 'mine_create', label: '我创建的', count: all.value.filter(t => t.assignerName === CURRENT_USER || t.assignerName === '').length },
  { value: 'mine_assigned', label: '分配给我的', count: all.value.filter(t => t.assigneeName === CURRENT_USER).length }
])

const stats = computed(() => ({
  total: all.value.length,
  running: all.value.filter(t => t.status === 'in_progress').length,
  overdue: all.value.filter(t => {
    if (t.status === 'completed' || t.status === 'closed') return false
    if (!t.planEndDate) return false
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return new Date(t.planEndDate).getTime() < today.getTime()
  }).length,
  review: all.value.filter(t => t.status === 'reviewing').length
}))

const recentReports = computed(() => {
  const map = loadReports()
  const list: { time: string; reporter: string; content: string; taskName: string }[] = []
  for (const t of all.value) {
    const arr = map[t.id] || []
    for (const r of arr) list.push({ ...r, taskName: t.taskName })
  }
  return list.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5)
})

function rowClass({ row }: { row: BizTask }) {
  if (row.status === 'completed' || row.status === 'closed') return ''
  if (!row.planEndDate) return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(row.planEndDate).getTime() < today.getTime() ? 'row-overdue' : ''
}

function openCreate() {
  Object.assign(form, { taskName: '', subType: '', assigneeName: '', planEndDate: dateOff(7), taskContent: '', special: '' })
  dlg.create = true
}

async function doCreate() {
  if (!form.taskName || !form.subType || !form.assigneeName) return ElMessage.warning('请填写完整')
  await taskApi.create({
    taskName: form.taskName,
    taskType: 'other' as any,
    customerName: '',
    assigneeName: form.assigneeName,
    assigneeId: 2000 + Math.floor(Math.random() * 99),
    assignerName: '',
    priority: 'urgent',
    planStartDate: dateOff(0),
    planEndDate: form.planEndDate,
    taskContent: form.taskContent + (form.special ? `\n【特殊说明】${form.special}` : ''),
    remark: buildRemark('D', form.subType, '')
  })
  ElMessage.success('已下达 D 类紧急任务')
  dlg.create = false
  loadList()
}

async function doStart(row: BizTask) { await taskApi.start(row.id); ElMessage.success('已开始执行'); loadList() }

async function doFinish(row: BizTask) {
  await taskApi.complete({ id: row.id })
  ElMessage.success('已提交，等待老板验收')
  loadList()
}

async function doApprove(row: BizTask) {
  await taskApi.review({ id: row.id, result: 'pass', opinion: '老板验收通过' })
  ElMessage.success('老板已验收')
  loadList()
}

function openReport(row: BizTask & { _subType: string }) {
  current.value = row
  reportForm.content = ''
  dlg.report = true
}

function doReport() {
  if (!current.value || !reportForm.content) return ElMessage.warning('请填写汇报内容')
  const map = loadReports()
  const arr = map[current.value.id] || []
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
  arr.unshift({ time: now, reporter: current.value.assigneeName || CURRENT_USER, content: reportForm.content })
  map[current.value.id] = arr
  saveReports(map)
  ElMessage.success('汇报已提交')
  dlg.report = false
  reports.value = arr
}

function openDetail(row: BizTask & { _subType: string }) {
  current.value = row
  const map = loadReports()
  reports.value = map[row.id] || []
  dlg.detail = true
}

onMounted(() => { ensureSeed(); loadList() })
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 22px; padding: 8px 4px 32px; }

.page-header {
  position: relative; padding: 30px 36px 26px;
  background: linear-gradient(135deg, #1A0B0B 0%, #1F1018 50%, #1A0F0B 100%);
  border: 1px solid rgba(245, 108, 108, 0.30); border-radius: 14px; overflow: hidden;
  display: flex; align-items: flex-end; justify-content: space-between;
  &::before { content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 88% 20%, rgba(245, 108, 108, 0.18), transparent 45%),
                radial-gradient(circle at 8% 90%, rgba(212, 175, 55, 0.12), transparent 50%);
    pointer-events: none; }
  .header-meta, .header-main, .header-actions { position: relative; z-index: 1; }
}
.header-meta { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: #F56C6C; margin-bottom: 14px; }
.meta-tag { padding: 3px 10px; border: 1px solid rgba(245, 108, 108, 0.5); border-radius: 2px; background: rgba(245, 108, 108, 0.08); }
.meta-divider { width: 24px; height: 1px; background: rgba(245, 108, 108, 0.5); }
.meta-time { color: rgba(245, 108, 108, 0.6); }

.page-title { display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn { font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFE4D6 0%, #F56C6C 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .title-en { font-family: 'Playfair Display', 'Georgia', serif; font-style: italic; font-size: 18px; color: rgba(245, 108, 108, 0.55); }
}
.page-desc { font-size: 13px; color: var(--text-body, #A09B8C); margin: 0; }

.btn-gold { background: linear-gradient(135deg, #F56C6C 0%, #B53939 100%) !important; border: none !important; color: #fff !important; font-weight: 600;
  &:hover { filter: brightness(1.1); }
}
.btn-ghost { background: transparent !important; border: 1px solid rgba(212, 175, 55, 0.35) !important; color: var(--gold-primary) !important;
  &:hover { background: rgba(212, 175, 55, 0.08) !important; } }

.perm-alert :deep(.el-alert) { background: rgba(245, 108, 108, 0.08); border: 1px solid rgba(245, 108, 108, 0.30); }

.boss-board {
  padding: 18px 22px; border-radius: 12px;
  background: linear-gradient(135deg, #16161E 0%, #1A1219 100%);
  border: 1px solid rgba(245, 108, 108, 0.18);
}
.board-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; }
.board-title { margin: 0; font-family: 'JetBrains Mono', monospace; font-size: 13px; letter-spacing: 0.2em; color: #F56C6C; }
.board-sub { font-size: 11px; letter-spacing: 0.18em; color: rgba(245, 108, 108, 0.45); }
.board-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 16px; }
.stat-card { padding: 14px 18px; border-radius: 8px; background: rgba(212, 175, 55, 0.05); border: 1px solid rgba(212, 175, 55, 0.14); display: flex; flex-direction: column; gap: 4px;
  .stat-num { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; color: var(--gold-primary, #D4AF37); }
  .stat-label { font-size: 12px; color: var(--text-body, #A09B8C); }
  &.warn { border-color: rgba(230, 162, 60, 0.3); .stat-num { color: #E6A23C; } }
  &.hot { border-color: rgba(245, 108, 108, 0.3); .stat-num { color: #F56C6C; } }
  &.ok { border-color: rgba(103, 194, 58, 0.3); .stat-num { color: #67C23A; } }
}
.recent-reports { padding: 12px 14px; background: rgba(212, 175, 55, 0.04); border: 1px solid rgba(212, 175, 55, 0.10); border-radius: 8px; }
.rr-head { font-size: 12px; letter-spacing: 0.15em; color: var(--gold-primary); margin-bottom: 8px; }
.rr-item { display: grid; grid-template-columns: 110px 200px 90px 1fr; gap: 12px; padding: 6px 0; font-size: 12px; align-items: center; border-bottom: 1px dashed rgba(212, 175, 55, 0.08);
  &:last-child { border-bottom: none; }
  .rr-time { font-family: 'JetBrains Mono', monospace; color: rgba(212, 175, 55, 0.6); }
  .rr-task { color: var(--text-primary, #F5F5F5); font-weight: 500; }
  .rr-rep { color: var(--gold-primary); }
  .rr-content { color: var(--text-body); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
}

.content-section {
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 18px;
}

.tab-bar { display: flex; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid rgba(212, 175, 55, 0.10); padding-bottom: 6px; }
.tab {
  background: transparent; border: none; padding: 10px 18px; cursor: pointer;
  color: var(--text-body); font-size: 14px; letter-spacing: 0.04em; position: relative; display: flex; align-items: center; gap: 8px;
  transition: color 0.2s;
  &:hover { color: var(--gold-primary); }
  &.active {
    color: var(--gold-primary);
    &::after { content: ''; position: absolute; left: 14px; right: 14px; bottom: -7px; height: 2px; background: var(--gold-primary); border-radius: 1px; }
  }
  .tab-num { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 1px 7px; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 9px; color: var(--gold-primary); background: rgba(212, 175, 55, 0.06); }
}

.urgent-banner {
  display: flex; align-items: center; gap: 10px; padding: 12px 18px; margin-bottom: 18px;
  background: linear-gradient(90deg, rgba(245, 108, 108, 0.18), rgba(245, 108, 108, 0.04));
  border-left: 3px solid #F56C6C; border-radius: 6px;
  font-size: 13px; color: #F56C6C; font-weight: 600; letter-spacing: 0.05em;
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #F56C6C; box-shadow: 0 0 10px rgba(245, 108, 108, 0.7); animation: pulse 1.5s infinite; }
}
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.6; }
}

.detail-block { padding: 4px 6px; }
.report-block { margin-top: 22px; }
.report-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
  h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
}
.report-card {
  padding: 12px 14px; background: rgba(212, 175, 55, 0.04); border: 1px solid rgba(212, 175, 55, 0.10); border-radius: 8px;
  .reporter { font-size: 13px; font-weight: 600; color: var(--gold-primary); margin-bottom: 6px; }
  .report-content { font-size: 13px; color: var(--text-body); line-height: 1.7; white-space: pre-wrap; }
}

.readonly-text { color: var(--text-primary); font-weight: 500; }
.readonly-tag { font-size: 11px; padding: 1px 6px; border: 1px solid rgba(245, 108, 108, 0.4); color: #F56C6C; border-radius: 2px; }

:deep(.el-table .row-overdue) { background: rgba(245, 108, 108, 0.10) !important; }
:deep(.el-table .row-overdue:hover > td) { background: rgba(245, 108, 108, 0.16) !important; }
</style>

<template>
  <div class="task-page task-periodic">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 02 / PERIODIC</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">B 类 · 周期性业务</span>
          <span class="title-en">Periodic Routine</span>
        </h1>
        <p class="page-desc">按月度 / 季度 / 年度自动派发的常态化任务调度</p>
      </div>
      <div class="header-actions">
        <el-date-picker v-model="month" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width: 180px" @change="loadList" />
        <el-button type="primary" @click="ensureCurrentMonth">同步周期任务</el-button>
      </div>
    </header>

    <!-- 自动生成提示 -->
    <el-alert v-if="autoGenMessage" :title="autoGenMessage" type="success" :closable="false" show-icon class="auto-gen-alert" />

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx" :class="{ danger: m.danger, success: m.success }">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 视图切换 -->
    <div class="view-switch">
      <button class="sw-btn" :class="{ active: view === 'list' }" @click="view = 'list'">列表视图</button>
      <button class="sw-btn" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">日历视图</button>
    </div>

    <!-- 日历视图 -->
    <section v-if="view === 'calendar'" class="content-section">
      <div class="section-head">
        <h2 class="section-title">{{ month }} 日历排期</h2>
        <span class="section-sub">CALENDAR / SCHEDULE</span>
      </div>
      <div class="calendar-grid">
        <div class="cal-head" v-for="d in ['一','二','三','四','五','六','日']" :key="d">{{ d }}</div>
        <div v-for="(cell, i) in calendarCells" :key="i" class="cal-cell" :class="{ empty: !cell.day, today: cell.isToday }">
          <template v-if="cell.day">
            <div class="cal-day">{{ cell.day }}</div>
            <div class="cal-tasks">
              <span v-for="t in cell.tasks.slice(0, 3)" :key="t.id" class="cal-tag" :class="calTagClass(t)" :title="t.taskName">· {{ shortTaskName(t) }}</span>
              <span v-if="cell.tasks.length > 3" class="cal-more">+{{ cell.tasks.length - 3 }}</span>
            </div>
          </template>
        </div>
      </div>
    </section>

    <!-- 主体：左侧分组卡片 + 右侧周期配置 -->
    <div v-else class="main-grid">
      <section class="content-section">
        <div class="section-head">
          <h2 class="section-title">{{ month }} 月度任务</h2>
          <span class="section-sub">PERIODIC / GROUPED · {{ groups.length }} 类</span>
          <el-button v-if="selected.length" class="btn-ghost" size="small" style="margin-left:auto" @click="batchAssign">
            批量指派 ({{ selected.length }})
          </el-button>
          <el-button v-if="selected.length" class="btn-ghost" size="small" @click="batchComplete">
            批量标记完成
          </el-button>
        </div>

        <div v-loading="loading" class="group-stack">
          <el-collapse v-model="openGroups">
            <el-collapse-item v-for="g in groups" :key="g.subType" :name="g.subType">
              <template #title>
                <div class="group-title">
                  <span class="grp-name">{{ g.subType }}</span>
                  <span class="grp-meta">应执行 {{ g.total }} · 已完成 {{ g.done }} · 进行中 {{ g.doing }} · 逾期 <span class="warn">{{ g.overdue }}</span></span>
                </div>
              </template>
              <el-table :data="g.tasks" @selection-change="onSelectChange" :row-class-name="rowClass" size="small">
                <el-table-column type="selection" width="44" />
                <el-table-column prop="customerName" label="客户名称" min-width="180" show-overflow-tooltip />
                <el-table-column prop="assigneeName" label="执行人" width="120" />
                <el-table-column prop="planEndDate" label="截止日" width="120" />
                <el-table-column label="状态" width="110">
                  <template #default="{ row }">
                    <el-tag :type="statusMap[row.status]?.type" size="small">{{ statusMap[row.status]?.label }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="逾期升级" width="160">
                  <template #default="{ row }">
                    <el-tag v-if="escalation(row).level > 0" :type="escalationTagType(escalation(row).level)" size="small" effect="dark">
                      {{ escalation(row).label }}
                    </el-tag>
                    <span v-else class="on-time">—</span>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="200">
                  <template #default="{ row }">
                    <el-button v-if="row.status === 'pending'" link type="primary" @click="quickAssign(row)">指派</el-button>
                    <el-button v-if="row.status === 'assigned'" link type="success" @click="doStart(row)">开始</el-button>
                    <el-button v-if="row.status === 'in_progress'" link type="warning" @click="doMark(row)">完成</el-button>
                    <el-button v-if="row.status === 'reviewing'" link type="primary" @click="doPass(row)">验收通过</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-collapse-item>
          </el-collapse>
          <el-empty v-if="!loading && !groups.length" description="该月暂无周期性任务" />
        </div>
      </section>

      <aside class="content-section side-rules">
        <div class="section-head">
          <h2 class="section-title">周期标准时效</h2>
          <span class="section-sub">SLA / RULES</span>
        </div>
        <ul class="rule-list">
          <li v-for="r in CYCLE_RULES" :key="r.subType">
            <span class="rule-dot"></span>
            <div>
              <div class="rule-name">{{ r.subType }}</div>
              <div class="rule-text">{{ r.rule }}</div>
            </div>
          </li>
        </ul>
        <div class="esc-rule">
          <div class="section-head" style="margin-top: 18px">
            <h2 class="section-title">逾期升级机制</h2>
          </div>
          <ul class="esc-list">
            <li><span class="step-num">D0</span> 到期当天自动标记逾期</li>
            <li><span class="step-num">D+1</span> 通知主管及时跳转</li>
            <li><span class="step-num">D+3</span> 主管介入协调</li>
            <li><span class="step-num warn">D+7</span> 升级经理接手</li>
          </ul>
        </div>
      </aside>
    </div>

    <!-- 批量指派 Dialog -->
    <el-dialog v-model="dlg.assign" title="批量指派执行人" width="460px">
      <el-form label-width="100px">
        <el-form-item label="选中任务">
          <el-tag>共 {{ selected.length }} 条</el-tag>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="assignName" placeholder="选择执行人" style="width: 100%">
            <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.assign = false">取消</el-button>
        <el-button type="primary" @click="confirmBatchAssign">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { TASK_ASSIGNEES, taskApi, periodicApi, type BizTask } from '@/api/task-center'

const SUB_TYPES = ['月度记账', '月度纳税申报', '季度财务报表', '季度所得税申报', '年度汇算清缴', '年度工商年报', '发票申领', '上门取送票据']
const CYCLE_RULES = [
  { subType: '月度记账', rule: '次月 15 日前完成' },
  { subType: '月度纳税申报', rule: '次月 15 日前申报' },
  { subType: '季度财务报表', rule: '季度末次月 10 日前' },
  { subType: '季度所得税申报', rule: '季度末次月 15 日前' },
  { subType: '年度汇算清缴', rule: '次年 5 月 31 日前' },
  { subType: '年度工商年报', rule: '次年 6 月 30 日前' },
  { subType: '发票申领', rule: '当月 25 日前完成' },
  { subType: '上门取送票据', rule: '每月 1-5 日' }
]
const assigneeOptions = TASK_ASSIGNEES

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger' }> = {
  pending: { label: '待分配', type: 'info' },
  assigned: { label: '已分配', type: 'warning' },
  in_progress: { label: '进行中', type: 'primary' },
  reviewing: { label: '待验收', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已逾期', type: 'danger' },
  closed: { label: '已暂停', type: 'info' }
}

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const month = ref<string>((() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})())

const loading = ref(false)
const all = ref<(BizTask & { _subType: string })[]>([])
const openGroups = ref<string[]>([])
const selected = ref<BizTask[]>([])
const dlg = reactive({ assign: false })
const assignName = ref('')
const view = ref<'list' | 'calendar'>('list')
const autoGenMessage = ref('')

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
  const list: BizTask[] = raw ? (() => { try { return JSON.parse(raw) } catch { return [] } })() : []
  // 不再写入种子数据，仅读取已有数据
  void list
}

function inMonth(d: string, m: string) { return d && d.startsWith(m) }

async function loadList() {
  loading.value = true
  try {
    // 检查本月周期任务是否已生成，未生成则自动批量创建
    const today = new Date()
    const cur = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
    if (month.value === cur) {
      const r: any = await periodicApi.ensureMonthly(cur)
      if (r.generated > 0) autoGenMessage.value = `本月已自动生成 ${r.generated} 个周期任务`
      else autoGenMessage.value = `${r.message}（共 ${r.total} 条）`
    } else {
      autoGenMessage.value = ''
    }
    const res: any = await taskApi.list({ pageSize: 9999 })
    const tasks: (BizTask & { _subType: string })[] = (res.list as BizTask[])
      .filter(t => parseRemark(t.remark).cat === 'B')
      .map(t => ({ ...t, _subType: parseRemark(t.remark).subType }))
    all.value = tasks.filter(t => inMonth(t.planEndDate, month.value))
    openGroups.value = SUB_TYPES.slice(0, 3)
  } finally { loading.value = false }
}

async function ensureCurrentMonth() {
  const r: any = await periodicApi.ensureMonthly(month.value)
  autoGenMessage.value = r.message || (r.generated ? `已生成 ${r.generated} 条周期任务` : `该月已有 ${r.total || 0} 条周期任务`)
  ElMessage.success(autoGenMessage.value)
  await loadList()
}

function rowClass({ row }: { row: BizTask }) {
  if (!row.planEndDate) return ''
  if (row.status === 'completed' || row.status === 'closed') return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(row.planEndDate).getTime() < today.getTime() ? 'row-overdue' : ''
}

const groups = computed(() => {
  const map: Record<string, (BizTask & { _subType: string })[]> = {}
  all.value.forEach(t => { (map[t._subType] ||= []).push(t) })
  return SUB_TYPES.filter(s => map[s]?.length).map(s => {
    const arr = map[s]
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return {
      subType: s,
      tasks: arr,
      total: arr.length,
      done: arr.filter(t => t.status === 'completed' || t.status === 'closed').length,
      doing: arr.filter(t => t.status === 'in_progress' || t.status === 'reviewing').length,
      overdue: arr.filter(t => t.status !== 'completed' && t.status !== 'closed' && new Date(t.planEndDate).getTime() < today.getTime()).length
    }
  })
})

const metrics = computed(() => {
  const arr = all.value
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return [
    { label: '本月任务总数', value: arr.length },
    { label: '已完成', value: arr.filter(t => t.status === 'completed' || t.status === 'closed').length, success: true },
    { label: '进行中', value: arr.filter(t => t.status === 'in_progress' || t.status === 'reviewing' || t.status === 'assigned').length },
    { label: '逾期', value: arr.filter(t => t.status !== 'completed' && t.status !== 'closed' && new Date(t.planEndDate).getTime() < today.getTime()).length, danger: true }
  ]
})

function onSelectChange(rows: BizTask[]) { selected.value = rows }

function escalation(row: BizTask) {
  return periodicApi.escalation(row)
}

function escalationTagType(level: number): 'info' | 'warning' | 'danger' {
  if (level >= 4) return 'danger'
  if (level >= 2) return 'warning'
  return 'info'
}

// 日历视图
const calendarCells = computed(() => {
  const [y, mo] = month.value.split('-').map(Number)
  const lastDay = new Date(y, mo, 0).getDate()
  // 周一为 0
  const offset = (new Date(y, mo - 1, 1).getDay() + 6) % 7
  const cells: { day: number; tasks: (BizTask & { _subType?: string })[]; isToday: boolean }[] = []
  for (let i = 0; i < offset; i++) cells.push({ day: 0, tasks: [], isToday: false })
  const todayStr = new Date().toISOString().slice(0, 10)
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${month.value}-${String(d).padStart(2, '0')}`
    cells.push({
      day: d,
      tasks: all.value.filter(t => t.planEndDate === dateStr),
      isToday: dateStr === todayStr
    })
  }
  while (cells.length % 7 !== 0) cells.push({ day: 0, tasks: [], isToday: false })
  return cells
})

function calTagClass(t: BizTask) {
  if (t.status === 'completed' || t.status === 'closed') return 'tag-done'
  const lv = periodicApi.escalation(t).level
  if (lv >= 2) return 'tag-overdue'
  if (lv === 1) return 'tag-warn'
  return 'tag-normal'
}

function shortTaskName(t: BizTask & { _subType?: string }) {
  return (t._subType || t.taskName || '任务').slice(0, 6)
}

function batchAssign() {
  if (!selected.value.length) return
  assignName.value = ''
  dlg.assign = true
}

async function confirmBatchAssign() {
  if (!assignName.value) return ElMessage.warning('请选择执行人')
  for (const t of selected.value) {
    if (t.status === 'pending' || t.status === 'assigned') {
      await taskApi.assign({ id: t.id, assigneeId: 2000 + Math.floor(Math.random() * 99), assigneeName: assignName.value })
    }
  }
  ElMessage.success(`已批量指派 ${selected.value.length} 条任务`)
  dlg.assign = false
  loadList()
}

async function batchComplete() {
  for (const t of selected.value) {
    if (t.status === 'in_progress') {
      await taskApi.complete({ id: t.id })
    }
  }
  ElMessage.success('已批量标记完成')
  loadList()
}

async function quickAssign(row: BizTask) {
  await taskApi.assign({ id: row.id, assigneeId: row.assigneeId || 2000, assigneeName: row.assigneeName || '' })
  ElMessage.success('已指派')
  loadList()
}

async function doStart(row: BizTask) { await taskApi.start(row.id); ElMessage.success('已开始'); loadList() }
async function doMark(row: BizTask) { await taskApi.complete({ id: row.id }); ElMessage.success('已提交完成'); loadList() }
async function doPass(row: BizTask) { await taskApi.review({ id: row.id, result: 'pass', opinion: '验收通过' }); ElMessage.success('验收通过'); loadList() }

onMounted(() => { ensureSeed(); loadList() })
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 22px; padding: 8px 4px 32px; }

.page-header {
  position: relative; padding: 30px 36px 26px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22); border-radius: 14px; overflow: hidden;
  display: flex; align-items: flex-end; justify-content: space-between;
  &::before { content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
                radial-gradient(circle at 8% 90%, rgba(94, 159, 234, 0.10), transparent 50%);
    pointer-events: none; }
  .header-meta, .header-main, .header-actions { position: relative; z-index: 1; }
}
.header-meta { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: var(--gold-primary, #D4AF37); margin-bottom: 14px; }
.meta-tag { padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 2px; background: rgba(212, 175, 55, 0.06); }
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }

.page-title { display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn { font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .title-en { font-family: 'Playfair Display', 'Georgia', serif; font-style: italic; font-size: 18px; color: rgba(212, 175, 55, 0.55); }
}
.page-desc { font-size: 13px; color: var(--text-body, #A09B8C); margin: 0; }

.btn-ghost { background: transparent !important; border: 1px solid rgba(212, 175, 55, 0.35) !important; color: var(--gold-primary, #D4AF37) !important;
  &:hover { background: rgba(212, 175, 55, 0.08) !important; } }

.metric-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 10px; overflow: hidden;
}
.metric-item { position: relative; padding: 18px 22px; border-right: 1px solid rgba(212, 175, 55, 0.08);
  &:last-child { border-right: none; }
  &.danger .metric-value { color: #F56C6C; }
  &.success .metric-value { color: #67C23A; }
  .metric-index { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45); margin-bottom: 6px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: var(--gold-primary, #D4AF37); line-height: 1.1; }
  .metric-label { margin-top: 6px; font-size: 12px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
}

.main-grid { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
@media (max-width: 1100px) { .main-grid { grid-template-columns: 1fr; } }

.content-section {
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 18px;
}
.section-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; padding-left: 4px; }
.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5); margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }

.group-stack :deep(.el-collapse) { border: none; }
.group-stack :deep(.el-collapse-item__header) {
  background: rgba(212, 175, 55, 0.04); border: 1px solid rgba(212, 175, 55, 0.10); border-radius: 8px;
  padding: 0 18px; margin-top: 10px; height: 52px;
}
.group-stack :deep(.el-collapse-item__wrap) { background: transparent; border: none; }
.group-stack :deep(.el-collapse-item__content) { padding: 12px 0 4px; }
.group-title { display: flex; align-items: center; gap: 16px; width: 100%; }
.grp-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.grp-meta { font-size: 12px; color: var(--text-muted); .warn { color: #F56C6C; } }

.side-rules .rule-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 14px; }
.side-rules .rule-list li { display: flex; gap: 12px; align-items: flex-start;
  .rule-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--gold-primary); margin-top: 6px; flex-shrink: 0; box-shadow: 0 0 8px rgba(212, 175, 55, 0.5); }
  .rule-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
  .rule-text { font-size: 12px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
}

:deep(.el-table .row-overdue) { background: rgba(245, 108, 108, 0.08) !important; }

.auto-gen-alert :deep(.el-alert) { background: rgba(103, 194, 58, 0.08); border: 1px solid rgba(103, 194, 58, 0.3); }
.auto-gen-alert { margin-top: -10px; }

.view-switch { display: flex; gap: 6px; padding: 6px; background: rgba(212, 175, 55, 0.04); border: 1px solid rgba(212, 175, 55, 0.10); border-radius: 8px; align-self: flex-start; }
.sw-btn {
  padding: 7px 18px; background: transparent; border: none; cursor: pointer;
  color: #B8B8C0; font-size: 13px; letter-spacing: 0.04em; border-radius: 5px;
  transition: all 0.2s ease;
  &:hover { color: #FFF7DD; background: rgba(212, 175, 55, 0.08); }
  &.active { color: #12121A; font-weight: 600; background: linear-gradient(135deg, #FFF7DD, #D4AF37); }
}

.calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.cal-head {
  padding: 8px 0; text-align: center; font-size: 12px; letter-spacing: 0.1em;
  color: var(--gold-primary, #D4AF37); background: rgba(212, 175, 55, 0.06);
  border-radius: 4px; font-weight: 600;
}
.cal-cell {
  min-height: 96px; padding: 8px 10px; background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.08); border-radius: 6px;
  display: flex; flex-direction: column; gap: 4px; overflow: hidden;
  &.empty { background: transparent; border-color: transparent; }
  &.today { border-color: var(--gold-primary, #D4AF37); background: rgba(212, 175, 55, 0.10); }
}
.cal-day { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--gold-primary); font-weight: 600; }
.cal-tasks { display: flex; flex-direction: column; gap: 2px; flex: 1; overflow: hidden; }
.cal-tag {
  font-size: 11px; padding: 1px 4px; border-radius: 2px; white-space: nowrap;
  overflow: hidden; text-overflow: ellipsis;
  &.tag-normal { color: #95D475; background: rgba(103, 194, 58, 0.10); }
  &.tag-warn { color: #F2B824; background: rgba(242, 184, 36, 0.12); }
  &.tag-overdue { color: #F56C6C; background: rgba(245, 108, 108, 0.14); }
  &.tag-done { color: #888; background: rgba(255,255,255,0.04); text-decoration: line-through; }
}
.cal-more { font-size: 10px; color: #888; }

.on-time { color: #888; font-size: 12px; }

.esc-rule { margin-top: 18px; padding-top: 18px; border-top: 1px dashed rgba(212, 175, 55, 0.15); }
.esc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px;
  li { display: flex; align-items: center; gap: 12px; font-size: 12px; color: var(--text-body, #B8B8C0); }
  .step-num {
    font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 8px;
    border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 2px; color: var(--gold-primary, #D4AF37);
    background: rgba(212, 175, 55, 0.06);
    &.warn { color: #F56C6C; border-color: rgba(245, 108, 108, 0.4); background: rgba(245, 108, 108, 0.08); }
  }
}
</style>

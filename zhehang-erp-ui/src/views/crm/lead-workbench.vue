<template>
  <div class="lead-workbench">
    <!-- 顶部标题区 -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-eyebrow">
          <span class="eyebrow-dot"></span>
          <span>CRM · OPERATION WORKBENCH</span>
        </div>
        <h1 class="header-title">
          运营工作台
          <span class="title-accent">/ Daily Workspace</span>
        </h1>
        <p class="header-sub">高效完成每日跟进、录入与任务管理</p>
      </div>
      <div class="header-right">
        <div class="header-clock">
          <span class="clock-time">{{ nowTime }}</span>
          <span class="clock-date">{{ nowDate }}</span>
        </div>
        <el-button class="gold-btn" @click="refreshAll" :loading="loading">
          <el-icon><Refresh /></el-icon>
          <span>刷新</span>
        </el-button>
      </div>
    </div>

    <!-- 顶部 - 今日任务概览 -->
    <div class="quick-row">
      <div
        v-for="(item, idx) in quickCards"
        :key="idx"
        class="quick-card"
        :class="item.tone"
        @click="onQuickClick(item)"
      >
        <div class="quick-deco"></div>
        <div class="quick-icon">
          <el-icon :size="22"><component :is="item.icon" /></el-icon>
        </div>
        <div class="quick-main">
          <div class="quick-label">{{ item.label }}</div>
          <div class="quick-value">
            <span class="quick-num">{{ item.value }}</span>
            <span class="quick-unit">条</span>
          </div>
          <div class="quick-extra">{{ item.extra }}</div>
        </div>
        <div class="quick-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <!-- 中间区域 - 双列布局 14:10 -->
    <div class="mid-grid">
      <!-- 左列 - 待办事项 -->
      <div class="panel todo-panel">
        <div class="panel-header">
          <div>
            <div class="panel-title">我的待办</div>
            <div class="panel-sub">My Tasks · 跟进、分配、超期一站管理</div>
          </div>
          <div class="todo-search">
            <el-input
              v-model="todoSearch"
              size="small"
              placeholder="搜索客户/电话"
              class="black-input"
              clearable
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>
        </div>

        <div class="todo-tabs">
          <div
            v-for="tab in todoTabs"
            :key="tab.key"
            class="todo-tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <span class="tab-name">{{ tab.label }}</span>
            <span class="tab-count">{{ tab.count }}</span>
          </div>
        </div>

        <div class="todo-list">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :class="{ overdue: todo.overdue, done: todo.done }"
          >
            <div
              class="todo-bar"
              :style="{ background: priorityColor(todo.priority) }"
            ></div>
            <div class="todo-content">
              <div class="todo-line-1">
                <span class="todo-name">{{ todo.customerName }}</span>
                <span class="todo-prio" :style="{
                  color: priorityColor(todo.priority),
                  borderColor: priorityColor(todo.priority) + '55',
                  background: priorityColor(todo.priority) + '14'
                }">{{ priorityLabel(todo.priority) }}</span>
                <span class="todo-source">{{ todo.source }}</span>
                <span v-if="todo.overdue" class="todo-tag-overdue">已超期</span>
                <span v-if="todo.done" class="todo-tag-done">已完成</span>
              </div>
              <div class="todo-line-2">
                <span class="meta-item">
                  <el-icon><Phone /></el-icon>{{ todo.phone }}
                </span>
                <span class="meta-item">
                  <el-icon><Clock /></el-icon>{{ todo.planTime }}
                </span>
                <span class="meta-item ellipsis">{{ todo.plan }}</span>
              </div>
            </div>
            <div class="todo-actions">
              <button class="line-btn" @click="onFollow(todo)">跟进</button>
              <button
                class="line-btn ok"
                :disabled="todo.done"
                @click="onComplete(todo)"
              >{{ todo.done ? '已完成' : '完成' }}</button>
              <button class="line-btn warn" @click="onDelay(todo)">延期</button>
            </div>
          </div>
          <div v-if="!filteredTodos.length" class="todo-empty">
            <el-icon :size="32"><Coffee /></el-icon>
            <span>没有待办，去喝杯咖啡吧</span>
          </div>
        </div>
      </div>

      <!-- 右列 - 快捷操作面板 -->
      <div class="right-col">
        <div class="panel form-panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">快速录入线索</div>
              <div class="panel-sub">Quick Entry · 4 字段极速建档</div>
            </div>
            <div class="gold-chip">EXPRESS</div>
          </div>

          <div class="quick-form">
            <div class="field">
              <label>公司名称</label>
              <el-input
                v-model="form.company"
                size="default"
                placeholder="请输入公司名称"
                class="black-input"
              />
            </div>
            <div class="field">
              <label>联系人</label>
              <el-input
                v-model="form.contact"
                size="default"
                placeholder="请输入联系人姓名"
                class="black-input"
              />
            </div>
            <div class="field">
              <label>电话</label>
              <el-input
                v-model="form.phone"
                size="default"
                placeholder="请输入联系电话"
                class="black-input"
              />
            </div>
            <div class="field">
              <label>来源</label>
              <el-select
                v-model="form.source"
                size="default"
                placeholder="请选择来源"
                class="black-select"
              >
                <el-option
                  v-for="s in SOURCE_OPTIONS"
                  :key="s"
                  :label="s"
                  :value="s"
                />
              </el-select>
            </div>
            <div class="form-actions">
              <button class="gold-btn-solid" @click="submitLead">
                <el-icon><Plus /></el-icon>
                <span>录入线索</span>
              </button>
              <button class="ghost-btn" @click="resetForm">清空</button>
            </div>
          </div>
        </div>

        <div class="panel recent-panel">
          <div class="panel-header">
            <div>
              <div class="panel-title">最近操作</div>
              <div class="panel-sub">Recent Activity · 最近 5 条</div>
            </div>
            <div class="pulse-tag">LIVE</div>
          </div>
          <div class="recent-list">
            <div
              v-for="(op, idx) in recentOps"
              :key="idx"
              class="recent-item"
            >
              <div class="recent-dot">
                <span></span>
              </div>
              <div class="recent-body">
                <div class="recent-line">
                  <span class="recent-action" :style="{ color: opColor(op.type) }">
                    {{ op.type }}
                  </span>
                  <span class="recent-target">{{ op.target }}</span>
                </div>
                <div class="recent-time">{{ op.time }}</div>
              </div>
            </div>
            <div v-if="!recentOps.length" class="recent-empty">暂无操作记录</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 - 今日跟进时间轴 -->
    <div class="panel timeline-panel">
      <div class="panel-header">
        <div>
          <div class="panel-title">今日跟进时间轴</div>
          <div class="panel-sub">Today Follow-up Timeline · 按计划时间排序</div>
        </div>
        <div class="timeline-stats">
          <span class="tl-stat done">
            <span class="dot"></span>已完成 {{ timelineStats.done }}
          </span>
          <span class="tl-stat pending">
            <span class="dot"></span>待完成 {{ timelineStats.pending }}
          </span>
          <span class="tl-stat overdue">
            <span class="dot"></span>已逾期 {{ timelineStats.overdue }}
          </span>
        </div>
      </div>

      <div class="timeline-track">
        <div class="track-line"></div>
        <div
          v-for="item in todayTimeline"
          :key="item.id"
          class="track-item"
          :class="item.statusClass"
        >
          <div class="track-time">{{ item.time }}</div>
          <div class="track-node">
            <span class="node-outer"></span>
            <span class="node-inner"></span>
          </div>
          <div class="track-card">
            <div class="track-row1">
              <span class="t-name">{{ item.customerName }}</span>
              <span class="t-status" :class="item.statusClass">
                {{ item.statusText }}
              </span>
            </div>
            <div class="track-plan">{{ item.plan }}</div>
            <div class="track-row2">
              <span class="t-meta"><el-icon><User /></el-icon>{{ item.owner }}</span>
              <span class="t-meta"><el-icon><Phone /></el-icon>{{ item.phone }}</span>
            </div>
          </div>
        </div>
        <div v-if="!todayTimeline.length" class="track-empty">今日暂无跟进安排</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  Refresh, ArrowRight, Search, Phone, Clock, Coffee, Plus,
  User, Bell, CircleCheck, Warning, Document, Monitor
} from '@element-plus/icons-vue'

// ========== 数据模型 ==========
interface Lead {
  id: number
  name: string
  company: string
  phone: string
  source: number
  status: number
  ownerName: string
  lastFollowTime: string
  createTime: string
  remark?: string
}

interface TodoItem {
  id: number
  customerName: string
  phone: string
  source: string
  planTime: string
  planTimestamp: number
  plan: string
  priority: 1 | 2 | 3 // 1 高 2 中 3 低
  overdue: boolean
  done: boolean
  category: 'today' | 'overdue' | 'unassigned' | 'other'
}

interface OpRecord {
  type: string
  target: string
  time: string
}

interface TimelinePoint {
  id: number
  customerName: string
  phone: string
  owner: string
  time: string
  plan: string
  statusText: string
  statusClass: 'done' | 'pending' | 'overdue'
  timestamp: number
}

const STORAGE_KEY = 'crm_leads_data'
const SOURCE_MAP = ['天眼查', '老客户转介绍', '运营-美团', '运营-抖音', '线下来客']
const SOURCE_OPTIONS = SOURCE_MAP

const router = useRouter()

// ========== 状态 ==========
const loading = ref(false)
const leads = ref<Lead[]>([])
const todos = ref<TodoItem[]>([])
const recentOps = ref<OpRecord[]>([])
const todoSearch = ref('')
const activeTab = ref<'all' | 'today' | 'overdue' | 'unassigned'>('all')

const nowTime = ref('')
const nowDate = ref('')
let clockTimer: number | null = null

const form = reactive({
  company: '',
  contact: '',
  phone: '',
  source: ''
})

// ========== 时钟 ==========
function tick() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  nowTime.value = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  const week = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  nowDate.value = `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} 周${week}`
}

// ========== 加载数据 ==========
function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      if (Array.isArray(data) && data.length > 0) return data
    }
  } catch (e) {
    /* ignore */
  }
  return genMockLeads()
}

function genMockLeads(): Lead[] {
  const names = ['张磊', '李娜', '王磊', '刘洋', '陈静', '杨帆', '赵雷', '黄薇', '周倩', '吴昊']
  const companies = ['北方贸易', '华东科技', '启明星', '锐航集团', '远见信息', '蓝海动力', '金石资本', '宏图实业', '晨光新材', '九州物联']
  const list: Lead[] = []
  const today = new Date()
  for (let i = 0; i < 80; i++) {
    const offset = Math.floor(Math.random() * 30)
    const d = new Date(today)
    d.setDate(d.getDate() - offset)
    const dateStr = d.toISOString().slice(0, 10)
    list.push({
      id: i + 1,
      name: companies[i % companies.length] + (i > 9 ? i : ''),
      company: names[i % names.length],
      phone: '138' + String(10000000 + i),
      source: 1 + Math.floor(Math.random() * 5),
      status: 1 + Math.floor(Math.random() * 6),
      ownerName: i % 7 === 0 ? '' : names[i % 6],
      lastFollowTime: dateStr + ' 09:00',
      createTime: dateStr + ' 09:00'
    })
  }
  return list
}

function genTodos(src: Lead[]): TodoItem[] {
  const plans = [
    '回访确认报价方案', '发送产品资料', '安排上门拜访',
    '电话沟通需求', '推进合同审核', '协调技术支持',
    '催收款项进度', '介绍新品功能', '解答客户疑问'
  ]
  const out: TodoItem[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const now = Date.now()

  src.slice(0, 22).forEach((l, i) => {
    const seed = (l.id * 7 + i * 13) % 100
    // 计划时间：今天 8:00 ~ 20:00 之间，或前两天
    let dayOffset = 0
    if (seed < 18) dayOffset = -(1 + (seed % 3)) // 超期
    else if (seed < 75) dayOffset = 0            // 今天
    else dayOffset = 1 + (seed % 3)              // 未来

    const hour = 8 + (seed % 12)
    const minute = (seed * 7) % 60
    const planDate = new Date(today)
    planDate.setDate(planDate.getDate() + dayOffset)
    planDate.setHours(hour, minute, 0, 0)

    const overdue = planDate.getTime() < now && dayOffset <= 0
    const done = seed % 11 === 0 && !overdue
    const priority = (seed % 3 === 0 ? 1 : seed % 2 === 0 ? 2 : 3) as 1 | 2 | 3
    const isToday = dayOffset === 0
    const unassigned = !l.ownerName

    let category: TodoItem['category'] = 'other'
    if (overdue) category = 'overdue'
    else if (isToday) category = 'today'
    else if (unassigned) category = 'unassigned'

    out.push({
      id: l.id,
      customerName: l.name,
      phone: l.phone,
      source: SOURCE_MAP[(l.source || 1) - 1] || '其他',
      planTime: formatPlanTime(planDate),
      planTimestamp: planDate.getTime(),
      plan: plans[i % plans.length],
      priority,
      overdue,
      done,
      category
    })
  })
  return out.sort((a, b) => a.planTimestamp - b.planTimestamp)
}

function formatPlanTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dDay = new Date(d)
  dDay.setHours(0, 0, 0, 0)
  const diff = (dDay.getTime() - today.getTime()) / 86400000
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (diff === 0) return `今天 ${hm}`
  if (diff === 1) return `明天 ${hm}`
  if (diff === -1) return `昨天 ${hm}`
  return `${d.getMonth() + 1}/${d.getDate()} ${hm}`
}

function genRecentOps(src: Lead[]): OpRecord[] {
  const types = ['新增线索', '完成跟进', '分配销售', '修改资料', '标记成交']
  const out: OpRecord[] = []
  for (let i = 0; i < 5; i++) {
    const l = src[i] || { name: '客户' + i }
    const t = new Date()
    t.setMinutes(t.getMinutes() - (i * 17 + 3))
    const pad = (n: number) => String(n).padStart(2, '0')
    out.push({
      type: types[i % types.length],
      target: l.name,
      time: `${pad(t.getHours())}:${pad(t.getMinutes())}`
    })
  }
  return out
}

// ========== 顶部快捷卡片 ==========
const todayFollowCount = computed(() =>
  todos.value.filter(t => t.category === 'today' && !t.done).length
)
const todayNewCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return leads.value.filter(l => (l.createTime || '').startsWith(today)).length
})
const overdueCount = computed(() => todos.value.filter(t => t.overdue && !t.done).length)
const todayDoneCount = computed(() => todos.value.filter(t => t.done).length)

const quickCards = computed(() => [
  {
    key: 'today',
    label: '今日待跟进',
    value: todayFollowCount.value,
    icon: Bell,
    tone: 'tone-gold',
    extra: '点击查看今日跟进'
  },
  {
    key: 'new',
    label: '今日新增线索',
    value: todayNewCount.value,
    icon: Plus,
    tone: 'tone-blue',
    extra: '今天录入的线索'
  },
  {
    key: 'overdue',
    label: '超期未跟进',
    value: overdueCount.value,
    icon: Warning,
    tone: 'tone-red',
    extra: '需立即处理'
  },
  {
    key: 'done',
    label: '今日已完成',
    value: todayDoneCount.value,
    icon: CircleCheck,
    tone: 'tone-green',
    extra: '今日已完成跟进'
  }
])

function onQuickClick(item: { key: string }) {
  if (item.key === 'today') activeTab.value = 'today'
  else if (item.key === 'overdue') activeTab.value = 'overdue'
  else if (item.key === 'new') router.push('/leads/index')
  else if (item.key === 'done') ElMessage.success('查看今日完成事项')
}

// ========== Todo Tabs ==========
const todoTabs = computed(() => [
  { key: 'all', label: '全部', count: todos.value.length },
  { key: 'today', label: '今日跟进', count: todos.value.filter(t => t.category === 'today').length },
  { key: 'overdue', label: '超期待办', count: todos.value.filter(t => t.overdue).length },
  { key: 'unassigned', label: '待分配', count: todos.value.filter(t => t.category === 'unassigned').length }
])

const filteredTodos = computed(() => {
  let arr = todos.value
  if (activeTab.value === 'today') arr = arr.filter(t => t.category === 'today')
  else if (activeTab.value === 'overdue') arr = arr.filter(t => t.overdue)
  else if (activeTab.value === 'unassigned') arr = arr.filter(t => t.category === 'unassigned')
  if (todoSearch.value.trim()) {
    const kw = todoSearch.value.trim().toLowerCase()
    arr = arr.filter(t =>
      t.customerName.toLowerCase().includes(kw) ||
      t.phone.includes(kw)
    )
  }
  return arr
})

function priorityColor(p: 1 | 2 | 3): string {
  if (p === 1) return '#EF4444'
  if (p === 2) return '#D4AF37'
  return '#3B82F6'
}
function priorityLabel(p: 1 | 2 | 3): string {
  if (p === 1) return '高优'
  if (p === 2) return '中优'
  return '低优'
}

// ========== 待办操作 ==========
function onFollow(todo: TodoItem) {
  ElMessage.success(`开始跟进 ${todo.customerName}`)
  prependOp('完成跟进', todo.customerName)
}
function onComplete(todo: TodoItem) {
  if (todo.done) return
  todo.done = true
  todo.overdue = false
  ElMessage.success(`已完成 ${todo.customerName} 的跟进`)
  prependOp('标记完成', todo.customerName)
}
function onDelay(todo: TodoItem) {
  const next = new Date(todo.planTimestamp)
  next.setDate(next.getDate() + 1)
  todo.planTimestamp = next.getTime()
  todo.planTime = formatPlanTime(next)
  todo.overdue = false
  if (todo.category === 'overdue') todo.category = 'other'
  ElMessage.info(`已延期至 ${todo.planTime}`)
  prependOp('延期跟进', todo.customerName)
}

// ========== 表单 ==========
function submitLead() {
  if (!form.company.trim() || !form.contact.trim() || !form.phone.trim()) {
    ElMessage.warning('请填写公司名称、联系人和电话')
    return
  }
  if (!/^\d{7,15}$/.test(form.phone.trim())) {
    ElMessage.warning('请输入正确的电话号码')
    return
  }
  const newId = (leads.value.length ? Math.max(...leads.value.map(l => l.id)) : 0) + 1
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const sourceIdx = Math.max(1, SOURCE_MAP.indexOf(form.source) + 1 || 1)
  const lead: Lead = {
    id: newId,
    name: form.company.trim(),
    company: form.contact.trim(),
    phone: form.phone.trim(),
    source: sourceIdx,
    status: 1,
    ownerName: '',
    lastFollowTime: '',
    createTime: ts
  }
  leads.value.unshift(lead)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads.value))
  } catch (e) {
    /* ignore */
  }
  ElMessage.success(`线索"${lead.name}"录入成功`)
  prependOp('新增线索', lead.name)
  resetForm()
}

function resetForm() {
  form.company = ''
  form.contact = ''
  form.phone = ''
  form.source = ''
}

function prependOp(type: string, target: string) {
  const t = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  recentOps.value.unshift({
    type,
    target,
    time: `${pad(t.getHours())}:${pad(t.getMinutes())}`
  })
  if (recentOps.value.length > 5) recentOps.value.length = 5
}

function opColor(type: string): string {
  if (type.includes('新增')) return '#3B82F6'
  if (type.includes('完成') || type.includes('成交')) return '#10B981'
  if (type.includes('延期')) return '#F59E0B'
  if (type.includes('分配')) return '#8B5CF6'
  return '#D4AF37'
}

// ========== 今日时间轴 ==========
const todayTimeline = computed<TimelinePoint[]>(() => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = today.getTime() + 86400000
  const now = Date.now()
  return todos.value
    .filter(t => t.planTimestamp >= today.getTime() && t.planTimestamp < tomorrow)
    .map(t => {
      let statusText = '待完成'
      let statusClass: 'done' | 'pending' | 'overdue' = 'pending'
      if (t.done) { statusText = '已完成'; statusClass = 'done' }
      else if (t.planTimestamp < now) { statusText = '已逾期'; statusClass = 'overdue' }
      const d = new Date(t.planTimestamp)
      const pad = (n: number) => String(n).padStart(2, '0')
      return {
        id: t.id,
        customerName: t.customerName,
        phone: t.phone,
        owner: '我',
        time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
        plan: t.plan,
        statusText,
        statusClass,
        timestamp: t.planTimestamp
      }
    })
    .sort((a, b) => a.timestamp - b.timestamp)
})

const timelineStats = computed(() => ({
  done: todayTimeline.value.filter(t => t.statusClass === 'done').length,
  pending: todayTimeline.value.filter(t => t.statusClass === 'pending').length,
  overdue: todayTimeline.value.filter(t => t.statusClass === 'overdue').length
}))

// ========== 刷新 ==========
function refreshAll() {
  loading.value = true
  setTimeout(() => {
    leads.value = loadLeads()
    todos.value = genTodos(leads.value)
    recentOps.value = genRecentOps(leads.value)
    loading.value = false
    ElMessage.success('数据已刷新')
  }, 350)
}

// ========== 生命周期 ==========
onMounted(() => {
  leads.value = loadLeads()
  todos.value = genTodos(leads.value)
  recentOps.value = genRecentOps(leads.value)
  tick()
  clockTimer = window.setInterval(tick, 1000)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})

// 避免摇树
void Document
void Monitor
</script>

<style lang="scss" scoped>
.lead-workbench {
  padding: 16px;
  background: #0A0A0F;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  color: #E5E5EC;
}

/* ========== 复用页头样式 ========== */
.page-header {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 22px 24px;
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 0% 0%, rgba(212, 175, 55, 0.12), transparent 40%),
      radial-gradient(circle at 100% 100%, rgba(59, 130, 246, 0.08), transparent 40%);
    pointer-events: none;
  }
  &::after {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent);
  }
}
.header-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 2px;
  color: rgba(212, 175, 55, 0.75);
  margin-bottom: 8px;
}
.eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #D4AF37;
  box-shadow: 0 0 10px #D4AF37;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.header-title {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #E5E5EC;
  letter-spacing: 0.5px;
  display: flex;
  align-items: baseline;
  gap: 12px;

  .title-accent {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 400;
    color: rgba(212, 175, 55, 0.55);
    letter-spacing: 1px;
  }
}
.header-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: #A8A8B3;
}
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.header-clock {
  text-align: right;
  .clock-time {
    display: block;
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: #D4AF37;
    line-height: 1.1;
    letter-spacing: 1px;
  }
  .clock-date {
    display: block;
    font-size: 11px;
    color: #A8A8B3;
    margin-top: 2px;
    letter-spacing: 1px;
  }
}

/* ========== 通用按钮 ========== */
.gold-btn {
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.18);
    border-color: rgba(212, 175, 55, 0.55);
    color: #F4D03F;
  }
}
.gold-btn-solid {
  flex: 1;
  background: linear-gradient(135deg, #F4D03F 0%, #D4AF37 60%, #B8941F 100%);
  color: #0A0A0F;
  border: none;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  box-shadow: 0 4px 16px rgba(212, 175, 55, 0.35);
  transition: all 0.25s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(212, 175, 55, 0.55);
  }
}
.ghost-btn {
  background: transparent;
  color: #A8A8B3;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  height: 40px;
  padding: 0 16px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  &:hover { color: #D4AF37; border-color: rgba(212, 175, 55, 0.45); }
}

/* ========== 顶部快捷卡片 ========== */
.quick-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.quick-card {
  --accent: #D4AF37;
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;

  &.tone-gold  { --accent: #D4AF37; }
  &.tone-blue  { --accent: #3B82F6; }
  &.tone-red   { --accent: #EF4444; }
  &.tone-green { --accent: #10B981; }

  &:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow:
      0 8px 28px rgba(0,0,0,0.45),
      0 0 0 1px var(--accent);

    .quick-deco { opacity: 0.6; transform: scale(1.15); }
    .quick-arrow { color: var(--accent); transform: translateX(3px); }
  }
}
.quick-deco {
  position: absolute;
  top: -30px; right: -30px;
  width: 110px; height: 110px;
  border-radius: 50%;
  background: var(--accent);
  filter: blur(40px);
  opacity: 0.35;
  transition: all 0.4s ease;
  pointer-events: none;
}
.quick-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 50%, transparent));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 18px -4px var(--accent);
  position: relative;
  z-index: 1;
}
.quick-main {
  flex: 1;
  min-width: 0;
  position: relative;
  z-index: 1;
}
.quick-label {
  font-size: 12px;
  color: #A8A8B3;
  letter-spacing: 1px;
}
.quick-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 2px;
  .quick-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.5px;
    line-height: 1.1;
  }
  .quick-unit {
    font-size: 12px;
    color: rgba(212, 175, 55, 0.6);
  }
}
.quick-extra {
  margin-top: 4px;
  font-size: 11px;
  color: #6A6A75;
  letter-spacing: 0.4px;
}
.quick-arrow {
  color: #6A6A75;
  transition: all 0.25s ease;
  position: relative;
  z-index: 1;
}

/* ========== 通用面板 ========== */
.panel {
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 18px 20px;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s ease;
  &:hover { border-color: rgba(212, 175, 55, 0.35); }
}
.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.panel-title {
  font-weight: 600;
  font-size: 15px;
  color: #E5E5EC;
}
.panel-sub {
  font-size: 11px;
  color: #6A6A75;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  margin-top: 3px;
}
.gold-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.12);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
}
.pulse-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.12);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.3);
  position: relative;
  &::before {
    content: '';
    display: inline-block;
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #10B981;
    margin-right: 4px;
    box-shadow: 0 0 8px #10B981;
    animation: pulse 1.6s ease-in-out infinite;
    vertical-align: middle;
  }
}

/* ========== 中间布局 ========== */
.mid-grid {
  display: grid;
  grid-template-columns: 14fr 10fr;
  gap: 16px;
}
.right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ========== Todo 面板 ========== */
.todo-panel {
  display: flex;
  flex-direction: column;
}
.todo-search {
  width: 220px;
}
.todo-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  padding: 4px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 10px;
  border: 1px solid rgba(212, 175, 55, 0.08);
}
.todo-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 10px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  color: #A8A8B3;
  transition: all 0.2s ease;
  user-select: none;

  &:hover { color: #E5E5EC; }
  &.active {
    background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08));
    color: #D4AF37;
    box-shadow: inset 0 0 0 1px rgba(212, 175, 55, 0.35);
  }
  .tab-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    padding: 1px 7px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.05);
    color: #D4AF37;
  }
  &.active .tab-count {
    background: rgba(212, 175, 55, 0.2);
  }
}
.todo-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 5px; }
  &::-webkit-scrollbar-thumb { background: rgba(212,175,55,0.3); border-radius: 3px; }
}
.todo-item {
  display: flex;
  align-items: stretch;
  background: rgba(255, 255, 255, 0.018);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  overflow: hidden;
  transition: all 0.25s ease;

  &:hover {
    border-color: rgba(212, 175, 55, 0.35);
    background: rgba(212, 175, 55, 0.04);
    transform: translateX(2px);
  }
  &.overdue {
    background: linear-gradient(90deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02));
    border-color: rgba(239, 68, 68, 0.35);
  }
  &.done {
    opacity: 0.55;
    .todo-name { text-decoration: line-through; }
  }
}
.todo-bar {
  width: 4px;
  flex-shrink: 0;
}
.todo-content {
  flex: 1;
  padding: 10px 14px;
  min-width: 0;
}
.todo-line-1 {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.todo-name {
  font-size: 13px;
  font-weight: 600;
  color: #E5E5EC;
}
.todo-prio {
  font-size: 10px;
  letter-spacing: 0.5px;
  padding: 1px 6px;
  border-radius: 4px;
  border: 1px solid;
  font-family: 'JetBrains Mono', monospace;
}
.todo-source {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.todo-tag-overdue {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(239, 68, 68, 0.15);
  color: #EF4444;
  border: 1px solid rgba(239, 68, 68, 0.4);
  font-weight: 600;
  letter-spacing: 0.5px;
}
.todo-tag-done {
  font-size: 10px;
  padding: 1px 7px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.15);
  color: #10B981;
  border: 1px solid rgba(16, 185, 129, 0.4);
}
.todo-line-2 {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  font-size: 11px;
  color: #A8A8B3;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  .el-icon { color: #6A6A75; }
  &.ellipsis {
    font-family: inherit;
    color: #C8C8D2;
    max-width: 260px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.todo-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 14px;
  border-left: 1px dashed rgba(212, 175, 55, 0.12);
  flex-shrink: 0;
}
.line-btn {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #D4AF37;
  padding: 5px 11px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  &:hover {
    background: rgba(212, 175, 55, 0.12);
    border-color: rgba(212, 175, 55, 0.5);
  }
  &.ok {
    border-color: rgba(16, 185, 129, 0.4);
    color: #10B981;
    &:hover {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.6);
    }
    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }
  &.warn {
    border-color: rgba(245, 158, 11, 0.4);
    color: #F59E0B;
    &:hover {
      background: rgba(245, 158, 11, 0.12);
      border-color: rgba(245, 158, 11, 0.6);
    }
  }
}
.todo-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px 0;
  color: #6A6A75;
  font-size: 13px;
  .el-icon { color: rgba(212, 175, 55, 0.4); }
}

/* ========== 表单 ========== */
.quick-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    font-size: 11px;
    color: #A8A8B3;
    letter-spacing: 1px;
    font-family: 'JetBrains Mono', monospace;
    text-transform: uppercase;
    &::before {
      content: '◆ ';
      color: #D4AF37;
      font-size: 9px;
    }
  }
}
.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

/* 黑色输入框样式覆盖 */
:deep(.black-input .el-input__wrapper),
:deep(.black-select .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow: none !important;
  border-radius: 8px;
  transition: all 0.2s ease;
}
:deep(.black-input .el-input__wrapper:hover),
:deep(.black-select .el-input__wrapper:hover) {
  border-color: rgba(212, 175, 55, 0.4);
}
:deep(.black-input.is-focus .el-input__wrapper),
:deep(.black-input .el-input__wrapper.is-focus),
:deep(.black-select .el-input__wrapper.is-focus) {
  border-color: #D4AF37 !important;
  box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.15) !important;
}
:deep(.black-input .el-input__inner),
:deep(.black-select .el-input__inner) {
  color: #E5E5EC;
}
:deep(.black-input .el-input__inner::placeholder),
:deep(.black-select .el-input__inner::placeholder) {
  color: #5A5A65;
}

/* ========== 最近操作 ========== */
.recent-list {
  position: relative;
  padding-left: 8px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.recent-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
}
.recent-dot {
  width: 10px;
  margin-top: 6px;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  position: relative;
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #D4AF37;
    box-shadow: 0 0 10px rgba(212, 175, 55, 0.7);
    position: relative;
    z-index: 1;
  }
  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    width: 1px;
    height: calc(100% + 10px);
    background: linear-gradient(180deg, rgba(212,175,55,0.4), rgba(212,175,55,0.05));
    transform: translateX(-50%);
  }
}
.recent-item:last-child .recent-dot::before { display: none; }
.recent-body {
  flex: 1;
  min-width: 0;
}
.recent-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
}
.recent-action {
  font-size: 12px;
  font-weight: 600;
}
.recent-target {
  font-size: 12px;
  color: #C8C8D2;
}
.recent-time {
  font-size: 10px;
  color: #6A6A75;
  font-family: 'JetBrains Mono', monospace;
  margin-top: 2px;
  letter-spacing: 0.5px;
}
.recent-empty {
  text-align: center;
  padding: 20px 0;
  color: #6A6A75;
  font-size: 12px;
}

/* ========== 时间轴 ========== */
.timeline-stats {
  display: flex;
  gap: 14px;
}
.tl-stat {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #A8A8B3;
  .dot {
    width: 8px; height: 8px;
    border-radius: 50%;
  }
  &.done .dot   { background: #10B981; box-shadow: 0 0 8px #10B981; }
  &.pending .dot{ background: #D4AF37; box-shadow: 0 0 8px #D4AF37; }
  &.overdue .dot{ background: #EF4444; box-shadow: 0 0 8px #EF4444; }
}
.timeline-track {
  position: relative;
  padding: 16px 0 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.track-line {
  position: absolute;
  left: 88px;
  top: 16px;
  bottom: 8px;
  width: 1px;
  background: linear-gradient(180deg,
    rgba(212,175,55,0.05) 0%,
    rgba(212,175,55,0.4) 20%,
    rgba(212,175,55,0.4) 80%,
    rgba(212,175,55,0.05) 100%);
}
.track-item {
  display: grid;
  grid-template-columns: 76px 24px 1fr;
  gap: 12px;
  align-items: center;
}
.track-time {
  text-align: right;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #D4AF37;
  letter-spacing: 0.5px;
}
.track-node {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  .node-outer {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: rgba(212, 175, 55, 0.15);
    border: 1px solid rgba(212, 175, 55, 0.4);
    position: absolute;
  }
  .node-inner {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: #D4AF37;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.7);
    position: relative;
    z-index: 1;
  }
}
.track-item.done .node-inner {
  background: #10B981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.7);
}
.track-item.done .node-outer {
  background: rgba(16, 185, 129, 0.15);
  border-color: rgba(16, 185, 129, 0.45);
}
.track-item.overdue .node-inner {
  background: #EF4444;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
  animation: pulse 1.4s ease-in-out infinite;
}
.track-item.overdue .node-outer {
  background: rgba(239, 68, 68, 0.15);
  border-color: rgba(239, 68, 68, 0.45);
}
.track-card {
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.022);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  transition: all 0.25s ease;
  &:hover {
    border-color: rgba(212, 175, 55, 0.4);
    background: rgba(212, 175, 55, 0.04);
    transform: translateX(3px);
  }
}
.track-item.overdue .track-card {
  border-color: rgba(239, 68, 68, 0.3);
  background: linear-gradient(90deg, rgba(239,68,68,0.08), rgba(239,68,68,0.01));
}
.track-row1 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.t-name {
  font-size: 13px;
  font-weight: 600;
  color: #E5E5EC;
}
.t-status {
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 999px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.5px;
  &.done {
    color: #10B981;
    background: rgba(16,185,129,0.12);
    border: 1px solid rgba(16,185,129,0.35);
  }
  &.pending {
    color: #D4AF37;
    background: rgba(212,175,55,0.12);
    border: 1px solid rgba(212,175,55,0.35);
  }
  &.overdue {
    color: #EF4444;
    background: rgba(239,68,68,0.15);
    border: 1px solid rgba(239,68,68,0.4);
  }
}
.track-plan {
  font-size: 12px;
  color: #C8C8D2;
  margin-bottom: 5px;
}
.track-row2 {
  display: flex;
  gap: 14px;
  font-size: 11px;
  color: #A8A8B3;
  .t-meta {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    .el-icon { color: #6A6A75; }
  }
}
.track-empty {
  text-align: center;
  padding: 30px 0;
  color: #6A6A75;
  font-size: 13px;
}

/* ========== 响应式 ========== */
@media (max-width: 1280px) {
  .quick-row { grid-template-columns: repeat(2, 1fr); }
  .mid-grid { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .quick-row { grid-template-columns: 1fr; }
  .todo-actions {
    flex-direction: column;
    padding: 8px 10px;
    gap: 4px;
  }
  .track-item { grid-template-columns: 64px 20px 1fr; }
  .track-line { left: 74px; }
}
</style>

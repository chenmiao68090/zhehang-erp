<template>
  <div class="dashboard-home">
    <!-- 欢迎栏 -->
    <div class="welcome-card">
      <div class="welcome-info">
        <h2>{{ greeting }}，{{ userName }}</h2>
        <p class="welcome-summary">{{ aiSummary || '今日工作加油！' }}</p>
      </div>
      <div class="welcome-right">
        <div class="hire-days">
          <el-icon :size="16"><Timer /></el-icon>
          <span class="hire-label">您已入职</span>
          <span class="hire-value">{{ hireDays }}</span>
          <span class="hire-label">天</span>
        </div>
        <div class="welcome-date">
          <el-icon :size="18"><Calendar /></el-icon>
          <span>{{ currentDateStr }}</span>
        </div>
      </div>
    </div>

    <!-- 基本信息卡片 -->
    <div class="profile-card">
      <div class="profile-title">基本信息</div>
      <div class="profile-grid">
        <div class="profile-item">
          <div class="profile-icon"><el-icon :size="18"><UserIcon /></el-icon></div>
          <div class="profile-text">
            <div class="profile-label">姓名</div>
            <div class="profile-value">{{ profileName }}</div>
          </div>
        </div>
        <div class="profile-item">
          <div class="profile-icon"><el-icon :size="18"><Briefcase /></el-icon></div>
          <div class="profile-text">
            <div class="profile-label">职位</div>
            <div class="profile-value">{{ profilePost }}</div>
          </div>
        </div>
        <div class="profile-item">
          <div class="profile-icon"><el-icon :size="18"><OfficeBuilding /></el-icon></div>
          <div class="profile-text">
            <div class="profile-label">部门</div>
            <div class="profile-value">{{ profileDept }}</div>
          </div>
        </div>
        <div class="profile-item">
          <div class="profile-icon"><el-icon :size="18"><Calendar /></el-icon></div>
          <div class="profile-text">
            <div class="profile-label">入职时间</div>
            <div class="profile-value">{{ profileHireDate }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片行 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="(stat, idx) in statCards" :key="idx">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bgColor }">
            <el-icon :size="24" color="#fff"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 主内容区 -->
    <el-row :gutter="16">
      <el-col :span="16">
        <!-- 快捷导航九宫格 -->
        <el-card class="shortcut-card" shadow="never">
          <template #header><span class="card-title">{{ $t('dashboard.shortcut') }}</span></template>
          <div class="shortcut-grid">
            <div v-for="item in shortcuts" :key="item.path" class="shortcut-item" @click="router.push(item.path)">
              <div class="shortcut-icon" :style="{ background: item.color }">
                <el-icon :size="22" color="#fff"><component :is="item.icon" /></el-icon>
              </div>
              <span class="shortcut-name">{{ item.name }}</span>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t('dashboard.todoList') }}</span>
              <el-badge :value="pendingCount" :max="99" type="danger" />
            </div>
          </template>
          <div v-if="todoList.length === 0" class="empty-tip">{{ $t('dashboard.noTodo') }}</div>
          <div class="todo-list" v-else>
            <div v-for="todo in todoList" :key="todo.id" class="todo-item" :class="{ done: todo.status === 'done' }">
              <div class="todo-left">
                <el-checkbox :model-value="todo.status === 'done'" @change="toggleTodo(todo)" />
                <el-tag :type="priorityTagType(todo.priority)" size="small" effect="plain">
                  {{ $t('dashboard.priority.' + todo.priority) }}
                </el-tag>
                <span class="todo-title">{{ todo.title }}</span>
              </div>
              <div class="todo-right">
                <el-tag size="small" effect="light">{{ $t('dashboard.todoType.' + todo.type) }}</el-tag>
                <span class="todo-date">{{ todo.dueDate }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <!-- 通知公告 -->
        <el-card class="notice-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">{{ $t('dashboard.notice') }}</span>
              <el-link type="primary" :underline="false" @click="router.push('/system/notification')">{{ $t('common.viewAll') }}</el-link>
            </div>
          </template>
          <div v-if="notices.length === 0" class="empty-tip">{{ $t('dashboard.noNotice') }}</div>
          <div class="notice-list" v-else>
            <div v-for="n in notices" :key="n.id" class="notice-item">
              <el-tag :type="n.type === 'announcement' ? 'danger' : 'info'" size="small" effect="plain">
                {{ n.type === 'announcement' ? '公告' : '通知' }}
              </el-tag>
              <span class="notice-title text-ellipsis">{{ n.title }}</span>
              <span class="notice-time">{{ n.publishTime }}</span>
            </div>
          </div>
        </el-card>

        <!-- 日历 -->
        <el-card class="calendar-card" shadow="never">
          <template #header><span class="card-title">{{ $t('dashboard.schedule') }}</span></template>
          <el-calendar v-model="calendarDate" class="mini-calendar" />
        </el-card>

        <!-- 最近访问 -->
        <el-card class="recent-card" shadow="never">
          <template #header><span class="card-title">{{ $t('dashboard.recentVisit') }}</span></template>
          <div v-if="recentVisits.length === 0" class="empty-tip">{{ $t('dashboard.noRecentVisit') }}</div>
          <div class="recent-list" v-else>
            <div v-for="(item, idx) in recentVisits" :key="idx" class="recent-item" @click="router.push(item.path)">
              <el-icon :size="16" color="#F26522"><Link /></el-icon>
              <span>{{ item.title }}</span>
              <span class="recent-time">{{ item.time }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { getStorage } from '@/utils/storage'
import {
  Calendar, Timer, DocumentChecked, Tickets, User as UserIcon,
  TrendCharts, Link, Setting, Money, DataAnalysis,
  ChatDotRound, Briefcase, List as ListIcon, OfficeBuilding
} from '@element-plus/icons-vue'
import type { TodoItem, NoticeItem } from '@/api/dashboard'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const calendarDate = ref(new Date())

const userName = computed(() => userStore.userInfo?.nickname || '管理员')

// 基本信息卡片
const profileName = computed(() => {
  const u = userStore.userInfo || {}
  return u.nickname || u.realName || u.username || '—'
})
const profilePost = computed(() => {
  const u = userStore.userInfo || {}
  return u.postName || u.position || '—'
})
const profileDept = computed(() => {
  const u = userStore.userInfo || {}
  return u.deptName || u.dept?.name || '—'
})
const profileHireDate = computed(() => {
  const u = userStore.userInfo || {}
  const raw = u.hireDate || u.createTime
  if (!raw) return '—'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return '—'
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('dashboard.welcome.morning')
  if (h < 18) return t('dashboard.welcome.afternoon')
  return t('dashboard.welcome.evening')
})

const aiSummary = ref('')

// 计算入职天数
const hireDays = computed(() => {
  const info = userStore.userInfo
  const dateStr = info?.hireDate || info?.createTime
  if (dateStr) {
    const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 1
  }
  return 365 // mock默认值
})
const currentDateStr = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六']
  return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + w[d.getDay()]
})

const statCards = ref([
  { label: '今日待办', value: 12, icon: 'DocumentChecked', bgColor: '#F26522' },
  { label: '待审批', value: 5, icon: 'Tickets', bgColor: '#3B82F6' },
  { label: '客户跟进', value: 8, icon: 'UserIcon', bgColor: '#10B981' },
  { label: '本月业绩', value: '¥128.6万', icon: 'TrendCharts', bgColor: '#F59E0B' }
])

const shortcuts = ref([
  { name: '客户管理', path: '/crm/customer', icon: 'UserIcon', color: '#F26522' },
  { name: '财务管理', path: '/finance/voucher', icon: 'Money', color: '#3B82F6' },
  { name: '待办任务', path: '/workflow/todo', icon: 'DocumentChecked', color: '#10B981' },
  { name: '合同管理', path: '/crm/contract', icon: 'Briefcase', color: '#8B5CF6' },
  { name: '订单管理', path: '/sales/order', icon: 'ListIcon', color: '#F59E0B' },
  { name: '财务报表', path: '/finance/report', icon: 'DataAnalysis', color: '#EF4444' },
  { name: '通知公告', path: '/system/notification', icon: 'ChatDotRound', color: '#06B6D4' },
  { name: '系统管理', path: '/system/user', icon: 'Setting', color: '#64748B' },
  { name: 'AI 助手', path: '/ai-chat/index', icon: 'ChatDotRound', color: '#EC4899' }
])

const todoList = ref<TodoItem[]>([
  { id: 1, title: '审批张三的报销申请 (¥3,200)', type: 'approval', priority: 'high', status: 'pending', dueDate: '今天 17:00' },
  { id: 2, title: '跟进杭州科技有限公司合同续签', type: 'follow', priority: 'high', status: 'pending', dueDate: '今天 15:00' },
  { id: 3, title: '完成月度销售报告', type: 'task', priority: 'medium', status: 'pending', dueDate: '明天 12:00' },
  { id: 4, title: '回复宁波客户技术咨询', type: 'follow', priority: 'medium', status: 'pending', dueDate: '明天 10:00' },
  { id: 5, title: '检查系统安全日志', type: 'other', priority: 'low', status: 'done', dueDate: '昨天' }
])

const pendingCount = computed(() => todoList.value.filter(t => t.status === 'pending').length)

const notices = ref<NoticeItem[]>([
  { id: 1, title: '2026年端午节放假通知', type: 'announcement', publishTime: '05-16', publisher: '行政部' },
  { id: 2, title: 'ERP系统将于本周日凌晨进行升级维护', type: 'notice', publishTime: '05-15', publisher: '技术部' },
  { id: 3, title: '关于规范出差报销流程的通知', type: 'announcement', publishTime: '05-13', publisher: '财务部' },
  { id: 4, title: '5月份团建活动报名开始', type: 'notice', publishTime: '05-10', publisher: '行政部' },
  { id: 5, title: '新客户管理规范发布', type: 'announcement', publishTime: '05-08', publisher: '销售部' }
])

interface RecentVisit { path: string; title: string; time: string }
const recentVisits = ref<RecentVisit[]>([])

function loadRecentVisits() {
  try {
    const raw = getStorage('recentVisits')
    if (raw) recentVisits.value = JSON.parse(raw).slice(0, 8)
  } catch { recentVisits.value = [] }
}

function toggleTodo(todo: TodoItem) {
  todo.status = todo.status === 'done' ? 'pending' : 'done'
}

function priorityTagType(p: string) {
  if (p === 'high') return 'danger'
  if (p === 'medium') return 'warning'
  return 'info'
}

onMounted(() => {
  loadRecentVisits()
  aiSummary.value = '今日有 12 项待办事项，5 条审批等待处理，重点关注杭州科技合同续签。'
})
</script>

<style lang="scss" scoped>
.dashboard-home { display: flex; flex-direction: column; gap: 16px; }

.welcome-card {
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 24px 32px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4), transparent);
  }

  h2 {
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .welcome-summary {
    color: var(--text-body);
    font-size: 14px;
  }

  .welcome-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .hire-days {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(212, 175, 55, 0.08);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(212, 175, 55, 0.15);
    color: var(--text-muted);

    .el-icon { color: #D4AF37; }

    .hire-label {
      font-size: 13px;
      color: #8B8B9A;
    }

    .hire-value {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #D4AF37;
      line-height: 1;
    }
  }

  .welcome-date {
    color: var(--text-muted);
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    background: rgba(212, 175, 55, 0.08);
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid rgba(212, 175, 55, 0.15);
  }
}

.profile-card {
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 18px 24px;
  position: relative;
}
.profile-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 14px;
  padding-left: 10px;
  border-left: 3px solid #D4AF37;
  line-height: 1;
}
.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.profile-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px;
  transition: all 0.3s ease;
}
.profile-item:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.25);
}
.profile-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  flex-shrink: 0;
}
.profile-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.profile-label { font-size: 12px; color: #8B8B9A; line-height: 1; }
.profile-value {
  font-size: 14px;
  font-weight: 600;
  color: #FFFFFF;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stat-row { margin-bottom: 0 !important; }
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--border-gold-hover);
    box-shadow: var(--shadow-gold);
    transform: translateY(-2px);
  }
}
.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-info {
  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: var(--gold-primary);
    line-height: 1.2;
  }
  .stat-label {
    color: var(--text-muted);
    font-size: 13px;
    margin-top: 4px;
  }
}

.card-title { font-weight: 600; font-size: 15px; color: var(--text-primary); }
.card-header { display: flex; align-items: center; justify-content: space-between; width: 100%; }

:deep(.el-card) {
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.1);
  background: var(--bg-card);
  box-shadow: var(--shadow-card);
  margin-bottom: 16px;
}
:deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
:deep(.el-card__body) { padding: 16px 20px; }

.shortcut-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(212, 175, 55, 0.05);
    transform: translateY(-2px);

    .shortcut-icon {
      box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
    }
  }
}
.shortcut-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: box-shadow 0.3s;
}
.shortcut-name { font-size: 12px; color: var(--text-body); }

.todo-list { display: flex; flex-direction: column; gap: 2px; }
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover { background: rgba(212, 175, 55, 0.05); }
  &.done .todo-title { text-decoration: line-through; color: var(--text-muted); }
}
.todo-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.todo-title { font-size: 14px; color: var(--text-primary); }
.todo-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.todo-date { font-size: 12px; color: var(--text-muted); }

.notice-list { display: flex; flex-direction: column; gap: 2px; }
.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  border-radius: 6px;
  transition: background 0.15s;
  cursor: pointer;
  &:hover { background: rgba(212, 175, 55, 0.05); }
}
.notice-title { flex: 1; font-size: 14px; color: var(--text-primary); }
.notice-time { font-size: 12px; color: var(--text-muted); flex-shrink: 0; }

.mini-calendar :deep(.el-calendar__body) { padding: 0; }
.mini-calendar :deep(.el-calendar-table .el-calendar-day) { height: 36px; padding: 2px; }
.mini-calendar :deep(.el-calendar__header) { padding: 8px 0; }

.recent-list { display: flex; flex-direction: column; gap: 2px; }
.recent-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-primary);
  transition: background 0.15s;
  &:hover { background: rgba(212, 175, 55, 0.05); }
}
.recent-time { margin-left: auto; font-size: 12px; color: var(--text-muted); }
.empty-tip { text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 14px; }
</style>
<template>
  <div class="dashboard-home">
    <!-- 欢迎栏 -->
    <div class="welcome-card">
      <div class="welcome-info">
        <h2>{{ greeting }}，{{ userName }}</h2>
        <p class="welcome-summary">{{ aiSummary || '今日工作加油！' }}</p>
        <div class="welcome-focus">
          <span v-for="item in focusTags" :key="item">{{ item }}</span>
        </div>
      </div>
      <div class="welcome-date">
        <el-icon :size="18"><Calendar /></el-icon>
        <span>{{ currentDateStr }}</span>
      </div>
    </div>

    <!-- 统计卡片行 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :xs="24" :sm="12" :md="8" :lg="4" v-for="(stat, idx) in statCards" :key="idx">
        <div class="stat-card">
          <div class="stat-icon" :style="{ background: stat.bgColor }">
            <el-icon :size="24" color="#fff"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-trend" :class="stat.trendType">{{ stat.trend }}</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-card class="private-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span class="card-title">私域经营看板</span>
          <el-link type="primary" :underline="false" @click="router.push('/leads/private-domain')">打开私域运营</el-link>
        </div>
      </template>
      <div class="private-metric-grid">
        <div v-for="item in privateBossMetrics" :key="item.label" class="private-metric" :class="item.type">
          <span>{{ item.label }}</span>
          <b>{{ item.value }}</b>
          <em>{{ item.trend }}</em>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <el-row :gutter="16">
      <el-col :xs="24" :lg="16">
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

        <!-- 经营漏斗 -->
        <el-card class="funnel-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">今日经营漏斗</span>
              <el-link type="primary" :underline="false" @click="router.push('/dashboard/cockpit')">看经营驾驶舱</el-link>
            </div>
          </template>
          <div class="funnel-list">
            <div v-for="stage in funnelStages" :key="stage.name" class="funnel-stage">
              <div class="funnel-stage-head">
                <span class="stage-name">{{ stage.name }}</span>
                <span class="stage-value">{{ stage.value }}</span>
                <span class="stage-rate">{{ stage.rate }}</span>
              </div>
              <div class="stage-bar">
                <span :style="{ width: stage.percent + '%', background: stage.color }"></span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">今日重点动作</span>
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

        <!-- 业务进展 -->
        <el-card class="progress-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">关键业务进展</span>
              <el-link type="primary" :underline="false" @click="router.push('/order/finance-check')">查看财务核对</el-link>
            </div>
          </template>
          <div class="business-grid">
            <div v-for="item in businessProgress" :key="item.title" class="business-item">
              <div class="business-title">{{ item.title }}</div>
              <div class="business-value">{{ item.value }}</div>
              <div class="business-desc">{{ item.desc }}</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="8">
        <!-- 风险预警 -->
        <el-card class="risk-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">经营风险预警</span>
              <el-tag type="danger" effect="light" size="small">{{ riskAlerts.length }} 项</el-tag>
            </div>
          </template>
          <div class="risk-list">
            <div v-for="risk in riskAlerts" :key="risk.title" class="risk-item" :class="risk.level">
              <div class="risk-top">
                <span class="risk-title">{{ risk.title }}</span>
                <el-tag :type="risk.level === 'high' ? 'danger' : 'warning'" effect="plain" size="small">{{ risk.label }}</el-tag>
              </div>
              <p>{{ risk.desc }}</p>
              <el-link type="primary" :underline="false" @click="router.push(risk.path)">去处理</el-link>
            </div>
          </div>
        </el-card>

        <!-- 今日日程 -->
        <el-card class="schedule-card" shadow="never">
          <template #header><span class="card-title">今日日程</span></template>
          <div class="schedule-list">
            <div v-for="item in schedules" :key="item.time + item.title" class="schedule-item">
              <span class="schedule-time">{{ item.time }}</span>
              <div>
                <div class="schedule-title">{{ item.title }}</div>
                <div class="schedule-desc">{{ item.desc }}</div>
              </div>
            </div>
          </div>
        </el-card>

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
import { privateDomainApi, type PrivateBossMetric } from '@/api/private-domain'
import {
  Calendar, DocumentChecked, Tickets, User as UserIcon,
  TrendCharts, Link, Setting, Money, DataAnalysis,
  ChatDotRound, Briefcase, List as ListIcon
} from '@element-plus/icons-vue'
import type { TodoItem, NoticeItem } from '@/api/dashboard'

const router = useRouter()
const { t } = useI18n()
const userStore = useUserStore()
const calendarDate = ref(new Date())

const userName = computed(() => userStore.userInfo?.nickname || '管理员')
const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('dashboard.welcome.morning')
  if (h < 18) return t('dashboard.welcome.afternoon')
  return t('dashboard.welcome.evening')
})

const aiSummary = ref('')
const focusTags = ref(['网销ROI低于目标需复盘', '同行渠道应收需跟进', '地址资源余量偏紧'])
const currentDateStr = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六']
  return d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日 星期' + w[d.getDay()]
})

const statCards = ref([
  { label: '今日新增线索', value: 86, trend: '网销 52 · 电销 34', trendType: 'up', icon: 'UserIcon', bgColor: '#2563EB' },
  { label: '网销ROI', value: '2.8', trend: '目标 3.2，需优化', trendType: 'warn', icon: 'TrendCharts', bgColor: '#0F766E' },
  { label: '本月回款', value: '¥82.4万', trend: '完成率 64%', trendType: 'up', icon: 'Money', bgColor: '#7C3AED' },
  { label: '待交付订单', value: 39, trend: '逾期 3 单', trendType: 'warn', icon: 'DocumentChecked', bgColor: '#EA580C' },
  { label: '可售地址资源', value: 126, trend: '西湖区偏紧', trendType: 'warn', icon: 'Briefcase', bgColor: '#0891B2' },
  { label: '渠道应收', value: '¥18.6万', trend: '1 家超账期', trendType: 'danger', icon: 'Tickets', bgColor: '#DC2626' }
])

const shortcuts = ref([
  { name: '线索工作台', path: '/leads/workbench', icon: 'UserIcon', color: '#2563EB' },
  { name: '网销ROI', path: '/leads/online-roi', icon: 'TrendCharts', color: '#0F766E' },
  { name: '企业工商库', path: '/customer/enterprise-master', icon: 'Briefcase', color: '#7C3AED' },
  { name: '同行渠道', path: '/supply/channel-partner', icon: 'Tickets', color: '#EA580C' },
  { name: '地址资源池', path: '/supply/receipt', icon: 'ListIcon', color: '#0891B2' },
  { name: '合同订单', path: '/order/contract', icon: 'Briefcase', color: '#F59E0B' },
  { name: '财务日记账', path: '/finance/journal', icon: 'Money', color: '#DC2626' },
  { name: '任务中心', path: '/task-center/once', icon: 'DocumentChecked', color: '#16A34A' },
  { name: '经营驾驶舱', path: '/dashboard/cockpit', icon: 'DataAnalysis', color: '#475569' }
])

const todoList = ref<TodoItem[]>([
  { id: 1, title: '复盘抖音渠道 ROI：消费 ¥12,600，成交 3 单', type: 'task', priority: 'high', status: 'pending', dueDate: '今天 11:30' },
  { id: 2, title: '跟进杭州松柏科技代理记账合同续签', type: 'follow', priority: 'high', status: 'pending', dueDate: '今天 15:00' },
  { id: 3, title: '审批同行渠道“杭企伙伴”月结额度调整', type: 'approval', priority: 'medium', status: 'pending', dueDate: '今天 17:00' },
  { id: 4, title: '确认滨江区挂靠地址资源补充 20 套', type: 'task', priority: 'medium', status: 'pending', dueDate: '明天 10:00' },
  { id: 5, title: '核对昨日新增客户工商信息补全率', type: 'other', priority: 'low', status: 'done', dueDate: '已完成' }
])

const funnelStages = ref([
  { name: '新增线索', value: '86 条', rate: '100%', percent: 100, color: '#2563EB' },
  { name: '有效商机', value: '43 条', rate: '50.0%', percent: 72, color: '#0F766E' },
  { name: '已报价', value: '21 单', rate: '48.8%', percent: 54, color: '#7C3AED' },
  { name: '已签约', value: '9 单', rate: '42.9%', percent: 36, color: '#EA580C' },
  { name: '已回款', value: '7 单', rate: '77.8%', percent: 28, color: '#DC2626' }
])

const businessProgress = ref([
  { title: '代理记账', value: '312 户', desc: '本月新增 24 户，续费预警 11 户' },
  { title: '工商注册', value: '68 单', desc: '待材料 9 单，待核名 6 单' },
  { title: '税务异常解除', value: '17 单', desc: '高优先级 4 单，平均周期 2.8 天' },
  { title: '挂靠地址', value: '53 单', desc: '同行渠道贡献 34 单，占比 64%' }
])

const riskAlerts = ref([
  { title: '网销ROI低于目标', label: '高', level: 'high', desc: '信息流投放 ROI 2.8，低于目标 3.2，建议检查关键词与落地页转化。', path: '/leads/online-roi' },
  { title: '渠道应收超账期', label: '高', level: 'high', desc: '杭企伙伴应收 ¥42,800，超账期 9 天，新单建议先冻结。', path: '/supply/channel-partner' },
  { title: '地址资源余量不足', label: '中', level: 'medium', desc: '西湖区可售资源仅 8 套，按近 7 日消耗预计 4 天用尽。', path: '/supply/receipt' },
  { title: '交付节点临期', label: '中', level: 'medium', desc: '3 个工商注册订单今日需补材料，否则会影响承诺周期。', path: '/task-center/periodic' }
])

const schedules = ref([
  { time: '09:30', title: '营销早会', desc: '复盘昨日线索、成交和投放 ROI' },
  { time: '11:00', title: '渠道应收沟通', desc: '确认超账期渠道付款计划' },
  { time: '15:30', title: '财税交付排期', desc: '处理工商注册和税务异常临期单' }
])

const pendingCount = computed(() => todoList.value.filter(t => t.status === 'pending').length)

const notices = ref<NoticeItem[]>([
  { id: 1, title: '本周起新客户必须补全统一社会信用代码', type: 'announcement', publishTime: '06-03', publisher: '运营部' },
  { id: 2, title: '同行渠道月结额度调整需走主管审批', type: 'notice', publishTime: '06-02', publisher: '财务部' },
  { id: 3, title: '网销落地页新增“工商信息自动带出”表单', type: 'notice', publishTime: '06-01', publisher: '市场部' },
  { id: 4, title: '地址资源池低库存区域请提前 7 天补充', type: 'announcement', publishTime: '05-31', publisher: '渠道资源部' },
  { id: 5, title: '代理记账续费客户回访话术已更新', type: 'notice', publishTime: '05-30', publisher: '客户成功部' }
])

const privateBossMetrics = ref<PrivateBossMetric[]>([
  { label: '私域客户', value: 0, trend: '等待加载', type: 'warn' },
  { label: '工商核验率', value: '0%', trend: '等待加载', type: 'warn' },
  { label: '撞单风险', value: 0, trend: '等待加载', type: 'warn' },
  { label: '成交交付包', value: 0, trend: '等待加载', type: 'warn' }
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

async function loadPrivateBossMetrics() {
  try {
    const data = await privateDomainApi.bossSnapshot()
    privateBossMetrics.value = data.metrics
    const riskMetric = data.metrics.find(item => item.label === '撞单风险')
    const packageMetric = data.metrics.find(item => item.label === '成交交付包')
    focusTags.value = [
      data.summary.duplicateRiskCount ? `私域撞单风险 ${data.summary.duplicateRiskCount} 条` : '私域撞单风险正常',
      `私域成交交付包 ${packageMetric?.value || 0} 个`,
      riskMetric?.type === 'danger' ? '需主管仲裁撞单归属' : '归属规则已启用'
    ]
    businessProgress.value = [
      ...businessProgress.value.filter(item => item.title !== '私域运营').slice(0, 3),
      { title: '私域运营', value: `${data.summary.intentCount} 条`, desc: `客户 ${data.summary.contactCount}，核验 ${data.summary.verifiedCount}，交付包 ${data.summary.deliveryPackageCount}` }
    ]
    aiSummary.value = `今日重点：私域客户 ${data.summary.contactCount} 家，高意向 ${data.summary.intentCount} 条，撞单风险 ${data.summary.duplicateRiskCount} 条，成交后交付包 ${data.summary.deliveryPackageCount} 个。`
  } catch {
    privateBossMetrics.value = privateBossMetrics.value.map(item => ({ ...item, trend: '本地私域数据暂不可读' }))
  }
}

onMounted(async () => {
  loadRecentVisits()
  aiSummary.value = '今日线索增长正常，但网销投产比、同行渠道应收和地址资源库存需要优先处理。'
  await loadPrivateBossMetrics()
})
</script>

<style lang="scss" scoped>
.dashboard-home { display: flex; flex-direction: column; gap: 16px; }

.welcome-card {
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 118, 110, 0.08)),
    #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 24px 32px;
  margin-bottom: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: var(--shadow-card);

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

  .welcome-focus {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;

    span {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 0 10px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.72);
      border: 1px solid rgba(148, 163, 184, 0.28);
      color: var(--text-body);
      font-size: 12px;
      line-height: 1.4;
    }
  }

  .welcome-date {
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
}

.stat-row { margin-bottom: 0 !important; }
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  box-shadow: var(--shadow-card);

  &:hover {
    border-color: #bfdbfe;
    box-shadow: var(--shadow-card-hover);
    transform: translateY(-1px);
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
  min-width: 0;

  .stat-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.2;
    white-space: nowrap;
  }
  .stat-label {
    color: var(--text-muted);
    font-size: 13px;
    margin-top: 4px;
  }
  .stat-trend {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.35;
    white-space: normal;

    &.up { color: #047857; }
    &.warn { color: #b45309; }
    &.danger { color: #dc2626; }
  }
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
:deep(.el-card__header) {
  padding: 14px 20px;
  border-bottom: 1px solid var(--border-soft);
}
:deep(.el-card__body) { padding: 16px 20px; }

.private-metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.private-metric {
  display: grid;
  gap: 6px;
  min-height: 96px;
  padding: 14px;
  border: 1px solid var(--border-soft);
  border-left: 3px solid #2563eb;
  border-radius: 8px;
  background: #f8fbff;

  &.up {
    border-left-color: #047857;
  }

  &.warn {
    border-left-color: #f59e0b;
  }

  &.danger {
    border-left-color: #dc2626;
    background: #fff7f7;
  }

  span {
    color: var(--text-muted);
    font-size: 13px;
  }

  b {
    color: var(--text-primary);
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    line-height: 1.1;
  }

  em {
    color: var(--text-body);
    font-size: 12px;
    font-style: normal;
    line-height: 1.5;
  }
}

.shortcut-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.shortcut-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px;
  border-radius: 8px;
  transition: background 0.2s ease, transform 0.2s ease;

  &:hover {
    background: #f8fbff;
    transform: translateY(-1px);

    .shortcut-icon {
      box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
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

.funnel-list {
  display: grid;
  gap: 14px;
}
.funnel-stage {
  display: grid;
  gap: 8px;
}
.funnel-stage-head {
  display: grid;
  grid-template-columns: 96px 1fr auto;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}
.stage-name { color: var(--text-muted); }
.stage-value {
  color: var(--text-primary);
  font-weight: 600;
}
.stage-rate {
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}
.stage-bar {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef2f7;

  span {
    display: block;
    height: 100%;
    border-radius: inherit;
  }
}

.todo-list { display: flex; flex-direction: column; gap: 2px; }
.todo-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  border-radius: 6px;
  transition: background 0.15s;
  &:hover { background: #f8fbff; }
  &.done .todo-title { text-decoration: line-through; color: var(--text-muted); }
}
.todo-left { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
.todo-title { font-size: 14px; color: var(--text-primary); }
.todo-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.todo-date { font-size: 12px; color: var(--text-muted); }

.business-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}
.business-item {
  min-height: 104px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 14px;
  background: #f8fbff;
}
.business-title {
  color: var(--text-muted);
  font-size: 13px;
}
.business-value {
  margin-top: 8px;
  color: var(--text-primary);
  font-size: 22px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}
.business-desc {
  margin-top: 8px;
  color: var(--text-body);
  font-size: 12px;
  line-height: 1.6;
}

.risk-list {
  display: grid;
  gap: 10px;
}
.risk-item {
  border: 1px solid var(--border-soft);
  border-left: 3px solid #f59e0b;
  border-radius: 8px;
  padding: 12px 12px 10px;
  background: #fff;

  &.high {
    border-left-color: #dc2626;
    background: #fff7f7;
  }

  p {
    margin: 8px 0;
    color: var(--text-body);
    font-size: 12px;
    line-height: 1.6;
  }
}
.risk-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.risk-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.schedule-list {
  display: grid;
  gap: 12px;
}
.schedule-item {
  display: grid;
  grid-template-columns: 52px 1fr;
  gap: 12px;
  padding: 4px 0 12px;
  border-bottom: 1px solid var(--border-soft);

  &:last-child {
    padding-bottom: 0;
    border-bottom: 0;
  }
}
.schedule-time {
  color: #2563eb;
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}
.schedule-title {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}
.schedule-desc {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.notice-list { display: flex; flex-direction: column; gap: 2px; }
.notice-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 4px;
  border-radius: 6px;
  transition: background 0.15s;
  cursor: pointer;
  &:hover { background: #f8fbff; }
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
  &:hover { background: #f8fbff; }
}
.recent-time { margin-left: auto; font-size: 12px; color: var(--text-muted); }
.empty-tip { text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 14px; }

@media (max-width: 1200px) {
  .business-grid,
  .private-metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .welcome-card {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }

  .shortcut-grid,
  .business-grid,
  .private-metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .todo-item {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .todo-right {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>

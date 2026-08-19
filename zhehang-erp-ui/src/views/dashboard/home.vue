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
        <!-- 1. 个人任务中心:我的待办一站式 -->
        <el-card class="task-center-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">个人任务中心</span>
              <span class="tc-sub">今天要处理的事都在这里</span>
            </div>
          </template>
          <div class="tc-grid">
            <div class="tc-item is-approval" @click="goApprovalCenter('todo')">
              <div class="tc-ic"><el-icon><Stamp /></el-icon></div>
              <div class="tc-body">
                <div class="tc-num">{{ flow.todo }}</div>
                <div class="tc-label">待我审批</div>
              </div>
              <el-icon class="tc-arrow"><ArrowRightBold /></el-icon>
            </div>
            <div class="tc-item is-follow" @click="goWorkbench('today')">
              <div class="tc-ic"><el-icon><PhoneFilled /></el-icon></div>
              <div class="tc-body">
                <div class="tc-num">{{ taskCenter.follow }}</div>
                <div class="tc-label">今日待跟进</div>
              </div>
              <el-icon class="tc-arrow"><ArrowRightBold /></el-icon>
            </div>
            <div class="tc-item is-recycle" @click="goWorkbench('warning')">
              <div class="tc-ic"><el-icon><Warning /></el-icon></div>
              <div class="tc-body">
                <div class="tc-num">{{ taskCenter.recycle }}</div>
                <div class="tc-label">回收预警</div>
              </div>
              <el-icon class="tc-arrow"><ArrowRightBold /></el-icon>
            </div>
            <div class="tc-item is-leads" @click="goWorkbench('my')">
              <div class="tc-ic"><el-icon><User /></el-icon></div>
              <div class="tc-body">
                <div class="tc-num">{{ taskCenter.myLeads }}</div>
                <div class="tc-label">我的线索</div>
              </div>
              <el-icon class="tc-arrow"><ArrowRightBold /></el-icon>
            </div>
          </div>
        </el-card>

        <!-- 任务工单卡 -->
        <el-card class="perf-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">任务工单</span>
              <el-link type="primary" :underline="false" @click="router.push('/customer-issue/list')">查看全部</el-link>
            </div>
          </template>
          <div class="perf-grid">
            <div class="perf-item">
              <div class="perf-value">{{ issueStats.todayNew }}</div>
              <div class="perf-label">今日新增</div>
            </div>
            <div class="perf-item">
              <div class="perf-value" :style="issueStats.unhandled ? 'color:var(--el-color-warning)' : ''">{{ issueStats.unhandled }}</div>
              <div class="perf-label">未处理</div>
            </div>
            <div class="perf-item">
              <div class="perf-value" :style="issueStats.overdue ? 'color:var(--el-color-danger)' : ''">{{ issueStats.overdue }}</div>
              <div class="perf-label">逾期</div>
            </div>
            <div class="perf-item">
              <div class="perf-value" :style="issueStats.p0 ? 'color:var(--el-color-danger)' : ''">{{ issueStats.p0 }}</div>
              <div class="perf-label">P0 紧急</div>
            </div>
          </div>
        </el-card>

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
              <el-link v-if="canOpenOwnerMonitor" type="primary" :underline="false" @click="router.push('/dashboard/cockpit')">查看详情</el-link>
            </div>
          </template>
          <div class="perf-grid perf-grid--single">
            <div class="perf-item">
              <div class="perf-value">{{ perf.conversionRate }}<em>%</em></div>
              <div class="perf-label">线索转化率</div>
            </div>
          </div>
          <p class="perf-note">转化率取我数据范围内线索转化汇总；成单数 / 成交金额随旧提单系统退役下线。</p>
        </el-card>

        <!-- 4. 抄送我的 / 已完成事项 -->
        <el-card class="approval-card" shadow="never">
          <el-tabs v-model="activeTab" class="approval-tabs">
            <el-tab-pane name="cc" :label="`抄送我的 (${flow.cc})`">
              <el-skeleton v-if="ccLoading" :rows="3" animated class="tab-loading" />
              <el-empty v-else-if="ccList.length === 0" description="暂无抄送给我的事项" :image-size="70" />
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
              <el-skeleton v-if="doneLoading" :rows="3" animated class="tab-loading" />
              <el-empty v-else-if="doneList.length === 0" description="暂无已完成事项" :image-size="70" />
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
        <!-- 5. 备忘速览 -->
        <el-card class="memo-card" shadow="never" v-loading="memoLoading">
          <template #header>
            <div class="card-header">
              <div class="report-header-left">
                <span class="card-title">备忘速览</span>
                <span class="tc-sub">仅自己可见</span>
              </div>
              <el-button type="primary" size="small" @click="openMemoPage()">进入备忘录</el-button>
            </div>
          </template>
          <div class="memo-summary">
            <div class="memo-summary-item">
              <b>{{ memoSummary.pending }}</b>
              <span>待完成</span>
            </div>
            <div class="memo-summary-item" :class="{ danger: memoSummary.overdue > 0 }">
              <b>{{ memoSummary.overdue }}</b>
              <span>已超时</span>
            </div>
            <div class="memo-summary-item success">
              <b>{{ memoSummary.doneToday }}</b>
              <span>今日完成</span>
            </div>
          </div>
          <div v-if="memoHomeList.length === 0" class="empty-tip memo-empty" @click="openMemoPage()">
暂无备忘，点击新建
          </div>
          <div v-else class="memo-list">
            <div
              v-for="item in memoHomeList"
              :key="item.id"
              class="memo-row"
              :class="{ done: item.completed, overdue: isMemoOverdue(item) }"
              @click="openMemoPage(item.id)"
            >
              <el-checkbox
                :model-value="!!item.completed"
                @click.stop
                @change="val => toggleMemo(item, !!val)"
              />
              <div class="memo-time">{{ formatMemoHomeTime(item.remindTime, item.completed) }}</div>
              <div class="memo-main">
                <div class="memo-content">{{ item.content }}</div>
                <div class="memo-meta">{{ item.category || '未分类' }} · {{ item.completed ? '已完成' : '待处理' }}</div>
              </div>
              <el-tag :type="priorityMeta(item.priority).type" size="small" effect="light">
                {{ priorityMeta(item.priority).label }}
              </el-tag>
            </div>
          </div>
        </el-card>

        <!-- 5. 工作日报 -->
        <el-card class="report-card" shadow="never" v-loading="reportView === 'mine' ? reportLoading : ccReportLoading">
          <template #header>
            <div class="card-header">
              <div class="report-header-left">
                <span class="card-title">工作日报</span>
                <el-radio-group v-model="reportView" size="small" class="report-view-switch" @change="onReportViewChange">
                  <el-radio-button label="mine">我的</el-radio-button>
                  <el-radio-button label="cc">抄送我的</el-radio-button>
                </el-radio-group>
              </div>
              <el-button type="primary" size="small" plain @click="openReportDialog">填写日报</el-button>
            </div>
          </template>

          <!-- 我的日报 -->
          <template v-if="reportView === 'mine'">
            <div v-if="reportList.length === 0" class="empty-tip report-empty" @click="openReportDialog">
              {{ reportLoadError ? '日报加载失败，点击可重新填写' : '暂无日报记录，点击右上角填写' }}
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
            <p class="report-tip" :class="{ error: reportLoadError }">
              {{ reportLoadError ? '当前无法读取服务器日报，请稍后刷新重试。' : '日报已保存到系统，换设备登录也能查看最近 30 条记录。' }}
            </p>
          </template>

          <!-- 抄送我的日报 -->
          <template v-else>
            <div v-if="ccReportList.length === 0" class="empty-tip report-empty">
              {{ ccReportLoadError ? '抄送日报加载失败，请稍后刷新重试' : '暂无抄送给我的日报' }}
            </div>
            <div v-else class="report-list">
              <div v-for="r in ccReportList" :key="r.id" class="report-item">
                <div class="report-item-head">
                  <span class="report-date">{{ r.authorName || '同事' }} · {{ r.date }}</span>
                </div>
                <div class="report-block">
                  <span class="report-block-label">今日工作</span>
                  <p>{{ r.today }}</p>
                </div>
              </div>
            </div>
            <p class="report-tip" :class="{ error: ccReportLoadError }">
              {{ ccReportLoadError ? '当前无法读取抄送日报，请稍后刷新重试。' : '这里显示同事抄送给你的日报（最近 30 条）。' }}
            </p>
          </template>
        </el-card>
      </el-col>
    </el-row>

    <!-- V238 退役旧订单系统:原「我的订单」卡片取自 /order/list(biz_order),已零流量下线,订单看飞哥订单页。 -->

    <!-- 我的备忘录抽屉 -->
    <el-drawer v-model="memoDrawerVisible" title="我的备忘录" size="720px" class="memo-drawer">
      <div class="memo-editor">
        <el-form label-position="top">
          <el-form-item label="备忘内容">
            <el-input
              v-model="memoForm.content"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="例如：提醒客户补开户地址材料"
            />
          </el-form-item>
          <div class="memo-form-grid">
            <el-form-item label="提醒时间">
              <el-date-picker
                v-model="memoForm.remindTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择时间"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="优先级">
              <el-select v-model="memoForm.priority" style="width: 100%">
                <el-option label="重要" :value="3" />
                <el-option label="普通" :value="2" />
                <el-option label="低" :value="1" />
              </el-select>
            </el-form-item>
          </div>
          <div class="memo-form-grid">
            <el-form-item label="分类">
              <el-select v-model="memoForm.category" filterable allow-create clearable default-first-option style="width: 100%">
                <el-option label="客户跟进" value="客户跟进" />
                <el-option label="财务协同" value="财务协同" />
                <el-option label="团队管理" value="团队管理" />
                <el-option label="个人事项" value="个人事项" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-switch v-model="memoForm.completed" active-text="已完成" inactive-text="未完成" />
            </el-form-item>
          </div>
          <div class="memo-editor-actions">
            <el-button v-if="memoEditingId" plain @click="resetMemoForm">新增一条</el-button>
            <el-button type="primary" @click="submitMemo">{{ memoEditingId ? '保存修改' : '新增备忘' }}</el-button>
          </div>
        </el-form>
      </div>

      <div class="memo-filter-bar">
        <el-radio-group v-model="memoFilter" size="small" @change="loadMemoList">
          <el-radio-button label="today">今天</el-radio-button>
          <el-radio-button label="week">本周</el-radio-button>
          <el-radio-button label="pending">未完成</el-radio-button>
          <el-radio-button label="done">已完成</el-radio-button>
        </el-radio-group>
        <el-input
          v-model="memoKeyword"
          clearable
          size="small"
          placeholder="搜索"
          class="memo-search"
          @keyup.enter="loadMemoList"
          @clear="loadMemoList"
        />
      </div>

      <el-skeleton v-if="memoListLoading" :rows="4" animated />
      <el-empty v-else-if="memoList.length === 0" description="暂无备忘" :image-size="80" />
      <div v-else class="memo-drawer-list">
        <div
          v-for="item in memoList"
          :key="item.id"
          class="memo-drawer-row"
          :class="{ done: item.completed, overdue: isMemoOverdue(item) }"
        >
          <el-checkbox
            :model-value="!!item.completed"
            @change="val => toggleMemo(item, !!val)"
          />
          <div class="memo-drawer-main" @click="editMemo(item)">
            <div class="memo-drawer-title">{{ item.content }}</div>
            <div class="memo-meta">
              {{ formatMemoTime(item.remindTime, item.completed) }} · {{ item.category || '未分类' }}
            </div>
          </div>
          <div class="memo-row-actions">
            <el-tag :type="priorityMeta(item.priority).type" size="small" effect="light">
              {{ priorityMeta(item.priority).label }}
            </el-tag>
            <el-button link type="danger" size="small" @click="removeMemo(item)">删除</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

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
        <el-form-item label="抄送给">
          <el-select
            v-model="reportForm.ccUserIds"
            multiple
            filterable
            clearable
            placeholder="选择要抄送的同事（可选）"
            style="width: 100%"
            :loading="colleagueLoading"
          >
            <el-option
              v-for="c in colleagueList"
              :key="c.userId"
              :label="c.deptName ? `${c.name}（${c.deptName}）` : c.name"
              :value="c.userId"
            />
          </el-select>
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
//   4) 本月业绩：转化率取 leadApi.conversionStats()；成单数/成交金额随旧提单系统(biz_order)退役下线。
//   5) 已完成事项：taskApi.done 列表；抄送列表后端无端点 → 空。
// 工作日报：/dashboard/daily-report 已接后端 daily_report 表,按当前登录用户保存最近 30 条。
import { ref, computed, reactive, onMounted } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { SYSTEM_ROLES } from '@/stores/user'
import { isOwnerRole } from '@/utils/role-access'
import { taskApi } from '@/api/workflow'
import type { TaskItem } from '@/api/workflow'
import { get } from '@/api/request'
import { employeeApi } from '@/api/org'
import { leadApi } from '@/api/crm'
import { dailyReportApi } from '@/api/daily-report'
import { customerIssueApi } from '@/api/customer-issue'
import { memoApi, type DashboardMemo, type MemoSummary } from '@/api/memo'

const router = useRouter()

// 任务工单看板统计(今日新增/未处理/逾期/P0),数据范围与列表一致:老板看全公司、员工看与自己相关
const issueStats = reactive({ todayNew: 0, unhandled: 0, overdue: 0, p0: 0 })
const loadIssueStats = async () => {
  try {
    const res: any = await customerIssueApi.stats()
    const d = res?.data ?? res
    issueStats.todayNew = Number(d?.todayNew || 0)
    issueStats.unhandled = Number(d?.unhandled || 0)
    issueStats.overdue = Number(d?.overdue || 0)
    issueStats.p0 = Number(d?.p0 || 0)
  } catch { /* 保持为0 */ }
}
const userStore = useUserStore()
const canOpenOwnerMonitor = computed(() => isOwnerRole(userStore.roles, userStore.userInfo?.id))

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

// 个人任务中心:聚合我的待办(今日待跟进 / 回收预警 / 我的线索),待审批复用 flow.todo
const taskCenter = reactive({ follow: 0, recycle: 0, myLeads: 0 })
async function loadTaskCenter() {
  const tryTotal = async (fn: () => Promise<any>): Promise<number> => {
    try { const res: any = await fn(); return Number(res?.total || 0) } catch { return 0 }
  }
  taskCenter.follow = await tryTotal(() => leadApi.todoFollow({ pageNum: 1, pageSize: 1 }))
  taskCenter.recycle = await tryTotal(() => leadApi.recycleWarning({ pageNum: 1, pageSize: 1 }))
  taskCenter.myLeads = await tryTotal(() => leadApi.myList({ pageNum: 1, pageSize: 1 }))
}
function goWorkbench(section: 'my' | 'today' | 'warning') {
  router.push({ path: '/customer/workbench', query: { section } })
}

function goApprovalCenter(tab: 'todo' | 'cc' | 'started' | 'done') {
  // 跳审批中心并直接落到对应 tab(审批中心读 ?tab= 切换左栏)
  router.push({ path: '/approval/center', query: { tab } })
}

// ---------- 3. 本月业绩 ----------
const perf = reactive({ conversionRate: 0 })

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
  router.push({ path: '/approval/center', query: { instanceId } })
}

// ---------- 5. 个人备忘录 ----------
type MemoFilter = 'today' | 'week' | 'pending' | 'done'
type TagType = 'success' | 'warning' | 'danger' | 'info' | 'primary'
const memoHomeList = ref<DashboardMemo[]>([])
const memoList = ref<DashboardMemo[]>([])
const memoLoading = ref(false)
const memoListLoading = ref(false)
const memoDrawerVisible = ref(false)
const memoFilter = ref<MemoFilter>('today')
const memoKeyword = ref('')
const memoEditingId = ref<number | null>(null)
const memoSummary = reactive<MemoSummary>({ pending: 0, today: 0, doneToday: 0, overdue: 0 })
const memoForm = reactive<DashboardMemo>({
  content: '',
  remindTime: '',
  priority: 2,
  category: '客户跟进',
  completed: false
})

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function nowDateTimeText(): string {
  const d = new Date()
  d.setMinutes(0, 0, 0)
  d.setHours(d.getHours() + 1)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:00:00`
}

function toDate(value?: string): Date | null {
  if (!value) return null
  const d = new Date(value.replace(' ', 'T'))
  return Number.isNaN(d.getTime()) ? null : d
}

function sameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function formatMemoTime(value?: string, completed?: boolean): string {
  if (completed) return '已完'
  const d = toDate(value)
  if (!d) return '待定'
  const now = new Date()
  if (sameDate(d, now)) return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (sameDate(d, tomorrow)) return `明天 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

function formatMemoHomeTime(value?: string, completed?: boolean): string {
  if (completed) return '已完成'
  const d = toDate(value)
  if (!d) return '待定'
  const clock = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`
  const now = new Date()
  if (sameDate(d, now)) return `今天\n${clock}`
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (sameDate(d, tomorrow)) return `明天\n${clock}`
  return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}\n${clock}`
}

function isMemoOverdue(item: DashboardMemo): boolean {
  const d = toDate(item.remindTime)
  return !item.completed && !!d && d.getTime() < Date.now()
}

function priorityMeta(priority?: number): { label: string; type: TagType } {
  if (Number(priority) === 3) return { label: '重要', type: 'warning' }
  if (Number(priority) === 1) return { label: '低', type: 'info' }
  return { label: '普通', type: 'info' }
}

function resetMemoForm() {
  memoEditingId.value = null
  memoForm.content = ''
  memoForm.remindTime = nowDateTimeText()
  memoForm.priority = 2
  memoForm.category = '客户跟进'
  memoForm.completed = false
  memoForm.completedTime = undefined
  memoForm.remark = ''
}

async function loadMemoSummary() {
  try {
    const res: any = await memoApi.summary()
    const data = res?.data || res || {}
    memoSummary.pending = Number(data.pending || 0)
    memoSummary.today = Number(data.today || 0)
    memoSummary.doneToday = Number(data.doneToday || 0)
    memoSummary.overdue = Number(data.overdue || 0)
  } catch {
    memoSummary.pending = 0
    memoSummary.today = 0
    memoSummary.doneToday = 0
    memoSummary.overdue = 0
  }
}

async function loadMemoHome() {
  memoLoading.value = true
  try {
    const res: any = await memoApi.list({ scope: 'home', limit: 5 })
    memoHomeList.value = res?.data || []
  } catch {
    memoHomeList.value = []
  } finally {
    memoLoading.value = false
  }
  loadMemoSummary()
}

async function loadMemoList() {
  memoListLoading.value = true
  try {
    const params: { scope: 'today' | 'week' | 'all'; completed?: boolean; keyword?: string; limit: number } = {
      scope: 'all',
      limit: 80
    }
    if (memoFilter.value === 'today') params.scope = 'today'
    if (memoFilter.value === 'week') params.scope = 'week'
    if (memoFilter.value === 'pending') params.completed = false
    if (memoFilter.value === 'done') params.completed = true
    if (memoKeyword.value.trim()) params.keyword = memoKeyword.value.trim()
    const res: any = await memoApi.list(params)
    memoList.value = res?.data || []
  } catch {
    memoList.value = []
  } finally {
    memoListLoading.value = false
  }
}

function openMemoPage(id?: number) {
  router.push({
    path: '/memo',
    query: id ? { edit: String(id) } : undefined
  })
}

function openMemoDrawer() {
  memoDrawerVisible.value = true
  resetMemoForm()
  loadMemoList()
}

function editMemo(item: DashboardMemo) {
  memoDrawerVisible.value = true
  memoEditingId.value = item.id || null
  memoForm.content = item.content || ''
  memoForm.remindTime = item.remindTime || ''
  memoForm.priority = item.priority || 2
  memoForm.category = item.category || '客户跟进'
  memoForm.completed = !!item.completed
  memoForm.completedTime = item.completedTime
  memoForm.remark = item.remark || ''
}

async function submitMemo() {
  if (!memoForm.content.trim()) {
    ElMessage.warning('请填写备忘内容')
    return
  }
  try {
    const data: DashboardMemo = {
      id: memoEditingId.value || undefined,
      content: memoForm.content.trim(),
      remindTime: memoForm.remindTime || undefined,
      priority: memoForm.priority || 2,
      category: memoForm.category || undefined,
      completed: !!memoForm.completed,
      completedTime: memoForm.completedTime,
      remark: memoForm.remark || undefined
    }
    if (memoEditingId.value) {
      await memoApi.update(data)
      ElMessage.success('备忘已更新')
    } else {
      await memoApi.create(data)
      ElMessage.success('备忘已新增')
    }
    resetMemoForm()
    await Promise.all([loadMemoHome(), loadMemoList()])
  } catch {
    ElMessage.error('备忘保存失败，请重试')
  }
}

async function toggleMemo(item: DashboardMemo, completed: boolean) {
  if (!item.id) return
  try {
    await memoApi.complete(item.id, completed)
    await Promise.all([loadMemoHome(), loadMemoList()])
  } catch {
    ElMessage.error('状态更新失败，请重试')
  }
}

async function removeMemo(item: DashboardMemo) {
  if (!item.id) return
  try {
    await ElMessageBox.confirm('确定删除这条备忘吗?', '', { type: 'warning' })
  } catch {
    return
  }
  try {
    await memoApi.remove(item.id)
    await Promise.all([loadMemoHome(), loadMemoList()])
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败，请重试')
  }
}

// ---------- 5. 工作日报（后端持久化） ----------
interface DailyReport { id: number; date: string; today: string; tomorrow: string }
interface CcDailyReport { id: number; date: string; today: string; authorName: string }
interface Colleague { userId: number; name: string; deptName: string }
// 视图切换：我的 / 抄送我的
const reportView = ref<'mine' | 'cc'>('mine')
const reportList = ref<DailyReport[]>([])
const reportLoading = ref(false)
const reportLoadError = ref(false)
// 抄送我的日报
const ccReportList = ref<CcDailyReport[]>([])
const ccReportLoading = ref(false)
const ccReportLoadError = ref(false)
const ccLoaded = ref(false)
// 可抄送同事列表
const colleagueList = ref<Colleague[]>([])
const colleagueLoading = ref(false)
const reportDialogVisible = ref(false)
const reportForm = reactive<{ date: string; today: string; tomorrow: string; ccUserIds: number[] }>({
  date: new Date().toISOString().slice(0, 10),
  today: '',
  tomorrow: '',
  ccUserIds: []
})

async function loadReports() {
  reportLoading.value = true
  reportLoadError.value = false
  try {
    const res: any = await dailyReportApi.list()
    const list = res?.data || []
    reportList.value = (Array.isArray(list) ? list : []).map((r: any) => ({
      id: r.id,
      date: (r.reportDate || '').slice(0, 10),
      today: r.todayWork || '',
      tomorrow: r.tomorrowPlan || ''
    }))
  } catch {
    reportList.value = []
    reportLoadError.value = true
  } finally {
    reportLoading.value = false
  }
}
// 加载抄送给我的日报
async function loadCcReports() {
  ccReportLoading.value = true
  ccReportLoadError.value = false
  try {
    const res: any = await dailyReportApi.ccToMe()
    const list = res?.data || []
    ccReportList.value = (Array.isArray(list) ? list : []).map((r: any) => ({
      id: r.id,
      date: (r.reportDate || '').slice(0, 10),
      today: r.todayWork || '',
      authorName: r.authorName || ''
    }))
    ccLoaded.value = true
  } catch {
    ccReportList.value = []
    ccReportLoadError.value = true
  } finally {
    ccReportLoading.value = false
  }
}
// 加载可抄送同事(懒加载,已加载则跳过)
async function loadColleagues() {
  if (colleagueList.value.length > 0) return
  colleagueLoading.value = true
  try {
    const res: any = await dailyReportApi.colleagues()
    const list = res?.data || []
    colleagueList.value = (Array.isArray(list) ? list : [])
      .filter((c: any) => c.userId != null)
      .map((c: any) => ({ userId: c.userId, name: c.name || '', deptName: c.deptName || '' }))
  } catch {
    colleagueList.value = []
  } finally {
    colleagueLoading.value = false
  }
}
// 切换「我的 / 抄送我的」
function onReportViewChange() {
  if (reportView.value === 'cc' && !ccLoaded.value) {
    loadCcReports()
  }
}
function openReportDialog() {
  reportForm.date = new Date().toISOString().slice(0, 10)
  reportForm.today = ''
  reportForm.tomorrow = ''
  reportForm.ccUserIds = []
  reportDialogVisible.value = true
  loadColleagues()
}
async function submitReport() {
  if (!reportForm.today.trim()) {
    ElMessage.warning('请填写今日工作')
    return
  }
  try {
    await dailyReportApi.create({
      reportDate: reportForm.date,
      todayWork: reportForm.today.trim(),
      tomorrowPlan: reportForm.tomorrow.trim(),
      ccUserIds: reportForm.ccUserIds.join(',')
    })
    reportDialogVisible.value = false
    ElMessage.success('日报已保存')
    await loadReports()
  } catch {
    ElMessage.error('日报保存失败，请重试')
  }
}
async function removeReport(id: number) {
  try {
    await ElMessageBox.confirm('确定删除此报告吗?', '', { type: 'warning' })
  } catch {
    return
  }
  try {
    await dailyReportApi.remove(id)
    await loadReports()
    ElMessage.success('删除成功')
  } catch {
    ElMessage.error('删除失败，请重试')
  }
}

// ---------- 各块独立加载（一块失败不影响其它块） ----------
async function loadTenure() {
  // 优先用 /auth/info 直接返回的入职日期：可靠,不受员工列表数据范围过滤影响
  const myHire = (userStore.userInfo as any)?.hireDate
  if (myHire) {
    const diff = Date.now() - new Date(String(myHire)).getTime()
    tenureDays.value = Math.max(0, Math.floor(diff / 86400000))
    return
  }
  // 兜底：旧逻辑（按 userId 在员工列表里匹配自己那条）
  const uid = Number(userStore.userInfo?.id || 0)
  if (!uid) return
  try {
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 50 })
    const records = res?.records || res?.list || []
    const me = records.find((e: any) => Number(e.userId) === uid)
    if (me?.hireDate) {
      const diff = Date.now() - new Date(String(me.hireDate)).getTime()
      tenureDays.value = Math.max(0, Math.floor(diff / 86400000))
    }
  } catch {
    // 无员工档案（如 admin）→ 保持 '--'，不报错
  }
}

async function loadFlowCounts() {
  const unwrap = (res: any) => (res && typeof res === 'object' && 'data' in res ? res.data : res)
  // 待我审批 = 审批中心待办 + 各业务侧待批(提单/退款/提成/采购,按我的角色可批的池子)聚合
  try {
    const summary: any = unwrap(await get('/dashboard/approval-summary'))
    flow.todo = Number(summary?.total || 0)
  } catch {
    // 聚合接口不可用时退回纯审批中心待办
    try {
      const res: any = await taskApi.todo({ pageNum: 1, pageSize: 1 })
      flow.todo = Number(res?.total || 0)
    } catch { flow.todo = 0 }
  }
  // 已发起/已办/抄送我:一次拉齐(修"抄送我的"前端写死0的问题,后端本来就有接口)
  try {
    const c: any = unwrap(await taskApi.counts())
    flow.started = Number(c?.started || 0)
    flow.done = Number(c?.done || 0)
    flow.cc = Number(c?.cc || 0)
  } catch {
    flow.started = 0; flow.done = 0; flow.cc = 0
  }
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

// 抄送我的:接真实端点 GET /workflow/task/cc(此前前端误注"后端无端点"而写死空列表)
async function loadCcList() {
  ccLoading.value = true
  try {
    const res: any = await get('/workflow/task/cc', { pageNum: 1, pageSize: 8 })
    const payload: any = (res && typeof res === 'object' && 'data' in res) ? res.data : res
    const records: TaskItem[] = payload?.records || payload?.list || []
    ccList.value = records.map(adaptTask)
  } catch {
    ccList.value = []
  } finally {
    ccLoading.value = false
  }
}

async function loadPerformance() {
  // 线索转化率（成单数/成交金额原取旧提单 orderApi.stats()，随旧订单系统退役移除）
  try {
    const conv: any = await leadApi.conversionStats()
    perf.conversionRate = Number(conv?.conversionRate || 0)
  } catch {
    perf.conversionRate = 0
  }
}

onMounted(() => {
  loadReports()
  loadIssueStats()
  // 并行加载各块，互不阻塞
  loadTenure()
  loadFlowCounts()
  loadTaskCenter()
  loadDoneList()
  loadCcList()
  loadMemoHome()
  loadPerformance()
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
  background: linear-gradient(135deg, #3370ff, #0f766e);
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
  color: #3370ff;
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
.profile-tenure b { color: #3370ff; font-family: 'JetBrains Mono', monospace; }
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

/* 个人任务中心 */
.task-center-card { margin-bottom: 16px; }
.tc-sub { font-size: 12px; color: var(--text-secondary); }
.tc-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.tc-item {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 16px; border-radius: 8px; cursor: pointer;
  background: #f7f9fc; border: 1px solid #eef1f6;
  transition: transform .15s, box-shadow .15s, border-color .15s;
}
.tc-item:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(51,112,255,.12); border-color: #cdd9ee; }
.tc-ic { width: 42px; height: 42px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 20px; flex-shrink: 0; }
.tc-item.is-approval .tc-ic { background: #f59e0b; }
.tc-item.is-follow .tc-ic { background: #3370ff; }
.tc-item.is-recycle .tc-ic { background: #ef4444; }
.tc-item.is-leads .tc-ic { background: #14b8a6; }
.tc-body { flex: 1; min-width: 0; }
.tc-num { font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; color: var(--text-primary); line-height: 1.1; }
.tc-label { font-size: 13px; color: var(--text-secondary); margin-top: 2px; }
.tc-arrow { color: #c0c4cc; font-size: 14px; }
@media (max-width: 768px) { .tc-grid { grid-template-columns: 1fr; } }

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
.flow-num { font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700; color: #3370ff; line-height: 1.1; }
.flow-label { font-size: 13px; color: var(--text-muted); }

/* 3. 本月业绩 */
.perf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.perf-grid--single { grid-template-columns: minmax(0, 1fr); }
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
.memo-card { margin-bottom: 16px; }
.memo-summary { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
.memo-summary-item {
  min-height: 72px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #f8fbff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.memo-summary-item b {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  line-height: 1;
  color: var(--text-primary);
}
.memo-summary-item span { font-size: 12px; color: var(--text-muted); }
.memo-summary-item.danger b { color: var(--danger); }
.memo-summary-item.success b { color: #14b8a6; }
.memo-empty { cursor: pointer; border: 1px dashed #d8e0ea; border-radius: 8px; background: #f8fbff; }
.memo-list, .memo-drawer-list { display: flex; flex-direction: column; gap: 2px; }
.memo-row {
  display: grid;
  grid-template-columns: 24px 68px minmax(0, 1fr) auto;
  align-items: start;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f3f8;
  cursor: pointer;
}
.memo-row:last-child { border-bottom: 0; }
.memo-row.done .memo-content,
.memo-drawer-row.done .memo-drawer-title {
  color: var(--text-muted);
  text-decoration: line-through;
}
.memo-row.overdue .memo-time,
.memo-drawer-row.overdue .memo-meta { color: var(--danger); }
.memo-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
  color: #3370ff;
  white-space: pre-line;
}
.memo-main { min-width: 0; }
.memo-content {
  display: -webkit-box;
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.5;
  white-space: normal;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.memo-meta { margin-top: 3px; font-size: 12px; color: var(--text-muted); line-height: 1.4; }
.memo-row :deep(.el-checkbox),
.memo-row :deep(.el-tag) { margin-top: 2px; }
:global(.memo-drawer) { max-width: 92vw; }
:global(.memo-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border-soft);
}
:global(.memo-drawer .el-drawer__title) {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
}
:global(.memo-drawer .el-drawer__body) { padding: 20px 24px 24px; }
.memo-editor {
  padding: 18px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #f8fbff;
  margin-bottom: 18px;
}
.memo-form-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; }
.memo-editor-actions { display: flex; justify-content: flex-end; gap: 8px; }
.memo-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}
.memo-search { width: 220px; flex-shrink: 0; }
.memo-drawer-list {
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #fff;
  padding: 4px 16px;
}
.memo-drawer-row {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f0f3f8;
}
.memo-drawer-row:last-child { border-bottom: 0; }
.memo-drawer-main { min-width: 0; cursor: pointer; }
.memo-drawer-title { font-size: 15px; color: var(--text-primary); line-height: 1.55; word-break: break-word; }
.memo-row-actions { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.report-header-left { display: flex; align-items: center; gap: 12px; }
.report-view-switch :deep(.el-radio-button__inner) { padding: 5px 10px; }
.report-empty { cursor: pointer; }
.report-list { display: flex; flex-direction: column; gap: 12px; }
.report-item { border: 1px solid var(--border-soft); border-radius: 8px; padding: 12px; background: #f8fbff; }
.report-item-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.report-date { font-size: 13px; font-weight: 600; color: #3370ff; font-family: 'JetBrains Mono', monospace; }
.report-block { margin-top: 6px; }
.report-block-label { font-size: 12px; color: var(--text-muted); }
.report-block p { margin-top: 2px; font-size: 13px; color: var(--text-body); line-height: 1.6; white-space: pre-wrap; }
.report-tip { margin-top: 12px; font-size: 12px; color: var(--text-muted); line-height: 1.5; }
.report-tip.error { color: var(--danger); }

/* 通用空态 */
.empty-tip { text-align: center; padding: 24px 0; color: var(--text-muted); font-size: 14px; }

@media (max-width: 768px) {
  .profile-banner { flex-direction: column; align-items: flex-start; gap: 14px; padding: 20px; }
  .memo-form-grid { grid-template-columns: 1fr; gap: 0; }
  .memo-filter-bar { align-items: stretch; flex-direction: column; }
  .memo-search { width: 100%; }
}
</style>

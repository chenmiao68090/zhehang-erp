<template>
  <div class="tele-workbench">
    <header class="today-head">
      <div>
        <h1>今日工作</h1>
        <p>今日待办、外呼执行与客户跟进</p>
      </div>
      <div class="today-actions">
        <el-button :icon="Refresh" @click="refreshAll">刷新</el-button>
        <el-button type="primary" :icon="Phone" @click="dialpadVisible = true">拨号盘</el-button>
      </div>
    </header>

    <section class="tw-layout">
      <div class="left-column">
        <section class="goal-overview" aria-label="今日外呼目标">
          <div class="goal-summary-row">
            <div class="goal-main">
              <span>今日目标</span>
              <strong>{{ callGoal.target }}<small>通</small></strong>
              <em>个人固定目标</em>
            </div>
            <div class="goal-progress">
              <div class="goal-progress-head">
                <span>已拨 <b>{{ callGoal.callCount }}</b> 通</span>
                <strong>剩余 {{ callGoal.remaining }} 通</strong>
              </div>
              <el-progress :percentage="callGoal.completionRate" :stroke-width="10" :show-text="false" />
              <div class="goal-progress-foot">
                <span>{{ callGoal.checkpointLabel }}目标 {{ callGoal.checkpointTarget }} 通</span>
                <em>{{ callGoal.checkpointGap > 0 ? `还差 ${callGoal.checkpointGap} 通` : '当前节点已达' }}</em>
              </div>
            </div>
          </div>
          <div class="goal-checkpoints">
            <article :class="{ active: callGoal.checkpointLabel === '上午12点', done: callGoal.noonActual >= 100 }">
              <i><span></span></i>
              <div><b>12:00</b><p>{{ callGoal.noonActual }} / 100 通</p></div>
              <em>{{ Math.min(100, callGoal.noonActual) }}%</em>
            </article>
            <article :class="{ active: callGoal.checkpointLabel === '下午15点', done: callGoal.afternoonActual >= 250 }">
              <i><span></span></i>
              <div><b>15:00</b><p>{{ callGoal.afternoonActual }} / 250 通</p></div>
              <em>{{ Math.min(100, Math.round(callGoal.afternoonActual * 100 / 250)) }}%</em>
            </article>
            <article :class="{ active: callGoal.checkpointLabel === '下班前', done: callGoal.callCount >= callGoal.target }">
              <i><span></span></i>
              <div><b>下班前</b><p>{{ callGoal.callCount }} / {{ callGoal.target }} 通</p></div>
              <em>{{ callGoal.completionRate }}%</em>
            </article>
          </div>
          <div class="goal-metrics">
            <article><span>接通</span><strong>{{ stats.connectedCount }}<small>通</small></strong></article>
            <article><span>有效沟通</span><strong>{{ stats.over1minCount }}<small>通</small></strong></article>
            <article><span>建议节奏</span><strong>{{ callGoal.requiredPace }}<small>通/小时</small></strong></article>
          </div>
        </section>

        <aside class="left-panel">
        <div class="panel-head">
          <h3>待拨打客户</h3>
          <span>{{ leadTotal || leads.length }} 条</span>
        </div>
        <div class="search-line">
          <el-input
            v-model="leadKeyword"
            placeholder="搜索公司 / 联系人 / 电话"
            clearable
            :prefix-icon="Search"
            @keyup.enter="loadLeads(true)"
            @clear="loadLeads(true)"
          />
        </div>
        <div v-if="hasSummaryDraft" class="summary-draft-card">
          <div>
            <b>待补小结：{{ summary.customerName || '上一通电话' }}</b>
            <span>完成并保存后再继续下一通</span>
          </div>
          <el-button size="small" type="warning" @click="reopenSummaryDraft">继续填写</el-button>
        </div>
        <div class="lead-list" v-loading="leadLoading" ref="leadListRef">
          <button
            v-for="item in leads"
            :key="item.id"
            class="lead-item"
            :class="leadItemClasses(item)"
            :data-lead-id="item.id"
            @click="selectLead(item)"
          >
            <time class="lead-time">{{ queueTime(item) }}</time>
            <span>
              <b>{{ item.company }}</b>
              <em>{{ item.legalPerson || '联系人待补' }} · {{ item.phone || '无号码' }}</em>
              <small
                v-if="leadProgress(item)"
                class="lead-tag"
                :class="leadProgressClass(item)"
              >
                {{ leadStatusText(item) }}
              </small>
              <small v-else-if="isNextLead(item)" class="lead-tag next">推荐拨打</small>
              <small v-else-if="leadDueLabel(item)" class="lead-tag due">{{ leadDueLabel(item) }}</small>
            </span>
            <strong class="lead-open">选择</strong>
          </button>
          <el-empty v-if="!leadLoading && !leads.length" description="暂无待打客户" :image-size="80" />
          <el-button v-if="leadHasMore" class="more-btn" text type="primary" @click="loadMoreLeads">
            加载更多 {{ leads.length }}/{{ leadTotal }}
          </el-button>
        </div>

        </aside>
      </div>

      <main class="right-panel">
        <template v-if="current">
          <section class="customer-card">
            <div class="customer-title-row">
              <div class="cust-info">
                <div class="customer-name-line">
                  <el-tooltip :content="current.company" placement="top" :show-after="500">
                    <h2>{{ current.company }}</h2>
                  </el-tooltip>
                  <el-tag v-if="isOverdueLead(current)" type="danger" effect="plain">已逾期</el-tag>
                  <el-tag v-if="current.intentLevel" type="warning" effect="plain">{{ current.intentLevel }}类意向</el-tag>
                  <el-tag v-else type="info" effect="plain">未分级</el-tag>
                </div>
                <p>
                  <span><el-icon><User /></el-icon>{{ current.legalPerson || '联系人待补' }}</span>
                  <span><el-icon><Phone /></el-icon>{{ current.phone || '暂无号码' }}</span>
                </p>
              </div>
              <div class="cust-actions">
                <el-button class="dial-main-btn" type="primary" :loading="startingDial" :disabled="!current.phone || dialing || hasSummaryDraft" @click="startDial(current)">
                  <el-icon><Phone /></el-icon>拨打客户
                </el-button>
                <el-button :icon="DataAnalysis" :disabled="!current.id" @click="openCustomer360">客户360</el-button>
              </div>
            </div>
            <div class="customer-facts">
              <article><span>客户阶段</span><strong>{{ current.followStatus || '线索接收' }}</strong></article>
              <article><span>负责人</span><strong>{{ current.ownerName || currentUserName }}</strong></article>
              <article><span>最近跟进</span><strong>{{ formatDateTime(current.lastFollowTime) || '暂无记录' }}</strong></article>
              <article><span>下次跟进</span><strong>{{ formatDateTime(current.nextActionTime || current.nextFollowTime) || '待安排' }}</strong></article>
              <article class="source-detail-fact"><span>来源说明/活动名称</span><strong>{{ current.sourceDetail || '未填写' }}</strong></article>
              <article class="address-fact"><span>单位地址</span><strong>{{ current.latestAddress || current.registerAddress || '未填写' }}</strong></article>
            </div>
          </section>

          <section class="inline-summary" :class="{ waiting: !summaryReady, compact: summaryReady && summary.connected !== 1 }">
            <template v-if="!summaryReady">
              <div v-if="hasSummaryDraft" class="resume-summary-bar">
                <div><strong>上一通小结还未保存</strong><span>{{ summary.customerName }} · {{ summary.phone }}</span></div>
                <el-button type="warning" @click="reopenSummaryDraft">继续填写</el-button>
              </div>
              <div v-else class="summary-guide">
                <div><span>准备拨打</span><p>拨通后，系统会在这里显示本次联系结果。</p></div>
                <el-button :disabled="!nextUncalledLead" @click="skipCurrent">跳过本次</el-button>
              </div>
            </template>

            <template v-else>
              <div class="summary-step result-step">
                <div class="step-title"><i>1</i><h3>联系结果</h3><em>{{ formatClock(summary.duration) }}</em></div>
                <div class="result-buttons">
                  <button
                    v-for="item in callResultOptions"
                    :key="item.value"
                    type="button"
                    :class="[`tone-${item.tone}`, { active: summary.result === item.value }]"
                    @click="chooseCallResult(item)"
                  >{{ item.label }}</button>
                </div>
                <label class="field-label">
                  {{ summary.connected === 1 ? '沟通摘要' : '备注（选填）' }}
                  <b v-if="summary.connected === 1">*</b>
                </label>
                <el-input
                  v-model="summary.remark"
                  type="textarea"
                  :rows="summary.connected === 1 ? 3 : 2"
                  maxlength="500"
                  show-word-limit
                  :placeholder="summary.connected === 1 ? '记录客户关注点、沟通结论和承诺事项' : '可补充无人接听、关机等具体情况'"
                />
                <SalesAiDraftPanel
                  :lead-id="summary.leadId"
                  :platform-call-id="dialCtx.callId || undefined"
                  :connected="summary.connected"
                  :result="summary.result"
                  :user-note="summary.remark"
                  @apply="applyAiSummaryDraft"
                />
              </div>

              <div v-if="summary.connected === 1" class="summary-step">
                <div class="step-title"><i>2</i><h3>客户意向</h3><em>决定客户进入跟进或历史</em></div>
                <label class="field-label">意向等级 <b>*</b></label>
                <div class="intent-options">
                  <button
                    v-for="item in customerLevelOptions"
                    :key="item.value"
                    type="button"
                    :class="[`intent-${item.value.toLowerCase()}`, { active: summary.customerLevel === item.value }]"
                    @click="summary.customerLevel = item.value"
                  >
                    <strong>{{ item.value }} 类</strong>
                    <span>{{ item.name }}</span>
                    <em>{{ item.cycle }}</em>
                  </button>
                </div>
                <p v-if="selectedIntent" class="intent-strategy" :class="{ history: isHistoryIntent }">
                  <strong>{{ selectedIntent.name }}：</strong>{{ selectedIntent.strategy }}
                  <span>{{ isHistoryIntent ? '保存后进入历史客资' : '保存后保留在我的客户·跟进中' }}</span>
                </p>
                <div v-if="requiresNextAction" class="feedback-grid">
                  <label><span>客户需求</span><el-select v-model="summary.needTypes" multiple collapse-tags collapse-tags-tooltip placeholder="请选择"><el-option v-for="item in needTypeOptions" :key="item" :label="item" :value="item" /></el-select></label>
                  <label><span>报价情况</span><el-select v-model="summary.quoteStatus" placeholder="请选择"><el-option v-for="item in quoteStatusOptions" :key="item" :label="item" :value="item" /></el-select></label>
                  <label><span>当前阶段</span><el-select v-model="summary.followStatus" placeholder="请选择"><el-option v-for="item in followStatusOptions" :key="item" :label="item" :value="item" /></el-select></label>
                </div>
              </div>

              <div v-if="requiresNextAction" class="summary-step next-action-step">
                <div class="step-title"><i>{{ summary.connected === 1 ? 3 : 2 }}</i><h3>{{ summary.connected === 1 ? '安排下一步' : '再次联系' }}</h3><em>{{ summary.connected === 1 ? '形成明确待办' : '系统已默认明天10点' }}</em></div>
                <div class="next-step-grid">
                  <label><span>时间</span><el-date-picker v-model="summary.nextActionTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" style="width:100%" /></label>
                  <label><span>方式</span><el-select v-model="summary.nextActionType" placeholder="选择方式"><el-option v-for="item in nextActionOptions" :key="item" :label="item" :value="item" /></el-select></label>
                  <label class="next-content"><span>具体事项</span><el-input v-model="summary.nextActionContent" :placeholder="summary.connected === 1 ? '例如：确认报价、发方案、约签约' : '例如：再次拨打'" /></label>
                </div>
              </div>

              <div v-else class="terminal-note">
                <strong>{{ summary.customerLevel === 'E' ? 'E类客户暂停拨打' : '本次联系已结束' }}</strong>
                <span>保存后客户进入历史客资，全部跟进、通话和备注记录仍会保留，后续可按权限重新激活轮转。</span>
              </div>

              <footer class="summary-actions">
                <el-button @click="discardSummary">稍后补</el-button>
                <el-button type="primary" :loading="savingSummary" @click="saveSummary">保存并进入下一位</el-button>
              </footer>
            </template>
          </section>

          <el-collapse class="call-history">
            <el-collapse-item :title="`最近通话记录（${callList.length}）`" name="history">
              <div class="call-list" v-loading="callLoading">
                <div v-for="item in callList" :key="item.id" class="call-row">
                  <span class="call-status" :class="{ on: Number(item.connected) === 1 }">{{ Number(item.connected) === 1 ? '接通' : '未接' }}</span>
                  <div class="call-main"><b>{{ formatDateTime(item.callTime) }}</b><p>{{ item.remark || item.result || '无小结' }}</p><em>{{ item.agentName || '坐席' }} · {{ formatDuration(item.duration) }}</em></div>
                  <el-button v-if="item.recordingAvailable" link type="primary" @click="openRecord(item.id)">听录音</el-button>
                </div>
                <el-empty v-if="!callLoading && !callList.length" description="还没有通话记录" :image-size="70" />
              </div>
            </el-collapse-item>
          </el-collapse>
        </template>
        <el-empty v-else description="请从左侧选择一个客户开始外呼" :image-size="120" />
      </main>
    </section>

    <div v-if="dialing" class="dial-float">
      <div class="df-state"><i></i> 通话中</div>
      <h3>{{ dialCtx.customerName }}</h3>
      <p>{{ dialCtx.phone }}</p>
      <strong>{{ formatClock(dialSeconds) }}</strong>
      <el-button type="danger" round :loading="hangingUp" @click="hangUp">
        {{ hangingUp ? '同步挂断中' : '挂断并填写小结' }}
      </el-button>
      <el-button v-if="hangupFailed" class="df-secondary" text @click="finishCallAfterHangup">
        已手动挂断，填写小结
      </el-button>
    </div>

    <el-dialog v-model="dialpadVisible" title="拨号盘" width="340px" append-to-body>
      <div class="dialpad">
        <el-input v-model="dialpadNumber" placeholder="输入号码" size="large" />
        <div class="dialpad-keys">
          <button v-for="key in dialpadKeys" :key="key" @click="dialpadNumber += key">{{ key }}</button>
        </div>
        <el-button type="primary" :loading="startingDial" :disabled="!dialpadNumber || dialing" @click="dialManual">
          <el-icon><Phone /></el-icon>
          拨打
        </el-button>
      </div>
    </el-dialog>

    <Customer360Drawer
      v-model="customer360Visible"
      :lead-id="customer360LeadId"
      @changed="handleCustomer360Changed"
      @dial="handleCustomer360Dial"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { DataAnalysis, Phone, Refresh, Search, User } from '@element-plus/icons-vue'
import { callRecordingStreamUrl, callRecordApi } from '@/api/call-record'
import { leadApi } from '@/api/crm'
import type { SalesAiDraft } from '@/api/sales-ai'
import { yunkeApi } from '@/api/yunke'
import { useUserStore } from '@/stores/user'
import Customer360Drawer from '@/components/sales/Customer360Drawer.vue'
import SalesAiDraftPanel from '@/components/sales/SalesAiDraftPanel.vue'
import { buildSalesCallGoalSnapshot } from '@/utils/sales-call-goal'
import {
  evaluateTeleSummaryDraftLead,
  isTeleSummaryDraftStaleError
} from '@/utils/tele-summary-draft'

function unwrap<T = any>(res: any): T {
  return (res?.data ?? res) as T
}

interface LeadItem {
  id: number
  company: string
  legalPerson?: string
  phone?: string
  source?: string
  sourceDetail?: string
  creditCode?: string
  customerLevel?: string
  intentLevel?: string
  registerAddress?: string
  latestAddress?: string
  followStatus?: string
  lastFollowTime?: string
  nextFollowTime?: string
  nextActionTime?: string
  nextActionType?: string
  ownerName?: string
  createTime?: string
}

interface CallProgress {
  leadId: number
  customerName: string
  phone?: string
  status: 'dialing' | 'called'
  result?: string
  connected?: number
  duration?: number
  callTime: string
  updatedAt: number
  summarySaved?: boolean
}

const userStore = useUserStore()
const currentUserName = computed(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '当前销售')

const stats = reactive({ callCount: 0, connectedCount: 0, connectRate: 0, totalDurationText: '0m 0s', over1minCount: 0 })
const todayCallRecords = ref<any[]>([])
const nowTick = ref(new Date())
const callGoal = computed(() => buildSalesCallGoalSnapshot(nowTick.value, stats.callCount, todayCallRecords.value))

const leadKeyword = ref('')
const leads = ref<LeadItem[]>([])
const leadLoading = ref(false)
const leadPage = ref(1)
const leadTotal = ref(0)
const leadHasMore = computed(() => leads.value.length < leadTotal.value)
const current = ref<LeadItem | null>(null)
const customer360Visible = ref(false)
const customer360LeadId = ref<number | null>(null)
const callProgressMap = ref<Record<string, CallProgress>>({})
const lastCallProgress = computed(() => {
  return Object.values(callProgressMap.value)
    .sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))[0] || null
})
const nextLeadAfterLast = computed(() => getNextLeadFromList(leads.value))

const callList = ref<any[]>([])
const callLoading = ref(false)
const dialing = ref(false)
const startingDial = ref(false)
const hangingUp = ref(false)
const hangupFailed = ref(false)
const dialSeconds = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const dialCtx = reactive({ leadId: 0, customerName: '', phone: '', callId: '' })

const summaryVisible = ref(false)
const savingSummary = ref(false)
const hasSummaryDraft = ref(false)
const summaryDraftLead = ref<LeadItem | null>(null)
const summary = reactive({
  leadId: 0,
  customerName: '',
  phone: '',
  duration: 0,
  connected: 1,
  result: '接通',
  intentLevel: '',
  customerLevel: '',
  followStatus: '需求沟通',
  needTypes: [] as string[],
  quoteStatus: '未报价',
  remark: '',
  nextActionType: '电话',
  nextActionTime: '',
  nextActionContent: ''
})
const summaryReady = computed(() => Boolean(
  summaryVisible.value
  && current.value
  && Number(current.value.id) === Number(summary.leadId)
))
const followStatusOptions = ['线索接收', '需求沟通', '需求答疑', '签单收款']
const customerLevelOptions = [
  { value: 'A', name: '高意向', cycle: '1-2天', days: 1, strategy: '需求明确，优先发方案、定节点并推进成交。' },
  { value: 'B', name: '意向客户', cycle: '3-5天', days: 3, strategy: '解决预算、比价或内部商议等顾虑，持续建立信任。' },
  { value: 'C', name: '潜在意向', cycle: '7-15天', days: 7, strategy: '轻量触达与长期培育，等待需求触发。' },
  { value: 'D', name: '无意向', cycle: '转历史', days: 0, strategy: '停止高频拨打，转入历史客资供后续培育和轮转。' },
  { value: 'E', name: '无效客户', cycle: '暂停拨打', days: 0, strategy: '空号、错号、非本人或拉黑风险，暂停拨打并保留原因。' }
]
const needTypeOptions = ['代理记账', '工商', '刻章', '地址', '税务咨询', '其他']
const quoteStatusOptions = ['未报价', '已报价', '已成交']
const nextActionOptions = ['电话', '微信', '发方案', '报价', '签约', '收款', '其他']
const callResultOptions = [
  { label: '接通', value: '接通', connected: 1, tone: 'success', desc: '已沟通，继续记录意向' },
  { label: '无人接听', value: '无人接听', connected: 0, tone: 'warning', desc: '稍后再拨，不算有效沟通' },
  { label: '占线/关机', value: '占线/关机', connected: 0, tone: 'warning', desc: '暂未联系上客户' },
  { label: '号码无效', value: '号码无效', connected: 0, tone: 'danger', desc: '号码错误、停机或空号' },
  { label: '明确拒绝', value: '明确拒绝', connected: 1, tone: 'danger', desc: '已接通，对方明确拒绝' }
] as const

watch(() => summary.quoteStatus, (value) => {
  if (value === '已成交') {
    summary.followStatus = '签单收款'
    return
  }
  if (value === '已报价' && ['线索接收', '需求沟通'].includes(summary.followStatus)) {
    summary.followStatus = '需求答疑'
  }
})
type CallResultOption = typeof callResultOptions[number]
const selectedIntent = computed(() => customerLevelOptions.find((item) => item.value === summary.customerLevel))
const isHistoryIntent = computed(() => ['D', 'E'].includes(summary.customerLevel))
const requiresNextAction = computed(() => summary.leadId > 0
  && !isTerminalResult(summary.result)
  && !isHistoryIntent.value)

const dialpadVisible = ref(false)
const dialpadNumber = ref('')
const dialpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']

function chooseCallResult(option: CallResultOption) {
  summary.result = option.value
  summary.connected = option.connected
  if (option.value === '号码无效') {
    summary.customerLevel = 'E'
  } else if (option.value === '明确拒绝') {
    summary.customerLevel = 'D'
  } else if (!option.connected) {
    summary.customerLevel = ''
  } else if (['D', 'E'].includes(summary.customerLevel)) {
    summary.customerLevel = ''
  }
  if (isTerminalResult(option.value)) {
    summary.nextActionType = ''
    summary.nextActionTime = ''
    summary.nextActionContent = ''
  } else {
    ensureNextActionDefaults()
  }
}

watch(() => summary.connected, (value) => {
  const connected = Number(value) === 1 ? 1 : 0
  const currentOption = callResultOptions.find((item) => item.value === summary.result)
  if (!currentOption || currentOption.connected !== connected) {
    summary.result = connected ? '接通' : '无人接听'
  }
  if (!connected && !isTerminalResult(summary.result)) summary.customerLevel = ''
  if (!isTerminalResult(summary.result)) ensureNextActionDefaults()
})

watch(() => summary.customerLevel, (value) => {
  summary.intentLevel = value
  if (['D', 'E'].includes(value)) {
    summary.nextActionType = ''
    summary.nextActionTime = ''
    summary.nextActionContent = ''
    return
  }
  const option = customerLevelOptions.find((item) => item.value === value)
  if (!option || option.days <= 0) return
  summary.nextActionType = summary.nextActionType || '电话'
  const next = new Date()
  next.setDate(next.getDate() + option.days)
  next.setHours(10, 0, 0, 0)
  summary.nextActionTime = formatLocalDateTime(next)
})

function isTerminalResult(result?: string) {
  return result === '号码无效' || result === '明确拒绝'
}

function normalizeIntentLevel(value?: string) {
  const level = String(value || '').trim().toUpperCase()
  return ['A', 'B', 'C', 'D', 'E'].includes(level) ? level : ''
}

function applyAiSummaryDraft(draft: SalesAiDraft) {
  if (draft.summary?.trim()) summary.remark = draft.summary.trim()
  if (summary.connected === 1 && draft.intentLevel && ['A', 'B', 'C', 'D', 'E'].includes(draft.intentLevel)) {
    summary.customerLevel = draft.intentLevel
    summary.intentLevel = draft.intentLevel
  }
  if (!['D', 'E'].includes(summary.customerLevel)) {
    if (draft.nextActionType && nextActionOptions.includes(draft.nextActionType)) {
      summary.nextActionType = draft.nextActionType
    }
    if (draft.nextActionTime) summary.nextActionTime = normalizeAiDateTime(draft.nextActionTime)
    if (draft.nextActionContent?.trim()) summary.nextActionContent = draft.nextActionContent.trim()
  }
}

function normalizeAiDateTime(value: string) {
  const parsed = new Date(String(value).replace(' ', 'T'))
  return Number.isNaN(parsed.getTime()) ? '' : formatLocalDateTime(parsed)
}

function formatLocalDateTime(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const h = String(date.getHours()).padStart(2, '0')
  const min = String(date.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${d} ${h}:${min}:00`
}

function ensureNextActionDefaults() {
  if (!summary.nextActionType) summary.nextActionType = '电话'
  if (!summary.nextActionTime) {
    const next = new Date()
    next.setDate(next.getDate() + 1)
    next.setHours(10, 0, 0, 0)
    summary.nextActionTime = formatLocalDateTime(next)
  }
}

function todayKey(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const progressStorageKey = computed(() => {
  const user = userStore.userInfo?.id || userStore.userInfo?.userId || userStore.userInfo?.username || 'current'
  return `zhehang:tele-call-progress:${todayKey()}:${user}`
})

const summaryDraftKey = computed(() => {
  const user = userStore.userInfo?.id || userStore.userInfo?.userId || userStore.userInfo?.username || 'current'
  return `zhehang:tele-summary-draft:${user}`
})

function persistSummaryDraft() {
  if (!summary.customerName && !summary.phone) return
  try {
    localStorage.setItem(summaryDraftKey.value, JSON.stringify({
      savedAt: Date.now(),
      platformCallId: dialCtx.callId,
      summary: { ...summary, needTypes: [...summary.needTypes] }
    }))
    hasSummaryDraft.value = true
  } catch {
    /* local storage unavailable: keep the dialog open unless the user confirms closing */
  }
}

function clearSummaryDraft() {
  try {
    localStorage.removeItem(summaryDraftKey.value)
  } catch {
    /* ignore local storage errors */
  }
  hasSummaryDraft.value = false
  summaryDraftLead.value = null
}

function loadSummaryDraft() {
  try {
    const raw = localStorage.getItem(summaryDraftKey.value)
    if (!raw) return
    const draft = JSON.parse(raw)
    if (!draft?.summary || !draft.savedAt || Date.now() - Number(draft.savedAt) > 7 * 24 * 60 * 60 * 1000) {
      clearSummaryDraft()
      return
    }
    Object.assign(summary, draft.summary, {
      needTypes: Array.isArray(draft.summary.needTypes) ? draft.summary.needTypes : []
    })
    dialCtx.leadId = Number(summary.leadId || 0)
    dialCtx.customerName = summary.customerName || ''
    dialCtx.phone = summary.phone || ''
    dialCtx.callId = String(draft.platformCallId || '')
    hasSummaryDraft.value = true
  } catch {
    clearSummaryDraft()
  }
}

function currentUserId() {
  const id = Number(userStore.userInfo?.id || userStore.userInfo?.userId)
  return Number.isFinite(id) && id > 0 ? id : null
}

function clearStaleSummaryDraft(notify: boolean) {
  const staleLeadId = Number(summary.leadId || 0)
  summaryVisible.value = false
  clearSummaryDraft()
  if (Number(current.value?.id) === staleLeadId) current.value = null
  if (notify) ElMessage.info('原客户已删除、回公海或不再归您，待小结已自动清除，可继续下一通')
}

async function reconcileSummaryDraft(notify = false) {
  if (!hasSummaryDraft.value) return false
  const draftLeadId = Number(summary.leadId || 0)
  if (draftLeadId <= 0) return true

  try {
    const lead: any = unwrap(await leadApi.detail(draftLeadId, { silentError: true }))
    if (!hasSummaryDraft.value || Number(summary.leadId) !== draftLeadId) return hasSummaryDraft.value

    const validity = evaluateTeleSummaryDraftLead(lead, draftLeadId, currentUserId())
    if (validity === 'stale') {
      clearStaleSummaryDraft(notify)
      return false
    }
    if (validity === 'active') summaryDraftLead.value = mapLead(lead)
    return true
  } catch (error) {
    if (isTeleSummaryDraftStaleError(error)) {
      clearStaleSummaryDraft(notify)
      return false
    }
    // Network/server failures must not silently discard an unfinished summary.
    return true
  }
}

async function reopenSummaryDraft() {
  loadSummaryDraft()
  if (!hasSummaryDraft.value) return
  if (!await reconcileSummaryDraft(true)) {
    const next = getNextLeadFromList(leads.value) || leads.value[0]
    if (next) await selectLead(next)
    return
  }
  const draftLead = findDraftLead()
  if (draftLead) {
    current.value = draftLead
    loadCalls()
    scrollToLead(draftLead.id)
  }
  summaryVisible.value = true
}

function findDraftLead(): LeadItem | null {
  const saved = leads.value.find((item) => item.id === Number(summary.leadId))
  if (saved) return saved
  if (summaryDraftLead.value?.id === Number(summary.leadId)) return summaryDraftLead.value
  if (Number(summary.leadId) === 0 && summary.phone) {
    return { id: 0, company: summary.customerName || '手动拨号', phone: summary.phone }
  }
  return null
}

watch(summary, () => {
  if (summaryVisible.value) persistSummaryDraft()
}, { deep: true })

function loadLocalCallProgress() {
  try {
    const raw = localStorage.getItem(progressStorageKey.value)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return
    const next: Record<string, CallProgress> = {}
    Object.keys(parsed).forEach((key) => {
      const item = parsed[key]
      if (!item?.leadId || !item?.callTime || !isToday(item.callTime)) return
      next[String(item.leadId)] = {
        leadId: Number(item.leadId),
        customerName: String(item.customerName || '未命名客户'),
        phone: item.phone ? String(item.phone) : '',
        status: item.status === 'dialing' ? 'dialing' : 'called',
        result: item.result ? String(item.result) : '',
        connected: item.connected === undefined ? undefined : Number(item.connected),
        duration: item.duration === undefined ? undefined : Number(item.duration),
        callTime: String(item.callTime),
        updatedAt: Number(item.updatedAt || Date.now()),
        summarySaved: !!item.summarySaved
      }
    })
    callProgressMap.value = next
  } catch {
    callProgressMap.value = {}
  }
}

function persistCallProgress() {
  try {
    localStorage.setItem(progressStorageKey.value, JSON.stringify(callProgressMap.value))
  } catch {
    /* ignore local storage errors */
  }
}

function mergeCallProgress(progress: CallProgress, persist = true) {
  if (!progress.leadId || !isToday(progress.callTime)) return
  const key = String(progress.leadId)
  const prev = callProgressMap.value[key]
  if (prev && Number(prev.updatedAt || 0) > Number(progress.updatedAt || 0)) return
  callProgressMap.value = {
    ...callProgressMap.value,
    [key]: progress
  }
  if (persist) persistCallProgress()
}

function markLeadProgress(input: {
  leadId: number
  customerName: string
  phone?: string
  status?: CallProgress['status']
  result?: string
  connected?: number
  duration?: number
  summarySaved?: boolean
  callTime?: string
}) {
  if (!input.leadId) return
  const now = new Date()
  mergeCallProgress({
    leadId: Number(input.leadId),
    customerName: input.customerName || '未命名客户',
    phone: input.phone || '',
    status: input.status || 'called',
    result: input.result || '',
    connected: input.connected,
    duration: input.duration,
    callTime: input.callTime || now.toISOString(),
    updatedAt: now.getTime(),
    summarySaved: !!input.summarySaved
  })
}

async function loadTodayCallProgress() {
  try {
    const data: any = unwrap(await callRecordApi.list({ todayOnly: true, limit: 1000 }))
    const records = Array.isArray(data) ? data : data?.records || data?.list || []
    todayCallRecords.value = records
    records.forEach((record: any) => {
      if (!record?.leadId || !record?.callTime) return
      const date = parseDate(record.callTime)
      const ts = date?.getTime() || 0
      if (isToday(record.callTime)) {
        mergeCallProgress({
          leadId: Number(record.leadId),
          customerName: record.customerName || '未命名客户',
          phone: record.phone || '',
          status: 'called',
          result: record.result || (Number(record.connected) === 1 ? '接通' : '未接通'),
          connected: Number(record.connected || 0),
          duration: Number(record.duration || 0),
          callTime: String(record.callTime),
          updatedAt: ts || Date.now(),
          summarySaved: true
        }, false)
      }
    })
    persistCallProgress()
  } catch {
    todayCallRecords.value = []
    /* ignore */
  }
}

function parseDate(value?: string) {
  if (!value) return null
  const normalized = String(value).replace('T', ' ').replace(/-/g, '/')
  const date = new Date(normalized)
  return Number.isNaN(date.getTime()) ? null : date
}

function isToday(value?: string) {
  const date = parseDate(value)
  return !!date && todayKey(date) === todayKey()
}

function leadProgress(item: LeadItem) {
  return callProgressMap.value[String(item.id)] || null
}

// 推荐只跳过今天已经拨过的客户。历史拨打不应永久把客户排除在后续待办之外。
function isUncalledLead(item: LeadItem) {
  return !leadProgress(item)
}

function isNextLead(item: LeadItem) {
  return nextLeadAfterLast.value?.id === item.id
}

function leadItemClasses(item: LeadItem) {
  const progress = leadProgress(item)
  return {
    active: current.value?.id === item.id,
    called: !!progress,
    dialing: progress?.status === 'dialing',
    next: !progress && isNextLead(item)
  }
}

function leadProgressClass(item: LeadItem) {
  const progress = leadProgress(item)
  if (progress?.status === 'dialing') return 'dialing'
  if (Number(progress?.connected) === 1) return 'connected'
  return 'called'
}

function leadStatusText(item: LeadItem) {
  const progress = leadProgress(item)
  if (!progress) return ''
  if (progress.status === 'dialing') return '拨打中'
  const result = progress.result || '已拨'
  return `${result} ${formatProgressTime(progress.callTime)}`
}

function formatProgressTime(value?: string) {
  const date = parseDate(value)
  if (!date) return ''
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function getNextLeadFromList(list: LeadItem[]) {
  if (!list.length) return null
  // 后端已按下一步时间筛出今日任务,这里仅跳过今天已经拨过的客户。
  const firstUncalled = list.find((item) => isUncalledLead(item)) || null
  const last = lastCallProgress.value
  if (!last) return firstUncalled
  const lastIndex = list.findIndex((item) => item.id === last.leadId)
  if (lastIndex >= 0) {
    const next = list.slice(lastIndex + 1).find((item) => isUncalledLead(item))
    if (next) return next
  }
  return firstUncalled
}

function leadDueLabel(item: LeadItem) {
  const due = parseDate(item.nextActionTime || item.nextFollowTime)
  if (!due) return item.lastFollowTime ? `漏排下一步 · 上次${formatShortDate(item.lastFollowTime)}` : '首次联系'
  const now = new Date()
  if (due.getTime() < now.getTime()) return `已到期 · ${formatShortDate(item.nextActionTime || item.nextFollowTime)}`
  return `${item.nextActionType || '跟进'} · ${formatShortDate(item.nextActionTime || item.nextFollowTime)}`
}

function isOverdueLead(item: LeadItem) {
  const due = parseDate(item.nextActionTime || item.nextFollowTime)
  return Boolean(due && due.getTime() < Date.now())
}

function formatShortDate(value?: string) {
  const date = parseDate(value)
  if (!date) return ''
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function queueTime(item: LeadItem) {
  const date = parseDate(item.nextActionTime || item.nextFollowTime)
  if (!date) return '待安排'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 待打名单滚动容器,用于「继续从下一通」时把推荐客户滚到可视中央
const leadListRef = ref<HTMLElement>()
function scrollToLead(id: any) {
  if (id == null) return
  nextTick(() => {
    const el = leadListRef.value?.querySelector(`[data-lead-id="${id}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  })
}

const nextUncalledLead = computed(() => {
  if (!leads.value.length) return null
  const currentIndex = current.value ? leads.value.findIndex((item) => item.id === current.value?.id) : -1
  if (currentIndex >= 0) {
    const later = leads.value.slice(currentIndex + 1).find((item) => isUncalledLead(item))
    if (later) return later
  }
  return leads.value.find((item) => item.id !== current.value?.id && isUncalledLead(item)) || null
})

async function skipCurrent() {
  if (hasSummaryDraft.value) {
    await reconcileSummaryDraft(true)
    if (hasSummaryDraft.value) {
      await reopenSummaryDraft()
      ElMessage.warning('请先完成上一通电话的小结')
      return
    }
  }
  const next = nextUncalledLead.value
  if (!next) {
    ElMessage.info('当前名单没有其他待拨客户')
    return
  }
  selectLead(next)
  scrollToLead(next.id)
}

async function loadStats() {
  try {
    const data: any = unwrap(await callRecordApi.stats()) || {}
    stats.callCount = data.callCount || 0
    stats.connectedCount = data.connectedCount || 0
    stats.connectRate = data.connectRate || 0
    stats.totalDurationText = data.totalDurationText || formatDuration(data.totalDuration)
    stats.over1minCount = data.over1minCount || 0
  } catch {
    /* ignore */
  }
}

function mapLead(row: any): LeadItem {
  return {
    id: row.id,
    company: row.company || row.companyName || row.name || '未命名线索',
    legalPerson: row.legalPerson || row.contactName || row.contact || '',
    phone: row.phone || '',
    source: row.source,
    sourceDetail: row.sourceDetail || '',
    creditCode: row.creditCode,
    customerLevel: normalizeIntentLevel(row.customerLevel),
    intentLevel: normalizeIntentLevel(row.intentLevel),
    registerAddress: row.registerAddress || '',
    latestAddress: row.latestAddress || '',
    followStatus: row.followStatus,
    lastFollowTime: row.lastFollowTime,
    nextFollowTime: row.nextFollowTime,
    nextActionTime: row.nextActionTime,
    nextActionType: row.nextActionType,
    ownerName: row.ownerName || row.assigneeName || '',
    createTime: row.createTime
  }
}

async function loadLeads(reset = true) {
  leadLoading.value = true
  try {
    if (reset) leadPage.value = 1
    const data: any = unwrap(await leadApi.todoFollow({ pageNum: leadPage.value, pageSize: 50, keyword: leadKeyword.value.trim() || undefined }))
    const records = data?.records || data?.list || []
    const mapped = Array.isArray(records) ? records.map(mapLead) : []
    leadTotal.value = Number(data?.total ?? mapped.length) || 0
    leads.value = reset ? mapped : [...leads.value, ...mapped]
    await reconcileSummaryDraft()
    const draftLead = hasSummaryDraft.value ? findDraftLead() : null
    if (draftLead) {
      current.value = draftLead
      summaryVisible.value = true
      await loadCalls()
    } else if (!current.value && leads.value.length) {
      selectLead(getNextLeadFromList(leads.value) || leads.value[0])
    }
  } catch {
    ElMessage.error('待打名单加载失败')
  } finally {
    leadLoading.value = false
  }
}

function loadMoreLeads() {
  if (leadLoading.value || !leadHasMore.value) return
  leadPage.value += 1
  loadLeads(false)
}

async function selectLead(item: LeadItem) {
  if (hasSummaryDraft.value && Number(summary.leadId) !== Number(item.id)) {
    await reconcileSummaryDraft(true)
    if (hasSummaryDraft.value) {
      await reopenSummaryDraft()
      ElMessage.warning('请先完成上一通电话的小结')
      return
    }
  }
  current.value = item
  loadCalls()
}

function openCustomer360() {
  if (!current.value?.id) return
  customer360LeadId.value = current.value.id
  customer360Visible.value = true
}

async function handleCustomer360Changed(payload: { leadId: number; action: 'follow' | 'convert' }) {
  const selectedId = current.value?.id
  await Promise.all([loadStats(), loadTodayCallProgress()])
  await loadLeads(true)
  if (!selectedId) return
  const refreshed = leads.value.find((item) => item.id === selectedId)
  if (refreshed) {
    current.value = refreshed
    await loadCalls()
  } else {
    current.value = null
    const next = getNextLeadFromList(leads.value) || leads.value[0]
    if (next) selectLead(next)
  }
  if (payload.action === 'convert') customer360Visible.value = false
}

async function handleCustomer360Dial(payload: { leadId: number; phone: string; companyName: string }) {
  if (hasSummaryDraft.value) {
    await reconcileSummaryDraft(true)
    if (hasSummaryDraft.value) {
      customer360Visible.value = false
      await reopenSummaryDraft()
      ElMessage.warning('请先完成上一通电话的小结')
      return
    }
  }
  if (dialing.value || startingDial.value) {
    ElMessage.warning('当前已有外呼任务，请先完成后再拨下一通')
    return
  }
  const target = leads.value.find((item) => item.id === payload.leadId)
    || (current.value?.id === payload.leadId ? current.value : null)
    || { id: payload.leadId, company: payload.companyName, phone: payload.phone }
  customer360Visible.value = false
  if (current.value?.id !== target.id) selectLead(target)
  await nextTick()
  await startDial(target)
}

async function loadCalls() {
  if (!current.value) return
  if (!current.value.id) {
    callList.value = []
    return
  }
  callLoading.value = true
  try {
    const data: any = unwrap(await callRecordApi.list({ leadId: current.value.id }))
    callList.value = Array.isArray(data) ? data : data?.records || data?.list || []
  } catch {
    callList.value = []
  } finally {
    callLoading.value = false
  }
}

async function refreshAll() {
  nowTick.value = new Date()
  await Promise.all([loadStats(), loadTodayCallProgress()])
  await loadLeads(true)
}

function startCallTimer() {
  timer && clearInterval(timer)
  timer = setInterval(() => { dialSeconds.value += 1 }, 1000)
}

function stopCallTimer() {
  timer && clearInterval(timer)
  timer = null
}

function beginDialing(ctx: { leadId: number; customerName: string; phone: string; callId: string }) {
  dialCtx.leadId = ctx.leadId
  dialCtx.customerName = ctx.customerName
  dialCtx.phone = ctx.phone
  dialCtx.callId = ctx.callId
  markLeadProgress({
    leadId: ctx.leadId,
    customerName: ctx.customerName,
    phone: ctx.phone,
    status: 'dialing',
    result: '拨打中'
  })
  dialSeconds.value = 0
  hangupFailed.value = false
  dialing.value = true
  startCallTimer()
}

async function requestDial(ctx: { leadId: number; customerName: string; phone: string }) {
  if (hasSummaryDraft.value) {
    await reconcileSummaryDraft(true)
    if (hasSummaryDraft.value) {
      await reopenSummaryDraft()
      ElMessage.warning('请先完成上一通电话的小结')
      return false
    }
  }
  if (startingDial.value || dialing.value) return false
  startingDial.value = true
  hangupFailed.value = false
  try {
    const data: any = unwrap(await yunkeApi.dial({ phone: ctx.phone }))
    const callId = String(data?.callId || data?.data || '').trim()
    if (!callId) {
      throw new Error('云客未返回外呼ID，无法使用系统按钮挂断手机')
    }
    beginDialing({ ...ctx, callId })
    ElMessage.success(data?.message || '已通知工作手机拨号')
    return true
  } catch (e: any) {
    ElMessage.warning('云客外呼未发起：' + (e?.message || '当前坐席未开通或工作手机不在线'))
    return false
  } finally {
    startingDial.value = false
  }
}

async function startDial(item: LeadItem) {
  if (!item.phone) {
    ElMessage.warning('该客户暂无电话号码')
    return
  }
  const phone = String(item.phone).split(/[,，、/\s]+/)[0]
  await requestDial({ leadId: item.id, customerName: item.company, phone })
}

async function dialManual() {
  const phone = dialpadNumber.value.trim()
  if (!phone) return
  const hadCurrent = Boolean(current.value)
  if (!current.value) {
    current.value = { id: 0, company: '手动拨号', legalPerson: '手动输入号码', phone }
  }
  const ok = await requestDial({
    leadId: current.value?.id || 0,
    customerName: current.value?.company || '手动拨号',
    phone
  })
  if (ok) {
    dialpadVisible.value = false
    dialpadNumber.value = ''
  } else if (!hadCurrent && current.value?.id === 0) {
    current.value = null
  }
}

function finishCallAfterHangup() {
  stopCallTimer()
  dialing.value = false
  hangingUp.value = false
  hangupFailed.value = false
  summary.leadId = dialCtx.leadId
  summary.customerName = dialCtx.customerName
  summary.phone = dialCtx.phone
  summary.duration = dialSeconds.value
  summary.connected = dialSeconds.value > 5 ? 1 : 0
  summary.result = summary.connected ? '接通' : '无人接听'
  summary.intentLevel = ''
  summary.customerLevel = normalizeIntentLevel(current.value?.customerLevel)
  summary.followStatus = current.value?.followStatus || (summary.connected ? '需求沟通' : '线索接收')
  summary.needTypes = []
  summary.quoteStatus = '未报价'
  summary.remark = ''
  summary.nextActionType = '电话'
  summary.nextActionTime = ''
  summary.nextActionContent = ''
  ensureNextActionDefaults()
  markLeadProgress({
    leadId: summary.leadId,
    customerName: summary.customerName,
    phone: summary.phone,
    status: 'called',
    result: summary.result,
    connected: summary.connected,
    duration: summary.duration
  })
  summaryVisible.value = true
  persistSummaryDraft()
}

async function hangUp() {
  if (hangingUp.value) return
  if (!dialCtx.callId) {
    hangupFailed.value = true
    ElMessage.error('缺少云客外呼ID，无法通知工作手机挂断')
    return
  }
  hangingUp.value = true
  try {
    const data: any = unwrap(await yunkeApi.hangup({ callId: dialCtx.callId }))
    ElMessage.success(data?.message || '已通知工作手机挂断')
    finishCallAfterHangup()
  } catch (e: any) {
    hangupFailed.value = true
    ElMessage.error('手机挂断失败：' + (e?.message || '请确认工作手机在线，或先在手机上手动挂断'))
  } finally {
    hangingUp.value = false
  }
}

async function saveSummary() {
  if (summary.connected === 1 && !summary.remark.trim()) {
    ElMessage.warning('接通后请写清客户反馈或本次结论')
    return
  }
  if (summary.connected === 1 && !summary.customerLevel) {
    ElMessage.warning('请选择客户意向等级')
    return
  }
  if (requiresNextAction.value && (!summary.nextActionType || !summary.nextActionTime)) {
    ElMessage.warning('请安排下一步动作和具体时间')
    return
  }
  savingSummary.value = true
  try {
    await callRecordApi.saveSummary({
      leadId: summary.leadId,
      customerName: summary.customerName,
      phone: summary.phone,
      platformCallId: dialCtx.callId || undefined,
      duration: summary.duration,
      connected: summary.connected,
      result: summary.result,
      remark: summary.remark.trim(),
      intentLevel: summary.connected ? summary.intentLevel : '',
      customerLevel: summary.customerLevel || undefined,
      followStatus: summary.followStatus || undefined,
      needType: summary.needTypes.join(','),
      quoteStatus: summary.connected ? summary.quoteStatus : undefined,
      nextActionType: requiresNextAction.value ? summary.nextActionType : undefined,
      nextActionTime: requiresNextAction.value ? summary.nextActionTime : undefined,
      nextActionContent: requiresNextAction.value ? summary.nextActionContent.trim() : undefined
    })
    ElMessage.success(isHistoryIntent.value ? '小结已保存，客户已进入历史客资' : '小结已保存，下一步已进入待办')
    clearSummaryDraft()
    markLeadProgress({
      leadId: summary.leadId,
      customerName: summary.customerName,
      phone: summary.phone,
      status: 'called',
      result: summary.result,
      connected: summary.connected,
      duration: summary.duration,
      summarySaved: true
    })
    summaryVisible.value = false
    current.value = null
    await Promise.all([loadStats(), loadTodayCallProgress()])
    await loadLeads(true)
    const selectedLead = current.value as LeadItem | null
    if (selectedLead) scrollToLead(selectedLead.id)
  } catch {
    ElMessage.error('保存失败，请重试')
  } finally {
    savingSummary.value = false
  }
}

function beforeSummaryClose(done: () => void) {
  if (savingSummary.value) return
  ElMessageBox.confirm('这通电话还没有形成跟进记录，确定稍后再补吗？', '小结尚未保存', {
    confirmButtonText: '稍后再补',
    cancelButtonText: '继续填写',
    type: 'warning'
  }).then(() => {
    persistSummaryDraft()
    done()
    ElMessage.info('小结已暂存，请完成后再继续下一通')
  }).catch(() => {})
}

function discardSummary() {
  beforeSummaryClose(() => { summaryVisible.value = false })
}

async function openRecord(recordId?: number) {
  if (!recordId) return
  try {
    const data: any = unwrap(await callRecordApi.recordingTicket(recordId))
    const target = window.open(callRecordingStreamUrl(recordId, data.token), '_blank')
    if (target) target.opener = null
  } catch {
    ElMessage.warning('当前录音无权访问或暂时不可用')
  }
}

function formatDateTime(value?: string) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : ''
}

function formatDuration(seconds?: number) {
  const total = Number(seconds || 0)
  if (total <= 0) return '0m 0s'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h ? `${h}h ${m}m` : `${m}m ${s}s`
}

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

let clockTimer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  loadLocalCallProgress()
  loadSummaryDraft()
  refreshAll()
  clockTimer = setInterval(() => { nowTick.value = new Date() }, 60 * 1000)
})
onUnmounted(() => {
  stopCallTimer()
  if (clockTimer) clearInterval(clockTimer)
  clockTimer = null
})
</script>

<style scoped>
.tele-workbench {
  min-height: calc(100vh - 84px);
  padding: 14px 24px 24px;
  background: #f4f7fb;
  color: #1f2937;
  box-sizing: border-box;
}

.today-head,
.today-actions,
.tw-layout,
.customer-title-row,
.call-row {
  display: flex;
}

.today-head {
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
}

.today-head > div:first-child {
  display: flex;
  align-items: baseline;
  gap: 14px;
}

.today-head h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 800;
  letter-spacing: 0;
}

.today-head p {
  margin: 0;
  color: #667085;
  font-size: 14px;
}

.today-actions {
  gap: 12px;
}

.today-actions :deep(.el-button) {
  min-height: 42px;
  padding-inline: 18px;
  font-size: 15px;
}

.tw-stats {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.stat-card,
.left-panel,
.right-panel,
.rank-box {
  background: #fff;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(31, 53, 89, .06);
}

.stat-card {
  min-height: 106px;
  padding: 20px;
}

.stat-value {
  font-size: 32px;
  font-weight: 850;
  line-height: 1.05;
}

.stat-label {
  margin-top: 10px;
  color: #667085;
  font-size: 15px;
  font-weight: 700;
}

.tw-layout {
  align-items: flex-start;
  gap: 20px;
}

.left-panel {
  width: min(390px, 33vw);
  min-width: 350px;
  overflow: hidden;
}

.right-panel {
  flex: 1;
  min-width: 0;
  padding: 22px;
}

.panel-head {
  justify-content: space-between;
  align-items: center;
  padding: 16px 18px;
  border-bottom: 1px solid #edf1f6;
}

.panel-head,
.panel-head.compact {
  display: flex;
}

.panel-head h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 850;
}

.panel-head span {
  color: #667085;
  font-size: 14px;
  font-weight: 800;
}

.search-line {
  padding: 14px 16px 8px;
}

.search-line :deep(.el-input__wrapper) {
  min-height: 42px;
  font-size: 15px;
}

.summary-draft-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin: 10px 14px 8px;
  padding: 12px 14px;
  border: 1px solid #f6c56f;
  border-radius: 8px;
  background: #fff8e8;
}

.summary-draft-card > div {
  min-width: 0;
}

.summary-draft-card b,
.summary-draft-card span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-draft-card b {
  color: #8a4b08;
  font-size: 14px;
}

.summary-draft-card span {
  margin-top: 3px;
  color: #946516;
  font-size: 13px;
}

.last-call-card {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  margin: 10px 14px 8px;
  padding: 14px;
  border-radius: 12px;
  background: #101828;
  color: #fff;
  box-shadow: 0 16px 32px rgba(15, 23, 42, .2);
}

.last-call-card i {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #334155;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: 850;
}

.last-call-card b,
.last-call-card span {
  display: block;
}

.last-call-card b {
  color: #fff;
  font-size: 15px;
  line-height: 21px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-call-card span {
  margin: 5px 0 10px;
  color: #cbd5e1;
  font-size: 13px;
}

.lead-list {
  max-height: calc(100vh - 438px);
  overflow-y: auto;
  padding: 10px;
}

.lead-item {
  width: 100%;
  border: 1px solid transparent;
  min-height: 78px;
  border-radius: 8px;
  background: transparent;
  display: flex;
  gap: 12px;
  padding: 13px 12px;
  text-align: left;
  cursor: pointer;
}

.lead-item:hover,
.lead-item.active {
  background: #eaf2ff;
  border-color: #c8dbff;
}

.lead-item.called {
  background: #f3f4f6;
  border-color: #d1d5db;
  box-shadow: inset 4px 0 0 #111827;
}

.lead-item.called i {
  background: #111827;
}

.lead-item.dialing {
  background: #111827;
  border-color: #111827;
  box-shadow: inset 4px 0 0 #22c55e;
}

.lead-item.dialing b,
.lead-item.dialing em {
  color: #fff;
}

.lead-item.next {
  background: #edf4ff;
  border-color: #8ab8ff;
  box-shadow: inset 4px 0 0 #2f6bff;
}

.lead-item i,
.cust-avatar {
  border-radius: 8px;
  background: linear-gradient(135deg, #1f5fbf, #0f8b8d);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: 850;
  flex: 0 0 auto;
}

.lead-item i {
  width: 44px;
  height: 44px;
  font-size: 17px;
}

.lead-item span {
  min-width: 0;
  flex: 1;
}

.lead-item b,
.lead-item em {
  display: block;
}

.lead-item b {
  color: #263244;
  max-width: 100%;
  font-size: 16px;
  line-height: 22px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-item em {
  margin-top: 5px;
  color: #667085;
  font-size: 15px;
  line-height: 20px;
  font-style: normal;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lead-tag {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  min-height: 24px;
  margin-top: 8px;
  padding: 3px 9px;
  border-radius: 999px;
  background: #111827;
  color: #fff;
  font-size: 13px;
  font-weight: 850;
  line-height: 16px;
}

.lead-tag.connected {
  background: #dcfce7;
  color: #15803d;
}

.lead-tag.dialing,
.lead-tag.next {
  background: #dbeafe;
  color: #1d4ed8;
}

.lead-tag.called {
  background: #111827;
  color: #fff;
}

.lead-tag.due {
  background: #fff3e0;
  color: #a34f00;
  font-weight: 700;
}

.more-btn {
  width: 100%;
}

.rank-box {
  margin: 14px 10px 10px;
}

.rank-list {
  padding: 10px 14px 14px;
}

.rank-row {
  align-items: center;
  gap: 12px;
  min-height: 40px;
  font-size: 15px;
}

.rank-row i {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #8b95a7;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-style: normal;
  font-weight: 850;
}

.rank-row i.gold { background: #f28c28; }
.rank-row i.silver { background: #7b8ca7; }
.rank-row i.bronze { background: #b46a2e; }
.rank-row span { flex: 1; font-weight: 700; }
.rank-row b { color: #1f5fbf; }

.customer-card {
  align-items: center;
  gap: 18px;
  padding-bottom: 18px;
  border-bottom: 1px solid #edf1f6;
}

.cust-avatar {
  width: 64px;
  height: 64px;
  font-size: 24px;
}

.cust-info {
  flex: 1;
  min-width: 0;
}

.cust-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;
}

.cust-actions .el-button + .el-button {
  margin-left: 0;
}

.cust-info h3 {
  margin: 0;
  font-size: 22px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cust-info p {
  margin: 10px 0 0;
  color: #667085;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 15px;
}

.cust-next {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  color: #475467;
  font-size: 14px;
  flex-wrap: wrap;
}

.dial-main-btn {
  min-width: 132px;
  min-height: 48px;
  font-size: 17px;
  border-radius: 8px;
  box-shadow: 0 10px 22px rgba(47, 107, 255, .22);
}

.tw-tabs {
  margin-top: 12px;
}

.tw-tabs :deep(.el-tabs__item) {
  height: 46px;
  font-size: 15px;
  font-weight: 650;
}

.call-list {
  min-height: 340px;
}

.call-row {
  align-items: flex-start;
  gap: 14px;
  padding: 17px 2px;
  border-bottom: 1px dashed #edf1f6;
}

.call-status {
  border-radius: 999px;
  padding: 5px 11px;
  background: #ffe9e5;
  color: #c34636;
  font-size: 13px;
  font-weight: 850;
  line-height: 18px;
}

.call-status.on {
  background: #e7f7ef;
  color: #0d7a50;
}

.call-main {
  flex: 1;
  min-width: 0;
}

.call-main p {
  margin: 6px 0;
  color: #344054;
  font-size: 15px;
  line-height: 22px;
}

.call-main b {
  font-size: 15px;
  line-height: 22px;
}

.call-main em {
  color: #667085;
  font-size: 13px;
  font-style: normal;
}

.profile-desc {
  margin-top: 8px;
}

.dial-float {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 3000;
  width: 230px;
  padding: 18px;
  border-radius: 14px;
  background: #1f2937;
  color: #fff;
  text-align: center;
  box-shadow: 0 16px 40px rgba(15, 23, 42, .28);
}

.df-state {
  color: #7ee2ad;
  font-size: 12px;
  font-weight: 800;
}

.df-state i {
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-right: 6px;
  border-radius: 50%;
  background: #7ee2ad;
}

.dial-float h3 {
  margin: 10px 0 4px;
}

.dial-float p {
  margin: 0;
  color: #b7c0ce;
}

.dial-float strong {
  display: block;
  margin: 14px 0;
  font-size: 32px;
}

.df-secondary {
  display: block;
  margin: 8px auto 0;
  color: #cbd5e1;
}

.summary-customer {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.summary-customer strong {
  max-width: min(420px, 100%);
  color: #172033;
  font-size: 17px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.summary-customer span,
.summary-customer em {
  color: #475467;
  font-size: 15px;
  font-style: normal;
  font-variant-numeric: tabular-nums;
}

.summary-customer em {
  padding: 4px 10px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 800;
}

:global(.summary-dialog) {
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
}

:global(.summary-dialog .el-dialog__header) {
  padding: 22px 28px 16px;
  margin-right: 0;
  border-bottom: 1px solid #edf1f6;
}

:global(.summary-dialog .el-dialog__title) {
  font-size: 22px;
  font-weight: 850;
  color: #172033;
}

:global(.summary-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 20px;
  width: 42px;
  height: 42px;
}

:global(.summary-dialog .el-dialog__headerbtn .el-dialog__close) {
  font-size: 20px;
}

:global(.summary-dialog .el-dialog__body) {
  flex: 1;
  max-height: calc(85vh - 150px);
  padding: 22px 28px;
  overflow-y: auto;
}

:global(.summary-dialog .el-dialog__footer) {
  padding: 16px 28px 22px;
  border-top: 1px solid #edf1f6;
}

:global(.summary-dialog .el-button) {
  min-height: 42px;
  padding-inline: 18px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 650;
}

.summary-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.summary-form :deep(.el-form-item__label) {
  height: 40px;
  font-size: 16px;
  font-weight: 750;
  color: #344054;
}

.summary-form :deep(.el-segmented) {
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-selected-bg-color: #2563eb;
  min-height: 42px;
  padding: 4px;
}

.summary-form :deep(.el-segmented__item) {
  min-width: 92px;
  min-height: 34px;
  font-size: 15px;
  font-weight: 750;
}

.summary-form :deep(.el-radio-button__inner) {
  min-width: 66px;
  min-height: 40px;
  padding: 11px 18px;
  font-size: 15px;
  font-weight: 750;
}

.summary-form :deep(.el-textarea__inner) {
  min-height: 140px !important;
  padding: 12px 14px;
  font-size: 16px;
  line-height: 1.65;
}

.summary-form :deep(.el-input__wrapper),
.summary-form :deep(.el-select__wrapper) {
  min-height: 42px;
  font-size: 15px;
}

.summary-inline-groups {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.level-select {
  width: 180px;
}

.summary-business-grid,
.next-action-grid {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(220px, 1.25fr) minmax(260px, 1fr);
  gap: 12px;
}

.next-action-grid {
  grid-template-columns: 150px minmax(260px, 1fr);
}

.next-action-content {
  grid-column: 1 / -1;
}

.field-help {
  width: 100%;
  margin-top: 8px;
  color: #667085;
  font-size: 13px;
  line-height: 20px;
}

.summary-result-picker {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.summary-result-option {
  min-height: 86px;
  padding: 15px 16px;
  border: 1px solid #d9e2ef;
  border-radius: 8px;
  background: #fff;
  color: #263244;
  text-align: left;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease, box-shadow .15s ease, transform .15s ease;
}

.summary-result-option:hover {
  border-color: #3370ff;
  background: #f8fbff;
  transform: translateY(-1px);
}

.summary-result-option.active {
  border-color: #3370ff;
  background: #eef5ff;
  box-shadow: inset 0 0 0 1px #3370ff;
}

.summary-result-title {
  display: block;
  font-size: 16px;
  font-weight: 800;
  line-height: 22px;
}

.summary-result-desc {
  display: block;
  margin-top: 6px;
  color: #6b7280;
  font-size: 14px;
  line-height: 20px;
}

.summary-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.summary-result-option.tone-success.active .summary-result-title {
  color: #15803d;
}

.summary-result-option.tone-warning.active .summary-result-title {
  color: #b45309;
}

.summary-result-option.tone-danger.active .summary-result-title {
  color: #b91c1c;
}

.dialpad {
  display: grid;
  gap: 14px;
}

.dialpad-keys {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.dialpad-keys button {
  height: 48px;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  background: #f8fafc;
  color: #263244;
  font-size: 20px;
  font-weight: 800;
  cursor: pointer;
}

.goal-overview {
  display: block;
  min-height: 0;
  margin-bottom: 16px;
  padding: 14px;
  border: 1px solid #dfe5ee;
  border-radius: 8px;
  background: #fff;
}

.goal-summary-row {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  align-items: center;
  gap: 14px;
}

.goal-main {
  min-width: 0;
}

.goal-main > span,
.goal-metrics span {
  display: block;
  color: #475467;
  font-size: 14px;
  font-weight: 700;
}

.goal-main > strong {
  display: block;
  margin: 5px 0 3px;
  color: #1554c0;
  font-size: 36px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.goal-main strong small,
.goal-metrics strong small {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 700;
}

.goal-main > em,
.goal-metrics em {
  color: #667085;
  font-size: 13px;
  font-style: normal;
}

.goal-progress {
  min-width: 0;
}

.goal-progress-head,
.goal-progress-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.goal-progress-head {
  margin-bottom: 8px;
  color: #344054;
  font-size: 14px;
}

.goal-progress-head span b {
  color: #1554c0;
  font-size: 18px;
}

.goal-progress-head strong {
  color: #344054;
  font-size: 13px;
  white-space: nowrap;
}

.goal-progress :deep(.el-progress-bar__outer) {
  background: #e9eef6;
}

.goal-progress :deep(.el-progress-bar__inner) {
  background: #1554c0;
}

.goal-progress-foot {
  margin-top: 7px;
  color: #667085;
  font-size: 12px;
}

.goal-progress-foot em {
  color: #b15d0a;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.goal-checkpoints {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
  padding-top: 11px;
  border-top: 1px solid #edf1f6;
}

.goal-checkpoints article {
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  align-items: center;
  gap: 7px;
  min-width: 0;
  padding: 8px;
  border: 1px solid #edf1f6;
  border-radius: 6px;
  background: #f8fafc;
  text-align: left;
}

.goal-checkpoints article.active {
  border-color: #9fbeef;
  background: #f2f7ff;
}

.goal-checkpoints i {
  width: 8px;
  height: 8px;
  margin: 0;
  border: 0;
  border-radius: 50%;
  background: #aab3c2;
}

.goal-checkpoints i span {
  display: none;
}

.goal-checkpoints article.active i {
  background: #1554c0;
}

.goal-checkpoints article.done i {
  background: #14866d;
}

.goal-checkpoints b,
.goal-checkpoints p,
.goal-checkpoints em {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goal-checkpoints b {
  color: #344054;
  font-size: 13px;
}

.goal-checkpoints p {
  margin: 2px 0 0;
  color: #667085;
  font-size: 11px;
}

.goal-checkpoints em {
  color: #14866d;
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
}

.goal-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #e5e9f0;
}

.goal-metrics article {
  min-width: 0;
  padding: 4px 10px;
  border-left: 1px solid #e5e9f0;
}

.goal-metrics article:first-child {
  border-left: none;
}

.goal-metrics strong {
  display: inline-block;
  margin: 5px 0 0;
  color: #087c7c;
  font-size: 22px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.goal-metrics em {
  display: inline-block;
  margin: 0 0 0 6px;
  white-space: nowrap;
}

.left-column {
  width: clamp(360px, 32vw, 420px);
  min-width: 360px;
  flex: 0 0 auto;
}

.left-panel {
  width: 100%;
  min-width: 0;
}

.right-panel {
  padding: 0;
}

.lead-list {
  height: clamp(390px, calc(100vh - 330px), 660px);
  max-height: none;
  padding: 6px 10px 12px;
}

.lead-item {
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr) 46px;
  align-items: center;
  gap: 10px;
  min-height: 66px;
  padding: 10px 8px;
  border-bottom: 1px solid #edf1f6;
  border-radius: 4px;
}

.lead-time {
  color: #344054;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.lead-open {
  color: #1554c0;
  font-size: 13px;
  text-align: right;
  white-space: nowrap;
}

.lead-item.called .lead-open,
.lead-item.called .lead-time {
  color: #111827;
}

.lead-item.dialing .lead-open,
.lead-item.dialing .lead-time {
  color: #fff;
}

.lead-item i {
  width: 38px;
  height: 38px;
  border-radius: 6px;
  font-size: 15px;
}

.lead-item b {
  font-size: 15px;
}

.lead-item em {
  margin-top: 3px;
  font-size: 14px;
}

.lead-tag {
  min-height: 21px;
  margin-top: 5px;
  padding: 2px 7px;
  border-radius: 4px;
  font-size: 12px;
}

.customer-card {
  display: block;
  padding: 16px 18px 14px;
  border-bottom: 1px solid #e5e9f0;
}

.customer-title-row {
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.customer-name-line {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.customer-name-line h2 {
  flex: 1;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: #172033;
  font-size: 22px;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cust-info p {
  gap: 16px;
  margin-top: 8px;
}

.cust-info p span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.cust-actions :deep(.el-button) {
  min-height: 42px;
  margin-left: 0;
  padding-inline: 17px;
  font-size: 15px;
}

.dial-main-btn {
  min-width: 132px;
  min-height: 42px;
  border-radius: 6px;
  font-size: 16px;
}

.customer-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #edf1f6;
}

.customer-facts article {
  min-width: 0;
}

.customer-facts .source-detail-fact,
.customer-facts .address-fact {
  grid-column: span 2;
}

.customer-facts span,
.customer-facts strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-facts span {
  color: #667085;
  font-size: 13px;
}

.customer-facts strong {
  margin-top: 7px;
  color: #253247;
  font-size: 14px;
}

.inline-summary {
  position: relative;
  background: #fff;
}

.inline-summary.waiting {
  min-height: 84px;
}

.summary-guide,
.resume-summary-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 18px 0;
  padding: 10px 12px;
  border-radius: 6px;
}

.summary-guide {
  border: 1px solid #cdddf7;
  background: #f2f7ff;
}

.summary-guide > div {
  min-width: 0;
}

.summary-guide span,
.summary-guide p {
  display: block;
}

.summary-guide span {
  color: #1554c0;
  font-size: 15px;
  font-weight: 800;
}

.summary-guide p {
  margin: 3px 0 0;
  color: #475467;
  font-size: 14px;
}

.resume-summary-bar {
  border: 1px solid #f3bf67;
  background: #fff8e8;
}

.resume-summary-bar strong,
.resume-summary-bar span {
  display: block;
}

.resume-summary-bar strong {
  color: #8a4b08;
  font-size: 15px;
}

.resume-summary-bar span {
  margin-top: 4px;
  color: #946516;
  font-size: 13px;
}

.summary-step {
  padding: 14px 18px;
  border-bottom: 1px solid #e8ecf2;
}

.inline-summary.compact .summary-step {
  padding-block: 12px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
}

.step-title i {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #1554c0;
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-style: normal;
  font-weight: 800;
}

.step-title h3 {
  margin: 0;
  color: #172033;
  font-size: 18px;
  line-height: 28px;
}

.step-title em {
  margin-left: auto;
  color: #667085;
  font-size: 13px;
  font-style: normal;
}

.result-buttons {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 14px;
}

.result-buttons button {
  min-height: 42px;
  padding: 8px 10px;
  border: 1px solid #d7dde7;
  border-radius: 6px;
  background: #fff;
  color: #344054;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.result-buttons button:not(:disabled):hover {
  border-color: #1554c0;
  color: #1554c0;
}

.result-buttons button.active {
  border-color: #1554c0;
  background: #1554c0;
  color: #fff;
}

.result-buttons button.active:hover {
  color: #fff;
}

.result-buttons button:disabled {
  cursor: not-allowed;
  opacity: .55;
}

.field-label {
  display: block;
  margin-bottom: 7px;
  color: #344054;
  font-size: 14px;
  font-weight: 700;
}

.field-label b {
  color: #dc2626;
}

.inline-summary :deep(.el-input__wrapper),
.inline-summary :deep(.el-select__wrapper) {
  min-height: 40px;
  font-size: 15px;
}

.inline-summary :deep(.el-textarea__inner) {
  min-height: 72px !important;
  padding: 11px 13px;
  font-size: 15px;
  line-height: 1.55;
}

.inline-summary.compact :deep(.el-textarea__inner) {
  min-height: 54px !important;
}

.feedback-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 14px;
  margin-top: 14px;
}

.feedback-grid label,
.next-step-grid label {
  min-width: 0;
}

.feedback-grid label > span,
.next-step-grid label > span {
  display: block;
  margin-bottom: 7px;
  color: #475467;
  font-size: 13px;
  font-weight: 700;
}

.feedback-grid :deep(.el-select) {
  width: 100%;
}

.intent-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(112px, 1fr));
  gap: 9px;
}

.intent-options button {
  min-height: 70px;
  padding: 9px 10px;
  border: 1px solid #d7dde7;
  border-radius: 6px;
  background: #fff;
  color: #344054;
  text-align: left;
  cursor: pointer;
}

.intent-options button strong,
.intent-options button span,
.intent-options button em {
  display: block;
}

.intent-options button strong {
  font-size: 16px;
}

.intent-options button span {
  margin-top: 3px;
  font-size: 14px;
  font-weight: 700;
}

.intent-options button em {
  margin-top: 4px;
  color: #667085;
  font-size: 12px;
  font-style: normal;
}

.intent-options button:hover {
  border-color: #1554c0;
}

.intent-options button.active {
  border-color: #1554c0;
  background: #edf4ff;
  color: #1554c0;
  box-shadow: inset 0 0 0 1px #1554c0;
}

.intent-options button.intent-d.active,
.intent-options button.intent-e.active {
  border-color: #dc6803;
  background: #fff7ed;
  color: #b54708;
  box-shadow: inset 0 0 0 1px #dc6803;
}

.intent-strategy {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 10px 0 0;
  padding: 9px 11px;
  border-radius: 6px;
  background: #f2f7ff;
  color: #475467;
  font-size: 13px;
  line-height: 1.45;
}

.intent-strategy strong {
  color: #1554c0;
  white-space: nowrap;
}

.intent-strategy span {
  margin-left: auto;
  color: #1554c0;
  font-weight: 700;
  white-space: nowrap;
}

.intent-strategy.history {
  background: #fff7ed;
}

.intent-strategy.history strong,
.intent-strategy.history span {
  color: #b54708;
}

.next-step-grid {
  display: grid;
  grid-template-columns: minmax(190px, .9fr) minmax(140px, .55fr) minmax(240px, 1.4fr);
  gap: 14px;
}

.next-action-step {
  background: #fbfcfe;
}

.terminal-note {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 18px 0;
  padding: 12px 14px;
  border: 1px solid #f1c7c7;
  border-radius: 6px;
  background: #fff6f6;
}

.terminal-note strong {
  color: #b42318;
  font-size: 15px;
  white-space: nowrap;
}

.terminal-note span {
  color: #667085;
  font-size: 14px;
}

.summary-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 18px 16px;
}

.summary-actions :deep(.el-button) {
  min-height: 42px;
  margin-left: 0;
  padding-inline: 20px;
  font-size: 15px;
}

.call-history {
  padding: 0 18px 8px;
  border-top: 1px solid #e5e9f0;
}

.call-history :deep(.el-collapse-item__header) {
  min-height: 48px;
  font-size: 14px;
  font-weight: 700;
}

.call-history .call-list {
  min-height: 80px;
}

@media (max-width: 1200px) {
  .goal-metrics {
    padding-top: 10px;
  }

  .tw-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tw-layout {
    flex-direction: column;
  }

  .left-column,
  .left-panel {
    width: 100%;
    min-width: 0;
  }

  .lead-list {
    height: 420px;
  }

  .feedback-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .intent-options {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .next-step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .next-content {
    grid-column: 1 / -1;
  }

  .summary-result-picker {
    grid-template-columns: 1fr;
  }

  .summary-business-grid,
  .next-action-grid {
    grid-template-columns: 1fr;
  }

  .next-action-content {
    grid-column: auto;
  }
}

@media (max-width: 768px) {
  .tele-workbench {
    padding: 16px;
  }

  .today-head {
    flex-direction: column;
    align-items: stretch;
  }

  .today-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .intent-options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .goal-overview {
    padding: 16px;
  }

  .goal-summary-row {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .goal-checkpoints {
    grid-template-columns: 1fr;
  }

  .goal-metrics {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tw-stats {
    grid-template-columns: 1fr;
  }

  .customer-card {
    padding: 16px;
  }

  .customer-title-row {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .customer-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dial-main-btn {
    width: 100%;
  }

  .cust-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .result-buttons {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feedback-grid,
  .next-step-grid {
    grid-template-columns: 1fr;
  }

  .intent-field,
  .next-content {
    grid-column: auto;
  }

  .summary-guide,
  .resume-summary-bar {
    align-items: flex-start;
    flex-direction: column;
  }

  .terminal-note {
    align-items: flex-start;
    flex-direction: column;
  }

  .cust-actions > .el-button:first-child {
    min-height: 44px;
    flex: 0 0 auto;
  }

  .cust-actions .dial-main-btn {
    flex: 1 1 180px;
  }

  :global(.summary-dialog .el-dialog__header),
  :global(.summary-dialog .el-dialog__body),
  :global(.summary-dialog .el-dialog__footer) {
    padding-left: 18px;
    padding-right: 18px;
  }

  .summary-inline-groups,
  .summary-inline-groups :deep(.el-radio-group),
  .level-select {
    width: 100%;
  }
}
</style>

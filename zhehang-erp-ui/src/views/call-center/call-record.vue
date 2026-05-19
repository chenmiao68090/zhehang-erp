<template>
  <div class="cc-record-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-text">
        <div class="eyebrow">{{ t('cc.callRecord.eyebrow') }}</div>
        <h2 class="title">{{ t('cc.callRecord.title') }}</h2>
        <p class="subtitle">{{ t('cc.callRecord.subtitle') }}</p>
      </div>
      <div class="header-aside">
        <div class="now-time">{{ nowText }}</div>
        <div class="now-tag">{{ t('cc.callRecord.archive') }}</div>
      </div>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <div class="stat-card" :class="'stat-' + stat.key">
          <div class="stat-icon">
            <el-icon :size="24"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">
              <span class="num">{{ stat.value }}</span>
              <span class="unit">{{ stat.unit }}</span>
            </div>
            <div class="stat-trend" :class="stat.trendType">{{ stat.trend }}</div>
          </div>
          <div class="stat-pulse"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 高级筛选 -->
    <div class="filter-card">
      <div class="filter-head" @click="showFilter = !showFilter">
        <div class="filter-head-left">
          <el-icon class="head-ico"><Filter /></el-icon>
          <span class="filter-title">{{ t('cc.callRecord.filter.title') }}</span>
          <span class="filter-summary">{{ filterSummary }}</span>
        </div>
        <div class="filter-head-right">
          <span class="filter-hint">{{ showFilter ? t('common.collapse') : t('common.expand') }}</span>
          <el-icon class="filter-toggle" :class="{ rotated: showFilter }"><ArrowDown /></el-icon>
        </div>
      </div>
      <transition name="slide-fade">
        <div class="filter-body" v-show="showFilter">
          <el-form inline label-position="top" class="filter-form">
            <el-form-item :label="t('cc.callRecord.filter.timeRange')">
              <el-date-picker
                v-model="filter.timeRange"
                type="datetimerange"
                :start-placeholder="t('cc.callRecord.filter.startDate')"
                :end-placeholder="t('cc.callRecord.filter.endDate')"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 360px"
              />
            </el-form-item>
            <el-form-item :label="t('cc.callRecord.filter.callType')">
              <el-select v-model="filter.direction" :placeholder="t('common.pleaseSelect')" clearable style="width: 150px">
                <el-option v-for="d in directionOptions" :key="d.value" :label="d.label" :value="d.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('cc.callRecord.filter.callResult')">
              <el-select v-model="filter.result" :placeholder="t('common.pleaseSelect')" clearable style="width: 150px">
                <el-option v-for="r in resultOptions" :key="r.value" :label="r.label" :value="r.value" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('cc.callRecord.filter.agent')">
              <el-select v-model="filter.agentNo" :placeholder="t('cc.callRecord.filter.agentPlaceholder')" clearable filterable style="width: 200px">
                <el-option
                  v-for="a in agentOpts"
                  :key="a.agentNo"
                  :label="a.agentNo + ' · ' + a.name"
                  :value="a.agentNo"
                />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('cc.callRecord.filter.caller')">
              <el-input v-model="filter.caller" :placeholder="t('cc.callRecord.filter.callerPlaceholder')" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item :label="t('cc.callRecord.filter.callee')">
              <el-input v-model="filter.callee" :placeholder="t('cc.callRecord.filter.calleePlaceholder')" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" :icon="Search" @click="handleSearch">{{ t('common.search') }}</el-button>
              <el-button :icon="RefreshRight" @click="handleReset">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </div>
      </transition>
    </div>

    <!-- 通话记录列表 -->
    <div class="table-card">
      <div class="table-head">
        <div class="table-head-left">
          <span class="table-title">{{ t('cc.callRecord.title') }}</span>
          <span class="table-sub">{{ t('cc.callRecord.pagination', { total: page.total, current: page.current, pages: totalPages }) }}</span>
        </div>
        <div class="table-head-right">
          <el-button :icon="Download" plain @click="exportRecords">{{ t('common.export') }}</el-button>
        </div>
      </div>
      <el-table
        :data="recordList"
        v-loading="loading"
        class="record-table"
        stripe
        row-key="callId"
        @row-click="handleRowClick"
        style="width: 100%"
      >
        <el-table-column :label="t('cc.callRecord.column.callId')" min-width="190">
          <template #default="{ row }">
            <span class="call-id">{{ row.callId }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.direction')" width="76" align="center">
          <template #default="{ row }">
            <span class="dir-icon" :class="'dir-' + row.direction" :title="dirLabel(row.direction)">
              <el-icon :size="14"><component :is="dirIcon(row.direction)" /></el-icon>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.caller')" min-width="140">
          <template #default="{ row }">
            <span class="phone">{{ row.caller }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.callee')" min-width="140">
          <template #default="{ row }">
            <span class="phone">{{ row.callee }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.filter.agent')" min-width="140">
          <template #default="{ row }">
            <template v-if="row.agentName">
              <div class="agent-cell">
                <div class="avatar" :style="{ background: avatarBg(row.agentName) }">
                  {{ row.agentName.slice(-2) }}
                </div>
                <span class="agent-name">{{ row.agentName }}</span>
              </div>
            </template>
            <span v-else class="muted">{{ t('cc.callRecord.unassigned') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.startTime')" min-width="170">
          <template #default="{ row }">
            <span class="time">{{ row.startTime }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.talkDuration')" width="100" align="center">
          <template #default="{ row }">
            <span class="duration">{{ fmtDur(row.talkDuration) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.ringDuration')" width="90" align="center">
          <template #default="{ row }">
            <span class="duration wait">{{ fmtDur(row.ringDuration) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.result')" width="110" align="center">
          <template #default="{ row }">
            <el-tag :type="resultTagType(row.result)" effect="dark" round class="result-tag">
              {{ resultLabel(row.result) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.callRecord.column.operation')" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" :icon="View" @click.stop="openDetail(row)">{{ t('cc.callRecord.action.view') }}</el-button>
            <el-button text type="primary" :icon="Headset" @click.stop="quickPlay(row)" v-if="row.recordingUrl">{{ t('cc.callRecord.action.play') }}</el-button>
            <el-button text type="primary" :icon="Download" @click.stop="downloadRec(row)" v-if="row.recordingUrl">{{ t('cc.callRecord.action.download') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="page.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="drawerVisible" :size="760" class="record-drawer" :with-header="false" destroy-on-close>
      <div v-if="current" class="drawer-content">
        <div class="drawer-head">
          <div class="drawer-head-left">
            <div class="drawer-eyebrow">CALL DOSSIER · {{ t('cc.callRecord.detail.title') }}</div>
            <div class="drawer-id">{{ current.callId }}</div>
            <div class="drawer-meta">
              <span class="dir-icon sm" :class="'dir-' + current.direction">
                <el-icon :size="12"><component :is="dirIcon(current.direction)" /></el-icon>
              </span>
              <span class="meta-text">{{ dirLabel(current.direction) }} · {{ current.startTime }}</span>
            </div>
          </div>
          <el-tag :type="resultTagType(current.result)" effect="dark" round class="result-tag big">
            {{ resultLabel(current.result) }}
          </el-tag>
        </div>

        <!-- 基本信息 -->
        <section class="info-section">
          <div class="section-title"><span class="bar"></span>{{ t('cc.callRecord.detail.basic') }}</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.direction') }}</div>
              <div class="info-value">
                <span class="dir-icon sm" :class="'dir-' + current.direction">
                  <el-icon :size="12"><component :is="dirIcon(current.direction)" /></el-icon>
                </span>
                {{ dirLabel(current.direction) }}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.filter.caller') }}</div>
              <div class="info-value phone">{{ current.caller }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.filter.callee') }}</div>
              <div class="info-value phone">{{ current.callee }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.agent') }}</div>
              <div class="info-value">
                {{ current.agentName || '-' }}
                <span class="muted" v-if="current.agentNo">/ {{ current.agentNo }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.skillGroup') }}</div>
              <div class="info-value">{{ current.skillGroup || '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.hangupBy') }}</div>
              <div class="info-value">{{ hangupLabel(current.hangupBy) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.startTime') }}</div>
              <div class="info-value time">{{ current.startTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.endTime') }}</div>
              <div class="info-value time">{{ current.endTime }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.ringDuration') }}</div>
              <div class="info-value duration">{{ fmtDur(current.ringDuration) }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">{{ t('cc.callRecord.column.talkDuration') }}</div>
              <div class="info-value duration emph">{{ fmtDur(current.talkDuration) }}</div>
            </div>
          </div>
        </section>

        <!-- 录音播放器 -->
        <section class="info-section">
          <div class="section-title"><span class="bar"></span>{{ t('cc.callRecord.detail.recording') }}</div>
          <div v-if="current.recordingUrl" class="audio-stage">
            <div class="waveform" @click="seekByWave">
              <span
                v-for="(h, i) in waveBars"
                :key="i"
                class="wave-bar"
                :class="{ active: i / waveBars.length <= progress, beating: playing }"
                :style="{ height: h + '%', animationDelay: (i * 0.03) + 's' }"
              ></span>
              <div class="wave-cursor" :style="{ left: (progress * 100) + '%' }"></div>
            </div>
            <div class="audio-controls">
              <button class="play-btn" @click="togglePlay" :class="{ playing }">
                <el-icon :size="22">
                  <VideoPlay v-if="!playing" />
                  <VideoPause v-else />
                </el-icon>
              </button>
              <div class="time-display">
                <span class="time-cur">{{ fmtTime(currentTime) }}</span>
                <span class="time-sep">/</span>
                <span class="time-total">{{ fmtTime(totalTime) }}</span>
              </div>
              <div class="progress-track" @click="seekByTrack">
                <div class="progress-bar" :style="{ width: (progress * 100) + '%' }"></div>
                <div class="progress-thumb" :style="{ left: (progress * 100) + '%' }"></div>
              </div>
              <div class="audio-extra">
                <el-popover placement="top" :width="180" trigger="click">
                  <template #reference>
                    <button class="icon-btn" :title="t('cc.callRecord.detail.volumeTip', { value: volume })">
                      <el-icon :size="16"><Microphone /></el-icon>
                    </button>
                  </template>
                  <div class="vol-popover">
                    <el-icon :size="14"><Mute /></el-icon>
                    <el-slider v-model="volume" :min="0" :max="100" />
                    <span class="vol-num">{{ volume }}</span>
                  </div>
                </el-popover>
                <el-select v-model="rate" size="small" class="rate-select">
                  <el-option v-for="r in [0.5, 0.75, 1, 1.25, 1.5, 2]" :key="r" :label="r + 'x'" :value="r" />
                </el-select>
                <el-button :icon="Download" circle plain @click="downloadRec(current)" />
              </div>
            </div>
            <audio ref="audioEl" :src="current.recordingUrl" preload="metadata" style="display:none"></audio>
          </div>
          <div v-else class="no-record">
            <el-icon :size="36"><Microphone /></el-icon>
            <div class="no-record-text">{{ t('cc.callRecord.detail.noRecording') }}</div>
          </div>
        </section>

        <!-- 事件时间轴 -->
        <section class="info-section">
          <div class="section-title">
            <span class="bar"></span>{{ t('cc.callRecord.detail.timeline') }}
            <span class="section-sub">{{ t('cc.callRecord.detail.eventCount', { n: events.length }) }}</span>
          </div>
          <el-timeline class="event-timeline">
            <el-timeline-item
              v-for="(ev, i) in events"
              :key="i"
              :type="(ev.type as any) || 'primary'"
              :timestamp="ev.time"
              placement="top"
              :hollow="i !== events.length - 1"
            >
              <div class="event-card">
                <div class="event-title">{{ ev.event }}</div>
                <div class="event-detail" v-if="ev.detail">{{ ev.detail }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </section>

        <!-- 质检评分 -->
        <section class="info-section">
          <div class="section-title">
            <span class="bar"></span>{{ t('cc.callRecord.qa.title') }}
            <span class="section-sub">QC Scoring · {{ t('cc.callRecord.qa.scoreTitle') }}</span>
          </div>
          <div class="rate-grid">
            <div class="rate-item" v-for="dim in qcDims" :key="dim.key">
              <div class="rate-label">
                <el-icon :size="14"><component :is="dim.icon" /></el-icon>
                <span>{{ dim.label }}</span>
              </div>
              <el-rate
                v-model="qc[dim.key]"
                :colors="rateColors"
                allow-half
                show-score
                :score-template="t('cc.callRecord.qa.scoreTemplate')"
                class="qc-rate"
              />
            </div>
          </div>
          <div class="rate-summary">
            <div class="rate-overall">
              <div class="rate-overall-label">{{ t('cc.callRecord.qa.totalScore') }}</div>
              <div class="rate-overall-num">{{ qcOverall }}</div>
              <div class="rate-overall-unit">/ 5.00</div>
            </div>
            <el-input
              v-model="qc.remark"
              type="textarea"
              :rows="3"
              :placeholder="t('cc.callRecord.qa.commentPlaceholder')"
              class="qc-remark"
            />
          </div>
          <div class="rate-actions">
            <el-button :icon="RefreshLeft" @click="resetQc">{{ t('cc.callRecord.qa.reset') }}</el-button>
            <el-button type="primary" :icon="Promotion" @click="submitQc">{{ t('cc.callRecord.qa.submit') }}</el-button>
          </div>
        </section>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, RefreshRight, RefreshLeft, Download, View, Headset, Filter, ArrowDown,
  VideoPlay, VideoPause, Microphone, Mute, Promotion,
  PhoneFilled, Phone, Connection, ChatDotRound, Trophy, Medal, Aim, Files
} from '@element-plus/icons-vue'
import {
  getCallRecords, getCallEvents, getAgents,
  type CallRecord, type CallEvent, type CallDirection, type CallResult, type Agent
} from '@/api/call-center'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ============ 状态 ============
const loading = ref(false)
const showFilter = ref(true)
const drawerVisible = ref(false)
const recordList = ref<CallRecord[]>([])
const agentOpts = ref<Agent[]>([])
const current = ref<CallRecord | null>(null)
const events = ref<CallEvent[]>([])
const nowText = ref('')

const filter = reactive({
  timeRange: [] as string[],
  direction: '' as CallDirection | '',
  result: '' as CallResult | '',
  agentNo: '',
  caller: '',
  callee: ''
})
const page = reactive({ current: 1, size: 20, total: 0 })

const directionOptions = computed(() => [
  { label: t('cc.callRecord.direction.inbound'), value: 'inbound' },
  { label: t('cc.callRecord.direction.outbound'), value: 'outbound' },
  { label: t('cc.callRecord.direction.internal'), value: 'internal' }
])
const resultOptions = computed(() => [
  { label: t('cc.callRecord.result.answered'), value: 'answered' },
  { label: t('cc.callRecord.result.no-answer'), value: 'no-answer' },
  { label: t('cc.callRecord.result.busy'), value: 'busy' },
  { label: t('cc.callRecord.result.failed'), value: 'failed' },
  { label: t('cc.callRecord.result.abandoned'), value: 'abandoned' }
])

// ============ 统计概览 ============
const stats = computed(() => {
  const todayPrefix = new Date().toISOString().slice(0, 10)
  const todayList = recordList.value.filter(r => r.startTime.startsWith(todayPrefix))
  const total = todayList.length || recordList.value.length
  const answered = recordList.value.filter(r => r.result === 'answered').length
  const answerRate = recordList.value.length
    ? Math.round((answered / recordList.value.length) * 1000) / 10
    : 0
  const talkAvg = answered
    ? Math.round(
        recordList.value.filter(r => r.result === 'answered').reduce((s, r) => s + r.talkDuration, 0) / answered
      )
    : 0
  const waitAvg = recordList.value.length
    ? Math.round(recordList.value.reduce((s, r) => s + r.ringDuration, 0) / recordList.value.length)
    : 0
  return [
    { key: 'total', icon: PhoneFilled, label: t('cc.callRecord.stats.todayCalls'), value: total, unit: t('cc.callRecord.stats.unitCall'), trend: t('cc.callRecord.stats.trendUp'), trendType: 'up' },
    { key: 'answer', icon: Connection, label: t('cc.callRecord.stats.answerRate'), value: answerRate, unit: '%', trend: t('cc.callRecord.stats.trendStable'), trendType: 'flat' },
    { key: 'talk', icon: ChatDotRound, label: t('cc.callRecord.stats.avgTalk'), value: fmtDurShort(talkAvg), unit: '', trend: '— mm:ss', trendType: 'flat' },
    { key: 'wait', icon: Files, label: t('cc.callRecord.stats.avgWait'), value: fmtDurShort(waitAvg), unit: '', trend: t('cc.callRecord.stats.trendDown'), trendType: 'down' }
  ]
})

const filterSummary = computed(() => {
  const parts: string[] = []
  if (filter.timeRange?.length === 2) parts.push(t('cc.callRecord.filter.timeSelected'))
  if (filter.direction) parts.push(directionOptions.value.find(d => d.value === filter.direction)?.label || '')
  if (filter.result) parts.push(resultOptions.value.find(r => r.value === filter.result)?.label || '')
  if (filter.agentNo) parts.push(t('cc.callRecord.filter.agent') + ' ' + filter.agentNo)
  if (filter.caller) parts.push(t('cc.callRecord.column.caller') + ' ' + filter.caller)
  if (filter.callee) parts.push(t('cc.callRecord.column.callee') + ' ' + filter.callee)
  return parts.length ? '· ' + parts.join(' · ') : '· ' + t('cc.callRecord.filter.empty')
})

const totalPages = computed(() => Math.max(1, Math.ceil(page.total / page.size)))

// ============ 列表加载 ============
async function loadList() {
  loading.value = true
  try {
    const params: any = {
      direction: filter.direction || undefined,
      result: filter.result || undefined,
      agentNo: filter.agentNo || undefined,
      page: page.current,
      pageSize: page.size
    }
    if (filter.timeRange?.length === 2) {
      params.startDate = filter.timeRange[0]
      params.endDate = filter.timeRange[1]
    }
    if (filter.caller) params.keyword = filter.caller
    else if (filter.callee) params.keyword = filter.callee
    const { data } = await getCallRecords(params)
    let list = data.list as CallRecord[]
    if (filter.caller) list = list.filter(r => r.caller.includes(filter.caller))
    if (filter.callee) list = list.filter(r => r.callee.includes(filter.callee))
    recordList.value = list
    page.total = data.total
  } finally {
    loading.value = false
  }
}

async function loadAgents() {
  const { data } = await getAgents()
  agentOpts.value = data.list
}

function handleSearch() {
  page.current = 1
  loadList()
}

function handleReset() {
  filter.timeRange = []
  filter.direction = ''
  filter.result = ''
  filter.agentNo = ''
  filter.caller = ''
  filter.callee = ''
  page.current = 1
  loadList()
}

// ============ 详情抽屉 ============
async function openDetail(row: CallRecord) {
  current.value = row
  drawerVisible.value = true
  resetPlayer()
  resetQc()
  if (row.satisfaction) {
    qc.attitude = row.satisfaction
    qc.overall = row.satisfaction
  }
  const { data } = await getCallEvents(row.callId)
  events.value = data
  await nextTick()
  bindAudio()
}

function handleRowClick(row: CallRecord) {
  openDetail(row)
}

function quickPlay(row: CallRecord) {
  openDetail(row)
  setTimeout(() => {
    if (audioEl.value) {
      audioEl.value.play()
      playing.value = true
    }
  }, 400)
}

function downloadRec(row: CallRecord | null) {
  if (!row?.recordingUrl) {
    ElMessage.warning(t('cc.callRecord.message.noRecording'))
    return
  }
  ElMessage.success(t('cc.callRecord.message.downloadStarted', { id: row.callId }))
}

function exportRecords() {
  ElMessageBox.confirm(t('cc.callRecord.message.exportConfirm', { total: page.total }), t('cc.callRecord.message.exportTitle'), {
    confirmButtonText: t('common.export'),
    cancelButtonText: t('common.cancel')
  }).then(() => ElMessage.success(t('cc.callRecord.message.exportSubmitted'))).catch(() => {})
}

// ============ 录音播放器 ============
const audioEl = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const currentTime = ref(0)
const totalTime = ref(0)
const volume = ref(80)
const rate = ref(1)
const progress = computed(() => (totalTime.value > 0 ? currentTime.value / totalTime.value : 0))

// 模拟波形数据
const waveBars = ref<number[]>([])
function genWave() {
  const N = 64
  const arr: number[] = []
  for (let i = 0; i < N; i++) {
    const base = 30 + Math.sin(i / 3) * 25 + Math.cos(i / 1.7) * 20
    arr.push(Math.max(8, Math.min(95, base + (Math.random() * 20 - 10))))
  }
  waveBars.value = arr
}

function bindAudio() {
  if (!audioEl.value) return
  const el = audioEl.value
  el.volume = volume.value / 100
  el.playbackRate = rate.value
  // mock 总时长 - 因 mock url 无法真实加载, 使用 talkDuration
  totalTime.value = current.value?.talkDuration || 0
  el.addEventListener('timeupdate', onTimeUpdate)
  el.addEventListener('ended', onEnded)
}

function onTimeUpdate() {
  if (audioEl.value && audioEl.value.duration) {
    currentTime.value = audioEl.value.currentTime
    totalTime.value = audioEl.value.duration
  }
}

function onEnded() {
  playing.value = false
  currentTime.value = totalTime.value
}

let mockTimer: ReturnType<typeof setInterval> | null = null
function togglePlay() {
  playing.value = !playing.value
  if (playing.value) {
    if (mockTimer) clearInterval(mockTimer)
    mockTimer = setInterval(() => {
      if (!playing.value || totalTime.value <= 0) return
      currentTime.value += 0.5 * rate.value
      if (currentTime.value >= totalTime.value) {
        currentTime.value = totalTime.value
        playing.value = false
        if (mockTimer) clearInterval(mockTimer)
      }
    }, 500)
  } else {
    if (mockTimer) clearInterval(mockTimer)
  }
}

function seekByTrack(e: MouseEvent) {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
  currentTime.value = ratio * totalTime.value
}

function seekByWave(e: MouseEvent) {
  seekByTrack(e)
}

function resetPlayer() {
  if (mockTimer) clearInterval(mockTimer)
  playing.value = false
  currentTime.value = 0
  totalTime.value = 0
  genWave()
}

watch(volume, v => {
  if (audioEl.value) audioEl.value.volume = v / 100
})
watch(rate, r => {
  if (audioEl.value) audioEl.value.playbackRate = r
})

// ============ 质检评分 ============
const qcDims = computed(() => ([
  { key: 'attitude', label: t('cc.callRecord.qa.dim.attitude'), icon: ChatDotRound },
  { key: 'expertise', label: t('cc.callRecord.qa.dim.professional'), icon: Trophy },
  { key: 'communication', label: t('cc.callRecord.qa.dim.communication'), icon: Phone },
  { key: 'resolution', label: t('cc.callRecord.qa.dim.problemSolving'), icon: Aim },
  { key: 'process', label: t('cc.callRecord.qa.dim.process'), icon: Medal }
] as const))

const qc = reactive<Record<string, any>>({
  attitude: 0,
  expertise: 0,
  communication: 0,
  resolution: 0,
  process: 0,
  overall: 0,
  remark: ''
})

const rateColors = ['#C5A55A', '#D4AF37', '#FFD166']

const qcOverall = computed(() => {
  const keys = qcDims.value.map(d => d.key)
  const sum = keys.reduce((s, k) => s + (qc[k] || 0), 0)
  const avg = sum / keys.length
  return avg.toFixed(2)
})

function resetQc() {
  qc.attitude = 0
  qc.expertise = 0
  qc.communication = 0
  qc.resolution = 0
  qc.process = 0
  qc.overall = 0
  qc.remark = ''
}

function submitQc() {
  const dims = qcDims.value.map(d => d.label + ': ' + (qc[d.key] || 0)).join(' / ')
  ElMessage.success(t('cc.callRecord.qa.submitSuccess') + ' · ' + dims)
}

// ============ 工具方法 ============
function fmtDur(sec: number) {
  if (!sec || sec <= 0) return '00:00'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0')
}

function fmtDurShort(sec: number) {
  return fmtDur(Math.floor(sec))
}

function fmtTime(sec: number) {
  return fmtDur(Math.floor(sec))
}

function dirIcon(d: CallDirection) {
  return d === 'inbound' ? PhoneFilled : d === 'outbound' ? Phone : Connection
}
function dirLabel(d: CallDirection) {
  return d === 'inbound'
    ? t('cc.callRecord.direction.inbound')
    : d === 'outbound'
      ? t('cc.callRecord.direction.outbound')
      : t('cc.callRecord.direction.internal')
}
function resultLabel(r: CallResult) {
  return ({
    answered: t('cc.callRecord.result.answered'),
    'no-answer': t('cc.callRecord.result.no-answer'),
    busy: t('cc.callRecord.result.busy'),
    failed: t('cc.callRecord.result.failed'),
    abandoned: t('cc.callRecord.result.abandoned')
  } as Record<CallResult, string>)[r] || r
}
function resultTagType(r: CallResult): 'success' | 'danger' | 'warning' | 'info' {
  if (r === 'answered') return 'success'
  if (r === 'no-answer' || r === 'abandoned') return 'danger'
  if (r === 'busy') return 'warning'
  return 'info'
}
function hangupLabel(by?: string) {
  return ({
    caller: t('cc.callRecord.hangupBy.caller'),
    callee: t('cc.callRecord.hangupBy.callee'),
    system: t('cc.callRecord.hangupBy.system')
  } as Record<string, string>)[by || ''] || '-'
}
function avatarBg(name: string) {
  const colors = [
    'linear-gradient(135deg,#D4AF37 0%,#8B6F1F 100%)',
    'linear-gradient(135deg,#C5A55A 0%,#7A5A2A 100%)',
    'linear-gradient(135deg,#B8860B 0%,#5C3A1F 100%)',
    'linear-gradient(135deg,#FFD166 0%,#A07F1F 100%)'
  ]
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

// ============ 时钟 ============
let nowTimer: ReturnType<typeof setInterval> | null = null
function tickNow() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  nowText.value = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
}

onMounted(() => {
  loadAgents()
  loadList()
  genWave()
  tickNow()
  nowTimer = setInterval(tickNow, 1000)
})

onBeforeUnmount(() => {
  if (mockTimer) clearInterval(mockTimer)
  if (nowTimer) clearInterval(nowTimer)
  if (audioEl.value) {
    audioEl.value.removeEventListener('timeupdate', onTimeUpdate)
    audioEl.value.removeEventListener('ended', onEnded)
  }
})
</script>

<style scoped>
.cc-record-page {
  padding: 22px 24px;
  min-height: calc(100vh - 80px);
  background: var(--bg-page, #0A0A12);
  color: var(--text-primary, #F0E6D3);
}

/* ============== 页头 ============== */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 18px;
  margin-bottom: 22px;
  border-bottom: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  position: relative;
}
.page-header::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 84px; height: 2px;
  background: linear-gradient(90deg, #D4AF37 0%, transparent 100%);
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--gold-primary, #D4AF37);
  font-weight: 600;
  margin-bottom: 8px;
}
.title {
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 4px;
  color: var(--text-primary, #F0E6D3);
  margin: 0 0 6px;
  background: linear-gradient(135deg, #F0E6D3 0%, #D4AF37 60%, #C5A55A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.subtitle {
  font-size: 13px;
  color: var(--text-body, #A09B8C);
  letter-spacing: 2px;
  margin: 0;
}
.header-aside {
  display: flex;
  align-items: center;
  gap: 14px;
}
.now-time {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  font-size: 22px;
  font-weight: 500;
  color: var(--text-primary, #F0E6D3);
  letter-spacing: 3px;
}
.now-tag {
  font-size: 11px;
  letter-spacing: 2px;
  padding: 3px 10px;
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.3));
  color: var(--gold-primary, #D4AF37);
  border-radius: 10px;
}
.now-tag::before {
  content: '';
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--gold-primary, #D4AF37);
  margin-right: 5px;
  animation: pulse 1.6s infinite;
}

/* ============== 统计卡片 ============== */
.stats-row { margin-bottom: 18px; }
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 20px 22px;
  background:
    radial-gradient(circle at 100% 0, rgba(212, 175, 55, 0.08), transparent 60%),
    linear-gradient(135deg, rgba(26, 26, 36, 0.95) 0%, rgba(18, 18, 26, 0.95) 100%);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
  overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0;
  width: 3px;
  background: var(--gold-primary, #D4AF37);
  box-shadow: 0 0 16px var(--gold-primary, #D4AF37);
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: rgba(212, 175, 55, 0.45);
  box-shadow: 0 8px 32px rgba(212, 175, 55, 0.18);
}
.stat-icon {
  width: 52px; height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-right: 16px;
  flex-shrink: 0;
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-primary, #D4AF37);
  border: 1px solid rgba(212, 175, 55, 0.2);
}
.stat-total .stat-icon  { background: rgba(212, 175, 55, 0.12);  color: #D4AF37; }
.stat-answer .stat-icon { background: rgba(6, 214, 160, 0.12);  color: #06D6A0; }
.stat-talk .stat-icon   { background: rgba(91, 141, 239, 0.14); color: #5B8DEF; }
.stat-wait .stat-icon   { background: rgba(255, 209, 102, 0.14); color: #FFD166; }
.stat-body { flex: 1; min-width: 0; }
.stat-label {
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--text-body, #A09B8C);
  margin-bottom: 6px;
}
.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.stat-value .num {
  font-size: 28px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #D4AF37 0%, #C5A55A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.stat-value .unit {
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
  margin-left: 4px;
}
.stat-trend {
  margin-top: 6px;
  font-size: 11px;
  letter-spacing: 1px;
  color: var(--text-muted, #5E5A52);
}
.stat-trend.up   { color: #06D6A0; }
.stat-trend.down { color: #FF5470; }
.stat-pulse {
  position: absolute;
  right: 16px; top: 16px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--gold-primary, #D4AF37);
  box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.6);
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.55); }
  70%  { box-shadow: 0 0 0 12px rgba(212, 175, 55, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
}

/* ============== 筛选 ============== */
.filter-card {
  background: var(--bg-card, #12121A);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
}
.filter-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  cursor: pointer;
  user-select: none;
  transition: background .2s;
}
.filter-head:hover { background: rgba(212, 175, 55, 0.04); }
.filter-head-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.head-ico { color: var(--gold-primary, #D4AF37); }
.filter-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary, #F0E6D3);
  letter-spacing: 2px;
}
.filter-summary {
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
  letter-spacing: 1px;
}
.filter-head-right {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-body, #A09B8C);
  font-size: 12px;
}
.filter-toggle { transition: transform .3s ease; color: var(--gold-primary, #D4AF37); }
.filter-toggle.rotated { transform: rotate(180deg); }
.filter-body {
  padding: 12px 20px 6px;
  border-top: 1px dashed rgba(212, 175, 55, 0.15);
}
.filter-form { display: flex; flex-wrap: wrap; gap: 4px 16px; }
.slide-fade-enter-active, .slide-fade-leave-active { transition: all .28s ease; }
.slide-fade-enter-from, .slide-fade-leave-to { opacity: 0; transform: translateY(-8px); }

/* ============== 表格 ============== */
.table-card {
  background: var(--bg-card, #12121A);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 18px;
}
.table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.table-head-left { display: flex; align-items: baseline; gap: 12px; }
.table-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--gold-primary, #D4AF37);
  letter-spacing: 2px;
}
.table-sub { font-size: 12px; color: var(--text-muted, #5E5A52); }

.record-table { background: transparent !important; }
:deep(.record-table th.el-table__cell) {
  background: var(--bg-elevated, #1A1A24) !important;
  color: var(--gold-primary, #D4AF37) !important;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2)) !important;
}
:deep(.record-table tr) { background: transparent !important; cursor: pointer; }
:deep(.record-table .el-table__row:hover td) { background: rgba(212, 175, 55, 0.05) !important; }
:deep(.record-table td.el-table__cell) {
  border-bottom: 1px solid rgba(212, 175, 55, 0.08) !important;
}

.call-id, .phone, .time, .duration {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  letter-spacing: 1px;
}
.call-id { color: var(--gold-primary, #D4AF37); font-weight: 600; }
.phone { color: var(--text-primary, #F0E6D3); }
.time { color: var(--text-body, #A09B8C); font-size: 13px; }
.duration { color: var(--text-primary, #F0E6D3); font-weight: 500; }
.duration.wait { color: #FFD166; }
.duration.emph {
  font-size: 18px;
  background: linear-gradient(135deg, #D4AF37, #C5A55A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dir-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px; height: 26px;
  border-radius: 8px;
  border: 1px solid currentColor;
}
.dir-icon.sm { width: 20px; height: 20px; border-radius: 6px; }
.dir-inbound  { color: #06D6A0; background: rgba(6, 214, 160, 0.08); }
.dir-outbound { color: #5B8DEF; background: rgba(91, 141, 239, 0.08); }
.dir-internal { color: #FFD166; background: rgba(255, 209, 102, 0.08); }

.agent-cell { display: flex; align-items: center; gap: 8px; }
.avatar {
  width: 30px; height: 30px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px; font-weight: 600;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.agent-name { color: var(--text-primary, #F0E6D3); font-size: 13px; }
.muted { color: var(--text-muted, #5E5A52); font-size: 12px; }

.result-tag {
  letter-spacing: 1px;
  padding: 0 12px;
  font-weight: 500;
}
.result-tag.big { padding: 4px 16px; font-size: 13px; }

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 14px 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

/* ============== 抽屉 ============== */
:deep(.record-drawer .el-drawer) {
  background: linear-gradient(180deg, #0F0F18 0%, #12121A 100%) !important;
  border-left: 1px solid var(--border-gold, rgba(212, 175, 55, 0.3));
}
:deep(.record-drawer .el-drawer__body) { padding: 0; }
.drawer-content {
  padding: 24px 28px 32px;
  height: 100%;
  overflow-y: auto;
}
.drawer-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);
  margin-bottom: 20px;
  position: relative;
}
.drawer-head::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0;
  width: 60px; height: 2px;
  background: linear-gradient(90deg, #D4AF37, transparent);
}
.drawer-eyebrow {
  font-size: 10px;
  letter-spacing: 4px;
  color: var(--gold-primary, #D4AF37);
  margin-bottom: 6px;
}
.drawer-id {
  font-family: 'DIN Alternate', monospace;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-primary, #F0E6D3);
  letter-spacing: 2px;
  margin-bottom: 8px;
}
.drawer-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
}

.info-section { margin-bottom: 26px; }
.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 2px;
  color: var(--text-primary, #F0E6D3);
  margin-bottom: 14px;
}
.section-title .bar {
  width: 3px; height: 14px;
  background: var(--gold-primary, #D4AF37);
  box-shadow: 0 0 8px var(--gold-primary, #D4AF37);
  border-radius: 2px;
}
.section-sub {
  margin-left: auto;
  font-size: 11px;
  font-weight: 400;
  color: var(--text-muted, #5E5A52);
  letter-spacing: 1px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 10px;
  overflow: hidden;
}
.info-item {
  background: var(--bg-card, #12121A);
  padding: 12px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.info-label {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted, #5E5A52);
}
.info-value {
  font-size: 13px;
  color: var(--text-primary, #F0E6D3);
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: right;
}

/* ============== 录音播放器 ============== */
.audio-stage {
  background:
    radial-gradient(ellipse at top, rgba(212, 175, 55, 0.06), transparent 70%),
    var(--bg-elevated, #1A1A24);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 14px;
  padding: 20px 22px;
  position: relative;
  overflow: hidden;
}
.audio-stage::before {
  content: 'WAVE / 24bit · 44.1k';
  position: absolute;
  top: 12px; right: 16px;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(212, 175, 55, 0.3);
  font-family: 'DIN Alternate', monospace;
}
.waveform {
  display: flex;
  align-items: center;
  gap: 3px;
  height: 90px;
  padding: 0 4px;
  margin-bottom: 18px;
  position: relative;
  cursor: pointer;
}
.wave-bar {
  flex: 1;
  min-width: 3px;
  background: rgba(212, 175, 55, 0.18);
  border-radius: 2px;
  transition: background .2s, transform .2s;
}
.wave-bar.active {
  background: linear-gradient(180deg, #FFD166 0%, #D4AF37 50%, #8B6F1F 100%);
  box-shadow: 0 0 6px rgba(212, 175, 55, 0.45);
}
.wave-bar.beating.active {
  animation: beat 1.4s ease-in-out infinite;
}
@keyframes beat {
  0%, 100% { transform: scaleY(1); }
  50%      { transform: scaleY(1.25); }
}
.wave-cursor {
  position: absolute;
  top: 0; bottom: 0;
  width: 2px;
  background: #FFD166;
  box-shadow: 0 0 10px #FFD166;
  pointer-events: none;
  transition: left .2s linear;
}

.audio-controls {
  display: flex;
  align-items: center;
  gap: 14px;
}
.play-btn {
  width: 46px; height: 46px;
  border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.5);
  background: radial-gradient(circle, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  color: var(--gold-primary, #D4AF37);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: transform .2s, box-shadow .2s;
}
.play-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.5);
}
.play-btn.playing {
  background: radial-gradient(circle, #D4AF37, #8B6F1F);
  color: #0A0A12;
  border-color: #FFD166;
}

.time-display {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  font-size: 13px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-width: 90px;
}
.time-cur { color: var(--gold-primary, #D4AF37); }
.time-sep { color: var(--text-muted, #5E5A52); }
.time-total { color: var(--text-body, #A09B8C); }

.progress-track {
  flex: 1;
  height: 6px;
  background: rgba(212, 175, 55, 0.12);
  border-radius: 3px;
  position: relative;
  cursor: pointer;
}
.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #8B6F1F, #D4AF37, #FFD166);
  border-radius: 3px;
  transition: width .2s linear;
}
.progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px; height: 14px;
  border-radius: 50%;
  background: #FFD166;
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.7);
  transform: translate(-50%, -50%);
}

.audio-extra { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.icon-btn {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  background: transparent;
  color: var(--text-body, #A09B8C);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all .2s;
}
.icon-btn:hover {
  color: var(--gold-primary, #D4AF37);
  border-color: var(--gold-primary, #D4AF37);
}
.rate-select { width: 84px; }
.vol-popover { display: flex; align-items: center; gap: 8px; }
.vol-num {
  font-family: 'DIN Alternate', monospace;
  color: var(--gold-primary, #D4AF37);
  font-size: 12px;
  width: 24px;
}
.no-record {
  background: var(--bg-elevated, #1A1A24);
  border: 1px dashed rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  padding: 28px;
  text-align: center;
  color: var(--text-muted, #5E5A52);
}
.no-record-text {
  margin-top: 10px;
  font-size: 13px;
  letter-spacing: 1px;
}

/* ============== 时间轴 ============== */
.event-timeline {
  padding: 10px 0 0 8px;
}
:deep(.event-timeline .el-timeline-item__node) {
  background: var(--gold-primary, #D4AF37) !important;
  border-color: var(--gold-primary, #D4AF37) !important;
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
:deep(.event-timeline .el-timeline-item__node--success) { background: #06D6A0 !important; border-color: #06D6A0 !important; }
:deep(.event-timeline .el-timeline-item__node--warning) { background: #FFD166 !important; border-color: #FFD166 !important; }
:deep(.event-timeline .el-timeline-item__node--danger)  { background: #FF5470 !important; border-color: #FF5470 !important; }
:deep(.event-timeline .el-timeline-item__tail) { border-left-color: rgba(212, 175, 55, 0.25) !important; }
:deep(.event-timeline .el-timeline-item__timestamp) {
  color: var(--text-muted, #5E5A52) !important;
  font-family: 'DIN Alternate', monospace;
  letter-spacing: 1px;
  font-size: 12px;
}
.event-card {
  background: var(--bg-elevated, #1A1A24);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 8px;
  padding: 10px 14px;
  margin-top: 4px;
  transition: border-color .2s, transform .2s;
}
.event-card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  transform: translateX(4px);
}
.event-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary, #F0E6D3);
  letter-spacing: 1px;
}
.event-detail {
  margin-top: 4px;
  font-size: 12px;
  color: var(--text-body, #A09B8C);
}

/* ============== 质检评分 ============== */
.rate-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 22px;
  background: var(--bg-elevated, #1A1A24);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 16px 18px;
  margin-bottom: 14px;
}
.rate-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}
.rate-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-body, #A09B8C);
  letter-spacing: 1px;
  flex-shrink: 0;
}
.rate-label .el-icon { color: var(--gold-primary, #D4AF37); }
:deep(.qc-rate .el-rate__text) {
  color: var(--gold-primary, #D4AF37) !important;
  font-family: 'DIN Alternate', monospace;
  font-size: 12px;
}

.rate-summary {
  display: flex;
  align-items: stretch;
  gap: 14px;
  margin-bottom: 14px;
}
.rate-overall {
  flex-shrink: 0;
  width: 150px;
  background:
    radial-gradient(circle at 50% 0, rgba(212, 175, 55, 0.15), transparent 70%),
    var(--bg-elevated, #1A1A24);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.rate-overall-label {
  font-size: 11px;
  letter-spacing: 3px;
  color: var(--text-muted, #5E5A52);
  margin-bottom: 6px;
}
.rate-overall-num {
  font-size: 36px;
  font-weight: 700;
  font-family: 'DIN Alternate', sans-serif;
  background: linear-gradient(135deg, #FFD166 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.rate-overall-unit {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted, #5E5A52);
  letter-spacing: 1px;
}
.qc-remark { flex: 1; }
:deep(.qc-remark .el-textarea__inner) {
  background: var(--bg-elevated, #1A1A24) !important;
  border-color: rgba(212, 175, 55, 0.2) !important;
  color: var(--text-primary, #F0E6D3) !important;
  font-family: inherit;
}
:deep(.qc-remark .el-textarea__inner:focus) {
  border-color: var(--gold-primary, #D4AF37) !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.3) !important;
}

.rate-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ============== 表单/弹层覆盖 ============== */
:deep(.el-form-item__label) {
  color: var(--text-body, #A09B8C);
  letter-spacing: 1px;
  font-size: 12px;
}
:deep(.el-pagination.is-background .el-pager li) {
  background: var(--bg-elevated, #1A1A24);
  color: var(--text-body, #A09B8C);
  border: 1px solid rgba(212, 175, 55, 0.15);
}
:deep(.el-pagination.is-background .el-pager li.is-active) {
  background: var(--gold-primary, #D4AF37);
  color: #0A0A12;
  border-color: var(--gold-primary, #D4AF37);
}

/* 响应式 */
@media (max-width: 992px) {
  .stat-card { padding: 16px; }
  .stat-value .num { font-size: 24px; }
  .info-grid { grid-template-columns: 1fr; }
  .rate-grid { grid-template-columns: 1fr; }
  .rate-summary { flex-direction: column; }
  .rate-overall { width: 100%; }
}
</style>

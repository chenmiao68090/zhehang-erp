<template>
  <section class="recording-panel" v-loading="loading">
    <div class="recording-filters">
      <div class="filter-date">
        <span class="filter-label">通话日期</span>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
          :editable="false"
          :disabled-date="disableFutureDate"
          unlink-panels
          @change="handleCustomDate"
        />
      </div>
      <el-segmented v-model="datePreset" :options="datePresets" @change="applyDatePreset" />
      <el-select
        v-if="options.canSelectDepartment"
        v-model="filters.deptId"
        clearable
        placeholder="全部部门"
        class="filter-select"
        @change="handleDeptChange"
      >
        <el-option v-for="dept in options.departments" :key="dept.id" :label="dept.name" :value="dept.id" />
      </el-select>
      <el-select
        v-if="options.canSelectUser"
        v-model="filters.userId"
        clearable
        filterable
        placeholder="全部人员"
        class="filter-select"
      >
        <el-option
          v-for="user in filteredUsers"
          :key="user.id"
          :label="`${user.name} · ${user.deptName}`"
          :value="user.id"
        />
      </el-select>
      <el-select v-model="filters.connected" clearable placeholder="接通状态" class="filter-select is-short">
        <el-option label="已接通" :value="1" />
        <el-option label="未接通" :value="0" />
      </el-select>
      <el-select v-model="filters.result" clearable placeholder="通话结果" class="filter-select is-short">
        <el-option v-for="item in resultOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="filters.hasRecording" clearable placeholder="录音状态" class="filter-select is-short">
        <el-option label="有录音" :value="true" />
        <el-option label="无录音" :value="false" />
      </el-select>
      <el-input
        v-model="filters.keyword"
        clearable
        class="keyword-input"
        placeholder="客户名称或手机号"
        :prefix-icon="Search"
        @keyup.enter="query"
      />
      <el-button type="primary" :icon="Search" @click="query">查询</el-button>
      <el-button :icon="RefreshLeft" @click="resetFilters">重置</el-button>
    </div>

    <el-alert
      v-if="loadError"
      title="录音列表加载失败"
      type="error"
      show-icon
      :closable="false"
      class="recording-error"
    >
      <template #default><el-button link type="primary" @click="loadRows">重新加载</el-button></template>
    </el-alert>

    <div class="recording-workspace">
      <aside class="people-pane">
        <div class="pane-title">
          <strong>{{ scopeTitle }}</strong>
          <span>{{ options.users.length }} 人</span>
        </div>
        <button
          v-if="options.scopeMode !== 'self'"
          type="button"
          class="person-item is-all"
          :class="{ 'is-active': !filters.userId && !filters.deptId }"
          @click="selectAllPeople"
        >
          <span class="person-avatar"><el-icon><UserFilled /></el-icon></span>
          <span><b>{{ options.scopeMode === 'company' ? '全公司' : '本部门及下级' }}</b><small>全部可见录音</small></span>
        </button>
        <div v-for="group in groupedUsers" :key="group.deptId || 0" class="dept-group">
          <button
            v-if="options.canSelectDepartment"
            type="button"
            class="dept-heading"
            :class="{ 'is-active': filters.deptId === group.deptId && !filters.userId }"
            @click="selectDepartment(group.deptId)"
          >
            <span>{{ group.deptName }}</span><em>{{ group.users.length }}</em>
          </button>
          <div v-else class="dept-heading is-static"><span>{{ group.deptName }}</span><em>{{ group.users.length }}</em></div>
          <button
            v-for="person in group.users"
            :key="person.id"
            type="button"
            class="person-item"
            :class="{ 'is-active': filters.userId === person.id }"
            @click="selectPerson(person.id)"
          >
            <span class="person-avatar">{{ firstCharacter(person.name) }}</span>
            <span><b>{{ person.name }}<i v-if="person.currentUser">我</i></b><small>{{ person.deptName }}</small></span>
          </button>
        </div>
      </aside>

      <main class="recording-list-pane">
        <div class="list-head">
          <div><strong>通话录音</strong><span>共 {{ total }} 条</span></div>
          <span class="privacy-note"><el-icon><Lock /></el-icon> 原始录音地址受保护</span>
        </div>
        <el-table
          :data="rows"
          class="recording-table"
          height="570"
          highlight-current-row
          :row-class-name="rowClassName"
          empty-text="当前筛选范围暂无通话记录"
          @row-click="selectRow"
        >
          <el-table-column prop="callTime" label="通话时间" width="154" />
          <el-table-column label="客户" min-width="190">
            <template #default="{ row }">
              <div class="customer-cell">
                <el-tooltip :content="row.customerName" :disabled="row.customerName.length < 13">
                  <strong>{{ row.customerName }}</strong>
                </el-tooltip>
                <span>{{ row.contactName }} · {{ row.maskedPhone }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="销售" min-width="110">
            <template #default="{ row }">
              <div class="agent-cell"><b>{{ row.agentName }}</b><span>{{ row.deptName }}</span></div>
            </template>
          </el-table-column>
          <el-table-column label="结果" width="108">
            <template #default="{ row }">
              <el-tag :type="row.connected === 1 ? 'success' : 'info'" effect="light">{{ displayResult(row) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="durationText" label="时长" width="84" align="right" />
          <el-table-column label="录音" width="86" align="center" fixed="right">
            <template #default="{ row }">
              <el-tooltip v-if="row.recordingStatus === 'available'" content="播放录音" placement="top">
                <el-button
                  circle
                  :type="selected?.id === row.id && playing ? 'primary' : 'default'"
                  :icon="selected?.id === row.id && playing ? VideoPause : VideoPlay"
                  @click.stop="playRow(row)"
                />
              </el-tooltip>
              <span v-else class="no-record">暂无</span>
            </template>
          </el-table-column>
        </el-table>
        <div class="recording-pagination">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[20, 50, 100]"
            :total="total"
            @current-change="loadRows"
            @size-change="handlePageSize"
          />
        </div>
      </main>

      <aside class="player-pane">
        <template v-if="selected">
          <div class="player-head">
            <span class="player-status" :class="{ 'is-ready': selected.recordingStatus === 'available' }">
              {{ selected.recordingStatus === 'available' ? '可播放' : '暂无录音' }}
            </span>
            <span>{{ selected.callTime }}</span>
          </div>
          <h3 :title="selected.customerName">{{ selected.customerName }}</h3>
          <p class="contact-line">{{ selected.contactName }} · {{ selected.maskedPhone }}</p>

          <div class="detail-grid">
            <div><span>销售</span><b>{{ selected.agentName }}</b></div>
            <div><span>部门</span><b>{{ selected.deptName }}</b></div>
            <div><span>通话结果</span><b>{{ displayResult(selected) }}</b></div>
            <div><span>通话时长</span><b>{{ selected.durationText }}</b></div>
          </div>

          <div v-if="selected.recordingStatus === 'available'" class="audio-console">
            <audio
              ref="audioRef"
              preload="metadata"
              :src="audioSrc"
              @loadedmetadata="handleMetadata"
              @timeupdate="handleTimeUpdate"
              @ended="handleEnded"
              @error="handleAudioError"
            />
            <div class="audio-time"><span>{{ formatClock(currentTime) }}</span><span>{{ formatClock(audioDuration) }}</span></div>
            <el-slider v-model="currentTime" :max="Math.max(audioDuration, 1)" :show-tooltip="false" @change="seekTo" />
            <div class="audio-actions">
              <el-tooltip content="后退10秒"><el-button circle :icon="DArrowLeft" @click="jump(-10)" /></el-tooltip>
              <el-button class="play-main" type="primary" circle :loading="ticketLoading" :icon="playing ? VideoPause : VideoPlay" @click="togglePlay" />
              <el-tooltip content="前进10秒"><el-button circle :icon="DArrowRight" @click="jump(10)" /></el-tooltip>
              <el-button class="speed-btn" @click="changeSpeed">{{ playbackRate }}x</el-button>
            </div>
            <div class="volume-row">
              <el-icon><MuteNotification v-if="volume === 0" /><Microphone v-else /></el-icon>
              <el-slider v-model="volume" :max="1" :step="0.05" :show-tooltip="false" @input="applyVolume" />
            </div>
            <p v-if="playerError" class="player-error">{{ playerError }} <el-button link type="primary" @click="retryPlayback">重新加载</el-button></p>
          </div>
          <el-empty v-else :image-size="78" description="平台暂未生成录音" />

          <div class="summary-block">
            <div><strong>通话小结</strong><el-tag v-if="selected.effective" type="success" size="small">有效沟通</el-tag></div>
            <p>{{ selected.remark || '—' }}</p>
          </div>
        </template>
        <el-empty v-else :image-size="92" description="选择一条通话查看录音和小结" />
      </aside>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import {
  DArrowLeft,
  DArrowRight,
  Lock,
  Microphone,
  MuteNotification,
  RefreshLeft,
  Search,
  UserFilled,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import {
  callRecordingStreamUrl,
  callRecordApi,
  type CallRecordingOptions,
  type CallRecordingRow,
  type CallRecordingUserOption
} from '@/api/call-record'

type DateRange = [string, string]
const emptyOptions = (): CallRecordingOptions => ({
  scopeMode: 'self', canSelectUser: false, canSelectDepartment: false,
  currentUserId: 0, users: [], departments: []
})

const toIsoDate = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const today = () => toIsoDate(new Date())
const rangeFor = (preset: string): DateRange => {
  const end = new Date()
  const start = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  if (preset === 'yesterday') {
    start.setDate(start.getDate() - 1)
    end.setDate(end.getDate() - 1)
  } else if (preset === 'week') {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  } else if (preset === 'month') {
    start.setDate(1)
  }
  return [toIsoDate(start), toIsoDate(end)]
}

const datePresets = [
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '本周', value: 'week' },
  { label: '本月', value: 'month' }
]
const resultOptions = ['接通', '无人接听', '占线/关机', '号码无效', '明确拒绝']
const datePreset = ref('today')
const options = ref<CallRecordingOptions>(emptyOptions())
const filters = reactive({
  dateRange: [today(), today()] as DateRange,
  userId: undefined as number | undefined,
  deptId: undefined as number | undefined,
  connected: undefined as number | undefined,
  result: '',
  hasRecording: undefined as boolean | undefined,
  keyword: ''
})
const rows = ref<CallRecordingRow[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const loading = ref(false)
const loadError = ref(false)
const selected = ref<CallRecordingRow>()
const audioRef = ref<HTMLAudioElement>()
const audioSrc = ref('')
const playing = ref(false)
const ticketLoading = ref(false)
const playerError = ref('')
const retriedTicket = ref(false)
const currentTime = ref(0)
const audioDuration = ref(0)
const volume = ref(0.8)
const playbackRate = ref(1)

const scopeTitle = computed(() => ({ self: '我的录音', department: '本部门人员', company: '公司人员' }[options.value.scopeMode]))
const filteredUsers = computed(() => filters.deptId
  ? options.value.users.filter(user => user.deptId === filters.deptId)
  : options.value.users)
const groupedUsers = computed(() => {
  const groups = new Map<number, { deptId?: number; deptName: string; users: CallRecordingUserOption[] }>()
  options.value.users.forEach(user => {
    const key = user.deptId || 0
    if (!groups.has(key)) groups.set(key, { deptId: user.deptId, deptName: user.deptName, users: [] })
    groups.get(key)!.users.push(user)
  })
  return [...groups.values()]
})

const unwrap = <T>(response: any): T => (response?.data ?? response) as T

async function loadOptions() {
  options.value = unwrap<CallRecordingOptions>(await callRecordApi.recordingOptions()) || emptyOptions()
  if (options.value.scopeMode === 'self') filters.userId = options.value.currentUserId
}

async function loadRows() {
  loading.value = true
  loadError.value = false
  try {
    const data = unwrap<any>(await callRecordApi.recordings({
      startDate: filters.dateRange[0], endDate: filters.dateRange[1],
      userId: filters.userId, deptId: filters.deptId,
      connected: filters.connected, result: filters.result || undefined,
      hasRecording: filters.hasRecording, keyword: filters.keyword.trim() || undefined,
      pageNum: pageNum.value, pageSize: pageSize.value
    }))
    rows.value = data?.records || data?.list || []
    total.value = Number(data?.total || 0)
    if (selected.value && !rows.value.some(row => row.id === selected.value?.id)) stopAndClearSelection()
  } catch {
    rows.value = []
    total.value = 0
    loadError.value = true
  } finally {
    loading.value = false
  }
}

async function query() {
  pageNum.value = 1
  stopAndClearSelection()
  await loadRows()
}

function applyDatePreset(value: any) {
  filters.dateRange = rangeFor(String(value))
  query()
}

function handleCustomDate(value: any) {
  if (!Array.isArray(value) || value.length !== 2) return
  datePreset.value = 'custom'
  query()
}

function disableFutureDate(date: Date) {
  return date.getTime() > new Date().setHours(23, 59, 59, 999)
}

function handleDeptChange() {
  if (filters.userId && !filteredUsers.value.some(user => user.id === filters.userId)) filters.userId = undefined
}

function selectAllPeople() {
  filters.userId = undefined
  filters.deptId = undefined
  query()
}

function selectDepartment(deptId?: number) {
  filters.deptId = deptId
  filters.userId = undefined
  query()
}

function selectPerson(userId: number) {
  filters.userId = userId
  filters.deptId = undefined
  query()
}

function resetFilters() {
  datePreset.value = 'today'
  filters.dateRange = rangeFor('today')
  filters.deptId = undefined
  filters.userId = options.value.scopeMode === 'self' ? options.value.currentUserId : undefined
  filters.connected = undefined
  filters.result = ''
  filters.hasRecording = undefined
  filters.keyword = ''
  query()
}

function handlePageSize() {
  pageNum.value = 1
  loadRows()
}

function selectRow(row: CallRecordingRow) {
  if (selected.value?.id !== row.id) {
    stopAudio()
    selected.value = row
    playerError.value = ''
    audioSrc.value = ''
    currentTime.value = 0
    audioDuration.value = row.duration || 0
    retriedTicket.value = false
  }
}

async function playRow(row: CallRecordingRow) {
  if (selected.value?.id !== row.id) selectRow(row)
  await nextTick()
  togglePlay()
}

async function requestTicket(autoPlay = true) {
  if (!selected.value || selected.value.recordingStatus !== 'available') return
  ticketLoading.value = true
  playerError.value = ''
  try {
    const ticket = unwrap<any>(await callRecordApi.recordingTicket(selected.value.id))
    audioSrc.value = callRecordingStreamUrl(selected.value.id, ticket.token)
    await nextTick()
    audioRef.value?.load()
    if (autoPlay) {
      await audioRef.value?.play()
      playing.value = true
    }
  } catch {
    playerError.value = '录音服务暂时不可用'
    playing.value = false
  } finally {
    ticketLoading.value = false
  }
}

async function togglePlay() {
  if (!selected.value || selected.value.recordingStatus !== 'available') return
  const audio = audioRef.value
  if (playing.value) {
    audio?.pause()
    playing.value = false
    return
  }
  if (!audioSrc.value) {
    await requestTicket(true)
    return
  }
  try {
    await audio?.play()
    playing.value = true
  } catch {
    playerError.value = '录音播放失败，请重新加载'
  }
}

function handleMetadata() {
  if (audioRef.value && Number.isFinite(audioRef.value.duration)) audioDuration.value = audioRef.value.duration
  applyVolume()
  if (audioRef.value) audioRef.value.playbackRate = playbackRate.value
}

function handleTimeUpdate() {
  if (audioRef.value) currentTime.value = audioRef.value.currentTime
}

function handleEnded() {
  playing.value = false
  currentTime.value = 0
}

async function handleAudioError() {
  if (!audioSrc.value) return
  playing.value = false
  if (!retriedTicket.value) {
    retriedTicket.value = true
    await requestTicket(true)
    return
  }
  playerError.value = '录音服务暂时不可用，请重新加载'
}

function retryPlayback() {
  retriedTicket.value = false
  audioSrc.value = ''
  requestTicket(true)
}

function seekTo(value: number | number[]) {
  if (audioRef.value && typeof value === 'number') audioRef.value.currentTime = value
}

function jump(seconds: number) {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(0, Math.min(audioDuration.value || 0, audioRef.value.currentTime + seconds))
}

function changeSpeed() {
  const rates = [1, 1.25, 1.5]
  const index = rates.indexOf(playbackRate.value)
  playbackRate.value = rates[(index + 1) % rates.length]
  if (audioRef.value) audioRef.value.playbackRate = playbackRate.value
}

function applyVolume() {
  if (audioRef.value) audioRef.value.volume = volume.value
}

function stopAudio() {
  audioRef.value?.pause()
  playing.value = false
}

function stopAndClearSelection() {
  stopAudio()
  selected.value = undefined
  audioSrc.value = ''
}

function rowClassName({ row }: { row: CallRecordingRow }) {
  return selected.value?.id === row.id ? 'is-selected-recording' : ''
}

function displayResult(row: CallRecordingRow) {
  return row.result || (row.connected === 1 ? '已接通' : '未接通')
}

function firstCharacter(value: string) {
  return String(value || '?').trim().charAt(0) || '?'
}

function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(Number(seconds) || 0))
  const minutes = Math.floor(safe / 60)
  return `${String(minutes).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

onMounted(async () => {
  try {
    await loadOptions()
    await loadRows()
  } catch {
    loadError.value = true
    ElMessage.error('通话录音工作台加载失败')
  }
})

onBeforeUnmount(stopAudio)
</script>

<style scoped>
.recording-panel { min-height: 650px; }
.recording-filters { display: flex; align-items: flex-end; gap: 10px; flex-wrap: wrap; padding: 16px; margin-bottom: 14px; background: #fff; border: 1px solid #e4e8ef; border-radius: 6px; }
.filter-date { display: flex; flex-direction: column; gap: 6px; }
.filter-label { color: #52606f; font-size: 13px; font-weight: 600; }
.filter-date :deep(.el-date-editor) { width: 250px; }
.filter-select { width: 174px; }
.filter-select.is-short { width: 132px; }
.keyword-input { width: 210px; }
.recording-error { margin-bottom: 14px; }
.recording-workspace { display: grid; grid-template-columns: 220px minmax(540px, 1fr) 340px; min-height: 650px; background: #fff; border: 1px solid #e1e6ed; border-radius: 6px; overflow: hidden; }
.people-pane, .player-pane { background: #fbfcfe; }
.people-pane { border-right: 1px solid #e5e9f0; padding: 16px 12px; overflow-y: auto; max-height: 650px; }
.pane-title, .list-head, .player-head { display: flex; align-items: center; justify-content: space-between; }
.pane-title { padding: 0 6px 12px; }
.pane-title strong, .list-head strong { color: #1f2937; font-size: 17px; }
.pane-title span, .list-head span { color: #7b8794; font-size: 13px; }
.dept-group { margin-top: 10px; }
.dept-heading, .person-item { width: 100%; border: 0; background: transparent; cursor: pointer; text-align: left; }
.dept-heading { display: flex; justify-content: space-between; padding: 8px 10px; color: #596675; font-size: 13px; font-weight: 600; }
.dept-heading em { font-style: normal; color: #98a2b3; }
.dept-heading.is-active { color: #175cd3; background: #eaf2ff; border-radius: 5px; }
.dept-heading.is-static { cursor: default; }
.person-item { display: flex; align-items: center; gap: 10px; min-height: 54px; padding: 8px 10px; border-radius: 5px; color: #344054; }
.person-item:hover { background: #f0f4f8; }
.person-item.is-active { color: #175cd3; background: #e8f1ff; box-shadow: inset 3px 0 #3370ff; }
.person-item > span:last-child { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.person-item b { font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.person-item b i { margin-left: 5px; color: #3370ff; font-size: 12px; font-style: normal; }
.person-item small { color: #8a94a3; font-size: 12px; }
.person-avatar { display: inline-flex; align-items: center; justify-content: center; flex: 0 0 34px; height: 34px; border-radius: 50%; background: #e8f1ff; color: #2463c7; font-weight: 700; }
.person-item.is-all { border: 1px solid #e5e9f0; margin-bottom: 8px; }
.recording-list-pane { min-width: 0; padding: 16px; }
.list-head { height: 38px; margin-bottom: 10px; }
.list-head > div { display: flex; align-items: baseline; gap: 10px; }
.privacy-note { display: inline-flex; align-items: center; gap: 5px; }
.recording-table { border: 1px solid #e7ebf0; border-radius: 5px; }
.recording-table :deep(th.el-table__cell) { height: 44px; background: #f7f9fc; color: #465160; font-size: 14px; font-weight: 600; }
.recording-table :deep(td.el-table__cell) { height: 62px; color: #344054; font-size: 14px; }
.recording-table :deep(.is-selected-recording td.el-table__cell) { background: #eef5ff !important; }
.customer-cell, .agent-cell { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
.customer-cell strong { overflow: hidden; color: #1d2939; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.customer-cell span, .agent-cell span { color: #7b8794; font-size: 13px; }
.agent-cell b { font-size: 14px; }
.no-record { color: #98a2b3; font-size: 13px; }
.recording-pagination { display: flex; justify-content: flex-end; padding-top: 14px; }
.player-pane { border-left: 1px solid #e5e9f0; padding: 18px; overflow-y: auto; max-height: 650px; }
.player-head { color: #7b8794; font-size: 12px; }
.player-status { padding: 4px 8px; border-radius: 4px; background: #f2f4f7; color: #667085; }
.player-status.is-ready { background: #e8f7ef; color: #16845b; }
.player-pane h3 { margin: 18px 0 6px; overflow: hidden; color: #172033; font-size: 19px; text-overflow: ellipsis; white-space: nowrap; }
.contact-line { margin: 0 0 18px; color: #667085; font-size: 14px; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 14px; background: #fff; border: 1px solid #e7ebf0; border-radius: 6px; }
.detail-grid div { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.detail-grid span { color: #87909f; font-size: 12px; }
.detail-grid b { overflow: hidden; color: #344054; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.audio-console { margin-top: 16px; padding: 16px; background: #17233b; border-radius: 6px; color: #fff; }
.audio-console audio { display: none; }
.audio-time { display: flex; justify-content: space-between; color: #c5ccda; font-size: 12px; }
.audio-console :deep(.el-slider__runway) { background: #44506a; }
.audio-actions { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 8px; }
.audio-actions .play-main { width: 46px; height: 46px; }
.audio-actions .speed-btn { width: 55px; }
.volume-row { display: grid; grid-template-columns: 18px 1fr; gap: 12px; align-items: center; margin-top: 12px; }
.player-error { margin: 10px 0 0; color: #ffb4ab; font-size: 13px; }
.summary-block { margin-top: 18px; padding-top: 16px; border-top: 1px solid #e3e7ee; }
.summary-block > div { display: flex; align-items: center; justify-content: space-between; }
.summary-block strong { color: #344054; font-size: 15px; }
.summary-block p { max-height: 128px; margin: 10px 0 0; overflow-y: auto; color: #667085; font-size: 14px; line-height: 1.7; white-space: pre-wrap; }
@media (max-width: 1500px) {
  .recording-workspace { grid-template-columns: 190px minmax(480px, 1fr) 300px; }
  .player-pane { padding: 14px; }
  .filter-date :deep(.el-date-editor) { width: 226px; }
  .filter-select { width: 150px; }
  .keyword-input { width: 190px; }
}
@media (max-width: 1100px) {
  .recording-workspace { grid-template-columns: 180px minmax(520px, 1fr); overflow-x: auto; }
  .player-pane { grid-column: 1 / -1; border-left: 0; border-top: 1px solid #e5e9f0; max-height: none; }
}
</style>

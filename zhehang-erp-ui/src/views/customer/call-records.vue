<template>
  <div class="cr">
    <header class="cr-head">
      <div>
        <h2 class="cr-title">通话记录</h2>
        <p class="cr-sub">系统按云客配置主动同步工作手机通话，通话时长和录音一并进入系统，也可随时手动补拉。</p>
      </div>
      <div class="cr-actions">
        <el-button type="primary" :loading="syncing" @click="syncNow"><el-icon><Refresh /></el-icon> 立即同步</el-button>
        <el-button @click="reload" plain><el-icon><Refresh /></el-icon> 刷新</el-button>
      </div>
    </header>

    <div class="cr-stats">
      <div class="cr-stat"><span class="cr-num">{{ stats.total || 0 }}</span><span class="cr-lbl">通话总数</span></div>
      <div class="cr-stat"><span class="cr-num">{{ stats.todayCount || 0 }}</span><span class="cr-lbl">今日通话</span></div>
      <div class="cr-stat"><span class="cr-num">{{ stats.connectRate || 0 }}<i>%</i></span><span class="cr-lbl">接通率</span></div>
      <div class="cr-stat"><span class="cr-num sm">{{ stats.totalDurationText || '0m 0s' }}</span><span class="cr-lbl">总通话时长</span></div>
    </div>

    <div class="cr-toolbar">
      <el-input v-model="keyword" class="cr-search" placeholder="搜客户号码 / 坐席" clearable @keyup.enter="reload" @clear="reload" />
      <el-button @click="reload"><el-icon><Search /></el-icon> 查询</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="方向/结果" width="132">
        <template #default="{ row }">
          <el-tag :type="row.connected === 1 ? 'success' : 'info'" size="small" effect="plain">{{ row.result || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="客户号码" min-width="140" show-overflow-tooltip>
        <template #default="{ row }">{{ row.phone || '—' }}</template>
      </el-table-column>
      <el-table-column label="坐席/员工" width="130" show-overflow-tooltip>
        <template #default="{ row }">{{ row.agentName || '—' }}</template>
      </el-table-column>
      <el-table-column label="通话时长" width="98" align="center">
        <template #default="{ row }"><span class="cr-dur">{{ fmtDur(row.duration) }}</span></template>
      </el-table-column>
      <el-table-column label="接通" width="72" align="center">
        <template #default="{ row }">
          <el-tag :type="row.connected === 1 ? 'success' : 'danger'" size="small" effect="dark">{{ row.connected === 1 ? '接通' : '未接' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通话时间" width="158">
        <template #default="{ row }">{{ fmtTime(row.callTime) }}</template>
      </el-table-column>
      <el-table-column label="录音" min-width="250">
        <template #default="{ row }">
          <audio
            v-if="playingRecordId === row.id && secureAudioSrc"
            :src="secureAudioSrc"
            controls
            autoplay
            controlslist="nodownload"
            preload="metadata"
            class="cr-audio"
          ></audio>
          <el-button v-else-if="row.recordingAvailable" link type="primary" @click="playRecording(row)">播放录音</el-button>
          <span v-else class="cr-muted">无录音</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有同步到通话记录" :image-size="80">
          <p class="cr-empty-tip">系统会按<b>「云客对接配置」</b>主动同步话单，也可点击右上角<b>「立即同步」</b>补拉未同步记录。若仍无数据，请检查云客配置和员工云客关联。</p>
        </el-empty>
      </template>
    </el-table>

    <div class="cr-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="loadData" @size-change="reload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { callRecordingStreamUrl, callRecordApi, type CallRecord } from '@/api/call-record'

const fmtTime = (t?: string) => (t ? String(t).replace('T', ' ').slice(0, 16) : '—')
const fmtDur = (s?: number) => {
  if (!s || s <= 0) return '00:00'
  const m = Math.floor(s / 60)
  const x = s % 60
  return String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')
}

const rows = ref<CallRecord[]>([])
const loading = ref(false)
const syncing = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const keyword = ref('')
const stats = ref<any>({})
const playingRecordId = ref<number | null>(null)
const secureAudioSrc = ref('')

const playRecording = async (row: CallRecord) => {
  if (!row.id) return
  try {
    const res: any = await callRecordApi.recordingTicket(row.id)
    const ticket = res?.data ?? res
    playingRecordId.value = row.id
    secureAudioSrc.value = callRecordingStreamUrl(row.id, ticket.token)
  } catch {
    ElMessage.warning('当前录音无权访问或暂时不可用')
  }
}

const loadData = async () => {
  playingRecordId.value = null
  secureAudioSrc.value = ''
  loading.value = true
  try {
    const res: any = await callRecordApi.syncList({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value || undefined })
    const page = res?.data ?? res
    rows.value = page?.records || []
    total.value = Number(page?.total ?? 0)
  } catch { rows.value = []; total.value = 0 } finally { loading.value = false }
  loadStats()
}
const reload = () => { pageNum.value = 1; loadData() }
const loadStats = async () => { try { const res: any = await callRecordApi.syncStats(); stats.value = (res?.data ?? res) || {} } catch { /* ignore */ } }
const syncNow = async () => {
  syncing.value = true
  try {
    const res: any = await callRecordApi.syncYunkeFailed(20)
    const data = (res?.data ?? res) || {}
    const changed = Number(data.inserted || 0) + Number(data.updated || 0)
    const remain = Number(data.yunkeTotal || 0)
    if (changed > 0) {
      ElMessage.success(`已补同步 ${changed} 条,云客队列约剩 ${remain} 条`)
    } else {
      ElMessage.info('本次没有新的通话记录')
    }
    reload()
  } finally {
    syncing.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.cr { padding: 16px 18px; }
.cr-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.cr-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.cr-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.cr-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.cr-stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.cr-stat { flex: 0 0 auto; min-width: 140px; display: flex; flex-direction: column; align-items: center; padding: 12px 20px; border-radius: 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); }
.cr-num { font-size: 24px; font-weight: 700; color: var(--el-color-primary); }
.cr-num.sm { font-size: 18px; }
.cr-num i { font-size: 14px; font-style: normal; margin-left: 1px; }
.cr-lbl { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 2px; }
.cr-toolbar { display: flex; gap: 10px; margin-bottom: 14px; flex-wrap: wrap; }
.cr-search { width: 240px; }
.cr-dur { font-variant-numeric: tabular-nums; font-weight: 500; }
.cr-audio { height: 34px; vertical-align: middle; max-width: 240px; }
.cr-muted { color: var(--el-text-color-placeholder); font-size: 12px; }
.cr-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
.cr-empty-tip { max-width: 540px; margin: 8px auto 0; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.7; }
</style>

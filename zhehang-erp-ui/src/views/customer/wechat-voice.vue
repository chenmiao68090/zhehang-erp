<template>
  <div class="wv">
    <header class="wv-head">
      <div>
        <h2 class="wv-title">微信语音通话</h2>
        <p class="wv-sub">销售和客户的微信语音/视频通话记录,含通话时长和录音,从云客实时拉取。</p>
      </div>
      <el-button @click="load" plain :loading="loading"><el-icon><Refresh /></el-icon> 刷新</el-button>
    </header>

    <div class="wv-filter">
      <el-date-picker v-model="range" type="daterange" range-separator="至" start-placeholder="开始日期"
        end-placeholder="结束日期" value-format="YYYY-MM-DD" class="f-date" @change="reload" />
      <el-select v-model="callType" placeholder="全部类型" clearable class="f-sel" @change="reload">
        <el-option label="语音通话" :value="1" />
        <el-option label="视频通话" :value="2" />
      </el-select>
      <el-select v-model="isSend" placeholder="全部方向" clearable class="f-sel" @change="reload">
        <el-option label="呼出" :value="1" />
        <el-option label="呼入" :value="0" />
      </el-select>
      <span class="wv-stat" v-if="total">共 {{ total }} 通</span>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="员工" min-width="150">
        <template #default="{ row }">
          <b class="wv-name">{{ row.userName || '—' }}</b>
          <div class="wv-sub2">{{ row.userWeChatNickName || row.userWeChatAlias || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="对方(好友)" min-width="150">
        <template #default="{ row }">
          <span>{{ row.talkerNickName || '—' }}</span>
          <div class="wv-sub2">{{ row.talkerAlias || '' }}</div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.callType == 2 ? 'warning' : 'primary'" effect="plain">{{ row.callType == 2 ? '视频' : '语音' }}</el-tag>
          <el-tag v-if="row.isRoom == 1" size="small" type="info" effect="plain" style="margin-left:4px">群</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="方向" width="80" align="center">
        <template #default="{ row }">{{ row.isSend == 1 ? '呼出' : '呼入' }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.callStatus == 1 ? 'success' : 'danger'" effect="plain">{{ row.callStatus == 1 ? '接通' : '未接' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时长" width="90" align="center">
        <template #default="{ row }">{{ fmtDur(row.duration, row.durationFile) }}</template>
      </el-table-column>
      <el-table-column label="录音" width="230">
        <template #default="{ row }">
          <audio v-if="row.recordingToken" :src="recordingUrl(row.recordingToken)" controls class="wv-audio" preload="none" />
          <span v-else-if="row.recordingStatus === 'unavailable'" class="wv-na">录音服务暂不可用</span>
          <span v-else class="wv-na">暂无录音</span>
        </template>
      </el-table-column>
      <el-table-column label="通话时间" width="160">
        <template #default="{ row }">{{ row.startTime || '—' }}</template>
      </el-table-column>
      <template #empty>
        <el-empty :description="loading ? '正在从云客拉取…' : '该时段暂无语音通话(确认云客对接配置已保存)'" :image-size="80" />
      </template>
    </el-table>

    <div class="wv-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[50, 100, 200]"
        layout="total, sizes, prev, pager, next" @current-change="load" @size-change="reload" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { yunkeApi } from '@/api/yunke'
import { callRecordingExternalStreamUrl } from '@/api/call-record'

const rows = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(50)
const range = ref<string[]>([])
const callType = ref<number | ''>('')
const isSend = ref<number | ''>('')

const load = async () => {
  loading.value = true
  try {
    const params: any = { pageNum: pageNum.value, pageSize: pageSize.value }
    if (range.value?.length === 2) { params.beginYmd = range.value[0]; params.endYmd = range.value[1] }
    if (callType.value !== '') params.callType = callType.value
    if (isSend.value !== '') params.isSend = isSend.value
    const res: any = await yunkeApi.voiceList(params)
    const d = res?.data ?? res
    rows.value = d?.list || []
    total.value = Number(d?.total ?? 0)
  } catch { rows.value = []; total.value = 0 } finally { loading.value = false }
}
const reload = () => { pageNum.value = 1; load() }
const recordingUrl = (token: string) => callRecordingExternalStreamUrl(token)

const fmtDur = (dur: any, secs: any) => {
  const s = Number(secs ?? dur)
  if (!s || isNaN(s)) return dur || '—'
  const m = Math.floor(s / 60)
  return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`
}

onMounted(load)
</script>

<style scoped>
.wv { padding: 16px 18px; }
.wv-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 12px; }
.wv-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.wv-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.wv-filter { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; align-items: center; }
.f-date { width: 250px; }
.f-sel { width: 130px; }
.wv-stat { font-size: 13px; color: var(--el-text-color-secondary); margin-left: auto; }
.wv-name { font-weight: 600; color: var(--el-text-color-primary); }
.wv-sub2 { font-size: 11.5px; color: var(--el-text-color-secondary); margin-top: 1px; }
.wv-na { color: var(--el-text-color-placeholder); }
.wv-audio { height: 32px; max-width: 210px; vertical-align: middle; }
.wv-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
</style>

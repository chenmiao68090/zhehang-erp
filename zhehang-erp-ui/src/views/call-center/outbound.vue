<template>
  <div class="ob-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-text">
        <div class="eyebrow">{{ t('cc.outbound.eyebrow') }}</div>
        <h2 class="title">{{ t('cc.outbound.title') }}</h2>
        <p class="subtitle">{{ t('cc.outbound.subtitle') }}</p>
      </div>
      <div class="header-aside">
        <div class="now-time">{{ nowText }}</div>
        <div class="now-tag">{{ t('cc.outbound.realtime') }}</div>
      </div>
    </div>

    <!-- 统计概览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <div class="stat-card" :class="'stat-' + stat.key">
          <div class="stat-icon">
            <el-icon :size="26"><component :is="stat.icon" /></el-icon>
          </div>
          <div class="stat-body">
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-value">
              <span class="num">{{ stat.value }}</span>
              <span class="unit" v-if="stat.unit">{{ stat.unit }}</span>
            </div>
          </div>
          <div class="stat-pulse"></div>
        </div>
      </el-col>
    </el-row>

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <el-input
          v-model="filter.keyword"
          :placeholder="t('cc.outbound.searchPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 240px"
          @keyup.enter="loadTasks"
          @clear="loadTasks"
        />
        <el-select
          v-model="filter.status"
          :placeholder="t('cc.outbound.statusAll')"
          clearable
          style="width: 160px"
          @change="loadTasks"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          >
            <span class="status-dot" :style="{ background: s.color }"></span>
            <span style="margin-left: 8px">{{ s.label }}</span>
          </el-option>
        </el-select>
        <el-button :icon="Refresh" @click="resetFilter">{{ t('common.reset') }}</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">{{ t('cc.outbound.action.add') }}</el-button>
      </div>
    </div>

    <!-- 任务列表 -->
    <el-table
      :data="taskList"
      v-loading="loading"
      class="ob-table"
      stripe
      style="width: 100%"
    >
      <el-table-column type="index" label="#" width="56" align="center" />
      <el-table-column :label="t('cc.outbound.column.taskName')" min-width="220">
        <template #default="{ row }">
          <div class="task-name-cell">
            <div class="task-icon" :style="{ background: typeBg(row.type) }">
              <el-icon><component :is="typeIcon(row.type)" /></el-icon>
            </div>
            <div class="name-info">
              <div class="name">{{ row.name }}</div>
              <div class="caller">{{ t('cc.outbound.form.callerNumber') }} {{ row.callerNumber || '—' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.type')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="typeTag(row.type)" effect="plain" size="small">
            {{ typeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.totalCount')" width="110" align="center">
        <template #default="{ row }">
          <span class="num-cell">{{ row.totalCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.completed')" width="110" align="center">
        <template #default="{ row }">
          <span class="num-cell">{{ row.completedCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.connected')" width="110" align="center">
        <template #default="{ row }">
          <span class="num-cell num-success">{{ row.successCount }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.connectRate')" width="160">
        <template #default="{ row }">
          <div class="rate-cell">
            <el-progress
              :percentage="answerRate(row)"
              :stroke-width="6"
              :show-text="false"
              :color="rateColor(row)"
            />
            <span class="rate-text">{{ answerRate(row) }}%</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.status')" width="110" align="center">
        <template #default="{ row }">
          <el-tag :type="statusTag(row.status)" effect="dark" size="small" class="status-tag">
            <span class="status-dot" :style="{ background: statusColor(row.status) }"></span>
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.createTime')" width="170">
        <template #default="{ row }">
          <span class="muted">{{ row.createdAt }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.outbound.column.operation')" width="280" fixed="right">
        <template #default="{ row }">
          <el-button
            v-if="row.status === 'draft'"
            link
            type="primary"
            size="small"
            @click="handleEdit(row)"
          >{{ t('common.edit') }}</el-button>
          <el-button
            v-if="row.status === 'draft' || row.status === 'paused'"
            link
            type="success"
            size="small"
            @click="handleControl(row, row.status === 'paused' ? 'resume' : 'start')"
          >{{ row.status === 'paused' ? t('cc.outbound.action.resume') : t('cc.outbound.action.start') }}</el-button>
          <el-button
            v-if="row.status === 'running'"
            link
            type="warning"
            size="small"
            @click="handleControl(row, 'pause')"
          >{{ t('cc.outbound.action.pause') }}</el-button>
          <el-button
            v-if="row.status === 'running' || row.status === 'paused'"
            link
            type="danger"
            size="small"
            @click="handleControl(row, 'stop')"
          >{{ t('cc.outbound.action.stop') }}</el-button>
          <el-button link type="primary" size="small" @click="openDetail(row)">{{ t('cc.outbound.action.view') }}</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新建/编辑任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? t('cc.outbound.form.addTitle') : t('cc.outbound.form.editTitle')"
      width="780px"
      class="ob-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-steps :active="step" finish-status="success" align-center class="ob-steps">
        <el-step :title="t('cc.outbound.form.step1')" :description="t('cc.outbound.form.step1Desc')" />
        <el-step :title="t('cc.outbound.form.step2')" :description="t('cc.outbound.form.step2Desc')" />
        <el-step :title="t('cc.outbound.form.step3')" :description="t('cc.outbound.form.step3Desc')" />
      </el-steps>

      <!-- 步骤1 基本信息 -->
      <div v-show="step === 0" class="step-pane">
        <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
          <el-form-item :label="t('cc.outbound.form.name')" prop="name">
            <el-input v-model="form.name" maxlength="50" show-word-limit :placeholder="t('cc.outbound.form.namePlaceholderExample')" />
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.type')" prop="type">
            <div class="type-cards">
              <div
                v-for="opt in typeOptions"
                :key="opt.value"
                class="type-card"
                :class="{ active: form.type === opt.value }"
                @click="form.type = opt.value"
              >
                <div class="type-card-icon" :style="{ background: opt.bg, color: opt.color }">
                  <el-icon :size="22"><component :is="opt.icon" /></el-icon>
                </div>
                <div class="type-card-name">{{ opt.label }}</div>
                <div class="type-card-desc">{{ opt.desc }}</div>
              </div>
            </div>
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.callerNumber')" prop="callerNumber">
            <el-input v-model="form.callerNumber" :placeholder="t('cc.outbound.form.callerNumberPlaceholder')" />
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.description')">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              :placeholder="t('cc.outbound.form.descriptionPlaceholder')"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤2 拨打配置 -->
      <div v-show="step === 1" class="step-pane">
        <el-form :model="form" label-width="140px">
          <el-form-item :label="t('cc.outbound.form.workTime')">
            <el-time-picker
              v-model="form.timeRange"
              is-range
              :range-separator="t('cc.outbound.form.rangeSeparator')"
              :start-placeholder="t('cc.outbound.form.workTimeStart')"
              :end-placeholder="t('cc.outbound.form.workTimeEnd')"
              value-format="HH:mm:ss"
              format="HH:mm"
            />
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.maxConcurrent')">
            <div class="slider-wrap">
              <el-slider
                v-model="form.maxConcurrent"
                :min="1"
                :max="50"
                :marks="{ 1: '1', 10: '10', 25: '25', 50: '50' }"
                style="flex: 1"
              />
              <div class="slider-value">{{ t('cc.outbound.form.concurrentValue', { n: form.maxConcurrent }) }}</div>
            </div>
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.maxRetry')">
            <el-input-number v-model="form.maxRetry" :min="1" :max="10" />
            <span class="form-hint">{{ t('cc.outbound.form.maxRetryHint') }}</span>
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.dialInterval')">
            <el-input-number v-model="form.dialInterval" :min="0" :max="600" />
            <span class="form-hint">{{ t('cc.outbound.form.dialIntervalHint') }}</span>
          </el-form-item>
          <el-form-item :label="t('cc.outbound.form.ringTimeout')">
            <el-input-number v-model="form.ringTimeout" :min="5" :max="120" />
            <span class="form-hint">{{ t('cc.outbound.form.ringTimeoutHint') }}</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤3 号码导入 -->
      <div v-show="step === 2" class="step-pane">
        <div class="import-grid">
          <div class="import-block">
            <div class="block-title">
              <el-icon><UploadFilled /></el-icon>
              <span>{{ t('cc.outbound.form.importFile') }}</span>
            </div>
            <el-upload
              class="ob-upload"
              drag
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept=".csv,.txt,.xlsx"
              :on-change="handleFileChange"
            >
              <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
              <div class="el-upload__text">
                {{ t('cc.outbound.form.uploadDragText') }}<em>{{ t('cc.outbound.form.uploadClickText') }}</em>
              </div>
              <div class="el-upload__tip">{{ t('cc.outbound.form.uploadTipText') }}</div>
            </el-upload>
          </div>
          <div class="import-block">
            <div class="block-title">
              <el-icon><EditPen /></el-icon>
              <span>{{ t('cc.outbound.form.importManual') }}</span>
            </div>
            <el-input
              v-model="form.numbersText"
              type="textarea"
              :rows="9"
              :placeholder="t('cc.outbound.form.numbersPlaceholder')"
              @input="syncNumbers"
            />
          </div>
        </div>
        <div class="import-summary">
          <div class="sum-item">
            <span class="lbl">{{ t('cc.outbound.form.importedCount') }}</span>
            <span class="val">{{ form.numbers.length }}</span>
            <span class="unit"> {{ t('cc.outbound.form.unitItem') }}</span>
          </div>
          <div class="sum-item">
            <span class="lbl">{{ t('cc.outbound.form.uniqueCount') }}</span>
            <span class="val">{{ uniqueNumbers.length }}</span>
            <span class="unit"> {{ t('cc.outbound.form.unitItem') }}</span>
          </div>
          <el-button v-if="form.numbers.length" link type="danger" @click="clearNumbers">{{ t('cc.outbound.form.clear') }}</el-button>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button v-if="step > 0" @click="step--">{{ t('cc.outbound.form.prevStep') }}</el-button>
        <el-button v-if="step < 2" type="primary" @click="goNext">{{ t('cc.outbound.form.nextStep') }}</el-button>
        <el-button v-if="step === 2" type="primary" :loading="submitting" @click="handleSubmit">
          {{ dialogMode === 'add' ? t('cc.outbound.form.createTask') : t('cc.outbound.form.saveChanges') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 任务详情抽屉 -->
    <el-drawer v-model="drawerVisible" size="640px" :with-header="false" class="ob-drawer">
      <div v-if="currentTask" class="drawer-content">
        <div class="drawer-header">
          <div>
            <div class="d-eyebrow">{{ t('cc.outbound.detail.eyebrow') }}</div>
            <div class="d-title">{{ currentTask.name }}</div>
            <div class="d-meta">
              <el-tag :type="typeTag(currentTask.type)" effect="plain" size="small">
                {{ typeLabel(currentTask.type) }}
              </el-tag>
              <el-tag :type="statusTag(currentTask.status)" effect="dark" size="small" class="status-tag">
                <span class="status-dot" :style="{ background: statusColor(currentTask.status) }"></span>
                {{ statusLabel(currentTask.status) }}
              </el-tag>
              <span class="d-meta-text">{{ t('cc.outbound.detail.createdPrefix') }} {{ currentTask.createdAt }}</span>
            </div>
          </div>
          <div class="drawer-actions">
            <el-button
              v-if="currentTask.status === 'draft' || currentTask.status === 'paused'"
              type="success"
              size="small"
              :icon="VideoPlay"
              @click="handleControl(currentTask, currentTask.status === 'paused' ? 'resume' : 'start')"
            >{{ currentTask.status === 'paused' ? t('cc.outbound.action.resume') : t('cc.outbound.action.start') }}</el-button>
            <el-button
              v-if="currentTask.status === 'running'"
              type="warning"
              size="small"
              :icon="VideoPause"
              @click="handleControl(currentTask, 'pause')"
            >{{ t('cc.outbound.action.pause') }}</el-button>
            <el-button
              v-if="currentTask.status === 'running' || currentTask.status === 'paused'"
              type="danger"
              size="small"
              :icon="CircleClose"
              @click="handleControl(currentTask, 'stop')"
            >{{ t('cc.outbound.action.stop') }}</el-button>
          </div>
        </div>

        <div class="drawer-progress">
          <el-progress
            type="dashboard"
            :percentage="taskProgress(currentTask)"
            :width="160"
            :stroke-width="10"
            :color="progressColors"
          >
            <template #default="{ percentage }">
              <div class="progress-inner">
                <div class="progress-num">{{ percentage }}%</div>
                <div class="progress-lbl">{{ t('cc.outbound.detail.progress') }}</div>
              </div>
            </template>
          </el-progress>
          <div class="progress-stats">
            <div class="ps-item">
              <div class="ps-lbl">{{ t('cc.outbound.detail.totalNumbers') }}</div>
              <div class="ps-val">{{ currentTask.totalCount }}</div>
            </div>
            <div class="ps-item">
              <div class="ps-lbl">{{ t('cc.outbound.column.completed') }}</div>
              <div class="ps-val">{{ currentTask.completedCount }}</div>
            </div>
            <div class="ps-item">
              <div class="ps-lbl">{{ t('cc.outbound.detail.result.answered') }}</div>
              <div class="ps-val ps-success">{{ currentTask.successCount }}</div>
            </div>
            <div class="ps-item">
              <div class="ps-lbl">{{ t('cc.outbound.detail.result.failed') }}</div>
              <div class="ps-val ps-danger">{{ currentTask.failedCount }}</div>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="section-title">{{ t('cc.outbound.detail.realtimeStats') }}</div>
          <div class="rt-grid">
            <div class="rt-card" v-for="rt in realtimeStats(currentTask)" :key="rt.label">
              <div class="rt-icon" :style="{ background: rt.bg, color: rt.color }">
                <el-icon><component :is="rt.icon" /></el-icon>
              </div>
              <div class="rt-body">
                <div class="rt-lbl">{{ rt.label }}</div>
                <div class="rt-val">{{ rt.value }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="section-title">{{ t('cc.outbound.detail.dialDetails') }}</div>
          <el-table :data="dialDetails" size="small" class="dial-table">
            <el-table-column :label="t('cc.outbound.detail.contactColumn.phone')" min-width="140">
              <template #default="{ row }"><span class="mono">{{ row.number }}</span></template>
            </el-table-column>
            <el-table-column :label="t('cc.outbound.detail.contactColumn.status')" width="100">
              <template #default="{ row }">
                <el-tag :type="dialResultTag(row.result)" effect="plain" size="small">
                  {{ dialResultLabel(row.result) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('cc.outbound.detail.dialedAt')" width="160">
              <template #default="{ row }"><span class="muted">{{ row.dialedAt }}</span></template>
            </el-table-column>
            <el-table-column :label="t('cc.outbound.detail.duration')" width="80">
              <template #default="{ row }"><span class="mono">{{ formatDuration(row.duration) }}</span></template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  PhoneFilled,
  VideoPlay,
  VideoPause,
  CircleClose,
  CircleCheck,
  WarningFilled,
  Bell,
  Aim,
  View,
  Promotion,
  UploadFilled,
  EditPen,
  TrendCharts,
  DataLine
} from '@element-plus/icons-vue'
import {
  getOutboundTasks,
  createTask,
  controlTask,
  type OutboundTask
} from '@/api/call-center'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ================== 类型/状态元数据 ==================
type TaskType = OutboundTask['type']
type TaskStatus = OutboundTask['status']

const TYPE_META: Record<TaskType, { label: () => string; tag: 'primary' | 'success' | 'warning' | 'info'; color: string; bg: string; icon: any; desc: () => string }> = {
  predictive:  { label: () => t('cc.outbound.type.predictive'),  tag: 'primary', color: '#5B8DEF', bg: 'rgba(91,141,239,0.14)',  icon: TrendCharts, desc: () => t('cc.outbound.typeDesc.predictive') },
  preview:     { label: () => t('cc.outbound.type.preview'),     tag: 'success', color: '#06D6A0', bg: 'rgba(6,214,160,0.14)',   icon: View,        desc: () => t('cc.outbound.typeDesc.preview') },
  progressive: { label: () => t('cc.outbound.type.progressive'), tag: 'warning', color: '#FFB347', bg: 'rgba(255,179,71,0.14)',  icon: DataLine,    desc: () => t('cc.outbound.typeDesc.progressive') },
  manual:      { label: () => t('cc.outbound.type.manual'),      tag: 'info',    color: '#B76E79', bg: 'rgba(183,110,121,0.14)', icon: PhoneFilled, desc: () => t('cc.outbound.typeDesc.manual') }
}

const STATUS_META: Record<TaskStatus, { label: () => string; tag: 'info' | 'success' | 'warning' | '' | 'danger'; color: string }> = {
  draft:     { label: () => t('cc.outbound.status.draft'),     tag: 'info',    color: '#8B7355' },
  running:   { label: () => t('cc.outbound.status.running'),   tag: 'success', color: '#06D6A0' },
  paused:    { label: () => t('cc.outbound.status.paused'),    tag: 'warning', color: '#FFD166' },
  completed: { label: () => t('cc.outbound.status.completed'), tag: '',        color: '#C5A55A' },
  stopped:   { label: () => t('cc.outbound.status.stopped'),   tag: 'danger',  color: '#E5707E' }
}

const typeOptions = computed(() => (Object.keys(TYPE_META) as TaskType[]).map(k => ({
  value: k,
  label: TYPE_META[k].label(),
  desc: TYPE_META[k].desc(),
  color: TYPE_META[k].color,
  bg: TYPE_META[k].bg,
  icon: TYPE_META[k].icon
})))

const statusOptions = computed(() => (Object.keys(STATUS_META) as TaskStatus[]).map(k => ({
  value: k,
  label: STATUS_META[k].label(),
  color: STATUS_META[k].color
})))

const typeLabel = (tp: TaskType) => TYPE_META[tp] ? TYPE_META[tp].label() : tp
const typeTag   = (tp: TaskType) => TYPE_META[tp]?.tag || 'info'
const typeBg    = (tp: TaskType) => TYPE_META[tp]?.bg || 'rgba(212,175,55,0.12)'
const typeIcon  = (tp: TaskType) => TYPE_META[tp]?.icon || PhoneFilled
const statusLabel = (s: TaskStatus) => STATUS_META[s] ? STATUS_META[s].label() : s
const statusTag   = (s: TaskStatus) => STATUS_META[s]?.tag || ''
const statusColor = (s: TaskStatus) => STATUS_META[s]?.color || '#888'

// ================== 数据 ==================
const loading = ref(false)
const taskList = ref<OutboundTask[]>([])
const filter = reactive<{ keyword: string; status: TaskStatus | '' }>({ keyword: '', status: '' })

// 实时时钟
const nowMs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
const nowText = computed(() => {
  const d = new Date(nowMs.value)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

// 接通率
const answerRate = (row: OutboundTask) => {
  if (!row.completedCount) return 0
  return Math.round((row.successCount / row.completedCount) * 100)
}
const rateColor = (row: OutboundTask) => {
  const r = answerRate(row)
  if (r >= 70) return '#06D6A0'
  if (r >= 40) return '#D4AF37'
  return '#E5707E'
}

// 任务进度
const taskProgress = (row: OutboundTask) => {
  if (!row.totalCount) return 0
  return Math.min(100, Math.round((row.completedCount / row.totalCount) * 100))
}
const progressColors = [
  { color: '#E5707E', percentage: 30 },
  { color: '#FFD166', percentage: 60 },
  { color: '#06D6A0', percentage: 100 }
]

// 概览统计
const stats = computed(() => {
  const list = taskList.value
  const running = list.filter(t => t.status === 'running').length
  const todayDialed = list.reduce((s, t) => s + t.completedCount, 0)
  const todaySuccess = list.reduce((s, t) => s + t.successCount, 0)
  const rate = todayDialed ? Math.round((todaySuccess / todayDialed) * 100) : 0
  return [
    { key: 'total',   label: t('cc.outbound.stats.totalTasks'),     value: list.length, unit: t('cc.outbound.unitItem'), icon: Promotion },
    { key: 'running', label: t('cc.outbound.stats.running'),        value: running,     unit: t('cc.outbound.unitItem'), icon: PhoneFilled },
    { key: 'dialed',  label: t('cc.outbound.stats.connectedToday'), value: todayDialed, unit: t('cc.outbound.unitCall'), icon: TrendCharts },
    { key: 'rate',    label: t('cc.outbound.stats.connectRate'),    value: rate,        unit: '%',                       icon: Aim }
  ]
})

// ================== 加载 ==================
const loadTasks = async () => {
  loading.value = true
  try {
    const params: { keyword?: string; status?: TaskStatus } = {}
    if (filter.keyword) params.keyword = filter.keyword
    if (filter.status)  params.status  = filter.status as TaskStatus
    const res = await getOutboundTasks(params)
    taskList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const resetFilter = () => {
  filter.keyword = ''
  filter.status = ''
  loadTasks()
}

// ================== 表单（多步骤） ==================
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const step = ref(0)
const formRef = ref<FormInstance>()

const form = reactive({
  id: 0,
  name: '',
  type: 'predictive' as TaskType,
  callerNumber: '',
  description: '',
  timeRange: ['09:00:00', '18:00:00'] as [string, string],
  maxConcurrent: 10,
  maxRetry: 3,
  dialInterval: 30,
  ringTimeout: 25,
  numbers: [] as string[],
  numbersText: ''
})

const rules: FormRules = {
  name: [
    { required: true, message: t('cc.outbound.validation.nameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('cc.outbound.validation.nameLength'), trigger: 'blur' }
  ],
  type: [{ required: true, message: t('cc.outbound.validation.typeRequired'), trigger: 'change' }],
  callerNumber: [
    { required: true, message: t('cc.outbound.validation.callerRequired'), trigger: 'blur' },
    { pattern: /^[\d\-]{4,20}$/, message: t('cc.outbound.validation.callerFormat'), trigger: 'blur' }
  ]
}

const uniqueNumbers = computed(() => {
  const set = new Set<string>()
  form.numbers.forEach(n => { const t = n.trim(); if (t) set.add(t) })
  return Array.from(set)
})

const syncNumbers = () => {
  form.numbers = form.numbersText
    .split(/[\n,;\s]+/)
    .map(s => s.trim())
    .filter(s => /^[\d\-+]{4,20}$/.test(s))
}

const handleFileChange = (file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  const reader = new FileReader()
  reader.onload = e => {
    const text = String(e.target?.result || '')
    const arr = text.split(/[\n,;\s]+/).map(s => s.trim()).filter(s => /^[\d\-+]{4,20}$/.test(s))
    const merged = new Set<string>([...form.numbers, ...arr])
    form.numbers = Array.from(merged)
    form.numbersText = form.numbers.join('\n')
    ElMessage.success(t('cc.outbound.message.fileImported', { count: arr.length }))
  }
  reader.readAsText(raw)
}

const clearNumbers = () => {
  form.numbers = []
  form.numbersText = ''
}

const resetForm = () => {
  form.id = 0
  form.name = ''
  form.type = 'predictive'
  form.callerNumber = ''
  form.description = ''
  form.timeRange = ['09:00:00', '18:00:00']
  form.maxConcurrent = 10
  form.maxRetry = 3
  form.dialInterval = 30
  form.ringTimeout = 25
  form.numbers = []
  form.numbersText = ''
  step.value = 0
  formRef.value?.clearValidate()
}

const goNext = async () => {
  if (step.value === 0) {
    if (!formRef.value) { step.value++; return }
    const valid = await formRef.value.validate().catch(() => false)
    if (!valid) return
  }
  step.value++
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: OutboundTask) => {
  dialogMode.value = 'edit'
  resetForm()
  form.id = row.id
  form.name = row.name
  form.type = row.type
  form.callerNumber = row.callerNumber
  dialogVisible.value = true
}

const handleSubmit = async () => {
  if (!form.numbers.length) {
    ElMessage.warning(t('cc.outbound.validation.contactsRequired'))
    return
  }
  submitting.value = true
  try {
    await createTask({
      name: form.name,
      type: form.type,
      callerNumber: form.callerNumber,
      totalCount: uniqueNumbers.value.length
    })
    ElMessage.success(dialogMode.value === 'add' ? t('cc.outbound.message.addSuccess') : t('cc.outbound.message.updateSuccess'))
    dialogVisible.value = false
    loadTasks()
  } finally {
    submitting.value = false
  }
}

// ================== 控制 ==================
const handleControl = async (row: OutboundTask, action: 'start' | 'pause' | 'resume' | 'stop') => {
  const labels: Record<typeof action, string> = {
    start: t('cc.outbound.action.start'),
    pause: t('cc.outbound.action.pause'),
    resume: t('cc.outbound.action.resume'),
    stop: t('cc.outbound.action.stop')
  }
  if (action === 'stop') {
    try {
      await ElMessageBox.confirm(t('cc.outbound.message.stopConfirm', { name: row.name }), t('cc.outbound.message.confirmTitle'), {
        type: 'warning', confirmButtonText: t('cc.outbound.action.stop'), cancelButtonText: t('common.cancel')
      })
    } catch { return }
  }
  await controlTask(row.id, action)
  ElMessage.success(t('cc.outbound.message.controlled', { action: labels[action], name: row.name }))
  // 同步当前抽屉状态
  if (currentTask.value && currentTask.value.id === row.id) {
    const map: Record<typeof action, TaskStatus> = { start: 'running', pause: 'paused', resume: 'running', stop: 'stopped' }
    currentTask.value.status = map[action]
  }
  loadTasks()
}

const handleDelete = (row: OutboundTask) => {
  ElMessageBox.confirm(t('cc.outbound.message.deleteConfirm', { name: row.name }), t('cc.outbound.message.deleteTitle'), {
    type: 'warning', confirmButtonText: t('common.delete'), cancelButtonText: t('common.cancel')
  })
    .then(() => {
      taskList.value = taskList.value.filter(item => item.id !== row.id)
      ElMessage.success(t('cc.outbound.message.deleteSuccess'))
    })
    .catch(() => {})
}

// ================== 详情抽屉 ==================
const drawerVisible = ref(false)
const currentTask = ref<OutboundTask | null>(null)

interface DialDetail { number: string; result: 'answered' | 'no-answer' | 'busy' | 'failed'; dialedAt: string; duration: number }
const dialDetails = ref<DialDetail[]>([])

const openDetail = (row: OutboundTask) => {
  currentTask.value = row
  dialDetails.value = mockDialDetails(row)
  drawerVisible.value = true
}

const realtimeStats = (row: OutboundTask) => {
  const noAnswer = Math.max(0, Math.floor(row.failedCount * 0.55))
  const busy = Math.max(0, Math.floor(row.failedCount * 0.25))
  const failed = Math.max(0, row.failedCount - noAnswer - busy)
  return [
    { label: t('cc.outbound.column.completed'),         value: row.completedCount, icon: PhoneFilled, bg: 'rgba(91,141,239,0.14)',  color: '#5B8DEF' },
    { label: t('cc.outbound.detail.result.answered'),   value: row.successCount,   icon: CircleCheck, bg: 'rgba(6,214,160,0.14)',   color: '#06D6A0' },
    { label: t('cc.outbound.detail.result.no-answer'),  value: noAnswer,           icon: Bell,        bg: 'rgba(255,209,102,0.14)', color: '#FFD166' },
    { label: t('cc.outbound.detail.result.busy'),       value: busy,               icon: WarningFilled, bg: 'rgba(255,179,71,0.14)', color: '#FFB347' },
    { label: t('cc.outbound.detail.result.failed'),     value: failed,             icon: CircleClose, bg: 'rgba(229,112,126,0.14)', color: '#E5707E' }
  ]
}

const mockDialDetails = (row: OutboundTask): DialDetail[] => {
  const total = Math.min(20, Math.max(6, Math.floor(row.completedCount / 60) || 8))
  const results: DialDetail['result'][] = ['answered', 'answered', 'no-answer', 'answered', 'busy', 'answered', 'failed', 'answered']
  return Array.from({ length: total }).map((_, i) => {
    const base = Date.now() - i * 47_000 - 60_000
    const d = new Date(base)
    const pad = (n: number) => n.toString().padStart(2, '0')
    const dialedAt = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    const result = results[(row.id + i) % results.length]
    return {
      number: `13${String(800000000 + row.id * 1373 + i * 97).padStart(9, '0')}`,
      result,
      dialedAt,
      duration: result === 'answered' ? 30 + ((row.id + i) * 17) % 240 : 0
    }
  })
}

const dialResultLabel = (r: DialDetail['result']) => ({
  answered: t('cc.outbound.detail.result.answered'),
  'no-answer': t('cc.outbound.detail.result.no-answer'),
  busy: t('cc.outbound.detail.result.busy'),
  failed: t('cc.outbound.detail.result.failed')
}[r])
const dialResultTag = (r: DialDetail['result']): 'success' | 'warning' | 'info' | 'danger' => ({
  answered: 'success', 'no-answer': 'warning', busy: 'info', failed: 'danger'
} as const)[r]

const formatDuration = (sec: number) => {
  if (!sec) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

// ================== 生命周期 ==================
onMounted(() => {
  loadTasks()
  timer = setInterval(() => { nowMs.value = Date.now() }, 1000)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.ob-page {
  padding: 24px;
  min-height: calc(100vh - 88px);
  background: var(--bg-darkest, #0A0A0F);
}

/* ============== 页头 ============== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 4px 4px 22px;
  border-bottom: 1px dashed var(--border-gold, rgba(212, 175, 55, 0.2));
  margin-bottom: 20px;
}
.eyebrow {
  font-size: 11px;
  letter-spacing: 6px;
  color: var(--gold-dark, #8B7355);
  margin-bottom: 6px;
}
.title {
  margin: 0;
  font-size: 26px;
  letter-spacing: 4px;
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
  position: relative;
  padding-left: 14px;
}
.title::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 3px;
  background: var(--gradient-gold, linear-gradient(135deg, #D4AF37, #C5A55A));
  border-radius: 2px;
}
.subtitle {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
  letter-spacing: 1px;
}
.header-aside { display: flex; align-items: center; gap: 10px; }
.now-time {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  font-size: 14px;
  color: var(--gold-champagne, #C5A55A);
  letter-spacing: 1px;
}
.now-tag {
  font-size: 10px;
  letter-spacing: 2px;
  padding: 3px 8px;
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
  margin-right: 4px;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(212, 175, 55, .55); }
  70%  { box-shadow: 0 0 0 7px rgba(212, 175, 55, 0); }
  100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
}

/* ============== 统计卡片 ============== */
.stats-row { margin-bottom: 20px; }
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 22px 24px;
  background: linear-gradient(135deg, rgba(26,26,36,0.95) 0%, rgba(18,18,26,0.95) 100%);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
  overflow: hidden;
  transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
}
.stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; bottom: 0; width: 3px;
  background: var(--gold-primary, #D4AF37);
  box-shadow: 0 0 16px var(--gold-primary, #D4AF37);
}
.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--border-gold-hover, rgba(212, 175, 55, 0.4));
  box-shadow: var(--shadow-gold-hover, 0 8px 32px rgba(212, 175, 55, 0.25));
}
.stat-icon {
  width: 56px; height: 56px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 12px;
  margin-right: 18px;
  flex-shrink: 0;
}
.stat-total   .stat-icon { background: rgba(212,175,55,0.14);  color: #D4AF37; }
.stat-running .stat-icon { background: rgba(6,214,160,0.14);   color: #06D6A0; }
.stat-dialed  .stat-icon { background: rgba(91,141,239,0.14);  color: #5B8DEF; }
.stat-rate    .stat-icon { background: rgba(255,209,102,0.14); color: #FFD166; }

.stat-body { flex: 1; min-width: 0; }
.stat-label {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--text-body, #A09B8C);
  margin-bottom: 6px;
}
.stat-value { display: flex; align-items: baseline; gap: 4px; color: var(--text-primary, #F0E6D3); }
.stat-value .num {
  font-size: 32px;
  font-weight: 600;
  font-family: 'DIN Alternate', 'Helvetica Neue', sans-serif;
  background: linear-gradient(135deg, #D4AF37 0%, #C5A55A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}
.stat-value .unit {
  font-size: 13px;
  color: var(--text-muted, #5E5A52);
  margin-left: 4px;
}
.stat-pulse {
  position: absolute; right: 18px; top: 18px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--gold-primary, #D4AF37);
  animation: pulse 1.8s infinite;
}

/* ============== 工具栏 ============== */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 14px 18px;
  background: rgba(26, 26, 36, 0.6);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.18));
  border-radius: 10px;
}
.toolbar-left { display: flex; align-items: center; gap: 12px; }
.toolbar-right { display: flex; align-items: center; gap: 8px; }
.status-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  vertical-align: middle;
  margin-right: 4px;
}

/* ============== 任务表格 ============== */
.ob-table {
  background: transparent;
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.18));
  border-radius: 10px;
  overflow: hidden;
}
.task-name-cell { display: flex; align-items: center; gap: 12px; }
.task-icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid rgba(212, 175, 55, 0.18);
  color: var(--gold-primary, #D4AF37);
}
.name-info .name {
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
  letter-spacing: 1px;
}
.name-info .caller {
  font-size: 11px;
  color: var(--text-muted, #5E5A52);
  margin-top: 3px;
  font-family: 'DIN Alternate', monospace;
}
.num-cell {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
}
.num-success { color: #06D6A0; }
.muted { color: var(--text-muted, #5E5A52); font-size: 12px; }
.rate-cell {
  display: flex; align-items: center; gap: 8px;
}
.rate-cell :deep(.el-progress) { flex: 1; }
.rate-text {
  width: 44px;
  text-align: right;
  color: var(--gold-champagne, #C5A55A);
  font-family: 'DIN Alternate', monospace;
  font-size: 12px;
}
.status-tag .status-dot { margin-right: 6px; width: 6px; height: 6px; }

/* ============== 对话框 ============== */
.ob-dialog :deep(.el-dialog) {
  background: linear-gradient(135deg, rgba(20,20,28,0.98), rgba(14,14,20,0.98));
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.3));
  border-radius: 14px;
}
.ob-steps { margin: 8px 0 28px; }
.step-pane { padding: 4px 8px; min-height: 320px; }

.type-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;
}
.type-card {
  position: relative;
  padding: 14px 16px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  background: rgba(26, 26, 36, 0.55);
  cursor: pointer;
  transition: all .2s ease;
}
.type-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-1px);
}
.type-card.active {
  border-color: var(--gold-primary, #D4AF37);
  box-shadow: inset 0 0 0 1px rgba(212,175,55,0.4), 0 0 16px rgba(212,175,55,0.2);
  background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(197,165,90,0.02));
}
.type-card.active::after {
  content: '';
  position: absolute; top: 10px; right: 10px;
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--gold-primary, #D4AF37);
  box-shadow: 0 0 10px var(--gold-primary, #D4AF37);
}
.type-card-icon {
  width: 38px; height: 38px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 8px;
}
.type-card-name {
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
  letter-spacing: 2px;
  margin-bottom: 4px;
}
.type-card-desc {
  font-size: 11px;
  color: var(--text-muted, #5E5A52);
  line-height: 1.5;
}

.slider-wrap {
  display: flex; align-items: center; gap: 18px;
  width: 100%;
}
.slider-value {
  width: 80px;
  text-align: center;
  padding: 4px 0;
  color: var(--gold-champagne, #C5A55A);
  font-family: 'DIN Alternate', monospace;
  border: 1px dashed rgba(212,175,55,0.3);
  border-radius: 6px;
  font-size: 13px;
}
.form-hint {
  margin-left: 10px;
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
}

.import-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.import-block {
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 10px;
  padding: 14px;
  background: rgba(26, 26, 36, 0.5);
}
.block-title {
  display: flex; align-items: center; gap: 8px;
  color: var(--gold-champagne, #C5A55A);
  font-size: 13px;
  letter-spacing: 2px;
  margin-bottom: 10px;
}
.ob-upload :deep(.el-upload-dragger) {
  background: rgba(14,14,20,0.6);
  border: 1px dashed rgba(212,175,55,0.3);
  border-radius: 8px;
  height: 196px;
}
.ob-upload :deep(.el-upload__text) {
  color: var(--text-body, #A09B8C);
}
.ob-upload :deep(.el-upload__text em) {
  color: var(--gold-primary, #D4AF37);
}
.ob-upload :deep(.el-upload__tip) {
  font-size: 11px;
  color: var(--text-muted, #5E5A52);
  text-align: center;
  margin-top: 8px;
}

.import-summary {
  margin-top: 14px;
  display: flex; align-items: center; gap: 24px;
  padding: 12px 18px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.02));
  border: 1px dashed rgba(212,175,55,0.25);
}
.sum-item .lbl { color: var(--text-muted, #5E5A52); font-size: 12px; letter-spacing: 1px; }
.sum-item .val {
  font-family: 'DIN Alternate', monospace;
  font-size: 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #D4AF37 0%, #C5A55A 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-left: 4px;
}
.sum-item .unit { color: var(--text-muted, #5E5A52); font-size: 12px; }

/* ============== 详情抽屉 ============== */
.ob-drawer :deep(.el-drawer) {
  background: linear-gradient(180deg, rgba(18,18,26,0.99), rgba(10,10,16,0.99));
  border-left: 1px solid var(--border-gold, rgba(212, 175, 55, 0.3));
}
.drawer-content { padding: 8px 4px 32px; }
.drawer-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 18px;
  border-bottom: 1px dashed rgba(212,175,55,0.2);
  margin-bottom: 22px;
}
.d-eyebrow {
  font-size: 11px; letter-spacing: 6px;
  color: var(--gold-dark, #8B7355);
  margin-bottom: 6px;
}
.d-title {
  font-size: 22px;
  letter-spacing: 2px;
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
  margin-bottom: 10px;
}
.d-meta { display: flex; align-items: center; gap: 10px; }
.d-meta-text { font-size: 11px; color: var(--text-muted, #5E5A52); }
.drawer-actions { display: flex; flex-direction: column; gap: 8px; }

.drawer-progress {
  display: flex; align-items: center; gap: 28px;
  padding: 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(26,26,36,0.85), rgba(18,18,26,0.85));
  border: 1px solid rgba(212,175,55,0.2);
  margin-bottom: 22px;
}
.progress-inner { text-align: center; }
.progress-num {
  font-size: 28px; font-weight: 600;
  font-family: 'DIN Alternate', monospace;
  background: linear-gradient(135deg, #D4AF37, #C5A55A);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.progress-lbl {
  font-size: 11px; letter-spacing: 4px;
  color: var(--text-muted, #5E5A52);
  margin-top: 2px;
}
.progress-stats {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px 22px;
}
.ps-item {
  padding: 8px 12px;
  border-left: 2px solid rgba(212,175,55,0.4);
}
.ps-lbl {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted, #5E5A52);
}
.ps-val {
  font-size: 20px;
  font-family: 'DIN Alternate', monospace;
  color: var(--text-primary, #F0E6D3);
  font-weight: 600;
  margin-top: 2px;
}
.ps-success { color: #06D6A0; }
.ps-danger  { color: #E5707E; }

.drawer-section { margin-bottom: 22px; }
.section-title {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--gold-champagne, #C5A55A);
  margin-bottom: 12px;
  padding-left: 10px;
  border-left: 2px solid var(--gold-primary, #D4AF37);
}

.rt-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.rt-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 12px 8px;
  background: rgba(26, 26, 36, 0.6);
  border: 1px solid rgba(212,175,55,0.18);
  border-radius: 8px;
}
.rt-icon {
  width: 32px; height: 32px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 6px;
}
.rt-lbl {
  font-size: 11px;
  letter-spacing: 2px;
  color: var(--text-muted, #5E5A52);
}
.rt-val {
  font-size: 18px;
  font-weight: 600;
  font-family: 'DIN Alternate', monospace;
  color: var(--text-primary, #F0E6D3);
  margin-top: 2px;
}

.dial-table {
  background: transparent;
  border: 1px solid rgba(212,175,55,0.15);
  border-radius: 8px;
  overflow: hidden;
}
.mono { font-family: 'DIN Alternate', 'Courier New', monospace; color: var(--text-primary, #F0E6D3); }

/* Element Plus 表格暗黑适配 */
.ob-table :deep(.el-table),
.dial-table :deep(.el-table) { background: transparent; color: var(--text-body, #A09B8C); }
.ob-table :deep(.el-table tr),
.dial-table :deep(.el-table tr) { background: transparent; }
.ob-table :deep(.el-table th.el-table__cell),
.dial-table :deep(.el-table th.el-table__cell) {
  background: rgba(26, 26, 36, 0.85) !important;
  color: var(--gold-champagne, #C5A55A) !important;
  border-bottom: 1px solid rgba(212,175,55,0.2) !important;
  letter-spacing: 1px;
}
.ob-table :deep(.el-table td.el-table__cell),
.dial-table :deep(.el-table td.el-table__cell) {
  background: transparent !important;
  border-bottom: 1px solid rgba(212,175,55,0.08) !important;
}
.ob-table :deep(.el-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(212,175,55,0.03) !important;
}
.ob-table :deep(.el-table__body tr:hover > td.el-table__cell) {
  background: rgba(212,175,55,0.06) !important;
}

@media (max-width: 980px) {
  .type-cards { grid-template-columns: 1fr; }
  .import-grid { grid-template-columns: 1fr; }
  .progress-stats { grid-template-columns: repeat(2, 1fr); }
  .rt-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>

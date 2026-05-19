<template>
  <div class="agent-page">
    <!-- 页头 -->
    <div class="page-header">
      <div class="header-text">
        <div class="eyebrow">{{ t('cc.agent.eyebrow') }}</div>
        <h2 class="title">{{ t('cc.agent.title') }}</h2>
        <p class="subtitle">{{ t('cc.agent.subtitle') }}</p>
      </div>
      <div class="header-aside">
        <div class="now-time">{{ nowText }}</div>
        <div class="now-tag">{{ t('cc.agent.live') }}</div>
      </div>
    </div>

    <!-- 统计卡片 -->
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
              <span class="unit">{{ t('cc.monitor.kpi.unit.person') }}</span>
              <span class="ratio">/ {{ agentList.length }}</span>
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
          :placeholder="t('cc.agent.filter.keywordPlaceholder')"
          clearable
          :prefix-icon="Search"
          style="width: 260px"
          @keyup.enter="loadAgents"
          @clear="loadAgents"
        />
        <el-select
          v-model="filter.status"
          :placeholder="t('cc.agent.filter.statusAll')"
          clearable
          style="width: 170px"
          @change="loadAgents"
        >
          <el-option
            v-for="s in statusOptions"
            :key="s.value"
            :label="s.label"
            :value="s.value"
          >
            <span class="status-dot" :style="{ background: s.color, color: s.color }"></span>
            <span style="margin-left: 4px">{{ s.label }}</span>
          </el-option>
        </el-select>
        <el-button :icon="Refresh" @click="resetFilter">{{ t('common.reset') }}</el-button>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" :icon="Plus" @click="handleAdd">{{ t('cc.agent.action.add') }}</el-button>
      </div>
    </div>

    <!-- 坐席列表 -->
    <el-table
      :data="agentList"
      v-loading="loading"
      class="agent-table"
      stripe
      style="width: 100%"
    >
      <el-table-column type="index" label="#" width="56" align="center" />
      <el-table-column :label="t('cc.agent.column.agentNo')" width="110">
        <template #default="{ row }">
          <span class="agent-no">{{ row.agentNo }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.agent.column.name')" min-width="180">
        <template #default="{ row }">
          <div class="agent-name-cell">
            <div class="avatar" :style="{ background: avatarBg(row.name) }">{{ row.name.slice(-2) }}</div>
            <div class="name-info">
              <div class="name">{{ row.name }}</div>
              <div class="dept">{{ row.deptName || '—' }}</div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="extension" :label="t('cc.agent.column.extension')" width="110">
        <template #default="{ row }">
          <span class="ext-no">{{ row.extension }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.agent.column.skillGroups')" min-width="220">
        <template #default="{ row }">
          <template v-if="row.skillGroupNames && row.skillGroupNames.length">
            <el-tag
              v-for="g in row.skillGroupNames"
              :key="g"
              class="skill-tag"
              size="small"
            >
              {{ g }}
            </el-tag>
          </template>
          <span v-else class="muted">{{ t('cc.agent.unassigned') }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.agent.column.status')" width="160">
        <template #default="{ row }">
          <el-tag :type="statusTagType(row.status)" effect="dark" round class="status-tag">
            <span class="status-dot" :style="{ background: statusColor(row.status), color: statusColor(row.status) }"></span>
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('cc.agent.column.onlineDuration')" width="140">
        <template #default="{ row }">
          <span class="duration">{{ onlineDuration(row) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('common.operation')" width="290" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">{{ t('common.edit') }}</el-button>
          <el-dropdown trigger="click" @command="(cmd) => handleStatusChange(row, cmd)">
            <el-button link type="warning" size="small">
              {{ t('cc.agent.action.switchStatus') }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <template v-if="availableTransitions(row.status).length">
                  <el-dropdown-item
                    v-for="tr in availableTransitions(row.status)"
                    :key="tr"
                    :command="tr"
                  >
                    <span class="status-dot" :style="{ background: statusColor(tr), color: statusColor(tr) }"></span>
                    {{ t('cc.agent.action.transitionTo', { label: statusLabel(tr) }) }}
                  </el-dropdown-item>
                </template>
                <el-dropdown-item v-else disabled>{{ t('cc.agent.action.noTransition') }}</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button link type="danger" size="small" @click="handleDelete(row)">{{ t('common.delete') }}</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty :description="t('cc.agent.empty')" />
      </template>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogMode === 'add' ? t('cc.agent.form.addTitle') : t('cc.agent.form.editTitle')"
      width="640px"
      destroy-on-close
      @closed="resetForm"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('cc.agent.form.agentNo')" prop="agentNo">
              <el-input v-model="form.agentNo" :placeholder="t('cc.agent.form.agentNoPlaceholder')" maxlength="8" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('cc.agent.form.name')" prop="name">
              <el-input v-model="form.name" :placeholder="t('cc.agent.form.namePlaceholder')" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('cc.agent.form.mobile')" prop="phone">
              <el-input v-model="form.phone" :placeholder="t('cc.agent.form.mobilePlaceholder')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('cc.agent.form.extension')" prop="extension">
              <el-input v-model="form.extension" :placeholder="t('cc.agent.form.extensionPlaceholder')" maxlength="6" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="t('cc.agent.form.skillGroups')" prop="skillGroupIds">
              <el-select
                v-model="form.skillGroupIds"
                multiple
                collapse-tags
                collapse-tags-tooltip
                :placeholder="t('cc.agent.form.skillGroupsPlaceholder')"
                style="width: 100%"
              >
                <el-option
                  v-for="g in skillGroups"
                  :key="g.id"
                  :label="g.name"
                  :value="g.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item :label="t('cc.agent.form.role')" prop="role">
              <el-radio-group v-model="form.role">
                <el-radio-button value="agent">{{ t('cc.agent.role.agent') }}</el-radio-button>
                <el-radio-button value="leader">{{ t('cc.agent.role.supervisor') }}</el-radio-button>
                <el-radio-button value="admin">{{ t('cc.agent.role.admin') }}</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  User,
  Headset,
  PhoneFilled,
  Coffee,
  Search,
  Refresh,
  Plus,
  ArrowDown
} from '@element-plus/icons-vue'
import {
  getAgents,
  addAgent,
  updateAgent,
  deleteAgent,
  changeAgentStatus,
  getSkillGroups,
  type Agent,
  type AgentStatus,
  type SkillGroup
} from '@/api/call-center'

const { t } = useI18n()

// ================== 状态机 ==================
// UI 层 7 种状态（任务规约要求）：
//   offline / ready / talking / break / afterwork / training / meeting
// API AgentStatus 仅有 5 种：offline / idle / busy / afterwork / break
// 通过下方两个映射函数互相转换。
type UiStatus =
  | 'offline'
  | 'ready'
  | 'talking'
  | 'break'
  | 'afterwork'
  | 'training'
  | 'meeting'

const fromApiStatus = (s: string): UiStatus => {
  if (s === 'idle') return 'ready'
  if (s === 'busy') return 'talking'
  return s as UiStatus
}
const toApiStatus = (s: UiStatus): AgentStatus => {
  if (s === 'ready') return 'idle'
  if (s === 'talking') return 'busy'
  // training / meeting 后端暂不支持，按 break 兜底，UI 层独立显示
  if (s === 'training' || s === 'meeting') return s as unknown as AgentStatus
  return s as AgentStatus
}

type StatusTag = '' | 'success' | 'warning' | 'info' | 'danger' | 'primary'
const STATUS_META = computed<Record<UiStatus, { label: string; tag: StatusTag; color: string }>>(() => ({
  offline:   { label: t('cc.agent.status.offline'),   tag: 'danger',  color: '#5E5A52' },
  ready:     { label: t('cc.agent.status.ready'),     tag: 'success', color: '#06D6A0' },
  talking:   { label: t('cc.agent.status.talking'),   tag: 'warning', color: '#FFD166' },
  break:     { label: t('cc.agent.status.break'),     tag: 'info',    color: '#8B7BFF' },
  afterwork: { label: t('cc.agent.status.afterwork'), tag: 'primary', color: '#D4AF37' },
  training:  { label: t('cc.agent.status.training'),  tag: 'info',    color: '#5B8DEF' },
  meeting:   { label: t('cc.agent.status.meeting'),   tag: 'info',    color: '#B76E79' }
}))

// 状态转换规则
const TRANSITIONS: Record<UiStatus, UiStatus[]> = {
  offline:   ['ready'],
  ready:     ['talking', 'break', 'training', 'meeting'],
  talking:   ['afterwork'],
  afterwork: ['ready', 'break'],
  break:     ['ready'],
  training:  ['ready'],
  meeting:   ['ready']
}

const statusOptions = computed(() => (Object.keys(STATUS_META.value) as UiStatus[]).map(k => ({
  value: k,
  label: STATUS_META.value[k].label,
  color: STATUS_META.value[k].color
})))

const statusLabel = (s: string) => STATUS_META.value[fromApiStatus(s)]?.label || s
const statusColor = (s: string) => STATUS_META.value[fromApiStatus(s)]?.color || '#888'
const statusTagType = (s: string) => STATUS_META.value[fromApiStatus(s)]?.tag || ''
const availableTransitions = (s: string): UiStatus[] => TRANSITIONS[fromApiStatus(s)] || []

// ================== 数据 ==================
const loading = ref(false)
const agentList = ref<Agent[]>([])
const skillGroups = ref<SkillGroup[]>([])
const filter = reactive<{ keyword: string; status: UiStatus | '' }>({
  keyword: '',
  status: ''
})

// 实时时钟（页头 + 在线时长）
const nowMs = ref(Date.now())
let timer: ReturnType<typeof setInterval> | null = null
const nowText = computed(() => {
  const d = new Date(nowMs.value)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
})

// 统计卡片
const stats = computed(() => {
  const list = agentList.value
  const cnt = (pred: (s: string) => boolean) => list.filter(a => pred(a.status)).length
  return [
    { key: 'online',  label: t('cc.agent.stats.online'),  value: cnt(s => fromApiStatus(s) !== 'offline'), icon: User },
    { key: 'ready',   label: t('cc.agent.stats.ready'),   value: cnt(s => fromApiStatus(s) === 'ready'),   icon: Headset },
    { key: 'talking', label: t('cc.agent.stats.talking'), value: cnt(s => fromApiStatus(s) === 'talking'), icon: PhoneFilled },
    { key: 'break',   label: t('cc.agent.stats.break'),   value: cnt(s => fromApiStatus(s) === 'break'),   icon: Coffee }
  ]
})

// ================== 加载 ==================
const loadAgents = async () => {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (filter.keyword) params.keyword = filter.keyword
    if (filter.status) params.status = toApiStatus(filter.status)
    const res = await getAgents(params as { keyword?: string; status?: AgentStatus })
    agentList.value = res.data.list
  } finally {
    loading.value = false
  }
}

const loadSkillGroups = async () => {
  const res = await getSkillGroups()
  skillGroups.value = res.data.list
}

const resetFilter = () => {
  filter.keyword = ''
  filter.status = ''
  loadAgents()
}

// ================== 在线时长 ==================
const onlineDuration = (row: Agent): string => {
  // 引用 nowMs 以保持响应式
  void nowMs.value
  if (!row.loginAt || fromApiStatus(row.status) === 'offline') return '—'
  const start = new Date(row.loginAt.replace(' ', 'T')).getTime()
  if (Number.isNaN(start)) return '—'
  const sec = Math.max(0, Math.floor((nowMs.value - start) / 1000))
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

// 头像背景（按姓名生成稳定渐变）
const avatarBg = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) & 0xffffff
  const palette = [
    'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(197,165,90,0.08))',
    'linear-gradient(135deg, rgba(91,141,239,0.25), rgba(91,141,239,0.06))',
    'linear-gradient(135deg, rgba(6,214,160,0.22),  rgba(6,214,160,0.05))',
    'linear-gradient(135deg, rgba(255,209,102,0.22),rgba(255,209,102,0.05))',
    'linear-gradient(135deg, rgba(183,110,121,0.22),rgba(183,110,121,0.05))'
  ]
  return palette[hash % palette.length]
}

// ================== 状态切换 ==================
const handleStatusChange = async (row: Agent, target: UiStatus) => {
  try {
    await changeAgentStatus(row.id, toApiStatus(target))
    row.status = toApiStatus(target)
    ElMessage.success(t('cc.agent.message.statusSwitched', { name: row.name, label: STATUS_META.value[target].label }))
  } catch {
    ElMessage.error(t('cc.agent.message.statusSwitchFailed'))
  }
}

// ================== 表单 ==================
const dialogVisible = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const form = reactive({
  id: 0,
  agentNo: '',
  name: '',
  phone: '',
  extension: '',
  skillGroupIds: [] as number[],
  role: 'agent' as 'agent' | 'leader' | 'admin'
})

const rules: FormRules = {
  agentNo: [
    { required: true, message: t('cc.agent.validation.agentNoRequired'), trigger: 'blur' },
    { pattern: /^\d{3,8}$/, message: t('cc.agent.validation.agentNoFormat'), trigger: 'blur' }
  ],
  name: [
    { required: true, message: t('cc.agent.validation.nameRequired'), trigger: 'blur' },
    { min: 2, max: 20, message: t('cc.agent.validation.nameLength'), trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1\d{10}$/, message: t('cc.agent.validation.mobileFormat'), trigger: 'blur' }
  ],
  extension: [
    { required: true, message: t('cc.agent.validation.extensionRequired'), trigger: 'blur' },
    { pattern: /^\d{3,6}$/, message: t('cc.agent.validation.extensionFormat'), trigger: 'blur' }
  ],
  skillGroupIds: [
    { type: 'array', required: true, message: t('cc.agent.validation.skillGroupsRequired'), trigger: 'change' }
  ],
  role: [
    { required: true, message: t('cc.agent.validation.roleRequired'), trigger: 'change' }
  ]
}

const resetForm = () => {
  form.id = 0
  form.agentNo = ''
  form.name = ''
  form.phone = ''
  form.extension = ''
  form.skillGroupIds = []
  form.role = 'agent'
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  dialogMode.value = 'add'
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (row: Agent) => {
  dialogMode.value = 'edit'
  resetForm()
  form.id = row.id
  form.agentNo = row.agentNo
  form.name = row.name
  form.phone = row.phone || ''
  form.extension = row.extension
  form.skillGroupIds = [...row.skillGroupIds]
  // role 字段后端模型暂未承载，默认为 agent
  form.role = ((row as unknown as { role?: 'agent' | 'leader' | 'admin' }).role) || 'agent'
  dialogVisible.value = true
}

const handleSubmit = () => {
  if (!formRef.value) return
  formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      const names = skillGroups.value
        .filter(g => form.skillGroupIds.includes(g.id))
        .map(g => g.name)
      const payload: Partial<Agent> = {
        agentNo: form.agentNo,
        name: form.name,
        phone: form.phone || undefined,
        extension: form.extension,
        skillGroupIds: [...form.skillGroupIds],
        skillGroupNames: names,
        sipAccount: 'sip' + form.agentNo,
        maxConcurrent: 1,
        enabled: true
      }
      if (dialogMode.value === 'add') {
        await addAgent(payload)
        ElMessage.success(t('cc.agent.message.addSuccess'))
      } else {
        await updateAgent({ id: form.id, ...payload })
        ElMessage.success(t('cc.agent.message.updateSuccess'))
      }
      dialogVisible.value = false
      loadAgents()
    } finally {
      submitting.value = false
    }
  })
}

const handleDelete = (row: Agent) => {
  ElMessageBox.confirm(
    t('cc.agent.message.deleteConfirm', { name: row.name, agentNo: row.agentNo }),
    t('common.confirmDelete'),
    { type: 'warning', confirmButtonText: t('common.delete'), cancelButtonText: t('common.cancel') }
  )
    .then(async () => {
      await deleteAgent(row.id)
      ElMessage.success(t('cc.agent.message.deleteSuccess'))
      loadAgents()
    })
    .catch(() => {})
}

// ================== 生命周期 ==================
onMounted(() => {
  loadSkillGroups()
  loadAgents()
  timer = setInterval(() => {
    nowMs.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.agent-page {
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
.header-aside {
  display: flex;
  align-items: center;
  gap: 10px;
}
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
  position: relative;
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

/* ============== 统计卡片 ============== */
.stats-row { margin-bottom: 20px; }
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  padding: 22px 24px;
  background: linear-gradient(135deg, rgba(26, 26, 36, 0.95) 0%, rgba(18, 18, 26, 0.95) 100%);
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
  border-color: var(--border-gold-hover, rgba(212, 175, 55, 0.4));
  box-shadow: var(--shadow-gold-hover, 0 8px 32px rgba(212, 175, 55, 0.25));
}
.stat-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  margin-right: 18px;
  flex-shrink: 0;
}
.stat-online .stat-icon  { background: rgba(6, 214, 160, 0.12);  color: #06D6A0; }
.stat-ready  .stat-icon  { background: rgba(91, 141, 239, 0.14); color: #5B8DEF; }
.stat-talking .stat-icon { background: rgba(255, 209, 102, 0.14); color: #FFD166; }
.stat-break .stat-icon   { background: rgba(139, 123, 255, 0.14); color: #8B7BFF; }

.stat-body { flex: 1; min-width: 0; }
.stat-label {
  font-size: 12px;
  letter-spacing: 4px;
  color: var(--text-body, #A09B8C);
  margin-bottom: 6px;
}
.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  color: var(--text-primary, #F0E6D3);
}
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
.stat-value .ratio {
  font-size: 12px;
  color: var(--text-muted, #5E5A52);
  margin-left: 4px;
  letter-spacing: 1px;
}
.stat-pulse {
  position: absolute;
  right: 18px;
  top: 18px;
  width: 8px;
  height: 8px;
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

/* ============== 工具栏 ============== */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  margin-bottom: 16px;
  background: var(--bg-card, #12121A);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
}
.toolbar-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* ============== 表格 ============== */
.agent-table {
  background: var(--bg-card, #12121A) !important;
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 12px;
  overflow: hidden;
}
:deep(.agent-table th.el-table__cell) {
  background: var(--bg-elevated, #1A1A24) !important;
  color: var(--gold-primary, #D4AF37) !important;
  font-weight: 600;
  letter-spacing: 1px;
  border-bottom: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
}
:deep(.agent-table tr) { background: transparent !important; }
:deep(.agent-table .el-table__row:hover td) {
  background: rgba(212, 175, 55, 0.04) !important;
}

.agent-no, .ext-no {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  color: var(--gold-primary, #D4AF37);
  font-weight: 600;
  letter-spacing: 1px;
}
.ext-no { color: var(--text-primary, #F0E6D3); font-weight: 500; }

.agent-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold-primary, #D4AF37);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  flex-shrink: 0;
}
.name-info { min-width: 0; }
.agent-name-cell .name {
  color: var(--text-primary, #F0E6D3);
  font-weight: 500;
}
.agent-name-cell .dept {
  font-size: 11px;
  color: var(--text-muted, #5E5A52);
  margin-top: 2px;
  letter-spacing: 0.5px;
}

.skill-tag {
  margin-right: 4px;
  margin-bottom: 2px;
  background: rgba(212, 175, 55, 0.06) !important;
  border-color: rgba(212, 175, 55, 0.2) !important;
  color: var(--gold-champagne, #C5A55A) !important;
}
.muted { color: var(--text-muted, #5E5A52); font-size: 12px; }

.duration {
  font-family: 'DIN Alternate', 'Courier New', monospace;
  color: var(--text-body, #A09B8C);
  letter-spacing: 1px;
}

.status-tag {
  display: inline-flex !important;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  height: 24px;
  line-height: 24px;
}
.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 2px;
  vertical-align: middle;
  box-shadow: 0 0 6px currentColor;
}

/* ============== 对话框微调 ============== */
:deep(.el-dialog__title) {
  color: var(--gold-primary, #D4AF37);
  letter-spacing: 2px;
  font-size: 16px;
}
:deep(.el-dialog__header) {
  border-bottom: 1px solid var(--border-gold, rgba(212, 175, 55, 0.15));
  padding-bottom: 14px;
}
:deep(.el-form-item__label) {
  color: var(--text-body, #A09B8C);
  letter-spacing: 1px;
}

/* 响应式 */
@media (max-width: 992px) {
  .stat-card { padding: 18px; }
  .stat-value .num { font-size: 26px; }
  .toolbar { flex-direction: column; align-items: stretch; gap: 12px; }
  .toolbar-left { flex-wrap: wrap; }
}
</style>

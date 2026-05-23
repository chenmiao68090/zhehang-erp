<template>
  <div class="skill-page">
    <!-- 装饰：左上角徽记 -->
    <div class="page-mark">
      <span class="mark-en">{{ t('cc.skill.ext.markEn') }}</span>
      <span class="mark-cn">{{ t('cc.skill.ext.markCn') }}</span>
    </div>

    <!-- 顶部统计 -->
    <div class="stat-row">
      <div
        v-for="(s, i) in stats"
        :key="s.key"
        class="stat-card"
        :class="'tone-' + s.key"
        :style="{ animationDelay: i * 70 + 'ms' }"
      >
        <div class="stat-icon"><el-icon><component :is="s.icon" /></el-icon></div>
        <div class="stat-body">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">
            <span class="num">{{ s.value }}</span>
            <span class="unit">{{ s.unit }}</span>
          </div>
          <div class="stat-trend">{{ s.trend }}</div>
        </div>
        <svg class="stat-spark" viewBox="0 0 80 24" preserveAspectRatio="none">
          <polyline :points="s.spark" fill="none" stroke="currentColor" stroke-width="1.4" />
        </svg>
      </div>
    </div>

    <!-- 主面板 -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">
          <span class="ornament">❖</span>
          <span class="text">{{ t('cc.skill.ext.panelTitle') }}</span>
          <span class="hint">{{ t('cc.skill.ext.panelHint') }}</span>
        </div>
        <div class="panel-tools">
          <el-input
            v-model="keyword"
            :placeholder="t('cc.skill.ext.searchPlaceholder')"
            clearable
            class="search-input"
            @keyup.enter="loadList"
            @clear="loadList"
          >
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-button class="btn-ghost" @click="loadList">
            <el-icon><Refresh /></el-icon>&nbsp;{{ t('cc.skill.ext.refreshBtn') }}
          </el-button>
          <el-button class="btn-gold" @click="openCreate">
            <el-icon><Plus /></el-icon>&nbsp;{{ t('cc.skill.ext.createBtn') }}
          </el-button>
        </div>
      </div>

      <el-table :data="list" v-loading="loading" class="gold-table" stripe row-key="id">
        <el-table-column type="index" label="#" width="56" align="center" />
        <el-table-column :label="t('cc.skill.ext.colSkill')" min-width="260">
          <template #default="{ row }">
            <div class="name-cell">
              <div class="name-badge" :style="{ background: badgeBg(row.id) }">
                {{ (row.name || '·').slice(0, 1) }}
              </div>
              <div class="name-info">
                <div class="name-main">
                  {{ row.name }}
                  <span class="name-tag">{{ row.code }}</span>
                </div>
                <div class="name-sub">{{ row.description || '—' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.skill.ext.colStrategy')" min-width="160">
          <template #default="{ row }">
            <span class="strategy-pill">
              <span class="strategy-dot"></span>{{ strategyLabel(row.strategy) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.skill.ext.colMembers')" width="120" align="center">
          <template #default="{ row }">
            <span class="m-num">{{ row.agentCount }}</span><span class="m-unit"> {{ t('cc.skill.ext.colMemberUnit') }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.skill.ext.colCurrentQueue')" width="150" align="center">
          <template #default="{ row }">
            <div class="queue-cell" :class="queueClass(row)">
              <span class="q-now">{{ row.currentQueue }}</span>
              <span class="q-divider">/</span>
              <span class="q-max">{{ row.maxQueue }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('cc.skill.ext.colStatus')" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.enabled"
              :active-color="'#D4AF37'"
              :inactive-color="'#3a3a44'"
              @change="onToggle(row)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('cc.skill.ext.colCreatedAt')" width="170" />
        <el-table-column :label="t('cc.skill.ext.colOperation')" fixed="right" width="270" align="center">
          <template #default="{ row }">
            <el-button link class="op" @click="openEdit(row)">{{ t('cc.skill.ext.btnEdit') }}</el-button>
            <el-divider direction="vertical" />
            <el-button link class="op" @click="openMembers(row)">{{ t('cc.skill.ext.btnMembers') }}</el-button>
            <el-divider direction="vertical" />
            <el-button link class="op" @click="openQueue(row)">{{ t('cc.skill.ext.btnQueue') }}</el-button>
            <el-divider direction="vertical" />
            <el-button link class="op danger" @click="onDelete(row)">{{ t('cc.skill.ext.btnDelete') }}</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <div class="empty-cell">
            <span class="empty-glyph">∅</span>
            <span class="empty-text">{{ t('cc.skill.ext.emptyText') }}</span>
          </div>
        </template>
      </el-table>
    </div>

    <!-- 新建/编辑技能组 -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'edit' ? t('cc.skill.ext.dlgEditTitle') : t('cc.skill.ext.dlgCreateTitle')"
      width="900px"
      class="gold-dialog"
      :close-on-click-modal="false"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" label-position="right">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="t('cc.skill.ext.labelName')" prop="name">
              <el-input v-model="form.name" :placeholder="t('cc.skill.ext.phName')" maxlength="32" show-word-limit />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('cc.skill.ext.labelCode')" prop="code">
              <el-input v-model="form.code" :placeholder="t('cc.skill.ext.phCode')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('cc.skill.ext.labelDesc')">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="2"
            :placeholder="t('cc.skill.ext.phDesc')"
          />
        </el-form-item>
        <el-form-item :label="t('cc.skill.ext.labelStrategy')" prop="strategy" class="strategy-form-item">
          <div class="strategy-grid">
            <div
              v-for="opt in strategyOptions"
              :key="opt.value"
              class="strategy-card"
              :class="{ active: form.strategy === opt.value }"
              @click="form.strategy = opt.value"
            >
              <div class="sc-head">
                <div class="sc-icon">{{ opt.glyph }}</div>
                <div class="sc-title">{{ opt.label }}</div>
              </div>
              <div class="sc-desc">{{ opt.desc }}</div>
              <div class="sc-check"><el-icon><Check /></el-icon></div>
            </div>
          </div>
        </el-form-item>
        <el-row :gutter="20" v-if="needWeight || needPriority">
          <el-col :span="12" v-if="needWeight">
            <el-form-item :label="t('cc.skill.ext.labelWeight')">
              <el-input-number v-model="form.weight" :min="1" :max="100" controls-position="right" />
              <span class="form-hint">{{ t('cc.skill.ext.hintWeight') }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="needPriority">
            <el-form-item :label="t('cc.skill.ext.labelPriority')">
              <el-input-number v-model="form.priority" :min="1" :max="10" controls-position="right" />
              <span class="form-hint">{{ t('cc.skill.ext.hintPriority') }}</span>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button class="btn-ghost" @click="formVisible = false">{{ t('cc.skill.ext.btnCancel') }}</el-button>
        <el-button class="btn-gold" :loading="saving" @click="submitForm">{{ t('cc.skill.ext.btnSave') }}</el-button>
      </template>
    </el-dialog>

    <!-- 成员管理 -->
    <el-dialog
      v-model="memberVisible"
      :title="t('cc.skill.ext.memberDlgPrefix') + (currentRow?.name || '')"
      width="780px"
      class="gold-dialog"
    >
      <div class="member-tip">
        {{ t('cc.skill.ext.memberTip') }}
      </div>
      <el-transfer
        v-model="memberSelected"
        :data="agentTransferData"
        filterable
        :filter-placeholder="t('cc.skill.ext.filterAgent')"
        :titles="[t('cc.skill.ext.transferLeft'), t('cc.skill.ext.transferRight')]"
        :button-texts="[t('cc.skill.ext.btnRemove'), t('cc.skill.ext.btnAdd')]"
        class="gold-transfer"
      />
      <template #footer>
        <el-button class="btn-ghost" @click="memberVisible = false">{{ t('cc.skill.ext.btnCancel') }}</el-button>
        <el-button class="btn-gold" @click="saveMembers">
          {{ t('cc.skill.ext.btnSaveMember') }}（{{ memberSelected.length }} {{ t('cc.skill.ext.memberUnit') }}）
        </el-button>
      </template>
    </el-dialog>

    <!-- 排队规则配置 -->
    <el-dialog
      v-model="queueVisible"
      :title="t('cc.skill.ext.queueDlgPrefix') + (currentRow?.name || '')"
      width="640px"
      class="gold-dialog"
    >
      <el-form :model="queueForm" label-width="130px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item :label="t('cc.skill.ext.labelMaxQueue')">
              <el-input-number v-model="queueForm.maxQueue" :min="0" :max="200" controls-position="right" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="t('cc.skill.ext.labelTimeoutSec')">
              <el-input-number v-model="queueForm.timeoutSec" :min="5" :max="600" controls-position="right" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item :label="t('cc.skill.ext.labelTimeoutAction')">
          <el-radio-group v-model="queueForm.timeoutAction" class="q-radio">
            <el-radio-button value="transfer">{{ t('cc.skill.ext.actTransfer') }}</el-radio-button>
            <el-radio-button value="hangup">{{ t('cc.skill.ext.actHangup') }}</el-radio-button>
            <el-radio-button value="voicemail">{{ t('cc.skill.ext.actVoicemail') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('cc.skill.ext.labelTransferTo')" v-if="queueForm.timeoutAction === 'transfer'">
          <el-select v-model="queueForm.transferTo" :placeholder="t('cc.skill.ext.phTransferTo')" style="width: 100%">
            <el-option
              v-for="g in list.filter((x) => x.id !== currentRow?.id)"
              :key="g.id"
              :label="g.name"
              :value="g.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('cc.skill.ext.labelMusic')">
          <el-select v-model="queueForm.musicId" style="width: 100%">
            <el-option v-for="m in musicList" :key="m.value" :label="m.label" :value="m.value">
              <span class="music-opt">
                <i class="music-glyph">♪</i>{{ m.label }}
                <span class="music-meta">{{ m.meta }}</span>
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="t('cc.skill.ext.labelAnnouncement')">
          <el-input
            v-model="queueForm.announcement"
            type="textarea"
            :rows="3"
            :placeholder="t('cc.skill.ext.phAnnouncement')"
            maxlength="120"
            show-word-limit
          />
        </el-form-item>
        <el-form-item :label="t('cc.skill.ext.labelOverflow')">
          <el-radio-group v-model="queueForm.overflow" class="q-radio">
            <el-radio-button value="reject">{{ t('cc.skill.ext.ovReject') }}</el-radio-button>
            <el-radio-button value="voicemail">{{ t('cc.skill.ext.ovVoicemail') }}</el-radio-button>
            <el-radio-button value="callback">{{ t('cc.skill.ext.ovCallback') }}</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button class="btn-ghost" @click="queueVisible = false">{{ t('cc.skill.ext.btnCancel') }}</el-button>
        <el-button class="btn-gold" @click="saveQueue">{{ t('cc.skill.ext.btnSaveQueue') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Search,
  Refresh,
  Plus,
  Check,
  User,
  Connection,
  Headset,
  BellFilled
} from '@element-plus/icons-vue'
import {
  getSkillGroups,
  addSkillGroup,
  updateSkillGroup,
  getAgents,
  type SkillGroup,
  type Agent
} from '@/api/call-center'

const { t } = useI18n()

interface SkillRow extends SkillGroup {
  currentQueue: number
}

const list = ref<SkillRow[]>([])
const loading = ref(false)
const keyword = ref('')

const sparkLines = [
  '0,18 10,14 20,16 30,8 40,12 50,6 60,10 70,4 80,8',
  '0,12 10,16 20,10 30,14 40,8 50,12 60,6 70,10 80,4',
  '0,16 10,10 20,14 30,6 40,10 50,4 60,8 70,12 80,6',
  '0,8 10,14 20,6 30,12 40,4 50,10 60,16 70,8 80,12'
]

const stats = computed(() => {
  const total = list.value.length
  const active = list.value.filter((x) => x.enabled).length
  const agents = list.value.reduce((s, x) => s + (x.agentCount || 0), 0)
  const queues = list.value.reduce((s, x) => s + (x.currentQueue || 0), 0)
  return [
    { key: 'total', label: t('cc.skill.ext.stat.total'), value: total, unit: t('cc.skill.ext.stat.unitGroup'), icon: Connection, trend: t('cc.skill.ext.stat.trendTotal'), spark: sparkLines[0] },
    { key: 'active', label: t('cc.skill.ext.stat.active'), value: active, unit: t('cc.skill.ext.stat.unitGroup'), icon: BellFilled, trend: t('cc.skill.ext.stat.trendActive'), spark: sparkLines[1] },
    { key: 'agents', label: t('cc.skill.ext.stat.agents'), value: agents, unit: t('cc.skill.ext.stat.unitPerson'), icon: Headset, trend: t('cc.skill.ext.stat.trendAgents'), spark: sparkLines[2] },
    { key: 'queues', label: t('cc.skill.ext.stat.queues'), value: queues, unit: t('cc.skill.ext.stat.unitCall'), icon: User, trend: t('cc.skill.ext.stat.trendQueues'), spark: sparkLines[3] }
  ]
})

const strategyOptions = computed(() => [
  { value: 'round_robin', label: t('cc.skill.ext.strategyOpt.round_robin'), glyph: '⟳', desc: t('cc.skill.ext.strategyOpt.round_robin_desc') },
  { value: 'longest_idle', label: t('cc.skill.ext.strategyOpt.longest_idle'), glyph: '◌', desc: t('cc.skill.ext.strategyOpt.longest_idle_desc') },
  { value: 'skill_first', label: t('cc.skill.ext.strategyOpt.skill_first'), glyph: '★', desc: t('cc.skill.ext.strategyOpt.skill_first_desc') },
  { value: 'random', label: t('cc.skill.ext.strategyOpt.random'), glyph: '✦', desc: t('cc.skill.ext.strategyOpt.random_desc') },
  { value: 'weighted_round_robin', label: t('cc.skill.ext.strategyOpt.weighted_round_robin'), glyph: '⚖', desc: t('cc.skill.ext.strategyOpt.weighted_round_robin_desc') },
  { value: 'least_calls', label: t('cc.skill.ext.strategyOpt.least_calls'), glyph: '↓', desc: t('cc.skill.ext.strategyOpt.least_calls_desc') },
  { value: 'priority', label: t('cc.skill.ext.strategyOpt.priority'), glyph: '⬆', desc: t('cc.skill.ext.strategyOpt.priority_desc') },
  { value: 'memory_optimal', label: t('cc.skill.ext.strategyOpt.memory_optimal'), glyph: '✺', desc: t('cc.skill.ext.strategyOpt.memory_optimal_desc') }
])

const strategyAlias: Record<string, string> = {
  'round-robin': 'round_robin',
  'least-busy': 'least_calls',
  priority: 'priority',
  'longest-idle': 'longest_idle',
  'skill-based': 'skill_first'
}

const strategyLabel = (s: string) => {
  const key = strategyAlias[s] || s
  return strategyOptions.value.find((o) => o.value === key)?.label || s
}

const queueClass = (r: SkillRow) => {
  if (!r.maxQueue) return 'empty'
  const ratio = r.currentQueue / r.maxQueue
  if (ratio >= 0.8) return 'danger'
  if (ratio >= 0.4) return 'warning'
  return 'normal'
}

const badgeBg = (id: number) => {
  const palette = [
    'linear-gradient(135deg,#D4AF37,#8B7355)',
    'linear-gradient(135deg,#B76E79,#7a4855)',
    'linear-gradient(135deg,#5B8DEF,#3a5a9e)',
    'linear-gradient(135deg,#00D084,#067553)',
    'linear-gradient(135deg,#C5A55A,#7a6438)'
  ]
  return palette[id % palette.length]
}

const simQueue = (s: SkillGroup) => {
  if (!s.maxQueue) return 0
  const seed = (s.id * 17 + s.agentCount * 3) % 11
  return Math.min(seed, s.maxQueue)
}

const loadList = async () => {
  loading.value = true
  try {
    const res = await getSkillGroups({ keyword: keyword.value || undefined })
    list.value = (res.data.list || []).map((s) => ({ ...s, currentQueue: simQueue(s) }))
  } finally {
    loading.value = false
  }
}

// ---- 表单 ----
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const formRef = ref<FormInstance>()
const saving = ref(false)
const currentRow = ref<SkillRow | null>(null)

const form = reactive({
  id: 0,
  name: '',
  code: '',
  description: '',
  strategy: 'round_robin',
  weight: 10,
  priority: 5
})

const rules: FormRules = {
  name: [{ required: true, message: t('cc.skill.ext.msg.validName'), trigger: 'blur' }],
  code: [{ required: true, message: t('cc.skill.ext.msg.validCode'), trigger: 'blur' }],
  strategy: [{ required: true, message: t('cc.skill.ext.msg.validStrategy'), trigger: 'change' }]
}

const needWeight = computed(() => form.strategy === 'weighted_round_robin')
const needPriority = computed(() => form.strategy === 'priority')

const resetForm = () => {
  form.id = 0
  form.name = ''
  form.code = ''
  form.description = ''
  form.strategy = 'round_robin'
  form.weight = 10
  form.priority = 5
}

const openCreate = () => {
  formMode.value = 'create'
  resetForm()
  formVisible.value = true
}

const openEdit = (row: SkillRow) => {
  formMode.value = 'edit'
  currentRow.value = row
  Object.assign(form, {
    id: row.id,
    name: row.name,
    code: row.code,
    description: row.description || '',
    strategy: strategyAlias[row.strategy] || row.strategy,
    weight: 10,
    priority: 5
  })
  formVisible.value = true
}

const reverseAlias: Record<string, SkillGroup['strategy']> = {
  round_robin: 'round-robin',
  longest_idle: 'longest-idle',
  skill_first: 'skill-based',
  priority: 'priority',
  least_calls: 'least-busy',
  random: 'round-robin',
  weighted_round_robin: 'round-robin',
  memory_optimal: 'least-busy'
}

const submitForm = async () => {
  if (!formRef.value) return
  const ok = await formRef.value.validate().catch(() => false)
  if (!ok) return
  saving.value = true
  try {
    const payload: Partial<SkillGroup> = {
      name: form.name,
      code: form.code,
      description: form.description,
      strategy: reverseAlias[form.strategy] || 'round-robin'
    }
    if (formMode.value === 'edit') {
      await updateSkillGroup({ id: form.id, ...payload })
      ElMessage.success(t('cc.skill.ext.msg.updateSuccess'))
    } else {
      await addSkillGroup(payload)
      ElMessage.success(t('cc.skill.ext.msg.createSuccess'))
    }
    formVisible.value = false
    await loadList()
  } finally {
    saving.value = false
  }
}

const onToggle = async (row: SkillRow) => {
  await updateSkillGroup({ id: row.id, enabled: row.enabled })
  ElMessage.success(row.enabled ? t('cc.skill.ext.msg.enableSuccess') : t('cc.skill.ext.msg.disableSuccess'))
}

const onDelete = (row: SkillRow) => {
  ElMessageBox.confirm(t('cc.skill.message.deleteConfirm', { name: row.name }) + t('cc.skill.ext.msg.deleteConfirmText'), t('cc.skill.ext.msg.deleteTitle'), {
    type: 'warning',
    confirmButtonText: t('cc.skill.ext.btnDelete'),
    cancelButtonText: t('cc.skill.ext.btnCancel'),
    confirmButtonClass: 'el-button--danger'
  })
    .then(() => {
      list.value = list.value.filter((x) => x.id !== row.id)
      ElMessage.success(t('cc.skill.ext.msg.deleteSuccess'))
    })
    .catch(() => {})
}

// ---- 成员管理 ----
const memberVisible = ref(false)
const memberSelected = ref<number[]>([])
const allAgents = ref<Agent[]>([])

const agentTransferData = computed(() =>
  allAgents.value.map((a) => ({
    key: a.id,
    label: a.agentNo + ' · ' + a.name,
    disabled: !a.enabled
  }))
)

const openMembers = async (row: SkillRow) => {
  currentRow.value = row
  const res = await getAgents()
  allAgents.value = res.data.list
  memberSelected.value = allAgents.value
    .filter((a) => a.skillGroupIds.includes(row.id))
    .map((a) => a.id)
  memberVisible.value = true
}

const saveMembers = async () => {
  if (!currentRow.value) return
  currentRow.value.agentCount = memberSelected.value.length
  ElMessage.success(`${t('cc.skill.ext.msg.saveMemberOk')} ${memberSelected.value.length} ${t('cc.skill.ext.msg.agentsTo')}「${currentRow.value.name}」`)
  memberVisible.value = false
}

// ---- 排队规则 ----
const queueVisible = ref(false)
const queueForm = reactive({
  maxQueue: 20,
  timeoutSec: 60,
  timeoutAction: 'transfer' as 'transfer' | 'hangup' | 'voicemail',
  transferTo: undefined as number | undefined,
  musicId: 'default',
  announcement: t('cc.skill.ext.phAnnouncement'),
  overflow: 'voicemail' as 'reject' | 'voicemail' | 'callback'
})

const musicList = computed(() => [
  { value: 'default', label: t('cc.skill.ext.music.default'), meta: t('cc.skill.ext.music.defaultMeta') },
  { value: 'canon', label: t('cc.skill.ext.music.canon'), meta: t('cc.skill.ext.music.canonMeta') },
  { value: 'jazz', label: t('cc.skill.ext.music.jazz'), meta: t('cc.skill.ext.music.jazzMeta') },
  { value: 'brand', label: t('cc.skill.ext.music.brand'), meta: t('cc.skill.ext.music.brandMeta') }
])

const openQueue = (row: SkillRow) => {
  currentRow.value = row
  queueForm.maxQueue = row.maxQueue || 20
  queueForm.timeoutSec = row.timeoutSec || 60
  queueForm.timeoutAction = 'transfer'
  queueForm.transferTo = undefined
  queueForm.musicId = 'default'
  queueForm.announcement = t('cc.skill.ext.phAnnouncement')
  queueForm.overflow = 'voicemail'
  queueVisible.value = true
}

const saveQueue = async () => {
  if (!currentRow.value) return
  await updateSkillGroup({
    id: currentRow.value.id,
    maxQueue: queueForm.maxQueue,
    timeoutSec: queueForm.timeoutSec
  })
  currentRow.value.maxQueue = queueForm.maxQueue
  currentRow.value.timeoutSec = queueForm.timeoutSec
  ElMessage.success(t('cc.skill.ext.msg.queueRuleSaved'))
  queueVisible.value = false
}

onMounted(loadList)
</script>

<style scoped>
.skill-page {
  padding: 18px 22px 30px;
  background:
    radial-gradient(1200px 600px at 100% -10%, rgba(212, 175, 55, 0.08), transparent 60%),
    radial-gradient(800px 500px at -10% 110%, rgba(183, 110, 121, 0.06), transparent 60%),
    #0a0a0f;
  min-height: calc(100vh - 80px);
  color: #e8e2d3;
  position: relative;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
}
.skill-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at top right, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse at top right, black 30%, transparent 70%);
  z-index: 0;
}

.page-mark {
  position: absolute;
  top: 14px;
  right: 30px;
  text-align: right;
  z-index: 2;
  pointer-events: none;
}
.page-mark .mark-en {
  display: block;
  font-family: 'Cormorant Garamond', 'Playfair Display', serif;
  font-size: 11px;
  letter-spacing: 4px;
  color: #6c6452;
}
.page-mark .mark-cn {
  display: block;
  font-size: 11px;
  letter-spacing: 6px;
  color: #4a4639;
  margin-top: 2px;
}

/* Stats */
.stat-row {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 18px;
}
.stat-card {
  position: relative;
  background: linear-gradient(160deg, rgba(26, 26, 36, 0.95), rgba(18, 18, 26, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 14px;
  padding: 16px 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  overflow: hidden;
  animation: cardIn 0.55s cubic-bezier(0.22, 0.85, 0.3, 1.05) both;
  transition: all 0.3s ease;
}
.stat-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-2px);
  box-shadow:
    0 10px 28px rgba(212, 175, 55, 0.12),
    0 0 0 1px rgba(212, 175, 55, 0.3) inset;
}
.stat-card::after {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 130px;
  height: 130px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.16), transparent 70%);
  pointer-events: none;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04));
  color: #d4af37;
  font-size: 22px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  flex-shrink: 0;
}
.tone-active .stat-icon {
  color: #00d084;
  border-color: rgba(0, 208, 132, 0.3);
  background: linear-gradient(135deg, rgba(0, 208, 132, 0.16), rgba(0, 208, 132, 0.02));
}
.tone-agents .stat-icon {
  color: #5b8def;
  border-color: rgba(91, 141, 239, 0.3);
  background: linear-gradient(135deg, rgba(91, 141, 239, 0.16), rgba(91, 141, 239, 0.02));
}
.tone-queues .stat-icon {
  color: #b76e79;
  border-color: rgba(183, 110, 121, 0.3);
  background: linear-gradient(135deg, rgba(183, 110, 121, 0.16), rgba(183, 110, 121, 0.02));
}
.stat-body {
  flex: 1;
  min-width: 0;
}
.stat-label {
  font-size: 12px;
  color: #8b8270;
  letter-spacing: 2px;
}
.stat-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-top: 4px;
}
.stat-value .num {
  font-size: 30px;
  font-weight: 700;
  font-family: 'Cormorant Garamond', 'Playfair Display', 'Times New Roman', serif;
  background: linear-gradient(180deg, #f4d976 0%, #d4af37 60%, #8b7355 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  letter-spacing: 1px;
  line-height: 1.05;
}
.tone-active .stat-value .num {
  background: linear-gradient(180deg, #6fffba 0%, #00d084 60%, #067553 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.tone-agents .stat-value .num {
  background: linear-gradient(180deg, #9bbcff 0%, #5b8def 60%, #3a5a9e 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.tone-queues .stat-value .num {
  background: linear-gradient(180deg, #e6b1bb 0%, #b76e79 60%, #7a4855 100%);
  -webkit-background-clip: text;
  background-clip: text;
}
.stat-value .unit {
  font-size: 12px;
  color: #8b8270;
}
.stat-trend {
  font-size: 11px;
  color: #6c6452;
  margin-top: 4px;
  letter-spacing: 1px;
}
.stat-spark {
  position: absolute;
  bottom: 8px;
  right: 12px;
  width: 80px;
  height: 24px;
  color: rgba(212, 175, 55, 0.5);
  opacity: 0.7;
}
.tone-active .stat-spark { color: rgba(0, 208, 132, 0.55); }
.tone-agents .stat-spark { color: rgba(91, 141, 239, 0.55); }
.tone-queues .stat-spark { color: rgba(183, 110, 121, 0.55); }

@keyframes cardIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Panel */
.panel {
  position: relative;
  z-index: 1;
  background: linear-gradient(180deg, rgba(18, 18, 26, 0.92), rgba(13, 13, 20, 0.92));
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 16px;
  padding: 18px;
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  gap: 16px;
  flex-wrap: wrap;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.panel-title .ornament {
  color: #d4af37;
  font-size: 18px;
  text-shadow: 0 0 12px rgba(212, 175, 55, 0.5);
}
.panel-title .text {
  font-family: 'Cormorant Garamond', 'Songti SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: #e8d9a6;
  letter-spacing: 3px;
}
.panel-title .hint {
  font-size: 11px;
  color: #6c6452;
  padding-left: 12px;
  border-left: 1px solid rgba(212, 175, 55, 0.2);
  letter-spacing: 1px;
}
.panel-tools {
  display: flex;
  gap: 10px;
  align-items: center;
}
.search-input {
  width: 280px;
}

/* Element overrides */
:deep(.el-input__wrapper) {
  background: rgba(10, 10, 15, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2) inset !important;
}
:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.6) inset !important;
}
:deep(.el-input__inner) {
  color: #e8e2d3 !important;
}
:deep(.el-input__inner::placeholder) {
  color: #5a5447 !important;
}
:deep(.el-textarea__inner) {
  background: rgba(10, 10, 15, 0.6) !important;
  color: #e8e2d3 !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2) inset !important;
}
:deep(.el-textarea__inner::placeholder) {
  color: #5a5447 !important;
}

.btn-gold {
  background: linear-gradient(135deg, #d4af37, #b58c2e) !important;
  border: 1px solid #b58c2e !important;
  color: #1a1208 !important;
  font-weight: 600;
  letter-spacing: 1px;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
}
.btn-gold:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}
.btn-ghost {
  background: transparent !important;
  border: 1px solid rgba(212, 175, 55, 0.35) !important;
  color: #d4af37 !important;
}
.btn-ghost:hover {
  background: rgba(212, 175, 55, 0.08) !important;
  border-color: rgba(212, 175, 55, 0.6) !important;
}

/* Table */
.gold-table {
  --el-table-border-color: rgba(212, 175, 55, 0.1);
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.06);
  background: transparent !important;
}
:deep(.gold-table) { background: transparent; }
:deep(.gold-table th.el-table__cell) {
  background: linear-gradient(180deg, #1a1a24, #14141c) !important;
  color: #d4af37 !important;
  font-weight: 600;
  letter-spacing: 2px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.25);
}
:deep(.gold-table td.el-table__cell) {
  background: transparent !important;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.08);
  color: #c9c0ab;
}
:deep(.gold-table .el-table__inner-wrapper::before) { display: none; }
:deep(.gold-table--enable-row-hover .el-table__body tr:hover > td.el-table__cell) {
  background: rgba(212, 175, 55, 0.05) !important;
}
:deep(.gold-table--striped .el-table__body tr.el-table__row--striped td.el-table__cell) {
  background: rgba(212, 175, 55, 0.025) !important;
}

.name-cell {
  display: flex;
  gap: 12px;
  align-items: center;
}
.name-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.4) inset,
    0 0 0 1px rgba(212, 175, 55, 0.3);
  flex-shrink: 0;
}
.name-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.name-main {
  color: #e8d9a6;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.name-tag {
  font-size: 10px;
  font-weight: 400;
  color: #8b8270;
  padding: 1px 6px;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
}
.name-sub {
  color: #6c6452;
  font-size: 11px;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 240px;
}

.strategy-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 100px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid rgba(212, 175, 55, 0.22);
  color: #d4af37;
  font-size: 12px;
  letter-spacing: 1px;
}
.strategy-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #d4af37;
  box-shadow: 0 0 6px #d4af37;
}

.m-num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 22px;
  font-weight: 700;
  color: #e8d9a6;
}
.m-unit {
  color: #6c6452;
  font-size: 12px;
}

.queue-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 6px;
  font-family: 'Cormorant Garamond', serif;
  min-width: 70px;
  justify-content: center;
}
.queue-cell.empty { color: #555; }
.queue-cell.normal { color: #00d084; background: rgba(0, 208, 132, 0.08); }
.queue-cell.warning { color: #d4af37; background: rgba(212, 175, 55, 0.1); }
.queue-cell.danger {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  animation: pulseQ 1.4s ease-in-out infinite;
}
.q-now { font-size: 18px; font-weight: 700; }
.q-divider, .q-max { font-size: 12px; opacity: 0.6; }

@keyframes pulseQ {
  50% { box-shadow: 0 0 0 4px rgba(255, 107, 107, 0.15); }
}

.op {
  color: #d4af37 !important;
  padding: 0 4px !important;
  font-size: 12px !important;
}
.op:hover { color: #f4d976 !important; }
.op.danger { color: #ff6b6b !important; }
.op.danger:hover { color: #ff8c8c !important; }
:deep(.el-divider--vertical) {
  border-color: rgba(212, 175, 55, 0.2);
  margin: 0 2px;
}

.empty-cell {
  padding: 50px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.empty-glyph {
  font-size: 42px;
  color: rgba(212, 175, 55, 0.3);
  font-family: 'Cormorant Garamond', serif;
}
.empty-text {
  color: #6c6452;
  font-size: 13px;
  letter-spacing: 1px;
}

/* Dialog */
:deep(.gold-dialog) {
  --el-dialog-bg-color: transparent;
}
:deep(.gold-dialog .el-dialog) {
  background: linear-gradient(180deg, #14141c, #0d0d14) !important;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 14px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(212, 175, 55, 0.15) inset;
  overflow: hidden;
}
:deep(.gold-dialog .el-dialog__header) {
  border-bottom: 1px solid rgba(212, 175, 55, 0.2);
  padding: 18px 22px;
  margin: 0;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08), transparent);
}
:deep(.gold-dialog .el-dialog__title) {
  color: #e8d9a6;
  font-family: 'Cormorant Garamond', 'Songti SC', serif;
  font-size: 20px;
  letter-spacing: 3px;
  font-weight: 600;
}
:deep(.gold-dialog .el-dialog__body) {
  padding: 22px 24px;
  color: #c9c0ab;
}
:deep(.gold-dialog .el-dialog__footer) {
  padding: 14px 22px 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);
}
:deep(.gold-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: #8b8270;
}
:deep(.gold-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  color: #d4af37;
}
:deep(.el-form-item__label) {
  color: #b9af96 !important;
  font-weight: 500;
}
:deep(.el-radio-button__inner) {
  background: rgba(10, 10, 15, 0.6) !important;
  border-color: rgba(212, 175, 55, 0.25) !important;
  color: #c9c0ab !important;
}
:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left-color: rgba(212, 175, 55, 0.25) !important;
}
:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: linear-gradient(135deg, #d4af37, #b58c2e) !important;
  color: #1a1208 !important;
  box-shadow: -1px 0 0 0 #d4af37 !important;
  border-color: #d4af37 !important;
}
:deep(.el-input-number) { width: 100%; }
:deep(.el-input-number .el-input__wrapper) {
  background: rgba(10, 10, 15, 0.6) !important;
}
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background: rgba(212, 175, 55, 0.08) !important;
  color: #d4af37 !important;
  border-color: rgba(212, 175, 55, 0.2) !important;
}
:deep(.el-select__wrapper) {
  background: rgba(10, 10, 15, 0.6) !important;
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2) inset !important;
}
:deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.6) inset !important;
}
:deep(.el-select__placeholder) { color: #5a5447 !important; }
:deep(.el-switch.is-checked .el-switch__core) {
  background: linear-gradient(135deg, #d4af37, #b58c2e) !important;
  border-color: #d4af37 !important;
}

/* Strategy cards */
.strategy-form-item :deep(.el-form-item__content) {
  line-height: 1.4;
}
.strategy-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  width: 100%;
}
.strategy-card {
  position: relative;
  padding: 12px 12px 14px;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 10px;
  cursor: pointer;
  background: rgba(10, 10, 15, 0.5);
  transition: all 0.25s ease;
  overflow: hidden;
}
.strategy-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent 60%, rgba(212, 175, 55, 0.05));
  opacity: 0;
  transition: opacity 0.3s ease;
}
.strategy-card:hover {
  border-color: rgba(212, 175, 55, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
}
.strategy-card:hover::before { opacity: 1; }
.strategy-card.active {
  border-color: #d4af37;
  background: linear-gradient(160deg, rgba(212, 175, 55, 0.15), rgba(212, 175, 55, 0.04));
  box-shadow:
    0 0 0 1px rgba(212, 175, 55, 0.4),
    0 6px 18px rgba(212, 175, 55, 0.18);
}
.strategy-card.active .sc-check {
  opacity: 1;
  transform: scale(1);
}
.sc-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  position: relative;
  z-index: 1;
}
.sc-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  background: rgba(212, 175, 55, 0.12);
  color: #d4af37;
  font-size: 16px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  transition: all 0.25s ease;
}
.strategy-card.active .sc-icon {
  background: linear-gradient(135deg, #d4af37, #b58c2e);
  color: #1a1208;
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}
.sc-title {
  font-size: 13px;
  color: #e8d9a6;
  font-weight: 600;
  letter-spacing: 1px;
}
.sc-desc {
  font-size: 11px;
  color: #7d745f;
  line-height: 1.55;
  position: relative;
  z-index: 1;
}
.sc-check {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #d4af37;
  color: #1a1208;
  display: grid;
  place-items: center;
  font-size: 12px;
  opacity: 0;
  transform: scale(0.6);
  transition: all 0.2s ease;
  z-index: 2;
}
.form-hint {
  color: #6c6452;
  font-size: 11px;
  margin-left: 10px;
}

/* Transfer */
.member-tip {
  color: #7d745f;
  font-size: 12px;
  margin-bottom: 12px;
  padding: 10px 14px;
  background: rgba(212, 175, 55, 0.06);
  border-left: 2px solid #d4af37;
  border-radius: 4px;
  letter-spacing: 0.5px;
}
.gold-transfer :deep(.el-transfer-panel) {
  background: rgba(10, 10, 15, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
}
.gold-transfer :deep(.el-transfer-panel__header) {
  background: linear-gradient(180deg, #1a1a24, #14141c);
  color: #d4af37;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.gold-transfer :deep(.el-transfer-panel__header .el-checkbox__label) {
  color: #d4af37 !important;
  font-weight: 600;
  letter-spacing: 1px;
}
.gold-transfer :deep(.el-transfer-panel__body) {
  background: transparent;
}
.gold-transfer :deep(.el-transfer-panel__item) {
  color: #c9c0ab;
}
.gold-transfer :deep(.el-transfer-panel__item .el-checkbox__label) {
  color: #c9c0ab !important;
}
.gold-transfer :deep(.el-transfer-panel__item:hover) {
  color: #d4af37;
}
.gold-transfer :deep(.el-transfer-panel__filter .el-input__wrapper) {
  background: rgba(0, 0, 0, 0.3) !important;
}
.gold-transfer :deep(.el-transfer__buttons .el-button) {
  background: linear-gradient(135deg, #d4af37, #b58c2e);
  color: #1a1208;
  border-color: transparent;
  font-weight: 600;
}
.gold-transfer :deep(.el-transfer__buttons .el-button.is-disabled) {
  background: rgba(80, 72, 55, 0.4);
  color: #555;
}
.gold-transfer :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #d4af37;
  border-color: #d4af37;
}
.gold-transfer :deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #1a1208;
}
.gold-transfer :deep(.el-transfer-panel__empty) {
  color: #6c6452;
}

/* Music option */
.music-opt {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
.music-glyph {
  color: #d4af37;
  font-size: 14px;
  font-style: normal;
}
.music-meta {
  margin-left: auto;
  color: #6c6452;
  font-size: 11px;
}

/* Responsive */
@media (max-width: 1200px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
  .strategy-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .stat-row { grid-template-columns: 1fr; }
  .strategy-grid { grid-template-columns: 1fr; }
  .search-input { width: 100%; }
  .panel-header { flex-direction: column; align-items: stretch; }
}
</style>

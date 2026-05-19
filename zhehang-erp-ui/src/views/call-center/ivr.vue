<template>
  <div class="ivr-page" :class="{ 'is-designer': mode === 'designer' }">
    <!-- ===================== LIST MODE ===================== -->
    <template v-if="mode === 'list'">
      <header class="ivr-hero">
        <div class="hero-bg-grid"></div>
        <div class="hero-bg-glow"></div>
        <div class="hero-inner">
          <div class="hero-eyebrow">
            <span class="eb-dot"></span>
            {{ t('cc.ivr.list.heroEyebrow') }}
          </div>
          <div class="hero-row">
            <div class="hero-text">
              <h1 class="hero-title">
                {{ t('cc.ivr.list.heroTitleMain') }}
                <em>{{ t('cc.ivr.list.heroTitleEm') }}</em>
              </h1>
              <p class="hero-sub">
                {{ t('cc.ivr.list.heroSub') }}
              </p>
            </div>
            <div class="hero-stats">
              <div class="hs-item">
                <div class="n">{{ flows.length }}</div>
                <div class="l">{{ t('cc.ivr.stats.totalFlows') }}</div>
              </div>
              <div class="hs-divider"></div>
              <div class="hs-item">
                <div class="n">{{ enabledCount }}</div>
                <div class="l">{{ t('cc.ivr.stats.onlineFlows') }}</div>
              </div>
              <div class="hs-divider"></div>
              <div class="hs-item">
                <div class="n">{{ totalNodes }}</div>
                <div class="l">{{ t('cc.ivr.stats.totalNodes') }}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="ivr-toolbar">
        <div class="left">
          <el-input
            v-model="search"
            :placeholder="t('cc.ivr.filter.searchPlaceholder')"
            :prefix-icon="Search"
            clearable
            style="width: 240px"
          />
          <el-select
            v-model="filterStatus"
            :placeholder="t('cc.ivr.filter.statusPlaceholder')"
            clearable
            style="width: 140px"
          >
            <el-option :label="t('cc.ivr.filter.statusAll')" value="" />
            <el-option :label="t('cc.ivr.status.published')" value="enabled" />
            <el-option :label="t('cc.ivr.status.draft')" value="disabled" />
          </el-select>
          <el-button :icon="Refresh" plain @click="loadFlows">{{ t('cc.ivr.actionExt.refresh') }}</el-button>
        </div>
        <div class="right">
          <el-dropdown trigger="click" @command="createFromTemplate">
            <el-button :icon="MagicStick" plain>
              {{ t('cc.ivr.actionExt.createFromTemplate') }}
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu class="ivr-tpl-menu">
                <el-dropdown-item
                  v-for="t in templateList"
                  :key="t.id"
                  :command="t.id"
                >
                  <div class="tpl-item">
                    <div class="tpl-icon" :style="{ background: t.color }">
                      <el-icon><component :is="t.icon" /></el-icon>
                    </div>
                    <div class="tpl-text">
                      <div class="tpl-name">{{ t.name }}</div>
                      <div class="tpl-desc">{{ t.desc }}</div>
                    </div>
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="primary" :icon="Plus" @click="createBlank">
            {{ t('cc.ivr.actionExt.createBlank') }}
          </el-button>
        </div>
      </section>

      <section class="ivr-table-wrap">
        <el-table :data="filteredFlows" v-loading="loading" stripe>
          <el-table-column :label="t('cc.ivr.column.name')" min-width="280">
            <template #default="{ row }">
              <div class="cell-name">
                <span class="dot" :class="{ on: row.enabled }"></span>
                <span class="n">{{ row.name }}</span>
                <el-tag
                  v-if="row.bindNumbers?.length"
                  size="small"
                  type="warning"
                  effect="plain"
                >
                  {{ t('cc.ivr.list.bindNumbers') }} {{ row.bindNumbers.length }}
                </el-tag>
              </div>
              <div class="cell-desc">
                {{ row.description || t('cc.ivr.list.noDescription') }}
              </div>
            </template>
          </el-table-column>
          <el-table-column :label="t('cc.ivr.column.status')" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="row.enabled ? 'success' : 'info'" effect="dark">
                {{ row.enabled ? t('cc.ivr.status.published') : t('cc.ivr.status.draft') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column :label="t('cc.ivr.list.nodesEdges')" width="140" align="center">
            <template #default="{ row }">
              <span class="num-pair">
                <em>{{ row.nodes.length }}</em>
                <span class="sep">·</span>
                <em>{{ row.edges.length }}</em>
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('cc.ivr.column.version')" width="80" align="center">
            <template #default="{ row }">
              <span class="ver">v{{ row.version }}</span>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('cc.ivr.list.updatedTime')"
            prop="updatedAt"
            width="180"
            align="center"
          />
          <el-table-column
            :label="t('cc.ivr.column.operation')"
            width="320"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                text
                type="primary"
                :icon="Edit"
                @click="openDesigner(row)"
              >{{ t('cc.ivr.action.design') }}</el-button>
              <el-button
                text
                :icon="DocumentCopy"
                @click="copyFlow(row)"
              >{{ t('cc.ivr.action.copy') }}</el-button>
              <el-button
                text
                :type="row.enabled ? 'warning' : 'success'"
                @click="toggleEnable(row)"
              >
                {{ row.enabled ? t('cc.ivr.action.unpublish') : t('cc.ivr.action.publish') }}
              </el-button>
              <el-button
                text
                type="danger"
                :icon="Delete"
                @click="removeFlow(row)"
              >{{ t('common.delete') }}</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <div class="empty-block">
              <div class="ea">⌬</div>
              <div class="et">{{ t('cc.ivr.list.emptyTip') }}</div>
            </div>
          </template>
        </el-table>
      </section>
    </template>

    <!-- ===================== DESIGNER MODE ===================== -->
    <IvrDesigner
      v-else-if="editing"
      :flow="editing"
      @back="backToList"
      @save="onDesignerSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Search, Plus, Refresh, ArrowDown, MagicStick,
  Edit, Delete, DocumentCopy,
  Headset, Service, ChatLineSquare, Moon
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import IvrDesigner from './components/IvrDesigner.vue'
import {
  getIvrFlows,
  saveIvrFlow,
  type IvrFlow,
  type IvrNode,
  type IvrEdge
} from '@/api/call-center'

const { t } = useI18n()

type Mode = 'list' | 'designer'
const mode = ref<Mode>('list')
const loading = ref(false)
const flows = ref<IvrFlow[]>([])
const search = ref('')
const filterStatus = ref<'' | 'enabled' | 'disabled'>('')
const editing = ref<IvrFlow | null>(null)

const enabledCount = computed(
  () => flows.value.filter((f) => f.enabled).length
)
const totalNodes = computed(() =>
  flows.value.reduce((s, f) => s + f.nodes.length, 0)
)

const filteredFlows = computed(() => {
  let list = flows.value
  if (search.value) {
    const k = search.value.toLowerCase()
    list = list.filter(
      (f) =>
        f.name.toLowerCase().includes(k) ||
        (f.description || '').toLowerCase().includes(k)
    )
  }
  if (filterStatus.value === 'enabled') list = list.filter((f) => f.enabled)
  if (filterStatus.value === 'disabled') list = list.filter((f) => !f.enabled)
  return list
})

async function loadFlows() {
  loading.value = true
  try {
    const res = await getIvrFlows()
    flows.value = res.data.list
  } finally {
    loading.value = false
  }
}

function createBlank() {
  editing.value = {
    id: 0,
    name: t('cc.ivr.list.untitled'),
    description: '',
    version: 1,
    enabled: false,
    bindNumbers: [],
    updatedAt: '',
    nodes: [
      { id: 'n1', type: 'start', name: t('cc.ivr.list.startNodeName'), x: 120, y: 200, config: {} }
    ],
    edges: []
  }
  mode.value = 'designer'
}

function createFromTemplate(id: string) {
  const tpl = templateList.find((t) => t.id === id)
  if (!tpl) return
  const built = tpl.build()
  editing.value = {
    id: 0,
    name: built.name,
    description: built.desc,
    version: 1,
    enabled: false,
    bindNumbers: [],
    updatedAt: '',
    nodes: built.nodes,
    edges: built.edges
  }
  mode.value = 'designer'
  ElMessage.success(t('cc.ivr.list.templateLoadedPrefix') + tpl.name)
}

function openDesigner(row: IvrFlow) {
  editing.value = JSON.parse(JSON.stringify(row))
  mode.value = 'designer'
}

function backToList() {
  mode.value = 'list'
  editing.value = null
  loadFlows()
}

async function onDesignerSave(payload: IvrFlow) {
  try {
    const res = await saveIvrFlow(payload)
    ElMessage.success(t('cc.ivr.message.saveSuccess'))
    if (editing.value) {
      editing.value.id = res.data.id
      editing.value.version = res.data.version
      editing.value.updatedAt = res.data.updatedAt
    }
  } catch {
    ElMessage.error(t('cc.ivr.message.saveFailed'))
  }
}

async function copyFlow(row: IvrFlow) {
  try {
    await saveIvrFlow({
      ...JSON.parse(JSON.stringify(row)),
      id: undefined,
      name: row.name + t('cc.ivr.list.copySuffix'),
      enabled: false,
      bindNumbers: []
    })
    ElMessage.success(t('cc.ivr.message.copySuccess'))
    loadFlows()
  } catch {
    ElMessage.error(t('cc.ivr.list.copyFailed'))
  }
}

async function toggleEnable(row: IvrFlow) {
  await saveIvrFlow({ ...row, enabled: !row.enabled })
  ElMessage.success(row.enabled ? t('cc.ivr.message.unpublishSuccess') : t('cc.ivr.list.publishedOnline'))
  loadFlows()
}

function removeFlow(row: IvrFlow) {
  ElMessageBox.confirm(
    t('cc.ivr.message.deleteConfirm', { name: row.name }),
    t('cc.ivr.list.deleteTitle'),
    { type: 'warning', confirmButtonText: t('cc.ivr.list.confirmDeleteBtn'), cancelButtonText: t('common.cancel') }
  )
    .then(() => {
      flows.value = flows.value.filter((f) => f.id !== row.id)
      ElMessage.success(t('cc.ivr.message.deleteSuccess'))
    })
    .catch(() => {})
}

// ============================================================
// 预置模板（4 套）
// ============================================================
interface TplDef {
  id: string
  name: string
  desc: string
  color: string
  icon: any
  build: () => { name: string; desc: string; nodes: IvrNode[]; edges: IvrEdge[] }
}

const templateList: TplDef[] = [
  {
    id: 'pre-sales',
    name: t('cc.ivr.tplFlow.presaleName'),
    desc: t('cc.ivr.tplFlow.presaleDesc'),
    color: '#06D6A0',
    icon: markRaw(Headset),
    build: () => ({
      name: t('cc.ivr.tplFlow.presaleFlowName'),
      desc: t('cc.ivr.tplFlow.presaleDesc'),
      nodes: [
        { id: 'n1', type: 'start', name: t('cc.ivr.list.startNodeName'), x: 80, y: 240, config: {} },
        { id: 'n2', type: 'play', name: t('cc.ivr.tplFlow.presaleNodeWelcome'), x: 240, y: 240, config: { audio: 'welcome-sales.wav', text: t('cc.ivr.tplFlow.presaleWelcome') } },
        { id: 'n3', type: 'menu', name: t('cc.ivr.tplFlow.presaleNodeMain'), x: 460, y: 240, config: { prompt: t('cc.ivr.tplFlow.presaleMenu'), timeout: 5, options: { '1': 'n4', '2': 'n5', '0': 'n6' } } },
        { id: 'n4', type: 'queue', name: t('cc.ivr.tplFlow.presaleNodeProduct'), x: 700, y: 80, config: { skillGroupId: 1, queueAudio: 'hold-music.wav', timeout: 60, strategy: 'least-busy' } },
        { id: 'n5', type: 'transfer', name: t('cc.ivr.tplFlow.presaleNodePrice'), x: 700, y: 240, config: { agentNo: '1003', timeout: 30, fallback: 'queue' } },
        { id: 'n6', type: 'transfer', name: t('cc.ivr.tplFlow.presaleNodeManual'), x: 700, y: 400, config: { agentNo: '1001', timeout: 30, fallback: 'queue' } },
        { id: 'n7', type: 'hangup', name: t('cc.ivr.tplFlow.presaleNodeEnd'), x: 940, y: 240, config: { byeAudio: 'bye.wav', cause: 'NORMAL_CLEARING' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: t('cc.ivr.tplFlow.edgeKey1') },
        { id: 'e4', source: 'n3', target: 'n5', label: t('cc.ivr.tplFlow.edgeKey2') },
        { id: 'e5', source: 'n3', target: 'n6', label: t('cc.ivr.tplFlow.edgeKey0') },
        { id: 'e6', source: 'n4', target: 'n7' },
        { id: 'e7', source: 'n5', target: 'n7' },
        { id: 'e8', source: 'n6', target: 'n7' }
      ]
    })
  },
  {
    id: 'after-sales',
    name: t('cc.ivr.tplFlow.aftersaleName'),
    desc: t('cc.ivr.tplFlow.aftersaleDesc'),
    color: '#5B8DEF',
    icon: markRaw(Service),
    build: () => ({
      name: t('cc.ivr.tplFlow.aftersaleFlowName'),
      desc: t('cc.ivr.tplFlow.aftersaleFlowDesc'),
      nodes: [
        { id: 'n1', type: 'start', name: t('cc.ivr.list.startNodeName'), x: 80, y: 240, config: {} },
        { id: 'n2', type: 'play', name: t('cc.ivr.tplFlow.aftersaleNodeWelcome'), x: 240, y: 240, config: { audio: 'as-welcome.wav', text: t('cc.ivr.tplFlow.aftersaleWelcome') } },
        { id: 'n3', type: 'collect', name: t('cc.ivr.tplFlow.aftersaleNodeLevel'), x: 420, y: 240, config: { variable: 'customerLevel', value: 'normal', persist: true } },
        { id: 'n4', type: 'menu', name: t('cc.ivr.tplFlow.aftersaleNodeMenu'), x: 600, y: 240, config: { prompt: t('cc.ivr.tplFlow.aftersaleMenu'), timeout: 6, options: { '1': 'n5', '2': 'n6', '3': 'n7', '0': 'n8' } } },
        { id: 'n5', type: 'queue', name: t('cc.ivr.tplFlow.aftersaleNodeComplaint'), x: 820, y: 60, config: { skillGroupId: 2, queueAudio: 'hold-music.wav', timeout: 90, strategy: 'skill-based' } },
        { id: 'n6', type: 'queue', name: t('cc.ivr.tplFlow.aftersaleNodeRepair'), x: 820, y: 200, config: { skillGroupId: 2, queueAudio: 'hold-music.wav', timeout: 90, strategy: 'skill-based' } },
        { id: 'n7', type: 'transfer', name: t('cc.ivr.tplFlow.aftersaleNodeReturn'), x: 820, y: 340, config: { agentNo: '1004', timeout: 45, fallback: 'queue' } },
        { id: 'n8', type: 'queue', name: t('cc.ivr.tplFlow.aftersaleNodeGeneral'), x: 820, y: 480, config: { skillGroupId: 1, queueAudio: 'hold-music.wav', timeout: 60, strategy: 'least-busy' } },
        { id: 'n9', type: 'hangup', name: t('cc.ivr.tplFlow.presaleNodeEnd'), x: 1060, y: 240, config: { byeAudio: 'bye.wav', cause: 'NORMAL_CLEARING' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4' },
        { id: 'e4', source: 'n4', target: 'n5', label: t('cc.ivr.tplFlow.edgeKey1') },
        { id: 'e5', source: 'n4', target: 'n6', label: t('cc.ivr.tplFlow.edgeKey2') },
        { id: 'e6', source: 'n4', target: 'n7', label: t('cc.ivr.tplFlow.edgeKey3') },
        { id: 'e7', source: 'n4', target: 'n8', label: t('cc.ivr.tplFlow.edgeKey0') },
        { id: 'e8', source: 'n5', target: 'n9' },
        { id: 'e9', source: 'n6', target: 'n9' },
        { id: 'e10', source: 'n7', target: 'n9' },
        { id: 'e11', source: 'n8', target: 'n9' }
      ]
    })
  },
  {
    id: 'satisfaction',
    name: t('cc.ivr.tplFlow.satisfactionName'),
    desc: t('cc.ivr.tplFlow.satisfactionDesc'),
    color: '#FFD166',
    icon: markRaw(ChatLineSquare),
    build: () => ({
      name: t('cc.ivr.tplFlow.satisfactionFlowName'),
      desc: t('cc.ivr.tplFlow.satisfactionFlowDesc'),
      nodes: [
        { id: 'n1', type: 'start', name: t('cc.ivr.list.startNodeName'), x: 80, y: 220, config: {} },
        { id: 'n2', type: 'tts', name: t('cc.ivr.tplFlow.satisfactionNodeGuide'), x: 240, y: 220, config: { text: t('cc.ivr.tplFlow.satisfactionTtsText'), voice: 'female-soft' } },
        { id: 'n3', type: 'menu', name: t('cc.ivr.tplFlow.satisfactionNodeRating'), x: 460, y: 220, config: { prompt: t('cc.ivr.tplFlow.satisfactionMenu'), timeout: 8, options: { '1': 'n4', '2': 'n4', '3': 'n4', '4': 'n5', '5': 'n5' } } },
        { id: 'n4', type: 'collect', name: t('cc.ivr.tplFlow.satisfactionNodeLow'), x: 680, y: 80, config: { variable: 'rating', value: 'low', persist: true } },
        { id: 'n5', type: 'collect', name: t('cc.ivr.tplFlow.satisfactionNodeHigh'), x: 680, y: 360, config: { variable: 'rating', value: 'high', persist: true } },
        { id: 'n6', type: 'transfer', name: t('cc.ivr.tplFlow.satisfactionNodeCallback'), x: 880, y: 80, config: { agentNo: '1004', timeout: 60, fallback: 'voicemail' } },
        { id: 'n7', type: 'play', name: t('cc.ivr.tplFlow.satisfactionNodeThanks'), x: 880, y: 360, config: { audio: 'thanks.wav', text: t('cc.ivr.tplFlow.satisfactionThanksText') } },
        { id: 'n8', type: 'hangup', name: t('cc.ivr.tplFlow.presaleNodeEnd'), x: 1080, y: 220, config: { byeAudio: 'bye.wav', cause: 'NORMAL_CLEARING' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: t('cc.ivr.tplFlow.satisfactionEdgeLow') },
        { id: 'e4', source: 'n3', target: 'n5', label: t('cc.ivr.tplFlow.satisfactionEdgeHigh') },
        { id: 'e5', source: 'n4', target: 'n6' },
        { id: 'e6', source: 'n5', target: 'n7' },
        { id: 'e7', source: 'n6', target: 'n8' },
        { id: 'e8', source: 'n7', target: 'n8' }
      ]
    })
  },
  {
    id: '24h-service',
    name: t('cc.ivr.tplFlow.service24hName'),
    desc: t('cc.ivr.tplFlow.service24hDesc'),
    color: '#B76E79',
    icon: markRaw(Moon),
    build: () => ({
      name: t('cc.ivr.tplFlow.service24hFlowName'),
      desc: t('cc.ivr.tplFlow.service24hFlowDesc'),
      nodes: [
        { id: 'n1', type: 'start', name: t('cc.ivr.list.startNodeName'), x: 80, y: 240, config: {} },
        { id: 'n2', type: 'collect', name: t('cc.ivr.tplFlow.service24hNodeHour'), x: 240, y: 240, config: { variable: 'hour', value: '${SYSTEM_HOUR}', persist: false } },
        { id: 'n3', type: 'condition', name: t('cc.ivr.tplFlow.service24hNodeJudge'), x: 440, y: 240, config: { variable: 'hour', op: 'between', value: '9,18' } },
        { id: 'n4', type: 'play', name: t('cc.ivr.tplFlow.service24hNodeWorkWelcome'), x: 660, y: 80, config: { audio: 'work-time.wav', text: t('cc.ivr.tplFlow.service24hWorkText') } },
        { id: 'n5', type: 'queue', name: t('cc.ivr.tplFlow.service24hNodeWorkQueue'), x: 880, y: 80, config: { skillGroupId: 1, queueAudio: 'hold-music.wav', timeout: 90, strategy: 'least-busy' } },
        { id: 'n6', type: 'play', name: t('cc.ivr.tplFlow.service24hNodeOff'), x: 660, y: 380, config: { audio: 'after-hours.wav', text: t('cc.ivr.tplFlow.service24hOffText') } },
        { id: 'n7', type: 'collect', name: t('cc.ivr.tplFlow.service24hNodeRecord'), x: 880, y: 380, config: { variable: 'leaveMsg', value: 'true', persist: true } },
        { id: 'n8', type: 'tts', name: t('cc.ivr.tplFlow.service24hNodeBye'), x: 1080, y: 380, config: { text: t('cc.ivr.tplFlow.service24hByeText'), voice: 'female-std' } },
        { id: 'n9', type: 'hangup', name: t('cc.ivr.tplFlow.presaleNodeEnd'), x: 1280, y: 240, config: { byeAudio: 'bye.wav', cause: 'NORMAL_CLEARING' } }
      ],
      edges: [
        { id: 'e1', source: 'n1', target: 'n2' },
        { id: 'e2', source: 'n2', target: 'n3' },
        { id: 'e3', source: 'n3', target: 'n4', label: t('cc.ivr.tplFlow.service24hEdgeWork') },
        { id: 'e4', source: 'n3', target: 'n6', label: t('cc.ivr.tplFlow.service24hEdgeOff') },
        { id: 'e5', source: 'n4', target: 'n5' },
        { id: 'e6', source: 'n6', target: 'n7' },
        { id: 'e7', source: 'n7', target: 'n8' },
        { id: 'e8', source: 'n5', target: 'n9' },
        { id: 'e9', source: 'n8', target: 'n9' }
      ]
    })
  }
]

onMounted(() => {
  loadFlows()
})
</script>

<style scoped>
.ivr-page {
  padding: 0 24px 24px;
  min-height: calc(100vh - 96px);
}
.ivr-page.is-designer {
  padding: 16px 24px 24px;
}

/* ============ HERO ============ */
.ivr-hero {
  position: relative;
  margin: 0 -24px 18px;
  padding: 28px 32px 24px;
  border-bottom: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  background: linear-gradient(180deg, #12121a 0%, #0a0a0f 100%);
  overflow: hidden;
}
.hero-bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(90deg, rgba(212, 175, 55, 0.06) 1px, transparent 1px),
    linear-gradient(0deg, rgba(212, 175, 55, 0.06) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: linear-gradient(180deg, transparent, black 40%, transparent);
  pointer-events: none;
}
.hero-bg-glow {
  position: absolute;
  top: -120px;
  right: -80px;
  width: 380px;
  height: 380px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.18), transparent 70%);
  pointer-events: none;
}
.hero-inner {
  position: relative;
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--gold-primary, #d4af37);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-weight: 600;
  margin-bottom: 18px;
}
.eb-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #06d6a0;
  box-shadow: 0 0 10px #06d6a0;
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.hero-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  flex-wrap: wrap;
}
.hero-text {
  flex: 1;
  min-width: 320px;
}
.hero-title {
  font-size: 38px;
  font-weight: 800;
  margin: 0;
  line-height: 1.15;
  color: var(--text-primary, #f0e6d3);
  letter-spacing: 2px;
  font-family: 'Source Han Serif SC', 'Noto Serif SC', 'PingFang SC', serif;
}
.hero-title em {
  font-style: normal;
  background: linear-gradient(135deg, #d4af37 0%, #f5d76e 50%, #c5a55a 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-left: 6px;
}
.hero-sub {
  margin: 10px 0 0;
  font-size: 13.5px;
  color: var(--text-body, #a09b8c);
  letter-spacing: 2px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 28px;
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  background: rgba(18, 18, 26, 0.6);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow-card);
}
.hs-item { text-align: center; }
.hs-item .n {
  font-size: 30px;
  font-weight: 800;
  color: var(--gold-primary);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  line-height: 1;
  letter-spacing: 1px;
}
.hs-item .l {
  font-size: 11px;
  color: var(--text-body);
  letter-spacing: 3px;
  margin-top: 6px;
}
.hs-divider {
  width: 1px;
  height: 36px;
  background: var(--border-gold);
}

/* ============ TOOLBAR ============ */
.ivr-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  margin-bottom: 12px;
  background: var(--bg-card, #12121a);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 12px;
}
.ivr-toolbar .left,
.ivr-toolbar .right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ============ TEMPLATE DROPDOWN ============ */
.tpl-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 6px 0;
  min-width: 280px;
}
.tpl-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-size: 16px;
  flex-shrink: 0;
}
.tpl-text { flex: 1; min-width: 0; }
.tpl-name {
  font-size: 13.5px;
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: 0.5px;
}
.tpl-desc {
  font-size: 11.5px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ============ TABLE ============ */
.ivr-table-wrap {
  background: var(--bg-card, #12121a);
  border: 1px solid var(--border-gold);
  border-radius: 12px;
  padding: 6px 8px 8px;
  box-shadow: var(--shadow-card);
}
.cell-name {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}
.cell-name .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
  flex-shrink: 0;
}
.cell-name .dot.on {
  background: #06d6a0;
  box-shadow: 0 0 10px #06d6a0;
}
.cell-name .n {
  font-weight: 600;
  color: var(--text-primary);
}
.cell-desc {
  margin-top: 4px;
  margin-left: 18px;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.5;
}
.num-pair {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 14px;
  color: var(--gold-primary);
  font-weight: 600;
  letter-spacing: 1px;
}
.num-pair em {
  font-style: normal;
  font-size: 16px;
}
.num-pair .sep {
  margin: 0 6px;
  color: var(--gold-dark);
}
.ver {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  color: var(--gold-primary);
  font-weight: 700;
  letter-spacing: 1px;
}

.empty-block {
  padding: 60px 20px;
  text-align: center;
  color: var(--text-muted);
}
.empty-block .ea {
  font-size: 56px;
  color: var(--gold-dark);
  margin-bottom: 12px;
  letter-spacing: 4px;
}
.empty-block .et {
  font-size: 13px;
  letter-spacing: 1px;
}
</style>

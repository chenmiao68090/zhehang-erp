<template>
  <div class="ivr-designer" tabindex="0" @keydown="onKeyDown">
    <!-- Top toolbar -->
    <div class="dz-toolbar">
      <div class="dz-tb-left">
        <el-button :icon="ArrowLeft" plain @click="emit('back')">{{ t('cc.ivr.designer.extra.backToList') }}</el-button>
        <span class="dz-vline"></span>
        <el-input
          v-model="local.name"
          :placeholder="t('cc.ivr.designer.extra.namePlaceholder')"
          class="dz-name"
          maxlength="40"
          show-word-limit
        />
        <el-tag
          :type="local.enabled ? 'success' : 'info'"
          effect="dark"
          class="dz-status-tag"
        >
          {{ local.enabled ? t('cc.ivr.designer.extra.publishedStatus') : t('cc.ivr.designer.extra.draftStatus') }} · v{{ local.version }}
        </el-tag>
      </div>
      <div class="dz-tb-right">
        <el-tooltip :content="t('cc.ivr.designer.extra.tipAutoLayout')" placement="bottom">
          <el-button :icon="MagicStick" circle plain @click="autoLayout" />
        </el-tooltip>
        <el-tooltip :content="t('cc.ivr.designer.extra.tipClearCanvas')" placement="bottom">
          <el-button :icon="Delete" circle plain @click="clearCanvas" />
        </el-tooltip>
        <el-tooltip :content="t('cc.ivr.designer.extra.tipJsonPreview')" placement="bottom">
          <el-button :icon="View" circle plain @click="jsonVisible = true" />
        </el-tooltip>
        <el-button type="primary" :icon="Check" @click="onSave">{{ t('cc.ivr.designer.extra.saveBtn') }}</el-button>
      </div>
    </div>

    <div class="dz-body">
      <!-- LEFT PALETTE -->
      <aside class="dz-palette">
        <div class="dz-section-title">
          <span class="t-bar"></span>
          <span>{{ t('cc.ivr.designer.extra.secNodeComponents') }}</span>
        </div>
        <div
          v-for="np in palette"
          :key="np.type"
          class="dz-palette-item"
          :class="{ disabled: np.type === 'start' && hasStart }"
          draggable="true"
          @dragstart="onPaletteDragStart($event, np)"
        >
          <div
            class="dz-pi-icon"
            :style="{ background: np.color, '--node-color': np.color }"
          >
            <el-icon><component :is="np.icon" /></el-icon>
          </div>
          <div class="dz-pi-info">
            <div class="dz-pi-name">{{ paletteLabel(np.type) }}</div>
            <div class="dz-pi-desc">{{ paletteDesc(np.type) }}</div>
          </div>
          <div class="dz-pi-grip">⋮⋮</div>
        </div>

        <div class="dz-section-title" style="margin-top: 28px">
          <span class="t-bar"></span>
          <span>{{ t('cc.ivr.designer.extra.secFlowStats') }}</span>
        </div>
        <div class="dz-stat-grid">
          <div class="dz-stat">
            <div class="dz-stat-num">{{ local.nodes.length }}</div>
            <div class="dz-stat-lab">{{ t('cc.ivr.designer.extra.statNodes') }}</div>
          </div>
          <div class="dz-stat">
            <div class="dz-stat-num">{{ local.edges.length }}</div>
            <div class="dz-stat-lab">{{ t('cc.ivr.designer.extra.statEdges') }}</div>
          </div>
        </div>
      </aside>

      <!-- CENTER CANVAS -->
      <section
        class="dz-canvas-wrap"
        ref="canvasWrap"
        @dragover.prevent
        @drop="onCanvasDrop"
        @mousedown="onCanvasMouseDown"
        @click="clearSelection"
      >
        <div
          class="dz-canvas-grid"
          :style="{ backgroundPosition: `${pan.x}px ${pan.y}px` }"
        ></div>
        <div
          class="dz-canvas-inner"
          ref="canvasInner"
          :style="{ transform: `translate(${pan.x}px, ${pan.y}px)` }"
        >
          <svg class="dz-svg" :width="2400" :height="1800">
            <defs>
              <marker
                id="arrow-gold"
                viewBox="0 0 12 12"
                refX="11"
                refY="6"
                markerWidth="9"
                markerHeight="9"
                orient="auto"
              >
                <path d="M0,0 L0,12 L12,6 z" fill="#D4AF37"></path>
              </marker>
              <marker
                id="arrow-active"
                viewBox="0 0 12 12"
                refX="11"
                refY="6"
                markerWidth="10"
                markerHeight="10"
                orient="auto"
              >
                <path d="M0,0 L0,12 L12,6 z" fill="#06D6A0"></path>
              </marker>
              <linearGradient id="dz-edge-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stop-color="#8B7355" />
                <stop offset="100%" stop-color="#D4AF37" />
              </linearGradient>
            </defs>

            <g v-for="e in local.edges" :key="e.id">
              <path
                :d="bezierFor(e)"
                class="dz-edge"
                :class="{ active: selectedEdgeId === e.id }"
                @click.stop="selectEdge(e)"
              />
              <g v-if="e.label" class="dz-edge-label-wrap" @click.stop="selectEdge(e)">
                <rect
                  :x="midPoint(e).x - labelWidth(e.label) / 2"
                  :y="midPoint(e).y - 11"
                  :width="labelWidth(e.label)"
                  height="18"
                  rx="9"
                  class="dz-edge-label-bg"
                />
                <text
                  :x="midPoint(e).x"
                  :y="midPoint(e).y + 2"
                  class="dz-edge-label"
                >{{ e.label }}</text>
              </g>
            </g>

            <path v-if="dragLine" :d="dragLine" class="dz-edge dragging" />
          </svg>

          <div
            v-for="n in local.nodes"
            :key="n.id"
            class="dz-node"
            :class="[
              't-' + n.type,
              {
                selected: selectedNodeId === n.id,
                terminal: isTerminal(n.type)
              }
            ]"
            :style="{ left: n.x + 'px', top: n.y + 'px' }"
            @mousedown.stop="startNodeDrag($event, n)"
            @click.stop="selectNode(n)"
          >
            <template v-if="isTerminal(n.type)">
              <div
                class="dz-node-circle"
                :style="{ background: getColor(n.type) }"
              >
                <el-icon><component :is="iconFor(n.type)" /></el-icon>
              </div>
              <div class="dz-node-name">{{ n.name }}</div>
            </template>
            <template v-else>
              <div
                class="dz-node-head"
                :style="{ background: getColor(n.type) }"
              >
                <el-icon><component :is="iconFor(n.type)" /></el-icon>
                <span>{{ typeLabel(n.type) }}</span>
              </div>
              <div class="dz-node-body">
                <div class="dz-node-title">{{ n.name }}</div>
                <div class="dz-node-meta">{{ metaText(n) }}</div>
              </div>
            </template>

            <div
              v-if="n.type !== 'start'"
              class="dz-port port-in"
              @mouseup.stop="onPortMouseUp(n)"
            ></div>
            <div
              v-if="n.type !== 'hangup'"
              class="dz-port port-out"
              @mousedown.stop="onPortMouseDown($event, n)"
            ></div>
          </div>
        </div>

        <div class="dz-helper">
          <span><b>{{ t('cc.ivr.designer.extra.helperDrag') }}</b>{{ t('cc.ivr.designer.extra.helperDragText') }}</span>
          <i class="dot">◆</i>
          <span><b>{{ t('cc.ivr.designer.extra.helperPort') }}</b>{{ t('cc.ivr.designer.extra.helperPortText') }}</span>
          <i class="dot">◆</i>
          <span><b>{{ t('cc.ivr.designer.extra.helperBlank') }}</b>{{ t('cc.ivr.designer.extra.helperBlankText') }}</span>
          <i class="dot">◆</i>
          <span><b>{{ t('cc.ivr.designer.extra.helperDelete') }}</b>{{ t('cc.ivr.designer.extra.helperDeleteText') }}</span>
        </div>

        <div class="dz-watermark">IVR · BLUEPRINT</div>
      </section>

      <!-- RIGHT PROPERTIES -->
      <aside class="dz-props">
        <div class="dz-section-title">
          <span class="t-bar"></span>
          <span>{{ t('cc.ivr.designer.extra.secProperties') }}</span>
        </div>

        <div v-if="!selectedNode && !selectedEdge" class="dz-empty-state">
          <div class="dz-empty-art">⌬</div>
          <div class="dz-empty-text">
            {{ t('cc.ivr.designer.extra.emptyTitle') }}<br />{{ t('cc.ivr.designer.extra.emptySubtitle') }}
          </div>
          <div class="dz-empty-tip">
            {{ t('cc.ivr.designer.extra.emptyTip') }}
          </div>
        </div>

        <div v-else-if="selectedNode" class="dz-form">
          <div class="dz-prop-head">
            <div
              class="dz-prop-icon"
              :style="{ background: getColor(selectedNode.type) }"
            >
              <el-icon><component :is="iconFor(selectedNode.type)" /></el-icon>
            </div>
            <div>
              <div class="dz-prop-title">{{ typeLabel(selectedNode.type) }}</div>
              <div class="dz-prop-id">{{ selectedNode.id }}</div>
            </div>
          </div>

          <el-form label-position="top" size="default" @submit.prevent>
            <el-form-item :label="t('cc.ivr.designer.extra.form.nodeName')">
              <el-input v-model="selectedNode.name" maxlength="20" show-word-limit />
            </el-form-item>

            <template v-if="selectedNode.type === 'play'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.audioFile')">
                <el-input
                  v-model="(selectedNode.config as any).audio"
                  :placeholder="t('cc.ivr.designer.extra.form.audioPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.remarkText')">
                <el-input
                  v-model="(selectedNode.config as any).text"
                  type="textarea"
                  :rows="3"
                  :placeholder="t('cc.ivr.designer.extra.form.remarkPlaceholder')"
                />
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'tts'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.ttsText')">
                <el-input
                  v-model="(selectedNode.config as any).text"
                  type="textarea"
                  :rows="3"
                  :placeholder="t('cc.ivr.designer.extra.form.ttsPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.voice')">
                <el-select
                  v-model="(selectedNode.config as any).voice"
                  style="width: 100%"
                >
                  <el-option :label="t('cc.ivr.designer.extra.form.voiceFemaleStd')" value="female-std" />
                  <el-option :label="t('cc.ivr.designer.extra.form.voiceMaleStd')" value="male-std" />
                  <el-option :label="t('cc.ivr.designer.extra.form.voiceFemaleSoft')" value="female-soft" />
                  <el-option :label="t('cc.ivr.designer.extra.form.voiceMaleDeep')" value="male-deep" />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'menu'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.menuPrompt')">
                <el-input
                  v-model="(selectedNode.config as any).prompt"
                  type="textarea"
                  :rows="2"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.keyTimeout')">
                <el-input-number
                  v-model="(selectedNode.config as any).timeout"
                  :min="1"
                  :max="30"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.keyMapping')">
                <div class="dz-keymap">
                  <div
                    v-for="k in keyOptions"
                    :key="k"
                    class="dz-keymap-row"
                  >
                    <span class="dz-key">{{ k }}</span>
                    <el-select
                      v-model="(selectedNode.config as any).options[k]"
                      :placeholder="t('cc.ivr.designer.extra.form.keyUnmapped')"
                      clearable
                      size="small"
                      style="flex: 1"
                    >
                      <el-option
                        v-for="o in branchTargets"
                        :key="o.id"
                        :label="`${o.name} (${o.id})`"
                        :value="o.id"
                      />
                    </el-select>
                  </div>
                </div>
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'collect'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.varName')">
                <el-input
                  v-model="(selectedNode.config as any).variable"
                  :placeholder="t('cc.ivr.designer.extra.form.varNamePlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.varValue')">
                <el-input v-model="(selectedNode.config as any).value" />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.persist')">
                <el-switch
                  v-model="(selectedNode.config as any).persist"
                  :active-text="t('cc.ivr.designer.extra.form.persistText')"
                />
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'transfer'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.agentNo')">
                <el-input
                  v-model="(selectedNode.config as any).agentNo"
                  :placeholder="t('cc.ivr.designer.extra.form.agentNoPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.noAnswerTimeout')">
                <el-input-number
                  v-model="(selectedNode.config as any).timeout"
                  :min="5"
                  :max="120"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.fallback')">
                <el-radio-group v-model="(selectedNode.config as any).fallback">
                  <el-radio value="hangup">{{ t('cc.ivr.designer.extra.form.fallbackHangup') }}</el-radio>
                  <el-radio value="queue">{{ t('cc.ivr.designer.extra.form.fallbackQueue') }}</el-radio>
                  <el-radio value="voicemail">{{ t('cc.ivr.designer.extra.form.fallbackVoicemail') }}</el-radio>
                </el-radio-group>
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'queue'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.skillGroupId')">
                <el-input-number
                  v-model="(selectedNode.config as any).skillGroupId"
                  :min="1"
                  :max="999"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.queueAudio')">
                <el-input
                  v-model="(selectedNode.config as any).queueAudio"
                  :placeholder="t('cc.ivr.designer.extra.form.queueAudioPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.maxWaitSec')">
                <el-input-number
                  v-model="(selectedNode.config as any).timeout"
                  :min="10"
                  :max="600"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.strategy')">
                <el-select
                  v-model="(selectedNode.config as any).strategy"
                  style="width: 100%"
                >
                  <el-option :label="t('cc.ivr.designer.extra.form.stLeastBusy')" value="least-busy" />
                  <el-option :label="t('cc.ivr.designer.extra.form.stRoundRobin')" value="round-robin" />
                  <el-option :label="t('cc.ivr.designer.extra.form.stSkillBased')" value="skill-based" />
                  <el-option :label="t('cc.ivr.designer.extra.form.stPriority')" value="priority" />
                </el-select>
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'condition'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.judgeVar')">
                <el-input
                  v-model="(selectedNode.config as any).variable"
                  :placeholder="t('cc.ivr.designer.extra.form.judgeVarPlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.operator')">
                <el-select
                  v-model="(selectedNode.config as any).op"
                  style="width: 100%"
                >
                  <el-option :label="t('cc.ivr.designer.extra.form.opEq')" value="==" />
                  <el-option :label="t('cc.ivr.designer.extra.form.opNeq')" value="!=" />
                  <el-option :label="t('cc.ivr.designer.extra.form.opContains')" value="contains" />
                  <el-option :label="t('cc.ivr.designer.extra.form.opGt')" value=">" />
                  <el-option :label="t('cc.ivr.designer.extra.form.opLt')" value="<" />
                  <el-option :label="t('cc.ivr.designer.extra.form.opBetween')" value="between" />
                </el-select>
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.compareValue')">
                <el-input v-model="(selectedNode.config as any).value" />
              </el-form-item>
            </template>

            <template v-if="selectedNode.type === 'hangup'">
              <el-form-item :label="t('cc.ivr.designer.extra.form.endVoice')">
                <el-input
                  v-model="(selectedNode.config as any).byeAudio"
                  :placeholder="t('cc.ivr.designer.extra.form.endVoicePlaceholder')"
                />
              </el-form-item>
              <el-form-item :label="t('cc.ivr.designer.extra.form.hangupReason')">
                <el-select
                  v-model="(selectedNode.config as any).cause"
                  style="width: 100%"
                  placeholder="NORMAL_CLEARING"
                >
                  <el-option :label="t('cc.ivr.designer.extra.form.reasonNormal')" value="NORMAL_CLEARING" />
                  <el-option :label="t('cc.ivr.designer.extra.form.reasonBusy')" value="USER_BUSY" />
                  <el-option :label="t('cc.ivr.designer.extra.form.reasonReject')" value="CALL_REJECTED" />
                  <el-option :label="t('cc.ivr.designer.extra.form.reasonTimeout')" value="NO_ANSWER" />
                </el-select>
              </el-form-item>
            </template>

            <el-form-item :label="t('cc.ivr.designer.extra.form.coordinate')">
              <div class="dz-pos">
                <span class="ax">X</span>
                <el-input-number
                  v-model="selectedNode.x"
                  :step="10"
                  :min="0"
                  size="small"
                  controls-position="right"
                />
                <span class="ax">Y</span>
                <el-input-number
                  v-model="selectedNode.y"
                  :step="10"
                  :min="0"
                  size="small"
                  controls-position="right"
                />
              </div>
            </el-form-item>

            <el-form-item v-if="selectedNode.type !== 'start'">
              <el-button
                type="danger"
                plain
                :icon="Delete"
                @click="deleteNode(selectedNode)"
                style="width: 100%"
              >
                {{ t('cc.ivr.designer.extra.form.deleteNode') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div v-else-if="selectedEdge" class="dz-form">
          <div class="dz-prop-head">
            <div class="dz-prop-icon edge-icon">
              <el-icon><Right /></el-icon>
            </div>
            <div>
              <div class="dz-prop-title">{{ t('cc.ivr.designer.extra.edgeLabel') }}</div>
              <div class="dz-prop-id">{{ selectedEdge.id }}</div>
            </div>
          </div>
          <el-form label-position="top">
            <el-form-item :label="t('cc.ivr.designer.extra.form.edgeLabelLabel')">
              <el-input
                v-model="selectedEdge.label"
                :placeholder="t('cc.ivr.designer.extra.form.edgeLabelPlaceholder')"
              />
            </el-form-item>
            <el-form-item :label="t('cc.ivr.designer.extra.form.edgePath')">
              <div class="dz-edge-path">
                <el-tag effect="dark">{{ nodeName(selectedEdge.source) }}</el-tag>
                <span class="dz-arrow">⟶</span>
                <el-tag type="warning" effect="dark">{{ nodeName(selectedEdge.target) }}</el-tag>
              </div>
            </el-form-item>
            <el-form-item>
              <el-button
                type="danger"
                plain
                :icon="Delete"
                @click="deleteEdge(selectedEdge)"
                style="width: 100%"
              >
                {{ t('cc.ivr.designer.extra.form.deleteEdge') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </aside>
    </div>

    <el-dialog v-model="jsonVisible" :title="t('cc.ivr.designer.extra.msg.jsonTitle')" width="640px" align-center>
      <pre class="dz-json">{{ jsonText }}</pre>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, markRaw } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft, Check, Delete, View, MagicStick, Right,
  VideoPlay, Microphone, Operation, Edit, User, UserFilled,
  SetUp, CircleClose, ChatLineRound
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { IvrFlow, IvrNode, IvrEdge } from '@/api/call-center'

const { t } = useI18n()

const props = defineProps<{ flow: IvrFlow }>()
const emit = defineEmits<{
  (e: 'back'): void
  (e: 'save', payload: IvrFlow): void
}>()

const local = reactive<IvrFlow>(JSON.parse(JSON.stringify(props.flow)))
watch(
  () => props.flow,
  (v) => Object.assign(local, JSON.parse(JSON.stringify(v))),
  { deep: false }
)

const palette = [
  { type: 'start',     color: '#06D6A0', icon: markRaw(VideoPlay) },
  { type: 'menu',      color: '#FFD166', icon: markRaw(Operation) },
  { type: 'play',      color: '#C5A55A', icon: markRaw(Microphone) },
  { type: 'tts',       color: '#5B8DEF', icon: markRaw(ChatLineRound) },
  { type: 'transfer',  color: '#B76E79', icon: markRaw(User) },
  { type: 'queue',     color: '#8B7BFF', icon: markRaw(UserFilled) },
  { type: 'condition', color: '#FF9F43', icon: markRaw(SetUp) },
  { type: 'collect',   color: '#D4AF37', icon: markRaw(Edit) },
  { type: 'hangup',    color: '#EF4444', icon: markRaw(CircleClose) }
]
const paletteLabel = (type: string) => t(`cc.ivr.designer.extra.palette.${type}Label`)
const paletteDesc = (type: string) => t(`cc.ivr.designer.extra.palette.${type}Desc`)

const typeLabel = (type: string) => t(`cc.ivr.designer.extra.typeLabel.${type}`)
const iconFor = (t: string) =>
  palette.find((p) => p.type === t)?.icon || VideoPlay
const getColor = (t: string) =>
  palette.find((p) => p.type === t)?.color || '#D4AF37'
const isTerminal = (t: string) => t === 'start' || t === 'hangup'

const NODE_W = 160
const NODE_H = 76
const TERM_R = 56

const canvasWrap = ref<HTMLElement | null>(null)
const canvasInner = ref<HTMLElement | null>(null)
const pan = reactive({ x: 0, y: 0 })

const selectedNodeId = ref<string | null>(null)
const selectedEdgeId = ref<string | null>(null)
const selectedNode = computed(
  () => local.nodes.find((n) => n.id === selectedNodeId.value) || null
)
const selectedEdge = computed(
  () => local.edges.find((e) => e.id === selectedEdgeId.value) || null
)

const hasStart = computed(() => local.nodes.some((n) => n.type === 'start'))

const keyOptions = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '*', '#']
const branchTargets = computed(() =>
  local.nodes.filter((n) => n.id !== selectedNodeId.value)
)

function nodeName(id: string) {
  return local.nodes.find((n) => n.id === id)?.name || id
}

function metaText(n: IvrNode): string {
  const c: any = n.config || {}
  switch (n.type) {
    case 'play': return c.audio || c.text || t('cc.ivr.designer.extra.msg.metaUnsetAudio')
    case 'tts': return c.text ? c.text.slice(0, 14) : t('cc.ivr.designer.extra.msg.metaUnsetText')
    case 'menu': return `${Object.keys(c.options || {}).length}${t('cc.ivr.designer.extra.msg.metaBranchSuffix')}`
    case 'collect': return c.variable ? `${c.variable} = ${c.value ?? ''}` : t('cc.ivr.designer.extra.msg.metaUnsetVar')
    case 'transfer': return c.agentNo ? `${t('cc.ivr.designer.extra.msg.metaAgentPrefix')}${c.agentNo}` : t('cc.ivr.designer.extra.msg.metaUnsetAgent')
    case 'queue': return c.skillGroupId ? `${t('cc.ivr.designer.extra.msg.metaSkillPrefix')}${c.skillGroupId}` : t('cc.ivr.designer.extra.msg.metaUnsetSkill')
    case 'condition': return `${c.variable || '?'} ${c.op || '=='} ${c.value || ''}`
    default: return ''
  }
}

function selectNode(n: IvrNode) {
  selectedNodeId.value = n.id
  selectedEdgeId.value = null
  if (!n.config) n.config = {}
  if (n.type === 'menu' && !(n.config as any).options) (n.config as any).options = {}
}
function selectEdge(e: IvrEdge) {
  selectedEdgeId.value = e.id
  selectedNodeId.value = null
}
function clearSelection() {
  selectedNodeId.value = null
  selectedEdgeId.value = null
}

// ---------- Drag from palette ----------
let dragNodeType: string | null = null
function onPaletteDragStart(e: DragEvent, np: any) {
  if (np.type === 'start' && hasStart.value) {
    e.preventDefault()
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnHasStart'))
    return
  }
  dragNodeType = np.type
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'copy'
    e.dataTransfer.setData('text/node-type', np.type)
  }
}
function onCanvasDrop(e: DragEvent) {
  e.preventDefault()
  const t = e.dataTransfer?.getData('text/node-type') || dragNodeType
  if (!t) return
  if (t === 'start' && hasStart.value) {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnHasStart'))
    return
  }
  const rect = canvasInner.value!.getBoundingClientRect()
  const w = isTerminal(t) ? TERM_R : NODE_W
  const h = isTerminal(t) ? TERM_R : NODE_H
  const x = Math.max(20, Math.round((e.clientX - rect.left - w / 2) / 10) * 10)
  const y = Math.max(20, Math.round((e.clientY - rect.top - h / 2) / 10) * 10)
  const id = genId('n')
  const node: IvrNode = {
    id,
    type: t as any,
    name: typeLabel(t),
    x,
    y,
    config: {}
  }
  applyDefault(node)
  local.nodes.push(node)
  selectNode(node)
  dragNodeType = null
}

function applyDefault(node: IvrNode) {
  switch (node.type) {
    case 'menu':
      node.config = { prompt: t('cc.ivr.designer.extra.msg.menuPromptDefault'), timeout: 5, options: {} }
      break
    case 'play':
      node.config = { audio: '', text: '' }
      break
    case 'tts':
      node.config = { text: '', voice: 'female-std' }
      break
    case 'transfer':
      node.config = { agentNo: '', timeout: 30, fallback: 'hangup' }
      break
    case 'queue':
      node.config = { skillGroupId: 1, queueAudio: 'hold-music.wav', timeout: 60, strategy: 'least-busy' }
      break
    case 'condition':
      node.config = { variable: '', op: '==', value: '' }
      break
    case 'collect':
      node.config = { variable: '', value: '', persist: false }
      break
    case 'hangup':
      node.config = { byeAudio: 'bye.wav', cause: 'NORMAL_CLEARING' }
      break
    default:
      node.config = {}
  }
}

// ---------- Node drag ----------
let nodeDragState: { node: IvrNode; offX: number; offY: number; moved: boolean } | null = null
function startNodeDrag(e: MouseEvent, n: IvrNode) {
  selectNode(n)
  const rect = canvasInner.value!.getBoundingClientRect()
  nodeDragState = {
    node: n,
    offX: e.clientX - rect.left - n.x,
    offY: e.clientY - rect.top - n.y,
    moved: false
  }
  document.addEventListener('mousemove', onNodeDragMove)
  document.addEventListener('mouseup', onNodeDragEnd)
}
function onNodeDragMove(e: MouseEvent) {
  if (!nodeDragState) return
  const rect = canvasInner.value!.getBoundingClientRect()
  nodeDragState.node.x = Math.max(
    0,
    Math.round((e.clientX - rect.left - nodeDragState.offX) / 5) * 5
  )
  nodeDragState.node.y = Math.max(
    0,
    Math.round((e.clientY - rect.top - nodeDragState.offY) / 5) * 5
  )
  nodeDragState.moved = true
}
function onNodeDragEnd() {
  nodeDragState = null
  document.removeEventListener('mousemove', onNodeDragMove)
  document.removeEventListener('mouseup', onNodeDragEnd)
}

// ---------- Canvas pan ----------
let panState: { sx: number; sy: number; ox: number; oy: number } | null = null
function onCanvasMouseDown(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.dz-node') || target.closest('.dz-edge')) return
  panState = { sx: e.clientX, sy: e.clientY, ox: pan.x, oy: pan.y }
  document.addEventListener('mousemove', onCanvasMove)
  document.addEventListener('mouseup', onCanvasUp)
}
function onCanvasMove(e: MouseEvent) {
  if (!panState) return
  pan.x = panState.ox + (e.clientX - panState.sx)
  pan.y = panState.oy + (e.clientY - panState.sy)
}
function onCanvasUp() {
  panState = null
  document.removeEventListener('mousemove', onCanvasMove)
  document.removeEventListener('mouseup', onCanvasUp)
}

// ---------- Connection drag ----------
const dragLine = ref<string | null>(null)
let connectFrom: { node: IvrNode } | null = null
function onPortMouseDown(e: MouseEvent, n: IvrNode) {
  connectFrom = { node: n }
  document.addEventListener('mousemove', onConnectMove)
  document.addEventListener('mouseup', onConnectUp)
}
function onConnectMove(e: MouseEvent) {
  if (!connectFrom) return
  const rect = canvasInner.value!.getBoundingClientRect()
  const sx = connectFrom.node.x + nodeWidth(connectFrom.node)
  const sy = connectFrom.node.y + nodeHalfH(connectFrom.node)
  const ex = e.clientX - rect.left
  const ey = e.clientY - rect.top
  dragLine.value = bezierPath(sx, sy, ex, ey)
}
function onConnectUp() {
  // Will be cancelled if no port mouseup
  setTimeout(() => {
    connectFrom = null
    dragLine.value = null
  }, 0)
  document.removeEventListener('mousemove', onConnectMove)
  document.removeEventListener('mouseup', onConnectUp)
}
function onPortMouseUp(target: IvrNode) {
  if (!connectFrom) return
  if (connectFrom.node.id === target.id) {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnNoSelfLoop'))
  } else {
    const exists = local.edges.some(
      (e) => e.source === connectFrom!.node.id && e.target === target.id
    )
    if (exists) {
      ElMessage.warning(t('cc.ivr.designer.extra.msg.warnEdgeExists'))
    } else {
      local.edges.push({
        id: genId('e'),
        source: connectFrom.node.id,
        target: target.id
      })
    }
  }
  connectFrom = null
  dragLine.value = null
}

// ---------- Geometry ----------
function nodeWidth(n: IvrNode) {
  return isTerminal(n.type) ? TERM_R : NODE_W
}
function nodeHeight(n: IvrNode) {
  return isTerminal(n.type) ? TERM_R : NODE_H
}
function nodeHalfH(n: IvrNode) {
  return nodeHeight(n) / 2
}
function bezierFor(e: IvrEdge): string {
  const s = local.nodes.find((x) => x.id === e.source)
  const t = local.nodes.find((x) => x.id === e.target)
  if (!s || !t) return ''
  const sx = s.x + nodeWidth(s)
  const sy = s.y + nodeHalfH(s)
  const ex = t.x
  const ey = t.y + nodeHalfH(t)
  return bezierPath(sx, sy, ex, ey)
}
function bezierPath(sx: number, sy: number, ex: number, ey: number) {
  const dx = Math.max(60, Math.abs(ex - sx) / 2)
  return `M ${sx},${sy} C ${sx + dx},${sy} ${ex - dx},${ey} ${ex},${ey}`
}
function midPoint(e: IvrEdge) {
  const s = local.nodes.find((x) => x.id === e.source)
  const t = local.nodes.find((x) => x.id === e.target)
  if (!s || !t) return { x: 0, y: 0 }
  const sx = s.x + nodeWidth(s)
  const sy = s.y + nodeHalfH(s)
  const ex = t.x
  const ey = t.y + nodeHalfH(t)
  return { x: (sx + ex) / 2, y: (sy + ey) / 2 }
}
function labelWidth(label?: string) {
  if (!label) return 0
  return Math.max(28, label.length * 12 + 12)
}

// ---------- Mutations ----------
function deleteNode(n: IvrNode) {
  if (n.type === 'start') {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnStartUndeletable'))
    return
  }
  local.edges = local.edges.filter(
    (e) => e.source !== n.id && e.target !== n.id
  )
  local.nodes = local.nodes.filter((x) => x.id !== n.id)
  selectedNodeId.value = null
}
function deleteEdge(e: IvrEdge) {
  local.edges = local.edges.filter((x) => x.id !== e.id)
  selectedEdgeId.value = null
}
function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (selectedNode.value) deleteNode(selectedNode.value)
    else if (selectedEdge.value) deleteEdge(selectedEdge.value)
  }
}
function clearCanvas() {
  ElMessageBox.confirm(
    t('cc.ivr.designer.extra.msg.confirmClearText'),
    t('cc.ivr.designer.extra.msg.confirmClearTitle'),
    { type: 'warning', confirmButtonText: t('cc.ivr.designer.extra.msg.confirmClearOk'), cancelButtonText: t('common.cancel') }
  )
    .then(() => {
      local.nodes = []
      local.edges = []
      selectedNodeId.value = null
      selectedEdgeId.value = null
    })
    .catch(() => {})
}
function autoLayout() {
  const start = local.nodes.find((n) => n.type === 'start')
  if (!start) {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnNoStart'))
    return
  }
  const levels: Record<string, number> = { [start.id]: 0 }
  const queue: string[] = [start.id]
  while (queue.length) {
    const id = queue.shift()!
    const lv = levels[id]
    local.edges
      .filter((e) => e.source === id)
      .forEach((e) => {
        if (levels[e.target] === undefined) {
          levels[e.target] = lv + 1
          queue.push(e.target)
        }
      })
  }
  const byLevel: Record<number, IvrNode[]> = {}
  local.nodes.forEach((n) => {
    const l = levels[n.id] ?? 0
    ;(byLevel[l] = byLevel[l] || []).push(n)
  })
  Object.entries(byLevel).forEach(([l, ns]) => {
    const lv = +l
    ns.forEach((n, i) => {
      n.x = 80 + lv * 220
      n.y = 80 + i * 120
    })
  })
  ElMessage.success(t('cc.ivr.designer.extra.msg.successAutoLayout'))
}

function genId(prefix: string) {
  const set = new Set([
    ...local.nodes.map((n) => n.id),
    ...local.edges.map((e) => e.id)
  ])
  let i = 1
  while (set.has(`${prefix}${i}`)) i++
  return `${prefix}${i}`
}

function onSave() {
  if (!local.name?.trim()) {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnFlowName'))
    return
  }
  if (!hasStart.value) {
    ElMessage.warning(t('cc.ivr.designer.extra.msg.warnNoStartSave'))
    return
  }
  emit('save', JSON.parse(JSON.stringify(local)))
}

const jsonVisible = ref(false)
const jsonText = computed(() =>
  JSON.stringify(
    {
      id: local.id,
      name: local.name,
      description: local.description,
      version: local.version,
      nodes: local.nodes,
      edges: local.edges
    },
    null,
    2
  )
)

onMounted(() => {
  const start = local.nodes.find((n) => n.type === 'start')
  if (start && canvasWrap.value) {
    const rect = canvasWrap.value.getBoundingClientRect()
    pan.x = Math.max(0, rect.width / 2 - 400 - start.x)
    pan.y = Math.max(0, rect.height / 2 - 200 - start.y)
  }
})
onBeforeUnmount(() => {
  document.removeEventListener('mousemove', onNodeDragMove)
  document.removeEventListener('mouseup', onNodeDragEnd)
  document.removeEventListener('mousemove', onCanvasMove)
  document.removeEventListener('mouseup', onCanvasUp)
  document.removeEventListener('mousemove', onConnectMove)
  document.removeEventListener('mouseup', onConnectUp)
})
</script>

<style scoped>
.ivr-designer {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 96px);
  background: var(--bg-darkest, #0a0a0f);
  color: var(--text-primary, #f0e6d3);
  border: 1px solid var(--border-gold, rgba(212, 175, 55, 0.2));
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--shadow-card);
  outline: none;
}

.dz-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.08), transparent 70%);
  border-bottom: 1px solid var(--border-gold);
  flex-shrink: 0;
}
.dz-tb-left,
.dz-tb-right {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dz-vline {
  width: 1px;
  height: 22px;
  background: var(--border-gold);
}
.dz-name {
  width: 280px;
}
.dz-status-tag {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 0.5px;
}

.dz-body {
  flex: 1;
  display: grid;
  grid-template-columns: 264px 1fr 340px;
  min-height: 0;
}

/* PALETTE */
.dz-palette {
  border-right: 1px solid var(--border-gold);
  padding: 18px 14px;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f0f16 0%, #0a0a0f 100%);
}
.dz-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 4px;
  color: var(--gold-primary, #d4af37);
  text-transform: uppercase;
  margin-bottom: 14px;
  font-weight: 600;
}
.t-bar {
  display: inline-block;
  width: 18px;
  height: 1px;
  background: var(--gold-primary, #d4af37);
}
.dz-palette-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  background: #12121a;
  cursor: grab;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
}
.dz-palette-item::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.06), transparent);
  transform: translateX(-100%);
  transition: transform 0.5s;
}
.dz-palette-item:hover::before { transform: translateX(100%); }
.dz-palette-item:hover {
  border-color: var(--gold-primary);
  transform: translateX(2px);
  box-shadow: 0 0 18px rgba(212, 175, 55, 0.18);
}
.dz-palette-item:active {
  cursor: grabbing;
  transform: scale(0.98);
}
.dz-palette-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.dz-pi-icon {
  width: 36px;
  height: 36px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-size: 18px;
  flex-shrink: 0;
  box-shadow: 0 0 12px var(--node-color);
}
.dz-pi-info {
  flex: 1;
  min-width: 0;
}
.dz-pi-name {
  font-size: 13.5px;
  color: var(--text-primary);
  font-weight: 600;
}
.dz-pi-desc {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}
.dz-pi-grip {
  color: var(--text-muted);
  font-size: 14px;
  opacity: 0.4;
  letter-spacing: -3px;
}

.dz-stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.dz-stat {
  background: #12121a;
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 14px 8px;
  text-align: center;
}
.dz-stat-num {
  font-size: 26px;
  font-weight: 800;
  color: var(--gold-primary);
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  letter-spacing: 1px;
  line-height: 1;
}
.dz-stat-lab {
  font-size: 10px;
  color: var(--text-body);
  margin-top: 6px;
  letter-spacing: 3px;
}

/* CANVAS */
.dz-canvas-wrap {
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at center, #0e0e16 0%, #0a0a0f 100%);
  cursor: grab;
}
.dz-canvas-wrap:active { cursor: grabbing; }
.dz-canvas-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 10px 10px, rgba(212, 175, 55, 0.13) 1px, transparent 1.5px),
    radial-gradient(circle at 80px 80px, rgba(212, 175, 55, 0.05) 1px, transparent 1.5px);
  background-size: 20px 20px, 160px 160px;
  pointer-events: none;
  opacity: 0.85;
}
.dz-canvas-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 2400px;
  height: 1800px;
  transform-origin: 0 0;
}
.dz-svg {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
}
.dz-svg path,
.dz-svg .dz-edge-label-wrap {
  pointer-events: auto;
}
.dz-edge {
  fill: none;
  stroke: #d4af37;
  stroke-width: 2;
  marker-end: url(#arrow-gold);
  cursor: pointer;
  transition: stroke-width 0.2s;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.3));
}
.dz-edge:hover { stroke-width: 3; }
.dz-edge.active {
  stroke: #06d6a0;
  stroke-width: 3;
  marker-end: url(#arrow-active);
  filter: drop-shadow(0 0 6px rgba(6, 214, 160, 0.6));
  stroke-dasharray: 6 4;
  animation: dash 1s linear infinite;
}
.dz-edge.dragging {
  stroke: #06d6a0;
  stroke-dasharray: 5 4;
  marker-end: none;
  animation: dash 0.6s linear infinite;
}
@keyframes dash {
  to { stroke-dashoffset: -20; }
}
.dz-edge-label {
  font-size: 11px;
  fill: #d4af37;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  text-anchor: middle;
  cursor: pointer;
  user-select: none;
}
.dz-edge-label-bg {
  fill: #0a0a0f;
  stroke: #d4af37;
  stroke-width: 1;
  cursor: pointer;
}

/* NODE */
.dz-node {
  position: absolute;
  width: 160px;
  background: #12121a;
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  cursor: move;
  user-select: none;
  transition: box-shadow 0.25s, border-color 0.25s;
  font-size: 13px;
}
.dz-node:hover {
  border-color: var(--gold-primary);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.5), 0 0 14px rgba(212, 175, 55, 0.3);
}
.dz-node.selected {
  border-color: var(--gold-primary);
  box-shadow:
    0 0 0 2px rgba(212, 175, 55, 0.5),
    0 0 24px rgba(212, 175, 55, 0.4);
  z-index: 10;
}
.dz-node-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #0a0a0f;
  text-transform: uppercase;
  border-radius: 9px 9px 0 0;
  font-family: 'JetBrains Mono', monospace;
}
.dz-node-body {
  padding: 9px 12px 11px;
}
.dz-node-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dz-node-meta {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'JetBrains Mono', monospace;
}

/* Terminal nodes (start/hangup) - circle */
.dz-node.terminal {
  width: 56px;
  height: 56px;
  background: transparent;
  border: none;
  text-align: center;
}
.dz-node.terminal:hover { box-shadow: none; }
.dz-node.terminal.selected { box-shadow: none; }
.dz-node.terminal.selected .dz-node-circle {
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.6),
    0 0 24px var(--gold-primary);
}
.dz-node-circle {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-size: 22px;
  border: 2px solid rgba(255, 255, 255, 0.18);
}
.dz-node.t-start .dz-node-circle {
  box-shadow: 0 0 24px rgba(6, 214, 160, 0.6);
}
.dz-node.t-hangup .dz-node-circle {
  box-shadow: 0 0 24px rgba(239, 68, 68, 0.6);
}
.dz-node-name {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  white-space: nowrap;
  color: var(--text-primary);
  letter-spacing: 1px;
  font-weight: 500;
}

/* Ports */
.dz-port {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #0a0a0f;
  border: 2px solid var(--gold-primary);
  border-radius: 50%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  cursor: crosshair;
  transition: transform 0.15s, box-shadow 0.15s, background 0.15s;
}
.dz-port:hover {
  background: var(--gold-primary);
  box-shadow: 0 0 12px var(--gold-primary);
  transform: translateY(-50%) scale(1.4);
}
.dz-node.terminal .dz-port {
  border-color: rgba(255, 255, 255, 0.6);
}
.port-in { left: -7px; }
.port-out { right: -7px; }

/* Helper bar */
.dz-helper {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 18px;
  background: rgba(18, 18, 26, 0.92);
  border: 1px solid var(--border-gold);
  border-radius: 100px;
  backdrop-filter: blur(8px);
  font-size: 11px;
  color: var(--text-body);
  letter-spacing: 0.6px;
  z-index: 5;
  box-shadow: var(--shadow-card);
}
.dz-helper b {
  color: var(--gold-primary);
  margin-right: 4px;
  font-weight: 600;
}
.dz-helper .dot {
  color: var(--gold-dark);
  font-size: 8px;
  font-style: normal;
}

.dz-watermark {
  position: absolute;
  bottom: 14px;
  right: 18px;
  font-size: 11px;
  color: rgba(212, 175, 55, 0.25);
  letter-spacing: 6px;
  font-family: 'JetBrains Mono', monospace;
  pointer-events: none;
  font-weight: 700;
}

/* PROPS */
.dz-props {
  border-left: 1px solid var(--border-gold);
  padding: 18px 16px;
  overflow-y: auto;
  background: linear-gradient(180deg, #0f0f16 0%, #0a0a0f 100%);
}
.dz-empty-state {
  text-align: center;
  padding: 60px 0 40px;
  color: var(--text-muted);
}
.dz-empty-art {
  font-size: 56px;
  color: var(--gold-dark);
  margin-bottom: 16px;
  letter-spacing: 4px;
  opacity: 0.6;
}
.dz-empty-text {
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 1px;
  color: var(--text-body);
}
.dz-empty-tip {
  margin-top: 24px;
  padding: 10px 14px;
  border: 1px dashed var(--border-gold);
  border-radius: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.dz-prop-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), transparent);
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  margin-bottom: 16px;
}
.dz-prop-icon {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0a0a0f;
  font-size: 18px;
}
.dz-prop-icon.edge-icon {
  background: var(--gold-primary);
}
.dz-prop-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 1px;
}
.dz-prop-id {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  margin-top: 2px;
}

.dz-form :deep(.el-form-item__label) {
  color: var(--gold-primary) !important;
  font-size: 11.5px !important;
  letter-spacing: 1px;
  font-weight: 500;
  padding-bottom: 4px !important;
}

.dz-pos {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-muted);
}
.dz-pos .ax {
  color: var(--gold-primary);
  font-family: monospace;
  font-weight: 700;
}
.dz-pos :deep(.el-input-number) {
  width: 110px;
}

.dz-keymap {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 280px;
  overflow-y: auto;
  padding-right: 4px;
}
.dz-keymap-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dz-key {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--gold-primary);
  border-radius: 6px;
  color: var(--gold-primary);
  font-family: monospace;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
  background: rgba(212, 175, 55, 0.04);
}

.dz-edge-path {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.dz-arrow {
  color: var(--gold-primary);
  font-size: 16px;
  font-weight: 700;
}

.dz-json {
  background: #0a0a0f;
  color: var(--gold-primary);
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 16px;
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.7;
  max-height: 60vh;
  overflow: auto;
  margin: 0;
}
</style>

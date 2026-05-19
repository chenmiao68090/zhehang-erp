<template>
  <div class="cc-number-page">
    <!-- 顶部装饰条 -->
    <div class="page-marquee">
      <div class="marquee-rail">
        <span class="marquee-tick">CALL CENTER · NUMBER REGISTRY</span>
        <span class="marquee-dot">◆</span>
        <span class="marquee-tick">SIP TRUNK CONSOLE</span>
        <span class="marquee-dot">◆</span>
        <span class="marquee-tick">{{ t('cc.number.marqueeBrand') }}</span>
        <span class="marquee-dot">◆</span>
        <span class="marquee-tick">REV. 2026.05</span>
      </div>
    </div>

    <!-- 页头 -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-eyebrow">
          <span class="eyebrow-dot"></span>
          <span>{{ t('cc.number.headerEyebrow') }}</span>
        </div>
        <h1 class="header-title">
          <span class="title-serif">{{ t('cc.number.titleLeft') }}</span>
          <span class="title-amp">&amp;</span>
          <span class="title-serif italic">{{ t('cc.number.titleRight') }}</span>
        </h1>
        <p class="header-sub">
          {{ t('cc.number.headerDesc') }}
        </p>
      </div>
      <div class="header-right">
        <div class="stat-tile">
          <div class="stat-label">{{ t('cc.number.stats.totalNumbers') }}</div>
          <div class="stat-value">{{ stats.totalNumbers }}</div>
          <div class="stat-foot">
            <span class="dot dot-idle"></span>{{ t('cc.number.status.idle') }} {{ stats.idleNumbers }}
          </div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">{{ t('cc.number.stats.trunkConcurrent') }}</div>
          <div class="stat-value">{{ stats.usedConcurrent }}<span class="stat-sub">/{{ stats.maxConcurrent }}</span></div>
          <div class="stat-foot">
            <span class="dot dot-busy"></span>{{ t('cc.number.stats.usageRate') }} {{ stats.concurrentRate }}%
          </div>
        </div>
        <div class="stat-tile">
          <div class="stat-label">{{ t('cc.number.stats.onlineTrunks') }}</div>
          <div class="stat-value">{{ stats.onlineTrunks }}<span class="stat-sub">/{{ stats.totalTrunks }}</span></div>
          <div class="stat-foot">
            <span class="dot dot-online"></span>{{ t('cc.number.stats.sipActive') }}
          </div>
        </div>
      </div>
    </header>

    <!-- 主面板 -->
    <section class="panel">
      <el-tabs v-model="activeTab" class="cc-tabs">
        <!-- ========== TAB 1 · 号码池 ========== -->
        <el-tab-pane name="numbers">
          <template #label>
            <span class="tab-label">
              <span class="tab-index">01</span>
              <span class="tab-name">{{ t('cc.number.tab.numberPoolMgmt') }}</span>
              <span class="tab-meta">{{ filteredNumbers.length }}</span>
            </span>
          </template>

          <!-- 工具栏 -->
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="numQuery.keyword"
                :placeholder="t('cc.number.searchPlaceholder')"
                clearable
                class="tool-input"
                @keyup.enter="loadNumbers"
                @clear="loadNumbers"
              >
                <template #prefix><el-icon><Search /></el-icon></template>
              </el-input>
              <el-select v-model="numQuery.kind" :placeholder="t('cc.number.form.type')" clearable class="tool-select" @change="loadNumbers">
                <el-option :label="t('cc.number.type.400')" value="400" />
                <el-option :label="t('cc.number.type.landline')" value="landline" />
                <el-option :label="t('cc.number.type.mobile')" value="mobile" />
              </el-select>
              <el-select v-model="numQuery.status" :placeholder="t('cc.number.column.status')" clearable class="tool-select" @change="loadNumbers">
                <el-option :label="t('cc.number.status.idle')" value="idle" />
                <el-option :label="t('cc.number.status.busy')" value="busy" />
                <el-option :label="t('cc.number.status.disabled')" value="disabled" />
              </el-select>
            </div>
            <div class="toolbar-right">
              <el-button class="btn-ghost" @click="openImportDialog">
                <el-icon><Upload /></el-icon>{{ t('cc.number.action.batchImport') }}
              </el-button>
              <el-button class="btn-gold" @click="openNumberDialog()">
                <el-icon><Plus /></el-icon>{{ t('cc.number.action.addNumber') }}
              </el-button>
            </div>
          </div>

          <!-- 号码表格 -->
          <div class="table-wrap" v-loading="loadingNum" element-loading-background="rgba(10,10,15,0.6)">
            <el-table
              :data="filteredNumbers"
              class="cc-table"
              :row-class-name="rowClass"
              :empty-text="t('cc.number.emptyNumbers')"
              stripe
            >
              <el-table-column label="#" type="index" width="56" align="center" />
              <el-table-column :label="t('cc.number.column.number')" min-width="180">
                <template #default="{ row }">
                  <div class="cell-number">
                    <span class="num-mono">{{ row.number }}</span>
                    <span class="num-tag" :class="'tag-kind-' + getNumberKind(row.number)">
                      {{ kindLabel(getNumberKind(row.number)) }}
                    </span>
                  </div>
                  <div class="cell-sub">{{ row.callerIdName || '—' }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.column.region')" width="160">
                <template #default="{ row }">
                  <div class="cell-region">
                    <el-icon class="region-icon"><Location /></el-icon>
                    <span>{{ row.province || '—' }} · {{ row.city || '—' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.column.direction')" width="120">
                <template #default="{ row }">
                  <span class="dir-pill" :class="'dir-' + row.type">
                    {{ dirLabel(row.type) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.column.status')" width="130">
                <template #default="{ row }">
                  <span class="status-badge" :class="'st-' + getNumberStatus(row)">
                    <span class="status-orb"></span>
                    {{ statusLabel(getNumberStatus(row)) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.column.boundAgent')" width="160">
                <template #default="{ row }">
                  <div v-if="getBindAgent(row.id)" class="cell-agent">
                    <span class="agent-avatar">{{ getBindAgent(row.id)!.name.charAt(0) }}</span>
                    <div>
                      <div class="agent-name">{{ getBindAgent(row.id)!.name }}</div>
                      <div class="agent-ext">{{ t('cc.number.extPrefix') }} {{ getBindAgent(row.id)!.extension }}</div>
                    </div>
                  </div>
                  <span v-else class="text-muted">— {{ t('cc.number.unbound') }} —</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.column.monthlyFee')" width="120" align="right">
                <template #default="{ row }">
                  <span class="fee-mono">¥ {{ getMonthlyFee(row).toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.operation')" width="220" fixed="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <button class="link-act" @click="openNumberDialog(row)">{{ t('common.edit') }}</button>
                    <span class="act-sep">/</span>
                    <button class="link-act" :class="row.enabled ? 'warn' : 'ok'" @click="toggleNumber(row)">
                      {{ row.enabled ? t('common.disable') : t('common.enable') }}
                    </button>
                    <span class="act-sep">/</span>
                    <button class="link-act danger" @click="deleteNumber(row)">{{ t('common.delete') }}</button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- ========== TAB 2 · SIP 中继 ========== -->
        <el-tab-pane name="trunks">
          <template #label>
            <span class="tab-label">
              <span class="tab-index">02</span>
              <span class="tab-name">{{ t('cc.number.tab.trunkMgmt') }}</span>
              <span class="tab-meta">{{ trunks.length }}</span>
            </span>
          </template>

          <div class="toolbar">
            <div class="toolbar-left">
              <div class="trunk-summary">
                <span class="sum-key">{{ t('cc.number.trunk.activeLinks') }}</span>
                <span class="sum-val">{{ stats.onlineTrunks }} <em>/</em> {{ stats.totalTrunks }}</span>
                <span class="sum-divider"></span>
                <span class="sum-key">{{ t('cc.number.trunk.totalConcurrent') }}</span>
                <span class="sum-val">{{ stats.usedConcurrent }} <em>/</em> {{ stats.maxConcurrent }}</span>
              </div>
            </div>
            <div class="toolbar-right">
              <el-button class="btn-ghost" @click="loadTrunks">
                <el-icon><Refresh /></el-icon>{{ t('common.refresh') }}
              </el-button>
              <el-button class="btn-gold" @click="openTrunkDialog()">
                <el-icon><Plus /></el-icon>{{ t('cc.number.trunk.action.add') }}
              </el-button>
            </div>
          </div>

          <div class="table-wrap" v-loading="loadingTrunk" element-loading-background="rgba(10,10,15,0.6)">
            <el-table :data="trunks" class="cc-table" stripe :empty-text="t('cc.number.emptyTrunks')">
              <el-table-column label="#" type="index" width="56" align="center" />
              <el-table-column :label="t('cc.number.trunk.column.name')" min-width="200">
                <template #default="{ row }">
                  <div class="cell-trunk">
                    <span class="trunk-icon">⬡</span>
                    <div>
                      <div class="trunk-name">{{ row.name }}</div>
                      <div class="trunk-sub">{{ row.remark || '—' }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.trunk.column.ipAddr')" width="180">
                <template #default="{ row }">
                  <span class="ip-mono">{{ row.host }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.trunk.column.port')" width="100" align="center">
                <template #default="{ row }">
                  <span class="port-chip">:{{ row.port }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.trunk.column.protocol')" width="110" align="center">
                <template #default="{ row }">
                  <span class="proto-tag" :class="'proto-' + getProto(row).toLowerCase()">{{ getProto(row) }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.trunk.column.concurrent')" width="200">
                <template #default="{ row }">
                  <div class="conc-wrap">
                    <div class="conc-bar">
                      <div
                        class="conc-fill"
                        :style="{ width: getConcRate(row) + '%' }"
                        :class="getConcLevel(row)"
                      ></div>
                    </div>
                    <div class="conc-text">
                      <span class="conc-cur">{{ getCurrentConc(row) }}</span>
                      <span class="conc-slash">/</span>
                      <span class="conc-max">{{ row.channels }}</span>
                    </div>
                  </div>
                </template>
              </el-table-column>
              <el-table-column :label="t('cc.number.trunk.column.status')" width="130">
                <template #default="{ row }">
                  <span class="status-badge" :class="'st-trunk-' + row.status">
                    <span class="status-orb"></span>
                    {{ trunkStatusLabel(row.status) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.operation')" width="260" fixed="right">
                <template #default="{ row }">
                  <div class="row-actions">
                    <button class="link-act" @click="openTrunkDialog(row)">{{ t('common.edit') }}</button>
                    <span class="act-sep">/</span>
                    <button class="link-act" @click="testTrunk(row)">{{ t('cc.number.trunk.action.test') }}</button>
                    <span class="act-sep">/</span>
                    <button class="link-act" :class="row.status !== 'offline' ? 'warn' : 'ok'" @click="toggleTrunk(row)">
                      {{ row.status === 'offline' ? t('common.enable') : t('common.disable') }}
                    </button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- ========== Dialog · 号码新增/编辑 ========== -->
    <el-dialog
      v-model="numberDialog.visible"
      :title="numberDialog.id ? t('cc.number.form.editTitle') : t('cc.number.form.addTitle')"
      width="560px"
      class="lux-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-eyebrow">NUMBER REGISTRY · {{ numberDialog.id ? 'EDIT' : 'NEW' }}</div>
      <el-form :model="numberDialog.form" label-width="100px" label-position="left" class="lux-form">
        <el-form-item :label="t('cc.number.form.number')">
          <el-input v-model="numberDialog.form.number" :placeholder="t('cc.number.form.numberPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('cc.number.form.province')">
          <el-input v-model="numberDialog.form.province" :placeholder="t('cc.number.form.provincePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('cc.number.form.city')">
          <el-input v-model="numberDialog.form.city" :placeholder="t('cc.number.form.cityPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('cc.number.form.direction')">
          <el-select v-model="numberDialog.form.type" style="width:100%">
            <el-option :label="t('cc.number.direction.inbound')" value="inbound" />
            <el-option :label="t('cc.number.direction.outbound')" value="outbound" />
            <el-option :label="t('cc.number.direction.both')" value="both" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('cc.number.form.monthlyFee')">
          <el-input-number
            v-model="numberDialog.form.monthlyFee"
            :min="0"
            :precision="2"
            :step="10"
            controls-position="right"
            style="width:100%"
          />
        </el-form-item>
        <el-form-item :label="t('cc.number.form.callerIdName')">
          <el-input v-model="numberDialog.form.callerIdName" :placeholder="t('cc.number.form.callerIdNamePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('common.remark')">
          <el-input v-model="numberDialog.form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="numberDialog.visible = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn-gold" @click="submitNumber">{{ t('cc.number.form.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- ========== Dialog · SIP 中继新增/编辑 ========== -->
    <el-dialog
      v-model="trunkDialog.visible"
      :title="trunkDialog.id ? t('cc.number.trunk.form.editTitle') : t('cc.number.trunk.form.addTitle')"
      width="600px"
      class="lux-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-eyebrow">SIP TRUNK · {{ trunkDialog.id ? 'EDIT' : 'NEW' }}</div>
      <el-form :model="trunkDialog.form" label-width="110px" label-position="left" class="lux-form">
        <el-form-item :label="t('cc.number.trunk.form.name')">
          <el-input v-model="trunkDialog.form.name" :placeholder="t('cc.number.trunk.form.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.ipAddr')">
          <el-input v-model="trunkDialog.form.host" :placeholder="t('cc.number.trunk.form.hostPlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.port')">
          <el-input-number v-model="trunkDialog.form.port" :min="1" :max="65535" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.protocol')">
          <el-radio-group v-model="trunkDialog.form.protocolEx" class="proto-radio">
            <el-radio-button label="UDP" />
            <el-radio-button label="TCP" />
            <el-radio-button label="TLS" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.maxChannels')">
          <el-input-number v-model="trunkDialog.form.channels" :min="1" :max="2000" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.username')">
          <el-input v-model="trunkDialog.form.username" placeholder="SIP Auth User" />
        </el-form-item>
        <el-form-item :label="t('cc.number.trunk.form.password')">
          <el-input v-model="trunkDialog.form.password" type="password" show-password placeholder="●●●●●●" />
        </el-form-item>
        <el-form-item :label="t('common.remark')">
          <el-input v-model="trunkDialog.form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trunkDialog.visible = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn-ghost" @click="testTrunkForm">{{ t('cc.number.trunk.action.test') }}</el-button>
        <el-button class="btn-gold" @click="submitTrunk">{{ t('cc.number.form.submit') }}</el-button>
      </template>
    </el-dialog>

    <!-- ========== Dialog · 批量导入 ========== -->
    <el-dialog
      v-model="importDialog.visible"
      :title="t('cc.number.form.importTitle')"
      width="720px"
      class="lux-dialog import-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-eyebrow">BULK IMPORT · CSV / EXCEL</div>
      <div class="import-hint">
        <span class="hint-bullet">①</span> {{ t('cc.number.import.fieldOrder') }}
        <code>number, province, city, type(inbound/outbound/both), monthlyFee, callerIdName, remark</code>
      </div>
      <el-upload
        ref="uploadRef"
        class="lux-upload"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept=".csv,.xls,.xlsx"
        :on-change="handleFileChange"
      >
        <div class="upload-frame">
          <div class="upload-corner tl"></div>
          <div class="upload-corner tr"></div>
          <div class="upload-corner bl"></div>
          <div class="upload-corner br"></div>
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="upload-title">{{ t('cc.number.import.dragHint') }}</div>
          <div class="upload-sub">{{ t('cc.number.import.or') }}<em>{{ t('cc.number.import.clickSelect') }}</em>{{ t('cc.number.import.fileTypes') }}</div>
        </div>
      </el-upload>

      <div v-if="importDialog.preview.length" class="preview-block">
        <div class="preview-head">
          <span class="preview-title">{{ t('cc.number.import.previewTitle') }}</span>
          <span class="preview-stat">
            {{ t('cc.number.import.previewStats', { total: importDialog.preview.length, valid: importDialog.validCount, error: importDialog.preview.length - importDialog.validCount }) }}
          </span>
        </div>
        <div class="preview-table-wrap">
          <table class="preview-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{{ t('cc.number.column.number') }}</th>
                <th>{{ t('cc.number.import.province') }}</th>
                <th>{{ t('cc.number.import.city') }}</th>
                <th>{{ t('cc.number.column.direction') }}</th>
                <th>{{ t('cc.number.import.monthlyFee') }}</th>
                <th>{{ t('cc.number.column.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, i) in importDialog.preview" :key="i" :class="{ invalid: !p.valid }">
                <td>{{ i + 1 }}</td>
                <td class="mono">{{ p.number || '—' }}</td>
                <td>{{ p.province || '—' }}</td>
                <td>{{ p.city || '—' }}</td>
                <td>{{ p.type || '—' }}</td>
                <td class="mono">{{ p.monthlyFee || '—' }}</td>
                <td>
                  <span :class="p.valid ? 'pv-ok' : 'pv-err'">{{ p.valid ? t('cc.number.import.importable') : (p.error || t('cc.number.validation.numberFormat')) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialog.visible = false">{{ t('common.cancel') }}</el-button>
        <el-button class="btn-ghost" :disabled="!importDialog.preview.length" @click="resetImport">{{ t('cc.number.import.clear') }}</el-button>
        <el-button class="btn-gold" :disabled="!importDialog.validCount" @click="confirmImport">
          {{ t('cc.number.import.importBtn', { count: importDialog.validCount }) }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import {
  Search, Plus, Upload, UploadFilled, Refresh, Location
} from '@element-plus/icons-vue'
import {
  getNumbers, addNumber, getSipTrunks, getAgents,
  type PhoneNumber, type SipTrunk, type Agent
} from '@/api/call-center'

const { t } = useI18n()

// ============= 状态 =============
const activeTab = ref<'numbers' | 'trunks'>('numbers')
const loadingNum = ref(false)
const loadingTrunk = ref(false)

const numbers = ref<PhoneNumber[]>([])
const trunks = ref<(SipTrunk & { protocolEx?: string; password?: string })[]>([])
const agents = ref<Agent[]>([])

const numQuery = reactive({
  keyword: '',
  kind: '' as '' | '400' | 'landline' | 'mobile',
  status: '' as '' | 'idle' | 'busy' | 'disabled'
})

// 本地扩展数据：月租费、绑定坐席、当前并发（接口未返回）
const localFee = reactive<Record<number, number>>({})
const localBind = reactive<Record<number, number>>({})    // numberId -> agentId
const localConc = reactive<Record<number, number>>({})    // trunkId -> currentConc
const localProto = reactive<Record<number, string>>({})   // trunkId -> UDP/TCP/TLS

// ============= 计算 =============
const stats = computed(() => {
  const total = numbers.value.length
  const idle = numbers.value.filter(n => n.enabled && !localBind[n.id]).length
  const totalTrunks = trunks.value.length
  const onlineTrunks = trunks.value.filter(t => t.status === 'online').length
  const maxConcurrent = trunks.value.reduce((s, t) => s + t.channels, 0)
  const usedConcurrent = trunks.value.reduce((s, t) => s + (localConc[t.id] || 0), 0)
  const concurrentRate = maxConcurrent ? Math.round((usedConcurrent / maxConcurrent) * 100) : 0
  return { totalNumbers: total, idleNumbers: idle, totalTrunks, onlineTrunks, maxConcurrent, usedConcurrent, concurrentRate }
})

const filteredNumbers = computed(() => {
  return numbers.value.filter(n => {
    if (numQuery.kind && getNumberKind(n.number) !== numQuery.kind) return false
    if (numQuery.status && getNumberStatus(n) !== numQuery.status) return false
    return true
  })
})

// ============= 工具方法 =============
function getNumberKind(num: string): '400' | 'landline' | 'mobile' {
  if (!num) return 'landline'
  const clean = num.replace(/[^0-9]/g, '')
  if (clean.startsWith('400') || clean.startsWith('800')) return '400'
  if (clean.startsWith('1') && clean.length === 11) return 'mobile'
  return 'landline'
}
function kindLabel(k: string) { return k === '400' ? t('cc.number.type.400') : k === 'mobile' ? t('cc.number.type.mobile') : t('cc.number.type.landline') }
function dirLabel(d: string) { return d === 'inbound' ? t('cc.number.direction.inbound') : d === 'outbound' ? t('cc.number.direction.outbound') : t('cc.number.direction.both') }
function statusLabel(s: string) { return s === 'idle' ? t('cc.number.status.idle') : s === 'busy' ? t('cc.number.status.busy') : t('cc.number.status.disabled') }
function trunkStatusLabel(s: string) { return s === 'online' ? t('cc.number.trunk.status.online') : s === 'offline' ? t('cc.number.trunk.status.offline') : t('cc.number.trunk.status.abnormal') }

function getNumberStatus(row: PhoneNumber): 'idle' | 'busy' | 'disabled' {
  if (!row.enabled) return 'disabled'
  if (localBind[row.id]) return 'busy'
  return 'idle'
}
function getMonthlyFee(row: PhoneNumber): number {
  if (localFee[row.id] != null) return localFee[row.id]
  const k = getNumberKind(row.number)
  return k === '400' ? 300 : k === 'mobile' ? 50 : 80
}
function getBindAgent(numberId: number): Agent | undefined {
  const aid = localBind[numberId]
  return aid ? agents.value.find(a => a.id === aid) : undefined
}
function getCurrentConc(t: SipTrunk): number {
  return localConc[t.id] ?? 0
}
function getConcRate(t: SipTrunk): number {
  return t.channels ? Math.round(((localConc[t.id] || 0) / t.channels) * 100) : 0
}
function getConcLevel(t: SipTrunk): string {
  const r = getConcRate(t)
  if (r >= 80) return 'lvl-hot'
  if (r >= 50) return 'lvl-warm'
  return 'lvl-cool'
}
function getProto(t: SipTrunk): string {
  return localProto[t.id] || 'UDP'
}
function rowClass({ row }: { row: PhoneNumber }) {
  const s = getNumberStatus(row)
  return 'cc-row cc-row-' + s
}

// ============= 数据加载 =============
async function loadNumbers() {
  loadingNum.value = true
  try {
    const res: any = await getNumbers({ keyword: numQuery.keyword || undefined })
    numbers.value = res.data.list
    // 初始化本地扩展数据
    numbers.value.forEach((n, i) => {
      if (localFee[n.id] == null) {
        const k = getNumberKind(n.number)
        localFee[n.id] = k === '400' ? 300 : k === 'mobile' ? 50 : 80
      }
      // 模拟随机绑定（部分号码绑定坐席）
      if (localBind[n.id] === undefined && agents.value.length && i % 3 === 0) {
        localBind[n.id] = agents.value[i % agents.value.length].id
      }
    })
  } finally {
    loadingNum.value = false
  }
}

async function loadTrunks() {
  loadingTrunk.value = true
  try {
    const res: any = await getSipTrunks()
    trunks.value = res.data
    trunks.value.forEach((t, i) => {
      if (localConc[t.id] == null) {
        // 模拟当前并发
        localConc[t.id] = t.status === 'online' ? Math.floor(t.channels * (0.2 + (i * 0.17) % 0.6)) : 0
      }
      if (!localProto[t.id]) {
        localProto[t.id] = ['UDP', 'TCP', 'TLS'][i % 3]
      }
    })
  } finally {
    loadingTrunk.value = false
  }
}

async function loadAgents() {
  const res: any = await getAgents()
  agents.value = res.data.list
}

// ============= 号码 CRUD =============
const numberDialog = reactive({
  visible: false,
  id: 0 as number,
  form: {
    number: '',
    province: '',
    city: '',
    type: 'inbound' as PhoneNumber['type'],
    monthlyFee: 80,
    callerIdName: '',
    remark: ''
  }
})

function openNumberDialog(row?: PhoneNumber) {
  if (row) {
    numberDialog.id = row.id
    numberDialog.form = {
      number: row.number,
      province: row.province || '',
      city: row.city || '',
      type: row.type,
      monthlyFee: getMonthlyFee(row),
      callerIdName: row.callerIdName || '',
      remark: row.remark || ''
    }
  } else {
    numberDialog.id = 0
    numberDialog.form = { number: '', province: '', city: '', type: 'inbound', monthlyFee: 80, callerIdName: '', remark: '' }
  }
  numberDialog.visible = true
}

async function submitNumber() {
  if (!numberDialog.form.number) {
    ElMessage.warning(t('cc.number.validation.numberRequired'))
    return
  }
  if (numberDialog.id) {
    const row = numbers.value.find(n => n.id === numberDialog.id)
    if (row) {
      Object.assign(row, {
        number: numberDialog.form.number,
        province: numberDialog.form.province,
        city: numberDialog.form.city,
        type: numberDialog.form.type,
        callerIdName: numberDialog.form.callerIdName,
        remark: numberDialog.form.remark
      })
      localFee[row.id] = numberDialog.form.monthlyFee
    }
    ElMessage.success(t('cc.number.message.updateSuccess'))
  } else {
    const res: any = await addNumber({
      number: numberDialog.form.number,
      type: numberDialog.form.type,
      province: numberDialog.form.province,
      city: numberDialog.form.city,
      callerIdName: numberDialog.form.callerIdName,
      remark: numberDialog.form.remark,
      trunkId: trunks.value[0]?.id || 1
    })
    numbers.value.push(res.data)
    localFee[res.data.id] = numberDialog.form.monthlyFee
    ElMessage.success(t('cc.number.message.addSuccess'))
  }
  numberDialog.visible = false
}

async function toggleNumber(row: PhoneNumber) {
  row.enabled = !row.enabled
  ElMessage.success(row.enabled ? t('cc.number.message.enableSuccess') : t('cc.number.message.disableSuccess'))
}

async function deleteNumber(row: PhoneNumber) {
  try {
    await ElMessageBox.confirm(t('cc.number.message.deleteConfirm', { number: row.number }), t('cc.number.message.deleteTitle'), {
      type: 'warning',
      confirmButtonText: t('common.delete'),
      cancelButtonText: t('common.cancel')
    })
    numbers.value = numbers.value.filter(n => n.id !== row.id)
    delete localFee[row.id]
    delete localBind[row.id]
    ElMessage.success(t('cc.number.message.deleteSuccess'))
  } catch { /* cancel */ }
}

// ============= SIP 中继 CRUD =============
const trunkDialog = reactive({
  visible: false,
  id: 0 as number,
  form: {
    name: '',
    host: '',
    port: 5060,
    protocolEx: 'UDP',
    channels: 30,
    username: '',
    password: '',
    remark: ''
  }
})

function openTrunkDialog(row?: SipTrunk) {
  if (row) {
    trunkDialog.id = row.id
    trunkDialog.form = {
      name: row.name,
      host: row.host,
      port: row.port,
      protocolEx: getProto(row),
      channels: row.channels,
      username: row.username,
      password: '',
      remark: row.remark || ''
    }
  } else {
    trunkDialog.id = 0
    trunkDialog.form = { name: '', host: '', port: 5060, protocolEx: 'UDP', channels: 30, username: '', password: '', remark: '' }
  }
  trunkDialog.visible = true
}

function submitTrunk() {
  if (!trunkDialog.form.name || !trunkDialog.form.host) {
    ElMessage.warning(t('cc.number.trunk.validation.required'))
    return
  }
  if (trunkDialog.id) {
    const t = trunks.value.find(x => x.id === trunkDialog.id)
    if (t) {
      Object.assign(t, {
        name: trunkDialog.form.name,
        host: trunkDialog.form.host,
        port: trunkDialog.form.port,
        channels: trunkDialog.form.channels,
        username: trunkDialog.form.username,
        remark: trunkDialog.form.remark
      })
      localProto[t.id] = trunkDialog.form.protocolEx
    }
    ElMessage.success(t('cc.number.message.trunkUpdateSuccess'))
  } else {
    const nextId = Math.max(0, ...trunks.value.map(t => t.id)) + 1
    const next: SipTrunk = {
      id: nextId,
      name: trunkDialog.form.name,
      protocol: 'SIP',
      host: trunkDialog.form.host,
      port: trunkDialog.form.port,
      username: trunkDialog.form.username,
      status: 'offline',
      channels: trunkDialog.form.channels,
      remark: trunkDialog.form.remark
    }
    trunks.value.push(next)
    localProto[nextId] = trunkDialog.form.protocolEx
    localConc[nextId] = 0
    ElMessage.success(t('cc.number.message.trunkAddSuccess'))
  }
  trunkDialog.visible = false
}

function testTrunk(row: SipTrunk) {
  ElMessage.info(t('cc.number.trunk.message.testing', { name: row.name, host: row.host, port: row.port }))
  setTimeout(() => {
    const ok = row.status === 'online'
    if (ok) ElMessage.success(t('cc.number.trunk.message.testOk', { name: row.name, ms: 20 + Math.floor(Math.random() * 60) }))
    else ElMessage.warning(t('cc.number.trunk.message.testFail', { name: row.name }))
  }, 800)
}

function testTrunkForm() {
  if (!trunkDialog.form.host) {
    ElMessage.warning(t('cc.number.trunk.validation.hostRequired'))
    return
  }
  ElMessage.info(t('cc.number.trunk.message.testingHost', { host: trunkDialog.form.host, port: trunkDialog.form.port }))
  setTimeout(() => ElMessage.success(t('cc.number.trunk.message.testFormOk')), 700)
}

function toggleTrunk(row: SipTrunk) {
  row.status = row.status === 'offline' ? 'online' : 'offline'
  if (row.status === 'offline') localConc[row.id] = 0
  ElMessage.success(row.status === 'online' ? t('cc.number.trunk.message.enableSuccess') : t('cc.number.trunk.message.disableSuccess'))
}

// ============= 批量导入 =============
const importDialog = reactive({
  visible: false,
  preview: [] as Array<{ number: string; province: string; city: string; type: string; monthlyFee: string; callerIdName: string; remark: string; valid: boolean; error?: string }>,
  validCount: 0
})

function openImportDialog() {
  importDialog.visible = true
  importDialog.preview = []
  importDialog.validCount = 0
}

function resetImport() {
  importDialog.preview = []
  importDialog.validCount = 0
}

function handleFileChange(file: any) {
  const raw = file.raw as File
  if (!raw) return
  const name = raw.name.toLowerCase()
  if (name.endsWith('.csv')) {
    const reader = new FileReader()
    reader.onload = (e) => parseCSV(String(e.target?.result || ''))
    reader.readAsText(raw, 'UTF-8')
  } else {
    // Excel：演示场景使用预置示例数据
    parseCSV([
      'number,province,city,type,monthlyFee,callerIdName,remark',
      '4001008888,浙江,杭州,inbound,300,浙杭企服-客服,主客服',
      '13800138001,浙江,杭州,outbound,50,销售外呼,A组',
      '057188889999,浙江,杭州,both,80,销售线,通用',
      'BAD-NUM,浙江,杭州,inbound,80,异常号码,格式错误'
    ].join('\n'))
    ElMessage.info(t('cc.number.import.messages.demoLoaded'))
  }
}

function parseCSV(text: string) {
  const lines = text.split(/\r?\n/).filter(l => l.trim())
  if (lines.length < 2) {
    ElMessage.warning(t('cc.number.import.messages.empty'))
    return
  }
  const rows: typeof importDialog.preview = []
  let valid = 0
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(s => s.trim())
    const item = {
      number: cols[0] || '',
      province: cols[1] || '',
      city: cols[2] || '',
      type: cols[3] || 'inbound',
      monthlyFee: cols[4] || '0',
      callerIdName: cols[5] || '',
      remark: cols[6] || '',
      valid: false,
      error: ''
    }
    if (!/^[0-9\-]{5,}$/.test(item.number)) item.error = t('cc.number.validation.numberFormat')
    else if (!['inbound', 'outbound', 'both'].includes(item.type)) item.error = t('cc.number.validation.directionFormat')
    else { item.valid = true; valid++ }
    rows.push(item)
  }
  importDialog.preview = rows
  importDialog.validCount = valid
}

async function confirmImport() {
  const valid = importDialog.preview.filter(p => p.valid)
  for (const p of valid) {
    const res: any = await addNumber({
      number: p.number,
      type: p.type as PhoneNumber['type'],
      province: p.province,
      city: p.city,
      callerIdName: p.callerIdName,
      remark: p.remark,
      trunkId: trunks.value[0]?.id || 1
    })
    numbers.value.push(res.data)
    localFee[res.data.id] = parseFloat(p.monthlyFee) || 0
  }
  ElMessage.success(t('cc.number.message.importSuccess', { count: valid.length }))
  importDialog.visible = false
  resetImport()
}

// ============= 初始化 =============
onMounted(async () => {
  await loadAgents()
  await Promise.all([loadNumbers(), loadTrunks()])
})
</script>

<style scoped>
/* ===== 页面骨架 ===== */
.cc-number-page {
  min-height: calc(100vh - 120px);
  padding: 20px 28px 40px;
  background:
    radial-gradient(1200px 600px at 80% -10%, rgba(212, 175, 55, 0.08), transparent 60%),
    radial-gradient(900px 500px at -10% 110%, rgba(183, 110, 121, 0.05), transparent 60%),
    var(--bg-darkest);
  color: var(--text-primary);
  position: relative;
  font-feature-settings: 'ss01', 'cv11';
}
.cc-number-page::before {
  content: '';
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

/* ===== 跑马灯装饰 ===== */
.page-marquee {
  height: 28px;
  border-top: 1px solid var(--border-gold);
  border-bottom: 1px solid var(--border-gold);
  overflow: hidden;
  position: relative;
  margin-bottom: 24px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.04), transparent);
}
.marquee-rail {
  display: flex; gap: 32px; align-items: center;
  white-space: nowrap;
  height: 100%;
  animation: marquee 40s linear infinite;
  padding-left: 12px;
}
.marquee-tick {
  font-family: 'JetBrains Mono', 'Courier New', monospace;
  font-size: 11px;
  letter-spacing: 0.32em;
  color: var(--gold-primary);
  text-transform: uppercase;
}
.marquee-dot { color: var(--gold-dark); font-size: 10px; }
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ===== 页头 ===== */
.page-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  gap: 32px; padding: 8px 0 28px;
  border-bottom: 1px solid var(--border-gold);
  margin-bottom: 24px;
  position: relative; z-index: 2;
}
.header-left { max-width: 60%; }
.header-eyebrow {
  display: inline-flex; align-items: center; gap: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.3em;
  color: var(--gold-champagne);
  text-transform: uppercase;
  margin-bottom: 14px;
}
.eyebrow-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--gold-primary);
  box-shadow: 0 0 12px var(--gold-primary);
  animation: pulse 2s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.8); }
}
.header-title {
  font-family: 'Cormorant Garamond', 'Noto Serif SC', 'Songti SC', serif;
  font-weight: 500;
  font-size: 52px;
  line-height: 1;
  margin: 0;
  letter-spacing: -0.01em;
  color: var(--text-primary);
}
.title-serif { background: var(--gradient-gold); -webkit-background-clip: text; background-clip: text; color: transparent; }
.title-amp { font-style: italic; color: var(--gold-dark); margin: 0 12px; font-weight: 300; }
.title-serif.italic { font-style: italic; }
.header-sub {
  margin: 14px 0 0; max-width: 540px;
  color: var(--text-body);
  line-height: 1.7;
  font-size: 13px;
}
.header-right { display: flex; gap: 16px; }
.stat-tile {
  min-width: 140px;
  padding: 14px 18px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.06), rgba(18, 18, 26, 0.6));
  border: 1px solid var(--border-gold);
  border-radius: 4px;
  position: relative;
}
.stat-tile::before {
  content: '';
  position: absolute; top: 0; left: 0;
  width: 12px; height: 12px;
  border-top: 1px solid var(--gold-primary);
  border-left: 1px solid var(--gold-primary);
}
.stat-tile::after {
  content: '';
  position: absolute; bottom: 0; right: 0;
  width: 12px; height: 12px;
  border-bottom: 1px solid var(--gold-primary);
  border-right: 1px solid var(--gold-primary);
}
.stat-label {
  font-size: 10px; letter-spacing: 0.25em;
  color: var(--gold-champagne);
  text-transform: uppercase;
  margin-bottom: 6px;
}
.stat-value {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px; font-weight: 500;
  color: var(--text-primary);
  line-height: 1;
}
.stat-sub { font-size: 14px; color: var(--text-muted); margin-left: 4px; }
.stat-foot {
  margin-top: 8px;
  font-size: 11px; color: var(--text-body);
  display: flex; align-items: center; gap: 6px;
}
.dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.dot-idle { background: var(--success); box-shadow: 0 0 8px var(--success); }
.dot-busy { background: var(--gold-primary); box-shadow: 0 0 8px var(--gold-primary); }
.dot-online { background: var(--success); box-shadow: 0 0 8px var(--success); }

/* ===== 主面板 ===== */
.panel {
  background: var(--bg-card);
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  position: relative;
  overflow: hidden;
}
.panel::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: var(--gradient-gold);
  opacity: 0.6;
}

/* ===== Tabs ===== */
:deep(.cc-tabs .el-tabs__header) {
  margin: 0;
  padding: 0 24px;
  border-bottom: 1px solid var(--border-gold);
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.04), transparent);
}
:deep(.cc-tabs .el-tabs__nav-wrap::after) { display: none; }
:deep(.cc-tabs .el-tabs__active-bar) {
  background: var(--gradient-gold);
  height: 2px;
}
:deep(.cc-tabs .el-tabs__item) {
  height: 56px; line-height: 56px;
  padding: 0 28px;
  color: var(--text-body);
  font-size: 14px;
  border: none;
}
:deep(.cc-tabs .el-tabs__item.is-active) { color: var(--gold-primary); }
:deep(.cc-tabs .el-tabs__item:hover) { color: var(--gold-champagne); }
.tab-label { display: inline-flex; align-items: center; gap: 10px; }
.tab-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--gold-dark);
  letter-spacing: 0.2em;
  border: 1px solid var(--border-gold);
  padding: 2px 6px;
  border-radius: 2px;
}
.tab-name { font-weight: 500; letter-spacing: 0.05em; }
.tab-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--gold-champagne);
  background: rgba(212, 175, 55, 0.08);
  padding: 1px 8px;
  border-radius: 10px;
}

/* ===== 工具栏 ===== */
.toolbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 18px 24px;
  border-bottom: 1px dashed var(--border-gold);
}
.toolbar-left, .toolbar-right { display: flex; gap: 12px; align-items: center; }
.tool-input { width: 260px; }
.tool-select { width: 140px; }
:deep(.tool-input .el-input__wrapper),
:deep(.tool-select .el-input__wrapper) {
  background: rgba(10, 10, 15, 0.6);
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px var(--border-gold);
}
:deep(.tool-input .el-input__wrapper:hover),
:deep(.tool-select .el-input__wrapper:hover) {
  box-shadow: inset 0 0 0 1px var(--border-gold-hover);
}
:deep(.tool-input.is-focus .el-input__wrapper),
:deep(.tool-select .el-input__wrapper.is-focus) {
  box-shadow: inset 0 0 0 1px var(--gold-primary), 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.btn-gold, .btn-ghost {
  height: 36px;
  padding: 0 18px;
  border-radius: 3px;
  font-size: 13px;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  display: inline-flex; align-items: center; gap: 6px;
  transition: all 0.2s;
}
.btn-gold {
  background: var(--gradient-gold);
  color: #0A0A0F;
  font-weight: 600;
  box-shadow: 0 2px 12px rgba(212, 175, 55, 0.3);
}
.btn-gold:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 18px rgba(212, 175, 55, 0.5);
}
.btn-ghost {
  background: transparent;
  color: var(--gold-champagne);
  border: 1px solid var(--border-gold);
}
.btn-ghost:hover {
  background: rgba(212, 175, 55, 0.06);
  border-color: var(--gold-primary);
  color: var(--gold-primary);
}

.trunk-summary {
  display: flex; align-items: center; gap: 14px;
  padding: 8px 16px;
  border: 1px solid var(--border-gold);
  border-radius: 3px;
  background: rgba(212, 175, 55, 0.03);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}
.sum-key { color: var(--gold-champagne); letter-spacing: 0.15em; text-transform: uppercase; font-size: 10px; }
.sum-val { color: var(--text-primary); font-size: 16px; font-weight: 600; }
.sum-val em { color: var(--gold-dark); font-style: normal; margin: 0 4px; }
.sum-divider { width: 1px; height: 16px; background: var(--border-gold); }

/* ===== 表格 ===== */
.table-wrap { padding: 8px 24px 24px; }
:deep(.cc-table) {
  background: transparent;
  --el-table-border-color: rgba(212, 175, 55, 0.08);
  --el-table-header-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.04);
  --el-table-tr-bg-color: transparent;
  --el-table-bg-color: transparent;
  font-size: 13px;
}
:deep(.cc-table th.el-table__cell) {
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.06), transparent) !important;
  border-bottom: 1px solid var(--border-gold);
  color: var(--gold-champagne);
  font-weight: 500;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 14px 0;
}
:deep(.cc-table td.el-table__cell) {
  border-bottom: 1px dashed rgba(212, 175, 55, 0.06);
  padding: 14px 0;
}
:deep(.cc-table .cc-row-disabled td) { opacity: 0.5; }
:deep(.cc-table .el-table__inner-wrapper::before) { display: none; }

.cell-number { display: flex; align-items: center; gap: 10px; }
.num-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; letter-spacing: 0.04em;
  color: var(--text-primary);
  font-weight: 500;
}
.num-tag {
  font-size: 10px; padding: 2px 7px;
  border-radius: 2px; letter-spacing: 0.1em;
  border: 1px solid;
}
.tag-kind-400 { color: var(--gold-primary); border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.08); }
.tag-kind-mobile { color: #6BCB77; border-color: rgba(107, 203, 119, 0.4); background: rgba(107, 203, 119, 0.06); }
.tag-kind-landline { color: #7C8DB5; border-color: rgba(124, 141, 181, 0.4); background: rgba(124, 141, 181, 0.06); }
.cell-sub { font-size: 11px; color: var(--text-muted); margin-top: 4px; padding-left: 0; }

.cell-region { display: inline-flex; align-items: center; gap: 6px; color: var(--text-body); font-size: 12px; }
.region-icon { color: var(--gold-dark); font-size: 13px; }

.dir-pill {
  display: inline-flex; align-items: center;
  padding: 3px 10px;
  font-size: 11px; letter-spacing: 0.1em;
  border-radius: 12px;
  border: 1px solid;
}
.dir-inbound { color: #6BCB77; border-color: rgba(107, 203, 119, 0.4); background: rgba(107, 203, 119, 0.06); }
.dir-outbound { color: var(--gold-rose); border-color: rgba(183, 110, 121, 0.4); background: rgba(183, 110, 121, 0.06); }
.dir-both { color: var(--gold-primary); border-color: rgba(212, 175, 55, 0.4); background: rgba(212, 175, 55, 0.06); }

.status-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 2px;
  font-size: 11px; letter-spacing: 0.12em;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid;
}
.status-orb {
  width: 6px; height: 6px; border-radius: 50%;
  position: relative;
}
.status-orb::after {
  content: ''; position: absolute; inset: -3px;
  border-radius: 50%;
  animation: orb-ring 2s ease-out infinite;
}
.st-idle { color: var(--success); border-color: rgba(6, 214, 160, 0.3); }
.st-idle .status-orb { background: var(--success); box-shadow: 0 0 6px var(--success); }
.st-idle .status-orb::after { border: 1px solid var(--success); }
.st-busy { color: var(--gold-primary); border-color: rgba(212, 175, 55, 0.4); }
.st-busy .status-orb { background: var(--gold-primary); box-shadow: 0 0 6px var(--gold-primary); }
.st-busy .status-orb::after { border: 1px solid var(--gold-primary); }
.st-disabled { color: var(--text-muted); border-color: rgba(94, 90, 82, 0.3); }
.st-disabled .status-orb { background: var(--text-muted); }
.st-disabled .status-orb::after { display: none; }
.st-trunk-online { color: var(--success); border-color: rgba(6, 214, 160, 0.3); }
.st-trunk-online .status-orb { background: var(--success); box-shadow: 0 0 6px var(--success); }
.st-trunk-online .status-orb::after { border: 1px solid var(--success); }
.st-trunk-offline { color: var(--text-muted); border-color: rgba(94, 90, 82, 0.3); }
.st-trunk-offline .status-orb { background: var(--text-muted); }
.st-trunk-error { color: var(--danger); border-color: rgba(239, 68, 68, 0.4); }
.st-trunk-error .status-orb { background: var(--danger); box-shadow: 0 0 6px var(--danger); }
.st-trunk-error .status-orb::after { border: 1px solid var(--danger); }
@keyframes orb-ring {
  0% { transform: scale(0.6); opacity: 0.8; }
  100% { transform: scale(2); opacity: 0; }
}

.cell-agent { display: flex; align-items: center; gap: 10px; }
.agent-avatar {
  width: 30px; height: 30px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: 50%;
  background: var(--gradient-gold);
  color: #0A0A0F;
  font-weight: 600;
  font-size: 13px;
  font-family: 'Cormorant Garamond', serif;
}
.agent-name { font-size: 13px; color: var(--text-primary); }
.agent-ext { font-size: 10px; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; }
.text-muted { color: var(--text-muted); font-size: 12px; font-style: italic; }

.fee-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--gold-champagne);
  letter-spacing: 0.04em;
}

.row-actions { display: inline-flex; align-items: center; gap: 8px; }
.link-act {
  background: none; border: none; cursor: pointer;
  color: var(--gold-champagne);
  font-size: 12px;
  padding: 0; letter-spacing: 0.05em;
  position: relative;
  transition: color 0.2s;
}
.link-act:hover { color: var(--gold-primary); }
.link-act::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: -2px;
  height: 1px; background: currentColor;
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.25s;
}
.link-act:hover::after { transform: scaleX(1); }
.link-act.warn { color: var(--warning); }
.link-act.ok { color: var(--success); }
.link-act.danger { color: var(--danger); }
.act-sep { color: var(--text-muted); font-size: 11px; }

/* ===== 中继特有 ===== */
.cell-trunk { display: flex; align-items: center; gap: 12px; }
.trunk-icon {
  font-size: 18px; color: var(--gold-primary);
  text-shadow: 0 0 8px rgba(212, 175, 55, 0.5);
}
.trunk-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
.trunk-sub { font-size: 11px; color: var(--text-muted); margin-top: 3px; }
.ip-mono {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; color: var(--text-body);
  letter-spacing: 0.05em;
}
.port-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--gold-champagne);
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid var(--border-gold);
  padding: 2px 8px;
  border-radius: 2px;
}
.proto-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; font-weight: 600;
  letter-spacing: 0.15em;
  padding: 3px 8px;
  border-radius: 2px;
  border: 1px solid;
}
.proto-udp { color: #7C8DB5; border-color: rgba(124, 141, 181, 0.5); }
.proto-tcp { color: #6BCB77; border-color: rgba(107, 203, 119, 0.5); }
.proto-tls { color: var(--gold-primary); border-color: var(--gold-primary); background: rgba(212, 175, 55, 0.06); }

.conc-wrap { display: flex; align-items: center; gap: 12px; }
.conc-bar {
  flex: 1;
  height: 6px;
  background: rgba(212, 175, 55, 0.06);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}
.conc-bar::before {
  content: ''; position: absolute; inset: 0;
  background-image: linear-gradient(90deg, transparent 0, transparent 9px, rgba(0,0,0,0.3) 10px);
  background-size: 10px 100%;
}
.conc-fill {
  height: 100%;
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
.lvl-cool { background: linear-gradient(90deg, #06D6A0, #38e0b5); }
.lvl-warm { background: linear-gradient(90deg, #C5A55A, #D4AF37); }
.lvl-hot { background: linear-gradient(90deg, #B76E79, #EF4444); }
.conc-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-body);
}
.conc-cur { color: var(--text-primary); font-weight: 600; }
.conc-slash { margin: 0 3px; color: var(--text-muted); }
.conc-max { color: var(--gold-dark); }

/* ===== Dialog ===== */
:deep(.lux-dialog) {
  background: var(--bg-card);
  border: 1px solid var(--border-gold);
  border-radius: 4px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-gold);
  overflow: hidden;
  position: relative;
}
:deep(.lux-dialog::before) {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: var(--gradient-gold);
}
:deep(.lux-dialog .el-dialog__header) {
  padding: 22px 28px 0;
  border-bottom: none;
  margin: 0;
}
:deep(.lux-dialog .el-dialog__title) {
  font-family: 'Cormorant Garamond', 'Noto Serif SC', serif;
  font-size: 24px;
  font-weight: 500;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}
:deep(.lux-dialog .el-dialog__body) { padding: 8px 28px 24px; }
:deep(.lux-dialog .el-dialog__footer) {
  padding: 16px 28px 22px;
  border-top: 1px dashed var(--border-gold);
  background: rgba(10, 10, 15, 0.4);
}
.dialog-eyebrow {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.3em;
  color: var(--gold-champagne);
  text-transform: uppercase;
  margin: 0 0 22px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--border-gold);
}

.lux-form :deep(.el-form-item__label) {
  color: var(--text-body);
  font-size: 12px;
  letter-spacing: 0.05em;
}
.lux-form :deep(.el-input__wrapper),
.lux-form :deep(.el-textarea__inner),
.lux-form :deep(.el-input-number .el-input__wrapper) {
  background: rgba(10, 10, 15, 0.5);
  box-shadow: inset 0 0 0 1px var(--border-gold);
  border-radius: 3px;
}
.lux-form :deep(.el-input__wrapper:hover) {
  box-shadow: inset 0 0 0 1px var(--border-gold-hover);
}
.lux-form :deep(.is-focus .el-input__wrapper) {
  box-shadow: inset 0 0 0 1px var(--gold-primary), 0 0 0 3px rgba(212, 175, 55, 0.1);
}
.proto-radio :deep(.el-radio-button__inner) {
  background: rgba(10, 10, 15, 0.5);
  border-color: var(--border-gold);
  color: var(--text-body);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.15em;
  font-size: 12px;
  padding: 8px 18px;
}
.proto-radio :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background: var(--gradient-gold);
  color: #0A0A0F;
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 1px var(--gold-primary);
}

/* ===== Upload ===== */
.lux-upload :deep(.el-upload) { width: 100%; }
.lux-upload :deep(.el-upload-dragger) {
  background: transparent;
  border: none;
  padding: 0;
  width: 100%;
}
.upload-frame {
  position: relative;
  padding: 38px 20px;
  background:
    linear-gradient(135deg, rgba(212, 175, 55, 0.04), rgba(18, 18, 26, 0.4));
  border: 1px dashed var(--border-gold-hover);
  border-radius: 4px;
  transition: all 0.3s;
}
.upload-frame:hover {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(18, 18, 26, 0.4));
  border-color: var(--gold-primary);
}
.upload-corner {
  position: absolute; width: 14px; height: 14px;
  border: 1px solid var(--gold-primary);
}
.upload-corner.tl { top: 6px; left: 6px; border-right: none; border-bottom: none; }
.upload-corner.tr { top: 6px; right: 6px; border-left: none; border-bottom: none; }
.upload-corner.bl { bottom: 6px; left: 6px; border-right: none; border-top: none; }
.upload-corner.br { bottom: 6px; right: 6px; border-left: none; border-top: none; }
.upload-icon {
  font-size: 38px; color: var(--gold-primary);
  margin-bottom: 12px;
  filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.4));
}
.upload-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.upload-sub {
  font-size: 12px; color: var(--text-body);
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.05em;
}
.upload-sub em { color: var(--gold-primary); font-style: normal; text-decoration: underline; text-underline-offset: 3px; }

.import-hint {
  font-size: 12px;
  color: var(--text-body);
  margin-bottom: 14px;
  padding: 10px 14px;
  border-left: 2px solid var(--gold-primary);
  background: rgba(212, 175, 55, 0.04);
  border-radius: 0 3px 3px 0;
}
.hint-bullet { color: var(--gold-primary); margin-right: 6px; font-weight: 600; }
.import-hint code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--gold-champagne);
  background: rgba(0,0,0,0.3);
  padding: 2px 6px;
  border-radius: 2px;
  margin-left: 4px;
}

.preview-block { margin-top: 22px; }
.preview-head {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-gold);
  margin-bottom: 8px;
}
.preview-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  color: var(--text-primary);
}
.preview-stat {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-body);
  letter-spacing: 0.05em;
}
.preview-stat b { color: var(--text-primary); }
.preview-stat .ok { color: var(--success); }
.preview-stat .err { color: var(--danger); }

.preview-table-wrap { max-height: 240px; overflow: auto; border: 1px solid var(--border-gold); border-radius: 3px; }
.preview-table { width: 100%; border-collapse: collapse; font-size: 12px; }
.preview-table thead th {
  position: sticky; top: 0;
  background: var(--bg-elevated);
  color: var(--gold-champagne);
  font-size: 10px; letter-spacing: 0.18em;
  text-transform: uppercase;
  padding: 8px 10px;
  border-bottom: 1px solid var(--border-gold);
  text-align: left;
  font-weight: 500;
}
.preview-table tbody td {
  padding: 7px 10px;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.06);
  color: var(--text-body);
}
.preview-table .mono { font-family: 'JetBrains Mono', monospace; color: var(--text-primary); }
.preview-table tbody tr.invalid td { color: var(--text-muted); background: rgba(239, 68, 68, 0.03); }
.pv-ok { color: var(--success); font-size: 11px; }
.pv-err { color: var(--danger); font-size: 11px; }

/* ===== 响应式 ===== */
@media (max-width: 1280px) {
  .header-title { font-size: 40px; }
  .header-right { flex-wrap: wrap; }
}
@media (max-width: 980px) {
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-left { max-width: 100%; }
  .toolbar { flex-direction: column; gap: 12px; align-items: stretch; }
  .toolbar-left, .toolbar-right { flex-wrap: wrap; }
  .tool-input, .tool-select { width: 100%; }
}
</style>

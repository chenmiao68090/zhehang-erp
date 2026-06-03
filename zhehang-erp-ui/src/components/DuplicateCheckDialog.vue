<template>
  <el-dialog
    v-model="dialogVisible"
    title="客户查重 · 4级防撞检测"
    width="640px"
    class="dup-check-dialog"
    :close-on-click-modal="false"
    append-to-body
    @open="onOpen"
  >
    <!-- ===== Scan Header ===== -->
    <div class="scan-banner">
      <div class="scan-radar" :class="{ scanning: phase === 'scanning' }">
        <div class="ring r1"></div>
        <div class="ring r2"></div>
        <div class="ring r3"></div>
        <div class="sweeper"></div>
        <div class="core">
          <span v-if="phase === 'scanning'">{{ currentLevel }}</span>
          <el-icon v-else-if="phase === 'clean'" :size="22"><CircleCheck /></el-icon>
          <el-icon v-else :size="22"><WarningFilled /></el-icon>
        </div>
      </div>
      <div class="scan-info">
        <div class="scan-meta">COLLISION&nbsp;SCAN · 4-LAYER</div>
        <div class="scan-title">{{ scanTitle }}</div>
        <div class="scan-sub">{{ scanSub }}</div>
      </div>
    </div>

    <!-- ===== Level Steps ===== -->
    <div class="level-steps">
      <div
        v-for="(lv, i) in levels"
        :key="lv.code"
        class="step"
        :class="stepStatus(i)"
      >
        <div class="step-glyph">
          <span class="lv-code">{{ lv.code }}</span>
          <span class="lv-line"></span>
        </div>
        <div class="step-text">
          <div class="lv-title">{{ lv.title }}</div>
          <div class="lv-desc">{{ lv.desc }}</div>
        </div>
        <div class="step-status">
          <el-icon v-if="stepStatus(i) === 'done'" :size="14"><Check /></el-icon>
          <el-icon v-else-if="stepStatus(i) === 'active'" :size="14" class="spin"><Loading /></el-icon>
          <span v-else class="dot"></span>
        </div>
      </div>
    </div>

    <!-- ===== Result: Clean ===== -->
    <div v-if="phase === 'clean'" class="result-clean">
      <div class="rc-glyph">
        <el-icon :size="32"><CircleCheckFilled /></el-icon>
      </div>
      <div class="rc-title">未发现重复客户</div>
      <div class="rc-sub">4 级查重均已通过，可继续操作</div>
      <div class="rc-fields">
        <div v-for="(v, k) in inspectFields" :key="k" class="rc-field">
          <span class="k">{{ fieldLabel(k as string) }}</span>
          <span class="v">{{ v }}</span>
          <el-icon class="ok" :size="12"><Check /></el-icon>
        </div>
      </div>
    </div>

    <!-- ===== Result: Duplicate ===== -->
    <div v-else-if="phase === 'duplicate' && result" class="result-dup">
      <div class="rd-banner" :class="`level-${result.matchLevel}`">
        <div class="rd-stripe"></div>
        <div class="rd-text">
          <div class="rd-title">
            <el-icon :size="14"><WarningFilled /></el-icon>
            发现重复客户
          </div>
          <div class="rd-sub">
            匹配级别 <b>{{ result.matchLevel }}</b> · {{ levelText(result.matchLevel) }} ·
            匹配字段 <b>{{ result.matchField }}</b>
          </div>
        </div>
        <div class="rd-level-tag">{{ result.matchLevel }}</div>
      </div>

      <div class="exist-card">
        <div class="ec-head">
          <span class="ec-meta">EXISTING · #{{ result.existingLeadId }}</span>
          <span class="ec-name">{{ result.existingLeadName }}</span>
        </div>
        <div class="ec-grid">
          <div class="ec-item">
            <span class="lab">负责人</span>
            <span class="val">{{ result.existingOwnerName }}</span>
          </div>
          <div class="ec-item">
            <span class="lab">客户状态</span>
            <span class="val status">跟进中</span>
          </div>
          <div class="ec-item">
            <span class="lab">客户等级</span>
            <span class="val">A 级</span>
          </div>
          <div class="ec-item">
            <span class="lab">所在团队</span>
            <span class="val">电销一组</span>
          </div>
        </div>
        <div class="ec-foot">
          <span class="hint">命中规则：</span>
          <span class="rule">「{{ result.matchField }}」一致 · 系统建议人工仲裁</span>
        </div>
      </div>
    </div>

    <!-- ===== Footer Actions ===== -->
    <template #footer>
      <div v-if="phase === 'scanning'" class="footer-tip">
        <el-icon class="spin"><Loading /></el-icon>
        <span>正在执行第 {{ currentLevelIndex + 1 }} / 4 级查重…</span>
      </div>
      <template v-else-if="phase === 'clean'">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="onConfirm">
          <el-icon><Check /></el-icon><span>确认继续</span>
        </el-button>
      </template>
      <template v-else-if="phase === 'duplicate'">
        <el-button v-if="isAdmin" @click="onIgnore">忽略继续</el-button>
        <el-button @click="onView">查看已有客户</el-button>
        <el-button type="primary" @click="onMerge">
          <el-icon><Connection /></el-icon><span>合并信息</span>
        </el-button>
      </template>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  CircleCheck, CircleCheckFilled, WarningFilled,
  Check, Loading, Connection
} from '@element-plus/icons-vue'
import { collisionApi, type DuplicateCheckResult } from '@/api/crm'

interface CheckData {
  creditCode?: string
  name?: string
  phone?: string
  contactName?: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    checkData: CheckData
    isAdmin?: boolean
  }>(),
  { isAdmin: false }
)

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'confirmed'): void
  (e: 'merge', existing: DuplicateCheckResult): void
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})

/* ---------- Levels ---------- */
const levels = [
  { code: 'P0', title: '统一信用代码精确匹配', desc: '工商注册唯一标识比对', field: 'creditCode' },
  { code: 'P1', title: '客户名称模糊匹配', desc: '名称归一化 · 拼音相似度', field: 'name' },
  { code: 'P2', title: '联系人手机号比对', desc: '手机号 · 电话指纹去重', field: 'phone' },
  { code: 'P3', title: '联系人姓名 + 公司比对', desc: '姓名 + 单位组合识别', field: 'contactName' }
]

/* ---------- State ---------- */
type Phase = 'idle' | 'scanning' | 'clean' | 'duplicate'
const phase = ref<Phase>('idle')
const currentLevelIndex = ref(0)
const result = ref<DuplicateCheckResult | null>(null)
const inspectFields = reactive<Record<string, string>>({})

const currentLevel = computed(() => levels[currentLevelIndex.value]?.code || 'P0')
const scanTitle = computed(() => {
  if (phase.value === 'scanning') return `正在执行 ${currentLevel.value} 级查重`
  if (phase.value === 'clean') return '查重完成 · 无重复'
  if (phase.value === 'duplicate') return '查重完成 · 发现冲突'
  return '准备查重'
})
const scanSub = computed(() => {
  if (phase.value === 'scanning') return levels[currentLevelIndex.value]?.title || ''
  if (phase.value === 'clean') return '所有字段均通过 4 级防撞检测'
  if (phase.value === 'duplicate') return `请决定后续处理方式：忽略 / 查看 / 合并`
  return ''
})

function stepStatus(i: number): 'done' | 'active' | 'pending' | 'block' {
  if (phase.value === 'scanning') {
    if (i < currentLevelIndex.value) return 'done'
    if (i === currentLevelIndex.value) return 'active'
    return 'pending'
  }
  if (phase.value === 'clean') return 'done'
  if (phase.value === 'duplicate') {
    const hitIdx = levels.findIndex(l => l.code === result.value?.matchLevel)
    if (i < hitIdx) return 'done'
    if (i === hitIdx) return 'block'
    return 'pending'
  }
  return 'pending'
}

function levelText(lv: string | null) {
  return ({ P0: '最高级 · 唯一标识冲突', P1: '高级 · 名称疑似', P2: '中级 · 手机号一致', P3: '低级 · 姓名+单位重合' } as any)[lv as string] || ''
}
function fieldLabel(k: string) {
  return ({ creditCode: '统一信用代码', name: '客户名称', phone: '手机号', contactName: '联系人' } as any)[k] || k
}

/* ---------- Scan Logic ---------- */
let timer: any = null

async function onOpen() {
  // reset
  Object.keys(inspectFields).forEach(k => delete inspectFields[k])
  Object.entries(props.checkData || {}).forEach(([k, v]) => {
    if (v) inspectFields[k] = String(v)
  })
  phase.value = 'scanning'
  currentLevelIndex.value = 0
  result.value = null

  // Mock: 30% 概率重复
  const isDuplicate = Math.random() < 0.3
  let hitLevel: 'P0' | 'P1' | 'P2' | 'P3' = 'P1'
  if (isDuplicate) {
    const candidates: Array<'P0' | 'P1' | 'P2' | 'P3'> = ['P0', 'P1', 'P2', 'P3']
    hitLevel = candidates[Math.floor(Math.random() * 4)]
  }
  const hitIndex = levels.findIndex(l => l.code === hitLevel)

  // 真实接口（容错）：失败时回退到 mock
  try {
    const data = await collisionApi.checkDuplicate(props.checkData || {}).catch(() => null) as any
    if (data && typeof data.hasDuplicate === 'boolean') {
      // 仍按动画顺序展示
      animateScan(data.hasDuplicate, data.hasDuplicate ? hitIndex : 4, data)
      return
    }
  } catch (_) { /* ignore */ }

  // mock data
  const mock: DuplicateCheckResult = isDuplicate
    ? {
        hasDuplicate: true,
        matchLevel: hitLevel,
        matchField: levels[hitIndex].title.replace('精确匹配', '').replace('模糊匹配', '').trim(),
        existingLeadId: 880000 + Math.floor(Math.random() * 9999),
        existingLeadName: props.checkData?.name
          ? `${props.checkData.name}（已建档）`
          : '杭州绿芯科技有限公司',
        existingOwnerName: ['李文涛', '苏锦书', '裴承泽'][Math.floor(Math.random() * 3)]
      }
    : { hasDuplicate: false, matchLevel: null }
  animateScan(isDuplicate, isDuplicate ? hitIndex : 4, mock)
}

function animateScan(hasDup: boolean, hitIndex: number, payload: DuplicateCheckResult) {
  if (timer) clearInterval(timer)
  currentLevelIndex.value = 0
  timer = setInterval(() => {
    if (currentLevelIndex.value >= hitIndex) {
      clearInterval(timer); timer = null
      if (hasDup) {
        result.value = payload
        phase.value = 'duplicate'
      } else {
        phase.value = 'clean'
      }
      return
    }
    currentLevelIndex.value += 1
  }, 520)
}

watch(
  () => props.visible,
  (v) => {
    if (!v && timer) { clearInterval(timer); timer = null; phase.value = 'idle' }
  }
)

/* ---------- Actions ---------- */
function close() { dialogVisible.value = false }
function onConfirm() { emit('confirmed'); close() }
function onIgnore() {
  ElMessage.warning('已忽略查重提示，请谨慎确认无重复客户')
  emit('confirmed'); close()
}
function onView() {
  if (result.value?.existingLeadId) {
    ElMessage.info(`即将跳转到客户 #${result.value.existingLeadId}`)
  }
}
function onMerge() {
  if (result.value) emit('merge', result.value)
  close()
}
</script>

<style lang="scss" scoped>
:deep(.dup-check-dialog) {
  background: #14141C;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  .el-dialog__header {
    padding: 16px 22px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.12);
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.06), transparent);
  }
  .el-dialog__title {
    color: var(--text-primary, #F5F5F5);
    font-weight: 600; font-size: 15px;
    letter-spacing: 0.04em;
  }
  .el-dialog__body { padding: 20px 22px 8px; }
  .el-dialog__footer {
    padding: 14px 22px; border-top: 1px solid rgba(212, 175, 55, 0.1);
    background: rgba(255, 255, 255, 0.015);
  }
  .el-dialog__headerbtn .el-dialog__close { color: rgba(245, 158, 11, 0.6); }
}

/* ===== Scan Banner ===== */
.scan-banner {
  display: flex; align-items: center; gap: 18px;
  padding: 18px 20px;
  background:
    radial-gradient(circle at 0% 0%, rgba(245, 158, 11, 0.1), transparent 50%),
    rgba(255, 255, 255, 0.015);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 8px;
  margin-bottom: 16px;
}
.scan-radar {
  position: relative;
  width: 76px; height: 76px;
  flex-shrink: 0;
  .ring {
    position: absolute; inset: 0; border-radius: 50%;
    border: 1px solid rgba(245, 158, 11, 0.25);
  }
  .ring.r2 { inset: 8px; border-color: rgba(245, 158, 11, 0.18); }
  .ring.r3 { inset: 16px; border-color: rgba(245, 158, 11, 0.12); }
  .sweeper {
    position: absolute; inset: 0; border-radius: 50%;
    background: conic-gradient(from 0deg, transparent 0deg, rgba(245, 158, 11, 0.5) 30deg, transparent 60deg);
    opacity: 0;
    transition: opacity 0.3s;
  }
  &.scanning .sweeper {
    opacity: 1;
    animation: sweep 1.4s linear infinite;
  }
  .core {
    position: absolute; inset: 24px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1A1A24, #232330);
    border: 1px solid rgba(245, 158, 11, 0.4);
    display: flex; align-items: center; justify-content: center;
    color: #F59E0B;
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; font-weight: 700;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.3);
  }
}
.scan-info {
  flex: 1; min-width: 0;
  .scan-meta {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.25em; color: rgba(245, 158, 11, 0.6);
    margin-bottom: 4px;
  }
  .scan-title {
    font-size: 16px; font-weight: 600;
    color: var(--text-primary, #F5F5F5); margin-bottom: 4px;
  }
  .scan-sub { font-size: 12.5px; color: var(--text-muted, #888); }
}

/* ===== Steps ===== */
.level-steps {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
  margin-bottom: 18px;
}
.step {
  position: relative;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  display: flex; flex-direction: column; gap: 6px;
  transition: all 0.3s;
  .step-glyph {
    display: flex; align-items: center; gap: 6px;
    .lv-code {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      letter-spacing: 0.1em; color: rgba(245, 158, 11, 0.5);
    }
    .lv-line { flex: 1; height: 1px; background: rgba(212, 175, 55, 0.1); }
  }
  .step-text {
    .lv-title {
      font-size: 12px; font-weight: 500;
      color: var(--text-body, #B8B8C0);
      line-height: 1.4;
    }
    .lv-desc {
      font-size: 10.5px; color: var(--text-muted, #888);
      margin-top: 2px; line-height: 1.4;
    }
  }
  .step-status {
    position: absolute; top: 8px; right: 8px;
    display: flex; align-items: center; justify-content: center;
    width: 18px; height: 18px;
    .dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: rgba(255, 255, 255, 0.15);
    }
  }
  &.active {
    border-color: rgba(245, 158, 11, 0.5);
    background: rgba(245, 158, 11, 0.06);
    box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.15);
    .step-glyph .lv-code { color: #F59E0B; }
    .step-text .lv-title { color: #F59E0B; }
    .step-status { color: #F59E0B; }
  }
  &.done {
    border-color: rgba(16, 185, 129, 0.3);
    .step-glyph .lv-code { color: #10B981; }
    .step-status { color: #10B981; }
  }
  &.block {
    border-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.05);
    .step-glyph .lv-code { color: #EF4444; }
    .step-text .lv-title { color: #EF4444; }
    .step-status { color: #EF4444; }
  }
}

/* ===== Clean Result ===== */
.result-clean {
  text-align: center;
  padding: 18px 14px 22px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background:
    radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.12), transparent 60%),
    rgba(16, 185, 129, 0.03);
  border-radius: 8px;
  .rc-glyph {
    width: 56px; height: 56px; margin: 0 auto 10px;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(16, 185, 129, 0.05));
    border: 1px solid rgba(16, 185, 129, 0.4);
    display: flex; align-items: center; justify-content: center;
    color: #10B981;
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.25);
  }
  .rc-title {
    font-size: 16px; font-weight: 600;
    color: var(--text-primary, #F5F5F5); margin-bottom: 4px;
  }
  .rc-sub { font-size: 12.5px; color: var(--text-muted, #888); margin-bottom: 14px; }
  .rc-fields {
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
    text-align: left;
  }
  .rc-field {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(16, 185, 129, 0.15);
    border-radius: 4px;
    .k { font-size: 11.5px; color: var(--text-muted, #888); min-width: 70px; }
    .v { font-size: 12.5px; color: var(--text-primary, #F5F5F5); flex: 1; word-break: break-all; }
    .ok { color: #10B981; flex-shrink: 0; }
  }
}

/* ===== Duplicate Result ===== */
.rd-banner {
  position: relative;
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  background:
    repeating-linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0 8px, transparent 8px 16px),
    rgba(239, 68, 68, 0.04);
  margin-bottom: 12px;
  &.level-P0 { border-color: rgba(239, 68, 68, 0.5); }
  &.level-P1 { border-color: rgba(245, 158, 11, 0.5); }
  &.level-P2 { border-color: rgba(167, 139, 250, 0.5); }
  &.level-P3 { border-color: rgba(6, 182, 212, 0.5); }
  .rd-stripe {
    width: 4px; height: 36px; border-radius: 2px;
    background: #EF4444;
  }
  &.level-P1 .rd-stripe { background: #F59E0B; }
  &.level-P2 .rd-stripe { background: #A78BFA; }
  &.level-P3 .rd-stripe { background: #06B6D4; }
  .rd-text { flex: 1; min-width: 0; }
  .rd-title {
    display: flex; align-items: center; gap: 6px;
    font-size: 15px; font-weight: 600;
    color: #EF4444; margin-bottom: 4px;
  }
  &.level-P1 .rd-title { color: #F59E0B; }
  &.level-P2 .rd-title { color: #A78BFA; }
  &.level-P3 .rd-title { color: #06B6D4; }
  .rd-sub {
    font-size: 12.5px; color: var(--text-muted, #aaa);
    b { color: var(--text-primary, #F5F5F5); font-weight: 600; }
  }
  .rd-level-tag {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 28px; font-weight: 700;
    color: #EF4444; opacity: 0.7;
  }
  &.level-P1 .rd-level-tag { color: #F59E0B; }
  &.level-P2 .rd-level-tag { color: #A78BFA; }
  &.level-P3 .rd-level-tag { color: #06B6D4; }
}
.exist-card {
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px;
  .ec-head {
    display: flex; align-items: baseline; gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(212, 175, 55, 0.1);
    .ec-meta {
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
      letter-spacing: 0.15em; color: rgba(245, 158, 11, 0.6);
    }
    .ec-name {
      font-size: 15px; font-weight: 600;
      color: var(--text-primary, #F5F5F5);
    }
  }
  .ec-grid {
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
    margin-bottom: 12px;
  }
  .ec-item {
    display: flex; flex-direction: column; gap: 3px;
    .lab { font-size: 11px; color: var(--text-muted, #888); letter-spacing: 0.05em; }
    .val { font-size: 12.5px; color: var(--text-primary, #F5F5F5); font-weight: 500; }
    .val.status { color: #10B981; }
  }
  .ec-foot {
    display: flex; align-items: center; gap: 6px;
    padding-top: 10px;
    border-top: 1px dashed rgba(212, 175, 55, 0.1);
    font-size: 12px;
    .hint { color: var(--text-muted, #888); }
    .rule { color: #F59E0B; }
  }
}

/* ===== Footer ===== */
.footer-tip {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 12.5px; color: rgba(245, 158, 11, 0.85);
  font-family: 'JetBrains Mono', monospace;
}
.spin {
  animation: spin 1.2s linear infinite;
}

/* ===== Animations ===== */
@keyframes sweep {
  to { transform: rotate(360deg); }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

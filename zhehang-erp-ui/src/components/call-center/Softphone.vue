<template>
  <div class="softphone-root" :class="{ 'is-expanded': expanded }">
    <!-- 浮动唤起按钮 -->
    <transition name="orb-fade">
      <button
        v-if="!expanded"
        class="softphone-orb"
        :class="['orb-' + store.phoneState]"
        :title="phaseLabel"
        @click="expanded = true"
      >
        <span class="orb-ring"></span>
        <span class="orb-ring orb-ring--lg"></span>
        <el-icon :size="22" class="orb-icon"><Phone /></el-icon>
        <span class="orb-status-dot" :class="dotClass"></span>
      </button>
    </transition>

    <!-- 主面板 -->
    <transition name="panel-slide">
      <section v-if="expanded" class="softphone-panel">
        <!-- 顶部条 -->
        <header class="sp-header">
          <div class="sp-header__left">
            <span class="sp-status-pill" :class="dotClass">
              <i class="dot"></i>
              <span class="txt">{{ phaseLabel }}</span>
            </span>
          </div>
          <div class="sp-header__right">
            <button class="sp-icon-btn" :title="agentStatusLabel" @click="cycleAgentStatus">
              <el-icon><User /></el-icon>
            </button>
            <button class="sp-icon-btn" :title="t('cc.softphone.collapse')" @click="expanded = false">
              <el-icon><ArrowDownBold /></el-icon>
            </button>
          </div>
        </header>

        <!-- 装饰性品牌行 -->
        <div class="sp-brand">
          <span class="brand-line"></span>
          <span class="brand-text">{{ t('cc.softphone.brand') }}</span>
          <span class="brand-line"></span>
        </div>

        <!-- 状态化主区域 -->
        <main class="sp-body">
          <!-- idle: 拨号盘 -->
          <div v-if="store.phoneState === 'idle' || store.phoneState === 'dialing'" class="phase-idle">
            <div class="dial-display">
              <input
                v-model="dialNumber"
                class="dial-input"
                :placeholder="t('cc.softphone.dial.inputPlaceholder')"
                maxlength="20"
                @keydown.enter="onDial"
              />
              <button v-if="dialNumber" class="dial-clear" @click="dialNumber = dialNumber.slice(0, -1)">
                <el-icon><Back /></el-icon>
              </button>
            </div>

            <div class="dial-pad">
              <button
                v-for="key in dialKeys"
                :key="key.num"
                class="pad-btn"
                @click="onPad(key.num)"
              >
                <span class="pad-num">{{ key.num }}</span>
                <span class="pad-sub">{{ key.sub }}</span>
              </button>
            </div>

            <div class="dial-actions">
              <button class="call-btn" :disabled="!dialNumber" @click="onDial">
                <el-icon :size="20"><PhoneFilled /></el-icon>
                <span>{{ t('cc.softphone.dial.callBtn') }}</span>
              </button>
            </div>

            <div class="dial-meta">
              <span>{{ t('cc.softphone.dial.todayCalls', { count: store.todayCallCount }) }}</span>
              <span class="meta-divider">|</span>
              <span>{{ t('cc.softphone.dial.todayDuration', { duration: formatSec(store.todayTalkSec) }) }}</span>
            </div>
          </div>

          <!-- ringing: 响铃 -->
          <div v-else-if="store.phoneState === 'ringing'" class="phase-ringing">
            <div class="ring-avatar">
              <span class="ring-pulse"></span>
              <span class="ring-pulse ring-pulse--2"></span>
              <div class="avatar-core">
                <el-icon :size="36"><PhoneFilled /></el-icon>
              </div>
            </div>
            <div class="ring-info">
              <p class="ring-label">{{ t('cc.softphone.ringing.label') }}</p>
              <p class="ring-name">{{ store.currentCall?.peerName || t('cc.softphone.ringing.unknownContact') }}</p>
              <p class="ring-num">{{ store.currentCall?.peer || '-' }}</p>
            </div>
            <div class="ring-actions">
              <button class="round-btn round-btn--reject" @click="onReject">
                <el-icon :size="22"><CloseBold /></el-icon>
                <span class="round-label">{{ t('cc.softphone.ringing.reject') }}</span>
              </button>
              <button class="round-btn round-btn--answer" @click="onAnswer">
                <el-icon :size="22"><Check /></el-icon>
                <span class="round-label">{{ t('cc.softphone.ringing.accept') }}</span>
              </button>
            </div>
          </div>

          <!-- talking / hold: 通话中 -->
          <div v-else-if="store.phoneState === 'talking' || store.phoneState === 'hold'" class="phase-talking">
            <div class="talk-peer">
              <p class="talk-direction">
                {{ store.currentCall?.direction === 'inbound' ? t('cc.softphone.talking.directionIn') : t('cc.softphone.talking.directionOut') }}
              </p>
              <p class="talk-peer__name">{{ store.currentCall?.peerName || t('cc.softphone.talking.contact') }}</p>
              <p class="talk-peer__num">{{ store.currentCall?.peer || '-' }}</p>
            </div>

            <div class="talk-timer" :class="{ 'is-hold': store.onHold }">
              <span class="timer-text">{{ talkTimer }}</span>
              <span class="timer-tag">{{ store.onHold ? 'HOLD' : 'LIVE' }}</span>
            </div>

            <div class="talk-actions">
              <button
                class="op-btn"
                :class="{ 'op-btn--active': store.muted }"
                @click="store.toggleMute()"
              >
                <el-icon :size="20"><Microphone v-if="!store.muted" /><Mute v-else /></el-icon>
                <span class="op-label">{{ store.muted ? t('cc.softphone.talking.muted') : t('cc.softphone.talking.mute') }}</span>
              </button>
              <button
                class="op-btn"
                :class="{ 'op-btn--active': store.onHold }"
                @click="store.toggleHold()"
              >
                <el-icon :size="20"><VideoPause /></el-icon>
                <span class="op-label">{{ store.onHold ? t('cc.softphone.talking.held') : t('cc.softphone.talking.holdBtn') }}</span>
              </button>
              <button class="op-btn" @click="onTransfer">
                <el-icon :size="20"><Switch /></el-icon>
                <span class="op-label">{{ t('cc.softphone.talking.transfer') }}</span>
              </button>
              <button class="op-btn" @click="showKeypad = !showKeypad">
                <el-icon :size="20"><Grid /></el-icon>
                <span class="op-label">{{ t('cc.softphone.talking.keypad') }}</span>
              </button>
            </div>

            <div v-if="showKeypad" class="talk-keypad">
              <button
                v-for="key in dialKeys"
                :key="'kp-' + key.num"
                class="kp-btn"
                @click="onDtmf(key.num)"
              >{{ key.num }}</button>
            </div>

            <button class="end-btn" @click="onHangup">
              <el-icon :size="22"><PhoneFilled /></el-icon>
              <span>{{ t('cc.softphone.talking.hangup') }}</span>
            </button>
          </div>

          <!-- afterwork: 后处理 -->
          <div v-else-if="store.phoneState === 'afterwork'" class="phase-afterwork">
            <div class="aw-ring">
              <svg viewBox="0 0 120 120" class="aw-svg">
                <circle cx="60" cy="60" r="52" class="aw-track"></circle>
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  class="aw-progress"
                  :stroke-dasharray="aw_circ"
                  :stroke-dashoffset="awOffset"
                ></circle>
              </svg>
              <div class="aw-center">
                <span class="aw-num">{{ awCountdown }}</span>
                <span class="aw-unit">{{ t('cc.softphone.afterwork.unitSec') }}</span>
              </div>
            </div>
            <p class="aw-tip">{{ t('cc.softphone.afterwork.tip') }}</p>
            <textarea v-model="awNote" class="aw-note" :placeholder="t('cc.softphone.afterwork.notePlaceholder')"></textarea>
            <button class="finish-btn" @click="onFinishAfterwork">
              <el-icon :size="18"><Select /></el-icon>
              <span>{{ t('cc.softphone.afterwork.finish') }}</span>
            </button>
          </div>
        </main>

        <footer class="sp-footer">
          <span class="ext-tag">{{ t('cc.softphone.footer.ext') }} {{ store.currentAgentNo || '----' }}</span>
          <span class="ext-mid">·</span>
          <span class="ext-tag">{{ formatSec(store.statusDurationSec) }}</span>
        </footer>
      </section>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Phone, PhoneFilled, User, ArrowDownBold, Back, CloseBold, Check,
  Microphone, Mute, VideoPause, Switch, Grid, Select
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useCallCenterStore } from '@/stores/call-center'
import type { AgentStatus } from '@/api/call-center'

const { t } = useI18n()
const store = useCallCenterStore()

const expanded = ref(false)
const dialNumber = ref('')
const showKeypad = ref(false)
const awNote = ref('')
const awCountdown = ref(15)
const aw_circ = 2 * Math.PI * 52
const awOffset = ref(0)

const dialKeys = [
  { num: '1', sub: '' }, { num: '2', sub: 'ABC' }, { num: '3', sub: 'DEF' },
  { num: '4', sub: 'GHI' }, { num: '5', sub: 'JKL' }, { num: '6', sub: 'MNO' },
  { num: '7', sub: 'PQRS' }, { num: '8', sub: 'TUV' }, { num: '9', sub: 'WXYZ' },
  { num: '*', sub: '' }, { num: '0', sub: '+' }, { num: '#', sub: '' }
]

const phaseLabel = computed(() => {
  const m: Record<string, string> = {
    idle: t('cc.softphone.phase.idle'),
    dialing: t('cc.softphone.phase.dialing'),
    ringing: t('cc.softphone.phase.ringing'),
    talking: t('cc.softphone.phase.talking'),
    hold: t('cc.softphone.phase.hold'),
    afterwork: t('cc.softphone.phase.afterwork')
  }
  return m[store.phoneState] || '-'
})

const dotClass = computed(() => {
  if (store.phoneState === 'talking' || store.phoneState === 'hold') return 'dot--red'
  if (store.phoneState === 'ringing' || store.phoneState === 'dialing') return 'dot--yellow'
  if (store.phoneState === 'afterwork') return 'dot--gray'
  return 'dot--green'
})

const agentStatusLabel = computed(() => {
  const m: Record<AgentStatus, string> = {
    offline: t('cc.softphone.agentStatus.offline'),
    idle: t('cc.softphone.agentStatus.idle'),
    busy: t('cc.softphone.agentStatus.busy'),
    afterwork: t('cc.softphone.agentStatus.afterwork'),
    break: t('cc.softphone.agentStatus.break')
  }
  return t('cc.softphone.agentStatus.prefix') + (m[store.currentAgentStatus] || '-')
})

// 通话计时
const tickNow = ref(Date.now())
let timerId: number | undefined
const talkTimer = computed(() => {
  if (!store.currentCall) return '00:00:00'
  const start = new Date(store.currentCall.startTime.replace(' ', 'T')).getTime()
  const sec = Math.max(0, Math.floor((tickNow.value - start) / 1000))
  return formatSec(sec)
})

function formatSec(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

function onPad(num: string) {
  dialNumber.value = (dialNumber.value + num).slice(0, 20)
}
function onDtmf(num: string) {
  // 模拟 DTMF
  ElMessage.success(t('cc.softphone.talking.dtmfSent', { key: num }))
}
function onDial() {
  const n = dialNumber.value.trim()
  if (!n) return
  if (store.currentAgentStatus === 'offline') {
    ElMessage.warning(t('cc.softphone.dial.loginFirst'))
    return
  }
  store.startCall(n, 'outbound')
  setTimeout(() => store.answerCall(), 800)
}
function onAnswer() {
  store.answerCall()
}
function onReject() {
  store.endCall()
}
function onHangup() {
  store.endCall()
}
function onTransfer() {
  ElMessageBox.prompt(t('cc.softphone.transfer.prompt'), t('cc.softphone.transfer.title'), {
    confirmButtonText: t('cc.softphone.transfer.confirmBtn'),
    cancelButtonText: t('cc.softphone.transfer.cancelBtn'),
    inputPattern: /^[\d#*]+$/,
    inputErrorMessage: t('cc.softphone.transfer.formatError')
  }).then(({ value }) => {
    ElMessage.success(t('cc.softphone.transfer.success', { target: value }))
    store.endCall()
  }).catch(() => {})
}
function onFinishAfterwork() {
  store.finishAfterwork()
  awNote.value = ''
  awCountdown.value = 15
}

function cycleAgentStatus() {
  const order: AgentStatus[] = ['idle', 'busy', 'break', 'offline']
  const cur = store.currentAgentStatus
  const next = order[(order.indexOf(cur) + 1) % order.length]
  store.changeStatus(next).catch(() => {})
}

// 后处理倒计时 + 状态切换重置
watch(() => store.phoneState, val => {
  if (val === 'afterwork') {
    awCountdown.value = 15
    awOffset.value = 0
    expanded.value = true
    showKeypad.value = false
  }
  if (val === 'ringing') {
    expanded.value = true
  }
  if (val === 'talking') {
    showKeypad.value = false
  }
  if (val === 'idle') {
    awNote.value = ''
  }
})

// 提供点击拨号全局接口
function clickToDial(number: string) {
  if (!number) return
  expanded.value = true
  dialNumber.value = String(number)
  if (store.phoneState === 'idle') {
    setTimeout(() => onDial(), 240)
  }
}

onMounted(() => {
  timerId = window.setInterval(() => {
    tickNow.value = Date.now()
    if (store.phoneState === 'afterwork') {
      awCountdown.value = Math.max(0, awCountdown.value - 1)
      awOffset.value = aw_circ * (1 - awCountdown.value / 15)
      if (awCountdown.value === 0) {
        store.finishAfterwork()
      }
    }
  }, 1000)
  ;(window as any).ccClickToDial = clickToDial
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  if ((window as any).ccClickToDial === clickToDial) {
    delete (window as any).ccClickToDial
  }
})
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-2: #e8c46c;
$gold-soft: rgba(212, 175, 55, 0.45);
$bg-deep: #0a0a12;
$bg-panel: #12121a;
$bg-panel-2: #1a1a26;
$line: rgba(212, 175, 55, 0.18);
$txt: #f5e9c8;
$txt-mute: #8a8197;

.softphone-root {
  position: fixed;
  right: 26px;
  bottom: 26px;
  z-index: 2000;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: $txt;
}

/* 浮动球 */
.softphone-orb {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: 1px solid $gold-soft;
  background: radial-gradient(circle at 30% 25%, #2a2018, #0e0c14 70%);
  color: $gold-2;
  cursor: pointer;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.55),
    inset 0 0 0 1px rgba(255, 255, 255, 0.05),
    0 0 0 4px rgba(212, 175, 55, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover { transform: translateY(-2px) scale(1.04); box-shadow: 0 18px 38px rgba(0,0,0,0.6), 0 0 0 5px rgba(212,175,55,0.16); }
}
.orb-icon { color: $gold-2; }
.orb-ring {
  position: absolute; inset: -4px; border-radius: 50%;
  border: 1px solid rgba(212, 175, 55, 0.4);
  animation: orb-pulse 2.4s ease-out infinite;
  pointer-events: none;
}
.orb-ring--lg { inset: -10px; animation-delay: 1.2s; opacity: 0.6; }
@keyframes orb-pulse {
  0% { transform: scale(0.85); opacity: 0.9; }
  100% { transform: scale(1.4); opacity: 0; }
}
.orb-status-dot {
  position: absolute;
  right: 2px; top: 2px;
  width: 12px; height: 12px;
  border-radius: 50%;
  border: 2px solid $bg-deep;
  &.dot--green { background: #4ade80; }
  &.dot--red   { background: #ef4444; box-shadow: 0 0 8px #ef4444; }
  &.dot--yellow{ background: #facc15; box-shadow: 0 0 8px #facc15; animation: blink 1.1s infinite; }
  &.dot--gray  { background: #6b7280; }
}
@keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

.orb-ringing { animation: orb-shake 0.4s ease-in-out infinite alternate; }
@keyframes orb-shake { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }

/* 面板 */
.softphone-panel {
  width: 340px;
  background: linear-gradient(160deg, $bg-panel 0%, $bg-deep 100%);
  border: 1px solid $line;
  border-radius: 18px;
  box-shadow:
    0 30px 60px rgba(0, 0, 0, 0.55),
    0 0 0 1px rgba(212, 175, 55, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  padding: 14px 16px 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; left: 0; right: 0; top: 0; height: 2px;
    background: linear-gradient(90deg, transparent, $gold, transparent);
    opacity: 0.7;
  }
}

.sp-header {
  display: flex; justify-content: space-between; align-items: center;
}
.sp-status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(212, 175, 55, 0.06);
  border: 1px solid $line;
  font-size: 12px;
  letter-spacing: 1px;
  color: $txt;
  .dot {
    width: 7px; height: 7px; border-radius: 50%; display: inline-block;
  }
  &.dot--green .dot { background: #4ade80; }
  &.dot--red   .dot { background: #ef4444; }
  &.dot--yellow .dot{ background: #facc15; animation: blink 1.1s infinite; }
  &.dot--gray  .dot { background: #6b7280; }
}
.sp-header__right { display: flex; gap: 6px; }
.sp-icon-btn {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: $txt-mute;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center;
  transition: 0.2s;
  &:hover { color: $gold-2; border-color: $line; background: rgba(212,175,55,0.06); }
}

.sp-brand {
  display: flex; align-items: center; gap: 10px;
  margin: 12px 2px 14px;
  .brand-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, $gold-soft, transparent); }
  .brand-text { font-size: 10px; letter-spacing: 3px; color: $gold; opacity: 0.85; }
}

.sp-body { min-height: 280px; }

/* idle */
.dial-display {
  position: relative;
  margin-bottom: 14px;
  .dial-input {
    width: 100%;
    background: rgba(255,255,255,0.02);
    border: 1px solid $line;
    border-radius: 10px;
    padding: 12px 38px 12px 14px;
    color: $gold-2;
    font-size: 22px;
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    letter-spacing: 2px;
    outline: none;
    transition: 0.2s;
    &::placeholder { color: $txt-mute; font-size: 14px; letter-spacing: 0; font-family: inherit; }
    &:focus { border-color: $gold; box-shadow: 0 0 0 3px rgba(212,175,55,0.12); }
  }
  .dial-clear {
    position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
    width: 28px; height: 28px; border-radius: 8px;
    background: transparent; border: 1px solid transparent;
    color: $txt-mute; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    &:hover { color: $gold-2; }
  }
}

.dial-pad {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  margin-bottom: 14px;
}
.pad-btn {
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
  border: 1px solid rgba(212,175,55,0.12);
  border-radius: 12px;
  padding: 10px 0 8px;
  color: $txt;
  cursor: pointer;
  transition: 0.18s;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  &:hover {
    border-color: $gold;
    background: linear-gradient(180deg, rgba(212,175,55,0.16), rgba(212,175,55,0.04));
    transform: translateY(-1px);
  }
  &:active { transform: translateY(0); }
  .pad-num { font-size: 20px; font-weight: 500; letter-spacing: 1px; color: $gold-2; font-family: 'Cormorant Garamond', serif; }
  .pad-sub { font-size: 9px; letter-spacing: 2px; color: $txt-mute; min-height: 11px; }
}

.dial-actions {
  display: flex; justify-content: center; margin-bottom: 12px;
}
.call-btn {
  width: 100%;
  padding: 12px 0;
  background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
  border: 1px solid rgba(74, 222, 128, 0.4);
  border-radius: 12px;
  color: #f0fdf4;
  font-size: 15px;
  letter-spacing: 6px;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  box-shadow: 0 8px 22px rgba(22, 163, 74, 0.35), inset 0 1px 0 rgba(255,255,255,0.15);
  transition: 0.2s;
  &:hover { transform: translateY(-1px); box-shadow: 0 12px 28px rgba(22,163,74,0.45); }
  &:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
}

.dial-meta {
  display: flex; justify-content: center; gap: 10px;
  font-size: 11px; color: $txt-mute; letter-spacing: 1px;
  .meta-divider { opacity: 0.4; }
}

/* ringing */
.phase-ringing { display: flex; flex-direction: column; align-items: center; padding: 6px 0; }
.ring-avatar { position: relative; width: 110px; height: 110px; display: grid; place-items: center; margin-top: 6px; }
.ring-pulse {
  position: absolute; inset: 0; border-radius: 50%;
  border: 1px solid $gold;
  animation: ring-pulse 1.4s ease-out infinite;
}
.ring-pulse--2 { animation-delay: 0.7s; }
@keyframes ring-pulse {
  0% { transform: scale(0.8); opacity: 0.9; }
  100% { transform: scale(1.5); opacity: 0; }
}
.avatar-core {
  width: 76px; height: 76px; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #3a2a18, #0e0c14 70%);
  display: grid; place-items: center;
  color: $gold-2;
  border: 1px solid $gold-soft;
  box-shadow: 0 0 30px rgba(212,175,55,0.25);
}
.ring-info { text-align: center; margin: 14px 0 18px; }
.ring-label { font-size: 11px; letter-spacing: 4px; color: $gold; }
.ring-name { font-size: 18px; color: $txt; margin-top: 8px; font-family: 'Cormorant Garamond', serif; }
.ring-num { font-size: 13px; color: $txt-mute; letter-spacing: 1px; margin-top: 2px; }
.ring-actions { display: flex; gap: 36px; padding: 8px 0 14px; }
.round-btn {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  border: none; cursor: pointer;
  color: #fff;
  font-size: 11px;
  letter-spacing: 2px;
  position: relative;
  transition: 0.2s;
  &:hover { transform: translateY(-2px); }
  .round-label {
    position: absolute; bottom: -22px;
    color: $txt-mute; font-size: 11px;
  }
}
.round-btn--reject {
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  box-shadow: 0 8px 24px rgba(239,68,68,0.45);
}
.round-btn--answer {
  background: linear-gradient(135deg, #16a34a, #15803d);
  box-shadow: 0 8px 24px rgba(22,163,74,0.45);
}

/* talking */
.phase-talking { display: flex; flex-direction: column; align-items: stretch; gap: 12px; }
.talk-peer { text-align: center; }
.talk-direction { font-size: 11px; letter-spacing: 3px; color: $gold; }
.talk-peer__name { font-size: 18px; margin-top: 4px; color: $txt; font-family: 'Cormorant Garamond', serif; }
.talk-peer__num { font-size: 13px; color: $txt-mute; letter-spacing: 1px; }

.talk-timer {
  text-align: center;
  padding: 12px 0 10px;
  position: relative;
  &::before, &::after {
    content: ''; position: absolute; left: 30px; right: 30px; height: 1px;
    background: linear-gradient(90deg, transparent, $gold-soft, transparent);
  }
  &::before { top: 0; }
  &::after { bottom: 0; }
  .timer-text {
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    font-size: 38px;
    color: $gold-2;
    letter-spacing: 3px;
    text-shadow: 0 2px 12px rgba(212,175,55,0.4);
  }
  .timer-tag {
    display: inline-block; margin-left: 10px;
    padding: 2px 7px; border-radius: 4px;
    background: rgba(239,68,68,0.18); color: #fca5a5;
    font-size: 10px; letter-spacing: 2px; vertical-align: middle;
  }
  &.is-hold .timer-tag { background: rgba(250,204,21,0.18); color: #fde68a; }
  &.is-hold .timer-text { color: $txt-mute; }
}

.talk-actions {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
.op-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 12px;
  padding: 10px 0 8px;
  color: $txt;
  cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  transition: 0.2s;
  &:hover { border-color: $gold; color: $gold-2; }
  .op-label { font-size: 11px; letter-spacing: 1px; color: $txt-mute; }
  &.op-btn--active {
    border-color: $gold;
    background: rgba(212,175,55,0.12);
    color: $gold;
    .op-label { color: $gold; }
  }
}
.talk-keypad {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
  padding: 6px 0;
}
.kp-btn {
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 8px;
  padding: 8px 0;
  color: $gold-2;
  font-family: 'Cormorant Garamond', serif;
  font-size: 16px;
  cursor: pointer;
  &:hover { background: rgba(212,175,55,0.12); }
}
.end-btn {
  width: 100%;
  padding: 12px 0;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border: none;
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  letter-spacing: 6px;
  font-size: 15px;
  box-shadow: 0 10px 24px rgba(239,68,68,0.4);
  transition: 0.2s;
  &:hover { transform: translateY(-1px); }
  .el-icon { transform: rotate(135deg); }
}

/* afterwork */
.phase-afterwork { display: flex; flex-direction: column; align-items: center; gap: 12px; padding-top: 4px; }
.aw-ring { position: relative; width: 120px; height: 120px; }
.aw-svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.aw-track {
  fill: none;
  stroke: rgba(212,175,55,0.12);
  stroke-width: 6;
}
.aw-progress {
  fill: none;
  stroke: $gold;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.95s linear;
}
.aw-center {
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  .aw-num { font-family: 'Cormorant Garamond', serif; font-size: 38px; color: $gold-2; }
  .aw-unit { font-size: 11px; color: $txt-mute; letter-spacing: 2px; }
}
.aw-tip { font-size: 12px; color: $txt-mute; letter-spacing: 1px; }
.aw-note {
  width: 100%; min-height: 56px;
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 10px;
  padding: 8px 10px;
  color: $txt;
  resize: none;
  font-family: inherit;
  font-size: 12px;
  outline: none;
  &:focus { border-color: $gold; }
  &::placeholder { color: $txt-mute; }
}
.finish-btn {
  width: 100%;
  padding: 11px 0;
  background: linear-gradient(135deg, #d4af37 0%, #a37b22 100%);
  border: 1px solid rgba(212,175,55,0.6);
  border-radius: 12px;
  color: #1a1208;
  font-weight: 500;
  letter-spacing: 4px;
  cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  box-shadow: 0 10px 24px rgba(212,175,55,0.3);
  transition: 0.2s;
  &:hover { transform: translateY(-1px); }
}

.sp-footer {
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed $line;
  display: flex; justify-content: center; align-items: center; gap: 10px;
  .ext-tag { font-size: 10px; letter-spacing: 3px; color: $txt-mute; }
  .ext-mid { color: $gold-soft; }
}

/* 过渡 */
.panel-slide-enter-active,
.panel-slide-leave-active { transition: all 0.32s cubic-bezier(0.16, 1, 0.3, 1); }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; transform: translateY(20px) scale(0.96); }

.orb-fade-enter-active,
.orb-fade-leave-active { transition: all 0.25s ease; }
.orb-fade-enter-from,
.orb-fade-leave-to { opacity: 0; transform: scale(0.6); }
</style>

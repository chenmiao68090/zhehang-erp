<template>
  <transition name="popup-slide">
    <aside v-if="store.popupVisible" class="call-popup">
      <!-- 侧边装饰条 -->
      <div class="popup-rail">
        <span class="rail-dot"></span>
        <span class="rail-line"></span>
      </div>

      <!-- 顶部 -->
      <header class="popup-head">
        <div class="head-meta">
          <span class="head-label">{{ t('cc.popup.headLabel') }}</span>
          <h2 class="head-title">{{ data?.customerName || t('cc.popup.unknownCustomer') }}</h2>
        </div>
        <button class="head-close" @click="store.hidePopup()">
          <el-icon :size="18"><Close /></el-icon>
        </button>
      </header>

      <!-- 客户信息 -->
      <section class="popup-card">
        <div class="card-row">
          <span class="row-key">{{ t('cc.popup.row.mobile') }}</span>
          <span class="row-val phone-num">{{ data?.caller || '-' }}</span>
        </div>
        <div class="card-row">
          <span class="row-key">{{ t('cc.popup.row.company') }}</span>
          <span class="row-val">{{ data?.companyName || t('cc.popup.row.empty') }}</span>
        </div>
        <div class="card-row">
          <span class="row-key">{{ t('cc.popup.row.lastCall') }}</span>
          <span class="row-val">{{ data?.lastCallTime || t('cc.popup.row.empty') }}</span>
        </div>
        <div v-if="data?.tags && data.tags.length" class="card-tags">
          <span v-if="data.isVip" class="tag tag--vip">{{ t('cc.popup.tagVip') }}</span>
          <span v-for="t in data.tags" :key="t" class="tag">{{ t }}</span>
        </div>
        <div v-if="data?.recentNote" class="card-note">
          “{{ data.recentNote }}”
        </div>
      </section>

      <!-- 快捷动作 -->
      <section class="popup-actions">
        <button class="quick-btn" @click="onCreateTicket">
          <el-icon :size="16"><Tickets /></el-icon>
          <span>{{ t('cc.popup.action.createTicket') }}</span>
        </button>
        <button class="quick-btn" @click="onAddFollow">
          <el-icon :size="16"><EditPen /></el-icon>
          <span>{{ t('cc.popup.action.addFollow') }}</span>
        </button>
        <button class="quick-btn" @click="onTransfer">
          <el-icon :size="16"><Switch /></el-icon>
          <span>{{ t('cc.popup.action.transfer') }}</span>
        </button>
      </section>

      <!-- Tabs -->
      <nav class="popup-tabs">
        <button
          v-for="t in tabs"
          :key="t.key"
          class="tab"
          :class="{ active: activeTab === t.key }"
          @click="activeTab = t.key"
        >
          <span>{{ t.label }}</span>
          <span class="tab-count">{{ t.count }}</span>
        </button>
      </nav>

      <!-- 内容区 -->
      <main class="popup-content">
        <!-- 历史通话 -->
        <el-timeline v-if="activeTab === 'calls'" class="popup-timeline">
          <el-timeline-item
            v-for="r in recentCalls"
            :key="r.id"
            :timestamp="r.startTime"
            :color="r.result === 'answered' ? '#d4af37' : '#6b7280'"
            placement="top"
          >
            <div class="timeline-card">
              <div class="tl-row">
                <span class="tl-tag" :class="'tl-' + r.direction">{{ dirText(r.direction) }}</span>
                <span class="tl-result" :class="'rs-' + r.result">{{ resultText(r.result) }}</span>
              </div>
              <p class="tl-line">{{ t('cc.popup.timeline.agentLabel') }} <em>{{ r.agentName || '-' }}</em> · {{ t('cc.popup.timeline.durationLabel') }} <em>{{ formatSec(r.totalDuration) }}</em></p>
              <p v-if="r.remark" class="tl-rem">{{ r.remark }}</p>
            </div>
          </el-timeline-item>
          <p v-if="!recentCalls.length" class="empty">{{ t('cc.popup.timeline.emptyCalls') }}</p>
        </el-timeline>

        <!-- 历史订单 -->
        <ul v-else-if="activeTab === 'orders'" class="order-list">
          <li v-for="o in recentOrders" :key="o.id" class="order-item">
            <div class="order-head">
              <span class="order-no">{{ o.no }}</span>
              <span class="order-status" :class="'os-' + o.status">{{ o.statusText }}</span>
            </div>
            <div class="order-foot">
              <span class="order-amt">¥ {{ o.amount }}</span>
              <span class="order-date">{{ o.date }}</span>
            </div>
          </li>
          <li v-if="!recentOrders.length" class="empty">{{ t('cc.popup.timeline.emptyOrders') }}</li>
        </ul>

        <!-- 跟进 -->
        <el-timeline v-else class="popup-timeline">
          <el-timeline-item
            v-for="f in followList"
            :key="f.id"
            :timestamp="f.time"
            color="#e8c46c"
            placement="top"
          >
            <div class="timeline-card">
              <p class="tl-by">{{ f.by }} · {{ f.type }}</p>
              <p class="tl-rem">{{ f.content }}</p>
            </div>
          </el-timeline-item>
          <p v-if="!followList.length" class="empty">{{ t('cc.popup.timeline.emptyFollow') }}</p>
        </el-timeline>
      </main>

      <footer class="popup-foot">
        <span class="foot-id">{{ t('cc.popup.footer.callId') }} · {{ store.currentCall?.callId || '-' }}</span>
      </footer>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Close, Tickets, EditPen, Switch } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useCallCenterStore } from '@/stores/call-center'
import type { CallDirection, CallResult } from '@/api/call-center'

const { t } = useI18n()
const store = useCallCenterStore()
const data = computed(() => store.popupData as any)

const activeTab = ref<'calls' | 'orders' | 'follow'>('calls')

interface RecentCall {
  id: number; startTime: string; direction: CallDirection; result: CallResult;
  totalDuration: number; agentName?: string; remark?: string
}
interface RecentOrder { id: number; no: string; status: string; statusText: string; amount: string; date: string }
interface FollowItem { id: number; time: string; by: string; type: string; content: string }

const recentCalls = ref<RecentCall[]>([])
const recentOrders = ref<RecentOrder[]>([])
const followList = ref<FollowItem[]>([])

const tabs = computed(() => [
  { key: 'calls', label: t('cc.popup.tab.calls'), count: recentCalls.value.length },
  { key: 'orders', label: t('cc.popup.tab.orders'), count: recentOrders.value.length },
  { key: 'follow', label: t('cc.popup.tab.follow'), count: followList.value.length }
])

function dirText(d: CallDirection): string {
  return d === 'inbound' ? t('cc.popup.direction.inbound') : d === 'outbound' ? t('cc.popup.direction.outbound') : t('cc.popup.direction.internal')
}
function resultText(r: CallResult): string {
  const m: Record<CallResult, string> = {
    answered: t('cc.popup.result.answered'),
    'no-answer': t('cc.popup.result.no-answer'),
    busy: t('cc.popup.result.busy'),
    failed: t('cc.popup.result.failed'),
    abandoned: t('cc.popup.result.abandoned')
  }
  return m[r] || '-'
}
function formatSec(sec: number): string {
  const m = Math.floor(sec / 60), s = sec % 60
  return t('cc.popup.timeline.durationFormat', { m, s })
}

function loadRelatedData() {
  // 模拟历史数据（临时 mock，后续接入后端接口）
  const baseTime = Date.now()
  recentCalls.value = Array.from({ length: 5 }).map((_, i) => ({
    id: i + 1,
    startTime: new Date(baseTime - (i + 1) * 86400_000).toISOString().replace('T', ' ').slice(0, 16),
    direction: (i % 2 === 0 ? 'inbound' : 'outbound') as CallDirection,
    result: (i === 1 ? 'no-answer' : 'answered') as CallResult,
    totalDuration: 60 + i * 80,
    agentName: ['张敏', '李伟', '王芳', '赵磊', '陈静'][i],
    remark: i === 0 ? '咨询产品价格与购买流程' : ''
  }))

  recentOrders.value = Array.from({ length: 3 }).map((_, i) => ({
    id: i + 1,
    no: 'PO' + String(20260000 + i * 137).padStart(10, '0'),
    status: ['paid', 'pending', 'shipped'][i],
    statusText: [t('cc.popup.orderStatus.paid'), t('cc.popup.orderStatus.pending'), t('cc.popup.orderStatus.shipped')][i],
    amount: ['12,800.00', '3,200.00', '48,500.00'][i],
    date: new Date(baseTime - (i + 1) * 7 * 86400_000).toISOString().slice(0, 10)
  }))

  followList.value = [
    { id: 1, time: '2026-05-18 16:24', by: '张敏', type: t('cc.popup.followType.phone'), content: '客户意向稳定，计划下周报价' },
    { id: 2, time: '2026-05-15 10:08', by: '李伟', type: t('cc.popup.followType.visit'), content: '拜访客户公司跟进项目充足度' }
  ]
}

watch(() => store.popupVisible, v => {
  if (v) {
    activeTab.value = 'calls'
    loadRelatedData()
  }
})

function onCreateTicket() {
  ElMessage.success(t('cc.popup.message.ticketCreated'))
}
function onAddFollow() {
  ElMessage.success(t('cc.popup.message.followOpened'))
}
function onTransfer() {
  ElMessage.success(t('cc.popup.message.transferTip'))
}
</script>

<style lang="scss" scoped>
$gold: #d4af37;
$gold-2: #e8c46c;
$gold-soft: rgba(212, 175, 55, 0.32);
$bg-deep: #0a0a12;
$bg-panel: #12121a;
$line: rgba(212, 175, 55, 0.18);
$txt: #f5e9c8;
$txt-mute: #8a8197;

.call-popup {
  position: fixed;
  top: 0; right: 0;
  width: 400px;
  height: 100vh;
  background: linear-gradient(180deg, $bg-panel 0%, $bg-deep 100%);
  border-left: 1px solid $line;
  box-shadow: -30px 0 60px rgba(0, 0, 0, 0.55);
  z-index: 1900;
  display: flex; flex-direction: column;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  color: $txt;
  padding: 22px 22px 16px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; top: 0; bottom: 0; left: 0; width: 2px;
    background: linear-gradient(180deg, transparent, $gold, transparent);
  }
}

.popup-rail {
  position: absolute; left: 14px; top: 22px; bottom: 22px;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  pointer-events: none;
  .rail-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: $gold;
    box-shadow: 0 0 12px $gold;
  }
  .rail-line { flex: 1; width: 1px; background: linear-gradient(180deg, $gold-soft, transparent); }
}

.popup-head {
  display: flex; align-items: flex-start; justify-content: space-between;
  padding-left: 22px;
  margin-bottom: 16px;
  .head-label { font-size: 10px; letter-spacing: 4px; color: $gold; }
  .head-title {
    margin: 6px 0 0;
    font-family: 'Cormorant Garamond', 'Georgia', serif;
    font-size: 24px;
    font-weight: 500;
    color: $txt;
    letter-spacing: 1px;
  }
  .head-close {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: transparent;
    border: 1px solid $line;
    color: $txt-mute;
    cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    transition: 0.2s;
    &:hover { color: $gold; border-color: $gold; }
  }
}

.popup-card {
  margin: 0 0 14px 22px;
  padding: 14px 14px;
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 12px;
  position: relative;

  &::after {
    content: '';
    position: absolute; right: 14px; top: 14px;
    width: 32px; height: 32px;
    background: radial-gradient(circle, $gold-soft, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  .card-row {
    display: flex; gap: 12px; padding: 4px 0;
    font-size: 13px;
    .row-key { color: $txt-mute; width: 60px; flex-shrink: 0; letter-spacing: 1px; }
    .row-val { color: $txt; }
    .phone-num { font-family: 'Cormorant Garamond', serif; font-size: 17px; color: $gold-2; letter-spacing: 1px; }
  }

  .card-tags {
    display: flex; gap: 6px; flex-wrap: wrap;
    margin-top: 8px;
    .tag {
      padding: 3px 9px;
      border-radius: 4px;
      background: rgba(212,175,55,0.08);
      border: 1px solid $line;
      color: $gold-2;
      font-size: 11px;
      letter-spacing: 1px;
    }
    .tag--vip {
      background: linear-gradient(135deg, $gold, #a37b22);
      color: #1a1208;
      border-color: $gold;
      font-weight: 600;
    }
  }

  .card-note {
    margin-top: 10px;
    padding: 8px 10px;
    border-left: 2px solid $gold;
    color: $txt-mute;
    font-size: 12px;
    font-style: italic;
    line-height: 1.6;
    background: rgba(212,175,55,0.04);
  }
}

.popup-actions {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  margin: 0 0 16px 22px;
}
.quick-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 10px 0;
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 10px;
  color: $txt;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: 0.2s;
  &:hover { border-color: $gold; color: $gold-2; transform: translateY(-1px); }
}

.popup-tabs {
  display: flex; gap: 2px;
  margin: 0 0 12px 22px;
  border-bottom: 1px solid $line;
  .tab {
    flex: 1;
    background: transparent;
    border: none;
    padding: 10px 0 12px;
    color: $txt-mute;
    cursor: pointer;
    font-size: 13px;
    letter-spacing: 1px;
    position: relative;
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    transition: 0.2s;
    .tab-count {
      font-size: 10px; padding: 1px 6px; border-radius: 8px;
      background: rgba(212,175,55,0.1);
      color: $gold-2;
    }
    &::after {
      content: '';
      position: absolute; left: 50%; bottom: -1px;
      width: 0; height: 2px;
      background: $gold;
      transition: 0.25s;
      transform: translateX(-50%);
    }
    &:hover { color: $gold-2; }
    &.active {
      color: $gold-2;
      &::after { width: 28px; }
    }
  }
}

.popup-content {
  flex: 1;
  margin-left: 22px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: $gold-soft; border-radius: 2px; }
}

.popup-timeline { padding-left: 4px; }
:deep(.el-timeline-item__node) {
  background: $gold !important;
  box-shadow: 0 0 8px $gold-soft;
}
:deep(.el-timeline-item__tail) { border-left-color: $line !important; }
:deep(.el-timeline-item__timestamp) {
  color: $txt-mute !important;
  font-size: 11px !important;
  letter-spacing: 1px;
}

.timeline-card {
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 8px;
  padding: 8px 10px;
  margin-top: 4px;
  .tl-row { display: flex; gap: 6px; margin-bottom: 4px; }
  .tl-tag {
    padding: 1px 6px; border-radius: 3px;
    background: rgba(212,175,55,0.1); color: $gold-2;
    font-size: 10px; letter-spacing: 1px;
    &.tl-outbound { background: rgba(34,197,94,0.12); color: #86efac; }
    &.tl-internal { background: rgba(59,130,246,0.12); color: #93c5fd; }
  }
  .tl-result {
    font-size: 10px; padding: 1px 6px; border-radius: 3px;
    background: rgba(255,255,255,0.04); color: $txt-mute;
    &.rs-answered { color: #86efac; }
    &.rs-no-answer, &.rs-abandoned, &.rs-failed { color: #fca5a5; }
  }
  .tl-line {
    font-size: 12px; color: $txt-mute;
    em { color: $txt; font-style: normal; }
  }
  .tl-rem {
    font-size: 12px; color: $txt;
    margin-top: 4px;
    line-height: 1.55;
  }
  .tl-by { font-size: 12px; color: $gold-2; letter-spacing: 1px; margin-bottom: 4px; }
}

.order-list { list-style: none; padding: 0; margin: 0; }
.order-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid $line;
  border-radius: 10px;
  padding: 10px 12px;
  margin-bottom: 8px;
  .order-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .order-no { font-family: 'Cormorant Garamond', serif; color: $gold-2; font-size: 14px; letter-spacing: 1px; }
  .order-status {
    font-size: 11px; padding: 2px 7px; border-radius: 4px;
    background: rgba(212,175,55,0.1); color: $gold-2;
    &.os-paid { background: rgba(34,197,94,0.14); color: #86efac; }
    &.os-pending { background: rgba(250,204,21,0.14); color: #fde68a; }
    &.os-shipped { background: rgba(59,130,246,0.14); color: #93c5fd; }
  }
  .order-foot { display: flex; justify-content: space-between; font-size: 12px; }
  .order-amt { color: $gold-2; font-family: 'Cormorant Garamond', serif; font-size: 16px; }
  .order-date { color: $txt-mute; }
}

.empty {
  text-align: center;
  color: $txt-mute;
  font-size: 12px;
  padding: 30px 0;
  letter-spacing: 1px;
}

.popup-foot {
  margin-top: 12px;
  padding-top: 10px;
  padding-left: 22px;
  border-top: 1px dashed $line;
  font-size: 10px; letter-spacing: 2px; color: $txt-mute;
}

/* 过渡 */
.popup-slide-enter-active,
.popup-slide-leave-active { transition: all 0.36s cubic-bezier(0.16, 1, 0.3, 1); }
.popup-slide-enter-from,
.popup-slide-leave-to { transform: translateX(420px); opacity: 0; }
</style>

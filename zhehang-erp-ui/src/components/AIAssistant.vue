<template>
  <div class="ai-assistant">
    <div class="ai-fab" @click="togglePanel" v-show="!isPanelOpen">
      <el-icon :size="24"><ChatDotRound /></el-icon>
      <div class="breathing-ring"></div>
    </div>
    <transition name="slide-up">
      <div class="ai-panel" v-show="isPanelOpen">
        <div class="ai-panel-header">
          <span class="ai-title">{{ $t('ai.title') }}</span>
          <div class="ai-actions">
            <el-icon class="action-btn" @click="goFullscreen" title="全屏"><FullScreen /></el-icon>
            <el-icon class="action-btn" @click="minimizePanel"><Minus /></el-icon>
            <el-icon class="action-btn" @click="closePanel"><Close /></el-icon>
          </div>
        </div>
        <div class="ai-panel-body" ref="messageListRef">
          <div v-for="(msg, index) in messages" :key="index" class="message-item" :class="msg.role">
            <div class="message-avatar">
              <el-avatar :size="28" v-if="msg.role === 'assistant'">AI</el-avatar>
              <el-avatar :size="28" v-else><el-icon><User /></el-icon></el-avatar>
            </div>
            <div class="message-content" v-html="msg.role === 'assistant' ? renderContent(msg.content) : escapeHtml(msg.content)"></div>
          </div>
          <div v-if="isThinking" class="message-item assistant">
            <div class="message-avatar"><el-avatar :size="28">AI</el-avatar></div>
            <div class="message-content thinking">
              <span class="typing-dots"><span></span><span></span><span></span></span>
              {{ $t('ai.thinking') }}
            </div>
          </div>
        </div>
        <div class="ai-quick-commands">
          <button v-for="cmd in quickCommands" :key="cmd.key" class="quick-cmd-btn" @click="sendQuickCommand(cmd.text)">{{ cmd.label }}</button>
        </div>
        <div class="ai-panel-footer">
          <el-input v-model="inputText" :placeholder="$t('ai.inputTip')" @keyup.enter="sendMessage" clearable size="default" />
          <el-button type="primary" :icon="Promotion" circle @click="sendMessage" :disabled="!inputText.trim() || isThinking" />
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ChatDotRound, Minus, Close, Promotion, User, FullScreen } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { getStorage, setStorage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

interface Message { role: 'user' | 'assistant'; content: string; timestamp?: number }

const isPanelOpen = ref(false)
const inputText = ref('')
const isThinking = ref(false)
const messageListRef = ref<HTMLDivElement>()

function loadHistory(): Message[] {
  try { const raw = getStorage('ai_chat_history'); if (raw) return JSON.parse(raw) } catch {}
  return [{ role: 'assistant', content: t('ai.welcome'), timestamp: Date.now() }]
}

const messages = ref<Message[]>(loadHistory())
function saveHistory() { setStorage('ai_chat_history', JSON.stringify(messages.value.slice(-50))) }

const currentModule = computed(() => {
  const p = route.path
  if (p.includes('/crm')) return 'crm'
  if (p.includes('/finance')) return 'finance'
  if (p.includes('/hrm')) return 'hrm'
  if (p.includes('/sales')) return 'sales'
  return 'general'
})

const quickCommands = computed(() => {
  if (currentModule.value === 'crm') return [
    { key: 'follow', label: '客户跟进分析', text: '分析本周客户跟进情况' },
    { key: 'convert', label: '转化率报告', text: '生成线索转化率报告' },
    { key: 'analyze', label: t('ai.analyzeData'), text: '分析今日数据' }
  ]
  if (currentModule.value === 'finance') return [
    { key: 'balance', label: '财务概览', text: '查看本月财务概览' },
    { key: 'overdue', label: '应收提醒', text: '查看逾期应收款' },
    { key: 'analyze', label: t('ai.analyzeData'), text: '分析今日数据' }
  ]
  return [
    { key: 'analyze', label: t('ai.analyzeData'), text: '分析今日数据' },
    { key: 'report', label: t('ai.generateReport'), text: '生成工作日报' },
    { key: 'export', label: t('ai.exportCustomer'), text: '导出客户列表' }
  ]
})

function togglePanel() { isPanelOpen.value = !isPanelOpen.value }
function minimizePanel() { isPanelOpen.value = false }
function closePanel() { isPanelOpen.value = false }
function goFullscreen() { isPanelOpen.value = false; router.push('/ai-chat/index') }

function escapeHtml(text: string) { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function renderContent(text: string) { return escapeHtml(text).replace(/\n/g, '<br>') }

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isThinking.value) return
  messages.value.push({ role: 'user', content: text, timestamp: Date.now() })
  inputText.value = ''
  isThinking.value = true
  await nextTick(); scrollToBottom()

  const replies: Record<string, string> = {
    '分析今日数据': '📊 今日数据概览：\n\n• 新增客户：5 家\n• 跟进记录：12 条\n• 待审批：3 项\n• 签约金额：¥45,000\n\n建议重点关注杭州科技有限公司的合同续签。',
    '生成工作日报': '📝 工作日报\n\n已完成：\n✅ 处理客户咨询 4 条\n✅ 完成报价单 2 份\n\n进行中：\n🔄 杭州科技合同续签跟进\n🔄 月度销售报告整理\n\n待办：\n⏳ 审批报销申请 3 项',
    '导出客户列表': '📋 已为您准备客户列表导出：\n\n共 156 位客户，其中：\n• 活跃客户：89 位\n• 潜在客户：42 位\n• 休眠客户：25 位\n\n请前往「客户管理」页面点击导出按钮下载。'
  }
  const reply = replies[text] || '收到您的问题："' + text + '"。\n\nAI 功能正在接入中，敬请期待！'

  setTimeout(() => {
    isThinking.value = false
    const msg: Message = { role: 'assistant', content: '', timestamp: Date.now() }
    messages.value.push(msg)
    let idx = 0
    const timer = setInterval(() => {
      if (idx < reply.length) { msg.content += reply[idx]; idx++; nextTick(() => scrollToBottom()) }
      else { clearInterval(timer); saveHistory() }
    }, 25)
  }, 800)
}

function sendQuickCommand(text: string) { inputText.value = text; sendMessage() }
function scrollToBottom() { if (messageListRef.value) messageListRef.value.scrollTop = messageListRef.value.scrollHeight }
onMounted(() => { nextTick(() => scrollToBottom()) })
</script>

<style lang="scss" scoped>
.ai-assistant { position: fixed; bottom: 24px; right: 24px; z-index: 2000; }
.ai-fab {
  width: 56px; height: 56px; border-radius: 50%;
  background: linear-gradient(135deg, #F26522, #FF8C42); color: #fff;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
  box-shadow: 0 4px 12px rgba(242,101,34,0.4); transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  &:hover { transform: scale(1.1); box-shadow: 0 6px 20px rgba(242,101,34,0.5); }
}
.breathing-ring {
  position: absolute; width: 100%; height: 100%; border-radius: 50%;
  border: 2px solid rgba(242,101,34,0.6); animation: breathing 2s ease-in-out infinite;
}
@keyframes breathing { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.4); opacity: 0; } }

.ai-panel {
  position: fixed; bottom: 24px; right: 24px; width: 380px; height: 520px;
  background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  display: flex; flex-direction: column; overflow: hidden;
}
.ai-panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 16px; background: linear-gradient(135deg, #F26522, #FF8C42); color: #fff;
  .ai-title { font-size: 15px; font-weight: 600; }
  .ai-actions { display: flex; gap: 8px; .action-btn { cursor: pointer; font-size: 16px; opacity: 0.8; &:hover { opacity: 1; } } }
}
.ai-panel-body { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
.message-item {
  display: flex; gap: 8px;
  &.user { flex-direction: row-reverse; .message-content { background-color: #F26522; color: #fff; border-radius: 12px 12px 0 12px; } }
  &.assistant .message-content { background-color: #f1f5f9; color: #334155; border-radius: 12px 12px 12px 0; }
}
.message-content { max-width: 260px; padding: 10px 14px; font-size: 13px; line-height: 1.6; word-break: break-word; &.thinking { color: #94a3b8; font-style: italic; display: flex; align-items: center; gap: 6px; } }
.typing-dots {
  display: inline-flex; gap: 3px;
  span { width: 5px; height: 5px; border-radius: 50%; background: #94a3b8; animation: typingBounce 1.2s ease-in-out infinite; &:nth-child(2) { animation-delay: 0.2s; } &:nth-child(3) { animation-delay: 0.4s; } }
}
@keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
.ai-quick-commands { display: flex; gap: 6px; padding: 8px 16px; overflow-x: auto; border-top: 1px solid #f1f5f9; &::-webkit-scrollbar { height: 0; } }
.quick-cmd-btn {
  flex-shrink: 0; padding: 4px 10px; font-size: 12px; border: 1px solid #e2e8f0;
  border-radius: 14px; background: #fff; color: #64748b; cursor: pointer; transition: all 0.15s; white-space: nowrap;
  &:hover { border-color: #F26522; color: #F26522; background: #fef7f2; }
}
.ai-panel-footer { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid #e2e8f0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(20px); }

html.dark {
  .ai-panel { background: var(--el-bg-color); box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
  .ai-panel-body { background: var(--el-bg-color-page); }
  .message-item.assistant .message-content { background: var(--el-bg-color-overlay); color: var(--el-text-color-regular); }
  .ai-quick-commands { border-color: var(--el-border-color); }
  .quick-cmd-btn { background: var(--el-bg-color); border-color: var(--el-border-color); color: var(--el-text-color-regular); &:hover { border-color: #F26522; color: #F26522; background: #2a1a10; } }
  .ai-panel-footer { border-color: var(--el-border-color); }
}
</style>

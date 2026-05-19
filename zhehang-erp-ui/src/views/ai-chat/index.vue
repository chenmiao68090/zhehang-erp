<template>
  <div class="ai-chat-page">
    <aside class="chat-sidebar">
      <div class="sidebar-header">
        <el-button type="primary" class="new-chat-btn" @click="createNewChat">
          <el-icon><Plus /></el-icon>{{ $t('ai.newChat') }}
        </el-button>
      </div>
      <div class="history-list">
        <div v-for="conv in conversations" :key="conv.id" class="history-item" :class="{ active: currentConvId === conv.id }" @click="switchConversation(conv.id)">
          <el-icon :size="16"><ChatDotRound /></el-icon>
          <span class="history-title text-ellipsis">{{ conv.title }}</span>
          <el-icon class="history-delete" :size="14" @click.stop="deleteConversation(conv.id)"><Close /></el-icon>
        </div>
      </div>
      <div class="sidebar-footer">
        <el-button text @click="clearAllHistory"><el-icon><Delete /></el-icon>{{ $t('ai.clearHistory') }}</el-button>
      </div>
    </aside>
    <main class="chat-main">
      <div v-if="currentMessages.length === 0" class="chat-welcome">
        <div class="welcome-icon"><el-icon :size="48" color="#F26522"><ChatDotRound /></el-icon></div>
        <h2>{{ $t('ai.title') }}</h2>
        <p>{{ $t('ai.exampleQuestions') }}</p>
        <div class="example-questions">
          <div class="example-card" v-for="(q, i) in exampleQuestions" :key="i" @click="sendExample(q)">
            <el-icon :size="16"><ChatLineSquare /></el-icon><span>{{ q }}</span>
          </div>
        </div>
      </div>
      <div v-else class="chat-messages" ref="chatMessagesRef">
        <div v-for="(msg, index) in currentMessages" :key="index" class="chat-msg" :class="msg.role">
          <div class="msg-avatar">
            <el-avatar :size="36" v-if="msg.role === 'assistant'" class="ai-avatar">AI</el-avatar>
            <el-avatar :size="36" v-else class="user-avatar"><el-icon><User /></el-icon></el-avatar>
          </div>
          <div class="msg-wrapper">
            <div class="msg-bubble" v-html="msg.role === 'assistant' ? renderMarkdown(msg.content) : escapeHtml(msg.content)"></div>
            <div class="msg-actions" v-if="msg.role === 'assistant'">
              <el-button link size="small" @click="copyContent(msg.content)"><el-icon><CopyDocument /></el-icon></el-button>
            </div>
          </div>
        </div>
        <div v-if="isThinking" class="chat-msg assistant">
          <div class="msg-avatar"><el-avatar :size="36" class="ai-avatar">AI</el-avatar></div>
          <div class="msg-wrapper">
            <div class="msg-bubble thinking-bubble">
              <span class="typing-dots"><span></span><span></span><span></span></span>{{ $t('ai.thinking') }}
            </div>
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <div class="input-wrapper">
          <el-input v-model="inputText" type="textarea" :autosize="{ minRows: 1, maxRows: 4 }" :placeholder="$t('ai.inputTip')" @keydown.enter.exact="handleEnter" resize="none" />
          <el-button type="primary" :icon="Promotion" circle class="send-btn" @click="sendMessage" :disabled="!inputText.trim() || isThinking" />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ChatDotRound, Close, Delete, User, Promotion, CopyDocument, ChatLineSquare } from '@element-plus/icons-vue'
import { getStorage, setStorage } from '@/utils/storage'

const { t } = useI18n()

interface Message { role: 'user' | 'assistant'; content: string }
interface Conversation { id: string; title: string; messages: Message[]; updateTime: number }

const inputText = ref('')
const isThinking = ref(false)
const chatMessagesRef = ref<HTMLDivElement>()
const currentConvId = ref('')
const conversations = ref<Conversation[]>([])

function loadConversations() {
  try { const raw = getStorage('ai_conversations'); if (raw) conversations.value = JSON.parse(raw) } catch {}
  if (conversations.value.length === 0) createNewChat()
  else currentConvId.value = conversations.value[0].id
}

function saveConversations() { setStorage('ai_conversations', JSON.stringify(conversations.value)) }

const currentMessages = computed(() => {
  const conv = conversations.value.find(c => c.id === currentConvId.value)
  return conv ? conv.messages : []
})

function createNewChat() {
  const id = 'conv_' + Date.now()
  conversations.value.unshift({ id, title: t('ai.newChat') + ' ' + (conversations.value.length + 1), messages: [], updateTime: Date.now() })
  currentConvId.value = id
  saveConversations()
}

function switchConversation(id: string) { currentConvId.value = id; nextTick(() => scrollToBottom()) }

function deleteConversation(id: string) {
  conversations.value = conversations.value.filter(c => c.id !== id)
  if (conversations.value.length === 0) createNewChat()
  else if (currentConvId.value === id) currentConvId.value = conversations.value[0].id
  saveConversations()
}

function clearAllHistory() {
  ElMessageBox.confirm(t('ai.clearHistory') + '?', '', { type: 'warning' }).then(() => {
    conversations.value = []; createNewChat(); saveConversations()
  }).catch(() => {})
}

const exampleQuestions = computed(() => [t('ai.example1'), t('ai.example2'), t('ai.example3')])

function sendExample(q: string) { inputText.value = q; sendMessage() }
function handleEnter(e: KeyboardEvent) { if (!e.shiftKey) { e.preventDefault(); sendMessage() } }

async function sendMessage() {
  const text = inputText.value.trim()
  if (!text || isThinking.value) return
  const conv = conversations.value.find(c => c.id === currentConvId.value)
  if (!conv) return
  conv.messages.push({ role: 'user', content: text })
  if (conv.messages.length === 1) conv.title = text.slice(0, 30)
  conv.updateTime = Date.now()
  inputText.value = ''
  isThinking.value = true
  saveConversations()
  await nextTick(); scrollToBottom()

  const mockReplies: Record<string, string> = {
    '今天有哪些待办事项？': '## 📋 今日待办事项\n\n| 序号 | 事项 | 优先级 | 截止时间 |\n|---|---|---|---|\n| 1 | 审批张三报销申请 | 🔴 紧急 | 17:00 |\n| 2 | 跟进杭州科技合同 | 🔴 紧急 | 15:00 |\n| 3 | 完成月度销售报告 | 🟡 普通 | 明天 12:00 |\n| 4 | 回复客户技术咨询 | 🟡 普通 | 明天 10:00 |\n\n> 建议优先处理审批和合同跟进事项。',
    '本月的销售业绩如何？': '## 📊 本月销售业绩概览\n\n**总业绩：¥128.6万** (目标：¥150万，完成率 85.7%)\n\n### 分类统计\n- 新签合同：¥82.3万 (12笔)\n- 续签合同：¥46.3万 (8笔)\n\n### Top 3 销售\n1. 王五 - ¥38.2万\n2. 赵六 - ¥32.1万\n3. 孙七 - ¥28.5万\n\n> 距离月度目标还差 ¥21.4万，建议加大客户拜访力度。',
    '帮我分析客户跟进情况': '## 🤝 客户跟进分析\n\n### 本周跟进概况\n- 已跟进客户：**23** 家\n- 待跟进客户：**8** 家\n- 新增线索：**5** 条\n\n### ⚠️ 需关注\n1. **杭州科技有限公司** - 合同即将到期，需优先续签\n2. **宁波精密制造** - 新分配线索，3天未联系\n3. **温州贸易公司** - 上次跟进已超7天'
  }
  const reply = mockReplies[text] || '收到您的问题："' + text + '"。\n\nAI 功能正在接入中，敬请期待！'

  setTimeout(() => {
    isThinking.value = false
    const msg: Message = { role: 'assistant', content: '' }
    conv.messages.push(msg)
    let idx = 0
    const timer = setInterval(() => {
      if (idx < reply.length) { msg.content += reply[idx]; idx++; if (idx % 3 === 0) nextTick(() => scrollToBottom()) }
      else { clearInterval(timer); saveConversations(); nextTick(() => scrollToBottom()) }
    }, 15)
  }, 600)
}

function renderMarkdown(text: string): string {
  let html = escapeHtml(text)
  html = html.replace(/^### (.+)/gm, '<h4>$1</h4>')
  html = html.replace(/^## (.+)/gm, '<h3>$1</h3>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  html = html.replace(/^&gt; (.+)/gm, '<blockquote>$1</blockquote>')
  html = html.replace(/^- (.+)/gm, '<li>$1</li>')
  html = html.replace(/^(\d+)\. (.+)/gm, '<li>$2</li>')
  html = html.replace(/\|(.+)\|/g, (match) => {
    const cells = match.split('|').filter(c => c.trim())
    if (cells.every(c => /^[\s-]+$/.test(c))) return ''
    return '<tr>' + cells.map(c => '<td>' + c.trim() + '</td>').join('') + '</tr>'
  })
  html = html.replace(/(<tr>[\s\S]*?<\/tr>)/g, '<table class="md-table">$1</table>')
  html = html.replace(/\n/g, '<br>')
  html = html.replace(/<\/h[3-4]><br>/g, (m) => m.replace('<br>', ''))
  html = html.replace(/<\/li><br>/g, '</li>')
  html = html.replace(/<\/blockquote><br>/g, '</blockquote>')
  return html
}

function escapeHtml(text: string): string { return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function copyContent(text: string) { navigator.clipboard.writeText(text).then(() => { ElMessage.success(t('ai.copySuccess')) }) }
function scrollToBottom() { if (chatMessagesRef.value) chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight }

onMounted(() => { loadConversations() })
</script>

<style lang="scss" scoped>
.ai-chat-page { display: flex; height: calc(100vh - 56px - 48px); background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }

.chat-sidebar { width: 260px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; background: #f8fafc; }
.sidebar-header { padding: 16px; }
.new-chat-btn { width: 100%; background: linear-gradient(135deg, #F26522, #FF8C42); border: none; }
.history-list { flex: 1; overflow-y: auto; padding: 0 8px; }
.history-item {
  display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 8px;
  cursor: pointer; margin-bottom: 2px; transition: background 0.15s; color: #475569;
  &:hover { background: #e2e8f0; .history-delete { opacity: 1; } }
  &.active { background: #fde0cc; color: #F26522; }
}
.history-title { flex: 1; font-size: 13px; }
.history-delete { opacity: 0; transition: opacity 0.15s; color: #94a3b8; &:hover { color: #ef4444; } }
.sidebar-footer { padding: 12px 16px; border-top: 1px solid #e2e8f0; }

.chat-main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.chat-welcome {
  flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; padding: 40px;
  h2 { font-size: 24px; color: #1e293b; } p { color: #64748b; font-size: 14px; }
}
.welcome-icon { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #fde0cc, #fef7f2); display: flex; align-items: center; justify-content: center; }
.example-questions { display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 480px; margin-top: 8px; }
.example-card {
  display: flex; align-items: center; gap: 10px; padding: 14px 18px; border: 1px solid #e2e8f0;
  border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 14px; color: #334155;
  &:hover { border-color: #F26522; background: #fef7f2; color: #F26522; }
}

.chat-messages { flex: 1; overflow-y: auto; padding: 24px 32px; }
.chat-msg {
  display: flex; gap: 12px; margin-bottom: 24px;
  &.user { flex-direction: row-reverse; .msg-bubble { background: #F26522; color: #fff; border-radius: 16px 16px 0 16px; } }
  &.assistant .msg-bubble { background: #f1f5f9; color: #334155; border-radius: 16px 16px 16px 0; }
}
.ai-avatar { background: linear-gradient(135deg, #F26522, #FF8C42); color: #fff; font-size: 14px; font-weight: 600; }
.user-avatar { background: #3B82F6; color: #fff; }
.msg-wrapper { max-width: 70%; }
.msg-bubble {
  padding: 12px 16px; font-size: 14px; line-height: 1.7; word-break: break-word;
  :deep(h3) { font-size: 15px; margin: 6px 0; }
  :deep(h4) { font-size: 14px; margin: 4px 0; }
  :deep(strong) { font-weight: 600; }
  :deep(code) { background: rgba(0,0,0,0.06); padding: 2px 6px; border-radius: 4px; font-size: 13px; }
  :deep(blockquote) { border-left: 3px solid #F26522; padding: 4px 12px; margin: 8px 0; color: #64748b; background: #fef7f2; border-radius: 0 4px 4px 0; }
  :deep(.md-table) { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 13px; td { padding: 6px 10px; border: 1px solid #e2e8f0; } tr:first-child { font-weight: 600; background: #f8fafc; } }
  :deep(li) { margin-left: 16px; }
}
.thinking-bubble { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-style: italic; }
.typing-dots {
  display: inline-flex; gap: 3px;
  span { width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; animation: bounce 1.2s ease-in-out infinite; &:nth-child(2) { animation-delay: 0.2s; } &:nth-child(3) { animation-delay: 0.4s; } }
}
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-5px); } }
.msg-actions { margin-top: 4px; opacity: 0; transition: opacity 0.15s; }
.chat-msg:hover .msg-actions { opacity: 1; }

.chat-input-area { padding: 16px 32px 24px; border-top: 1px solid #f1f5f9; }
.input-wrapper {
  display: flex; align-items: flex-end; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 12px; padding: 8px 12px; transition: border-color 0.2s;
  &:focus-within { border-color: #F26522; }
  :deep(.el-textarea__inner) { background: transparent; border: none; box-shadow: none; padding: 4px 0; font-size: 14px; }
}
.send-btn { flex-shrink: 0; background: linear-gradient(135deg, #F26522, #FF8C42); border: none; }

html.dark {
  .ai-chat-page { background: var(--el-bg-color); }
  .chat-sidebar { background: var(--el-bg-color-page); border-color: var(--el-border-color); }
  .history-item { color: var(--el-text-color-regular); &:hover { background: var(--el-bg-color-overlay); } &.active { background: #4a2a15; color: #F26522; } }
  .sidebar-footer { border-color: var(--el-border-color); }
  .chat-welcome h2 { color: var(--el-text-color-primary); }
  .example-card { border-color: var(--el-border-color); color: var(--el-text-color-regular); &:hover { background: #2a1a10; } }
  .chat-msg.assistant .msg-bubble { background: var(--el-bg-color-overlay); color: var(--el-text-color-regular); }
  .chat-input-area { border-color: var(--el-border-color); }
  .input-wrapper { background: var(--el-bg-color-overlay); border-color: var(--el-border-color); }
}
</style>

<template>
  <div class="ai-qa">
    <div ref="scrollArea" class="qa-main">
      <!-- 欢迎态(无对话时) -->
      <div v-if="!messages.length" class="qa-welcome">
        <div class="qa-logo"></div>
        <h2 class="qa-title">AI 知识问答</h2>
        <p class="qa-sub">基于公司知识库,AI 帮你快速找到答案</p>
        <div class="qa-examples">
          <span v-for="ex in examples" :key="ex" class="qa-ex" @click="ask(ex)">
            <el-icon><ChatLineRound /></el-icon> {{ ex }}
          </span>
        </div>
      </div>

      <!-- 对话态 -->
      <div v-else class="qa-msgs">
        <div v-for="(m, i) in messages" :key="i" :class="['qa-msg', m.role]">
          <div class="qa-avatar" :class="m.role">{{ m.role === 'user' ? '我' : 'AI' }}</div>
          <div class="qa-bubble" v-html="sanitizeHtml(renderText(m.content))"></div>
        </div>
        <div v-if="loading" class="qa-msg ai">
          <div class="qa-avatar ai">AI</div>
          <div class="qa-bubble qa-typing"><span></span><span></span><span></span></div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="qa-input-wrap">
      <div class="qa-input-box">
        <el-input
          v-model="input"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 5 }"
          resize="none"
          placeholder="试试输入问题,AI 帮你从知识库找答案…"
          @keydown.enter.exact.prevent="send"
        />
        <div class="qa-input-actions">
          <el-button v-if="messages.length" text size="small" @click="newChat">
            <el-icon><Plus /></el-icon> 新对话
          </el-button>
          <el-button
            class="qa-send"
            type="primary"
            circle
            :loading="loading"
            :disabled="!input.trim()"
            @click="send"
          >
            <el-icon><Top /></el-icon>
          </el-button>
        </div>
      </div>
      <div class="qa-hint">回车发送 · Shift + 回车换行 · 回答由 AI 生成,请自行核实</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ChatLineRound, Top, Plus } from '@element-plus/icons-vue'
import { sendChat } from '@/api/ai'
import { sanitizeHtml } from '@/utils/sanitize-html'

interface Msg {
  role: 'user' | 'ai'
  content: string
}

const input = ref('')
const messages = ref<Msg[]>([])
const loading = ref(false)
const conversationId = ref<string>()
const scrollArea = ref<HTMLElement>()

const examples = [
  '公司的代理记账服务包含哪些内容?',
  '新员工入职流程是怎样的?',
  '客户续费的优惠政策有哪些?'
]

const scrollToBottom = () => {
  nextTick(() => {
    if (scrollArea.value) scrollArea.value.scrollTop = scrollArea.value.scrollHeight
  })
}

const ask = (text: string) => {
  input.value = text
  send()
}

const send = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  scrollToBottom()
  try {
    const res: any = await sendChat({
      message: text,
      conversationId: conversationId.value
    })
    const data = res?.data ?? res
    const reply = data?.reply || data?.content || '抱歉,我没有找到相关答案。'
    if (data?.conversationId) conversationId.value = data.conversationId
    messages.value.push({ role: 'ai', content: reply })
  } catch {
    messages.value.push({ role: 'ai', content: '⚠️ AI 服务暂时不可用,请稍后再试或联系管理员检查 AI 配置。' })
    ElMessage.error('AI 回答失败')
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

const newChat = () => {
  messages.value = []
  conversationId.value = undefined
  input.value = ''
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const renderText = (s: string) => sanitizeHtml(escapeHtml(s || '').replace(/\n/g, '<br>'))
</script>

<style scoped>
.ai-qa {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: var(--el-bg-color);
}
.qa-main {
  flex: 1;
  overflow-y: auto;
  padding: 24px 0;
}
/* 欢迎态 */
.qa-welcome {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 8vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.qa-logo {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: conic-gradient(from 180deg, #5b8cff, #9b6bff, #ff7eb3, #ffb36b, #5b8cff);
  box-shadow: 0 8px 24px rgba(91, 108, 255, 0.25);
  position: relative;
}
.qa-logo::after {
  content: '';
  position: absolute;
  inset: 22px;
  border-radius: 50%;
  background: var(--el-bg-color);
}
.qa-title {
  margin: 18px 0 6px;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.qa-sub {
  margin: 0;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.qa-examples {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 28px;
  width: 100%;
  max-width: 460px;
}
.qa-ex {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-blank);
  cursor: pointer;
  transition: all 0.18s;
}
.qa-ex:hover {
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
/* 对话态 */
.qa-msgs {
  max-width: 760px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.qa-msg {
  display: flex;
  gap: 12px;
}
.qa-msg.user {
  flex-direction: row-reverse;
}
.qa-avatar {
  width: 34px;
  height: 34px;
  flex: none;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.qa-avatar.user {
  background: var(--el-color-primary);
}
.qa-avatar.ai {
  background: linear-gradient(135deg, #7a6bff, #ff7eb3);
}
.qa-bubble {
  max-width: 78%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  line-height: 1.7;
  word-break: break-word;
}
.qa-msg.user .qa-bubble {
  background: var(--el-color-primary);
  color: #fff;
  border-top-right-radius: 4px;
}
.qa-msg.ai .qa-bubble {
  background: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  border-top-left-radius: 4px;
}
.qa-typing {
  display: inline-flex;
  gap: 4px;
  align-items: center;
}
.qa-typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-text-color-secondary);
  animation: qa-bounce 1.2s infinite;
}
.qa-typing span:nth-child(2) { animation-delay: 0.2s; }
.qa-typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes qa-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-5px); opacity: 1; }
}
/* 输入区 */
.qa-input-wrap {
  max-width: 760px;
  width: 100%;
  margin: 0 auto;
  padding: 8px 16px 16px;
}
.qa-input-box {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 16px;
  background: var(--el-bg-color);
  transition: border-color 0.18s, box-shadow 0.18s;
}
.qa-input-box:focus-within {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 3px var(--el-color-primary-light-9);
}
.qa-input-box :deep(.el-textarea__inner) {
  border: none;
  box-shadow: none;
  padding: 4px 6px;
  font-size: 15px;
  background: transparent;
  resize: none;
}
.qa-input-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: none;
}
.qa-send {
  width: 36px;
  height: 36px;
}
.qa-hint {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

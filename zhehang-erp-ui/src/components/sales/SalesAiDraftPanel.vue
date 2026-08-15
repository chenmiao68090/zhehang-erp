<template>
  <section class="ai-draft-panel" :class="{ 'is-ready': draft?.available }">
    <header>
      <div>
        <div class="ai-title"><el-icon><MagicStick /></el-icon><strong>AI 销售教练</strong><el-tag size="small" effect="plain">草稿</el-tag><el-tag v-if="localDemo" size="small" type="warning" effect="plain">LOCAL-DEMO</el-tag></div>
        <p>依据当前客户、历史跟进和有权录音生成，不会自动保存正式记录。</p>
      </div>
      <el-button type="primary" plain :loading="loading" :disabled="!leadId" @click="generate">
        {{ draft ? '重新生成' : '生成建议' }}
      </el-button>
    </header>

    <el-alert v-if="errorMessage" type="warning" :closable="false" show-icon :title="errorMessage" />
    <template v-if="draft?.available">
      <div class="ai-meta">
        <span>置信度 <b>{{ draft.confidence }}%</b></span>
        <span>数据截至 {{ dateTime(draft.dataTime || draft.generatedAt) }}</span>
        <span>{{ transcriptionLabel }}</span>
      </div>
      <div class="ai-summary">
        <span>建议小结</span>
        <p>{{ draft.summary || '事实不足，未生成小结' }}</p>
      </div>
      <div class="ai-facts">
        <article><span>需求</span><p>{{ draft.demand || '未识别' }}</p></article>
        <article><span>预算</span><p>{{ draft.budget || '未识别' }}</p></article>
        <article><span>决策人</span><p>{{ draft.decisionMaker || '未识别' }}</p></article>
        <article><span>意向建议</span><p><b v-if="draft.intentLevel">{{ draft.intentLevel }} 类</b>{{ draft.intentReason ? ` · ${draft.intentReason}` : '证据不足，暂不建议分级' }}</p></article>
      </div>
      <div v-if="draft.objections?.length || draft.commitments?.length || draft.riskSignals?.length" class="ai-lists">
        <div v-if="draft.objections?.length"><span>客户异议</span><el-tag v-for="item in draft.objections" :key="item" effect="plain">{{ item }}</el-tag></div>
        <div v-if="draft.commitments?.length"><span>客户承诺</span><el-tag v-for="item in draft.commitments" :key="item" type="success" effect="plain">{{ item }}</el-tag></div>
        <div v-if="draft.riskSignals?.length"><span>风险提醒</span><el-tag v-for="item in draft.riskSignals" :key="item" type="warning" effect="plain">{{ item }}</el-tag></div>
      </div>
      <div class="ai-next">
        <span>下一最佳动作</span>
        <p>{{ nextActionText }}</p>
        <div v-if="draft.recommendedMaterials?.length" class="materials">
          <span>推荐资料</span>
          <el-tag v-for="item in draft.recommendedMaterials" :key="item" effect="plain">{{ item }}</el-tag>
        </div>
        <small v-if="draft.callbackScript">建议话术：{{ draft.callbackScript }}</small>
      </div>
      <footer>
        <el-tooltip content="只填入当前表单，仍需人工核对并点击原保存按钮" placement="top">
          <el-button type="primary" @click="applyDraft">采用到草稿</el-button>
        </el-tooltip>
        <div class="feedback">
          <span>这条建议有用吗？</span>
          <el-button text :disabled="feedbackSent" @click="feedback(true)">有用</el-button>
          <el-button text :disabled="feedbackSent" @click="feedback(false)">没用</el-button>
        </div>
      </footer>
      <details v-if="draft.citations?.length">
        <summary>查看 {{ draft.citations.length }} 条事实来源</summary>
        <ul><li v-for="item in draft.citations" :key="`${item.type}-${item.id || item.label}`">{{ item.label }} · {{ dateTime(item.occurredAt) }}</li></ul>
      </details>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { MagicStick } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  generateSalesFollowDraft,
  submitSalesAiFeedback,
  type SalesAiDraft
} from '@/api/sales-ai'

const props = defineProps<{
  leadId?: number | null
  callRecordId?: number | null
  platformCallId?: string
  connected?: number
  result?: string
  userNote?: string
  localDemo?: boolean
  demoDraft?: SalesAiDraft | null
}>()

const emit = defineEmits<{
  (event: 'apply', draft: SalesAiDraft): void
}>()

const loading = ref(false)
const errorMessage = ref('')
const draft = ref<SalesAiDraft | null>(props.demoDraft || null)
const feedbackSent = ref(false)

watch(() => props.leadId, () => {
  draft.value = props.demoDraft || null
  errorMessage.value = ''
  feedbackSent.value = false
})

watch(() => props.demoDraft, (value) => {
  if (props.localDemo) draft.value = value || null
}, { deep: true })

const transcriptionLabel = computed(() => {
  const status = draft.value?.transcriptionStatus
  if (status === 'ready') return '录音已转写'
  if (status === 'missing') return '平台暂未生成录音'
  if (status === 'failed') return '录音转写失败，已用其他事实'
  if (status === 'unavailable') return '未配置录音转写'
  return '未关联录音'
})

const nextActionText = computed(() => {
  if (!draft.value?.nextActionType) {
    if (draft.value?.intentLevel === 'D') return '建议转长期培育或历史客资'
    if (draft.value?.intentLevel === 'E') return '建议暂停拨打并进入历史客资'
    return '事实不足，暂未生成下一步建议'
  }
  return [draft.value.nextActionType, dateTime(draft.value.nextActionTime), draft.value.nextActionContent]
    .filter(Boolean).join(' · ')
})

async function generate() {
  const leadId = Number(props.leadId || 0)
  if (!leadId) return
  if (props.localDemo && props.demoDraft) {
    draft.value = props.demoDraft
    errorMessage.value = ''
    feedbackSent.value = false
    return
  }
  loading.value = true
  errorMessage.value = ''
  feedbackSent.value = false
  try {
    const response: any = await generateSalesFollowDraft({
      leadId,
      callRecordId: Number(props.callRecordId || 0) || undefined,
      platformCallId: props.platformCallId || undefined,
      connected: Number(props.connected) === 1 ? 1 : 0,
      result: props.result || undefined,
      userNote: props.userNote || undefined
    })
    draft.value = response?.data ?? response
    if (!draft.value?.available) errorMessage.value = draft.value?.message || 'AI服务暂时不可用，可继续手工填写'
  } catch (error: any) {
    errorMessage.value = error?.message || 'AI服务暂时不可用，可继续手工填写'
  } finally {
    loading.value = false
  }
}

async function applyDraft() {
  if (!draft.value) return
  emit('apply', draft.value)
  ElMessage.success('已填入当前草稿，请核对后再保存')
  await sendFeedback({ useful: true, adopted: true })
}

async function feedback(useful: boolean) {
  await sendFeedback({ useful, adopted: false, reasonCode: useful ? '' : 'NOT_RELEVANT' })
  ElMessage.success('已记录反馈')
}

async function sendFeedback(payload: { useful: boolean; adopted: boolean; reasonCode?: '' | 'NOT_RELEVANT' }) {
  if (!draft.value?.draftId || feedbackSent.value) return
  if (props.localDemo) {
    feedbackSent.value = true
    return
  }
  try {
    await submitSalesAiFeedback({ draftId: draft.value.draftId, ...payload })
    feedbackSent.value = true
  } catch {
    // Feedback failure must not block the sales workflow.
  }
}

function dateTime(value?: string | null) {
  return value && dayjs(value).isValid() ? dayjs(value).format('MM-DD HH:mm') : ''
}
</script>

<style scoped lang="scss">
.ai-draft-panel {
  margin: 12px 0;
  padding: 14px 16px;
  border: 1px solid #dce4ef;
  border-radius: 6px;
  background: #f8fafc;
  color: #334155;
}
.ai-draft-panel.is-ready { border-color: #b8d1fb; background: #f5f9ff; }
header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.ai-title { display: flex; align-items: center; gap: 7px; color: #1d4f9c; font-size: 15px; }
header p { margin: 4px 0 0; color: #718096; font-size: 13px; }
.ai-meta { display: flex; gap: 18px; flex-wrap: wrap; margin: 13px 0 8px; color: #64748b; font-size: 13px; }
.ai-meta b { color: #1d4ed8; }
.ai-summary, .ai-next { padding: 10px 12px; border-left: 3px solid #3b82f6; background: #fff; }
.ai-summary span, .ai-next span, .ai-facts span, .ai-lists span { color: #64748b; font-size: 13px; }
.ai-summary p, .ai-next p { margin: 5px 0 0; font-size: 14px; line-height: 1.65; white-space: pre-wrap; }
.ai-next small { display: block; margin-top: 7px; color: #526174; line-height: 1.55; }
.materials { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
.ai-facts { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 16px; margin: 10px 0; }
.ai-facts article { min-width: 0; }
.ai-facts p { margin: 3px 0 0; overflow-wrap: anywhere; font-size: 14px; }
.ai-lists { display: grid; gap: 7px; margin: 10px 0; }
.ai-lists > div { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ai-lists .el-tag, .materials .el-tag { max-width: 100%; height: auto; padding: 4px 8px; white-space: normal; line-height: 1.4; }
footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 12px; }
.feedback { display: flex; align-items: center; gap: 2px; color: #7c8798; font-size: 13px; }
details { margin-top: 10px; color: #718096; font-size: 13px; }
details summary { cursor: pointer; }
details ul { margin: 7px 0 0; padding-left: 18px; }
@media (max-width: 680px) {
  header, footer { align-items: stretch; flex-direction: column; }
  .ai-facts { grid-template-columns: 1fr; }
  .feedback { justify-content: flex-end; }
}
</style>

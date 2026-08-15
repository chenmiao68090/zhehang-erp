<template>
  <section class="sales-ai-insight">
    <header>
      <div>
        <div class="title"><el-icon><DataAnalysis /></el-icon><strong>AI 经营复盘</strong><el-tag size="small" effect="plain">按需生成</el-tag><el-tag v-if="localDemo" size="small" type="warning" effect="plain">LOCAL-DEMO</el-tag></div>
        <p>沿用当前日期、部门和人员范围；只做辅助分析，不自动创建任务或考核。</p>
      </div>
      <el-button type="primary" plain :loading="loading" @click="generate">{{ insight ? '重新分析' : '生成复盘' }}</el-button>
    </header>
    <el-alert v-if="errorMessage" type="warning" :closable="false" show-icon :title="errorMessage" />
    <div v-if="insight?.available" class="content">
      <div class="meta"><span>{{ insight.scopeLabel }}</span><span>{{ insight.dataRange }}</span><span>置信度 {{ insight.confidence }}%</span></div>
      <p class="summary">{{ insight.summary }}</p>
      <div class="columns">
        <article><h4>值得关注</h4><ul><li v-for="item in insight.highlights" :key="item">{{ item }}</li><li v-if="!insight.highlights.length">暂无明确亮点</li></ul></article>
        <article class="risk"><h4>风险与异常</h4><ul><li v-for="item in insight.risks" :key="item">{{ item }}</li><li v-if="!insight.risks.length">暂无明确风险</li></ul></article>
        <article><h4>主管辅导建议</h4><ul><li v-for="item in insight.coaching" :key="item">{{ item }}</li><li v-if="!insight.coaching.length">事实不足，暂不建议</li></ul></article>
        <article><h4>团队共性异议</h4><ul><li v-for="item in insight.commonObjections" :key="item">{{ item }}</li><li v-if="!insight.commonObjections.length">尚无结构化异议证据</li></ul></article>
      </div>
      <div class="quality"><b>异议与来源口径：</b>{{ insight.sourceQuality || '当前事实源不足，未作推断' }}</div>
      <footer>生成于 {{ dateTime(insight.generatedAt) }} · {{ insight.promptVersion }} · 数据不足时不补造结论</footer>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import dayjs from 'dayjs'
import { DataAnalysis } from '@element-plus/icons-vue'
import { generateSalesManagementInsight, type SalesAiManagementInsight } from '@/api/sales-ai'
import type { SalesConsoleQuery } from '@/api/sales-console'

const props = defineProps<{
  query: SalesConsoleQuery
  localDemo?: boolean
  demoInsight?: SalesAiManagementInsight | null
}>()
const loading = ref(false)
const errorMessage = ref('')
const insight = ref<SalesAiManagementInsight | null>(props.demoInsight || null)

async function generate() {
  if (props.localDemo && props.demoInsight) {
    insight.value = props.demoInsight
    errorMessage.value = ''
    return
  }
  loading.value = true
  errorMessage.value = ''
  try {
    const response: any = await generateSalesManagementInsight(props.query)
    insight.value = response?.data ?? response
    if (!insight.value?.available) errorMessage.value = insight.value?.message || 'AI服务暂时不可用'
  } catch (error: any) {
    errorMessage.value = error?.message || 'AI服务暂时不可用，经营台原数据仍可正常查看'
  } finally {
    loading.value = false
  }
}

function dateTime(value?: string) {
  return value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm') : '—'
}
</script>

<style scoped lang="scss">
.sales-ai-insight { margin: -6px 0 20px; padding: 15px 17px; border: 1px solid #dce4ef; border-radius: 6px; background: #fff; }
header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
.title { display: flex; align-items: center; gap: 8px; color: #1d4f9c; }
header p { margin: 4px 0 0; color: #718096; font-size: 13px; }
.content { margin-top: 14px; border-top: 1px solid #e5eaf1; padding-top: 13px; }
.meta { display: flex; gap: 18px; flex-wrap: wrap; color: #64748b; font-size: 13px; }
.summary { margin: 10px 0; padding: 10px 12px; border-left: 3px solid #3b82f6; background: #f6f9fe; line-height: 1.65; }
.columns { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.columns article { padding: 10px 12px; border: 1px solid #e4e9f0; border-radius: 5px; }
.columns h4 { margin: 0 0 7px; font-size: 14px; }
.columns ul { margin: 0; padding-left: 18px; color: #4b5870; font-size: 13px; line-height: 1.65; }
.risk h4 { color: #b45309; }
.quality { margin-top: 10px; color: #64748b; font-size: 13px; }
footer { margin-top: 10px; color: #8a95a6; font-size: 13px; }
@media (max-width: 900px) { .columns { grid-template-columns: 1fr; } }
@media (max-width: 680px) { header { flex-direction: column; align-items: stretch; } }
</style>

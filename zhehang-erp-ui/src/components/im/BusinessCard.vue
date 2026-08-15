<template>
  <section class="business-card">
    <header><span><el-icon><Briefcase /></el-icon></span><div><small>{{ typeLabel }}</small><b>{{ card.title || messageText }}</b></div></header>
    <dl>
      <template v-if="card.businessId"><dt>业务编号</dt><dd>#{{ card.businessId }}</dd></template>
      <template v-if="card.currentStatus"><dt>当前状态</dt><dd>{{ statusText }}</dd></template>
      <template v-if="card.responsibleName || card.responsibleId"><dt>责任人</dt><dd>{{ card.responsibleName || `员工 #${card.responsibleId}` }}</dd></template>
      <template v-if="card.operatorName || card.operatorId"><dt>操作人</dt><dd>{{ card.operatorName || `员工 #${card.operatorId}` }}</dd></template>
      <template v-if="card.occurredAt"><dt>发生时间</dt><dd>{{ occurredAtText }}</dd></template>
      <template v-if="card.requirement"><dt>处理要求</dt><dd>{{ card.requirement }}</dd></template>
    </dl>
    <footer><small v-if="card.eventId">事件 {{ card.eventId }}</small><el-button v-if="card.actionUrl" type="primary" text @click="$emit('open', card.actionUrl)">{{ card.actionLabel || '去处理' }}<el-icon><ArrowRight /></el-icon></el-button></footer>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight, Briefcase } from '@element-plus/icons-vue'
import type { ImBusinessCard } from '@/api/im'

const props = defineProps<{ card: ImBusinessCard; messageText: string }>()
defineEmits<{ open: [path: string] }>()
const typeLabel = computed(() => ({ customer: '客户事项', lead: '销售线索', order: '提单事项', review: '审单事项', receipt: '收款事项', contract: '合同事项', issue: '客户问题', training: '培训任务' } as Record<string, string>)[props.card.businessType || ''] || '业务通知')
const statusText = computed(() => ({
  pending: '待接单', processing: '处理中', waiting: '等待反馈', completed: '已完成',
  closed: '已关闭', rejected: '已驳回', reviewing: '待审核', pending_finance: '待财务确认', confirmed: '已确认',
  pending_assign: '待分配', pending_accept: '待接收', pending_confirm: '待验收',
  accept_rejected: '资料退回', complete_rejected: '验收驳回'
} as Record<string, string>)[props.card.currentStatus || ''] || props.card.currentStatus || '-')
const occurredAtText = computed(() => props.card.occurredAt
  ? new Date(props.card.occurredAt).toLocaleString('zh-CN', { hour12: false })
  : '')
</script>

<style scoped>
.business-card { width: min(500px, 100%); overflow: hidden; border: 1px solid #d9dde5; border-left: 4px solid #0f8f65; border-radius: 7px; background: #fff; color: #1d2129; }
.business-card header { display: grid; grid-template-columns: 34px minmax(0, 1fr); align-items: center; gap: 9px; padding: 12px 13px; }
.business-card header > span { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 6px; background: #e8f8f2; color: #0f8f65; font-size: 18px; }
.business-card header div { min-width: 0; display: grid; gap: 2px; }
.business-card small { color: #86909c; font-size: 12px; }
.business-card header b { overflow: hidden; font-size: 15px; text-overflow: ellipsis; white-space: nowrap; }
.business-card dl { display: grid; grid-template-columns: 72px minmax(0, 1fr); gap: 7px 10px; margin: 0; padding: 10px 13px; border-top: 1px solid #f0f1f3; font-size: 13px; }
.business-card dt { color: #86909c; }
.business-card dd { margin: 0; color: #4e5969; line-height: 19px; }
.business-card footer { min-height: 40px; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 5px 9px 5px 13px; border-top: 1px solid #f0f1f3; }
.business-card footer small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>

<template>
  <el-drawer v-model="open" :title="page.title" size="min(720px, 94vw)" append-to-body destroy-on-close>
    <template v-if="record">
      <div class="detail-head">
        <div>
          <div class="detail-title">{{ record.title }}</div>
          <div class="detail-no">{{ record.recordNo }}</div>
        </div>
        <el-tag :type="statusType(record.status)" effect="light">{{ statusLabel(record.status) }}</el-tag>
      </div>
      <el-descriptions :column="2" border class="detail-base">
        <el-descriptions-item label="负责人">{{ record.ownerName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="所属部门">{{ record.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务日期">{{ record.bizDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ record.updateTime || '-' }}</el-descriptions-item>
      </el-descriptions>

      <div class="section-title">业务资料</div>
      <div class="field-list">
        <div v-for="item in page.fields" :key="item.key" class="field-row" :class="{ wide: item.span === 2 || item.type === 'textarea' }">
          <span>{{ item.label }}</span>
          <strong>{{ display(record.data?.[item.key], item.type) }}</strong>
        </div>
      </div>

      <template v-if="record.data?.attachments?.length">
        <div class="section-title">附件资料</div>
        <div class="attachments">
          <div v-for="name in record.data.attachments" :key="name" class="attachment-item">
            <el-icon><Paperclip /></el-icon><span>{{ name }}</span>
          </div>
        </div>
      </template>

      <div class="section-title">操作记录</div>
      <el-timeline v-if="record.logs?.length" class="audit-list">
        <el-timeline-item v-for="log in [...record.logs].reverse()" :key="log.id" :timestamp="log.createTime" placement="top">
          <div class="audit-card">
            <strong>{{ actionLabel(log.action) }}</strong>
            <span>{{ log.operatorName || '系统' }}</span>
            <p v-if="log.remark">{{ log.remark }}</p>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无操作记录" :image-size="80" />
    </template>
    <el-skeleton v-else :rows="8" animated />
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Paperclip } from '@element-plus/icons-vue'
import type { FeigeSuiteRecord } from '@/api/feige-suite'
import type { FeigeSuiteFieldConfig, FeigeSuitePageConfig } from '../types'

const props = defineProps<{ modelValue: boolean; page: FeigeSuitePageConfig; record?: FeigeSuiteRecord | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const open = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

const STATUS_LABELS: Record<string, string> = { draft: '草稿', active: '正常', pending: '待处理', in_progress: '进行中', approved: '已通过', rejected: '已驳回', completed: '已完成', archived: '已归档', enabled: '已启用', disabled: '已停用', published: '已发布', revoked: '已撤回', unread: '未读', read: '已读', paid: '已发放', locked: '已锁定' }
const ACTION_LABELS: Record<string, string> = { create: '创建记录', update: '更新资料', start: '开始', submit: '提交审核', approve: '审核通过', reject: '驳回', complete: '办结', archive: '归档', restore: '恢复', publish: '发布', revoke: '撤回', enable: '启用', disable: '停用', pay: '确认发放', lock: '锁定', unlock: '解锁', 'mark-read': '标为已读' }

function statusLabel(status: string): string { return STATUS_LABELS[status] || status || '-' }
function actionLabel(action: string): string { return ACTION_LABELS[action] || action }
function statusType(status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  if (['approved', 'completed', 'enabled', 'published', 'paid', 'active', 'read'].includes(status)) return 'success'
  if (['rejected', 'revoked'].includes(status)) return 'danger'
  if (['pending', 'in_progress', 'draft', 'unread'].includes(status)) return 'warning'
  return 'info'
}
function display(value: any, type?: FeigeSuiteFieldConfig['type']): string {
  if (value === undefined || value === null || value === '') return '-'
  if (type === 'money') return `¥${Number(value).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}`
  if (type === 'switch') return value ? '是' : '否'
  if (Array.isArray(value)) return value.join('、')
  return String(value)
}
</script>

<style scoped>
.detail-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; padding: 16px 18px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; }
.detail-title { font-size: 20px; font-weight: 700; color: #0f172a; line-height: 28px; }
.detail-no { margin-top: 5px; color: #64748b; font-size: 13px; }
.detail-base { margin-top: 16px; }
.section-title { margin: 24px 0 12px; padding-left: 10px; border-left: 3px solid #2563eb; font-size: 17px; font-weight: 700; color: #1e293b; }
.field-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden; }
.field-row { display: flex; flex-direction: column; gap: 6px; min-height: 76px; padding: 13px 16px; border-right: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
.field-row:nth-child(2n) { border-right: 0; }
.field-row.wide { grid-column: 1 / -1; border-right: 0; }
.field-row span { color: #64748b; font-size: 13px; }
.field-row strong { color: #1e293b; font-size: 15px; line-height: 22px; white-space: pre-wrap; word-break: break-word; }
.attachments { display: flex; flex-wrap: wrap; gap: 10px; }
.attachment-item { display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border: 1px solid #dbe4f0; border-radius: 6px; color: #334155; font-size: 14px; }
.audit-card { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 6px; }
.audit-card span { margin-left: 12px; color: #64748b; }
.audit-card p { margin: 7px 0 0; color: #475569; line-height: 21px; }
@media (max-width: 680px) { .field-list { grid-template-columns: 1fr; } .field-row { border-right: 0; } .field-row.wide { grid-column: auto; } }
</style>

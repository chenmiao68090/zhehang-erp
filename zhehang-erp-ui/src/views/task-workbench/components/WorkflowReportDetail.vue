<template>
  <el-drawer v-model="visible" :title="`${row?.userName || ''} · 工作报告`" size="720px">
    <template v-if="row">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="部门">{{ row.deptName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ row.roleName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="应报天数">{{ row.requiredDays }}</el-descriptions-item>
        <el-descriptions-item label="已报天数">{{ row.submittedDays }}</el-descriptions-item>
      </el-descriptions>
      <div class="detail-rate">
        <strong>报告完成率</strong>
        <el-progress :percentage="row.completionRate" :status="row.completionRate >= 100 ? 'success' : undefined" />
      </div>
      <h3>逐日提交记录</h3>
      <div class="day-list">
        <div v-for="day in row.days" :key="day.date" class="day-row">
          <span>{{ day.date }}</span>
          <el-tag :type="day.submitted ? 'success' : 'danger'">{{ day.submitted ? '已提交' : '缺报' }}</el-tag>
          <em>{{ day.done || 0 }}/{{ day.total || 0 }} 项完成</em>
        </div>
      </div>
      <h3>周期总结</h3>
      <div class="summary-box">{{ row.summary || '未填写总结' }}</div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { WorkflowReportRow } from '@/api/feige-task'

const visible = ref(false)
const row = ref<WorkflowReportRow>()
function open(record: WorkflowReportRow) { row.value = record; visible.value = true }
defineExpose({ open })
</script>

<style scoped>
.detail-rate { margin: 20px 0; display: grid; gap: 8px; }
.day-list { display: grid; gap: 8px; margin-bottom: 22px; }
.day-row { display: grid; grid-template-columns: 1fr auto 130px; gap: 12px; align-items: center; border-bottom: 1px solid #eef2f7; padding: 9px 4px; }
.day-row em { color: #6b7280; font-style: normal; text-align: right; }
.summary-box { background: #f8fafc; border-radius: 8px; padding: 14px; line-height: 1.7; color: #374151; }
</style>

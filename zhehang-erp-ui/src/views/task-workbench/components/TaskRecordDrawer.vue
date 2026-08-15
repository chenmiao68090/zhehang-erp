<template>
  <el-drawer v-model="visible" :title="title" size="min(900px, 94vw)" destroy-on-close append-to-body>
    <el-table v-loading="loading" :data="rows" row-key="id" empty-text="暂无记录" border>
      <template v-if="mode === 'payments'">
        <el-table-column prop="paymentTime" label="收款时间" min-width="170" />
        <el-table-column label="金额" width="130" align="right"><template #default="{ row }">{{ money(row.amount) }}</template></el-table-column>
        <el-table-column prop="paymentMethod" label="方式" width="120" />
        <el-table-column prop="accountNumber" label="收款账户" min-width="150" show-overflow-tooltip />
        <el-table-column prop="statusLabel" label="状态" width="105"><template #default="{ row }"><el-tag :type="row.status === 'confirmed' ? 'success' : 'info'">{{ row.statusLabel || row.status || '-' }}</el-tag></template></el-table-column>
        <el-table-column label="备注" min-width="190" show-overflow-tooltip><template #default="{ row }">{{ row.remarks || row.remark || '-' }}</template></el-table-column>
      </template>
      <template v-else-if="mode === 'steps'">
        <el-table-column label="步骤" width="80" align="center"><template #default="{ row }">{{ row.stepOrder ?? row.sequence ?? '-' }}</template></el-table-column>
        <el-table-column label="流程节点" min-width="170"><template #default="{ row }">{{ row.stepName || row.name || '-' }}</template></el-table-column>
        <el-table-column prop="roleName" label="审核角色" width="130" />
        <el-table-column prop="assigneeName" label="处理人" width="120" />
        <el-table-column label="状态" width="105"><template #default="{ row }"><el-tag :type="stepType(row.status)">{{ row.statusLabel || stepLabel(row.status) }}</el-tag></template></el-table-column>
        <el-table-column prop="completedTime" label="处理时间" min-width="170" />
        <el-table-column label="处理意见" min-width="200" show-overflow-tooltip><template #default="{ row }">{{ row.remark || row.comment || '-' }}</template></el-table-column>
      </template>
      <template v-else>
        <el-table-column label="操作时间" min-width="170"><template #default="{ row }">{{ row.operateTime || row.createTime || '-' }}</template></el-table-column>
        <el-table-column prop="operatorName" label="操作人" width="120" />
        <el-table-column prop="actionLabel" label="动作" width="120"><template #default="{ row }">{{ row.actionLabel || row.action || '-' }}</template></el-table-column>
        <el-table-column label="结果" width="110"><template #default="{ row }"><el-tag :type="stepType(row.result)">{{ stepLabel(row.result) }}</el-tag></template></el-table-column>
        <el-table-column label="操作内容" min-width="260" show-overflow-tooltip><template #default="{ row }">{{ row.content || row.comment || '-' }}</template></el-table-column>
        <el-table-column label="备注" min-width="180" show-overflow-tooltip><template #default="{ row }">{{ row.remark || '-' }}</template></el-table-column>
      </template>
    </el-table>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  mode: 'payments' | 'steps' | 'logs'
  rows: any[]
  loading?: boolean
}>(), { loading: false })
const emit = defineEmits<{ (event: 'update:modelValue', value: boolean): void }>()
const visible = computed({ get: () => props.modelValue, set: (value) => emit('update:modelValue', value) })

function money(value: any) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function stepLabel(status: string) {
  return ({ pending: '待处理', current: '处理中', processing: '处理中', completed: '已完成', approved: '已通过', rejected: '已驳回' } as Record<string, string>)[status] || status || '-'
}
function stepType(status: string) {
  return ({ pending: 'warning', current: 'primary', processing: 'primary', completed: 'success', approved: 'success', rejected: 'danger' } as Record<string, any>)[status] || 'info'
}
</script>

<template>
  <el-drawer :model-value="modelValue" class="feige-detail-drawer" size="min(920px, 96vw)" title="订单详情" destroy-on-close @close="emit('update:modelValue', false)">
    <template v-if="order">
      <div class="detail-hero">
        <div><div class="detail-number">{{ order.orderNo }}</div><h2>{{ order.companyName }}</h2><p>{{ order.contacts || '未填联系人' }} · {{ order.contactPhone || '未填电话' }}</p></div>
        <el-tag :type="optionType(orderStatuses, order.status)" size="large">{{ optionLabel(orderStatuses, order.status) }}</el-tag>
      </div>
      <el-tabs v-model="tab">
        <el-tab-pane label="订单信息" name="info">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="下单时间">{{ order.orderDate }}</el-descriptions-item><el-descriptions-item label="业务类型">{{ optionLabel(businessTypes, order.businessType) }}</el-descriptions-item>
            <el-descriptions-item label="业务人员">{{ order.salesmanName }}</el-descriptions-item><el-descriptions-item label="所属团队">{{ order.teamName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="客户来源">{{ order.customerSource || order.opportunitySource || '-' }}</el-descriptions-item><el-descriptions-item label="来源说明">{{ order.sourceDetail || '-' }}</el-descriptions-item>
            <el-descriptions-item label="订单金额">{{ money(order.orderAmount) }}</el-descriptions-item><el-descriptions-item label="合同金额">{{ money(order.contractAmount) }}</el-descriptions-item>
            <el-descriptions-item label="实收金额">{{ money(order.receivedAmount) }}</el-descriptions-item><el-descriptions-item label="待收金额">{{ money(order.outstandingAmount) }}</el-descriptions-item>
            <el-descriptions-item label="联系地址" :span="2">{{ [order.region, order.address].filter(Boolean).join(' ') || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ order.remarks || '-' }}</el-descriptions-item>
          </el-descriptions>
        </el-tab-pane>
        <el-tab-pane label="办理流程" name="flow">
          <el-steps direction="vertical" :active="activeStep" finish-status="success" process-status="process">
            <el-step v-for="item in steps" :key="item.id" :title="item.stepName" :description="`${item.assigneeName || '待分配'}${item.completedTime ? ` · ${formatDateTime(item.completedTime)}` : ''}${item.remark ? ` · ${item.remark}` : ''}`" />
          </el-steps>
        </el-tab-pane>
        <el-tab-pane :label="`费用详情 ${payments.length}`" name="payment">
          <el-table :data="payments" empty-text="暂无收款记录"><el-table-column label="收款时间" min-width="170"><template #default="{ row }">{{ formatDateTime(row.paymentTime) }}</template></el-table-column><el-table-column label="金额" width="130"><template #default="{ row }"><strong class="money strong">{{ money(row.amount) }}</strong></template></el-table-column><el-table-column prop="paymentMethod" label="方式" width="120" /><el-table-column prop="accountNumber" label="账户" min-width="140" /><el-table-column prop="remarks" label="备注" min-width="180" show-overflow-tooltip /></el-table>
        </el-tab-pane>
        <el-tab-pane label="操作记录" name="logs">
          <el-timeline v-if="logs.length"><el-timeline-item v-for="item in logs" :key="item.id" :timestamp="formatDateTime(item.createTime)"><strong>{{ item.operationDesc }}</strong><div class="sub-text">{{ item.operatorName || '系统' }}{{ item.remarks ? ` · ${item.remarks}` : '' }}</div></el-timeline-item></el-timeline><el-empty v-else :image-size="80" description="暂无操作记录" />
        </el-tab-pane>
      </el-tabs>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FeigeOrder, FeigeOrderStep, FeigePayment, OperationLog } from '@/api/feige-order-contract'
import { businessTypes, formatDateTime, money, optionLabel, optionType, orderStatuses } from '../options'
import { feigeOrderData } from '../data-source'

const props = defineProps<{ modelValue: boolean; order?: FeigeOrder | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const tab = ref('info')
const payments = ref<FeigePayment[]>([])
const steps = ref<FeigeOrderStep[]>([])
const logs = ref<OperationLog[]>([])
const activeStep = computed(() => Math.max(0, steps.value.findIndex((item) => item.status === 'processing')))
watch([() => props.modelValue, () => props.order?.id], async ([visible, id]) => {
  if (!visible || !id) return
  tab.value = 'info'
  ;[payments.value, steps.value, logs.value] = await Promise.all([feigeOrderData.payments(id), feigeOrderData.steps(id), feigeOrderData.logs(id)])
})
</script>


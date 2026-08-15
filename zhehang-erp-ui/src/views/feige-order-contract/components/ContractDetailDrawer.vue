<template>
  <el-drawer :model-value="modelValue" class="feige-detail-drawer" size="min(980px, 96vw)" title="合约详情" destroy-on-close @close="emit('update:modelValue', false)">
    <template v-if="contract">
      <div class="detail-hero"><div><div class="detail-number">{{ contract.contractNo }}</div><h2>{{ contract.companyName }}</h2><p>{{ contract.productName || '代理记账服务' }} · {{ contract.signDate || '-' }} 至 {{ contract.expireDate || '-' }}</p></div><el-tag :type="optionType(contractStatuses, contract.contractStatus)" size="large">{{ optionLabel(contractStatuses, contract.contractStatus) }}</el-tag></div>
      <section class="contract-metrics"><div><span>合同金额</span><strong>{{ money(contract.contractAmount) }}</strong></div><div><span>已收金额</span><strong>{{ money(contract.paidAmount || 0) }}</strong></div><div><span>服务月份</span><strong>{{ contract.serviceMonths || 0 }}个月</strong></div><div><span>企业等级</span><strong>{{ contract.enterpriseLevel || '-' }}</strong></div></section>
      <el-tabs v-model="tab">
        <el-tab-pane label="合同信息" name="info"><el-descriptions :column="2" border><el-descriptions-item label="关联订单">{{ contract.orderNo || '-' }}</el-descriptions-item><el-descriptions-item label="签约人">{{ contract.signerName || '-' }}</el-descriptions-item><el-descriptions-item label="客户来源">{{ contract.customerSource || '-' }}</el-descriptions-item><el-descriptions-item label="付款周期">{{ contract.payType || '-' }}</el-descriptions-item><el-descriptions-item label="续费状态">{{ renewalLabel(contract.renewalStatus) }}</el-descriptions-item><el-descriptions-item label="赠送月份">{{ contract.giftMonth || 0 }}个月</el-descriptions-item><el-descriptions-item label="企业性质">{{ contract.enterpriseNature || '-' }}</el-descriptions-item><el-descriptions-item label="业务标签">{{ contract.businessTag || contract.manualBusinessTag || '-' }}</el-descriptions-item><el-descriptions-item label="关联企业">{{ contract.relatedCompanyName || '无' }}</el-descriptions-item><el-descriptions-item label="企微群">{{ contract.weworkGroupBound ? '已关联' : '未关联' }}</el-descriptions-item><el-descriptions-item label="备注" :span="2">{{ contract.remarks || '-' }}</el-descriptions-item></el-descriptions></el-tab-pane>
        <el-tab-pane label="服务人员" name="staff"><div class="staff-role-grid"><div><span>财税主管</span><strong>{{ contract.financeDirectorName || '待分配' }}</strong></div><div><span>财税顾问</span><strong>{{ contract.financeAdvisorName || '待分配' }}</strong></div><div><span>主办会计</span><strong>{{ contract.accountantName || contract.servicePersonName || '待分配' }}</strong></div></div></el-tab-pane>
        <el-tab-pane :label="`续费记录 ${renewals.length}`" name="renewals"><el-table :data="renewals" empty-text="暂无续费记录"><el-table-column label="续费日期" width="165" prop="renewalDate" /><el-table-column label="服务期限" min-width="220"><template #default="{ row }">{{ row.startDate || '-' }} 至 {{ row.expireDate || '-' }}</template></el-table-column><el-table-column label="金额" width="130"><template #default="{ row }">{{ money(row.amount) }}</template></el-table-column><el-table-column prop="giftMonth" label="赠送月" width="90" /><el-table-column prop="operatorName" label="操作人" width="130" /><el-table-column prop="remark" label="备注" min-width="160" /></el-table></el-tab-pane>
        <el-tab-pane label="变更记录" name="changes"><el-timeline v-if="changes.length"><el-timeline-item v-for="item in changes" :key="item.id" :timestamp="formatDateTime(item.createTime)"><strong>{{ item.changeDesc }}</strong><div class="sub-text">{{ item.operatorName || '系统' }}</div></el-timeline-item></el-timeline><el-empty v-else :image-size="80" description="暂无变更记录" /></el-tab-pane>
      </el-tabs>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { FeigeContract, FeigeContractChangeLog, FeigeContractRenewal } from '@/api/feige-order-contract'
import { contractStatuses, formatDateTime, money, optionLabel, optionType } from '../options'
import { feigeOrderData } from '../data-source'
const props = defineProps<{ modelValue: boolean; contract?: FeigeContract | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const tab = ref('info'); const renewals = ref<FeigeContractRenewal[]>([]); const changes = ref<FeigeContractChangeLog[]>([])
watch([() => props.modelValue, () => props.contract?.id], async ([visible, id]) => { if (!visible || !id) return; tab.value = 'info'; [renewals.value, changes.value] = await Promise.all([feigeOrderData.contractRenewals(id), feigeOrderData.contractChanges(id)]) })
function renewalLabel(value?: string) { return ({ normal: '正常服务', currentRenewal: '本期续费', t2OverdueRenewal: '逾期2期', t6ExpectedRenewal: '预计6期内续费', t3OverdueCustomer: '逾期3期客户', lossAudit: '流失审核', lossCustomer: '已流失' } as Record<string,string>)[value || ''] || value || '-' }
</script>

<template>
  <div class="feige-module feige-legacy-page">
    <section class="content-card legacy-order-card">
      <div class="legacy-toolbar">
        <div class="header-actions">
          <el-button type="primary" :icon="Plus" @click="openCreate">新增订单</el-button>
          <el-radio-group v-model="orderView"><el-radio-button value="standard">标准订单</el-radio-button><el-radio-button v-if="canManageSeal" value="seal">刻章订单</el-radio-button></el-radio-group>
          <el-radio-group v-if="orderView === 'standard'" v-model="filters.scope" @change="search"><el-radio-button value="mine">我的订单</el-radio-button><el-radio-button value="all">全部订单</el-radio-button></el-radio-group>
        </div>
        <div v-if="orderView === 'standard'" class="header-actions"><el-button :icon="Search" @click="filterVisible=true">查询</el-button><el-button v-if="activeFilterCount" :icon="Close" @click="reset">清空筛选（{{ activeFilterCount }}）</el-button><el-button :icon="Refresh" @click="loadRows">刷新</el-button></div>
      </div>
      <template v-if="orderView === 'standard'">
      <div v-if="activeFilterCount" class="active-filter-row"><span>当前筛选</span><el-tag v-if="filters.keyword" closable @close="filters.keyword=''">关键词：{{ filters.keyword }}</el-tag><el-tag v-if="filters.status" closable @close="filters.status=''">状态：{{ optionLabel(orderStatuses, filters.status) }}</el-tag><el-tag v-if="filters.businessType" closable @close="filters.businessType=''">业务：{{ optionLabel(businessTypes, filters.businessType) }}</el-tag><el-tag v-if="filters.customerSource" closable @close="filters.customerSource=''">来源：{{ filters.customerSource }}</el-tag><el-button link type="primary" @click="search">应用</el-button></div>

      <div class="table-wrap legacy-wide-table">
        <el-table v-loading="loading" :data="rows" row-key="id" empty-text="暂无订单" highlight-current-row>
          <el-table-column label="订单编号" width="178" fixed="left"><template #default="{ row }"><strong>{{ row.orderNo }}</strong></template></el-table-column>
          <el-table-column label="下单时间" width="155"><template #default="{ row }">{{ formatDateTime(row.createTime || row.orderDate) }}</template></el-table-column>
          <el-table-column label="业务人员" width="130"><template #default="{ row }">{{ row.salesmanName || '-' }}</template></el-table-column>
          <el-table-column label="所属团队" width="145" show-overflow-tooltip><template #default="{ row }">{{ row.teamName || '-' }}</template></el-table-column>
          <el-table-column label="公司名称" min-width="225" show-overflow-tooltip><template #default="{ row }"><el-button link type="primary" class="company-link" @click="openDetail(row)">{{ row.companyName }}</el-button></template></el-table-column>
          <el-table-column label="业务类型" width="135"><template #default="{ row }">{{ optionLabel(businessTypes, row.businessType) }}</template></el-table-column>
          <el-table-column label="客户来源" width="130"><template #default="{ row }">{{ row.customerSource || row.opportunitySource || '-' }}</template></el-table-column>
          <el-table-column label="订单状态" width="115" align="center"><template #default="{ row }"><el-tag :type="optionType(orderStatuses, row.status)" effect="light">{{ optionLabel(orderStatuses, row.status) }}</el-tag></template></el-table-column>
          <el-table-column label="流程进度" width="118" align="center"><template #default="{ row }"><el-button size="small" type="primary" plain @click="openDetail(row)"><el-icon><TrendCharts /></el-icon>{{ row.flowProgress || '查看' }}</el-button></template></el-table-column>
          <el-table-column label="费用详情" width="118" align="center"><template #default="{ row }"><el-button size="small" type="primary" plain @click="openPayments(row)">收款详情</el-button></template></el-table-column>
          <el-table-column label="复购信息" width="105" align="center"><template #default="{ row }"><el-tag :type="row.recurring ? 'success' : 'info'" effect="plain">{{ row.recurring ? `${row.repurchaseCount || 1}单` : '首单' }}</el-tag></template></el-table-column>
          <el-table-column label="备注信息" min-width="190" show-overflow-tooltip><template #default="{ row }">{{ row.remarks || '-' }}</template></el-table-column>
          <el-table-column label="操作" width="112" fixed="right" align="center">
            <template #default="{ row }"><el-dropdown trigger="click" @command="handleCommand($event, row)"><el-button link type="primary">操作<el-icon class="el-icon--right"><ArrowDown /></el-icon></el-button><template #dropdown><el-dropdown-menu><el-dropdown-item command="edit">修改信息</el-dropdown-item><el-dropdown-item command="detail">订单详情</el-dropdown-item><el-dropdown-item command="logs">操作记录</el-dropdown-item><el-dropdown-item v-if="row.recurring" command="recurring">客户全部订单</el-dropdown-item><el-dropdown-item v-if="['pending','rejected'].includes(row.status)" command="confirm" divided>确认订单</el-dropdown-item><el-dropdown-item v-if="['pending','in_progress'].includes(row.status)" command="reject">驳回订单</el-dropdown-item><el-dropdown-item v-if="Number(row.receivedAmount) > 0 && !['refunded','cancelled'].includes(row.status)" command="refund">退单申请</el-dropdown-item><el-dropdown-item v-if="row.status === 'in_progress'" command="complete">完成订单</el-dropdown-item></el-dropdown-menu></template></el-dropdown></template>
          </el-table-column>
        </el-table>
      </div>
      <div class="pagination-row"><el-pagination v-model:current-page="page.pageNum" v-model:page-size="page.pageSize" :total="page.total" :page-sizes="[10,20,50,100]" layout="total, prev, pager, next, sizes, jumper" @change="loadRows" /></div>
      </template>
      <SealRegistration v-else-if="canManageSeal" :key="sealListVersion" embedded />
    </section>

    <el-drawer v-model="filterVisible" class="feige-filter-drawer" size="min(440px, 94vw)" title="订单查询" destroy-on-close>
      <el-form label-position="top"><el-form-item label="订单编号 / 公司名称"><el-input v-model="filters.keyword" clearable placeholder="订单号、公司、联系人或电话" /></el-form-item><el-form-item label="业务人员"><el-select v-model="filters.salesmanId" clearable filterable style="width:100%"><el-option v-for="item in staff" :key="item.id" :label="`${item.name} · ${item.deptName || '-'}`" :value="item.id" /></el-select></el-form-item><el-form-item label="订单状态"><el-select v-model="filters.status" clearable style="width:100%"><el-option v-for="item in orderStatuses" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item><el-form-item label="业务类型"><el-select v-model="filters.businessType" clearable style="width:100%"><el-option v-for="item in businessTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item><el-form-item label="客户来源"><el-select v-model="filters.customerSource" clearable filterable allow-create style="width:100%"><el-option v-for="item in sourceOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="下单时间"><el-date-picker v-model="filters.dates" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" style="width:100%" /></el-form-item></el-form>
      <template #footer><div class="drawer-footer"><el-button @click="reset">重置</el-button><el-button type="primary" @click="applyFilter">查询订单</el-button></div></template>
    </el-drawer>

    <OrderFormDialog v-model="formVisible" :order="editingOrder" :staff="staff" :allow-seal="canManageSeal" @saved="loadRows" @seal-requested="openSealCreate" />
    <SealRegistration v-if="sealCreateVisible" create-only :initial-data="sealPrefill" @closed="closeSealCreate" @saved="handleSealSaved" />
    <OrderDetailDrawer v-model="detailVisible" :order="current" />

    <el-drawer v-model="paymentsVisible" class="feige-detail-drawer" size="min(720px, 94vw)" title="费用详情" destroy-on-close>
      <template v-if="current"><el-descriptions :column="3" border><el-descriptions-item label="合同金额">{{ money(current.contractAmount) }}</el-descriptions-item><el-descriptions-item label="已收金额">{{ money(current.receivedAmount) }}</el-descriptions-item><el-descriptions-item label="待收金额">{{ money(current.outstandingAmount) }}</el-descriptions-item></el-descriptions><div class="drawer-section"><h3>收款记录</h3><el-table :data="payments" empty-text="暂无收款记录"><el-table-column label="收款时间" min-width="170"><template #default="{ row }">{{ formatDateTime(row.paymentTime) }}</template></el-table-column><el-table-column label="金额" width="130"><template #default="{ row }">{{ money(row.amount) }}</template></el-table-column><el-table-column prop="paymentMethod" label="方式" width="110" /><el-table-column prop="accountNumber" label="账户" min-width="140" /><el-table-column prop="remarks" label="备注" min-width="160" /></el-table></div></template>
    </el-drawer>

    <el-drawer v-model="recurringVisible" class="feige-detail-drawer" size="min(860px, 95vw)" title="客户全部订单" destroy-on-close><el-alert v-if="current" :title="current.companyName" description="同一客户历史订单，便于查看复购和服务连续性。" type="info" :closable="false" show-icon /><el-table :data="recurringOrders" style="margin-top:16px"><el-table-column prop="orderNo" label="订单编号" width="190" /><el-table-column prop="orderDate" label="下单日期" width="125" /><el-table-column label="业务类型" width="140"><template #default="{ row }">{{ optionLabel(businessTypes, row.businessType) }}</template></el-table-column><el-table-column label="合同金额" width="130"><template #default="{ row }">{{ money(row.contractAmount) }}</template></el-table-column><el-table-column label="状态" width="110"><template #default="{ row }">{{ optionLabel(orderStatuses, row.status) }}</template></el-table-column><el-table-column prop="remarks" label="备注" min-width="180" /></el-table></el-drawer>

    <el-dialog v-model="paymentVisible" width="520px" title="登记收款" destroy-on-close><el-form :model="paymentForm" label-width="92px"><el-form-item label="客户">{{ actionOrder?.companyName }}</el-form-item><el-form-item label="待收金额">{{ money(actionOrder?.outstandingAmount || 0) }}</el-form-item><el-form-item label="本次收款" required><el-input-number v-model="paymentForm.amount" :min="0.01" :max="Number(actionOrder?.outstandingAmount || 0)" :precision="2" controls-position="right" style="width:100%" /></el-form-item><el-form-item label="收款时间"><el-date-picker v-model="paymentForm.paymentTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width:100%" /></el-form-item><el-form-item label="收款方式"><el-select v-model="paymentForm.paymentMethod" style="width:100%"><el-option label="微信" value="微信" /><el-option label="支付宝" value="支付宝" /><el-option label="银行转账" value="银行转账" /><el-option label="现金" value="现金" /></el-select></el-form-item><el-form-item label="收款账户"><el-input v-model="paymentForm.accountNumber" /></el-form-item><el-form-item label="备注"><el-input v-model="paymentForm.remarks" type="textarea" :rows="3" /></el-form-item></el-form><template #footer><el-button @click="paymentVisible=false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitPayment">确认收款</el-button></template></el-dialog>

    <el-dialog v-model="refundVisible" width="540px" title="退单申请" destroy-on-close><el-alert title="提交后进入退费订单，由主管审核、财务完成。" type="warning" :closable="false" show-icon /><el-form label-width="92px" style="margin-top:18px"><el-form-item label="客户">{{ actionOrder?.companyName }}</el-form-item><el-form-item label="退费金额" required><el-input-number v-model="refundForm.refundAmount" :min="0.01" :max="Number(actionOrder?.receivedAmount || 0)" :precision="2" style="width:100%" /></el-form-item><el-form-item label="退费原因" required><el-input v-model="refundForm.reason" type="textarea" :rows="4" maxlength="500" show-word-limit /></el-form-item></el-form><template #footer><el-button @click="refundVisible=false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitRefund">提交申请</el-button></template></el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowDown, Close, Plus, Refresh, Search, TrendCharts } from '@element-plus/icons-vue'
import type { FeigeOrder, FeigePayment, StaffOption } from '@/api/feige-order-contract'
import type { SealOrder } from '@/api/seal'
import { businessTypes, formatDateTime, money, optionLabel, optionType, orderStatuses } from './options'
import { feigeOrderData } from '@feige-order-data-source'
import { usePermissionStore } from '@/stores/permission'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'
import OrderFormDialog from './components/OrderFormDialog.vue'
import OrderDetailDrawer from './components/OrderDetailDrawer.vue'
import SealRegistration from '@/views/seal/registration.vue'

interface SealOrderPrefill {
  regDate?: string
  companyName?: string
  phone?: string
  address?: string
  ownerName?: string
  perfDept?: string
}

const sourceOptions = ['新媒体', '客户转介绍', '线下活动', '渠道合作', '老客户复购', '自然到访', '合作伙伴', '其他']
const permissionStore = usePermissionStore()
const loading = ref(false); const submitting = ref(false); const rows = ref<FeigeOrder[]>([]); const staff = ref<StaffOption[]>([])
const orderView = ref<'standard' | 'seal'>('standard')
const sealListVersion = ref(0)
const filters = reactive({ scope: 'mine', keyword: '', salesmanId: undefined as number | undefined, status: '', businessType: '', customerSource: '', dates: [] as string[] })
const page = reactive({ pageNum: 1, pageSize: 10, total: 0 })
const filterVisible = ref(false); const formVisible = ref(false); const sealCreateVisible = ref(false); const detailVisible = ref(false); const paymentsVisible = ref(false); const recurringVisible = ref(false); const paymentVisible = ref(false); const refundVisible = ref(false)
const sealPrefill = ref<Partial<SealOrder>>({})
const current = ref<FeigeOrder | null>(null); const editingOrder = ref<FeigeOrder | null>(null); const actionOrder = ref<FeigeOrder | null>(null); const payments = ref<FeigePayment[]>([]); const recurringOrders = ref<FeigeOrder[]>([])
const paymentForm = reactive({ amount: 0, paymentTime: '', paymentMethod: '银行转账', accountNumber: '', remarks: '' }); const refundForm = reactive({ refundAmount: 0, reason: '' })
const activeFilterCount = computed(() => [filters.keyword, filters.salesmanId, filters.status, filters.businessType, filters.customerSource, filters.dates.length].filter(Boolean).length)
const canManageSeal = computed(() => !hasImpersonationSessionMarker() && permissionStore.routes.some((route) =>
  route.path === '/order' && (route.children || []).some((child) => child.path === 'seal-order')
))

async function loadRows() { loading.value = true; try { const data = await feigeOrderData.orders({ pageNum: page.pageNum, pageSize: page.pageSize, scope: filters.scope, keyword: filters.keyword || undefined, salesmanId: filters.salesmanId, status: filters.status || undefined, businessType: filters.businessType || undefined, customerSource: filters.customerSource || undefined, startDate: filters.dates[0], endDate: filters.dates[1] }); rows.value = data.records || []; page.total = Number(data.total || 0) } finally { loading.value = false } }
function search() { page.pageNum = 1; loadRows() }
function reset() { Object.assign(filters, { keyword: '', salesmanId: undefined, status: '', businessType: '', customerSource: '', dates: [] }); filterVisible.value = false; search() }
function applyFilter() { filterVisible.value = false; search() }
function openCreate() { editingOrder.value = null; formVisible.value = true }
function openSealCreate(prefill: SealOrderPrefill) { sealPrefill.value = { ...prefill }; sealCreateVisible.value = true }
function closeSealCreate() { sealCreateVisible.value = false; sealPrefill.value = {} }
function handleSealSaved() { sealListVersion.value += 1; orderView.value = 'seal' }
function edit(row: FeigeOrder) { editingOrder.value = row; formVisible.value = true }
async function openDetail(row: FeigeOrder) { current.value = await feigeOrderData.order(row.id); detailVisible.value = true }
async function openPayments(row: FeigeOrder) { current.value = row; payments.value = await feigeOrderData.payments(row.id); paymentsVisible.value = true }
async function openRecurring(row: FeigeOrder) { current.value = row; const data = await feigeOrderData.orders({ pageNum: 1, pageSize: 100, keyword: row.companyName }); recurringOrders.value = data.records.length > 1 ? data.records : [row, { ...row, id: row.id + 10000, orderNo: `${row.orderNo}-HISTORY`, orderDate: '2025-08-01', status: 'completed', remarks: 'LOCAL-DEMO历史复购订单' }]; recurringVisible.value = true }
function openPayment(row: FeigeOrder) { actionOrder.value = row; Object.assign(paymentForm, { amount: Number(row.outstandingAmount || 0), paymentTime: '', paymentMethod: '银行转账', accountNumber: '', remarks: '' }); paymentVisible.value = true }
function openRefund(row: FeigeOrder) { actionOrder.value = row; Object.assign(refundForm, { refundAmount: Number(row.receivedAmount || 0), reason: '' }); refundVisible.value = true }
async function submitPayment() { if (!actionOrder.value || paymentForm.amount <= 0) return ElMessage.warning('请填写正确的收款金额'); submitting.value = true; try { await feigeOrderData.addPayment(actionOrder.value.id, paymentForm); ElMessage.success('收款已登记'); paymentVisible.value = false; await loadRows() } finally { submitting.value = false } }
async function submitRefund() { if (!actionOrder.value || refundForm.refundAmount <= 0 || !refundForm.reason.trim()) return ElMessage.warning('请填写退费金额和原因'); submitting.value = true; try { await feigeOrderData.applyRefund(actionOrder.value.id, refundForm); ElMessage.success('退单申请已提交'); refundVisible.value = false; await loadRows() } finally { submitting.value = false } }
async function confirm(row: FeigeOrder) { await ElMessageBox.confirm(`确认“${row.companyName}”的订单并进入办理？`, '确认订单', { type: 'warning' }); await feigeOrderData.confirmOrder(row.id); ElMessage.success('订单已确认'); await loadRows() }
async function reject(row: FeigeOrder) { const result = await ElMessageBox.prompt(`请填写驳回“${row.companyName}”订单的原因`, '驳回订单', { inputValidator: (value) => !!String(value || '').trim() || '请填写原因', type: 'warning' }); await feigeOrderData.rejectOrder(row.id, result.value); ElMessage.success('订单已驳回'); await loadRows() }
async function complete(row: FeigeOrder) { await ElMessageBox.confirm(`确认“${row.companyName}”已办理完成？`, '完成订单', { type: 'warning' }); await feigeOrderData.completeOrder(row.id); ElMessage.success('订单已完成'); await loadRows() }
async function handleCommand(command: string, row: FeigeOrder) { if (command === 'edit') edit(row); else if (command === 'detail' || command === 'logs') await openDetail(row); else if (command === 'recurring') await openRecurring(row); else if (command === 'payment') openPayment(row); else if (command === 'refund') openRefund(row); else if (command === 'confirm') await confirm(row); else if (command === 'reject') await reject(row); else if (command === 'complete') await complete(row) }
onMounted(async () => { staff.value = await feigeOrderData.staffOptions(); await loadRows() })
</script>

<style lang="scss" src="./module.scss"></style>

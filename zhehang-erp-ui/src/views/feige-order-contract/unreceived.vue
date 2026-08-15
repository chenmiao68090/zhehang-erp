<template>
  <div class="feige-module feige-legacy-page">
    <section class="stats-grid">
      <div class="stat-card"><div class="stat-label">未收款订单</div><div class="stat-value warning">{{ page.total }}</div></div>
      <div class="stat-card"><div class="stat-label">本页合同金额</div><div class="stat-value">{{ money(pageContract) }}</div></div>
      <div class="stat-card"><div class="stat-label">本页已收</div><div class="stat-value success">{{ money(pageReceived) }}</div></div>
      <div class="stat-card"><div class="stat-label">本页待收</div><div class="stat-value danger">{{ money(pageOutstanding) }}</div></div>
    </section>

    <section class="content-card">
      <div class="filter-bar">
        <el-input v-model="keyword" class="filter-keyword" clearable placeholder="搜索订单号、公司或联系人" :prefix-icon="Search" @keyup.enter="search" />
        <el-select v-model="salesmanId" class="filter-select" clearable placeholder="业务人员"><el-option v-for="item in staff" :key="item.id" :label="item.name" :value="item.id" /></el-select>
        <div class="filter-actions"><el-button type="primary" :icon="Search" @click="search">查询</el-button><el-button @click="reset">重置</el-button><el-button :icon="Refresh" @click="loadRows">刷新</el-button></div>
      </div>
      <div class="table-wrap">
        <el-table v-loading="loading" :data="rows" row-key="id" empty-text="当前没有未收款订单">
          <el-table-column label="订单编号" width="190"><template #default="{ row }"><strong>{{ row.orderNo }}</strong></template></el-table-column>
          <el-table-column label="客户" min-width="250" show-overflow-tooltip><template #default="{ row }"><div class="customer-name">{{ row.companyName }}</div><div class="sub-text">{{ row.contacts || '未填联系人' }}</div></template></el-table-column>
          <el-table-column label="业务人员" width="120" prop="salesmanName" />
          <el-table-column label="业务类型" width="135"><template #default="{ row }">{{ optionLabel(businessTypes, row.businessType) }}</template></el-table-column>
          <el-table-column label="合同金额" width="135" align="right"><template #default="{ row }"><span class="money">{{ money(row.contractAmount) }}</span></template></el-table-column>
          <el-table-column label="已收金额" width="135" align="right"><template #default="{ row }"><span class="money strong">{{ money(row.receivedAmount) }}</span></template></el-table-column>
          <el-table-column label="待收金额" width="140" align="right"><template #default="{ row }"><span class="money debt">{{ money(row.outstandingAmount) }}</span></template></el-table-column>
          <el-table-column label="最近收款" width="175"><template #default="{ row }">{{ formatDateTime(row.collectionTime) }}</template></el-table-column>
          <el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openPayment(row)">登记收款</el-button><el-button link @click="showHistory(row)">明细</el-button></template></el-table-column>
        </el-table>
      </div>
      <div class="pagination-row"><el-pagination v-model:current-page="page.pageNum" v-model:page-size="page.pageSize" :total="page.total" :page-sizes="[20,50,100]" layout="total, sizes, prev, pager, next" @change="loadRows" /></div>
    </section>

    <el-dialog v-model="paymentVisible" width="520px" title="登记收款" destroy-on-close>
      <el-descriptions v-if="current" :column="1" border style="margin-bottom:18px"><el-descriptions-item label="客户">{{ current.companyName }}</el-descriptions-item><el-descriptions-item label="当前待收">{{ money(current.outstandingAmount) }}</el-descriptions-item></el-descriptions>
      <el-form :model="paymentForm" label-width="92px">
        <el-form-item label="本次收款" required><el-input-number v-model="paymentForm.amount" :min="0.01" :max="Number(current?.outstandingAmount || 0)" :precision="2" controls-position="right" style="width:100%" /></el-form-item>
        <el-form-item label="收款时间"><el-date-picker v-model="paymentForm.paymentTime" type="datetime" value-format="YYYY-MM-DDTHH:mm:ss" style="width:100%" /></el-form-item>
        <el-form-item label="收款方式"><el-select v-model="paymentForm.paymentMethod" style="width:100%"><el-option label="微信" value="wechat" /><el-option label="支付宝" value="alipay" /><el-option label="银行转账" value="bank" /><el-option label="现金" value="cash" /><el-option label="其他" value="other" /></el-select></el-form-item>
        <el-form-item label="收款账户"><el-input v-model="paymentForm.accountNumber" placeholder="填写账户简称或尾号" /></el-form-item>
        <el-form-item label="收款凭证"><el-input v-model="paymentForm.voucher" placeholder="选择已有附件或填写演示说明" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="paymentForm.remarks" type="textarea" :rows="3" maxlength="500" show-word-limit /></el-form-item>
      </el-form>
      <template #footer><el-button @click="paymentVisible=false">取消</el-button><el-button type="primary" :loading="submitting" @click="submitPayment">确认收款</el-button></template>
    </el-dialog>

    <el-drawer v-model="historyVisible" class="feige-detail-drawer" size="min(680px, 94vw)" title="收款明细" destroy-on-close>
      <el-table :data="payments" empty-text="暂无收款记录">
        <el-table-column label="时间" min-width="170"><template #default="{ row }">{{ formatDateTime(row.paymentTime) }}</template></el-table-column>
        <el-table-column label="金额" width="125"><template #default="{ row }"><span class="money strong">{{ money(row.amount) }}</span></template></el-table-column>
        <el-table-column prop="paymentMethod" label="方式" width="100" />
        <el-table-column prop="remarks" label="备注" min-width="160" show-overflow-tooltip />
      </el-table>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import type { FeigeOrder, FeigePayment, StaffOption } from '@/api/feige-order-contract'
import { businessTypes, formatDateTime, money, optionLabel } from './options'
import { feigeOrderData } from '@feige-order-data-source'

const loading = ref(false)
const submitting = ref(false)
const keyword = ref('')
const salesmanId = ref<number>()
const staff = ref<StaffOption[]>([])
const rows = ref<FeigeOrder[]>([])
const page = reactive({ pageNum: 1, pageSize: 20, total: 0 })
const current = ref<FeigeOrder | null>(null)
const paymentVisible = ref(false)
const historyVisible = ref(false)
const payments = ref<FeigePayment[]>([])
const paymentForm = reactive({ amount: 0, paymentTime: '', paymentMethod: 'bank', accountNumber: '', voucher: '', remarks: '' })
const pageContract = computed(() => rows.value.reduce((sum, row) => sum + Number(row.contractAmount || 0), 0))
const pageReceived = computed(() => rows.value.reduce((sum, row) => sum + Number(row.receivedAmount || 0), 0))
const pageOutstanding = computed(() => rows.value.reduce((sum, row) => sum + Number(row.outstandingAmount || 0), 0))

async function loadRows() {
  loading.value = true
  try {
    const data = await feigeOrderData.unreceived({ pageNum: page.pageNum, pageSize: page.pageSize, keyword: keyword.value || undefined, salesmanId: salesmanId.value })
    rows.value = data.records || []
    page.total = Number(data.total || 0)
  } finally { loading.value = false }
}
function search() { page.pageNum = 1; loadRows() }
function reset() { keyword.value = ''; salesmanId.value = undefined; search() }
function openPayment(row: FeigeOrder) { current.value = row; Object.assign(paymentForm, { amount: Number(row.outstandingAmount || 0), paymentTime: '', paymentMethod: 'bank', accountNumber: '', voucher: '', remarks: '' }); paymentVisible.value = true }
async function submitPayment() {
  if (!current.value || paymentForm.amount <= 0) return ElMessage.warning('请填写正确的收款金额')
  submitting.value = true
  try { await feigeOrderData.addPayment(current.value.id, paymentForm); ElMessage.success('收款已登记，待收金额已更新'); paymentVisible.value = false; await loadRows() } finally { submitting.value = false }
}
async function showHistory(row: FeigeOrder) { current.value = row; payments.value = await feigeOrderData.payments(row.id); historyVisible.value = true }
onMounted(async () => { staff.value = await feigeOrderData.staffOptions(); await loadRows() })
</script>

<style lang="scss" src="./module.scss"></style>

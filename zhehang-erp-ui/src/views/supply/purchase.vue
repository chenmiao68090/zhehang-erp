<template>
  <div class="purchase-page">
    <!-- 顶部统计 -->
    <div class="stat-grid">
      <div class="stat-card stat-pending">
        <div class="stat-label">待审批</div>
        <div class="stat-value">{{ stats.pending }}</div>
        <div class="stat-foot">待主管审核</div>
      </div>
      <div class="stat-card stat-approved">
        <div class="stat-label">已审批待付款</div>
        <div class="stat-value">{{ stats.approved }}</div>
        <div class="stat-foot">待财务付款</div>
      </div>
      <div class="stat-card stat-stocked">
        <div class="stat-label">已上架</div>
        <div class="stat-value">{{ stats.stocked }}</div>
        <div class="stat-foot">资源已就绪</div>
      </div>
      <div class="stat-card stat-amount">
        <div class="stat-label">本月资源成本</div>
        <div class="stat-value">¥{{ formatNum(stats.monthlyAmount) }}</div>
        <div class="stat-foot">已审批以上单据</div>
      </div>
    </div>

    <!-- Tab + 操作 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <el-tabs v-model="activeTab" class="status-tabs">
            <el-tab-pane label="全部" name="" />
            <el-tab-pane label="草稿" name="draft" />
            <el-tab-pane label="主管待审" name="pending_approval" />
            <el-tab-pane label="老板待审" name="pending_boss" />
            <el-tab-pane label="已审批" name="approved" />
            <el-tab-pane label="已付款" name="paid" />
            <el-tab-pane label="已上架" name="stocked" />
            <el-tab-pane label="已驳回" name="rejected" />
          </el-tabs>
          <el-button v-hasRole="['admin','boss','manager']" type="primary" @click="openCreate">+ 创建补充单</el-button>
        </div>
      </template>

      <el-table :data="filteredList" v-loading="loading" stripe height="540">
        <el-table-column prop="procurementNo" label="补充单号" width="160" />
        <el-table-column label="地址供应商" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cell-name">
              <span class="name-main">{{ row.supplierName }}</span>
              <span class="name-sub">{{ row.procurementContent }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="资源数量" width="100" align="center">
          <template #default="{ row }"><span class="num">{{ row.quantity }}</span></template>
        </el-table-column>
        <el-table-column label="资源成本" width="150" align="right">
          <template #default="{ row }">
            <span v-hasRole="['admin','boss','finance']" class="num amount">¥{{ formatNum(row.totalAmount) }}</span>
            <span v-if="row.totalAmount > 3000" class="big-tag" title="金额超 3000，需老板二级审批">L2</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small" effect="dark">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="100" />
        <el-table-column label="日期" width="120">
          <template #default="{ row }"><span class="num small">{{ (row.applyTime || '').slice(0, 10) }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button v-if="row.status === 'pending_approval'" v-hasRole="['admin','boss','manager']" link type="success" size="small" @click="approveDoc(row, true, 'manager')">主管通过</el-button>
            <el-button v-if="row.status === 'pending_approval'" v-hasRole="['admin','boss','manager']" link type="danger" size="small" @click="approveDoc(row, false, 'manager')">驳回</el-button>
            <el-button v-if="row.status === 'pending_boss'" v-hasRole="['admin','boss','manager']" link type="success" size="small" @click="approveDoc(row, true, 'boss')">老板通过</el-button>
            <el-button v-if="row.status === 'pending_boss'" v-hasRole="['admin','boss','manager']" link type="danger" size="small" @click="approveDoc(row, false, 'boss')">驳回</el-button>
            <el-button v-if="row.status === 'approved'" link type="warning" size="small" @click="payDoc(row)">付款</el-button>
            <el-button v-if="row.status === 'paid'" link type="primary" size="small" @click="stockDoc(row)">上架</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 创建资源补充单 -->
    <el-dialog v-model="formVisible" title="创建资源补充单" width="780px">
      <el-form :model="form" label-width="120px" label-position="left">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="选择地址供应商">
              <el-select v-model="form.supplierId" placeholder="请选择" style="width:100%" @change="onSupplierChange">
                <el-option v-for="s in suppliers" :key="s.id" :label="s.supplierName" :value="s.id">
                  <div style="display:flex; justify-content:space-between;">
                    <span>{{ s.supplierName }}</span>
                    <span style="color:#94a3b8;font-size:12px">{{ s.cooperateLevel }}级</span>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="资源类型">
            <el-select v-model="form.procurementType" style="width:100%">
              <el-option label="挂靠地址" value="address" />
              <el-option label="服务" value="service" />
              <el-option label="工具" value="tool" />
              <el-option label="数据" value="data" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="6"><el-form-item label="资源数量"><el-input-number v-model="form.quantity" :min="1" controls-position="right" style="width:100%" @change="recalc" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="资源单价"><el-input-number v-model="form.unitPrice" :min="0" controls-position="right" style="width:100%" @change="recalc" /></el-form-item></el-col>
          <el-col :span="6">
            <el-form-item label="付款周期">
              <el-select v-model="form.payCycle" style="width:100%">
                <el-option label="年付" value="yearly" />
                <el-option label="半年付" value="half" />
                <el-option label="季付" value="quarter" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"><el-form-item label="返点比例"><el-input-number v-model="form.rebateRate" :min="0" :max="100" controls-position="right" style="width:100%" @change="recalc" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="资源总成本">
              <div class="calc-cell"><span class="num amount big">¥{{ formatNum(form.totalAmount) }}</span></div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="实际付款">
              <div class="calc-cell discount"><span class="num discount-amount big">¥{{ formatNum(form.payAmount) }}</span><span class="rebate-tip" v-if="form.rebateRate">已扣返点 {{ form.rebateRate }}%</span></div>
            </el-form-item>
          </el-col>
          <el-col :span="24"><el-form-item label="地址资源明细"><el-input v-model="form.addressLines" type="textarea" :rows="4" placeholder="一行一个详细地址" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="补充说明"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">提交审批</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Drawer -->
    <el-drawer v-model="detailVisible" :title="'资源补充单 · ' + (detail?.procurementNo || '')" size="640px">
      <div v-if="detail" class="detail-body">
        <!-- 状态步骤条 -->
        <el-steps :active="stepIndex(detail.status)" finish-status="success" align-center class="status-steps">
          <el-step title="草稿" />
          <el-step title="主管审批" />
          <el-step :title="detail.totalAmount > 3000 ? '老板审批' : '审批通过'" />
          <el-step title="付款" />
          <el-step title="上架" />
        </el-steps>

        <el-descriptions :column="2" border size="small" style="margin-top:16px">
          <el-descriptions-item label="地址供应商">{{ detail.supplierName }}</el-descriptions-item>
          <el-descriptions-item label="状态"><el-tag size="small" :type="statusType(detail.status)">{{ statusLabel(detail.status) }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="数量">{{ detail.quantity }}</el-descriptions-item>
          <el-descriptions-item label="单价">¥{{ formatNum(detail.unitPrice) }}</el-descriptions-item>
          <el-descriptions-item label="总额" :span="2">
            <span class="num amount big">¥{{ formatNum(detail.totalAmount) }}</span>
            <span v-if="detail.totalAmount > 3000" class="big-tag inline">需老板二级审批</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请人">{{ detail.applicantName }}</el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ detail.applyTime }}</el-descriptions-item>
          <el-descriptions-item :span="2" label="备注">{{ detail.remark || '—' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">审批记录</h4>
        <el-timeline class="approval-timeline">
          <el-timeline-item :timestamp="detail.applyTime" type="primary">
            <strong>{{ detail.applicantName }}</strong> 提交申请
          </el-timeline-item>
          <el-timeline-item v-for="(a, i) in (detail.approvals || [])" :key="i" :timestamp="a.approvalTime" :type="a.pass ? 'success' : 'danger'">
            <strong>{{ a.approverName }}</strong>
            <span class="level-chip" :data-lv="a.level">{{ a.level === 'boss' ? '老板' : '主管' }}</span>
            {{ a.pass ? '审批通过' : '驳回' }}
            <div class="opinion">{{ a.opinion }}</div>
          </el-timeline-item>
          <el-timeline-item v-if="detail.paymentTime" :timestamp="detail.paymentTime" type="warning">
            <strong>财务</strong> 已付款
          </el-timeline-item>
          <el-timeline-item v-if="detail.stockInTime" :timestamp="detail.stockInTime" type="success">
            <strong>系统</strong> 已上架 ({{ stockedAddrs.length }} 个地址资源已加入资源池)
          </el-timeline-item>
        </el-timeline>

        <template v-if="detail.addressLines">
          <h4 class="section-title">地址资源明细</h4>
          <div class="addr-list">
            <div v-for="(line, i) in (detail.addressLines || '').split('\n').filter(Boolean)" :key="i" class="addr-line">
              <span class="addr-no">#{{ String(i + 1).padStart(2, '0') }}</span>
              <span>{{ line }}</span>
            </div>
          </div>
        </template>

        <template v-if="detail.status === 'stocked' && stockedAddrs.length">
          <h4 class="section-title">已生成地址资源 ({{ stockedAddrs.length }})</h4>
          <el-table :data="stockedAddrs" size="small" stripe>
            <el-table-column prop="resourceNo" label="编号" width="110" />
            <el-table-column prop="district" label="区域" width="90" />
            <el-table-column prop="detailAddress" label="地址" show-overflow-tooltip />
            <el-table-column label="年付价" width="100" align="right">
              <template #default="{ row }"><span class="num">¥{{ formatNum(row.yearlyCost) }}</span></template>
            </el-table-column>
          </el-table>
        </template>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { procurementApi, supplierApi, type BizProcurement, type BizSupplier, type BizAddressResource } from '@/api/channel'

const loading = ref(false)
const list = ref<BizProcurement[]>([])
const suppliers = ref<BizSupplier[]>([])
const activeTab = ref('')

async function loadData () {
  loading.value = true
  try {
    const [pRes, sRes] = await Promise.all([
      procurementApi.list({ pageSize: 200 }),
      supplierApi.list({ pageSize: 200 })
    ])
    list.value = (pRes as any).list as BizProcurement[]
    suppliers.value = (sRes as any).list as BizSupplier[]
  } finally { loading.value = false }
}

const filteredList = computed(() => activeTab.value ? list.value.filter(p => p.status === activeTab.value) : list.value)

const stats = computed(() => {
  const pending = list.value.filter(p => p.status === 'pending_approval' || p.status === 'pending_boss').length
  const approved = list.value.filter(p => p.status === 'approved').length
  const stocked = list.value.filter(p => p.status === 'stocked').length
  const ymPrefix = new Date().toISOString().slice(0, 7)
  const monthlyAmount = list.value.filter(p => (p.applyTime || '').startsWith(ymPrefix) && ['approved', 'paid', 'stocked'].includes(p.status)).reduce((s, p) => s + p.totalAmount, 0)
  return { pending, approved, stocked, monthlyAmount }
})

function statusType (s: string): any { return ({ draft: 'info', pending_approval: 'warning', pending_boss: 'warning', approved: 'primary', paid: 'success', stocked: 'success', rejected: 'danger' } as any)[s] || 'info' }
function statusLabel (s: string) { return ({ draft: '草稿', pending_approval: '主管待审', pending_boss: '老板待审', approved: '已审批', paid: '已付款', stocked: '已上架', rejected: '已驳回' } as any)[s] || s }
function stepIndex (s: string) { return ({ draft: 0, pending_approval: 1, pending_boss: 2, approved: 3, paid: 4, stocked: 5, rejected: 0 } as any)[s] || 0 }
function formatNum (n: number) { return (n || 0).toLocaleString('zh-CN') }

// form
const formVisible = ref(false)
const form = reactive<any>({
  supplierId: undefined, supplierName: '', procurementType: 'address',
  quantity: 1, unitPrice: 2000, payCycle: 'yearly', rebateRate: 0,
  totalAmount: 2000, payAmount: 2000,
  addressLines: '', remark: ''
})
function resetForm () {
  Object.assign(form, { supplierId: undefined, supplierName: '', procurementType: 'address', quantity: 1, unitPrice: 2000, payCycle: 'yearly', rebateRate: 0, totalAmount: 2000, payAmount: 2000, addressLines: '', remark: '' })
}
function onSupplierChange (id: number) {
  const s = suppliers.value.find(x => x.id === id); if (!s) return
  form.supplierName = s.supplierName
  // 自动带出价格与返点
  if (s.yearlyPrice) form.unitPrice = s.yearlyPrice
  if (s.hasRebate && typeof s.rebateRate === 'number') form.rebateRate = s.rebateRate
  recalc()
}
function recalc () {
  form.totalAmount = (form.quantity || 0) * (form.unitPrice || 0)
  form.payAmount = Math.round(form.totalAmount * (1 - (form.rebateRate || 0) / 100))
}
function openCreate () { resetForm(); formVisible.value = true }
async function submitForm () {
  if (!form.supplierId) { ElMessage.warning('请选择地址供应商'); return }
  const lines = (form.addressLines || '').split('\n').map((s: string) => s.trim()).filter(Boolean)
  if (form.procurementType === 'address' && lines.length && lines.length !== form.quantity) {
    try {
      await ElMessageBox.confirm(`地址资源明细 ${lines.length} 条与资源数量 ${form.quantity} 不一致，是否以地址资源明细为准？`, '提示', { type: 'warning' })
      form.quantity = lines.length
      recalc()
    } catch { return }
  }
  await procurementApi.create({
    supplierId: form.supplierId, supplierName: form.supplierName,
    procurementType: form.procurementType,
    procurementContent: `${form.payCycle === 'yearly' ? '年付' : form.payCycle === 'half' ? '半年付' : '季付'} · 数量 ${form.quantity}`,
    quantity: form.quantity, unitPrice: form.unitPrice, totalAmount: form.totalAmount,
    payCycle: form.payCycle, rebateRate: form.rebateRate, payAmount: form.payAmount,
    addressLines: form.addressLines,
    remark: form.remark
  } as any)
  const tip = form.totalAmount > 3000
    ? `资源补充单已提交 · 金额 ${formatNum(form.totalAmount)} > 3000，需主管+老板二级审批`
    : '资源补充单已提交 · 仅需主管审批'
  ElMessage.success(tip)
  formVisible.value = false
  loadData()
}

async function approveDoc (row: BizProcurement, pass: boolean, level: 'manager' | 'boss') {
  const title = level === 'boss' ? '老板审批确认' : '主管审批确认'
  const tip = pass
    ? (level === 'manager' && row.totalAmount > 3000
      ? `金额 ${formatNum(row.totalAmount)} > 3000，主管通过后将转老板审批`
      : '确认审批通过?')
    : '确认驳回该资源补充单?'
  await ElMessageBox.confirm(tip, title, { type: pass ? 'success' : 'warning' })
  await procurementApi.approve({ id: row.id, pass, level })
  ElMessage.success(pass ? (level === 'boss' || row.totalAmount <= 3000 ? '审批通过' : '主管已通过，转老板审批') : '已驳回')
  loadData()
}
async function payDoc (row: BizProcurement) {
  await ElMessageBox.confirm(`确认已完成付款 ¥${formatNum(row.totalAmount)}?`, '付款确认', { type: 'warning' })
  await procurementApi.pay({ id: row.id })
  ElMessage.success('付款完成')
  loadData()
}
async function stockDoc (row: BizProcurement) {
  await ElMessageBox.confirm('确认上架?上架后将自动在地址资源池中批量新增对应记录', '上架确认', { type: 'success' })
  const result: any = await procurementApi.stockIn(row.id)
  const cnt = result?.stockedAddressIds?.length || 0
  ElMessage.success(cnt ? `已上架 · 新增 ${cnt} 个地址资源` : '已上架')
  loadData()
}

// detail
const detailVisible = ref(false)
const detail = ref<BizProcurement | null>(null)
const stockedAddrs = ref<BizAddressResource[]>([])
async function openDetail (row: BizProcurement) {
  detail.value = row
  detailVisible.value = true
  stockedAddrs.value = []
  if (row.status === 'stocked') {
    const addrs = await procurementApi.stockedAddresses(row.id)
    stockedAddrs.value = addrs as BizAddressResource[]
  }
}

onMounted(loadData)
</script>

<style scoped>
.purchase-page { padding: 16px; background: #f5f7f9; min-height: 100%; }
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 14px; }
.stat-card { padding: 18px 22px; border-radius: 10px; color: #fff; position: relative; overflow: hidden; box-shadow: 0 4px 14px -8px rgba(0,0,0,.25); }
.stat-card::after { content: ''; position: absolute; right: -40px; top: -40px; width: 140px; height: 140px; border-radius: 50%; background: rgba(255,255,255,.1); }
.stat-pending { background: linear-gradient(135deg, #d97706, #f59e0b); }
.stat-approved { background: linear-gradient(135deg, #1d4ed8, #3b82f6); }
.stat-stocked { background: linear-gradient(135deg, #047857, #10b981); }
.stat-amount { background: linear-gradient(135deg, #581c87, #9333ea); }
.stat-label { font-size: 13px; opacity: .85; letter-spacing: 1px; }
.stat-value { font-size: 30px; font-weight: 700; margin: 6px 0 4px; font-family: 'JetBrains Mono', Consolas, monospace; letter-spacing: -1px; }
.stat-foot { font-size: 12px; opacity: .8; }

.table-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.status-tabs { flex: 1; margin-bottom: -16px; }
:deep(.status-tabs .el-tabs__nav-wrap::after) { display: none; }
.cell-name { display: flex; flex-direction: column; }
.name-main { font-weight: 600; color: #0f172a; }
.name-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.num { font-family: 'JetBrains Mono', Consolas, monospace; }
.num.small { font-size: 12px; color: #64748b; }
.num.amount { color: #b45309; font-weight: 600; }
.num.amount.big, .num.discount-amount.big { font-size: 22px; }
.num.discount-amount { color: #059669; font-weight: 700; }

.calc-cell { padding: 8px 12px; background: #fff7ed; border: 1px dashed #fdba74; border-radius: 6px; }
.calc-cell.discount { background: #ecfdf5; border-color: #6ee7b7; display: flex; align-items: baseline; gap: 12px; }
.rebate-tip { font-size: 11px; color: #059669; background: #d1fae5; padding: 2px 8px; border-radius: 999px; }

.section-title { margin: 24px 0 12px; font-size: 14px; color: #0f172a; padding-left: 10px; border-left: 3px solid #0d7e7a; }
.status-steps { padding: 16px 0; background: #f8fafc; border-radius: 8px; }
.approval-timeline { padding-left: 8px; }
.opinion { color: #64748b; font-size: 12px; margin-top: 4px; }
.addr-list { display: flex; flex-direction: column; gap: 6px; }
.addr-line { display: flex; gap: 10px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; font-size: 13px; color: #334155; }
.addr-no { font-family: 'JetBrains Mono', monospace; color: #0d7e7a; font-weight: 600; }
.big-tag { display: inline-block; margin-left: 6px; padding: 1px 6px; font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #fff; background: linear-gradient(135deg, #b91c1c, #ef4444); border-radius: 3px; vertical-align: middle; letter-spacing: .5px; }
.big-tag.inline { background: linear-gradient(135deg, #d97706, #f59e0b); font-size: 11px; padding: 2px 8px; }
.level-chip { display: inline-block; margin: 0 6px; padding: 1px 6px; border-radius: 3px; font-size: 11px; color: #fff; font-weight: 500; }
.level-chip[data-lv=manager] { background: #3b82f6; }
.level-chip[data-lv=boss] { background: #b45309; }
</style>

<template>
  <div class="task-page handover-page">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 05 / HANDOVER</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">客户资料交接</span>
          <span class="title-en">Sales → Accounting Handover</span>
        </h1>
        <p class="page-desc">销售签约后向会计移交客户资料，标准化十项清单管控交接质量</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 交接列表 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">交接列表</h2>
        <span class="section-sub">HANDOVER / LIST</span>
        <div class="section-actions">
          <el-input v-model="filterKeyword" placeholder="搜索客户名称 / 销售" clearable class="filter-input" />
          <el-select v-model="filterStatus" placeholder="全部状态" clearable class="filter-select">
            <el-option label="进行中" value="in_progress" />
            <el-option label="已完成" value="completed" />
            <el-option label="已逾期" value="overdue" />
            <el-option label="待审批" value="pending" />
          </el-select>
          <el-button type="primary" @click="openCreate">+ 创建交接</el-button>
        </div>
      </div>

      <div class="table-card">
        <el-table :data="tableData" stripe class="dark-table" v-loading="loading">
          <el-table-column prop="handoverNo" label="编号" width="170" />
          <el-table-column label="客户名称" min-width="200">
            <template #default="{ row }">
              <span class="customer-cell">{{ row.customerName || '—' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售（移交方）" width="140">
            <template #default="{ row }">{{ row.fromUserName }}</template>
          </el-table-column>
          <el-table-column label="会计（接收方）" width="140">
            <template #default="{ row }">{{ row.toUserName }}</template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row)" effect="dark" size="small">
                {{ statusLabel(row) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handoverDate" label="截止日" width="130" />
          <el-table-column label="完成率" width="180">
            <template #default="{ row }">
              <div class="progress-cell">
                <div class="progress-track">
                  <div class="progress-fill" :style="{ width: completion(row) + '%' }"></div>
                </div>
                <span class="progress-text">{{ completion(row) }}%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDetail(row)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-bar">
          <el-pagination
            v-model:current-page="page"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="loadList"
            @size-change="loadList"
          />
        </div>
      </div>
    </section>

    <!-- 交接详情 Drawer -->
    <el-drawer v-model="detailVisible" size="64%" :with-header="false" class="handover-drawer">
      <div v-if="detail" class="drawer-body">
        <div class="drawer-head">
          <div>
            <div class="drawer-tag">HANDOVER · {{ detail.handoverNo }}</div>
            <h2 class="drawer-title">{{ detail.customerName || '客户资料交接' }}</h2>
          </div>
          <el-tag :type="statusTagType(detail)" effect="dark" size="large">{{ statusLabel(detail) }}</el-tag>
        </div>

        <div v-if="isOverdue(detail)" class="warning-bar">
          <span class="warning-icon">⚠</span>
          交接已逾期 {{ overdueDays(detail) }} 天，请尽快协调销售补齐资料并由会计完成确认
        </div>

        <div class="info-grid">
          <div class="info-cell"><label>关联合同</label><span>{{ detail.contractNo || '—' }}</span></div>
          <div class="info-cell"><label>客户</label><span>{{ detail.customerName }}</span></div>
          <div class="info-cell"><label>销售</label><span>{{ detail.fromUserName }}</span></div>
          <div class="info-cell"><label>会计</label><span>{{ detail.toUserName }}</span></div>
          <div class="info-cell"><label>截止日</label><span>{{ detail.handoverDate }}</span></div>
          <div class="info-cell"><label>创建时间</label><span>{{ detail.createTime }}</span></div>
        </div>

        <div class="drawer-section-title">十项标准化交接清单</div>
        <el-table :data="detail.items" stripe class="dark-table checklist-table">
          <el-table-column type="index" label="序号" width="64" align="center" />
          <el-table-column label="项目名称" min-width="220">
            <template #default="{ row }">
              <span class="item-name">{{ row.itemName }}</span>
              <span v-if="row.dueDate" class="item-due">预计：{{ row.dueDate }}</span>
            </template>
          </el-table-column>
          <el-table-column label="是否必须" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="row.required ? 'danger' : 'info'" size="small" effect="plain">
                {{ row.required ? '必须' : '非必须' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="销售状态" width="120" align="center">
            <template #default="{ row }">
              <span class="dot" :class="salesDotClass(row)"></span>{{ salesLabel(row) }}
            </template>
          </el-table-column>
          <el-table-column label="文件" width="160">
            <template #default="{ row }">
              <span v-if="row.fileName" class="file-link">📎 {{ row.fileName }}</span>
              <span v-else class="file-empty">未上传</span>
            </template>
          </el-table-column>
          <el-table-column label="会计确认" width="120" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.status === 'confirmed'" type="success" size="small">已收且合格</el-tag>
              <el-tag v-else-if="row.status === 'rejected'" type="danger" size="small">不合格</el-tag>
              <el-tag v-else type="info" size="small" effect="plain">待确认</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="240">
            <template #default="{ row }">
              <el-dropdown trigger="click" placement="bottom-end" v-if="detail.status !== 'completed'">
                <el-button size="small" link type="primary">销售操作 ▾</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="salesUpload(row)">上传文件</el-dropdown-item>
                    <el-dropdown-item @click="salesProvided(row)">标记已提供</el-dropdown-item>
                    <el-dropdown-item @click="salesPending(row)">待补齐（填日期）</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-dropdown trigger="click" placement="bottom-end" v-if="detail.status !== 'completed'">
                <el-button size="small" link type="warning">会计操作 ▾</el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="acctConfirm(row)">已收到且合格</el-dropdown-item>
                    <el-dropdown-item @click="acctReject(row)">不合格（退回）</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>

        <div class="drawer-footer">
          <div class="footer-summary">
            <span>必须项：<b>{{ requiredDone(detail) }} / {{ requiredTotal(detail) }}</b></span>
            <span>整体完成率：<b>{{ completion(detail) }}%</b></span>
          </div>
          <div class="footer-actions">
            <el-button @click="detailVisible = false">关闭</el-button>
            <el-button
              type="primary"
              :disabled="!canComplete(detail)"
              @click="completeHandover(detail)"
            >交接完成</el-button>
          </div>
        </div>
      </div>
    </el-drawer>

    <!-- 创建交接 Dialog -->
    <el-dialog v-model="createVisible" title="创建交接" width="640px" class="handover-dialog">
      <el-form :model="form" label-width="100px" class="form-grid">
        <el-form-item label="选择合同">
          <el-select v-model="form.contractId" placeholder="选择合同" filterable @change="onContractChange">
            <el-option
              v-for="c in contractOptions"
              :key="c.id"
              :label="`${c.contractNo} · ${c.customerName}`"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="客户">
          <el-input :value="form.customerName" disabled />
        </el-form-item>
        <el-form-item label="销售">
          <el-input :value="form.fromUserName" disabled />
        </el-form-item>
        <el-form-item label="接收会计">
          <el-select v-model="form.toUserId" placeholder="选择会计">
            <el-option
              v-for="u in accountantOptions"
              :key="u.id"
              :label="u.name"
              :value="u.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="form.handoverDate" type="date" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
        <div class="form-tip">系统将自动填充 10 项标准化交接清单</div>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">创建交接</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { handoverApi, handoverHooks, type BizTaskHandover } from '@/api/task-center'

interface ChecklistItem {
  id: number
  handoverId: number
  itemType: string
  itemId: number
  itemName: string
  itemDesc: string
  status: 'pending' | 'confirmed' | 'rejected'
  remark: string
  required: boolean
  salesStatus?: 'untouched' | 'provided' | 'waiting'
  fileName?: string
  dueDate?: string
}

interface HandoverRow extends BizTaskHandover {
  contractNo?: string
  customerName?: string
  items: ChecklistItem[]
}

const STANDARD_CHECKLIST: { name: string; required: boolean }[] = [
  { name: '营业执照正副本', required: true },
  { name: '银行开户许可证 / 基本户信息', required: true },
  { name: '法人身份证', required: true },
  { name: '税控盘 / CA 证书', required: true },
  { name: '历史账务资料', required: true },
  { name: '三方协议', required: false },
  { name: '发票领购簿', required: false },
  { name: '公司章程', required: false },
  { name: '股东信息', required: false },
  { name: '客户特殊约定', required: false }
]

const contractOptions: Array<{ id: number; contractNo: string; customerId: number; customerName: string; salesId: number; salesName: string }> = []
const accountantOptions: Array<{ id: number; name: string }> = []

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)
const tableData = ref<HandoverRow[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const filterKeyword = ref('')
const filterStatus = ref('')

const detailVisible = ref(false)
const detail = ref<HandoverRow | null>(null)

const createVisible = ref(false)
const form = ref({
  contractId: 0,
  contractNo: '',
  customerId: 0,
  customerName: '',
  fromUserId: 0,
  fromUserName: '',
  toUserId: 0,
  handoverDate: defaultDeadline(),
  remark: ''
})

const metrics = computed(() => {
  const list = tableData.value
  const today = new Date().toISOString().slice(0, 10)
  return [
    { label: '进行中交接', value: list.filter(r => r.status === 'in_progress').length },
    { label: '已完成', value: list.filter(r => r.status === 'completed').length },
    { label: '已逾期', value: list.filter(r => r.status !== 'completed' && r.handoverDate < today).length },
    { label: '待我确认', value: list.filter(r => r.status === 'pending' || r.status === 'in_progress').length }
  ]
})

function defaultDeadline() {
  const d = new Date()
  let added = 0
  while (added < 3) {
    d.setDate(d.getDate() + 1)
    const day = d.getDay()
    if (day !== 0 && day !== 6) added++
  }
  return d.toISOString().slice(0, 10)
}

async function loadList() {
  loading.value = true
  try {
    const res: any = await handoverApi.list({
      page: page.value,
      pageSize: pageSize.value,
      status: filterStatus.value || undefined,
      fromUserName: filterKeyword.value || undefined
    })
    tableData.value = (res.list || []).map(enrichRow)
    total.value = res.total || 0
  } finally {
    loading.value = false
  }
}

function enrichRow(row: BizTaskHandover): HandoverRow {
  const items = row.items && row.items.length === STANDARD_CHECKLIST.length
    ? row.items.map((it, i) => ({ ...it, required: STANDARD_CHECKLIST[i].required, itemName: STANDARD_CHECKLIST[i].name }))
    : STANDARD_CHECKLIST.map((s, i) => ({
      id: row.id * 100 + i + 1,
      handoverId: row.id,
      itemType: 'document',
      itemId: 0,
      itemName: s.name,
      itemDesc: '',
      status: (i < 3 ? 'confirmed' : i === 3 ? 'rejected' : 'pending') as ChecklistItem['status'],
      remark: '',
      required: s.required,
      salesStatus: i < 4 ? 'provided' : 'untouched',
      fileName: i < 3 ? `档案_${i + 1}.pdf` : ''
    } as ChecklistItem))
  return {
    ...row,
    contractNo: 'HT' + (row.handoverNo || '').slice(2),
    customerName: row.items?.find(i => i.itemType === 'customer')?.itemName || row.remark || '客户资料',
    items
  }
}

function openCreate() {
  form.value = {
    contractId: 0, contractNo: '', customerId: 0, customerName: '',
    fromUserId: 0, fromUserName: '', toUserId: 0,
    handoverDate: defaultDeadline(), remark: ''
  }
  createVisible.value = true
}
function onContractChange(id: number) {
  const c = contractOptions.find(x => x.id === id)
  if (!c) return
  form.value.contractNo = c.contractNo
  form.value.customerId = c.customerId
  form.value.customerName = c.customerName
  form.value.fromUserId = c.salesId
  form.value.fromUserName = c.salesName
}

async function submitCreate() {
  if (!form.value.contractId || !form.value.toUserId) {
    ElMessage.warning('请完善合同与会计选择')
    return
  }
  const acct = accountantOptions.find(a => a.id === form.value.toUserId)!
  const items = STANDARD_CHECKLIST.map((s, i) => ({
    id: 0, handoverId: 0,
    itemType: i === 0 ? 'customer' : 'document',
    itemId: i === 0 ? form.value.customerId : 0,
    itemName: i === 0 ? form.value.customerName : s.name,
    itemDesc: '',
    status: 'pending' as const,
    remark: ''
  }))
  await handoverApi.create({
    fromUserId: form.value.fromUserId,
    fromUserName: form.value.fromUserName,
    toUserId: form.value.toUserId,
    toUserName: acct.name,
    reason: 'transfer',
    handoverDate: form.value.handoverDate,
    items,
    remark: form.value.remark
  })
  ElMessage.success('交接单已创建，已自动填充 10 项标准清单')
  createVisible.value = false
  loadList()
}

function openDetail(row: HandoverRow) {
  detail.value = row
  detailVisible.value = true
}

function statusLabel(r: BizTaskHandover) {
  const today = new Date().toISOString().slice(0, 10)
  if (r.status !== 'completed' && r.handoverDate < today) return '已逾期'
  return ({ pending: '待启动', in_progress: '进行中', completed: '已完成', cancelled: '已取消' } as any)[r.status] || r.status
}
function statusTagType(r: BizTaskHandover): any {
  const today = new Date().toISOString().slice(0, 10)
  if (r.status !== 'completed' && r.handoverDate < today) return 'danger'
  return ({ pending: 'info', in_progress: 'warning', completed: 'success', cancelled: '' } as any)[r.status]
}
function isOverdue(r: BizTaskHandover) {
  const today = new Date().toISOString().slice(0, 10)
  return r.status !== 'completed' && r.handoverDate < today
}
function overdueDays(r: BizTaskHandover) {
  const a = new Date(r.handoverDate).getTime()
  const b = new Date().getTime()
  return Math.max(1, Math.floor((b - a) / 86400000))
}
function completion(r: HandoverRow) {
  if (!r.items?.length) return 0
  const done = r.items.filter(i => i.status === 'confirmed').length
  return Math.round((done / r.items.length) * 100)
}
function requiredTotal(r: HandoverRow) { return r.items.filter(i => i.required).length }
function requiredDone(r: HandoverRow) { return r.items.filter(i => i.required && i.status === 'confirmed').length }
function canComplete(r: HandoverRow) {
  return r.items.every(i => !i.required || i.status === 'confirmed') && r.status !== 'completed'
}

function salesDotClass(row: ChecklistItem) {
  if (row.salesStatus === 'provided') return 'dot-green'
  if (row.salesStatus === 'waiting') return 'dot-orange'
  return 'dot-grey'
}
function salesLabel(row: ChecklistItem) {
  if (row.salesStatus === 'provided') return '已提供'
  if (row.salesStatus === 'waiting') return '待补齐'
  return '未操作'
}
function salesUpload(row: ChecklistItem) {
  row.fileName = `${row.itemName}_${Date.now().toString().slice(-6)}.pdf`
  row.salesStatus = 'provided'
  ElMessage.success('文件占位上传成功（Mock）')
}
function salesProvided(row: ChecklistItem) {
  row.salesStatus = 'provided'
  ElMessage.success('已标记为：已提供')
}
async function salesPending(row: ChecklistItem) {
  const { value } = await ElMessageBox.prompt('请输入预计补齐日期 (YYYY-MM-DD)', '待补齐', {
    inputPattern: /^\d{4}-\d{2}-\d{2}$/, inputErrorMessage: '日期格式错误'
  }).catch(() => ({ value: '' }))
  if (!value) return
  row.dueDate = value
  row.salesStatus = 'waiting'
  ElMessage.warning(`已标记待补齐，预计 ${value} 前补齐`)
}
async function acctConfirm(row: ChecklistItem) {
  if (!detail.value) return
  await handoverApi.updateItem({ handoverId: detail.value.id, itemId: row.id, status: 'confirmed' })
  row.status = 'confirmed'
  ElMessage.success('已确认收到且合格')
}
async function acctReject(row: ChecklistItem) {
  if (!detail.value) return
  const { value } = await ElMessageBox.prompt('请填写不合格原因', '退回', { inputType: 'textarea' }).catch(() => ({ value: '' }))
  if (!value) return
  await handoverApi.updateItem({ handoverId: detail.value.id, itemId: row.id, status: 'rejected', remark: value })
  row.status = 'rejected'
  row.remark = value
  ElMessage.warning('已标记不合格并退回')
}
async function completeHandover(r: HandoverRow) {
  await ElMessageBox.confirm('所有必须项均已确认，确定标记交接完成？完成后将自动触发「建账初始化」任务并推进客户进入「服务准备中」状态', '交接完成', { type: 'success' }).catch(() => null)
  // 强制使所有 item 为 confirmed 以满足 API
  r.items.forEach(i => { if (i.status !== 'confirmed') i.status = 'confirmed' })
  // 直接置状态（mock 简化）
  r.status = 'completed'
  // 联动：触发建账初始化任务
  try {
    const res: any = handoverHooks.triggerAccountInit({
      customerId: r.customerId || 0,
      customerName: r.customerName || '',
      accountantName: r.toUserName || ''
    })
    if (res?.taskNo) {
      ElMessage.success(`交接完成·已生成建账初始化任务：${res.taskNo}`)
    } else {
      ElMessage.success('交接完成')
    }
  } catch {
    ElMessage.success('交接完成')
  }
  detailVisible.value = false
  loadList()
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.task-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 8px 4px 32px;
}

/* —— Header —— */
.page-header {
  position: relative;
  padding: 32px 36px 28px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 14px;
  overflow: hidden;
  &::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
      radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.12), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 11px; letter-spacing: 0.18em;
  color: var(--gold-primary, #D4AF37);
  margin-bottom: 14px; position: relative; z-index: 1;
}
.meta-tag {
  padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 2px; background: rgba(212, 175, 55, 0.06);
}
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 10px;
  .title-cn {
    font-size: 34px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(212, 175, 55, 0.55);
  }
}
.page-desc { font-size: 14px; color: var(--text-body, #B8B8C0); letter-spacing: 0.04em; margin: 0; }
.header-decor {
  position: absolute; right: 36px; bottom: 24px;
  display: flex; align-items: center; gap: 8px; z-index: 1;
  .decor-line { width: 64px; height: 1px; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5)); &.short { width: 18px; } }
  .decor-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold-primary, #D4AF37); box-shadow: 0 0 12px rgba(212, 175, 55, 0.6); }
}

/* —— Metric Strip —— */
.metric-strip {
  display: grid; grid-template-columns: repeat(4, 1fr);
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px; overflow: hidden;
}
.metric-item {
  position: relative; padding: 18px 22px;
  border-right: 1px solid rgba(212, 175, 55, 0.08);
  &:last-child { border-right: none; }
  .metric-index { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45); margin-bottom: 6px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: var(--gold-primary, #D4AF37); line-height: 1.1; }
  .metric-label { margin-top: 6px; font-size: 12px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
}

/* —— Section Header —— */
.section-head {
  display: flex; align-items: center; gap: 14px; margin-bottom: 16px; padding-left: 4px;
}
.section-title {
  font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5);
  margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }
.section-actions { margin-left: auto; display: flex; gap: 10px; align-items: center; }
.filter-input { width: 200px; }
.filter-select { width: 130px; }

/* —— Table Card —— */
.table-card {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px; padding: 8px 8px 4px;
}
.dark-table { background: transparent; }
.customer-cell { color: #F5F5F5; font-weight: 500; }
.progress-cell { display: flex; align-items: center; gap: 8px; }
.progress-track { width: 120px; height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #F2B824, #D4AF37); }
.progress-text { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--gold-primary, #D4AF37); }
.pagination-bar { padding: 10px 12px; display: flex; justify-content: flex-end; }

/* —— Drawer —— */
:deep(.handover-drawer .el-drawer) { background: #0F0F16; }
.drawer-body { padding: 28px 32px; color: #E8E8EE; }
.drawer-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; }
.drawer-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: rgba(212, 175, 55, 0.7); margin-bottom: 6px; }
.drawer-title { margin: 0; font-size: 26px; font-weight: 700; color: #FFF7DD; }
.warning-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 12px 16px; margin-bottom: 16px;
  background: linear-gradient(90deg, rgba(245, 108, 108, 0.16), rgba(245, 108, 108, 0.04));
  border-left: 3px solid #F56C6C; border-radius: 4px;
  color: #FFCBCB; font-size: 13px;
  .warning-icon { font-size: 18px; }
}
.info-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 14px 24px; padding: 16px 18px; margin-bottom: 22px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px dashed rgba(212, 175, 55, 0.18);
  border-radius: 8px;
}
.info-cell { display: flex; flex-direction: column; gap: 4px; }
.info-cell label { font-size: 11px; letter-spacing: 0.1em; color: rgba(212, 175, 55, 0.6); }
.info-cell span { font-size: 14px; color: #F5F5F5; }
.drawer-section-title {
  font-size: 15px; font-weight: 600; color: var(--gold-primary, #D4AF37);
  margin-bottom: 12px; padding-left: 12px; border-left: 3px solid var(--gold-primary, #D4AF37);
}
.checklist-table { margin-bottom: 22px; }
.item-name { color: #F5F5F5; }
.item-due { display: block; font-size: 11px; color: #F2B824; margin-top: 2px; }
.file-link { color: var(--gold-primary, #D4AF37); cursor: pointer; }
.file-empty { color: #666; font-size: 12px; }
.dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; vertical-align: middle; }
.dot-green { background: #67C23A; }
.dot-orange { background: #F2B824; }
.dot-grey { background: #555; }

.drawer-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.06), transparent);
  border-radius: 8px;
}
.footer-summary { display: flex; gap: 28px; font-size: 13px; color: #B8B8C0;
  b { color: var(--gold-primary, #D4AF37); font-family: 'JetBrains Mono', monospace; }
}
.footer-actions { display: flex; gap: 10px; }

/* —— Dialog —— */
.form-grid :deep(.el-form-item) { margin-bottom: 16px; }
.form-tip {
  font-size: 12px; color: var(--gold-primary, #D4AF37);
  padding: 8px 12px; background: rgba(212, 175, 55, 0.08); border-radius: 4px;
  margin-left: 100px;
}

@media (max-width: 1100px) {
  .metric-strip { grid-template-columns: repeat(2, 1fr); }
  .metric-item:nth-child(2) { border-right: none; }
  .info-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>

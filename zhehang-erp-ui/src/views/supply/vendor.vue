<template>
  <div class="vendor-page">
    <header class="page-head">
      <div>
        <div class="page-kicker">RESOURCE / PARTNER</div>
        <h1>地址供应商</h1>
        <p>统一维护地址资源合作方、合作状态、合同到期与可用资源池。</p>
      </div>
      <div class="head-actions">
        <el-button @click="resetQuery">重置筛选</el-button>
        <el-button type="primary" @click="openCreate">新增地址供应商</el-button>
      </div>
    </header>

    <div class="stat-grid">
      <div class="stat-card stat-active">
        <div class="stat-label">合作中伙伴</div>
        <div class="stat-value">{{ stats.active }}<span class="stat-unit">家</span></div>
        <div class="stat-foot">活跃合作 · 全部状态正常</div>
      </div>
      <div class="stat-card stat-paused">
        <div class="stat-label">暂停合作</div>
        <div class="stat-value">{{ stats.paused }}<span class="stat-unit">家</span></div>
        <div class="stat-foot">暂时挂起 · 待复合作</div>
      </div>
      <div class="stat-card stat-warn">
        <div class="stat-label">即将到期 (30天内)</div>
        <div class="stat-value">{{ stats.expiring }}<span class="stat-unit">家</span></div>
        <div class="stat-foot">建议尽快续约</div>
      </div>
      <div class="stat-card stat-info">
        <div class="stat-label">可用地址资源</div>
        <div class="stat-value">{{ stats.availableAddr }}<span class="stat-unit">个</span></div>
        <div class="stat-foot">挂靠资源池</div>
      </div>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="query" inline>
        <el-form-item label="名称">
          <el-input v-model="query.supplierName" placeholder="搜索地址供应商" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item label="合作状态">
          <el-select v-model="query.status" placeholder="全部" clearable style="width: 140px">
            <el-option label="合作中" value="active" />
            <el-option label="已暂停" value="paused" />
            <el-option label="黑名单" value="blacklist" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域">
          <el-select v-model="query.region" placeholder="全部区域" clearable style="width: 140px">
            <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="query.cooperateLevel" placeholder="全部等级" clearable style="width: 120px">
            <el-option label="A级" value="A" />
            <el-option label="B级" value="B" />
            <el-option label="C级" value="C" />
            <el-option label="D级" value="D" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <el-table :data="filteredList" v-loading="loading" stripe height="540">
        <el-table-column prop="supplierNo" label="编号" width="120" />
        <el-table-column prop="supplierName" label="地址供应商" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="cell-name">
              <span class="name-main">{{ row.supplierName }}</span>
              <span class="name-sub">对接人 · {{ row.contactName || '—' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="合作状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" size="small">
              {{ statusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="可供区域" min-width="160">
          <template #default="{ row }">
            <span class="region-text">{{ regionOf(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="年付底价" width="120" align="right">
          <template #default="{ row }">
            <span class="num">¥{{ formatNum(row.totalProcurement || row.yearlyPrice || 0) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="资源总数 / 可用" width="130" align="center">
          <template #default="{ row }">
            <span class="num">{{ addrCountOf(row.id).total }}</span>
            <span class="num-divider">/</span>
            <span class="num num-accent">{{ addrCountOf(row.id).available }}</span>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <span class="level-badge" :data-level="row.cooperateLevel">{{ row.cooperateLevel }}</span>
          </template>
        </el-table-column>
        <el-table-column label="到期日" width="140">
          <template #default="{ row }">
            <span :class="['expiry', expiryClass(row)]">{{ expiryOf(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'active'" link type="warning" size="small" @click="changeStatus(row, 'paused')">暂停</el-button>
            <el-button v-if="row.status === 'paused'" link type="success" size="small" @click="changeStatus(row, 'active')">恢复</el-button>
            <el-button link type="danger" size="small" @click="changeStatus(row, 'blacklist')">终止</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新建/编辑 Dialog -->
    <el-dialog v-model="formVisible" :title="form.id ? '编辑地址供应商' : '新增地址供应商'" width="820px" class="vendor-dialog">
      <el-form :model="form" label-width="120px" label-position="left">
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="名称"><el-input v-model="form.supplierName" placeholder="地址供应商完整名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="简称"><el-input v-model="form.shortName" placeholder="便于内部识别" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="对接人姓名"><el-input v-model="form.contactName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="对接人电话"><el-input v-model="form.contactPhone" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="对接人微信"><el-input v-model="form.contactWechat" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="地址"><el-input v-model="form.companyAddress" placeholder="合作方办公地址" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">供应区域</el-divider>
        <el-form-item label="可供区域">
          <el-checkbox-group v-model="form.regions">
            <el-checkbox v-for="r in regionOptions" :key="r" :label="r">{{ r }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="form.detailAddresses" type="textarea" :rows="4" placeholder="一行一个详细地址" />
        </el-form-item>

        <el-divider content-position="left">价格信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="年付价格"><el-input-number v-model="form.yearlyPrice" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="半年付"><el-input-number v-model="form.halfYearPrice" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="季付"><el-input-number v-model="form.quarterPrice" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="6">
            <el-form-item label="最低签约">
              <el-select v-model="form.minYears" style="width:100%">
                <el-option label="1年" :value="1" />
                <el-option label="2年" :value="2" />
                <el-option label="3年" :value="3" />
                <el-option label="无限制" :value="0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider content-position="left">返点 & 付款</el-divider>
        <el-row :gutter="16">
          <el-col :span="6"><el-form-item label="是否有返点"><el-switch v-model="form.hasRebate" /></el-form-item></el-col>
          <el-col :span="6"><el-form-item label="返点比例"><el-input-number v-model="form.rebateRate" :min="0" :max="100" :disabled="!form.hasRebate" controls-position="right" style="width:100%"><template #suffix>%</template></el-input-number></el-form-item></el-col>
          <el-col :span="6">
            <el-form-item label="结算周期">
              <el-select v-model="form.settleCycle" style="width:100%">
                <el-option label="月度" value="monthly" />
                <el-option label="季度" value="quarterly" />
                <el-option label="年度" value="yearly" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="付款方式">
              <el-select v-model="form.payMethod" style="width:100%">
                <el-option label="预付" value="prepay" />
                <el-option label="月结" value="monthly" />
                <el-option label="季结" value="quarterly" />
                <el-option label="按单" value="per_order" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6"><el-form-item label="账期天数"><el-input-number v-model="form.creditDays" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
        </el-row>

        <el-divider content-position="left">合作信息</el-divider>
        <el-row :gutter="16">
          <el-col :span="8"><el-form-item label="合同编号"><el-input v-model="form.contractNo" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="合作开始日"><el-date-picker v-model="form.cooperateStartDate" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="合作到期日"><el-date-picker v-model="form.cooperateEndDate" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
          <el-col :span="16"><el-form-item label="续约条件"><el-input v-model="form.renewCondition" /></el-form-item></el-col>
          <el-col :span="8">
            <el-form-item label="等级">
              <el-select v-model="form.cooperateLevel" style="width:100%">
                <el-option label="A级" value="A" />
                <el-option label="B级" value="B" />
                <el-option label="C级" value="C" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 详情 Drawer -->
    <el-drawer v-model="detailVisible" :title="detail?.supplierName" size="640px" class="vendor-drawer">
      <div v-if="detail" class="detail-body">
        <div class="detail-hero">
          <div>
            <div class="hero-no">{{ detail.supplierNo }}</div>
            <div class="hero-name">{{ detail.supplierName }}</div>
            <div class="hero-sub">对接人 · {{ detail.contactName }} · {{ detail.contactPhone }}</div>
          </div>
          <div :class="['count-down', expiryClass(detail)]">
            <div class="cd-num">{{ daysToExpiry(detail) }}</div>
            <div class="cd-label">天后到期</div>
          </div>
        </div>

        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="合作状态"><el-tag :type="statusType(detail.status)" size="small">{{ statusLabel(detail.status) }}</el-tag></el-descriptions-item>
          <el-descriptions-item label="等级">{{ detail.cooperateLevel }}</el-descriptions-item>
          <el-descriptions-item label="开始日">{{ detail.cooperateStartDate }}</el-descriptions-item>
          <el-descriptions-item label="到期日">{{ expiryOf(detail) }}</el-descriptions-item>
          <el-descriptions-item label="开户行">{{ detail.bankName || '—' }}</el-descriptions-item>
          <el-descriptions-item label="账号">{{ detail.bankAccount || '—' }}</el-descriptions-item>
          <el-descriptions-item label="累计资源成本">¥{{ formatNum(detail.totalProcurement) }}</el-descriptions-item>
          <el-descriptions-item label="累计返点">¥{{ formatNum(detail.totalCommission) }}</el-descriptions-item>
          <el-descriptions-item :span="2" label="备注">{{ detail.remark || '—' }}</el-descriptions-item>
        </el-descriptions>

        <h4 class="section-title">关联挂靠地址 ({{ relatedAddresses.length }})</h4>
        <el-table :data="relatedAddresses" size="small" stripe>
          <el-table-column prop="resourceNo" label="编号" width="100" />
          <el-table-column prop="district" label="区域" width="80" />
          <el-table-column prop="detailAddress" label="地址" show-overflow-tooltip />
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="addrStatusType(row.status)" size="small">{{ addrStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>

        <h4 class="section-title">资源补充历史 ({{ relatedProcurements.length }})</h4>
        <el-table :data="relatedProcurements" size="small" stripe>
          <el-table-column prop="procurementNo" label="补充单号" width="150" />
          <el-table-column prop="quantity" label="数量" width="70" align="center" />
          <el-table-column label="金额" width="110" align="right">
            <template #default="{ row }"><span class="num">¥{{ formatNum(row.totalAmount) }}</span></template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }"><el-tag size="small">{{ row.status }}</el-tag></template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { supplierApi, addressApi, procurementApi, type BizSupplier, type BizAddressResource, type BizProcurement } from '@/api/channel'

const regionOptions = ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市', '全杭州']

const loading = ref(false)
const list = ref<BizSupplier[]>([])
const allAddresses = ref<BizAddressResource[]>([])
const allProcurements = ref<BizProcurement[]>([])

const query = reactive({ supplierName: '', status: '', region: '', cooperateLevel: '' })

async function loadData () {
  loading.value = true
  try {
    const [supRes, addrRes, prRes] = await Promise.all([
      supplierApi.list({ pageSize: 200, supplierName: query.supplierName, status: query.status, cooperateLevel: query.cooperateLevel }),
      addressApi.list({ pageSize: 500 }),
      procurementApi.list({ pageSize: 500 })
    ])
    list.value = (supRes as any).list as BizSupplier[]
    allAddresses.value = (addrRes as any).list as BizAddressResource[]
    allProcurements.value = (prRes as any).list as BizProcurement[]
  } finally { loading.value = false }
}

function resetQuery () { Object.assign(query, { supplierName: '', status: '', region: '', cooperateLevel: '' }); loadData() }

const filteredList = computed(() => {
  if (!query.region) return list.value
  return list.value.filter(s => regionOf(s).includes(query.region))
})

function regionOf (s: BizSupplier) {
  const set = new Set(allAddresses.value.filter(a => a.supplierId === s.id).map(a => a.district))
  return Array.from(set).join(' / ') || '—'
}
function addrCountOf (sid: number) {
  const all = allAddresses.value.filter(a => a.supplierId === sid)
  return { total: all.length, available: all.filter(a => a.status === 'available').length }
}
function expiryOf (s: any) {
  return s.cooperateEndDate || addDays(s.cooperateStartDate, 365)
}
function addDays (date: string, n: number) {
  if (!date) return '—'
  const d = new Date(date); d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function daysToExpiry (s: any) {
  const end = expiryOf(s); if (!end || end === '—') return 0
  return Math.round((new Date(end).getTime() - Date.now()) / 86400000)
}
function expiryClass (s: any) {
  const d = daysToExpiry(s)
  if (d < 0) return 'expired'
  if (d <= 30) return 'warning'
  if (d <= 90) return 'caution'
  return 'normal'
}

const stats = computed(() => {
  const active = list.value.filter(s => s.status === 'active').length
  const paused = list.value.filter(s => s.status === 'paused').length
  const expiring = list.value.filter(s => { const d = daysToExpiry(s); return d >= 0 && d <= 30 }).length
  const availableAddr = allAddresses.value.filter(a => a.status === 'available').length
  return { active, paused, expiring, availableAddr }
})

function statusType (s: string): any { return s === 'active' ? 'success' : s === 'paused' ? 'warning' : 'danger' }
function statusLabel (s: string) { return s === 'active' ? '合作中' : s === 'paused' ? '已暂停' : '黑名单' }
function addrStatusType (s: string): any { return ({ available: 'success', reserved: 'warning', sold: 'primary', expired: 'info' } as any)[s] || 'info' }
function addrStatusLabel (s: string) { return ({ available: '可用', reserved: '已预留', sold: '已使用', expired: '已到期' } as any)[s] || s }
function formatNum (n: number) { return (n || 0).toLocaleString('zh-CN') }

// form
const formVisible = ref(false)
const form = reactive<any>({
  id: 0, supplierName: '', shortName: '', contactName: '', contactPhone: '', contactWechat: '',
  companyAddress: '', regions: [] as string[], detailAddresses: '',
  yearlyPrice: 2400, halfYearPrice: 1300, quarterPrice: 700, minYears: 1,
  hasRebate: false, rebateRate: 5, settleCycle: 'quarterly',
  payMethod: 'prepay', creditDays: 0,
  contractNo: '', cooperateStartDate: '', cooperateEndDate: '', renewCondition: '', cooperateLevel: 'B'
})
function resetForm () {
  Object.assign(form, { id: 0, supplierName: '', shortName: '', contactName: '', contactPhone: '', contactWechat: '', companyAddress: '', regions: [], detailAddresses: '', yearlyPrice: 2400, halfYearPrice: 1300, quarterPrice: 700, minYears: 1, hasRebate: false, rebateRate: 5, settleCycle: 'quarterly', payMethod: 'prepay', creditDays: 0, contractNo: '', cooperateStartDate: '', cooperateEndDate: '', renewCondition: '', cooperateLevel: 'B' })
}
function openCreate () { resetForm(); formVisible.value = true }
function openEdit (row: BizSupplier) {
  resetForm()
  Object.assign(form, row)
  form.cooperateEndDate = expiryOf(row)
  formVisible.value = true
}
async function submitForm () {
  if (!form.supplierName) { ElMessage.warning('请填写地址供应商名称'); return }
  if (form.id) {
    await supplierApi.update({ ...form })
    ElMessage.success('更新成功')
  } else {
    await supplierApi.create({ ...form, supplierType: 'address' })
    ElMessage.success('创建成功')
  }
  formVisible.value = false
  loadData()
}
async function changeStatus (row: BizSupplier, status: BizSupplier['status']) {
  const map = { active: '恢复合作', paused: '暂停合作', blacklist: '终止合作' } as any
  await ElMessageBox.confirm(`确定${map[status]}「${row.supplierName}」?`, '提示', { type: 'warning' })
  await supplierApi.update({ id: row.id, status })
  ElMessage.success('操作成功')
  loadData()
}

// detail
const detailVisible = ref(false)
const detail = ref<any>(null)
const relatedAddresses = computed(() => allAddresses.value.filter(a => a.supplierId === detail.value?.id))
const relatedProcurements = computed(() => allProcurements.value.filter(p => p.supplierId === detail.value?.id))
function openDetail (row: BizSupplier) { detail.value = row; detailVisible.value = true }

onMounted(loadData)
</script>

<style scoped>
.vendor-page { min-height: 100%; }
.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.page-kicker {
  margin-bottom: 6px;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .08em;
}
.page-head h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: 24px;
  line-height: 32px;
}
.page-head p {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 13px;
}
.head-actions { display: flex; align-items: center; gap: 8px; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.stat-card {
  padding: 18px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  position: relative;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--shadow-card);
}
.stat-card::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: var(--stat-color);
}
.stat-active { --stat-color: #0f766e; }
.stat-paused { --stat-color: #64748b; }
.stat-warn { --stat-color: #d97706; }
.stat-info { --stat-color: #2563eb; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.stat-value { font-size: 30px; font-weight: 700; margin: 6px 0 4px; font-family: 'JetBrains Mono', Consolas, monospace; letter-spacing: 0; color: var(--stat-color); }
.stat-unit { font-size: 14px; margin-left: 4px; color: var(--text-muted); font-weight: 400; }
.stat-foot { font-size: 12px; color: var(--text-subtle); }
.filter-card, .table-card { margin-bottom: 14px; border-radius: 8px; }
:deep(.filter-card .el-card__body) { padding-bottom: 6px; }
:deep(.filter-card .el-form-item) { margin-bottom: 12px; }
.cell-name { display: flex; flex-direction: column; }
.name-main { font-weight: 600; color: #0f172a; }
.name-sub { font-size: 12px; color: #94a3b8; margin-top: 2px; }
.region-text { color: #475569; font-size: 13px; }
.num { font-family: 'JetBrains Mono', Consolas, monospace; color: #0f172a; }
.num-divider { color: #cbd5e1; margin: 0 4px; }
.num-accent { color: #0d7e7a; font-weight: 600; }
.level-badge { display: inline-block; width: 26px; height: 26px; line-height: 26px; border-radius: 50%; font-weight: 700; font-size: 12px; color: #fff; font-family: 'JetBrains Mono', monospace; }
.level-badge[data-level=A] { background: #0d7e7a; }
.level-badge[data-level=B] { background: #3b82f6; }
.level-badge[data-level=C] { background: #f59e0b; }
.level-badge[data-level=D] { background: #94a3b8; }
.expiry { font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 2px 8px; border-radius: 4px; }
.expiry.normal { color: #64748b; }
.expiry.caution { color: #d97706; background: #fef3c7; }
.expiry.warning { color: #b91c1c; background: #fee2e2; font-weight: 600; }
.expiry.expired { color: #fff; background: #b91c1c; font-weight: 600; }
.detail-hero { display: flex; justify-content: space-between; align-items: center; padding: 18px; background: linear-gradient(135deg, #134e4a, #0d7e7a); color: #fff; border-radius: 10px; margin-bottom: 16px; }
.hero-no { font-family: 'JetBrains Mono', monospace; opacity: .75; font-size: 12px; letter-spacing: 1px; }
.hero-name { font-size: 18px; font-weight: 700; margin: 4px 0; }
.hero-sub { font-size: 12px; opacity: .85; }
.count-down { text-align: center; padding: 8px 18px; border-radius: 8px; background: rgba(255,255,255,.15); }
.cd-num { font-size: 28px; font-weight: 700; font-family: 'JetBrains Mono', monospace; line-height: 1; }
.cd-label { font-size: 11px; opacity: .85; margin-top: 4px; }
.section-title { margin: 20px 0 10px; font-size: 14px; color: #0f172a; padding-left: 10px; border-left: 3px solid #0d7e7a; }
:deep(.vendor-dialog .el-dialog__body) { padding-top: 10px; }
:deep(.el-divider__text) { font-weight: 600; color: #0d7e7a; }
@media (max-width: 1200px) {
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .page-head { align-items: flex-start; flex-direction: column; }
  .stat-grid { grid-template-columns: 1fr; }
}
</style>

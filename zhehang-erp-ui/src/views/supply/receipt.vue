<template>
  <div class="address-page">
    <!-- 资源预警条 -->
    <transition name="slide-down">
      <div v-if="lowStock" class="warn-bar">
        <span class="wb-icon">⚠</span>
        <span class="wb-text">资源预警：当前可用地址仅剩 <b>{{ stats.available }}</b> 个（阈值 < 5），请及时补充地址资源</span>
        <el-button type="danger" size="small" @click="goPurchase">去补充</el-button>
      </div>
    </transition>

    <!-- 顶部统计 -->
    <div class="stat-grid">
      <div class="stat-card stat-total">
        <div class="stat-label">地址资源总数</div>
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-foot">资源池容量</div>
      </div>
      <div class="stat-card stat-available" @click="quickFilter(['available'])">
        <div class="stat-label">可用</div>
        <div class="stat-value">{{ stats.available }}</div>
        <div class="stat-foot">可用于客户挂靠</div>
      </div>
      <div class="stat-card stat-reserved" @click="quickFilter(['reserved'])">
        <div class="stat-label">已预留</div>
        <div class="stat-value">{{ stats.reserved }}</div>
        <div class="stat-foot">待确认使用</div>
      </div>
      <div class="stat-card stat-sold" @click="quickFilter(['sold'])">
        <div class="stat-label">已使用</div>
        <div class="stat-value">{{ stats.sold }}</div>
        <div class="stat-foot">本期使用量</div>
      </div>
      <div class="stat-card stat-expired" @click="quickFilter(['expired'])">
        <div class="stat-label">已到期</div>
        <div class="stat-value">{{ stats.expired }}</div>
        <div class="stat-foot">需重新上架</div>
      </div>
      <div class="stat-card stat-abnormal" @click="quickFilter(['abnormal'])">
        <div class="stat-label">异常</div>
        <div class="stat-value">{{ stats.abnormal }}</div>
        <div class="stat-foot">需处理</div>
      </div>
    </div>

    <!-- 状态 Tab + 筛选 -->
    <el-card shadow="never" class="filter-card">
      <el-tabs v-model="statusTab" class="status-tabs" @tab-change="onTabChange">
        <el-tab-pane :name="''">
          <template #label>全部 <span class="tab-count">{{ stats.total }}</span></template>
        </el-tab-pane>
        <el-tab-pane :name="'available'">
          <template #label>未使用 <span class="tab-count tc-green">{{ stats.available }}</span></template>
        </el-tab-pane>
        <el-tab-pane :name="'reserved'">
          <template #label>已预留 <span class="tab-count tc-orange">{{ stats.reserved }}</span></template>
        </el-tab-pane>
        <el-tab-pane :name="'sold'">
          <template #label>已使用 <span class="tab-count tc-blue">{{ stats.sold }}</span></template>
        </el-tab-pane>
        <el-tab-pane :name="'expired'">
          <template #label>已到期 <span class="tab-count tc-gray">{{ stats.expired }}</span></template>
        </el-tab-pane>
        <el-tab-pane :name="'abnormal'">
          <template #label>异常 <span class="tab-count tc-red">{{ stats.abnormal }}</span></template>
        </el-tab-pane>
      </el-tabs>
      <el-form :model="query" inline class="filter-row">
        <el-form-item label="区域">
          <el-select v-model="query.district" placeholder="选择区域" clearable style="width: 140px">
            <el-option v-for="r in districtOptions" :key="r" :label="r" :value="r" />
          </el-select>
        </el-form-item>
        <el-form-item label="地址供应商">
          <el-select v-model="query.supplierId" placeholder="选择地址供应商" clearable style="width: 220px">
            <el-option v-for="s in suppliers" :key="s.id" :label="s.supplierName" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="搜索">
          <el-input v-model="query.kw" placeholder="编号/地址" clearable style="width: 200px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <div class="main-grid">
      <!-- 左侧表格 -->
      <el-card shadow="never" class="table-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">地址资源池</span>
            <span class="card-sub">共 {{ filteredList.length }} 条</span>
          </div>
        </template>
        <el-table :data="filteredList" v-loading="loading" stripe height="560">
          <el-table-column prop="resourceNo" label="资源编号" width="110" />
          <el-table-column label="地址" min-width="240">
            <template #default="{ row }">
              <div class="addr-cell">
                <div class="addr-main">{{ row.detailAddress }}</div>
                <div class="addr-sub">{{ row.province }} · {{ row.city }} · {{ row.district }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="district" label="区域" width="90" />
          <el-table-column label="地址供应商" width="180" show-overflow-tooltip>
            <template #default="{ row }">{{ row.supplierName }}</template>
          </el-table-column>
          <el-table-column label="资源成本" width="130" align="right">
            <template #header>
              <span>资源成本</span>
              <el-tooltip content="仅管理员/财务可见" placement="top">
                <span class="perm-icon">🔒</span>
              </el-tooltip>
            </template>
            <template #default="{ row }"><span class="num cost">¥{{ formatNum(row.yearlyCost) }}</span></template>
          </el-table-column>
          <el-table-column label="建议售价" width="110" align="right">
            <template #default="{ row }"><span class="num price">¥{{ formatNum(suggestPrice(row)) }}</span></template>
          </el-table-column>
          <el-table-column label="服务售价" width="110" align="right">
            <template #default="{ row }">
              <span v-if="row.status === 'sold'" class="num revenue">¥{{ formatNum(actualPrice(row)) }}</span>
              <span v-else class="placeholder">—</span>
            </template>
          </el-table-column>
          <el-table-column label="毛利 / 毛利率" width="140" align="right">
            <template #default="{ row }">
              <template v-if="row.status === 'sold'">
                <div class="profit-cell">
                  <span class="num profit">¥{{ formatNum(actualPrice(row) - row.yearlyCost) }}</span>
                  <span class="num rate small">{{ grossRate(row) }}%</span>
                </div>
              </template>
              <span v-else class="placeholder">—</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusType(row.status)" effect="dark" size="small">{{ statusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="关联客户/订单" width="160" show-overflow-tooltip>
            <template #default="{ row }">
              <div v-if="row.status === 'reserved'" class="link-cell">
                <span>👤 {{ row.reservedByName || '—' }}</span>
                <span class="sub-text">预留中</span>
              </div>
              <div v-else-if="row.status === 'sold'" class="link-cell">
                <span>📋 {{ row.soldOrderNo || '—' }}</span>
                <span v-if="row.reservedByName" class="sub-text">客户 {{ row.reservedByName }}</span>
              </div>
              <span v-else class="placeholder">—</span>
            </template>
          </el-table-column>
          <el-table-column label="到期日" width="110">
            <template #default="{ row }"><span class="num small">{{ expiryOf(row) }}</span></template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'available'">
                <el-button link type="primary" size="small" @click="reserveDialog(row)">预留</el-button>
                <el-button link type="warning" size="small" @click="markAbnormal(row)">标记异常</el-button>
              </template>
              <template v-else-if="row.status === 'reserved'">
                <el-button link type="success" size="small" @click="confirmSell(row)">确认使用</el-button>
                <el-button link type="info" size="small" @click="releaseAddr(row)">释放</el-button>
              </template>
              <template v-else-if="row.status === 'sold'">
                <el-button link type="primary" size="small">查看客户</el-button>
                <el-button link type="warning" size="small" @click="markExpired(row)">标记到期</el-button>
              </template>
              <template v-else-if="row.status === 'expired'">
                <el-button link type="success" size="small" @click="relist(row)">重新上架</el-button>
              </template>
              <template v-else-if="row.status === 'abnormal'">
                <el-button link type="success" size="small" @click="recoverAddr(row)">恢复</el-button>
                <el-button link type="primary" size="small">通知销售</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 右侧利润分析 -->
      <div class="profit-side">
        <el-card shadow="never" class="profit-card">
          <template #header><span class="card-title">利润计算</span></template>
          <div class="profit-overview">
            <div class="po-item">
              <span class="po-label">本期资源成本</span>
              <span class="po-value cost">¥{{ formatNum(profit.totalCost) }}</span>
            </div>
            <div class="po-item">
              <span class="po-label">本期服务收入</span>
              <span class="po-value price">¥{{ formatNum(profit.totalRevenue) }}</span>
            </div>
            <div class="po-item">
              <span class="po-label">总毛利</span>
              <span class="po-value profit">¥{{ formatNum(profit.totalGross) }}</span>
            </div>
            <div class="po-item highlight">
              <span class="po-label">平均毛利率</span>
              <span class="po-value rate">{{ profit.avgRate }}%</span>
            </div>
          </div>
        </el-card>

        <el-card shadow="never" class="profit-card">
          <template #header><span class="card-title">按地址供应商汇总</span></template>
          <el-table :data="profitBySupplier" size="small" stripe>
            <el-table-column prop="supplierName" label="地址供应商" min-width="120" show-overflow-tooltip />
            <el-table-column prop="purchaseCount" label="资源" width="60" align="center" />
            <el-table-column prop="soldCount" label="使用" width="60" align="center" />
            <el-table-column label="毛利率" width="80" align="right">
              <template #default="{ row }"><span class="num rate">{{ row.rate }}%</span></template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never" class="profit-card">
          <template #header><span class="card-title">按区域汇总</span></template>
          <el-table :data="profitByDistrict" size="small" stripe>
            <el-table-column prop="district" label="区域" width="90" />
            <el-table-column prop="count" label="数量" width="60" align="center" />
            <el-table-column label="平均售价" align="right">
              <template #default="{ row }"><span class="num">¥{{ formatNum(row.avgPrice) }}</span></template>
            </el-table-column>
            <el-table-column label="平均毛利" align="right">
              <template #default="{ row }"><span class="num profit">¥{{ formatNum(row.avgProfit) }}</span></template>
            </el-table-column>
          </el-table>
        </el-card>

        <el-card shadow="never" class="profit-card">
          <template #header><span class="card-title">本月统计</span></template>
          <div class="month-stats">
            <div class="ms-row"><span>本月使用</span><b class="num">{{ monthly.sold }} 个</b></div>
            <div class="ms-row"><span>服务收入</span><b class="num price">¥{{ formatNum(monthly.revenue) }}</b></div>
            <div class="ms-row"><span>资源成本</span><b class="num cost">¥{{ formatNum(monthly.cost) }}</b></div>
            <div class="ms-row"><span>毛利</span><b class="num profit">¥{{ formatNum(monthly.profit) }}</b></div>
            <div class="ms-row highlight"><span>毛利率</span><b class="num rate">{{ monthly.rate }}%</b></div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 预留 Dialog -->
    <el-dialog v-model="reserveVisible" title="预留地址 (选客户)" width="480px">
      <el-form :model="reserveForm" label-width="100px">
        <el-form-item label="资源">
          <span class="num">{{ reserveForm.resourceNo }} · {{ reserveForm.detailAddress }}</span>
        </el-form-item>
        <el-form-item label="客户姓名">
          <el-input v-model="reserveForm.customerName" placeholder="销售对接的客户姓名" />
        </el-form-item>
        <el-form-item label="预留时长">
          <el-select v-model="reserveForm.holdDays" style="width:100%">
            <el-option label="3 天" :value="3" />
            <el-option label="7 天" :value="7" />
            <el-option label="15 天" :value="15" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reserveVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReserve">确认预留</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { addressApi, supplierApi, type BizAddressResource, type BizSupplier } from '@/api/channel'

type AddrStatus = BizAddressResource['status'] | 'abnormal'

const router = useRouter()
const loading = ref(false)
const list = ref<(BizAddressResource & { status: AddrStatus })[]>([])
const suppliers = ref<BizSupplier[]>([])
const statusTab = ref<string>('')
const query = reactive({ status: [] as string[], district: '', supplierId: undefined as number | undefined, kw: '' })

const districtOptions = computed(() => Array.from(new Set(list.value.map(a => a.district))))

async function loadData () {
  loading.value = true
  try {
    const [aRes, sRes] = await Promise.all([
      addressApi.list({ pageSize: 500 }),
      supplierApi.list({ pageSize: 200 })
    ])
    list.value = ((aRes as any).list as BizAddressResource[]).map(a => ({ ...a }))
    suppliers.value = (sRes as any).list as BizSupplier[]
  } finally { loading.value = false }
}
function resetQuery () {
  Object.assign(query, { status: [], district: '', supplierId: undefined, kw: '' })
  statusTab.value = ''
}
function quickFilter (s: string[]) {
  statusTab.value = s[0] || ''
  query.status = s
}
function onTabChange (val: string | number | undefined) {
  const v = String(val || '')
  query.status = v ? [v] : []
}

const filteredList = computed(() => {
  return list.value.filter(a => {
    if (statusTab.value && a.status !== statusTab.value) return false
    if (query.district && a.district !== query.district) return false
    if (query.supplierId && a.supplierId !== query.supplierId) return false
    if (query.kw && !(a.resourceNo + a.detailAddress).includes(query.kw)) return false
    return true
  })
})

const stats = computed(() => {
  const c = (s: string) => list.value.filter(a => a.status === s).length
  return {
    total: list.value.length,
    available: c('available'),
    reserved: c('reserved'),
    sold: c('sold'),
    expired: c('expired'),
    abnormal: c('abnormal')
  }
})

const lowStock = computed(() => stats.value.available < 5)

function suggestPrice (a: BizAddressResource) { return Math.round((a.yearlyCost || 0) * 1.6) }
function actualPrice (a: BizAddressResource) {
  // 模拟实际售价：以资源 id 为种子在 ± 5% 范围内波动
  const base = suggestPrice(a)
  const seed = ((a.id * 9301 + 49297) % 233280) / 233280
  const drift = 0.95 + seed * 0.1
  return Math.round(base * drift)
}
function grossRate (a: BizAddressResource) {
  const sale = actualPrice(a)
  if (!sale) return 0
  return +(((sale - (a.yearlyCost || 0)) / sale) * 100).toFixed(1)
}
function expiryOf (a: BizAddressResource) {
  const d = new Date(a.createTime || Date.now()); d.setDate(d.getDate() + 365)
  return d.toISOString().slice(0, 10)
}
function statusType (s: string): any { return ({ available: 'success', reserved: 'warning', sold: 'primary', expired: 'info', abnormal: 'danger' } as any)[s] }
function statusLabel (s: string) { return ({ available: '未使用', reserved: '已预留', sold: '已使用', expired: '已到期', abnormal: '异常' } as any)[s] }
function formatNum (n: number) { return (n || 0).toLocaleString('zh-CN') }

function goPurchase () {
  router.push('/supply/purchase').catch(() => {})
}

const profit = computed(() => {
  const sold = list.value.filter(a => a.status === 'sold')
  const totalCost = sold.reduce((s, a) => s + (a.yearlyCost || 0), 0)
  const totalRevenue = sold.reduce((s, a) => s + actualPrice(a), 0)
  const totalGross = totalRevenue - totalCost
  const avgRate = totalRevenue ? +(totalGross / totalRevenue * 100).toFixed(1) : 0
  return { totalCost, totalRevenue, totalGross, avgRate }
})

const profitBySupplier = computed(() => {
  const m = new Map<number, any>()
  for (const a of list.value) {
    const k = a.supplierId
    const e = m.get(k) || { supplierName: a.supplierName, purchaseCount: 0, soldCount: 0, cost: 0, revenue: 0 }
    e.purchaseCount++
    e.cost += a.yearlyCost || 0
    if (a.status === 'sold') { e.soldCount++; e.revenue += actualPrice(a) }
    m.set(k, e)
  }
  return Array.from(m.values()).map(e => ({ ...e, rate: e.revenue ? +((e.revenue - (e.cost / e.purchaseCount * e.soldCount)) / e.revenue * 100).toFixed(1) : 0 }))
})

const profitByDistrict = computed(() => {
  const m = new Map<string, any>()
  for (const a of list.value) {
    const k = a.district
    const e = m.get(k) || { district: k, count: 0, costSum: 0, priceSum: 0 }
    e.count++; e.costSum += a.yearlyCost || 0; e.priceSum += suggestPrice(a)
    m.set(k, e)
  }
  return Array.from(m.values()).map(e => ({
    district: e.district, count: e.count,
    avgPrice: Math.round(e.priceSum / e.count),
    avgProfit: Math.round((e.priceSum - e.costSum) / e.count)
  }))
})

const monthly = computed(() => {
  const now = new Date(); const ym = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0')
  const sold = list.value.filter(a => a.status === 'sold' && (a.soldTime || '').startsWith(ym))
  const cost = sold.reduce((s, a) => s + (a.yearlyCost || 0), 0)
  const revenue = sold.reduce((s, a) => s + actualPrice(a), 0)
  const pf = revenue - cost
  return { sold: sold.length, cost, revenue, profit: pf, rate: revenue ? +(pf / revenue * 100).toFixed(1) : 0 }
})

// 预留
const reserveVisible = ref(false)
const reserveForm = reactive<any>({ id: 0, resourceNo: '', detailAddress: '', customerName: '', holdDays: 7 })
function reserveDialog (row: BizAddressResource) {
  Object.assign(reserveForm, { id: row.id, resourceNo: row.resourceNo, detailAddress: row.detailAddress, customerName: '', holdDays: 7 })
  reserveVisible.value = true
}
async function submitReserve () {
  if (!reserveForm.customerName) { ElMessage.warning('请填写客户姓名'); return }
  await addressApi.reserve({ id: reserveForm.id, reservedBy: 1001, reservedByName: reserveForm.customerName })
  ElMessage.success('预留成功')
  reserveVisible.value = false
  loadData()
}
async function confirmSell (row: BizAddressResource) {
  await ElMessageBox.confirm(`确认将「${row.resourceNo}」标记为已使用?`, '提示')
  await addressApi.sell({ id: row.id, orderId: Date.now(), orderNo: 'TD' + Date.now() })
  ElMessage.success('已使用')
  loadData()
}
async function releaseAddr (row: BizAddressResource) {
  await ElMessageBox.confirm('释放后将回到可用状态', '提示')
  await addressApi.release(row.id)
  ElMessage.success('已释放')
  loadData()
}
function markAbnormal (row: any) {
  const idx = list.value.findIndex(a => a.id === row.id); if (idx >= 0) list.value[idx].status = 'abnormal' as any
  ElMessage.warning('已标记为异常')
}
function markExpired (row: any) {
  const idx = list.value.findIndex(a => a.id === row.id); if (idx >= 0) list.value[idx].status = 'expired' as any
  ElMessage.success('已标记为到期')
}
function relist (row: any) {
  const idx = list.value.findIndex(a => a.id === row.id); if (idx >= 0) list.value[idx].status = 'available' as any
  ElMessage.success('已重新上架')
}
function recoverAddr (row: any) {
  const idx = list.value.findIndex(a => a.id === row.id); if (idx >= 0) list.value[idx].status = 'available' as any
  ElMessage.success('已恢复')
}

onMounted(loadData)
</script>

<style scoped>
.address-page { padding: 16px; background: #f5f7f9; min-height: 100%; }
.stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px; margin-bottom: 14px; }
.stat-card { padding: 14px 16px; border-radius: 10px; background: #fff; cursor: pointer; transition: all .25s; border: 1px solid #e5e7eb; position: relative; overflow: hidden; }
.stat-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; }
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px -10px rgba(0,0,0,.2); }
.stat-card .stat-label { font-size: 12px; color: #64748b; letter-spacing: .5px; }
.stat-card .stat-value { font-size: 26px; font-weight: 700; margin: 4px 0 2px; font-family: 'JetBrains Mono', Consolas, monospace; }
.stat-card .stat-foot { font-size: 11px; color: #94a3b8; }
.stat-total::before { background: #475569; } .stat-total .stat-value { color: #1e293b; }
.stat-available::before { background: #14b8a6; } .stat-available .stat-value { color: #0d7e7a; }
.stat-reserved::before { background: #f59e0b; } .stat-reserved .stat-value { color: #d97706; }
.stat-sold::before { background: #3b82f6; } .stat-sold .stat-value { color: #2563eb; }
.stat-expired::before { background: #94a3b8; } .stat-expired .stat-value { color: #64748b; }
.stat-abnormal::before { background: #ef4444; } .stat-abnormal .stat-value { color: #b91c1c; }

.filter-card { margin-bottom: 14px; border-radius: 10px; }
.warn-bar { display: flex; align-items: center; gap: 12px; padding: 12px 18px; margin-bottom: 14px; background: linear-gradient(90deg, #fee2e2, #fecaca); border-left: 4px solid #b91c1c; border-radius: 8px; color: #7f1d1d; box-shadow: 0 2px 8px -4px rgba(185, 28, 28, .3); }
.warn-bar .wb-icon { font-size: 22px; }
.warn-bar .wb-text { flex: 1; font-size: 13px; font-weight: 500; }
.warn-bar .wb-text b { color: #b91c1c; font-family: 'JetBrains Mono', monospace; padding: 0 4px; font-size: 16px; }
.slide-down-enter-active, .slide-down-leave-active { transition: all .3s ease; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; transform: translateY(-10px); }
.status-tabs { margin-bottom: -10px; }
:deep(.status-tabs .el-tabs__nav-wrap::after) { display: none; }
.tab-count { display: inline-block; margin-left: 6px; padding: 0 8px; min-width: 22px; height: 18px; line-height: 18px; font-size: 11px; font-family: 'JetBrains Mono', monospace; background: #f1f5f9; color: #64748b; border-radius: 9px; }
.tab-count.tc-green { background: #d1fae5; color: #047857; }
.tab-count.tc-orange { background: #fef3c7; color: #b45309; }
.tab-count.tc-blue { background: #dbeafe; color: #1d4ed8; }
.tab-count.tc-gray { background: #e2e8f0; color: #64748b; }
.tab-count.tc-red { background: #fee2e2; color: #b91c1c; }
.filter-row { padding-top: 6px; border-top: 1px solid #f1f5f9; margin-top: 8px; }
.perm-icon { margin-left: 4px; font-size: 12px; cursor: help; opacity: .7; }
.profit-cell { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.3; }
.sub-text { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.placeholder { color: #cbd5e1; font-family: 'JetBrains Mono', monospace; }
.num.revenue { color: #1d4ed8; font-weight: 600; }
.main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 14px; }
.table-card { border-radius: 10px; }
.card-header { display: flex; justify-content: space-between; align-items: baseline; }
.card-title { font-weight: 600; color: #0f172a; }
.card-sub { font-size: 12px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
.addr-cell { display: flex; flex-direction: column; }
.addr-main { color: #0f172a; font-weight: 500; }
.addr-sub { font-size: 11px; color: #94a3b8; margin-top: 2px; }
.num { font-family: 'JetBrains Mono', Consolas, monospace; }
.num.small { font-size: 12px; color: #64748b; }
.num.cost { color: #b45309; }
.num.price { color: #0d7e7a; font-weight: 600; }
.num.profit { color: #059669; font-weight: 600; }
.num.rate { color: #2563eb; font-weight: 600; }
.link-cell { color: #2563eb; }
.link-cell { display: flex; flex-direction: column; line-height: 1.3; }

.profit-side { display: flex; flex-direction: column; gap: 12px; }
.profit-card { border-radius: 10px; }
.profit-overview { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.po-item { padding: 10px 12px; background: #f8fafc; border-radius: 6px; display: flex; flex-direction: column; }
.po-item.highlight { grid-column: span 2; background: linear-gradient(135deg, #ecfeff, #cffafe); }
.po-label { font-size: 11px; color: #64748b; }
.po-value { font-family: 'JetBrains Mono', monospace; font-size: 18px; font-weight: 700; margin-top: 4px; }
.month-stats { display: flex; flex-direction: column; gap: 8px; }
.ms-row { display: flex; justify-content: space-between; padding: 6px 10px; font-size: 13px; color: #475569; border-radius: 4px; }
.ms-row.highlight { background: linear-gradient(90deg, #fef3c7, #fde68a); color: #b45309; font-weight: 600; }
:deep(.el-table .cell) { font-size: 12.5px; }
</style>

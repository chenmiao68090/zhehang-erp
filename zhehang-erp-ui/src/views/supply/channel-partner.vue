<template>
  <div class="channel-partner-page">
    <header class="page-head">
      <div>
        <div class="page-kicker">CHANNEL / PARTNER</div>
        <h1>同行渠道</h1>
        <p>维护向同行销售挂靠地址的合作渠道、协议价、账期额度与应收风险。</p>
      </div>
      <div class="head-actions">
        <el-button @click="resetQuery">重置筛选</el-button>
        <el-button type="primary" @click="openCreate">新增渠道</el-button>
      </div>
    </header>

    <div class="stat-grid">
      <div class="stat-card stat-active">
        <div class="stat-label">合作中渠道</div>
        <div class="stat-value">{{ stats.active }}<span class="stat-unit">家</span></div>
        <div class="stat-foot">协议有效 · 可正常下单</div>
      </div>
      <div class="stat-card stat-order">
        <div class="stat-label">本月同行订单</div>
        <div class="stat-value">{{ stats.monthOrders }}<span class="stat-unit">单</span></div>
        <div class="stat-foot">挂靠地址成交单</div>
      </div>
      <div class="stat-card stat-income">
        <div class="stat-label">本月渠道收入</div>
        <div class="stat-value">¥{{ formatNum(stats.monthRevenue) }}</div>
        <div class="stat-foot">含年付与续费</div>
      </div>
      <div class="stat-card stat-risk">
        <div class="stat-label">应收风险</div>
        <div class="stat-value">{{ stats.risk }}<span class="stat-unit">家</span></div>
        <div class="stat-foot">超额度或超账期</div>
      </div>
    </div>

    <div class="rule-grid">
      <el-card shadow="never" class="rule-card">
        <template #header><span class="card-title">渠道报价口径</span></template>
        <div class="rule-list">
          <div class="rule-row"><span>基础售价</span><b>按区域资源底价 + 渠道等级毛利</b></div>
          <div class="rule-row"><span>A级同行</span><b>建议毛利 20% - 25%</b></div>
          <div class="rule-row"><span>B级同行</span><b>建议毛利 25% - 35%</b></div>
          <div class="rule-row"><span>低毛利特批</span><b>低于 18% 需主管确认</b></div>
        </div>
      </el-card>
      <el-card shadow="never" class="rule-card">
        <template #header><span class="card-title">账期风控口径</span></template>
        <div class="rule-list">
          <div class="rule-row"><span>新渠道</span><b>默认预付或单笔结清</b></div>
          <div class="rule-row"><span>月结渠道</span><b>额度内允许下单</b></div>
          <div class="rule-row"><span>预警条件</span><b>应收超过额度 80% 或逾期 7 天</b></div>
          <div class="rule-row"><span>冻结条件</span><b>逾期 15 天暂停新增订单</b></div>
        </div>
      </el-card>
    </div>

    <el-card shadow="never" class="filter-card">
      <el-form :model="query" inline>
        <el-form-item label="渠道名称">
          <el-input v-model="query.keyword" placeholder="搜索同行/机构/联系人" clearable style="width: 220px" />
        </el-form-item>
        <el-form-item label="渠道类型">
          <el-select v-model="query.type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="同行分销" value="peer" />
            <el-option label="园区渠道" value="park" />
            <el-option label="代理机构" value="agency" />
            <el-option label="商务合作" value="business" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="query.level" placeholder="全部等级" clearable style="width: 120px">
            <el-option label="A" value="A" />
            <el-option label="B" value="B" />
            <el-option label="C" value="C" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable style="width: 130px">
            <el-option label="合作中" value="active" />
            <el-option label="观察中" value="watch" />
            <el-option label="暂停" value="paused" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="applyQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">同行渠道列表</span>
          <span class="card-sub">共 {{ filteredList.length }} 家</span>
        </div>
      </template>
      <el-table :data="filteredList" stripe height="520">
        <el-table-column prop="code" label="渠道编号" width="120" />
        <el-table-column label="渠道名称" min-width="220" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="partner-cell">
              <span class="partner-name">{{ row.name }}</span>
              <span class="partner-sub">{{ typeLabel(row.type) }} · {{ row.contactName }} {{ row.contactPhone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="可售区域" min-width="150">
          <template #default="{ row }">{{ row.regions.join(' / ') }}</template>
        </el-table-column>
        <el-table-column label="协议价" width="160" align="right">
          <template #default="{ row }">
            <div class="price-cell">
              <span class="num price">¥{{ formatNum(row.basePrice) }}</span>
              <span class="price-sub">{{ row.settleMode }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="本月订单" width="100" align="center">
          <template #default="{ row }"><span class="num">{{ row.monthOrders }}</span></template>
        </el-table-column>
        <el-table-column label="应收余额" width="130" align="right">
          <template #default="{ row }">
            <span :class="['num', row.receivable > row.creditLimit * 0.8 ? 'risk' : '']">¥{{ formatNum(row.receivable) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="额度使用" width="160">
          <template #default="{ row }">
            <el-progress :percentage="creditPercent(row)" :stroke-width="8" :color="creditColor(row)" />
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }"><span class="level-badge" :data-level="row.level">{{ row.level }}</span></template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="dark" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="210" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
            <el-button link type="primary" size="small" @click="openEdit(row)">编辑</el-button>
            <el-button v-if="row.status === 'active'" link type="warning" size="small" @click="changeStatus(row, 'paused')">暂停</el-button>
            <el-button v-else link type="success" size="small" @click="changeStatus(row, 'active')">恢复</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="formVisible" :title="form.id ? '编辑同行渠道' : '新增同行渠道'" width="760px">
      <el-form :model="form" label-width="110px" label-position="left">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="渠道名称"><el-input v-model="form.name" placeholder="同行公司或合作机构名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="渠道类型">
            <el-select v-model="form.type" style="width:100%">
              <el-option label="同行分销" value="peer" />
              <el-option label="园区渠道" value="park" />
              <el-option label="代理机构" value="agency" />
              <el-option label="商务合作" value="business" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="8"><el-form-item label="联系人"><el-input v-model="form.contactName" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="联系电话"><el-input v-model="form.contactPhone" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="负责人"><el-input v-model="form.ownerName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="协议价"><el-input-number v-model="form.basePrice" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="信用额度"><el-input-number v-model="form.creditLimit" :min="0" controls-position="right" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="结算方式">
            <el-select v-model="form.settleMode" style="width:100%">
              <el-option label="预付" value="预付" />
              <el-option label="单笔结清" value="单笔结清" />
              <el-option label="月结 15 天" value="月结 15 天" />
              <el-option label="月结 30 天" value="月结 30 天" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="渠道等级">
            <el-select v-model="form.level" style="width:100%">
              <el-option label="A" value="A" />
              <el-option label="B" value="B" />
              <el-option label="C" value="C" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="可售区域">
            <el-checkbox-group v-model="form.regions">
              <el-checkbox v-for="r in regionOptions" :key="r" :label="r">{{ r }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="合作备注"><el-input v-model="form.remark" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <BusinessDetailDrawer
      v-if="detail"
      v-model="detailVisible"
      :title="detail.name"
      :subtitle="`${detail.code} · ${typeLabel(detail.type)} · ${detail.ownerName} 负责`"
      eyebrow="渠道管理"
      :avatar="detail.name.slice(0, 2)"
      avatar-class="channel"
      :status-text="statusLabel(detail.status)"
      :status-type="statusType(detail.status)"
      size="660px"
    >
      <template #actions>
        <span class="level-badge" :data-level="detail.level">{{ detail.level }}</span>
      </template>

      <template #meta>
        <div class="bd-kv-grid">
          <div class="bd-kv"><span>联系人</span><b>{{ detail.contactName }}</b></div>
          <div class="bd-kv"><span>电话</span><b>{{ detail.contactPhone }}</b></div>
          <div class="bd-kv"><span>协议价</span><b>¥{{ formatNum(detail.basePrice) }}</b></div>
          <div class="bd-kv"><span>结算方式</span><b>{{ detail.settleMode }}</b></div>
          <div class="bd-kv"><span>信用额度</span><b>¥{{ formatNum(detail.creditLimit) }}</b></div>
          <div class="bd-kv"><span>应收余额</span><b>¥{{ formatNum(detail.receivable) }}</b></div>
          <div class="bd-kv wide"><span>可售区域</span><b>{{ detail.regions.join(' / ') }}</b></div>
          <div class="bd-kv wide"><span>备注</span><b>{{ detail.remark || '—' }}</b></div>
        </div>
      </template>

      <div class="bd-section-title">近期开单</div>
      <el-table :data="detail.orders" size="small" stripe>
        <el-table-column prop="orderNo" label="订单号" width="130" />
        <el-table-column prop="district" label="区域" width="90" />
        <el-table-column prop="customer" label="终端客户" show-overflow-tooltip />
        <el-table-column label="售价" width="100" align="right">
          <template #default="{ row }"><span class="num price">¥{{ formatNum(row.amount) }}</span></template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="90" />
      </el-table>

      <template #timeline>
        <div class="bd-timeline-item">
          <span class="bd-timeline-dot" />
          <div>
            <strong>渠道建档</strong>
            <p>{{ detail.code }} 已纳入同行渠道管理。</p>
          </div>
        </div>
        <div class="bd-timeline-item">
          <span class="bd-timeline-dot success" />
          <div>
            <strong>本月开单 {{ detail.monthOrders }} 笔</strong>
            <p>本月收入 ¥{{ formatNum(detail.monthRevenue) }},应收余额 ¥{{ formatNum(detail.receivable) }}。</p>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="openEdit(detail)">编辑渠道</el-button>
      </template>
    </BusinessDetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'
import { channelPartnerApi } from '@/api/channel'

type ChannelStatus = 'active' | 'watch' | 'paused'
type ChannelType = 'peer' | 'park' | 'agency' | 'business'

interface ChannelOrder {
  orderNo: string
  district: string
  customer: string
  amount: number
  status: string
}

interface ChannelPartner {
  id: number
  code: string
  name: string
  type: ChannelType
  contactName: string
  contactPhone: string
  ownerName: string
  regions: string[]
  basePrice: number
  settleMode: string
  creditLimit: number
  receivable: number
  monthOrders: number
  monthRevenue: number
  level: 'A' | 'B' | 'C'
  status: ChannelStatus
  remark: string
  orders: ChannelOrder[]
}

const regionOptions = ['上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区', '钱塘区']

const partners = ref<ChannelPartner[]>([])
const loading = ref(false)

// 真后端 /channel-partner/list。近期开单(orders)后端暂无对应数据,统一置空(详情页该区显示空表)
async function load () {
  loading.value = true
  try {
    const { list } = await channelPartnerApi.list({ page: 1, pageSize: 200 })
    partners.value = list.map(p => ({ ...p, orders: [] })) as ChannelPartner[]
  } finally {
    loading.value = false
  }
}
onMounted(load)

const query = reactive({ keyword: '', type: '', level: '', status: '' })
const formVisible = ref(false)
const detailVisible = ref(false)
const detail = ref<ChannelPartner | null>(null)
const form = reactive<any>({
  id: 0, name: '', type: 'peer', contactName: '', contactPhone: '', ownerName: '',
  regions: [] as string[], basePrice: 3600, settleMode: '单笔结清', creditLimit: 0,
  level: 'B', remark: ''
})

const filteredList = computed(() => {
  return partners.value.filter(p => {
    const kw = query.keyword.trim()
    if (kw && !`${p.name}${p.contactName}${p.contactPhone}`.includes(kw)) return false
    if (query.type && p.type !== query.type) return false
    if (query.level && p.level !== query.level) return false
    if (query.status && p.status !== query.status) return false
    return true
  })
})

const stats = computed(() => {
  const active = partners.value.filter(p => p.status === 'active').length
  const monthOrders = partners.value.reduce((sum, p) => sum + p.monthOrders, 0)
  const monthRevenue = partners.value.reduce((sum, p) => sum + p.monthRevenue, 0)
  const risk = partners.value.filter(p => p.creditLimit > 0 && p.receivable > p.creditLimit * 0.8).length
  return { active, monthOrders, monthRevenue, risk }
})

function typeLabel (type: ChannelType) {
  return ({ peer: '同行分销', park: '园区渠道', agency: '代理机构', business: '商务合作' } as Record<ChannelType, string>)[type]
}
function statusLabel (status: ChannelStatus) {
  return ({ active: '合作中', watch: '观察中', paused: '已暂停' } as Record<ChannelStatus, string>)[status]
}
function statusType (status: ChannelStatus): any {
  return ({ active: 'success', watch: 'warning', paused: 'info' } as Record<ChannelStatus, string>)[status]
}
function formatNum (n: number) { return (n || 0).toLocaleString('zh-CN') }
function creditPercent (row: ChannelPartner) {
  if (!row.creditLimit) return 0
  return Math.min(100, Math.round(row.receivable / row.creditLimit * 100))
}
function creditColor (row: ChannelPartner) {
  const pct = creditPercent(row)
  if (pct >= 90) return '#b91c1c'
  if (pct >= 80) return '#d97706'
  return '#0d7e7a'
}

function applyQuery () {}
function resetQuery () { Object.assign(query, { keyword: '', type: '', level: '', status: '' }) }
function resetForm () {
  Object.assign(form, {
    id: 0, name: '', type: 'peer', contactName: '', contactPhone: '', ownerName: '',
    regions: [], basePrice: 3600, settleMode: '单笔结清', creditLimit: 0, level: 'B', remark: ''
  })
}
function openCreate () { resetForm(); formVisible.value = true }
function openEdit (row: ChannelPartner) {
  resetForm()
  Object.assign(form, { ...row, regions: [...row.regions] })
  formVisible.value = true
}
async function submitForm () {
  if (!form.name) { ElMessage.warning('请填写渠道名称'); return }
  if (!form.regions.length) { ElMessage.warning('请选择可售区域'); return }
  try {
    if (form.id) {
      await channelPartnerApi.update({ ...form, id: form.id })
      ElMessage.success('已更新同行渠道')
    } else {
      await channelPartnerApi.create({ ...form })
      ElMessage.success('已新增同行渠道')
    }
    formVisible.value = false
    await load()
  } catch { /* 拦截器已统一提示 */ }
}
function openDetail (row: ChannelPartner) {
  detail.value = row
  detailVisible.value = true
}
async function changeStatus (row: ChannelPartner, status: ChannelStatus) {
  await ElMessageBox.confirm(`确定${status === 'active' ? '恢复' : '暂停'}「${row.name}」?`, '提示', { type: 'warning' })
  await channelPartnerApi.changeStatus(row.id, status)
  ElMessage.success('操作成功')
  await load()
}
</script>

<style scoped>
.channel-partner-page { min-height: 100%; }
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
  position: relative;
  overflow: hidden;
  padding: 18px 20px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
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
.stat-order { --stat-color: #2563eb; }
.stat-income { --stat-color: #7c3aed; }
.stat-risk { --stat-color: #d97706; }
.stat-label { font-size: 13px; color: var(--text-muted); }
.stat-value { font-size: 30px; font-weight: 700; margin: 6px 0 4px; font-family: 'JetBrains Mono', Consolas, monospace; letter-spacing: 0; color: var(--stat-color); }
.stat-unit { font-size: 14px; margin-left: 4px; color: var(--text-muted); font-weight: 400; }
.stat-foot { font-size: 12px; color: var(--text-subtle); }
.rule-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; margin-bottom: 14px; }
.rule-card, .filter-card, .table-card { border-radius: 8px; }
.rule-list { display: grid; gap: 8px; }
.rule-row { display: flex; justify-content: space-between; gap: 12px; padding: 8px 10px; background: #f8fafc; border-radius: 6px; font-size: 13px; }
.rule-row span { color: #64748b; }
.rule-row b { color: #0f172a; font-weight: 600; }
.filter-card { margin-bottom: 14px; }
:deep(.filter-card .el-card__body) { padding-bottom: 6px; }
:deep(.filter-card .el-form-item) { margin-bottom: 12px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-weight: 600; color: #0f172a; }
.card-sub { font-size: 12px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; }
.partner-cell { display: flex; flex-direction: column; }
.partner-name { font-weight: 600; color: #0f172a; }
.partner-sub { margin-top: 2px; color: #94a3b8; font-size: 12px; }
.price-cell { display: flex; flex-direction: column; align-items: flex-end; line-height: 1.3; }
.price-sub { color: #94a3b8; font-size: 11px; }
.num { font-family: 'JetBrains Mono', Consolas, monospace; color: #0f172a; }
.num.price { color: #0d7e7a; font-weight: 600; }
.num.risk { color: #b91c1c; font-weight: 700; }
.level-badge { display: inline-block; width: 26px; height: 26px; line-height: 26px; text-align: center; border-radius: 50%; color: #fff; font-size: 12px; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
.level-badge.large { width: 42px; height: 42px; line-height: 42px; font-size: 16px; }
.level-badge[data-level=A] { background: #0d7e7a; }
.level-badge[data-level=B] { background: #2563eb; }
.level-badge[data-level=C] { background: #d97706; }
.detail-hero { display: flex; justify-content: space-between; align-items: center; padding: 18px; margin-bottom: 16px; border-radius: 10px; background: linear-gradient(135deg, #134e4a, #0d7e7a); color: #fff; }
.hero-no { font-family: 'JetBrains Mono', monospace; opacity: .75; font-size: 12px; letter-spacing: 1px; }
.hero-name { font-size: 18px; font-weight: 700; margin: 4px 0; }
.hero-sub { font-size: 12px; opacity: .85; }
.section-title { margin: 20px 0 10px; font-size: 14px; color: #0f172a; padding-left: 10px; border-left: 3px solid #0d7e7a; }
@media (max-width: 1200px) {
  .stat-grid, .rule-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 760px) {
  .page-head { align-items: flex-start; flex-direction: column; }
  .stat-grid, .rule-grid { grid-template-columns: 1fr; }
}
</style>

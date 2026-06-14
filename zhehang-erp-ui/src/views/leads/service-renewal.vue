<template>
  <div class="service-renewal">
    <!-- 编辑式页头 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">续费 · 33</span>
        <span class="meta-divider"></span>
        <span class="meta-time">财务行业 · 服务节点与续费</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">服务节点 · 续费管理</span>
          <span class="title-en">Service Renewal</span>
        </h1>
        <p class="page-desc">围绕服务订单到期节奏，做到预警、续费、藏金阁攻坚与续费率分析的闭环管理</p>
      </div>

      <div class="header-quick">
        <div class="quick-pill warn">
          <span class="pill-num">{{ countByDay(1) }}</span>
          <span class="pill-label">1日内</span>
        </div>
        <div class="quick-pill alert">
          <span class="pill-num">{{ countByDay(7) }}</span>
          <span class="pill-label">7日内</span>
        </div>
        <div class="quick-pill notice">
          <span class="pill-num">{{ countByDay(15) }}</span>
          <span class="pill-label">15日内</span>
        </div>
        <div class="quick-pill calm">
          <span class="pill-num">{{ countByDay(30) }}</span>
          <span class="pill-label">30日内</span>
        </div>
      </div>
    </header>

    <!-- 标签页 -->
    <el-tabs v-model="activeTab" class="renewal-tabs">
      <!-- ============= 到期预警 ============= -->
      <el-tab-pane label="到期预警" name="warning">
        <section class="warning-cards">
          <div
            v-for="(card, idx) in warningCards"
            :key="idx"
            class="warn-card"
            :class="card.type"
          >
            <div class="wc-glyph">{{ card.glyph }}</div>
            <div class="wc-body">
              <div class="wc-num">{{ card.count }}</div>
              <div class="wc-label">{{ card.label }}</div>
            </div>
            <div class="wc-decor"></div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="ph-left">
              <span class="ph-num">/ A</span>
              <h3 class="ph-title">到期客户清单</h3>
            </div>
            <div class="ph-right">
              <el-radio-group v-model="warningRange" size="small">
                <el-radio-button label="1">1天内</el-radio-button>
                <el-radio-button label="7">7天内</el-radio-button>
                <el-radio-button label="15">15天内</el-radio-button>
                <el-radio-button label="30">30天内</el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <el-table :data="warningTable" class="rn-table" stripe>
            <el-table-column label="紧急度" width="78" align="center">
              <template #default="{ row }">
                <span class="urgency-dot" :style="{ background: urgencyColor(row.daysLeft) }"></span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名称" min-width="160">
              <template #default="{ row }">
                <span class="cust-name">{{ row.customerName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="serviceType" label="服务类型" width="120" />
            <el-table-column prop="endDate" label="合同到期日" width="120" />
            <el-table-column label="剩余天数" width="100" align="center">
              <template #default="{ row }">
                <span class="days-left" :class="daysClass(row.daysLeft)">{{ row.daysLeft }} 天</span>
              </template>
            </el-table-column>
            <el-table-column prop="handlerName" label="负责人" width="100" />
            <el-table-column label="续费状态" width="120">
              <template #default="{ row }">
                <el-tag :type="renewalTagType(row.renewalStatus)" effect="plain" size="small">
                  {{ renewalStatusLabel(row.renewalStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="合同金额" width="130" align="right">
              <template #default="{ row }">
                <span class="amount">¥ {{ formatMoney(row.totalAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="contactCustomer(row)">联系客户</el-button>
                <el-button link type="warning" @click="updateRenewalStatus(row)">更新状态</el-button>
                <el-button link type="success" @click="createRenewalOrder(row)">创建续费单</el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>

      <!-- ============= 服务订单 ============= -->
      <el-tab-pane label="服务订单" name="orders">
        <section class="filter-bar">
          <el-form :inline="true" :model="orderFilter" class="filter-form">
            <el-form-item label="客户名称">
              <el-input v-model="orderFilter.customerName" placeholder="请输入" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item label="服务类型">
              <el-select v-model="orderFilter.serviceType" placeholder="全部" clearable style="width: 160px">
                <el-option v-for="t in serviceTypes" :key="t" :label="t" :value="t" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="orderFilter.status" placeholder="全部" clearable style="width: 140px">
                <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="到期时间">
              <el-date-picker
                v-model="orderFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 280px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchOrders">查询</el-button>
              <el-button @click="resetOrderFilter">重置</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="success" :icon="Plus" @click="openOrderDialog()">新建服务订单</el-button>
            </el-form-item>
          </el-form>
        </section>

        <el-table :data="orderTable" class="rn-table" stripe>
          <el-table-column prop="contractNo" label="合同编号" width="150" />
          <el-table-column prop="customerName" label="客户名称" min-width="150" />
          <el-table-column prop="serviceType" label="服务类型" width="120" />
          <el-table-column prop="startDate" label="开始日期" width="120" />
          <el-table-column prop="endDate" label="到期日期" width="120" />
          <el-table-column label="月费" width="110" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="合同总额" width="130" align="right">
            <template #default="{ row }">¥ {{ formatMoney(row.totalAmount) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="statusTagType(row.status)" effect="dark" size="small">
                {{ statusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="续费状态" width="110">
            <template #default="{ row }">
              <el-tag :type="renewalTagType(row.renewalStatus)" effect="plain" size="small">
                {{ renewalStatusLabel(row.renewalStatus) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="handlerName" label="负责人" width="100" />
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openOrderDialog(row)">编辑</el-button>
              <el-button link type="success" @click="renewOrder(row)">续费</el-button>
              <el-button link type="danger" @click="terminateOrder(row)">终止</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- ============= 藏金阁 ============= -->
      <el-tab-pane name="treasure">
        <template #label>
          <span class="treasure-label">藏金阁</span>
        </template>

        <section class="treasure-hall">
          <div class="treasure-banner">
            <div class="banner-frame">
              <div class="frame-corner tl"></div>
              <div class="frame-corner tr"></div>
              <div class="frame-corner bl"></div>
              <div class="frame-corner br"></div>
              <div class="banner-content">
                <div class="banner-icon">藏</div>
                <div class="banner-text">
                  <h2>藏金阁 · 黄金窗口</h2>
                  <p>
                    本阁收录他司服务即将到期之客户。彼时合同将散，正是我司争取之黄金窗口。
                    领取此处客户须先呈递攻坚计划，并经主管审批后方得入怀。
                  </p>
                </div>
              </div>
            </div>
          </div>

          <el-table :data="treasureList" class="rn-table treasure-table" stripe>
            <el-table-column prop="customerName" label="客户名称" min-width="160">
              <template #default="{ row }">
                <span class="treasure-cust">◆ {{ row.customerName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="currentProvider" label="现服务商" width="160" />
            <el-table-column prop="endDate" label="服务到期日" width="130" />
            <el-table-column label="剩余天数" width="100" align="center">
              <template #default="{ row }">
                <span class="days-left" :class="daysClass(row.daysLeft)">{{ row.daysLeft }} 天</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerType" label="客户类型" width="120" />
            <el-table-column prop="region" label="区域" width="110" />
            <el-table-column label="报价参考" width="150" align="right">
              <template #default="{ row }">¥ {{ formatMoney(row.quotation) }} / 年</template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button class="treasure-btn" size="small" @click="openPlanDialog(row)">
                  ⚔ 提交攻坚计划
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </section>
      </el-tab-pane>

      <!-- ============= 续费统计 ============= -->
      <el-tab-pane label="续费统计" name="stats">
        <section class="stat-cards">
          <div class="stat-card s-green">
            <div class="sc-label">续费率</div>
            <div class="sc-value">{{ stats.renewalRate }}<span class="unit">%</span></div>
            <div class="sc-foot">已续费 / 应续费</div>
          </div>
          <div class="stat-card s-red">
            <div class="sc-label">流失率</div>
            <div class="sc-value">{{ stats.lossRate }}<span class="unit">%</span></div>
            <div class="sc-foot">流失 / 应续费</div>
          </div>
          <div class="stat-card s-orange">
            <div class="sc-label">本月应续</div>
            <div class="sc-value">{{ stats.monthDue }}<span class="unit">个</span></div>
            <div class="sc-foot">截至 {{ todayStr }}</div>
          </div>
          <div class="stat-card s-blue">
            <div class="sc-label">本月已续</div>
            <div class="sc-value">{{ stats.monthRenewed }}<span class="unit">个</span></div>
            <div class="sc-foot">完成度 {{ stats.monthDue ? Math.round(stats.monthRenewed / stats.monthDue * 100) : 0 }}%</div>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="ph-left">
              <span class="ph-num">/ B</span>
              <h3 class="ph-title">近 6 个月续费趋势</h3>
            </div>
          </div>

          <div class="trend-wrap">
            <div class="trend-chart">
              <div
                v-for="(m, i) in trendList"
                :key="m.month"
                class="trend-bar-group"
                :style="{ animationDelay: i * 60 + 'ms' }"
              >
                <div class="bar-stack">
                  <div class="bar bar-due" :style="{ height: barH(m.due, trendMax) + '%' }">
                    <span class="bar-tip">{{ m.due }}</span>
                  </div>
                  <div class="bar bar-renew" :style="{ height: barH(m.renewed, trendMax) + '%' }">
                    <span class="bar-tip">{{ m.renewed }}</span>
                  </div>
                </div>
                <div class="bar-month">{{ m.month }}</div>
                <div class="bar-rate">{{ m.rate }}%</div>
              </div>
            </div>

            <div class="trend-legend">
              <span><i class="lg lg-due"></i>应续数</span>
              <span><i class="lg lg-renew"></i>已续数</span>
            </div>

            <el-table :data="trendList" class="rn-table compact" size="small">
              <el-table-column prop="month" label="月份" width="100" />
              <el-table-column prop="due" label="应续数" width="100" align="right" />
              <el-table-column prop="renewed" label="已续数" width="100" align="right" />
              <el-table-column label="续费率" width="100" align="right">
                <template #default="{ row }">{{ row.rate }}%</template>
              </el-table-column>
              <el-table-column label="新增合同金额" align="right">
                <template #default="{ row }">¥ {{ formatMoney(row.newAmount) }}</template>
              </el-table-column>
            </el-table>
          </div>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="ph-left">
              <span class="ph-num">/ C</span>
              <h3 class="ph-title">流失原因分析</h3>
            </div>
          </div>

          <div class="loss-wrap">
            <div class="loss-pie">
              <div class="pie-disc" :style="pieGradient"></div>
              <div class="pie-center">
                <span class="pie-num">{{ totalLoss }}</span>
                <span class="pie-label">流失总数</span>
              </div>
            </div>
            <ul class="loss-list">
              <li v-for="(l, i) in lossReasons" :key="l.reason">
                <span class="ll-dot" :style="{ background: lossColors[i] }"></span>
                <span class="ll-name">{{ l.reason }}</span>
                <span class="ll-bar">
                  <span class="ll-bar-fill" :style="{ width: l.percent + '%', background: lossColors[i] }"></span>
                </span>
                <span class="ll-percent">{{ l.percent }}%</span>
              </li>
            </ul>
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>

    <!-- ============= 服务订单 Dialog ============= -->
    <el-dialog v-model="orderDialog.visible" :title="orderDialog.id ? '编辑服务订单' : '新建服务订单'" width="640px">
      <el-form ref="orderFormRef" :model="orderForm" :rules="orderRules" label-width="120px">
        <el-form-item label="关联客户" prop="customerName">
          <el-select
            v-model="orderForm.customerName"
            filterable
            allow-create
            placeholder="搜索或新建客户"
            style="width: 100%"
          >
            <el-option v-for="c in customerOptions" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="服务类型" prop="serviceType">
          <el-select v-model="orderForm.serviceType" placeholder="请选择" style="width: 100%">
            <el-option v-for="t in serviceTypes" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="合同编号">
          <el-input v-model="orderForm.contractNo" placeholder="不填则自动生成" />
        </el-form-item>
        <el-form-item label="服务开始日期" prop="startDate">
          <el-date-picker v-model="orderForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="服务到期日期" prop="endDate">
          <el-date-picker v-model="orderForm.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="月费金额">
          <el-input-number v-model="orderForm.amount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="合同总金额">
          <el-input-number v-model="orderForm.totalAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="服务商类型">
          <el-radio-group v-model="orderForm.providerType">
            <el-radio label="self">本公司</el-radio>
            <el-radio label="other">他司</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="orderForm.handlerName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="orderForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="orderDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">保存</el-button>
      </template>
    </el-dialog>

    <!-- ============= 藏金阁 攻坚计划 Dialog ============= -->
    <el-dialog v-model="planDialog.visible" title="藏金阁 · 攻坚计划" width="660px" class="plan-dialog">
      <div class="plan-banner">
        <span class="pb-tag">攻 · 坚</span>
        <span class="pb-text">提交后状态变为「审批中」，待主管审批</span>
      </div>
      <el-form ref="planFormRef" :model="planForm" :rules="planRules" label-width="130px">
        <el-form-item label="攻坚目标" prop="target">
          <el-input v-model="planForm.target" disabled />
        </el-form-item>
        <el-form-item label="攻坚策略" prop="strategy">
          <el-input
            v-model="planForm.strategy"
            type="textarea"
            :rows="5"
            :maxlength="500"
            show-word-limit
            placeholder="请详细描述攻坚策略，至少 50 字"
          />
        </el-form-item>
        <el-form-item label="预计接触方式" prop="contactWay">
          <el-radio-group v-model="planForm.contactWay">
            <el-radio label="电话">电话</el-radio>
            <el-radio label="微信">微信</el-radio>
            <el-radio label="面谈">面谈</el-radio>
            <el-radio label="展会">展会</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="预期转化时间" prop="expectDate">
          <el-date-picker v-model="planForm.expectDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="竞争优势分析">
          <el-input v-model="planForm.advantage" type="textarea" :rows="3" placeholder="选填：相比现服务商的优势点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="planDialog.visible = false">取消</el-button>
        <el-button type="warning" @click="submitPlan">提交审批</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { serviceOrderApi, type ServiceOrder } from '@/api/crm'

const activeTab = ref('warning')
const loading = ref(false)

// ====== 基础选项 ======
const serviceTypes: string[] = []
const statusOptions = [
  { label: '服务中', value: 'active' },
  { label: '即将到期', value: 'expiring' },
  { label: '已到期', value: 'expired' },
  { label: '已续费', value: 'renewed' },
  { label: '已终止', value: 'terminated' }
]
const handlers: string[] = []
const customerOptions: string[] = []

// ====== 工具方法 ======
const formatMoney = (n?: number) => (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
const today = new Date()
const todayStr = `${today.getMonth() + 1}/${today.getDate()}`
const dateAdd = (days: number) => {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

// ====== 服务订单（真实后端数据）======
// daysLeft 由 endDate 与今天的差值计算得出(后端无该字段)
type OrderRow = ServiceOrder & { daysLeft: number }
const orderList = ref<OrderRow[]>([])

// 计算距今剩余天数
function diffDays(endDate?: string): number {
  if (!endDate) return 9999
  const end = new Date(endDate + 'T00:00:00')
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((end.getTime() - base.getTime()) / 86400000)
}

// 后端 status 为 Integer(0正常 1已到期 2续费中 3已续费),统一映射为前端字符串状态
function mapStatus(raw: ServiceOrder['status'] | number | undefined, daysLeft: number): ServiceOrder['status'] {
  // 已经是字符串(后端若直接返回字符串则透传)
  if (typeof raw === 'string') return raw
  switch (raw) {
    case 1: return 'expired'
    case 2: return 'expiring'
    case 3: return 'renewed'
    case 0:
    default:
      // 正常状态:按剩余天数细分为"即将到期/服务中",已过期归为已到期
      if (daysLeft < 0) return 'expired'
      if (daysLeft <= 30) return 'expiring'
      return 'active'
  }
}

// 把后端原始记录规整成页面使用的行结构
function normalizeOrder(o: ServiceOrder): OrderRow {
  const daysLeft = diffDays(o.endDate)
  return {
    ...o,
    daysLeft,
    status: mapStatus(o.status, daysLeft)
  }
}

// 拉取服务订单列表(后端分页,这里取较大 pageSize 以便前端做预警/统计聚合)
async function loadOrders() {
  loading.value = true
  try {
    const res = await serviceOrderApi.list({ pageNum: 1, pageSize: 500 })
    const records = res.data?.records ?? []
    orderList.value = records.map(normalizeOrder)
  } catch {
    orderList.value = []
  } finally {
    loading.value = false
    applyOrderFilter()
  }
}

// ====== 计算 / 派生 ======
const countByDay = (n: number) => orderList.value.filter(o => o.daysLeft >= 0 && o.daysLeft <= n).length

const warningCards = computed(() => [
  { type: 'red',    glyph: '🔴', count: countByDay(1),  label: '1 天内到期' },
  { type: 'orange', glyph: '🟠', count: countByDay(7),  label: '7 天内到期' },
  { type: 'yellow', glyph: '🟡', count: countByDay(15), label: '15 天内到期' },
  { type: 'green',  glyph: '🟢', count: countByDay(30), label: '30 天内到期' }
])

const warningRange = ref<'1' | '7' | '15' | '30'>('7')
const warningTable = computed(() => {
  const limit = parseInt(warningRange.value, 10)
  return orderList.value
    .filter(o => o.daysLeft >= 0 && o.daysLeft <= limit)
    .sort((a, b) => a.daysLeft - b.daysLeft)
})

const orderFilter = reactive({
  customerName: '',
  serviceType: '',
  status: '',
  dateRange: [] as string[]
})
const orderTable = ref<OrderRow[]>([])
function applyOrderFilter() {
  orderTable.value = orderList.value.filter(o => {
    if (orderFilter.customerName && !o.customerName.includes(orderFilter.customerName)) return false
    if (orderFilter.serviceType && o.serviceType !== orderFilter.serviceType) return false
    if (orderFilter.status && o.status !== orderFilter.status) return false
    if (orderFilter.dateRange && orderFilter.dateRange.length === 2) {
      if (o.endDate < orderFilter.dateRange[0] || o.endDate > orderFilter.dateRange[1]) return false
    }
    return true
  })
}
function searchOrders() { applyOrderFilter() }
function resetOrderFilter() {
  orderFilter.customerName = ''
  orderFilter.serviceType = ''
  orderFilter.status = ''
  orderFilter.dateRange = []
  applyOrderFilter()
}

// ====== Tag / 颜色 ======
const urgencyColor = (d: number) => {
  if (d <= 1) return '#f56c6c'
  if (d <= 7) return '#e6a23c'
  if (d <= 15) return '#f0c040'
  return '#67c23a'
}
const daysClass = (d: number) => {
  if (d < 7) return 'd-red'
  if (d < 15) return 'd-orange'
  return 'd-normal'
}
const statusLabel = (s: string) => statusOptions.find(o => o.value === s)?.label ?? s
const statusTagType = (s: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' => {
  return ({
    active: 'success',
    expiring: 'warning',
    expired: 'danger',
    renewed: 'primary',
    terminated: 'info'
  } as const)[s] ?? 'info'
}
const renewalStatusLabel = (s?: string) =>
  ({ pending: '待续', negotiating: '洽谈中', confirmed: '已确认', lost: '流失' } as Record<string, string>)[s ?? ''] ?? '—'
const renewalTagType = (s?: string): 'info' | 'warning' | 'success' | 'danger' => {
  return ({
    pending: 'info',
    negotiating: 'warning',
    confirmed: 'success',
    lost: 'danger'
  } as const)[s ?? ''] ?? 'info'
}

// ====== 操作（Mock）======
function contactCustomer(row: OrderRow) {
  ElMessage.success(`已发起联系：${row.customerName}`)
}
function updateRenewalStatus(row: OrderRow) {
  ElMessageBox.prompt('请选择新的续费状态（pending/negotiating/confirmed/lost）', '更新续费状态', {
    inputValue: row.renewalStatus
  }).then(({ value }) => {
    row.renewalStatus = value as ServiceOrder['renewalStatus']
    ElMessage.success('已更新')
  }).catch(() => {})
}
function createRenewalOrder(row: OrderRow) {
  ElMessageBox.confirm(`为「${row.customerName}」创建续费单？`, '提示', { type: 'success' })
    .then(() => ElMessage.success('续费单已创建'))
    .catch(() => {})
}
function renewOrder(row: OrderRow) { createRenewalOrder(row) }
function terminateOrder(row: OrderRow) {
  ElMessageBox.confirm(`确定终止「${row.customerName}」的服务？`, '提示', { type: 'warning' })
    .then(() => {
      row.status = 'terminated'
      ElMessage.success('已终止')
    })
    .catch(() => {})
}

// ====== 服务订单 Dialog ======
const orderFormRef = ref<FormInstance>()
const orderDialog = reactive({ visible: false, id: 0 })
const orderForm = reactive<Partial<ServiceOrder>>({
  customerName: '',
  serviceType: '',
  contractNo: '',
  startDate: '',
  endDate: '',
  amount: 0,
  totalAmount: 0,
  providerType: 'self',
  handlerName: '',
  remark: ''
})
const orderRules: FormRules = {
  customerName: [{ required: true, message: '请选择客户', trigger: 'change' }],
  serviceType: [{ required: true, message: '请选择服务类型', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择到期日期', trigger: 'change' }]
}
function openOrderDialog(row?: OrderRow) {
  orderDialog.visible = true
  if (row) {
    orderDialog.id = row.id
    Object.assign(orderForm, row)
  } else {
    orderDialog.id = 0
    Object.assign(orderForm, {
      customerName: '', serviceType: '', contractNo: '', startDate: '', endDate: '',
      amount: 0, totalAmount: 0, providerType: 'self', handlerName: '', remark: ''
    })
  }
}
async function submitOrder() {
  if (!orderFormRef.value) return
  const ok = await orderFormRef.value.validate().catch(() => false)
  if (!ok) return
  ElMessage.success(orderDialog.id ? '已更新服务订单' : '已新建服务订单')
  orderDialog.visible = false
}

// ====== 藏金阁 Mock 数据 ======
interface TreasureItem {
  id: number
  customerName: string
  currentProvider: string
  endDate: string
  daysLeft: number
  customerType: string
  region: string
  quotation: number
}
const treasureProviders: string[] = []
const treasureRegions = ['杭州·西湖区', '杭州·余杭区', '宁波·鄞州区', '温州·鹿城区', '绍兴·柯桥区', '嘉兴·南湖区', '湖州·吴兴区']
const treasureCustTypes = ['小微企业', '初创公司', '个体工商户', '高新企业', '外贸企业']
const treasureNames: string[] = []
const treasureList = ref<TreasureItem[]>([])

const planFormRef = ref<FormInstance>()
const planDialog = reactive({ visible: false })
const planForm = reactive({
  target: '',
  strategy: '',
  contactWay: '',
  expectDate: '',
  advantage: ''
})
const planRules: FormRules = {
  target: [{ required: true, message: '攻坚目标必填', trigger: 'change' }],
  strategy: [
    { required: true, message: '攻坚策略必填', trigger: 'blur' },
    { min: 50, message: '攻坚策略至少 50 字', trigger: 'blur' }
  ],
  contactWay: [{ required: true, message: '请选择接触方式', trigger: 'change' }],
  expectDate: [{ required: true, message: '请选择预期转化时间', trigger: 'change' }]
}
function openPlanDialog(row: TreasureItem) {
  planDialog.visible = true
  planForm.target = row.customerName
  planForm.strategy = ''
  planForm.contactWay = ''
  planForm.expectDate = ''
  planForm.advantage = ''
}
async function submitPlan() {
  if (!planFormRef.value) return
  const ok = await planFormRef.value.validate().catch(() => false)
  if (!ok) return
  ElMessage.success('攻坚计划已提交，状态变更为「审批中」')
  planDialog.visible = false
}

// ====== 续费统计 ======
// 续费统计:基于真实服务订单(orderList)聚合,不再写死
const stats = computed(() => {
  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const monthOrders = orderList.value.filter(o => (o.endDate || '').startsWith(ym))
  const renewedTotal = orderList.value.filter(o => o.status === 'renewed' || o.renewalStatus === 'confirmed').length
  const lost = orderList.value.filter(o => o.renewalStatus === 'lost').length
  const denom = renewedTotal + lost
  return {
    renewalRate: denom ? Math.round((renewedTotal / denom) * 100) : 0,
    lossRate: denom ? Math.round((lost / denom) * 100) : 0,
    monthDue: monthOrders.length,
    monthRenewed: monthOrders.filter(o => o.status === 'renewed' || o.renewalStatus === 'confirmed').length
  }
})

interface TrendItem { month: string; due: number; renewed: number; rate: number; newAmount: number }
const trendList = ref<TrendItem[]>([
  { month: '2025-12', due: 18, renewed: 14, rate: 78, newAmount: 168000 },
  { month: '2026-01', due: 22, renewed: 17, rate: 77, newAmount: 204000 },
  { month: '2026-02', due: 16, renewed: 11, rate: 69, newAmount: 132000 },
  { month: '2026-03', due: 25, renewed: 19, rate: 76, newAmount: 228000 },
  { month: '2026-04', due: 30, renewed: 23, rate: 77, newAmount: 276000 },
  { month: '2026-05', due: 28, renewed: 21, rate: 75, newAmount: 252000 }
])
const trendMax = computed(() => Math.max(...trendList.value.map(t => Math.max(t.due, t.renewed))))
const barH = (v: number, max: number) => (max === 0 ? 0 : Math.round((v / max) * 100))

const lossReasons = ref([
  { reason: '价格因素', percent: 32 },
  { reason: '服务不满意', percent: 24 },
  { reason: '业务变动', percent: 18 },
  { reason: '竞争对手抢走', percent: 16 },
  { reason: '其他', percent: 10 }
])
const lossColors = ['#f56c6c', '#e6a23c', '#409eff', '#9b59b6', '#909399']
const totalLoss = computed(() => 32) // 演示数据
const pieGradient = computed(() => {
  let acc = 0
  const segs: string[] = []
  lossReasons.value.forEach((l, i) => {
    const start = acc
    acc += (l.percent / 100) * 360
    segs.push(`${lossColors[i]} ${start}deg ${acc}deg`)
  })
  return { background: `conic-gradient(${segs.join(',')})` }
})

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.service-renewal {
  padding: 24px 28px 40px;
  min-height: 100%;
  background: linear-gradient(180deg, #f7f8fb 0%, #eef0f5 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif;
  color: #2c3344;
}

/* ===== 页头 ===== */
.page-header {
  position: relative;
  padding: 28px 32px;
  margin-bottom: 22px;
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 14px;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 6px;
  background: linear-gradient(180deg, #f56c6c, #e6a23c, #67c23a);
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  letter-spacing: 0.18em;
}
.meta-tag {
  padding: 3px 10px;
  background: #2c3344;
  color: #fff;
  border-radius: 3px;
  font-weight: 600;
}
.meta-divider { width: 24px; height: 1px; background: #d8dce4; }
.header-main { margin-top: 14px; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0;
}
.title-cn { color: #1f2433; }
.title-en {
  font-size: 13px;
  font-weight: 500;
  color: #b1b5be;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}
.page-desc {
  margin: 8px 0 0;
  font-size: 13px;
  color: #6a7180;
  letter-spacing: 0.06em;
}
.header-quick {
  position: absolute;
  right: 32px;
  top: 28px;
  display: flex;
  gap: 10px;
}
.quick-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 18px;
  border-radius: 10px;
  border: 1px solid;
  min-width: 70px;
}
.quick-pill.warn   { color: #f56c6c; border-color: #fbc4c4; background: #fff5f5; }
.quick-pill.alert  { color: #e6a23c; border-color: #f5d8a8; background: #fff8ec; }
.quick-pill.notice { color: #d4a017; border-color: #f0e09b; background: #fffbe6; }
.quick-pill.calm   { color: #67c23a; border-color: #c2e7b0; background: #f3faef; }
.pill-num { font-size: 22px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
.pill-label { margin-top: 4px; font-size: 12px; letter-spacing: 0.2em; }

/* ===== Tabs ===== */
.renewal-tabs :deep(.el-tabs__nav-wrap)::after { background-color: #e6e8ee; }
.renewal-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.1em;
  padding: 0 28px;
}
.renewal-tabs :deep(.el-tabs__active-bar) { height: 3px; }
.treasure-label {
  background: linear-gradient(90deg, #b8860b, #daa520, #f5d76e);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  letter-spacing: 0.3em;
}

/* ===== 预警卡片 ===== */
.warning-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}
.warn-card {
  position: relative;
  padding: 22px 24px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  gap: 18px;
  overflow: hidden;
  border: 1px solid transparent;
  transition: transform .25s ease, box-shadow .25s ease;
}
.warn-card:hover { transform: translateY(-3px); box-shadow: 0 12px 26px -10px rgba(0,0,0,.18); }
.warn-card.red    { background: linear-gradient(135deg, #fff5f5, #ffe5e5); border-color: #fbc4c4; }
.warn-card.orange { background: linear-gradient(135deg, #fff8ec, #ffeed1); border-color: #f5d8a8; }
.warn-card.yellow { background: linear-gradient(135deg, #fffbe6, #fff4ad); border-color: #f0e09b; }
.warn-card.green  { background: linear-gradient(135deg, #f3faef, #d8efc6); border-color: #c2e7b0; }
.wc-glyph { font-size: 30px; }
.wc-num { font-size: 36px; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; }
.warn-card.red .wc-num    { color: #f56c6c; }
.warn-card.orange .wc-num { color: #e6a23c; }
.warn-card.yellow .wc-num { color: #c79a00; }
.warn-card.green .wc-num  { color: #5daa30; }
.wc-label { margin-top: 6px; font-size: 13px; color: #6a7180; letter-spacing: 0.08em; }
.wc-decor {
  position: absolute;
  right: -30px; top: -30px;
  width: 120px; height: 120px;
  border-radius: 50%;
  background: rgba(255,255,255,.5);
  filter: blur(2px);
}

/* ===== 通用 Panel ===== */
.panel {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 12px;
  padding: 18px 22px;
  margin-bottom: 22px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 1px dashed #e6e8ee;
}
.ph-left { display: flex; align-items: baseline; gap: 14px; }
.ph-num { font-size: 12px; color: #b1b5be; letter-spacing: 0.3em; font-weight: 600; }
.ph-title { font-size: 16px; font-weight: 700; color: #1f2433; margin: 0; letter-spacing: 0.05em; }

/* ===== 表格 ===== */
.rn-table { border: 1px solid #eef0f5; border-radius: 8px; }
.rn-table :deep(.el-table__header) th {
  background: #fafbfd !important;
  color: #4a5060 !important;
  font-weight: 600;
}
.urgency-dot {
  display: inline-block;
  width: 12px; height: 12px;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(0,0,0,.04);
}
.cust-name { font-weight: 600; }
.days-left { font-variant-numeric: tabular-nums; font-weight: 700; }
.d-red    { color: #f56c6c; }
.d-orange { color: #e6a23c; }
.d-normal { color: #5a6072; }
.amount { font-variant-numeric: tabular-nums; color: #1f2433; font-weight: 600; }

/* ===== 筛选栏 ===== */
.filter-bar {
  background: #fff;
  border: 1px solid #e6e8ee;
  border-radius: 12px;
  padding: 14px 18px 0;
  margin-bottom: 16px;
}

/* ===== 藏金阁 ===== */
.treasure-hall {
  background: linear-gradient(180deg, #fffaf0 0%, #fdf5e6 100%);
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #f0d99c;
}
.treasure-banner { margin-bottom: 18px; }
.banner-frame {
  position: relative;
  padding: 28px 32px;
  background:
    repeating-linear-gradient(45deg, rgba(218,165,32,.04) 0 8px, transparent 8px 16px),
    linear-gradient(135deg, #1c1408 0%, #3a2810 100%);
  border-radius: 12px;
  border: 1px solid #b8860b;
  overflow: hidden;
}
.frame-corner {
  position: absolute;
  width: 18px; height: 18px;
  border: 2px solid #daa520;
}
.frame-corner.tl { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
.frame-corner.tr { top: 8px; right: 8px; border-left: 0; border-bottom: 0; }
.frame-corner.bl { bottom: 8px; left: 8px; border-right: 0; border-top: 0; }
.frame-corner.br { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }
.banner-content { display: flex; align-items: center; gap: 24px; position: relative; }
.banner-icon {
  width: 64px; height: 64px;
  display: grid;
  place-items: center;
  border: 2px solid #daa520;
  color: #daa520;
  font-size: 28px;
  font-weight: 800;
  border-radius: 4px;
  letter-spacing: 0.1em;
  background: rgba(218,165,32,.05);
}
.banner-text h2 {
  margin: 0 0 6px;
  color: #f5d76e;
  font-size: 20px;
  letter-spacing: 0.2em;
  font-weight: 700;
}
.banner-text p {
  margin: 0;
  color: #d9c79b;
  font-size: 13px;
  line-height: 1.7;
  letter-spacing: 0.05em;
  max-width: 760px;
}
.treasure-table :deep(.el-table__header) th { background: #fdf5e6 !important; color: #8b6914 !important; }
.treasure-cust { color: #8b6914; font-weight: 600; }
.treasure-btn {
  background: linear-gradient(135deg, #b8860b, #daa520);
  color: #fff;
  border: 0;
  letter-spacing: 0.15em;
}
.treasure-btn:hover { background: linear-gradient(135deg, #daa520, #f5d76e); color: #1c1408; }

/* ===== 统计卡片 ===== */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}
.stat-card {
  position: relative;
  padding: 22px 24px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e6e8ee;
  overflow: hidden;
}
.stat-card::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
}
.stat-card.s-green::after  { background: linear-gradient(90deg, #67c23a, #a3d977); }
.stat-card.s-red::after    { background: linear-gradient(90deg, #f56c6c, #fab6b6); }
.stat-card.s-orange::after { background: linear-gradient(90deg, #e6a23c, #f5d8a8); }
.stat-card.s-blue::after   { background: linear-gradient(90deg, #409eff, #a0cfff); }
.sc-label { font-size: 13px; color: #6a7180; letter-spacing: 0.2em; }
.sc-value {
  margin-top: 10px;
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: #1f2433;
}
.stat-card.s-green .sc-value  { color: #5daa30; }
.stat-card.s-red .sc-value    { color: #f56c6c; }
.stat-card.s-orange .sc-value { color: #e6a23c; }
.stat-card.s-blue .sc-value   { color: #409eff; }
.unit { font-size: 16px; font-weight: 600; margin-left: 6px; color: #909399; }
.sc-foot { margin-top: 10px; font-size: 12px; color: #909399; letter-spacing: 0.06em; }

/* ===== 续费趋势 ===== */
.trend-wrap { display: flex; flex-direction: column; gap: 18px; }
.trend-chart {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  height: 240px;
  padding: 16px;
  background: #fafbfd;
  border-radius: 8px;
  align-items: end;
}
.trend-bar-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  animation: rise .6s ease forwards;
  opacity: 0;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.bar-stack {
  display: flex;
  align-items: end;
  justify-content: center;
  gap: 6px;
  flex: 1;
  width: 100%;
  min-height: 0;
}
.bar {
  width: 26px;
  border-radius: 3px 3px 0 0;
  position: relative;
  transition: filter .2s ease;
}
.bar:hover { filter: brightness(1.1); }
.bar-due { background: linear-gradient(180deg, #a0cfff, #409eff); }
.bar-renew { background: linear-gradient(180deg, #a3d977, #67c23a); }
.bar-tip {
  position: absolute;
  top: -22px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: #6a7180;
  font-variant-numeric: tabular-nums;
}
.bar-month { margin-top: 8px; font-size: 12px; color: #6a7180; letter-spacing: 0.05em; }
.bar-rate { font-size: 13px; font-weight: 700; color: #5daa30; margin-top: 2px; }
.trend-legend {
  display: flex; gap: 22px; justify-content: center;
  font-size: 12px; color: #6a7180;
}
.lg { display: inline-block; width: 14px; height: 10px; margin-right: 6px; vertical-align: middle; border-radius: 2px; }
.lg-due { background: linear-gradient(180deg, #a0cfff, #409eff); }
.lg-renew { background: linear-gradient(180deg, #a3d977, #67c23a); }
.compact { font-size: 13px; }

/* ===== 流失原因 ===== */
.loss-wrap {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: center;
}
.loss-pie {
  position: relative;
  width: 220px; height: 220px;
  margin: 0 auto;
}
.pie-disc {
  width: 100%; height: 100%;
  border-radius: 50%;
  box-shadow: 0 6px 22px -10px rgba(0,0,0,.2);
}
.pie-center {
  position: absolute;
  inset: 30px;
  background: #fff;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.pie-num { font-size: 30px; font-weight: 800; color: #1f2433; line-height: 1; }
.pie-label { margin-top: 6px; font-size: 12px; color: #909399; letter-spacing: 0.2em; }

.loss-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
.loss-list li {
  display: grid;
  grid-template-columns: 12px 130px 1fr 60px;
  align-items: center;
  gap: 14px;
}
.ll-dot { width: 10px; height: 10px; border-radius: 50%; }
.ll-name { font-size: 14px; color: #2c3344; font-weight: 500; }
.ll-bar {
  position: relative;
  height: 8px;
  background: #f0f2f6;
  border-radius: 4px;
  overflow: hidden;
}
.ll-bar-fill {
  display: block;
  height: 100%;
  border-radius: 4px;
  transition: width .6s ease;
}
.ll-percent {
  font-size: 13px; font-weight: 700; color: #1f2433;
  font-variant-numeric: tabular-nums; text-align: right;
}

/* ===== 攻坚计划弹窗 ===== */
.plan-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #1c1408, #3a2810);
  margin: 0;
  padding: 16px 22px;
}
.plan-dialog :deep(.el-dialog__title) {
  color: #f5d76e;
  letter-spacing: 0.2em;
  font-weight: 700;
}
.plan-dialog :deep(.el-dialog__headerbtn .el-dialog__close) { color: #daa520; }
.plan-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  margin-bottom: 18px;
  border: 1px dashed #daa520;
  border-radius: 8px;
  background: #fffaf0;
}
.pb-tag {
  padding: 4px 10px;
  background: linear-gradient(135deg, #b8860b, #daa520);
  color: #fff;
  border-radius: 4px;
  font-weight: 700;
  letter-spacing: 0.2em;
  font-size: 12px;
}
.pb-text { color: #8b6914; font-size: 13px; letter-spacing: 0.05em; }

@media (max-width: 1280px) {
  .warning-cards, .stat-cards { grid-template-columns: repeat(2, 1fr); }
  .header-quick { position: static; margin-top: 14px; }
  .loss-wrap { grid-template-columns: 1fr; }
  .trend-chart { grid-template-columns: repeat(6, minmax(60px, 1fr)); gap: 12px; }
}
</style>

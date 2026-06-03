<template>
  <div class="multi-pool">
    <!-- 顶部页头 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">线索 · 03</span>
        <span class="meta-divider"></span>
        <span class="meta-time">多公海池架构</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">多公海池管理</span>
          <span class="title-en">Multi-Pool Workbench</span>
        </h1>
        <p class="page-desc">7 大池协同流转 · 防撞单 · 持有上限 · 智能分配</p>
      </div>
      <button class="back-btn" @click="back">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回工作台</span>
      </button>
    </header>

    <!-- 池切换 Tabs -->
    <section class="pool-tabs-wrap">
      <el-tabs v-model="activePool" class="pool-tabs" @tab-change="handlePoolChange">
        <el-tab-pane v-for="p in pools" :key="p.code" :name="p.code">
          <template #label>
            <span class="tab-label">
              <el-icon><component :is="p.icon" /></el-icon>
              <span>{{ p.name }}</span>
              <el-badge :value="p.count" :max="999" class="tab-badge" />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
    </section>

    <!-- 业务规则说明条 -->
    <section class="rule-banner">
      <div class="rule-item">
        <el-icon class="icon-cyan"><Lock /></el-icon>
        <span class="rule-key">秒级锁</span>
        <span class="rule-val">同一客户 1.5s 内仅 1 人可锁定</span>
      </div>
      <div class="rule-item">
        <el-icon class="icon-amber"><Timer /></el-icon>
        <span class="rule-key">15 天冷却</span>
        <span class="rule-val">原跟进人 15 天内不可重领</span>
      </div>
      <div class="rule-item">
        <el-icon class="icon-rose"><Pointer /></el-icon>
        <span class="rule-key">每日抢单</span>
        <span class="rule-val">单人上限 20 单 · 当前 {{ grabState.current }}/{{ grabState.limit }}</span>
      </div>
      <div class="rule-item">
        <el-icon class="icon-emerald"><StarFilled /></el-icon>
        <span class="rule-key">A 级优先窗口</span>
        <span class="rule-val">入池 30s 内仅高绩效可见</span>
      </div>
      <div class="rule-item">
        <el-icon class="icon-purple"><RefreshRight /></el-icon>
        <span class="rule-key">3 天首跟</span>
        <span class="rule-val">抢单后 3 天未首跟立即回收</span>
      </div>
    </section>

    <!-- 统计卡片 -->
    <section class="stat-row">
      <div class="stat-card grad-cyan">
        <div class="stat-icon"><el-icon :size="22"><Coin /></el-icon></div>
        <div class="stat-data">
          <div class="stat-num">{{ poolStats.total }}</div>
          <div class="stat-label">池内总客户</div>
        </div>
        <div class="stat-trend">总量</div>
      </div>
      <div class="stat-card grad-emerald">
        <div class="stat-icon"><el-icon :size="22"><Plus /></el-icon></div>
        <div class="stat-data">
          <div class="stat-num">{{ poolStats.todayIn }}</div>
          <div class="stat-label">今日新增</div>
        </div>
        <div class="stat-trend up">+ 今日</div>
      </div>
      <div class="stat-card grad-amber">
        <div class="stat-icon"><el-icon :size="22"><User /></el-icon></div>
        <div class="stat-data">
          <div class="stat-num">{{ poolStats.todayClaim }}</div>
          <div class="stat-label">今日被领取</div>
        </div>
        <div class="stat-trend">流出</div>
      </div>
      <div class="stat-card grad-rose">
        <div class="stat-icon"><el-icon :size="22"><RefreshRight /></el-icon></div>
        <div class="stat-data">
          <div class="stat-num">{{ poolStats.todayRecycle }}</div>
          <div class="stat-label">今日回收入池</div>
        </div>
        <div class="stat-trend">回流</div>
      </div>
    </section>

    <!-- 高级搜索 -->
    <section class="search-panel" :class="{ collapsed: !searchOpen }">
      <div class="search-head" @click="searchOpen = !searchOpen">
        <span class="search-title">
          <el-icon><Search /></el-icon>
          高级搜索
        </span>
        <span class="search-toggle">
          {{ searchOpen ? '收起' : '展开' }}
          <el-icon><component :is="searchOpen ? ArrowUp : ArrowDown" /></el-icon>
        </span>
      </div>
      <div v-show="searchOpen" class="search-body">
        <el-form :model="searchForm" label-width="90px" size="default">
          <el-row :gutter="18">
            <el-col :span="6">
              <el-form-item label="客户名称">
                <el-input v-model="searchForm.name" placeholder="模糊搜索" clearable />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="注册区域">
                <el-select v-model="searchForm.region" placeholder="全部区域" clearable filterable>
                  <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="所属行业">
                <el-select v-model="searchForm.industry" placeholder="全部行业" clearable>
                  <el-option v-for="i in industries" :key="i" :label="i" :value="i" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户等级">
                <el-select v-model="searchForm.level" placeholder="全部等级" clearable>
                  <el-option label="A 级" value="A" />
                  <el-option label="B 级" value="B" />
                  <el-option label="C 级" value="C" />
                  <el-option label="D 级" value="D" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="客户类型">
                <el-select v-model="searchForm.type" placeholder="全部类型" clearable>
                  <el-option v-for="t in customerTypes" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="来源渠道">
                <el-select v-model="searchForm.source" placeholder="全部渠道" clearable>
                  <el-option v-for="s in sources" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="入池时间">
                <el-date-picker
                  v-model="searchForm.dateRange"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <div class="search-actions">
            <el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
            <el-button :icon="RefreshLeft" @click="handleReset">重置</el-button>
          </div>
        </el-form>
      </div>
    </section>

    <!-- 操作工具栏 -->
    <section class="toolbar">
      <div class="toolbar-left">
        <el-button
          type="primary"
          :icon="Pointer"
          :disabled="selected.length === 0"
          @click="batchClaim"
        >
          批量{{ activePool === 'COLLAB' ? '抢单' : '领取' }}
          <span v-if="selected.length" class="count-tag">{{ selected.length }}</span>
        </el-button>
        <el-button
          v-if="isManager"
          type="success"
          :icon="Promotion"
          :disabled="selected.length === 0"
          @click="openDistributeDialog"
        >
          批量分配
        </el-button>
      </div>
      <div class="toolbar-right">
        <span class="grab-meter" :class="{ warn: grabState.current >= grabState.limit }">
          <el-icon><Pointer /></el-icon>
          今日抢单：<b>{{ grabState.current }}</b> / {{ grabState.limit }}
        </span>
        <span class="hold-meter">
          <el-icon><Aim /></el-icon>
          我的持有：<b>{{ myHolding.current }}</b> / {{ myHolding.max }}
          <i class="meter-bar">
            <i class="meter-fill" :style="{ width: holdRate + '%' }"></i>
          </i>
        </span>
        <el-button :icon="Download" plain @click="handleExport">导出</el-button>
        <el-button :icon="Refresh" plain @click="handleRefresh">刷新</el-button>
      </div>
    </section>

    <!-- 客户列表 -->
    <section class="table-wrap">
      <el-table
        v-loading="loading"
        :data="pagedList"
        stripe
        border
        height="540"
        @selection-change="onSelectionChange"
        :row-class-name="rowClassName"
      >
        <el-table-column type="selection" width="48" />
        <el-table-column label="客户名称" min-width="180" prop="name">
          <template #default="{ row }">
            <a class="link-name" @click="viewDetail(row)">
              {{ row.name }}
              <el-icon v-if="row.priority"><StarFilled /></el-icon>
            </a>
            <div v-if="activePool === 'TREASURE'" class="sub-text">
              服务到期：<b>{{ row.serviceExpire }}</b>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="客户类型" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="levelTag(row.level)" effect="dark" size="small">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册区域" prop="region" width="100" />
        <el-table-column label="所属行业" prop="industry" width="120" />
        <el-table-column label="来源渠道" prop="source" width="110" />
        <el-table-column label="入池时间" prop="enterTime" width="160" />
        <el-table-column label="入池原因" prop="reason" min-width="180">
          <template #default="{ row }">
            <span class="reason-text">{{ row.reason }}</span>
            <el-tag
              v-if="activePool === 'COLLAB' && row.recycleCount"
              size="small"
              type="warning"
              effect="plain"
              style="margin-left: 6px"
            >
              已回收 {{ row.recycleCount }} 次
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系方式" width="160">
          <template #default="{ row }">
            <span class="masked-phone">
              <el-icon><Phone /></el-icon>
              {{ maskPhone(row.phone) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="activePool === 'COLLAB'"
          label="优先窗口"
          width="140"
        >
          <template #default="{ row }">
            <span v-if="row.level === 'A' && priorityMap[row.id]?.active" class="countdown live">
              <el-icon><Timer /></el-icon>
              {{ priorityMap[row.id].remainSec }} s
            </span>
            <span v-else-if="row.level === 'A'" class="countdown done">
              <el-icon><CircleCheck /></el-icon>
              已开放
            </span>
            <span v-else class="muted-text">—</span>
          </template>
        </el-table-column>
        <el-table-column
          v-if="activePool === 'TREASURE'"
          label="审批"
          width="80"
          align="center"
        >
          <template #default>
            <el-tag size="small" type="warning" effect="plain">需审批</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <template v-if="row.claimed">
              <el-button size="small" disabled>已被领取</el-button>
            </template>
            <template v-else>
              <el-button
                type="primary"
                link
                size="small"
                @click="handleClaim(row)"
              >
                {{ activePool === 'COLLAB' ? '抢单' : '领取' }}
              </el-button>
              <el-button
                v-if="isManager"
                type="success"
                link
                size="small"
                @click="openDistributeDialog(row)"
              >
                分配
              </el-button>
              <el-button type="info" link size="small" @click="viewDetail(row)">详情</el-button>
            </template>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="池内暂无客户数据" />
        </template>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="filteredList.length"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </section>

    <!-- 分配 Dialog -->
    <el-dialog
      v-model="distributeVisible"
      title="分配客户"
      width="520px"
      class="pool-dialog"
      destroy-on-close
    >
      <el-form :model="distributeForm" label-width="90px">
        <el-form-item label="分配数量">
          <el-tag type="primary">{{ distributeForm.leadIds.length }} 个客户</el-tag>
        </el-form-item>
        <el-form-item label="目标销售" required>
          <el-select v-model="distributeForm.toUserId" placeholder="选择销售" style="width: 100%">
            <el-option
              v-for="s in salesList"
              :key="s.id"
              :label="`${s.name}（${s.holding}/${s.max}）`"
              :value="s.id"
              :disabled="s.holding >= s.max"
            >
              <div class="sales-option">
                <span>{{ s.name }}</span>
                <span class="sales-meta">
                  持有 {{ s.holding }}/{{ s.max }}
                  <i class="meter-bar mini">
                    <i class="meter-fill" :style="{ width: (s.holding / s.max * 100) + '%' }"></i>
                  </i>
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分配备注">
          <el-input
            v-model="distributeForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请填写分配说明..."
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="distributeVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmDistribute">确认分配</el-button>
      </template>
    </el-dialog>

    <!-- 藏金阁攻坚计划 Dialog -->
    <el-dialog
      v-model="treasureVisible"
      title="藏金阁领取 · 提交攻坚计划"
      width="560px"
      class="pool-dialog"
      destroy-on-close
    >
      <div class="treasure-tip">
        <el-icon><Warning /></el-icon>
        藏金阁客户为高价值流失客户，领取需提交攻坚计划并经主管审批
      </div>
      <el-form :model="treasureForm" label-width="90px">
        <el-form-item label="目标客户">
          <el-tag type="warning">{{ treasureForm.customer?.name }}</el-tag>
        </el-form-item>
        <el-form-item label="攻坚计划" required>
          <el-input
            v-model="treasureForm.plan"
            type="textarea"
            :rows="6"
            placeholder="请描述：1. 客户痛点分析  2. 切入策略  3. 预计签约周期  4. 资源需求"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="treasureVisible = false">取消</el-button>
        <el-button type="warning" @click="confirmTreasureClaim">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeftBold, ArrowUp, ArrowDown, Search, RefreshLeft, Refresh,
  Download, Pointer, Promotion, User, Coin, Plus, RefreshRight,
  Phone, StarFilled, Timer, Warning, Aim, CircleCheck,
  ChatLineRound, Connection,
  Sunrise, GoldMedal, Lock
} from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { leadApi, distributeApi, collisionApi, holdingApi, poolRulesMock } from '@/api/crm'

const router = useRouter()
const userStore = useUserStore()

function back() {
  router.push('/leads/workbench')
}

// ===== 池配置 =====
type PoolCode = 'PHONE' | 'ONLINE' | 'COLLAB' | 'RECYCLE' | 'NEW' | 'TREASURE' | 'FROZEN'

const pools = ref([
  { code: 'PHONE',    name: '电销公海池',  icon: markRaw(Phone),         count: 0 },
  { code: 'ONLINE',   name: '线上获客池',  icon: markRaw(Connection),    count: 0 },
  { code: 'COLLAB',   name: '协作公海池',  icon: markRaw(ChatLineRound), count: 0 },
  { code: 'RECYCLE',  name: '回收公海池',  icon: markRaw(RefreshRight),  count: 0 },
  { code: 'NEW',      name: '新线索池',    icon: markRaw(Sunrise),       count: 0 },
  { code: 'TREASURE', name: '藏金阁',      icon: markRaw(GoldMedal),     count: 0 },
  { code: 'FROZEN',   name: '冻结库',      icon: markRaw(Lock),          count: 0 }
])

const activePool = ref<PoolCode>('PHONE')

// ===== 角色 =====
const isManager = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('manager') || roles.includes('sales-manager') || roles.length === 0
})

// ===== 静态字典 =====
const regions = [
  '上城区', '拱墅区', '西湖区', '滨江区', '萧山区', '余杭区', '临平区',
  '钱塘区', '富阳区', '临安区', '桐庐县', '淳安县', '建德市'
]
const industries = ['电子商务', '制造业', '餐饮服务', '教育培训', '建筑工程', '医疗健康', '互联网', '物流仓储', '零售贸易', '咨询服务']
const customerTypes = ['代理记账', '工商注册', '税务筹划', '审计鉴证', '商标注册', '资质代办']
const sources = ['百度推广', '抖音获客', '小红书', '老客户转介', '展会获客', '电话陌拜', '官网注册', '微信社群']
const reasonsByPool: Record<PoolCode, string[]> = {
  PHONE:    ['电销外呼自动入池', '15 天未跟进回收', '坐席离职转入'],
  ONLINE:   ['官网表单留资', '抖音线索同步', '小红书私信留资'],
  COLLAB:   ['跨部门转交', '协作攻坚释放', '多次跟进无进展'],
  RECYCLE:  ['超期未签约自动回收', '主动退回公海', '违规跟进强制回收'],
  NEW:      ['今日新入池', '智能清洗后入池', '渠道导入'],
  TREASURE: ['老客户流失保留', '高净值未签约', '战略客户冻结释放'],
  FROZEN:   ['黑名单冻结', '法务争议冻结', '总部锁定']
}

// ===== Mock 数据 =====
interface PoolLead {
  id: number
  poolCode: PoolCode
  name: string
  type: string
  level: 'A' | 'B' | 'C' | 'D'
  region: string
  industry: string
  source: string
  enterTime: string
  reason: string
  phone: string
  claimed: boolean
  serviceExpire?: string
  recycleCount?: number
  priority?: boolean
  priorityCountdown?: string
}

const allLeads = ref<PoolLead[]>([])

const companyPrefixes: string[] = []
const companySuffixes: string[] = []

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randPhone() {
  const prefixes = ['138', '139', '150', '158', '186', '188', '199', '177']
  return rand(prefixes) + String(randInt(10000000, 99999999))
}
function randDate(daysAgo = 60) {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, daysAgo))
  d.setHours(randInt(8, 22), randInt(0, 59), 0)
  return d.toISOString().slice(0, 16).replace('T', ' ')
}
function randExpire() {
  const d = new Date()
  d.setDate(d.getDate() + randInt(-30, 90))
  return d.toISOString().slice(0, 10)
}

function generateMock() {
  return []
}

// V2 种子公海池 id(1~7)→ 页面池 Tab 编码
const POOL_ID_CODE: Record<number, PoolCode> = {
  1: 'PHONE', 2: 'ONLINE', 3: 'COLLAB', 4: 'RECYCLE', 5: 'NEW', 6: 'TREASURE', 7: 'FROZEN'
}
const SOURCE_LABELS: Record<number, string> = {
  1: '官网注册', 2: '电话外呼', 3: '转介绍', 4: '市场活动', 5: '社交媒体'
}

// 后端 CrmLead → 页面 PoolLead 模型
function mapPoolLead(r: any): PoolLead {
  return {
    id: r.id,
    poolCode: POOL_ID_CODE[r.poolId as number] || 'NEW',
    name: r.company || r.name || '',
    type: r.customerType || '企业客户',
    level: (r.customerLevel as PoolLead['level']) || 'C',
    region: r.region || '',
    industry: r.serviceType || '',
    source: SOURCE_LABELS[r.source as number] || '其他',
    enterTime: (r.updateTime || r.createTime || '').slice(0, 16),
    reason: r.lastFollowContent || '新入池',
    phone: r.phone || '',
    claimed: r.ownership === 'private',
    serviceExpire: r.serviceExpireDate || undefined,
    recycleCount: r.recycleCount || undefined
  }
}

// 真实拉取公海线索(后端已按 ownership='pool' 过滤;失败时保持空列表)
async function fetchPoolLeads() {
  loading.value = true
  try {
    const resp: any = await leadApi.poolList({ pageNum: 1, pageSize: 200 })
    const records = resp && (resp.records || resp.list)
    allLeads.value = Array.isArray(records) ? records.map(mapPoolLead) : []
  } catch {
    allLeads.value = []
  } finally {
    refreshPoolCount()
    loading.value = false
  }
}

// 更新 Tab 角标
function refreshPoolCount() {
  pools.value.forEach(p => {
    p.count = allLeads.value.filter(l => l.poolCode === p.code).length
  })
}

// ===== 搜索 =====
const searchOpen = ref(true)
const searchForm = reactive({
  name: '',
  region: '',
  industry: '',
  level: '',
  type: '',
  source: '',
  dateRange: [] as string[]
})

function handleSearch() {
  page.current = 1
}
function handleReset() {
  Object.assign(searchForm, { name: '', region: '', industry: '', level: '', type: '', source: '', dateRange: [] })
  page.current = 1
}

// ===== 列表过滤 / 分页 =====
const loading = ref(false)
const page = reactive({ current: 1, size: 20 })

const filteredList = computed(() => {
  return allLeads.value.filter(l => {
    if (l.poolCode !== activePool.value) return false
    if (searchForm.name && !l.name.includes(searchForm.name)) return false
    if (searchForm.region && l.region !== searchForm.region) return false
    if (searchForm.industry && l.industry !== searchForm.industry) return false
    if (searchForm.level && l.level !== searchForm.level) return false
    if (searchForm.type && l.type !== searchForm.type) return false
    if (searchForm.source && l.source !== searchForm.source) return false
    if (searchForm.dateRange?.length === 2) {
      const t = l.enterTime.slice(0, 10)
      if (t < searchForm.dateRange[0] || t > searchForm.dateRange[1]) return false
    }
    return true
  })
})

const pagedList = computed(() => {
  const s = (page.current - 1) * page.size
  return filteredList.value.slice(s, s + page.size)
})

// ===== 统计 =====
const poolStats = computed(() => {
  const list = allLeads.value.filter(l => l.poolCode === activePool.value)
  const today = new Date().toISOString().slice(0, 10)
  return {
    total: list.length,
    todayIn: list.filter(l => l.enterTime.startsWith(today)).length,
    todayClaim: list.filter(l => l.claimed).length,
    todayRecycle: list.filter(l => l.reason.includes('回收')).length
  }
})

// ===== 持有 =====
const myHolding = ref({ current: 38, max: 80 })
const holdRate = computed(() => Math.min(100, Math.round(myHolding.value.current / myHolding.value.max * 100)))

// ===== 每日抢单计数 =====
const grabState = reactive({ current: 0, limit: 20 })
function refreshGrabState() {
  const userId = userStore.userInfo?.id || 1
  const r = poolRulesMock.checkDailyGrab(userId, 20)
  grabState.current = r.current
  grabState.limit = r.limit
}

// ===== A 级优先窗口实时倒计时 =====
const priorityMap = reactive<Record<number, { active: boolean; remainSec: number }>>({})
let priorityTimer: any = null
function tickPriority() {
  const list = allLeads.value.filter(l => l.poolCode === 'COLLAB' && l.level === 'A')
  list.forEach(l => {
    priorityMap[l.id] = poolRulesMock.getPriorityCountdown(l.id)
  })
}
function startPriorityTimer() {
  if (priorityTimer) return
  // 首次为 A 级客户初始化窗口（如不存在）
  allLeads.value
    .filter(l => l.poolCode === 'COLLAB' && l.level === 'A')
    .forEach(l => {
      const cd = poolRulesMock.getPriorityCountdown(l.id)
      if (!cd.active && (priorityMap[l.id] === undefined)) {
        // 初始注册：随机给 A 级客户分配 0-30s 倒计时（演示效果）
        if (Math.random() < 0.6) poolRulesMock.registerPriorityWindow(l.id, randInt(5, 30))
      }
    })
  tickPriority()
  priorityTimer = setInterval(tickPriority, 1000)
}

// ===== 工具方法 =====
function maskPhone(p: string) {
  if (!p || p.length < 11) return p
  return p.slice(0, 3) + '****' + p.slice(7)
}
function levelTag(lv: string) {
  return ({ A: 'danger', B: 'warning', C: 'primary', D: 'info' } as Record<string, any>)[lv] || 'info'
}
function rowClassName({ row }: { row: PoolLead }) {
  if (row.claimed) return 'row-claimed'
  if (activePool.value === 'COLLAB' && row.level === 'A') return 'row-priority'
  return ''
}

// ===== 选中 / 详情 =====
const selected = ref<PoolLead[]>([])
function onSelectionChange(rows: PoolLead[]) { selected.value = rows }
function viewDetail(row: PoolLead) {
  ElMessageBox.alert(`客户：${row.name}\n等级：${row.level}\n所属池：${pools.value.find(p => p.code === row.poolCode)?.name}\n入池原因：${row.reason}`, '客户详情', { confirmButtonText: '关闭' })
}

// ===== 池切换 =====
function handlePoolChange() {
  page.current = 1
  selected.value = []
}

// ===== 领取 / 抢单 =====
async function handleClaim(row: PoolLead) {
  if (activePool.value === 'TREASURE') {
    treasureForm.customer = row
    treasureForm.plan = ''
    treasureVisible.value = true
    return
  }
  const isGrab = activePool.value === 'COLLAB'
  const userId = userStore.userInfo?.id || 1
  loading.value = true
  try {
    // 1. 秒级锁（防止两人同时点击同一客户）
    const lock = poolRulesMock.acquireClaimLock(row.id, userId, 1500)
    if (!lock.ok) {
      ElMessage.error(`已被销售 #${lock.holderId} 锁定，请稍后`)
      poolRulesMock.appendCollisionEvent({
        leadName: row.name,
        userA: `销售#${lock.holderId}`,
        userB: userStore.userInfo?.username || '当前用户',
        type: 'grab_conflict',
        matchLevel: 'P0',
        matchField: '同时点击',
        resolution: '先到先得（秒级锁）'
      })
      return
    }
    // 2. 15 天冷却期（同一客户被释放后原跟进人不可再抢）
    const cd = poolRulesMock.checkCooldown(userId, row.id)
    if (!cd.canClaim) {
      ElMessage.warning(`您与该客户处于冷却期，剩余 ${cd.remainDays} 天`)
      poolRulesMock.releaseClaimLock(row.id)
      return
    }
    // 3. A 级优先窗口（仅协作池抢单）
    if (isGrab && row.level === 'A') {
      const w = poolRulesMock.getPriorityCountdown(row.id)
      const isHighPerf = (userStore.roles || []).some(r => ['top_sales', 'sales-manager', 'admin'].includes(r))
      if (w.active && !isHighPerf) {
        ElMessage.warning(`A 级客户优先窗口剩余 ${w.remainSec}s，仅高绩效销售可抢`)
        poolRulesMock.releaseClaimLock(row.id)
        return
      }
    }
    // 4. 每日抢单上限（协作池）
    if (isGrab) {
      const dg = poolRulesMock.checkDailyGrab(userId, 20)
      if (!dg.ok) {
        ElMessage.error(`今日抢单已达上限 ${dg.limit} 单`)
        poolRulesMock.releaseClaimLock(row.id)
        return
      }
    }
    // 5. 持有上限校验
    let canClaim = true
    let reason = ''
    try {
      const res: any = await holdingApi.checkLimit(userId)
      canClaim = res?.data?.canClaim ?? true
      reason = res?.data?.reason || ''
    } catch {
      canClaim = myHolding.value.current < myHolding.value.max
      reason = '已达持有上限'
    }
    if (!canClaim) {
      ElMessage.warning(reason || '已达持有上限，无法领取')
      poolRulesMock.releaseClaimLock(row.id)
      return
    }
    // 6. 防撞单校验
    try { await collisionApi.checkDuplicate({ name: row.name, phone: row.phone }) } catch {}
    // 7. 执行领取
    try { await distributeApi.grabLead({ leadId: row.id }) } catch {}
    // 8. 状态更新 & 副作用
    row.claimed = true
    myHolding.value.current += 1
    if (isGrab) {
      poolRulesMock.incrDailyGrab(userId)
      refreshGrabState()
    }
    poolRulesMock.setCooldown(userId, row.id, 15)
    ElMessage.success(isGrab ? '抢单成功，请于 3 天内完成首次跟进' : '领取成功')
    persist()
    poolRulesMock.releaseClaimLock(row.id)
  } finally {
    loading.value = false
  }
}

async function batchClaim() {
  if (!selected.value.length) return
  await ElMessageBox.confirm(`确认${activePool.value === 'COLLAB' ? '抢单' : '领取'} ${selected.value.length} 个客户？`, '提示', { type: 'warning' })
  for (const row of selected.value.slice()) {
    if (!row.claimed) {
      row.claimed = true
      myHolding.value.current += 1
    }
  }
  ElMessage.success('批量操作完成')
  selected.value = []
  persist()
}

// ===== 藏金阁攻坚计划 =====
const treasureVisible = ref(false)
const treasureForm = reactive<{ customer: PoolLead | null; plan: string }>({
  customer: null,
  plan: ''
})
async function confirmTreasureClaim() {
  if (!treasureForm.plan.trim() || treasureForm.plan.length < 20) {
    ElMessage.warning('攻坚计划至少 20 字')
    return
  }
  if (treasureForm.customer) treasureForm.customer.claimed = true
  ElMessage.success('攻坚计划已提交，待主管审批')
  treasureVisible.value = false
  persist()
}

// ===== 分配 =====
const distributeVisible = ref(false)
const distributeForm = reactive<{ leadIds: number[]; toUserId: number | null; remark: string }>({
  leadIds: [],
  toUserId: null,
  remark: ''
})
const salesList = ref([
  { id: 101, name: '张志强', holding: 42, max: 80 },
  { id: 102, name: '李娜',   holding: 67, max: 80 },
  { id: 103, name: '王浩',   holding: 12, max: 60 },
  { id: 104, name: '赵雪',   holding: 80, max: 80 },
  { id: 105, name: '陈思宇', holding: 35, max: 80 },
  { id: 106, name: '刘晓琳', holding: 58, max: 80 }
])
function openDistributeDialog(row?: PoolLead) {
  const ids = row && !Array.isArray(row) ? [row.id] : selected.value.map(s => s.id)
  if (!ids.length) {
    ElMessage.warning('请先勾选客户')
    return
  }
  distributeForm.leadIds = ids
  distributeForm.toUserId = null
  distributeForm.remark = ''
  distributeVisible.value = true
}
async function confirmDistribute() {
  if (!distributeForm.toUserId) {
    ElMessage.warning('请选择目标销售')
    return
  }
  try {
    await distributeApi.manualDistribute({
      leadIds: distributeForm.leadIds,
      toUserId: distributeForm.toUserId
    })
  } catch { /* mock 忽略 */ }
  // 本地状态更新
  allLeads.value
    .filter(l => distributeForm.leadIds.includes(l.id))
    .forEach(l => { l.claimed = true })
  ElMessage.success(`已成功分配 ${distributeForm.leadIds.length} 个客户`)
  distributeVisible.value = false
  selected.value = []
  persist()
}

// ===== 工具栏 =====
function handleRefresh() {
  fetchPoolLeads().then(() => ElMessage.success('已刷新'))
}
function handleExport() {
  ElMessage.success(`已导出 ${filteredList.value.length} 条数据`)
}

function persist() {
  // 已移除 localStorage 模拟数据写入
  refreshPoolCount()
}

onMounted(() => {
  fetchPoolLeads()
  refreshGrabState()
  startPriorityTimer()
})

onUnmounted(() => {
  if (priorityTimer) { clearInterval(priorityTimer); priorityTimer = null }
})
</script>

<style lang="scss" scoped>
.multi-pool {
  --pool-color: #06B6D4;
  --pool-glow: rgba(6, 182, 212, 0.25);
  --gold: #D4AF37;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 4px 32px;
}

/* —— Header —— */
.page-header {
  position: relative;
  padding: 28px 36px 24px;
  background: linear-gradient(135deg, #0F1820 0%, #14222A 100%);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-radius: 14px;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 90% 20%, var(--pool-glow), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--pool-color);
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
  .meta-tag {
    padding: 3px 10px;
    border: 1px solid rgba(6, 182, 212, 0.4);
    border-radius: 2px;
    background: rgba(6, 182, 212, 0.08);
  }
  .meta-divider { width: 24px; height: 1px; background: rgba(6, 182, 212, 0.4); }
  .meta-time { color: rgba(6, 182, 212, 0.6); }
}
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;
  .title-cn { font-size: 30px; font-weight: 700; letter-spacing: 0.04em; color: #F5F5F5; }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 17px;
    color: rgba(6, 182, 212, 0.7);
  }
}
.page-desc { font-size: 13px; color: var(--text-body, #B8B8C0); margin: 0; }
.back-btn {
  position: absolute;
  top: 24px;
  right: 36px;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.3);
  border-radius: 6px;
  color: var(--pool-color);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover { background: rgba(6, 182, 212, 0.18); border-color: rgba(6, 182, 212, 0.6); transform: translateX(-2px); }
}

/* —— Tabs —— */
.pool-tabs-wrap {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(6, 182, 212, 0.18);
  border-radius: 10px;
  padding: 4px 18px 0;
}
:deep(.pool-tabs .el-tabs__item) {
  height: 56px;
  padding: 0 20px;
  color: #B8B8C0;
  &.is-active { color: var(--pool-color); }
}
:deep(.pool-tabs .el-tabs__active-bar) {
  background: var(--pool-color);
  height: 2px;
  box-shadow: 0 0 12px var(--pool-color);
}
:deep(.pool-tabs .el-tabs__nav-wrap::after) { background: rgba(6, 182, 212, 0.12); }
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  .tab-badge { margin-left: 4px; }
  :deep(.el-badge__content) {
    background: rgba(6, 182, 212, 0.18);
    color: var(--pool-color);
    border: 1px solid rgba(6, 182, 212, 0.4);
  }
}
:deep(.is-active .tab-label .el-badge__content) {
  background: var(--pool-color);
  color: #0F1820;
  border-color: var(--pool-color);
}

/* —— Stats —— */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 22px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  background: var(--bg-card, #16161E);
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    opacity: 0.85;
    pointer-events: none;
  }
  &.grad-cyan::before    { background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), transparent 70%); }
  &.grad-emerald::before { background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), transparent 70%); }
  &.grad-amber::before   { background: linear-gradient(135deg, rgba(245, 158, 11, 0.14), transparent 70%); }
  &.grad-rose::before    { background: linear-gradient(135deg, rgba(244, 63, 94, 0.14), transparent 70%); }
  .stat-icon {
    position: relative;
    z-index: 1;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.05);
    color: var(--pool-color);
  }
  &.grad-emerald .stat-icon { color: #10B981; }
  &.grad-amber .stat-icon   { color: #F59E0B; }
  &.grad-rose .stat-icon    { color: #F43F5E; }
  .stat-data { position: relative; z-index: 1; flex: 1; }
  .stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 26px;
    font-weight: 700;
    color: #F5F5F5;
    line-height: 1.1;
  }
  .stat-label { font-size: 12px; color: var(--text-muted, #888); margin-top: 4px; }
  .stat-trend {
    position: relative;
    z-index: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(255, 255, 255, 0.4);
    align-self: flex-start;
    padding-top: 4px;
    &.up { color: #10B981; }
  }
}

/* —— Search Panel —— */
.search-panel {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 10px;
  overflow: hidden;
}
.search-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  cursor: pointer;
  border-bottom: 1px dashed rgba(6, 182, 212, 0.12);
  .search-title {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 14px; font-weight: 600; color: #F5F5F5;
  }
  .search-toggle {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; color: var(--pool-color);
  }
}
.search-panel.collapsed .search-head { border-bottom: none; }
.search-body {
  padding: 18px 18px 8px;
  :deep(.el-form-item__label) { color: #B8B8C0; }
}
.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 4px 0 6px;
}

/* —— Toolbar —— */
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(6, 182, 212, 0.12);
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 12px;
}
.toolbar-left, .toolbar-right { display: flex; align-items: center; gap: 10px; }
.count-tag {
  margin-left: 6px;
  padding: 1px 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.18);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}
.hold-meter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(6, 182, 212, 0.06);
  border: 1px solid rgba(6, 182, 212, 0.2);
  font-size: 12px;
  color: var(--text-body, #B8B8C0);
  b { color: var(--pool-color); font-family: 'JetBrains Mono', monospace; font-size: 14px; }
}
.meter-bar {
  display: inline-block;
  width: 80px;
  height: 5px;
  border-radius: 3px;
  background: rgba(6, 182, 212, 0.12);
  overflow: hidden;
  &.mini { width: 60px; height: 4px; }
  .meter-fill {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #06B6D4, #10B981);
    border-radius: 3px;
    transition: width 0.4s;
  }
}

/* —— Table —— */
.table-wrap {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(6, 182, 212, 0.15);
  border-radius: 10px;
  padding: 14px 16px 16px;
}
:deep(.el-table) {
  background: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-bg-color: transparent;
  --el-table-header-bg-color: rgba(6, 182, 212, 0.06);
  --el-table-border-color: rgba(6, 182, 212, 0.1);
  --el-table-row-hover-bg-color: rgba(6, 182, 212, 0.06);
  color: #D4D4D8;
}
:deep(.el-table th) {
  color: #F5F5F5;
  font-weight: 600;
  border-bottom-color: rgba(6, 182, 212, 0.18) !important;
}
:deep(.el-table td) {
  border-bottom-color: rgba(255, 255, 255, 0.04) !important;
}
:deep(.el-table .row-claimed) {
  opacity: 0.55;
  font-style: italic;
}
:deep(.el-table .row-priority) {
  background: linear-gradient(90deg, rgba(244, 63, 94, 0.08), transparent 80%) !important;
}
.link-name {
  color: var(--pool-color);
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  &:hover { text-decoration: underline; }
  .el-icon { color: #F59E0B; }
}
.sub-text { font-size: 11px; color: var(--text-muted, #888); margin-top: 2px; b { color: #F59E0B; } }
.reason-text { color: #B8B8C0; }
.masked-phone {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  color: #B8B8C0;
  letter-spacing: 0.04em;
}
.countdown {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  font-size: 12px;
  &.live { color: #F43F5E; animation: cd-blink 1s ease-in-out infinite; }
  &.done { color: #10B981; }
}
@keyframes cd-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}

/* —— Rule Banner —— */
.rule-banner {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
  .rule-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    background: rgba(212, 175, 55, 0.05);
    border: 1px solid rgba(212, 175, 55, 0.15);
    border-radius: 4px;
    font-size: 12px;
    color: #B8B8C0;
    .rule-key { color: var(--gold); font-weight: 600; }
    .rule-val { color: #B8B8C0; }
    .icon-cyan { color: #06B6D4; }
    .icon-amber { color: #F59E0B; }
    .icon-rose { color: #F43F5E; }
    .icon-emerald { color: #10B981; }
    .icon-purple { color: #A78BFA; }
  }
}

.grab-meter {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(244, 63, 94, 0.06);
  border: 1px solid rgba(244, 63, 94, 0.2);
  font-size: 12px;
  color: var(--text-body, #B8B8C0);
  b { color: #F43F5E; font-family: 'JetBrains Mono', monospace; font-size: 14px; }
  &.warn {
    background: rgba(244, 63, 94, 0.18);
    animation: cd-blink 1s ease-in-out infinite;
  }
}
.muted-text { color: var(--text-muted, #666); }

.pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next),
:deep(.el-pagination.is-background .el-pager li) {
  background: rgba(6, 182, 212, 0.05);
  color: #B8B8C0;
  &.is-active {
    background: var(--pool-color);
    color: #0F1820;
  }
}

/* —— Dialog —— */
:deep(.pool-dialog) {
  .el-dialog {
    background: #14222A;
    border: 1px solid rgba(6, 182, 212, 0.25);
  }
  .el-dialog__title { color: #F5F5F5; }
  .el-form-item__label { color: #B8B8C0; }
}
.sales-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  .sales-meta {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: var(--text-muted, #888);
  }
}
.treasure-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: rgba(245, 158, 11, 0.08);
  border-left: 3px solid #F59E0B;
  color: #F59E0B;
  font-size: 13px;
  border-radius: 4px;
}

/* —— Responsive —— */
@media (max-width: 1100px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}
</style>

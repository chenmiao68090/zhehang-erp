<template>
  <div class="leads-workbench">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">LEADS · 01</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ greeting }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">运营看板</span>
          <span class="title-en">Operation Dashboard</span>
        </h1>
        <p class="page-desc">数据驱动的运营决策与销售执行中心</p>
      </div>

      <!-- 视图切换 -->
      <div class="view-switch">
        <el-radio-group v-model="viewMode" size="large">
          <el-radio-button label="personal">
            <el-icon><User /></el-icon>
            <span>个人工作台</span>
          </el-radio-button>
          <el-radio-button label="manager">
            <el-icon><DataAnalysis /></el-icon>
            <span>管理层看板</span>
          </el-radio-button>
        </el-radio-group>
      </div>

      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- ==================== 个人工作台 ==================== -->
    <template v-if="viewMode === 'personal'">
      <!-- 欢迎区 + 快捷操作 -->
      <section class="welcome-strip">
        <div class="welcome-info">
          <div class="welcome-avatar">
            <span>{{ currentUser.name.slice(0, 1) }}</span>
          </div>
          <div class="welcome-text">
            <div class="welcome-greet">
              {{ greeting }}，<strong>{{ currentUser.name }}</strong>！
            </div>
            <div class="welcome-sub">
              今日待处理 <em>{{ personal.todoCount }}</em> 项 · 上次登录
              {{ currentUser.lastLogin }}
            </div>
          </div>
        </div>
        <div class="welcome-actions">
          <el-button type="primary" @click="quickFollow">
            <el-icon><EditPen /></el-icon><span>写跟进</span>
          </el-button>
          <el-button @click="goNewCustomer">
            <el-icon><Plus /></el-icon><span>新建客户</span>
          </el-button>
          <el-button @click="goPool">
            <el-icon><OfficeBuilding /></el-icon><span>去公海</span>
          </el-button>
          <el-button @click="quickCall">
            <el-icon><Phone /></el-icon><span>拨打电话</span>
          </el-button>
        </div>
      </section>

      <!-- 我的客户概览 -->
      <section class="overview-section">
        <div class="section-head">
          <h2 class="section-title">我的客户概览</h2>
          <span class="section-sub">PERSONAL · OVERVIEW</span>
        </div>
        <div class="overview-grid">
          <div class="overview-card theme-amber">
            <div class="card-corner top-left"></div>
            <div class="card-corner top-right"></div>
            <div class="card-corner bottom-left"></div>
            <div class="card-corner bottom-right"></div>
            <div class="ov-num">01</div>
            <div class="ov-label">我的客户</div>
            <div class="ov-value">
              <span class="big">{{ personal.holding }}</span>
              <span class="sep">/</span>
              <span class="small">{{ personal.holdingCap }}</span>
            </div>
            <el-progress
              :percentage="(personal.holdingCap ? Math.round((personal.holding / personal.holdingCap) * 100) : 0)"
              :stroke-width="6"
              color="#D4AF37"
              :show-text="false"
            />
            <div class="ov-foot">
              持有率 {{ (personal.holdingCap ? Math.round((personal.holding / personal.holdingCap) * 100) : 0) }}%
            </div>
          </div>

          <div class="overview-card theme-cyan">
            <div class="card-corner top-left"></div>
            <div class="card-corner top-right"></div>
            <div class="card-corner bottom-left"></div>
            <div class="card-corner bottom-right"></div>
            <div class="ov-num">02</div>
            <div class="ov-label">今日待跟进</div>
            <div class="ov-value">
              <span class="big">{{ personal.todayFollow }}</span>
              <span class="unit">个</span>
            </div>
            <div class="ov-trend up">
              <el-icon><ArrowUp /></el-icon>较昨日 +3
            </div>
          </div>

          <div class="overview-card theme-red">
            <div class="card-corner top-left"></div>
            <div class="card-corner top-right"></div>
            <div class="card-corner bottom-left"></div>
            <div class="card-corner bottom-right"></div>
            <div class="ov-num">03</div>
            <div class="ov-label">预警客户</div>
            <div class="ov-value">
              <span class="big alert">{{ personal.warning }}</span>
              <span class="unit">个</span>
            </div>
            <div class="ov-trend warn">
              <el-icon><Warning /></el-icon>需立即处理
            </div>
          </div>

          <div class="overview-card theme-violet">
            <div class="card-corner top-left"></div>
            <div class="card-corner top-right"></div>
            <div class="card-corner bottom-left"></div>
            <div class="card-corner bottom-right"></div>
            <div class="ov-num">04</div>
            <div class="ov-label">本月成交</div>
            <div class="ov-value">
              <span class="big">{{ personal.dealCount }}</span>
              <span class="unit">单</span>
            </div>
            <div class="ov-trend up">
              <el-icon><ArrowUp /></el-icon>金额 ¥{{ formatMoney(personal.dealAmount) }}
            </div>
          </div>
        </div>
      </section>

      <!-- 主体两列 -->
      <section class="two-col">
        <!-- 左列 -->
        <div class="col-main">
          <!-- 今日待跟进列表 -->
          <div class="panel">
            <div class="panel-head">
              <h2 class="section-title">今日待跟进</h2>
              <span class="section-sub">TODAY · FOLLOW LIST</span>
              <div class="panel-actions">
                <el-link type="primary" @click="viewAllFollow">查看全部</el-link>
              </div>
            </div>
            <el-table :data="todayFollowList" stripe class="dark-table" size="default">
              <el-table-column label="紧急度" width="84">
                <template #default="{ row }">
                  <span class="urgency-tag" :class="`urg-${row.urgency}`">
                    {{ urgencyLabel(row.urgency) }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="customer" label="客户名称" min-width="140">
                <template #default="{ row }">
                  <el-link type="primary" :underline="false">{{ row.customer }}</el-link>
                </template>
              </el-table-column>
              <el-table-column label="客户等级" width="96">
                <template #default="{ row }">
                  <span class="grade-tag" :class="`g-${row.grade}`">{{ row.grade }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="plan" label="计划跟进内容" min-width="200" show-overflow-tooltip />
              <el-table-column prop="lastFollow" label="上次跟进" width="130" />
              <el-table-column label="状态" width="96">
                <template #default="{ row }">
                  <el-tag :type="row.status === '逾期' ? 'danger' : 'warning'" size="small" effect="dark">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="primary" link @click="quickFollowRow(row)">快速跟进</el-button>
                  <el-button size="small" link @click="skipRow(row)">跳过</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 今日新分配 -->
          <div class="panel">
            <div class="panel-head">
              <h2 class="section-title">今日新分配</h2>
              <span class="section-sub">NEW · ALLOCATION</span>
            </div>
            <div class="alloc-list">
              <div
                v-for="item in todayAllocList"
                :key="item.id"
                class="alloc-item"
              >
                <div class="alloc-left">
                  <div class="alloc-avatar">{{ item.customer.slice(0, 1) }}</div>
                  <div>
                    <div class="alloc-name">{{ item.customer }}</div>
                    <div class="alloc-meta">
                      <span>{{ item.source }}</span>
                      <span class="dot">·</span>
                      <span>{{ item.from }}</span>
                      <span class="dot">·</span>
                      <span class="time">{{ item.time }}</span>
                    </div>
                  </div>
                </div>
                <el-button size="small" @click="viewCustomer(item)">去查看</el-button>
              </div>
            </div>
          </div>
        </div>

        <!-- 右列 -->
        <div class="col-side">
          <!-- 预警客户 -->
          <div class="panel alert-panel">
            <div class="panel-head">
              <h2 class="section-title alert">
                <el-icon><Warning /></el-icon>预警客户
              </h2>
              <span class="section-sub">WARNING · URGENT</span>
            </div>
            <div class="warn-list">
              <div
                v-for="w in warningList"
                :key="w.id"
                class="warn-item"
                :class="`level-${w.level}`"
              >
                <div class="warn-flag">
                  <span class="flag-light"></span>
                  <span class="flag-text">{{ w.level === 'red' ? '红灯' : '黄灯' }}</span>
                </div>
                <div class="warn-info">
                  <div class="warn-name">{{ w.customer }}</div>
                  <div class="warn-meta">剩余 <em>{{ w.daysLeft }}</em> 天回收</div>
                </div>
                <el-button size="small" type="danger" @click="quickFollowRow(w)">立即跟进</el-button>
              </div>
            </div>
          </div>

          <!-- 业绩概览 -->
          <div class="panel">
            <div class="panel-head">
              <h2 class="section-title">本月业绩</h2>
              <span class="section-sub">MONTHLY · KPI</span>
            </div>
            <div class="kpi-list">
              <div class="kpi-item">
                <div class="kpi-row">
                  <span class="kpi-label">成交目标</span>
                  <span class="kpi-val">{{ personal.kpi.dealNow }}/{{ personal.kpi.dealGoal }}</span>
                </div>
                <el-progress
                  :percentage="(personal.kpi.dealGoal ? Math.round((personal.kpi.dealNow / personal.kpi.dealGoal) * 100) : 0)"
                  :stroke-width="8"
                  color="#D4AF37"
                />
              </div>
              <div class="kpi-item">
                <div class="kpi-row">
                  <span class="kpi-label">跟进目标</span>
                  <span class="kpi-val">{{ personal.kpi.followNow }}/{{ personal.kpi.followGoal }}</span>
                </div>
                <el-progress
                  :percentage="(personal.kpi.followGoal ? Math.round((personal.kpi.followNow / personal.kpi.followGoal) * 100) : 0)"
                  :stroke-width="8"
                  color="#06B6D4"
                />
              </div>
              <div class="kpi-mini">
                <div>
                  <div class="m-label">领取客户</div>
                  <div class="m-val">{{ personal.kpi.receive }}<span>个</span></div>
                </div>
                <div class="m-divider"></div>
                <div>
                  <div class="m-label">转化率</div>
                  <div class="m-val accent">{{ personal.kpi.conversion }}<span>%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>

    <!-- ==================== 管理层看板 ==================== -->
    <template v-else>
      <!-- 公海运营指标 -->
      <section class="metric-block">
        <div class="section-head">
          <h2 class="section-title">公海运营指标</h2>
          <span class="section-sub">POOL · OPERATIONS</span>
          <span class="block-tag">07 INDEXES</span>
        </div>
        <div class="mini-grid grid-7">
          <div v-for="(m, i) in poolMetrics" :key="i" class="mini-card">
            <div class="mc-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="mc-label">{{ m.label }}</div>
            <div class="mc-value">{{ m.value }}<span v-if="m.unit">{{ m.unit }}</span></div>
            <div class="mc-trend" :class="m.trend">
              <el-icon v-if="m.trend === 'up'"><ArrowUp /></el-icon>
              <el-icon v-else-if="m.trend === 'down'"><ArrowDown /></el-icon>
              <span>{{ m.delta }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 销售效能指标 -->
      <section class="metric-block">
        <div class="section-head">
          <h2 class="section-title">销售效能指标</h2>
          <span class="section-sub">SALES · PERFORMANCE</span>
          <span class="block-tag">06 INDEXES</span>
        </div>
        <div class="mini-grid grid-6">
          <div v-for="(m, i) in salesMetrics" :key="i" class="mini-card cyan">
            <div class="mc-num">{{ String(i + 1).padStart(2, '0') }}</div>
            <div class="mc-label">{{ m.label }}</div>
            <div class="mc-value">{{ m.value }}<span v-if="m.unit">{{ m.unit }}</span></div>
            <div class="mc-trend" :class="m.trend">
              <el-icon v-if="m.trend === 'up'"><ArrowUp /></el-icon>
              <el-icon v-else-if="m.trend === 'down'"><ArrowDown /></el-icon>
              <span>{{ m.delta }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 团队对比 + 排行榜 -->
      <section class="two-col">
        <div class="panel col-main">
          <div class="panel-head">
            <h2 class="section-title">团队对比</h2>
            <span class="section-sub">TEAM · COMPARISON</span>
          </div>
          <el-table :data="teamCompareList" class="dark-table" size="default">
            <el-table-column prop="team" label="团队" min-width="120" />
            <el-table-column prop="people" label="人数" width="70" align="center" />
            <el-table-column prop="totalCust" label="总客户" width="84" align="center" />
            <el-table-column prop="avgHold" label="人均持有" width="90" align="center" />
            <el-table-column prop="dailyFollow" label="日均跟进" width="90" align="center" />
            <el-table-column prop="dealNum" label="成交数" width="80" align="center" />
            <el-table-column label="转化率" width="90" align="center">
              <template #default="{ row }">
                <span class="rate-text up">{{ row.conversion }}%</span>
              </template>
            </el-table-column>
            <el-table-column label="回收率" width="90" align="center">
              <template #default="{ row }">
                <span class="rate-text" :class="row.recycle > 10 ? 'down' : 'up'">{{ row.recycle }}%</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel col-side rank-panel">
          <div class="panel-head">
            <h2 class="section-title">个人排行榜</h2>
            <span class="section-sub">TOP 10 · RANK</span>
          </div>
          <el-table :data="rankList" class="dark-table rank-table" size="default" :show-header="true">
            <el-table-column label="排名" width="64">
              <template #default="{ $index }">
                <span class="rank-medal" :class="`rank-${$index + 1}`">
                  <template v-if="$index === 0">🥇</template>
                  <template v-else-if="$index === 1">🥈</template>
                  <template v-else-if="$index === 2">🥉</template>
                  <template v-else>{{ $index + 1 }}</template>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="姓名" min-width="100" />
            <el-table-column prop="team" label="团队" min-width="100" />
            <el-table-column prop="dealNum" label="成交" width="64" align="center" />
            <el-table-column label="转化率" width="80" align="center">
              <template #default="{ row }">
                <span class="rate-text up">{{ row.conversion }}%</span>
              </template>
            </el-table-column>
            <el-table-column prop="punctual" label="及时率" width="76" align="center">
              <template #default="{ row }">{{ row.punctual }}%</template>
            </el-table-column>
            <el-table-column label="本月业绩" width="120" align="right">
              <template #default="{ row }">
                <span class="money">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </section>

      <!-- 公海池 + 渠道转化 -->
      <section class="two-col">
        <div class="panel col-main">
          <div class="panel-head">
            <h2 class="section-title">各公海池概览</h2>
            <span class="section-sub">POOL · BREAKDOWN</span>
          </div>
          <el-table :data="poolList" class="dark-table" size="default">
            <el-table-column prop="name" label="池名称" min-width="140">
              <template #default="{ row }">
                <span class="pool-dot" :style="{ background: row.color }"></span>
                {{ row.name }}
              </template>
            </el-table-column>
            <el-table-column prop="current" label="当前客户数" width="100" align="center" />
            <el-table-column prop="todayAdd" label="今日新增" width="90" align="center" />
            <el-table-column prop="todayReceive" label="今日领取" width="90" align="center" />
            <el-table-column prop="avgStay" label="平均停留" width="90" align="center">
              <template #default="{ row }">{{ row.avgStay }}天</template>
            </el-table-column>
            <el-table-column label="转化率" width="100">
              <template #default="{ row }">
                <div class="bar-cell">
                  <div class="bar-track">
                    <div class="bar-fill" :style="{ width: row.conversion + '%', background: row.color }"></div>
                  </div>
                  <span class="bar-num">{{ row.conversion }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="panel col-side">
          <div class="panel-head">
            <h2 class="section-title">渠道转化率</h2>
            <span class="section-sub">CHANNEL · CONVERSION</span>
          </div>
          <el-table :data="channelList" class="dark-table" size="default">
            <el-table-column prop="channel" label="渠道" min-width="120" />
            <el-table-column prop="entryNum" label="进入" width="70" align="center" />
            <el-table-column prop="dealNum" label="成交" width="70" align="center" />
            <el-table-column label="转化率" width="100">
              <template #default="{ row }">
                <div class="bar-cell">
                  <div class="bar-track">
                    <div class="bar-fill gold" :style="{ width: row.conversion + '%' }"></div>
                  </div>
                  <span class="bar-num">{{ row.conversion }}%</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="cycle" label="周期" width="74" align="center">
              <template #default="{ row }">{{ row.cycle }}天</template>
            </el-table-column>
          </el-table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  EditPen,
  Plus,
  OfficeBuilding,
  Phone,
  Warning,
  ArrowUp,
  ArrowDown,
  DataAnalysis
} from '@element-plus/icons-vue'
// 引用 CRM API（保留扩展点）
import { leadApi, customerApi, followApi, opportunityApi } from '@/api/crm'

const router = useRouter()

const viewMode = ref<'personal' | 'manager'>('personal')

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 6) return '凌晨好'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})

const currentUser = ref({
  name: '张三',
  lastLogin: '今天 08:42'
})

// ============== 个人工作台数据 ==============
const personal = ref({
  todoCount: 0,
  holding: 0,
  holdingCap: 0,
  todayFollow: 0,
  warning: 0,
  dealCount: 0,
  dealAmount: 0,
  kpi: {
    dealNow: 0,
    dealGoal: 0,
    followNow: 0,
    followGoal: 0,
    receive: 0,
    conversion: 0
  }
})

const todayFollowList = ref([])

const warningList = ref([])

const todayAllocList = ref([])

// ============== 管理层看板数据 ==============
const poolMetrics = ref([])

const salesMetrics = ref([])

const teamCompareList = ref([])

const rankList = ref([])

const poolList = ref([])

const channelList = ref([])

// ============== 工具方法 ==============
function urgencyLabel(u: string) {
  return u === 'high' ? '紧急' : u === 'mid' ? '一般' : '低'
}
function formatMoney(n: number) {
  return n.toLocaleString('zh-CN')
}
function quickFollow() {
  ElMessage.success('打开跟进记录窗口')
}
function quickCall() {
  ElMessage.info('正在调用呼叫中心...')
}
function goNewCustomer() {
  router.push('/leads/workbench')
}
function goPool() {
  router.push('/leads/company-pool')
}
function viewAllFollow() {
  router.push('/leads/workbench')
}
function quickFollowRow(row: any) {
  ElMessage.success(`快速跟进：${row.customer}`)
}
function skipRow(row: any) {
  ElMessage.info(`已跳过：${row.customer}`)
}
function viewCustomer(item: any) {
  ElMessage.success(`查看客户：${item.customer}`)
}

// ============== 数据装载工具 ==============
const SOURCE_TEXT: Record<number, string> = { 1: '网站', 2: '电话', 3: '推荐', 4: '广告' }
const STATUS_TEXT: Record<number, string> = { 1: '新建', 2: '跟进中', 3: '已转化', 4: '无效' }

/** 计算保护期剩余天数（protectionExpireDate 为 yyyy-MM-dd） */
function daysUntil(dateStr?: string): number {
  if (!dateStr) return 0
  const target = new Date(`${dateStr}T00:00:00`).getTime()
  const today = new Date(new Date().toDateString()).getTime()
  return Math.round((target - today) / 86400000)
}

/** 将剩余天数映射为预警灯：<=1 天红灯，否则黄灯 */
function warnLevel(daysLeft: number): 'red' | 'yellow' {
  return daysLeft <= 1 ? 'red' : 'yellow'
}

/** 将下次跟进时间映射为紧急度：逾期 high / 今天 mid / 其他 low */
function calcUrgency(nextFollow?: string): 'high' | 'mid' | 'low' {
  if (!nextFollow) return 'high' // 从未设置/从未跟进，最紧急
  const d = daysUntil(nextFollow)
  if (d < 0) return 'high'
  if (d === 0) return 'mid'
  return 'low'
}

function fmtDate(s?: string): string {
  return s ? s.slice(0, 16).replace('T', ' ') : '-'
}

/** 个人工作台：转化汇总、我的客户数、今日待跟进、回收预警 */
async function loadPersonal() {
  // 转化率汇总（数据范围内：电销看自己 / 主管看部门）
  try {
    const res: any = await leadApi.conversionStats()
    const s = res?.data || {}
    personal.value.dealCount = Number(s.converted) || 0
    personal.value.kpi.dealNow = Number(s.converted) || 0
    personal.value.kpi.followNow = Number(s.converting) || 0
    personal.value.kpi.conversion = Number(s.conversionRate) || 0
    // 目标暂无后端配置：以「总线索」为成交目标分母、转化中为跟进目标分母，保证进度条可渲染
    personal.value.kpi.dealGoal = Number(s.total) || 0
    personal.value.kpi.followGoal = (Number(s.converting) || 0) + (Number(s.newLeads) || 0)
  } catch { /* 静默：保持占位 */ }

  // 我的客户数（数据范围内客户总数）
  try {
    const res: any = await customerApi.list({ pageNum: 1, pageSize: 1 })
    personal.value.holding = Number(res?.data?.total) || 0
    personal.value.kpi.receive = personal.value.holding
  } catch { /* ignore */ }

  // 今日待跟进列表
  try {
    const res: any = await leadApi.todoFollow({ pageNum: 1, pageSize: 20 })
    const records: any[] = res?.data?.records || []
    personal.value.todayFollow = Number(res?.data?.total) || 0
    personal.value.todoCount = Number(res?.data?.total) || 0
    todayFollowList.value = records.map((r) => ({
      id: r.id,
      customer: r.company || r.name,
      grade: r.customerLevel || 'C',
      plan: r.lastFollowContent || '待制定跟进计划',
      lastFollow: fmtDate(r.lastFollowTime),
      status: r.nextFollowTime && daysUntil(r.nextFollowTime) < 0 ? '逾期' : '待跟进',
      urgency: calcUrgency(r.nextFollowTime)
    }))
  } catch { /* ignore */ }

  // 回收预警列表
  try {
    const res: any = await leadApi.recycleWarning({ pageNum: 1, pageSize: 20 })
    const records: any[] = res?.data?.records || []
    personal.value.warning = Number(res?.data?.total) || 0
    warningList.value = records.map((r) => {
      const daysLeft = daysUntil(r.protectionExpireDate)
      return {
        id: r.id,
        customer: r.company || r.name,
        level: warnLevel(daysLeft),
        daysLeft: Math.max(daysLeft, 0)
      }
    })
  } catch { /* ignore */ }
}

/** 管理层看板：用现有 CRM 接口能拿到的真实聚合（转化汇总 + 商机漏斗 + 客户/线索总数）填充指标卡。
 * 团队对比 / 个人排行 / 公海池明细 / 渠道转化暂无对应后端接口，保持空表占位。 */
async function loadManager() {
  const metrics: any[] = []
  try {
    const res: any = await leadApi.conversionStats()
    const s = res?.data || {}
    metrics.push(
      { label: '线索总数', value: Number(s.total) || 0, unit: '', trend: '', delta: '' },
      { label: '新建线索', value: Number(s.newLeads) || 0, unit: '', trend: '', delta: '' },
      { label: '跟进中', value: Number(s.converting) || 0, unit: '', trend: '', delta: '' },
      { label: '已转化', value: Number(s.converted) || 0, unit: '', trend: 'up', delta: '' },
      { label: '无效线索', value: Number(s.invalid) || 0, unit: '', trend: '', delta: '' },
      { label: '转化率', value: Number(s.conversionRate) || 0, unit: '%', trend: 'up', delta: '' }
    )
  } catch { /* ignore */ }

  // 公海运营指标：用线索阶段分布(真实)填充，其余无对应接口保持占位
  poolMetrics.value = metrics.slice(0, 5)
  // 销售效能指标：商机漏斗各阶段数量(真实聚合)
  try {
    const res: any = await opportunityApi.funnel()
    const funnel: any[] = res?.data || []
    salesMetrics.value = funnel.map((f) => ({
      label: f.stageName,
      value: Number(f.count) || 0,
      unit: '',
      trend: '',
      delta: ''
    }))
  } catch {
    salesMetrics.value = metrics // 漏斗取不到时退回转化指标，避免空白
  }
}

onMounted(() => {
  loadPersonal()
  loadManager()
})
</script>

<style lang="scss" scoped>
.leads-workbench {
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
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
      radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.12), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--gold-primary, #D4AF37);
  margin-bottom: 14px;
  position: relative;
  z-index: 1;
}
.meta-tag {
  padding: 3px 10px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 2px;
  background: rgba(212, 175, 55, 0.06);
}
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }

.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 10px;
  .title-cn {
    font-size: 34px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 18px;
    color: rgba(212, 175, 55, 0.55);
  }
}
.page-desc {
  font-size: 14px;
  color: var(--text-body, #B8B8C0);
  letter-spacing: 0.04em;
  margin: 0;
}

.view-switch {
  position: absolute;
  top: 32px;
  right: 36px;
  z-index: 2;

  :deep(.el-radio-button__inner) {
    background: rgba(20, 20, 28, 0.85);
    border-color: rgba(212, 175, 55, 0.32);
    color: rgba(212, 175, 55, 0.7);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 10px 18px;
  }
  :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.95), rgba(180, 140, 30, 0.95));
    border-color: #D4AF37;
    color: #1A1A24;
    box-shadow: 0 4px 14px -4px rgba(212, 175, 55, 0.6);
  }
}

.header-decor {
  position: absolute;
  right: 36px;
  bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1;

  .decor-line {
    width: 64px; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5));
    &.short { width: 18px; }
  }
  .decor-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--gold-primary, #D4AF37);
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.6);
  }
}

/* —— Section Head —— */
.section-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 16px;
  padding-left: 4px;
  flex-wrap: wrap;
}
.section-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  margin: 0;
  position: relative;
  padding-left: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%);
    width: 4px; height: 16px;
    background: var(--gold-primary, #D4AF37);
    border-radius: 1px;
  }
  &.alert { color: #FF6B6B; &::before { background: #FF6B6B; } }
}
.section-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(212, 175, 55, 0.4);
}
.block-tag {
  margin-left: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(212, 175, 55, 0.5);
  padding: 3px 10px;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 2px;
}

/* —— Welcome Strip —— */
.welcome-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 22px 28px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.08), transparent 40%);
    pointer-events: none;
  }
}
.welcome-info { display: flex; align-items: center; gap: 18px; position: relative; z-index: 1; }
.welcome-avatar {
  width: 56px; height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #D4AF37, #8B6F1A);
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 600;
  color: #16161E;
  box-shadow: 0 6px 18px -6px rgba(212, 175, 55, 0.7);
}
.welcome-greet {
  font-size: 18px;
  color: var(--text-primary, #F5F5F5);
  letter-spacing: 0.04em;
  strong { color: #D4AF37; font-weight: 600; }
}
.welcome-sub {
  margin-top: 6px;
  font-size: 13px;
  color: var(--text-muted, #888);
  em {
    font-style: normal;
    font-family: 'JetBrains Mono', monospace;
    color: #FF9F43;
    font-weight: 600;
    margin: 0 2px;
  }
}
.welcome-actions { display: flex; gap: 10px; position: relative; z-index: 1; }

/* —— Overview Cards —— */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.overview-card {
  position: relative;
  padding: 22px 22px 18px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s, border-color 0.3s, box-shadow 0.3s;

  &::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(circle at 100% 0%, var(--accent-glow, rgba(212, 175, 55, 0.18)), transparent 55%);
    pointer-events: none;
    transition: opacity 0.4s;
  }
  &:hover {
    transform: translateY(-3px);
    border-color: var(--accent-strong);
    box-shadow: 0 10px 28px -12px var(--accent-strong);
  }

  &.theme-amber { --accent-strong: rgba(245, 158, 11, 0.7); --accent-glow: rgba(245, 158, 11, 0.18); }
  &.theme-cyan { --accent-strong: rgba(6, 182, 212, 0.7); --accent-glow: rgba(6, 182, 212, 0.18); }
  &.theme-violet { --accent-strong: rgba(167, 139, 250, 0.7); --accent-glow: rgba(167, 139, 250, 0.18); }
  &.theme-red {
    --accent-strong: rgba(239, 68, 68, 0.7); --accent-glow: rgba(239, 68, 68, 0.22);
    border-color: rgba(239, 68, 68, 0.32);
  }

  .ov-num {
    position: absolute; top: 14px; right: 18px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.2em;
    color: rgba(212, 175, 55, 0.4);
  }
  .ov-label { font-size: 13px; color: var(--text-muted, #888); margin-bottom: 10px; letter-spacing: 0.04em; }
  .ov-value {
    display: flex; align-items: baseline; gap: 4px;
    font-family: 'JetBrains Mono', monospace;
    margin-bottom: 12px;
    .big { font-size: 32px; font-weight: 700; color: #D4AF37; line-height: 1; }
    .big.alert { color: #FF6B6B; }
    .sep { font-size: 18px; color: rgba(212, 175, 55, 0.4); }
    .small { font-size: 18px; color: var(--text-muted); }
    .unit { font-size: 13px; color: var(--text-muted); margin-left: 4px; }
  }
  .ov-trend {
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; color: var(--text-muted);
    &.up { color: #10B981; }
    &.warn { color: #FF6B6B; }
  }
  .ov-foot { font-size: 12px; color: var(--text-muted); margin-top: 6px; }
}

/* —— Card Corners (shared) —— */
.card-corner {
  position: absolute;
  width: 12px; height: 12px;
  border: 1px solid rgba(212, 175, 55, 0.35);
  z-index: 2;
  &.top-left { top: 6px; left: 6px; border-right: none; border-bottom: none; }
  &.top-right { top: 6px; right: 6px; border-left: none; border-bottom: none; }
  &.bottom-left { bottom: 6px; left: 6px; border-right: none; border-top: none; }
  &.bottom-right { bottom: 6px; right: 6px; border-left: none; border-top: none; }
}

/* —— Two Column Layout —— */
.two-col {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}
.col-main, .col-side { display: flex; flex-direction: column; gap: 18px; min-width: 0; }

/* —— Panel —— */
.panel {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 12px;
  padding: 20px 22px 22px;
  position: relative;
}
.panel-head {
  display: flex;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 14px;
  flex-wrap: wrap;
  .panel-actions { margin-left: auto; }
}
.alert-panel {
  border-color: rgba(239, 68, 68, 0.35);
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.06), var(--bg-card, #16161E) 60%);
}

/* —— Dark Table —— */
.dark-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(212, 175, 55, 0.06);
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.04);
  --el-table-border-color: rgba(212, 175, 55, 0.08);
  --el-table-text-color: #D5D5DC;
  --el-table-header-text-color: rgba(212, 175, 55, 0.85);
  background: transparent;
  font-size: 13px;

  :deep(th.el-table__cell) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    font-weight: 500;
  }
  :deep(.el-table__inner-wrapper::before) { display: none; }
}

/* —— 紧急/等级 Tag —— */
.urgency-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 2px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.1em;
  &.urg-high { background: rgba(239, 68, 68, 0.16); color: #FF6B6B; border: 1px solid rgba(239, 68, 68, 0.4); }
  &.urg-mid { background: rgba(245, 158, 11, 0.14); color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.4); }
  &.urg-low { background: rgba(107, 114, 128, 0.14); color: #9CA3AF; border: 1px solid rgba(107, 114, 128, 0.4); }
}
.grade-tag {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  font-size: 12px; font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  &.g-A { background: linear-gradient(135deg, #D4AF37, #8B6F1A); color: #1A1A24; }
  &.g-B { background: rgba(6, 182, 212, 0.2); color: #06B6D4; border: 1px solid #06B6D4; }
  &.g-C { background: rgba(167, 139, 250, 0.16); color: #A78BFA; border: 1px solid rgba(167, 139, 250, 0.4); }
}

/* —— 预警列表 —— */
.warn-list { display: flex; flex-direction: column; gap: 10px; }
.warn-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.04);
  border: 1px solid rgba(239, 68, 68, 0.18);

  &.level-yellow {
    background: rgba(245, 158, 11, 0.05);
    border-color: rgba(245, 158, 11, 0.25);
    .flag-light { background: #F59E0B; box-shadow: 0 0 10px #F59E0B; }
    .flag-text { color: #F59E0B; }
  }
}
.warn-flag {
  display: flex; align-items: center; gap: 6px;
  min-width: 60px;
  .flag-light {
    width: 8px; height: 8px; border-radius: 50%;
    background: #FF6B6B;
    box-shadow: 0 0 10px #FF6B6B;
    animation: pulse 1.6s infinite;
  }
  .flag-text {
    font-size: 11px; letter-spacing: 0.08em;
    color: #FF6B6B;
    font-family: 'JetBrains Mono', monospace;
  }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}
.warn-info { flex: 1; min-width: 0; }
.warn-name { font-size: 13px; color: var(--text-primary, #F5F5F5); margin-bottom: 2px; }
.warn-meta {
  font-size: 12px; color: var(--text-muted, #888);
  em {
    font-style: normal; font-weight: 600;
    color: #FF6B6B;
    font-family: 'JetBrains Mono', monospace;
  }
}

/* —— 今日新分配 —— */
.alloc-list { display: flex; flex-direction: column; gap: 8px; }
.alloc-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.08);
  transition: background 0.3s, border-color 0.3s;
  &:hover { background: rgba(212, 175, 55, 0.06); border-color: rgba(212, 175, 55, 0.2); }
}
.alloc-left { display: flex; align-items: center; gap: 12px; }
.alloc-avatar {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.3), rgba(6, 182, 212, 0.1));
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: #06B6D4;
  display: flex; align-items: center; justify-content: center;
  font-weight: 600;
}
.alloc-name { font-size: 14px; color: var(--text-primary, #F5F5F5); margin-bottom: 4px; }
.alloc-meta {
  font-size: 12px; color: var(--text-muted, #888);
  display: flex; align-items: center; gap: 6px;
  .dot { color: rgba(212, 175, 55, 0.3); }
  .time { color: rgba(212, 175, 55, 0.5); font-family: 'JetBrains Mono', monospace; }
}

/* —— KPI —— */
.kpi-list { display: flex; flex-direction: column; gap: 18px; }
.kpi-row {
  display: flex; justify-content: space-between;
  font-size: 13px; margin-bottom: 6px;
  .kpi-label { color: var(--text-muted, #888); }
  .kpi-val {
    font-family: 'JetBrains Mono', monospace;
    color: #D4AF37; font-weight: 600;
  }
}
.kpi-mini {
  display: flex; align-items: center;
  margin-top: 8px;
  padding: 14px 0;
  border-top: 1px dashed rgba(212, 175, 55, 0.16);
  > div:not(.m-divider) { flex: 1; text-align: center; }
  .m-label { font-size: 12px; color: var(--text-muted, #888); margin-bottom: 6px; }
  .m-val {
    font-family: 'JetBrains Mono', monospace;
    font-size: 22px; font-weight: 700;
    color: #F5F5F5;
    span { font-size: 12px; color: var(--text-muted); margin-left: 2px; }
    &.accent { color: #10B981; }
  }
  .m-divider {
    width: 1px; height: 32px;
    background: rgba(212, 175, 55, 0.16);
  }
}

/* —— 管理层 Mini Cards —— */
.metric-block { display: flex; flex-direction: column; gap: 14px; }
.mini-grid {
  display: grid; gap: 12px;
  &.grid-7 { grid-template-columns: repeat(7, 1fr); }
  &.grid-6 { grid-template-columns: repeat(6, 1fr); }
}
.mini-card {
  position: relative;
  padding: 16px 14px 14px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.05), var(--bg-card, #16161E) 70%);
  border: 1px solid rgba(212, 175, 55, 0.16);
  border-radius: 10px;
  overflow: hidden;
  transition: transform 0.3s, border-color 0.3s;

  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    opacity: 0.5;
  }
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.4);
  }
  &.cyan {
    background: linear-gradient(180deg, rgba(6, 182, 212, 0.05), var(--bg-card, #16161E) 70%);
    border-color: rgba(6, 182, 212, 0.16);
    &::before { background: linear-gradient(90deg, transparent, #06B6D4, transparent); }
    &:hover { border-color: rgba(6, 182, 212, 0.4); }
    .mc-value { color: #06B6D4; }
  }

  .mc-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.18em;
    color: rgba(212, 175, 55, 0.4);
    margin-bottom: 6px;
  }
  .mc-label {
    font-size: 12px;
    color: var(--text-muted, #888);
    margin-bottom: 8px;
    letter-spacing: 0.04em;
  }
  .mc-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 700;
    color: #D4AF37;
    line-height: 1;
    span { font-size: 12px; color: var(--text-muted); margin-left: 2px; }
  }
  .mc-trend {
    margin-top: 8px;
    display: inline-flex; align-items: center; gap: 3px;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    color: var(--text-muted);
    &.up { color: #10B981; }
    &.down { color: #FF6B6B; }
  }
}

/* —— Rate / Money Text —— */
.rate-text {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  &.up { color: #10B981; }
  &.down { color: #FF6B6B; }
}
.money {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #D4AF37;
}

/* —— Rank Table —— */
.rank-medal {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px;
  border-radius: 50%;
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  background: rgba(212, 175, 55, 0.06);
  color: rgba(212, 175, 55, 0.6);

  &.rank-1 {
    background: linear-gradient(135deg, #FFD700, #B8860B);
    color: #1A1A24;
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
  }
  &.rank-2 {
    background: linear-gradient(135deg, #E5E4E2, #A8A8A8);
    color: #1A1A24;
    box-shadow: 0 0 10px rgba(229, 228, 226, 0.4);
  }
  &.rank-3 {
    background: linear-gradient(135deg, #CD7F32, #8B4513);
    color: #FFF;
    box-shadow: 0 0 10px rgba(205, 127, 50, 0.4);
  }
}
.rank-panel :deep(.el-table__row:nth-child(-n+3)) {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.05), transparent);
}

/* —— Pool Dot / Bar —— */
.pool-dot {
  display: inline-block;
  width: 8px; height: 8px;
  border-radius: 50%;
  margin-right: 8px;
  vertical-align: middle;
}
.bar-cell {
  display: flex; align-items: center; gap: 8px;
  .bar-track {
    flex: 1;
    height: 6px;
    background: rgba(212, 175, 55, 0.08);
    border-radius: 3px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
    &.gold { background: linear-gradient(90deg, #8B6F1A, #D4AF37); }
  }
  .bar-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #D4AF37;
    min-width: 36px;
    text-align: right;
  }
}

/* —— Responsive —— */
@media (max-width: 1400px) {
  .mini-grid.grid-7 { grid-template-columns: repeat(4, 1fr); }
  .mini-grid.grid-6 { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 1100px) {
  .overview-grid { grid-template-columns: repeat(2, 1fr); }
  .two-col { grid-template-columns: 1fr; }
  .mini-grid.grid-7, .mini-grid.grid-6 { grid-template-columns: repeat(2, 1fr); }
  .view-switch { position: static; margin-top: 14px; }
}
@media (max-width: 720px) {
  .welcome-strip { flex-direction: column; align-items: flex-start; }
  .welcome-actions { flex-wrap: wrap; }
  .overview-grid { grid-template-columns: 1fr; }
}
</style>

<template>
  <div class="distribute-config">
    <!-- ========= Header ========= -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">线索 · 03 · 分配引擎</span>
        <span class="meta-divider"></span>
        <span class="meta-time">Distribution / Weighted Round-Robin</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">分配配置</span>
          <span class="title-en">Distribution Engine</span>
        </h1>
        <p class="page-desc">加权轮询分配算法 · 渠道路由 · 历史日志</p>
      </div>

      <button class="back-btn" @click="back">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回工作台</span>
      </button>
    </header>

    <section class="rule-overview">
      <div
        v-for="item in overviewCards"
        :key="item.label"
        class="overview-card"
      >
        <div class="overview-label">{{ item.label }}</div>
        <div class="overview-value">{{ item.value }}</div>
        <div class="overview-sub">{{ item.sub }}</div>
      </div>
    </section>

    <!-- ========= Tabs ========= -->
    <el-tabs v-model="activeTab" class="cfg-tabs">
      <!-- =========================================== -->
      <!-- 标签页 1：权重配置                            -->
      <!-- =========================================== -->
      <el-tab-pane name="weight">
        <template #label>
          <span class="tab-label"><span class="tab-num">01</span>权重配置</span>
        </template>

        <!-- 1.1 权重因子配置 -->
        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">权重因子配置</h2>
            <div class="card-sub">Weight Factors · 总和必须为 100%</div>
            <div class="sum-badge" :class="{ 'is-error': sumInvalid }">
              <span class="sum-label">SUM</span>
              <span class="sum-num">{{ weightSum }}</span>
              <span class="sum-unit">%</span>
            </div>
          </header>

          <div class="slider-grid">
            <div
              v-for="item in weightFactors"
              :key="item.key"
              class="slider-row"
            >
              <div class="slider-meta">
                <div class="slider-name">
                  <span class="name-cn">{{ item.label }}</span>
                  <span class="name-pct">{{ weightForm[item.key] }}%</span>
                </div>
                <p class="slider-desc">{{ item.desc }}</p>
              </div>
              <div class="slider-track">
                <el-slider
                  v-model="weightForm[item.key]"
                  :min="0"
                  :max="100"
                  :step="1"
                  show-input
                  :show-input-controls="false"
                />
              </div>
            </div>
          </div>

          <div v-if="sumInvalid" class="warning-bar">
            <el-icon><WarningFilled /></el-icon>
            <span>四项权重之和当前为 {{ weightSum }}%，必须等于 100% 才能保存。</span>
          </div>
        </section>

        <!-- 1.2 职级基础权重 -->
        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">职级基础权重</h2>
            <div class="card-sub">Role Base Weight · 不同职级获得的基础权重分值</div>
          </header>
          <el-table :data="roleWeightList" class="dark-table" stripe border>
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column prop="label" label="角色职级" min-width="160">
              <template #default="{ row }">
                <span class="src-pill">{{ row.label }}</span>
              </template>
            </el-table-column>
            <el-table-column label="基础权重" width="180" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.weight" :min="1" :max="5" :step="1" controls-position="right" size="small" />
              </template>
            </el-table-column>
            <el-table-column label="限额参考" min-width="180" align="center">
              <template #default="{ row }">
                <span class="weight-bar">
                  <i :style="{ width: (row.weight / 5 * 100) + '%' }"></i>
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="hint" label="说明" min-width="260" />
          </el-table>
        </section>

        <!-- 1.3 负载计算公式 -->
        <section class="cfg-card formula-card">
          <header class="card-head">
            <h2 class="card-title">负载调整公式</h2>
            <div class="card-sub">Load Adjustment · 空闲越多权重越高</div>
          </header>
          <div class="formula-block">
            <span class="f-var">空闲系数</span>
            <span class="f-eq">=</span>
            <span class="f-num">1</span>
            <span class="f-op">−</span>
            <span class="f-frac">
              <span class="f-top">当前持有量</span>
              <span class="f-line"></span>
              <span class="f-bot">最大容量</span>
            </span>
          </div>
          <div class="formula-examples">
            <div class="fe-item">
              <div class="fe-label">示例 1</div>
              <div class="fe-val">持有 30 / 80： 1 - 30/80 = <b>0.63</b></div>
            </div>
            <div class="fe-item">
              <div class="fe-label">示例 2</div>
              <div class="fe-val">持有 60 / 80： 1 - 60/80 = <b>0.25</b></div>
            </div>
            <div class="fe-item">
              <div class="fe-label">示例 3</div>
              <div class="fe-val">持有 78 / 80： 1 - 78/80 = <b>0.03</b></div>
            </div>
          </div>
        </section>

        <!-- 1.4 能力评定规则 -->
        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">能力系数评定规则</h2>
            <div class="card-sub">Ability Score · 近 30 天转化率排名</div>
          </header>
          <div class="ability-grid">
            <div class="ab-card top">
              <div class="ab-rank">TOP 20%</div>
              <div class="ab-score">3 分</div>
              <div class="ab-desc">高绩效销售 · 优先分配高价值客户</div>
            </div>
            <div class="ab-card mid">
              <div class="ab-rank">20% - 50%</div>
              <div class="ab-score">2 分</div>
              <div class="ab-desc">中等绩效 · 均衡分配一般客户</div>
            </div>
            <div class="ab-card low">
              <div class="ab-rank">后 50%</div>
              <div class="ab-score">1 分</div>
              <div class="ab-desc">绩效偏低 · 限额分配较多潜在客户</div>
            </div>
          </div>
        </section>

        <!-- 1.2 分配模式设置 -->
        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">分配模式设置</h2>
            <div class="card-sub">Pool Allocation Mode · 每个公海池独立配置</div>
          </header>

          <div class="mode-table">
            <div class="mode-thead">
              <div>公海池</div>
              <div>分配模式</div>
              <div>说明</div>
            </div>
            <div
              v-for="(row, idx) in poolModeList"
              :key="row.poolKey"
              class="mode-row"
            >
              <div class="mode-cell pool-cell">
                <span class="pool-idx">{{ String(idx + 1).padStart(2, '0') }}</span>
                <span class="pool-name">{{ row.poolName }}</span>
              </div>
              <div class="mode-cell">
                <el-radio-group v-model="row.distributeMode" size="small">
                  <el-radio-button value="auto">自动分配</el-radio-button>
                  <el-radio-button value="manual">主管手动</el-radio-button>
                  <el-radio-button value="grab">主动抢单</el-radio-button>
                  <el-radio-button value="approval">审批制</el-radio-button>
                </el-radio-group>
              </div>
              <div class="mode-cell mode-desc">{{ row.description }}</div>
            </div>
          </div>
        </section>

        <!-- 1.3 抢单规则配置 -->
        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">抢单规则配置</h2>
            <div class="card-sub">Grab Rules · 公平性与时效保障</div>
          </header>

          <div class="rules-grid">
            <div class="rule-item">
              <div class="rule-label">每人每日抢单上限</div>
              <el-input-number v-model="grabRules.dailyLimit" :min="1" :max="999" controls-position="right" />
              <div class="rule-unit">条 / 天</div>
              <p class="rule-tip">单个销售每日抢单数量上限，避免资源垄断</p>
            </div>
            <div class="rule-item">
              <div class="rule-label">同一客户重复领取冷却期</div>
              <el-input-number v-model="grabRules.cooldownDays" :min="0" :max="365" controls-position="right" />
              <div class="rule-unit">天</div>
              <p class="rule-tip">同一客户被释放后，原跟进人冷却期内不可再抢</p>
            </div>
            <div class="rule-item">
              <div class="rule-label">A 级客户优先窗口</div>
              <el-input-number v-model="grabRules.priorityWindow" :min="0" :max="3600" controls-position="right" />
              <div class="rule-unit">秒</div>
              <p class="rule-tip">A 级客户进入公海后，前 N 秒仅高绩效销售可见</p>
            </div>
            <div class="rule-item">
              <div class="rule-label">抢单后首次跟进期限</div>
              <el-input-number v-model="grabRules.firstFollowDays" :min="1" :max="60" controls-position="right" />
              <div class="rule-unit">天</div>
              <p class="rule-tip">超期未跟进将自动回收至公海池</p>
            </div>
          </div>
        </section>
      </el-tab-pane>

      <!-- =========================================== -->
      <!-- 标签页 2：渠道路由                            -->
      <!-- =========================================== -->
      <el-tab-pane name="channel">
        <template #label>
          <span class="tab-label"><span class="tab-num">02</span>渠道路由</span>
        </template>

        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">客户来源 → 公海池映射</h2>
            <div class="card-sub">Channel Routing · 入库时自动按渠道路由到目标池</div>
          </header>

          <div class="flow-strip">
            <div
              v-for="(step, index) in routeFlow"
              :key="step.title"
              class="flow-step"
            >
              <span class="flow-index">{{ index + 1 }}</span>
              <div>
                <strong>{{ step.title }}</strong>
                <p>{{ step.desc }}</p>
              </div>
            </div>
          </div>

          <el-table
            :data="channelRoutes"
            class="dark-table"
            stripe
            border
            >
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column label="启用" width="90" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column prop="source" label="客户来源" min-width="160">
              <template #default="{ row }">
                <div class="source-cell">
                  <span class="src-pill">{{ row.source }}</span>
                  <small>{{ row.sourceType }}</small>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="targetPool" label="默认路由目标" min-width="180">
              <template #default="{ row }">
                <el-select v-model="row.targetPool" size="small" style="width: 100%">
                  <el-option
                    v-for="opt in poolOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column prop="ownerTeam" label="承接团队" min-width="130" />
            <el-table-column prop="distributeMode" label="分配方式" min-width="160">
              <template #default="{ row }">
                <el-select v-model="row.distributeMode" size="small" style="width: 100%">
                  <el-option label="自动分配" value="auto" />
                  <el-option label="主管手动" value="manual" />
                  <el-option label="主动抢单" value="grab" />
                  <el-option label="审批制" value="approval" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="今日入库" width="110" align="center">
              <template #default="{ row }">
                <span class="metric-number">{{ row.dailyLeads }}</span>
              </template>
            </el-table-column>
            <el-table-column label="CRM / 成交" width="150" align="center">
              <template #default="{ row }">
                <div class="conversion-mini">
                  <b>{{ row.crmCount }}</b>
                  <span>/</span>
                  <b>{{ row.dealCount }}</b>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="avgResponse" label="响应 SLA" width="120" align="center" />
            <el-table-column prop="priority" label="优先级" width="110" align="center">
              <template #default="{ row }">
                <el-tag size="small" :type="priorityTagType(row.priority)">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="说明" min-width="220">
              <template #default="{ row }">
                <el-input v-model="row.remark" size="small" placeholder="备注说明" />
              </template>
            </el-table-column>
          </el-table>

          <div class="linkage-note">
            <el-icon><InfoFilled /></el-icon>
            <span>分配配置是唯一主配置:线索入库先做主体防撞,再按来源进入目标池,最后按权重、负载、能力和提成差异分配给承接团队。</span>
          </div>
        </section>
      </el-tab-pane>

      <!-- =========================================== -->
      <!-- 标签页 3：分配日志                            -->
      <!-- =========================================== -->
      <el-tab-pane name="log">
        <template #label>
          <span class="tab-label"><span class="tab-num">03</span>分配日志</span>
        </template>

        <section class="cfg-card">
          <header class="card-head">
            <h2 class="card-title">历史分配记录</h2>
            <div class="card-sub">Distribution Log · 算法决策可追溯</div>
          </header>

          <div class="log-filter">
            <el-date-picker
              v-model="logQuery.dateRange"
              type="daterange"
              range-separator="→"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              value-format="YYYY-MM-DD"
              size="default"
              style="width: 280px"
            />
            <el-select
              v-model="logQuery.distributeType"
              placeholder="分配类型"
              clearable
              style="width: 160px"
            >
              <el-option label="自动分配" value="auto" />
              <el-option label="主管手动" value="manual" />
              <el-option label="主动抢单" value="grab" />
              <el-option label="转移" value="transfer" />
              <el-option label="回收" value="recycle" />
            </el-select>
            <el-input
              v-model="logQuery.toUserName"
              placeholder="目标销售"
              clearable
              style="width: 180px"
            >
              <template #prefix><el-icon><User /></el-icon></template>
            </el-input>
            <el-button type="primary" :icon="Search" @click="loadLogs">查询</el-button>
            <el-button :icon="Refresh" @click="resetLogQuery">重置</el-button>
          </div>

          <el-table
            :data="pagedLogs"
            class="dark-table"
            stripe
            border
            row-key="id"
          >
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="weight-detail">
                  <div class="wd-title">
                    <span>权重计算明细</span>
                    <span class="wd-formula">final = base × {{ weightForm.baseWeightRatio }}% + load × {{ weightForm.loadWeightRatio }}% + ability × {{ weightForm.abilityWeightRatio }}% + commission × {{ weightForm.commissionWeightRatio }}%</span>
                  </div>
                  <div class="wd-grid">
                    <div class="wd-item">
                      <span class="wd-key">基础权重</span>
                      <span class="wd-val">{{ parseWeight(row).base }}</span>
                    </div>
                    <div class="wd-item">
                      <span class="wd-key">负载调整</span>
                      <span class="wd-val">{{ parseWeight(row).load }}</span>
                    </div>
                    <div class="wd-item">
                      <span class="wd-key">能力系数</span>
                      <span class="wd-val">{{ parseWeight(row).ability }}</span>
                    </div>
                    <div class="wd-item">
                      <span class="wd-key">提成差异</span>
                      <span class="wd-val">{{ parseWeight(row).commission }}</span>
                    </div>
                    <div class="wd-item is-final">
                      <span class="wd-key">最终得分</span>
                      <span class="wd-val">{{ parseWeight(row).final }}</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="时间" width="170" />
            <el-table-column prop="leadName" label="客户名称" min-width="160" />
            <el-table-column label="分配类型" width="110" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="distTagType(row.distributeType)"
                  effect="dark"
                  size="small"
                >
                  {{ distTagText(row.distributeType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fromPoolName" label="来源池" min-width="130" />
            <el-table-column prop="toUserName" label="目标销售" min-width="110">
              <template #default="{ row }">
                <span class="user-pill">{{ row.toUserName }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="fromUserName" label="原负责人" min-width="110">
              <template #default="{ row }">
                <span class="user-pill is-muted">{{ row.fromUserName || '—' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="权重详情" width="120" align="center">
              <template #default="{ row }">
                <span class="weight-tag">
                  <el-icon><DataLine /></el-icon>
                  {{ parseWeight(row).final }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" min-width="160" show-overflow-tooltip />
          </el-table>

          <div class="pager">
            <el-pagination
              v-model:current-page="logQuery.page"
              v-model:page-size="logQuery.size"
              :page-sizes="[10, 20, 50]"
              :total="filteredLogs.length"
              layout="total, sizes, prev, pager, next, jumper"
              background
            />
          </div>
        </section>
      </el-tab-pane>
    </el-tabs>

    <!-- ========= 固定保存栏 ========= -->
    <footer v-if="activeTab !== 'log'" class="save-bar">
      <div class="save-hint">
        <el-icon><InfoFilled /></el-icon>
        <span v-if="activeTab === 'weight'">
          权重总和：<b :class="{ 'is-error': sumInvalid }">{{ weightSum }}%</b> · 修改后请保存以即时生效
        </span>
        <span v-else>共 {{ channelRoutes.length }} 条渠道路由配置 · 修改后请保存</span>
      </div>
      <div class="save-actions">
        <el-button :icon="RefreshLeft" @click="resetCurrentTab">重置</el-button>
        <el-button
          type="primary"
          :icon="Check"
          :loading="saving"
          :disabled="activeTab === 'weight' && sumInvalid"
          @click="onSave"
        >保存配置</el-button>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeftBold,
  Check,
  DataLine,
  InfoFilled,
  Refresh,
  RefreshLeft,
  Search,
  User,
  WarningFilled
} from '@element-plus/icons-vue'
import { distributeApi, poolConfigApi, type WeightConfig, type DistributeLog } from '@/api/crm'

const router = useRouter()
const activeTab = ref<'weight' | 'channel' | 'log'>('weight')
const saving = ref(false)

// ============ 1. 权重因子 ============
const weightForm = reactive<WeightConfig>({
  baseWeightRatio: 30,
  loadWeightRatio: 35,
  abilityWeightRatio: 25,
  commissionWeightRatio: 10
})

const weightFactors: Array<{
  key: keyof WeightConfig
  label: string
  desc: string
}> = [
  {
    key: 'baseWeightRatio',
    label: '基础权重占比',
    desc: '根据职级设定（电销初级 1 / 中级 2 / 高级 3）'
  },
  {
    key: 'loadWeightRatio',
    label: '负载调整占比',
    desc: '空闲系数 = 1 − 当前持有 / 最大容量，越空闲权重越高'
  },
  {
    key: 'abilityWeightRatio',
    label: '能力系数占比',
    desc: '近 30 天转化率排名（前 20% = 3 分 / 中间 = 2 分 / 后 50% = 1 分）'
  },
  {
    key: 'commissionWeightRatio',
    label: '提成差异占比',
    desc: '高提成客户优先分配给高转化率销售'
  }
]

const weightSum = computed(
  () =>
    weightForm.baseWeightRatio +
    weightForm.loadWeightRatio +
    weightForm.abilityWeightRatio +
    weightForm.commissionWeightRatio
)
const sumInvalid = computed(() => weightSum.value !== 100)

// ============ 1.2 职级基础权重 ============
interface RoleWeightRow { role: string; label: string; weight: number; hint: string }
const defaultRoleWeightList = (): RoleWeightRow[] => [
  { role: 'sales_junior', label: '销售顾问', weight: 1, hint: '承接新注册、低客单价、需培育线索' },
  { role: 'sales_senior', label: '高级顾问', weight: 3, hint: '承接税务异常、经营异常、代理记账续费等高价值线索' },
  { role: 'sales_manager', label: '销售主管', weight: 4, hint: '承接争议线索、同行渠道、重点客户和人工审核线索' },
  { role: 'channel_manager', label: '渠道经理', weight: 3, hint: '承接同行地址挂靠、渠道分销和供应商转介绍线索' }
]
const roleWeightList = ref<RoleWeightRow[]>(defaultRoleWeightList())
interface PoolModeRow {
  poolKey: string
  poolName: string
  distributeMode: 'auto' | 'manual' | 'grab' | 'approval'
  description: string
}
const defaultPoolModeList = (): PoolModeRow[] => [
  { poolKey: 'online', poolName: '线上获客公海池', distributeMode: 'auto', description: '承接抖音、百度、小红书、探迹等网销线索,按 SLA 与转化能力自动分配' },
  { poolKey: 'telemarketing', poolName: '电销公海池', distributeMode: 'auto', description: '承接新注册、税务异常、经营异常等批量名单,按坐席负载轮询' },
  { poolKey: 'collaboration', poolName: '协作公海池', distributeMode: 'manual', description: '跨部门、跨团队或需老板/主管判断的线索进入协作池' },
  { poolKey: 'new_leads', poolName: '新线索池', distributeMode: 'approval', description: '工商自动带出后先做主体去重和质量校验,再进入目标池' },
  { poolKey: 'recycle', poolName: '回收公海池', distributeMode: 'grab', description: '超期未跟进、无效跟进和未转化线索回收后允许抢单' }
]
const poolModeList = reactive<PoolModeRow[]>(defaultPoolModeList())

// ============ 3. 抢单规则 ============
const grabRules = reactive({
  dailyLimit: 30,
  cooldownDays: 7,
  priorityWindow: 180,
  firstFollowDays: 1
})

// ============ 4. 渠道路由 ============
const poolOptions = [
  { label: '电销公海池', value: 'telemarketing' },
  { label: '线上获客公海池', value: 'online' },
  { label: '协作公海池', value: 'collaboration' },
  { label: '回收公海池', value: 'recycle' },
  { label: '新线索池', value: 'new_leads' }
]

interface ChannelRoute {
  source: string
  sourceType: string
  targetPool: string
  distributeMode: 'auto' | 'manual' | 'grab' | 'approval'
  ownerTeam: string
  dailyLeads: number
  crmCount: number
  dealCount: number
  avgResponse: string
  priority: '高' | '中' | '低'
  enabled: boolean
  remark: string
}
const defaultChannelRoutes = (): ChannelRoute[] => {
  return [
    {
      source: '探迹 T+1 新设企业',
      sourceType: '工商新增',
      targetPool: 'telemarketing',
      distributeMode: 'auto',
      ownerTeam: '电销一组',
      dailyLeads: 186,
      crmCount: 52,
      dealCount: 7,
      avgResponse: '6 分钟',
      priority: '高',
      enabled: true,
      remark: '新注册企业先做行业、注册资本、地区过滤,当天完成首呼'
    },
    {
      source: '探迹经营异常解除',
      sourceType: '风险商机',
      targetPool: 'telemarketing',
      distributeMode: 'auto',
      ownerTeam: '电销二组',
      dailyLeads: 93,
      crmCount: 31,
      dealCount: 6,
      avgResponse: '9 分钟',
      priority: '高',
      enabled: true,
      remark: '适合异常解除、地址挂靠、代理记账套餐组合销售'
    },
    {
      source: '百度/抖音表单',
      sourceType: '网销投放',
      targetPool: 'online',
      distributeMode: 'auto',
      ownerTeam: '网销一组',
      dailyLeads: 74,
      crmCount: 46,
      dealCount: 5,
      avgResponse: '3 分钟',
      priority: '高',
      enabled: true,
      remark: '按投放计划、关键词和落地页归因,同步到网销 ROI'
    },
    {
      source: '小红书/视频号私域',
      sourceType: '私域咨询',
      targetPool: 'online',
      distributeMode: 'manual',
      ownerTeam: '网销二组',
      dailyLeads: 38,
      crmCount: 21,
      dealCount: 3,
      avgResponse: '12 分钟',
      priority: '中',
      enabled: true,
      remark: '先由主管判断服务类型,再转给擅长行业的顾问'
    },
    {
      source: '同行渠道地址挂靠',
      sourceType: '渠道业务',
      targetPool: 'collaboration',
      distributeMode: 'approval',
      ownerTeam: '渠道部',
      dailyLeads: 27,
      crmCount: 19,
      dealCount: 9,
      avgResponse: '30 分钟',
      priority: '高',
      enabled: true,
      remark: '统一给渠道经理,后续与供应商、地址库存、账期应收勾稽'
    },
    {
      source: '代理记账断新开',
      sourceType: '财税信号',
      targetPool: 'telemarketing',
      distributeMode: 'auto',
      ownerTeam: '财税顾问组',
      dailyLeads: 41,
      crmCount: 18,
      dealCount: 4,
      avgResponse: '15 分钟',
      priority: '中',
      enabled: true,
      remark: '按所属税局、纳税人类型和近期开票状态识别服务需求'
    },
    {
      source: '老客户转介绍',
      sourceType: '存量增长',
      targetPool: 'collaboration',
      distributeMode: 'manual',
      ownerTeam: '客户成功',
      dailyLeads: 16,
      crmCount: 14,
      dealCount: 5,
      avgResponse: '20 分钟',
      priority: '中',
      enabled: true,
      remark: '优先关联原客户经理,避免重复撞单和归属争议'
    },
    {
      source: '回收池再激活',
      sourceType: '二次转化',
      targetPool: 'recycle',
      distributeMode: 'grab',
      ownerTeam: '销售全员',
      dailyLeads: 68,
      crmCount: 17,
      dealCount: 2,
      avgResponse: '2 小时',
      priority: '低',
      enabled: true,
      remark: '超期未跟进或已释放线索,按抢单规则和冷却期重新流转'
    }
  ]
}
const channelRoutes = ref<ChannelRoute[]>(defaultChannelRoutes())

const routeFlow = [
  { title: '工商/表单入库', desc: '公司名称自动带出工商信息,统一生成企业主体' },
  { title: '主体防撞', desc: '按名称、信用代码、手机号和联系人做撞单校验' },
  { title: '渠道路由', desc: '按来源、业务类型和风险信号进入目标公海池' },
  { title: '权重分配', desc: '按职级、负载、能力和提成差异计算销售得分' },
  { title: '回收预警', desc: '按 SLA、跟进质量和成交状态自动回收或提醒' }
]

const overviewCards = computed(() => {
  const enabledRoutes = channelRoutes.value.filter(item => item.enabled)
  const dailyLeads = enabledRoutes.reduce((sum, item) => sum + item.dailyLeads, 0)
  const crmCount = enabledRoutes.reduce((sum, item) => sum + item.crmCount, 0)
  const dealCount = enabledRoutes.reduce((sum, item) => sum + item.dealCount, 0)
  const autoCount = enabledRoutes.filter(item => item.distributeMode === 'auto').length

  return [
    { label: '启用来源', value: `${enabledRoutes.length}`, sub: `共 ${channelRoutes.value.length} 条渠道规则` },
    { label: '今日入库', value: `${dailyLeads}`, sub: '探迹/投放/私域/渠道合计' },
    { label: '入 CRM', value: `${crmCount}`, sub: '已通过防撞并进入客户池' },
    { label: '成交线索', value: `${dealCount}`, sub: `自动规则 ${autoCount} 条,其余人工确认` }
  ]
})

// ============ 5. 分配日志 ============
const logQuery = reactive({
  dateRange: [] as string[],
  distributeType: '',
  toUserName: '',
  page: 1,
  size: 10
})

interface LogRow extends Partial<DistributeLog> {
  id: number
  createTime: string
  leadName: string
  fromPoolName: string
  toUserName: string
  fromUserName?: string
  distributeType: 'auto' | 'manual' | 'grab' | 'transfer' | 'recycle'
  weightDetailJson?: string
  remark?: string
}

const mockLogs = ref<LogRow[]>(buildMockLogs())

function buildMockLogs(): LogRow[] {
  return [
    {
      id: 1001,
      createTime: '2026-06-04 14:18:22',
      leadName: '杭州启辰企业管理有限公司',
      fromPoolName: '探迹 T+1 新设企业',
      toUserName: '张星',
      distributeType: 'auto',
      weightDetailJson: JSON.stringify({ base: 3, load: 0.78, ability: 3, commission: 2, final: 86 }),
      remark: '新设企业,注册资本 100 万,命中代理记账开办套餐'
    },
    {
      id: 1002,
      createTime: '2026-06-04 13:47:09',
      leadName: '浙江朗和装饰工程有限公司',
      fromPoolName: '经营异常解除',
      toUserName: '陈思旭',
      fromUserName: '系统',
      distributeType: 'auto',
      weightDetailJson: JSON.stringify({ base: 3, load: 0.62, ability: 3, commission: 3, final: 91 }),
      remark: '地址异常,优先给擅长地址挂靠和异常解除的顾问'
    },
    {
      id: 1003,
      createTime: '2026-06-04 11:36:51',
      leadName: '杭州麦田电子商务有限公司',
      fromPoolName: '百度/抖音表单',
      toUserName: '何海琳',
      distributeType: 'manual',
      weightDetailJson: JSON.stringify({ base: 2, load: 0.48, ability: 2, commission: 2, final: 72 }),
      remark: '网销主管确认服务类型后转派'
    },
    {
      id: 1004,
      createTime: '2026-06-04 10:22:18',
      leadName: '义乌市诚达财税服务部',
      fromPoolName: '同行渠道地址挂靠',
      toUserName: '王舟',
      distributeType: 'transfer',
      weightDetailJson: JSON.stringify({ base: 4, load: 0.52, ability: 3, commission: 3, final: 88 }),
      remark: '同行批量采购地址,转渠道部跟进库存和账期'
    },
    {
      id: 1005,
      createTime: '2026-06-03 17:41:33',
      leadName: '杭州栖木文化传媒有限公司',
      fromPoolName: '回收公海池',
      toUserName: '刘洋',
      fromUserName: '周宁',
      distributeType: 'grab',
      weightDetailJson: JSON.stringify({ base: 1, load: 0.84, ability: 2, commission: 1, final: 64 }),
      remark: '原负责人 7 天未有效跟进,释放后被抢单'
    }
  ]
}

const filteredLogs = computed(() => {
  return mockLogs.value.filter(item => {
    if (logQuery.distributeType && item.distributeType !== logQuery.distributeType) return false
    if (logQuery.toUserName && !item.toUserName.includes(logQuery.toUserName)) return false
    if (logQuery.dateRange?.length === 2) {
      const t = item.createTime.slice(0, 10)
      if (t < logQuery.dateRange[0] || t > logQuery.dateRange[1]) return false
    }
    return true
  })
})
const pagedLogs = computed(() => {
  const start = (logQuery.page - 1) * logQuery.size
  return filteredLogs.value.slice(start, start + logQuery.size)
})

function loadLogs() {
  logQuery.page = 1
  ElMessage.success(`已筛选出 ${filteredLogs.value.length} 条记录`)
}
function resetLogQuery() {
  logQuery.dateRange = []
  logQuery.distributeType = ''
  logQuery.toUserName = ''
  logQuery.page = 1
}

// ============ Tag / 工具方法 ============
function distTagType(t: LogRow['distributeType']) {
  switch (t) {
    case 'auto': return 'primary'
    case 'manual': return 'success'
    case 'grab': return 'warning'
    case 'transfer': return 'info'
    case 'recycle': return 'danger'
    default: return 'info'
  }
}
function distTagText(t: LogRow['distributeType']) {
  return { auto: '自动', manual: '手动', grab: '抢单', transfer: '转移', recycle: '回收' }[t] || t
}
function priorityTagType(priority: ChannelRoute['priority']) {
  return priority === '高' ? 'danger' : priority === '中' ? 'warning' : 'info'
}
function parseWeight(row: LogRow) {
  try {
    const w = JSON.parse(row.weightDetailJson || '{}')
    return {
      base: w.base ?? '—',
      load: w.load ?? '—',
      ability: w.ability ?? '—',
      commission: w.commission ?? '—',
      final: w.final ?? '—'
    }
  } catch {
    return { base: '—', load: '—', ability: '—', commission: '—', final: '—' }
  }
}

// ============ 保存 / 重置 ============
async function onSave() {
  if (activeTab.value === 'weight') {
    if (sumInvalid.value) {
      ElMessage.error('权重总和必须为 100%')
      return
    }
    saving.value = true
    try {
      await distributeApi.saveWeightConfig({ ...weightForm })
      ElMessage.success('权重配置已保存')
    } catch {
      ElMessage.success('权重配置已保存（本地）')
    } finally {
      saving.value = false
    }
  } else if (activeTab.value === 'channel') {
    saving.value = true
    try {
      // 渠道路由暂未提供独立 API，复用 poolConfig 体系作为占位
      await Promise.resolve(poolConfigApi.list())
      ElMessage.success(`已保存 ${channelRoutes.value.length} 条渠道路由`)
    } catch {
      ElMessage.success(`已保存 ${channelRoutes.value.length} 条渠道路由（本地）`)
    } finally {
      saving.value = false
    }
  }
}
function resetCurrentTab() {
  if (activeTab.value === 'weight') {
    weightForm.baseWeightRatio = 30
    weightForm.loadWeightRatio = 35
    weightForm.abilityWeightRatio = 25
    weightForm.commissionWeightRatio = 10
    grabRules.dailyLimit = 30
    grabRules.cooldownDays = 7
    grabRules.priorityWindow = 180
    grabRules.firstFollowDays = 1
    roleWeightList.value = defaultRoleWeightList()
    poolModeList.splice(0, poolModeList.length, ...defaultPoolModeList())
    ElMessage.info('权重配置已重置为默认值')
  } else if (activeTab.value === 'channel') {
    channelRoutes.value = defaultChannelRoutes()
    ElMessage.info('渠道路由已恢复默认')
  }
}

function back() {
  router.push('/leads/operation')
}

// ============ 初始化 ============
onMounted(async () => {
  try {
    const cfg = await distributeApi.getWeightConfig()
    if (cfg && typeof cfg === 'object') {
      Object.assign(weightForm, cfg)
    }
  } catch {
    // 静默使用默认值
  }
  try {
    const pools = await poolConfigApi.list()
    if (Array.isArray(pools) && pools.length) {
      poolModeList.splice(
        0,
        poolModeList.length,
        ...pools.map(item => ({
          poolKey: item.poolType,
          poolName: item.poolName,
          distributeMode: item.distributeMode,
          description: item.description || `${item.poolName} 暂无说明`
        }))
      )
    }
  } catch {
    // 静默使用默认池配置
  }
})
</script>

<style lang="scss" scoped>
.distribute-config {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 8px 4px 96px;
  color: var(--text-body, #B8B8C0);
}

/* ===== Header ===== */
.page-header {
  position: relative;
  padding: 30px 36px 26px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6), transparent);
  }
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em;
  color: #F59E0B;
  margin-bottom: 14px;
  position: relative; z-index: 1;
}
.meta-tag {
  padding: 3px 10px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 2px;
  background: rgba(245, 158, 11, 0.06);
}
.meta-divider { width: 24px; height: 1px; background: rgba(245, 158, 11, 0.4); }
.meta-time { color: rgba(245, 158, 11, 0.6); }
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn {
    font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
    color: var(--text-primary, #F5F5F5);
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(245, 158, 11, 0.6);
  }
}
.page-desc { font-size: 13px; color: var(--text-body, #B8B8C0); margin: 0; }
.back-btn {
  position: absolute; top: 28px; right: 36px; z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #F59E0B; font-size: 13px; cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.5);
    transform: translateX(-2px);
  }
}

/* ===== Tabs ===== */
.cfg-tabs {
  :deep(.el-tabs__header) {
    margin: 0 0 18px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.14);
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    height: 44px; line-height: 44px;
    color: var(--text-muted, #888);
    font-size: 14px;
    padding: 0 22px;
    &.is-active { color: #F59E0B; }
    &:hover { color: rgba(245, 158, 11, 0.85); }
  }
  :deep(.el-tabs__active-bar) {
    background-color: #F59E0B;
    height: 2px;
  }
}
.tab-label {
  display: inline-flex; align-items: baseline; gap: 8px;
  .tab-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(245, 158, 11, 0.55);
    letter-spacing: 0.1em;
  }
}

/* ===== Card ===== */
.cfg-card {
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 22px 26px 24px;
  margin-bottom: 18px;
  position: relative;
}
.card-head {
  display: flex; align-items: baseline; gap: 14px;
  margin-bottom: 18px; padding-bottom: 14px;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.14);
}
.card-title {
  font-size: 16px; font-weight: 600; margin: 0;
  color: var(--text-primary, #F5F5F5);
  position: relative; padding-left: 12px;
  &::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 14px; background: #F59E0B; border-radius: 1px;
  }
}
.card-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.16em;
  color: rgba(212, 175, 55, 0.45);
  flex: 1;
}

/* ===== Sum Badge ===== */
.sum-badge {
  display: inline-flex; align-items: baseline; gap: 6px;
  padding: 6px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.25s;
  .sum-label { font-size: 10px; letter-spacing: 0.2em; color: rgba(245, 158, 11, 0.6); }
  .sum-num { font-size: 22px; font-weight: 700; color: #F59E0B; line-height: 1; }
  .sum-unit { font-size: 12px; color: rgba(245, 158, 11, 0.7); }

  &.is-error {
    background: rgba(239, 68, 68, 0.1);
    border-color: rgba(239, 68, 68, 0.5);
    animation: pulseErr 1.4s ease-in-out infinite;
    .sum-label { color: rgba(239, 68, 68, 0.7); }
    .sum-num { color: #EF4444; }
    .sum-unit { color: rgba(239, 68, 68, 0.8); }
  }
}
@keyframes pulseErr {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
}

/* ===== Slider Grid ===== */
.slider-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 36px;
}
.slider-row {
  display: flex; flex-direction: column; gap: 10px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
}
.slider-meta {
  display: flex; flex-direction: column; gap: 4px;
}
.slider-name {
  display: flex; align-items: baseline; justify-content: space-between;
  .name-cn { font-size: 14px; font-weight: 600; color: var(--text-primary, #F5F5F5); }
  .name-pct {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px; font-weight: 700; color: #F59E0B;
  }
}
.slider-desc {
  margin: 0; font-size: 12px; color: var(--text-muted, #888); line-height: 1.6;
}
.slider-track {
  padding: 4px 8px 0;
  :deep(.el-slider__runway) { background: rgba(212, 175, 55, 0.12); }
  :deep(.el-slider__bar) { background: linear-gradient(90deg, #F59E0B, #D4AF37); }
  :deep(.el-slider__button) {
    border-color: #F59E0B;
    background: #1A1A24;
    box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
  }
  :deep(.el-input-number) { width: 80px; }
}

/* ===== Warning ===== */
.warning-bar {
  margin-top: 18px;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  color: #EF4444; font-size: 13px;
}

/* ===== Mode Table ===== */
.mode-table {
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px;
  overflow: hidden;
}
.mode-thead, .mode-row {
  display: grid;
  grid-template-columns: 200px 1fr 1.2fr;
  align-items: center;
}
.mode-thead {
  background: rgba(245, 158, 11, 0.06);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.16em;
  color: rgba(245, 158, 11, 0.8);
  text-transform: uppercase;
  > div { padding: 12px 18px; }
}
.mode-row {
  border-top: 1px solid rgba(212, 175, 55, 0.08);
  transition: background 0.2s;
  &:hover { background: rgba(245, 158, 11, 0.03); }
}
.mode-cell { padding: 14px 18px; font-size: 13px; }
.pool-cell { display: flex; align-items: center; gap: 12px; }
.pool-idx {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(245, 158, 11, 0.5);
  padding: 2px 6px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 3px;
}
.pool-name { color: var(--text-primary, #F5F5F5); font-weight: 500; }
.mode-desc { color: var(--text-muted, #888); font-size: 12px; }

/* ===== Rules Grid ===== */
.rules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
.rule-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-template-rows: auto auto;
  align-items: center; gap: 6px 12px;
  padding: 16px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;

  .rule-label {
    font-size: 13px; font-weight: 500;
    color: var(--text-primary, #F5F5F5);
  }
  :deep(.el-input-number) { width: 130px; }
  .rule-unit {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; color: rgba(245, 158, 11, 0.6);
    letter-spacing: 0.1em;
  }
  .rule-tip {
    grid-column: 1 / -1;
    margin: 0; font-size: 12px;
    color: var(--text-muted, #888); line-height: 1.5;
  }
}

/* ===== Channel Table / Log Table 共享 ===== */
.dark-table {
  background: transparent;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(245, 158, 11, 0.04);
  --el-table-border-color: rgba(212, 175, 55, 0.1);
  --el-table-header-bg-color: rgba(245, 158, 11, 0.05);
  --el-table-header-text-color: rgba(245, 158, 11, 0.8);
  --el-table-text-color: var(--text-body, #B8B8C0);

  :deep(th.el-table__cell) {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 500;
  }
}
.src-pill {
  display: inline-block;
  padding: 3px 10px;
  font-size: 12px;
  background: rgba(6, 182, 212, 0.08);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #06B6D4;
  border-radius: 3px;
}
.user-pill {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  background: rgba(167, 139, 250, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.3);
  color: #A78BFA;
  border-radius: 3px;
  &.is-muted {
    background: rgba(255, 255, 255, 0.03);
    border-color: rgba(255, 255, 255, 0.1);
    color: var(--text-muted, #888);
  }
}

/* ===== Log Filter ===== */
.log-filter {
  display: flex; flex-wrap: wrap; gap: 12px;
  margin-bottom: 16px;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
}

/* ===== Weight Detail ===== */
.weight-detail {
  padding: 16px 24px;
  background: rgba(245, 158, 11, 0.03);
  border-radius: 6px;

  .wd-title {
    display: flex; align-items: baseline; justify-content: space-between;
    margin-bottom: 12px;
    font-size: 13px; font-weight: 600; color: var(--text-primary, #F5F5F5);
    .wd-formula {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; color: rgba(245, 158, 11, 0.7);
      letter-spacing: 0.05em;
    }
  }
  .wd-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 10px;
  }
  .wd-item {
    display: flex; flex-direction: column; gap: 4px;
    padding: 10px 12px;
    background: var(--bg-card, #16161E);
    border: 1px solid rgba(212, 175, 55, 0.12);
    border-radius: 6px;
    .wd-key {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px; letter-spacing: 0.16em;
      color: rgba(245, 158, 11, 0.6);
      text-transform: uppercase;
    }
    .wd-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 18px; font-weight: 700;
      color: var(--text-primary, #F5F5F5);
    }
    &.is-final {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(212, 175, 55, 0.05));
      border-color: rgba(245, 158, 11, 0.5);
      .wd-val { color: #F59E0B; }
    }
  }
}
.weight-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 600;
  color: #F59E0B;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 3px;
  cursor: pointer;
}

/* ===== Pager ===== */
.pager {
  display: flex; justify-content: flex-end;
  margin-top: 16px;
}

/* ===== Save Bar ===== */
.save-bar {
  position: fixed;
  left: 240px; right: 24px; bottom: 16px;
  z-index: 20;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px;
  padding: 14px 22px;
  background: linear-gradient(135deg, rgba(22, 22, 30, 0.98), rgba(26, 26, 36, 0.98));
  border: 1px solid rgba(245, 158, 11, 0.32);
  border-radius: 10px;
  box-shadow: 0 12px 32px -10px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);

  .save-hint {
    display: inline-flex; align-items: center; gap: 8px;
    font-size: 13px; color: var(--text-muted, #888);
    b { color: #F59E0B; font-family: 'JetBrains Mono', monospace; }
    b.is-error { color: #EF4444; }
  }
  .save-actions { display: inline-flex; gap: 10px; }
}

@media (max-width: 1100px) {
  .slider-grid, .rules-grid { grid-template-columns: 1fr; }
  .mode-thead, .mode-row { grid-template-columns: 140px 1fr; }
  .mode-thead > div:nth-child(3), .mode-row > .mode-desc { display: none; }
  .save-bar { left: 16px; right: 16px; }
  .wd-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .formula-examples { grid-template-columns: 1fr !important; }
  .ability-grid { grid-template-columns: 1fr !important; }
}

/* ===== 职级权重可视化条 ===== */
.weight-bar {
  display: inline-block;
  width: 80%;
  height: 6px;
  border-radius: 3px;
  background: rgba(167, 139, 250, 0.1);
  overflow: hidden;
  vertical-align: middle;
  i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #A78BFA, #D4AF37);
    border-radius: 3px;
    transition: width 0.4s;
  }
}

/* ===== 负载公式块 ===== */
.formula-card {
  .formula-block {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 18px 28px;
    margin: 4px 0 18px;
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(167, 139, 250, 0.08));
    border: 1px solid rgba(212, 175, 55, 0.2);
    border-radius: 8px;
    font-family: 'JetBrains Mono', 'Cambria Math', serif;
    font-size: 18px;
    color: #F5F5F5;
    .f-var { color: #D4AF37; font-weight: 600; }
    .f-eq, .f-op { color: #A78BFA; font-size: 22px; }
    .f-num { color: #F5F5F5; font-weight: 700; font-size: 22px; }
    .f-frac {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      .f-top, .f-bot { font-size: 13px; color: #B8B8C0; padding: 0 8px; }
      .f-line { width: 100%; height: 1px; background: #A78BFA; }
    }
  }
  .formula-examples {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
  .fe-item {
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(167, 139, 250, 0.15);
    border-left: 3px solid #A78BFA;
    border-radius: 6px;
    .fe-label {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10px;
      letter-spacing: 0.18em;
      color: rgba(167, 139, 250, 0.7);
      margin-bottom: 4px;
    }
    .fe-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 13px;
      color: #B8B8C0;
      b { color: #D4AF37; font-weight: 700; font-size: 16px; margin-left: 4px; }
    }
  }
}

/* ===== 能力评定卡 ===== */
.ability-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
.ab-card {
  position: relative;
  padding: 18px 22px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.65;
  }
  &.top {
    border-color: rgba(244, 63, 94, 0.4);
    &::before { background: linear-gradient(135deg, rgba(244, 63, 94, 0.18), transparent 70%); }
    .ab-rank, .ab-score { color: #F43F5E; }
  }
  &.mid {
    border-color: rgba(245, 158, 11, 0.4);
    &::before { background: linear-gradient(135deg, rgba(245, 158, 11, 0.18), transparent 70%); }
    .ab-rank, .ab-score { color: #F59E0B; }
  }
  &.low {
    border-color: rgba(167, 139, 250, 0.4);
    &::before { background: linear-gradient(135deg, rgba(167, 139, 250, 0.18), transparent 70%); }
    .ab-rank, .ab-score { color: #A78BFA; }
  }
  .ab-rank {
    position: relative;
    z-index: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    font-weight: 600;
    margin-bottom: 8px;
  }
  .ab-score {
    position: relative;
    z-index: 1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 6px;
  }
  .ab-desc {
    position: relative;
    z-index: 1;
    font-size: 12px;
    color: #B8B8C0;
    line-height: 1.5;
  }
}

/* ===== Feishu office style override ===== */
.distribute-config {
  gap: 16px;
  padding: 16px 20px 96px;
  color: #1f2937;
}

.page-header {
  min-height: 118px;
  padding: 22px 28px;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(31, 47, 70, 0.06);

  &::before,
  &::after {
    display: none;
  }
}

.header-meta {
  color: #3370ff;
  letter-spacing: 0;
  margin-bottom: 10px;
}

.meta-tag {
  color: #245bdb;
  background: #eef4ff;
  border-color: #c7d9ff;
  border-radius: 4px;
}

.meta-divider {
  background: #c7d9ff;
}

.meta-time {
  color: #6b7280;
}

.page-title {
  margin-bottom: 6px;

  .title-cn {
    color: #111827;
    font-size: 26px;
    letter-spacing: 0;
  }

  .title-en {
    color: #6b7280;
    font-family: inherit;
    font-size: 14px;
    font-style: normal;
  }
}

.page-desc {
  color: #4b5563;
}

.back-btn {
  top: 22px;
  right: 28px;
  background: #ffffff;
  border-color: #d8dee8;
  border-radius: 6px;
  color: #245bdb;

  &:hover {
    background: #eef4ff;
    border-color: #9dbbff;
    transform: none;
  }
}

.rule-overview {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.overview-card {
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.overview-label {
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 8px;
}

.overview-value {
  color: #111827;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
}

.overview-sub {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
}

.cfg-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 14px;
    border-bottom-color: #dbe5f2;
  }

  :deep(.el-tabs__item) {
    color: #4b5563;

    &.is-active,
    &:hover {
      color: #245bdb;
    }
  }

  :deep(.el-tabs__active-bar) {
    background-color: #3370ff;
  }
}

.tab-label .tab-num {
  color: #8aa8f8;
  letter-spacing: 0;
}

.cfg-card {
  background: #ffffff;
  border-color: #dbe5f2;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.card-head {
  border-bottom-color: #edf2f7;
}

.card-title {
  color: #111827;

  &::before {
    background: #3370ff;
  }
}

.card-sub {
  color: #64748b;
  font-family: inherit;
  letter-spacing: 0;
}

.sum-badge {
  background: #eef4ff;
  border-color: #c7d9ff;
  border-radius: 6px;

  .sum-label,
  .sum-unit {
    color: #4f6fbd;
  }

  .sum-num {
    color: #245bdb;
  }
}

.slider-row,
.rule-item,
.log-filter {
  background: #f8fafc;
  border-color: #e5edf7;
  border-radius: 8px;
}

.slider-name {
  .name-cn {
    color: #111827;
  }

  .name-pct {
    color: #245bdb;
  }
}

.slider-desc,
.rule-item .rule-tip,
.mode-desc {
  color: #64748b;
}

.slider-track {
  :deep(.el-slider__runway) {
    background: #e5edf7;
  }

  :deep(.el-slider__bar) {
    background: #3370ff;
  }

  :deep(.el-slider__button) {
    background: #ffffff;
    border-color: #3370ff;
    box-shadow: 0 0 0 4px rgba(51, 112, 255, 0.14);
  }
}

.mode-table {
  border-color: #e5edf7;
}

.mode-thead {
  background: #f3f7ff;
  color: #245bdb;
  font-family: inherit;
  letter-spacing: 0;
}

.mode-row {
  border-top-color: #edf2f7;

  &:hover {
    background: #f8fbff;
  }
}

.pool-name,
.rule-item .rule-label {
  color: #111827;
}

.pool-idx {
  color: #245bdb;
  border-color: #c7d9ff;
  background: #eef4ff;
}

.flow-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.flow-step {
  display: flex;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;

  strong {
    display: block;
    color: #111827;
    font-size: 13px;
    margin-bottom: 4px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
}

.flow-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 22px;
  width: 22px;
  height: 22px;
  color: #245bdb;
  background: #eef4ff;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
}

.dark-table {
  --el-table-bg-color: #ffffff;
  --el-table-tr-bg-color: #ffffff;
  --el-table-row-hover-bg-color: #f8fbff;
  --el-table-border-color: #e5edf7;
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #475569;
  --el-table-text-color: #1f2937;

  :deep(th.el-table__cell) {
    font-family: inherit;
    letter-spacing: 0;
    text-transform: none;
  }
}

.source-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  small {
    color: #94a3b8;
    font-size: 12px;
  }
}

.src-pill {
  color: #245bdb;
  background: #eef4ff;
  border-color: #c7d9ff;
  border-radius: 4px;
}

.user-pill {
  color: #0f766e;
  background: #ecfdf5;
  border-color: #bbf7d0;
  border-radius: 4px;

  &.is-muted {
    background: #f8fafc;
    border-color: #e5edf7;
    color: #64748b;
  }
}

.metric-number {
  color: #111827;
  font-weight: 700;
}

.conversion-mini {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #64748b;

  b {
    color: #245bdb;
  }
}

.linkage-note {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 14px;
  padding: 10px 12px;
  color: #475569;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  font-size: 13px;
}

.weight-detail {
  background: #f8fafc;

  .wd-title {
    color: #111827;

    .wd-formula {
      color: #64748b;
    }
  }

  .wd-item {
    background: #ffffff;
    border-color: #e5edf7;

    .wd-key {
      color: #64748b;
      letter-spacing: 0;
    }

    .wd-val {
      color: #111827;
    }

    &.is-final {
      background: #eef4ff;
      border-color: #9dbbff;

      .wd-val {
        color: #245bdb;
      }
    }
  }
}

.weight-tag {
  color: #245bdb;
  background: #eef4ff;
  border-color: #c7d9ff;
}

.save-bar {
  background: rgba(255, 255, 255, 0.96);
  border-color: #dbe5f2;
  border-radius: 8px;
  box-shadow: 0 12px 28px rgba(31, 47, 70, 0.12);

  .save-hint {
    color: #64748b;

    b {
      color: #245bdb;
    }
  }
}

.formula-card {
  .formula-block {
    background: #f8fafc;
    border-color: #e5edf7;
    color: #111827;

    .f-var,
    .f-num {
      color: #111827;
    }

    .f-eq,
    .f-op {
      color: #3370ff;
    }

    .f-frac {
      .f-top,
      .f-bot {
        color: #64748b;
      }

      .f-line {
        background: #3370ff;
      }
    }
  }

  .fe-item {
    background: #ffffff;
    border-color: #e5edf7;
    border-left-color: #3370ff;

    .fe-label {
      color: #64748b;
      letter-spacing: 0;
    }

    .fe-val {
      color: #475569;

      b {
        color: #245bdb;
      }
    }
  }
}

.weight-bar {
  background: #e5edf7;

  i {
    background: #3370ff;
  }
}

.ab-card {
  background: #ffffff;
  border-color: #e5edf7;

  &::before {
    display: none;
  }

  &.top,
  &.mid,
  &.low {
    border-color: #e5edf7;
  }

  &.top .ab-rank,
  &.top .ab-score {
    color: #dc2626;
  }

  &.mid .ab-rank,
  &.mid .ab-score {
    color: #d97706;
  }

  &.low .ab-rank,
  &.low .ab-score {
    color: #475569;
  }

  .ab-rank {
    letter-spacing: 0;
  }

  .ab-desc {
    color: #64748b;
  }
}

@media (max-width: 1280px) {
  .flow-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .distribute-config {
    padding: 12px 12px 96px;
  }

  .page-header {
    padding: 18px;
  }

  .back-btn {
    position: static;
    margin-top: 14px;
  }

  .page-title {
    flex-direction: column;
    gap: 4px;
  }

  .rule-overview,
  .flow-strip {
    grid-template-columns: 1fr;
  }
}
</style>

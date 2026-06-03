<template>
  <div class="leads-operation">
    <!-- ============ Header ============ -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">线索 · 02</span>
        <span class="meta-divider"></span>
        <span class="meta-time">AUTOMATION ENGINE · v2.6.1</span>
        <span class="meta-divider"></span>
        <span class="meta-pulse"><i class="pulse-dot"></i>4 个流程在线</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">运营管理 · 自动化流程</span>
          <span class="title-en">Operation Engine</span>
        </h1>
        <p class="page-desc">流程编排 · 定时调度 · 实时监控 — 让客户运营在无人值守下持续运转</p>
      </div>

      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回工作台</span>
      </button>
    </header>

    <!-- ============ Tabs ============ -->
    <el-tabs v-model="activeTab" class="op-tabs">
      <!-- ============================================== 自动化流程 ============================================== -->
      <el-tab-pane label="自动化流程" name="flows">
        <div class="flow-board">
          <article
            v-for="flow in flows"
            :key="flow.key"
            class="flow-card"
            :class="[`theme-${flow.theme}`, { 'is-expanded': expanded === flow.key }]"
          >
            <!-- Card Head -->
            <div class="flow-head">
              <div class="flow-icon">
                <component :is="flow.icon" />
              </div>
              <div class="flow-meta">
                <div class="flow-tag">FLOW · {{ flow.code }}</div>
                <h3 class="flow-name">{{ flow.name }}</h3>
                <p class="flow-desc">{{ flow.desc }}</p>
              </div>
              <div class="flow-switch">
                <el-switch
                  v-model="flow.enabled"
                  active-text="启用"
                  inactive-text="禁用"
                  inline-prompt
                  @change="toggleFlow(flow)"
                />
              </div>
            </div>

            <!-- Stat Strip -->
            <div class="flow-stats">
              <div class="stat-cell">
                <span class="stat-key">上次执行</span>
                <span class="stat-val mono">{{ flow.lastRun }}</span>
              </div>
              <div class="stat-cell">
                <span class="stat-key">今日执行</span>
                <span class="stat-val mono accent">{{ flow.todayCount }} 次</span>
              </div>
              <div class="stat-cell">
                <span class="stat-key">运行状态</span>
                <span class="status-pill" :class="`st-${flow.runtime}`">
                  <i class="pill-dot"></i>{{ runtimeText(flow.runtime) }}
                </span>
              </div>
            </div>

            <!-- Pipeline -->
            <div class="pipeline">
              <div
                v-for="(step, i) in flow.steps"
                :key="i"
                class="pipe-node"
                :class="{ 'is-warn': step.warn }"
              >
                <div class="node-disk">
                  <span class="node-num">{{ String(i + 1).padStart(2, '0') }}</span>
                </div>
                <span class="node-label">{{ step.label }}</span>
                <i v-if="i < flow.steps.length - 1" class="node-line"></i>
              </div>
            </div>

            <!-- Card Foot -->
            <div class="flow-foot">
              <button class="ghost-btn" @click="toggleExpand(flow.key)">
                <el-icon><Setting /></el-icon>
                <span>{{ expanded === flow.key ? '收起配置' : '配置' }}</span>
              </button>
              <button class="ghost-btn" @click="jumpToLog(flow.key)">
                <el-icon><Document /></el-icon>
                <span>查看日志</span>
              </button>
              <span class="foot-spacer"></span>
              <button class="ghost-btn primary" @click="runFlowNow(flow)">
                <el-icon><VideoPlay /></el-icon>
                <span>立即执行</span>
              </button>
            </div>

            <!-- Config Panel -->
            <transition name="slide-down">
              <div v-show="expanded === flow.key" class="flow-config">
                <div class="config-divider"><span>CONFIG · 配置面板</span></div>

                <!-- Flow 1 -->
                <template v-if="flow.key === 'newLead'">
                  <el-form label-position="left" label-width="160px" class="cfg-form">
                    <el-form-item label="启用查重检测">
                      <el-switch v-model="cfg.newLead.dedup" />
                      <span class="cfg-hint">新客录入时根据优先级字段自动判重</span>
                    </el-form-item>

                    <el-form-item label="查重字段优先级">
                      <ul class="priority-list">
                        <li v-for="(item, idx) in cfg.newLead.priority" :key="item.key" class="priority-item">
                          <span class="p-rank">P{{ idx }}</span>
                          <span class="p-name">{{ item.label }}</span>
                          <span class="p-actions">
                            <el-button size="small" link :disabled="idx === 0" @click="movePriority(idx, -1)">
                              <el-icon><Top /></el-icon>
                            </el-button>
                            <el-button size="small" link :disabled="idx === cfg.newLead.priority.length - 1" @click="movePriority(idx, 1)">
                              <el-icon><Bottom /></el-icon>
                            </el-button>
                          </span>
                        </li>
                      </ul>
                    </el-form-item>

                    <el-form-item label="自动打标签">
                      <el-switch v-model="cfg.newLead.autoTag" />
                      <span class="cfg-hint">根据来源渠道自动写入标签</span>
                    </el-form-item>
                    <el-form-item label="渠道路由">
                      <el-switch v-model="cfg.newLead.channelRoute" />
                      <span class="cfg-hint">按来源自动路由到对应公海池</span>
                    </el-form-item>
                    <el-form-item label="通知主管">
                      <el-switch v-model="cfg.newLead.notifyLeader" />
                      <span class="cfg-hint">新客入库时同步通知主管</span>
                    </el-form-item>
                  </el-form>
                </template>

                <!-- Flow 2 -->
                <template v-else-if="flow.key === 'recycle'">
                  <el-form label-position="left" label-width="160px" class="cfg-form">
                    <el-form-item label="执行时间">
                      <el-time-picker
                        v-model="cfg.recycle.runAt"
                        format="HH:mm"
                        value-format="HH:mm"
                        :clearable="false"
                        placeholder="每日"
                      />
                      <span class="cfg-hint">每天定时扫描并执行</span>
                    </el-form-item>
                    <el-form-item label="回收规则">
                      <el-button link type="primary" @click="goRecycleConfig">
                        <el-icon><Link /></el-icon>
                        <span>跳转至回收规则配置</span>
                      </el-button>
                    </el-form-item>
                    <el-form-item label="预警提前天数">
                      <div class="warn-row">
                        <span class="warn-tag lv-green">绿灯</span>
                        <el-input-number v-model="cfg.recycle.green" :min="1" :max="30" size="small" />
                        <span class="warn-tag lv-yellow">黄灯</span>
                        <el-input-number v-model="cfg.recycle.yellow" :min="1" :max="15" size="small" />
                        <span class="warn-tag lv-red">红灯</span>
                        <el-input-number v-model="cfg.recycle.red" :min="1" :max="7" size="small" />
                      </div>
                    </el-form-item>
                    <el-form-item label="回收后通知">
                      <el-switch v-model="cfg.recycle.notify" />
                      <span class="cfg-hint">通知原负责人 + 主管</span>
                    </el-form-item>
                    <el-form-item label="连续回收降级">
                      <el-switch v-model="cfg.recycle.downgrade" />
                      <span class="cfg-hint">连续 3 次回收自动降级为普通客户</span>
                    </el-form-item>
                  </el-form>
                </template>

                <!-- Flow 3 -->
                <template v-else-if="flow.key === 'renewal'">
                  <el-form label-position="left" label-width="160px" class="cfg-form">
                    <el-form-item label="提醒节点">
                      <el-checkbox-group v-model="cfg.renewal.nodes">
                        <el-checkbox label="30">30天前</el-checkbox>
                        <el-checkbox label="15">15天前</el-checkbox>
                        <el-checkbox label="7">7天前</el-checkbox>
                        <el-checkbox label="3">3天前</el-checkbox>
                        <el-checkbox label="1">1天前</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="提醒对象">
                      <el-radio-group v-model="cfg.renewal.target">
                        <el-radio label="owner">负责人</el-radio>
                        <el-radio label="ownerLeader">负责人 + 主管</el-radio>
                        <el-radio label="ownerLeaderManager">负责人 + 主管 + 经理</el-radio>
                      </el-radio-group>
                    </el-form-item>
                    <el-form-item label="提醒方式">
                      <el-checkbox-group v-model="cfg.renewal.channels">
                        <el-checkbox label="inner">站内信</el-checkbox>
                        <el-checkbox label="dingtalk">钉钉消息</el-checkbox>
                      </el-checkbox-group>
                    </el-form-item>
                    <el-form-item label="到期后处理">
                      <el-switch v-model="cfg.renewal.toHolding" />
                      <span class="cfg-hint">到期未续费自动入藏金阁</span>
                    </el-form-item>
                    <el-form-item label="升级机制">
                      <el-switch v-model="cfg.renewal.escalate" />
                      <span class="cfg-hint">7天前升级至经理层关注</span>
                    </el-form-item>
                  </el-form>
                </template>

                <!-- Flow 4 -->
                <template v-else-if="flow.key === 'leave'">
                  <el-form label-position="left" label-width="160px" class="cfg-form">
                    <el-form-item label="触发条件">
                      <el-tag type="warning" effect="dark" round>员工状态变更为「离职」</el-tag>
                    </el-form-item>
                    <el-form-item label="回收目标池">
                      <el-select v-model="cfg.leave.targetPool" placeholder="请选择" style="width: 240px">
                        <el-option label="公司公海池" value="company" />
                        <el-option label="渠道公海池" value="channel" />
                        <el-option label="行业公海池" value="industry" />
                        <el-option label="离职专属回收池" value="leave" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="冷却期天数">
                      <el-input-number v-model="cfg.leave.coolDays" :min="0" :max="60" />
                      <span class="cfg-hint">冷却期内禁止任何人认领</span>
                    </el-form-item>
                    <el-form-item label="通知主管">
                      <el-switch v-model="cfg.leave.notify" />
                    </el-form-item>
                    <el-form-item label="保留跟进历史">
                      <el-switch v-model="cfg.leave.keepHistory" />
                      <span class="cfg-hint">推荐开启 — 保留客户全量跟进记录便于交接</span>
                    </el-form-item>
                  </el-form>
                </template>

                <div class="cfg-actions">
                  <el-button @click="resetConfig(flow.key)">恢复默认</el-button>
                  <el-button type="primary" @click="saveConfig(flow.key)">保存配置</el-button>
                </div>
              </div>
            </transition>
          </article>
        </div>
      </el-tab-pane>

      <!-- ============================================== 执行日志 ============================================== -->
      <el-tab-pane label="执行日志" name="logs">
        <div class="panel">
          <div class="filter-form">
            <el-form inline>
              <el-form-item label="时间范围">
                <el-date-picker
                  v-model="logQuery.dateRange"
                  type="datetimerange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  value-format="YYYY-MM-DD HH:mm:ss"
                />
              </el-form-item>
              <el-form-item label="流程类型">
                <el-select v-model="logQuery.flow" placeholder="全部流程" clearable style="width: 180px">
                  <el-option v-for="f in flows" :key="f.key" :label="f.name" :value="f.key" />
                </el-select>
              </el-form-item>
              <el-form-item label="执行结果">
                <el-select v-model="logQuery.result" placeholder="全部结果" clearable style="width: 140px">
                  <el-option label="成功" value="success" />
                  <el-option label="失败" value="fail" />
                  <el-option label="部分成功" value="partial" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="logPage = 1">查询</el-button>
                <el-button @click="resetLogQuery">重置</el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>执行日志</span>
              <em>{{ filteredLogs.length }} 条记录</em>
            </div>
            <span class="panel-sub mono">LOG · STREAM</span>
          </div>

          <el-table :data="pagedLogs" class="zh-table" stripe>
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="log-detail">
                  <div class="ld-head">本次共处理 {{ row.totalCount }} 个客户：</div>
                  <ul class="ld-list">
                    <li v-for="c in row.customers" :key="c.id">
                      <span class="ld-id mono">#{{ c.id }}</span>
                      <span class="ld-name">{{ c.name }}</span>
                      <span class="ld-status" :class="`ls-${c.status}`">{{ c.statusText }}</span>
                      <span class="ld-msg">{{ c.msg }}</span>
                    </li>
                  </ul>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="runTime" label="执行时间" width="170" />
            <el-table-column prop="flowName" label="流程名称" width="170" show-overflow-tooltip />
            <el-table-column label="触发方式" width="110">
              <template #default="{ row }">
                <el-tag size="small" :type="row.trigger === '手动' ? 'warning' : 'info'" effect="plain">
                  {{ row.trigger }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalCount" label="处理客户数" width="110" align="center" />
            <el-table-column prop="successCount" label="成功数" width="100" align="center">
              <template #default="{ row }">
                <span class="num-pos">{{ row.successCount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="failCount" label="失败数" width="100" align="center">
              <template #default="{ row }">
                <span class="num-neg">{{ row.failCount }}</span>
              </template>
            </el-table-column>
            <el-table-column label="执行结果" width="120">
              <template #default="{ row }">
                <span class="result-tag" :class="`rt-${row.result}`">
                  <i class="rt-dot"></i>{{ resultText(row.result) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="耗时" width="100">
              <template #default="{ row }">
                <span class="mono dim">{{ row.duration }} ms</span>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager-row">
            <el-pagination
              v-model:current-page="logPage"
              :page-size="logPageSize"
              :total="filteredLogs.length"
              layout="total, prev, pager, next, jumper"
              background
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- ============================================== 流程监控 ============================================== -->
      <el-tab-pane label="流程监控" name="monitor">
        <!-- 实时状态 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>实时运行状态</span>
              <em>LIVE</em>
            </div>
            <span class="panel-sub mono">最近刷新：{{ lastRefresh }}</span>
          </div>
          <div class="runtime-row">
            <div
              v-for="flow in flows"
              :key="flow.key"
              class="runtime-card"
              :class="[`theme-${flow.theme}`, `rt-${flow.runtime}`]"
            >
              <div class="rt-bar"></div>
              <div class="rt-head">
                <span class="rt-name">{{ flow.name }}</span>
                <span class="status-pill" :class="`st-${flow.runtime}`">
                  <i class="pill-dot"></i>{{ runtimeText(flow.runtime) }}
                </span>
              </div>
              <div class="rt-num mono">{{ flow.todayCount }}</div>
              <div class="rt-meta">今日执行次数</div>
              <div class="rt-foot">
                <span>成功率</span>
                <em class="mono">{{ flow.successRate }}%</em>
              </div>
            </div>
          </div>
        </div>

        <!-- 今日 / 趋势 -->
        <div class="grid-2">
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="dot"></span>
                <span>今日执行统计</span>
              </div>
            </div>
            <div class="today-stats">
              <div class="ts-cell">
                <span class="ts-key">总次数</span>
                <span class="ts-val mono">{{ todayTotal }}</span>
              </div>
              <div class="ts-cell">
                <span class="ts-key">成功</span>
                <span class="ts-val mono pos">{{ todaySuccess }}</span>
              </div>
              <div class="ts-cell">
                <span class="ts-key">失败</span>
                <span class="ts-val mono neg">{{ todayFail }}</span>
              </div>
              <div class="ts-cell">
                <span class="ts-key">总成功率</span>
                <span class="ts-val mono accent">{{ todaySuccessRate }}%</span>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="dot"></span>
                <span>近 7 天执行趋势</span>
              </div>
            </div>
            <div class="trend-bars">
              <div v-for="d in trend" :key="d.date" class="bar-col">
                <div class="bar-stack" :title="`${d.date} · ${d.count}次`">
                  <div class="bar-fill" :style="{ height: barHeight(d.count) }"></div>
                  <span class="bar-num mono">{{ d.count }}</span>
                </div>
                <span class="bar-date mono">{{ d.date.slice(5) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 健康指标 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>系统健康指标</span>
            </div>
          </div>
          <div class="health-row">
            <div class="health-card health-ok">
              <div class="hc-icon">
                <el-icon><Timer /></el-icon>
              </div>
              <div class="hc-meta">
                <span class="hc-key">定时任务</span>
                <span class="hc-val">正常运行</span>
                <span class="hc-sub mono">CRON · 0 1 * * *</span>
              </div>
            </div>
            <div class="health-card health-ok">
              <div class="hc-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="hc-meta">
                <span class="hc-key">队列积压</span>
                <span class="hc-val">{{ queueBacklog }} 条</span>
                <span class="hc-sub mono">QUEUE · MQ-OPS</span>
              </div>
            </div>
            <div class="health-card health-ok">
              <div class="hc-icon">
                <el-icon><Connection /></el-icon>
              </div>
              <div class="hc-meta">
                <span class="hc-key">最后心跳</span>
                <span class="hc-val">{{ lastHeartbeat }}</span>
                <span class="hc-sub mono">HEARTBEAT · 30s</span>
              </div>
            </div>
            <div class="health-card health-ok">
              <div class="hc-icon">
                <el-icon><Cpu /></el-icon>
              </div>
              <div class="hc-meta">
                <span class="hc-key">引擎负载</span>
                <span class="hc-val">{{ engineLoad }}%</span>
                <span class="hc-sub mono">ENGINE · NODE-01</span>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeftBold,
  Setting,
  Document,
  VideoPlay,
  Top,
  Bottom,
  Link,
  Timer,
  DataLine,
  Connection,
  Cpu,
  UserFilled,
  RefreshRight,
  AlarmClock,
  SwitchButton
} from '@element-plus/icons-vue'
// 预留对接 CRM 自动化流程接口
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import * as crmApi from '@/api/crm'

const router = useRouter()
const activeTab = ref<'flows' | 'logs' | 'monitor'>('flows')
const expanded = ref<string>('')

// ============ 流程定义 ============
type FlowKey = 'newLead' | 'recycle' | 'renewal' | 'leave'
type Runtime = 'running' | 'idle' | 'error'

interface Flow {
  key: FlowKey
  code: string
  name: string
  desc: string
  theme: 'cyan' | 'gold' | 'emerald' | 'rose'
  icon: any
  enabled: boolean
  lastRun: string
  todayCount: number
  successRate: number
  runtime: Runtime
  steps: { label: string; warn?: boolean }[]
}

const flows = reactive<Flow[]>([])

// ============ 配置 ============
const defaultCfg = () => ({
  newLead: {
    dedup: true,
    priority: [
      { key: 'creditCode', label: '统一社会信用代码' },
      { key: 'name', label: '客户名称' },
      { key: 'phone', label: '联系电话' },
      { key: 'combo', label: '组合匹配（名称+电话）' }
    ],
    autoTag: true,
    channelRoute: true,
    notifyLeader: true
  },
  recycle: {
    runAt: '01:00',
    green: 7,
    yellow: 3,
    red: 1,
    notify: true,
    downgrade: true
  },
  renewal: {
    nodes: ['30', '15', '7', '3', '1'] as string[],
    target: 'ownerLeader',
    channels: ['inner', 'dingtalk'] as string[],
    toHolding: true,
    escalate: true
  },
  leave: {
    targetPool: 'leave',
    coolDays: 7,
    notify: true,
    keepHistory: true
  }
})
const cfg = reactive(defaultCfg())

const toggleExpand = (key: string) => {
  expanded.value = expanded.value === key ? '' : key
}
const toggleFlow = (flow: Flow) => {
  ElMessage.success(`${flow.name} 已${flow.enabled ? '启用' : '禁用'}`)
}
const runFlowNow = (flow: Flow) => {
  flow.runtime = 'running'
  ElMessage.info(`${flow.name} · 已加入执行队列`)
  setTimeout(() => {
    flow.runtime = 'idle'
    flow.todayCount += 1
    flow.lastRun = formatNow()
    ElMessage.success(`${flow.name} · 执行完成`)
  }, 1800)
}
const movePriority = (idx: number, dir: -1 | 1) => {
  const list = cfg.newLead.priority
  const next = idx + dir
  if (next < 0 || next >= list.length) return
  ;[list[idx], list[next]] = [list[next], list[idx]]
}
const resetConfig = (key: FlowKey) => {
  const def = defaultCfg()
  Object.assign((cfg as any)[key], (def as any)[key])
  ElMessage.success('已恢复默认配置')
}
const saveConfig = (key: FlowKey) => {
  const flow = flows.find(f => f.key === key)
  ElMessage.success(`${flow?.name} 配置已保存`)
}
const goRecycleConfig = () => router.push('/leads/recycle-config')
const goBack = () => router.push('/leads/workbench')

const runtimeText = (r: Runtime) =>
  r === 'running' ? '运行中' : r === 'error' ? '异常' : '空闲'

// ============ 日志 ============
interface LogRow {
  id: number
  runTime: string
  flowKey: FlowKey
  flowName: string
  trigger: '定时' | '手动' | '事件'
  totalCount: number
  successCount: number
  failCount: number
  result: 'success' | 'fail' | 'partial'
  duration: number
  customers: { id: string; name: string; status: 'ok' | 'fail'; statusText: string; msg: string }[]
}

const buildCustomers = (_n: number, _partial = false): LogRow['customers'] => {
  return []
}

const generateMockLogs = (): LogRow[] => {
  return []
}

const logs = ref<LogRow[]>([])
const logQuery = reactive<{ dateRange: string[]; flow: FlowKey | ''; result: '' | 'success' | 'fail' | 'partial' }>({
  dateRange: [],
  flow: '',
  result: ''
})
const logPage = ref(1)
const logPageSize = 8

const filteredLogs = computed(() => {
  return logs.value.filter(l => {
    if (logQuery.flow && l.flowKey !== logQuery.flow) return false
    if (logQuery.result && l.result !== logQuery.result) return false
    if (logQuery.dateRange?.length === 2) {
      if (l.runTime < logQuery.dateRange[0] || l.runTime > logQuery.dateRange[1]) return false
    }
    return true
  })
})
const pagedLogs = computed(() => {
  const s = (logPage.value - 1) * logPageSize
  return filteredLogs.value.slice(s, s + logPageSize)
})
const resultText = (r: string) => (r === 'success' ? '成功' : r === 'fail' ? '失败' : '部分成功')
const resetLogQuery = () => {
  logQuery.dateRange = []
  logQuery.flow = ''
  logQuery.result = ''
  logPage.value = 1
}
const jumpToLog = (key: FlowKey) => {
  logQuery.flow = key
  activeTab.value = 'logs'
}

// ============ 监控 ============
const lastRefresh = ref(formatNow())
const lastHeartbeat = ref('刚刚')
const queueBacklog = ref(2)
const engineLoad = ref(34)

const todayTotal = computed(() => flows.reduce((a, f) => a + f.todayCount, 0))
const todaySuccess = computed(() => Math.round(todayTotal.value * 0.96))
const todayFail = computed(() => todayTotal.value - todaySuccess.value)
const todaySuccessRate = computed(() =>
  todayTotal.value === 0 ? 100 : Math.round((todaySuccess.value / todayTotal.value) * 1000) / 10
)

const trend = ref<{ date: string; count: number }[]>([])
const buildTrend = (): { date: string; count: number }[] => {
  return []
}
const maxTrend = computed(() => Math.max(...trend.value.map(t => t.count), 1))
const barHeight = (n: number) => `${Math.max(8, Math.round((n / maxTrend.value) * 100))}%`

let timer: ReturnType<typeof setInterval> | null = null

// ============ Utils ============
function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`
}
function formatTs(t: number) {
  const d = new Date(t)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
function formatNow() {
  return formatTs(Date.now())
}

onMounted(() => {
  logs.value = generateMockLogs()
  trend.value = buildTrend()
  timer = setInterval(() => {
    lastRefresh.value = formatNow()
    lastHeartbeat.value = `${Math.floor(Math.random() * 25 + 1)}秒前`
    engineLoad.value = 28 + Math.floor(Math.random() * 22)
  }, 5000)
})

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.leads-operation {
  padding: 24px 28px 36px;
  min-height: 100%;
  background:
    radial-gradient(ellipse at top, rgba(245, 158, 11, 0.04), transparent 60%),
    var(--bg-page, #0B0B12);
  color: var(--text-body, #B8B8C0);
}

/* ============ Header ============ */
.page-header {
  position: relative;
  padding: 26px 32px 28px;
  margin-bottom: 22px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
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
    opacity: 0.5;
  }
}
.header-meta {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: rgba(245, 158, 11, 0.7);
  text-transform: uppercase;
}
.meta-tag {
  padding: 3px 10px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 2px;
  background: rgba(245, 158, 11, 0.06);
}
.meta-divider {
  width: 24px;
  height: 1px;
  background: rgba(245, 158, 11, 0.4);
}
.meta-time { color: rgba(245, 158, 11, 0.55); }
.meta-pulse {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #67C23A;

  .pulse-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #67C23A;
    box-shadow: 0 0 10px #67C23A;
    animation: pulse 1.6s infinite;
  }
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(1.4); }
}
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;

  .title-cn {
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, #F5F5F5, #F59E0B);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: rgba(245, 158, 11, 0.5);
  }
}
.page-desc { margin: 0; font-size: 13px; color: var(--text-muted, #888); }
.back-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #F59E0B;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(245, 158, 11, 0.16);
    transform: translateX(-2px);
  }
}

/* ============ Tabs ============ */
.op-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 22px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: var(--text-muted, #888);
    padding: 0 22px;

    &.is-active { color: #F59E0B; font-weight: 600; }
    &:hover { color: var(--text-primary, #F5F5F5); }
  }
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #F59E0B, #D4AF37);
    height: 3px;
    border-radius: 2px;
  }
}

/* ============ Flow Cards ============ */
.flow-board {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
.flow-card {
  position: relative;
  padding: 22px 24px 16px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-left: 3px solid var(--accent);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  --accent: #F59E0B;
  --accent-soft: rgba(245, 158, 11, 0.1);

  &.theme-cyan { --accent: #06B6D4; --accent-soft: rgba(6, 182, 212, 0.1); }
  &.theme-gold { --accent: #F59E0B; --accent-soft: rgba(245, 158, 11, 0.1); }
  &.theme-emerald { --accent: #10B981; --accent-soft: rgba(16, 185, 129, 0.1); }
  &.theme-rose { --accent: #F43F5E; --accent-soft: rgba(244, 63, 94, 0.1); }

  &::after {
    content: '';
    position: absolute;
    top: -40px;
    right: -40px;
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--accent-soft), transparent 70%);
    pointer-events: none;
    opacity: 0.6;
  }
  &:hover { border-color: var(--accent); }
  &.is-expanded {
    grid-column: 1 / -1;
  }
}
.flow-head {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.flow-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: var(--accent);
  flex-shrink: 0;
}
.flow-meta { flex: 1; }
.flow-tag {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: var(--accent);
  margin-bottom: 4px;
}
.flow-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  margin: 0 0 4px;
}
.flow-desc {
  font-size: 12px;
  color: var(--text-muted, #888);
  margin: 0;
}
.flow-switch {
  flex-shrink: 0;
  :deep(.el-switch.is-checked .el-switch__core) {
    background-color: var(--accent) !important;
    border-color: var(--accent) !important;
  }
}

/* Stats */
.flow-stats {
  display: flex;
  gap: 22px;
  padding: 14px 0 16px;
  margin-top: 16px;
  border-top: 1px dashed rgba(212, 175, 55, 0.12);
}
.stat-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .stat-key {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-muted, #888);
  }
  .stat-val {
    font-size: 13px;
    color: var(--text-body, #B8B8C0);
    font-weight: 500;
    &.accent { color: var(--accent); }
  }
}
.mono { font-family: 'JetBrains Mono', monospace; }

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: max-content;

  .pill-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
  &.st-running {
    color: #10B981;
    background: rgba(16, 185, 129, 0.12);
    .pill-dot { animation: pulse 1.4s infinite; }
  }
  &.st-idle { color: #94A3B8; background: rgba(148, 163, 184, 0.12); }
  &.st-error { color: #F43F5E; background: rgba(244, 63, 94, 0.12); }
}

/* Pipeline */
.pipeline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 4px;
  margin-bottom: 6px;
  overflow-x: auto;
  background:
    repeating-linear-gradient(90deg, rgba(212, 175, 55, 0.04) 0 1px, transparent 1px 8px);
  border-radius: 8px;
}
.pipe-node {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;

  .node-disk {
    position: relative;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--accent-soft);
    border: 1.5px solid var(--accent);
    display: flex;
    align-items: center;
    justify-content: center;

    &::before {
      content: '';
      position: absolute;
      inset: -3px;
      border-radius: 50%;
      border: 1px dashed var(--accent);
      opacity: 0.4;
      animation: rotate 12s linear infinite;
    }
  }
  .node-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: var(--accent);
  }
  .node-label {
    font-size: 12px;
    color: var(--text-body, #B8B8C0);
    white-space: nowrap;
  }
  .node-line {
    flex-shrink: 0;
    width: 18px;
    height: 1px;
    background-image: linear-gradient(90deg, var(--accent) 50%, transparent 0);
    background-size: 6px 1px;
    background-repeat: repeat-x;
    margin: 0 4px;
    opacity: 0.7;
  }
  &.is-warn .node-disk { border-color: #E6A23C; background: rgba(230, 162, 60, 0.16); }
  &.is-warn .node-num { color: #E6A23C; }
}
@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Foot */
.flow-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(212, 175, 55, 0.08);

  .foot-spacer { flex: 1; }
}
.ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 6px;
  color: var(--text-body, #B8B8C0);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-soft);
  }
  &.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: #0B0B12;
    font-weight: 600;
    &:hover { filter: brightness(1.1); }
  }
}

/* Config Panel */
.flow-config {
  margin-top: 14px;
  padding: 18px 20px 6px;
  background:
    linear-gradient(180deg, rgba(245, 158, 11, 0.04), transparent),
    rgba(11, 11, 18, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;
}
.config-divider {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(212, 175, 55, 0.55);

  span { margin-right: 12px; }
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.3), transparent);
  }
}
.cfg-form {
  :deep(.el-form-item__label) {
    color: var(--text-muted, #aaa);
    font-size: 13px;
  }
  :deep(.el-form-item) { margin-bottom: 14px; }
}
.cfg-hint {
  margin-left: 12px;
  font-size: 12px;
  color: var(--text-muted, #888);
}
.priority-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  max-width: 460px;
}
.priority-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 6px;

  .p-rank {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    font-weight: 700;
    color: #F59E0B;
    background: rgba(245, 158, 11, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }
  .p-name { flex: 1; font-size: 13px; color: var(--text-body, #B8B8C0); }
}
.warn-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  .warn-tag {
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    &.lv-red { color: #F56C6C; background: rgba(245, 108, 108, 0.12); }
    &.lv-yellow { color: #E6A23C; background: rgba(230, 162, 60, 0.12); }
    &.lv-green { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
  }
}
.cfg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px dashed rgba(212, 175, 55, 0.1);
  margin-top: 6px;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
  max-height: 1200px;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
  padding-bottom: 0;
}

/* ============ Panel ============ */
.panel {
  padding: 22px 24px 18px;
  margin-bottom: 18px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F59E0B;
    box-shadow: 0 0 12px #F59E0B;
  }
  em {
    font-style: normal;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.15em;
    color: rgba(212, 175, 55, 0.5);
    margin-left: 6px;
  }
}
.panel-sub {
  font-size: 11px;
  letter-spacing: 0.2em;
  color: rgba(212, 175, 55, 0.4);
}
.filter-form {
  padding: 12px 16px;
  margin-bottom: 14px;
  background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 8px;

  :deep(.el-form-item__label) { color: var(--text-muted, #888); font-size: 13px; }
  :deep(.el-form-item) { margin-bottom: 0; }
}

/* ============ 表格 ============ */
.zh-table {
  background: transparent;

  :deep(.el-table__inner-wrapper::before) { display: none; }
  :deep(th.el-table__cell) {
    background: rgba(212, 175, 55, 0.06) !important;
    color: rgba(212, 175, 55, 0.75);
    font-weight: 600;
    font-size: 12px;
    letter-spacing: 0.06em;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  }
  :deep(td.el-table__cell) {
    background: transparent;
    border-bottom: 1px solid rgba(212, 175, 55, 0.06);
    color: var(--text-body, #B8B8C0);
  }
  :deep(.el-table__row:hover > td) { background: rgba(245, 158, 11, 0.06) !important; }
  :deep(.el-table__row.el-table__row--striped > td) { background: rgba(255, 255, 255, 0.015) !important; }
  :deep(.el-table__expanded-cell) {
    background: rgba(11, 11, 18, 0.6) !important;
    padding: 16px 28px !important;
  }
}
.num-pos { color: #67C23A; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
.num-neg { color: #F56C6C; font-family: 'JetBrains Mono', monospace; font-weight: 600; }
.dim { color: var(--text-muted, #888); }

.result-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  .rt-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    box-shadow: 0 0 8px currentColor;
  }
  &.rt-success { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
  &.rt-fail { color: #F56C6C; background: rgba(245, 108, 108, 0.12); }
  &.rt-partial { color: #E6A23C; background: rgba(230, 162, 60, 0.12); }
}

.log-detail {
  font-size: 13px;

  .ld-head {
    margin-bottom: 10px;
    color: rgba(212, 175, 55, 0.7);
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.05em;
  }
  .ld-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .ld-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 10px;
    background: rgba(212, 175, 55, 0.03);
    border-left: 2px solid rgba(212, 175, 55, 0.2);
    border-radius: 4px;
  }
  .ld-id {
    font-size: 11px;
    color: rgba(212, 175, 55, 0.5);
    width: 60px;
  }
  .ld-name { color: var(--text-primary, #F5F5F5); width: 140px; }
  .ld-status {
    padding: 1px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    width: 40px;
    text-align: center;

    &.ls-ok { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
    &.ls-fail { color: #F56C6C; background: rgba(245, 108, 108, 0.12); }
  }
  .ld-msg { color: var(--text-muted, #888); font-size: 12px; }
}

.pager-row { display: flex; justify-content: flex-end; margin-top: 14px; }

/* ============ 监控 ============ */
.runtime-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.runtime-card {
  position: relative;
  padding: 18px 20px 14px;
  border-radius: 10px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.02), transparent),
    rgba(11, 11, 18, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.12);
  overflow: hidden;
  --accent: #F59E0B;
  --accent-soft: rgba(245, 158, 11, 0.1);

  &.theme-cyan { --accent: #06B6D4; --accent-soft: rgba(6, 182, 212, 0.1); }
  &.theme-gold { --accent: #F59E0B; --accent-soft: rgba(245, 158, 11, 0.1); }
  &.theme-emerald { --accent: #10B981; --accent-soft: rgba(16, 185, 129, 0.1); }
  &.theme-rose { --accent: #F43F5E; --accent-soft: rgba(244, 63, 94, 0.1); }

  .rt-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--accent), transparent);
  }
  &.rt-running .rt-bar {
    background: linear-gradient(90deg, var(--accent), var(--accent), transparent);
    background-size: 200% 100%;
    animation: streamShift 1.5s linear infinite;
  }
}
@keyframes streamShift {
  from { background-position: 0% 0; }
  to { background-position: -200% 0; }
}
.rt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.rt-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);
}
.rt-num {
  font-size: 32px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.1;
}
.rt-meta {
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--text-muted, #888);
  margin-top: 2px;
}
.rt-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed rgba(212, 175, 55, 0.1);
  font-size: 11px;
  color: var(--text-muted, #888);

  em {
    font-style: normal;
    color: var(--accent);
    font-weight: 600;
    font-size: 13px;
  }
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 18px;
}
.today-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.ts-cell {
  padding: 14px 16px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 8px;

  .ts-key {
    display: block;
    font-size: 12px;
    color: var(--text-muted, #888);
    margin-bottom: 6px;
  }
  .ts-val {
    font-size: 24px;
    font-weight: 700;
    color: var(--text-primary, #F5F5F5);

    &.pos { color: #67C23A; }
    &.neg { color: #F56C6C; }
    &.accent { color: #F59E0B; }
  }
}

.trend-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  height: 180px;
  padding: 6px 4px 0;
}
.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  height: 100%;

  .bar-stack {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    position: relative;
  }
  .bar-fill {
    width: 70%;
    background: linear-gradient(180deg, #F59E0B, rgba(245, 158, 11, 0.4));
    border-radius: 4px 4px 0 0;
    border-bottom: 2px solid #F59E0B;
    box-shadow: 0 0 16px -4px #F59E0B;
    transition: height 0.4s ease;
  }
  .bar-num {
    position: absolute;
    bottom: 100%;
    margin-bottom: 4px;
    font-size: 11px;
    color: rgba(212, 175, 55, 0.7);
  }
  .bar-date {
    font-size: 11px;
    color: var(--text-muted, #888);
    letter-spacing: 0.05em;
  }
}

.health-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.health-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background:
    repeating-linear-gradient(45deg, transparent 0 12px, rgba(103, 194, 58, 0.02) 12px 13px),
    rgba(11, 11, 18, 0.5);
  border: 1px solid rgba(103, 194, 58, 0.2);
  border-left: 3px solid #67C23A;
  border-radius: 8px;

  .hc-icon {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: rgba(103, 194, 58, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #67C23A;
    font-size: 20px;
    flex-shrink: 0;
  }
  .hc-meta { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
  .hc-key {
    font-size: 11px;
    letter-spacing: 0.1em;
    color: var(--text-muted, #888);
  }
  .hc-val {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  .hc-sub {
    font-size: 10px;
    letter-spacing: 0.15em;
    color: rgba(103, 194, 58, 0.6);
  }
}

@media (max-width: 1280px) {
  .flow-board { grid-template-columns: 1fr; }
  .runtime-row { grid-template-columns: repeat(2, 1fr); }
  .grid-2 { grid-template-columns: 1fr; }
  .health-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .runtime-row,
  .health-row { grid-template-columns: 1fr; }
}
</style>

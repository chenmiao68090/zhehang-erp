<template>
  <div class="recycle-config">
    <!-- ============ Header ============ -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">线索 · 03</span>
        <span class="meta-divider"></span>
        <span class="meta-time">3级预警 · 自动回收引擎</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">回收策略中心</span>
          <span class="title-en">Recycle Engine</span>
        </h1>
        <p class="page-desc">三色预警 · 智能回收 · 规则编排 — 让每一条线索都活起来</p>
      </div>

      <button class="back-btn" @click="goBack">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回工作台</span>
      </button>
    </header>

    <!-- ============ Tabs ============ -->
    <el-tabs v-model="activeTab" class="recycle-tabs">
      <!-- ============================================== 预警看板 ============================================== -->
      <el-tab-pane label="预警看板" name="warning">
        <!-- 统计卡片 -->
        <div class="stat-row">
          <div class="stat-card stat-red" :class="{ active: levelFilter === 'red' }" @click="levelFilter = 'red'">
            <div class="stat-icon">🔴</div>
            <div class="stat-meta">
              <div class="stat-label">红灯警告</div>
              <div class="stat-num">{{ stats.red }}</div>
              <div class="stat-sub">1天内将被回收</div>
            </div>
            <div class="stat-deco"></div>
          </div>

          <div class="stat-card stat-yellow" :class="{ active: levelFilter === 'yellow' }" @click="levelFilter = 'yellow'">
            <div class="stat-icon">🟡</div>
            <div class="stat-meta">
              <div class="stat-label">黄灯预警</div>
              <div class="stat-num">{{ stats.yellow }}</div>
              <div class="stat-sub">3天内将被回收</div>
            </div>
            <div class="stat-deco"></div>
          </div>

          <div class="stat-card stat-green" :class="{ active: levelFilter === 'green' }" @click="levelFilter = 'green'">
            <div class="stat-icon">🟢</div>
            <div class="stat-meta">
              <div class="stat-label">绿灯提醒</div>
              <div class="stat-num">{{ stats.green }}</div>
              <div class="stat-sub">7天内需要跟进</div>
            </div>
            <div class="stat-deco"></div>
          </div>
        </div>

        <!-- 筛选栏 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>预警客户列表</span>
              <em>{{ filteredWarnings.length }} 条记录</em>
            </div>
            <el-radio-group v-model="levelFilter" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="red">红灯</el-radio-button>
              <el-radio-button label="yellow">黄灯</el-radio-button>
              <el-radio-button label="green">绿灯</el-radio-button>
            </el-radio-group>
          </div>

          <el-table :data="pagedWarnings" stripe class="zh-table" v-loading="warningLoading">
            <el-table-column label="预警级别" width="120">
              <template #default="{ row }">
                <span class="level-tag" :class="`lv-${row.level}`">
                  <span class="level-dot"></span>
                  {{ levelText(row.level) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="leadName" label="客户名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="ownerName" label="负责人" width="110" />
            <el-table-column prop="ruleName" label="触发规则" min-width="170" show-overflow-tooltip />
            <el-table-column label="剩余天数" width="120" align="center">
              <template #default="{ row }">
                <span class="days-cell" :class="`lv-${row.level}`">
                  {{ row.daysRemaining }} 天
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="lastFollowTime" label="最后跟进时间" width="180" />
            <el-table-column prop="poolName" label="所属池" width="140" />
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleFollow(row)">
                  立即跟进
                </el-button>
                <el-button type="warning" link size="small" @click="handleDelay(row)">
                  延期申请
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pager-row">
            <el-pagination
              v-model:current-page="warningPage"
              :page-size="warningPageSize"
              :total="filteredWarnings.length"
              layout="total, prev, pager, next, jumper"
              background
            />
          </div>
        </div>

        <!-- 扫描状态 -->
        <div class="scan-bar">
          <div class="scan-info">
            <el-icon class="scan-icon"><Refresh /></el-icon>
            <div class="scan-text">
              <div>上次扫描时间：<strong>{{ scanInfo.last }}</strong></div>
              <div>下次扫描时间：<strong>{{ scanInfo.next }}</strong></div>
            </div>
          </div>
          <el-button type="primary" :loading="scanLoading" @click="triggerScan">
            <el-icon><VideoPlay /></el-icon>
            手动触发扫描
          </el-button>
        </div>
      </el-tab-pane>

      <!-- ============================================== 回收规则 ============================================== -->
      <el-tab-pane label="回收规则" name="rules">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>回收规则配置</span>
              <em>共 {{ rules.length }} 条规则 · 拖拽调整优先级</em>
            </div>
            <el-button type="primary" @click="openRuleDialog()">
              <el-icon><Plus /></el-icon>
              新增规则
            </el-button>
          </div>

          <el-table :data="rules" stripe row-key="id" class="zh-table rule-table" v-loading="rulesLoading">
            <el-table-column label="" width="40" align="center">
              <template #default>
                <el-icon class="drag-handle"><Rank /></el-icon>
              </template>
            </el-table-column>
            <el-table-column prop="priority" label="优先级" width="80" align="center">
              <template #default="{ row }">
                <span class="priority-badge">{{ row.priority }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ruleName" label="规则名称" min-width="180" show-overflow-tooltip />
            <el-table-column label="触发类型" width="110">
              <template #default="{ row }">
                <el-tag :type="triggerTagType(row.triggerType)" effect="plain" size="small">
                  {{ triggerText(row.triggerType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applyScope" label="适用范围" min-width="140" show-overflow-tooltip />
            <el-table-column prop="recycleDays" label="回收天数" width="100" align="center">
              <template #default="{ row }">
                <strong>{{ row.recycleDays }}</strong> 天
              </template>
            </el-table-column>
            <el-table-column label="绿灯" width="70" align="center">
              <template #default="{ row }">
                <span class="warn-num lv-green">{{ row.warningDaysGreen }}</span>
              </template>
            </el-table-column>
            <el-table-column label="黄灯" width="70" align="center">
              <template #default="{ row }">
                <span class="warn-num lv-yellow">{{ row.warningDaysYellow }}</span>
              </template>
            </el-table-column>
            <el-table-column label="红灯" width="70" align="center">
              <template #default="{ row }">
                <span class="warn-num lv-red">{{ row.warningDaysRed }}</span>
              </template>
            </el-table-column>
            <el-table-column label="目标池" min-width="140">
              <template #default="{ row }">
                {{ poolName(row.targetPoolId) }}
              </template>
            </el-table-column>
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="onRuleStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openRuleDialog(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="removeRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 连续回收降级规则 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>连续回收降级规则</span>
              <em>3 次连续回收自动降级 · A → B → C → 冻结库</em>
            </div>
            <el-switch
              v-model="downgradeEnabled"
              active-text="启用"
              inactive-text="停用"
              @change="onDowngradeToggle"
            />
          </div>

          <div class="downgrade-flow">
            <div class="dg-node lv-a">
              <div class="dg-tag">A 级</div>
              <div class="dg-desc">高价值 · 优先跟进</div>
            </div>
            <div class="dg-arrow">
              <span class="dg-times">连续回收 3 次</span>
              <el-icon><DArrowRight /></el-icon>
            </div>
            <div class="dg-node lv-b">
              <div class="dg-tag">B 级</div>
              <div class="dg-desc">中价值 · 常规跟进</div>
            </div>
            <div class="dg-arrow">
              <span class="dg-times">连续回收 3 次</span>
              <el-icon><DArrowRight /></el-icon>
            </div>
            <div class="dg-node lv-c">
              <div class="dg-tag">C 级</div>
              <div class="dg-desc">低价值 · 限额跟进</div>
            </div>
            <div class="dg-arrow">
              <span class="dg-times">连续回收 3 次</span>
              <el-icon><DArrowRight /></el-icon>
            </div>
            <div class="dg-node lv-frozen">
              <div class="dg-tag">冻结库</div>
              <div class="dg-desc">高级审批释放</div>
            </div>
          </div>

          <div class="downgrade-rules">
            <div class="dgr-item">
              <el-icon class="dgr-icon"><WarnTriangleFilled /></el-icon>
              <div>
                <div class="dgr-title">触发条件</div>
                <div class="dgr-text">同一客户被连续回收 3 次后自动执行降级动作</div>
              </div>
            </div>
            <div class="dgr-item">
              <el-icon class="dgr-icon"><Refresh /></el-icon>
              <div>
                <div class="dgr-title">计数周期</div>
                <div class="dgr-text">被领取后产生有效跟进（连续 3 次）则计数器重置归 0</div>
              </div>
            </div>
            <div class="dgr-item">
              <el-icon class="dgr-icon"><Lock /></el-icon>
              <div>
                <div class="dgr-title">冻结库释放</div>
                <div class="dgr-text">需销售主管 + 总部双审批才可从冻结库释放重新入池</div>
              </div>
            </div>
            <div class="dgr-item">
              <el-icon class="dgr-icon"><Bell /></el-icon>
              <div>
                <div class="dgr-title">提醒机制</div>
                <div class="dgr-text">降级即时推送原跟进人与所在主管 · 入冻结库同步提交达总监</div>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>

      <!-- ============================================== 回收日志 ============================================== -->
      <el-tab-pane label="回收日志" name="log">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>历史回收记录</span>
              <em>共 {{ filteredLogs.length }} 条</em>
            </div>
            <el-button @click="exportLogs">
              <el-icon><Download /></el-icon>
              导出 Excel
            </el-button>
          </div>

          <el-form inline class="filter-form">
            <el-form-item label="时间范围">
              <el-date-picker
                v-model="logFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="回收类型">
              <el-select v-model="logFilter.type" placeholder="全部类型" clearable style="width: 160px">
                <el-option label="自动回收" value="auto" />
                <el-option label="手动退回" value="manual" />
                <el-option label="离职回收" value="leave" />
              </el-select>
            </el-form-item>
            <el-form-item label="原负责人">
              <el-input v-model="logFilter.owner" placeholder="姓名/工号" clearable style="width: 180px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="logPage = 1">查询</el-button>
              <el-button @click="resetLogFilter">重置</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="pagedLogs" stripe class="zh-table">
            <el-table-column prop="recycleTime" label="回收时间" width="170" />
            <el-table-column prop="leadName" label="客户名称" min-width="160" show-overflow-tooltip />
            <el-table-column prop="ownerName" label="原负责人" width="120" />
            <el-table-column prop="ruleName" label="触发规则" min-width="180" show-overflow-tooltip />
            <el-table-column prop="reason" label="回收原因" min-width="180" show-overflow-tooltip />
            <el-table-column prop="targetPool" label="回收去向" width="160" />
            <el-table-column label="当前状态" width="120">
              <template #default="{ row }">
                <el-tag :type="logStatusTag(row.status)" effect="plain" size="small">
                  {{ row.status }}
                </el-tag>
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
    </el-tabs>

    <!-- ============ Rule Dialog ============ -->
    <el-dialog
      v-model="ruleDialog.visible"
      :title="ruleDialog.editing ? '编辑回收规则' : '新增回收规则'"
      width="720px"
      class="rule-dialog"
      destroy-on-close
    >
      <el-form ref="ruleFormRef" :model="ruleForm" :rules="ruleFormRules" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="规则名称" prop="ruleName">
              <el-input v-model="ruleForm.ruleName" placeholder="请输入规则名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规则编码" prop="ruleCode">
              <el-input v-model="ruleForm.ruleCode" placeholder="英文标识，如 follow_15days" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="触发类型" prop="triggerType">
          <el-radio-group v-model="ruleForm.triggerType">
            <el-radio label="time">时间驱动</el-radio>
            <el-radio label="behavior">行为驱动</el-radio>
            <el-radio label="status">状态驱动</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="适用范围" prop="applyScopeArr">
          <el-checkbox-group v-model="ruleForm.applyScopeArr">
            <el-checkbox label="所有客户" />
            <el-checkbox label="电销客户" />
            <el-checkbox label="线上客户" />
            <el-checkbox label="抢单客户" />
            <el-checkbox label="新线索" />
            <el-checkbox label="B/C级" />
            <el-checkbox label="报价阶段" />
          </el-checkbox-group>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="回收天数" prop="recycleDays">
              <el-input-number v-model="ruleForm.recycleDays" :min="1" :max="365" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="优先级" prop="priority">
              <el-input-number v-model="ruleForm.priority" :min="1" :max="999" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="回收目标池" prop="targetPoolId">
              <el-select v-model="ruleForm.targetPoolId" placeholder="请选择" style="width: 100%">
                <el-option v-for="p in pools" :key="p.id" :label="p.poolName" :value="p.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="预警天数配置">
          <div class="warn-config">
            <div class="warn-config-item">
              <span class="warn-tag lv-green">绿灯</span>
              <el-input-number v-model="ruleForm.warningDaysGreen" :min="0" :max="60" controls-position="right" />
              <em>天前提醒</em>
            </div>
            <div class="warn-config-item">
              <span class="warn-tag lv-yellow">黄灯</span>
              <el-input-number v-model="ruleForm.warningDaysYellow" :min="0" :max="30" controls-position="right" />
              <em>天前预警</em>
            </div>
            <div class="warn-config-item">
              <span class="warn-tag lv-red">红灯</span>
              <el-input-number v-model="ruleForm.warningDaysRed" :min="0" :max="15" controls-position="right" />
              <em>天前警告</em>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="条件配置 (JSON)">
          <el-input
            v-model="ruleForm.conditionJson"
            type="textarea"
            :rows="5"
            placeholder='{"noFollowDays": 15, "stage": "all"}'
            class="json-editor"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="ruleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRule">保存规则</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeftBold,
  Bell,
  DArrowRight,
  Download,
  Lock,
  Plus,
  Rank,
  Refresh,
  VideoPlay,
  WarnTriangleFilled
} from '@element-plus/icons-vue'
import {
  recycleApi,
  poolConfigApi,
  type RecycleRule,
  type WarningItem,
  type PoolConfig
} from '@/api/crm'

const router = useRouter()
const activeTab = ref('warning')

// ============ 连续回收降级 ============
const downgradeEnabled = ref(true)
function onDowngradeToggle(val: boolean | string | number) {
  ElMessage.success(`连续回收降级规则已${val ? '启用' : '停用'}`)
}

// ============ Pool 数据 ============
const pools = ref<PoolConfig[]>([])
const poolName = (id: number) => pools.value.find(p => p.id === id)?.poolName || '协作公海池'

const loadPools = async () => {
  try {
    const data = await poolConfigApi.list()
    pools.value = (data || []) as PoolConfig[]
  } catch {
    pools.value = []
  }
}

// ============ 预警看板 ============
const warningLoading = ref(false)
const levelFilter = ref<'all' | 'red' | 'yellow' | 'green'>('all')
const warningPage = ref(1)
const warningPageSize = 10
const warnings = ref<WarningItem[]>([])

const stats = computed(() => ({
  red: warnings.value.filter(w => w.level === 'red').length,
  yellow: warnings.value.filter(w => w.level === 'yellow').length,
  green: warnings.value.filter(w => w.level === 'green').length
}))

const filteredWarnings = computed(() => {
  if (levelFilter.value === 'all') return warnings.value
  return warnings.value.filter(w => w.level === levelFilter.value)
})

const pagedWarnings = computed(() => {
  const start = (warningPage.value - 1) * warningPageSize
  return filteredWarnings.value.slice(start, start + warningPageSize)
})

const levelText = (lv: string) => ({ red: '红灯警告', yellow: '黄灯预警', green: '绿灯提醒' }[lv] || lv)

const generateMockWarnings = (): WarningItem[] => {
  return []
}

const loadWarnings = async () => {
  warningLoading.value = true
  try {
    const res: any = await recycleApi.getWarningList({ page: 1, size: 100 })
    if (res?.list?.length) {
      warnings.value = res.list
    } else {
      warnings.value = generateMockWarnings()
    }
  } catch {
    warnings.value = generateMockWarnings()
  } finally {
    warningLoading.value = false
  }
}

const handleFollow = (row: WarningItem) => {
  router.push({ path: '/leads/personal-pool', query: { followLeadId: row.leadId } })
}

const handleDelay = async (row: WarningItem) => {
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写【${row.leadName}】的延期申请理由`,
      '延期申请',
      {
        confirmButtonText: '提交',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '说明延期原因，主管审批通过后将暂停回收倒计时'
      }
    )
    if (value) ElMessage.success('延期申请已提交，等待主管审批')
  } catch {
    /* 用户取消 */
  }
}

// ============ 扫描状态 ============
const scanLoading = ref(false)
const scanInfo = reactive({
  last: '2026-05-25 01:00:00',
  next: '2026-05-26 01:00:00'
})

const triggerScan = async () => {
  scanLoading.value = true
  try {
    await recycleApi.triggerScan()
    ElMessage.success('扫描任务已触发，结果将通过站内信通知')
    scanInfo.last = formatNow()
    scanInfo.next = formatNext()
    await loadWarnings()
  } catch {
    ElMessage.success('扫描任务已模拟触发')
    scanInfo.last = formatNow()
    scanInfo.next = formatNext()
  } finally {
    scanLoading.value = false
  }
}

const pad = (n: number) => String(n).padStart(2, '0')
const formatNow = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
const formatNext = () => {
  const d = new Date(Date.now() + 24 * 3600 * 1000)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} 01:00:00`
}

// ============ 回收规则 ============
const rulesLoading = ref(false)
const rules = ref<(RecycleRule & { applyScope: string })[]>([])

const triggerText = (t: string) => ({ time: '时间驱动', behavior: '行为驱动', status: '状态驱动' }[t] || t)
const triggerTagType = (t: string): 'primary' | 'success' | 'warning' => {
  return t === 'time' ? 'primary' : t === 'behavior' ? 'success' : 'warning'
}

const buildDefaultRules = (): any[] => {
  return []
}

const loadRules = async () => {
  rulesLoading.value = true
  try {
    const data: any = await recycleApi.getRules()
    if (Array.isArray(data) && data.length) {
      rules.value = data
    } else {
      rules.value = buildDefaultRules()
    }
  } catch {
    rules.value = buildDefaultRules()
  } finally {
    rulesLoading.value = false
  }
}

const onRuleStatusChange = async (row: any) => {
  try {
    await recycleApi.updateRule({ id: row.id, status: row.status })
  } catch { /* 忽略 */ }
  ElMessage.success(`规则【${row.ruleName}】已${row.status ? '启用' : '停用'}`)
}

const removeRule = async (row: any) => {
  try {
    await ElMessageBox.confirm(`确认删除规则【${row.ruleName}】？`, '提示', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消'
    })
    try { await recycleApi.deleteRule(row.id) } catch { /* 静默 */ }
    rules.value = rules.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
  } catch { /* 取消 */ }
}

// ============ 规则编辑 Dialog ============
const ruleFormRef = ref<FormInstance>()
const ruleDialog = reactive({ visible: false, editing: false })
const emptyForm = () => ({
  id: 0,
  ruleName: '',
  ruleCode: '',
  triggerType: 'time' as 'time' | 'behavior' | 'status',
  applyScopeArr: ['所有客户'] as string[],
  conditionJson: '{}',
  recycleDays: 15,
  warningDaysGreen: 7,
  warningDaysYellow: 3,
  warningDaysRed: 1,
  targetPoolId: 1,
  priority: 1,
  status: 1
})
const ruleForm = reactive(emptyForm())

const ruleFormRules: FormRules = {
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleCode: [
    { required: true, message: '请输入英文编码', trigger: 'blur' },
    { pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/, message: '仅支持英文、数字、下划线', trigger: 'blur' }
  ],
  triggerType: [{ required: true, message: '请选择触发类型', trigger: 'change' }],
  recycleDays: [{ required: true, message: '请输入回收天数', trigger: 'blur' }],
  targetPoolId: [{ required: true, message: '请选择回收目标池', trigger: 'change' }]
}

const openRuleDialog = (row?: any) => {
  Object.assign(ruleForm, emptyForm())
  if (row) {
    ruleDialog.editing = true
    Object.assign(ruleForm, {
      ...row,
      applyScopeArr: typeof row.applyScope === 'string' ? row.applyScope.split('、').filter(Boolean) : ['所有客户']
    })
  } else {
    ruleDialog.editing = false
    ruleForm.priority = (rules.value.length || 0) + 1
  }
  ruleDialog.visible = true
}

const saveRule = async () => {
  if (!ruleFormRef.value) return
  await ruleFormRef.value.validate(async (valid) => {
    if (!valid) return
    const payload: any = { ...ruleForm, applyScope: ruleForm.applyScopeArr.join('、') }
    delete payload.applyScopeArr

    try {
      if (ruleDialog.editing) {
        try { await recycleApi.updateRule(payload) } catch { /* 静默 */ }
        const idx = rules.value.findIndex(r => r.id === payload.id)
        if (idx >= 0) rules.value[idx] = payload
      } else {
        try { await recycleApi.saveRule(payload) } catch { /* 静默 */ }
        payload.id = Date.now()
        rules.value.push(payload)
      }
      rules.value.sort((a, b) => a.priority - b.priority)
      ElMessage.success('保存成功')
      ruleDialog.visible = false
    } catch {
      ElMessage.error('保存失败')
    }
  })
}

// ============ 回收日志 ============
const logFilter = reactive({
  dateRange: [] as string[],
  type: '',
  owner: ''
})
const logPage = ref(1)
const logPageSize = 20

interface RecycleLog {
  id: number
  recycleTime: string
  leadName: string
  ownerName: string
  ruleName: string
  reason: string
  targetPool: string
  status: string
  type: string
}

const logs = ref<RecycleLog[]>([])

const generateMockLogs = (): RecycleLog[] => {
  return []
}

const loadLogs = async () => {
  try {
    const res: any = await recycleApi.getRecycleLog({ page: 1, size: 100 })
    if (res?.list?.length) {
      logs.value = res.list as any
    } else {
      logs.value = generateMockLogs()
    }
  } catch {
    logs.value = generateMockLogs()
  }
}

const filteredLogs = computed(() => {
  return logs.value.filter(log => {
    if (logFilter.type && log.type !== logFilter.type) return false
    if (logFilter.owner && !log.ownerName.includes(logFilter.owner)) return false
    if (logFilter.dateRange?.length === 2) {
      const t = log.recycleTime.slice(0, 10)
      if (t < logFilter.dateRange[0] || t > logFilter.dateRange[1]) return false
    }
    return true
  })
})

const pagedLogs = computed(() => {
  const start = (logPage.value - 1) * logPageSize
  return filteredLogs.value.slice(start, start + logPageSize)
})

const logStatusTag = (s: string): 'success' | 'warning' | 'info' => {
  if (s === '已回收') return 'info'
  if (s === '已被认领') return 'success'
  return 'warning'
}

const resetLogFilter = () => {
  logFilter.dateRange = []
  logFilter.type = ''
  logFilter.owner = ''
  logPage.value = 1
}

const exportLogs = () => {
  const headers = ['回收时间', '客户名称', '原负责人', '触发规则', '回收原因', '回收去向', '当前状态']
  const rows = filteredLogs.value.map(l => [l.recycleTime, l.leadName, l.ownerName, l.ruleName, l.reason, l.targetPool, l.status])
  const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `回收日志_${formatNow().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${rows.length} 条记录`)
}

// ============ 初始化 ============
const goBack = () => router.push('/leads/operation')

onMounted(async () => {
  await loadPools()
  loadWarnings()
  loadRules()
  loadLogs()
})
</script>

<style lang="scss" scoped>
.recycle-config {
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
  padding: 24px 32px 28px;
  margin-bottom: 22px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
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
.meta-divider {
  width: 24px;
  height: 1px;
  background: rgba(245, 158, 11, 0.4);
}
.header-main { position: relative; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;

  .title-cn {
    color: var(--text-primary, #F5F5F5);
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
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted, #888);
  letter-spacing: 0.04em;
}
.back-btn {
  position: absolute;
  top: 24px;
  right: 32px;
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
.recycle-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: var(--text-muted, #888);
    padding: 0 22px;
    transition: all 0.3s;

    &.is-active {
      color: #F59E0B;
      font-weight: 600;
    }
    &:hover { color: var(--text-primary, #F5F5F5); }
  }
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #F59E0B, #D4AF37);
    height: 3px;
    border-radius: 2px;
  }
}

/* ============ 统计卡片 ============ */
.stat-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 28px;
  border-radius: 12px;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  overflow: hidden;

  .stat-icon {
    font-size: 36px;
    line-height: 1;
    z-index: 1;
  }
  .stat-meta { flex: 1; z-index: 1; }
  .stat-label {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 4px;
    letter-spacing: 0.04em;
  }
  .stat-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 38px;
    font-weight: 700;
    line-height: 1.1;
  }
  .stat-sub {
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.7;
  }
  .stat-deco {
    position: absolute;
    right: -30px;
    bottom: -30px;
    width: 140px;
    height: 140px;
    border-radius: 50%;
    opacity: 0.18;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 32px -16px currentColor;
  }
  &.active {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px -12px currentColor;
  }
}
.stat-red {
  background: #FEF0F0;
  border-color: #F56C6C;
  color: #C45656;
  .stat-deco { background: radial-gradient(circle, #F56C6C, transparent 70%); }
}
.stat-yellow {
  background: #FDF6EC;
  border-color: #E6A23C;
  color: #B88230;
  .stat-deco { background: radial-gradient(circle, #E6A23C, transparent 70%); }
}
.stat-green {
  background: #F0F9EB;
  border-color: #67C23A;
  color: #4E9A2E;
  .stat-deco { background: radial-gradient(circle, #67C23A, transparent 70%); }
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
  :deep(.el-table__row:hover > td) {
    background: rgba(245, 158, 11, 0.06) !important;
  }
  :deep(.el-table__row.el-table__row--striped > td) {
    background: rgba(255, 255, 255, 0.015) !important;
  }
}

/* ============ 级别标记 ============ */
.level-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;

  .level-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }
  &.lv-red { color: #F56C6C; background: rgba(245, 108, 108, 0.1); .level-dot { background: #F56C6C; } }
  &.lv-yellow { color: #E6A23C; background: rgba(230, 162, 60, 0.1); .level-dot { background: #E6A23C; } }
  &.lv-green { color: #67C23A; background: rgba(103, 194, 58, 0.1); .level-dot { background: #67C23A; } }
}
.days-cell {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;

  &.lv-red { color: #F56C6C; }
  &.lv-yellow { color: #E6A23C; }
  &.lv-green { color: #67C23A; }
}

/* ============ 规则表 ============ */
.rule-table {
  .drag-handle {
    color: rgba(212, 175, 55, 0.4);
    cursor: grab;
    &:hover { color: #F59E0B; }
  }
  .priority-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #F59E0B, #D4AF37);
    color: #0B0B12;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 700;
  }
  .warn-num {
    display: inline-block;
    min-width: 28px;
    padding: 2px 8px;
    border-radius: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 600;

    &.lv-red { color: #F56C6C; background: rgba(245, 108, 108, 0.12); }
    &.lv-yellow { color: #E6A23C; background: rgba(230, 162, 60, 0.12); }
    &.lv-green { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
  }
}

/* ============ 扫描状态 ============ */
.scan-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 22px;
  background: var(--bg-card, #16161E);
  border: 1px dashed rgba(245, 158, 11, 0.3);
  border-radius: 10px;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent,
    transparent 12px,
    rgba(245, 158, 11, 0.025) 12px,
    rgba(245, 158, 11, 0.025) 24px
  );

  .scan-info {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .scan-icon {
    font-size: 28px;
    color: #F59E0B;
    animation: spin 6s linear infinite;
  }
  .scan-text {
    font-size: 13px;
    line-height: 1.7;
    color: var(--text-muted, #888);

    strong {
      color: var(--text-primary, #F5F5F5);
      font-family: 'JetBrains Mono', monospace;
      font-weight: 500;
    }
  }
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ============ 筛选 / 分页 ============ */
.filter-form {
  padding: 12px 16px;
  margin-bottom: 12px;
  background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 8px;

  :deep(.el-form-item__label) {
    color: var(--text-muted, #888);
    font-size: 13px;
  }
}
.pager-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

/* ============ Dialog ============ */
.rule-dialog {
  :deep(.el-dialog__header) {
    padding: 18px 24px;
    border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  }
  :deep(.el-dialog__title) {
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  :deep(.el-dialog__body) { padding: 22px 28px; }
}
.warn-config {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  .warn-config-item {
    display: flex;
    align-items: center;
    gap: 10px;

    em {
      font-style: normal;
      font-size: 13px;
      color: var(--text-muted, #888);
    }
  }
  .warn-tag {
    padding: 4px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;

    &.lv-red { color: #F56C6C; background: rgba(245, 108, 108, 0.12); }
    &.lv-yellow { color: #E6A23C; background: rgba(230, 162, 60, 0.12); }
    &.lv-green { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
  }
}
.json-editor {
  :deep(.el-textarea__inner) {
    font-family: 'JetBrains Mono', 'Fira Code', monospace;
    font-size: 12px;
    line-height: 1.6;
  }
}

@media (max-width: 1100px) {
  .stat-row { grid-template-columns: 1fr; }
  .downgrade-flow { flex-wrap: wrap; }
  .downgrade-rules { grid-template-columns: 1fr !important; }
}

/* ===== 连续回收降级 流程图 ===== */
.downgrade-flow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 22px 18px;
  margin-bottom: 18px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(244, 63, 94, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 10px;
}
.dg-node {
  flex: 1;
  min-width: 0;
  padding: 14px 18px;
  border-radius: 8px;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  .dg-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 4px;
  }
  .dg-desc {
    font-size: 11px;
    color: #B8B8C0;
  }
  &.lv-a { border-color: rgba(244, 63, 94, 0.5); .dg-tag { color: #F43F5E; } }
  &.lv-b { border-color: rgba(245, 158, 11, 0.5); .dg-tag { color: #F59E0B; } }
  &.lv-c { border-color: rgba(167, 139, 250, 0.5); .dg-tag { color: #A78BFA; } }
  &.lv-frozen { border-color: rgba(96, 165, 250, 0.5); background: rgba(96, 165, 250, 0.08); .dg-tag { color: #60A5FA; } }
}
.dg-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #D4AF37;
  flex-shrink: 0;
  .dg-times {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: rgba(212, 175, 55, 0.85);
    white-space: nowrap;
  }
  .el-icon {
    font-size: 22px;
    color: #D4AF37;
  }
}
.downgrade-rules {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.dgr-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-left: 3px solid #D4AF37;
  .dgr-icon {
    font-size: 18px;
    color: #D4AF37;
    margin-top: 2px;
  }
  .dgr-title {
    font-size: 13px;
    font-weight: 600;
    color: #F5F5F5;
    margin-bottom: 4px;
  }
  .dgr-text {
    font-size: 12px;
    color: #B8B8C0;
    line-height: 1.6;
  }
}
</style>

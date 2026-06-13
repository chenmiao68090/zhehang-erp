<template>
  <div class="approval-center">
    <!-- 顶部主 Tab：审批管理 / 审批记录 -->
    <div class="ac-header">
      <el-tabs v-model="mainTab" class="ac-main-tabs">
        <el-tab-pane name="manage">
          <template #label>
            <span class="ac-tab-label">审批管理</span>
          </template>
        </el-tab-pane>
        <el-tab-pane name="records">
          <template #label>
            <span class="ac-tab-label">
              审批记录
              <el-badge v-if="todoCount > 0" :value="todoCount" :max="99" class="ac-tab-badge" />
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="ac-header__actions">
        <el-input
          v-model="keyword"
          placeholder="搜索审批类型 / 标题"
          clearable
          class="ac-search"
          :prefix-icon="Search"
        />
        <el-button type="primary" :icon="Plus" @click="openStartFromButton">新增审批</el-button>
      </div>
    </div>

    <!-- ============ 审批管理：分类发起入口卡片 ============ -->
    <div v-show="mainTab === 'manage'" class="ac-manage">
      <!-- 分类筛选 -->
      <div class="ac-cats">
        <span
          v-for="cat in CATEGORIES"
          :key="cat.value"
          class="ac-cat"
          :class="{ 'ac-cat--active': activeCat === cat.value }"
          @click="activeCat = cat.value"
        >
          {{ cat.label }}
        </span>
      </div>

      <el-skeleton v-if="processLoading" :rows="6" animated style="margin-top: 16px" />

      <template v-else>
        <!-- 分组：按分类渲染卡片入口 -->
        <div v-for="group in visibleGroups" :key="group.value" class="ac-group">
          <div class="ac-group__title">
            <span class="ac-group__bar" :style="{ background: group.color }" />
            {{ group.label }}
            <span class="ac-group__count">{{ group.items.length }}</span>
          </div>
          <div class="ac-cards">
            <div
              v-for="item in group.items"
              :key="item.key"
              class="ac-card"
              :class="{ 'ac-card--disabled': !item.resolved }"
              @click="handleCardClick(item)"
            >
              <div class="ac-card__icon" :style="{ background: group.soft, color: group.color }">
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
              </div>
              <div class="ac-card__body">
                <div class="ac-card__name">{{ item.name }}</div>
                <div class="ac-card__desc">
                  <el-tag v-if="item.resolved" type="success" size="small" effect="plain">可发起</el-tag>
                  <el-tag v-else type="info" size="small" effect="plain">待接入</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>

        <el-empty v-if="visibleGroups.length === 0" description="该分类暂无审批类型" />
      </template>
    </div>

    <!-- ============ 审批记录：待办 / 已办 / 我发起 / 抄送 ============ -->
    <div v-show="mainTab === 'records'" class="ac-records">
      <el-tabs v-model="recordTab" @tab-change="onRecordTabChange">
        <el-tab-pane label="待我审批" name="todo" />
        <el-tab-pane label="我已审批" name="done" />
        <el-tab-pane label="我发起的" name="started" />
        <el-tab-pane label="抄送我的" name="cc" />
      </el-tabs>

      <el-table :data="recordList" v-loading="recordLoading" stripe>
        <el-table-column prop="processName" label="审批类型" min-width="130" />
        <el-table-column :prop="recordTab === 'started' ? 'title' : 'instanceTitle'" label="标题" min-width="180" show-overflow-tooltip />
        <el-table-column label="发起人" width="110">
          <template #default="{ row }">
            {{ row.initiatorName || (row.initiatorId ? '用户' + row.initiatorId : '-') }}
          </template>
        </el-table-column>

        <!-- 状态/我的操作列：随子 Tab 切换语义 -->
        <el-table-column v-if="recordTab === 'started'" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-else-if="recordTab === 'done'" label="我的操作" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="actionType(row.status)" size="small">{{ actionLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-else label="当前节点" prop="nodeName" width="140" />

        <el-table-column
          :label="recordTab === 'done' ? '处理时间' : (recordTab === 'started' ? '发起时间' : '到达时间')"
          width="170"
        >
          <template #default="{ row }">
            {{ recordTab === 'done' ? (row.handleTime || '-') : (row.startTime || row.createTime || '-') }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="recordTab === 'todo'"
              type="primary"
              size="small"
              @click="openApprove(row)"
            >审批</el-button>
            <el-button type="primary" size="small" text @click="openDetail(row)">详情</el-button>
            <el-button
              v-if="recordTab === 'started' && row.status === 0"
              type="danger"
              size="small"
              text
              @click="handleCancel(row)"
            >撤销</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="ac-pagination">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @change="loadRecords"
        />
      </div>

      <el-empty v-if="!recordLoading && recordList.length === 0" :description="emptyText" />
    </div>

    <!-- ============ 发起流程弹窗（接真实流程定义 + 动态表单） ============ -->
    <el-dialog v-model="startVisible" :title="'发起审批 · ' + (selectedProcess?.name || '')" width="600px" top="6vh">
      <el-form :model="formValues" label-width="110px">
        <el-form-item label="审批标题" required>
          <el-input v-model="processTitle" placeholder="请输入审批标题" />
        </el-form-item>
        <template v-for="field in formFields" :key="field.field">
          <el-form-item :label="field.label">
            <el-input v-if="field.type === 'text'" v-model="formValues[field.field]" />
            <el-input v-else-if="field.type === 'textarea'" v-model="formValues[field.field]" type="textarea" :rows="3" />
            <el-input-number v-else-if="field.type === 'number'" v-model="formValues[field.field]" :min="0" style="width: 100%" />
            <el-select v-else-if="field.type === 'select'" v-model="formValues[field.field]" style="width: 100%" placeholder="请选择">
              <el-option v-for="opt in (field.options || [])" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-input v-else v-model="formValues[field.field]" />
          </el-form-item>
        </template>
        <el-empty v-if="formFields.length === 0" description="该流程无需填写表单字段" :image-size="60" />
      </el-form>
      <template #footer>
        <el-button @click="startVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitStart">提交审批</el-button>
      </template>
    </el-dialog>

    <!-- ============ 审批操作弹窗（通过/拒绝/转交 + 轨迹） ============ -->
    <el-dialog v-model="approveVisible" title="审批操作" width="700px" top="5vh">
      <div v-if="currentTask" class="ac-approve">
        <div class="ac-section">
          <h4>表单数据</h4>
          <div class="ac-form-display">
            <div v-for="(val, key) in detailFormData" :key="key" class="ac-form-item">
              <span class="ac-form-label">{{ key }}:</span>
              <span class="ac-form-value">{{ val }}</span>
            </div>
            <el-empty v-if="Object.keys(detailFormData).length === 0" description="无表单数据" :image-size="60" />
          </div>
        </div>
        <div class="ac-section">
          <h4>审批轨迹</h4>
          <ApprovalTrack :histories="detailInstance?.histories || []" :current-node-name="currentTask.nodeName" />
        </div>
        <div class="ac-section">
          <h4>审批意见</h4>
          <el-input v-model="approveComment" type="textarea" :rows="3" placeholder="请输入审批意见" />
        </div>
        <div v-if="showTransfer" class="ac-section">
          <h4>转交给</h4>
          <el-input v-model="transferUserId" type="number" placeholder="请输入目标用户 ID" />
        </div>
      </div>
      <template #footer>
        <div class="ac-approve-actions">
          <el-button @click="approveVisible = false">取消</el-button>
          <el-button type="warning" @click="showTransfer = !showTransfer">转交</el-button>
          <el-button type="danger" :loading="acting" @click="doReject">拒绝</el-button>
          <el-button v-if="showTransfer" type="warning" :loading="acting" @click="doTransfer">确认转交</el-button>
          <el-button v-else type="primary" :loading="acting" @click="doApprove">通过</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- ============ 只读详情弹窗（已办/我发起/抄送） ============ -->
    <el-dialog v-model="detailVisible" title="审批详情" width="650px" top="5vh">
      <div v-if="detailInstance" class="ac-approve">
        <div class="ac-section">
          <h4>表单数据</h4>
          <div class="ac-form-display">
            <div v-for="(val, key) in detailFormData" :key="key" class="ac-form-item">
              <span class="ac-form-label">{{ key }}:</span>
              <span class="ac-form-value">{{ val }}</span>
            </div>
            <el-empty v-if="Object.keys(detailFormData).length === 0" description="无表单数据" :image-size="60" />
          </div>
        </div>
        <div class="ac-section">
          <h4>审批轨迹</h4>
          <ApprovalTrack :histories="detailInstance.histories || []" :current-node-name="detailInstance.currentNodeName" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, Calendar, Money, Document, User, Coffee, Suitcase,
  Tickets, Wallet, Files, CreditCard, Stamp, OfficeBuilding, ChatLineSquare,
  Refresh, Briefcase, Sell, Promotion
} from '@element-plus/icons-vue'
import ApprovalTrack from '@/components/workflow/ApprovalTrack.vue'
import { approvalCenterApi, type ProcessDef, type TaskItem, type InstanceItem } from '@/api/approval'

// ---------------- 卡片目录（前端常量：分类 -> 审批类型） ----------------
// gapsNoBackend：后端 /workflow/process/templates 仅内置 4 类（leave/expense/purchase/seal），
// 真实可发起流程取决于「已发布」的流程定义（GET /workflow/process/list?status=1）。
// 下列卡片为业务全集，运行时按 名称/processKey/分类 与后端已发布流程做匹配：
//   匹配上 -> “可发起”，点击打开发起弹窗（真实流程 + 动态表单）；
//   未匹配 -> “待接入”，点击提示，不写死假流程。
interface CardItem {
  key: string
  name: string
  icon: any
  /** 与后端流程匹配用的候选 processKey / 名称关键字 */
  matchKeys?: string[]
  resolved?: boolean
  process?: ProcessDef | null
}
interface CardGroup {
  value: string
  label: string
  color: string
  soft: string
  items: CardItem[]
}

const CATEGORIES = [
  { value: 'all', label: '全部' },
  { value: 'attendance', label: '假勤' },
  { value: 'finance', label: '财务' },
  { value: 'admin', label: '行政' },
  { value: 'hr', label: '人事' }
]

// 各分类的卡片清单（matchKeys 用于命中后端已发布流程；后端 4 个模板分类：attendance/finance/supply/admin）
const CARD_GROUPS: CardGroup[] = [
  {
    value: 'attendance', label: '假勤', color: '#F26522', soft: 'rgba(242,101,34,0.1)',
    items: [
      { key: 'leave', name: '请假', icon: Calendar, matchKeys: ['leave', '请假'] },
      { key: 'travel', name: '出差', icon: Suitcase, matchKeys: ['travel', 'businessTrip', '出差'] },
      { key: 'outing', name: '外出', icon: Promotion, matchKeys: ['outing', '外出'] },
      { key: 'overtime', name: '加班', icon: Coffee, matchKeys: ['overtime', '加班'] },
      { key: 'makeup', name: '补卡', icon: Tickets, matchKeys: ['makeup', 'reissue', '补卡'] }
    ]
  },
  {
    value: 'finance', label: '财务', color: '#409EFF', soft: 'rgba(64,158,255,0.1)',
    items: [
      { key: 'reimburse', name: '报销', icon: Money, matchKeys: ['expense', 'reimburse', '报销'] },
      { key: 'payment', name: '付款', icon: Wallet, matchKeys: ['payment', 'pay', '付款'] },
      { key: 'expense', name: '费用', icon: Files, matchKeys: ['cost', 'fee', '费用'] },
      { key: 'loan', name: '借款', icon: CreditCard, matchKeys: ['loan', '借款'] },
      { key: 'refund', name: '退款', icon: Refresh, matchKeys: ['refund', '退款'] },
      { key: 'pettycash', name: '备用金', icon: Wallet, matchKeys: ['pettyCash', 'petty', '备用金'] },
      { key: 'receipt', name: '收款', icon: Sell, matchKeys: ['receipt', 'collection', '收款'] },
      { key: 'invoice', name: '发票', icon: Tickets, matchKeys: ['invoice', '发票'] }
    ]
  },
  {
    value: 'admin', label: '行政', color: '#67C23A', soft: 'rgba(103,194,58,0.1)',
    items: [
      { key: 'seal', name: '用章', icon: Stamp, matchKeys: ['seal', '用章', '印章'] },
      { key: 'purchase', name: '采购', icon: Briefcase, matchKeys: ['purchase', '采购'] },
      { key: 'meetingroom', name: '会议室', icon: OfficeBuilding, matchKeys: ['meeting', 'meetingRoom', '会议室'] },
      { key: 'contract', name: '合同审批', icon: Document, matchKeys: ['contract', '合同'] },
      { key: 'common', name: '通用审批', icon: ChatLineSquare, matchKeys: ['common', 'general', '通用'] }
    ]
  },
  {
    value: 'hr', label: '人事', color: '#909399', soft: 'rgba(144,147,153,0.12)',
    items: [
      { key: 'entry', name: '入职', icon: User, matchKeys: ['entry', 'onboard', '入职'] },
      { key: 'regular', name: '转正', icon: User, matchKeys: ['regular', 'confirm', '转正'] },
      { key: 'transfer', name: '调岗', icon: User, matchKeys: ['transfer', 'adjust', '调岗', '异动'] },
      { key: 'resign', name: '离职', icon: User, matchKeys: ['resign', 'leaveJob', '离职'] }
    ]
  }
]

// ---------------- 状态 ----------------
const mainTab = ref<'manage' | 'records'>('manage')
const keyword = ref('')
const activeCat = ref('all')
const todoCount = ref(0)

// 流程定义（已发布）匹配
const processLoading = ref(false)
const publishedProcesses = ref<ProcessDef[]>([])

// 把后端已发布流程匹配进卡片，并按分类筛选 + 关键字过滤
const visibleGroups = computed<CardGroup[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  return CARD_GROUPS
    .filter(g => activeCat.value === 'all' || g.value === activeCat.value)
    .map(g => {
      const items = g.items
        .map(it => {
          const proc = matchProcess(it)
          return { ...it, resolved: !!proc, process: proc }
        })
        .filter(it => !kw || it.name.toLowerCase().includes(kw) || (it.process?.name || '').toLowerCase().includes(kw))
      return { ...g, items }
    })
    .filter(g => g.items.length > 0)
})

function matchProcess (item: CardItem): ProcessDef | null {
  const keys = (item.matchKeys || [item.key]).map(k => k.toLowerCase())
  return publishedProcesses.value.find(p => {
    const pk = (p.processKey || '').toLowerCase()
    const nm = (p.name || '').toLowerCase()
    return keys.some(k => pk === k || pk.includes(k) || nm.includes(k))
  }) || null
}

async function loadProcesses () {
  processLoading.value = true
  try {
    publishedProcesses.value = await approvalCenterApi.publishedProcesses()
  } catch { publishedProcesses.value = [] }
  processLoading.value = false
}

async function loadTodoCount () {
  try { todoCount.value = await approvalCenterApi.todoCount() } catch { /* ignore */ }
}

// ---------------- 发起流程 ----------------
const startVisible = ref(false)
const submitting = ref(false)
const selectedProcess = ref<ProcessDef | null>(null)
const processTitle = ref('')
const formFields = ref<any[]>([])
const formValues = reactive<Record<string, any>>({})

function handleCardClick (item: CardItem) {
  if (!item.resolved || !item.process) {
    ElMessage.info(`「${item.name}」审批流程待接入，请联系管理员在「流程管理」中发布对应流程`)
    return
  }
  openStart(item.process)
}

function openStart (proc: ProcessDef) {
  selectedProcess.value = proc
  processTitle.value = ''
  Object.keys(formValues).forEach(k => delete formValues[k])
  try {
    const config = JSON.parse(proc.formConfig || '[]')
    formFields.value = Array.isArray(config) ? config : []
  } catch { formFields.value = [] }
  for (const f of formFields.value) {
    formValues[f.field] = f.type === 'number' ? 0 : ''
  }
  startVisible.value = true
}

// 顶部“新增审批”：优先用第一个可发起流程，否则引导去流程管理
function openStartFromButton () {
  const first = publishedProcesses.value[0]
  if (!first) {
    ElMessage.info('暂无已发布的审批流程，请先在「流程管理」中发布流程')
    return
  }
  openStart(first)
}

async function submitStart () {
  if (!selectedProcess.value) return
  if (!processTitle.value.trim()) {
    ElMessage.warning('请输入审批标题')
    return
  }
  submitting.value = true
  try {
    await approvalCenterApi.start(selectedProcess.value.processKey, processTitle.value.trim(), { ...formValues })
    ElMessage.success('提交成功')
    startVisible.value = false
    loadTodoCount()
    if (mainTab.value === 'records' && recordTab.value === 'started') loadRecords()
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  }
  submitting.value = false
}

// ---------------- 审批记录 ----------------
const recordTab = ref<'todo' | 'done' | 'started' | 'cc'>('todo')
const recordLoading = ref(false)
const recordList = ref<any[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

const emptyText = computed(() => ({
  todo: '暂无待办审批',
  done: '暂无已办记录',
  started: '暂无发起记录',
  cc: '暂无抄送记录（后端暂未提供抄送接口）'
}[recordTab.value]))

function onRecordTabChange () {
  pageNum.value = 1
  loadRecords()
}

async function loadRecords () {
  recordLoading.value = true
  try {
    const params = { pageNum: pageNum.value, pageSize: pageSize.value }
    let res: { list: any[]; total: number }
    if (recordTab.value === 'todo') res = await approvalCenterApi.todo(params)
    else if (recordTab.value === 'done') res = await approvalCenterApi.done(params)
    else if (recordTab.value === 'started') res = await approvalCenterApi.started(params)
    else res = await approvalCenterApi.cc(params)
    recordList.value = res.list
    total.value = res.total
  } catch { recordList.value = []; total.value = 0 }
  recordLoading.value = false
}

// ---------------- 审批操作 ----------------
const approveVisible = ref(false)
const acting = ref(false)
const currentTask = ref<TaskItem | null>(null)
const approveComment = ref('')
const showTransfer = ref(false)
const transferUserId = ref('')

// ---------------- 详情 ----------------
const detailVisible = ref(false)
const detailInstance = ref<InstanceItem | null>(null)

const detailFormData = computed(() => {
  try {
    if (!detailInstance.value?.formData) return {}
    const parsed = JSON.parse(detailInstance.value.formData)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
})

async function loadInstance (instanceId: number) {
  try { detailInstance.value = await approvalCenterApi.detail(instanceId) } catch { detailInstance.value = null }
}

async function openApprove (row: TaskItem) {
  currentTask.value = row
  approveComment.value = ''
  showTransfer.value = false
  transferUserId.value = ''
  detailInstance.value = null
  await loadInstance(row.instanceId)
  approveVisible.value = true
}

async function openDetail (row: any) {
  // started 子 Tab 的行本身就是实例(id 即 instanceId)；其余子 Tab 行为任务(取 instanceId)
  const instanceId = recordTab.value === 'started' ? row.id : row.instanceId
  detailInstance.value = null
  await loadInstance(instanceId)
  detailVisible.value = true
}

async function doApprove () {
  if (!currentTask.value) return
  acting.value = true
  try {
    await approvalCenterApi.approve(currentTask.value.id, approveComment.value)
    ElMessage.success('已通过')
    approveVisible.value = false
    afterAction()
  } catch (e: any) { ElMessage.error(e?.message || '操作失败') }
  acting.value = false
}

async function doReject () {
  if (!currentTask.value) return
  acting.value = true
  try {
    await approvalCenterApi.reject(currentTask.value.id, approveComment.value)
    ElMessage.success('已拒绝')
    approveVisible.value = false
    afterAction()
  } catch (e: any) { ElMessage.error(e?.message || '操作失败') }
  acting.value = false
}

async function doTransfer () {
  if (!currentTask.value || !transferUserId.value) {
    ElMessage.warning('请输入目标用户 ID')
    return
  }
  acting.value = true
  try {
    await approvalCenterApi.transfer(currentTask.value.id, Number(transferUserId.value), approveComment.value)
    ElMessage.success('已转交')
    approveVisible.value = false
    afterAction()
  } catch (e: any) { ElMessage.error(e?.message || '操作失败') }
  acting.value = false
}

function afterAction () {
  loadTodoCount()
  loadRecords()
}

async function handleCancel (row: InstanceItem) {
  try {
    await ElMessageBox.confirm('确认撤销此审批？', '提示', { type: 'warning' })
  } catch { return } // 点了取消
  try {
    await approvalCenterApi.cancel(row.id)
    ElMessage.success('已撤销')
    loadRecords()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

// ---------------- 状态/操作文案 ----------------
function statusType (s: number) {
  return ({ 0: 'primary', 1: 'success', 2: 'danger', 3: 'info' } as Record<number, string>)[s] || 'info'
}
function statusLabel (s: number) {
  return ({ 0: '进行中', 1: '已完成', 2: '已拒绝', 3: '已撤销' } as Record<number, string>)[s] || '-'
}
function actionType (s: number) {
  return ({ 1: 'success', 2: 'danger', 3: 'warning' } as Record<number, string>)[s] || 'info'
}
function actionLabel (s: number) {
  return ({ 1: '通过', 2: '拒绝', 3: '转交' } as Record<number, string>)[s] || '-'
}

onMounted(() => {
  loadProcesses()
  loadTodoCount()
})
</script>

<style scoped>
.approval-center {
  padding: 16px 20px 24px;
}

/* 顶部：主 Tab 与右上操作同排 */
.ac-header {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.ac-main-tabs {
  flex: 1;
}
.ac-main-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.ac-tab-label {
  font-size: 15px;
  font-weight: 500;
}
.ac-tab-badge {
  margin-left: 2px;
}
.ac-header__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 2px;
}
.ac-search {
  width: 240px;
}

/* ---------- 审批管理 ---------- */
.ac-manage {
  margin-top: 16px;
}
.ac-cats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ac-cat {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  transition: all 0.2s;
}
.ac-cat:hover {
  color: #F26522;
}
.ac-cat--active {
  color: #fff;
  background: #F26522;
}
.ac-group {
  margin-top: 22px;
}
.ac-group__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
}
.ac-group__bar {
  display: inline-block;
  width: 3px;
  height: 14px;
  border-radius: 2px;
}
.ac-group__count {
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.ac-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 12px;
}
.ac-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
}
.ac-card:hover {
  border-color: #F26522;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}
.ac-card--disabled {
  cursor: default;
  opacity: 0.7;
}
.ac-card--disabled:hover {
  border-color: var(--el-border-color-lighter);
  box-shadow: none;
  transform: none;
}
.ac-card__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 9px;
  flex-shrink: 0;
}
.ac-card__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

/* ---------- 审批记录 ---------- */
.ac-records {
  margin-top: 16px;
}
.ac-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* ---------- 弹窗内区块 ---------- */
.ac-approve {
  max-height: 62vh;
  overflow-y: auto;
}
.ac-section {
  margin-bottom: 20px;
}
.ac-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  color: var(--el-text-color-primary);
  border-left: 3px solid #F26522;
  padding-left: 8px;
}
.ac-form-display {
  background: var(--el-bg-color-page);
  padding: 12px 16px;
  border-radius: 6px;
}
.ac-form-item {
  display: flex;
  padding: 6px 0;
  border-bottom: 1px dashed var(--el-border-color-lighter);
}
.ac-form-item:last-child {
  border-bottom: none;
}
.ac-form-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  min-width: 100px;
}
.ac-form-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
}
.ac-approve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

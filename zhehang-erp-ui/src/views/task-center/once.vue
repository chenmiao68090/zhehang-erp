<template>
  <div class="task-page task-once">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 01 / ONCE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">A 类 · 一次性业务</span>
          <span class="title-en">One-time Mission</span>
        </h1>
        <p class="page-desc">面向单次执行场景的任务派发与全流程闭环跟踪</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="btn-gold" @click="openCreate">+ 新建一次性任务</el-button>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx" :class="{ danger: m.danger }">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 筛选栏 -->
    <section class="filter-bar">
      <div class="filter-left">
        <el-select v-model="filters.status" placeholder="任务状态" clearable style="width: 140px" @change="loadList">
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-select v-model="filters.assignee" placeholder="执行人" clearable style="width: 140px" @change="loadList">
          <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
        </el-select>
        <el-select v-model="filters.subType" placeholder="任务子类型" clearable style="width: 160px" @change="loadList">
          <el-option v-for="t in SUB_TYPES" :key="t" :label="t" :value="t" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="搜索任务名称 / 客户" clearable style="width: 220px" @clear="loadList" @keyup.enter="loadList" />
        <el-button class="btn-ghost" @click="loadList">查询</el-button>
        <el-button class="btn-ghost" @click="resetFilters">重置</el-button>
      </div>
    </section>

    <!-- 任务列表表格 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">任务列表</h2>
        <span class="section-sub">ONE-TIME / TASKS · {{ list.length }} 条</span>
      </div>
      <el-table :data="list" v-loading="loading" stripe :row-class-name="rowClass" style="width: 100%">
        <el-table-column prop="taskNo" label="任务编号" width="150" />
        <el-table-column prop="taskName" label="任务名称" min-width="200" show-overflow-tooltip />
        <el-table-column prop="customerName" label="客户名称" min-width="180" show-overflow-tooltip />
        <el-table-column label="子类型" width="130">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row._subType || '—' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="执行人" width="110" />
        <el-table-column prop="planEndDate" label="计划完成日" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusMap[row.status]?.type || 'info'" size="small">
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="90">
          <template #default="{ row }">
            <el-tag :type="priorityMap[row.priority]?.type || 'info'" size="small" effect="dark">
              {{ priorityMap[row.priority]?.label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" link type="primary" @click="openAssign(row)">指派</el-button>
            <el-button v-if="row.status === 'assigned'" link type="success" @click="doStart(row)">开始执行</el-button>
            <el-button v-if="row.status === 'in_progress'" link type="warning" @click="openComplete(row)">提交完成</el-button>
            <el-button v-if="row.status === 'reviewing'" link type="primary" @click="openReview(row)">验收</el-button>
            <el-button link @click="openDetail(row)">详情</el-button>
            <el-tag v-if="overdueDays(row) > 3" size="small" type="danger" effect="dark" style="margin-left:6px">需主管介入</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 创建任务 Dialog -->
    <el-dialog v-model="dlg.create" title="新建一次性任务" width="640px">
      <el-form :model="form" label-width="100px" label-position="right">
        <el-form-item label="关联合同">
          <el-select v-model="form.contractId" placeholder="选择合同后自动带出客户" style="width: 100%" @change="onContractChange">
            <el-option v-for="c in contractOptions" :key="c.id" :label="`${c.no} · ${c.customer}`" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="客户名称">
          <el-input v-model="form.customerName" placeholder="自动带出，可手动覆盖" />
        </el-form-item>
        <el-form-item label="任务名称">
          <el-input v-model="form.taskName" placeholder="如：杭州数智-客户资料收集" />
        </el-form-item>
        <el-form-item label="子类型">
          <el-select v-model="form.subType" placeholder="选择子类型" style="width: 100%">
            <el-option v-for="t in SUB_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="form.taskContent" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="执行标准">
          <el-input v-model="form.standard" type="textarea" :rows="2" placeholder="对完成质量的要求" />
        </el-form-item>
        <el-form-item label="客户交付物">
          <el-input v-model="form.deliverable" placeholder="如：营业执照、银行开户许可证" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="指派人" style="flex:1">
            <el-input v-model="form.assignerName" />
          </el-form-item>
          <el-form-item label="执行人" style="flex:1">
            <el-select v-model="form.assigneeName" placeholder="选择执行人" style="width: 100%">
              <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
            </el-select>
          </el-form-item>
        </div>
        <div class="form-row">
          <el-form-item label="计划开始" style="flex:1">
            <el-date-picker v-model="form.planStartDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="计划完成" style="flex:1">
            <el-date-picker v-model="form.planEndDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="优先级">
          <el-radio-group v-model="form.priority">
            <el-radio-button value="urgent">紧急</el-radio-button>
            <el-radio-button value="high">高</el-radio-button>
            <el-radio-button value="normal">中</el-radio-button>
            <el-radio-button value="low">低</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.create = false">取消</el-button>
        <el-button type="primary" @click="doCreate">创建</el-button>
      </template>
    </el-dialog>

    <!-- 指派 Dialog -->
    <el-dialog v-model="dlg.assign" title="指派执行人" width="460px">
      <el-form :model="assignForm" label-width="90px">
        <el-form-item label="任务">
          <span class="readonly-text">{{ current?.taskName }}</span>
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="assignForm.assigneeName" placeholder="选择执行人" style="width: 100%">
            <el-option v-for="a in assigneeOptions" :key="a" :label="a" :value="a" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划完成">
          <el-date-picker v-model="assignForm.planEndDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.assign = false">取消</el-button>
        <el-button type="primary" @click="doAssign">确认指派</el-button>
      </template>
    </el-dialog>

    <!-- 提交完成 Dialog -->
    <el-dialog v-model="dlg.complete" title="提交完成" width="500px">
      <el-form :model="completeForm" label-width="100px">
        <el-form-item label="任务">
          <span class="readonly-text">{{ current?.taskName }}</span>
        </el-form-item>
        <el-form-item label="交付物">
          <el-upload
            v-model:file-list="completeForm.fileList"
            action="#"
            list-type="picture-card"
            :auto-upload="false"
            accept="image/*"
            :limit="5"
            :on-exceed="handleExceed"
            :on-preview="handlePreview"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <el-dialog v-model="previewVisible" title="图片预览" append-to-body>
            <img :src="previewUrl" style="width:100%" />
          </el-dialog>
        </el-form-item>
        <el-form-item label="完成说明">
          <el-input v-model="completeForm.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.complete = false">取消</el-button>
        <el-button type="primary" @click="doComplete">提交</el-button>
      </template>
    </el-dialog>

    <!-- 验收 Dialog -->
    <el-dialog v-model="dlg.review" title="任务验收" width="520px">
      <el-form :model="reviewForm" label-width="100px">
        <el-form-item label="任务">
          <span class="readonly-text">{{ current?.taskName }}</span>
        </el-form-item>
        <el-form-item label="验收结果">
          <el-radio-group v-model="reviewForm.result">
            <el-radio value="pass">通过</el-radio>
            <el-radio value="fail">不通过</el-radio>
            <el-radio value="rework">需返工</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="验收意见">
          <el-input v-model="reviewForm.opinion" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.review = false">取消</el-button>
        <el-button type="primary" @click="doReview">提交验收</el-button>
      </template>
    </el-dialog>

    <BusinessDetailDrawer
      v-if="current"
      v-model="dlg.detail"
      :title="current.taskName || '任务详情'"
      :subtitle="`${current.customerName || '—'} · ${current._subType || '一次性任务'}`"
      eyebrow="一次性业务"
      :avatar="current._subType?.slice(0, 2) || '任'"
      :avatar-class="taskAvatarClass(current.status)"
      :status-text="statusMap[current.status]?.label || current.status"
      :status-type="statusMap[current.status]?.type || 'info'"
      size="620px"
    >
      <template #actions>
        <el-tag :type="priorityMap[current.priority]?.type || 'info'" effect="plain">{{ priorityMap[current.priority]?.label || current.priority }}</el-tag>
      </template>

      <template #meta>
        <div class="bd-kv-grid">
          <div class="bd-kv"><span>任务编号</span><b>{{ current.taskNo }}</b></div>
          <div class="bd-kv"><span>子类型</span><b>{{ current._subType || '—' }}</b></div>
          <div class="bd-kv"><span>指派人</span><b>{{ current.assignerName || '—' }}</b></div>
          <div class="bd-kv"><span>执行人</span><b>{{ current.assigneeName || '—' }}</b></div>
          <div class="bd-kv"><span>计划开始</span><b>{{ current.planStartDate || '—' }}</b></div>
          <div class="bd-kv"><span>计划完成</span><b>{{ current.planEndDate || '—' }}</b></div>
          <div class="bd-kv wide"><span>任务描述</span><b>{{ current.taskContent || '—' }}</b></div>
        </div>
      </template>

      <div class="bd-section-title">任务进度</div>
      <div class="task-step-wrap">
        <el-steps :active="stepActive(current.status)" finish-status="success" simple>
          <el-step title="待分配" />
          <el-step title="已分配" />
          <el-step title="执行中" />
          <el-step title="待验收" />
          <el-step title="已完成" />
        </el-steps>
      </div>

      <div class="task-detail-grid">
        <div v-if="current.deliverable" class="wide">
          <span>交付物</span>
          <b>{{ current.deliverable }}</b>
        </div>
        <div v-if="current.reviewOpinion" class="wide">
          <span>验收意见</span>
          <b>{{ current.reviewOpinion }}</b>
        </div>
        <div v-if="!current.deliverable && !current.reviewOpinion" class="wide">
          <span>交付与验收</span>
          <b>任务完成后会展示交付物与验收意见。</b>
        </div>
      </div>

      <template #timeline>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot success" />
          <div>
            <strong>任务创建</strong>
            <p>{{ current.assignerName || '未填写指派人' }} 创建 / 指派，客户：{{ current.customerName || '—' }}</p>
          </div>
        </div>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot" :class="{ success: ['in_progress', 'reviewing', 'completed'].includes(current.status) }" />
          <div>
            <strong>执行节点</strong>
            <p>{{ current.assigneeName || '待指派' }} · {{ statusMap[current.status]?.label || current.status }}</p>
          </div>
        </div>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot" :class="{ success: current.status === 'completed' }" />
          <div>
            <strong>验收闭环</strong>
            <p>{{ current.reviewOpinion || '等待提交完成后验收' }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="dlg.detail = false">关闭</el-button>
        <el-button v-if="current.status === 'pending'" type="primary" @click="openAssign(current)">指派</el-button>
        <el-button v-if="current.status === 'assigned'" type="success" @click="doStart(current)">开始执行</el-button>
        <el-button v-if="current.status === 'in_progress'" type="warning" @click="openComplete(current)">提交完成</el-button>
        <el-button v-if="current.status === 'reviewing'" type="primary" @click="openReview(current)">验收</el-button>
      </template>
    </BusinessDetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { TASK_ASSIGNEES, TASK_CONTRACT_OPTIONS, taskApi, type BizTask } from '@/api/task-center'
import { onAllTasksCompleted } from '@/utils/biz-linkage'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'

const CAT = 'A'
const SUB_TYPES = ['客户资料收集', '建账初始化', '税务报到', '银行签约', '工商变更', '公司注册', '资质申请', '注销公司', '异常解除']

const assigneeOptions = TASK_ASSIGNEES
const contractOptions = TASK_CONTRACT_OPTIONS

const statusOptions = [
  { value: 'pending', label: '待分配' },
  { value: 'assigned', label: '已分配' },
  { value: 'in_progress', label: '执行中' },
  { value: 'reviewing', label: '待验收' },
  { value: 'completed', label: '已完成' },
  { value: 'overdue', label: '已逾期' },
  { value: 'closed', label: '已暂停' }
]

const statusMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger' }> = {
  pending: { label: '待分配', type: 'info' },
  assigned: { label: '已分配', type: 'warning' },
  in_progress: { label: '执行中', type: 'primary' },
  reviewing: { label: '待验收', type: 'success' },
  completed: { label: '已完成', type: 'success' },
  overdue: { label: '已逾期', type: 'danger' },
  closed: { label: '已暂停', type: 'info' }
}

const priorityMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger' }> = {
  urgent: { label: '紧急', type: 'danger' },
  high: { label: '高', type: 'warning' },
  normal: { label: '中', type: 'primary' },
  low: { label: '低', type: 'info' }
}

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)
const list = ref<(BizTask & { _subType?: string })[]>([])
const allTasks = ref<BizTask[]>([])
const current = ref<BizTask & { _subType?: string } | null>(null)

const filters = reactive({ status: '', assignee: '', subType: '', keyword: '' })

const dlg = reactive({ create: false, assign: false, complete: false, review: false, detail: false })

const form = reactive({
  contractId: null as number | null,
  customerName: '',
  taskName: '',
  subType: '',
  taskContent: '',
  standard: '',
  deliverable: '',
  assignerName: '',
  assigneeName: '',
  planStartDate: '',
  planEndDate: '',
  priority: 'normal' as BizTask['priority']
})

const assignForm = reactive({ assigneeName: '', planEndDate: '' })
const completeForm = reactive({ fileList: [] as any[], remark: '' })
const previewVisible = ref(false)
const previewUrl = ref('')
const reviewForm = reactive({ result: 'pass' as 'pass' | 'fail' | 'rework', opinion: '' })

function parseRemark(remark: string) {
  // remark 格式：CAT|SUBTYPE|备注
  const m = (remark || '').match(/^([A-D])\|([^|]+)\|?(.*)$/)
  if (m) return { cat: m[1], subType: m[2], rest: m[3] || '' }
  return { cat: '', subType: '', rest: remark || '' }
}

function buildRemark(cat: string, subType: string, rest = '') {
  return `${cat}|${subType}|${rest}`
}

function ensureSeed() {
  const KEY = 'biz_tasks'
  const raw = localStorage.getItem(KEY)
  const list: BizTask[] = raw ? (() => { try { return JSON.parse(raw) } catch { return [] } })() : []
  // 不再写入种子数据，仅读取已有数据
  void list
}

function dateOff(d: number) {
  const x = new Date()
  x.setDate(x.getDate() + d)
  return x.toISOString().slice(0, 10)
}

function rowClass({ row }: { row: BizTask }) {
  return overdueDays(row) > 0 && row.status !== 'completed' && row.status !== 'closed' ? 'row-overdue' : ''
}

function overdueDays(row: BizTask) {
  if (!row.planEndDate) return 0
  if (row.status === 'completed' || row.status === 'closed') return 0
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const end = new Date(row.planEndDate)
  return Math.floor((today.getTime() - end.getTime()) / 86400000)
}

function stepActive(s: string) {
  return ['pending', 'assigned', 'in_progress', 'reviewing', 'completed'].indexOf(s)
}

function taskAvatarClass(status: string) {
  return ({
    pending: 'company',
    assigned: 'warning',
    in_progress: 'channel',
    reviewing: 'warning',
    completed: 'success',
    overdue: 'danger',
    closed: 'company'
  } as Record<string, string>)[status] || 'company'
}

const metrics = computed(() => {
  const arr = allTasks.value
  return [
    { label: '待分配', value: arr.filter(t => t.status === 'pending').length },
    { label: '执行中', value: arr.filter(t => t.status === 'in_progress').length },
    { label: '待验收', value: arr.filter(t => t.status === 'reviewing').length },
    { label: '已完成', value: arr.filter(t => t.status === 'completed').length },
    { label: '已逾期', value: arr.filter(t => overdueDays(t) > 0 && t.status !== 'completed' && t.status !== 'closed').length, danger: true }
  ]
})

async function loadList() {
  loading.value = true
  try {
    const res: any = await taskApi.list({ pageSize: 9999 })
    const tasks = (res.list as BizTask[]).filter(t => parseRemark(t.remark).cat === CAT)
    allTasks.value = tasks
    let arr: (BizTask & { _subType?: string })[] = tasks.map(t => {
      const p = parseRemark(t.remark)
      return { ...t, _subType: p.subType }
    })
    if (filters.status) arr = arr.filter(t => t.status === filters.status)
    if (filters.assignee) arr = arr.filter(t => t.assigneeName === filters.assignee)
    if (filters.subType) arr = arr.filter(t => t._subType === filters.subType)
    if (filters.keyword) arr = arr.filter(t => (t.taskName + (t.customerName || '')).includes(filters.keyword))
    list.value = arr
  } finally { loading.value = false }
}

function resetFilters() {
  filters.status = ''; filters.assignee = ''; filters.subType = ''; filters.keyword = ''
  loadList()
}

function onContractChange(id: number) {
  const c = contractOptions.find(x => x.id === id)
  if (c) form.customerName = c.customer
}

function openCreate() {
  Object.assign(form, {
    contractId: null, customerName: '', taskName: '', subType: '',
    taskContent: '', standard: '', deliverable: '',
    assignerName: '', assigneeName: '',
    planStartDate: dateOff(0), planEndDate: dateOff(7), priority: 'normal'
  })
  dlg.create = true
}

async function doCreate() {
  if (!form.taskName || !form.subType) return ElMessage.warning('请填写任务名称与子类型')
  await taskApi.create({
    taskName: form.taskName,
    taskType: 'other' as any,
    customerName: form.customerName,
    assigneeName: form.assigneeName,
    assigneeId: form.assigneeName ? 2000 + Math.floor(Math.random() * 99) : 0,
    assignerName: form.assignerName,
    priority: form.priority,
    planStartDate: form.planStartDate,
    planEndDate: form.planEndDate,
    taskContent: form.taskContent,
    remark: buildRemark('A', form.subType, '')
  })
  ElMessage.success('已创建一次性任务')
  dlg.create = false
  loadList()
}

function openAssign(row: BizTask & { _subType?: string }) {
  current.value = row
  assignForm.assigneeName = row.assigneeName || ''
  assignForm.planEndDate = row.planEndDate
  dlg.assign = true
}

async function doAssign() {
  if (!current.value || !assignForm.assigneeName) return ElMessage.warning('请选择执行人')
  await taskApi.assign({ id: current.value.id, assigneeId: 2000 + Math.floor(Math.random() * 99), assigneeName: assignForm.assigneeName })
  ElMessage.success('已指派')
  dlg.assign = false
  loadList()
}

async function doStart(row: BizTask) {
  await taskApi.start(row.id)
  ElMessage.success('已开始执行')
  loadList()
}

function openComplete(row: BizTask & { _subType?: string }) {
  current.value = row
  completeForm.fileList = []
  completeForm.remark = ''
  dlg.complete = true
}

function handleExceed() {
  ElMessage.warning('最多上传5张图片')
}

function handlePreview(file: any) {
  previewUrl.value = file.url || URL.createObjectURL(file.raw)
  previewVisible.value = true
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function doComplete() {
  if (!current.value) return
  // 将上传的图片转为 base64
  const base64List: string[] = []
  for (const f of completeForm.fileList) {
    if (f.url && !f.raw) {
      base64List.push(f.url)
    } else if (f.raw) {
      const b64 = await fileToBase64(f.raw)
      base64List.push(b64)
    }
  }
  const deliverable = base64List.length > 0 ? JSON.stringify(base64List) : ''
  await taskApi.complete({ id: current.value.id, deliverable, remark: completeForm.remark })
  ElMessage.success('已提交，等待验收')
  dlg.complete = false
  loadList()
}

function openReview(row: BizTask & { _subType?: string }) {
  current.value = row
  reviewForm.result = 'pass'
  reviewForm.opinion = ''
  dlg.review = true
}

async function doReview() {
  if (!current.value) return
  const r = reviewForm.result === 'pass' ? 'pass' : 'fail'
  const target = current.value
  await taskApi.review({ id: target.id, result: r, opinion: reviewForm.opinion + (reviewForm.result === 'rework' ? '（需返工）' : '') })
  ElMessage.success(reviewForm.result === 'pass' ? '验收通过' : reviewForm.result === 'rework' ? '已退回返工' : '验收不通过')
  // 联动：验收通过后检查该客户是否所有一次性任务都已完成 → 转「服务中」
  if (r === 'pass' && target.customerId) {
    try {
      const linkRes = onAllTasksCompleted(target.customerId)
      if (linkRes.ok) {
        ElMessage.success(linkRes.message)
      }
    } catch (err) { /* ignore */ }
  }
  dlg.review = false
  loadList()
}

function openDetail(row: BizTask & { _subType?: string }) {
  current.value = row
  dlg.detail = true
}

onMounted(async () => {
  await taskApi.ensureSamples(['A'])
  ensureSeed()
  await loadList()
})
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 22px; padding: 8px 4px 32px; }

.page-header {
  position: relative; padding: 30px 36px 26px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22); border-radius: 14px; overflow: hidden;
  display: flex; align-items: flex-end; justify-content: space-between;
  &::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
                radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.10), transparent 50%);
    pointer-events: none;
  }
  .header-meta, .header-main, .header-actions { position: relative; z-index: 1; }
}
.header-meta { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', 'Menlo', monospace; font-size: 11px; letter-spacing: 0.18em; color: var(--gold-primary, #D4AF37); margin-bottom: 14px; }
.meta-tag { padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 2px; background: rgba(212, 175, 55, 0.06); }
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }

.page-title { display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn { font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .title-en { font-family: 'Playfair Display', 'Georgia', serif; font-style: italic; font-weight: 400; font-size: 18px; color: rgba(212, 175, 55, 0.55); }
}
.page-desc { font-size: 13px; color: var(--text-body, #A09B8C); letter-spacing: 0.04em; margin: 0; }

.btn-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #B5862E 100%) !important;
  border: none !important; color: #1a1a24 !important; font-weight: 600;
  &:hover { filter: brightness(1.1); }
}
.btn-ghost {
  background: transparent !important; border: 1px solid rgba(212, 175, 55, 0.35) !important;
  color: var(--gold-primary, #D4AF37) !important;
  &:hover { background: rgba(212, 175, 55, 0.08) !important; }
}

.metric-strip {
  display: grid; grid-template-columns: repeat(5, 1fr);
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 10px; overflow: hidden;
}
.metric-item {
  position: relative; padding: 18px 22px; border-right: 1px solid rgba(212, 175, 55, 0.08);
  &:last-child { border-right: none; }
  &.danger .metric-value { color: #F56C6C; }
  .metric-index { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45); margin-bottom: 6px; }
  .metric-value { font-family: 'JetBrains Mono', monospace; font-size: 28px; font-weight: 700; color: var(--gold-primary, #D4AF37); line-height: 1.1; }
  .metric-label { margin-top: 6px; font-size: 12px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
}

.filter-bar {
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 10px;
  padding: 14px 18px;
  .filter-left { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
}

.section-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; padding-left: 4px; }
.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5); margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }

.content-section {
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 18px 18px 12px;
}

:deep(.el-table .row-overdue) { background: rgba(245, 108, 108, 0.08) !important; }
:deep(.el-table .row-overdue:hover > td) { background: rgba(245, 108, 108, 0.14) !important; }

.form-row { display: flex; gap: 12px; }
.readonly-text { color: var(--text-primary); font-weight: 500; }
.detail-block { padding: 10px 6px; }
.task-step-wrap {
  margin-bottom: 14px;
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #fbfcfd;
}
.task-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.task-detail-grid div {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #fbfcfd;
}
.task-detail-grid .wide {
  grid-column: 1 / -1;
}
.task-detail-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 12px;
}
.task-detail-grid b {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 650;
}

/* 统一为浅色运营后台风格 */
.task-page {
  gap: 16px;
  padding: 0 0 24px;
  color: #1f2937;
}
.page-header {
  padding: 22px 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 62%, #f1faf6 100%);
  border: 1px solid #dbe7f3;
  border-radius: 8px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  align-items: center;
  &::before { display: none; }
}
.header-meta {
  color: #2563eb;
  margin-bottom: 10px;
  letter-spacing: 0.08em;
}
.meta-tag {
  background: #eff6ff;
  border-color: #bfdbfe;
  border-radius: 4px;
}
.meta-divider { background: #cbd5e1; }
.meta-time { color: #64748b; }
.page-title {
  gap: 12px;
  .title-cn {
    color: #0f172a;
    background: none;
    -webkit-text-fill-color: currentColor;
    font-size: 28px;
    letter-spacing: 0;
  }
  .title-en {
    font-family: inherit;
    font-style: normal;
    font-size: 14px;
    color: #64748b;
  }
}
.page-desc {
  color: #475569;
  letter-spacing: 0;
}
.btn-gold {
  background: #2563eb !important;
  color: #ffffff !important;
  border: 1px solid #2563eb !important;
  border-radius: 6px;
  &:hover { filter: none; background: #1d4ed8 !important; }
}
.btn-ghost {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  color: #334155 !important;
  &:hover {
    background: #eff6ff !important;
    border-color: #93c5fd !important;
    color: #1d4ed8 !important;
  }
}
.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
}
.metric-item {
  padding: 16px 18px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
  .metric-index {
    color: #94a3b8;
    letter-spacing: 0.08em;
  }
  .metric-value {
    color: #2563eb;
    font-size: 22px;
  }
  .metric-label {
    color: #64748b;
    letter-spacing: 0;
  }
  &.danger .metric-value { color: #dc2626; }
}
.filter-bar,
.content-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}
.section-title {
  color: #0f172a;
  &::before {
    background: #2563eb;
    border-radius: 2px;
  }
}
.section-sub {
  color: #94a3b8;
  letter-spacing: 0.08em;
}
.readonly-text {
  color: #0f172a;
}

@media (max-width: 1100px) {
  .metric-strip { grid-template-columns: repeat(2, 1fr); }
  .metric-item { border-right: none; }
}
@media (max-width: 760px) {
  .task-detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>

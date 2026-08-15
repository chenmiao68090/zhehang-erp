<template>
  <div class="offboarding-center">
    <header class="page-head">
      <div class="head-copy">
        <el-button class="back-button" :icon="ArrowLeft" link @click="router.push('/sys-org/employee')">
          返回员工与账号
        </el-button>
        <div class="title-row">
          <span class="title-icon"><el-icon><UserFilled /></el-icon></span>
          <div>
            <h2>离职人员中心</h2>
            <p>统一查看离职档案、账号停用和交接闭环，历史业务记录继续保留。</p>
          </div>
        </div>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" :loading="loading" @click="loadAll">刷新</el-button>
        <el-button type="primary" :icon="Plus" :disabled="hasDataError" @click="openHistoryDialog">补录历史离职</el-button>
      </div>
    </header>

    <el-alert class="truth-alert" type="info" :closable="false" show-icon>
      <template #title>
        账号状态由系统实时校验；客户、任务、资料、资产、结算为人工确认项，请负责人核实后更新，页面不会把人工结果伪装成系统自动统计。
      </template>
    </el-alert>

    <div v-if="hasDataError" class="data-error-banner" role="alert">
      <div>
        <strong>离职数据暂时无法完整读取</strong>
        <span>当前数字和列表不可作为判断依据，已暂停历史补录，避免误判或重复建档。</span>
      </div>
      <el-button type="danger" plain :loading="loading" @click="loadAll">重新加载</el-button>
    </div>

    <section class="summary-grid" aria-label="离职交接汇总">
      <article class="summary-card is-neutral">
        <span class="summary-label">离职总人数</span>
        <strong>{{ summaryError ? '—' : summary.total }}</strong>
        <small>历史档案完整保留</small>
      </article>
      <article class="summary-card is-warning">
        <span class="summary-label">交接进行中</span>
        <strong>{{ summaryError ? '—' : summary.inProgress }}</strong>
        <small>需要继续跟进</small>
      </article>
      <article class="summary-card is-danger">
        <span class="summary-label">存在风险</span>
        <strong>{{ summaryError ? '—' : summary.riskCount }}</strong>
        <small>任一域尚未闭环</small>
      </article>
      <article class="summary-card is-danger-soft">
        <span class="summary-label">账号安全风险</span>
        <strong>{{ summaryError ? '—' : summary.accountRiskCount }}</strong>
        <small>仍可登录或账号关联异常</small>
      </article>
      <article class="summary-card is-success">
        <span class="summary-label">已闭环</span>
        <strong>{{ summaryError ? '—' : summary.closedCount }}</strong>
        <small>六域全部完成</small>
      </article>
    </section>

    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" class="filter-form" @submit.prevent>
        <el-form-item label="员工姓名">
          <el-input
            v-model="query.name"
            clearable
            placeholder="输入员工姓名"
            @keyup.enter="search"
            @clear="search"
          />
        </el-form-item>
        <el-form-item label="原部门">
          <el-tree-select
            v-model="query.deptId"
            :data="deptTree"
            :props="{ label: 'deptName', children: 'children', value: 'id' }"
            check-strictly
            clearable
            placeholder="全部部门"
          />
        </el-form-item>
        <el-form-item label="交接状态">
          <el-select v-model="query.status" clearable placeholder="全部状态">
            <el-option label="待登记 / 待交接" :value="0" />
            <el-option label="交接中" :value="1" />
            <el-option label="已闭环" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="风险情况">
          <el-select v-model="query.riskOnly" clearable placeholder="全部人员">
            <el-option label="仅看存在风险" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" :icon="Search" @click="search">查询</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="matrix-card">
      <div class="matrix-title">
        <div>
          <h3>六域离职风险矩阵</h3>
          <p>账号为系统状态，其余五域均需人工确认。</p>
        </div>
        <span>共 {{ total }} 人</span>
      </div>

      <div class="desktop-matrix">
        <el-table :data="rows" v-loading="loading" row-key="employeeId" border>
          <el-table-column label="离职员工" fixed min-width="184">
            <template #default="{ row }">
              <div class="employee-cell">
                <span class="employee-avatar">{{ avatarText(row.name) }}</span>
                <div>
                  <strong>{{ row.name || '未命名员工' }}</strong>
                  <small>{{ row.empCode || '无工号' }} · {{ row.deptName || '未分部门' }}</small>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="离职日期" min-width="112" align="center">
            <template #default="{ row }">
              <span>{{ row.resignDate || '未记录' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="118" align="center">
            <template #header>
              <div class="domain-head"><b>账号</b><small>系统校验</small></div>
            </template>
            <template #default="{ row }">
              <el-tag :type="accountMeta(row.accountStatus).type" size="small" effect="light">
                {{ accountMeta(row.accountStatus).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-for="domain in manualDomains" :key="domain.key" min-width="112" align="center">
            <template #header>
              <div class="domain-head"><b>{{ domain.label }}</b><small>人工确认</small></div>
            </template>
            <template #default="{ row }">
              <el-tag :type="checkMeta(row[domain.key]).type" size="small" effect="plain">
                {{ checkMeta(row[domain.key]).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="风险" min-width="112" align="center">
            <template #default="{ row }">
              <div class="risk-cell">
                <el-tag :type="riskMeta(row).type" size="small">{{ riskMeta(row).label }}</el-tag>
                <small v-if="row.riskCount">{{ row.riskCount }} 项待处理</small>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="交接状态" min-width="112" align="center">
            <template #default="{ row }">
              <el-tag :type="handoverMeta(row.status).type" size="small" effect="light">
                {{ handoverMeta(row.status).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="92" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click="openDetail(row)">查看详情</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无符合条件的离职人员" :image-size="86">
              <el-button type="primary" plain @click="openHistoryDialog">补录历史离职</el-button>
            </el-empty>
          </template>
        </el-table>
      </div>

      <div v-loading="loading" class="mobile-matrix">
        <article v-for="row in rows" :key="row.employeeId" class="staff-card" @click="openDetail(row)">
          <div class="staff-card-head">
            <div class="employee-cell">
              <span class="employee-avatar">{{ avatarText(row.name) }}</span>
              <div>
                <strong>{{ row.name || '未命名员工' }}</strong>
                <small>{{ row.deptName || '未分部门' }} · 离职 {{ row.resignDate || '未记录' }}</small>
              </div>
            </div>
            <el-tag :type="riskMeta(row).type" size="small">{{ riskMeta(row).label }}</el-tag>
          </div>
          <div class="mobile-domain-grid">
            <div><span>账号</span><b :class="`state-${accountMeta(row.accountStatus).tone}`">{{ accountMeta(row.accountStatus).label }}</b></div>
            <div v-for="domain in manualDomains" :key="domain.key">
              <span>{{ domain.label }}<em>人工</em></span>
              <b :class="`state-${checkMeta(row[domain.key]).tone}`">{{ checkMeta(row[domain.key]).label }}</b>
            </div>
          </div>
          <div class="staff-card-foot">
            <span>{{ handoverMeta(row.status).label }}</span>
            <el-button link type="primary">详情与更新 <el-icon><ArrowRight /></el-icon></el-button>
          </div>
        </article>
        <el-empty v-if="!rows.length && !loading && !centerError" description="暂无符合条件的离职人员" :image-size="72" />
      </div>

      <div v-if="total > 0" class="pager">
        <el-pagination
          v-model:current-page="query.pageNum"
          v-model:page-size="query.pageSize"
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          @current-change="loadCenter"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <el-drawer v-model="detailVisible" class="detail-drawer" size="min(760px, 100%)" destroy-on-close>
      <template #header>
        <div class="drawer-heading">
          <span class="employee-avatar is-large">{{ avatarText(detail?.employee?.name) }}</span>
          <div>
            <h3>{{ detail?.employee?.name || '离职交接详情' }}</h3>
            <p>{{ detail?.employee?.empCode || '无工号' }} · {{ detail?.employee?.deptName || '未分部门' }} · 离职 {{ detail?.employee?.resignDate || '未记录' }}</p>
          </div>
        </div>
      </template>

      <div v-loading="detailLoading" class="drawer-body">
        <template v-if="detail">
          <div class="drawer-state-row">
            <el-tag :type="accountMeta(detail.employee.accountStatus).type">
              账号：{{ accountMeta(detail.employee.accountStatus).label }}
            </el-tag>
            <el-tag :type="riskMeta(detail.employee).type">{{ riskMeta(detail.employee).label }}</el-tag>
            <el-tag :type="handoverMeta(detail.employee.status).type">{{ handoverMeta(detail.employee.status).label }}</el-tag>
          </div>

          <el-alert type="warning" :closable="false" show-icon title="下列五项均为人工确认，请核对实际交接凭据后再更新状态。" />

          <div class="drawer-domain-grid">
            <div class="domain-box system-domain">
              <span>账号 <em>系统校验</em></span>
              <strong>{{ accountMeta(detail.employee.accountStatus).label }}</strong>
            </div>
            <div v-for="domain in manualDomains" :key="domain.key" class="domain-box">
              <span>{{ domain.label }} <em>人工确认</em></span>
              <strong>{{ checkMeta(detail.employee[domain.key]).label }}</strong>
            </div>
          </div>

          <el-divider content-position="left">交接登记</el-divider>
          <el-form :model="handoverForm" label-position="top" class="handover-form">
            <div class="two-column">
              <el-form-item label="交接日期">
                <el-date-picker v-model="handoverForm.handoverDate" type="date" value-format="YYYY-MM-DD" placeholder="选择交接日期" />
              </el-form-item>
              <el-form-item label="接收人（稳定员工 ID）">
                <el-select v-model="handoverForm.handoverToEmployeeId" filterable clearable placeholder="选择在职接收人">
                  <el-option
                    v-for="employee in colleagues"
                    :key="employee.id"
                    :label="`${employee.name}${employee.deptName ? ` / ${employee.deptName}` : ''}`"
                    :value="Number(employee.id)"
                  />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="总体交接状态">
              <el-radio-group v-model="handoverForm.status">
                <el-radio-button v-for="option in handoverOptions" :key="option.value" :value="option.value">{{ option.label }}</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <div class="manual-editor-title">
              <strong>五项人工确认</strong>
              <span>异常表示已核实存在阻塞，不等同于系统自动发现。</span>
            </div>
            <div class="manual-editor-grid">
              <el-form-item label="客户交接 · 人工确认">
                <el-select v-model="handoverForm.customerCheckStatus"><el-option v-for="option in checkOptions" :key="option.value" v-bind="option" /></el-select>
              </el-form-item>
              <el-form-item label="任务交接 · 人工确认">
                <el-select v-model="handoverForm.taskCheckStatus"><el-option v-for="option in checkOptions" :key="option.value" v-bind="option" /></el-select>
              </el-form-item>
              <el-form-item label="资料归档 · 人工确认">
                <el-select v-model="handoverForm.documentCheckStatus"><el-option v-for="option in checkOptions" :key="option.value" v-bind="option" /></el-select>
              </el-form-item>
              <el-form-item label="资产归还 · 人工确认">
                <el-select v-model="handoverForm.assetCheckStatus"><el-option v-for="option in checkOptions" :key="option.value" v-bind="option" /></el-select>
              </el-form-item>
              <el-form-item label="薪资结算 · 人工确认">
                <el-select v-model="handoverForm.settlementCheckStatus"><el-option v-for="option in checkOptions" :key="option.value" v-bind="option" /></el-select>
              </el-form-item>
            </div>

            <el-form-item label="交接事项">
              <el-input v-model="handoverForm.items" type="textarea" :rows="4" maxlength="2000" show-word-limit placeholder="记录客户、任务、资料、资产、结算等实际交接事项" />
            </el-form-item>
            <el-form-item label="交接 SOP 附件">
              <div class="sop-actions">
                <el-upload :show-file-list="false" :before-upload="uploadSop" :disabled="uploading">
                  <el-button :icon="Upload" :loading="uploading">{{ sopName || '上传 SOP 附件' }}</el-button>
                </el-upload>
                <el-button v-if="handoverForm.sopFileId" link type="primary" @click="downloadSop">下载</el-button>
                <el-button v-if="handoverForm.sopFileId" link type="danger" @click="clearSop">移除</el-button>
              </div>
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="handoverForm.remark" type="textarea" :rows="2" maxlength="500" placeholder="记录阻塞原因或后续安排" />
            </el-form-item>
          </el-form>

          <el-divider content-position="left">真实时间线</el-divider>
          <el-timeline v-if="detail.timeline?.length" class="truth-timeline">
            <el-timeline-item
              v-for="(item, index) in detail.timeline"
              :key="`${item.time || 'time'}-${index}`"
              :timestamp="item.time || '时间未记录'"
              placement="top"
              :type="timelineType(item.type)"
            >
              <strong>{{ item.title }}</strong>
              <p v-if="item.description">{{ item.description }}</p>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无可核验的时间线记录" :image-size="68" />
        </template>
        <el-result
          v-else-if="!detailLoading"
          icon="warning"
          title="详情暂时加载失败"
          sub-title="尚未加载成功前不会允许保存，避免误写交接记录。"
        >
          <template #extra>
            <el-button type="primary" @click="detailTargetId && loadDetail(detailTargetId)">重新加载</el-button>
          </template>
        </el-result>
      </div>

      <template #footer>
        <div class="drawer-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
          <el-button
            type="primary"
            :loading="saving"
            :disabled="detailLoading || uploading || !detail"
            @click="saveHandover"
          >保存交接确认</el-button>
        </div>
      </template>
    </el-drawer>

    <el-dialog
      v-model="historyVisible"
      title="补录历史离职员工"
      width="min(600px, calc(100vw - 24px))"
      class="history-dialog"
      destroy-on-close
    >
      <el-alert
        type="info"
        :closable="false"
        show-icon
        title="适用于系统启用前已经离职的人员；不会创建登录账号，也不会发送任何通知。"
      />
      <el-form :model="historyForm" label-position="top" class="history-form">
        <el-form-item label="姓名" required>
          <el-input v-model="historyForm.name" maxlength="64" placeholder="请输入真实姓名" />
        </el-form-item>
        <div class="two-column">
          <el-form-item label="原部门" required>
            <el-tree-select
              v-model="historyForm.deptId"
              :data="deptTree"
              :props="{ label: 'deptName', children: 'children', value: 'id' }"
              check-strictly
              placeholder="选择原部门"
            />
          </el-form-item>
          <el-form-item label="原岗位" required>
            <el-select v-model="historyForm.postId" filterable placeholder="选择原岗位">
              <el-option v-for="post in postList" :key="post.id" :label="post.postName" :value="Number(post.id)" />
            </el-select>
          </el-form-item>
        </div>
        <div class="two-column">
          <el-form-item label="入职日期（可选）">
            <el-date-picker v-model="historyForm.hireDate" type="date" value-format="YYYY-MM-DD" placeholder="未记录可留空" />
          </el-form-item>
          <el-form-item label="真实离职日期" required>
            <el-date-picker
              v-model="historyForm.resignDate"
              type="date"
              value-format="YYYY-MM-DD"
              :disabled-date="disableFutureDate"
              placeholder="请选择离职日期"
            />
          </el-form-item>
        </div>
        <el-form-item label="备注">
          <el-input v-model="historyForm.remark" type="textarea" :rows="3" maxlength="500" placeholder="可记录资料缺失项或补录说明，请勿填写敏感离职原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="historyVisible = false">取消</el-button>
        <el-button type="primary" :loading="historySaving" @click="submitHistory">确认补录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight, Plus, Refresh, Search, Upload, UserFilled } from '@element-plus/icons-vue'
import { deptApi, employeeApi, postApi } from '@/api/org'
import { downloadFileById } from '@/utils/download'
import {
  resignHandoverApi,
  type ResignCheckStatus,
  type ResignHandoverInput,
  type ResignedAccountStatus,
  type ResignedStaffDetail,
  type ResignedStaffRow,
  type ResignedStaffSummary
} from '@/api/hrm'

type ManualKey = 'customerCheckStatus' | 'taskCheckStatus' | 'documentCheckStatus' | 'assetCheckStatus' | 'settlementCheckStatus'

const router = useRouter()
const manualDomains: Array<{ key: ManualKey; label: string }> = [
  { key: 'customerCheckStatus', label: '客户' },
  { key: 'taskCheckStatus', label: '任务' },
  { key: 'documentCheckStatus', label: '资料' },
  { key: 'assetCheckStatus', label: '资产' },
  { key: 'settlementCheckStatus', label: '结算' }
]
const checkOptions = [
  { value: 0, label: '待确认' },
  { value: 1, label: '处理中' },
  { value: 2, label: '已完成' },
  { value: 3, label: '异常' }
]
const handoverOptions = [
  { value: 0, label: '待交接' },
  { value: 1, label: '交接中' },
  { value: 2, label: '已闭环' }
]

const loading = ref(false)
const centerError = ref(false)
const summaryError = ref(false)
const hasDataError = computed(() => centerError.value || summaryError.value)
const rows = ref<ResignedStaffRow[]>([])
const total = ref(0)
const summary = reactive<ResignedStaffSummary>({ total: 0, inProgress: 0, riskCount: 0, accountRiskCount: 0, closedCount: 0 })
const deptTree = ref<any[]>([])
const postList = ref<any[]>([])
const colleagues = ref<any[]>([])
const query = reactive<{ pageNum: number; pageSize: number; name?: string; deptId?: number; status?: number; riskOnly?: boolean }>({
  pageNum: 1,
  pageSize: 20
})

const detailVisible = ref(false)
const detailLoading = ref(false)
const detail = ref<ResignedStaffDetail>()
const detailTargetId = ref<number>()
let detailRequestId = 0
let sopUploadRequestId = 0
const saving = ref(false)
const uploading = ref(false)
const sopName = ref('')
const emptyHandover = (employeeId = 0): ResignHandoverInput => ({
  id: undefined,
  recordVersion: undefined,
  employeeId,
  handoverDate: undefined,
  handoverToEmployeeId: undefined,
  sopFileId: undefined,
  clearSopFile: false,
  items: undefined,
  status: 0,
  remark: undefined,
  customerCheckStatus: 0,
  taskCheckStatus: 0,
  documentCheckStatus: 0,
  assetCheckStatus: 0,
  settlementCheckStatus: 0
})
const handoverForm = reactive<ResignHandoverInput>(emptyHandover())

const historyVisible = ref(false)
const historySaving = ref(false)
const historyForm = reactive<{ name: string; deptId?: number; postId?: number; hireDate?: string; resignDate?: string; remark?: string }>({ name: '' })

function avatarText(name?: string) {
  return String(name || '离').trim().slice(0, 1)
}

function disableFutureDate(date: Date) {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() > today.getTime()
}

function accountMeta(status?: ResignedAccountStatus) {
  if (status === 0) return { label: '仍可登录', type: 'danger' as const, tone: 'danger' }
  if (status === 1) return { label: '已停用', type: 'success' as const, tone: 'success' }
  if (status === 3) return { label: '关联异常', type: 'danger' as const, tone: 'danger' }
  return { label: '未开通', type: 'info' as const, tone: 'neutral' }
}

function checkMeta(status?: ResignCheckStatus) {
  const map = {
    0: { label: '待确认', type: 'info' as const, tone: 'neutral' },
    1: { label: '处理中', type: 'warning' as const, tone: 'warning' },
    2: { label: '已完成', type: 'success' as const, tone: 'success' },
    3: { label: '异常', type: 'danger' as const, tone: 'danger' }
  }
  return map[status ?? 0]
}

function handoverMeta(status?: number) {
  if (status === 2) return { label: '已闭环', type: 'success' as const }
  if (status === 1) return { label: '交接中', type: 'warning' as const }
  return { label: '待交接', type: 'info' as const }
}

function riskMeta(row: ResignedStaffRow) {
  const level = String(row.riskLevel || '').toLowerCase()
  if (row.accountStatus === 0 || ['high', '高', '高风险'].includes(level)) return { label: '高风险', type: 'danger' as const }
  if (['medium', '中', '中风险'].includes(level)) return { label: '中风险', type: 'warning' as const }
  if (!row.riskCount || row.status === 2 || ['closed', 'safe', '已闭环'].includes(level)) return { label: '已闭环', type: 'success' as const }
  return { label: '低风险', type: 'info' as const }
}

function timelineType(type?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const value = String(type || '').toLowerCase()
  if (value.includes('resign') || value.includes('离职')) return 'danger'
  if (value.includes('complete') || value.includes('closed') || value.includes('完成')) return 'success'
  if (value.includes('handover') || value.includes('交接')) return 'warning'
  return 'primary'
}

async function loadCenter() {
  loading.value = true
  try {
    const res: any = await resignHandoverApi.center({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      name: query.name || undefined,
      deptId: query.deptId,
      status: query.status,
      riskOnly: query.riskOnly || undefined
    })
    const page = res?.data || {}
    rows.value = page.records || []
    total.value = Number(page.total || 0)
    centerError.value = false
  } catch {
    centerError.value = true
  } finally {
    loading.value = false
  }
}

async function loadSummary() {
  try {
    const res: any = await resignHandoverApi.summary()
    const data = res?.data || {}
    summary.total = Number(data.total || 0)
    summary.inProgress = Number(data.inProgress || 0)
    summary.riskCount = Number(data.riskCount || 0)
    summary.accountRiskCount = Number(data.accountRiskCount || 0)
    summary.closedCount = Number(data.closedCount || 0)
    summaryError.value = false
  } catch {
    summaryError.value = true
  }
}

async function loadAll() {
  await Promise.all([loadCenter(), loadSummary()])
}

function search() {
  query.pageNum = 1
  loadCenter()
}

function reset() {
  Object.assign(query, { pageNum: 1, pageSize: query.pageSize, name: undefined, deptId: undefined, status: undefined, riskOnly: undefined })
  loadCenter()
}

function handleSizeChange() {
  query.pageNum = 1
  loadCenter()
}

async function loadOptions() {
  const [deptResult, postResult, employeeResult] = await Promise.allSettled([
    deptApi.tree(),
    postApi.all(),
    employeeApi.roster()
  ])
  deptTree.value = deptResult.status === 'fulfilled' ? (deptResult.value as any)?.data || [] : []
  postList.value = postResult.status === 'fulfilled' ? (postResult.value as any)?.data || [] : []
  const employeeData = employeeResult.status === 'fulfilled' ? (employeeResult.value as any)?.data || [] : []
  colleagues.value = employeeData.filter((employee: any) => employee.status === 1 || employee.status === 2)
}

function fillHandoverForm(detailData: ResignedStaffDetail) {
  const employee = detailData.employee
  const latest = detailData.handovers?.find(record => String(record.id || '') === String(employee.handoverId || ''))
    || detailData.handovers?.[0]
  replaceHandoverForm({
    id: latest?.id || employee.handoverId,
    recordVersion: latest?.recordVersion,
    employeeId: employee.employeeId,
    handoverDate: latest?.handoverDate || employee.handoverDate,
    handoverToEmployeeId: latest?.handoverToEmployeeId || employee.handoverToEmployeeId,
    sopFileId: latest?.sopFileId,
    clearSopFile: false,
    items: latest?.items,
    status: latest?.status ?? employee.status ?? 0,
    remark: latest?.remark,
    customerCheckStatus: latest?.customerCheckStatus ?? employee.customerCheckStatus ?? 0,
    taskCheckStatus: latest?.taskCheckStatus ?? employee.taskCheckStatus ?? 0,
    documentCheckStatus: latest?.documentCheckStatus ?? employee.documentCheckStatus ?? 0,
    assetCheckStatus: latest?.assetCheckStatus ?? employee.assetCheckStatus ?? 0,
    settlementCheckStatus: latest?.settlementCheckStatus ?? employee.settlementCheckStatus ?? 0
  })
  sopName.value = handoverForm.sopFileId ? '已上传 SOP 附件' : ''
}

function replaceHandoverForm(next: ResignHandoverInput) {
  for (const key of Object.keys(handoverForm)) {
    delete (handoverForm as Record<string, unknown>)[key]
  }
  Object.assign(handoverForm, emptyHandover(next.employeeId), next)
}

async function loadDetail(employeeId: number) {
  const requestId = ++detailRequestId
  detailLoading.value = true
  try {
    const res: any = await resignHandoverApi.centerDetail(employeeId)
    if (requestId !== detailRequestId || detailTargetId.value !== employeeId) return
    detail.value = res?.data
    if (detail.value) fillHandoverForm(detail.value)
  } catch {
    if (requestId !== detailRequestId || detailTargetId.value !== employeeId) return
    detail.value = undefined
    replaceHandoverForm(emptyHandover(employeeId))
    sopName.value = ''
  } finally {
    if (requestId === detailRequestId && detailTargetId.value === employeeId) {
      detailLoading.value = false
    }
  }
}

function openDetail(row: ResignedStaffRow) {
  // 详情目标变化时作废上一人的未完成附件上传响应，避免迟到结果错挂到新员工。
  sopUploadRequestId++
  uploading.value = false
  detailVisible.value = true
  detail.value = undefined
  detailTargetId.value = row.employeeId
  replaceHandoverForm(emptyHandover(row.employeeId))
  sopName.value = ''
  loadDetail(row.employeeId)
}

async function uploadSop(file: File) {
  const requestId = ++sopUploadRequestId
  const employeeId = handoverForm.employeeId
  uploading.value = true
  try {
    const res: any = await resignHandoverApi.uploadSop(file)
    if (requestId !== sopUploadRequestId
      || detailTargetId.value !== employeeId
      || handoverForm.employeeId !== employeeId) return false
    const data = res?.data || {}
    if (!data.id) throw new Error('上传结果缺少文件编号')
    handoverForm.sopFileId = data.id
    handoverForm.clearSopFile = false
    sopName.value = data.originalName || data.fileName || file.name
    ElMessage.success('SOP 附件上传成功')
  } catch (error: any) {
    ElMessage.error(error?.message || 'SOP 附件上传失败')
  } finally {
    if (requestId === sopUploadRequestId) uploading.value = false
  }
  return false
}

function clearSop() {
  handoverForm.sopFileId = undefined
  handoverForm.clearSopFile = true
  sopName.value = ''
}

async function downloadSop() {
  if (handoverForm.sopFileId) await downloadFileById(handoverForm.sopFileId, sopName.value || undefined)
}

async function saveHandover() {
  if (!handoverForm.employeeId) return ElMessage.warning('缺少离职员工信息')
  if (uploading.value) return ElMessage.warning('附件仍在上传，请稍候再保存')
  if ((handoverForm.status || 0) > 0 && !handoverForm.handoverToEmployeeId) {
    return ElMessage.warning('交接开始后必须选择接收人')
  }
  saving.value = true
  try {
    const payload: ResignHandoverInput = {
      id: handoverForm.id,
      recordVersion: handoverForm.recordVersion,
      employeeId: handoverForm.employeeId,
      handoverDate: handoverForm.handoverDate,
      handoverToEmployeeId: handoverForm.handoverToEmployeeId,
      sopFileId: handoverForm.sopFileId,
      clearSopFile: Boolean(handoverForm.clearSopFile),
      items: handoverForm.items,
      status: handoverForm.status,
      remark: handoverForm.remark,
      customerCheckStatus: handoverForm.customerCheckStatus,
      taskCheckStatus: handoverForm.taskCheckStatus,
      documentCheckStatus: handoverForm.documentCheckStatus,
      assetCheckStatus: handoverForm.assetCheckStatus,
      settlementCheckStatus: handoverForm.settlementCheckStatus
    }
    await resignHandoverApi.save(payload)
    ElMessage.success('离职交接已保存')
    await Promise.all([loadCenter(), loadSummary(), loadDetail(handoverForm.employeeId)])
  } finally {
    saving.value = false
  }
}

function resetHistoryForm() {
  Object.assign(historyForm, { name: '', deptId: undefined, postId: undefined, hireDate: undefined, resignDate: undefined, remark: undefined })
}

function openHistoryDialog() {
  if (hasDataError.value) {
    ElMessage.error('离职数据尚未完整加载，请先重新加载后再补录')
    return
  }
  resetHistoryForm()
  historyVisible.value = true
}

async function submitHistory() {
  if (!historyForm.name.trim()) return ElMessage.warning('请输入员工姓名')
  if (!historyForm.deptId) return ElMessage.warning('请选择原部门')
  if (!historyForm.postId) return ElMessage.warning('请选择原岗位')
  if (!historyForm.resignDate) return ElMessage.warning('请选择真实离职日期')
  if (disableFutureDate(new Date(`${historyForm.resignDate}T00:00:00`))) return ElMessage.warning('离职日期不能晚于今天')
  if (historyForm.hireDate && historyForm.hireDate > historyForm.resignDate) return ElMessage.warning('入职日期不能晚于离职日期')
  historySaving.value = true
  try {
    await employeeApi.create({
      name: historyForm.name.trim(),
      deptId: historyForm.deptId,
      postId: historyForm.postId,
      hireDate: historyForm.hireDate,
      resignDate: historyForm.resignDate,
      remark: historyForm.remark,
      status: 3,
      accountEnabled: false
    })
    ElMessage.success('历史离职员工已补录')
    historyVisible.value = false
    await loadAll()
  } finally {
    historySaving.value = false
  }
}

onMounted(() => {
  loadAll()
  loadOptions()
})
</script>

<style scoped>
.offboarding-center {
  min-height: 100%;
  padding: 4px 2px 28px;
  color: #1f2937;
}

.page-head,
.title-row,
.head-actions,
.matrix-title,
.employee-cell,
.staff-card-head,
.staff-card-foot,
.drawer-heading,
.drawer-state-row,
.sop-actions,
.drawer-footer {
  display: flex;
  align-items: center;
}

.page-head {
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
}

.back-button { margin: 0 0 8px -8px; }
.title-row { gap: 12px; }
.title-icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: #2563eb;
  background: #eaf2ff;
  font-size: 22px;
}
.page-head h2,
.drawer-heading h3,
.matrix-title h3 { margin: 0; }
.page-head h2 { font-size: 22px; }
.page-head p,
.drawer-heading p,
.matrix-title p { margin: 5px 0 0; color: #6b7280; font-size: 13px; }
.head-actions { gap: 10px; flex: none; }
.truth-alert { margin-bottom: 14px; }
.data-error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 14px 16px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #991b1b;
}
.data-error-banner strong,
.data-error-banner span { display: block; }
.data-error-banner span { margin-top: 4px; font-size: 12px; line-height: 1.5; }

.summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.summary-card {
  position: relative;
  overflow: hidden;
  min-height: 116px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(15 23 42 / 4%);
}
.summary-card::before { content: ''; position: absolute; inset: 0 auto 0 0; width: 4px; background: #94a3b8; }
.summary-card.is-warning::before { background: #f59e0b; }
.summary-card.is-danger::before,
.summary-card.is-danger-soft::before { background: #ef4444; }
.summary-card.is-success::before { background: #10b981; }
.summary-label { display: block; color: #64748b; font-size: 13px; }
.summary-card strong { display: block; margin: 8px 0 4px; color: #0f172a; font-size: 30px; line-height: 1; }
.summary-card small { color: #94a3b8; font-size: 12px; }
.summary-card.is-danger-soft { background: #fff8f8; border-color: #fee2e2; }

.filter-card,
.matrix-card { border-radius: 12px; }
.filter-card { margin-bottom: 14px; }
.filter-card :deep(.el-card__body) { padding: 16px 18px 0; }
.filter-form :deep(.el-form-item) { margin-bottom: 16px; }
.filter-form :deep(.el-input),
.filter-form :deep(.el-select),
.filter-form :deep(.el-tree-select) { width: 180px; }
.filter-actions { margin-left: auto; }
.matrix-card :deep(.el-card__body) { padding: 0; }
.matrix-title { justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid #edf0f5; }
.matrix-title h3 { font-size: 16px; }
.matrix-title > span { color: #64748b; font-size: 13px; }
.desktop-matrix :deep(.el-table th.el-table__cell) { background: #f8fafc; color: #475569; }
.domain-head { display: flex; flex-direction: column; line-height: 1.2; }
.domain-head small { margin-top: 4px; color: #a16207; font-size: 10px; font-weight: 400; }
.employee-cell { gap: 10px; min-width: 0; }
.employee-avatar {
  display: grid;
  flex: none;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 8px;
  color: #1d4ed8;
  background: #dbeafe;
  font-weight: 700;
}
.employee-avatar.is-large { width: 42px; height: 42px; border-radius: 12px; }
.employee-cell > div,
.drawer-heading > div { min-width: 0; }
.employee-cell strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.employee-cell small { display: block; margin-top: 3px; overflow: hidden; color: #94a3b8; font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }
.risk-cell { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.risk-cell small { color: #94a3b8; font-size: 10px; }
.pager { display: flex; justify-content: flex-end; padding: 16px 20px; border-top: 1px solid #edf0f5; }
.mobile-matrix { display: none; }

.drawer-heading { gap: 12px; }
.drawer-heading h3 { font-size: 18px; }
.drawer-body { min-height: 360px; }
.drawer-state-row { flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.drawer-domain-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 14px 0 6px;
}
.domain-box { padding: 13px; border: 1px solid #fde7bd; border-radius: 8px; background: #fffbeb; }
.domain-box.system-domain { border-color: #dbeafe; background: #eff6ff; }
.domain-box span { display: block; color: #64748b; font-size: 12px; }
.domain-box em { padding: 1px 4px; border-radius: 4px; background: rgb(255 255 255 / 80%); color: #a16207; font-size: 9px; font-style: normal; }
.domain-box strong { display: block; margin-top: 7px; font-size: 14px; }
.two-column,
.manual-editor-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 14px; }
.handover-form :deep(.el-date-editor),
.handover-form :deep(.el-select),
.history-form :deep(.el-date-editor),
.history-form :deep(.el-select),
.history-form :deep(.el-tree-select) { width: 100%; }
.manual-editor-title { display: flex; justify-content: space-between; gap: 12px; margin: 4px 0 12px; }
.manual-editor-title span { color: #a16207; font-size: 12px; }
.sop-actions { flex-wrap: wrap; gap: 8px; }
.truth-timeline { padding: 4px 4px 0; }
.truth-timeline p { margin: 5px 0 0; color: #6b7280; line-height: 1.6; }
.drawer-footer { justify-content: flex-end; gap: 8px; }
.history-dialog :deep(.el-alert) { margin-bottom: 16px; }
.history-form { margin-top: 16px; }

@media (max-width: 1200px) {
  .summary-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .summary-card:nth-child(4), .summary-card:nth-child(5) { min-height: 100px; }
}

@media (max-width: 767px) {
  .offboarding-center { padding: 0 0 18px; }
  .page-head { align-items: flex-start; flex-direction: column; }
  .head-actions { width: 100%; }
  .head-actions :deep(.el-button) { flex: 1; margin: 0; }
  .data-error-banner { align-items: stretch; flex-direction: column; }
  .page-head h2 { font-size: 19px; }
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .summary-card { min-height: 98px; padding: 14px; }
  .summary-card strong { font-size: 24px; }
  .filter-card :deep(.el-card__body) { padding: 14px 14px 0; }
  .filter-form { display: grid; grid-template-columns: 1fr 1fr; gap: 0 8px; }
  .filter-form :deep(.el-form-item) { display: block; margin-right: 0; }
  .filter-form :deep(.el-input),
  .filter-form :deep(.el-select),
  .filter-form :deep(.el-tree-select) { width: 100%; }
  .filter-actions { grid-column: 1 / -1; }
  .matrix-title { padding: 15px; }
  .desktop-matrix { display: none; }
  .mobile-matrix { display: block; padding: 10px; }
  .staff-card { margin-bottom: 10px; padding: 14px; border: 1px solid #e5e7eb; border-radius: 12px; background: #fff; }
  .staff-card-head { justify-content: space-between; gap: 10px; }
  .mobile-domain-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin: 14px 0; }
  .mobile-domain-grid > div { padding: 9px; border-radius: 8px; background: #f8fafc; }
  .mobile-domain-grid span { display: block; color: #64748b; font-size: 11px; }
  .mobile-domain-grid em { margin-left: 3px; color: #a16207; font-size: 9px; font-style: normal; }
  .mobile-domain-grid b { display: block; margin-top: 4px; font-size: 12px; }
  .state-danger { color: #dc2626; }
  .state-warning { color: #d97706; }
  .state-success { color: #059669; }
  .state-neutral { color: #64748b; }
  .staff-card-foot { justify-content: space-between; padding-top: 10px; border-top: 1px solid #eef2f7; color: #64748b; font-size: 12px; }
  .pager { justify-content: center; padding: 12px 8px; overflow-x: auto; }
  .drawer-domain-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .two-column,
  .manual-editor-grid { grid-template-columns: 1fr; }
  .manual-editor-title { flex-direction: column; }
}
</style>

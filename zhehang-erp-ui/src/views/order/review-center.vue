<template>
  <div class="review-center">
    <header class="page-head">
      <div>
        <h1>审单执行中心</h1>
        <p>财务确认、办事接收、结果提交与验收闭环</p>
      </div>
      <el-tooltip content="刷新审单数据" placement="bottom">
        <el-button :icon="Refresh" circle :loading="loading" aria-label="刷新审单数据" @click="refreshAll" />
      </el-tooltip>
    </header>

    <nav class="status-strip" aria-label="审单状态筛选">
      <button
        v-for="item in statusFilters"
        :key="item.key"
        type="button"
        :class="{ active: activeStatus === item.key }"
        @click="switchStatus(item.key)"
      >
        <span>{{ item.label }}</span>
        <b>{{ item.value }}</b>
      </button>
    </nav>

    <section class="toolbar">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        clearable
        placeholder="审单编号、订单编号、客户或办事人员"
        @keyup.enter="applySearch"
        @clear="applySearch"
      />
      <el-button type="primary" :icon="Search" @click="applySearch">查询</el-button>
      <span class="result-count">共 {{ page.total }} 条</span>
    </section>

    <section class="work-surface">
      <el-table
        v-loading="loading"
        :data="rows"
        class="desktop-table"
        height="100%"
        stripe
        @row-dblclick="openDetail"
      >
        <el-table-column label="审单 / 客户" min-width="220" fixed="left">
          <template #default="{ row }">
            <button type="button" class="primary-cell" @click="openDetail(row)">
              <strong>{{ row.reviewNo || `审单 #${row.id}` }}</strong>
              <span>{{ row.customerName || '未填写客户' }}</span>
              <small>{{ row.orderNo || '未关联订单号' }} · {{ businessLabel(row.businessType) }}</small>
            </button>
          </template>
        </el-table-column>
        <el-table-column label="金额" width="116" align="right">
          <template #default="{ row }">
            <div class="money-cell">
              <strong>¥{{ money(row.receivableAmount) }}</strong>
              <span>到账 ¥{{ money(row.receivedAmount) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="销售" prop="salesName" width="90" show-overflow-tooltip />
        <el-table-column label="办事人员" width="110" show-overflow-tooltip>
          <template #default="{ row }">
            <span :class="{ muted: !row.handlerName }">{{ row.handlerName || '待分配' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="当前节点" width="110">
          <template #default="{ row }">{{ nodeLabel(row.currentNode) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="105" align="center">
          <template #default="{ row }">
            <el-tag :type="statusMeta(row.reviewStatus).type" effect="plain">
              {{ displayStatus(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="截止时间" width="150">
          <template #default="{ row }">
            <div class="deadline" :class="{ overdue: isOverdue(row) }">
              <span>{{ dateTime(row.deadline) || '未设置' }}</span>
              <small v-if="isOverdue(row)">已逾期</small>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right" align="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-tooltip content="查看详情">
                <el-button :icon="View" circle size="small" aria-label="查看详情" @click="openDetail(row)" />
              </el-tooltip>
              <el-button v-if="canContract(row)" link type="primary" @click="openNodeReview(row, 'contract')">合同审理</el-button>
              <el-button v-if="canPayment(row)" link type="success" @click="openNodeReview(row, 'payment')">到款确认</el-button>
              <el-button v-if="canAssign(row)" link type="primary" @click="openAssign(row)">分配</el-button>
              <el-button v-if="canAccept(row)" link type="success" @click="openAccept(row)">接收</el-button>
              <el-button v-if="canSubmit(row)" link type="warning" @click="openSubmit(row)">提交结果</el-button>
              <el-button v-if="canConfirm(row)" link type="primary" @click="openConfirm(row)">验收</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="当前范围暂无审单" />
        </template>
      </el-table>

      <div v-loading="loading" class="mobile-list">
        <article v-for="row in rows" :key="row.id" class="mobile-row" @click="openDetail(row)">
          <div class="mobile-row-head">
            <strong>{{ row.customerName || row.reviewNo }}</strong>
            <el-tag :type="statusMeta(row.reviewStatus).type" size="small" effect="plain">{{ displayStatus(row) }}</el-tag>
          </div>
          <p>{{ row.reviewNo }} · {{ row.orderNo || '未关联订单号' }}</p>
          <div class="mobile-meta">
            <span>¥{{ money(row.receivableAmount) }}</span>
            <span>{{ row.handlerName || '待分配' }}</span>
            <span :class="{ danger: isOverdue(row) }">{{ dateTime(row.deadline) || '未设截止' }}</span>
          </div>
          <div class="mobile-actions" @click.stop>
            <el-button v-if="canContract(row)" size="small" type="primary" @click="openNodeReview(row, 'contract')">合同审理</el-button>
            <el-button v-if="canPayment(row)" size="small" type="success" @click="openNodeReview(row, 'payment')">到款确认</el-button>
            <el-button v-if="canAssign(row)" size="small" type="primary" @click="openAssign(row)">分配</el-button>
            <el-button v-if="canAccept(row)" size="small" type="success" @click="openAccept(row)">接收</el-button>
            <el-button v-if="canSubmit(row)" size="small" type="warning" @click="openSubmit(row)">提交结果</el-button>
            <el-button v-if="canConfirm(row)" size="small" type="primary" @click="openConfirm(row)">验收</el-button>
          </div>
        </article>
        <el-empty v-if="!loading && !rows.length" description="当前范围暂无审单" />
      </div>

      <footer class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="page.total"
          layout="total, sizes, prev, pager, next"
          background
          @current-change="loadList"
          @size-change="handlePageSize"
        />
      </footer>
    </section>

    <BusinessDetailDrawer
      v-if="detail?.review"
      v-model="detailVisible"
      :title="detail.review.customerName || detail.review.reviewNo || '审单详情'"
      :subtitle="`${detail.review.reviewNo || ''} · ${detail.review.orderNo || '未关联订单号'}`"
      eyebrow="审单执行闭环"
      avatar="审"
      :avatar-class="statusMeta(detail.review.reviewStatus).avatar"
      :status-text="displayStatus(detail.review)"
      :status-type="statusMeta(detail.review.reviewStatus).type"
      size="720px"
    >
      <template #actions>
        <el-tag v-if="isOverdue(detail.review)" type="danger" effect="dark">已逾期</el-tag>
      </template>

      <template #meta>
        <div class="bd-kv-grid">
          <div class="bd-kv"><span>当前节点</span><b>{{ nodeLabel(detail.review.currentNode) }}</b></div>
          <div class="bd-kv"><span>业务类型</span><b>{{ businessLabel(detail.review.businessType) }}</b></div>
          <div class="bd-kv"><span>销售</span><b>{{ detail.review.salesName || '—' }}</b></div>
          <div class="bd-kv"><span>办事人员</span><b>{{ detail.review.handlerName || '待分配' }}</b></div>
          <div class="bd-kv"><span>应收金额</span><b>¥{{ money(detail.review.receivableAmount) }}</b></div>
          <div class="bd-kv"><span>已确认到账</span><b>¥{{ money(detail.review.receivedAmount) }}</b></div>
          <div class="bd-kv"><span>提交时间</span><b>{{ dateTime(detail.review.submittedAt) || '—' }}</b></div>
          <div class="bd-kv"><span>办理截止</span><b :class="{ danger: isOverdue(detail.review) }">{{ dateTime(detail.review.deadline) || '未设置' }}</b></div>
          <div v-if="detail.review.remark" class="bd-kv wide"><span>提单备注</span><b>{{ detail.review.remark }}</b></div>
        </div>
      </template>

      <div class="process-line">
        <el-steps :active="stepActive(detail.review)" finish-status="success" simple>
          <el-step title="财务已确认" />
          <el-step title="办事接收" />
          <el-step title="办理中" />
          <el-step title="待验收" />
          <el-step title="已完成" />
        </el-steps>
      </div>

      <section class="node-section">
        <h3>前置核验</h3>
        <div class="detail-grid">
          <div><span>合同审理</span><b>{{ detail.contract?.reviewResult === 'pass' ? '已通过' : '—' }}</b></div>
          <div><span>合同金额</span><b>¥{{ money(detail.contract?.contractAmount) }}</b></div>
          <div><span>财务确认人</span><b>{{ detail.payment?.confirmerName || '—' }}</b></div>
          <div><span>到账日期</span><b>{{ dateOnly(detail.payment?.receivedDate) || '—' }}</b></div>
        </div>
      </section>

      <section class="node-section">
        <h3>办事接收</h3>
        <div class="detail-grid">
          <div><span>办事人员</span><b>{{ detail.accept?.handlerName || detail.review.handlerName || '待分配' }}</b></div>
          <div><span>资料状态</span><b>{{ materialsLabel(detail.accept?.materialsReady) }}</b></div>
          <div><span>接收时间</span><b>{{ dateTime(detail.accept?.acceptTime) || '—' }}</b></div>
          <div><span>预计完成</span><b>{{ dateTime(detail.accept?.expectedCompleteTime) || '—' }}</b></div>
          <div v-if="detail.accept?.acceptRemark" class="wide"><span>接收意见</span><b>{{ detail.accept.acceptRemark }}</b></div>
        </div>
      </section>

      <section class="node-section">
        <h3>办理结果</h3>
        <div class="detail-grid">
          <div><span>提交人</span><b>{{ detail.complete?.submitterName || '—' }}</b></div>
          <div><span>提交时间</span><b>{{ dateTime(detail.complete?.completeTime) || '—' }}</b></div>
          <div v-if="detail.complete?.resultDesc" class="wide"><span>结果说明</span><b>{{ detail.complete.resultDesc }}</b></div>
          <div v-if="detail.complete?.completeRemark" class="wide"><span>最新验收意见</span><b>{{ detail.complete.completeRemark }}</b></div>
        </div>
        <div v-if="detailAttachments.length" class="attachment-list">
          <button v-for="file in detailAttachments" :key="file.id" type="button" @click="downloadReviewAttachment(file)">
            <el-icon><Paperclip /></el-icon>
            <span>{{ file.name }}</span>
            <small>{{ fileSize(file.size) }}</small>
            <el-icon><Download /></el-icon>
          </button>
        </div>
        <p v-else class="empty-copy">尚未提交办理凭证</p>
      </section>

      <template #timeline>
        <div v-for="record in detail.records || []" :key="record.id" class="bd-timeline-item">
          <i class="bd-timeline-dot" :class="{ success: isPositiveRecord(record.result) }" />
          <div>
            <strong>{{ record.nodeName || nodeLabel(record.nodeCode) }} · {{ actionLabel(record.action, record.result) }}</strong>
            <p>{{ record.operatorName || '系统' }} · {{ dateTime(record.operatedAt) || '—' }}</p>
            <p v-if="record.opinion">{{ record.opinion }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button v-if="canContract(detail.review)" type="primary" @click="openNodeReview(detail.review, 'contract')">合同审理</el-button>
        <el-button v-if="canPayment(detail.review)" type="success" @click="openNodeReview(detail.review, 'payment')">到款确认</el-button>
        <el-button v-if="canAssign(detail.review)" type="primary" @click="openAssign(detail.review)">分配办事人员</el-button>
        <el-button v-if="canAccept(detail.review)" type="success" @click="openAccept(detail.review)">接收 / 退回</el-button>
        <el-button v-if="canSubmit(detail.review)" type="warning" @click="openSubmit(detail.review)">提交办理结果</el-button>
        <el-button v-if="canConfirm(detail.review)" type="primary" @click="openConfirm(detail.review)">验收办理结果</el-button>
      </template>
    </BusinessDetailDrawer>

    <el-dialog v-model="assignDialog.visible" title="分配办事人员" width="min(520px, 92vw)" destroy-on-close :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="办事人员" required>
          <el-select v-model="assignDialog.handlerUserId" filterable placeholder="按姓名、部门或岗位查找" style="width: 100%">
            <el-option v-for="item in employeeOptions" :key="item.userId" :label="employeeLabel(item)" :value="item.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="办理截止时间" required>
          <el-date-picker v-model="assignDialog.deadline" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="分配要求">
          <el-input v-model="assignDialog.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="assignDialog.loading" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="acceptDialog.visible" title="办事接收确认" width="min(520px, 92vw)" destroy-on-close :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="资料是否齐全" required>
          <el-radio-group v-model="acceptDialog.materialsReady">
            <el-radio-button :value="true">资料齐全，接收办理</el-radio-button>
            <el-radio-button :value="false">资料不齐，退回</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="acceptDialog.materialsReady" label="预计完成时间" required>
          <el-date-picker v-model="acceptDialog.expectedCompleteTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item :label="acceptDialog.materialsReady ? '接收备注' : '退回原因'" :required="!acceptDialog.materialsReady">
          <el-input v-model="acceptDialog.remark" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="acceptDialog.visible = false">取消</el-button>
        <el-button :type="acceptDialog.materialsReady ? 'success' : 'danger'" :loading="acceptDialog.loading" @click="submitAccept">
          {{ acceptDialog.materialsReady ? '确认接收' : '确认退回' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="submitDialog.visible" title="提交办理结果" width="min(620px, 92vw)" destroy-on-close :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="办理结果" required>
          <el-input v-model="submitDialog.resultDesc" type="textarea" :rows="4" maxlength="1000" show-word-limit />
        </el-form-item>
        <el-form-item label="办理凭证" required>
          <el-upload
            drag
            multiple
            :show-file-list="false"
            :http-request="uploadProof"
            :before-upload="validateProof"
            accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
            class="proof-upload"
          >
            <el-icon><UploadFilled /></el-icon>
            <div class="el-upload__text">上传办理凭证</div>
          </el-upload>
          <div v-if="submitDialog.uploads.length" class="upload-list">
            <div v-for="item in submitDialog.uploads" :key="item.key" class="upload-row">
              <el-icon v-if="item.status === 'uploading'" class="is-loading"><Loading /></el-icon>
              <el-icon v-else-if="item.status === 'error'" class="upload-error"><WarningFilled /></el-icon>
              <el-icon v-else><Document /></el-icon>
              <span>{{ item.name }}</span>
              <small>{{ item.status === 'uploading' ? '上传中' : item.status === 'error' ? '上传失败' : fileSize(item.size) }}</small>
              <el-button v-if="item.status === 'error'" link type="primary" @click="retryUpload(item)">重试</el-button>
              <el-button link type="danger" :icon="Delete" aria-label="移除凭证" @click="removeUpload(item.key)" />
            </div>
          </div>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="submitDialog.remark" type="textarea" :rows="2" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="submitDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="submitDialog.loading" :disabled="hasUploading" @click="submitResult">提交待验收</el-button>
      </template>
    </el-dialog>

    <!-- 合同审理/到款确认(提单类审核单的真人节点) -->
    <el-dialog v-model="nodeDialog.visible" :title="nodeDialog.node === 'contract' ? '合同审理(部门主管)' : '到款确认(财务)'" width="min(520px, 92vw)" destroy-on-close :close-on-click-modal="false">
      <el-form label-width="96px">
        <el-form-item :label="nodeDialog.node === 'contract' ? '审理结论' : '确认结论'">
          <el-radio-group v-model="nodeDialog.pass">
            <el-radio :value="true">{{ nodeDialog.node === 'contract' ? '通过,转财务确认到款' : '到款无误,转办事分配' }}</el-radio>
            <el-radio :value="false">驳回(提单退回可修改)</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="nodeDialog.pass ? '意见' : '驳回原因'" :required="!nodeDialog.pass">
          <el-input v-model="nodeDialog.opinion" type="textarea" :rows="4" maxlength="500" show-word-limit :placeholder="nodeDialog.pass ? '选填' : '必填,提单人会看到'" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="nodeDialog.visible = false">取消</el-button>
        <el-button :type="nodeDialog.pass ? 'success' : 'danger'" :loading="nodeDialog.loading" @click="submitNodeReview">
          {{ nodeDialog.pass ? '确认通过' : '确认驳回' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="confirmDialog.visible" title="验收办理结果" width="min(520px, 92vw)" destroy-on-close :close-on-click-modal="false">
      <el-form label-position="top">
        <el-form-item label="验收结论" required>
          <el-radio-group v-model="confirmDialog.pass">
            <el-radio-button :value="true">验收通过</el-radio-button>
            <el-radio-button :value="false">驳回重办</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="confirmDialog.pass ? '验收意见' : '驳回原因'" :required="!confirmDialog.pass">
          <el-input v-model="confirmDialog.opinion" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmDialog.visible = false">取消</el-button>
        <el-button :type="confirmDialog.pass ? 'success' : 'danger'" :loading="confirmDialog.loading" @click="submitConfirm">
          {{ confirmDialog.pass ? '确认完成' : '确认驳回' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { UploadRawFile, UploadRequestOptions } from 'element-plus'
import {
  Delete, Document, Download, Loading, Paperclip, Refresh, Search,
  UploadFilled, View, WarningFilled
} from '@element-plus/icons-vue'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'
import { employeeApi } from '@/api/org'
import { fileInfoApi } from '@/api/file'
import { orderReviewApi, type OrderReview, type OrderReviewDetail, type ReviewAttachment, type ReviewRecord, type ReviewStats } from '@/api/order-review'
import { useUserStore } from '@/stores/user'
import { downloadBlob } from '@/utils/download'

type EmployeeOption = { userId: number; name: string; deptName?: string; postName?: string }
type UploadItem = ReviewAttachment & { key: string; status: 'uploading' | 'success' | 'error'; raw: File }

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const rows = ref<OrderReview[]>([])
const keyword = ref('')
const activeStatus = ref('all')
const stats = reactive<ReviewStats>({ total: 0, pendingContract: 0, pendingPayment: 0, pendingAssign: 0, pendingAccept: 0, processing: 0, pendingConfirm: 0, completed: 0, rejected: 0, overdue: 0 })
const page = reactive({ current: 1, size: 20, total: 0 })
const detailVisible = ref(false)
const detail = ref<OrderReviewDetail | null>(null)
const employeeOptions = ref<EmployeeOption[]>([])

const assignDialog = reactive({ visible: false, loading: false, reviewId: 0, handlerUserId: undefined as number | undefined, deadline: '', remark: '' })
const acceptDialog = reactive({ visible: false, loading: false, reviewId: 0, materialsReady: true, expectedCompleteTime: '', remark: '' })
const submitDialog = reactive({ visible: false, loading: false, reviewId: 0, resultDesc: '', remark: '', uploads: [] as UploadItem[] })
const confirmDialog = reactive({ visible: false, loading: false, reviewId: 0, pass: true, opinion: '' })
/** 合同审理(主管)/到款确认(财务)弹窗:node 区分共用一套 */
const nodeDialog = reactive({ visible: false, loading: false, reviewId: 0, node: 'contract' as 'contract' | 'payment', pass: true, opinion: '' })

function openNodeReview(row: OrderReview, node: 'contract' | 'payment') {
  nodeDialog.reviewId = Number(row.id)
  nodeDialog.node = node
  nodeDialog.pass = true
  nodeDialog.opinion = ''
  nodeDialog.visible = true
}

async function submitNodeReview() {
  if (!nodeDialog.pass && !nodeDialog.opinion.trim()) {
    ElMessage.warning('驳回必须填写原因')
    return
  }
  nodeDialog.loading = true
  try {
    const payload = { pass: nodeDialog.pass, opinion: nodeDialog.opinion.trim() || undefined }
    if (nodeDialog.node === 'contract') {
      await orderReviewApi.contractReview(nodeDialog.reviewId, payload)
    } else {
      await orderReviewApi.paymentReview(nodeDialog.reviewId, payload)
    }
    ElMessage.success(nodeDialog.pass ? '已通过' : '已驳回(提单已回到可修改状态)')
    nodeDialog.visible = false
    detailVisible.value = false
    await refreshAll()
  } finally {
    nodeDialog.loading = false
  }
}

const currentUserId = computed(() => Number(userStore.userInfo?.id || 0))
const detailAttachments = computed(() => parseAttachments(detail.value?.complete?.completeVoucher))
const hasUploading = computed(() => submitDialog.uploads.some(item => item.status === 'uploading'))
const statusFilters = computed(() => [
  { key: 'all', label: '全部', value: stats.total },
  { key: 'CONTRACT_PENDING', label: '待合同审理', value: stats.pendingContract || 0 },
  { key: 'PAYMENT_PENDING', label: '待到款确认', value: stats.pendingPayment || 0 },
  { key: 'pending_assign', label: '待分配', value: stats.pendingAssign },
  { key: 'pending_accept', label: '待接收', value: stats.pendingAccept },
  { key: 'processing', label: '办理中', value: stats.processing },
  { key: 'pending_confirm', label: '待验收', value: stats.pendingConfirm },
  { key: 'overdue', label: '已逾期', value: stats.overdue },
  { key: 'rejected', label: '已退回', value: stats.rejected },
  { key: 'completed', label: '已完成', value: stats.completed }
])

onMounted(async () => {
  await Promise.all([refreshAll(), loadEmployees()])
  await openRequestedReview()
})

watch(() => route.query.reviewId, openRequestedReview)

async function refreshAll() {
  await Promise.allSettled([loadList(), loadStats()])
}

async function loadList() {
  loading.value = true
  try {
    const result = await orderReviewApi.list({ pageNum: page.current, pageSize: page.size, status: activeStatus.value, keyword: keyword.value.trim() || undefined })
    rows.value = result.list
    page.total = result.total
  } finally {
    loading.value = false
  }
}

async function loadStats() {
  const result = await orderReviewApi.stats()
  Object.assign(stats, result || {})
}

async function loadEmployees() {
  try {
    const response: any = await employeeApi.options()
    const data = response?.data ?? response
    const list = Array.isArray(data?.records) ? data.records : (Array.isArray(data?.list) ? data.list : (Array.isArray(data) ? data : []))
    employeeOptions.value = list
      .map((item: any) => ({ userId: Number(item.userId || 0), name: item.name || '', deptName: item.deptName, postName: item.postName }))
      .filter((item: EmployeeOption) => item.userId > 0 && item.name)
  } catch {
    employeeOptions.value = []
  }
}

async function openRequestedReview() {
  const id = Number(route.query.reviewId || 0)
  if (id > 0) await openDetail({ id } as OrderReview)
}

function switchStatus(status: string) {
  activeStatus.value = status
  page.current = 1
  loadList()
}

function applySearch() {
  page.current = 1
  loadList()
}

function handlePageSize() {
  page.current = 1
  loadList()
}

async function openDetail(row: OrderReview) {
  try {
    detail.value = await orderReviewApi.detail(Number(row.id))
    detailVisible.value = true
  } catch {
    detailVisible.value = false
  }
}

function openAssign(row: OrderReview) {
  assignDialog.reviewId = row.id
  assignDialog.handlerUserId = row.handlerUserId ? Number(row.handlerUserId) : undefined
  assignDialog.deadline = row.deadline ? toIsoLocal(row.deadline) : ''
  assignDialog.remark = ''
  assignDialog.visible = true
}

function openAccept(row: OrderReview) {
  acceptDialog.reviewId = row.id
  acceptDialog.materialsReady = true
  acceptDialog.expectedCompleteTime = row.deadline ? toIsoLocal(row.deadline) : ''
  acceptDialog.remark = ''
  acceptDialog.visible = true
}

function openSubmit(row: OrderReview) {
  submitDialog.reviewId = row.id
  submitDialog.resultDesc = ''
  submitDialog.remark = ''
  submitDialog.uploads = []
  submitDialog.visible = true
}

function openConfirm(row: OrderReview) {
  confirmDialog.reviewId = row.id
  confirmDialog.pass = true
  confirmDialog.opinion = ''
  confirmDialog.visible = true
}

async function submitAssign() {
  if (!assignDialog.handlerUserId) return ElMessage.warning('请选择办事人员')
  if (!assignDialog.deadline || new Date(assignDialog.deadline).getTime() <= Date.now()) return ElMessage.warning('办理截止时间必须晚于当前时间')
  assignDialog.loading = true
  try {
    // 后端 LocalDateTime 只认空格格式;预填经 toIsoLocal 是 T 格式,提交前归一化(否则接收/重分配主路径必400)
    await orderReviewApi.assignHandler(assignDialog.reviewId, { handlerUserId: assignDialog.handlerUserId, deadline: assignDialog.deadline.replace('T', ' '), remark: assignDialog.remark.trim() || undefined })
    ElMessage.success('办事人员已分配')
    assignDialog.visible = false
    await afterMutation(assignDialog.reviewId)
  } finally {
    assignDialog.loading = false
  }
}

async function submitAccept() {
  if (acceptDialog.materialsReady && (!acceptDialog.expectedCompleteTime || new Date(acceptDialog.expectedCompleteTime).getTime() <= Date.now())) return ElMessage.warning('请填写晚于当前时间的预计完成时间')
  if (!acceptDialog.materialsReady && !acceptDialog.remark.trim()) return ElMessage.warning('退回资料必须填写原因')
  acceptDialog.loading = true
  try {
    await orderReviewApi.accept(acceptDialog.reviewId, {
      materialsReady: acceptDialog.materialsReady,
      expectedCompleteTime: acceptDialog.materialsReady ? acceptDialog.expectedCompleteTime.replace('T', ' ') : undefined,
      remark: acceptDialog.remark.trim() || undefined
    })
    ElMessage.success(acceptDialog.materialsReady ? '审单已接收，进入办理中' : '资料已退回')
    acceptDialog.visible = false
    await afterMutation(acceptDialog.reviewId)
  } finally {
    acceptDialog.loading = false
  }
}

function validateProof(file: UploadRawFile) {
  if (submitDialog.uploads.length >= 10) {
    ElMessage.warning('最多上传 10 个办理凭证')
    return false
  }
  const extension = file.name.split('.').pop()?.toLowerCase() || ''
  if (!['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
    ElMessage.warning('仅支持图片、PDF、Word 和 Excel 文件')
    return false
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.warning('单个凭证不能超过 20MB')
    return false
  }
  return true
}

async function uploadProof(options: UploadRequestOptions) {
  const raw = options.file as File
  if (submitDialog.uploads.length >= 10) {
    ElMessage.warning('最多上传 10 个办理凭证')
    return
  }
  const item: UploadItem = { key: uploadKey(), id: 0, name: raw.name, mimeType: raw.type, size: raw.size, status: 'uploading', raw }
  submitDialog.uploads.push(item)
  await executeUpload(item)
}

async function executeUpload(item: UploadItem) {
  item.status = 'uploading'
  try {
    const response: any = await fileInfoApi.upload(item.raw, undefined, { silentError: true })
    const uploaded = response?.data ?? response
    if (!uploaded?.id) throw new Error('文件编号为空')
    item.id = Number(uploaded.id)
    item.name = uploaded.originalName || uploaded.name || item.name
    item.mimeType = uploaded.mimeType || item.mimeType
    item.size = Number(uploaded.fileSize || item.size || 0)
    item.status = 'success'
  } catch (error: any) {
    item.status = 'error'
    ElMessage.error(error?.message || `${item.name} 上传失败`)
  }
}

function retryUpload(item: UploadItem) {
  executeUpload(item)
}

function removeUpload(key: string) {
  submitDialog.uploads = submitDialog.uploads.filter(item => item.key !== key)
}

async function submitResult() {
  if (!submitDialog.resultDesc.trim()) return ElMessage.warning('请填写办理结果')
  if (submitDialog.uploads.some(item => item.status === 'uploading')) return ElMessage.warning('请等待凭证上传完成')
  const attachments = submitDialog.uploads.filter(item => item.status === 'success' && item.id > 0).map(({ id, name, mimeType, size }) => ({ id, name, mimeType, size }))
  if (!attachments.length) return ElMessage.warning('请至少上传一份办理凭证')
  submitDialog.loading = true
  try {
    await orderReviewApi.submitComplete(submitDialog.reviewId, { resultDesc: submitDialog.resultDesc.trim(), attachments, remark: submitDialog.remark.trim() || undefined })
    ElMessage.success('办理结果已提交，等待验收')
    submitDialog.visible = false
    await afterMutation(submitDialog.reviewId)
  } finally {
    submitDialog.loading = false
  }
}

async function submitConfirm() {
  if (!confirmDialog.pass && !confirmDialog.opinion.trim()) return ElMessage.warning('驳回必须填写原因')
  confirmDialog.loading = true
  try {
    await orderReviewApi.confirmComplete(confirmDialog.reviewId, { pass: confirmDialog.pass, opinion: confirmDialog.opinion.trim() || undefined })
    ElMessage.success(confirmDialog.pass ? '审单已验收完成' : '办理结果已驳回')
    confirmDialog.visible = false
    await afterMutation(confirmDialog.reviewId)
  } finally {
    confirmDialog.loading = false
  }
}

async function afterMutation(reviewId: number) {
  await refreshAll()
  if (detailVisible.value && Number(detail.value?.review?.id) === Number(reviewId)) {
    detail.value = await orderReviewApi.detail(reviewId)
  }
}

async function downloadReviewAttachment(file: ReviewAttachment) {
  const reviewId = Number(detail.value?.review?.id || 0)
  if (!reviewId || !file.id) return
  try {
    const blob = (await orderReviewApi.downloadAttachment(reviewId, file.id)) as Blob
    if (blob.type.includes('json')) {
      const payload = JSON.parse(await blob.text())
      throw new Error(payload?.message || '无权下载该凭证')
    }
    downloadBlob(blob, file.name || `review_attachment_${file.id}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '凭证下载失败')
  }
}

function effectiveRoles() {
  const result = new Set<string>()
  for (const role of userStore.roles || []) {
    result.add(role)
    const separator = role.indexOf('__')
    if (separator > 0) result.add(role.slice(0, separator))
  }
  return result
}

function hasRole(...keys: string[]) {
  if (currentUserId.value === 1) return true
  const roles = effectiveRoles()
  return keys.some(key => roles.has(key))
}

function canContract(row: OrderReview) {
  return row.reviewStatus === 'CONTRACT_PENDING'
    && hasRole('admin', 'super_admin', 'sys_admin', 'boss', 'manager', 'dept_manager')
}

function canPayment(row: OrderReview) {
  return row.reviewStatus === 'PAYMENT_PENDING'
    && hasRole('admin', 'super_admin', 'sys_admin', 'boss', 'finance', 'finance_hq')
}

function canAssign(row: OrderReview) {
  return ['ACCEPT_PENDING', 'ACCEPT_REJECTED'].includes(row.reviewStatus)
    && hasRole('admin', 'super_admin', 'sys_admin', 'boss', 'manager', 'dept_manager')
}

function canAccept(row: OrderReview) {
  return row.reviewStatus === 'ACCEPT_PENDING' && Number(row.handlerUserId) === currentUserId.value
}

function canSubmit(row: OrderReview) {
  return ['PROCESSING', 'COMPLETE_REJECTED'].includes(row.reviewStatus) && Number(row.handlerUserId) === currentUserId.value
}

function canConfirm(row: OrderReview) {
  return row.reviewStatus === 'COMPLETE_PENDING' && (Number(row.salesUserId) === currentUserId.value
    || hasRole('admin', 'super_admin', 'sys_admin', 'boss', 'manager', 'dept_manager'))
}

function statusMeta(status?: string): { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger'; avatar: string } {
  const map: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger'; avatar: string }> = {
    CONTRACT_PENDING: { label: '待合同审理', type: 'warning', avatar: 'warning' },
    CONTRACT_REJECTED: { label: '合同驳回', type: 'danger', avatar: 'danger' },
    PAYMENT_PENDING: { label: '待到款确认', type: 'warning', avatar: 'warning' },
    PAYMENT_REJECTED: { label: '到款驳回', type: 'danger', avatar: 'danger' },
    ACCEPT_PENDING: { label: '待接收', type: 'warning', avatar: 'warning' },
    ACCEPT_REJECTED: { label: '资料退回', type: 'danger', avatar: 'danger' },
    PROCESSING: { label: '办理中', type: 'primary', avatar: '' },
    COMPLETE_PENDING: { label: '待验收', type: 'warning', avatar: 'warning' },
    COMPLETE_REJECTED: { label: '验收驳回', type: 'danger', avatar: 'danger' },
    COMPLETED: { label: '已完成', type: 'success', avatar: 'success' },
    VOIDED: { label: '已作废', type: 'info', avatar: '' }
  }
  return map[status || ''] || { label: status || '未知状态', type: 'info', avatar: '' }
}

function displayStatus(row: OrderReview) {
  if (isOverdue(row)) return '已逾期'
  if (row.reviewStatus === 'ACCEPT_PENDING' && !row.handlerUserId) return '待分配'
  return statusMeta(row.reviewStatus).label
}

function isOverdue(row?: OrderReview | null) {
  if (!row?.deadline || ['COMPLETED', 'VOIDED'].includes(row.reviewStatus)) return false
  return new Date(row.deadline).getTime() < Date.now()
}

function stepActive(row: OrderReview) {
  if (row.reviewStatus === 'COMPLETED') return 5
  if (row.reviewStatus === 'COMPLETE_PENDING') return 4
  if (['PROCESSING', 'COMPLETE_REJECTED'].includes(row.reviewStatus)) return 3
  if (row.reviewStatus === 'ACCEPT_PENDING' && row.handlerUserId) return 2
  return 1
}

function parseAttachments(value?: string): ReviewAttachment[] {
  if (!value) return []
  try {
    const list = JSON.parse(value)
    return Array.isArray(list) ? list.filter(item => Number(item?.id) > 0) : []
  } catch {
    return []
  }
}

function nodeLabel(node?: string) {
  return ({ CONTRACT: '合同审理', PAYMENT: '财务确认', ACCEPT: '办事接收', PROCESS: '办理中', COMPLETE: '办理验收' } as Record<string, string>)[node || ''] || node || '—'
}

function businessLabel(value?: string) {
  return ({ bookkeeping: '代理记账', registration: '公司注册', tax_planning: '税务筹划', qualification: '资质代办', audit: '审计', cancellation: '注销', order: '业务提单' } as Record<string, string>)[value || ''] || value || '业务提单'
}

function materialsLabel(value: any) {
  if (Number(value) === 1) return '资料齐全，已接收'
  if (Number(value) === 0) return '资料不齐，已退回'
  return '待确认'
}

function actionLabel(action?: string, result?: string) {
  const key = `${action || ''}:${result || ''}`
  return ({ 'assign:assigned': '已分配', 'accept:accepted': '已接收', 'reject:rejected': '已驳回', 'submit:pending_confirm': '已提交结果', 'confirm:completed': '验收通过', 'approve:pass': '审核通过', 'confirm:pass': '确认通过' } as Record<string, string>)[key] || result || action || '状态更新'
}

function isPositiveRecord(result?: string) {
  return ['pass', 'accepted', 'assigned', 'pending_confirm', 'completed'].includes(result || '')
}

function employeeLabel(item: EmployeeOption) {
  return [item.name, item.deptName, item.postName].filter(Boolean).join(' · ')
}

function money(value: any) {
  return Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function dateTime(value: any) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16)
}

function dateOnly(value: any) {
  return value ? String(value).slice(0, 10) : ''
}

function toIsoLocal(value: string) {
  return String(value).replace(' ', 'T').slice(0, 19)
}

function fileSize(value?: number) {
  const size = Number(value || 0)
  if (!size) return ''
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function uploadKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}
</script>

<style scoped lang="scss">
.review-center {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 104px);
  min-height: 620px;
  padding: 16px;
  overflow: hidden;
  color: var(--text-primary);
  background: var(--bg-page);
  font-size: 14px;
}

.page-head {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.page-head h1 {
  margin: 0;
  font-size: 20px;
  line-height: 28px;
  letter-spacing: 0;
}

.page-head p {
  margin: 3px 0 0;
  color: var(--text-muted);
  font-size: 14px;
}

.status-strip {
  display: flex;
  flex: 0 0 auto;
  gap: 2px;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.status-strip button {
  display: flex;
  flex: 1 0 112px;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  min-height: 52px;
  padding: 0 14px;
  border: 0;
  border-right: 1px solid var(--border-soft);
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
}

.status-strip button:last-child { border-right: 0; }
.status-strip button:hover { background: #f7f9fc; }
.status-strip button.active { box-shadow: inset 0 -3px 0 var(--brand-primary); color: var(--brand-primary); background: #f2f7ff; }
.status-strip b { font-size: 18px; font-variant-numeric: tabular-nums; }

.toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 10px;
}

.toolbar .el-input { width: min(440px, 48vw); }
.result-count { margin-left: auto; color: var(--text-muted); }

.work-surface {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.desktop-table { flex: 1; min-height: 0; }
.desktop-table :deep(.el-table__cell) { font-size: 14px; }
.desktop-table :deep(.el-table__row) { height: 68px; }

.primary-cell {
  display: flex;
  width: 100%;
  min-width: 0;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.primary-cell strong { color: var(--brand-primary); font-size: 15px; }
.primary-cell span { overflow: hidden; max-width: 100%; text-overflow: ellipsis; white-space: nowrap; font-weight: 650; }
.primary-cell small, .money-cell span { color: var(--text-muted); font-size: 12px; }
.money-cell { display: flex; flex-direction: column; gap: 3px; }
.money-cell strong { font-size: 15px; font-variant-numeric: tabular-nums; }
.muted { color: var(--text-muted); }
.deadline { display: flex; flex-direction: column; gap: 3px; color: var(--text-secondary); }
.deadline small, .danger, .deadline.overdue { color: #d92d20; }
.row-actions { display: flex; align-items: center; justify-content: flex-end; white-space: nowrap; }

.pager {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  padding: 10px 12px;
  border-top: 1px solid var(--border-soft);
}

.mobile-list { display: none; }
.process-line { margin-bottom: 16px; overflow-x: auto; }
.process-line :deep(.el-steps--simple) { min-width: 620px; padding: 12px; }

.node-section { padding: 14px 0; border-top: 1px solid var(--border-soft); }
.node-section:first-of-type { border-top: 0; }
.node-section h3 { margin: 0 0 10px; font-size: 15px; letter-spacing: 0; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
.detail-grid > div { min-width: 0; }
.detail-grid .wide { grid-column: 1 / -1; }
.detail-grid span { display: block; margin-bottom: 4px; color: var(--text-muted); font-size: 12px; }
.detail-grid b { overflow-wrap: anywhere; font-weight: 600; line-height: 1.55; }

.attachment-list { display: grid; gap: 8px; margin-top: 12px; }
.attachment-list button {
  display: grid;
  grid-template-columns: 20px minmax(0, 1fr) auto 20px;
  gap: 8px;
  align-items: center;
  padding: 9px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 6px;
  background: #fbfcfd;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
}
.attachment-list span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.attachment-list small, .empty-copy { color: var(--text-muted); }
.empty-copy { margin: 10px 0 0; }

.proof-upload { width: 100%; }
.proof-upload :deep(.el-upload), .proof-upload :deep(.el-upload-dragger) { width: 100%; }
.proof-upload :deep(.el-upload-dragger) { min-height: 130px; border-radius: 8px; }
.proof-upload :deep(.el-icon--upload) { margin-bottom: 8px; font-size: 42px; }

.upload-list { display: grid; width: 100%; gap: 7px; margin-top: 10px; }
.upload-row { display: grid; grid-template-columns: 20px minmax(0, 1fr) auto auto auto; gap: 8px; align-items: center; min-height: 38px; padding: 5px 8px; border: 1px solid var(--border-soft); border-radius: 6px; }
.upload-row span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.upload-row small { color: var(--text-muted); }
.upload-error { color: #d92d20; }

@media (max-width: 900px) {
  :global(.business-detail-drawer) { width: 100% !important; }
}

@media (max-width: 760px) {
  .review-center { height: auto; min-height: calc(100vh - 64px); padding: 12px; overflow: visible; }
  .page-head h1 { font-size: 18px; }
  .page-head p { max-width: 260px; }
  .toolbar { flex-wrap: wrap; }
  .toolbar .el-input { width: calc(100% - 78px); }
  .result-count { width: 100%; margin-left: 0; }
  .work-surface { overflow: visible; }
  .desktop-table { display: none; }
  .mobile-list { display: grid; gap: 10px; padding: 10px; }
  .mobile-row { padding: 12px; border: 1px solid var(--border-soft); border-radius: 8px; background: #fff; }
  .mobile-row-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .mobile-row-head strong { min-width: 0; font-size: 15px; overflow-wrap: anywhere; }
  .mobile-row p { margin: 6px 0 10px; color: var(--text-muted); }
  .mobile-meta { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; font-size: 12px; }
  .mobile-meta span { overflow-wrap: anywhere; }
  .mobile-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
  .pager { justify-content: center; overflow-x: auto; }
  .pager :deep(.el-pagination__sizes), .pager :deep(.el-pagination__total) { display: none; }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-grid .wide { grid-column: auto; }
}
</style>

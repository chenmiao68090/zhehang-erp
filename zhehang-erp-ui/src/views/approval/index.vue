<template>
  <!-- 发起申请:仅"分类发起入口 + 发起弹窗"(审批记录/待办/详情统一在审批中心三栏,已不在此) -->
  <div class="approval-initiate">
    <div class="ac-header">
      <div class="ac-header__title">发起申请</div>
      <div class="ac-header__actions">
        <el-input
          v-model="keyword"
          placeholder="搜索审批类型 / 标题"
          clearable
          class="ac-search"
          :prefix-icon="Search"
        />
      </div>
    </div>

    <!-- ============ 分类发起入口卡片 ============ -->
    <div class="ac-manage">
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
              :style="{ '--c': group.color }"
              @click="handleCardClick(item)"
            >
              <div class="ac-card__icon">
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

    <!-- ============ 发起流程弹窗（接真实流程定义 + 动态表单） ============ -->
    <el-dialog
      v-model="startVisible"
      width="780px"
      top="5vh"
      class="ac-flow-dialog ac-start-dialog"
      :close-on-click-modal="false"
    >
      <template #header>
        <div class="ac-dialog-heading">
          <span class="ac-dialog-kicker">{{ resubmitInstanceId ? '修改并重新提交' : '发起审批' }}</span>
          <strong>{{ selectedProcess?.name || '审批' }}</strong>
        </div>
      </template>
      <el-form :model="formValues" label-position="top" class="ac-start-form">
        <section class="ac-form-section">
          <div class="ac-section-head">
            <span>基本信息</span>
            <em>{{ selectedProcess?.category || 'workflow' }}</em>
          </div>
          <el-form-item label="审批标题" required>
            <el-input v-model="processTitle" placeholder="例如: 6月客户拜访交通费报销" />
          </el-form-item>
        </section>

        <el-alert
          v-if="selectedProcess?.processKey === 'leave' && formValues['leaveType'] && balanceOf(formValues['leaveType'])"
          :title="`${formValues['leaveType']}余额:剩余 ${balanceOf(formValues['leaveType']).remaining} 天(总 ${balanceOf(formValues['leaveType']).total} · 已用 ${balanceOf(formValues['leaveType']).used})`"
          :type="balanceOf(formValues['leaveType']).remaining > 0 ? 'info' : 'warning'"
          :closable="false"
          show-icon
          class="ac-balance-alert"
        />

        <section v-if="isExpenseProcess" class="ac-form-section ac-expense-section">
          <div class="ac-section-head">
            <span>费用明细</span>
            <em>同类型自动汇总 · {{ expenseDetails.length }} 笔</em>
          </div>

          <div class="expense-summary">
            <div class="expense-total-card">
              <span>费用汇总</span>
              <strong>¥{{ moneyText(expenseTotal) }}</strong>
              <small>提交时自动写入报销金额</small>
            </div>
            <div class="expense-type-list">
              <span v-for="item in expenseSummary" :key="item.type" class="expense-type-pill">
                {{ item.type }} ¥{{ moneyText(item.amount) }}
              </span>
              <span v-if="!expenseSummary.length" class="expense-type-empty">填写明细后自动按类型归集</span>
            </div>
          </div>

          <div class="expense-lines">
            <div v-for="(detail, index) in expenseDetails" :key="detail.id" class="expense-line">
              <div class="expense-line__head">
                <span>明细 {{ index + 1 }}</span>
                <div>
                  <el-button text type="primary" :icon="CopyDocument" @click="copyExpenseDetail(index)">复制</el-button>
                  <el-button
                    text
                    type="danger"
                    :icon="Delete"
                    :disabled="expenseDetails.length === 1"
                    @click="removeExpenseDetail(index)"
                  >删除</el-button>
                </div>
              </div>
              <div class="expense-grid">
                <el-form-item label="费用类型" required>
                  <el-select v-model="detail.type" placeholder="请选择类型">
                    <el-option v-for="type in EXPENSE_TYPES" :key="type" :label="type" :value="type" />
                  </el-select>
                </el-form-item>
                <el-form-item label="发生日期" required>
                  <el-date-picker v-model="detail.expenseDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" />
                </el-form-item>
                <el-form-item label="金额" required>
                  <el-input-number v-model="detail.amount" :min="0" :precision="2" :controls="false" placeholder="0.00" />
                </el-form-item>
                <el-form-item label="内容/用途" required class="expense-grid__wide">
                  <el-input v-model="detail.content" placeholder="例如: 拜访客户往返打车费" />
                </el-form-item>
                <el-form-item label="备注" class="expense-grid__wide">
                  <el-input v-model="detail.remark" placeholder="可填写客户名、项目名、票据说明等" />
                </el-form-item>
              </div>
            </div>
          </div>

          <el-button class="expense-add-btn" :icon="Plus" @click="addExpenseDetail">添加明细</el-button>
        </section>

        <section v-else class="ac-form-section">
          <div class="ac-section-head">
            <span>申请内容</span>
            <em>按流程表单填写</em>
          </div>
          <template v-for="field in visibleFormFields" :key="field.field">
            <!-- 说明文字:整段提示,只展示、不进表单值 -->
            <el-alert
              v-if="field.type === 'description'"
              :title="field.label"
              type="info"
              :closable="false"
              show-icon
              style="margin-bottom: 14px"
            />
            <!-- 请假流程:开始/结束时间改为「日期 + 上午/下午」半天粒度 -->
            <el-form-item
              v-else-if="isLeaveProcess && (field.field === 'startDate' || field.field === 'endDate')"
              :label="field.label"
              :required="field.required"
            >
              <div class="ac-halfday">
                <el-date-picker
                  v-model="leaveHalf[field.field === 'startDate' ? 'startDay' : 'endDay']"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择日期"
                  class="ac-halfday__date"
                />
                <el-select
                  v-model="leaveHalf[field.field === 'startDate' ? 'startAmpm' : 'endAmpm']"
                  placeholder="上午/下午"
                  class="ac-halfday__ampm"
                >
                  <el-option label="上午" value="上午" />
                  <el-option label="下午" value="下午" />
                </el-select>
              </div>
            </el-form-item>
            <!-- 请假流程:请假天数按半天粒度自动计算,只读展示 -->
            <el-form-item
              v-else-if="isLeaveProcess && field.field === 'days'"
              :label="field.label"
              :required="field.required"
            >
              <el-input v-model="formValues[field.field]" readonly placeholder="按开始/结束自动计算">
                <template #suffix>天</template>
              </el-input>
              <span class="ac-halfday__hint">按开始/结束(半天)自动计算,最小 0.5 天</span>
            </el-form-item>
            <el-form-item v-else :label="field.label" :required="field.required">
              <el-input v-if="field.type === 'text'" v-model="formValues[field.field]" />
              <el-input v-else-if="field.type === 'textarea'" v-model="formValues[field.field]" type="textarea" :rows="3" />
              <el-input-number v-else-if="field.type === 'number'" v-model="formValues[field.field]" :min="0" style="width: 100%" />
              <el-input-number v-else-if="field.type === 'amount'" v-model="formValues[field.field]" :min="0" :precision="2" :step="100" controls-position="right" placeholder="0.00" style="width: 100%" />
              <el-date-picker v-else-if="field.type === 'date'" v-model="formValues[field.field]" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" style="width: 100%" />
              <el-date-picker v-else-if="field.type === 'datetime'" v-model="formValues[field.field]" type="datetime" value-format="YYYY-MM-DD HH:mm" placeholder="请选择时间" style="width: 100%" />
              <el-date-picker v-else-if="field.type === 'daterange'" v-model="formValues[field.field]" type="daterange" range-separator="~" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" style="width: 100%" />
              <el-select v-else-if="field.type === 'select'" v-model="formValues[field.field]" style="width: 100%" placeholder="请选择">
                <el-option v-for="opt in (field.options || [])" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <el-select v-else-if="field.type === 'multiselect'" v-model="formValues[field.field]" multiple filterable collapse-tags style="width: 100%" placeholder="可多选">
                <el-option v-for="opt in (field.options || [])" :key="opt" :label="opt" :value="opt" />
              </el-select>
              <!-- 附件控件:复用通用附件上传/预览(存入 __attachments,与审批中心提交端一致) -->
              <div v-else-if="field.type === 'attachment'" class="ac-attach">
                <div class="ac-attach-list" v-if="attachments.length">
                  <div class="ac-attach-item" v-for="(f, i) in attachments" :key="i">
                    <el-image v-if="isImgAttach(f)" :src="f.url" :preview-src-list="[f.url]" fit="cover" class="ac-attach-thumb" preview-teleported hide-on-click-modal @click.stop />
                    <el-icon v-else><Document /></el-icon>
                    <span class="ac-attach-name">{{ f.name }}</span>
                    <el-icon class="ac-attach-del" @click="attachments.splice(i, 1)"><Close /></el-icon>
                  </div>
                </div>
                <div class="ac-attach-actions">
                  <el-button :icon="Upload" :loading="attachUploading" @click="triggerAttach">上传附件</el-button>
                  <span class="ac-attach-tip">支持多个文件，单个 ≤ 10MB；也可直接 Ctrl+V 粘贴截图</span>
                </div>
              </div>
              <el-input v-else v-model="formValues[field.field]" />
            </el-form-item>
          </template>
        </section>

        <section v-if="selectedProcess?.processConfig" class="ac-form-section">
          <div class="ac-section-head">
            <span>审批流程</span>
            <em>提交后按此流程流转</em>
          </div>
          <ApprovalTrack
            :histories="[]"
            :process-config="selectedProcess?.processConfig || ''"
            initiator-name="发起人"
            preview
            :show-history="false"
          />
        </section>

        <!-- 附件上传(通用):当流程表单里未显式设计"附件"字段时,提供通用附件区;
             若表单已含附件字段(field.type==='attachment'),则由该字段负责上传,这里不再重复展示,避免两个上传入口。 -->
        <section v-if="!hasAttachmentField" class="ac-form-section">
          <div class="ac-section-head">
            <span>附件</span>
            <em>发票、截图、行程单等</em>
          </div>
          <div class="ac-attach">
            <div class="ac-attach-list" v-if="attachments.length">
              <div class="ac-attach-item" v-for="(f, i) in attachments" :key="i">
                <el-image v-if="isImgAttach(f)" :src="f.url" :preview-src-list="[f.url]" fit="cover" class="ac-attach-thumb" preview-teleported hide-on-click-modal @click.stop />
                <el-icon v-else><Document /></el-icon>
                <span class="ac-attach-name">{{ f.name }}</span>
                <el-icon class="ac-attach-del" @click="attachments.splice(i, 1)"><Close /></el-icon>
              </div>
            </div>
            <div class="ac-attach-actions">
              <el-button :icon="Upload" :loading="attachUploading" @click="triggerAttach">上传附件</el-button>
              <span class="ac-attach-tip">支持多个文件，单个 ≤ 10MB；也可直接 Ctrl+V 粘贴截图</span>
            </div>
          </div>
        </section>
        <!-- 附件文件选择器(通用区与"附件"字段共用同一隐藏 input,始终挂载) -->
        <input ref="attachInput" type="file" multiple style="display: none" @change="onAttachPick" />
      </el-form>
      <template #footer>
        <el-button size="large" plain @click="startVisible = false">取消</el-button>
        <el-button type="primary" size="large" :loading="submitting" @click="submitStart" style="padding-left: 30px; padding-right: 30px; font-weight: 600;">提交审批</el-button>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Plus, Calendar, Suitcase, Position, MoonNight, AlarmClock,
  Money, Wallet, Coin, CreditCard, RefreshLeft, WalletFilled, Sell, Tickets,
  Stamp, TakeawayBox, ShoppingCart, OfficeBuilding, Document, Share, Present, Memo,
  CirclePlus, CircleCheck, Switch, SwitchButton, Close, Upload, CopyDocument, Delete, Top
} from '@element-plus/icons-vue'
import ApprovalTrack from '@/components/workflow/ApprovalTrack.vue'
import { approvalCenterApi, type ProcessDef, type TaskItem, type InstanceItem, type WfColleague } from '@/api/approval'
import { instanceApi, taskApi } from '@/api/workflow'
import { fileInfoApi } from '@/api/file'
import { downloadFileById, objectUrlForFile } from '@/utils/download'
import { leaveBalanceApi } from '@/api/hrm'
import { hasImpersonationSessionMarker } from '@/utils/impersonation-session'

// 请假表单:当前用户各类带薪假期额度
const myBalances = ref<any[]>([])
async function loadMyBalances () {
  try { const res: any = await leaveBalanceApi.my(); myBalances.value = res.data || [] } catch { myBalances.value = [] }
}
function balanceOf (leaveType: string) {
  const b = myBalances.value.find((x: any) => x.leaveType === leaveType)
  if (!b) return null
  const total = Number(b.totalDays ?? 0)
  const used = Number(b.usedDays ?? 0)
  return { total, used, remaining: Math.max(0, total - used) }
}

// ===== 审批附件(真文件走 file 模块;form_data 只存文件ID数组,禁 base64 进 JSON 列) =====
const ATTACH_LIMIT_MB = 10
/** 已上传附件:fileId 为 file_info 主键;url 仅图片本地预览用(objectURL) */
interface UploadedAttachment { fileId: number; name: string; url?: string }
const attachments = ref<UploadedAttachment[]>([])
const attachInput = ref<HTMLInputElement>()
const attachUploading = ref(false)
function triggerAttach () { attachInput.value?.click() }

async function uploadAttachFile (f: File) {
  if (f.size > ATTACH_LIMIT_MB * 1024 * 1024) {
    ElMessage.warning(`「${f.name}」超过 ${ATTACH_LIMIT_MB}MB,已跳过`)
    return
  }
  attachUploading.value = true
  try {
    const res: any = await fileInfoApi.upload(f)
    const info = (res && typeof res === 'object' && 'data' in res) ? res.data : res
    if (!info || !info.id) throw new Error('上传返回异常')
    const url = f.type.startsWith('image/') ? URL.createObjectURL(f) : undefined
    attachments.value.push({ fileId: Number(info.id), name: f.name, url })
  } catch (e: any) {
    ElMessage.error(`「${f.name}」上传失败` + (e?.message ? ':' + e.message : ''))
  }
  attachUploading.value = false
}

async function onAttachPick (e: Event) {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  for (const f of files) {
    await uploadAttachFile(f)
  }
  input.value = ''
}
/** 发起弹窗打开时,支持 Ctrl+V 直接粘贴截图为附件(即传即用) */
async function onApprovalPaste (e: ClipboardEvent) {
  if (!startVisible.value) return
  const items = e.clipboardData?.items
  if (!items) return
  for (const it of Array.from(items)) {
    if (it.type && it.type.startsWith('image/')) {
      const blob = it.getAsFile()
      if (!blob) continue
      const named = new File([blob], `粘贴图片_${attachments.value.length + 1}.png`, { type: blob.type })
      await uploadAttachFile(named)
    }
  }
}
/** 附件是否可图片预览:只有拿得到本地 objectURL(blob:)或老单内嵌 data:image 的才渲染缩略图 */
function isImgAttach (f: { name: string; url?: string }) {
  const u = f?.url || ''
  return u.startsWith('blob:') || /^data:image\//i.test(u)
}
/** 老单兼容:从表单数据里取内嵌附件数组(V154 前的 base64 存法,只读展示) */
function attachmentsOf (formData: any): { name: string; url: string }[] {
  const a = formData && formData.__attachments
  return Array.isArray(a) ? a : []
}
function downloadAttach (f: { name: string; url?: string }) {
  if (!f.url) return
  const a = document.createElement('a')
  a.href = f.url
  a.download = f.name || 'attachment'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// ---------------- 卡片目录(后端驱动:wf_process_def 的 group_name/icon/sort) ----------------
// 目录不再前端写死:已发布流程带着分组/图标/排序从 /workflow/process/list 来,
// 管理员在审批设置里新建并发布的流程自动出现在对应分组,不存在"卡片配错流程"。
interface CardItem {
  key: string
  name: string
  icon: any
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
  { value: 'hr', label: '人事' },
  { value: 'biz', label: '业务' },
  { value: 'other', label: '其他' }
]

/** 分组视觉配置(分组本身由后端 group_name 决定) */
const GROUP_META: Record<string, { label: string; color: string; soft: string }> = {
  attendance: { label: '假勤', color: '#3370ff', soft: 'rgba(51,112,255,0.1)' },
  finance: { label: '财务', color: '#409EFF', soft: 'rgba(64,158,255,0.1)' },
  admin: { label: '行政', color: '#67C23A', soft: 'rgba(103,194,58,0.1)' },
  hr: { label: '人事', color: '#909399', soft: 'rgba(144,147,153,0.12)' },
  biz: { label: '业务', color: '#E6A23C', soft: 'rgba(230,162,60,0.1)' },
  other: { label: '其他', color: '#606266', soft: 'rgba(96,98,102,0.1)' }
}
const GROUP_ORDER = ['attendance', 'finance', 'admin', 'hr', 'biz', 'other']

/** 后端 icon 名 → 图标组件(后端存的是 Element Plus 图标名) */
const ICON_MAP: Record<string, any> = {
  Calendar, Suitcase, Position, MoonNight, AlarmClock,
  Money, Wallet, Coin, CreditCard, RefreshLeft, WalletFilled, Sell, Tickets,
  Stamp, TakeawayBox, ShoppingCart, OfficeBuilding, Document, Share, Present, Memo,
  CirclePlus, CircleCheck, Top, Switch, SwitchButton
}
function iconOf (name?: string): any {
  return (name && ICON_MAP[name]) || Memo
}

// 发起成功后通知父页(审批中心)刷新角标/我发起列表
const emit = defineEmits<{ submitted: [] }>()

// ---------------- 状态 ----------------
const keyword = ref('')
const activeCat = ref('all')

// 流程定义（已发布）匹配
const processLoading = ref(false)
const publishedProcesses = ref<ProcessDef[]>([])

// 目录=已发布流程按后端 group_name 分组、sort 排序、icon 名转组件;关键字过滤命中流程名/key
const visibleGroups = computed<CardGroup[]>(() => {
  const kw = keyword.value.trim().toLowerCase()
  const byGroup = new Map<string, CardItem[]>()
  publishedProcesses.value
    .filter(p => !kw || (p.name || '').toLowerCase().includes(kw) || (p.processKey || '').toLowerCase().includes(kw))
    .forEach(p => {
      const g = GROUP_META[p.groupName || ''] ? (p.groupName as string) : 'other'
      const item: CardItem = {
        key: p.processKey || ('proc_' + p.id),
        name: p.name || p.processKey || ('流程' + p.id),
        icon: iconOf(p.icon),
        resolved: true,
        process: p
      }
      byGroup.set(g, [...(byGroup.get(g) || []), item])
    })
  return GROUP_ORDER
    .filter(g => activeCat.value === 'all' || g === activeCat.value)
    .filter(g => (byGroup.get(g) || []).length > 0)
    .map(g => {
      const items = (byGroup.get(g) || []).sort((a, b) =>
        (a.process?.sort ?? 99) - (b.process?.sort ?? 99) || (a.process?.id ?? 0) - (b.process?.id ?? 0))
      return { value: g, ...GROUP_META[g], items }
    })
})

async function loadProcesses () {
  processLoading.value = true
  try {
    publishedProcesses.value = await approvalCenterApi.publishedProcesses()
  } catch { publishedProcesses.value = [] }
  processLoading.value = false
}

// ---------------- 发起流程 ----------------
const startVisible = ref(false)
const submitting = ref(false)
const selectedProcess = ref<ProcessDef | null>(null)
const processTitle = ref('')
const formFields = ref<any[]>([])
const formValues = reactive<Record<string, any>>({})
// 当前流程表单是否含"附件"字段(含则由该字段负责上传,隐藏通用附件区)
const hasAttachmentField = computed(() => formFields.value.some((f: any) => f.type === 'attachment'))
// 请假流程:startAmpm/endAmpm 由"日期+上午/下午"组合控件负责录入,不再单独渲染
const visibleFormFields = computed(() => isLeaveProcess.value
  ? formFields.value.filter((f: any) => f.field !== 'startAmpm' && f.field !== 'endAmpm')
  : formFields.value)

interface ExpenseDetail {
  id: string
  type: string
  content: string
  expenseDate: string
  amount: number | null
  remark: string
}

const EXPENSE_TYPES = ['交通费', '餐饮费', '住宿费', '办公用品', '通讯费', '招待费', '培训费', '市场费', '其他']
const expenseDetails = ref<ExpenseDetail[]>([])

const isExpenseProcess = computed(() => {
  const key = (selectedProcess.value?.processKey || '').toLowerCase()
  const name = selectedProcess.value?.name || ''
  return key === 'expense' || key === 'reimburse' || name.includes('报销')
})

// 请假流程:开始/结束时间改用「日期 + 上午/下午」半天粒度录入
const isLeaveProcess = computed(() => selectedProcess.value?.processKey === 'leave')
const leaveHalf = reactive<{ startDay: string; startAmpm: string; endDay: string; endAmpm: string }>({
  startDay: '', startAmpm: '上午', endDay: '', endAmpm: '下午'
})

const expenseTotal = computed(() => expenseDetails.value.reduce((sum, item) => sum + moneyNumber(item.amount), 0))
const expenseSummary = computed(() => summarizeExpenseDetails(expenseDetails.value))

function makeDetailId () {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function createExpenseDetail (seed?: Partial<ExpenseDetail>): ExpenseDetail {
  return {
    id: makeDetailId(),
    type: seed?.type || '',
    content: seed?.content || '',
    expenseDate: seed?.expenseDate || '',
    amount: seed?.amount ?? null,
    remark: seed?.remark || ''
  }
}

function resetExpenseDetails () {
  expenseDetails.value = [createExpenseDetail()]
}

function addExpenseDetail () {
  expenseDetails.value.push(createExpenseDetail())
}

function copyExpenseDetail (index: number) {
  const item = expenseDetails.value[index]
  if (!item) return
  expenseDetails.value.splice(index + 1, 0, createExpenseDetail(item))
}

function removeExpenseDetail (index: number) {
  if (expenseDetails.value.length <= 1) {
    ElMessage.info('至少保留一条费用明细')
    return
  }
  expenseDetails.value.splice(index, 1)
}

function moneyNumber (value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function moneyText (value: unknown) {
  return moneyNumber(value).toFixed(2)
}

function summarizeExpenseDetails (details: ExpenseDetail[]) {
  const map = new Map<string, number>()
  details.forEach(item => {
    const type = item.type || '未分类'
    const amount = moneyNumber(item.amount)
    if (amount > 0) map.set(type, (map.get(type) || 0) + amount)
  })
  return Array.from(map.entries()).map(([type, amount]) => ({ type, amount: Number(amount.toFixed(2)) }))
}

function normalizedExpenseDetails () {
  return expenseDetails.value.map((item, index) => ({
    index: index + 1,
    type: item.type,
    content: item.content.trim(),
    expenseDate: item.expenseDate,
    amount: Number(moneyNumber(item.amount).toFixed(2)),
    remark: item.remark.trim()
  }))
}

function validateExpenseDetails () {
  for (let i = 0; i < expenseDetails.value.length; i++) {
    const item = expenseDetails.value[i]
    if (!item.type) {
      ElMessage.warning(`请选择第 ${i + 1} 条费用类型`)
      return false
    }
    if (!item.expenseDate) {
      ElMessage.warning(`请选择第 ${i + 1} 条发生日期`)
      return false
    }
    if (!item.content.trim()) {
      ElMessage.warning(`请填写第 ${i + 1} 条内容/用途`)
      return false
    }
    if (moneyNumber(item.amount) <= 0) {
      ElMessage.warning(`请填写第 ${i + 1} 条有效金额`)
      return false
    }
  }
  return true
}

function buildExpensePayload () {
  const details = normalizedExpenseDetails()
  const summary = summarizeExpenseDetails(expenseDetails.value)
  const total = Number(expenseTotal.value.toFixed(2))
  return {
    amount: total,
    totalAmount: total,
    expenseType: summary.map(item => item.type).join('、'),
    description: details.map(item => `${item.expenseDate} ${item.type} ${item.content} ¥${moneyText(item.amount)}`).join('\n'),
    detailCount: details.length,
    expenseDetails: details,
    expenseSummary: summary
  }
}

function handleCardClick (item: CardItem) {
  if (!item.resolved || !item.process) {
    ElMessage.info(`「${item.name}」审批流程待接入，请联系管理员在「审批设置」中发布对应流程`)
    return
  }
  openStart(item.process)
}

function openStart (proc: ProcessDef) {
  // 普通发起必须清掉"重新提交"模式(openResubmit 会在调用本函数后再设回)
  resubmitInstanceId.value = null
  selectedProcess.value = proc
  // 请假流程:打开时刷新当前用户的各类假期额度,并重置半天粒度录入
  if (proc.processKey === 'leave') {
    loadMyBalances()
    leaveHalf.startDay = ''; leaveHalf.startAmpm = '上午'
    leaveHalf.endDay = ''; leaveHalf.endAmpm = '下午'
  }
  processTitle.value = ''
  attachments.value = []
  Object.keys(formValues).forEach(k => delete formValues[k])
  try {
    const config = JSON.parse(proc.formConfig || '[]')
    formFields.value = Array.isArray(config) ? config : []
  } catch { formFields.value = [] }
  for (const f of formFields.value) {
    // 附件字段不占用 formValues(文件走通用 attachments -> __attachments),跳过初始化
    if (f.type === 'attachment') continue
    // 数字字段初值用 null(空)而非 0,否则"必填数字"会被默认 0 直接满足,必填形同虚设
    formValues[f.field] = f.type === 'number' ? null : ''
  }
  // 恢复上次未提交的草稿(若有)。代登录标签页不能读取实际管理员的共享草稿。
  if (!hasImpersonationSessionMarker()) {
    try {
      const raw = localStorage.getItem('approval_draft_' + proc.processKey)
      if (raw) {
        const d = JSON.parse(raw)
        if (d && typeof d === 'object') {
          if (d.title) processTitle.value = d.title
          if (d.values && typeof d.values === 'object') Object.assign(formValues, d.values)
          // 请假草稿:恢复日期 + 上午/下午(新口径独立字段优先,老草稿"YYYY-MM-DD 上午"串兼容)
          if (proc.processKey === 'leave') {
            const parsed = parseHalfDay(formValues.startDate)
            if (parsed) { leaveHalf.startDay = parsed.day; leaveHalf.startAmpm = (formValues.startAmpm as string) || parsed.ampm }
            const parsedEnd = parseHalfDay(formValues.endDate)
            if (parsedEnd) { leaveHalf.endDay = parsedEnd.day; leaveHalf.endAmpm = (formValues.endAmpm as string) || parsedEnd.ampm }
          }
          ElMessage.info('已恢复上次未提交的草稿')
        }
      }
    } catch { /* ignore */ }
  }
  if (isExpenseProcess.value) {
    resetExpenseDetails()
  }
  startVisible.value = true
}

// 顶部“新增审批”：优先用第一个可发起流程，否则引导去审批设置
function openStartFromButton () {
  const first = publishedProcesses.value[0]
  if (!first) {
    ElMessage.info('暂无已发布的审批流程，请先在「审批设置」中发布流程')
    return
  }
  openStart(first)
}

// ---------------- 被退回申请:修改并重新提交(复用发起弹窗的动态表单) ----------------
const resubmitInstanceId = ref<number | null>(null)

async function openResubmit (instanceId: number) {
  const inst: any = await approvalCenterApi.detail(instanceId)
  if (!inst) { ElMessage.error('找不到该申请'); return }
  if (inst.status !== 4) { ElMessage.info('该申请不是「待修改」状态,无法重新提交'); return }
  // 表单配置读实例绑定的版本快照(inst.formConfig),流程定义只作兜底
  const def = publishedProcesses.value.find(p => p.id === inst.processDefId)
  const pseudo: any = def
    ? { ...def, formConfig: inst.formConfig || def.formConfig, processConfig: inst.processConfig || def.processConfig }
    : { id: inst.processDefId, processKey: '', name: inst.processName, category: '', formConfig: inst.formConfig || '[]', processConfig: inst.processConfig || '' }
  openStart(pseudo)
  resubmitInstanceId.value = instanceId
  // 预填原标题/表单值(覆盖 openStart 里可能恢复的草稿)
  processTitle.value = inst.title || ''
  try {
    const data = JSON.parse(inst.formData || '{}')
    Object.keys(data).forEach(k => { if (!k.startsWith('__')) formValues[k] = data[k] })
    if (pseudo.processKey === 'leave') {
      const s = parseHalfDay(formValues.startDate)
      if (s) { leaveHalf.startDay = s.day; leaveHalf.startAmpm = (formValues.startAmpm as string) || s.ampm }
      const e = parseHalfDay(formValues.endDate)
      if (e) { leaveHalf.endDay = e.day; leaveHalf.endAmpm = (formValues.endAmpm as string) || e.ampm }
    }
    if (isExpenseProcess.value && Array.isArray(data.expenseDetails) && data.expenseDetails.length) {
      expenseDetails.value = data.expenseDetails.map((d: any) => createExpenseDetail(d))
    }
  } catch { /* 表单数据坏了就让用户重填 */ }
  // 原附件带入(真文件引用)
  attachments.value = (inst.attachments || []).map((a: any) => ({ fileId: a.fileId, name: a.fileName }))
}

async function submitStart () {
  if (!selectedProcess.value) return
  if (!processTitle.value.trim()) {
    ElMessage.warning('请输入审批标题')
    return
  }
  if (isExpenseProcess.value) {
    if (!validateExpenseDetails()) return
  } else {
    // 必填字段预检
    for (const f of formFields.value) {
      if (!f.required) continue
      // 附件字段:校验通用附件区是否已上传文件
      if (f.type === 'attachment') {
        if (!attachments.value.length) {
          ElMessage.warning(`「${f.label}」请至少上传一个附件`)
          return
        }
        continue
      }
      const v = formValues[f.field]
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) {
        ElMessage.warning(`「${f.label}」不能为空`)
        return
      }
    }
  }
  // 带薪假期:本地预检(后端 startProcess 也会强校验并扣减)
  if (selectedProcess.value?.processKey === 'leave') {
    const bal = balanceOf(formValues['leaveType'])
    if (bal) {
      const days = Number(formValues['days'] || 0)
      if (days > bal.remaining + 1e-6) {
        ElMessage.warning(`${formValues['leaveType']}余额不足:剩余 ${bal.remaining} 天,本次申请 ${days} 天`)
        return
      }
    }
  }
  if (attachUploading.value) {
    ElMessage.warning('附件还在上传中,请稍候')
    return
  }
  submitting.value = true
  try {
    const payload: Record<string, any> = isExpenseProcess.value ? buildExpensePayload() : { ...formValues }
    // 附件只带文件ID数组(真文件已在 file 模块),绝不把 base64 塞进表单JSON
    if (attachments.value.length) payload.__attachmentFileIds = attachments.value.map(a => a.fileId)
    if (resubmitInstanceId.value) {
      await instanceApi.resubmit(resubmitInstanceId.value, { title: processTitle.value.trim(), formData: payload })
      ElMessage.success('已重新提交,流程重新开始审批')
      resubmitInstanceId.value = null
    } else {
      await approvalCenterApi.start(selectedProcess.value.processKey, processTitle.value.trim(), payload)
      ElMessage.success('提交成功')
    }
    try {
      if (!hasImpersonationSessionMarker() && selectedProcess.value) {
        localStorage.removeItem('approval_draft_' + selectedProcess.value.processKey)
      }
    } catch { /* ignore */ }
    startVisible.value = false
    // 通知父页(审批中心)刷新角标/我发起列表
    emit('submitted')
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  }
  submitting.value = false
}


onMounted(async () => {
  await loadProcesses()
  window.addEventListener('paste', onApprovalPaste)
})
onUnmounted(() => {
  window.removeEventListener('paste', onApprovalPaste)
})

// 暴露给父页(审批中心):打开某流程发起、打开被退回申请的重新提交
defineExpose({
  openStart,
  openResubmit,
  reloadProcesses: loadProcesses
})

// 把 "YYYY-MM-DD 上午/下午" 拆回 { day, ampm };解析失败返回 null
function parseHalfDay (val: unknown): { day: string; ampm: string } | null {
  if (!val) return null
  const m = /^(\d{4}-\d{2}-\d{2})(?:\s*(上午|下午))?/.exec(String(val).trim())
  if (!m) return null
  return { day: m[1], ampm: m[2] || '上午' }
}

// 某天某半天在「半天序列」上的绝对下标:整天数*2 + (下午?1:0);上午=0,下午=1
function halfSlotIndex (day: string, ampm: string): number | null {
  const t = new Date(day.slice(0, 10)).getTime()
  if (isNaN(t)) return null
  const dayNo = Math.round(t / 86400000)
  return dayNo * 2 + (ampm === '下午' ? 1 : 0)
}

// 请假流程:「日期 + 上午/下午」-> 合成 startDate/endDate 字符串 + 按半天粒度自动算天数
watch(
  () => [leaveHalf.startDay, leaveHalf.startAmpm, leaveHalf.endDay, leaveHalf.endAmpm, selectedProcess.value?.processKey],
  () => {
    if (selectedProcess.value?.processKey !== 'leave') return
    // V155 起表单口径:startDate/endDate 存标准日期,上午/下午独立字段(服务端按此重算天数)
    formValues.startDate = leaveHalf.startDay || ''
    formValues.startAmpm = leaveHalf.startDay ? leaveHalf.startAmpm : ''
    formValues.endDate = leaveHalf.endDay || ''
    formValues.endAmpm = leaveHalf.endDay ? leaveHalf.endAmpm : ''
    // 天数:半天序列上 [起, 止] 的闭区间半天数 * 0.5(最小 0.5;仅前端预览,以服务端重算为准)
    if (!leaveHalf.startDay || !leaveHalf.endDay) { formValues.days = null; return }
    const si = halfSlotIndex(leaveHalf.startDay, leaveHalf.startAmpm)
    const ei = halfSlotIndex(leaveHalf.endDay, leaveHalf.endAmpm)
    if (si == null || ei == null || ei < si) { formValues.days = null; return }
    formValues.days = (ei - si + 1) * 0.5
  },
  { deep: true }
)

// 审批表单草稿:发起弹窗内编辑时自动存 localStorage(按流程key),关闭再开可续填;提交成功清除
watch([formValues, processTitle], () => {
  if (!startVisible.value || !selectedProcess.value || hasImpersonationSessionMarker()) return
  try {
    localStorage.setItem('approval_draft_' + selectedProcess.value.processKey,
      JSON.stringify({ title: processTitle.value, values: { ...formValues } }))
  } catch { /* ignore quota */ }
}, { deep: true })
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
  color: #3370ff;
}
.ac-cat--active {
  color: #fff;
  background: #3370ff;
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
  border-radius: 8px;
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all 0.2s;
}
.ac-card:hover {
  border-color: color-mix(in srgb, var(--c) 45%, var(--el-border-color-lighter));
  box-shadow: 0 6px 18px color-mix(in srgb, var(--c) 14%, transparent);
  transform: translateY(-2px);
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
  border-radius: 8px;
  flex-shrink: 0;
  color: #fff;
  background: linear-gradient(135deg, var(--c), color-mix(in srgb, var(--c) 78%, #000));
  box-shadow: 0 3px 8px color-mix(in srgb, var(--c) 32%, transparent);
  transition: transform 0.2s ease;
}
.ac-card:hover .ac-card__icon {
  transform: scale(1.06);
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

/* ---------- 飞书式审批弹窗 ---------- */
:deep(.ac-flow-dialog) {
  border-radius: 8px;
  overflow: hidden;
}
:deep(.ac-flow-dialog .el-dialog__header) {
  padding: 24px 36px 14px;
  margin-right: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
:deep(.ac-flow-dialog .el-dialog__headerbtn) {
  top: 18px;
  right: 24px;
}
:deep(.ac-flow-dialog .el-dialog__body) {
  padding: 20px 36px 8px;
}
:deep(.ac-flow-dialog .el-dialog__footer) {
  padding: 16px 36px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.ac-dialog-heading {
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.2;
}
.ac-dialog-heading strong {
  font-size: 18px;
  color: var(--el-text-color-primary);
}
.ac-dialog-kicker {
  font-size: 12px;
  color: #3370ff;
  font-weight: 600;
}
.ac-start-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ac-start-form :deep(.el-form-item) {
  margin-bottom: 16px;
}
.ac-start-form :deep(.el-form-item__label) {
  padding-bottom: 6px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}
.ac-form-section {
  padding: 18px 20px 4px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #fff;
}
.ac-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.ac-section-head span {
  font-size: 15px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.ac-section-head em {
  font-style: normal;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ac-balance-alert {
  margin: -4px 0 0;
}
/* 请假:日期 + 上午/下午 半天粒度录入 */
.ac-halfday {
  display: flex;
  gap: 10px;
  width: 100%;
}
.ac-halfday__date {
  flex: 1;
  min-width: 0;
}
.ac-halfday__ampm {
  width: 120px;
  flex-shrink: 0;
}
.ac-halfday__hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ac-expense-section {
  padding-bottom: 18px;
}
.expense-summary {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 12px;
  margin-bottom: 14px;
}
.expense-total-card {
  padding: 14px 16px;
  border-radius: 8px;
  background: #f5f8ff;
  border: 1px solid #dbe7ff;
}
.expense-total-card span,
.expense-total-card small {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.expense-total-card strong {
  display: block;
  margin: 4px 0;
  color: #1f5eff;
  font-size: 24px;
  line-height: 1.2;
}
.expense-type-list {
  display: flex;
  align-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 78px;
  padding: 12px;
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}
.expense-type-pill {
  height: 28px;
  padding: 0 10px;
  border-radius: 14px;
  line-height: 28px;
  color: #245bdb;
  background: #edf3ff;
  border: 1px solid #d8e5ff;
  font-size: 12px;
}
.expense-type-empty {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}
.expense-lines {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.expense-line {
  padding: 14px 16px 2px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);
  background: #fbfcff;
}
.expense-line__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.expense-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 12px;
}
.expense-grid__wide {
  grid-column: span 3;
}
.expense-grid :deep(.el-select),
.expense-grid :deep(.el-date-editor),
.expense-grid :deep(.el-input-number) {
  width: 100%;
}
.expense-add-btn {
  margin-top: 12px;
}
.ac-expense-readonly {
  margin-bottom: 12px;
}
.expense-review-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 12px;
}
.expense-review-summary > div {
  padding: 12px 14px;
  border-radius: 8px;
  background: #f6f8fb;
  border: 1px solid var(--el-border-color-lighter);
}
.expense-review-summary span {
  display: block;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.expense-review-summary strong {
  display: block;
  margin-top: 4px;
  color: var(--el-text-color-primary);
  font-size: 18px;
}
.expense-review-table {
  margin-bottom: 12px;
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
  border-left: 3px solid #3370ff;
  padding-left: 8px;
}
/* 附件上传(发起弹窗) */
.ac-attach { width: 100%; }
.ac-attach-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 8px; }
.ac-attach-item { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--el-fill-color-light); border-radius: 6px; font-size: 13px; }
.ac-attach-thumb { width: 40px; height: 40px; border-radius: 4px; flex-shrink: 0; cursor: zoom-in; }
.ac-attach-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ac-attach-del { cursor: pointer; color: var(--el-text-color-secondary); }
.ac-attach-del:hover { color: var(--el-color-danger); }
.ac-attach-actions { display: flex; align-items: center; gap: 10px; }
.ac-attach-tip { font-size: 12px; color: var(--el-text-color-secondary); }
/* 附件展示(审批/详情弹窗) */
.ac-attach-view { margin-top: 10px; background: var(--el-bg-color-page); padding: 10px 16px; border-radius: 6px; }
.ac-attach-view-title { font-size: 13px; color: var(--el-text-color-secondary); margin-bottom: 6px; }
.ac-attach-view-item { display: inline-flex; align-items: center; gap: 6px; margin: 0 12px 6px 0; color: #3370ff; cursor: pointer; font-size: 13px; }
.ac-attach-view-item:hover { text-decoration: underline; }
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
/* 金额高亮:审批人第一眼要看到钱数 */
.ac-form-value--money {
  color: #d4380d;
  font-size: 15px;
  font-weight: 700;
}
.ac-approve-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>

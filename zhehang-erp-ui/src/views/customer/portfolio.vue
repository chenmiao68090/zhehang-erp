<template>
  <div class="portfolio-page">
    <header class="resource-header">
      <div class="resource-title">
        <h1>我的客户</h1>
        <p>{{ customerView === 'active' ? '已领取和已分配给我的客户，持续跟进直到成交。' : '已成交客户的跟进、交接与回款风险。' }}</p>
      </div>
      <el-segmented
        class="resource-tabs"
        v-model="customerView"
        :options="customerViewOptions"
        @change="changeCustomerView"
      />
      <div class="resource-summary">
        跟进中 <b>{{ leadSummary.total }}</b> · 已成交 <b>{{ formalCustomerTotal }}</b>
      </div>
    </header>

    <section class="filter-bar">
      <div v-if="customerView === 'active'" class="filter-left">
        <el-input
          v-model="leadFilters.keyword"
          class="keyword-input"
          clearable
          :prefix-icon="Search"
          placeholder="搜索公司、联系人或电话"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="leadFilters.source" clearable placeholder="来源">
          <el-option v-for="item in sourceOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="leadFilters.intentLevel" clearable placeholder="意向等级">
          <el-option v-for="item in intentLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <div v-else class="filter-left formal-filters">
        <el-input
          v-model="filters.keyword"
          class="keyword-input"
          clearable
          :prefix-icon="Search"
          placeholder="搜索客户、联系人、电话或负责人"
          @keyup.enter="search"
          @clear="search"
        />
        <el-select v-model="filters.level" clearable placeholder="客户分级">
          <el-option v-for="item in levelOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="filters.ownerId" clearable filterable placeholder="负责人">
          <el-option v-for="item in ownerOptions" :key="item.userId" :label="item.name" :value="item.userId" />
        </el-select>
        <el-input v-model="filters.serviceType" clearable placeholder="服务类型" @keyup.enter="search" />
        <el-select v-model="filters.status" clearable placeholder="客户状态">
          <el-option label="正常" :value="0" />
          <el-option label="停用" :value="1" />
        </el-select>
        <el-button type="primary" :icon="Search" @click="search">查询</el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <div class="filter-right">
        <el-button :icon="ArrowLeft" @click="router.push('/customer/perf-board')">返回销售经营台</el-button>
        <el-button type="primary" :icon="Plus" @click="createDialogVisible = true">新建</el-button>
        <el-button :icon="Refresh" :loading="loading" @click="loadCurrentView">刷新</el-button>
        <el-button :icon="ArrowRight" @click="router.push('/customer/workbench')">去今日工作</el-button>
      </div>
    </section>

    <section class="customer-workspace">
      <div class="attention-row">
        <el-segmented v-if="customerView === 'active'" v-model="leadAttention" :options="leadAttentionOptions" @change="changeAttention" />
        <el-segmented v-else v-model="attention" :options="attentionOptions" @change="changeAttention" />
        <div v-if="customerView === 'active' && canSeeAll" class="scope-switch">
          <span class="scope-label">查看范围</span>
          <el-radio-group v-model="leadScope" size="small" @change="onScopeChange">
            <el-radio-button label="mine">我的</el-radio-button>
            <el-radio-button label="all">{{ scopeAllLabel }}</el-radio-button>
          </el-radio-group>
        </div>
        <span class="attention-total">共 {{ currentTotal }} 位客户</span>
      </div>

      <div v-if="customerView === 'active' && leadSelection.length" class="batch-bar">
        <span>已选 <b>{{ leadSelection.length }}</b> 家客户</span>
        <el-button size="small" type="warning" plain :loading="batchReturning" @click="batchReturnToPool">批量退回公海</el-button>
        <el-button size="small" text @click="clearLeadSelection">取消选择</el-button>
      </div>

      <el-table
        v-if="customerView === 'active'"
        ref="leadTableRef"
        v-loading="loading"
        :data="leadRows"
        class="customer-table"
        row-key="id"
        empty-text="暂无跟进中客户"
        @selection-change="onLeadSelectionChange"
      >
        <el-table-column type="selection" width="42" />
        <el-table-column label="客户" min-width="200">
          <template #default="{ row }">
            <div class="customer-cell">
              <el-tooltip :content="row.company" placement="top" :show-after="400">
                <button type="button" class="customer-name" @click="openLead(row)">{{ row.company }}</button>
              </el-tooltip>
              <div>
                <el-tag v-if="row.intentLevel" size="small" effect="plain" :type="levelType(row.intentLevel)">{{ intentLevelLabel(row.intentLevel) }}</el-tag>
                <el-tag v-else size="small" effect="plain" type="info">未分级</el-tag>
                <span>{{ sourceLabel(row.source) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="联系人" min-width="150">
          <template #default="{ row }">
            <div class="contact-cell">
              <strong>{{ row.contactName || '待补联系人' }}</strong>
              <div v-if="row.phone">
                <span>{{ row.phone }}</span>
                <el-tooltip content="复制电话号码" placement="top">
                  <el-button text circle :icon="CopyDocument" aria-label="复制电话号码" @click="copyPhone(row.phone)" />
                </el-tooltip>
              </div>
              <small v-else>电话待补</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="销售阶段" min-width="135">
          <template #default="{ row }">
            <div class="stack-cell">
              <strong>{{ row.followStatus || '线索接收' }}</strong>
              <span>{{ row.ownerName || '当前销售' }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="最近跟进" min-width="180">
          <template #default="{ row }">
            <div class="follow-cell">
              <time>{{ dateTime(row.lastFollowTime) }}</time>
              <el-tooltip :content="row.lastFollowContent || '尚未跟进'" placement="top" :show-after="400">
                <p>{{ row.lastFollowContent || '尚未跟进' }}</p>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="下一步" min-width="190">
          <template #default="{ row }">
            <div v-if="row.nextActionTime || row.nextFollowTime" class="follow-cell">
              <div>
                <el-tag v-if="leadFollowOverdue(row)" size="small" type="danger" effect="plain">已逾期</el-tag>
                <time>{{ dateTime(row.nextActionTime || row.nextFollowTime) }}</time>
              </div>
              <el-tooltip :content="row.nextActionContent || row.nextActionType || '待补具体计划'" placement="top" :show-after="400">
                <p>{{ row.nextActionContent || row.nextActionType || '待补具体计划' }}</p>
              </el-tooltip>
            </div>
            <el-tag v-else type="warning" effect="plain">待安排</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="116" fixed="right" align="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" @click="openLead(row)">客户360</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <el-table
        v-else
        v-loading="loading"
        :data="rows"
        class="customer-table"
        row-key="id"
        empty-text="暂无客户"
      >
        <el-table-column label="客户" min-width="180">
          <template #default="{ row }">
            <div class="customer-cell">
              <el-tooltip :content="row.name || '未命名客户'" placement="top" :show-after="400">
                <button type="button" class="customer-name" @click="openCustomer(row)">{{ row.name || '未命名客户' }}</button>
              </el-tooltip>
              <div>
                <el-tag v-if="row.level" size="small" effect="plain" :type="levelType(row.level)">{{ row.level }}类</el-tag>
                <span>{{ row.status === 1 ? '已停用' : (row.source || '来源未记录') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="联系人" min-width="140">
          <template #default="{ row }">
            <div class="contact-cell">
              <strong>{{ row.contactName || '待补联系人' }}</strong>
              <div v-if="row.contactPhone">
                <span>{{ row.contactPhone }}</span>
                <el-tooltip content="复制电话号码" placement="top">
                  <el-button text circle :icon="CopyDocument" aria-label="复制电话号码" @click="copyPhone(row.contactPhone)" />
                </el-tooltip>
              </div>
              <small v-else>电话待补</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="负责人 / 服务" min-width="130">
          <template #default="{ row }">
            <div class="stack-cell">
              <strong>{{ row.ownerName || '未分配' }}</strong>
              <span>{{ row.servicePackage || '服务待确认' }}</span>
              <small v-if="row.billingCycle">{{ row.billingCycle }}</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="下一步跟进" min-width="170">
          <template #default="{ row }">
            <div v-if="row.nextFollowTime" class="follow-cell">
              <div>
                <el-tag v-if="row.followOverdue" size="small" type="danger" effect="plain">已逾期</el-tag>
                <el-tag v-else-if="row.followDueToday" size="small" type="warning" effect="plain">今天</el-tag>
                <time>{{ dateTime(row.nextFollowTime) }}</time>
              </div>
              <el-tooltip :content="row.nextFollowContent || '待补具体计划'" placement="top" :show-after="400">
                <p>{{ row.nextFollowContent || '待补具体计划' }}</p>
              </el-tooltip>
            </div>
            <el-tag v-else type="info" effect="plain">待安排</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="合同 / 交接" min-width="160">
          <template #default="{ row }">
            <div class="business-cell">
              <div>
                <el-tag v-if="row.latestContractStatus" size="small" effect="plain" :type="contractType(row.latestContractStatus)">
                  {{ contractLabel(row.latestContractStatus) }}
                </el-tag>
                <span v-else>暂无合同</span>
                <small v-if="row.contractCount">{{ row.contractCount }}份</small>
              </div>
              <div v-if="row.handoverStatus">
                <el-tag size="small" effect="plain" :type="handoverType(row)">{{ handoverLabel(row) }}</el-tag>
                <time v-if="row.handoverDeadline">{{ dateOnly(row.handoverDeadline) }}</time>
              </div>
              <small v-else-if="row.contractCount">尚未发起交接</small>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="回款续费" min-width="145">
          <template #default="{ row }">
            <div v-if="Number(row.arrearsAmount || 0) > 0" class="arrears-cell">
              <strong>{{ money(row.arrearsAmount) }}</strong>
              <span v-if="row.receivableDueDate">到期 {{ dateOnly(row.receivableDueDate) }}</span>
              <div>
                <el-tag v-if="row.badDebtRisk" size="small" type="danger" effect="dark">坏账风险</el-tag>
                <el-tag v-if="row.pausedService" size="small" type="warning" effect="plain">暂停服务</el-tag>
              </div>
            </div>
            <span v-else class="muted">暂无欠费</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="126" fixed="right" align="right">
          <template #default="{ row }">
            <div class="row-actions">
              <el-button link type="primary" @click="openCustomer(row)">客户360</el-button>
              <el-button
                v-if="row.handoverId || row.contractCount"
                link
                :type="row.handoverId ? 'success' : 'primary'"
                @click="openHandover(row)"
              >{{ row.handoverId ? '查看交接' : '发起交接' }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-row">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="currentTotal"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="loadCurrentView"
          @size-change="changePageSize"
        />
      </div>
    </section>

    <Customer360Drawer
      v-model="customer360Visible"
      :customer-id="selectedCustomerId"
      :lead-id="selectedLeadId"
      :show-dial="false"
      @changed="handleCustomerChanged"
    />

    <!-- 新建客户(从「找客户」迁移过来):保存后归当前登录人的我的客户 -->
    <LeadCreateDialog v-model="createDialogVisible" @saved="onLeadCreated" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, ArrowRight, CopyDocument, Plus, Refresh, Search } from '@element-plus/icons-vue'
import Customer360Drawer from '@/components/sales/Customer360Drawer.vue'
import LeadCreateDialog from './lead-create-dialog.vue'
import { useUserStore } from '@/stores/user'
import {
  customerApi,
  leadApi,
  type CustomerPortfolioAttention,
  type CustomerPortfolioPage,
  type CustomerPortfolioRow,
  type CustomerPortfolioStats
} from '@/api/crm'
import { employeeApi } from '@/api/org'
import { LEAD_SOURCE_OPTIONS, leadSourceLabel } from '@/constants/lead-source'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
type CustomerView = 'active' | 'formal'
type LeadAttention = 'all' | 'today' | 'warning'
interface MyCustomerLead {
  id: number
  company: string
  contactName?: string
  phone?: string
  source?: number
  intentLevel?: string
  ownerName?: string
  followStatus?: string
  lastFollowTime?: string
  lastFollowContent?: string
  nextFollowTime?: string
  nextActionTime?: string
  nextActionType?: string
  nextActionContent?: string
}

const initialCustomerView: CustomerView = route.query.view === 'formal' ? 'formal' : 'active'
const initialKeyword = typeof route.query.keyword === 'string' ? route.query.keyword : ''
const customerView = ref<CustomerView>(initialCustomerView)
const leadRows = ref<MyCustomerLead[]>([])
// 批量退回公海:勾选状态(复用 /crm/lead/return 批量接口,与老销售工作台同款交互)
const leadTableRef = ref()
const leadSelection = ref<MyCustomerLead[]>([])
const batchReturning = ref(false)
const leadTotal = ref(0)
const leadAttention = ref<LeadAttention>('all')
const leadSummary = reactive({ total: 0, today: 0, warning: 0 })
const formalCustomerTotal = ref(0)
const rows = ref<CustomerPortfolioRow[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(20)
const attention = ref<CustomerPortfolioAttention>('all')
const customer360Visible = ref(false)
const selectedCustomerId = ref<number | null>(null)
const selectedLeadId = ref<number | null>(null)
const ownerOptions = ref<Array<{ userId: number; name: string }>>([])
const stats = ref<CustomerPortfolioStats>(emptyStats())
let portfolioRequestSerial = 0
const filters = reactive<{
  keyword: string
  level?: string
  status?: number
  ownerId?: number
  serviceType: string
}>({ keyword: initialKeyword, level: undefined, status: undefined, ownerId: undefined, serviceType: '' })
const leadFilters = reactive<{ keyword: string; source?: number; intentLevel?: string }>({
  keyword: initialKeyword,
  source: undefined,
  intentLevel: undefined
})

// 「我的 / 部门 / 公司」范围切换:仅老板/超管/主管可见;普通员工无此选项、后端也强制只看自己。
// 只作用于「跟进中客户」视图(已成交客户暂不改)。
const userStore = useUserStore()
const myRoles = computed(() => (userStore.roles || []) as string[])
const isBossAdmin = computed(() => myRoles.value.some((r) => ['admin', 'boss', 'super_admin', 'sys_admin'].includes(r)))
const isDeptManager = computed(() => myRoles.value.some((r) => ['dept_manager', 'manager'].includes(r)))
const canSeeAll = computed(() => isBossAdmin.value || isDeptManager.value)
// 老板/超管切换后是「公司客户」,主管是「部门客户」
const scopeAllLabel = computed(() => (isBossAdmin.value ? '公司客户' : '部门客户'))
const leadScope = ref<'mine' | 'all'>('mine')
// 新建客户弹窗(从「找客户」迁移过来)
const createDialogVisible = ref(false)

const customerViewOptions = [
  { label: '跟进中客户', value: 'active' },
  { label: '已成交客户', value: 'formal' }
]
const sourceOptions = LEAD_SOURCE_OPTIONS
const intentLevelOptions = [
  { value: 'A', label: 'A类 高意向' },
  { value: 'B', label: 'B类 意向' },
  { value: 'C', label: 'C类 潜在意向' },
  { value: 'D', label: 'D类 无意向' },
  { value: 'E', label: 'E类 无效客户' }
]

const levelOptions = [
  { value: 'A', label: 'A类 重点' },
  { value: 'B', label: 'B类 稳定维护' },
  { value: 'C', label: 'C类 一般' },
  { value: 'D', label: 'D类 低频' },
  { value: 'F', label: 'F类 暂停' }
]
const attentionOptions = [
  { label: '全部客户', value: 'all' },
  { label: '今天跟进', value: 'today' },
  { label: '逾期跟进', value: 'overdue' },
  { label: '交接处理中', value: 'handover' },
  { label: '存在欠费', value: 'arrears' }
]
const leadAttentionOptions = computed(() => [
  { label: '全部客户', value: 'all' },
  { label: `今天跟进 ${leadSummary.today}`, value: 'today' },
  { label: `回收预警 ${leadSummary.warning}`, value: 'warning' }
])
const currentTotal = computed(() => customerView.value === 'active' ? leadTotal.value : total.value)

onMounted(() => {
  loadCurrentView()
  loadLeadSummary()
  loadFormalSummary()
  loadOwners()
})

function emptyStats(): CustomerPortfolioStats {
  return { total: 0, active: 0, dueToday: 0, overdue: 0, handoverPending: 0, arrearsCustomers: 0, arrearsAmount: 0 }
}

function readPage(response: any) {
  const payload = response?.data ?? response ?? {}
  const records = payload.records ?? payload.list ?? []
  return {
    records: Array.isArray(records) ? records : [],
    total: Number(payload.total ?? records.length) || 0
  }
}

const looksLikeCompany = (value?: string) => /公司|集团|企业|事务所|中心|工作室|商行|店|厂|合伙/.test(value || '')

function mapMyLead(raw: any): MyCustomerLead {
  const rawName = String(raw?.name || '')
  return {
    id: Number(raw.id),
    company: raw.company || (looksLikeCompany(rawName) ? rawName : '') || rawName || '未命名客户',
    contactName: raw.legalPerson || (!looksLikeCompany(rawName) ? rawName : '') || raw.contactName || '',
    phone: raw.phone || '',
    source: raw.source,
    intentLevel: normalizeIntentLevel(raw.intentLevel),
    ownerName: raw.ownerName || '',
    followStatus: raw.followStatus || (Number(raw.status) === 2 ? '需求沟通' : '线索接收'),
    lastFollowTime: raw.lastFollowTime,
    lastFollowContent: raw.lastFollowContent || '',
    nextFollowTime: raw.nextFollowTime,
    nextActionTime: raw.nextActionTime,
    nextActionType: raw.nextActionType || '',
    nextActionContent: raw.nextActionContent || ''
  }
}

async function loadLeadSummary() {
  try {
    const response: any = await leadApi.workbenchSummary(leadScope.value === 'all' ? { scope: 'all' } : undefined)
    const payload = response?.data ?? response ?? {}
    leadSummary.total = Number(payload.myLeadTotal || 0)
    leadSummary.today = Number(payload.todoTotal || 0)
    leadSummary.warning = Number(payload.warningTotal || 0)
  } catch {
    Object.assign(leadSummary, { total: leadTotal.value, today: 0, warning: 0 })
  }
}

async function loadFormalSummary() {
  try {
    const response: any = await customerApi.portfolio({ pageNum: 1, pageSize: 10, attention: 'all' })
    const payload = (response?.data ?? response) as CustomerPortfolioPage
    formalCustomerTotal.value = Number(payload?.stats?.total ?? payload?.total ?? 0)
  } catch {
    formalCustomerTotal.value = total.value
  }
}

async function loadLeadRows() {
  const serial = ++portfolioRequestSerial
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      name: leadFilters.keyword.trim() || undefined,
      keyword: leadFilters.keyword.trim() || undefined,
      source: leadFilters.source,
      intentLevel: leadFilters.intentLevel,
      // 主管/老板切到「部门/公司客户」时传 all;后端按角色放大(普通员工即使传也只回本人)
      scope: leadScope.value === 'all' ? 'all' : undefined
    }
    const response: any = leadAttention.value === 'today'
      ? await leadApi.todoFollow(params)
      : leadAttention.value === 'warning'
        ? await leadApi.recycleWarning(params)
        : await leadApi.myList(params)
    if (serial !== portfolioRequestSerial) return
    const page = readPage(response)
    leadRows.value = page.records.map(mapMyLead)
    leadTotal.value = page.total
    if (leadAttention.value === 'all' && !leadFilters.keyword && !leadFilters.source && !leadFilters.intentLevel) {
      leadSummary.total = page.total
    }
  } catch (error: any) {
    if (serial !== portfolioRequestSerial) return
    leadRows.value = []
    leadTotal.value = 0
    ElMessage.error(error?.message || '跟进中客户加载失败')
  } finally {
    if (serial === portfolioRequestSerial) loading.value = false
  }
}

function loadCurrentView() {
  return customerView.value === 'active' ? loadLeadRows() : loadPortfolio()
}

// 「我的 / 部门 / 公司」范围切换:重置分页并重新拉列表与汇总角标
function onScopeChange() {
  pageNum.value = 1
  clearLeadSelection()
  loadLeadRows()
  loadLeadSummary()
}
// 新建客户成功后刷新跟进中列表与汇总
function onLeadCreated() {
  loadLeadRows()
  loadLeadSummary()
}

// ---------------- 批量退回公海 ----------------
function onLeadSelectionChange(selection: MyCustomerLead[]) {
  leadSelection.value = selection
}
function clearLeadSelection() {
  leadTableRef.value?.clearSelection?.()
  leadSelection.value = []
}
async function batchReturnToPool() {
  if (!leadSelection.value.length) return
  let reason = ''
  try {
    const { value } = await ElMessageBox.prompt(
      `确定把选中的 ${leadSelection.value.length} 家客户退回公海吗?退回后 15 天内您不能再领取同一客户。可填写退回原因(选填):`,
      '批量退回公海',
      {
        confirmButtonText: '退回公海',
        cancelButtonText: '再想想',
        inputType: 'textarea',
        inputPlaceholder: '如:多次联系无意向'
      }
    )
    reason = (value || '').trim()
  } catch { return }
  batchReturning.value = true
  const count = leadSelection.value.length
  try {
    // returnToPool 为 silentError:失败不弹全局提示,需自行 catch(与 workbench 同款)
    await leadApi.returnToPool(leadSelection.value.map((r) => r.id), reason || '批量退回')
    ElMessage.success(`已退回 ${count} 家客户到公海`)
    clearLeadSelection()
    await Promise.all([loadLeadRows(), loadLeadSummary()])
  } catch {
    ElMessage.error('批量退回失败,请稍后再试')
  } finally {
    batchReturning.value = false
  }
}

async function loadPortfolio() {
  const serial = ++portfolioRequestSerial
  loading.value = true
  try {
    const response: any = await customerApi.portfolio({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: filters.keyword.trim() || undefined,
      level: filters.level,
      status: filters.status,
      ownerId: filters.ownerId,
      serviceType: filters.serviceType.trim() || undefined,
      attention: attention.value
    })
    if (serial !== portfolioRequestSerial) return
    const payload = (response?.data ?? response) as CustomerPortfolioPage
    rows.value = Array.isArray(payload?.records) ? payload.records : []
    total.value = Number(payload?.total || 0)
    stats.value = payload?.stats || emptyStats()
  } catch (error: any) {
    if (serial !== portfolioRequestSerial) return
    rows.value = []
    total.value = 0
    stats.value = emptyStats()
    ElMessage.error(error?.message || '客户列表加载失败')
  } finally {
    if (serial === portfolioRequestSerial) loading.value = false
  }
}

async function loadOwners() {
  try {
    const response: any = await employeeApi.options()
    const payload = response?.data ?? response
    const list = Array.isArray(payload)
      ? payload
      : (Array.isArray(payload?.records) ? payload.records : (Array.isArray(payload?.list) ? payload.list : []))
    ownerOptions.value = list
      .filter((item: any) => item.userId && item.status !== 3)
      .map((item: any) => ({ userId: Number(item.userId), name: item.name || '未命名员工' }))
  } catch {
    ownerOptions.value = []
  }
}

function search() {
  pageNum.value = 1
  loadCurrentView()
}

function resetFilters() {
  if (customerView.value === 'active') {
    Object.assign(leadFilters, { keyword: '', source: undefined, intentLevel: undefined })
  } else {
    Object.assign(filters, { keyword: '', level: undefined, status: undefined, ownerId: undefined, serviceType: '' })
  }
  pageNum.value = 1
  loadCurrentView()
}

function changeCustomerView() {
  pageNum.value = 1
  loadCurrentView()
}

function changeAttention() {
  pageNum.value = 1
  loadCurrentView()
}

function changePageSize() {
  pageNum.value = 1
  loadCurrentView()
}

function openCustomer(row: CustomerPortfolioRow) {
  selectedLeadId.value = null
  selectedCustomerId.value = row.id
  customer360Visible.value = true
}

function openLead(row: MyCustomerLead) {
  selectedCustomerId.value = null
  selectedLeadId.value = row.id
  customer360Visible.value = true
}

function openHandover(row: CustomerPortfolioRow) {
  router.push({
    path: '/customer/handover',
    query: {
      customerId: String(row.id),
      ...(row.handoverId ? { handoverId: String(row.handoverId) } : { create: '1' })
    }
  })
}

function handleCustomerChanged() {
  loadCurrentView()
  loadLeadSummary()
  loadFormalSummary()
}

async function copyPhone(phone?: string) {
  if (!phone) return
  try {
    await navigator.clipboard.writeText(phone)
    ElMessage.success('电话号码已复制')
  } catch {
    ElMessage.info(`电话号码：${phone}`)
  }
}

function levelType(level?: string): 'danger' | 'warning' | 'success' | 'info' | 'primary' {
  const types: Record<string, 'danger' | 'warning' | 'success' | 'info'> = {
    A: 'danger',
    B: 'warning',
    C: 'success',
    D: 'info',
    E: 'info'
  }
  return types[String(level || '').toUpperCase()] || 'primary'
}

function normalizeIntentLevel(value?: string) {
  const level = String(value || '').trim().toUpperCase()
  return ['A', 'B', 'C', 'D', 'E'].includes(level) ? level : ''
}

function intentLevelLabel(value?: string) {
  return intentLevelOptions.find((item) => item.value === normalizeIntentLevel(value))?.label || '未分级'
}

function contractLabel(status?: number) {
  return ({ 1: '草稿', 2: '待签署', 3: '签署中', 4: '已签署', 5: '执行中', 6: '已到期', 7: '已终止' } as Record<number, string>)[Number(status)] || '未知'
}

function contractType(status?: number): 'success' | 'warning' | 'danger' | 'info' | 'primary' {
  if (status === 4 || status === 5) return 'success'
  if (status === 2 || status === 3) return 'warning'
  if (status === 6 || status === 7) return 'danger'
  return 'info'
}

function handoverLabel(row: CustomerPortfolioRow) {
  if (row.handoverOverdue) return '交接逾期'
  return ({ pending: '待接收', in_progress: '交接中', returned: '已退回', completed: '已完成' } as Record<string, string>)[row.handoverStatus || ''] || '交接中'
}

function handoverType(row: CustomerPortfolioRow): 'success' | 'warning' | 'danger' | 'info' {
  if (row.handoverOverdue || row.handoverStatus === 'returned') return 'danger'
  if (row.handoverStatus === 'completed') return 'success'
  if (row.handoverStatus === 'in_progress') return 'warning'
  return 'info'
}

function sourceLabel(source?: number) {
  return leadSourceLabel(source, '来源未记录')
}

function leadFollowOverdue(row: MyCustomerLead) {
  const value = row.nextActionTime || row.nextFollowTime
  if (!value) return false
  const date = new Date(String(value).replace('T', ' ').replace(/-/g, '/'))
  return !Number.isNaN(date.getTime()) && date.getTime() < Date.now()
}

function money(value?: number) {
  return `¥${Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function dateOnly(value?: string) {
  return value ? String(value).slice(0, 10) : '-'
}

function dateTime(value?: string) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}
</script>

<style scoped>
.portfolio-page {
  min-width: 0;
  min-height: calc(100vh - 60px);
  padding: 16px 20px;
  color: var(--text-primary, #1f2937);
  background: var(--bg-card, #f5f7fa);
}

.resource-header {
  display: grid;
  grid-template-columns: minmax(220px, .8fr) auto minmax(220px, 1fr);
  align-items: center;
  gap: 20px;
  padding: 16px;
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px 8px 0 0;
  background: var(--bg-elevated, #fff);
}

.resource-title h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: 0;
}

.resource-title p {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 14px;
}

.resource-tabs {
  --el-segmented-item-selected-bg-color: var(--el-color-primary);
  --el-segmented-item-selected-color: #fff;
}

.resource-tabs :deep(.el-segmented__item) {
  min-width: 120px;
  min-height: 40px;
  padding: 0 16px;
  font-size: 15px;
  font-weight: 600;
}

.resource-summary {
  min-width: 0;
  color: #64748b;
  font-size: 14px;
  text-align: right;
  white-space: nowrap;
}

.resource-summary b {
  color: #1554c0;
  font-size: 16px;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-right: 1px solid var(--border-color, #dcdfe6);
  border-bottom: 1px solid var(--border-color, #dcdfe6);
  border-left: 1px solid var(--border-color, #dcdfe6);
  background: var(--bg-elevated, #fff);
}

.filter-left,
.filter-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-left {
  min-width: 0;
  flex: 1;
  flex-wrap: wrap;
}

.filter-right {
  flex: 0 0 auto;
}

.filter-left .keyword-input {
  width: min(340px, 28vw);
}

.filter-left :deep(.el-select) { width: 150px; }
.formal-filters :deep(.el-select) { width: 140px; }
.formal-filters > :nth-child(4) { width: 140px; }

.filter-bar :deep(.el-input__wrapper),
.filter-bar :deep(.el-select__wrapper) {
  min-height: 40px;
  font-size: 15px;
}

.filter-bar :deep(.el-button) {
  min-height: 40px;
  margin-left: 0;
  padding: 0 16px;
  font-size: 14px;
}

.customer-workspace {
  min-width: 0;
  border-right: 1px solid #dce3ec;
  border-bottom: 1px solid #dce3ec;
  border-left: 1px solid #dce3ec;
  border-radius: 0 0 8px 8px;
  background: #fff;
}

.attention-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e8edf3;
}

.attention-row :deep(.el-segmented) {
  min-height: 40px;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  border-bottom: 1px solid #e8edf3;
  background: #fdf6ec;
  font-size: 13px;
  color: #6b7785;
}

.attention-row :deep(.el-segmented__item) {
  min-height: 36px;
  padding: 0 14px;
  font-size: 14px;
}

.attention-row > span {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 14px;
}

.scope-switch {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}
.scope-switch .scope-label {
  color: #64748b;
  font-size: 13px;
}

.customer-table {
  width: 100%;
  font-size: 15px;
}

.customer-table :deep(th.el-table__cell) {
  height: 50px;
  background: #f8fafc;
  color: #334155;
  font-size: 14px;
  font-weight: 700;
}

.customer-table :deep(td.el-table__cell) {
  height: 74px;
  padding: 10px 0;
}

.customer-cell,
.contact-cell,
.stack-cell,
.follow-cell,
.business-cell,
.arrears-cell {
  min-width: 0;
}

.customer-name {
  display: block;
  width: 100%;
  overflow: hidden;
  margin: 0 0 7px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #172033;
  font: inherit;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}

.customer-name:hover { color: #245bdb; }

.customer-cell > div,
.contact-cell > div,
.business-cell > div,
.arrears-cell > div,
.follow-cell > div {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.customer-cell span,
.contact-cell span,
.stack-cell span,
.business-cell span,
.arrears-cell span,
.follow-cell time,
.business-cell time,
.customer-cell small,
.contact-cell small,
.stack-cell small,
.business-cell small {
  color: #748094;
  font-size: 13px;
}

.customer-cell > div > span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-cell strong,
.stack-cell strong {
  display: block;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.contact-cell :deep(.el-button) {
  width: 30px;
  height: 30px;
}

.stack-cell span,
.stack-cell small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.follow-cell p {
  overflow: hidden;
  margin: 6px 0 0;
  color: #4b5563;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.business-cell > div + div,
.business-cell > div + small {
  margin-top: 7px;
}

.arrears-cell strong {
  display: block;
  margin-bottom: 5px;
  color: #c2413a;
  font-size: 16px;
}

.arrears-cell > div { margin-top: 6px; }
.muted { color: #94a3b8; font-size: 13px; }

.row-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.row-actions :deep(.el-button) {
  min-height: 30px;
  margin: 0;
  font-size: 14px;
}

.pagination-row {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid #e8edf3;
}

.pagination-row :deep(.el-pagination button),
.pagination-row :deep(.el-pager li) {
  min-width: 36px;
  height: 36px;
  font-size: 14px;
}

@media (max-width: 1280px) {
  .resource-header {
    grid-template-columns: minmax(220px, 1fr) auto;
  }

  .resource-summary {
    grid-column: 1 / -1;
    text-align: left;
  }

  .filter-bar {
    align-items: flex-start;
  }

  .formal-filters > :nth-child(4) {
    width: 180px;
  }
}

@media (max-width: 900px) {
  .portfolio-page { padding: 16px; }
  .resource-header { grid-template-columns: 1fr; gap: 12px; }
  .resource-tabs { width: 100%; }
  .resource-tabs :deep(.el-segmented__item) { min-width: 0; flex: 1; }
  .resource-summary { grid-column: auto; }
  .filter-bar { align-items: stretch; flex-direction: column; }
  .filter-left .keyword-input,
  .filter-left :deep(.el-select),
  .formal-filters > :nth-child(4) { width: auto; flex: 1 1 180px; }
  .filter-right { justify-content: flex-end; }
  .attention-row { align-items: flex-start; flex-direction: column; }
  .attention-row :deep(.el-segmented) { max-width: 100%; overflow-x: auto; }
  .pagination-row { overflow-x: auto; justify-content: flex-start; }
}
</style>

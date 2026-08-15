<template>
  <div class="my-leads-page">
    <section class="metric-grid">
      <div class="metric-card">
        <span class="metric-label">我的持有线索</span>
        <strong>{{ myLeadTotal }}</strong>
        <small>当前名下可跟进客户</small>
      </div>
      <div class="metric-card is-blue">
        <span class="metric-label">今天该打给谁</span>
        <strong>{{ todayTotal }}</strong>
        <small>逾期、今日到期、从未跟进</small>
      </div>
      <div class="metric-card is-red">
        <span class="metric-label">回收预警</span>
        <strong>{{ warningTotal }}</strong>
        <small>保护期临近到期</small>
      </div>
      <div class="metric-card is-green">
        <span class="metric-label">跟进中</span>
        <strong>{{ convertingCount }}</strong>
        <small>正在推进的商机线索</small>
      </div>
    </section>

    <section class="level-strip">
      <span class="level-strip-title">我的客户意向</span>
      <div class="level-chips">
        <span v-for="lv in LEVEL_OPTIONS" :key="lv.value" class="level-chip" :class="'lv-' + lv.value">
          <em>{{ lv.value }}</em>
          <span class="level-chip-label">{{ lv.label.slice(2) }}</span>
          <strong>{{ levelCounts[lv.value] || 0 }}</strong>
        </span>
        <span class="level-chip lv-none">
          <em>—</em>
          <span class="level-chip-label">未分级</span>
          <strong>{{ levelCounts.none || 0 }}</strong>
        </span>
      </div>
      <span class="level-strip-hint">在「写跟进」里给客户打级即可累计</span>
    </section>

    <section class="workbench-layout">
      <div class="main-panel">
        <div class="panel-head">
          <div>
            <h2>{{ currentQueue.title }}</h2>
            <p>{{ currentQueue.desc }}</p>
          </div>
          <div class="panel-tools">
            <el-input
              v-model="filters.keyword"
              clearable
              placeholder="搜索公司、联系人、手机号(回车全部搜)"
              class="search-input"
              @keyup.enter="searchReload"
              @clear="searchReload"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="filters.source" clearable placeholder="来源" class="small-select" @change="searchReload">
              <el-option v-for="item in LEAD_SOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-select v-model="filters.followStatus" clearable placeholder="销售阶段" class="small-select" @change="searchReload">
              <el-option v-for="item in STAGE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button type="success" @click="goCreate">
              <el-icon><Plus /></el-icon>
              新建线索
            </el-button>
            <el-button type="primary" @click="goPool">
              <el-icon><OfficeBuilding /></el-icon>
              进入公司公海
            </el-button>
            <el-button @click="reloadAll">
              <el-icon><RefreshLeft /></el-icon>
              刷新
            </el-button>
          </div>
        </div>

        <div class="queue-tabs">
          <button :class="{ active: activeQueue === 'my' }" @click="setQueue('my')">
            <span>我的线索</span>
            <em>{{ myLeadTotal }}</em>
          </button>
          <button :class="{ active: activeQueue === 'today' }" @click="setQueue('today')">
            <span>今天该打给谁</span>
            <em>{{ todayTotal }}</em>
          </button>
          <button :class="{ active: activeQueue === 'warning' }" @click="setQueue('warning')">
            <span>回收预警</span>
            <em>{{ warningTotal }}</em>
          </button>
        </div>

        <div v-if="canSeeAll && activeQueue === 'my'" class="scope-switch">
          <span class="scope-label">查看范围</span>
          <el-radio-group v-model="myScope" size="small" @change="onScopeChange">
            <el-radio-button label="mine">我的</el-radio-button>
            <el-radio-button label="all">{{ scopeAllLabel }}</el-radio-button>
          </el-radio-group>
          <span class="scope-tip">{{ myScope === 'all' ? '正在看' + scopeAllLabel + '全部持有客资' : '只看我本人持有的' }}</span>
        </div>

        <div v-if="selected.length" class="batch-bar">
          <span>已选 <b>{{ selected.length }}</b> 条</span>
          <el-button size="small" @click="batchRelease">批量释放回公海</el-button>
          <el-button size="small" type="danger" plain @click="batchInvalid">批量标记无效</el-button>
          <el-button size="small" text @click="clearSelection">取消选择</el-button>
        </div>
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="filteredRows"
          class="lead-table"
          row-key="id"
          stripe
          empty-text="暂无线索"
          @selection-change="onSelectionChange"
        >
          <el-table-column type="selection" width="42" />
          <el-table-column label="公司名称" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <button class="company-name" :title="`${row.companyName} · 查看客户360`" @click="openCustomer360(row)">{{ row.companyName }}</button>
            </template>
          </el-table-column>
          <el-table-column label="联系人" prop="contactName" min-width="100" show-overflow-tooltip />
          <el-table-column v-if="canSeeAll && myScope === 'all'" label="负责人" min-width="96" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag v-if="row.ownerName" size="small" type="info" effect="plain">{{ row.ownerName }}</el-tag>
              <span v-else style="color: var(--el-text-color-placeholder)">未分配</span>
            </template>
          </el-table-column>
          <el-table-column label="手机" prop="phone" min-width="138">
            <template #default="{ row }">
              <span class="phone-cell" :title="row.phone || ''">{{ row.phone || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="来源" min-width="92">
            <template #default="{ row }">
              <el-tag size="small" effect="plain">{{ sourceLabel(row.source) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="销售阶段" min-width="118" show-overflow-tooltip>
            <template #default="{ row }">
              <el-tag size="small" :type="followStatusTagType(row.followStatus)" effect="plain">
                {{ row.followStatus || lifecycleStage(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="注册时间" min-width="106" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.establishedDate || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column min-width="82">
            <template #header>
              <el-tooltip content="客户的购买意愿强弱(高/中/低)，电销外呼、跟进时评估" placement="top">
                <span style="border-bottom:1px dashed var(--el-text-color-placeholder);cursor:help;">意向</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-tag v-if="row.intentLevel" size="small" :type="intentTagType(row.intentLevel)">{{ intentText(row.intentLevel) }}</el-tag>
              <span v-else class="unclassified-text">未分级</span>
            </template>
          </el-table-column>
          <el-table-column width="80" align="center">
            <template #header>
              <el-tooltip content="客户的优先级/价值等级(A重点·B意向·C一般·D观望·F智搁)，跟进时你来定" placement="top">
                <span style="border-bottom:1px dashed var(--el-text-color-placeholder);cursor:help;">分级</span>
              </el-tooltip>
            </template>
            <template #default="{ row }">
              <el-tag v-if="row.customerLevel" size="small" :type="levelTagType(row.customerLevel)" effect="dark">{{ row.customerLevel }}</el-tag>
              <span v-else class="unclassified-text">未分级</span>
            </template>
          </el-table-column>
          <el-table-column label="最近跟进" min-width="150">
            <template #default="{ row }">
              <span>{{ row.lastFollowTime || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="跟进情况" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.lastFollowContent || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="下次跟进 · 紧急度" min-width="168">
            <template #default="{ row }">
              <div class="next-cell">
                <span class="next-follow">{{ row.nextActionTime || row.nextFollowTime || '-' }}</span>
                <small v-if="row.nextActionType">{{ row.nextActionType }}</small>
                <span v-if="row.daysLeftLabel" class="deadline-pill" :class="row.daysLeftClass">{{ row.daysLeftLabel }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="跟进策略" min-width="150" show-overflow-tooltip>
            <template #default="{ row }">
              <span>{{ row.followStrategy || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="释放公海" min-width="120">
            <template #default="{ row }">
              <span class="release-date">{{ row.protectionExpireDate || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="218" fixed="right">
            <template #default="{ row }">
              <div class="row-actions">
                <el-button v-if="!isTerminalLifecycle(row)" type="primary" link @click="openFollow(row)">写跟进</el-button>
                <el-button v-if="row.phone" type="success" link @click="call(row.phone)">拨打</el-button>
                <el-button link @click="playLeadRecord(row)">听录音</el-button>
                <el-dropdown trigger="click" @command="(command) => handleRowAction(command, row)">
                  <el-button link>更多</el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="customer360">客户360</el-dropdown-item>
                      <el-dropdown-item command="history">仅看跟进历史</el-dropdown-item>
                      <el-dropdown-item command="edit">编辑资料</el-dropdown-item>
                      <template v-if="!isTerminalLifecycle(row)">
                        <el-dropdown-item command="convert" divided>转为客户</el-dropdown-item>
                        <el-dropdown-item command="release">释放回公海</el-dropdown-item>
                        <el-dropdown-item command="invalid" divided>标记无效</el-dropdown-item>
                      </template>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <div class="table-foot">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[20, 50, 100, 200, 300, 500]"
            :total="activeTotal"
            layout="total, sizes, prev, pager, next, jumper"
            background
            @current-change="onPageChange"
            @size-change="onSizeChange"
          />
          <el-button text type="primary" @click="goPool">去公司公海领取更多线索</el-button>
        </div>
      </div>

    </section>

    <el-dialog
      v-model="followDialog.visible"
      class="sales-task-dialog"
      title="写跟进记录"
      width="min(760px, 92vw)"
      align-center
      append-to-body
      destroy-on-close
    >
      <div v-if="followDialog.row" class="follow-target">
        <div class="avatar large">{{ firstChar(followDialog.row.companyName) }}</div>
        <div>
          <strong>{{ followDialog.row.companyName }}</strong>
          <p>{{ followDialog.row.contactName }} · {{ followDialog.row.phone || '暂无电话' }}</p>
        </div>
      </div>
      <div v-if="followRecent.length" class="follow-recent">
        <div class="follow-recent-title">最近跟进</div>
        <div v-for="item in followRecent" :key="item.id" class="follow-recent-item">
          <span class="fr-time">{{ fmtFollowTime(item.createTime) }}</span>
          <el-tag size="small" effect="plain">{{ followTypeLabel(item.type) }}</el-tag>
          <span class="fr-content">{{ item.content || '（无内容）' }}</span>
        </div>
      </div>
      <el-form ref="followFormRef" :model="followForm" :rules="followRules" label-width="96px">
        <el-form-item label="跟进方式" prop="type">
          <el-radio-group v-model="followForm.type">
            <el-radio-button :label="1">电话</el-radio-button>
            <el-radio-button :label="2">微信</el-radio-button>
            <el-radio-button :label="3">面谈</el-radio-button>
            <el-radio-button :label="4">邮件</el-radio-button>
            <el-radio-button :label="5">其他</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="销售阶段" prop="followStatus">
          <el-select v-model="followForm.followStatus" placeholder="选择当前阶段" style="width: 100%">
            <el-option v-for="st in STAGE_OPTIONS" :key="st.value" :label="st.label" :value="st.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="意向等级">
          <el-radio-group v-model="followForm.customerLevel">
            <el-radio-button v-for="lv in LEVEL_OPTIONS" :key="lv.value" :label="lv.value">{{ lv.label }}</el-radio-button>
          </el-radio-group>
          <span class="follow-level-hint">A/B/C 保留在跟进中；D/E 保存后进入历史客资，不再安排下一步</span>
        </el-form-item>
        <el-form-item label="沟通内容" prop="content">
          <el-input
            v-model="followForm.content"
            type="textarea"
            :rows="5"
            maxlength="500"
            show-word-limit
            placeholder="写清楚客户反馈、当前需求、下一步动作"
          />
        </el-form-item>
        <el-alert
          v-if="followMovesToHistory"
          type="warning"
          :closable="false"
          show-icon
          title="保存后客户将进入历史客资，跟进、通话和备注记录都会保留"
        />
        <el-form-item v-if="!followMovesToHistory" label="下步方式" prop="nextActionType">
          <el-select v-model="followForm.nextActionType" placeholder="选择下一步动作" style="width:100%">
            <el-option v-for="item in NEXT_ACTION_OPTIONS" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="!followMovesToHistory" label="下次跟进" prop="nextTime">
          <el-date-picker
            v-model="followForm.nextTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择下次跟进时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item v-if="!followMovesToHistory" label="下次计划">
          <el-input v-model="followForm.nextContent" placeholder="例如：明天下午电话确认报价方案" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="followDialog.saving" @click="submitFollow">保存跟进</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="historyDialog.visible"
      class="sales-task-dialog"
      title="跟进历史"
      width="min(680px, 92vw)"
      align-center
      append-to-body
      destroy-on-close
    >
      <div v-if="historyDialog.row" class="follow-target">
        <div class="avatar large">{{ firstChar(historyDialog.row.companyName) }}</div>
        <div>
          <strong>{{ historyDialog.row.companyName }}</strong>
          <p>{{ historyDialog.row.contactName }} · {{ historyDialog.row.phone || '暂无电话' }}</p>
        </div>
      </div>
      <div v-loading="historyDialog.loading" class="history-body">
        <el-timeline v-if="historyList.length">
          <el-timeline-item
            v-for="(item, idx) in historyList"
            :key="item.id"
            :timestamp="fmtFollowTime(item.createTime)"
            placement="top"
            :type="idx === 0 ? 'primary' : ''"
          >
            <div class="history-item">
              <el-tag size="small" effect="plain">{{ followTypeLabel(item.type) }}</el-tag>
              <p class="history-content">{{ item.content || '（无沟通内容）' }}</p>
              <p v-if="item.nextTime || item.nextContent" class="history-next">
                下次计划：{{ item.nextTime ? fmtFollowTime(item.nextTime) : '' }} {{ item.nextContent || '' }}
              </p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else-if="!historyDialog.loading" description="这个客户还没有跟进记录" :image-size="70" />
      </div>
      <template #footer>
        <el-button @click="historyDialog.visible = false">关闭</el-button>
        <el-button type="primary" @click="writeFromHistory">写跟进</el-button>
      </template>
    </el-dialog>

    <!-- 编辑线索:可改公司、联系人、法人、电话、分级、备注 -->
    <el-dialog
      v-model="editDialog.visible"
      class="sales-task-dialog"
      title="编辑线索"
      width="min(620px, 92vw)"
      align-center
      append-to-body
      destroy-on-close
    >
      <el-form :model="editDialog.form" label-width="92px">
        <el-form-item label="公司名称" required>
          <el-input v-model="editDialog.form.company" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="editDialog.form.name" placeholder="联系人姓名" />
        </el-form-item>
        <el-form-item label="法定代表人">
          <el-input v-model="editDialog.form.legalPerson" placeholder="法人代表" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="editDialog.form.phone" placeholder="手机号 / 座机" />
        </el-form-item>
        <el-form-item label="意向等级">
          <el-select v-model="editDialog.form.customerLevel" placeholder="未分级" clearable style="width: 100%">
            <el-option label="A 高意向" value="A" />
            <el-option label="B 意向" value="B" />
            <el-option label="C 潜在意向" value="C" />
            <el-option label="D 无意向（转历史）" value="D" />
            <el-option label="E 无效客户（转历史）" value="E" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editDialog.form.remark" type="textarea" :rows="2" placeholder="补充说明(选填)" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="editDialog.saving" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>

    <Customer360Drawer
      v-model="customer360Visible"
      :lead-id="customer360LeadId"
      @changed="handleCustomer360Changed"
      @dial="handleCustomer360Dial"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { yunkeApi } from '@/api/yunke'
import {
  OfficeBuilding,
  RefreshLeft,
  Search
} from '@element-plus/icons-vue'
import { leadApi } from '@/api/crm'
import { callRecordingStreamUrl, callRecordApi } from '@/api/call-record'
import { useUserStore } from '@/stores/user'
import Customer360Drawer from '@/components/sales/Customer360Drawer.vue'
import { LEAD_SOURCE_OPTIONS, leadSourceLabel } from '@/constants/lead-source'

type QueueKey = 'my' | 'today' | 'warning'

interface LeadRow {
  id: number
  companyName: string
  contactName: string
  phone: string
  ownerName?: string
  source?: number
  status?: number
  followStatus?: string
  establishedDate?: string
  lastFollowContent?: string
  customerLevel?: string
  intentLevel?: string
  followStrategy?: string
  lastFollowTime: string
  nextFollowTime: string
  nextActionTime: string
  nextActionType?: string
  protectionExpireDate: string
  daysLeftLabel: string
  daysLeftClass: string
  advice: string
  adviceClass: string
}

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const customer360Visible = ref(false)
const customer360LeadId = ref<number | null>(null)

// 「我的 / 全部」范围切换:仅老板/超管/主管可见;其余员工只看自己(后端也强制)
const myRoles = computed(() => (userStore.roles || []) as string[])
const isBossAdmin = computed(() => myRoles.value.some((r) => ['admin', 'boss', 'super_admin', 'sys_admin'].includes(r)))
const isDeptManager = computed(() => myRoles.value.some((r) => ['dept_manager', 'manager'].includes(r)))
const canSeeAll = computed(() => isBossAdmin.value || isDeptManager.value)
const scopeAllLabel = computed(() => (isBossAdmin.value ? '全公司' : '本部门'))
const myScope = ref<'mine' | 'all'>('mine')
function onScopeChange() {
  pageNum.value = 1
  selected.value = []
  loadMyLeads()
  loadSummary()
}

const queueMeta: Record<QueueKey, { title: string; desc: string }> = {
  my: {
    title: '我的线索',
    desc: '你名下正在持有的客户，适合做日常维护、推进成交和记录跟进。'
  },
  today: {
    title: '今天该打给谁',
    desc: '系统按逾期、今日到期、从未跟进筛出优先拨打对象，避免漏跟。'
  },
  warning: {
    title: '回收预警',
    desc: '保护期即将到期的线索，优先处理，避免客户自动回收到公海。'
  }
}

function normalizeQueue(value: unknown): QueueKey {
  if (value === 'todo' || value === 'today') return 'today'
  if (value === 'warning') return 'warning'
  return 'my'
}

const activeQueue = ref<QueueKey>(normalizeQueue(route.query.section || route.query.tab))
const currentQueue = computed(() => queueMeta[activeQueue.value])

const loading = ref(false)
const myRows = ref<LeadRow[]>([])
const todayRows = ref<LeadRow[]>([])
const warningRows = ref<LeadRow[]>([])
const myLeadTotal = ref(0)
const todayTotal = ref(0)
const warningTotal = ref(0)
const myPageTotal = ref(0)
const todayPageTotal = ref(0)
const warningPageTotal = ref(0)
const convertingCount = ref(0)
// 分页 + 多选(批量操作)
const pageNum = ref(1)
const pageSize = ref(20)
const selected = ref<LeadRow[]>([])
const tableRef = ref()
const activeTotal = computed(() => {
  if (activeQueue.value === 'today') return todayPageTotal.value
  if (activeQueue.value === 'warning') return warningPageTotal.value
  return myPageTotal.value
})

const filters = reactive({
  keyword: '',
  source: null as number | null,
  followStatus: ''
})
let keywordSearchTimer: ReturnType<typeof setTimeout> | undefined

watch(() => filters.keyword, () => {
  if (keywordSearchTimer) clearTimeout(keywordSearchTimer)
  keywordSearchTimer = setTimeout(() => {
    pageNum.value = 1
    selected.value = []
    loadCurrentQueue()
  }, 350)
})

const followFormRef = ref<FormInstance>()
const followDialog = reactive({
  visible: false,
  saving: false,
  row: null as LeadRow | null
})
const followForm = reactive({
  type: 1,
  content: '',
  nextTime: '',
  nextContent: '',
  customerLevel: '',
  followStatus: '线索接收',
  nextActionType: '电话'
})

// 意向等级:ABC继续跟进,DE进入历史客资。
const LEVEL_OPTIONS = [
  { value: 'A', label: 'A 高意向', type: 'danger' },
  { value: 'B', label: 'B 意向', type: 'warning' },
  { value: 'C', label: 'C 潜在', type: 'primary' },
  { value: 'D', label: 'D 无意向', type: 'info' },
  { value: 'E', label: 'E 无效', type: 'info' }
]
const levelTagType = (v?: string) => LEVEL_OPTIONS.find((o) => o.value === v)?.type || 'info'
const followMovesToHistory = computed(() => ['D', 'E'].includes(followForm.customerLevel))

// 销售阶段使用 followStatus;status 只表示生命周期(新建/跟进中/已转化/无效)。
const STAGE_OPTIONS = [
  { value: '线索接收', label: '线索接收' },
  { value: '需求沟通', label: '需求沟通' },
  { value: '需求答疑', label: '需求答疑 / 报价' },
  { value: '签单收款', label: '签单收款' }
]
const NEXT_ACTION_OPTIONS = ['电话', '微信', '发方案', '报价', '签约', '收款', '其他']
const followRules: FormRules = {
  type: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  followStatus: [{ required: true, message: '请选择销售阶段', trigger: 'change' }],
  nextActionType: [{
    validator: (_rule, value: string, callback) => {
      if (!followMovesToHistory.value && !value) callback(new Error('请选择下一步动作'))
      else callback()
    },
    trigger: 'change'
  }],
  nextTime: [{
    validator: (_rule, value: string, callback) => {
      if (!followMovesToHistory.value && !value) callback(new Error('请安排下一次跟进时间'))
      else callback()
    },
    trigger: 'change'
  }],
  content: [
    { required: true, message: '请输入沟通内容', trigger: 'blur' },
    {
      validator: (_rule, value: string, callback) => {
        if (!value || value.trim().length < 6) callback(new Error('沟通内容至少写 6 个字'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

const activeRows = computed(() => {
  if (activeQueue.value === 'today') return todayRows.value
  if (activeQueue.value === 'warning') return warningRows.value
  return myRows.value
})

// 关键词、来源和销售阶段均走后端筛选,保证分页总数与表格一致。
const filteredRows = computed(() => activeRows.value)

function setQueue(queue: QueueKey) {
  activeQueue.value = queue
  pageNum.value = 1
  selected.value = []
  // 切队列时重置来源/阶段筛选,避免带着上个队列的筛选条件误判
  filters.source = null
  filters.followStatus = ''
  router.replace({
    path: route.path,
    query: {
      ...route.query,
      section: queue === 'today' ? 'today' : queue,
      tab: undefined
    }
  })
  loadCurrentQueue()
}

// 分页翻页 / 搜索(回车重置到第1页,keyword 走服务端)
function onPageChange(p: number) { pageNum.value = p; selected.value = []; loadCurrentQueue() }
function onSizeChange(s: number) { pageSize.value = s; pageNum.value = 1; selected.value = []; loadCurrentQueue() }
function searchReload() { pageNum.value = 1; loadCurrentQueue() }
function onSelectionChange(rows: LeadRow[]) { selected.value = rows }
function clearSelection() { tableRef.value?.clearSelection?.() }

// 批量释放回公海(returnToPool 后端支持数组)
async function batchRelease() {
  if (!selected.value.length) return
  let value = ''
  try {
    const r = await ElMessageBox.prompt('这些客户将退回公海,其他人可再抢。可填释放原因:', `批量释放 ${selected.value.length} 个客户`, { inputPlaceholder: '释放原因(可选)', confirmButtonText: '确认释放' })
    value = r.value || ''
  } catch { return }
  try {
    await leadApi.returnToPool(selected.value.map((r) => r.id), value.trim() || '批量释放')
    ElMessage.success(`已释放 ${selected.value.length} 个客户回公海`)
    clearSelection(); pageNum.value = 1; reloadAll()
  } catch { ElMessage.error('批量释放失败') }
}

// 批量标记无效(markInvalid 单条,循环 + allSettled 汇总成败)
async function batchInvalid() {
  if (!selected.value.length) return
  let value = ''
  try {
    const r = await ElMessageBox.prompt(`将 ${selected.value.length} 个客户标记为无效资源,请填原因(必填):`, '批量标记无效', { inputPlaceholder: '无效原因', inputValidator: (v: string) => (v && v.trim() ? true : '请填写无效原因'), confirmButtonText: '确认' })
    value = r.value || ''
  } catch { return }
  const list = selected.value.slice()
  const results = await Promise.allSettled(list.map((r) => leadApi.markInvalid(r.id, value.trim())))
  const ok = results.filter((x) => x.status === 'fulfilled').length
  const fail = results.length - ok
  ElMessage.success(`已标记无效 ${ok} 个${fail ? `,失败 ${fail} 个` : ''}`)
  clearSelection(); pageNum.value = 1; reloadAll()
}

function firstChar(text?: string) {
  return (text || '客').slice(0, 1)
}

function fmtDate(value?: string) {
  if (!value) return ''
  return value.slice(0, 16).replace('T', ' ')
}

function daysUntil(dateStr?: string) {
  if (!dateStr) return null
  const target = new Date(`${dateStr.slice(0, 10)}T00:00:00`).getTime()
  const today = new Date(new Date().toDateString()).getTime()
  if (Number.isNaN(target)) return null
  return Math.round((target - today) / 86400000)
}

function sourceLabel(source?: number) {
  return leadSourceLabel(source, '未标记')
}

function lifecycleStage(status?: number) {
  const map: Record<number, string> = {
    1: '线索接收',
    2: '需求沟通',
    3: '已转化',
    4: '无效'
  }
  return status ? (map[status] || `状态${status}`) : '未设置'
}

function followStatusTagType(status?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  if (status === '签单收款' || status === '移交结束交付') return 'success'
  if (status === '需求答疑') return 'warning'
  if (status === '需求沟通') return 'primary'
  return 'info'
}

function isTerminalLifecycle(row: LeadRow) {
  return row.status === 3 || row.status === 4
}

// 兼容存量高/中/低,新数据统一使用A/B/C/D/E。
function intentTagType(v?: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const key = String(v || '').trim().toUpperCase()
  if (['A', '高', 'HIGH'].includes(key)) return 'danger'
  if (['B', '中', 'MEDIUM'].includes(key)) return 'warning'
  if (['C', '低', 'LOW'].includes(key)) return 'primary'
  return 'info'
}

function intentText(v?: string) {
  const key = String(v || '').trim().toUpperCase()
  if (['A', '高', 'HIGH'].includes(key)) return 'A 高意向'
  if (['B', '中', 'MEDIUM'].includes(key)) return 'B 意向'
  if (['C', '低', 'LOW'].includes(key)) return 'C 潜在'
  if (key === 'D') return 'D 无意向'
  if (key === 'E') return 'E 无效'
  return '未分级'
}

function normalizeIntentLevel(value?: string) {
  const level = String(value || '').trim().toUpperCase()
  if (level === 'F') return 'E'
  return ['A', 'B', 'C', 'D', 'E'].includes(level) ? level : ''
}

// 听录音:只返回是否有录音，播放时再申请后端短时票据。
async function playLeadRecord(row: LeadRow) {
  try {
    const res: any = await callRecordApi.list({ leadId: row.id })
    const list = res?.data ?? res
    const records = Array.isArray(list) ? list : (list?.records || list?.list || [])
    const hit = (Array.isArray(records) ? records : []).find((r: any) => r?.id && r.recordingAvailable)
    if (hit) {
      const ticketRes: any = await callRecordApi.recordingTicket(hit.id)
      const ticket = ticketRes?.data ?? ticketRes
      const target = window.open(callRecordingStreamUrl(hit.id, ticket.token), '_blank')
      if (target) target.opener = null
    } else {
      ElMessage.info('暂无录音,接入外呼平台后自动生成')
    }
  } catch {
    ElMessage.info('暂无录音,接入外呼平台后自动生成')
  }
}

function makeAdvice(row: any, queue: QueueKey) {
  const nextDays = daysUntil(row.nextFollowTime)
  const recycleDays = daysUntil(row.protectionExpireDate)
  if (queue === 'warning') {
    const left = recycleDays ?? 0
    if (left <= 0) return { advice: '今天必须跟进，避免回收', adviceClass: 'danger' }
    if (left <= 1) return { advice: '1 天内跟进并写记录', adviceClass: 'danger' }
    return { advice: `${left} 天内完成有效跟进`, adviceClass: 'warning' }
  }
  if (queue === 'today') {
    if (nextDays == null) return { advice: '先打首通电话', adviceClass: 'warning' }
    if (nextDays < 0) return { advice: `已逾期 ${Math.abs(nextDays)} 天`, adviceClass: 'danger' }
    if (nextDays === 0) return { advice: '今天到期', adviceClass: 'warning' }
    return { advice: `${nextDays} 天后跟进`, adviceClass: 'normal' }
  }
  if (row.status === 3) return { advice: '已转化客户，进入交付跟进', adviceClass: 'success' }
  if (row.status === 4) return { advice: '已终止跟进', adviceClass: 'danger' }
  if (!row.lastFollowTime) return { advice: '尚未跟进，建议今天首触', adviceClass: 'warning' }
  return { advice: '保持节奏，推进下一步', adviceClass: 'normal' }
}

// 与公司资源库(crm/lead.vue)完全一致的"像不像公司名"判断,保证两处显示统一
const looksLikeCompany = (v?: string) => /公司|集团|企业|事务所|中心|工作室|商行|店|厂|合伙/.test(v || '')
// 导入的工商串塞在 remark 里(每行"字段: 值"),法人/信用代码等正式字段是空的,需从 remark 解析(同公司资源库)
const extractRemarkFields = (remark?: string): Record<string, string> => {
  const fields: Record<string, string> = {}
  if (!remark) return fields
  String(remark).split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+?)\s*$/)
    if (m) fields[m[1].trim()] = m[2].trim()
  })
  return fields
}
const firstRemarkValue = (fields: Record<string, string>, labels: string[]) => {
  for (const l of labels) { if (fields[l]) return fields[l] }
  return ''
}

function mapLeadRow(raw: any, queue: QueueKey): LeadRow {
  const remarkFields = extractRemarkFields(raw.remark)
  // 公司名 = company,其次"像公司名"的 name(同 leadCompanyName)
  const companyName = raw.company || (looksLikeCompany(raw.name) ? raw.name : '') || raw.name || '未命名线索'
  // 联系人 = 法人字段 → remark里解析的法定代表人 → 不像公司名的 name → '-'(同公司资源库 normalizeLead)
  const contactName =
    raw.legalPerson ||
    firstRemarkValue(remarkFields, ['法定代表人', '法人', '法人代表']) ||
    (!looksLikeCompany(raw.name) ? raw.name : '') ||
    raw.contactName || raw.contact || '-'
  const recycleDays = daysUntil(raw.protectionExpireDate)
  const nextDays = daysUntil(raw.nextActionTime || raw.nextFollowTime)
  const advice = makeAdvice(raw, queue)
  let daysLeftLabel = ''
  let daysLeftClass = ''
  if (queue === 'warning' && recycleDays != null) {
    daysLeftLabel = recycleDays <= 0 ? '今天回收' : `${recycleDays} 天后回收`
    daysLeftClass = recycleDays <= 1 ? 'deadline-danger' : 'deadline-warning'
  } else if (queue === 'today' && nextDays != null) {
    daysLeftLabel = nextDays < 0 ? `逾期 ${Math.abs(nextDays)} 天` : nextDays === 0 ? '今天到期' : `${nextDays} 天后`
    daysLeftClass = nextDays <= 0 ? 'deadline-danger' : 'deadline-warning'
  }
  return {
    id: raw.id,
    companyName,
    contactName,
    phone: raw.phone || '',
    ownerName: raw.ownerName || '',
    source: raw.source,
    status: raw.status,
    followStatus: raw.followStatus || lifecycleStage(raw.status),
    establishedDate: (raw.establishedDate || '').slice(0, 10),
    lastFollowContent: raw.lastFollowContent || '',
    customerLevel: normalizeIntentLevel(raw.customerLevel),
    intentLevel: normalizeIntentLevel(raw.intentLevel),
    followStrategy: raw.followStrategy || '',
    lastFollowTime: fmtDate(raw.lastFollowTime),
    nextFollowTime: fmtDate(raw.nextFollowTime),
    nextActionTime: fmtDate(raw.nextActionTime),
    nextActionType: raw.nextActionType || '',
    protectionExpireDate: fmtDate(raw.protectionExpireDate),
    daysLeftLabel,
    daysLeftClass,
    advice: advice.advice,
    adviceClass: advice.adviceClass
  }
}

function readPage(resp: any) {
  const page = resp?.data || resp || {}
  const records = page.records || page.list || []
  return {
    records: Array.isArray(records) ? records : [],
    total: Number(page.total ?? records.length) || 0
  }
}

async function loadMyLeads() {
  const keyword = filters.keyword.trim()
  const resp: any = await leadApi.myList({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    name: keyword || undefined,
    keyword: keyword || undefined,
    source: filters.source ?? undefined,
    followStatus: filters.followStatus || undefined,
    scope: myScope.value === 'all' ? 'all' : undefined
  })
  const page = readPage(resp)
  myRows.value = page.records.map((item) => mapLeadRow(item, 'my'))
  myPageTotal.value = page.total
}

async function loadTodayLeads() {
  const keyword = filters.keyword.trim()
  const resp: any = await leadApi.todoFollow({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    keyword: keyword || undefined,
    source: filters.source ?? undefined,
    followStatus: filters.followStatus || undefined,
    scope: myScope.value === 'all' ? 'all' : undefined
  })
  const page = readPage(resp)
  todayRows.value = page.records.map((item) => mapLeadRow(item, 'today'))
  todayPageTotal.value = page.total
}

async function loadWarningLeads() {
  const keyword = filters.keyword.trim()
  const resp: any = await leadApi.recycleWarning({
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    keyword: keyword || undefined,
    source: filters.source ?? undefined,
    followStatus: filters.followStatus || undefined,
    scope: myScope.value === 'all' ? 'all' : undefined
  })
  const page = readPage(resp)
  warningRows.value = page.records.map((item) => mapLeadRow(item, 'warning'))
  warningPageTotal.value = page.total
}

// 意向等级和四个指标由后端按全量数据聚合,不再拉前1000条到前端自行数。
const levelCounts = reactive<Record<string, number>>({ A: 0, B: 0, C: 0, D: 0, E: 0, none: 0 })
async function loadSummary() {
  try {
    const resp: any = await leadApi.workbenchSummary(myScope.value === 'all' ? { scope: 'all' } : undefined)
    const data = resp?.data ?? resp ?? {}
    myLeadTotal.value = Number(data.myLeadTotal || 0)
    todayTotal.value = Number(data.todoTotal || 0)
    warningTotal.value = Number(data.warningTotal || 0)
    convertingCount.value = Number(data.followingCount || 0)
    Object.assign(levelCounts, { A: 0, B: 0, C: 0, D: 0, E: 0, none: 0 }, data.levelCounts || {})
  } catch { /* 统计失败不影响主流程 */ }
}

async function loadCurrentQueue() {
  loading.value = true
  try {
    if (activeQueue.value === 'today') await loadTodayLeads()
    else if (activeQueue.value === 'warning') await loadWarningLeads()
    else await loadMyLeads()
  } catch {
    ElMessage.error('线索数据加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

async function reloadAll(showMessage = true) {
  loading.value = true
  try {
    await Promise.all([loadMyLeads(), loadTodayLeads(), loadWarningLeads(), loadSummary()])
    if (showMessage) ElMessage.success('已刷新线索工作台')
  } catch {
    ElMessage.error('刷新失败，请检查网络或后端服务')
  } finally {
    loading.value = false
  }
}

function goPool() {
  router.push({ path: '/customer/lead', query: { tab: 'pool' } })
}

// 新建线索:跳公司资源库并触发新建弹窗(复用同一套完整表单,和公司资源库一致)
function goCreate() {
  router.push({ path: '/customer/lead', query: { create: '1' } })
}

function openCustomer360(row: LeadRow) {
  customer360LeadId.value = row.id
  customer360Visible.value = true
}

async function handleCustomer360Changed() {
  await reloadAll(false)
}

function handleCustomer360Dial(payload: { leadId: number; phone: string }) {
  customer360Visible.value = false
  call(payload.phone)
}

// ====== 编辑线索 ======
const editDialog = reactive<{ visible: boolean; saving: boolean; form: any }>({
  visible: false,
  saving: false,
  form: {}
})
async function openEdit(row: LeadRow) {
  try {
    // 拉详情拿到完整字段(公司/联系人/法人/电话等)
    const resp: any = await leadApi.detail(row.id)
    const d = resp?.data ?? resp ?? {}
    editDialog.form = {
      id: d.id ?? row.id,
      company: d.company || d.companyName || '',
      name: d.name || '',
      legalPerson: d.legalPerson || '',
      phone: d.phone || '',
      customerLevel: d.customerLevel || '',
      remark: d.remark || ''
    }
  } catch {
    // 详情接口失败时,用列表已有信息兜底
    editDialog.form = {
      id: row.id,
      company: row.companyName === '未命名线索' ? '' : row.companyName,
      name: row.contactName === '-' ? '' : row.contactName,
      legalPerson: '',
      phone: row.phone || '',
      customerLevel: normalizeIntentLevel(row.customerLevel),
      remark: ''
    }
  }
  editDialog.visible = true
}
async function saveEdit() {
  if (!String(editDialog.form.company || '').trim()) {
    ElMessage.warning('请填写公司名称')
    return
  }
  editDialog.saving = true
  try {
    await leadApi.update(editDialog.form)
    ElMessage.success('已保存')
    editDialog.visible = false
    await loadCurrentQueue()
    loadSummary()
  } catch {
    ElMessage.error('保存失败,请稍后重试')
  } finally {
    editDialog.saving = false
  }
}

async function onRelease(row: LeadRow) {
  try {
    const { value } = await ElMessageBox.prompt(
      `确定把「${row.companyName}」释放回公司公海?释放后该客户回到公海、其他同事可领取。`,
      '释放回公司公海',
      {
        confirmButtonText: '确定释放',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '释放原因(可选)'
      }
    )
    await leadApi.returnToPool([row.id], (value || '').trim() || '主动释放')
    ElMessage.success('已释放回公司公海')
    await reloadAll(false)
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error('释放失败,请稍后再试')
  }
}

async function onInvalid(row: LeadRow) {
  try {
    const { value } = await ElMessageBox.prompt(
      `请填写「${row.companyName}」为什么是无效资源(必填),便于后续复盘分析。`,
      '标记为无效资源',
      {
        confirmButtonText: '确定标记',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '例如:空号/非目标客户/已被同行签约/明确拒绝…',
        inputValidator: (v: string) => (v && v.trim() ? true : '请填写无效原因'),
        inputErrorMessage: '请填写无效原因'
      }
    )
    await leadApi.markInvalid(row.id, (value || '').trim())
    ElMessage.success('已标记为无效资源')
    await reloadAll(false)
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error('标记失败,请稍后再试')
  }
}

async function onConvert(row: LeadRow) {
  try {
    await ElMessageBox.confirm(
      `确认把「${row.companyName}」转为正式客户？系统会建立客户档案和主联系人，并结束线索阶段。`,
      '转为正式客户',
      {
        confirmButtonText: '确认转客户',
        cancelButtonText: '取消',
        type: 'success'
      }
    )
    await leadApi.convert(row.id)
    ElMessage.success('已转为正式客户，可进入客户档案继续签约与交付')
    await reloadAll(false)
  } catch (e) {
    if (e !== 'cancel' && e !== 'close') ElMessage.error('转客户失败，请稍后重试')
  }
}

function handleRowAction(command: string, row: LeadRow) {
  if (command === 'customer360') openCustomer360(row)
  else if (command === 'history') openHistory(row)
  else if (command === 'edit') void openEdit(row)
  else if (command === 'convert') void onConvert(row)
  else if (command === 'release') void onRelease(row)
  else if (command === 'invalid') void onInvalid(row)
}

function call(phone: string) {
  if (!phone) {
    ElMessage.warning('该客户暂无电话')
    return
  }
  // 手机/平板:直接调起系统拨号
  const isMobile = /Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(navigator.userAgent)
  if (isMobile) {
    window.location.href = `tel:${phone}`
    return
  }
  // 先试云客点击拨打(通知当前坐席的云客工作手机拨号);未开通/不在线再降级到复制号码
  const first = String(phone).split(/[,，、/\s]+/)[0]
  yunkeApi.dial({ phone: first }).then((res: any) => {
    const d = res?.data ?? res
    ElMessage.success(d?.message || '已通知工作手机拨号,请留意手机')
  }).catch((e: any) => {
    ElMessageBox.confirm(`云客拨号未发起(${e?.message || '当前账号未开通外呼或工作手机不在线'})。可复制号码手动拨:${phone}`, '拨打客户', {
      confirmButtonText: '复制号码',
      cancelButtonText: '关闭',
      type: 'warning'
    })
      .then(async () => {
        try {
          await navigator.clipboard.writeText(phone)
          ElMessage.success('号码已复制,可粘贴到拨号软件')
        } catch {
          ElMessage.warning(`请手动复制:${phone}`)
        }
      })
      .catch(() => {})
  })
}

// 写跟进弹窗里展示的"最近跟进"(最多3条),边看历史边写
const followRecent = ref<any[]>([])

function openFollow(row: LeadRow) {
  followDialog.row = row
  followDialog.visible = true
  Object.assign(followForm, {
    type: 1,
    content: '',
    nextTime: '',
    nextContent: '',
    customerLevel: normalizeIntentLevel(row.customerLevel),
    followStatus: row.followStatus || lifecycleStage(row.status),
    nextActionType: row.nextActionType || '电话'
  })
  followFormRef.value?.clearValidate()
  // 异步拉取最近跟进(不阻塞弹窗打开)
  followRecent.value = []
  leadApi
    .followHistory(row.id)
    .then((resp: any) => {
      const list = resp?.data ?? resp
      followRecent.value = (Array.isArray(list) ? list : [])
        .sort((a, b) => String(b.createTime || '').localeCompare(String(a.createTime || '')))
        .slice(0, 3)
    })
    .catch(() => {
      followRecent.value = []
    })
}

// 跟进历史:点公司名查看该线索的全部跟进记录(按时间倒序)
const historyDialog = reactive({
  visible: false,
  loading: false,
  row: null as LeadRow | null
})
const historyList = ref<any[]>([])

async function openHistory(row: LeadRow) {
  historyDialog.row = row
  historyDialog.visible = true
  historyDialog.loading = true
  historyList.value = []
  try {
    const resp: any = await leadApi.followHistory(row.id)
    const list = resp?.data ?? resp
    historyList.value = (Array.isArray(list) ? list : []).sort(
      (a, b) => String(b.createTime || '').localeCompare(String(a.createTime || ''))
    )
  } catch {
    historyList.value = []
  } finally {
    historyDialog.loading = false
  }
}

function writeFromHistory() {
  const row = historyDialog.row
  historyDialog.visible = false
  if (row) openFollow(row)
}

function followTypeLabel(type?: number) {
  const map: Record<number, string> = { 1: '电话', 2: '微信', 3: '面谈', 4: '邮件', 5: '其他' }
  return type ? map[type] || '其他' : '跟进'
}

function fmtFollowTime(value?: string) {
  if (!value) return ''
  return String(value).replace('T', ' ').slice(0, 16)
}

async function submitFollow() {
  if (!followDialog.row || !followFormRef.value) return
  await followFormRef.value.validate(async (valid) => {
    if (!valid || !followDialog.row) return
    followDialog.saving = true
    try {
      await leadApi.follow(followDialog.row.id, {
        type: followForm.type,
        content: followForm.content.trim(),
        nextTime: followMovesToHistory.value ? undefined : (followForm.nextTime || undefined),
        nextContent: followMovesToHistory.value ? undefined : (followForm.nextContent || undefined),
        followStatus: followForm.followStatus,
        customerLevel: followForm.customerLevel || undefined,
        nextActionType: followMovesToHistory.value ? undefined : followForm.nextActionType
      })
      ElMessage.success(followMovesToHistory.value ? '跟进已保存，客户已进入历史客资' : '跟进记录已保存')
      followDialog.visible = false
      if (followMovesToHistory.value) {
        await reloadAll()
        return
      }
      // 不整表重拉(会按跟进时间/分级重排、打乱正在跟进的顺序),就地更新当前行即可
      const r = followDialog.row
      if (r) {
        if (followForm.customerLevel) r.customerLevel = followForm.customerLevel
        r.followStatus = followForm.followStatus
        r.nextActionType = followForm.nextActionType
        r.lastFollowTime = fmtDate(new Date().toISOString())
        if (followForm.nextTime) {
          r.nextFollowTime = fmtDate(followForm.nextTime)
          r.nextActionTime = fmtDate(followForm.nextTime)
        }
      }
      loadSummary()
    } catch {
      ElMessage.error('保存失败，请稍后重试')
    } finally {
      followDialog.saving = false
    }
  })
}

watch(
  () => route.query.section,
  (value) => {
    const next = normalizeQueue(value)
    if (next !== activeQueue.value) {
      activeQueue.value = next
      loadCurrentQueue()
    }
  }
)

onMounted(() => {
  reloadAll(false)
})
</script>

<style lang="scss" scoped>
.my-leads-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px 20px 28px;
  background: #f5f7fb;
  min-height: calc(100vh - 60px);
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  padding: 18px 20px;
  background: #ffffff;
  border: 1px solid #e1e8f3;
  border-radius: 8px;

  .metric-label {
    display: block;
    color: #667085;
    font-size: 13px;
  }

  strong {
    display: block;
    margin: 8px 0 4px;
    font-size: 30px;
    color: #172033;
  }

  small {
    color: #8a94a6;
    font-size: 12px;
  }

  &.is-blue strong { color: #3370ff; }
  &.is-red strong { color: #f04438; }
  &.is-green strong { color: #16a34a; }
}

.level-strip {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  padding: 12px 18px;
  background: #ffffff;
  border: 1px solid #e1e8f3;
  border-radius: 8px;

  .level-strip-title { font-size: 14px; font-weight: 600; color: #172033; }
  .level-chips { display: flex; gap: 10px; flex-wrap: wrap; }
  .level-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: #f5f7fb;
    border: 1px solid #e1e8f3;

    em {
      font-style: normal;
      font-weight: 700;
      width: 20px;
      height: 20px;
      line-height: 20px;
      text-align: center;
      border-radius: 5px;
      color: #fff;
      font-size: 12px;
      background: #98a2b3;
    }
    .level-chip-label { color: #667085; font-size: 13px; }
    strong { font-size: 18px; color: #172033; }

    &.lv-A em { background: #f04438; }
    &.lv-B em { background: #f79009; }
    &.lv-C em { background: #3370ff; }
    &.lv-D em { background: #667085; }
    &.lv-E em { background: #b0b7c3; }
    &.lv-none em { background: #cbd5e1; color: #667085; }
  }
  .level-strip-hint { color: #8a94a6; font-size: 12px; margin-left: auto; }
}

.follow-level-hint {
  display: block;
  margin-top: 4px;
  color: #8a94a6;
  font-size: 12px;
}

.history-body {
  max-height: 52vh;
  overflow-y: auto;
  padding-top: 6px;

  .history-content { margin: 6px 0 4px; color: #172033; white-space: pre-wrap; line-height: 1.5; }
  .history-next { margin: 0; font-size: 12px; color: #8a94a6; }
}

.follow-recent {
  margin: 0 0 14px;
  padding: 10px 14px;
  background: #f5f7fb;
  border-radius: 8px;
  border: 1px solid #e1e8f3;

  .follow-recent-title { font-size: 12px; color: #8a94a6; margin-bottom: 6px; }
  .follow-recent-item {
    display: flex;
    align-items: baseline;
    gap: 8px;
    font-size: 13px;
    padding: 3px 0;

    .fr-time { color: #8a94a6; flex-shrink: 0; font-size: 12px; }
    .fr-content { color: #172033; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
}

.workbench-layout {
  display: block;
}

.main-panel {
  background: #ffffff;
  border: 1px solid #e1e8f3;
  border-radius: 12px;
}

.main-panel {
  padding: 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: #172033;
    font-size: 20px;
  }

  p {
    margin: 6px 0 0;
    color: #667085;
    font-size: 13px;
  }
}

.panel-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.search-input {
  width: 240px;
}

.small-select {
  width: 120px;
}

.queue-tabs {
  display: flex;
  gap: 8px;
  padding: 4px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: #f3f6fb;

  button {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #475467;
    height: 38px;
    cursor: pointer;

    em {
      min-width: 22px;
      padding: 1px 7px;
      border-radius: 999px;
      background: #e6edf8;
      color: #3370ff;
      font-style: normal;
      font-size: 12px;
      font-weight: 600;
    }

    &.active {
      background: #ffffff;
      color: #1f5eff;
      box-shadow: 0 2px 8px rgba(20, 38, 68, 0.08);
    }
  }
}

.lead-table {
  border: 1px solid #edf1f7;
  border-radius: 8px;
  overflow: hidden;

  :deep(th.el-table__cell) {
    background: #f8fafd;
    color: #667085;
    font-weight: 600;
  }
}

.avatar {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(135deg, #3370ff, #7aa2ff);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;

  &.large {
    width: 44px;
    height: 44px;
    border-radius: 12px;
  }
}

.company-name {
  border: 0;
  padding: 0;
  background: transparent;
  color: #1f5eff;
  font-weight: 600;
  cursor: pointer;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.phone-cell {
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  user-select: text;
}

.next-follow {
  color: #1f5eff;
}

.release-date {
  color: #f04438;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 8px;

  .el-button {
    margin-left: 0;
    font-size: 14px;
    padding: 0;
    height: auto;
  }
}

.next-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}
.next-cell small {
  color: #667085;
  font-size: 13px;
}
.deadline-pill {
  display: inline-flex;
  align-items: center;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;

  &.deadline-danger { background: #fff1f0; color: #f04438; }
  &.deadline-warning { background: #fff7e6; color: #d97706; }
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  font-size: 13px;
}
.batch-bar b { color: var(--el-color-primary); }

.scope-switch {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.scope-switch .scope-label { font-size: 13px; color: var(--el-text-color-secondary); }
.scope-switch .scope-tip { font-size: 12px; color: var(--el-text-color-placeholder); }
.table-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  color: #667085;
  font-size: 13px;
}

.follow-target {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin-bottom: 14px;
  border-radius: 8px;
  background: #f6f9ff;

  strong {
    color: #172033;
  }

  p {
    margin: 4px 0 0;
    color: #667085;
    font-size: 13px;
  }
}

:global(.sales-task-dialog) {
  display: flex;
  flex-direction: column;
  max-height: 85vh;
  margin: auto !important;
}

:global(.sales-task-dialog .el-dialog__header) {
  flex: 0 0 auto;
  margin: 0;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #e9edf3;
}

:global(.sales-task-dialog .el-dialog__title) {
  color: #172033;
  font-size: 20px;
  font-weight: 700;
}

:global(.sales-task-dialog .el-dialog__body) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  padding: 18px 24px;
  font-size: 15px;
}

:global(.sales-task-dialog .el-dialog__footer) {
  flex: 0 0 auto;
  padding: 14px 24px 18px;
  border-top: 1px solid #e9edf3;
}

:global(.sales-task-dialog .el-form-item__label),
:global(.sales-task-dialog .el-input__inner),
:global(.sales-task-dialog .el-textarea__inner) {
  font-size: 15px;
}

:global(.sales-task-dialog .el-input__wrapper),
:global(.sales-task-dialog .el-select__wrapper) {
  min-height: 40px;
}

:global(.sales-task-dialog .el-dialog__footer .el-button) {
  min-width: 88px;
  min-height: 40px;
  font-size: 15px;
}

@media (max-width: 1280px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workbench-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .panel-head,
  .table-foot {
    flex-direction: column;
    align-items: flex-start;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }

  .queue-tabs,
  .panel-tools {
    width: 100%;
    flex-wrap: wrap;
  }

  .search-input,
  .small-select {
    width: 100%;
  }
}
</style>

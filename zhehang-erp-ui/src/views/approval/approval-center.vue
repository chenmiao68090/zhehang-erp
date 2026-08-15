<template>
  <!-- ============ 飞书(Lark)风格审批中心:左导航 / 中列表 / 右详情 三栏工作台 ============ -->
  <div class="lk-approval" :class="{ 'is-mobile-detail': isMobile && selectedRow && activeTab !== 'initiate' }">
    <!-- ---------- 左栏:待办 / 已办 / 抄送我 / 已发起 / 全公司 / 发起申请 ---------- -->
    <aside class="lk-nav">
      <div class="lk-nav__title">审批中心</div>
      <div
        v-for="nav in NAV_TABS"
        :key="nav.key"
        class="lk-nav__item"
        :class="{ 'is-active': activeTab === nav.key }"
        @click="switchTab(nav.key)"
      >
        <el-icon class="lk-nav__icon"><component :is="nav.icon" /></el-icon>
        <span class="lk-nav__label">{{ nav.label }}</span>
        <span v-if="navBadge(nav.key)" class="lk-nav__badge">{{ navBadge(nav.key) }}</span>
      </div>
    </aside>

    <!-- ---------- 发起申请:整块占据中+右栏(发起目录 + 发起弹窗) ---------- -->
    <ApprovalInitiate v-if="activeTab === 'initiate'" ref="initiateRef" class="lk-initiate" @submitted="onInitiateSubmitted" />

    <!-- ---------- 中栏:搜索 + 筛选 + 排序 + 审批卡片列表 ---------- -->
    <section v-show="activeTab !== 'initiate'" class="lk-list">
      <div class="lk-list__toolbar">
        <el-input
          v-model="keyword"
          placeholder="搜索"
          clearable
          size="default"
          class="lk-search"
          :prefix-icon="Search"
        />
        <el-dropdown trigger="click" class="lk-filter" @command="onTimeFilter">
          <span class="lk-filter__btn">
            {{ timeFilterLabel }}
            <el-icon class="lk-filter__caret"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="all">所有时间</el-dropdown-item>
              <el-dropdown-item command="week">最近一周</el-dropdown-item>
              <el-dropdown-item command="month">最近一月</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-tooltip :content="sortAsc ? '最早优先' : '最新优先'" placement="top">
          <span class="lk-sort" @click="sortAsc = !sortAsc">
            <el-icon><Sort /></el-icon>
          </span>
        </el-tooltip>
        <!-- 批量审批:仅待办可用,勾选多条一键同意 -->
        <el-button v-if="activeTab === 'todo'" size="small" :type="batchMode ? 'primary' : 'default'" plain @click="toggleBatch">
          {{ batchMode ? '退出批量' : '批量' }}
        </el-button>
      </div>

      <div v-loading="listLoading" class="lk-list__scroll">
        <template v-if="visibleList.length">
          <div
            v-for="row in visibleList"
            :key="rowKey(row)"
            class="lk-card"
            :class="{ 'is-active': isSelected(row), 'is-checked': batchMode && batchIds.includes(row.id) }"
            @click="batchMode ? toggleBatchPick(row) : selectRow(row)"
          >
            <div class="lk-card__head">
              <el-checkbox
                v-if="batchMode && activeTab === 'todo'"
                :model-value="batchIds.includes(row.id)"
                class="lk-card__check"
                @click.stop="toggleBatchPick(row)"
              />
              <span class="lk-card__title">{{ cardTitle(row) }}</span>
              <el-tag
                size="small"
                effect="light"
                :style="cardTagStyle(row)"
                class="lk-card__status"
              >{{ cardStatusText(row) }}</el-tag>
            </div>

            <div v-if="cardFields(row).length" class="lk-card__fields">
              <div v-for="f in cardFields(row)" :key="f.label" class="lk-card__field">
                <span class="lk-card__field-label">{{ f.label }}</span>
                <span class="lk-card__field-value" :class="{ 'lk-card__field-value--money': f.money }">{{ f.value }}</span>
              </div>
            </div>

            <div class="lk-card__foot">
              <span class="lk-avatar lk-avatar--sm" :style="avatarStyle(cardInitiator(row))">
                {{ avatarChar(cardInitiator(row)) }}
              </span>
              <span class="lk-card__initiator">{{ cardInitiator(row) }}</span>
              <span class="lk-card__time">{{ relativeTime(row.startTime) }}到达</span>
            </div>
          </div>
        </template>
        <el-empty v-else :description="emptyText" :image-size="90" />
      </div>
      <!-- 批量操作栏 -->
      <div v-if="batchMode && activeTab === 'todo'" class="lk-batchbar">
        <el-checkbox :model-value="allPicked" :indeterminate="somePicked" @change="toggleBatchAll">全选本页</el-checkbox>
        <span class="lk-batchbar__count">已选 {{ batchIds.length }}</span>
        <el-button type="primary" size="small" :disabled="!batchIds.length" :loading="batching" @click="doBatchApprove">批量同意</el-button>
      </div>
      <div v-else class="lk-list__pager">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="totals[activeTab]"
          layout="total, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          small
          @change="() => loadList()"
        />
      </div>
    </section>

    <!-- ---------- 右栏:详情(审批详情 / 审批记录 / 全文评论) ---------- -->
    <section v-show="activeTab !== 'initiate'" class="lk-detail">
      <!-- 手机端:详情顶部返回列表 -->
      <div v-if="isMobile" class="lk-detail__back" @click="selectedRow = null; detailInstance = null">
        <el-icon><ArrowLeft /></el-icon> 返回列表
      </div>
      <template v-if="detailLoading">
        <div class="lk-detail__loading"><el-skeleton :rows="8" animated /></div>
      </template>

      <template v-else-if="detailInstance">
        <!-- 顶部:编号 + 标题 + 状态 + 发起人 -->
        <header class="lk-detail__header">
          <div class="lk-detail__no">编号 {{ detailInstanceId }}</div>
          <div class="lk-detail__titleline">
            <h2 class="lk-detail__title">{{ detailInstance.title || detailInstance.processName }}</h2>
            <el-tag
              size="default"
              effect="light"
              :style="statusTagStyle(detailInstance.status)"
              class="lk-detail__status"
            >{{ statusText(detailInstance.status) }}</el-tag>
          </div>
          <div class="lk-detail__meta">
            <span class="lk-avatar" :style="avatarStyle(detailInstance.initiatorName)">
              {{ avatarChar(detailInstance.initiatorName) }}
            </span>
            <div class="lk-detail__meta-text">
              <div class="lk-detail__meta-name">
                {{ detailInstance.initiatorName || ('用户' + (detailInstance.initiatorId || '')) }}
                <span v-if="initiatorDept" class="lk-detail__meta-dept">{{ initiatorDept }}</span>
              </div>
              <div class="lk-detail__meta-sub">提交于 {{ formatFullTime(detailInstance.startTime) }}</div>
            </div>
          </div>

          <el-tabs v-model="detailTab" class="lk-detail__tabs">
            <el-tab-pane label="审批详情" name="form" />
            <el-tab-pane label="审批记录" name="track" />
          </el-tabs>
        </header>

        <!-- 详情内容(独立滚动) -->
        <div class="lk-detail__body">
          <!-- 审批详情 -->
          <div v-show="detailTab === 'form'" class="lk-form">
            <template v-if="detailDisplayEntries.length">
              <div v-for="item in detailDisplayEntries" :key="item.key" class="lk-form__row">
                <span class="lk-form__label">{{ item.label }}</span>
                <span class="lk-form__value" :class="{ 'lk-form__value--money': item.money }">{{ item.value }}</span>
              </div>
            </template>

            <!-- 附件:真文件(walk file模块,带token预览/下载);老单里的内嵌图片附件兼容展示 -->
            <div v-if="detailAttachments.length || realAttachments.length" class="lk-form__attach">
              <div class="lk-form__attach-title">附件</div>
              <div class="lk-form__attach-grid">
                <template v-for="f in realAttachments" :key="'real-' + f.id">
                  <el-image
                    v-if="attachmentPreviews[f.fileId]"
                    :src="attachmentPreviews[f.fileId]"
                    :preview-src-list="realPreviewList"
                    fit="cover"
                    class="lk-form__attach-img"
                    preview-teleported
                  />
                  <div v-else class="lk-form__attach-file lk-form__attach-file--clickable" @click="downloadFileById(f.fileId, f.fileName)">
                    <el-icon :size="22"><Document /></el-icon>
                    <span>{{ f.fileName }}</span>
                  </div>
                </template>
                <el-image
                  v-for="(f, i) in detailAttachments"
                  :key="'legacy-' + i"
                  :src="f.url"
                  :preview-src-list="detailAttachments.map(a => a.url)"
                  :initial-index="i"
                  fit="cover"
                  class="lk-form__attach-img"
                  preview-teleported
                >
                  <template #error>
                    <div class="lk-form__attach-file">
                      <el-icon :size="22"><Document /></el-icon>
                      <span>{{ f.name }}</span>
                    </div>
                  </template>
                </el-image>
              </div>
            </div>

            <el-empty
              v-if="!detailDisplayEntries.length && !detailAttachments.length"
              description="无表单数据"
              :image-size="70"
            />
          </div>

          <!-- 审批记录 -->
          <div v-show="detailTab === 'track'" class="lk-track">
            <ApprovalTrack
              :histories="detailInstance.histories || []"
              :current-node-name="detailInstance.currentNodeName"
              :process-config="(detailInstance as any).processConfig"
              :current-assignee-name="detailInstance.currentAssigneeName"
              :current-assignee-names="(detailInstance as any).currentAssigneeNames || []"
              :initiator-name="detailInstance.initiatorName"
              :cc-names="(detailInstance as any).ccNames || []"
              :current-task-id="(detailInstance as any).currentTaskId"
              :can-urge="activeTab === 'started' && detailInstance.status === 0"
            />
          </div>

        </div>

        <!-- 底部操作栏:待办显示审批动作；已发起显示撤销/重新提交/删除 -->
        <footer v-if="activeTab === 'todo' && selectedTaskId" class="lk-actions">
          <el-button type="primary" :icon="Select" :loading="acting" @click="doApprove">同意</el-button>
          <el-button type="danger" :icon="CloseBold" :loading="acting" @click="doReject">拒绝</el-button>
          <el-button type="warning" plain :icon="RefreshLeft" :loading="acting" @click="doReturn">退回修改</el-button>
          <el-button :icon="Promotion" @click="openCc">抄送</el-button>
          <el-button :icon="Switch" @click="openTransfer">转交</el-button>
        </footer>
        <footer v-else-if="activeTab === 'started' && selectedRow" class="lk-actions">
          <el-button
            v-if="detailInstance.status === 4"
            type="primary"
            :icon="EditPen"
            @click="goResubmit"
          >修改并重新提交</el-button>
          <el-button v-if="detailInstance.status === 0 || detailInstance.status === 4" type="warning" :loading="acting" @click="cancelStarted">撤销申请</el-button>
          <el-button v-if="detailInstance.status !== 0 && detailInstance.status !== 4" type="danger" :loading="acting" @click="deleteStarted">删除记录</el-button>
        </footer>
      </template>

      <!-- 未选中任何项 -->
      <template v-else>
        <div class="lk-detail__empty">
          <el-empty description="选择左侧审批查看详情" :image-size="120" />
        </div>
      </template>
    </section>

    <!-- 抄送弹窗 -->
    <el-dialog v-model="ccDlg.visible" title="抄送给同事" width="420px" append-to-body>
      <el-select v-model="ccDlg.userIds" multiple filterable placeholder="选择要抄送的同事(可多选)" style="width: 100%">
        <el-option v-for="c in colleagues" :key="c.userId" :label="c.name + (c.deptName ? ' · ' + c.deptName : '')" :value="c.userId" />
      </el-select>
      <div style="margin-top: 10px; font-size: 12px; color: var(--el-text-color-secondary)">抄送后,对方在「抄送我」里可以看到这条审批。</div>
      <template #footer>
        <el-button @click="ccDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="ccDlg.saving" @click="submitCc">确认抄送</el-button>
      </template>
    </el-dialog>

    <!-- 转交弹窗 -->
    <el-dialog v-model="transferDlg.visible" title="转交审批" width="420px" append-to-body>
      <el-select v-model="transferDlg.userId" filterable placeholder="选择转交给谁" style="width: 100%">
        <el-option v-for="c in colleagues" :key="c.userId" :label="c.name + (c.deptName ? ' · ' + c.deptName : '')" :value="c.userId" />
      </el-select>
      <el-input v-model="transferDlg.comment" type="textarea" :rows="2" placeholder="转交说明(可选)" style="margin-top: 10px" />
      <template #footer>
        <el-button @click="transferDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="transferDlg.saving" @click="submitTransfer">确认转交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, ArrowDown, Sort, Document, Select, CloseBold, RefreshLeft, EditPen,
  Promotion, Switch, Clock, Finished, Bell, Promotion as PromotionIcon, DataAnalysis,
  ArrowLeft
} from '@element-plus/icons-vue'
import ApprovalTrack from '@/components/workflow/ApprovalTrack.vue'
import ApprovalInitiate from '@/views/approval/index.vue'
import { approvalCenterApi, type TaskItem, type InstanceItem } from '@/api/approval'
import { taskApi } from '@/api/workflow'
import { get } from '@/api/request'
import { hasRole } from '@/utils/permission'
import { downloadFileById, objectUrlForFile } from '@/utils/download'

// ===================== 左栏导航定义 =====================
type TabKey = 'todo' | 'done' | 'cc' | 'started' | 'admin' | 'initiate'
// 全公司监控:限老板/管理员/HR(后端 admin/list 同样门禁,前端只是入口显隐)
const canMonitor = hasRole(['boss', 'hr', 'super_admin'])
const NAV_TABS: { key: TabKey; label: string; icon: any }[] = [
  { key: 'initiate', label: '发起申请', icon: EditPen },
  { key: 'todo', label: '待办', icon: Clock },
  { key: 'done', label: '已办', icon: Finished },
  { key: 'cc', label: '抄送我', icon: Bell },
  { key: 'started', label: '已发起', icon: PromotionIcon },
  ...(canMonitor ? [{ key: 'admin' as TabKey, label: '全公司', icon: DataAnalysis }] : [])
]

// 发起申请子组件引用(双页合一:发起目录并入审批中心)
const initiateRef = ref<any>(null)
function onInitiateSubmitted () {
  loadCounts()
  // 提交后跳到"已发起"看进度
  switchTab('started')
}

// 移动端(<768px):三栏折叠为"列表→详情"两级导航
const isMobile = ref(false)
let mql: MediaQueryList | null = null
function syncMobile () { isMobile.value = !!mql && mql.matches }

const activeTab = ref<TabKey>('todo')
const keyword = ref('')
const sortAsc = ref(false)
const timeFilter = ref<'all' | 'week' | 'month'>('all')
const timeFilterLabel = computed(() => (
  { all: '所有时间', week: '最近一周', month: '最近一月' }[timeFilter.value]
))

// 各列表的数据与总数(服务端分页)
const listLoading = ref(false)
const list = ref<any[]>([])
const totals = reactive<Record<TabKey, number>>({ todo: 0, done: 0, cc: 0, started: 0, admin: 0 })
const pageNum = ref(1)
const pageSize = ref(20)
// 四tab角标:一次性计数接口,不再"点进才有数"(全公司监控不占角标)
const badges = reactive<Record<TabKey, number>>({ todo: 0, done: 0, cc: 0, started: 0, admin: 0, initiate: 0 })

const emptyText = computed(() => (
  { todo: '暂无待办审批', done: '暂无已办记录', cc: '暂无抄送记录', started: '暂无发起记录', admin: '全公司暂无审批' }[activeTab.value]
))

function navBadge (key: TabKey): string {
  const n = badges[key]
  if (!n) return ''
  return n > 99 ? '99+' : String(n)
}

async function loadCounts () {
  try {
    const res: any = await taskApi.counts()
    const c = (res && typeof res === 'object' && 'data' in res) ? res.data : res
    if (c) {
      badges.todo = Number(c.todo || 0)
      badges.done = Number(c.done || 0)
      badges.cc = Number(c.cc || 0)
      badges.started = Number(c.started || 0)
    }
  } catch { /* 角标失败不打扰 */ }
}

// ===================== 选中项 + 详情 =====================
const selectedRow = ref<any | null>(null)
const detailInstance = ref<InstanceItem | null>(null)
const detailLoading = ref(false)
const detailTab = ref<'form' | 'track'>('form')

/** 实例ID:已发起/全公司列表项本身是实例(row.id);待办/已办/抄送项是任务(取 row.instanceId) */
function instanceIdOf (row: any): number {
  return (activeTab.value === 'started' || activeTab.value === 'admin') ? row.id : row.instanceId
}
/** 当前选中项对应的任务ID(仅待办需要):待办列表行本身就是 task,id 即 taskId */
const selectedTaskId = computed<number | null>(() => {
  if (activeTab.value !== 'todo' || !selectedRow.value) return null
  return (selectedRow.value as TaskItem).id ?? null
})
const detailInstanceId = computed(() => (selectedRow.value ? instanceIdOf(selectedRow.value) : ''))

function rowKey (row: any): string {
  return `${activeTab.value}-${row.id}-${row.instanceId ?? ''}`
}
function isSelected (row: any): boolean {
  return !!selectedRow.value && rowKey(selectedRow.value) === rowKey(row)
}

// ===================== 列表加载(搜索/时间/分页全部服务端) =====================
/** 时间筛选 → 起始日期(yyyy-MM-dd);all 不传 */
function timeFilterStartDate (): string | undefined {
  if (timeFilter.value === 'all') return undefined
  const days = timeFilter.value === 'week' ? 7 : 30
  const d = new Date(Date.now() - days * 86400000)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadList (preserveSelection = false) {
  const tab = activeTab.value
  if (tab === 'initiate') return // 发起申请是独立子组件,不走列表加载
  listLoading.value = true
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value.trim() || undefined,
      startDate: timeFilterStartDate()
    }
    let res: { list: any[]; total: number }
    if (tab === 'todo') res = await approvalCenterApi.todo(params)
    else if (tab === 'done') res = await approvalCenterApi.done(params)
    else if (tab === 'cc') res = await approvalCenterApi.cc(params)
    else if (tab === 'admin') {
      const raw: any = await get('/workflow/instance/admin/list', params)
      const payload: any = (raw && typeof raw === 'object' && 'data' in raw) ? raw.data : raw
      res = { list: payload?.records || [], total: Number(payload?.total || 0) }
    } else res = await approvalCenterApi.started(params)
    list.value = res.list || []
    totals[tab] = res.total || 0
  } catch {
    list.value = []
    totals[tab] = 0
  }
  listLoading.value = false

  // 默认选中第一条(或保持当前选中刷新详情)
  if (preserveSelection && selectedRow.value) {
    const same = list.value.find(r => rowKey(r) === rowKey(selectedRow.value))
    if (same) { selectRow(same); return }
  }
  if (visibleList.value.length) selectRow(visibleList.value[0])
  else { selectedRow.value = null; detailInstance.value = null }
}

// ===================== 批量审批(仅待办) =====================
const batchMode = ref(false)
const batchIds = ref<number[]>([])
const batching = ref(false)
const allPicked = computed(() => visibleList.value.length > 0 && visibleList.value.every(r => batchIds.value.includes(r.id)))
const somePicked = computed(() => batchIds.value.length > 0 && !allPicked.value)
function toggleBatch () {
  batchMode.value = !batchMode.value
  batchIds.value = []
}
function toggleBatchPick (row: any) {
  const i = batchIds.value.indexOf(row.id)
  if (i >= 0) batchIds.value.splice(i, 1)
  else batchIds.value.push(row.id)
}
function toggleBatchAll (v: any) {
  batchIds.value = v ? visibleList.value.map(r => r.id) : []
}
async function doBatchApprove () {
  if (!batchIds.value.length) return
  try {
    await ElMessageBox.confirm(`确认批量同意选中的 ${batchIds.value.length} 条待办?`, '批量同意', { type: 'warning' })
  } catch { return }
  batching.value = true
  try {
    const res: any = await taskApi.batchApprove(batchIds.value.slice())
    const d = (res && typeof res === 'object' && 'data' in res) ? res.data : res
    const ok = d?.success ?? 0
    const failed = (d?.failed || []) as string[]
    if (failed.length) ElMessage.warning(`成功 ${ok} 条,${failed.length} 条未通过:${failed[0]}`)
    else ElMessage.success(`已批量同意 ${ok} 条`)
    batchIds.value = []
    batchMode.value = false
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '批量审批失败')
  }
  batching.value = false
}

function switchTab (key: TabKey) {
  if (activeTab.value === key) return
  activeTab.value = key
  selectedRow.value = null
  detailInstance.value = null
  detailTab.value = 'form'
  pageNum.value = 1
  batchMode.value = false
  batchIds.value = []
  loadList()
}

// 搜索关键字/时间筛选变化 → 防抖后重新从服务端拉第一页
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch([keyword, timeFilter], () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    pageNum.value = 1
    loadList()
  }, 350)
})

async function selectRow (row: any) {
  selectedRow.value = row
  detailTab.value = 'form'
  detailLoading.value = true
  detailInstance.value = null
  try {
    detailInstance.value = await approvalCenterApi.detail(instanceIdOf(row))
  } catch {
    detailInstance.value = null
  }
  detailLoading.value = false
  // 抄送:点开即标记已读,清未读角标
  if (activeTab.value === 'cc' && row && row.id && (row.readFlag === 0 || row.readFlag == null)) {
    try {
      await taskApi.markCcRead(row.id)
      row.readFlag = 1
      if (badges.cc > 0) badges.cc--
    } catch { /* 标记失败不影响查看 */ }
  }
}

function onTimeFilter (cmd: 'all' | 'week' | 'month') {
  timeFilter.value = cmd
}

// ===================== 排序(中栏;搜索/时间筛选已在服务端做) =====================
const visibleList = computed(() => {
  const arr = list.value.slice()
  // 排序(当前页内,按 startTime)
  arr.sort((a, b) => {
    const ta = parseTime(a.startTime) || 0
    const tb = parseTime(b.startTime) || 0
    return sortAsc.value ? ta - tb : tb - ta
  })
  return arr
})

// ===================== 卡片字段渲染 =====================
function cardTitle (row: any): string {
  // 已发起项是实例(用 title);其余是任务(用 instanceTitle),兜底用 processName
  return row.title || row.instanceTitle || row.processName || '审批申请'
}
function cardInitiator (row: any): string {
  return row.initiatorName || (row.initiatorId ? '用户' + row.initiatorId : '未知')
}

/** 卡片状态文案/颜色:已发起按实例 status;待办固定"待处理";已办按"我的操作";抄送固定"抄送" */
/** 全公司监控:进行中且当前任务已过时限 → 超时标红 */
function isOverdue (row: any): boolean {
  if (row.status !== 0 || !row.currentTaskDeadline) return false
  const t = parseTime(row.currentTaskDeadline)
  return !!t && t < Date.now()
}
function cardStatusText (row: any): string {
  if (activeTab.value === 'admin') return isOverdue(row) ? '已超时' : statusText(row.status)
  if (activeTab.value === 'started') return statusText(row.status)
  if (activeTab.value === 'todo') return '待处理'
  if (activeTab.value === 'cc') return '抄送'
  // done:我的操作 1通过/2拒绝/3转交/6退回
  return ({ 1: '已同意', 2: '已拒绝', 3: '已转交', 6: '已退回' } as Record<number, string>)[row.status] || '已处理'
}
function cardTagStyle (row: any) {
  let color = STATUS_COLORS.processing
  if (activeTab.value === 'admin') color = isOverdue(row) ? STATUS_COLORS.rejected : statusColor(row.status)
  else if (activeTab.value === 'started') color = statusColor(row.status)
  else if (activeTab.value === 'todo') color = STATUS_COLORS.processing
  else if (activeTab.value === 'cc') color = STATUS_COLORS.canceled
  else color = ({ 1: STATUS_COLORS.passed, 2: STATUS_COLORS.rejected, 3: STATUS_COLORS.processing } as Record<number, string>)[row.status] || STATUS_COLORS.canceled
  return tagStyleOf(color)
}

/** 卡片摘要 2-3 条关键字段:任务行用服务端抽好的金额/天数;已发起实例行解析 formData */
function cardFields (row: any): { label: string; value: string; money?: boolean }[] {
  const entries: { label: string; value: string; money?: boolean }[] = []
  // 待办/已办/抄送的任务行:服务端已抽好 amount/days(JSON_EXTRACT),卡片直接显示
  if (row.formData == null) {
    if (row.amount != null && row.amount !== '') {
      entries.push({ label: '金额', value: formatMoney(row.amount), money: true })
    }
    if (row.days != null && row.days !== '') {
      entries.push({ label: '天数', value: row.days + '天' })
    }
    if (row.deadline) {
      entries.push({ label: '时限', value: String(row.deadline).slice(5, 16) })
    }
    return entries
  }
  // 已发起实例行:解析 formData
  let parsed: any
  try { parsed = typeof row.formData === 'string' ? JSON.parse(row.formData) : row.formData } catch { return [] }
  if (!parsed || typeof parsed !== 'object') return []
  for (const key of Object.keys(parsed)) {
    if (ALWAYS_HIDDEN_FIELDS.has(key)) continue
    if (key === '__attachmentFileIds') continue
    // totalAmount 与 amount 通常同值(报销汇总),有 amount 时不重复展示
    if (key === 'totalAmount' && parsed.amount != null) continue
    const v = isMoneyField(key) ? formatMoney(parsed[key]) : formatFieldValue(parsed[key])
    if (v === '') continue
    entries.push({ label: fieldLabel(key, row.formConfig), value: v, money: isMoneyField(key) })
    if (entries.length >= 3) break
  }
  return entries
}

// ===================== 表单字段:labelMap / 解析 / 附件(照搬 index.vue) =====================
// 与 index.vue detailFieldLabel 一致的中文 labelMap
const FIELD_LABELS: Record<string, string> = {
  expenseType: '费用类型',
  description: '费用说明',
  leaveType: '请假类型',
  days: '请假天数',
  reason: '申请事由',
  item: '采购物品',
  quantity: '数量',
  sealType: '印章类型',
  usage: '用途说明',
  copies: '份数',
  amount: '申请金额',
  totalAmount: '报销金额',
  startDate: '开始时间',
  endDate: '结束时间',
  account: '转账账户',
  payee: '收款方'
}
function formLabelMap (formConfig?: string): Record<string, string> {
  try {
    const fields = JSON.parse(formConfig || '[]')
    if (!Array.isArray(fields)) return {}
    return fields.reduce((map: Record<string, string>, field: any) => {
      if (field?.field && field?.label) map[field.field] = field.label
      return map
    }, {})
  } catch { return {} }
}
function fieldLabel (key: string, formConfig?: string): string {
  return formLabelMap(formConfig)[key] || FIELD_LABELS[key] || key
}

// 详情页隐藏的内部字段:附件走专门附件区,费用明细原始JSON不直接铺开。
// 金额(amount/totalAmount)必须展示且高亮——付款/借款/退款/备用金审批人要看得到钱数,
// 之前无条件隐藏导致 58000 元付款单审批人看不到金额。
const ALWAYS_HIDDEN_FIELDS = new Set(['__attachments', '__attachmentFileIds', 'expenseDetails', 'expenseSummary', 'detailCount'])
const MONEY_FIELDS = new Set(['amount', 'totalAmount'])

function isMoneyField (key: string): boolean {
  return MONEY_FIELDS.has(key)
}
function formatMoney (value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return formatFieldValue(value)
  return '¥' + n.toLocaleString('zh-CN', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 })
}

function formatFieldValue (value: unknown): string {
  if (value == null) return ''
  if (Array.isArray(value)) return value.map(v => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join('、')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** 从某审批实例的表单数据里取附件数组(同 index.vue attachmentsOf,字段名 __attachments) */
function attachmentsOf (formData: any): { name: string; url: string }[] {
  const a = formData && formData.__attachments
  return Array.isArray(a) ? a : []
}

// 右栏详情:解析 detailInstance.formData
const detailFormData = computed<Record<string, any>>(() => {
  try {
    if (!detailInstance.value?.formData) return {}
    const parsed = JSON.parse(detailInstance.value.formData)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch { return {} }
})
const detailDisplayEntries = computed(() => {
  const data = detailFormData.value
  return Object.entries(data)
    .filter(([key]) => !ALWAYS_HIDDEN_FIELDS.has(key))
    .filter(([key]) => !(key === 'totalAmount' && data.amount != null))
    .map(([key, value]) => ({
      key,
      label: fieldLabel(key, (detailInstance.value as any)?.formConfig),
      value: isMoneyField(key) ? formatMoney(value) : formatFieldValue(value),
      money: isMoneyField(key)
    }))
    .filter(item => item.value !== '')
})
const detailAttachments = computed(() => attachmentsOf(detailFormData.value))

// ===================== 真文件附件(walk file模块,带token) =====================
const realAttachments = computed<{ id: number; fileId: number; fileName: string; mimeType?: string }[]>(
  () => (detailInstance.value as any)?.attachments || []
)
/** fileId -> objectURL(仅图片类生成预览;组件卸载/切换时释放) */
const attachmentPreviews = reactive<Record<number, string>>({})
const realPreviewList = computed(() => realAttachments.value
  .map(f => attachmentPreviews[f.fileId]).filter(Boolean) as string[])

async function loadAttachmentPreviews () {
  // 释放旧的 objectURL
  Object.keys(attachmentPreviews).forEach(k => {
    URL.revokeObjectURL(attachmentPreviews[Number(k)])
    delete attachmentPreviews[Number(k)]
  })
  for (const f of realAttachments.value) {
    const isImg = (f.mimeType || '').startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.fileName || '')
    if (!isImg) continue
    const url = await objectUrlForFile(f.fileId)
    if (url) attachmentPreviews[f.fileId] = url
  }
}
watch(realAttachments, () => { loadAttachmentPreviews() })

// 发起人部门(若详情实例带 dept 字段则展示,否则留空)
const initiatorDept = computed(() => (detailInstance.value as any)?.initiatorDept || (detailInstance.value as any)?.deptName || '')

// ===================== 状态映射(实例 status 0/1/2/3) =====================
const STATUS_COLORS = {
  processing: '#3370ff', // 审批中
  passed: '#10b981',     // 已通过
  rejected: '#ef4444',   // 已拒绝
  canceled: '#909399'    // 已撤销
}
function statusText (s: number): string {
  return ({ 0: '审批中', 1: '已通过', 2: '已拒绝', 3: '已撤销', 4: '待修改' } as Record<number, string>)[s] || '审批中'
}
function statusColor (s: number): string {
  return ({ 0: STATUS_COLORS.processing, 1: STATUS_COLORS.passed, 2: STATUS_COLORS.rejected, 3: STATUS_COLORS.canceled, 4: '#f59e0b' } as Record<number, string>)[s] || STATUS_COLORS.processing
}
function tagStyleOf (color: string) {
  return {
    color,
    background: hexToSoft(color),
    border: 'none',
    fontWeight: '500'
  }
}
function statusTagStyle (s: number) {
  return tagStyleOf(statusColor(s))
}
function hexToSoft (hex: string): string {
  // #rrggbb -> rgba(.,.,.,0.12)
  const m = /^#?([0-9a-f]{6})$/i.exec(hex)
  if (!m) return 'rgba(51,112,255,0.12)'
  const n = parseInt(m[1], 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, 0.12)`
}

// ===================== 头像(名字首字 + 彩色圆) =====================
const AVATAR_COLORS = ['#3370ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']
function avatarChar (name?: string): string {
  if (!name) return '?'
  return name.charAt(0).toUpperCase()
}
function avatarStyle (name?: string) {
  const key = name || '?'
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return { background: AVATAR_COLORS[hash % AVATAR_COLORS.length] }
}

// ===================== 时间 =====================
function parseTime (s?: string): number | null {
  if (!s) return null
  const t = new Date(String(s).replace(/-/g, '/')).getTime()
  return Number.isNaN(t) ? null : t
}
/** 相对时间:X分钟/小时/天前(到达 X 天前) */
function relativeTime (s?: string): string {
  const t = parseTime(s)
  if (!t) return '-'
  const diff = Date.now() - t
  if (diff < 0) return '刚刚'
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hour = Math.floor(min / 60)
  if (hour < 24) return `${hour}小时前`
  const day = Math.floor(hour / 24)
  if (day < 30) return `${day}天前`
  const month = Math.floor(day / 30)
  if (month < 12) return `${month}个月前`
  return `${Math.floor(month / 12)}年前`
}
function formatFullTime (s?: string): string {
  return s ? String(s).slice(0, 16) : '-'
}

// ===================== 审批动作 =====================
const acting = ref(false)

async function doApprove () {
  const taskId = selectedTaskId.value
  if (!taskId) return
  let comment = ''
  try {
    const { value } = await ElMessageBox.prompt('请输入审批意见(可选)', '同意审批', {
      confirmButtonText: '确认同意',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入审批意见'
    })
    comment = value || ''
  } catch { return }
  acting.value = true
  try {
    await approvalCenterApi.approve(taskId, comment)
    ElMessage.success('已同意')
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
  acting.value = false
}

async function doReject () {
  const taskId = selectedTaskId.value
  if (!taskId) return
  let comment = ''
  try {
    const { value } = await ElMessageBox.prompt('请输入拒绝理由(必填)', '拒绝审批', {
      confirmButtonText: '确认拒绝',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝理由',
      inputValidator: (v: string) => (v && v.trim() ? true : '拒绝理由不能为空')
    })
    comment = value
  } catch { return }
  acting.value = true
  try {
    await approvalCenterApi.reject(taskId, comment)
    ElMessage.success('已拒绝')
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
  acting.value = false
}

/** 退回修改:不是拒绝——发起人改完表单可重新提交,流程从头再走 */
async function doReturn () {
  const taskId = selectedTaskId.value
  if (!taskId) return
  let comment = ''
  try {
    const { value } = await ElMessageBox.prompt('请写明需要修改什么(必填,发起人会看到)', '退回修改', {
      confirmButtonText: '确认退回',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '例如:请补充发票照片/金额与发票不符请更正',
      inputValidator: (v: string) => (v && v.trim() ? true : '修改意见不能为空')
    })
    comment = value
  } catch { return }
  acting.value = true
  try {
    await taskApi.returnForRevision(taskId, { comment })
    ElMessage.success('已退回给发起人修改')
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
  acting.value = false
}

/** 待修改(被退回)的申请:切到"发起申请"tab,复用其动态表单改并重新提交(双页合一,页内直接调用,不再跳路由) */
function goResubmit () {
  if (!detailInstance.value?.id) return
  const id = detailInstance.value.id
  activeTab.value = 'initiate'
  // 等子组件渲染出来再调用其暴露的方法
  setTimeout(() => { initiateRef.value?.openResubmit?.(id) }, 60)
}

// ===================== 抄送 / 转交(选人弹窗,选项按部门分组来自后端 colleagues) =====================
interface PickUser { userId: number; name: string; deptName?: string }
const colleagues = ref<PickUser[]>([])
let colleaguesLoaded = false
async function ensureColleagues () {
  if (colleaguesLoaded) return
  try {
    colleagues.value = await approvalCenterApi.colleagues()
    colleaguesLoaded = true
  } catch { colleagues.value = [] }
}

const ccDlg = reactive({ visible: false, saving: false, userIds: [] as number[] })
async function openCc () {
  if (!detailInstanceId.value) return
  ccDlg.userIds = []
  ccDlg.visible = true
  await ensureColleagues()
}
async function submitCc () {
  if (!ccDlg.userIds.length) { ElMessage.warning('请选择抄送人'); return }
  ccDlg.saving = true
  try {
    await approvalCenterApi.addCc(Number(detailInstanceId.value), ccDlg.userIds)
    ElMessage.success('已抄送')
    ccDlg.visible = false
  } catch (e: any) {
    ElMessage.error(e?.message || '抄送失败')
  }
  ccDlg.saving = false
}

const transferDlg = reactive({ visible: false, saving: false, userId: null as number | null, comment: '' })
async function openTransfer () {
  if (!selectedTaskId.value) return
  transferDlg.userId = null
  transferDlg.comment = ''
  transferDlg.visible = true
  await ensureColleagues()
}
async function submitTransfer () {
  const taskId = selectedTaskId.value
  if (!taskId) return
  if (!transferDlg.userId) { ElMessage.warning('请选择转交对象'); return }
  transferDlg.saving = true
  try {
    await approvalCenterApi.transfer(taskId, transferDlg.userId, transferDlg.comment)
    ElMessage.success('已转交')
    transferDlg.visible = false
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
  transferDlg.saving = false
}

async function cancelStarted () {
  if (!detailInstance.value?.id) return
  try {
    await ElMessageBox.confirm('确认撤销这条审批申请？撤销后审批人将不再处理。', '撤销申请', { type: 'warning' })
  } catch { return }
  acting.value = true
  try {
    await approvalCenterApi.cancel(detailInstance.value.id)
    ElMessage.success('已撤销')
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '撤销失败')
  }
  acting.value = false
}

async function deleteStarted () {
  if (!detailInstance.value?.id) return
  try {
    await ElMessageBox.confirm('确认删除这条已发起记录？删除后不可在列表中恢复。', '删除记录', { type: 'warning' })
  } catch { return }
  acting.value = true
  try {
    await approvalCenterApi.removeStarted(detailInstance.value.id)
    ElMessage.success('已删除')
    await afterAction()
  } catch (e: any) {
    ElMessage.error(e?.message || '删除失败')
  }
  acting.value = false
}

// 操作成功后:刷新角标 + 当前列表
async function afterAction () {
  await loadCounts()
  await loadList(false)
}

const route = useRoute()
onMounted(() => {
  mql = window.matchMedia('(max-width: 768px)')
  syncMobile()
  mql.addEventListener('change', syncMobile)
  // 首页等入口带 ?tab= 时直接落到对应左栏
  const t = route.query.tab as string
  const valid: TabKey[] = ['todo', 'done', 'cc', 'started', 'admin', 'initiate']
  if (t && valid.includes(t as TabKey) && (t !== 'admin' || canMonitor)) {
    activeTab.value = t as TabKey
  }
  loadCounts()
  loadList()
})
onUnmounted(() => {
  mql?.removeEventListener('change', syncMobile)
})
</script>

<style scoped>
/* ============ 整体三栏布局,填满内容区 ============ */
.lk-approval {
  display: flex;
  min-height: calc(100vh - 120px);
  height: calc(100vh - 120px);
  background: #f5f6f7;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
}
/* 发起申请子视图:占满中+右栏区域 */
.lk-initiate {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: #fff;
}
/* 批量卡片选中态 + 复选框 */
.lk-card.is-checked {
  border-color: #3370ff;
  background: #f0f6ff;
}
.lk-card__check {
  margin-right: 6px;
}
.lk-batchbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-top: 1px solid #f0f1f3;
  background: #fff;
}
.lk-batchbar__count {
  flex: 1;
  font-size: 12px;
  color: #86909c;
}
.lk-detail__back {
  display: none;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  color: #3370ff;
  cursor: pointer;
  border-bottom: 1px solid #f0f1f3;
}

/* ============ 移动端(<768px):三栏折叠为"列表 → 详情"两级 ============ */
/* 用 .lk-approval 前缀提高特异性,压过后面定义的同名 .lk-* 基础样式(等特异性时后者赢) */
@media (max-width: 768px) {
  .lk-approval.lk-approval {
    flex-direction: column;
    height: auto;
    min-height: calc(100vh - 90px);
    overflow: visible;
  }
  /* 左栏收成横向图标 tab 条 */
  .lk-approval .lk-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 6px;
    border-right: none;
    border-bottom: 1px solid #ebedf0;
  }
  .lk-approval .lk-nav__title { display: none; }
  .lk-approval .lk-nav__item { flex-direction: column; gap: 2px; padding: 6px 10px; min-width: 60px; }
  .lk-approval .lk-nav__label { font-size: 12px; }
  /* 列表默认占满宽,选中详情后隐藏列表、只显示详情(主从互斥) */
  .lk-approval .lk-list { width: 100%; }
  .lk-approval .lk-detail { display: none; }
  .lk-approval.is-mobile-detail .lk-list { display: none; }
  .lk-approval.is-mobile-detail .lk-detail { display: flex; }
  .lk-approval .lk-detail__back { display: flex; }
  .lk-approval .lk-initiate { max-height: none; }
  /* 卡片/按钮触控高度 */
  .lk-approval .lk-card { min-height: 44px; }
  .lk-approval .lk-actions .el-button { min-height: 40px; }
}
/* 全局:手机端弹窗宽 90vw(发起/审批弹窗) */

/* ---------- 左栏:导航 ---------- */
.lk-nav {
  width: 140px;
  flex-shrink: 0;
  background: #f7f8fa;
  border-right: 1px solid #ebedf0;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}
.lk-nav__title {
  font-size: 13px;
  font-weight: 700;
  color: #1f2329;
  padding: 6px 10px 12px;
}
.lk-nav__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  border-radius: 8px;
  cursor: pointer;
  color: #4e5969;
  font-size: 14px;
  transition: background 0.15s, color 0.15s;
}
.lk-nav__item:hover {
  background: #eef0f3;
}
.lk-nav__item.is-active {
  background: #e8f0ff;
  color: #3370ff;
  font-weight: 600;
}
.lk-nav__icon {
  font-size: 16px;
}
.lk-nav__label {
  flex: 1;
}
.lk-nav__badge {
  min-width: 18px;
  height: 18px;
  line-height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: #f53f3f;
  color: #fff;
  font-size: 11px;
  text-align: center;
  font-weight: 500;
}

/* ---------- 中栏:列表 ---------- */
.lk-list {
  width: 360px;
  flex-shrink: 0;
  background: #fff;
  border-right: 1px solid #ebedf0;
  display: flex;
  flex-direction: column;
}
.lk-list__toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f1f3;
}
.lk-search {
  flex: 1;
}
.lk-search :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #f5f6f7;
  box-shadow: none;
}
.lk-filter__btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: #4e5969;
  cursor: pointer;
  white-space: nowrap;
}
.lk-filter__caret {
  font-size: 12px;
}
.lk-sort {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: #4e5969;
  cursor: pointer;
}
.lk-sort:hover {
  background: #f0f1f3;
  color: #3370ff;
}
.lk-list__scroll {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.lk-list__pager {
  padding: 8px 10px;
  border-top: 1px solid #f0f1f3;
  display: flex;
  justify-content: center;
}

/* 审批卡片 */
.lk-card {
  position: relative;
  padding: 12px 14px 12px 16px;
  margin-bottom: 8px;
  background: #fff;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.lk-card:hover {
  border-color: #c9d6ff;
  box-shadow: 0 2px 10px rgba(51, 112, 255, 0.08);
}
.lk-card.is-active {
  border-color: #3370ff;
  background: #fafcff;
}
.lk-card.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  bottom: 12px;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: #3370ff;
}
.lk-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.lk-card__title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lk-card__status {
  flex-shrink: 0;
  border-radius: 4px;
}
.lk-card__fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 10px;
}
.lk-card__field {
  display: flex;
  gap: 6px;
  font-size: 12px;
  line-height: 18px;
}
.lk-card__field-label {
  color: #86909c;
  flex-shrink: 0;
}
.lk-card__field-value {
  color: #4e5969;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lk-card__field-value--money {
  color: #d4380d;
  font-weight: 700;
}
.lk-card__foot {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #86909c;
}
.lk-card__initiator {
  color: #4e5969;
}
.lk-card__time {
  margin-left: auto;
}

/* 头像 */
.lk-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  flex-shrink: 0;
}
.lk-avatar--sm {
  width: 20px;
  height: 20px;
  font-size: 11px;
}

/* ---------- 右栏:详情 ---------- */
.lk-detail {
  flex: 1;
  min-width: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
}
.lk-detail__loading,
.lk-detail__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}
.lk-detail__empty {
  flex-direction: column;
  color: #86909c;
}
.lk-detail__header {
  padding: 24px 32px 0;
  border-bottom: 1px solid #f0f1f3;
}
.lk-detail__no {
  font-size: 12px;
  color: #a9aeb8;
  margin-bottom: 6px;
}
.lk-detail__titleline {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.lk-detail__title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2329;
}
.lk-detail__status {
  border-radius: 6px;
}
.lk-detail__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.lk-detail__meta-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lk-detail__meta-dept {
  font-size: 12px;
  font-weight: 400;
  color: #86909c;
}
.lk-detail__meta-sub {
  font-size: 12px;
  color: #86909c;
  margin-top: 2px;
}
.lk-detail__tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.lk-detail__tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}
.lk-detail__body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 32px;
}

/* 审批详情:一行一字段 */
.lk-form__row {
  display: flex;
  padding: 12px 0;
  border-bottom: 1px solid #f2f3f5;
}
.lk-form__row:last-child {
  border-bottom: none;
}
.lk-form__label {
  width: 120px;
  flex-shrink: 0;
  font-size: 14px;
  color: #86909c;
}
.lk-form__value {
  flex: 1;
  font-size: 14px;
  color: #1f2329;
  word-break: break-all;
}
/* 金额高亮:审批人第一眼要看到钱数 */
.lk-form__value--money {
  color: #d4380d;
  font-size: 16px;
  font-weight: 700;
}
.lk-form__attach {
  margin-top: 20px;
}
.lk-form__attach-title {
  font-size: 14px;
  color: #86909c;
  margin-bottom: 10px;
}
.lk-form__attach-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.lk-form__attach-img {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid #ebedf0;
  overflow: hidden;
  cursor: pointer;
}
.lk-form__attach-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 100%;
  height: 100%;
  background: #f5f6f7;
  color: #86909c;
  font-size: 11px;
  padding: 6px;
  text-align: center;
}
/* 非图片附件:独立卡片可点下载 */
.lk-form__attach-file--clickable {
  width: 96px;
  height: 96px;
  border: 1px solid #ebedf0;
  border-radius: 8px;
  cursor: pointer;
  word-break: break-all;
  overflow: hidden;
}
.lk-form__attach-file--clickable:hover {
  border-color: #3370ff;
  color: #3370ff;
}

/* 审批记录 / 评论 */
.lk-track,
.lk-comment {
  min-height: 200px;
}

/* ---------- 底部操作栏 ---------- */
.lk-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 16px 32px;
  border-top: 1px solid #f0f1f3;
  background: #fff;
}
.lk-actions .el-button {
  border-radius: 8px;
}
</style>

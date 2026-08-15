<template>
  <div class="memo-page" v-loading="pageLoading">
    <section class="memo-hero">
      <div class="hero-main">
        <div class="hero-icon" aria-hidden="true">
          <el-icon><Memo /></el-icon>
        </div>
        <div>
          <div class="hero-kicker">PERSONAL WORKSPACE</div>
          <h1>我的备忘录</h1>
          <p>把临时想法、客户跟进和管理提醒放在一处，完成后随手勾选，不让事情遗漏。</p>
        </div>
      </div>
      <div class="hero-actions">
        <span class="privacy-pill"><el-icon><Lock /></el-icon>仅自己可见</span>
        <el-button type="primary" size="large" @click="startCreate">
          <el-icon><Plus /></el-icon>
          新建备忘
        </el-button>
      </div>
    </section>

    <section class="summary-grid" aria-label="备忘统计">
      <button
        type="button"
        class="summary-card pending"
        :class="{ active: activeFilter === 'pending' }"
        @click="activeFilter = 'pending'"
      >
        <span class="summary-icon"><el-icon><List /></el-icon></span>
        <span class="summary-copy"><b>{{ summary.pending }}</b><small>全部待完成</small></span>
        <span class="summary-hint">查看<el-icon><ArrowRight /></el-icon></span>
      </button>
      <button
        type="button"
        class="summary-card today"
        :class="{ active: activeFilter === 'today' }"
        @click="activeFilter = 'today'"
      >
        <span class="summary-icon"><el-icon><Calendar /></el-icon></span>
        <span class="summary-copy"><b>{{ summary.today }}</b><small>今日计划</small></span>
        <span class="summary-hint">查看<el-icon><ArrowRight /></el-icon></span>
      </button>
      <button
        type="button"
        class="summary-card overdue"
        :class="{ active: activeFilter === 'overdue' }"
        @click="activeFilter = 'overdue'"
      >
        <span class="summary-icon"><el-icon><WarningFilled /></el-icon></span>
        <span class="summary-copy"><b>{{ summary.overdue }}</b><small>已逾期</small></span>
        <span class="summary-hint">优先处理<el-icon><ArrowRight /></el-icon></span>
      </button>
      <button
        type="button"
        class="summary-card done"
        :class="{ active: activeFilter === 'done' }"
        @click="activeFilter = 'done'"
      >
        <span class="summary-icon"><el-icon><CircleCheckFilled /></el-icon></span>
        <span class="summary-copy"><b>{{ summary.doneToday }}</b><small>今日已完成</small></span>
        <span class="summary-hint">查看<el-icon><ArrowRight /></el-icon></span>
      </button>
    </section>

    <section ref="editorRef" class="editor-card">
      <div class="section-heading editor-heading">
        <div>
          <div class="heading-eyebrow">{{ editingId ? '正在编辑' : '快速记录' }}</div>
          <h2>{{ editingId ? '修改这条备忘' : '写下一件不能忘的事' }}</h2>
        </div>
        <el-button v-if="editingId" plain @click="startCreate">退出编辑</el-button>
      </div>

      <el-form label-position="top" class="memo-form" @submit.prevent>
        <div class="editor-grid">
          <div class="writing-column">
            <el-form-item label="事项内容" required>
              <el-input
                v-model="form.content"
                type="textarea"
                :rows="7"
                resize="vertical"
                maxlength="500"
                show-word-limit
                placeholder="例如：周三前确认重点客户的续费方案、负责人和下一步。支持换行和编号。"
                @keydown.meta.enter.prevent="submitMemo"
                @keydown.ctrl.enter.prevent="submitMemo"
              />
            </el-form-item>
            <el-form-item label="补充备注">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="3"
                resize="vertical"
                maxlength="500"
                show-word-limit
                placeholder="可记录背景、需要准备的资料或完成标准"
                @keydown.meta.enter.prevent="submitMemo"
                @keydown.ctrl.enter.prevent="submitMemo"
              />
            </el-form-item>
          </div>

          <div class="setting-column">
            <el-form-item label="计划时间">
              <el-date-picker
                v-model="form.remindTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="选择计划时间"
                :clearable="false"
                style="width: 100%"
              />
              <div class="quick-times">
                <button type="button" @click="setQuickTime('later')">2小时后</button>
                <button type="button" @click="setQuickTime('tomorrow')">明天 09:00</button>
                <button type="button" @click="setQuickTime('monday')">下周一 09:00</button>
              </div>
            </el-form-item>

            <el-form-item label="分类">
              <el-select
                v-model="form.category"
                filterable
                clearable
                default-first-option
                :loading="categoryOptionsLoading"
                :disabled="!categoryOptionsResolved"
                placeholder="选择分类"
                style="width: 100%"
              >
                <el-option
                  v-for="category in categoryEditOptions"
                  :key="category.value"
                  :label="category.label"
                  :value="category.value"
                  :disabled="category.disabled"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="优先级">
              <div class="priority-picker">
                <button
                  v-for="option in priorityOptions"
                  :key="option.value"
                  type="button"
                  :class="['priority-choice', option.className, { selected: form.priority === option.value }]"
                  @click="form.priority = option.value"
                >
                  <span class="priority-dot" />
                  <span><b>{{ option.label }}</b><small>{{ option.description }}</small></span>
                </button>
              </div>
            </el-form-item>

            <div v-if="editingId" class="status-setting">
              <div>
                <b>完成状态</b>
                <span>修改后会同步到首页速览</span>
              </div>
              <el-switch v-model="form.completed" active-text="已完成" inactive-text="未完成" />
            </div>

            <div class="form-actions">
              <span class="save-shortcut">{{ shortcutLabel }} + Enter 保存</span>
              <div>
                <el-button @click="resetForm">清空</el-button>
                <el-button type="primary" :loading="saving" :disabled="!categoryOptionsResolved" @click="submitMemo">
                  {{ editingId ? '保存修改' : '新增备忘' }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-form>
    </section>

    <section class="list-card">
      <div class="section-heading list-heading">
        <div>
          <div class="heading-eyebrow">MEMO LIST</div>
          <h2>备忘清单</h2>
        </div>
        <el-button :loading="listLoading" @click="refreshData">
          <el-icon><RefreshRight /></el-icon>
          刷新
        </el-button>
      </div>

      <div class="filter-toolbar">
        <el-radio-group v-model="activeFilter" class="filter-tabs">
          <el-radio-button value="pending">未完成</el-radio-button>
          <el-radio-button value="today">今天</el-radio-button>
          <el-radio-button value="week">本周</el-radio-button>
          <el-radio-button value="overdue">已逾期</el-radio-button>
          <el-radio-button value="done">已完成</el-radio-button>
          <el-radio-button value="all">全部</el-radio-button>
        </el-radio-group>

        <div class="filter-controls">
          <el-input v-model="keyword" clearable placeholder="搜索内容、分类或备注" class="search-input">
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <el-select
            v-model="filterCategory"
            clearable
            :loading="categoryOptionsLoading"
            :disabled="!categoryOptionsResolved"
            placeholder="全部分类"
            class="category-filter"
          >
            <el-option v-for="category in categoryFilterOptions" :key="category.value" :label="category.label" :value="category.value" />
          </el-select>
          <el-select v-model="filterPriority" clearable placeholder="全部优先级" class="priority-filter">
            <el-option label="重要" :value="3" />
            <el-option label="普通" :value="2" />
            <el-option label="低" :value="1" />
          </el-select>
          <el-button v-if="hasExtraFilters" link type="primary" @click="resetFilters">重置筛选</el-button>
        </div>
      </div>

      <div class="result-bar">
        <span>共 <b>{{ filteredMemos.length }}</b> 条</span>
        <span>当前页最多读取最近 100 条个人备忘</span>
      </div>

      <el-skeleton v-if="listLoading && !memos.length" :rows="6" animated />
      <el-empty
        v-else-if="filteredMemos.length === 0"
        :description="emptyDescription"
        :image-size="112"
      >
        <el-button type="primary" @click="startCreate">写一条备忘</el-button>
      </el-empty>

      <div v-else class="memo-groups">
        <section v-for="group in groupedMemos" :key="group.key" class="memo-group">
          <div class="group-heading">
            <span :class="['group-dot', group.tone]" />
            <h3>{{ group.title }}</h3>
            <span>{{ group.description }}</span>
            <b>{{ group.items.length }}</b>
          </div>

          <article
            v-for="item in group.items"
            :key="item.id"
            :class="['memo-item', { completed: item.completed, overdue: isOverdue(item), editing: editingId === item.id }]"
          >
            <div class="check-cell">
              <el-checkbox
                :model-value="!!item.completed"
                :disabled="togglingId === item.id"
                :aria-label="item.completed ? '恢复为未完成' : '标记为已完成'"
                @change="value => toggleMemo(item, !!value)"
              />
            </div>

            <div class="item-main" role="button" tabindex="0" @click="editMemo(item)" @keyup.enter="editMemo(item)">
              <div class="item-labels">
                <span :class="['priority-label', priorityMeta(item.priority).className]">
                  {{ priorityMeta(item.priority).label }}
                </span>
                <span class="category-label">{{ item.category || '未分类' }}</span>
                <span v-if="item.completed" class="completed-label">已完成</span>
              </div>
              <div class="item-content">{{ item.content }}</div>
              <div v-if="item.remark" class="item-remark"><b>备注</b><span>{{ item.remark }}</span></div>
              <div class="item-updated">
                {{ formatUpdated(item.updateTime || item.createTime) }}
              </div>
            </div>

            <div class="time-cell">
              <span :class="['time-badge', timeMeta(item).className]">
                <el-icon><Clock /></el-icon>
                {{ timeMeta(item).label }}
              </span>
              <small>{{ formatPlanTime(item.remindTime) }}</small>
            </div>

            <div class="item-actions">
              <el-button link type="primary" @click="editMemo(item)">编辑</el-button>
              <el-button link type="danger" @click="removeMemo(item)">删除</el-button>
            </div>
          </article>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRoute } from 'vue-router'
import { memoApi, type DashboardMemo, type MemoSummary } from '@/api/memo'
import { useFieldOptions, type SelectFieldOption } from '@/composables/useFieldOptions'

type FilterKey = 'pending' | 'today' | 'week' | 'overdue' | 'done' | 'all'
type QuickTimeKey = 'later' | 'tomorrow' | 'monday'

interface MemoGroup {
  key: string
  title: string
  description: string
  tone: 'danger' | 'primary' | 'success' | 'muted' | 'done'
  items: DashboardMemo[]
}

const route = useRoute()
const pageLoading = ref(true)
const listLoading = ref(false)
const saving = ref(false)
const togglingId = ref<number | null>(null)
const memos = ref<DashboardMemo[]>([])
const activeFilter = ref<FilterKey>('pending')
const keyword = ref('')
const filterCategory = ref('')
const filterPriority = ref<number | ''>('')
const editingId = ref<number | null>(null)
const editorRef = ref<HTMLElement | null>(null)
const summary = reactive<MemoSummary>({ pending: 0, today: 0, doneToday: 0, overdue: 0 })
const form = reactive<DashboardMemo>({
  content: '',
  remindTime: '',
  priority: 2,
  category: '',
  completed: false,
  remark: ''
})

const baseCategories: SelectFieldOption[] = [
  { label: '客户跟进', value: '客户跟进', defaultValue: true },
  { label: '财务协同', value: '财务协同', defaultValue: false },
  { label: '团队管理', value: '团队管理', defaultValue: false },
  { label: '系统优化', value: '系统优化', defaultValue: false },
  { label: '学习成长', value: '学习成长', defaultValue: false },
  { label: '个人事项', value: '个人事项', defaultValue: false }
]
const {
  loading: categoryOptionsLoading,
  resolved: categoryOptionsResolved,
  defaultValue: categoryDefaultValue,
  withHistoricalValues: withCategoryHistory,
  isSelectable: isCategorySelectable
} = useFieldOptions('memo_category', baseCategories)
const priorityOptions = [
  { value: 3, label: '重要', description: '优先处理', className: 'high' },
  { value: 2, label: '普通', description: '正常跟进', className: 'normal' },
  { value: 1, label: '低', description: '可稍后处理', className: 'low' }
]

const shortcutLabel = computed(() => (/Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl'))
const categoryEditOptions = computed(() => withCategoryHistory(form.category))
// 筛选历史备忘不是新增业务值，因此允许选择列表中真实存在的停用分类。
const categoryFilterOptions = computed(() => {
  const historyValues = memos.value.map((item) => item.category?.trim() || '').filter(Boolean)
  return withCategoryHistory([...historyValues, filterCategory.value]).map((item) => ({ ...item, disabled: false }))
})

const hasExtraFilters = computed(() => !!keyword.value.trim() || !!filterCategory.value || filterPriority.value !== '')

const filteredMemos = computed(() => {
  const now = new Date()
  const query = keyword.value.trim().toLocaleLowerCase()
  return memos.value.filter(item => {
    if (activeFilter.value === 'pending' && item.completed) return false
    if (activeFilter.value === 'done' && !item.completed) return false
    if (activeFilter.value === 'overdue' && !isOverdue(item)) return false
    if (activeFilter.value === 'today' && !isSameDay(toDate(item.remindTime), now)) return false
    if (activeFilter.value === 'week' && !isInCurrentWeek(toDate(item.remindTime), now)) return false
    if (filterCategory.value && item.category !== filterCategory.value) return false
    if (filterPriority.value !== '' && Number(item.priority || 2) !== Number(filterPriority.value)) return false
    if (query) {
      const haystack = [item.content, item.category, item.remark].filter(Boolean).join(' ').toLocaleLowerCase()
      if (!haystack.includes(query)) return false
    }
    return true
  })
})

const groupedMemos = computed<MemoGroup[]>(() => {
  const buckets: Record<string, DashboardMemo[]> = {
    overdue: [],
    today: [],
    upcoming: [],
    unscheduled: [],
    done: []
  }
  const now = new Date()
  filteredMemos.value.forEach(item => {
    if (item.completed) {
      buckets.done.push(item)
      return
    }
    const plan = toDate(item.remindTime)
    if (!plan) buckets.unscheduled.push(item)
    else if (plan.getTime() < now.getTime()) buckets.overdue.push(item)
    else if (isSameDay(plan, now)) buckets.today.push(item)
    else buckets.upcoming.push(item)
  })
  return [
    { key: 'overdue', title: '已逾期', description: '需要优先处理', tone: 'danger', items: buckets.overdue },
    { key: 'today', title: '今天', description: '今日计划', tone: 'primary', items: buckets.today },
    { key: 'upcoming', title: '接下来', description: '已安排时间', tone: 'success', items: buckets.upcoming },
    { key: 'unscheduled', title: '未安排', description: '暂无计划时间', tone: 'muted', items: buckets.unscheduled },
    { key: 'done', title: '已完成', description: '可恢复为未完成', tone: 'done', items: buckets.done }
  ].filter(group => group.items.length > 0) as MemoGroup[]
})

const emptyDescription = computed(() => {
  if (hasExtraFilters.value) return '没有找到匹配的备忘，可以重置筛选后再试'
  const labels: Record<FilterKey, string> = {
    pending: '暂无未完成备忘',
    today: '今天没有安排备忘',
    week: '本周没有安排备忘',
    overdue: '很好，当前没有逾期备忘',
    done: '暂无已完成备忘',
    all: '还没有备忘，先记下第一件事'
  }
  return labels[activeFilter.value]
})

function pad2(value: number) {
  return String(value).padStart(2, '0')
}

function toDate(value?: string): Date | null {
  if (!value) return null
  const result = new Date(value.replace(' ', 'T'))
  return Number.isNaN(result.getTime()) ? null : result
}

function isSameDay(value: Date | null, compare: Date) {
  return !!value
    && value.getFullYear() === compare.getFullYear()
    && value.getMonth() === compare.getMonth()
    && value.getDate() === compare.getDate()
}

function isInCurrentWeek(value: Date | null, compare: Date) {
  if (!value) return false
  const monday = new Date(compare)
  const offset = (compare.getDay() + 6) % 7
  monday.setDate(compare.getDate() - offset)
  monday.setHours(0, 0, 0, 0)
  const nextMonday = new Date(monday)
  nextMonday.setDate(monday.getDate() + 7)
  return value >= monday && value < nextMonday
}

function dateTimeText(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}:00`
}

function defaultPlanTime() {
  const date = new Date()
  date.setMinutes(0, 0, 0)
  date.setHours(date.getHours() + 2)
  return dateTimeText(date)
}

function setQuickTime(key: QuickTimeKey) {
  const date = new Date()
  if (key === 'later') {
    date.setMinutes(0, 0, 0)
    date.setHours(date.getHours() + 2)
  } else if (key === 'tomorrow') {
    date.setDate(date.getDate() + 1)
    date.setHours(9, 0, 0, 0)
  } else {
    const daysUntilNextMonday = ((8 - date.getDay()) % 7) || 7
    date.setDate(date.getDate() + daysUntilNextMonday)
    date.setHours(9, 0, 0, 0)
  }
  form.remindTime = dateTimeText(date)
}

function priorityMeta(priority?: number) {
  if (Number(priority) === 3) return { label: '重要', className: 'high' }
  if (Number(priority) === 1) return { label: '低', className: 'low' }
  return { label: '普通', className: 'normal' }
}

function isOverdue(item: DashboardMemo) {
  const plan = toDate(item.remindTime)
  return !item.completed && !!plan && plan.getTime() < Date.now()
}

function timeMeta(item: DashboardMemo) {
  if (item.completed) return { label: '已完成', className: 'done' }
  const plan = toDate(item.remindTime)
  if (!plan) return { label: '未安排', className: 'muted' }
  if (plan.getTime() < Date.now()) return { label: '已逾期', className: 'danger' }
  if (isSameDay(plan, new Date())) return { label: '今天', className: 'primary' }
  return { label: '已安排', className: 'success' }
}

function formatPlanTime(value?: string) {
  const date = toDate(value)
  if (!date) return '暂无计划时间'
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${weekdays[date.getDay()]} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function formatUpdated(value?: string) {
  const date = toDate(value)
  if (!date) return '暂无更新时间'
  return `更新于 ${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}

function resetForm() {
  editingId.value = null
  form.content = ''
  form.remindTime = defaultPlanTime()
  form.priority = 2
  form.category = ''
  form.completed = false
  form.completedTime = undefined
  form.remark = ''
  applyCategoryDefault()
}

function applyCategoryDefault() {
  if (editingId.value || !categoryOptionsResolved.value || form.category) return
  form.category = categoryDefaultValue.value || ''
}

watch([categoryOptionsResolved, categoryDefaultValue], applyCategoryDefault)

function scrollToEditor() {
  nextTick(() => editorRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function startCreate() {
  resetForm()
  scrollToEditor()
}

function editMemo(item: DashboardMemo) {
  editingId.value = item.id || null
  form.content = item.content || ''
  form.remindTime = item.remindTime || ''
  form.priority = Number(item.priority || 2)
  form.category = item.category || ''
  form.completed = !!item.completed
  form.completedTime = item.completedTime
  form.remark = item.remark || ''
  scrollToEditor()
}

function resetFilters() {
  keyword.value = ''
  filterCategory.value = ''
  filterPriority.value = ''
}

async function loadMemos() {
  listLoading.value = true
  try {
    const response: any = await memoApi.list({ scope: 'all', limit: 100 })
    memos.value = (response?.data || response || []) as DashboardMemo[]
  } catch {
    memos.value = []
  } finally {
    listLoading.value = false
  }
}

async function loadSummary() {
  try {
    const response: any = await memoApi.summary()
    const data = response?.data || response || {}
    summary.pending = Number(data.pending || 0)
    summary.today = Number(data.today || 0)
    summary.doneToday = Number(data.doneToday || 0)
    summary.overdue = Number(data.overdue || 0)
  } catch {
    summary.pending = 0
    summary.today = 0
    summary.doneToday = 0
    summary.overdue = 0
  }
}

async function refreshData() {
  await Promise.all([loadMemos(), loadSummary()])
}

async function submitMemo() {
  const content = form.content.trim()
  const category = form.category?.trim() || ''
  const remark = form.remark?.trim() || ''
  if (!categoryOptionsResolved.value) {
    ElMessage.warning('备忘分类正在加载，请稍后保存')
    return
  }
  if (!content) {
    ElMessage.warning('请先填写备忘内容')
    return
  }
  if (content.length > 500 || remark.length > 500) {
    ElMessage.warning('事项内容和备注均不能超过500字')
    return
  }
  if (category.length > 30) {
    ElMessage.warning('分类名称不能超过30个字')
    return
  }
  // 编辑时允许原停用分类原样保留；新建只能使用当前启用项。
  if (!editingId.value && category && !isCategorySelectable(category)) {
    ElMessage.warning('所选备忘分类已停用，请重新选择')
    return
  }

  saving.value = true
  try {
    const data: DashboardMemo = {
      id: editingId.value || undefined,
      content,
      remindTime: form.remindTime || undefined,
      priority: Number(form.priority || 2),
      category,
      completed: !!form.completed,
      completedTime: form.completedTime,
      remark
    }
    if (editingId.value) {
      await memoApi.update(data)
      ElMessage.success('备忘已更新')
    } else {
      await memoApi.create(data)
      ElMessage.success('备忘已新增')
    }
    resetForm()
    await refreshData()
  } catch {
    ElMessage.error('保存失败，请稍后重试')
  } finally {
    saving.value = false
  }
}

async function toggleMemo(item: DashboardMemo, completed: boolean) {
  if (!item.id) return
  togglingId.value = item.id
  try {
    await memoApi.complete(item.id, completed)
    item.completed = completed
    item.completedTime = completed ? dateTimeText(new Date()) : undefined
    if (editingId.value === item.id) {
      form.completed = completed
      form.completedTime = item.completedTime
    }
    await loadSummary()
    ElMessage.success(completed ? '已标记完成' : '已恢复为未完成')
  } catch {
    ElMessage.error('状态更新失败，请重试')
  } finally {
    togglingId.value = null
  }
}

async function removeMemo(item: DashboardMemo) {
  if (!item.id) return
  try {
    await ElMessageBox.confirm(
      `确定删除「${item.content.slice(0, 32)}${item.content.length > 32 ? '…' : ''}」吗？`,
      '删除备忘',
      { type: 'warning', confirmButtonText: '确定删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    await memoApi.remove(item.id)
    if (editingId.value === item.id) resetForm()
    await refreshData()
    ElMessage.success('备忘已删除')
  } catch {
    ElMessage.error('删除失败，请重试')
  }
}

onMounted(async () => {
  resetForm()
  await refreshData()
  const rawEditId = Array.isArray(route.query.edit) ? route.query.edit[0] : route.query.edit
  const editId = Number(rawEditId)
  if (Number.isFinite(editId) && editId > 0) {
    const target = memos.value.find(item => Number(item.id) === editId)
    if (target) editMemo(target)
  }
  pageLoading.value = false
})
</script>

<style scoped lang="scss">
.memo-page {
  width: min(100%, 1500px);
  margin: 0 auto;
  color: var(--text-body);
}

.memo-hero,
.editor-card,
.list-card {
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 14px;
  box-shadow: 0 8px 28px rgba(31, 35, 41, 0.06);
}

.memo-hero {
  min-height: 136px;
  padding: 26px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background:
    radial-gradient(circle at 88% 18%, rgba(51, 112, 255, 0.16), transparent 32%),
    linear-gradient(135deg, #ffffff 0%, #f5f9ff 100%);
  overflow: hidden;
}

.hero-main,
.hero-actions,
.section-heading,
.filter-controls,
.result-bar,
.group-heading,
.item-labels,
.form-actions,
.status-setting {
  display: flex;
  align-items: center;
}

.hero-main { gap: 18px; min-width: 0; }
.hero-icon {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 29px;
  background: linear-gradient(145deg, #3370ff, #6b8fff);
  box-shadow: 0 12px 24px rgba(51, 112, 255, 0.26);
}
.hero-kicker,
.heading-eyebrow {
  color: #3370ff;
  font-size: 11px;
  font-weight: 750;
  letter-spacing: 0.12em;
}
.memo-hero h1 { margin-top: 5px; font-size: 28px; line-height: 1.2; }
.memo-hero p { margin-top: 8px; color: var(--text-muted); font-size: 14px; line-height: 1.65; }
.hero-actions { gap: 12px; flex-shrink: 0; }
.privacy-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 999px;
  color: #526173;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid #dfe8f5;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 16px 0;
}
.summary-card {
  min-width: 0;
  height: 102px;
  padding: 18px;
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  text-align: left;
  color: inherit;
  background: #fff;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  box-shadow: 0 5px 18px rgba(31, 35, 41, 0.045);
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}
.summary-card:hover,
.summary-card.active { transform: translateY(-2px); box-shadow: 0 10px 24px rgba(31, 35, 41, 0.09); }
.summary-card.active { border-color: #8fb2ff; box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.12); }
.summary-icon {
  width: 46px;
  height: 46px;
  border-radius: 13px;
  display: grid;
  place-items: center;
  font-size: 22px;
}
.summary-card.pending .summary-icon { color: #3370ff; background: #edf4ff; }
.summary-card.today .summary-icon { color: #7c5cff; background: #f3efff; }
.summary-card.overdue .summary-icon { color: #e5484d; background: #fff0f0; }
.summary-card.done .summary-icon { color: #0f9f78; background: #eafaf5; }
.summary-copy { min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.summary-copy b { color: var(--text-primary); font-size: 26px; line-height: 1; font-family: 'JetBrains Mono', monospace; }
.summary-copy small { color: var(--text-muted); font-size: 13px; }
.summary-hint { display: flex; align-items: center; gap: 2px; color: #8a96a6; font-size: 12px; white-space: nowrap; }

.editor-card,
.list-card { padding: 24px 26px; }
.editor-card { scroll-margin-top: 16px; }
.section-heading { justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.section-heading h2 { margin-top: 4px; font-size: 20px; line-height: 1.35; }
.memo-form :deep(.el-form-item__label) { color: #344054; font-size: 14px; font-weight: 650; }
.memo-form :deep(.el-textarea__inner) {
  padding: 13px 15px;
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.75;
  border-radius: 9px;
}
.editor-grid { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(320px, 0.75fr); gap: 28px; }
.setting-column { padding-left: 28px; border-left: 1px solid #edf0f5; }
.quick-times { width: 100%; display: flex; flex-wrap: wrap; gap: 7px; margin-top: 9px; }
.quick-times button {
  padding: 5px 9px;
  color: #526173;
  font-size: 12px;
  background: #f6f8fb;
  border: 1px solid #e4e9f0;
  border-radius: 6px;
  cursor: pointer;
}
.quick-times button:hover { color: #3370ff; border-color: #9db9f5; background: #f3f7ff; }
.priority-picker { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
.priority-choice {
  min-width: 0;
  padding: 10px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: #526173;
  background: #fff;
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  cursor: pointer;
}
.priority-choice:hover { background: #f8faff; }
.priority-choice.selected { border-color: #8fb2ff; background: #f4f7ff; box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.1); }
.priority-choice span:last-child { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; }
.priority-choice b { color: #344054; font-size: 13px; }
.priority-choice small { margin-top: 2px; color: #98a2b3; font-size: 10px; white-space: nowrap; }
.priority-dot { width: 8px; height: 8px; flex: 0 0 8px; border-radius: 50%; }
.priority-choice.high .priority-dot { background: #e5484d; }
.priority-choice.normal .priority-dot { background: #3370ff; }
.priority-choice.low .priority-dot { background: #a0a8b5; }
.status-setting {
  justify-content: space-between;
  gap: 16px;
  padding: 13px 14px;
  margin-bottom: 18px;
  border-radius: 9px;
  background: #f7f9fc;
  border: 1px solid #e8edf3;
}
.status-setting > div { display: flex; flex-direction: column; gap: 3px; }
.status-setting b { color: #344054; font-size: 13px; }
.status-setting span { color: #98a2b3; font-size: 11px; }
.form-actions { justify-content: space-between; gap: 14px; padding-top: 4px; }
.save-shortcut { color: #98a2b3; font-size: 11px; white-space: nowrap; }

.list-card { margin-top: 16px; }
.list-heading { margin-bottom: 16px; }
.filter-toolbar {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  background: #f7f9fc;
  border: 1px solid #e8edf3;
  border-radius: 8px;
}
.filter-tabs { align-self: flex-start; }
.filter-tabs :deep(.el-radio-button__inner) { min-height: 36px; padding: 9px 16px; font-size: 13px; }
.filter-controls { width: 100%; gap: 10px; flex-wrap: wrap; }
.search-input { flex: 1 1 300px; min-width: 220px; }
.category-filter { width: 155px; }
.priority-filter { width: 145px; }
.result-bar { justify-content: space-between; gap: 16px; padding: 12px 2px; color: #8a96a6; font-size: 12px; }
.result-bar b { color: #3370ff; font-size: 14px; }
.memo-groups { display: flex; flex-direction: column; gap: 22px; }
.group-heading { gap: 8px; margin-bottom: 9px; }
.group-heading h3 { font-size: 15px; }
.group-heading span:not(.group-dot) { color: #98a2b3; font-size: 12px; }
.group-heading b { min-width: 23px; padding: 2px 7px; text-align: center; color: #667085; font-size: 11px; background: #f2f4f7; border-radius: 999px; }
.group-dot { width: 8px; height: 8px; border-radius: 50%; }
.group-dot.danger { background: #e5484d; }
.group-dot.primary { background: #3370ff; }
.group-dot.success { background: #18a67e; }
.group-dot.muted { background: #98a2b3; }
.group-dot.done { background: #63b995; }

.memo-item {
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 190px 92px;
  gap: 14px;
  align-items: start;
  padding: 17px 14px;
  background: #fff;
  border: 1px solid #e7ebf1;
  border-radius: 8px;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
}
.memo-item + .memo-item { margin-top: 8px; }
.memo-item::before {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 0;
  width: 3px;
  content: '';
  background: transparent;
  border-radius: 0 4px 4px 0;
}
.memo-item:hover { border-color: #cbd8ee; box-shadow: 0 8px 20px rgba(31, 35, 41, 0.07); transform: translateY(-1px); }
.memo-item.editing { border-color: #8fb2ff; background: #fbfdff; box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.1); }
.memo-item.overdue::before { background: #e5484d; }
.memo-item.completed { background: #fafbfc; }
.check-cell { padding-top: 3px; display: flex; justify-content: center; }
.item-main { min-width: 0; cursor: pointer; outline: none; }
.item-main:focus-visible { border-radius: 6px; box-shadow: 0 0 0 2px rgba(51, 112, 255, 0.25); }
.item-labels { gap: 7px; flex-wrap: wrap; margin-bottom: 8px; }
.priority-label,
.category-label,
.completed-label,
.time-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
  line-height: 1;
}
.priority-label { padding: 5px 8px; font-weight: 650; }
.priority-label.high { color: #c4323b; background: #fff0f0; }
.priority-label.normal { color: #2f66d0; background: #edf4ff; }
.priority-label.low { color: #667085; background: #f2f4f7; }
.category-label { padding: 5px 8px; color: #6d55be; background: #f4f0ff; }
.completed-label { padding: 5px 8px; color: #0f8a68; background: #eafaf5; }
.item-content {
  color: #1d2939;
  font-size: 16px;
  font-weight: 550;
  line-height: 1.72;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.memo-item.completed .item-content { color: #98a2b3; text-decoration: line-through; }
.item-remark {
  margin-top: 10px;
  padding: 9px 11px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #667085;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  background: #f7f9fc;
  border-radius: 7px;
}
.item-remark b { flex-shrink: 0; color: #475467; font-size: 11px; }
.item-updated { margin-top: 9px; color: #a0a8b5; font-size: 11px; }
.time-cell { padding-top: 2px; display: flex; flex-direction: column; align-items: flex-start; gap: 7px; }
.time-cell small { color: #667085; font-size: 12px; line-height: 1.5; }
.time-badge { gap: 4px; padding: 5px 8px; font-weight: 650; }
.time-badge.primary { color: #2f66d0; background: #edf4ff; }
.time-badge.danger { color: #c4323b; background: #fff0f0; }
.time-badge.success { color: #0f8a68; background: #eafaf5; }
.time-badge.muted { color: #667085; background: #f2f4f7; }
.time-badge.done { color: #0f8a68; background: #eafaf5; }
.item-actions { padding-top: 1px; display: flex; justify-content: flex-end; gap: 2px; }

@media (max-width: 1180px) {
  .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .editor-grid { grid-template-columns: 1fr; gap: 8px; }
  .setting-column { padding-left: 0; padding-top: 22px; border-left: 0; border-top: 1px solid #edf0f5; }
}

@media (max-width: 900px) {
  .memo-hero { align-items: flex-start; flex-direction: column; }
  .hero-actions { width: 100%; justify-content: space-between; }
  .memo-item { grid-template-columns: 32px minmax(0, 1fr) auto; }
  .time-cell { grid-column: 2 / 3; }
  .item-actions { grid-column: 3 / 4; grid-row: 1 / 3; flex-direction: column; }
}

@media (max-width: 640px) {
  .memo-hero,
  .editor-card,
  .list-card { border-radius: 8px; }
  .memo-hero { padding: 20px; }
  .hero-icon { width: 48px; height: 48px; flex-basis: 48px; font-size: 24px; }
  .memo-hero h1 { font-size: 23px; }
  .memo-hero p { font-size: 13px; }
  .hero-actions { align-items: stretch; flex-direction: column; }
  .hero-actions .el-button { width: 100%; margin: 0; }
  .privacy-pill { justify-content: center; }
  .summary-grid { gap: 9px; margin: 12px 0; }
  .summary-card { height: 88px; padding: 12px; grid-template-columns: 38px minmax(0, 1fr); gap: 9px; }
  .summary-icon { width: 38px; height: 38px; font-size: 19px; }
  .summary-copy b { font-size: 22px; }
  .summary-hint { display: none; }
  .editor-card,
  .list-card { padding: 19px 15px; }
  .editor-heading { align-items: flex-start; }
  .editor-heading h2 { font-size: 18px; }
  .priority-picker { grid-template-columns: 1fr; }
  .priority-choice { min-height: 48px; justify-content: flex-start; padding-left: 14px; }
  .status-setting { align-items: flex-start; flex-direction: column; }
  .form-actions { align-items: stretch; flex-direction: column; }
  .form-actions > div { display: grid; grid-template-columns: 1fr 1.35fr; gap: 8px; }
  .form-actions .el-button { width: 100%; margin: 0; min-height: 42px; }
  .save-shortcut { text-align: center; }
  .filter-tabs { width: 100%; display: grid; grid-template-columns: repeat(3, 1fr); }
  .filter-tabs :deep(.el-radio-button) { width: 100%; }
  .filter-tabs :deep(.el-radio-button__inner) { width: 100%; padding: 9px 6px; }
  .filter-controls { align-items: stretch; flex-direction: column; }
  .search-input,
  .category-filter,
  .priority-filter { width: 100%; min-width: 0; flex: none; }
  .result-bar { align-items: flex-start; flex-direction: column; gap: 4px; }
  .group-heading { flex-wrap: wrap; }
  .memo-item { padding: 15px 11px; grid-template-columns: 27px minmax(0, 1fr); gap: 10px; }
  .time-cell { grid-column: 2; }
  .item-actions { grid-column: 2; grid-row: auto; flex-direction: row; justify-content: flex-start; }
  .item-content { font-size: 15px; }
}
</style>

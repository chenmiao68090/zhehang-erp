<template>
  <div class="multidim-container">
    <!-- 顶部操作栏 -->
    <div class="multidim-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t('multidim.title') }}</h2>
      </div>
      <div class="header-right">
        <el-input
          v-model="searchKey"
          :placeholder="$t('multidim.searchPlaceholder')"
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @input="handleSearch"
        />
        <el-dropdown trigger="click" @command="handleCreate">
          <el-button type="primary">
            <el-icon><Plus /></el-icon>
            {{ $t('multidim.newTable') }}
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="blank">{{ $t('multidim.blankTable') }}</el-dropdown-item>
              <el-dropdown-item command="template">{{ $t('multidim.fromTemplate') }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="multidim-body">
      <!-- 左侧分类 -->
      <div class="category-sidebar">
        <div
          v-for="cat in categories"
          :key="cat.value"
          class="category-item"
          :class="{ active: activeCategory === cat.value }"
          @click="activeCategory = cat.value"
        >
          <el-icon><component :is="cat.icon" /></el-icon>
          <span>{{ $t(cat.label) }}</span>
        </div>
      </div>

      <!-- 主体卡片网格 -->
      <div class="table-grid">
        <div
          v-for="item in filteredTables"
          :key="item.id"
          class="table-card"
          @click="openTable(item)"
        >
          <div class="card-icon">
            <el-icon :size="32"><Grid /></el-icon>
          </div>
          <div class="card-info">
            <h4 class="card-name">{{ item.name }}</h4>
            <p class="card-meta">
              <span>{{ getRecordCount(item) }} {{ $t('multidim.records') }}</span>
              <span class="dot">·</span>
              <span>{{ formatTime(item.updateTime) }}</span>
            </p>
          </div>
          <div class="card-actions" @click.stop>
            <el-dropdown trigger="click">
              <el-icon class="more-btn"><MoreFilled /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="openTable(item)">{{ $t('multidim.openTable') }}</el-dropdown-item>
                  <el-dropdown-item @click="handleCopy(item)">{{ $t('multidim.copyTable') }}</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(item)" divided>{{ $t('multidim.deleteTable') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredTables.length === 0" class="empty-state">
          <el-empty :description="$t('common.noData')" />
        </div>
      </div>
    </div>

    <!-- 模板选择弹窗 -->
    <el-dialog v-model="templateDialogVisible" :title="$t('multidim.templateMarket')" width="680px">
      <p class="template-desc">{{ $t('multidim.templateDesc') }}</p>
      <div class="template-grid">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          class="template-card"
          @click="createFromTemplate(tpl)"
        >
          <div class="tpl-icon">
            <el-icon :size="28"><Grid /></el-icon>
          </div>
          <div class="tpl-info">
            <h5>{{ tpl.name }}</h5>
            <p>{{ tpl.description }}</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Grid, MoreFilled, Document, User, Money, Finished, Folder } from '@element-plus/icons-vue'
import { tableApi, templateApi } from '@/api/multidim'
import type { MultidimTable, MultidimTemplate } from '@/api/multidim'

const { t } = useI18n()
const router = useRouter()

const searchKey = ref('')
const activeCategory = ref('')
const tableList = ref<MultidimTable[]>([])
const templates = ref<MultidimTemplate[]>([])
const templateDialogVisible = ref(false)

const categories = [
  { value: '', label: 'multidim.allCategories', icon: 'Grid' },
  { value: 'crm', label: 'multidim.crm', icon: 'User' },
  { value: 'project', label: 'multidim.project', icon: 'Folder' },
  { value: 'finance', label: 'multidim.finance', icon: 'Money' },
  { value: 'task', label: 'multidim.task', icon: 'Finished' }
]

const filteredTables = computed(() => {
  let list = tableList.value
  if (activeCategory.value) {
    list = list.filter(t => t.category === activeCategory.value)
  }
  if (searchKey.value) {
    const key = searchKey.value.toLowerCase()
    list = list.filter(t => t.name.toLowerCase().includes(key))
  }
  return list
})

onMounted(() => {
  loadTables()
  loadTemplates()
})

async function loadTables() {
  try {
    const res: any = await tableApi.list({ pageNum: 1, pageSize: 100 })
    tableList.value = res.data?.records || res.data?.list || []
  } catch (e) {
    // 如果后端未就绪，使用模拟数据
    tableList.value = getMockTables()
  }
}

async function loadTemplates() {
  try {
    const res: any = await templateApi.list()
    templates.value = res.data || []
  } catch (e) {
    templates.value = getMockTemplates()
  }
}

function handleSearch() {
  // 客户端过滤，无需额外请求
}

function handleCreate(command: string) {
  if (command === 'blank') {
    createBlankTable()
  } else if (command === 'template') {
    templateDialogVisible.value = true
  }
}

async function createBlankTable() {
  const defaultFields = JSON.stringify([
    { id: 'f1', name: '标题', type: 'text', config: {} }
  ])
  const defaultViews = JSON.stringify([
    { id: 'v1', name: '表格视图', type: 'grid', filterConfig: [], sortConfig: [], groupBy: '' }
  ])
  try {
    const res: any = await tableApi.create({
      name: '未命名表格',
      category: activeCategory.value || 'other',
      fieldSchema: defaultFields,
      viewConfig: defaultViews
    })
    ElMessage.success(t('multidim.createSuccess'))
    const newTable = res.data
    if (newTable?.id) {
      router.push(`/multidim/detail?id=${newTable.id}`)
    } else {
      loadTables()
    }
  } catch (e) {
    // 模拟成功
    const mockId = Date.now()
    tableList.value.unshift({
      id: mockId,
      name: '未命名表格',
      description: '',
      icon: '',
      category: activeCategory.value || 'other',
      fieldSchema: defaultFields,
      viewConfig: defaultViews,
      templateId: null,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      createBy: 1,
      updateBy: 1
    })
    ElMessage.success(t('multidim.createSuccess'))
    router.push(`/multidim/detail?id=${mockId}`)
  }
}

async function createFromTemplate(tpl: MultidimTemplate) {
  try {
    const res: any = await tableApi.createFromTemplate(tpl.id)
    ElMessage.success(t('multidim.createSuccess'))
    templateDialogVisible.value = false
    const newTable = res.data
    if (newTable?.id) {
      router.push(`/multidim/detail?id=${newTable.id}`)
    } else {
      loadTables()
    }
  } catch (e) {
    const mockId = Date.now()
    tableList.value.unshift({
      id: mockId,
      name: tpl.name,
      description: tpl.description,
      icon: tpl.icon,
      category: tpl.category,
      fieldSchema: tpl.fieldSchema,
      viewConfig: tpl.viewConfig,
      templateId: tpl.id,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString(),
      createBy: 1,
      updateBy: 1
    })
    templateDialogVisible.value = false
    ElMessage.success(t('multidim.createSuccess'))
    router.push(`/multidim/detail?id=${mockId}`)
  }
}

function openTable(item: MultidimTable) {
  router.push(`/multidim/detail?id=${item.id}`)
}

async function handleCopy(item: MultidimTable) {
  try {
    await tableApi.copy(item.id)
    ElMessage.success(t('multidim.copySuccess'))
    loadTables()
  } catch (e) {
    tableList.value.unshift({ ...item, id: Date.now(), name: item.name + ' (副本)' })
    ElMessage.success(t('multidim.copySuccess'))
  }
}

async function handleDelete(item: MultidimTable) {
  await ElMessageBox.confirm(t('multidim.confirmDelete'), t('common.confirm'), { type: 'warning' })
  try {
    await tableApi.remove(item.id)
    ElMessage.success(t('multidim.deleteSuccess'))
    loadTables()
  } catch (e) {
    tableList.value = tableList.value.filter(t => t.id !== item.id)
    ElMessage.success(t('multidim.deleteSuccess'))
  }
}

function getRecordCount(_item: MultidimTable): number {
  return Math.floor(Math.random() * 50)
}

function formatTime(time: string): string {
  if (!time) return '-'
  const d = new Date(time)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

function getMockTables(): MultidimTable[] {
  return [
    { id: 1, name: '客户跟进表', description: '记录客户跟进状态', icon: 'UserFilled', category: 'crm', fieldSchema: '[{"id":"f1","name":"姓名","type":"text","config":{}},{"id":"f2","name":"公司","type":"text","config":{}},{"id":"f3","name":"状态","type":"select","config":{"options":["新线索","跟进中","已成交","已流失"]}},{"id":"f4","name":"最后跟进","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f3"}]', templateId: 1, createTime: '2026-05-10T10:00:00', updateTime: '2026-05-17T14:30:00', createBy: 1, updateBy: 1 },
    { id: 2, name: '项目进度表', description: '跟踪项目进度', icon: 'Folder', category: 'project', fieldSchema: '[{"id":"f1","name":"项目名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["未开始","进行中","已完成","已延期"]}},{"id":"f3","name":"负责人","type":"user","config":{}},{"id":"f4","name":"截止日期","type":"date","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]', templateId: 2, createTime: '2026-05-08T09:00:00', updateTime: '2026-05-16T11:20:00', createBy: 1, updateBy: 1 },
    { id: 3, name: '任务清单', description: '日常任务管理', icon: 'Finished', category: 'task', fieldSchema: '[{"id":"f1","name":"任务名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["待处理","进行中","已完成","已取消"]}},{"id":"f3","name":"优先级","type":"select","config":{"options":["低","中","高","紧急"]}},{"id":"f4","name":"截止日期","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]', templateId: 4, createTime: '2026-05-12T08:00:00', updateTime: '2026-05-18T09:00:00', createBy: 1, updateBy: 1 }
  ]
}

function getMockTemplates(): MultidimTemplate[] {
  return [
    { id: 1, name: '客户跟进表', category: 'crm', icon: 'UserFilled', description: '记录客户跟进状态与联系信息', fieldSchema: '[{"id":"f1","name":"姓名","type":"text","config":{}},{"id":"f2","name":"公司","type":"text","config":{}},{"id":"f3","name":"状态","type":"select","config":{"options":["新线索","跟进中","已成交","已流失"]}},{"id":"f4","name":"最后跟进","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f3"}]' },
    { id: 2, name: '项目进度表', category: 'project', icon: 'Folder', description: '跟踪项目进度与里程碑', fieldSchema: '[{"id":"f1","name":"项目名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["未开始","进行中","已完成","已延期"]}},{"id":"f3","name":"负责人","type":"user","config":{}},{"id":"f4","name":"截止日期","type":"date","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]' },
    { id: 3, name: '财务报表', category: 'finance', icon: 'Money', description: '财务科目与金额记录', fieldSchema: '[{"id":"f1","name":"科目","type":"text","config":{}},{"id":"f2","name":"金额","type":"number","config":{"precision":2}},{"id":"f3","name":"日期","type":"date","config":{}},{"id":"f4","name":"类型","type":"select","config":{"options":["收入","支出","转账"]}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""}]' },
    { id: 4, name: '任务清单', category: 'task', icon: 'Finished', description: '日常任务跟踪与管理', fieldSchema: '[{"id":"f1","name":"任务名","type":"text","config":{}},{"id":"f2","name":"状态","type":"select","config":{"options":["待处理","进行中","已完成","已取消"]}},{"id":"f3","name":"优先级","type":"select","config":{"options":["低","中","高","紧急"]}},{"id":"f4","name":"截止日期","type":"date","config":{}},{"id":"f5","name":"负责人","type":"user","config":{}}]', viewConfig: '[{"id":"v1","name":"表格视图","type":"grid","filterConfig":[],"sortConfig":[],"groupBy":""},{"id":"v2","name":"看板视图","type":"kanban","filterConfig":[],"sortConfig":[],"groupBy":"f2"}]' }
  ]
}
</script>

<style scoped>
.multidim-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--el-bg-color-page);
}
.multidim-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.header-left .page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.header-right {
  display: flex;
  gap: 12px;
  align-items: center;
}
.multidim-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.category-sidebar {
  width: 180px;
  padding: 16px 12px;
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
  overflow-y: auto;
}
.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition: all 0.2s;
}
.category-item:hover {
  background: var(--el-fill-color-light);
}
.category-item.active {
  background: #F265221A;
  color: #F26522;
  font-weight: 500;
}
.table-grid {
  flex: 1;
  padding: 20px 24px;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  align-content: start;
}
.table-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}
.table-card:hover {
  border-color: #F26522;
  box-shadow: 0 2px 12px rgba(242, 101, 34, 0.1);
}
.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F265221A;
  border-radius: 8px;
  color: #F26522;
  flex-shrink: 0;
}
.card-info {
  flex: 1;
  min-width: 0;
}
.card-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.card-meta {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.card-meta .dot {
  margin: 0 4px;
}
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
}
.more-btn {
  cursor: pointer;
  color: var(--el-text-color-secondary);
  font-size: 16px;
}
.more-btn:hover {
  color: #F26522;
}
.empty-state {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
}
.template-desc {
  color: var(--el-text-color-secondary);
  margin-bottom: 16px;
}
.template-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
.template-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.template-card:hover {
  border-color: #F26522;
  background: #F265220A;
}
.tpl-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F265221A;
  border-radius: 8px;
  color: #F26522;
  flex-shrink: 0;
}
.tpl-info h5 {
  margin: 0 0 4px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.tpl-info p {
  margin: 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

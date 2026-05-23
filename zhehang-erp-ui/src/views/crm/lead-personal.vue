<template>
  <div class="lead-personal">
    <!-- 顶部页眉 -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-eyebrow">
          <span class="eyebrow-dot"></span>
          <span>CRM · MY LEADS VAULT</span>
        </div>
        <h1 class="header-title">
          个人客资
          <span class="title-accent">/ Personal Pipeline</span>
        </h1>
        <p class="header-sub">
          专属于 <strong>{{ currentUser }}</strong> 的客户线索 · 共 {{ total }} 条记录在册
        </p>
      </div>
      <div class="header-right">
        <div class="header-meter">
          <div class="meter-item">
            <div class="meter-num">{{ activeCount }}</div>
            <div class="meter-label">跟进中</div>
          </div>
          <div class="meter-divider"></div>
          <div class="meter-item">
            <div class="meter-num">{{ todayCount }}</div>
            <div class="meter-label">今日新增</div>
          </div>
          <div class="meter-divider"></div>
          <div class="meter-item">
            <div class="meter-num">{{ overdueCount }}</div>
            <div class="meter-label">需跟进</div>
          </div>
        </div>
        <el-button class="gold-btn" @click="openCreate">
          <el-icon><Plus /></el-icon>
          <span>新建线索</span>
        </el-button>
      </div>
    </header>

    <!-- 操作栏 -->
    <section class="toolbar">
      <div class="toolbar-search">
        <el-input
          v-model="search"
          class="black-input"
          placeholder="搜索客户名称 / 电话"
          clearable
          @input="page = 1"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-filter">
        <el-select
          v-model="sourceFilter"
          class="black-select"
          placeholder="来源"
          clearable
          @change="page = 1"
        >
          <el-option v-for="s in sourceOptions" :key="s" :label="s" :value="s" />
        </el-select>
        <el-select
          v-model="statusFilter"
          class="black-select"
          placeholder="状态"
          clearable
          @change="page = 1"
        >
          <el-option v-for="s in statusOptions" :key="s.value" :label="s.label" :value="s.value" />
        </el-select>
        <el-button class="ghost-btn" @click="resetFilters">
          <el-icon><RefreshLeft /></el-icon>
          <span>重置</span>
        </el-button>
      </div>
    </section>

    <!-- 表格容器 -->
    <section class="table-card">
      <div class="card-corner top-left"></div>
      <div class="card-corner top-right"></div>
      <div class="card-corner bottom-left"></div>
      <div class="card-corner bottom-right"></div>

      <div class="table-head-strip">
        <div class="strip-title">
          <span class="strip-bar"></span>
          <span>我的客资列表</span>
          <span class="strip-count">{{ filtered.length }} / {{ total }}</span>
        </div>
        <div class="strip-meta">
          <span class="meta-item">
            <span class="meta-dot live"></span>实时同步
          </span>
        </div>
      </div>

      <el-table
        :data="paged"
        class="dark-table"
        :row-class-name="rowClass"
        empty-text="暂无线索数据"
        size="default"
      >
        <el-table-column type="index" label="#" width="56" align="center" />
        <el-table-column label="客户名称" min-width="180">
          <template #default="{ row }">
            <div class="cell-customer">
              <div class="avatar">{{ row.customerName.slice(0, 1) }}</div>
              <div class="name-block">
                <div class="name-main">{{ row.customerName }}</div>
                <div class="name-sub">No.{{ row.code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" min-width="100" />
        <el-table-column label="电话" min-width="140">
          <template #default="{ row }">
            <span class="phone-text">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" min-width="110">
          <template #default="{ row }">
            <span class="gold-tag">{{ row.source }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" min-width="110">
          <template #default="{ row }">
            <span class="status-tag" :class="`status-${row.status}`">
              <span class="status-dot"></span>
              {{ statusLabel(row.status) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="最近跟进" min-width="160">
          <template #default="{ row }">
            <div class="time-cell">
              <div>{{ row.lastFollow }}</div>
              <div class="time-rel">{{ relTime(row.lastFollow) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="right">
          <template #default="{ row }">
            <div class="ops">
              <button class="op-btn" @click="follow(row)">
                <el-icon><Edit /></el-icon>跟进
              </button>
              <button class="op-btn op-warn" @click="release(row)">
                <el-icon><Promotion /></el-icon>转公海
              </button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-foot">
        <div class="foot-info">
          展示第 <em>{{ rangeFrom }}</em> – <em>{{ rangeTo }}</em> 条 / 共 <em>{{ filtered.length }}</em> 条
        </div>
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="filtered.length"
          :page-sizes="[10, 20, 50]"
          background
          layout="prev, pager, next, sizes, jumper"
          class="gold-pagination"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, RefreshLeft, Edit, Promotion
} from '@element-plus/icons-vue'

interface Lead {
  id: string
  code: string
  customerName: string
  contact: string
  phone: string
  source: string
  status: 'new' | 'following' | 'reserved' | 'won' | 'lost'
  lastFollow: string
  owner: string
}

const STORAGE_KEY = 'crm_leads_data'
const currentUser = '当前用户'

const sourceOptions = ['官网注册', '电话呼入', '展会获取', '老客户推荐', '社交媒体', '广告投放']
const statusOptions = [
  { value: 'new', label: '新线索' },
  { value: 'following', label: '跟进中' },
  { value: 'reserved', label: '已预约' },
  { value: 'won', label: '已成交' },
  { value: 'lost', label: '已流失' }
]

const data = ref<Lead[]>([])
const search = ref('')
const sourceFilter = ref('')
const statusFilter = ref('')
const page = ref(1)
const pageSize = ref(10)

function generateMock(): Lead[] {
  const names = [
    '锦绣置业', '远洋科技', '玖鼎集团', '臻和传媒', '银座金融',
    '云尚装饰', '昕辰电子', '皓月餐饮', '青藤教育', '泰岳物流'
  ]
  const contacts = ['张先生', '李女士', '王经理', '陈总', '赵总监', '孙主管']
  const list: Lead[] = []
  for (let i = 0; i < 10; i++) {
    const d = new Date(Date.now() - i * 86400000 * (Math.random() * 3 + 0.3))
    list.push({
      id: `L${1000 + i}`,
      code: String(20240001 + i),
      customerName: names[i % names.length] + (i > 9 ? `·${i}` : ''),
      contact: contacts[i % contacts.length],
      phone: `138${String(Math.floor(10000000 + Math.random() * 89999999))}`,
      source: sourceOptions[i % sourceOptions.length],
      status: (['new', 'following', 'reserved', 'won', 'lost'] as const)[i % 5],
      lastFollow: d.toISOString().slice(0, 16).replace('T', ' '),
      owner: currentUser
    })
  }
  return list
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const all = JSON.parse(raw) as Lead[]
      data.value = all.filter(item => item.owner === currentUser)
      if (data.value.length === 0) throw new Error('no own data')
    } else {
      throw new Error('no data')
    }
  } catch {
    data.value = generateMock()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  }
}

const filtered = computed(() => {
  return data.value.filter(item => {
    if (search.value) {
      const k = search.value.toLowerCase()
      if (!item.customerName.toLowerCase().includes(k) && !item.phone.includes(k)) {
        return false
      }
    }
    if (sourceFilter.value && item.source !== sourceFilter.value) return false
    if (statusFilter.value && item.status !== statusFilter.value) return false
    return true
  })
})

const total = computed(() => data.value.length)
const activeCount = computed(() =>
  data.value.filter(i => ['following', 'reserved'].includes(i.status)).length
)
const todayCount = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return data.value.filter(i => i.lastFollow.startsWith(today)).length
})
const overdueCount = computed(() => {
  const limit = Date.now() - 3 * 86400000
  return data.value.filter(i => new Date(i.lastFollow).getTime() < limit && i.status === 'following').length
})

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
const rangeFrom = computed(() => filtered.value.length === 0 ? 0 : (page.value - 1) * pageSize.value + 1)
const rangeTo = computed(() => Math.min(page.value * pageSize.value, filtered.value.length))

function statusLabel(s: string) {
  return statusOptions.find(o => o.value === s)?.label || s
}
function relTime(t: string) {
  const diff = Date.now() - new Date(t).getTime()
  const day = Math.floor(diff / 86400000)
  if (day <= 0) return '今日'
  if (day < 7) return `${day} 天前`
  if (day < 30) return `${Math.floor(day / 7)} 周前`
  return `${Math.floor(day / 30)} 月前`
}
function rowClass({ rowIndex }: { rowIndex: number }) {
  return rowIndex % 2 === 0 ? 'row-even' : 'row-odd'
}
function resetFilters() {
  search.value = ''
  sourceFilter.value = ''
  statusFilter.value = ''
  page.value = 1
}
function openCreate() {
  ElMessage({
    message: '新建线索功能将在创建表单中打开',
    type: 'success',
    customClass: 'gold-message'
  })
}
function follow(row: Lead) {
  ElMessage.success(`已打开「${row.customerName}」的跟进记录`)
}
async function release(row: Lead) {
  try {
    await ElMessageBox.confirm(
      `确认将「${row.customerName}」释放至公司公海？释放后该线索将进入公共池。`,
      '释放至公海',
      { confirmButtonText: '确认释放', cancelButtonText: '取消', type: 'warning' }
    )
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Lead[]
    const idx = all.findIndex(i => i.id === row.id)
    if (idx > -1) {
      all[idx].owner = ''
      all[idx].status = 'lost'
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
    }
    data.value = data.value.filter(i => i.id !== row.id)
    ElMessage.success('已释放至公海')
  } catch { /* cancelled */ }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.lead-personal {
  position: relative;
  min-height: 100%;
  padding: 24px 28px 40px;
  background: radial-gradient(ellipse at top right, rgba(212, 175, 55, 0.06) 0%, transparent 45%),
              radial-gradient(ellipse at bottom left, rgba(212, 175, 55, 0.04) 0%, transparent 50%),
              #0a0a0f;
  color: #e8e8ec;
  font-family: 'PingFang SC', 'Helvetica Neue', system-ui, sans-serif;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(212, 175, 55, 0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212, 175, 55, 0.025) 1px, transparent 1px);
    background-size: 60px 60px;
    pointer-events: none;
    opacity: 0.5;
  }
}

/* 页眉 */
.page-header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: 24px;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.18);

  &::after {
    content: '';
    position: absolute;
    left: 0; bottom: -1px;
    width: 80px; height: 2px;
    background: linear-gradient(90deg, #d4af37, transparent);
  }
}
.header-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 3px;
  color: #d4af37;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 14px;
  .eyebrow-dot {
    width: 6px; height: 6px;
    background: #d4af37;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.7);
    animation: pulseDot 2.4s ease-in-out infinite;
  }
}
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(1.4); }
}
.header-title {
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 600;
  color: #f4f4f8;
  letter-spacing: 1px;
  font-family: 'Georgia', 'PingFang SC', serif;
  .title-accent {
    margin-left: 12px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(212, 175, 55, 0.7);
    font-style: italic;
    letter-spacing: 0.5px;
  }
}
.header-sub {
  margin: 0;
  font-size: 13px;
  color: rgba(232, 232, 236, 0.55);
  letter-spacing: 0.3px;
  strong {
    color: #d4af37;
    font-weight: 500;
    margin: 0 2px;
  }
}
.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
}
.header-meter {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 20px;
  background: rgba(18, 18, 26, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}
.meter-item {
  text-align: center;
  .meter-num {
    font-size: 22px;
    font-weight: 600;
    color: #d4af37;
    font-family: 'Georgia', serif;
    line-height: 1;
  }
  .meter-label {
    margin-top: 4px;
    font-size: 11px;
    color: rgba(232, 232, 236, 0.5);
    letter-spacing: 1px;
  }
}
.meter-divider {
  width: 1px;
  height: 26px;
  background: linear-gradient(180deg, transparent, rgba(212, 175, 55, 0.35), transparent);
}

/* 按钮 */
:deep(.gold-btn) {
  background: linear-gradient(135deg, #d4af37 0%, #b88c2e 100%);
  border: none;
  color: #0a0a0f;
  font-weight: 600;
  letter-spacing: 1px;
  height: 40px;
  padding: 0 18px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(212, 175, 55, 0.25);
  transition: all 0.25s ease;
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 22px rgba(212, 175, 55, 0.4);
    background: linear-gradient(135deg, #e3c14b 0%, #c79a36 100%);
  }
  span { margin-left: 6px; }
}
:deep(.ghost-btn) {
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: rgba(212, 175, 55, 0.85);
  height: 38px;
  padding: 0 16px;
  border-radius: 10px;
  letter-spacing: 0.5px;
  &:hover {
    background: rgba(212, 175, 55, 0.08);
    border-color: rgba(212, 175, 55, 0.5);
    color: #d4af37;
  }
  span { margin-left: 4px; }
}

/* 工具栏 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  gap: 16px;
  flex-wrap: wrap;
}
.toolbar-search {
  flex: 1 1 320px;
  max-width: 380px;
}
.toolbar-filter {
  display: flex;
  align-items: center;
  gap: 12px;
}
:deep(.black-input) .el-input__wrapper {
  background: rgba(18, 18, 26, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.18);
  box-shadow: none !important;
  border-radius: 10px;
  height: 40px;
  transition: border-color 0.2s, box-shadow 0.2s;
  &:hover { border-color: rgba(212, 175, 55, 0.4); }
  &.is-focus {
    border-color: #d4af37 !important;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12) !important;
  }
  .el-input__inner { color: #e8e8ec; }
  .el-input__inner::placeholder { color: rgba(232, 232, 236, 0.35); }
  .el-input__prefix-inner > .el-icon { color: rgba(212, 175, 55, 0.6); }
}
:deep(.black-select) {
  width: 150px;
  .el-select__wrapper {
    background: rgba(18, 18, 26, 0.7) !important;
    border: 1px solid rgba(212, 175, 55, 0.18) !important;
    box-shadow: none !important;
    border-radius: 10px;
    height: 40px;
    &:hover { border-color: rgba(212, 175, 55, 0.4) !important; }
    &.is-focused {
      border-color: #d4af37 !important;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12) !important;
    }
    .el-select__placeholder { color: rgba(232, 232, 236, 0.35); }
    .el-select__placeholder.is-transparent { color: rgba(232, 232, 236, 0.35); }
    .el-select__selected-item { color: #e8e8ec; }
  }
}

/* 表格卡片 */
.table-card {
  position: relative;
  background: linear-gradient(180deg, #14141d 0%, #12121a 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}
.card-corner {
  position: absolute;
  width: 16px; height: 16px;
  border: 1.5px solid #d4af37;
  z-index: 2;
  pointer-events: none;
  &.top-left { top: 8px; left: 8px; border-right: none; border-bottom: none; }
  &.top-right { top: 8px; right: 8px; border-left: none; border-bottom: none; }
  &.bottom-left { bottom: 8px; left: 8px; border-right: none; border-top: none; }
  &.bottom-right { bottom: 8px; right: 8px; border-left: none; border-top: none; }
}
.table-head-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.strip-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  color: #f4f4f8;
  font-weight: 500;
  letter-spacing: 1px;
  .strip-bar {
    width: 3px; height: 16px;
    background: linear-gradient(180deg, #d4af37, #b88c2e);
    border-radius: 2px;
  }
  .strip-count {
    margin-left: 6px;
    padding: 2px 10px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px;
    font-size: 11px;
    color: #d4af37;
    letter-spacing: 0.5px;
  }
}
.strip-meta {
  display: flex;
  gap: 18px;
}
.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(232, 232, 236, 0.5);
  letter-spacing: 1px;
}
.meta-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #6ad58e;
  &.live { box-shadow: 0 0 6px #6ad58e; animation: pulseDot 2s infinite; }
}

/* 表格深色主题 */
:deep(.dark-table.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: #1a1a24;
  --el-table-border-color: transparent;
  --el-table-text-color: #d8d8de;
  --el-table-header-text-color: #d4af37;
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.05);
  background: transparent;

  &::before { display: none; }

  th.el-table__cell {
    background: #1a1a24 !important;
    border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
    color: #d4af37;
    font-weight: 500;
    font-size: 12px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    padding: 14px 0;
    .cell { font-weight: 500; }
  }
  td.el-table__cell {
    border-bottom: 1px solid rgba(212, 175, 55, 0.06) !important;
    padding: 14px 0;
    background: transparent !important;
  }
  tr.row-even td.el-table__cell { background: rgba(212, 175, 55, 0.012) !important; }
  tr:hover > td.el-table__cell {
    background: rgba(212, 175, 55, 0.05) !important;
    box-shadow: inset 3px 0 0 #d4af37;
  }
  .el-table__empty-block { background: transparent; }
  .el-table__empty-text { color: rgba(232, 232, 236, 0.4); }
}

/* 单元格内容 */
.cell-customer {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 16px;
}
.avatar {
  width: 36px; height: 36px;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  font-weight: 600;
  font-size: 15px;
  font-family: 'Georgia', serif;
}
.name-block {
  .name-main {
    color: #f4f4f8;
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 2px;
  }
  .name-sub {
    color: rgba(232, 232, 236, 0.4);
    font-size: 11px;
    letter-spacing: 0.5px;
    font-family: 'Georgia', monospace;
  }
}
.phone-text {
  font-family: 'Georgia', monospace;
  letter-spacing: 0.8px;
  color: #d8d8de;
}
.gold-tag {
  display: inline-block;
  padding: 3px 10px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 4px;
  background: rgba(212, 175, 55, 0.06);
  color: #d4af37;
  font-size: 12px;
  letter-spacing: 0.5px;
}
.status-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  letter-spacing: 0.5px;
  border: 1px solid;
  .status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
  }
  &.status-new { color: #62b8ff; border-color: rgba(98, 184, 255, 0.4); background: rgba(98, 184, 255, 0.08); .status-dot { background: #62b8ff; } }
  &.status-following { color: #d4af37; border-color: rgba(212, 175, 55, 0.4); background: rgba(212, 175, 55, 0.08); .status-dot { background: #d4af37; box-shadow: 0 0 6px #d4af37; } }
  &.status-reserved { color: #c596ff; border-color: rgba(197, 150, 255, 0.4); background: rgba(197, 150, 255, 0.08); .status-dot { background: #c596ff; } }
  &.status-won { color: #6ad58e; border-color: rgba(106, 213, 142, 0.4); background: rgba(106, 213, 142, 0.08); .status-dot { background: #6ad58e; } }
  &.status-lost { color: #888; border-color: rgba(150, 150, 150, 0.3); background: rgba(150, 150, 150, 0.06); .status-dot { background: #888; } }
}
.time-cell {
  line-height: 1.5;
  > div:first-child {
    color: #d8d8de;
    font-size: 13px;
    font-family: 'Georgia', monospace;
    letter-spacing: 0.3px;
  }
  .time-rel {
    font-size: 11px;
    color: rgba(212, 175, 55, 0.7);
    margin-top: 2px;
  }
}
.ops {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding-right: 16px;
}
.op-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
  cursor: pointer;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
  font-family: inherit;
  &:hover {
    background: rgba(212, 175, 55, 0.12);
    border-color: #d4af37;
    color: #f4d97a;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.25);
  }
  &.op-warn {
    color: rgba(232, 232, 236, 0.6);
    border-color: rgba(255, 255, 255, 0.1);
    &:hover {
      color: #ff9d6a;
      border-color: rgba(255, 157, 106, 0.5);
      background: rgba(255, 157, 106, 0.08);
      box-shadow: 0 0 10px rgba(255, 157, 106, 0.2);
    }
  }
  .el-icon { font-size: 13px; }
}

/* 表格底部 */
.table-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);
}
.foot-info {
  font-size: 12px;
  color: rgba(232, 232, 236, 0.5);
  letter-spacing: 0.5px;
  em {
    font-style: normal;
    color: #d4af37;
    font-weight: 600;
    margin: 0 2px;
    font-family: 'Georgia', serif;
  }
}

:deep(.gold-pagination) {
  --el-pagination-bg-color: transparent;
  .btn-prev, .btn-next, .el-pager li {
    background: rgba(18, 18, 26, 0.6) !important;
    color: rgba(232, 232, 236, 0.6) !important;
    border: 1px solid rgba(212, 175, 55, 0.15);
    margin: 0 3px;
    border-radius: 6px;
    min-width: 32px;
    height: 32px;
    transition: all 0.2s;
    &:hover {
      color: #d4af37 !important;
      border-color: rgba(212, 175, 55, 0.5);
    }
    &.is-active, &.active {
      background: linear-gradient(135deg, #d4af37, #b88c2e) !important;
      color: #0a0a0f !important;
      border-color: #d4af37;
      box-shadow: 0 2px 10px rgba(212, 175, 55, 0.4);
      font-weight: 600;
    }
  }
  .el-pagination__sizes .el-select .el-select__wrapper {
    background: rgba(18, 18, 26, 0.6) !important;
    border: 1px solid rgba(212, 175, 55, 0.2) !important;
    box-shadow: none !important;
    border-radius: 6px;
  }
  .el-pagination__jump {
    color: rgba(232, 232, 236, 0.6);
    .el-input__wrapper {
      background: rgba(18, 18, 26, 0.6);
      box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.2) inset;
    }
    .el-input__inner { color: #d4af37; }
  }
}

@media (max-width: 1100px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
  .header-meter { width: 100%; justify-content: space-around; }
}
</style>

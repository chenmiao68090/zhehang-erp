<template>
  <div class="lead-pool">
    <!-- 顶部页眉 -->
    <header class="page-header">
      <div class="header-left">
        <div class="header-eyebrow">
          <span class="eyebrow-dot"></span>
          <span>CRM · PUBLIC LEAD POOL</span>
        </div>
        <h1 class="header-title">
          公司公海
          <span class="title-accent">/ Open Sea</span>
        </h1>
        <p class="header-sub">公共线索池 · 待领取 / 待分配的客户资源</p>
      </div>
      <div class="header-right">
        <div class="ribbon">
          <span class="ribbon-flag"></span>
          <span class="ribbon-text">公平竞争 · 先到先得</span>
        </div>
      </div>
    </header>

    <!-- 统计信息条 -->
    <section class="stat-row">
      <div class="stat-card stat-1">
        <div class="stat-deco"></div>
        <div class="stat-icon"><el-icon :size="24"><DataLine /></el-icon></div>
        <div class="stat-body">
          <div class="stat-label">公海总量</div>
          <div class="stat-value">
            <span class="num">{{ totalCount }}</span>
            <span class="unit">条</span>
          </div>
          <div class="stat-trend">
            <span class="trend-bar"></span>资源池容量
          </div>
        </div>
      </div>
      <div class="stat-card stat-2">
        <div class="stat-deco"></div>
        <div class="stat-icon"><el-icon :size="24"><Sunrise /></el-icon></div>
        <div class="stat-body">
          <div class="stat-label">今日新增</div>
          <div class="stat-value">
            <span class="num">{{ todayCount }}</span>
            <span class="unit">条</span>
          </div>
          <div class="stat-trend">
            <span class="trend-bar"></span>{{ todayPercent }}% of 公海
          </div>
        </div>
      </div>
      <div class="stat-card stat-3">
        <div class="stat-deco"></div>
        <div class="stat-icon"><el-icon :size="24"><Calendar /></el-icon></div>
        <div class="stat-body">
          <div class="stat-label">本周新增</div>
          <div class="stat-value">
            <span class="num">{{ weekCount }}</span>
            <span class="unit">条</span>
          </div>
          <div class="stat-trend">
            <span class="trend-bar"></span>近 7 天累计
          </div>
        </div>
      </div>
      <div class="stat-card stat-4">
        <div class="stat-deco"></div>
        <div class="stat-icon"><el-icon :size="24"><Trophy /></el-icon></div>
        <div class="stat-body">
          <div class="stat-label">已被领取</div>
          <div class="stat-value">
            <span class="num">{{ claimedCount }}</span>
            <span class="unit">条</span>
          </div>
          <div class="stat-trend">
            <span class="trend-bar"></span>累计转化
          </div>
        </div>
      </div>
    </section>

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
          <template #prefix><el-icon><Search /></el-icon></template>
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
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          class="black-date"
          range-separator="—"
          start-placeholder="释放起"
          end-placeholder="释放止"
          value-format="YYYY-MM-DD"
          @change="page = 1"
        />
        <el-button class="ghost-btn" @click="resetFilters">
          <el-icon><RefreshLeft /></el-icon><span>重置</span>
        </el-button>
      </div>
    </section>

    <!-- 表格 -->
    <section class="table-card">
      <div class="card-corner top-left"></div>
      <div class="card-corner top-right"></div>
      <div class="card-corner bottom-left"></div>
      <div class="card-corner bottom-right"></div>

      <div class="table-head-strip">
        <div class="strip-title">
          <span class="strip-bar"></span>
          <span>公海线索清单</span>
          <span class="strip-count">{{ filtered.length }} / {{ totalCount }}</span>
        </div>
        <div class="strip-meta">
          <span class="legend"><span class="legend-dot pending"></span>待领取</span>
          <span class="legend"><span class="legend-dot taken"></span>已领取</span>
        </div>
      </div>

      <el-table
        :data="paged"
        class="dark-table"
        :row-class-name="rowClass"
        empty-text="公海暂无可领取线索"
      >
        <el-table-column type="index" label="#" width="56" align="center" />
        <el-table-column label="客户名称" min-width="180">
          <template #default="{ row }">
            <div class="cell-customer">
              <div class="avatar" :class="{ taken: row.taken }">
                {{ row.customerName.slice(0, 1) }}
              </div>
              <div class="name-block">
                <div class="name-main" :class="{ dim: row.taken }">
                  {{ row.customerName }}
                </div>
                <div class="name-sub">No.{{ row.code }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系人" min-width="100" />
        <el-table-column label="电话" min-width="140">
          <template #default="{ row }">
            <span class="phone-text" :class="{ dim: row.taken }">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column label="来源" min-width="110">
          <template #default="{ row }">
            <span class="gold-tag" :class="{ dim: row.taken }">{{ row.source }}</span>
          </template>
        </el-table-column>
        <el-table-column label="释放时间" min-width="160">
          <template #default="{ row }">
            <div class="time-cell">
              <div :class="{ dim: row.taken }">{{ row.releasedAt }}</div>
              <div class="time-rel">{{ relTime(row.releasedAt) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="原归属人" min-width="110">
          <template #default="{ row }">
            <span class="owner-tag" :class="{ dim: row.taken }">
              <el-icon><UserFilled /></el-icon>
              {{ row.previousOwner || '—' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="right">
          <template #default="{ row }">
            <div class="ops">
              <template v-if="row.taken">
                <span class="taken-flag">
                  <el-icon><CircleCheck /></el-icon>
                  已被 {{ row.takenBy }} 领取
                </span>
              </template>
              <template v-else>
                <button class="op-btn op-primary" @click="claim(row)">
                  <el-icon><Star /></el-icon>领取
                </button>
                <button class="op-btn" @click="assign(row)">
                  <el-icon><Share /></el-icon>分配
                </button>
              </template>
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
  Search, RefreshLeft, DataLine, Sunrise, Calendar, Trophy,
  UserFilled, CircleCheck, Star, Share
} from '@element-plus/icons-vue'

interface PoolLead {
  id: string
  code: string
  customerName: string
  contact: string
  phone: string
  source: string
  releasedAt: string
  previousOwner: string
  taken: boolean
  takenBy: string
}

const STORAGE_KEY = 'crm_lead_pool_data'
const currentUser = '当前用户'

const sourceOptions = ['官网注册', '电话呼入', '展会获取', '老客户推荐', '社交媒体', '广告投放']
const owners = ['张明', '李伟', '王芳', '陈强', '赵磊', '孙琳']

const data = ref<PoolLead[]>([])
const search = ref('')
const sourceFilter = ref('')
const dateRange = ref<[string, string] | null>(null)
const page = ref(1)
const pageSize = ref(10)

function generateMock(): PoolLead[] {
  const names = [
    '九霄科技', '玖辰传媒', '昭和地产', '锦麟物流', '云汀餐饮',
    '明德教育', '泰昌金融', '东辉装饰', '岚山电子', '碧水文旅',
    '盛世投资', '银河制造', '青木建材', '蓝天医疗', '红枫工坊'
  ]
  const contacts = ['张先生', '李女士', '王总', '陈经理', '赵主管', '孙总监', '周老板']
  const list: PoolLead[] = []
  for (let i = 0; i < 15; i++) {
    const releaseDate = new Date(Date.now() - i * 86400000 * (Math.random() * 1.5 + 0.2))
    const taken = i % 6 === 0 && i !== 0
    list.push({
      id: `P${2000 + i}`,
      code: String(30240001 + i),
      customerName: names[i % names.length],
      contact: contacts[i % contacts.length],
      phone: `139${String(Math.floor(10000000 + Math.random() * 89999999))}`,
      source: sourceOptions[i % sourceOptions.length],
      releasedAt: releaseDate.toISOString().slice(0, 16).replace('T', ' '),
      previousOwner: owners[i % owners.length],
      taken,
      takenBy: taken ? owners[(i + 2) % owners.length] : ''
    })
  }
  return list
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      data.value = JSON.parse(raw) as PoolLead[]
      if (data.value.length === 0) throw new Error('empty')
    } else {
      throw new Error('no data')
    }
  } catch {
    data.value = generateMock()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data.value))
}

const filtered = computed(() => {
  return data.value.filter(item => {
    if (search.value) {
      const k = search.value.toLowerCase()
      if (!item.customerName.toLowerCase().includes(k) && !item.phone.includes(k)) return false
    }
    if (sourceFilter.value && item.source !== sourceFilter.value) return false
    if (dateRange.value && dateRange.value.length === 2) {
      const d = item.releasedAt.slice(0, 10)
      if (d < dateRange.value[0] || d > dateRange.value[1]) return false
    }
    return true
  })
})
const totalCount = computed(() => data.value.length)
const todayCount = computed(() => {
  const t = new Date().toISOString().slice(0, 10)
  return data.value.filter(i => i.releasedAt.startsWith(t)).length
})
const todayPercent = computed(() =>
  totalCount.value === 0 ? 0 : Math.round((todayCount.value / totalCount.value) * 100)
)
const weekCount = computed(() => {
  const limit = Date.now() - 7 * 86400000
  return data.value.filter(i => new Date(i.releasedAt).getTime() >= limit).length
})
const claimedCount = computed(() => data.value.filter(i => i.taken).length)

const paged = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})
const rangeFrom = computed(() => filtered.value.length === 0 ? 0 : (page.value - 1) * pageSize.value + 1)
const rangeTo = computed(() => Math.min(page.value * pageSize.value, filtered.value.length))

function rowClass({ row, rowIndex }: { row: PoolLead; rowIndex: number }) {
  const cls = rowIndex % 2 === 0 ? 'row-even' : 'row-odd'
  return row.taken ? `${cls} row-taken` : cls
}
function relTime(t: string) {
  const diff = Date.now() - new Date(t).getTime()
  const day = Math.floor(diff / 86400000)
  if (day <= 0) {
    const h = Math.floor(diff / 3600000)
    return h <= 0 ? '刚刚' : `${h} 小时前`
  }
  if (day < 7) return `${day} 天前`
  if (day < 30) return `${Math.floor(day / 7)} 周前`
  return `${Math.floor(day / 30)} 月前`
}
function resetFilters() {
  search.value = ''
  sourceFilter.value = ''
  dateRange.value = null
  page.value = 1
}
async function claim(row: PoolLead) {
  try {
    await ElMessageBox.confirm(
      `确认领取「${row.customerName}」？领取后该线索将归入您的个人客资。`,
      '领取线索',
      { confirmButtonText: '确认领取', cancelButtonText: '取消', type: 'success' }
    )
    const idx = data.value.findIndex(i => i.id === row.id)
    if (idx > -1) {
      data.value[idx].taken = true
      data.value[idx].takenBy = currentUser
      saveData()
    }
    ElMessage.success(`已成功领取「${row.customerName}」`)
  } catch { /* cancel */ }
}
async function assign(row: PoolLead) {
  try {
    const { value } = await ElMessageBox.prompt(
      `将「${row.customerName}」分配给指定员工`,
      '分配线索',
      {
        confirmButtonText: '确认分配',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入员工姓名',
        inputValidator: v => (v && v.trim().length > 0) || '请输入有效的员工姓名'
      }
    )
    const idx = data.value.findIndex(i => i.id === row.id)
    if (idx > -1) {
      data.value[idx].taken = true
      data.value[idx].takenBy = value
      saveData()
    }
    ElMessage.success(`已分配给「${value}」`)
  } catch { /* cancel */ }
}

onMounted(loadData)
</script>

<style scoped lang="scss">
.lead-pool {
  position: relative;
  min-height: 100%;
  padding: 24px 28px 40px;
  background: radial-gradient(ellipse at top left, rgba(212, 175, 55, 0.06) 0%, transparent 45%),
              radial-gradient(ellipse at bottom right, rgba(212, 175, 55, 0.04) 0%, transparent 50%),
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
  margin-bottom: 22px;
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
  display: inline-flex; align-items: center; gap: 10px;
  font-size: 11px; letter-spacing: 3px; color: #d4af37;
  text-transform: uppercase; font-weight: 500; margin-bottom: 14px;
  .eyebrow-dot {
    width: 6px; height: 6px; background: #d4af37; border-radius: 50%;
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
  font-size: 30px; font-weight: 600; color: #f4f4f8;
  letter-spacing: 1px; font-family: 'Georgia', 'PingFang SC', serif;
  .title-accent {
    margin-left: 12px; font-size: 14px; font-weight: 400;
    color: rgba(212, 175, 55, 0.7); font-style: italic; letter-spacing: 0.5px;
  }
}
.header-sub {
  margin: 0; font-size: 13px;
  color: rgba(232, 232, 236, 0.55); letter-spacing: 0.3px;
}
.ribbon {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 18px 10px 24px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  font-size: 12px;
  letter-spacing: 2px;
  color: #d4af37;
  &::before {
    content: '';
    position: absolute;
    left: 8px; top: 50%; transform: translateY(-50%);
    width: 4px; height: 60%;
    background: #d4af37;
  }
}

/* 统计卡片 */
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 22px;
}
.stat-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: linear-gradient(135deg, rgba(18, 18, 26, 0.9) 0%, rgba(20, 20, 28, 0.7) 100%);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    border-color: rgba(212, 175, 55, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.2);
  }
}
.stat-deco {
  position: absolute;
  right: -30px; top: -30px;
  width: 90px; height: 90px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, transparent 70%);
  pointer-events: none;
}
.stat-icon {
  width: 48px; height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.04));
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d4af37;
  flex-shrink: 0;
}
.stat-body {
  flex: 1;
  position: relative;
  z-index: 1;
}
.stat-label {
  font-size: 12px;
  color: rgba(232, 232, 236, 0.55);
  letter-spacing: 1.5px;
  text-transform: uppercase;
}
.stat-value {
  margin-top: 4px;
  display: flex;
  align-items: baseline;
  gap: 4px;
  .num {
    font-size: 26px;
    font-weight: 600;
    color: #f4f4f8;
    font-family: 'Georgia', serif;
    line-height: 1;
  }
  .unit {
    font-size: 12px;
    color: rgba(232, 232, 236, 0.4);
    letter-spacing: 1px;
  }
}
.stat-trend {
  margin-top: 6px;
  font-size: 11px;
  color: rgba(212, 175, 55, 0.7);
  display: flex;
  align-items: center;
  gap: 8px;
  letter-spacing: 0.5px;
  .trend-bar {
    width: 14px; height: 1px;
    background: rgba(212, 175, 55, 0.5);
  }
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
  width: 140px;
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
    .el-select__selected-item { color: #e8e8ec; }
  }
}
:deep(.black-date.el-date-editor) {
  background: rgba(18, 18, 26, 0.7) !important;
  border: 1px solid rgba(212, 175, 55, 0.18) !important;
  box-shadow: none !important;
  border-radius: 10px;
  height: 40px;
  &:hover { border-color: rgba(212, 175, 55, 0.4) !important; }
  &.is-active {
    border-color: #d4af37 !important;
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12) !important;
  }
  .el-range-input { background: transparent; color: #e8e8ec; }
  .el-range-input::placeholder { color: rgba(232, 232, 236, 0.35); }
  .el-range-separator { color: rgba(212, 175, 55, 0.5); }
  .el-range__icon { color: rgba(212, 175, 55, 0.6); }
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
  display: flex; align-items: center; gap: 12px;
  font-size: 15px; color: #f4f4f8; font-weight: 500; letter-spacing: 1px;
  .strip-bar { width: 3px; height: 16px; background: linear-gradient(180deg, #d4af37, #b88c2e); border-radius: 2px; }
  .strip-count {
    margin-left: 6px; padding: 2px 10px;
    border: 1px solid rgba(212, 175, 55, 0.3);
    border-radius: 20px; font-size: 11px; color: #d4af37; letter-spacing: 0.5px;
  }
}
.strip-meta { display: flex; gap: 16px; }
.legend {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: rgba(232, 232, 236, 0.5); letter-spacing: 0.5px;
  .legend-dot {
    width: 6px; height: 6px; border-radius: 50%;
    &.pending { background: #d4af37; box-shadow: 0 0 6px #d4af37; }
    &.taken { background: #555; }
  }
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
  tr.row-taken {
    opacity: 0.55;
    > td.el-table__cell { background: rgba(80, 80, 90, 0.04) !important; }
    &:hover > td.el-table__cell { box-shadow: inset 3px 0 0 #555; }
  }
  .el-table__empty-block { background: transparent; }
  .el-table__empty-text { color: rgba(232, 232, 236, 0.4); }
}

.cell-customer {
  display: flex; align-items: center; gap: 12px; padding-left: 16px;
}
.avatar {
  width: 36px; height: 36px; border-radius: 8px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.3);
  display: flex; align-items: center; justify-content: center;
  color: #d4af37; font-weight: 600; font-size: 15px;
  font-family: 'Georgia', serif;
  &.taken {
    background: rgba(80, 80, 90, 0.2);
    border-color: rgba(120, 120, 130, 0.3);
    color: rgba(212, 175, 55, 0.5);
  }
}
.name-block {
  .name-main {
    color: #f4f4f8; font-size: 14px; font-weight: 500; margin-bottom: 2px;
    &.dim { color: rgba(244, 244, 248, 0.5); text-decoration: line-through; text-decoration-color: rgba(212, 175, 55, 0.3); }
  }
  .name-sub { color: rgba(232, 232, 236, 0.4); font-size: 11px; letter-spacing: 0.5px; font-family: 'Georgia', monospace; }
}
.phone-text {
  font-family: 'Georgia', monospace;
  letter-spacing: 0.8px;
  color: #d8d8de;
  &.dim { color: rgba(216, 216, 222, 0.45); }
}
.gold-tag {
  display: inline-block; padding: 3px 10px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 4px;
  background: rgba(212, 175, 55, 0.06);
  color: #d4af37; font-size: 12px; letter-spacing: 0.5px;
  &.dim { color: rgba(212, 175, 55, 0.4); border-color: rgba(212, 175, 55, 0.18); background: transparent; }
}
.time-cell {
  line-height: 1.5;
  > div:first-child {
    color: #d8d8de; font-size: 13px;
    font-family: 'Georgia', monospace; letter-spacing: 0.3px;
    &.dim { color: rgba(216, 216, 222, 0.45); }
  }
  .time-rel { font-size: 11px; color: rgba(212, 175, 55, 0.7); margin-top: 2px; }
}
.owner-tag {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 12px; color: rgba(232, 232, 236, 0.7);
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.03);
  .el-icon { color: rgba(212, 175, 55, 0.6); font-size: 12px; }
  &.dim { color: rgba(232, 232, 236, 0.4); }
}
.ops {
  display: flex; gap: 8px; justify-content: flex-end; padding-right: 16px; align-items: center;
}
.op-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.25);
  color: #d4af37;
  padding: 5px 12px; font-size: 12px; border-radius: 6px;
  cursor: pointer; letter-spacing: 0.5px;
  transition: all 0.2s ease; font-family: inherit;
  &:hover {
    background: rgba(212, 175, 55, 0.12);
    border-color: #d4af37; color: #f4d97a;
    box-shadow: 0 0 12px rgba(212, 175, 55, 0.25);
  }
  &.op-primary {
    background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(212, 175, 55, 0.05));
    border-color: rgba(212, 175, 55, 0.5);
    &:hover {
      background: linear-gradient(135deg, #d4af37 0%, #b88c2e 100%);
      color: #0a0a0f;
      box-shadow: 0 0 18px rgba(212, 175, 55, 0.5);
    }
  }
  .el-icon { font-size: 13px; }
}
.taken-flag {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px;
  color: rgba(232, 232, 236, 0.4);
  padding: 4px 10px;
  border: 1px dashed rgba(120, 120, 130, 0.3);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  letter-spacing: 0.3px;
  .el-icon { color: rgba(106, 213, 142, 0.5); }
}

/* 表格底部 */
.table-foot {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);
}
.foot-info {
  font-size: 12px; color: rgba(232, 232, 236, 0.5); letter-spacing: 0.5px;
  em { font-style: normal; color: #d4af37; font-weight: 600; margin: 0 2px; font-family: 'Georgia', serif; }
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
    &:hover { color: #d4af37 !important; border-color: rgba(212, 175, 55, 0.5); }
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

@media (max-width: 1280px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 1100px) {
  .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
}
</style>

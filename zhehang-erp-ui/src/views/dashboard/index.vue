<template>
  <div class="dash-list">
    <!-- 顶部：编辑级标题区 -->
    <header class="dash-list__hero">
      <div class="hero-mark">
        <span class="mark-line"></span>
        <span class="mark-text">D · 001</span>
        <span class="mark-line mark-line--short"></span>
      </div>
      <div class="hero-row">
        <div class="hero-titles">
          <h1 class="hero-title">
            <span class="title-cn">驾驶舱</span>
            <span class="title-en">Dashboard Atelier</span>
          </h1>
          <p class="hero-sub">
            数据可视化工坊 · 黑金主题 · 共 <span class="hero-count">{{ filteredList.length }}</span> 个看板
          </p>
        </div>
        <div class="hero-actions">
          <div class="hero-search">
            <el-icon class="search-icon"><Search /></el-icon>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜索看板名称…"
              class="search-input"
            />
          </div>
          <button class="btn-primary" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            <span>新建驾驶舱</span>
          </button>
        </div>
      </div>
      <div class="hero-divider"></div>
    </header>

    <!-- 内容区 -->
    <section class="dash-list__body">
      <div v-if="loading" class="state-loading">
        <div class="state-loading__shimmer"></div>
        <p>加载中…</p>
      </div>

      <div v-else-if="filteredList.length === 0" class="state-empty">
        <div class="empty-frame">
          <div class="empty-grid">
            <span v-for="n in 9" :key="n" class="empty-cell"></span>
          </div>
          <h3 class="empty-title">尚未创建任何驾驶舱</h3>
          <p class="empty-desc">从空白画布开始，或选择一份预设模板开启你的第一个看板</p>
          <button class="btn-primary btn-primary--lg" @click="showCreateDialog = true">
            <el-icon><Plus /></el-icon>
            <span>开始创建</span>
          </button>
        </div>
      </div>

      <div v-else class="dash-grid">
        <article
          v-for="(item, idx) in filteredList"
          :key="item.id"
          class="dash-card"
          :style="{ animationDelay: `${idx * 60}ms` }"
          @click="handleEdit(item)"
        >
          <!-- 缩略图区域 -->
          <div class="dash-card__cover">
            <div class="cover-grid">
              <span
                v-for="(b, i) in coverBlocks(item)"
                :key="i"
                class="cover-block"
                :class="`cover-block--${b.kind}`"
                :style="{ gridColumn: `span ${b.span}`, gridRow: `span ${b.row}` }"
              >
                <span class="cover-block__bar" :style="{ height: `${b.h}%` }"></span>
              </span>
            </div>
            <div class="cover-meta">
              <span class="cover-tag">{{ item.widgets?.length ?? 0 }} 组件</span>
              <span class="cover-dot"></span>
              <span class="cover-tag cover-tag--theme">{{ item.theme === 'light' ? 'LIGHT' : 'DARK' }}</span>
            </div>
            <div class="cover-flare"></div>
          </div>

          <!-- 信息区 -->
          <div class="dash-card__info">
            <div class="info-head">
              <h3 class="info-title">{{ item.name }}</h3>
              <span class="info-index">№ {{ String(idx + 1).padStart(2, '0') }}</span>
            </div>
            <p class="info-desc">{{ item.description || '暂无描述' }}</p>
            <div class="info-foot">
              <span class="info-time">
                <el-icon><Clock /></el-icon>
                {{ formatTime(item.updatedAt) }}
              </span>
              <div class="info-acts" @click.stop>
                <button class="ico-btn" title="编辑" @click="handleEdit(item)">
                  <el-icon><Edit /></el-icon>
                </button>
                <button class="ico-btn" title="预览" @click="handlePreview(item)">
                  <el-icon><View /></el-icon>
                </button>
                <button class="ico-btn" title="复制" @click="handleClone(item)">
                  <el-icon><CopyDocument /></el-icon>
                </button>
                <button class="ico-btn ico-btn--danger" title="删除" @click="handleDelete(item)">
                  <el-icon><Delete /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>

    <!-- 新建弹窗 -->
    <el-dialog
      v-model="showCreateDialog"
      :show-close="false"
      width="640px"
      align-center
      class="create-dialog"
    >
      <template #header>
        <div class="dialog-head">
          <span class="dialog-mark">CREATE</span>
          <h2 class="dialog-title">新建驾驶舱</h2>
          <p class="dialog-sub">选择一种方式开启你的数据看板</p>
        </div>
      </template>

      <div class="create-tabs">
        <button
          class="create-tab"
          :class="{ 'is-active': createMode === 'blank' }"
          @click="createMode = 'blank'"
        >
          <div class="create-tab__ico">
            <el-icon :size="22"><Document /></el-icon>
          </div>
          <h4>空白创建</h4>
          <p>从零开始，自由编排</p>
        </button>
        <button
          class="create-tab"
          :class="{ 'is-active': createMode === 'template' }"
          @click="createMode = 'template'"
        >
          <div class="create-tab__ico">
            <el-icon :size="22"><Grid /></el-icon>
          </div>
          <h4>从模板创建</h4>
          <p>5 套精选业务模板</p>
        </button>
      </div>

      <div class="create-form">
        <label class="form-label">看板名称</label>
        <input
          v-model="newName"
          type="text"
          placeholder="例如：销售总览驾驶舱"
          class="form-input"
        />
      </div>

      <div v-if="createMode === 'template'" class="template-list">
        <div
          v-for="t in templates"
          :key="t.id"
          class="tpl-item"
          :class="{ 'is-active': selectedTpl === t.id }"
          @click="selectedTpl = t.id"
        >
          <div class="tpl-item__cat">{{ categoryLabel(t.category) }}</div>
          <h5>{{ t.name }}</h5>
          <p>{{ t.description }}</p>
        </div>
      </div>

      <template #footer>
        <div class="dialog-foot">
          <button class="btn-ghost" @click="showCreateDialog = false">取消</button>
          <button class="btn-primary" :disabled="!canConfirm" @click="handleCreate">
            <span>立即创建</span>
            <el-icon><Right /></el-icon>
          </button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Search, Edit, View, CopyDocument, Delete,
  Clock, Document, Grid, Right
} from '@element-plus/icons-vue'
import {
  getDashboardList,
  deleteDashboard,
  cloneDashboard,
  createDashboard,
  getTemplates,
  createFromTemplate,
} from '@/api/dashboard'
import type { DashboardConfig, DashboardTemplate, TemplateCategory } from '@/views/dashboard/types/dashboard'

const router = useRouter()

const loading = ref(false)
const keyword = ref('')
const list = ref<DashboardConfig[]>([])
const templates = ref<DashboardTemplate[]>([])

const showCreateDialog = ref(false)
const createMode = ref<'blank' | 'template'>('blank')
const newName = ref('')
const selectedTpl = ref('')

const filteredList = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((it) => it.name.toLowerCase().includes(k))
})

const canConfirm = computed(() => {
  if (!newName.value.trim()) return false
  if (createMode.value === 'template' && !selectedTpl.value) return false
  return true
})

const mockList: DashboardConfig[] = [
  {
    id: 'mock-sales-overview',
    name: '销售总览驾驶舱',
    description: '营收、成交、回款、客户全景透视',
    widgets: new Array(8).fill(null).map((_, i) => ({ id: `w${i}` } as any)),
    theme: 'dark',
    gridColumns: 24,
    createdAt: '2026-04-12T10:00:00Z',
    updatedAt: '2026-05-18T15:32:00Z',
    createdBy: 'admin',
  },
  {
    id: 'mock-acquisition',
    name: '获客分析中心',
    description: '渠道、漏斗、转化率全链路分析',
    widgets: new Array(7).fill(null).map((_, i) => ({ id: `w${i}` } as any)),
    theme: 'dark',
    gridColumns: 24,
    createdAt: '2026-04-20T09:00:00Z',
    updatedAt: '2026-05-19T11:08:00Z',
    createdBy: 'admin',
  },
  {
    id: 'mock-team-pk',
    name: '团队 PK 战报',
    description: '小组排行、目标完成、个人英雄榜',
    widgets: new Array(5).fill(null).map((_, i) => ({ id: `w${i}` } as any)),
    theme: 'dark',
    gridColumns: 24,
    createdAt: '2026-05-01T08:00:00Z',
    updatedAt: '2026-05-20T08:42:00Z',
    createdBy: 'admin',
  },
]

async function loadList() {
  loading.value = true
  try {
    const res = await getDashboardList()
    list.value = res?.data ?? []
    if (!list.value.length) list.value = mockList
  } catch {
    list.value = mockList
  } finally {
    loading.value = false
  }
}

async function loadTemplates() {
  try {
    const res = await getTemplates()
    templates.value = res?.data ?? []
  } catch {
    templates.value = [
      { id: 'sales-overview', name: '销售总览', description: '营收/成交/回款/排名', category: 'sales', widgets: [], theme: 'dark' },
      { id: 'team-pk', name: '团队 PK', description: '小组对比/个人排行', category: 'sales', widgets: [], theme: 'dark' },
      { id: 'acquisition', name: '获客分析', description: '线索/转化/渠道分布', category: 'acquisition', widgets: [], theme: 'dark' },
      { id: 'finance', name: '财务报表', description: '收支/利润/账目明细', category: 'finance', widgets: [], theme: 'dark' },
      { id: 'call-center', name: '呼叫中心', description: '通话/接通/坐席KPI', category: 'call-center', widgets: [], theme: 'dark' },
    ]
  }
}

function categoryLabel(c: TemplateCategory) {
  const map: Record<TemplateCategory, string> = {
    sales: '销售',
    acquisition: '获客',
    customer: '客户',
    finance: '财务',
    'call-center': '呼叫',
  }
  return map[c] || '其它'
}

function formatTime(t: string) {
  if (!t) return '—'
  const d = new Date(t)
  if (Number.isNaN(d.getTime())) return '—'
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface CoverBlock { kind: 'bar' | 'card' | 'line' | 'pie'; span: number; row: number; h: number }
function coverBlocks(item: DashboardConfig): CoverBlock[] {
  const seed = (item.id || '').length + (item.widgets?.length ?? 3)
  const presets: CoverBlock[][] = [
    [
      { kind: 'card', span: 2, row: 1, h: 60 },
      { kind: 'card', span: 2, row: 1, h: 60 },
      { kind: 'card', span: 2, row: 1, h: 60 },
      { kind: 'bar', span: 4, row: 2, h: 75 },
      { kind: 'pie', span: 2, row: 2, h: 90 },
    ],
    [
      { kind: 'card', span: 3, row: 1, h: 55 },
      { kind: 'card', span: 3, row: 1, h: 55 },
      { kind: 'line', span: 4, row: 2, h: 70 },
      { kind: 'bar', span: 2, row: 2, h: 80 },
    ],
    [
      { kind: 'bar', span: 6, row: 1, h: 65 },
      { kind: 'card', span: 2, row: 1, h: 50 },
      { kind: 'card', span: 2, row: 1, h: 50 },
      { kind: 'pie', span: 2, row: 1, h: 80 },
    ],
  ]
  return presets[seed % presets.length]
}

function handleEdit(item: DashboardConfig) {
  router.push({ path: `/dashboard/designer/${item.id}` })
}

function handlePreview(item: DashboardConfig) {
  router.push({ path: `/dashboard/view/${item.id}` })
}

async function handleClone(item: DashboardConfig) {
  try {
    await cloneDashboard(item.id)
    ElMessage.success('已复制看板')
    loadList()
  } catch {
    ElMessage.warning('复制接口未就绪，已模拟操作')
    list.value = [{ ...item, id: `${item.id}-copy-${Date.now()}`, name: `${item.name} 副本`, updatedAt: new Date().toISOString() }, ...list.value]
  }
}

async function handleDelete(item: DashboardConfig) {
  try {
    await ElMessageBox.confirm(`确认删除「${item.name}」？此操作不可恢复。`, '删除确认', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    try {
      await deleteDashboard(item.id)
      ElMessage.success('已删除')
    } catch {
      ElMessage.warning('删除接口未就绪，已模拟操作')
    }
    list.value = list.value.filter((it) => it.id !== item.id)
  } catch {
    /* cancelled */
  }
}

async function handleCreate() {
  if (!canConfirm.value) return
  try {
    if (createMode.value === 'blank') {
      const res = await createDashboard({ name: newName.value.trim(), theme: 'dark', gridColumns: 24, widgets: [] })
      const id = res?.data?.id
      ElMessage.success('已创建')
      showCreateDialog.value = false
      if (id) router.push({ path: `/dashboard/designer/${id}` })
      else loadList()
    } else {
      const res = await createFromTemplate(selectedTpl.value, newName.value.trim())
      const id = res?.data?.id
      ElMessage.success('已基于模板创建')
      showCreateDialog.value = false
      if (id) router.push({ path: `/dashboard/designer/${id}` })
      else loadList()
    }
  } catch {
    ElMessage.warning('接口未就绪，跳转至空白设计器')
    showCreateDialog.value = false
    router.push({ path: '/dashboard/designer/new', query: { name: newName.value.trim(), template: selectedTpl.value } })
  }
}

onMounted(() => {
  loadList()
  loadTemplates()
})
</script>

<style scoped>
.dash-list {
  min-height: 100%;
  background:
    radial-gradient(1200px 600px at 90% -10%, rgba(212, 175, 55, 0.08), transparent 60%),
    radial-gradient(800px 500px at -10% 110%, rgba(212, 175, 55, 0.05), transparent 60%),
    #0A0A0F;
  color: #EAEAEA;
  padding: 32px 40px 64px;
  font-family: 'PingFang SC', 'Source Han Sans CN', 'Noto Sans CJK SC', system-ui, sans-serif;
}

/* === Hero === */
.dash-list__hero {
  margin-bottom: 36px;
}
.hero-mark {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}
.mark-line {
  height: 1px;
  width: 56px;
  background: linear-gradient(90deg, #D4AF37, transparent);
}
.mark-line--short { width: 24px; background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.4)); }
.mark-text {
  font-family: 'Cormorant Garamond', 'Times New Roman', serif;
  font-size: 12px;
  letter-spacing: 0.4em;
  color: #D4AF37;
  font-weight: 600;
}
.hero-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.hero-titles { flex: 1; min-width: 320px; }
.hero-title {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 18px;
  flex-wrap: wrap;
}
.title-cn {
  font-size: 40px;
  font-weight: 700;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, #F2D06B 0%, #D4AF37 50%, #8E7424 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.title-en {
  font-family: 'Cormorant Garamond', 'Playfair Display', 'Times New Roman', serif;
  font-style: italic;
  font-size: 22px;
  font-weight: 400;
  color: #5A5A6E;
  letter-spacing: 0.05em;
}
.hero-sub {
  margin: 10px 0 0;
  font-size: 13px;
  color: #8B8B9A;
  letter-spacing: 0.05em;
}
.hero-count {
  color: #D4AF37;
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 600;
  margin: 0 4px;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-search {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 12px;
  padding: 10px 14px;
  width: 280px;
  transition: all 0.25s ease;
}
.hero-search:focus-within {
  border-color: rgba(212, 175, 55, 0.45);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
}
.search-icon { color: #8B8B9A; }
.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #EAEAEA;
  font-size: 13px;
}
.search-input::placeholder { color: #5A5A6E; }

.hero-divider {
  margin-top: 28px;
  height: 1px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.05) 30%, transparent 70%);
}

/* === Buttons === */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #D4AF37, #F2D06B);
  color: #0A0A0F;
  font-weight: 600;
  font-size: 13px;
  letter-spacing: 0.05em;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, transparent, rgba(255, 255, 255, 0.35), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 28px rgba(212, 175, 55, 0.4);
}
.btn-primary:hover::before { transform: translateX(100%); }
.btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
.btn-primary--lg { padding: 14px 30px; font-size: 14px; }

.btn-ghost {
  padding: 10px 22px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.2);
  color: #8B8B9A;
  font-size: 13px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-ghost:hover {
  border-color: rgba(212, 175, 55, 0.5);
  color: #EAEAEA;
}

/* === Loading / Empty === */
.state-loading {
  text-align: center;
  padding: 100px 0;
  color: #8B8B9A;
}
.state-loading__shimmer {
  width: 80px;
  height: 2px;
  margin: 0 auto 18px;
  background: linear-gradient(90deg, transparent, #D4AF37, transparent);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.state-empty {
  display: flex;
  justify-content: center;
  padding: 80px 24px;
}
.empty-frame {
  position: relative;
  max-width: 480px;
  width: 100%;
  text-align: center;
  padding: 56px 32px;
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 16px;
  overflow: hidden;
}
.empty-frame::before,
.empty-frame::after {
  content: '';
  position: absolute;
  width: 32px;
  height: 32px;
  border: 1.5px solid #D4AF37;
}
.empty-frame::before { top: 12px; left: 12px; border-right: none; border-bottom: none; }
.empty-frame::after { bottom: 12px; right: 12px; border-left: none; border-top: none; }
.empty-grid {
  display: grid;
  grid-template-columns: repeat(3, 24px);
  grid-auto-rows: 24px;
  gap: 6px;
  justify-content: center;
  margin-bottom: 28px;
}
.empty-cell {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.05));
  border-radius: 4px;
  animation: empty-pulse 2.4s ease-in-out infinite;
}
.empty-cell:nth-child(2n) { animation-delay: 0.2s; }
.empty-cell:nth-child(3n) { animation-delay: 0.4s; }
@keyframes empty-pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}
.empty-title {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: #EAEAEA;
  letter-spacing: 0.04em;
}
.empty-desc {
  margin: 0 0 28px;
  font-size: 13px;
  color: #8B8B9A;
  line-height: 1.7;
}

/* === Grid === */
.dash-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

/* === Card === */
.dash-card {
  position: relative;
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(.2,.8,.2,1), border-color 0.3s, box-shadow 0.3s;
  opacity: 0;
  transform: translateY(12px);
  animation: card-in 0.55s cubic-bezier(.2,.8,.2,1) forwards;
}
@keyframes card-in {
  to { opacity: 1; transform: translateY(0); }
}
.dash-card:hover {
  border-color: rgba(212, 175, 55, 0.45);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(212, 175, 55, 0.15);
  transform: translateY(-3px);
}
.dash-card:hover .cover-flare { opacity: 1; transform: translateX(0); }

/* Cover */
.dash-card__cover {
  height: 180px;
  background:
    linear-gradient(180deg, #16161F 0%, #0F0F18 100%);
  position: relative;
  padding: 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  overflow: hidden;
}
.cover-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-auto-rows: 50px;
  gap: 6px;
  height: 100%;
}
.cover-block {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.06), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 4px;
  position: relative;
  overflow: hidden;
}
.cover-block__bar {
  width: 60%;
  background: linear-gradient(180deg, #D4AF37, rgba(212, 175, 55, 0.2));
  border-radius: 2px;
}
.cover-block--card {
  align-items: center;
}
.cover-block--card .cover-block__bar {
  width: 80%;
  height: 4px !important;
  background: rgba(212, 175, 55, 0.5);
}
.cover-block--card::after {
  content: '';
  position: absolute;
  top: 8px;
  left: 8px;
  width: 30%;
  height: 4px;
  background: rgba(212, 175, 55, 0.25);
  border-radius: 2px;
}
.cover-block--line {
  background:
    linear-gradient(180deg, transparent 60%, rgba(212, 175, 55, 0.18) 60%, transparent 100%),
    repeating-linear-gradient(45deg, transparent 0 4px, rgba(212, 175, 55, 0.04) 4px 5px),
    linear-gradient(135deg, rgba(212, 175, 55, 0.04), transparent);
}
.cover-block--pie {
  background:
    radial-gradient(circle at 50% 60%, #D4AF37 0 15%, rgba(212, 175, 55, 0.5) 15% 28%, rgba(212, 175, 55, 0.18) 28% 40%, transparent 40%),
    linear-gradient(135deg, rgba(212, 175, 55, 0.04), transparent);
}
.cover-meta {
  position: absolute;
  bottom: 12px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.cover-tag {
  font-family: 'Cormorant Garamond', serif;
  font-size: 11px;
  letter-spacing: 0.15em;
  color: #D4AF37;
  text-transform: uppercase;
  font-weight: 600;
}
.cover-tag--theme { color: #5A5A6E; }
.cover-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.5);
}
.cover-flare {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 140px;
  height: 140px;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.18), transparent 60%);
  filter: blur(8px);
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.4s ease, transform 0.6s ease;
  pointer-events: none;
}

/* Info */
.dash-card__info { padding: 18px 20px 16px; }
.info-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}
.info-title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: #EAEAEA;
  letter-spacing: 0.03em;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-index {
  font-family: 'Cormorant Garamond', serif;
  font-size: 12px;
  color: #5A5A6E;
  letter-spacing: 0.1em;
  flex-shrink: 0;
}
.info-desc {
  margin: 6px 0 14px;
  font-size: 12px;
  color: #8B8B9A;
  line-height: 1.6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px dashed rgba(212, 175, 55, 0.1);
}
.info-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #5A5A6E;
}
.info-acts { display: flex; gap: 4px; }
.ico-btn {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #8B8B9A;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ico-btn:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
  color: #D4AF37;
}
.ico-btn--danger:hover {
  background: rgba(255, 107, 107, 0.08);
  border-color: rgba(255, 107, 107, 0.3);
  color: #FF6B6B;
}

/* === Dialog === */
:deep(.create-dialog .el-dialog) {
  background: #12121A;
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
}
:deep(.create-dialog .el-dialog__header) {
  padding: 0;
  margin: 0;
}
:deep(.create-dialog .el-dialog__body) {
  padding: 0 28px 24px;
  color: #EAEAEA;
}
:deep(.create-dialog .el-dialog__footer) {
  padding: 0 28px 24px;
}

.dialog-head {
  padding: 28px 28px 20px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}
.dialog-mark {
  font-family: 'Cormorant Garamond', serif;
  font-size: 11px;
  letter-spacing: 0.4em;
  color: #D4AF37;
  font-weight: 600;
}
.dialog-title {
  margin: 6px 0 4px;
  font-size: 22px;
  font-weight: 700;
  color: #EAEAEA;
  letter-spacing: 0.05em;
}
.dialog-sub {
  margin: 0;
  font-size: 12px;
  color: #8B8B9A;
}

.create-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 22px;
}
.create-tab {
  text-align: left;
  background: #16161F;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  padding: 18px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: #EAEAEA;
}
.create-tab h4 {
  margin: 10px 0 4px;
  font-size: 14px;
  letter-spacing: 0.05em;
}
.create-tab p {
  margin: 0;
  font-size: 12px;
  color: #8B8B9A;
}
.create-tab__ico {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(212, 175, 55, 0.08);
  border-radius: 8px;
  color: #D4AF37;
}
.create-tab.is-active {
  border-color: #D4AF37;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.06), transparent);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
}
.create-tab.is-active .create-tab__ico {
  background: linear-gradient(135deg, #D4AF37, #F2D06B);
  color: #0A0A0F;
}

.create-form { margin-top: 18px; }
.form-label {
  display: block;
  font-size: 12px;
  color: #8B8B9A;
  margin-bottom: 8px;
  letter-spacing: 0.06em;
}
.form-input {
  width: 100%;
  padding: 12px 14px;
  background: #16161F;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 10px;
  color: #EAEAEA;
  font-size: 13px;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.form-input:focus {
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
}

.template-list {
  margin-top: 18px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;
}
.template-list::-webkit-scrollbar { width: 4px; }
.template-list::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.2);
  border-radius: 2px;
}
.tpl-item {
  background: #16161F;
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.tpl-item h5 {
  margin: 4px 0 4px;
  font-size: 13px;
  color: #EAEAEA;
  letter-spacing: 0.04em;
}
.tpl-item p {
  margin: 0;
  font-size: 11px;
  color: #5A5A6E;
}
.tpl-item__cat {
  font-family: 'Cormorant Garamond', serif;
  font-size: 10px;
  letter-spacing: 0.2em;
  color: #D4AF37;
  text-transform: uppercase;
}
.tpl-item.is-active {
  border-color: #D4AF37;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), transparent);
}

.dialog-foot {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .dash-list { padding: 24px 18px 48px; }
  .title-cn { font-size: 30px; }
  .title-en { font-size: 16px; }
  .hero-search { width: 100%; }
}
</style>

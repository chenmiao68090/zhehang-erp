<template>
  <div class="task-page task-department">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">TASK · 03 / DEPARTMENT</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">C 类 · 项目部业务</span>
          <span class="title-en">Project Mission</span>
        </h1>
        <p class="page-desc">由项目经理统筹的多人协作型综合项目</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" class="btn-gold" @click="openCreate">+ 新建项目</el-button>
      </div>
    </header>

    <!-- 权限提示 -->
    <el-alert title="权限提示：仅主管级别以上可创建 C 类项目 · 项目经理可拆解为子任务并独立指派执行人" type="warning" :closable="false" class="perm-alert" />

    <!-- 项目类型索引 -->
    <section class="type-strip">
      <span class="strip-label">项目类型</span>
      <span v-for="t in SUB_TYPES" :key="t" class="type-chip" :class="{ active: typeFilter === t }" @click="typeFilter = typeFilter === t ? '' : t">{{ t }}</span>
      <span class="type-chip clear" v-if="typeFilter" @click="typeFilter = ''">× 清除</span>
    </section>

    <!-- 项目卡片列表 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">项目列表</h2>
        <span class="section-sub">PROJECTS · {{ projects.length }} 个</span>
      </div>

      <div v-loading="loading" class="project-grid">
        <article v-for="p in filteredProjects" :key="p.id" class="project-card" :class="{ active: current?.id === p.id }" @click="select(p)">
          <div class="card-head">
            <span class="sub-type">{{ p.subType }}</span>
            <el-tag :type="projStatusMap[p.status]?.type" size="small" effect="dark">{{ projStatusMap[p.status]?.label }}</el-tag>
          </div>
          <h3 class="proj-name">{{ p.name }}</h3>
          <div class="proj-meta">
            <span><i class="dot dot-gold"></i>客户：{{ p.customer }}</span>
            <span><i class="dot dot-gold"></i>项目经理：{{ p.manager }}</span>
          </div>
          <div class="progress-row">
            <div class="progress-bar"><div class="progress-fill" :style="{ width: progress(p) + '%' }"></div></div>
            <span class="progress-num">{{ progress(p) }}%</span>
          </div>
          <div class="card-foot">
            <span class="sub-count">子任务 {{ p.subTasks.filter(s => s.status === 'completed').length }} / {{ p.subTasks.length }}</span>
            <span class="enter">查看 →</span>
          </div>
        </article>
        <el-empty v-if="!loading && !filteredProjects.length" description="暂无项目" />
      </div>
    </section>

    <!-- 项目详情 Drawer -->
    <el-drawer v-model="dlg.detail" size="640px" :title="current?.name || '项目详情'">
      <div v-if="current" class="detail-block">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目类型">{{ current.subType }}</el-descriptions-item>
          <el-descriptions-item label="客户">{{ current.customer }}</el-descriptions-item>
          <el-descriptions-item label="项目经理">{{ current.manager }}</el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="projStatusMap[current.status]?.type" size="small">{{ projStatusMap[current.status]?.label }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="计划开始">{{ current.startDate }}</el-descriptions-item>
          <el-descriptions-item label="计划结束">{{ current.endDate }}</el-descriptions-item>
          <el-descriptions-item label="项目团队" :span="2">
            <el-tag v-for="m in current.team" :key="m" style="margin-right:6px" effect="plain">{{ m }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">{{ current.desc }}</el-descriptions-item>
        </el-descriptions>

        <div class="prog-block">
          <div class="prog-label">总体进度</div>
          <div class="progress-bar large"><div class="progress-fill" :style="{ width: progress(current) + '%' }"></div></div>
          <div class="prog-num">{{ progress(current) }}%</div>
        </div>

        <div class="sub-head">
          <h3>子任务列表</h3>
          <el-button class="btn-ghost" size="small" @click="openSubCreate">+ 添加子任务</el-button>
        </div>

        <el-table :data="current.subTasks" size="small" :row-class-name="subRowClass">
          <el-table-column prop="name" label="子任务名" min-width="180" />
          <el-table-column prop="assignee" label="执行人" width="110" />
          <el-table-column prop="planEnd" label="计划完成" width="120" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="subStatusMap[row.status]?.type" size="small">{{ subStatusMap[row.status]?.label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="160">
            <template #default="{ row, $index }">
              <el-button v-if="row.status === 'pending'" link type="primary" @click="setSubStatus($index, 'in_progress')">开始</el-button>
              <el-button v-if="row.status === 'in_progress'" link type="success" @click="setSubStatus($index, 'completed')">完成</el-button>
              <el-button link type="danger" @click="removeSub($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 创建项目 Dialog -->
    <el-dialog v-model="dlg.create" title="新建 C 类项目" width="640px">
      <el-form :model="form" label-width="100px">
        <el-form-item label="项目名称">
          <el-input v-model="form.name" placeholder="如：杭州数智-财税合规年度项目" />
        </el-form-item>
        <el-form-item label="项目类型">
          <el-select v-model="form.subType" placeholder="选择项目类型" style="width: 100%">
            <el-option v-for="t in SUB_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联客户">
          <el-select v-model="form.customer" placeholder="选择客户" style="width: 100%" filterable>
            <el-option v-for="c in CUSTOMERS" :key="c" :label="c" :value="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目经理">
          <el-select v-model="form.manager" placeholder="选择项目经理" style="width: 100%">
            <el-option v-for="m in PEOPLE" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目团队">
          <el-select v-model="form.team" multiple placeholder="选择项目成员" style="width: 100%">
            <el-option v-for="m in PEOPLE" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <div class="form-row">
          <el-form-item label="计划开始" style="flex:1">
            <el-date-picker v-model="form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
          <el-form-item label="计划结束" style="flex:1">
            <el-date-picker v-model="form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
          </el-form-item>
        </div>
        <el-form-item label="项目描述">
          <el-input v-model="form.desc" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.create = false">取消</el-button>
        <el-button type="primary" @click="doCreate">创建项目</el-button>
      </template>
    </el-dialog>

    <!-- 添加子任务 Dialog -->
    <el-dialog v-model="dlg.sub" title="添加子任务" width="500px">
      <el-form :model="subForm" label-width="100px">
        <el-form-item label="子任务名">
          <el-input v-model="subForm.name" />
        </el-form-item>
        <el-form-item label="执行人">
          <el-select v-model="subForm.assignee" style="width: 100%">
            <el-option v-for="m in PEOPLE" :key="m" :label="m" :value="m" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划完成">
          <el-date-picker v-model="subForm.planEnd" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dlg.sub = false">取消</el-button>
        <el-button type="primary" @click="doAddSub">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const SUB_TYPES = ['企业财税合规', '多公司账务合并', '上市审计配合', '大型资质代办', '企业内训', '专项税务筹划']
const CUSTOMERS: string[] = []
const PEOPLE: string[] = []

interface SubTask { id: number; name: string; assignee: string; planEnd: string; status: 'pending' | 'in_progress' | 'completed' }
interface Project {
  id: number; name: string; subType: string; customer: string; manager: string;
  team: string[]; status: 'planning' | 'in_progress' | 'completed' | 'paused';
  startDate: string; endDate: string; desc: string; subTasks: SubTask[]
}

const projStatusMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' | 'danger' }> = {
  planning: { label: '筹备中', type: 'info' },
  in_progress: { label: '进行中', type: 'primary' },
  completed: { label: '已完成', type: 'success' },
  paused: { label: '已暂停', type: 'warning' }
}
const subStatusMap: Record<string, { label: string; type: 'info' | 'warning' | 'primary' | 'success' }> = {
  pending: { label: '待开始', type: 'info' },
  in_progress: { label: '进行中', type: 'primary' },
  completed: { label: '已完成', type: 'success' }
}

const PROJECT_KEY = 'biz_c_projects'

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const loading = ref(false)
const projects = ref<Project[]>([])
const current = ref<Project | null>(null)
const dlg = reactive({ create: false, detail: false, sub: false })
const typeFilter = ref('')

const filteredProjects = computed(() => {
  if (!typeFilter.value) return projects.value
  return projects.value.filter(p => p.subType === typeFilter.value)
})

const form = reactive({
  name: '', subType: '', customer: '', manager: '',
  team: [] as string[], startDate: '', endDate: '', desc: ''
})
const subForm = reactive({ name: '', assignee: '', planEnd: '' })

function dateOff(d: number) { const x = new Date(); x.setDate(x.getDate() + d); return x.toISOString().slice(0, 10) }

function ensureSeed() {
  const raw = localStorage.getItem(PROJECT_KEY)
  if (raw) { try { projects.value = JSON.parse(raw); return } catch { /* fallthrough */ } }
  // 不再写入种子数据，返回空列表
  projects.value = []
}

function saveProjects() { localStorage.setItem(PROJECT_KEY, JSON.stringify(projects.value)) }

function progress(p: Project) {
  if (!p.subTasks.length) return 0
  const done = p.subTasks.filter(s => s.status === 'completed').length
  return Math.round(done / p.subTasks.length * 100)
}

function subRowClass({ row }: { row: SubTask }) {
  if (row.status === 'completed') return ''
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return new Date(row.planEnd).getTime() < today.getTime() ? 'row-overdue' : ''
}

function select(p: Project) {
  current.value = p
  dlg.detail = true
}

function openCreate() {
  Object.assign(form, { name: '', subType: '', customer: '', manager: '', team: [], startDate: dateOff(0), endDate: dateOff(60), desc: '' })
  dlg.create = true
}

function doCreate() {
  if (!form.name || !form.subType || !form.customer || !form.manager) {
    return ElMessage.warning('请完整填写项目信息')
  }
  const id = (projects.value.reduce((m, p) => Math.max(m, p.id), 0) || 0) + 1
  projects.value.unshift({
    id, name: form.name, subType: form.subType, customer: form.customer, manager: form.manager,
    team: form.team.length ? form.team : [form.manager],
    status: 'planning', startDate: form.startDate, endDate: form.endDate, desc: form.desc, subTasks: []
  })
  saveProjects()
  ElMessage.success('项目已创建')
  dlg.create = false
}

function openSubCreate() {
  Object.assign(subForm, { name: '', assignee: current.value?.manager || '', planEnd: dateOff(14) })
  dlg.sub = true
}

function doAddSub() {
  if (!current.value || !subForm.name) return ElMessage.warning('请填写子任务名')
  const id = (current.value.subTasks.reduce((m, s) => Math.max(m, s.id), 0) || 0) + 1
  current.value.subTasks.push({ id, name: subForm.name, assignee: subForm.assignee, planEnd: subForm.planEnd, status: 'pending' })
  syncProjectStatus(current.value)
  saveProjects()
  ElMessage.success('子任务已添加')
  dlg.sub = false
}

function setSubStatus(idx: number, st: SubTask['status']) {
  if (!current.value) return
  current.value.subTasks[idx].status = st
  syncProjectStatus(current.value)
  saveProjects()
}

function removeSub(idx: number) {
  if (!current.value) return
  current.value.subTasks.splice(idx, 1)
  syncProjectStatus(current.value)
  saveProjects()
}

function syncProjectStatus(p: Project) {
  if (!p.subTasks.length) { p.status = 'planning'; return }
  if (p.subTasks.every(s => s.status === 'completed')) p.status = 'completed'
  else if (p.subTasks.some(s => s.status === 'in_progress')) p.status = 'in_progress'
  else p.status = 'planning'
}

onMounted(() => {
  loading.value = true
  ensureSeed()
  loading.value = false
})
</script>

<style lang="scss" scoped>
.task-page { display: flex; flex-direction: column; gap: 22px; padding: 8px 4px 32px; }

.page-header {
  position: relative; padding: 30px 36px 26px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22); border-radius: 14px; overflow: hidden;
  display: flex; align-items: flex-end; justify-content: space-between;
  &::before { content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
                radial-gradient(circle at 8% 90%, rgba(135, 206, 235, 0.10), transparent 50%);
    pointer-events: none; }
  .header-meta, .header-main, .header-actions { position: relative; z-index: 1; }
}
.header-meta { display: flex; align-items: center; gap: 12px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: var(--gold-primary, #D4AF37); margin-bottom: 14px; }
.meta-tag { padding: 3px 10px; border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 2px; background: rgba(212, 175, 55, 0.06); }
.meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
.meta-time { color: rgba(212, 175, 55, 0.6); }
.page-title { display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn { font-size: 32px; font-weight: 700; letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
  .title-en { font-family: 'Playfair Display', 'Georgia', serif; font-style: italic; font-size: 18px; color: rgba(212, 175, 55, 0.55); }
}
.page-desc { font-size: 13px; color: var(--text-body, #A09B8C); margin: 0; }

.btn-gold {
  background: linear-gradient(135deg, #D4AF37 0%, #B5862E 100%) !important;
  border: none !important; color: #1a1a24 !important; font-weight: 600;
  &:hover { filter: brightness(1.1); }
}
.btn-ghost { background: transparent !important; border: 1px solid rgba(212, 175, 55, 0.35) !important; color: var(--gold-primary) !important;
  &:hover { background: rgba(212, 175, 55, 0.08) !important; } }

.perm-alert :deep(.el-alert) { background: rgba(230, 162, 60, 0.08); border: 1px solid rgba(230, 162, 60, 0.25); }

.type-strip { display: flex; align-items: center; flex-wrap: wrap; gap: 10px;
  padding: 12px 18px; background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px;
}
.strip-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.18em; color: rgba(212, 175, 55, 0.55); padding-right: 8px; border-right: 1px dashed rgba(212, 175, 55, 0.2); }
.type-chip { padding: 5px 12px; font-size: 12px; color: var(--text-body, #A09B8C);
  border: 1px solid rgba(212, 175, 55, 0.16); border-radius: 14px; cursor: pointer;
  background: rgba(212, 175, 55, 0.04); transition: all 0.2s ease;
  &:hover { color: var(--gold-primary, #D4AF37); border-color: rgba(212, 175, 55, 0.4); }
  &.active { color: #1a1a24; background: linear-gradient(135deg, #D4AF37 0%, #B5862E 100%); border-color: transparent; font-weight: 600; }
  &.clear { color: rgba(245, 108, 108, 0.85); border-color: rgba(245, 108, 108, 0.3); background: rgba(245, 108, 108, 0.06); }
}

.content-section {
  background: var(--bg-card, #16161E); border: 1px solid rgba(212, 175, 55, 0.12); border-radius: 12px; padding: 18px;
}
.section-head { display: flex; align-items: baseline; gap: 14px; margin-bottom: 14px; padding-left: 4px; }
.section-title { font-size: 18px; font-weight: 600; color: var(--text-primary, #F5F5F5); margin: 0; position: relative; padding-left: 14px;
  &::before { content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 16px; background: var(--gold-primary, #D4AF37); border-radius: 1px; }
}
.section-sub { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.4); }

.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.project-card {
  position: relative; padding: 20px 22px; border-radius: 12px;
  background: linear-gradient(160deg, rgba(212, 175, 55, 0.04) 0%, rgba(20, 20, 30, 0.6) 100%);
  border: 1px solid rgba(212, 175, 55, 0.14);
  cursor: pointer; transition: all 0.25s ease;
  &:hover { transform: translateY(-2px); border-color: rgba(212, 175, 55, 0.4); box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3); }
  &.active { border-color: var(--gold-primary); }
}
.card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;
  .sub-type { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.15em; color: var(--gold-primary); padding: 3px 8px; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 2px; }
}
.proj-name { font-size: 16px; font-weight: 600; color: var(--text-primary); margin: 4px 0 12px; line-height: 1.4; }
.proj-meta { display: flex; flex-direction: column; gap: 6px; font-size: 12px; color: var(--text-body); margin-bottom: 14px;
  .dot { display: inline-block; width: 4px; height: 4px; border-radius: 50%; background: var(--gold-primary); margin-right: 6px; vertical-align: middle; }
}
.progress-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.progress-bar { flex: 1; height: 6px; background: rgba(212, 175, 55, 0.08); border-radius: 3px; overflow: hidden;
  &.large { height: 10px; border-radius: 5px; }
}
.progress-fill { height: 100%; background: linear-gradient(90deg, #D4AF37, #FFC857); border-radius: 3px; transition: width 0.4s; }
.progress-num { font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 600; color: var(--gold-primary); }
.card-foot { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px dashed rgba(212, 175, 55, 0.15); font-size: 12px;
  .sub-count { color: var(--text-muted); }
  .enter { color: var(--gold-primary); font-family: 'JetBrains Mono', monospace; }
}

.detail-block { padding: 6px 4px; }
.prog-block { margin: 22px 0 18px; display: flex; align-items: center; gap: 14px;
  .prog-label { font-size: 13px; color: var(--text-body); width: 80px; }
  .prog-num { font-family: 'JetBrains Mono', monospace; font-weight: 700; color: var(--gold-primary); }
}
.sub-head { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 10px;
  h3 { margin: 0; font-size: 15px; font-weight: 600; color: var(--text-primary); }
}

.form-row { display: flex; gap: 12px; }

:deep(.el-table .row-overdue) { background: rgba(245, 108, 108, 0.08) !important; }
</style>

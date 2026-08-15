<template>
  <div class="task-workbench task-workbench-page workflow-report-page">
    <header class="page-head page-heading">
      <div class="page-title">
        <div class="eyebrow"><el-icon><DataAnalysis /></el-icon> 任务工单 · 执行监督</div>
        <h2>工作计划报表</h2>
        <p>用热力图识别缺报和低完成率，必报范围由角色或员工明确配置。</p>
      </div>
      <el-tag v-if="feigeTaskLocalDemo()" type="warning" size="large" effect="dark">LOCAL-DEMO 演示数据</el-tag>
    </header>
    <el-alert v-if="!manager && !feigeTaskLocalDemo()" title="只有主管、老板或管理员可以查看团队工作报表。" type="warning" show-icon :closable="false" />
    <el-alert v-if="errorText" :title="errorText" type="error" show-icon :closable="false" />

    <section v-if="manager || feigeTaskLocalDemo()" class="toolbar-card">
      <el-segmented v-model="query.cycleType" :options="cycleOptions" @change="handleCycleChange" />
      <el-date-picker v-if="query.cycleType === 'week'" v-model="weekDate" type="week" format="YYYY-MM-DD（第 ww 周）" :clearable="false" @change="handleWeekChange" />
      <el-date-picker v-else v-model="query.periodKey" type="month" value-format="YYYY-MM" :clearable="false" @change="loadReports" />
      <el-tree-select v-model="query.roleId" :data="roleTree" node-key="id" :props="treeProps" clearable check-strictly placeholder="全部角色" @change="loadReports" />
      <el-input v-model="query.keyword" clearable placeholder="搜索员工、部门" @keyup.enter="loadReports" />
      <el-button type="primary" :loading="loading" @click="loadReports">查询</el-button>
      <el-button :disabled="!reports.length" @click="exportReports">导出</el-button>
    </section>

    <section v-if="manager || feigeTaskLocalDemo()" class="metric-strip">
      <div><span>必报人数</span><strong>{{ reports.length }}</strong></div>
      <div><span>已全部提交</span><strong class="good">{{ fullSubmitted }}</strong></div>
      <div><span>存在缺报</span><strong class="danger">{{ missingPeople }}</strong></div>
      <div><span>平均完成率</span><strong>{{ averageRate }}%</strong></div>
    </section>

    <el-tabs v-if="manager || feigeTaskLocalDemo()" v-model="activeTab" class="report-tabs">
      <el-tab-pane label="完成热力图" name="heatmap">
        <section class="content-card heatmap-wrap">
          <div class="heatmap-legend"><span>完成情况</span><i class="heat full" />已提交 <i class="heat partial" />部分完成 <i class="heat missing" />缺报</div>
          <div class="heat-table">
            <div class="heat-header" :style="heatGridStyle"><strong>员工</strong><span v-for="day in dayHeaders" :key="day">{{ day.slice(-2) }}</span><em>完成率</em></div>
            <button v-for="row in reports" :key="row.userId" type="button" class="heat-row" :style="heatGridStyle" @click="detailRef?.open(row)">
              <strong><b>{{ row.userName }}</b><small>{{ row.deptName || row.roleName }}</small></strong>
              <span v-for="day in dayHeaders" :key="day" class="heat" :class="dayState(row, day)" :title="`${day} ${dayStateText(row, day)}`" />
              <em>{{ row.completionRate }}%</em>
            </button>
          </div>
        </section>
      </el-tab-pane>
      <el-tab-pane label="报表明细" name="list">
        <section class="content-card">
          <el-table :data="reports" v-loading="loading">
            <el-table-column prop="userName" label="员工" min-width="130" />
            <el-table-column prop="deptName" label="部门" min-width="150" />
            <el-table-column prop="roleName" label="角色" min-width="130" />
            <el-table-column prop="requiredDays" label="应报" width="80" align="center" />
            <el-table-column prop="submittedDays" label="已报" width="80" align="center" />
            <el-table-column prop="missingDays" label="缺报" width="80" align="center">
              <template #default="{ row }"><strong :class="{ danger: row.missingDays > 0 }">{{ row.missingDays }}</strong></template>
            </el-table-column>
            <el-table-column label="完成率" min-width="180">
              <template #default="{ row }"><el-progress :percentage="row.completionRate" :status="row.completionRate >= 100 ? 'success' : undefined" /></template>
            </el-table-column>
            <el-table-column label="操作" width="100"><template #default="{ row }"><el-button link type="primary" @click="detailRef?.open(row)">查看详情</el-button></template></el-table-column>
          </el-table>
        </section>
      </el-tab-pane>
      <el-tab-pane label="必报范围" name="scope">
        <section class="content-card scope-card">
          <div class="section-head"><div><h3>必报范围</h3><p>只配置确实需要提交工作报告的角色或员工，减少无效填报。</p></div><el-button type="primary" @click="openScope">新增范围</el-button></div>
          <el-alert v-if="!scopeLoading&&!scopes.length" title="尚未配置必报范围" description="未配置时不会产生应报人员和缺报统计，请至少添加一个角色或员工。" type="warning" show-icon :closable="false" class="scope-empty-alert" />
          <el-alert v-if="!roleTree.length&&!staff.length" title="系统暂无可选角色或员工" description="请先在系统角色和员工管理中完成组织配置，本页不另建角色。" type="info" show-icon :closable="false" class="scope-empty-alert" />
          <el-table :data="scopes" v-loading="scopeLoading" empty-text="暂无必报范围，请点击右上角新增">
            <el-table-column label="类型" width="100"><template #default="{ row }"><el-tag>{{ row.scopeType === 'role' ? '角色' : '员工' }}</el-tag></template></el-table-column>
            <el-table-column prop="targetName" label="范围对象" min-width="180" />
            <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
            <el-table-column label="操作" width="90"><template #default="{ row }"><el-popconfirm title="确认移除此必报范围？" @confirm="removeScope(row.id)"><template #reference><el-button link type="danger">移除</el-button></template></el-popconfirm></template></el-table-column>
          </el-table>
        </section>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="scopeDialog" title="新增必报范围" width="500px">
      <el-form label-width="90px">
        <el-form-item label="范围类型"><el-radio-group v-model="scopeForm.scopeType"><el-radio-button value="role">按角色</el-radio-button><el-radio-button value="user">按员工</el-radio-button></el-radio-group></el-form-item>
        <el-form-item label="选择对象">
          <el-tree-select v-if="scopeForm.scopeType === 'role'" v-model="scopeForm.targetId" :data="roleTree" node-key="id" :props="treeProps" check-strictly style="width:100%" />
          <el-select v-else v-model="scopeForm.targetId" filterable style="width:100%"><el-option v-for="person in staff" :key="person.id" :value="person.id" :label="`${person.name} · ${person.deptName || ''}`" /></el-select>
        </el-form-item>
      </el-form>
      <template #footer><el-button @click="scopeDialog=false">取消</el-button><el-button type="primary" @click="saveScope">保存</el-button></template>
    </el-dialog>
    <WorkflowReportDetail ref="detailRef" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { DataAnalysis } from '@element-plus/icons-vue'
import type { RequiredScope, RoleTreeNode, StaffOption, WorkflowReportRow } from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '@feige-task-data-source'
import WorkflowReportDetail from './components/WorkflowReportDetail.vue'
import './common.scss'

const activeTab = ref('heatmap')
const loading = ref(false), scopeLoading = ref(false), manager = ref(false)
const reports = ref<WorkflowReportRow[]>([]), scopes = ref<RequiredScope[]>([])
const roleTree = ref<RoleTreeNode[]>([]), staff = ref<StaffOption[]>([])
const errorText = ref('')
const now = new Date()
const weekDate = ref(new Date(now))
const query = reactive({ cycleType: 'day', periodKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, roleId: undefined as number | undefined, keyword: '' })
const cycleOptions = [{ label: '日报', value: 'day' }, { label: '周报', value: 'week' }, { label: '月报', value: 'month' }]
const treeProps = { label: 'name', children: 'children', value: 'id' }
const detailRef = ref<InstanceType<typeof WorkflowReportDetail>>()
const scopeDialog = ref(false)
const scopeForm = reactive({ scopeType: 'role' as 'role'|'user', targetId: undefined as number|undefined })

function unwrap<T>(value: any): T { return (value?.data?.data ?? value?.data ?? value) as T }
const fullSubmitted = computed(() => reports.value.filter(row => row.missingDays === 0).length)
const missingPeople = computed(() => reports.value.filter(row => row.missingDays > 0).length)
const averageRate = computed(() => reports.value.length ? Math.round(reports.value.reduce((sum,row)=>sum+row.completionRate,0)/reports.value.length) : 0)
const dayHeaders = computed(() => Array.from(new Set(reports.value.flatMap(row => row.days.map(day => day.date)))).sort())
const heatGridStyle = computed(() => {
  const dayCount = Math.max(dayHeaders.value.length, 1)
  return {
    gridTemplateColumns: `190px repeat(${dayCount}, 28px) 76px`,
    minWidth: `${190 + dayCount * 33 + 86}px`
  }
})
function dayEntry(row: WorkflowReportRow, date: string) { return row.days.find(day => day.date === date) }
function dayState(row: WorkflowReportRow, date: string) { const day=dayEntry(row,date); if(!day?.submitted) return 'missing'; return (day.done||0) >= (day.total||0) ? 'full':'partial' }
function dayStateText(row: WorkflowReportRow, date: string) { const state=dayState(row,date); return state==='full'?'已提交且完成':state==='partial'?'已提交但未全部完成':'缺报' }

function currentWeekKey(date = new Date()) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((utc.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function handleCycleChange() {
  if (query.cycleType === 'week') weekDate.value = new Date(now)
  query.periodKey = query.cycleType === 'week'
    ? currentWeekKey(weekDate.value)
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  loadReports()
}

function handleWeekChange(value: Date | null) {
  if (!value) return
  query.periodKey = currentWeekKey(new Date(value))
  loadReports()
}

async function loadReports() {
  loading.value=true; errorText.value=''
  try { reports.value = unwrap<WorkflowReportRow[]>(await feigeTaskData.workflowReport({ ...query })) || [] }
  catch { reports.value=[]; errorText.value='报表加载失败，生产环境不会自动填充演示数据。' }
  finally { loading.value=false }
}
async function loadScopes() { scopeLoading.value=true; try { scopes.value=unwrap<RequiredScope[]>(await feigeTaskData.requiredScopes())||[] } catch { scopes.value=[] } finally { scopeLoading.value=false } }
async function loadOptions() { try { const [roles,people]=await Promise.all([feigeTaskData.roleTree(),feigeTaskData.staffOptions()]); roleTree.value=unwrap<RoleTreeNode[]>(roles)||[]; staff.value=unwrap<StaffOption[]>(people)||[] } catch { roleTree.value=[]; staff.value=[] } }
async function loadCapabilities() { try { manager.value=Boolean((await feigeTaskData.capabilities())?.manager) } catch { manager.value=false } }
function openScope(){ scopeForm.scopeType='role'; scopeForm.targetId=undefined; scopeDialog.value=true }
async function saveScope(){
  if(!scopeForm.targetId) return ElMessage.warning('请选择范围对象')
  const source=scopeForm.scopeType==='role' ? flattenRoles(roleTree.value) : staff.value
  const target=source.find((item:any)=>item.id===scopeForm.targetId)
  try { await feigeTaskData.saveRequiredScope({ scopeType:scopeForm.scopeType,targetId:scopeForm.targetId,targetName:(target as any)?.name||'未命名对象',enabled:true }); scopeDialog.value=false; ElMessage.success(feigeTaskLocalDemo()?'LOCAL-DEMO：预览范围已更新':'必报范围已保存'); await loadScopes() } catch { ElMessage.error('必报范围保存失败') }
}
function flattenRoles(nodes:RoleTreeNode[]):RoleTreeNode[]{ return nodes.flatMap(node=>[node,...flattenRoles(node.children||[])]) }
async function removeScope(id:number){ try { await feigeTaskData.deleteRequiredScope(id); ElMessage.success('已移除'); await loadScopes() } catch { ElMessage.error('移除失败') } }
function csvCell(value: unknown) {
  const text = String(value ?? '')
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text
  return `"${safe.replace(/"/g, '""')}"`
}
function exportReports() {
  const rows = reports.value.map((row) => [row.userName, row.deptName, row.roleName, row.requiredDays, row.submittedDays, row.missingDays, `${row.completionRate}%`])
  const csv = [['员工', '部门', '角色', '应报', '已报', '缺报', '完成率'], ...rows].map((row) => row.map(csvCell).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `工作计划报表-${query.cycleType}-${query.periodKey}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
onMounted(async()=>{ await loadCapabilities(); if(manager.value||feigeTaskLocalDemo()){ loadOptions(); loadReports(); loadScopes() } })
</script>

<style scoped lang="scss">
.workflow-report-page { display:grid; gap:16px; }
.toolbar-card { display:grid; grid-template-columns:auto 180px 220px minmax(180px,1fr) auto auto; gap:10px; align-items:center; background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:14px; }
.metric-strip { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.metric-strip div { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:16px; display:grid; gap:6px; }
.metric-strip span { color:#6b7280; }.metric-strip strong{font-size:26px}.good{color:#16a34a}.danger{color:#dc2626}
.content-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}.heatmap-legend{display:flex;gap:8px;align-items:center;justify-content:flex-end;color:#6b7280;margin-bottom:12px}
.heat-table{overflow:auto}.heat-header,.heat-row{display:grid;gap:5px;align-items:center;padding:7px;border-bottom:1px solid #eef2f7}.heat-row{background:#fff;width:100%;border-left:0;border-right:0;border-top:0;text-align:left;cursor:pointer}.heat-row strong{display:grid}.heat-row small{font-weight:400;color:#6b7280}.heat-row em{font-style:normal;text-align:right;font-weight:700}.heat{width:24px;height:24px;border-radius:5px;display:inline-block}.heat.full{background:#22c55e}.heat.partial{background:#fbbf24}.heat.missing{background:#fecaca}
.section-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.section-head h3{margin:0 0 5px}.section-head p{margin:0;color:#6b7280}
.scope-empty-alert{margin-bottom:12px}
@media(max-width:1000px){.toolbar-card{grid-template-columns:1fr 1fr}.metric-strip{grid-template-columns:1fr 1fr}}
</style>

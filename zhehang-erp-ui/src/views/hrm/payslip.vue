<template>
  <div class="payslip">
    <header class="ps-head">
      <div>
        <h2 class="ps-title">工资条核算</h2>
        <p class="ps-sub">按月录入员工工资条(可逐条新增或批量导入),核对后「发放」,员工在自助端签字确认或提出异议。</p>
      </div>
      <div class="ps-head-actions">
        <el-button type="primary" :icon="Plus" @click="openEdit()">新增工资条</el-button>
        <el-button :icon="Upload" @click="openImport">批量导入</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <!-- 总览计数 -->
    <div class="ps-overview">
      <div class="ov-card" :class="{ active: query.confirmStatus === undefined }" @click="filterStatus(undefined)">
        <div class="ov-num">{{ counts.all }}</div>
        <div class="ov-lbl">全部</div>
      </div>
      <div class="ov-card" :class="{ active: query.confirmStatus === 1 }" @click="filterStatus(1)">
        <div class="ov-num" style="color:#e6a23c">{{ counts.pending }}</div>
        <div class="ov-lbl">待确认</div>
      </div>
      <div class="ov-card" :class="{ active: query.confirmStatus === 2 }" @click="filterStatus(2)">
        <div class="ov-num" style="color:#67c23a">{{ counts.confirmed }}</div>
        <div class="ov-lbl">已确认</div>
      </div>
      <div class="ov-card" :class="{ active: query.confirmStatus === 3 }" @click="filterStatus(3)">
        <div class="ov-num" style="color:#f56c6c">{{ counts.disputed }}</div>
        <div class="ov-lbl">有异议</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="ps-filter">
      <el-date-picker v-model="query.payMonth" type="month" value-format="YYYY-MM" placeholder="选择薪资月份" clearable style="width:170px" />
      <el-select v-model="query.deptName" placeholder="部门" clearable filterable style="width:180px">
        <el-option v-for="d in deptOptions" :key="d.id || d.deptName" :label="d.deptName" :value="d.deptName" />
      </el-select>
      <el-select v-model="query.employeeId" placeholder="员工姓名" clearable filterable style="width:190px">
        <el-option v-for="c in employees" :key="c.id" :label="employeeLabel(c)" :value="c.id" />
      </el-select>
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <el-button @click="resetFilter">重置</el-button>
      <el-button v-if="query.payMonth" type="warning" plain :icon="Promotion" @click="distributeMonth">发放本月全部待发放</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" element-loading-text="加载中…" border stripe size="small" max-height="560">
      <el-table-column label="月份" prop="payMonth" width="90" align="center" />
      <el-table-column label="姓名" prop="employeeName" width="90" show-overflow-tooltip />
      <el-table-column label="部门" prop="deptName" width="110" show-overflow-tooltip />
      <el-table-column label="岗位" prop="postName" width="100" show-overflow-tooltip />
      <el-table-column label="出勤天" prop="actualAttendanceDays" width="72" align="right" />
      <el-table-column label="基本" prop="baseSalary" width="90" align="right"><template #default="{ row }">{{ fmt(row.baseSalary) }}</template></el-table-column>
      <el-table-column label="绩效" prop="performanceSalary" width="90" align="right"><template #default="{ row }">{{ fmt(row.performanceSalary) }}</template></el-table-column>
      <el-table-column label="提成" prop="commission" width="90" align="right"><template #default="{ row }">{{ fmt(row.commission) }}</template></el-table-column>
      <el-table-column label="社保扣" prop="socialInsuranceDeduct" width="90" align="right"><template #default="{ row }">{{ fmt(row.socialInsuranceDeduct) }}</template></el-table-column>
      <el-table-column label="个税扣" prop="taxDeduct" width="90" align="right"><template #default="{ row }">{{ fmt(row.taxDeduct) }}</template></el-table-column>
      <el-table-column label="实发" prop="netSalary" width="110" align="right"><template #default="{ row }"><b class="ps-net">¥{{ fmt(row.netSalary) }}</b></template></el-table-column>
      <el-table-column label="状态" width="110" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="STATUS_TAG[row.confirmStatus] || 'info'" effect="light">{{ STATUS_LABEL[row.confirmStatus] || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="异议内容" prop="feedback" min-width="140" show-overflow-tooltip>
        <template #default="{ row }"><span v-if="row.confirmStatus === 3" style="color:#f56c6c">{{ row.feedback || '-' }}</span><span v-else>-</span></template>
      </el-table-column>
      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button v-if="row.confirmStatus === 0" size="small" link type="warning" @click="distributeOne(row)">发放</el-button>
          <el-button size="small" link type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无工资条,请新增或批量导入" :image-size="80" /></template>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="ps-pager"
      background layout="total, prev, pager, next"
      :total="total" :current-page="query.pageNum" :page-size="query.pageSize"
      @current-change="onPageChange" />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="editDlg.visible" :title="form.id ? '编辑工资条' : '新增工资条'" width="820px" destroy-on-close>
      <el-form :model="form" label-width="96px" class="ps-form">
        <el-divider content-position="left">基本信息</el-divider>
        <div class="ps-grid">
          <el-form-item label="薪资月份" required><el-input v-model="form.payMonth" placeholder="如 2026-06" /></el-form-item>
          <el-form-item label="员工">
            <el-select v-model="form.employeeId" filterable placeholder="选择员工(用于员工自助查看)" style="width:100%" @change="onEmpPick">
              <el-option v-for="c in employees" :key="c.id" :label="c.name + (c.deptName ? ' / ' + c.deptName : '')" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="姓名"><el-input v-model="form.employeeName" placeholder="员工姓名" /></el-form-item>
          <el-form-item label="部门"><el-input v-model="form.deptName" /></el-form-item>
          <el-form-item label="岗位"><el-input v-model="form.postName" /></el-form-item>
          <el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="银行卡号"><el-input v-model="form.bankCard" /></el-form-item>
          <el-form-item label="入职日期"><el-date-picker v-model="form.entryDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="转正日期"><el-date-picker v-model="form.regularDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
          <el-form-item label="离职日期"><el-date-picker v-model="form.leaveDate" type="date" value-format="YYYY-MM-DD" style="width:100%" /></el-form-item>
        </div>
        <el-divider content-position="left">考勤</el-divider>
        <div class="ps-grid">
          <el-form-item label="事假(天)"><el-input-number v-model="form.personalLeave" :min="0" :precision="1" :controls="false" style="width:100%" /></el-form-item>
          <el-form-item label="病假(天)"><el-input-number v-model="form.sickLeave" :min="0" :precision="1" :controls="false" style="width:100%" /></el-form-item>
          <el-form-item label="带薪假(天)"><el-input-number v-model="form.otherPaidLeave" :min="0" :precision="1" :controls="false" style="width:100%" /></el-form-item>
          <el-form-item label="出勤天数"><el-input-number v-model="form.actualAttendanceDays" :min="0" :precision="1" :controls="false" style="width:100%" /></el-form-item>
        </div>
        <el-divider content-position="left">收入</el-divider>
        <div class="ps-grid">
          <el-form-item label="基本工资"><el-input-number v-model="form.baseSalary" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="绩效工资"><el-input-number v-model="form.performanceSalary" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="提成"><el-input-number v-model="form.commission" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="奖金"><el-input-number v-model="form.bonus" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="补发"><el-input-number v-model="form.reissue" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
        </div>
        <el-divider content-position="left">扣款</el-divider>
        <div class="ps-grid">
          <el-form-item label="社保扣款"><el-input-number v-model="form.socialInsuranceDeduct" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="公积金扣款"><el-input-number v-model="form.fundDeduct" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="个税扣款"><el-input-number v-model="form.taxDeduct" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
          <el-form-item label="其他扣款"><el-input-number v-model="form.otherDeduct" :min="0" :precision="2" :controls="false" style="width:100%" @change="recalc" /></el-form-item>
        </div>
        <el-divider content-position="left">实发</el-divider>
        <div class="ps-grid">
          <el-form-item label="实发工资">
            <el-input-number v-model="form.netSalary" :min="0" :precision="2" :controls="false" style="width:100%" />
            <el-button link type="primary" size="small" @click="recalc(true)">按上方自动算</el-button>
          </el-form-item>
          <el-form-item label="备注" style="grid-column: span 3"><el-input v-model="form.remark" /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="editDlg.saving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗(无 xlsx 依赖,采用「粘贴 TSV/CSV 多行」解析成数组落库) -->
    <el-dialog v-model="importDlg.visible" title="批量导入工资条" width="720px" destroy-on-close>
      <el-alert type="info" :closable="false" show-icon style="margin-bottom:10px"
        title="从 Excel 复制整块单元格,直接粘贴到下方文本框(支持制表符/逗号分隔)。首行必须是表头。" />
      <p class="ps-tpl">列顺序(表头名需包含以下关键词即可):<br>
        <code>薪资月份 姓名 部门 岗位 身份证号 手机号 银行卡号 出勤天数 基本工资 绩效工资 提成 奖金 补发 社保扣款 公积金扣款 个税扣款 其他扣款 实发工资 备注</code>
      </p>
      <el-input v-model="importText" type="textarea" :rows="10" placeholder="粘贴 Excel 数据(含表头行)" />
      <div v-if="importPreview.length" class="ps-preview">已解析 <b>{{ importPreview.length }}</b> 条,例:{{ importPreview[0].employeeName }} / {{ importPreview[0].payMonth }} / 实发 {{ importPreview[0].netSalary }}</div>
      <template #footer>
        <el-button @click="importDlg.visible = false">取消</el-button>
        <el-button @click="parseImport">解析预览</el-button>
        <el-button type="primary" :loading="importDlg.saving" :disabled="!importPreview.length" @click="submitImport">导入 {{ importPreview.length ? '(' + importPreview.length + '条)' : '' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { Plus, Upload, Refresh, Search, Promotion } from '@element-plus/icons-vue'
import { payslipApi, type Payslip } from '@/api/hrm'
import { deptApi, employeeApi } from '@/api/org'

const STATUS_LABEL: Record<number, string> = { 0: '待发放', 1: '已发放待确认', 2: '员工已确认', 3: '员工有异议' }
const STATUS_TAG: Record<number, string> = { 0: 'info', 1: 'warning', 2: 'success', 3: 'danger' }

const loading = ref(false)
const rows = ref<Payslip[]>([])
const total = ref(0)
const counts = reactive({ all: 0, pending: 0, confirmed: 0, disputed: 0 })
const query = reactive<any>({ pageNum: 1, pageSize: 10, payMonth: '', deptName: '', employeeId: undefined, confirmStatus: undefined })
const employees = ref<any[]>([])
const deptOptions = ref<any[]>([])

// 金额展示:两位小数 + 千分位(纯呈现,不改数值/接口)
const fmt = (v: any) => {
  const n = (v === null || v === undefined || v === '') ? 0 : Number(v)
  return (isNaN(n) ? 0 : n).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

async function load() {
  loading.value = true
  try {
    const res: any = await payslipApi.list({
      pageNum: query.pageNum, pageSize: query.pageSize,
      payMonth: query.payMonth || undefined,
      deptName: query.deptName || undefined,
      employeeId: query.employeeId || undefined,
      confirmStatus: query.confirmStatus
    })
    rows.value = res?.page?.records || []
    total.value = res?.page?.total || 0
    const c = res?.counts || {}
    counts.all = c.all || 0; counts.pending = c.pending || 0; counts.confirmed = c.confirmed || 0; counts.disputed = c.disputed || 0
  } catch (e: any) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

function filterStatus(s: number | undefined) { query.confirmStatus = s; query.pageNum = 1; load() }
function resetFilter() { query.payMonth = ''; query.deptName = ''; query.employeeId = undefined; query.confirmStatus = undefined; query.pageNum = 1; load() }
function onPageChange(p: number) { query.pageNum = p; load() }
function employeeLabel(c: any) { return c.name + (c.deptName ? ' / ' + c.deptName : '') }

// ------- 新增/编辑 -------
const editDlg = reactive({ visible: false, saving: false })
const emptyForm = (): Payslip => ({
  personalLeave: 0, sickLeave: 0, otherPaidLeave: 0, actualAttendanceDays: 0,
  baseSalary: 0, performanceSalary: 0, commission: 0, bonus: 0, reissue: 0,
  socialInsuranceDeduct: 0, fundDeduct: 0, taxDeduct: 0, otherDeduct: 0, netSalary: 0
})
const form = reactive<Payslip>(emptyForm())

function openEdit(row?: Payslip) {
  Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {})
  editDlg.visible = true
}
function onEmpPick(empId: number) {
  const c = employees.value.find(x => x.id === empId)
  if (c) { form.employeeName = c.name; form.deptName = c.deptName; form.postName = c.postName }
}
function recalc(force = false) {
  const income = num(form.baseSalary) + num(form.performanceSalary) + num(form.commission) + num(form.bonus) + num(form.reissue)
  const deduct = num(form.socialInsuranceDeduct) + num(form.fundDeduct) + num(form.taxDeduct) + num(form.otherDeduct)
  const net = Math.round((income - deduct) * 100) / 100
  if (force || !form.netSalary) form.netSalary = net
}
function num(v: any) { return Number(v) || 0 }

async function submitEdit() {
  if (!form.payMonth) { ElMessage.warning('请填写薪资月份'); return }
  if (!form.employeeName) { ElMessage.warning('请选择员工或填写姓名'); return }
  editDlg.saving = true
  try {
    await payslipApi.save(form)
    ElMessage.success('保存成功')
    editDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    editDlg.saving = false
  }
}

async function remove(row: Payslip) {
  try {
    await ElMessageBox.confirm(`确认删除 ${row.employeeName} ${row.payMonth} 的工资条?`, '提示', { type: 'warning' })
    await payslipApi.remove(row.id!)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
  }
}

// ------- 发放 -------
async function distributeOne(row: Payslip) {
  try {
    await ElMessageBox.confirm(`确认发放 ${row.employeeName} ${row.payMonth} 的工资条?员工将收到确认通知。`, '发放', { type: 'warning' })
    const n: any = await payslipApi.distribute({ ids: [row.id!] })
    ElMessage.success(`已发放 ${n} 条`)
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '发放失败')
  }
}
async function distributeMonth() {
  if (!query.payMonth) { ElMessage.warning('请先在筛选里填写薪资月份'); return }
  try {
    await ElMessageBox.confirm(`确认发放 ${query.payMonth} 全部「待发放」工资条?`, '整月发放', { type: 'warning' })
    const n: any = await payslipApi.distribute({ payMonth: query.payMonth })
    ElMessage.success(`已发放 ${n} 条`)
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '发放失败')
  }
}

// ------- 批量导入(无 xlsx 依赖:粘贴 Excel 单元格,按制表符/逗号解析) -------
const importDlg = reactive({ visible: false, saving: false })
const importText = ref('')
const importPreview = ref<Payslip[]>([])

// 表头关键词 -> Payslip 字段
const HEAD_MAP: Array<{ keys: string[]; field: keyof Payslip; num?: boolean }> = [
  { keys: ['薪资月份', '月份'], field: 'payMonth' },
  { keys: ['姓名'], field: 'employeeName' },
  { keys: ['部门'], field: 'deptName' },
  { keys: ['岗位'], field: 'postName' },
  { keys: ['身份证'], field: 'idCard' },
  { keys: ['手机', '电话'], field: 'phone' },
  { keys: ['银行卡', '卡号'], field: 'bankCard' },
  { keys: ['事假'], field: 'personalLeave', num: true },
  { keys: ['病假'], field: 'sickLeave', num: true },
  { keys: ['带薪假'], field: 'otherPaidLeave', num: true },
  { keys: ['出勤'], field: 'actualAttendanceDays', num: true },
  { keys: ['基本'], field: 'baseSalary', num: true },
  { keys: ['绩效'], field: 'performanceSalary', num: true },
  { keys: ['提成'], field: 'commission', num: true },
  { keys: ['奖金'], field: 'bonus', num: true },
  { keys: ['补发'], field: 'reissue', num: true },
  { keys: ['社保'], field: 'socialInsuranceDeduct', num: true },
  { keys: ['公积金'], field: 'fundDeduct', num: true },
  { keys: ['个税'], field: 'taxDeduct', num: true },
  { keys: ['其他扣'], field: 'otherDeduct', num: true },
  { keys: ['实发'], field: 'netSalary', num: true },
  { keys: ['备注'], field: 'remark' }
]

function openImport() { importText.value = ''; importPreview.value = []; importDlg.visible = true }

function splitCells(line: string): string[] {
  return line.includes('\t') ? line.split('\t') : line.split(',')
}

function parseImport() {
  const lines = importText.value.split(/\r?\n/).map(l => l.trim()).filter(l => l.length)
  if (lines.length < 2) { ElMessage.warning('至少需要表头 + 1 行数据'); importPreview.value = []; return }
  const headers = splitCells(lines[0]).map(h => h.trim())
  // 为每列匹配字段
  const colField: (keyof Payslip | null)[] = headers.map(h => {
    const hit = HEAD_MAP.find(m => m.keys.some(k => h.includes(k)))
    return hit ? hit.field : null
  })
  const list: Payslip[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCells(lines[i])
    const item: any = { confirmStatus: 0 }
    colField.forEach((field, idx) => {
      if (!field) return
      const raw = (cells[idx] ?? '').trim()
      const meta = HEAD_MAP.find(m => m.field === field)
      item[field] = meta?.num ? (raw === '' ? 0 : Number(raw.replace(/,/g, '')) || 0) : raw
    })
    if (!item.employeeName && !item.payMonth) continue // 跳过空行
    list.push(item)
  }
  importPreview.value = list
  ElMessage.success(`解析出 ${list.length} 条,请核对后导入`)
}

async function submitImport() {
  if (!importPreview.value.length) { ElMessage.warning('请先解析预览'); return }
  importDlg.saving = true
  try {
    const n: any = await payslipApi.batchSave(importPreview.value)
    ElMessage.success(`导入成功 ${n} 条`)
    importDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '导入失败')
  } finally {
    importDlg.saving = false
  }
}

// 员工下拉(复用花名册 /org/employee/roster:返回 org_employee.id/name/dept/post,HR/管理员/老板可见)。
// 绑定 form.employeeId = org_employee.id,与员工自助端 /hrm/payslip/my 的 currentEmployeeId() 同口径,确保员工能查到自己的工资条。
async function loadEmployees() {
  try {
    const list = (await employeeApi.roster()) as any[] || []
    employees.value = list.filter(e => e.status !== 3) // 过滤离职
  } catch { employees.value = [] }
}

function flattenDeptTree(nodes: any[], list: any[] = []) {
  for (const node of nodes || []) {
    list.push(node)
    if (Array.isArray(node.children) && node.children.length) flattenDeptTree(node.children, list)
  }
  return list
}

async function loadDepts() {
  try {
    const tree: any = await deptApi.tree()
    deptOptions.value = flattenDeptTree(tree?.data || tree || []).filter((d: any) => d.deptName)
  } catch { deptOptions.value = [] }
}

onMounted(() => { load(); loadEmployees(); loadDepts() })
</script>

<style scoped>
.payslip { padding: 4px 2px; }
.ps-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.ps-title { margin: 0 0 4px; font-size: 18px; font-weight: 600; }
.ps-sub { margin: 0; color: #909399; font-size: 12px; line-height: 1.6; }
.ps-head-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.ps-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px; }
.ov-card { border: 1px solid #ebeef5; border-radius: 8px; padding: 12px; text-align: center; cursor: pointer; transition: all .15s; background: #fff; }
.ov-card:hover { border-color: #409eff; box-shadow: 0 2px 8px rgba(64,158,255,.12); }
.ov-card.active { border-color: #409eff; box-shadow: 0 0 0 2px rgba(64,158,255,.15); }
.ov-num { font-size: 22px; font-weight: 700; line-height: 1.2; }
.ov-lbl { color: #909399; font-size: 12px; margin-top: 2px; }
.ps-filter { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 12px; }
.ps-net { color: #409eff; font-variant-numeric: tabular-nums; }
.ps-pager { margin-top: 12px; justify-content: flex-end; display: flex; }
.ps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0 14px; }
.ps-form :deep(.el-form-item) { margin-bottom: 12px; }
.ps-tpl { font-size: 12px; color: #606266; margin: 6px 0 10px; line-height: 1.6; }
.ps-tpl code { background: #f5f7fa; padding: 2px 4px; border-radius: 3px; }
.ps-preview { margin-top: 8px; font-size: 12px; color: #67c23a; }
/* 金额列数字等宽,右对齐更整齐 */
:deep(.el-table td.el-table__cell) { font-variant-numeric: tabular-nums; }
/* 窄屏响应式:统计卡两列、编辑表单单/双列 */
@media (max-width: 1024px) {
  .ps-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .ps-overview { grid-template-columns: repeat(2, 1fr); }
  .ps-grid { grid-template-columns: 1fr; }
}
</style>

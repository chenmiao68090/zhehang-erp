<template>
  <div class="social-fund-page">
    <header class="sf-head">
      <div>
        <h2 class="sf-title">社保公积金</h2>
        <p class="sf-sub">按月维护员工社保、公积金公司部分与个人部分，支持批量粘贴导入、编辑和删除。</p>
      </div>
      <div class="sf-actions">
        <el-button type="primary" :icon="Plus" @click="openEdit()">新增明细</el-button>
        <el-button :icon="Upload" @click="openImport">批量导入</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <div class="sf-stats">
      <div class="sf-stat"><span>本月社保参保人数</span><b>{{ stats.socialPeople || 0 }}</b></div>
      <div class="sf-stat"><span>本月公积金缴纳人数</span><b>{{ stats.fundPeople || 0 }}</b></div>
      <div class="sf-stat"><span>公司部分本月社保合计</span><b>¥{{ money(stats.socialCompanyTotal) }}</b></div>
      <div class="sf-stat"><span>公司部分本月公积金合计</span><b>¥{{ money(stats.fundCompanyTotal) }}</b></div>
    </div>

    <div class="sf-filter">
      <el-date-picker v-model="query.recordMonth" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width: 160px" clearable />
      <el-select v-model="query.employeeId" filterable clearable placeholder="员工" style="width: 180px">
        <el-option v-for="e in employees" :key="e.id" :label="employeeLabel(e)" :value="e.id" />
      </el-select>
      <el-input v-model="query.keyword" placeholder="姓名/身份证/手机号" clearable style="width: 220px" @keyup.enter="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe size="small" class="sf-table" max-height="580">
      <el-table-column label="序号" type="index" width="56" align="center" />
      <el-table-column prop="recordMonth" label="月份" width="90" align="center" />
      <el-table-column prop="employeeName" label="员工" width="90" show-overflow-tooltip />
      <el-table-column prop="idCard" label="身份证号" width="170" show-overflow-tooltip />
      <el-table-column prop="phone" label="手机号" width="120" />
      <el-table-column label="养老保险" align="center">
        <el-table-column label="公司" width="88" align="right"><template #default="{ row }">{{ money(row.pensionCompany) }}</template></el-table-column>
        <el-table-column label="个人" width="88" align="right"><template #default="{ row }">{{ money(row.pensionPersonal) }}</template></el-table-column>
      </el-table-column>
      <el-table-column label="失业保险" align="center">
        <el-table-column label="公司" width="88" align="right"><template #default="{ row }">{{ money(row.unemploymentCompany) }}</template></el-table-column>
        <el-table-column label="个人" width="88" align="right"><template #default="{ row }">{{ money(row.unemploymentPersonal) }}</template></el-table-column>
      </el-table-column>
      <el-table-column label="工伤保险" align="center">
        <el-table-column label="公司" width="88" align="right"><template #default="{ row }">{{ money(row.workInjuryCompany) }}</template></el-table-column>
        <el-table-column label="个人" width="88" align="right"><template #default="{ row }">{{ money(row.workInjuryPersonal) }}</template></el-table-column>
      </el-table-column>
      <el-table-column label="医疗保险" align="center">
        <el-table-column label="公司" width="88" align="right"><template #default="{ row }">{{ money(row.medicalCompany) }}</template></el-table-column>
        <el-table-column label="个人" width="88" align="right"><template #default="{ row }">{{ money(row.medicalPersonal) }}</template></el-table-column>
      </el-table-column>
      <el-table-column label="社保合计" align="center">
        <el-table-column label="公司部分" width="100" align="right"><template #default="{ row }">{{ money(socialCompany(row)) }}</template></el-table-column>
        <el-table-column label="个人部分" width="100" align="right"><template #default="{ row }">{{ money(socialPersonal(row)) }}</template></el-table-column>
      </el-table-column>
      <el-table-column prop="socialFirstMonth" label="社保首次参保月份" width="130" align="center" />
      <el-table-column label="公积金" align="center">
        <el-table-column label="公司" width="88" align="right"><template #default="{ row }">{{ money(row.housingFundCompany) }}</template></el-table-column>
        <el-table-column label="个人" width="88" align="right"><template #default="{ row }">{{ money(row.housingFundPersonal) }}</template></el-table-column>
      </el-table-column>
      <el-table-column prop="fundFirstMonth" label="公积金首次缴纳月份" width="140" align="center" />
      <el-table-column label="操作" width="130" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无社保公积金记录" :image-size="80" /></template>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="sf-pager"
      background
      layout="total, sizes, prev, pager, next"
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :page-sizes="[10, 20, 50]"
      :total="total"
      @change="load"
    />

    <el-dialog v-model="editDlg.visible" :title="form.id ? '编辑社保公积金' : '新增社保公积金'" width="880px" destroy-on-close>
      <el-form :model="form" label-width="118px" class="sf-form">
        <el-divider content-position="left">基础信息</el-divider>
        <div class="sf-grid">
          <el-form-item label="月份" required><el-date-picker v-model="form.recordMonth" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
          <el-form-item label="员工" required>
            <el-select v-model="form.employeeId" filterable clearable placeholder="选择员工" style="width: 100%" @change="onEmployeePick">
              <el-option v-for="e in employees" :key="e.id" :label="employeeLabel(e)" :value="e.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="员工姓名" required><el-input v-model="form.employeeName" /></el-form-item>
          <el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item>
          <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="备注"><el-input v-model="form.remark" /></el-form-item>
        </div>

        <el-divider content-position="left">社保明细</el-divider>
        <div class="sf-grid">
          <money-input label="养老公司" v-model="form.pensionCompany" />
          <money-input label="养老个人" v-model="form.pensionPersonal" />
          <money-input label="失业公司" v-model="form.unemploymentCompany" />
          <money-input label="失业个人" v-model="form.unemploymentPersonal" />
          <money-input label="工伤公司" v-model="form.workInjuryCompany" />
          <money-input label="工伤个人" v-model="form.workInjuryPersonal" />
          <money-input label="医疗公司" v-model="form.medicalCompany" />
          <money-input label="医疗个人" v-model="form.medicalPersonal" />
          <el-form-item label="社保首次参保"><el-date-picker v-model="form.socialFirstMonth" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
        </div>

        <el-divider content-position="left">公积金</el-divider>
        <div class="sf-grid">
          <money-input label="公积金公司" v-model="form.housingFundCompany" />
          <money-input label="公积金个人" v-model="form.housingFundPersonal" />
          <el-form-item label="首次缴纳月份"><el-date-picker v-model="form.fundFirstMonth" type="month" value-format="YYYY-MM" style="width: 100%" /></el-form-item>
          <el-form-item label="社保公司合计"><el-input :model-value="money(socialCompany(form))" readonly /></el-form-item>
          <el-form-item label="社保个人合计"><el-input :model-value="money(socialPersonal(form))" readonly /></el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="editDlg.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDlg.visible" title="批量导入社保公积金" width="760px" destroy-on-close>
      <el-alert type="info" :closable="false" show-icon title="从 Excel 复制含表头的数据粘贴到下方。表头包含关键词即可自动识别。" />
      <p class="sf-template">建议表头：月份、员工、身份证号、手机号、养老公司、养老个人、失业公司、失业个人、工伤公司、工伤个人、医疗公司、医疗个人、社保首次参保月份、公积金公司、公积金个人、公积金首次缴纳月份、备注</p>
      <el-input v-model="importText" type="textarea" :rows="10" placeholder="粘贴 Excel 内容" />
      <div v-if="importPreview.length" class="sf-preview">已解析 {{ importPreview.length }} 条，示例：{{ importPreview[0].employeeName }} / {{ importPreview[0].recordMonth }}</div>
      <template #footer>
        <el-button @click="importDlg.visible = false">取消</el-button>
        <el-button @click="parseImport">解析预览</el-button>
        <el-button type="primary" :loading="importDlg.saving" :disabled="!importPreview.length" @click="submitImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h } from 'vue'
import { ElFormItem, ElInputNumber } from 'element-plus'
import { Plus, Refresh, Search, Upload } from '@element-plus/icons-vue'
import { socialFundApi, type SocialFund } from '@/api/hrm'
import { employeeApi } from '@/api/org'

const MoneyInput = defineComponent({
  props: { label: { type: String, required: true }, modelValue: { type: Number, default: 0 } },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    return () => h(ElFormItem, { label: props.label }, () =>
      h(ElInputNumber, {
        modelValue: props.modelValue,
        'onUpdate:modelValue': (v: number) => emit('update:modelValue', v),
        min: 0,
        precision: 2,
        controls: false,
        style: 'width: 100%'
      })
    )
  }
})

const todayMonth = () => new Date().toISOString().slice(0, 7)
const num = (v: any) => Number(v) || 0
const money = (v: any) => num(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const socialCompany = (r: any) => num(r.pensionCompany) + num(r.unemploymentCompany) + num(r.workInjuryCompany) + num(r.medicalCompany)
const socialPersonal = (r: any) => num(r.pensionPersonal) + num(r.unemploymentPersonal) + num(r.workInjuryPersonal) + num(r.medicalPersonal)

const loading = ref(false)
const rows = ref<SocialFund[]>([])
const total = ref(0)
const stats = reactive<any>({})
const employees = ref<any[]>([])
const query = reactive<any>({ pageNum: 1, pageSize: 10, recordMonth: todayMonth(), employeeId: undefined, keyword: '' })

function employeeLabel (e: any) {
  return `${e.name || e.employeeName || '-'}${e.deptName ? ' / ' + e.deptName : ''}`
}

async function loadEmployees () {
  try {
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 500 })
    const data = res?.data || res || {}
    employees.value = (data.records || data.list || []).filter((e: any) => Number(e.status ?? 1) !== 3)
  } catch {
    employees.value = []
  }
}

async function load () {
  loading.value = true
  try {
    const res: any = await socialFundApi.list({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      recordMonth: query.recordMonth || undefined,
      employeeId: query.employeeId || undefined,
      keyword: query.keyword || undefined
    })
    const page = res?.page || {}
    rows.value = page.records || []
    total.value = page.total || 0
    Object.assign(stats, res?.stats || {})
  } catch {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

function reset () {
  Object.assign(query, { pageNum: 1, pageSize: 10, recordMonth: todayMonth(), employeeId: undefined, keyword: '' })
  load()
}

const emptyForm = (): SocialFund => ({
  recordMonth: query.recordMonth || todayMonth(),
  pensionCompany: 0,
  pensionPersonal: 0,
  unemploymentCompany: 0,
  unemploymentPersonal: 0,
  workInjuryCompany: 0,
  workInjuryPersonal: 0,
  medicalCompany: 0,
  medicalPersonal: 0,
  housingFundCompany: 0,
  housingFundPersonal: 0
})
const editDlg = reactive({ visible: false, saving: false })
const form = reactive<SocialFund>(emptyForm())
function openEdit (row?: SocialFund) {
  Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {})
  editDlg.visible = true
}
function onEmployeePick (id: number) {
  const e = employees.value.find(x => x.id === id)
  if (!e) return
  form.employeeName = e.name
  form.idCard = e.idCard
  form.phone = e.phone
}
async function submit () {
  if (!form.recordMonth) { ElMessage.warning('请选择月份'); return }
  if (!form.employeeName) { ElMessage.warning('请选择或填写员工'); return }
  editDlg.saving = true
  try {
    await socialFundApi.save(form)
    ElMessage.success('已保存')
    editDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    editDlg.saving = false
  }
}
async function remove (row: SocialFund) {
  try {
    await ElMessageBox.confirm(`确认删除 ${row.employeeName} ${row.recordMonth} 的社保公积金记录?`, '删除', { type: 'warning' })
    await socialFundApi.remove(row.id!)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
  }
}

const importDlg = reactive({ visible: false, saving: false })
const importText = ref('')
const importPreview = ref<SocialFund[]>([])
const HEADS: Array<{ keys: string[]; field: keyof SocialFund; num?: boolean }> = [
  { keys: ['月份'], field: 'recordMonth' },
  { keys: ['员工', '姓名'], field: 'employeeName' },
  { keys: ['身份证'], field: 'idCard' },
  { keys: ['手机号', '手机'], field: 'phone' },
  { keys: ['养老公司'], field: 'pensionCompany', num: true },
  { keys: ['养老个人'], field: 'pensionPersonal', num: true },
  { keys: ['失业公司'], field: 'unemploymentCompany', num: true },
  { keys: ['失业个人'], field: 'unemploymentPersonal', num: true },
  { keys: ['工伤公司'], field: 'workInjuryCompany', num: true },
  { keys: ['工伤个人'], field: 'workInjuryPersonal', num: true },
  { keys: ['医疗公司'], field: 'medicalCompany', num: true },
  { keys: ['医疗个人'], field: 'medicalPersonal', num: true },
  { keys: ['社保首次'], field: 'socialFirstMonth' },
  { keys: ['公积金公司'], field: 'housingFundCompany', num: true },
  { keys: ['公积金个人'], field: 'housingFundPersonal', num: true },
  { keys: ['公积金首次'], field: 'fundFirstMonth' },
  { keys: ['备注'], field: 'remark' }
]
function openImport () { importText.value = ''; importPreview.value = []; importDlg.visible = true }
function splitCells (line: string) { return line.includes('\t') ? line.split('\t') : line.split(',') }
function parseImport () {
  const lines = importText.value.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
  if (lines.length < 2) { ElMessage.warning('至少需要表头和一行数据'); return }
  const headers = splitCells(lines[0]).map(h => h.trim())
  const fields = headers.map(h => HEADS.find(item => item.keys.some(k => h.includes(k))) || null)
  importPreview.value = lines.slice(1).map(line => {
    const cells = splitCells(line)
    const item: any = {}
    fields.forEach((meta, idx) => {
      if (!meta) return
      const raw = (cells[idx] || '').trim()
      item[meta.field] = meta.num ? num(raw.replace(/,/g, '')) : raw
    })
    if (!item.recordMonth) item.recordMonth = query.recordMonth || todayMonth()
    return item as SocialFund
  }).filter(item => item.employeeName)
  ElMessage.success(`解析出 ${importPreview.value.length} 条`)
}
async function submitImport () {
  importDlg.saving = true
  try {
    const n: any = await socialFundApi.batchSave(importPreview.value)
    ElMessage.success(`已导入 ${n} 条`)
    importDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '导入失败')
  } finally {
    importDlg.saving = false
  }
}

onMounted(() => { loadEmployees(); load() })
</script>

<style scoped>
.social-fund-page { padding: 4px 2px; }
.sf-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.sf-title { margin: 0 0 4px; font-size: 18px; font-weight: 650; }
.sf-sub { margin: 0; color: #667085; font-size: 12px; line-height: 1.6; }
.sf-actions, .sf-filter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.sf-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
.sf-stat { border: 1px solid #ebeef5; border-radius: 8px; background: #fff; padding: 14px 16px; }
.sf-stat span { color: #667085; font-size: 12px; }
.sf-stat b { display: block; margin-top: 6px; font-size: 20px; line-height: 1.2; color: #1f2937; }
.sf-filter { margin-bottom: 12px; }
.sf-table :deep(.el-table__cell) { font-variant-numeric: tabular-nums; }
.sf-pager { margin-top: 12px; display: flex; justify-content: flex-end; }
.sf-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 14px; }
.sf-form :deep(.el-form-item) { margin-bottom: 12px; }
.sf-template { margin: 10px 0; color: #667085; font-size: 12px; line-height: 1.7; }
.sf-preview { margin-top: 10px; color: #67c23a; font-size: 13px; }
@media (max-width: 1100px) {
  .sf-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 720px) {
  .sf-head { flex-direction: column; }
  .sf-stats, .sf-grid { grid-template-columns: 1fr; }
}
</style>

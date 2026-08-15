<template>
  <div class="hr-expense-page">
    <header class="he-head">
      <div>
        <h2 class="he-title">人事行政支出明细登记</h2>
        <p class="he-sub">登记行政、人事、办公与采购支出，沉淀付款、凭证、发票与部门归属明细。</p>
      </div>
      <div class="he-actions">
        <el-button type="primary" :icon="Plus" @click="openEdit()">新增明细</el-button>
        <el-button :icon="Refresh" @click="load">刷新</el-button>
      </div>
    </header>

    <div class="he-stats">
      <div class="he-stat"><span>本月总支出</span><b>¥{{ money(stats.monthTotal) }}</b></div>
      <div class="he-stat"><span>上月总支出</span><b>¥{{ money(stats.lastMonthTotal) }}</b></div>
      <div class="he-stat"><span>季度总支出</span><b>¥{{ money(stats.quarterTotal) }}</b></div>
      <div class="he-stat"><span>年度总支出</span><b>¥{{ money(stats.yearTotal) }}</b></div>
    </div>

    <div class="he-filter">
      <el-date-picker v-model="query.month" type="month" value-format="YYYY-MM" placeholder="月份" style="width: 150px" clearable />
      <el-select v-model="query.category" placeholder="类别" clearable style="width: 170px">
        <el-option v-for="item in CATEGORY_OPTIONS" :key="item" :label="item" :value="item" />
      </el-select>
      <el-tree-select
        v-model="query.deptId"
        :data="deptTree"
        node-key="id"
        :props="{ label: 'deptName', children: 'children' }"
        check-strictly
        clearable
        placeholder="归属部门"
        style="width: 190px"
      />
      <el-input v-model="query.keyword" placeholder="登记编号/内容/备注" clearable style="width: 220px" @keyup.enter="load" />
      <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      <el-button @click="reset">重置</el-button>
      <span class="he-filter-total">筛选支出总计：¥{{ money(stats.filteredTotal) }}</span>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe size="small" max-height="590">
      <el-table-column prop="expenseNo" label="登记编号" width="150" show-overflow-tooltip />
      <el-table-column prop="expenseDate" label="支出日期" width="105" />
      <el-table-column prop="deptName" label="费用归属部门" width="130" show-overflow-tooltip />
      <el-table-column prop="category" label="费用大类" width="120" show-overflow-tooltip />
      <el-table-column prop="content" label="具体支出内容" min-width="180" show-overflow-tooltip />
      <el-table-column prop="quantity" label="数量" width="70" align="right" />
      <el-table-column label="单价" width="105" align="right"><template #default="{ row }">¥{{ money(row.unitPrice) }}</template></el-table-column>
      <el-table-column label="总价" width="110" align="right"><template #default="{ row }"><b>¥{{ money(row.totalPrice) }}</b></template></el-table-column>
      <el-table-column prop="payMethod" label="支付方式" width="105" />
      <el-table-column label="状态" width="116" align="center">
        <template #default="{ row }"><el-tag size="small" :type="statusType(row.status)">{{ row.status || '待提交' }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="invoiceType" label="发票类型" width="82" />
      <el-table-column prop="invoiceTitle" label="发票抬头" width="180" show-overflow-tooltip />
      <el-table-column label="开票金额" width="110" align="right"><template #default="{ row }">¥{{ money(row.invoiceAmount) }}</template></el-table-column>
      <el-table-column label="附件" width="90" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="openAttachView(row)">附件({{ fileCount(row) }})</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button link size="small" type="danger" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty><el-empty description="暂无支出明细" :image-size="80" /></template>
    </el-table>

    <el-pagination
      v-if="total > 0"
      class="he-pager"
      background
      layout="total, sizes, prev, pager, next"
      v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize"
      :page-sizes="[10, 20, 50]"
      :total="total"
      @change="load"
    />

    <el-dialog v-model="editDlg.visible" :title="form.id ? '编辑支出明细' : '新增支出明细'" width="860px" destroy-on-close>
      <el-form :model="form" label-width="112px" class="he-form">
        <el-divider content-position="left">基础信息</el-divider>
        <div class="he-grid">
          <el-form-item label="登记编号"><el-input v-model="form.expenseNo" placeholder="留空自动生成" /></el-form-item>
          <el-form-item label="支出日期" required><el-date-picker v-model="form.expenseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" @change="refreshNo" /></el-form-item>
          <el-form-item label="归属部门">
            <el-tree-select
              v-model="form.deptId"
              :data="deptTree"
              node-key="id"
              :props="{ label: 'deptName', children: 'children' }"
              check-strictly
              clearable
              style="width: 100%"
              @change="syncDeptName"
            />
          </el-form-item>
          <el-form-item label="费用大类" required>
            <el-select v-model="form.category" style="width: 100%">
              <el-option v-for="item in CATEGORY_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
        </div>

        <el-divider content-position="left">费用明细</el-divider>
        <div class="he-grid">
          <el-form-item label="支出内容" required class="he-span2"><el-input v-model="form.content" /></el-form-item>
          <el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" :precision="0" controls-position="right" style="width: 100%" /></el-form-item>
          <el-form-item label="单价"><el-input-number v-model="form.unitPrice" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item>
          <el-form-item label="总价"><el-input :model-value="money(calcTotal)" readonly /></el-form-item>
          <el-form-item label="支付方式">
            <el-select v-model="form.payMethod" style="width: 100%">
              <el-option v-for="item in PAY_METHODS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select v-model="form.status" style="width: 100%">
              <el-option v-for="item in STATUS_OPTIONS" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="支出凭证" class="he-span3">
            <file-field :files="expenseFiles" :loading="uploadingExpense" @upload="pickExpense" @remove="removeExpenseFile" @download="downloadFile" />
            <input ref="expenseInput" type="file" multiple style="display:none" @change="onExpensePick" />
          </el-form-item>
          <el-form-item label="备注" class="he-span3"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
        </div>

        <el-divider content-position="left">开票信息</el-divider>
        <div class="he-grid">
          <el-form-item label="发票类型">
            <el-select v-model="form.invoiceType" style="width: 100%">
              <el-option label="专票" value="专票" />
              <el-option label="普票" value="普票" />
              <el-option label="无票" value="无票" />
            </el-select>
          </el-form-item>
          <el-form-item label="发票抬头">
            <el-select v-model="form.invoiceTitle" style="width: 100%" clearable>
              <el-option v-for="item in INVOICE_TITLES" :key="item" :label="item" :value="item" />
            </el-select>
          </el-form-item>
          <el-form-item label="开票金额"><el-input-number v-model="form.invoiceAmount" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item>
          <el-form-item label="发票附件" class="he-span3">
            <file-field :files="invoiceFiles" :loading="uploadingInvoice" @upload="pickInvoice" @remove="removeInvoiceFile" @download="downloadFile" />
            <input ref="invoiceInput" type="file" multiple style="display:none" @change="onInvoicePick" />
          </el-form-item>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="editDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="editDlg.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="attachDlg.visible" title="附件" width="520px">
      <div v-if="attachDlg.files.length" class="he-file-list">
        <button v-for="file in attachDlg.files" :key="fileKey(file)" type="button" class="he-file-row" @click="downloadFile(file)">
          <el-icon><Document /></el-icon>
          <span>{{ file.name }}</span>
        </button>
      </div>
      <el-empty v-else description="暂无附件" :image-size="70" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, h, type Ref } from 'vue'
import { ElButton, ElTag } from 'element-plus'
import { Document, Plus, Refresh, Search } from '@element-plus/icons-vue'
import { hrExpenseApi, type AdminHrExpense } from '@/api/admin'
import { deptApi } from '@/api/org'
import { fileInfoApi } from '@/api/file'

interface FileItem { id?: number; name: string; url?: string }

const FileField = defineComponent({
  props: { files: { type: Array as () => FileItem[], default: () => [] }, loading: { type: Boolean, default: false } },
  emits: ['upload', 'remove', 'download'],
  setup (props, { emit }) {
    return () => h('div', { class: 'he-file-field' }, [
      h(ElButton, { loading: props.loading, onClick: () => emit('upload') }, () => '上传附件'),
      props.files.length
        ? h('div', { class: 'he-file-chips' }, props.files.map((file: FileItem, index: number) =>
            h(ElTag, {
              key: `${file.id || file.name}-${index}`,
              closable: true,
              onClose: () => emit('remove', index),
              onClick: () => emit('download', file)
            }, () => file.name)
          ))
        : h('span', { class: 'he-file-empty' }, '未上传')
    ])
  }
})

const CATEGORY_OPTIONS = ['办公生活用品', '业务招待费', '员工福利费', '房租水电', '设备采购费', '刻章采购', '其他']
const PAY_METHODS = ['对公支付', '支付宝支付', '个人代垫', '备用金支出']
const STATUS_OPTIONS = ['待提交', '已报销', '已提交付款申请']
const INVOICE_TITLES = ['诚路会计服务（杭州）有限公司', '浙杭企业服务（杭州）有限公司', '浙江诚路建设有限公司']

const today = () => new Date().toISOString().slice(0, 10)
const thisMonth = () => new Date().toISOString().slice(0, 7)
const num = (v: any) => Number(v) || 0
const money = (v: any) => num(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const statusType = (status?: string) => status === '已报销' ? 'success' : status === '已提交付款申请' ? 'warning' : 'info'

const loading = ref(false)
const rows = ref<AdminHrExpense[]>([])
const total = ref(0)
const stats = reactive<any>({})
const deptTree = ref<any[]>([])
const query = reactive<any>({ pageNum: 1, pageSize: 10, month: thisMonth(), category: '', deptId: undefined, keyword: '' })

async function loadDeptTree () {
  try {
    const res: any = await deptApi.tree()
    deptTree.value = res?.data || res || []
  } catch {
    deptTree.value = []
  }
}

function findDept (id: any, nodes = deptTree.value): any {
  for (const node of nodes || []) {
    if (String(node.id) === String(id)) return node
    const hit = findDept(id, node.children || [])
    if (hit) return hit
  }
  return null
}

async function load () {
  loading.value = true
  try {
    const res: any = await hrExpenseApi.list({
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      month: query.month || undefined,
      category: query.category || undefined,
      deptId: query.deptId || undefined,
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
  Object.assign(query, { pageNum: 1, pageSize: 10, month: thisMonth(), category: '', deptId: undefined, keyword: '' })
  load()
}

const editDlg = reactive({ visible: false, saving: false })
const form = reactive<AdminHrExpense>({})
const expenseFiles = ref<FileItem[]>([])
const invoiceFiles = ref<FileItem[]>([])
const expenseInput = ref<HTMLInputElement>()
const invoiceInput = ref<HTMLInputElement>()
const uploadingExpense = ref(false)
const uploadingInvoice = ref(false)
const calcTotal = computed(() => num(form.quantity) * num(form.unitPrice))

function emptyForm (): AdminHrExpense {
  return {
    expenseDate: today(),
    category: '办公生活用品',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    payMethod: '对公支付',
    status: '待提交',
    invoiceType: '无票',
    invoiceAmount: 0
  }
}

async function openEdit (row?: AdminHrExpense) {
  Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {})
  expenseFiles.value = parseFiles(form.attach)
  invoiceFiles.value = parseFiles(form.invoiceAttach)
  editDlg.visible = true
  if (!row) refreshNo()
}

async function refreshNo () {
  if (form.id || form.expenseNo) return
  try {
    form.expenseNo = String(await hrExpenseApi.nextNo(form.expenseDate))
  } catch {
    form.expenseNo = ''
  }
}

function syncDeptName () {
  const dept = findDept(form.deptId)
  form.deptName = dept?.deptName || ''
}

async function submit () {
  if (!form.category) { ElMessage.warning('请选择费用大类'); return }
  if (!form.content) { ElMessage.warning('请填写具体支出内容'); return }
  editDlg.saving = true
  try {
    syncDeptName()
    form.totalPrice = calcTotal.value
    form.attach = JSON.stringify(expenseFiles.value)
    form.invoiceAttach = JSON.stringify(invoiceFiles.value)
    await hrExpenseApi.save(form)
    ElMessage.success('已保存')
    editDlg.visible = false
    load()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    editDlg.saving = false
  }
}

async function remove (row: AdminHrExpense) {
  try {
    await ElMessageBox.confirm(`确认删除「${row.expenseNo || row.content}」?`, '删除', { type: 'warning' })
    await hrExpenseApi.remove(row.id!)
    ElMessage.success('已删除')
    load()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.message || '删除失败')
  }
}

function parseFiles (raw?: string): FileItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return raw ? [{ name: raw }] : []
  }
}
function fileCount (row: AdminHrExpense) {
  return parseFiles(row.attach).length + parseFiles(row.invoiceAttach).length
}
function fileKey (file: FileItem) { return `${file.id || file.url || file.name}` }

function pickExpense () { expenseInput.value?.click() }
function pickInvoice () { invoiceInput.value?.click() }
function removeExpenseFile (idx: number) { expenseFiles.value.splice(idx, 1) }
function removeInvoiceFile (idx: number) { invoiceFiles.value.splice(idx, 1) }

async function uploadFiles (files: File[], target: Ref<FileItem[]>, loadingRef: Ref<boolean>) {
  loadingRef.value = true
  try {
    for (const file of files) {
      const res: any = await fileInfoApi.upload(file)
      const payload = res?.data || res || {}
      target.value.push({ id: Number(payload.id || 0) || undefined, name: payload.originalName || payload.fileName || file.name, url: payload.url })
    }
    ElMessage.success('附件已上传')
  } catch (e: any) {
    ElMessage.error(e?.message || '附件上传失败')
  } finally {
    loadingRef.value = false
  }
}
async function onExpensePick (e: Event) {
  const input = e.target as HTMLInputElement
  await uploadFiles(input.files ? Array.from(input.files) : [], expenseFiles, uploadingExpense)
  input.value = ''
}
async function onInvoicePick (e: Event) {
  const input = e.target as HTMLInputElement
  await uploadFiles(input.files ? Array.from(input.files) : [], invoiceFiles, uploadingInvoice)
  input.value = ''
}

async function downloadFile (file: FileItem) {
  if (file.id) {
    const blob: any = await fileInfoApi.download(file.id)
    const url = URL.createObjectURL(blob as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name || '附件'
    a.click()
    URL.revokeObjectURL(url)
  } else if (file.url) {
    window.open(file.url, '_blank')
  }
}

const attachDlg = reactive<{ visible: boolean; files: FileItem[] }>({ visible: false, files: [] })
function openAttachView (row: AdminHrExpense) {
  attachDlg.files = [...parseFiles(row.attach), ...parseFiles(row.invoiceAttach)]
  attachDlg.visible = true
}

onMounted(() => {
  loadDeptTree()
  load()
})
</script>

<style scoped>
.hr-expense-page { padding: 4px 2px; }
.he-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
.he-title { margin: 0 0 4px; font-size: 18px; font-weight: 650; }
.he-sub { margin: 0; color: #667085; font-size: 12px; line-height: 1.6; }
.he-actions, .he-filter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.he-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 12px; }
.he-stat { border: 1px solid #ebeef5; border-radius: 8px; background: #fff; padding: 14px 16px; }
.he-stat span { color: #667085; font-size: 12px; }
.he-stat b { display: block; margin-top: 6px; font-size: 20px; color: #1f2937; }
.he-filter { margin-bottom: 12px; }
.he-filter-total { color: #f56c6c; font-weight: 650; margin-left: auto; }
.he-pager { display: flex; justify-content: flex-end; margin-top: 12px; }
.he-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0 14px; }
.he-span2 { grid-column: span 2; }
.he-span3 { grid-column: span 3; }
.he-form :deep(.el-form-item) { margin-bottom: 12px; }
.he-file-field { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.he-file-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.he-file-chips :deep(.el-tag) { cursor: pointer; }
.he-file-empty { color: #98a2b3; font-size: 12px; }
.he-file-list { display: flex; flex-direction: column; gap: 8px; }
.he-file-row { display: flex; align-items: center; gap: 8px; border: 1px solid #ebeef5; border-radius: 8px; background: #fff; padding: 10px 12px; text-align: left; cursor: pointer; color: #1f2937; }
.he-file-row:hover { border-color: #409eff; color: #409eff; }
:deep(.el-table__cell) { font-variant-numeric: tabular-nums; }
@media (max-width: 1100px) {
  .he-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .he-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .he-span2, .he-span3 { grid-column: span 2; }
}
@media (max-width: 720px) {
  .he-head { flex-direction: column; }
  .he-stats, .he-grid { grid-template-columns: 1fr; }
  .he-span2, .he-span3 { grid-column: span 1; }
  .he-filter-total { margin-left: 0; width: 100%; }
}
</style>

<template>
  <div class="gss-page">
    <header class="gss-head">
      <div>
        <h2 class="gss-title">工商业务提单</h2>
        <p class="gss-sub">提交客户委托的工商业务(注册/变更/注销/银行/许可证等)。提交后自动进入「待审核」,由工商办理人员接手办理,你可在此跟踪进度。</p>
      </div>
      <el-button type="primary" @click="openWizard"><el-icon><Plus /></el-icon> 提交工商订单</el-button>
    </header>

    <!-- 概览:按状态筛选 -->
    <div class="gss-stats">
      <div v-for="s in GS_STATUS" :key="s.value" class="gss-stat" :class="{ active: filterStatus === s.value }" @click="toggleStatus(s.value)">
        <b>{{ statCount(s.value) }}</b>
        <span>{{ s.label }}</span>
      </div>
    </div>

    <!-- 我提交的工商订单(进度只读) -->
    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="提交日期" width="120">
        <template #default="{ row }">{{ (row.createTime || '').slice(0, 10) || '—' }}</template>
      </el-table-column>
      <el-table-column label="公司名称" prop="companyName" min-width="180" show-overflow-tooltip />
      <el-table-column label="业务类型" width="110">
        <template #default="{ row }">{{ typeLabel(row.businessType) }}</template>
      </el-table-column>
      <el-table-column label="业务细分" min-width="170" show-overflow-tooltip>
        <template #default="{ row }">{{ businessItemsText(row) }}</template>
      </el-table-column>
      <el-table-column label="客户联系人" width="140">
        <template #default="{ row }">{{ row.customer || '—' }}<span v-if="row.phone" class="gss-muted"> / {{ row.phone }}</span></template>
      </el-table-column>
      <el-table-column label="收费" width="110" align="right">
        <template #default="{ row }">{{ row.fee != null ? '¥' + fmtMoney(row.fee) : '—' }}</template>
      </el-table-column>
      <el-table-column label="办理期限" width="120">
        <template #default="{ row }">{{ row.deadline || '—' }}</template>
      </el-table-column>
      <el-table-column label="办理进度" width="120" align="center">
        <template #default="{ row }"><el-tag size="small" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="办事员" width="100">
        <template #default="{ row }">{{ row.assigneeName || '—' }}</template>
      </el-table-column>
      <el-table-column label="操作" width="110" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.status === 'rejected'" size="small" type="primary" @click="openWizard(row)">修改</el-button>
          <span v-else class="gss-muted">—</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有提交工商订单,点右上角「提交工商订单」开始" :image-size="80">
          <el-button type="primary" @click="openWizard">提交工商订单</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 提交向导 -->
    <el-dialog v-model="dlg.visible" :title="dlg.editingId ? '修改工商订单' : '提交工商订单'" width="760px" destroy-on-close class="gss-dialog" @closed="resetWizard">
      <el-steps :active="step" align-center finish-status="success" class="gss-steps">
        <el-step title="业务类型" />
        <el-step title="客户信息" />
        <el-step title="收费与期限" />
        <el-step title="确认提交" />
      </el-steps>

      <!-- ① 业务类型 -->
      <div v-show="step === 0" class="gss-step">
        <el-form label-width="88px">
          <el-form-item label="业务类型" required>
            <el-radio-group v-model="form.businessType" @change="onBusinessTypeChange">
              <el-radio-button v-for="t in GS_TYPES" :key="t.value" :value="t.value">{{ t.label }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="业务细分" required>
            <el-checkbox-group v-model="selectedItems" class="gss-checks">
              <el-checkbox v-for="item in businessItemOptions" :key="item.value" :value="item.value">{{ item.label }}</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="补充项目">
            <el-input v-model="form.businessItemRemark" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="其他项目或特殊情况,例如:解除年报异常、地址异常、税务异常、银行开户需预约等" />
          </el-form-item>
          <el-alert :closable="false" type="info" :title="typeHint" show-icon style="margin-top:6px" />
        </el-form>
      </div>

      <!-- ② 客户信息 -->
      <div v-show="step === 1" class="gss-step">
        <el-form :model="form" label-width="88px">
          <el-row :gutter="14">
            <el-col :span="24"><el-form-item label="公司名称" required><el-input v-model="form.companyName" placeholder="客户公司全称(或拟注册名称)" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="客户联系人"><el-input v-model="form.customer" placeholder="联系人姓名" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="联系电话" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="法人手机号"><el-input v-model="form.legalPhone" placeholder="法人手机号" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="收件人"><el-input v-model="form.recipient" placeholder="收件人姓名" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="收件电话"><el-input v-model="form.recipientPhone" placeholder="收件电话" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="收件地址"><el-input v-model="form.recipientAddress" placeholder="收件地址" /></el-form-item></el-col>
          </el-row>

          <el-divider content-position="left">客户资料上传</el-divider>
          <el-form-item label="法人身份证">
            <div class="gss-id-uploads">
              <el-upload :show-file-list="false" :http-request="(o: any) => uploadDoc('legalIdFront', o)" accept="image/*">
                <el-button :type="docs['legalIdFront'] ? 'success' : 'default'">{{ docs['legalIdFront'] ? '正面 已上传 ✓' : '上传正面' }}</el-button>
              </el-upload>
              <el-button v-if="docs['legalIdFront']" size="small" type="danger" link @click="removeDoc('legalIdFront')">删除正面</el-button>
              <el-upload :show-file-list="false" :http-request="(o: any) => uploadDoc('legalIdBack', o)" accept="image/*">
                <el-button :type="docs['legalIdBack'] ? 'success' : 'default'">{{ docs['legalIdBack'] ? '反面 已上传 ✓' : '上传反面' }}</el-button>
              </el-upload>
              <el-button v-if="docs['legalIdBack']" size="small" type="danger" link @click="removeDoc('legalIdBack')">删除反面</el-button>
            </div>
          </el-form-item>
          <el-form-item label="其他附件">
            <el-upload :show-file-list="false" :http-request="(o: any) => uploadOther(o)" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" multiple>
              <el-button size="small" plain type="info"><el-icon><Plus /></el-icon> 上传其他附件(可多张)</el-button>
            </el-upload>
            <div v-if="otherDocs.length" class="gss-doc-tags">
              <el-tag v-for="d in otherDocs" :key="d.key" size="small" closable @close="removeDoc(d.key)">{{ d.fileName }}</el-tag>
            </div>
            <span class="gss-doc-hint">营业执照、委托书、场地证明、股东信息、地址材料、进场资金、经营范围等辅助材料;支持图片/PDF/Office。办事员办理时可在此下载查看。</span>
          </el-form-item>
        </el-form>
      </div>

      <!-- ③ 收费与期限 -->
      <div v-show="step === 2" class="gss-step">
        <el-form :model="form" label-width="88px">
          <el-row :gutter="14">
            <el-col :span="12"><el-form-item label="收费金额"><el-input-number v-model="form.fee" :min="0" :precision="2" controls-position="right" style="width:100%" placeholder="收费金额" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="接单日期"><el-date-picker v-model="form.receivedDate" type="date" value-format="YYYY-MM-DD" placeholder="接单日期" style="width:100%" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="办理期限"><el-date-picker v-model="form.deadline" type="date" value-format="YYYY-MM-DD" placeholder="希望完成日期" style="width:100%" /></el-form-item></el-col>
          </el-row>
          <el-form-item label="备注/要求"><el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="remarkHint" maxlength="500" show-word-limit /></el-form-item>
          <el-form-item label="备注2"><el-input v-model="form.remark2" type="textarea" :rows="2" maxlength="255" show-word-limit placeholder="第二备注" /></el-form-item>
        </el-form>
      </div>

      <!-- ④ 确认提交 -->
      <div v-show="step === 3" class="gss-step">
        <el-descriptions title="订单确认" :column="2" border size="small">
          <el-descriptions-item label="业务类型">{{ typeLabel(form.businessType) }}</el-descriptions-item>
          <el-descriptions-item label="业务细分">{{ businessItemsText(form) }}</el-descriptions-item>
          <el-descriptions-item label="公司名称">{{ form.companyName }}</el-descriptions-item>
          <el-descriptions-item label="客户联系人">{{ form.customer || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ form.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="法人手机号">{{ form.legalPhone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="收件人">{{ form.recipient || '—' }}</el-descriptions-item>
          <el-descriptions-item label="收件电话">{{ form.recipientPhone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="收件地址" :span="2">{{ form.recipientAddress || '—' }}</el-descriptions-item>
          <el-descriptions-item label="收费金额">{{ form.fee != null ? '¥' + fmtMoney(form.fee) : '—' }}</el-descriptions-item>
          <el-descriptions-item label="接单日期">{{ form.receivedDate || '—' }}</el-descriptions-item>
          <el-descriptions-item label="办理期限">{{ form.deadline || '—' }}</el-descriptions-item>
          <el-descriptions-item label="上传资料" :span="2">{{ docCount ? `已上传 ${docCount} 个文件` : '未上传' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ form.remark || '—' }}</el-descriptions-item>
          <el-descriptions-item label="备注2" :span="2">{{ form.remark2 || '—' }}</el-descriptions-item>
        </el-descriptions>
        <el-alert :closable="false" type="success" title="提交后进入「待审核」,工商办理人员会审核并分配办事员办理,进度会显示在上面的列表里。" show-icon style="margin-top:14px" />
      </div>

      <template #footer>
        <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-else type="primary" :loading="dlg.saving" @click="submit">{{ dlg.editingId ? '保存并重新提交' : '提交订单' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { gsOrderApi, type GsOrder } from '@/api/gs'
import { fileInfoApi } from '@/api/file'

const GS_TYPE_GROUPS = [
  { value: 'register', label: '公司注册', items: [
    { value: 'company_register', label: '公司注册' },
    { value: 'individual_register', label: '个体户注册' },
    { value: 'individual_to_company', label: '个转企' }
  ] },
  { value: 'change', label: '工商变更', items: [
    { value: 'address_change', label: '地址变更' },
    { value: 'scope_change', label: '经营范围变更' },
    { value: 'equity_change', label: '股权转让' },
    { value: 'legal_person_change', label: '法人变更' },
    { value: 'capital_change', label: '增资/减资' },
    { value: 'name_change', label: '名称变更' }
  ] },
  { value: 'cancel', label: '公司注销', items: [
    { value: 'company_cancel', label: '公司注销' },
    { value: 'individual_cancel', label: '个体户注销' }
  ] },
  { value: 'bank', label: '银行业务', items: [
    { value: 'bank_open', label: '银行开户' },
    { value: 'bank_change', label: '银行变更' },
    { value: 'bank_cancel', label: '银行注销' }
  ] },
  { value: 'license', label: '许可证', items: [
    { value: 'food_license', label: '食品经营许可证' },
    { value: 'import_export_record', label: '进出口备案' },
    { value: 'health_license', label: '卫生许可证' },
    { value: 'hr_license', label: '人力资源许可证' },
    { value: 'labor_dispatch_license', label: '劳务派遣' },
    { value: 'medical_device_record', label: '二类医疗器械备案' }
  ] },
  { value: 'other', label: '其他', items: [
    { value: 'annual_exception', label: '解除年报异常' },
    { value: 'address_exception', label: '解除地址异常' },
    { value: 'tax_exception', label: '解除税务异常' },
    { value: 'other_manual', label: '其他手动备注' }
  ] }
]
const GS_TYPES = GS_TYPE_GROUPS.map(({ value, label }) => ({ value, label }))
const BUSINESS_ITEM_LABELS = GS_TYPE_GROUPS.reduce<Record<string, string>>((map, group) => {
  group.items.forEach((item) => { map[item.value] = item.label })
  return map
}, {})
const GS_STATUS = [
  { value: 'reviewing', label: '待审核' },
  { value: 'pending', label: '待分配' },
  { value: 'processing', label: '办理中' },
  { value: 'submitted', label: '已提交工商' },
  { value: 'done', label: '已完成' },
  { value: 'rejected', label: '已驳回' }
]

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const typeLabel = (v?: string) => (GS_TYPES.find(t => t.value === v)?.label || (v === 'annual' ? '工商年报' : v) || '—')
const statusLabel = (v?: string) => (GS_STATUS.find(s => s.value === v)?.label || (v === 'rejected' ? '已驳回' : v === 'cancelled' ? '已取消' : v || '—'))
const statusType = (v?: string) => (v === 'done' ? 'success' : v === 'rejected' || v === 'cancelled' ? 'danger' : v === 'reviewing' ? 'info' : 'warning')

const typeHint = computed(() => {
  const map: Record<string, string> = {
    register: '新公司注册:可勾选公司注册、个体户注册、个转企等具体项目。',
    change: '工商变更:法人/股东/地址/经营范围/注册资本/公司名称等变更。',
    cancel: '公司注销:含清算、税务注销、工商注销、公示登报等。',
    bank: '银行业务:开户、变更、注销;预约时间和银行要求可写在补充项目或备注里。',
    license: '许可证:食品经营、道路运输、医疗器械等前置/后置审批。',
    other: '其他工商相关业务,可勾选异常解除并在补充项目里手动说明。'
  }
  return map[form.businessType || 'register'] || '选择要办理的工商业务类型。'
})
const remarkHint = computed(() => {
  const t = form.businessType
  if (t === 'register') return '如:注册资本、经营范围、股东出资比例、注册地址来源(自有/挂靠)等'
  if (t === 'change') return '如:具体变更项、变更前→变更后内容'
  if (t === 'cancel') return '如:是否有欠税、是否简易注销'
  if (t === 'bank') return '如:预约银行、开户许可证/网银/印鉴卡等银行具体要求'
  return '补充说明或客户特殊要求'
})
const selectedItems = ref<string[]>([])
const businessItemOptions = computed(() => GS_TYPE_GROUPS.find((t) => t.value === form.businessType)?.items || [])
const parseBusinessItems = (s?: string) => (s || '').split(',').map((v) => v.trim()).filter(Boolean)
const businessItemsText = (row?: GsOrder) => {
  const labels = parseBusinessItems(row?.businessItems).map((v) => BUSINESS_ITEM_LABELS[v] || v)
  if (row?.businessItemRemark) labels.push(row.businessItemRemark)
  return labels.length ? labels.join('、') : '—'
}
const onBusinessTypeChange = () => {
  selectedItems.value = []
  form.businessItems = ''
}
watch(selectedItems, (items) => { form.businessItems = items.join(',') }, { deep: true })

/* 列表 + 概览 */
const rows = ref<GsOrder[]>([])
const loading = ref(false)
const filterStatus = ref('')
const allRows = ref<GsOrder[]>([])
const load = async () => {
  loading.value = true
  try {
    const res: any = await gsOrderApi.list({ pageNum: 1, pageSize: 200, scope: 'mine' })
    const page = res?.data ?? res
    allRows.value = page?.records || []
    applyFilter()
  } catch { allRows.value = []; rows.value = [] } finally { loading.value = false }
}
const applyFilter = () => { rows.value = filterStatus.value ? allRows.value.filter(r => r.status === filterStatus.value) : allRows.value }
const statCount = (s: string) => allRows.value.filter(r => r.status === s).length
const toggleStatus = (s: string) => { filterStatus.value = filterStatus.value === s ? '' : s; applyFilter() }

/* 向导 */
const dlg = reactive<{ visible: boolean; saving: boolean; editingId?: number | string }>({ visible: false, saving: false })
const step = ref(0)
const blankForm = (): GsOrder => ({
  businessType: 'register',
  businessItems: '',
  businessItemRemark: '',
  companyName: '',
  customer: '',
  phone: '',
  legalPhone: '',
  recipient: '',
  recipientPhone: '',
  recipientAddress: '',
  fee: undefined,
  receivedDate: '',
  deadline: '',
  remark: ''
})
const form = reactive<GsOrder>(blankForm())
const assignForm = (data: GsOrder) => {
  Object.keys(form).forEach((k) => delete (form as any)[k])
  Object.assign(form, data)
}

// 客户资料:docs map { key: { fileId, fileName } },提交时序列化进 form.documents(复用刻章提单机制)
const docs = ref<Record<string, { fileId: string; fileName: string }>>({})
const otherDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith('other-')).map(([k, v]) => ({ key: k, ...(v as any) })))
const docCount = computed(() => Object.keys(docs.value).length)
const parseDocMap = (s?: string) => {
  if (!s) return {}
  try {
    const obj = JSON.parse(s)
    return obj && typeof obj === 'object' ? obj : {}
  } catch { return {} }
}
const uploadDoc = async (key: string, options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    docs.value = { ...docs.value, [key]: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name } }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
let otherSeq = 0
const uploadOther = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    otherSeq++
    docs.value = { ...docs.value, [`other-${Date.now()}-${otherSeq}`]: { fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name } }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
const removeDoc = (key: string) => { const d = { ...docs.value }; delete d[key]; docs.value = d }

const openWizard = (row?: GsOrder) => {
  resetWizard()
  if (row) {
    dlg.editingId = row.id
    assignForm({ ...blankForm(), ...row, status: 'reviewing' })
    selectedItems.value = parseBusinessItems(row.businessItems)
    docs.value = parseDocMap(row.documents) as Record<string, { fileId: string; fileName: string }>
  }
  dlg.visible = true
}
const resetWizard = () => {
  step.value = 0
  dlg.editingId = undefined
  assignForm(blankForm())
  selectedItems.value = []
  docs.value = {}
}

const validateStep = (s: number): boolean => {
  if (s === 0) {
    if (!form.businessType) { ElMessage.warning('请选择业务类型'); return false }
    if (!selectedItems.value.length && !form.businessItemRemark) { ElMessage.warning('请选择业务细分或填写补充项目'); return false }
  }
  else if (s === 1) { if (!form.companyName) { ElMessage.warning('请填写公司名称'); return false } }
  return true
}
const nextStep = () => { if (validateStep(step.value)) step.value++ }
const prevStep = () => { if (step.value > 0) step.value-- }

const submit = async () => {
  for (let s = 0; s <= 2; s++) { if (!validateStep(s)) { step.value = s; return } }
  dlg.saving = true
  try {
    const payload = { ...form, businessItems: selectedItems.value.join(','), documents: JSON.stringify(docs.value), status: 'reviewing' }
    if (dlg.editingId) await gsOrderApi.update(payload)
    else await gsOrderApi.create(payload)
    ElMessage.success(dlg.editingId ? '已保存并重新提交审核' : '提交成功,已进入待审核')
    dlg.visible = false
    load()
  } catch { ElMessage.error('提交失败') } finally { dlg.saving = false }
}

onMounted(load)
</script>

<style scoped>
.gss-page { padding: 16px 18px; }
.gss-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.gss-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.gss-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); max-width: 760px; }
.gss-muted { color: var(--el-text-color-secondary); font-size: 12px; }
.gss-stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.gss-stat { flex: 1; min-width: 92px; padding: 10px 14px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; cursor: pointer; transition: border-color .2s, background .2s; background: var(--el-fill-color-blank); }
.gss-stat:hover { border-color: var(--el-color-primary); }
.gss-stat.active { border-color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
.gss-stat b { display: block; font-size: 22px; font-weight: 700; color: var(--el-text-color-primary); line-height: 1.2; }
.gss-stat span { font-size: 12px; color: var(--el-text-color-secondary); }
.gss-steps { margin-bottom: 20px; }
.gss-step { min-height: 200px; }
.gss-dialog :deep(.el-dialog__body) { padding-top: 8px; }
.gss-checks { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px 12px; width: 100%; }
.gss-checks :deep(.el-checkbox) { margin-right: 0; height: auto; white-space: normal; }
.gss-id-uploads { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.gss-doc-tags { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; margin-top: 6px; }
.gss-doc-hint { display: block; margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); }
</style>

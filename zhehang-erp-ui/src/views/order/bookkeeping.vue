<template>
  <div class="bk-page">
    <!-- 页头 -->
    <header class="bk-head">
      <div>
        <h2 class="bk-title">代理记账提单</h2>
        <p class="bk-sub">从我的线索快速发起代理记账提单,录入合同信息并上传合同附件。</p>
      </div>
      <el-button type="primary" @click="openWizard"><el-icon><Plus /></el-icon> 新增提单</el-button>
    </header>

    <!-- 列表 -->
    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="公司名称" prop="companyName" min-width="180" show-overflow-tooltip />
      <el-table-column label="合同金额" width="130" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.contractAmount) }}</template>
      </el-table-column>
      <el-table-column label="服务周期" min-width="190">
        <template #default="{ row }">
          <span v-if="row.serviceStart || row.serviceEnd">{{ row.serviceStart || '—' }} ~ {{ row.serviceEnd || '—' }}</span>
          <span v-else class="bk-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="签约日期" prop="signDate" width="120" />
      <el-table-column label="收款方式" prop="payMethod" width="110" />
      <el-table-column label="附件" width="100" align="center">
        <template #default="{ row }">
          <el-tag v-if="fileCount(row) > 0" size="small" type="success" effect="plain">已传{{ fileCount(row) }}个</el-tag>
          <span v-else class="bk-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="170" fixed="right">
        <template #default="{ row }">
          <el-button v-if="canSubmitReview(row)" size="small" link type="success" @click="submitReview(row)">提交审核</el-button>
          <el-button size="small" link type="danger" :disabled="isLocked(row)" @click="remove(row)">删除</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有代理记账提单,点右上角「新增提单」开始" :image-size="80">
          <el-button type="primary" @click="openWizard">新增提单</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 新增向导 -->
    <el-dialog v-model="dlg.visible" title="新增代理记账提单" width="720px" destroy-on-close class="bk-dialog" @closed="resetWizard">
      <el-steps :active="step" align-center finish-status="success" class="bk-steps">
        <el-step title="选择线索" />
        <el-step title="合同信息" />
        <el-step title="上传附件" />
        <el-step title="确认提交" />
      </el-steps>

      <!-- 步骤① 选择线索 -->
      <div v-show="step === 0" class="bk-step">
        <div class="bk-step-bar">
          <el-input v-model="leadKw" class="bk-search" placeholder="搜公司名/法人/电话…" clearable>
            <template #prefix><el-icon><Search /></el-icon></template>
          </el-input>
          <span class="bk-muted">选中一条线索,自动带入公司/法人/电话/信用代码</span>
        </div>
        <el-table :data="filteredLeads" v-loading="leadLoading" border height="280" highlight-current-row
          @current-change="onPickLead" :row-class-name="leadRowClass">
          <el-table-column width="48" align="center">
            <template #default="{ row }">
              <el-icon v-if="picked && picked.id === row.id" color="var(--el-color-primary)"><CircleCheckFilled /></el-icon>
              <el-icon v-else color="var(--el-text-color-placeholder)"><CircleCheck /></el-icon>
            </template>
          </el-table-column>
          <el-table-column label="公司名称" prop="company" min-width="180" show-overflow-tooltip />
          <el-table-column label="法人" prop="legalPerson" width="100" />
          <el-table-column label="电话" prop="phone" width="130" />
          <el-table-column label="信用代码" prop="creditCode" min-width="170" show-overflow-tooltip />
          <template #empty><el-empty description="没有可选线索" :image-size="60" /></template>
        </el-table>

        <el-divider content-position="left">带入信息(可编辑)</el-divider>
        <el-form :model="form" label-width="92px">
          <el-row :gutter="14">
            <el-col :span="12"><el-form-item label="公司名称" required><el-input v-model="form.companyName" placeholder="公司名称" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="联系人/法人" required><el-input v-model="form.contactName" placeholder="联系人或法人" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="联系电话" required><el-input v-model="form.phone" placeholder="联系电话" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="信用代码" required><el-input v-model="form.creditCode" placeholder="统一社会信用代码" /></el-form-item></el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 步骤② 合同信息 -->
      <div v-show="step === 1" class="bk-step">
        <el-form :model="form" label-width="100px">
          <el-row :gutter="14">
            <el-col :span="12"><el-form-item label="合同金额" required>
              <el-input-number v-model="form.contractAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" placeholder="合同金额" />
            </el-form-item></el-col>
            <el-col :span="12"><el-form-item label="签约日期" required>
              <el-date-picker v-model="form.signDate" type="date" value-format="YYYY-MM-DD" placeholder="选择签约日期" style="width: 100%" />
            </el-form-item></el-col>
            <el-col :span="24"><el-form-item label="服务周期" required>
              <el-date-picker v-model="serviceRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
                value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item></el-col>
            <el-col :span="12"><el-form-item label="收款方式" required>
              <el-select v-model="form.payMethod" placeholder="选择收款方式" style="width: 100%">
                <el-option v-for="m in PAY_METHODS" :key="m" :label="m" :value="m" />
              </el-select>
            </el-form-item></el-col>
          </el-row>
          <el-form-item label="服务内容" required>
            <el-input v-model="form.serviceContent" type="textarea" :rows="3" placeholder="例如:小规模纳税人代理记账、月度报税、年度汇算清缴…" />
          </el-form-item>
          <el-divider content-position="left">补充信息</el-divider>
          <el-row :gutter="14">
            <el-col :span="12"><el-form-item label="公司性质">
              <el-select v-model="form.companyNature" placeholder="选择公司性质" clearable style="width: 100%">
                <el-option v-for="n in COMPANY_NATURES" :key="n" :label="n" :value="n" />
              </el-select>
            </el-form-item></el-col>
            <el-col :span="12"><el-form-item label="代账金额">
              <el-input-number v-model="form.bookkeepingAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" placeholder="代账金额" />
            </el-form-item></el-col>
            <el-col :span="12"><el-form-item label="合作周期">
              <el-select v-model="form.coopPeriod" placeholder="选择合作周期" clearable style="width: 100%">
                <el-option v-for="p in COOP_PERIODS" :key="p" :label="p" :value="p" />
              </el-select>
            </el-form-item></el-col>
            <el-col :span="12"><el-form-item label="合作起止">
              <el-date-picker v-model="coopRange" type="daterange" range-separator="至" start-placeholder="开始时间" end-placeholder="到期时间"
                value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item></el-col>
            <el-col :span="16"><el-form-item label="注册地址">
              <el-input v-model="form.regAddress" placeholder="注册地址" />
            </el-form-item></el-col>
            <el-col :span="8"><el-form-item label="地址归属">
              <el-select v-model="form.regAddressOwner" placeholder="归属" clearable style="width: 100%">
                <el-option v-for="o in REG_ADDRESS_OWNERS" :key="o" :label="o" :value="o" />
              </el-select>
            </el-form-item></el-col>
          </el-row>
          <el-form-item label="特殊备注">
            <el-input v-model="form.specialRemark" type="textarea" :rows="2" maxlength="500" show-word-limit placeholder="特殊备注(选填)" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 步骤③ 上传附件 -->
      <div v-show="step === 2" class="bk-step">
        <el-upload :show-file-list="false" :http-request="doUpload" multiple drag accept="image/*,.pdf,.doc,.docx">
          <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
          <div class="el-upload__text">把合同文件拖到这里,或<em>点击上传</em></div>
          <template #tip><div class="el-upload__tip">支持图片 / PDF / Word,至少上传 1 个</div></template>
        </el-upload>
        <div v-if="contractFiles.length" class="bk-files">
          <div v-for="(f, i) in contractFiles" :key="i" class="bk-file">
            <el-icon><Document /></el-icon>
            <span class="bk-file-name" :title="f.name">{{ f.name }}</span>
            <el-button size="small" link type="danger" @click="removeFile(i)"><el-icon><Close /></el-icon></el-button>
          </div>
        </div>
        <el-empty v-else description="还没有上传合同附件(必填)" :image-size="70" />
      </div>

      <!-- 步骤④ 确认提交 -->
      <div v-show="step === 3" class="bk-step">
        <el-descriptions title="基础信息" :column="2" border size="small">
          <el-descriptions-item label="公司名称">{{ form.companyName }}</el-descriptions-item>
          <el-descriptions-item label="联系人/法人">{{ form.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ form.phone }}</el-descriptions-item>
          <el-descriptions-item label="信用代码">{{ form.creditCode }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="合同信息" :column="2" border size="small" style="margin-top: 14px">
          <el-descriptions-item label="合同金额">¥{{ fmtMoney(form.contractAmount) }}</el-descriptions-item>
          <el-descriptions-item label="签约日期">{{ form.signDate }}</el-descriptions-item>
          <el-descriptions-item label="服务周期">{{ form.serviceStart }} ~ {{ form.serviceEnd }}</el-descriptions-item>
          <el-descriptions-item label="收款方式">{{ form.payMethod }}</el-descriptions-item>
          <el-descriptions-item label="公司性质">{{ form.companyNature || '—' }}</el-descriptions-item>
          <el-descriptions-item label="代账金额">{{ form.bookkeepingAmount != null ? '¥' + fmtMoney(form.bookkeepingAmount) : '—' }}</el-descriptions-item>
          <el-descriptions-item label="合作周期">{{ form.coopPeriod || '—' }}</el-descriptions-item>
          <el-descriptions-item label="合作起止">{{ form.coopStart || '—' }} ~ {{ form.coopEnd || '—' }}</el-descriptions-item>
          <el-descriptions-item label="地址归属">{{ form.regAddressOwner || '—' }}</el-descriptions-item>
          <el-descriptions-item label="注册地址" :span="2">{{ form.regAddress || '—' }}</el-descriptions-item>
          <el-descriptions-item label="服务内容" :span="2">{{ form.serviceContent }}</el-descriptions-item>
          <el-descriptions-item label="特殊备注" :span="2">{{ form.specialRemark || '—' }}</el-descriptions-item>
        </el-descriptions>
        <el-descriptions title="合同附件" :column="1" border size="small" style="margin-top: 14px">
          <el-descriptions-item :label="`共 ${contractFiles.length} 个`">
            <div v-for="(f, i) in contractFiles" :key="i" class="bk-confirm-file">
              <el-icon><Document /></el-icon> {{ f.name }}
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button v-if="step > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="step < 3" type="primary" @click="nextStep">下一步</el-button>
        <el-button v-else type="primary" :loading="dlg.saving" @click="submit">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, UploadFilled, Document, Close, CircleCheck, CircleCheckFilled } from '@element-plus/icons-vue'
import { bookkeepingApi, type BookkeepingOrder } from '@/api/bookkeeping'
import { leadApi } from '@/api/crm'
import { fileInfoApi } from '@/api/file'
import { companyApi } from '@/api/company'

const PAY_METHODS = ['对公转账', '支付宝', '微信', '现金', '其他']
const COMPANY_NATURES = ['个体户(查账)', '个体户(核定)', '小规模(0申报)', '小规模(有账)', '一般纳税人(0申报)', '一般纳税人(有账)']
const COOP_PERIODS = ['一年', '多年']
const REG_ADDRESS_OWNERS = ['客户', '公司']

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

const fileCount = (row: BookkeepingOrder) => {
  try {
    const arr = JSON.parse(row.contractFile || '[]')
    return Array.isArray(arr) ? arr.length : 0
  } catch { return 0 }
}
const statusLabel = (s?: string) => (({ done: '已完成', processing: '处理中', reviewing: '审核中', confirmed: '已确认', rejected: '已驳回' } as Record<string, string>)[s || ''] || '待提交')
const statusType = (s?: string) => (({ done: 'success', processing: 'warning', reviewing: 'warning', confirmed: 'success', rejected: 'danger' } as Record<string, string>)[s || ''] || 'info')
const isLocked = (row: BookkeepingOrder) => ['reviewing', 'confirmed'].includes(row.status || '')
const canSubmitReview = (row: BookkeepingOrder) => ['pending', 'rejected'].includes(row.status || 'pending')

async function submitReview(row: BookkeepingOrder) {
  try {
    await ElMessageBox.confirm(
      `提交「${row.companyName}」进入审核流程?\n流程:部门主管合同审理 → 财务到款确认 → 分配办理 → 验收。提交后本单锁定,驳回后可修改重提。`,
      '提交审核', { type: 'warning', confirmButtonText: '提交', cancelButtonText: '取消' }
    )
  } catch { return }
  await bookkeepingApi.submitReview(row.id!)
  ElMessage.success('已提交,主管可在「审单中心」进行合同审理')
  load()
}

/* ---------- 列表 ---------- */
const rows = ref<BookkeepingOrder[]>([])
const loading = ref(false)
const load = async () => {
  loading.value = true
  try {
    const res: any = await bookkeepingApi.list()
    rows.value = (res?.data ?? res) || []
  } catch { rows.value = [] } finally { loading.value = false }
}
const remove = async (row: BookkeepingOrder) => {
  try { await ElMessageBox.confirm(`删除「${row.companyName}」的提单?`, '删除', { type: 'warning' }) } catch { return }
  try { await bookkeepingApi.remove(row.id!); ElMessage.success('已删除'); load() } catch { ElMessage.error('删除失败') }
}

/* ---------- 向导 ---------- */
const dlg = reactive({ visible: false, saving: false })
const step = ref(0)
interface ContractFile { name: string; url: string; fileId: string }
const blankForm = (): BookkeepingOrder => ({
  leadId: undefined, companyName: '', contactName: '', phone: '', creditCode: '',
  contractAmount: 0, serviceStart: '', serviceEnd: '', signDate: '', payMethod: '', serviceContent: '',
  companyNature: '', coopPeriod: '', coopStart: '', coopEnd: '',
  regAddress: '', regAddressOwner: '', bookkeepingAmount: undefined, specialRemark: ''
})
const form = reactive<BookkeepingOrder>(blankForm())
const serviceRange = ref<[string, string] | null>(null)
// 服务周期实时回填到 form,避免第4步「确认」页显示旧值;原 nextStep/submit 的同步保留作兜底
watch(serviceRange, (v) => {
  if (v && v.length === 2) { form.serviceStart = v[0]; form.serviceEnd = v[1] }
  else { form.serviceStart = ''; form.serviceEnd = '' }
})
// 合作起止实时回填(合作周期字段,和服务周期语义不同)
const coopRange = ref<[string, string] | null>(null)
watch(coopRange, (v) => {
  if (v && v.length === 2) { form.coopStart = v[0]; form.coopEnd = v[1] }
  else { form.coopStart = ''; form.coopEnd = '' }
})
const contractFiles = ref<ContractFile[]>([])

const openWizard = () => { resetWizard(); dlg.visible = true; loadLeads() }
const resetWizard = () => {
  step.value = 0
  Object.assign(form, blankForm())
  serviceRange.value = null
  coopRange.value = null
  contractFiles.value = []
  picked.value = null
}

/* 步骤① 线索 */
const leads = ref<any[]>([])
const leadLoading = ref(false)
const leadKw = ref('')
const picked = ref<any>(null)
const loadLeads = async () => {
  leadLoading.value = true
  try {
    const res: any = await leadApi.myList({ pageNum: 1, pageSize: 50 })
    const page = res?.data ?? res
    leads.value = page?.records || []
  } catch { leads.value = [] } finally { leadLoading.value = false }
}
const filteredLeads = computed(() => {
  const kw = leadKw.value.trim().toLowerCase()
  if (!kw) return leads.value
  return leads.value.filter((l) =>
    [l.company, l.legalPerson, l.phone, l.creditCode].some((v) => String(v || '').toLowerCase().includes(kw)))
})
const leadRowClass = ({ row }: { row: any }) => (picked.value && picked.value.id === row.id ? 'bk-picked-row' : '')
const onPickLead = async (row: any) => {
  if (!row) return
  picked.value = row
  form.leadId = row.id
  form.companyName = row.company || ''
  form.contactName = row.legalPerson || ''
  form.phone = row.phone || ''
  form.creditCode = row.creditCode || ''
  // 线索本身没存法人/信用代码时,按公司名查工商库自动补全
  if ((!form.contactName || !form.creditCode) && form.companyName) {
    try {
      const res: any = await companyApi.detail(form.companyName)
      const info = res?.data ?? res
      if (info) {
        const filledLegal = !form.contactName && info.legalPerson
        const filledCredit = !form.creditCode && info.creditCode
        if (filledLegal) form.contactName = info.legalPerson || ''
        if (filledCredit) form.creditCode = info.creditCode || ''
        if (filledLegal || filledCredit) ElMessage.success('已从工商库自动补全法人/信用代码')
      }
    } catch {
      /* 工商库无此企业,可在下方手动填写 */
    }
  }
}

/* 步骤③ 上传 */
const doUpload = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    contractFiles.value.push({
      name: data?.originalName || data?.fileName || options.file.name,
      url: data?.filePath || data?.url || data?.path || '',
      fileId: data?.id != null ? String(data.id) : ''
    })
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
const removeFile = (i: number) => { contractFiles.value.splice(i, 1) }

/* 步骤校验 + 翻页 */
const validateStep = (s: number): boolean => {
  if (s === 0) {
    if (!form.companyName || !form.contactName || !form.phone || !form.creditCode) {
      ElMessage.warning('请选择线索或补全公司/联系人/电话/信用代码'); return false
    }
  } else if (s === 1) {
    if (!form.contractAmount || form.contractAmount <= 0) { ElMessage.warning('请填写合同金额'); return false }
    if (!serviceRange.value || !serviceRange.value[0] || !serviceRange.value[1]) { ElMessage.warning('请选择服务周期'); return false }
    if (!form.signDate) { ElMessage.warning('请选择签约日期'); return false }
    if (!form.payMethod) { ElMessage.warning('请选择收款方式'); return false }
    if (!form.serviceContent) { ElMessage.warning('请填写服务内容'); return false }
  } else if (s === 2) {
    if (!contractFiles.value.length) { ElMessage.warning('请至少上传 1 个合同附件'); return false }
  }
  return true
}
const nextStep = () => {
  if (!validateStep(step.value)) return
  if (step.value === 1 && serviceRange.value) {
    form.serviceStart = serviceRange.value[0]
    form.serviceEnd = serviceRange.value[1]
  }
  step.value++
}
const prevStep = () => { if (step.value > 0) step.value-- }

const submit = async () => {
  // 提交前再次完整校验
  for (let s = 0; s <= 2; s++) { if (!validateStep(s)) { step.value = s; return } }
  if (serviceRange.value) { form.serviceStart = serviceRange.value[0]; form.serviceEnd = serviceRange.value[1] }
  dlg.saving = true
  try {
    const payload: BookkeepingOrder = {
      leadId: form.leadId,
      companyName: form.companyName,
      contactName: form.contactName,
      phone: form.phone,
      creditCode: form.creditCode,
      contractAmount: form.contractAmount,
      serviceStart: form.serviceStart,
      serviceEnd: form.serviceEnd,
      signDate: form.signDate,
      payMethod: form.payMethod,
      serviceContent: form.serviceContent,
      companyNature: form.companyNature,
      coopPeriod: form.coopPeriod,
      coopStart: form.coopStart,
      coopEnd: form.coopEnd,
      regAddress: form.regAddress,
      regAddressOwner: form.regAddressOwner,
      bookkeepingAmount: form.bookkeepingAmount,
      specialRemark: form.specialRemark,
      contractFile: JSON.stringify(contractFiles.value),
      status: 'pending'
    }
    await bookkeepingApi.save(payload)
    ElMessage.success('提交成功')
    dlg.visible = false
    load()
  } catch { ElMessage.error('提交失败') } finally { dlg.saving = false }
}

onMounted(load)
</script>

<style scoped>
.bk-page { padding: 16px 18px; }
.bk-head { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
.bk-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.bk-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.bk-muted { color: var(--el-text-color-secondary); font-size: 12px; }
.bk-steps { margin-bottom: 22px; }
.bk-step { min-height: 300px; }
.bk-step-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.bk-search { width: 240px; }
:deep(.bk-picked-row) { background: var(--el-color-primary-light-9); }
.bk-files { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
.bk-file { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-fill-color-lighter); }
.bk-file-name { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.bk-confirm-file { display: flex; align-items: center; gap: 6px; padding: 2px 0; font-size: 13px; }
.bk-dialog :deep(.el-dialog__body) { padding-top: 8px; }
</style>

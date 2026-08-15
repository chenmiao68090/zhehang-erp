<template>
  <!-- 新建客户弹窗:字段与「找客户」的新建表单完全一致,仅做新建(ownerId=当前登录人→归我的客户) -->
  <el-dialog
    v-model="visible"
    title="新建客户"
    width="980px"
    top="5vh"
    class="lead-form-dialog"
    destroy-on-close
  >
    <el-scrollbar max-height="70vh">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="lead-form">
        <section class="lead-form-section">
          <div class="section-title">基础信息</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="公司名称" prop="company">
                <el-input v-model="formData.company" placeholder="请输入企业全称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人（法定代表人）" prop="legalPerson">
                <el-input v-model="formData.legalPerson" placeholder="默认填写法定代表人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="有效手机号" prop="phone">
                <el-input
                  v-model="formData.phone"
                  placeholder="手机号/可拨打电话"
                  @input="onPhoneInput"
                  @paste="onPhonePaste"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源" prop="source">
                <el-select v-model="formData.source" placeholder="请选择来源" style="width: 100%">
                  <el-option v-for="item in LEAD_SOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <!-- ===== 投流客资信息 ===== -->
        <section class="lead-form-section">
          <div class="section-title">投流客资信息</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="客户编号">
                <el-input v-model="formData.leadNo" readonly placeholder="保存后自动生成" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="创建时间">
                <el-date-picker v-model="formData.createTime" type="datetime" placeholder="默认取保存时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="月份（按创建时间）">
                <el-input :model-value="derivedMonth" readonly placeholder="保存后自动派生" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="来源平台">
                <el-select v-model="formData.sourcePlatform" placeholder="请选择来源平台" clearable filterable style="width: 100%">
                  <el-option v-for="p in SOURCE_PLATFORM_OPTIONS" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="门店&品牌词">
                <el-input v-model="formData.storeBrand" placeholder="门店 / 品牌词" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="咨询业务">
                <el-select v-model="formData.consultBusiness" placeholder="请选择咨询业务" clearable filterable style="width: 100%" :loading="consultBusinessLoading" :disabled="!consultBusinessResolved">
                  <el-option v-for="b in consultBusinessSelectOptions" :key="b.value" :label="b.label" :value="b.value" :disabled="b.disabled" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户昵称">
                <el-input v-model="formData.nickname" placeholder="客户昵称" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户微信">
                <el-input v-model="formData.wechatNo" placeholder="微信号（可含 -）" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="虚拟电话">
                <el-input v-model="formData.virtualPhone" placeholder="虚拟电话（可含 -）" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="是否有效">
                <el-select v-model="formData.validity" placeholder="请选择" clearable style="width: 100%">
                  <el-option v-for="v in validityOptions" :key="v" :label="v" :value="v" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="跟进状态">
                <el-select v-model="formData.followStatus" placeholder="请选择跟进状态" clearable style="width: 100%">
                  <el-option v-for="s in followStageOptions" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成交金额（元）">
                <el-input-number v-model="dealAmountNum" :min="0" :precision="2" :controls="false" placeholder="0.00" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="实际成交业务">
                <el-select v-model="dealBusinessArr" multiple placeholder="可多选" filterable collapse-tags collapse-tags-tooltip style="width: 100%" :loading="consultBusinessLoading" :disabled="!consultBusinessResolved">
                  <el-option v-for="b in dealBusinessSelectOptions" :key="b.value" :label="b.label" :value="b.value" :disabled="b.disabled" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="附件（支持粘贴图片）">
                <div class="lead-doc-uploader" @paste="onLeadDocPaste">
                  <el-upload :show-file-list="false" :http-request="(o: any) => uploadLeadDoc(o)" accept="image/*,.pdf" multiple>
                    <el-button :icon="Upload">上传附件</el-button>
                  </el-upload>
                  <div class="lead-doc-list">
                    <el-tag
                      v-for="d in leadDocList"
                      :key="d.key"
                      closable
                      type="info"
                      class="lead-doc-tag"
                      @close="removeLeadDoc(d.key)"
                    >{{ d.fileName }}</el-tag>
                    <span v-if="!leadDocList.length" class="field-tip">可点击上传或在此区域直接粘贴（Ctrl+V）图片</span>
                  </div>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="lead-form-section">
          <div class="section-title">工商信息</div>
          <el-row :gutter="16">
            <el-col :span="8">
              <el-form-item label="登记状态">
                <el-input v-model="formData.registerStatus" placeholder="如：存续、在业、注销" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="企业规模">
                <el-input v-model="formData.enterpriseScale" placeholder="如：1-49人" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="企业类型">
                <el-input v-model="formData.enterpriseType" placeholder="如：有限责任公司" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="注册资本" prop="registeredCapital">
                <el-input v-model="formData.registeredCapital" placeholder="金额或数值" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="实缴资本">
                <el-input v-model="formData.paidCapital" placeholder="如：20万人民币" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="统一社会信用代码" prop="creditCode">
                <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成立日期" prop="establishedDate">
                <el-date-picker v-model="formData.establishedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="核准日期">
                <el-date-picker v-model="formData.approvedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="参保人数">
                <el-input v-model="formData.insuredCount" placeholder="人数" />
              </el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="所属年报">
                <el-input v-model="formData.insuredYear" placeholder="年份" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="所属区域">
                <el-input v-model="formData.region" placeholder="省 / 市 / 区县" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="来源说明/来源细分">
                <el-input v-model="formData.sourceDetail" maxlength="50" placeholder="如：推广活动、渠道批次或来源补充" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>

        <section class="lead-form-section">
          <div class="section-title">地址与经营范围</div>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="注册地址" prop="registerAddress">
                <el-input v-model="formData.registerAddress" type="textarea" :rows="2" placeholder="工商注册地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最新地址">
                <el-input v-model="formData.latestAddress" type="textarea" :rows="2" placeholder="实际经营地址/客户联系地址（区别于注册地址）" />
                <div class="field-tip">填写客户当前实际经营地址或联系地址，与工商注册地址区分</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮箱">
                <el-input v-model="formData.email" placeholder="企业邮箱" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注">
                <el-input v-model="formData.remark" placeholder="补充说明" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="经营范围">
                <el-input v-model="formData.businessScope" type="textarea" :rows="4" placeholder="企业经营范围" />
              </el-form-item>
            </el-col>
          </el-row>
        </section>
      </el-form>
    </el-scrollbar>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" :disabled="!fieldOptionsReady" @click="submitForm">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { leadApi } from '@/api/crm'
import { fileInfoApi } from '@/api/file'
import { LEAD_SOURCE_OPTIONS, LEAD_SOURCE_PLATFORM_OPTIONS } from '@/constants/lead-source'
import { useFieldOptions } from '@/composables/useFieldOptions'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void; (e: 'saved'): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
})

const userStore = useUserStore()
const currentUserId = computed<number | null>(() => (userStore.userInfo?.id as number) ?? null)

const formRef = ref<FormInstance>()
const saving = ref(false)

const SOURCE_PLATFORM_OPTIONS = LEAD_SOURCE_PLATFORM_OPTIONS
const FALLBACK_BUSINESS_OPTIONS = [
  '工商注册', '工商变更', '代账', '代理记账', '税务合规',
  '商标业务', '专利业务', '项目申报', '刻章业务', '未知业务'
]
const FALLBACK_FOLLOW_STAGE_OPTIONS = ['线索接收', '需求沟通', '需求答疑', '签单收款', '移交结束交付']
const FALLBACK_VALIDITY_OPTIONS = ['有效', '无效', '待定']

// 新建线索与找客户共用后端治理目录；未配置或请求失败时才保留现有版本常量。
const {
  loading: consultBusinessLoading,
  resolved: consultBusinessResolved,
  defaultValue: consultBusinessDefault,
  withHistoricalValues: withConsultBusinessHistory,
  isSelectable: isConsultBusinessSelectable
} = useFieldOptions('crm_consult_business', FALLBACK_BUSINESS_OPTIONS)
// 有效性与跟进阶段参与销售状态机/历史统计，不作为普通字典增删停用。
const validityOptions = FALLBACK_VALIDITY_OPTIONS
const followStageOptions = FALLBACK_FOLLOW_STAGE_OPTIONS

function blankForm() {
  return {
    id: 0, name: '', company: '', legalPerson: '', phone: '', registerDate: '',
    establishedDate: '', approvedDate: '', email: '', registerStatus: '', enterpriseScale: '',
    enterpriseType: '', registeredCapital: '', paidCapital: '', creditCode: '', insuredCount: '',
    insuredYear: '', registerAddress: '', latestAddress: '', businessScope: '', region: '',
    sourceDetail: '', source: 1, status: 1, remark: '',
    leadNo: '', sourcePlatform: '', storeBrand: '', consultBusiness: '', nickname: '',
    wechatNo: '', virtualPhone: '', validity: '', followStatus: '', dealAmount: '', createTime: ''
  }
}
const formData = reactive<Record<string, any>>(blankForm())
const dealBusinessArr = ref<string[]>([])
const fieldOptionsReady = computed(() => consultBusinessResolved.value)
const consultBusinessSelectOptions = computed(() => withConsultBusinessHistory(formData.consultBusiness))
const dealBusinessSelectOptions = computed(() => withConsultBusinessHistory(dealBusinessArr.value))
const leadDocs = ref<Record<string, { fileId: string; fileName: string }>>({})
const leadDocList = computed(() => Object.entries(leadDocs.value).map(([key, v]) => ({ key, ...(v as any) })))
let leadDocSeq = 0

function resetFormData() {
  Object.assign(formData, blankForm())
  dealBusinessArr.value = []
  leadDocs.value = {}
  formRef.value?.clearValidate?.()
}

function applyFieldDefaults() {
  if (!fieldOptionsReady.value) return
  if (!formData.consultBusiness && consultBusinessDefault.value) formData.consultBusiness = consultBusinessDefault.value
}

// 打开弹窗即清空为全新表单
watch(() => props.modelValue, (v) => {
  if (v) {
    resetFormData()
    applyFieldDefaults()
  }
})
watch(
  [fieldOptionsReady, consultBusinessDefault],
  () => { if (props.modelValue) applyFieldDefaults() }
)

function validateFieldOptionSelections() {
  if (!fieldOptionsReady.value) {
    ElMessage.warning('字段选项正在加载，请稍后保存')
    return false
  }
  const invalid = (formData.consultBusiness && !isConsultBusinessSelectable(formData.consultBusiness))
    || dealBusinessArr.value.some((value) => !isConsultBusinessSelectable(value))
  if (invalid) ElMessage.warning('所选字段值已停用，请重新选择')
  return !invalid
}

const uploadLeadDoc = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    leadDocSeq++
    leadDocs.value = {
      ...leadDocs.value,
      [`doc-${Date.now()}-${leadDocSeq}`]: {
        fileId: data?.id != null ? String(data.id) : '',
        fileName: data?.originalName || data?.fileName || options.file.name
      }
    }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
const removeLeadDoc = (key: string) => { const d = { ...leadDocs.value }; delete d[key]; leadDocs.value = d }
const onLeadDocPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return
  for (const it of Array.from(items)) {
    if (it.type.startsWith('image/')) {
      const file = it.getAsFile()
      if (file) uploadLeadDoc({ file })
    }
  }
}

const derivedMonth = computed(() => {
  const t = (formData.createTime as string) || ''
  return t ? String(t).slice(0, 7) : ''
})
const dealAmountNum = computed<number | undefined>({
  get: () => {
    const v = formData.dealAmount
    if (v === '' || v == null) return undefined
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  },
  set: (val) => { formData.dealAmount = (val == null ? '' : val) }
})
const formRules: FormRules = {
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  legalPerson: [{ required: true, message: '请输入联系人（法定代表人）', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入有效手机号', trigger: 'blur' }],
  registeredCapital: [{ required: true, message: '请输入注册资本', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
  establishedDate: [{ required: true, message: '请选择成立日期', trigger: 'change' }],
  registerAddress: [{ required: true, message: '请输入注册地址', trigger: 'blur' }]
}

const onPhoneInput = (val: string) => {
  const cleaned = (val || '').replace(/\s/g, '')
  if (cleaned !== val) formData.phone = cleaned
}
const onPhonePaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  if (text && /\s/.test(text)) {
    e.preventDefault()
    formData.phone = ((formData.phone || '') + text).replace(/\s/g, '')
  }
}

const normalizeMoneyText = (value: string) => {
  if (!value) return ''
  const match = value.replace(/,/g, '').match(/[0-9]+(?:\.[0-9]+)?/)
  return match ? match[0] : ''
}

function buildLeadPayload() {
  const companyName = (formData.company || '').trim()
  const legalPerson = (formData.legalPerson || formData.name || '').trim()
  return {
    id: formData.id,
    name: legalPerson || companyName,
    company: companyName,
    legalPerson,
    phone: formData.phone || '',
    email: formData.email || '',
    registerStatus: formData.registerStatus || '',
    source: formData.source || 1,
    status: formData.status || 1,
    remark: formData.remark || '',
    region: formData.region || '',
    enterpriseScale: formData.enterpriseScale || '',
    enterpriseType: formData.enterpriseType || '',
    registeredCapital: normalizeMoneyText(String(formData.registeredCapital || '')) || null,
    paidCapital: formData.paidCapital || '',
    establishedDate: formData.establishedDate || formData.registerDate || null,
    approvedDate: formData.approvedDate || null,
    creditCode: formData.creditCode || '',
    insuredCount: formData.insuredCount || '',
    insuredYear: formData.insuredYear || '',
    registerAddress: formData.registerAddress || '',
    latestAddress: formData.latestAddress || '',
    businessScope: formData.businessScope || '',
    sourceDetail: formData.sourceDetail || '',
    sourcePlatform: formData.sourcePlatform || '',
    storeBrand: formData.storeBrand || '',
    consultBusiness: formData.consultBusiness || '',
    nickname: formData.nickname || '',
    wechatNo: formData.wechatNo || '',
    virtualPhone: formData.virtualPhone || '',
    validity: formData.validity || '',
    followStatus: formData.followStatus || '',
    dealAmount: formData.dealAmount === '' || formData.dealAmount == null ? null : Number(formData.dealAmount),
    dealBusiness: dealBusinessArr.value.join(','),
    attachments: JSON.stringify(Object.values(leadDocs.value))
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  if (!validateFieldOptionSelections()) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const payload: any = buildLeadPayload()
    // 新建:带 ownerId=当前登录人 → 后端归 private(我的客户);失败由拦截器弹错误
    payload.ownerId = currentUserId.value
    payload.status = 1
    saving.value = true
    try {
      await leadApi.create(payload)
    } catch {
      saving.value = false
      return
    }
    saving.value = false
    ElMessage.success('已创建')
    visible.value = false
    emit('saved')
  })
}
</script>

<style scoped>
.lead-form { padding-right: 8px; }
.lead-form-section {
  padding: 14px 16px 4px;
  margin-bottom: 14px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-elevated);
}
.lead-form-section .section-title {
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}
.lead-form .field-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary, #909399);
}
.lead-form-dialog :deep(.el-dialog__body) { padding-top: 8px; }
.lead-form-dialog :deep(.el-form-item) { margin-bottom: 14px; }
.lead-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-body);
}
.lead-doc-uploader { width: 100%; }
.lead-doc-uploader .lead-doc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.lead-doc-uploader .lead-doc-tag { max-width: 100%; }
</style>

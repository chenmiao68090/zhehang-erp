<template>
  <div class="tax-profile-panel" v-loading="loading">
    <div class="tp-head">
      <h4>税务档案</h4>
      <span class="tp-sub">以统一社会信用代码勾稽 · {{ creditCode || '—' }}</span>
    </div>
    <el-form :model="form" label-width="92px" size="small" class="tp-form">
      <el-form-item label="纳税人资格">
        <el-select v-model="form.taxpayerType" placeholder="请选择" clearable style="width:100%">
          <el-option :value="1" label="一般纳税人" />
          <el-option :value="2" label="小规模纳税人" />
        </el-select>
      </el-form-item>
      <el-form-item label="征收方式">
        <el-select v-model="form.collectionType" placeholder="请选择" clearable style="width:100%">
          <el-option value="查账征收" label="查账征收" />
          <el-option value="核定征收" label="核定征收" />
        </el-select>
      </el-form-item>
      <el-form-item label="主管税务局">
        <el-input v-model="form.taxAuthority" placeholder="如：国家税务总局杭州市滨江区税务局" />
      </el-form-item>
      <el-form-item label="涉及税种">
        <el-checkbox-group v-model="taxTypesArr">
          <el-checkbox v-for="t in TAX_TYPE_OPTIONS" :key="t" :value="t" :label="t" />
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="申报周期">
        <el-select v-model="form.filingCycle" placeholder="请选择" clearable style="width:100%">
          <el-option value="月报" label="月报" />
          <el-option value="季报" label="季报" />
          <el-option value="年报" label="年报" />
        </el-select>
      </el-form-item>
      <el-form-item label="办税人">
        <el-input v-model="form.taxOfficer" placeholder="办税人姓名" />
      </el-form-item>
      <el-form-item label="办税人电话">
        <el-input v-model="form.taxOfficerPhone" placeholder="联系电话" />
      </el-form-item>
      <el-form-item label="税务报到日">
        <el-date-picker v-model="form.registerDate" type="date" value-format="YYYY-MM-DD"
                        placeholder="选择日期" style="width:100%" />
      </el-form-item>
      <el-form-item label="票种核定">
        <el-input v-model="form.invoiceType" placeholder="如：增值税普通发票" />
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="其他税务事项备注" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" :disabled="!creditCode" @click="save">
          保存税务档案
        </el-button>
        <span v-if="savedAt" class="tp-saved">已保存 {{ savedAt }}</span>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { taxProfileApi, type TaxProfile } from '@/api/crm'

const props = defineProps<{ creditCode: string; companyName?: string }>()

const TAX_TYPE_OPTIONS = ['增值税', '附加税', '企业所得税', '个人所得税', '印花税', '其他']

const loading = ref(false)
const saving = ref(false)
const savedAt = ref('')
const taxTypesArr = ref<string[]>([])
const form = reactive<TaxProfile>({ creditCode: props.creditCode, companyName: props.companyName })

function parseTaxTypes(s?: string): string[] {
  if (!s) return []
  try {
    const a = JSON.parse(s)
    return Array.isArray(a) ? a : []
  } catch {
    return []
  }
}

/** 把后端数据(或 null)套进表单，切换企业时正确清空残留 */
function applyData(d: TaxProfile | null) {
  form.id = d?.id
  form.customerId = d?.customerId
  form.taxpayerType = d?.taxpayerType
  form.collectionType = d?.collectionType
  form.taxAuthority = d?.taxAuthority
  form.taxOfficer = d?.taxOfficer
  form.taxOfficerPhone = d?.taxOfficerPhone
  form.registerDate = d?.registerDate
  form.invoiceType = d?.invoiceType
  form.filingCycle = d?.filingCycle
  form.status = d?.status
  form.remark = d?.remark
  form.creditCode = props.creditCode
  form.companyName = props.companyName || d?.companyName
  taxTypesArr.value = parseTaxTypes(d?.taxTypes)
}

async function load() {
  if (!props.creditCode) {
    applyData(null)
    return
  }
  loading.value = true
  try {
    const data = await taxProfileApi.get(props.creditCode)
    applyData(data || null)
  } catch {
    applyData(null)
  } finally {
    loading.value = false
  }
}

async function save() {
  if (!props.creditCode) {
    ElMessage.warning('缺少统一社会信用代码，无法保存税务档案')
    return
  }
  saving.value = true
  try {
    form.creditCode = props.creditCode
    form.companyName = props.companyName || form.companyName
    form.taxTypes = JSON.stringify(taxTypesArr.value)
    const saved = await taxProfileApi.save({ ...form })
    if (saved) applyData(saved)
    savedAt.value = new Date().toLocaleTimeString('zh-CN')
    ElMessage.success('税务档案已保存')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

watch(() => props.creditCode, load)
onMounted(load)
</script>

<style scoped>
.tax-profile-panel {
  margin-top: 16px;
  border-top: 1px dashed #e4e7ed;
  padding-top: 14px;
}
.tp-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}
.tp-head h4 {
  margin: 0;
  font-size: 15px;
  color: #303133;
}
.tp-sub {
  font-size: 12px;
  color: #909399;
}
.tp-saved {
  margin-left: 10px;
  font-size: 12px;
  color: #67c23a;
}
</style>

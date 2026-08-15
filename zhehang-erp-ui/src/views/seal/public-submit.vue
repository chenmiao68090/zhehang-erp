<template>
  <div class="seal-public">
    <div class="form-shell">
      <section class="form-hero">
        <div>
          <div class="eyebrow">ZHEHANG · 刻章自助登记</div>
          <h1>刻章资料自助提交</h1>
          <p>请填写基本信息,提交后我们会尽快与您联系核对并办理。</p>
        </div>
      </section>

      <el-card shadow="never" class="form-card">
        <el-result
          v-if="linkError"
          icon="warning"
          title="安全链接不可用"
          :sub-title="linkError"
        />

        <el-result
          v-else-if="submitted"
          icon="success"
          title="提交成功"
          sub-title="资料已安全提交，我们会尽快联系您；本链接现已失效。"
        />

        <el-form v-else ref="formRef" :model="form" :rules="rules" label-position="top">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item label="公司名称" prop="companyName">
                <el-input v-model="form.companyName" placeholder="刻章单位公司全称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="法人" prop="legalPerson">
                <el-input v-model="form.legalPerson" placeholder="请输入法人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="印章状态" prop="sealStatus">
                <el-select v-model="form.sealStatus" clearable filterable style="width: 100%" placeholder="请选择印章状态">
                  <el-option v-for="s in options.sealStatuses" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备案状态">
                <el-select v-model="form.recordStatus" clearable filterable style="width: 100%" placeholder="请选择备案状态">
                  <el-option v-for="s in options.recordStatuses" :key="s" :label="s" :value="s" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="刻章城市" prop="sealCity">
                <el-select v-model="form.sealCity" clearable filterable style="width: 100%" placeholder="请选择城市">
                  <el-option v-for="c in options.sealCities" :key="c" :label="c" :value="c" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24" v-if="form.sealCity && form.sealCity !== '杭州'">
              <el-alert type="warning" :closable="false" show-icon
                title="刻章城市为杭州以外:通常加收 80 元/个,且需提供法人靠白墙半身照,我们会与您确认。"
                style="margin-bottom: 12px" />
            </el-col>
            <el-col :span="12">
              <el-form-item label="印章材质" prop="sealMaterial">
                <el-select v-model="materialList" multiple clearable style="width: 100%" placeholder="可多选">
                  <el-option v-for="m in options.sealMaterials" :key="m" :label="m" :value="m" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="印章类型">
                <el-select v-model="typeList" multiple clearable filterable style="width: 100%" placeholder="可多选,留空也可">
                  <el-option v-for="t in options.sealTypes" :key="t" :label="t" :value="t" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="身份证等敏感材料请勿在本页上传；经办人会通过已确认的安全渠道另行收取。"
                style="margin-bottom: 12px"
              />
            </el-col>
            <el-col :span="12">
              <el-form-item label="收件人">
                <el-input v-model="form.recipient" placeholder="如需邮寄请填写收件人" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收件地址">
                <el-input v-model="form.address" placeholder="如需邮寄请填写收件地址" />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="其他需要说明的信息" />
              </el-form-item>
            </el-col>
          </el-row>

          <div class="form-actions">
            <el-button type="primary" size="large" :loading="submitting" @click="submitForm">提交资料</el-button>
          </div>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { sealPublicApi, type SealPublicForm, type SealPublicOptions } from '@/api/seal-public'

const formRef = ref()
const submitting = ref(false)
const submitted = ref(false)
const linkError = ref('')
const materialList = ref<string[]>([])
const typeList = ref<string[]>([])
const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ''))
const token = String(fragment.get('ticket') || '')

const options = reactive<SealPublicOptions>({
  sealStatuses: [],
  recordStatuses: [],
  sealCities: [],
  sealMaterials: [],
  sealTypes: []
})

function emptyForm(): SealPublicForm {
  return {
    companyName: '',
    legalPerson: '',
    phone: '',
    sealStatus: '',
    recordStatus: '',
    sealCity: '',
    sealMaterial: '',
    sealTypes: '',
    recipient: '',
    address: '',
    remark: ''
  }
}

const form = reactive<SealPublicForm>(emptyForm())

const rules = {
  companyName: [{ required: true, message: '请填写公司名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请填写联系电话', trigger: 'blur' }]
}

async function loadOptions() {
  if (!/^[0-9a-f]{64}$/.test(token)) {
    linkError.value = '链接格式不正确，请联系经办人重新生成。'
    return
  }
  try {
    const res: any = await sealPublicApi.options(token)
    Object.assign(options, res?.data ?? res ?? {})
  } catch (error: any) {
    linkError.value = error?.response?.data?.message || error?.message || '链接无效或已过期，请联系经办人重新生成。'
  }
}

async function submitForm() {
  await formRef.value?.validate()
  submitting.value = true
  try {
    form.sealMaterial = materialList.value.join(',')
    form.sealTypes = typeList.value.join(',')
    await sealPublicApi.submit(token, { ...form })
    submitted.value = true
    ElMessage.success('提交成功,我们会尽快联系您')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.message || error?.message || '提交失败,请稍后重试')
  } finally {
    submitting.value = false
  }
}

onMounted(loadOptions)
</script>

<style scoped>
.seal-public {
  min-height: 100vh;
  padding: 32px 16px;
  background: #f6f7fb;
}

.form-shell {
  max-width: 820px;
  margin: 0 auto;
}

.form-hero {
  padding: 28px;
  margin-bottom: 16px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(135deg, #b91c1c 0%, #ef7c7c 100%);
}

.eyebrow {
  display: inline-flex;
  padding: 3px 10px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}

.form-hero h1 {
  margin: 0 0 8px;
  font-size: 26px;
}

.form-hero p {
  margin: 0;
  color: rgba(255, 255, 255, 0.88);
}

.form-card {
  border-radius: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
}
</style>

<template>
  <div class="yk">
    <header class="yk-head">
      <div>
        <h2 class="yk-title">云客对接配置</h2>
        <p class="yk-sub">填入云客后台【设置 → 系统设置 → 接口申请配置】里的凭证,系统就能调云客拉数据(通话、微信、沟通统计等)。</p>
      </div>
    </header>

    <el-alert type="info" :closable="false" show-icon class="yk-alert">
      <template #title>凭证怎么填</template>
      <b>企业串码</b>=接口申请配置页的"企业串码";<b>管理员ID</b>=页面上的"管理员ID";<b>签名KEY</b>=点"查看"复制的那串。签名KEY 加密保管,本页只显示掩码 <code>********</code>;不改 KEY 时留着掩码即可。改完点<b>保存</b>,再点<b>测试连接</b>验证。
    </el-alert>

    <el-form :model="form" label-width="110px" class="yk-form" v-loading="loading">
      <el-form-item label="企业串码">
        <el-input v-model="form.company" placeholder="如 mdihf4" clearable />
      </el-form-item>
      <el-form-item label="管理员ID">
        <el-input v-model="form.partnerId" placeholder="p 开头的一串" clearable />
      </el-form-item>
      <el-form-item label="签名KEY">
        <el-input v-model="form.signKey" type="password" show-password placeholder="留空或掩码=不修改" clearable />
      </el-form-item>
      <el-form-item label="接口地址">
        <el-input v-model="form.baseUrl" placeholder="https://phone.yunkecn.com" clearable />
      </el-form-item>
      <el-form-item label="启用">
        <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" />
        <span class="yk-hint">关掉后系统不再调用云客</span>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
        <el-button :loading="testing" @click="test"><el-icon><Connection /></el-icon> 测试连接</el-button>
      </el-form-item>
    </el-form>

    <el-card v-if="testResult" class="yk-result" :class="testResult.success ? 'ok' : 'bad'" shadow="never">
      <div class="yk-result-head">
        <el-icon :size="18"><component :is="testResult.success ? SuccessFilled : CircleCloseFilled" /></el-icon>
        <span>{{ testResult.success ? '连接成功 —— 凭证、签名、IP 白名单都通了' : '连接失败' }}</span>
      </div>
      <p class="yk-result-msg">{{ testResult.message }}</p>
      <details v-if="testResult.raw" class="yk-raw">
        <summary>云客原始返回(调试用)</summary>
        <pre>{{ prettyRaw }}</pre>
      </details>
    </el-card>

    <div class="yk-tip">
      <b>安全提醒:</b>安全 IP 白名单里要有我们服务器 IP <code>47.243.27.11</code>(你已经配好了)。测试成功后,我就能把「员工微信」等页面接上真实数据。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Connection, SuccessFilled, CircleCloseFilled } from '@element-plus/icons-vue'
import { yunkeApi, type YunkeConfig } from '@/api/yunke'

const loading = ref(false)
const saving = ref(false)
const testing = ref(false)
const testResult = ref<any>(null)

const form = reactive<YunkeConfig>({ company: '', partnerId: '', signKey: '', baseUrl: 'https://phone.yunkecn.com', enabled: 1 })

const prettyRaw = computed(() => {
  try { return JSON.stringify(testResult.value?.raw, null, 2) } catch { return String(testResult.value?.raw ?? '') }
})

const load = async () => {
  loading.value = true
  try {
    const res: any = await yunkeApi.getConfig()
    const c = res?.data ?? res
    if (c) Object.assign(form, { company: c.company || '', partnerId: c.partnerId || '', signKey: c.signKey || '', baseUrl: c.baseUrl || 'https://phone.yunkecn.com', enabled: c.enabled ?? 1 })
  } catch { /* ignore */ } finally { loading.value = false }
}

const save = async () => {
  saving.value = true
  try {
    await yunkeApi.saveConfig({ ...form })
    ElMessage.success('已保存')
    load()
  } catch (e: any) {
    ElMessage.error('保存失败:' + (e?.message || ''))
  } finally { saving.value = false }
}

const test = async () => {
  testing.value = true
  testResult.value = null
  try {
    const res: any = await yunkeApi.test()
    testResult.value = res?.data ?? res
  } catch (e: any) {
    testResult.value = { success: false, message: e?.message || '请求失败' }
  } finally { testing.value = false }
}

onMounted(load)
</script>

<style scoped>
.yk { padding: 16px 18px; max-width: 760px; }
.yk-head { margin-bottom: 12px; }
.yk-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.yk-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.yk-alert { margin-bottom: 16px; }
.yk-alert :deep(.el-alert__description) { font-size: 12.5px; line-height: 1.7; }
.yk-alert code, .yk-tip code { font-family: var(--el-font-family-mono, monospace); background: var(--el-fill-color); padding: 1px 5px; border-radius: 4px; }
.yk-form { margin-top: 4px; }
.yk-hint { margin-left: 10px; font-size: 12px; color: var(--el-text-color-secondary); }
.yk-result { margin: 4px 0 16px; border-radius: 8px; }
.yk-result.ok { border: 1px solid var(--el-color-success-light-5); background: var(--el-color-success-light-9); }
.yk-result.bad { border: 1px solid var(--el-color-danger-light-5); background: var(--el-color-danger-light-9); }
.yk-result-head { display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 14px; }
.yk-result.ok .yk-result-head { color: var(--el-color-success); }
.yk-result.bad .yk-result-head { color: var(--el-color-danger); }
.yk-result-msg { margin: 8px 0 0; font-size: 13px; color: var(--el-text-color-regular); word-break: break-all; }
.yk-raw { margin-top: 10px; font-size: 12px; }
.yk-raw summary { cursor: pointer; color: var(--el-text-color-secondary); }
.yk-raw pre { margin: 8px 0 0; padding: 10px; background: var(--el-fill-color-light); border-radius: 8px; overflow-x: auto; font-size: 12px; max-height: 300px; }
.yk-tip { margin-top: 8px; padding: 12px 14px; background: var(--el-fill-color-light); border-radius: 8px; font-size: 12.5px; color: var(--el-text-color-secondary); line-height: 1.7; }
</style>

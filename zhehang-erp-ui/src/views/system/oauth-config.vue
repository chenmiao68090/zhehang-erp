<template>
  <div class="page-container oauth-page">
    <div class="page-header">
      <div class="header-title">
        <h2>{{ $t('oauth.title') }}</h2>
        <span class="subtitle">{{ $t('oauth.subtitle') }}</span>
      </div>
    </div>

    <el-card shadow="never" class="oauth-card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane v-for="p in providers" :key="p.value" :name="p.value">
          <template #label>
            <span class="tab-label">
              <span class="provider-dot" :style="{ background: p.color }"></span>
              {{ $t('oauth.providers.' + p.value) }}
              <el-tag v-if="p.enabled" type="success" size="small" effect="dark">{{ $t('oauth.statusEnabled') }}</el-tag>
            </span>
          </template>

          <div class="provider-pane">
            <div class="provider-banner" :style="{ background: p.gradient }">
              <div class="banner-icon"><el-icon :size="40"><Lightning /></el-icon></div>
              <div class="banner-text">
                <h3>{{ $t('oauth.providers.' + p.value) }} {{ $t('oauth.title') }}</h3>
                <p>{{ $t('oauth.providerDesc.' + p.value) }}</p>
              </div>
            </div>

            <el-form :model="form" label-width="140px" class="oauth-form">
              <el-form-item :label="$t('oauth.fields.appId')">
                <el-input v-model="form.appId" :placeholder="$t('oauth.placeholders.appId')" clearable />
              </el-form-item>
              <el-form-item :label="$t('oauth.fields.appSecret')">
                <el-input v-model="form.appSecret" :placeholder="$t('oauth.placeholders.appSecret')" type="password" show-password clearable />
                <div class="form-hint">{{ $t('oauth.encryptedHint') }}</div>
              </el-form-item>
              <el-form-item v-if="activeTab === 'wechat_work'" :label="$t('oauth.fields.agentId')">
                <el-input v-model="form.agentId" :placeholder="$t('oauth.placeholders.agentId')" clearable />
              </el-form-item>
              <el-form-item :label="$t('oauth.fields.redirectUri')">
                <el-input v-model="form.redirectUri" :placeholder="$t('oauth.placeholders.redirectUri')" clearable />
                <div class="form-hint">{{ $t('oauth.redirectHint') }}</div>
              </el-form-item>
              <el-form-item :label="$t('oauth.fields.enabled')">
                <el-switch v-model="form.enabled" :active-value="1" :inactive-value="0" :active-text="$t('oauth.statusEnabled')" :inactive-text="$t('oauth.statusDisabled')" inline-prompt />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSave" :loading="saving">{{ $t('common.save') }}</el-button>
                <el-button @click="handleTest" :loading="testing">{{ $t('oauth.testConnection') }}</el-button>
              </el-form-item>
            </el-form>

            <div class="callback-info">
              <h4>{{ $t('oauth.callbackInfo.title') }}</h4>
              <ol>
                <li>{{ $t('oauth.callbackInfo.step1') }}</li>
                <li>{{ $t('oauth.callbackInfo.step2') }}</li>
                <li>{{ $t('oauth.callbackInfo.step3') }}</li>
              </ol>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Lightning } from '@element-plus/icons-vue'
import { oauthApi, type OAuthConfig } from '@/api/oauth'

const { t } = useI18n()

const providers = ref([
  { value: 'wechat_work', color: '#07C160', gradient: 'linear-gradient(135deg, #07C160 0%, #0AA058 100%)', enabled: false },
  { value: 'dingtalk', color: '#1890FF', gradient: 'linear-gradient(135deg, #1890FF 0%, #096DD9 100%)', enabled: false },
  { value: 'feishu', color: '#3370FF', gradient: 'linear-gradient(135deg, #3370FF 0%, #1F4FD7 100%)', enabled: false }
])

const activeTab = ref('wechat_work')
const saving = ref(false)
const testing = ref(false)
const form = ref<OAuthConfig>({ provider: 'wechat_work', appId: '', appSecret: '', agentId: '', redirectUri: '', enabled: 0 })

async function loadConfigs() {
  try {
    const res: any = await oauthApi.configList()
    const list: OAuthConfig[] = res.data || []
    providers.value.forEach(p => {
      const cfg = list.find(c => c.provider === p.value)
      p.enabled = cfg ? cfg.enabled === 1 : false
    })
    await loadCurrent()
  } catch (e) { /* keep empty */ }
}

async function loadCurrent() {
  try {
    const res: any = await oauthApi.getConfig(activeTab.value)
    if (res.data) {
      form.value = { ...res.data, appSecret: '' }
    } else {
      form.value = { provider: activeTab.value, appId: '', appSecret: '', agentId: '', redirectUri: '', enabled: 0 }
    }
  } catch (e) {
    form.value = { provider: activeTab.value, appId: '', appSecret: '', agentId: '', redirectUri: '', enabled: 0 }
  }
}

function handleTabChange() {
  form.value.provider = activeTab.value
  loadCurrent()
}

async function handleSave() {
  if (!form.value.appId) {
    ElMessage.warning(t('oauth.placeholders.appId'))
    return
  }
  saving.value = true
  try {
    await oauthApi.saveConfig({ ...form.value, provider: activeTab.value })
    ElMessage.success(t('common.success'))
    await loadConfigs()
  } finally {
    saving.value = false
  }
}

async function handleTest() {
  testing.value = true
  try {
    const res: any = await oauthApi.testConnection(activeTab.value)
    if (res.data) {
      ElMessage.success(t('oauth.testSuccess'))
    } else {
      ElMessage.warning(t('oauth.testFailed'))
    }
  } finally {
    testing.value = false
  }
}

onMounted(() => { loadConfigs() })
</script>

<style lang="scss" scoped>
.oauth-page {
  .page-header {
    margin-bottom: 16px;
    .header-title h2 { font-size: 20px; font-weight: 600; color: #1e293b; margin: 0; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; display: block; }
  }
}
.oauth-card { border: none; border-radius: 12px; }
.tab-label { display: inline-flex; align-items: center; gap: 8px; }
.provider-dot { width: 8px; height: 8px; border-radius: 50%; }
.provider-pane { padding: 24px 0 8px; }
.provider-banner {
  display: flex; align-items: center; gap: 20px; padding: 24px 28px; border-radius: 12px;
  color: #fff; margin-bottom: 32px;
}
.banner-icon { width: 64px; height: 64px; border-radius: 16px; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; }
.banner-text h3 { font-size: 18px; margin: 0 0 6px; font-weight: 600; }
.banner-text p { margin: 0; font-size: 13px; opacity: 0.9; }
.oauth-form { max-width: 720px; }
.form-hint { font-size: 12px; color: #94a3b8; margin-top: 4px; }
.callback-info {
  margin-top: 32px; padding: 20px; background: #fef7f2; border-radius: 10px;
  border-left: 4px solid #F26522;
  h4 { margin: 0 0 12px; font-size: 14px; color: #1e293b; }
  ol { margin: 0; padding-left: 20px; font-size: 13px; color: #64748b; line-height: 2; }
}

html.dark {
  .page-header h2 { color: var(--el-text-color-primary); }
  .callback-info { background: #2a1a10; }
  .callback-info h4 { color: var(--el-text-color-primary); }
  .callback-info ol { color: var(--el-text-color-regular); }
}
</style>

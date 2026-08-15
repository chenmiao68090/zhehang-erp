<template>
  <div class="login-container">
    <!-- 左栏：品牌 + 公司价值观 -->
    <div class="login-left">
      <div class="bg-glow bg-glow--tr"></div>
      <div class="bg-glow bg-glow--bl"></div>
      <div class="bg-grid"></div>

      <div class="brand-content">
        <div class="brand-logo">
          <img class="brand-mark" src="/logo.svg" alt="浙杭集团" />
          <div class="brand-name">
            <span class="brand-name__cn">浙杭集团</span>
            <span class="brand-name__en">ZHEHANG&nbsp;GROUP</span>
          </div>
        </div>

        <div class="values-head">
          <div class="values-eyebrow">我 们 的 价 值 观</div>
          <h2 class="values-title">以信任为本&nbsp;&nbsp;与客户长期同行</h2>
        </div>

        <ul class="value-list">
          <li v-for="(v, i) in values" :key="v.no" class="value-item">
            <div class="value-index">
              <span class="value-no">{{ v.no }}</span>
              <span v-if="i < values.length - 1" class="value-line"></span>
            </div>
            <div class="value-body">
              <div class="value-title">{{ v.title }}</div>
              <div class="value-desc">{{ v.desc }}</div>
            </div>
          </li>
        </ul>

        <div class="brand-footer">财税代账 · 工商注册 · 企业渠道服务</div>
      </div>
    </div>

    <!-- 右栏：密码、首次改密和 MFA 均在签发令牌前完成 -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <div v-if="authStage !== 'LOGIN'" class="security-step">
          <el-button link type="primary" @click="returnToLogin">返回账号登录</el-button>
          <el-tag type="warning" effect="plain">账号安全验证</el-tag>
        </div>
        <h2 class="login-title">{{ stageTitle }}</h2>
        <p class="stage-description">{{ stageDescription }}</p>

        <el-form v-if="authStage === 'LOGIN'" ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="username">
            <label class="field-label">用户名</label>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <label class="field-label">密码</label>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item v-if="captchaRequired" prop="code">
            <label class="field-label">验证码</label>
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                placeholder="请输入验证码"
                prefix-icon="Key"
              />
              <div class="captcha-img" :class="{ placeholder: captchaEmpty }" @click="refreshCaptcha">
                <img v-if="captchaUrl" :src="captchaUrl" alt="图形验证码" @error="captchaEmpty = true" />
                <span v-if="!captchaUrl || captchaEmpty">{{ captchaLoading ? '加载中' : '点击刷新验证码' }}</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">记住我</el-checkbox>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              登 录
            </el-button>
          </el-form-item>
        </el-form>

        <el-form v-else-if="authStage === 'PASSWORD_CHANGE'" size="large" @submit.prevent>
          <el-alert
            title="该账号使用的是一次性初始口令，设置新密码前不会创建登录令牌。"
            type="warning"
            :closable="false"
            show-icon
          />
          <el-form-item label="新密码" class="security-form-item">
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              show-password
              autocomplete="new-password"
              placeholder="10-128 位，至少包含三类字符"
            />
          </el-form-item>
          <el-form-item label="确认新密码" class="security-form-item">
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              show-password
              autocomplete="new-password"
              placeholder="再次输入新密码"
              @keyup.enter="submitInitialPassword"
            />
          </el-form-item>
          <div class="password-hint">不能包含账号、空格、连续字符或常见弱口令。</div>
          <el-button type="primary" class="login-btn" :loading="loading" @click="submitInitialPassword">
            设置密码并重新登录
          </el-button>
        </el-form>

        <div v-else-if="authStage === 'MFA_ENROLL'" class="mfa-panel">
          <el-alert
            title="该角色必须启用双重验证。请用身份验证器扫描二维码，再输入 6 位动态验证码。"
            type="warning"
            :closable="false"
            show-icon
          />
          <div class="mfa-qr-wrap">
            <img v-if="mfaQrCode" :src="mfaQrCode" class="mfa-qr" alt="MFA 绑定二维码" />
            <el-skeleton v-else :rows="4" animated />
          </div>
          <div class="mfa-secret">
            <span>无法扫码时手动输入：</span>
            <code>{{ mfaSecret }}</code>
          </div>
          <el-input
            v-model="mfaCode"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="请输入 6 位动态验证码"
            @keyup.enter="confirmMfaEnrollment"
          />
          <el-button type="primary" class="login-btn mfa-submit" :loading="loading" @click="confirmMfaEnrollment">
            验证并启用 MFA
          </el-button>
        </div>

        <div v-else class="mfa-panel">
          <el-alert title="请输入身份验证器中的 6 位动态验证码。" type="info" :closable="false" show-icon />
          <el-input
            v-model="mfaCode"
            maxlength="6"
            inputmode="numeric"
            autocomplete="one-time-code"
            placeholder="6 位动态验证码"
            @keyup.enter="submitMfaVerification"
          />
          <el-button type="primary" class="login-btn mfa-submit" :loading="loading" @click="submitMfaVerification">
            验证并登录
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import QRCode from 'qrcode'
import {
  changeInitialPasswordApi,
  confirmMfaEnrollmentApi,
  getCaptchaApi,
  startMfaEnrollmentApi,
  verifyMfaApi,
  type AuthStepResult
} from '@/api/auth'

type AuthStage = 'LOGIN' | 'PASSWORD_CHANGE' | 'MFA_ENROLL' | 'MFA'

// 公司价值观（左栏展示）
const values = [
  { no: '01', title: '客户第一', desc: '我们坚持客户第一。客户的信任，是公司存在的根基。' },
  { no: '02', title: '员工成长', desc: '我们重视员工成长。员工的专业与责任，是服务客户的保障。' },
  { no: '03', title: '长期回报', desc: '我们追求长期回报。股东收益来自客户价值、员工奋斗和公司的稳健经营。' }
]

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const authStage = ref<AuthStage>('LOGIN')
const challengeId = ref('')
const challengedUsername = ref('')
const captchaUrl = ref('')
const captchaLoading = ref(false)
const captchaRequired = ref(import.meta.env.VITE_CAPTCHA_ENABLED === 'true')
const captchaEmpty = ref(false)
const mfaQrCode = ref('')
const mfaSecret = ref('')
const mfaCode = ref('')

const loginForm = reactive({
  username: '',
  password: '',
  code: '',
  uuid: ''
})

const passwordForm = reactive({ newPassword: '', confirmPassword: '' })

const stageTitle = computed(() => ({
  LOGIN: '欢迎登录',
  PASSWORD_CHANGE: '首次登录，请设置新密码',
  MFA_ENROLL: '启用双重验证',
  MFA: '双重验证'
}[authStage.value]))

const stageDescription = computed(() => ({
  LOGIN: '使用公司账号进入浙杭集团系统',
  PASSWORD_CHANGE: `正在保护账号 ${challengedUsername.value || ''}`,
  MFA_ENROLL: `正在保护账号 ${challengedUsername.value || ''}`,
  MFA: `正在验证账号 ${challengedUsername.value || ''}`
}[authStage.value]))

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function refreshCaptcha() {
  captchaLoading.value = true
  captchaEmpty.value = false
  try {
    const { data } = await getCaptchaApi()
    loginForm.uuid = data.uuid
    loginForm.code = ''
    captchaUrl.value = data.image
  } catch {
    loginForm.uuid = ''
    captchaUrl.value = ''
    captchaEmpty.value = true
    ElMessage.warning('验证码加载失败，请点击重试')
  } finally {
    captchaLoading.value = false
  }
}

function safeRedirect() {
  const redirect = String(route.query.redirect || '/')
  return redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '/'
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const result = await userStore.login({
        ...loginForm,
        username: loginForm.username.trim()
      })
      await processAuthResult(result)
    } catch (error: any) {
      ElMessage.error(error?.message || '登录失败，请检查账号密码或后端服务')
      if (Number(error?.code) === 428) {
        captchaRequired.value = true
      }
      if (captchaRequired.value) await refreshCaptcha()
    } finally {
      loading.value = false
    }
  })
}

async function processAuthResult(result: AuthStepResult) {
  challengeId.value = result.challengeId || ''
  challengedUsername.value = result.username || loginForm.username.trim()
  mfaCode.value = ''
  if (result.action === 'AUTHENTICATED') {
    await userStore.acceptAuthTokens(result)
    await router.replace(safeRedirect())
    ElMessage.success('登录成功')
    return
  }
  if (result.action === 'REQUIRE_PASSWORD_CHANGE') {
    authStage.value = 'PASSWORD_CHANGE'
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    return
  }
  if (result.action === 'REQUIRE_MFA_ENROLL') {
    authStage.value = 'MFA_ENROLL'
    await loadMfaEnrollment()
    return
  }
  if (result.action === 'REQUIRE_MFA') {
    authStage.value = 'MFA'
    return
  }
  returnToLogin()
  ElMessage.success(result.message || '账号安全设置已更新，请重新登录')
}

async function submitInitialPassword() {
  const password = passwordForm.newPassword
  if (password.length < 10 || password.length > 128) return ElMessage.warning('密码长度必须为 10 至 128 位')
  if (password !== passwordForm.confirmPassword) return ElMessage.warning('两次输入的新密码不一致')
  loading.value = true
  try {
    const { data } = await changeInitialPasswordApi({ challengeId: challengeId.value, newPassword: password })
    returnToLogin()
    ElMessage.success(data.message || '密码设置成功，请重新登录')
  } catch (error: any) {
    ElMessage.error(error?.message || '密码设置失败')
  } finally {
    loading.value = false
  }
}

async function loadMfaEnrollment() {
  loading.value = true
  try {
    const { data } = await startMfaEnrollmentApi(challengeId.value)
    mfaSecret.value = data.secret
    mfaQrCode.value = await QRCode.toDataURL(data.otpauthUri, { width: 220, margin: 1 })
  } catch (error: any) {
    ElMessage.error(error?.message || 'MFA 绑定信息加载失败')
    returnToLogin()
  } finally {
    loading.value = false
  }
}

async function confirmMfaEnrollment() {
  if (!/^\d{6}$/.test(mfaCode.value)) return ElMessage.warning('请输入 6 位动态验证码')
  loading.value = true
  try {
    const { data } = await confirmMfaEnrollmentApi({ challengeId: challengeId.value, code: mfaCode.value })
    returnToLogin()
    ElMessage.success(data.message || 'MFA 已启用，请重新登录')
  } catch (error: any) {
    ElMessage.error(error?.message || '动态验证码不正确')
  } finally {
    loading.value = false
  }
}

async function submitMfaVerification() {
  if (!/^\d{6}$/.test(mfaCode.value)) return ElMessage.warning('请输入 6 位动态验证码')
  loading.value = true
  try {
    const { data } = await verifyMfaApi({ challengeId: challengeId.value, code: mfaCode.value })
    await processAuthResult(data)
  } catch (error: any) {
    ElMessage.error(error?.message || '动态验证码不正确')
  } finally {
    loading.value = false
  }
}

function returnToLogin() {
  authStage.value = 'LOGIN'
  challengeId.value = ''
  challengedUsername.value = ''
  loginForm.password = ''
  loginForm.code = ''
  loginForm.uuid = ''
  mfaCode.value = ''
  mfaSecret.value = ''
  mfaQrCode.value = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  if (captchaRequired.value) refreshCaptcha()
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background-color: #eef1f6;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ===================== 左栏：品牌 + 价值观 ===================== */
.login-left {
  position: relative;
  flex: 1.1;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 56px;
  overflow: hidden;
  background: linear-gradient(150deg, #0b2a63 0%, #123a86 46%, #0a1f49 100%);
  color: #ffffff;
}

.bg-glow {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.bg-glow--tr {
  top: -120px;
  right: -90px;
  width: 320px;
  height: 320px;
  background: radial-gradient(circle, rgba(95, 143, 255, 0.30) 0%, rgba(95, 143, 255, 0) 70%);
}
.bg-glow--bl {
  bottom: -140px;
  left: -80px;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(51, 112, 255, 0.22) 0%, rgba(51, 112, 255, 0) 70%);
}
.bg-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 44px 44px;
}

.brand-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 460px;
  display: flex;
  flex-direction: column;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 64px;

  .brand-mark {
    width: 46px;
    height: 46px;
    display: block;
    border-radius: 11px;
    box-shadow: 0 8px 20px rgba(7, 22, 58, 0.45);
  }
  .brand-name {
    display: flex;
    flex-direction: column;
    line-height: 1.15;
  }
  .brand-name__cn {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #ffffff;
  }
  .brand-name__en {
    font-size: 12px;
    letter-spacing: 3px;
    color: rgba(197, 217, 255, 0.7);
    margin-top: 4px;
  }
}

.values-head {
  margin-bottom: 30px;

  .values-eyebrow {
    font-size: 13px;
    letter-spacing: 4px;
    color: rgba(160, 193, 255, 0.85);
    margin-bottom: 14px;
  }
  .values-title {
    font-size: 26px;
    font-weight: 700;
    line-height: 1.45;
    color: #ffffff;
    margin: 0;
  }
}

.value-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.value-item {
  display: flex;
  gap: 18px;
}
.value-index {
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.value-no {
  font-size: 15px;
  font-weight: 700;
  color: #9cc0ff;
  font-variant-numeric: tabular-nums;
}
.value-line {
  flex: 1;
  width: 2px;
  margin-top: 8px;
  border-radius: 2px;
  background: linear-gradient(180deg, rgba(120, 165, 255, 0.55), rgba(120, 165, 255, 0));
}
.value-body {
  padding-top: 1px;
}
.value-title {
  font-size: 17px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 5px;
}
.value-desc {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(206, 222, 252, 0.82);
}

.brand-footer {
  margin-top: 40px;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(170, 196, 245, 0.6);
}

/* ===================== 右栏：登录表单 ===================== */
.login-right {
  width: 480px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 48px;
}

.login-form-wrapper {
  width: 100%;
  max-width: 340px;

  .login-title {
    font-size: 26px;
    font-weight: 700;
    color: #1a2746;
    letter-spacing: 1px;
    margin: 0 0 8px;
  }
}

.stage-description {
  min-height: 22px;
  margin: 0 0 26px;
  color: #75829a;
  font-size: 14px;
}

.security-step {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.security-form-item {
  margin-top: 20px;
}

.password-hint {
  margin: -6px 0 20px;
  color: #75829a;
  font-size: 13px;
  line-height: 1.6;
}

.mfa-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.mfa-qr-wrap {
  width: 220px;
  height: 220px;
  align-self: center;
  padding: 8px;
  border: 1px solid #d7deeb;
  border-radius: 8px;
  background: #ffffff;
}

.mfa-qr {
  display: block;
  width: 100%;
  height: 100%;
}

.mfa-secret {
  padding: 10px 12px;
  border-radius: 6px;
  background: #f4f7fc;
  color: #5b6b88;
  font-size: 13px;
  overflow-wrap: anywhere;

  code {
    color: #1a2746;
    font-weight: 600;
  }
}

.mfa-submit {
  margin-top: 2px;
}

.field-label {
  flex: 0 0 100%;
  font-size: 13px;
  color: #5b6b88;
  margin-bottom: 8px;
}

/* Element Plus 输入框主题覆盖 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}
:deep(.el-form-item__content) {
  flex-wrap: wrap;
  line-height: normal;
}
:deep(.el-input__wrapper) {
  min-height: 46px;
  background: #f8fafd;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #d7deeb inset;
  padding: 0 14px;
  transition: box-shadow 0.2s ease, background 0.2s ease;
}
:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #b9c5db inset;
}
:deep(.el-input__wrapper.is-focus) {
  background: #ffffff;
  box-shadow: 0 0 0 1px #3370ff inset, 0 0 0 3px rgba(51, 112, 255, 0.12);
}
:deep(.el-input__inner) {
  color: #1a2746;
  font-size: 15px;
}
:deep(.el-input__inner::placeholder) {
  color: #97a3b8;
}
:deep(.el-input__prefix),
:deep(.el-input__suffix) {
  color: #8a98b3;
}

.captcha-row {
  width: 100%;
  display: flex;
  gap: 12px;

  .el-input {
    flex: 1;
  }
  .captcha-img {
    width: 120px;
    height: 46px;
    border-radius: 8px;
    border: 1px solid #d7deeb;
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f8fafd;
    font-size: 12px;
    color: #97a3b8;
    transition: border-color 0.3s, background-color 0.3s;

    &:hover {
      border-color: #3370ff;
      background-color: #f2f7ff;
    }
    &.placeholder {
      color: #3370ff;
      font-weight: 600;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    span {
      padding: 0 8px;
      text-align: center;
      line-height: 1.2;
    }
  }
}

.login-options {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: 2px 0 4px;
}
:deep(.el-checkbox__label) {
  color: #5b6b88;
  font-size: 13px;
}
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: #3370ff;
  border-color: #3370ff;
}
:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #5b6b88;
}

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #3370ff 0%, #1f54e6 100%);
  border: none;
  color: #ffffff;
  letter-spacing: 4px;
  box-shadow: 0 8px 20px rgba(51, 112, 255, 0.28);
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 26px rgba(51, 112, 255, 0.38);
  }
  &:active {
    transform: scale(0.98);
  }
}

/* ===================== 响应式：窄屏只留表单 ===================== */
@media (max-width: 860px) {
  .login-left {
    display: none;
  }
  .login-right {
    width: 100%;
    flex: 1;
  }
}
</style>

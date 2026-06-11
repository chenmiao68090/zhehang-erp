<template>
  <div class="login-container">
    <div class="login-left">
      <div class="brand-content">
        <div class="brand-logo">
          <div class="brand-mark">ZH</div>
          <h1>浙杭集团</h1>
        </div>
        <p class="brand-subtitle">{{ $t('login.subtitle') }}</p>
        <div class="brand-features">
          <div class="feature-item">
            <el-icon :size="20"><DataAnalysis /></el-icon>
            <span>财税客户全流程经营看板</span>
          </div>
          <div class="feature-item">
            <el-icon :size="20"><Connection /></el-icon>
            <span>挂靠地址与同行渠道管理</span>
          </div>
          <div class="feature-item">
            <el-icon :size="20"><Monitor /></el-icon>
            <span>网销线索与投产比追踪</span>
          </div>
        </div>
      </div>
    </div>
    <div class="login-right">
      <div class="login-form-wrapper">
        <h2 class="login-title">浙杭集团工作台</h2>
        <p class="login-desc">登录后进入客户、渠道、财务与交付协同工作台</p>
        <div v-if="isDev" class="dev-account">
          <div class="dev-account-copy">
            <span>开发预览账号</span>
            <strong>admin</strong>
            <em>/</em>
            <strong>admin123</strong>
          </div>
          <el-button link type="primary" @click="fillDemoAccount">填入</el-button>
        </div>
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" size="large">
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              :placeholder="$t('login.username')"
              prefix-icon="User"
            />
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              :placeholder="$t('login.password')"
              prefix-icon="Lock"
              show-password
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-form-item v-if="captchaEnabled" prop="code">
            <div class="captcha-row">
              <el-input
                v-model="loginForm.code"
                :placeholder="$t('login.captcha')"
                prefix-icon="Key"
              />
              <div class="captcha-img" :class="{ placeholder: captchaEmpty }" @click="refreshCaptcha">
                <img
                  v-if="captchaUrl"
                  :src="captchaUrl"
                  alt="captcha"
                  @load="handleCaptchaLoad"
                  @error="handleCaptchaError"
                />
                <span v-if="!captchaUrl || captchaEmpty">{{ captchaLoading ? '加载中' : '点击刷新验证码' }}</span>
              </div>
            </div>
          </el-form-item>
          <el-form-item>
            <div class="login-options">
              <el-checkbox v-model="rememberMe">{{ $t('login.rememberMe') }}</el-checkbox>
              <a href="javascript:;" class="forgot-link">{{ $t('login.forgotPassword') }}</a>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              class="login-btn"
              :loading="loading"
              @click="handleLogin"
            >
              {{ $t('login.login') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onBeforeUnmount, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { DataAnalysis, Connection, Monitor } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { setToken } from '@/utils/auth'

// Mock 模式下使用的固定 Token（与 router/guard.ts 保持一致）
const MOCK_TOKEN = 'mock_admin_token'
// 仅在显式开启 VITE_USE_MOCK=true 时启用 Mock 登录回退（开发环境默认走真实后端）
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'
const isDev = import.meta.env.DEV
const captchaEnabled = import.meta.env.VITE_CAPTCHA_ENABLED === 'true'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const rememberMe = ref(false)
const captchaUrl = ref('')
const captchaLoading = ref(false)
let captchaObjectUrl = ''

const loginForm = reactive({
  username: isDev ? 'admin' : '',
  password: isDev ? 'admin123' : '',
  code: ''
})

const captchaEmpty = ref(false)

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function refreshCaptcha() {
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  const captchaPath = apiBase ? `${apiBase}/auth/captcha` : '/api/auth/captcha'
  captchaLoading.value = true
  captchaEmpty.value = false
  try {
    const response = await fetch(`${captchaPath}?t=${Date.now()}`, {
      headers: { Accept: 'image/png,image/*;q=0.8' },
      cache: 'no-store'
    })
    if (!response.ok) {
      throw new Error(`captcha request failed: ${response.status}`)
    }
    const blob = await response.blob()
    if (!blob.size || !blob.type.startsWith('image/')) {
      throw new Error('captcha response is not an image')
    }
    if (captchaObjectUrl) {
      URL.revokeObjectURL(captchaObjectUrl)
    }
    captchaObjectUrl = URL.createObjectURL(blob)
    captchaUrl.value = captchaObjectUrl
  } catch (error) {
    console.error('[Login] 验证码加载失败', error)
    captchaUrl.value = ''
    captchaEmpty.value = true
    ElMessage.warning('验证码加载失败，请点击重试')
  } finally {
    captchaLoading.value = false
  }
}

function handleCaptchaLoad(event: Event) {
  const img = event.target as HTMLImageElement
  captchaEmpty.value = img.naturalWidth <= 1 && img.naturalHeight <= 1
}

function handleCaptchaError() {
  captchaEmpty.value = true
}

function fillDemoAccount() {
  loginForm.username = 'admin'
  loginForm.password = 'admin123'
  loginForm.code = ''
}

async function handleLogin() {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      // 调用真实后端登录接口
      await userStore.login({
        ...loginForm,
        username: loginForm.username.trim()
      })
      const redirect = (route.query.redirect as string) || '/'
      router.push(redirect)
      ElMessage.success('登录成功')
    } catch (error: any) {
      if (USE_MOCK) {
        // 仅当显式配置 VITE_USE_MOCK=true 时才走 Mock 回退（无后端的纯前端调试）
        console.warn('[Login] 后端登录失败，已按显式 Mock 开关回退 Mock 登录', error)
        setToken(MOCK_TOKEN)
        userStore.token = MOCK_TOKEN
        router.push((route.query.redirect as string) || '/')
        ElMessage.success('登录成功（Mock 模式）')
      } else {
        ElMessage.error(error?.message || '登录失败，请检查账号密码或后端服务')
      }
    } finally {
      loading.value = false
    }
  })
}

onMounted(() => {
  if (captchaEnabled) {
    refreshCaptcha()
  }
})

onBeforeUnmount(() => {
  if (captchaObjectUrl) {
    URL.revokeObjectURL(captchaObjectUrl)
  }
})
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  overflow: hidden;
  background-color: #0A0A0F;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #0A0A0F 0%, #12121A 50%, #0D0D14 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  position: relative;
  overflow: hidden;

  /* 金色光效背景 */
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 30% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
                radial-gradient(circle at 70% 80%, rgba(197, 165, 90, 0.05) 0%, transparent 40%);
    animation: float 20s ease-in-out infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 20%;
    right: 10%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(212, 175, 55, 0.06) 0%, transparent 70%);
    border-radius: 50%;
    filter: blur(40px);
  }
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  33% { transform: translate(10px, -10px) rotate(1deg); }
  66% { transform: translate(-5px, 5px) rotate(-1deg); }
}

.brand-content {
  color: var(--text-primary);
  max-width: 400px;
  position: relative;
  z-index: 1;

  .brand-logo {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;

    .brand-mark {
      width: 48px;
      height: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(212, 175, 55, 0.35);
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(255, 255, 255, 0.04));
      color: #D4AF37;
      font-family: 'JetBrains Mono', Consolas, monospace;
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0;
      filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.26));
    }

    h1 {
      font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
      font-size: 28px;
      font-weight: 700;
      color: #D4AF37;
      letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(212, 175, 55, 0.3);
    }
  }

  .brand-subtitle {
    font-size: 18px;
    color: var(--text-body);
    margin-bottom: 48px;
  }

  .brand-features {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    color: var(--text-body);
    transition: color 0.3s;

    .el-icon {
      color: #D4AF37;
      filter: drop-shadow(0 0 6px rgba(212, 175, 55, 0.4));
    }

    &:hover {
      color: var(--text-primary);
    }
  }
}

.login-right {
  width: 480px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #12121A 0%, #1A1A24 100%);
  padding: 48px;
  border-left: 1px solid rgba(212, 175, 55, 0.1);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
  }
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;

  .login-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
  }

  .login-desc {
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 16px;
  }

  .dev-account {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 40px;
    margin-bottom: 24px;
    padding: 0 12px;
    border: 1px solid rgba(212, 175, 55, 0.22);
    border-radius: 8px;
    background: rgba(212, 175, 55, 0.08);
    color: var(--text-muted);
    font-size: 12px;

    .dev-account-copy {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
    }

    strong {
      color: #D4AF37;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0;
    }

    em {
      color: rgba(255, 255, 255, 0.35);
      font-style: normal;
    }
  }
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
    height: 40px;
    border-radius: 8px;
    border: 1px solid rgba(212, 175, 55, 0.2);
    cursor: pointer;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-elevated);
    font-size: 12px;
    color: var(--text-muted);
    transition: border-color 0.3s, background-color 0.3s;

    &:hover {
      border-color: rgba(212, 175, 55, 0.4);
      background-color: rgba(212, 175, 55, 0.04);
    }

    &.placeholder {
      background-image: linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(255,255,255,0.02) 50%, rgba(212, 175, 55, 0.08) 100%);
      color: #D4AF37;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      background-color: transparent;
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
  justify-content: space-between;
  align-items: center;

  .forgot-link {
    font-size: 13px;
    color: #D4AF37;
    transition: opacity 0.3s;

    &:hover {
      opacity: 0.8;
      text-decoration: underline;
    }
  }
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  background: linear-gradient(135deg, #D4AF37 0%, #C5A55A 100%);
  border: none;
  color: #0A0A0F;
  letter-spacing: 1px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 24px rgba(212, 175, 55, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>

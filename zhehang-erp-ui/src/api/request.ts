import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getApiBaseUrl } from '@/api/base-url'
import {
  advanceAuthLifecycleVersion,
  clearLegacyRefreshToken,
  getCurrentAuthentication,
  getAuthLifecycleVersion,
  getRefreshToken,
  getToken,
  removeToken,
  setToken
} from '@/utils/auth'
import {
  clearImpersonationSession,
  markImpersonationRestorePending,
  readImpersonationSession,
  sanitizeReturnUrl,
  type AuthenticationMode
} from '@/utils/impersonation-session'

type RequestConfig = AxiosRequestConfig & {
  /** 页面有本地兜底/Mock 降级时,不由全局拦截器弹错误提示 */
  silentError?: boolean
  /** 公开访客页请求失败时不跳后台登录页,由页面自己提示 */
  skipAuthRedirect?: boolean
  /** 刷新 token 的请求自身:401 时不再递归刷新(防死循环) */
  _skipRefresh?: boolean
  /** 已用新 token 重试过一次:再 401 则直接登出(防无限重试) */
  _retried?: boolean
  /** 请求发出时的access代际，用于阻止迟到401清掉更新后的登录态 */
  _authAccessFingerprint?: string | null
  /** 请求发出时的本地认证生命周期，用于阻止账号切换后的跨账号重放 */
  _authLifecycleVersion?: number
  /** 请求发出时使用的是普通管理员会话还是当前标签页的员工视角会话。 */
  _authMode?: AuthenticationMode
  /** 代登录会话标识，用于阻止切换后的迟到响应影响新身份。 */
  _impersonationSessionId?: string | null
}

export type ApiError = Error & {
  code?: number
  data?: unknown
}

function apiError(message: string, code?: number, data?: unknown): ApiError {
  return Object.assign(new Error(message), { code, data })
}

const service: AxiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const requestConfig = config as RequestConfig
    const authentication = getCurrentAuthentication()
    const token = authentication.token
    requestConfig._authMode = authentication.mode
    requestConfig._impersonationSessionId = authentication.session?.sessionId || null
    requestConfig._authAccessFingerprint = accessTokenFingerprint(token)
    requestConfig._authLifecycleVersion = getAuthLifecycleVersion()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    if (authentication.mode === 'impersonation' && authentication.session?.tabId) {
      config.headers['X-Impersonation-Tab-Id'] = authentication.session.tabId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// ===== 401 无感刷新:用 refreshToken 换新 token 后重放原请求,替代"任何 401 都整页跳登录" =====
let isRefreshing = false
const REFRESH_SUPERSEDED = Symbol('refresh-superseded')
type RefreshResult = string | null | typeof REFRESH_SUPERSEDED
let refreshWaiters: Array<(result: RefreshResult) => void> = []

function tokenClaims(token: string): Record<string, any> | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(window.atob(padded))
  } catch {
    return null
  }
}

function accessTokenFingerprint(token: string): string | null {
  const claims = tokenClaims(token)
  if (!claims || claims.userId == null || !claims.uuid) return null
  return [claims.userId, claims.uuid, claims.jti ?? '', claims.iat ?? '', claims.exp ?? ''].map(String).join(':')
}

async function requestNewToken(expectedLifecycleVersion?: number): Promise<RefreshResult> {
  const lockManager = (navigator as any).locks
  if (lockManager?.request) {
    try {
      return await lockManager.request('zhehang-auth-refresh', () => performTokenRefresh(expectedLifecycleVersion))
    } catch {
      return REFRESH_SUPERSEDED
    }
  }
  return performTokenRefresh(expectedLifecycleVersion)
}

async function performTokenRefresh(expectedLifecycleVersion?: number): Promise<RefreshResult> {
  const legacyRefreshToken = getRefreshToken()
  const lifecycleVersion = expectedLifecycleVersion ?? getAuthLifecycleVersion()
  if (getAuthLifecycleVersion() !== lifecycleVersion) {
    return REFRESH_SUPERSEDED
  }
  try {
    // 刷新请求带 _skipRefresh 标记:它自己若 401 也不再触发刷新(防死循环)
    const resp: any = await service.post(
      '/auth/refresh',
      legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {},
      { _skipRefresh: true, silentError: true, skipAuthRedirect: true } as RequestConfig
    )
    const data = resp?.data ?? resp
    const newAccess = data?.accessToken || data?.token
    if (newAccess) {
      if (getAuthLifecycleVersion() !== lifecycleVersion) return REFRESH_SUPERSEDED
      setToken(newAccess)
      clearLegacyRefreshToken()
      return newAccess
    }
  } catch {
    /* 刷新失败,交由调用方登出 */
  }
  return getAuthLifecycleVersion() === lifecycleVersion ? null : REFRESH_SUPERSEDED
}

/** Restores a page reload from the HttpOnly refresh cookie without exposing it to JavaScript. */
export async function restoreAccessToken(): Promise<string | null> {
  const result = await requestNewToken(getAuthLifecycleVersion())
  return typeof result === 'string' ? result : null
}

async function performCookieOnlyTokenRefresh(lifecycleVersion: number): Promise<string | null> {
  if (getAuthLifecycleVersion() !== lifecycleVersion) return null
  try {
    const resp: any = await service.post(
      '/auth/refresh',
      {},
      { _skipRefresh: true, silentError: true, skipAuthRedirect: true } as RequestConfig
    )
    const data = resp?.data ?? resp
    const newAccess = data?.accessToken || data?.token
    if (newAccess && getAuthLifecycleVersion() === lifecycleVersion) {
      setToken(newAccess)
      clearLegacyRefreshToken()
      return newAccess
    }
  } catch {
    // The caller converts failures into a page-version message without exposing Cookie details.
  }
  return null
}

/**
 * V214 login compatibility path. The request body is deliberately empty and never reads the
 * one-time legacy refresh storage used by the general V210 migration path above. It shares the
 * same cross-tab Web Lock as normal refresh so the single-consumption Cookie cannot race itself.
 */
export async function restoreAccessTokenFromHttpOnlyCookie(): Promise<string | null> {
  const lifecycleVersion = getAuthLifecycleVersion()
  const lockManager = (navigator as any).locks
  if (lockManager?.request) {
    try {
      return await lockManager.request(
        'zhehang-auth-refresh',
        () => performCookieOnlyTokenRefresh(lifecycleVersion)
      )
    } catch {
      return null
    }
  }
  return performCookieOnlyTokenRefresh(lifecycleVersion)
}

function redirectToLogin() {
  removeToken()
  // 已在登录页时不再跳转,避免「401→整页跳转→再请求→再 401」的重载死循环(白屏)
  if (window.location.pathname !== '/login') {
    window.location.href = '/login'
  }
}

let impersonationRestoreScheduled = false

function restoreAdministratorView(message = '员工视角已到期，已恢复超级管理员身份') {
  if (impersonationRestoreScheduled) return
  impersonationRestoreScheduled = true
  const returnUrl = readImpersonationSession()?.returnUrl || '/'
  // 标记恢复中后才清 sessionStorage；卸载前所有迟到请求都保持 fail-closed，绝不回退管理员令牌。
  markImpersonationRestorePending()
  clearImpersonationSession()
  advanceAuthLifecycleVersion()
  ElMessage.warning(message)
  if (typeof window !== 'undefined') window.location.replace(sanitizeReturnUrl(returnUrl))
}

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.config.responseType === 'blob') {
      return response.data
    }

    const { code, message, data } = response.data

    if (code === 200 || code === 0) {
      // 分页响应形状对齐:后端 MyBatis-Plus IPage 返回 { records, total, ... },
      // 而前端多处按 { list, total } 解析。此处统一补一个 list 别名(保留 records 不破坏原用法)。
      if (data && typeof data === 'object' && Array.isArray((data as any).records) && (data as any).list === undefined) {
        (data as any).list = (data as any).records
      }
      return response.data
    }

    // Token 过期
    if (code === 401) {
      const config = response.config as RequestConfig
      if (config._authMode === 'impersonation') {
        restoreAdministratorView(message || '员工视角已到期，已恢复超级管理员身份')
        return Promise.reject(apiError(message || '员工视角已到期', code, data))
      }
      if (config._skipRefresh) {
        return Promise.reject(apiError(message || '刷新令牌无效', code, data))
      }
      if (config.skipAuthRedirect) {
        if (!config.silentError) {
          ElMessage.error(message || '未授权')
        }
        return Promise.reject(apiError(message || '未授权', code, data))
      }
      ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeToken()
        window.location.href = '/login'
      })
      return Promise.reject(apiError(message || '未授权', code, data))
    }

    if (!(response.config as RequestConfig).silentError) {
      ElMessage.error(message || '请求失败')
    }
    return Promise.reject(apiError(message || '请求失败', code, data))
  },
  (error) => {
    const { response } = error
    const silentError = !!(error.config as RequestConfig | undefined)?.silentError
    const skipAuthRedirect = !!(error.config as RequestConfig | undefined)?.skipAuthRedirect
    if (response) {
      switch (response.status) {
        case 401: {
          const cfg = (error.config || {}) as RequestConfig
          if (cfg._authMode === 'impersonation') {
            restoreAdministratorView(response.data?.message || '员工视角已到期，已恢复超级管理员身份')
            return Promise.reject(error)
          }
          if (skipAuthRedirect) {
            if (!silentError) ElMessage.error(response.data?.message || '未授权')
            break
          }
          // 刷新请求自身交回外层单飞协调器判断，避免多标签页输家清掉赢家的新令牌。
          if (cfg._skipRefresh) {
            return Promise.reject(error)
          }
          // 已用新 token 重试过仍 401 → 直接登出，防无限重试。
          if (cfg._retried) {
            const sameAuthGeneration = cfg._authAccessFingerprint === accessTokenFingerprint(getToken())
              && cfg._authLifecycleVersion === getAuthLifecycleVersion()
            if (!sameAuthGeneration) {
              return Promise.reject(error)
            }
            redirectToLogin()
            break
          }
          cfg._retried = true
          // 尝试无感刷新:成功则重放原请求,失败才跳登录
          return (async () => {
            let newToken: RefreshResult
            if (isRefreshing) {
              newToken = await new Promise<RefreshResult>((resolve) => refreshWaiters.push(resolve))
            } else {
              isRefreshing = true
              try {
                newToken = await requestNewToken(cfg._authLifecycleVersion)
              } finally {
                isRefreshing = false
              }
              refreshWaiters.forEach((cb) => cb(newToken))
              refreshWaiters = []
            }
            if (newToken) {
              if (newToken === REFRESH_SUPERSEDED) {
                return Promise.reject(error)
              }
              return service(cfg) // 请求拦截器会自动带上刚存的新 token
            }
            redirectToLogin()
            return Promise.reject(error)
          })()
        }
        case 403:
          if (!silentError) {
            const message = response.data?.message
            ElMessage.error(message || ((error.config as RequestConfig | undefined)?._authMode === 'impersonation'
              ? '员工视角为查看模式，禁止执行该操作'
              : '没有权限访问'))
          }
          break
        case 404:
          if (!silentError) ElMessage.error('请求的资源不存在')
          break
        case 500:
          if (!silentError) ElMessage.error('服务器内部错误')
          break
        default:
          if (!silentError) ElMessage.error(response.data?.message || '请求失败')
      }
    } else {
      if (!silentError) ElMessage.error('网络连接异常，请稍后重试')
    }
    if (response?.data && typeof response.data === 'object') {
      error.code = response.data.code ?? response.status
      error.data = response.data.data
      if (response.data.message) error.message = response.data.message
    }
    return Promise.reject(error)
  }
)

export default service

export function get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<T> {
  return service.get(url, { params, ...config })
}

export function post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return service.post(url, data, config)
}

export function put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
  return service.put(url, data, config)
}

export function del<T = any>(url: string, config?: RequestConfig): Promise<T> {
  return service.delete(url, config)
}

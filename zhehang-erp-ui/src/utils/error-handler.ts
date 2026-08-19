import { ElNotification } from 'element-plus'
import type { App } from 'vue'
import { getApiBaseUrl } from '@/api/base-url'
import { useUserStore } from '@/stores/user'

const ERROR_LOG_KEY = 'app_error_log'
const MAX_LOG_SIZE = 50
const REPORT_PATH = '/frontend-error'
/** 每分钟最多上报条数，与后端 IP 限流(60/min)对齐，避免死循环刷爆日志 */
const MAX_REPORTS_PER_WINDOW = 20
const REPORT_WINDOW_MS = 60_000

interface ErrorLog {
  time: string
  type: string
  message: string
  stack?: string
}

function saveErrorLog(log: ErrorLog) {
  try {
    const logs: ErrorLog[] = JSON.parse(localStorage.getItem(ERROR_LOG_KEY) || '[]')
    logs.unshift(log)
    if (logs.length > MAX_LOG_SIZE) logs.length = MAX_LOG_SIZE
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(logs))
  } catch { /* ignore storage errors */ }
}

// 上报请求在飞时不再发新请求，防止上报自身报错引发递归风暴
let reporting = false
let windowStart = 0
let windowCount = 0

function allowReport(): boolean {
  if (reporting) return false
  const now = Date.now()
  if (now - windowStart > REPORT_WINDOW_MS) {
    windowStart = now
    windowCount = 0
  }
  if (windowCount >= MAX_REPORTS_PER_WINDOW) return false
  windowCount += 1
  return true
}

function currentUserId(): number | string | null {
  try {
    const userInfo = useUserStore().userInfo
    return userInfo?.id ?? userInfo?.userId ?? null
  } catch {
    // Pinia 尚未就绪或 store 异常时，userId 缺失不应阻断上报
    return null
  }
}

function reportError(log: ErrorLog) {
  if (!allowReport()) return
  reporting = true
  const done = () => { reporting = false }
  try {
    fetch(`${getApiBaseUrl()}${REPORT_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: log.type,
        message: log.message,
        stack: log.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: currentUserId(),
        timestamp: log.time
      })
    }).then(done, done)
  } catch {
    // 上报失败静默忽略：绝不能再抛错，否则会回到错误处理器形成循环
    done()
  }
}

function handle(log: ErrorLog) {
  saveErrorLog(log)
  reportError(log)
}

export function setupErrorHandler(app: App) {
  // Vue组件错误处理
  app.config.errorHandler = (err: unknown, _instance: unknown, info: string) => {
    const error = err as { message?: string; stack?: string } | null
    const message = error?.message || String(err)
    handle({ time: new Date().toISOString(), type: 'vue', message, stack: error?.stack })

    if (import.meta.env.DEV) {
      console.error('[Vue Error]', err, info)
    } else {
      ElNotification({ title: '系统异常', message: '操作失败，请刷新页面重试', type: 'error', duration: 5000 })
    }
  }

  // 全局JS错误
  window.onerror = (message, _source, _line, _col, error) => {
    handle({ time: new Date().toISOString(), type: 'global', message: String(message), stack: error?.stack })
    return true // 阻止默认行为
  }

  // 未处理的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string; stack?: string } | null
    const message = reason?.message || String(event.reason)
    handle({ time: new Date().toISOString(), type: 'promise', message, stack: reason?.stack })

    if (import.meta.env.PROD) {
      ElNotification({ title: '请求异常', message: '操作未完成，请重试', type: 'warning', duration: 4000 })
    }
    event.preventDefault()
  })
}

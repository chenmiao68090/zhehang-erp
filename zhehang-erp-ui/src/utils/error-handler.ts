import { ElNotification } from 'element-plus'
import type { App } from 'vue'

const ERROR_LOG_KEY = 'app_error_log'
const MAX_LOG_SIZE = 50

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

export function setupErrorHandler(app: App) {
  // Vue组件错误处理
  app.config.errorHandler = (err: unknown, _instance: unknown, info: string) => {
    const error = err as { message?: string; stack?: string } | null
    const message = error?.message || String(err)
    saveErrorLog({ time: new Date().toISOString(), type: 'vue', message, stack: error?.stack })

    if (import.meta.env.DEV) {
      console.error('[Vue Error]', err, info)
    } else {
      ElNotification({ title: '系统异常', message: '操作失败，请刷新页面重试', type: 'error', duration: 5000 })
    }
  }

  // 全局JS错误
  window.onerror = (message, _source, _line, _col, error) => {
    saveErrorLog({ time: new Date().toISOString(), type: 'global', message: String(message), stack: error?.stack })
    return true // 阻止默认行为
  }

  // 未处理的 Promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason as { message?: string; stack?: string } | null
    const message = reason?.message || String(event.reason)
    saveErrorLog({ time: new Date().toISOString(), type: 'promise', message, stack: reason?.stack })

    if (import.meta.env.PROD) {
      ElNotification({ title: '请求异常', message: '操作未完成，请重试', type: 'warning', duration: 4000 })
    }
    event.preventDefault()
  })
}

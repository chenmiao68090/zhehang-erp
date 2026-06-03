import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'

type RequestConfig = AxiosRequestConfig & {
  /** 页面有本地兜底/Mock 降级时,不由全局拦截器弹错误提示 */
  silentError?: boolean
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

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
      ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeToken()
        window.location.href = '/login'
      })
      return Promise.reject(new Error(message || '未授权'))
    }

    if (!(response.config as RequestConfig).silentError) {
      ElMessage.error(message || '请求失败')
    }
    return Promise.reject(new Error(message || '请求失败'))
  },
  (error) => {
    const { response } = error
    const silentError = !!(error.config as RequestConfig | undefined)?.silentError
    if (response) {
      switch (response.status) {
        case 401:
          removeToken()
          window.location.href = '/login'
          break
        case 403:
          if (!silentError) ElMessage.error('没有权限访问')
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

import { ref, onBeforeUnmount } from 'vue'
import { useIntervalFn } from '@vueuse/core'
import type {
  RefreshConfig,
  RefreshStrategy,
} from '@/views/dashboard/types/dashboard'

export type RefreshCallback = () => void | Promise<void>

// 默认间隔（秒）
const DEFAULT_INTERVALS: Record<RefreshStrategy, number> = {
  realtime: 5, // WebSocket 暂用5秒轮询模拟
  'near-realtime': 5 * 60,
  scheduled: 60,
  manual: 0,
}

/**
 * 自动刷新 composable
 * 支持 realtime / near-realtime / scheduled / manual 四种策略
 */
export function useAutoRefresh(config?: RefreshConfig) {
  const strategy = ref<RefreshStrategy>(config?.strategy ?? 'manual')
  const intervalSeconds = ref<number>(
    config?.interval ?? DEFAULT_INTERVALS[config?.strategy ?? 'manual']
  )

  const isRefreshing = ref(false)
  const lastRefreshTime = ref<number | null>(null)
  const refreshCount = ref(0)

  const callbacks = new Set<RefreshCallback>()

  /**
   * 内部触发回调
   */
  async function triggerCallbacks(): Promise<void> {
    if (isRefreshing.value) return
    isRefreshing.value = true
    try {
      const tasks = Array.from(callbacks).map((cb) => {
        try {
          return Promise.resolve(cb())
        } catch (e) {
          return Promise.reject(e)
        }
      })
      await Promise.allSettled(tasks)
      lastRefreshTime.value = Date.now()
      refreshCount.value += 1
    } finally {
      isRefreshing.value = false
    }
  }

  // 使用 @vueuse/core 的 useIntervalFn
  const intervalFn = useIntervalFn(
    triggerCallbacks,
    () => Math.max(1000, intervalSeconds.value * 1000),
    { immediate: false, immediateCallback: false }
  )

  /**
   * 启动定时刷新
   */
  function start(): void {
    if (strategy.value === 'manual') return
    if (intervalSeconds.value <= 0) return
    intervalFn.resume()
  }

  /**
   * 停止定时刷新
   */
  function stop(): void {
    intervalFn.pause()
  }

  /**
   * 手动触发刷新
   */
  async function refresh(): Promise<void> {
    await triggerCallbacks()
  }

  /**
   * 动态调整间隔（秒）
   */
  function setInterval(seconds: number): void {
    intervalSeconds.value = Math.max(0, seconds)
    if (intervalFn.isActive.value) {
      intervalFn.pause()
      if (intervalSeconds.value > 0) {
        intervalFn.resume()
      }
    }
  }

  /**
   * 切换刷新策略
   */
  function setStrategy(next: RefreshStrategy, customInterval?: number): void {
    strategy.value = next
    intervalSeconds.value = customInterval ?? DEFAULT_INTERVALS[next]
    if (next === 'manual') {
      stop()
    }
  }

  /**
   * 注册刷新回调
   * 返回取消注册的函数
   */
  function onRefresh(callback: RefreshCallback): () => void {
    callbacks.add(callback)
    return () => {
      callbacks.delete(callback)
    }
  }

  // 自动清理
  onBeforeUnmount(() => {
    stop()
    callbacks.clear()
  })

  return {
    strategy,
    intervalSeconds,
    isRefreshing,
    lastRefreshTime,
    refreshCount,
    start,
    stop,
    refresh,
    setInterval,
    setStrategy,
    onRefresh,
  }
}

export type UseAutoRefreshReturn = ReturnType<typeof useAutoRefresh>

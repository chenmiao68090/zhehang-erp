import { ref, shallowRef } from 'vue'
import {
  getDataSources,
  getDataSourceFields,
  queryData as apiQueryData,
} from '@/api/dashboard'
import type {
  DataSource,
  DataField,
  DataQueryRequest,
  DataQueryResponse,
} from '@/views/dashboard/types/dashboard'

interface CacheEntry {
  data: DataQueryResponse
  expireAt: number
}

// 缓存有效期：5分钟
const CACHE_TTL = 5 * 60 * 1000

/**
 * 数据源管理 composable
 * - 数据源/字段查询
 * - 5分钟内存缓存
 */
export function useDataSource() {
  const dataSources = ref<DataSource[]>([])
  const currentSource = shallowRef<DataSource | null>(null)
  const fields = ref<DataField[]>([])
  const loading = ref(false)

  // 缓存：key = JSON.stringify(request)
  const queryCache = new Map<string, CacheEntry>()

  /**
   * 拉取数据源列表
   */
  async function fetchDataSources(): Promise<DataSource[]> {
    loading.value = true
    try {
      const res = await getDataSources()
      const list = (res?.data as unknown as DataSource[]) || []
      dataSources.value = list
      return list
    } finally {
      loading.value = false
    }
  }

  /**
   * 拉取指定数据源的字段
   */
  async function fetchFields(sourceId: string): Promise<DataField[]> {
    if (!sourceId) {
      fields.value = []
      return []
    }
    loading.value = true
    try {
      const res = await getDataSourceFields(sourceId)
      const list = (res?.data as unknown as DataField[]) || []
      fields.value = list
      const matched = dataSources.value.find((it) => it.id === sourceId) || null
      currentSource.value = matched
      return list
    } finally {
      loading.value = false
    }
  }

  /**
   * 执行数据查询（带5分钟缓存）
   */
  async function queryData(request: DataQueryRequest): Promise<DataQueryResponse> {
    const key = JSON.stringify(request)
    const now = Date.now()
    const cached = queryCache.get(key)
    if (cached && cached.expireAt > now) {
      return { ...cached.data, cached: true }
    }

    loading.value = true
    try {
      const res = await apiQueryData(request)
      const data = (res?.data as unknown as DataQueryResponse) || {
        columns: [],
        rows: [],
        total: 0,
        cached: false,
        queryTime: 0,
      }
      queryCache.set(key, {
        data,
        expireAt: now + CACHE_TTL,
      })
      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * 清空查询缓存
   */
  function clearCache(): void {
    queryCache.clear()
  }

  return {
    dataSources,
    currentSource,
    fields,
    loading,
    fetchDataSources,
    fetchFields,
    queryData,
    clearCache,
  }
}

export type UseDataSourceReturn = ReturnType<typeof useDataSource>

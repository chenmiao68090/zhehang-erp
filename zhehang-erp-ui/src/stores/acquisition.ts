import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { enterpriseApi, segmentApi, filterTemplateApi } from '@/api/acquisition'

// 客群配置 - 每个客群对应的Tab和筛选器
export const SEGMENT_CONFIG: Record<string, {
  tabs: { key: string; label: string }[]
  filters: string[] // 可用的筛选维度
}> = {
  'tax-abnormal': {
    tabs: [
      { key: 'all', label: '全部税务异常' },
      { key: 'taxAbnormalHousehold', label: '税务非正常户' },
      { key: 'taxArrears', label: '欠税公告' },
      { key: 'majorViolation', label: '重大税收违法' },
      { key: 'taxPenalty', label: '税务行政处罚' }
    ],
    filters: ['occurDate', 'companyType', 'taxQualification', 'establishTime']
  },
  'operation-abnormal': {
    tabs: [
      { key: 'all', label: '全部经营异常' },
      { key: 'addressAbnormal', label: '地址异常' },
      { key: 'annualReportMissing', label: '未年报' },
      { key: 'fraudInfo', label: '虚假信息' }
    ],
    filters: ['occurDate', 'companyType', 'establishTime']
  },
  'bookkeeping': {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'recent7Days', label: '近7天新增' },
      { key: 'recent30Days', label: '近30天新增' }
    ],
    filters: ['companyType', 'establishTime']
  },
  'annual-report': {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'notReported', label: '未年报' },
      { key: 'overdue', label: '已逾期' }
    ],
    filters: ['companyType', 'establishTime']
  },
  'peer-quality': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType', 'taxQualification', 'establishTime']
  },
  'peer-new': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType', 'establishTime']
  },
  'peer-customer': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType', 'taxQualification', 'establishTime']
  },
  'ecommerce': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType', 'taxQualification', 'establishTime']
  },
  'new-biz-t1': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType']
  },
  'new-biz-t7': {
    tabs: [{ key: 'all', label: '全部' }],
    filters: ['companyType', 'establishTime']
  }
}

// 筛选维度选项配置
export const FILTER_OPTIONS: Record<string, { key: string; label: string }[]> = {
  occurDate: [
    { key: 'all', label: '全部' },
    { key: 'recent1Month', label: '近1个月' },
    { key: 'recent3Months', label: '近3个月' },
    { key: 'recent6Months', label: '近半年' },
    { key: 'recent1Year', label: '近1年' },
    { key: 'custom', label: '自定义' }
  ],
  companyType: [
    { key: 'individual', label: '个体户' },
    { key: 'enterprise', label: '企业' }
  ],
  taxQualification: [
    { key: 'all', label: '全部' },
    { key: 'general', label: '一般纳税人' },
    { key: 'smallScale', label: '小规模纳税人' },
    { key: 'suspectedSmallScale', label: '疑似小规模纳税人' },
    { key: 'other', label: '其他' }
  ],
  establishTime: [
    { key: 'all', label: '全部' },
    { key: 'recent1Year', label: '近1年' },
    { key: 'recent3Years', label: '近3年' },
    { key: 'recent5Years', label: '近5年' },
    { key: 'recent10Years', label: '近10年' },
    { key: 'custom', label: '自定义' }
  ]
}

export const useAcquisitionStore = defineStore('acquisition', () => {
  // 筛选条件
  const filters = ref<Record<string, any>>({})
  // 当前客群编码
  const segmentCode = ref<string>('')
  // 当前统计Tab
  const activeTab = ref<string>('all')
  // 排序方式
  const sortBy = ref<string>('comprehensive')
  // 已选企业ID列表
  const selectedIds = ref<number[]>([])
  // 解锁额度余额
  const creditBalance = ref<number>(1000)
  // 筛选方案列表
  const filterTemplates = ref<any[]>([])
  // 企业列表数据
  const enterpriseList = ref<any[]>([])
  // 总数
  const total = ref<number>(0)
  // 加载状态
  const loading = ref<boolean>(false)
  // 统计数据
  const stats = ref<Record<string, number>>({})
  // 客群列表
  const segments = ref<any[]>([])
  // 分页
  const pagination = ref({ page: 1, pageSize: 20 })

  // 计算属性
  const hasFilters = computed(() => Object.keys(filters.value).length > 0)
  const selectedCount = computed(() => selectedIds.value.length)

  // 加载企业列表
  async function loadEnterpriseList() {
    loading.value = true
    try {
      const params = {
        page: pagination.value.page,
        pageSize: pagination.value.pageSize,
        sortBy: sortBy.value,
        segmentCode: segmentCode.value,
        tabCode: activeTab.value,
        ...filters.value
      }
      const res: any = await enterpriseApi.list(params)
      if (res.code === 200) {
        enterpriseList.value = res.data?.list || res.data?.records || []
        total.value = res.data?.total || 0
      }
    } finally {
      loading.value = false
    }
  }

  // 加载统计数据
  async function loadStats() {
    try {
      const params = { segmentCode: segmentCode.value, ...filters.value }
      const res: any = await enterpriseApi.stats(params)
      if (res.code === 200) {
        stats.value = res.data || {}
      }
    } catch (e) {
      console.error('Load stats failed:', e)
    }
  }

  // 加载客群列表
  async function loadSegments() {
    try {
      const res: any = await segmentApi.list()
      if (res.code === 200) {
        segments.value = res.data || []
      }
    } catch (e) {
      console.error('Load segments failed:', e)
    }
  }

  // 加载筛选方案
  async function loadFilterTemplates() {
    try {
      const res: any = await filterTemplateApi.list()
      if (res.code === 200) {
        filterTemplates.value = res.data || []
      }
    } catch (e) {
      console.error('Load filter templates failed:', e)
    }
  }

  // 设置筛选条件
  function setFilter(key: string, value: any) {
    if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
      delete filters.value[key]
    } else {
      filters.value[key] = value
    }
    pagination.value.page = 1
  }

  // 清空所有筛选
  function clearFilters() {
    filters.value = {}
    pagination.value.page = 1
  }

  // 移除单个筛选
  function removeFilter(key: string) {
    delete filters.value[key]
    pagination.value.page = 1
  }

  // 设置客群
  function setSegment(code: string) {
    segmentCode.value = code
    pagination.value.page = 1
  }

  // 设置Tab
  function setTab(tab: string) {
    activeTab.value = tab
    pagination.value.page = 1
  }

  // 切换选中
  function toggleSelect(id: number) {
    const idx = selectedIds.value.indexOf(id)
    if (idx > -1) {
      selectedIds.value.splice(idx, 1)
    } else {
      selectedIds.value.push(id)
    }
  }

  // 全选当前页
  function selectAll(ids: number[]) {
    selectedIds.value = [...ids]
  }

  // 清空选中
  function clearSelection() {
    selectedIds.value = []
  }

  // 重置所有状态
  function resetState() {
    filters.value = {}
    segmentCode.value = ''
    activeTab.value = 'all'
    sortBy.value = 'comprehensive'
    selectedIds.value = []
    enterpriseList.value = []
    total.value = 0
    pagination.value = { page: 1, pageSize: 20 }
  }

  return {
    filters,
    segmentCode,
    activeTab,
    sortBy,
    selectedIds,
    creditBalance,
    filterTemplates,
    enterpriseList,
    total,
    loading,
    stats,
    segments,
    pagination,
    hasFilters,
    selectedCount,
    loadEnterpriseList,
    loadStats,
    loadSegments,
    loadFilterTemplates,
    setFilter,
    clearFilters,
    removeFilter,
    setSegment,
    setTab,
    toggleSelect,
    selectAll,
    clearSelection,
    resetState
  }
})

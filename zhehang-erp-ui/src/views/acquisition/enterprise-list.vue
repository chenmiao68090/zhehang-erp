<template>
  <div class="enterprise-list-page">
    <!-- 1. 顶部说明横幅 -->
    <div v-if="bannerVisible && bannerText" class="el-banner">
      <el-icon class="el-banner__icon"><InfoFilled /></el-icon>
      <div class="el-banner__text">{{ bannerText }}</div>
      <el-icon class="el-banner__close" @click="bannerVisible = false">
        <Close />
      </el-icon>
    </div>

    <!-- 2. 统计 Tab 栏 -->
    <div class="el-tabs-bar">
      <div
        v-for="tab in tabs"
        :key="tab.key"
        class="el-tabs-bar__item"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        <span class="el-tabs-bar__label">{{ tab.label }}</span>
        <span class="el-tabs-bar__count">
          共 <em>{{ formatNum(tabCounts[tab.key] || 0) }}</em> 家企业
        </span>
      </div>
    </div>

    <!-- 3. 筛选面板 -->
    <div class="el-filter-wrap">
      <FilterPanel
        v-model="filters"
        :available-filters="availableFilters"
      />
    </div>

    <!-- 4. 操作栏 -->
    <div class="el-actions">
      <div class="el-actions__left">
        <span class="el-actions__found">
          {{ t('acquisition.listActions.foundEnterprise') }}
          <em>{{ formatNum(displayTotal) }}</em>
          {{ t('acquisition.listActions.unit') }}
        </span>
        <el-dropdown trigger="click" @command="handleSelectCommand">
          <span class="el-actions__select-link">
            {{ t('acquisition.listActions.selectCurrentPage') }}
            {{ enterpriseList.length }}
            {{ t('acquisition.listActions.enterprises') }}
            <el-icon class="el-actions__arrow"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="page">
                {{ t('acquisition.listActions.selectCurrentPage') }}
              </el-dropdown-item>
              <el-dropdown-item command="all">
                {{ t('acquisition.listActions.selectAll') }}
              </el-dropdown-item>
              <el-dropdown-item command="clear" divided>取消勾选</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="el-actions__center">
        <el-button type="primary" @click="handleBatchAddCrm">
          {{ t('acquisition.listActions.addToCrm') }}
        </el-button>
        <el-button @click="handleBatchUnlock">
          {{ t('acquisition.listActions.unlock') }}
        </el-button>
        <el-dropdown>
          <el-button>
            {{ t('acquisition.listActions.moreActions') }}
            <el-icon class="el-btn-arrow"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="handleBatchAssign">批量分配</el-dropdown-item>
              <el-dropdown-item @click="handleBatchExport">批量导出</el-dropdown-item>
              <el-dropdown-item @click="handleSaveTemplate" divided>
                保存筛选方案
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div class="el-actions__right">
        <div class="el-sort-switch">
          <span
            class="el-sort-switch__item"
            :class="{ 'is-active': sortMode === 'comprehensive' }"
            @click="handleSortChange('comprehensive')"
          >
            {{ t('acquisition.listActions.comprehensiveSort') }}
          </span>
          <span
            class="el-sort-switch__item"
            :class="{ 'is-active': sortMode === 'intelligent' }"
            @click="handleSortChange('intelligent')"
          >
            {{ t('acquisition.listActions.intelligentSort') }}
            <el-tooltip
              content="AI 智能排序：综合企业活跃度、转化潜力、行业匹配度自动排序"
              placement="top"
            >
              <el-icon class="el-sort-switch__tip"><InfoFilled /></el-icon>
            </el-tooltip>
          </span>
        </div>
        <el-dropdown>
          <span class="el-actions__filter-link">
            {{ t('acquisition.listActions.allEnterprise') }}
            <el-icon class="el-actions__arrow"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>全部企业</el-dropdown-item>
              <el-dropdown-item>仅显示有联系方式</el-dropdown-item>
              <el-dropdown-item>仅显示在业</el-dropdown-item>
              <el-dropdown-item>排除已加入 CRM</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 5. 企业卡片列表 -->
    <div class="el-list" v-loading="loading">
      <template v-if="enterpriseList.length">
        <EnterpriseCard
          v-for="ent in enterpriseList"
          :key="ent.id"
          :enterprise="ent"
          :selected="selectedIds.includes(ent.id)"
          class="el-list__card"
          @select="handleSelect"
          @unlock="handleUnlock"
          @view-detail="handleViewDetail"
        />
      </template>
      <el-empty
        v-else-if="!loading"
        class="el-list__empty"
        description="未匹配到符合条件的企业"
        :image-size="120"
      >
        <el-button type="primary" plain @click="handleClearAll">
          清空筛选条件
        </el-button>
      </el-empty>
    </div>

    <!-- 6. 底部分页 -->
    <div v-if="enterpriseList.length" class="el-pagination-wrap">
      <el-pagination
        small
        background
        :current-page="pagination.page"
        :page-size="pagination.pageSize"
        :page-sizes="[20, 50, 100]"
        :total="displayTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { InfoFilled, Close, ArrowDown } from '@element-plus/icons-vue'
import {
  SEGMENT_CONFIG,
  useAcquisitionStore,
} from '@/stores/acquisition'
import { enterpriseApi } from '@/api/acquisition'
import FilterPanel from '@/components/acquisition/FilterPanel.vue'
import EnterpriseCard from '@/components/acquisition/EnterpriseCard.vue'

/* ---------------- 基础引用 ---------------- */
const route = useRoute()
const router = useRouter()
const { t, te } = useI18n()
const store = useAcquisitionStore()

/* ---------------- 路由 / 客群解析 ---------------- */
const segmentCode = computed(
  () => (route.meta?.segmentCode as string) || 'tax-abnormal',
)

// kebab-case → camelCase（i18n / banner key）
const segmentKey = computed(() =>
  segmentCode.value.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase()),
)

const currentConfig = computed(
  () => SEGMENT_CONFIG[segmentCode.value] || SEGMENT_CONFIG['tax-abnormal'],
)

const tabs = computed(() => currentConfig.value.tabs)
const availableFilters = computed(() => currentConfig.value.filters)

/* ---------------- Banner ---------------- */
const bannerVisible = ref(true)
const bannerText = computed(() => {
  const key = `acquisition.banner.${segmentKey.value}`
  return te(key) ? t(key) : ''
})

/* ---------------- 本地交互状态 ---------------- */
const filters = ref<Record<string, any>>({})
const activeTab = ref<string>('all')
const sortMode = ref<'comprehensive' | 'intelligent'>('comprehensive')
const loading = ref(false)
const pagination = reactive({ page: 1, pageSize: 50 })

const selectedIds = ref<(number | string)[]>([])

/* ---------------- Mock 数据 ---------------- */
const MOCK_ENTERPRISES: any[] = [
  {
    id: 1, companyName: '杭州星辰网络科技有限公司',
    creditCode: '91330108MA2XXXXX0X', contactCount: 21,
    employeeScale: '1-50 人', operatingStatus: '在业',
    establishDate: '2024-01-15', annualRevenue: '120 万',
    registeredCapital: '100 万', industry: '软件和信息技术服务业',
    taxQualification: '小规模纳税人',
    address: '杭州市西湖区文三路388号',
    isHot: true,
    abnormals: [
      { type: '税务非正常户', reason: '未按期申报', date: '2024-03-01', authority: '杭州市税务局西湖分局' },
      { type: '经营异常名录', reason: '通过登记的住所无法联系', date: '2024-04-15', authority: '杭州市西湖区市场监督管理局' },
    ],
  },
  {
    id: 2, companyName: '上海智链供应链管理有限公司',
    creditCode: '91310115MA1FXXXX27', contactCount: 38,
    employeeScale: '200-500 人', operatingStatus: '在业',
    establishDate: '2018-06-22', annualRevenue: '8600 万',
    registeredCapital: '5000 万', industry: '商务服务业',
    taxQualification: '一般纳税人',
    address: '上海市浦东新区张江高科技园区博云路2号',
    isHot: true, abnormals: [],
  },
  {
    id: 3, companyName: '深圳市鸿翔电子商务有限公司',
    creditCode: '91440300MA5GXXXX4Q', contactCount: 12,
    employeeScale: '50-200 人', operatingStatus: '存续',
    establishDate: '2021-09-08', annualRevenue: '2300 万',
    registeredCapital: '800 万', industry: '批发和零售业',
    taxQualification: '一般纳税人',
    address: '深圳市南山区粤海街道海天二路33号',
    abnormals: [
      { type: '欠税公告', reason: '增值税欠缴 12.6 万元', date: '2024-02-18', authority: '深圳市税务局南山分局' },
    ],
  },
  {
    id: 4, companyName: '北京云图智能科技有限公司',
    creditCode: '91110108MA01XXXX2L', contactCount: 0,
    employeeScale: '1-50 人', operatingStatus: '在业',
    establishDate: '2025-11-30', annualRevenue: '—',
    registeredCapital: '50 万', industry: '科学研究和技术服务业',
    taxQualification: '小规模纳税人',
    address: '北京市海淀区中关村南大街5号',
    abnormals: [],
  },
  {
    id: 5, companyName: '广州海明制造有限公司',
    creditCode: '91440101MA9LXXXX0E', contactCount: 56,
    employeeScale: '500-1000 人', operatingStatus: '在业',
    establishDate: '2010-03-12', annualRevenue: '3.8 亿',
    registeredCapital: '12000 万', industry: '制造业',
    taxQualification: '一般纳税人',
    address: '广州市黄埔区科学城开源大道11号',
    abnormals: [],
  },
  {
    id: 6, companyName: '成都川越餐饮管理有限公司',
    creditCode: '91510104MA6CXXXX3T', contactCount: 4,
    employeeScale: '50-200 人', operatingStatus: '吊销',
    establishDate: '2019-07-21', annualRevenue: '1500 万',
    registeredCapital: '300 万', industry: '住宿和餐饮业',
    taxQualification: '小规模纳税人',
    address: '成都市锦江区红星路三段1号',
    abnormals: [
      { type: '税务行政处罚', reason: '虚开发票', date: '2023-10-05', authority: '成都市税务局稽查局' },
      { type: '经营异常名录', reason: '未按规定报送年度报告', date: '2024-01-22', authority: '成都市市场监督管理局' },
      { type: '重大税收违法', reason: '偷逃税款超 100 万元', date: '2024-05-10', authority: '四川省税务局' },
    ],
  },
  {
    id: 7, companyName: '苏州精工机械装备有限公司',
    creditCode: '91320505MA1NXXXX9B', contactCount: 28,
    employeeScale: '200-500 人', operatingStatus: '在业',
    establishDate: '2015-04-18', annualRevenue: '6800 万',
    registeredCapital: '2000 万', industry: '制造业',
    taxQualification: '一般纳税人',
    address: '苏州市工业园区星湖街328号',
    isHot: true, abnormals: [],
  },
  {
    id: 8, companyName: '武汉光谷生物医药有限公司',
    creditCode: '91420115MA4KXXXX1P', contactCount: 42,
    employeeScale: '200-500 人', operatingStatus: '在业',
    establishDate: '2017-12-03', annualRevenue: '1.58 亿',
    registeredCapital: '6000 万', industry: '医药制造业',
    taxQualification: '一般纳税人',
    address: '武汉市东湖新技术开发区高新大道999号',
    isHot: true, abnormals: [],
  },
  {
    id: 9, companyName: '南京长风建筑工程有限公司',
    creditCode: '91320105MA20XXXX5R', contactCount: 19,
    employeeScale: '500-1000 人', operatingStatus: '存续',
    establishDate: '2012-08-09', annualRevenue: '2.2 亿',
    registeredCapital: '8000 万', industry: '建筑业',
    taxQualification: '一般纳税人',
    address: '南京市建邺区江东中路311号',
    abnormals: [
      { type: '税务行政处罚', reason: '未按期申报印花税', date: '2024-06-01', authority: '南京市税务局建邺分局' },
    ],
  },
  {
    id: 10, companyName: '宁波港航国际贸易有限公司',
    creditCode: '91330206MA2AXXXX8K', contactCount: 8,
    employeeScale: '1-50 人', operatingStatus: '在业',
    establishDate: '2023-05-26', annualRevenue: '480 万',
    registeredCapital: '500 万', industry: '批发和零售业',
    taxQualification: '小规模纳税人',
    address: '宁波市北仑区港西大道188号',
    abnormals: [],
  },
  {
    id: 11, companyName: '西安长安数字传媒有限公司',
    creditCode: '91610116MA6UXXXX9X', contactCount: 15,
    employeeScale: '50-200 人', operatingStatus: '在业',
    establishDate: '2020-02-14', annualRevenue: '980 万',
    registeredCapital: '200 万', industry: '文化、体育和娱乐业',
    taxQualification: '一般纳税人',
    address: '西安市曲江新区大唐不夜城步行街18号',
    abnormals: [],
  },
  {
    id: 12, companyName: '青岛蓝海远洋渔业有限公司',
    creditCode: '91370212MA3MXXXX7Y', contactCount: 6,
    employeeScale: '200-500 人', operatingStatus: '注销',
    establishDate: '2008-11-07', annualRevenue: '1.12 亿',
    registeredCapital: '3500 万', industry: '农、林、牧、渔业',
    taxQualification: '一般纳税人',
    address: '青岛市崂山区海尔路1号',
    abnormals: [],
  },
  {
    id: 13, companyName: '天津滨海智造装备有限公司',
    creditCode: '91120116MA06XXXX2H', contactCount: 31,
    employeeScale: '200-500 人', operatingStatus: '在业',
    establishDate: '2016-09-19', annualRevenue: '7200 万',
    registeredCapital: '4500 万', industry: '通用设备制造业',
    taxQualification: '一般纳税人',
    address: '天津市滨海新区开发区第十大街88号',
    abnormals: [
      { type: '税务非正常户', reason: '逾期未申报', date: '2024-08-12', authority: '天津市税务局滨海分局' },
    ],
  },
  {
    id: 14, companyName: '厦门海风文化传播有限公司',
    creditCode: '91350203MA7MXXXX6V', contactCount: 9,
    employeeScale: '1-50 人', operatingStatus: '在业',
    establishDate: '2022-11-08', annualRevenue: '320 万',
    registeredCapital: '100 万', industry: '文化、体育和娱乐业',
    taxQualification: '小规模纳税人',
    address: '厦门市思明区软件园二期观日路32号',
    abnormals: [],
  },
  {
    id: 15, companyName: '长沙湘江新材料股份有限公司',
    creditCode: '91430104MA4QXXXX8N', contactCount: 47,
    employeeScale: '500-1000 人', operatingStatus: '在业',
    establishDate: '2014-05-30', annualRevenue: '2.6 亿',
    registeredCapital: '10000 万', industry: '化学原料和化学制品制造业',
    taxQualification: '一般纳税人',
    address: '长沙市岳麓区岳麓大道588号',
    isHot: true, abnormals: [],
  },
]

/* ---------------- 数据列表 / 总数 ---------------- */
const enterpriseList = ref<any[]>([])
const total = ref<number>(0)

const displayTotal = computed(() =>
  total.value > 0 ? total.value : MOCK_ENTERPRISES.length * 1048,
)

// 每个 Tab 的数量（mock）：根据 segmentCode hash 略有差异
const tabCounts = computed<Record<string, number>>(() => {
  const result: Record<string, number> = {}
  const base = displayTotal.value
  tabs.value.forEach((tab, idx) => {
    if (tab.key === 'all') {
      result[tab.key] = base
    } else {
      // 在总数基础上按 Tab 顺序衰减
      result[tab.key] = Math.max(
        100,
        Math.round(base / (idx + 1.7) - idx * 137),
      )
    }
  })
  return result
})

/* ---------------- 数据加载 ---------------- */
async function loadList() {
  loading.value = true
  try {
    const res: any = await enterpriseApi.list({
      page: pagination.page,
      pageSize: pagination.pageSize,
      sortBy: sortMode.value,
      segmentCode: segmentCode.value,
      tabCode: activeTab.value,
      ...filters.value,
    })
    if (res?.code === 200 && (res.data?.list || res.data?.records)) {
      enterpriseList.value = res.data.list || res.data.records
      total.value = res.data.total || 0
    } else {
      enterpriseList.value = MOCK_ENTERPRISES
      total.value = 0
    }
  } catch (e) {
    // 后端未启动时降级到 mock 数据
    enterpriseList.value = MOCK_ENTERPRISES
    total.value = 0
  } finally {
    loading.value = false
  }
}

/* ---------------- 路由 / 客群切换监听 ---------------- */
watch(
  segmentCode,
  (code) => {
    store.setSegment(code)
    // 切换客群时重置内部状态
    activeTab.value = tabs.value[0]?.key || 'all'
    filters.value = {}
    pagination.page = 1
    selectedIds.value = []
    bannerVisible.value = true
    loadList()
  },
  { immediate: true },
)

watch(
  filters,
  () => {
    pagination.page = 1
    loadList()
  },
  { deep: true },
)

onMounted(() => {
  if (!enterpriseList.value.length) loadList()
})

/* ---------------- 事件处理 ---------------- */
function handleTabChange(key: string) {
  if (activeTab.value === key) return
  activeTab.value = key
  store.setTab(key)
  pagination.page = 1
  loadList()
}

function handleSortChange(mode: 'comprehensive' | 'intelligent') {
  if (sortMode.value === mode) return
  sortMode.value = mode
  loadList()
}

function handleClearAll() {
  filters.value = {}
  pagination.page = 1
  loadList()
}

function handlePageChange(page: number) {
  pagination.page = page
  loadList()
}
function handleSizeChange(size: number) {
  pagination.pageSize = size
  pagination.page = 1
  loadList()
}

/* 单条交互 */
function handleSelect(id: number | string) {
  const idx = selectedIds.value.indexOf(id)
  if (idx > -1) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

function handleViewDetail(id: number | string) {
  router.push(`/acquisition/enterprise/${id}`)
}

function handleUnlock(id: number | string) {
  ElMessageBox.confirm(
    `本次解锁将消耗 1 点解锁额度，当前余额 ${store.creditBalance}，确认继续？`,
    '解锁联系方式',
    { type: 'warning', confirmButtonText: '确认解锁', cancelButtonText: '取消' },
  )
    .then(() => {
      ElMessage.success('解锁成功，联系方式已加密保留至您的解锁记录')
    })
    .catch(() => {})
}

/* 勾选下拉 */
function handleSelectCommand(cmd: string) {
  if (cmd === 'page') {
    selectedIds.value = enterpriseList.value.map((e) => e.id)
  } else if (cmd === 'all') {
    ElMessage.info(`已勾选全部 ${formatNum(displayTotal.value)} 家企业`)
    selectedIds.value = enterpriseList.value.map((e) => e.id)
  } else if (cmd === 'clear') {
    selectedIds.value = []
  }
}

/* 批量操作 */
function handleBatchAddCrm() {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先勾选企业')
    return
  }
  ElMessage.success(`已将 ${selectedIds.value.length} 家企业添加至 CRM`)
  selectedIds.value = []
}
function handleBatchUnlock() {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先勾选企业')
    return
  }
  ElMessageBox.confirm(
    `批量解锁 ${selectedIds.value.length} 家企业，将消耗 ${selectedIds.value.length} 点额度`,
    '批量解锁',
    { type: 'warning' },
  )
    .then(() => {
      ElMessage.success(`已批量解锁 ${selectedIds.value.length} 家企业`)
      selectedIds.value = []
    })
    .catch(() => {})
}
function handleBatchAssign() {
  ElMessage.info('请在弹窗中选择分配负责人（待对接）')
}
function handleBatchExport() {
  ElMessage.success(`已导出 ${selectedIds.value.length || '当前页'} 家企业信息`)
}
function handleSaveTemplate() {
  ElMessageBox.prompt('请输入筛选方案名称', '保存筛选方案', {
    confirmButtonText: '保存',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '名称不能为空',
  })
    .then(({ value }) => {
      ElMessage.success(`方案"${value}"已保存`)
    })
    .catch(() => {})
}

/* ---------------- 工具 ---------------- */
function formatNum(n: number) {
  if (!n) return '0'
  return n.toLocaleString()
}
</script>

<style scoped lang="scss">
$primary: #409eff;
$text: #303133;
$text-secondary: #606266;
$text-tertiary: #909399;
$border: #ebeef5;
$border-light: #f0f2f5;
$bg: #fff;

.enterprise-list-page {
  background: $bg;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

/* ---------------- 1. Banner ---------------- */
.el-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 16px;
  background: linear-gradient(90deg, #fffbe6 0%, #fff8d1 100%);
  border-left: 3px solid #faad14;
  font-size: 13px;
  line-height: 1.6;
  color: #614700;

  &__icon {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 16px;
    color: #faad14;
  }
  &__text {
    flex: 1;
    word-break: break-all;
  }
  &__close {
    flex-shrink: 0;
    margin-top: 2px;
    font-size: 16px;
    color: #b08800;
    cursor: pointer;
    transition: color 0.2s;
    &:hover { color: #614700; }
  }
}

/* ---------------- 2. 统计 Tab 栏 ---------------- */
.el-tabs-bar {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 16px;
  background: $bg;
  border-bottom: 1px solid $border-light;
  overflow-x: auto;
  scrollbar-width: thin;

  &__item {
    position: relative;
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 14px 18px;
    cursor: pointer;
    white-space: nowrap;
    border-bottom: 2px solid transparent;
    transition: color 0.2s, border-color 0.2s;
    color: $text-secondary;

    &:hover {
      color: $primary;
    }

    &.is-active {
      color: $primary;
      border-bottom-color: $primary;
      .el-tabs-bar__label { font-weight: 600; }
      .el-tabs-bar__count em { color: $primary; }
    }
  }

  &__label {
    font-size: 14px;
  }
  &__count {
    font-size: 12px;
    color: $text-tertiary;
    em {
      font-style: normal;
      font-weight: 600;
      color: $text-secondary;
      margin: 0 2px;
    }
  }
}

/* ---------------- 3. 筛选面板 ---------------- */
.el-filter-wrap {
  background: $bg;
  border-bottom: 1px solid $border-light;

  :deep(.filter-panel) {
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

/* ---------------- 4. 操作栏 ---------------- */
.el-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: $bg;
  border-top: 1px solid $border-light;
  border-bottom: 1px solid $border-light;

  &__left {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-shrink: 0;
  }

  &__center {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-start;
    margin-left: 8px;
  }

  &__right {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-left: auto;
    flex-shrink: 0;
  }

  &__found {
    font-size: 13px;
    color: $text-secondary;
    em {
      font-style: normal;
      font-weight: 700;
      font-size: 15px;
      color: $primary;
      margin: 0 4px;
    }
  }

  &__select-link,
  &__filter-link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: $primary;
    cursor: pointer;
    user-select: none;
    transition: opacity 0.2s;
    &:hover { opacity: 0.8; }
  }

  &__arrow,
  .el-btn-arrow {
    font-size: 12px;
  }
  .el-btn-arrow { margin-left: 4px; }
}

/* 排序切换 */
.el-sort-switch {
  display: inline-flex;
  align-items: stretch;
  border: 1px solid $border;
  border-radius: 4px;
  overflow: hidden;

  &__item {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    font-size: 13px;
    color: $text-secondary;
    cursor: pointer;
    background: $bg;
    transition: all 0.2s;

    & + & { border-left: 1px solid $border; }

    &:hover {
      color: $primary;
    }

    &.is-active {
      color: $primary;
      background: #ecf5ff;
      border-color: $primary;
      font-weight: 500;
    }
  }

  &__tip {
    font-size: 12px;
    color: $text-tertiary;
  }
}

/* ---------------- 5. 列表 ---------------- */
.el-list {
  flex: 1;
  background: $bg;
  min-height: 240px;

  &__card {
    border-bottom: 1px solid $border-light;
    border-radius: 0;
    margin: 0;

    &:last-child {
      border-bottom: none;
    }

    :deep(.enterprise-card),
    :deep(.ec-card) {
      border: none !important;
      border-radius: 0 !important;
      box-shadow: none !important;
      margin: 0 !important;
    }
  }

  &__empty {
    padding: 60px 0;
  }
}

/* ---------------- 6. 分页 ---------------- */
.el-pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 14px 16px;
  background: $bg;
  border-top: 1px solid $border-light;
}

/* 响应式 */
@media (max-width: 1280px) {
  .el-actions {
    flex-wrap: wrap;
    &__right {
      margin-left: 0;
      width: 100%;
      justify-content: flex-end;
    }
  }
}

@media (max-width: 768px) {
  .el-tabs-bar__item { padding: 12px 12px; }
  .el-actions {
    padding: 10px 12px;
    gap: 10px;
    &__center { flex-wrap: wrap; }
  }
}
</style>

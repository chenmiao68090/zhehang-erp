<template>
  <div class="page-container segment-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">{{ $t('acquisition.segment.title') || '智能获客 · 客群总览' }}</h2>
        <p class="page-subtitle">{{ $t('acquisition.segment.subtitle') || '10大行业客群精准筛选，帮助您高效触达目标企业' }}</p>
      </div>
    </div>

    <!-- 顶部统计卡片行 -->
    <el-row :gutter="16" class="stat-row">
      <el-col :span="6" v-for="(stat, idx) in statCards" :key="idx">
        <el-skeleton :loading="statsLoading" animated :throttle="300">
          <template #template>
            <div class="stat-card-skeleton">
              <el-skeleton-item variant="circle" style="width:40px;height:40px" />
              <div class="skeleton-info">
                <el-skeleton-item variant="text" style="width:60%" />
                <el-skeleton-item variant="text" style="width:40%" />
              </div>
            </div>
          </template>
          <template #default>
            <div class="stat-card">
              <div class="stat-icon" :style="{ background: stat.bgColor, color: stat.color }">
                <el-icon :size="22"><component :is="stat.icon" /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </template>
        </el-skeleton>
      </el-col>
    </el-row>

    <!-- 客群分组区域 -->
    <div class="segment-groups">
      <el-skeleton :loading="segmentsLoading" animated :count="2" :throttle="300">
        <template #template>
          <div class="group-skeleton">
            <el-skeleton-item variant="text" style="width:200px;height:24px;margin-bottom:16px" />
            <el-row :gutter="16">
              <el-col :span="8" v-for="i in 3" :key="i">
                <el-skeleton-item variant="rect" style="width:100%;height:120px;border-radius:8px" />
              </el-col>
            </el-row>
          </div>
        </template>
        <template #default>
          <div
            v-for="group in segmentGroups"
            :key="group.code"
            class="segment-group"
          >
            <div class="group-header">
              <div class="group-icon" :style="{ background: group.bgColor, color: group.color }">
                <el-icon :size="18"><component :is="group.icon" /></el-icon>
              </div>
              <div class="group-title-wrap">
                <div class="group-title">
                  <span class="group-code">{{ group.code }}</span>
                  <span class="group-name">{{ group.name }}</span>
                </div>
                <span class="group-count">{{ group.items.length }} {{ $t('acquisition.segment.categoryUnit') || '个客群' }}</span>
              </div>
            </div>

            <el-row :gutter="16">
              <el-col
                :span="8"
                v-for="item in group.items"
                :key="item.code"
              >
                <div
                  class="segment-card"
                  :style="{ '--accent': group.color }"
                  @click="handleSelectSegment(item)"
                >
                  <div class="segment-card-top">
                    <div class="segment-icon" :style="{ background: group.bgColor, color: group.color }">
                      <el-icon :size="20"><component :is="item.icon" /></el-icon>
                    </div>
                    <div class="segment-main">
                      <div class="segment-title-row">
                        <span class="segment-code">{{ item.code }}</span>
                        <span class="segment-name">{{ item.name }}</span>
                      </div>
                      <div class="segment-desc" :title="item.desc">{{ item.desc }}</div>
                    </div>
                    <div class="segment-count">
                      <span class="count-num">{{ formatNumber(item.count) }}</span>
                      <span class="count-unit">{{ $t('acquisition.segment.companyUnit') || '家' }}</span>
                    </div>
                  </div>
                  <div class="segment-card-bottom">
                    <span class="view-btn">
                      {{ $t('acquisition.segment.viewEnterprise') || '查看企业' }}
                      <el-icon class="arrow"><ArrowRight /></el-icon>
                    </span>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </template>
      </el-skeleton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Document,
  Warning,
  WarningFilled,
  Calendar,
  UserFilled,
  Connection,
  Aim,
  ShoppingCart,
  Lightning,
  TrendCharts,
  ArrowRight,
  OfficeBuilding,
  CirclePlus,
  Unlock,
  Trophy
} from '@element-plus/icons-vue'
import { enterpriseApi, segmentApi } from '@/api/acquisition'
import { useAcquisitionStore } from '@/stores/acquisition'

const router = useRouter()
const acquisitionStore = useAcquisitionStore()

const statsLoading = ref(true)
const segmentsLoading = ref(true)

// 顶部统计数据（默认静态）
const stats = reactive({
  total: 12580,
  todayNew: 326,
  unlocked: 1240,
  converted: 856
})

const statCards = computed(() => [
  {
    label: '总企业数',
    value: formatNumber(stats.total) + '+',
    icon: OfficeBuilding,
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.12)'
  },
  {
    label: '今日新增',
    value: formatNumber(stats.todayNew),
    icon: CirclePlus,
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.12)'
  },
  {
    label: '已解锁',
    value: formatNumber(stats.unlocked),
    icon: Unlock,
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.12)'
  },
  {
    label: '已转化',
    value: formatNumber(stats.converted),
    icon: Trophy,
    color: '#9B6DFF',
    bgColor: 'rgba(155, 109, 255, 0.12)'
  }
])

// 客群默认配置（fallback 静态数据）
const defaultSegmentGroups = [
  {
    code: 'G01',
    name: '基础业务客群',
    icon: Document,
    color: '#409EFF',
    bgColor: 'rgba(64, 158, 255, 0.12)',
    items: [
      { code: 'F01', name: '代理记账新开', desc: '筛选适合新签约代理记账服务的企业', count: 3240, icon: Document },
      { code: 'F02', name: '经营异常解除', desc: '已列入经营异常需要解除的企业', count: 2180, icon: Warning },
      { code: 'F03', name: '税务异常解除', desc: '税务异常需解除的企业', count: 1560, icon: WarningFilled },
      { code: 'F04', name: '年报客群', desc: '需要年报代办服务的企业', count: 4120, icon: Calendar }
    ]
  },
  {
    code: 'G02',
    name: '同行切户',
    icon: UserFilled,
    color: '#67C23A',
    bgColor: 'rgba(103, 194, 58, 0.12)',
    items: [
      { code: 'F05', name: '服务质量问题', desc: '对现有财税服务商不满意的企业', count: 890, icon: Warning },
      { code: 'F06', name: '同期成立企业', desc: '与现有客户同期同区同行业企业', count: 1650, icon: Connection },
      { code: 'F07', name: '同行服务客户', desc: '正在被竞争对手服务的企业', count: 2340, icon: Aim }
    ]
  },
  {
    code: 'G03',
    name: '电商客群',
    icon: ShoppingCart,
    color: '#E6A23C',
    bgColor: 'rgba(230, 162, 60, 0.12)',
    items: [
      { code: 'F08', name: '电商财税合规', desc: '电商卖家财税合规服务客群', count: 1280, icon: ShoppingCart }
    ]
  },
  {
    code: 'G04',
    name: '新企商机',
    icon: TrendCharts,
    color: '#9B6DFF',
    bgColor: 'rgba(155, 109, 255, 0.12)',
    items: [
      { code: 'F09', name: 'T+1新企商机', desc: '昨日新注册企业', count: 326, icon: Lightning },
      { code: 'F10', name: 'T+7新企商机', desc: '近7天新注册企业', count: 1890, icon: TrendCharts }
    ]
  }
]

const segmentGroups = ref<any[]>(defaultSegmentGroups)

// 数字格式化（添加千分位）
function formatNumber(num: number): string {
  if (num === null || num === undefined) return '0'
  return num.toLocaleString('zh-CN')
}

// 加载统计数据
async function loadStats() {
  statsLoading.value = true
  try {
    const res: any = await enterpriseApi.stats()
    if (res?.code === 200 && res.data) {
      stats.total = res.data.total ?? stats.total
      stats.todayNew = res.data.todayNew ?? stats.todayNew
      stats.unlocked = res.data.unlocked ?? stats.unlocked
      stats.converted = res.data.converted ?? stats.converted
    }
  } catch (e) {
    // 接口未就绪时使用静态数据
    console.warn('[segment] stats API not ready, using static data')
  } finally {
    statsLoading.value = false
  }
}

// 加载客群列表
async function loadSegments() {
  segmentsLoading.value = true
  try {
    const res: any = await segmentApi.list()
    if (res?.code === 200 && Array.isArray(res.data) && res.data.length > 0) {
      // 如果后端返回了客群数据，按 code 合并 count
      const remoteMap = new Map<string, any>()
      res.data.forEach((it: any) => {
        if (it && it.code) remoteMap.set(it.code, it)
      })
      segmentGroups.value = defaultSegmentGroups.map(g => ({
        ...g,
        items: g.items.map(item => {
          const remote = remoteMap.get(item.code)
          return remote
            ? {
                ...item,
                name: remote.name || item.name,
                desc: remote.desc || remote.description || item.desc,
                count: remote.count ?? remote.enterpriseCount ?? item.count
              }
            : item
        })
      }))
    }
  } catch (e) {
    console.warn('[segment] segment API not ready, using static data')
  } finally {
    segmentsLoading.value = false
  }
}

// 选择客群 -> 跳转到企业列表
function handleSelectSegment(item: { code: string; name: string }) {
  acquisitionStore.setSegment(item.code)
  router.push({
    path: '/acquisition/enterprise',
    query: { segment: item.code }
  })
}

onMounted(() => {
  loadStats()
  loadSegments()
})
</script>

<style scoped lang="scss">
.segment-page {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100%;
}

/* 页面头部 */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;

  .page-title {
    font-size: 22px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 6px 0;
  }

  .page-subtitle {
    font-size: 13px;
    color: #909399;
    margin: 0;
  }
}

/* 统计卡片 */
.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  .stat-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .stat-info {
    flex: 1;
    min-width: 0;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    color: #303133;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
  }
}

.stat-card-skeleton {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;

  .skeleton-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

/* 客群分组 */
.segment-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.segment-group {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .group-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .group-title-wrap {
    display: flex;
    align-items: baseline;
    gap: 10px;
    flex: 1;
  }

  .group-title {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .group-code {
    font-size: 13px;
    font-weight: 600;
    color: #909399;
    letter-spacing: 0.5px;
  }

  .group-name {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .group-count {
    font-size: 12px;
    color: #909399;
  }
}

/* 客群卡片 */
.segment-card {
  --accent: #409eff;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 3px;
    height: 100%;
    background: var(--accent);
    transform: scaleY(0);
    transform-origin: bottom;
    transition: transform 0.25s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(64, 158, 255, 0.12);
    border-color: var(--accent);

    &::before {
      transform: scaleY(1);
      transform-origin: top;
    }

    .view-btn {
      gap: 6px;

      .arrow {
        transform: translateX(2px);
      }
    }
  }
}

.segment-card-top {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.segment-icon {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.segment-main {
  flex: 1;
  min-width: 0;
}

.segment-title-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 6px;
}

.segment-code {
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  letter-spacing: 0.5px;
}

.segment-name {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.segment-desc {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.segment-count {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  flex-shrink: 0;

  .count-num {
    font-size: 20px;
    font-weight: 700;
    color: #303133;
    line-height: 1.1;
  }

  .count-unit {
    font-size: 12px;
    color: #909399;
    margin-top: 2px;
  }
}

.segment-card-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;

  .view-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    color: #409eff;
    cursor: pointer;
    transition: gap 0.2s ease;

    .arrow {
      transition: transform 0.25s ease;
      font-size: 12px;
    }
  }
}

.group-skeleton {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  margin-bottom: 24px;
}
</style>

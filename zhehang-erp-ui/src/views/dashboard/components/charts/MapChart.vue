<template>
  <div class="map-chart">
    <div class="map-placeholder">
      <el-icon :size="48" class="map-icon"><MapLocation /></el-icon>
      <p class="map-title">中国地图</p>
      <span class="map-hint">需加载地图GeoJSON数据</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MapLocation } from '@element-plus/icons-vue'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

defineProps<{ config: WidgetConfig }>()

// 预留ECharts地图option结构
// import * as echarts from 'echarts'
// import chinaGeoJSON from '@/assets/geo/china.json'
// echarts.registerMap('china', chinaGeoJSON as any)
// const option: echarts.EChartsOption = {
//   backgroundColor: 'transparent',
//   tooltip: {
//     trigger: 'item',
//     backgroundColor: 'rgba(18,18,26,0.95)',
//     borderColor: 'rgba(212,175,55,0.2)',
//     textStyle: { color: '#EAEAEA' }
//   },
//   visualMap: {
//     min: 0, max: 1000,
//     inRange: { color: ['#12121A', '#1a3a1a', '#D4AF37'] },
//     textStyle: { color: '#8B8B9A' }
//   },
//   series: [{
//     type: 'map',
//     map: 'china',
//     roam: true,
//     itemStyle: { areaColor: '#1A1A25', borderColor: 'rgba(212,175,55,0.3)' },
//     emphasis: { itemStyle: { areaColor: 'rgba(212,175,55,0.3)' } },
//     data: [{ name: '浙江', value: 800 }, ...]
//   }]
// }
</script>

<style scoped>
.map-chart {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.map-icon {
  color: #D4AF37;
  opacity: 0.6;
}

.map-title {
  font-size: 16px;
  color: #EAEAEA;
  margin: 0;
  font-weight: 500;
}

.map-hint {
  font-size: 12px;
  color: #8B8B9A;
}
</style>

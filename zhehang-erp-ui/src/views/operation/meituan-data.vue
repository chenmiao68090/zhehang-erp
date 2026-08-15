<template>
  <PlatformDataPage platform="meituan" platform-label="美团 · 大众点评" :categories="categories" />
</template>

<script setup lang="ts">
import PlatformDataPage, { type MetricCategory } from './PlatformDataPage.vue'

// 美团 & 大众点评综合数据(飞书 188):复用 meituan 平台的概览四指标(与运营数据总表 channel-data 同源),
// 另加「大众点评综合」分区,把点评侧的曝光/访问/收藏/转化一并手动录入汇总。
const categories: MetricCategory[] = [
  {
    key: 'overview',
    label: '美团数据概览',
    desc: '浏览 / 访问 / 咨询与推广消耗(与运营数据总表口径一致,数据互通)',
    fields: [
      { key: 'views', label: '浏览量' },
      { key: 'visits', label: '访问量' },
      { key: 'inquiries', label: '咨询量' },
      { key: 'adCost', label: '推广消耗', money: true }
    ]
  },
  {
    key: 'dianping',
    label: '大众点评综合',
    desc: '曝光 / 访问 / 收藏 / 转化 / 推广消耗',
    fields: [
      { key: 'exposure', label: '曝光量' },
      { key: 'visits', label: '访问量' },
      { key: 'favorite', label: '收藏数' },
      { key: 'convert', label: '转化数' },
      { key: 'adCost', label: '推广消耗', money: true }
    ]
  }
]
</script>

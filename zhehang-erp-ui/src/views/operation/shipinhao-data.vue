<template>
  <PlatformDataPage platform="shipinhao" platform-label="视频号" :categories="categories" />
</template>

<script setup lang="ts">
import PlatformDataPage, { type MetricCategory } from './PlatformDataPage.vue'

// 视频号数据(飞书 220):数据概览 + 内容营销-短视频 + 内容营销-直播
const categories: MetricCategory[] = [
  {
    key: 'overview',
    label: '数据概览',
    desc: '账号整体浏览 / 访问 / 咨询与推广消耗(与运营数据总表口径一致)',
    fields: [
      { key: 'views', label: '浏览量' },
      { key: 'visits', label: '访问量' },
      { key: 'inquiries', label: '咨询量' },
      { key: 'adCost', label: '推广消耗', money: true }
    ]
  },
  {
    key: 'video',
    label: '内容营销 · 短视频',
    desc: '视频 / 播放 / 互动',
    fields: [
      { key: 'video', label: '视频数' },
      { key: 'play', label: '播放量' },
      { key: 'interact', label: '互动数' }
    ]
  },
  {
    key: 'live',
    label: '内容营销 · 直播',
    desc: '直播 / 观看 / 转化',
    fields: [
      { key: 'sessions', label: '直播场次' },
      { key: 'watch', label: '观看人次' },
      { key: 'convert', label: '转化数' }
    ]
  }
]
</script>

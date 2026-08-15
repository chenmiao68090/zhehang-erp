<template>
  <PlatformDataPage platform="douyin" platform-label="抖音" :categories="categories" />
</template>

<script setup lang="ts">
import PlatformDataPage, { type MetricCategory } from './PlatformDataPage.vue'

// 抖音数据(飞书 200/204/205/206):数据概览 + 内容营销-直播 + 内容营销-短视频 + 服务转化-私信留资
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
    key: 'live',
    label: '内容营销 · 直播',
    desc: '直播场次 / 时长 / 观看 / 互动 / 转化',
    fields: [
      { key: 'sessions', label: '场次' },
      { key: 'duration', label: '时长(分钟)' },
      { key: 'watch', label: '观看人次' },
      { key: 'interact', label: '互动次数' },
      { key: 'convert', label: '转化数' }
    ]
  },
  {
    key: 'video',
    label: '内容营销 · 短视频',
    desc: '发布 / 播放 / 点赞 / 评论 / 转化',
    fields: [
      { key: 'publish', label: '发布数' },
      { key: 'play', label: '播放量' },
      { key: 'like', label: '点赞数' },
      { key: 'comment', label: '评论数' },
      { key: 'convert', label: '转化数' }
    ]
  },
  {
    key: 'message',
    label: '服务转化 · 私信留资',
    desc: '私信 / 留资 / 转化',
    fields: [
      { key: 'message', label: '私信数' },
      { key: 'lead', label: '留资数' },
      { key: 'convert', label: '转化数' }
    ]
  }
]
</script>

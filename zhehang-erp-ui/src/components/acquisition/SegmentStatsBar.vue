<template>
  <div class="segment-stats-bar">
    <div class="ssb-rail">
      <div
        v-for="tab in tabs"
        :key="tab.code"
        class="ssb-tab"
        :class="{ active: tab.code === activeTab }"
        @click="onPick(tab.code)"
      >
        <span class="ssb-tab__dot" :style="{ background: tab.dotColor }"></span>
        <span class="ssb-tab__name">{{ tab.label }}</span>
        <span class="ssb-tab__count">
          {{ formatCount(stats[tab.code] ?? tab.fallback) }}<span class="plus">+</span>
        </span>
      </div>
    </div>
    <div class="ssb-meta">
      <span class="meta-tip">命中数据基于实时合规情报源 · 每日刷新</span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: Record<string, number>
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'tabChange', code: string): void
}>()

const tabs = [
  { code: 'all',                label: '全部',           dotColor: '#409EFF', fallback: 12580 },
  { code: 'taxAbnormal',        label: '税务非正常户',   dotColor: '#F56C6C', fallback: 3240 },
  { code: 'taxArrears',         label: '欠税公告',       dotColor: '#E6A23C', fallback: 1850 },
  { code: 'majorViolation',     label: '重大税收违法',   dotColor: '#9B6DFF', fallback: 126 },
  { code: 'taxPenalty',         label: '税务行政处罚',   dotColor: '#FF8B57', fallback: 890 },
  { code: 'operationAbnormal',  label: '经营异常',       dotColor: '#67C23A', fallback: 5420 }
]

function onPick(code: string) {
  emit('tabChange', code)
}

function formatCount(n: number) {
  if (!n && n !== 0) return '—'
  if (n >= 10000) return (n / 10000).toFixed(n % 10000 === 0 ? 0 : 1) + '万'
  return n.toLocaleString()
}
</script>

<style scoped lang="scss">
.segment-stats-bar {
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  padding: 14px 18px 12px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, #409EFF 0%, #67C23A 50%, #E6A23C 100%);
    opacity: 0.85;
  }
}

.ssb-rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.ssb-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px 8px 12px;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  transition: all 0.18s ease;
  position: relative;

  &__dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  &__count {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
    font-size: 12px;
    color: #909399;
    font-weight: 600;

    .plus {
      color: #c0c4cc;
      margin-left: 1px;
    }
  }

  &:hover:not(.active) {
    border-color: #409EFF;
    color: #409EFF;
    background: #f0f7ff;
  }

  &.active {
    background: #409EFF;
    border-color: #409EFF;
    color: #fff;
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.28);

    .ssb-tab__count { color: rgba(255, 255, 255, 0.92); }
    .ssb-tab__count .plus { color: rgba(255, 255, 255, 0.6); }
    .ssb-tab__dot { background: #fff !important; }
  }
}

.ssb-meta {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;

  .meta-tip {
    font-size: 11px;
    color: #a8abb2;
    letter-spacing: 0.4px;

    &::before {
      content: '◆';
      color: #409EFF;
      margin-right: 6px;
      font-size: 8px;
      vertical-align: 1px;
    }
  }
}
</style>

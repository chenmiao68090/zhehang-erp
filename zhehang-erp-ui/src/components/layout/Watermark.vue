<template>
  <!-- 全屏淡斜铺水印层：固定覆盖、绝不挡点击 -->
  <div class="wm-overlay" :style="{ backgroundImage: tileBg }"></div>
  <!-- 右下角实时角标 -->
  <div class="wm-badge">{{ badgeText }}</div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

defineOptions({ name: 'AppWatermark' })

const u = useUserStore()
const name = computed(() => u.userInfo?.nickname || u.userInfo?.username || '')
const phone = computed(() => u.userInfo?.phone || '')

// 实时时间（每秒刷新）
const now = ref('')
let timer: ReturnType<typeof setInterval> | null = null

// 格式化为 YYYY-MM-DD HH:mm:ss
const formatTime = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0')
  return (
    `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ` +
    `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`
  )
}

// 斜铺水印文字：姓名 + 手机号 + 时间（为空的部分自动跳过，不报错）
const tileText = computed(() =>
  [name.value, phone.value, now.value].filter(Boolean).join(' ')
)

// 角标文字：姓名 · 时间
const badgeText = computed(() =>
  [name.value, now.value].filter(Boolean).join(' · ')
)

// 内联 SVG 生成 repeat 背景：-22°、font-size 13、fill #1f2329、opacity 0.06、tile 260x150
const tileBg = computed(() => {
  const text = tileText.value || ' '
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="150">` +
    `<text x="0" y="75" transform="rotate(-22 130 75)" ` +
    `font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" ` +
    `font-size="13" fill="#1f2329" fill-opacity="0.06">${escapeXml(text)}</text>` +
    `</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
})

// 转义 XML 特殊字符，避免姓名/手机里出现 & < > 破坏 SVG
function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

onMounted(() => {
  now.value = formatTime(new Date())
  timer = setInterval(() => {
    now.value = formatTime(new Date())
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<style scoped>
.wm-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
  background-repeat: repeat;
}

.wm-badge {
  position: fixed;
  right: 10px;
  bottom: 10px;
  background: rgba(31, 35, 41, 0.5);
  color: #fff;
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 6px;
  pointer-events: none;
  z-index: 99999;
}
</style>

<template>
  <div class="sales-page rank-page" v-loading="loading">
    <!-- 页头:飞书渐变卡 -->
    <header class="sales-header">
      <div class="sh-eyebrow">
        <span class="she-tag">龙虎榜</span>
        <span class="she-line"></span>
        <span class="she-time">实时排名 · 激励冲刺</span>
      </div>
      <div class="sh-main">
        <div>
          <h2 class="sh-title"><span class="sht-cn">🏆 龙虎榜 TOP</span><span class="sht-en">Sales Ranking</span></h2>
          <p class="sh-desc">姓名 · 部门 · 业绩 · 环比,{{ periodLabel }}实时排名,激励冲刺。</p>
        </div>
        <div class="sh-actions">
          <el-radio-group v-model="period" size="default" @change="load">
            <el-radio-button value="month">本月</el-radio-button>
            <el-radio-button value="quarter">本季</el-radio-button>
            <el-radio-button value="year">本年</el-radio-button>
          </el-radio-group>
          <div class="target-box">
            <span>{{ periodLabel }}目标</span>
            <el-input-number v-model="targetWan" :min="1" :step="10" :controls="false" size="default" style="width: 84px" />
            <span>万</span>
          </div>
        </div>
      </div>
    </header>

    <template v-if="rows.length">
      <!-- 领奖台:前三名 -->
      <section class="podium">
        <div
          v-for="item in podium"
          :key="item.r.employeeName"
          class="pod-col"
          :class="['pod-' + (item.i + 1), { 'is-me': isMe(item.r) }]"
        >
          <div class="pod-avatar-wrap">
            <div class="pod-avatar" :style="{ background: medal(item.i) }">{{ (item.r.employeeName || '客').charAt(0) }}</div>
            <span v-if="item.i === 0" class="pod-crown">👑</span>
            <span v-if="isMe(item.r)" class="me-badge">我</span>
          </div>
          <div class="pod-name" :title="item.r.employeeName">{{ item.r.employeeName }}</div>
          <span class="pod-dept" :style="deptStyle(item.r.department)">{{ item.r.department || '—' }}</span>
          <div class="pod-amount">¥{{ wan(item.r.amount) }}<small>万</small></div>
          <span v-if="item.r.growthRate != null" class="sm-trend pod-trend" :class="trendCls(item.r.growthRate)">
            {{ trendArrow(item.r.growthRate) }} {{ Math.abs(item.r.growthRate) }}%
          </span>
          <span class="pod-ring" v-html="sanitizeSvg(ringSvg(rate(item.r.amount), 44))"></span>
          <div class="pod-base" :style="{ height: item.h + 'px', background: medalBg(item.i), borderColor: medal(item.i), color: medal(item.i) }">{{ item.i + 1 }}</div>
        </div>
      </section>

      <!-- 第4名起:环形榜列表 -->
      <section class="rank-list">
        <div
          v-for="(r, idx) in restRows"
          :key="r.employeeName"
          class="rank-row"
          :class="{ 'is-me': isMe(r) }"
          :ref="(el) => setMeRef(el, r)"
        >
          <span class="rk-no">{{ idx + 4 }}</span>
          <div class="rk-avatar">{{ (r.employeeName || '客').charAt(0) }}</div>
          <div class="rk-meta">
            <div class="rk-name" :title="r.employeeName">
              {{ r.employeeName }}<span v-if="isMe(r)" class="me-badge sm">我</span>
            </div>
            <span class="rk-dept" :style="deptStyle(r.department)">{{ r.department || '—' }}</span>
          </div>
          <span v-if="r.growthRate != null" class="sm-trend" :class="trendCls(r.growthRate)">
            {{ trendArrow(r.growthRate) }} {{ Math.abs(r.growthRate) }}%
          </span>
          <div class="rk-amount">¥{{ wan(r.amount) }}<small>万</small></div>
          <span class="rk-ring" v-html="sanitizeSvg(ringSvg(rate(r.amount), 40))"></span>
        </div>
      </section>
    </template>

    <div v-else-if="!loading" class="sales-empty">
      <div class="se-icon"><el-icon><Trophy /></el-icon></div>
      <div class="se-text">本期暂无业绩数据</div>
      <div class="se-hint">有成交到款后,这里会实时排名</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { getSalesRank, type SalesRank } from '@/api/cockpit'
import { useUserStore } from '@/stores/user'
import { sanitizeSvg } from '@/utils/sanitize-html'

const loading = ref(false)
const period = ref('month')
const targetWan = ref(80)
const rows = ref<SalesRank[]>([])

// 当前登录人:用于高亮/定位"我在第几名"
const userStore = useUserStore()
const myName = computed(() => {
  const u: any = userStore.userInfo || {}
  return u.nickname || u.name || u.realName || u.userName || ''
})
const isMe = (r: SalesRank) => !!myName.value && r.employeeName === myName.value

const periodLabel = computed(() => (period.value === 'year' ? '本年' : period.value === 'quarter' ? '本季' : '本月'))

const DEPT_COLORS = ['#3370ff', '#14b8a6', '#ec4899', '#f59e0b', '#8b5cf6', '#06b6d4', '#ef4444']
function deptColor(d?: string): string {
  if (!d) return '#86909c'
  let h = 0
  for (let i = 0; i < d.length; i++) h = (h * 31 + d.charCodeAt(i)) >>> 0
  return DEPT_COLORS[h % DEPT_COLORS.length]
}
function deptStyle(d?: string) {
  const c = deptColor(d)
  return { color: c, background: c + '1a' }
}
const medal = (i: number) => ['#f5b301', '#a8b3c2', '#cd8a4a'][i] || '#c5ccd6'
const medalBg = (i: number) => [`linear-gradient(180deg,#f5b30133,#f5b3010d)`, `linear-gradient(180deg,#a8b3c233,#a8b3c20d)`, `linear-gradient(180deg,#cd8a4a33,#cd8a4a0d)`][i]
const wan = (amt: number) => (amt / 10000).toFixed(1)
// 目标随周期放大:本月×1 / 本季×3 / 本年×12(第3批接目标管理后替换为真实目标)
const periodFactor = computed(() => (period.value === 'year' ? 12 : period.value === 'quarter' ? 3 : 1))
const rate = (amt: number) => {
  const t = (targetWan.value || 80) * 10000 * periodFactor.value
  return t > 0 ? Math.round((amt / t) * 100) : 0
}
const rateColor = (r: number) => (r >= 100 ? '#00b42a' : r >= 85 ? '#3370ff' : '#ff7d00')

// 环比升降
const trendCls = (g?: number | null) => (g == null || g === 0 ? 'flat' : g > 0 ? 'up' : 'down')
const trendArrow = (g?: number | null) => (g == null || g === 0 ? '—' : g > 0 ? '▲' : '▼')

function ringSvg(p: number, sz = 44): string {
  const r = sz / 2 - 4
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.min(p, 100) / 100)
  const col = rateColor(p)
  return sanitizeSvg(`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">
    <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#eef0f3" stroke-width="5"/>
    <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/>
    <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-size="${(sz * 0.25).toFixed(0)}" font-weight="700" fill="${col}">${p}%</text>
  </svg>`)
}

// 前三名(领奖台顺序:2 - 1 - 3,高度 中-高-低)
const podium = computed(() => {
  const top = rows.value.slice(0, 3)
  const order = [1, 0, 2]
  const heights = [56, 86, 40]
  return order
    .map((i, k) => (top[i] ? { r: top[i], i, h: heights[k] } : null))
    .filter(Boolean) as { r: SalesRank; i: number; h: number }[]
})
const restRows = computed(() => rows.value.slice(3))

// 自动定位"我"到可视区
let meEl: HTMLElement | null = null
const setMeRef = (el: any, r: SalesRank) => {
  if (el && isMe(r)) meEl = el as HTMLElement
}

async function load() {
  loading.value = true
  meEl = null
  try {
    const res: any = await getSalesRank({ period: period.value })
    const data = (res?.data ?? res) as SalesRank[]
    rows.value = Array.isArray(data) ? data : []
    await nextTick()
    meEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  } catch (e: any) {
    ElMessage.error(e?.message || '加载排行失败')
    rows.value = []
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
@use '../../styles/sales-common.scss';

.rank-page { padding: 4px; }
.target-box { display: flex; align-items: center; gap: 6px; font-size: 13px; color: var(--text-body); white-space: nowrap; }

/* 领奖台 */
.podium {
  display: flex;
  align-items: flex-end;
  gap: 14px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 22px 18px 0;
  box-shadow: var(--shadow-card);
}
.pod-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; border-radius: 8px 10px 0 0; padding: 6px 4px 0; transition: background .18s; }
.pod-col.is-me { background: var(--el-color-primary-light-9); }
.pod-avatar-wrap { position: relative; }
.pod-avatar {
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 20px; font-weight: 600;
}
.pod-1 .pod-avatar { width: 58px; height: 58px; font-size: 24px; }
.pod-col.is-me .pod-avatar { box-shadow: 0 0 0 3px var(--el-color-primary-light-5); }
.pod-crown { position: absolute; top: -16px; left: 50%; transform: translateX(-50%); font-size: 20px; }
.me-badge {
  position: absolute; bottom: -4px; right: -6px;
  background: var(--brand-primary); color: #fff;
  font-size: 12px; font-weight: 700; line-height: 1;
  padding: 2px 5px; border-radius: 999px; border: 2px solid #fff;
  &.sm { position: static; margin-left: 6px; border: none; padding: 1px 5px; }
}
.pod-name { font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 7px 0 3px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pod-dept { font-size: 13px; padding: 1px 8px; border-radius: 5px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pod-amount { font-size: 15px; font-weight: 800; color: var(--text-primary); margin: 6px 0 2px; font-variant-numeric: tabular-nums; small { font-size: 13px; font-weight: 400; } }
.pod-trend { font-size: 12px; margin-bottom: 6px; }
.pod-ring { line-height: 0; margin: 4px 0 10px; }
.pod-base {
  width: 86%; border-radius: 8px 8px 0 0; border-top: 3px solid;
  display: flex; justify-content: center; padding-top: 6px;
  font-size: 20px; font-weight: 800;
}

/* 环形榜列表 */
.rank-list { background: #fff; border: 1px solid var(--border-color); border-radius: 12px; padding: 6px 16px; box-shadow: var(--shadow-card); }
.rank-row { display: flex; align-items: center; gap: 12px; padding: 11px 8px; margin: 0 -8px; border-top: 1px solid var(--border-soft); border-radius: 8px; transition: background .15s; }
.rank-row:first-child { border-top: none; }
.rank-row:hover { background: var(--bg-soft); }
.rank-row.is-me { background: var(--el-color-primary-light-9); }
.rank-row.is-me .rk-no { color: var(--brand-primary); }
.rk-no { width: 24px; text-align: center; font-size: 15px; font-weight: 700; color: var(--text-subtle); flex-shrink: 0; font-variant-numeric: tabular-nums; }
.rk-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--el-color-primary-light-5); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; flex-shrink: 0; }
.rk-meta { flex: 1; min-width: 0; }
.rk-name { font-size: 14px; font-weight: 600; color: var(--text-primary); display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rk-dept { display: inline-block; font-size: 13px; padding: 1px 8px; border-radius: 5px; margin-top: 2px; }
.rk-amount { font-size: 15px; font-weight: 700; color: var(--text-primary); font-variant-numeric: tabular-nums; flex-shrink: 0; small { font-size: 13px; font-weight: 400; color: var(--text-muted); } }
.rk-ring { line-height: 0; flex-shrink: 0; }
.sm-trend { font-size: 12px; flex-shrink: 0; }
</style>

<template>
  <div class="collision-manage">
    <!-- ========== Header ========== -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">线索 · 02.X</span>
        <span class="meta-divider"></span>
        <span class="meta-time">COLLISION CONTROL</span>
        <span class="meta-divider"></span>
        <span class="meta-time">4-LAYER · ANTI-DUPLICATE</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">撞单管理</span>
          <span class="title-en">Collision&nbsp;Resolution</span>
        </h1>
        <p class="page-desc">四层防撞单体系：录入查重 · 领取拦截 · 跨渠道比对 · 抢单仲裁</p>
      </div>

      <button class="back-btn" @click="back">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回运营管理</span>
      </button>
    </header>

    <!-- ========== Stat Cards ========== -->
    <section class="stat-grid">
      <article
        v-for="(card, idx) in statCards"
        :key="card.key"
        class="stat-card"
        :class="card.tone"
        :style="{ animationDelay: `${idx * 80}ms` }"
      >
        <div class="stat-head">
          <span class="stat-label">{{ card.label }}</span>
          <span class="stat-code">{{ card.code }}</span>
        </div>
        <div class="stat-value">
          <span class="num">{{ card.value }}</span>
          <span class="unit">{{ card.unit }}</span>
        </div>
        <div class="stat-foot">
          <span class="foot-icon"><el-icon :size="12"><component :is="card.icon" /></el-icon></span>
          <span class="foot-text">{{ card.foot }}</span>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill" :style="{ width: card.barWidth }"></div>
        </div>
      </article>
    </section>

    <!-- ========== 4层查重规则 + 冲突处理规则 ========== -->
    <section class="rules-grid">
      <article class="rules-card dedup">
        <div class="rc-head">
          <span class="rc-bar"></span>
          <span class="rc-title">4 层防撞单查重规则</span>
          <span class="rc-sub">DEDUP &middot; P0 &gt; P1 &gt; P2 &gt; P3</span>
        </div>
        <ul class="layer-list">
          <li v-for="(lv, i) in dedupLayers" :key="lv.code" class="layer-item" :class="lv.tone">
            <span class="lv-rank">{{ lv.code }}</span>
            <div class="lv-body">
              <div class="lv-title">{{ lv.title }}<span class="lv-strength">{{ lv.strength }}</span></div>
              <div class="lv-desc">{{ lv.desc }}</div>
            </div>
            <span class="lv-arrow" v-if="i &lt; dedupLayers.length - 1">
              <el-icon><DArrowRight /></el-icon>
            </span>
          </li>
        </ul>
      </article>

      <article class="rules-card handler">
        <div class="rc-head">
          <span class="rc-bar tone-violet"></span>
          <span class="rc-title">4 条冲突处理规则</span>
          <span class="rc-sub">RESOLUTION &middot; HANDBOOK</span>
        </div>
        <ul class="handler-list">
          <li v-for="h in handlerRules" :key="h.key" class="handler-item">
            <span class="hd-icon" :class="h.tone"><el-icon><component :is="h.icon" /></el-icon></span>
            <div class="hd-body">
              <div class="hd-title">{{ h.title }}</div>
              <div class="hd-desc">{{ h.desc }}</div>
            </div>
            <span class="hd-result">{{ h.result }}</span>
          </li>
        </ul>
      </article>
    </section>

    <!-- ========== Search Toolbar ========== -->
    <section class="toolbar">
      <div class="toolbar-aside">
        <span class="aside-line"></span>
        <span class="aside-text">FILTER</span>
      </div>
      <div class="toolbar-main">
        <el-form :model="searchForm" inline class="search-form">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="searchForm.dateRange"
              type="daterange"
              range-separator="—"
              start-placeholder="起始"
              end-placeholder="截止"
              value-format="YYYY-MM-DD"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="冲突类型">
            <el-select v-model="searchForm.conflictType" placeholder="全部" clearable style="width: 160px">
              <el-option label="同时跟进" value="same_time" />
              <el-option label="跨渠道重复" value="cross_channel" />
              <el-option label="重复录入" value="duplicate" />
              <el-option label="抢单冲突" value="grab_conflict" />
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 140px">
              <el-option label="待处理" :value="0" />
              <el-option label="已处理" :value="1" />
            </el-select>
          </el-form-item>
          <el-form-item label="客户名称">
            <el-input v-model="searchForm.keyword" placeholder="输入客户名称关键字" clearable style="width: 200px" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSearch">
              <el-icon><Search /></el-icon><span>查询</span>
            </el-button>
            <el-button @click="onReset">
              <el-icon><RefreshLeft /></el-icon><span>重置</span>
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </section>

    <!-- ========== Table ========== -->
    <section class="table-section">
      <div class="section-head">
        <h2 class="section-title">撞单记录流水</h2>
        <span class="section-sub">RECORD STREAM · {{ filteredRecords.length }} 条</span>
        <div class="head-spacer"></div>
        <div class="legend">
          <span class="legend-item"><i class="dot tone-amber"></i>同时跟进</span>
          <span class="legend-item"><i class="dot tone-violet"></i>跨渠道</span>
          <span class="legend-item"><i class="dot tone-rose"></i>重复录入</span>
          <span class="legend-item"><i class="dot tone-cyan"></i>抢单冲突</span>
        </div>
      </div>

      <el-table
        :data="pagedRecords"
        class="collision-table"
        stripe
        :header-cell-style="{ background: 'rgba(212,175,55,0.06)', color: '#D4AF37', fontWeight: 600 }"
      >
        <el-table-column label="发生时间" width="160">
          <template #default="{ row }">
            <span class="mono">{{ row.createTime }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户名称" prop="leadName" min-width="160">
          <template #default="{ row }">
            <span class="lead-name">{{ row.leadName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="冲突方 A" width="150">
          <template #default="{ row }">
            <span class="party party-a">A · {{ row.userAName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="冲突方 B" width="150">
          <template #default="{ row }">
            <span class="party party-b">B · {{ row.userBName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="冲突类型" width="130">
          <template #default="{ row }">
            <el-tag :type="conflictTagType(row.conflictType)" size="small" effect="dark">
              {{ conflictLabel(row.conflictType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="匹配字段" width="120">
          <template #default="{ row }">
            <span class="match-field">{{ row.matchField }}</span>
          </template>
        </el-table-column>
        <el-table-column label="处理结果" min-width="140">
          <template #default="{ row }">
            <span v-if="row.resolution" class="resolution">{{ resolutionLabel(row.resolution) }}</span>
            <span v-else class="muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <span class="status-pill" :class="row.status === 0 ? 'pending' : 'resolved'">
              <i class="pulse"></i>
              {{ row.status === 0 ? '待处理' : '已处理' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 0" link type="warning" @click="openResolve(row)">处理</el-button>
            <el-button link type="primary" @click="openDetail(row)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pager">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="filteredRecords.length"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </section>

    <!-- ========== Resolve Dialog ========== -->
    <el-dialog
      v-model="resolveVisible"
      title="处理撞单冲突"
      width="780px"
      class="collision-dialog"
      :close-on-click-modal="false"
      append-to-body
    >
      <div v-if="active" class="resolve-body">
        <div class="resolve-banner">
          <div class="banner-stripe"></div>
          <div class="banner-text">
            <span class="banner-title">{{ active.leadName }}</span>
            <span class="banner-sub">
              冲突类型 · {{ conflictLabel(active.conflictType) }} · 匹配字段 {{ active.matchField }}
            </span>
          </div>
          <span class="banner-id">#{{ String(active.id).padStart(6, '0') }}</span>
        </div>

        <div class="compare">
          <div class="compare-col col-a">
            <div class="col-tag">PARTY · A</div>
            <div class="col-name">{{ active.userAName }}</div>
            <ul class="col-meta">
              <li><span>所属团队</span><b>电销一组</b></li>
              <li><span>跟进时长</span><b>{{ active.detailA.followDays }} 天</b></li>
              <li><span>最近跟进</span><b>{{ active.detailA.lastFollow }}</b></li>
              <li><span>关联商机</span><b>{{ active.detailA.opportunity }}</b></li>
            </ul>
          </div>
          <div class="compare-vs">
            <div class="vs-glyph">VS</div>
            <div class="vs-line"></div>
          </div>
          <div class="compare-col col-b">
            <div class="col-tag">PARTY · B</div>
            <div class="col-name">{{ active.userBName }}</div>
            <ul class="col-meta">
              <li><span>所属团队</span><b>网销二组</b></li>
              <li><span>跟进时长</span><b>{{ active.detailB.followDays }} 天</b></li>
              <li><span>最近跟进</span><b>{{ active.detailB.lastFollow }}</b></li>
              <li><span>关联商机</span><b>{{ active.detailB.opportunity }}</b></li>
            </ul>
          </div>
        </div>

        <div class="resolution-area">
          <div class="area-title">处理方式</div>
          <el-radio-group v-model="resolveForm.resolution" class="resolution-group">
            <el-radio value="keep_a" border>A方归属（B转为协作人）</el-radio>
            <el-radio value="keep_b" border>B方归属（A转为协作人）</el-radio>
            <el-radio value="merge" border>合并客户（保留主单，合并信息）</el-radio>
            <el-radio value="cooperate" border>双方协作（设为协作关系）</el-radio>
          </el-radio-group>
        </div>

        <div class="resolution-detail">
          <div class="area-title">处理说明</div>
          <el-input
            v-model="resolveForm.detail"
            type="textarea"
            :rows="3"
            placeholder="请填写处理依据、补充说明（将记入处理日志）"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" :loading="resolving" @click="confirmResolve">
          <el-icon><Check /></el-icon><span>确认处理</span>
        </el-button>
      </template>
    </el-dialog>

    <!-- ========== Detail Drawer ========== -->
    <el-drawer
      v-model="detailVisible"
      direction="rtl"
      size="58%"
      class="collision-drawer"
      :with-header="false"
    >
      <div v-if="active" class="drawer-body">
        <div class="drawer-head">
          <div class="dh-meta">
            <span class="meta-tag">CASE · {{ String(active.id).padStart(6, '0') }}</span>
            <span class="meta-divider"></span>
            <span class="meta-time">{{ active.createTime }}</span>
          </div>
          <h2 class="dh-title">{{ active.leadName }}</h2>
          <p class="dh-sub">
            <el-tag :type="conflictTagType(active.conflictType)" size="small" effect="dark">
              {{ conflictLabel(active.conflictType) }}
            </el-tag>
            <span class="dh-field">匹配字段 · {{ active.matchField }}</span>
            <span class="status-pill" :class="active.status === 0 ? 'pending' : 'resolved'">
              <i class="pulse"></i>{{ active.status === 0 ? '待处理' : '已处理' }}
            </span>
          </p>
          <button class="drawer-close" @click="detailVisible = false">
            <el-icon><Close /></el-icon>
          </button>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><span class="bar"></span>冲突信息摘要</div>
          <div class="summary-grid">
            <div class="summary-item">
              <span class="si-label">发生时间</span>
              <span class="si-value mono">{{ active.createTime }}</span>
            </div>
            <div class="summary-item">
              <span class="si-label">冲突级别</span>
              <span class="si-value level">{{ levelLabel(active.conflictType) }}</span>
            </div>
            <div class="summary-item">
              <span class="si-label">触发来源</span>
              <span class="si-value">领取拦截 · 自动检测</span>
            </div>
            <div class="summary-item">
              <span class="si-label">影响范围</span>
              <span class="si-value">2 名销售 · 1 个商机</span>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><span class="bar"></span>双方对比</div>
          <div class="compare drawer-compare">
            <div class="compare-col col-a">
              <div class="col-tag">PARTY · A</div>
              <div class="col-name">{{ active.userAName }}</div>
              <ul class="col-meta">
                <li><span>所属团队</span><b>电销一组</b></li>
                <li><span>跟进时长</span><b>{{ active.detailA.followDays }} 天</b></li>
                <li><span>最近跟进</span><b>{{ active.detailA.lastFollow }}</b></li>
                <li><span>关联商机</span><b>{{ active.detailA.opportunity }}</b></li>
                <li><span>客户分级</span><b>A 级</b></li>
              </ul>
              <div class="follow-stream">
                <div class="fs-title">跟进记录</div>
                <div v-for="(f, i) in active.detailA.follows" :key="i" class="fs-row">
                  <span class="fs-time">{{ f.time }}</span>
                  <span class="fs-text">{{ f.text }}</span>
                </div>
              </div>
            </div>
            <div class="compare-vs">
              <div class="vs-glyph">VS</div>
              <div class="vs-line"></div>
            </div>
            <div class="compare-col col-b">
              <div class="col-tag">PARTY · B</div>
              <div class="col-name">{{ active.userBName }}</div>
              <ul class="col-meta">
                <li><span>所属团队</span><b>网销二组</b></li>
                <li><span>跟进时长</span><b>{{ active.detailB.followDays }} 天</b></li>
                <li><span>最近跟进</span><b>{{ active.detailB.lastFollow }}</b></li>
                <li><span>关联商机</span><b>{{ active.detailB.opportunity }}</b></li>
                <li><span>客户分级</span><b>B 级</b></li>
              </ul>
              <div class="follow-stream">
                <div class="fs-title">跟进记录</div>
                <div v-for="(f, i) in active.detailB.follows" :key="i" class="fs-row">
                  <span class="fs-time">{{ f.time }}</span>
                  <span class="fs-text">{{ f.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><span class="bar"></span>处理时间线</div>
          <ol class="timeline">
            <li class="tl-item done">
              <span class="tl-dot"></span>
              <div class="tl-body">
                <div class="tl-head"><b>检测发现</b><span class="mono">{{ active.createTime }}</span></div>
                <p>系统在领取拦截环节自动识别到匹配字段「{{ active.matchField }}」存在重复，触发撞单流程。</p>
              </div>
            </li>
            <li class="tl-item" :class="{ done: active.status === 1 }">
              <span class="tl-dot"></span>
              <div class="tl-body">
                <div class="tl-head"><b>仲裁处理</b>
                  <span class="mono">{{ active.resolvedTime || '—' }}</span>
                </div>
                <p v-if="active.resolution">
                  处理人 {{ active.resolvedByName || '系统管理员' }} 选择「{{ resolutionLabel(active.resolution) }}」。
                  {{ active.resolutionDetail }}
                </p>
                <p v-else class="muted">等待管理员介入处理…</p>
              </div>
            </li>
            <li class="tl-item" :class="{ done: active.status === 1 }">
              <span class="tl-dot"></span>
              <div class="tl-body">
                <div class="tl-head"><b>结果归档</b><span class="mono">{{ active.status === 1 ? active.resolvedTime : '待生成' }}</span></div>
                <p v-if="active.status === 1">归属调整完成，相关方已收到通知，撞单档案归入流水库。</p>
                <p v-else class="muted">仲裁完成后自动归档。</p>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeftBold, Search, RefreshLeft, Check, Close,
  WarningFilled, Loading, CircleCheck, DataLine,
  DArrowRight, Phone, Document, User, Connection
} from '@element-plus/icons-vue'
import { collisionApi, poolRulesMock } from '@/api/crm'

const router = useRouter()

interface FollowItem { time: string; text: string }
interface PartyDetail { followDays: number; lastFollow: string; opportunity: string; follows: FollowItem[] }
interface RecordRow {
  id: number
  leadId: number
  leadName: string
  userAId: number; userAName: string
  userBId: number; userBName: string
  conflictType: 'same_time' | 'cross_channel' | 'duplicate' | 'grab_conflict'
  matchField: string
  resolution?: string
  resolutionDetail?: string
  resolvedBy?: number
  resolvedByName?: string
  resolvedTime?: string
  status: 0 | 1
  createTime: string
  detailA: PartyDetail
  detailB: PartyDetail
}

/* ---------- 4层查重规则 ---------- */
const dedupLayers = [
  { code: 'P0', title: '手机号精确匹配', strength: '强查重', desc: '11位手机号完全一致 → 拒绝录入 / 拒绝领取（最高优先级）', tone: 'tone-rose' },
  { code: 'P1', title: '统一社会信用代码', strength: '强查重', desc: '18位企业信用代码完全一致 → 自动归并到原跟进人', tone: 'tone-amber' },
  { code: 'P2', title: '客户名称模糊匹配', strength: '弱查重', desc: '名称相似度 ≥ 85% 且省份一致 → 弹窗提示二次确认', tone: 'tone-violet' },
  { code: 'P3', title: '组合字段交叉匹配', strength: '辅助查重', desc: '联系人手机 + 邮箱 + 行业类目，任意 2 项命中即判定为可疑', tone: 'tone-cyan' }
]

/* ---------- 4条冲突处理规则 ---------- */
const handlerRules = [
  { key: 'same_time', title: '两人同时跟进', desc: '系统记录首次成功录入/领取时间戳，时间在前者拥有归属权', result: '首次录入者归属', icon: User, tone: 'tone-amber' },
  { key: 'cross', title: '跨渠道重复', desc: '不同渠道（电销 / 线上 / 渠道）录入同一客户，按 P0/P1 自动合并', result: '合并信息 · 原跟进人为主', icon: Connection, tone: 'tone-violet' },
  { key: 'leave', title: '离职交接冲突', desc: '员工离职后，其名下客户统一回收至公海，禁止任何形式私下交接', result: '统一回收 · 禁止私转', icon: Document, tone: 'tone-rose' },
  { key: 'grab', title: '并发抢单', desc: '协作公海池抢单按 1500ms 秒级分布式锁判定，先获锁者胜出', result: '先到先得 · 秒级锁', icon: Phone, tone: 'tone-cyan' }
]

/* ---------- Stat ---------- */
const statCards = [
  { key: 'total', label: '本月撞单总数', code: '#01', value: 32, unit: '起', icon: WarningFilled,
    foot: '环比上月 +12%', tone: 'tone-amber', barWidth: '78%' },
  { key: 'pending', label: '待处理', code: '#02', value: 10, unit: '起', icon: Loading,
    foot: '需 24h 内仲裁', tone: 'tone-rose', barWidth: '32%' },
  { key: 'done', label: '已处理', code: '#03', value: 22, unit: '起', icon: CircleCheck,
    foot: '处理时效 6.4h', tone: 'tone-emerald', barWidth: '68%' },
  { key: 'rate', label: '重复率', code: '#04', value: 4.5, unit: '%', icon: DataLine,
    foot: '健康阈值 < 5%', tone: 'tone-cyan', barWidth: '45%' }
]

/* ---------- Filter ---------- */
const searchForm = reactive({
  dateRange: [] as string[],
  conflictType: '',
  status: '' as '' | 0 | 1,
  keyword: ''
})
function onSearch() { page.current = 1 }
function onReset() {
  searchForm.dateRange = []; searchForm.conflictType = ''
  searchForm.status = ''; searchForm.keyword = ''
  page.current = 1
}

/* ---------- Records ---------- */
const aNames: string[] = []
const bNames: string[] = []
const leadNames: string[] = []
const fields = ['手机号', '统一信用代码', '客户名称', '联系人手机', '邮箱']
const types: RecordRow['conflictType'][] = ['same_time', 'cross_channel', 'duplicate', 'grab_conflict']
const resolutions = ['keep_a', 'keep_b', 'merge', 'cooperate']

function pad(n: number) { return n < 10 ? '0' + n : '' + n }
function buildPartyDetail(idx: number): PartyDetail {
  return {
    followDays: 6 + ((idx * 3) % 28),
    lastFollow: `2026-05-${pad(((idx * 7) % 24) + 1)} 1${idx % 9}:${pad((idx * 11) % 60)}`,
    opportunity: idx % 3 === 0 ? '已建商机 · 意向 60%' : (idx % 3 === 1 ? '初步沟通' : '已报价'),
    follows: [
      { time: `2026-05-${pad((idx % 20) + 1)}`, text: '电话沟通需求，对方表达初步意向' },
      { time: `2026-05-${pad(((idx + 4) % 20) + 1)}`, text: '微信发送方案资料，等待回复' },
      { time: `2026-05-${pad(((idx + 9) % 20) + 1)}`, text: '约定下周线下拜访' }
    ]
  }
}

const records = ref<RecordRow[]>([])

/* ---------- 从 poolRulesMock 合并真实撞单事件 ---------- */
function syncCollisionEvents() {
  try {
    const events: any[] = (poolRulesMock as any).getCollisionEvents?.() || []
    if (!events.length) return
    const existedIds = new Set(records.value.map(r => r.id))
    const newOnes: RecordRow[] = []
    events.forEach((e: any, idx: number) => {
      const id = 200000 + idx
      if (existedIds.has(id)) return
      const t: RecordRow['conflictType'] = e.type === 'lock_failed'
        ? 'grab_conflict'
        : (e.type === 'cooldown_block' ? 'duplicate' : 'same_time')
      newOnes.push({
        id,
        leadId: e.leadId || (8000 + idx),
        leadName: e.leadName || `撞单事件 ${idx + 1}`,
        userAId: e.userAId || 0,
        userAName: e.userAName || e.holderName || '原跟进人',
        userBId: e.userBId || 0,
        userBName: e.userBName || e.userName || '当前用户',
        conflictType: t,
        matchField: e.field || '客户名称',
        status: 0,
        createTime: e.time || new Date().toISOString().slice(0, 16).replace('T', ' '),
        detailA: buildPartyDetail(idx),
        detailB: buildPartyDetail(idx + 3)
      })
    })
    if (newOnes.length) records.value = [...newOnes, ...records.value]
  } catch { /* ignore */ }
}
syncCollisionEvents()

/* ---------- 真实拉取撞单记录(后端 /crm/collision/log,IPage) ---------- */
function mapCollisionRow(r: any, idx: number): RecordRow {
  return {
    id: r.id,
    leadId: r.leadId || 0,
    leadName: r.leadName || `线索 ${r.leadId || ''}`,
    userAId: r.userAId || 0,
    userAName: r.userAName || (r.userAId ? `用户${r.userAId}` : '原跟进人'),
    userBId: r.userBId || 0,
    userBName: r.userBName || (r.userBId ? `用户${r.userBId}` : '当前用户'),
    conflictType: (['same_time', 'cross_channel', 'duplicate', 'grab_conflict'] as readonly string[]).includes(r.conflictType)
      ? r.conflictType : 'same_time',
    matchField: r.matchField || '客户名称',
    resolution: r.resolution || undefined,
    resolutionDetail: r.resolutionDetail || undefined,
    resolvedBy: r.resolvedBy || undefined,
    resolvedTime: r.resolvedTime || undefined,
    status: r.status === 1 ? 1 : 0,
    createTime: (r.createTime || '').slice(0, 16),
    detailA: buildPartyDetail(idx),
    detailB: buildPartyDetail(idx + 3)
  }
}

async function fetchRecords() {
  try {
    const resp: any = await collisionApi.getCollisionLog({ pageNum: 1, pageSize: 100 } as any)
    const data = resp?.data ?? resp
    const rows = data && (data.records || data.list)
    if (Array.isArray(rows) && rows.length) {
      records.value = rows.map(mapCollisionRow)
    }
  } catch { /* 后端不可用时保留 mock 事件 */ }
}
fetchRecords()

/* ---------- Computed ---------- */
const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (searchForm.conflictType && r.conflictType !== searchForm.conflictType) return false
    if (searchForm.status !== '' && r.status !== searchForm.status) return false
    if (searchForm.keyword && !r.leadName.includes(searchForm.keyword)) return false
    return true
  })
})

const page = reactive({ current: 1, size: 10 })
const pagedRecords = computed(() =>
  filteredRecords.value.slice((page.current - 1) * page.size, page.current * page.size)
)

/* ---------- Labels ---------- */
function conflictLabel(t: string) {
  return ({ same_time: '同时跟进', cross_channel: '跨渠道重复', duplicate: '重复录入', grab_conflict: '抢单冲突' } as any)[t]
}
function conflictTagType(t: string): 'warning' | 'info' | 'danger' | 'primary' {
  return ({ same_time: 'warning', cross_channel: 'info', duplicate: 'danger', grab_conflict: 'primary' } as any)[t]
}
function levelLabel(t: string) {
  return ({ same_time: '中危 · M2', cross_channel: '高危 · H1', duplicate: '高危 · H2', grab_conflict: '中危 · M1' } as any)[t]
}
function resolutionLabel(r: string) {
  return ({ keep_a: 'A方归属 · B协作', keep_b: 'B方归属 · A协作', merge: '合并客户', cooperate: '双方协作' } as any)[r]
}

/* ---------- Resolve / Detail ---------- */
const resolveVisible = ref(false)
const detailVisible = ref(false)
const active = ref<RecordRow | null>(null)
const resolving = ref(false)
const resolveForm = reactive({ resolution: 'keep_a', detail: '' })

function openResolve(row: RecordRow) {
  active.value = row
  resolveForm.resolution = 'keep_a'
  resolveForm.detail = ''
  resolveVisible.value = true
}
function openDetail(row: RecordRow) {
  active.value = row
  detailVisible.value = true
}
async function confirmResolve() {
  if (!active.value) return
  if (!resolveForm.detail.trim()) {
    ElMessage.warning('请填写处理说明，便于追溯')
    return
  }
  resolving.value = true
  try {
    await collisionApi.resolveConflict({
      id: active.value.id,
      resolution: resolveForm.resolution,
      detail: resolveForm.detail
    }).catch(() => null) // mock 容错
    const row = records.value.find(r => r.id === active.value!.id)
    if (row) {
      row.status = 1
      row.resolution = resolveForm.resolution
      row.resolutionDetail = resolveForm.detail
      row.resolvedTime = new Date().toISOString().slice(0, 16).replace('T', ' ')
      row.resolvedByName = '当前管理员'
    }
    ElMessage.success('撞单已处理，归属与协作关系已同步更新')
    resolveVisible.value = false
  } finally {
    resolving.value = false
  }
}

function back() { router.push('/leads/operation') }
</script>

<style lang="scss" scoped>
.collision-manage {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 8px 4px 32px;
  color: var(--text-body, #B8B8C0);
}

/* ========== Header ========== */
.page-header {
  position: relative;
  padding: 30px 36px 28px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1418 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.7), transparent);
  }
  &::after {
    content: '';
    position: absolute; inset: 0;
    background-image:
      repeating-linear-gradient(45deg, transparent 0 18px, rgba(245, 158, 11, 0.04) 18px 19px),
      linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px);
    background-size: auto, 40px 40px, 40px 40px;
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', ui-monospace, monospace;
  font-size: 11px; letter-spacing: 0.18em;
  color: #F59E0B; margin-bottom: 14px; position: relative; z-index: 1;
}
.meta-tag {
  padding: 3px 10px;
  border: 1px solid rgba(245, 158, 11, 0.4);
  border-radius: 2px;
  background: rgba(245, 158, 11, 0.06);
}
.meta-divider { width: 24px; height: 1px; background: rgba(245, 158, 11, 0.4); }
.meta-time { color: rgba(245, 158, 11, 0.65); }

.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 10px;
  .title-cn {
    font-size: 34px; font-weight: 700; letter-spacing: 0.04em;
    color: var(--text-primary, #F5F5F5);
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(245, 158, 11, 0.65);
  }
}
.page-desc { font-size: 13.5px; color: var(--text-body, #B8B8C0); margin: 0; }

.back-btn {
  position: absolute; top: 28px; right: 36px; z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #F59E0B; font-size: 13px; cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: rgba(245, 158, 11, 0.15);
    border-color: rgba(245, 158, 11, 0.5);
    transform: translateX(-2px);
  }
}

/* ========== Stat Grid ========== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-card {
  --tone: #F59E0B;
  position: relative;
  padding: 18px 22px 16px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 10px;
  overflow: hidden;
  opacity: 0;
  animation: fadeUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;

  &::before {
    content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
    background: var(--tone);
  }
  &::after {
    content: ''; position: absolute; right: -30px; top: -30px;
    width: 120px; height: 120px;
    background: radial-gradient(circle, color-mix(in srgb, var(--tone) 25%, transparent), transparent 70%);
    pointer-events: none;
  }
  &.tone-amber { --tone: #F59E0B; }
  &.tone-rose { --tone: #EF4444; }
  &.tone-emerald { --tone: #10B981; }
  &.tone-cyan { --tone: #06B6D4; }
  &.tone-violet { --tone: #A78BFA; }
}
.stat-head {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 12px;
}
.stat-label { font-size: 12.5px; color: var(--text-muted, #888); letter-spacing: 0.04em; }
.stat-code {
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  letter-spacing: 0.2em; color: rgba(245, 158, 11, 0.55);
  padding: 2px 6px; border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 2px;
}
.stat-value {
  display: flex; align-items: baseline; gap: 6px;
  margin-bottom: 8px;
  .num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 32px; font-weight: 700; line-height: 1;
    color: var(--tone);
  }
  .unit { font-size: 12px; color: var(--text-muted, #888); }
}
.stat-foot {
  display: flex; align-items: center; gap: 6px;
  font-size: 11.5px; color: var(--text-muted, #888);
  .foot-icon { color: var(--tone); }
}
.stat-bar {
  margin-top: 12px; height: 3px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 2px; overflow: hidden;
}
.stat-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--tone), color-mix(in srgb, var(--tone) 30%, transparent));
  border-radius: 2px;
}

/* ========== Rules Grid (4层查重 + 4条处理) ========== */
.rules-grid {
  display: grid;
  grid-template-columns: 1.15fr 1fr;
  gap: 16px;
}
.rules-card {
  padding: 18px 22px 16px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.14);
  border-radius: 10px;
  position: relative;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
  }
}
.rc-head {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  .rc-bar {
    width: 3px; height: 14px; background: #F59E0B; border-radius: 1px;
    &.tone-violet { background: #A78BFA; }
  }
  .rc-title {
    font-size: 14px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  .rc-sub {
    margin-left: auto;
    font-family: 'JetBrains Mono', monospace; font-size: 10.5px;
    letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.5);
  }
}
.layer-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.layer-item {
  --tone: #F59E0B;
  position: relative;
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px 10px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-left: 3px solid var(--tone);
  border-radius: 6px;
  &.tone-rose { --tone: #EF4444; }
  &.tone-amber { --tone: #F59E0B; }
  &.tone-violet { --tone: #A78BFA; }
  &.tone-cyan { --tone: #06B6D4; }
  .lv-rank {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; font-weight: 700;
    color: var(--tone);
    padding: 4px 10px;
    background: color-mix(in srgb, var(--tone) 12%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 30%, transparent);
    border-radius: 4px;
    min-width: 38px; text-align: center;
  }
  .lv-body { flex: 1; min-width: 0; }
  .lv-title {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 3px;
    display: flex; align-items: center; gap: 8px;
  }
  .lv-strength {
    font-size: 10.5px; padding: 1px 6px;
    border-radius: 2px;
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    color: var(--tone);
    border: 1px solid color-mix(in srgb, var(--tone) 28%, transparent);
  }
  .lv-desc {
    font-size: 12px; line-height: 1.55;
    color: var(--text-body, #B8B8C0);
  }
  .lv-arrow {
    position: absolute; left: 22px; bottom: -10px; z-index: 2;
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    color: rgba(212, 175, 55, 0.6); transform: rotate(90deg);
  }
}
.handler-list {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 8px;
}
.handler-item {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 6px;
  .hd-icon {
    --tone: #F59E0B;
    width: 30px; height: 30px;
    display: flex; align-items: center; justify-content: center;
    background: color-mix(in srgb, var(--tone) 14%, transparent);
    border: 1px solid color-mix(in srgb, var(--tone) 28%, transparent);
    border-radius: 6px;
    color: var(--tone);
    flex-shrink: 0;
    &.tone-amber { --tone: #F59E0B; }
    &.tone-rose { --tone: #EF4444; }
    &.tone-violet { --tone: #A78BFA; }
    &.tone-cyan { --tone: #06B6D4; }
  }
  .hd-body { flex: 1; min-width: 0; }
  .hd-title {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 2px;
  }
  .hd-desc {
    font-size: 11.5px; line-height: 1.5;
    color: var(--text-body, #B8B8C0);
  }
  .hd-result {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #10B981;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.25);
    padding: 4px 10px; border-radius: 2px;
    flex-shrink: 0;
  }
}

/* ========== Toolbar ========== */
.toolbar {
  display: flex; gap: 16px;
  padding: 18px 22px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
}
.toolbar-aside {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding-right: 16px; border-right: 1px dashed rgba(212, 175, 55, 0.15);
  .aside-line { width: 2px; height: 24px; background: #F59E0B; }
  .aside-text {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.25em; color: rgba(245, 158, 11, 0.55);
    writing-mode: vertical-rl; transform: rotate(180deg);
  }
}
.toolbar-main { flex: 1; }
.search-form { :deep(.el-form-item) { margin-bottom: 0; } }

/* ========== Table Section ========== */
.table-section {
  padding: 22px 24px 16px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
}
.section-head {
  display: flex; align-items: center; gap: 14px;
  margin-bottom: 14px;
}
.section-title {
  font-size: 16px; font-weight: 600;
  color: var(--text-primary, #F5F5F5); margin: 0;
  position: relative; padding-left: 14px;
  &::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 14px; background: #F59E0B; border-radius: 1px;
  }
}
.section-sub {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.45);
}
.head-spacer { flex: 1; }
.legend {
  display: flex; gap: 14px;
  font-size: 11.5px; color: var(--text-muted, #888);
  .legend-item { display: inline-flex; align-items: center; gap: 6px; }
  .dot {
    display: inline-block; width: 8px; height: 8px; border-radius: 2px;
    &.tone-amber { background: #F59E0B; }
    &.tone-violet { background: #A78BFA; }
    &.tone-rose { background: #EF4444; }
    &.tone-cyan { background: #06B6D4; }
  }
}

.collision-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  background: transparent;
}
:deep(.collision-table) {
  background: transparent;
  th.el-table__cell { background: rgba(212, 175, 55, 0.06) !important; }
  tr, td.el-table__cell { background: transparent !important; }
  tr:hover > td.el-table__cell { background: rgba(245, 158, 11, 0.04) !important; }
  .el-table__row--striped td.el-table__cell { background: rgba(255, 255, 255, 0.02) !important; }
  .el-table, .el-table__inner-wrapper, .cell { color: var(--text-body, #B8B8C0); }
  .el-table__border-left-patch, .el-table__border, td.el-table__cell, th.el-table__cell {
    border-bottom-color: rgba(212, 175, 55, 0.1) !important;
  }
}
.mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: rgba(212, 175, 55, 0.85); }
.lead-name { color: var(--text-primary, #F5F5F5); font-weight: 500; }
.party {
  display: inline-block; padding: 2px 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 2px; font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  &.party-a { color: #06B6D4; border-color: rgba(6, 182, 212, 0.3); background: rgba(6, 182, 212, 0.06); }
  &.party-b { color: #A78BFA; border-color: rgba(167, 139, 250, 0.3); background: rgba(167, 139, 250, 0.06); }
}
.match-field {
  display: inline-block; padding: 2px 8px;
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B; font-size: 12px;
  border-radius: 2px;
}
.resolution { color: #10B981; font-size: 12.5px; }
.muted { color: rgba(255, 255, 255, 0.25); }

.status-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 2px 10px; border-radius: 999px;
  font-size: 11.5px; letter-spacing: 0.05em;
  border: 1px solid transparent;
  .pulse {
    width: 6px; height: 6px; border-radius: 50%;
    box-shadow: 0 0 0 0 currentColor;
    animation: pulse 1.8s infinite;
  }
  &.pending {
    color: #EF4444;
    background: rgba(239, 68, 68, 0.08);
    border-color: rgba(239, 68, 68, 0.3);
    .pulse { background: #EF4444; }
  }
  &.resolved {
    color: #10B981;
    background: rgba(16, 185, 129, 0.08);
    border-color: rgba(16, 185, 129, 0.3);
    .pulse { background: #10B981; animation: none; }
  }
}
.pager { display: flex; justify-content: flex-end; margin-top: 16px; }

/* ========== Resolve Dialog ========== */
:deep(.collision-dialog) {
  background: #14141C;
  border: 1px solid rgba(212, 175, 55, 0.18);
  .el-dialog__header { border-bottom: 1px solid rgba(212, 175, 55, 0.1); padding: 16px 20px; }
  .el-dialog__title { color: var(--text-primary, #F5F5F5); font-weight: 600; }
  .el-dialog__body { padding: 20px; }
  .el-dialog__footer { border-top: 1px solid rgba(212, 175, 55, 0.1); padding: 14px 20px; }
}
.resolve-banner {
  display: flex; align-items: center; gap: 14px;
  padding: 14px 18px;
  background:
    repeating-linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0 8px, transparent 8px 16px),
    rgba(245, 158, 11, 0.04);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 8px; margin-bottom: 18px;
  .banner-stripe { width: 4px; height: 36px; background: #F59E0B; border-radius: 2px; }
  .banner-text { flex: 1; }
  .banner-title {
    display: block; font-size: 16px; font-weight: 600;
    color: var(--text-primary, #F5F5F5); margin-bottom: 2px;
  }
  .banner-sub { font-size: 12px; color: var(--text-muted, #aaa); }
  .banner-id {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: rgba(245, 158, 11, 0.7);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 4px 8px; border-radius: 2px;
  }
}
.compare {
  display: grid; grid-template-columns: 1fr auto 1fr;
  gap: 0;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px; overflow: hidden;
}
.compare-col {
  padding: 18px 20px;
  background: rgba(255, 255, 255, 0.015);
  &.col-a { border-right: 1px dashed rgba(212, 175, 55, 0.1); }
  .col-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.25em;
    color: var(--col-tone, #06B6D4);
    margin-bottom: 6px;
  }
  &.col-a .col-tag { --col-tone: #06B6D4; }
  &.col-b .col-tag { --col-tone: #A78BFA; }
  .col-name {
    font-size: 17px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 12px;
  }
  .col-meta {
    list-style: none; margin: 0; padding: 0;
    li {
      display: flex; justify-content: space-between;
      padding: 6px 0; font-size: 12.5px;
      border-bottom: 1px dashed rgba(212, 175, 55, 0.08);
      span { color: var(--text-muted, #888); }
      b { color: var(--text-primary, #F5F5F5); font-weight: 500; }
      &:last-child { border-bottom: none; }
    }
  }
}
.compare-vs {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 0 16px;
  .vs-glyph {
    font-family: 'Playfair Display', serif; font-style: italic;
    font-size: 22px; font-weight: 700;
    background: linear-gradient(180deg, #06B6D4, #A78BFA);
    -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .vs-line { width: 1px; height: 40px; background: linear-gradient(180deg, #06B6D4, #A78BFA); margin-top: 6px; }
}
.resolution-area, .resolution-detail { margin-top: 18px; }
.area-title {
  font-size: 13px; font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  margin-bottom: 10px;
  position: relative; padding-left: 10px;
  &::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%);
    width: 3px; height: 12px; background: #F59E0B;
  }
}
.resolution-group {
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
  :deep(.el-radio.is-bordered) {
    width: 100%; margin: 0;
    background: rgba(255, 255, 255, 0.02);
    border-color: rgba(212, 175, 55, 0.15);
    height: auto; padding: 10px 14px;
    &.is-checked { border-color: #F59E0B; background: rgba(245, 158, 11, 0.08); }
    .el-radio__label { color: var(--text-body, #B8B8C0); font-size: 13px; }
    &.is-checked .el-radio__label { color: #F59E0B; }
  }
}

/* ========== Drawer ========== */
:deep(.collision-drawer) {
  background: #12121A;
  .el-drawer__body { padding: 0; }
}
.drawer-body { display: flex; flex-direction: column; height: 100%; overflow-y: auto; }
.drawer-head {
  position: relative;
  padding: 28px 32px 22px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
  background: linear-gradient(135deg, #14141C 0%, #1A1A24 100%);

  .dh-meta {
    display: flex; align-items: center; gap: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px; letter-spacing: 0.18em;
    color: #F59E0B; margin-bottom: 12px;
  }
  .dh-title {
    margin: 0 0 8px; font-size: 24px; font-weight: 700;
    color: var(--text-primary, #F5F5F5); letter-spacing: 0.02em;
  }
  .dh-sub {
    display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
    margin: 0; font-size: 12.5px; color: var(--text-muted, #888);
    .dh-field {
      padding: 2px 8px; border: 1px solid rgba(212, 175, 55, 0.2);
      color: rgba(212, 175, 55, 0.85); border-radius: 2px;
      font-family: 'JetBrains Mono', monospace; font-size: 11px;
    }
  }
}
.drawer-close {
  position: absolute; top: 22px; right: 22px;
  width: 32px; height: 32px; border-radius: 4px;
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #F59E0B; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  &:hover { background: rgba(245, 158, 11, 0.15); transform: rotate(90deg); }
}
.drawer-section {
  padding: 22px 32px;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.08);
  &:last-child { border-bottom: none; }
}
.ds-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 14px; font-weight: 600;
  color: var(--text-primary, #F5F5F5);
  margin-bottom: 14px;
  .bar { width: 3px; height: 14px; background: #F59E0B; border-radius: 1px; }
}
.summary-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.summary-item {
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(212, 175, 55, 0.08);
  border-radius: 6px;
  display: flex; flex-direction: column; gap: 4px;
  .si-label { font-size: 11px; color: var(--text-muted, #888); letter-spacing: 0.05em; }
  .si-value { font-size: 13.5px; color: var(--text-primary, #F5F5F5); font-weight: 500; }
  .si-value.level { color: #EF4444; }
}
.drawer-compare {
  .compare-col { background: rgba(255, 255, 255, 0.015); }
}
.follow-stream {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(212, 175, 55, 0.1);
  .fs-title {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    letter-spacing: 0.2em; color: rgba(212, 175, 55, 0.55);
    margin-bottom: 8px;
  }
  .fs-row {
    display: flex; gap: 10px; font-size: 12px;
    padding: 5px 0; align-items: baseline;
    .fs-time {
      font-family: 'JetBrains Mono', monospace;
      color: rgba(212, 175, 55, 0.7);
      flex-shrink: 0; min-width: 90px;
    }
    .fs-text { color: var(--text-body, #B8B8C0); }
  }
}

.timeline {
  list-style: none; margin: 0; padding: 0 0 0 18px;
  position: relative;
  &::before {
    content: ''; position: absolute; left: 4px; top: 6px; bottom: 6px;
    width: 1px; background: rgba(212, 175, 55, 0.15);
  }
  .tl-item {
    position: relative; padding: 0 0 18px 18px;
    .tl-dot {
      position: absolute; left: -18px; top: 6px;
      width: 9px; height: 9px; border-radius: 50%;
      border: 2px solid rgba(245, 158, 11, 0.3);
      background: #14141C;
    }
    &.done .tl-dot {
      background: #F59E0B;
      border-color: rgba(245, 158, 11, 0.5);
      box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
    }
  }
  .tl-head {
    display: flex; align-items: baseline; gap: 12px;
    margin-bottom: 4px;
    b { font-size: 14px; color: var(--text-primary, #F5F5F5); font-weight: 600; }
    .mono { font-size: 11.5px; color: rgba(212, 175, 55, 0.6); }
  }
  .tl-body p {
    margin: 0; font-size: 12.5px; line-height: 1.7;
    color: var(--text-body, #B8B8C0);
  }
  .muted { color: rgba(255, 255, 255, 0.3); font-style: italic; }
}

/* ========== Animations ========== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 currentColor; }
  70% { box-shadow: 0 0 0 6px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

@media (max-width: 1280px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
  .resolution-group { grid-template-columns: 1fr; }
  .rules-grid { grid-template-columns: 1fr; }
}
@media (max-width: 900px) {
  .compare { grid-template-columns: 1fr; }
  .compare-vs { padding: 10px 0; .vs-line { width: 40px; height: 1px; } }
  .compare-col.col-a { border-right: none; border-bottom: 1px dashed rgba(212, 175, 55, 0.1); }
}
</style>

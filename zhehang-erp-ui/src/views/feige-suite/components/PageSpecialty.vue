<template>
  <section v-if="page.kind === 'dashboard' || page.kind === 'analysis'" class="specialty dashboard-specialty">
    <div class="metric-grid">
      <div v-for="(label, index) in labels" :key="label" class="metric-item">
        <span>{{ label }}</span>
        <strong>{{ metricValue(index) }}</strong>
        <small>{{ index % 2 ? '较上期 +6.8%' : 'LOCAL-DEMO实时汇总' }}</small>
      </div>
    </div>
    <div class="trend-panel">
      <div class="trend-head"><strong>{{ page.kind === 'analysis' ? '结构分析' : '完成趋势' }}</strong><span>最近6个周期</span></div>
      <div class="bars">
        <div v-for="(height, index) in barHeights" :key="index" class="bar-cell">
          <div class="bar" :style="{ height: `${height}%`, background: groupColor }"><span>{{ height }}</span></div>
          <small>{{ index + 1 }}期</small>
        </div>
      </div>
    </div>
  </section>

  <section v-else-if="page.kind === 'exam'" class="specialty exam-specialty">
    <article v-for="record in records.slice(0, 2)" :key="record.id" class="exam-card">
      <div class="exam-card-top">
        <strong>{{ record.title }}</strong>
        <el-tag :type="record.status === 'completed' ? 'success' : 'primary'">{{ statusLabel(record.status) }}</el-tag>
      </div>
      <p>{{ record.data?.description || record.data?.customerSays || 'LOCAL-DEMO：按真实旧页面结构展示考试说明、题量、时限和及格标准。' }}</p>
      <div class="exam-meta">
        <span><el-icon><Document /></el-icon>{{ record.data?.questionCount || 5 }}题</span>
        <span><el-icon><Timer /></el-icon>{{ record.data?.duration || 30 }}分钟</span>
        <span><el-icon><CircleCheck /></el-icon>及格{{ record.data?.passScore || 60 }}分</span>
      </div>
      <div class="exam-actions">
        <strong v-if="record.status === 'completed'" class="score">得分 {{ record.data?.score || 88 }}</strong>
        <el-button v-else type="primary" @click="$emit('run-action', record, 'start')">开始</el-button>
        <el-button v-if="record.status === 'completed'" @click="$emit('view', record)">查看详情</el-button>
      </div>
    </article>
  </section>

  <section v-else-if="page.kind === 'handover'" class="specialty handover-specialty">
    <el-steps :active="handoverStep" finish-status="success" align-center>
      <el-step title="发起申请" description="填写交接资料" />
      <el-step title="主管审核" description="核对客户与事项" />
      <el-step title="接收确认" description="确认责任转移" />
      <el-step title="交接完成" description="保留完整留痕" />
    </el-steps>
    <div class="handover-note">
      <el-icon><InfoFilled /></el-icon>
      <span>交接前后负责人、客户清单、未办事项和审核意见都会写入独立操作记录。</span>
    </div>
  </section>

  <section v-else-if="page.kind === 'salary'" class="specialty salary-specialty">
    <div class="salary-total">
      <span>{{ page.title }}合计</span>
      <strong>¥{{ money(totalMoney) }}</strong>
      <small>当前筛选范围 · LOCAL-DEMO</small>
    </div>
    <div class="salary-stage" v-for="item in salaryStages" :key="item.status">
      <span>{{ item.label }}</span>
      <strong>{{ item.count }}人</strong>
      <el-progress :percentage="item.percent" :stroke-width="8" :show-text="false" />
    </div>
  </section>

  <section v-else-if="page.kind === 'config'" class="specialty config-specialty">
    <el-icon><SetUp /></el-icon>
    <div><strong>配置生效范围</strong><p>当前页面的启停、排序和规则版本均独立保存；停用后不删除历史业务记录。</p></div>
    <el-tag type="warning" effect="plain">变更留痕</el-tag>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CircleCheck, Document, InfoFilled, SetUp, Timer } from '@element-plus/icons-vue'
import type { FeigeSuiteRecord } from '@/api/feige-suite'
import { FEIGE_SUITE_GROUPS } from '../catalog'
import type { FeigeSuitePageConfig } from '../types'

const props = defineProps<{ page: FeigeSuitePageConfig; records: FeigeSuiteRecord[]; total: number; statuses: Record<string, number> }>()
defineEmits<{ 'run-action': [record: FeigeSuiteRecord, action: string]; view: [record: FeigeSuiteRecord] }>()

const labels = computed(() => props.page.statLabels?.length ? props.page.statLabels : ['记录总数', '进行中', '已完成', '完成率'])
const groupColor = computed(() => FEIGE_SUITE_GROUPS.find((group) => group.code === props.page.group)?.color || '#2563eb')
const barHeights = computed(() => [42, 55, 48, 68, 76, Math.min(94, 62 + props.total)])
const totalMoney = computed(() => props.records.reduce((sum, item) => sum + Number(item.amount || item.data?.netSalary || item.data?.commission || 0), 0))
const handoverStep = computed(() => props.statuses.completed ? 4 : props.statuses.approved ? 3 : props.statuses.pending ? 2 : 1)
const salaryStages = computed(() => [
  { status: 'draft', label: '待生成', count: props.statuses.draft || 0 },
  { status: 'pending', label: '待审核', count: props.statuses.pending || 0 },
  { status: 'approved', label: '待发放', count: props.statuses.approved || 0 },
  { status: 'paid', label: '已发放', count: props.statuses.paid || 0 }
].map((item) => ({ ...item, percent: props.total ? Math.round(item.count / props.total * 100) : 0 })))

function metricValue(index: number): string {
  if (index === 0) return String(props.total)
  if (index === 1) return String((props.statuses.active || 0) + (props.statuses.pending || 0) + (props.statuses.in_progress || 0))
  if (index === 2) return String((props.statuses.completed || 0) + (props.statuses.approved || 0) + (props.statuses.paid || 0))
  const done = (props.statuses.completed || 0) + (props.statuses.approved || 0) + (props.statuses.paid || 0)
  return `${props.total ? Math.round(done / props.total * 100) : 0}%`
}
function money(value: number): string { return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
function statusLabel(status: string): string { return ({ pending: '待开始', in_progress: '进行中', completed: '已完成' } as Record<string, string>)[status] || status }
</script>

<style scoped>
.specialty { margin-bottom: 16px; }
.metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; overflow: hidden; }
.metric-item { min-height: 102px; padding: 17px 20px; border-right: 1px solid #e2e8f0; }
.metric-item:last-child { border-right: 0; }
.metric-item span, .salary-total span { display: block; color: #64748b; font-size: 14px; }
.metric-item strong { display: block; margin-top: 7px; font-size: 28px; color: #0f172a; }
.metric-item small, .salary-total small { color: #94a3b8; }
.trend-panel { margin-top: 12px; padding: 18px 22px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
.trend-head { display: flex; justify-content: space-between; color: #64748b; }
.trend-head strong { color: #1e293b; font-size: 16px; }
.bars { display: flex; align-items: flex-end; gap: 26px; height: 150px; margin-top: 16px; padding: 0 3%; border-bottom: 1px solid #cbd5e1; }
.bar-cell { display: flex; flex: 1; height: 100%; flex-direction: column; justify-content: flex-end; align-items: center; gap: 7px; }
.bar { position: relative; width: min(52px, 70%); min-height: 12px; border-radius: 4px 4px 0 0; opacity: .86; }
.bar span { position: absolute; top: -22px; left: 50%; transform: translateX(-50%); font-size: 12px; color: #64748b; }
.bar-cell small { color: #64748b; }
.exam-specialty { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.exam-card { padding: 17px; border: 1px solid #dbe4f0; border-radius: 6px; background: #fff; }
.exam-card-top, .exam-actions { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.exam-card-top strong { font-size: 17px; color: #1e293b; }
.exam-card p { min-height: 44px; margin: 12px 0; color: #64748b; line-height: 22px; }
.exam-meta { display: flex; flex-wrap: wrap; gap: 16px; padding: 11px 0; border-top: 1px dashed #dbe4f0; border-bottom: 1px dashed #dbe4f0; color: #64748b; }
.exam-meta span { display: inline-flex; align-items: center; gap: 5px; }
.exam-actions { margin-top: 13px; justify-content: flex-end; }
.score { margin-right: auto; color: #16a34a; font-size: 18px; }
.handover-specialty { padding: 22px 18px 15px; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; }
.handover-note { display: flex; align-items: center; gap: 8px; margin-top: 24px; padding: 10px 12px; color: #475569; background: #f8fafc; border-radius: 5px; }
.salary-specialty { display: grid; grid-template-columns: 1.4fr repeat(4, 1fr); gap: 0; border: 1px solid #e2e8f0; border-radius: 6px; background: #fff; overflow: hidden; }
.salary-total, .salary-stage { min-height: 102px; padding: 16px 20px; border-right: 1px solid #e2e8f0; }
.salary-total strong { display: block; margin: 7px 0 2px; font-size: 26px; color: #166534; }
.salary-stage span { color: #64748b; }
.salary-stage strong { display: block; margin: 8px 0 10px; font-size: 20px; color: #1e293b; }
.config-specialty { display: flex; align-items: center; gap: 13px; padding: 14px 16px; border: 1px solid #bfdbfe; border-radius: 6px; color: #1d4ed8; background: #eff6ff; }
.config-specialty > .el-icon { font-size: 25px; }
.config-specialty div { flex: 1; }
.config-specialty strong { color: #1e3a8a; }
.config-specialty p { margin: 3px 0 0; color: #475569; }
@media (max-width: 980px) { .metric-grid { grid-template-columns: repeat(2, 1fr); } .metric-item:nth-child(2) { border-right: 0; } .salary-specialty { grid-template-columns: repeat(2, 1fr); } .salary-total { grid-column: 1 / -1; } }
@media (max-width: 680px) { .exam-specialty, .metric-grid { grid-template-columns: 1fr; } .metric-item { border-right: 0; } }
</style>

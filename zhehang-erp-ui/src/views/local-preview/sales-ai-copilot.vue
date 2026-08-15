<template>
  <div class="preview-shell">
    <header class="preview-header">
      <div class="brand"><span>ZH</span><strong>浙杭集团</strong></div>
      <div class="preview-title">销售 AI 教练本地验收</div>
      <el-tag type="warning" effect="dark">LOCAL-DEMO 虚构数据，不连接生产</el-tag>
    </header>

    <main>
      <div class="page-heading">
        <div><h1>客户与销售工作台</h1><p>验证通话小结、AI 草稿、人工确认和主管经营复盘。</p></div>
        <el-segmented v-model="activeView" :options="viewOptions" />
      </div>

      <section v-if="activeView === 'today'" class="workbench">
        <aside>
          <section class="target-card">
            <div class="target-top"><div><span>今日目标</span><strong>400<small> 通</small></strong></div><div class="target-progress"><b>已拨 168 通</b><el-progress :percentage="42" :stroke-width="8" /><small>还差 232 通</small></div></div>
            <div class="target-metrics"><div><b>54</b><span>接通</span></div><div><b>12</b><span>有效沟通</span></div><div><b>63</b><span>建议节奏/小时</span></div></div>
          </section>
          <section class="queue-card">
            <header><div><h2>待拨打客户</h2><span>3 条</span></div><el-input v-model="keyword" placeholder="搜索公司、联系人或电话" clearable /></header>
            <button v-for="(customer, index) in filteredCustomers" :key="customer.id" class="customer-item" :class="{ active: index === 0 }" type="button">
              <div><strong>{{ customer.name }}</strong><span>{{ customer.contact }} · {{ customer.phone }}</span></div>
              <el-tag :type="customer.level === 'A' ? 'danger' : customer.level === 'B' ? 'warning' : 'info'" effect="plain">{{ customer.level }} 类</el-tag>
              <small>{{ customer.next }}</small>
            </button>
          </section>
        </aside>

        <section class="customer-workspace">
          <header class="customer-header">
            <div><div class="customer-name"><h2>本地演示·星河企业服务有限公司</h2><el-tag type="warning" effect="plain">B 类</el-tag></div><p>本地演示联系人 · 138****0001 · 工商公开名单</p></div>
            <div class="header-actions"><el-button>客户 360</el-button><el-button type="primary">拨打客户</el-button></div>
          </header>
          <div class="customer-meta"><div><span>客户阶段</span><b>需求沟通</b></div><div><span>负责人</span><b>本地演示销售甲</b></div><div><span>最近跟进</span><b>今天 14:20</b></div><div><span>下一步</span><b>{{ form.nextTime || '待安排' }}</b></div></div>

          <section class="follow-card">
            <div class="section-title"><b>1</b><div><h3>记录本次联系</h3><p>接通和未接通都能保存；AI 只生成草稿。</p></div></div>
            <div class="result-options">
              <el-radio-group v-model="contactResult" size="large">
                <el-radio-button value="connected">接通</el-radio-button>
                <el-radio-button value="unanswered">无人接听</el-radio-button>
                <el-radio-button value="busy">占线/关机</el-radio-button>
                <el-radio-button value="invalid">号码无效</el-radio-button>
                <el-radio-button value="refused">明确拒绝</el-radio-button>
              </el-radio-group>
            </div>
            <el-form label-position="top">
              <el-form-item label="通话小结"><el-input v-model="form.summary" type="textarea" :rows="4" maxlength="500" show-word-limit placeholder="简要记录客户反馈、结论和承诺事项" /></el-form-item>
              <div class="form-grid"><el-form-item label="意向等级"><el-select v-model="form.intent" clearable placeholder="请选择"><el-option v-for="item in ['A','B','C','D','E']" :key="item" :label="`${item} 类`" :value="item" /></el-select></el-form-item><el-form-item label="下一步时间"><el-date-picker v-model="form.nextTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" placeholder="选择日期时间" /></el-form-item><el-form-item label="下一步事项"><el-input v-model="form.nextAction" placeholder="例如：确认预算、发送方案" /></el-form-item></div>
            </el-form>

            <SalesAiDraftPanel
              :lead-id="90001"
              :connected="contactResult === 'connected' ? 1 : 0"
              :result="contactResult"
              :local-demo="true"
              :demo-draft="activeDraft"
              @apply="applyDraft"
            />

            <footer class="form-actions"><span>保存前仍需人工核对，正式流程继续使用原跟进校验。</span><div><el-button @click="resetForm">重置</el-button><el-button type="primary" @click="saveDemo">保存跟进</el-button></div></footer>
          </section>
        </section>
      </section>

      <section v-else class="management-view">
        <div class="metric-grid"><article><span>有效沟通</span><b>86</b><small>较上周 +9</small></article><article><span>A/B 类新增</span><b>21</b><small>数据截至今天 18:00</small></article><article><span>逾期未跟进</span><b class="risk-number">7</b><small>需主管分派处理</small></article><article><span>来源转化率</span><b>18.6%</b><small>当前筛选范围</small></article></div>
        <SalesAiInsightPanel :query="insightQuery" :local-demo="true" :demo-insight="demoInsight" />
        <section class="evidence-table"><header><h2>经营事实明细</h2><span>AI 结论必须能回到这些业务事实</span></header><el-table :data="evidenceRows"><el-table-column prop="source" label="线索来源" min-width="160" /><el-table-column prop="leads" label="新增线索" width="120" /><el-table-column prop="valid" label="有效沟通" width="120" /><el-table-column prop="ab" label="A/B 类" width="110" /><el-table-column prop="conversion" label="转化率" width="110" /><el-table-column prop="risk" label="主要风险" min-width="220" /></el-table></section>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import SalesAiDraftPanel from '@/components/sales/SalesAiDraftPanel.vue'
import SalesAiInsightPanel from '@/components/sales/SalesAiInsightPanel.vue'
import type { SalesAiDraft, SalesAiManagementInsight } from '@/api/sales-ai'

const activeView = ref<'today' | 'management'>('today')
const viewOptions = [{ label: '今日工作', value: 'today' }, { label: '主管经营复盘', value: 'management' }]
const keyword = ref('')
const contactResult = ref('connected')
const form = reactive({ summary: '', intent: '', nextTime: '', nextAction: '' })

const customers = [
  { id: 1, name: '本地演示·星河企业服务有限公司', contact: '演示联系人甲', phone: '138****0001', level: 'B', next: '今天 16:30 · 确认预算' },
  { id: 2, name: '本地演示·青禾文化工作室', contact: '演示联系人乙', phone: '139****0002', level: 'A', next: '逾期 1 天 · 发送合同' },
  { id: 3, name: '本地演示·远航咨询有限公司', contact: '演示联系人丙', phone: '137****0003', level: 'C', next: '明天 10:00 · 需求回访' }
]
const filteredCustomers = computed(() => customers.filter((item) => !keyword.value || `${item.name}${item.contact}${item.phone}`.includes(keyword.value)))

const connectedDraft: SalesAiDraft = {
  draftId: 'LOCAL-DEMO-DRAFT-CONNECTED', available: true, message: '', provider: 'LOCAL-DEMO', promptVersion: 'sales-follow-v1', generatedAt: '2026-08-14 18:00:00', dataTime: '2026-08-14 17:58:00', transcriptionStatus: 'ready',
  summary: '客户正在比较年度代理记账方案，重点关注服务响应和合同范围；确认本周内由负责人共同评估，已同意明天下午接收对比方案。',
  demand: '年度代理记账及工商年报协助', budget: '约 8,000-10,000 元/年，需负责人确认', decisionMaker: '企业负责人和财务联系人共同决定',
  objections: ['担心服务响应不及时', '希望明确额外收费边界'], commitments: ['明天下午查看方案', '本周内反馈内部意见'], intentLevel: 'B', intentReason: '需求明确且承诺反馈，但仍在比价和内部确认', confidence: 86,
  nextActionType: '发送方案', nextActionTime: '2026-08-15 15:00:00', nextActionContent: '发送服务范围对比表，并在当日17点确认是否收到', recommendedMaterials: ['年度服务清单', '交付时效说明'], callbackScript: '您好，昨天您重点关注的服务响应和收费边界，我已经整理成一页对比表。', riskSignals: ['处于比价阶段'],
  citations: [{ type: 'call', id: 70001, label: '本次通话转写', occurredAt: '2026-08-14 17:58:00' }, { type: 'follow', id: 60001, label: '上次跟进记录', occurredAt: '2026-08-12 10:20:00' }]
}
const unansweredDraft: SalesAiDraft = {
  draftId: 'LOCAL-DEMO-DRAFT-UNANSWERED', available: true, message: '', provider: 'RULE', promptVersion: 'sales-follow-v1', generatedAt: '2026-08-14 18:00:00', dataTime: '2026-08-14 18:00:00', transcriptionStatus: 'missing',
  summary: '本次无人接听，未获得新的需求或意向事实。', demand: '', budget: '', decisionMaker: '', objections: [], commitments: [], confidence: 100,
  nextActionType: '再次联系', nextActionTime: '2026-08-15 10:00:00', nextActionContent: '错峰再次拨打；连续未接通后降低频次', recommendedMaterials: [], callbackScript: '', riskSignals: ['连续 2 次无人接听，不建议据此调整为 A/B/C'],
  citations: [{ type: 'call', id: 70002, label: '本次未接通话单', occurredAt: '2026-08-14 18:00:00' }]
}
const activeDraft = computed(() => contactResult.value === 'connected' ? connectedDraft : unansweredDraft)

watch(contactResult, resetForm)
function applyDraft(draft: SalesAiDraft) {
  form.summary = draft.summary || ''
  form.intent = draft.intentLevel || ''
  form.nextTime = draft.nextActionTime || ''
  form.nextAction = draft.nextActionContent || ''
}
function resetForm() { form.summary = ''; form.intent = ''; form.nextTime = ''; form.nextAction = '' }
function saveDemo() { ElMessage.success('LOCAL-DEMO：已验证保存交互，不写入任何生产数据') }

const insightQuery = { startDate: '2026-08-08', endDate: '2026-08-14', deptId: 901 }
const demoInsight: SalesAiManagementInsight = {
  insightId: 'LOCAL-DEMO-INSIGHT-001', available: true, message: '', provider: 'LOCAL-DEMO', promptVersion: 'sales-management-v1', generatedAt: '2026-08-14 18:02:00', scopeLabel: '本地演示销售一部', dataRange: '2026-08-08 至 2026-08-14',
  summary: '本周有效沟通和 A/B 类客户数量上升，但仍有 7 位客户超过计划时间未跟进。运营投流线索量较高，转化质量低于转介绍来源。',
  highlights: ['有效沟通较上周增加 9 次', '转介绍来源 A/B 类占比最高'], risks: ['7 位客户逾期未跟进', '运营投流中号码异常占比偏高'], coaching: ['优先清理 A/B 类逾期客户', '复盘高绩效销售的异议处理话术'], commonObjections: ['担心服务响应速度', '需要明确额外收费边界'], sourceQuality: '基于当前部门有权客户、跟进和话单聚合；未使用无归属聊天内容。', confidence: 82,
  citations: [{ type: 'metric', label: '部门跟进与通话汇总', occurredAt: '2026-08-14 18:00:00' }]
}
const evidenceRows = [
  { source: '客户转介绍', leads: 32, valid: 21, ab: 11, conversion: '28.1%', risk: '跟进节奏不一致' },
  { source: '运营投流', leads: 86, valid: 31, ab: 6, conversion: '9.3%', risk: '号码异常和低意向较多' },
  { source: '工商公开名单', leads: 54, valid: 18, ab: 4, conversion: '11.1%', risk: '连续未接通较多' }
]
</script>

<style scoped lang="scss">
* { box-sizing: border-box; }
.preview-shell { min-height: 100vh; background: #f3f6fa; color: #172033; }
.preview-header { height: 58px; padding: 0 24px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; border-bottom: 1px solid #dfe5ed; background: #fff; }
.brand { display: flex; align-items: center; gap: 10px; }.brand span { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 6px; background: #1858b7; color: #fff; font-weight: 800; }.preview-title { font-size: 15px; font-weight: 700; }.preview-header > .el-tag { justify-self: end; }
main { padding: 22px 24px 30px; }
.page-heading { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin: 0 auto 18px; max-width: 1800px; }.page-heading h1 { margin: 0; font-size: 26px; }.page-heading p { margin: 5px 0 0; color: #66758a; font-size: 14px; }
.workbench { display: grid; grid-template-columns: 350px minmax(0, 1fr); gap: 18px; max-width: 1800px; margin: 0 auto; } aside { display: grid; align-content: start; gap: 14px; }
.target-card, .queue-card, .customer-workspace, .metric-grid article, .evidence-table { border: 1px solid #dfe5ed; border-radius: 7px; background: #fff; }
.target-card { padding: 16px; }.target-top { display: grid; grid-template-columns: 110px 1fr; align-items: center; gap: 16px; }.target-top span, .target-progress small { display: block; color: #6f7c8d; font-size: 13px; }.target-top strong { display: block; color: #174ea6; font-size: 36px; line-height: 1.1; }.target-top strong small { font-size: 14px; }.target-progress b { display: block; margin-bottom: 8px; font-size: 14px; }.target-progress small { margin-top: 6px; color: #b45309; }.target-metrics { display: grid; grid-template-columns: repeat(3, 1fr); margin-top: 15px; padding-top: 14px; border-top: 1px solid #e6ebf1; }.target-metrics div { text-align: center; border-right: 1px solid #e6ebf1; }.target-metrics div:last-child { border: 0; }.target-metrics b { display: block; color: #096b67; font-size: 22px; }.target-metrics span { display: block; margin-top: 3px; color: #687589; font-size: 12px; }
.queue-card { overflow: hidden; }.queue-card header { padding: 15px; border-bottom: 1px solid #e4e9ef; }.queue-card header > div { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }.queue-card h2 { margin: 0; font-size: 18px; }.queue-card header span { color: #65758a; font-size: 13px; }.customer-item { width: 100%; min-height: 88px; padding: 13px 14px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 5px 8px; border: 0; border-bottom: 1px solid #edf0f4; background: #fff; color: inherit; text-align: left; cursor: pointer; }.customer-item.active { box-shadow: inset 3px 0 #2563eb; background: #eff6ff; }.customer-item strong, .customer-item span { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }.customer-item strong { font-size: 15px; }.customer-item span, .customer-item small { margin-top: 5px; color: #687589; font-size: 13px; }.customer-item small { grid-column: 1 / -1; }
.customer-workspace { overflow: hidden; }.customer-header { display: flex; justify-content: space-between; gap: 20px; padding: 18px 20px; }.customer-name { display: flex; align-items: center; gap: 9px; }.customer-name h2 { max-width: min(55vw, 720px); margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 21px; }.customer-header p { margin: 6px 0 0; color: #687589; font-size: 14px; }.header-actions { display: flex; align-items: center; flex: none; }
.customer-meta { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 14px 20px; border-top: 1px solid #e6ebf1; border-bottom: 1px solid #e6ebf1; background: #fbfcfe; }.customer-meta span, .customer-meta b { display: block; }.customer-meta span { color: #748196; font-size: 13px; }.customer-meta b { margin-top: 5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; }
.follow-card { padding: 18px 20px; }.section-title { display: flex; align-items: center; gap: 11px; margin-bottom: 14px; }.section-title > b { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: #1858b7; color: #fff; }.section-title h3 { margin: 0; font-size: 18px; }.section-title p { margin: 3px 0 0; color: #718096; font-size: 13px; }.result-options { margin-bottom: 14px; }.result-options :deep(.el-radio-group) { width: 100%; display: grid; grid-template-columns: repeat(5, 1fr); }.result-options :deep(.el-radio-button__inner) { width: 100%; min-height: 42px; display: grid; place-items: center; font-size: 14px; }
.form-grid { display: grid; grid-template-columns: 180px 230px minmax(260px, 1fr); gap: 14px; }.form-grid :deep(.el-select), .form-grid :deep(.el-date-editor) { width: 100%; }.form-actions { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 16px; padding-top: 14px; border-top: 1px solid #e6ebf1; }.form-actions span { color: #718096; font-size: 13px; }
.management-view { max-width: 1800px; margin: 0 auto; }.metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 20px; }.metric-grid article { min-height: 118px; padding: 17px 19px; }.metric-grid span, .metric-grid small { display: block; color: #718096; font-size: 13px; }.metric-grid b { display: block; margin: 8px 0 5px; color: #174ea6; font-size: 29px; }.metric-grid .risk-number { color: #b45309; }.evidence-table { overflow: hidden; }.evidence-table header { display: flex; justify-content: space-between; align-items: center; padding: 16px 18px; }.evidence-table h2 { margin: 0; font-size: 18px; }.evidence-table header span { color: #718096; font-size: 13px; }
@media (max-width: 1366px) { main { padding: 18px; }.workbench { grid-template-columns: 320px minmax(0, 1fr); gap: 14px; }.form-grid { grid-template-columns: 150px 210px minmax(220px, 1fr); }.customer-header, .follow-card { padding-left: 16px; padding-right: 16px; } }
@media (max-width: 980px) { .preview-header { grid-template-columns: 1fr auto; }.preview-title { display: none; }.workbench { grid-template-columns: 1fr; }.customer-meta, .metric-grid { grid-template-columns: repeat(2, 1fr); }.form-grid { grid-template-columns: 1fr; }.result-options :deep(.el-radio-group) { grid-template-columns: repeat(2, 1fr); }.page-heading, .customer-header, .form-actions { align-items: stretch; flex-direction: column; } }
@media (max-width: 620px) { main { padding: 12px; }.preview-header { padding: 0 12px; }.preview-header > .el-tag { max-width: 180px; }.page-heading h1 { font-size: 24px; }.customer-meta, .metric-grid { grid-template-columns: 1fr; }.customer-name h2 { max-width: 68vw; font-size: 18px; }.header-actions { display: grid; grid-template-columns: 1fr 1fr; }.target-top { grid-template-columns: 95px 1fr; } }
</style>

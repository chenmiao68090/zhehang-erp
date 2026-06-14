<template>
  <div class="growth-page">
    <el-alert title="演示原型" description="本页数据为前端本地演示(localStorage),未接入后端持久化,刷新或换设备后会重置。正式数据请以已落地的真实模块为准。" type="warning" show-icon :closable="false" style="margin-bottom: 16px" />
    <section class="page-head">
      <div>
        <div class="eyebrow">P2 · TELESALES DESK</div>
        <h1>电销工作台</h1>
        <p>从拓客情报和网销线索进入外呼队列，沉淀通话摘要、意向等级、复访任务与提单动作。</p>
      </div>
      <div class="head-actions">
        <el-input v-model="query.keyword" placeholder="搜索公司/联系人/电话" clearable :prefix-icon="Search" @keyup.enter="load" />
        <el-button type="primary" :icon="Search" @click="load">查询</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric"><span>待拨打</span><b>{{ summary.waiting }}</b><em>今日队列</em></div>
      <div class="metric"><span>已完成</span><b>{{ summary.done }}</b><em>含有效通话</em></div>
      <div class="metric"><span>A/B 意向</span><b>{{ summary.intent }}</b><em>自动生成复访</em></div>
      <div class="metric"><span>无效号码</span><b>{{ summary.invalid }}</b><em>进入空号复核</em></div>
    </section>

    <section class="desk-grid">
      <div class="ops-panel">
        <div class="filters">
          <el-select v-model="query.status" placeholder="通话状态" clearable>
            <el-option label="待拨打" value="waiting" />
            <el-option label="已完成" value="done" />
            <el-option label="无效" value="invalid" />
          </el-select>
          <el-select v-model="query.ownerName" placeholder="销售" clearable>
            <el-option label="张小兰" value="张小兰" />
            <el-option label="李明" value="李明" />
          </el-select>
          <el-button :icon="Refresh" @click="reset">重置</el-button>
        </div>

        <el-table
          v-loading="loading"
          :data="rows"
          border
          stripe
          height="620"
          highlight-current-row
          @row-click="current = $event"
        >
          <el-table-column prop="companyName" label="企业" min-width="220">
            <template #default="{ row }">
              <button class="link-btn" @click.stop="current = row">{{ row.companyName }}</button>
              <div class="sub-line">{{ row.scriptType }} · {{ row.ownerName }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="contactName" label="联系人" width="90" />
          <el-table-column prop="phone" label="电话" width="130" />
          <el-table-column prop="scheduledAt" label="计划拨打" width="160" />
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTag(row.status)" size="small">{{ statusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="意向" width="80" align="center">
            <template #default="{ row }">
              <b :class="`intent-${row.intent || 'empty'}`">{{ row.intent || '-' }}</b>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="210" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" @click.stop="finish(row, 'A')">A意向</el-button>
              <el-button link @click.stop="finish(row, 'B')">B意向</el-button>
              <el-button link type="warning" @click.stop="createOrder(row)">提单</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pager">
          <el-pagination
            v-model:current-page="query.page"
            v-model:page-size="query.pageSize"
            layout="total, prev, pager, next"
            :total="total"
            @current-change="load"
          />
        </div>
      </div>

      <aside class="call-panel">
        <template v-if="current">
          <div class="call-card">
            <div class="call-title">
              <div>
                <span>当前客户</span>
                <h2>{{ current.companyName }}</h2>
                <p>{{ current.contactName }} · {{ current.phone }}</p>
              </div>
              <el-tag>{{ current.scriptType }}</el-tag>
            </div>
            <div class="script-box">
              <div class="block-title">推荐话术</div>
              <p>
                您好，我是浙杭财税顾问。系统看到贵司近期存在
                <b>{{ current.scriptType }}</b>
                相关需求，我们可以先帮您做一次风险和成本诊断，再给您一份处理方案。
              </p>
            </div>
            <div class="quick-actions">
              <el-button type="danger" @click="finish(current, 'A')">A 级 · 今日报价</el-button>
              <el-button type="warning" @click="finish(current, 'B')">B 级 · 复访</el-button>
              <el-button @click="finish(current, 'C')">C 级 · 培育</el-button>
              <el-button @click="finish(current, 'invalid')">空号/无效</el-button>
            </div>
            <div class="block-title">AI 摘要</div>
            <el-input
              v-model="manual.summary"
              type="textarea"
              :rows="4"
              placeholder="可手动补充通话摘要，留空则系统按意向自动生成"
            />
            <div class="block-title">下一步动作</div>
            <el-input v-model="manual.nextAction" placeholder="例如：发送报价、约明天下午复谈、7天后回访" />
            <div class="drawer-actions">
              <el-button type="primary" @click="createOrder(current)">生成提单</el-button>
            </div>
          </div>

          <div class="call-card">
            <div class="block-title">最近结果</div>
            <div v-if="current.aiSummary" class="summary-box">
              <b>{{ current.intent }} 级意向</b>
              <p>{{ current.aiSummary }}</p>
              <span>下一步：{{ current.nextAction }}</span>
            </div>
            <el-empty v-else description="还没有通话结果" :image-size="80" />
          </div>
        </template>
        <el-empty v-else description="请选择一条外呼任务" />
      </aside>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import { callDeskApi, growthLinkageApi, type CallTask, type IntentLevel } from '@/api/growth'

const loading = ref(false)
const rows = ref<CallTask[]>([])
const current = ref<CallTask | null>(null)
const total = ref(0)
const summary = reactive({ waiting: 0, done: 0, intent: 0, invalid: 0 })
const query = reactive({ keyword: '', status: '', ownerName: '', page: 1, pageSize: 10 })
const manual = reactive({ summary: '', nextAction: '' })

function statusText(status: string) {
  return ({ waiting: '待拨打', calling: '通话中', done: '已完成', missed: '未接', invalid: '无效' } as Record<string, string>)[status] || status
}
function statusTag(status: string) {
  return ({ waiting: 'primary', calling: 'warning', done: 'success', missed: 'info', invalid: 'danger' } as Record<string, any>)[status] || 'info'
}

async function load() {
  loading.value = true
  try {
    const [page, stat] = await Promise.all([
      callDeskApi.list(query),
      callDeskApi.summary()
    ])
    rows.value = page.list
    total.value = page.total
    Object.assign(summary, stat)
    if (!current.value && rows.value.length) current.value = rows.value[0]
  } finally {
    loading.value = false
  }
}

function reset() {
  Object.assign(query, { keyword: '', status: '', ownerName: '', page: 1, pageSize: 10 })
  load()
}

async function finish(row: CallTask, intent: IntentLevel) {
  const res = await callDeskApi.finish({
    id: row.id,
    intent,
    summary: manual.summary,
    nextAction: manual.nextAction
  })
  current.value = res.task
  manual.summary = ''
  manual.nextAction = ''
  ElMessage.success(intent === 'invalid' ? '已标记为空号/无效' : `已记录 ${intent} 级意向并生成后续动作`)
  load()
}

async function createOrder(row: CallTask) {
  const order = await growthLinkageApi.createOrderFromSignal(row.signalId)
  ElMessage.success(`已生成提单 ${order.orderNo}`)
  load()
}

onMounted(load)
</script>

<style scoped lang="scss">
.growth-page {
  padding: 20px;
  color: #1f2937;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-bottom: 16px;
}
.eyebrow {
  font-size: 12px;
  font-weight: 800;
  color: #2563eb;
}
h1 {
  margin: 6px 0;
  font-size: 26px;
}
p {
  margin: 0;
  color: #64748b;
}
.head-actions {
  display: grid;
  grid-template-columns: 280px auto;
  gap: 10px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.metric,
.ops-panel,
.call-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}
.metric {
  padding: 14px 16px;
}
.metric span,
.metric em {
  display: block;
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}
.metric b {
  display: block;
  margin: 6px 0;
  font-size: 26px;
}
.desk-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 390px;
  gap: 14px;
}
.ops-panel,
.call-card {
  padding: 14px;
}
.filters {
  display: grid;
  grid-template-columns: 150px 150px auto;
  gap: 10px;
  margin-bottom: 12px;
}
.link-btn {
  border: 0;
  background: transparent;
  padding: 0;
  color: #2563eb;
  font-weight: 700;
  cursor: pointer;
}
.sub-line {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;
}
.intent-A { color: #dc2626; }
.intent-B { color: #d97706; }
.intent-C { color: #2563eb; }
.intent-D,
.intent-invalid,
.intent-empty { color: #94a3b8; }
.pager {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
.call-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.call-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.call-title span,
.block-title {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.call-title h2 {
  margin: 6px 0;
  font-size: 20px;
}
.script-box {
  margin: 14px 0;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  line-height: 1.7;
}
.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.block-title {
  margin: 12px 0 8px;
}
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
.summary-box {
  padding: 12px;
  border-radius: 8px;
  background: #f8fafc;
}
.summary-box p {
  margin: 8px 0;
  line-height: 1.7;
}
.summary-box span {
  color: #2563eb;
}
@media (max-width: 1120px) {
  .desk-grid,
  .page-head,
  .head-actions {
    display: block;
  }
  .call-panel {
    margin-top: 14px;
  }
  .metric-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

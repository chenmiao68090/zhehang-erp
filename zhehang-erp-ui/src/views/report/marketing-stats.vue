<template>
  <div class="growth-page">
    <section class="page-head">
      <div>
        <div class="eyebrow">P5 · GROWTH DASHBOARD</div>
        <h1>营销经营看板</h1>
        <p>把企业主体、拓客情报、电销、网销、提单、收款和服务任务放在同一张经营链路里看。</p>
      </div>
      <el-button type="primary" :icon="Refresh" @click="load">刷新数据</el-button>
    </section>

    <section class="metric-grid">
      <div class="metric"><span>企业主体</span><b>{{ snapshot.entityCount }}</b><em>P0 主数据</em></div>
      <div class="metric"><span>市场情报</span><b>{{ snapshot.signalCount }}</b><em>A级 {{ snapshot.highValueSignalCount }}</em></div>
      <div class="metric"><span>待外呼</span><b>{{ snapshot.callQueueCount }}</b><em>P2 队列</em></div>
      <div class="metric"><span>网销线索</span><b>{{ snapshot.onlineLeadCount }}</b><em>P3 渠道</em></div>
      <div class="metric"><span>订单数量</span><b>{{ snapshot.orderCount }}</b><em>P4 提单链路</em></div>
      <div class="metric"><span>订单金额</span><b>{{ money(snapshot.orderAmount) }}</b><em>合同/收款基数</em></div>
      <div class="metric"><span>已确认收款</span><b>{{ money(snapshot.receiptAmount) }}</b><em>财务核对</em></div>
      <div class="metric"><span>服务任务</span><b>{{ snapshot.taskCount }}</b><em>逾期 {{ snapshot.overdueTaskCount }}</em></div>
    </section>

    <section class="grid-two">
      <div class="ops-panel">
        <div class="panel-title">增长漏斗</div>
        <div class="funnel">
          <div v-for="item in snapshot.funnel" :key="item.stage" class="funnel-row">
            <div class="funnel-head">
              <b>{{ item.stage }}</b>
              <span>{{ item.count }} · {{ item.rate }}%</span>
            </div>
            <div class="bar"><i :style="{ width: item.rate + '%' }"></i></div>
          </div>
        </div>
      </div>

      <div class="ops-panel">
        <div class="panel-title">勾稽检查</div>
        <div class="check-list">
          <div v-for="item in checks" :key="item.title" class="check-item" :class="item.level">
            <b>{{ item.title }}</b>
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="grid-two">
      <div class="ops-panel">
        <div class="panel-title">渠道 ROI</div>
        <el-table :data="snapshot.sourceRoi" border stripe height="360">
          <el-table-column prop="source" label="来源" min-width="150" />
          <el-table-column prop="leads" label="线索" width="80" align="right" />
          <el-table-column label="成本" width="110" align="right">
            <template #default="{ row }">{{ money(row.cost) }}</template>
          </el-table-column>
          <el-table-column prop="orders" label="提单" width="80" align="right" />
          <el-table-column label="金额" width="130" align="right">
            <template #default="{ row }">{{ money(row.amount) }}</template>
          </el-table-column>
          <el-table-column label="ROI" width="90" align="right">
            <template #default="{ row }">{{ row.roi }}</template>
          </el-table-column>
        </el-table>
      </div>

      <div class="ops-panel">
        <div class="panel-title">情报类型价值</div>
        <el-table :data="snapshot.signalTypes" border stripe height="360">
          <el-table-column prop="label" label="情报类型" min-width="150" />
          <el-table-column prop="count" label="数量" width="90" align="right" />
          <el-table-column label="预计金额" width="140" align="right">
            <template #default="{ row }">{{ money(row.amount) }}</template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <section class="ops-panel">
      <div class="panel-title">最近联动日志</div>
      <el-table :data="snapshot.actionLogs" border stripe>
        <el-table-column prop="time" label="时间" width="170" />
        <el-table-column prop="title" label="动作" width="190" />
        <el-table-column prop="detail" label="说明" min-width="360" />
        <el-table-column prop="entityId" label="entityId" width="100" />
        <el-table-column prop="signalId" label="signalId" width="100" />
        <el-table-column prop="orderId" label="orderId" width="100" />
      </el-table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { growthLinkageApi, type GrowthSnapshot } from '@/api/growth'

const snapshot = reactive<GrowthSnapshot>({
  entityCount: 0,
  signalCount: 0,
  highValueSignalCount: 0,
  pooledCount: 0,
  callQueueCount: 0,
  intentCount: 0,
  onlineLeadCount: 0,
  orderCount: 0,
  orderAmount: 0,
  receiptAmount: 0,
  taskCount: 0,
  overdueTaskCount: 0,
  funnel: [],
  sourceRoi: [],
  signalTypes: [],
  actionLogs: []
})

const checks = computed(() => [
  {
    title: '主体勾稽',
    desc: snapshot.entityCount ? '线索、客户、订单按 entityId 归并，避免重复客户和撞单。' : '主体库暂无数据。',
    level: snapshot.entityCount ? 'ok' : 'warn'
  },
  {
    title: '营销转订单',
    desc: snapshot.signalCount ? `已有 ${snapshot.intentCount} 个意向客户，${snapshot.orderCount} 张提单进入订单链路。` : '暂无营销情报。',
    level: snapshot.orderCount ? 'ok' : 'warn'
  },
  {
    title: '订单到收款',
    desc: `订单金额 ${money(snapshot.orderAmount)}，确认收款 ${money(snapshot.receiptAmount)}，后续需继续关注应收差额。`,
    level: snapshot.receiptAmount <= snapshot.orderAmount ? 'ok' : 'danger'
  },
  {
    title: '交付承接',
    desc: snapshot.taskCount ? `已沉淀 ${snapshot.taskCount} 条服务/复访任务，逾期 ${snapshot.overdueTaskCount} 条。` : '成交后服务任务需要自动拆解。',
    level: snapshot.overdueTaskCount ? 'warn' : 'ok'
  }
])

function money(n: number) {
  return `¥${Number(n || 0).toLocaleString('zh-CN')}`
}

async function load() {
  const data = await growthLinkageApi.snapshot()
  Object.assign(snapshot, data)
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
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.eyebrow {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}
h1 {
  margin: 6px 0;
  font-size: 26px;
}
p {
  margin: 0;
  color: #64748b;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.metric,
.ops-panel {
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
  font-size: 24px;
}
.grid-two {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.ops-panel {
  padding: 14px;
  margin-bottom: 14px;
}
.panel-title {
  margin-bottom: 12px;
  font-weight: 800;
}
.funnel {
  display: grid;
  gap: 14px;
}
.funnel-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.funnel-head span {
  color: #64748b;
}
.bar {
  height: 10px;
  background: #eef2f7;
  border-radius: 999px;
  overflow: hidden;
}
.bar i {
  display: block;
  height: 100%;
  background: #2563eb;
  border-radius: inherit;
}
.check-list {
  display: grid;
  gap: 10px;
}
.check-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px;
}
.check-item b,
.check-item span {
  display: block;
}
.check-item span {
  margin-top: 6px;
  color: #64748b;
}
.check-item.ok {
  border-color: #bbf7d0;
  background: #f0fdf4;
}
.check-item.warn {
  border-color: #fde68a;
  background: #fffbeb;
}
.check-item.danger {
  border-color: #fecaca;
  background: #fef2f2;
}
@media (max-width: 1080px) {
  .metric-grid,
  .grid-two {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

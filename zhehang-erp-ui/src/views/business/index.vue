<template>
  <div class="business-page">
    <header class="page-head">
      <div>
        <div class="page-kicker">BUSINESS / OPERATIONS</div>
        <h1>业务管理</h1>
        <p>汇总业务线索、订单流转、待审批与交付状态，作为经营侧的总入口。</p>
      </div>
      <div class="head-actions">
        <el-button :icon="Refresh" @click="refreshSnapshot">刷新</el-button>
        <el-button type="primary" :icon="Plus" @click="createVisible = true">新建业务</el-button>
      </div>
    </header>

    <section class="metric-grid">
      <div v-for="metric in metrics" :key="metric.label" class="metric-card" :style="{ '--accent': metric.color }">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small>{{ metric.note }}</small>
      </div>
    </section>

    <section class="workspace-grid">
      <el-card shadow="never" class="module-card">
        <template #header>
          <div class="card-head">
            <span>业务流转</span>
            <el-tag size="small" effect="plain">本月</el-tag>
          </div>
        </template>
        <div class="stage-list">
          <div v-for="stage in stages" :key="stage.name" class="stage-row">
            <div class="stage-main">
              <span class="stage-name">{{ stage.name }}</span>
              <span class="stage-desc">{{ stage.desc }}</span>
            </div>
            <div class="stage-count">{{ stage.count }}</div>
          </div>
        </div>
      </el-card>

      <el-card shadow="never" class="module-card">
        <template #header>
          <div class="card-head">
            <span>待处理事项</span>
            <el-badge :value="todos.length" type="danger" />
          </div>
        </template>
        <div class="todo-list">
          <div v-for="item in todos" :key="item.title" class="todo-row">
            <el-tag :type="item.type" size="small" effect="plain">{{ item.badge }}</el-tag>
            <span>{{ item.title }}</span>
            <em>{{ item.time }}</em>
          </div>
        </div>
      </el-card>
    </section>

    <el-card shadow="never" class="module-card">
      <template #header>
        <div class="card-head">
          <span>近期业务</span>
          <el-button link type="primary">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentBusinesses" stripe>
        <el-table-column prop="no" label="业务编号" width="140" />
        <el-table-column prop="customer" label="客户" min-width="180" show-overflow-tooltip />
        <el-table-column prop="service" label="服务类型" width="140" />
        <el-table-column prop="owner" label="负责人" width="110" />
        <el-table-column prop="stage" label="阶段" width="120">
          <template #default="{ row }">
            <el-tag size="small" effect="plain">{{ row.stage }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="预计金额" width="130" align="right" />
        <el-table-column prop="updatedAt" label="更新时间" width="140" />
      </el-table>
    </el-card>

    <el-dialog v-model="createVisible" title="新建业务" width="520px">
      <el-form label-width="88px">
        <el-form-item label="客户名称">
          <el-input placeholder="输入客户或公司名称" />
        </el-form-item>
        <el-form-item label="服务类型">
          <el-select placeholder="请选择" style="width: 100%">
            <el-option label="工商服务" value="工商服务" />
            <el-option label="财税服务" value="财税服务" />
            <el-option label="资质许可" value="资质许可" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" :rows="3" placeholder="补充业务背景" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="createVisible = false">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Refresh } from '@element-plus/icons-vue'

const createVisible = ref(false)

const metrics = [
  { label: '业务总量', value: '128', note: '本月新增 32 单', color: '#2563eb' },
  { label: '进行中', value: '46', note: '交付和跟进中', color: '#0f766e' },
  { label: '待审批', value: '9', note: '需负责人确认', color: '#d97706' },
  { label: '已完成', value: '73', note: '完成率 57%', color: '#16a34a' }
]

const stages = [
  { name: '线索确认', desc: '客户需求已确认，等待报价', count: 18 },
  { name: '合同签署', desc: '合同待盖章或回传', count: 11 },
  { name: '资料收集', desc: '客户资料缺项待补齐', count: 23 },
  { name: '交付办理', desc: '业务执行中，需跟进节点', count: 31 },
  { name: '归档回访', desc: '完成交付后回访与沉淀', count: 45 }
]

const todos = [
  { badge: '审批', type: 'warning' as const, title: '杭州星桥科技合同折扣待确认', time: '今天' },
  { badge: '资料', type: 'danger' as const, title: '宁波精密制造缺少法人身份证附件', time: '明天' },
  { badge: '回访', type: 'success' as const, title: '工商变更业务完成后满意度回访', time: '06-03' }
]

const recentBusinesses = [
  { no: 'BIZ-202606-001', customer: '杭州星桥科技有限公司', service: '代理记账', owner: '陈经理', stage: '合同签署', amount: '¥12,800', updatedAt: '06-01 09:20' },
  { no: 'BIZ-202606-002', customer: '宁波精密制造有限公司', service: '工商变更', owner: '李顾问', stage: '资料收集', amount: '¥5,600', updatedAt: '06-01 08:46' },
  { no: 'BIZ-202605-118', customer: '杭州办公集采服务部', service: '资质许可', owner: '王顾问', stage: '交付办理', amount: '¥18,000', updatedAt: '05-31 17:12' }
]

function refreshSnapshot() {
  ElMessage.success('业务看板已刷新')
}
</script>

<style lang="scss" scoped>
.business-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px;
  background:
    linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(15, 118, 110, 0.07)),
    #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-card);

  h1 {
    margin: 0;
    color: var(--text-primary);
    font-size: 26px;
    line-height: 34px;
  }

  p {
    margin-top: 6px;
    color: var(--text-muted);
  }
}

.page-kicker {
  margin-bottom: 6px;
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.head-actions {
  display: flex;
  gap: 8px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  position: relative;
  min-height: 118px;
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: var(--accent);
  }

  span,
  small {
    display: block;
    color: var(--text-muted);
  }

  strong {
    display: block;
    margin: 12px 0 6px;
    color: var(--accent);
    font-family: 'JetBrains Mono', monospace;
    font-size: 30px;
    line-height: 1;
  }
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, .8fr);
  gap: 12px;
}

.module-card {
  border-radius: 8px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-primary);
  font-weight: 700;
}

.stage-list,
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stage-row,
.todo-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
}

.stage-main {
  flex: 1;
  min-width: 0;
}

.stage-name {
  display: block;
  color: var(--text-primary);
  font-weight: 700;
}

.stage-desc {
  display: block;
  margin-top: 3px;
  color: var(--text-muted);
  font-size: 12px;
}

.stage-count {
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
}

.todo-row span {
  flex: 1;
  color: var(--text-body);
}

.todo-row em {
  color: var(--text-muted);
  font-style: normal;
  font-size: 12px;
}

@media (max-width: 1180px) {
  .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .workspace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 760px) {
  .page-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-grid { grid-template-columns: 1fr; }
}
</style>

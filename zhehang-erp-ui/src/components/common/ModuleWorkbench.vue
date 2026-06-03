<template>
  <section class="module-workbench">
    <div class="workbench-main">
      <div class="workbench-toolbar">
        <div>
          <span class="workbench-eyebrow">{{ eyebrow }}</span>
          <h3>{{ title }}</h3>
        </div>
        <div class="toolbar-actions">
          <el-button
            v-for="action in actions"
            :key="action.label"
            :type="action.type || 'primary'"
            :plain="action.plain !== false"
            :icon="action.icon ? iconMap[action.icon] : undefined"
            size="small"
          >
            {{ action.label }}
          </el-button>
        </div>
      </div>

      <el-table :data="records" stripe class="workbench-table">
        <el-table-column
          v-for="column in columns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-tag v-if="column.type === 'tag'" :type="tagType(row[column.prop])" size="small">
              {{ row[column.prop] }}
            </el-tag>
            <span v-else-if="column.type === 'amount'" class="amount-cell">{{ row[column.prop] }}</span>
            <span v-else>{{ row[column.prop] }}</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <aside class="workbench-side">
      <div class="side-section">
        <div class="side-head">
          <span>流程看板</span>
          <small>{{ steps.length }} steps</small>
        </div>
        <div class="step-list">
          <div v-for="(step, index) in steps" :key="step.title" class="step-item" :class="step.status">
            <span class="step-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="side-section">
        <div class="side-head">
          <span>关注事项</span>
          <small>Risk</small>
        </div>
        <ul class="alert-list">
          <li v-for="alert in alerts" :key="alert">
            {{ alert }}
          </li>
        </ul>
      </div>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { Download, Finished, Plus, Refresh } from '@element-plus/icons-vue'

type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info'
type ActionIcon = 'add' | 'export' | 'refresh' | 'approve'

interface WorkbenchColumn {
  prop: string
  label: string
  width?: number | string
  type?: 'text' | 'tag' | 'amount'
}

interface WorkbenchAction {
  label: string
  type?: ButtonType
  icon?: ActionIcon
  plain?: boolean
}

interface WorkbenchStep {
  title: string
  desc: string
  status?: 'done' | 'active' | 'pending'
}

withDefaults(defineProps<{
  title: string
  eyebrow: string
  columns: WorkbenchColumn[]
  records: Record<string, string | number>[]
  steps: WorkbenchStep[]
  alerts: string[]
  actions?: WorkbenchAction[]
}>(), {
  actions: () => []
})

const iconMap = {
  add: Plus,
  export: Download,
  refresh: Refresh,
  approve: Finished
}

function tagType(value: unknown): ButtonType {
  const text = String(value)
  if (/驳回|逾期|异常|风险|超支|冻结/.test(text)) return 'danger'
  if (/待|审批|进行|复核|待定|预警/.test(text)) return 'warning'
  if (/完成|通过|正常|已|生效|结清/.test(text)) return 'success'
  return 'info'
}
</script>

<style scoped lang="scss">
.module-workbench {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 16px;
}

.workbench-main,
.workbench-side {
  min-width: 0;
}

.workbench-main,
.side-section {
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: var(--shadow-card);
}

.workbench-main {
  padding: 16px;
}

.workbench-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  h3 {
    margin: 4px 0 0;
    font-size: 17px;
    font-weight: 650;
    color: var(--text-primary);
  }
}

.workbench-eyebrow {
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 11px;
  letter-spacing: 0.08em;
  color: var(--text-subtle);
}

.toolbar-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.workbench-table {
  width: 100%;
}

.amount-cell {
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-weight: 650;
  color: var(--brand-primary);
}

.workbench-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-section {
  padding: 16px;
}

.side-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  span {
    font-size: 14px;
    font-weight: 650;
    color: var(--text-primary);
  }

  small {
    font-family: 'JetBrains Mono', 'Menlo', monospace;
    font-size: 10px;
    color: var(--text-subtle);
    text-transform: uppercase;
  }
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-item {
  display: grid;
  grid-template-columns: 34px 1fr;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #f8fafc;

  &.done {
    border-color: rgba(16, 185, 129, 0.22);
    background: rgba(16, 185, 129, 0.06);
  }

  &.active {
    border-color: rgba(37, 99, 235, 0.25);
    background: rgba(37, 99, 235, 0.06);
  }

  strong {
    display: block;
    font-size: 13px;
    color: var(--text-primary);
    margin-bottom: 3px;
  }

  p {
    margin: 0;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-muted);
  }
}

.step-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #eef2ff;
  color: var(--brand-primary);
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 11px;
  font-weight: 700;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;

  li {
    position: relative;
    padding-left: 16px;
    color: var(--text-muted);
    font-size: 13px;
    line-height: 1.5;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 8px;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--brand-primary);
    }
  }
}

@media (max-width: 1200px) {
  .module-workbench {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .workbench-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .toolbar-actions {
    justify-content: flex-start;
  }
}
</style>

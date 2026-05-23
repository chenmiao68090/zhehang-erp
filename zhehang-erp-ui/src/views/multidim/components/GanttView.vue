<template>
  <div class="gantt-view">
    <div v-if="!dateField" class="gantt-empty">
      <el-empty description="甘特图视图需要至少一个日期字段" />
    </div>
    <div v-else class="gantt-content">
      <div class="gantt-timeline">
        <div class="timeline-header">
          <div class="task-col-header">任务</div>
          <div class="time-axis">
            <div v-for="d in dateRange" :key="d" class="day-cell" :class="{today: d === today}">
              {{ formatDay(d) }}
            </div>
          </div>
        </div>
        <div class="timeline-body">
          <div v-for="rec in records" :key="rec.id" class="gantt-row">
            <div class="task-col">
              <FieldCell v-if="titleField" :field="titleField" :value="rec.data[titleField.id]" />
              <span v-else>记录 #{{ rec.id }}</span>
            </div>
            <div class="bar-track">
              <div
                v-if="rec.data[dateField.id]"
                class="gantt-bar"
                :style="getBarStyle(rec.data[dateField.id])"
              >
                <span>{{ titleField ? rec.data[titleField.id] : '' }}</span>
              </div>
            </div>
          </div>
          <div v-if="records.length === 0" style="padding: 60px 0;">
            <el-empty :description="$t('multidim.noRecords')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FieldDef } from '@/api/multidim'
import FieldCell from './FieldCell.vue'

const props = defineProps<{
  fields: FieldDef[]
  records: Array<{ id: number; data: Record<string, any> }>
}>()

const dateField = computed(() => props.fields.find(f => f.type === 'date'))
const titleField = computed(() => props.fields.find(f => f.type === 'text'))

const today = new Date().toISOString().slice(0, 10)

const dateRange = computed(() => {
  const start = new Date()
  start.setDate(start.getDate() - 7)
  const arr: string[] = []
  for (let i = 0; i < 30; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    arr.push(d.toISOString().slice(0, 10))
  }
  return arr
})

function formatDay(d: string) {
  return d.slice(5)
}

function getBarStyle(date: string) {
  const idx = dateRange.value.indexOf(date)
  if (idx < 0) return { display: 'none' }
  return {
    left: `${idx * 36}px`,
    width: '108px',
    background: '#F26522'
  }
}
</script>

<style scoped>
.gantt-view { height: 100%; padding: 12px; overflow: auto; }
.gantt-empty { padding: 60px 0; }
.gantt-timeline { min-width: 100%; }
.timeline-header { display: flex; border-bottom: 2px solid var(--el-border-color); position: sticky; top: 0; background: var(--el-bg-color); z-index: 2; }
.task-col-header { width: 200px; flex-shrink: 0; padding: 10px 12px; font-weight: 500; border-right: 1px solid var(--el-border-color-lighter); }
.time-axis { display: flex; }
.day-cell { width: 36px; text-align: center; padding: 10px 0; font-size: 11px; color: var(--el-text-color-secondary); border-right: 1px solid var(--el-border-color-lighter); }
.day-cell.today { background: #F265221A; color: #F26522; font-weight: 600; }
.gantt-row { display: flex; min-height: 40px; border-bottom: 1px solid var(--el-border-color-lighter); }
.task-col { width: 200px; flex-shrink: 0; padding: 8px 12px; display: flex; align-items: center; border-right: 1px solid var(--el-border-color-lighter); }
.bar-track { position: relative; flex: 1; }
.gantt-bar {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  height: 24px;
  border-radius: 4px;
  color: #fff;
  font-size: 11px;
  display: flex;
  align-items: center;
  padding: 0 8px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
}
.gantt-bar:hover { opacity: 0.85; }
</style>

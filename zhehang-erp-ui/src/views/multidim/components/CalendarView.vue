<template>
  <div class="calendar-view">
    <div v-if="!dateField" class="cal-empty">
      <el-empty description="日历视图需要日期字段" />
    </div>
    <div v-else class="cal-wrap">
      <div class="cal-header">
        <el-button-group size="small">
          <el-button @click="prevMonth"><el-icon><ArrowLeft /></el-icon></el-button>
          <el-button @click="goToday">今天</el-button>
          <el-button @click="nextMonth"><el-icon><ArrowRight /></el-icon></el-button>
        </el-button-group>
        <span class="cal-title">{{ year }}年{{ month + 1 }}月</span>
      </div>
      <div class="cal-grid">
        <div v-for="d in ['日','一','二','三','四','五','六']" :key="d" class="cal-weekday">{{ d }}</div>
        <div
          v-for="cell in cells"
          :key="cell.dateStr"
          class="cal-day"
          :class="{ 'not-current': !cell.inMonth, today: cell.dateStr === todayStr }"
        >
          <div class="day-num">{{ cell.day }}</div>
          <div class="day-events">
            <div
              v-for="ev in cell.events"
              :key="ev.id"
              class="cal-event"
              @click="$emit('click-event', ev)"
            >
              {{ getEventTitle(ev) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import type { FieldDef } from '@/api/multidim'

const props = defineProps<{
  fields: FieldDef[]
  records: Array<{ id: number; data: Record<string, any> }>
}>()

defineEmits<{ (e: 'click-event', record: any): void }>()

const dateField = computed(() => props.fields.find(f => f.type === 'date'))
const titleField = computed(() => props.fields.find(f => f.type === 'text'))

const cur = ref(new Date())
const year = computed(() => cur.value.getFullYear())
const month = computed(() => cur.value.getMonth())
const todayStr = new Date().toISOString().slice(0, 10)

const cells = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const startDay = first.getDay()
  const start = new Date(first)
  start.setDate(start.getDate() - startDay)
  const arr: any[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    const dateStr = d.toISOString().slice(0, 10)
    const events = dateField.value
      ? props.records.filter(r => r.data?.[dateField.value!.id] === dateStr)
      : []
    arr.push({
      day: d.getDate(),
      dateStr,
      inMonth: d.getMonth() === month.value,
      events
    })
  }
  return arr
})

function prevMonth() { const d = new Date(cur.value); d.setMonth(d.getMonth() - 1); cur.value = d }
function nextMonth() { const d = new Date(cur.value); d.setMonth(d.getMonth() + 1); cur.value = d }
function goToday() { cur.value = new Date() }

function getEventTitle(rec: any) {
  if (titleField.value) return rec.data?.[titleField.value.id] || '记录'
  return '记录 #' + rec.id
}
</script>

<style scoped>
.calendar-view { height: 100%; padding: 16px; }
.cal-empty { padding: 60px 0; }
.cal-wrap { height: 100%; display: flex; flex-direction: column; }
.cal-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.cal-title { font-size: 16px; font-weight: 600; color: var(--el-text-color-primary); }
.cal-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(80px, 1fr);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  overflow: hidden;
}
.cal-weekday {
  text-align: center;
  padding: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.cal-weekday:last-child { border-right: none; }
.cal-day {
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 4px 6px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cal-day.not-current { background: var(--el-fill-color-lighter); color: var(--el-text-color-placeholder); }
.cal-day.today { background: #F265220A; }
.day-num { font-size: 12px; font-weight: 500; }
.cal-day.today .day-num { color: #F26522; }
.day-events { flex: 1; overflow: hidden; display: flex; flex-direction: column; gap: 2px; }
.cal-event {
  background: #F26522;
  color: #fff;
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 11px;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.cal-event:hover { opacity: 0.85; }
</style>

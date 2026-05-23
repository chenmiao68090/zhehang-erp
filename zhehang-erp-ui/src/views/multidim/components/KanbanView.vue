<template>
  <div class="kanban-view">
    <div v-if="!groupBy" class="kanban-empty">
      <el-empty description="请先在视图配置中选择分组字段（单选类型）" />
    </div>
    <div v-else class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.key"
        class="kanban-col"
        @dragover.prevent
        @drop="onDrop(col.key, $event)"
      >
        <div class="col-header">
          <el-tag :type="getTagType(col.key)" effect="light" size="default">
            {{ col.label }}
          </el-tag>
          <span class="col-count">{{ col.records.length }}</span>
        </div>
        <div class="col-body">
          <div
            v-for="rec in col.records"
            :key="rec.id"
            class="kanban-card"
            draggable="true"
            @dragstart="onDragStart(rec.id, $event)"
            @click="$emit('click-card', rec)"
          >
            <div v-for="fd in displayFields" :key="fd.id" class="card-row">
              <span class="card-label">{{ fd.name }}</span>
              <FieldCell :field="fd" :value="rec.data[fd.id]" />
            </div>
            <div v-if="displayFields.length === 0" class="card-empty">点击查看</div>
          </div>
          <div v-if="col.records.length === 0" class="col-empty">暂无</div>
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
  groupBy: string
}>()

const emit = defineEmits<{
  (e: 'update-card', recordId: number, value: any): void
  (e: 'click-card', record: any): void
}>()

const groupField = computed(() => props.fields.find(f => f.id === props.groupBy))

const displayFields = computed(() =>
  props.fields.filter(f => f.id !== props.groupBy).slice(0, 4)
)

const columns = computed(() => {
  const opts = groupField.value?.config?.options || []
  const cols: Array<{ key: string; label: string; records: any[] }> = []
  const uncategorized: any[] = []
  opts.forEach((o: string) => cols.push({ key: o, label: o, records: [] }))
  cols.push({ key: '__none__', label: '未分类', records: uncategorized })
  for (const r of props.records) {
    const v = r.data?.[props.groupBy]
    const found = cols.find(c => c.key === v)
    if (found) found.records.push(r)
    else uncategorized.push(r)
  }
  return cols
})

function onDragStart(id: number, e: DragEvent) {
  e.dataTransfer?.setData('text/plain', String(id))
}

function onDrop(colKey: string, e: DragEvent) {
  const id = Number(e.dataTransfer?.getData('text/plain'))
  if (!id) return
  emit('update-card', id, colKey === '__none__' ? '' : colKey)
}

function getTagType(value: string): any {
  const colors: any = ['primary', 'success', 'warning', 'info', 'danger']
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  return colors[hash % colors.length]
}
</script>

<style scoped>
.kanban-view { height: 100%; padding: 16px; overflow: auto; }
.kanban-empty { padding: 60px 0; }
.kanban-board {
  display: flex;
  gap: 12px;
  height: 100%;
  align-items: flex-start;
}
.kanban-col {
  width: 280px;
  flex-shrink: 0;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
}
.col-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 0 4px;
}
.col-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-bg-color);
  padding: 2px 8px;
  border-radius: 10px;
}
.col-body {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.kanban-card {
  background: var(--el-bg-color);
  border-radius: 6px;
  padding: 12px;
  cursor: grab;
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.15s;
}
.kanban-card:hover {
  border-color: #F26522;
  box-shadow: 0 2px 8px rgba(242, 101, 34, 0.1);
}
.kanban-card:active { cursor: grabbing; }
.card-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 6px;
  font-size: 12px;
}
.card-row:last-child { margin-bottom: 0; }
.card-label {
  color: var(--el-text-color-secondary);
  min-width: 56px;
  font-size: 11px;
}
.card-empty { color: var(--el-text-color-placeholder); font-size: 12px; text-align: center; }
.col-empty {
  text-align: center;
  color: var(--el-text-color-placeholder);
  padding: 20px 0;
  font-size: 12px;
}
</style>

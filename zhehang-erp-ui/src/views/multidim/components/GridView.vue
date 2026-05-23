<template>
  <div class="grid-view">
    <el-table
      :data="records"
      border
      stripe
      style="width: 100%"
      height="100%"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="44" />
      <el-table-column type="index" label="#" width="50" align="center" />
      <el-table-column
        v-for="fd in fields"
        :key="fd.id"
        :label="fd.name"
        min-width="160"
      >
        <template #header>
          <div class="col-header">
            <el-icon class="field-icon"><component :is="getFieldIcon(fd.type)" /></el-icon>
            <span>{{ fd.name }}</span>
            <el-dropdown trigger="click" class="col-menu">
              <el-icon class="more-btn"><ArrowDown /></el-icon>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('delete-field', fd.id)">{{ $t('multidim.deleteField') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
        <template #default="{ row }">
          <div class="cell-wrap" @dblclick="startEdit(row, fd)">
            <FieldEditor
              v-if="editingKey === row.id + '-' + fd.id"
              :model-value="row.data[fd.id]"
              :field="fd"
              @update:model-value="onCellUpdate(row, fd, $event)"
              @blur="endEdit"
            />
            <FieldCell v-else :field="fd" :value="row.data[fd.id]" />
          </div>
        </template>
      </el-table-column>
      <el-table-column width="60">
        <template #header>
          <el-icon class="add-col-btn" @click="$emit('add-field')"><Plus /></el-icon>
        </template>
        <template #default="{ row }">
          <el-icon class="row-del" @click="$emit('delete-record', row.id)"><Delete /></el-icon>
        </template>
      </el-table-column>
      <template #empty>
        <div style="padding: 60px 0;">
          <el-empty :description="$t('multidim.noRecords')" />
        </div>
      </template>
    </el-table>
    <div v-if="selectedIds.length > 0" class="batch-bar">
      <span>{{ $t('multidim.selectedCount', { count: selectedIds.length }) }}</span>
      <el-button type="danger" size="small" @click="$emit('batch-delete', selectedIds)">
        <el-icon><Delete /></el-icon>
        {{ $t('multidim.batchDelete') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Delete, ArrowDown, Document, Histogram, Calendar, CircleCheck, Operation, User } from '@element-plus/icons-vue'
import type { FieldDef } from '@/api/multidim'
import FieldCell from './FieldCell.vue'
import FieldEditor from './FieldEditor.vue'

const props = defineProps<{
  fields: FieldDef[]
  records: Array<{ id: number; data: Record<string, any> }>
}>()

const emit = defineEmits<{
  (e: 'update-cell', recordId: number, fieldId: string, value: any): void
  (e: 'add-field'): void
  (e: 'delete-field', fieldId: string): void
  (e: 'batch-delete', ids: number[]): void
  (e: 'delete-record', id: number): void
}>()

const selectedIds = ref<number[]>([])
const editingKey = ref('')

function handleSelectionChange(rows: any[]) {
  selectedIds.value = rows.map(r => r.id)
}

function startEdit(row: any, fd: FieldDef) {
  editingKey.value = `${row.id}-${fd.id}`
}

function endEdit() {
  setTimeout(() => { editingKey.value = '' }, 200)
}

function onCellUpdate(row: any, fd: FieldDef, val: any) {
  emit('update-cell', row.id, fd.id, val)
}

function getFieldIcon(type: string): any {
  const map: Record<string, any> = {
    text: Document, number: Histogram, date: Calendar,
    select: CircleCheck, multiselect: Operation, user: User
  }
  return map[type] || Document
}
</script>

<style scoped>
.grid-view {
  height: 100%;
  position: relative;
}
.col-header {
  display: flex;
  align-items: center;
  gap: 4px;
}
.field-icon {
  color: #F26522;
  font-size: 13px;
}
.col-menu {
  margin-left: auto;
  cursor: pointer;
}
.more-btn { color: var(--el-text-color-secondary); }
.add-col-btn {
  cursor: pointer;
  font-size: 16px;
  color: #F26522;
  padding: 4px;
  border-radius: 4px;
}
.add-col-btn:hover { background: #F265221A; }
.cell-wrap { cursor: pointer; min-height: 22px; padding: 2px 0; }
.row-del { cursor: pointer; color: var(--el-text-color-secondary); }
.row-del:hover { color: var(--el-color-danger); }
.batch-bar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  font-size: 13px;
}
</style>

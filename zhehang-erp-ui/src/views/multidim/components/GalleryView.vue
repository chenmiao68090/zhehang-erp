<template>
  <div class="gallery-view">
    <div v-if="records.length === 0" class="gal-empty">
      <el-empty :description="$t('multidim.noRecords')" />
    </div>
    <div v-else class="gal-grid">
      <div
        v-for="rec in records"
        :key="rec.id"
        class="gal-card"
        @click="$emit('click-card', rec)"
      >
        <div class="gal-cover">
          <el-icon :size="32"><Picture /></el-icon>
        </div>
        <div class="gal-body">
          <h5 v-if="titleField" class="gal-title">{{ rec.data?.[titleField.id] || '未命名' }}</h5>
          <h5 v-else class="gal-title">记录 #{{ rec.id }}</h5>
          <div v-for="fd in detailFields" :key="fd.id" class="gal-row">
            <span class="gal-label">{{ fd.name }}</span>
            <FieldCell :field="fd" :value="rec.data[fd.id]" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Picture } from '@element-plus/icons-vue'
import type { FieldDef } from '@/api/multidim'
import FieldCell from './FieldCell.vue'

const props = defineProps<{
  fields: FieldDef[]
  records: Array<{ id: number; data: Record<string, any> }>
}>()

defineEmits<{ (e: 'click-card', record: any): void }>()

const titleField = computed(() => props.fields.find(f => f.type === 'text'))
const detailFields = computed(() =>
  props.fields.filter(f => f.id !== titleField.value?.id).slice(0, 4)
)
</script>

<style scoped>
.gallery-view { height: 100%; padding: 20px; overflow: auto; }
.gal-empty { padding: 60px 0; }
.gal-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.gal-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
}
.gal-card:hover {
  border-color: #F26522;
  box-shadow: 0 4px 16px rgba(242, 101, 34, 0.12);
  transform: translateY(-2px);
}
.gal-cover {
  height: 120px;
  background: linear-gradient(135deg, #F26522 0%, #FF8A50 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.gal-body { padding: 12px 14px; }
.gal-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gal-row {
  display: flex;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 4px;
  align-items: center;
}
.gal-label {
  color: var(--el-text-color-secondary);
  min-width: 56px;
  font-size: 11px;
}
</style>

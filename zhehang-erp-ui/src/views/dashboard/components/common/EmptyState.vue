<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <el-icon :size="48">
        <DataAnalysis />
      </el-icon>
    </div>
    <p class="empty-state__title">{{ title }}</p>
    <p v-if="description" class="empty-state__desc">{{ description }}</p>
    <button
      v-if="showAction"
      class="empty-state__action"
      @click="emit('action')"
    >
      {{ actionText }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { DataAnalysis } from '@element-plus/icons-vue'

interface Props {
  icon?: string
  title?: string
  description?: string
  showAction?: boolean
  actionText?: string
}

withDefaults(defineProps<Props>(), {
  title: '暂无数据',
  description: '',
  showAction: false,
  actionText: '刷新',
})

const emit = defineEmits<{
  action: []
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 120px;
  padding: 24px;
}

.empty-state__icon {
  color: #D4AF37;
  margin-bottom: 12px;
  opacity: 0.7;
}

.empty-state__title {
  font-size: 14px;
  color: #8B8B9A;
  margin: 0 0 6px;
}

.empty-state__desc {
  font-size: 12px;
  color: #5A5A6E;
  margin: 0 0 16px;
  text-align: center;
  max-width: 200px;
}

.empty-state__action {
  padding: 6px 16px;
  font-size: 12px;
  color: #D4AF37;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.empty-state__action:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
}
</style>

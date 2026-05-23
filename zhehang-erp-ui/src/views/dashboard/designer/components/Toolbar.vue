<template>
  <div class="toolbar">
    <div class="toolbar-left">
      <button class="toolbar-btn back-btn" @click="$emit('back')">
        <el-icon><ArrowLeft /></el-icon>
      </button>
      <div class="dashboard-name" @dblclick="startEdit">
        <input
          v-if="editing"
          ref="nameInputRef"
          v-model="localName"
          class="name-input"
          @blur="finishEdit"
          @keydown.enter="finishEdit"
        />
        <span v-else class="name-text">{{ dashboardName }}</span>
      </div>
      <span class="save-indicator" :class="saveStatus">
        {{ statusText }}
      </span>
    </div>
    <div class="toolbar-center">
      <button class="toolbar-btn" disabled title="撤销">
        <el-icon><RefreshLeft /></el-icon>
      </button>
      <button class="toolbar-btn" disabled title="重做">
        <el-icon><RefreshRight /></el-icon>
      </button>
    </div>
    <div class="toolbar-right">
      <button class="toolbar-btn" @click="$emit('preview')" title="预览">
        <el-icon><View /></el-icon>
        <span class="btn-label">预览</span>
      </button>
      <button class="toolbar-btn save-btn" @click="$emit('save')">
        <el-icon><Check /></el-icon>
        <span class="btn-label">保存</span>
      </button>
      <el-dropdown trigger="click">
        <button class="toolbar-btn">
          <el-icon><MoreFilled /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>导出为图片</el-dropdown-item>
            <el-dropdown-item>复制驾驶舱</el-dropdown-item>
            <el-dropdown-item divided>删除驾驶舱</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed } from 'vue'
import { ArrowLeft, RefreshLeft, RefreshRight, View, Check, MoreFilled } from '@element-plus/icons-vue'

const props = defineProps<{
  dashboardName: string
  saveStatus: 'saved' | 'saving' | 'unsaved'
}>()

const emit = defineEmits<{
  'update:name': [name: string]
  save: []
  preview: []
  back: []
}>()

const editing = ref(false)
const localName = ref('')
const nameInputRef = ref<HTMLInputElement | null>(null)

const statusText = computed(() => {
  switch (props.saveStatus) {
    case 'saved': return '已保存'
    case 'saving': return '保存中...'
    case 'unsaved': return '未保存'
  }
})

function startEdit() {
  editing.value = true
  localName.value = props.dashboardName
  nextTick(() => {
    nameInputRef.value?.focus()
    nameInputRef.value?.select()
  })
}

function finishEdit() {
  editing.value = false
  if (localName.value.trim() && localName.value !== props.dashboardName) {
    emit('update:name', localName.value.trim())
  }
}
</script>

<style scoped>
.toolbar {
  height: 44px;
  background: #12121A;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-center,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toolbar-left {
  flex: 1;
}

.toolbar-right {
  flex: 1;
  justify-content: flex-end;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 6px;
  color: #EAEAEA;
  padding: 6px 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
}

.toolbar-btn:hover:not(:disabled) {
  border-color: rgba(212, 175, 55, 0.35);
  background: rgba(212, 175, 55, 0.05);
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.back-btn {
  border: none;
  padding: 6px;
}

.save-btn {
  background: rgba(212, 175, 55, 0.12);
  border-color: rgba(212, 175, 55, 0.4);
  color: #D4AF37;
}

.save-btn:hover {
  background: rgba(212, 175, 55, 0.2);
  border-color: #D4AF37;
}

.btn-label {
  font-size: 12px;
}

.dashboard-name {
  margin-left: 8px;
}

.name-text {
  color: #EAEAEA;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.name-text:hover {
  background: rgba(255, 255, 255, 0.05);
}

.name-input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 4px;
  color: #EAEAEA;
  font-size: 14px;
  padding: 4px 8px;
  outline: none;
  width: 200px;
}

.save-indicator {
  font-size: 11px;
  margin-left: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.save-indicator.saved {
  color: #00D084;
}

.save-indicator.saving {
  color: #FF9F43;
}

.save-indicator.unsaved {
  color: #8B8B9A;
}
</style>

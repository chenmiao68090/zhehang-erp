<template>
  <div class="icon-picker">
    <el-input
      v-model="innerValue"
      class="icon-picker-input"
      :maxlength="maxlength"
      :placeholder="placeholder"
      clearable
    >
      <template #prepend v-if="innerValue">
        <span class="icon-picker-preview">
          <el-icon v-if="isElementMode"><component :is="innerValue" /></el-icon>
          <span v-else>{{ innerValue }}</span>
        </span>
      </template>
    </el-input>

    <el-popover placement="bottom-start" trigger="click" :width="panelWidth" popper-class="icon-picker-popover">
      <template #reference>
        <el-button plain>选择图标</el-button>
      </template>
      <div class="icon-picker-panel">
        <div class="icon-picker-title">常用图标</div>
        <div class="icon-picker-grid" :style="gridStyle">
          <button
            v-for="item in normalizedOptions"
            :key="item.value"
            type="button"
            class="icon-picker-option"
            :class="{ active: innerValue === item.value, 'is-element': isElementMode }"
            @click="choose(item.value)"
          >
            <el-icon v-if="isElementMode"><component :is="item.value" /></el-icon>
            <span v-else class="icon-picker-emoji">{{ item.value }}</span>
            <small v-if="item.label">{{ item.label }}</small>
          </button>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PickerMode = 'emoji' | 'element'
type PickerOption = string | { label?: string; value: string }

const props = withDefaults(defineProps<{
  modelValue?: string
  mode?: PickerMode
  options?: PickerOption[]
  placeholder?: string
  maxlength?: number
  columns?: number
  panelWidth?: number
}>(), {
  modelValue: '',
  mode: 'emoji',
  placeholder: '可手动输入，也可以点右侧选择图标',
  maxlength: 32,
  columns: 8,
  panelWidth: 420
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const defaultEmojiOptions = [
  '🏢', '🎯', '💎', '🛡️', '🚀', '🤝', '📈', '❤️',
  '🕘', '💰', '📌', '📣', '🎉', '🏆', '⭐', '🔥',
  '📚', '📝', '🔒', '📊', '🧾', '✅', '💡', '🌱',
  '🎁', '☕', '🧭', '🔔', '📅', '👥', '🧑‍💼', '🏅'
]

const defaultElementOptions: PickerOption[] = [
  { label: '个人中心', value: 'House' },
  { label: '数字总部', value: 'Monitor' },
  { label: '客户', value: 'User' },
  { label: '审批', value: 'Stamp' },
  { label: '人文', value: 'Star' },
  { label: '订单', value: 'Document' },
  { label: '交付', value: 'Tickets' },
  { label: '渠道', value: 'Connection' },
  { label: '财务', value: 'Wallet' },
  { label: '组织', value: 'Avatar' },
  { label: '知识库', value: 'Notebook' },
  { label: '表格', value: 'Grid' },
  { label: '系统', value: 'Setting' },
  { label: '菜单', value: 'Menu' },
  { label: '消息', value: 'Bell' },
  { label: '搜索', value: 'Search' },
  { label: '电话', value: 'Phone' },
  { label: '合同', value: 'Files' },
  { label: '日历', value: 'Calendar' },
  { label: '报表', value: 'DataAnalysis' },
  { label: '任务', value: 'Checked' },
  { label: '文件', value: 'Folder' },
  { label: '安全', value: 'Lock' },
  { label: '帮助', value: 'QuestionFilled' }
]

const isElementMode = computed(() => props.mode === 'element')
const sourceOptions = computed(() => props.options?.length ? props.options : (isElementMode.value ? defaultElementOptions : defaultEmojiOptions))
const normalizedOptions = computed(() =>
  sourceOptions.value.map(item => typeof item === 'string' ? { label: '', value: item } : item)
)
const gridStyle = computed(() => ({ '--icon-picker-columns': String(props.columns) }))
const innerValue = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
})

const choose = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<style scoped>
.icon-picker {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  width: 100%;
}

.icon-picker-input {
  min-width: 0;
}

.icon-picker-preview {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  font-size: 16px;
}

.icon-picker-panel {
  width: 100%;
}

.icon-picker-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
}

.icon-picker-grid {
  display: grid;
  grid-template-columns: repeat(var(--icon-picker-columns), minmax(38px, 1fr));
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 4px;
}

.icon-picker-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid #dbe4f0;
  border-radius: 8px;
  background: #fff;
  color: #334155;
  cursor: pointer;
  transition: all .16s ease;
}

.icon-picker-option:hover {
  border-color: #2f6bff;
  background: #f4f7ff;
  color: #1d4ed8;
}

.icon-picker-option.active {
  border-color: #2f6bff;
  background: #eaf1ff;
  color: #1d4ed8;
  box-shadow: inset 0 0 0 1px rgba(47, 107, 255, .2);
}

.icon-picker-option.is-element {
  flex-direction: column;
  gap: 4px;
  min-height: 58px;
}

.icon-picker-option .el-icon {
  font-size: 18px;
}

.icon-picker-emoji {
  font-size: 18px;
  line-height: 1;
}

.icon-picker-option small {
  max-width: 100%;
  overflow: hidden;
  color: #64748b;
  font-size: 11px;
  line-height: 1.1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .icon-picker {
    grid-template-columns: 1fr;
  }
}
</style>

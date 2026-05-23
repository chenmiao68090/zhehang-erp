<template>
  <div class="rich-text-widget">
    <!-- 工具栏 -->
    <div v-if="editable" class="rich-text-toolbar">
      <button
        v-for="btn in toolbarButtons"
        :key="btn.command"
        class="toolbar-btn"
        :title="btn.title"
        @click="execCommand(btn.command, btn.value)"
      >
        {{ btn.label }}
      </button>
    </div>

    <!-- 编辑区域 -->
    <div
      v-if="editable"
      ref="editorRef"
      class="rich-text-editor"
      contenteditable="true"
      :data-placeholder="'点击输入内容...'"
      @input="handleInput"
      @blur="handleInput"
    ></div>

    <!-- 查看模式 -->
    <div
      v-else
      class="rich-text-viewer"
      v-html="content"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { WidgetConfig } from '@/views/dashboard/types/dashboard'

interface Props {
  config: WidgetConfig
  editable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
})

const emit = defineEmits<{
  'update:content': [content: string]
}>()

const editorRef = ref<HTMLDivElement | null>(null)
const content = ref(props.config.options?.content || '')

const toolbarButtons = [
  { label: 'B', command: 'bold', title: '粗体', value: undefined },
  { label: 'I', command: 'italic', title: '斜体', value: undefined },
  { label: 'H1', command: 'formatBlock', title: '标题1', value: 'h1' },
  { label: 'H2', command: 'formatBlock', title: '标题2', value: 'h2' },
  { label: 'UL', command: 'insertUnorderedList', title: '无序列表', value: undefined },
  { label: 'OL', command: 'insertOrderedList', title: '有序列表', value: undefined },
]

function execCommand(command: string, value?: string) {
  document.execCommand(command, false, value)
  editorRef.value?.focus()
  handleInput()
}

function handleInput() {
  if (editorRef.value) {
    content.value = editorRef.value.innerHTML
    emit('update:content', content.value)
  }
}

onMounted(() => {
  if (editorRef.value && content.value) {
    editorRef.value.innerHTML = content.value
  }
})

watch(
  () => props.config.options?.content,
  (newContent) => {
    if (newContent !== undefined && newContent !== content.value) {
      content.value = newContent
      if (editorRef.value && !props.editable) {
        editorRef.value.innerHTML = newContent
      }
    }
  }
)
</script>

<style scoped>
.rich-text-widget {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rich-text-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.toolbar-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #8B8B9A;
  font-size: 12px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-btn:hover {
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.1);
}

.rich-text-editor {
  flex: 1;
  min-height: 100px;
  padding: 16px;
  color: #EAEAEA;
  font-size: 14px;
  line-height: 1.6;
  outline: none;
  overflow-y: auto;
}

.rich-text-editor:empty::before {
  content: attr(data-placeholder);
  color: #5A5A6E;
  pointer-events: none;
}

.rich-text-viewer {
  flex: 1;
  padding: 16px;
  color: #EAEAEA;
  font-size: 14px;
  line-height: 1.6;
  overflow-y: auto;
}

.rich-text-viewer :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #EAEAEA;
}

.rich-text-viewer :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #EAEAEA;
}

.rich-text-viewer :deep(ul),
.rich-text-viewer :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.rich-text-viewer :deep(li) {
  margin-bottom: 4px;
}

.rich-text-viewer :deep(a) {
  color: #D4AF37;
  text-decoration: underline;
}

.rich-text-editor :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
}

.rich-text-editor :deep(h2) {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 10px;
}

.rich-text-editor :deep(ul),
.rich-text-editor :deep(ol) {
  padding-left: 20px;
  margin-bottom: 8px;
}

.rich-text-editor :deep(a) {
  color: #D4AF37;
}
</style>

<template>
  <div class="config-panel">
    <div v-if="!widget" class="panel-empty">
      <el-icon :size="32" class="empty-icon"><Setting /></el-icon>
      <p class="empty-text">请选择组件</p>
    </div>

    <template v-else>
      <div class="panel-header">
        <span class="panel-title">{{ widget.title }}</span>
        <span class="panel-type">{{ widget.type }}</span>
      </div>

      <el-tabs v-model="activeTab" class="config-tabs">
        <el-tab-pane label="数据" name="data">
          <div class="config-section">
            <el-form label-position="top" size="small">
              <el-form-item label="数据源">
                <el-select
                  :model-value="widget.dataSourceId"
                  placeholder="选择数据源"
                  @change="updateField('dataSourceId', $event)"
                >
                  <el-option label="暂无数据源" value="" disabled />
                </el-select>
              </el-form-item>

              <el-form-item label="维度字段">
                <el-select
                  :model-value="widget.dimensions"
                  multiple
                  placeholder="选择维度"
                  @change="updateField('dimensions', $event)"
                >
                  <el-option label="暂无字段" value="" disabled />
                </el-select>
              </el-form-item>

              <el-form-item label="指标字段">
                <el-select
                  :model-value="widget.metrics.map(m => m.field)"
                  multiple
                  placeholder="选择指标"
                  disabled
                >
                  <el-option label="暂无字段" value="" disabled />
                </el-select>
              </el-form-item>

              <el-form-item label="筛选条件">
                <div class="filter-placeholder">
                  <span class="placeholder-text">暂无筛选条件</span>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="样式" name="style">
          <div class="config-section">
            <el-form label-position="top" size="small">
              <el-form-item label="显示标题">
                <el-switch
                  :model-value="widget.style.showTitle"
                  @change="updateStyle('showTitle', $event)"
                />
              </el-form-item>

              <el-form-item label="背景颜色">
                <el-color-picker
                  :model-value="widget.style.backgroundColor || '#12121A'"
                  @change="updateStyle('backgroundColor', $event)"
                  show-alpha
                />
              </el-form-item>

              <el-form-item label="边框颜色">
                <el-color-picker
                  :model-value="widget.style.borderColor || 'rgba(212,175,55,0.15)'"
                  @change="updateStyle('borderColor', $event)"
                  show-alpha
                />
              </el-form-item>

              <el-form-item label="圆角">
                <el-input-number
                  :model-value="widget.style.borderRadius ?? 12"
                  :min="0"
                  :max="32"
                  @change="updateStyle('borderRadius', $event)"
                />
              </el-form-item>

              <el-form-item label="内边距">
                <el-input-number
                  :model-value="widget.style.padding ?? 16"
                  :min="0"
                  :max="48"
                  @change="updateStyle('padding', $event)"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>

        <el-tab-pane label="交互" name="interaction">
          <div class="config-section">
            <el-form label-position="top" size="small">
              <el-form-item label="刷新策略">
                <el-select
                  :model-value="widget.options.refreshStrategy || 'manual'"
                  @change="updateOption('refreshStrategy', $event)"
                >
                  <el-option label="手动刷新" value="manual" />
                  <el-option label="实时" value="realtime" />
                  <el-option label="近实时" value="near-realtime" />
                  <el-option label="定时刷新" value="scheduled" />
                </el-select>
              </el-form-item>

              <el-form-item label="刷新间隔(秒)">
                <el-input-number
                  :model-value="widget.options.refreshInterval || 60"
                  :min="5"
                  :max="3600"
                  :step="5"
                  @change="updateOption('refreshInterval', $event)"
                />
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
      </el-tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Setting } from '@element-plus/icons-vue'
import type { WidgetConfig, WidgetStyle } from '@/views/dashboard/types/dashboard'

const props = defineProps<{
  widget: WidgetConfig | null
}>()

const emit = defineEmits<{
  'update:widget': [widget: WidgetConfig]
}>()

const activeTab = ref('data')

function updateField(field: keyof WidgetConfig, value: any) {
  if (!props.widget) return
  emit('update:widget', { ...props.widget, [field]: value })
}

function updateStyle(field: keyof WidgetStyle, value: any) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    style: { ...props.widget.style, [field]: value },
  })
}

function updateOption(field: string, value: any) {
  if (!props.widget) return
  emit('update:widget', {
    ...props.widget,
    options: { ...props.widget.options, [field]: value },
  })
}
</script>

<style scoped>
.config-panel {
  width: 320px;
  background: #12121A;
  border-left: 1px solid rgba(212, 175, 55, 0.15);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.panel-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.empty-icon {
  color: rgba(212, 175, 55, 0.3);
}

.empty-text {
  color: #8B8B9A;
  font-size: 14px;
  margin: 0;
}

.panel-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-title {
  color: #EAEAEA;
  font-size: 14px;
  font-weight: 500;
}

.panel-type {
  color: #5A5A6E;
  font-size: 11px;
  background: rgba(212, 175, 55, 0.08);
  padding: 2px 8px;
  border-radius: 4px;
}

.config-section {
  padding: 16px;
}

.filter-placeholder {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(212, 175, 55, 0.15);
  border-radius: 6px;
}

.placeholder-text {
  color: #5A5A6E;
  font-size: 12px;
}

/* Element Plus 暗色覆盖 */
:deep(.el-tabs__nav-wrap::after) {
  background-color: rgba(212, 175, 55, 0.1);
}

:deep(.el-tabs__item) {
  color: #8B8B9A;
  font-size: 13px;
}

:deep(.el-tabs__item.is-active) {
  color: #D4AF37;
}

:deep(.el-tabs__active-bar) {
  background-color: #D4AF37;
}

:deep(.el-form-item__label) {
  color: #8B8B9A !important;
  font-size: 12px !important;
}

:deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.04);
  border-color: rgba(212, 175, 55, 0.15);
  box-shadow: none;
}

:deep(.el-input__inner) {
  color: #EAEAEA;
}

:deep(.el-select .el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.04);
}

:deep(.el-switch.is-checked .el-switch__core) {
  background-color: #D4AF37;
  border-color: #D4AF37;
}

:deep(.el-input-number) {
  width: 100%;
}

:deep(.config-tabs .el-tabs__header) {
  margin: 0;
  padding: 0 16px;
}
</style>

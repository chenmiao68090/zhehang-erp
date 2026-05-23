<template>
  <div v-if="visible" class="filter-tag-bar">
    <div class="ftb-left">
      <span class="ftb-summary">
        <span class="ftb-summary__label">已选条件</span>
        <span class="ftb-summary__count">{{ tagItems.length }}</span>
      </span>
      <span class="ftb-divider"></span>
      <div class="ftb-tags">
        <el-tag
          v-for="item in tagItems"
          :key="item.key"
          closable
          type="info"
          effect="light"
          class="ftb-tag"
          @close="emit('remove', item.key)"
        >
          <span class="tag-key">{{ item.label }}</span>
          <span class="tag-sep">:</span>
          <span class="tag-val">{{ item.display }}</span>
        </el-tag>
      </div>
    </div>
    <div class="ftb-right">
      <el-button text class="ftb-btn ftb-btn--ghost" @click="emit('clearAll')">
        <el-icon><Delete /></el-icon>
        清空全部
      </el-button>
      <el-button text type="primary" class="ftb-btn" @click="emit('saveTemplate')">
        <el-icon><Star /></el-icon>
        保存为方案
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Delete, Star } from '@element-plus/icons-vue'

const props = defineProps<{ filters: Record<string, any> }>()
const emit = defineEmits<{
  (e: 'remove', key: string): void
  (e: 'clearAll'): void
  (e: 'saveTemplate'): void
}>()

const labelMap: Record<string, string> = {
  registerRegion: '注册地区',
  establishmentDate: '成立时间',
  registeredCapital: '注册资本',
  enterpriseType: '企业类型',
  enterpriseStatus: '经营状态',
  taxQualification: '税务资质',
  taxAbnormalType: '税务异常',
  annualRevenue: '年营业额',
  industry: '所属行业',
  staffCount: '人员规模',
  abnormalStatus: '经营异常',
  hasContact: '联系方式',
  keyword: '关键词'
}

function display(value: any): string {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) {
    if (value.length === 2 && typeof value[0] === 'string' && /\d{4}-\d{2}-\d{2}/.test(value[0])) {
      return `${value[0]} ~ ${value[1]}`
    }
    return value.join(' / ')
  }
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

const tagItems = computed(() => {
  return Object.entries(props.filters)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0))
    .map(([k, v]) => ({
      key: k,
      label: labelMap[k] || k,
      display: display(v)
    }))
})

const visible = computed(() => tagItems.value.length > 0)
</script>

<style scoped lang="scss">
.filter-tag-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: linear-gradient(90deg, #f0f7ff 0%, #ffffff 100%);
  border: 1px solid #d9ecff;
  border-left: 3px solid #409EFF;
  border-radius: 8px;
  padding: 10px 14px;
  position: relative;
}

.ftb-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  flex-wrap: wrap;
}

.ftb-summary {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;

  &__label {
    font-size: 12px;
    color: #606266;
    letter-spacing: 0.3px;
  }

  &__count {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
    font-size: 16px;
    font-weight: 700;
    color: #409EFF;
  }
}

.ftb-divider {
  width: 1px;
  height: 14px;
  background: #d9ecff;
}

.ftb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.ftb-tag {
  background: #fff;
  border: 1px solid #b3d8ff;
  color: #303133;
  padding: 0 8px;
  height: 26px;
  line-height: 24px;
  font-size: 12px;
  border-radius: 4px;

  .tag-key {
    color: #909399;
  }
  .tag-sep {
    color: #c0c4cc;
    margin: 0 4px;
  }
  .tag-val {
    color: #409EFF;
    font-weight: 500;
  }

  :deep(.el-tag__close) {
    color: #909399;
    &:hover {
      color: #fff;
      background: #F56C6C;
    }
  }
}

.ftb-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.ftb-btn {
  font-size: 12px;
  height: 28px;
  padding: 0 8px;

  .el-icon {
    margin-right: 3px;
  }

  &--ghost {
    color: #909399;
    &:hover {
      color: #F56C6C;
    }
  }
}
</style>

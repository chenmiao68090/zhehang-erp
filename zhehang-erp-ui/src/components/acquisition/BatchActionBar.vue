<template>
  <transition name="bab-slide">
    <div v-show="selectedCount > 0" class="batch-action-bar">
      <div class="bab-inner">
        <div class="bab-left">
          <div class="bab-count">
            <span class="count-prefix">已选择</span>
            <span class="count-num">{{ selectedCount }}</span>
            <span class="count-suffix">家企业</span>
          </div>
          <span class="bab-divider"></span>
          <span class="bab-tip">
            <el-icon><InfoFilled /></el-icon>
            批量操作不可撤销，请先核对所选范围
          </span>
        </div>

        <div class="bab-right">
          <el-button class="bab-btn bab-btn--ghost" @click="emit('batchAssign')">
            <el-icon><User /></el-icon>分配给
          </el-button>
          <el-button class="bab-btn bab-btn--ghost" @click="emit('batchExport')">
            <el-icon><Download /></el-icon>导出
          </el-button>
          <el-button class="bab-btn bab-btn--ghost" @click="emit('batchAddCrm')">
            <el-icon><Plus /></el-icon>添加到CRM
          </el-button>
          <el-button class="bab-btn bab-btn--primary" @click="emit('batchUnlock')">
            <el-icon><Unlock /></el-icon>批量解锁
          </el-button>
          <span class="bab-divider"></span>
          <el-button text class="bab-btn bab-btn--cancel" @click="emit('clearSelection')">
            取消选择
          </el-button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { InfoFilled, User, Download, Plus, Unlock } from '@element-plus/icons-vue'

defineProps<{ selectedCount: number }>()
const emit = defineEmits<{
  (e: 'batchUnlock'): void
  (e: 'batchAddCrm'): void
  (e: 'batchAssign'): void
  (e: 'batchExport'): void
  (e: 'clearSelection'): void
}>()
</script>

<style scoped lang="scss">
.batch-action-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
  background: #fff;
  border-top: 1px solid #ebeef5;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.06), 0 -2px 0 rgba(64, 158, 255, 0.6);
  padding: 12px 24px;

  &::before {
    content: '';
    position: absolute;
    top: -1px; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #409EFF 30%, #67C23A 70%, transparent);
    opacity: 0.7;
  }
}

.bab-inner {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.bab-left {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  min-width: 0;
}

.bab-count {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  font-size: 13px;
  color: #606266;

  .count-prefix, .count-suffix {
    color: #909399;
    letter-spacing: 0.3px;
  }

  .count-num {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
    font-size: 22px;
    font-weight: 700;
    color: #409EFF;
    margin: 0 4px;
    line-height: 1;
  }
}

.bab-divider {
  width: 1px;
  height: 18px;
  background: #ebeef5;
}

.bab-tip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #a8abb2;
  letter-spacing: 0.3px;

  .el-icon {
    color: #E6A23C;
  }
}

.bab-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.bab-btn {
  height: 34px;
  font-weight: 500;
  letter-spacing: 0.3px;

  .el-icon {
    margin-right: 4px;
  }

  &--ghost {
    background: #fff;
    border-color: #dcdfe6;
    color: #606266;

    &:hover {
      background: #f0f7ff;
      border-color: #409EFF;
      color: #409EFF;
    }
  }

  &--primary {
    background: linear-gradient(135deg, #409EFF, #66B1FF);
    border: none;
    color: #fff;
    box-shadow: 0 4px 10px rgba(64, 158, 255, 0.3);

    &:hover {
      box-shadow: 0 6px 14px rgba(64, 158, 255, 0.42);
      transform: translateY(-1px);
    }
  }

  &--cancel {
    color: #909399;
    height: 34px;

    &:hover {
      color: #F56C6C;
      background: transparent;
    }
  }
}

/* 滑入动画 */
.bab-slide-enter-active,
.bab-slide-leave-active {
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s;
}
.bab-slide-enter-from,
.bab-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>

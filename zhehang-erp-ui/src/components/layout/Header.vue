<template>
  <header class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <Breadcrumb />
    </div>
  </header>
</template>

<script setup lang="ts">
import { Fold, Expand } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import Breadcrumb from './Breadcrumb.vue'

const appStore = useAppStore()
</script>

<style lang="scss" scoped>
.header {
  height: 48px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: var(--text-muted);
  transition: color 0.2s ease, background 0.2s ease;
  width: 32px;
  height: 32px;
  padding: 6px;
  border-radius: 8px;

  &:hover {
    color: var(--brand-primary);
    background: #f2f7ff;
  }
}
</style>

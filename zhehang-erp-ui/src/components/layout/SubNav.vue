<template>
  <nav v-if="visibleChildren.length > 1" class="sub-nav">
    <div class="sub-nav-inner">
      <router-link
        v-for="child in visibleChildren"
        :key="child.path"
        :to="`${parentPath}/${child.path}`"
        class="sub-nav-item"
        :class="{ 'is-active': isActive(child.path) }"
      >
        <el-icon v-if="child.meta?.icon" class="sub-nav-icon">
          <component :is="child.meta.icon" />
        </el-icon>
        <span class="sub-nav-text">{{ child.meta?.title }}</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const permissionStore = usePermissionStore()

/** 当前顶级模块路径，如 /leads */
const parentPath = computed(() => {
  const seg = route.path.split('/').filter(Boolean)[0]
  return seg ? `/${seg}` : ''
})

/** 当前顶级模块的路由对象 */
const parentRoute = computed<RouteRecordRaw | undefined>(() => {
  return permissionStore.routes.find(r => r.path === parentPath.value)
})

/** 当前顶级模块的非隐藏子路由 */
const visibleChildren = computed(() => {
  const children = parentRoute.value?.children || []
  return children.filter(c => !c.meta?.hidden)
})

/** 当前激活的子路由判断（路径匹配） */
function isActive(childPath: string): boolean {
  const full = `${parentPath.value}/${childPath}`
  return route.path === full || route.path.startsWith(`${full}/`)
}
</script>

<style lang="scss" scoped>
.sub-nav {
  min-height: 46px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: sticky;
  top: 0;
  z-index: 50;
  overflow-x: auto;
  overflow-y: hidden;

  &::-webkit-scrollbar { height: 0; display: none; }
  scrollbar-width: none;
}

.sub-nav-inner {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 7px 20px;
  gap: 8px;
  white-space: nowrap;
}

.sub-nav-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  font-size: 13px;
  color: var(--text-muted);
  text-decoration: none;
  letter-spacing: 0;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;
  cursor: pointer;

  .sub-nav-icon {
    font-size: 14px;
    transition: color 0.25s ease;
  }

  &::after {
    content: '';
    position: absolute;
    left: 12px;
    right: 12px;
    bottom: 4px;
    height: 2px;
    background: var(--brand-primary);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.2s ease;
  }

  &:hover {
    color: var(--text-primary);
    background: #f1f5f9;

    .sub-nav-icon { color: var(--brand-primary); }
  }

  &.is-active {
    color: var(--brand-primary);
    background: #eff6ff;
    font-weight: 600;

    .sub-nav-icon { color: var(--brand-primary); }

    &::after {
      transform: scaleX(1);
      height: 2px;
      background: var(--brand-primary);
    }
  }
}
</style>

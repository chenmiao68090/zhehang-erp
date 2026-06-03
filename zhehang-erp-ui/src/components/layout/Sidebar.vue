<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <div class="logo-icon">ZH</div>
      <div v-show="!appStore.sidebarCollapsed" class="logo-copy">
        <span class="logo-text">浙杭集团</span>
        <span class="logo-sub">运营管理平台</span>
      </div>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        unique-opened
        background-color="transparent"
        text-color="#4E5969"
        active-text-color="#3370FF"
        @select="handleSelect"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-sub-menu v-if="visibleChildren(route).length > 1" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ route.meta?.title }}</span>
            </template>
            <el-menu-item
              v-for="child in visibleChildren(route)"
              :key="child.path"
              :index="childIndex(route, child)"
            >
              <el-icon v-if="child.meta?.icon">
                <component :is="child.meta.icon" />
              </el-icon>
              <template #title>
                <span>{{ child.meta?.title }}</span>
              </template>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item v-else :index="routeIndex(route)">
            <el-icon v-if="route.meta?.icon">
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>
              <span>{{ route.meta?.title }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const activeMenu = computed(() => route.path)

/** 仅顶级模块（过滤 hidden） */
const menuRoutes = computed(() =>
  permissionStore.routes.filter(r => !r.meta?.hidden)
)

function visibleChildren(route: RouteRecordRaw) {
  return (route.children || []).filter(c => !c.meta?.hidden)
}

function normalizePath(path: string) {
  return path.replace(/\/+/g, '/')
}

function childIndex(parent: RouteRecordRaw, child: RouteRecordRaw) {
  const childPath = child.path
  if (childPath.startsWith('/')) {
    return childPath
  }
  return normalizePath(parent.path === '/' ? `/${childPath}` : `${parent.path}/${childPath}`)
}

function routeIndex(route: RouteRecordRaw) {
  if (typeof route.redirect === 'string') {
    return route.redirect
  }
  const firstChild = visibleChildren(route)[0]
  return firstChild ? childIndex(route, firstChild) : route.path
}

function handleSelect(index: string) {
  router.push(index)
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  background: #ffffff;
  border-right: 1px solid var(--border-soft);
  transition: width 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: 8px 0 20px rgba(31, 35, 41, 0.04);

  &.collapsed {
    width: 64px;

    .logo-copy { display: none; }
  }
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 14px;
  border-bottom: 1px solid var(--border-soft);

  .logo-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    background: #3370ff;
    border-radius: 8px;
    box-shadow: 0 8px 18px rgba(51, 112, 255, 0.22);
  }

  .logo-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .logo-text {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: 0;
    white-space: nowrap;
  }

  .logo-sub {
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1;
    white-space: nowrap;
  }
}

:deep(.el-menu) {
  border: none;
  padding: 8px 0 14px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  height: 42px;
  margin: 4px 10px;
  border-left: 0;
  border-radius: 8px;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    background: #f2f7ff !important;
    color: var(--brand-primary) !important;
  }

  .el-icon {
    font-size: 17px;
  }
}

:deep(.el-menu-item.is-active) {
  background: #e8f3ff !important;
  color: var(--brand-primary) !important;
  box-shadow: none;
  font-weight: 600;
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: var(--brand-primary) !important;
  background: #f2f7ff !important;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 38px;
  margin: 2px 10px 2px 18px;
  padding-left: 36px !important;
  font-size: 13px;
  color: var(--text-body);
}

.sidebar.collapsed :deep(.el-menu-item) {
  margin: 4px 8px;
  padding: 0 17px !important;
}

.sidebar.collapsed {
  :deep(.el-sub-menu__title) {
    margin: 4px 8px;
    padding: 0 17px !important;
  }
}
</style>

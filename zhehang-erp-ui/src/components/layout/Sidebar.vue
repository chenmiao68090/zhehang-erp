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
        text-color="#CBD5E1"
        active-text-color="#FFFFFF"
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
  background: linear-gradient(180deg, #0f172a 0%, #111827 56%, #0b1220 100%);
  border-right: 1px solid rgba(148, 163, 184, 0.16);
  transition: width 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: 12px 0 28px rgba(15, 23, 42, 0.08);

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
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);

  .logo-icon {
    width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
    color: #fff;
    font-size: 12px;
    font-weight: 800;
    background: linear-gradient(135deg, #2563eb 0%, #0f766e 100%);
    border-radius: 8px;
    box-shadow: 0 10px 24px rgba(37, 99, 235, 0.26);
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
    color: #f8fafc;
    letter-spacing: 0;
    white-space: nowrap;
  }

  .logo-sub {
    color: #94a3b8;
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
    background: rgba(255, 255, 255, 0.08) !important;
    color: #fff !important;
  }

  .el-icon {
    font-size: 17px;
  }
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.9), rgba(15, 118, 110, 0.82)) !important;
  color: #fff !important;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.22);
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.el-sub-menu .el-menu-item) {
  height: 38px;
  margin: 2px 10px 2px 18px;
  padding-left: 36px !important;
  font-size: 13px;
  color: #cbd5e1;
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

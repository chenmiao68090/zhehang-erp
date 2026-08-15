<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <el-scrollbar class="sidebar-menu-scroll">
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
        <!-- 单模块大类:子菜单直接平铺(去掉模块那层下拉) -->
        <template v-if="flatItems">
          <el-menu-item v-for="it in flatItems" :key="it.index" :index="it.index">
            <span class="nav-tile" :style="{ background: tileColor(it.index) }">
              <el-icon><component :is="resolveMenuIcon(it.child.meta?.title, it.child.meta?.icon)" /></el-icon>
            </span>
            <template #title>
              <span>{{ it.child.meta?.title }}</span>
            </template>
          </el-menu-item>
        </template>

        <!-- 多模块大类:按模块分组 -->
        <template v-if="!flatItems">
          <template v-for="route in menuRoutes" :key="route.path">
            <el-sub-menu v-if="visibleChildren(route).length > 1" :index="route.path">
              <template #title>
                <span class="nav-tile" :style="{ background: tileColor(route.path) }">
                  <el-icon><component :is="resolveMenuIcon(route.meta?.title, route.meta?.icon)" /></el-icon>
                </span>
                <span>{{ route.meta?.title }}</span>
              </template>
              <el-menu-item
                v-for="child in visibleChildren(route)"
                :key="child.path"
                :index="childIndex(route, child)"
              >
                <el-icon class="nav-child-icon" :style="{ color: tileColor(childIndex(route, child)) }">
                  <component :is="resolveMenuIcon(child.meta?.title, child.meta?.icon)" />
                </el-icon>
                <template #title>
                  <span>{{ child.meta?.title }}</span>
                </template>
              </el-menu-item>
            </el-sub-menu>

            <el-menu-item v-else :index="routeIndex(route)">
              <span class="nav-tile" :style="{ background: tileColor(route.path) }">
                <el-icon><component :is="resolveMenuIcon(route.meta?.title, route.meta?.icon)" /></el-icon>
              </span>
              <template #title>
                <span>{{ route.meta?.title }}</span>
              </template>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </el-scrollbar>
    <SidebarAccount />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'
import { useUserStore } from '@/stores/user'
import { MODULE_GROUP } from '@/router/routes'
import { resolveMenuIcon } from '@/utils/menu-icon'
import SidebarAccount from './SidebarAccount.vue'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const userStore = useUserStore()

const activeMenu = computed(() => route.path)

// 飞书风：每个顶级模块一个专属彩色(图标底块用)
const TILE_COLORS: Record<string, string> = {
  '/': '#3370ff',
  '/dashboard': '#7c5cff',
  '/customer': '#00b3a4',
  '/approval': '#ff8800',
  '/culture': '#f5505f',
  '/order': '#36b37e',
  '/feige-order-contract': '#0f766e',
  '/hrm': '#4c6ef5',
  '/file': '#ff7452',
  '/system': '#8c9bab',
  '/sys-org': '#3370ff',
  '/sys-account': '#00b3a4',
  '/sys-authority': '#ff8800',
  '/sys-flow': '#7c5cff',
  '/sys-integration': '#0aa5ff',
  '/sys-log': '#8c9bab',
  '/order/bookkeeping': '#3370ff',
  '/order/address': '#00b3a4',
  '/order/seal-order': '#f97316',
  '/order/gs-order': '#6366f1',
  '/order/legal': '#c0c4cc',
  '/order/bank': '#c0c4cc',
  '/order/project-apply': '#c0c4cc',
  '/order/other-value': '#c0c4cc',
  '/order/guide': '#8b5cf6',
  '/feige-order-contract/orders': '#0f766e',
  '/feige-order-contract/new-order': '#2563eb',
  '/feige-order-contract/refunds': '#dc2626',
  '/feige-order-contract/unreceived': '#d97706',
  '/feige-order-contract/contracts': '#7c3aed'
}
const PALETTE = ['#3370ff', '#7c5cff', '#00b3a4', '#ff8800', '#f5505f', '#36b37e', '#ffab00', '#9b5cff', '#0aa5ff', '#ff7452', '#20c997']
function tileColor(path: string): string {
  if (TILE_COLORS[path]) return TILE_COLORS[path]
  let h = 0
  for (let i = 0; i < path.length; i++) h = (h * 31 + path.charCodeAt(i)) >>> 0
  return PALETTE[h % PALETTE.length]
}

/** 当前所在大类 = 当前路由顶层模块所属大类 */
const activeGroup = computed(() => {
  const top = route.matched[0]
  return top ? MODULE_GROUP[top.path] : undefined
})

/** 仅显示「当前大类」下的顶级模块；navigationHidden 只隐藏菜单，不参与权限过滤。 */
const menuRoutes = computed(() =>
  permissionStore.routes.filter(r => !r.meta?.hidden && !(r.meta as any)?.navigationHidden && MODULE_GROUP[r.path] === activeGroup.value)
)

/** 单模块大类:把该模块的子菜单直接平铺(去掉模块那层下拉,如"销售体系"不再套"CRM库") */
const soleModule = computed(() => (menuRoutes.value.length === 1 ? menuRoutes.value[0] : null))
const flatItems = computed(() => {
  if (!soleModule.value) return null
  const kids = visibleChildren(soleModule.value)
  if (!kids.length) return null
  return kids.map(c => ({ child: c, index: childIndex(soleModule.value as RouteRecordRaw, c) }))
})

function visibleChildren(route: RouteRecordRaw) {
  const roles = new Set<string>()
  ;(userStore.roles || []).forEach((role) => {
    roles.add(role)
    const separator = role.indexOf('__')
    if (separator > 0) roles.add(role.slice(0, separator))
  })
  return (route.children || []).filter((child) => {
    if (child.meta?.hidden) return false
    const hiddenRoles = (child.meta as any)?.hideForRoles as string[] | undefined
    return !hiddenRoles?.some((role) => roles.has(role))
  })
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
  width: 220px;
  height: 100%;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid var(--border-soft);
  transition: width 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;
  box-shadow: 8px 0 20px rgba(31, 35, 41, 0.04);

  &.collapsed {
    width: 64px;
  }
}

.sidebar-menu-scroll {
  flex: 1;
  min-height: 0;
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
    display: block;
    flex-shrink: 0;
    border-radius: 8px;
    box-shadow: 0 6px 14px rgba(51, 112, 255, 0.26);
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
  height: 44px;
  margin: 3px 10px;
  border-left: 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
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
  height: 40px;
  line-height: 40px;
  margin: 2px 10px 2px 14px;
  padding-left: 34px !important;
  font-size: 13px;
  font-weight: 400;
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

/* ===== 飞书风：彩色圆角图标底块 ===== */
.nav-tile {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  margin-right: 10px;
  flex-shrink: 0;
  box-shadow: 0 1px 2px rgba(31, 35, 41, 0.08);

  :deep(.el-icon) {
    font-size: 15px !important;
    color: #fff !important;
    margin: 0 !important;
  }
}

/* 折叠时图标块居中、去掉右间距 */
.sidebar.collapsed .nav-tile {
  margin-right: 0;
}

/* 子菜单图标：用所属模块色,无底块,区分层级 */
.nav-child-icon {
  font-size: 15px;
}
</style>

<template>
  <aside class="sidebar" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="sidebar-logo">
      <img src="/vite.svg" alt="Logo" class="logo-icon" />
      <span v-show="!appStore.sidebarCollapsed" class="logo-text">浙杭企服</span>
    </div>
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="appStore.sidebarCollapsed"
        :collapse-transition="false"
        router
        background-color="transparent"
        text-color="#A09B8C"
        active-text-color="#D4AF37"
      >
        <template v-for="route in menuRoutes" :key="route.path">
          <el-sub-menu v-if="route.children && route.children.length > 1" :index="route.path">
            <template #title>
              <el-icon v-if="route.meta?.icon">
                <component :is="route.meta.icon" />
              </el-icon>
              <span>{{ translateTitle(route.meta?.title) }}</span>
            </template>
            <el-menu-item
              v-for="child in route.children.filter(c => !c.meta?.hidden)"
              :key="child.path"
              :index="`${route.path}/${child.path}`"
            >
              <span>{{ translateTitle(child.meta?.title) }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item
            v-else-if="route.children && route.children.length === 1"
            :index="route.redirect || `${route.path}/${route.children[0].path}`"
          >
            <el-icon v-if="route.children[0].meta?.icon || route.meta?.icon">
              <component :is="route.children[0].meta?.icon || route.meta?.icon" />
            </el-icon>
            <template #title>
              <span>{{ translateTitle(route.children[0].meta?.title || route.meta?.title) }}</span>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import { usePermissionStore } from '@/stores/permission'

const route = useRoute()
const appStore = useAppStore()
const permissionStore = usePermissionStore()
const { t } = useI18n()

const activeMenu = computed(() => route.path)
const menuRoutes = computed(() => permissionStore.routes.filter(r => !r.meta?.hidden))

const translateTitle = (title: string | undefined) => {
  if (!title) return ''
  // 如果包含'.'，说明是i18n key，需要翻译
  if (title.includes('.')) {
    const translated = t(title)
    // 如果翻译结果与key相同（未找到翻译），返回原始值
    return translated === title ? title : translated
  }
  return title
}
</script>

<style lang="scss" scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;
  background: linear-gradient(180deg, #0A0A0F 0%, #12121A 100%);
  border-right: 1px solid rgba(212, 175, 55, 0.1);
  transition: width 0.3s ease;
  z-index: 1001;
  display: flex;
  flex-direction: column;

  &.collapsed {
    width: 64px;
    .logo-text { display: none; }
  }
}

.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);

  .logo-icon {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .logo-text {
    margin-left: 10px;
    font-family: 'Orbitron', 'Microsoft YaHei', sans-serif;
    font-size: 18px;
    font-weight: 700;
    color: #D4AF37;
    letter-spacing: 2px;
    white-space: nowrap;
  }
}

:deep(.el-menu) {
  border: none;
}

:deep(.el-menu-item) {
  border-left: 3px solid transparent;
  margin: 2px 0;
  transition: all 0.3s ease;

  &:hover {
    background-color: rgba(212, 175, 55, 0.05) !important;
    color: #F0E6D3 !important;
  }

  &.is-active {
    background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent) !important;
    color: #D4AF37 !important;
    border-left-color: #D4AF37;
  }
}

:deep(.el-sub-menu__title) {
  border-left: 3px solid transparent;

  &:hover {
    background-color: rgba(212, 175, 55, 0.05) !important;
    color: #F0E6D3 !important;
  }
}

:deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #D4AF37 !important;
}
</style>

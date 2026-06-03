<template>
  <header class="header">
    <div class="header-left">
      <el-icon class="collapse-btn" @click="appStore.toggleSidebar">
        <Fold v-if="!appStore.sidebarCollapsed" />
        <Expand v-else />
      </el-icon>
      <Breadcrumb />
    </div>
    <div class="header-right">
      <el-input v-model="searchText" :placeholder="$t('common.search')" prefix-icon="Search" class="global-search" clearable />
      <MessageCenter />
      <el-dropdown v-if="useMockRoles" trigger='click' @command='handleRoleSwitch'>
        <div class='role-badge'>
          <el-icon class='role-icon'><UserFilled /></el-icon>
          <span class='role-label'>{{ currentRoleLabel }}</span>
          <el-icon class='role-arrow'><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for='role in SYSTEM_ROLES'
              :key='role.value'
              :command='role.value'
              :disabled='userStore.roles.includes(role.value)'
            >
              <span class='role-menu-item'>
                {{ role.label }}
                <el-icon v-if='userStore.roles.includes(role.value)' class='role-check'><Check /></el-icon>
              </span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <div v-else class='role-badge role-badge--static'>
        <el-icon class='role-icon'><UserFilled /></el-icon>
        <span class='role-label'>{{ currentRoleLabel }}</span>
      </div>
      <span class='header-divider'></span>
      <el-dropdown trigger='click'>
        <div class='user-info'>
          <el-avatar :size='32' src='' />
          <span class='username'>{{ userStore.userInfo?.nickname || '管理员' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item divided @click='handleLogout'>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Fold, Expand, ArrowDown, UserFilled, Check } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { SYSTEM_ROLES, useUserStore } from '@/stores/user'
import Breadcrumb from './Breadcrumb.vue'
import MessageCenter from '@/components/MessageCenter.vue'

const router = useRouter()
const { t } = useI18n()
const appStore = useAppStore()
const userStore = useUserStore()
const searchText = ref('')
const useMockRoles = import.meta.env.VITE_USE_MOCK === 'true'

const ROLE_LABELS: Record<string, string> = {
  admin: '超级管理员',
  super_admin: '超级管理员',
  sys_admin: '系统管理员',
  dept_manager: '部门主管',
  manager: '主管',
  boss: '老板',
  finance: '财务人员',
  sales: '销售人员',
  user: '普通用户'
}

const currentRoleLabel = computed(() => {
  const role = userStore.roles[0] || 'admin'
  return ROLE_LABELS[role] || SYSTEM_ROLES.find(r => r.value === role)?.label || role
})

async function handleRoleSwitch(role: string) {
  if (userStore.roles.includes(role)) return
  await userStore.switchRole(role)
  const roleLabel = SYSTEM_ROLES.find(r => r.value === role)?.label || role
  ElMessage.success(`已切换为「${roleLabel}」视角`)
  router.push('/')
}

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
  await userStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
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
  width: 34px;
  height: 34px;
  padding: 7px;
  border-radius: 8px;

  &:hover {
    color: var(--brand-primary);
    background: #eff6ff;
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.global-search {
  width: 220px;

  :deep(.el-input__wrapper) {
    background: #f8fafc !important;
    border-color: var(--border-color) !important;
  }
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  height: 32px;
  padding: 0 10px;
  background: #eff6ff;
  border: 1px solid #bedaff;
  border-radius: 999px;
  transition: background 0.2s ease, border-color 0.2s ease;

  &:hover {
    background: #dbeafe;
    border-color: #7aa2ff;
  }

  .role-icon {
    font-size: 12px;
    color: var(--brand-primary);
  }

  .role-label {
    font-size: 12px;
    color: #1d4ed8;
    line-height: 1;
    letter-spacing: 0;
  }

  .role-arrow {
    font-size: 10px;
    color: var(--brand-primary);
  }

  &.role-badge--static {
    cursor: default;

    &:hover {
      background: #eff6ff;
      border-color: #bedaff;
    }
  }
}

.header-divider {
  display: inline-block;
  width: 1px;
  height: 18px;
  background: var(--border-color);
}

.role-menu-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 96px;
  justify-content: space-between;

  .role-check {
    color: var(--brand-primary);
    font-size: 12px;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: #f1f5f9;
  }

  .username {
    font-size: 14px;
    color: var(--text-body);
  }

  .el-icon {
    color: var(--text-muted);
  }
}
</style>

<template>
  <div class="sidebar-account" :class="{ collapsed: appStore.sidebarCollapsed }">
    <MessageCenter v-if="!impersonationStore.active" placement="sidebar-bottom" />

    <el-dropdown trigger="click" placement="top-start" :teleported="true">
      <button class="account-trigger" type="button" title="账户菜单">
        <el-avatar :size="32" class="account-avatar">{{ displayName.charAt(0) }}</el-avatar>
        <span v-if="!appStore.sidebarCollapsed" class="account-name">{{ displayName }}</span>
        <el-icon v-if="!appStore.sidebarCollapsed" class="account-caret"><ArrowUp /></el-icon>
      </button>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-if="canStartImpersonation" :icon="View" @click="switcherVisible = true">切换员工视角</el-dropdown-item>
          <el-dropdown-item :icon="User" @click="goProfile">个人中心</el-dropdown-item>
          <el-dropdown-item v-if="!impersonationStore.active" :icon="Lock" @click="openPwdDialog">修改密码</el-dropdown-item>
          <el-dropdown-item v-if="!impersonationStore.active" divided :icon="ZoomIn" disabled>字体大小</el-dropdown-item>
          <template v-if="!impersonationStore.active">
            <el-dropdown-item
              v-for="opt in FONT_OPTIONS"
              :key="opt.value"
              @click="appStore.setFontScale(opt.value)"
            >
              <span class="menu-option">
                <span>{{ opt.label }}</span>
                <el-icon v-if="appStore.fontScale === opt.value" class="font-check"><Check /></el-icon>
              </span>
            </el-dropdown-item>
          </template>
          <el-dropdown-item v-if="!impersonationStore.active" divided :icon="Grid" disabled>表格密度</el-dropdown-item>
          <template v-if="!impersonationStore.active">
            <el-dropdown-item
              v-for="opt in TABLE_DENSITY_OPTIONS"
              :key="opt.value"
              @click="appStore.setTableDensity(opt.value)"
            >
              <span class="menu-option">
                <span>{{ opt.label }}</span>
                <el-icon v-if="appStore.tableDensity === opt.value" class="font-check"><Check /></el-icon>
              </span>
            </el-dropdown-item>
          </template>
          <el-dropdown-item v-if="!impersonationStore.active" divided :icon="SwitchButton" @click="handleLogout">退出登录</el-dropdown-item>
          <el-dropdown-item v-else divided :icon="SwitchButton" @click="impersonationStore.end">退出员工视角</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

  <el-dialog v-model="pwdVisible" title="修改密码" width="420px" append-to-body>
    <el-form ref="pwdFormRef" :model="pwdForm" :rules="pwdRules" label-width="92px">
      <el-form-item label="原密码" prop="oldPassword">
        <el-input v-model="pwdForm.oldPassword" type="password" show-password placeholder="请输入当前密码" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPassword">
        <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="至少 10 位，建议混合大小写、数字和符号" />
      </el-form-item>
      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input v-model="pwdForm.confirmPassword" type="password" show-password placeholder="再次输入新密码" @keyup.enter="submitPwd" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="pwdVisible = false">取消</el-button>
      <el-button type="primary" :loading="pwdLoading" @click="submitPwd">确定</el-button>
    </template>
  </el-dialog>

  <ImpersonationSwitcher v-model="switcherVisible" />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { ArrowUp, Check, Grid, Lock, SwitchButton, User, View, ZoomIn } from '@element-plus/icons-vue'
import { userApi } from '@/api/system'
import MessageCenter from '@/components/MessageCenter.vue'
import ImpersonationSwitcher from '@/components/impersonation/ImpersonationSwitcher.vue'
import { useAppStore } from '@/stores/app'
import { useImStore } from '@/stores/im'
import { useImpersonationStore } from '@/stores/impersonation'
import { useUserStore } from '@/stores/user'
import { IMPERSONATION_ACTOR_USER_ID } from '@/utils/impersonation-session'
import { markLogoutTransition } from '@/utils/logout-transition'

const router = useRouter()
const appStore = useAppStore()
const imStore = useImStore()
const impersonationStore = useImpersonationStore()
const userStore = useUserStore()

const displayName = computed(() => userStore.userInfo?.nickname || '管理员')
const FONT_OPTIONS: { value: 'standard' | 'large' | 'xlarge'; label: string }[] = [
  { value: 'standard', label: '标准' },
  { value: 'large', label: '大' },
  { value: 'xlarge', label: '特大' }
]
const TABLE_DENSITY_OPTIONS: { value: 'compact' | 'comfortable' | 'loose'; label: string }[] = [
  { value: 'compact', label: '紧凑' },
  { value: 'comfortable', label: '舒适' },
  { value: 'loose', label: '宽松' }
]
const switcherVisible = ref(false)
const canStartImpersonation = computed(() =>
  Number(userStore.userInfo?.id ?? userStore.userInfo?.userId) === IMPERSONATION_ACTOR_USER_ID
    && !impersonationStore.active
)

function goProfile() {
  router.push('/dashboard/home')
}

async function handleLogout() {
  await ElMessageBox.confirm('确定退出登录吗？', '提示', { type: 'warning' })
  imStore.disconnect()
  try {
    await userStore.logout()
    markLogoutTransition()
    window.location.replace('/login')
  } catch (_error) {
    await ElMessageBox.alert('退出未完全完成，系统将刷新当前页面，请稍后重试。', '退出失败', {
      type: 'error',
      confirmButtonText: '知道了'
    }).catch(() => undefined)
    window.location.reload()
  }
}

const pwdVisible = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref<FormInstance>()
const pwdForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const pwdRules: FormRules = {
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 10, max: 128, message: '新密码长度必须为 10 至 128 位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: (error?: Error) => void) => {
        if (value !== pwdForm.newPassword) callback(new Error('两次输入的新密码不一致'))
        else callback()
      },
      trigger: 'blur'
    }
  ]
}

function openPwdDialog() {
  pwdForm.oldPassword = ''
  pwdForm.newPassword = ''
  pwdForm.confirmPassword = ''
  pwdFormRef.value?.clearValidate()
  pwdVisible.value = true
}

async function submitPwd() {
  if (!pwdFormRef.value) return
  await pwdFormRef.value.validate(async (valid) => {
    if (!valid) return
    pwdLoading.value = true
    try {
      await userApi.updateMyPwd({ oldPassword: pwdForm.oldPassword, newPassword: pwdForm.newPassword })
      ElMessage.success('密码修改成功，所有登录会话已失效，请重新登录')
      pwdVisible.value = false
      userStore.resetState()
      await router.replace('/login')
    } catch (error: any) {
      ElMessage.error(error?.message || '修改失败')
    } finally {
      pwdLoading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.sidebar-account {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 64px;
  padding: 10px;
  border-top: 1px solid var(--border-soft, #eceef1);
  background: #fff;
  box-sizing: border-box;
}

.account-trigger {
  min-width: 0;
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 5px 7px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: var(--text-body, #4e5969);
  cursor: pointer;
  text-align: left;
  transition: background .18s ease, color .18s ease;

  &:hover,
  &:focus-visible {
    color: var(--brand-primary, #3370ff);
    background: #f2f7ff;
    outline: none;
  }
}

.account-avatar {
  flex: 0 0 auto;
  background: #e8f1ff !important;
  color: var(--brand-primary, #3370ff) !important;
  font-size: 14px;
  font-weight: 650;
}

.account-name {
  min-width: 0;
  flex: 1;
  overflow: hidden;
  font-size: 14px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-caret {
  flex: 0 0 auto;
  color: var(--text-muted, #86909c);
}

.menu-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 72px;

  .font-check {
    color: var(--brand-primary, #3370ff);
  }
}

.sidebar-account.collapsed {
  min-height: 104px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 8px 6px;

  .account-trigger {
    flex: 0 0 40px;
    width: 40px;
    justify-content: center;
    padding: 4px;
  }
}
</style>

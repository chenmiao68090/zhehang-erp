<script setup lang="ts">
/**
 * RoleSwitcher - 角色切换调试浮窗
 * 演示用: 在右下角悬浮按钮, 点击展开角色面板
 * 切换角色后, 全应用的 useCrmPermission 都会响应式更新
 */
import { computed, ref } from 'vue'
import {
  type CrmRole,
  allRoles,
  permissionLabels,
  roleAbbr,
  roleColors,
  roleLabels,
} from '@/utils/crm-permission'
import { useCrmPermission } from '@/composables/useCrmPermission'

const {
  currentRole,
  permissions,
  roleLabel,
  dataScope,
  dataScopeLabel,
  switchRole,
} = useCrmPermission()

const expanded = ref<boolean>(false)

function toggle() {
  expanded.value = !expanded.value
}

function handleSwitch(role: CrmRole) {
  if (role === currentRole.value) return
  switchRole(role)
}

const currentColor = computed(() => roleColors[currentRole.value])
const currentAbbr = computed(() => roleAbbr[currentRole.value])

const dataScopeBadge = computed(() => {
  switch (dataScope.value) {
    case 'all':
      return { text: 'ALL', color: '#F56C6C' }
    case 'team':
      return { text: 'TEAM', color: '#E6A23C' }
    case 'self':
      return { text: 'SELF', color: '#67C23A' }
    default:
      return { text: 'SELF', color: '#909399' }
  }
})
</script>

<template>
  <div class="role-switcher" :class="{ 'is-expanded': expanded }">
    <!-- 展开面板 -->
    <transition name="rs-panel">
      <div v-if="expanded" class="rs-panel">
        <div class="rs-panel__header">
          <div class="rs-panel__title">
            <span class="rs-panel__title-tag">DEMO</span>
            <span class="rs-panel__title-text">权限角色调试器</span>
          </div>
          <span class="rs-panel__close" @click="toggle">×</span>
        </div>

        <!-- 当前角色摘要 -->
        <div class="rs-current" :style="{ '--accent': currentColor }">
          <div class="rs-current__head">
            <div class="rs-current__avatar">{{ currentAbbr }}</div>
            <div class="rs-current__meta">
              <div class="rs-current__label">当前角色</div>
              <div class="rs-current__name">{{ roleLabel }}</div>
            </div>
            <div class="rs-current__scope" :style="{ background: dataScopeBadge.color }">
              {{ dataScopeBadge.text }}
            </div>
          </div>
          <div class="rs-current__scope-text">数据范围 · {{ dataScopeLabel }}</div>
        </div>

        <!-- 角色列表 -->
        <div class="rs-section-title">
          <span class="rs-bar"></span>切换角色
        </div>
        <div class="rs-roles">
          <button
            v-for="role in allRoles"
            :key="role"
            class="rs-role"
            :class="{ active: role === currentRole }"
            :style="{ '--role-color': roleColors[role] }"
            @click="handleSwitch(role)"
          >
            <span class="rs-role__abbr">{{ roleAbbr[role] }}</span>
            <span class="rs-role__name">{{ roleLabels[role] }}</span>
            <span v-if="role === currentRole" class="rs-role__check">✓</span>
          </button>
        </div>

        <!-- 权限列表 -->
        <div class="rs-section-title">
          <span class="rs-bar"></span>已授予权限
          <span class="rs-section-count">{{ permissions.length }}</span>
        </div>
        <div class="rs-perms">
          <template v-if="permissions.length > 0">
            <div v-for="p in permissions" :key="p" class="rs-perm">
              <span class="rs-perm__dot"></span>
              <span class="rs-perm__label">{{ permissionLabels[p] }}</span>
              <span class="rs-perm__code">{{ p }}</span>
            </div>
          </template>
          <div v-else class="rs-perms-empty">
            <span>无任何 CRM 操作权限(仅查看)</span>
          </div>
        </div>

        <div class="rs-tip">
          <span class="rs-tip__icon">i</span>
          <span>切换角色后页面操作按钮、联系方式脱敏会自动响应。仅供前端演示。</span>
        </div>
      </div>
    </transition>

    <!-- 悬浮按钮 -->
    <div
      class="rs-fab"
      :class="{ active: expanded }"
      :style="{ '--fab-color': currentColor }"
      @click="toggle"
    >
      <el-badge :value="dataScopeBadge.text" :color="dataScopeBadge.color" class="rs-fab__badge">
        <div class="rs-fab__inner">
          <span class="rs-fab__abbr">{{ currentAbbr }}</span>
          <span class="rs-fab__pulse"></span>
        </div>
      </el-badge>
    </div>
  </div>
</template>

<style scoped>
.role-switcher {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 9999;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* ============ 悬浮按钮 ============ */
.rs-fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--fab-color, #409eff);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 8px 24px rgba(64, 158, 255, 0.35),
    0 2px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  margin-left: auto;
}

.rs-fab:hover {
  transform: translateY(-3px) scale(1.06);
  box-shadow:
    0 12px 32px rgba(64, 158, 255, 0.45),
    0 4px 10px rgba(0, 0, 0, 0.16);
}

.rs-fab.active {
  transform: rotate(45deg) scale(0.92);
}

.rs-fab__inner {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.rs-fab__abbr {
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.5px;
  font-family: 'SF Mono', Menlo, Consolas, monospace;
  z-index: 2;
}

.rs-fab__pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--fab-color, #409eff);
  animation: rs-pulse 2.4s ease-out infinite;
  opacity: 0;
}

@keyframes rs-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.6);
    opacity: 0;
  }
}

.rs-fab__badge :deep(.el-badge__content) {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
  border: 2px solid #fff;
}

/* ============ 展开面板 ============ */
.rs-panel {
  position: absolute;
  bottom: 72px;
  right: 0;
  width: 360px;
  max-height: calc(100vh - 120px);
  background: #ffffff;
  border-radius: 14px;
  box-shadow:
    0 20px 60px rgba(0, 30, 80, 0.22),
    0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
}

.rs-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid #f0f2f5;
  background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
}

.rs-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rs-panel__title-tag {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 2px 6px;
  background: #409eff;
  color: #fff;
  border-radius: 3px;
  font-family: 'SF Mono', Menlo, monospace;
}

.rs-panel__title-text {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.rs-panel__close {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  color: #909399;
  font-size: 22px;
  line-height: 1;
  transition: all 0.2s;
}

.rs-panel__close:hover {
  background: #f5f7fa;
  color: #303133;
}

/* ============ 当前角色卡 ============ */
.rs-current {
  margin: 14px 16px 0;
  padding: 14px;
  border-radius: 10px;
  background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 8%, #fff) 0%, #fff 100%);
  border: 1px solid color-mix(in srgb, var(--accent) 25%, #ebeef5);
  position: relative;
  overflow: hidden;
}

.rs-current::before {
  content: '';
  position: absolute;
  top: -20px;
  right: -20px;
  width: 80px;
  height: 80px;
  background: var(--accent);
  opacity: 0.08;
  border-radius: 50%;
}

.rs-current__head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rs-current__avatar {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.5px;
  font-family: 'SF Mono', Menlo, monospace;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--accent) 30%, transparent);
}

.rs-current__meta {
  flex: 1;
}

.rs-current__label {
  font-size: 11px;
  color: #909399;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.rs-current__name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.rs-current__scope {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #fff;
  padding: 3px 8px;
  border-radius: 4px;
  font-family: 'SF Mono', Menlo, monospace;
}

.rs-current__scope-text {
  margin-top: 10px;
  font-size: 12px;
  color: #606266;
  padding-top: 10px;
  border-top: 1px dashed #ebeef5;
}

/* ============ 区块标题 ============ */
.rs-section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 18px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.5px;
}

.rs-bar {
  display: inline-block;
  width: 3px;
  height: 12px;
  background: #409eff;
  border-radius: 2px;
}

.rs-section-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  color: #409eff;
  background: #ecf5ff;
  padding: 1px 8px;
  border-radius: 10px;
  font-family: 'SF Mono', Menlo, monospace;
}

/* ============ 角色列表 ============ */
.rs-roles {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 16px;
}

.rs-role {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-family: inherit;
}

.rs-role:hover {
  border-color: var(--role-color);
  background: color-mix(in srgb, var(--role-color) 4%, #fff);
  transform: translateX(2px);
}

.rs-role.active {
  border-color: var(--role-color);
  background: color-mix(in srgb, var(--role-color) 8%, #fff);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--role-color) 18%, transparent);
}

.rs-role__abbr {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--role-color);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.5px;
  font-family: 'SF Mono', Menlo, monospace;
  flex-shrink: 0;
}

.rs-role__name {
  flex: 1;
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.rs-role.active .rs-role__name {
  color: var(--role-color);
  font-weight: 600;
}

.rs-role__check {
  color: var(--role-color);
  font-weight: 700;
  font-size: 14px;
}

/* ============ 权限列表 ============ */
.rs-perms {
  padding: 0 16px;
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rs-perms::-webkit-scrollbar {
  width: 4px;
}

.rs-perms::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.rs-perm {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  background: #fafbfc;
  font-size: 12px;
  transition: all 0.18s;
}

.rs-perm:hover {
  background: #ecf5ff;
}

.rs-perm__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #67c23a;
  flex-shrink: 0;
  box-shadow: 0 0 0 3px rgba(103, 194, 58, 0.15);
}

.rs-perm__label {
  flex: 1;
  color: #303133;
  font-weight: 500;
}

.rs-perm__code {
  font-size: 10px;
  color: #909399;
  font-family: 'SF Mono', Menlo, monospace;
  background: #fff;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #ebeef5;
}

.rs-perms-empty {
  padding: 16px;
  text-align: center;
  font-size: 12px;
  color: #c0c4cc;
  background: #fafbfc;
  border-radius: 6px;
  border: 1px dashed #ebeef5;
}

/* ============ 提示 ============ */
.rs-tip {
  margin: 14px 16px 16px;
  padding: 10px 12px;
  background: #fff7e8;
  border: 1px solid #faecd0;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11.5px;
  color: #b88230;
  line-height: 1.6;
}

.rs-tip__icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #e6a23c;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  font-family: 'Times New Roman', serif;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ============ 进入/退出动画 ============ */
.rs-panel-enter-active {
  transition: all 0.32s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom right;
}

.rs-panel-leave-active {
  transition: all 0.22s ease-in;
  transform-origin: bottom right;
}

.rs-panel-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}

.rs-panel-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(6px);
}
</style>

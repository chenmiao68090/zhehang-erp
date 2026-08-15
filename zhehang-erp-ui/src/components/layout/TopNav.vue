<template>
  <div class="topnav" :class="{ collapsed: appStore.sidebarCollapsed }">
    <div class="tn-logo">
      <img class="tn-logo-icon" src="/logo.svg" alt="浙杭集团" />
      <span class="tn-logo-text">浙杭集团</span>
    </div>
    <el-scrollbar class="tn-scroll">
      <div class="tn-tabs">
        <div
          v-for="g in visibleGroups"
          :key="g.name"
          class="tn-tab"
          :class="{ active: g.name === activeGroup }"
          @click="goGroup(g)"
        >
          <span class="tn-tile" :style="{ background: g.color }">
            <el-icon><component :is="g.icon" /></el-icon>
          </span>
          <span class="tn-tab-label">{{ g.name }}</span>
          <sup v-if="g.name === '审批中心' && approvalTodo > 0" class="tn-tab-badge">{{ approvalTodo > 99 ? '99+' : approvalTodo }}</sup>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { usePermissionStore } from '@/stores/permission'
import { useAppStore } from '@/stores/app'
import { NAV_GROUPS, MODULE_GROUP } from '@/router/routes'
import { approvalCenterApi } from '@/api/approval'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()
const appStore = useAppStore()

/** 当前用户有权限且可出现在导航的顶层模块；navigationHidden 不改变路由权限。 */
const topModules = computed(() => permissionStore.routes.filter((r) => !r.meta?.hidden && !(r.meta as any)?.navigationHidden))

/** 顶栏只显示"有可见模块"的大类 */
const visibleGroups = computed(() =>
  NAV_GROUPS.filter((g) => topModules.value.some((r) => MODULE_GROUP[r.path] === g.name))
)

/** 当前所在大类 = 当前路由的顶层模块所属大类 */
const activeGroup = computed(() => {
  const top = route.matched[0]
  return top ? MODULE_GROUP[top.path] : undefined
})

function visibleChildren(r: RouteRecordRaw) {
  return (r.children || []).filter((c) => !c.meta?.hidden)
}
function normalizePath(p: string) {
  return p.replace(/\/+/g, '/')
}
/** 模块落地页:优先 redirect,否则第一个可见子页 */
function landingOf(r: RouteRecordRaw): string {
  if (typeof r.redirect === 'string') return r.redirect
  const first = visibleChildren(r)[0]
  if (!first) return r.path
  const cp = first.path
  if (cp.startsWith('/')) return cp
  return normalizePath(r.path === '/' ? `/${cp}` : `${r.path}/${cp}`)
}

/** 合并大类的原默认落地模块；目标路由不可见时仍按当前用户第一个可见模块回退。 */
const PREFERRED_MODULE_PATH: Record<string, string> = {
  '任务管理': '/task-workbench',
  // V230通知路由在源码中排在设置模块之前；归组后不应改变系统管理原落地页。
  '系统管理': '/sys-flow'
}

function goGroup(g: { name: string }) {
  if (g.name === activeGroup.value) return
  const preferredPath = PREFERRED_MODULE_PATH[g.name]
  const preferred = preferredPath
    ? topModules.value.find((route) => route.path === preferredPath)
    : undefined
  const mod = preferred || topModules.value.find((r) => MODULE_GROUP[r.path] === g.name)
  if (mod) router.push(landingOf(mod))
}

// ===== 审批待办数徽标:登录后拉取,60s 轮询;进入审批中心即时刷新 =====
const approvalTodo = ref(0)
let approvalTimer: number | undefined
async function loadApprovalTodo() {
  try {
    approvalTodo.value = await approvalCenterApi.todoCount()
  } catch {
    /* 未登录/无权限时静默 */
  }
}
onMounted(() => {
  loadApprovalTodo()
  approvalTimer = window.setInterval(loadApprovalTodo, 60000)
})
onBeforeUnmount(() => {
  if (approvalTimer) window.clearInterval(approvalTimer)
})
watch(
  () => route.path,
  (p) => {
    if (p.startsWith('/approval')) loadApprovalTodo()
  }
)

</script>

<style lang="scss" scoped>
.topnav {
  display: flex;
  align-items: stretch;
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid var(--border-soft, #eceef1);
  flex-shrink: 0;
  z-index: 1002;
  box-shadow: 0 1px 6px rgba(31, 35, 41, 0.04);
}

.tn-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 220px;
  box-sizing: border-box;
  padding: 0 16px;
  flex-shrink: 0;
  border-right: 1px solid var(--border-soft, #eceef1);
  transition: width 0.3s ease;

  .tn-logo-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: block;
    box-shadow: 0 4px 10px rgba(51, 112, 255, 0.22);
  }
  .tn-logo-text {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, #1f2329);
    white-space: nowrap;
    letter-spacing: 0.5px;
  }
}

.topnav.collapsed .tn-logo {
  width: 64px;
  padding: 0;
  justify-content: center;
}
.topnav.collapsed .tn-logo-text {
  display: none;
}

.tn-scroll {
  flex: 1;
  min-width: 0;
}

.tn-tabs {
  display: flex;
  align-items: stretch;
  height: 64px;
  padding: 0 6px;
  white-space: nowrap;
}

.tn-tab {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 64px;
  padding: 0 15px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-body, #4e5969);
  border-bottom: 3px solid transparent;
  transition: color 0.15s ease, background 0.15s ease;
  white-space: nowrap;

  .tn-tile {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 7px;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(31, 35, 41, 0.12);

    .el-icon {
      font-size: 15px;
      color: #ffffff;
    }
  }

  &:hover {
    color: var(--brand-primary, #3370ff);
    background: #f2f7ff;
  }

  &.active {
    color: var(--brand-primary, #3370ff);
    font-weight: 600;
    border-bottom-color: var(--brand-primary, #3370ff);
    background: #f2f7ff;
  }
}

.tn-tab-badge {
  margin-left: 5px;
  background: #f56c6c;
  color: #fff;
  border-radius: 9px;
  font-size: 11px;
  line-height: 16px;
  height: 16px;
  min-width: 16px;
  padding: 0 5px;
  text-align: center;
  display: inline-block;
  font-weight: 600;
  flex-shrink: 0;
}

:deep(.el-scrollbar__bar.is-horizontal) {
  height: 4px;
}
</style>

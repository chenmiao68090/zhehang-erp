<script setup lang="ts">
/**
 * PermissionGuard - 通用权限守卫组件
 * 根据权限点决定是否渲染默认插槽
 *
 * 使用方式:
 *   <PermissionGuard permission="pool:distribute">
 *     <el-button>分配客户</el-button>
 *   </PermissionGuard>
 *
 *   <PermissionGuard :permission="['pool:claim','pool:distribute']" mode="any">
 *     <el-button>批量操作</el-button>
 *   </PermissionGuard>
 *
 *   <PermissionGuard permission="customer:delete">
 *     <el-button type="danger">删除</el-button>
 *     <template #disabled>
 *       <el-button type="danger" disabled>删除</el-button>
 *     </template>
 *   </PermissionGuard>
 */
import { computed } from 'vue'
import type { CrmPermission } from '@/utils/crm-permission'
import { useCrmPermission } from '@/composables/useCrmPermission'

interface Props {
  /** 权限点(单个或数组) */
  permission: CrmPermission | CrmPermission[]
  /** 多权限校验模式: any=任意一个 / all=全部 */
  mode?: 'any' | 'all'
  /** 无权限时的提示文案 */
  tip?: string
  /** 是否完全隐藏(默认 false: 仍渲染禁用占位) */
  hide?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'any',
  tip: '权限不足，无法执行此操作',
  hide: false,
})

const { canAny, canAll } = useCrmPermission()

const allowed = computed<boolean>(() => {
  const perms = Array.isArray(props.permission) ? props.permission : [props.permission]
  if (perms.length === 0) return true
  return props.mode === 'all' ? canAll(perms) : canAny(perms)
})
</script>

<template>
  <slot v-if="allowed" />
  <template v-else-if="!hide">
    <slot name="denied">
      <el-tooltip :content="tip" placement="top" effect="dark">
        <span class="permission-denied">
          <slot name="disabled">
            <slot />
          </slot>
        </span>
      </el-tooltip>
    </slot>
  </template>
</template>

<style scoped>
.permission-denied {
  display: inline-flex;
  align-items: center;
  opacity: 0.5;
  cursor: not-allowed;
  position: relative;
  user-select: none;
}

.permission-denied :deep(*) {
  pointer-events: none !important;
}

.permission-denied :deep(.el-button) {
  cursor: not-allowed !important;
}
</style>

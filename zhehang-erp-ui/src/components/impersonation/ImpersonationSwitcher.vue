<template>
  <el-dialog
    :model-value="modelValue"
    title="切换员工视角"
    width="min(780px, 94vw)"
    append-to-body
    destroy-on-close
    @update:model-value="emit('update:modelValue', $event)"
    @closed="resetDialog"
  >
    <el-alert
      title="仅用于检查员工真实权限，进入后为查看模式，不会修改该员工的角色或登录状态。"
      type="warning"
      :closable="false"
      show-icon
      class="switch-alert"
    />

    <div class="switch-filters">
      <el-input
        v-model="keyword"
        :prefix-icon="Search"
        clearable
        placeholder="搜索员工姓名"
        @input="scheduleSearch"
        @clear="loadCandidates"
        @keyup.enter="loadCandidates"
      />
      <el-tree-select
        v-model="deptId"
        :data="deptTree"
        :props="{ label: 'name', children: 'children', value: 'id' }"
        check-strictly
        clearable
        filterable
        placeholder="全部部门"
        @change="loadCandidates"
      />
    </div>

    <div v-loading="loading" class="candidate-list">
      <button
        v-for="item in candidates"
        :key="item.userId"
        type="button"
        class="candidate-row"
        :class="{ selected: selectedId === item.userId }"
        @click="selectedId = item.userId"
      >
        <el-avatar :size="38">{{ item.displayName.slice(0, 1) || '员' }}</el-avatar>
        <span class="candidate-main">
          <strong>{{ item.displayName }}</strong>
          <small>{{ item.deptName || '未设置部门' }}</small>
        </span>
        <span class="candidate-roles">
          <el-tag v-for="role in item.roleNames" :key="role" size="small" effect="plain">{{ role }}</el-tag>
          <el-tag v-if="!item.roleNames.length" size="small" type="info" effect="plain">未分配角色</el-tag>
        </span>
        <el-tag v-if="hasMultipleRoles(item)" type="danger" size="small">历史多角色</el-tag>
        <el-icon class="candidate-check"><CircleCheckFilled /></el-icon>
      </button>
      <el-empty v-if="!loading && !candidates.length" :image-size="64" description="没有符合条件的在职员工" />
    </div>

    <el-alert
      v-if="selected && hasMultipleRoles(selected)"
      title="该员工存在多个有效角色。系统将严格按后端当前合并后的真实权限展示，不能在前端任选某个角色。"
      type="error"
      :closable="false"
      show-icon
      class="role-warning"
    />

    <el-form label-position="top" class="reason-form">
      <el-form-item label="切换原因（必填）" required>
        <el-input
          v-model="reason"
          type="textarea"
          :rows="3"
          maxlength="200"
          show-word-limit
          placeholder="例如：检查销售人员权限"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="emit('update:modelValue', false)">取消</el-button>
      <el-button type="primary" :loading="impersonationStore.switching" :disabled="!canStart" @click="start">
        进入员工视角
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { CircleCheckFilled, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { impersonationApi, type ImpersonationCandidate } from '@/api/impersonation'
import { deptApi } from '@/api/org'
import { useImpersonationStore } from '@/stores/impersonation'
import { isAllowedImpersonationTargetUserId } from '@/utils/impersonation-session'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const impersonationStore = useImpersonationStore()
const keyword = ref('')
const deptId = ref<number>()
const deptTree = ref<any[]>([])
const candidates = ref<ImpersonationCandidate[]>([])
const selectedId = ref<number>()
const reason = ref('')
const loading = ref(false)
let searchTimer: number | undefined

const selected = computed(() => candidates.value.find((item) => item.userId === selectedId.value))
const canStart = computed(() => Boolean(selected.value && reason.value.trim() && !impersonationStore.switching))

function unwrapData<T>(response: unknown): T {
  const value = response as { data?: T } | T
  return ((value as { data?: T })?.data ?? value) as T
}

function hasMultipleRoles(item: ImpersonationCandidate): boolean {
  return Boolean(item.multipleRoles || item.roleCount > 1 || item.roleNames.length > 1)
}

async function loadDeptTree() {
  if (deptTree.value.length) return
  try {
    const response = await deptApi.tree()
    const data = unwrapData<any[]>(response)
    deptTree.value = Array.isArray(data) ? data : []
  } catch {
    deptTree.value = []
  }
}

async function loadCandidates() {
  if (!props.modelValue) return
  loading.value = true
  try {
    const response = await impersonationApi.candidates({
      keyword: keyword.value.trim() || undefined,
      deptId: deptId.value
    })
    const data = unwrapData<ImpersonationCandidate[]>(response)
    candidates.value = (Array.isArray(data) ? data : [])
      .filter((item) => isAllowedImpersonationTargetUserId(item.userId))
      .map((item) => ({
        ...item,
        userId: Number(item.userId),
        displayName: String(item.displayName || '员工'),
        roleNames: Array.isArray(item.roleNames) ? item.roleNames.map(String).filter(Boolean) : [],
        roleKeys: Array.isArray(item.roleKeys) ? item.roleKeys.map(String).filter(Boolean) : [],
        roleCount: Number(item.roleCount || 0),
        multipleRoles: Boolean(item.multipleRoles)
      }))
    if (selectedId.value && !candidates.value.some((item) => item.userId === selectedId.value)) {
      selectedId.value = undefined
    }
  } catch {
    candidates.value = []
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  if (searchTimer !== undefined) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(loadCandidates, 260)
}

async function start() {
  if (!selected.value) {
    ElMessage.warning('请先选择一名员工')
    return
  }
  if (!reason.value.trim()) {
    ElMessage.warning('请填写本次切换原因')
    return
  }
  try {
    await impersonationStore.start(selected.value.userId, reason.value)
  } catch (error) {
    ElMessage.error((error as Error)?.message || '切换员工视角失败')
  }
}

function resetDialog() {
  keyword.value = ''
  deptId.value = undefined
  selectedId.value = undefined
  reason.value = ''
  candidates.value = []
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) void Promise.all([loadDeptTree(), loadCandidates()])
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (searchTimer !== undefined) window.clearTimeout(searchTimer)
})
</script>

<style scoped lang="scss">
.switch-alert { margin-bottom: 16px; }
.switch-filters { display: grid; grid-template-columns: 1fr 240px; gap: 10px; margin-bottom: 12px; }
.candidate-list {
  min-height: 220px;
  max-height: 360px;
  overflow-y: auto;
  padding: 4px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #f7f8fa;
}
.candidate-row {
  position: relative;
  width: 100%;
  min-height: 62px;
  display: flex;
  align-items: center;
  gap: 11px;
  margin-bottom: 6px;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: #fff;
  color: var(--text-primary);
  text-align: left;
  cursor: pointer;
  transition: border-color .15s ease, background .15s ease;
}
.candidate-row:last-child { margin-bottom: 0; }
.candidate-row:hover { border-color: #91caff; }
.candidate-row.selected { border-color: #1677ff; background: #eaf4ff; }
.candidate-row :deep(.el-avatar) { flex: 0 0 auto; background: #e8f3ff; color: #3370ff; font-weight: 700; }
.candidate-main { min-width: 110px; display: grid; gap: 3px; }
.candidate-main strong { font-size: 15px; }
.candidate-main small { color: var(--text-muted); font-size: 12px; }
.candidate-roles { min-width: 0; flex: 1; display: flex; flex-wrap: wrap; gap: 5px; }
.candidate-check { color: #c9cdd4; font-size: 19px; }
.candidate-row.selected .candidate-check { color: #1677ff; }
.role-warning { margin-top: 12px; }
.reason-form { margin-top: 14px; }
.reason-form :deep(.el-form-item) { margin-bottom: 0; }

@media (max-width: 680px) {
  .switch-filters { grid-template-columns: 1fr; }
  .candidate-list { min-height: 180px; max-height: min(300px, 36vh); }
  .candidate-row { align-items: flex-start; flex-wrap: wrap; }
  .candidate-main { flex: 1; }
  .candidate-roles { flex-basis: calc(100% - 50px); margin-left: 49px; }
  .candidate-check { position: absolute; right: 18px; }
}
</style>

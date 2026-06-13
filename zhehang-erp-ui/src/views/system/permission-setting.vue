<template>
  <div class="perm-page">
    <!-- 左侧：角色列表 -->
    <el-card shadow="never" class="role-aside">
      <template #header>
        <div class="aside-header">
          <span>{{ $t('system.permission.roleList') }}</span>
        </div>
      </template>
      <el-input
        v-model="roleKeyword"
        :placeholder="$t('system.permission.roleSearch')"
        clearable
        size="small"
        class="role-search"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-scrollbar class="role-scroll" v-loading="roleLoading">
        <ul class="role-list">
          <li
            v-for="role in filteredRoles"
            :key="role.id"
            class="role-item"
            :class="{ active: currentRole?.id === role.id }"
            @click="selectRole(role)"
          >
            <div class="role-item-main">
              <span class="role-name">{{ role.roleName }}</span>
              <el-tag v-if="isReadonlyRole(role)" size="small" type="warning" effect="plain">
                {{ $t('system.permission.readonlyTitle') }}
              </el-tag>
            </div>
            <span class="role-key">{{ role.roleKey }}</span>
          </li>
        </ul>
        <el-empty v-if="!roleLoading && !filteredRoles.length" :description="$t('common.noData')" :image-size="80" />
      </el-scrollbar>
    </el-card>

    <!-- 右侧：权限矩阵 -->
    <el-card shadow="never" class="perm-main">
      <template #header>
        <div class="main-header">
          <div class="main-title">
            <span>{{ $t('system.permission.title') }}</span>
            <el-tag v-if="currentRole" size="small" type="info" effect="plain" class="cur-role-tag">
              {{ currentRole.roleName }}
            </el-tag>
          </div>
          <div class="main-actions" v-if="currentRole && !readonly">
            <span class="checked-summary">{{ $t('system.permission.checkedCount', { count: checkedCount }) }}</span>
            <el-button :icon="RefreshLeft" :disabled="saving" @click="restoreDefault">
              {{ $t('system.permission.restoreDefault') }}
            </el-button>
            <el-button type="primary" :icon="Check" :loading="saving" @click="save">
              {{ $t('system.permission.save') }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 未选角色 -->
      <el-empty v-if="!currentRole" :description="$t('system.permission.emptyRole')" />

      <!-- 只读角色（超管/系统管理员）-->
      <el-result
        v-else-if="readonly"
        icon="success"
        :title="$t('system.permission.readonlyTitle')"
        :sub-title="$t('system.permission.readonlyTip')"
      />

      <!-- 权限矩阵 -->
      <div v-else v-loading="menuLoading" class="perm-body">
        <el-tabs v-model="activeTab">
          <!-- 页面访问权限：目录(M)/菜单(C) -->
          <el-tab-pane name="menu" :label="$t('system.permission.tabMenu')">
            <p class="tab-desc">{{ $t('system.permission.menuDesc') }}</p>
            <div v-for="group in menuGroups" :key="group.id" class="perm-group">
              <div class="group-head">
                <span class="group-title">
                  <el-icon v-if="group.icon"><component :is="group.icon" /></el-icon>
                  {{ group.label }}
                </span>
                <div class="group-ops">
                  <el-checkbox
                    :model-value="isGroupAllChecked(group)"
                    :indeterminate="isGroupIndeterminate(group)"
                    @change="(v: any) => toggleGroup(group, !!v)"
                  >
                    {{ isGroupAllChecked(group) ? $t('system.permission.unselectAll') : $t('system.permission.selectAll') }}
                  </el-checkbox>
                </div>
              </div>
              <div class="switch-grid">
                <div v-for="node in group.items" :key="node.id" class="switch-cell">
                  <el-switch
                    v-model="checkedMap[node.id]"
                    size="small"
                    @change="onMenuToggle(node)"
                  />
                  <div class="cell-text">
                    <span class="cell-name">
                      <span v-if="node.depth > 1" class="cell-indent">{{ '— '.repeat(node.depth - 1) }}</span>
                      {{ node.menuName }}
                    </span>
                    <span class="cell-sub">{{ node.path || node.component || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-if="!menuGroups.length" :description="$t('system.permission.noMenu')" :image-size="80" />
          </el-tab-pane>

          <!-- 操作权限：按钮(F) + perms 码 -->
          <el-tab-pane name="operation" :label="$t('system.permission.tabOperation')">
            <p class="tab-desc">{{ $t('system.permission.operationDesc') }}</p>
            <div v-for="group in buttonGroups" :key="group.id" class="perm-group">
              <div class="group-head">
                <span class="group-title">
                  <el-icon v-if="group.icon"><component :is="group.icon" /></el-icon>
                  {{ group.label }}
                </span>
                <div class="group-ops">
                  <el-checkbox
                    :model-value="isGroupAllChecked(group)"
                    :indeterminate="isGroupIndeterminate(group)"
                    @change="(v: any) => toggleGroup(group, !!v)"
                  >
                    {{ isGroupAllChecked(group) ? $t('system.permission.unselectAll') : $t('system.permission.selectAll') }}
                  </el-checkbox>
                </div>
              </div>
              <div class="switch-grid">
                <div v-for="node in group.items" :key="node.id" class="switch-cell">
                  <el-switch
                    v-model="checkedMap[node.id]"
                    size="small"
                    @change="onButtonToggle(node)"
                  />
                  <div class="cell-text">
                    <span class="cell-name">{{ node.menuName }}</span>
                    <span class="cell-sub mono">{{ node.perms || '-' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <el-empty v-if="!buttonGroups.length" :description="$t('system.permission.noOperation')" :image-size="80" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, RefreshLeft, Search } from '@element-plus/icons-vue'
import { roleApi, menuApi } from '@/api/system'

const { t } = useI18n()

// 超管/系统管理员只读（与后端 seed role_key 对齐：super_admin / sys_admin / admin）
const READONLY_ROLE_KEYS = ['super_admin', 'sys_admin', 'admin']

interface MenuNode {
  id: number
  menuName: string
  parentId: number
  orderNum: number
  path?: string
  component?: string
  menuType: string // M=目录 C=菜单 F=按钮
  perms?: string
  icon?: string
  depth: number // 在所属一级模块内的层级（1=一级）
}

interface PermGroup {
  id: number
  label: string
  icon?: string
  items: MenuNode[]
}

const roleLoading = ref(false)
const roles = ref<any[]>([])
const roleKeyword = ref('')
const currentRole = ref<any>(null)

const menuLoading = ref(false)
const allMenus = ref<MenuNode[]>([]) // 扁平全量菜单（含按钮）
const activeTab = ref<'menu' | 'operation'>('menu')
const saving = ref(false)

// 勾选状态：menuId -> boolean（含目录/菜单/按钮）
const checkedMap = reactive<Record<number, boolean>>({})
// 上次保存（或加载）的快照，供"恢复默认"回滚
let savedSnapshot: Record<number, boolean> = {}

const readonly = computed(() => isReadonlyRole(currentRole.value))

function isReadonlyRole(role: any): boolean {
  return !!role && READONLY_ROLE_KEYS.includes(role.roleKey)
}

const filteredRoles = computed(() => {
  const kw = roleKeyword.value.trim().toLowerCase()
  if (!kw) return roles.value
  return roles.value.filter(
    (r) => (r.roleName || '').toLowerCase().includes(kw) || (r.roleKey || '').toLowerCase().includes(kw)
  )
})

// 一级模块（顶层目录/菜单）id -> 节点，用于分组标题
const topLevelMenus = computed(() =>
  allMenus.value.filter((m) => m.parentId === 0 && m.menuType !== 'F')
)

/** 找到某节点所属的一级模块 id（沿 parentId 上溯到顶层） */
function rootModuleId(node: MenuNode): number {
  let cur: MenuNode | undefined = node
  const byId = menuById.value
  let guard = 0
  while (cur && cur.parentId !== 0 && guard < 20) {
    const parent: MenuNode | undefined = byId.get(cur.parentId)
    if (!parent) break
    cur = parent
    guard++
  }
  return cur ? cur.id : 0
}

const menuById = computed(() => {
  const map = new Map<number, MenuNode>()
  allMenus.value.forEach((m) => map.set(m.id, m))
  return map
})

/** 计算节点在一级模块内的深度（1=一级模块本身） */
function depthOf(node: MenuNode): number {
  let d = 1
  let cur: MenuNode | undefined = node
  const byId = menuById.value
  let guard = 0
  while (cur && cur.parentId !== 0 && guard < 20) {
    const parent: MenuNode | undefined = byId.get(cur.parentId)
    if (!parent) break
    cur = parent
    d++
    guard++
  }
  return d
}

/** 页面访问权限分组：每个一级模块一组，组内含该模块下所有 M/C（按 orderNum + 层级），按钮排除 */
const menuGroups = computed<PermGroup[]>(() => buildGroups((m) => m.menuType !== 'F'))

/** 操作权限分组：每个一级模块一组，组内含该模块下所有 F 按钮 */
const buttonGroups = computed<PermGroup[]>(() => buildGroups((m) => m.menuType === 'F'))

function buildGroups(filterFn: (m: MenuNode) => boolean): PermGroup[] {
  const groupMap = new Map<number, PermGroup>()
  // 先建模块壳（保证顺序与一级目录一致）
  const tops = [...topLevelMenus.value].sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
  tops.forEach((top) => {
    groupMap.set(top.id, { id: top.id, label: top.menuName, icon: top.icon, items: [] })
  })
  // 归集成员
  allMenus.value
    .filter(filterFn)
    .forEach((m) => {
      const rid = rootModuleId(m)
      if (!groupMap.has(rid)) {
        // 无主（孤儿）节点归入"其它"组
        groupMap.set(0, groupMap.get(0) || { id: 0, label: t('system.permission.groupOther'), items: [] })
        groupMap.get(rid === 0 ? 0 : rid)?.items.push(m)
        return
      }
      groupMap.get(rid)!.items.push(m)
    })
  // 组内排序：先按层级树形顺序（depth + orderNum），过滤空组
  const result: PermGroup[] = []
  groupMap.forEach((g) => {
    if (!g.items.length) return
    g.items.sort((a, b) => (a.depth - b.depth) || ((a.orderNum || 0) - (b.orderNum || 0)) || (a.id - b.id))
    result.push(g)
  })
  return result
}

const checkedCount = computed(() => Object.values(checkedMap).filter(Boolean).length)

function isGroupAllChecked(group: PermGroup): boolean {
  return group.items.length > 0 && group.items.every((n) => checkedMap[n.id])
}
function isGroupIndeterminate(group: PermGroup): boolean {
  const checked = group.items.filter((n) => checkedMap[n.id]).length
  return checked > 0 && checked < group.items.length
}
function toggleGroup(group: PermGroup, val: boolean) {
  group.items.forEach((n) => {
    checkedMap[n.id] = val
    if (val) ensureAncestorsChecked(n)
  })
  if (!val) pruneOrphanParents()
}

/** 勾选子节点时，自动勾上所有祖先（保证菜单可见路径完整，后端按 id 集合存储） */
function ensureAncestorsChecked(node: MenuNode) {
  const byId = menuById.value
  let cur: MenuNode | undefined = node
  let guard = 0
  while (cur && cur.parentId !== 0 && guard < 20) {
    const parent: MenuNode | undefined = byId.get(cur.parentId)
    if (!parent) break
    checkedMap[parent.id] = true
    cur = parent
    guard++
  }
}

/** 取消勾选后，清理没有任何已勾选后代的父级目录，避免空目录残留 */
function pruneOrphanParents() {
  // 自底向上多趟收敛
  let changed = true
  let rounds = 0
  while (changed && rounds < 10) {
    changed = false
    rounds++
    allMenus.value.forEach((m) => {
      if (m.menuType === 'F') return
      if (!checkedMap[m.id]) return
      const hasChild = allMenus.value.some((c) => c.parentId === m.id)
      if (!hasChild) return
      const anyChildChecked = allMenus.value.some((c) => c.parentId === m.id && checkedMap[c.id])
      if (!anyChildChecked) {
        checkedMap[m.id] = false
        changed = true
      }
    })
  }
}

function onMenuToggle(node: MenuNode) {
  if (checkedMap[node.id]) {
    ensureAncestorsChecked(node)
  } else {
    // 取消目录：连带取消其所有后代
    cascadeUncheck(node)
    pruneOrphanParents()
  }
}

function onButtonToggle(node: MenuNode) {
  // 勾选按钮需保证其所属菜单/目录链路也勾上（否则按钮无依附页面）
  if (checkedMap[node.id]) ensureAncestorsChecked(node)
}

function cascadeUncheck(node: MenuNode) {
  const children = allMenus.value.filter((c) => c.parentId === node.id)
  children.forEach((c) => {
    checkedMap[c.id] = false
    cascadeUncheck(c)
  })
}

onMounted(() => {
  loadRoles()
})

async function loadRoles() {
  roleLoading.value = true
  try {
    const res: any = await roleApi.list({ pageNum: 1, pageSize: 200 })
    roles.value = res.data?.records || res.data?.list || []
    // 默认选中第一个可配置（非只读）的角色，便于直接演示
    const firstEditable = roles.value.find((r) => !isReadonlyRole(r)) || roles.value[0]
    if (firstEditable) await selectRole(firstEditable)
  } finally {
    roleLoading.value = false
  }
}

/** 全量菜单只加载一次（角色切换只换勾选态） */
async function ensureMenusLoaded() {
  if (allMenus.value.length) return
  const res: any = await menuApi.list({})
  const raw: any[] = res.data || []
  allMenus.value = raw.map((m) => {
    const node: MenuNode = {
      id: Number(m.id),
      menuName: m.menuName,
      parentId: Number(m.parentId || 0),
      orderNum: Number(m.orderNum || 0),
      path: m.path,
      component: m.component,
      menuType: m.menuType,
      perms: m.perms,
      icon: m.icon,
      depth: 1
    }
    return node
  })
  // 计算 depth（依赖 menuById，需在赋值后）
  allMenus.value.forEach((m) => { m.depth = depthOf(m) })
}

async function selectRole(role: any) {
  currentRole.value = role
  activeTab.value = 'menu'
  if (isReadonlyRole(role)) return
  menuLoading.value = true
  try {
    await ensureMenusLoaded()
    // 拉该角色已勾选的 menuId 集（后端返回 {menus, menuIds, checkedKeys}，menuIds 含所有层级）
    const res: any = await menuApi.roleMenuTreeselect(role.id)
    const ids: number[] = Array.isArray(res.data?.menuIds)
      ? res.data.menuIds
      : Array.isArray(res.data?.checkedKeys)
        ? res.data.checkedKeys
        : Array.isArray(res.data)
          ? res.data
          : []
    applyChecked(ids)
  } finally {
    menuLoading.value = false
  }
}

function applyChecked(ids: number[]) {
  const set = new Set(ids.map(Number))
  // 清空再写，避免残留上一个角色的勾选
  Object.keys(checkedMap).forEach((k) => { delete checkedMap[Number(k)] })
  allMenus.value.forEach((m) => { checkedMap[m.id] = set.has(m.id) })
  savedSnapshot = { ...checkedMap }
}

function restoreDefault() {
  ElMessageBox.confirm(t('system.permission.restoreConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(() => {
    Object.keys(checkedMap).forEach((k) => { delete checkedMap[Number(k)] })
    Object.assign(checkedMap, savedSnapshot)
    ElMessage.success(t('system.permission.restored'))
  }).catch(() => {})
}

async function save() {
  if (!currentRole.value) return
  saving.value = true
  try {
    const menuIds = allMenus.value.filter((m) => checkedMap[m.id]).map((m) => m.id)
    await roleApi.assignMenus(currentRole.value.id, menuIds)
    savedSnapshot = { ...checkedMap }
    ElMessage.success(t('system.permission.saved'))
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.perm-page {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: stretch;
  min-height: calc(100vh - 120px);
}

/* 左侧角色列表 */
.role-aside {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
    overflow: hidden;
  }
}
.aside-header {
  font-weight: 600;
}
.role-search {
  margin-bottom: 10px;
}
.role-scroll {
  flex: 1;
}
.role-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.role-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  border: 1px solid transparent;
  transition: all 0.2s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}
.role-item-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.role-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.role-key {
  display: block;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
  font-family: 'SFMono-Regular', Consolas, monospace;
}

/* 右侧权限主区 */
.perm-main {
  flex: 1;
  min-width: 0;
}
.main-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.main-title {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.main-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.checked-summary {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.tab-desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* 分组 */
.perm-group {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  margin-bottom: 14px;
  overflow: hidden;
}
.group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.group-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.switch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 4px 16px;
  padding: 12px 14px;
}
.switch-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
}
.cell-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.cell-name {
  font-size: 13px;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell-indent {
  color: var(--el-text-color-placeholder);
}
.cell-sub {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.cell-sub.mono,
.mono {
  font-family: 'SFMono-Regular', Consolas, monospace;
}
</style>

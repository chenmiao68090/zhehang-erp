<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item :label="$t('system.role.roleName')" prop="roleName">
          <el-input v-model="queryParams.roleName" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.role.roleKey')" prop="roleKey">
          <el-input v-model="queryParams.roleKey" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.role.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('common.selectPlaceholder')" clearable>
            <el-option :label="$t('common.enabled')" :value="0" />
            <el-option :label="$t('common.disabled')" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>{{ $t('common.search') }}</el-button>
          <el-button @click="resetQuery"><el-icon><Refresh /></el-icon>{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('system.role.title') }}</span>
          <div class="toolbar-btns">
            <el-button type="primary" v-hasPermi="['system:role:add']" @click="handleAdd"><el-icon><Plus /></el-icon>{{ $t('common.add') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="roleList" border stripe>
        <el-table-column :label="$t('system.role.roleName')" prop="roleName" min-width="150" />
        <el-table-column :label="$t('system.role.roleKey')" prop="roleKey" min-width="150" />
        <el-table-column :label="$t('system.role.permissionAssignment')" min-width="180">
          <template #default="{ row }">
            <el-tag type="warning" size="small">
              {{ getDataScopeLabel(row.dataScope) }}
            </el-tag>
            <el-tag v-if="row.menuIds && row.menuIds.length" size="small" style="margin-left: 4px">
              {{ $t('system.role.menuCount', { count: row.menuIds.length }) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.role.sort')" prop="roleSort" width="100" align="center" />
        <el-table-column :label="$t('system.role.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? $t('common.enabled') : $t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.role.createTime')" prop="createTime" width="180" align="center" />
        <el-table-column :label="$t('common.operation')" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-hasPermi="['system:role:edit']" @click="handleEdit(row)"><el-icon><Edit /></el-icon>{{ $t('common.edit') }}</el-button>
            <el-button link type="primary" v-hasPermi="['system:role:edit']" @click="handleDataScope(row)"><el-icon><CircleCheck /></el-icon>{{ $t('system.role.dataScope') }}</el-button>
            <el-button link type="danger" v-hasPermi="['system:role:remove']" @click="handleDelete(row)"><el-icon><Delete /></el-icon>{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pagination" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item :label="$t('system.role.roleName')" prop="roleName">
          <el-input v-model="form.roleName" :placeholder="$t('common.inputPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('system.role.roleKey')" prop="roleKey">
          <el-input v-model="form.roleKey" :placeholder="$t('common.inputPlaceholder')" />
        </el-form-item>
        <el-form-item :label="$t('system.role.dataScopeType')" prop="dataScope">
          <el-select v-model="form.dataScope" :placeholder="$t('system.role.dataScopePlaceholder')" style="width: 100%">
            <el-option :label="$t('system.role.scopeAll')" :value="1" />
            <el-option :label="$t('system.role.scopeCustom')" :value="2" />
            <el-option :label="$t('system.role.scopeDept')" :value="3" />
            <el-option :label="$t('system.role.scopeDeptBelow')" :value="4" />
            <el-option :label="$t('system.role.scopeSelf')" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('system.role.sort')" prop="roleSort">
          <el-input-number v-model="form.roleSort" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('system.role.status')" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :value="0">{{ $t('common.enabled') }}</el-radio>
            <el-radio :value="1">{{ $t('common.disabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="$t('system.role.menuPerms')" prop="menuIds">
          <el-tree ref="menuTreeRef" :data="menuTree" show-checkbox node-key="id" :props="{ label: 'label', children: 'children' }" default-expand-all />
        </el-form-item>
        <el-form-item :label="$t('system.role.remark')" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('common.inputPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Data Scope Dialog -->
    <el-dialog v-model="dataScopeVisible" :title="$t('system.role.dataScope')" width="500px">
      <el-form :model="dataScopeForm" label-width="100px">
        <el-form-item :label="$t('system.role.roleName')">
          <el-input v-model="dataScopeForm.roleName" disabled />
        </el-form-item>
        <el-form-item :label="$t('system.role.dataScopeType')">
          <el-select v-model="dataScopeForm.dataScope" style="width: 100%">
            <el-option :label="$t('system.role.scopeAll')" :value="1" />
            <el-option :label="$t('system.role.scopeCustom')" :value="2" />
            <el-option :label="$t('system.role.scopeDept')" :value="3" />
            <el-option :label="$t('system.role.scopeDeptBelow')" :value="4" />
            <el-option :label="$t('system.role.scopeSelf')" :value="5" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataScopeVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitDataScope">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { roleApi, menuApi } from '@/api/system'

const { t } = useI18n()

const dataScopeLabelKeys: Record<number, string> = {
  1: 'system.role.scopeAllShort',
  2: 'system.role.scopeCustomShort',
  3: 'system.role.scopeDeptShort',
  4: 'system.role.scopeDeptBelowShort',
  5: 'system.role.scopeSelfShort'
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  roleName: '',
  roleKey: '',
  status: undefined as number | undefined
})
const loading = ref(false)
const total = ref(0)
const roleList = ref<any[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const menuTreeRef = ref<any>()
const submitLoading = ref(false)
const form = reactive<any>({
  id: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: 0,
  dataScope: 1,
  menuIds: [],
  remark: ''
})

const rules = reactive<FormRules>({
  roleName: [{ required: true, message: () => t('system.role.roleNameRequired'), trigger: 'blur' }],
  roleKey: [{ required: true, message: () => t('system.role.roleKeyRequired'), trigger: 'blur' }],
  dataScope: [{ required: true, message: () => t('system.role.dataScopeRequired'), trigger: 'change' }]
})

const menuTree = ref<any[]>([])

const dataScopeVisible = ref(false)
const dataScopeForm = reactive<any>({
  roleId: undefined,
  roleName: '',
  dataScope: 1
})

onMounted(() => {
  getList()
  loadMenuTree()
})

async function getList() {
  loading.value = true
  try {
    const res: any = await roleApi.list(queryParams)
    roleList.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function loadMenuTree() {
  try {
    const res: any = await menuApi.treeselect()
    menuTree.value = res.data || []
  } catch (_e) {
    menuTree.value = []
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.roleName = ''
  queryParams.roleKey = ''
  queryParams.status = undefined
  handleQuery()
}

function handleAdd() {
  resetForm()
  dialogTitle.value = t('common.add')
  dialogVisible.value = true
}

async function handleEdit(row: any) {
  resetForm()
  dialogTitle.value = t('common.edit')
  let checkedKeys: number[] = []
  try {
    const res: any = await roleApi.detail(row.id)
    Object.assign(form, res.data)
    const menuRes: any = await menuApi.roleMenuTreeselect(row.id)
    checkedKeys = normalizeRoleMenuCheckedKeys(menuRes.data)
  } catch (_e) {
    return
  }
  dialogVisible.value = true
  await nextTick()
  window.setTimeout(() => {
    menuTreeRef.value?.setCheckedKeys(checkedKeys)
  }, 100)
}

function handleDelete(row: any) {
  ElMessageBox.confirm(t('system.role.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await roleApi.remove(row.id)
    ElMessage.success(t('common.success'))
    getList()
  }).catch(() => {})
}

function handleDataScope(row: any) {
  dataScopeForm.roleId = row.id
  dataScopeForm.roleName = row.roleName
  dataScopeForm.dataScope = row.dataScope || 1
  dataScopeVisible.value = true
}

async function submitDataScope() {
  await roleApi.dataScope(dataScopeForm)
  ElMessage.success(t('common.success'))
  dataScopeVisible.value = false
  getList()
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    const checkedKeys = menuTreeRef.value?.getCheckedKeys() || []
    const halfCheckedKeys = menuTreeRef.value?.getHalfCheckedKeys?.() || []
    const menuIds = Array.from(new Set([...checkedKeys, ...halfCheckedKeys]))
    const data = { ...form, menuIds }
    if (form.id) {
      await roleApi.update(data)
    } else {
      await roleApi.create(data)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

function resetForm() {
  form.id = undefined
  form.roleName = ''
  form.roleKey = ''
  form.roleSort = 0
  form.status = 0
  form.dataScope = 1
  form.menuIds = []
  form.remark = ''
  setTimeout(() => {
    menuTreeRef.value?.setCheckedKeys([])
  }, 100)
}

function collectTreeIds(nodes: any[]) {
  const ids: number[] = []
  const walk = (items: any[]) => {
    items.forEach((item) => {
      if (item?.id !== undefined && item?.id !== null) {
        ids.push(item.id)
      }
      if (Array.isArray(item?.children) && item.children.length) {
        walk(item.children)
      }
    })
  }
  walk(nodes)
  return ids
}

function normalizeRoleMenuCheckedKeys(data: any) {
  if (Array.isArray(data)) {
    return collectTreeIds(data)
  }

  if (Array.isArray(data?.menus)) {
    menuTree.value = data.menus
  }

  if (Array.isArray(data?.checkedKeys)) {
    return data.checkedKeys
  }

  if (Array.isArray(data?.menuIds)) {
    return getLeafCheckedKeys(data.menuIds, menuTree.value)
  }

  return []
}

function getLeafCheckedKeys(menuIds: number[], tree: any[]) {
  const parentIds = new Set<number>()
  const walk = (nodes: any[]) => {
    nodes.forEach((node) => {
      if (Array.isArray(node.children) && node.children.length) {
        parentIds.add(Number(node.id))
        walk(node.children)
      }
    })
  }
  walk(tree)
  return menuIds.filter((id) => !parentIds.has(Number(id)))
}

function getDataScopeLabel(scope: number) {
  return t(dataScopeLabelKeys[scope] || 'system.role.scopeCustomShort')
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
.search-card {
  margin-bottom: 16px;
}
.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .toolbar-btns {
    display: flex;
    gap: 8px;
  }
}
.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>

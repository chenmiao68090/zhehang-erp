<template>
  <div class="page-container">
    <!-- Search Bar -->
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true">
        <el-form-item :label="$t('system.user.username')" prop="username">
          <el-input v-model="queryParams.username" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.user.phone')" prop="phone">
          <el-input v-model="queryParams.phone" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.user.status')" prop="status">
          <el-select v-model="queryParams.status" :placeholder="$t('common.selectPlaceholder')" clearable>
            <el-option :label="$t('common.enabled')" :value="0" />
            <el-option :label="$t('common.disabled')" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('system.user.createTime')" prop="dateRange">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="-" :start-placeholder="$t('common.startDate')" :end-placeholder="$t('common.endDate')" value-format="YYYY-MM-DD" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuery"><el-icon><Search /></el-icon>{{ $t('common.search') }}</el-button>
          <el-button @click="resetQuery"><el-icon><Refresh /></el-icon>{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Toolbar + Table -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>{{ $t('system.user.title') }}</span>
          <div class="toolbar-btns">
            <el-button type="primary" v-hasPermi="['system:user:add']" @click="handleAdd"><el-icon><Plus /></el-icon>{{ $t('common.add') }}</el-button>
            <el-button type="danger" v-hasPermi="['system:user:remove']" :disabled="selectedIds.length === 0" @click="handleBatchDelete"><el-icon><Delete /></el-icon>{{ $t('common.batchDelete') }}</el-button>
            <el-button type="warning" v-hasPermi="['system:user:export']" @click="handleExport"><el-icon><Download /></el-icon>{{ $t('common.export') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="loading" :data="userList" border stripe @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column :label="$t('system.user.username')" prop="username" min-width="120" />
        <el-table-column :label="$t('system.user.nickname')" prop="nickname" min-width="120" />
        <el-table-column :label="$t('system.user.deptName')" prop="deptName" min-width="120" />
        <el-table-column :label="$t('system.user.roles')" prop="roleNames" min-width="140">
          <template #default="{ row }">
            <el-tag v-for="role in row.roleNames || []" :key="role" size="small">{{ role }}</el-tag>
            <span v-if="!row.roleNames || row.roleNames.length === 0">-</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.user.phone')" prop="phone" min-width="120" />
        <el-table-column :label="$t('system.user.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-switch v-if="canEditUser" v-model="row.status" :active-value="0" :inactive-value="1" @change="handleStatusChange(row)" />
            <el-tag v-else :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? $t('common.enabled') : $t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.user.createTime')" prop="createTime" width="180" align="center" />
        <el-table-column :label="$t('common.operation')" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-hasPermi="['system:user:edit']" @click="handleEdit(row)"><el-icon><Edit /></el-icon>{{ $t('common.edit') }}</el-button>
            <el-button link type="danger" v-hasPermi="['system:user:remove']" @click="handleDelete(row)"><el-icon><Delete /></el-icon>{{ $t('common.delete') }}</el-button>
            <el-button link type="warning" v-hasPermi="['system:user:resetPwd']" @click="handleResetPwd(row)"><el-icon><Key /></el-icon>{{ $t('system.user.resetPwd') }}</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pagination" v-model:current-page="queryParams.pageNum" v-model:page-size="queryParams.pageSize" :page-sizes="[10, 20, 50, 100]" :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="getList" @current-change="getList" />
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="680px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.user.username')" prop="username">
              <el-input v-model="form.username" :placeholder="$t('common.inputPlaceholder')" :disabled="!!form.id" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.user.nickname')" prop="nickname">
              <el-input v-model="form.nickname" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="!form.id">
          <el-col :span="12">
            <el-form-item :label="$t('system.user.password')" prop="password">
              <el-input v-model="form.password" type="password" :placeholder="$t('common.inputPlaceholder')" show-password />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.user.phone')" prop="phone">
              <el-input v-model="form.phone" :placeholder="$t('common.inputPlaceholder')" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.user.email')" prop="email">
              <el-input v-model="form.email" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.user.gender')" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio :value="0">{{ $t('system.user.male') }}</el-radio>
                <el-radio :value="1">{{ $t('system.user.female') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.user.status')" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="0">{{ $t('common.enabled') }}</el-radio>
                <el-radio :value="1">{{ $t('common.disabled') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.user.dept')" prop="deptId">
              <el-tree-select v-model="form.deptId" :data="deptTree" :props="{ label: 'deptName', children: 'children', value: 'id' }" :placeholder="$t('common.selectPlaceholder')" check-strictly filterable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.user.roles')" prop="roleIds">
              <el-select v-model="form.roleIds" multiple :placeholder="$t('common.selectPlaceholder')" clearable style="width: 100%">
                <el-option v-for="r in roleList" :key="r.id" :label="r.roleName" :value="r.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('system.user.remark')" prop="remark">
              <el-input v-model="form.remark" type="textarea" :rows="3" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- Reset Password Dialog -->
    <el-dialog v-model="resetPwdVisible" :title="$t('system.user.resetPwd')" width="400px">
      <el-form :model="resetPwdForm" label-width="100px">
        <el-form-item :label="$t('system.user.newPassword')">
          <el-input v-model="resetPwdForm.newPassword" type="password" show-password :placeholder="$t('common.inputPlaceholder')" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetPwdVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitResetPwd">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { userApi, roleApi, deptApi } from '@/api/system'
import { downloadBlob } from '@/utils/download'
import { useUserStore } from '@/stores/user'

const { t } = useI18n()
const userStore = useUserStore()
const canEditUser = computed(() => hasPermission('system:user:edit'))

function hasPermission(permission: string) {
  return userStore.roles.includes('admin')
    || userStore.permissions.includes('*:*:*')
    || userStore.permissions.includes(permission)
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  username: '',
  phone: '',
  status: undefined as number | undefined
})
const dateRange = ref<string[]>([])
const loading = ref(false)
const total = ref(0)
const userList = ref<any[]>([])
const selectedIds = ref<number[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const form = reactive<any>({
  id: undefined,
  username: '',
  nickname: '',
  password: '',
  phone: '',
  email: '',
  gender: 0,
  status: 0,
  deptId: undefined,
  roleIds: [],
  remark: ''
})

const rules = reactive<FormRules>({
  username: [{ required: true, message: () => t('system.user.usernameRequired'), trigger: 'blur' }],
  nickname: [{ required: true, message: () => t('system.user.nicknameRequired'), trigger: 'blur' }],
  password: [{ required: true, message: () => t('system.user.passwordRequired'), trigger: 'blur' }]
})

const resetPwdVisible = ref(false)
const resetPwdForm = reactive({ userId: 0, newPassword: '' })

const deptTree = ref<any[]>([])
const roleList = ref<any[]>([])

onMounted(() => {
  getList()
  loadDeptTree()
})

async function getList() {
  loading.value = true
  try {
    const params: any = { ...queryParams }
    if (dateRange.value && dateRange.value.length === 2) {
      params.beginTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    const res: any = await userApi.list(params)
    userList.value = res.data?.records || res.data?.list || []
    total.value = res.data?.total || 0
  } finally {
    loading.value = false
  }
}

async function loadDeptTree() {
  try {
    const res: any = await deptApi.treeselect()
    deptTree.value = res.data || []
  } catch (_e) {
    deptTree.value = []
  }
}

function handleQuery() {
  queryParams.pageNum = 1
  getList()
}

function resetQuery() {
  queryParams.username = ''
  queryParams.phone = ''
  queryParams.status = undefined
  dateRange.value = []
  handleQuery()
}

function handleSelectionChange(selection: any[]) {
  selectedIds.value = selection.map((item) => item.id)
}

async function handleAdd() {
  resetForm()
  dialogTitle.value = t('common.add')
  dialogVisible.value = true
  // 加载角色列表
  try {
    const roleRes: any = await roleApi.list({ pageSize: 999 })
    roleList.value = roleRes.data?.records || roleRes.data?.list || roleRes.data || []
  } catch (e) { /* 加载角色列表失败 */ }
}

async function handleEdit(row: any) {
  resetForm()
  dialogTitle.value = t('common.edit')
  try {
    const res: any = await userApi.detail(row.id)
    Object.assign(form, res.data)
  } catch (_e) {
    return
  }
  // 加载角色列表
  try {
    const roleRes: any = await roleApi.list({ pageSize: 999 })
    roleList.value = roleRes.data?.records || roleRes.data?.list || roleRes.data || []
  } catch (e) { /* 加载角色列表失败 */ }
  dialogVisible.value = true
}

function handleDelete(row: any) {
  ElMessageBox.confirm(t('system.user.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await userApi.remove(row.id)
    ElMessage.success(t('common.success'))
    getList()
  }).catch(() => {})
}

function handleBatchDelete() {
  ElMessageBox.confirm(t('system.user.batchDeleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    for (const id of selectedIds.value) {
      await userApi.remove(id)
    }
    ElMessage.success(t('common.success'))
    getList()
  }).catch(() => {})
}

async function handleStatusChange(row: any) {
  try {
    await userApi.changeStatus({ userId: row.id, status: row.status })
    ElMessage.success(t('common.success'))
  } catch (_e) {
    row.status = row.status === 0 ? 1 : 0
  }
}

function handleResetPwd(row: any) {
  resetPwdForm.userId = row.id
  resetPwdForm.newPassword = ''
  resetPwdVisible.value = true
}

async function submitResetPwd() {
  if (!resetPwdForm.newPassword) {
    ElMessage.warning(t('system.user.passwordRequired'))
    return
  }
  await userApi.resetPwd(resetPwdForm)
  ElMessage.success(t('common.success'))
  resetPwdVisible.value = false
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (form.id) {
      await userApi.update(form)
    } else {
      await userApi.create(form)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    getList()
  } finally {
    submitLoading.value = false
  }
}

async function handleExport() {
  const data = await userApi.export(queryParams)
  downloadBlob(data as Blob, `system-users-${Date.now()}.csv`)
  ElMessage.success(t('common.success'))
}

function resetForm() {
  form.id = undefined
  form.username = ''
  form.nickname = ''
  form.password = ''
  form.phone = ''
  form.email = ''
  form.gender = 0
  form.status = 0
  form.deptId = undefined
  form.roleIds = []
  form.remark = ''
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

<template>
  <div class="page-container">
    <el-card shadow="never" class="search-card">
      <el-form :model="queryParams" :inline="true">
        <el-form-item :label="$t('system.menu.menuName')" prop="menuName">
          <el-input v-model="queryParams.menuName" :placeholder="$t('common.inputPlaceholder')" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item :label="$t('system.menu.status')" prop="status">
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
          <span>{{ $t('system.menu.title') }}</span>
          <div class="toolbar-btns">
            <el-button type="primary" v-hasPermi="['system:menu:add']" @click="handleAdd()"><el-icon><Plus /></el-icon>{{ $t('common.add') }}</el-button>
            <el-button type="info" @click="toggleExpandAll"><el-icon><Sort /></el-icon>{{ $t('common.expandCollapse') }}</el-button>
          </div>
        </div>
      </template>

      <el-table v-if="refreshTable" v-loading="loading" :data="menuList" border row-key="id" :default-expand-all="isExpandAll" :tree-props="{ children: 'children' }">
        <el-table-column :label="$t('system.menu.menuName')" prop="menuName" min-width="180" />
        <el-table-column :label="$t('system.menu.icon')" prop="icon" width="80" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.icon"><component :is="row.icon" /></el-icon>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.menu.orderNum')" prop="orderNum" width="80" align="center" />
        <el-table-column :label="$t('system.menu.perms')" prop="perms" min-width="180" />
        <el-table-column :label="$t('system.menu.component')" prop="component" min-width="180" />
        <el-table-column :label="$t('system.menu.status')" prop="status" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 0 ? 'success' : 'danger'">{{ row.status === 0 ? $t('common.enabled') : $t('common.disabled') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('system.menu.visible')" prop="visible" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.visible === 1 ? 'success' : 'info'">{{ row.visible === 1 ? $t('system.menu.show') : $t('system.menu.hide') }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.operation')" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" v-hasPermi="['system:menu:add']" @click="handleAdd(row)"><el-icon><Plus /></el-icon>{{ $t('common.add') }}</el-button>
            <el-button link type="primary" v-hasPermi="['system:menu:edit']" @click="handleEdit(row)"><el-icon><Edit /></el-icon>{{ $t('common.edit') }}</el-button>
            <el-button link type="danger" v-hasPermi="['system:menu:remove']" @click="handleDelete(row)"><el-icon><Delete /></el-icon>{{ $t('common.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Add/Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('system.menu.parentMenu')" prop="parentId">
              <el-tree-select v-model="form.parentId" :data="menuOptions" :props="{ label: 'label', children: 'children', value: 'id' }" :placeholder="$t('common.selectPlaceholder')" check-strictly filterable />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item :label="$t('system.menu.menuType')" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="M">{{ $t('system.menu.typeDir') }}</el-radio>
                <el-radio value="C">{{ $t('system.menu.typeMenu') }}</el-radio>
                <el-radio value="F">{{ $t('system.menu.typeBtn') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item :label="$t('system.menu.menuName')" prop="menuName">
              <el-input v-model="form.menuName" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :label="$t('system.menu.orderNum')" prop="orderNum">
              <el-input-number v-model="form.orderNum" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.menuType !== 'F'">
          <el-col :span="12">
            <el-form-item :label="$t('system.menu.path')" prop="path">
              <el-input v-model="form.path" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType === 'C'">
            <el-form-item :label="$t('system.menu.component')" prop="component">
              <el-input v-model="form.component" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.menuType !== 'M'">
          <el-col :span="12">
            <el-form-item :label="$t('system.menu.perms')" prop="perms">
              <el-input v-model="form.perms" :placeholder="$t('system.menu.permsPlaceholder')" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.menuType !== 'F'">
          <el-col :span="8">
            <el-form-item :label="$t('system.menu.icon')" prop="icon">
              <el-input v-model="form.icon" :placeholder="$t('common.inputPlaceholder')" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('system.menu.status')" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio :value="0">{{ $t('common.enabled') }}</el-radio>
                <el-radio :value="1">{{ $t('common.disabled') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item :label="$t('system.menu.visible')" prop="visible">
              <el-radio-group v-model="form.visible">
                <el-radio :value="1">{{ $t('system.menu.show') }}</el-radio>
                <el-radio :value="0">{{ $t('system.menu.hide') }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { menuApi } from '@/api/system'

const { t } = useI18n()

const queryParams = reactive({ menuName: '', status: undefined as number | undefined })
const loading = ref(false)
const menuList = ref<any[]>([])
const isExpandAll = ref(true)
const refreshTable = ref(true)

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref<FormInstance>()
const submitLoading = ref(false)
const menuOptions = ref<any[]>([])

const form = reactive<any>({
  id: undefined,
  parentId: 0,
  menuType: 'M',
  menuName: '',
  orderNum: 0,
  path: '',
  component: '',
  perms: '',
  icon: '',
  status: 0,
  visible: 1
})

const rules = reactive<FormRules>({
  menuName: [{ required: true, message: () => t('system.menu.menuNameRequired'), trigger: 'blur' }],
  orderNum: [{ required: true, message: () => t('system.menu.orderNumRequired'), trigger: 'blur' }]
})

onMounted(() => {
  getList()
})

async function getList() {
  loading.value = true
  try {
    const res: any = await menuApi.list(queryParams)
    menuList.value = buildTree(res.data || [])
  } finally {
    loading.value = false
  }
}

function buildTree(data: any[], parentId = 0): any[] {
  const tree: any[] = []
  data.forEach((item: any) => {
    if (item.parentId === parentId) {
      const children = buildTree(data, item.id)
      if (children.length > 0) {
        item.children = children
      }
      tree.push(item)
    }
  })
  return tree.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0))
}

function handleQuery() {
  getList()
}

function resetQuery() {
  queryParams.menuName = ''
  queryParams.status = undefined
  getList()
}

function toggleExpandAll() {
  refreshTable.value = false
  isExpandAll.value = !isExpandAll.value
  nextTick(() => { refreshTable.value = true })
}

async function loadMenuOptions() {
  try {
    const res: any = await menuApi.treeselect()
    menuOptions.value = [{ id: 0, label: t('system.menu.rootMenu'), children: res.data || [] }]
  } catch (_e) {
    menuOptions.value = [{ id: 0, label: t('system.menu.rootMenu'), children: [] }]
  }
}

function handleAdd(row?: any) {
  resetForm()
  loadMenuOptions()
  dialogTitle.value = t('common.add')
  if (row) {
    form.parentId = row.id
  }
  dialogVisible.value = true
}

async function handleEdit(row: any) {
  resetForm()
  loadMenuOptions()
  dialogTitle.value = t('common.edit')
  try {
    const res: any = await menuApi.detail(row.id)
    Object.assign(form, res.data)
  } catch (_e) { /* */ }
  dialogVisible.value = true
}

function handleDelete(row: any) {
  ElMessageBox.confirm(t('system.menu.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await menuApi.remove(row.id)
    ElMessage.success(t('common.success'))
    getList()
  }).catch(() => {})
}

async function submitForm() {
  if (!formRef.value) return
  await formRef.value.validate()
  submitLoading.value = true
  try {
    if (form.id) {
      await menuApi.update(form)
    } else {
      await menuApi.create(form)
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
  form.parentId = 0
  form.menuType = 'M'
  form.menuName = ''
  form.orderNum = 0
  form.path = ''
  form.component = ''
  form.perms = ''
  form.icon = ''
  form.status = 0
  form.visible = 1
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
</style>

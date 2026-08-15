<template>
  <div class="dict-page">
    <el-alert
      type="info"
      :closable="false"
      show-icon
      title="选项字典 · 全系统下拉选项在此维护"
      description="各业务体系原先写死在页面里的下拉选项(收款方式/记账状态/税率/工单类型等),统一在此维护。左侧选一个字典类型,右侧维护它的选项。"
      style="margin-bottom: 16px"
    />

    <div class="dict-layout">
      <!-- 左:字典类型 -->
      <div class="dict-types">
        <div class="panel-head">
          <span class="panel-title">字典类型</span>
          <el-button type="primary" size="small" :icon="Plus" @click="openTypeCreate">新建</el-button>
        </div>
        <el-input
          v-model="typeQuery"
          placeholder="搜索名称/编码"
          clearable
          size="small"
          :prefix-icon="Search"
          style="margin-bottom: 8px"
          @keyup.enter="loadTypes"
          @clear="loadTypes"
        />
        <el-table
          :data="typeList"
          v-loading="typeLoading"
          highlight-current-row
          size="small"
          height="calc(100vh - 320px)"
          @current-change="onSelectType"
        >
          <el-table-column label="字典名称" min-width="110">
            <template #default="{ row }">
              <div class="type-cell">
                <span>{{ row.dictName }}</span>
                <el-tag v-if="row.status === 1" type="info" size="small">停用</el-tag>
              </div>
              <div class="type-code">{{ row.dictType }}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90" align="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click.stop="openTypeEdit(row)" />
              <el-button link type="danger" :icon="Delete" @click.stop="removeType(row)" />
            </template>
          </el-table-column>
          <template #empty><el-empty description="暂无字典类型" :image-size="60" /></template>
        </el-table>
        <div class="type-pager">
          <el-pagination
            v-model:current-page="typePage.pageNum"
            :page-size="typePage.pageSize"
            :total="typeTotal"
            layout="prev, pager, next"
            small
            @current-change="loadTypes"
          />
        </div>
      </div>

      <!-- 右:字典项 -->
      <div class="dict-data">
        <div class="panel-head">
          <span class="panel-title">
            字典项
            <span v-if="currentType" class="cur-type">— {{ currentType.dictName }} ({{ currentType.dictType }})</span>
          </span>
          <el-button type="primary" size="small" :icon="Plus" :disabled="!currentType" @click="openDataCreate">
            新建字典项
          </el-button>
        </div>
        <el-table :data="dataList" v-loading="dataLoading" border stripe size="small" height="calc(100vh - 300px)">
          <el-table-column prop="dictLabel" label="标签(展示)" min-width="140" show-overflow-tooltip />
          <el-table-column prop="dictValue" label="键值(存储)" min-width="140" show-overflow-tooltip />
          <el-table-column prop="dictSort" label="排序" width="70" align="center" />
          <el-table-column label="默认" width="70" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.isDefault === 1" type="success" size="small">默认</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'info' : 'success'" size="small">
                {{ row.status === 1 ? '停用' : '正常' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="110" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" :icon="Edit" @click="openDataEdit(row)">编辑</el-button>
              <el-button link type="danger" :icon="Delete" @click="removeData(row)">删除</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :description="currentType ? '该字典暂无选项,点击右上角新建' : '请先在左侧选择一个字典类型'" :image-size="70" />
          </template>
        </el-table>
      </div>
    </div>

    <!-- 字典类型 弹窗 -->
    <el-dialog v-model="typeDialog" :title="typeForm.id ? '编辑字典类型' : '新建字典类型'" width="480px" :close-on-click-modal="false">
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="90px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="如:收款方式" maxlength="100" />
        </el-form-item>
        <el-form-item label="类型编码" prop="dictType">
          <el-input v-model="typeForm.dictType" placeholder="英文唯一,如 payment_method" maxlength="100" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="typeForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="typeForm.remark" type="textarea" :rows="2" maxlength="255" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveType">保存</el-button>
      </template>
    </el-dialog>

    <!-- 字典项 弹窗 -->
    <el-dialog v-model="dataDialog" :title="dataForm.id ? '编辑字典项' : '新建字典项'" width="480px" :close-on-click-modal="false">
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="90px">
        <el-form-item label="标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="展示文字,如 微信" maxlength="100" />
        </el-form-item>
        <el-form-item label="键值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="存储值,如 wechat" maxlength="100" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dataForm.dictSort" :min="0" :max="9999" />
        </el-form-item>
        <el-form-item label="是否默认">
          <el-switch v-model="dataForm.isDefault" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="dataForm.status">
            <el-radio :value="0">正常</el-radio>
            <el-radio :value="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="dataForm.remark" type="textarea" :rows="2" maxlength="255" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="saveData">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import { dictTypeApi, dictDataApi, type SysDictType, type SysDictData } from '@/api/dict'

/* ---------- 字典类型 ---------- */
const typeList = ref<SysDictType[]>([])
const typeTotal = ref(0)
const typeLoading = ref(false)
const typeQuery = ref('')
const typePage = reactive({ pageNum: 1, pageSize: 20 })
const currentType = ref<SysDictType | null>(null)

async function loadTypes() {
  typeLoading.value = true
  try {
    const res: any = await dictTypeApi.list({
      pageNum: typePage.pageNum,
      pageSize: typePage.pageSize,
      dictName: typeQuery.value || undefined,
      dictType: typeQuery.value || undefined
    })
    typeList.value = res.data?.records || res.data?.list || []
    typeTotal.value = res.data?.total || 0
    // 保持/重建右侧选中
    if (currentType.value) {
      const still = typeList.value.find(t => t.id === currentType.value!.id)
      if (still) { currentType.value = still } else { currentType.value = null; dataList.value = [] }
    }
  } catch (e: any) {
    ElMessage.error(e?.message || '字典类型加载失败')
  } finally {
    typeLoading.value = false
  }
}

function onSelectType(row: SysDictType | null) {
  if (!row) return
  currentType.value = row
  loadData()
}

/* ---------- 字典项 ---------- */
const dataList = ref<SysDictData[]>([])
const dataLoading = ref(false)

async function loadData() {
  if (!currentType.value) { dataList.value = []; return }
  dataLoading.value = true
  try {
    const res: any = await dictDataApi.list(currentType.value.dictType)
    dataList.value = res.data || []
  } catch (e: any) {
    ElMessage.error(e?.message || '字典项加载失败')
  } finally {
    dataLoading.value = false
  }
}

/* ---------- 类型 增删改 ---------- */
const saving = ref(false)
const typeDialog = ref(false)
const typeFormRef = ref()
const typeForm = reactive<SysDictType>({ dictName: '', dictType: '', status: 0, remark: '' })
const typeRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [
    { required: true, message: '请输入类型编码', trigger: 'blur' },
    { pattern: /^[a-z][a-z0-9_]*$/, message: '编码须小写字母开头,仅含小写字母/数字/下划线', trigger: 'blur' }
  ]
}
function resetTypeForm(v?: SysDictType) {
  Object.assign(typeForm, { id: undefined, dictName: '', dictType: '', status: 0, remark: '' }, v || {})
}
function openTypeCreate() { resetTypeForm(); typeDialog.value = true }
function openTypeEdit(row: SysDictType) { resetTypeForm(row); typeDialog.value = true }
async function saveType() {
  await typeFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    saving.value = true
    try {
      if (typeForm.id) await dictTypeApi.update(typeForm)
      else await dictTypeApi.create(typeForm)
      ElMessage.success('保存成功')
      typeDialog.value = false
      await loadTypes()
    } catch (e: any) {
      ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}
async function removeType(row: SysDictType) {
  await ElMessageBox.confirm(`删除字典类型「${row.dictName}」将同时删除其下全部字典项,确认?`, '提示', { type: 'warning' })
    .then(async () => {
      await dictTypeApi.remove(row.id!)
      ElMessage.success('已删除')
      if (currentType.value?.id === row.id) { currentType.value = null; dataList.value = [] }
      await loadTypes()
    })
    .catch(() => {})
}

/* ---------- 字典项 增删改 ---------- */
const dataDialog = ref(false)
const dataFormRef = ref()
const dataForm = reactive<SysDictData>({ dictType: '', dictLabel: '', dictValue: '', dictSort: 0, isDefault: 0, status: 0, remark: '' })
const dataRules = {
  dictLabel: [{ required: true, message: '请输入标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入键值', trigger: 'blur' }]
}
function resetDataForm(v?: SysDictData) {
  Object.assign(dataForm,
    { id: undefined, dictType: currentType.value?.dictType || '', dictLabel: '', dictValue: '', dictSort: 0, isDefault: 0, status: 0, remark: '' },
    v || {})
}
function openDataCreate() {
  if (!currentType.value) return
  resetDataForm()
  dataForm.dictSort = dataList.value.length + 1
  dataDialog.value = true
}
function openDataEdit(row: SysDictData) { resetDataForm(row); dataDialog.value = true }
async function saveData() {
  await dataFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    saving.value = true
    try {
      if (dataForm.id) await dictDataApi.update(dataForm)
      else await dictDataApi.create(dataForm)
      ElMessage.success('保存成功')
      dataDialog.value = false
      await loadData()
    } catch (e: any) {
      ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}
async function removeData(row: SysDictData) {
  await ElMessageBox.confirm(`删除字典项「${row.dictLabel}」?`, '提示', { type: 'warning' })
    .then(async () => {
      await dictDataApi.remove(row.id!)
      ElMessage.success('已删除')
      await loadData()
    })
    .catch(() => {})
}

onMounted(loadTypes)
</script>

<style scoped>
.dict-page { padding: 16px; }
.dict-layout { display: flex; gap: 16px; align-items: stretch; }
.dict-types { width: 340px; flex-shrink: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; padding: 12px; }
.dict-data { flex: 1; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; padding: 12px; min-width: 0; }
.panel-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.panel-title { font-weight: 600; font-size: 15px; }
.cur-type { color: var(--el-text-color-secondary); font-weight: 400; font-size: 13px; }
.type-cell { display: flex; align-items: center; gap: 6px; }
.type-code { color: var(--el-text-color-secondary); font-size: 12px; }
.type-pager { margin-top: 8px; display: flex; justify-content: center; }
</style>

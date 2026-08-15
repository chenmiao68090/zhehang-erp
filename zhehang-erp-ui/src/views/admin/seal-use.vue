<template>
  <div class="seal-use">
    <header class="su-head">
      <div>
        <h2 class="su-title">印章登记</h2>
        <p class="su-sub">用印申请闭环:登记用印日期、事由、用印类型与位置,并记录用印人是否确认。</p>
      </div>
    </header>

    <div class="su-bar">
      <el-input v-model="kw" class="su-search" placeholder="搜编号/申请人/文件/事由…" clearable @keyup.enter="load" @clear="load" />
      <el-radio-group v-model="viewMode">
        <el-radio-button value="all">全部登记</el-radio-button>
        <el-radio-button value="todo">待办·待确认{{ todoCount ? ` (${todoCount})` : '' }}</el-radio-button>
      </el-radio-group>
      <el-button type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 发起用印申请</el-button>
    </div>

    <el-table :data="displayRows" v-loading="loading" border stripe>
      <el-table-column label="用印日期" prop="useDate" width="110" />
      <el-table-column label="编号" prop="serialNo" width="130" show-overflow-tooltip />
      <el-table-column label="申请人" prop="applicant" width="90" />
      <el-table-column label="用印类型" prop="sealType" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.sealType" size="small" effect="plain">{{ row.sealType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="文件名称" prop="fileName" min-width="150" show-overflow-tooltip />
      <el-table-column label="用印事由" prop="reason" min-width="160" show-overflow-tooltip />
      <el-table-column label="用印位置" min-width="150">
        <template #default="{ row }">
          <el-tag v-for="p in splitPos(row.usePosition)" :key="p" size="small" type="info" effect="plain" style="margin-right: 4px">{{ p }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="页数" prop="pageCount" width="70" align="right" />
      <el-table-column label="用印人确认" width="100" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="row.userConfirm === 1 ? 'success' : 'warning'">{{ row.userConfirm === 1 ? '已确认' : '未确认' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button v-if="row.userConfirm !== 1" size="small" link type="success" @click="confirmUse(row)">确认</el-button>
          <el-button size="small" link @click="openForm(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="remove(row)">删</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有用印申请,点右上角「发起用印申请」开始" :image-size="80">
          <el-button type="primary" @click="openForm()">发起用印申请</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 新增/编辑 -->
    <el-dialog v-model="dlg.visible" :title="form.id ? '编辑用印登记' : '新增用印登记'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="92px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="用印日期" required>
            <el-date-picker v-model="form.useDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" @change="onDateChange" />
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="编号">
            <el-input v-model="form.serialNo" placeholder="留空将按日期+序号生成">
              <template #append><el-button @click="genSerialNo">生成</el-button></template>
            </el-input>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="申请人" required>
            <el-select v-model="form.applicant" filterable allow-create default-first-option placeholder="选择系统员工(也可直接输入)" style="width: 100%">
              <el-option v-for="c in colleagues" :key="c.userId" :label="c.deptName ? `${c.name}(${c.deptName})` : c.name" :value="c.name" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="用印类型" required>
            <el-select v-model="form.sealType" placeholder="选择用印类型" style="width: 100%">
              <el-option v-for="t in SEAL_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="文件名称"><el-input v-model="form.fileName" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="用印事由"><el-input v-model="form.reason" type="textarea" :rows="2" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="用印位置">
            <el-select v-model="posList" multiple placeholder="可多选" style="width: 100%">
              <el-option v-for="p in USE_POSITIONS" :key="p" :label="p" :value="p" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="用印页数">
            <el-input-number v-model="form.pageCount" :min="0" :precision="0" controls-position="right" style="width: 100%" />
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="用印人确认">
            <el-switch v-model="form.userConfirm" :active-value="1" :inactive-value="0" active-text="已确认" inactive-text="未确认" />
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="文件附件"><el-input v-model="form.fileAttach" placeholder="附件URL/说明" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="dlg.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { sealUseApi, type AdminSealUse } from '@/api/admin'
import { taskApi } from '@/api/workflow'

const SEAL_TYPES = ['公章', '法人章', '财务章', '合同章']
const USE_POSITIONS = ['开头', '骑缝章', '落款', '其他']

const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const splitPos = (s?: string) => (s ? String(s).split(',').filter(Boolean) : [])

const rows = ref<AdminSealUse[]>([])
const loading = ref(false)
const kw = ref('')

const load = async () => {
  loading.value = true
  try {
    const res: any = await sealUseApi.list(kw.value || undefined)
    rows.value = (res?.data ?? res) || []
  } catch { rows.value = [] } finally { loading.value = false }
}
// 211:待办视图——用印申请提交后默认"待确认"(userConfirm=0)即管理员待办;确认后为已办。登记表(全部)本就含待办
const viewMode = ref<'all' | 'todo'>('all')
const todoCount = computed(() => rows.value.filter((r) => r.userConfirm !== 1).length)
const displayRows = computed(() => (viewMode.value === 'todo' ? rows.value.filter((r) => r.userConfirm !== 1) : rows.value))
// 管理员一键确认某条用印申请(待办→已办),复用 save 设 userConfirm=1,不改其它字段
const confirmUse = async (row: AdminSealUse) => {
  try { await sealUseApi.save({ ...row, userConfirm: 1 }); ElMessage.success('已确认用印'); load() } catch { ElMessage.error('确认失败') }
}

const dlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<AdminSealUse>({})
// 用印位置:UI 用数组多选,提交时拼成逗号串
const posList = computed<string[]>({
  get: () => splitPos(form.value.usePosition),
  set: (v) => { form.value.usePosition = (v || []).join(',') }
})

// 按 用印日期 + 当日序号 生成编号,如 20260625001
const genSerialNo = () => {
  const date = (form.value.useDate || todayStr()).replace(/-/g, '')
  const sameDay = rows.value.filter(r => (r.serialNo || '').startsWith(date)).length
  form.value.serialNo = `${date}${String(sameDay + 1).padStart(3, '0')}`
}
const onDateChange = () => {
  // 用户没填编号时,改日期顺手刷新默认编号
  if (!form.value.id && !form.value.serialNo) genSerialNo()
}

const openForm = (row?: AdminSealUse) => {
  form.value = row
    ? { ...row }
    : { useDate: todayStr(), serialNo: '', sealType: '', usePosition: '', pageCount: 0, userConfirm: 0 }
  if (!row) genSerialNo()
  dlg.value = { visible: true, saving: false }
}

const submit = async () => {
  if (!form.value.useDate) { ElMessage.warning('请选择用印日期'); return }
  if (!form.value.applicant) { ElMessage.warning('请填写申请人'); return }
  if (!form.value.sealType) { ElMessage.warning('请选择用印类型'); return }
  dlg.value.saving = true
  try {
    await sealUseApi.save(form.value)
    ElMessage.success('已保存'); dlg.value.visible = false; load()
  } catch { ElMessage.error('保存失败') } finally { dlg.value.saving = false }
}

const remove = async (row: AdminSealUse) => {
  try { await ElMessageBox.confirm(`删除用印登记「${row.serialNo || row.fileName || ''}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await sealUseApi.remove(row.id!); ElMessage.success('已删除'); load() } catch { ElMessage.error('删除失败') }
}

// 211:申请人下拉选系统员工(复用审批同款无权限门员工名单;仍存名字,向后兼容旧的自由文本记录)
const colleagues = ref<{ userId: number; name: string; deptName?: string }[]>([])
const loadColleagues = async () => {
  try { const res: any = await taskApi.colleagues(); colleagues.value = (res?.data ?? res) || [] } catch { colleagues.value = [] }
}
onMounted(() => { load(); loadColleagues() })
</script>

<style scoped>
.seal-use { padding: 16px 18px; }
.su-head { margin-bottom: 6px; }
.su-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.su-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.su-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.su-search { width: 260px; }
</style>

<template>
  <div class="adm-supply">
    <header class="as-head">
      <div>
        <h2 class="as-title">办公用品管理</h2>
        <p class="as-sub">分类物料台账与入库采购:登记办公耗材/劳保福利品的库存、入库与采购审批关联;库存低于安全库存自动标红。</p>
      </div>
    </header>

    <div class="as-bar">
      <el-input v-model="kw" class="as-search" placeholder="搜品名/单号/分类/经办人…" clearable @keyup.enter="load" @clear="load" />
      <span v-if="lowCount" class="as-low-tip"><el-icon><Warning /></el-icon> {{ lowCount }} 项低于安全库存</span>
      <el-button type="primary" @click="openDlg()"><el-icon><Plus /></el-icon> 新增入库</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe :row-class-name="rowClass">
      <el-table-column label="品名" prop="supplyName" min-width="140" show-overflow-tooltip />
      <el-table-column label="分类" prop="category" width="130" show-overflow-tooltip />
      <el-table-column label="规格" prop="spec" width="110" show-overflow-tooltip />
      <el-table-column label="库存" width="110" align="right">
        <template #default="{ row }">
          <span :class="{ 'as-low': isLow(row) }">{{ row.quantity ?? 0 }}</span>
          <span class="as-unit">{{ row.unit || '' }}</span>
          <el-tag v-if="isLow(row)" size="small" type="danger" effect="plain" style="margin-left: 4px">不足</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="安全库存" prop="safetyStock" width="90" align="right" />
      <el-table-column label="含税金额" width="110" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.amount) }}</template>
      </el-table-column>
      <el-table-column label="入库时间" prop="inDate" width="108" />
      <el-table-column label="状态" width="92">
        <template #default="{ row }">
          <el-tag size="small" :type="statusType(row.status)">{{ row.status || '—' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="经办人" prop="operator" width="86" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link @click="openDlg(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="remove(row)">删</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有办公用品台账,先登记一笔入库" :image-size="80">
          <el-button type="primary" @click="openDlg()">新增入库</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 新增/编辑 -->
    <el-dialog v-model="dlg.visible" :title="form.id ? '编辑办公用品' : '新增入库'" width="600px" destroy-on-close>
      <el-form :model="form" label-width="100px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="品名" required><el-input v-model="form.supplyName" placeholder="如:A4打印纸" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="入库单号"><el-input v-model="form.supplyNo" placeholder="留空自动按规则" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="分类">
            <el-select v-model="form.category" placeholder="选择分类" clearable style="width: 100%">
              <el-option v-for="opt in CATEGORIES" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="form.spec" placeholder="如:70g/500张" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="单位"><el-input v-model="form.unit" placeholder="个/盒/包/件" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="当前库存"><el-input-number v-model="form.quantity" :min="0" :precision="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="安全库存"><el-input-number v-model="form.safetyStock" :min="0" :precision="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="含税总金额"><el-input-number v-model="form.amount" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="入库时间"><el-date-picker v-model="form.inDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态">
            <el-select v-model="form.status" placeholder="选择状态" style="width: 100%">
              <el-option v-for="opt in STATUSES" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="经办人"><el-input v-model="form.operator" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="关联审批单"><el-input v-model="form.relatedApproval" placeholder="采购审批单号" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="附件"><el-input v-model="form.attach" placeholder="附件URL/说明" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :rows="2" /></el-form-item>
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
import { Plus, Warning } from '@element-plus/icons-vue'
import { supplyApi, type AdminSupply } from '@/api/admin'

const CATEGORIES = ['通用办公耗材', '业务专用耗材', '劳保福利品']
const STATUSES = ['待验收', '已入库', '已驳回']

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const statusType = (s?: string) => (s === '已入库' ? 'success' : s === '已驳回' ? 'danger' : 'warning')

const rows = ref<AdminSupply[]>([])
const loading = ref(false)
const kw = ref('')
const isLow = (r: AdminSupply) => (r.safetyStock ?? 0) > 0 && (r.quantity ?? 0) <= (r.safetyStock ?? 0)
const lowCount = computed(() => rows.value.filter(isLow).length)
const rowClass = ({ row }: { row: AdminSupply }) => (isLow(row) ? 'as-low-row' : '')

const load = async () => {
  loading.value = true
  try {
    const res: any = await supplyApi.list(kw.value || undefined)
    rows.value = (res?.data ?? res) || []
  } catch { rows.value = [] } finally { loading.value = false }
}

const dlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<AdminSupply>({})
const openDlg = (row?: AdminSupply) => {
  form.value = row ? { ...row } : { category: '通用办公耗材', unit: '个', quantity: 0, safetyStock: 0, amount: 0, inDate: todayStr(), status: '已入库' }
  dlg.value = { visible: true, saving: false }
}
const submit = async () => {
  if (!form.value.supplyName) { ElMessage.warning('请填写品名'); return }
  dlg.value.saving = true
  try {
    await supplyApi.save(form.value)
    ElMessage.success('已保存'); dlg.value.visible = false; load()
  } catch { ElMessage.error('保存失败') } finally { dlg.value.saving = false }
}
const remove = async (row: AdminSupply) => {
  try { await ElMessageBox.confirm(`删除办公用品「${row.supplyName}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await supplyApi.remove(row.id!); ElMessage.success('已删除'); load() } catch { ElMessage.error('删除失败') }
}

onMounted(load)
</script>

<style scoped>
.adm-supply { padding: 16px 18px; }
.as-head { margin-bottom: 6px; }
.as-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.as-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.as-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.as-search { width: 260px; }
.as-low-tip { color: var(--el-color-danger); font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
.as-low { color: var(--el-color-danger); font-weight: 700; }
.as-unit { color: var(--el-text-color-secondary); font-size: 12px; margin-left: 2px; }
:deep(.as-low-row) { background: var(--el-color-danger-light-9); }
</style>

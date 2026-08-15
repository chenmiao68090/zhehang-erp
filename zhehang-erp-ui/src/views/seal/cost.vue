<template>
  <div class="seal-cost">
    <header class="sc-head">
      <div>
        <h2 class="sc-title">刻章成本明细</h2>
        <p class="sc-sub">按月录入各项成本(固定/可变),印章业务看板据此汇算总成本与利润。</p>
      </div>
      <div class="sc-actions">
        <span class="sc-month-label">月份</span>
        <el-date-picker v-model="costMonth" type="month" value-format="YYYY-MM" placeholder="选择月份" :clearable="false" @change="loadLines" />
      </div>
    </header>

    <div class="sc-stats">
      <div class="sc-stat"><span class="sc-stat-num">¥{{ fmtMoney(totalCost) }}</span><span class="sc-stat-label">本月总成本</span></div>
      <div class="sc-stat"><span class="sc-stat-num">¥{{ fmtMoney(fixedCost) }}</span><span class="sc-stat-label">固定成本</span></div>
      <div class="sc-stat"><span class="sc-stat-num">¥{{ fmtMoney(variableCost) }}</span><span class="sc-stat-label">可变成本</span></div>
    </div>

    <div class="sc-bar">
      <span class="sc-bar-title">{{ costMonth }} 成本明细</span>
      <div class="sc-bar-ops">
        <el-button size="small" @click="seedTypes">按标准11项填充</el-button>
        <el-button size="small" plain @click="addLine"><el-icon><Plus /></el-icon> 新增一行</el-button>
        <el-button size="small" type="primary" :loading="saving" @click="saveMonth"><el-icon><Check /></el-icon> 保存本月</el-button>
      </div>
    </div>

    <el-table :data="lines" v-loading="loading" border size="small" empty-text="本月还没有成本明细,点「按标准11项填充」或「新增一行」">
      <el-table-column label="成本类型" min-width="180">
        <template #default="{ row }">
          <el-select v-model="row.costType" size="small" filterable allow-create default-first-option placeholder="选择/输入" style="width: 100%" @change="onTypeChange(row)">
            <el-option v-for="t in COST_TYPES" :key="t" :label="t" :value="t" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="成本分类" width="110">
        <template #default="{ row }">
          <el-select v-model="row.costCategory" size="small" placeholder="固定/可变" style="width: 100%">
            <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="130">
        <template #default="{ row }"><el-input-number v-model="row.amount" :min="0" :precision="2" :controls="false" size="small" style="width: 100%" placeholder="¥" /></template>
      </el-table-column>
      <el-table-column label="说明" min-width="160">
        <template #default="{ row }"><el-input v-model="row.description" size="small" placeholder="可选" /></template>
      </el-table-column>
      <el-table-column label="附件" width="96" align="center">
        <template #default="{ row }">
          <el-button size="small" link type="primary" @click="openAttach(row)">附件({{ attachCount(row) }})</el-button>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="60" align="center">
        <template #default="{ $index }"><el-button size="small" link type="danger" @click="removeLine($index)"><el-icon><Delete /></el-icon></el-button></template>
      </el-table-column>
    </el-table>
    <p class="sc-tip">💡 填完点「保存本月」整表保存;成本类型可自行输入非标准项。附件对应各成本的凭证/发票。</p>

    <!-- 附件管理 -->
    <el-dialog v-model="attach.visible" title="成本附件" width="440px" destroy-on-close append-to-body>
      <el-upload
        :show-file-list="false"
        :http-request="(o: any) => uploadAttach(o)"
        :before-upload="beforeAttachUpload"
        :accept="ATTACH_ACCEPT"
        :disabled="uploadingAttachCount > 0"
        multiple>
        <el-button size="small" :loading="uploadingAttachCount > 0"><el-icon><Plus /></el-icon> 上传附件(可多张)</el-button>
        <template #tip>
          <div class="sc-upload-tip">支持 JPG/PNG/WebP/HEIC/PDF/OFD/Word/Excel 等凭证文件,单个不超过 30MB。不支持 SVG、网页、脚本等不安全格式。</div>
        </template>
      </el-upload>
      <div v-if="attach.list.length" class="sc-attach-list">
        <el-tag v-for="(a, i) in attach.list" :key="i" size="small" closable @close="removeAttach(i)">{{ a.fileName }}</el-tag>
      </div>
      <p v-else class="sc-tip" style="margin-top:10px">还没有附件</p>
      <template #footer>
        <el-button @click="attach.visible = false">关闭</el-button>
        <el-button type="primary" @click="saveAttach">保存到该成本</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Delete, Check } from '@element-plus/icons-vue'
import { sealCostApi, type SealCost } from '@/api/seal'
import { fileInfoApi } from '@/api/file'

const COST_TYPES = ['京东快递费用', '顺丰快递费用', '印章消耗费用', '城报登报费用', '刻章登报成本|外区域', '刻章提成总计', '场地物业水电', '刻章固定工资', '刻章固定社保公积金', '管理固定工资', '管理固定社保公积金']
const CATEGORIES = ['固定', '可变']
// 各成本类型的默认分类(选类型时自动带出,可手动改)
const COST_CATEGORY_OF: Record<string, string> = {
  京东快递费用: '可变', 顺丰快递费用: '可变', 印章消耗费用: '可变', 城报登报费用: '可变', '刻章登报成本|外区域': '可变', 刻章提成总计: '可变',
  场地物业水电: '固定', 刻章固定工资: '固定', 刻章固定社保公积金: '固定', 管理固定工资: '固定', 管理固定社保公积金: '固定'
}

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const nowMonth = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` }

const costMonth = ref(nowMonth())
const lines = ref<SealCost[]>([])
const loading = ref(false)
const saving = ref(false)

const loadLines = async () => {
  loading.value = true
  try {
    const res: any = await sealCostApi.list(costMonth.value)
    lines.value = ((res?.data ?? res) || []).map((l: SealCost) => ({ ...l, attachment: l.attachment || '[]' }))
  } catch { lines.value = [] } finally { loading.value = false }
}
const addLine = () => lines.value.push({ costType: '', costCategory: '', amount: undefined, description: '', attachment: '[]' })
const removeLine = (i: number) => lines.value.splice(i, 1)
const seedTypes = () => {
  const existing = new Set(lines.value.map((l) => l.costType))
  COST_TYPES.forEach((t) => {
    if (!existing.has(t)) lines.value.push({ costType: t, costCategory: COST_CATEGORY_OF[t] || '', amount: undefined, description: '', attachment: '[]' })
  })
}
const onTypeChange = (row: SealCost) => {
  if (!row.costCategory && row.costType) row.costCategory = COST_CATEGORY_OF[row.costType] || ''
}

const totalCost = computed(() => lines.value.reduce((s, l) => s + Number(l.amount || 0), 0))
const fixedCost = computed(() => lines.value.filter((l) => l.costCategory === '固定').reduce((s, l) => s + Number(l.amount || 0), 0))
const variableCost = computed(() => lines.value.filter((l) => l.costCategory === '可变').reduce((s, l) => s + Number(l.amount || 0), 0))

const saveMonth = async () => {
  if (!costMonth.value) { ElMessage.warning('请选择月份'); return }
  saving.value = true
  try {
    const year = costMonth.value.slice(0, 4)
    await sealCostApi.batchSave(year, costMonth.value, lines.value)
    ElMessage.success('已保存本月成本')
    loadLines()
  } catch { ElMessage.error('保存失败') } finally { saving.value = false }
}

/* ---------- 附件 ---------- */
const ATTACH_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif,.tif,.tiff,.pdf,.ofd,.doc,.docx,.xls,.xlsx'
const ATTACH_MAX_SIZE = 30 * 1024 * 1024
const ATTACH_FORMAT_TEXT = 'JPG、PNG、WebP、HEIC、PDF、OFD、Word、Excel'
const ALLOWED_ATTACH_EXT = new Set([
  'jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'heic', 'heif', 'tif', 'tiff',
  'pdf', 'ofd', 'doc', 'docx', 'xls', 'xlsx'
])

const attachCount = (row: SealCost) => { try { return (JSON.parse(row.attachment || '[]') || []).length } catch { return 0 } }
const attach = ref<{ visible: boolean; row: SealCost | null; list: { fileId: string; fileName: string }[] }>({ visible: false, row: null, list: [] })
const uploadingAttachCount = ref(0)
const openAttach = (row: SealCost) => {
  let list: any[] = []
  try { list = JSON.parse(row.attachment || '[]') || [] } catch { list = [] }
  attach.value = { visible: true, row, list }
}
const getFileExt = (name?: string) => {
  const fileName = name || ''
  const dotIndex = fileName.lastIndexOf('.')
  return dotIndex >= 0 ? fileName.slice(dotIndex + 1).toLowerCase() : ''
}
const beforeAttachUpload = (file: File) => {
  const ext = getFileExt(file.name)
  if (!ALLOWED_ATTACH_EXT.has(ext)) {
    ElMessage.warning(`暂不支持 ${ext ? '.' + ext : '无扩展名'} 文件,请上传 ${ATTACH_FORMAT_TEXT} 格式`)
    return false
  }
  if (file.size > ATTACH_MAX_SIZE) {
    ElMessage.warning('单个附件不能超过 30MB')
    return false
  }
  return true
}
const uploadErrorMessage = (error: any) => {
  const message = error?.response?.data?.message || error?.message || ''
  if (message && !['请求失败', '系统异常', 'Request failed with status code 500'].includes(message)) {
    return `上传失败:${message}`
  }
  return `上传失败,请确认文件为 ${ATTACH_FORMAT_TEXT} 格式且小于 30MB`
}
const uploadAttach = async (options: any) => {
  uploadingAttachCount.value += 1
  try {
    const res: any = await fileInfoApi.upload(options.file, undefined, { silentError: true })
    const data = res?.data ?? res
    attach.value.list.push({ fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name })
    options.onSuccess?.(res)
    ElMessage.success('已上传')
  } catch (error) {
    options.onError?.(error)
    ElMessage.error(uploadErrorMessage(error))
  } finally {
    uploadingAttachCount.value = Math.max(0, uploadingAttachCount.value - 1)
  }
}
const removeAttach = (i: number) => attach.value.list.splice(i, 1)
const saveAttach = () => {
  if (attach.value.row) attach.value.row.attachment = JSON.stringify(attach.value.list)
  attach.value.visible = false
  ElMessage.success('附件已记到该成本(记得点保存本月)')
}

onMounted(loadLines)
</script>

<style scoped>
.seal-cost { padding: 16px 18px; }
.sc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.sc-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.sc-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.sc-actions { display: flex; align-items: center; gap: 8px; }
.sc-month-label { font-size: 13px; color: var(--el-text-color-secondary); }
.sc-stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
.sc-stat { flex: 1; min-width: 130px; display: flex; flex-direction: column; align-items: center; padding: 12px 8px; border-radius: 8px; background: var(--el-fill-color-light); border: 1px solid var(--el-border-color-lighter); }
.sc-stat-num { font-size: 22px; font-weight: 700; color: var(--el-color-danger); }
.sc-stat-label { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 2px; }
.sc-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; flex-wrap: wrap; gap: 10px; }
.sc-bar-title { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.sc-bar-ops { display: flex; gap: 8px; flex-wrap: wrap; }
.sc-tip { margin: 8px 0 0; font-size: 12px; color: var(--el-text-color-secondary); }
.sc-upload-tip { margin-top: 8px; font-size: 12px; line-height: 1.5; color: var(--el-text-color-secondary); }
.sc-attach-list { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
</style>

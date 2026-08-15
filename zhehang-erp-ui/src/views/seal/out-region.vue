<template>
  <div class="out-region">
    <header class="or-head">
      <div>
        <h2 class="or-title">外区域合作</h2>
        <p class="or-sub">浙江省内、杭州以外的备案/刻章合作商名录,记录各城市对接人、单价与备案要求。</p>
      </div>
    </header>

    <div class="or-bar">
      <el-input v-model="kw" class="or-search" placeholder="搜城市…" clearable @keyup.enter="load" @clear="load" />
      <el-button type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 新增合作商</el-button>
    </div>

    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="城市" prop="city" width="100" fixed="left" show-overflow-tooltip />
      <el-table-column label="对接群" prop="contactGroup" min-width="130" show-overflow-tooltip />
      <el-table-column label="外区域对接人" prop="contactPerson" width="120" show-overflow-tooltip />
      <el-table-column label="联系方式" prop="contactPhone" width="130" show-overflow-tooltip />
      <el-table-column label="仅备案单价" width="110" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.recordOnlyPrice) }}</template>
      </el-table-column>
      <el-table-column label="备案+刻章" prop="recordEngrave" width="110" show-overflow-tooltip />
      <el-table-column label="法人章备案情况" prop="legalSealRecord" min-width="130" show-overflow-tooltip />
      <el-table-column label="半身照是否需要" prop="needHalfPhoto" width="120" show-overflow-tooltip />
      <el-table-column label="公章默认尺寸" prop="publicSealSize" width="110" show-overflow-tooltip />
      <el-table-column label="合作商收款码" width="110" align="center">
        <template #default="{ row }">
          <el-image v-if="isImg(row.payQrcode)" :src="row.payQrcode" :preview-src-list="[row.payQrcode]" fit="cover" style="width:38px;height:38px;border-radius:4px" preview-teleported />
          <span v-else>{{ row.payQrcode || '—' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="杭州仅备案单价" width="120" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.hzRecordPrice) }}</template>
      </el-table-column>
      <el-table-column label="杭州仅登报" prop="hzReportOnly" width="110" show-overflow-tooltip />
      <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link @click="openForm(row)">编辑</el-button>
          <el-button size="small" link type="danger" @click="removeRow(row)">删</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有外区域合作商,先把各城市对接人录进来" :image-size="80">
          <el-button type="primary" @click="openForm()">新增合作商</el-button>
        </el-empty>
      </template>
    </el-table>

    <!-- 新增/编辑 -->
    <el-dialog v-model="dlg.visible" :title="form.id ? '编辑合作商' : '新增合作商'" width="680px" destroy-on-close>
      <el-form :model="form" label-width="120px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="城市" required><el-input v-model="form.city" placeholder="如:宁波/温州" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="对接群"><el-input v-model="form.contactGroup" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="外区域对接人"><el-input v-model="form.contactPerson" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系方式"><el-input v-model="form.contactPhone" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">价格与备案</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="仅备案单价"><el-input-number v-model="form.recordOnlyPrice" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="备案+刻章"><el-input v-model="form.recordEngrave" placeholder='如:35 或 不备案' /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="法人章备案情况"><el-input v-model="form.legalSealRecord" placeholder="默认情况" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="半身照是否需要"><el-input v-model="form.needHalfPhoto" placeholder="如:需要 / 不需要" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="公章默认尺寸"><el-input v-model="form.publicSealSize" placeholder="如:42*42" /></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="合作商收款码">
              <div class="or-qr">
                <el-image v-if="isImg(form.payQrcode)" :src="form.payQrcode" :preview-src-list="[form.payQrcode]" fit="cover" class="or-qr-thumb" preview-teleported />
                <el-upload :show-file-list="false" :http-request="(o: any) => uploadQr(o)" accept="image/*">
                  <el-button size="small">{{ isImg(form.payQrcode) ? '重新上传' : '上传收款码图片' }}</el-button>
                </el-upload>
                <el-button v-if="isImg(form.payQrcode) || form.payQrcode" size="small" type="danger" link @click="removeQr">删除</el-button>
                <el-input v-if="!isImg(form.payQrcode)" v-model="form.payQrcode" placeholder="或填文本/链接" size="small" style="width: 140px" />
              </div>
              <span class="or-hint">支持上传图片(自动压缩存储),也可填文本/链接。</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-divider content-position="left">杭州对照</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="杭州仅备案单价"><el-input-number v-model="form.hzRecordPrice" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="杭州仅登报"><el-input v-model="form.hzReportOnly" /></el-form-item></el-col>
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
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { outRegionApi, type OutRegion } from '@/api/seal'

const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))

// 收款码:是图片(base64或图片URL)才走缩略图预览,否则当文本
const isImg = (v?: string) => !!v && (v.startsWith('data:image') || /^https?:\/\/\S+\.(png|jpe?g|gif|webp)(\?|$)/i.test(v))
// 图片压缩成 base64(最长边≤420,JPEG 0.8),避免大图撑爆数据库/列表
const compressToBase64 = (file: File, maxSize = 420, quality = 0.8): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const img = new Image()
    img.onload = () => {
      let w = img.width, h = img.height
      if (w > h && w > maxSize) { h = Math.round(h * maxSize / w); w = maxSize }
      else if (h >= w && h > maxSize) { w = Math.round(w * maxSize / h); h = maxSize }
      const canvas = document.createElement('canvas')
      canvas.width = w; canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('no-ctx')); return }
      ctx.drawImage(img, 0, 0, w, h)
      resolve(canvas.toDataURL('image/jpeg', quality))
    }
    img.onerror = reject
    img.src = reader.result as string
  }
  reader.onerror = reject
  reader.readAsDataURL(file)
})
const uploadQr = async (options: any) => {
  try {
    form.value.payQrcode = await compressToBase64(options.file)
    ElMessage.success('收款码已添加')
  } catch { ElMessage.error('图片处理失败,请换一张') }
}
// 清空收款码:置空字符串(不能用 null,否则后端 updateById 跳过该字段删不掉)
const removeQr = () => { form.value.payQrcode = ''; ElMessage.success('已删除') }

const rows = ref<OutRegion[]>([])
const loading = ref(false)
const kw = ref('')

const load = async () => {
  loading.value = true
  try {
    const res: any = await outRegionApi.list(kw.value || undefined)
    rows.value = (res?.data ?? res) || []
  } catch { rows.value = [] } finally { loading.value = false }
}

const dlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<OutRegion>({})
const openForm = (row?: OutRegion) => {
  form.value = row ? { ...row } : { recordOnlyPrice: 0, hzRecordPrice: 0 }
  dlg.value = { visible: true, saving: false }
}
const submit = async () => {
  if (!form.value.city) { ElMessage.warning('请填写城市'); return }
  dlg.value.saving = true
  try {
    await outRegionApi.save(form.value)
    ElMessage.success('已保存'); dlg.value.visible = false; load()
  } catch { ElMessage.error('保存失败') } finally { dlg.value.saving = false }
}
const removeRow = async (row: OutRegion) => {
  try { await ElMessageBox.confirm(`删除「${row.city}」的合作商记录?`, '删除', { type: 'warning' }) } catch { return }
  try { await outRegionApi.remove(row.id!); ElMessage.success('已删除'); load() } catch { ElMessage.error('删除失败') }
}

onMounted(() => { load() })
</script>

<style scoped>
.out-region { padding: 16px 18px; }
.or-head { margin-bottom: 6px; }
.or-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.or-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.or-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.or-search { width: 200px; }
.or-qr { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.or-qr-thumb { width: 46px; height: 46px; border-radius: 6px; border: 1px solid var(--el-border-color-lighter); }
.or-hint { display: block; margin-top: 4px; font-size: 12px; color: var(--el-text-color-secondary); }
</style>

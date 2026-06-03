<template>
  <div class="campaign-page">
    <section class="page-head">
      <div>
        <h1>营销活动 · 获客 ROI</h1>
        <p>登记每次投放的花费，结合关联线索算出单条获客成本（CAC），一眼看清"哪个渠道更划算"。</p>
      </div>
      <el-button type="primary" :icon="Plus" @click="openAdd">新增活动</el-button>
    </section>

    <!-- ROI 概览卡片 -->
    <section class="roi-cards">
      <div class="roi-card" v-for="r in roiList" :key="r.id">
        <div class="rc-head">
          <span class="rc-name">{{ r.campaignName }}</span>
          <el-tag size="small" effect="plain">{{ r.channel || '—' }}</el-tag>
        </div>
        <div class="rc-metrics">
          <div><span>花费</span><b>¥{{ fmt(r.actualCost) }}</b></div>
          <div><span>线索数</span><b>{{ r.leadsCount }}</b></div>
          <div>
            <span>单条获客成本</span>
            <b :class="cacClass(r.cac)">{{ r.cac != null ? '¥' + fmt(r.cac) : '—' }}</b>
          </div>
        </div>
      </div>
      <div v-if="!roiList.length && !loading" class="roi-empty">还没有营销活动，点右上角"新增活动"开始。</div>
    </section>

    <!-- 活动明细表 -->
    <el-table :data="roiList" v-loading="loading" border stripe class="campaign-table">
      <el-table-column prop="campaignName" label="活动名称" min-width="200" />
      <el-table-column prop="channel" label="渠道" width="100" />
      <el-table-column label="预算 / 花费" width="180">
        <template #default="{ row }">¥{{ fmt(row.budget) }} / <b>¥{{ fmt(row.actualCost) }}</b></template>
      </el-table-column>
      <el-table-column label="展示" width="100" align="right">
        <template #default="{ row }">{{ fmtInt(row.impressions) }}</template>
      </el-table-column>
      <el-table-column label="点击" width="90" align="right">
        <template #default="{ row }">{{ fmtInt(row.clicks) }}</template>
      </el-table-column>
      <el-table-column prop="leadsCount" label="线索数" width="90" align="right" />
      <el-table-column label="单条获客成本(CAC)" width="160" align="right">
        <template #default="{ row }">
          <span :class="cacClass(row.cac)">{{ row.cac != null ? '¥' + fmt(row.cac) : '无线索' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 2 ? 'info' : 'success'" size="small">
            {{ row.status === 2 ? '已结束' : '进行中' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row.id)">编辑</el-button>
          <el-button link type="danger" @click="onRemove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.id ? '编辑营销活动' : '新增营销活动'" width="560px">
      <el-form :model="form" label-width="92px">
        <el-form-item label="活动名称" required>
          <el-input v-model="form.campaignName" placeholder="如：抖音-新公司财税套餐-Q1" />
        </el-form-item>
        <el-form-item label="渠道">
          <el-select v-model="form.channel" placeholder="选择渠道" clearable style="width:100%">
            <el-option v-for="c in CHANNELS" :key="c" :value="c" :label="c" />
          </el-select>
        </el-form-item>
        <el-form-item label="预算">
          <el-input-number v-model="form.budget" :min="0" :step="1000" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="实际花费">
          <el-input-number v-model="form.actualCost" :min="0" :step="1000" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="起止日期">
          <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD"
                          start-placeholder="开始" end-placeholder="结束" style="width:100%" />
        </el-form-item>
        <el-form-item label="展示数">
          <el-input-number v-model="form.impressions" :min="0" :step="1000" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="点击数">
          <el-input-number v-model="form.clicks" :min="0" :step="100" controls-position="right" style="width:100%" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" style="width:100%">
            <el-option :value="1" label="进行中" />
            <el-option :value="2" label="已结束" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="onSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { campaignApi, type Campaign, type CampaignRoi } from '@/api/marketing'

const CHANNELS = ['百度', '抖音', '小红书', '电销', '转介绍', '官网表单', '信息流', '其他']

const loading = ref(false)
const saving = ref(false)
const roiList = ref<CampaignRoi[]>([])
const dateRange = ref<[string, string] | null>(null)
const dialog = reactive<{ visible: boolean; id?: number }>({ visible: false })
const form = reactive<Campaign>({ campaignName: '', status: 1 })

function fmt(n?: number | null) {
  return Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function fmtInt(n?: number | null) {
  return n == null ? '—' : Number(n).toLocaleString('zh-CN')
}
function cacClass(cac?: number | null) {
  if (cac == null) return ''
  if (cac <= 100) return 'cac-good'
  if (cac <= 300) return 'cac-mid'
  return 'cac-bad'
}

async function loadRoi() {
  loading.value = true
  try {
    roiList.value = (await campaignApi.roi()) || []
  } catch {
    roiList.value = []
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.id = undefined
  form.campaignName = ''
  form.channel = undefined
  form.budget = undefined
  form.actualCost = undefined
  form.startDate = undefined
  form.endDate = undefined
  form.impressions = undefined
  form.clicks = undefined
  form.status = 1
  form.remark = undefined
  dateRange.value = null
}

function openAdd() {
  resetForm()
  dialog.id = undefined
  dialog.visible = true
}

async function openEdit(id: number) {
  resetForm()
  dialog.id = id
  const data = await campaignApi.get(id)
  if (data) {
    Object.assign(form, data)
    if (data.startDate && data.endDate) dateRange.value = [data.startDate, data.endDate]
  }
  dialog.visible = true
}

async function onSave() {
  if (!form.campaignName?.trim()) {
    ElMessage.warning('请填写活动名称')
    return
  }
  saving.value = true
  try {
    form.startDate = dateRange.value?.[0]
    form.endDate = dateRange.value?.[1]
    if (dialog.id) {
      form.id = dialog.id
      await campaignApi.update({ ...form })
    } else {
      await campaignApi.add({ ...form })
    }
    ElMessage.success('已保存')
    dialog.visible = false
    loadRoi()
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function onRemove(id: number) {
  await ElMessageBox.confirm('确定删除该营销活动？', '提示', { type: 'warning' })
  await campaignApi.remove(id)
  ElMessage.success('已删除')
  loadRoi()
}

onMounted(loadRoi)
</script>

<style scoped>
.campaign-page { padding: 16px; }
.page-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
.page-head h1 { margin: 0 0 4px; font-size: 20px; color: #303133; }
.page-head p { margin: 0; color: #909399; font-size: 13px; }
.roi-cards { display: flex; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
.roi-card { flex: 1 1 240px; background: #fff; border: 1px solid #ebeef5; border-radius: 8px; padding: 14px; }
.rc-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.rc-name { font-weight: 600; color: #303133; }
.rc-metrics { display: flex; gap: 18px; }
.rc-metrics > div { display: flex; flex-direction: column; gap: 2px; }
.rc-metrics span { font-size: 12px; color: #909399; }
.rc-metrics b { font-size: 16px; }
.roi-empty { color: #909399; padding: 20px; }
.campaign-table { margin-top: 4px; }
.cac-good { color: #67c23a; font-weight: 600; }
.cac-mid { color: #e6a23c; font-weight: 600; }
.cac-bad { color: #f56c6c; font-weight: 600; }
</style>

<template>
  <div class="pdp">
    <header class="pdp-head">
      <div>
        <h2 class="pdp-title">{{ platformLabel }}数据</h2>
        <p class="pdp-sub">
          <el-tag type="warning" size="small" effect="plain">平台不支持 API 接入</el-tag>
          以下为手动录入的真实运营数据,按分区分类记录。近 {{ days }} 天明细。
        </p>
      </div>
      <div class="pdp-actions">
        <el-select v-model="days" size="small" style="width: 120px" @change="loadAll">
          <el-option :value="30" label="近 30 天" />
          <el-option :value="90" label="近 90 天" />
          <el-option :value="180" label="近 180 天" />
        </el-select>
        <el-button @click="loadAll"><el-icon><Refresh /></el-icon> 刷新</el-button>
      </div>
    </header>

    <!-- 每个类别一个分区 -->
    <section v-for="cat in categories" :key="cat.key" class="pdp-block" v-loading="loading">
      <div class="pdp-block-head">
        <div>
          <h3 class="pdp-block-title">{{ cat.label }}</h3>
          <p class="pdp-block-desc" v-if="cat.desc">{{ cat.desc }}</p>
        </div>
        <el-button type="primary" size="small" @click="openEntry(cat)">
          <el-icon><EditPen /></el-icon> 录入{{ cat.label }}
        </el-button>
      </div>

      <!-- 最新一天汇总卡 -->
      <div class="pdp-summary">
        <div v-for="f in cat.fields" :key="f.key" class="pdp-scard">
          <span class="pdp-slabel">{{ f.label }}</span>
          <b class="pdp-svalue" :class="{ money: f.money }">
            {{ f.money ? '¥' + fmtMoney(latestVal(cat, f.key)) : fmtNum(latestVal(cat, f.key)) }}
          </b>
        </div>
        <div class="pdp-scard latest">
          <span class="pdp-slabel">数据日期</span>
          <b class="pdp-svalue small">{{ latestRow(cat)?.statDate || '暂无数据' }}</b>
        </div>
      </div>

      <!-- 明细表 -->
      <el-table :data="rowsOf(cat)" size="small" empty-text="还没有数据,点右上角「录入」开始记录">
        <el-table-column label="日期" prop="statDate" width="120" fixed />
        <el-table-column v-for="f in cat.fields" :key="f.key" :label="f.label" align="right" min-width="90">
          <template #default="{ row }">
            {{ f.money ? '¥' + fmtMoney(cellVal(row, cat, f.key)) : fmtNum(cellVal(row, cat, f.key)) }}
          </template>
        </el-table-column>
        <el-table-column label="备注" prop="remark" min-width="120" show-overflow-tooltip />
        <el-table-column label="操作" width="70" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openEntry(cat, row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <!-- 录入弹窗 -->
    <el-dialog v-model="entry.visible" :title="entryTitle" width="480px" destroy-on-close>
      <el-form :model="entry.form" label-width="96px">
        <el-form-item label="日期" required>
          <el-date-picker v-model="entry.form.statDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" />
        </el-form-item>
        <el-form-item v-for="f in entry.cat?.fields || []" :key="f.key" :label="f.label">
          <el-input-number
            v-model="entry.values[f.key]"
            :min="0"
            :precision="f.money ? 2 : 0"
            controls-position="right"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="entry.form.remark" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="entry.visible = false">取消</el-button>
        <el-button type="primary" :loading="entry.saving" @click="submitEntry">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, EditPen } from '@element-plus/icons-vue'
import { opMetricApi, type OpChannelMetric } from '@/api/operation'

/** 单个指标字段定义 */
export interface MetricField {
  key: string
  label: string
  /** true=金额(2 位小数、¥前缀、映射到实体 adCost 或存 metrics) */
  money?: boolean
}
/** 单个类别(分区)定义 */
export interface MetricCategory {
  key: string
  label: string
  desc?: string
  fields: MetricField[]
}

const props = defineProps<{
  platform: string
  platformLabel: string
  categories: MetricCategory[]
}>()

const days = ref(30)
const loading = ref(false)
/** 各类别数据:catKey -> rows */
const dataMap = ref<Record<string, OpChannelMetric[]>>({})

/** overview 概览:固定四指标直接落实体列;其余类别的指标全部走 metrics JSON。 */
const OVERVIEW = 'overview'
/** overview 概览的固定字段 → 实体列映射 */
const OVERVIEW_COLS: Record<string, keyof OpChannelMetric> = {
  views: 'views',
  visits: 'visits',
  inquiries: 'inquiries',
  adCost: 'adCost'
}

const loadCat = async (cat: MetricCategory) => {
  const res: any = await opMetricApi.recent({ days: days.value, platform: props.platform, category: cat.key })
  const data = res?.data ?? res
  dataMap.value[cat.key] = Array.isArray(data) ? data : []
}
const loadAll = async () => {
  loading.value = true
  try {
    await Promise.all(props.categories.map(loadCat))
  } catch {
    props.categories.forEach((c) => (dataMap.value[c.key] = []))
  } finally {
    loading.value = false
  }
}

const rowsOf = (cat: MetricCategory) => dataMap.value[cat.key] || []
const latestRow = (cat: MetricCategory): OpChannelMetric | undefined => {
  const list = rowsOf(cat)
  if (!list.length) return undefined
  return list.reduce((a, b) => (a.statDate >= b.statDate ? a : b))
}

/** 解析某行某字段的值:overview 取实体列,其余从 metrics JSON 取 */
const cellVal = (row: OpChannelMetric, cat: MetricCategory, fieldKey: string): number | undefined => {
  if (cat.key === OVERVIEW && OVERVIEW_COLS[fieldKey]) {
    return row[OVERVIEW_COLS[fieldKey]] as number | undefined
  }
  return parseMetrics(row.metrics)[fieldKey]
}
const latestVal = (cat: MetricCategory, fieldKey: string): number | undefined => {
  const row = latestRow(cat)
  return row ? cellVal(row, cat, fieldKey) : undefined
}
const parseMetrics = (raw?: string): Record<string, number> => {
  if (!raw) return {}
  try {
    const obj = JSON.parse(raw)
    return obj && typeof obj === 'object' ? obj : {}
  } catch {
    return {}
  }
}

/* ===== 录入 ===== */
const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
const entry = ref<{
  visible: boolean
  saving: boolean
  cat: MetricCategory | null
  form: OpChannelMetric
  values: Record<string, number | undefined>
}>({
  visible: false,
  saving: false,
  cat: null,
  form: { platform: props.platform, statDate: '', remark: '' },
  values: {}
})
const entryTitle = computed(() => {
  const c = entry.value.cat
  const editing = entry.value.form.id
  return `${editing ? '编辑' : '录入'}${c ? c.label : ''}`
})

const openEntry = (cat: MetricCategory, row?: OpChannelMetric) => {
  const values: Record<string, number | undefined> = {}
  cat.fields.forEach((f) => {
    values[f.key] = row ? cellVal(row, cat, f.key) : undefined
  })
  entry.value = {
    visible: true,
    saving: false,
    cat,
    form: row
      ? { ...row }
      : { platform: props.platform, category: cat.key, statDate: todayStr(), remark: '' },
    values
  }
}

const submitEntry = async () => {
  const cat = entry.value.cat
  if (!cat) return
  const f = entry.value.form
  if (!f.statDate) {
    ElMessage.warning('请选择日期')
    return
  }
  // 组装 payload:overview 写实体列,其余写 metrics JSON
  const payload: OpChannelMetric = {
    ...f,
    platform: props.platform,
    category: cat.key,
    source: f.source || 'manual'
  }
  if (cat.key === OVERVIEW) {
    cat.fields.forEach((fld) => {
      const col = OVERVIEW_COLS[fld.key]
      if (col) (payload as any)[col] = entry.value.values[fld.key] ?? 0
    })
  } else {
    const kv: Record<string, number> = {}
    cat.fields.forEach((fld) => {
      kv[fld.key] = entry.value.values[fld.key] ?? 0
    })
    payload.metrics = JSON.stringify(kv)
  }
  entry.value.saving = true
  try {
    await opMetricApi.save(payload)
    ElMessage.success('已保存')
    entry.value.visible = false
    await loadCat(cat)
  } catch {
    ElMessage.error('保存失败')
  } finally {
    entry.value.saving = false
  }
}

const fmtNum = (n?: number) => (n == null ? '—' : Number(n).toLocaleString())
const fmtMoney = (n?: number) =>
  n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

onMounted(loadAll)
</script>

<style scoped>
.pdp {
  padding: 16px 18px;
}
.pdp-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.pdp-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pdp-sub {
  margin: 6px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
  max-width: 680px;
}
.pdp-sub .el-tag {
  margin-right: 6px;
  vertical-align: middle;
}
.pdp-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}
.pdp-block {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
  background: var(--el-bg-color);
  padding: 16px 18px;
  margin-bottom: 18px;
}
.pdp-block-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.pdp-block-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pdp-block-desc {
  margin: 3px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pdp-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.pdp-scard {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pdp-scard.latest {
  background: var(--el-fill-color-light);
}
.pdp-slabel {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.pdp-svalue {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.pdp-svalue.small {
  font-size: 14px;
  font-weight: 500;
}
.pdp-svalue.money {
  color: var(--el-color-danger);
}
</style>

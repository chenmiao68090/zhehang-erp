<template>
  <div class="seal-inv">
    <header class="si-head">
      <div>
        <h2 class="si-title">印章库存与采购</h2>
        <p class="si-sub">刻章部门的章料/印油/章盒等耗材库存,以及采购记录;采购到货可一键入库。</p>
      </div>
    </header>

    <el-tabs v-model="tab" class="si-tabs">
      <!-- 库存 -->
      <el-tab-pane label="库存" name="stock">
        <div class="si-bar">
          <el-input v-model="stockKw" class="si-search" placeholder="搜品名…" clearable @keyup.enter="loadStock" @clear="loadStock" />
          <span v-if="lowCount" class="si-low-tip"><el-icon><Warning /></el-icon> {{ lowCount }} 项低于安全库存</span>
          <el-button type="primary" @click="openStock()"><el-icon><Plus /></el-icon> 新增耗材</el-button>
        </div>
        <el-table :data="stockRows" v-loading="stockLoading" border stripe :row-class-name="stockRowClass">
          <el-table-column label="品名" prop="itemName" min-width="140" show-overflow-tooltip />
          <el-table-column label="规格" prop="spec" width="110" />
          <el-table-column label="单位" prop="unit" width="64" />
          <el-table-column label="当前库存" width="110" align="right">
            <template #default="{ row }">
              <span :class="{ 'si-low': isLow(row) }">{{ row.quantity ?? 0 }}</span>
              <el-tag v-if="isLow(row)" size="small" type="danger" effect="plain" style="margin-left: 4px">不足</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="安全库存" prop="safetyStock" width="90" align="right" />
          <el-table-column label="参考单价" width="96" align="right">
            <template #default="{ row }">¥{{ fmtMoney(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="常用供应商" prop="supplier" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="success" plain @click="openAdjust(row, 1)">入库</el-button>
              <el-button size="small" type="warning" plain @click="openAdjust(row, -1)">出库</el-button>
              <el-button size="small" link @click="openLogs(row)">记录</el-button>
              <el-button size="small" link @click="openStock(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="removeStock(row)">删</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有耗材,先把常用章料/印油录进来" :image-size="80">
              <el-button type="primary" @click="openStock()">新增耗材</el-button>
            </el-empty>
          </template>
        </el-table>
      </el-tab-pane>

      <!-- 采购 -->
      <el-tab-pane label="采购记录" name="purchase">
        <div class="si-bar">
          <el-input v-model="purKw" class="si-search" placeholder="搜品名…" clearable @keyup.enter="reloadPur" @clear="reloadPur" />
          <el-select v-model="purStatus" placeholder="状态" clearable class="si-filter" @change="reloadPur">
            <el-option label="已下单" value="ordered" />
            <el-option label="已到货" value="arrived" />
          </el-select>
          <el-button type="primary" @click="openPur()"><el-icon><Plus /></el-icon> 新增采购</el-button>
        </div>
        <el-table :data="purRows" v-loading="purLoading" border stripe>
          <el-table-column label="采购日期" prop="purchaseDate" width="108" />
          <el-table-column label="品名" prop="itemName" min-width="130" show-overflow-tooltip />
          <el-table-column label="规格" prop="spec" width="100" />
          <el-table-column label="数量" prop="quantity" width="72" align="right" />
          <el-table-column label="单价" width="90" align="right">
            <template #default="{ row }">¥{{ fmtMoney(row.unitPrice) }}</template>
          </el-table-column>
          <el-table-column label="金额" width="100" align="right">
            <template #default="{ row }">¥{{ fmtMoney(row.amount ?? (row.unitPrice || 0) * (row.quantity || 0)) }}</template>
          </el-table-column>
          <el-table-column label="供应商" prop="supplier" min-width="110" show-overflow-tooltip />
          <el-table-column label="采购人" prop="operator" width="86" />
          <el-table-column label="状态" width="84">
            <template #default="{ row }">
              <el-tag size="small" :type="row.status === 'arrived' ? 'success' : 'info'">{{ row.status === 'arrived' ? '已到货' : '已下单' }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button v-if="row.status !== 'arrived'" size="small" type="primary" @click="arrive(row)">到货入库</el-button>
              <el-button size="small" link @click="openPur(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="removePur(row)">删</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有采购记录" :image-size="80">
              <el-button type="primary" @click="openPur()">新增采购</el-button>
            </el-empty>
          </template>
        </el-table>
        <div class="si-pager">
          <el-pagination v-model:current-page="purPage" v-model:page-size="purSize" :total="purTotal" :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next" @current-change="loadPur" @size-change="reloadPur" />
        </div>
      </el-tab-pane>

      <!-- 盘点记录 -->
      <el-tab-pane label="盘点记录" name="check">
        <div class="si-bar">
          <el-button type="primary" @click="openCheck()"><el-icon><Plus /></el-icon> 新增盘点</el-button>
        </div>
        <el-table :data="checkRows" v-loading="checkLoading" border stripe>
          <el-table-column label="盘点日期" prop="checkDate" width="120" />
          <el-table-column label="品名" prop="itemName" min-width="160" show-overflow-tooltip />
          <el-table-column label="账面库存" prop="bookQty" width="100" align="right" />
          <el-table-column label="实际盘点" prop="actualQty" width="100" align="right" />
          <el-table-column label="差异" width="100" align="right">
            <template #default="{ row }">
              <span :class="diffClass(row.diff)">{{ (row.diff ?? 0) > 0 ? '+' + row.diff : (row.diff ?? 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="盘点人" prop="operator" width="100" />
          <el-table-column label="备注" prop="remark" min-width="140" show-overflow-tooltip />
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link @click="openCheck(row)">编辑</el-button>
              <el-button size="small" link type="danger" @click="removeCheck(row)">删</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有盘点记录" :image-size="80">
              <el-button type="primary" @click="openCheck()">新增盘点</el-button>
            </el-empty>
          </template>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 库存 新增/编辑 -->
    <el-dialog v-model="stockDlg.visible" :title="stockForm.id ? '编辑耗材' : '新增耗材'" width="540px" destroy-on-close>
      <el-form :model="stockForm" label-width="92px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="品名" required>
            <el-select v-model="stockForm.itemName" filterable allow-create default-first-option placeholder="选择或输入品名" style="width: 100%">
              <el-option v-for="opt in SEAL_ITEM_CATEGORIES" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="stockForm.spec" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="单位"><el-input v-model="stockForm.unit" placeholder="个/盒/瓶" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="当前库存"><el-input-number v-model="stockForm.quantity" :min="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="安全库存"><el-input-number v-model="stockForm.safetyStock" :min="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="参考单价"><el-input-number v-model="stockForm.unitPrice" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">采购信息</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="采购日期"><el-date-picker v-model="stockForm.purchaseDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="购买数量"><el-input-number v-model="stockForm.buyQty" :min="0" :precision="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="购入价"><el-input-number v-model="stockForm.buyPrice" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="优惠总计"><el-input-number v-model="stockForm.discount" :min="0" :precision="2" :controls="false" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="发票开具"><el-switch v-model="stockForm.invoiceDone" :active-value="1" :inactive-value="0" active-text="已开" inactive-text="未开" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="发票附件"><el-input v-model="stockForm.invoiceFile" placeholder="附件URL/说明" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="采购链接"><el-input v-model="stockForm.purchaseLink" placeholder="淘宝/京东链接" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="常用供应商"><el-input v-model="stockForm.supplier" /></el-form-item>
        <el-form-item label="备注"><el-input v-model="stockForm.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stockDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="stockDlg.saving" @click="submitStock">保存</el-button>
      </template>
    </el-dialog>

    <!-- 入库/出库 -->
    <el-dialog v-model="adjDlg.visible" :title="(adjDlg.sign > 0 ? '入库' : '出库') + ' · ' + (adjDlg.row?.itemName || '')" width="420px" destroy-on-close>
      <el-form label-width="72px">
        <el-form-item label="当前库存">{{ adjDlg.row?.quantity ?? 0 }} {{ adjDlg.row?.unit || '' }}</el-form-item>
        <el-form-item :label="adjDlg.sign > 0 ? '入库数量' : '出库数量'">
          <el-input-number v-model="adjDlg.qty" :min="1" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="变更后">{{ (adjDlg.row?.quantity ?? 0) + adjDlg.sign * adjDlg.qty }}</el-form-item>
        <el-form-item label="事由"><el-input v-model="adjDlg.reason" placeholder="可选,如:领用刻章/盘点修正" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="adjDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="adjDlg.saving" @click="submitAdjust">确认</el-button>
      </template>
    </el-dialog>

    <!-- 库存调整记录 -->
    <el-dialog v-model="logDlg.visible" :title="'调整记录 · ' + (logDlg.itemName || '')" width="640px" destroy-on-close>
      <el-table :data="logDlg.rows" v-loading="logDlg.loading" size="small" border max-height="420">
        <el-table-column label="时间" width="160">
          <template #default="{ row }">{{ (row.createTime || '').replace('T', ' ').slice(0, 16) }}</template>
        </el-table-column>
        <el-table-column label="变动" width="100">
          <template #default="{ row }">
            <el-tag :type="row.delta >= 0 ? 'success' : 'warning'" size="small">{{ row.delta >= 0 ? '入库+' + row.delta : '出库' + row.delta }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="前→后" width="100">
          <template #default="{ row }">{{ row.beforeQty }} → {{ row.afterQty }}</template>
        </el-table-column>
        <el-table-column label="事由" prop="reason" min-width="160" show-overflow-tooltip />
        <template #empty><el-empty description="还没有调整记录" :image-size="60" /></template>
      </el-table>
    </el-dialog>

    <!-- 采购 新增/编辑 -->
    <el-dialog v-model="purDlg.visible" :title="purForm.id ? '编辑采购' : '新增采购'" width="560px" destroy-on-close>
      <el-form :model="purForm" label-width="92px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="品名" required><el-input v-model="purForm.itemName" placeholder="与库存品名一致可自动入库" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="规格"><el-input v-model="purForm.spec" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="数量"><el-input-number v-model="purForm.quantity" :min="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="单价"><el-input-number v-model="purForm.unitPrice" :min="0" :precision="2" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="供应商"><el-input v-model="purForm.supplier" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="采购人"><el-input v-model="purForm.operator" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="采购日期"><el-date-picker v-model="purForm.purchaseDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="金额">¥{{ fmtMoney((purForm.unitPrice || 0) * (purForm.quantity || 0)) }} <span class="si-muted">(数量×单价,自动计算)</span></el-form-item>
        <el-form-item label="备注"><el-input v-model="purForm.remark" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="purDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="purDlg.saving" @click="submitPur">保存</el-button>
      </template>
    </el-dialog>

    <!-- 盘点 新增/编辑 -->
    <el-dialog v-model="checkDlg.visible" :title="checkForm.id ? '编辑盘点' : '新增盘点'" width="520px" destroy-on-close>
      <el-form :model="checkForm" label-width="92px">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="品名" required>
            <el-select v-model="checkForm.itemName" filterable allow-create default-first-option placeholder="选择或输入品名" style="width: 100%">
              <el-option v-for="opt in SEAL_ITEM_CATEGORIES" :key="opt" :label="opt" :value="opt" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="盘点日期"><el-date-picker v-model="checkForm.checkDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="账面库存"><el-input-number v-model="checkForm.bookQty" :min="0" :precision="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="实际盘点"><el-input-number v-model="checkForm.actualQty" :min="0" :precision="0" controls-position="right" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="差异">
            <span :class="diffClass(checkDiff)">{{ checkDiff > 0 ? '+' + checkDiff : checkDiff }}</span>
            <span class="si-muted">(实际-账面,自动计算)</span>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="盘点人"><el-input v-model="checkForm.operator" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="checkForm.remark" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="checkDlg.saving" @click="submitCheck">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Warning } from '@element-plus/icons-vue'
import { sealStockApi, sealPurchaseApi, stockCheckApi, type SealStock, type SealPurchase, type SealStockCheck } from '@/api/seal'

const tab = ref('stock')
const SEAL_ITEM_CATEGORIES = ['公章/合同章 圆42', '财务章/个 抓把25*25', '法人章/个 方20*60', '发票章', '曝光膜/张', '硫酸纸/张', '鹰牌砂纸', '透明密封袋10丝|12*17cm', '印油/瓶 1000ml', '特殊章汇总', '其他消耗品(纸巾)']
const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const todayStr = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/* ---------- 库存 ---------- */
const stockRows = ref<SealStock[]>([])
const stockLoading = ref(false)
const stockKw = ref('')
const isLow = (r: SealStock) => (r.safetyStock ?? 0) > 0 && (r.quantity ?? 0) <= (r.safetyStock ?? 0)
const lowCount = computed(() => stockRows.value.filter(isLow).length)
const stockRowClass = ({ row }: { row: SealStock }) => (isLow(row) ? 'si-low-row' : '')

const loadStock = async () => {
  stockLoading.value = true
  try {
    const res: any = await sealStockApi.list(stockKw.value || undefined)
    stockRows.value = (res?.data ?? res) || []
  } catch { stockRows.value = [] } finally { stockLoading.value = false }
}

const stockDlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const stockForm = ref<SealStock>({})
const openStock = (row?: SealStock) => {
  stockForm.value = row ? { ...row } : { unit: '个', quantity: 0, safetyStock: 0, unitPrice: 0, purchaseDate: '', buyQty: 0, buyPrice: 0, discount: 0, invoiceDone: 0, invoiceFile: '', purchaseLink: '' }
  stockDlg.value = { visible: true, saving: false }
}
const submitStock = async () => {
  if (!stockForm.value.itemName) { ElMessage.warning('请填写品名'); return }
  stockDlg.value.saving = true
  try {
    if (stockForm.value.id) await sealStockApi.update(stockForm.value)
    else await sealStockApi.create(stockForm.value)
    ElMessage.success('已保存'); stockDlg.value.visible = false; loadStock()
  } catch { ElMessage.error('保存失败') } finally { stockDlg.value.saving = false }
}
const removeStock = async (row: SealStock) => {
  try { await ElMessageBox.confirm(`删除耗材「${row.itemName}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await sealStockApi.remove(row.id!); ElMessage.success('已删除'); loadStock() } catch { ElMessage.error('删除失败') }
}

const adjDlg = ref<{ visible: boolean; saving: boolean; row?: SealStock; sign: number; qty: number; reason: string }>({ visible: false, saving: false, sign: 1, qty: 1, reason: '' })
const openAdjust = (row: SealStock, sign: number) => { adjDlg.value = { visible: true, saving: false, row, sign, qty: 1, reason: '' } }
const submitAdjust = async () => {
  adjDlg.value.saving = true
  try {
    await sealStockApi.adjust(adjDlg.value.row!.id!, adjDlg.value.sign * adjDlg.value.qty, adjDlg.value.reason)
    ElMessage.success('库存已更新'); adjDlg.value.visible = false; loadStock()
  } catch (e: any) { ElMessage.error(e?.message || '操作失败') } finally { adjDlg.value.saving = false }
}

// 调整记录查看
const logDlg = ref<{ visible: boolean; loading: boolean; itemName: string; rows: any[] }>({ visible: false, loading: false, itemName: '', rows: [] })
const openLogs = async (row: SealStock) => {
  logDlg.value = { visible: true, loading: true, itemName: row.itemName || '', rows: [] }
  try {
    const res: any = await sealStockApi.logs(row.id!)
    logDlg.value.rows = res?.data ?? res ?? []
  } catch { logDlg.value.rows = [] } finally { logDlg.value.loading = false }
}

/* ---------- 采购 ---------- */
const purRows = ref<SealPurchase[]>([])
const purLoading = ref(false)
const purTotal = ref(0)
const purPage = ref(1)
const purSize = ref(10)
const purKw = ref('')
const purStatus = ref<string>()
const loadPur = async () => {
  purLoading.value = true
  try {
    const res: any = await sealPurchaseApi.list({ pageNum: purPage.value, pageSize: purSize.value, keyword: purKw.value || undefined, status: purStatus.value || undefined })
    const page = res?.data ?? res
    purRows.value = page?.records || []
    purTotal.value = Number(page?.total ?? purRows.value.length)
  } catch { purRows.value = [] } finally { purLoading.value = false }
}
const reloadPur = () => { purPage.value = 1; loadPur() }

const purDlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const purForm = ref<SealPurchase>({})
const openPur = (row?: SealPurchase) => {
  purForm.value = row ? { ...row } : { purchaseDate: todayStr(), quantity: 0, unitPrice: 0, status: 'ordered' }
  purDlg.value = { visible: true, saving: false }
}
const submitPur = async () => {
  if (!purForm.value.itemName) { ElMessage.warning('请填写品名'); return }
  purDlg.value.saving = true
  try {
    if (purForm.value.id) await sealPurchaseApi.update(purForm.value)
    else await sealPurchaseApi.create(purForm.value)
    ElMessage.success('已保存'); purDlg.value.visible = false; loadPur()
  } catch { ElMessage.error('保存失败') } finally { purDlg.value.saving = false }
}
const arrive = async (row: SealPurchase) => {
  try { await ElMessageBox.confirm(`确认「${row.itemName}」已到货,把 ${row.quantity} 加入库存?`, '到货入库', { type: 'info' }) } catch { return }
  try { await sealPurchaseApi.arrive(row.id!); ElMessage.success('已入库'); loadPur(); loadStock() } catch (e: any) { ElMessage.error(e?.message || '入库失败') }
}
const removePur = async (row: SealPurchase) => {
  try { await ElMessageBox.confirm(`删除采购记录「${row.itemName}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await sealPurchaseApi.remove(row.id!); ElMessage.success('已删除'); loadPur() } catch { ElMessage.error('删除失败') }
}

/* ---------- 盘点 ---------- */
const checkRows = ref<SealStockCheck[]>([])
const checkLoading = ref(false)
const diffClass = (d?: number) => ((d ?? 0) === 0 ? 'si-muted' : (d ?? 0) > 0 ? 'si-diff-up' : 'si-low')
const loadCheck = async () => {
  checkLoading.value = true
  try {
    const res: any = await stockCheckApi.list()
    checkRows.value = (res?.data ?? res) || []
  } catch { checkRows.value = [] } finally { checkLoading.value = false }
}

const checkDlg = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const checkForm = ref<SealStockCheck>({})
const checkDiff = computed(() => (checkForm.value.actualQty ?? 0) - (checkForm.value.bookQty ?? 0))
const openCheck = (row?: SealStockCheck) => {
  checkForm.value = row ? { ...row } : { checkDate: todayStr(), bookQty: 0, actualQty: 0 }
  checkDlg.value = { visible: true, saving: false }
}
const submitCheck = async () => {
  if (!checkForm.value.itemName) { ElMessage.warning('请填写品名'); return }
  checkDlg.value.saving = true
  try {
    await stockCheckApi.save({ ...checkForm.value, diff: checkDiff.value })
    ElMessage.success('已保存'); checkDlg.value.visible = false; loadCheck()
  } catch { ElMessage.error('保存失败') } finally { checkDlg.value.saving = false }
}
const removeCheck = async (row: SealStockCheck) => {
  try { await ElMessageBox.confirm(`删除盘点记录「${row.itemName}」?`, '删除', { type: 'warning' }) } catch { return }
  try { await stockCheckApi.remove(row.id!); ElMessage.success('已删除'); loadCheck() } catch { ElMessage.error('删除失败') }
}

onMounted(() => { loadStock(); loadPur(); loadCheck() })
</script>

<style scoped>
.seal-inv { padding: 16px 18px; }
.si-head { margin-bottom: 6px; }
.si-title { margin: 0; font-size: 20px; font-weight: 600; color: var(--el-text-color-primary); }
.si-sub { margin: 5px 0 0; font-size: 13px; color: var(--el-text-color-secondary); }
.si-bar { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.si-search { width: 200px; }
.si-filter { width: 120px; }
.si-low-tip { color: var(--el-color-danger); font-size: 13px; display: inline-flex; align-items: center; gap: 4px; }
.si-low { color: var(--el-color-danger); font-weight: 700; }
.si-diff-up { color: var(--el-color-success); font-weight: 700; }
.si-muted { color: var(--el-text-color-secondary); font-size: 12px; }
.si-pager { display: flex; justify-content: flex-end; margin-top: 12px; }
:deep(.si-low-row) { background: var(--el-color-danger-light-9); }
</style>

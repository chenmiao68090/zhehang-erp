<template>
  <div class="ao-page">
    <!-- 页头 -->
    <header class="ao-head">
      <div>
        <h2 class="ao-title">挂靠地址提单</h2>
        <p class="ao-sub">地址业务新签/续签报单：可先暂存草稿，资料确认后再提交审批。</p>
      </div>
      <el-button type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 新增地址报单</el-button>
    </header>

    <!-- 筛选 -->
    <div class="ao-filter">
      <el-input v-model="query.keyword" class="ao-kw" placeholder="搜企业名称…" clearable @keyup.enter="loadList" @clear="loadList">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="query.customerSource" placeholder="客户来源" clearable style="width: 170px" @change="loadList">
        <el-option v-for="s in CUSTOMER_SOURCES" :key="s" :label="s" :value="s" />
      </el-select>
      <el-select v-model="query.stewardId" placeholder="服务管家" clearable filterable style="width: 150px" @change="loadList">
        <el-option v-for="c in colleagues" :key="c.userId" :label="c.name" :value="c.userId" />
      </el-select>
      <el-select v-model="query.salesId" placeholder="销售人员" clearable filterable style="width: 150px" @change="loadList">
        <el-option v-for="c in colleagues" :key="c.userId" :label="c.name" :value="c.userId" />
      </el-select>
      <el-button @click="loadList"><el-icon><Search /></el-icon> 查询</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="rows" v-loading="loading" border stripe>
      <el-table-column label="企业名称" prop="companyName" min-width="180" show-overflow-tooltip />
      <el-table-column label="客户来源" prop="customerSource" width="140" show-overflow-tooltip />
      <el-table-column label="地址类型" prop="addressType" width="90" align="center" />
      <el-table-column label="法人" prop="legalName" width="90" />
      <el-table-column label="服务管家" prop="stewardName" width="100" />
      <el-table-column label="销售" prop="salesName" width="100" />
      <el-table-column label="收款汇总" width="120" align="right">
        <template #default="{ row }">¥{{ fmtMoney(row.collectTotal) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="90" align="center">
        <template #default="{ row }">
          <el-tag size="small" :type="statusType(row.status)">{{ statusLabel(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="190" fixed="right">
        <template #default="{ row }">
          <template v-if="isEditableStatus(row.status)">
            <el-button size="small" link type="primary" @click="openForm(row)">编辑</el-button>
            <el-button size="small" link type="success" @click="submitSavedDraft(row)">提交审批</el-button>
            <el-button size="small" link type="danger" @click="remove(row)">删除</el-button>
          </template>
          <span v-else class="ao-muted">已提交</span>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="还没有地址报单,点右上角「新增地址报单」开始" :image-size="80">
          <el-button type="primary" @click="openForm()">新增地址报单</el-button>
        </el-empty>
      </template>
    </el-table>

    <div class="ao-pager" v-if="total > 0">
      <el-pagination
        background layout="total, prev, pager, next"
        :total="total" :current-page="query.pageNum" :page-size="query.pageSize"
        @current-change="onPageChange" />
    </div>

    <!-- 表单弹窗 -->
    <el-dialog v-model="dlg.visible" :title="form.id ? '编辑地址报单' : '新增地址报单'" width="920px" top="4vh" destroy-on-close class="ao-dialog">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px" class="ao-form">
        <!-- 客户基础 / 申请详情 -->
        <el-divider content-position="left">客户基础 · 申请详情</el-divider>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="企业名称" prop="companyName"><el-input v-model="form.companyName" placeholder="企业名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="客户来源" prop="customerSource">
            <el-select v-model="form.customerSource" placeholder="选择客户来源" style="width: 100%">
              <el-option v-for="s in CUSTOMER_SOURCES" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="地址类型">
            <el-select v-model="form.addressType" placeholder="新签/续签" style="width: 100%">
              <el-option v-for="a in ADDRESS_TYPES" :key="a" :label="a" :value="a" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="24"><el-form-item label="企业地址" prop="companyAddress"><el-input v-model="form.companyAddress" placeholder="新出地址或续签地址" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="法人姓名" prop="legalName"><el-input v-model="form.legalName" placeholder="法人姓名" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="法人联系方式" prop="legalPhone"><el-input v-model="form.legalPhone" placeholder="手机号" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="法人身份证号"><el-input v-model="form.legalIdCard" placeholder="身份证号(可空)" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="服务管家">
            <el-select v-model="form.stewardId" placeholder="选择服务管家" clearable filterable style="width: 100%" @change="onStewardChange">
              <el-option v-for="c in colleagues" :key="c.userId" :label="c.deptName ? `${c.name}(${c.deptName})` : c.name" :value="c.userId" />
            </el-select>
          </el-form-item></el-col>
          <el-col :span="12"><el-form-item label="销售人员">
            <el-select v-model="form.salesId" placeholder="选择销售人员" clearable filterable style="width: 100%" @change="onSalesChange">
              <el-option v-for="c in colleagues" :key="c.userId" :label="c.deptName ? `${c.name}(${c.deptName})` : c.name" :value="c.userId" />
            </el-select>
          </el-form-item></el-col>
        </el-row>

        <!-- 子表① 服务单位收款详情 -->
        <el-divider content-position="left">服务单位收款详情</el-divider>
        <el-table :data="collectItems" border size="small">
          <el-table-column label="收款类型" width="120"><template #default="{ row }">
            <el-select v-model="row.collectType" placeholder="选择" style="width: 100%">
              <el-option v-for="t in COLLECT_TYPES" :key="t" :label="t" :value="t" />
            </el-select>
          </template></el-table-column>
          <el-table-column label="收款账户" min-width="190"><template #default="{ row }">
            <el-select v-model="row.account" placeholder="选择收款账户" style="width: 100%">
              <el-option v-for="a in COLLECT_ACCOUNTS" :key="a" :label="a" :value="a" />
            </el-select>
          </template></el-table-column>
          <el-table-column label="收款日期(到分钟)" width="200"><template #default="{ row }"><el-date-picker v-model="row.collectDate" type="datetime" value-format="YYYY-MM-DD HH:mm" format="YYYY-MM-DD HH:mm" placeholder="如 2026-07-20 16:20" style="width: 100%" /></template></el-table-column>
          <el-table-column label="客户单号/付款单号" min-width="150"><template #default="{ row }"><el-input v-model="row.orderNo" placeholder="单号" /></template></el-table-column>
          <el-table-column width="60" align="center"><template #default="{ $index }"><el-button link type="danger" size="small" @click="collectItems.splice($index, 1)"><el-icon><Close /></el-icon></el-button></template></el-table-column>
        </el-table>
        <el-button class="ao-add" size="small" @click="collectItems.push({})"><el-icon><Plus /></el-icon> 添加收款行</el-button>

        <!-- 子表② 付款单位信息 -->
        <el-divider content-position="left">付款单位信息</el-divider>
        <el-table :data="payerUnits" border size="small">
          <el-table-column label="企业名称" min-width="200"><template #default="{ row }"><el-input v-model="row.companyName" placeholder="付款企业名称" /></template></el-table-column>
          <el-table-column label="对接人姓名" min-width="140"><template #default="{ row }"><el-input v-model="row.contactName" placeholder="对接人" /></template></el-table-column>
          <el-table-column label="对接人号码(11位)" min-width="160"><template #default="{ row }">
            <el-input v-model="row.contactPhone" placeholder="11位手机号" maxlength="11"
              :class="{ 'ao-phone-bad': row.contactPhone && !PHONE_RE.test(row.contactPhone) }"
              @input="row.contactPhone = String(row.contactPhone || '').replace(/\D/g, '')" />
          </template></el-table-column>
          <el-table-column width="60" align="center"><template #default="{ $index }"><el-button link type="danger" size="small" @click="payerUnits.splice($index, 1)"><el-icon><Close /></el-icon></el-button></template></el-table-column>
        </el-table>
        <el-button class="ao-add" size="small" @click="payerUnits.push({})"><el-icon><Plus /></el-icon> 添加付款单位</el-button>

        <!-- 服务事项、合同周期和收款金额属于同一业务约定，集中填写。 -->
        <el-divider content-position="left">服务事项、合同与收款</el-divider>
        <section class="ao-service-contract">
          <div class="ao-section-heading">
            <strong>服务事项收款明细</strong>
            <span>逐项填写服务内容、服务时长和对应收款金额</span>
          </div>
          <el-table :data="serviceItems" border size="small">
            <el-table-column label="服务事项" min-width="260"><template #default="{ row }">
              <el-select v-model="row.serviceMatter" placeholder="选择服务事项" style="width: 100%">
                <el-option v-for="m in SERVICE_MATTERS" :key="m" :label="m" :value="m" />
              </el-select>
            </template></el-table-column>
            <el-table-column label="服务时长(天)" width="180"><template #default="{ row }"><el-input v-model.number="row.serviceDays" placeholder="天数" /></template></el-table-column>
            <el-table-column label="收款金额" width="200"><template #default="{ row }"><el-input-number v-model="row.amount" :min="0" :precision="2" controls-position="right" style="width: 100%" /></template></el-table-column>
            <el-table-column width="60" align="center"><template #default="{ $index }"><el-button link type="danger" size="small" @click="serviceItems.splice($index, 1)"><el-icon><Close /></el-icon></el-button></template></el-table-column>
          </el-table>
          <div class="ao-service-foot">
            <el-button class="ao-add" size="small" @click="serviceItems.push({})"><el-icon><Plus /></el-icon> 添加服务事项</el-button>
            <span class="ao-sum">收款汇总:<b>¥{{ fmtMoney(collectTotal) }}</b></span>
          </div>

          <!-- 合同日期整单只填一次，服务事项明细不再维护重复日期。 -->
          <div class="ao-contract-fields">
            <div class="ao-section-heading">
              <strong>合同与付款周期</strong>
              <span>合同截止日期会按付款周期和赠送月份自动计算，仍可手动调整</span>
            </div>
            <el-row :gutter="14">
              <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="付款周期">
                <el-select v-model="form.payCycle" placeholder="选择周期" clearable style="width: 100%">
                  <el-option v-for="p in PAY_CYCLES" :key="p" :label="p" :value="p" />
                </el-select>
              </el-form-item></el-col>
              <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="赠送月份"><el-input v-model.number="form.giftMonths" placeholder="赠送月数" /></el-form-item></el-col>
              <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="合同开始">
                <el-date-picker v-model="form.contractStart" type="date" value-format="YYYY-MM-DD" placeholder="开始日期" style="width: 100%" />
              </el-form-item></el-col>
              <el-col :xs="24" :sm="12" :lg="6"><el-form-item label="合同截止">
                <el-date-picker v-model="form.contractEnd" type="date" value-format="YYYY-MM-DD" placeholder="自动计算，可手改" style="width: 100%" />
              </el-form-item></el-col>
            </el-row>
          </div>
        </section>

        <!-- 返款是整单级付款资料：默认否，选择是后才收集对象和支付宝收款码 -->
        <div class="ao-rebate-box">
          <el-row :gutter="14">
            <el-col :span="8">
              <el-form-item label="是否有返款">
                <el-radio-group v-model="form.hasRebate" @change="onHasRebateChange">
                  <el-radio-button :value="0">否</el-radio-button>
                  <el-radio-button :value="1">是</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <template v-if="form.hasRebate === 1">
              <el-col :span="8">
                <el-form-item label="返款对象" prop="rebateRecipient">
                  <el-input v-model="form.rebateRecipient" maxlength="100" placeholder="填写实际收款人姓名" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="支付宝收款码" prop="rebateAlipayQrFileId">
                  <div class="ao-rebate-upload">
                    <el-upload
                      :show-file-list="false"
                      :http-request="uploadRebateQr"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf">
                      <el-button :type="form.rebateAlipayQrFileId ? 'success' : 'default'">
                        {{ form.rebateAlipayQrFileId ? '已上传，可重传' : '上传收款码' }}
                      </el-button>
                    </el-upload>
                    <template v-if="form.rebateAlipayQrFileId">
                      <el-button link type="primary" @click="previewRebateQr"><el-icon><View /></el-icon>预览</el-button>
                      <el-button link @click="downloadRebateQr"><el-icon><Download /></el-icon>下载</el-button>
                      <el-button link type="danger" @click="removeRebateQr">删除</el-button>
                    </template>
                  </div>
                  <span class="ao-hint">仅支持 JPG、PNG 或 PDF，最大10MB。</span>
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </div>

        <!-- 子表④ 尾款情况 -->
        <el-divider content-position="left">尾款情况</el-divider>
        <el-table :data="balanceItems" border size="small">
          <el-table-column label="尾款事项" min-width="260"><template #default="{ row }"><el-input v-model="row.matter" placeholder="尾款事项" /></template></el-table-column>
          <el-table-column label="尾款金额" width="160"><template #default="{ row }"><el-input-number v-model="row.amount" :min="0" :precision="2" controls-position="right" style="width: 100%" /></template></el-table-column>
          <el-table-column width="60" align="center"><template #default="{ $index }"><el-button link type="danger" size="small" @click="balanceItems.splice($index, 1)"><el-icon><Close /></el-icon></el-button></template></el-table-column>
        </el-table>
        <el-button class="ao-add" size="small" @click="balanceItems.push({})"><el-icon><Plus /></el-icon> 添加尾款行</el-button>

        <el-divider content-position="left">备注</el-divider>
        <el-form-item label="备注" label-width="60px">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注(选填)" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dlg.visible = false">取消</el-button>
        <el-button :loading="dlg.saving" @click="saveDraft">暂存草稿</el-button>
        <el-button type="primary" :loading="dlg.saving" @click="saveAndSubmit">提交审批</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="rebatePreview.visible"
      :title="rebatePreview.title"
      width="680px"
      append-to-body
      destroy-on-close
      @closed="clearRebatePreview">
      <img
        v-if="rebatePreview.type === 'image'"
        :src="rebatePreview.url"
        :alt="rebatePreview.title"
        class="ao-rebate-preview-image" />
      <iframe
        v-else-if="rebatePreview.type === 'pdf'"
        :src="rebatePreview.url"
        class="ao-rebate-preview-pdf"
        title="支付宝收款码预览" />
      <el-empty v-else description="该文件不能在线预览，请下载查看" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import dayjs from 'dayjs'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Close, View, Download } from '@element-plus/icons-vue'
import { addressOrderApi, type AddressOrder, type Colleague, type CollectItem, type PayerUnit, type ServiceItem, type BalanceItem } from '@/api/address-order'
import { fileInfoApi } from '@/api/file'
import { createAttachmentPreview, downloadAttachment, type AttachmentPreview, type AttachmentRef } from '@/utils/file-viewer'

const CUSTOMER_SOURCES = ['老客户-新签/转介绍', '老客-续费', '抖音新签', '美团新签']
const ADDRESS_TYPES = ['新签', '续签']
/** 2026-07 地址续费.docx:付款周期/收款类型/收款账户改下拉,收款日期到分钟,对接人号码11位 */
const PAY_CYCLES = ['单次业务收费', '年度收费', '两年版套餐', '三年版套餐']
const COLLECT_TYPES = ['全款', '定金', '尾款']
const COLLECT_ACCOUNTS = [
  '丰收互联丨扫码', '招商银行丨对公', '光大银行丨浙杭', '浙杭扫码丨微信', '浙杭扫码丨支付宝',
  '美团丨第三方平台收款', '淘宝丨第三方平台收款', '抖音丨第三方平台收款', '微信丨陈总个人收款'
]
/** 付款周期 → 月数(单次业务收费不自动算截止) */
const CYCLE_MONTHS: Record<string, number> = { 年度收费: 12, 两年版套餐: 24, 三年版套餐: 36 }
/** 服务事项下拉(用户2026-07-23截图批注) */
const SERVICE_MATTERS = ['地址新签', '地址续费']
const PHONE_RE = /^\d{11}$/

const loading = ref(false)
const rows = ref<AddressOrder[]>([])
const total = ref(0)
const colleagues = ref<Colleague[]>([])

const query = reactive<any>({ pageNum: 1, pageSize: 10, keyword: '', customerSource: '', stewardId: undefined, salesId: undefined })

const dlg = reactive({ visible: false, saving: false })
const formRef = ref()
const emptyForm = (): AddressOrder => ({ hasRebate: 0 })
const form = reactive<AddressOrder>(emptyForm())
const rebatePreview = ref<{ visible: boolean; title: string; url: string; type: AttachmentPreview['type'] }>({
  visible: false,
  title: '支付宝收款码',
  url: '',
  type: 'other'
})

/** 合同截止自动算:开始+周期月数+赠送月-1天(对齐文档示例 07-12→次年07-11);
 *  编辑回显期间抑制,避免覆盖库里手改过的截止日期;单次业务收费不自动算。 */
let suppressAutoEnd = false
watch(
  () => [form.contractStart, form.payCycle, form.giftMonths] as const,
  ([start, cycle]) => {
    if (suppressAutoEnd) return
    const months = CYCLE_MONTHS[cycle || '']
    if (!start || !months) return
    const gift = Math.max(0, Number(form.giftMonths) || 0)
    form.contractEnd = dayjs(start).add(months + gift, 'month').subtract(1, 'day').format('YYYY-MM-DD')
  }
)

const collectItems = ref<CollectItem[]>([])
const payerUnits = ref<PayerUnit[]>([])
const serviceItems = ref<ServiceItem[]>([])
const balanceItems = ref<BalanceItem[]>([])

const rules = {
  companyName: [{ required: true, message: '请填写企业名称', trigger: 'blur' }],
  customerSource: [{ required: true, message: '请选择客户来源', trigger: 'change' }],
  companyAddress: [{ required: true, message: '请填写企业地址', trigger: 'blur' }],
  legalName: [{ required: true, message: '请填写法人姓名', trigger: 'blur' }],
  legalPhone: [{ required: true, message: '请填写法人联系方式', trigger: 'blur' }],
  rebateRecipient: [{
    validator: (_rule: any, value: string, callback: (error?: Error) => void) =>
      form.hasRebate === 1 && !String(value || '').trim()
        ? callback(new Error('有返款时必须填写返款对象'))
        : callback(),
    trigger: 'blur'
  }],
  rebateAlipayQrFileId: [{
    validator: (_rule: any, value: number, callback: (error?: Error) => void) =>
      form.hasRebate === 1 && !Number(value)
        ? callback(new Error('有返款时必须上传支付宝收款码'))
        : callback(),
    trigger: 'change'
  }]
}

const collectTotal = computed(() =>
  serviceItems.value.reduce((sum, r) => sum + (Number(r.amount) || 0), 0)
)

const fmtMoney = (v?: number) => (Number(v) || 0).toFixed(2)
const rebateFile = (): AttachmentRef => ({
  fileId: form.rebateAlipayQrFileId,
  fileName: '支付宝收款码'
})

function onHasRebateChange(value: number | string | boolean) {
  form.hasRebate = Number(value) === 1 ? 1 : 0
  if (form.hasRebate === 0) {
    form.rebateRecipient = undefined
    form.rebateAlipayQrFileId = undefined
    clearRebatePreview()
  }
}

const isAllowedRebateQr = (file?: File) => {
  if (!file || file.size > 10 * 1024 * 1024) return false
  const type = (file.type || '').toLowerCase()
  const name = (file.name || '').toLowerCase()
  return ['image/jpeg', 'image/png', 'application/pdf'].includes(type)
    || /\.(jpe?g|png|pdf)$/i.test(name)
}

async function uploadRebateQr(options: any) {
  const file = options?.file as File | undefined
  if (!isAllowedRebateQr(file)) {
    ElMessage.warning('支付宝收款码仅支持JPG、PNG或PDF，且不能超过10MB')
    return
  }
  try {
    const res: any = await fileInfoApi.upload(file!, undefined, { silentError: true })
    const data = res?.data ?? res
    const id = Number(data?.id)
    if (!Number.isFinite(id) || id <= 0) throw new Error('missing file id')
    form.rebateAlipayQrFileId = id
    formRef.value?.clearValidate?.('rebateAlipayQrFileId')
    ElMessage.success('支付宝收款码上传成功')
  } catch {
    ElMessage.error('支付宝收款码上传失败，请重试')
  }
}

function removeRebateQr() {
  form.rebateAlipayQrFileId = undefined
  clearRebatePreview()
  ElMessage.success('已移除支付宝收款码')
}

async function previewRebateQr() {
  try {
    clearRebatePreview()
    const preview = await createAttachmentPreview(rebateFile())
    if (!preview) return
    rebatePreview.value = {
      visible: true,
      title: preview.title,
      url: preview.url,
      type: preview.type
    }
  } catch {
    ElMessage.error('收款码预览失败')
  }
}

async function downloadRebateQr() {
  try {
    await downloadAttachment(rebateFile())
  } catch {
    ElMessage.error('收款码下载失败')
  }
}

function clearRebatePreview() {
  if (rebatePreview.value.url) URL.revokeObjectURL(rebatePreview.value.url)
  rebatePreview.value = { visible: false, title: '支付宝收款码', url: '', type: 'other' }
}

/** 地址报单合同日期以整单字段为唯一事实源，服务事项只保留事项、天数和金额。 */
const serializeServiceItems = (items: ServiceItem[]) => JSON.stringify(items.map(item => ({
  serviceMatter: item.serviceMatter,
  serviceDays: item.serviceDays,
  amount: item.amount
})))

const STATUS_MAP: Record<string, { label: string; type: any }> = {
  draft: { label: '草稿', type: 'info' },
  pending: { label: '待审批', type: 'warning' },
  reviewing: { label: '审核中', type: 'warning' },
  confirmed: { label: '已确认', type: 'success' },
  rejected: { label: '已驳回', type: 'danger' }
}
const statusLabel = (s?: string) => STATUS_MAP[s || 'draft']?.label || (s || '草稿')
const statusType = (s?: string) => STATUS_MAP[s || 'draft']?.type || 'info'
const isEditableStatus = (s?: string) => s === 'draft' || s === 'rejected'

const parseJson = (s?: string): any[] => {
  if (!s) return []
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}

async function loadList() {
  loading.value = true
  try {
    const res: any = await addressOrderApi.list(query)
    // 双兼容解包:拦截器返回 R 包体{code,data}(旧写法 res?.records 永远取不到,列表一直空)
    const d = res?.data ?? res
    rows.value = d?.records || d?.list || []
    total.value = Number(d?.total || 0)
  } catch (e) {
    rows.value = []
  } finally {
    loading.value = false
  }
}

async function loadColleagues() {
  try {
    const res: any = await addressOrderApi.colleagues()
    const d = res?.data ?? res
    colleagues.value = Array.isArray(d) ? d : []
  } catch (e) {
    colleagues.value = []
  }
}

function onPageChange(p: number) { query.pageNum = p; loadList() }

function onStewardChange(id?: number) {
  const c = colleagues.value.find(x => x.userId === id)
  form.stewardName = c?.name
}
function onSalesChange(id?: number) {
  const c = colleagues.value.find(x => x.userId === id)
  form.salesName = c?.name
}

async function openForm(row?: AddressOrder) {
  // 整体重建 form,防止上一次编辑残留 status/createTime 等字段混进新单
  suppressAutoEnd = true
  Object.keys(form).forEach(k => delete (form as any)[k])
  Object.assign(form, emptyForm())
  collectItems.value = []
  payerUnits.value = []
  serviceItems.value = []
  balanceItems.value = []
  if (row?.id) {
    // 编辑取完整详情:列表接口不回传法人身份证号,直接用行数据会把它冲成空
    let full: AddressOrder = row
    try {
      const res: any = await addressOrderApi.detail(row.id)
      full = ((res?.data ?? res) || row) as AddressOrder
    } catch (e) {
      ElMessage.error('加载详情失败,请重试')
      suppressAutoEnd = false
      return
    }
    Object.assign(form, full)
    collectItems.value = parseJson(full.collectItems)
    payerUnits.value = parseJson(full.payerUnits)
    serviceItems.value = parseJson(full.serviceItems)
    balanceItems.value = parseJson(full.balanceItems)
    if (row.id && row.hasRebate === 1) {
      try {
        const rebateRes: any = await addressOrderApi.rebate(row.id)
        const rebate = rebateRes?.data ?? rebateRes
        form.hasRebate = Number(rebate?.hasRebate) === 1 ? 1 : 0
        form.rebateRecipient = rebate?.rebateRecipient
        form.rebateAlipayQrFileId = rebate?.rebateAlipayQrFileId
      } catch {
        ElMessage.warning('返款资料加载失败，请关闭后重试')
      }
    }
  }
  dlg.visible = true
  // 回显期间抑制截止日期自动算,避免覆盖库里手改过的值
  await nextTick()
  suppressAutoEnd = false
}

function buildPayload(): AddressOrder {
  // 旧“注册类型/所属年月”没有明确业务事实，页面停用后也不再回传；
  // 合同日期只认整单合同周期，收款日期只认每条收款记录。
  const { registerType: _legacyRegisterType, bizYear: _legacyBizYear, bizMonth: _legacyBizMonth, ...businessForm } = form
  return {
    ...businessForm,
    collectItems: JSON.stringify(collectItems.value),
    payerUnits: JSON.stringify(payerUnits.value),
    serviceItems: serializeServiceItems(serviceItems.value),
    balanceItems: JSON.stringify(balanceItems.value),
    collectTotal: collectTotal.value
  }
}

async function persistDraft(): Promise<number | undefined> {
  if (!String(form.companyName || '').trim()) {
    ElMessage.warning('暂存草稿至少需要填写企业名称')
    return
  }
  const res: any = await addressOrderApi.save(buildPayload())
  const data = res?.data ?? res
  const savedId = Number(data)
  if (Number.isFinite(savedId) && savedId > 0) {
    form.id = savedId
  }
  return form.id
}

async function saveDraft() {
  dlg.saving = true
  try {
    const id = await persistDraft()
    if (!id) return
    ElMessage.success('草稿已保存')
    dlg.visible = false
    loadList()
  } finally {
    dlg.saving = false
  }
}

async function saveAndSubmit() {
  await formRef.value?.validate()
  if (form.hasRebate === 1 && !String(form.rebateRecipient || '').trim()) {
    ElMessage.warning('有返款时必须填写返款对象')
    return
  }
  if (form.hasRebate === 1 && !form.rebateAlipayQrFileId) {
    ElMessage.warning('有返款时必须上传支付宝收款码')
    return
  }
  // 对接人号码强校验:填了必须 11 位数字(文档要求)
  const badPhone = payerUnits.value.find(u => u.contactPhone && !PHONE_RE.test(u.contactPhone))
  if (badPhone) {
    ElMessage.warning(`对接人号码必须是11位数字:${badPhone.contactPhone}`)
    return
  }
  dlg.saving = true
  try {
    const id = await persistDraft()
    if (!id) return
    await addressOrderApi.submit(id)
    ElMessage.success('已提交,主管可在「审单中心」进行合同审理')
    dlg.visible = false
    loadList()
  } finally {
    dlg.saving = false
  }
}

async function submitSavedDraft(row: AddressOrder) {
  await ElMessageBox.confirm(`确认将「${row.companyName}」提交审批？提交后不能继续编辑或删除。`, '提交审批', { type: 'warning' })
  await addressOrderApi.submit(row.id!)
  ElMessage.success('已提交,主管可在「审单中心」进行合同审理')
  loadList()
}

async function remove(row: AddressOrder) {
  await ElMessageBox.confirm(`确认删除「${row.companyName}」的地址报单?`, '提示', { type: 'warning' })
  await addressOrderApi.remove(row.id!)
  ElMessage.success('已删除')
  loadList()
}

onMounted(() => {
  loadList()
  loadColleagues()
})
</script>

<style lang="scss" scoped>
.ao-page { padding: 4px 2px; }
.ao-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
.ao-title { font-size: 20px; font-weight: 700; margin: 0 0 4px; color: var(--text-primary, #1f2329); }
.ao-sub { font-size: 13px; color: var(--text-muted, #86909c); margin: 0; }
.ao-filter { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
.ao-kw { width: 200px; }
.ao-muted { color: var(--text-muted, #c0c4cc); }
.ao-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
.ao-add { margin-top: 8px; }
.ao-service-contract { padding: 14px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-bg-color); }
.ao-section-heading { display: flex; align-items: baseline; gap: 10px; margin-bottom: 10px; color: var(--text-primary, #1f2329); }
.ao-section-heading strong { font-size: 14px; }
.ao-section-heading span { font-size: 12px; color: var(--text-muted, #86909c); }
.ao-contract-fields { margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--el-border-color-lighter); }
.ao-contract-fields :deep(.el-form-item) { margin-bottom: 0; }
.ao-service-foot { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.ao-sum { font-size: 14px; color: var(--text-body, #4e5969); b { color: var(--brand-primary, #3370ff); font-size: 16px; } }
.ao-rebate-box { margin-top: 12px; padding: 14px 14px 0; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; background: var(--el-fill-color-extra-light); }
.ao-rebate-upload { display: flex; align-items: center; flex-wrap: wrap; gap: 4px; }
.ao-hint { display: block; width: 100%; margin-top: 4px; color: var(--text-muted, #86909c); font-size: 12px; line-height: 18px; }
.ao-rebate-preview-image { display: block; max-width: 100%; max-height: 68vh; margin: 0 auto; object-fit: contain; }
.ao-rebate-preview-pdf { width: 100%; height: 68vh; border: 0; }
.ao-form :deep(.el-divider__text) { font-weight: 600; color: var(--text-primary, #1f2329); }
.ao-dialog :deep(.el-dialog__body) { max-height: 74vh; overflow-y: auto; }
.ao-phone-bad :deep(.el-input__wrapper) { box-shadow: 0 0 0 1px #f56c6c inset; }

@media (max-width: 767px) {
  .ao-section-heading { align-items: flex-start; flex-direction: column; gap: 2px; }
  .ao-contract-fields :deep(.el-form-item) { margin-bottom: 14px; }
}
</style>

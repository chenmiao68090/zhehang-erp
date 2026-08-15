<template>
  <div class="partner">
    <header class="pt-head">
      <div>
        <h2 class="pt-title">长期合作客户</h2>
        <p class="pt-sub">把长期合作客户、协议价、邮寄规则和结算动作放到一张台账里,减少员工反复确认。</p>
      </div>
      <div class="pt-actions">
        <el-input v-model="keyword" class="pt-search" placeholder="搜公司名/决策人/负责人" clearable @keyup.enter="reload" @clear="reload" />
        <el-select v-model="levelFilter" placeholder="等级" clearable class="pt-filter" @change="reload">
          <el-option v-for="l in levelOptions" :key="l.value" :label="l.label" :value="l.value" />
        </el-select>
        <el-select v-model="bizFilter" placeholder="业务" clearable class="pt-filter" @change="reload">
          <el-option v-for="b in bizOptions" :key="b.value" :label="b.label" :value="b.value" />
        </el-select>
        <el-button type="primary" @click="openForm()"><el-icon><Plus /></el-icon> 新增客户</el-button>
      </div>
    </header>

    <section class="pt-metrics">
      <div v-for="card in statCards" :key="card.label" :class="['pt-metric', `pt-metric--${card.tone}`]">
        <div class="pt-metric-label">{{ card.label }}</div>
        <div class="pt-metric-value">{{ card.value }}</div>
        <div class="pt-metric-note">{{ card.note }}</div>
      </div>
    </section>

    <section class="pt-rule-strip">
      <div>
        <strong>邮寄合作规则</strong>
        <span>满 3 个:京东包邮 / 顺丰 +6</span>
        <span>不满 3 个:京东 +8 / 顺丰 +12</span>
      </div>
      <p>每个客户可维护默认邮寄方式与地址,报价时先看台账,不要在备注里反复找规则。</p>
    </section>

    <section class="pt-workbench">
      <div class="pt-table-card">
        <div class="pt-card-head">
          <div>
            <strong>合作客户台账</strong>
            <span>按“客户 - 价格 - 结算动作”查看,备注只保留摘要。</span>
          </div>
          <span class="pt-head-tip">建议优先处理低价、缺价格项、未结算/缺凭证客户</span>
        </div>
        <el-table :data="rows" v-loading="loading" border stripe class="pt-table" :row-class-name="partnerRowClass">
          <el-table-column label="客户" min-width="230">
            <template #default="{ row }">
              <div class="pt-company">
                <strong>{{ row.companyName || '未命名客户' }}</strong>
                <div class="pt-meta-line">
                  <span>合作 {{ row.sinceDate || '未填' }} 起</span>
                  <span>{{ row.mailMethod || '未设邮寄' }}</span>
                </div>
                <div v-if="row.mailAddress" class="pt-address">{{ row.mailAddress }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="关键联系人" min-width="170">
            <template #default="{ row }">
              <div class="pt-contact">
                <b>{{ row.decisionMaker || '未填决策人' }}</b>
                <span>{{ row.decisionPhone || '—' }}</span>
              </div>
              <div class="pt-contact pt-contact--sub">
                <b>业务:{{ row.bizOwnerName || '未分配' }}</b>
                <span>{{ row.bizOwnerPhone || '' }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="协议价摘要" min-width="238">
            <template #default="{ row }">
              <div class="pt-price-chips">
                <span v-for="item in standardPriceCards(row)" :key="item.label" :class="['pt-price-chip', { 'is-missing': item.missing, 'is-low': item.low }]">
                  <em>{{ item.label }}</em>
                  <b>{{ item.text }}</b>
                </span>
              </div>
              <div v-if="priceRiskText(row)" class="pt-risk-text">{{ priceRiskText(row) }}</div>
            </template>
          </el-table-column>
          <el-table-column label="业务" width="96">
            <template #default="{ row }"><el-tag size="small" effect="plain">{{ bizLabel(row.bizType) }}</el-tag></template>
          </el-table-column>
          <el-table-column label="月均" width="118" align="right">
            <template #default="{ row }">
              <div class="pt-money">{{ row.monthlyAvg != null ? moneyValue(row.monthlyAvg) : '—' }}</div>
              <div class="pt-muted">{{ row.settleMethod || '未设结算' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="等级/状态" width="138">
            <template #default="{ row }">
              <div class="pt-status-stack">
                <el-tag size="small" :type="levelType(row.level)">{{ levelLabel(row.level) }}</el-tag>
                <el-tag v-if="row.needInvoice" size="small" type="success" effect="plain">需开票</el-tag>
                <el-tag size="small" :type="rowAction(row).type" effect="plain">{{ rowAction(row).label }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="备注摘要" min-width="260">
            <template #default="{ row }">
              <div class="pt-remark-text">{{ row.remark || '暂无备注' }}</div>
            </template>
          </el-table-column>
          <el-table-column label="动作" width="220" fixed="right">
            <template #default="{ row }">
              <div class="pt-row-actions">
                <el-button size="small" type="primary" plain @click="openPrices(row)"><el-icon><PriceTag /></el-icon>报价</el-button>
                <el-button size="small" plain @click="openHistory(row)"><el-icon><Calendar /></el-icon>历史</el-button>
                <el-button size="small" plain @click="openForm(row)">编辑</el-button>
                <el-button size="small" link type="danger" @click="remove(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="还没有长期合作客户" :image-size="80">
              <el-button type="primary" @click="openForm()">新增第一个客户</el-button>
            </el-empty>
          </template>
        </el-table>
      </div>

      <aside class="pt-side">
        <div class="pt-side-card">
          <div class="pt-side-head">
            <strong>优先处理</strong>
            <span>从当前列表自动判断</span>
          </div>
          <div v-if="attentionRows.length" class="pt-action-list">
            <button v-for="item in attentionRows" :key="item.row.id || item.row.companyName" type="button" class="pt-action-item" @click="openPrices(item.row)">
              <span>
                <b>{{ item.row.companyName }}</b>
                <em>{{ item.reason }}</em>
              </span>
              <el-tag size="small" :type="item.action.type">{{ item.action.label }}</el-tag>
            </button>
          </div>
          <el-empty v-else description="当前列表暂无明显风险" :image-size="58" />
        </div>
        <div class="pt-side-card">
          <div class="pt-side-head">
            <strong>标准化建议</strong>
            <span>减少内部扯皮</span>
          </div>
          <ul class="pt-check-list">
            <li>报价以协议价摘要为准,复杂地区价拆成独立价格项。</li>
            <li>客户默认邮寄方式和地址必须填,不要只写在备注。</li>
            <li>历史合作里按月补结算和开票凭证,财务不用再追问。</li>
          </ul>
        </div>
      </aside>
    </section>

    <div class="pt-pager">
      <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :total="total" :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper" @current-change="loadData" @size-change="reload" />
    </div>

    <!-- 新增/编辑客户 -->
    <el-dialog v-model="dialog.visible" :title="form.id ? '编辑客户' : '新增长期客户'" width="720px" destroy-on-close>
      <el-form :model="form" label-width="116px" class="pt-customer-form">
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="公司名称" required><el-input v-model="form.companyName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="决策人姓名"><el-input v-model="form.decisionMaker" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="决策人电话"><el-input v-model="form.decisionPhone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="业务负责人"><el-input v-model="form.bizOwnerName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="负责人电话"><el-input v-model="form.bizOwnerPhone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="结算方式"><el-select v-model="form.settleMethod" style="width: 100%" clearable><el-option v-for="s in settleOptions" :key="s" :label="s" :value="s" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="月度均价"><el-input-number v-model="form.monthlyAvg" :min="0" :precision="2" :controls="false" style="width: 100%" placeholder="¥/月" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="是否开票"><el-switch v-model="form.needInvoice" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col v-if="form.needInvoice === 1" :span="24"><el-form-item label="开票信息"><el-input v-model="form.invoiceInfo" type="textarea" :rows="2" placeholder="抬头 / 税号 / 开户行等" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="合作业务"><el-select v-model="form.bizType" style="width: 100%"><el-option v-for="b in bizOptions" :key="b.value" :label="b.label" :value="b.value" /></el-select></el-form-item></el-col>
          <el-col :span="12">
            <el-form-item label="合作等级">
              <el-select v-model="form.level" style="width: 100%"><el-option v-for="l in levelOptions" :key="l.value" :label="l.label" :value="l.value" /></el-select>
              <div class="pt-level-hint">建议等级:<b>{{ autoLevel.label }}</b><span v-if="form.monthlyAvg != null">(月均¥{{ fmtMoney(form.monthlyAvg) }})</span><span class="pt-muted">(仅参考)</span></div>
            </el-form-item>
          </el-col>
          <el-col :span="12"><el-form-item label="合作起始"><el-date-picker v-model="form.sinceDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="默认邮寄方式"><el-select v-model="form.mailMethod" style="width: 100%" clearable placeholder="选择"><el-option v-for="m in MAIL_METHODS" :key="m" :label="m" :value="m" /></el-select></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="默认邮寄地址"><el-input v-model="form.mailAddress" placeholder="该客户默认收件地址(邮寄时带出)" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 8 }" /></el-form-item>
      </el-form>

      <!-- 合作价格(协议价)行内编辑 -->
      <div class="pt-price-section">
        <div class="pt-price-bar">
          <div>
            <span class="pt-price-title">合作价格(协议价)</span>
            <span class="pt-muted">登记各项目的约定价格,保存客户时一并保存</span>
          </div>
          <div class="pt-price-ops">
            <el-checkbox v-model="changeSameAsNew" size="small">变更价 = 新设价</el-checkbox>
            <el-button type="primary" size="small" plain @click="addDialogPriceRow"><el-icon><Plus /></el-icon> 新增一行</el-button>
          </div>
        </div>
        <el-table :data="dialogPriceRows" v-loading="dialogPriceLoading" border size="small" empty-text="暂无协议价,点击「新增一行」添加">
          <el-table-column label="项目" min-width="130">
            <template #default="{ row }"><el-input v-model="row.itemName" size="small" placeholder="如:公章" /></template>
          </el-table-column>
          <el-table-column label="单价" width="130">
            <template #default="{ row }"><el-input-number v-model="row.price" :min="0" :precision="2" :controls="false" size="small" style="width: 100%" placeholder="¥" /></template>
          </el-table-column>
          <el-table-column label="单位" width="90">
            <template #default="{ row }"><el-input v-model="row.unit" size="small" placeholder="个" /></template>
          </el-table-column>
          <el-table-column label="备注" min-width="120">
            <template #default="{ row }"><el-input v-model="row.remark" size="small" /></template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button size="small" link type="danger" @click="removeDialogPriceRow($index)"><el-icon><Delete /></el-icon></el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="submit">保存</el-button>
      </template>
    </el-dialog>

    <!-- 协议价抽屉 -->
    <el-drawer v-model="priceDrawer.visible" :title="`协议价 · ${priceDrawer.partner?.companyName || ''}`" size="46%" destroy-on-close>
      <div class="pt-price-bar">
        <span class="pt-muted">为该客户登记各项目的约定价格</span>
        <el-button type="primary" size="small" @click="addPriceRow"><el-icon><Plus /></el-icon> 新增价格项</el-button>
      </div>
      <el-table :data="priceRows" v-loading="priceLoading" border size="small">
        <el-table-column label="项目" min-width="130">
          <template #default="{ row }">
            <el-input v-if="row._editing" v-model="row.itemName" size="small" placeholder="如:公章" />
            <span v-else>{{ row.itemName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="协议价" width="120">
          <template #default="{ row }">
            <el-input-number v-if="row._editing" v-model="row.price" :min="0" :precision="2" size="small" controls-position="right" style="width: 100%" />
            <span v-else>¥{{ fmtMoney(row.price) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="单位" width="80">
          <template #default="{ row }">
            <el-input v-if="row._editing" v-model="row.unit" size="small" />
            <span v-else>{{ row.unit }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" min-width="110">
          <template #default="{ row }">
            <el-input v-if="row._editing" v-model="row.remark" size="small" />
            <span v-else>{{ row.remark }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="118" fixed="right">
          <template #default="{ row, $index }">
            <template v-if="row._editing">
              <el-button size="small" type="primary" link @click="savePriceRow(row)">保存</el-button>
              <el-button size="small" link @click="cancelPriceRow(row, $index)">取消</el-button>
            </template>
            <template v-else>
              <el-button size="small" link type="primary" @click="row._editing = true">改</el-button>
              <el-button size="small" link type="danger" @click="removePriceRow(row, $index)">删</el-button>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <!-- 历史合作抽屉 -->
    <el-drawer v-model="historyDrawer.visible" :title="`历史合作 · ${historyDrawer.partner?.companyName || ''}`" size="52%" destroy-on-close>
      <div class="pt-price-bar">
        <span class="pt-muted">按月记录合作金额、结算与发票情况,结算凭证可放多张</span>
        <el-button type="primary" size="small" @click="openHistoryEdit()"><el-icon><Plus /></el-icon> 新增记录</el-button>
      </div>
      <el-table :data="historyRows" v-loading="historyLoading" border size="small" empty-text="暂无历史合作记录">
        <el-table-column label="月份" prop="coopMonth" width="88" />
        <el-table-column label="月度金额" width="110" align="right">
          <template #default="{ row }">¥{{ fmtMoney(row.amount) }}</template>
        </el-table-column>
        <el-table-column label="是否结算" width="86" align="center">
          <template #default="{ row }"><el-tag size="small" :type="row.settled ? 'success' : 'info'" effect="plain">{{ row.settled ? '已结' : '未结' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="发票" width="76" align="center">
          <template #default="{ row }"><el-tag size="small" :type="row.invoiceDone ? 'success' : 'info'" effect="plain">{{ row.invoiceDone ? '已开' : '未开' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="凭证" width="66" align="center">
          <template #default="{ row }"><span class="pt-muted">{{ voucherCount(row.vouchers) }}张</span></template>
        </el-table-column>
        <el-table-column label="备注" min-width="240">
          <template #default="{ row }"><span class="pt-remark-text pt-remark-text--small">{{ row.remark || '—' }}</span></template>
        </el-table-column>
        <el-table-column label="操作" width="92" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openHistoryEdit(row)">改</el-button>
            <el-button size="small" link type="danger" @click="removeHistoryRow(row)">删</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-drawer>

    <!-- 历史合作·新增/编辑 -->
    <el-dialog v-model="historyEdit.visible" :title="historyEdit.form.id ? '编辑合作记录' : '新增合作记录'" width="560px" destroy-on-close append-to-body>
      <el-form :model="historyEdit.form" label-width="90px">
        <el-form-item label="合作月份" required>
          <el-date-picker v-model="historyEdit.form.coopMonth" type="month" value-format="YYYY-MM" placeholder="选择月份" style="width: 100%" />
        </el-form-item>
        <el-form-item label="月度金额"><el-input-number v-model="historyEdit.form.amount" :min="0" :precision="2" :controls="false" style="width: 100%" placeholder="¥" /></el-form-item>
        <el-row :gutter="14">
          <el-col :span="12"><el-form-item label="是否结算"><el-switch v-model="historyEdit.form.settled" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="发票已开"><el-switch v-model="historyEdit.form.invoiceDone" :active-value="1" :inactive-value="0" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="结算凭证">
          <el-upload :show-file-list="false" :http-request="(o: any) => uploadVoucher(o)" accept="image/*,.pdf" multiple>
            <el-button size="small"><el-icon><Plus /></el-icon> 上传凭证(可多张)</el-button>
          </el-upload>
          <div v-if="voucherList.length" class="pt-vouchers">
            <div v-for="(v, i) in voucherList" :key="`${v.fileId}-${i}`" class="pt-file-chip">
              <button type="button" class="pt-file-name" @click="previewFile(v)">{{ v.fileName }}</button>
              <el-button size="small" link type="primary" @click="previewFile(v)"><el-icon><View /></el-icon>预览</el-button>
              <el-button size="small" link @click="downloadFile(v)"><el-icon><Download /></el-icon>下载</el-button>
              <el-button size="small" link type="danger" @click="removeVoucher(i)"><el-icon><Delete /></el-icon></el-button>
            </div>
          </div>
          <span class="pt-muted">对应李会计那边的结算凭证。</span>
        </el-form-item>
        <el-form-item label="开票凭证">
          <el-upload :show-file-list="false" :http-request="(o: any) => uploadInvoiceVoucher(o)" accept="image/*,.pdf" multiple>
            <el-button size="small"><el-icon><Plus /></el-icon> 上传开票凭证(可多张)</el-button>
          </el-upload>
          <div v-if="invoiceVoucherList.length" class="pt-vouchers">
            <div v-for="(v, i) in invoiceVoucherList" :key="`${v.fileId}-${i}`" class="pt-file-chip pt-file-chip--success">
              <button type="button" class="pt-file-name" @click="previewFile(v)">{{ v.fileName }}</button>
              <el-button size="small" link type="primary" @click="previewFile(v)"><el-icon><View /></el-icon>预览</el-button>
              <el-button size="small" link @click="downloadFile(v)"><el-icon><Download /></el-icon>下载</el-button>
              <el-button size="small" link type="danger" @click="removeInvoiceVoucher(i)"><el-icon><Delete /></el-icon></el-button>
            </div>
          </div>
          <span class="pt-muted">已开发票的凭证/发票图片,可多张。</span>
        </el-form-item>
        <el-form-item label="备注"><el-input v-model="historyEdit.form.remark" type="textarea" :autosize="{ minRows: 3, maxRows: 10 }" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="historyEdit.visible = false">取消</el-button>
        <el-button type="primary" :loading="historyEdit.saving" @click="saveHistory">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="filePreview.visible" :title="filePreview.title" width="72vw" destroy-on-close append-to-body @closed="clearPreview">
      <div class="pt-preview">
        <img v-if="filePreview.type === 'image'" :src="filePreview.url" alt="附件预览" class="pt-preview-img" />
        <iframe v-else-if="filePreview.type === 'pdf'" :src="filePreview.url" class="pt-preview-frame" title="附件预览"></iframe>
        <el-empty v-else description="这个格式不能在线预览，可下载后查看">
          <el-button type="primary" @click="filePreview.file && downloadFile(filePreview.file)"><el-icon><Download /></el-icon> 下载附件</el-button>
        </el-empty>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, PriceTag, Delete, Calendar, View, Download } from '@element-plus/icons-vue'
import { partnerApi, partnerPriceApi, type Partner, type PartnerPrice, type PartnerHistory } from '@/api/partner'
import { fileInfoApi } from '@/api/file'
import { createAttachmentPreview, downloadAttachment, type AttachmentPreview } from '@/utils/file-viewer'

const bizOptions = [
  { value: 'seal', label: '刻章' },
  { value: 'bill', label: '提单' },
  { value: 'gs', label: '工商' },
  { value: 'mixed', label: '综合' }
]
const levelOptions = [
  { value: 'normal', label: '普通' },
  { value: 'vip', label: '重要(VIP)' },
  { value: 'strategic', label: '战略' }
]
const settleOptions = ['月结', '现结', '季结', '预付']
const MAIL_METHODS = ['京东寄付', '顺丰到付', '闪送寄付', '顺丰寄付', '客户自取']

/** 根据月度均价自动分级:1000以内=普通 / 1000-2000=银牌 / 2000-3000=金牌 / 3000-5000=钻石 / 5000以上=战略 */
const levelByAmount = (amt?: number): { value: string; label: string } => {
  const n = Number(amt) || 0
  if (n >= 5000) return { value: 'strategic', label: '战略' }
  if (n >= 3000) return { value: 'strategic', label: '钻石' }
  if (n >= 2000) return { value: 'vip', label: '金牌' }
  if (n >= 1000) return { value: 'vip', label: '银牌' }
  return { value: 'normal', label: '普通' }
}

const rows = ref<Partner[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const levelFilter = ref<string>()
const bizFilter = ref<string>()

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await partnerApi.list({ pageNum: pageNum.value, pageSize: pageSize.value, keyword: keyword.value || undefined, level: levelFilter.value || undefined, bizType: bizFilter.value || undefined })
    const page = res?.data ?? res
    rows.value = page?.records || []
    total.value = Number(page?.total ?? rows.value.length)
  } catch { rows.value = []; total.value = 0 } finally { loading.value = false }
}
const reload = () => { pageNum.value = 1; loadData() }

const dialog = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<Partner>({})

/* ---------- 弹窗内·合作价格(协议价)行内编辑 ---------- */
const dialogPriceRows = ref<PartnerPrice[]>([])
const dialogPriceLoading = ref(false)
// "变更价=新设价":开启时自动让"变更"项单价跟随"新设"项(仅识别含'新设'不含'变更'、含'变更'不含'新设'的独立行)
const changeSameAsNew = ref(true)
watch([dialogPriceRows, changeSameAsNew], () => {
  if (!changeSameAsNew.value) return
  const n = dialogPriceRows.value.find((r) => (r.itemName || '').includes('新设') && !(r.itemName || '').includes('变更'))
  const c = dialogPriceRows.value.find((r) => (r.itemName || '').includes('变更') && !(r.itemName || '').includes('新设'))
  if (n && c && c.price !== n.price) c.price = n.price
}, { deep: true })
const addDialogPriceRow = () => {
  dialogPriceRows.value.push({ itemName: '', price: 0, unit: '个', remark: '' })
}
const removeDialogPriceRow = (index: number) => {
  dialogPriceRows.value.splice(index, 1)
}
const loadDialogPrices = async (partnerId: number | string) => {
  dialogPriceLoading.value = true
  try {
    const res: any = await partnerPriceApi.list(partnerId)
    dialogPriceRows.value = ((res?.data ?? res) || []).map((p: PartnerPrice) => ({ ...p }))
  } catch { dialogPriceRows.value = [] } finally { dialogPriceLoading.value = false }
}

const openForm = (row?: Partner) => {
  form.value = row
    ? { ...row }
    : { level: 'normal', bizType: 'seal', needInvoice: 0, decisionMaker: '', decisionPhone: '', bizOwnerName: '', bizOwnerPhone: '', settleMethod: '', invoiceInfo: '', monthlyAvg: undefined }
  dialog.value = { visible: true, saving: false }
  changeSameAsNew.value = true
  // 编辑已有客户时加载其协议价;新增客户时预置3个标准项(新设/变更/单章)
  if (row?.id) {
    dialogPriceRows.value = []
    loadDialogPrices(row.id)
  } else {
    dialogPriceRows.value = [
      { itemName: '新设:公财法', price: 0, unit: '套', remark: '' },
      { itemName: '变更:公财法', price: 0, unit: '套', remark: '' },
      { itemName: '单章', price: 0, unit: '个', remark: '' }
    ]
  }
}

/** 合作等级自动分级文案(随月度均价变化) */
const autoLevel = computed(() => levelByAmount(form.value.monthlyAvg))
/** 月度均价变动时,自动把表单等级设为对应区间 */
watch(() => form.value.monthlyAvg, (v) => {
  if (v == null) return
  form.value.level = levelByAmount(v).value
})
const submit = async () => {
  if (!form.value.companyName) { ElMessage.warning('请填写公司名称'); return }
  // 校验价格行:有项目名才算有效,单价不能为负
  const validPrices = dialogPriceRows.value.filter((p) => (p.itemName || '').trim())
  if (validPrices.some((p) => Number(p.price) < 0)) { ElMessage.warning('协议价不能为负'); return }
  dialog.value.saving = true
  try {
    // 1) 先存客户拿到 id(新增返回新ID,编辑用原ID)
    let partnerId: number | string | undefined = form.value.id
    if (form.value.id) {
      await partnerApi.update(form.value)
    } else {
      const res: any = await partnerApi.create(form.value)
      partnerId = res?.data ?? res
    }
    // 2) 再批量保存协议价(先删旧价再批量插入)
    if (partnerId != null && partnerId !== '') {
      await partnerPriceApi.batchSave(partnerId, validPrices)
    }
    ElMessage.success('已保存'); dialog.value.visible = false; loadData()
  } catch { ElMessage.error('保存失败') } finally { dialog.value.saving = false }
}
const remove = async (row: Partner) => {
  try { await ElMessageBox.confirm(`删除客户「${row.companyName}」及其协议价?`, '删除', { type: 'warning' }) } catch { return }
  try { await partnerApi.remove(row.id!); ElMessage.success('已删除'); loadData() } catch { ElMessage.error('删除失败') }
}

/* ---------- 协议价抽屉 ---------- */
interface PriceRow extends PartnerPrice { _editing?: boolean }
const priceDrawer = ref<{ visible: boolean; partner?: Partner }>({ visible: false })
const priceRows = ref<PriceRow[]>([])
const priceLoading = ref(false)
const openPrices = async (row: Partner) => {
  priceDrawer.value = { visible: true, partner: row }
  loadPrices(row.id!)
}
const loadPrices = async (partnerId: number | string) => {
  priceLoading.value = true
  try {
    const res: any = await partnerApi.prices(partnerId)
    priceRows.value = ((res?.data ?? res) || []).map((p: PartnerPrice) => ({ ...p, _editing: false }))
  } catch { priceRows.value = [] } finally { priceLoading.value = false }
}
const addPriceRow = () => {
  priceRows.value.unshift({ partnerId: priceDrawer.value.partner?.id, itemName: '', price: 0, unit: '个', _editing: true })
}
const savePriceRow = async (row: PriceRow) => {
  if (!row.itemName) { ElMessage.warning('请填写项目名'); return }
  try {
    if (row.id) await partnerApi.updatePrice(row)
    else await partnerApi.addPrice({ ...row, partnerId: priceDrawer.value.partner?.id })
    ElMessage.success('已保存'); loadPrices(priceDrawer.value.partner!.id!)
  } catch { ElMessage.error('保存失败') }
}
const cancelPriceRow = (row: PriceRow, index: number) => {
  if (row.id) row._editing = false
  else priceRows.value.splice(index, 1)
}
const removePriceRow = async (row: PriceRow, index: number) => {
  if (!row.id) { priceRows.value.splice(index, 1); return }
  try { await ElMessageBox.confirm(`删除「${row.itemName}」这条价格?`, '删除', { type: 'warning' }) } catch { return }
  try { await partnerApi.removePrice(row.id); ElMessage.success('已删除'); loadPrices(priceDrawer.value.partner!.id!) } catch { ElMessage.error('删除失败') }
}

const bizLabel = (v?: string) => bizOptions.find((o) => o.value === v)?.label || '—'
const levelLabel = (v?: string) => levelOptions.find((o) => o.value === v)?.label || '普通'
const levelType = (v?: string) => (({ normal: 'info', vip: 'warning', strategic: 'danger' } as any)[v || ''] || 'info')
const fmtMoney = (n?: number) => (n == null ? '0.00' : Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
const moneyValue = (n?: number) => {
  const value = Number(n) || 0
  if (value >= 10000) {
    const text = (value / 10000).toFixed(value >= 100000 ? 1 : 2).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')
    return `¥${text}万`
  }
  return `¥${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}
const findPriceItem = (row: Partner, key: string) => (row.prices || []).find((p) => (p.itemName || '').includes(key))
// 列表"标准价"取协议价里含关键字的第一条(兼容"新设/变更:公财法"这种合并写法)
const stdPrice = (row: Partner, key: string): number | null => {
  const hit = findPriceItem(row, key)
  return hit && hit.price != null ? Number(hit.price) : null
}

const PRICE_BASELINES = [
  { key: '新设', floor: 45 },
  { key: '变更', floor: 45 },
  { key: '单章', floor: 20 }
]
const standardPriceCards = (row: Partner) => PRICE_BASELINES.map((item) => {
  const priceRow = findPriceItem(row, item.key)
  const price = priceRow?.price == null ? null : Number(priceRow.price)
  return {
    label: item.key,
    text: price == null ? '未设' : `${moneyValue(price)}${priceRow?.unit ? `/${priceRow.unit}` : ''}`,
    missing: price == null,
    low: price != null && price < item.floor
  }
})
const priceRiskMessages = (row: Partner) => {
  const messages: string[] = []
  standardPriceCards(row).forEach((item) => {
    if (item.missing) messages.push(`缺${item.label}价`)
    if (item.low) messages.push(`${item.label}低于底线`)
  })
  return messages
}
const priceRiskText = (row: Partner) => priceRiskMessages(row).slice(0, 2).join('、')
const rowAction = (row: Partner) => {
  const remark = row.remark || ''
  const risks = priceRiskMessages(row)
  if (/未结|逾期|催|缺凭证|待确认/.test(remark)) return { label: '催结算', type: 'danger', score: 95 }
  if (risks.some((r) => r.includes('低于'))) return { label: '调价复核', type: 'danger', score: 85 }
  if (risks.length) return { label: '补价格项', type: 'warning', score: 75 }
  if (row.level === 'strategic' || Number(row.monthlyAvg || 0) >= 5000) return { label: '重点维护', type: 'primary', score: 62 }
  return { label: '正常维护', type: 'success', score: 20 }
}
const partnerRowClass = ({ row }: { row: Partner }) => rowAction(row).score >= 75 ? 'pt-risk-row' : ''
const attentionReason = (row: Partner) => {
  const risk = priceRiskText(row)
  if (risk) return risk
  if (/未结|逾期|催|缺凭证|待确认/.test(row.remark || '')) return '备注里有结算/凭证待处理'
  if (Number(row.monthlyAvg || 0) >= 5000) return `月均 ${moneyValue(row.monthlyAvg)}`
  return '建议保持月度维护'
}
const attentionRows = computed(() => rows.value
  .map((row) => ({ row, action: rowAction(row), reason: attentionReason(row) }))
  .filter((item) => item.action.score >= 60)
  .sort((a, b) => b.action.score - a.action.score || Number(b.row.monthlyAvg || 0) - Number(a.row.monthlyAvg || 0))
  .slice(0, 5))
const statCards = computed(() => {
  const monthlyTotal = rows.value.reduce((sum, row) => sum + Number(row.monthlyAvg || 0), 0)
  const vipCount = rows.value.filter((row) => row.level === 'vip' || row.level === 'strategic').length
  const priceReviewCount = rows.value.filter((row) => priceRiskMessages(row).length).length
  const actionCount = attentionRows.value.length
  return [
    { label: '合作客户', value: `${total.value || rows.value.length}`, note: `当前页 ${rows.value.length} 家`, tone: 'blue' },
    { label: '当前页月均合计', value: moneyValue(monthlyTotal), note: '用于快速估算维护价值', tone: 'green' },
    { label: '战略/VIP', value: `${vipCount}`, note: '建议老板或负责人月度维护', tone: 'amber' },
    { label: '价格需复核', value: `${priceReviewCount}`, note: '缺价格项或低于底线', tone: 'red' },
    { label: '优先动作', value: `${actionCount}`, note: '右侧列出处理清单', tone: 'purple' }
  ]
})

/* ---------- 历史合作记录 ---------- */
const historyDrawer = ref<{ visible: boolean; partner?: Partner }>({ visible: false })
const historyRows = ref<PartnerHistory[]>([])
const historyLoading = ref(false)
const openHistory = (row: Partner) => { historyDrawer.value = { visible: true, partner: row }; loadHistory(row.id!) }
const loadHistory = async (pid: number | string) => {
  historyLoading.value = true
  try { const res: any = await partnerApi.history(pid); historyRows.value = (res?.data ?? res) || [] }
  catch { historyRows.value = [] } finally { historyLoading.value = false }
}
// vouchers 字段兼容两种形态:
//  - 旧数据:扁平数组 [{fileId,fileName}] → 全部视为「结算凭证」
//  - 新数据:对象 {settle:[...], invoice:[...]} → 结算凭证 + 开票凭证分开存
// 这样不改表结构就能加「开票凭证」;老记录自动兼容,不丢数据。
type Voucher = { fileId: string; fileName: string }
const filePreview = ref<{ visible: boolean; title: string; url: string; type: AttachmentPreview['type']; file?: Voucher }>({
  visible: false,
  title: '',
  url: '',
  type: 'other'
})
const clearPreview = () => {
  if (filePreview.value.url) URL.revokeObjectURL(filePreview.value.url)
  filePreview.value = { visible: false, title: '', url: '', type: 'other' }
}
const previewFile = async (file: Voucher) => {
  try {
    clearPreview()
    const preview = await createAttachmentPreview(file)
    if (!preview) return
    filePreview.value = { visible: true, title: preview.title, url: preview.url, type: preview.type, file }
  } catch { ElMessage.error('预览失败') }
}
const downloadFile = async (file: Voucher) => {
  try { await downloadAttachment(file) }
  catch { ElMessage.error('下载失败') }
}
const parseVouchers = (v?: string): { settle: Voucher[]; invoice: Voucher[] } => {
  try {
    const parsed = JSON.parse(v || '[]')
    if (Array.isArray(parsed)) return { settle: parsed || [], invoice: [] }
    if (parsed && typeof parsed === 'object') {
      return { settle: Array.isArray(parsed.settle) ? parsed.settle : [], invoice: Array.isArray(parsed.invoice) ? parsed.invoice : [] }
    }
  } catch { /* 解析失败按空处理 */ }
  return { settle: [], invoice: [] }
}
// 列表「凭证」列:结算凭证 + 开票凭证张数合计
const voucherCount = (v?: string) => { const p = parseVouchers(v); return p.settle.length + p.invoice.length }

const historyEdit = ref<{ visible: boolean; saving: boolean; form: PartnerHistory }>({ visible: false, saving: false, form: {} })
const voucherList = ref<Voucher[]>([])
const invoiceVoucherList = ref<Voucher[]>([])
const openHistoryEdit = (row?: PartnerHistory) => {
  historyEdit.value = { visible: true, saving: false, form: row ? { ...row } : { partnerId: historyDrawer.value.partner?.id, settled: 0, invoiceDone: 0, amount: undefined } }
  const p = parseVouchers(row?.vouchers)
  voucherList.value = p.settle
  invoiceVoucherList.value = p.invoice
}
const uploadVoucher = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    voucherList.value.push({ fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name })
    ElMessage.success('凭证已上传')
  } catch { ElMessage.error('上传失败') }
}
const removeVoucher = (i: number) => voucherList.value.splice(i, 1)
const uploadInvoiceVoucher = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    invoiceVoucherList.value.push({ fileId: data?.id != null ? String(data.id) : '', fileName: data?.originalName || data?.fileName || options.file.name })
    ElMessage.success('开票凭证已上传')
  } catch { ElMessage.error('上传失败') }
}
const removeInvoiceVoucher = (i: number) => invoiceVoucherList.value.splice(i, 1)
const saveHistory = async () => {
  if (!historyEdit.value.form.coopMonth) { ElMessage.warning('请选择合作月份'); return }
  historyEdit.value.saving = true
  try {
    const payload: PartnerHistory = { ...historyEdit.value.form, vouchers: JSON.stringify({ settle: voucherList.value, invoice: invoiceVoucherList.value }) }
    if (payload.id) await partnerApi.updateHistory(payload)
    else await partnerApi.addHistory(payload)
    ElMessage.success('已保存'); historyEdit.value.visible = false; loadHistory(historyDrawer.value.partner!.id!)
  } catch { ElMessage.error('保存失败') } finally { historyEdit.value.saving = false }
}
const removeHistoryRow = async (row: PartnerHistory) => {
  try { await ElMessageBox.confirm(`删除 ${row.coopMonth || ''} 的合作记录?`, '删除', { type: 'warning' }) } catch { return }
  try { await partnerApi.removeHistory(row.id!); ElMessage.success('已删除'); loadHistory(historyDrawer.value.partner!.id!) } catch { ElMessage.error('删除失败') }
}

onMounted(loadData)
</script>

<style scoped>
.partner { padding: 16px 18px; background: #f5f7fb; min-height: 100%; }
.pt-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-wrap: wrap; margin-bottom: 14px; }
.pt-title { margin: 0; font-size: 22px; font-weight: 700; color: #111827; }
.pt-sub { margin: 6px 0 0; font-size: 13px; color: #64748b; }
.pt-actions { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
.pt-search { width: 250px; }
.pt-filter { width: 120px; }
.pt-muted { color: #64748b; font-size: 12px; }
.pt-pager { display: flex; justify-content: flex-end; margin-top: 14px; }
.pt-metrics { display: grid; grid-template-columns: repeat(5, minmax(150px, 1fr)); gap: 12px; margin-bottom: 12px; }
.pt-metric { min-height: 94px; padding: 14px; border: 1px solid #dbe3ef; border-radius: 8px; background: #fff; }
.pt-metric-label { color: #64748b; font-size: 12px; }
.pt-metric-value { margin-top: 8px; color: #111827; font-size: 26px; line-height: 1; font-weight: 760; }
.pt-metric-note { margin-top: 9px; color: #64748b; font-size: 12px; }
.pt-metric--blue { border-color: #c7d7fe; }
.pt-metric--green { border-color: #b7e4cf; }
.pt-metric--amber { border-color: #f8d8a8; }
.pt-metric--red { border-color: #fecaca; }
.pt-metric--purple { border-color: #ddd6fe; }
.pt-rule-strip { display: flex; align-items: center; justify-content: space-between; gap: 14px; margin-bottom: 14px; padding: 11px 14px; border: 1px solid #bfdbfe; border-radius: 8px; background: #eff6ff; color: #1e3a8a; }
.pt-rule-strip div { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.pt-rule-strip strong { font-size: 13px; }
.pt-rule-strip span, .pt-rule-strip p { margin: 0; font-size: 12px; }
.pt-workbench { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 14px; align-items: start; }
.pt-table-card, .pt-side-card { border: 1px solid #dbe3ef; border-radius: 8px; background: #fff; overflow: hidden; }
.pt-card-head, .pt-side-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 13px 14px; border-bottom: 1px solid #e5eaf2; background: #fbfcff; }
.pt-card-head strong, .pt-side-head strong { color: #111827; font-size: 15px; }
.pt-card-head span, .pt-side-head span, .pt-head-tip { color: #64748b; font-size: 12px; }
.pt-table { width: 100%; }
.pt-table :deep(.el-table__cell) { vertical-align: top; }
.pt-table :deep(.pt-risk-row td) { background: #fffaf0 !important; }
.pt-company strong { display: block; color: #111827; font-size: 14px; line-height: 1.35; }
.pt-meta-line { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 7px; color: #64748b; font-size: 12px; }
.pt-address { margin-top: 5px; color: #64748b; font-size: 12px; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.pt-contact { display: flex; flex-direction: column; gap: 3px; color: #111827; font-size: 13px; }
.pt-contact span { color: #64748b; font-size: 12px; }
.pt-contact--sub { margin-top: 8px; }
.pt-price-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.pt-price-chip { min-width: 62px; padding: 6px 8px; border: 1px solid #c7d7fe; border-radius: 7px; background: #f8fbff; color: #1d4ed8; }
.pt-price-chip em { display: block; font-style: normal; font-size: 11px; line-height: 1.1; }
.pt-price-chip b { display: block; margin-top: 4px; color: #111827; font-size: 12px; line-height: 1.1; }
.pt-price-chip.is-missing { border-color: #fed7aa; background: #fff7ed; color: #b45309; }
.pt-price-chip.is-low { border-color: #fecaca; background: #fef2f2; color: #dc2626; }
.pt-risk-text { margin-top: 7px; color: #dc2626; font-size: 12px; line-height: 1.4; }
.pt-money { color: #111827; font-size: 15px; font-weight: 700; }
.pt-status-stack { display: flex; align-items: flex-start; gap: 6px; flex-wrap: wrap; }
.pt-remark-text { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; white-space: pre-wrap; word-break: break-word; line-height: 1.55; color: #111827; }
.pt-remark-text--small { font-size: 12px; -webkit-line-clamp: 2; }
.pt-row-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.pt-side { display: flex; flex-direction: column; gap: 14px; }
.pt-action-list { padding: 8px; }
.pt-action-item { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px; border: 0; border-bottom: 1px solid #edf1f7; background: #fff; text-align: left; cursor: pointer; }
.pt-action-item:last-child { border-bottom: 0; }
.pt-action-item:hover { background: #f8fbff; }
.pt-action-item b { display: block; color: #111827; font-size: 13px; line-height: 1.35; }
.pt-action-item em { display: block; margin-top: 4px; color: #64748b; font-size: 12px; font-style: normal; line-height: 1.35; }
.pt-check-list { margin: 0; padding: 10px 18px 14px 28px; color: #334155; font-size: 13px; line-height: 1.8; }
.pt-customer-form :deep(.el-form-item__label) { white-space: nowrap; }
.pt-price-ops { display: flex; align-items: center; gap: 12px; }
.pt-vouchers { display: flex; gap: 8px; flex-wrap: wrap; margin: 8px 0; }
.pt-file-chip { display: inline-flex; align-items: center; gap: 4px; max-width: 100%; padding: 2px 6px; border: 1px solid var(--el-border-color); border-radius: 6px; background: var(--el-fill-color-lighter); }
.pt-file-chip--success { border-color: var(--el-color-success-light-5); background: var(--el-color-success-light-9); }
.pt-file-name { max-width: 180px; border: 0; padding: 0 2px; background: transparent; color: var(--el-color-primary); font-size: 12px; line-height: 22px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; cursor: pointer; }
.pt-preview { min-height: 320px; display: flex; align-items: center; justify-content: center; }
.pt-preview-img { max-width: 100%; max-height: 72vh; object-fit: contain; }
.pt-preview-frame { width: 100%; height: 72vh; border: 1px solid var(--el-border-color); border-radius: 6px; }
.pt-price-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.pt-price-section { margin-top: 8px; padding-top: 12px; border-top: 1px dashed var(--el-border-color); }
.pt-price-section .pt-price-bar { margin-bottom: 10px; }
.pt-price-title { font-size: 14px; font-weight: 600; color: #111827; margin-right: 8px; }
.pt-level-hint { width: 100%; margin-top: 2px; font-size: 12px; line-height: 1.4; color: #64748b; }
.pt-level-hint b { color: var(--el-color-primary); }
.pt-level-hint span { margin-left: 4px; }
@media (max-width: 1280px) {
  .pt-metrics { grid-template-columns: repeat(3, minmax(150px, 1fr)); }
  .pt-workbench { grid-template-columns: 1fr; }
  .pt-side { grid-template-columns: repeat(2, minmax(0, 1fr)); display: grid; }
}
@media (max-width: 760px) {
  .partner { padding: 12px; }
  .pt-actions, .pt-search, .pt-filter { width: 100%; }
  .pt-metrics { grid-template-columns: 1fr; }
  .pt-rule-strip { align-items: flex-start; flex-direction: column; }
  .pt-side { display: flex; }
}
</style>

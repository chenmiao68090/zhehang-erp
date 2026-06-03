<template>
  <div class="order-bill">
    <!-- 顶部标识区 -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">ORDER OPS</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
        <span class="meta-divider"></span>
        <span class="meta-time">提单审批台</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">提单系统</span>
          <span class="title-en">Submission Workflow</span>
        </h1>
        <p class="page-desc">客户成交提单、审批、财务确认与合同生成联动</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" class="primary-btn" @click="openCreateDialog">
          新建订单
        </el-button>
        <el-button :icon="Refresh" plain class="ghost-btn" @click="loadAll(true)">
          刷新
        </el-button>
      </div>
    </header>

    <!-- 统计卡片行 -->
    <section class="stat-row">
      <div
        class="stat-card"
        v-for="(s, idx) in statCards"
        :key="s.key"
        :class="[s.theme, { active: activeTab === s.key }]"
        @click="changeTab(s.key)"
      >
        <div class="stat-index">0{{ idx + 1 }}</div>
        <div class="stat-icon">
          <el-icon :size="18"><component :is="s.icon" /></el-icon>
        </div>
        <div class="stat-num">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
        <div class="stat-bar"></div>
      </div>
    </section>

    <!-- 状态 Tab 切换 -->
    <section class="tab-strip">
      <el-tabs v-model="activeTab" class="status-tabs" @tab-change="applyFilters">
        <el-tab-pane v-for="t in statusTabs" :key="t.key" :name="t.key">
          <template #label>
            <span class="tab-label">
              <span>{{ t.label }}</span>
              <span class="tab-badge">{{ tabCount(t.key) }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>
      <div class="tab-search">
        <el-input
          v-model="searchForm.orderNo"
          placeholder="订单编号 / 客户 / 提单人"
          clearable
          :prefix-icon="Search"
          style="width: 280px"
          @input="applyFilters"
          @clear="applyFilters"
        />
        <el-date-picker
          v-model="searchForm.dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          style="width: 240px; margin-left: 12px"
          @change="applyFilters"
        />
      </div>
    </section>

    <!-- 列表区 -->
    <section class="table-wrap">
      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        border
        height="560"
        class="order-table"
        :row-class-name="rowClassName"
      >
        <el-table-column label="订单编号" prop="orderNo" width="170" fixed="left">
          <template #default="{ row }">
            <span class="order-no">{{ row.orderNo }}</span>
          </template>
        </el-table-column>
        <el-table-column label="客户名称" prop="customerName" min-width="200">
          <template #default="{ row }">
            <div class="cell-customer">
              <span class="customer-name">{{ row.customerName }}</span>
              <span class="customer-id">ID · {{ row.customerId }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="服务类型" min-width="220">
          <template #default="{ row }">
            <div class="service-summary">
              <el-tag
                v-for="(it, i) in row.items.slice(0, 2)"
                :key="i"
                size="small"
                effect="plain"
                class="service-tag"
              >
                {{ serviceTypeLabel(it.serviceType) }}
              </el-tag>
              <span v-if="row.items.length > 2" class="more-count">+{{ row.items.length - 2 }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="折后金额" prop="finalAmount" width="140" align="right">
          <template #default="{ row }">
            <div class="amount-cell">
              <span class="amount-value">¥{{ formatAmount(row.finalAmount) }}</span>
              <span class="amount-origin" v-if="row.totalAmount !== row.finalAmount">
                原价 ¥{{ formatAmount(row.totalAmount) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="130" align="center">
          <template #default="{ row }">
            <div class="status-stack">
              <el-tag :type="statusType(row.status)" effect="dark" class="status-tag">
                {{ statusLabel(row.status) }}
              </el-tag>
              <el-tag
                v-if="isOverdueRow(row)"
                type="danger"
                effect="plain"
                size="small"
                class="overdue-chip"
              >
                <el-icon><Warning /></el-icon>
                <span class="chip-text">审批超期</span>
              </el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="审批级别" width="150" align="center">
          <template #default="{ row }">
            <div class="level-cell">
              <el-tag
                :type="levelTagType(approvalLevelOf(row))"
                effect="plain"
                size="small"
                class="level-tag"
              >
                {{ approvalLevelText(row) }}
              </el-tag>
              <span class="level-chain">{{ approvalChainText(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="审批截止" width="170" align="center">
          <template #default="{ row }">
            <div
              v-if="row.status === 'pending_approval' || row.status === 'pending_finance' || row.status === 'pending_boss'"
              class="deadline-cell"
              :class="{ 'is-overdue': isOverdueRow(row) }"
            >
              <span class="deadline-time">{{ row.approvalDeadline ? row.approvalDeadline.slice(5, 16) : '—' }}</span>
              <span class="deadline-remain">{{ deadlineRemain(row) }}</span>
            </div>
            <span v-else class="deadline-muted">—</span>
          </template>
        </el-table-column>
        <el-table-column label="提单人" prop="submitterName" width="110" align="center" />
        <el-table-column label="提交时间" prop="submitTime" width="170" />
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button link type="primary" size="small" @click="openDetail(row)">详情</el-button>
              <el-button
                v-if="row.status === 'draft' || row.status === 'rejected'"
                link
                type="success"
                size="small"
                @click="openEditDialog(row)"
              >编辑</el-button>
              <el-button
                v-if="row.status === 'draft' || row.status === 'rejected'"
                link
                type="warning"
                size="small"
                @click="handleSubmit(row)"
              >提交审批</el-button>
              <el-button
                v-if="row.status === 'pending_approval'"
                v-hasRole="['admin','boss','manager','finance']"
                link
                type="primary"
                size="small"
                @click="openApprove(row)"
              >审批</el-button>
              <el-button
                v-if="row.status === 'pending_finance'"
                v-hasRole="['admin','boss','manager','finance']"
                link
                type="primary"
                size="small"
                @click="openFinance(row)"
              >财务确认</el-button>
              <el-button
                v-if="row.status === 'pending_boss'"
                v-hasRole="['admin','boss','manager','finance']"
                link
                type="danger"
                size="small"
                @click="openBoss(row)"
              >老板终审</el-button>
              <el-button
                v-if="canCancel(row.status)"
                v-hasRole="['admin','manager']"
                link
                type="danger"
                size="small"
                @click="handleCancel(row)"
              >取消</el-button>
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="暂无订单，点击新建订单开始" />
        </template>
      </el-table>
      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :page-sizes="[10, 20, 50]"
          :total="page.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @size-change="loadList"
          @current-change="loadList"
        />
      </div>
    </section>

    <!-- 新建/编辑 订单 Dialog -->
    <el-dialog
      v-model="formVisible"
      :title="formMode === 'create' ? '新建订单' : '编辑订单 · ' + form.orderNo"
      width="1100px"
      top="6vh"
      class="order-dialog"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="form-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>提单时效要求：上午 12:00 前提交需当天审批完毕；客户确认截图为必要凭证</span>
      </div>

      <!-- 客户信息区 -->
      <div class="form-section">
        <div class="section-head">
          <span class="section-bar"></span>
          <span class="section-title">客户信息</span>
          <span class="section-en">CUSTOMER</span>
        </div>
        <el-form :model="form" label-width="100px" size="default">
          <el-row :gutter="18">
            <el-col :span="8">
              <el-form-item label="选择客户" required>
                <el-select
                  v-model="form.customerId"
                  filterable
                  placeholder="搜索客户名称"
                  style="width: 100%"
                  @change="onCustomerChange"
                >
                  <el-option
                    v-for="c in customerOptions"
                    :key="c.id"
                    :label="c.name"
                    :value="c.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="客户名称">
                <el-input v-model="form.customerName" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系人">
                <el-input v-model="form._contact" disabled placeholder="选择客户后自动带出" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="联系电话">
                <el-input v-model="form._phone" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="提单人">
                <el-input v-model="form.submitterName" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="预计签约">
                <el-date-picker
                  v-model="form.expectedSignDate"
                  type="date"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- 服务子项区 -->
      <div class="form-section">
        <div class="section-head">
          <span class="section-bar"></span>
          <span class="section-title">服务子项</span>
          <span class="section-en">ITEMS</span>
          <el-button
            type="primary"
            link
            :icon="CirclePlus"
            class="section-action"
            @click="addItem"
          >添加子项</el-button>
        </div>
        <el-table :data="form.items" border size="small" class="items-table" show-summary :summary-method="itemsSummary">
          <el-table-column label="#" type="index" width="50" align="center" />
          <el-table-column label="服务类型" min-width="140">
            <template #default="{ row }">
              <el-select v-model="row.serviceType" size="small" style="width: 100%">
                <el-option
                  v-for="opt in serviceTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="服务周期" min-width="120">
            <template #default="{ row }">
              <el-select v-model="row.servicePeriod" size="small" style="width: 100%">
                <el-option
                  v-for="opt in servicePeriodOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="开始日期" width="150">
            <template #default="{ row }">
              <el-date-picker
                v-model="row.startDate"
                type="date"
                size="small"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="金额" width="130">
            <template #default="{ row }">
              <el-input-number
                v-model="row.amount"
                :min="0"
                :step="100"
                size="small"
                :controls="false"
                style="width: 100%"
                @change="recalcItem(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="折扣%" width="100">
            <template #default="{ row }">
              <el-input-number
                v-model="row.discountRate"
                :min="0"
                :max="100"
                :step="5"
                size="small"
                :controls="false"
                style="width: 100%"
                @change="recalcItem(row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="折后金额" width="120">
            <template #default="{ row }">
              <span class="cell-final">¥{{ formatAmount(row.finalAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="子项状态" width="130">
            <template #default="{ row }">
              <el-select v-model="row.itemStatus" size="small" style="width: 100%">
                <el-option
                  v-for="opt in itemStatusOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="描述" min-width="160">
            <template #default="{ row }">
              <el-input v-model="row.description" size="small" placeholder="服务说明" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="{ $index }">
              <el-button link type="danger" size="small" @click="removeItem($index)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="items-summary-bar">
          <span class="sum-chip">子项合计 · <b>{{ form.items.length }}</b> 项</span>
          <span class="sum-chip">子项原价·<b>¥{{ formatAmount(itemsOriginal) }}</b></span>
          <span class="sum-chip emph">子项折后·<b>¥{{ formatAmount(totalAmount) }}</b></span>
          <span class="sum-chip emph">整单折扣 {{ form.discountRate }}%·<b>¥{{ formatAmount(finalAmount) }}</b></span>
          <span class="sum-chip" v-if="form.items.length">
            预期审批 ·
            <el-tag
              :type="levelTagType(calcApprovalLevel(finalAmount))"
              size="small"
              effect="plain"
              class="level-tag"
            >
              {{ approvalLevelLabel(calcApprovalLevel(finalAmount)) }}
            </el-tag>
          </span>
        </div>
      </div>

      <!-- 金额汇总 + 提成信息 -->
      <div class="form-section split-section">
        <div class="split-col">
          <div class="section-head">
            <span class="section-bar"></span>
            <span class="section-title">金额汇总</span>
            <span class="section-en">AMOUNT</span>
          </div>
          <el-form :model="form" label-width="100px" size="default">
            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="总金额">
                  <el-input :model-value="formatAmount(totalAmount)" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="整单折扣">
                  <el-input-number
                    v-model="form.discountRate"
                    :min="0"
                    :max="100"
                    :step="5"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="折后金额">
                  <el-input :model-value="formatAmount(finalAmount)" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="已收定金">
                  <el-input-number
                    v-model="form.depositAmount"
                    :min="0"
                    :step="500"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="待收金额">
                  <el-input :model-value="formatAmount(pendingAmount)" disabled>
                    <template #prepend>¥</template>
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="付款方式">
                  <el-select v-model="form.paymentMethod" style="width: 100%">
                    <el-option
                      v-for="opt in paymentMethodOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </div>
        <div class="split-col">
          <div class="section-head">
            <span class="section-bar"></span>
            <span class="section-title">提成信息</span>
            <span class="section-en">COMMISSION</span>
          </div>
          <el-form :model="form" label-width="100px" size="default">
            <el-form-item label="提成比例">
              <el-input-number
                v-model="form.commissionRate"
                :min="0"
                :max="50"
                :step="1"
                style="width: 100%"
              >
                <template #suffix>%</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="参考提成">
              <el-input :model-value="formatAmount(commissionAmount)" disabled>
                <template #prepend>¥</template>
                <template #append>预估</template>
              </el-input>
            </el-form-item>
            <el-form-item label="付款时效">
              <el-input v-model="form.paymentTimeReq" placeholder="如：签约后3日内支付定金" />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 客户确认区 -->
      <div class="form-section">
        <div class="section-head">
          <span class="section-bar"></span>
          <span class="section-title">客户确认</span>
          <span class="section-en">CONFIRMATION</span>
        </div>
        <el-form :model="form" label-width="100px" size="default">
          <el-row :gutter="18">
            <el-col :span="8">
              <el-form-item label="确认方式">
                <el-select v-model="form.confirmMethod" style="width: 100%">
                  <el-option
                    v-for="opt in confirmMethodOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="确认截图">
                <div class="upload-placeholder">
                  <el-icon :size="22"><UploadFilled /></el-icon>
                  <span>点击或拖拽上传客户确认截图</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="特殊约定">
                <el-input
                  v-model="form.specialAgreement"
                  type="textarea"
                  :rows="3"
                  placeholder="如客户特殊要求、补充协议、补充说明等"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formVisible = false">取消</el-button>
          <el-button type="info" :icon="Document" @click="handleSave('draft')">保存草稿</el-button>
          <el-button type="primary" :icon="Promotion" @click="handleSave('submit')">
            保存并提交审批
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 审批 Dialog -->
    <el-dialog
      v-model="approveVisible"
      :title="approveDialogTitle"
      width="680px"
      class="approve-dialog"
    >
      <div v-if="approveTarget" class="approve-summary">
        <div class="summary-row">
          <span class="lab">客户</span>
          <span class="val">{{ approveTarget.customerName }}</span>
          <span class="lab">提单人</span>
          <span class="val">{{ approveTarget.submitterName }}</span>
        </div>
        <div class="summary-row">
          <span class="lab">折后金额</span>
          <span class="val price">¥{{ formatAmount(approveTarget.finalAmount) }}</span>
          <span class="lab">折扣率</span>
          <span class="val">{{ approveTarget.discountRate }}%</span>
        </div>
        <div class="summary-row">
          <span class="lab">审批级别</span>
          <span class="val">
            <el-tag :type="levelTagType(approvalLevelOf(approveTarget))" effect="plain" size="small">
              {{ approvalLevelText(approveTarget) }}
            </el-tag>
            <span class="chain-inline">{{ approvalChainText(approveTarget) }}</span>
          </span>
          <span class="lab">审批截止</span>
          <span class="val" :class="{ 'val-overdue': isOverdueRow(approveTarget) }">
            {{ approveTarget.approvalDeadline || '—' }} · {{ deadlineRemain(approveTarget) }}
          </span>
        </div>
        <div class="summary-row">
          <span class="lab">服务子项</span>
          <span class="val">
            <el-tag
              v-for="(it, i) in approveTarget.items"
              :key="i"
              size="small"
              effect="plain"
              class="summary-tag"
            >
              {{ serviceTypeLabel(it.serviceType) }} · ¥{{ formatAmount(it.finalAmount) }}
            </el-tag>
          </span>
        </div>
      </div>
      <div class="approve-tip">
        <el-icon><Clock /></el-icon>
        <span>审批时效：{{ approveTarget ? deadlineHint(approveTarget) || '上午提交当天完·下午提交次日 12:00 前' : '上午提交当天完·下午提交次日 12:00 前' }}</span>
      </div>
      <el-form label-width="80px">
        <el-form-item label="审批意见">
          <el-input
            v-model="approveOpinion"
            type="textarea"
            :rows="4"
            placeholder="请输入审批意见"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="approveVisible = false">关闭</el-button>
          <el-button v-hasRole="['admin','boss','manager','finance']" type="danger" :icon="CircleClose" @click="openReject">驳回</el-button>
          <el-button v-hasRole="['admin','boss','manager','finance']" type="primary" :icon="CircleCheck" @click="handleApprove">
            {{ approveButtonText }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 驳回原因 Dialog -->
    <el-dialog
      v-model="rejectVisible"
      :title="rejectDialogTitle"
      width="560px"
      class="reject-dialog"
      append-to-body
    >
      <div class="reject-tip">
        <el-icon><Warning /></el-icon>
        <span>驳回后客户将退回原跟进阶段，15天回收规则重新生效</span>
      </div>
      <el-form label-width="100px" size="default">
        <el-form-item label="驳回原因" required>
          <el-select
            v-model="rejectReasonType"
            placeholder="选择驳回原因"
            style="width: 100%"
          >
            <el-option
              v-for="opt in rejectReasonOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="rejectReasonType === '其他' ? '详细说明' : '补充备注'">
          <el-input
            v-model="rejectReasonText"
            type="textarea"
            :rows="4"
            :placeholder="rejectReasonType === '其他' ? '请填写详细驳回说明（必填）' : '选填·供提单人作为修改参考'"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rejectVisible = false">取消</el-button>
          <el-button type="danger" :icon="CircleClose" @click="handleReject">确认驳回</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 详情 Drawer -->
    <el-drawer
      v-model="detailVisible"
      :title="detailTarget ? '订单详情 · ' + detailTarget.orderNo : '订单详情'"
      size="780px"
      class="detail-drawer"
    >
      <template v-if="detailTarget">
        <!-- 状态流转 -->
        <div class="detail-block">
          <div class="block-head">
            <span class="block-bar"></span>
            <span class="block-title">流程状态</span>
            <el-tag
              :type="levelTagType(approvalLevelOf(detailTarget))"
              effect="plain"
              size="small"
              class="level-tag block-level-tag"
            >
              {{ approvalLevelText(detailTarget) }}
            </el-tag>
            <span class="block-meta">{{ approvalChainText(detailTarget) }}</span>
            <el-tag
              v-if="isOverdueRow(detailTarget)"
              type="danger"
              effect="plain"
              size="small"
              class="overdue-chip block-overdue-tag"
            >审批超期·{{ deadlineRemain(detailTarget) }}</el-tag>
          </div>
          <el-steps
            :active="statusStep(detailTarget.status)"
            finish-status="success"
            :status="detailTarget.status === 'rejected' ? 'error' : detailTarget.status === 'cancelled' ? 'wait' : 'process'"
            class="status-steps"
          >
            <el-step title="提交草稿" />
            <el-step title="主管审批" />
            <el-step title="财务确认" v-if="approvalLevelOf(detailTarget) >= 2" />
            <el-step title="老板终审" v-if="approvalLevelOf(detailTarget) >= 3" />
            <el-step title="订单完成" />
          </el-steps>
          <div
            v-if="detailTarget.status === 'pending_approval' || detailTarget.status === 'pending_finance' || detailTarget.status === 'pending_boss'"
            class="deadline-banner"
            :class="{ 'is-overdue': isOverdueRow(detailTarget) }"
          >
            <el-icon><Clock /></el-icon>
            <div>
              <div class="banner-title">审批截止 · {{ detailTarget.approvalDeadline }}</div>
              <div class="banner-sub">{{ deadlineHint(detailTarget) }} · {{ deadlineRemain(detailTarget) }}</div>
            </div>
          </div>
          <div v-if="detailTarget.status === 'rejected'" class="reject-banner">
            <el-icon><Warning /></el-icon>
            <div>
              <div class="reject-title">
                订单被{{ detailTarget.rejectStage === 'manager' ? '主管' : detailTarget.rejectStage === 'finance' ? '财务' : detailTarget.rejectStage === 'boss' ? '老板' : '审批' }}驳回
              </div>
              <div class="reject-content">
                <span v-if="detailTarget.rejectReasonType" class="reject-type">[{{ detailTarget.rejectReasonType }}]</span>
                {{ detailTarget.rejectReason || detailTarget.approvalOpinion || '审批未通过' }}
              </div>
            </div>
            <el-button type="warning" size="small" @click="resubmitFromDetail">修改后重新提交</el-button>
          </div>
        </div>

        <!-- 订单基本信息 -->
        <div class="detail-block">
          <div class="block-head">
            <span class="block-bar"></span>
            <span class="block-title">订单概览</span>
          </div>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="订单编号">{{ detailTarget.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="statusType(detailTarget.status)" effect="dark">
                {{ statusLabel(detailTarget.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="客户">{{ detailTarget.customerName }}</el-descriptions-item>
            <el-descriptions-item label="提单人">{{ detailTarget.submitterName }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ detailTarget.submitTime }}</el-descriptions-item>
            <el-descriptions-item label="预计签约">{{ detailTarget.expectedSignDate || '—' }}</el-descriptions-item>
            <el-descriptions-item label="付款方式">{{ paymentMethodLabel(detailTarget.paymentMethod) }}</el-descriptions-item>
            <el-descriptions-item label="确认方式">{{ confirmMethodLabel(detailTarget.confirmMethod) }}</el-descriptions-item>
            <el-descriptions-item label="总金额">¥{{ formatAmount(detailTarget.totalAmount) }}</el-descriptions-item>
            <el-descriptions-item label="折后金额">
              <span class="emph">¥{{ formatAmount(detailTarget.finalAmount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="已收定金">¥{{ formatAmount(detailTarget.depositAmount) }}</el-descriptions-item>
            <el-descriptions-item label="待收金额">¥{{ formatAmount(detailTarget.pendingAmount) }}</el-descriptions-item>
            <el-descriptions-item label="提成比例">{{ detailTarget.commissionRate }}%</el-descriptions-item>
            <el-descriptions-item label="参考提成">¥{{ formatAmount(detailTarget.commissionAmount) }}</el-descriptions-item>
            <el-descriptions-item label="特殊约定" :span="2">
              {{ detailTarget.specialAgreement || '—' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 服务子项列表 -->
        <div class="detail-block">
          <div class="block-head">
            <span class="block-bar"></span>
            <span class="block-title">服务子项 ({{ detailTarget.items.length }})</span>
          </div>
          <el-table :data="detailTarget.items" border size="small">
            <el-table-column label="子项编号" prop="itemNo" width="160" />
            <el-table-column label="服务类型" min-width="120">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ serviceTypeLabel(row.serviceType) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="周期" min-width="100">
              <template #default="{ row }">{{ servicePeriodLabel(row.servicePeriod) }}</template>
            </el-table-column>
            <el-table-column label="金额" width="100" align="right">
              <template #default="{ row }">¥{{ formatAmount(row.amount) }}</template>
            </el-table-column>
            <el-table-column label="折后" width="100" align="right">
              <template #default="{ row }">¥{{ formatAmount(row.finalAmount) }}</template>
            </el-table-column>
            <el-table-column label="子项状态" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="itemStatusType(row.itemStatus)" effect="plain" size="small">
                  {{ itemStatusLabel(row.itemStatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="描述" min-width="160" show-overflow-tooltip prop="description" />
          </el-table>
        </div>

        <!-- 审批历史时间线 -->
        <div class="detail-block">
          <div class="block-head">
            <span class="block-bar"></span>
            <span class="block-title">审批历史</span>
          </div>
          <el-timeline class="audit-timeline">
            <el-timeline-item
              type="primary"
              :timestamp="detailTarget.createTime"
              placement="top"
            >
              <div class="time-card">
                <div class="time-title">订单创建</div>
                <div class="time-desc">由 {{ detailTarget.submitterName }} 创建草稿</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="detailTarget.submitTime && detailTarget.status !== 'draft'"
              type="warning"
              :timestamp="detailTarget.submitTime"
              placement="top"
            >
              <div class="time-card">
                <div class="time-title">提交审批 · {{ approvalLevelText(detailTarget) }}</div>
                <div class="time-desc">
                  {{ approvalChainText(detailTarget) }} · 截止 {{ detailTarget.approvalDeadline || '—' }}
                </div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="detailTarget.approvalTime"
              :type="detailTarget.rejectStage === 'manager' ? 'danger' : 'success'"
              :timestamp="detailTarget.approvalTime"
              placement="top"
            >
              <div class="time-card">
                <div class="time-title">
                  {{ detailTarget.rejectStage === 'manager' ? '主管驳回' : '主管已审批' }}
                </div>
                <div class="time-desc">{{ detailTarget.approvalOpinion || '—' }}</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="detailTarget.financeConfirmTime"
              :type="detailTarget.rejectStage === 'finance' ? 'danger' : 'success'"
              :timestamp="detailTarget.financeConfirmTime"
              placement="top"
            >
              <div class="time-card">
                <div class="time-title">
                  {{ detailTarget.rejectStage === 'finance' ? '财务驳回' : '财务确认完成' }}
                </div>
                <div class="time-desc">{{ detailTarget.financeOpinion || '—' }}</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="detailTarget.bossApprovalTime"
              :type="detailTarget.rejectStage === 'boss' ? 'danger' : 'success'"
              :timestamp="detailTarget.bossApprovalTime"
              placement="top"
            >
              <div class="time-card">
                <div class="time-title">
                  {{ detailTarget.rejectStage === 'boss' ? '老板驳回' : '老板终审通过' }}
                </div>
                <div class="time-desc">{{ detailTarget.bossOpinion || '—' }}</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-for="(log, i) in detailTarget.linkageLogs || []"
              :key="'lk-' + i"
              type="info"
              :timestamp="log.time"
              placement="top"
            >
              <div class="time-card linkage-card">
                <div class="time-title">
                  <el-icon class="linkage-icon"><Promotion /></el-icon>
                  <span>联动 · {{ log.title }}</span>
                </div>
                <div class="time-desc">{{ log.desc }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus, Refresh, Search, InfoFilled, CirclePlus, Delete, UploadFilled,
  Document, Promotion, CircleCheck, CircleClose, Clock, Warning,
  Wallet, Stamp, Money, Files
} from '@element-plus/icons-vue'
import {
  orderApi,
  approvalLevelLabel,
  approvalLevelChain,
  calcApprovalLevel,
  isOverdue,
  type BizOrder,
  type BizOrderItem,
  type OrderStats
} from '@/api/order'

// ===== 当前时钟（倒计时驱动重算） =====
const now = ref(Date.now())
let tickerId: number | null = null

// ===== 当前日期 =====
const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// ===== 选项常量 =====
const serviceTypeOptions = [
  { value: 'bookkeeping', label: '代理记账' },
  { value: 'registration', label: '工商注册' },
  { value: 'tax_planning', label: '税务筹划' },
  { value: 'qualification', label: '资质代办' },
  { value: 'audit', label: '审计报告' },
  { value: 'cancellation', label: '注销公司' },
  { value: 'other', label: '其他' }
]
const servicePeriodOptions = [
  { value: '1month', label: '1 个月' },
  { value: '3month', label: '3 个月' },
  { value: '6month', label: '6 个月' },
  { value: '1year', label: '1 年' },
  { value: '2year', label: '2 年' },
  { value: '3year', label: '3 年' },
  { value: 'one_time', label: '一次性' }
]
const paymentMethodOptions = [
  { value: 'lump_sum', label: '一次性付清' },
  { value: 'monthly', label: '按月付款' },
  { value: 'quarterly', label: '按季付款' },
  { value: 'semi_annual', label: '半年付款' },
  { value: 'annual', label: '按年付款' },
  { value: 'installment', label: '分期付款' }
]
const confirmMethodOptions = [
  { value: 'wechat', label: '微信确认' },
  { value: 'phone', label: '电话确认' },
  { value: 'meeting', label: '面谈确认' },
  { value: 'email', label: '邮件确认' }
]

const itemStatusOptions = [
  { value: 'pending', label: '待执行' },
  { value: 'in_progress', label: '执行中' },
  { value: 'completed', label: '已完成' },
  { value: 'paused', label: '已暂停' }
]

function itemStatusLabel(v: string): string {
  return itemStatusOptions.find(o => o.value === v)?.label || v
}
function itemStatusType(v: string): 'info' | 'warning' | 'primary' | 'success' | 'danger' {
  return ({
    pending: 'info',
    in_progress: 'warning',
    completed: 'success',
    paused: 'danger'
  } as Record<string, 'info' | 'warning' | 'primary' | 'success' | 'danger'>)[v] || 'info'
}

const statusTabs = [
  { key: '', label: '全部' },
  { key: 'draft', label: '草稿' },
  { key: 'pending_approval', label: '待主管审批' },
  { key: 'pending_finance', label: '待财务确认' },
  { key: 'pending_boss', label: '待老板终审' },
  { key: 'completed', label: '已完成' },
  { key: 'rejected', label: '已驳回' },
  { key: 'cancelled', label: '已取消' },
  { key: 'overdue', label: '审批超期' }
]

// ===== 客户 Mock 数据 =====
const customerOptions = ref<Array<{ id: number; name: string; contact: string; phone: string }>>([])

function loadCustomerOptions() {
  const fallback = [
    { id: 101, name: '杭州森禾科技有限公司', contact: '林总', phone: '138****0101' },
    { id: 102, name: '浙江云桥贸易有限公司', contact: '许经理', phone: '138****0102' },
    { id: 103, name: '杭州叁木文化传媒有限公司', contact: '邵总', phone: '138****0103' },
    { id: 104, name: '湖州锦辰餐饮管理有限公司', contact: '沈总', phone: '138****0104' },
    { id: 105, name: '绍兴南麓服饰有限公司', contact: '周经理', phone: '138****0105' },
    { id: 106, name: '嘉兴禾创智能装备有限公司', contact: '赵总', phone: '138****0106' },
    { id: 110, name: '杭州启明电商有限公司', contact: '余经理', phone: '138****0110' },
    { id: 111, name: '宁波蔚蓝企业管理有限公司', contact: '郑总', phone: '138****0111' }
  ]
  try {
    const raw = JSON.parse(localStorage.getItem('biz_customer_list') || '[]') as Array<Record<string, any>>
    const normalized = raw
      .map(c => ({
        id: Number(c.id),
        name: c.name || c.customerName || c.companyName || c.enterpriseName || '',
        contact: c.contact || c.contactName || c.linkman || c.bossName || '',
        phone: c.phone || c.mobile || c.contactPhone || ''
      }))
      .filter(c => c.id && c.name)
    const map = new Map<number, { id: number; name: string; contact: string; phone: string }>()
    ;[...normalized, ...fallback].forEach(c => {
      if (!map.has(c.id)) map.set(c.id, c)
    })
    customerOptions.value = Array.from(map.values())
  } catch {
    customerOptions.value = fallback
  }
}

// ===== 列表与分页 =====
const loading = ref(false)
const tableData = ref<BizOrder[]>([])
const stats = ref<OrderStats>({
  totalCount: 0,
  draftCount: 0,
  pendingApprovalCount: 0,
  pendingFinanceCount: 0,
  pendingBossCount: 0,
  rejectedCount: 0,
  completedCount: 0,
  cancelledCount: 0,
  overdueCount: 0,
  totalAmount: 0,
  finalAmount: 0,
  monthAmount: 0
})

const activeTab = ref('')
const searchForm = reactive<{ orderNo: string; dateRange: [string, string] | null }>({
  orderNo: '',
  dateRange: null
})
const page = reactive({ current: 1, size: 10, total: 0 })

const statCards = computed(() => [
  { key: 'draft', label: '草稿', value: stats.value.draftCount, theme: 'theme-info', icon: Files },
  { key: 'pending_approval', label: '待审批', value: stats.value.pendingApprovalCount, theme: 'theme-warning', icon: Stamp },
  { key: 'pending_finance', label: '待财务确认', value: stats.value.pendingFinanceCount, theme: 'theme-primary', icon: Wallet },
  { key: 'overdue', label: '审批超期', value: stats.value.overdueCount, theme: 'theme-danger', icon: Clock },
  { key: 'completed', label: '已完成', value: stats.value.completedCount, theme: 'theme-success', icon: CircleCheck },
  { key: '', label: '本月成交额', value: '¥' + formatAmount(stats.value.monthAmount), theme: 'theme-gold', icon: Money }
])

function changeTab(key: string) {
  activeTab.value = key
  applyFilters()
}

function applyFilters() {
  page.current = 1
  loadList()
}

function tabCount(key: string): number {
  switch (key) {
    case '': return stats.value.totalCount
    case 'draft': return stats.value.draftCount
    case 'pending_approval': return stats.value.pendingApprovalCount
    case 'pending_finance': return stats.value.pendingFinanceCount
    case 'pending_boss': return stats.value.pendingBossCount
    case 'completed': return stats.value.completedCount
    case 'rejected': return stats.value.rejectedCount
    case 'cancelled': return stats.value.cancelledCount
    case 'overdue': return stats.value.overdueCount
    default: return 0
  }
}

// ===== 加载 =====
async function loadStats() {
  stats.value = await orderApi.stats()
}

async function loadList() {
  loading.value = true
  try {
    const isOverdueTab = activeTab.value === 'overdue'
    const res = await orderApi.list({
      page: page.current,
      pageSize: page.size,
      status: isOverdueTab ? undefined : (activeTab.value || undefined),
      keyword: searchForm.orderNo || undefined,
      startDate: searchForm.dateRange?.[0],
      endDate: searchForm.dateRange?.[1],
      overdueOnly: isOverdueTab
    })
    tableData.value = res.list
    page.total = res.total
  } finally {
    loading.value = false
  }
}

async function loadAll(showToast = false) {
  await Promise.all([loadStats(), loadList()])
  if (showToast) ElMessage.success('数据已刷新')
}

// ===== 标签 / 颜色辅助 =====
function statusLabel(status: string): string {
  return ({
    draft: '草稿',
    pending_approval: '待主管审批',
    pending_finance: '待财务确认',
    pending_boss: '待老板终审',
    completed: '已完成',
    rejected: '已驳回',
    cancelled: '已取消'
  } as Record<string, string>)[status] || status
}
function statusType(status: string): 'info' | 'warning' | 'primary' | 'success' | 'danger' {
  const map: Record<string, 'info' | 'warning' | 'primary' | 'success' | 'danger'> = {
    draft: 'info',
    pending_approval: 'warning',
    pending_finance: 'primary',
    pending_boss: 'danger',
    completed: 'success',
    rejected: 'danger',
    cancelled: 'info'
  }
  return map[status] || 'info'
}
function statusStep(status: string): number {
  return ({
    draft: 0,
    pending_approval: 1,
    pending_finance: 2,
    pending_boss: 3,
    completed: 4,
    rejected: 1,
    cancelled: 0
  } as Record<string, number>)[status] ?? 0
}
function serviceTypeLabel(v: string): string {
  return serviceTypeOptions.find(o => o.value === v)?.label || v
}
function servicePeriodLabel(v: string): string {
  return servicePeriodOptions.find(o => o.value === v)?.label || v
}
function paymentMethodLabel(v: string): string {
  return paymentMethodOptions.find(o => o.value === v)?.label || v
}
function confirmMethodLabel(v: string): string {
  return confirmMethodOptions.find(o => o.value === v)?.label || v
}
function formatAmount(n: number): string {
  return (n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}
function rowClassName({ row }: { row: BizOrder }): string {
  if (isOverdue(row)) return 'row-overdue'
  if (row.status === 'rejected') return 'row-rejected'
  if (row.status === 'completed') return 'row-completed'
  return ''
}
function canCancel(status: string): boolean {
  return status !== 'completed' && status !== 'cancelled'
}

// ===== 审批等级 / 截止 / 倒计时 =====
function approvalLevelOf(row: BizOrder): 1 | 2 | 3 {
  return row.approvalLevel || calcApprovalLevel(row.finalAmount)
}
function approvalLevelText(row: BizOrder): string {
  return approvalLevelLabel(approvalLevelOf(row))
}
function approvalChainText(row: BizOrder): string {
  return approvalLevelChain(approvalLevelOf(row)).join(' → ')
}
function isOverdueRow(row: BizOrder): boolean {
  void now.value
  return isOverdue(row)
}
function deadlineRemain(row: BizOrder): string {
  if (!row.approvalDeadline) return '—'
  const dl = new Date(row.approvalDeadline.replace(' ', 'T')).getTime()
  const diff = dl - now.value
  if (diff <= 0) {
    const over = Math.abs(diff)
    const h = Math.floor(over / 3600000)
    const m = Math.floor((over % 3600000) / 60000)
    return `超期 ${h}h ${m}m`
  }
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  return `还剩 ${h}h ${m}m`
}
function deadlineHint(row: BizOrder): string {
  if (!row.submitMoment) return ''
  return row.submitMoment === 'am'
    ? '上午提交 · 需当天 18:00 前审完'
    : '下午提交 · 需次日 12:00 前审完'
}
function levelTagType(level: 1 | 2 | 3): 'success' | 'warning' | 'danger' {
  return level === 1 ? 'success' : level === 2 ? 'warning' : 'danger'
}

// ===== 新建 / 编辑 表单 =====
const formVisible = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const form = reactive<{
  id?: number
  orderNo: string
  customerId: number | undefined
  customerName: string
  submitterName: string
  _contact: string
  _phone: string
  status: BizOrder['status']
  totalAmount: number
  discountRate: number
  finalAmount: number
  depositAmount: number
  pendingAmount: number
  paymentMethod: BizOrder['paymentMethod']
  paymentTimeReq: string
  commissionRate: number
  commissionAmount: number
  confirmMethod: BizOrder['confirmMethod']
  confirmScreenshot: string
  expectedSignDate: string
  specialAgreement: string
  remark: string
  items: BizOrderItem[]
}>({
  orderNo: '',
  customerId: undefined,
  customerName: '',
  submitterName: '当前用户',
  _contact: '',
  _phone: '',
  status: 'draft',
  totalAmount: 0,
  discountRate: 100,
  finalAmount: 0,
  depositAmount: 0,
  pendingAmount: 0,
  paymentMethod: 'monthly',
  paymentTimeReq: '签约后3日内支付定金',
  commissionRate: 8,
  commissionAmount: 0,
  confirmMethod: 'wechat',
  confirmScreenshot: '',
  expectedSignDate: '',
  specialAgreement: '',
  remark: '',
  items: []
})

const itemsOriginal = computed(() => form.items.reduce((s, i) => s + (i.amount || 0), 0))
const totalAmount = computed(() => form.items.reduce((s, i) => s + (i.amount || 0), 0))
const itemsFinal = computed(() => form.items.reduce((s, i) => s + (i.finalAmount || 0), 0))
const finalAmount = computed(() => Math.round(itemsFinal.value * (form.discountRate || 100) / 100))
const pendingAmount = computed(() => Math.max(0, finalAmount.value - (form.depositAmount || 0)))
const commissionAmount = computed(() => Math.round(finalAmount.value * (form.commissionRate || 0) / 100))

function itemsSummary({ columns, data }: { columns: any[]; data: BizOrderItem[] }): string[] {
  return columns.map((_col, idx) => {
    if (idx === 0) return '子项合计'
    if (idx === 4) return '¥' + formatAmount(data.reduce((s, r) => s + (r.amount || 0), 0))
    if (idx === 6) return '¥' + formatAmount(data.reduce((s, r) => s + (r.finalAmount || 0), 0))
    return ''
  })
}

function resetForm() {
  form.id = undefined
  form.orderNo = ''
  form.customerId = undefined
  form.customerName = ''
  form._contact = ''
  form._phone = ''
  form.submitterName = '当前用户'
  form.status = 'draft'
  form.discountRate = 100
  form.depositAmount = 0
  form.paymentMethod = 'monthly'
  form.paymentTimeReq = '签约后3日内支付定金'
  form.commissionRate = 8
  form.confirmMethod = 'wechat'
  form.confirmScreenshot = ''
  form.expectedSignDate = ''
  form.specialAgreement = ''
  form.remark = ''
  form.items = []
}

function openCreateDialog() {
  resetForm()
  formMode.value = 'create'
  addItem()
  formVisible.value = true
}

function openEditDialog(row: BizOrder) {
  resetForm()
  formMode.value = 'edit'
  Object.assign(form, {
    id: row.id,
    orderNo: row.orderNo,
    customerId: row.customerId,
    customerName: row.customerName || '',
    submitterName: row.submitterName || '当前用户',
    status: row.status,
    discountRate: row.discountRate,
    depositAmount: row.depositAmount,
    paymentMethod: row.paymentMethod,
    paymentTimeReq: row.paymentTimeReq,
    commissionRate: row.commissionRate,
    confirmMethod: row.confirmMethod,
    confirmScreenshot: row.confirmScreenshot,
    expectedSignDate: row.expectedSignDate,
    specialAgreement: row.specialAgreement,
    remark: row.remark,
    items: JSON.parse(JSON.stringify(row.items))
  })
  const c = customerOptions.value.find(x => x.id === row.customerId)
  if (c) {
    form._contact = c.contact
    form._phone = c.phone
  }
  formVisible.value = true
}

function onCustomerChange(id: number) {
  const c = customerOptions.value.find(x => x.id === id)
  if (c) {
    form.customerName = c.name
    form._contact = c.contact
    form._phone = c.phone
  }
}

function addItem() {
  const today = new Date().toISOString().slice(0, 10)
  form.items.push({
    id: 0,
    itemNo: '',
    orderId: 0,
    serviceType: 'bookkeeping',
    servicePeriod: '1year',
    startDate: today,
    endDate: today,
    description: '',
    specialRequirement: '',
    amount: 0,
    discountRate: 100,
    finalAmount: 0,
    itemStatus: 'pending'
  })
}

function removeItem(idx: number) {
  if (form.items.length <= 1) {
    ElMessage.warning('至少保留 1 条服务子项')
    return
  }
  form.items.splice(idx, 1)
}

function recalcItem(row: BizOrderItem) {
  row.finalAmount = Math.round((row.amount || 0) * (row.discountRate || 100) / 100)
}

async function handleSave(action: 'draft' | 'submit') {
  if (!form.customerId) {
    ElMessage.warning('请选择客户')
    return
  }
  if (!form.items.length) {
    ElMessage.warning('请至少添加一条服务子项')
    return
  }
  for (const it of form.items) {
    if (!it.amount || it.amount <= 0) {
      ElMessage.warning('请填写每条子项的金额')
      return
    }
  }

  // 重新计算汇总
  form.items.forEach(recalcItem)
  const payload: Partial<BizOrder> = {
    customerId: form.customerId,
    customerName: form.customerName,
    submitterName: form.submitterName,
    status: 'draft',
    discountRate: form.discountRate,
    depositAmount: form.depositAmount,
    paymentMethod: form.paymentMethod,
    paymentTimeReq: form.paymentTimeReq,
    commissionRate: form.commissionRate,
    confirmMethod: form.confirmMethod,
    confirmScreenshot: form.confirmScreenshot,
    expectedSignDate: form.expectedSignDate,
    specialAgreement: form.specialAgreement,
    remark: form.remark,
    items: form.items
  }

  let saved: BizOrder
  if (formMode.value === 'create') {
    saved = await orderApi.create(payload)
  } else if (form.id) {
    saved = await orderApi.update({ id: form.id, ...payload })
  } else {
    return
  }

  if (action === 'submit') {
    await orderApi.submit(saved.id)
    ElMessage.success('已提交主管审批')
  } else {
    ElMessage.success('草稿已保存')
  }
  formVisible.value = false
  await loadAll()
}

async function handleSubmit(row: BizOrder) {
  await ElMessageBox.confirm(`确认将订单【${row.orderNo}】提交审批？`, '提交审批', { type: 'warning' })
  await orderApi.submit(row.id)
  ElMessage.success('提交成功')
  await loadAll()
}

async function handleCancel(row: BizOrder) {
  try {
    const { value } = await ElMessageBox.prompt(`请填写取消原因`, `取消订单 · ${row.orderNo}`, {
      confirmButtonText: '确认取消',
      cancelButtonText: '关闭',
      inputType: 'textarea',
      inputPlaceholder: '请输入取消原因（必填）',
      inputValidator: (v) => !!v || '取消原因不能为空'
    })
    await orderApi.cancel(row.id, value)
    ElMessage.success('订单已取消')
    await loadAll()
  } catch { /* 用户取消 */ }
}

// ===== 审批 / 财务确认 =====
const approveVisible = ref(false)
const approveMode = ref<'manager' | 'finance' | 'boss'>('manager')
const approveTarget = ref<BizOrder | null>(null)
const approveOpinion = ref('')

// ===== 驳回对话 =====
const rejectVisible = ref(false)
const rejectStage = ref<'manager' | 'finance' | 'boss'>('manager')
const rejectReasonType = ref('')
const rejectReasonText = ref('')
const MANAGER_REASONS = [
  { value: '价格过低', label: '价格过低' },
  { value: '服务内容不清晰', label: '服务内容不清晰' },
  { value: '客户资质不符', label: '客户资质不符' },
  { value: '折扣超限（需老板审批）', label: '折扣超限（需老板审批）' },
  { value: '其他', label: '其他（自定义）' }
]
const FINANCE_REASONS = [
  { value: '金额计算错误', label: '金额计算错误' },
  { value: '付款方式不合规', label: '付款方式不合规' },
  { value: '折扣超限', label: '折扣超限' },
  { value: '其他', label: '其他（自定义）' }
]
const BOSS_REASONS = [
  { value: '利润不符预期', label: '利润不符预期' },
  { value: '客户类型不匹配战略', label: '客户类型不匹配战略' },
  { value: '其他', label: '其他（自定义）' }
]
const rejectReasonOptions = computed(() => {
  return rejectStage.value === 'manager' ? MANAGER_REASONS
    : rejectStage.value === 'finance' ? FINANCE_REASONS
    : BOSS_REASONS
})

const approveDialogTitle = computed(() => {
  const no = approveTarget.value?.orderNo || ''
  if (approveMode.value === 'manager') return `主管审批 · ${no}`
  if (approveMode.value === 'finance') return `财务确认 · ${no}`
  return `老板终审 · ${no}`
})
const approveButtonText = computed(() => {
  if (approveMode.value === 'manager') return '主管通过'
  if (approveMode.value === 'finance') return '财务确认'
  return '老板终审通过'
})
const rejectDialogTitle = computed(() => {
  const stage = rejectStage.value === 'manager' ? '主管' : rejectStage.value === 'finance' ? '财务' : '老板'
  return `${stage}驳回 · ${approveTarget.value?.orderNo || ''}`
})

function openApprove(row: BizOrder) {
  approveTarget.value = row
  approveMode.value = 'manager'
  approveOpinion.value = ''
  approveVisible.value = true
}
function openFinance(row: BizOrder) {
  approveTarget.value = row
  approveMode.value = 'finance'
  approveOpinion.value = ''
  approveVisible.value = true
}
function openBoss(row: BizOrder) {
  approveTarget.value = row
  approveMode.value = 'boss'
  approveOpinion.value = ''
  approveVisible.value = true
}

async function handleApprove() {
  if (!approveTarget.value) return
  const t = approveTarget.value
  if (approveMode.value === 'manager') {
    await orderApi.approve({ id: t.id, opinion: approveOpinion.value || '主管审批通过' })
    if (approvalLevelOf(t) === 1) {
      ElMessage.success('订单已完成，合同草稿已自动生成')
    } else {
      ElMessage.success(`主管审批通过·流转下一节点`)
    }
  } else if (approveMode.value === 'finance') {
    await orderApi.financeConfirm({ id: t.id, opinion: approveOpinion.value || '财务已确认' })
    if (approvalLevelOf(t) >= 3) {
      ElMessage.success('财务确认完成·已提交老板终审')
    } else {
      ElMessage.success('订单已完成，合同草稿已自动生成')
    }
  } else {
    await orderApi.bossApprove({ id: t.id, opinion: approveOpinion.value || '老板终审通过' })
    ElMessage.success('订单已完成，合同草稿已自动生成')
  }
  approveVisible.value = false
  await loadAll()
}

function openReject() {
  if (!approveTarget.value) return
  rejectStage.value = approveMode.value
  rejectReasonType.value = ''
  rejectReasonText.value = approveOpinion.value || ''
  rejectVisible.value = true
}

async function handleReject() {
  if (!approveTarget.value) return
  if (!rejectReasonType.value) {
    ElMessage.warning('请选择驳回原因')
    return
  }
  const isOther = rejectReasonType.value === '其他'
  const opinion = isOther
    ? rejectReasonText.value.trim()
    : (rejectReasonText.value.trim() ? `${rejectReasonType.value}・${rejectReasonText.value.trim()}` : rejectReasonType.value)
  if (isOther && !rejectReasonText.value.trim()) {
    ElMessage.warning('选择“其他”时请填写详细驳回说明')
    return
  }
  await orderApi.reject({
    id: approveTarget.value.id,
    opinion,
    reasonType: rejectReasonType.value,
    stage: rejectStage.value
  })
  ElMessage.success('已驳回·客户退回原跟进阶段')
  rejectVisible.value = false
  approveVisible.value = false
  await loadAll()
}

// ===== 详情 Drawer =====
const detailVisible = ref(false)
const detailTarget = ref<BizOrder | null>(null)

async function openDetail(row: BizOrder) {
  const data = await orderApi.detail(row.id)
  detailTarget.value = data
  detailVisible.value = true
}

function resubmitFromDetail() {
  if (!detailTarget.value) return
  const target = detailTarget.value
  detailVisible.value = false
  openEditDialog(target)
}

// ===== 生命周期 =====
onMounted(async () => {
  await orderApi.ensureSamples()
  loadCustomerOptions()
  await loadAll()
  tickerId = window.setInterval(() => { now.value = Date.now() }, 30000)
})
onBeforeUnmount(() => {
  if (tickerId !== null) {
    clearInterval(tickerId)
    tickerId = null
  }
})
</script>


<style lang="scss" scoped>
.order-bill {
  --gold: #D4AF37;
  --gold-soft: rgba(212, 175, 55, 0.55);
  --gold-line: rgba(212, 175, 55, 0.18);
  --bg-card: #16161E;
  --bg-card-2: #1A1A24;
  --text-primary: #F5F5F5;
  --text-body: #B8B8C0;
  --text-muted: #888;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 4px 32px;
}

/* ============== Header ============== */
.page-header {
  position: relative;
  padding: 30px 36px 26px;
  background: linear-gradient(135deg, #12121A 0%, #1A1A24 60%, #1F1A12 100%);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 88% 20%, rgba(212, 175, 55, 0.18), transparent 45%),
      radial-gradient(circle at 8% 90%, rgba(242, 101, 34, 0.12), transparent 50%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'JetBrains Mono', 'Menlo', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: var(--gold);
  margin-bottom: 14px;
  position: relative;
  z-index: 1;

  .meta-tag {
    padding: 3px 10px;
    border: 1px solid rgba(212, 175, 55, 0.4);
    border-radius: 2px;
    background: rgba(212, 175, 55, 0.06);
  }
  .meta-divider { width: 24px; height: 1px; background: rgba(212, 175, 55, 0.4); }
  .meta-time { color: rgba(212, 175, 55, 0.6); }
}
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;

  .title-cn {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(180deg, #FFF7DD 0%, #D4AF37 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'Playfair Display', 'Georgia', serif;
    font-style: italic;
    font-weight: 400;
    font-size: 17px;
    color: rgba(212, 175, 55, 0.55);
  }
}
.page-desc {
  font-size: 13px;
  color: var(--text-body);
  letter-spacing: 0.04em;
  margin: 0;
}
.header-actions {
  position: absolute;
  top: 28px;
  right: 36px;
  z-index: 1;
  display: flex;
  gap: 10px;

  .primary-btn {
    background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
    border: 1px solid rgba(212, 175, 55, 0.6);
    color: #1A1A24;
    font-weight: 600;
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.25);

    &:hover {
      background: linear-gradient(135deg, #E5C24F 0%, #D4AF37 100%);
      transform: translateY(-1px);
    }
  }
  .ghost-btn {
    background: rgba(212, 175, 55, 0.08);
    border-color: rgba(212, 175, 55, 0.32);
    color: var(--gold);

    &:hover {
      background: rgba(212, 175, 55, 0.18);
      border-color: rgba(212, 175, 55, 0.6);
      color: var(--gold);
    }
  }
}

/* ============== Stat Row ============== */
.stat-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}
.stat-card {
  position: relative;
  padding: 18px 20px 16px;
  background: var(--bg-card);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
  cursor: pointer;
  transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(212, 175, 55, 0.42);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  }

  &.active {
    border-color: var(--gold);
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.2);
  }

  .stat-index {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(212, 175, 55, 0.45);
  }
  .stat-icon {
    position: absolute;
    top: 16px;
    right: 18px;
    color: var(--gold-soft);
    opacity: 0.7;
  }
  .stat-num {
    margin-top: 6px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 26px;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.1;
  }
  .stat-label {
    margin-top: 4px;
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.04em;
  }
  .stat-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, transparent, currentColor, transparent);
    opacity: 0.5;
  }

  &.theme-info { color: #6E7989; .stat-num { color: #C8CDD6; } }
  &.theme-warning { color: #E6A23C; .stat-num { color: #E6A23C; } }
  &.theme-primary { color: #4DA3FF; .stat-num { color: #4DA3FF; } }
  &.theme-success { color: #67C23A; .stat-num { color: #67C23A; } }
  &.theme-danger { color: #F56C6C; .stat-num { color: #F56C6C; } }
  &.theme-gold { color: var(--gold); .stat-num { color: var(--gold); font-size: 20px; } }
}

/* ============== Tabs ============== */
.tab-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-card);
  border: 1px solid var(--gold-line);
  border-radius: 10px;
  padding: 0 18px;
  gap: 16px;
}
.status-tabs { flex: 1; min-width: 0; }
:deep(.status-tabs .el-tabs__nav-wrap::after) { background: rgba(212, 175, 55, 0.1); }
:deep(.status-tabs .el-tabs__item) {
  height: 54px;
  padding: 0 18px;
  color: var(--text-body);
  font-size: 14px;
  &.is-active { color: var(--gold); }
}
:deep(.status-tabs .el-tabs__active-bar) {
  background: var(--gold);
  height: 2px;
  box-shadow: 0 0 10px var(--gold);
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  .tab-badge {
    min-width: 22px;
    padding: 0 6px;
    height: 18px;
    line-height: 18px;
    text-align: center;
    background: rgba(212, 175, 55, 0.16);
    border: 1px solid rgba(212, 175, 55, 0.32);
    border-radius: 9px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--gold);
  }
}
.tab-search {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* ============== Table ============== */
.table-wrap {
  background: var(--bg-card);
  border: 1px solid var(--gold-line);
  border-radius: 10px;
  padding: 16px 18px 12px;
}
.order-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(212, 175, 55, 0.04);
  --el-table-row-hover-bg-color: rgba(212, 175, 55, 0.06);
  --el-table-border-color: rgba(212, 175, 55, 0.1);
  --el-table-text-color: var(--text-body);
  --el-table-header-text-color: var(--gold);
}
:deep(.order-table .el-table__row.row-rejected) td {
  background: rgba(245, 108, 108, 0.06) !important;
}
:deep(.order-table .el-table__row.row-completed) td {
  background: rgba(103, 194, 58, 0.04) !important;
}
.order-no {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--gold);
  letter-spacing: 0.04em;
}
.cell-customer {
  display: flex;
  flex-direction: column;
  gap: 2px;
  .customer-name { font-size: 13px; color: var(--text-primary); font-weight: 500; }
  .customer-id {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
    letter-spacing: 0.06em;
  }
}
.service-summary {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;

  .service-tag {
    background: rgba(212, 175, 55, 0.06);
    border-color: rgba(212, 175, 55, 0.3);
    color: var(--gold);
  }
  .more-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted);
  }
}
.amount-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  .amount-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    font-weight: 700;
    color: var(--gold);
  }
  .amount-origin {
    font-size: 11px;
    color: var(--text-muted);
    text-decoration: line-through;
  }
}
.status-tag { letter-spacing: 0.04em; }
.status-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.overdue-chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 0 6px;
  height: 18px;
  line-height: 18px;
  background: rgba(245, 108, 108, 0.12);
  border-color: rgba(245, 108, 108, 0.55);
  color: #FF8F8F;
  font-size: 11px;
  letter-spacing: 0.04em;
  animation: overdue-pulse 1.6s ease-in-out infinite;
  .chip-text { font-size: 11px; }
  :deep(.el-icon) { font-size: 12px; }
}
@keyframes overdue-pulse {
  0%, 100% { box-shadow: 0 0 0 rgba(245, 108, 108, 0); }
  50% { box-shadow: 0 0 12px rgba(245, 108, 108, 0.45); }
}
.level-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.level-tag {
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.06em;
  font-weight: 600;
}
.level-chain {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(212, 175, 55, 0.55);
  letter-spacing: 0.04em;
  text-align: center;
}
.deadline-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-family: 'JetBrains Mono', monospace;

  .deadline-time {
    font-size: 12px;
    color: var(--text-body);
    letter-spacing: 0.04em;
  }
  .deadline-remain {
    font-size: 11px;
    color: var(--gold);
    letter-spacing: 0.04em;
  }

  &.is-overdue {
    .deadline-time { color: #FF8F8F; }
    .deadline-remain {
      color: #FF6B6B;
      font-weight: 700;
      text-shadow: 0 0 6px rgba(245, 108, 108, 0.4);
    }
  }
}
.deadline-muted {
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
}
:deep(.order-table .el-table__row.row-overdue) td {
  background: rgba(245, 108, 108, 0.08) !important;
  position: relative;
}
:deep(.order-table .el-table__row.row-overdue) td:first-child::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #FF6B6B, #C0392B);
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.5);
}
.action-cell {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 14px 4px 4px;
}

/* ============== Dialog ============== */
:deep(.order-dialog .el-dialog) {
  background: linear-gradient(180deg, #16161E 0%, #1A1A24 100%);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
  overflow: hidden;
}
:deep(.order-dialog .el-dialog__header) {
  padding: 20px 28px 16px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
  margin-right: 0;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08), transparent);
}
:deep(.order-dialog .el-dialog__title) {
  color: var(--gold);
  font-size: 17px;
  letter-spacing: 0.04em;
  font-weight: 600;
}
:deep(.order-dialog .el-dialog__body) {
  padding: 22px 28px 8px;
  max-height: 70vh;
  overflow-y: auto;
}
:deep(.order-dialog .el-dialog__footer) {
  padding: 16px 28px 20px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 18px;
  background: rgba(230, 162, 60, 0.08);
  border: 1px solid rgba(230, 162, 60, 0.3);
  border-radius: 6px;
  color: #E6A23C;
  font-size: 12px;
  letter-spacing: 0.02em;
}

.form-section {
  margin-bottom: 20px;
  padding: 18px 20px;
  background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 10px;

  &.split-section {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
    background: transparent;
    border: none;
    padding: 0;

    .split-col {
      padding: 18px 20px;
      background: rgba(212, 175, 55, 0.03);
      border: 1px solid rgba(212, 175, 55, 0.1);
      border-radius: 10px;
    }
  }
}
.section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;

  .section-bar {
    width: 3px;
    height: 14px;
    background: var(--gold);
    border-radius: 1px;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
  }
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.04em;
  }
  .section-en {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    color: rgba(212, 175, 55, 0.4);
  }
  .section-action { margin-left: auto; }
}

.items-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(212, 175, 55, 0.06);
  --el-table-border-color: rgba(212, 175, 55, 0.12);
  --el-table-text-color: var(--text-body);
  --el-table-header-text-color: var(--gold);
}
:deep(.items-table .el-table__footer) {
  background: rgba(212, 175, 55, 0.05);
  font-family: 'JetBrains Mono', monospace;
  color: var(--gold);
  font-weight: 600;
}
.items-summary-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 16px;
  background:
    linear-gradient(90deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02)),
    repeating-linear-gradient(45deg, transparent 0 6px, rgba(212, 175, 55, 0.03) 6px 7px);
  border: 1px solid rgba(212, 175, 55, 0.22);
  border-radius: 8px;
  font-size: 12px;
  color: var(--text-body);
  letter-spacing: 0.02em;

  .sum-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(212, 175, 55, 0.18);
    border-radius: 4px;

    b {
      font-family: 'JetBrains Mono', monospace;
      color: var(--gold);
      font-weight: 700;
      margin-left: 4px;
      letter-spacing: 0.04em;
    }

    &.emph {
      border-color: rgba(212, 175, 55, 0.45);
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.1);
    }
  }
}
.cell-final {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  color: var(--gold);
}

.upload-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 80px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px dashed rgba(212, 175, 55, 0.32);
  border-radius: 6px;
  color: rgba(212, 175, 55, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: rgba(212, 175, 55, 0.1);
    border-color: var(--gold);
    color: var(--gold);
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* ============== Approve Dialog ============== */
:deep(.approve-dialog .el-dialog) {
  background: linear-gradient(180deg, #16161E 0%, #1A1A24 100%);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 12px;
}
:deep(.approve-dialog .el-dialog__header) {
  padding: 20px 24px 14px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.12);
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08), transparent);
  margin-right: 0;
}
:deep(.approve-dialog .el-dialog__title) {
  color: var(--gold);
  font-weight: 600;
}
:deep(.approve-dialog .el-dialog__body) { padding: 18px 24px 4px; }
:deep(.approve-dialog .el-dialog__footer) {
  padding: 14px 24px 18px;
  border-top: 1px solid rgba(212, 175, 55, 0.12);
}
.approve-summary {
  padding: 14px 16px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  margin-bottom: 14px;

  .summary-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 18px;
    padding: 6px 0;

    & + .summary-row {
      border-top: 1px dashed rgba(212, 175, 55, 0.12);
    }

    .lab {
      font-size: 12px;
      color: var(--text-muted);
      letter-spacing: 0.04em;
    }
    .val {
      font-size: 13px;
      color: var(--text-primary);
      &.price {
        font-family: 'JetBrains Mono', monospace;
        font-size: 16px;
        font-weight: 700;
        color: var(--gold);
      }
    }
    .summary-tag {
      background: rgba(212, 175, 55, 0.08);
      border-color: rgba(212, 175, 55, 0.32);
      color: var(--gold);
      margin-right: 6px;
    }
  }
}
.approve-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: rgba(77, 163, 255, 0.08);
  border: 1px solid rgba(77, 163, 255, 0.3);
  border-radius: 6px;
  color: #4DA3FF;
  font-size: 12px;
}

/* ============== Detail Drawer ============== */
:deep(.detail-drawer .el-drawer) {
  background: linear-gradient(180deg, #14141C 0%, #1A1A24 100%);
}
:deep(.detail-drawer .el-drawer__header) {
  margin-bottom: 0;
  padding: 22px 24px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent);
  color: var(--gold);
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
:deep(.detail-drawer .el-drawer__body) {
  padding: 18px 24px 32px;
}
.detail-block {
  margin-bottom: 22px;
  padding: 18px 20px;
  background: rgba(212, 175, 55, 0.03);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 10px;
}
.block-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;

  .block-bar {
    width: 3px;
    height: 14px;
    background: var(--gold);
    border-radius: 1px;
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
  }
  .block-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    letter-spacing: 0.04em;
  }
}
.status-steps {
  padding: 8px 0 4px;
  :deep(.el-step__title), :deep(.el-step__head) { color: var(--text-body); }
  :deep(.el-step__title.is-process) { color: var(--gold); font-weight: 600; }
  :deep(.el-step__head.is-process) { color: var(--gold); border-color: var(--gold); }
}
.reject-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 16px;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.35);
  border-radius: 8px;
  color: #F56C6C;

  .reject-title {
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
  }
  .reject-content {
    font-size: 12px;
    color: rgba(245, 108, 108, 0.85);
  }
  .reject-type {
    display: inline-block;
    margin-right: 6px;
    padding: 0 6px;
    background: rgba(245, 108, 108, 0.18);
    border: 1px solid rgba(245, 108, 108, 0.45);
    border-radius: 3px;
    color: #FFB1B1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.04em;
  }
}
.deadline-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  padding: 12px 16px;
  background: rgba(77, 163, 255, 0.08);
  border: 1px solid rgba(77, 163, 255, 0.35);
  border-radius: 8px;
  color: #4DA3FF;

  :deep(.el-icon) { font-size: 22px; }

  .banner-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 600;
    color: #82BEFF;
    letter-spacing: 0.04em;
    margin-bottom: 2px;
  }
  .banner-sub {
    font-size: 12px;
    color: rgba(77, 163, 255, 0.78);
    letter-spacing: 0.02em;
  }

  &.is-overdue {
    background: rgba(245, 108, 108, 0.1);
    border-color: rgba(245, 108, 108, 0.5);
    color: #FF8F8F;
    animation: overdue-pulse 2s ease-in-out infinite;

    .banner-title { color: #FF8F8F; }
    .banner-sub { color: rgba(245, 108, 108, 0.85); }
  }
}
.linkage-card {
  border-color: rgba(102, 177, 255, 0.32) !important;
  background:
    linear-gradient(135deg, rgba(102, 177, 255, 0.06), rgba(212, 175, 55, 0.04)) !important;

  .time-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #82BEFF;
  }
  .linkage-icon { color: #4DA3FF; }
  .time-desc { color: rgba(178, 220, 255, 0.85); }
}
.block-level-tag { margin-left: 8px; }
.block-overdue-tag { margin-left: auto; }
.block-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(212, 175, 55, 0.55);
  letter-spacing: 0.04em;
  margin-left: 6px;
}
.chain-inline {
  margin-left: 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: rgba(212, 175, 55, 0.55);
  letter-spacing: 0.04em;
}
.val-overdue {
  color: #FF8F8F !important;
  font-weight: 600;
}

/* ============== Reject Dialog ============== */
:deep(.reject-dialog .el-dialog) {
  background: linear-gradient(180deg, #1A1216 0%, #1F1A24 100%);
  border: 1px solid rgba(245, 108, 108, 0.35);
  border-radius: 12px;
  box-shadow: 0 0 32px rgba(245, 108, 108, 0.18);
}
:deep(.reject-dialog .el-dialog__header) {
  padding: 20px 24px 14px;
  border-bottom: 1px solid rgba(245, 108, 108, 0.18);
  background: linear-gradient(90deg, rgba(245, 108, 108, 0.12), transparent);
  margin-right: 0;
}
:deep(.reject-dialog .el-dialog__title) {
  color: #FF8F8F;
  font-weight: 600;
  letter-spacing: 0.04em;
}
:deep(.reject-dialog .el-dialog__body) { padding: 18px 24px 4px; }
:deep(.reject-dialog .el-dialog__footer) {
  padding: 14px 24px 18px;
  border-top: 1px solid rgba(245, 108, 108, 0.18);
}
.reject-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 6px;
  color: #FF8F8F;
  font-size: 12px;
}
.audit-timeline {
  padding-left: 4px;

  :deep(.el-timeline-item__timestamp) {
    color: rgba(212, 175, 55, 0.55);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.06em;
  }
}
.time-card {
  padding: 10px 14px;
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.15);
  border-radius: 6px;

  .time-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
  }
  .time-desc {
    font-size: 12px;
    color: var(--text-body);
    line-height: 1.6;
  }
}
.emph {
  color: var(--gold);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
}

:deep(.detail-drawer .el-descriptions__label) {
  background: rgba(212, 175, 55, 0.06);
  color: var(--gold);
  font-weight: 500;
  letter-spacing: 0.02em;
}
:deep(.detail-drawer .el-descriptions__content) {
  color: var(--text-body);
  background: transparent;
}

/* ============== 统一后台浅色风格覆盖 ============== */
.order-bill {
  --gold: #2563eb;
  --gold-soft: #60a5fa;
  --gold-line: #e5e7eb;
  --bg-card: #fff;
  --bg-card-2: #f8fafc;
  --text-primary: #1f2937;
  --text-body: #4b5563;
  --text-muted: #6b7280;
  gap: 16px;
  padding: 20px 22px 36px;
  background: #f5f7fb;
}
.page-header {
  padding: 22px 24px;
  background: #fff;
  border: 1px solid var(--gold-line);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);

  &::before {
    display: none;
  }
}
.header-meta {
  gap: 10px;
  margin-bottom: 12px;
  font-family: inherit;
  letter-spacing: 0;
  color: var(--text-muted);

  .meta-tag {
    border: 0;
    border-radius: 999px;
    background: #eff6ff;
    color: var(--gold);
    letter-spacing: 0;
  }
  .meta-divider {
    background: var(--gold-line);
  }
  .meta-time {
    color: var(--text-muted);
  }
}
.page-title {
  gap: 10px;

  .title-cn {
    font-size: 24px;
    letter-spacing: 0;
    background: none;
    -webkit-text-fill-color: var(--text-primary);
    color: var(--text-primary);
  }
  .title-en {
    font-family: inherit;
    font-style: normal;
    font-size: 12px;
    color: var(--text-muted);
  }
}
.page-desc {
  color: var(--text-muted);
  letter-spacing: 0;
}
.header-actions {
  top: 24px;
  right: 24px;

  .primary-btn {
    border-color: var(--gold);
    background: var(--gold);
    color: #fff;
    box-shadow: none;

    &:hover {
      background: #1d4ed8;
      transform: none;
    }
  }
  .ghost-btn {
    background: #fff;
    border-color: var(--gold-line);
    color: var(--text-body);

    &:hover {
      background: #f8fafc;
      border-color: #bfdbfe;
      color: var(--gold);
    }
  }
}
.stat-row {
  gap: 12px;
}
.stat-card {
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--gold-line);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);

  &:hover {
    transform: none;
    border-color: #cbd5e1;
    box-shadow: 0 4px 10px rgba(15, 23, 42, .06);
  }
  &.active {
    border-color: #bfdbfe;
    box-shadow: 0 0 0 1px #bfdbfe inset;
  }
  .stat-index,
  .stat-label {
    letter-spacing: 0;
  }
  .stat-index {
    color: #94a3b8;
  }
  .stat-num {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    color: var(--text-primary);
  }
  .stat-bar {
    display: none;
  }
  &.theme-info,
  &.theme-warning,
  &.theme-primary,
  &.theme-success,
  &.theme-danger,
  &.theme-gold {
    .stat-num {
      font-size: 26px;
    }
  }
  &.theme-warning .stat-num { color: #d97706; }
  &.theme-primary .stat-num { color: #2563eb; }
  &.theme-success .stat-num { color: #16a34a; }
  &.theme-danger .stat-num { color: #dc2626; }
  &.theme-gold .stat-num { color: #0f766e; }
}
.tab-strip,
.table-wrap,
.form-section,
.form-section.split-section .split-col,
.detail-block,
.approve-summary,
.time-card {
  background: #fff;
  border-color: var(--gold-line);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.tab-strip {
  padding: 0 16px;
}
:deep(.status-tabs .el-tabs__nav-wrap::after) {
  background: var(--gold-line);
}
:deep(.status-tabs .el-tabs__item) {
  color: var(--text-muted);
}
:deep(.status-tabs .el-tabs__item.is-active) {
  color: var(--gold);
}
:deep(.status-tabs .el-tabs__active-bar) {
  background: var(--gold);
  box-shadow: none;
}
.tab-label .tab-badge {
  background: #f1f5f9;
  border-color: #e2e8f0;
  color: var(--text-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.order-table,
.items-table {
  --el-table-bg-color: #fff;
  --el-table-tr-bg-color: #fff;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f9fafb;
  --el-table-border-color: var(--gold-line);
  --el-table-text-color: var(--text-body);
  --el-table-header-text-color: #374151;
}
.order-no,
.level-chain,
.deadline-muted,
.amount-cell .amount-value,
.cell-final,
.emph,
.chain-inline,
.block-meta {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0;
}
.order-no,
.amount-cell .amount-value,
.cell-final,
.emph {
  color: var(--gold);
}
.service-summary .service-tag {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: var(--gold);
}
.level-chain,
.block-meta,
.chain-inline {
  color: #64748b;
}
.deadline-cell .deadline-time,
.deadline-cell .deadline-remain {
  letter-spacing: 0;
}
.form-tip,
.approve-tip,
.deadline-banner {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: var(--gold);
}
.items-summary-bar {
  background: #f8fafc;
  border-color: var(--gold-line);
  color: var(--text-body);
  letter-spacing: 0;

  .sum-chip {
    background: #fff;
    border-color: var(--gold-line);
    border-radius: 6px;

    b {
      color: var(--gold);
      letter-spacing: 0;
    }
  }
}
.section-head .section-bar,
.block-head .block-bar {
  background: var(--gold);
  box-shadow: none;
}
.section-head .section-title,
.block-head .block-title,
.time-card .time-title {
  color: var(--text-primary);
  letter-spacing: 0;
}
.section-head .section-en {
  color: #94a3b8;
  letter-spacing: 0;
}
.upload-placeholder {
  background: #f8fafc;
  border-color: #cbd5e1;
  color: var(--text-muted);

  &:hover {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: var(--gold);
  }
}
:deep(.order-dialog .el-dialog),
:deep(.approve-dialog .el-dialog),
:deep(.reject-dialog .el-dialog) {
  background: #fff;
  border: 1px solid var(--gold-line);
  border-radius: 8px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, .16);
}
:deep(.order-dialog .el-dialog__header),
:deep(.approve-dialog .el-dialog__header),
:deep(.reject-dialog .el-dialog__header) {
  background: #fff;
  border-bottom: 1px solid var(--gold-line);
}
:deep(.order-dialog .el-dialog__title),
:deep(.approve-dialog .el-dialog__title),
:deep(.reject-dialog .el-dialog__title) {
  color: var(--text-primary);
  letter-spacing: 0;
}
:deep(.order-dialog .el-dialog__footer),
:deep(.approve-dialog .el-dialog__footer),
:deep(.reject-dialog .el-dialog__footer) {
  border-top: 1px solid var(--gold-line);
}
:deep(.detail-drawer .el-drawer) {
  background: #f5f7fb;
}
:deep(.detail-drawer .el-drawer__header) {
  background: #fff;
  border-bottom: 1px solid var(--gold-line);
  color: var(--text-primary);
  letter-spacing: 0;
}
:deep(.detail-drawer .el-descriptions__label) {
  background: #f8fafc;
  color: #374151;
  letter-spacing: 0;
}
:deep(.detail-drawer .el-descriptions__content) {
  background: #fff;
  color: var(--text-body);
}
.audit-timeline :deep(.el-timeline-item__timestamp) {
  color: #64748b;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0;
}
.linkage-card {
  background: #f8fafc !important;
  border-color: #bfdbfe !important;

  .time-title,
  .time-desc,
  .linkage-icon {
    color: var(--gold);
  }
}

/* ============== Responsive ============== */
@media (max-width: 1400px) {
  .stat-row { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 900px) {
  .stat-row { grid-template-columns: repeat(2, 1fr); }
  .form-section.split-section { grid-template-columns: 1fr; }
  .header-actions { position: static; margin-top: 14px; }
}
</style>

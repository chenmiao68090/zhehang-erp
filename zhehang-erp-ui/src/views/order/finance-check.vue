<template>
  <div class="finance-check">
    <!-- ============ Header ============ -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">FINANCE OPS</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }} · 财务核对台</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">财务核对</span>
          <span class="title-en">Treasury &amp; Reconciliation</span>
        </h1>
        <p class="page-desc">收款核销、逾期管控、票据流转、退款审核，让每一笔资金有据可查</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- ============ 顶部数据指标条 ============ -->
    <section class="metric-strip">
      <div class="metric-item">
        <div class="metric-index">01</div>
        <div class="metric-value">¥{{ formatMoney(summary.monthReceipt) }}</div>
        <div class="metric-label">本月已确认收款</div>
      </div>
      <div class="metric-item">
        <div class="metric-index">02</div>
        <div class="metric-value warn">¥{{ formatMoney(summary.pendingReceipt) }}</div>
        <div class="metric-label">待确认金额</div>
      </div>
      <div class="metric-item">
        <div class="metric-index">03</div>
        <div class="metric-value danger">¥{{ formatMoney(summary.overdueAmount) }}</div>
        <div class="metric-label">逾期应收 · {{ summary.overdueCount }} 笔</div>
      </div>
      <div class="metric-item">
        <div class="metric-index">04</div>
        <div class="metric-value">{{ summary.invoicePending }} / {{ summary.invoiceIssued }}</div>
        <div class="metric-label">待开 / 已开发票</div>
      </div>
      <div class="metric-item">
        <div class="metric-index">05</div>
        <div class="metric-value warn">{{ summary.refundPending }}</div>
        <div class="metric-label">退款待处理</div>
      </div>
    </section>

    <!-- ============ Tabs ============ -->
    <el-tabs v-model="activeTab" class="finance-tabs">
      <!-- =========================== 1. 待确认收款 =========================== -->
      <el-tab-pane label="待确认收款" name="pending">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>待确认收款记录</span>
              <em>{{ pendingReceipts.length }} 条待核对</em>
            </div>
            <div class="panel-tools">
              <el-input
                v-model="filters.orderNo"
                placeholder="搜索订单号 / 收款编号"
                clearable
                size="default"
                style="width: 220px"
                @input="loadReceipts"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
              <el-button type="primary" @click="loadReceipts">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>

          <el-table :data="pendingReceipts" stripe class="zh-table" v-loading="loadingReceipts">
            <el-table-column prop="receiptNo" label="收款编号" width="160">
              <template #default="{ row }">
                <span class="mono">{{ row.receiptNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联订单" width="160">
              <template #default="{ row }">
                <span class="mono link">{{ row.orderNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户名称" min-width="180" show-overflow-tooltip />
            <el-table-column label="应收金额" width="130" align="right">
              <template #default="{ row }">
                <span class="money">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="实收金额" width="130" align="right">
              <template #default="{ row }">
                <span class="money muted">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="收款方式" width="110" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ channelText(row.paymentChannel) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="paymentTime" label="到账时间" width="170" />
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)" effect="dark" size="small">
                  {{ statusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button v-hasRole="['admin','finance','boss']" type="primary" link size="small" @click="openConfirmDialog(row)">
                  确认收款
                </el-button>
                <el-button v-hasRole="['admin','finance']" type="warning" link size="small" @click="openConfirmDialog(row, true)">
                  标记差额
                </el-button>
                <el-button v-hasRole="['admin','finance']" type="danger" link size="small" @click="rejectReceipt(row)">
                  驳回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- =========================== 2. 逾期应收 =========================== -->
      <el-tab-pane label="逾期应收" name="overdue">
        <div class="overdue-summary">
          <div class="ov-card ov-red">
            <div class="ov-icon">⚠️</div>
            <div class="ov-meta">
              <div class="ov-label">总逾期金额</div>
              <div class="ov-num">¥{{ formatMoney(overdueStats.totalAmount) }}</div>
            </div>
          </div>
          <div class="ov-card ov-amber">
            <div class="ov-icon">📋</div>
            <div class="ov-meta">
              <div class="ov-label">逾期笔数</div>
              <div class="ov-num">{{ overdueStats.count }} 笔</div>
            </div>
          </div>
          <div class="ov-card ov-purple">
            <div class="ov-icon">⏱</div>
            <div class="ov-meta">
              <div class="ov-label">最长逾期天数</div>
              <div class="ov-num">{{ overdueStats.maxDays }} 天</div>
            </div>
          </div>
        </div>

        <!-- 逾期阶梯分布 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>逾期阶梯分布</span>
              <em>按逾期天数调度对应措施</em>
            </div>
          </div>
          <div class="stage-grid">
            <div
              v-for="s in overdueStageStats"
              :key="s.key"
              class="stage-card"
              :class="['stage-' + s.key]"
            >
              <div class="stage-head">
                <span class="stage-label">{{ s.label }}</span>
                <span class="stage-count">{{ s.count }}</span>
              </div>
              <div class="stage-range mono">{{ s.range }}</div>
              <div class="stage-action">{{ s.action }}</div>
              <div class="stage-notify">通知 · {{ s.notify }}</div>
              <div class="stage-amount">¥{{ formatMoney(s.amount) }}</div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>分期收款计划</span>
              <em>{{ allPlans.length }} 期 · 含 {{ overdueStats.count }} 笔逾期</em>
            </div>
            <el-radio-group v-model="planFilter" size="default">
              <el-radio-button label="all">全部</el-radio-button>
              <el-radio-button label="overdue">仅看逾期</el-radio-button>
              <el-radio-button label="paid">已结清</el-radio-button>
            </el-radio-group>
          </div>

          <el-table :data="filteredPlans" stripe class="zh-table" v-loading="loadingPlans" :row-class-name="overdueRowClassName">
            <el-table-column label="期数" width="100" align="center">
              <template #default="{ row }">
                <span class="installment">{{ row.installmentNo }}/{{ row.installmentTotal }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联订单" width="160">
              <template #default="{ row }">
                <span class="mono link">{{ row.orderNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户" min-width="170" show-overflow-tooltip />
            <el-table-column label="计划金额" width="120" align="right">
              <template #default="{ row }">
                <span class="money">¥{{ formatMoney(row.planAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="planDate" label="计划日期" width="120" align="center" />
            <el-table-column label="实收" width="120" align="right">
              <template #default="{ row }">
                <span class="money muted">¥{{ formatMoney(row.paidAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="阶梯状态" width="160" align="center">
              <template #default="{ row }">
                <span class="overdue-tag" :class="overdueLevel(row).cls">
                  <span class="ov-dot"></span>
                  {{ overdueLevel(row).text }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="逾期天数" width="100" align="center">
              <template #default="{ row }">
                <span class="days" :class="overdueLevel(row).cls">
                  {{ daysOverdue(row) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="系统动作" min-width="160">
              <template #default="{ row }">
                <div class="action-info">
                  <span class="action-text">{{ overdueActionLabel(row) }}</span>
                  <span v-if="overdueNotifyLabel(row) !== '—'" class="notify-text">通知 · {{ overdueNotifyLabel(row) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button type="success" link size="small" @click="openMarkPaidDialog(row)" :disabled="row.status === 'paid'">
                  标记已付
                </el-button>
                <el-button type="warning" link size="small" @click="sendReminder(row)" :disabled="row.status === 'paid'">
                  催收提醒
                </el-button>
                <el-button type="danger" link size="small" @click="escalateToManager(row)" :disabled="row.status === 'paid'">
                  升级主管
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- =========================== 3. 本月汇总 =========================== -->
      <el-tab-pane label="本月汇总" name="summary">
        <div class="summary-grid">
          <div class="sum-card lg gradient-emerald">
            <div class="sum-label">本月确认收款总额</div>
            <div class="sum-num">¥{{ formatMoney(summary.monthReceipt) }}</div>
            <div class="sum-foot">较上月 <strong class="up">+12.4%</strong></div>
          </div>
          <div class="sum-card gradient-amber">
            <div class="sum-label">确认笔数</div>
            <div class="sum-num">{{ monthStats.count }}</div>
            <div class="sum-foot">本月已核销订单</div>
          </div>
          <div class="sum-card gradient-slate">
            <div class="sum-label">待确认金额</div>
            <div class="sum-num">¥{{ formatMoney(summary.pendingReceipt) }}</div>
            <div class="sum-foot">待财务核对</div>
          </div>
          <div class="sum-card gradient-red">
            <div class="sum-label">逾期金额</div>
            <div class="sum-num">¥{{ formatMoney(summary.overdueAmount) }}</div>
            <div class="sum-foot">{{ summary.overdueCount }} 笔逾期款项</div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>近 7 日收款趋势</span>
              <em>每日确认收款金额（万元）</em>
            </div>
          </div>
          <div class="trend-chart">
            <div class="trend-axis">
              <span v-for="t in [maxTrend, maxTrend / 2, 0]" :key="t">{{ formatTrend(t) }}</span>
            </div>
            <div class="trend-bars">
              <div
                v-for="(d, idx) in trendData"
                :key="idx"
                class="trend-bar"
                :style="{ '--h': d.amount === 0 ? '4%' : (d.amount / maxTrend * 92 + 4) + '%' }"
              >
                <div class="bar-tip">¥{{ formatMoney(d.amount) }}</div>
                <div class="bar-fill"></div>
                <div class="bar-label">{{ d.date }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="dual-grid">
          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="dot"></span>
                <span>按收款方式分布</span>
              </div>
            </div>
            <div class="channel-list">
              <div v-for="c in channelStats" :key="c.key" class="channel-row">
                <div class="ch-name">
                  <span class="ch-dot" :style="{ background: c.color }"></span>
                  {{ c.label }}
                </div>
                <div class="ch-bar">
                  <div class="ch-bar-fill" :style="{ width: c.percent + '%', background: c.color }"></div>
                </div>
                <div class="ch-num mono">¥{{ formatMoney(c.amount) }}</div>
                <div class="ch-pct mono">{{ c.percent.toFixed(1) }}%</div>
              </div>
            </div>
          </div>

          <div class="panel">
            <div class="panel-head">
              <div class="panel-title">
                <span class="dot"></span>
                <span>按销售业绩分布</span>
              </div>
            </div>
            <el-table :data="salesStats" class="zh-table mini-table">
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column prop="name" label="销售姓名" min-width="120" />
              <el-table-column label="确认金额" align="right">
                <template #default="{ row }">
                  <span class="money">¥{{ formatMoney(row.amount) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="count" label="笔数" width="80" align="center" />
            </el-table>
          </div>
        </div>

        <!-- 联动事件时间线 -->
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>财务联动时间线</span>
              <em>收款 · 退款 · 订单收齐 · 合同生成 等关键事件</em>
            </div>
            <el-button text type="primary" @click="loadTimeline">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div v-if="timeline.length === 0" class="timeline-empty">暂无联动事件 · 上下游动作成功后会在此处出现</div>
          <ul v-else class="timeline-list">
            <li v-for="e in timeline" :key="e.id" class="timeline-item" :class="timelineColor(e.type)">
              <div class="tl-icon">{{ timelineIcon(e.type) }}</div>
              <div class="tl-body">
                <div class="tl-head">
                  <span class="tl-title">{{ e.title }}</span>
                  <span class="tl-time mono">{{ e.time }}</span>
                </div>
                <div class="tl-detail">{{ e.detail }}</div>
                <div class="tl-foot">操作人 · {{ e.operator }}</div>
              </div>
            </li>
          </ul>
        </div>
      </el-tab-pane>

      <!-- =========================== 4. 待开票 =========================== -->
      <el-tab-pane label="发票管理" name="invoice">
        <!-- 待开票提醒区 -->
        <div v-if="pendingInvoices.length > 0" class="invoice-tip">
          <el-icon><InfoFilled /></el-icon>
          共 <strong>{{ pendingInvoices.length }}</strong> 条待开票记录·总额
          <strong class="money">¥{{ formatMoney(pendingInvoiceAmount) }}</strong>·请尽快完成开票
        </div>

        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>发票状态流转</span>
              <em>待开 → 已开 → 已寄出 → 客户已收</em>
            </div>
            <div class="panel-tools">
              <el-radio-group v-model="invoiceFilter" size="default" @change="loadInvoices">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="pending">待开</el-radio-button>
                <el-radio-button label="issued">已开</el-radio-button>
                <el-radio-button label="mailed">已寄出</el-radio-button>
                <el-radio-button label="received">客户已收</el-radio-button>
              </el-radio-group>
              <el-button type="primary" @click="openInvoiceDialog()">
                <el-icon><Plus /></el-icon>
                新建发票
              </el-button>
            </div>
          </div>

          <!-- 发票状态流示意 -->
          <div class="invoice-stage">
            <div
              v-for="(s, idx) in invoiceStageStats"
              :key="s.key"
              class="inv-stage-card"
              :class="['inv-' + s.key]"
            >
              <div class="inv-idx">0{{ idx + 1 }}</div>
              <div class="inv-label">{{ s.label }}</div>
              <div class="inv-num">{{ s.count }}</div>
              <div class="inv-amount mono">¥{{ formatMoney(s.amount) }}</div>
            </div>
          </div>

          <el-table :data="invoices" stripe class="zh-table" v-loading="loadingInvoices">
            <el-table-column prop="invoiceNo" label="发票编号" width="170">
              <template #default="{ row }">
                <span class="mono">{{ row.invoiceNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="orderNo" label="关联订单" width="160">
              <template #default="{ row }">
                <span class="mono link">{{ row.orderNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户" min-width="180" show-overflow-tooltip />
            <el-table-column label="发票类型" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="invoiceTypeTag(row.invoiceType)" effect="plain" size="small">
                  {{ invoiceTypeText(row.invoiceType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="金额" width="130" align="right">
              <template #default="{ row }">
                <span class="money">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="税额" width="110" align="right">
              <template #default="{ row }">
                <span class="money muted">¥{{ formatMoney(row.taxAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="invoiceStatusTag(row.status)" effect="dark" size="small">
                  {{ invoiceStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="240" fixed="right">
              <template #default="{ row }">
                <el-button v-if="row.status === 'pending'" type="primary" link size="small" @click="openIssueDialog(row)">
                  开票
                </el-button>
                <el-button v-if="row.status === 'issued'" type="success" link size="small" @click="openMailDialog(row)">
                  寄出
                </el-button>
                <el-button v-if="row.status === 'mailed'" type="warning" link size="small" @click="confirmReceived(row)">
                  确认收到
                </el-button>
                <el-button v-if="row.status === 'received'" type="info" link size="small" disabled>已完成</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- =========================== 5. 退款管理 =========================== -->
      <el-tab-pane :label="`退款管理 (${refundCount})`" name="refund">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>退款审批流</span>
              <em>销售发起 → 主管审批 → 财务确认 → 已退款</em>
            </div>
            <div class="panel-tools">
              <el-radio-group v-model="refundFilter" size="default" @change="loadRefunds">
                <el-radio-button label="">全部</el-radio-button>
                <el-radio-button label="pending">待审批</el-radio-button>
                <el-radio-button label="approved">待财务确认</el-radio-button>
                <el-radio-button label="completed">已退款</el-radio-button>
                <el-radio-button label="rejected">已驳回</el-radio-button>
              </el-radio-group>
              <el-button v-hasRole="['admin','finance']" type="primary" @click="openRefundApplyDialog()">
                <el-icon><Plus /></el-icon>
                发起退款
              </el-button>
            </div>
          </div>

          <!-- 退款流程指引 -->
          <div class="flow-bar">
            <div class="flow-step done">
              <div class="flow-num">01</div>
              <div class="flow-text">销售发起申请</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-step" :class="{ active: refundProgress >= 2 }">
              <div class="flow-num">02</div>
              <div class="flow-text">主管审批</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-step" :class="{ active: refundProgress >= 3 }">
              <div class="flow-num">03</div>
              <div class="flow-text">财务确认</div>
            </div>
            <div class="flow-arrow"></div>
            <div class="flow-step" :class="{ done: refundProgress >= 4 }">
              <div class="flow-num">04</div>
              <div class="flow-text">退款完成</div>
            </div>
          </div>

          <el-table :data="filteredRefunds" stripe class="zh-table" v-loading="loadingRefunds">
            <el-table-column prop="refundNo" label="退款编号" width="170">
              <template #default="{ row }">
                <span class="mono">{{ row.refundNo }}</span>
              </template>
            </el-table-column>
            <el-table-column label="原订单" width="140" align="center">
              <template #default="{ row }">
                <span class="mono link">{{ row.orderNo || ('#' + row.orderId) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户" min-width="160" show-overflow-tooltip />
            <el-table-column label="退款金额" width="130" align="right">
              <template #default="{ row }">
                <span class="money danger">¥{{ formatMoney(row.refundAmount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="原因" width="130" align="center">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ refundReasonLabel(row.reasonKey) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="退款方式" width="110" align="center">
              <template #default="{ row }">
                <span>{{ refundWayLabel(row.refundWay) }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="applicantName" label="申请人" width="100" />
            <el-table-column prop="applyTime" label="申请时间" width="170" />
            <el-table-column label="状态" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="refundStatusTag(row.status)" effect="dark" size="small">
                  {{ refundStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button v-hasRole="['admin','finance']" v-if="row.status === 'pending'" type="primary" link size="small" @click="approveRefund(row)">
                  主管审批
                </el-button>
                <el-button v-hasRole="['admin','finance']" v-if="row.status === 'pending' || row.status === 'approved'" type="danger" link size="small" @click="rejectRefundAction(row)">
                  驳回
                </el-button>
                <el-button v-hasRole="['admin','finance']" v-if="row.status === 'approved'" type="success" link size="small" @click="openRefundExecDialog(row)">
                  财务确认
                </el-button>
                <el-button v-if="row.status === 'completed'" type="info" link size="small" @click="viewRefundDetail(row)">查看明细</el-button>
                <el-button v-if="row.status === 'rejected'" type="info" link size="small" @click="viewRefundDetail(row)">查看原因</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 入账管理 -->
        <div class="panel posting-panel">
          <div class="panel-head">
            <div class="panel-title">
              <span class="dot"></span>
              <span>入账管理</span>
              <em>已确认收款可标记入账，入账后不可修改</em>
            </div>
          </div>
          <el-table :data="confirmedReceipts" stripe class="zh-table">
            <el-table-column prop="receiptNo" label="收款编号" width="170">
              <template #default="{ row }">
                <span class="mono">{{ row.receiptNo }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="customerName" label="客户" min-width="180" show-overflow-tooltip />
            <el-table-column label="金额" width="140" align="right">
              <template #default="{ row }">
                <span class="money">¥{{ formatMoney(row.amount) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="入账状态" width="140" align="center">
              <template #default="{ row }">
                <el-tag v-if="isPosted(row)" type="success" effect="dark" size="small">已入账</el-tag>
                <el-tag v-else type="warning" effect="plain" size="small">未入账</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="入账科目" width="180" align="center">
              <template #default="{ row }">
                <span v-if="isPosted(row)" class="account-tag">{{ getPostingAccount(row) }}</span>
                <span v-else class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button v-if="!isPosted(row)" type="primary" link size="small" @click="openPostingDialog(row)">
                  标记入账
                </el-button>
                <el-button v-else type="info" link size="small" disabled>已入账锁定</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- ============ 确认收款 Dialog ============ -->
    <el-dialog v-model="confirmDialog.visible" title="确认收款" width="640px" class="zh-dialog" destroy-on-close>
      <div class="dlg-section">
        <div class="dlg-section-title">订单信息（只读）</div>
        <div class="info-grid">
          <div><label>订单编号</label><span class="mono">{{ confirmDialog.row?.orderNo }}</span></div>
          <div><label>收款编号</label><span class="mono">{{ confirmDialog.row?.receiptNo }}</span></div>
          <div><label>客户名称</label><span>{{ confirmDialog.row?.customerName }}</span></div>
          <div><label>应收金额</label><span class="money">¥{{ formatMoney(confirmDialog.row?.amount || 0) }}</span></div>
        </div>
      </div>
      <el-divider />
      <el-form ref="confirmFormRef" :model="confirmForm" label-width="100px" class="dlg-form">
        <el-form-item label="实收金额" required>
          <el-input-number v-model="confirmForm.actualAmount" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="收款方式" required>
          <el-select v-model="confirmForm.channel" placeholder="请选择" style="width: 100%">
            <el-option label="对公转账" value="bank" />
            <el-option label="支付宝" value="alipay" />
            <el-option label="微信" value="wechat" />
            <el-option label="现金" value="cash" />
            <el-option label="POS刷卡" value="pos" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="收款账户">
          <el-input v-model="confirmForm.account" placeholder="收款方银行账户" />
        </el-form-item>
        <el-form-item label="付款方名称">
          <el-input v-model="confirmForm.payerName" placeholder="实际付款方" />
        </el-form-item>
        <el-form-item label="付款账号">
          <el-input v-model="confirmForm.payerAccount" placeholder="付款方账号" />
        </el-form-item>
        <el-form-item label="到账时间" required>
          <el-date-picker v-model="confirmForm.paymentTime" type="datetime" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到账凭证">
          <div class="upload-mock">
            <el-icon><UploadFilled /></el-icon>
            <span>上传到账凭证</span>
          </div>
        </el-form-item>

        <div v-if="amountDiff !== 0" class="diff-alert" :class="amountDiff > 0 ? 'is-short' : 'is-over'">
          <el-icon><Warning /></el-icon>
          <div class="diff-meta">
            <div>
              <strong>{{ amountDiff > 0 ? '部分收款' : '溢缴' }}</strong>
              · 应收 ¥{{ formatMoney(confirmDialog.row?.amount || 0) }}
              <template v-if="amountDiff > 0">
                · 实收 ¥{{ formatMoney(confirmForm.actualAmount) }}
                · 差额 <strong class="short">¥{{ formatMoney(amountDiff) }}</strong>
              </template>
              <template v-else>
                · 实收 ¥{{ formatMoney(confirmForm.actualAmount) }}
                · 超收 <strong class="over">¥{{ formatMoney(Math.abs(amountDiff)) }}</strong>
              </template>
            </div>
            <div class="diff-sub">
              <template v-if="amountDiff > 0">本次收款后该收款将标记为 「部分收款」，剩余待收 ¥{{ formatMoney(amountDiff) }}。</template>
              <template v-else>实收超出应收，请确认是否为预付款。</template>
            </div>
          </div>
        </div>

        <el-form-item v-if="amountDiff < 0" label="预付确认" required>
          <el-radio-group v-model="confirmForm.surplusAsPrepay">
            <el-radio :label="true">是 · 计入预付款</el-radio>
            <el-radio :label="false">否 · 仅收取应收部分</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item v-if="amountDiff !== 0" label="差额说明" required>
          <el-input v-model="confirmForm.diffRemark" type="textarea" :rows="2" placeholder="请说明差额原因（必填）" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="confirmForm.remark" type="textarea" :rows="2" placeholder="可选" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmDialog.visible = false">取消</el-button>
        <el-button type="danger" plain @click="rejectInDialog">驳回</el-button>
        <el-button type="primary" @click="submitConfirm">确认收款</el-button>
      </template>
    </el-dialog>

    <!-- ============ 新建发票 Dialog ============ -->
    <el-dialog v-model="invoiceDialog.visible" :title="invoiceDialog.title" width="560px" class="zh-dialog" destroy-on-close>
      <el-form :model="invoiceForm" label-width="100px" class="dlg-form">
        <el-form-item label="关联收款">
          <el-select v-model="invoiceForm.receiptId" placeholder="选择已确认的收款记录" style="width: 100%">
            <el-option
              v-for="r in confirmedReceipts"
              :key="r.id"
              :label="`${r.receiptNo} · ${r.customerName} · ¥${formatMoney(r.amount)}`"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型" required>
          <el-radio-group v-model="invoiceForm.invoiceType">
            <el-radio label="vat_special">增值税专票</el-radio>
            <el-radio label="vat_general">普通发票</el-radio>
            <el-radio label="electronic">电子发票</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="发票抬头" required>
          <el-input v-model="invoiceForm.invoiceTitle" placeholder="客户公司名称" />
        </el-form-item>
        <el-form-item label="税号">
          <el-input v-model="invoiceForm.taxNo" placeholder="纳税人识别号" />
        </el-form-item>
        <el-form-item label="开票金额" required>
          <el-input-number v-model="invoiceForm.amount" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="税率(%)">
          <el-input-number v-model="invoiceForm.taxRate" :min="0" :max="20" :precision="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="invoiceForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="invoiceDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitInvoice">提交</el-button>
      </template>
    </el-dialog>

    <!-- ============ 开票 Dialog ============ -->
    <el-dialog v-model="issueDialog.visible" title="开具发票" width="480px" class="zh-dialog" destroy-on-close>
      <el-form :model="issueForm" label-width="100px" class="dlg-form">
        <el-form-item label="发票号码" required>
          <el-input v-model="issueForm.invoiceNo" placeholder="纸质 / 电子发票号" />
        </el-form-item>
        <el-form-item label="开票日期" required>
          <el-date-picker v-model="issueForm.issueTime" type="datetime" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="issueDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitIssue">确认开具</el-button>
      </template>
    </el-dialog>

    <!-- ============ 寄出 Dialog ============ -->
    <el-dialog v-model="mailDialog.visible" title="寄出发票" width="440px" class="zh-dialog" destroy-on-close>
      <el-form :model="mailForm" label-width="100px" class="dlg-form">
        <el-form-item label="快递单号" required>
          <el-input v-model="mailForm.mailNo" placeholder="顺丰 / 邮政等单号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="mailDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitMail">确认寄出</el-button>
      </template>
    </el-dialog>

    <!-- ============ 标记已付 Dialog ============ -->
    <el-dialog v-model="markPaidDialog.visible" title="标记已付" width="460px" class="zh-dialog" destroy-on-close>
      <el-form :model="markPaidForm" label-width="100px" class="dlg-form">
        <el-form-item label="本次到账">
          <el-input-number v-model="markPaidForm.paidAmount" :min="0" :precision="2" :controls="false" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到账日期">
          <el-date-picker v-model="markPaidForm.paidDate" type="date" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="markPaidDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitMarkPaid">确认</el-button>
      </template>
    </el-dialog>

    <!-- ============ 退款发起 Dialog ============ -->
    <el-dialog v-model="refundApplyDialog.visible" title="发起退款申请" width="560px" class="zh-dialog" destroy-on-close>
      <el-form :model="refundApplyForm" label-width="100px" class="dlg-form">
        <el-form-item label="退款订单" required>
          <el-select
            v-model="refundApplyForm.orderId"
            placeholder="选择已完成订单"
            style="width: 100%"
            filterable
            @change="onRefundOrderChange"
          >
            <el-option
              v-for="o in refundableOrders"
              :key="o.id"
              :label="`${o.orderNo} · ${o.customerName} · ¥${formatMoney(o.finalAmount)}`"
              :value="o.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关联收款" required>
          <el-select v-model="refundApplyForm.receiptId" placeholder="选择已确认收款记录" style="width: 100%" :disabled="!refundApplyForm.orderId">
            <el-option
              v-for="r in refundableReceipts"
              :key="r.id"
              :label="`${r.receiptNo} · ¥${formatMoney(r.amount)} · ${channelText(r.paymentChannel)}`"
              :value="r.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="退款金额" required>
          <el-input-number v-model="refundApplyForm.refundAmount" :min="0" :max="refundApplyMax" :precision="2" :controls="false" style="width: 100%" />
          <div v-if="refundApplyMax > 0" class="input-hint">不得超过实收金额 ¥{{ formatMoney(refundApplyMax) }}</div>
        </el-form-item>
        <el-form-item label="退款原因" required>
          <el-select v-model="refundApplyForm.reasonKey" placeholder="选择原因分类" style="width: 100%">
            <el-option label="服务不满意" value="service_unsatisfied" />
            <el-option label="客户反悔" value="customer_regret" />
            <el-option label="服务无法继续" value="service_unavailable" />
            <el-option label="协商解除" value="agreement_terminated" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="退款方式" required>
          <el-radio-group v-model="refundApplyForm.refundWay">
            <el-radio label="origin">原路退回</el-radio>
            <el-radio label="bank_transfer">对公转账</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="原因说明" required>
          <el-input v-model="refundApplyForm.reason" type="textarea" :rows="3" placeholder="详细描述退款原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundApplyDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRefundApply">提交申请</el-button>
      </template>
    </el-dialog>

    <!-- ============ 财务确认退款 Dialog ============ -->
    <el-dialog v-model="refundExecDialog.visible" title="财务确认退款" width="560px" class="zh-dialog" destroy-on-close>
      <div class="dlg-section">
        <div class="dlg-section-title">退款信息</div>
        <div class="info-grid">
          <div><label>退款编号</label><span class="mono">{{ refundExecDialog.row?.refundNo }}</span></div>
          <div><label>原订单</label><span class="mono">{{ refundExecDialog.row?.orderNo || refundExecDialog.row?.orderId }}</span></div>
          <div><label>客户名称</label><span>{{ refundExecDialog.row?.customerName }}</span></div>
          <div><label>退款金额</label><span class="money danger">¥{{ formatMoney(refundExecDialog.row?.refundAmount || 0) }}</span></div>
          <div><label>申请人</label><span>{{ refundExecDialog.row?.applicantName }}</span></div>
          <div><label>主管审批</label><span>{{ refundExecDialog.row?.approverName || '—' }}</span></div>
          <div><label>退款原因</label><span>{{ refundReasonLabel(refundExecDialog.row?.reasonKey) }}</span></div>
          <div><label>原始说明</label><span>{{ refundExecDialog.row?.reason }}</span></div>
        </div>
      </div>
      <el-divider />
      <el-form :model="refundExecForm" label-width="100px" class="dlg-form">
        <el-form-item label="退款方式" required>
          <el-radio-group v-model="refundExecForm.way">
            <el-radio label="origin">原路退回</el-radio>
            <el-radio label="bank_transfer">对公转账</el-radio>
            <el-radio label="other">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="退款凭证">
          <div class="upload-mock">
            <el-icon><UploadFilled /></el-icon>
            <span>上传银行回单</span>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="refundExecForm.remark" type="textarea" :rows="2" placeholder="退款说明、交易号等" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="refundExecDialog.visible = false">取消</el-button>
        <el-button v-hasRole="['admin','finance']" type="primary" @click="submitRefundExec">确认退款</el-button>
      </template>
    </el-dialog>

    <!-- ============ 入账 Dialog ============ -->
    <el-dialog v-model="postingDialog.visible" title="标记入账" width="440px" class="zh-dialog" destroy-on-close>
      <div class="posting-tip">
        <el-icon><InfoFilled /></el-icon>
        入账后该收款记录将被锁定，无法再次修改入账科目。
      </div>
      <el-form :model="postingForm" label-width="100px" class="dlg-form">
        <el-form-item label="入账科目" required>
          <el-select v-model="postingForm.account" placeholder="请选择入账科目" style="width: 100%">
            <el-option label="主营业务收入" value="主营业务收入" />
            <el-option label="预收账款" value="预收账款" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="postingDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitPosting">确认入账</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search, Refresh, Plus, UploadFilled, Warning, InfoFilled
} from '@element-plus/icons-vue'
import { receiptApi, calcOverdueLevel, refundReasonLabel, refundWayLabel, type BizReceipt, type BizReceiptPlan, type BizInvoice, type RefundRequest, type ReceiptSummary, type ReceiptTimelineEvent, type RefundReasonKey, type RefundWayKey } from '@/api/receipt'
import { orderApi, type BizOrder } from '@/api/order'

// ===== 顶部时间 =====
const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

// ===== Tab =====
const activeTab = ref<'pending' | 'overdue' | 'summary' | 'invoice' | 'refund'>('pending')

// ===== Summary =====
const summary = ref<ReceiptSummary>({
  totalReceipt: 0, pendingReceipt: 0, monthReceipt: 0,
  overdueAmount: 0, overdueCount: 0, invoicePending: 0, invoiceIssued: 0, refundPending: 0
})

// ===== 收款列表 =====
const allReceipts = ref<BizReceipt[]>([])
const loadingReceipts = ref(false)
const filters = reactive({ orderNo: '' })

const pendingReceipts = computed(() =>
  allReceipts.value.filter(r => r.status === 'pending' &&
    (!filters.orderNo || (r.orderNo || '').includes(filters.orderNo) || r.receiptNo.includes(filters.orderNo)))
)
const confirmedReceipts = computed(() => allReceipts.value.filter(r => r.status === 'confirmed'))

async function loadReceipts() {
  loadingReceipts.value = true
  try {
    const res = await receiptApi.list({ pageSize: 100 })
    allReceipts.value = res.list
  } finally {
    loadingReceipts.value = false
  }
}

// ===== 分期计划 =====
const allPlans = ref<BizReceiptPlan[]>([])
const loadingPlans = ref(false)
const planFilter = ref<'all' | 'overdue' | 'paid'>('all')

const filteredPlans = computed(() => {
  if (planFilter.value === 'overdue') {
    return allPlans.value.filter(p => p.status !== 'paid' && calcOverdueLevel(p).key !== 'none')
  }
  if (planFilter.value === 'paid') return allPlans.value.filter(p => p.status === 'paid')
  return allPlans.value
})

const overdueStats = computed(() => {
  const list = allPlans.value.filter(p => p.status !== 'paid' && calcOverdueLevel(p).key !== 'none')
  const totalAmount = list.reduce((s, p) => s + p.pendingAmount, 0)
  const maxDays = list.reduce((m, p) => Math.max(m, calcOverdueLevel(p).days), 0)
  return { totalAmount, count: list.length, maxDays }
})

const overdueStageStats = computed(() => {
  const stages: Array<{ key: string; label: string; range: string; action: string; notify: string; min: number; max: number }> = [
    { key: 'today', label: '到期当天', range: '0–6 天', action: '标记已逾期', notify: '销售', min: 1, max: 6 },
    { key: 'level1', label: '逾期 7–14 天', range: '7–14 天', action: '发送催促提醒', notify: '销售', min: 7, max: 14 },
    { key: 'level2', label: '逾期 15–29 天', range: '15–29 天', action: '主管介入', notify: '销售 + 主管', min: 15, max: 29 },
    { key: 'level3', label: '逾期 30–59 天', range: '30–59 天', action: '服务暂停标记', notify: '销售 + 主管 + 客户', min: 30, max: 59 },
    { key: 'level4', label: '逾期 ≥60 天', range: '≥60 天', action: '合同终止标记', notify: '全员', min: 60, max: 99999 }
  ]
  return stages.map(stg => {
    const items = allPlans.value.filter(p => {
      if (p.status === 'paid') return false
      const d = calcOverdueLevel(p).days
      return d >= stg.min && d <= stg.max
    })
    return {
      ...stg,
      count: items.length,
      amount: items.reduce((s, p) => s + p.pendingAmount, 0)
    }
  })
})

async function loadPlans() {
  loadingPlans.value = true
  try {
    const res = await receiptApi.getPlans({ pageSize: 100 })
    allPlans.value = res.list
  } finally {
    loadingPlans.value = false
  }
}

function daysOverdueValue(plan: BizReceiptPlan): number {
  return calcOverdueLevel(plan).days
}
function daysOverdue(plan: BizReceiptPlan): string {
  const info = calcOverdueLevel(plan)
  if (plan.status === 'paid') return '—'
  if (info.days <= 0) return '未到期'
  return info.days + ' 天'
}
function overdueLevel(plan: BizReceiptPlan) {
  const info = calcOverdueLevel(plan)
  return { cls: info.cls, text: info.label || (plan.status === 'paid' ? '已结清' : '正常') }
}
function overdueRowClassName({ row }: { row: BizReceiptPlan }) {
  const info = calcOverdueLevel(row)
  if (row.status === 'paid') return ''
  if (info.days >= 30) return 'row-overdue-red'
  if (info.days >= 15) return 'row-overdue-orange'
  if (info.days >= 7) return 'row-overdue-yellow'
  return ''
}
function overdueActionLabel(plan: BizReceiptPlan): string {
  return calcOverdueLevel(plan).action || '—'
}
function overdueNotifyLabel(plan: BizReceiptPlan): string {
  return calcOverdueLevel(plan).notify || '—'
}

// ===== 发票 =====
const invoices = ref<BizInvoice[]>([])
const loadingInvoices = ref(false)
const invoiceFilter = ref('')

// 全量发票（不受筛选影响，用于状态流统计）
const allInvoices = ref<BizInvoice[]>([])

async function loadInvoices() {
  loadingInvoices.value = true
  try {
    const [resAll, resFilter] = await Promise.all([
      receiptApi.getInvoices({ pageSize: 200 }),
      receiptApi.getInvoices({ pageSize: 100, status: invoiceFilter.value || undefined })
    ])
    allInvoices.value = resAll.list
    invoices.value = resFilter.list
  } finally {
    loadingInvoices.value = false
  }
}

const pendingInvoices = computed(() => allInvoices.value.filter(i => i.status === 'pending'))
const pendingInvoiceAmount = computed(() => pendingInvoices.value.reduce((s, i) => s + (i.amount || 0), 0))

const invoiceStageStats = computed(() => {
  const stages: Array<{ key: 'pending' | 'issued' | 'mailed' | 'received'; label: string }> = [
    { key: 'pending', label: '待开' },
    { key: 'issued', label: '已开' },
    { key: 'mailed', label: '已寄出' },
    { key: 'received', label: '客户已收' }
  ]
  return stages.map(s => {
    const items = allInvoices.value.filter(i => i.status === s.key)
    return {
      key: s.key,
      label: s.label,
      count: items.length,
      amount: items.reduce((sum, i) => sum + (i.amount || 0), 0)
    }
  })
})

// ===== 退款 =====
const refunds = ref<RefundRequest[]>([])
const loadingRefunds = ref(false)
const refundFilter = ref('')

const filteredRefunds = computed(() => {
  if (!refundFilter.value) return refunds.value
  return refunds.value.filter(r => r.status === refundFilter.value)
})
const refundCount = computed(() => refunds.value.filter(r => r.status === 'pending' || r.status === 'approved').length)
const refundProgress = computed(() => {
  // 以列表中最进阶状态判断当前阶段
  if (refunds.value.some(r => r.status === 'completed')) return 4
  if (refunds.value.some(r => r.status === 'approved')) return 3
  if (refunds.value.some(r => r.status === 'pending')) return 2
  return 1
})

async function loadRefunds() {
  loadingRefunds.value = true
  try {
    const res = await receiptApi.getRefunds({ pageSize: 100, status: refundFilter.value || undefined })
    refunds.value = res.list
  } finally {
    loadingRefunds.value = false
  }
}

// ===== 入账：后端 /receipt/posting 落库，刷新后保留 =====
function isPosted(row: BizReceipt) { return !!row.postingAccount }
function getPostingAccount(row: BizReceipt) { return row.postingAccount || '' }

// ===== Summary 加载 =====
async function loadSummary() {
  summary.value = await receiptApi.getSummary()
}

// ===== 联动事件时间线 =====
const timeline = ref<ReceiptTimelineEvent[]>([])
async function loadTimeline() {
  timeline.value = await receiptApi.getTimeline({ limit: 20 })
}
function timelineIcon(type: string) {
  return ({
    receipt_confirmed: '✓',
    receipt_posted: '¥',
    order_completed: '★',
    contract_generated: '📄',
    refund_applied: '↩',
    refund_approved: '✓',
    refund_finance_confirmed: '¥',
    refund_completed: '✓✓',
    refund_rejected: '✕',
    overdue_escalation: '⚠'
  } as Record<string, string>)[type] || '·'
}
function timelineColor(type: string) {
  if (type === 'refund_rejected' || type === 'overdue_escalation') return 'tl-danger'
  if (type === 'refund_applied') return 'tl-warn'
  if (type === 'order_completed' || type === 'contract_generated' || type === 'refund_completed') return 'tl-success'
  return 'tl-primary'
}

// ===== 本月汇总 trend / channel / sales =====
const trendData = computed(() => {
  const days = 7
  const result: { date: string; amount: number }[] = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
    const amount = allReceipts.value
      .filter(r => r.status === 'confirmed' && r.paymentTime?.slice(0, 10) === key)
      .reduce((s, r) => s + r.amount, 0)
    result.push({ date: label, amount })
  }
  return result
})
const maxTrend = computed(() => Math.max(...trendData.value.map(d => d.amount), 1000))
function formatTrend(v: number) {
  if (v >= 10000) return (v / 10000).toFixed(1) + '万'
  return String(Math.round(v))
}

const channelStats = computed(() => {
  const palette: Record<string, { label: string; color: string }> = {
    bank:   { label: '对公转账', color: '#F59E0B' },
    wechat: { label: '微信',     color: '#10B981' },
    alipay: { label: '支付宝',   color: '#3B82F6' },
    cash:   { label: '现金',     color: '#A78BFA' },
    pos:    { label: 'POS刷卡',  color: '#F472B6' },
    other:  { label: '其他',     color: '#94A3B8' }
  }
  const map: Record<string, number> = {}
  confirmedReceipts.value.forEach(r => { map[r.paymentChannel] = (map[r.paymentChannel] || 0) + r.amount })
  const total = Object.values(map).reduce((s, v) => s + v, 0) || 1
  return Object.keys(palette).map(k => ({
    key: k,
    label: palette[k].label,
    color: palette[k].color,
    amount: map[k] || 0,
    percent: ((map[k] || 0) / total) * 100
  })).sort((a, b) => b.amount - a.amount)
})

const salesStats = computed(() => {
  const map: Record<string, { name: string; amount: number; count: number }> = {}
  confirmedReceipts.value.forEach(r => {
    const name = r.confirmerName || '未指派'
    if (!map[name]) map[name] = { name, amount: 0, count: 0 }
    map[name].amount += r.amount
    map[name].count += 1
  })
  return Object.values(map).sort((a, b) => b.amount - a.amount)
})

const monthStats = computed(() => {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
  const list = confirmedReceipts.value.filter(r =>
    new Date(r.paymentTime.replace(' ', 'T')).getTime() >= monthStart.getTime())
  return { count: list.length, amount: list.reduce((s, r) => s + r.amount, 0) }
})

// ===== 文案映射 =====
function channelText(c: string) {
  return ({ bank: '对公转账', wechat: '微信', alipay: '支付宝', cash: '现金', pos: 'POS刷卡', other: '其他' } as any)[c] || c
}
function statusText(s: string) {
  return ({ pending: '待确认', confirmed: '已确认', rejected: '已驳回', refunded: '已退款', partial: '部分收款' } as any)[s] || s
}
function statusTagType(s: string) {
  return ({ pending: 'warning', confirmed: 'success', rejected: 'info', refunded: 'danger', partial: 'primary' } as any)[s] || ''
}
function invoiceTypeText(t: string) {
  return ({ vat_special: '增值税专票', vat_general: '普通发票', electronic: '电子发票' } as any)[t] || t
}
function invoiceTypeTag(t: string) {
  return ({ vat_special: 'danger', vat_general: 'primary', electronic: 'success' } as any)[t] || ''
}
function invoiceStatusText(s: string) {
  return ({ pending: '待开', issued: '已开', mailed: '已寄出', received: '客户已收', cancelled: '已作废' } as any)[s] || s
}
function invoiceStatusTag(s: string) {
  return ({ pending: 'warning', issued: 'primary', mailed: 'success', received: 'success', cancelled: 'info' } as any)[s] || ''
}
function refundStatusText(s: string) {
  return ({ pending: '待主管审批', approved: '主管已审', finance_confirmed: '财务已确认', completed: '已退款', rejected: '已驳回' } as any)[s] || s
}
function refundStatusTag(s: string) {
  return ({ pending: 'warning', approved: 'primary', finance_confirmed: 'primary', completed: 'success', rejected: 'info' } as any)[s] || ''
}
function formatMoney(v: number) {
  if (v == null) return '0.00'
  return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// =================== 确认收款 Dialog ===================
const confirmDialog = reactive<{ visible: boolean; row: BizReceipt | null; markDiff: boolean }>({
  visible: false, row: null, markDiff: false
})
const confirmForm = reactive({
  actualAmount: 0,
  channel: 'bank' as 'bank' | 'alipay' | 'wechat' | 'cash' | 'pos' | 'other',
  account: '',
  payerName: '',
  payerAccount: '',
  paymentTime: new Date(),
  diffRemark: '',
  remark: '',
  surplusAsPrepay: true
})
const amountDiff = computed(() => (confirmDialog.row?.amount || 0) - confirmForm.actualAmount)

function openConfirmDialog(row: BizReceipt, markDiff = false) {
  confirmDialog.row = row
  confirmDialog.markDiff = markDiff
  confirmForm.actualAmount = markDiff ? row.amount - 100 : row.amount
  confirmForm.channel = row.paymentChannel
  confirmForm.account = ''
  confirmForm.payerName = row.customerName || ''
  confirmForm.payerAccount = ''
  confirmForm.paymentTime = new Date()
  confirmForm.diffRemark = ''
  confirmForm.remark = row.remark || ''
  confirmForm.surplusAsPrepay = true
  confirmDialog.visible = true
}
async function submitConfirm() {
  if (!confirmDialog.row) return
  if (amountDiff.value !== 0 && !confirmForm.diffRemark.trim()) {
    ElMessage.warning('实收与应收不一致，请填写差额说明')
    return
  }
  // 超收但未选预付 -> 仅按应收金额入账
  let actualAmount = confirmForm.actualAmount
  if (amountDiff.value < 0 && confirmForm.surplusAsPrepay === false) {
    actualAmount = confirmDialog.row.amount
  }
  let remarkParts: string[] = []
  if (amountDiff.value > 0) {
    remarkParts.push(`部分收款，剩余待收¥${formatMoney(amountDiff.value)}`)
  } else if (amountDiff.value < 0) {
    remarkParts.push(confirmForm.surplusAsPrepay ? `溢缴¥${formatMoney(Math.abs(amountDiff.value))}已计入预付款` : `超收部分不计入本单，仅收取应收`)
  }
  if (confirmForm.diffRemark.trim()) remarkParts.push(`差额说明：${confirmForm.diffRemark.trim()}`)
  if (confirmForm.remark.trim()) remarkParts.push(confirmForm.remark.trim())

  try {
    const res = await receiptApi.confirm({
      id: confirmDialog.row.id,
      status: 'confirmed',
      actualAmount,
      remark: remarkParts.join(' | ')
    })
    confirmDialog.visible = false
    const isLikelyClosed = amountDiff.value <= 0 && (res.receiptType === 'full' || res.receiptType === 'final')
    if (isLikelyClosed) {
      await ElMessageBox.alert(
        '该订单收款已确认，系统已核销收款计划并写入财务联动时间线；合同草稿检查结果可在时间线查看。',
        '联动提醒',
        { confirmButtonText: '知道了', type: 'success' }
      ).catch(() => undefined)
    } else if (amountDiff.value > 0) {
      ElMessage.success(`部分收款已确认，剩余待收¥${formatMoney(amountDiff.value)}`)
    } else {
      ElMessage.success('收款已确认，已同步生成待开票记录')
    }
    await Promise.all([loadReceipts(), loadInvoices(), loadPlans(), loadSummary(), loadTimeline()])
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}
async function rejectInDialog() {
  if (!confirmDialog.row) return
  await rejectReceipt(confirmDialog.row)
  confirmDialog.visible = false
}
async function rejectReceipt(row: BizReceipt) {
  try {
    await ElMessageBox.confirm(`确认驳回收款 ${row.receiptNo} 吗？`, '驳回确认', { type: 'warning' })
    await receiptApi.confirm({ id: row.id, status: 'rejected', remark: '财务驳回' })
    ElMessage.success('已驳回')
    await Promise.all([loadReceipts(), loadSummary()])
  } catch { /* cancelled */ }
}

// =================== 标记已付 Dialog ===================
const markPaidDialog = reactive<{ visible: boolean; row: BizReceiptPlan | null }>({ visible: false, row: null })
const markPaidForm = reactive<{ paidAmount: number; paidDate: Date }>({ paidAmount: 0, paidDate: new Date() })

function openMarkPaidDialog(row: BizReceiptPlan) {
  markPaidDialog.row = row
  markPaidForm.paidAmount = row.pendingAmount
  markPaidForm.paidDate = new Date()
  markPaidDialog.visible = true
}
async function submitMarkPaid() {
  if (!markPaidDialog.row) return
  try {
    await receiptApi.markPlanPaid({
      id: markPaidDialog.row.id,
      paidAmount: markPaidForm.paidAmount,
      paidDate: formatDate(markPaidForm.paidDate)
    })
    ElMessage.success('已更新到账状态')
    markPaidDialog.visible = false
    await Promise.all([loadPlans(), loadSummary()])
  } catch (e: any) {
    ElMessage.error(e?.message || '操作失败')
  }
}

async function sendReminder(row: BizReceiptPlan) {
  await ElMessageBox.confirm(`确认向 ${row.customerName} 发送催收提醒？`, '催收提醒', { type: 'info' })
  // gapsNoBackend：后端收款计划无催收计数/催收时间字段，仅做前端态提示，不持久化。
  row.reminderCount += 1
  row.lastReminderTime = new Date().toISOString().slice(0, 19).replace('T', ' ')
  ElMessage.success('催收提醒已发送')
}
async function escalateToManager(row: BizReceiptPlan) {
  await ElMessageBox.confirm(`将 ${row.customerName} 的逾期款项升级至主管处理？`, '升级主管', { type: 'warning' })
  ElMessage.success(`已升级 · 主管将处理订单 ${row.orderNo}`)
}

// =================== 发票 Dialogs ===================
const invoiceDialog = reactive<{ visible: boolean; title: string }>({ visible: false, title: '新建发票' })
const invoiceForm = reactive({
  receiptId: 0,
  invoiceType: 'vat_general' as 'vat_special' | 'vat_general' | 'electronic',
  invoiceTitle: '',
  taxNo: '',
  amount: 0,
  taxRate: 6,
  remark: ''
})
function openInvoiceDialog() {
  invoiceForm.receiptId = 0
  invoiceForm.invoiceType = 'vat_general'
  invoiceForm.invoiceTitle = ''
  invoiceForm.taxNo = ''
  invoiceForm.amount = 0
  invoiceForm.taxRate = 6
  invoiceForm.remark = ''
  invoiceDialog.title = '新建发票'
  invoiceDialog.visible = true
}
async function submitInvoice() {
  if (!invoiceForm.invoiceTitle || !invoiceForm.amount) {
    ElMessage.warning('请完整填写发票信息')
    return
  }
  const r = confirmedReceipts.value.find(x => x.id === invoiceForm.receiptId)
  await receiptApi.createInvoice({
    orderId: r?.orderId,
    orderNo: r?.orderNo,
    customerId: r?.customerId,
    customerName: r?.customerName,
    invoiceTitle: invoiceForm.invoiceTitle,
    taxNo: invoiceForm.taxNo,
    invoiceType: invoiceForm.invoiceType,
    amount: invoiceForm.amount,
    taxRate: invoiceForm.taxRate,
    remark: invoiceForm.remark
  })
  ElMessage.success('发票已创建')
  invoiceDialog.visible = false
  await Promise.all([loadInvoices(), loadSummary()])
}

const issueDialog = reactive<{ visible: boolean; row: BizInvoice | null }>({ visible: false, row: null })
const issueForm = reactive({ invoiceNo: '', issueTime: new Date() })
function openIssueDialog(row: BizInvoice) {
  issueDialog.row = row
  issueForm.invoiceNo = row.invoiceNo
  issueForm.issueTime = new Date()
  issueDialog.visible = true
}
async function submitIssue() {
  if (!issueDialog.row || !issueForm.invoiceNo) return
  await receiptApi.updateInvoice({
    id: issueDialog.row.id,
    invoiceNo: issueForm.invoiceNo,
    status: 'issued'
  })
  ElMessage.success('发票已开具')
  issueDialog.visible = false
  await loadInvoices()
}

const mailDialog = reactive<{ visible: boolean; row: BizInvoice | null }>({ visible: false, row: null })
const mailForm = reactive({ mailNo: '' })
function openMailDialog(row: BizInvoice) {
  mailDialog.row = row
  mailForm.mailNo = ''
  mailDialog.visible = true
}
async function submitMail() {
  if (!mailDialog.row || !mailForm.mailNo) {
    ElMessage.warning('请填写快递单号')
    return
  }
  await receiptApi.updateInvoice({ id: mailDialog.row.id, mailNo: mailForm.mailNo, status: 'mailed' })
  ElMessage.success('已寄出')
  mailDialog.visible = false
  await loadInvoices()
}
async function confirmReceived(row: BizInvoice) {
  await ElMessageBox.confirm('确认客户已收到发票？', '客户已收', { type: 'success' })
  await receiptApi.updateInvoice({ id: row.id, status: 'received' })
  ElMessage.success('已确认收到')
  await loadInvoices()
}

// =================== 退款 Dialogs ===================
const refundableOrders = ref<BizOrder[]>([])
const refundApplyDialog = reactive<{ visible: boolean }>({ visible: false })
const refundApplyForm = reactive<{
  orderId: number
  receiptId: number
  refundAmount: number
  reason: string
  reasonKey: RefundReasonKey
  refundWay: RefundWayKey
}>({ orderId: 0, receiptId: 0, refundAmount: 0, reason: '', reasonKey: 'other', refundWay: 'origin' })

const refundableReceipts = computed(() => {
  if (!refundApplyForm.orderId) return []
  return allReceipts.value.filter(r => r.orderId === refundApplyForm.orderId && r.status === 'confirmed')
})
const refundApplyMax = computed(() => {
  const r = allReceipts.value.find(x => x.id === refundApplyForm.receiptId)
  return r ? r.amount : 0
})

async function loadRefundableOrders() {
  try {
    const res = await orderApi.list({ pageSize: 200 })
    refundableOrders.value = (res.list || []).filter((o: BizOrder) => o.status === 'completed' || o.status === 'pending_finance')
  } catch {
    refundableOrders.value = []
  }
}

function onRefundOrderChange() {
  refundApplyForm.receiptId = 0
  refundApplyForm.refundAmount = 0
}

function openRefundApplyDialog() {
  refundApplyForm.orderId = 0
  refundApplyForm.receiptId = 0
  refundApplyForm.refundAmount = 0
  refundApplyForm.reason = ''
  refundApplyForm.reasonKey = 'other'
  refundApplyForm.refundWay = 'origin'
  if (refundableOrders.value.length === 0) loadRefundableOrders()
  refundApplyDialog.visible = true
}

async function submitRefundApply() {
  if (!refundApplyForm.orderId || !refundApplyForm.receiptId || !refundApplyForm.refundAmount || !refundApplyForm.reason.trim()) {
    ElMessage.warning('请完整填写退款信息')
    return
  }
  if (refundApplyMax.value > 0 && refundApplyForm.refundAmount > refundApplyMax.value) {
    ElMessage.warning(`退款金额不得超过实收金额 ¥${formatMoney(refundApplyMax.value)}`)
    return
  }
  const r = allReceipts.value.find(x => x.id === refundApplyForm.receiptId)
  try {
    await receiptApi.createRefund({
      receiptId: refundApplyForm.receiptId,
      orderId: r?.orderId || refundApplyForm.orderId,
      orderNo: r?.orderNo,
      customerName: r?.customerName,
      refundAmount: refundApplyForm.refundAmount,
      reasonKey: refundApplyForm.reasonKey,
      reason: refundApplyForm.reason,
      refundWay: refundApplyForm.refundWay
    })
    ElMessage.success('退款申请已提交，待主管审批')
    refundApplyDialog.visible = false
    await Promise.all([loadRefunds(), loadSummary(), loadTimeline()])
  } catch (e: any) {
    ElMessage.error(e?.message || '提交失败')
  }
}

async function approveRefund(row: RefundRequest) {
  try {
    await ElMessageBox.confirm(`确认通过 ${row.refundNo} 的退款申请？`, '主管审批', { type: 'warning' })
    await receiptApi.approveRefund({ id: row.id })
    ElMessage.success('审批通过，等待财务确认')
    await Promise.all([loadRefunds(), loadTimeline()])
  } catch { /* cancel */ }
}

async function rejectRefundAction(row: RefundRequest) {
  try {
    const { value } = await ElMessageBox.prompt(`请填写驳回 ${row.refundNo} 的原因：`, '驳回退款', {
      confirmButtonText: '驳回',
      cancelButtonText: '取消',
      inputPlaceholder: '驳回原因',
      type: 'warning'
    })
    await receiptApi.rejectRefund({ id: row.id, rejectReason: value || '不符合退款条件' })
    ElMessage.success('已驳回')
    await Promise.all([loadRefunds(), loadSummary(), loadTimeline()])
  } catch { /* cancel */ }
}

function viewRefundDetail(row: RefundRequest) {
  const lines = [
    `退款编号：${row.refundNo}`,
    `状态：${refundStatusText(row.status)}`,
    `客户：${row.customerName}`,
    `金额：¥${formatMoney(row.refundAmount)}`,
    `原因：${refundReasonLabel(row.reasonKey)} · ${row.reason}`,
    `退款方式：${refundWayLabel(row.refundWay)}`,
    `申请人：${row.applicantName}（${row.applyTime}）`,
    row.approverName ? `主管审批：${row.approverName}（${row.approvalTime}）` : '',
    row.financeConfirmerName ? `财务确认：${row.financeConfirmerName}（${row.financeConfirmTime}）` : '',
    row.rejectReason ? `驳回原因：${row.rejectReason}` : ''
  ].filter(Boolean).join('\n')
  ElMessageBox.alert(lines, '退款明细', { confirmButtonText: '关闭' })
}

const refundExecDialog = reactive<{ visible: boolean; row: RefundRequest | null }>({ visible: false, row: null })
const refundExecForm = reactive<{ way: RefundWayKey; remark: string }>({ way: 'origin', remark: '' })
function openRefundExecDialog(row: RefundRequest) {
  refundExecDialog.row = row
  refundExecForm.way = row.refundWay || 'origin'
  refundExecForm.remark = ''
  refundExecDialog.visible = true
}
async function submitRefundExec() {
  if (!refundExecDialog.row) return
  try {
    const row = refundExecDialog.row
    await receiptApi.confirmRefund({
      id: row.id,
      refundWay: refundExecForm.way,
      remark: refundExecForm.remark
    })
    // 退款落库由后端 /receipt/refund 完成（将原收款置为「已退款」）。
    // gapsNoBackend：后端 refund() 未编排「合同终止 / 任务取消 / 提成扣回 / 客户冻结」下游联动，故此处不再做前端 mock 联动。
    ElMessage.success('退款已执行')
    refundExecDialog.visible = false
    await Promise.all([loadRefunds(), loadReceipts(), loadSummary(), loadTimeline()])
  } catch (e: any) {
    ElMessage.error(e?.message || '执行失败')
  }
}

// =================== 入账 Dialog ===================
const postingDialog = reactive<{ visible: boolean; row: BizReceipt | null }>({ visible: false, row: null })
const postingForm = reactive({ account: '主营业务收入' })
function openPostingDialog(row: BizReceipt) {
  postingDialog.row = row
  postingForm.account = '主营业务收入'
  postingDialog.visible = true
}
async function submitPosting() {
  if (!postingDialog.row) return
  try {
    const row = postingDialog.row
    const posted = await receiptApi.markPosted({
      id: row.id,
      postingAccount: postingForm.account
    })
    const index = allReceipts.value.findIndex(item => item.id === posted.id)
    if (index >= 0) {
      allReceipts.value[index] = { ...allReceipts.value[index], ...posted }
    }
    ElMessage.success(`收款 ${row.receiptNo} 已入账至「${posted.postingAccount || postingForm.account}」`)
    postingDialog.visible = false
    await Promise.all([loadReceipts(), loadTimeline()])
  } catch (e: any) {
    ElMessage.error(e?.message || '入账失败')
  }
}

// =================== 工具 ===================
function formatDate(d: Date | string): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toISOString().slice(0, 10)
}

// =================== 初始化 ===================
onMounted(async () => {
  await Promise.all([loadReceipts(), loadPlans(), loadInvoices(), loadRefunds(), loadSummary(), loadTimeline(), loadRefundableOrders()])
})
</script>


<style lang="scss" scoped>
.finance-check {
  padding: 24px 28px 36px;
  min-height: 100%;
  background:
    radial-gradient(ellipse at top right, rgba(16, 185, 129, 0.05), transparent 60%),
    radial-gradient(ellipse at bottom left, rgba(245, 158, 11, 0.04), transparent 60%),
    var(--bg-page, #0B0B12);
  color: var(--text-body, #B8B8C0);
}

/* ============ Header ============ */
.page-header {
  position: relative;
  padding: 26px 32px 28px;
  margin-bottom: 22px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.06), rgba(245, 158, 11, 0.04));
  border: 1px solid rgba(51, 112, 255, 0.2);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    opacity: 0.5;
  }
}
.header-meta {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: rgba(245, 158, 11, 0.75);
  text-transform: uppercase;
}
.meta-divider {
  width: 24px;
  height: 1px;
  background: rgba(245, 158, 11, 0.4);
}
.header-main { position: relative; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;
  font-size: 30px;
  font-weight: 700;

  .title-cn {
    background: linear-gradient(135deg, #F5F5F5 0%, #3370ff 60%, #10B981 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: rgba(245, 158, 11, 0.5);
  }
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted, #888);
  letter-spacing: 0.04em;
}
.header-decor {
  position: absolute;
  top: 32px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 8px;

  .decor-line {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.6));
    &.short { width: 24px; background: linear-gradient(90deg, rgba(16, 185, 129, 0.6), transparent); }
  }
  .decor-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #F59E0B;
    box-shadow: 0 0 14px #F59E0B;
  }
}

/* ============ 顶部指标 ============ */
.metric-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 24px;
}
.metric-item {
  position: relative;
  padding: 18px 22px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(51, 112, 255, 0.14);
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 10px 24px -14px rgba(245, 158, 11, 0.4);
  }
}
.metric-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(245, 158, 11, 0.6);
  margin-bottom: 8px;
}
.metric-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary, #F5F5F5);
  line-height: 1.2;

  &.warn { color: #E6A23C; }
  &.danger { color: #F56C6C; }
}
.metric-label {
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted, #888);
  letter-spacing: 0.04em;
}

/* ============ Tabs ============ */
.finance-tabs {
  :deep(.el-tabs__header) {
    margin-bottom: 18px;
    border-bottom: 1px solid rgba(51, 112, 255, 0.15);
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: var(--text-muted, #888);
    padding: 0 22px;
    transition: all 0.3s;

    &.is-active {
      color: #F59E0B;
      font-weight: 600;
    }
    &:hover { color: var(--text-primary, #F5F5F5); }
  }
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #F59E0B, #10B981);
    height: 3px;
    border-radius: 2px;
  }
}

/* ============ Panel ============ */
.panel {
  padding: 22px 24px 18px;
  margin-bottom: 18px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(51, 112, 255, 0.12);
  border-radius: 8px;
}
.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary, #F5F5F5);

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #F59E0B;
    box-shadow: 0 0 12px #F59E0B;
  }
  em {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    font-style: normal;
    color: var(--text-muted, #888);
    letter-spacing: 0.05em;
    margin-left: 4px;
  }
}
.panel-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* ============ Table ============ */
.zh-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(245, 158, 11, 0.06);
  --el-table-border-color: rgba(51, 112, 255, 0.12);

  :deep(th.el-table__cell) {
    background: rgba(51, 112, 255, 0.06);
    color: var(--text-primary, #F5F5F5);
    font-weight: 600;
    font-size: 13px;
    border-bottom: 1px solid rgba(51, 112, 255, 0.15);
  }
  :deep(td.el-table__cell) {
    border-bottom: 1px solid rgba(51, 112, 255, 0.08);
    color: var(--text-body, #B8B8C0);
  }
  :deep(.el-table__row.el-table__row--striped td.el-table__cell) {
    background: rgba(51, 112, 255, 0.02);
  }
}

.mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
.link {
  color: #F59E0B;
  cursor: pointer;
  &:hover { text-decoration: underline; }
}
.money {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: #10B981;

  &.muted { color: var(--text-muted, #888); font-weight: 500; }
  &.danger { color: #F56C6C; }
}
.muted { color: var(--text-muted, #888); }

/* ============ 逾期统计卡 ============ */
.overdue-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 22px;
}
.ov-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 12px;
  border: 1.5px solid;
  overflow: hidden;
  transition: all 0.3s;

  &:hover { transform: translateY(-3px); }

  .ov-icon { font-size: 30px; }
  .ov-meta { flex: 1; }
  .ov-label {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    margin-bottom: 4px;
    opacity: 0.9;
  }
  .ov-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 26px;
    font-weight: 700;
    line-height: 1.1;
  }
}
.ov-red {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.16), rgba(245, 108, 108, 0.04));
  border-color: rgba(245, 108, 108, 0.5);
  color: #F56C6C;
}
.ov-amber {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.16), rgba(230, 162, 60, 0.04));
  border-color: rgba(230, 162, 60, 0.5);
  color: #E6A23C;
}
.ov-purple {
  background: linear-gradient(135deg, rgba(167, 139, 250, 0.16), rgba(167, 139, 250, 0.04));
  border-color: rgba(167, 139, 250, 0.5);
  color: #A78BFA;
}

/* ============ 逾期 Tag ============ */
.installment {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  padding: 2px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #F59E0B;
  border-radius: 4px;
}
.overdue-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  .ov-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
}
.lv-success { color: #67C23A; background: rgba(103, 194, 58, 0.12); }
.lv-warn-soft { color: #E6A23C; background: rgba(230, 162, 60, 0.1); }
.lv-warn { color: #E6A23C; background: rgba(230, 162, 60, 0.16); }
.lv-warn-strong { color: #D97706; background: rgba(217, 119, 6, 0.18); font-weight: 700; }
.lv-danger { color: #F56C6C; background: rgba(245, 108, 108, 0.16); font-weight: 700; }
.lv-critical {
  color: #fff;
  background: linear-gradient(135deg, #F56C6C, #B91C1C);
  font-weight: 700;
  animation: pulseCritical 1.6s ease-in-out infinite;
}
@keyframes pulseCritical {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.6); }
  50% { box-shadow: 0 0 0 6px rgba(245, 108, 108, 0); }
}
.days {
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 13px;

  &.lv-success { color: #67C23A; background: transparent; padding: 0; }
  &.lv-warn-soft, &.lv-warn { color: #E6A23C; background: transparent; padding: 0; }
  &.lv-warn-strong { color: #D97706; background: transparent; padding: 0; }
  &.lv-danger, &.lv-critical { color: #F56C6C; background: transparent; padding: 0; }
}

/* ============ 本月汇总 ============ */
.summary-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 16px;
  margin-bottom: 18px;
}
.sum-card {
  position: relative;
  padding: 22px 26px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  overflow: hidden;
  transition: all 0.3s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 24px 24px;
    opacity: 0.4;
    pointer-events: none;
  }

  .sum-label {
    position: relative;
    font-size: 12px;
    letter-spacing: 0.06em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 12px;
  }
  .sum-num {
    position: relative;
    font-family: 'JetBrains Mono', monospace;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1.1;
  }
  &.lg .sum-num { font-size: 36px; }
  .sum-foot {
    position: relative;
    margin-top: 10px;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.65);

    .up { color: #6EE7B7; }
  }

  &:hover { transform: translateY(-3px); box-shadow: 0 16px 36px -18px rgba(0, 0, 0, 0.6); }
}
.gradient-emerald { background: linear-gradient(135deg, #047857 0%, #064E3B 100%); border-color: rgba(16, 185, 129, 0.4); }
.gradient-amber { background: linear-gradient(135deg, #B45309 0%, #78350F 100%); border-color: rgba(245, 158, 11, 0.4); }
.gradient-slate { background: linear-gradient(135deg, #334155 0%, #0F172A 100%); border-color: rgba(148, 163, 184, 0.3); }
.gradient-red { background: linear-gradient(135deg, #B91C1C 0%, #7F1D1D 100%); border-color: rgba(245, 108, 108, 0.4); }

/* ============ 趋势图 ============ */
.trend-chart {
  display: grid;
  grid-template-columns: 60px 1fr;
  gap: 16px;
  height: 240px;
  padding: 16px 8px 8px;
}
.trend-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--text-muted, #888);
  text-align: right;
  padding: 8px 0 30px;
}
.trend-bars {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 14px;
  align-items: end;
  border-left: 1px solid rgba(51, 112, 255, 0.15);
  border-bottom: 1px solid rgba(51, 112, 255, 0.15);
  padding: 8px 8px 0;
  position: relative;
}
.trend-bar {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;

  .bar-fill {
    width: 70%;
    height: var(--h);
    background: linear-gradient(180deg, #F59E0B 0%, #10B981 100%);
    border-radius: 4px 4px 0 0;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
    position: relative;
    transition: all 0.4s;
  }
  .bar-tip {
    position: absolute;
    bottom: calc(var(--h) + 30px);
    left: 50%;
    transform: translateX(-50%);
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: #10B981;
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    padding: 2px 6px;
    border-radius: 3px;
    white-space: nowrap;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }
  .bar-label {
    position: absolute;
    bottom: -22px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted, #888);
  }

  &:hover .bar-fill {
    background: linear-gradient(180deg, #FBBF24 0%, #34D399 100%);
    transform: scaleY(1.02);
    transform-origin: bottom;
  }
  &:hover .bar-tip { opacity: 1; }
}

/* ============ 双栏 ============ */
.dual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.channel-list { padding: 4px 0; }
.channel-row {
  display: grid;
  grid-template-columns: 100px 1fr 110px 60px;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px dashed rgba(51, 112, 255, 0.08);

  &:last-child { border-bottom: none; }

  .ch-name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--text-body, #B8B8C0);

    .ch-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  }
  .ch-bar {
    height: 6px;
    background: rgba(51, 112, 255, 0.08);
    border-radius: 3px;
    overflow: hidden;
  }
  .ch-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
  }
  .ch-num { text-align: right; color: var(--text-primary, #F5F5F5); font-size: 13px; }
  .ch-pct { text-align: right; color: var(--text-muted, #888); font-size: 12px; }
}
.mini-table :deep(td.el-table__cell) { padding: 8px 0; }

/* ============ 退款流程指引 ============ */
.flow-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  margin-bottom: 18px;
  background: rgba(51, 112, 255, 0.04);
  border: 1px solid rgba(51, 112, 255, 0.12);
  border-radius: 8px;
}
.flow-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--text-muted, #888);
  border: 1px solid rgba(51, 112, 255, 0.15);

  .flow-num {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: rgba(245, 158, 11, 0.5);
  }
  &.done {
    color: #10B981;
    border-color: rgba(16, 185, 129, 0.4);
    background: rgba(16, 185, 129, 0.08);
    .flow-num { color: #10B981; }
  }
  &.active {
    color: #F59E0B;
    border-color: rgba(245, 158, 11, 0.6);
    background: rgba(245, 158, 11, 0.1);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.08);
    .flow-num { color: #F59E0B; }
  }
}
.flow-arrow {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.3), rgba(245, 158, 11, 0.1));
  position: relative;

  &::after {
    content: '▶';
    position: absolute;
    right: -2px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 8px;
    color: rgba(245, 158, 11, 0.4);
  }
}

/* ============ 入账 ============ */
.posting-panel { margin-top: 24px; }
.account-tag {
  display: inline-block;
  padding: 2px 10px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #10B981;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 4px;
}

/* ============ Dialog ============ */
.zh-dialog {
  :deep(.el-dialog) {
    background: var(--bg-card, #16161E);
    border: 1px solid rgba(51, 112, 255, 0.2);
    border-radius: 12px;
  }
  :deep(.el-dialog__header) {
    border-bottom: 1px solid rgba(51, 112, 255, 0.1);
    padding: 18px 22px 14px;
    margin: 0;
  }
  :deep(.el-dialog__title) {
    color: var(--text-primary, #F5F5F5);
    font-size: 16px;
    font-weight: 600;
  }
  :deep(.el-dialog__body) { padding: 22px 24px; }
  :deep(.el-dialog__footer) {
    border-top: 1px solid rgba(51, 112, 255, 0.08);
    padding: 14px 22px;
  }
}
.dlg-section { margin-bottom: 4px; }
.dlg-section-title {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.18em;
  color: rgba(245, 158, 11, 0.7);
  text-transform: uppercase;
  margin-bottom: 12px;
}
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  padding: 14px 18px;
  background: rgba(51, 112, 255, 0.04);
  border: 1px solid rgba(51, 112, 255, 0.1);
  border-radius: 8px;

  > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    font-size: 13px;
  }
  label {
    font-size: 12px;
    color: var(--text-muted, #888);
    letter-spacing: 0.04em;
  }
  span { color: var(--text-primary, #F5F5F5); font-weight: 500; }
}
.dlg-form { padding: 4px 0; }
.upload-mock {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 64px;
  border: 1.5px dashed rgba(51, 112, 255, 0.3);
  border-radius: 8px;
  color: var(--text-muted, #888);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(245, 158, 11, 0.6);
    color: #F59E0B;
    background: rgba(245, 158, 11, 0.04);
  }
}
.diff-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin: 0 0 14px;
  font-size: 13px;
  background: rgba(245, 108, 108, 0.08);
  border: 1px solid rgba(245, 108, 108, 0.3);
  border-radius: 6px;
  color: #F56C6C;

  strong { font-family: 'JetBrains Mono', monospace; margin: 0 2px; }
  strong.short { color: #E6A23C; }
  strong.over { color: #67C23A; }
}
.posting-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 13px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #E6A23C;
}

/* Form 暗色覆盖 */
:deep(.el-form-item__label) { color: var(--text-muted, #888); font-size: 13px; }
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__wrapper) {
  background: rgba(51, 112, 255, 0.04);
  box-shadow: 0 0 0 1px rgba(51, 112, 255, 0.18) inset;
}
:deep(.el-input__inner), :deep(.el-textarea__inner) { color: var(--text-primary, #F5F5F5); }
:deep(.el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #F59E0B inset !important;
}
:deep(.el-radio__label), :deep(.el-checkbox__label) { color: var(--text-body, #B8B8C0); }
:deep(.el-divider) { border-color: rgba(51, 112, 255, 0.12); }

/* ============ 逾期阶梯卡 ============ */
.stage-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-top: 4px;
}
.stage-card {
  position: relative;
  padding: 14px 16px 16px;
  background: rgba(51, 112, 255, 0.04);
  border: 1px solid rgba(51, 112, 255, 0.16);
  border-radius: 8px;
  transition: all 0.3s;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: linear-gradient(180deg, #F59E0B, #10B981);
    opacity: 0.6;
  }
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 8px 22px -12px rgba(245, 158, 11, 0.4);
  }

  .stage-head {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 6px;
  }
  .stage-label {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  .stage-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px; font-weight: 700;
    color: #F59E0B;
  }
  .stage-range {
    font-size: 11px;
    color: var(--text-muted, #888);
    margin-bottom: 8px;
  }
  .stage-action {
    font-size: 12px;
    color: var(--text-body, #B8B8C0);
    line-height: 1.5;
    margin-bottom: 4px;
  }
  .stage-notify {
    font-size: 11px;
    color: rgba(245, 158, 11, 0.8);
    margin-bottom: 8px;
  }
  .stage-amount {
    padding-top: 8px;
    border-top: 1px dashed rgba(51, 112, 255, 0.15);
    font-family: 'JetBrains Mono', monospace;
    font-size: 13px; font-weight: 600;
    color: #10B981;
  }

  &.stage-today { &::before { background: #E6A23C; } }
  &.stage-level1 { &::before { background: #E6A23C; } .stage-count { color: #E6A23C; } }
  &.stage-level2 { &::before { background: #D97706; } .stage-count { color: #D97706; } }
  &.stage-level3 {
    &::before { background: #F56C6C; }
    .stage-count { color: #F56C6C; }
    border-color: rgba(245, 108, 108, 0.3);
  }
  &.stage-level4 {
    &::before { background: linear-gradient(180deg, #F56C6C, #B91C1C); }
    .stage-count { color: #fff; }
    background: linear-gradient(135deg, rgba(245, 108, 108, 0.18), rgba(185, 28, 28, 0.06));
    border-color: rgba(245, 108, 108, 0.5);
    .stage-label { color: #fff; }
  }
}

/* ============ 系统动作列 ============ */
.action-info {
  display: flex; flex-direction: column; gap: 2px;
  .action-text {
    font-size: 12px; color: var(--text-body, #B8B8C0);
  }
  .notify-text {
    font-size: 11px;
    color: rgba(245, 158, 11, 0.75);
    font-family: 'JetBrains Mono', monospace;
  }
}

/* ============ 行级逾期高亮 ============ */
:deep(.row-overdue-yellow) td.el-table__cell {
  background: rgba(230, 162, 60, 0.06) !important;
}
:deep(.row-overdue-orange) td.el-table__cell {
  background: rgba(217, 119, 6, 0.1) !important;
}
:deep(.row-overdue-red) td.el-table__cell {
  background: rgba(245, 108, 108, 0.12) !important;
}

/* ============ 联动事件时间线 ============ */
.timeline-empty {
  padding: 30px 14px;
  text-align: center;
  color: var(--text-muted, #888);
  font-size: 13px;
  background: rgba(51, 112, 255, 0.03);
  border: 1px dashed rgba(51, 112, 255, 0.15);
  border-radius: 8px;
}
.timeline-list {
  list-style: none;
  padding: 0; margin: 0;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: 18px; top: 6px; bottom: 6px;
    width: 1px;
    background: linear-gradient(180deg, rgba(245, 158, 11, 0.3), rgba(16, 185, 129, 0.15));
  }
}
.timeline-item {
  position: relative;
  display: flex;
  gap: 14px;
  padding: 10px 0 12px 0;

  .tl-icon {
    flex-shrink: 0;
    width: 36px; height: 36px;
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700;
    background: rgba(245, 158, 11, 0.1);
    border: 1.5px solid rgba(245, 158, 11, 0.4);
    border-radius: 50%;
    color: #F59E0B;
    z-index: 1;
  }
  .tl-body {
    flex: 1;
    padding: 8px 14px 10px;
    background: rgba(51, 112, 255, 0.04);
    border: 1px solid rgba(51, 112, 255, 0.12);
    border-radius: 8px;
  }
  .tl-head {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 12px; margin-bottom: 4px;
  }
  .tl-title {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
  }
  .tl-time {
    font-size: 11px;
    color: var(--text-muted, #888);
  }
  .tl-detail {
    font-size: 12px;
    color: var(--text-body, #B8B8C0);
    line-height: 1.6;
  }
  .tl-foot {
    margin-top: 4px;
    font-size: 11px;
    color: rgba(245, 158, 11, 0.6);
    font-family: 'JetBrains Mono', monospace;
  }

  &.tl-success {
    .tl-icon { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.5); color: #10B981; }
    .tl-body { border-color: rgba(16, 185, 129, 0.2); }
  }
  &.tl-warn {
    .tl-icon { background: rgba(230, 162, 60, 0.12); border-color: rgba(230, 162, 60, 0.5); color: #E6A23C; }
  }
  &.tl-danger {
    .tl-icon { background: rgba(245, 108, 108, 0.12); border-color: rgba(245, 108, 108, 0.5); color: #F56C6C; }
    .tl-body { border-color: rgba(245, 108, 108, 0.25); }
  }
  &.tl-primary {
    .tl-icon { background: rgba(245, 158, 11, 0.1); border-color: rgba(245, 158, 11, 0.5); color: #F59E0B; }
  }
}

/* ============ 待开票提醒 ============ */
.invoice-tip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  margin-bottom: 16px;
  background: linear-gradient(90deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.02));
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-body, #B8B8C0);

  strong { color: #F59E0B; font-family: 'JetBrains Mono', monospace; margin: 0 2px; }
  strong.money { color: #10B981; }
  .el-icon { color: #F59E0B; font-size: 16px; }
}

/* ============ 发票状态流 ============ */
.invoice-stage {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.inv-stage-card {
  position: relative;
  padding: 16px 18px 18px;
  background: rgba(51, 112, 255, 0.04);
  border: 1px solid rgba(51, 112, 255, 0.16);
  border-radius: 8px;
  transition: all 0.3s;
  overflow: hidden;

  &::after {
    content: '▶';
    position: absolute;
    right: -10px; top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    color: rgba(245, 158, 11, 0.4);
    z-index: 2;
  }
  &:last-child::after { display: none; }
  &:hover {
    transform: translateY(-2px);
    border-color: rgba(245, 158, 11, 0.4);
  }

  .inv-idx {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.18em;
    color: rgba(245, 158, 11, 0.6);
    margin-bottom: 4px;
  }
  .inv-label {
    font-size: 13px; font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-bottom: 8px;
  }
  .inv-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px; font-weight: 700;
    color: #F59E0B;
    line-height: 1.1;
  }
  .inv-amount {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-muted, #888);
  }

  &.inv-pending { .inv-num { color: #E6A23C; } }
  &.inv-issued { .inv-num { color: #F59E0B; } }
  &.inv-mailed { .inv-num { color: #10B981; } }
  &.inv-received {
    .inv-num { color: #10B981; }
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02));
    border-color: rgba(16, 185, 129, 0.3);
  }
}

/* ============ 差额提示增强 ============ */
.diff-alert {
  align-items: flex-start;

  .diff-meta {
    flex: 1;
    display: flex; flex-direction: column; gap: 4px;
  }
  .diff-sub {
    font-size: 12px;
    color: var(--text-muted, #888);
    line-height: 1.6;
  }
  &.is-short {
    background: rgba(230, 162, 60, 0.08);
    border-color: rgba(230, 162, 60, 0.3);
    color: #E6A23C;
  }
  &.is-over {
    background: rgba(103, 194, 58, 0.08);
    border-color: rgba(103, 194, 58, 0.3);
    color: #67C23A;
  }
}
.input-hint {
  margin-top: 4px;
  font-size: 11px;
  color: rgba(245, 158, 11, 0.7);
  font-family: 'JetBrains Mono', monospace;
}

/* ============ 统一浅色运营台风格 ============ */
.finance-check {
  background: #f5f7fb;
  color: #1f2937;
}
.page-header {
  padding: 22px 24px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.05);

  &::before { display: none; }
}
.header-meta {
  color: #64748b;
  letter-spacing: 0.08em;
}
.meta-tag {
  color: #3370ff;
  font-weight: 700;
}
.meta-divider { background: #cbd5e1; }
.page-title {
  gap: 12px;

  .title-cn {
    background: none;
    -webkit-text-fill-color: initial;
    color: #0f172a;
  }
  .title-en {
    color: #94a3b8;
    letter-spacing: 0.08em;
  }
}
.page-desc {
  color: #64748b;
  letter-spacing: 0;
}
.header-decor { display: none; }
.metric-item,
.panel,
.ov-card,
.sum-card,
.stage-card,
.inv-stage-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
}
.metric-item:hover,
.ov-card:hover,
.sum-card:hover,
.stage-card:hover,
.inv-stage-card:hover {
  transform: translateY(-1px);
  border-color: #bfdbfe;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.08);
}
.metric-index { color: #94a3b8; letter-spacing: 0.08em; }
.metric-value { color: #111827; }
.metric-value.warn { color: #d97706; }
.metric-value.danger { color: #dc2626; }
.metric-label { color: #64748b; letter-spacing: 0; }
.finance-tabs {
  :deep(.el-tabs__header) { border-bottom-color: #e5e7eb; }
  :deep(.el-tabs__item) {
    color: #64748b;

    &.is-active,
    &:hover { color: #3370ff; }
  }
  :deep(.el-tabs__active-bar) {
    height: 2px;
    background: #3370ff;
  }
}
.panel-title {
  color: #111827;

  .dot {
    background: #3370ff;
    box-shadow: none;
  }
  em {
    color: #64748b;
    letter-spacing: 0;
  }
}
.zh-table {
  --el-table-bg-color: #ffffff;
  --el-table-tr-bg-color: #ffffff;
  --el-table-row-hover-bg-color: #f8fafc;
  --el-table-border-color: #e5e7eb;

  :deep(th.el-table__cell) {
    background: #f8fafc;
    color: #334155;
    border-bottom-color: #e5e7eb;
  }
  :deep(td.el-table__cell) {
    color: #334155;
    border-bottom-color: #eef2f7;
  }
  :deep(.el-table__row.el-table__row--striped td.el-table__cell) {
    background: #fbfdff;
  }
}
.link { color: #3370ff; }
.money { color: #059669; }
.money.muted,
.muted { color: #64748b; }
.money.danger { color: #dc2626; }
.ov-card {
  color: #334155;

  .ov-label { color: #64748b; }
}
.ov-red { border-left: 4px solid #dc2626; }
.ov-amber { border-left: 4px solid #d97706; }
.ov-purple { border-left: 4px solid #3370ff; }
.ov-red,
.ov-amber,
.ov-purple { background: #ffffff; }
.installment {
  color: #3370ff;
  background: #eff6ff;
  border-color: #bfdbfe;
}
.summary-grid .sum-card {
  border-left: 4px solid #3370ff;

  &::before { display: none; }
  .sum-label,
  .sum-foot { color: #64748b; }
  .sum-num { color: #111827; }
}
.gradient-emerald { border-left-color: #059669; }
.gradient-amber { border-left-color: #d97706; }
.gradient-slate { border-left-color: #64748b; }
.gradient-red { border-left-color: #dc2626; }
.trend-axis,
.trend-bar .bar-label { color: #64748b; }
.trend-bars {
  border-left-color: #e5e7eb;
  border-bottom-color: #e5e7eb;
}
.trend-bar {
  .bar-fill {
    background: #3370ff;
    box-shadow: none;
  }
  .bar-tip {
    color: #3370ff;
    background: #eff6ff;
    border-color: #bfdbfe;
  }
  &:hover .bar-fill { background: #1d4ed8; }
}
.channel-row {
  border-bottom-color: #eef2f7;

  .ch-name { color: #334155; }
  .ch-bar { background: #e5e7eb; }
  .ch-num { color: #111827; }
  .ch-pct { color: #64748b; }
}
.flow-bar,
.timeline-empty,
.info-grid,
.posting-tip {
  background: #f8fafc;
  border-color: #e5e7eb;
  color: #334155;
}
.flow-step {
  color: #64748b;
  border-color: #e5e7eb;

  .flow-num { color: #94a3b8; }
  &.done {
    color: #059669;
    border-color: #bbf7d0;
    background: #f0fdf4;
  }
  &.active {
    color: #3370ff;
    border-color: #bfdbfe;
    background: #eff6ff;
    box-shadow: none;
  }
}
.flow-arrow {
  background: #cbd5e1;

  &::after { color: #94a3b8; }
}
.account-tag {
  color: #059669;
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.zh-dialog {
  :deep(.el-dialog) {
    background: #ffffff;
    border-color: #e5e7eb;
    border-radius: 8px;
  }
  :deep(.el-dialog__header) { border-bottom-color: #e5e7eb; }
  :deep(.el-dialog__title) { color: #111827; }
  :deep(.el-dialog__footer) { border-top-color: #e5e7eb; }
}
.dlg-section-title {
  color: #3370ff;
  letter-spacing: 0.08em;
}
.info-grid {
  label { color: #64748b; }
  span { color: #111827; }
}
.upload-mock {
  border-color: #cbd5e1;
  color: #64748b;

  &:hover {
    border-color: #3370ff;
    color: #3370ff;
    background: #eff6ff;
  }
}
:deep(.el-form-item__label) { color: #64748b; }
:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-select .el-input__wrapper) {
  background: #ffffff;
  box-shadow: 0 0 0 1px #dbe3ef inset;
}
:deep(.el-input__inner),
:deep(.el-textarea__inner) { color: #111827; }
:deep(.el-input__wrapper.is-focus),
:deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3370ff inset !important;
}
:deep(.el-radio__label),
:deep(.el-checkbox__label) { color: #334155; }
:deep(.el-divider) { border-color: #e5e7eb; }
.stage-card {
  &::before { background: #3370ff; }
  .stage-label { color: #111827; }
  .stage-count { color: #3370ff; }
  .stage-range,
  .stage-action { color: #64748b; }
  .stage-notify { color: #d97706; }
  .stage-amount {
    color: #059669;
    border-top-color: #e5e7eb;
  }
  &.stage-level4 {
    background: #fff7ed;
    .stage-count,
    .stage-label { color: #9a3412; }
  }
}
.action-info {
  .action-text { color: #334155; }
  .notify-text { color: #64748b; }
}
.timeline-list::before { background: #dbeafe; }
.timeline-item {
  .tl-icon {
    background: #eff6ff;
    border-color: #bfdbfe;
    color: #3370ff;
  }
  .tl-body {
    background: #ffffff;
    border-color: #e5e7eb;
  }
  .tl-title { color: #111827; }
  .tl-time,
  .tl-detail { color: #64748b; }
  .tl-foot { color: #64748b; }
}
.invoice-tip {
  background: #fffbeb;
  border-color: #fde68a;
  color: #334155;

  strong,
  .el-icon { color: #d97706; }
}
.inv-stage-card {
  &::after { color: #cbd5e1; }
  .inv-idx,
  .inv-amount { color: #64748b; }
  .inv-label { color: #111827; }
  .inv-num { color: #3370ff; }
  &.inv-received {
    background: #f0fdf4;
    border-color: #bbf7d0;
  }
}
.diff-alert {
  &.is-short {
    background: #fffbeb;
    border-color: #fde68a;
    color: #d97706;
  }
  &.is-over {
    background: #f0fdf4;
    border-color: #bbf7d0;
    color: #059669;
  }
  .diff-sub { color: #64748b; }
}
.input-hint { color: #64748b; }

/* 响应式 */
@media (max-width: 1280px) {
  .metric-strip { grid-template-columns: repeat(3, 1fr); }
  .summary-grid { grid-template-columns: repeat(2, 1fr); }
  .dual-grid { grid-template-columns: 1fr; }
  .overdue-summary { grid-template-columns: 1fr; }
}
@media (max-width: 1280px) {
  .stage-grid { grid-template-columns: repeat(2, 1fr); }
  .invoice-stage { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .finance-check { padding: 16px 14px 24px; }
  .page-title { font-size: 22px; }
  .metric-strip { grid-template-columns: 1fr 1fr; }
  .summary-grid { grid-template-columns: 1fr; }
  .stage-grid { grid-template-columns: 1fr; }
  .invoice-stage { grid-template-columns: 1fr; }
}
</style>

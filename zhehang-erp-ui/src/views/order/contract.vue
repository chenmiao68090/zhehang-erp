<template>
  <div class="contract-mgmt">
    <!-- ================== 页头 ================== -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">CONTRACT OPS</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }} · 合同运营台</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">合同管理</span>
          <span class="title-en">Lifecycle Operations</span>
        </h1>
        <p class="page-desc">从起草、签署、履约到续签归档，统一管理客户服务链路</p>
      </div>
      <div class="header-actions">
        <el-button class="btn-ghost" @click="openTemplateDialog">模板管理</el-button>
        <el-button class="btn-seal" type="primary" @click="openGenerateDialog">生成合同</el-button>
      </div>
      <div class="seal-decor">
        <div class="seal-circle">
          <span class="seal-inner">合同<br>管理</span>
        </div>
      </div>
    </header>

    <!-- ================== 顶部统计 ================== -->
    <section class="stat-strip">
      <div class="stat-cell s-active">
        <span class="cell-idx">／甲</span>
        <div class="cell-num">{{ statActive }}</div>
        <div class="cell-label">生效中合同</div>
      </div>
      <div class="stat-cell s-warn">
        <span class="cell-idx">／乙</span>
        <div class="cell-num">{{ statExpiring }}</div>
        <div class="cell-label">即将到期 · 30 天内</div>
      </div>
      <div class="stat-cell s-pending">
        <span class="cell-idx">／丙</span>
        <div class="cell-num">{{ statPending }}</div>
        <div class="cell-label">待签署</div>
      </div>
      <div class="stat-cell s-renew">
        <span class="cell-idx">／丁</span>
        <div class="cell-num">{{ statRenewed }}</div>
        <div class="cell-label">已续签</div>
      </div>
      <div class="stat-cell s-term">
        <span class="cell-idx">／戊</span>
        <div class="cell-num">{{ statTerminated }}</div>
        <div class="cell-label">已终止</div>
      </div>
    </section>

    <!-- ================== Tabs ================== -->
    <el-tabs v-model="activeTab" class="ct-tabs">
      <el-tab-pane v-for="t in tabDefs" :key="t.value" :label="t.label" :name="t.value" />
    </el-tabs>

    <!-- ================== 续费阶梯状态面板（仅「即将到期」选项卡可见） ================== -->
    <section v-if="activeTab === 'expiring'" class="panel stage-panel">
      <div class="panel-head">
        <div class="ph-left">
          <span class="ph-num">／零</span>
          <h3 class="ph-title">续签跟进看板</h3>
          <span class="ph-sub">RENEWAL STAGE BOARD</span>
        </div>
        <div class="ph-right stage-legend">
          <span><i class="dot dot-done"></i>已处理</span>
          <span><i class="dot dot-pending"></i>待处理</span>
          <span><i class="dot dot-overdue"></i>已过期</span>
        </div>
      </div>

      <div v-if="!expiringContracts.length" class="empty-cell">
        <span class="empty-mark">冷</span>
        <span class="empty-text">当前无即将到期合同</span>
      </div>

      <div v-else class="stage-list">
        <div
          v-for="row in expiringContracts"
          :key="row.id"
          class="stage-item"
        >
          <div class="si-head">
            <div class="si-meta">
              <span class="si-no mono">{{ row.contractNo }}</span>
              <span class="si-cust">{{ row.customerName }}</span>
              <span class="si-tpl">{{ row.templateName }}</span>
            </div>
            <div class="si-end">
              <span class="si-end-k">到期日</span>
              <span class="si-end-v mono">{{ row.endDate }}</span>
              <span class="si-days" :class="daysClass(daysLeft(row))">{{ formatDays(daysLeft(row)) }}</span>
            </div>
          </div>

          <ul class="stage-track">
            <li
              v-for="st in resolveStages(row)"
              :key="st.stage"
              class="stage-cell"
              :class="['st-' + st.status, st.active ? 'st-active' : '']"
            >
              <div class="sc-day">{{ st.stage === 0 ? '到期' : st.stage + ' 天' }}</div>
              <div class="sc-action">{{ stageDef(st.stage).action }}</div>
              <div class="sc-target">对象：{{ stageDef(st.stage).target }}</div>
              <div class="sc-status">
                <i class="dot" :class="'dot-' + st.status"></i>
                {{ statusText(st.status) }}
              </div>
              <div v-if="st.handler" class="sc-handler">{{ st.handler }} · {{ st.handledAt || '—' }}</div>
              <div v-if="st.note" class="sc-note">“{{ st.note }}”</div>
              <el-button
                v-if="st.status === 'pending' && st.active"
                size="small"
                class="sc-btn"
                @click="openStageDialog(row, st.stage)"
              >标记处理</el-button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ================== 合同列表 ================== -->
    <section class="panel">
      <div class="panel-head">
        <div class="ph-left">
          <span class="ph-num">／壹</span>
          <h3 class="ph-title">合同列表</h3>
          <span class="ph-sub">CONTRACT REGISTER</span>
        </div>
        <div class="ph-right">
          <el-input
            v-model="searchKey"
            placeholder="编号 / 客户 检索"
            clearable
            style="width: 220px"
            size="default"
          />
        </div>
      </div>

      <el-table :data="filteredList" class="ct-table" stripe v-loading="loading">
        <el-table-column prop="contractNo" label="合同编号" width="160">
          <template #default="{ row }">
            <span class="mono">{{ row.contractNo }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="customerName" label="客户名称" min-width="180">
          <template #default="{ row }">
            <span class="cust-name">{{ row.customerName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="服务内容" min-width="180">
          <template #default="{ row }">
            <span class="muted-line">{{ row.contractName || row.templateName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="合同金额" width="130" align="right">
          <template #default="{ row }">
            <span class="amount">¥ {{ formatMoney(row.contractAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="118">
          <template #default="{ row }">
            <el-tag
              :type="statusTag(deriveStatus(row)).type"
              :class="['ct-tag', deriveStatus(row) === 'expiring' ? 'blink' : '']"
              effect="plain"
              size="small"
            >
              {{ statusTag(deriveStatus(row)).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签署方式" width="110">
          <template #default="{ row }">
            <span class="sign-way">{{ signMethodLabel(row.signMethod) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startDate" label="开始日期" width="115" />
        <el-table-column prop="endDate" label="到期日期" width="115" />
        <el-table-column label="剩余天数" width="100" align="center">
          <template #default="{ row }">
            <span class="days-left" :class="daysClass(daysLeft(row))">
              {{ formatDays(daysLeft(row)) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDetail(row)">查看</el-button>
            <el-button
              v-if="row.signStatus === 'draft'"
              link
              type="warning"
              @click="editContract(row)"
            >编辑</el-button>
            <el-button
              v-if="row.signStatus === 'draft'"
              link
              type="success"
              @click="sendSign(row)"
            >发送签署</el-button>
            <el-button
              v-if="row.signStatus === 'sent' || row.signStatus === 'partial_signed'"
              link
              type="success"
              @click="confirmSign(row)"
            >确认签署</el-button>
            <el-button
              v-if="row.signStatus === 'signed' && !hasEffectiveLog(row)"
              link
              type="primary"
              @click="confirmEffective(row)"
            >确认生效</el-button>
            <el-button
              v-if="row.signStatus === 'signed'"
              link
              type="primary"
              @click="renewContract(row)"
            >续签</el-button>
            <el-button
              v-if="['signed','sent','partial_signed'].includes(row.signStatus)"
              link
              type="danger"
              @click="terminateContract(row)"
            >终止</el-button>
          </template>
        </el-table-column>

        <template #empty>
          <div class="empty-cell">
            <span class="empty-mark">无</span>
            <span class="empty-text">该状态下暂无合同记录</span>
          </div>
        </template>
      </el-table>

      <div class="pager-wrap">
        <el-pagination
          v-model:current-page="page.current"
          v-model:page-size="page.size"
          :total="page.total"
          layout="total, prev, pager, next"
          background
        />
      </div>
    </section>

    <!-- ================== 续签时间线 ================== -->
    <section class="panel timeline-panel">
      <div class="panel-head">
        <div class="ph-left">
          <span class="ph-num">／贰</span>
          <h3 class="ph-title">到期提醒时间线</h3>
          <span class="ph-sub">EXPIRY ALERT TIMELINE</span>
        </div>
      </div>
      <div class="timeline-track">
        <div
          v-for="(node, idx) in timelineNodes"
          :key="idx"
          class="tl-node"
          :class="node.tone"
        >
          <div class="tl-dot"></div>
          <div class="tl-day">{{ node.day }}</div>
          <div class="tl-title">{{ node.title }}</div>
          <div class="tl-desc">{{ node.desc }}</div>
        </div>
      </div>
    </section>

    <!-- ================== 生成合同 Dialog ================== -->
    <el-dialog
      v-model="genDialog.visible"
      title="生成合同"
      width="780px"
      class="ct-dialog"
      destroy-on-close
    >
      <el-form ref="genFormRef" :model="genForm" :rules="genRules" label-width="120px">
        <el-form-item label="关联订单" prop="orderId">
          <el-select
            v-model="genForm.orderId"
            placeholder="仅可选择已完成的订单"
            filterable
            style="width: 100%"
            @change="onOrderSelected"
          >
            <el-option
              v-for="o in completedOrders"
              :key="o.id"
              :label="`${o.orderNo} · ${o.customerName} · ¥${formatMoney(o.finalAmount)}`"
              :value="o.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="合同模板" prop="templateId">
          <el-select v-model="genForm.templateId" placeholder="请选择模板" style="width: 100%" @change="onTemplateSelected">
            <el-option
              v-for="t in enabledTemplates"
              :key="t.id"
              :label="`${t.templateName} · ${t.version}`"
              :value="t.id"
            />
          </el-select>
        </el-form-item>

        <div v-if="genForm.orderId && genForm.templateId" class="parties-grid">
          <div class="party-block">
            <div class="party-tag">甲方 · 客户</div>
            <div class="party-name">{{ genForm.partyAName }}</div>
          </div>
          <div class="party-vs">VS</div>
          <div class="party-block">
            <div class="party-tag">乙方 · 我方</div>
            <div class="party-name">{{ genForm.partyBName }}</div>
          </div>
        </div>

        <el-form-item v-if="genForm.serviceContent" label="服务内容">
          <el-input v-model="genForm.serviceContent" type="textarea" :rows="3" readonly />
        </el-form-item>

        <div class="form-row">
          <el-form-item label="服务期限" style="flex: 1">
            <el-input :model-value="`${genForm.startDate || '-'}  →  ${genForm.endDate || '-'}`" readonly />
          </el-form-item>
          <el-form-item label="合同金额" style="flex: 1">
            <el-input :model-value="`¥ ${formatMoney(genForm.contractAmount)}`" readonly />
          </el-form-item>
        </div>

        <el-form-item v-if="genForm.amountDetail" label="金额明细">
          <el-input v-model="genForm.amountDetail" type="textarea" :rows="3" readonly />
        </el-form-item>

        <el-form-item v-if="genForm.paymentClause" label="付款条款">
          <el-input v-model="genForm.paymentClause" type="textarea" :rows="2" readonly />
        </el-form-item>

        <el-form-item label="违约责任" prop="breachClause">
          <el-input v-model="genForm.breachClause" type="textarea" :rows="3" placeholder="预填模板违约条款，可编辑" />
        </el-form-item>

        <el-form-item label="保密条款">
          <el-input v-model="genForm.confidentialClause" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="其他约定">
          <el-input v-model="genForm.otherClause" type="textarea" :rows="2" placeholder="选填" />
        </el-form-item>

        <div class="form-row">
          <el-form-item label="签署方式" prop="signMethod" style="flex: 1">
            <el-select v-model="genForm.signMethod" style="width: 100%">
              <el-option label="e签宝电子签署" value="esign" />
              <el-option label="线下签署" value="paper" />
              <el-option label="邮寄签署" value="electronic" />
            </el-select>
          </el-form-item>
          <el-form-item label="我方签署人" prop="partyBSigner" style="flex: 1">
            <el-select v-model="genForm.partyBSigner" filterable style="width: 100%">
              <el-option v-for="s in signerOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </el-form-item>
        </div>

        <el-alert
          v-if="genForm.signMethod === 'esign'"
          type="warning"
          show-icon
          :closable="false"
          title="电子签署通道已预留"
          description="当前支持手动确认签署状态；后续接入电子签章服务后，可自动回写签署结果和归档文件。"
        />
      </el-form>

      <template #footer>
        <el-button @click="genDialog.visible = false">取消</el-button>
        <el-button class="btn-seal" type="primary" @click="submitGenerate">生成合同</el-button>
      </template>
    </el-dialog>

    <!-- ================== 编辑草稿 Dialog ================== -->
    <el-dialog v-model="editDialog.visible" title="编辑草稿合同" width="560px" destroy-on-close>
      <el-form :model="editDialog.form" label-width="110px">
        <el-form-item label="合同名称">
          <el-input v-model="editDialog.form.contractName" />
        </el-form-item>
        <el-form-item label="合同金额">
          <el-input-number v-model="editDialog.form.contractAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期">
          <el-date-picker v-model="editDialog.form.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="到期日期">
          <el-date-picker v-model="editDialog.form.endDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editDialog.form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <!-- ================== 合同详情 Drawer ================== -->
    <el-drawer
      v-model="detailDrawer.visible"
      :with-header="false"
      size="780px"
      class="ct-drawer"
    >
      <div v-if="detailDrawer.data" class="drawer-body">
        <div class="drawer-head">
          <div class="dh-top">
            <span class="dh-tag">合同详情</span>
            <el-tag
              :type="statusTag(deriveStatus(detailDrawer.data)).type"
              effect="dark"
              size="small"
            >
              {{ statusTag(deriveStatus(detailDrawer.data)).label }}
            </el-tag>
          </div>
          <h2 class="dh-title">{{ detailDrawer.data.contractName }}</h2>
          <div class="dh-no mono">№ {{ detailDrawer.data.contractNo }}</div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>基础信息</div>
          <ul class="ds-grid">
            <li><span class="k">合同编号</span><span class="v mono">{{ detailDrawer.data.contractNo }}</span></li>
            <li><span class="k">关联订单</span><span class="v mono">{{ detailDrawer.data.orderNo }}</span></li>
            <li><span class="k">合同状态</span><span class="v">{{ statusTag(deriveStatus(detailDrawer.data)).label }}</span></li>
            <li><span class="k">合同模板</span><span class="v">{{ detailDrawer.data.templateName }}</span></li>
            <li><span class="k">创建时间</span><span class="v mono">{{ detailDrawer.data.createTime }}</span></li>
            <li><span class="k">合同金额</span><span class="v amount">¥ {{ formatMoney(detailDrawer.data.contractAmount) }}</span></li>
          </ul>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>合同内容</div>
          <div class="content-blocks">
            <div class="cb">
              <div class="cb-k">甲方</div>
              <div class="cb-v">{{ detailDrawer.data.partyAName }}</div>
            </div>
            <div class="cb">
              <div class="cb-k">乙方</div>
              <div class="cb-v">{{ detailDrawer.data.partyBName }}</div>
            </div>
            <div class="cb">
              <div class="cb-k">服务内容</div>
              <div class="cb-v">{{ detailDrawer.data.contractName }}</div>
            </div>
            <div class="cb">
              <div class="cb-k">服务期限</div>
              <div class="cb-v mono">{{ detailDrawer.data.startDate }} → {{ detailDrawer.data.endDate }}</div>
            </div>
            <div class="cb">
              <div class="cb-k">备注</div>
              <div class="cb-v">{{ detailDrawer.data.remark || '—' }}</div>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>签署信息</div>
          <div class="sign-grid">
            <div class="sign-card">
              <div class="sg-tag">甲方</div>
              <div class="sg-signer">{{ detailDrawer.data.partyASigner || '待签署' }}</div>
              <div class="sg-time mono">{{ detailDrawer.data.partyASignTime || '—' }}</div>
            </div>
            <div class="sign-card">
              <div class="sg-tag">乙方</div>
              <div class="sg-signer">{{ detailDrawer.data.partyBSigner || '待签署' }}</div>
              <div class="sg-time mono">{{ detailDrawer.data.partyBSignTime || '—' }}</div>
            </div>
            <div class="sign-card">
              <div class="sg-tag">签署方式</div>
              <div class="sg-signer">{{ signMethodLabel(detailDrawer.data.signMethod) }}</div>
              <div class="sg-time">
                <el-link type="primary" :underline="false" @click="downloadFile(detailDrawer.data)">
                  {{ detailDrawer.data.signedFileUrl ? '已签署 PDF' : '原始合同 PDF' }} ↓
                </el-link>
              </div>
            </div>
          </div>

          <div v-if="detailDrawer.data.signMethod === 'esign'" class="esign-tip">
            <span class="tag-info">e签宝</span>
            电子签署通道已预留，当前可手动上传签署完成的 PDF：
            <el-button size="small" @click="ElMessage.info('上传文件占位 · 后续接入电子签章服务')">上传已签署合同</el-button>
            <el-button
              v-if="detailDrawer.data.signStatus !== 'signed'"
              size="small"
              type="success"
              @click="confirmSign(detailDrawer.data)"
            >确认签署完成</el-button>
          </div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>到期管理</div>
          <div class="exp-row">
            <div class="exp-cell">
              <div class="exp-k">开始日</div>
              <div class="exp-v mono">{{ detailDrawer.data.startDate }}</div>
            </div>
            <div class="exp-cell">
              <div class="exp-k">到期日</div>
              <div class="exp-v mono">{{ detailDrawer.data.endDate }}</div>
            </div>
            <div class="exp-cell">
              <div class="exp-k">剩余</div>
              <div class="exp-v" :class="daysClass(daysLeft(detailDrawer.data))">
                {{ formatDays(daysLeft(detailDrawer.data)) }}
              </div>
            </div>
            <div class="exp-cell wide">
              <div class="exp-k">续签意向</div>
              <el-radio-group v-model="renewIntent" size="small">
                <el-radio-button label="未联系" />
                <el-radio-button label="有意向" />
                <el-radio-button label="无意向" />
                <el-radio-button label="待定" />
              </el-radio-group>
            </div>
            <div class="exp-cell">
              <div class="exp-k">续签跟进人</div>
              <el-select v-model="renewFollower" size="small" style="width: 140px">
                <el-option v-for="s in signerOptions" :key="s" :label="s" :value="s" />
              </el-select>
            </div>
          </div>
        </div>

        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>操作历史</div>
          <el-timeline class="ct-timeline">
            <el-timeline-item
              v-for="(h, i) in detailHistory"
              :key="i"
              :timestamp="h.time"
              :color="h.color"
              placement="top"
            >
              <div class="th-line">
                <span class="th-action">{{ h.action }}</span>
                <span class="th-by">— {{ h.by }}</span>
              </div>
              <div v-if="h.note" class="th-note">{{ h.note }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <div class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>联动事件时间线</div>
          <div v-if="!linkageRecords.length" class="linkage-empty">暂无联动记录</div>
          <ul v-else class="linkage-list">
            <li v-for="(rec, i) in linkageRecords" :key="i" :class="['lk-item', 'lk-' + rec.type]">
              <span class="lk-time mono">{{ rec.time }}</span>
              <span class="lk-tag">{{ linkageTypeLabel(rec.type) }}</span>
              <span class="lk-title">{{ rec.title }}</span>
              <span v-if="rec.detail" class="lk-detail">— {{ rec.detail }}</span>
              <span v-if="rec.by" class="lk-by">· {{ rec.by }}</span>
            </li>
          </ul>
        </div>

        <div v-if="historyVersions.length > 1" class="drawer-section">
          <div class="ds-title"><i class="ds-bar"></i>合同版本历史 ({{ historyVersions.length }})</div>
          <ol class="version-list">
            <li
              v-for="v in historyVersions"
              :key="v.id"
              :class="['ver-item', v.id === detailDrawer.data!.id ? 'ver-current' : '']"
            >
              <span class="ver-no">v{{ v.version || 1 }}</span>
              <span class="ver-code mono">{{ v.contractNo }}</span>
              <span class="ver-name">{{ v.contractName }}</span>
              <span class="ver-amount amount">¥ {{ formatMoney(v.contractAmount) }}</span>
              <span class="ver-date mono">{{ v.startDate }} → {{ v.endDate }}</span>
              <el-tag
                :type="statusTag(deriveStatus(v)).type"
                effect="plain"
                size="small"
              >{{ statusTag(deriveStatus(v)).label }}</el-tag>
              <el-button v-if="v.id !== detailDrawer.data!.id" link type="primary" @click="openDetail(v)">查看</el-button>
            </li>
          </ol>
        </div>
      </div>
    </el-drawer>

    <!-- ================== 模板管理 Dialog ================== -->
    <el-dialog v-model="tplDialog.visible" title="合同模板管理" width="900px" destroy-on-close>
      <div class="tpl-head">
        <span class="tpl-sub">合同模板库 · 共 {{ templates.length }} 项</span>
        <el-button type="primary" size="small" @click="openTplForm()">＋ 新建模板</el-button>
      </div>

      <el-table :data="templates" class="ct-table" stripe>
        <el-table-column prop="templateName" label="模板名称" min-width="180" />
        <el-table-column label="适用服务类型" width="140">
          <template #default="{ row }">{{ serviceTypeLabel(row.serviceType) }}</template>
        </el-table-column>
        <el-table-column label="变量数" width="90" align="center">
          <template #default="{ row }">
            <span class="var-count">{{ countTplVars(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" effect="plain" size="small">
              {{ row.enabled ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="90" />
        <el-table-column prop="updateTime" label="最后更新" width="160" />
        <el-table-column label="操作" width="170" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openTplForm(row)">编辑</el-button>
            <el-button link :type="row.enabled ? 'warning' : 'success'" @click="toggleTpl(row)">
              {{ row.enabled ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 模板表单 -->
      <el-dialog
        v-model="tplFormDialog.visible"
        :title="tplFormDialog.id ? '编辑模板' : '新建模板'"
        width="640px"
        append-to-body
        destroy-on-close
      >
        <el-form :model="tplForm" label-width="120px">
          <el-form-item label="模板名称">
            <el-input v-model="tplForm.templateName" />
          </el-form-item>
          <el-form-item label="适用服务类型">
            <el-select v-model="tplForm.serviceType" style="width: 100%">
              <el-option v-for="s in serviceTypeOptions" :key="s.value" :label="s.label" :value="s.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="模板内容">
            <el-input v-model="tplForm.templateContent" type="textarea" :rows="8" placeholder="支持模板变量插入" />
          </el-form-item>
          <el-form-item label="可用变量">
            <div class="var-tags">
              <span class="var-chip" v-for="v in tplVariables" :key="v">${{ '{' }}{{ v }}{{ '}' }}</span>
            </div>
          </el-form-item>
          <el-form-item label="排序号">
            <el-input v-model="tplForm.version" placeholder="如 v1.0" />
          </el-form-item>
          <el-form-item label="启用">
            <el-switch v-model="tplForm.enabled" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="tplFormDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitTplForm">保存</el-button>
        </template>
      </el-dialog>

      <template #footer>
        <el-button @click="tplDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- ================== 续签 Dialog ================== -->
    <el-dialog v-model="renewDialog.visible" title="续签合同" width="560px" destroy-on-close>
      <el-alert
        type="info"
        show-icon
        :closable="false"
        title="续签后原合同将标记为「已续签」，新合同以草稿状态生成并保留版本号关联"
        style="margin-bottom: 14px"
      />
      <el-form :model="renewDialog.form" label-width="120px">
        <el-form-item label="原合同编号">
          <el-input :model-value="renewDialog.form.oldNo" readonly />
        </el-form-item>
        <el-form-item label="新合同金额">
          <el-input-number v-model="renewDialog.form.contractAmount" :min="0" :precision="2" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="服务期限">
          <div class="date-range-row">
            <el-date-picker v-model="renewDialog.form.startDate" type="date" value-format="YYYY-MM-DD" style="flex: 1" />
            <span class="range-arrow">→</span>
            <el-date-picker v-model="renewDialog.form.endDate" type="date" value-format="YYYY-MM-DD" style="flex: 1" />
          </div>
        </el-form-item>
        <el-form-item label="调整服务内容">
          <el-switch v-model="renewDialog.form.adjustService" />
        </el-form-item>
        <el-form-item v-if="renewDialog.form.adjustService" label="新服务内容">
          <el-input
            v-model="renewDialog.form.serviceContent"
            type="textarea"
            :rows="3"
            placeholder="请说明续签后服务内容的调整点"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="renewDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitRenew">生成续签合同</el-button>
      </template>
    </el-dialog>

    <!-- ================== 终止 Dialog ================== -->
    <el-dialog v-model="termDialog.visible" title="终止合同" width="500px" destroy-on-close>
      <el-alert type="warning" show-icon :closable="false" title="终止后该合同将不可恢复，关联进行中任务建议同步取消" />
      <el-form :model="termDialog.form" label-width="100px" style="margin-top: 16px">
        <el-form-item label="终止原因">
          <el-input v-model="termDialog.form.reason" type="textarea" :rows="4" placeholder="请说明终止原因（必填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="termDialog.visible = false">取消</el-button>
        <el-button type="danger" @click="submitTerminate">确认终止</el-button>
      </template>
    </el-dialog>

    <!-- ================== 阶梯处理 Dialog ================== -->
    <el-dialog v-model="stageDialog.visible" title="阶梯处理记录" width="520px" destroy-on-close>
      <div class="stage-dialog-head">
        <span class="sd-day">{{ stageDialog.form.stage === 0 ? '到期当天' : stageDialog.form.stage + ' 天阶梯' }}</span>
        <span class="sd-action">{{ stageDef(stageDialog.form.stage as 60 | 45 | 30 | 15 | 7 | 0).action }}</span>
      </div>
      <el-form :model="stageDialog.form" label-width="100px" style="margin-top: 12px">
        <el-form-item label="处理人">
          <el-select v-model="stageDialog.form.handler" filterable style="width: 100%">
            <el-option v-for="s in signerOptions" :key="s" :label="s" :value="s" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-radio-group v-model="stageDialog.form.status">
            <el-radio-button label="done">已处理</el-radio-button>
            <el-radio-button label="overdue">已过期</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="处理备注">
          <el-input v-model="stageDialog.form.note" type="textarea" :rows="3" placeholder="记录本阶梯的客户反馈与后续动作" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="stageDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitStage">保存处理记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { contractMgmtApi, type BizContract, type BizContractTemplate, type ContractStageRecord, type ContractLinkageRecord } from '@/api/contract-mgmt'
import { orderApi, type BizOrder } from '@/api/order'
import { onContractEffective } from '@/utils/biz-linkage'

// ============== 基础状态 ==============
const loading = ref(false)
const list = ref<BizContract[]>([])
const templates = ref<BizContractTemplate[]>([])
const orders = ref<BizOrder[]>([])
const searchKey = ref('')
const activeTab = ref('all')

const page = reactive({ current: 1, size: 10, total: 0 })

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const tabDefs = [
  { label: '全部', value: 'all' },
  { label: '草稿', value: 'draft' },
  { label: '待签署', value: 'sent' },
  { label: '已生效', value: 'signed' },
  { label: '履行中', value: 'performing' },
  { label: '即将到期', value: 'expiring' },
  { label: '已到期', value: 'expired' },
  { label: '已续签', value: 'renewed' },
  { label: '已终止', value: 'terminated' }
]

const serviceTypeOptions = [
  { label: '代理记账', value: 'bookkeeping' },
  { label: '注册公司', value: 'registration' },
  { label: '税务筹划', value: 'tax_planning' },
  { label: '资质代办', value: 'qualification' },
  { label: '审计报告', value: 'audit' },
  { label: '公司注销', value: 'cancellation' },
  { label: '其他', value: 'other' }
]
const serviceTypeLabel = (v: string) =>
  serviceTypeOptions.find(s => s.value === v)?.label ?? v

const signerOptions = ['陈苗', '李建国', '王晓敏', '陈思羽', '周慧', '杨树']

const tplVariables = ['partyAName', 'partyBName', 'startDate', 'endDate', 'contractAmount', 'serviceContent']

// ============== 续费阶梯配置 ==============
type StageNum = 60 | 45 | 30 | 15 | 7 | 0
const STAGE_DEFS: Array<{ stage: StageNum; action: string; target: string }> = [
  { stage: 60, action: '首次提醒：标记即将到期', target: '销售' },
  { stage: 45, action: '销售联系客户确认续签意向', target: '销售' },
  { stage: 30, action: '通知主管，制定续签计划', target: '销售 + 主管' },
  { stage: 15, action: '主管每周检查续签进度', target: '主管' },
  { stage: 7,  action: '最后续签努力，高优触达', target: '销售 + 主管' },
  { stage: 0,  action: '未续签→入藏金阁；已续签→生效新合同', target: '全员' }
]
const stageDef = (s: StageNum) =>
  STAGE_DEFS.find(x => x.stage === s) || STAGE_DEFS[STAGE_DEFS.length - 1]
const statusText = (s: 'pending' | 'done' | 'overdue') =>
  ({ pending: '待处理', done: '已处理', overdue: '已过期' } as Record<string, string>)[s] ?? s

const linkageTypeLabel = (t: ContractLinkageRecord['type']) =>
  ({
    effective: '生效',
    task_dispatched: '任务派发',
    renew: '续签',
    terminate: '终止',
    stage_alert: '阶梯',
    sign: '签署'
  } as Record<string, string>)[t] ?? t

// ============== 工具方法 ==============
const formatMoney = (n?: number) =>
  (n ?? 0).toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

const dayDiff = (dateStr: string) => {
  if (!dateStr) return 0
  const a = new Date(dateStr).setHours(0, 0, 0, 0)
  const b = new Date().setHours(0, 0, 0, 0)
  return Math.round((a - b) / 86400000)
}
const daysLeft = (row: BizContract) => dayDiff(row.endDate)
const formatDays = (d: number) => (d < 0 ? `逾期 ${-d} 天` : `${d} 天`)
const daysClass = (d: number) => {
  if (d <= 0) return 'd-expired'
  if (d <= 7) return 'd-red'
  if (d <= 15) return 'd-orange'
  if (d <= 30) return 'd-yellow'
  if (d <= 60) return 'd-blue'
  return 'd-normal'
}

const signMethodLabel = (m: string) =>
  ({
    paper: '线下签署',
    electronic: '邮寄签署',
    fadada: '法大大',
    esign: 'e签宝'
  } as Record<string, string>)[m] ?? m

// ============== 状态派生 ==============
type DerivedStatus =
  | 'draft' | 'sent' | 'signed' | 'performing'
  | 'expiring' | 'expired' | 'renewed' | 'terminated'

function deriveStatus(row: BizContract): DerivedStatus {
  if (row.signStatus === 'draft') return 'draft'
  if (row.signStatus === 'sent' || row.signStatus === 'partial_signed') return 'sent'
  if (row.signStatus === 'renewed') return 'renewed'
  if (row.signStatus === 'terminated') return 'terminated'
  if (row.signStatus === 'expired') return 'expired'
  if (row.signStatus === 'signed') {
    const left = dayDiff(row.endDate)
    if (left < 0) return 'expired'
    if (left <= 30) return 'expiring'
    const start = dayDiff(row.startDate)
    if (start <= 0) return 'performing'
    return 'signed'
  }
  return 'draft'
}

const statusMap: Record<DerivedStatus, { label: string; type: 'info' | 'warning' | 'success' | 'primary' | 'danger' }> = {
  draft:       { label: '草稿',     type: 'info'    },
  sent:        { label: '待签署',   type: 'warning' },
  signed:      { label: '已生效',   type: 'success' },
  performing:  { label: '履行中',   type: 'primary' },
  expiring:    { label: '即将到期', type: 'warning' },
  expired:     { label: '已到期',   type: 'danger'  },
  renewed:     { label: '已续签',   type: 'success' },
  terminated:  { label: '已终止',   type: 'info'    }
}
const statusTag = (s: DerivedStatus) => statusMap[s]

// ============== 列表筛选 ==============
const filteredList = computed(() => {
  let arr = list.value
  if (activeTab.value !== 'all') {
    arr = arr.filter(c => deriveStatus(c) === activeTab.value)
  }
  if (searchKey.value.trim()) {
    const k = searchKey.value.trim()
    arr = arr.filter(c =>
      c.contractNo.includes(k) ||
      (c.customerName || '').includes(k) ||
      (c.contractName || '').includes(k)
    )
  }
  page.total = arr.length
  const start = (page.current - 1) * page.size
  return arr.slice(start, start + page.size)
})

// ============== 顶部统计 ==============
const statActive    = computed(() =>
  list.value.filter(c => ['signed'].includes(c.signStatus) && dayDiff(c.endDate) > 0).length
)
const statExpiring  = computed(() =>
  list.value.filter(c => c.signStatus === 'signed' && dayDiff(c.endDate) <= 30 && dayDiff(c.endDate) >= 0).length
)
const statPending   = computed(() =>
  list.value.filter(c => ['sent', 'partial_signed'].includes(c.signStatus)).length
)
const statRenewed   = computed(() => list.value.filter(c => c.signStatus === 'renewed').length)
const statTerminated = computed(() => list.value.filter(c => c.signStatus === 'terminated').length)

// ============== 续签时间线节点 ==============
const timelineNodes = [
  { day: '60 天', title: '即将到期标记',  desc: '系统自动标识到期合同',     tone: 'tone-yellow' },
  { day: '45 天', title: '销售联系客户',  desc: '触发外呼任务，留下沟通记录', tone: 'tone-orange' },
  { day: '30 天', title: '通知主管',      desc: '主管介入跟进续签进展',     tone: 'tone-orange' },
  { day: '15 天', title: '周检查',        desc: '每周复盘客户续签意向',     tone: 'tone-red' },
  { day: '7 天',  title: '最后努力',      desc: '高优触达，必要时安排面谈', tone: 'tone-red' },
  { day: '到期',  title: '未续签 → 藏金阁', desc: '客户进入他司服务即将到期池', tone: 'tone-dark' }
]

// ============== 数据加载 ==============
async function loadList() {
  loading.value = true
  try {
    const r = await contractMgmtApi.list({ page: 1, pageSize: 999 })
    list.value = r.list
  } finally {
    loading.value = false
  }
}
async function loadTemplates() {
  templates.value = await contractMgmtApi.getTemplates()
}
async function loadOrders() {
  const r = await orderApi.list({ page: 1, pageSize: 200 })
  orders.value = r.list
}

const completedOrders = computed(() => orders.value.filter(o => o.status === 'completed'))
const enabledTemplates = computed(() => templates.value.filter(t => t.enabled))

// ============== 详情 Drawer ==============
const detailDrawer = reactive<{ visible: boolean; data: BizContract | null }>({
  visible: false,
  data: null
})
const renewIntent = ref<'未联系' | '有意向' | '无意向' | '待定'>('未联系')
const renewFollower = ref('陈苗')

const detailHistory = computed(() => {
  const d = detailDrawer.data
  if (!d) return []
  const items: Array<{ time: string; action: string; by: string; color: string; note?: string }> = []
  items.push({ time: d.createTime, action: '合同创建（草稿）', by: '系统', color: '#909399' })
  if (d.partyBSignTime) items.push({ time: d.partyBSignTime, action: '乙方签署', by: d.partyBSigner || '乙方', color: '#409eff' })
  if (d.partyASignTime) items.push({ time: d.partyASignTime, action: '甲方签署', by: d.partyASigner || '甲方', color: '#67c23a' })
  if (d.signStatus === 'renewed') items.push({ time: d.createTime, action: '已续签', by: '系统', color: '#67c23a', note: d.remark })
  if (d.signStatus === 'terminated') items.push({ time: d.createTime, action: '合同终止', by: '管理员', color: '#f56c6c', note: d.remark })
  return items.sort((a, b) => (a.time || '').localeCompare(b.time || ''))
})

function openDetail(row: BizContract) {
  detailDrawer.data = row
  detailDrawer.visible = true
  loadHistory(row)
}

const historyVersions = ref<BizContract[]>([])
async function loadHistory(row: BizContract) {
  try {
    historyVersions.value = await contractMgmtApi.history(row.id)
  } catch {
    historyVersions.value = []
  }
}

const linkageRecords = computed<ContractLinkageRecord[]>(() => {
  const d = detailDrawer.data
  if (!d || !d.linkageRecords) return []
  return [...d.linkageRecords].sort((a, b) => (b.time || '').localeCompare(a.time || ''))
})

const hasEffectiveLog = (row: BizContract) =>
  !!(row.linkageRecords && row.linkageRecords.some(r => r.type === 'task_dispatched'))

// ============== 即将到期阶梯面板 ==============
const expiringContracts = computed(() =>
  list.value
    .filter(c => c.signStatus === 'signed' && dayDiff(c.endDate) <= 60 && dayDiff(c.endDate) >= 0)
    .sort((a, b) => dayDiff(a.endDate) - dayDiff(b.endDate))
)

function resolveStages(row: BizContract) {
  const stages = (row.renewStages && row.renewStages.length
    ? row.renewStages
    : STAGE_DEFS.map(d => ({ stage: d.stage, status: 'pending' as const }))
  )
  const left = dayDiff(row.endDate)
  return stages.map(s => {
    let active = false
    if (s.stage === 0 && left <= 0) active = true
    else if (s.stage === 7 && left > 0 && left <= 7) active = true
    else if (s.stage === 15 && left > 7 && left <= 15) active = true
    else if (s.stage === 30 && left > 15 && left <= 30) active = true
    else if (s.stage === 45 && left > 30 && left <= 45) active = true
    else if (s.stage === 60 && left > 45 && left <= 60) active = true
    let status: ContractStageRecord['status'] = s.status
    if (status === 'pending' && left < s.stage - 7) {
      // 已走过该阶梯仍未处理，系统推导为过期
      status = 'overdue'
    }
    return { ...s, status, active }
  })
}
function downloadFile(row: BizContract) {
  const url = row.signedFileUrl || row.contractFileUrl
  ElMessage.success(`已触发下载：${url}`)
}

// ============== 生成合同 Dialog ==============
const genFormRef = ref()
const genDialog = reactive({ visible: false })
const genForm = reactive({
  orderId: undefined as number | undefined,
  templateId: undefined as number | undefined,
  partyAName: '',
  partyBName: '浙杭企业服务有限公司',
  serviceContent: '',
  startDate: '',
  endDate: '',
  contractAmount: 0,
  amountDetail: '',
  paymentClause: '',
  breachClause: '若任一方违约，应按本合同约定金额的 20% 支付违约金；逾期付款按日万分之五计违约金。',
  confidentialClause: '双方就本合同涉及的商业秘密、客户信息等承担保密义务，期限自合同签署之日起 3 年。',
  otherClause: '',
  signMethod: 'paper' as 'paper' | 'electronic' | 'esign',
  partyBSigner: '陈苗',
  customerId: 0,
  orderNo: ''
})
const genRules = {
  orderId: [{ required: true, message: '请选择关联订单', trigger: 'change' }],
  templateId: [{ required: true, message: '请选择合同模板', trigger: 'change' }],
  signMethod: [{ required: true, message: '请选择签署方式', trigger: 'change' }],
  partyBSigner: [{ required: true, message: '请选择我方签署人', trigger: 'change' }]
}

function openGenerateDialog() {
  Object.assign(genForm, {
    orderId: undefined, templateId: undefined,
    partyAName: '', serviceContent: '',
    startDate: '', endDate: '', contractAmount: 0,
    amountDetail: '', paymentClause: '',
    breachClause: '若任一方违约，应按本合同约定金额的 20% 支付违约金；逾期付款按日万分之五计违约金。',
    confidentialClause: '双方就本合同涉及的商业秘密、客户信息等承担保密义务，期限自合同签署之日起 3 年。',
    otherClause: '', signMethod: 'paper', partyBSigner: '陈苗',
    customerId: 0, orderNo: ''
  })
  genDialog.visible = true
}

function onOrderSelected(orderId: number) {
  const o = orders.value.find(x => x.id === orderId)
  if (!o) return
  genForm.partyAName = o.customerName || ''
  genForm.customerId = o.customerId
  genForm.orderNo = o.orderNo
  genForm.contractAmount = o.finalAmount
  if (o.items.length) {
    const dates = o.items.map(i => i.startDate).sort()
    const ends = o.items.map(i => i.endDate).sort()
    genForm.startDate = dates[0]
    genForm.endDate = ends[ends.length - 1]
    genForm.serviceContent = o.items.map(i => `· ${i.description}`).join('\n')
    genForm.amountDetail = o.items
      .map(i => `· ${i.description}：¥${formatMoney(i.finalAmount)}（折扣 ${i.discountRate}%）`)
      .join('\n')
  }
  genForm.paymentClause = `付款方式：${paymentLabel(o.paymentMethod)}；${o.paymentTimeReq || ''}`
}

function paymentLabel(m: string) {
  return ({
    lump_sum: '一次性付清',
    monthly: '按月支付',
    quarterly: '按季支付',
    semi_annual: '按半年支付',
    annual: '按年支付',
    installment: '分期支付'
  } as Record<string, string>)[m] ?? m
}

function onTemplateSelected(tid: number) {
  const t = templates.value.find(x => x.id === tid)
  if (!t) return
  if (!genForm.breachClause.includes('违约')) {
    genForm.breachClause = t.templateContent
  }
}

async function submitGenerate() {
  if (!genFormRef.value) return
  const ok = await genFormRef.value.validate().catch(() => false)
  if (!ok) return
  await contractMgmtApi.generate({
    orderId: genForm.orderId!,
    orderNo: genForm.orderNo,
    customerId: genForm.customerId,
    customerName: genForm.partyAName,
    templateId: genForm.templateId!,
    contractAmount: genForm.contractAmount,
    startDate: genForm.startDate,
    endDate: genForm.endDate,
    partyAName: genForm.partyAName,
    partyBName: genForm.partyBName,
    remark: genForm.otherClause
  })
  ElMessage.success('合同已生成（草稿）')
  genDialog.visible = false
  await loadList()
}

// ============== 编辑草稿 ==============
const editDialog = reactive({
  visible: false,
  form: {
    id: 0,
    contractName: '',
    contractAmount: 0,
    startDate: '',
    endDate: '',
    remark: ''
  }
})
function editContract(row: BizContract) {
  editDialog.form = {
    id: row.id,
    contractName: row.contractName,
    contractAmount: row.contractAmount,
    startDate: row.startDate,
    endDate: row.endDate,
    remark: row.remark
  }
  editDialog.visible = true
}
async function submitEdit() {
  await contractMgmtApi.update({ ...editDialog.form })
  ElMessage.success('已保存')
  editDialog.visible = false
  await loadList()
}

// ============== 发送签署 / 确认签署 ==============
async function sendSign(row: BizContract) {
  await ElMessageBox.confirm(`确认发送合同「${row.contractNo}」至客户签署？`, '发送签署', { type: 'success' })
    .then(async () => {
      await contractMgmtApi.sendSign({ id: row.id, signMethod: row.signMethod })
      ElMessage.success('已发起签署流程')
      await loadList()
    })
    .catch(() => {})
}

async function confirmSign(row: BizContract) {
  await ElMessageBox.prompt('请输入甲方签署人姓名以确认签署完成', '确认签署', {
    inputValue: row.partyASigner || row.customerName?.slice(0, 3) || '客户',
    inputValidator: (v) => !!v || '签署人不能为空'
  }).then(async ({ value }) => {
    await contractMgmtApi.confirmSign({ id: row.id, party: 'A', signer: value })
    ElMessage.success('已确认签署完成')
    await loadList()
    if (detailDrawer.data?.id === row.id) {
      const fresh = await contractMgmtApi.detail(row.id)
      if (fresh) detailDrawer.data = fresh
    }
  }).catch(() => {})
}

// ============== 续签 ==============
const renewDialog = reactive({
  visible: false,
  form: {
    id: 0,
    oldNo: '',
    contractAmount: 0,
    startDate: '',
    endDate: '',
    adjustService: false,
    serviceContent: ''
  }
})
function renewContract(row: BizContract) {
  const start = new Date(row.endDate)
  start.setDate(start.getDate() + 1)
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + 1)
  renewDialog.form = {
    id: row.id,
    oldNo: row.contractNo,
    contractAmount: row.contractAmount,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    adjustService: false,
    serviceContent: ''
  }
  renewDialog.visible = true
}
async function submitRenew() {
  await contractMgmtApi.renew({
    id: renewDialog.form.id,
    contractAmount: renewDialog.form.contractAmount,
    startDate: renewDialog.form.startDate,
    endDate: renewDialog.form.endDate,
    adjustService: renewDialog.form.adjustService,
    serviceContent: renewDialog.form.serviceContent
  })
  ElMessage.success('已生成续签合同（草稿状态，请补签）')
  renewDialog.visible = false
  await loadList()
}

// ============== 终止 ==============
const termDialog = reactive({
  visible: false,
  form: { id: 0, reason: '' }
})
function terminateContract(row: BizContract) {
  termDialog.form = { id: row.id, reason: '' }
  termDialog.visible = true
}
async function submitTerminate() {
  if (!termDialog.form.reason.trim()) {
    ElMessage.warning('请填写终止原因')
    return
  }
  await contractMgmtApi.terminate(termDialog.form)
  ElMessage.success('合同已终止，关联进行中任务请同步取消')
  termDialog.visible = false
  await loadList()
  if (detailDrawer.data?.id === termDialog.form.id) {
    const fresh = await contractMgmtApi.detail(termDialog.form.id)
    if (fresh) detailDrawer.data = fresh
  }
}

// ============== 确认生效 · 联动任务中心 ==============
const SERVICE_TASK_TEMPLATES: Record<string, string[]> = {
  bookkeeping:   ['资料收集', '建账', '税务报到'],
  registration:  ['公司注册、刻章、银行开户'],
  tax_planning:  ['现状梳理', '方案制定', '方案落地'],
  qualification: ['资质材料准备', '提交申请', '跟进结果'],
  audit:         ['财务对账', '出具审计报告'],
  cancellation:  ['税务清算', '工商注销'],
  other:         ['综合服务任务拆分']
}
function taskTitlesOf(row: BizContract): string[] {
  const tpl = templates.value.find(t => t.id === row.contractTemplateId)
  const key = tpl?.serviceType || 'other'
  return SERVICE_TASK_TEMPLATES[key] || SERVICE_TASK_TEMPLATES.other
}
async function confirmEffective(row: BizContract) {
  const titles = taskTitlesOf(row)
  await ElMessageBox.confirm(
    `确认合同「${row.contractNo}」已生效？\n系统将联动创建服务任务：${titles.join('、')}`,
    '确认生效',
    { type: 'success', confirmButtonText: '确认生效并派发任务' }
  ).then(async () => {
    // 1) 调用联动函数（写入 biz_contract_list / biz_task_list）
    try { onContractEffective(row.id) } catch (e) { /* ignore */ }
    // 2) 记录联动事件到合同时间线
    await contractMgmtApi.markEffective({ id: row.id, taskTitles: titles })
    ElMessage.success('合同已生效，服务任务已自动创建')
    await loadList()
    if (detailDrawer.data?.id === row.id) {
      const fresh = await contractMgmtApi.detail(row.id)
      if (fresh) {
        detailDrawer.data = fresh
        await loadHistory(fresh)
      }
    }
  }).catch(() => {})
}

// ============== 阶梯处理 Dialog ==============
const stageDialog = reactive({
  visible: false,
  form: {
    id: 0,
    stage: 60 as StageNum,
    status: 'done' as 'done' | 'overdue',
    handler: '陈苗',
    note: ''
  }
})
function openStageDialog(row: BizContract, stage: StageNum) {
  stageDialog.form = {
    id: row.id,
    stage,
    status: 'done',
    handler: '陈苗',
    note: ''
  }
  stageDialog.visible = true
}
async function submitStage() {
  await contractMgmtApi.updateStage({
    id: stageDialog.form.id,
    stage: stageDialog.form.stage,
    status: stageDialog.form.status,
    handler: stageDialog.form.handler,
    note: stageDialog.form.note
  })
  ElMessage.success('阶梯处理记录已保存')
  stageDialog.visible = false
  await loadList()
}

// ============== 模板管理 ==============
const tplDialog = reactive({ visible: false })
const tplFormDialog = reactive({ visible: false, id: 0 })
const tplForm = reactive<Partial<BizContractTemplate>>({
  templateName: '',
  serviceType: 'bookkeeping',
  templateContent: '',
  version: 'v1.0',
  enabled: true
})

function openTemplateDialog() {
  tplDialog.visible = true
}
function openTplForm(row?: BizContractTemplate) {
  if (row) {
    tplFormDialog.id = row.id
    Object.assign(tplForm, row)
  } else {
    tplFormDialog.id = 0
    Object.assign(tplForm, {
      id: undefined, templateName: '', serviceType: 'bookkeeping',
      templateContent: '', version: 'v1.0', enabled: true
    })
  }
  tplFormDialog.visible = true
}
async function submitTplForm() {
  const payload: Partial<BizContractTemplate> = { ...tplForm }
  if (tplFormDialog.id) payload.id = tplFormDialog.id
  await contractMgmtApi.saveTemplate(payload)
  ElMessage.success('已保存模板')
  tplFormDialog.visible = false
  await loadTemplates()
}
async function toggleTpl(row: BizContractTemplate) {
  await contractMgmtApi.saveTemplate({ id: row.id, enabled: !row.enabled })
  ElMessage.success(row.enabled ? '已停用' : '已启用')
  await loadTemplates()
}

/** 模板变量数量统计 */
function countTplVars(row: BizContractTemplate): number {
  try {
    const arr = JSON.parse(row.variableJson || '[]')
    return Array.isArray(arr) ? arr.length : 0
  } catch {
    return 0
  }
}

// ============== 初始化 ==============
onMounted(async () => {
  await Promise.all([contractMgmtApi.ensureSamples(), orderApi.ensureSamples()])
  await Promise.all([loadList(), loadTemplates(), loadOrders()])
})
</script>

<style scoped>
/* ============ 整体调性：法律档案 / 朱砂红 ============ */
.contract-mgmt {
  --paper:    #fbf7ee;
  --paper-2:  #f5eedd;
  --ink:      #1a1a1a;
  --ink-2:    #3a3a3a;
  --rule:     #d8cfb8;
  --seal:     #b3261c;
  --seal-2:   #d6402e;
  --gold:     #b08842;
  --muted:    #7a7565;

  padding: 24px 28px 40px;
  min-height: 100%;
  background:
    radial-gradient(ellipse 80% 60% at 0% 0%, rgba(176, 136, 66, .08), transparent 60%),
    radial-gradient(ellipse 80% 60% at 100% 100%, rgba(179, 38, 28, .05), transparent 60%),
    var(--paper);
  font-family: 'Songti SC', 'STSong', 'PingFang SC', 'Microsoft YaHei', serif;
  color: var(--ink);
}

/* ============ 页头 ============ */
.page-header {
  position: relative;
  padding: 32px 36px 28px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 4px;
  margin-bottom: 20px;
  overflow: hidden;
}
.page-header::before {
  content: '';
  position: absolute;
  inset: 6px;
  border: 1px solid var(--rule);
  pointer-events: none;
  border-radius: 2px;
}
.page-header::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
  background: linear-gradient(180deg, var(--seal), var(--gold));
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.22em;
  font-family: 'Courier New', monospace;
}
.meta-tag {
  padding: 3px 10px;
  background: var(--ink);
  color: var(--paper);
  font-weight: 700;
  letter-spacing: 0.2em;
}
.meta-divider { width: 32px; height: 1px; background: var(--rule); }
.header-main { margin-top: 14px; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 18px;
  margin: 0;
  font-size: 32px;
  letter-spacing: 0.18em;
  font-weight: 700;
}
.title-cn { color: var(--ink); border-bottom: 2px solid var(--seal); padding-bottom: 4px; }
.title-en {
  font-family: 'Georgia', serif;
  font-style: italic;
  font-size: 13px;
  letter-spacing: 0.32em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 500;
}
.page-desc {
  margin: 10px 0 0;
  font-size: 13px;
  color: var(--ink-2);
  letter-spacing: 0.08em;
}
.header-actions {
  position: absolute;
  right: 36px;
  top: 32px;
  display: flex;
  gap: 10px;
}
.btn-ghost {
  background: #fff !important;
  border: 1px solid var(--ink) !important;
  color: var(--ink) !important;
  border-radius: 0 !important;
  letter-spacing: 0.2em;
  font-weight: 600;
  padding: 0 18px !important;
  height: 36px !important;
}
.btn-ghost:hover { background: var(--ink) !important; color: var(--paper) !important; }
.btn-seal {
  background: var(--seal) !important;
  border: 1px solid var(--seal) !important;
  color: #fff !important;
  border-radius: 0 !important;
  letter-spacing: 0.18em;
  font-weight: 600;
  padding: 0 20px !important;
  height: 36px !important;
  box-shadow: 2px 2px 0 var(--ink);
}
.btn-seal:hover { background: var(--seal-2) !important; transform: translate(-1px, -1px); box-shadow: 3px 3px 0 var(--ink); }

.seal-decor {
  position: absolute;
  right: -30px;
  bottom: -30px;
  width: 200px;
  height: 200px;
  pointer-events: none;
  opacity: 0.18;
}
.seal-circle {
  width: 100%; height: 100%;
  border: 4px double var(--seal);
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
  transform: rotate(-12deg);
}
.seal-circle::after {
  content: '';
  position: absolute; inset: 14px;
  border: 1px solid var(--seal);
  border-radius: 50%;
}
.seal-inner {
  color: var(--seal);
  font-weight: 800;
  font-size: 22px;
  text-align: center;
  letter-spacing: 0.3em;
  line-height: 1.4;
}

/* ============ 顶部统计 ============ */
.stat-strip {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0;
  margin-bottom: 22px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 4px;
  overflow: hidden;
}
.stat-cell {
  position: relative;
  padding: 22px 26px;
  border-right: 1px solid var(--rule);
  transition: background .25s ease;
}
.stat-cell:last-child { border-right: 0; }
.stat-cell:hover { background: var(--paper-2); }
.cell-idx {
  position: absolute;
  top: 12px; right: 14px;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.2em;
  font-family: 'Courier New', monospace;
}
.cell-num {
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
  letter-spacing: -0.02em;
}
.cell-label {
  margin-top: 10px;
  font-size: 13px;
  color: var(--ink-2);
  letter-spacing: 0.12em;
}
.stat-cell.s-active .cell-num   { color: #2c7a3e; }
.stat-cell.s-warn   .cell-num   { color: #d97706; }
.stat-cell.s-pending .cell-num  { color: var(--gold); }
.stat-cell.s-renew  .cell-num   { color: #2563eb; }
.stat-cell.s-term   .cell-num   { color: var(--seal); }

/* ============ Tabs ============ */
.ct-tabs { margin-bottom: 14px; }
.ct-tabs :deep(.el-tabs__nav-wrap) { padding: 0 4px; }
.ct-tabs :deep(.el-tabs__nav-wrap)::after { background: var(--rule); height: 1px; }
.ct-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.12em;
  color: var(--ink-2);
  padding: 0 22px;
}
.ct-tabs :deep(.el-tabs__item.is-active) { color: var(--seal); }
.ct-tabs :deep(.el-tabs__active-bar) { background: var(--seal); height: 3px; }

/* ============ Panel ============ */
.panel {
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 4px;
  padding: 20px 24px;
  margin-bottom: 20px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--rule);
}
.ph-left { display: flex; align-items: baseline; gap: 14px; }
.ph-num {
  font-size: 13px;
  color: var(--seal);
  letter-spacing: 0.3em;
  font-weight: 700;
}
.ph-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
  margin: 0;
  letter-spacing: 0.16em;
}
.ph-sub {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.32em;
  font-family: 'Georgia', serif;
}

/* ============ 表格 ============ */
.ct-table { border: 1px solid var(--rule); border-radius: 2px; }
.ct-table :deep(.el-table) {
  --el-table-header-bg-color: var(--paper-2);
  --el-table-header-text-color: var(--ink);
  --el-table-tr-bg-color: #fff;
  --el-table-row-hover-bg-color: #fdf9ed;
  --el-table-border-color: var(--rule);
}
.ct-table :deep(.el-table__header) th {
  background: var(--paper-2) !important;
  color: var(--ink) !important;
  font-weight: 700;
  letter-spacing: 0.12em;
  border-bottom: 2px solid var(--ink) !important;
}
.mono { font-family: 'Courier New', monospace; letter-spacing: 0.05em; color: var(--ink); }
.cust-name { font-weight: 600; color: var(--ink); }
.muted-line { color: var(--ink-2); font-size: 13px; }
.amount { font-variant-numeric: tabular-nums; font-weight: 700; color: var(--ink); }
.sign-way { font-size: 13px; color: var(--ink-2); }

.days-left { font-variant-numeric: tabular-nums; font-weight: 700; }
.d-red     { color: var(--seal); }
.d-orange  { color: #d97706; }
.d-yellow  { color: #b08842; }
.d-blue    { color: #2563eb; }
.d-normal  { color: #2c7a3e; }
.d-expired { color: #909399; text-decoration: line-through; }

.ct-tag { letter-spacing: 0.1em; }
.ct-tag.blink { animation: blink 1.6s infinite; }
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.45; }
}

.empty-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 28px 0;
}
.empty-mark {
  width: 48px; height: 48px;
  border: 1px solid var(--rule);
  display: grid; place-items: center;
  font-size: 22px;
  color: var(--muted);
  letter-spacing: 0;
}
.empty-text { font-size: 13px; color: var(--muted); letter-spacing: 0.12em; }

.pager-wrap { display: flex; justify-content: flex-end; padding: 14px 4px 0; }

/* ============ 时间线 ============ */
.timeline-panel { background: #fff; }
.timeline-track {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  position: relative;
  padding: 24px 8px 8px;
}
.timeline-track::before {
  content: '';
  position: absolute;
  left: 6%; right: 6%;
  top: 38px;
  height: 2px;
  background: linear-gradient(90deg, #b08842 0%, #d97706 35%, var(--seal) 75%, var(--ink) 100%);
}
.tl-node {
  position: relative;
  padding: 0 12px;
  text-align: center;
}
.tl-dot {
  width: 16px; height: 16px;
  border-radius: 50%;
  margin: 0 auto 14px;
  border: 3px solid #fff;
  position: relative;
  z-index: 1;
  background: var(--gold);
}
.tone-yellow .tl-dot { background: #b08842; }
.tone-orange .tl-dot { background: #d97706; }
.tone-red    .tl-dot { background: var(--seal); }
.tone-dark   .tl-dot { background: var(--ink); }

.tl-day {
  font-size: 14px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.tone-red .tl-day, .tone-dark .tl-day { color: var(--seal); }
.tl-title { font-size: 13px; font-weight: 700; color: var(--ink); letter-spacing: 0.1em; margin-bottom: 4px; }
.tl-desc { font-size: 12px; color: var(--muted); line-height: 1.5; letter-spacing: 0.05em; }

/* ============ Dialog 通用 ============ */
.ct-dialog :deep(.el-dialog__header) {
  border-bottom: 2px solid var(--ink);
  padding: 16px 22px 12px;
  margin-right: 0;
}
.ct-dialog :deep(.el-dialog__title) {
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--ink);
}
.form-row { display: flex; gap: 18px; }
.parties-grid {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: center;
  margin: 4px 0 18px;
  padding: 16px;
  background: var(--paper);
  border: 1px dashed var(--rule);
}
.party-block {
  text-align: center;
}
.party-tag {
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.3em;
  margin-bottom: 6px;
}
.party-name {
  font-weight: 700;
  font-size: 16px;
  color: var(--ink);
  letter-spacing: 0.05em;
}
.party-vs {
  text-align: center;
  font-family: 'Georgia', serif;
  font-style: italic;
  color: var(--seal);
  font-size: 18px;
  font-weight: 700;
}

/* ============ Drawer ============ */
.ct-drawer :deep(.el-drawer__body) { padding: 0; }
.drawer-body {
  background: var(--paper);
  min-height: 100%;
  font-family: 'Songti SC', 'STSong', serif;
}
.drawer-head {
  padding: 32px 32px 24px;
  background: #fff;
  border-bottom: 2px solid var(--ink);
  position: relative;
}
.drawer-head::after {
  content: '';
  position: absolute;
  inset: auto 0 0 0;
  height: 4px;
  background: var(--seal);
}
.dh-top { display: flex; align-items: center; gap: 12px; }
.dh-tag {
  padding: 3px 10px;
  background: var(--seal);
  color: #fff;
  font-size: 12px;
  letter-spacing: 0.3em;
  font-weight: 700;
}
.dh-title {
  margin: 12px 0 6px;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--ink);
}
.dh-no { font-size: 13px; color: var(--muted); letter-spacing: 0.1em; }

.drawer-section {
  padding: 22px 32px;
  border-bottom: 1px dashed var(--rule);
}
.ds-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.16em;
  margin-bottom: 14px;
}
.ds-bar {
  display: inline-block;
  width: 4px; height: 16px;
  background: var(--seal);
}
.ds-grid {
  list-style: none;
  margin: 0; padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 24px;
}
.ds-grid li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px dotted var(--rule);
}
.ds-grid .k { color: var(--muted); font-size: 13px; letter-spacing: 0.08em; }
.ds-grid .v { color: var(--ink); font-weight: 600; font-size: 13px; }

.content-blocks { display: flex; flex-direction: column; gap: 10px; }
.cb {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 14px;
  padding: 8px 0;
  border-bottom: 1px dotted var(--rule);
}
.cb-k { color: var(--muted); font-size: 13px; letter-spacing: 0.16em; }
.cb-v { color: var(--ink); font-size: 14px; line-height: 1.7; }

.sign-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}
.sign-card {
  background: #fff;
  border: 1px solid var(--rule);
  padding: 14px;
  text-align: center;
  position: relative;
}
.sign-card::before {
  content: '';
  position: absolute; inset: 4px;
  border: 1px dashed var(--rule);
  pointer-events: none;
}
.sg-tag {
  font-size: 12px;
  letter-spacing: 0.3em;
  color: var(--seal);
  font-weight: 700;
}
.sg-signer {
  margin: 10px 0 6px;
  font-size: 18px;
  font-weight: 700;
  color: var(--ink);
}
.sg-time { font-size: 12px; color: var(--muted); }

.esign-tip {
  margin-top: 14px;
  padding: 12px 14px;
  background: #fff8e6;
  border: 1px dashed #f5d8a8;
  font-size: 13px;
  color: var(--ink-2);
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.tag-info {
  background: var(--gold);
  color: #fff;
  padding: 2px 8px;
  font-size: 12px;
  letter-spacing: 0.2em;
  font-weight: 700;
}

.exp-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}
.exp-cell {
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--rule);
}
.exp-cell.wide { grid-column: span 2; }
.exp-k { font-size: 12px; color: var(--muted); letter-spacing: 0.16em; margin-bottom: 6px; }
.exp-v { font-size: 14px; font-weight: 700; color: var(--ink); }

.ct-timeline { padding-left: 8px; }
.ct-timeline :deep(.el-timeline-item__node) {
  background: var(--seal);
  box-shadow: 0 0 0 2px var(--paper);
}
.ct-timeline :deep(.el-timeline-item__tail) { border-left-style: dashed; border-left-color: var(--rule); }
.th-line { display: flex; align-items: baseline; gap: 8px; }
.th-action { font-size: 14px; font-weight: 700; color: var(--ink); letter-spacing: 0.06em; }
.th-by { font-size: 12px; color: var(--muted); }
.th-note { margin-top: 4px; font-size: 12px; color: var(--ink-2); }

/* ============ 模板管理 ============ */
.tpl-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.tpl-sub { font-size: 13px; color: var(--muted); letter-spacing: 0.12em; }
.var-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.var-chip {
  padding: 3px 10px;
  background: var(--paper);
  border: 1px dashed var(--rule);
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: var(--ink-2);
}
.var-count {
  display: inline-block;
  min-width: 28px;
  padding: 2px 8px;
  font-family: 'Courier New', monospace;
  font-weight: 700;
  font-size: 13px;
  background: var(--paper-2);
  border: 1px solid var(--rule);
  color: var(--seal);
  letter-spacing: 0.05em;
}

/* ============ 续费阶梯面板 ============ */
.stage-panel { background: #fff; }
.stage-legend { display: flex; gap: 14px; font-size: 12px; color: var(--muted); letter-spacing: 0.1em; }
.stage-legend .dot {
  display: inline-block;
  width: 10px; height: 10px;
  border-radius: 50%;
  margin-right: 5px;
  vertical-align: middle;
}
.dot { background: var(--rule); }
.dot-done { background: #2c7a3e; }
.dot-pending { background: var(--gold); }
.dot-overdue { background: var(--seal); }

.stage-list { display: flex; flex-direction: column; gap: 18px; }
.stage-item {
  border: 1px solid var(--rule);
  border-left: 4px solid var(--seal);
  background: var(--paper);
  padding: 14px 16px;
}
.si-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px dashed var(--rule);
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 12px;
}
.si-meta { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
.si-no { font-size: 13px; color: var(--ink); font-weight: 700; }
.si-cust { font-weight: 700; color: var(--ink); font-size: 15px; }
.si-tpl { font-size: 12px; color: var(--muted); padding: 2px 8px; border: 1px dashed var(--rule); background: #fff; }
.si-end { display: flex; align-items: baseline; gap: 10px; }
.si-end-k { font-size: 12px; color: var(--muted); letter-spacing: 0.16em; }
.si-end-v { font-size: 14px; font-weight: 700; }
.si-days { font-size: 14px; font-weight: 800; padding: 2px 10px; border: 1px solid currentColor; }

.stage-track {
  list-style: none;
  margin: 0; padding: 0;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0;
  border: 1px solid var(--rule);
  background: #fff;
}
.stage-cell {
  position: relative;
  padding: 12px 12px 14px;
  border-right: 1px solid var(--rule);
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 130px;
}
.stage-cell:last-child { border-right: 0; }
.sc-day {
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: var(--ink);
}
.sc-action { font-size: 12px; color: var(--ink-2); line-height: 1.5; }
.sc-target { font-size: 11px; color: var(--muted); letter-spacing: 0.08em; }
.sc-status { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; margin-top: 4px; }
.sc-handler { font-size: 11px; color: var(--muted); font-family: 'Courier New', monospace; }
.sc-note { font-size: 11px; color: var(--ink-2); font-style: italic; line-height: 1.4; }
.sc-btn {
  margin-top: auto;
  align-self: flex-start;
  padding: 0 10px !important;
  height: 24px !important;
  font-size: 12px !important;
  border-radius: 0 !important;
}
.stage-cell.st-done { background: #f4faf6; }
.stage-cell.st-overdue { background: #fdf3f1; }
.stage-cell.st-active {
  outline: 2px solid var(--seal);
  outline-offset: -2px;
  background: #fff8e6;
}
.stage-cell.st-active .sc-day { color: var(--seal); }

/* ============ 联动事件时间线 ============ */
.linkage-empty { padding: 14px; text-align: center; color: var(--muted); font-size: 13px; }
.linkage-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lk-item {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border-left: 3px solid var(--gold);
  flex-wrap: wrap;
}
.lk-effective { border-left-color: #2c7a3e; }
.lk-task_dispatched { border-left-color: #2563eb; background: #f0f6ff; }
.lk-renew { border-left-color: var(--seal); }
.lk-terminate { border-left-color: #909399; background: #f5f5f5; }
.lk-stage_alert { border-left-color: #d97706; }
.lk-sign { border-left-color: var(--gold); }
.lk-time { font-size: 12px; color: var(--muted); }
.lk-tag {
  font-size: 11px;
  padding: 2px 6px;
  background: var(--ink);
  color: #fff;
  letter-spacing: 0.1em;
  font-weight: 700;
}
.lk-title { font-size: 13px; color: var(--ink); font-weight: 700; }
.lk-detail { font-size: 12px; color: var(--ink-2); }
.lk-by { font-size: 12px; color: var(--muted); }

/* ============ 版本历史 ============ */
.version-list {
  list-style: none;
  margin: 0; padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  counter-reset: ver;
}
.ver-item {
  display: grid;
  grid-template-columns: 50px 130px 1fr 100px 180px 80px 60px;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid var(--rule);
  font-size: 13px;
}
.ver-item.ver-current {
  border-color: var(--seal);
  background: #fff8e6;
  border-left: 4px solid var(--seal);
}
.ver-no {
  font-family: 'Georgia', serif;
  font-weight: 800;
  color: var(--seal);
  font-size: 14px;
  letter-spacing: 0.1em;
}
.ver-name { color: var(--ink-2); }
.ver-amount { font-size: 13px; }
.ver-date { font-size: 12px; color: var(--muted); }

/* ============ 其他 ============ */
.date-range-row { display: flex; align-items: center; gap: 8px; width: 100%; }
.range-arrow { color: var(--seal); font-weight: 700; }
.stage-dialog-head {
  background: var(--paper);
  border: 1px dashed var(--rule);
  padding: 14px 18px;
  display: flex;
  align-items: baseline;
  gap: 14px;
}
.sd-day { font-size: 18px; font-weight: 800; color: var(--seal); letter-spacing: 0.1em; }
.sd-action { font-size: 13px; color: var(--ink-2); }

/* ============ 响应式 ============ */
@media (max-width: 1280px) {
  .stat-strip { grid-template-columns: repeat(3, 1fr); }
  .stat-cell { border-bottom: 1px solid var(--rule); }
  .stat-cell:nth-child(3) { border-right: 0; }
  .timeline-track { grid-template-columns: repeat(3, 1fr); }
  .timeline-track::before { display: none; }
  .header-actions { position: static; margin-top: 14px; }
  .seal-decor { display: none; }
  .exp-row { grid-template-columns: repeat(2, 1fr); }
  .exp-cell.wide { grid-column: span 2; }
  .stage-track { grid-template-columns: repeat(3, 1fr); }
  .stage-cell:nth-child(3) { border-right: 0; }
  .stage-cell { border-bottom: 1px solid var(--rule); }
  .ver-item { grid-template-columns: 40px 1fr 80px; gap: 6px; font-size: 12px; }
  .ver-name, .ver-date, .ver-item .el-tag { display: none; }
}

/* ============ 统一后台浅色风格覆盖 ============ */
.contract-mgmt {
  --paper: #f5f7fb;
  --paper-2: #f8fafc;
  --ink: #1f2937;
  --ink-2: #4b5563;
  --rule: #e5e7eb;
  --seal: #2563eb;
  --seal-2: #1d4ed8;
  --gold: #d97706;
  --muted: #6b7280;

  padding: 20px 22px 36px;
  background: #f5f7fb;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
  color: var(--ink);
}
.page-header {
  padding: 22px 24px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.page-header::before,
.page-header::after,
.seal-decor {
  display: none;
}
.header-meta {
  gap: 10px;
  color: var(--muted);
  letter-spacing: 0;
  font-family: inherit;
}
.meta-tag {
  padding: 3px 9px;
  background: #eff6ff;
  color: var(--seal);
  border-radius: 999px;
  letter-spacing: 0;
}
.meta-divider {
  background: var(--rule);
}
.page-title {
  gap: 10px;
  font-size: 24px;
  letter-spacing: 0;
}
.title-cn {
  border-bottom: 0;
  padding-bottom: 0;
}
.title-en {
  font-family: inherit;
  font-style: normal;
  font-size: 12px;
  letter-spacing: 0;
  color: var(--muted);
}
.page-desc {
  margin-top: 8px;
  font-size: 13px;
  letter-spacing: 0;
  color: var(--muted);
}
.header-actions {
  right: 24px;
  top: 24px;
}
.btn-ghost,
.btn-seal {
  height: 34px !important;
  border-radius: 6px !important;
  letter-spacing: 0;
  box-shadow: none;
  font-weight: 500;
}
.btn-ghost {
  border-color: var(--rule) !important;
  color: var(--ink-2) !important;
}
.btn-ghost:hover {
  background: #f8fafc !important;
  color: var(--seal) !important;
  border-color: #bfdbfe !important;
}
.btn-seal {
  background: var(--seal) !important;
  border-color: var(--seal) !important;
}
.btn-seal:hover {
  background: var(--seal-2) !important;
  transform: none;
  box-shadow: none;
}
.stat-strip {
  gap: 12px;
  background: transparent;
  border: 0;
  border-radius: 0;
  overflow: visible;
}
.stat-cell {
  padding: 18px 20px;
  background: #fff;
  border: 1px solid var(--rule);
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.stat-cell:last-child {
  border-right: 1px solid var(--rule);
}
.stat-cell:hover {
  background: #fff;
  border-color: #cbd5e1;
}
.cell-idx {
  color: #94a3b8;
  letter-spacing: 0;
}
.cell-num {
  font-size: 30px;
  letter-spacing: 0;
}
.cell-label {
  letter-spacing: 0;
  color: var(--muted);
}
.ct-tabs {
  padding: 0 4px;
}
.ct-tabs :deep(.el-tabs__nav-wrap)::after {
  background: var(--rule);
}
.ct-tabs :deep(.el-tabs__item) {
  font-size: 14px;
  letter-spacing: 0;
  color: var(--muted);
  padding: 0 16px;
}
.ct-tabs :deep(.el-tabs__item.is-active) {
  color: var(--seal);
}
.ct-tabs :deep(.el-tabs__active-bar) {
  background: var(--seal);
}
.panel {
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(15, 23, 42, .04);
}
.panel-head {
  border-bottom: 1px solid var(--rule);
}
.ph-left {
  align-items: center;
}
.ph-num {
  color: var(--seal);
  letter-spacing: 0;
}
.ph-title {
  font-size: 16px;
  letter-spacing: 0;
}
.ph-sub {
  letter-spacing: 0;
  font-family: inherit;
  color: #94a3b8;
}
.ct-table {
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
}
.ct-table :deep(.el-table) {
  --el-table-header-bg-color: #f8fafc;
  --el-table-header-text-color: #374151;
  --el-table-row-hover-bg-color: #f9fafb;
  --el-table-border-color: var(--rule);
}
.ct-table :deep(.el-table__header) th {
  background: #f8fafc !important;
  color: #374151 !important;
  letter-spacing: 0;
  border-bottom: 1px solid var(--rule) !important;
}
.mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  letter-spacing: 0;
}
.cust-name,
.amount {
  color: var(--ink);
}
.muted-line,
.sign-way {
  color: var(--muted);
}
.empty-mark {
  border-radius: 8px;
  background: #f8fafc;
  letter-spacing: 0;
}
.empty-text,
.tl-desc,
.stage-legend,
.exp-k,
.tpl-sub {
  letter-spacing: 0;
}
.timeline-track::before {
  background: #d1d5db;
}
.tl-day,
.tl-title {
  letter-spacing: 0;
}
.ct-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid var(--rule);
}
.ct-dialog :deep(.el-dialog__title) {
  letter-spacing: 0;
}
.parties-grid,
.stage-item,
.stage-track,
.exp-cell,
.ver-item,
.stage-dialog-head {
  background: #f8fafc;
  border-color: var(--rule);
  border-radius: 8px;
}
.stage-item {
  border-left: 4px solid var(--seal);
}
.stage-cell.st-active {
  outline-color: var(--seal);
  background: #eff6ff;
}
.sc-day,
.sc-action,
.sc-target,
.sc-note,
.si-end-k,
.si-tpl,
.party-tag {
  letter-spacing: 0;
}
.sc-btn {
  border-radius: 6px !important;
}
.drawer-body {
  background: #f5f7fb;
  font-family: 'PingFang SC', 'Microsoft YaHei', Arial, sans-serif;
}
.drawer-head {
  border-bottom: 1px solid var(--rule);
}
.drawer-head::after {
  display: none;
}
.dh-tag,
.tag-info,
.lk-tag {
  border-radius: 999px;
  letter-spacing: 0;
}
.dh-title,
.ds-title,
.sg-tag {
  letter-spacing: 0;
}
.drawer-section {
  border-bottom: 1px solid var(--rule);
}
.sign-card,
.cb,
.lk-item {
  border-radius: 8px;
}

@media (max-width: 1280px) {
  .stat-strip {
    grid-template-columns: repeat(3, 1fr);
  }
  .stat-cell:nth-child(3) {
    border-right: 1px solid var(--rule);
  }
}
</style>

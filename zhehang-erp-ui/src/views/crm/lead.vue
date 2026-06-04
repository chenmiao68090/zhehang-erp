<template>
  <div class="lead-page">
    <!-- 顶部 Tab 切换 -->
    <div class="page-header">
      <el-tabs v-model="activeTab" class="lead-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="公司公海" name="pool" />
        <el-tab-pane label="我的线索" name="my" />
      </el-tabs>
    </div>

    <!-- 筛选搜索区 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="queryParams.source" placeholder="来源" clearable style="width: 120px">
          <el-option label="天眼查平台" :value="1" />
          <el-option label="老客户转介绍" :value="2" />
          <el-option label="运营-美团" :value="3" />
          <el-option label="运营-抖音" :value="4" />
          <el-option label="线下来客" :value="5" />
        </el-select>
        <el-select v-model="queryParams.status" placeholder="跟进状态" clearable style="width: 120px">
          <el-option label="0新建客户" :value="1" />
          <el-option label="A初步接洽" :value="2" />
          <el-option label="B需求确认" :value="3" />
          <el-option label="C方案报价" :value="4" />
          <el-option label="D谈判审核" :value="5" />
          <el-option label="E成交" :value="6" />
        </el-select>
        <el-input
          v-model="queryParams.keyword"
          placeholder="公司名称 / 手机号"
          clearable
          style="width: 240px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button type="primary" plain @click="handleSearch">查询</el-button>
        <el-button plain @click="handleReset">重置</el-button>
      </div>
      <div class="filter-right">
        <el-button type="primary" @click="openCreate">
          <el-icon><Plus /></el-icon>新建
        </el-button>
        <el-dropdown trigger="click" @command="handleMore">
          <el-button plain>
            更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="import"><el-icon><Upload /></el-icon>导入线索</el-dropdown-item>
              <el-dropdown-item command="export"><el-icon><Download /></el-icon>导出线索</el-dropdown-item>
              <el-dropdown-item divided command="rules"><el-icon><Setting /></el-icon>设置公海规则</el-dropdown-item>
              <el-dropdown-item command="duplicate"><el-icon><Search /></el-icon>查重工具</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="batch-info">已选 <em>{{ selectedRows.length }}</em> 条</span>
      <div class="batch-actions">
        <template v-if="activeTab === 'pool'">
          <el-button type="primary" size="small" @click="handleClaim">领取</el-button>
          <el-button size="small" @click="openDistribute">分配</el-button>
        </template>
        <template v-else-if="activeTab === 'my'">
          <el-button size="small" @click="openReturnPool">退回公海</el-button>
          <el-button type="danger" size="small" @click="handleBatchDelete">删除</el-button>
        </template>
        <el-button text @click="clearSelection">取消选择</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrap">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredList"
        stripe
        border
        height="calc(100vh - 320px)"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="公司名称" prop="name" min-width="140">
          <template #default="{ row }">
            <a class="link-text" @click="openEdit(row)">{{ row.name }}</a>
          </template>
        </el-table-column>
        <el-table-column label="联系人" prop="company" min-width="180" show-overflow-tooltip />
        <el-table-column prop="phone" label="联系电话" width="180">
          <template #default="{ row }">
            <span>{{ row.phone }}</span>
            <el-button
              v-if="row.phone && activeTab === 'my'"
              type="success"
              link
              size="small"
              style="margin-left: 6px;"
              @click="handleCall(row.phone)"
            >
              <el-icon><Phone /></el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="registerDate" label="公司注册日期" width="130" />
        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="sourceTagType(row.source)" effect="dark">{{ sourceLabel(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="跟进状态" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="plain">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="负责人" prop="ownerName" width="110">
          <template #default="{ row }">
            <span v-if="row.ownerName">{{ row.ownerName }}</span>
            <span v-else class="muted">— 公海 —</span>
          </template>
        </el-table-column>
        <el-table-column label="最近跟进" prop="lastFollowTime" width="220">
          <template #default="{ row }">
            <div class="follow-cell">
              <span class="follow-time">{{ row.lastFollowTime || '—' }}</span>
              <div class="follow-tip">
                <span
                  v-if="rowFreqState(row).status === 'overdue'"
                  class="tip-overdue"
                >⚠️ 已超期 {{ rowFreqState(row).overdueDays }} 天（{{ rowFreqState(row).level }}级:{{ rowFreqState(row).limit }}天/次）</span>
                <span
                  v-else-if="rowFreqState(row).status === 'soon'"
                  class="tip-soon"
                >⏰ 还有 {{ rowFreqState(row).daysToDue }} 天截止</span>
                <span
                  v-else-if="rowFreqState(row).status === 'never' && activeTab === 'my'"
                  class="tip-overdue"
                >⚠️ 尚未跟进（{{ rowFreqState(row).level }}级）</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-if="activeTab === 'pool'" size="small" type="primary" link @click="handleClaimSingle(row)">领取</el-button>
            <el-button size="small" link @click="activeTab === 'my' ? openFollowUp(row) : openEdit(row)">{{ activeTab === 'my' ? '跟进' : '编辑' }}</el-button>
            <el-button v-if="activeTab === 'my'" size="small" type="success" link :disabled="row.status === 6" @click="handleDeal(row)">成交</el-button>
            <el-button v-if="activeTab === 'my'" size="small" type="warning" link @click="handleReturnToPool(row)">放回公海</el-button>
            <el-button v-if="activeTab === 'pool'" size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper"
          background
        />
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="formDialog.visible" :title="formDialog.isEdit ? '编辑线索' : '新建线索'" width="640px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="公司名称" prop="name">
              <el-input v-model="formData.name" placeholder="请输入公司名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="company">
              <el-input v-model="formData.company" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="formData.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司注册日期">
              <el-date-picker v-model="formData.registerDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="公司地址" prop="email">
              <el-input v-model="formData.email" placeholder="请输入公司地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="来源" prop="source">
              <el-select v-model="formData.source" placeholder="请选择来源" style="width: 100%">
                <el-option label="天眼查平台" :value="1" />
                <el-option label="老客户转介绍" :value="2" />
                <el-option label="运营-美团" :value="3" />
                <el-option label="运营-抖音" :value="4" />
                <el-option label="线下来客" :value="5" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="formData.remark" type="textarea" :rows="3" placeholder="补充信息" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配弹窗 -->
    <el-dialog v-model="distributeDialog.visible" title="分配线索" width="420px">
      <el-form label-width="90px">
        <el-form-item label="负责人">
          <el-select v-model="distributeDialog.ownerId" placeholder="请选择负责人" style="width: 100%">
            <el-option v-for="u in mockUsers" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="distributeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitDistribute">确认分配</el-button>
      </template>
    </el-dialog>

    <!-- 退回公海弹窗 -->
    <el-dialog v-model="returnDialog.visible" title="退回公海" width="420px">
      <el-form label-width="90px">
        <el-form-item label="退回原因">
          <el-input v-model="returnDialog.reason" type="textarea" :rows="3" placeholder="请输入退回原因" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitReturn">确认退回</el-button>
      </template>
    </el-dialog>

    <!-- 公海规则设置弹窗 -->
    <el-dialog v-model="rulesDialog.visible" title="公海规则设置" width="800px" top="6vh">
      <div class="rule-source-tip">
        <div>
          <strong>主分配规则统一在系统配置维护</strong>
          <p>这里保留公海局部规则编辑；来源路由、权重算法、承接团队和分配日志请到「分配配置」统一查看。</p>
        </div>
        <el-button type="primary" plain size="small" @click="openGlobalDistributeConfig">去分配配置</el-button>
      </div>
      <el-tabs v-model="rulesDialog.activeTab" class="rules-inner-tabs">
        <el-tab-pane label="分配规则" name="distribute">
          <el-table :data="rulesDialog.distributeRules" border>
            <el-table-column label="规则名称" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="规则名称" />
              </template>
            </el-table-column>
            <el-table-column label="触发条件" width="140">
              <template #default="{ row }">
                <el-select v-model="row.trigger" size="small" style="width: 100%">
                  <el-option label="新建线索" value="onCreate" />
                  <el-option label="进入公海" value="onPool" />
                  <el-option label="导入时" value="onImport" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="分配方式" width="130">
              <template #default="{ row }">
                <el-select v-model="row.mode" size="small" style="width: 100%">
                  <el-option label="轮询" value="round" />
                  <el-option label="按地区" value="region" />
                  <el-option label="指定人员" value="specify" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="分配对象" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.target" size="small" placeholder="销售/部门" />
              </template>
            </el-table-column>
            <el-table-column label="最大保有量" width="110">
              <template #default="{ row }">
                <el-input-number v-model="row.maxHold" :min="0" size="small" controls-position="right" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="优先级" width="90">
              <template #default="{ row }">
                <el-input-number v-model="row.priority" :min="1" :max="99" size="small" controls-position="right" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="启用" width="70">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="rulesDialog.distributeRules.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="rule-add-bar">
            <el-button plain size="small" @click="addDistributeRule"><el-icon><Plus /></el-icon>添加规则</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="自动回收规则" name="recycle">
          <el-table :data="rulesDialog.recycleRules" border>
            <el-table-column label="规则名称" min-width="140">
              <template #default="{ row }">
                <el-input v-model="row.name" size="small" placeholder="规则名称" />
              </template>
            </el-table-column>
            <el-table-column label="回收条件" width="170">
              <template #default="{ row }">
                <el-select v-model="row.condition" size="small" style="width: 100%">
                  <el-option label="未跟进" value="noFollow" />
                  <el-option label="未成交" value="noDeal" />
                  <el-option label="未联系" value="noContact" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="天数" width="110">
              <template #default="{ row }">
                <el-input-number v-model="row.days" :min="1" size="small" controls-position="right" style="width: 100%" />
              </template>
            </el-table-column>
            <el-table-column label="适用范围" width="160">
              <template #default="{ row }">
                <el-select v-model="row.scope" size="small" style="width: 100%">
                  <el-option label="全部线索" value="all" />
                  <el-option label="按来源" value="source" />
                  <el-option label="按部门" value="dept" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="启用" width="80">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button type="danger" link size="small" @click="rulesDialog.recycleRules.splice($index, 1)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="rule-add-bar">
            <el-button plain size="small" @click="addRecycleRule"><el-icon><Plus /></el-icon>添加规则</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <template #footer>
        <el-button @click="rulesDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="savePoolRules">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入弹窗 -->
    <el-dialog v-model="importDialog.visible" title="导入线索" width="640px">
      <div class="import-tip">
        <el-icon><InfoFilled /></el-icon>
        <span>支持 CSV / Excel 文件导入，建议先下载模板按格式填写</span>
        <el-button link type="primary" @click="downloadTemplate">下载模板</el-button>
      </div>
      <el-upload
        class="import-upload"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        :limit="1"
        accept=".csv,.xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击选择文件</em></div>
      </el-upload>
      <div v-if="importDialog.preview.length" class="import-preview">
        <div class="preview-title">预览（前 5 行）</div>
        <el-table :data="importDialog.preview" size="small" border>
          <el-table-column prop="name" label="公司名称" />
          <el-table-column prop="company" label="联系人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="email" label="公司地址" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="importDialog.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!importDialog.preview.length" @click="confirmImport">确认导入</el-button>
      </template>
    </el-dialog>

    <!-- 查重工具弹窗 -->
    <el-dialog v-model="dupDialog.visible" title="查重工具" width="640px">
      <el-form inline>
        <el-form-item label="查重字段">
          <el-radio-group v-model="dupDialog.field">
            <el-radio label="phone">手机号</el-radio>
            <el-radio label="name">公司名称</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="查重值">
          <el-input v-model="dupDialog.value" placeholder="请输入要查重的内容" style="width: 240px" />
        </el-form-item>
        <el-button type="primary" @click="runDuplicate">查重</el-button>
      </el-form>
      <div v-if="dupDialog.searched" class="dup-result">
        <el-alert
          :title="`匹配到 ${dupDialog.results.length} 条记录`"
          :type="dupDialog.results.length ? 'warning' : 'success'"
          :closable="false"
          show-icon
        />
        <el-table v-if="dupDialog.results.length" :data="dupDialog.results" size="small" border style="margin-top: 12px">
          <el-table-column prop="name" label="公司名称" />
          <el-table-column prop="company" label="联系人" />
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="ownerName" label="负责人" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="dupDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 跟进线索弹窗 -->
    <el-dialog v-model="followUpVisible" title="跟进线索" width="920px" destroy-on-close>
      <!-- 顶部摘要 + 保护期倒计时 -->
      <div v-if="currentFollowUpLead && followSummary" class="follow-summary">
        <div v-if="followSummary.recycledNotice" class="recycled-notice">⚠️ {{ followSummary.recycledNotice }}</div>
        <div class="summary-row">
          <span>共跟进 <em>{{ followSummary.count }}</em> 次</span>
          <span class="sep">|</span>
          <span>最后跟进: <em>{{ followSummary.lastFollowText }}</em></span>
          <span class="sep">|</span>
          <span>保护期剩余: <em>{{ followSummary.protectionLeft }}</em> 天</span>
          <span class="sep">|</span>
          <span>客户等级: <el-tag size="small" effect="dark" :type="followSummary.level === 'A' ? 'danger' : followSummary.level === 'B' ? 'warning' : 'info'">{{ followSummary.level }} 级</el-tag></span>
        </div>
        <div class="protection-bar">
          <span class="protection-label">保护期到期日:</span>
          <span class="protection-date">{{ followSummary.protectionDeadline }}</span>
          <span class="protection-countdown" :class="followSummary.countdownClass">{{ followSummary.countdownLabel }}</span>
        </div>
        <div v-if="followSummary.overdueText" class="overdue-warn">⚠️ {{ followSummary.overdueText }}</div>
        <div v-else-if="followSummary.upcomingText" class="upcoming-tip">⏰ {{ followSummary.upcomingText }}</div>

        <!-- ============ 跟进规则引擎：风险标签条 ============ -->
        <div v-if="riskBadges.length" class="risk-badges-bar">
          <span
            v-for="b in riskBadges"
            :key="b.key"
            class="risk-badge"
            :class="['risk-' + b.color]"
          >
            <span class="rb-icon">{{ b.icon }}</span>
            <span class="rb-text">{{ b.text }}</span>
          </span>
        </div>

        <!-- 24小时补跟倒计时（有意向后） -->
        <div v-if="intentCountdown" class="intent-countdown-bar">
          <span class="icb-pulse">⏳</span>
          <span class="icb-text">已标记 <b>有意向</b> · 还需在 <b class="icb-num">{{ intentCountdown }}</b> 内补充详细跟进，否则该标记将自动失效</span>
          <el-button size="small" type="warning" @click="followMode = 'detail'">立即补充</el-button>
        </div>
        <div v-else-if="intentExpired" class="intent-expired-bar">
          <span>⌛ 上次「有意向」标记已超过24小时未补充详细跟进，该临时有效跟进已失效</span>
          <el-button size="small" plain @click="clearIntentExpired">我知道了</el-button>
        </div>
      </div>

      <!-- ============ 优化4: 客户状态机可视化 ============ -->
      <div v-if="currentFollowUpLead" class="status-machine-wrap">
        <div class="sm-head">
          <span class="sm-title">客户旅程</span>
          <span class="sm-sub">CUSTOMER JOURNEY · 当前阶段：<em>{{ stageList[currentStageIndex]?.label }}</em></span>
        </div>
        <div class="sm-stages">
          <div
            v-for="(s, idx) in stageList"
            :key="s.key"
            class="sm-node"
            :class="{ done: idx < currentStageIndex, active: idx === currentStageIndex, future: idx > currentStageIndex }"
            @click="clickStage(idx)"
          >
            <div class="sm-circle">
              <span v-if="idx < currentStageIndex">✓</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>
            <div class="sm-label">{{ s.label }}</div>
            <div class="sm-time">{{ stageEnterTime(idx) || '—' }}</div>
            <div v-if="idx < stageList.length - 1" class="sm-line" :class="{ filled: idx < currentStageIndex }"></div>
          </div>
        </div>
      </div>

      <!-- ============ 优化1+5: 客户分层管理卡片 ============ -->
      <div v-if="currentFollowUpLead" class="tier-card">
        <div class="tier-head" @click="tierExpanded = !tierExpanded">
          <div class="tier-title">
            <span class="tier-icon">🏷</span>
            <span>客户分层</span>
            <el-radio-group v-model="currentTier.mode" size="small" @click.stop class="tier-mode">
              <el-radio-button label="personal">👤 个人客户(老板)</el-radio-button>
              <el-radio-button label="enterprise">🏢 企业客户(公司)</el-radio-button>
            </el-radio-group>
          </div>
          <span class="tier-toggle">{{ tierExpanded ? '▾' : '▸' }}</span>
        </div>
        <div v-show="tierExpanded" class="tier-body">
          <!-- 个人客户(老板)视图 -->
          <div v-if="currentTier.mode === 'personal'" class="personal-view">
            <div class="personal-head">
              <div class="avatar-circle">{{ currentTier.bossName.slice(0,1) }}</div>
              <div class="personal-info">
                <div class="boss-name">{{ currentTier.bossName }} <span class="role-tag">老板</span></div>
                <div class="boss-meta">名下 <em>{{ currentTier.enterprises.length }}</em> 家企业 · 主联系电话 {{ currentFollowUpLead.phone }}</div>
              </div>
            </div>
            <div class="enterprise-tree">
              <div class="tree-title">{{ currentTier.bossName }} 名下企业 ({{ currentTier.enterprises.length }}家)</div>
              <div
                v-for="(ent, idx) in currentTier.enterprises"
                :key="ent.id"
                class="tree-row"
                :class="{ last: idx === currentTier.enterprises.length - 1 }"
              >
                <span class="tree-branch">{{ idx === currentTier.enterprises.length - 1 ? '└──' : '├──' }}</span>
                <span class="tree-name">{{ ent.name }}</span>
                <el-tag :type="serviceTagType(ent.serviceStatus)" size="small" effect="dark">{{ ent.serviceLabel }}</el-tag>
                <span class="tree-amount" v-if="ent.amount">¥ {{ ent.amount.toLocaleString() }}</span>
              </div>
            </div>
          </div>
          <!-- 企业客户视图 -->
          <div v-else class="enterprise-view">
            <div class="ent-row"><span>归属老板:</span> <a class="link-text" @click="jumpBoss">{{ currentTier.bossName }}</a> <span class="role-tag">老板</span></div>
            <div class="ent-row"><span>老板名下企业:</span><em>{{ currentTier.enterprises.length }}</em> 家</div>
            <div class="ent-row"><span>当前企业:</span> <strong>{{ currentFollowUpLead.name }}</strong></div>
            <div class="ent-row"><span>联系人:</span> {{ currentFollowUpLead.company }} · {{ currentFollowUpLead.phone }}</div>
            <div class="ent-tip">💡 该企业归属于老板「{{ currentTier.bossName }}」客户群组，跟进时可关联其他企业</div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 20px; min-height: 460px;">
        <!-- 左侧：表单 -->
        <div style="flex: 0 0 46%;">
          <!-- ============ 优化2: 双模式切换 ============ -->
          <div class="mode-switch">
            <el-radio-group v-model="followMode" size="default">
              <el-radio-button label="quick">⚡ 快速标记</el-radio-button>
              <el-radio-button label="detail">📝 详细跟进</el-radio-button>
            </el-radio-group>
            <span class="mode-hint">{{ followMode === 'quick' ? '电销专用 · 一键标记' : '完整记录 · 至少10字' }}</span>
          </div>

          <!-- 快速标记模式 -->
          <div v-if="followMode === 'quick'" class="quick-mark-panel">
            <!-- 连续未接通统计 -->
            <div
              v-if="consecutiveNoPickup >= 1"
              class="qm-stat-bar"
              :class="{ danger: consecutiveNoPickup >= 3 }"
            >
              <span class="qms-label">连续未接通</span>
              <span class="qms-num">{{ consecutiveNoPickup }}</span>
              <span class="qms-unit">次</span>
              <span v-if="consecutiveNoPickup >= 3" class="qms-tip">⚠️ 已达 3 次失联阈值 · 7 天后将自动触发失联预警</span>
              <span v-else class="qms-tip">距失联预警还差 {{ 3 - consecutiveNoPickup }} 次</span>
            </div>

            <div class="qm-grid">
              <button
                v-for="q in quickMarkOptions"
                :key="q.value"
                class="qm-btn"
                :class="['qm-' + q.color, { picked: lastQuickMark === q.value }]"
                @click="applyQuickMark(q)"
              >
                <span class="qm-emoji">{{ q.emoji }}</span>
                <span class="qm-text">{{ q.label }}</span>
                <span class="qm-effect">{{ q.effect }}</span>
              </button>
            </div>

            <div v-if="showIntentTip" class="intent-tip">
              💡 已标记「有意向」— 请在 <b>24小时</b> 内补充详细跟进，以便后续分析与排期。
              <el-button size="small" type="warning" plain @click="followMode = 'detail'">立即补充</el-button>
            </div>

            <!-- 标记历史时间线 -->
            <div v-if="quickMarkHistory.length" class="qm-timeline">
              <div class="qm-tl-title">⏱ 快速标记历史</div>
              <div
                v-for="(item, i) in quickMarkHistory"
                :key="i"
                class="qm-tl-row"
              >
                <span class="qm-tl-dot" :class="['qm-tl-' + item.color]"></span>
                <span class="qm-tl-time">{{ item.time }}</span>
                <span class="qm-tl-label" :class="['qm-tl-' + item.color]">{{ item.emoji }} {{ item.label }}</span>
              </div>
            </div>
          </div>

          <!-- 详细跟进模式 -->
          <el-form v-else ref="followFormRef" :model="followForm" :rules="followFormRules" label-position="top">
            <el-form-item label="跟进方式" prop="followMethod">
              <el-radio-group v-model="followForm.followMethod">
                <el-radio-button label="phone">📞 电话</el-radio-button>
                <el-radio-button label="wechat">💬 微信</el-radio-button>
                <el-radio-button label="meeting">🤝 面谈</el-radio-button>
                <el-radio-button label="email">📧 邮件</el-radio-button>
                <el-radio-button label="other">📋 其他</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="followForm.followMethod === 'phone'" label="通话时长（分钟）">
              <el-input-number v-model="followForm.duration" :min="0" :max="480" controls-position="right" />
            </el-form-item>
            <el-form-item label="沟通内容" prop="content">
              <el-input
                v-model="followForm.content"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="请输入沟通内容（不少于10字）"
              />
              <div v-if="followForm.content && followForm.content.trim().length > 0 && followForm.content.trim().length < 10" class="content-warn">
                沟通内容不少于10字
              </div>
            </el-form-item>
            <el-form-item label="客户反馈" prop="customerFeedback">
              <el-radio-group v-model="followForm.customerFeedback">
                <el-radio label="positive">😊 积极</el-radio>
                <el-radio label="neutral">😐 中性</el-radio>
                <el-radio label="negative">😟 消极</el-radio>
                <el-radio label="rejected">❌ 拒绝</el-radio>
                <el-radio label="lost_contact">📵 失联</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="下次跟进日期" prop="nextFollowDate">
              <el-date-picker
                v-model="followForm.nextFollowDate"
                type="date"
                placeholder="选择未来日期"
                value-format="YYYY-MM-DD"
                :disabled-date="disablePastDate"
                style="width: 100%"
              />
            </el-form-item>
            <el-form-item label="下次跟进计划（选填）">
              <el-input v-model="followForm.nextFollowPlan" type="textarea" :rows="2" maxlength="200" show-word-limit placeholder="简要描述下次跟进计划" />
            </el-form-item>
          </el-form>
          <el-button type="primary" @click="saveFollowUp">保存跟进记录</el-button>
        </div>
        <!-- 右侧：增强时间线 -->
        <div class="follow-timeline-wrap">
          <h4 class="timeline-title">跟进记录</h4>
          <el-timeline v-if="currentFollowUpLead?.followUpRecords?.length">
            <el-timeline-item
              v-for="(record, idx) in currentFollowUpRecords"
              :key="idx"
              :timestamp="record.time + ' · ' + record.operator"
              placement="top"
            >
              <div class="follow-record">
                <div class="record-meta">
                  <span class="method-icon">{{ followMethodIcon(record.followMethod) }}</span>
                  <span class="method-label">{{ followMethodLabel(record.followMethod) }}</span>
                  <el-tag
                    v-if="record.customerFeedback"
                    :type="feedbackTagType(record.customerFeedback)"
                    size="small"
                    effect="dark"
                  >{{ feedbackLabel(record.customerFeedback) }}</el-tag>
                  <span v-if="record.duration" class="duration-tag">⏱ {{ record.duration }} 分钟</span>
                </div>
                <p class="record-content">{{ record.content }}</p>
                <div v-if="record.nextFollowDate" class="record-next">
                  📅 下次跟进：{{ record.nextFollowDate }}
                  <span v-if="record.nextFollowPlan"> — {{ record.nextFollowPlan }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else description="暂无跟进记录" />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, ArrowDown, Upload, Download, Setting, InfoFilled, UploadFilled, Phone } from '@element-plus/icons-vue'
import { leadApi } from '@/api/crm'

type FollowMethod = 'phone' | 'wechat' | 'meeting' | 'email' | 'other'
type CustomerFeedback = 'positive' | 'neutral' | 'negative' | 'rejected' | 'lost_contact'
type CustomerLevel = 'A' | 'B' | 'C' | 'D'

interface FollowUpRecord {
  content: string
  operator: string
  time: string
  // 新增字段（兼容旧数据：缺失时默认为 other / neutral / 空）
  followMethod?: FollowMethod
  customerFeedback?: CustomerFeedback
  nextFollowDate?: string
  nextFollowPlan?: string
  duration?: number
}

interface RecycledHistory {
  date: string
  previousOwner: string
  reason?: string
}

interface Lead {
  id: number
  name: string
  company: string
  phone: string
  registerDate: string
  email: string
  source: number
  status: number
  pool: number
  ownerId: number | null
  ownerName: string
  lastFollowTime: string
  createTime: string
  remark: string
  followUpRecords?: FollowUpRecord[]
  // 新增：客户等级 + 保护期 + 回收历史
  level?: CustomerLevel
  protectionDeadline?: string
  recycledHistory?: RecycledHistory
  // 新增：「有意向」快速标记时间（用于24小时补跟规则）
  intentMarkAt?: string
}

// 跟进频率标准：A级3天、B级7天、C/D级15天
const followFrequencyStandard: Record<CustomerLevel, number> = {
  A: 3,
  B: 7,
  C: 15,
  D: 15
}

const STORAGE_KEY = 'crm_leads_data'
const RULES_KEY = 'lead_pool_rules'
const CURRENT_USER_ID = 1
const CURRENT_USER_NAME = '我'

const mockUsers = [
  { id: 1, name: '张三' },
  { id: 2, name: '李四' },
  { id: 3, name: '王五' },
  { id: 4, name: '赵六' }
]

const activeTab = ref<'pool' | 'my'>('pool')
const router = useRouter()
const loading = ref(false)
const tableRef = ref()
const allLeads = ref<Lead[]>([])
const selectedRows = ref<Lead[]>([])

// ============ 跟进线索弹窗 ============
const followUpVisible = ref(false)
const currentFollowUpLead = ref<Lead | null>(null)
const followFormRef = ref<FormInstance>()
const followForm = reactive({
  followMethod: '' as FollowMethod | '',
  content: '',
  customerFeedback: '' as CustomerFeedback | '',
  nextFollowDate: '',
  nextFollowPlan: '',
  duration: undefined as number | undefined
})

const followFormRules: FormRules = {
  followMethod: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [
    { required: true, message: '请输入沟通内容', trigger: 'blur' },
    {
      validator: (_r: any, v: string, cb: any) => {
        if (!v || v.trim().length < 10) cb(new Error('沟通内容不少于10字'))
        else cb()
      },
      trigger: 'blur'
    }
  ],
  customerFeedback: [{ required: true, message: '请选择客户反馈', trigger: 'change' }],
  nextFollowDate: [
    { required: true, message: '请选择下次跟进日期', trigger: 'change' },
    {
      validator: (_r: any, v: string, cb: any) => {
        if (!v) return cb()
        const d = new Date(v)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (d.getTime() <= today.getTime()) cb(new Error('请选择未来的跟进日期'))
        else cb()
      },
      trigger: 'change'
    }
  ]
}

const disablePastDate = (date: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date.getTime() <= today.getTime()
}

const currentFollowUpRecords = computed(() => {
  if (!currentFollowUpLead.value?.followUpRecords) return []
  return [...currentFollowUpLead.value.followUpRecords].reverse()
})

// ============ 跟进辅助：方式 / 反馈 / 频率 / 保护期 ============
const followMethodIcon = (m?: FollowMethod) => {
  const map: Record<FollowMethod, string> = { phone: '📞', wechat: '💬', meeting: '🤝', email: '📧', other: '📋' }
  return m ? map[m] : '📋'
}
const followMethodLabel = (m?: FollowMethod) => {
  const map: Record<FollowMethod, string> = { phone: '电话', wechat: '微信', meeting: '面谈', email: '邮件', other: '其他' }
  return m ? map[m] : '其他'
}
const feedbackLabel = (f?: CustomerFeedback) => {
  const map: Record<CustomerFeedback, string> = { positive: '😊 积极', neutral: '😐 中性', negative: '😟 消极', rejected: '❌ 拒绝', lost_contact: '📵 失联' }
  return f ? map[f] : '—'
}
const feedbackTagType = (f?: CustomerFeedback) => {
  const map: Record<CustomerFeedback, string> = { positive: 'success', neutral: 'info', negative: 'warning', rejected: 'danger', lost_contact: '' }
  return f ? map[f] : 'info'
}

const statusToLevel = (status: number): CustomerLevel => {
  // 0新建/A初步=>D, B需求=>C, C方案=>B, D谈判=>A
  if (status >= 5) return 'A'
  if (status === 4) return 'B'
  if (status === 3) return 'C'
  return 'D'
}

const getLeadLevel = (lead: Lead): CustomerLevel => lead.level || statusToLevel(lead.status)

const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000)

const computeFollowFrequencyState = (lead: Lead) => {
  const level = getLeadLevel(lead)
  const limit = followFrequencyStandard[level]
  if (!lead.lastFollowTime) {
    return { level, limit, overdueDays: 0, daysToDue: limit, status: 'never' as const }
  }
  const last = new Date(lead.lastFollowTime.replace(/-/g, '/'))
  const now = new Date()
  const passed = daysBetween(now, last)
  const remaining = limit - passed
  if (remaining < 0) {
    return { level, limit, overdueDays: -remaining, daysToDue: 0, status: 'overdue' as const }
  }
  if (remaining <= 2) {
    return { level, limit, overdueDays: 0, daysToDue: remaining, status: 'soon' as const }
  }
  return { level, limit, overdueDays: 0, daysToDue: remaining, status: 'ok' as const }
}

const formatDate = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

const followSummary = computed(() => {
  const lead = currentFollowUpLead.value
  if (!lead) return null as any
  const records = lead.followUpRecords || []
  const count = records.length
  let lastFollowText = '从未跟进'
  if (lead.lastFollowTime) {
    const last = new Date(lead.lastFollowTime.replace(/-/g, '/'))
    const days = daysBetween(new Date(), last)
    lastFollowText = days <= 0 ? '今天' : `${days} 天前`
  }
  // 保护期：基于 protectionDeadline，否则按创建时间 + 30 天兜底
  let deadlineDate: Date
  if (lead.protectionDeadline) {
    deadlineDate = new Date(lead.protectionDeadline.replace(/-/g, '/'))
  } else {
    const base = lead.createTime ? new Date(lead.createTime.replace(/-/g, '/')) : new Date()
    deadlineDate = new Date(base.getTime() + 30 * 86400000)
  }
  const protectionLeft = Math.max(0, daysBetween(deadlineDate, new Date()))
  let countdownLabel = `🟢 ${protectionLeft}天`
  let countdownClass = 'cd-green'
  if (protectionLeft <= 1) { countdownLabel = '🔴 明日回收!'; countdownClass = 'cd-red' }
  else if (protectionLeft <= 3) { countdownLabel = `🟡 ${protectionLeft}天`; countdownClass = 'cd-yellow' }
  else if (protectionLeft <= 7) { countdownLabel = `🟢 ${protectionLeft}天`; countdownClass = 'cd-green' }

  const freq = computeFollowFrequencyState(lead)
  let overdueText = ''
  let upcomingText = ''
  if (freq.status === 'overdue') {
    overdueText = `已超期 ${freq.overdueDays} 天未跟进（${freq.level} 级标准: ${freq.limit} 天/次）`
  } else if (freq.status === 'soon') {
    upcomingText = `距下次跟进截止还有 ${freq.daysToDue} 天（${freq.level} 级标准）`
  } else if (freq.status === 'never') {
    overdueText = `尚未发起首次跟进（${freq.level} 级标准: ${freq.limit} 天/次）`
  }

  let recycledNotice = ''
  if (lead.recycledHistory) {
    recycledNotice = `该客户于 ${lead.recycledHistory.date} 因 ${followFrequencyStandard[freq.level]} 天未跟进被回收，原跟进人：${lead.recycledHistory.previousOwner}`
  }

  return {
    count,
    lastFollowText,
    protectionLeft,
    protectionDeadline: formatDate(deadlineDate),
    countdownLabel,
    countdownClass,
    overdueText,
    upcomingText,
    recycledNotice,
    level: freq.level
  }
})

// ============ 优化1+5: 客户分层 · Mock 关联关系 ============
interface RelatedEnterprise {
  id: number
  name: string
  serviceStatus: 'active' | 'completed' | 'pending' | 'paused'
  serviceLabel: string
  amount?: number
}
interface CustomerTier {
  mode: 'personal' | 'enterprise'
  bossName: string
  enterprises: RelatedEnterprise[]
}
const tierExpanded = ref(true)
const currentTier = reactive<CustomerTier>({
  mode: 'enterprise',
  bossName: '张三',
  enterprises: []
})

// 根据 id 生成稳定 Mock 分层数据
const buildTierMock = (lead: Lead): CustomerTier => {
  const isPersonal = lead.id % 2 === 0
  const bossName = lead.company || mockUsers[lead.id % mockUsers.length].name
  const enterprisePool = [
    { suffix: '科技有限公司', service: 'active', label: '代理记账-服务中', amount: 36000 },
    { suffix: '贸易有限公司', service: 'completed', label: '工商注册-已完成', amount: 8800 },
    { suffix: '文化传媒有限公司', service: 'pending', label: '待签约', amount: 0 },
    { suffix: '供应链管理有限公司', service: 'paused', label: '服务暂停', amount: 12600 }
  ] as const
  const cityPrefix = '杭州'
  const enterpriseCount = (lead.id % 3) + 2
  const list: RelatedEnterprise[] = []
  for (let i = 0; i < enterpriseCount; i++) {
    const e = enterprisePool[i % enterprisePool.length]
    list.push({
      id: lead.id * 100 + i,
      name: `${cityPrefix}${String.fromCharCode(0x5b50 + i)}讯${e.suffix}`,
      serviceStatus: e.service as RelatedEnterprise['serviceStatus'],
      serviceLabel: e.label,
      amount: e.amount
    })
  }
  // 企业视图下，当前企业作为其中一个节点
  if (!isPersonal) {
    list[0] = {
      id: lead.id,
      name: lead.name,
      serviceStatus: 'active',
      serviceLabel: '当前跟进中',
      amount: 0
    }
  }
  return {
    mode: isPersonal ? 'personal' : 'enterprise',
    bossName,
    enterprises: list
  }
}

const serviceTagType = (s: RelatedEnterprise['serviceStatus']) => {
  const map: Record<RelatedEnterprise['serviceStatus'], string> = {
    active: 'success',
    completed: 'info',
    pending: 'warning',
    paused: 'danger'
  }
  return map[s]
}
const jumpBoss = () => {
  ElMessage.info(`跳转到老板「${currentTier.bossName}」客户详情（Mock）`)
}

// ============ 优化4: 客户状态机 ============
interface Stage { key: string; label: string; statusValue?: number }
const stageList: Stage[] = [
  { key: 'new', label: '新分配', statusValue: 1 },
  { key: 'first', label: '首次触达', statusValue: 2 },
  { key: 'demand', label: '需求确认', statusValue: 3 },
  { key: 'quote', label: '方案报价', statusValue: 4 },
  { key: 'nego', label: '谈判签约', statusValue: 5 },
  { key: 'deal', label: '已成交', statusValue: 6 },
  { key: 'service', label: '服务交付' },
  { key: 'renew', label: '续费管理' }
]
const currentStageIndex = computed(() => {
  const lead = currentFollowUpLead.value
  if (!lead) return 0
  // 如果存储了 stageOverride 则优先
  const override = (lead as any).__stageOverride as number | undefined
  if (typeof override === 'number') return override
  const idx = stageList.findIndex(s => s.statusValue === lead.status)
  return idx >= 0 ? idx : 0
})
const stageEnterTime = (idx: number) => {
  const lead = currentFollowUpLead.value
  if (!lead) return ''
  if (idx === 0) return lead.createTime?.slice(0, 10) || ''
  if (idx <= currentStageIndex.value) {
    // 从跟进记录中推算 (mock)
    const records = lead.followUpRecords || []
    const r = records[Math.min(records.length - 1, idx - 1)]
    return r?.time?.slice(0, 10) || ''
  }
  return ''
}
const clickStage = async (idx: number) => {
  const lead = currentFollowUpLead.value
  if (!lead) return
  if (idx === currentStageIndex.value) return
  const target = stageList[idx]
  try {
    await ElMessageBox.confirm(`确认将客户「${lead.name}」阶段切换为「${target.label}」？`, '阶段切换', { type: 'warning' })
  } catch { return }
  if (target.statusValue) {
    lead.status = target.statusValue
  } else {
    ;(lead as any).__stageOverride = idx
  }
  saveToStorage()
  ElMessage.success(`已推进至「${target.label}」`)
}

// ============ 优化2: 快速标记 ============
type QuickMarkValue = 'no_pickup' | 'intent' | 'no_intent' | 'reject' | 'callback' | 'wechat_added'
interface QuickMarkOption {
  value: QuickMarkValue
  label: string
  emoji: string
  color: string
  tagType: string
  effect: string
  validFollow: boolean
}
const quickMarkOptions: QuickMarkOption[] = [
  { value: 'no_pickup',    label: '未接通',     emoji: '📵', color: 'gray',   tagType: 'info',    effect: '连续3次→失联',     validFollow: false },
  { value: 'no_intent',    label: '接通-无意向', emoji: '🟡', color: 'orange', tagType: 'warning', effect: '建议降为D级',       validFollow: false },
  { value: 'intent',       label: '接通-有意向', emoji: '✅', color: 'green',  tagType: 'success', effect: '24h内须补详细跟进', validFollow: false },
  { value: 'reject',       label: '接通-拒绝',   emoji: '❌', color: 'red',    tagType: 'danger',  effect: '建议降为D级',       validFollow: false },
  { value: 'callback',     label: '预约回拨',    emoji: '🕒', color: 'blue',   tagType: '',        effect: '生成回拨提醒·重置15天', validFollow: true },
  { value: 'wechat_added', label: '微信已加',    emoji: '💬', color: 'green',  tagType: 'success', effect: '重置15天回收',      validFollow: true }
]
const followMode = ref<'quick' | 'detail'>('quick')
const lastQuickMark = ref<QuickMarkValue | ''>('')
const showIntentTip = ref(false)
// 全局 tick：用于实时刷新倒计时
const nowTick = ref(Date.now())
let nowTimer: number | null = null
// 意向标记过期提示（一次性）
const intentExpired = ref(false)
const clearIntentExpired = () => { intentExpired.value = false }

// 标记历史（取自当前客户的快速标记类记录，倒序展示前 8 条）
const quickMarkHistory = computed(() => {
  const lead = currentFollowUpLead.value
  if (!lead?.followUpRecords?.length) return []
  const list: Array<{ time: string; label: string; emoji: string; color: string }> = []
  const reverseRecords = [...lead.followUpRecords].reverse()
  for (const r of reverseRecords) {
    if (!r.content?.startsWith('[快速标记]')) continue
    const opt = quickMarkOptions.find(o => r.content.includes(o.label))
    if (!opt) continue
    list.push({ time: r.time?.slice(5) || '', label: opt.label, emoji: opt.emoji, color: opt.color })
    if (list.length >= 8) break
  }
  return list
})

// 连续未接通次数（自最近一次标记起向前累加，遇到非未接通中断）
const consecutiveNoPickup = computed(() => {
  const lead = currentFollowUpLead.value
  if (!lead?.followUpRecords?.length) return 0
  let count = 0
  for (let i = lead.followUpRecords.length - 1; i >= 0; i--) {
    const r = lead.followUpRecords[i]
    if (!r.content?.startsWith('[快速标记]')) continue
    if (r.content.includes('未接通')) count++
    else break
  }
  return count
})

// 意向标记倒计时（24小时内）
const intentMarkTime = ref<Date | null>(null)
const intentCountdown = computed(() => {
  if (!intentMarkTime.value) return ''
  // 依赖 nowTick 触发响应
  const _ = nowTick.value
  void _
  const elapsed = Date.now() - intentMarkTime.value.getTime()
  const remain = 24 * 3600 * 1000 - elapsed
  if (remain <= 0) return ''
  const h = Math.floor(remain / 3600000)
  const m = Math.floor((remain % 3600000) / 60000)
  const s = Math.floor((remain % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

// 失联状态：连续3次未接通→疑似失联；进一步7天无有效触达→失联预警
const lostContactStatus = computed<'normal' | 'suspected' | 'warning'>(() => {
  const lead = currentFollowUpLead.value
  if (!lead) return 'normal'
  if (consecutiveNoPickup.value < 3) return 'normal'
  if (lead.lastFollowTime) {
    // 找最近一次有效跟进（非未接通的快速标记或所有详细记录）
    const records = lead.followUpRecords || []
    let lastValidTime: Date | null = null
    for (let i = records.length - 1; i >= 0; i--) {
      const r = records[i]
      const isQuick = r.content?.startsWith('[快速标记]')
      const isInvalid = isQuick && (r.content.includes('未接通') || r.content.includes('无意向') || r.content.includes('拒绝'))
      if (!isInvalid) {
        lastValidTime = new Date(r.time.replace(/-/g, '/'))
        break
      }
    }
    const baseTime = lastValidTime || new Date(lead.lastFollowTime.replace(/-/g, '/'))
    const passedDays = Math.floor((Date.now() - baseTime.getTime()) / 86400000)
    if (passedDays >= 7) return 'warning'
  }
  return 'suspected'
})

// 风险标签（频率建议+滞后+失联+意向）
const riskBadges = computed(() => {
  const lead = currentFollowUpLead.value
  if (!lead) return []
  const list: Array<{ key: string; color: string; icon: string; text: string }> = []
  const level = (followSummary.value?.level || 'D') as CustomerLevel
  const limit = followFrequencyStandard[level]
  list.push({ key: 'freq', color: 'gold', icon: '📅', text: `${level}级建议每 ${limit} 天跟进 · 跟进滞后将触发预警` })
  const freq = computeFollowFrequencyState(lead)
  if (freq.status === 'overdue') {
    list.push({ key: 'lag', color: 'red', icon: '🔥', text: `跟进滞后 ${freq.overdueDays} 天` })
  } else if (freq.status === 'never') {
    list.push({ key: 'lag', color: 'red', icon: '🔥', text: '尚未发起首次跟进' })
  }
  if (lostContactStatus.value === 'warning') {
    list.push({ key: 'lost', color: 'red', icon: '🚨', text: '失联预警 · 7 天无有效触达' })
  } else if (lostContactStatus.value === 'suspected') {
    list.push({ key: 'lost', color: 'orange', icon: '⚠️', text: `疑似失联 · 连续 ${consecutiveNoPickup.value} 次未接通` })
  }
  return list
})

const applyQuickMark = (q: QuickMarkOption) => {
  if (!currentFollowUpLead.value) return
  const now = new Date()
  const time = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0')
  const fullTime = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' + time.slice(0, 5)
  lastQuickMark.value = q.value
  showIntentTip.value = q.value === 'intent'

  // 写入跟进记录，标记为快速记录
  const lead = currentFollowUpLead.value
  if (!lead.followUpRecords) lead.followUpRecords = []
  const feedbackMap: Record<QuickMarkValue, CustomerFeedback> = {
    no_pickup: 'lost_contact',
    intent: 'positive',
    no_intent: 'negative',
    reject: 'rejected',
    callback: 'neutral',
    wechat_added: 'positive'
  }
  lead.followUpRecords.push({
    content: `[快速标记] ${q.label} · ${q.effect}`,
    operator: CURRENT_USER_NAME,
    time: fullTime,
    followMethod: q.value === 'wechat_added' ? 'wechat' : 'phone',
    customerFeedback: feedbackMap[q.value]
  })
  lead.lastFollowTime = fullTime

  // 意向标记：记录时间，启动 24h 倒计时
  if (q.value === 'intent') {
    lead.intentMarkAt = now.toISOString()
    intentMarkTime.value = now
    intentExpired.value = false
  }
  // 某些标记会重置保护期（预约回拨 / 微信已加）
  if (q.value === 'callback' || q.value === 'wechat_added') {
    const newDeadline = new Date(now.getTime() + 15 * 86400000)
    lead.protectionDeadline = formatDate(newDeadline)
  }
  saveToStorage()
  ElMessage.success(`标记成功：${q.label}`)
}

const checkIntentExpired = () => {
  const lead = currentFollowUpLead.value
  if (!lead?.intentMarkAt) return
  const elapsed = Date.now() - new Date(lead.intentMarkAt).getTime()
  if (elapsed >= 24 * 3600 * 1000) {
    intentExpired.value = true
    intentMarkTime.value = null
    delete lead.intentMarkAt
    saveToStorage()
  }
}

const openFollowUp = (row: Lead) => {
  currentFollowUpLead.value = row
  // 初始化分层 mock
  const tier = buildTierMock(row)
  Object.assign(currentTier, tier)
  // 重置快速标记状态
  followMode.value = 'quick'
  lastQuickMark.value = ''
  showIntentTip.value = false
  intentExpired.value = false
  // 加载意向标记时间 + 检查是否过期
  if (row.intentMarkAt) {
    const t = new Date(row.intentMarkAt)
    const elapsed = Date.now() - t.getTime()
    if (elapsed < 24 * 3600 * 1000) {
      intentMarkTime.value = t
    } else {
      intentMarkTime.value = null
      intentExpired.value = true
      delete row.intentMarkAt
      saveToStorage()
    }
  } else {
    intentMarkTime.value = null
  }
  Object.assign(followForm, {
    followMethod: '',
    content: '',
    customerFeedback: '',
    nextFollowDate: '',
    nextFollowPlan: '',
    duration: undefined
  })
  followFormRef.value?.clearValidate()
  followUpVisible.value = true
}

const saveFollowUp = async () => {
  if (!currentFollowUpLead.value || !followFormRef.value) return
  await followFormRef.value.validate(async (valid) => {
    if (!valid) return
    const now = new Date()
    const timeStr = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' +
      String(now.getMinutes()).padStart(2, '0')
    const record: FollowUpRecord = {
      content: followForm.content.trim(),
      operator: CURRENT_USER_NAME,
      time: timeStr,
      followMethod: followForm.followMethod as FollowMethod,
      customerFeedback: followForm.customerFeedback as CustomerFeedback,
      nextFollowDate: followForm.nextFollowDate,
      nextFollowPlan: followForm.nextFollowPlan?.trim() || '',
      duration: followForm.followMethod === 'phone' ? followForm.duration : undefined
    }
    const lead = currentFollowUpLead.value!
    if (!lead.followUpRecords) lead.followUpRecords = []
    lead.followUpRecords.push(record)
    lead.lastFollowTime = timeStr
    // 详细跟进最低频率补足：重置15天保护期
    const newDeadline = new Date(now.getTime() + 15 * 86400000)
    lead.protectionDeadline = formatDate(newDeadline)
    // 如果之前标了「有意向」且未超期，补足后清除倒计时
    if (lead.intentMarkAt) {
      delete lead.intentMarkAt
    }
    intentMarkTime.value = null
    intentExpired.value = false
    saveToStorage()
    Object.assign(followForm, {
      followMethod: '', content: '', customerFeedback: '',
      nextFollowDate: '', nextFollowPlan: '', duration: undefined
    })
    followFormRef.value?.clearValidate()
    ElMessage.success('跟进记录已保存')
  })
}

const queryParams = reactive({
  page: 1,
  size: 20,
  source: null as number | null,
  status: null as number | null,
  keyword: ''
})

// ============ 数据初始化 ============
const seedData = (): Lead[] => {
  return []
}

const loadFromStorage = (): Lead[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as Lead[]
  } catch {}
  return []
}

const saveToStorage = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allLeads.value))
  } catch {}
}

const fetchLeads = async () => {
  loading.value = true
  try {
    let resp: any = null
    // 对齐后端入参名:pageNum/pageSize/name
    const params = {
      pageNum: queryParams.page,
      pageSize: queryParams.size,
      name: queryParams.keyword || undefined
    }
    if (activeTab.value === 'pool') resp = await leadApi.poolList(params)
    else resp = await leadApi.myList({ ...params, status: queryParams.status ?? undefined })
    // 兼容分页适配:优先 records(IPage),其次 list
    const records = resp && (resp.records || resp.list)
    if (Array.isArray(records)) {
      allLeads.value = records.map(mapBackendLead)
      saveToStorage()
    } else {
      throw new Error('empty')
    }
  } catch {
    const cached = loadFromStorage()
    allLeads.value = cached
  } finally {
    loading.value = false
  }
}

// 后端 CrmLead(ownership/customerLevel/snake 时间)→ 页面 Lead 模型
const mapBackendLead = (r: any): Lead => {
  const isPool = r.ownership !== 'private'
  return {
    id: r.id,
    name: r.name || '',
    company: r.company || '',
    phone: r.phone || '',
    registerDate: (r.createTime || '').slice(0, 10),
    email: r.email || '',
    source: r.source ?? 1,
    status: r.status ?? 1,
    pool: isPool ? 1 : 0,
    ownerId: r.ownerId ?? null,
    ownerName: r.ownerId === CURRENT_USER_ID ? CURRENT_USER_NAME : (r.ownerName || ''),
    lastFollowTime: r.lastFollowTime || '',
    createTime: r.createTime || '',
    remark: r.remark || '',
    level: r.customerLevel || undefined,
    followUpRecords: Array.isArray(r.followUpRecords) ? r.followUpRecords : []
  }
}

// ============ 计算属性 ============
const filteredList = computed(() => {
  let list = allLeads.value.slice()
  if (activeTab.value === 'pool') list = list.filter(l => l.pool === 1)
  else if (activeTab.value === 'my') list = list.filter(l => l.pool === 0 && l.ownerId === CURRENT_USER_ID)
  if (queryParams.source != null) list = list.filter(l => l.source === queryParams.source)
  if (queryParams.status != null) list = list.filter(l => l.status === queryParams.status)
  const kw = queryParams.keyword.trim()
  if (kw) list = list.filter(l => l.name.includes(kw) || l.phone.includes(kw))
  return list
})

const totalCount = computed(() => filteredList.value.length)

// ============ 标签辅助 ============
const sourceLabel = (val: number) => {
  const map: Record<number, string> = { 1: '天眼查平台', 2: '老客户转介绍', 3: '运营-美团', 4: '运营-抖音', 5: '线下来客' }
  return map[val] || '-'
}
const sourceTagType = (val: number) => {
  const map: Record<number, string> = { 1: '', 2: 'success', 3: 'warning', 4: 'danger', 5: 'info' }
  return map[val] || ''
}
const statusLabel = (val: number) => {
  const map: Record<number, string> = { 1: '0新建客户', 2: 'A初步接洽', 3: 'B需求确认', 4: 'C方案报价', 5: 'D谈判审核', 6: 'E成交' }
  return map[val] || '-'
}
const statusTagType = (val: number) => {
  const map: Record<number, string> = { 1: 'info', 2: '', 3: 'warning', 4: 'warning', 5: 'danger', 6: 'success' }
  return map[val] || ''
}

// ============ 交互 ============
const handleTabChange = () => {
  selectedRows.value = []
  queryParams.page = 1
  fetchLeads()
}
const handleSearch = () => { queryParams.page = 1; fetchLeads() }
const handleReset = () => {
  queryParams.source = null
  queryParams.status = null
  queryParams.keyword = ''
  queryParams.page = 1
  fetchLeads()
}
const handleSelectionChange = (rows: Lead[]) => { selectedRows.value = rows }
const clearSelection = () => { tableRef.value?.clearSelection() }

// ============ 新建 / 编辑 ============
const formRef = ref<FormInstance>()
const formDialog = reactive({ visible: false, isEdit: false })
const formData = reactive<Partial<Lead>>({
  id: 0, name: '', company: '', phone: '', registerDate: '', email: '', source: 1, status: 1, remark: ''
})
const formRules: FormRules = {
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }]
}

const resetFormData = () => {
  Object.assign(formData, { id: 0, name: '', company: '', phone: '', registerDate: '', email: '', source: 1, status: 1, remark: '' })
}
const openCreate = () => {
  formDialog.isEdit = false
  resetFormData()
  formDialog.visible = true
}
const openEdit = (row: Lead) => {
  formDialog.isEdit = true
  Object.assign(formData, row)
  formDialog.visible = true
}
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    if (formDialog.isEdit) {
      try { await leadApi.update(formData) } catch {}
      const idx = allLeads.value.findIndex(l => l.id === formData.id)
      if (idx >= 0) Object.assign(allLeads.value[idx], formData)
      ElMessage.success('已更新')
    } else {
      const newLead: Lead = {
        id: Date.now(),
        name: formData.name || '',
        company: formData.company || '',
        phone: formData.phone || '',
        registerDate: formData.registerDate || '',
        email: formData.email || '',
        source: formData.source || 1,
        status: 1,
        pool: 0,
        ownerId: CURRENT_USER_ID,
        ownerName: CURRENT_USER_NAME,
        lastFollowTime: '',
        createTime: new Date().toISOString().slice(0, 16).replace('T', ' '),
        remark: formData.remark || ''
      }
      try { await leadApi.create(newLead) } catch {}
      allLeads.value.unshift(newLead)
      ElMessage.success('已创建')
    }
    saveToStorage()
    formDialog.visible = false
  })
}

// ============ 删除 ============
const handleDelete = async (row: Lead) => {
  await ElMessageBox.confirm(`确定删除线索「${row.name}」？`, '提示', { type: 'warning' })
  try { await leadApi.remove(row.id) } catch {}
  allLeads.value = allLeads.value.filter(l => l.id !== row.id)
  saveToStorage()
  ElMessage.success('已删除')
}
const handleBatchDelete = async () => {
  await ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 条线索？`, '提示', { type: 'warning' })
  const ids = selectedRows.value.map(r => r.id)
  allLeads.value = allLeads.value.filter(l => !ids.includes(l.id))
  saveToStorage()
  selectedRows.value = []
  ElMessage.success('已删除')
}

// ============ 成交 / 放回公海 ============
const handleDeal = (row: Lead) => {
  row.status = 6
  saveToStorage()
  ElMessage.success('已标记为成交')
}
const handleReturnToPool = async (row: Lead) => {
  await ElMessageBox.confirm(`确定将「${row.name}」放回公海？`, '提示', { type: 'warning' })
  try { await leadApi.returnToPool([row.id], '') } catch {}
  row.pool = 1
  row.ownerId = null
  row.ownerName = ''
  saveToStorage()
  ElMessage.success('已放回公海')
}

// ============ 领取 / 退回 / 分配 ============
const handleClaimSingle = async (row: Lead) => {
  try { await leadApi.claim([row.id]) } catch {}
  row.pool = 0
  row.ownerId = CURRENT_USER_ID
  row.ownerName = CURRENT_USER_NAME
  saveToStorage()
  ElMessage.success(`已领取「${row.name}」`)
}
const handleClaim = async () => {
  const ids = selectedRows.value.map(r => r.id)
  try { await leadApi.claim(ids) } catch {}
  allLeads.value.forEach(l => {
    if (ids.includes(l.id)) {
      l.pool = 0
      l.ownerId = CURRENT_USER_ID
      l.ownerName = CURRENT_USER_NAME
    }
  })
  saveToStorage()
  selectedRows.value = []
  ElMessage.success(`已领取 ${ids.length} 条`)
}

const distributeDialog = reactive({ visible: false, ownerId: null as number | null })
const openDistribute = () => {
  distributeDialog.ownerId = null
  distributeDialog.visible = true
}
const submitDistribute = async () => {
  if (!distributeDialog.ownerId) return ElMessage.warning('请选择负责人')
  const ids = selectedRows.value.map(r => r.id)
  const ownerId = distributeDialog.ownerId
  const ownerName = mockUsers.find(u => u.id === ownerId)?.name || ''
  try { await leadApi.distribute({ ids, ownerId }) } catch {}
  allLeads.value.forEach(l => {
    if (ids.includes(l.id)) {
      l.pool = 0
      l.ownerId = ownerId
      l.ownerName = ownerName
    }
  })
  saveToStorage()
  selectedRows.value = []
  distributeDialog.visible = false
  ElMessage.success('已分配')
}

const returnDialog = reactive({ visible: false, reason: '' })
const openReturnPool = () => {
  returnDialog.reason = ''
  returnDialog.visible = true
}
const submitReturn = async () => {
  const ids = selectedRows.value.map(r => r.id)
  try { await leadApi.returnToPool(ids, returnDialog.reason) } catch {}
  allLeads.value.forEach(l => {
    if (ids.includes(l.id)) {
      l.pool = 1
      l.ownerId = null
      l.ownerName = ''
    }
  })
  saveToStorage()
  selectedRows.value = []
  returnDialog.visible = false
  ElMessage.success('已退回公海')
}

// ============ 更多菜单 ============
const handleMore = (cmd: string) => {
  if (cmd === 'import') importDialog.visible = true
  else if (cmd === 'export') doExport()
  else if (cmd === 'rules') openRules()
  else if (cmd === 'duplicate') {
    dupDialog.field = 'phone'
    dupDialog.value = ''
    dupDialog.searched = false
    dupDialog.results = []
    dupDialog.visible = true
  }
}

// ============ 公海规则 ============
interface DistributeRule { name: string; trigger: string; mode: string; target: string; maxHold: number; priority: number; enabled: boolean }
interface RecycleRule { name: string; condition: string; days: number; scope: string; enabled: boolean }

const rulesDialog = reactive({
  visible: false,
  activeTab: 'distribute',
  distributeRules: [] as DistributeRule[],
  recycleRules: [] as RecycleRule[]
})

const addDistributeRule = () => {
  rulesDialog.distributeRules.push({
    name: '新规则', trigger: 'onCreate', mode: 'round', target: '', maxHold: 100, priority: 10, enabled: true
  })
}
const addRecycleRule = () => {
  rulesDialog.recycleRules.push({ name: '新规则', condition: 'noFollow', days: 15, scope: 'all', enabled: true })
}

const openRules = async () => {
  try {
    const resp: any = await leadApi.getPoolRules()
    rulesDialog.distributeRules = resp?.distributeRules || []
    rulesDialog.recycleRules = resp?.recycleRules || []
  } catch {
    try {
      const raw = localStorage.getItem(RULES_KEY)
      if (raw) {
        const data = JSON.parse(raw)
        rulesDialog.distributeRules = data.distributeRules || []
        rulesDialog.recycleRules = data.recycleRules || []
      } else {
        rulesDialog.distributeRules = [
          { name: '默认轮询', trigger: 'onCreate', mode: 'round', target: '销售一部', maxHold: 200, priority: 10, enabled: true }
        ]
        rulesDialog.recycleRules = [
          { name: '15 天未跟进', condition: 'noFollow', days: 15, scope: 'all', enabled: true }
        ]
      }
    } catch {}
  }
  rulesDialog.visible = true
}
const openGlobalDistributeConfig = () => {
  rulesDialog.visible = false
  router.push('/system/distribute-config')
}

const savePoolRules = async () => {
  const payload = {
    distributeRules: rulesDialog.distributeRules,
    recycleRules: rulesDialog.recycleRules
  }
  try {
    await leadApi.savePoolRules(payload)
    ElMessage.success('规则已保存到服务端')
  } catch {
    try { localStorage.setItem(RULES_KEY, JSON.stringify(payload)) } catch {}
    ElMessage.success('规则已保存到本地')
  }
  rulesDialog.visible = false
}

// ============ 导入 ============
const importDialog = reactive({
  visible: false,
  preview: [] as any[],
  rows: [] as any[]
})

const downloadTemplate = () => {
  const header = '公司名称,联系人,联系电话,公司注册日期,来源(1天眼查/2转介绍/3美团/4抖音/5线下),公司地址,备注\n'
  const sample = '杭州示例科技有限公司,张三,13800000000,2020-01-15,1,杭州市西湖区示例路 1 号,示例备注\n'
  const blob = new Blob(['\uFEFF' + header + sample], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'lead_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

const handleFileChange = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text = (e.target?.result as string) || ''
    const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean)
    if (lines.length < 2) {
      ElMessage.warning('文件内容为空')
      return
    }
    const rows: any[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      rows.push({
        name: cols[0]?.trim() || '',
        company: cols[1]?.trim() || '',
        phone: cols[2]?.trim() || '',
        registerDate: cols[3]?.trim() || '',
        source: Number(cols[4]?.trim()) || 1,
        email: cols[5]?.trim() || '',
        remark: cols[6]?.trim() || ''
      })
    }
    importDialog.rows = rows
    importDialog.preview = rows.slice(0, 5)
  }
  reader.readAsText(file.raw, 'utf-8')
}

const confirmImport = async () => {
  try {
    const fd = new FormData()
    fd.append('rows', JSON.stringify(importDialog.rows))
    await leadApi.importLeads(fd)
  } catch {}
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ')
  importDialog.rows.forEach((r: any, idx: number) => {
    allLeads.value.unshift({
      id: Date.now() + idx,
      name: r.name, company: r.company, phone: r.phone, registerDate: r.registerDate || '', email: r.email,
      source: r.source, status: 1, pool: 1,
      ownerId: null, ownerName: '',
      lastFollowTime: '', createTime: now, remark: r.remark || ''
    })
  })
  saveToStorage()
  ElMessage.success(`已导入 ${importDialog.rows.length} 条线索`)
  importDialog.preview = []
  importDialog.rows = []
  importDialog.visible = false
}

// ============ 导出 ============
const doExport = () => {
  const rows = filteredList.value
  if (!rows.length) return ElMessage.warning('当前没有可导出数据')
  const header = ['公司名称', '联系人', '联系电话', '公司注册日期', '来源', '公司地址', '跟进状态', '负责人', '最近跟进', '创建时间']
  const lines = [header.join(',')]
  rows.forEach(r => {
    lines.push([
      r.name, r.company, r.phone, r.registerDate || '',
      sourceLabel(r.source), r.email,
      statusLabel(r.status),
      r.ownerName || '公海', r.lastFollowTime || '', r.createTime
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
  })
  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `线索导出_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success(`已导出 ${rows.length} 条`)
}

// ============ 查重 ============
const dupDialog = reactive({
  visible: false,
  field: 'phone' as 'phone' | 'name',
  value: '',
  searched: false,
  results: [] as Lead[]
})

const runDuplicate = async () => {
  const v = dupDialog.value.trim()
  if (!v) return ElMessage.warning('请输入查重值')
  try {
    const resp: any = await leadApi.checkDuplicate({ [dupDialog.field]: v })
    if (resp && Array.isArray(resp.records)) {
      dupDialog.results = resp.records
      dupDialog.searched = true
      return
    }
  } catch {}
  dupDialog.results = allLeads.value.filter(l => {
    if (dupDialog.field === 'phone') return l.phone.includes(v)
    return l.name.includes(v)
  })
  dupDialog.searched = true
}

// 表格行上的频率状态（供告警使用）
const rowFreqState = (row: Lead) => computeFollowFrequencyState(row)

onMounted(() => {
  fetchLeads()
  // 启动全局 tick（1 秒，仅用于倒计时实时刷新）
  nowTimer = window.setInterval(() => {
    nowTick.value = Date.now()
    if (followUpVisible.value) checkIntentExpired()
  }, 1000)
})

onBeforeUnmount(() => {
  if (nowTimer) {
    clearInterval(nowTimer)
    nowTimer = null
  }
})

const handleCall = (phone: string) => {
  if (!phone) return
  const a = document.createElement('a')
  a.href = `tel:${phone}`
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

</script>

<style scoped>
.lead-page {
  padding: 16px 20px;
  background: var(--bg-card);
  min-height: calc(100vh - 60px);
  color: var(--text-primary);
}

.page-header {
  background: var(--bg-elevated);
  border: 1px solid var(--border-gold);
  border-radius: 8px 8px 0 0;
  padding: 4px 16px 0;
}
.lead-tabs :deep(.el-tabs__item) {
  color: var(--text-body);
  font-size: 14px;
}
.lead-tabs :deep(.el-tabs__item.is-active) {
  color: var(--gold-primary);
  font-weight: 600;
}
.lead-tabs :deep(.el-tabs__active-bar) {
  background: var(--gold-primary);
  height: 3px;
  border-radius: 2px;
}
.lead-tabs :deep(.el-tabs__nav-wrap::after) { background: var(--border-gold); }

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border-left: 1px solid var(--border-gold);
  border-right: 1px solid var(--border-gold);
  border-bottom: 1px solid var(--border-gold);
}
.filter-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.filter-right { display: flex; align-items: center; gap: 10px; }

.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0));
  border-left: 1px solid var(--border-gold);
  border-right: 1px solid var(--border-gold);
  border-bottom: 1px solid var(--border-gold);
}
.batch-info { color: var(--text-body); font-size: 13px; }
.batch-info em { font-style: normal; color: var(--gold-primary); font-weight: 600; padding: 0 4px; }
.batch-actions { display: flex; align-items: center; gap: 8px; }

.table-wrap {
  background: var(--bg-elevated);
  border: 1px solid var(--border-gold);
  border-top: none;
  border-radius: 0 0 8px 8px;
  padding: 8px 12px 12px;
}
.link-text { color: var(--gold-primary); cursor: pointer; }
.link-text:hover { color: var(--gold-champagne); text-decoration: underline; }
.muted { color: var(--text-body); font-size: 12px; }

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 8px 4px;
}

.rules-inner-tabs :deep(.el-tabs__item.is-active) { color: var(--gold-primary); }
.rules-inner-tabs :deep(.el-tabs__active-bar) { background: var(--gold-primary); }
.rule-source-tip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 14px;
  margin-bottom: 14px;
  background: #f8fafc;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
}
.rule-source-tip strong {
  display: block;
  color: #111827;
  font-size: 14px;
  margin-bottom: 4px;
}
.rule-source-tip p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}
.rule-add-bar {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-gold);
  text-align: center;
}

.import-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(212, 175, 55, 0.08);
  border: 1px solid var(--border-gold);
  border-radius: 6px;
  color: var(--text-body);
  font-size: 13px;
  margin-bottom: 14px;
}
.import-tip .el-icon { color: var(--warning); }
.import-upload :deep(.el-upload-dragger) {
  background: var(--bg-darkest);
  border-color: var(--border-gold);
}
.import-preview { margin-top: 16px; }
.preview-title { color: var(--gold-primary); font-size: 13px; margin-bottom: 8px; font-weight: 600; }

.dup-result { margin-top: 12px; }

/* ============ 跟进弹窗增强样式 ============ */
.follow-summary {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.02));
  border: 1px solid var(--border-gold);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
}
.follow-summary .summary-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--text-body);
  font-size: 13px;
}
.follow-summary .summary-row em {
  font-style: normal;
  color: var(--gold-primary);
  font-weight: 600;
  padding: 0 2px;
}
.follow-summary .sep {
  color: var(--text-body);
  opacity: 0.4;
}
.protection-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--border-gold);
  font-size: 13px;
}
.protection-label { color: var(--text-body); }
.protection-date { color: var(--gold-primary); font-weight: 600; }
.protection-countdown {
  margin-left: auto;
  padding: 2px 10px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
}
.protection-countdown.cd-green { background: rgba(60, 180, 90, 0.2); color: #3cb45a; border: 1px solid rgba(60, 180, 90, 0.4); }
.protection-countdown.cd-yellow { background: rgba(240, 180, 50, 0.2); color: #f0b432; border: 1px solid rgba(240, 180, 50, 0.4); }
.protection-countdown.cd-red {
  background: rgba(230, 70, 70, 0.25);
  color: #ff5a5a;
  border: 1px solid rgba(230, 70, 70, 0.5);
  animation: cd-blink 1.2s ease-in-out infinite;
}
@keyframes cd-blink {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 rgba(230, 70, 70, 0); }
  50% { opacity: 0.65; box-shadow: 0 0 12px rgba(230, 70, 70, 0.6); }
}
.recycled-notice {
  background: rgba(160, 90, 220, 0.12);
  color: #c89bff;
  border: 1px solid rgba(160, 90, 220, 0.4);
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}
.overdue-warn {
  margin-top: 8px;
  color: #ff6b6b;
  font-size: 13px;
  font-weight: 600;
}
.upcoming-tip {
  margin-top: 8px;
  color: #f0b432;
  font-size: 13px;
  font-weight: 600;
}
.content-warn {
  color: #ff6b6b;
  font-size: 12px;
  margin-top: 4px;
}
.follow-timeline-wrap {
  flex: 1;
  border-left: 1px solid var(--border-gold);
  padding-left: 20px;
  overflow-y: auto;
  max-height: 540px;
}
.timeline-title {
  margin: 0 0 15px;
  color: var(--gold-primary);
}
.follow-record .record-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.follow-record .method-icon { font-size: 16px; }
.follow-record .method-label {
  color: var(--gold-primary);
  font-size: 13px;
  font-weight: 600;
}
.follow-record .duration-tag {
  font-size: 12px;
  color: var(--text-body);
  padding: 1px 8px;
  border-radius: 10px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.25);
}
.follow-record .record-content {
  margin: 0 0 6px;
  white-space: pre-wrap;
  color: var(--text-primary);
  line-height: 1.6;
}
.follow-record .record-next {
  font-size: 12px;
  color: var(--text-body);
  padding: 4px 8px;
  background: rgba(60, 130, 220, 0.08);
  border-left: 2px solid rgba(60, 130, 220, 0.5);
  border-radius: 2px;
}

/* 表格行“最近跟进”告警 */
.follow-cell { display: flex; flex-direction: column; gap: 2px; }
.follow-cell .follow-time { color: var(--text-primary); font-size: 13px; }
.follow-cell .tip-overdue { color: #ff6b6b; font-size: 12px; font-weight: 600; }
.follow-cell .tip-soon { color: #f0b432; font-size: 12px; font-weight: 600; }

/* ============ 优化4: 客户状态机 ============ */
.status-machine-wrap {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(60, 130, 220, 0.04));
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  padding: 14px 18px 18px;
  margin-bottom: 14px;
}
.sm-head {
  display: flex; align-items: baseline; gap: 12px;
  margin-bottom: 14px;
  border-bottom: 1px dashed var(--border-gold);
  padding-bottom: 8px;
}
.sm-title {
  font-weight: 700; color: var(--gold-primary);
  font-size: 14px; letter-spacing: 0.05em;
}
.sm-sub {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; color: var(--text-body); letter-spacing: 0.18em;
}
.sm-sub em { color: var(--gold-primary); font-style: normal; font-weight: 600; padding: 0 4px; letter-spacing: 0; }
.sm-stages {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 4px; position: relative;
}
.sm-node {
  flex: 1; position: relative; cursor: pointer; user-select: none;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
  transition: transform 0.2s;
}
.sm-node:hover { transform: translateY(-2px); }
.sm-circle {
  width: 30px; height: 30px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;
  border: 2px solid;
  background: var(--bg-darkest);
  z-index: 2;
  margin-bottom: 6px;
  transition: all 0.3s;
}
.sm-node.future .sm-circle { border-color: rgba(255,255,255,0.18); color: rgba(255,255,255,0.4); }
.sm-node.active .sm-circle {
  border-color: var(--gold-primary); color: var(--gold-primary);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15), 0 0 16px rgba(212, 175, 55, 0.4);
  animation: sm-pulse 1.6s ease-in-out infinite;
}
.sm-node.done .sm-circle {
  border-color: #3cb45a; color: #3cb45a; background: rgba(60, 180, 90, 0.1);
}
@keyframes sm-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.15), 0 0 16px rgba(212, 175, 55, 0.4); }
  50% { box-shadow: 0 0 0 6px rgba(212, 175, 55, 0.08), 0 0 24px rgba(212, 175, 55, 0.6); }
}
.sm-label { font-size: 12px; color: var(--text-primary); font-weight: 500; }
.sm-node.active .sm-label { color: var(--gold-primary); font-weight: 700; }
.sm-node.future .sm-label { color: rgba(255,255,255,0.4); }
.sm-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px; color: var(--text-body); margin-top: 2px;
}
.sm-line {
  position: absolute; top: 14px; left: calc(50% + 18px); right: calc(-50% + 18px);
  height: 2px; background: rgba(255,255,255,0.12);
  z-index: 1;
}
.sm-line.filled { background: linear-gradient(90deg, #3cb45a, var(--gold-primary)); }

/* ============ 优化1+5: 客户分层卡片 ============ */
.tier-card {
  border: 1px solid var(--border-gold);
  border-radius: 10px;
  margin-bottom: 14px;
  overflow: hidden;
  background: var(--bg-elevated);
}
.tier-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 16px;
  cursor: pointer;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.1), transparent);
  border-bottom: 1px solid var(--border-gold);
}
.tier-title {
  display: flex; align-items: center; gap: 10px;
  font-weight: 700; color: var(--gold-primary); font-size: 14px;
}
.tier-icon { font-size: 16px; }
.tier-mode { margin-left: 12px; }
.tier-toggle { color: var(--gold-primary); font-size: 14px; }
.tier-body { padding: 14px 18px; }

.personal-head {
  display: flex; align-items: center; gap: 14px;
  padding-bottom: 12px; border-bottom: 1px dashed var(--border-gold);
  margin-bottom: 12px;
}
.avatar-circle {
  width: 46px; height: 46px; border-radius: 50%;
  background: linear-gradient(135deg, var(--gold-primary), #b8902f);
  color: #1a1a22; font-weight: 700; font-size: 20px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}
.boss-name { font-size: 16px; color: var(--text-primary); font-weight: 700; }
.role-tag {
  font-size: 11px; padding: 1px 8px;
  background: rgba(212, 175, 55, 0.15);
  color: var(--gold-primary);
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 10px; margin-left: 4px; font-weight: 500;
}
.boss-meta { font-size: 12px; color: var(--text-body); margin-top: 4px; }
.boss-meta em { color: var(--gold-primary); font-style: normal; font-weight: 700; padding: 0 2px; }
.tree-title {
  font-size: 13px; color: var(--gold-primary); font-weight: 600;
  margin-bottom: 8px; padding-left: 4px;
}
.tree-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 8px 8px 12px;
  font-family: 'JetBrains Mono', monospace, '微软雅黑';
  font-size: 13px;
  border-radius: 6px;
  transition: background 0.2s;
}
.tree-row:hover { background: rgba(212, 175, 55, 0.06); }
.tree-branch { color: rgba(212, 175, 55, 0.6); }
.tree-name { flex: 1; color: var(--text-primary); font-family: '微软雅黑', sans-serif; }
.tree-amount {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; color: var(--gold-primary); font-weight: 600;
}
.enterprise-view .ent-row {
  display: flex; align-items: center; gap: 8px;
  padding: 6px 0;
  font-size: 13px; color: var(--text-primary);
}
.enterprise-view .ent-row span:first-child { color: var(--text-body); min-width: 96px; }
.enterprise-view .ent-row em { color: var(--gold-primary); font-style: normal; font-weight: 700; padding: 0 4px; }
.enterprise-view .ent-tip {
  margin-top: 12px; padding: 8px 12px;
  background: rgba(60, 130, 220, 0.08);
  border-left: 2px solid rgba(60, 130, 220, 0.5);
  border-radius: 4px;
  font-size: 12px; color: var(--text-body);
}

/* ============ 优化2: 双模式跟进 ============ */
.mode-switch {
  display: flex; align-items: center; gap: 12px;
  margin-bottom: 14px; padding: 8px 0;
  border-bottom: 1px dashed var(--border-gold);
}
.mode-hint { font-size: 12px; color: var(--text-body); }

.quick-mark-panel { padding: 4px 0; }
.qm-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}
.qm-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 14px 16px;
  background: var(--bg-darkest);
  border: 1.5px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 13px; font-weight: 500;
  transition: all 0.25s;
  text-align: left;
  position: relative;
  overflow: hidden;
}
.qm-btn::before {
  content: ''; position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px; background: var(--qm-accent, transparent);
  transition: width 0.25s;
}
.qm-btn:hover { transform: translateY(-2px); border-color: var(--qm-accent); }
.qm-btn:hover::before { width: 6px; }
.qm-btn.picked {
  border-color: var(--qm-accent);
  background: var(--qm-bg);
  box-shadow: 0 0 0 2px var(--qm-shadow);
}
.qm-btn.picked::before { width: 6px; }
.qm-emoji { font-size: 20px; }
.qm-text { flex: 1; }
.qm-gray { --qm-accent: #909399; --qm-bg: rgba(144,147,153,0.08); --qm-shadow: rgba(144,147,153,0.2); }
.qm-green { --qm-accent: #3cb45a; --qm-bg: rgba(60,180,90,0.08); --qm-shadow: rgba(60,180,90,0.25); }
.qm-orange { --qm-accent: #f0b432; --qm-bg: rgba(240,180,50,0.08); --qm-shadow: rgba(240,180,50,0.25); }
.qm-red { --qm-accent: #ff5a5a; --qm-bg: rgba(230,70,70,0.08); --qm-shadow: rgba(230,70,70,0.25); }
.qm-blue { --qm-accent: #4a90e2; --qm-bg: rgba(60,130,220,0.08); --qm-shadow: rgba(60,130,220,0.25); }
.qm-purple { --qm-accent: #a78bfa; --qm-bg: rgba(167,139,250,0.08); --qm-shadow: rgba(167,139,250,0.25); }

.intent-tip {
  margin-top: 12px;
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px;
  background: rgba(240, 180, 50, 0.12);
  border: 1px solid rgba(240, 180, 50, 0.4);
  border-left: 4px solid #f0b432;
  border-radius: 6px;
  color: #f0b432;
  font-size: 13px;
}
.intent-tip b { color: #ffd060; }
.intent-tip .el-button { margin-left: auto; }

.qm-log {
  margin-top: 14px;
  padding: 10px 12px;
  background: rgba(255,255,255,0.02);
  border: 1px dashed var(--border-gold);
  border-radius: 6px;
}
.qm-log-title { font-size: 12px; color: var(--gold-primary); margin-bottom: 6px; font-weight: 600; }
.qm-log-row {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 0; font-size: 12px;
}
.qm-log-time {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-body); width: 64px;
}

/* ============ 跟进规则引擎: 风险标签条 ============ */
.risk-badges-bar {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border-gold);
  display: flex; flex-wrap: wrap; gap: 8px;
}
.risk-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px; font-weight: 600;
  border: 1px solid transparent;
  letter-spacing: 0.02em;
}
.risk-badge .rb-icon { font-size: 13px; }
.risk-badge.risk-gold {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-primary);
  border-color: rgba(212, 175, 55, 0.4);
}
.risk-badge.risk-red {
  background: rgba(245, 108, 108, 0.14);
  color: #ff6b6b;
  border-color: rgba(245, 108, 108, 0.45);
  animation: rb-pulse 1.4s ease-in-out infinite;
}
.risk-badge.risk-orange {
  background: rgba(240, 180, 50, 0.14);
  color: #f5b041;
  border-color: rgba(240, 180, 50, 0.45);
}
.risk-badge.risk-yellow {
  background: rgba(240, 210, 60, 0.12);
  color: #f0d23c;
  border-color: rgba(240, 210, 60, 0.4);
}
@keyframes rb-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(245, 108, 108, 0.45); }
  50% { box-shadow: 0 0 0 4px rgba(245, 108, 108, 0); }
}

/* 24h 补跟倒计时条 */
.intent-countdown-bar {
  display: flex; align-items: center; gap: 12px;
  margin-top: 10px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(240, 180, 50, 0.16), rgba(240, 180, 50, 0.04));
  border: 1px solid rgba(240, 180, 50, 0.45);
  border-left: 4px solid #f0b432;
  border-radius: 6px;
  color: #f0b432;
  font-size: 13px;
  font-weight: 500;
}
.intent-countdown-bar .icb-pulse {
  font-size: 18px;
  animation: icb-spin 2s ease-in-out infinite;
}
.intent-countdown-bar .icb-text { flex: 1; line-height: 1.5; }
.intent-countdown-bar .icb-text b { color: #ffd060; }
.intent-countdown-bar .icb-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 15px;
  color: #ffd060;
  letter-spacing: 0.05em;
  padding: 0 4px;
}
@keyframes icb-spin {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

.intent-expired-bar {
  display: flex; align-items: center; gap: 12px;
  margin-top: 10px;
  padding: 8px 14px;
  background: rgba(120, 120, 130, 0.1);
  border: 1px dashed rgba(180, 180, 190, 0.3);
  border-radius: 6px;
  color: var(--text-body);
  font-size: 12px;
}
.intent-expired-bar > span:first-child { flex: 1; }

/* 快速标记上方统计条 */
.qm-stat-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px;
  margin-bottom: 12px;
  background: rgba(212, 175, 55, 0.06);
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 6px;
  font-size: 12px;
}
.qm-stat-bar.danger {
  background: rgba(245, 108, 108, 0.1);
  border-color: rgba(245, 108, 108, 0.45);
  animation: rb-pulse 1.6s ease-in-out infinite;
}
.qm-stat-bar .qms-label { color: var(--text-body); }
.qm-stat-bar .qms-num {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px; font-weight: 700;
  color: var(--gold-primary);
  padding: 0 2px;
}
.qm-stat-bar.danger .qms-num { color: #ff6b6b; }
.qm-stat-bar .qms-unit { color: var(--text-body); margin-right: 6px; }
.qm-stat-bar .qms-tip {
  margin-left: auto;
  color: #f0b432;
  font-weight: 500;
}
.qm-stat-bar.danger .qms-tip { color: #ff6b6b; }

/* 6 列横排按钮 */
.quick-mark-panel .qm-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
}
.quick-mark-panel .qm-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 12px 4px 10px;
  gap: 4px;
  min-height: 92px;
}
.quick-mark-panel .qm-btn .qm-emoji { font-size: 22px; line-height: 1; }
.quick-mark-panel .qm-btn .qm-text { font-size: 12px; font-weight: 600; }
.quick-mark-panel .qm-btn .qm-effect {
  font-size: 10px;
  color: var(--text-body);
  opacity: 0.7;
  font-weight: 400;
  line-height: 1.3;
}
.quick-mark-panel .qm-btn:hover .qm-effect { opacity: 1; }
.quick-mark-panel .qm-btn.picked .qm-effect { opacity: 1; color: var(--qm-accent); }

/* 快速标记历史时间线 */
.qm-timeline {
  margin-top: 14px;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--border-gold);
  border-radius: 6px;
  max-height: 180px;
  overflow-y: auto;
}
.qm-tl-title {
  font-size: 12px;
  color: var(--gold-primary);
  font-weight: 600;
  margin-bottom: 8px;
  letter-spacing: 0.04em;
}
.qm-tl-row {
  display: flex; align-items: center; gap: 10px;
  padding: 4px 0;
  font-size: 12px;
  position: relative;
}
.qm-tl-row + .qm-tl-row::before {
  content: '';
  position: absolute;
  left: 4px; top: -8px; width: 1px; height: 8px;
  background: rgba(255,255,255,0.1);
}
.qm-tl-dot {
  width: 9px; height: 9px; border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid var(--bg-darkest);
}
.qm-tl-dot.qm-tl-gray { background: #909399; box-shadow: 0 0 0 1px #909399; }
.qm-tl-dot.qm-tl-green { background: #3cb45a; box-shadow: 0 0 0 1px #3cb45a; }
.qm-tl-dot.qm-tl-orange { background: #f0b432; box-shadow: 0 0 0 1px #f0b432; }
.qm-tl-dot.qm-tl-red { background: #ff5a5a; box-shadow: 0 0 0 1px #ff5a5a; }
.qm-tl-dot.qm-tl-blue { background: #4a90e2; box-shadow: 0 0 0 1px #4a90e2; }
.qm-tl-dot.qm-tl-purple { background: #a78bfa; box-shadow: 0 0 0 1px #a78bfa; }
.qm-tl-time {
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-body);
  width: 110px;
  font-size: 11px;
}
.qm-tl-label.qm-tl-gray { color: #909399; }
.qm-tl-label.qm-tl-green { color: #3cb45a; }
.qm-tl-label.qm-tl-orange { color: #f0b432; }
.qm-tl-label.qm-tl-red { color: #ff5a5a; }
.qm-tl-label.qm-tl-blue { color: #4a90e2; }
.qm-tl-label.qm-tl-purple { color: #a78bfa; }
.qm-tl-label { font-weight: 600; }
</style>

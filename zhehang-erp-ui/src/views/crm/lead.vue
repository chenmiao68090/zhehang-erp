<template>
  <div class="lead-page">
    <header class="resource-header">
      <div class="resource-title">
        <h1>找客户</h1>
        <p>{{ isHistoryTab ? '查看权限范围内已经拨打并回收的历史客资，让客户重新轮转。' : '从公司公海和高价值客资中寻找客户' }}</p>
      </div>
      <el-segmented
        class="resource-tabs"
        :model-value="activeTab"
        :options="resourceTabOptions"
        @change="changeResourceTab"
      />
      <div class="resource-summary">
        <div v-if="convStats" class="conv-stats">
          线索 <b>{{ convStats.total }}</b> · 转化中 <b>{{ convStats.converting }}</b> · 已转化 <b>{{ convStats.converted }}</b> · 转化率 <b>{{ convStats.conversionRate }}%</b>
        </div>
      </div>
    </header>

    <el-alert
      v-if="poolConfigLoaded && activeTab === 'treasure' && !treasurePoolId"
      class="pool-config-alert"
      title="当前租户没有启用的高价值公海池"
      description="本页不会使用历史固定编号代替真实配置；请由管理员先维护公海池配置。"
      type="warning"
      :closable="false"
      show-icon
    />

    <!-- 筛选搜索区 -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-select v-model="queryParams.source" placeholder="来源" clearable style="width: 120px" @change="handleSearch">
          <el-option v-for="item in LEAD_SOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-if="!isHistoryTab" v-model="queryParams.status" placeholder="生命周期" clearable style="width: 120px" @change="handleSearch">
          <el-option label="新建" :value="1" />
          <el-option label="跟进中" :value="2" />
          <el-option label="已转化" :value="3" />
          <el-option label="无效" :value="4" />
        </el-select>
        <!-- ===== 投流线索 tab 追加的常用筛选(仅该 tab 显示,前端对当前页数据过滤)===== -->
        <template v-if="isOnlineTab">
          <el-select v-model="queryParams.level" placeholder="客资分级" clearable style="width: 110px" @change="handleSearch">
            <el-option label="A 级" value="A" />
            <el-option label="B 级" value="B" />
            <el-option label="C 级" value="C" />
            <el-option label="D 级" value="D" />
          </el-select>
          <el-select
            v-model="queryParams.ownerId"
            placeholder="负责人 / 归属"
            clearable
            filterable
            style="width: 140px"
          >
            <el-option v-for="u in ownerOptions" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
          <el-select v-model="queryParams.validity" placeholder="有效性" clearable style="width: 120px">
            <el-option label="有手机号" value="has" />
            <el-option label="无手机号" value="none" />
          </el-select>
          <el-date-picker
            v-model="queryParams.createRange"
            type="daterange"
            range-separator="至"
            start-placeholder="创建开始"
            end-placeholder="创建结束"
            value-format="YYYY-MM-DD"
            unlink-panels
            style="width: 240px"
          />
        </template>
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
        <template v-if="isOnlineTab">
          <el-button plain @click="handleRefresh">
            <el-icon><Refresh /></el-icon>刷新客资
          </el-button>
          <el-badge :value="moreFilterCount" :hidden="moreFilterCount === 0" type="primary">
            <el-button plain @click="openMoreFilter">
              <el-icon><Filter /></el-icon>更多筛选
            </el-button>
          </el-badge>
        </template>
      </div>
      <div class="filter-right">
        <el-dropdown trigger="click" @command="handleMore">
          <el-button plain>
            更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-if="canBulkImport" command="import"><el-icon><Upload /></el-icon>批量导入</el-dropdown-item>
              <el-dropdown-item v-if="canExportLeads" command="export"><el-icon><Download /></el-icon>导出线索</el-dropdown-item>
              <el-dropdown-item v-if="canManageRules" divided command="rules"><el-icon><Setting /></el-icon>设置公海规则</el-dropdown-item>
              <el-dropdown-item command="duplicate"><el-icon><Search /></el-icon>查重工具</el-dropdown-item>
              <el-dropdown-item v-if="canManageRules" divided command="recycle"><el-icon><RefreshLeft /></el-icon>立即执行回收(管理员)</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <!-- 批量操作栏 -->
    <div v-if="selectedRows.length > 0" class="batch-bar">
      <span class="batch-info">已选 <em>{{ selectedRows.length }}</em> 条</span>
      <div class="batch-actions">
        <template v-if="isHistoryTab">
          <el-button type="primary" size="small" @click="handleHistoryReactivate">
            领取到我的客户
          </el-button>
        </template>
        <template v-else-if="isPublicPoolTab">
          <el-button type="primary" size="small" @click="handleClaim">领取</el-button>
          <el-button v-if="canManageSales" size="small" @click="openDistribute">分配</el-button>
        </template>
        <el-dropdown v-if="!isHistoryTab && (!isPublicPoolTab || canManageSales)" trigger="click" @command="handleBatchLevel">
          <el-button size="small" type="warning" plain>批量打分级 ▾</el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="lv in BATCH_LEVEL_OPTIONS" :key="lv.value" :command="lv.value">{{ lv.label }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button v-if="!isHistoryTab && canManageSales" size="small" type="danger" plain :icon="Delete" @click="handleBatchDelete">批量删除</el-button>
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
        <el-table-column type="selection" width="50" :selectable="rowSelectable" />
        <el-table-column label="公司名称" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <a class="link-text" @click="isPublicPoolTab && !canManageSales ? openGs(row) : openEdit(row)">{{ leadCompanyName(row) }}</a>
            <el-button link type="primary" size="small" class="gs-link" @click="openGs(row)" title="查看工商信息">工商</el-button>
          </template>
        </el-table-column>
        <el-table-column label="联系人（法定代表人）" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ leadContactName(row) }}</template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="180">
          <template #default="{ row }">
            <span>{{ formatPhone(row.phone, false) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="registerDate" label="公司注册日期" width="130" />
        <el-table-column label="来源" width="100">
          <template #default="{ row }">
            <el-tag :type="sourceTagType(row.source)" effect="dark">{{ sourceLabel(row.source) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="生命周期" width="100">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="plain">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="销售阶段" width="128" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.followStatus || (row.status === 1 ? '线索接收' : row.status === 2 ? '需求沟通' : '-') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="分级" width="64" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.level" size="small" :type="levelTagType(row.level)" effect="dark">{{ row.level }}</el-tag>
            <el-tag v-else size="small" type="info" effect="plain">未分级</el-tag>
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
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-if="isHistoryTab" label="结束原因" min-width="190" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.invalidReason || row.lastFollowContent || '未记录原因' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" width="160" />
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button v-if="isPublicPoolTab" size="small" type="primary" link @click="handleClaimSingle(row)">领取</el-button>
            <el-button v-if="isHistoryTab" size="small" type="primary" link @click="handleHistoryReactivateSingle(row)">领取</el-button>
            <el-button v-if="!isPublicPoolTab || canManageSales" size="small" link @click="openEdit(row)">{{ isHistoryTab ? '查看 / 编辑' : '编辑' }}</el-button>
            <!-- 投流线索 tab:操作列 = 编辑 / 线索回收公海 / 删除(后两者走带 10s 倒计时的二次确认弹窗) -->
            <el-button v-else-if="isPublicPoolTab && canManageSales" size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
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
          @current-change="fetchLeads"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="formDialog.visible"
      :title="formDialog.isEdit ? '编辑线索' : '新建线索'"
      width="980px"
      top="5vh"
      class="lead-form-dialog"
      destroy-on-close
    >
      <el-scrollbar max-height="70vh">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="lead-form">
          <section class="lead-form-section">
            <div class="section-title">基础信息</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="公司名称" prop="company">
                  <el-input v-model="formData.company" placeholder="请输入企业全称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系人（法定代表人）" prop="legalPerson">
                  <el-input v-model="formData.legalPerson" placeholder="默认填写法定代表人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="有效手机号" prop="phone">
                  <el-input
                    v-model="formData.phone"
                    placeholder="手机号/可拨打电话"
                    @input="onPhoneInput"
                    @paste="onPhonePaste"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源" prop="source">
                  <el-select v-model="formData.source" placeholder="请选择来源" style="width: 100%">
                    <el-option v-for="item in LEAD_SOURCE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </section>

          <!-- ===== 投流客资信息(飞书 163 新建线索表单重构)===== -->
          <section class="lead-form-section">
            <div class="section-title">投流客资信息</div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="客户编号">
                  <el-input v-model="formData.leadNo" readonly placeholder="保存后自动生成" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="创建时间">
                  <el-date-picker v-model="formData.createTime" type="datetime" placeholder="默认取保存时间" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="月份（按创建时间）">
                  <el-input :model-value="derivedMonth" readonly placeholder="保存后自动派生" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="来源平台">
                  <el-select v-model="formData.sourcePlatform" placeholder="请选择来源平台" clearable filterable style="width: 100%">
                    <el-option v-for="p in SOURCE_PLATFORM_OPTIONS" :key="p" :label="p" :value="p" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="门店&品牌词">
                  <el-input v-model="formData.storeBrand" placeholder="门店 / 品牌词" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="咨询业务">
                  <el-select v-model="formData.consultBusiness" placeholder="请选择咨询业务" clearable filterable style="width: 100%" :loading="consultBusinessLoading" :disabled="!consultBusinessResolved">
                    <el-option v-for="b in consultBusinessSelectOptions" :key="b.value" :label="b.label" :value="b.value" :disabled="b.disabled" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客户昵称">
                  <el-input v-model="formData.nickname" placeholder="客户昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="客户微信">
                  <el-input v-model="formData.wechatNo" placeholder="微信号（可含 -）" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="虚拟电话">
                  <el-input v-model="formData.virtualPhone" placeholder="虚拟电话（可含 -）" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="是否有效">
                  <el-select v-model="formData.validity" placeholder="请选择" clearable style="width: 100%">
                    <el-option v-for="v in validityOptions" :key="v" :label="v" :value="v" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="跟进状态">
                  <el-select v-model="formData.followStatus" placeholder="请选择跟进状态" clearable style="width: 100%">
                    <el-option v-for="s in followStageOptions" :key="s" :label="s" :value="s" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成交金额（元）">
                  <el-input-number v-model="dealAmountNum" :min="0" :precision="2" :controls="false" placeholder="0.00" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="16">
                <el-form-item label="实际成交业务">
                  <el-select v-model="dealBusinessArr" multiple placeholder="可多选" filterable collapse-tags collapse-tags-tooltip style="width: 100%" :loading="consultBusinessLoading" :disabled="!consultBusinessResolved">
                    <el-option v-for="b in dealBusinessSelectOptions" :key="b.value" :label="b.label" :value="b.value" :disabled="b.disabled" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="附件（支持粘贴图片）">
                  <div class="lead-doc-uploader" @paste="onLeadDocPaste">
                    <el-upload :show-file-list="false" :http-request="(o: any) => uploadLeadDoc(o)" accept="image/*,.pdf" multiple>
                      <el-button :icon="Upload">上传附件</el-button>
                    </el-upload>
                    <div class="lead-doc-list">
                      <el-tag
                        v-for="d in leadDocList"
                        :key="d.key"
                        closable
                        type="info"
                        class="lead-doc-tag"
                        @close="removeLeadDoc(d.key)"
                      >{{ d.fileName }}</el-tag>
                      <span v-if="!leadDocList.length" class="field-tip">可点击上传或在此区域直接粘贴（Ctrl+V）图片</span>
                    </div>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </section>

          <section class="lead-form-section">
            <div class="section-title">工商信息</div>
            <el-row :gutter="16">
              <el-col :span="8">
                <el-form-item label="登记状态">
                  <el-input v-model="formData.registerStatus" placeholder="如：存续、在业、注销" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="企业规模">
                  <el-input v-model="formData.enterpriseScale" placeholder="如：1-49人" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="企业类型">
                  <el-input v-model="formData.enterpriseType" placeholder="如：有限责任公司" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="注册资本" prop="registeredCapital">
                  <el-input v-model="formData.registeredCapital" placeholder="金额或数值" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="实缴资本">
                  <el-input v-model="formData.paidCapital" placeholder="如：20万人民币" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="统一社会信用代码" prop="creditCode">
                  <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="成立日期" prop="establishedDate">
                  <el-date-picker v-model="formData.establishedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="核准日期">
                  <el-date-picker v-model="formData.approvedDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="参保人数">
                  <el-input v-model="formData.insuredCount" placeholder="人数" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-form-item label="所属年报">
                  <el-input v-model="formData.insuredYear" placeholder="年份" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="所属区域">
                  <el-input v-model="formData.region" placeholder="省 / 市 / 区县" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="来源说明/来源细分">
                  <el-input v-model="formData.sourceDetail" maxlength="50" placeholder="如：推广活动、渠道批次或来源补充" />
                </el-form-item>
              </el-col>
            </el-row>
          </section>

          <section class="lead-form-section">
            <div class="section-title">地址与经营范围</div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="注册地址" prop="registerAddress">
                  <el-input v-model="formData.registerAddress" type="textarea" :rows="2" placeholder="工商注册地址" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="最新地址">
                  <el-input v-model="formData.latestAddress" type="textarea" :rows="2" placeholder="实际经营地址/客户联系地址（区别于注册地址）" />
                  <div class="field-tip">填写客户当前实际经营地址或联系地址，与工商注册地址区分</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="邮箱">
                  <el-input v-model="formData.email" placeholder="企业邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="备注">
                  <el-input v-model="formData.remark" placeholder="补充说明" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="经营范围">
                  <el-input v-model="formData.businessScope" type="textarea" :rows="4" placeholder="企业经营范围" />
                </el-form-item>
              </el-col>
            </el-row>
          </section>
        </el-form>
      </el-scrollbar>
      <template #footer>
        <el-button @click="formDialog.visible = false">取消</el-button>
        <el-button type="primary" :disabled="!fieldOptionsReady" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>

    <!-- 分配弹窗 -->
    <el-dialog v-model="distributeDialog.visible" title="分配线索" width="420px">
      <el-form label-width="90px">
        <el-form-item label="负责人">
          <el-select v-model="distributeDialog.ownerId" placeholder="请选择负责人" style="width: 100%" filterable>
            <el-option v-for="u in ownerOptions" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="distributeDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitDistribute">确认分配</el-button>
      </template>
    </el-dialog>

    <!-- 线索回收公海 二次确认弹窗(带 10s 倒计时) -->
    <el-dialog v-model="recycleConfirm.visible" title="线索回收公海" width="440px" @closed="clearActionCountdown">
      <div class="danger-confirm">
        <p class="danger-confirm-text">
          确定要将该客资释放放到公海池吗?释放后您将失去该线索跟进权限,后续其他销售可重新领取跟进,是否确认?
        </p>
      </div>
      <template #footer>
        <el-button @click="recycleConfirm.visible = false">取消</el-button>
        <el-button
          type="warning"
          :disabled="actionCountdown > 0"
          :loading="recycleConfirm.submitting"
          @click="confirmRecycle"
        >{{ actionCountdown > 0 ? `确认移入公海(${actionCountdown}s)` : '确认移入公海' }}</el-button>
      </template>
    </el-dialog>

    <!-- 删除线索 二次确认弹窗(带 10s 倒计时) -->
    <el-dialog v-model="deleteConfirm.visible" title="删除线索风险提示" width="440px" @closed="clearActionCountdown">
      <div class="danger-confirm">
        <p class="danger-confirm-text">
          删除后该客户跟进记录、联系方式、业务信息将永久删除,数据无法恢复,是否确认删除?
        </p>
      </div>
      <template #footer>
        <el-button @click="deleteConfirm.visible = false">取消</el-button>
        <el-button
          type="danger"
          :disabled="actionCountdown > 0"
          :loading="deleteConfirm.submitting"
          @click="confirmDelete"
        >{{ actionCountdown > 0 ? `永久删除(${actionCountdown}s)` : '永久删除' }}</el-button>
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
          <el-table-column label="公司名称"><template #default="{ row }">{{ leadCompanyName(row) }}</template></el-table-column>
          <el-table-column label="联系人"><template #default="{ row }">{{ leadContactName(row) }}</template></el-table-column>
          <el-table-column prop="phone" label="手机号" />
          <el-table-column prop="ownerName" label="负责人" />
        </el-table>
      </div>
      <template #footer>
        <el-button @click="dupDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 工商信息(只读,点公司名旁"工商"打开)-->
    <el-drawer v-model="gsDrawer.visible" :title="`工商信息 · ${gsDrawer.row ? leadCompanyName(gsDrawer.row) : ''}`" size="600px" destroy-on-close>
      <el-descriptions v-if="gsDrawer.row" :column="1" border size="small">
        <el-descriptions-item label="公司名称">{{ leadCompanyName(gsDrawer.row) }}</el-descriptions-item>
        <el-descriptions-item label="法定代表人">{{ gsDrawer.row.legalPerson || leadContactName(gsDrawer.row) || '—' }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ gsDrawer.row.creditCode || '—' }}</el-descriptions-item>
        <el-descriptions-item label="登记状态">{{ gsDrawer.row.registerStatus || '—' }}</el-descriptions-item>
        <el-descriptions-item label="企业类型">{{ gsDrawer.row.enterpriseType || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ gsDrawer.row.registeredCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="实缴资本">{{ gsDrawer.row.paidCapital || '—' }}</el-descriptions-item>
        <el-descriptions-item label="成立日期">{{ gsDrawer.row.establishedDate || '—' }}</el-descriptions-item>
        <el-descriptions-item label="核准日期">{{ gsDrawer.row.approvedDate || '—' }}</el-descriptions-item>
        <el-descriptions-item label="参保人数">{{ gsDrawer.row.insuredCount || '—' }}<span v-if="gsDrawer.row.insuredYear">（{{ gsDrawer.row.insuredYear }}）</span></el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ gsDrawer.row.phone || '—' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ gsDrawer.row.email || '—' }}</el-descriptions-item>
        <el-descriptions-item label="注册地址">{{ gsDrawer.row.registerAddress || '—' }}</el-descriptions-item>
        <el-descriptions-item label="经营范围">{{ gsDrawer.row.businessScope || '—' }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top:14px;text-align:right">
        <el-button size="small" type="primary" plain @click="editFromGs">去编辑</el-button>
      </div>
    </el-drawer>

    <!-- 投流线索:更多筛选(按客资表更多列组合筛选,前端对当前页数据过滤)-->
    <el-drawer v-model="moreFilterVisible" title="更多筛选" size="420px" :append-to-body="true">
      <el-form label-position="top" class="more-filter-form">
        <el-form-item label="所属地区 / 注册地址(关键词)">
          <el-input v-model="queryParams.region" placeholder="如:杭州、余杭、浙江" clearable />
        </el-form-item>
        <el-form-item label="行业 / 经营范围(关键词)">
          <el-input v-model="queryParams.industry" placeholder="如:科技、贸易、餐饮" clearable />
        </el-form-item>
        <el-form-item label="企业规模(关键词)">
          <el-input v-model="queryParams.scale" placeholder="如:1-49人、50-99人" clearable />
        </el-form-item>
        <el-form-item label="注册资本区间(万)">
          <div style="display:flex;align-items:center;gap:8px;width:100%">
            <el-input-number v-model="queryParams.capitalMin" :min="0" :controls="false" placeholder="最小" style="width:130px" />
            <span class="muted">—</span>
            <el-input-number v-model="queryParams.capitalMax" :min="0" :controls="false" placeholder="最大" style="width:130px" />
          </div>
          <div class="field-tip">按注册资本文本解析出的数值(万)过滤,无法解析的记录会被排除</div>
        </el-form-item>
        <el-form-item label="成立日期区间">
          <div style="display:flex;align-items:center;gap:8px;width:100%">
            <el-date-picker v-model="queryParams.establishedStart" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" style="width:150px" />
            <span class="muted">—</span>
            <el-date-picker v-model="queryParams.establishedEnd" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" style="width:150px" />
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resetMoreFilter">清空更多</el-button>
        <el-button type="primary" @click="applyMoreFilter">应用筛选</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Plus, ArrowDown, Upload, Download, Setting, Phone, RefreshLeft, Refresh, Filter, Delete } from '@element-plus/icons-vue'
import { leadApi, poolConfigApi } from '@/api/crm'
import type { LeadSummaryBucket } from '@/api/crm'
import { LEAD_SOURCE_OPTIONS, LEAD_SOURCE_PLATFORM_OPTIONS, leadSourceLabel, leadSourceTagType } from '@/constants/lead-source'
import { escapeCsvCell } from '@/utils/lead-import'
import { fileInfoApi } from '@/api/file'
import { get } from '@/api/request'
import { useUserStore } from '@/stores/user'
import { useCrmPermission } from '@/composables/useCrmPermission'
import { useFieldOptions } from '@/composables/useFieldOptions'

type FollowMethod = 'phone' | 'wechat' | 'meeting' | 'email' | 'other'
type CustomerFeedback = 'positive' | 'neutral' | 'negative' | 'rejected' | 'lost_contact'
type CustomerLevel = 'A' | 'B' | 'C' | 'D' | 'E'

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
  legalPerson?: string
  phone: string
  companyPhone?: string
  registerDate: string
  establishedDate?: string
  approvedDate?: string
  email: string
  registerStatus?: string
  enterpriseScale?: string
  enterpriseType?: string
  registeredCapital?: string | number
  paidCapital?: string
  creditCode?: string
  insuredCount?: string
  insuredYear?: string
  registerAddress?: string
  latestAddress?: string
  businessScope?: string
  region?: string
  sourceDetail?: string
  source: number
  status: number
  pool: number
  ownerId: number | null
  ownerName: string
  lastFollowTime: string
  lastFollowContent?: string
  invalidReason?: string
  createTime: string
  remark: string
  followUpRecords?: FollowUpRecord[]
  // 新增：客户等级 + 保护期 + 回收历史
  level?: CustomerLevel
  protectionDeadline?: string
  recycledHistory?: RecycledHistory
  // 新增：「有意向」快速标记时间（用于24小时补跟规则）
  intentMarkAt?: string
  // ===== 投流客资扩展字段（飞书 163/164，全部可选，后端 V126 新增列）=====
  leadNo?: string            // 客户编号（后端自动生成，只读）
  sourcePlatform?: string    // 来源平台
  storeBrand?: string        // 门店&品牌词
  consultBusiness?: string   // 咨询业务
  nickname?: string          // 客户昵称
  wechatNo?: string          // 客户微信（对应后端 wechat_no）
  virtualPhone?: string      // 虚拟电话
  validity?: string          // 是否有效（有效/无效/待定）
  followStatus?: string      // 跟进状态新流程
  receiveTime?: string       // 线索接收时点
  dealAmount?: string | number // 成交金额
  dealBusiness?: string      // 实际成交业务（多选，逗号分隔）
  attachments?: string       // 附件 JSON
}

// 跟进频率只对已分级活跃客户生效；未分级客户等待首次有效沟通。
const followFrequencyStandard: Record<CustomerLevel, number> = {
  A: 2,
  B: 5,
  C: 15,
  D: 30,
  E: 30
}

// 当前登录用户(来自登录态,不再硬编码)。ownerId 对齐后端 sys_user.id
const userStore = useUserStore()
// 公海规则/立即回收等"改全公司规则"的入口,只对管理层开放,防普通员工(销售)修改
const SALES_MANAGER_ROLES = new Set(['admin', 'super_admin', 'sys_admin', 'boss', 'manager', 'dept_manager'])
const canManageSales = computed(() => (userStore.roles || []).some((role) => {
  const baseRole = String(role).split('__', 1)[0]
  return SALES_MANAGER_ROLES.has(String(role)) || SALES_MANAGER_ROLES.has(baseRole)
}))
const BULK_IMPORT_ROLES = new Set(['admin', 'boss', 'manager', 'dept_manager'])
const canBulkImport = computed(() => (userStore.roles || []).some((role) => {
  const baseRole = String(role).split('__', 1)[0]
  return BULK_IMPORT_ROLES.has(String(role)) || BULK_IMPORT_ROLES.has(baseRole)
}))
// 导出是公司级敏感动作，只认生产角色表中的真实 super_admin；老板及复制角色均不继承。
const canExportLeads = computed(() => (userStore.roles || []).includes('super_admin'))
const canManageRules = computed(() => ['admin', 'super_admin', 'sys_admin', 'boss'].some(r => (userStore.roles || []).includes(r)))
const currentUserId = computed<number | null>(() => (userStore.userInfo?.id as number) ?? null)
const currentUserName = computed<string>(() => userStore.userInfo?.nickname || userStore.userInfo?.username || '我')

// 可分配负责人列表(取系统用户:ownerId 即 sys_user.id),同时用于回显负责人姓名
const ownerOptions = ref<{ id: number; name: string }[]>([])
const ownerNameMap = computed(() => {
  const m = new Map<number, string>()
  ownerOptions.value.forEach(u => m.set(u.id, u.name))
  return m
})
const loadOwners = async () => {
  try {
    const resp: any = await get('/system/user/list', { pageNum: 1, pageSize: 200 }, { silentError: true })
    const page: any = (resp && resp.data) || resp
    const records = page && (page.records || page.list)
    if (Array.isArray(records)) {
      ownerOptions.value = records.map((u: any) => ({ id: u.id, name: u.nickname || u.username || ('用户' + u.id) }))
    }
  } catch {
    // 无 system:user:list 权限(如电销)时静默降级:下拉为空,姓名回退当前用户
    ownerOptions.value = []
  }
}
// 负责人 id → 姓名:公海(null)留空显示「公海」;自己优先用登录态昵称;其余查系统用户
const resolveOwnerName = (ownerId: number | null): string => {
  if (ownerId == null) return ''
  if (currentUserId.value != null && ownerId === currentUserId.value) return currentUserName.value
  return ownerNameMap.value.get(ownerId) || ''
}

const looksLikeCompany = (value?: string) => /公司|集团|企业|事务所|中心|工作室|商行|店|厂|合伙/.test(value || '')

const extractRemarkFields = (remark?: string) => {
  const fields: Record<string, string> = {}
  if (!remark) return fields
  remark.split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+?)\s*$/)
    if (match) fields[match[1].trim()] = match[2].trim()
  })
  return fields
}

const firstRemarkValue = (fields: Record<string, string>, labels: string[]) => {
  for (const label of labels) {
    if (fields[label]) return fields[label]
  }
  return ''
}

const leadCompanyName = (row: Partial<Lead>) => row.company || (looksLikeCompany(row.name) ? row.name : '') || row.name || ''
const leadContactName = (row: Partial<Lead>) => row.legalPerson || (!looksLikeCompany(row.name) ? row.name : '') || '—'
const leadAddressText = (row: Partial<Lead>) => row.registerAddress || row.latestAddress || ''

// 判断 remark 是否为导入时自动拼接的工商串(每一行都是"工商字段: 值"):是则视为冗余、不在备注里展示
const GS_REMARK_LABELS = ['登记状态', '法定代表人', '企业(机构)类型', '实缴资本', '核准日期', '统一社会信用代码', '企业联系电话', '参保人数', '参保人数所属年报', '注册地址', '最新地址', '邮箱', '经营范围']
const isAutoGsRemark = (remark?: string) => {
  if (!remark) return false
  const lines = String(remark).split('\n').map((s) => s.trim()).filter(Boolean)
  if (!lines.length) return false
  return lines.every((line) => GS_REMARK_LABELS.some((label) => line.startsWith(label + ':') || line.startsWith(label + '：')))
}

const normalizeLeadForForm = (row: Lead) => {
  const remarkFields = extractRemarkFields(row.remark)
  const backendName = row.name || ''
  const backendCompany = row.company || ''
  const companyName = looksLikeCompany(backendCompany) ? backendCompany : (looksLikeCompany(backendName) ? backendName : backendCompany || backendName)
  const legalPerson = row.legalPerson
    || firstRemarkValue(remarkFields, ['法定代表人', '法人', '法人代表'])
    || (!looksLikeCompany(backendName) ? backendName : '')
    || (!looksLikeCompany(backendCompany) ? backendCompany : '')
  return {
    ...row,
    company: companyName,
    name: legalPerson,
    legalPerson,
    companyPhone: row.companyPhone || firstRemarkValue(remarkFields, ['企业联系电话', '联系电话']),
    registerStatus: row.registerStatus || firstRemarkValue(remarkFields, ['登记状态', '经营状态']),
    enterpriseType: row.enterpriseType || firstRemarkValue(remarkFields, ['企业(机构)类型', '企业类型']),
    paidCapital: row.paidCapital || firstRemarkValue(remarkFields, ['实缴资本']),
    approvedDate: row.approvedDate || firstRemarkValue(remarkFields, ['核准日期']),
    creditCode: row.creditCode || firstRemarkValue(remarkFields, ['统一社会信用代码', '信用代码']),
    insuredCount: row.insuredCount || firstRemarkValue(remarkFields, ['参保人数']),
    insuredYear: row.insuredYear || firstRemarkValue(remarkFields, ['参保人数所属年报']),
    registerAddress: row.registerAddress || firstRemarkValue(remarkFields, ['注册地址']),
    latestAddress: row.latestAddress || firstRemarkValue(remarkFields, ['最新地址']),
    businessScope: row.businessScope || firstRemarkValue(remarkFields, ['经营范围']),
    establishedDate: row.establishedDate || row.registerDate || '',
    // 显示层清洗(修工商引用bug):邮箱只在真为邮箱(含@)时显示,否则置空(老数据常把地址塞进邮箱);
    // 备注若是导入自动拼接的工商串则隐藏(工商信息已在上方各结构化字段展示),保存时即把该条老数据洗净
    email: row.email && String(row.email).includes('@') ? row.email : '',
    remark: isAutoGsRemark(row.remark) ? '' : (row.remark || '')
  }
}

type LeadTab = 'pool' | 'online' | 'treasure' | 'history' | 'my' | 'todo' | 'warning'
function normalizeLeadTab(tab: unknown): LeadTab {
  // 新进客户入口已停用；旧 online 深链统一回到可领取客户。
  return tab === 'treasure' || tab === 'history' ? tab : 'pool'
}

const activeTab = ref<LeadTab>(normalizeLeadTab(useRoute().query.tab || useRoute().meta?.tab))
const resourceTabOptions = [
  { label: '可领取客户', value: 'pool' },
  { label: '高价值客户', value: 'treasure' },
  { label: '历史客资', value: 'history' }
]
/** todo/warning 两个 Tab 展示的也是"我名下"的线索,跟进/成交等动作可用 */
const isMineTab = computed(() => ['my', 'todo', 'warning'].includes(activeTab.value))
const isPublicPoolTab = computed(() => ['pool', 'treasure'].includes(activeTab.value))
const isHistoryTab = computed(() => activeTab.value === 'history')
// 投流线索 tab:仅在该 tab 展示追加的扩展筛选(客资分级/负责人/有效性/更多筛选/时间范围等)
const isOnlineTab = computed(() => activeTab.value === 'online')

// CRM 联系方式只读取后端会话返回的真实权限；浏览器本地不能切换或冒充角色。
const { formatPhone } = useCrmPermission()
const router = useRouter()
const route = useRoute()

function changeResourceTab(value: string | number | boolean) {
  const tab = normalizeLeadTab(value)
  router.replace({ path: '/customer/lead', query: tab === 'pool' ? {} : { tab } })
}

// 从侧栏切换「投流线索 / 藏金阁」(不同路径、同一组件复用)时,按路由 meta.tab 切到对应 tab 并刷新
watch(() => route.fullPath, () => {
  const t = normalizeLeadTab(route.query.tab || route.meta?.tab)
  if (t !== activeTab.value) {
    activeTab.value = t
    selectedRows.value = []
    queryParams.page = 1
    fetchLeads()
    // 164:切到投流 tab 才拉汇总并启动轮播;切走则停止轮播避免空转
    if (t === 'online') {
      loadLeadSummary()
      startSummaryRoll()
    } else {
      stopSummaryRoll()
    }
  }
})
const loading = ref(false)
const tableRef = ref()
const allLeads = ref<Lead[]>([])
const selectedRows = ref<Lead[]>([])

const getLeadLevel = (lead: Lead): CustomerLevel | null => lead.level || null

const daysBetween = (a: Date, b: Date) => Math.floor((a.getTime() - b.getTime()) / 86400000)

const computeFollowFrequencyState = (lead: Lead) => {
  const level = getLeadLevel(lead)
  if (!level) {
    return { level: null, limit: 0, overdueDays: 0, daysToDue: 0, status: 'unclassified' as const }
  }
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

// 全局 tick：用于实时刷新倒计时
const nowTick = ref(Date.now())
let nowTimer: number | null = null

const queryParams = reactive({
  page: 1,
  size: 20,
  source: null as number | null,
  status: null as number | null,
  keyword: typeof route.query.keyword === 'string' ? route.query.keyword : '',
  // ===== 投流线索 tab 追加的前端细化筛选(仅对当前页数据做客户端过滤,后端公海接口暂不支持这些参数)=====
  level: null as string | null,          // 客资分级 A/B/C/D
  ownerId: null as number | null,        // 负责人 / 归属(null=不限)
  validity: null as string | null,       // 有效性:has=有手机号 / none=无手机号
  region: '',                            // 地区关键词(所属区域模糊)
  industry: '',                          // 行业 / 经营范围关键词
  scale: '',                             // 企业规模关键词
  capitalMin: null as number | null,     // 注册资本下限(万)
  capitalMax: null as number | null,     // 注册资本上限(万)
  establishedStart: '',                  // 成立日期起
  establishedEnd: '',                    // 成立日期止
  createRange: null as [string, string] | null  // 创建时间范围 [start, end]
})

const treasurePoolId = ref<number | null>(null)
const poolConfigLoaded = ref(false)

const loadPoolIdByType = async (type: string): Promise<number | null> => {
  try {
    const resp: any = await poolConfigApi.getByType(type)
    const pool = (resp && resp.data) || resp
    const id = Number(pool?.id)
    return Number.isFinite(id) && id > 0 ? id : null
  } catch {
    return null
  }
}

const loadResourcePoolIds = async () => {
  treasurePoolId.value = await loadPoolIdByType('treasure')
  poolConfigLoaded.value = true
}

// ============ 数据读取(后端为唯一数据源,无 localStorage 兜底)============
const fetchLeads = async () => {
  loading.value = true
  try {
    let resp: any = null
    // 对齐后端入参名:pageNum/pageSize/name(keyword 走后端 name 模糊)
    const params = {
      pageNum: queryParams.page,
      pageSize: queryParams.size,
      name: queryParams.keyword || undefined,
      // 来源/状态/分级下沉后端,翻页也是全库筛(不再只筛当前页)
      source: queryParams.source ?? undefined,
      status: queryParams.status ?? undefined,
      customerLevel: queryParams.level || undefined
    }
    if (activeTab.value === 'pool') resp = await leadApi.poolList(params)
    else if (activeTab.value === 'treasure') {
      // 高价值池必须来自当前租户启用配置；缺失时显式空结果，不能用历史种子ID串池。
      resp = treasurePoolId.value
        ? await leadApi.poolList({ ...params, poolId: treasurePoolId.value })
        : { records: [], total: 0 }
    }
    else if (activeTab.value === 'history') resp = await leadApi.myList({ ...params, status: 4, scope: 'all' })
    else if (activeTab.value === 'todo') resp = await leadApi.todoFollow(params)
    else if (activeTab.value === 'warning') resp = await leadApi.recycleWarning(params)
    else resp = await leadApi.myList({ ...params, status: queryParams.status ?? undefined })
    // 拦截器返回完整 R 包体,分页数据在 resp.data.records(list 别名);兼容直接返回 IPage 的情况
    const page: any = (resp && resp.data) || resp
    const records = page && (page.records || page.list)
    if (Array.isArray(records)) {
      allLeads.value = records.map(mapBackendLead)
      totalCount.value = Number(page.total ?? records.length)
    } else {
      allLeads.value = []
      totalCount.value = 0
    }
  } catch {
    // 后端不可用时清空并报错,绝不静默回落本地缓存
    allLeads.value = []
    totalCount.value = 0
    ElMessage.error('线索数据加载失败,请检查后端服务是否正常')
  } finally {
    loading.value = false
  }
}

// 后端 CrmLead(ownership/customerLevel/snake 时间)→ 页面 Lead 模型
const mapBackendLead = (r: any): Lead => {
  const isPool = r.ownership !== 'private'
  const ownerId = r.ownerId ?? null
  const remarkFields = extractRemarkFields(r.remark || '')
  const backendName = r.name || ''
  const backendCompany = r.company || ''
  const companyName = looksLikeCompany(backendCompany)
    ? backendCompany
    : (looksLikeCompany(backendName) ? backendName : backendCompany || backendName)
  const legalPerson = r.legalPerson
    || firstRemarkValue(remarkFields, ['法定代表人', '法人', '法人代表'])
    || (!looksLikeCompany(backendName) ? backendName : '')
  return {
    id: r.id,
    name: legalPerson || '',
    company: companyName || '',
    legalPerson: legalPerson || '',
    phone: r.phone || '',
    companyPhone: r.companyPhone || firstRemarkValue(remarkFields, ['企业联系电话', '联系电话']),
    registerDate: r.establishedDate || (r.createTime || '').slice(0, 10),
    establishedDate: r.establishedDate || '',
    approvedDate: r.approvedDate || firstRemarkValue(remarkFields, ['核准日期']),
    email: r.email || '',
    registerStatus: r.registerStatus || firstRemarkValue(remarkFields, ['登记状态', '经营状态']),
    enterpriseScale: r.enterpriseScale || '',
    enterpriseType: r.enterpriseType || firstRemarkValue(remarkFields, ['企业(机构)类型', '企业类型']),
    registeredCapital: r.registeredCapital ?? '',
    paidCapital: r.paidCapital || firstRemarkValue(remarkFields, ['实缴资本']),
    creditCode: r.creditCode || firstRemarkValue(remarkFields, ['统一社会信用代码', '信用代码']),
    insuredCount: r.insuredCount || firstRemarkValue(remarkFields, ['参保人数']),
    insuredYear: r.insuredYear || firstRemarkValue(remarkFields, ['参保人数所属年报']),
    registerAddress: r.registerAddress || firstRemarkValue(remarkFields, ['注册地址']),
    latestAddress: r.latestAddress || firstRemarkValue(remarkFields, ['最新地址']),
    businessScope: r.businessScope || firstRemarkValue(remarkFields, ['经营范围']),
    region: r.region || '',
    sourceDetail: r.sourceDetail || '',
    source: r.source ?? 1,
    status: r.status ?? 1,
    pool: isPool ? 1 : 0,
    ownerId,
    ownerName: resolveOwnerName(ownerId),
    lastFollowTime: r.lastFollowTime || '',
    lastFollowContent: r.lastFollowContent || '',
    invalidReason: r.invalidReason || '',
    createTime: r.createTime || '',
    remark: r.remark || '',
    level: r.customerLevel || undefined,
    followUpRecords: Array.isArray(r.followUpRecords) ? r.followUpRecords : [],
    // 投流客资扩展字段透传(163/164)
    leadNo: r.leadNo || '',
    sourcePlatform: r.sourcePlatform || '',
    storeBrand: r.storeBrand || '',
    consultBusiness: r.consultBusiness || '',
    nickname: r.nickname || '',
    wechatNo: r.wechatNo || '',
    virtualPhone: r.virtualPhone || '',
    validity: r.validity || '',
    followStatus: r.followStatus || '',
    receiveTime: r.receiveTime || '',
    dealAmount: r.dealAmount ?? '',
    dealBusiness: r.dealBusiness || '',
    attachments: r.attachments || ''
  }
}

// ============ 计算属性 ============
// 后端 /pool /my 已按归属返回,无需再做 pool/my 二次过滤;keyword 已传后端 name。
// 来源/状态后端公海等接口暂不支持,这里仅对当前页做客户端细化。
// 注册资本文本 → 数值(万):兼容 "100万人民币""￥50万""1,000" 等写法,取第一段数字
const parseCapitalWan = (raw: string | number | undefined): number | null => {
  if (raw == null || raw === '') return null
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null
  const m = String(raw).replace(/,/g, '').match(/-?\d+(\.\d+)?/)
  if (!m) return null
  const n = Number(m[0])
  return Number.isFinite(n) ? n : null
}
// 创建/成立日期取「日期部分」用于范围比较(YYYY-MM-DD)
const dateOnly = (v: string | undefined): string => (v ? String(v).slice(0, 10) : '')

const filteredList = computed(() => {
  let list = allLeads.value
  // 来源/状态/分级已下沉后端(fetchLeads 传参,翻页也是全库筛,不再只筛当前页)
  // ===== 以下均为投流线索 tab 追加的前端过滤,仅在该 tab 生效,不影响其它 tab =====
  if (isOnlineTab.value) {
    if (queryParams.ownerId != null) list = list.filter(l => l.ownerId === queryParams.ownerId)
    if (queryParams.validity === 'has') list = list.filter(l => !!(l.phone && String(l.phone).trim()))
    if (queryParams.validity === 'none') list = list.filter(l => !(l.phone && String(l.phone).trim()))
    if (queryParams.region.trim()) {
      const kw = queryParams.region.trim()
      list = list.filter(l => (l.region || l.registerAddress || '').includes(kw))
    }
    if (queryParams.industry.trim()) {
      const kw = queryParams.industry.trim()
      list = list.filter(l => (l.businessScope || l.enterpriseType || '').includes(kw))
    }
    if (queryParams.scale.trim()) {
      const kw = queryParams.scale.trim()
      list = list.filter(l => (l.enterpriseScale || '').includes(kw))
    }
    if (queryParams.capitalMin != null || queryParams.capitalMax != null) {
      list = list.filter(l => {
        const cap = parseCapitalWan(l.registeredCapital)
        if (cap == null) return false
        if (queryParams.capitalMin != null && cap < queryParams.capitalMin) return false
        if (queryParams.capitalMax != null && cap > queryParams.capitalMax) return false
        return true
      })
    }
    if (queryParams.establishedStart) list = list.filter(l => dateOnly(l.establishedDate) && dateOnly(l.establishedDate) >= queryParams.establishedStart)
    if (queryParams.establishedEnd) list = list.filter(l => dateOnly(l.establishedDate) && dateOnly(l.establishedDate) <= queryParams.establishedEnd)
    if (queryParams.createRange && queryParams.createRange[0] && queryParams.createRange[1]) {
      const [start, end] = queryParams.createRange
      list = list.filter(l => {
        const d = dateOnly(l.createTime)
        return d && d >= start && d <= end
      })
    }
  }
  return list
})

// 真实分页总数(后端 page.total),非 filteredList.length 的假分页
const totalCount = ref(0)

// ============ 标签辅助 ============
const sourceLabel = (val: number) => {
  return leadSourceLabel(val, '-')
}
const sourceTagType = (val: number) => {
  return leadSourceTagType(val)
}
const statusLabel = (val: number) => {
  const map: Record<number, string> = { 1: '新建', 2: '跟进中', 3: '已转化', 4: '无效' }
  return map[val] || '-'
}
const statusTagType = (val: number) => {
  const map: Record<number, string> = { 1: 'info', 2: 'primary', 3: 'success', 4: 'danger' }
  return map[val] || ''
}
const levelTagType = (lv: string) => (({ A: 'danger', B: 'warning', C: 'primary', D: 'info', E: 'info' } as Record<string, string>)[lv] || 'info')

// ============ 交互 ============
const handleSearch = () => { queryParams.page = 1; fetchLeads() }
const handleSizeChange = () => { queryParams.page = 1; fetchLeads() }
const handleReset = () => {
  queryParams.source = null
  queryParams.status = null
  queryParams.keyword = ''
  // 一并清空投流线索 tab 的扩展筛选
  queryParams.level = null
  queryParams.ownerId = null
  queryParams.validity = null
  queryParams.region = ''
  queryParams.industry = ''
  queryParams.scale = ''
  queryParams.capitalMin = null
  queryParams.capitalMax = null
  queryParams.establishedStart = ''
  queryParams.establishedEnd = ''
  queryParams.createRange = null
  queryParams.page = 1
  fetchLeads()
}
// 「刷新客资」:重新拉取当前 tab 列表(保留已选筛选条件,仅回到第一页)
const handleRefresh = () => { queryParams.page = 1; fetchLeads() }
// 「更多筛选」抽屉开关
const moreFilterVisible = ref(false)
const openMoreFilter = () => { moreFilterVisible.value = true }
// 抽屉内「应用」:客户端过滤即时生效,关闭抽屉即可;这里同时收回第一页保证观感一致
const applyMoreFilter = () => { queryParams.page = 1; moreFilterVisible.value = false }
// 抽屉内「清空更多」:只清扩展列的筛选,保留顶部来源/状态/负责人等
const resetMoreFilter = () => {
  queryParams.region = ''
  queryParams.industry = ''
  queryParams.scale = ''
  queryParams.capitalMin = null
  queryParams.capitalMax = null
  queryParams.establishedStart = ''
  queryParams.establishedEnd = ''
}
// 当前投流线索 tab 生效的扩展筛选数量(用于「更多筛选」按钮角标)
const moreFilterCount = computed(() => {
  let n = 0
  if (queryParams.region.trim()) n++
  if (queryParams.industry.trim()) n++
  if (queryParams.scale.trim()) n++
  if (queryParams.capitalMin != null || queryParams.capitalMax != null) n++
  if (queryParams.establishedStart || queryParams.establishedEnd) n++
  return n
})
const handleSelectionChange = (rows: Lead[]) => { selectedRows.value = rows }
const clearSelection = () => { tableRef.value?.clearSelection() }
const rowSelectable = () => true

// ============ 新建 / 编辑 ============
const formRef = ref<FormInstance>()
// ===== 投流客资(飞书 163)选项集(全新枚举,独立于老 source/status)=====
const SOURCE_PLATFORM_OPTIONS = LEAD_SOURCE_PLATFORM_OPTIONS
// 咨询业务 / 实际成交业务 共用选项集
const FALLBACK_BUSINESS_OPTIONS = [
  '工商注册', '工商变更', '代账', '代理记账', '税务合规',
  '商标业务', '专利业务', '项目申报', '刻章业务', '未知业务'
]
// 跟进状态新流程(进度条式,顺序即阶段)
const FALLBACK_FOLLOW_STAGE_OPTIONS = ['线索接收', '需求沟通', '需求答疑', '签单收款', '移交结束交付']
// 是否有效
const FALLBACK_VALIDITY_OPTIONS = ['有效', '无效', '待定']

// V235 仅将低风险咨询业务接入受控目录。有效性和跟进阶段属于历史统计/流程状态机，继续使用稳定常量。
const {
  loading: consultBusinessLoading,
  resolved: consultBusinessResolved,
  defaultValue: consultBusinessDefault,
  withHistoricalValues: withConsultBusinessHistory,
  isSelectable: isConsultBusinessSelectable
} = useFieldOptions('crm_consult_business', FALLBACK_BUSINESS_OPTIONS)
const validityOptions = FALLBACK_VALIDITY_OPTIONS
const followStageOptions = FALLBACK_FOLLOW_STAGE_OPTIONS

const formDialog = reactive({ visible: false, isEdit: false })
const formData = reactive<Partial<Lead>>({
  id: 0,
  name: '',
  company: '',
  legalPerson: '',
  phone: '',
  registerDate: '',
  establishedDate: '',
  approvedDate: '',
  email: '',
  registerStatus: '',
  enterpriseScale: '',
  enterpriseType: '',
  registeredCapital: '',
  paidCapital: '',
  creditCode: '',
  insuredCount: '',
  insuredYear: '',
  registerAddress: '',
  latestAddress: '',
  businessScope: '',
  region: '',
  sourceDetail: '',
  source: 1,
  status: 1,
  remark: '',
  // 投流客资扩展(163)
  leadNo: '',
  sourcePlatform: '',
  storeBrand: '',
  consultBusiness: '',
  nickname: '',
  wechatNo: '',
  virtualPhone: '',
  validity: '',
  followStatus: '',
  dealAmount: '',
  createTime: ''
})
// 实际成交业务(多选)独立管理为数组,提交时 join(',')
const dealBusinessArr = ref<string[]>([])
const fieldOptionsReady = computed(() => consultBusinessResolved.value)
const consultBusinessSelectOptions = computed(() => withConsultBusinessHistory(formData.consultBusiness || ''))
const dealBusinessSelectOptions = computed(() => withConsultBusinessHistory(dealBusinessArr.value))
// 附件:{ key: { fileId, fileName } };提交时序列化为 attachments JSON 数组
const leadDocs = ref<Record<string, { fileId: string; fileName: string }>>({})
const leadDocList = computed(() => Object.entries(leadDocs.value).map(([key, v]) => ({ key, ...(v as any) })))
let leadDocSeq = 0
const uploadLeadDoc = async (options: any) => {
  try {
    const res: any = await fileInfoApi.upload(options.file)
    const data = res?.data ?? res
    leadDocSeq++
    leadDocs.value = {
      ...leadDocs.value,
      [`doc-${Date.now()}-${leadDocSeq}`]: {
        fileId: data?.id != null ? String(data.id) : '',
        fileName: data?.originalName || data?.fileName || options.file.name
      }
    }
    ElMessage.success('上传成功')
  } catch { ElMessage.error('上传失败') }
}
const removeLeadDoc = (key: string) => { const d = { ...leadDocs.value }; delete d[key]; leadDocs.value = d }
// 附件支持粘贴图片(复用刻章/gs 的 docs 模式)
const onLeadDocPaste = (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return
  for (const it of Array.from(items)) {
    if (it.type.startsWith('image/')) {
      const file = it.getAsFile()
      if (file) uploadLeadDoc({ file })
    }
  }
}
// 客户编号派生月份(只读):按创建时间 yyyy-MM
const derivedMonth = computed(() => {
  const t = (formData.createTime as string) || ''
  return t ? String(t).slice(0, 7) : ''
})
// 成交金额:el-input-number 需 number|undefined,与 formData.dealAmount(string|number)间做代理
const dealAmountNum = computed<number | undefined>({
  get: () => {
    const v = formData.dealAmount
    if (v === '' || v == null) return undefined
    const n = Number(v)
    return Number.isNaN(n) ? undefined : n
  },
  set: (val) => { formData.dealAmount = (val == null ? '' : val) }
})
const formRules: FormRules = {
  company: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  source: [{ required: true, message: '请选择来源', trigger: 'change' }],
  legalPerson: [{ required: true, message: '请输入联系人（法定代表人）', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入有效手机号', trigger: 'blur' }],
  registeredCapital: [{ required: true, message: '请输入注册资本', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码', trigger: 'blur' }],
  establishedDate: [{ required: true, message: '请选择成立日期', trigger: 'change' }],
  registerAddress: [{ required: true, message: '请输入注册地址', trigger: 'blur' }]
}

const resetFormData = () => {
  Object.assign(formData, {
    id: 0,
    name: '',
    company: '',
    legalPerson: '',
    phone: '',
    registerDate: '',
    establishedDate: '',
    approvedDate: '',
    email: '',
    registerStatus: '',
    enterpriseScale: '',
    enterpriseType: '',
    registeredCapital: '',
    paidCapital: '',
    creditCode: '',
    insuredCount: '',
    insuredYear: '',
    registerAddress: '',
    latestAddress: '',
    businessScope: '',
    region: '',
    sourceDetail: '',
    source: 1,
    status: 1,
    remark: '',
    // 投流客资扩展(163)——重置为空
    leadNo: '',
    sourcePlatform: '',
    storeBrand: '',
    consultBusiness: '',
    nickname: '',
    wechatNo: '',
    virtualPhone: '',
    validity: '',
    followStatus: '',
    dealAmount: '',
    createTime: ''
  })
  dealBusinessArr.value = []
  leadDocs.value = {}
}

const applyFieldDefaultsToNewForm = () => {
  if (!fieldOptionsReady.value || formDialog.isEdit) return
  if (!formData.consultBusiness && consultBusinessDefault.value) formData.consultBusiness = consultBusinessDefault.value
}

watch(
  [fieldOptionsReady, consultBusinessDefault],
  () => { if (formDialog.visible) applyFieldDefaultsToNewForm() }
)
watch(() => formDialog.visible, (visible) => {
  if (visible) applyFieldDefaultsToNewForm()
})

const validateFieldOptionSelections = () => {
  if (!fieldOptionsReady.value) {
    ElMessage.warning('字段选项正在加载，请稍后保存')
    return false
  }
  // 编辑时允许未改动的停用历史值继续保存；新建只能提交当前启用项。
  if (formDialog.isEdit) return true
  const invalid = (formData.consultBusiness && !isConsultBusinessSelectable(formData.consultBusiness))
    || dealBusinessArr.value.some((value) => !isConsultBusinessSelectable(value))
  if (invalid) ElMessage.warning('所选字段值已停用，请重新选择')
  return !invalid
}
// 163:客户电话粘贴/输入自动去空格(去除空格、制表符、换行等所有空白)
const onPhoneInput = (val: string) => {
  const cleaned = (val || '').replace(/\s/g, '')
  if (cleaned !== val) formData.phone = cleaned
}
const onPhonePaste = (e: ClipboardEvent) => {
  const text = e.clipboardData?.getData('text')
  if (text && /\s/.test(text)) {
    e.preventDefault()
    formData.phone = ((formData.phone || '') + text).replace(/\s/g, '')
  }
}

// 工商信息只读抽屉(点公司名旁"工商"打开;数据已在 row 上,mapBackendLead 解析好)
const gsDrawer = reactive<{ visible: boolean; row: Lead | null }>({ visible: false, row: null })
const openGs = (row: Lead) => { gsDrawer.row = row; gsDrawer.visible = true }
const editFromGs = () => { const r = gsDrawer.row; gsDrawer.visible = false; if (r) openEdit(r) }
const openEdit = (row: Lead) => {
  formDialog.isEdit = true
  resetFormData()
  Object.assign(formData, normalizeLeadForForm(row))
  // 投流:实际成交业务(逗号串)→数组;附件 JSON→ leadDocs
  dealBusinessArr.value = (row.dealBusiness || '').split(',').map(s => s.trim()).filter(Boolean)
  leadDocs.value = parseLeadAttachments(row.attachments)
  formDialog.visible = true
}
// 附件 JSON 解析:后端存 [{fileId,fileName}] 数组,回显为 { key: {fileId,fileName} } 便于删除
const parseLeadAttachments = (raw?: string): Record<string, { fileId: string; fileName: string }> => {
  const out: Record<string, { fileId: string; fileName: string }> = {}
  if (!raw) return out
  try {
    const arr = JSON.parse(raw)
    if (Array.isArray(arr)) {
      arr.forEach((it: any, i: number) => {
        if (it && it.fileId != null) {
          out[`doc-old-${i}`] = { fileId: String(it.fileId), fileName: it.fileName || `附件${i + 1}` }
        }
      })
    }
  } catch { /* 非法 JSON 忽略,当作无附件 */ }
  return out
}

const buildLeadPayload = () => {
  const companyName = (formData.company || '').trim()
  const legalPerson = (formData.legalPerson || formData.name || '').trim()
  return {
    id: formData.id,
    name: legalPerson || companyName,
    company: companyName,
    legalPerson,
    phone: formData.phone || '',
    email: formData.email || '',
    registerStatus: formData.registerStatus || '',
    source: formData.source || 1,
    status: formData.status || 1,
    remark: formData.remark || '',
    region: formData.region || '',
    enterpriseScale: formData.enterpriseScale || '',
    enterpriseType: formData.enterpriseType || '',
    registeredCapital: normalizeMoneyText(String(formData.registeredCapital || '')) || null,
    paidCapital: formData.paidCapital || '',
    establishedDate: formData.establishedDate || formData.registerDate || null,
    approvedDate: formData.approvedDate || null,
    creditCode: formData.creditCode || '',
    insuredCount: formData.insuredCount || '',
    insuredYear: formData.insuredYear || '',
    registerAddress: formData.registerAddress || '',
    latestAddress: formData.latestAddress || '',
    businessScope: formData.businessScope || '',
    sourceDetail: formData.sourceDetail || '',
    // ===== 投流客资扩展(163)。leadNo 不回传(新建后端生成;编辑保留库值,前端只读)=====
    sourcePlatform: formData.sourcePlatform || '',
    storeBrand: formData.storeBrand || '',
    consultBusiness: formData.consultBusiness || '',
    nickname: formData.nickname || '',
    wechatNo: formData.wechatNo || '',
    virtualPhone: formData.virtualPhone || '',
    validity: formData.validity || '',
    followStatus: formData.followStatus || '',
    dealAmount: formData.dealAmount === '' || formData.dealAmount == null ? null : Number(formData.dealAmount),
    dealBusiness: dealBusinessArr.value.join(','),
    // 附件序列化为 [{fileId,fileName}] 数组(与后端 attachments 列一致)
    attachments: JSON.stringify(Object.values(leadDocs.value))
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  if (!validateFieldOptionSelections()) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const payload: any = buildLeadPayload()
    if (formDialog.isEdit) {
      // 编辑:更新成功后刷新列表(非 silent 接口,失败由全局拦截器弹错误)
      try {
        await leadApi.update(payload)
      } catch { return }
      ElMessage.success('已更新')
    } else {
      // 新建:带 ownerId=当前登录人 → 后端归 private(我的客资);失败由拦截器弹错误
      payload.ownerId = currentUserId.value
      payload.status = 1
      try {
        await leadApi.create(payload)
      } catch { return }
      ElMessage.success('已创建')
    }
    formDialog.visible = false
    await fetchLeads()
  })
}

// ============ 删除 ============
const handleDelete = async (row: Lead) => {
  await ElMessageBox.confirm(`确定删除线索「${leadCompanyName(row)}」？`, '提示', { type: 'warning' })
  try {
    await leadApi.remove(row.id)
  } catch { return }
  ElMessage.success('已删除')
  await fetchLeads()
}
const handleBatchDelete = async () => {
  const count = selectedRows.value.length
  if (!count) return
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${count} 条线索？删除后不可恢复。`, '批量删除', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
  } catch {
    return // 用户点了取消
  }
  const ids = selectedRows.value.map(r => r.id)
  // 后端无批量删除接口,逐条调用 DELETE /crm/lead/{id};用 allSettled 统计成功/失败,部分失败也刷新
  const results = await Promise.allSettled(ids.map(id => leadApi.remove(id)))
  const ok = results.filter(r => r.status === 'fulfilled').length
  const fail = count - ok
  selectedRows.value = []
  await fetchLeads()
  if (fail === 0) ElMessage.success(`已删除 ${ok} 条`)
  else if (ok === 0) ElMessage.error('删除失败，请重试')
  else ElMessage.warning(`已删除 ${ok} 条，${fail} 条失败`)
}

// 批量设置意向等级；D/E由后端同步转入历史客资。
const BATCH_LEVEL_OPTIONS = [
  { value: 'A', label: 'A 高意向' },
  { value: 'B', label: 'B 意向' },
  { value: 'C', label: 'C 潜在意向' },
  { value: 'D', label: 'D 无意向' },
  { value: 'E', label: 'E 无效客户' }
]
const handleBatchLevel = async (level: string) => {
  if (!selectedRows.value.length) return
  const count = selectedRows.value.length
  const label = BATCH_LEVEL_OPTIONS.find((o) => o.value === level)?.label || level
  try {
    const historyTip = ['D', 'E'].includes(level) ? '，并转入历史客资' : ''
    await ElMessageBox.confirm(`确定把选中的 ${count} 条线索都设为「${label}」${historyTip}?`, '批量设置意向', { type: 'warning' })
  } catch {
    return
  }
  const ids = selectedRows.value.map((r) => r.id)
  try {
    await Promise.all(ids.map((id) => leadApi.update({ id, customerLevel: level })))
  } catch {
    ElMessage.error('部分打级失败，请重试')
    return
  }
  selectedRows.value = []
  ElMessage.success(`已给 ${count} 条线索打「${label}」`)
  await fetchLeads()
}


// ============ 投流线索操作列:线索回收公海 / 删除(带 10s 倒计时二次确认)============
// 通用 10 秒倒计时:弹窗打开时启动,倒计时>0 期间确认按钮 disabled 变灰;关弹窗清除定时器(防泄漏)
const ACTION_COUNTDOWN_SECONDS = 10
const actionCountdown = ref(0)
let actionCountdownTimer: number | null = null
const startActionCountdown = () => {
  clearActionCountdown()
  actionCountdown.value = ACTION_COUNTDOWN_SECONDS
  actionCountdownTimer = window.setInterval(() => {
    actionCountdown.value -= 1
    if (actionCountdown.value <= 0) clearActionCountdown()
  }, 1000)
}
function clearActionCountdown() {
  if (actionCountdownTimer) {
    clearInterval(actionCountdownTimer)
    actionCountdownTimer = null
  }
  actionCountdown.value = 0
}

const recycleConfirm = reactive<{ visible: boolean; submitting: boolean; row: Lead | null }>({ visible: false, submitting: false, row: null })
const openRecycleConfirm = (row: Lead) => {
  recycleConfirm.row = row
  recycleConfirm.submitting = false
  recycleConfirm.visible = true
  startActionCountdown()
}
const confirmRecycle = async () => {
  if (actionCountdown.value > 0 || !recycleConfirm.row) return
  recycleConfirm.submitting = true
  // 复用现有"回收公海"接口(returnToPool 为 silentError,失败需自行提示)
  try {
    await leadApi.returnToPool([recycleConfirm.row.id], '')
  } catch {
    recycleConfirm.submitting = false
    return ElMessage.error('移入公海失败')
  }
  recycleConfirm.submitting = false
  recycleConfirm.visible = false
  ElMessage.success('已移入公海')
  await fetchLeads()
}

const deleteConfirm = reactive<{ visible: boolean; submitting: boolean; row: Lead | null }>({ visible: false, submitting: false, row: null })
const openDeleteConfirm = (row: Lead) => {
  deleteConfirm.row = row
  deleteConfirm.submitting = false
  deleteConfirm.visible = true
  startActionCountdown()
}
const confirmDelete = async () => {
  if (actionCountdown.value > 0 || !deleteConfirm.row) return
  deleteConfirm.submitting = true
  // 复用现有删除接口 DELETE /crm/lead/{id}(非 silent,失败由全局拦截器提示)
  try {
    await leadApi.remove(deleteConfirm.row.id)
  } catch {
    deleteConfirm.submitting = false
    return
  }
  deleteConfirm.submitting = false
  deleteConfirm.visible = false
  ElMessage.success('已删除')
  await fetchLeads()
}

// ============ 领取 / 退回 / 分配 ============
const handleClaimSingle = async (row: Lead) => {
  try {
    await leadApi.claim([row.id])
  } catch { return }
  ElMessage.success(`已领取「${leadCompanyName(row)}」`)
  await fetchLeads()
}
const handleClaim = async () => {
  const ids = selectedRows.value.map(r => r.id)
  if (!ids.length) return
  try {
    await leadApi.claim(ids)
  } catch { return }
  selectedRows.value = []
  ElMessage.success(`已领取 ${ids.length} 条`)
  await fetchLeads()
}

const reactivateHistoryLeads = async (rows: Lead[]) => {
  const ids = rows.map((row) => row.id)
  if (!ids.length) return
  const subject = ids.length === 1 ? `「${leadCompanyName(rows[0])}」` : `选中的 ${ids.length} 条历史客资`
  try {
    await ElMessageBox.confirm(
      `确定将${subject}领取到“我的客户”吗？原负责人和全部跟进记录会完整保留在审计中。`,
      '领取历史客资',
      {
        type: 'warning',
        confirmButtonText: '确认领取',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }
  try {
    await leadApi.reactivateHistory(ids)
  } catch {
    return
  }
  clearSelection()
  selectedRows.value = []
  ElMessage.success(`已领取 ${ids.length} 条，可在“我的客户”中继续跟进`)
  await fetchLeads()
}

const handleHistoryReactivateSingle = (row: Lead) => reactivateHistoryLeads([row])
const handleHistoryReactivate = () => reactivateHistoryLeads(selectedRows.value)

const distributeDialog = reactive({ visible: false, ownerId: null as number | null })
const openDistribute = () => {
  distributeDialog.ownerId = null
  distributeDialog.visible = true
}
const submitDistribute = async () => {
  if (!distributeDialog.ownerId) return ElMessage.warning('请选择负责人')
  const ids = selectedRows.value.map(r => r.id)
  if (!ids.length) return
  // distribute 为 silentError 接口,失败需自行提示
  try {
    await leadApi.distribute({ ids, ownerId: distributeDialog.ownerId })
  } catch {
    return ElMessage.error('分配失败')
  }
  selectedRows.value = []
  distributeDialog.visible = false
  ElMessage.success('已分配')
  await fetchLeads()
}


// ============ 更多菜单 ============
const handleMore = (cmd: string) => {
  if (cmd === 'import') {
    router.push({ path: '/customer/lead/import' })
  }
  else if (cmd === 'export') doExport()
  else if (cmd === 'rules') router.push('/sys-flow/pool-admin')
  else if (cmd === 'recycle') handleRunRecycle()
  else if (cmd === 'duplicate') {
    dupDialog.field = 'phone'
    dupDialog.value = ''
    dupDialog.searched = false
    dupDialog.results = []
    dupDialog.visible = true
  }
}

// 表单注册资本仍沿用原有数值提交口径；批量导入页保留原单位字符串，由后端统一换算。
const normalizeMoneyText = (value: string) => {
  if (!value) return ''
  const match = value.replace(/,/g, '').match(/[0-9]+(?:\.[0-9]+)?/)
  return match ? match[0] : ''
}

// ============ 导出 ============
const doExport = () => {
  if (!canExportLeads.value) return ElMessage.error('仅超级管理员可导出线索')
  const rows = filteredList.value
  if (!rows.length) return ElMessage.warning('当前没有可导出数据')
  const header = ['公司名称', '联系人(法定代表人)', '有效手机号', '企业联系电话', '成立日期', '登记状态', '统一社会信用代码', '注册地址', '来源', '跟进状态', '负责人', '最近跟进', '创建时间']
  const lines = [header.join(',')]
  rows.forEach(r => {
    lines.push([
      leadCompanyName(r),
      leadContactName(r),
      r.phone,
      r.companyPhone || '',
      r.registerDate || '',
      r.registerStatus || '',
      r.creditCode || '',
      leadAddressText(r),
      sourceLabel(r.source),
      statusLabel(r.status),
      r.ownerName || '公海', r.lastFollowTime || '', r.createTime
    ].map(escapeCsvCell).join(','))
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
  // 后端 /crm/lead/duplicate 返回 R<List<CrmLead>>:数据是 resp.data 数组(非分页 records)
  try {
    const resp: any = await leadApi.checkDuplicate({ [dupDialog.field]: v })
    const data = (resp && resp.data) || resp
    dupDialog.results = Array.isArray(data) ? data.map(mapBackendLead) : []
  } catch {
    dupDialog.results = []
  }
  dupDialog.searched = true
}

// 表格行上的频率状态（供告警使用）
const rowFreqState = (row: Lead) => computeFollowFrequencyState(row)

// ============ 营销闭环:转化率/立即回收 ============
const convStats = ref<{ total: number; newLeads: number; converting: number; converted: number; invalid: number; conversionRate: number } | null>(null)

const loadClosedLoopStats = async () => {
  try {
    convStats.value = await leadApi.conversionStats() as any
  } catch { /* 统计失败不阻塞页面 */ }
}

// ===== 164:投流客资汇总(本月/本年)+ 上下滚动轮播 =====
const leadSummary = ref<{ month: LeadSummaryBucket; year: LeadSummaryBucket } | null>(null)
const summaryIndex = ref(0) // 0=本月 1=本年
let summaryRollTimer: number | null = null
const loadLeadSummary = async () => {
  try {
    const res = await leadApi.summary() as any
    if (res && res.month && res.year) leadSummary.value = res
  } catch { /* 汇总失败不阻塞页面 */ }
}
// 播报文案:本月/本年一句话,含有效客资/非刻章有效/刻章有效/非刻章转化/转化率/成交额
const fmtAmount = (n: number) => {
  const v = Number(n || 0)
  return v % 1 === 0 ? v.toLocaleString('zh-CN') : v.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const summaryText = computed(() => {
  if (!leadSummary.value) return ''
  const scope = summaryIndex.value === 0 ? '本月' : '本年'
  const b = summaryIndex.value === 0 ? leadSummary.value.month : leadSummary.value.year
  return `${scope}有效客资 ${b.validLeads} 条、非刻章有效 ${b.nonSealValidLeads} 条、刻章有效 ${b.sealValidLeads} 条、`
    + `非刻章转化 ${b.nonSealConverted} 条、非刻章转化率 ${b.nonSealConvRate}%、非刻章成交 ${fmtAmount(b.nonSealDealAmount)} 元`
})
const startSummaryRoll = () => {
  stopSummaryRoll()
  summaryRollTimer = window.setInterval(() => {
    summaryIndex.value = summaryIndex.value === 0 ? 1 : 0
  }, 4000)
}
const stopSummaryRoll = () => {
  if (summaryRollTimer) { clearInterval(summaryRollTimer); summaryRollTimer = null }
}

const handleRunRecycle = async () => {
  await ElMessageBox.confirm(
    '立即扫描"超15天未跟进且已过保护期"的客资并退回公海(定时任务每日02:00也会自动执行)。确认现在执行？',
    '立即执行回收', { type: 'warning' }
  )
  try {
    const n: any = await leadApi.runRecycle()
    ElMessage.success(`本次回收 ${n ?? 0} 条线索回公海`)
    fetchLeads()
    loadClosedLoopStats()
  } catch { /* 非管理员等错误由拦截器提示 */ }
}

onMounted(async () => {
  // 先取可分配负责人列表(用于姓名回显),再拉线索,保证 mapBackendLead 能解析 ownerName
  await loadOwners()
  await loadResourcePoolIds()
  fetchLeads()
  loadClosedLoopStats()
  // 新建入口已迁移到「我的客户」页;找客户不再提供新建(旧 create=1 深链已停用)。
  // 164:投流 tab 才需要顶部汇总播报;拉数据并启动上下轮播(非该 tab 时模板不渲染,轮播空转无副作用)
  if (isOnlineTab.value) {
    loadLeadSummary()
    startSummaryRoll()
  }
  // 启动全局 tick（1 秒，仅用于倒计时实时刷新）
  nowTimer = window.setInterval(() => {
    nowTick.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (nowTimer) {
    clearInterval(nowTimer)
    nowTimer = null
  }
  stopSummaryRoll()
  clearActionCountdown()
})

</script>

<style scoped>
.lead-page {
  padding: 16px 20px;
  background: var(--bg-card);
  min-height: calc(100vh - 60px);
  color: var(--text-primary);
}

.lead-form {
  padding-right: 8px;
}

.lead-form-section {
  padding: 14px 16px 4px;
  margin-bottom: 14px;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  background: var(--bg-elevated);
}

.lead-form-section .section-title {
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.lead-form .field-tip,
.more-filter-form .field-tip {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary, #909399);
}
.more-filter-form :deep(.el-form-item) { margin-bottom: 18px; }

.lead-form-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.lead-form-dialog :deep(.el-form-item) {
  margin-bottom: 14px;
}

.lead-form-dialog :deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--text-body);
}

.resource-header {
  background: var(--bg-elevated);
  border: 1px solid var(--border-color, #dcdfe6);
  border-radius: 8px 8px 0 0;
  padding: 16px;
  display: grid;
  grid-template-columns: minmax(180px, 0.7fr) auto minmax(260px, 1.2fr);
  align-items: center;
  gap: 20px;
}
.resource-title h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  letter-spacing: 0;
  color: var(--text-primary);
}
.resource-title p {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-secondary, #6b7280);
}
.resource-tabs {
  --el-segmented-item-selected-bg-color: var(--el-color-primary);
  --el-segmented-item-selected-color: #fff;
}
.resource-tabs :deep(.el-segmented__item) {
  min-width: 108px;
  min-height: 40px;
  padding: 0 14px;
  font-size: 15px;
  font-weight: 600;
}
.resource-summary {
  min-width: 0;
  display: flex;
  justify-content: flex-end;
}
/* 营销闭环转化率摘要 */
.conv-stats {
  font-size: 13px;
  color: var(--text-body);
  white-space: nowrap;
}
.conv-stats b { color: var(--gold-primary); }

/* 164:投流客资汇总滚动播报 */
.lead-summary-broadcast {
  flex: 1;
  min-width: 0;
  height: 28px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 1180px) {
  .resource-header {
    grid-template-columns: minmax(180px, 1fr) auto;
  }
  .resource-summary {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .lead-page { padding: 12px; }
  .resource-header { grid-template-columns: 1fr; gap: 12px; }
  .resource-tabs { width: 100%; }
  .resource-tabs :deep(.el-segmented__item) { min-width: 0; flex: 1; }
  .resource-summary { grid-column: auto; }
}
.lead-summary-broadcast .summary-line {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lead-summary-broadcast .summary-scope {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--bg-base, #1a1a1a);
  background: var(--gold-primary);
  border-radius: 4px;
  padding: 1px 8px;
}
.lead-summary-broadcast .summary-text {
  font-size: 13px;
  color: var(--text-body);
  overflow: hidden;
  text-overflow: ellipsis;
}
/* 上下滚动过渡:进入从下方,离开向上 */
.summary-roll-enter-active,
.summary-roll-leave-active { transition: transform .45s ease, opacity .45s ease; }
.summary-roll-enter-from { transform: translateY(100%); opacity: 0; }
.summary-roll-leave-to { transform: translateY(-100%); opacity: 0; }

/* 163:投流附件上传区 */
.lead-doc-uploader { width: 100%; }
.lead-doc-uploader .lead-doc-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.lead-doc-uploader .lead-doc-tag { max-width: 100%; }

/* 危险操作二次确认弹窗文案 */
.danger-confirm {
  padding: 4px 2px 8px;
}
.danger-confirm-text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-body);
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
  background: linear-gradient(90deg, rgba(51, 112, 255, 0.08), rgba(51, 112, 255, 0));
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
.gs-link { margin-left: 6px; font-size: 12px; padding: 0 2px; }
.muted { color: var(--text-body); font-size: 12px; }

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
  padding: 8px 4px;
}

.dup-result { margin-top: 12px; }
/* 表格行“最近跟进”告警 */
.follow-cell { display: flex; flex-direction: column; gap: 2px; }
.follow-cell .follow-time { color: var(--text-primary); font-size: 13px; }
.follow-cell .tip-overdue { color: #ff6b6b; font-size: 12px; font-weight: 600; }
.follow-cell .tip-soon { color: #f0b432; font-size: 12px; font-weight: 600; }
</style>

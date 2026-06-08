<template>
  <div class="private-domain-page">
    <header class="pd-head">
      <div>
        <div class="eyebrow">LEADS · PRIVATE DOMAIN</div>
        <h1>私域运营</h1>
        <p>承接企业微信、微信社群、朋友圈、公众号、视频号和老客转介绍,统一沉淀到线索、客户、任务和成交链路。</p>
      </div>
      <div class="head-actions">
        <el-button @click="goOnlineLeads">查看网销线索</el-button>
        <el-button @click="goDistribution">分配规则</el-button>
        <el-button @click="activeTab = 'import'">批量导入</el-button>
        <el-button @click="downloadImportTemplate">下载导入模板</el-button>
        <el-button type="primary" @click="syncHint">同步私域数据</el-button>
      </div>
    </header>

    <section class="landing-panel">
      <div class="landing-copy">
        <div class="eyebrow">OPERATING LOOP</div>
        <h2>先把私域运营落到每天能执行的闭环</h2>
        <p>
          当前系统不能只做“客户列表”，必须把私域客户变成可分配、可跟进、可报价、可提单、可交付、可复盘的经营链路。
          我会按这个闭环持续问你问题，再把页面和规则改到贴合你们真实流程。
        </p>
        <div class="flow-steps">
          <span v-for="step in workflowSteps" :key="step">{{ step }}</span>
        </div>
      </div>
      <div class="landing-profile">
        <strong>{{ opsProfile.companyName || '浙杭集团' }} · 私域落地口径</strong>
        <p>{{ opsProfile.handoffRule }}</p>
        <div class="profile-tags">
          <span v-for="item in opsProfile.keyServices.slice(0, 6)" :key="item">{{ item }}</span>
        </div>
        <el-button type="primary" plain @click="activeTab = 'diagnosis'">补充运营答案</el-button>
      </div>
    </section>

    <section class="metric-grid">
      <div class="metric-card">
        <span>私域客户</span>
        <b>{{ summary.contactCount }}</b>
        <em>企微/微信/社群触点</em>
      </div>
      <div class="metric-card">
        <span>高意向</span>
        <b>{{ summary.intentCount }}</b>
        <em>有意向/已报价/已成交</em>
      </div>
      <div class="metric-card">
        <span>已入库线索</span>
        <b>{{ summary.convertedCount }}</b>
        <em>已挂接网销线索链路</em>
      </div>
      <div class="metric-card">
        <span>预估商机</span>
        <b>¥{{ formatMoney(summary.estimatedAmount) }}</b>
        <em>按意向客户预估金额</em>
      </div>
    </section>

    <section class="today-review-panel" :class="todayReviewLevel">
      <div class="today-review-head">
        <div>
          <span>TODAY REVIEW</span>
          <strong>{{ todayReviewTitle }}</strong>
          <p>{{ todayReviewDesc }}</p>
        </div>
        <el-tag :type="todayReviewLevelTag(todayReviewLevel)" effect="plain">{{ todayReviewStatusText }}</el-tag>
      </div>
      <div class="today-review-grid">
        <button
          v-for="item in todayReviewCards"
          :key="item.key"
          type="button"
          class="today-review-card"
          :class="item.level"
          @click.stop="goTodayReviewAction(item.action)"
        >
          <div class="today-review-card-head">
            <strong>{{ item.title }}</strong>
            <el-tag :type="todayReviewLevelTag(item.level)" size="small" effect="plain">{{ item.statusText }}</el-tag>
          </div>
          <b>{{ item.value }}</b>
          <p>{{ item.desc }}</p>
          <span>{{ item.actionText }}</span>
        </button>
      </div>
    </section>

    <section class="starter-strip">
      <div class="starter-head">
        <div>
          <span>今日起步清单</span>
          <strong>{{ starterProgress.done }}/{{ starterProgress.total }} 已完成</strong>
        </div>
        <el-progress
          :percentage="starterProgress.percent"
          :stroke-width="8"
          :show-text="false"
          :status="starterProgress.percent === 100 ? 'success' : undefined"
        />
      </div>
      <div class="starter-steps">
        <button
          v-for="item in starterSteps"
          :key="item.id"
          type="button"
          class="starter-step"
          :class="{ done: item.done }"
          @click="goStarterAction(item.action)"
        >
          <span>{{ item.done ? '完成' : '待做' }}</span>
          <strong>{{ item.title }}</strong>
          <em>{{ item.metric }}</em>
        </button>
      </div>
    </section>

    <section class="daily-action-grid">
      <div v-for="item in dailyActions" :key="item.id" class="daily-card" :class="item.status">
        <div class="daily-head">
          <strong>{{ item.roleName }}</strong>
          <el-tag :type="dailyStatusTag(item.status)" size="small">{{ dailyStatusText(item.status) }}</el-tag>
        </div>
        <p>{{ item.action }}</p>
        <div class="daily-meta">
          <span>{{ item.source }}</span>
          <b>{{ item.target }}</b>
        </div>
        <el-button link type="primary" @click="goAction(item.path)">去处理</el-button>
      </div>
    </section>

    <section class="connect-strip">
      <div
        v-for="item in integrations"
        :key="item.key"
        class="connect-card"
        :class="item.status"
      >
        <div class="connect-head">
          <strong>{{ item.name }}</strong>
          <el-tag :type="integrationTag(item.status)" size="small">{{ integrationText(item.status) }}</el-tag>
        </div>
        <p>{{ item.description }}</p>
        <div class="connect-foot">
          <span>{{ item.scope }}</span>
          <em>{{ item.lastSyncAt }}</em>
        </div>
      </div>
    </section>

    <section class="main-panel">
      <el-tabs v-model="activeTab" class="private-domain-tabs">
        <el-tab-pane label="落地问诊" name="diagnosis">
          <div class="diagnosis-layout">
            <div class="profile-form-card">
              <div class="panel-title compact">
                <div>
                  <h2>公司运营画像</h2>
                  <p>这些答案会影响后续页面字段、分配规则、看板指标和任务流。</p>
                </div>
                <el-tag type="primary" effect="plain">持续补充</el-tag>
              </div>
              <el-form label-position="top" class="ops-form">
                <el-row :gutter="12">
                  <el-col :xs="24" :md="12">
                    <el-form-item label="公司/主体名称">
                      <el-input v-model="opsProfile.companyName" placeholder="例如：浙杭集团" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="12">
                    <el-form-item label="主要城市">
                      <el-input v-model="opsProfile.city" placeholder="例如：杭州、义乌、宁波" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="私域触点">
                  <el-checkbox-group v-model="opsProfile.privatePlatforms">
                      <el-checkbox-button v-for="item in sourceOptions" :key="item" :label="item" :value="item" />
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="关键业务">
                  <el-checkbox-group v-model="opsProfile.keyServices">
                    <el-checkbox-button v-for="item in serviceOptions" :key="item" :label="item" :value="item" />
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="参与岗位">
                  <el-checkbox-group v-model="opsProfile.departments">
                    <el-checkbox-button v-for="item in departmentOptions" :key="item" :label="item" :value="item" />
                  </el-checkbox-group>
                </el-form-item>

                <el-form-item label="入库必填字段">
                  <el-checkbox-group v-model="opsProfile.requiredFields">
                    <el-checkbox-button v-for="item in requiredFieldOptions" :key="item" :label="item" :value="item" />
                  </el-checkbox-group>
                </el-form-item>

                <el-row :gutter="12">
                  <el-col :xs="24" :md="8">
                    <el-form-item label="每日线索目标">
                      <el-input-number v-model="opsProfile.dailyLeadTarget" :min="0" :step="10" controls-position="right" style="width: 100%" />
                    </el-form-item>
                  </el-col>
                  <el-col :xs="24" :md="16">
                    <el-form-item label="交接/保护期规则">
                      <el-input v-model="opsProfile.handoffRule" type="textarea" :rows="2" />
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-form-item label="现在最影响落地的问题">
                  <el-input v-model="opsProfile.painPoints" type="textarea" :rows="3" />
                </el-form-item>
              </el-form>
              <div class="profile-actions">
                <span>最近更新：{{ opsProfile.updatedAt || '-' }}</span>
                <el-button type="primary" :loading="profileSaving" @click="saveOpsProfile">保存运营画像</el-button>
              </div>
            </div>

            <div class="question-stack">
              <div class="question-card">
                <div class="panel-title compact">
                  <div>
                    <h2>我接下来需要问你的问题</h2>
                    <p>你回答得越真实，我改出来的软件就越贴近你们公司。</p>
                  </div>
                </div>
                <div class="question-list">
                  <label v-for="question in diagnosisQuestions" :key="question.key">
                    <span>{{ question.title }}</span>
                    <em>{{ question.hint }}</em>
                    <el-radio-group v-model="opsProfile.answers[question.key]">
                      <el-radio-button v-for="option in question.options" :key="option" :label="option" :value="option" />
                    </el-radio-group>
                  </label>
                </div>
              </div>

              <div class="check-card">
                <div class="panel-title compact">
                  <div>
                    <h2>落地检查</h2>
                    <p>不是功能多少，而是每条链路有没有人负责、有没有下一步。</p>
                  </div>
                </div>
                <div class="check-list">
                  <div v-for="item in opsChecks" :key="item.id" class="check-item">
                    <div>
                      <strong>{{ item.name }}</strong>
                      <span>{{ item.current }}</span>
                    </div>
                    <el-tag :type="opsCheckTag(item.status)" size="small">{{ opsCheckText(item.status) }}</el-tag>
                    <p>{{ item.next }}</p>
                    <el-button link type="primary" @click="goAction(item.path)">打开相关页面</el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="归属规则" name="ownership">
          <div class="rule-panel">
            <div class="panel-title compact">
              <div>
                <h2>私域归属规则</h2>
                <p>把来源部门、首添人、保护期、回收天数和撞单优先级放在同一张表里维护，避免销售、公海、渠道之间口径不一致。</p>
              </div>
              <el-tag type="primary" effect="plain">A · 归属闭环</el-tag>
            </div>
            <div class="rule-toolbar">
              <span>已启用 {{ ownershipRules.filter(item => item.enabled).length }} 条规则</span>
              <span>同行/挂靠地址客户默认独立保护，撞单先冻结再仲裁。</span>
            </div>
            <el-table :data="ownershipRules" border stripe class="ownership-table">
              <el-table-column prop="source" label="来源触点" width="110" fixed="left" />
              <el-table-column label="启用" width="80" align="center">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="归属口径" min-width="160">
                <template #default="{ row }">
                  <el-select v-model="row.ownerPolicy" size="small">
                    <el-option v-for="item in ownerPolicyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="来源部门" min-width="140">
                <template #default="{ row }">
                  <el-input v-model="row.ownerTeam" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="默认负责人" min-width="130">
                <template #default="{ row }">
                  <el-input v-model="row.defaultOwner" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="保护期" width="110" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.protectDays" :min="0" :max="120" size="small" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="首触时限" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.firstTouchMinutes" :min="0" :max="480" size="small" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="回收天数" width="120" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.recycleDays" :min="0" :max="60" size="small" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="撞单策略" min-width="150">
                <template #default="{ row }">
                  <el-select v-model="row.collisionPolicy" size="small">
                    <el-option v-for="item in collisionPolicyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column label="优先级" width="110" align="center">
                <template #default="{ row }">
                  <el-input-number v-model="row.priority" :min="0" :max="100" size="small" controls-position="right" />
                </template>
              </el-table-column>
              <el-table-column label="备注" min-width="260">
                <template #default="{ row }">
                  <el-input v-model="row.remark" size="small" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button link type="primary" :loading="isRuleSaving(row.id)" @click="saveOwnershipRule(row)">保存规则</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="批量导入" name="import">
          <div class="import-layout">
            <div class="import-main">
              <div class="panel-title compact">
                <div>
                  <h2>Excel 导入模板</h2>
                  <p>先用模板统一字段，再批量导入私域客户；系统会按公司名称 + 手机号自动去重。</p>
                </div>
                <el-tag type="success" effect="plain">Excel 可打开 CSV</el-tag>
              </div>

              <div class="import-actions">
                <input ref="fileInputRef" class="hidden-input" type="file" accept=".csv,.txt" @change="handleImportFile" />
                <el-button type="primary" @click="downloadImportTemplate">下载模板</el-button>
                <el-button @click="triggerFileSelect">选择 CSV 文件</el-button>
                <el-button :disabled="!importPreview.length" @click="clearImportPreview">清空预览</el-button>
                <el-button
                  type="success"
                  :loading="importing"
                  :disabled="previewStats.ready === 0"
                  @click="importValidRows"
                >
                  导入有效行
                </el-button>
              </div>

              <div class="import-hint">
                <b>落地用法</b>
                <span>下载模板 -> 用 Excel 填客户 -> 另存为 CSV -> 上传；也可以直接从 Excel 复制表格内容粘贴到下方。</span>
              </div>

              <el-table :data="importColumns" border stripe class="template-table">
                <el-table-column prop="label" label="字段" width="150" />
                <el-table-column label="必填" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">{{ row.required ? '必填' : '选填' }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="example" label="示例" min-width="180" />
                <el-table-column prop="tip" label="填写说明" min-width="260" />
              </el-table>
            </div>

            <div class="paste-card">
              <div class="panel-title compact">
                <div>
                  <h2>粘贴导入</h2>
                  <p>从 Excel 选中表头和数据复制,粘到这里即可预览。</p>
                </div>
              </div>
              <el-input
                v-model="pasteText"
                type="textarea"
                :rows="10"
                placeholder="粘贴 Excel 表格内容。第一行必须是模板表头。"
              />
              <div class="paste-actions">
                <span>{{ importFileName || '未选择文件' }}</span>
                <el-button type="primary" plain @click="previewPasteText">解析粘贴内容</el-button>
              </div>
            </div>
          </div>

          <div class="preview-panel">
            <div class="preview-summary">
              <div><span>预览行数</span><b>{{ previewStats.total }}</b></div>
              <div><span>可导入</span><b>{{ previewStats.ready }}</b></div>
              <div><span>重复</span><b>{{ previewStats.duplicate }}</b></div>
              <div><span>错误</span><b>{{ previewStats.error }}</b></div>
              <div><span>工商命中</span><b>{{ previewStats.verified }}</b></div>
            </div>
            <el-table :data="importPreview" border stripe height="360" empty-text="请先下载模板并导入 CSV 或粘贴 Excel 内容">
              <el-table-column prop="rowNo" label="行号" width="80" />
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="importStatusTag(row.status)" size="small">{{ importStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="客户" min-width="240">
                <template #default="{ row }">
                  <strong>{{ row.data.companyName }}</strong>
                  <div class="sub-line">{{ row.data.name }} · {{ row.data.phone }}</div>
                </template>
              </el-table-column>
              <el-table-column label="工商/撞单" min-width="220">
                <template #default="{ row }">
                  <div class="verify-cell">
                    <el-tag :type="verificationTag(row.verification)" size="small">{{ verificationText(row.verification) }}</el-tag>
                    <el-tag :type="duplicateRiskTag(row.verification?.duplicateRisk)" size="small" effect="plain">
                      {{ duplicateRiskText(row.verification?.duplicateRisk) }}
                    </el-tag>
                    <span>{{ row.verification?.creditCode || row.verification?.linkageText || '待补全工商信息' }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="data.source" label="来源" width="120" />
              <el-table-column prop="data.ownerName" label="负责人" width="110" />
              <el-table-column prop="data.serviceLine" label="业务线" width="120" />
              <el-table-column prop="data.estimatedAmount" label="预估金额" width="110" />
              <el-table-column prop="data.demand" label="客户需求" min-width="240" show-overflow-tooltip />
              <el-table-column label="问题" min-width="260">
                <template #default="{ row }">
                  <span v-if="row.status === 'ready'" :class="row.verification?.duplicateRisk === 'possible' ? 'warn-text' : 'ok-text'">
                    {{ importProblemText(row) }}
                  </span>
                  <span v-else-if="row.status === 'duplicate'" class="warn-text">{{ row.duplicateText }}</span>
                  <span v-else class="error-text">{{ row.errors.join('；') }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="客户雷达" name="contacts">
          <div class="toolbar">
            <el-input v-model="query.keyword" placeholder="搜索公司/联系人/需求/标签" clearable :prefix-icon="Search" @keyup.enter="loadContacts" />
            <el-select v-model="query.source" placeholder="来源" clearable>
              <el-option v-for="source in sourceOptions" :key="source" :label="source" :value="source" />
            </el-select>
            <el-select v-model="query.stage" placeholder="阶段" clearable>
              <el-option v-for="item in stageOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
            <el-button :icon="Refresh" @click="resetQuery">重置</el-button>
            <el-button type="primary" :icon="Search" @click="loadContacts">查询</el-button>
          </div>
          <div class="contact-quick-bar">
            <el-radio-group v-model="contactQuickFilter">
              <el-radio-button v-for="item in contactQuickOptions" :key="item.value" :label="item.value" :value="item.value">
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
            <span>{{ contactQuickHint }}</span>
            <el-button
              size="small"
              type="primary"
              plain
              :loading="batchVerifyingContacts"
              :disabled="batchVerifyingContacts || batchVerifiableContacts.length === 0"
              @click="batchVerifyContacts"
            >
              批量核验 {{ batchVerifiableContacts.length }}
            </el-button>
            <el-button
              size="small"
              type="warning"
              plain
              :loading="batchCreatingFollowTasks"
              :disabled="batchCreatingFollowTasks || batchFollowTaskContacts.length === 0"
              @click="batchCreateFollowTasks"
            >
              批量建任务 {{ batchFollowTaskContacts.length }}
            </el-button>
          </div>

          <div v-if="mustHandleQueue.length" class="must-handle-panel">
            <div class="must-handle-head">
              <div>
                <strong>今日必须处理</strong>
                <span>{{ mustHandleStats.total }} 个待处理 · {{ mustHandleStats.danger }} 个阻断 · {{ mustHandleStats.warning }} 个预警</span>
              </div>
              <el-tag type="primary" effect="plain">按风险和成交链路排序</el-tag>
            </div>
            <div class="must-handle-list">
              <div v-for="item in mustHandleQueue" :key="item.key" class="must-handle-item" :class="item.level">
                <button type="button" class="must-handle-main" @click.stop="openContact(item.contact)">
                  <span>{{ item.reason }}</span>
                  <strong>{{ item.contact.companyName }}</strong>
                  <em>{{ item.title }} · {{ item.ownerName }}</em>
                  <small>{{ item.desc }}</small>
                </button>
                <el-button
                  size="small"
                  :type="item.level === 'danger' ? 'danger' : item.level === 'warning' ? 'warning' : 'primary'"
                  plain
                  @click.stop="handleContactActionItem(item.contact, item.actionKey)"
                >
                  {{ item.actionLabel }}
                </el-button>
              </div>
            </div>
          </div>

          <el-table v-loading="loading" :data="filteredContactRows" border stripe height="560">
            <template #empty>
              <div class="delivery-empty-state contact-empty-state">
                <div class="delivery-empty-copy">
                  <strong>{{ contactEmptyTitle }}</strong>
                  <p>{{ contactEmptyDesc }}</p>
                </div>
                <div class="delivery-empty-metrics">
                  <span><b>{{ summary.contactCount }}</b>私域客户</span>
                  <span><b>{{ summary.intentCount }}</b>高意向</span>
                  <span><b>{{ summary.convertedCount }}</b>已入库线索</span>
                </div>
                <div class="delivery-empty-actions">
                  <el-button v-if="hasContactFilter" type="primary" @click="resetQuery">重置筛选</el-button>
                  <el-button :type="hasContactFilter ? 'default' : 'primary'" @click="goImportPrivateContacts">批量导入</el-button>
                  <el-button @click="syncHint">同步私域数据</el-button>
                </div>
              </div>
            </template>
            <el-table-column label="客户" min-width="260" fixed="left">
              <template #default="{ row }">
                <button type="button" class="link-btn" @click.stop="openContact(row)">{{ row.companyName }}</button>
                <div class="sub-line">{{ row.name }} · {{ row.phone }}</div>
              </template>
            </el-table-column>
            <el-table-column label="工商/撞单" min-width="170">
              <template #default="{ row }">
                <div class="verify-cell compact">
                  <el-tag :type="verificationTag(row.verification)" size="small">{{ verificationText(row.verification) }}</el-tag>
                  <el-tag :type="duplicateRiskTag(row.verification?.duplicateRisk)" size="small" effect="plain">
                    {{ duplicateRiskText(row.verification?.duplicateRisk) }}
                  </el-tag>
                  <span>{{ row.creditCode || row.verification?.businessStatus || '待核验' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="私域触点" width="150">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.source }}</el-tag>
                <div class="sub-line compact">{{ row.communityName }}</div>
              </template>
            </el-table-column>
            <el-table-column label="标签" min-width="190">
              <template #default="{ row }">
                <div class="tag-list">
                  <el-tag v-for="tag in row.tags.slice(0, 3)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="阶段" width="110">
              <template #default="{ row }">
                <el-tag :type="stageTag(row.stage)" size="small">{{ stageText(row.stage) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="评分" width="90" align="center">
              <template #default="{ row }">
                <strong :class="row.score >= 85 ? 'score hot' : 'score'">{{ row.score }}</strong>
              </template>
            </el-table-column>
            <el-table-column label="需求" min-width="260" prop="demand" show-overflow-tooltip />
            <el-table-column label="最近互动" width="150" prop="lastTouchAt" />
            <el-table-column label="下一动作" min-width="230" prop="nextAction" show-overflow-tooltip />
            <el-table-column label="操作" width="340" fixed="right">
              <template #default="{ row }">
                <div class="contact-table-actions">
                  <el-button link type="primary" @click.stop="openContact(row)">详情</el-button>
                  <el-button
                    v-for="item in contactRowActions(row)"
                    :key="`${row.id}-${item.key}-${item.label}`"
                    link
                    :type="contactActionButtonType(row, item)"
                    :loading="contactActionButtonLoading(row, item.key)"
                    :disabled="contactActionButtonDisabled(row, item.key)"
                    @click.stop="handleContactActionItem(row, item.key)"
                  >
                    {{ item.label }}
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="跟进记录" name="follow">
          <div class="follow-panel">
            <div class="panel-title compact">
              <div>
                <h2>私域跟进记录</h2>
                <p>每次电话、企微、社群触达都要记录结果、报价金额和下一步动作，后续才能复盘员工产能和成交漏斗。</p>
              </div>
              <el-button type="primary" @click="openFollowDialog()">记录跟进</el-button>
            </div>
            <div class="follow-summary">
              <div><span>跟进次数</span><b>{{ followStats.total }}</b></div>
              <div><span>报价金额</span><b>¥{{ formatMoney(followStats.quoteAmount) }}</b></div>
              <div><span>成交记录</span><b>{{ followStats.ordered }}</b></div>
              <div><span>待复联</span><b>{{ followStats.nextTouch }}</b></div>
            </div>
            <div class="follow-funnel-panel" :class="{ clear: followFunnelIssueTotal === 0 }">
              <div class="follow-funnel-head">
                <div>
                  <strong>报价到提单漏斗异常</strong>
                  <p>{{ followFunnelSummary }}</p>
                </div>
                <el-tag :type="followFunnelIssueTotal > 0 ? 'warning' : 'success'" effect="plain">
                  {{ followFunnelIssueTotal > 0 ? `${followFunnelIssueTotal} 个待处理` : '漏斗顺畅' }}
                </el-tag>
              </div>
              <div class="follow-funnel-grid">
                <button
                  v-for="item in followFunnelIssues"
                  :key="item.key"
                  type="button"
                  class="follow-funnel-card"
                  :class="item.level"
                  @click.stop="focusFollowIssue(item)"
                >
                  <div class="follow-funnel-card-head">
                    <strong>{{ item.title }}</strong>
                    <el-tag :type="followFunnelIssueTag(item.level)" size="small" effect="plain">{{ item.statusText }}</el-tag>
                  </div>
                  <b>{{ item.count }}</b>
                  <p>{{ item.desc }}</p>
                  <span>{{ item.amount > 0 ? `涉及报价 ¥${formatMoney(item.amount)}` : item.actionText }}</span>
                </button>
              </div>
            </div>
            <div class="follow-filter-bar">
              <el-radio-group v-model="followFilter">
                <el-radio-button v-for="item in followFilterOptions" :key="item.value" :label="item.value" :value="item.value">
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <span>{{ followFilterHint }}</span>
            </div>
            <el-table :data="filteredFollowRecords" border stripe empty-text="当前筛选下暂无跟进记录">
              <el-table-column prop="createdAt" label="记录时间" width="150" />
              <el-table-column label="客户" min-width="240">
                <template #default="{ row }">
                  <button type="button" class="link-btn" @click.stop="openContactFromFollow(row)">{{ row.companyName }}</button>
                  <div class="sub-line">{{ row.contactName }} · {{ row.ownerName }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="method" label="方式" width="90" />
              <el-table-column label="结果" width="100">
                <template #default="{ row }">
                  <el-tag :type="followResultTag(row.result)" size="small">{{ row.result }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="报价金额" width="120" align="right">
                <template #default="{ row }">
                  {{ row.quotedAmount ? `¥${formatMoney(row.quotedAmount)}` : '-' }}
                </template>
              </el-table-column>
              <el-table-column prop="content" label="跟进内容" min-width="280" show-overflow-tooltip />
              <el-table-column prop="nextAction" label="下一动作" min-width="240" show-overflow-tooltip />
              <el-table-column prop="nextTouchAt" label="下次跟进" width="150" />
              <el-table-column label="提单" width="150" fixed="right">
                <template #default="{ row }">
                  <div v-if="row.orderNo" class="order-status-cell">
                    <el-tag type="success" size="small">{{ row.orderNo }}</el-tag>
                    <el-tag :type="orderStatusTag(row.orderStatus)" size="small" effect="plain">
                      {{ orderStatusText(row.orderStatus) }}
                    </el-tag>
                  </div>
                  <el-button
                    v-else-if="canCreateOrderDraft(row)"
                    link
                    type="primary"
                    :loading="isCreatingOrderDraft(row.id)"
                    @click="createOrderDraft(row)"
                  >
                    生成提单
                  </el-button>
                  <span v-else class="sub-line">待报价</span>
                </template>
              </el-table-column>
              <el-table-column label="交付" width="130" fixed="right">
                <template #default="{ row }">
                  <el-tag v-if="hasDeliveryPackage(row.contactId)" type="success" size="small">已建包</el-tag>
                  <el-button
                    v-else-if="canCreateDeliveryFromFollow(row)"
                    link
                    type="primary"
                    :loading="isCreatingDelivery(row.contactId)"
                    @click="createDeliveryFromFollow(row)"
                  >
                    生成交付包
                  </el-button>
                  <span v-else class="sub-line">{{ row.orderNo ? '待审批' : '待提单' }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="社群运营" name="groups">
          <div class="group-grid">
            <div v-for="group in groups" :key="group.id" class="group-card">
              <div class="group-head">
                <strong>{{ group.name }}</strong>
                <span>{{ group.ownerName }}</span>
              </div>
              <div class="group-metrics">
                <span><b>{{ group.memberCount }}</b>成员</span>
                <span><b>{{ group.activeRate }}%</b>活跃</span>
                <span><b>{{ group.leadCount }}</b>线索</span>
                <span><b>{{ group.opportunityCount }}</b>商机</span>
              </div>
              <p>{{ group.topic }}</p>
              <div class="group-foot">
                <em>{{ group.nextEvent }}</em>
                <el-progress :percentage="group.activeRate" :stroke-width="6" :show-text="false" />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="内容触达" name="contents">
          <el-table :data="contents" border stripe>
            <el-table-column prop="title" label="内容主题" min-width="260" />
            <el-table-column prop="type" label="类型" width="120" />
            <el-table-column prop="target" label="目标人群" min-width="180" />
            <el-table-column prop="relatedService" label="服务线" width="130" />
            <el-table-column prop="publishAt" label="发布时间" width="150" />
            <el-table-column label="触达/互动" width="120" align="center">
              <template #default="{ row }">{{ row.reachCount }} / {{ row.interactCount }}</template>
            </el-table-column>
            <el-table-column label="线索/成交" width="120" align="center">
              <template #default="{ row }">{{ row.leadCount }} / {{ row.orderCount }}</template>
            </el-table-column>
            <el-table-column label="转化率" width="110" align="center">
              <template #default="{ row }">
                <strong>{{ contentRate(row) }}%</strong>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="contentStatusTag(row.status)" size="small">{{ contentStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="跟进任务" name="tasks">
          <div class="task-filter-bar">
            <el-radio-group v-model="taskFilter">
              <el-radio-button v-for="item in taskFilterOptions" :key="item.value" :label="item.value" :value="item.value">
                {{ item.label }}
              </el-radio-button>
            </el-radio-group>
            <span>{{ taskFilterHint }} 当前显示 {{ filteredTasks.length }} 条任务。</span>
          </div>
          <div class="task-execution-summary">
            <div class="task-metrics">
              <div><span>客户跟进</span><b>{{ taskSourceSummary.follow }}</b></div>
              <div><span>交付任务</span><b>{{ taskSourceSummary.delivery }}</b></div>
              <div><span>督办/补货</span><b>{{ taskSourceSummary.rescue }}</b></div>
              <div><span>当前逾期</span><b>{{ taskSourceSummary.overdue }}</b></div>
            </div>
            <div class="task-group-panel">
              <div class="task-group-head">
                <strong>按客户/交付包归组</strong>
                <span>优先处理逾期多、待办多的任务组。</span>
              </div>
              <div v-if="taskGroupSummaries.length" class="task-group-list">
                <button
                  v-for="group in taskGroupSummaries"
                  :key="group.key"
                  type="button"
                  class="task-group-item"
                  @click.stop="focusTaskGroup(group)"
                >
                  <span>{{ group.label }}</span>
                  <el-tag :type="group.statusLevel" size="small" effect="plain">{{ taskGroupStatusText(group) }}</el-tag>
                  <strong>{{ group.tasks.length }} 个任务 · {{ group.done }} 已完成</strong>
                  <em>{{ group.desc }}</em>
                </button>
              </div>
              <div v-else class="task-group-empty">当前筛选下暂无可归组任务。</div>
            </div>
          </div>
          <el-table :data="filteredTasks" border stripe empty-text="当前筛选下暂无任务">
            <el-table-column label="任务" min-width="300">
              <template #default="{ row }">
                <strong>{{ row.title }}</strong>
                <div class="task-source-row">
                  <el-tag :type="taskSourceTag(row)" size="small" effect="plain">{{ taskSourceText(row) }}</el-tag>
                  <button v-if="taskDeliveryPackage(row)" type="button" class="mini-link-btn" @click.stop="openDeliveryFromTask(row)">
                    {{ taskDeliveryPackageText(row) }}
                  </button>
                </div>
                <div class="sub-line">{{ row.action }}</div>
              </template>
            </el-table-column>
            <el-table-column label="客户" min-width="220">
              <template #default="{ row }">
                <button type="button" class="link-btn" @click.stop="openTaskContact(row)">{{ row.companyName }}</button>
                <div class="sub-line">{{ row.contactName }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="ownerName" label="负责人" width="120" />
            <el-table-column prop="dueTime" label="截止时间" width="150" />
            <el-table-column label="优先级" width="100">
              <template #default="{ row }">
                <el-tag :type="priorityTag(row.priority)" size="small">{{ row.priority }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="taskStatusTag(row.status)" size="small">{{ taskStatusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="130" fixed="right" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.status !== 'done'"
                  type="primary"
                  text
                  size="small"
                  :loading="isUpdatingTask(row.id)"
                  :disabled="isUpdatingTask(row.id)"
                  @click.stop="updatePrivateTaskStatus(row, 'done')"
                >
                  完成
                </el-button>
                <el-button
                  v-else
                  text
                  size="small"
                  :loading="isUpdatingTask(row.id)"
                  :disabled="isUpdatingTask(row.id)"
                  @click.stop="updatePrivateTaskStatus(row, 'pending')"
                >
                  恢复
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="交付包" name="delivery">
          <div class="delivery-panel">
            <div class="panel-title compact">
              <div>
                <h2>成交交付包</h2>
                <p>私域成交后自动拆成工商、财税、地址、渠道应收等任务，避免销售签完单后交付断档。</p>
              </div>
              <el-tag type="success" effect="plain">C · 成交后交付</el-tag>
            </div>
            <div class="delivery-summary">
              <div><span>交付包</span><b>{{ deliveryStats.all }}</b></div>
              <div><span>任务数</span><b>{{ deliveryStats.totalTasks }}</b></div>
              <div><span>待推进</span><b>{{ deliveryStats.pending }}</b></div>
              <div><span>逾期包</span><b>{{ deliveryStats.overdue }}</b></div>
              <div><span>待锁地址</span><b>{{ deliveryStats.addressUnlocked }}</b></div>
              <div><span>待绑资源</span><b>{{ deliveryStats.addressUnbound }}</b></div>
            </div>
            <div class="address-binding-audit" :class="{ clear: !addressBindingIssues.length }">
              <div class="audit-head">
                <div>
                  <strong>ADR 补绑定前检查</strong>
                  <p v-if="addressBindingIssues.length">先核候选资源、区域和供应商,再进详情补绑定,避免地址资源绑错导致渠道应收和客户归属串账。</p>
                  <p v-else>当前没有锁定地址缺 ADR 的交付包,地址资源、渠道应收和客户归属可以继续保持闭环。</p>
                </div>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  :disabled="!addressBindingIssues.length"
                  @click="showAddressBindingQueue"
                >
                  {{ addressBindingIssues.length ? '只看待绑资源' : '已检查' }}
                </el-button>
              </div>
              <div class="audit-metrics">
                <div><span>待处理</span><b>{{ addressBindingIssues.length }}</b></div>
                <div><span>可直接复核</span><b>{{ addressBindingReadyCount }}</b></div>
                <div><span>需人工复核</span><b>{{ addressBindingReviewCount }}</b></div>
                <div><span>无候选</span><b>{{ addressBindingBlockedCount }}</b></div>
              </div>
              <div class="audit-issue-list">
                <button
                  v-for="issue in addressBindingIssues.slice(0, 4)"
                  :key="issue.lock.id"
                  type="button"
                  class="audit-issue"
                  @click.stop="focusAddressBindingIssue(issue)"
                >
                  <span>{{ issue.delivery.companyName }}</span>
                  <el-tag :type="issue.statusLevel" size="small" effect="plain">{{ issue.statusText }}</el-tag>
                  <strong>{{ issue.topText }}</strong>
                  <em>{{ issue.candidateCount }} 个候选 · {{ issue.reason }}</em>
                </button>
              </div>
              <div v-if="!addressBindingIssues.length" class="audit-empty-line">
                <el-tag type="success" size="small" effect="plain">已闭环</el-tag>
                <span>如果后续出现历史锁定缺少 ADR 编号,这里会自动列出候选资源和复核建议。</span>
              </div>
            </div>
            <div class="delivery-filter-bar">
              <el-radio-group v-model="deliveryFilter">
                <el-radio-button v-for="item in deliveryFilterOptions" :key="item.value" :label="item.value" :value="item.value">
                  {{ item.label }}
                </el-radio-button>
              </el-radio-group>
              <span v-if="focusedDeliveryPackage">
                已定位 {{ focusedDeliveryPackage.companyName }} 的交付包，当前显示 {{ filteredDeliveryPackages.length }} 个。
              </span>
              <span v-else>{{ deliveryFilterHint }} 当前显示 {{ filteredDeliveryPackages.length }} 个交付包。</span>
            </div>
            <el-table
              :data="filteredDeliveryPackages"
              border
              stripe
              empty-text="当前筛选下暂无交付包"
              :row-class-name="deliveryRowClassName"
            >
              <template #empty>
                <div class="delivery-empty-state">
                  <div class="delivery-empty-copy">
                    <strong>{{ deliveryEmptyTitle }}</strong>
                    <p>{{ deliveryEmptyDesc }}</p>
                  </div>
                  <div class="delivery-empty-metrics">
                    <span><b>{{ followQueueCounts.completed_no_delivery }}</b>已完成待交付</span>
                    <span><b>{{ followQueueCounts.order_pending }}</b>审批中提单</span>
                    <span><b>{{ followQueueCounts.quote_no_order }}</b>已报价未提单</span>
                  </div>
                  <div class="delivery-empty-actions">
                    <el-button type="primary" @click="goCompletedDeliveryQueue">去生成交付包</el-button>
                    <el-button v-if="deliveryStats.all > 0" @click="showAllDeliveryPackages">查看全部交付包</el-button>
                    <el-button @click="goImportPrivateContacts">导入私域客户</el-button>
                    <el-button @click="syncHint">同步私域数据</el-button>
                  </div>
                </div>
              </template>
              <el-table-column label="交付包" min-width="260">
                <template #default="{ row }">
                  <strong>{{ row.packageName }}</strong>
                  <div class="sub-line">{{ row.companyName }} · {{ row.contactName }}</div>
                </template>
              </el-table-column>
              <el-table-column prop="serviceLine" label="业务线" width="130" />
              <el-table-column label="来源提单" width="150">
                <template #default="{ row }">
                  <el-tag v-if="row.orderNo" type="primary" size="small">{{ row.orderNo }}</el-tag>
                  <span v-else class="sub-line">未关联</span>
                </template>
              </el-table-column>
              <el-table-column label="订单摘要" min-width="280">
                <template #default="{ row }">
                  <div v-if="row.orderNo" class="delivery-order-summary">
                    <div class="order-summary-main">
                      <strong>¥{{ formatMoney(row.orderAmount || 0) }}</strong>
                      <el-tag :type="orderStatusTag(row.orderStatus)" size="small" effect="plain">
                        {{ orderStatusText(row.orderStatus) }}
                      </el-tag>
                      <span>{{ paymentMethodText(row.paymentMethod) }}</span>
                    </div>
                    <div class="sub-line">{{ row.paymentTimeReq || '未填写收款要求' }}</div>
                  </div>
                  <span v-else class="sub-line">未关联订单</span>
                </template>
              </el-table-column>
              <el-table-column label="锁定地址" width="170">
                <template #default="{ row }">
                  <div v-if="activeAddressLock(row)" class="address-lock-cell">
                    <el-button
                      v-if="hasBoundAddressResource(row)"
                      type="primary"
                      link
                      size="small"
                      @click.stop="goAddressResource(activeAddressLock(row))"
                    >
                      {{ addressResourceNo(row) }}
                    </el-button>
                    <el-tag v-else type="warning" size="small" effect="plain">未绑定资源池</el-tag>
                    <span>{{ addressLockRemark(row) }}</span>
                  </div>
                  <el-tag v-else-if="isAddressDelivery(row)" type="warning" size="small" effect="plain">待锁定</el-tag>
                  <span v-else class="sub-line">不涉及</span>
                </template>
              </el-table-column>
              <el-table-column prop="ownerName" label="销售/负责人" width="130" />
              <el-table-column prop="createdAt" label="创建时间" width="150" />
              <el-table-column prop="dueDate" label="最晚节点" width="150" />
              <el-table-column label="任务数" width="90" align="center">
                <template #default="{ row }">{{ row.taskIds.length }}</template>
              </el-table-column>
              <el-table-column label="交付进度" width="150">
                <template #default="{ row }">
                  <div class="delivery-progress-cell">
                    <el-progress
                      :percentage="deliveryProgress(row)"
                      :status="deliveryProgressStatus(row)"
                      :stroke-width="8"
                      :show-text="false"
                    />
                    <span>{{ deliveryProgress(row) }}%</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="110">
                <template #default="{ row }">
                  <el-tag :type="deliveryStatusTag(row.status)" size="small">{{ deliveryStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="任务拆解" min-width="320">
                <template #default="{ row }">
                  <div class="package-task-list">
                    <div
                      v-for="task in row.tasks.slice(0, 4)"
                      :key="task.id"
                      class="package-task-item"
                      :class="{ done: task.status === 'done', overdue: task.status === 'overdue' }"
                    >
                      <el-checkbox
                        :model-value="task.status === 'done'"
                        :disabled="isUpdatingDeliveryTask(task.id)"
                        size="small"
                        @change="checked => toggleDeliveryTask(row, task, Boolean(checked))"
                      />
                      <span>{{ task.title.replace(row.companyName + ' - ', '') }}</span>
                    </div>
                    <em v-if="row.tasks.length > 4" class="package-task-more">+{{ row.tasks.length - 4 }}</em>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="126" fixed="right" align="center">
                <template #default="{ row }">
                  <div class="delivery-action-cell">
                    <el-button
                      v-if="needsAddressLock(row)"
                      type="warning"
                      text
                      size="small"
                      @click.stop="openDeliveryPackage(row)"
                    >
                      锁地址
                    </el-button>
                    <el-button type="primary" text size="small" @click.stop="openDeliveryPackage(row)">详情</el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <el-tab-pane label="接入配置" name="config">
          <div class="wecom-config-card">
            <div class="panel-title compact">
              <div>
                <h2>企业微信接入参数</h2>
                <p>用于同步外部联系人、客户群、标签和互动记录。先保存本地配置，后续接真实企微回调和定时同步。</p>
              </div>
              <el-tag :type="wecomReady ? 'success' : 'warning'" effect="plain">{{ wecomReady ? '已具备接入参数' : '待补参数' }}</el-tag>
            </div>
            <el-form label-position="top" class="wecom-form">
              <el-row :gutter="12">
                <el-col :xs="24" :md="8">
                  <el-form-item label="企业 ID / CorpId">
                    <el-input v-model="wecomConfig.corpId" placeholder="wwxxxxxxxx" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="客户联系 Secret">
                    <el-input v-model="wecomConfig.contactSecret" type="password" show-password />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="客户群 Secret">
                    <el-input v-model="wecomConfig.customerGroupSecret" type="password" show-password />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :xs="24" :md="10">
                  <el-form-item label="回调 URL">
                    <el-input v-model="wecomConfig.callbackUrl" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="7">
                  <el-form-item label="Token">
                    <el-input v-model="wecomConfig.token" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="7">
                  <el-form-item label="EncodingAESKey">
                    <el-input v-model="wecomConfig.aesKey" type="password" show-password />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="12">
                <el-col :xs="24" :md="8">
                  <el-form-item label="同步负责人">
                    <el-input v-model="wecomConfig.ownerName" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="同步间隔（分钟）">
                    <el-input-number v-model="wecomConfig.syncIntervalMinutes" :min="5" :max="1440" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :md="8">
                  <el-form-item label="同步范围">
                    <div class="sync-switches">
                      <el-checkbox v-model="wecomConfig.syncExternalContact">外部联系人</el-checkbox>
                      <el-checkbox v-model="wecomConfig.syncCustomerGroup">客户群</el-checkbox>
                      <el-checkbox v-model="wecomConfig.syncTag">标签</el-checkbox>
                      <el-checkbox v-model="wecomConfig.syncInteraction">互动记录</el-checkbox>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
            <div class="profile-actions">
              <span>最近更新：{{ wecomConfig.updatedAt || '-' }}</span>
              <el-button type="primary" :loading="wecomSaving" @click="saveWecomConfig">保存企微配置</el-button>
            </div>
          </div>
          <div class="config-grid">
            <div v-for="item in integrations" :key="item.key" class="config-card">
              <div class="config-title">
                <strong>{{ item.name }}</strong>
                <el-tag :type="integrationTag(item.status)" size="small">{{ integrationText(item.status) }}</el-tag>
              </div>
              <p>{{ item.description }}</p>
              <div class="config-meta">
                <span>负责人 <b>{{ item.ownerName }}</b></span>
                <span>同步范围 <b>{{ item.scope }}</b></span>
                <span>最近同步 <b>{{ item.lastSyncAt }}</b></span>
              </div>
              <div class="required-list">
                <span v-for="field in item.required" :key="field">{{ field }}</span>
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </section>

    <BusinessDetailDrawer
      v-model="drawer.visible"
      :title="drawer.row?.companyName || '私域客户'"
      :subtitle="drawer.row ? `${drawer.row.name} · ${drawer.row.phone}` : ''"
      eyebrow="PRIVATE CUSTOMER"
      :avatar="drawer.row?.companyName?.slice(0, 1) || '私'"
      avatar-class="company"
      :status-text="drawer.row ? stageText(drawer.row.stage) : ''"
      :status-type="drawer.row ? stageTag(drawer.row.stage) : 'info'"
      size="640px"
    >
      <template #meta>
        <div v-if="drawer.row" class="bd-kv-grid">
          <div class="bd-kv"><span>来源触点</span><b>{{ drawer.row.source }}</b></div>
          <div class="bd-kv"><span>所属社群</span><b>{{ drawer.row.communityName }}</b></div>
          <div class="bd-kv"><span>负责人</span><b>{{ drawer.row.ownerName }}</b></div>
          <div class="bd-kv"><span>客户评分</span><b>{{ drawer.row.score }}</b></div>
          <div class="bd-kv"><span>服务线</span><b>{{ drawer.row.serviceLine }}</b></div>
          <div class="bd-kv"><span>预估金额</span><b>¥{{ formatMoney(drawer.row.estimatedAmount) }}</b></div>
          <div class="bd-kv"><span>工商状态</span><b>{{ drawer.row.verification?.businessStatus || verificationText(drawer.row.verification) }}</b></div>
          <div class="bd-kv"><span>撞单风险</span><b>{{ duplicateRiskText(drawer.row.verification?.duplicateRisk) }}</b></div>
          <div class="bd-kv wide"><span>统一信用代码</span><b>{{ drawer.row.creditCode || drawer.row.verification?.creditCode || '待核验' }}</b></div>
          <div class="bd-kv wide"><span>客户需求</span><b>{{ drawer.row.demand }}</b></div>
          <div class="bd-kv wide"><span>下一动作</span><b>{{ drawer.row.nextAction }}</b></div>
        </div>
      </template>

      <div v-if="drawer.row">
        <div class="bd-section-title">运营摘要</div>
        <div class="contact-ops-summary">
          <div>
            <span>今日状态</span>
            <b>{{ contactQueueText(drawer.row) }}</b>
            <em>{{ contactQueueHint(drawer.row) }}</em>
          </div>
          <div>
            <span>最近互动</span>
            <b>{{ drawer.row.lastTouchAt || '未记录' }}</b>
            <em>{{ drawer.row.source }} · {{ drawer.row.communityName }}</em>
          </div>
          <div>
            <span>跟进记录</span>
            <b>{{ contactFollowCount(drawer.row) }} 次</b>
            <em>{{ contactLatestFollowText(drawer.row) }}</em>
          </div>
          <div>
            <span>转化进度</span>
            <b>{{ contactConversionText(drawer.row) }}</b>
            <em>{{ contactConversionHint(drawer.row) }}</em>
          </div>
        </div>

        <div class="bd-section-title mt">下一步行动建议</div>
        <div class="contact-next-action-card" :class="contactActionLevel(drawer.row)">
          <div class="contact-next-action-copy">
            <el-tag :type="contactActionTag(drawer.row)" size="small" effect="plain">
              {{ contactActionStage(drawer.row) }}
            </el-tag>
            <strong>{{ contactActionTitle(drawer.row) }}</strong>
            <p>{{ contactActionDesc(drawer.row) }}</p>
          </div>
          <div class="contact-next-action-steps">
            <el-button
              v-for="item in contactActionItems(drawer.row)"
              :key="`${item.key}-${item.label}`"
              :type="item.primary ? 'primary' : 'default'"
              size="small"
              plain
              @click.stop="handleContactActionItem(drawer.row, item.key)"
            >
              {{ item.label }}
            </el-button>
          </div>
        </div>

        <div class="bd-section-title mt">责任分工</div>
        <div class="contact-duty-grid">
          <div v-for="item in contactDutyItems(drawer.row)" :key="item.role" class="contact-duty-card">
            <div class="contact-duty-head">
              <div>
                <span>{{ item.role }}</span>
                <strong>{{ item.ownerName }}</strong>
              </div>
              <el-tag :type="item.statusType" size="small" effect="plain">{{ item.statusText }}</el-tag>
            </div>
            <p>{{ item.desc }}</p>
            <div class="contact-duty-action">
              <span>{{ item.action }}</span>
              <el-button
                size="small"
                :type="item.actionPrimary ? 'primary' : 'default'"
                plain
                @click.stop="handleContactActionItem(drawer.row, item.actionKey)"
              >
                {{ item.actionLabel }}
              </el-button>
            </div>
          </div>
        </div>

        <div class="bd-section-title mt">资料证据链</div>
        <div class="contact-evidence-panel">
          <div class="contact-evidence-summary">
            <div>
              <strong>{{ contactEvidenceSummary(drawer.row).title }}</strong>
              <p>{{ contactEvidenceSummary(drawer.row).hint }}</p>
            </div>
            <el-progress
              :percentage="contactEvidenceSummary(drawer.row).percent"
              :status="contactEvidenceSummary(drawer.row).status"
              :stroke-width="8"
            />
          </div>
          <div class="contact-evidence-grid">
            <button
              v-for="item in contactEvidenceItems(drawer.row)"
              :key="item.key"
              type="button"
              class="contact-evidence-card"
              :class="item.status"
              @click.stop="handleContactActionItem(drawer.row, item.actionKey)"
            >
              <div class="contact-evidence-head">
                <strong>{{ item.label }}</strong>
                <el-tag :type="contactEvidenceTag(item.status)" size="small" effect="plain">{{ item.statusText }}</el-tag>
              </div>
              <p>{{ item.desc }}</p>
              <span>{{ item.actionLabel }}</span>
            </button>
          </div>
        </div>

        <div class="bd-section-title">私域标签</div>
        <div class="tag-list drawer-tags">
          <el-tag v-for="tag in drawer.row.tags" :key="tag" effect="plain">{{ tag }}</el-tag>
        </div>

        <div class="bd-section-title mt">工商核验</div>
        <div class="verify-detail-card">
          <div class="verify-detail-head">
            <div>
              <strong>{{ drawer.row.verification?.entityName || drawer.row.companyName }}</strong>
              <p>{{ drawer.row.verification?.source || '工商查询服务' }} · {{ drawer.row.verification?.confidence || 0 }}% 置信度</p>
            </div>
            <div class="verify-tags">
              <el-tag :type="verificationTag(drawer.row.verification)" size="small">{{ verificationText(drawer.row.verification) }}</el-tag>
              <el-tag :type="duplicateRiskTag(drawer.row.verification?.duplicateRisk)" size="small" effect="plain">
                {{ duplicateRiskText(drawer.row.verification?.duplicateRisk) }}
              </el-tag>
            </div>
          </div>
          <div class="verify-detail-grid">
            <span>法人 <b>{{ drawer.row.verification?.legalPerson || '-' }}</b></span>
            <span>注册资本 <b>{{ drawer.row.verification?.registeredCapital || '-' }}</b></span>
            <span>税务资质 <b>{{ drawer.row.verification?.taxQualification || '-' }}</b></span>
            <span>成立日期 <b>{{ drawer.row.verification?.establishDate || '-' }}</b></span>
          </div>
          <p class="verify-note">{{ drawer.row.verification?.linkageText || '还未核验,建议先点击工商核验。' }}</p>
          <p class="verify-note">{{ drawer.row.verification?.suggestionText || '待生成服务建议。' }}</p>
        </div>

        <div class="bd-section-title mt">链路勾稽</div>
        <div class="linkage-grid">
          <div><span>私域互动</span><b>{{ drawer.row.touchCount }} 次</b></div>
          <div><span>线索入库</span><b>{{ drawer.row.convertedLeadId ? `已入库 #${drawer.row.convertedLeadId}` : '未入库' }}</b></div>
          <div><span>主体库</span><b>{{ drawer.row.entityId ? `已挂接 #${drawer.row.entityId}` : '待核验' }}</b></div>
          <div><span>归属池</span><b>{{ drawer.row.verification?.duplicateRisk === 'hit' ? '撞单仲裁' : drawer.row.score >= 85 ? '线上获客公海池' : '新线索池' }}</b></div>
        </div>
      </div>

      <template #timeline>
        <div v-if="drawer.row" class="real-timeline">
          <div v-if="drawerTimeline.length === 0" class="empty-timeline">暂无时间线记录</div>
          <div v-else class="timeline-group-list">
            <section v-for="group in drawerTimelineGroups()" :key="group.type" class="timeline-group">
              <div class="timeline-group-head">
                <strong>{{ group.label }}</strong>
                <span>{{ group.items.length }} 条 · {{ group.desc }}</span>
              </div>
              <div v-for="item in group.items" :key="item.id" class="bd-timeline-item">
                <span class="bd-timeline-dot" :class="item.statusLevel"></span>
                <div>
                  <div class="timeline-title-row">
                    <strong>{{ item.title }}</strong>
                    <el-tag :type="item.statusLevel" size="small" effect="plain">{{ item.statusText }}</el-tag>
                  </div>
                  <p>{{ item.time }} · {{ item.operatorName }} · {{ item.content }}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="drawer.visible = false">关闭</el-button>
        <el-button
          v-if="drawer.row"
          :loading="isVerifying(drawer.row.id)"
          @click.stop="verifyContact(drawer.row)"
        >
          工商核验
        </el-button>
        <el-button v-if="drawer.row" @click.stop="openFollowDialog(drawer.row)">记录跟进</el-button>
        <el-button v-if="drawer.row" @click.stop="createFollowTask(drawer.row)">生成跟进任务</el-button>
        <el-button
          v-if="drawer.row"
          :loading="isCreatingDelivery(drawer.row.id)"
          @click.stop="createDeliveryPackage(drawer.row)"
        >
          生成交付包
        </el-button>
        <el-button
          v-if="drawer.row"
          type="primary"
          :loading="isConverting(drawer.row.id)"
          :disabled="!!drawer.row.convertedLeadId || isConverting(drawer.row.id)"
          @click.stop="convertLead(drawer.row)"
        >
          {{ drawer.row.convertedLeadId ? '已入库网销线索' : '入库网销线索' }}
        </el-button>
      </template>
    </BusinessDetailDrawer>

    <BusinessDetailDrawer
      v-model="deliveryDrawer.visible"
      :title="deliveryDrawer.row?.packageName || '交付包详情'"
      :subtitle="deliveryDrawer.row ? `${deliveryDrawer.row.companyName} · ${deliveryDrawer.row.contactName}` : ''"
      eyebrow="PRIVATE DELIVERY"
      :avatar="deliveryDrawer.row?.companyName?.slice(0, 1) || '交'"
      avatar-class="company"
      :status-text="deliveryDrawer.row ? deliveryStatusText(deliveryDrawer.row.status) : ''"
      :status-type="deliveryDrawer.row ? deliveryStatusTag(deliveryDrawer.row.status) : 'info'"
      size="720px"
    >
      <template #meta>
        <template v-if="deliveryDrawer.row && isAddressDelivery(deliveryDrawer.row)">
          <div class="bd-section-title">地址库存锁定</div>
          <div class="address-lock-panel address-lock-priority">
            <div v-if="activeAddressLock(deliveryDrawer.row)" class="address-lock-current">
              <div>
                <strong>{{ activeAddressLock(deliveryDrawer.row)?.remark }}</strong>
                <p>
                  已锁定给 {{ activeAddressLock(deliveryDrawer.row)?.companyName }} ·
                  {{ activeAddressLock(deliveryDrawer.row)?.lockedAt }} 至 {{ activeAddressLock(deliveryDrawer.row)?.releaseAt }}
                </p>
                <button
                  v-if="activeAddressLock(deliveryDrawer.row)?.resourceId"
                  type="button"
                  class="address-resource-chip"
                  @click.stop="goAddressResource(activeAddressLock(deliveryDrawer.row))"
                >
                  资源池 {{ formatAddressResourceNo(activeAddressLock(deliveryDrawer.row)?.resourceId) }}
                </button>
                <div class="address-lock-linkage">
                  <div>
                    <span>库存来源</span>
                    <b>{{ addressInventorySource(activeAddressLock(deliveryDrawer.row)) }}</b>
                  </div>
                  <div>
                    <span>资源池状态</span>
                    <b>{{ addressResourceStatusText(activeAddressLock(deliveryDrawer.row)) }}</b>
                  </div>
                  <div>
                    <span>渠道应收</span>
                    <b>{{ addressLockSettlementText(deliveryDrawer.row, activeAddressLock(deliveryDrawer.row)) }}</b>
                  </div>
                  <div>
                    <span>毛利测算</span>
                    <b>{{ addressLockMarginText(activeAddressLock(deliveryDrawer.row)) }}</b>
                  </div>
                </div>
                <p class="address-lock-note">
                  {{ addressLockLinkageTip(deliveryDrawer.row, activeAddressLock(deliveryDrawer.row)) }}
                </p>
                <div v-if="!activeAddressLock(deliveryDrawer.row)?.resourceId" class="address-bind-repair">
                  <div class="address-bind-tip">
                    <el-tag type="warning" size="small">未绑定资源池</el-tag>
                    <span>这条历史锁定缺少 ADR 编号,请补选一个可用地址。</span>
                  </div>
                  <div class="address-bind-row">
                    <el-select
                      v-model="selectedAddressResourceIds[activeAddressLock(deliveryDrawer.row)?.id || 0]"
                      placeholder="选择可用地址资源"
                      filterable
                      size="small"
                      :loading="addressResourceLoading"
                      @focus="loadAddressResourceOptions"
                    >
                      <el-option
                        v-for="resource in addressResourceCandidates(activeAddressLock(deliveryDrawer.row))"
                        :key="resource.id"
                        :label="addressResourceOptionLabel(resource, activeAddressLock(deliveryDrawer.row))"
                        :value="resource.id"
                      />
                    </el-select>
                    <el-button
                      type="primary"
                      size="small"
                      :loading="isBindingAddressResource(activeAddressLock(deliveryDrawer.row)?.id || 0)"
                      :disabled="!selectedAddressResourceIds[activeAddressLock(deliveryDrawer.row)?.id || 0]"
                      @click.stop="bindAddressResource(activeAddressLock(deliveryDrawer.row))"
                    >
                      补绑定
                    </el-button>
                  </div>
                  <div class="address-bind-hint">
                    {{ addressResourceCandidateHint(activeAddressLock(deliveryDrawer.row)) }}
                  </div>
                </div>
              </div>
              <el-button
                text
                type="danger"
                size="small"
                :loading="isReleasingAddress(activeAddressLock(deliveryDrawer.row)?.id || 0)"
                @click.stop="releaseActiveAddress(deliveryDrawer.row)"
              >
                释放
              </el-button>
            </div>
            <div class="address-inventory-list">
              <div
                v-for="item in addressInventoryForDelivery(deliveryDrawer.row)"
                :key="item.id"
                class="address-inventory-item"
                :class="[item.status, { active: isCurrentAddressInventory(deliveryDrawer.row, item) }]"
              >
                <div class="address-inventory-head">
                  <strong>{{ item.city }}{{ item.district }} · {{ item.addressType }}</strong>
                  <div class="address-inventory-tags">
                    <el-tag v-if="isCurrentAddressInventory(deliveryDrawer.row, item)" type="primary" size="small">
                      当前锁定
                    </el-tag>
                    <el-tag :type="addressStatusTag(item.status)" size="small">{{ addressStatusText(item.status) }}</el-tag>
                  </div>
                </div>
                <p>{{ item.supplierName }} · {{ item.remark }}</p>
                <div class="address-inventory-meta">
                  <span>可售 <b>{{ item.available }}</b></span>
                  <span>已锁 <b>{{ item.locked }}</b></span>
                  <span>成本 <b>¥{{ item.monthlyCost }}/月</b></span>
                  <span>渠道价 <b>¥{{ item.channelPrice }}/月</b></span>
                </div>
                <div class="address-inventory-actions">
                  <el-button
                    type="primary"
                    size="small"
                    :disabled="!!activeAddressLock(deliveryDrawer.row) || item.status === 'blocked' || item.available <= 0"
                    :loading="isLockingAddress(item.id)"
                    @click.stop="lockAddress(deliveryDrawer.row, item)"
                  >
                    {{ activeAddressLock(deliveryDrawer.row) ? '已锁定' : item.status === 'blocked' ? '不可售' : '锁定到本包' }}
                  </el-button>
                  <el-button
                    v-if="item.status !== 'available' || item.available <= 2"
                    type="warning"
                    plain
                    size="small"
                    :loading="isCreatingAddressReplenish(item.id)"
                    :disabled="isCreatingAddressReplenish(item.id)"
                    @click.stop="createAddressReplenishTask(item)"
                  >
                    生成补货任务
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </template>
        <div v-if="deliveryDrawer.row" class="bd-kv-grid">
          <div class="bd-kv"><span>业务线</span><b>{{ deliveryDrawer.row.serviceLine }}</b></div>
          <div class="bd-kv"><span>负责人</span><b>{{ deliveryDrawer.row.ownerName }}</b></div>
          <div class="bd-kv"><span>来源提单</span><b>{{ deliveryDrawer.row.orderNo || '未关联' }}</b></div>
          <div class="bd-kv"><span>订单状态</span><b>{{ orderStatusText(deliveryDrawer.row.orderStatus) }}</b></div>
          <div class="bd-kv"><span>订单金额</span><b>¥{{ formatMoney(deliveryDrawer.row.orderAmount || 0) }}</b></div>
          <div class="bd-kv"><span>付款方式</span><b>{{ paymentMethodText(deliveryDrawer.row.paymentMethod) }}</b></div>
          <div class="bd-kv"><span>创建时间</span><b>{{ deliveryDrawer.row.createdAt }}</b></div>
          <div class="bd-kv"><span>最晚节点</span><b>{{ deliveryDrawer.row.dueDate }}</b></div>
          <div class="bd-kv wide"><span>服务项目</span><b>{{ deliveryDrawer.row.orderItemNames?.join('、') || deliveryDrawer.row.serviceLine }}</b></div>
          <div class="bd-kv wide"><span>收款要求</span><b>{{ deliveryDrawer.row.paymentTimeReq || '未填写收款要求' }}</b></div>
        </div>
      </template>

      <div v-if="deliveryDrawer.row" class="delivery-detail-body">
        <div class="bd-section-title mt">交付进度</div>
        <div class="delivery-detail-progress">
          <div class="delivery-progress-main">
            <el-progress
              :percentage="deliveryProgress(deliveryDrawer.row)"
              :status="deliveryProgressStatus(deliveryDrawer.row)"
              :stroke-width="10"
            />
          </div>
          <div class="delivery-progress-stats">
            <span><b>{{ deliveryDoneCount(deliveryDrawer.row) }}</b>已完成</span>
            <span><b>{{ deliveryPendingCount(deliveryDrawer.row) }}</b>待处理</span>
            <span><b>{{ deliveryOverdueCount(deliveryDrawer.row) }}</b>已逾期</span>
            <span><b>{{ deliveryDrawer.row.tasks.length }}</b>任务总数</span>
          </div>
        </div>

        <div class="bd-section-title mt">交付核对</div>
        <div class="delivery-check-grid">
          <div>
            <span>成交来源</span>
            <b>{{ deliveryDrawer.row.orderNo ? '订单审批完成后生成' : '私域客户手动生成' }}</b>
          </div>
          <div>
            <span>交付风险</span>
            <b>{{ deliveryRiskText(deliveryDrawer.row) }}</b>
          </div>
          <div>
            <span>回款核对</span>
            <b>{{ deliveryDrawer.row.paymentTimeReq || '先核对回款/合同/资料' }}</b>
          </div>
          <div>
            <span>客户入口</span>
            <b>{{ deliveryDrawer.row.companyName }} · {{ deliveryDrawer.row.contactName }}</b>
          </div>
        </div>

        <div class="bd-section-title mt">回款资料核对</div>
        <div class="delivery-checklist">
          <div v-for="item in deliveryChecklistItems(deliveryDrawer.row)" :key="item.key" class="delivery-check-item" :class="item.status">
            <div class="delivery-check-head">
              <strong>{{ item.label }}</strong>
              <el-tag :type="deliveryChecklistTag(item.status)" size="small" effect="plain">{{ item.statusText }}</el-tag>
            </div>
            <p>{{ item.desc }}</p>
          </div>
        </div>

        <div class="bd-section-title mt">资料归档</div>
        <div class="delivery-archive-panel">
          <div class="delivery-archive-summary">
            <div>
              <strong>{{ deliveryArchiveSummary(deliveryDrawer.row).title }}</strong>
              <p>{{ deliveryArchiveSummary(deliveryDrawer.row).hint }}</p>
            </div>
            <el-progress
              :percentage="deliveryArchiveSummary(deliveryDrawer.row).percent"
              :status="deliveryArchiveSummary(deliveryDrawer.row).status"
              :stroke-width="8"
            />
          </div>
          <div class="delivery-archive-grid">
            <button
              v-for="item in deliveryArchiveItems(deliveryDrawer.row)"
              :key="item.key"
              type="button"
              class="delivery-archive-card"
              :class="item.status"
              @click.stop="handleDeliveryArchiveAction(deliveryDrawer.row, item)"
            >
              <div class="delivery-archive-head">
                <strong>{{ item.label }}</strong>
                <el-tag :type="deliveryChecklistTag(item.status)" size="small" effect="plain">{{ item.statusText }}</el-tag>
              </div>
              <p>{{ item.desc }}</p>
              <span>{{ item.actionText }}</span>
            </button>
          </div>
        </div>

        <div class="bd-section-title mt">回访续费</div>
        <div class="delivery-review-card">
          <div>
            <strong>{{ deliveryReviewTitle(deliveryDrawer.row) }}</strong>
            <p>{{ deliveryReviewDesc(deliveryDrawer.row) }}</p>
          </div>
          <div class="delivery-review-actions">
            <el-button type="primary" size="small" @click.stop="openDeliveryReview(deliveryDrawer.row)">记录回访</el-button>
            <el-button size="small" @click.stop="createDeliveryReviewTask(deliveryDrawer.row)">生成回访任务</el-button>
          </div>
        </div>

        <div class="bd-section-title mt">任务清单</div>
        <div class="delivery-task-detail-list">
          <div
            v-for="task in deliveryDrawer.row.tasks"
            :key="task.id"
            class="delivery-task-detail"
            :class="{ done: task.status === 'done', overdue: task.status === 'overdue' }"
          >
            <el-checkbox
              :model-value="task.status === 'done'"
              :disabled="isUpdatingDeliveryTask(task.id)"
              @change="checked => deliveryDrawer.row && toggleDeliveryTask(deliveryDrawer.row, task, Boolean(checked))"
            />
            <div>
              <div class="delivery-task-title">
                <strong>{{ task.title.replace(deliveryDrawer.row.companyName + ' - ', '') }}</strong>
                <el-tag :type="taskStatusTag(task.status)" size="small">{{ taskStatusText(task.status) }}</el-tag>
                <el-tag :type="priorityTag(task.priority)" size="small" effect="plain">{{ task.priority }}</el-tag>
                <el-button
                  v-if="task.status === 'pending'"
                  type="danger"
                  text
                  size="small"
                  :disabled="isUpdatingDeliveryTask(task.id)"
                  @click.stop="deliveryDrawer.row && markDeliveryTaskOverdue(deliveryDrawer.row, task)"
                >
                  标记逾期
                </el-button>
                <el-button
                  v-else-if="task.status === 'overdue'"
                  type="primary"
                  text
                  size="small"
                  :disabled="isUpdatingDeliveryTask(task.id)"
                  @click.stop="deliveryDrawer.row && restoreDeliveryTask(deliveryDrawer.row, task)"
                >
                  恢复待处理
                </el-button>
                <el-button
                  v-if="task.status === 'overdue'"
                  type="warning"
                  text
                  size="small"
                  :loading="isCreatingSupervisorTask(task.id)"
                  :disabled="isCreatingSupervisorTask(task.id)"
                  @click.stop="deliveryDrawer.row && createSupervisorTask(deliveryDrawer.row, task)"
                >
                  生成督办
                </el-button>
              </div>
              <p>{{ task.dueTime }} · {{ task.ownerName }} · {{ task.action }}</p>
            </div>
          </div>
        </div>
      </div>

      <template #timeline>
        <div v-if="deliveryDrawer.row" class="real-timeline">
          <div v-if="deliveryTimelineItems(deliveryDrawer.row).length === 0" class="empty-timeline">暂无交付时间线记录</div>
          <div v-else class="timeline-group-list">
            <section v-for="group in deliveryTimelineGroups(deliveryDrawer.row)" :key="group.type" class="timeline-group">
              <div class="timeline-group-head">
                <strong>{{ group.label }}</strong>
                <span>{{ group.items.length }} 条 · {{ group.desc }}</span>
              </div>
              <div v-for="item in group.items" :key="item.id" class="bd-timeline-item">
                <span class="bd-timeline-dot" :class="item.statusLevel"></span>
                <div>
                  <div class="timeline-title-row">
                    <strong>{{ item.title }}</strong>
                    <el-tag :type="item.statusLevel" size="small" effect="plain">{{ item.statusText }}</el-tag>
                  </div>
                  <p>{{ item.time }} · {{ item.ownerName }} · {{ item.content }}</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="deliveryDrawer.visible = false">关闭</el-button>
        <el-button v-if="deliveryDrawer.row" @click.stop="openDeliveryContact(deliveryDrawer.row)">查看客户</el-button>
        <el-button v-if="deliveryDrawer.row" @click.stop="openDeliveryReview(deliveryDrawer.row)">记录回访</el-button>
        <el-button v-if="deliveryDrawer.row?.orderNo" type="primary" @click.stop="openDeliveryOrder(deliveryDrawer.row)">查看提单</el-button>
      </template>
    </BusinessDetailDrawer>

    <el-dialog v-model="followDialog.visible" title="记录私域跟进" width="640px" class="follow-dialog" append-to-body>
      <el-form label-position="top" class="follow-form">
        <el-row :gutter="12">
          <el-col :xs="24" :md="12">
            <el-form-item label="客户">
              <el-select v-model="followForm.contactId" placeholder="请选择客户" filterable>
                <el-option
                  v-for="item in contacts"
                  :key="item.id"
                  :label="`${item.companyName} · ${item.name}`"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="12">
            <el-form-item label="负责人">
              <el-input v-model="followForm.ownerName" placeholder="默认取客户负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :xs="24" :md="8">
            <el-form-item label="跟进方式">
              <el-select v-model="followForm.method">
                <el-option v-for="item in followMethodOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="跟进结果">
              <el-select v-model="followForm.result">
                <el-option v-for="item in followResultOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="8">
            <el-form-item label="报价/成交金额">
              <el-input-number v-model="followForm.quotedAmount" :min="0" :step="1000" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="本次跟进内容">
          <el-input v-model="followForm.content" type="textarea" :rows="3" placeholder="例如：客户确认需要代理记账，预算 1.2 万，关心税务报到和银行开户。" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :xs="24" :md="10">
            <el-form-item label="下次跟进时间">
              <el-input v-model="followForm.nextTouchAt" placeholder="例如：2026-06-08 10:00" />
            </el-form-item>
          </el-col>
          <el-col :xs="24" :md="14">
            <el-form-item label="下一步动作">
              <el-input v-model="followForm.nextAction" placeholder="不填时系统按结果自动生成" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="followDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="followSaving" @click="saveFollowRecord">保存跟进记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'
import { addressApi, type BizAddressResource } from '@/api/channel'
import {
  privateImportTemplateColumns,
  privateImportTemplateSamples,
  privateDomainApi,
  type DailyActionStatus,
  type IntegrationStatus,
  type OpsCheckStatus,
  type PrivateAddressInventory,
  type PrivateAddressInventoryStatus,
  type PrivateAddressLock,
  type PrivateContact,
  type PrivateCompanyVerification,
  type PrivateContactImportRow,
  type PrivateContent,
  type PrivateDailyAction,
  type PrivateDeliveryPackage,
  type PrivateDeliveryStatus,
  type PrivateDuplicateRisk,
  type PrivateFollowCreatePayload,
  type PrivateFollowMethod,
  type PrivateFollowRecord,
  type PrivateFollowResult,
  type PrivateGroup,
  type PrivateImportPreviewRow,
  type PrivateImportStatus,
  type PrivateIntegration,
  type PrivateCollisionPolicy,
  type PrivateOwnerPolicy,
  type PrivateOwnershipRule,
  type PrivateOpsCheck,
  type PrivateOpsProfile,
  type PrivateSource,
  type PrivateStage,
  type PrivateSummary,
  type PrivateTask,
  type PrivateTaskStatus,
  type PrivateTimelineItem,
  type PrivateTimelineType,
  type PrivateWecomConfig
} from '@/api/private-domain'

type FollowFilter = 'all' | 'quote_no_order' | 'order_pending' | 'completed_no_delivery' | 'next_touch'
type DeliveryFilter = 'all' | 'not_started' | 'in_progress' | 'overdue' | 'address_unlocked' | 'address_unbound' | 'done'
type TaskFilter = 'all' | 'pending' | 'overdue' | 'address_stock' | 'supervisor' | 'done'
type StarterAction = 'import' | 'contacts' | 'follow' | 'quote' | 'delivery'
type ContactQuickFilter = 'all' | 'today_unfollowed' | 'intent' | 'unverified'
type TodayReviewAction = 'contacts' | 'follow' | 'delivery' | 'tasks'
interface FollowFunnelIssue {
  key: string
  filter: FollowFilter
  title: string
  count: number
  amount: number
  level: 'success' | 'warning' | 'danger' | 'primary'
  statusText: string
  desc: string
  actionText: string
}
interface TodayReviewCard {
  key: string
  title: string
  value: string | number
  desc: string
  level: 'success' | 'warning' | 'danger' | 'primary'
  statusText: string
  actionText: string
  action: TodayReviewAction
}
type AddressBindingIssue = {
  delivery: PrivateDeliveryPackage
  lock: PrivateAddressLock
  candidateCount: number
  statusText: string
  statusLevel: 'success' | 'warning' | 'danger'
  topText: string
  reason: string
}
type TaskGroupSummary = {
  key: string
  label: string
  desc: string
  tasks: PrivateTask[]
  pending: number
  overdue: number
  done: number
  statusLevel: 'success' | 'warning' | 'danger' | 'primary'
  delivery?: PrivateDeliveryPackage
  contact?: PrivateContact
}

const router = useRouter()
const route = useRoute()
const activeTab = ref('diagnosis')
const loading = ref(false)
const contacts = ref<PrivateContact[]>([])
const groups = ref<PrivateGroup[]>([])
const contents = ref<PrivateContent[]>([])
const tasks = ref<PrivateTask[]>([])
const addressInventory = ref<PrivateAddressInventory[]>([])
const addressLocks = ref<PrivateAddressLock[]>([])
const addressResourceOptions = ref<BizAddressResource[]>([])
const integrations = ref<PrivateIntegration[]>([])
const ownershipRules = ref<PrivateOwnershipRule[]>([])
const deliveryPackages = ref<PrivateDeliveryPackage[]>([])
const followRecords = ref<PrivateFollowRecord[]>([])
const drawerTimeline = ref<PrivateTimelineItem[]>([])
const convertingIds = ref<number[]>([])
const verifyingIds = ref<number[]>([])
const deliveryCreatingIds = ref<number[]>([])
const deliveryTaskUpdatingIds = ref<number[]>([])
const supervisorTaskCreatingIds = ref<number[]>([])
const taskUpdatingIds = ref<number[]>([])
const addressLockingIds = ref<number[]>([])
const addressReleasingIds = ref<number[]>([])
const addressResourceBindingIds = ref<number[]>([])
const addressReplenishCreatingIds = ref<number[]>([])
const orderDraftCreatingIds = ref<number[]>([])
const ruleSavingIds = ref<number[]>([])
const addressResourceLoading = ref(false)
const opsChecks = ref<PrivateOpsCheck[]>([])
const dailyActions = ref<PrivateDailyAction[]>([])
const profileSaving = ref(false)
const wecomSaving = ref(false)
const followSaving = ref(false)
const contactQuickFilter = ref<ContactQuickFilter>('all')
const followFilter = ref<FollowFilter>('all')
const deliveryFilter = ref<DeliveryFilter>('all')
const focusedDeliveryPackageId = ref<number | null>(null)
const taskFilter = ref<TaskFilter>('all')
const importColumns = privateImportTemplateColumns
const importPreview = ref<PrivateImportPreviewRow[]>([])
const importFileName = ref('')
const pasteText = ref('')
const importing = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const batchVerifyingContacts = ref(false)
const batchCreatingFollowTasks = ref(false)
const summary = reactive<PrivateSummary>({
  contactCount: 0,
  intentCount: 0,
  silentCount: 0,
  convertedCount: 0,
  verifiedCount: 0,
  duplicateRiskCount: 0,
  orderedCount: 0,
  deliveryPackageCount: 0,
  deliveryTaskCount: 0,
  followRecordCount: 0,
  quoteAmount: 0,
  groupCount: 0,
  touchCount: 0,
  estimatedAmount: 0,
  funnel: [],
  sourceStats: []
})
const selectedAddressResourceIds = reactive<Record<number, number | undefined>>({})
const query = reactive<{ keyword: string; source: '' | PrivateSource; stage: '' | PrivateStage }>({
  keyword: '',
  source: '',
  stage: ''
})
const contactQuickCounts = computed(() => ({
  all: contacts.value.length,
  today_unfollowed: contacts.value.filter(isTodayUnfollowed).length,
  intent: contacts.value.filter(isIntentContact).length,
  unverified: contacts.value.filter(isUnverifiedContact).length
}))
const contactQuickOptions = computed(() => [
  { label: `全部 ${contactQuickCounts.value.all}`, value: 'all' },
  { label: `今日未跟进 ${contactQuickCounts.value.today_unfollowed}`, value: 'today_unfollowed' },
  { label: `高意向 ${contactQuickCounts.value.intent}`, value: 'intent' },
  { label: `未核验 ${contactQuickCounts.value.unverified}`, value: 'unverified' }
] as const)
const contactQuickHint = computed(() => ({
  all: '查看当前查询下的全部私域客户。',
  today_unfollowed: '今天还没有触达的客户,适合电销和私域运营优先排班。',
  intent: '高分或已进入意向/报价/成交阶段的客户,需要优先跟进和提单。',
  unverified: '还没有完成工商核验的客户,先核公司主体再推进报价。'
} as Record<ContactQuickFilter, string>)[contactQuickFilter.value])
const mustHandleQueue = computed(() => contacts.value
  .map(row => contactMustHandleItem(row))
  .filter((item): item is ContactMustHandleItem => Boolean(item))
  .sort((left, right) => {
    if (left.sort !== right.sort) return right.sort - left.sort
    return right.contact.score - left.contact.score
  })
  .slice(0, 6))
const mustHandleStats = computed(() => {
  const all = contacts.value
    .map(row => contactMustHandleItem(row))
    .filter((item): item is ContactMustHandleItem => Boolean(item))
  return {
    total: all.length,
    danger: all.filter(item => item.level === 'danger').length,
    warning: all.filter(item => item.level === 'warning').length,
    primary: all.filter(item => item.level === 'primary').length
  }
})
const filteredContactRows = computed(() => {
  if (contactQuickFilter.value === 'today_unfollowed') return contacts.value.filter(isTodayUnfollowed)
  if (contactQuickFilter.value === 'intent') return contacts.value.filter(isIntentContact)
  if (contactQuickFilter.value === 'unverified') return contacts.value.filter(isUnverifiedContact)
  return contacts.value
})
const batchVerifiableContacts = computed(() => filteredContactRows.value.filter(isUnverifiedContact))
const batchFollowTaskContacts = computed(() => filteredContactRows.value.filter(row => {
  return (isIntentContact(row) || isTodayUnfollowed(row)) && !hasOpenFollowTask(row)
}))
const hasContactFilter = computed(() => Boolean(query.keyword || query.source || query.stage || contactQuickFilter.value !== 'all'))
const contactEmptyTitle = computed(() => (hasContactFilter.value ? '当前筛选没有客户' : '还没有私域客户'))
const contactEmptyDesc = computed(() => {
  if (hasContactFilter.value) return '可以先重置筛选,或换公司名称、联系人、需求关键词继续查找。'
  return '先通过批量导入或企微同步把客户入库,后续才能跟进、报价、提单和交付。'
})
const drawer = reactive<{ visible: boolean; row: PrivateContact | null }>({ visible: false, row: null })
const deliveryDrawer = reactive<{ visible: boolean; row: PrivateDeliveryPackage | null }>({ visible: false, row: null })
const followDialog = reactive<{ visible: boolean; row: PrivateContact | null }>({ visible: false, row: null })
const followForm = reactive<PrivateFollowCreatePayload>({
  contactId: 0,
  method: '电话',
  result: '已联系',
  content: '',
  quotedAmount: 0,
  nextAction: '',
  nextTouchAt: '',
  ownerName: ''
})
const opsProfile = reactive<PrivateOpsProfile>({
  companyName: '浙杭集团',
  city: '杭州',
  privatePlatforms: [],
  departments: [],
  keyServices: [],
  requiredFields: [],
  dailyLeadTarget: 80,
  handoffRule: '',
  painPoints: '',
  answers: {
    sourceTruth: '',
    ownerRule: '',
    successMetric: '',
    dataImport: ''
  },
  updatedAt: ''
})
const wecomConfig = reactive<PrivateWecomConfig>({
  corpId: '',
  contactSecret: '',
  customerGroupSecret: '',
  callbackUrl: '',
  token: '',
  aesKey: '',
  syncExternalContact: true,
  syncCustomerGroup: true,
  syncTag: true,
  syncInteraction: true,
  syncIntervalMinutes: 30,
  ownerName: '系统管理员',
  updatedAt: ''
})

const sourceOptions: PrivateSource[] = ['企业微信', '个人微信', '微信群', '朋友圈', '公众号', '视频号', '老客转介绍']
const serviceOptions = ['代理记账', '工商注册', '地址挂靠', '异常解除', '税务筹划', '公司注销', '同行渠道', '财税体检', '出口退税']
const departmentOptions = ['网销运营', '私域运营', '电销坐席', '销售顾问', '渠道经理', '财税交付', '财务核对', '老板/管理层']
const requiredFieldOptions = ['公司名称', '联系人', '手机号', '微信号', '来源触点', '客户需求', '工商状态', '税务资质', '地址需求', '预算金额', '负责人', '下次跟进时间']
const workflowSteps = ['私域触点', '公司核验', '查重分配', '销售跟进', '报价提单', '财税交付', '回款续费']
const ownerPolicyOptions: Array<{ label: string; value: PrivateOwnerPolicy }> = [
  { label: '谁先添加归谁', value: 'first_touch' },
  { label: '来源部门优先', value: 'source_team' },
  { label: '主管分配', value: 'manager_assign' },
  { label: '渠道客户独立归属', value: 'channel_dedicated' },
  { label: '按客户等级分配', value: 'score_priority' }
]
const collisionPolicyOptions: Array<{ label: string; value: PrivateCollisionPolicy }> = [
  { label: '先冻结不流转', value: 'block' },
  { label: '允许协作跟进', value: 'collaborate' },
  { label: '主管仲裁', value: 'manager' },
  { label: '合并客户记录', value: 'merge' }
]
const followMethodOptions: PrivateFollowMethod[] = ['企微', '电话', '微信', '短信', '社群', '线下', '其他']
const followResultOptions: PrivateFollowResult[] = ['无响应', '已联系', '有意向', '已报价', '已成交', '暂缓', '流失']
const routeTabOptions = ['diagnosis', 'ownership', 'import', 'contacts', 'follow', 'groups', 'contents', 'tasks', 'delivery', 'config']
const routeFollowFilters: FollowFilter[] = ['all', 'quote_no_order', 'order_pending', 'completed_no_delivery', 'next_touch']
const routeDeliveryFilters: DeliveryFilter[] = ['all', 'not_started', 'in_progress', 'overdue', 'address_unlocked', 'address_unbound', 'done']
const routeTaskFilters: TaskFilter[] = ['all', 'pending', 'overdue', 'address_stock', 'supervisor', 'done']
const diagnosisQuestions = [
  {
    key: 'sourceTruth',
    title: '1. 私域客户主要从哪里来？',
    hint: '先选最主要的来源，我后续按这个来源做字段和流程。',
    options: ['企微/微信群为主', '个人微信为主', '广告留资为主', '同行渠道为主', '多来源混合', '暂不确定']
  },
  {
    key: 'ownerRule',
    title: '2. 客户归属优先按什么定？',
    hint: '这会影响分配、保护期、撞单和回收规则。',
    options: ['谁先添加归谁', '来源部门优先', '销售主管分配', '渠道客户单独归属', '按客户等级分配', '暂不确定']
  },
  {
    key: 'successMetric',
    title: '3. 老板每天最先看什么？',
    hint: '这会决定首页和驾驶舱优先展示什么。',
    options: ['新增线索/有效线索', '成交金额/回款', 'ROI/投产比', '交付逾期/客户风险', '员工产能/跟进量', '全部都要']
  },
  {
    key: 'dataImport',
    title: '4. 现阶段数据怎么进系统？',
    hint: '这会决定先做导入表，还是先做接口接入。',
    options: ['先 Excel 导入', '先手工录入', '企微接口优先', '呼叫中心优先', '广告平台优先', '先做本地闭环']
  }
] as const
const previewStats = computed(() => ({
  total: importPreview.value.length,
  ready: importPreview.value.filter(item => item.status === 'ready').length,
  duplicate: importPreview.value.filter(item => item.status === 'duplicate').length,
  error: importPreview.value.filter(item => item.status === 'error').length,
  verified: importPreview.value.filter(item => item.verification?.matched).length
}))
const wecomReady = computed(() => Boolean(wecomConfig.corpId && wecomConfig.contactSecret && wecomConfig.token && wecomConfig.aesKey))
const followStats = computed(() => ({
  total: followRecords.value.length,
  quoteAmount: followRecords.value.reduce((sum, item) => sum + Number(item.quotedAmount || 0), 0),
  ordered: followRecords.value.filter(item => item.result === '已成交').length,
  nextTouch: followRecords.value.filter(item => item.nextTouchAt && item.result !== '已成交' && item.result !== '流失').length
}))
const followQueueCounts = computed(() => {
  const packageContactIds = new Set(deliveryPackages.value.map(item => item.contactId))
  return {
    all: followRecords.value.length,
    quote_no_order: followRecords.value.filter(item => Number(item.quotedAmount || 0) > 0 && !item.orderNo).length,
    order_pending: followRecords.value.filter(item => ['draft', 'pending_approval', 'pending_finance', 'pending_boss'].includes(item.orderStatus || '')).length,
    completed_no_delivery: followRecords.value.filter(item => item.orderStatus === 'completed' && !packageContactIds.has(item.contactId)).length,
    next_touch: followRecords.value.filter(item => item.nextTouchAt && item.result !== '已成交' && item.result !== '流失').length
  }
})
const starterSteps = computed<Array<{ id: string; title: string; metric: string; done: boolean; action: StarterAction }>>(() => [
  {
    id: 'contacts',
    title: '私域客户入库',
    metric: `${summary.contactCount} 个客户`,
    done: summary.contactCount > 0,
    action: summary.contactCount > 0 ? 'contacts' : 'import'
  },
  {
    id: 'follow',
    title: '当天跟进留痕',
    metric: `${summary.followRecordCount} 次跟进`,
    done: summary.followRecordCount > 0,
    action: 'follow'
  },
  {
    id: 'quote',
    title: '报价提单推进',
    metric: `报价¥${formatMoney(summary.quoteAmount)} / 提单${followQueueCounts.value.order_pending} 条`,
    done: summary.quoteAmount > 0 || followQueueCounts.value.order_pending > 0 || summary.orderedCount > 0,
    action: 'quote'
  },
  {
    id: 'delivery',
    title: '成交交付建包',
    metric: `${summary.deliveryPackageCount} 个交付包`,
    done: summary.deliveryPackageCount > 0,
    action: 'delivery'
  }
])
const starterProgress = computed(() => {
  const total = starterSteps.value.length
  const done = starterSteps.value.filter(item => item.done).length
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0
  }
})
const followFilterOptions = computed(() => [
  { label: `全部 ${followQueueCounts.value.all}`, value: 'all' },
  { label: `已报价未提单 ${followQueueCounts.value.quote_no_order}`, value: 'quote_no_order' },
  { label: `已提单待审批 ${followQueueCounts.value.order_pending}`, value: 'order_pending' },
  { label: `已完成待交付 ${followQueueCounts.value.completed_no_delivery}`, value: 'completed_no_delivery' },
  { label: `待复联 ${followQueueCounts.value.next_touch}`, value: 'next_touch' }
] as const)
const followFilterHint = computed(() => ({
  all: '查看所有私域跟进流水。',
  quote_no_order: '优先把已报价客户生成提单草稿,避免口头报价后无人推进。',
  order_pending: '已提单但还在审批/财务/老板节点,需要销售盯进度。',
  completed_no_delivery: '审批已完成但还没交付包,需要当天交接给财税/工商团队。',
  next_touch: '有下次跟进时间的客户,用于每天复联排班。'
} as Record<FollowFilter, string>)[followFilter.value])
const followFunnelIssues = computed<FollowFunnelIssue[]>(() => {
  const packageContactIds = new Set(deliveryPackages.value.map(item => item.contactId))
  const quoteNoOrder = followRecords.value.filter(item => Number(item.quotedAmount || 0) > 0 && !item.orderNo)
  const orderPending = followRecords.value.filter(item => ['draft', 'pending_approval', 'pending_finance', 'pending_boss'].includes(item.orderStatus || ''))
  const completedNoDelivery = followRecords.value.filter(item => item.orderStatus === 'completed' && !packageContactIds.has(item.contactId))
  const nextTouch = followRecords.value.filter(item => item.nextTouchAt && item.result !== '已成交' && item.result !== '流失')
  const amountOf = (list: PrivateFollowRecord[]) => list.reduce((sum, item) => sum + Number(item.quotedAmount || 0), 0)

  return [
    {
      key: 'quote_no_order',
      filter: 'quote_no_order',
      title: '已报价未提单',
      count: quoteNoOrder.length,
      amount: amountOf(quoteNoOrder),
      level: quoteNoOrder.length > 0 ? 'danger' : 'success',
      statusText: quoteNoOrder.length > 0 ? '易丢单' : '已清空',
      desc: quoteNoOrder.length > 0 ? '客户已经有报价金额,但没有形成提单草稿,需要销售当天补提单。' : '当前没有口头报价停留在表格里。',
      actionText: '筛选未提单'
    },
    {
      key: 'order_pending',
      filter: 'order_pending',
      title: '提单审批中',
      count: orderPending.length,
      amount: amountOf(orderPending),
      level: orderPending.length > 0 ? 'warning' : 'success',
      statusText: orderPending.length > 0 ? '盯审批' : '已清空',
      desc: orderPending.length > 0 ? '提单还在销售、财务或老板审批节点,需要同步收款和客户确认。' : '当前没有卡在审批中的提单。',
      actionText: '筛选审批中'
    },
    {
      key: 'completed_no_delivery',
      filter: 'completed_no_delivery',
      title: '完成待交付',
      count: completedNoDelivery.length,
      amount: amountOf(completedNoDelivery),
      level: completedNoDelivery.length > 0 ? 'danger' : 'success',
      statusText: completedNoDelivery.length > 0 ? '当天建包' : '已闭环',
      desc: completedNoDelivery.length > 0 ? '审批已完成但还没建交付包,工商、财税、地址和回款会断档。' : '审批完成的客户都已进入交付链路。',
      actionText: '筛选待交付'
    },
    {
      key: 'next_touch',
      filter: 'next_touch',
      title: '待复联客户',
      count: nextTouch.length,
      amount: amountOf(nextTouch),
      level: nextTouch.length > 0 ? 'primary' : 'success',
      statusText: nextTouch.length > 0 ? '排班触达' : '无待办',
      desc: nextTouch.length > 0 ? '已有下次跟进时间,用于电销/私域运营当天排班触达。' : '当前没有需要按时间复联的客户。',
      actionText: '筛选待复联'
    }
  ]
})
const followFunnelIssueTotal = computed(() => followFunnelIssues.value.reduce((sum, item) => sum + item.count, 0))
const followFunnelSummary = computed(() => {
  if (followFunnelIssueTotal.value === 0) return '报价、提单、交付和复联当前没有明显卡点。'
  const danger = followFunnelIssues.value.filter(item => item.level === 'danger' && item.count > 0).reduce((sum, item) => sum + item.count, 0)
  if (danger > 0) return `存在 ${danger} 个阻断项,优先处理已报价未提单和完成待交付。`
  return '当前主要是审批和复联排班,销售与运营需要按队列推进。'
})
const filteredFollowRecords = computed(() => {
  const packageContactIds = new Set(deliveryPackages.value.map(item => item.contactId))
  return followRecords.value.filter(item => {
    if (followFilter.value === 'quote_no_order') return Number(item.quotedAmount || 0) > 0 && !item.orderNo
    if (followFilter.value === 'order_pending') return ['draft', 'pending_approval', 'pending_finance', 'pending_boss'].includes(item.orderStatus || '')
    if (followFilter.value === 'completed_no_delivery') return item.orderStatus === 'completed' && !packageContactIds.has(item.contactId)
    if (followFilter.value === 'next_touch') return Boolean(item.nextTouchAt && item.result !== '已成交' && item.result !== '流失')
    return true
  })
})
const taskStats = computed(() => ({
  all: tasks.value.length,
  pending: tasks.value.filter(item => item.status === 'pending').length,
  overdue: tasks.value.filter(item => item.status === 'overdue').length,
  addressStock: tasks.value.filter(item => isAddressStockTask(item)).length,
  supervisor: tasks.value.filter(item => isSupervisorTask(item)).length,
  done: tasks.value.filter(item => item.status === 'done').length
}))
const taskFilterOptions = computed(() => [
  { label: `全部 ${taskStats.value.all}`, value: 'all' },
  { label: `待处理 ${taskStats.value.pending}`, value: 'pending' },
  { label: `已逾期 ${taskStats.value.overdue}`, value: 'overdue' },
  { label: `地址库存 ${taskStats.value.addressStock}`, value: 'address_stock' },
  { label: `主管督办 ${taskStats.value.supervisor}`, value: 'supervisor' },
  { label: `已完成 ${taskStats.value.done}`, value: 'done' }
] as const)
const taskFilterHint = computed(() => ({
  all: '查看所有私域跟进、交付和督办任务。',
  pending: '待处理任务是当天需要推进的执行清单。',
  overdue: '逾期任务需要先确认责任人和补救节点。',
  address_stock: '地址库存任务用于渠道经理补可售量、确认供应商报价和同行账期。',
  supervisor: '主管督办用于承接交付异常和跨部门卡点。',
  done: '已完成任务用于复盘执行闭环。'
} as Record<TaskFilter, string>)[taskFilter.value])
const filteredTasks = computed(() => tasks.value.filter(item => {
  if (taskFilter.value === 'pending') return item.status === 'pending'
  if (taskFilter.value === 'overdue') return item.status === 'overdue'
  if (taskFilter.value === 'address_stock') return isAddressStockTask(item)
  if (taskFilter.value === 'supervisor') return isSupervisorTask(item)
  if (taskFilter.value === 'done') return item.status === 'done'
  return true
}))
const taskSourceSummary = computed(() => {
  const list = filteredTasks.value
  const delivery = list.filter(item => taskDeliveryPackage(item)).length
  const rescue = list.filter(item => isSupervisorTask(item) || isAddressStockTask(item)).length
  const overdue = list.filter(item => item.status === 'overdue').length
  return {
    follow: Math.max(list.length - delivery - rescue, 0),
    delivery,
    rescue,
    overdue
  }
})
const taskGroupSummaries = computed<TaskGroupSummary[]>(() => {
  const groups = new Map<string, TaskGroupSummary>()
  filteredTasks.value.forEach(task => {
    const delivery = taskDeliveryPackage(task)
    const contact = taskContact(task)
    const key = delivery ? `delivery-${delivery.id}` : contact ? `contact-${contact.id}` : `contact-${task.companyName}-${task.contactName}`
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label: delivery ? delivery.packageName : task.companyName,
        desc: delivery ? `${delivery.companyName} · ${delivery.contactName}` : `${task.contactName} · ${task.ownerName}`,
        tasks: [],
        pending: 0,
        overdue: 0,
        done: 0,
        statusLevel: 'primary',
        delivery,
        contact
      })
    }
    groups.get(key)?.tasks.push(task)
  })
  return Array.from(groups.values())
    .map(group => {
      const pending = group.tasks.filter(item => item.status === 'pending').length
      const overdue = group.tasks.filter(item => item.status === 'overdue').length
      const done = group.tasks.filter(item => item.status === 'done').length
      const statusLevel: TaskGroupSummary['statusLevel'] = overdue > 0 ? 'danger' : pending > 0 ? 'warning' : 'success'
      return { ...group, pending, overdue, done, statusLevel }
    })
    .sort((left, right) => {
      if (left.overdue !== right.overdue) return right.overdue - left.overdue
      if (left.pending !== right.pending) return right.pending - left.pending
      return right.tasks.length - left.tasks.length
    })
    .slice(0, 5)
})
const deliveryStats = computed(() => ({
  all: deliveryPackages.value.length,
  totalTasks: deliveryPackages.value.reduce((sum, item) => sum + (item.tasks.length || item.taskIds.length), 0),
  notStarted: deliveryPackages.value.filter(item => item.status === 'created' && deliveryProgress(item) === 0).length,
  inProgress: deliveryPackages.value.filter(item => item.status === 'in_progress').length,
  overdue: deliveryPackages.value.filter(item => deliveryOverdueCount(item) > 0).length,
  addressUnlocked: deliveryPackages.value.filter(item => needsAddressLock(item)).length,
  addressUnbound: deliveryPackages.value.filter(item => needsAddressResourceBinding(item)).length,
  done: deliveryPackages.value.filter(item => item.status === 'done').length,
  pending: deliveryPackages.value.filter(item => item.status !== 'done').length
}))
const todayReviewLevel = computed<TodayReviewCard['level']>(() => {
  if (deliveryStats.value.overdue > 0 || followQueueCounts.value.completed_no_delivery > 0 || followQueueCounts.value.quote_no_order > 0) return 'danger'
  if (taskStats.value.overdue > 0 || deliveryStats.value.addressUnbound > 0 || followQueueCounts.value.order_pending > 0) return 'warning'
  if (contactQuickCounts.value.today_unfollowed > 0 || followQueueCounts.value.next_touch > 0) return 'primary'
  return 'success'
})
const todayReviewStatusText = computed(() => ({
  danger: '先补阻断',
  warning: '盯住卡点',
  primary: '排班推进',
  success: '链路顺畅'
} as Record<TodayReviewCard['level'], string>)[todayReviewLevel.value])
const todayReviewTitle = computed(() => {
  if (deliveryStats.value.overdue > 0) return '今天先稳交付逾期'
  if (followQueueCounts.value.quote_no_order > 0) return '今天先补报价提单'
  if (followQueueCounts.value.completed_no_delivery > 0) return '今天先补交付建包'
  if (followQueueCounts.value.order_pending > 0) return '今天先盯提单审批'
  if (contactQuickCounts.value.today_unfollowed > 0) return '今天先排触达复联'
  return '今天私域链路整体顺畅'
})
const todayReviewDesc = computed(() => {
  if (todayReviewLevel.value === 'danger') return '存在会直接影响成交、交付或客户体验的阻断项,先按下方卡片处理。'
  if (todayReviewLevel.value === 'warning') return '当前主要是审批、地址资源或逾期任务卡点,需要主管和负责人盯节点。'
  if (todayReviewLevel.value === 'primary') return '经营链路没有严重阻断,重点把未触达和待复联客户排进今天节奏。'
  return '客户、跟进、提单和交付当前没有明显异常,可以继续补充导入和内容触达。'
})
const todayReviewCards = computed<TodayReviewCard[]>(() => {
  const funnelBlock = followQueueCounts.value.quote_no_order + followQueueCounts.value.completed_no_delivery
  const deliveryRisk = deliveryStats.value.overdue + deliveryStats.value.addressUnbound
  const executionRisk = taskStats.value.overdue + dailyActions.value.filter(item => item.status === 'blocked').length
  return [
    {
      key: 'contacts',
      title: '客户沉淀',
      value: summary.contactCount,
      desc: `${summary.intentCount} 个高意向,${contactQuickCounts.value.today_unfollowed} 个今天还没触达。`,
      level: contactQuickCounts.value.today_unfollowed > 0 ? 'primary' : 'success',
      statusText: contactQuickCounts.value.today_unfollowed > 0 ? '待触达' : '已触达',
      actionText: '看客户雷达',
      action: 'contacts'
    },
    {
      key: 'funnel',
      title: '报价提单',
      value: followQueueCounts.value.quote_no_order + followQueueCounts.value.order_pending + followQueueCounts.value.completed_no_delivery,
      desc: `未提单 ${followQueueCounts.value.quote_no_order},审批中 ${followQueueCounts.value.order_pending},完成待交付 ${followQueueCounts.value.completed_no_delivery}。`,
      level: funnelBlock > 0 ? 'danger' : followQueueCounts.value.order_pending > 0 ? 'warning' : 'success',
      statusText: funnelBlock > 0 ? '阻断' : followQueueCounts.value.order_pending > 0 ? '审批中' : '顺畅',
      actionText: '看跟进漏斗',
      action: 'follow'
    },
    {
      key: 'delivery',
      title: '交付回款',
      value: deliveryRisk,
      desc: `${deliveryStats.value.overdue} 个交付包逾期,${deliveryStats.value.addressUnbound} 个地址资源待绑 ADR。`,
      level: deliveryStats.value.overdue > 0 ? 'danger' : deliveryStats.value.addressUnbound > 0 ? 'warning' : 'success',
      statusText: deliveryStats.value.overdue > 0 ? '有逾期' : deliveryStats.value.addressUnbound > 0 ? '待绑资源' : '正常',
      actionText: '看交付包',
      action: 'delivery'
    },
    {
      key: 'tasks',
      title: '今日执行',
      value: taskStats.value.pending + taskStats.value.overdue,
      desc: `${taskStats.value.pending} 个待办,${taskStats.value.overdue} 个逾期,${executionRisk} 个执行卡点。`,
      level: executionRisk > 0 ? 'warning' : taskStats.value.pending > 0 ? 'primary' : 'success',
      statusText: executionRisk > 0 ? '需督办' : taskStats.value.pending > 0 ? '待推进' : '已清爽',
      actionText: '看任务队列',
      action: 'tasks'
    }
  ]
})
const addressBindingIssues = computed<AddressBindingIssue[]>(() => deliveryPackages.value
  .filter(item => needsAddressResourceBinding(item))
  .map(delivery => {
    const lock = activeAddressLock(delivery) as PrivateAddressLock
    const inventory = addressInventoryOf(lock)
    const candidates = addressResourceCandidates(lock)
    const top = candidates[0]
    const score = top ? addressResourceMatch(top, inventory).score : 0
    const statusLevel: AddressBindingIssue['statusLevel'] = !top ? 'danger' : score >= 90 ? 'success' : 'warning'
    const statusText = !top ? '无候选' : score >= 90 ? '可直接复核' : '需人工复核'
    const topText = top
      ? `${top.resourceNo} · ${top.district} · ${top.supplierName}`
      : '资源池没有可用候选'
    const reason = !top
      ? '先补录或释放可用地址资源,再回交付包补绑定。'
      : score >= 90
        ? '候选资源与锁定库存同区同供应商,可进详情确认后补绑定。'
        : '候选资源区域或供应商不完全一致,需要交付人工确认。'
    return { delivery, lock, candidateCount: candidates.length, statusText, statusLevel, topText, reason }
  }))
const addressBindingReadyCount = computed(() => addressBindingIssues.value.filter(item => item.statusLevel === 'success').length)
const addressBindingReviewCount = computed(() => addressBindingIssues.value.filter(item => item.statusLevel === 'warning').length)
const addressBindingBlockedCount = computed(() => addressBindingIssues.value.filter(item => item.statusLevel === 'danger').length)
const deliveryFilterOptions = computed(() => [
  { label: `全部 ${deliveryStats.value.all}`, value: 'all' },
  { label: `待启动 ${deliveryStats.value.notStarted}`, value: 'not_started' },
  { label: `进行中 ${deliveryStats.value.inProgress}`, value: 'in_progress' },
  { label: `有逾期 ${deliveryStats.value.overdue}`, value: 'overdue' },
  { label: `待锁地址 ${deliveryStats.value.addressUnlocked}`, value: 'address_unlocked' },
  { label: `待绑资源 ${deliveryStats.value.addressUnbound}`, value: 'address_unbound' },
  { label: `已完成 ${deliveryStats.value.done}`, value: 'done' }
] as const)
const deliveryFilterHint = computed(() => ({
  all: '查看所有成交交付包。',
  not_started: '已创建但任务还没启动的交付包,需要当天确认资料、回款和责任人。',
  in_progress: '已经开始推进的交付包,重点看最晚节点和剩余任务。',
  overdue: '存在逾期任务的交付包,需要主管介入处理。',
  address_unlocked: '地址类业务还没有锁定资源池,需要渠道或交付先确认可售地址。',
  address_unbound: '已经锁定地址但缺少 ADR 资源编号的交付包,需要补绑定资源池。',
  done: '已完成交付包,用于回访、续费和服务质量复盘。'
} as Record<DeliveryFilter, string>)[deliveryFilter.value])
const focusedDeliveryPackage = computed(() => {
  if (!focusedDeliveryPackageId.value) return null
  return deliveryPackages.value.find(item => item.id === focusedDeliveryPackageId.value) || null
})
const filteredDeliveryPackages = computed(() => {
  const items = deliveryPackages.value.filter(item => {
    if (deliveryFilter.value === 'not_started') return item.status === 'created' && deliveryProgress(item) === 0
    if (deliveryFilter.value === 'in_progress') return item.status === 'in_progress'
    if (deliveryFilter.value === 'overdue') return deliveryOverdueCount(item) > 0
    if (deliveryFilter.value === 'address_unlocked') return needsAddressLock(item)
    if (deliveryFilter.value === 'address_unbound') return needsAddressResourceBinding(item)
    if (deliveryFilter.value === 'done') return item.status === 'done'
    return true
  })
  if (!focusedDeliveryPackageId.value) return items
  const focused = items.filter(item => item.id === focusedDeliveryPackageId.value)
  return focused.length ? focused : items
})
const deliveryEmptyTitle = computed(() => {
  if (deliveryStats.value.all === 0) return '还没有可推进的交付包'
  return '当前筛选没有交付包'
})
const deliveryEmptyDesc = computed(() => {
  if (deliveryStats.value.all > 0) return '可以先切回全部交付包,或到成交跟进队列生成新的交付包。'
  if (followQueueCounts.value.completed_no_delivery > 0) {
    return `已有 ${followQueueCounts.value.completed_no_delivery} 条审批完成记录还没建交付包,建议今天先补齐。`
  }
  if (followQueueCounts.value.order_pending > 0) return '已有提单在审批中,审批完成后应当天生成交付包并交接给工商/财税。'
  if (followQueueCounts.value.quote_no_order > 0) return '已有报价记录但还没提单,请先在跟进记录里生成提单。'
  return '先导入或同步私域客户,再完成跟进、提单、审批和交付包流转。'
})
const stageOptions: Array<{ label: string; value: PrivateStage }> = [
  { label: '新触点', value: 'new' },
  { label: '培育中', value: 'nurturing' },
  { label: '有意向', value: 'intent' },
  { label: '已报价', value: 'quoted' },
  { label: '已成交', value: 'ordered' },
  { label: '沉默', value: 'silent' }
]

type ContactActionKey = 'verify' | 'follow_record' | 'follow_task' | 'order_draft' | 'follow_queue' | 'delivery' | 'delivery_tab' | 'online_lead' | 'mark_intent'
type DeliveryTimelineType = 'address' | 'follow' | 'task'
type DeliveryChecklistStatus = 'done' | 'todo' | 'risk'
type DeliveryArchiveAction = 'order' | 'contact' | 'task' | 'address' | 'review'

interface ContactActionItem {
  key: ContactActionKey
  label: string
  primary?: boolean
}

interface ContactDutyItem {
  role: string
  ownerName: string
  statusText: string
  statusType: 'success' | 'warning' | 'info' | 'danger' | 'primary'
  desc: string
  action: string
  actionLabel: string
  actionKey: ContactActionKey
  actionPrimary?: boolean
}

interface ContactEvidenceItem {
  key: string
  label: string
  status: DeliveryChecklistStatus
  statusText: string
  desc: string
  actionLabel: string
  actionKey: ContactActionKey
}

interface ContactMustHandleItem {
  key: string
  contact: PrivateContact
  level: 'danger' | 'warning' | 'primary' | 'success' | 'info'
  reason: string
  title: string
  desc: string
  ownerName: string
  actionLabel: string
  actionKey: ContactActionKey
  sort: number
}

interface DeliveryChecklistItem {
  key: string
  label: string
  status: DeliveryChecklistStatus
  statusText: string
  desc: string
}

interface DeliveryArchiveItem {
  key: string
  label: string
  status: DeliveryChecklistStatus
  statusText: string
  desc: string
  actionText: string
  action: DeliveryArchiveAction
}

const contactTimelineTypeOrder: PrivateTimelineType[] = ['verify', 'follow', 'task', 'delivery', 'contact']
const contactTimelineTypeMeta: Record<PrivateTimelineType, { label: string; desc: string }> = {
  verify: { label: '工商核验', desc: '主体、撞单和税务资质' },
  follow: { label: '跟进报价', desc: '触达、报价、提单和成交' },
  task: { label: '待办任务', desc: '跟进、督办和补救动作' },
  delivery: { label: '交付流转', desc: '交付包、任务和最晚节点' },
  contact: { label: '客户入库', desc: '来源触点和原始需求' }
}
const deliveryTimelineTypeOrder: DeliveryTimelineType[] = ['address', 'task', 'follow']
const deliveryTimelineTypeMeta: Record<DeliveryTimelineType, { label: string; desc: string }> = {
  address: { label: '地址资源', desc: '库存锁定和 ADR 绑定' },
  task: { label: '交付任务', desc: '工商、财税和督办节点' },
  follow: { label: '客户跟进', desc: '报价、收款和客户沟通' }
}

function todayText() {
  const d = new Date()
  return `${d.getFullYear()}-${padTime(d.getMonth() + 1)}-${padTime(d.getDate())}`
}

function isTodayUnfollowed(row: PrivateContact) {
  return !row.lastTouchAt || row.lastTouchAt.slice(0, 10) !== todayText()
}

function isIntentContact(row: PrivateContact) {
  return row.score >= 80 || ['intent', 'quoted', 'ordered'].includes(row.stage)
}

function isUnverifiedContact(row: PrivateContact) {
  return !row.verification?.matched
}

function hasOpenFollowTask(row: PrivateContact) {
  return tasks.value.some(task => {
    if (task.companyName !== row.companyName || task.contactName !== row.name) return false
    if (task.status === 'done') return false
    return task.action.includes('CRM 跟进') || task.action.includes('触达') || task.title === row.nextAction
  })
}

function contactFollowRecords(row: PrivateContact) {
  return followRecords.value
    .filter(item => item.contactId === row.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function contactFollowCount(row: PrivateContact) {
  return contactFollowRecords(row).length || row.touchCount || 0
}

function contactLatestFollowText(row: PrivateContact) {
  const latest = contactFollowRecords(row)[0]
  return latest ? `${latest.createdAt} · ${latest.result}` : '暂无跟进记录'
}

function contactQueueText(row: PrivateContact) {
  if (isUnverifiedContact(row)) return '待工商核验'
  if (isTodayUnfollowed(row)) return '今日未跟进'
  if (isIntentContact(row)) return '高意向优先'
  return stageText(row.stage)
}

function contactQueueHint(row: PrivateContact) {
  if (isUnverifiedContact(row)) return '先核公司主体,再报价和提单'
  if (isTodayUnfollowed(row)) return '今天还没有触达,应进入复联排班'
  if (isIntentContact(row)) return '优先记录跟进、报价或发起提单'
  return row.nextAction || '按阶段继续推进'
}

function contactConversionText(row: PrivateContact) {
  if (hasDeliveryPackage(row.id)) return '已建交付包'
  if (row.convertedLeadId) return `已入库线索 #${row.convertedLeadId}`
  if (row.stage === 'ordered') return '待建交付包'
  return '跟进中'
}

function contactConversionHint(row: PrivateContact) {
  if (hasDeliveryPackage(row.id)) return '成交后交付链路已建立'
  if (row.convertedLeadId) return '已进入网销线索池,继续盯提单'
  if (row.stage === 'ordered') return '成交客户需当天建交付包'
  return '还在私域培育或报价阶段'
}

function contactLatestDealRecord(row: PrivateContact) {
  return contactFollowRecords(row).find(item => canCreateOrderDraft(item))
}

function contactActionStage(row: PrivateContact) {
  if (hasDeliveryPackage(row.id)) return '已闭环'
  if (isUnverifiedContact(row)) return '先核验'
  const record = contactLatestDealRecord(row)
  if (record?.orderStatus === 'completed') return '待交付'
  if (record?.orderNo) return '盯审批'
  if (record && !record.orderNo) return '待提单'
  if (row.stage === 'ordered') return '待建包'
  if (row.stage === 'quoted') return '待提单'
  if (isIntentContact(row)) return '待报价'
  if (isTodayUnfollowed(row)) return '待复联'
  return '持续培育'
}

function contactActionTitle(row: PrivateContact) {
  if (hasDeliveryPackage(row.id)) return '交付包已建立,下一步盯任务和回访'
  if (isUnverifiedContact(row)) return '先完成工商核验,再推进报价或提单'
  const record = contactLatestDealRecord(row)
  if (record?.orderStatus === 'completed') return '审批已完成,今天补建交付包'
  if (record?.orderNo) return '提单已生成,继续盯审批和收款'
  if (record && !record.orderNo) return '已有报价/成交记录,优先生成提单草稿'
  if (row.stage === 'ordered') return '客户已成交,先补交付包防止掉单'
  if (row.stage === 'quoted') return '已报价未提单,需要锁定下一步付款或审批'
  if (isIntentContact(row)) return '高意向客户要当天报价并记录结果'
  if (isTodayUnfollowed(row)) return '今天还没触达,先生成跟进任务'
  return '继续培育,保持触达节奏'
}

function contactActionDesc(row: PrivateContact) {
  const record = contactLatestDealRecord(row)
  if (hasDeliveryPackage(row.id)) return '该客户已进入交付链路,重点检查任务是否逾期、地址资源是否锁定、是否需要主管督办。'
  if (isUnverifiedContact(row)) return '公司主体未核准时,报价、归属和撞单判断都不稳定,建议先点底部“工商核验”。'
  if (record?.orderStatus === 'completed') return `提单 ${record.orderNo || ''} 已审批完成,应当天点击底部“生成交付包”交给工商/财税团队。`
  if (record?.orderNo) return `提单 ${record.orderNo} 已生成,当前状态为${orderStatusText(record.orderStatus)},请销售盯审批、财务确认收款。`
  if (record && !record.orderNo) return `最近记录为${record.result},报价¥${formatMoney(record.quotedAmount)},请到跟进记录里生成提单草稿。`
  if (row.stage === 'ordered') return '客户阶段已成交但还没有交付包,先补交付包,再由交付团队拆任务。'
  if (row.stage === 'quoted') return '已报价客户如果没有形成提单,很容易停在口头沟通,建议补一条跟进并生成提单。'
  if (isIntentContact(row)) return '评分或阶段已进入高意向,建议记录一次报价跟进,同步预计金额和下次触达时间。'
  if (isTodayUnfollowed(row)) return '今天没有互动记录,建议先生成跟进任务或记录一次企微/电话触达。'
  return '暂不强推提单,按客户需求持续补内容、发案例、约下次触达。'
}

function contactActionItems(row: PrivateContact): ContactActionItem[] {
  const record = contactLatestDealRecord(row)
  if (hasDeliveryPackage(row.id)) {
    return [
      { label: '看交付包', key: 'delivery_tab', primary: true },
      { label: '查逾期任务', key: 'delivery_tab' },
      { label: '安排回访', key: 'follow_task' }
    ]
  }
  if (isUnverifiedContact(row)) {
    return [
      { label: '工商核验', key: 'verify', primary: true },
      { label: '确认主体', key: 'verify' },
      { label: '再报价', key: 'follow_record' }
    ]
  }
  if (record?.orderStatus === 'completed' || row.stage === 'ordered') {
    return [
      { label: '生成交付包', key: 'delivery', primary: true },
      { label: '分配责任人', key: 'delivery' },
      { label: '同步财税/工商', key: 'delivery_tab' }
    ]
  }
  if (record?.orderNo) {
    return [
      { label: '盯审批', key: 'follow_queue', primary: true },
      { label: '确认收款', key: 'follow_queue' },
      { label: '审批后建包', key: 'delivery' }
    ]
  }
  if ((record && !record.orderNo) || row.stage === 'quoted') {
    return [
      { label: '生成提单', key: 'order_draft', primary: true },
      { label: '盯审批', key: 'follow_queue' },
      { label: '收款确认', key: 'follow_queue' }
    ]
  }
  if (isIntentContact(row)) {
    return [
      { label: '记录报价', key: 'follow_record', primary: true },
      { label: '约下次触达', key: 'follow_task' },
      { label: '必要时入库线索', key: 'online_lead' }
    ]
  }
  if (isTodayUnfollowed(row)) {
    return [
      { label: '生成跟进任务', key: 'follow_task', primary: true },
      { label: '电话/企微触达', key: 'follow_record' },
      { label: '更新下一动作', key: 'follow_record' }
    ]
  }
  return [
    { label: '持续培育', key: 'follow_task', primary: true },
    { label: '发案例内容', key: 'follow_record' },
    { label: '保持复联', key: 'follow_task' }
  ]
}

function contactDeliveryPackage(row: PrivateContact) {
  return deliveryPackages.value.find(item => item.contactId === row.id)
}

function contactOpenTasks(row: PrivateContact) {
  return tasks.value.filter(task => {
    if (task.companyName !== row.companyName || task.contactName !== row.name) return false
    return task.status !== 'done'
  })
}

function contactMustHandleItem(row: PrivateContact): ContactMustHandleItem | null {
  const record = contactLatestDealRecord(row)
  const delivery = contactDeliveryPackage(row)
  const overdueCount = delivery ? deliveryOverdueCount(delivery) : 0
  const ownerName = row.ownerName || '待分配'

  if (delivery && overdueCount > 0) {
    return {
      key: `delivery-overdue-${row.id}`,
      contact: row,
      level: 'danger',
      reason: '交付逾期',
      title: `${delivery.packageName} 有 ${overdueCount} 个逾期任务`,
      desc: '先确认交付负责人、补救节点和客户同步口径。',
      ownerName: delivery.ownerName || ownerName,
      actionLabel: '看交付包',
      actionKey: 'delivery_tab',
      sort: 100
    }
  }

  if ((row.stage === 'ordered' || record?.orderStatus === 'completed') && !delivery) {
    return {
      key: `delivery-missing-${row.id}`,
      contact: row,
      level: 'danger',
      reason: '成交待交付',
      title: '成交/审批完成但还没有交付包',
      desc: '当天补建交付包,把工商、财税、地址和财务责任拆出来。',
      ownerName,
      actionLabel: '生成交付包',
      actionKey: 'delivery',
      sort: 95
    }
  }

  if (isUnverifiedContact(row)) {
    return {
      key: `verify-${row.id}`,
      contact: row,
      level: 'warning',
      reason: '待工商核验',
      title: '公司主体未核准',
      desc: '先核企业状态、税务资质和撞单风险,再报价/提单。',
      ownerName,
      actionLabel: '去核验',
      actionKey: 'verify',
      sort: 85
    }
  }

  if (isTodayUnfollowed(row)) {
    return {
      key: `touch-${row.id}`,
      contact: row,
      level: 'warning',
      reason: '今日未触达',
      title: '今天还没有跟进留痕',
      desc: '先安排电话/企微触达,把客户反馈和下次动作补进系统。',
      ownerName,
      actionLabel: hasOpenFollowTask(row) ? '记录跟进' : '建任务',
      actionKey: hasOpenFollowTask(row) ? 'follow_record' : 'follow_task',
      sort: 75
    }
  }

  if (record?.orderNo && record.orderStatus !== 'completed') {
    return {
      key: `order-${row.id}`,
      contact: row,
      level: 'primary',
      reason: '提单审批中',
      title: `${record.orderNo} ${orderStatusText(record.orderStatus)}`,
      desc: '销售继续盯审批、财务收款和客户确认,避免提单卡住。',
      ownerName,
      actionLabel: '看审批队列',
      actionKey: 'follow_queue',
      sort: 70
    }
  }

  if (isIntentContact(row) && !delivery) {
    return {
      key: `intent-${row.id}`,
      contact: row,
      level: 'primary',
      reason: '高意向',
      title: '高意向客户需要当天报价',
      desc: `评分 ${row.score},预计商机 ¥${formatMoney(row.estimatedAmount)},建议补报价和下次触达。`,
      ownerName,
      actionLabel: '记录报价',
      actionKey: 'follow_record',
      sort: 60
    }
  }

  return null
}

function contactDutyItems(row: PrivateContact): ContactDutyItem[] {
  const record = contactLatestDealRecord(row)
  const delivery = contactDeliveryPackage(row)
  const openTaskCount = contactOpenTasks(row).length
  const deliveryOverdue = delivery ? deliveryOverdueCount(delivery) : 0
  const salesOwner = row.ownerName || '待分配销售'
  const deliveryOwner = delivery?.ownerName || (row.stage === 'ordered' ? '待分配交付' : '成交后自动分配')
  const financeOwner = record?.orderNo || delivery ? '财务核对' : '成交后介入'

  const opsDuty: ContactDutyItem = {
    role: '私域运营',
    ownerName: row.ownerName || '待分配运营',
    statusText: isUnverifiedContact(row) ? '待核验' : isTodayUnfollowed(row) ? '待触达' : '已留痕',
    statusType: isUnverifiedContact(row) || isTodayUnfollowed(row) ? 'warning' : 'success',
    desc: isUnverifiedContact(row) ? '先核准公司主体、税务资质和撞单风险,再交给销售报价。' : '负责企微/社群/朋友圈触达留痕,把客户需求和下一动作写清楚。',
    action: contactQueueHint(row),
    actionLabel: isUnverifiedContact(row) ? '去核验' : isTodayUnfollowed(row) ? '建跟进任务' : '补跟进',
    actionKey: isUnverifiedContact(row) ? 'verify' : isTodayUnfollowed(row) ? 'follow_task' : 'follow_record',
    actionPrimary: isUnverifiedContact(row) || isTodayUnfollowed(row)
  }

  let salesDuty: ContactDutyItem
  if (record?.orderNo) {
    salesDuty = {
      role: '销售顾问',
      ownerName: salesOwner,
      statusText: orderStatusText(record.orderStatus),
      statusType: orderStatusTag(record.orderStatus),
      desc: `已生成提单 ${record.orderNo},销售继续盯审批、收款反馈和客户确认。`,
      action: '审批未完成前,每天同步客户和内部节点。',
      actionLabel: '看跟进队列',
      actionKey: 'follow_queue',
      actionPrimary: true
    }
  } else if (record || row.stage === 'quoted') {
    salesDuty = {
      role: '销售顾问',
      ownerName: salesOwner,
      statusText: '待提单',
      statusType: 'warning',
      desc: '已有报价或成交沟通,不要停在口头承诺,应补齐提单和审批证据。',
      action: record ? `最近报价 ¥${formatMoney(record.quotedAmount)}` : '补成交金额、服务项和付款要求。',
      actionLabel: '生成提单',
      actionKey: 'order_draft',
      actionPrimary: true
    }
  } else if (row.stage === 'ordered') {
    salesDuty = {
      role: '销售顾问',
      ownerName: salesOwner,
      statusText: '已成交',
      statusType: 'success',
      desc: '客户已成交,销售需要把合同、付款节点和服务范围交清楚。',
      action: '成交当天交给交付团队拆任务。',
      actionLabel: '生成交付包',
      actionKey: 'delivery',
      actionPrimary: true
    }
  } else if (isIntentContact(row)) {
    salesDuty = {
      role: '销售顾问',
      ownerName: salesOwner,
      statusText: '待报价',
      statusType: 'warning',
      desc: '客户已进入高意向,销售需要当天明确报价、服务包和付款方式。',
      action: `预计商机 ¥${formatMoney(row.estimatedAmount)}`,
      actionLabel: '记录报价',
      actionKey: 'follow_record',
      actionPrimary: true
    }
  } else {
    salesDuty = {
      role: '销售顾问',
      ownerName: salesOwner,
      statusText: '培育中',
      statusType: 'info',
      desc: '客户还未到销售强推进阶段,先由运营保持内容触达和需求确认。',
      action: row.nextAction || '持续补需求和案例内容。',
      actionLabel: '建跟进任务',
      actionKey: 'follow_task'
    }
  }

  const deliveryDuty: ContactDutyItem = delivery ? {
    role: '交付负责人',
    ownerName: deliveryOwner,
    statusText: deliveryOverdue > 0 ? `${deliveryOverdue} 个逾期` : deliveryStatusText(delivery.status),
    statusType: deliveryOverdue > 0 ? 'danger' : deliveryProgress(delivery) >= 100 ? 'success' : 'primary',
    desc: `已建 ${delivery.packageName},当前 ${deliveryDoneCount(delivery)}/${delivery.tasks.length} 个任务完成。`,
    action: deliveryRiskText(delivery),
    actionLabel: '看交付包',
    actionKey: 'delivery_tab',
    actionPrimary: true
  } : {
    role: '交付负责人',
    ownerName: deliveryOwner,
    statusText: row.stage === 'ordered' || record?.orderStatus === 'completed' ? '待建包' : '待接入',
    statusType: row.stage === 'ordered' || record?.orderStatus === 'completed' ? 'danger' : 'info',
    desc: row.stage === 'ordered' || record?.orderStatus === 'completed' ? '成交或审批完成后当天必须建交付包,否则销售和交付会断档。' : '客户未成交前先不拆交付任务,但要提前确认是否涉及地址、代账、异常解除。',
    action: openTaskCount > 0 ? `当前还有 ${openTaskCount} 个未完成任务。` : '成交后自动分配工商/财税/地址任务。',
    actionLabel: row.stage === 'ordered' || record?.orderStatus === 'completed' ? '生成交付包' : '看交付队列',
    actionKey: row.stage === 'ordered' || record?.orderStatus === 'completed' ? 'delivery' : 'delivery_tab',
    actionPrimary: row.stage === 'ordered' || record?.orderStatus === 'completed'
  }

  const financeDuty: ContactDutyItem = record?.orderNo ? {
    role: '财务核对',
    ownerName: financeOwner,
    statusText: orderStatusText(record.orderStatus),
    statusType: orderStatusTag(record.orderStatus),
    desc: '负责核对收款、合同、发票主体和审批凭证,审批完成后通知交付建包。',
    action: record.orderStatus === 'completed' ? '审批完成,需确认是否已建交付包。' : '继续盯财务/老板审批节点。',
    actionLabel: '看审批队列',
    actionKey: 'follow_queue',
    actionPrimary: record.orderStatus !== 'completed'
  } : delivery ? {
    role: '财务核对',
    ownerName: financeOwner,
    statusText: '回款核对',
    statusType: 'warning',
    desc: '交付推进时同步核对回款、合同、资料归档和后续续费提醒。',
    action: delivery.paymentTimeReq || '先核对回款/合同/资料。',
    actionLabel: '记录回访',
    actionKey: 'follow_record'
  } : {
    role: '财务核对',
    ownerName: financeOwner,
    statusText: '待介入',
    statusType: 'info',
    desc: '成交前不用财务强介入,但报价时要明确收款方式、开票主体和账期。',
    action: '成交后进入提单审批和收款核对。',
    actionLabel: '补跟进',
    actionKey: 'follow_record'
  }

  return [opsDuty, salesDuty, deliveryDuty, financeDuty]
}

function contactEvidenceTag(status: DeliveryChecklistStatus): 'success' | 'warning' | 'danger' {
  return ({ done: 'success', todo: 'warning', risk: 'danger' } as Record<DeliveryChecklistStatus, 'success' | 'warning' | 'danger'>)[status]
}

function contactEvidenceSummary(row: PrivateContact) {
  const items = contactEvidenceItems(row)
  const done = items.filter(item => item.status === 'done').length
  const risk = items.filter(item => item.status === 'risk').length
  const todo = items.filter(item => item.status === 'todo').length
  return {
    title: `资料完整度 ${done}/${items.length}`,
    hint: risk > 0 ? `还有 ${risk} 个阻断项,先补齐再推进提单/交付。` : todo > 0 ? `还有 ${todo} 个待确认项,适合今天安排责任人补证据。` : '主体、报价、提单、交付和回款证据已基本闭环。',
    percent: items.length ? Math.round(done / items.length * 100) : 0,
    status: risk > 0 ? 'exception' : todo > 0 ? 'warning' : 'success'
  } as { title: string; hint: string; percent: number; status: 'success' | 'exception' | 'warning' }
}

function contactEvidenceItems(row: PrivateContact): ContactEvidenceItem[] {
  const delivery = contactDeliveryPackage(row)
  const record = contactLatestDealRecord(row)
  const latestFollow = contactFollowRecords(row)[0]
  const hasVerifiedCompany = Boolean(row.verification?.matched || row.creditCode || row.entityId)
  const hasContactInfo = Boolean(row.name && row.phone)
  const hasDemandInfo = Boolean(row.demand && row.serviceLine && row.estimatedAmount > 0)
  const hasQuotedEvidence = Boolean(record?.quotedAmount || latestFollow?.quotedAmount || row.stage === 'quoted' || row.stage === 'ordered')
  const hasOrder = Boolean(record?.orderNo || delivery?.orderNo)
  const orderCompleted = record?.orderStatus === 'completed' || delivery?.orderStatus === 'completed'
  const deliveryOverdue = delivery ? deliveryOverdueCount(delivery) : 0
  const deliveryDone = delivery ? deliveryDoneCount(delivery) : 0
  const deliveryTotal = delivery ? (delivery.tasks.length || delivery.taskIds.length) : 0

  return [
    {
      key: 'company',
      label: '公司主体',
      status: hasVerifiedCompany ? 'done' : 'risk',
      statusText: hasVerifiedCompany ? '已核验' : '待核验',
      desc: hasVerifiedCompany
        ? `${row.verification?.entityName || row.companyName} · ${row.creditCode || row.verification?.creditCode || '主体已挂接'}`
        : '缺少工商核验结果,撞单、税务资质和报价归属都不稳定。',
      actionLabel: hasVerifiedCompany ? '复查工商' : '去工商核验',
      actionKey: 'verify'
    },
    {
      key: 'contact',
      label: '联系人资料',
      status: hasContactInfo ? 'done' : 'risk',
      statusText: hasContactInfo ? '已具备' : '缺资料',
      desc: hasContactInfo ? `${row.name} · ${row.phone} · ${row.source}` : '联系人、手机号或来源触点缺失,后续跟进无法追责。',
      actionLabel: '补跟进资料',
      actionKey: 'follow_record'
    },
    {
      key: 'demand',
      label: '需求与预算',
      status: hasDemandInfo ? 'done' : isIntentContact(row) ? 'todo' : 'risk',
      statusText: hasDemandInfo ? '已明确' : isIntentContact(row) ? '待补齐' : '不清晰',
      desc: hasDemandInfo ? `${row.serviceLine} · 预计¥${formatMoney(row.estimatedAmount)} · ${row.demand}` : '缺需求、服务线或预算金额,销售无法形成可审批报价。',
      actionLabel: '记录需求',
      actionKey: 'follow_record'
    },
    {
      key: 'quote',
      label: '跟进报价',
      status: hasQuotedEvidence ? 'done' : isIntentContact(row) ? 'todo' : 'risk',
      statusText: hasQuotedEvidence ? '有报价' : isIntentContact(row) ? '待报价' : '无证据',
      desc: hasQuotedEvidence
        ? `${record?.createdAt || latestFollow?.createdAt || row.lastTouchAt} · 报价¥${formatMoney(record?.quotedAmount || latestFollow?.quotedAmount || row.estimatedAmount)}`
        : '没有报价/成交跟进记录,后面提单、审批和回款都缺起点。',
      actionLabel: hasQuotedEvidence ? '补充跟进' : '记录报价',
      actionKey: 'follow_record'
    },
    {
      key: 'order',
      label: '提单审批',
      status: orderCompleted ? 'done' : hasOrder ? 'todo' : row.stage === 'ordered' || row.stage === 'quoted' ? 'risk' : 'todo',
      statusText: orderCompleted ? '已完成' : hasOrder ? orderStatusText(record?.orderStatus || delivery?.orderStatus) : '未提单',
      desc: hasOrder
        ? `${record?.orderNo || delivery?.orderNo} · ${orderStatusText(record?.orderStatus || delivery?.orderStatus)}`
        : row.stage === 'ordered' || row.stage === 'quoted'
          ? '已报价/成交但没有提单,审批、合同、回款证据会断档。'
          : '暂未进入提单阶段,报价后要当天生成提单草稿。',
      actionLabel: hasOrder ? '看审批队列' : '生成提单',
      actionKey: hasOrder ? 'follow_queue' : 'order_draft'
    },
    {
      key: 'delivery',
      label: '交付回款',
      status: delivery ? deliveryOverdue > 0 ? 'risk' : deliveryProgress(delivery) >= 100 ? 'done' : 'todo' : row.stage === 'ordered' || orderCompleted ? 'risk' : 'todo',
      statusText: delivery ? deliveryOverdue > 0 ? `${deliveryOverdue} 个逾期` : deliveryStatusText(delivery.status) : '未建包',
      desc: delivery
        ? `${delivery.packageName} · ${deliveryDone}/${deliveryTotal} 个任务完成 · ${delivery.paymentTimeReq || '待补回款要求'}`
        : row.stage === 'ordered' || orderCompleted
          ? '成交或审批完成后还没有交付包,工商、财税、地址和回款无法闭环。'
          : '客户成交后自动拆成交付包,同步合同、资料、回款和回访。',
      actionLabel: delivery ? '看交付包' : '生成交付包',
      actionKey: delivery ? 'delivery_tab' : 'delivery'
    }
  ]
}

function contactRowActions(row: PrivateContact): ContactActionItem[] {
  const deduped: ContactActionItem[] = []
  contactActionItems(row).forEach(item => {
    if (deduped.some(action => action.key === item.key)) return
    deduped.push(item)
  })
  if (!isIntentContact(row) && row.stage !== 'ordered') {
    deduped.push({ label: '标记意向', key: 'mark_intent' })
  }
  return deduped.slice(0, 3)
}

function contactActionLevel(row: PrivateContact) {
  if (isUnverifiedContact(row) || isTodayUnfollowed(row)) return 'warning'
  if (hasDeliveryPackage(row.id)) return 'success'
  if (row.stage === 'ordered' || contactLatestDealRecord(row)?.orderStatus === 'completed') return 'danger'
  if (isIntentContact(row)) return 'primary'
  return 'info'
}

function contactActionTag(row: PrivateContact) {
  const level = contactActionLevel(row)
  if (level === 'danger') return 'danger'
  if (level === 'success') return 'success'
  if (level === 'warning') return 'warning'
  if (level === 'primary') return 'primary'
  return 'info'
}

function contactActionButtonType(_row: PrivateContact, item: ContactActionItem) {
  if (item.primary) return 'primary'
  if (item.key === 'delivery' || item.key === 'delivery_tab') return 'success'
  if (item.key === 'verify' || item.key === 'order_draft' || item.key === 'follow_queue') return 'warning'
  if (item.key === 'mark_intent') return 'warning'
  return 'primary'
}

function contactActionButtonLoading(row: PrivateContact, key: ContactActionKey) {
  if (key === 'verify') return isVerifying(row.id)
  if (key === 'delivery') return isCreatingDelivery(row.id)
  if (key === 'online_lead') return isConverting(row.id)
  return false
}

function contactActionButtonDisabled(row: PrivateContact, key: ContactActionKey) {
  if (key === 'online_lead') return !!row.convertedLeadId || isConverting(row.id)
  if (key === 'verify') return isVerifying(row.id)
  if (key === 'delivery') return isCreatingDelivery(row.id)
  return false
}

async function handleContactActionItem(row: PrivateContact, key: ContactActionKey) {
  if (key === 'verify') {
    await verifyContact(row)
    return
  }
  if (key === 'follow_record') {
    openFollowDialog(row)
    return
  }
  if (key === 'follow_task') {
    await createFollowTask(row)
    return
  }
  if (key === 'online_lead') {
    await convertLead(row)
    return
  }
  if (key === 'delivery') {
    await createDeliveryPackage(row)
    return
  }
  if (key === 'mark_intent') {
    await markIntent(row)
    return
  }
  if (key === 'delivery_tab') {
    focusContactDelivery(row)
    return
  }
  if (key === 'order_draft') {
    const record = contactLatestDealRecord(row)
    if (record && !record.orderNo) {
      await createOrderDraft(record)
      return
    }
    drawer.visible = false
    activeTab.value = 'follow'
    followFilter.value = 'quote_no_order'
    scrollPrivateTabsIntoView()
    ElMessage.info('请先在跟进记录里补一条已报价记录,再生成提单草稿。')
    return
  }
  if (key === 'follow_queue') {
    const record = contactLatestDealRecord(row)
    drawer.visible = false
    activeTab.value = 'follow'
    followFilter.value = record?.orderStatus === 'completed' ? 'completed_no_delivery' : record?.orderNo ? 'order_pending' : 'quote_no_order'
    scrollPrivateTabsIntoView()
    ElMessage.info('已切到对应跟进队列,请继续盯审批、收款和提单状态。')
  }
}

function focusContactDelivery(row: PrivateContact) {
  const target = deliveryPackages.value.find(item => item.contactId === row.id)
  if (!target) {
    activeTab.value = 'delivery'
    deliveryFilter.value = 'all'
    drawer.visible = false
    scrollPrivateTabsIntoView()
    ElMessage.info('该客户还没有交付包,可以先点击“生成交付包”。')
    return
  }
  drawer.visible = false
  activeTab.value = 'delivery'
  deliveryFilter.value = 'all'
  focusedDeliveryPackageId.value = target.id
  scrollPrivateTabsIntoView()
  nextTick(() => openDeliveryPackage(target))
}

function formatMoney(value: number) {
  return Number(value || 0).toLocaleString('zh-CN')
}

function stageText(stage: PrivateStage) {
  return ({ new: '新触点', nurturing: '培育中', intent: '有意向', quoted: '已报价', ordered: '已成交', silent: '沉默' } as Record<PrivateStage, string>)[stage]
}

function stageTag(stage: PrivateStage): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  return ({ new: 'info', nurturing: 'primary', intent: 'warning', quoted: 'warning', ordered: 'success', silent: 'danger' } as Record<PrivateStage, any>)[stage]
}

function integrationText(status: IntegrationStatus) {
  return ({ connected: '已接入', pending: '待授权', blocked: '需处理' } as Record<IntegrationStatus, string>)[status]
}

function integrationTag(status: IntegrationStatus): 'success' | 'warning' | 'danger' {
  return ({ connected: 'success', pending: 'warning', blocked: 'danger' } as Record<IntegrationStatus, any>)[status]
}

function opsCheckText(status: OpsCheckStatus) {
  return ({ ready: '已可用', partial: '需补齐', missing: '未建设' } as Record<OpsCheckStatus, string>)[status]
}

function opsCheckTag(status: OpsCheckStatus): 'success' | 'warning' | 'danger' {
  return ({ ready: 'success', partial: 'warning', missing: 'danger' } as Record<OpsCheckStatus, any>)[status]
}

function dailyStatusText(status: DailyActionStatus) {
  return ({ todo: '待处理', doing: '进行中', blocked: '卡点', done: '已完成' } as Record<DailyActionStatus, string>)[status]
}

function dailyStatusTag(status: DailyActionStatus): 'info' | 'primary' | 'warning' | 'danger' | 'success' {
  return ({ todo: 'info', doing: 'primary', blocked: 'danger', done: 'success' } as Record<DailyActionStatus, any>)[status]
}

function contentStatusText(status: PrivateContent['status']) {
  return ({ draft: '草稿', scheduled: '待发布', published: '已发布' } as Record<PrivateContent['status'], string>)[status]
}

function contentStatusTag(status: PrivateContent['status']) {
  return ({ draft: 'info', scheduled: 'warning', published: 'success' } as Record<PrivateContent['status'], any>)[status]
}

function followFunnelIssueTag(level: FollowFunnelIssue['level']) {
  return level
}

function todayReviewLevelTag(level: TodayReviewCard['level']) {
  return level
}

function taskStatusText(status: PrivateTaskStatus) {
  return ({ pending: '待处理', done: '已完成', overdue: '已逾期' } as Record<PrivateTaskStatus, string>)[status]
}

function taskStatusTag(status: PrivateTaskStatus) {
  return ({ pending: 'warning', done: 'success', overdue: 'danger' } as Record<PrivateTaskStatus, any>)[status]
}

function taskContact(row: PrivateTask) {
  return contacts.value.find(item => item.companyName === row.companyName && item.name === row.contactName)
    || contacts.value.find(item => item.companyName === row.companyName)
}

function taskDeliveryPackage(row: PrivateTask) {
  return deliveryPackages.value.find(item => item.taskIds.includes(row.id) || item.tasks.some(task => task.id === row.id))
}

function taskSourceText(row: PrivateTask) {
  const pkg = taskDeliveryPackage(row)
  if (pkg) return `交付包 · ${pkg.serviceLine}`
  if (isAddressStockTask(row)) return '地址库存补货'
  if (isSupervisorTask(row)) return '主管督办'
  return '客户跟进'
}

function taskSourceTag(row: PrivateTask) {
  if (taskDeliveryPackage(row)) return 'primary'
  if (isAddressStockTask(row)) return 'success'
  if (isSupervisorTask(row)) return 'warning'
  return 'info'
}

function taskDeliveryPackageText(row: PrivateTask) {
  const pkg = taskDeliveryPackage(row)
  if (!pkg) return ''
  return pkg.orderNo || pkg.packageName || '查看交付包'
}

function openTaskContact(row: PrivateTask) {
  const contact = taskContact(row)
  if (!contact) {
    ElMessage.warning('未找到关联私域客户,请刷新后重试')
    return
  }
  openContact(contact)
}

function openDeliveryFromTask(row: PrivateTask) {
  const pkg = taskDeliveryPackage(row)
  if (!pkg) {
    ElMessage.warning('未找到关联交付包,请刷新后重试')
    return
  }
  openDeliveryPackage(pkg)
}

function taskGroupStatusText(group: TaskGroupSummary) {
  if (group.overdue > 0) return `${group.overdue} 个逾期`
  if (group.pending > 0) return `${group.pending} 个待处理`
  return '已闭环'
}

function focusTaskGroup(group: TaskGroupSummary) {
  if (group.delivery) {
    openDeliveryPackage(group.delivery)
    return
  }
  if (group.contact) {
    openContact(group.contact)
    return
  }
  ElMessage.warning('未找到关联客户或交付包,请刷新后重试')
}

function taskOpenItemsAfterUpdate(row: PrivateTask, delivery?: PrivateDeliveryPackage) {
  if (delivery) {
    const currentDelivery = deliveryPackages.value.find(item => item.id === delivery.id)
    if (currentDelivery) return currentDelivery.tasks.filter(item => item.status !== 'done')
  }
  return tasks.value.filter(item => item.companyName === row.companyName && item.contactName === row.contactName && item.status !== 'done')
}

function taskReviewSubject(row: PrivateTask, delivery?: PrivateDeliveryPackage) {
  if (delivery) return delivery.packageName
  return row.companyName
}

function taskCompletionReviewText(row: PrivateTask, delivery?: PrivateDeliveryPackage) {
  const remaining = taskOpenItemsAfterUpdate(row, delivery)
  const overdue = remaining.filter(item => item.status === 'overdue')
  const subject = taskReviewSubject(row, delivery)
  if (overdue.length > 0) return `任务已完成,但「${subject}」还有 ${overdue.length} 个逾期任务,建议先做补救复盘。`
  if (remaining.length > 0) return `任务已完成,「${subject}」还有 ${remaining.length} 个待处理任务,请继续推进。`
  if (delivery) return `任务已完成,「${subject}」任务已闭环,可安排客户回访、续费或资料归档。`
  return `任务已完成,「${subject}」当前任务已闭环,建议补一条跟进复盘。`
}

function isSupervisorTask(task: PrivateTask) {
  return task.title.includes('督办') || task.action.includes('来源交付任务')
}

function isAddressStockTask(task: PrivateTask) {
  return task.title.includes('地址库存补货') || task.action.includes('地址库存 #')
}

function deliveryStatusText(status: PrivateDeliveryStatus) {
  return ({ created: '已创建', in_progress: '进行中', done: '已完成' } as Record<PrivateDeliveryStatus, string>)[status]
}

function deliveryStatusTag(status: PrivateDeliveryStatus) {
  return ({ created: 'warning', in_progress: 'primary', done: 'success' } as Record<PrivateDeliveryStatus, any>)[status]
}

function deliveryProgress(row: PrivateDeliveryPackage) {
  const taskCount = row.tasks.length || row.taskIds.length
  if (!taskCount) return 0
  const doneCount = row.tasks.filter(task => task.status === 'done').length
  return Math.round(doneCount / taskCount * 100)
}

function deliveryDoneCount(row: PrivateDeliveryPackage) {
  return row.tasks.filter(task => task.status === 'done').length
}

function deliveryPendingCount(row: PrivateDeliveryPackage) {
  return row.tasks.filter(task => task.status === 'pending').length
}

function deliveryOverdueCount(row: PrivateDeliveryPackage) {
  return row.tasks.filter(task => task.status === 'overdue').length
}

function deliveryProgressStatus(row: PrivateDeliveryPackage): 'success' | 'exception' | 'warning' | undefined {
  if (deliveryProgress(row) >= 100 || row.status === 'done') return 'success'
  if (row.tasks.some(task => task.status === 'overdue')) return 'exception'
  if (row.status === 'created') return 'warning'
  return undefined
}

function deliveryRiskText(row: PrivateDeliveryPackage) {
  if (deliveryOverdueCount(row) > 0) return `有 ${deliveryOverdueCount(row)} 个任务逾期,需要主管介入`
  if (deliveryProgress(row) === 0) return '交付尚未启动,当天需确认资料和责任人'
  if (deliveryProgress(row) < 100) return '交付推进中,关注最晚节点和回款要求'
  return '任务已全部完成,可进入回访和续费沉淀'
}

function deliveryChecklistTag(status: DeliveryChecklistStatus): 'success' | 'warning' | 'danger' {
  return ({ done: 'success', todo: 'warning', risk: 'danger' } as Record<DeliveryChecklistStatus, 'success' | 'warning' | 'danger'>)[status]
}

function deliveryChecklistItems(row: PrivateDeliveryPackage): DeliveryChecklistItem[] {
  const addressLock = activeAddressLock(row)
  const isAddress = isAddressDelivery(row)
  const doneCount = deliveryDoneCount(row)
  const pendingCount = deliveryPendingCount(row)
  const overdueCount = deliveryOverdueCount(row)
  const hasOrder = Boolean(row.orderNo)
  const hasPaymentRule = Boolean(row.paymentTimeReq)
  const hasOrderItems = Boolean(row.orderItemNames?.length)

  return [
    {
      key: 'payment',
      label: '回款/账期',
      status: row.orderStatus === 'completed' && hasPaymentRule ? 'done' : hasPaymentRule ? 'todo' : 'risk',
      statusText: row.orderStatus === 'completed' && hasPaymentRule ? '已核对' : hasPaymentRule ? '待确认' : '缺规则',
      desc: hasPaymentRule ? `${paymentMethodText(row.paymentMethod)} · ${row.paymentTimeReq}` : '缺少收款要求,财务无法判断首款、尾款、月结或账期。'
    },
    {
      key: 'contract',
      label: '合同/服务项',
      status: hasOrder && hasOrderItems ? 'done' : hasOrder ? 'todo' : 'risk',
      statusText: hasOrder && hasOrderItems ? '已关联' : hasOrder ? '待补项' : '缺提单',
      desc: hasOrder ? `${row.orderNo} · ${(row.orderItemNames?.join('、') || row.serviceLine)}` : '还没有关联提单,交付范围、报价和审批凭证不完整。'
    },
    {
      key: 'materials',
      label: '客户资料',
      status: doneCount > 0 ? 'done' : pendingCount > 0 ? 'todo' : 'risk',
      statusText: doneCount > 0 ? '已启动' : pendingCount > 0 ? '待收集' : '无任务',
      desc: doneCount > 0 ? `已有 ${doneCount} 个任务完成,继续盯剩余资料和办理节点。` : '先确认法人、股东、地址授权、开票主体等资料是否齐全。'
    },
    {
      key: 'address',
      label: '地址/资源',
      status: !isAddress || hasBoundAddressResource(row) ? 'done' : addressLock ? 'todo' : 'risk',
      statusText: !isAddress ? '无需地址' : hasBoundAddressResource(row) ? '已绑定' : addressLock ? '待绑 ADR' : '未锁定',
      desc: !isAddress ? '该服务包暂不涉及地址库存。' : addressLock ? `${formatAddressResourceNo(addressLock.resourceId)} · ${addressLock.remark}` : '地址类业务需先锁定资源池并绑定 ADR 编号。'
    },
    {
      key: 'tasks',
      label: '交付任务',
      status: overdueCount > 0 ? 'risk' : pendingCount > 0 ? 'todo' : 'done',
      statusText: overdueCount > 0 ? `${overdueCount} 个逾期` : pendingCount > 0 ? `${pendingCount} 个待办` : '已闭环',
      desc: `当前 ${doneCount}/${row.tasks.length || row.taskIds.length} 个任务完成,最晚节点 ${row.dueDate}。`
    },
    {
      key: 'archive',
      label: '归档/续费',
      status: deliveryProgress(row) >= 100 ? 'done' : deliveryProgress(row) > 0 ? 'todo' : 'risk',
      statusText: deliveryProgress(row) >= 100 ? '可回访' : deliveryProgress(row) > 0 ? '待完成' : '未启动',
      desc: deliveryProgress(row) >= 100 ? '可做满意度回访、资料归档、续费提醒和转介绍沉淀。' : '交付未完成前先沉淀资料清单,完成后自动进入回访续费。'
    }
  ]
}

function deliveryArchiveSummary(row: PrivateDeliveryPackage) {
  const items = deliveryArchiveItems(row)
  const done = items.filter(item => item.status === 'done').length
  const risk = items.filter(item => item.status === 'risk').length
  const todo = items.filter(item => item.status === 'todo').length
  return {
    title: `归档完整度 ${done}/${items.length}`,
    hint: risk > 0 ? `还有 ${risk} 个归档阻断项,先补合同、地址、任务或客户资料。` : todo > 0 ? `还有 ${todo} 个待确认项,交付完成前持续沉淀凭证。` : '合同、回款、资料、地址和任务凭证已经具备归档基础。',
    percent: items.length ? Math.round(done / items.length * 100) : 0,
    status: risk > 0 ? 'exception' : todo > 0 ? 'warning' : 'success'
  } as { title: string; hint: string; percent: number; status: 'success' | 'exception' | 'warning' }
}

function deliveryArchiveItems(row: PrivateDeliveryPackage): DeliveryArchiveItem[] {
  const isAddress = isAddressDelivery(row)
  const addressLock = activeAddressLock(row)
  const doneCount = deliveryDoneCount(row)
  const pendingCount = deliveryPendingCount(row)
  const overdueCount = deliveryOverdueCount(row)
  const taskTotal = row.tasks.length || row.taskIds.length
  const progress = deliveryProgress(row)
  const hasOrder = Boolean(row.orderNo)
  const hasPaymentRule = Boolean(row.paymentTimeReq)
  const hasOrderItems = Boolean(row.orderItemNames?.length)

  return [
    {
      key: 'order',
      label: '合同/提单凭证',
      status: hasOrder && hasOrderItems ? 'done' : hasOrder ? 'todo' : 'risk',
      statusText: hasOrder && hasOrderItems ? '已挂接' : hasOrder ? '待补服务项' : '缺提单',
      desc: hasOrder ? `${row.orderNo} · ${row.orderItemNames?.join('、') || row.serviceLine}` : '缺少提单或合同入口,后续归档无法追溯服务范围和审批凭证。',
      actionText: hasOrder ? '查看提单' : '查看客户',
      action: hasOrder ? 'order' : 'contact'
    },
    {
      key: 'payment',
      label: '回款/账期凭证',
      status: row.orderStatus === 'completed' && hasPaymentRule ? 'done' : hasPaymentRule ? 'todo' : 'risk',
      statusText: row.orderStatus === 'completed' && hasPaymentRule ? '已核对' : hasPaymentRule ? '待财务确认' : '缺收款要求',
      desc: hasPaymentRule ? `${paymentMethodText(row.paymentMethod)} · ${row.paymentTimeReq}` : '缺少首款、尾款、月结或账期说明,财务归档无法判断回款责任。',
      actionText: '查看提单',
      action: 'order'
    },
    {
      key: 'materials',
      label: '客户资料清单',
      status: doneCount > 0 ? 'done' : taskTotal > 0 ? 'todo' : 'risk',
      statusText: doneCount > 0 ? '已沉淀' : taskTotal > 0 ? '待收集' : '无任务',
      desc: doneCount > 0 ? `已有 ${doneCount} 个交付任务完成,继续补法人、股东、开票和办理资料。` : '还没有形成可归档的客户资料节点,需要交付负责人补清单。',
      actionText: '查看客户',
      action: 'contact'
    },
    {
      key: 'address',
      label: '地址/资源凭证',
      status: !isAddress || hasBoundAddressResource(row) ? 'done' : addressLock ? 'todo' : 'risk',
      statusText: !isAddress ? '无需地址' : hasBoundAddressResource(row) ? '已绑定 ADR' : addressLock ? '待补 ADR' : '未锁地址',
      desc: !isAddress ? '该服务包不涉及地址资源。' : addressLock ? `${formatAddressResourceNo(addressLock.resourceId)} · ${addressLock.remark}` : '地址挂靠或同行渠道业务必须保留地址锁定和资源编号凭证。',
      actionText: isAddress ? '补地址凭证' : '无需处理',
      action: 'address'
    },
    {
      key: 'tasks',
      label: '交付任务凭证',
      status: overdueCount > 0 ? 'risk' : pendingCount > 0 ? 'todo' : 'done',
      statusText: overdueCount > 0 ? `${overdueCount} 个逾期` : pendingCount > 0 ? `${pendingCount} 个待办` : '已闭环',
      desc: `当前 ${doneCount}/${taskTotal} 个任务完成,最晚节点 ${row.dueDate},任务流是交付归档主证据。`,
      actionText: '查看任务',
      action: 'task'
    },
    {
      key: 'review',
      label: '回访/续费记录',
      status: progress >= 100 ? 'todo' : progress > 0 ? 'todo' : 'risk',
      statusText: progress >= 100 ? '待回访' : progress > 0 ? '交付中' : '未启动',
      desc: progress >= 100 ? '交付完成后应沉淀满意度、续费提醒、转介绍和新增需求。' : '交付未完成前先记录客户反馈,完成后再归档回访续费。',
      actionText: '记录回访',
      action: 'review'
    }
  ]
}

function handleDeliveryArchiveAction(row: PrivateDeliveryPackage, item: DeliveryArchiveItem) {
  if (item.action === 'order') {
    openDeliveryOrder(row)
    return
  }
  if (item.action === 'contact') {
    openDeliveryContact(row)
    return
  }
  if (item.action === 'task') {
    deliveryDrawer.visible = false
    activeTab.value = 'tasks'
    taskFilter.value = deliveryOverdueCount(row) > 0 ? 'overdue' : deliveryPendingCount(row) > 0 ? 'pending' : 'all'
    scrollPrivateTabsIntoView()
    return
  }
  if (item.action === 'address') {
    if (!isAddressDelivery(row)) {
      ElMessage.info('该交付包不涉及地址资源,无需补地址凭证')
      return
    }
    ElMessage.info(needsAddressResourceBinding(row) ? '请在上方地址资源区选择可用地址并补绑定 ADR' : '地址凭证已在当前交付包内显示')
    return
  }
  if (item.action === 'review') {
    openDeliveryReview(row)
  }
}

function deliveryReviewTitle(row: PrivateDeliveryPackage) {
  if (deliveryOverdueCount(row) > 0) return '先补救交付异常,再做客户回访'
  if (deliveryProgress(row) < 100) return '交付中同步预约回访节点'
  return '交付完成后进入回访和续费经营'
}

function deliveryReviewDesc(row: PrivateDeliveryPackage) {
  if (deliveryOverdueCount(row) > 0) {
    return `当前还有 ${deliveryOverdueCount(row)} 个逾期任务,回访前先和客户同步补救节点、责任人和预计完成时间。`
  }
  if (deliveryProgress(row) < 100) return '建议在最晚节点前预约客户确认资料、回款、办理进度和是否有新增服务需求。'
  return '建议 7 天内做满意度回访,沉淀资料归档、续费提醒、转介绍和新增服务机会。'
}

function deliveryReviewNextAction(row: PrivateDeliveryPackage) {
  if (deliveryOverdueCount(row) > 0) return '同步交付补救节点并记录客户反馈'
  if (deliveryProgress(row) < 100) return '预约交付进度回访并确认资料/回款'
  return '完成满意度回访,确认续费/转介绍/新增需求'
}

function openDeliveryReview(row: PrivateDeliveryPackage) {
  const contact = deliveryContact(row)
  if (!contact) {
    ElMessage.warning('未找到关联私域客户,请刷新后重试')
    return
  }
  deliveryDrawer.visible = false
  openFollowDialog(contact)
  Object.assign(followForm, {
    method: '电话',
    result: '已联系',
    content: `${row.packageName}回访:核对交付进度、回款/资料、客户满意度和新增服务需求。`,
    quotedAmount: 0,
    nextAction: deliveryReviewNextAction(row),
    nextTouchAt: nextTouchTime(deliveryProgress(row) >= 100 ? 7 : 2, 10, 0),
    ownerName: contact.ownerName || row.ownerName
  })
}

async function createDeliveryReviewTask(row: PrivateDeliveryPackage) {
  const contact = deliveryContact(row)
  if (!contact) {
    ElMessage.warning('未找到关联私域客户,请刷新后重试')
    return
  }
  deliveryDrawer.visible = false
  await createFollowTask(contact)
}

function addressStatusText(status: PrivateAddressInventoryStatus) {
  return ({ available: '可售', low: '低库存', blocked: '停售' } as Record<PrivateAddressInventoryStatus, string>)[status]
}

function addressStatusTag(status: PrivateAddressInventoryStatus): 'success' | 'warning' | 'danger' {
  return ({ available: 'success', low: 'warning', blocked: 'danger' } as Record<PrivateAddressInventoryStatus, 'success' | 'warning' | 'danger'>)[status]
}

function isAddressDelivery(row: PrivateDeliveryPackage) {
  const text = `${row.packageName}${row.serviceLine}${row.orderItemNames?.join('') || ''}`
  return /同行|挂靠|地址/.test(text)
}

function activeAddressLock(row: PrivateDeliveryPackage) {
  return addressLocks.value.find(item => item.packageId === row.id && item.status === 'locked')
}

function needsAddressLock(row: PrivateDeliveryPackage) {
  return isAddressDelivery(row) && !activeAddressLock(row)
}

function needsAddressResourceBinding(row: PrivateDeliveryPackage) {
  const lock = activeAddressLock(row)
  return isAddressDelivery(row) && Boolean(lock && !lock.resourceId)
}

function formatAddressResourceNo(resourceId?: number) {
  return resourceId ? `ADR${String(resourceId).padStart(5, '0')}` : '未绑定'
}

function hasBoundAddressResource(row: PrivateDeliveryPackage) {
  return Boolean(activeAddressLock(row)?.resourceId)
}

function addressResourceNo(row: PrivateDeliveryPackage) {
  return formatAddressResourceNo(activeAddressLock(row)?.resourceId)
}

function addressLockRemark(row: PrivateDeliveryPackage) {
  return activeAddressLock(row)?.remark || '地址已锁定'
}

function addressInventoryOf(lock?: PrivateAddressLock) {
  return lock ? addressInventory.value.find(item => item.id === lock.inventoryId) : undefined
}

function isCurrentAddressInventory(row: PrivateDeliveryPackage | null | undefined, item: PrivateAddressInventory) {
  return Boolean(row && activeAddressLock(row)?.inventoryId === item.id)
}

function addressInventoryForDelivery(row: PrivateDeliveryPackage | null | undefined) {
  const lock = row ? activeAddressLock(row) : undefined
  const currentId = lock?.inventoryId
  const statusRank: Record<PrivateAddressInventoryStatus, number> = { available: 0, low: 1, blocked: 2 }
  return addressInventory.value.slice().sort((left, right) => {
    if (currentId) {
      if (left.id === currentId) return -1
      if (right.id === currentId) return 1
    }
    const statusDelta = statusRank[left.status] - statusRank[right.status]
    if (statusDelta !== 0) return statusDelta
    const availableDelta = Number(right.available || 0) - Number(left.available || 0)
    if (availableDelta !== 0) return availableDelta
    return Number(right.channelPrice || 0) - Number(left.channelPrice || 0)
  })
}

function addressResourceOf(lock?: PrivateAddressLock) {
  if (!lock?.resourceId) return undefined
  return addressResourceOptions.value.find(item => Number(item.id) === Number(lock.resourceId))
}

function channelAddressStatusText(status?: BizAddressResource['status']) {
  if (!status) return '待同步'
  return ({
    available: '未使用',
    reserved: '已预留',
    sold: '已使用',
    expired: '已到期',
    abnormal: '异常'
  } as Record<string, string>)[status] || status
}

function addressInventorySource(lock?: PrivateAddressLock) {
  const inventory = addressInventoryOf(lock)
  if (!inventory) return '待匹配库存口径'
  return `${inventory.city}${inventory.district} · ${inventory.addressType} · ${inventory.supplierName}`
}

function addressResourceStatusText(lock?: PrivateAddressLock) {
  if (!lock?.resourceId) return '未绑定 ADR'
  const resource = addressResourceOf(lock)
  if (!resource) return `${formatAddressResourceNo(lock.resourceId)} · 待同步资源池`
  return `${resource.resourceNo} · ${channelAddressStatusText(resource.status)}`
}

function addressLockMarginText(lock?: PrivateAddressLock) {
  const inventory = addressInventoryOf(lock)
  if (!inventory) return '待匹配库存'
  const gross = Number(inventory.channelPrice || 0) - Number(inventory.monthlyCost || 0)
  const rate = inventory.channelPrice ? Math.round(gross / inventory.channelPrice * 100) : 0
  return `¥${gross}/月 · ${rate}%`
}

function addressLockSettlementText(row: PrivateDeliveryPackage, lock?: PrivateAddressLock) {
  const channel = row.serviceLine || '同行渠道'
  const contact = lock?.channelName && lock.channelName !== channel ? ` · ${lock.channelName}` : ''
  const payment = paymentMethodText(row.paymentMethod)
  return `${channel}${contact} · ${payment} · ${row.paymentTimeReq || '待补收款要求'}`
}

function addressLockLinkageTip(row: PrivateDeliveryPackage, lock?: PrivateAddressLock) {
  if (!lock) return '当前交付包还没有锁定地址,请先从库存中锁定可售地址。'
  if (!lock.resourceId) return '当前锁定缺少 ADR 资源编号,资源池无法反查客户和渠道应收,请优先补绑定。'
  if (!row.orderNo) return `已绑定 ${formatAddressResourceNo(lock.resourceId)},但来源提单未关联,建议补齐订单后再交付。`
  return `已和提单 ${row.orderNo}、资源 ${formatAddressResourceNo(lock.resourceId)} 形成闭环,可回资源池复核客户、成本和渠道应收。`
}

function normalizeCityText(value?: string) {
  return (value || '').replace(/市$/, '')
}

function supplierLooksClose(left?: string, right?: string) {
  const a = left || ''
  const b = right || ''
  if (!a || !b) return false
  if (a === b || a.includes(b) || b.includes(a)) return true
  return ['运河', '钱塘', '滨江', '义乌', '云商'].some(token => a.includes(token) && b.includes(token))
}

function addressResourceMatch(resource: BizAddressResource, inventory?: PrivateAddressInventory) {
  if (!inventory) return { cityMatched: false, districtMatched: false, supplierMatched: false, score: 0 }
  const city = normalizeCityText(resource.city)
  const inventoryCity = normalizeCityText(inventory.city)
  const cityMatched = !inventoryCity || city.includes(inventoryCity) || inventoryCity.includes(city)
  const districtMatched = !inventory.district || resource.district === inventory.district
  const supplierMatched = supplierLooksClose(resource.supplierName, inventory.supplierName)
  const score = (districtMatched ? 70 : 0) + (cityMatched ? 20 : 0) + (supplierMatched ? 30 : 0)
  return { cityMatched, districtMatched, supplierMatched, score }
}

function sortAddressResourcesByInventory(resources: BizAddressResource[], inventory?: PrivateAddressInventory) {
  return resources.slice().sort((left, right) => {
    const leftScore = addressResourceMatch(left, inventory).score
    const rightScore = addressResourceMatch(right, inventory).score
    if (leftScore !== rightScore) return rightScore - leftScore
    if (left.district !== right.district) return left.district.localeCompare(right.district, 'zh-CN')
    return Number(left.yearlyCost || 0) - Number(right.yearlyCost || 0)
  })
}

function addressResourceCandidates(lock?: PrivateAddressLock) {
  if (!lock) return addressResourceOptions.value
  const inventory = addressInventory.value.find(item => item.id === lock.inventoryId)
  if (!inventory) return addressResourceOptions.value
  const sorted = sortAddressResourcesByInventory(addressResourceOptions.value, inventory)
  const matched = sorted.filter(resource => {
    const match = addressResourceMatch(resource, inventory)
    return match.cityMatched && match.districtMatched && match.supplierMatched
  })
  return matched.length ? matched : sorted
}

function addressResourceOptionLabel(resource: BizAddressResource, lock?: PrivateAddressLock) {
  const inventory = addressInventoryOf(lock)
  const prefix = addressResourceMatch(resource, inventory).score >= 90 ? '推荐 · ' : ''
  const supplier = resource.supplierName || '未知供应商'
  const yearlyCost = resource.yearlyCost ? `成本¥${formatMoney(resource.yearlyCost)}/年` : '成本待补'
  return `${prefix}${resource.resourceNo} · ${resource.district} · ${supplier} · ${yearlyCost} · ${resource.detailAddress}`
}

function addressResourceCandidateHint(lock?: PrivateAddressLock) {
  const inventory = addressInventoryOf(lock)
  const candidates = addressResourceCandidates(lock)
  if (!lock) return '先锁定地址后,系统会按区域、供应商和成本推荐可补绑定资源。'
  if (!inventory) return `当前有 ${candidates.length} 个可用地址资源,请按区域和供应商人工选择。`
  const top = candidates[0]
  const hasStrongMatch = Boolean(top && addressResourceMatch(top, inventory).score >= 90)
  return hasStrongMatch
    ? `已按 ${inventory.district} / ${inventory.supplierName} 优先推荐,当前可选 ${candidates.length} 个资源。`
    : `未找到完全同区同供应商资源,已按相似区域、供应商和成本排序,当前可选 ${candidates.length} 个资源。`
}

function selectedAddressResource(lock: PrivateAddressLock, resourceId: number) {
  return addressResourceOptions.value.find(item => Number(item.id) === Number(resourceId))
}

function addressResourceConfirmMessage(lock: PrivateAddressLock, resourceId: number, resource?: BizAddressResource) {
  const inventory = addressInventoryOf(lock)
  const resourceText = resource
    ? `${resource.resourceNo} · ${resource.district} · ${resource.supplierName} · 成本¥${formatMoney(resource.yearlyCost || 0)}/年 · ${resource.detailAddress}`
    : `资源 ID ${resourceId}`
  return [
    `确认将 ${resourceText} 补绑定到「${lock.companyName}」的地址交付锁定吗?`,
    `锁定库存: ${inventory ? `${inventory.city}${inventory.district} · ${inventory.addressType} · ${inventory.supplierName}` : '待匹配库存'}`,
    '绑定后资源池会按该 ADR 反查客户和渠道应收,请确认没有选错地址。'
  ].join('\n')
}

function goAddressResource(lock?: PrivateAddressLock) {
  if (!lock?.resourceId) return
  router.push({
    path: '/supply/receipt',
    query: {
      resourceNo: formatAddressResourceNo(lock.resourceId),
      privateLock: 'locked',
      packageId: String(lock.packageId),
      source: 'private-domain'
    }
  }).catch(() => {})
}

function deliveryRowClassName({ row }: { row: PrivateDeliveryPackage }) {
  return focusedDeliveryPackageId.value && row.id === focusedDeliveryPackageId.value ? 'target-delivery-row' : ''
}

function followResultTag(result: PrivateFollowResult) {
  return ({ 无响应: 'info', 已联系: 'primary', 有意向: 'warning', 已报价: 'warning', 已成交: 'success', 暂缓: 'info', 流失: 'danger' } as Record<PrivateFollowResult, any>)[result]
}

function orderStatusText(status?: PrivateFollowRecord['orderStatus']) {
  if (!status) return '草稿'
  return ({
    draft: '草稿',
    pending_approval: '待主管',
    pending_finance: '待财务',
    pending_boss: '待老板',
    rejected: '已驳回',
    completed: '已完成',
    cancelled: '已取消'
  } as Record<NonNullable<PrivateFollowRecord['orderStatus']>, string>)[status]
}

function orderStatusTag(status?: PrivateFollowRecord['orderStatus']): 'success' | 'warning' | 'info' | 'danger' | 'primary' {
  if (!status) return 'info'
  return ({
    draft: 'info',
    pending_approval: 'warning',
    pending_finance: 'primary',
    pending_boss: 'warning',
    rejected: 'danger',
    completed: 'success',
    cancelled: 'info'
  } as Record<NonNullable<PrivateFollowRecord['orderStatus']>, 'success' | 'warning' | 'info' | 'danger' | 'primary'>)[status]
}

function paymentMethodText(method?: PrivateDeliveryPackage['paymentMethod']) {
  if (!method) return '未填付款方式'
  return ({
    lump_sum: '一次性付款',
    monthly: '月付',
    quarterly: '季付',
    semi_annual: '半年付',
    annual: '年付',
    installment: '分期付款'
  } as Record<NonNullable<PrivateDeliveryPackage['paymentMethod']>, string>)[method]
}

function priorityTag(priority: PrivateTask['priority']) {
  return priority === '高' ? 'danger' : priority === '中' ? 'warning' : 'info'
}

function importStatusText(status: PrivateImportStatus) {
  return ({ ready: '可导入', duplicate: '重复', error: '错误' } as Record<PrivateImportStatus, string>)[status]
}

function importStatusTag(status: PrivateImportStatus): 'success' | 'warning' | 'danger' {
  return ({ ready: 'success', duplicate: 'warning', error: 'danger' } as Record<PrivateImportStatus, 'success' | 'warning' | 'danger'>)[status]
}

function duplicateRiskText(risk?: PrivateDuplicateRisk) {
  return ({ none: '未重复', possible: '疑似重复', hit: '强命中' } as Record<PrivateDuplicateRisk, string>)[risk || 'none']
}

function duplicateRiskTag(risk?: PrivateDuplicateRisk): 'success' | 'warning' | 'danger' {
  return ({ none: 'success', possible: 'warning', hit: 'danger' } as Record<PrivateDuplicateRisk, 'success' | 'warning' | 'danger'>)[risk || 'none']
}

function verificationText(verification?: PrivateCompanyVerification) {
  if (!verification) return '未核验'
  return verification.matched ? '已核验' : '待核验'
}

function verificationTag(verification?: PrivateCompanyVerification): 'success' | 'warning' | 'info' {
  if (!verification) return 'info'
  return verification.matched ? 'success' : 'warning'
}

function importProblemText(row: PrivateImportPreviewRow) {
  if (!row.verification) return '可导入'
  if (!row.verification.matched) return '可导入,需后续补工商'
  if (row.verification.duplicateRisk === 'possible') return `疑似重复: ${row.verification.linkageText}`
  return `工商已核验: ${row.verification.businessStatus || row.verification.creditCode || '主体命中'}`
}

function contentRate(row: PrivateContent) {
  if (!row.reachCount) return 0
  return Number((row.leadCount / row.reachCount * 100).toFixed(1))
}

function isConverting(id: number) {
  return convertingIds.value.includes(id)
}

function isVerifying(id: number) {
  return verifyingIds.value.includes(id)
}

function isCreatingDelivery(id: number) {
  return deliveryCreatingIds.value.includes(id)
}

function isUpdatingDeliveryTask(id: number) {
  return deliveryTaskUpdatingIds.value.includes(id)
}

function isCreatingSupervisorTask(id: number) {
  return supervisorTaskCreatingIds.value.includes(id)
}

function isUpdatingTask(id: number) {
  return taskUpdatingIds.value.includes(id)
}

function isLockingAddress(id: number) {
  return addressLockingIds.value.includes(id)
}

function isReleasingAddress(id: number) {
  return addressReleasingIds.value.includes(id)
}

function isBindingAddressResource(id: number) {
  return addressResourceBindingIds.value.includes(id)
}

function isCreatingAddressReplenish(id: number) {
  return addressReplenishCreatingIds.value.includes(id)
}

function hasDeliveryPackage(contactId: number) {
  return deliveryPackages.value.some(item => item.contactId === contactId)
}

function canCreateDeliveryFromFollow(row: PrivateFollowRecord) {
  return row.orderStatus === 'completed' && !hasDeliveryPackage(row.contactId)
}

function isCreatingOrderDraft(id: number) {
  return orderDraftCreatingIds.value.includes(id)
}

function canCreateOrderDraft(row: PrivateFollowRecord) {
  return Boolean(row.orderNo || row.quotedAmount || row.result === '已报价' || row.result === '已成交')
}

function isRuleSaving(id: number) {
  return ruleSavingIds.value.includes(id)
}

async function loadDashboard() {
  const data = await privateDomainApi.dashboard()
  Object.assign(summary, data.summary)
  groups.value = data.groups
  contents.value = data.contents
  tasks.value = data.tasks
  integrations.value = data.integrations
  ownershipRules.value = data.ownershipRules
  deliveryPackages.value = data.deliveryPackages
  followRecords.value = data.followRecords
  addressInventory.value = data.addressInventory || []
  addressLocks.value = data.addressLocks || []
  opsChecks.value = data.opsChecks
  dailyActions.value = data.dailyActions
  Object.assign(wecomConfig, data.wecomConfig)
  Object.assign(opsProfile, data.opsProfile)
  opsProfile.answers = { sourceTruth: '', ownerRule: '', successMetric: '', dataImport: '', ...(data.opsProfile.answers || {}) }
  await loadAddressResourceOptions()
}

async function loadAddressResourceOptions() {
  if (addressResourceLoading.value) return
  addressResourceLoading.value = true
  try {
    addressResourceOptions.value = await addressApi.available()
  } finally {
    addressResourceLoading.value = false
  }
}

async function loadContacts() {
  loading.value = true
  try {
    contacts.value = await privateDomainApi.listContacts(query)
    await loadDashboard()
  } finally {
    loading.value = false
  }
}

function csvCell(value: unknown) {
  const text = String(value ?? '')
  return `"${text.replace(/"/g, '""')}"`
}

function downloadImportTemplate() {
  const header = importColumns.map(column => column.label)
  const rows = privateImportTemplateSamples.map(sample => importColumns.map(column => sample[column.key] ?? ''))
  const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '私域客户导入模板.csv'
  link.click()
  URL.revokeObjectURL(url)
  ElMessage.success('已下载私域客户导入模板,可直接用 Excel 打开')
}

function detectDelimiter(firstLine: string) {
  if (firstLine.includes('\t')) return '\t'
  if (firstLine.includes(';') && !firstLine.includes(',')) return ';'
  return ','
}

function parseSeparatedText(text: string) {
  const raw = text.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const delimiter = detectDelimiter(raw.split('\n')[0] || '')
  const rows: string[][] = []
  let row: string[] = []
  let value = ''
  let inQuotes = false
  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i]
    const next = raw[i + 1]
    if (ch === '"') {
      if (inQuotes && next === '"') {
        value += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      row.push(value.trim())
      value = ''
    } else if (ch === '\n' && !inQuotes) {
      row.push(value.trim())
      if (row.some(cell => cell)) rows.push(row)
      row = []
      value = ''
    } else {
      value += ch
    }
  }
  row.push(value.trim())
  if (row.some(cell => cell)) rows.push(row)
  return rows
}

function rowsFromText(text: string): PrivateContactImportRow[] {
  const rows = parseSeparatedText(text)
  if (rows.length < 2) return []
  const header = rows[0].map(item => item.trim())
  const keyByHeader = new Map<string, keyof PrivateContactImportRow>()
  importColumns.forEach(column => {
    keyByHeader.set(column.label, column.key)
    keyByHeader.set(String(column.key), column.key)
  })
  return rows.slice(1).map((cells) => {
    const item: Record<string, string> = {}
    header.forEach((name, idx) => {
      const key = keyByHeader.get(name)
      if (key) item[key] = cells[idx] || ''
    })
    return item as unknown as PrivateContactImportRow
  }).filter(item => Object.values(item).some(Boolean))
}

async function previewImportRows(rows: PrivateContactImportRow[], sourceName = '') {
  if (!rows.length) {
    ElMessage.warning('没有解析到客户数据,请确认第一行是模板表头')
    return
  }
  importPreview.value = await privateDomainApi.previewImport(rows)
  if (sourceName) importFileName.value = sourceName
  const ready = importPreview.value.filter(item => item.status === 'ready').length
  const blocked = importPreview.value.length - ready
  ElMessage.success(`已解析 ${importPreview.value.length} 行,可导入 ${ready} 行${blocked ? `,需处理 ${blocked} 行` : ''}`)
}

function triggerFileSelect() {
  fileInputRef.value?.click()
}

async function handleImportFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!/\.(csv|txt)$/i.test(file.name)) {
    ElMessage.warning('当前先支持 CSV。请用 Excel 打开模板后另存为 CSV 再导入。')
    return
  }
  const text = await file.text()
  pasteText.value = text
  await previewImportRows(rowsFromText(text), file.name)
}

async function previewPasteText() {
  await previewImportRows(rowsFromText(pasteText.value), '粘贴内容')
}

function clearImportPreview() {
  importPreview.value = []
  importFileName.value = ''
  pasteText.value = ''
}

async function importValidRows() {
  if (!previewStats.value.ready) {
    ElMessage.warning('没有可导入的数据')
    return
  }
  importing.value = true
  try {
    const result = await privateDomainApi.importContacts(importPreview.value.map(item => item.data))
    importPreview.value = result.preview
    await loadContacts()
    activeTab.value = 'contacts'
    ElMessage.success(`已导入 ${result.imported} 条,重复 ${result.duplicate} 条,错误 ${result.failed} 条`)
  } catch (error: any) {
    ElMessage.error(error?.message || '导入失败')
  } finally {
    importing.value = false
  }
}

function resetQuery() {
  Object.assign(query, { keyword: '', source: '', stage: '' })
  contactQuickFilter.value = 'all'
  loadContacts()
}

async function loadDrawerTimeline(id: number) {
  try {
    drawerTimeline.value = await privateDomainApi.getContactTimeline(id)
  } catch {
    drawerTimeline.value = []
  }
}

function drawerTimelineGroups() {
  return contactTimelineTypeOrder
    .map(type => ({
      type,
      ...contactTimelineTypeMeta[type],
      items: drawerTimeline.value.filter(item => item.type === type)
    }))
    .filter(group => group.items.length > 0)
}

function openContact(row: PrivateContact) {
  drawer.row = row
  drawer.visible = true
  loadDrawerTimeline(row.id)
}

function openContactFromFollow(row: PrivateFollowRecord) {
  const contact = contacts.value.find(item => item.id === row.contactId)
  if (!contact) {
    ElMessage.warning('未找到关联私域客户,请刷新后重试')
    return
  }
  openContact(contact)
}

function deliveryContact(row: PrivateDeliveryPackage) {
  return contacts.value.find(item => item.id === row.contactId)
}

function deliveryFollowRecords(row: PrivateDeliveryPackage) {
  return followRecords.value
    .filter(item => item.contactId === row.contactId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function deliveryTimelineItems(row: PrivateDeliveryPackage) {
  const items: Array<{
    id: string | number
    type: DeliveryTimelineType
    title: string
    statusText: string
    statusLevel: 'success' | 'warning' | 'info' | 'danger' | 'primary'
    time: string
    ownerName: string
    content: string
  }> = []
  const lock = activeAddressLock(row)
  if (lock) {
    items.push({
      id: `address-lock-${lock.id}`,
      type: 'address',
      title: '地址库存锁定',
      statusText: lock.resourceId ? '已锁定' : '待补 ADR',
      statusLevel: lock.resourceId ? 'success' : 'warning',
      time: lock.lockedAt,
      ownerName: lock.ownerName,
      content: `锁定 ${addressInventorySource(lock)} 给 ${lock.companyName},释放时间 ${lock.releaseAt}`
    })
    items.push({
      id: `address-resource-${lock.id}`,
      type: 'address',
      title: lock.resourceId ? 'ADR 资源绑定' : 'ADR 资源待补绑定',
      statusText: lock.resourceId ? '已绑定' : '待处理',
      statusLevel: lock.resourceId ? 'success' : 'warning',
      time: lock.lockedAt,
      ownerName: lock.ownerName,
      content: lock.resourceId
        ? `${formatAddressResourceNo(lock.resourceId)} 已纳入资源池反查,可复核客户、成本和渠道应收。`
        : '当前地址锁定缺少 ADR 资源编号,资源池无法反查客户和渠道应收。'
    })
  }
  deliveryFollowRecords(row).forEach(item => {
    items.push({
      id: `follow-${item.id}`,
      type: 'follow',
      title: `${item.method} · ${item.result}`,
      statusText: item.result,
      statusLevel: followResultTag(item.result),
      time: item.createdAt,
      ownerName: item.ownerName,
      content: item.content
    })
  })
  row.tasks.forEach(item => {
    items.push({
      id: `delivery-task-${item.id}`,
      type: 'task',
      title: item.title.replace(`${row.companyName} - `, ''),
      statusText: taskStatusText(item.status),
      statusLevel: taskStatusTag(item.status),
      time: item.dueTime,
      ownerName: item.ownerName,
      content: `${item.action} · 优先级 ${item.priority}`
    })
  })
  return items.sort((a, b) => b.time.localeCompare(a.time))
}

function deliveryTimelineGroups(row: PrivateDeliveryPackage) {
  const items = deliveryTimelineItems(row)
  return deliveryTimelineTypeOrder
    .map(type => ({
      type,
      ...deliveryTimelineTypeMeta[type],
      items: items.filter(item => item.type === type)
    }))
    .filter(group => group.items.length > 0)
}

function openDeliveryPackage(row: PrivateDeliveryPackage) {
  deliveryDrawer.row = row
  deliveryDrawer.visible = true
}

function openDeliveryContact(row: PrivateDeliveryPackage) {
  const contact = deliveryContact(row)
  if (!contact) {
    ElMessage.warning('未找到关联私域客户,请刷新后重试')
    return
  }
  deliveryDrawer.visible = false
  openContact(contact)
}

function openDeliveryOrder(row: PrivateDeliveryPackage) {
  if (!row.orderNo) {
    ElMessage.info('该交付包还未关联提单')
    return
  }
  deliveryDrawer.visible = false
  router.push({ path: '/order/bill', query: { keyword: row.orderNo } })
}

function padTime(value: number) {
  return String(value).padStart(2, '0')
}

function nextTouchTime(offsetDays = 1, hour = 10, minute = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, minute, 0, 0)
  return `${d.getFullYear()}-${padTime(d.getMonth() + 1)}-${padTime(d.getDate())} ${padTime(d.getHours())}:${padTime(d.getMinutes())}`
}

function openFollowDialog(row?: PrivateContact) {
  const target = row || contacts.value[0]
  followDialog.row = target || null
  Object.assign(followForm, {
    contactId: target?.id || 0,
    method: '电话',
    result: '已联系',
    content: '',
    quotedAmount: target?.estimatedAmount && target.stage === 'quoted' ? target.estimatedAmount : 0,
    nextAction: target?.nextAction || '',
    nextTouchAt: nextTouchTime(1, 10, 0),
    ownerName: target?.ownerName || ''
  })
  followDialog.visible = true
}

async function verifyContact(row: PrivateContact) {
  if (isVerifying(row.id)) return
  verifyingIds.value = [...verifyingIds.value, row.id]
  try {
    const updated = await privateDomainApi.verifyContact(row.id)
    contacts.value = contacts.value.map(item => item.id === updated.id ? updated : item)
    if (drawer.row?.id === updated.id) {
      drawer.row = updated
      await loadDrawerTimeline(updated.id)
    }
    ElMessage.success(`工商核验完成: ${verificationText(updated.verification)} / ${duplicateRiskText(updated.verification?.duplicateRisk)}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '工商核验失败')
  } finally {
    verifyingIds.value = verifyingIds.value.filter(id => id !== row.id)
  }
}

async function batchVerifyContacts() {
  if (batchVerifyingContacts.value) return
  const targets = batchVerifiableContacts.value.filter(item => !isVerifying(item.id))
  if (!targets.length) {
    ElMessage.info('当前列表没有待核验客户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `将对当前列表 ${targets.length} 个未核验客户执行工商核验,并更新客户主体信息、重复风险和最近互动时间。`,
      '确认批量工商核验',
      {
        type: 'warning',
        confirmButtonText: '开始核验',
        cancelButtonText: '再看看'
      }
    )
  } catch {
    return
  }
  const targetIds = targets.map(item => item.id)
  let successCount = 0
  const updatedContacts: PrivateContact[] = []
  batchVerifyingContacts.value = true
  verifyingIds.value = Array.from(new Set([...verifyingIds.value, ...targetIds]))
  try {
    for (const target of targets) {
      const updated = await privateDomainApi.verifyContact(target.id)
      successCount += 1
      updatedContacts.push(updated)
      contacts.value = contacts.value.map(item => item.id === updated.id ? updated : item)
      if (drawer.row?.id === updated.id) drawer.row = updated
    }
    const matchedCount = updatedContacts.filter(item => item.verification?.matched).length
    const duplicateCount = updatedContacts.filter(item => item.verification?.duplicateRisk && item.verification.duplicateRisk !== 'none').length
    ElMessage.success(`已核验 ${successCount} 个: 命中 ${matchedCount},疑似重复 ${duplicateCount},未命中 ${successCount - matchedCount}`)
  } catch (error: any) {
    ElMessage.error(error?.message || `批量核验中断,已完成 ${successCount} 个客户`)
  } finally {
    verifyingIds.value = verifyingIds.value.filter(id => !targetIds.includes(id))
    batchVerifyingContacts.value = false
    await loadContacts()
    if (drawer.row && targetIds.includes(drawer.row.id)) await loadDrawerTimeline(drawer.row.id)
  }
}

async function markIntent(row: PrivateContact) {
  try {
    await privateDomainApi.updateStage(row.id, row.stage === 'quoted' ? 'quoted' : 'intent')
    ElMessage.success('已标记为高意向,将进入优先跟进队列')
    await loadContacts()
    if (drawer.row?.id === row.id) drawer.row = contacts.value.find(item => item.id === row.id) || null
  } catch (error: any) {
    ElMessage.error(error?.message || '标记意向失败')
  }
}

async function createFollowTask(row: PrivateContact) {
  if (hasOpenFollowTask(row)) {
    ElMessage.info('该客户已有未完成跟进任务')
    return
  }
  try {
    const task = await privateDomainApi.createTaskFromContact(row.id)
    ElMessage.success(`已生成跟进任务: ${task.title}`)
    await loadDashboard()
    await loadContacts()
    if (drawer.row?.id === row.id) await loadDrawerTimeline(row.id)
  } catch (error: any) {
    ElMessage.error(error?.message || '生成跟进任务失败')
  }
}

async function batchCreateFollowTasks() {
  if (batchCreatingFollowTasks.value) return
  const targets = batchFollowTaskContacts.value
  if (!targets.length) {
    ElMessage.info('当前列表没有需要新建跟进任务的客户')
    return
  }
  try {
    await ElMessageBox.confirm(
      `将给当前筛选下 ${targets.length} 个高意向或今日未跟进客户批量生成跟进任务,已有未完成任务的客户会自动跳过。`,
      '确认批量生成跟进任务',
      {
        type: 'warning',
        confirmButtonText: '开始生成',
        cancelButtonText: '再看看'
      }
    )
  } catch {
    return
  }
  batchCreatingFollowTasks.value = true
  let successCount = 0
  try {
    for (const target of targets) {
      if (hasOpenFollowTask(target)) continue
      await privateDomainApi.createTaskFromContact(target.id)
      successCount += 1
    }
    await loadDashboard()
    await loadContacts()
    activeTab.value = 'tasks'
    taskFilter.value = 'pending'
    scrollPrivateTabsIntoView()
    ElMessage.success(`已生成 ${successCount} 个跟进任务,并切到待处理任务队列`)
  } catch (error: any) {
    ElMessage.error(error?.message || `批量生成任务中断,已完成 ${successCount} 个`)
    await loadDashboard()
    await loadContacts()
  } finally {
    batchCreatingFollowTasks.value = false
  }
}

async function saveFollowRecord() {
  followSaving.value = true
  try {
    const result = await privateDomainApi.createFollowRecord({ ...followForm })
    ElMessage.success(`已记录跟进: ${result.record.companyName} / ${result.record.result}`)
    followDialog.visible = false
    activeTab.value = 'follow'
    await loadContacts()
    if (drawer.row?.id === result.contact.id) {
      drawer.row = result.contact
      await loadDrawerTimeline(result.contact.id)
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '保存跟进记录失败')
  } finally {
    followSaving.value = false
  }
}

async function convertLead(row: PrivateContact) {
  if (row.convertedLeadId) {
    ElMessage.info(`该客户已入库网销线索 #${row.convertedLeadId}`)
    return
  }
  if (isConverting(row.id)) return
  convertingIds.value = [...convertingIds.value, row.id]
  try {
    const result = await privateDomainApi.convertToOnlineLead(row.id)
    ElMessage.success(result.reused ? '该客户已入库过网销线索' : `已入库网销线索 #${result.leadId}`)
    await loadContacts()
    if (drawer.row?.id === row.id) drawer.row = contacts.value.find(item => item.id === row.id) || null
  } catch (error: any) {
    ElMessage.error(error?.message || '入库网销线索失败')
  } finally {
    convertingIds.value = convertingIds.value.filter(id => id !== row.id)
  }
}

async function saveOwnershipRule(row: PrivateOwnershipRule) {
  if (isRuleSaving(row.id)) return
  ruleSavingIds.value = [...ruleSavingIds.value, row.id]
  try {
    const saved = await privateDomainApi.saveOwnershipRule({ ...row })
    ownershipRules.value = ownershipRules.value.map(item => item.id === saved.id ? saved : item)
    await loadDashboard()
    ElMessage.success(`${saved.source} 归属规则已保存`)
  } catch (error: any) {
    ElMessage.error(error?.message || '保存归属规则失败')
  } finally {
    ruleSavingIds.value = ruleSavingIds.value.filter(id => id !== row.id)
  }
}

async function saveWecomConfig() {
  wecomSaving.value = true
  try {
    const saved = await privateDomainApi.saveWecomConfig({ ...wecomConfig })
    Object.assign(wecomConfig, saved)
    await loadDashboard()
    ElMessage.success(wecomReady.value ? '企业微信接入参数已保存,接入卡片已标记为可同步' : '企业微信配置已保存,还需补齐 CorpId/Secret/Token/AESKey')
  } catch (error: any) {
    ElMessage.error(error?.message || '保存企微配置失败')
  } finally {
    wecomSaving.value = false
  }
}

async function createDeliveryPackage(row: PrivateContact) {
  if (isCreatingDelivery(row.id)) return
  deliveryCreatingIds.value = [...deliveryCreatingIds.value, row.id]
  try {
    const result = await privateDomainApi.createDeliveryPackageFromContact(row.id)
    ElMessage.success(result.reused ? '该客户已生成过交付包' : `已生成${result.package.packageName}`)
    await loadContacts()
    activeTab.value = 'delivery'
    if (drawer.row?.id === row.id) {
      drawer.row = contacts.value.find(item => item.id === row.id) || drawer.row
      await loadDrawerTimeline(row.id)
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '生成交付包失败')
  } finally {
    deliveryCreatingIds.value = deliveryCreatingIds.value.filter(id => id !== row.id)
  }
}

async function createDeliveryFromFollow(row: PrivateFollowRecord) {
  if (hasDeliveryPackage(row.contactId)) {
    ElMessage.info('该客户已生成交付包')
    return
  }
  const contact = contacts.value.find(item => item.id === row.contactId)
  if (!contact) {
    ElMessage.error('未找到私域客户,请刷新后重试')
    return
  }
  await createDeliveryPackage(contact)
}

async function updateDeliveryTaskState(row: PrivateDeliveryPackage, task: PrivateTask, status: PrivateTaskStatus, successMessage: string) {
  if (isUpdatingDeliveryTask(task.id)) return
  deliveryTaskUpdatingIds.value = [...deliveryTaskUpdatingIds.value, task.id]
  try {
    const nextPackage = await privateDomainApi.updateDeliveryTaskStatus(row.id, task.id, status)
    const idx = deliveryPackages.value.findIndex(item => item.id === row.id)
    if (idx >= 0) deliveryPackages.value[idx] = nextPackage
    if (deliveryDrawer.row?.id === row.id) deliveryDrawer.row = nextPackage
    await loadDashboard()
    ElMessage.success(successMessage)
  } catch (error: any) {
    ElMessage.error(error?.message || '更新交付任务失败')
  } finally {
    deliveryTaskUpdatingIds.value = deliveryTaskUpdatingIds.value.filter(id => id !== task.id)
  }
}

async function toggleDeliveryTask(row: PrivateDeliveryPackage, task: PrivateTask, checked: boolean) {
  await updateDeliveryTaskState(row, task, checked ? 'done' : 'pending', checked ? '交付任务已完成' : '交付任务已恢复待处理')
}

async function markDeliveryTaskOverdue(row: PrivateDeliveryPackage, task: PrivateTask) {
  await updateDeliveryTaskState(row, task, 'overdue', '交付任务已标记逾期')
}

async function restoreDeliveryTask(row: PrivateDeliveryPackage, task: PrivateTask) {
  await updateDeliveryTaskState(row, task, 'pending', '交付任务已恢复待处理')
}

async function createSupervisorTask(row: PrivateDeliveryPackage, task: PrivateTask) {
  if (isCreatingSupervisorTask(task.id)) return
  supervisorTaskCreatingIds.value = [...supervisorTaskCreatingIds.value, task.id]
  try {
    const result = await privateDomainApi.createDeliverySupervisorTask(row.id, task.id)
    await loadDashboard()
    ElMessage.success(result.reused ? '该逾期任务已有未完成督办' : `已生成督办任务: ${result.task.title}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '生成督办任务失败')
  } finally {
    supervisorTaskCreatingIds.value = supervisorTaskCreatingIds.value.filter(id => id !== task.id)
  }
}

async function lockAddress(row: PrivateDeliveryPackage, item: PrivateAddressInventory) {
  if (isLockingAddress(item.id)) return
  addressLockingIds.value = [...addressLockingIds.value, item.id]
  try {
    const result = await privateDomainApi.lockAddressForDelivery(row.id, item.id)
    await loadDashboard()
    ElMessage.success(result.reused ? '该交付包已有锁定地址' : `已锁定地址: ${result.lock.remark}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '锁定地址失败')
  } finally {
    addressLockingIds.value = addressLockingIds.value.filter(id => id !== item.id)
  }
}

async function releaseActiveAddress(row: PrivateDeliveryPackage) {
  const lock = activeAddressLock(row)
  if (!lock) return
  await releaseAddress(lock)
}

async function releaseAddress(lock: PrivateAddressLock) {
  if (isReleasingAddress(lock.id)) return
  addressReleasingIds.value = [...addressReleasingIds.value, lock.id]
  try {
    await privateDomainApi.releaseAddressLock(lock.id)
    await loadDashboard()
    ElMessage.success('地址锁定已释放')
  } catch (error: any) {
    ElMessage.error(error?.message || '释放地址失败')
  } finally {
    addressReleasingIds.value = addressReleasingIds.value.filter(id => id !== lock.id)
  }
}

async function bindAddressResource(lock?: PrivateAddressLock) {
  if (!lock || isBindingAddressResource(lock.id)) return
  const resourceId = selectedAddressResourceIds[lock.id]
  if (!resourceId) {
    ElMessage.warning('请先选择一个可用地址资源')
    return
  }
  const resource = selectedAddressResource(lock, resourceId)
  try {
    await ElMessageBox.confirm(addressResourceConfirmMessage(lock, resourceId, resource), '确认补绑定地址资源', {
      confirmButtonText: '确认绑定',
      cancelButtonText: '再看看',
      type: 'warning'
    })
  } catch {
    return
  }
  addressResourceBindingIds.value = [...addressResourceBindingIds.value, lock.id]
  try {
    const result = await privateDomainApi.bindAddressResourceForLock(lock.id, resourceId)
    delete selectedAddressResourceIds[lock.id]
    await loadDashboard()
    ElMessage.success(result.reused ? '该锁定记录已绑定资源池' : `已补绑定资源: ${formatAddressResourceNo(result.lock.resourceId)}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '补绑定资源失败')
  } finally {
    addressResourceBindingIds.value = addressResourceBindingIds.value.filter(id => id !== lock.id)
  }
}

async function createAddressReplenishTask(item: PrivateAddressInventory) {
  if (isCreatingAddressReplenish(item.id)) return
  addressReplenishCreatingIds.value = [...addressReplenishCreatingIds.value, item.id]
  try {
    const result = await privateDomainApi.createAddressReplenishTask(item.id)
    await loadDashboard()
    taskFilter.value = 'address_stock'
    activeTab.value = 'tasks'
    ElMessage.success(result.reused ? '该地址已有未完成补货任务' : `已生成补货任务: ${result.task.title}`)
  } catch (error: any) {
    ElMessage.error(error?.message || '生成补货任务失败')
  } finally {
    addressReplenishCreatingIds.value = addressReplenishCreatingIds.value.filter(id => id !== item.id)
  }
}

async function updatePrivateTaskStatus(row: PrivateTask, status: PrivateTaskStatus) {
  if (isUpdatingTask(row.id)) return
  const relatedDelivery = taskDeliveryPackage(row)
  taskUpdatingIds.value = [...taskUpdatingIds.value, row.id]
  try {
    await privateDomainApi.updateTaskStatus(row.id, status)
    await loadDashboard()
    ElMessage.success(status === 'done' ? taskCompletionReviewText(row, relatedDelivery) : '任务已恢复待处理,已重新进入执行队列')
  } catch (error: any) {
    ElMessage.error(error?.message || '更新任务失败')
  } finally {
    taskUpdatingIds.value = taskUpdatingIds.value.filter(id => id !== row.id)
  }
}

async function createOrderDraft(row: PrivateFollowRecord) {
  if (row.orderNo) {
    ElMessage.info(`已生成提单草稿 ${row.orderNo}`)
    return
  }
  if (isCreatingOrderDraft(row.id)) return
  orderDraftCreatingIds.value = [...orderDraftCreatingIds.value, row.id]
  try {
    const result = await privateDomainApi.createOrderDraftFromFollowRecord(row.id)
    ElMessage.success(result.reused ? `已存在提单草稿 ${result.order.orderNo}` : `已生成提单草稿 ${result.order.orderNo}`)
    await loadContacts()
    activeTab.value = 'follow'
    if (drawer.row?.id === result.record.contactId) {
      drawer.row = contacts.value.find(item => item.id === result.record.contactId) || drawer.row
      await loadDrawerTimeline(result.record.contactId)
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '生成提单失败')
  } finally {
    orderDraftCreatingIds.value = orderDraftCreatingIds.value.filter(id => id !== row.id)
  }
}

function syncHint() {
  activeTab.value = 'config'
  ElMessage.info('请先在接入配置里保存企微参数。接通后会同步外部联系人、客户群、标签和互动记录。')
}

function goCompletedDeliveryQueue() {
  activeTab.value = 'follow'
  followFilter.value = 'completed_no_delivery'
  scrollPrivateTabsIntoView()
  if (followQueueCounts.value.completed_no_delivery === 0) {
    ElMessage.info('当前没有已完成待交付记录,请先导入客户并完成报价、提单和审批。')
  }
}

function focusFollowIssue(item: FollowFunnelIssue) {
  followFilter.value = item.filter
  if (item.count > 0) {
    ElMessage.info(`已筛选: ${item.title},共 ${item.count} 条`)
  } else {
    ElMessage.info(`${item.title}当前没有待处理记录`)
  }
}

function goTodayReviewAction(action: TodayReviewAction) {
  if (action === 'contacts') {
    activeTab.value = 'contacts'
    contactQuickFilter.value = contactQuickCounts.value.today_unfollowed > 0 ? 'today_unfollowed' : 'all'
  } else if (action === 'follow') {
    activeTab.value = 'follow'
    followFilter.value = followQueueCounts.value.quote_no_order > 0
      ? 'quote_no_order'
      : followQueueCounts.value.completed_no_delivery > 0
        ? 'completed_no_delivery'
        : followQueueCounts.value.order_pending > 0
          ? 'order_pending'
          : 'all'
  } else if (action === 'delivery') {
    activeTab.value = 'delivery'
    deliveryFilter.value = deliveryStats.value.overdue > 0
      ? 'overdue'
      : deliveryStats.value.addressUnbound > 0
        ? 'address_unbound'
        : 'all'
  } else if (action === 'tasks') {
    activeTab.value = 'tasks'
    taskFilter.value = taskStats.value.overdue > 0 ? 'overdue' : taskStats.value.pending > 0 ? 'pending' : 'all'
  }
  scrollPrivateTabsIntoView()
}

function showAllDeliveryPackages() {
  deliveryFilter.value = 'all'
  focusedDeliveryPackageId.value = null
  scrollPrivateTabsIntoView()
}

function showAddressBindingQueue() {
  activeTab.value = 'delivery'
  deliveryFilter.value = 'address_unbound'
  focusedDeliveryPackageId.value = null
  scrollPrivateTabsIntoView()
}

function focusAddressBindingIssue(issue: AddressBindingIssue) {
  activeTab.value = 'delivery'
  deliveryFilter.value = 'address_unbound'
  focusedDeliveryPackageId.value = issue.delivery.id
  scrollPrivateTabsIntoView()
  nextTick(() => openDeliveryPackage(issue.delivery))
}

function goImportPrivateContacts() {
  activeTab.value = 'import'
  scrollPrivateTabsIntoView()
}

function goStarterAction(action: StarterAction) {
  if (action === 'import') {
    activeTab.value = 'import'
  } else if (action === 'contacts') {
    activeTab.value = 'contacts'
  } else if (action === 'follow') {
    if (!contacts.value.length) {
      activeTab.value = 'import'
      scrollPrivateTabsIntoView()
      ElMessage.info('先导入或同步私域客户,再记录跟进。')
      return
    }
    activeTab.value = 'follow'
    followFilter.value = 'all'
    scrollPrivateTabsIntoView()
    nextTick(() => openFollowDialog())
    return
  } else if (action === 'quote') {
    activeTab.value = 'follow'
    followFilter.value = followQueueCounts.value.quote_no_order > 0 ? 'quote_no_order' : 'all'
  } else if (action === 'delivery') {
    activeTab.value = 'delivery'
    deliveryFilter.value = 'all'
  }
  scrollPrivateTabsIntoView()
}

function goOnlineLeads() {
  router.push('/leads/online-leads')
}

function goDistribution() {
  router.push('/system/distribute-config')
}

function goAction(path: string) {
  router.push(path)
}

async function saveOpsProfile() {
  profileSaving.value = true
  try {
    const saved = await privateDomainApi.saveOpsProfile({ ...opsProfile, answers: { ...opsProfile.answers } })
    Object.assign(opsProfile, saved)
    opsProfile.answers = { ...saved.answers }
    await loadDashboard()
    ElMessage.success('运营画像已保存,后续页面会按这个口径继续调整')
  } catch (error: any) {
    ElMessage.error(error?.message || '保存运营画像失败')
  } finally {
    profileSaving.value = false
  }
}

function queryValue(value: unknown) {
  if (Array.isArray(value)) return String(value[0] || '')
  return String(value || '')
}

function scrollPrivateTabsIntoView() {
  nextTick(() => {
    window.setTimeout(() => {
      document.querySelector('.private-domain-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  })
}

function applyRouteQueue() {
  const tab = queryValue(route.query.tab)
  let shouldScrollToTabs = false
  if (routeTabOptions.includes(tab)) {
    activeTab.value = tab
    shouldScrollToTabs = Boolean(tab)
  }

  const filter = queryValue(route.query.followFilter)
  if (routeFollowFilters.includes(filter as FollowFilter)) {
    followFilter.value = filter as FollowFilter
    activeTab.value = 'follow'
    shouldScrollToTabs = true
  }

  const deliveryQueue = queryValue(route.query.deliveryFilter)
  if (routeDeliveryFilters.includes(deliveryQueue as DeliveryFilter)) {
    deliveryFilter.value = deliveryQueue as DeliveryFilter
    activeTab.value = 'delivery'
    shouldScrollToTabs = true
  }
  const packageId = Number(queryValue(route.query.packageId))
  focusedDeliveryPackageId.value = Number.isFinite(packageId) && packageId > 0 ? packageId : null
  if (focusedDeliveryPackageId.value) {
    activeTab.value = 'delivery'
    shouldScrollToTabs = true
  }

  const taskQueue = queryValue(route.query.taskFilter)
  if (routeTaskFilters.includes(taskQueue as TaskFilter)) {
    taskFilter.value = taskQueue as TaskFilter
    activeTab.value = 'tasks'
    shouldScrollToTabs = true
  }
  if (shouldScrollToTabs) scrollPrivateTabsIntoView()
}

onMounted(async () => {
  applyRouteQueue()
  await loadContacts()
  applyRouteQueue()
})

watch(() => route.fullPath, applyRouteQueue)
</script>

<style scoped lang="scss">
.private-domain-page {
  padding: 20px;
  color: #1f2937;
}

.private-domain-tabs {
  scroll-margin-top: 76px;
}

.pd-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
  padding: 20px 22px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%);
  box-shadow: 0 8px 22px rgba(31, 47, 70, 0.06);

  h1 {
    margin: 6px 0;
    color: #111827;
    font-size: 26px;
  }

  p {
    max-width: 820px;
    margin: 0;
    color: #64748b;
    line-height: 1.6;
  }
}

.eyebrow {
  color: #245bdb;
  font-size: 12px;
  font-weight: 800;
}

.head-actions {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.landing-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 12px;
  margin-bottom: 14px;
}

.landing-copy,
.landing-profile,
.starter-strip,
.daily-card,
.profile-form-card,
.question-card,
.check-card {
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.landing-copy {
  padding: 18px 20px;

  h2 {
    margin: 6px 0;
    color: #111827;
    font-size: 22px;
  }

  p {
    max-width: 980px;
    margin: 0 0 14px;
    color: #64748b;
    line-height: 1.7;
  }
}

.flow-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  span {
    position: relative;
    padding: 7px 12px;
    border: 1px solid #c7d9ff;
    border-radius: 999px;
    background: #eef4ff;
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }
}

.landing-profile {
  display: grid;
  align-content: start;
  gap: 10px;
  padding: 18px;

  strong {
    color: #111827;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #64748b;
    line-height: 1.7;
  }
}

.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    padding: 4px 8px;
    border-radius: 999px;
    background: #f1f5f9;
    color: #475569;
    font-size: 12px;
  }
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.metric-card,
.connect-card,
.main-panel,
.group-card,
.config-card {
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.metric-card {
  padding: 15px 16px;

  span,
  em {
    display: block;
    color: #64748b;
    font-size: 12px;
    font-style: normal;
  }

  b {
    display: block;
    margin: 7px 0;
    color: #111827;
    font-size: 25px;
    line-height: 1.1;
  }
}

.today-review-panel {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);

  &.danger {
    border-color: #fecaca;
    background: #fff7f7;
  }

  &.warning {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.success {
    border-color: #bbf7d0;
    background: #f7fdf9;
  }
}

.today-review-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  span {
    color: #245bdb;
    font-size: 12px;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: #111827;
    font-size: 18px;
  }

  p {
    max-width: 820px;
    margin: 5px 0 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.6;
  }
}

.today-review-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.today-review-card {
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;

  &.danger {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &.warning {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.primary {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  b {
    color: #111827;
    font-size: 24px;
    line-height: 1.1;
  }

  p {
    min-height: 42px;
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.55;
  }

  span {
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }
}

.today-review-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.starter-strip {
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  gap: 14px;
  margin-bottom: 14px;
  padding: 14px;
}

.starter-head {
  display: grid;
  align-content: center;
  gap: 10px;

  div {
    display: grid;
    gap: 5px;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  strong {
    color: #111827;
    font-size: 18px;
  }
}

.starter-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.starter-step {
  display: grid;
  gap: 6px;
  min-height: 92px;
  padding: 12px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #f8fafc;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;

  &:hover {
    border-color: #3370ff;
    box-shadow: 0 8px 20px rgba(51, 112, 255, 0.12);
    transform: translateY(-1px);
  }

  span {
    width: fit-content;
    padding: 3px 7px;
    border-radius: 999px;
    background: #eef4ff;
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }

  strong {
    color: #111827;
    font-size: 14px;
  }

  em {
    color: #64748b;
    font-size: 12px;
    font-style: normal;
    line-height: 1.5;
  }

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;

    span {
      background: #dcfce7;
      color: #15803d;
    }
  }
}

.daily-action-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.daily-card {
  padding: 14px;
  border-left: 3px solid #3370ff;

  &.blocked {
    border-left-color: #ef4444;
  }

  &.doing {
    border-left-color: #0ea5e9;
  }

  &.done {
    border-left-color: #16a34a;
  }

  p {
    min-height: 42px;
    margin: 8px 0;
    color: #111827;
    line-height: 1.6;
  }
}

.daily-head,
.daily-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.daily-meta {
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;

  b {
    color: #245bdb;
  }
}

.connect-strip {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}

.connect-card {
  padding: 14px;
  border-left: 3px solid #3370ff;

  &.pending {
    border-left-color: #f59e0b;
  }

  &.blocked {
    border-left-color: #ef4444;
  }

  p {
    min-height: 42px;
    margin: 8px 0 12px;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.connect-head,
.connect-foot,
.group-head,
.config-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.connect-foot {
  color: #64748b;
  font-size: 12px;

  em {
    font-style: normal;
  }
}

.main-panel {
  padding: 14px;
}

.rule-panel,
.delivery-panel,
.follow-panel,
.wecom-config-card {
  padding: 16px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.wecom-config-card {
  margin-bottom: 12px;
}

.rule-toolbar,
.delivery-summary,
.follow-summary {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
}

.rule-toolbar {
  grid-template-columns: auto 1fr;
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;

  span:first-child {
    color: #245bdb;
    font-weight: 700;
  }
}

.ownership-table {
  :deep(.el-input-number) {
    width: 84px;
  }
}

.follow-summary {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.delivery-summary {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

.delivery-summary,
.follow-summary {

  div {
    display: grid;
    gap: 4px;
    padding: 12px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 20px;
  }
}

.follow-funnel-panel {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #fde68a;
  border-radius: 8px;
  background: #fffbeb;

  &.clear {
    border-color: #bbf7d0;
    background: #f7fdf9;
  }
}

.follow-funnel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: #111827;
    font-size: 14px;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.follow-funnel-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.follow-funnel-card {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;

  &.danger {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &.warning {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.primary {
    border-color: #bfdbfe;
    background: #eff6ff;
  }

  &.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  b {
    color: #111827;
    font-size: 22px;
    line-height: 1.1;
  }

  p {
    min-height: 52px;
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.55;
  }

  span {
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }
}

.follow-funnel-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.address-binding-audit {
  display: grid;
  gap: 12px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #f8fbff;

  &.clear {
    border-color: #bbf7d0;
    background: #f7fdf9;
  }
}

.audit-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: #111827;
    font-size: 14px;
  }

  p {
    max-width: 680px;
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.audit-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;

  div {
    display: grid;
    gap: 2px;
    padding: 8px 10px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #ffffff;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 18px;
  }
}

.audit-issue-list {
  display: grid;
  gap: 8px;
}

.audit-issue {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) auto minmax(220px, 1.2fr);
  gap: 8px 12px;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #ffffff;
  text-align: left;
  cursor: pointer;

  span {
    color: #111827;
    font-weight: 700;
  }

  strong {
    color: #245bdb;
    font-size: 13px;
  }

  em {
    grid-column: 1 / -1;
    color: #64748b;
    font-size: 12px;
    font-style: normal;
  }
}

.audit-empty-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #dcfce7;
  border-radius: 8px;
  background: #ffffff;
  color: #15803d;
  font-size: 12px;
}

.contact-quick-bar,
.follow-filter-bar,
.delivery-filter-bar,
.task-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.contact-quick-bar :deep(.el-radio-group),
.follow-filter-bar :deep(.el-radio-group),
.delivery-filter-bar :deep(.el-radio-group),
.task-filter-bar :deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.contact-quick-bar :deep(.el-radio-button__inner),
.follow-filter-bar :deep(.el-radio-button__inner),
.delivery-filter-bar :deep(.el-radio-button__inner),
.task-filter-bar :deep(.el-radio-button__inner) {
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  box-shadow: none;
}

.contact-quick-bar :deep(.el-radio-button:first-child .el-radio-button__inner),
.follow-filter-bar :deep(.el-radio-button:first-child .el-radio-button__inner),
.delivery-filter-bar :deep(.el-radio-button:first-child .el-radio-button__inner),
.task-filter-bar :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dbe5f2;
}

.contact-quick-bar span,
.follow-filter-bar span,
.delivery-filter-bar span,
.task-filter-bar span {
  max-width: 420px;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.must-handle-panel {
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;
}

.must-handle-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  div {
    display: grid;
    gap: 4px;
  }

  strong {
    color: #111827;
    font-size: 15px;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.must-handle-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.must-handle-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  min-width: 0;
  padding: 10px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #ffffff;

  &.danger {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &.warning {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.primary {
    border-color: #bfdbfe;
    background: #f8fbff;
  }
}

.must-handle-main {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;

  span {
    width: fit-content;
    padding: 2px 7px;
    border-radius: 999px;
    background: #e0edff;
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }

  strong,
  em,
  small {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #111827;
    font-size: 13px;
  }

  em,
  small {
    color: #64748b;
    font-size: 12px;
    font-style: normal;
  }
}

.delivery-empty-state {
  display: grid;
  gap: 14px;
  justify-items: center;
  padding: 28px 16px;
  color: #475569;
}

.delivery-empty-copy {
  display: grid;
  max-width: 560px;
  gap: 6px;
  text-align: center;

  strong {
    color: #111827;
    font-size: 16px;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 13px;
    line-height: 1.7;
  }
}

.delivery-empty-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 28px;
    padding: 0 10px;
    border: 1px solid #dbe5f2;
    border-radius: 999px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #245bdb;
    font-size: 14px;
  }
}

.delivery-empty-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
}

.follow-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.follow-form :deep(.el-select) {
  width: 100%;
}

.package-task-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.package-task-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 3px 8px 3px 4px;
  border: 1px solid #c7d9ff;
  border-radius: 999px;
  background: #eef4ff;
  color: #245bdb;
  font-size: 12px;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;
    color: #15803d;
  }

  &.overdue {
    border-color: #fecaca;
    background: #fef2f2;
    color: #b91c1c;
  }
}

.package-task-more {
  color: #64748b;
  font-size: 12px;
  font-style: normal;
}

.delivery-detail-body {
  display: grid;
  gap: 12px;
}

.delivery-detail-progress {
  display: grid;
  gap: 12px;
}

.delivery-progress-main {
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.delivery-progress-stats,
.delivery-check-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
}

.delivery-progress-stats span,
.delivery-check-grid div {
  display: grid;
  gap: 5px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #ffffff;
  color: #64748b;
  font-size: 12px;
}

.delivery-progress-stats b,
.delivery-check-grid b {
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.delivery-check-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.delivery-checklist {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.delivery-check-item {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.todo {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.risk {
    border-color: #fecaca;
    background: #fff1f2;
  }

  p {
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }
}

.delivery-check-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.delivery-archive-panel {
  display: grid;
  gap: 10px;
}

.delivery-archive-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;

  strong {
    color: #111827;
    font-size: 14px;
  }

  p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.delivery-archive-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.delivery-archive-card {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.todo {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.risk {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  p {
    min-height: 38px;
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }

  span {
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }
}

.delivery-archive-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.delivery-review-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #f8fbff;

  strong {
    color: #111827;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.delivery-review-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.address-lock-panel {
  display: grid;
  gap: 10px;
}

.address-lock-priority {
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px solid #edf2f7;
}

.address-lock-current {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 10px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #f0fdf4;

  strong {
    color: #166534;
    font-size: 13px;
  }

  p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
}

.address-resource-chip {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  margin-top: 7px;
  padding: 3px 8px;
  border: 1px solid #bfdbfe;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  cursor: pointer;
  font-family: 'JetBrains Mono', Consolas, monospace;
  font-size: 12px;
  font-weight: 700;

  &:hover {
    border-color: #93c5fd;
    background: #dbeafe;
  }
}

.address-lock-linkage {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 9px;

  div {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 8px;
    border: 1px solid #dbeafe;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.86);
  }

  span {
    color: #64748b;
    font-size: 11px;
  }

  b {
    overflow: hidden;
    color: #0f172a;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.address-lock-note {
  margin-top: 8px !important;
  padding: 8px 10px;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  background: #ffffff;
  color: #166534 !important;
}

.address-bind-repair {
  display: grid;
  gap: 8px;
  margin-top: 8px;
  padding: 8px;
  border: 1px dashed #f59e0b;
  border-radius: 8px;
  background: #fffbeb;
}

.address-bind-tip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  color: #92400e;
  font-size: 12px;
}

.address-bind-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
}

.address-bind-hint {
  color: #92400e;
  font-size: 12px;
  line-height: 1.5;
}

.address-inventory-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.address-inventory-item {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;

  &.low {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.blocked {
    border-color: #fecaca;
    background: #fef2f2;
  }

  &.active {
    border-color: #93c5fd;
    background: #eff6ff;
    box-shadow: inset 3px 0 0 #2563eb;
  }

  p {
    margin: 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
}

.address-inventory-tags {
  display: inline-flex;
  flex-shrink: 0;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 5px;
}

.address-inventory-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.address-inventory-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;

  span {
    display: grid;
    gap: 3px;
    min-width: 0;
    padding: 6px;
    border-radius: 6px;
    background: rgba(248, 250, 252, 0.9);
    color: #64748b;
    font-size: 12px;
  }

  b {
    overflow: hidden;
    color: #111827;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.address-inventory-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.delivery-task-detail-list {
  display: grid;
  gap: 8px;
}

.delivery-task-detail {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px;
  align-items: flex-start;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.overdue {
    border-color: #fecaca;
    background: #fef2f2;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }
}

.delivery-task-title {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;

  strong {
    min-width: 0;
    color: #111827;
    font-size: 13px;
  }
}

.delivery-order-summary {
  display: grid;
  gap: 4px;
}

.address-lock-cell {
  display: grid;
  justify-items: start;
  gap: 3px;

  :deep(.el-button) {
    height: auto;
    padding: 0;
    font-family: 'JetBrains Mono', Consolas, monospace;
    font-size: 12px;
    font-weight: 700;
  }

  span {
    color: #64748b;
    font-size: 12px;
    line-height: 1.35;
  }
}

:deep(.target-delivery-row) {
  --el-table-tr-bg-color: #eff6ff;
  box-shadow: inset 4px 0 0 #2563eb;
}

.delivery-progress-cell {
  display: grid;
  grid-template-columns: minmax(80px, 1fr) 34px;
  align-items: center;
  gap: 8px;

  span {
    color: #64748b;
    font-size: 12px;
    text-align: right;
  }
}

.delivery-action-cell {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2px;

  :deep(.el-button + .el-button) {
    margin-left: 0;
  }
}

.order-summary-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;

  strong {
    color: #111827;
    font-weight: 700;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.order-status-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.sync-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  min-height: 32px;
  align-items: center;
}

.diagnosis-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(360px, 0.8fr);
  gap: 12px;
}

.profile-form-card,
.question-card,
.check-card {
  padding: 16px;
}

.panel-title.compact {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;

  h2 {
    margin: 0;
    color: #111827;
    font-size: 18px;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 13px;
  }
}

.ops-form :deep(.el-checkbox-button__inner),
.question-list :deep(.el-radio-button__inner) {
  margin: 0 6px 6px 0;
  border: 1px solid #dbe5f2;
  border-radius: 999px;
  box-shadow: none;
}

.ops-form :deep(.el-checkbox-button:first-child .el-checkbox-button__inner),
.question-list :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dbe5f2;
}

.profile-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #edf2f7;
  color: #64748b;
  font-size: 12px;
}

.import-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  gap: 12px;
}

.import-main,
.paste-card,
.preview-panel {
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 18px rgba(31, 47, 70, 0.04);
}

.import-main,
.paste-card {
  padding: 16px;
}

.hidden-input {
  display: none;
}

.import-actions,
.paste-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.paste-actions {
  justify-content: space-between;
  margin-top: 10px;

  span {
    min-width: 0;
    overflow: hidden;
    color: #64748b;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.import-hint {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px 10px;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;

  b {
    color: #245bdb;
    white-space: nowrap;
  }
}

.template-table {
  margin-top: 12px;
}

.preview-panel {
  margin-top: 12px;
  padding: 14px;
}

.preview-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;

  div {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 20px;
    line-height: 1.1;
  }
}

.ok-text,
.warn-text,
.error-text {
  font-weight: 700;
}

.ok-text {
  color: #16a34a;
}

.warn-text {
  color: #d97706;
}

.error-text {
  color: #dc2626;
}

.verify-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px;

  span {
    width: 100%;
    overflow: hidden;
    color: #64748b;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &.compact {
    align-items: flex-start;

    span {
      width: 100%;
    }
  }
}

.question-stack {
  display: grid;
  gap: 12px;
}

.question-list {
  display: grid;
  gap: 14px;

  label {
    display: grid;
    gap: 8px;
  }

  span {
    color: #111827;
    font-weight: 700;
  }

  em {
    color: #64748b;
    font-size: 12px;
    font-style: normal;
    line-height: 1.5;
  }
}

.check-list {
  display: grid;
  gap: 10px;
}

.check-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 6px 10px;
  padding: 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;

  div {
    display: grid;
    gap: 4px;
  }

  strong {
    color: #111827;
  }

  span,
  p {
    color: #64748b;
    font-size: 12px;
    line-height: 1.5;
  }

  p {
    grid-column: 1 / -1;
    margin: 0;
  }
}

.toolbar {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 150px 150px auto auto;
  gap: 10px;
  margin-bottom: 12px;
}

.link-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #245bdb;
  font-weight: 700;
  cursor: pointer;
}

.mini-link-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: #245bdb;
  font-size: 12px;
  cursor: pointer;
}

.task-source-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.task-execution-summary {
  display: grid;
  grid-template-columns: minmax(260px, 0.8fr) minmax(360px, 1.2fr);
  gap: 12px;
  margin-bottom: 12px;
}

.task-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  div {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 18px;
  }
}

.task-group-panel {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid #dbe5f2;
  border-radius: 8px;
  background: #ffffff;
}

.task-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: #111827;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.task-group-list {
  display: grid;
  gap: 8px;
}

.task-group-item {
  display: grid;
  grid-template-columns: minmax(160px, 1fr) auto minmax(120px, 0.7fr);
  gap: 6px 10px;
  align-items: center;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fbff;
  text-align: left;
  cursor: pointer;

  span {
    overflow: hidden;
    color: #111827;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #245bdb;
    font-size: 12px;
  }

  em {
    grid-column: 1 / -1;
    color: #64748b;
    font-size: 12px;
    font-style: normal;
  }
}

.task-group-empty {
  padding: 14px;
  border: 1px dashed #dbe5f2;
  border-radius: 8px;
  color: #64748b;
  font-size: 12px;
  text-align: center;
}

.contact-table-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 10px;

  :deep(.el-button) {
    margin-left: 0;
  }
}

.sub-line {
  margin-top: 4px;
  color: #64748b;
  font-size: 12px;

  &.compact {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.score {
  color: #475569;

  &.hot {
    color: #dc2626;
  }
}

.group-grid,
.config-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.group-card,
.config-card {
  padding: 16px;
}

.group-head {
  margin-bottom: 12px;

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.group-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;

  span {
    display: grid;
    gap: 4px;
    padding: 10px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 18px;
  }
}

.group-card p,
.config-card p {
  margin: 0 0 12px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.group-foot {
  display: grid;
  gap: 8px;

  em {
    color: #245bdb;
    font-size: 12px;
    font-style: normal;
  }
}

.config-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 12px;

  span {
    display: grid;
    gap: 4px;
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
  }
}

.required-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  span {
    padding: 4px 8px;
    border: 1px solid #c7d9ff;
    border-radius: 999px;
    background: #eef4ff;
    color: #245bdb;
    font-size: 12px;
  }
}

.drawer-tags {
  margin-bottom: 12px;
}

.contact-ops-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;

  div {
    display: grid;
    gap: 5px;
    min-height: 94px;
    padding: 12px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
  }

  span,
  em {
    color: #64748b;
    font-size: 12px;
    font-style: normal;
    line-height: 1.5;
  }

  b {
    color: #111827;
    font-size: 15px;
  }
}

.contact-next-action-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #eff6ff;

  &.success {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.warning {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.danger {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &.info {
    border-color: #e2e8f0;
    background: #f8fafc;
  }
}

.contact-next-action-copy {
  display: grid;
  gap: 7px;
  min-width: 0;

  strong {
    color: #111827;
    font-size: 15px;
    line-height: 1.5;
  }

  p {
    margin: 0;
    color: #475569;
    font-size: 13px;
    line-height: 1.7;
  }
}

.contact-next-action-steps {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  max-width: 210px;

  :deep(.el-button) {
    margin-left: 0;
    border-radius: 999px;
    font-size: 12px;
    white-space: nowrap;
  }
}

.contact-duty-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.contact-duty-card {
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);

  p {
    min-height: 42px;
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }
}

.contact-duty-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;

  div {
    display: grid;
    gap: 4px;
    min-width: 0;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  strong {
    overflow: hidden;
    color: #111827;
    font-size: 15px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.contact-duty-action {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;

  span {
    min-width: 0;
    overflow: hidden;
    color: #64748b;
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :deep(.el-button) {
    margin-left: 0;
    border-radius: 999px;
    font-size: 12px;
    white-space: nowrap;
  }
}

.contact-evidence-panel {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}

.contact-evidence-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 8px;
  background: #f8fbff;

  strong {
    color: #111827;
    font-size: 14px;
  }

  p {
    margin: 5px 0 0;
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

.contact-evidence-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.contact-evidence-card {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;

  &.done {
    border-color: #bbf7d0;
    background: #f0fdf4;
  }

  &.todo {
    border-color: #fde68a;
    background: #fffbeb;
  }

  &.risk {
    border-color: #fecaca;
    background: #fff1f2;
  }

  &:hover {
    border-color: #93c5fd;
    box-shadow: 0 8px 18px rgba(37, 99, 235, 0.1);
    transform: translateY(-1px);
  }

  p {
    min-height: 38px;
    margin: 0;
    color: #475569;
    font-size: 12px;
    line-height: 1.6;
  }

  span {
    color: #245bdb;
    font-size: 12px;
    font-weight: 700;
  }
}

.contact-evidence-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  strong {
    min-width: 0;
    overflow: hidden;
    color: #111827;
    font-size: 13px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.mt {
  margin-top: 14px;
}

.verify-detail-card {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
}

.verify-detail-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: #111827;
  }

  p {
    margin: 4px 0 0;
    color: #64748b;
    font-size: 12px;
  }
}

.verify-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}

.verify-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  span {
    display: grid;
    gap: 4px;
    padding: 8px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #ffffff;
    color: #64748b;
    font-size: 12px;
  }

  b {
    overflow: hidden;
    color: #111827;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.verify-note {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.linkage-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  div {
    display: grid;
    gap: 5px;
    padding: 10px;
    border: 1px solid #edf2f7;
    border-radius: 8px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }

  b {
    color: #111827;
    font-size: 13px;
  }
}

.real-timeline {
  display: grid;
  gap: 12px;
}

.timeline-group-list,
.timeline-group {
  display: grid;
  gap: 10px;
}

.timeline-group {
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #ffffff;
}

.timeline-group-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  strong {
    color: #111827;
    font-size: 14px;
  }

  span {
    color: #64748b;
    font-size: 12px;
  }
}

.timeline-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.empty-timeline {
  padding: 12px;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}

.bd-timeline-dot {
  &.primary {
    background: #3370ff;
  }

  &.warning {
    background: #f59e0b;
  }

  &.danger {
    background: #ef4444;
  }

  &.info {
    background: #94a3b8;
  }
}

@media (max-width: 1280px) {
  .connect-strip,
  .metric-grid,
  .daily-action-grid,
  .today-review-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-panel,
  .diagnosis-layout,
  .import-layout,
  .starter-strip {
    grid-template-columns: 1fr;
  }

  .starter-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .toolbar {
    grid-template-columns: 1fr 140px 140px;
  }
}

@media (max-width: 900px) {
  .private-domain-page {
    padding: 12px;
  }

  .pd-head {
    align-items: stretch;
    flex-direction: column;
  }

  .connect-strip,
  .metric-grid,
  .daily-action-grid,
  .today-review-grid,
  .starter-steps,
  .group-grid,
  .config-grid,
  .toolbar,
  .preview-summary,
  .contact-ops-summary,
  .contact-duty-grid,
  .contact-evidence-summary,
  .contact-evidence-grid,
  .follow-funnel-grid,
  .must-handle-list,
  .must-handle-item,
  .audit-metrics,
  .audit-issue,
  .task-execution-summary,
  .task-metrics,
  .task-group-item,
  .delivery-summary,
  .delivery-progress-stats,
  .delivery-check-grid,
  .delivery-checklist,
  .delivery-archive-summary,
  .delivery-archive-grid,
  .delivery-review-card,
  .address-inventory-list,
  .verify-detail-grid,
  .config-meta {
    grid-template-columns: 1fr;
  }

  .verify-detail-head {
    flex-direction: column;
  }

  .audit-head {
    flex-direction: column;
  }

  .must-handle-head {
    flex-direction: column;
  }

  .today-review-head {
    flex-direction: column;
  }

  .follow-funnel-head {
    flex-direction: column;
  }

  .verify-tags {
    justify-content: flex-start;
  }

  .contact-quick-bar,
  .follow-filter-bar,
  .delivery-filter-bar,
  .task-filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .contact-next-action-card {
    grid-template-columns: 1fr;
  }

  .contact-next-action-steps {
    justify-content: flex-start;
    max-width: none;
  }

  .contact-duty-action {
    grid-template-columns: 1fr;
  }

  .timeline-group-head {
    align-items: flex-start;
    flex-direction: column;
  }

  .import-hint {
    grid-template-columns: 1fr;
  }
}
</style>

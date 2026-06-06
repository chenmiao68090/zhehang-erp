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
      <el-tabs v-model="activeTab">
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
              <el-table-column prop="data.source" label="来源" width="120" />
              <el-table-column prop="data.ownerName" label="负责人" width="110" />
              <el-table-column prop="data.serviceLine" label="业务线" width="120" />
              <el-table-column prop="data.estimatedAmount" label="预估金额" width="110" />
              <el-table-column prop="data.demand" label="客户需求" min-width="240" show-overflow-tooltip />
              <el-table-column label="问题" min-width="260">
                <template #default="{ row }">
                  <span v-if="row.status === 'ready'" class="ok-text">可导入</span>
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

          <el-table v-loading="loading" :data="contacts" border stripe height="560">
            <el-table-column label="客户" min-width="260" fixed="left">
              <template #default="{ row }">
                <button class="link-btn" @click.stop="openContact(row)">{{ row.companyName }}</button>
                <div class="sub-line">{{ row.name }} · {{ row.phone }}</div>
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
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click.stop="openContact(row)">详情</el-button>
                <el-button
                  link
                  type="success"
                  :loading="isConverting(row.id)"
                  :disabled="!!row.convertedLeadId || isConverting(row.id)"
                  @click.stop="convertLead(row)"
                >
                  {{ row.convertedLeadId ? '已入库' : '入库线索' }}
                </el-button>
                <el-button link type="warning" @click.stop="markIntent(row)">标记意向</el-button>
              </template>
            </el-table-column>
          </el-table>
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
          <el-table :data="tasks" border stripe>
            <el-table-column label="任务" min-width="260">
              <template #default="{ row }">
                <strong>{{ row.title }}</strong>
                <div class="sub-line">{{ row.action }}</div>
              </template>
            </el-table-column>
            <el-table-column label="客户" min-width="220">
              <template #default="{ row }">
                {{ row.companyName }}
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
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="接入配置" name="config">
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
          <div class="bd-kv wide"><span>客户需求</span><b>{{ drawer.row.demand }}</b></div>
          <div class="bd-kv wide"><span>下一动作</span><b>{{ drawer.row.nextAction }}</b></div>
        </div>
      </template>

      <div v-if="drawer.row">
        <div class="bd-section-title">私域标签</div>
        <div class="tag-list drawer-tags">
          <el-tag v-for="tag in drawer.row.tags" :key="tag" effect="plain">{{ tag }}</el-tag>
        </div>

        <div class="bd-section-title mt">链路勾稽</div>
        <div class="linkage-grid">
          <div><span>私域互动</span><b>{{ drawer.row.touchCount }} 次</b></div>
          <div><span>线索入库</span><b>{{ drawer.row.convertedLeadId ? `已入库 #${drawer.row.convertedLeadId}` : '未入库' }}</b></div>
          <div><span>归属池</span><b>{{ drawer.row.score >= 85 ? '线上获客公海池' : '新线索池' }}</b></div>
          <div><span>推荐动作</span><b>{{ drawer.row.stage === 'silent' ? '沉默唤醒' : '销售跟进' }}</b></div>
        </div>
      </div>

      <template #timeline>
        <div v-if="drawer.row">
          <div class="bd-timeline-item">
            <span class="bd-timeline-dot success"></span>
            <div>
              <strong>最近互动</strong>
              <p>{{ drawer.row.lastTouchAt }} · {{ drawer.row.source }} · {{ drawer.row.demand }}</p>
            </div>
          </div>
          <div class="bd-timeline-item">
            <span class="bd-timeline-dot"></span>
            <div>
              <strong>系统判断</strong>
              <p>评分 {{ drawer.row.score }} · 预估 {{ formatMoney(drawer.row.estimatedAmount) }} · 建议进入 {{ drawer.row.score >= 85 ? '高意向优先跟进' : '内容培育' }}</p>
            </div>
          </div>
          <div class="bd-timeline-item">
            <span class="bd-timeline-dot"></span>
            <div>
              <strong>下一步</strong>
              <p>{{ drawer.row.nextAction }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="drawer.visible = false">关闭</el-button>
        <el-button v-if="drawer.row" @click.stop="createFollowTask(drawer.row)">生成跟进任务</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Refresh, Search } from '@element-plus/icons-vue'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'
import {
  privateImportTemplateColumns,
  privateImportTemplateSamples,
  privateDomainApi,
  type DailyActionStatus,
  type IntegrationStatus,
  type OpsCheckStatus,
  type PrivateContact,
  type PrivateContactImportRow,
  type PrivateContent,
  type PrivateDailyAction,
  type PrivateGroup,
  type PrivateImportPreviewRow,
  type PrivateImportStatus,
  type PrivateIntegration,
  type PrivateOpsCheck,
  type PrivateOpsProfile,
  type PrivateSource,
  type PrivateStage,
  type PrivateSummary,
  type PrivateTask,
  type PrivateTaskStatus
} from '@/api/private-domain'

const router = useRouter()
const activeTab = ref('diagnosis')
const loading = ref(false)
const contacts = ref<PrivateContact[]>([])
const groups = ref<PrivateGroup[]>([])
const contents = ref<PrivateContent[]>([])
const tasks = ref<PrivateTask[]>([])
const integrations = ref<PrivateIntegration[]>([])
const convertingIds = ref<number[]>([])
const opsChecks = ref<PrivateOpsCheck[]>([])
const dailyActions = ref<PrivateDailyAction[]>([])
const profileSaving = ref(false)
const importColumns = privateImportTemplateColumns
const importPreview = ref<PrivateImportPreviewRow[]>([])
const importFileName = ref('')
const pasteText = ref('')
const importing = ref(false)
const fileInputRef = ref<HTMLInputElement>()
const summary = reactive<PrivateSummary>({
  contactCount: 0,
  intentCount: 0,
  silentCount: 0,
  convertedCount: 0,
  groupCount: 0,
  touchCount: 0,
  estimatedAmount: 0,
  funnel: [],
  sourceStats: []
})
const query = reactive<{ keyword: string; source: '' | PrivateSource; stage: '' | PrivateStage }>({
  keyword: '',
  source: '',
  stage: ''
})
const drawer = reactive<{ visible: boolean; row: PrivateContact | null }>({ visible: false, row: null })
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

const sourceOptions: PrivateSource[] = ['企业微信', '个人微信', '微信群', '朋友圈', '公众号', '视频号', '老客转介绍']
const serviceOptions = ['代理记账', '工商注册', '地址挂靠', '异常解除', '税务筹划', '公司注销', '同行渠道', '财税体检', '出口退税']
const departmentOptions = ['网销运营', '私域运营', '电销坐席', '销售顾问', '渠道经理', '财税交付', '财务核对', '老板/管理层']
const requiredFieldOptions = ['公司名称', '联系人', '手机号', '微信号', '来源触点', '客户需求', '工商状态', '税务资质', '地址需求', '预算金额', '负责人', '下次跟进时间']
const workflowSteps = ['私域触点', '公司核验', '查重分配', '销售跟进', '报价提单', '财税交付', '回款续费']
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
  error: importPreview.value.filter(item => item.status === 'error').length
}))
const stageOptions: Array<{ label: string; value: PrivateStage }> = [
  { label: '新触点', value: 'new' },
  { label: '培育中', value: 'nurturing' },
  { label: '有意向', value: 'intent' },
  { label: '已报价', value: 'quoted' },
  { label: '已成交', value: 'ordered' },
  { label: '沉默', value: 'silent' }
]

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

function taskStatusText(status: PrivateTaskStatus) {
  return ({ pending: '待处理', done: '已完成', overdue: '已逾期' } as Record<PrivateTaskStatus, string>)[status]
}

function taskStatusTag(status: PrivateTaskStatus) {
  return ({ pending: 'warning', done: 'success', overdue: 'danger' } as Record<PrivateTaskStatus, any>)[status]
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

function contentRate(row: PrivateContent) {
  if (!row.reachCount) return 0
  return Number((row.leadCount / row.reachCount * 100).toFixed(1))
}

function isConverting(id: number) {
  return convertingIds.value.includes(id)
}

async function loadDashboard() {
  const data = await privateDomainApi.dashboard()
  Object.assign(summary, data.summary)
  groups.value = data.groups
  contents.value = data.contents
  tasks.value = data.tasks
  integrations.value = data.integrations
  opsChecks.value = data.opsChecks
  dailyActions.value = data.dailyActions
  Object.assign(opsProfile, data.opsProfile)
  opsProfile.answers = { sourceTruth: '', ownerRule: '', successMetric: '', dataImport: '', ...(data.opsProfile.answers || {}) }
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
  loadContacts()
}

function openContact(row: PrivateContact) {
  drawer.row = row
  drawer.visible = true
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
  try {
    const task = await privateDomainApi.createTaskFromContact(row.id)
    ElMessage.success(`已生成跟进任务: ${task.title}`)
    await loadContacts()
  } catch (error: any) {
    ElMessage.error(error?.message || '生成跟进任务失败')
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

function syncHint() {
  ElMessage.info('当前为本地私域运营台。接入企业微信后,这里会自动同步外部联系人、客户群、标签和互动记录。')
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

onMounted(loadContacts)
</script>

<style scoped lang="scss">
.private-domain-page {
  padding: 20px;
  color: #1f2937;
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

.mt {
  margin-top: 14px;
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

@media (max-width: 1280px) {
  .connect-strip,
  .metric-grid,
  .daily-action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .landing-panel,
  .diagnosis-layout,
  .import-layout {
    grid-template-columns: 1fr;
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
  .group-grid,
  .config-grid,
  .toolbar,
  .preview-summary,
  .config-meta {
    grid-template-columns: 1fr;
  }

  .import-hint {
    grid-template-columns: 1fr;
  }
}
</style>

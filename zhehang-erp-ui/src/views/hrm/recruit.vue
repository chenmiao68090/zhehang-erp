<template>
  <div class="recruit-page">
    <section class="recruit-hero">
      <div>
        <div class="eyebrow">ZHEHANG · 招聘闭环</div>
        <h2>从招聘需求到入职留痕</h2>
        <p>统一管理招聘周期、人才库、约面登记、面试评价、待入职登记、Offer 和员工档案草稿。</p>
      </div>
      <div class="hero-metrics">
        <div class="metric">
          <strong>{{ metrics.openJobs }}</strong>
          <span>进行中需求</span>
        </div>
        <div class="metric">
          <strong>{{ metrics.activeCandidates }}</strong>
          <span>在流程候选人</span>
        </div>
        <div class="metric">
          <strong>{{ metrics.urgentJobs }}</strong>
          <span>临期/超期需求</span>
        </div>
      </div>
    </section>

    <el-card shadow="never" class="main-panel">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="招聘需求" name="jobs">
          <div class="toolbar">
            <div class="filters">
              <el-input v-model="jobQuery.title" clearable placeholder="搜索职位/需求名称" @keyup.enter="loadJobs" />
              <el-select v-model="jobQuery.status" clearable placeholder="状态" class="status-filter">
                <el-option v-for="item in recruitStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-button type="primary" @click="loadJobs">搜索</el-button>
              <el-button @click="resetJobQuery">重置</el-button>
            </div>
            <el-button type="primary" @click="openJobDialog()">新增招聘需求</el-button>
          </div>

          <el-table :data="jobs" v-loading="jobLoading" border stripe>
            <el-table-column prop="title" label="招聘需求" min-width="180" show-overflow-tooltip />
            <el-table-column label="招聘周期" width="220">
              <template #default="{ row }">
                <div class="date-range">
                  <span>{{ row.startDate || '-' }}</span>
                  <span>至</span>
                  <span>{{ row.planFinishDate || '-' }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="headcount" label="需求人数" width="92" align="center" />
            <el-table-column label="薪资范围" width="150" align="center">
              <template #default="{ row }">{{ salaryRange(row) }}</template>
            </el-table-column>
            <el-table-column prop="jobOwner" label="岗位负责人" width="120" />
            <el-table-column prop="recruitOwner" label="招聘负责人" width="120" />
            <el-table-column label="进度" width="150">
              <template #default="{ row }">
                <el-progress :percentage="jobProgress(row)" :stroke-width="8" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110">
              <template #default="{ row }">
                <el-tag :type="recruitStatusType(row.status)">{{ recruitStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="280" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openJobDialog(row)">编辑</el-button>
                <el-button link type="primary" @click="openCandidateDialog(row)">加候选人</el-button>
                <el-button v-if="row.status !== 1" link type="success" @click="changeJobStatus(row, 1)">开始</el-button>
                <el-button v-if="row.status === 1" link type="warning" @click="changeJobStatus(row, 2)">完成</el-button>
                <el-button v-if="row.status === 1" link type="danger" @click="changeJobStatus(row, 3)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="jobQuery.pageNum"
            v-model:page-size="jobQuery.pageSize"
            :total="jobTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            class="pagination"
            @size-change="loadJobs"
            @current-change="loadJobs"
          />
        </el-tab-pane>

        <el-tab-pane label="简历人才库" name="candidates">
          <div class="toolbar">
            <div class="filters">
              <el-input v-model="candidateQuery.keyword" clearable placeholder="姓名/电话/岗位/学历/标签" @keyup.enter="loadCandidates" />
              <el-select v-model="candidateQuery.status" clearable placeholder="候选人状态" class="status-filter">
                <el-option v-for="item in resumeStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-input v-model="candidateQuery.tags" clearable placeholder="标签: 代账/初级会计证" class="tag-filter" @keyup.enter="loadCandidates" />
              <el-date-picker
                v-model="interviewDateRange"
                type="daterange"
                value-format="YYYY-MM-DD"
                range-separator="至"
                start-placeholder="初面开始"
                end-placeholder="初面结束"
                class="interview-date-filter"
                @change="onInterviewDateRangeChange"
              />
              <el-button @click="filterTodayInterviews">今日约面</el-button>
              <el-button type="primary" @click="loadCandidates">搜索</el-button>
              <el-button @click="resetCandidateQuery">重置</el-button>
            </div>
            <el-button type="primary" @click="openCandidateDialog()">新增候选人</el-button>
          </div>

          <el-table :data="candidates" v-loading="candidateLoading" border stripe @row-click="selectCandidate">
            <el-table-column prop="positionName" label="应聘岗位" min-width="150" show-overflow-tooltip />
            <el-table-column prop="name" label="姓名" width="100" />
            <el-table-column prop="age" label="年龄" width="70" align="center" />
            <el-table-column prop="phone" label="电话" width="130" />
            <el-table-column prop="education" label="学历" width="90" />
            <el-table-column label="标签" min-width="190">
              <template #default="{ row }">
                <el-tag v-for="tag in tagList(row.tags)" :key="tag" size="small" class="tag">{{ tag }}</el-tag>
                <span v-if="!tagList(row.tags).length" class="muted">-</span>
              </template>
            </el-table-column>
            <el-table-column label="初面/复试" width="220">
              <template #default="{ row }">
                <div class="stacked">
                  <span>初面: {{ formatDateTime(row.firstInterviewTime) }}</span>
                  <span>复试: {{ formatDateTime(row.reInterviewTime) }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="resumeStatusType(row.status)">{{ resumeStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="附件" width="110">
              <template #default="{ row }">
                <el-button v-if="row.resumeFileId" link type="primary" @click.stop="downloadResume(row)">下载</el-button>
                <span v-else class="muted">无</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="300" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click.stop="openCandidateDialog(undefined, row)">编辑</el-button>
                <el-button link type="success" @click.stop="openInterviewDialog(row)">登记面试</el-button>
                <el-button v-if="[2, 7].includes(Number(row.status))" link type="warning" @click.stop="createOnboardingFromCandidate(row)">待入职</el-button>
                <el-button link type="info" @click.stop="openTimeline(row)">流转记录</el-button>
                <el-button link type="danger" @click.stop="removeCandidate(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="candidateQuery.pageNum"
            v-model:page-size="candidateQuery.pageSize"
            :total="candidateTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            class="pagination"
            @size-change="loadCandidates"
            @current-change="loadCandidates"
          />
        </el-tab-pane>

        <el-tab-pane label="面试流转" name="pipeline">
          <div class="pipeline">
            <div v-for="column in pipelineColumns" :key="column.status" class="pipeline-column">
              <div class="pipeline-title">
                <span>{{ column.title }}</span>
                <strong>{{ candidatesByStatus(column.status).length }}</strong>
              </div>
              <div v-for="item in candidatesByStatus(column.status)" :key="item.id" class="candidate-card" @click="openTimeline(item)">
                <div class="candidate-top">
                  <strong>{{ item.name }}</strong>
                  <el-tag size="small" :type="resumeStatusType(item.status)">{{ resumeStatusLabel(item.status) }}</el-tag>
                </div>
                <p>{{ item.positionName || matchJobTitle(item.recruitId) || '未关联岗位' }}</p>
                <div class="candidate-meta">
                  <span>{{ item.phone || '-' }}</span>
                  <span>{{ item.interviewer || '未定面试官' }}</span>
                </div>
                <div class="candidate-tags">
                  <el-tag v-for="tag in tagList(item.tags).slice(0, 3)" :key="tag" size="small" effect="plain">{{ tag }}</el-tag>
                </div>
                <el-button link type="primary" @click.stop="openInterviewDialog(item)">登记流转</el-button>
              </div>
              <el-empty v-if="!candidatesByStatus(column.status).length" description="暂无候选人" :image-size="64" />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="待入职" name="onboarding">
          <div class="toolbar">
            <div class="filters">
              <el-input v-model="onboardingQuery.keyword" clearable placeholder="姓名/电话/邮箱/岗位" @keyup.enter="loadOnboardings" />
              <el-select v-model="onboardingQuery.status" clearable placeholder="待入职状态" class="status-filter">
                <el-option v-for="item in onboardingStatusOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <el-button type="primary" @click="loadOnboardings">搜索</el-button>
              <el-button @click="resetOnboardingQuery">重置</el-button>
            </div>
          </div>

          <el-table :data="onboardings" v-loading="onboardingLoading" border stripe>
            <el-table-column prop="name" label="候选人" width="110" />
            <el-table-column prop="positionName" label="待入职岗位" min-width="150" show-overflow-tooltip />
            <el-table-column prop="phone" label="手机" width="130" />
            <el-table-column prop="email" label="邮箱" min-width="170" show-overflow-tooltip />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="onboardingStatusType(row.status)">{{ onboardingStatusLabel(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="预计入职" width="120">
              <template #default="{ row }">{{ row.expectedHireDate || '-' }}</template>
            </el-table-column>
            <el-table-column label="登记表" min-width="420">
              <template #default="{ row }">
                <div v-if="row.formToken" class="link-cell">
                  <div class="link-main">
                    <div class="public-link">
                      <el-tag size="small" type="success" effect="plain">公开免登录</el-tag>
                      <el-tag size="small" :type="onboardingLinkStatusType(row)" effect="plain">{{ onboardingLinkStatusLabel(row) }}</el-tag>
                      <span :title="onboardingFullLink(row)">{{ onboardingFullLink(row) }}</span>
                    </div>
                    <div class="link-meta">有效期至 {{ formatDateTime(row.tokenExpiresAt) || '-' }}</div>
                  </div>
                  <el-button link type="primary" @click="copyOnboardingLink(row)">复制</el-button>
                  <el-button link type="primary" @click="openOnboardingLink(row)">打开</el-button>
                  <el-button link type="warning" @click="refreshOnboardingToken(row)">刷新链接</el-button>
                </div>
                <span v-else class="muted">未生成</span>
              </template>
            </el-table-column>
            <el-table-column label="Offer" width="120">
              <template #default="{ row }">
                <el-tag v-if="row.offerSendStatus === 1" type="success">已标记发送</el-tag>
                <el-tag v-else-if="row.offerContent" type="primary">已生成</el-tag>
                <el-tag v-else type="info">未生成</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="380" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openSchemaDialog(row)">字段</el-button>
                <el-button v-if="row.formData" link type="info" @click="showSubmittedForm(row)">资料</el-button>
                <el-button link type="success" @click="confirmOnboardingForm(row)">确认资料</el-button>
                <el-button link type="primary" @click="openOfferDialog(row)">生成Offer</el-button>
                <el-button v-if="row.offerContent" link type="info" @click="showOffer(row)">查看Offer</el-button>
                <el-button v-if="row.offerContent" link type="warning" @click="markOfferSent(row)">标记发送</el-button>
                <el-button link type="success" @click="createEmployeeDraft(row)">员工草稿</el-button>
                <el-button link type="success" @click="markOnboarded(row)">完成入职</el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="onboardingQuery.pageNum"
            v-model:page-size="onboardingQuery.pageSize"
            :total="onboardingTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            class="pagination"
            @size-change="loadOnboardings"
            @current-change="loadOnboardings"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <el-dialog v-model="jobDialogVisible" :title="jobForm.id ? '编辑招聘需求' : '新增招聘需求'" width="720px" destroy-on-close>
      <el-form :model="jobForm" :rules="jobRules" ref="jobFormRef" label-width="110px">
        <el-form-item label="招聘职位" prop="title">
          <el-input v-model="jobForm.title" placeholder="例如: 代账会计 / 电销专员 / 销售经理" />
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="招聘人数" prop="headcount">
              <el-input-number v-model="jobForm.headcount" :min="1" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker v-model="jobForm.startDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="计划完成">
              <el-date-picker v-model="jobForm.planFinishDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="岗位负责人">
              <el-select
                v-model="jobForm.jobOwner"
                clearable
                filterable
                allow-create
                default-first-option
                :loading="employeeLoading"
                placeholder="选择用人部门负责人"
                style="width: 100%"
                @visible-change="handleInterviewerDropdownVisible"
              >
                <el-option
                  v-for="employee in interviewerOptions"
                  :key="`job-owner-${employee.userId}`"
                  :label="interviewerOptionLabel(employee)"
                  :value="employee.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="招聘负责人">
              <el-select
                v-model="jobForm.recruitOwner"
                clearable
                filterable
                allow-create
                default-first-option
                :loading="employeeLoading"
                placeholder="选择HR/招聘同事"
                style="width: 100%"
                @visible-change="handleInterviewerDropdownVisible"
              >
                <el-option
                  v-for="employee in interviewerOptions"
                  :key="`recruit-owner-${employee.userId}`"
                  :label="interviewerOptionLabel(employee)"
                  :value="employee.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="最低薪资">
              <el-input-number v-model="jobForm.salaryMin" :min="0" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最高薪资">
              <el-input-number v-model="jobForm.salaryMax" :min="0" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="任职要求">
          <el-input v-model="jobForm.requirements" type="textarea" :rows="4" placeholder="岗位职责、硬性要求、加分项、面试关注点" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="jobDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="jobSubmitting" @click="submitJob">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="candidateDialogVisible" :title="candidateForm.id ? '编辑候选人' : '新增候选人 / 约面登记'" width="780px" destroy-on-close>
      <el-form :model="candidateForm" :rules="candidateRules" ref="candidateFormRef" label-width="118px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="应聘岗位">
              <el-select v-model="candidateForm.recruitId" clearable filterable placeholder="选择招聘需求" style="width: 100%" @change="syncCandidatePosition">
                <el-option v-for="job in jobs" :key="job.id" :label="job.title" :value="job.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="岗位名称">
              <el-input v-model="candidateForm.positionName" placeholder="未建招聘需求时可手填" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="candidateForm.name" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="年龄">
              <el-input-number v-model="candidateForm.age" :min="16" :max="70" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="联系电话">
              <el-input v-model="candidateForm.phone" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="8">
            <el-form-item label="学历">
              <el-select v-model="candidateForm.education" clearable style="width: 100%">
                <el-option v-for="item in educationOptions" :key="item" :label="item" :value="item" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="工作年限">
              <el-input-number v-model="candidateForm.experienceYears" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="期望薪资">
              <el-input-number v-model="candidateForm.expectedSalary" :min="0" :precision="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="初面时间">
              <el-date-picker v-model="candidateForm.firstInterviewTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="复试时间">
              <el-date-picker v-model="candidateForm.reInterviewTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="是否需要复试">
              <el-switch v-model="candidateForm.needReInterview" active-text="需要" inactive-text="不需要" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面试官">
              <el-select
                v-model="candidateForm.interviewer"
                clearable
                filterable
                allow-create
                default-first-option
                :loading="employeeLoading"
                placeholder="选择公司人员或手动输入"
                style="width: 100%"
                @visible-change="handleInterviewerDropdownVisible"
                @change="onCandidateInterviewerChange"
              >
                <el-option
                  v-for="employee in interviewerOptions"
                  :key="`cand-interviewer-${employee.userId}`"
                  :label="interviewerOptionLabel(employee)"
                  :value="employee.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="人才标签">
          <el-select v-model="candidateTagValues" multiple filterable allow-create default-first-option style="width: 100%" placeholder="例如: 有代账经验、持初级会计证、可立即到岗">
            <el-option v-for="tag in quickTags" :key="tag" :label="tag" :value="tag" />
          </el-select>
        </el-form-item>
        <el-form-item label="附件简历">
          <el-upload
            drag
            :auto-upload="false"
            :limit="1"
            :file-list="resumeFileList"
            :on-change="handleResumeFileChange"
            :on-remove="handleResumeFileRemove"
          >
            <div class="upload-text">拖拽或点击上传简历附件</div>
            <template #tip>
              <div class="el-upload__tip">支持 PDF、Word、图片等常见简历文件。已上传: {{ candidateForm.resumeFileName || '无' }}</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="评价/备注">
          <el-input v-model="candidateForm.evaluation" type="textarea" :rows="3" placeholder="候选人亮点、风险、沟通情况" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="candidateDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="candidateSubmitting" @click="submitCandidate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="interviewDialogVisible" title="登记面试流转" width="660px" destroy-on-close>
      <el-form :model="interviewForm" :rules="interviewRules" ref="interviewFormRef" label-width="110px">
        <el-alert v-if="selectedCandidate" :title="`${selectedCandidate.name} · ${selectedCandidate.positionName || matchJobTitle(selectedCandidate.recruitId) || '未关联岗位'}`" type="info" :closable="false" class="candidate-alert" />
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="面试阶段" prop="stage">
              <el-select v-model="interviewForm.stage" style="width: 100%">
                <el-option label="简历筛选" value="screen" />
                <el-option label="初面" value="first" />
                <el-option label="复试" value="re_interview" />
                <el-option label="终面" value="final" />
                <el-option label="入职跟进" value="join" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="流转结果" prop="result">
              <el-select v-model="interviewForm.result" style="width: 100%">
                <el-option label="仅记录" value="record" />
                <el-option label="通过进入复试" value="first_pass" />
                <el-option label="面试通过进入待入职" value="pass" />
                <el-option label="确认入职" value="hired" />
                <el-option label="淘汰" value="reject" />
                <el-option label="通过但未入职" value="not_join" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="面试官">
              <el-select
                v-model="interviewForm.interviewer"
                clearable
                filterable
                allow-create
                default-first-option
                :loading="employeeLoading"
                placeholder="选择公司人员或手动输入"
                style="width: 100%"
                @visible-change="handleInterviewerDropdownVisible"
                @change="onInterviewInterviewerChange"
              >
                <el-option
                  v-for="employee in interviewerOptions"
                  :key="`rec-interviewer-${employee.userId}`"
                  :label="interviewerOptionLabel(employee)"
                  :value="employee.name"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="面试时间">
              <el-date-picker v-model="interviewForm.interviewTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="下一轮时间">
          <el-date-picker v-model="interviewForm.nextInterviewTime" type="datetime" value-format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </el-form-item>
        <el-form-item label="面试评价">
          <el-input v-model="interviewForm.evaluation" type="textarea" :rows="4" placeholder="面试官评价、专业能力、沟通意愿、薪资匹配度" />
        </el-form-item>
        <el-form-item label="原因说明" v-if="interviewForm.result === 'reject' || interviewForm.result === 'not_join'">
          <el-input v-model="interviewForm.rejectReason" type="textarea" :rows="3" placeholder="未通过原因 / 未入职原因，方便后续复盘" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="interviewDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="interviewSubmitting" @click="submitInterview">保存流转</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="schemaDialogVisible" title="入职登记表字段配置" width="760px" destroy-on-close>
      <el-alert title="字段配置保存后，新打开登记链接会按这份字段渲染。" type="info" :closable="false" class="candidate-alert" />
      <el-input v-model="schemaForm.formSchema" type="textarea" :rows="16" />
      <template #footer>
        <el-button @click="schemaDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="onboardingSubmitting" @click="submitSchema">保存字段</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="offerDialogVisible" title="生成 Offer" width="760px" destroy-on-close>
      <el-form :model="offerForm" label-width="110px">
        <el-form-item label="预计入职">
          <el-date-picker v-model="offerForm.expectedHireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="Offer模板">
          <el-input v-model="offerForm.offerTemplate" type="textarea" :rows="12" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="offerForm.remark" type="textarea" :rows="3" placeholder="薪资、试用期、报到材料等内部备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="offerDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="onboardingSubmitting" @click="submitOffer">生成 Offer</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="offerContentVisible" title="Offer 内容" width="720px">
      <pre class="offer-preview">{{ generatedOffer || '暂无 Offer 内容' }}</pre>
      <template #footer>
        <el-button @click="copyText(generatedOffer)">复制内容</el-button>
        <el-button type="primary" @click="offerContentVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="formDataVisible" title="候选人登记资料" width="720px">
      <pre class="offer-preview">{{ submittedFormPreview || '暂无提交资料' }}</pre>
      <template #footer>
        <el-button @click="copyText(submittedFormPreview)">复制资料</el-button>
        <el-button type="primary" @click="formDataVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="timelineVisible" title="候选人详情与流转记录" size="520px" destroy-on-close>
      <template v-if="selectedCandidate">
        <div class="drawer-profile">
          <div class="avatar">{{ selectedCandidate.name?.slice(0, 1) || '人' }}</div>
          <div>
            <h3>{{ selectedCandidate.name }}</h3>
            <p>{{ selectedCandidate.positionName || matchJobTitle(selectedCandidate.recruitId) || '未关联岗位' }} · {{ selectedCandidate.phone || '-' }}</p>
            <el-tag :type="resumeStatusType(selectedCandidate.status)">{{ resumeStatusLabel(selectedCandidate.status) }}</el-tag>
          </div>
        </div>
        <el-descriptions :column="1" border class="drawer-desc">
          <el-descriptions-item label="学历/年龄">{{ selectedCandidate.education || '-' }} / {{ selectedCandidate.age || '-' }}</el-descriptions-item>
          <el-descriptions-item label="标签">{{ tagList(selectedCandidate.tags).join('、') || '-' }}</el-descriptions-item>
          <el-descriptions-item label="初面时间">{{ formatDateTime(selectedCandidate.firstInterviewTime) }}</el-descriptions-item>
          <el-descriptions-item label="复试时间">{{ formatDateTime(selectedCandidate.reInterviewTime) }}</el-descriptions-item>
          <el-descriptions-item label="面试官">{{ selectedCandidate.interviewer || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedCandidate.rejectReason" label="未通过原因">{{ selectedCandidate.rejectReason }}</el-descriptions-item>
          <el-descriptions-item v-if="selectedCandidate.notJoinReason" label="未入职原因">{{ selectedCandidate.notJoinReason }}</el-descriptions-item>
        </el-descriptions>

        <div class="timeline-head">
          <h4>流转留痕</h4>
          <el-button type="primary" link @click="openInterviewDialog(selectedCandidate)">继续登记</el-button>
        </div>
        <el-timeline v-loading="timelineLoading">
          <el-timeline-item v-for="record in interviewRecords" :key="record.id" :timestamp="formatDateTime(record.interviewTime || record.createTime)" placement="top">
            <div class="timeline-card">
              <div class="timeline-card-title">
                <strong>{{ stageLabel(record.stage) }}</strong>
                <el-tag size="small">{{ resultLabel(record.result) }}</el-tag>
              </div>
              <p>面试官: {{ record.interviewer || '-' }}</p>
              <p v-if="record.evaluation">{{ record.evaluation }}</p>
              <p v-if="record.rejectReason" class="danger-text">{{ record.rejectReason }}</p>
              <p v-if="record.nextInterviewTime">下一轮: {{ formatDateTime(record.nextInterviewTime) }}</p>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-if="!timelineLoading && !interviewRecords.length" description="暂无流转记录" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import type { UploadFile, UploadUserFile } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus'
import { recruitApi, resumeApi, interviewRecordApi, onboardingApi } from '@/api/hrm'
import { fileInfoApi } from '@/api/file'

const activeTab = ref('jobs')
const jobLoading = ref(false)
const candidateLoading = ref(false)
const jobSubmitting = ref(false)
const candidateSubmitting = ref(false)
const interviewSubmitting = ref(false)
const timelineLoading = ref(false)
const onboardingLoading = ref(false)
const onboardingSubmitting = ref(false)
const employeeLoading = ref(false)

const jobs = ref<any[]>([])
const candidates = ref<any[]>([])
const interviewRecords = ref<any[]>([])
const onboardings = ref<any[]>([])
const interviewerOptions = ref<any[]>([])
const jobTotal = ref(0)
const candidateTotal = ref(0)
const onboardingTotal = ref(0)
const selectedCandidate = ref<any>(null)
const selectedOnboarding = ref<any>(null)

const jobDialogVisible = ref(false)
const candidateDialogVisible = ref(false)
const interviewDialogVisible = ref(false)
const timelineVisible = ref(false)
const schemaDialogVisible = ref(false)
const offerDialogVisible = ref(false)
const offerContentVisible = ref(false)
const formDataVisible = ref(false)
const jobFormRef = ref()
const candidateFormRef = ref()
const interviewFormRef = ref()
const resumeFileList = ref<UploadUserFile[]>([])
const generatedOffer = ref('')
const submittedFormPreview = ref('')
let pendingResumeFile: File | null = null
let interviewerOptionsLoaded = false

const recruitStatusOptions = [
  { label: '草稿', value: 0 },
  { label: '进行中', value: 1 },
  { label: '已完成', value: 2 },
  { label: '已取消', value: 3 }
]

const resumeStatusOptions = [
  { label: '待筛选', value: 0 },
  { label: '待面试', value: 1 },
  { label: '已通过', value: 2 },
  { label: '已淘汰', value: 3 },
  { label: '复试中', value: 4 },
  { label: '已入职', value: 5 },
  { label: '未入职', value: 6 },
  { label: '待入职', value: 7 }
]

const onboardingStatusOptions = [
  { label: '待发登记', value: 0 },
  { label: '已提交登记', value: 1 },
  { label: '信息已确认', value: 2 },
  { label: 'Offer已生成', value: 3 },
  { label: 'Offer已发送', value: 4 },
  { label: '员工草稿', value: 5 },
  { label: '已入职', value: 6 },
  { label: '已取消', value: 7 }
]

const pipelineColumns = [
  { title: '待筛选', status: 0 },
  { title: '待面试', status: 1 },
  { title: '复试中', status: 4 },
  { title: '待入职', status: 7 },
  { title: '已入职', status: 5 },
  { title: '淘汰/未入职', status: 3 }
]

const educationOptions = ['高中/中专', '大专', '本科', '硕士', '博士']
const quickTags = ['有代账经验', '持初级会计证', '持中级会计证', '可立即到岗', '有销售经验', '沟通能力强', '财税行业经验', '稳定性高']

const jobQuery = reactive({
  pageNum: 1,
  pageSize: 10,
  title: '',
  status: undefined as number | undefined
})

const candidateQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  keyword: '',
  status: undefined as number | undefined,
  tags: '',
  // 按初面时间筛选(方便查看当日约面),date range 双向绑定 interviewDateRange
  interviewDateStart: '' as string,
  interviewDateEnd: '' as string
})

// el-date-picker(daterange)绑定的中间态:[开始, 结束];拆分到 query 的两个参数
const interviewDateRange = ref<[string, string] | null>(null)

const onboardingQuery = reactive({
  pageNum: 1,
  pageSize: 20,
  keyword: '',
  status: undefined as number | undefined
})

const jobForm = reactive<any>({
  id: undefined,
  title: '',
  deptId: undefined,
  headcount: 1,
  salaryMin: undefined,
  salaryMax: undefined,
  startDate: '',
  planFinishDate: '',
  jobOwner: '',
  recruitOwner: '',
  requirements: '',
  status: 0
})

const candidateForm = reactive<any>({
  id: undefined,
  recruitId: undefined,
  positionName: '',
  name: '',
  age: undefined,
  phone: '',
  email: '',
  education: '',
  experienceYears: 0,
  currentCompany: '',
  expectedSalary: undefined,
  resumeUrl: '',
  resumeFileId: undefined,
  resumeFileName: '',
  tags: '',
  firstInterviewTime: '',
  needReInterview: false,
  reInterviewTime: '',
  interviewer: '',
  interviewerId: undefined,
  status: 0,
  evaluation: '',
  rejectReason: '',
  notJoinReason: ''
})

const candidateTagValues = ref<string[]>([])

const interviewForm = reactive<any>({
  resumeId: undefined,
  recruitId: undefined,
  stage: 'first',
  result: 'record',
  interviewer: '',
  interviewerId: undefined,
  interviewTime: '',
  nextInterviewTime: '',
  evaluation: '',
  rejectReason: ''
})

const schemaForm = reactive<any>({
  id: undefined,
  formSchema: ''
})

const offerForm = reactive<any>({
  id: undefined,
  expectedHireDate: '',
  offerTemplate: '',
  remark: ''
})

const jobRules = {
  title: [{ required: true, message: '请输入招聘职位', trigger: 'blur' }],
  headcount: [{ required: true, message: '请输入招聘人数', trigger: 'blur' }]
}

const candidateRules = {
  name: [{ required: true, message: '请输入候选人姓名', trigger: 'blur' }]
}

const interviewRules = {
  stage: [{ required: true, message: '请选择面试阶段', trigger: 'change' }],
  result: [{ required: true, message: '请选择流转结果', trigger: 'change' }]
}

const metrics = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  return {
    openJobs: jobs.value.filter((job) => job.status === 1).length,
    activeCandidates: candidates.value.filter((item) => [0, 1, 2, 4, 7].includes(Number(item.status))).length,
    urgentJobs: jobs.value.filter((job) => job.status === 1 && job.planFinishDate && job.planFinishDate <= today).length
  }
})

function recruitStatusLabel(status: number) {
  return recruitStatusOptions.find((item) => item.value === Number(status))?.label || '未知'
}

function recruitStatusType(status: number) {
  return ({ 0: 'info', 1: 'success', 2: 'primary', 3: 'danger' } as Record<number, string>)[Number(status)] || 'info'
}

function resumeStatusLabel(status: number) {
  return resumeStatusOptions.find((item) => item.value === Number(status))?.label || '未知'
}

function resumeStatusType(status: number) {
  return ({ 0: 'info', 1: 'warning', 2: 'primary', 3: 'danger', 4: 'warning', 5: 'success', 6: 'danger', 7: 'success' } as Record<number, string>)[Number(status)] || 'info'
}

function onboardingStatusLabel(status: number) {
  return onboardingStatusOptions.find((item) => item.value === Number(status))?.label || '未知'
}

function onboardingStatusType(status: number) {
  return ({ 0: 'warning', 1: 'primary', 2: 'success', 3: 'success', 4: 'success', 5: 'success', 6: 'success', 7: 'danger' } as Record<number, string>)[Number(status)] || 'info'
}

function isOnboardingTokenExpired(row: any) {
  if (!row?.tokenExpiresAt) return true
  return new Date(row.tokenExpiresAt).getTime() < Date.now()
}

function onboardingLinkStatusLabel(row: any) {
  if (row?.tokenUsedTime || Number(row?.status) >= 1) return '已提交失效'
  if (isOnboardingTokenExpired(row)) return '已过期'
  return '有效'
}

function onboardingLinkStatusType(row: any) {
  if (row?.tokenUsedTime || Number(row?.status) >= 1) return 'info'
  if (isOnboardingTokenExpired(row)) return 'danger'
  return 'success'
}

function stageLabel(stage: string) {
  const map: Record<string, string> = { screen: '简历筛选', first: '初面', re_interview: '复试', final: '终面', join: '入职跟进' }
  return map[stage] || stage || '-'
}

function resultLabel(result: string) {
  const map: Record<string, string> = { record: '仅记录', first_pass: '进入复试', next_round: '进入下一轮', pass: '进入待入职', reject: '淘汰', hired: '入职', not_join: '未入职' }
  return map[result] || result || '-'
}

function salaryRange(row: any) {
  const min = row.salaryMin ? Number(row.salaryMin).toFixed(0) : '0'
  const max = row.salaryMax ? Number(row.salaryMax).toFixed(0) : '0'
  return `${min}-${max}`
}

function jobProgress(row: any) {
  const hired = candidates.value.filter((item) => item.recruitId === row.id && item.status === 5).length
  const target = Number(row.headcount || 1)
  return Math.min(100, Math.round((hired / target) * 100))
}

function tagList(tags?: string) {
  return String(tags || '').split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  return String(value).replace('T', ' ').slice(0, 16)
}

function matchJobTitle(recruitId?: number) {
  return jobs.value.find((job) => Number(job.id) === Number(recruitId))?.title
}

function candidatesByStatus(status: number) {
  if (status === 3) {
    return candidates.value.filter((item) => [3, 6].includes(Number(item.status)))
  }
  return candidates.value.filter((item) => Number(item.status) === status)
}

function resetJobForm() {
  Object.assign(jobForm, {
    id: undefined,
    title: '',
    deptId: undefined,
    headcount: 1,
    salaryMin: undefined,
    salaryMax: undefined,
    startDate: '',
    planFinishDate: '',
    jobOwner: '',
    recruitOwner: '',
    requirements: '',
    status: 0
  })
}

function resetCandidateForm() {
  Object.assign(candidateForm, {
    id: undefined,
    recruitId: undefined,
    positionName: '',
    name: '',
    age: undefined,
    phone: '',
    email: '',
    education: '',
    experienceYears: 0,
    currentCompany: '',
    expectedSalary: undefined,
    resumeUrl: '',
    resumeFileId: undefined,
    resumeFileName: '',
    tags: '',
    firstInterviewTime: '',
    needReInterview: false,
    reInterviewTime: '',
    interviewer: '',
    interviewerId: undefined,
    status: 0,
    evaluation: '',
    rejectReason: '',
    notJoinReason: ''
  })
  candidateTagValues.value = []
  resumeFileList.value = []
  pendingResumeFile = null
}

async function loadJobs() {
  jobLoading.value = true
  try {
    const res: any = await recruitApi.list(jobQuery)
    jobs.value = res.data?.records || []
    jobTotal.value = res.data?.total || 0
  } finally {
    jobLoading.value = false
  }
}

async function loadCandidates() {
  candidateLoading.value = true
  try {
    const res: any = await resumeApi.list(candidateQuery)
    candidates.value = res.data?.records || []
    candidateTotal.value = res.data?.total || 0
  } finally {
    candidateLoading.value = false
  }
}

async function loadOnboardings() {
  onboardingLoading.value = true
  try {
    const res: any = await onboardingApi.list(onboardingQuery)
    onboardings.value = res.data?.records || []
    onboardingTotal.value = res.data?.total || 0
  } finally {
    onboardingLoading.value = false
  }
}

async function loadInterviewerOptions(force = false) {
  if (interviewerOptionsLoaded && !force) return
  employeeLoading.value = true
  try {
    // 只取"已开通账号的员工"(org_employee.user_id 非空),返回 userId 用于落 interviewerId
    const res: any = await recruitApi.colleagues()
    const records = res.data || []
    interviewerOptions.value = records
      .filter((item: any) => item?.userId && item?.name)
      .sort((a: any, b: any) => interviewerOptionLabel(a).localeCompare(interviewerOptionLabel(b), 'zh-Hans-CN'))
    interviewerOptionsLoaded = true
  } catch (_error) {
    ElMessage.warning('公司人员列表加载失败，可先手动输入人员姓名')
  } finally {
    employeeLoading.value = false
  }
}

function handleInterviewerDropdownVisible(visible: boolean) {
  if (visible) {
    loadInterviewerOptions()
  }
}

function interviewerOptionLabel(employee: any) {
  const dept = employee?.deptName || '未分部门'
  const post = employee?.postName || '未设岗位'
  return `${employee?.name || '-'} · ${dept}/${post}`
}

// 选中面试官姓名后,回填对应员工的 userId 到 interviewerId;
// 手动输入(allow-create)或选到非列表值时,清空 interviewerId(仅存姓名文本)。
function resolveInterviewerId(name?: string): number | undefined {
  if (!name) return undefined
  const matched = interviewerOptions.value.find((item: any) => item.name === name)
  return matched?.userId ?? undefined
}

function onCandidateInterviewerChange(name: string) {
  candidateForm.interviewerId = resolveInterviewerId(name)
}

function onInterviewInterviewerChange(name: string) {
  interviewForm.interviewerId = resolveInterviewerId(name)
}

async function refreshAll() {
  await Promise.all([loadJobs(), loadCandidates(), loadOnboardings()])
}

function handleTabChange(name: string | number) {
  if (name === 'pipeline') {
    loadCandidates()
  }
  if (name === 'onboarding') {
    loadOnboardings()
  }
}

function resetJobQuery() {
  jobQuery.title = ''
  jobQuery.status = undefined
  jobQuery.pageNum = 1
  loadJobs()
}

function resetCandidateQuery() {
  candidateQuery.keyword = ''
  candidateQuery.status = undefined
  candidateQuery.tags = ''
  candidateQuery.interviewDateStart = ''
  candidateQuery.interviewDateEnd = ''
  interviewDateRange.value = null
  candidateQuery.pageNum = 1
  loadCandidates()
}

// 初面时间区间选择 -> 拆分到 query 的起止参数,并回到第 1 页重新查询
function onInterviewDateRangeChange(range: [string, string] | null) {
  candidateQuery.interviewDateStart = range?.[0] || ''
  candidateQuery.interviewDateEnd = range?.[1] || ''
  candidateQuery.pageNum = 1
  loadCandidates()
}

// 快捷:查看当日约面(初面时间落在今天)
function filterTodayInterviews() {
  const today = new Date().toISOString().slice(0, 10)
  interviewDateRange.value = [today, today]
  candidateQuery.interviewDateStart = today
  candidateQuery.interviewDateEnd = today
  candidateQuery.pageNum = 1
  loadCandidates()
}

function resetOnboardingQuery() {
  onboardingQuery.keyword = ''
  onboardingQuery.status = undefined
  onboardingQuery.pageNum = 1
  loadOnboardings()
}

function openJobDialog(row?: any) {
  resetJobForm()
  if (row) Object.assign(jobForm, row)
  jobDialogVisible.value = true
  loadInterviewerOptions()
}

async function submitJob() {
  await jobFormRef.value?.validate()
  jobSubmitting.value = true
  try {
    if (jobForm.id) {
      await recruitApi.update(jobForm)
    } else {
      await recruitApi.create(jobForm)
    }
    ElMessage.success('招聘需求已保存')
    jobDialogVisible.value = false
    loadJobs()
  } finally {
    jobSubmitting.value = false
  }
}

async function changeJobStatus(row: any, status: number) {
  await recruitApi.changeStatus({ id: row.id, status })
  ElMessage.success('状态已更新')
  loadJobs()
}

function onboardingFormPath(row: any) {
  return row?.formToken ? `/onboarding/form/${encodeURIComponent(row.formToken)}` : ''
}

function onboardingFullLink(row: any) {
  const path = onboardingFormPath(row)
  return path ? new URL(path, window.location.origin).toString() : ''
}

async function copyText(text: string, successMessage = '已复制') {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
  } catch (_error) {
    const input = document.createElement('textarea')
    input.value = text
    document.body.appendChild(input)
    input.select()
    document.execCommand('copy')
    document.body.removeChild(input)
  }
  ElMessage.success(successMessage)
}

function copyOnboardingLink(row: any) {
  const link = onboardingFullLink(row)
  if (!link) {
    ElMessage.warning('登记链接还未生成')
    return
  }
  copyText(link, '已复制公开登记链接，候选人无需登录即可填写')
}

function openOnboardingLink(row: any) {
  const link = onboardingFullLink(row)
  if (!link) {
    ElMessage.warning('登记链接还未生成')
    return
  }
  window.open(link, '_blank', 'noopener,noreferrer')
}

async function refreshOnboardingToken(row: any) {
  await ElMessageBox.confirm(
    '刷新后旧登记链接会立即失效，新链接 48 小时内有效。确认刷新吗？',
    '刷新登记链接',
    {
      type: 'warning',
      confirmButtonText: '确认刷新',
      cancelButtonText: '取消'
    }
  )
  const res: any = await onboardingApi.refreshToken(row.id)
  Object.assign(row, res.data || {})
  const link = onboardingFullLink(row)
  if (link) {
    await copyText(link, '已刷新登记链接，并复制到剪贴板')
  } else {
    ElMessage.success('已刷新登记链接')
  }
}

async function createOnboardingFromCandidate(row: any) {
  const res: any = await onboardingApi.createFromResume(row.id)
  ElMessage.success('已进入待入职')
  activeTab.value = 'onboarding'
  selectedOnboarding.value = res.data
  await refreshAll()
}

async function removeCandidate(row: any) {
  await ElMessageBox.confirm(
    `确认删除候选人「${row.name || '未命名'}」吗？删除后将不再出现在简历人才库列表中，已产生的面试流转记录不会被清空。`,
    '删除候选人',
    {
      type: 'warning',
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      confirmButtonClass: 'el-button--danger'
    }
  )
  await resumeApi.remove(row.id)
  ElMessage.success('候选人已删除')
  if (selectedCandidate.value?.id === row.id) {
    selectedCandidate.value = null
    timelineVisible.value = false
  }
  await refreshAll()
}

function parseJson(value: any, fallback: any) {
  if (!value) return fallback
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch (_error) {
    return fallback
  }
}

function prettyJson(value: any) {
  return JSON.stringify(parseJson(value, []), null, 2)
}

function openSchemaDialog(row: any) {
  selectedOnboarding.value = row
  schemaForm.id = row.id
  schemaForm.formSchema = prettyJson(row.formSchema)
  schemaDialogVisible.value = true
}

async function submitSchema() {
  JSON.parse(schemaForm.formSchema || '[]')
  onboardingSubmitting.value = true
  try {
    await onboardingApi.update({ id: schemaForm.id, formSchema: schemaForm.formSchema })
    ElMessage.success('登记字段已保存')
    schemaDialogVisible.value = false
    loadOnboardings()
  } finally {
    onboardingSubmitting.value = false
  }
}

function defaultOfferTemplate() {
  return `亲爱的 {{name}}：

恭喜你通过浙杭集团 {{positionName}} 岗位面试。我们诚挚邀请你加入浙杭集团，预计入职日期为 {{expectedHireDate}}。

请入职当天携带身份证原件、银行卡信息、学历/证书材料，并保持电话 {{phone}} 畅通。如有疑问，请及时联系招聘负责人。

浙杭集团`
}

function openOfferDialog(row: any) {
  selectedOnboarding.value = row
  Object.assign(offerForm, {
    id: row.id,
    expectedHireDate: row.expectedHireDate || '',
    offerTemplate: row.offerTemplate || defaultOfferTemplate(),
    remark: row.remark || ''
  })
  offerDialogVisible.value = true
}

async function submitOffer() {
  onboardingSubmitting.value = true
  try {
    const res: any = await onboardingApi.generateOffer(offerForm.id, offerForm)
    generatedOffer.value = res.data?.offerContent || ''
    ElMessage.success('Offer 已生成')
    offerDialogVisible.value = false
    offerContentVisible.value = true
    loadOnboardings()
  } finally {
    onboardingSubmitting.value = false
  }
}

function showOffer(row: any) {
  generatedOffer.value = row.offerContent || ''
  offerContentVisible.value = true
}

function showSubmittedForm(row: any) {
  submittedFormPreview.value = JSON.stringify(parseJson(row.formData, {}), null, 2)
  formDataVisible.value = true
}

async function confirmOnboardingForm(row: any) {
  await onboardingApi.confirmForm(row.id)
  ElMessage.success('入职资料已确认')
  loadOnboardings()
}

async function markOfferSent(row: any) {
  await onboardingApi.markOfferSent(row.id)
  ElMessage.success('已标记 Offer 发送')
  loadOnboardings()
}

async function createEmployeeDraft(row: any) {
  await onboardingApi.createEmployeeDraft(row.id)
  ElMessage.success('员工档案草稿已生成')
  loadOnboardings()
}

async function markOnboarded(row: any) {
  await ElMessageBox.confirm('确认该候选人已正式入职？系统会把员工档案状态改为试用，并把候选人标记为已入职。', '确认入职', {
    confirmButtonText: '确认入职',
    cancelButtonText: '取消',
    type: 'warning'
  })
  await onboardingApi.markOnboarded(row.id)
  ElMessage.success('已进入花名册')
  refreshAll()
}

function openCandidateDialog(job?: any, row?: any) {
  resetCandidateForm()
  loadInterviewerOptions()
  if (job) {
    candidateForm.recruitId = job.id
    candidateForm.positionName = job.title
  }
  if (row) {
    Object.assign(candidateForm, row)
    candidateTagValues.value = tagList(row.tags)
    if (row.resumeFileName) {
      resumeFileList.value = [{ name: row.resumeFileName }]
    }
  }
  candidateDialogVisible.value = true
}

function syncCandidatePosition() {
  const job = jobs.value.find((item) => Number(item.id) === Number(candidateForm.recruitId))
  if (job) {
    candidateForm.positionName = job.title
  }
}

function handleResumeFileChange(file: UploadFile) {
  pendingResumeFile = file.raw || null
  resumeFileList.value = file ? [{ name: file.name, raw: file.raw as any }] : []
}

function handleResumeFileRemove() {
  pendingResumeFile = null
  resumeFileList.value = []
  // 用空字符串而非 undefined：后端 updateById 会跳过 null/undefined 字段，
  // 清空简历必须传 '' 才能真正落库删除关联。
  candidateForm.resumeFileId = ''
  candidateForm.resumeFileName = ''
  candidateForm.resumeUrl = ''
}

async function submitCandidate() {
  await candidateFormRef.value?.validate()
  candidateSubmitting.value = true
  try {
    candidateForm.tags = candidateTagValues.value.join(',')
    if (pendingResumeFile) {
      const uploadRes: any = await fileInfoApi.upload(pendingResumeFile)
      candidateForm.resumeFileId = uploadRes?.data?.id
      candidateForm.resumeFileName = uploadRes?.data?.originalName || uploadRes?.data?.fileName || pendingResumeFile.name
      candidateForm.resumeUrl = candidateForm.resumeFileName
    }
    if (candidateForm.id) {
      await resumeApi.update(candidateForm)
    } else {
      await resumeApi.create(candidateForm)
    }
    ElMessage.success('候选人已保存')
    candidateDialogVisible.value = false
    refreshAll()
  } finally {
    candidateSubmitting.value = false
  }
}

function selectCandidate(row: any) {
  selectedCandidate.value = row
}

function openInterviewDialog(row: any) {
  selectedCandidate.value = row
  loadInterviewerOptions()
  Object.assign(interviewForm, {
    resumeId: row.id,
    recruitId: row.recruitId,
    stage: row.status === 4 ? 're_interview' : 'first',
    result: 'record',
    interviewer: row.interviewer || '',
    interviewerId: row.interviewerId ?? undefined,
    interviewTime: '',
    nextInterviewTime: '',
    evaluation: row.evaluation || '',
    rejectReason: ''
  })
  interviewDialogVisible.value = true
}

async function submitInterview() {
  await interviewFormRef.value?.validate()
  interviewSubmitting.value = true
  try {
    await interviewRecordApi.create(interviewForm)
    ElMessage.success('面试流转已记录')
    interviewDialogVisible.value = false
    await loadCandidates()
    // pass 会新建待入职记录;reject/not_join 会取消已生成的待入职记录 —— 两种都要刷新待入职列表,让候选人即时移入/移出。
    if (['pass', 'reject', 'not_join'].includes(interviewForm.result)) {
      await loadOnboardings()
    }
    if (timelineVisible.value && selectedCandidate.value) {
      const fresh = candidates.value.find((item) => item.id === selectedCandidate.value.id)
      if (fresh) selectedCandidate.value = fresh
      await loadTimeline(selectedCandidate.value)
    }
  } finally {
    interviewSubmitting.value = false
  }
}

async function openTimeline(row: any) {
  selectedCandidate.value = row
  timelineVisible.value = true
  await loadTimeline(row)
}

async function loadTimeline(row: any) {
  timelineLoading.value = true
  try {
    const res: any = await interviewRecordApi.list(row.id)
    interviewRecords.value = res.data || []
  } finally {
    timelineLoading.value = false
  }
}

async function downloadResume(row: any) {
  if (!row.resumeFileId) return
  const blob: any = await fileInfoApi.download(row.resumeFileId)
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = row.resumeFileName || `${row.name || '候选人'}简历`
  link.click()
  window.URL.revokeObjectURL(url)
}

onMounted(() => {
  refreshAll()
})
</script>

<style scoped>
.recruit-page {
  padding: 18px;
  background: #f6f7fb;
  min-height: calc(100vh - 60px);
}

.recruit-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 24px 28px;
  margin-bottom: 16px;
  border-radius: 8px;
  color: #fff;
  background: linear-gradient(135deg, #2563eb 0%, #7aa7ff 100%);
}

.eyebrow {
  display: inline-flex;
  padding: 3px 10px;
  margin-bottom: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  font-size: 12px;
}

.recruit-hero h2 {
  margin: 0 0 8px;
  font-size: 26px;
  line-height: 1.25;
}

.recruit-hero p {
  margin: 0;
  max-width: 760px;
  color: rgba(255, 255, 255, 0.88);
}

.hero-metrics {
  display: grid;
  grid-template-columns: repeat(3, 108px);
  gap: 12px;
}

.metric {
  padding: 16px 10px;
  border-radius: 8px;
  text-align: center;
  background: rgba(255, 255, 255, 0.18);
}

.metric strong {
  display: block;
  font-size: 26px;
  line-height: 1;
}

.metric span {
  display: block;
  margin-top: 8px;
  font-size: 12px;
}

.main-panel {
  border-radius: 8px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.filters {
  display: flex;
  flex: 1;
  gap: 10px;
}

.filters .el-input {
  max-width: 280px;
}

.status-filter {
  width: 150px;
}

.tag-filter {
  width: 220px;
}

.interview-date-filter {
  width: 260px;
}

.link-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.link-main {
  display: flex;
  flex: 1;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
}

.public-link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.public-link span:last-child {
  overflow: hidden;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-meta {
  color: #94a3b8;
  font-size: 12px;
  line-height: 18px;
}

.pagination {
  margin-top: 16px;
  justify-content: flex-end;
}

.date-range,
.stacked {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #475569;
  font-size: 12px;
}

.tag {
  margin-right: 6px;
  margin-bottom: 4px;
}

.muted {
  color: #94a3b8;
}

.pipeline {
  display: grid;
  grid-template-columns: repeat(6, minmax(190px, 1fr));
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.pipeline-column {
  min-height: 520px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}

.pipeline-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  color: #0f172a;
  font-weight: 600;
}

.pipeline-title strong {
  min-width: 24px;
  height: 24px;
  border-radius: 12px;
  text-align: center;
  line-height: 24px;
  color: #2563eb;
  background: #dbeafe;
}

.candidate-card {
  padding: 12px;
  margin-bottom: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.candidate-top,
.candidate-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.candidate-card p {
  margin: 8px 0;
  color: #475569;
}

.candidate-meta {
  color: #64748b;
  font-size: 12px;
}

.candidate-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-height: 24px;
  margin-top: 8px;
}

.upload-text {
  color: #475569;
}

.candidate-alert {
  margin-bottom: 16px;
}

.drawer-profile {
  display: flex;
  gap: 14px;
  align-items: center;
  margin-bottom: 18px;
}

.avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
  background: #2563eb;
}

.drawer-profile h3 {
  margin: 0 0 4px;
}

.drawer-profile p {
  margin: 0 0 8px;
  color: #64748b;
}

.drawer-desc {
  margin-bottom: 20px;
}

.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.timeline-head h4 {
  margin: 0;
}

.timeline-card {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
}

.timeline-card-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.timeline-card p {
  margin: 4px 0;
  color: #475569;
}

.danger-text {
  color: #dc2626 !important;
}

.offer-preview {
  max-height: 520px;
  padding: 14px;
  overflow: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #334155;
  background: #f8fafc;
  line-height: 1.8;
  white-space: pre-wrap;
}

@media (max-width: 1200px) {
  .recruit-hero {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-metrics {
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
  }

  .toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .filters {
    flex-wrap: wrap;
  }
}
</style>

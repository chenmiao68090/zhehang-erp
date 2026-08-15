<template>
  <div class="ci">
    <header class="ci-head">
      <div class="ci-head-main">
        <div class="ci-title-line">
          <el-tag type="primary" effect="plain">服务工单</el-tag>
          <h2 class="ci-title">服务工单</h2>
        </div>
        <p class="ci-sub">
          客户问题、催办、咨询统一变成服务任务:一个主办人、一个截止时间、一个处理结果,过程围绕客户闭环。
        </p>
        <div class="ci-rules">
          <span><el-icon><UserFilled /></el-icon> 主办人负责闭环</span>
          <span><el-icon><Timer /></el-icon> 按 SLA 截止</span>
          <span><el-icon><CircleCheck /></el-icon> 完成必须写结果</span>
        </div>
      </div>
      <el-button type="primary" size="large" @click="openForm()">
        <el-icon><Plus /></el-icon>
        新建服务工单
      </el-button>
    </header>

    <div class="ci-stats">
      <button class="ci-stat" type="button" @click="clearFastFilter">
        <span class="ci-stat-num">{{ stats.todayNew || 0 }}</span>
        <span class="ci-stat-label">今日新问题</span>
      </button>
      <button class="ci-stat" type="button" @click="filterStatus('pending')">
        <span class="ci-stat-num is-warning">{{ stats.unhandled || 0 }}</span>
        <span class="ci-stat-label">待接单</span>
      </button>
      <button class="ci-stat" type="button" @click="filterOverdue">
        <span class="ci-stat-num is-danger">{{ stats.overdue || 0 }}</span>
        <span class="ci-stat-label">已逾期</span>
      </button>
      <button class="ci-stat" type="button" @click="filterP0">
        <span class="ci-stat-num is-danger">{{ stats.p0 || 0 }}</span>
        <span class="ci-stat-label">P0 升级关注</span>
      </button>
    </div>

    <div class="ci-board">
      <div class="ci-stage-bar">
        <el-radio-group v-model="query.status" size="large" @change="onStatusChange">
          <el-radio-button label="">全部</el-radio-button>
          <el-radio-button v-for="s in STATUS_TABS" :key="s.value" :label="s.value">{{ s.label }}</el-radio-button>
        </el-radio-group>
        <el-tag v-if="query.unhandled" closable type="warning" @close="clearFastFilter">
          老板下钻：未处理（待接单、处理中、等客户反馈）
        </el-tag>
        <el-tag v-else-if="query.openOnly" closable type="danger" @close="clearFastFilter">
          老板下钻：仅看未结案
        </el-tag>
      </div>

      <div class="ci-toolbar">
        <el-input
          v-model="query.keyword"
          class="ci-search"
          placeholder="搜客户、编号、问题关键词"
          clearable
          @keyup.enter="reload"
          @clear="reload"
        />
        <el-select v-model="query.priority" placeholder="紧急度" clearable class="ci-filter" @change="onPriorityFilterChange">
          <el-option v-for="p in PRIORITIES" :key="p.value" :label="p.label" :value="p.value" />
        </el-select>
        <el-select v-model="query.issueType" placeholder="服务类型" clearable class="ci-filter" @change="reload">
          <el-option v-for="t in ISSUE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-select v-model="query.ownerId" placeholder="主办人" clearable filterable class="ci-filter" @change="reload">
          <el-option v-for="u in staffList" :key="u.id" :label="u.name" :value="u.id" />
        </el-select>
        <el-select v-model="query.overdue" placeholder="时效" clearable class="ci-filter" @change="onOverdueChange">
          <el-option label="仅看逾期" :value="true" />
        </el-select>
        <el-button @click="reload"><el-icon><Search /></el-icon> 查询</el-button>
      </div>

      <el-table :data="rows" v-loading="loading" :row-class-name="rowClass" class="ci-table" border>
        <el-table-column label="服务任务" min-width="310" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="ci-task-cell">
              <div class="ci-task-top">
                <el-tag size="small" effect="plain">{{ row.issueNo || '未编号' }}</el-tag>
                <span class="ci-customer">{{ row.customerName || '未填写客户' }}</span>
              </div>
              <div class="ci-task-desc">{{ row.description || '暂无问题描述' }}</div>
              <div class="ci-task-meta">
                <span>{{ labelOf(SOURCES, row.source) }}</span>
                <span>{{ labelOf(ISSUE_TYPES, row.issueType) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="主办/协同" width="150">
          <template #default="{ row }">
            <div class="ci-people">
              <span class="ci-owner">{{ row.ownerName || '待指定' }}</span>
              <span v-if="row.assistName" class="ci-assist">协同:{{ row.assistName }}</span>
              <span v-else class="ci-assist">协同:无</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="SLA" width="180">
          <template #default="{ row }">
            <div class="ci-sla">
              <el-tag :type="prioTag(row.priority)" size="small" effect="dark">{{ labelOf(PRIORITIES, row.priority) }}</el-tag>
              <span :class="{ 'is-overdue': isOverdue(row) }">{{ fmtTime(row.deadline) }}</span>
              <em :class="{ 'is-overdue': isOverdue(row) }">{{ deadlineHint(row) }}</em>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态与下一步" min-width="190">
          <template #default="{ row }">
            <div class="ci-next">
              <el-tag :type="statusTag(row.status)" size="small">{{ labelOf(STATUS, row.status) }}</el-tag>
              <span>{{ nextAction(row) }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="140">
          <template #default="{ row }">{{ fmtTime(row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="245" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link type="primary" @click="openDetail(row)">详情</el-button>
            <el-button size="small" link type="primary" @click="openForm(row)">编辑</el-button>
            <el-button
              v-if="row.status === 'pending'"
              size="small"
              link
              type="success"
              :loading="row._saving"
              @click="quickStatus(row, 'processing')"
            >
              开始处理
            </el-button>
            <el-button
              v-if="row.status === 'processing'"
              size="small"
              link
              type="warning"
              :loading="row._saving"
              @click="quickStatus(row, 'waiting')"
            >
              等客户
            </el-button>
            <el-button
              v-if="row.status !== 'completed' && row.status !== 'closed'"
              size="small"
              link
              type="success"
              :loading="row._saving"
              @click="completeIssue(row)"
            >
              完成
            </el-button>
            <el-button v-if="canAssign" size="small" link type="primary" @click="openAssign(row)">调整主办</el-button>
            <el-button v-if="canClose && row.status !== 'closed'" size="small" link type="danger" @click="closeIssue(row)">关闭</el-button>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty description="还没有服务工单" :image-size="80">
            <el-button type="primary" @click="openForm()">新建服务工单</el-button>
          </el-empty>
        </template>
      </el-table>

      <div class="ci-pager">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="loadData"
          @size-change="reload"
        />
      </div>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="form.id ? '编辑服务工单' : '新建服务工单'"
      width="920px"
      top="6vh"
      destroy-on-close
    >
      <el-form :model="form" label-position="top" class="ci-form">
        <div class="ci-form-main">
          <section class="ci-form-section">
            <div class="ci-section-title">
              <span>1. 客户与问题</span>
              <small>把客户原话和影响写清楚,后面才好处理</small>
            </div>
            <el-form-item label="客户" required>
              <el-select
                v-model="form.customerName"
                filterable
                allow-create
                default-first-option
                remote
                clearable
                :remote-method="remoteCustomers"
                placeholder="搜索选择客户,或直接输入客户名称"
                style="width:100%"
                @change="onPickCustomer"
              >
                <el-option v-for="c in clients" :key="c.id" :label="c.name" :value="c.name" />
              </el-select>
            </el-form-item>
            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="来源">
                  <el-select v-model="form.source" clearable placeholder="客户从哪里反馈" style="width:100%">
                    <el-option v-for="s in SOURCES" :key="s.value" :label="s.label" :value="s.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="服务类型">
                  <el-select v-model="form.issueType" clearable placeholder="问题归类" style="width:100%">
                    <el-option v-for="t in ISSUE_TYPES" :key="t.value" :label="t.label" :value="t.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="问题描述" required>
              <template #label>
                <div class="ci-label-line">
                  <span>问题描述</span>
                  <el-button link type="primary" @click="applyDescriptionTemplate">套用模板</el-button>
                </div>
              </template>
              <el-input
                v-model="form.description"
                type="textarea"
                :rows="6"
                maxlength="2000"
                show-word-limit
                placeholder="建议写:客户反馈什么、影响什么、客户期望什么、已承诺下一步是什么。"
              />
            </el-form-item>
          </section>

          <section class="ci-form-section">
            <div class="ci-section-title">
              <span>2. 处理安排</span>
              <small>一张工单只设一个主办人,协同人只帮忙不抢责任</small>
            </div>
            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="主办人" required>
                  <el-select
                    v-model="form.ownerId"
                    clearable
                    filterable
                    placeholder="选择负责闭环的人"
                    style="width:100%"
                    @change="(v:any)=>onPickStaff('owner', v)"
                  >
                    <el-option v-for="u in staffList" :key="u.id" :label="u.name" :value="u.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="协同人">
                  <el-select
                    v-model="form.assistId"
                    clearable
                    filterable
                    placeholder="可选,需要配合才填"
                    style="width:100%"
                    @change="(v:any)=>onPickStaff('assist', v)"
                  >
                    <el-option v-for="u in staffList" :key="u.id" :label="u.name" :value="u.id" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="紧急度" required>
                  <el-select v-model="form.priority" style="width:100%" @change="onPriorityChange">
                    <el-option v-for="p in PRIORITIES" :key="p.value" :label="p.label" :value="p.value" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="截止时间" required>
                  <el-date-picker
                    v-model="form.deadline"
                    type="datetime"
                    placeholder="必须给客户一个处理节点"
                    value-format="YYYY-MM-DD HH:mm:ss"
                    style="width:100%"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <div class="ci-quick-deadline">
              <span>快捷截止:</span>
              <el-button size="small" @click="setQuickDeadline('today')">今天 18:00</el-button>
              <el-button size="small" @click="setQuickDeadline('tomorrow')">明天 12:00</el-button>
              <el-button size="small" @click="setQuickDeadline('twoDays')">2 天内</el-button>
              <el-button size="small" @click="setQuickDeadline('priority')">按紧急度</el-button>
            </div>
            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="升级关注">
                  <div class="ci-switch-row">
                    <el-switch v-model="form.bossInvolved" :active-value="1" :inactive-value="0" />
                    <span>P0、客户情绪强、影响续费时打开,用于管理层及时看见风险。</span>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="沉淀改进">
                  <div class="ci-switch-row">
                    <el-switch v-model="form.needReview" :active-value="1" :inactive-value="0" />
                    <span>重复问题、流程缺口、客户体验问题,处理后沉淀为改进项。</span>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </section>

          <section v-if="form.id" class="ci-form-section">
            <div class="ci-section-title">
              <span>3. 结果与沉淀</span>
              <small>完成时必须写客户已得到什么结果</small>
            </div>
            <el-row :gutter="14">
              <el-col :span="12">
                <el-form-item label="当前状态">
                  <el-select v-model="form.status" style="width:100%">
                    <el-option v-for="s in STATUS" :key="s.value" :label="s.label" :value="s.value" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="处理结果">
              <el-input
                v-model="form.result"
                type="textarea"
                :rows="3"
                maxlength="2000"
                show-word-limit
                placeholder="例如:已联系客户说明原因,补开发票并发送截图,客户确认满意。"
              />
            </el-form-item>
            <el-form-item v-if="form.needReview === 1" label="改进沉淀">
              <el-input
                v-model="form.reviewNote"
                type="textarea"
                :rows="3"
                maxlength="2000"
                show-word-limit
                placeholder="写清以后怎么避免:话术、SOP、提醒、表单字段、质检点。"
              />
            </el-form-item>
          </section>
        </div>

        <aside class="ci-form-aside">
          <div class="ci-playbook">
            <h4>处理原则</h4>
            <ul>
              <li>先安抚客户,再查内部原因。</li>
              <li>主办人只对客户结果负责,协同人按事项配合。</li>
              <li>等客户时要写清等什么,不要让工单悬空。</li>
              <li>完成不是“我处理了”,而是客户问题已闭环。</li>
            </ul>
          </div>
          <div class="ci-playbook">
            <h4>SLA 建议</h4>
            <div class="ci-sla-rule"><strong>P0</strong><span>4 小时内给方案,必要时升级关注。</span></div>
            <div class="ci-sla-rule"><strong>P1</strong><span>24 小时内处理或明确下一步。</span></div>
            <div class="ci-sla-rule"><strong>P2</strong><span>3 天内闭环,避免拖成投诉。</span></div>
          </div>
        </aside>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.saving" @click="submit">保存工单</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignDlg.visible" title="调整主办人" width="520px" destroy-on-close>
      <div class="ci-assign-tip">主办人负责对客户闭环;协同人只代表需要配合的同事或部门。</div>
      <el-form label-width="86px">
        <el-form-item label="主办人" required>
          <el-select v-model="assignDlg.ownerId" clearable filterable placeholder="选择负责闭环的人" style="width:100%">
            <el-option v-for="u in staffList" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="协同人">
          <el-select v-model="assignDlg.assistId" clearable filterable placeholder="可选" style="width:100%">
            <el-option v-for="u in staffList" :key="u.id" :label="u.name" :value="u.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="assignDlg.visible = false">取消</el-button>
        <el-button type="primary" :loading="assignDlg.saving" @click="submitAssign">确定调整</el-button>
      </template>
    </el-dialog>

    <el-drawer v-model="detail.visible" :title="detail.issue?.issueNo || '工单详情'" size="620px" destroy-on-close>
      <template v-if="detail.issue">
        <div class="ci-detail-head">
          <div>
            <div class="ci-detail-customer">{{ detail.issue.customerName || '未填写客户' }}</div>
            <p>{{ detail.issue.description || '暂无问题描述' }}</p>
          </div>
          <el-tag :type="statusTag(detail.issue.status)" size="large">{{ labelOf(STATUS, detail.issue.status) }}</el-tag>
        </div>

        <div class="ci-next-card">
          <strong>下一步</strong>
          <span>{{ nextAction(detail.issue) }}</span>
        </div>

        <div class="ci-detail-actions" v-if="detail.issue.status !== 'completed' && detail.issue.status !== 'closed'">
          <el-button v-if="detail.issue.status === 'pending'" type="success" @click="quickStatus(detail.issue, 'processing')">开始处理</el-button>
          <el-button v-if="detail.issue.status === 'processing'" type="warning" @click="quickStatus(detail.issue, 'waiting')">等客户反馈</el-button>
          <el-button type="success" @click="completeIssue(detail.issue)">填写结果并完成</el-button>
        </div>

        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="主办人">{{ detail.issue.ownerName || '待指定' }}</el-descriptions-item>
          <el-descriptions-item label="协同人">{{ detail.issue.assistName || '无' }}</el-descriptions-item>
          <el-descriptions-item label="紧急度">
            <el-tag :type="prioTag(detail.issue.priority)" size="small" effect="dark">{{ labelOf(PRIORITIES, detail.issue.priority) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="截止时间">
            <span :class="{ 'is-overdue': isOverdue(detail.issue) }">{{ fmtTime(detail.issue.deadline) }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="来源">{{ labelOf(SOURCES, detail.issue.source) }}</el-descriptions-item>
          <el-descriptions-item label="类型">{{ labelOf(ISSUE_TYPES, detail.issue.issueType) }}</el-descriptions-item>
          <el-descriptions-item label="升级关注">{{ detail.issue.bossInvolved === 1 ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="沉淀改进">{{ detail.issue.needReview === 1 ? '是' : '否' }}</el-descriptions-item>
          <el-descriptions-item label="处理结果" :span="2">{{ detail.issue.result || '未完成' }}</el-descriptions-item>
          <el-descriptions-item v-if="detail.issue.needReview === 1" label="改进沉淀" :span="2">
            {{ detail.issue.reviewNote || '待补充' }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 class="ci-tl-title">进展记录</h4>
        <el-timeline v-if="detail.logs.length">
          <el-timeline-item v-for="lg in detail.logs" :key="lg.id" :timestamp="fmtTime(lg.createTime)" placement="top">
            <span class="ci-tl-op">{{ lg.operatorName || '系统' }}</span>
            {{ actionLabel(lg) }}
            <span v-if="lg.remark" class="ci-tl-remark"> - {{ lg.remark }}</span>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无进展记录" :image-size="60" />
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { CircleCheck, Plus, Search, Timer, UserFilled } from '@element-plus/icons-vue'
import { customerIssueApi, staffCandidatesApi, type CustomerIssue, type CustomerIssueLog } from '@/api/customer-issue'
import { customerApi } from '@/api/crm'
import { hasRole } from '@/utils/permission'

const SOURCES = [
  { value: 'wechat', label: '微信' },
  { value: 'phone', label: '电话' },
  { value: 'system', label: '系统' },
  { value: 'feishu', label: '飞书' },
  { value: 'other', label: '其他' }
]
const ISSUE_TYPES = [
  { value: 'complaint', label: '投诉安抚' },
  { value: 'consult', label: '业务咨询' },
  { value: 'urge', label: '客户催办' },
  { value: 'tax', label: '税务处理' },
  { value: 'invoice', label: '开票问题' },
  { value: 'gs', label: '工商事项' },
  { value: 'fee', label: '费用疑问' },
  { value: 'other', label: '其他服务' }
]
const PRIORITIES = [
  { value: 'P0', label: 'P0 紧急' },
  { value: 'P1', label: 'P1 重要' },
  { value: 'P2', label: 'P2 普通' }
]
const STATUS = [
  { value: 'pending', label: '待接单' },
  { value: 'processing', label: '处理中' },
  { value: 'waiting', label: '等客户反馈' },
  { value: 'completed', label: '已完成' },
  { value: 'closed', label: '已关闭' }
]
const STATUS_TABS = STATUS.filter((s) => s.value !== 'closed')

const labelOf = (list: { value: string; label: string }[], v?: string) => list.find((x) => x.value === v)?.label || (v || '未填写')
const prioTag = (p?: string) => (({ P0: 'danger', P1: 'warning', P2: 'info' } as Record<string, string>)[p || 'P2'] || 'info')
const statusTag = (s?: string) =>
  (({ pending: 'danger', processing: 'warning', waiting: 'primary', completed: 'success', closed: 'info' } as Record<string, string>)[s || ''] || 'info')
const fmtTime = (t?: string) => (t ? String(t).replace('T', ' ').slice(0, 16) : '未设置')
const parseTime = (t?: string) => (t ? new Date(String(t).replace(/-/g, '/')).getTime() : 0)
const isFinished = (row: CustomerIssue) => row.status === 'completed' || row.status === 'closed'
const isOverdue = (row: CustomerIssue) => !!row.deadline && parseTime(row.deadline) < Date.now() && !isFinished(row)
const durationText = (ms: number) => {
  const minutes = Math.max(1, Math.round(ms / 60000))
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}小时`
  return `${Math.round(hours / 24)}天`
}
const deadlineHint = (row: CustomerIssue) => {
  if (!row.deadline) return '请补截止时间'
  if (isFinished(row)) return row.resolveTime ? `完成于 ${fmtTime(row.resolveTime)}` : '已结束'
  const diff = parseTime(row.deadline) - Date.now()
  if (diff < 0) return `逾期 ${durationText(Math.abs(diff))}`
  if (diff <= 2 * 60 * 60 * 1000) return `${durationText(diff)}内到期`
  return `剩余 ${durationText(diff)}`
}
const nextAction = (row: CustomerIssue) => {
  if (row.status === 'completed') return row.needReview === 1 ? '结果已闭环,补充改进沉淀' : '确认客户无后续反馈'
  if (row.status === 'closed') return '已关闭,无需继续推进'
  if (!row.ownerId) return '先指定主办人,避免无人负责'
  if (isOverdue(row)) return '先回复客户当前进展,再处理逾期原因'
  if (row.status === 'pending') return '主办人接单,给客户第一句回应'
  if (row.status === 'processing') return '按截止时间推进,需要协同时直接补协同人'
  if (row.status === 'waiting') return '跟进客户缺少的资料或确认意见'
  return '保持推进'
}
const rowClass = ({ row }: { row: CustomerIssue }) =>
  isOverdue(row) ? 'row-overdue' : row.priority === 'P0' && !isFinished(row) ? 'row-p0' : ''
const actionLabel = (lg: CustomerIssueLog) => {
  if (lg.action === 'create') return '创建了工单'
  if (lg.action === 'assign') return '调整了主办/协同'
  if (lg.action === 'close') return '关闭了工单'
  if (lg.action === 'status') return `将状态改为「${labelOf(STATUS, lg.toStatus)}」`
  if (lg.action === 'update') return '更新了工单信息'
  return '更新了工单'
}

const canAssign = computed(() => hasRole(['admin', 'boss', 'manager', 'dept_manager']))
const canClose = computed(() => hasRole(['admin', 'boss']))

const rows = ref<CustomerIssue[]>([])
const loading = ref(false)
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const query = ref<{ keyword?: string; status?: string; priority?: string; issueType?: string; ownerId?: number; overdue?: boolean; openOnly?: boolean; unhandled?: boolean }>({ status: '' })
const stats = ref<any>({})
const clients = ref<Array<{ id: number; name: string }>>([])
const staffList = ref<Array<{ id: number; name: string }>>([])

const loadData = async () => {
  loading.value = true
  try {
    const res: any = await customerIssueApi.list({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: query.value.keyword || undefined,
      status: query.value.status || undefined,
      priority: query.value.priority || undefined,
      issueType: query.value.issueType || undefined,
      ownerId: query.value.ownerId || undefined,
      overdue: query.value.overdue || undefined,
      openOnly: query.value.openOnly || undefined,
      unhandled: query.value.unhandled || undefined
    })
    const page = res?.data ?? res
    rows.value = page?.records || page?.list || []
    total.value = Number(page?.total ?? 0)
  } catch {
    rows.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
  loadStats()
}
const reload = () => {
  pageNum.value = 1
  loadData()
}
const loadStats = async () => {
  try {
    const res: any = await customerIssueApi.stats()
    stats.value = (res?.data ?? res) || {}
  } catch {
    /* ignore */
  }
}
const filterStatus = (status: string) => {
  query.value.status = status
  query.value.overdue = undefined
  query.value.openOnly = undefined
  query.value.unhandled = undefined
  reload()
}
const filterOverdue = () => {
  query.value.overdue = true
  query.value.status = ''
  query.value.openOnly = undefined
  query.value.unhandled = undefined
  reload()
}
const filterP0 = () => {
  query.value.priority = 'P0'
  query.value.overdue = undefined
  query.value.status = ''
  query.value.openOnly = true
  query.value.unhandled = undefined
  reload()
}
const filterUnhandled = () => {
  query.value.status = ''
  query.value.priority = undefined
  query.value.overdue = undefined
  query.value.openOnly = undefined
  query.value.unhandled = true
  reload()
}
const clearFastFilter = () => {
  query.value = { status: '' }
  reload()
}
const clearDrillDownFilter = () => {
  query.value.openOnly = undefined
  query.value.unhandled = undefined
}
const onStatusChange = () => {
  clearDrillDownFilter()
  query.value.overdue = undefined
  reload()
}
const onPriorityFilterChange = () => {
  clearDrillDownFilter()
  reload()
}
const onOverdueChange = () => {
  clearDrillDownFilter()
  query.value.status = ''
  reload()
}

const remoteCustomers = async (q: string) => {
  if (!q) return
  try {
    const res: any = await customerApi.list({ pageNum: 1, pageSize: 20, name: q })
    clients.value = (res?.data ?? res)?.records || (res?.data ?? res)?.list || []
  } catch {
    clients.value = []
  }
}
const loadStaff = async () => {
  try {
    staffList.value = (await staffCandidatesApi()) || []
  } catch {
    staffList.value = []
  }
}

const dialog = ref<{ visible: boolean; saving: boolean }>({ visible: false, saving: false })
const form = ref<CustomerIssue>({})
const openForm = (row?: CustomerIssue) => {
  form.value = row
    ? { ...row }
    : {
        status: 'pending',
        priority: 'P2',
        source: 'wechat',
        bossInvolved: 0,
        needReview: 0,
        deadline: defaultDeadline('P2')
      }
  if (row?.customerName) clients.value = [{ id: row.customerId || 0, name: row.customerName }]
  dialog.value = { visible: true, saving: false }
}
const onPickCustomer = (name: string) => {
  form.value.customerId = clients.value.find((c) => c.name === name)?.id
}
const onPickStaff = (which: 'owner' | 'assist', id?: number) => {
  const u = staffList.value.find((x) => x.id === id)
  if (which === 'owner') form.value.ownerName = u?.name
  else form.value.assistName = u?.name
}
const pad = (n: number) => String(n).padStart(2, '0')
const formatDateTime = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`
const dateAt = (offsetDays: number, hour: number, minute = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(hour, minute, 0, 0)
  return formatDateTime(d)
}
const defaultDeadline = (priority?: string) => {
  const now = new Date()
  if (priority === 'P0') return formatDateTime(new Date(now.getTime() + 4 * 60 * 60 * 1000))
  if (priority === 'P1') return dateAt(1, 18)
  return dateAt(3, 18)
}
const onPriorityChange = (p: string) => {
  if (!form.value.id || !form.value.deadline) form.value.deadline = defaultDeadline(p)
  if (p === 'P0') form.value.bossInvolved = 1
}
const setQuickDeadline = (kind: 'today' | 'tomorrow' | 'twoDays' | 'priority') => {
  if (kind === 'today') form.value.deadline = dateAt(0, 18)
  if (kind === 'tomorrow') form.value.deadline = dateAt(1, 12)
  if (kind === 'twoDays') form.value.deadline = dateAt(2, 18)
  if (kind === 'priority') form.value.deadline = defaultDeadline(form.value.priority)
}
const applyDescriptionTemplate = () => {
  const template = '客户反馈:\n影响/风险:\n客户期望:\n已承诺下一步:'
  if (!form.value.description) {
    form.value.description = template
    return
  }
  if (!form.value.description.includes('客户反馈:')) {
    form.value.description = `${form.value.description}\n\n${template}`
  }
}

const submit = async () => {
  if (!form.value.customerName) {
    ElMessage.warning('请选择或填写客户')
    return
  }
  if (!form.value.ownerId) {
    ElMessage.warning('请选择主办人;没有主办人就不是可闭环的任务')
    return
  }
  if (!form.value.deadline) {
    ElMessage.warning('请填写截止时间')
    return
  }
  if (!form.value.description || form.value.description.trim().length < 8) {
    ElMessage.warning('请把客户问题写具体一点')
    return
  }
  if (form.value.status === 'completed' && !form.value.result) {
    ElMessage.warning('已完成的工单必须填写处理结果')
    return
  }
  dialog.value.saving = true
  try {
    if (form.value.id) await customerIssueApi.update(form.value)
    else await customerIssueApi.create(form.value)
    ElMessage.success('工单已保存')
    dialog.value.visible = false
    loadData()
  } catch {
    /* 拦截器已提示 */
  } finally {
    dialog.value.saving = false
  }
}

const quickStatus = async (row: CustomerIssue, status: string) => {
  const remark = status === 'processing' ? '已接单并开始处理' : status === 'waiting' ? '等待客户补充/确认' : undefined
  await doChangeStatus(row, status, undefined, remark)
}
const completeIssue = async (row: CustomerIssue) => {
  let result = row.result || ''
  try {
    const r = await ElMessageBox.prompt('请写清客户问题最终如何闭环', '填写处理结果', {
      inputType: 'textarea',
      inputValue: result,
      confirmButtonText: '完成工单',
      cancelButtonText: '取消'
    })
    result = r.value
  } catch {
    return
  }
  if (!result || result.trim().length < 6) {
    ElMessage.warning('处理结果请写具体一点')
    return
  }
  await doChangeStatus(row, 'completed', result, '客户问题已闭环')
}
const doChangeStatus = async (row: any, status: string, result?: string, remark?: string) => {
  row._saving = true
  try {
    await customerIssueApi.changeStatus(row.id, { status, result, remark })
    ElMessage.success('状态已更新')
    await loadData()
    if (detail.value.visible && row.id) await refreshDetail(row.id)
  } catch {
    loadData()
  } finally {
    row._saving = false
  }
}

const assignDlg = ref<{ visible: boolean; saving: boolean; id?: number | string; ownerId?: number; assistId?: number }>({ visible: false, saving: false })
const openAssign = (row: CustomerIssue) => {
  assignDlg.value = { visible: true, saving: false, id: row.id, ownerId: row.ownerId, assistId: row.assistId }
}
const submitAssign = async () => {
  if (!assignDlg.value.ownerId) {
    ElMessage.warning('请选择主办人')
    return
  }
  assignDlg.value.saving = true
  try {
    const owner = staffList.value.find((u) => u.id === assignDlg.value.ownerId)
    const assist = staffList.value.find((u) => u.id === assignDlg.value.assistId)
    await customerIssueApi.assign(assignDlg.value.id!, {
      ownerId: assignDlg.value.ownerId,
      ownerName: owner?.name,
      assistId: assignDlg.value.assistId,
      assistName: assist?.name
    })
    ElMessage.success('主办人已调整')
    assignDlg.value.visible = false
    loadData()
  } catch {
    /* 拦截器已提示 */
  } finally {
    assignDlg.value.saving = false
  }
}

const closeIssue = async (row: CustomerIssue) => {
  try {
    await ElMessageBox.confirm(`关闭工单「${row.issueNo}」? 关闭后不再进入待处理。`, '关闭工单', { type: 'warning' })
  } catch {
    return
  }
  try {
    await customerIssueApi.close(row.id!, { remark: '管理关闭' })
    ElMessage.success('已关闭')
    loadData()
  } catch {
    /* 拦截器已提示 */
  }
}

const detail = ref<{ visible: boolean; issue: CustomerIssue | null; logs: CustomerIssueLog[] }>({ visible: false, issue: null, logs: [] })
const refreshDetail = async (id: number | string) => {
  const res: any = await customerIssueApi.detail(id)
  const d = res?.data ?? res
  detail.value.issue = d?.issue || detail.value.issue
  detail.value.logs = d?.logs || []
}
const openDetail = async (row: CustomerIssue) => {
  detail.value = { visible: true, issue: row, logs: [] }
  try {
    await refreshDetail(row.id!)
  } catch {
    detail.value.visible = false
  }
}

const route = useRoute()
onMounted(async () => {
  loadStaff()
  const issueIdValue = Array.isArray(route.query?.issueId) ? route.query.issueId[0] : route.query?.issueId
  const issueId = Number(issueIdValue)
  if (Number.isSafeInteger(issueId) && issueId > 0) {
    await loadData()
    await openDetail(rows.value.find((row) => Number(row.id) === issueId) || { id: issueId })
    return
  }
  // 老板总控台点击跳转带 ?view=overdue|p0|unhandled 时自动套用快捷筛选
  const view = route.query?.view
  if (view === 'overdue') filterOverdue()
  else if (view === 'p0') filterP0()
  else if (view === 'unhandled') filterUnhandled()
  else loadData()
})
</script>

<style scoped>
.ci {
  padding: 16px 18px;
}
.ci-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.ci-head-main {
  min-width: 280px;
  max-width: 880px;
}
.ci-title-line {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ci-title {
  margin: 0;
  font-size: 22px;
  font-weight: 650;
  color: var(--el-text-color-primary);
}
.ci-sub {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
}
.ci-rules {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.ci-rules span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 999px;
  background: var(--el-fill-color-extra-light);
}
.ci-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.ci-stat {
  appearance: none;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 3px;
  padding: 13px 14px;
  cursor: pointer;
  text-align: left;
}
.ci-stat:hover {
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.ci-stat-num {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.ci-stat-num.is-warning {
  color: var(--el-color-warning);
}
.ci-stat-num.is-danger {
  color: var(--el-color-danger);
}
.ci-stat-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.ci-board {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  padding: 12px;
}
.ci-stage-bar {
  margin-bottom: 12px;
  overflow-x: auto;
}
.ci-toolbar {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.ci-search {
  width: 260px;
}
.ci-filter {
  width: 140px;
}
.ci-table {
  width: 100%;
}
.ci-task-cell {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.ci-task-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.ci-customer {
  font-weight: 650;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ci-task-desc {
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ci-task-meta {
  display: flex;
  gap: 6px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.ci-task-meta span {
  padding: 2px 6px;
  border-radius: 6px;
  background: var(--el-fill-color-light);
}
.ci-people,
.ci-sla,
.ci-next {
  display: grid;
  gap: 5px;
}
.ci-owner {
  font-weight: 650;
  color: var(--el-text-color-primary);
}
.ci-assist,
.ci-sla em,
.ci-next span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-style: normal;
}
.ci-sla .is-overdue,
.is-overdue {
  color: var(--el-color-danger);
  font-weight: 650;
}
.ci-pager {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.ci-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 250px;
  gap: 16px;
  align-items: start;
}
.ci-form-main {
  display: grid;
  gap: 14px;
  min-width: 0;
}
.ci-form-section,
.ci-form-aside .ci-playbook {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
}
.ci-form-section {
  padding: 14px;
}
.ci-section-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 12px;
}
.ci-section-title span {
  font-size: 15px;
  font-weight: 650;
  color: var(--el-text-color-primary);
}
.ci-section-title small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.ci-label-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}
.ci-quick-deadline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin: -2px 0 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.ci-switch-row {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.45;
}
.ci-form-aside {
  display: grid;
  gap: 12px;
}
.ci-playbook {
  padding: 13px;
}
.ci-playbook h4 {
  margin: 0 0 10px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.ci-playbook ul {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.75;
}
.ci-sla-rule {
  display: grid;
  gap: 3px;
  padding: 8px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  font-size: 12px;
}
.ci-sla-rule:first-of-type {
  border-top: 0;
}
.ci-sla-rule strong {
  color: var(--el-text-color-primary);
}
.ci-assign-tip,
.ci-next-card {
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-text-color-regular);
  font-size: 13px;
}
.ci-detail-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 12px;
}
.ci-detail-customer {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.ci-detail-head p {
  margin: 6px 0 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.ci-next-card {
  display: grid;
  gap: 4px;
}
.ci-next-card strong {
  color: var(--el-text-color-primary);
}
.ci-detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.ci-tl-title {
  margin: 18px 0 10px;
  font-size: 14px;
  font-weight: 650;
  color: var(--el-text-color-primary);
}
.ci-tl-op {
  font-weight: 650;
  color: var(--el-text-color-primary);
}
.ci-tl-remark {
  color: var(--el-text-color-secondary);
}
:deep(.row-overdue) {
  background: var(--el-color-danger-light-9) !important;
}
:deep(.row-p0) {
  background: var(--el-color-warning-light-9) !important;
}
@media (max-width: 900px) {
  .ci-stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .ci-form {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .ci {
    padding: 12px;
  }
  .ci-head {
    align-items: stretch;
  }
  .ci-head > .el-button {
    width: 100%;
  }
  .ci-stats {
    grid-template-columns: 1fr;
  }
  .ci-search,
  .ci-filter {
    width: 100%;
  }
}
</style>

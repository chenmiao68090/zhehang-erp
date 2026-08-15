<template>
  <div class="approval-track">
    <!-- 流程进度:完整节点(提交/审批/结束)+ 状态 + 负责人,当前节点可催办 -->
    <div v-if="flowNodes.length" class="flow-progress">
      <div class="flow-progress__title">流程进度</div>
      <div class="flow-steps">
        <div v-for="(n, i) in flowNodes" :key="i" class="flow-step" :class="'flow-step--' + n.state">
          <div class="flow-step__dot">
            <el-icon v-if="n.state === 'done'"><CircleCheck /></el-icon>
            <el-icon v-else-if="n.state === 'current'"><Clock /></el-icon>
            <el-icon v-else-if="n.type === 'condition'"><Sort /></el-icon>
            <span v-else-if="n.state === 'skipped'">–</span>
            <span v-else>{{ n.stepNo }}</span>
          </div>
          <div class="flow-step__body">
            <div class="flow-step__name">{{ n.name }}
              <el-tag v-if="n.type === 'condition'" type="info" size="small" effect="plain">条件分支</el-tag>
              <el-tag v-else-if="n.state === 'current'" type="warning" size="small" effect="dark">审批中</el-tag>
              <el-tag v-else-if="n.state === 'done'" :type="n.result === 'reject' ? 'danger' : 'success'" size="small">{{ n.result === 'reject' ? '已驳回' : '已通过' }}</el-tag>
              <el-tag v-else-if="n.state === 'skipped'" type="info" size="small" effect="plain">未经过</el-tag>
              <el-tag v-else type="info" size="small" effect="plain">待处理</el-tag>
            </div>
            <div v-if="n.type === 'condition'" class="flow-step__handler">按金额/表单自动分流</div>
            <div v-else class="flow-step__handler">
              <span v-if="n.handlers && n.handlers.length">{{ n.roleLabel ? n.roleLabel + '·' : '' }}{{ n.handlers.join('、') }}</span>
              <span v-else-if="n.handler">{{ n.roleLabel ? n.roleLabel + '·' : '' }}{{ n.handler }}</span>
              <span v-else-if="n.roleLabel">{{ n.roleLabel }}</span>
              <el-button
                v-if="n.state === 'current' && canUrge && currentTaskId"
                type="warning"
                size="small"
                plain
                :loading="urging"
                class="flow-urge"
                @click="doUrge"
              >催办</el-button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="ccNames && ccNames.length" class="flow-cc">抄送:{{ ccNames.join('、') }}</div>
    </div>

    <div v-if="showHistory && histories && histories.length" class="track-sub-title">审批轨迹</div>
    <el-timeline v-if="showHistory">
      <el-timeline-item
        v-for="item in histories"
        :key="item.id"
        :type="getTimelineType(item.action)"
        :hollow="false"
        :timestamp="item.operTime"
        placement="top"
      >
        <div class="track-item" :class="{ 'track-item--active': isCurrentNode(item) }">
          <div class="track-item__header">
            <div class="track-item__avatar">
              <el-avatar :size="32" :src="item.operatorAvatar">
                {{ (item.operatorName || '系统').charAt(0) }}
              </el-avatar>
            </div>
            <div class="track-item__info">
              <span class="track-item__name">{{ item.operatorName || $t('workflow.actionStart') }}</span>
              <el-tag
                :type="getActionTagType(item.action)"
                size="small"
                class="track-item__action"
              >
                {{ getActionLabel(item.action) }}
              </el-tag>
            </div>
          </div>
          <div v-if="item.comment" class="track-item__comment">
            {{ item.comment }}
          </div>
          <div class="track-item__node">
            <span class="track-item__node-label">{{ item.nodeName }}</span>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-if="showHistory && (!histories || histories.length === 0)" :description="$t('common.noData')" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { CircleCheck, Clock, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { taskApi } from '@/api/workflow'
import type { HistoryItem } from '@/api/workflow'

const { t } = useI18n()

interface Props {
  histories: HistoryItem[]
  currentNodeName?: string
  processConfig?: string
  currentAssigneeName?: string
  /** 会签场景:当前节点全部待办处理人 */
  currentAssigneeNames?: string[]
  initiatorName?: string
  ccNames?: string[]
  preview?: boolean
  showHistory?: boolean
  /** 当前待办任务ID(催办用,来自实例详情 currentTaskId) */
  currentTaskId?: number
  /** 是否显示催办按钮(仅发起人看进行中的自己单子时为 true) */
  canUrge?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  histories: () => [],
  currentNodeName: '',
  processConfig: '',
  currentAssigneeName: '',
  currentAssigneeNames: () => [],
  initiatorName: '',
  ccNames: () => [],
  preview: false,
  showHistory: true,
  currentTaskId: undefined,
  canUrge: false
})

// 催办:限发起人,后端同任务4小时限频(超频会返回明确报错文案)
const urging = ref(false)
async function doUrge () {
  if (!props.currentTaskId) return
  urging.value = true
  try {
    await taskApi.urge(props.currentTaskId)
    ElMessage.success('已催办,审批人会收到提醒')
  } catch (e: any) {
    ElMessage.warning(e?.message || '催办失败')
  }
  urging.value = false
}

// 角色 key → 中文名(用于显示节点负责角色)
const ROLE_LABELS: Record<string, string> = {
  dept_leader: '部门主管',
  dept_manager: '部门主管', manager: '经理', hr: '人事', boss: '总经办',
  finance: '财务', finance_hq: '财务部', super_admin: '管理员', admin: '管理员', staff: '员工'
}
function roleLabel (v?: string): string {
  if (!v) return ''
  return ROLE_LABELS[v] || v
}

// 完整流程节点 + 状态(已处理/审批中/待处理/未经过)+ 负责人。condition 渲染为分支说明,
// 已完成后"被条件跳过的分支节点"标"未经过"(而非误显"待处理")。
const flowNodes = computed(() => {
  let nodes: any[] = []
  try {
    const cfg = JSON.parse(props.processConfig || '{}')
    nodes = Array.isArray(cfg.nodes) ? cfg.nodes : []
  } catch { nodes = [] }
  const finished = !props.preview && !props.currentNodeName // 预览态只展示路径,不把结束节点标为已完成
  const histNames = new Set((props.histories || []).map((h: any) => h.nodeName))
  let stepNo = 0
  return nodes.map((n: any) => {
    let state = 'pending'; let handler = ''; let result = ''; let role = ''
    let handlers: string[] = []
    if (n.type === 'condition') {
      return { name: n.name || '条件分支', type: 'condition', state: 'branch', roleLabel: '' }
    }
    stepNo++
    if (n.type === 'start') {
      state = 'done'; handler = props.initiatorName || '发起人'
    } else if (n.type === 'end') {
      state = finished ? 'done' : 'pending'
    } else {
      role = (n.assigneeType === 'dept_leader' || n.assigneeType === 'dept_manager') ? '部门主管'
        : n.assigneeType === 'supervisor' ? '直属上级'
          : n.assigneeType === 'role' ? roleLabel(n.assigneeValue)
            : ''
      const hs = (props.histories || []).filter((x: any) => x.nodeName === n.name && (x.action === 'approve' || x.action === 'reject'))
      if (hs.length) {
        state = 'done'; handler = hs[hs.length - 1].operatorName || ''; result = hs[hs.length - 1].action
      } else if (n.name === props.currentNodeName) {
        state = 'current'
        // 会签:当前节点全部待办人;否则单个
        handlers = (props.currentAssigneeNames && props.currentAssigneeNames.length)
          ? props.currentAssigneeNames.slice()
          : (props.currentAssigneeName ? [props.currentAssigneeName] : [])
        handler = props.currentAssigneeName || ''
      } else if (finished && !histNames.has(n.name)) {
        // 流程已结束但该审批节点从无历史 → 被条件分支跳过,标"未经过"
        state = 'skipped'
      } else {
        state = 'pending'
      }
    }
    return { name: n.name, type: n.type, state, handler, handlers, result, roleLabel: role, stepNo }
  })
})

function getTimelineType(action: string) {
  switch (action) {
    case 'start': return 'primary'
    case 'approve': return 'success'
    case 'reject': return 'danger'
    case 'transfer': return 'warning'
    case 'return': return 'warning'
    case 'resubmit': return 'primary'
    case 'urge': return 'info'
    case 'cancel': return 'info'
    default: return 'primary'
  }
}

function getActionTagType(action: string) {
  switch (action) {
    case 'start': return ''
    case 'approve': return 'success'
    case 'reject': return 'danger'
    case 'transfer': return 'warning'
    case 'return': return 'warning'
    case 'resubmit': return ''
    case 'urge': return 'info'
    case 'cancel': return 'info'
    default: return ''
  }
}

function getActionLabel(action: string) {
  switch (action) {
    case 'start': return t('workflow.actionStart')
    case 'approve': return t('workflow.actionApprove')
    case 'reject': return t('workflow.actionReject')
    case 'transfer': return t('workflow.actionTransfer')
    case 'return': return t('workflow.actionReturn')
    case 'resubmit': return t('workflow.actionResubmit')
    case 'urge': return t('workflow.actionUrge')
    case 'cancel': return t('workflow.actionCancel')
    default: return action
  }
}

function isCurrentNode(item: HistoryItem) {
  return props.currentNodeName && item.nodeName === props.currentNodeName
}
</script>

<style scoped>
.approval-track {
  padding: 16px 0;
}
.flow-progress {
  margin-bottom: 16px;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
}
.flow-progress__title, .track-sub-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}
.track-sub-title { margin-top: 4px; }
.flow-steps {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.flow-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 4px;
}
.flow-step__dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  background: var(--el-fill-color-darker);
  color: var(--el-text-color-secondary);
}
.flow-step--done .flow-step__dot { background: var(--el-color-success); color: #fff; }
.flow-step--current .flow-step__dot { background: var(--el-color-warning); color: #fff; }
.flow-step--skipped .flow-step__dot { background: var(--el-fill-color); color: var(--el-text-color-placeholder); }
.flow-step--skipped .flow-step__name { color: var(--el-text-color-secondary); }
.flow-step--branch .flow-step__dot { background: var(--el-color-info-light-3); color: #fff; border-radius: 4px; transform: rotate(45deg); }
.flow-step--branch .flow-step__dot :deep(svg) { transform: rotate(-45deg); }
.flow-step__name {
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}
.flow-step__handler {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.flow-urge { cursor: default; }
.flow-cc {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.track-item {
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--el-bg-color-page);
  transition: all 0.3s;
}
.track-item--active {
  background: rgba(51, 112, 255, 0.05);
  border-left: 3px solid #3370ff;
}
.track-item__header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.track-item__info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.track-item__name {
  font-weight: 500;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.track-item__action {
  margin-left: 4px;
}
.track-item__comment {
  margin-top: 8px;
  padding: 8px 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 4px;
  font-size: 13px;
  color: var(--el-text-color-regular);
}
.track-item__node {
  margin-top: 6px;
}
.track-item__node-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

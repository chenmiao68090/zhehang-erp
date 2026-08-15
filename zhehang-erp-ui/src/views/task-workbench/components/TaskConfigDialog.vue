<template>
  <el-dialog
    v-model="visible"
    :title="`${taskTypeLabel}配置`"
    width="min(1120px, 97vw)"
    top="3vh"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-alert
      type="info"
      show-icon
      :closable="false"
      title="配置只作用于任务工作台"
      description="角色和员工来自系统现有组织架构；这里不新建角色，也不会改订单、服务工单或其他业务表。"
    />

    <el-tabs v-model="activeTab" class="config-tabs" @tab-change="handleTabChange">
      <el-tab-pane v-if="taskType !== 'business'" label="审批流程" name="process">
        <div class="section-head">
          <div>
            <h3>审批流程与{{ taskType === 'special' ? '专项类型' : '步骤角色' }}</h3>
            <p v-if="taskType === 'special'">每个专项流程必须填写唯一专项类型编码；流程名称作为专项类型展示名。</p>
            <p v-else>按顺序配置审批步骤，并明确按角色、指定人员或业务负责人审批。</p>
          </div>
          <el-button type="primary" @click="openProcessForm()">新增流程</el-button>
        </div>
        <el-table v-loading="processLoading" :data="processes" border row-key="id" empty-text="暂无审批流程，请先新增并启用流程">
          <el-table-column prop="processName" label="流程名称" min-width="180" />
          <el-table-column prop="processCode" label="流程编码" min-width="150" />
          <el-table-column v-if="taskType === 'special'" prop="businessTypeCode" label="专项类型编码" min-width="150" />
          <el-table-column prop="description" label="说明" min-width="220" show-overflow-tooltip />
          <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><el-tag :type="Number(row.enabled)===1?'success':'info'">{{ Number(row.enabled)===1?'启用':'停用' }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="170" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openProcessForm(row)">编辑</el-button><el-button link :type="Number(row.enabled)===1?'warning':'success'" @click="toggleProcess(row)">{{ Number(row.enabled)===1?'停用':'启用' }}</el-button></template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane v-if="capabilities.bridgeManage && capabilities.bridgeTriggerSupported" label="自动生成规则" name="rule">
        <div class="section-head">
          <div><h3>订单触发规则</h3><p>将订单创建或财务审核事件映射到当前任务类型；未覆盖时仍可在列表页手工补发。</p></div>
          <el-button type="primary" @click="openRuleForm()">新增规则</el-button>
        </div>
        <el-alert v-if="taskType !== 'business' && !enabledProcesses.length" class="inline-alert" type="warning" show-icon :closable="false" title="暂无已启用流程，自动规则暂不能启用" />
        <el-table v-loading="ruleLoading" :data="rules" border row-key="id" empty-text="暂无自动生成规则，请新增并启用规则">
          <el-table-column prop="ruleName" label="规则名称" min-width="180" />
          <el-table-column prop="ruleCode" label="规则编码" min-width="150" />
          <el-table-column label="触发事件" width="130"><template #default="{ row }">{{ triggerLabel(row.triggerEvent) }}</template></el-table-column>
          <el-table-column v-if="taskType !== 'business'" label="审批流程" min-width="180"><template #default="{ row }">{{ row.processName || processName(row.processId) }}</template></el-table-column>
          <el-table-column prop="businessTypeCode" label="订单业务类型条件" min-width="155"><template #default="{ row }">{{ row.businessTypeCode || '全部业务类型' }}</template></el-table-column>
          <el-table-column label="状态" width="90" align="center"><template #default="{ row }"><el-tag :type="Number(row.enabled)===1?'success':'info'">{{ Number(row.enabled)===1?'启用':'停用' }}</el-tag></template></el-table-column>
          <el-table-column label="操作" width="170" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openRuleForm(row)">编辑</el-button><el-button link :type="Number(row.enabled)===1?'warning':'success'" @click="toggleRule(row)">{{ Number(row.enabled)===1?'停用':'启用' }}</el-button></template></el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane v-if="capabilities.bridgeManage && capabilities.bridgeTriggerSupported" label="生成记录" name="run">
        <div class="section-head"><div><h3>自动生成记录</h3><p>失败记录可在修复配置或订单资料后重试；这里只重试任务生成，不重复修改订单。</p></div><el-button :loading="runLoading" @click="loadRuns">刷新</el-button></div>
        <div class="run-filter"><el-select v-model="runQuery.status" clearable placeholder="全部状态" @change="searchRuns"><el-option label="待处理" value="pending"/><el-option label="处理中" value="processing"/><el-option label="成功" value="success"/><el-option label="失败" value="failed"/><el-option label="已终止" value="dead"/><el-option label="已跳过" value="skipped"/></el-select><el-input-number v-model="runQuery.orderId" :min="1" :precision="0" controls-position="right" placeholder="订单ID"/><el-button type="primary" @click="searchRuns">查询</el-button></div>
        <el-table v-loading="runLoading" :data="runs" border row-key="id" empty-text="暂无自动生成记录">
          <el-table-column prop="orderNo" label="订单编号" min-width="150"><template #default="{ row }">{{ row.orderNo || row.orderId || '-' }}</template></el-table-column>
          <el-table-column prop="ruleName" label="规则" min-width="170" />
          <el-table-column label="目标任务" width="130"><template #default="{ row }">{{ targetLabel(row.targetTaskType) }}</template></el-table-column>
          <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="runStatusType(row.status)">{{ runStatusLabel(row.status) }}</el-tag></template></el-table-column>
          <el-table-column prop="errorMessage" label="失败原因" min-width="250" show-overflow-tooltip />
          <el-table-column prop="retryCount" label="重试次数" width="90" align="center" />
          <el-table-column prop="createTime" label="触发时间" width="175" />
          <el-table-column label="操作" width="90" fixed="right"><template #default="{ row }"><el-button v-if="retryable(row.status)" link type="primary" @click="retryRun(row)">重试</el-button><span v-else class="muted">-</span></template></el-table-column>
        </el-table>
        <div v-if="runTotal>runQuery.pageSize" class="pagination-bar"><el-pagination v-model:current-page="runQuery.pageNum" v-model:page-size="runQuery.pageSize" :total="runTotal" :page-sizes="[10,20,50]" layout="total, sizes, prev, pager, next" @current-change="loadRuns" @size-change="searchRuns"/></div>
      </el-tab-pane>
    </el-tabs>

    <template #footer><el-button @click="visible=false">关闭</el-button></template>
  </el-dialog>

  <el-dialog v-model="processFormVisible" :title="processForm.id?'编辑审批流程':'新增审批流程'" width="min(980px, 96vw)" top="2vh" append-to-body destroy-on-close :close-on-click-modal="false">
    <div v-loading="processDetailLoading" class="process-form-body">
      <el-alert type="warning" show-icon :closable="false" title="修改步骤前请先处理完进行中任务" description="后端会阻止对存在待审核实例的流程改动步骤；流程名称、说明和启停等安全信息仍可调整。" />
      <el-form label-position="top" class="base-form-grid">
        <el-form-item label="流程名称" required><el-input v-model="processForm.processName" maxlength="150" placeholder="例如：工商交付审核" /></el-form-item>
        <el-form-item label="流程编码" required><el-input v-model="processForm.processCode" maxlength="64" placeholder="例如：gs_delivery" /></el-form-item>
        <el-form-item v-if="taskType === 'special'" label="专项类型编码" required><el-input v-model="processForm.businessTypeCode" maxlength="64" placeholder="例如：complex_cancel" /><div class="field-help">流程名称即专项类型展示名；编码用于订单过滤和自动规则匹配。</div></el-form-item>
        <el-form-item label="状态"><el-switch v-model="processForm.enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" /></el-form-item>
        <el-form-item class="full-row" label="流程说明"><el-input v-model="processForm.description" type="textarea" :rows="2" maxlength="1000" show-word-limit /></el-form-item>
      </el-form>

      <div class="step-head"><div><h3>审批步骤</h3><p>最后一步由系统自动标记；按角色审批时保存角色 key，而不是写死角色 ID。</p></div><el-button type="primary" plain @click="addStep">新增步骤</el-button></div>
      <el-alert v-if="!flatRoles.length || !staff.length" class="inline-alert" type="info" show-icon :closable="false" :title="!flatRoles.length?'系统暂无可用角色，按角色审批无法配置':'当前数据范围没有可选员工，指定人员审批无法配置'" description="请先在系统角色/员工管理中完成组织配置，再返回此处选择；本模块不会另建一套角色。" />

      <article v-for="(step,index) in processForm.steps" :key="step.localKey" class="step-card">
        <div class="step-title"><strong>第 {{ index+1 }} 步</strong><div><el-tag v-if="index===processForm.steps.length-1" type="success">最终步骤</el-tag><el-button link :disabled="index===0" @click="moveStep(index,-1)">上移</el-button><el-button link :disabled="index===processForm.steps.length-1" @click="moveStep(index,1)">下移</el-button><el-button link type="danger" :disabled="processForm.steps.length===1" @click="removeStep(index)">删除</el-button></div></div>
        <div class="step-grid">
          <el-form-item label="步骤名称" required><el-input v-model="step.stepName" maxlength="150" placeholder="例如：主管初审" /></el-form-item>
          <el-form-item label="审批人来源" required><el-select v-model="step.assigneeMode" style="width:100%"><el-option label="按系统角色" value="role"/><el-option label="指定员工" value="specific"/><el-option label="业务负责人本人" value="owner"/></el-select></el-form-item>
          <el-form-item v-if="step.assigneeMode==='role'" label="审批角色" required><el-select v-model="step.requiredRoleKey" filterable style="width:100%" placeholder="请选择角色"><el-option v-for="role in flatRoles" :key="role.id" :label="`${role.name} · ${role.key||'无角色key'}`" :value="role.key" :disabled="!role.key"/></el-select></el-form-item>
          <el-form-item v-if="step.assigneeMode==='specific'" label="指定审批人" required><el-select v-model="step.requiredUserId" filterable style="width:100%" placeholder="请选择员工"><el-option v-for="person in staff" :key="person.id" :label="staffLabel(person)" :value="person.id"/></el-select></el-form-item>
          <el-form-item label="允许批量审核"><el-switch v-model="step.allowBatch" :active-value="1" :inactive-value="0" /></el-form-item>
        </div>

        <div class="sub-config">
          <div class="sub-head"><div><b>审核表单字段</b><small>仅配置本步骤确实需要留痕的字段。</small></div><el-button size="small" plain @click="addField(step)">添加字段</el-button></div>
          <div v-for="(field,fieldIndex) in step.fields" :key="field.localKey" class="field-row">
            <el-input v-model="field.label" placeholder="字段名称" />
            <el-input v-model="field.code" placeholder="字段编码" />
            <el-select v-model="field.fieldType" placeholder="类型"><el-option label="单行文本" value="text"/><el-option label="多行文本" value="textarea"/><el-option label="数字" value="number"/><el-option label="下拉选择" value="select"/><el-option label="日期" value="date"/><el-option label="日期时间" value="datetime"/><el-option label="开关" value="switch"/></el-select>
            <el-input v-if="field.fieldType==='select'" v-model="field.optionsText" placeholder="选项：值|名称，逗号分隔" />
            <el-input v-else v-model="field.unit" placeholder="单位（选填）" />
            <el-switch v-model="field.required" inline-prompt active-text="必填" inactive-text="选填" />
            <el-button link type="danger" @click="step.fields.splice(fieldIndex,1)">删除</el-button>
          </div>
          <el-empty v-if="!step.fields.length" :image-size="42" description="无需附加表单" />
        </div>

        <div class="sub-config">
          <div class="sub-head"><div><b>审批动作</b><small>转换动作仅按后端已开放能力显示。</small></div></div>
          <el-checkbox-group v-model="step.indicatorTypes">
            <el-checkbox value="next_auditor">通过时选择下一审批人</el-checkbox>
            <el-checkbox value="cost_input">必须填写成本项</el-checkbox>
            <el-checkbox v-if="capabilities.contractConversionSupported" value="convert_contract">完成后转合同</el-checkbox>
            <el-checkbox v-if="capabilities.addressConversionSupported" value="convert_address">完成后转地址</el-checkbox>
          </el-checkbox-group>
          <p v-if="!capabilities.contractConversionSupported" class="capability-note">合同转换尚未开放，不会出现在流程配置或审核操作中。</p>
          <p v-if="!capabilities.addressConversionSupported" class="capability-note">地址转换暂未开放，不会显示可执行入口。</p>
        </div>
      </article>
    </div>
    <template #footer><el-button @click="processFormVisible=false">取消</el-button><el-button type="primary" :loading="processSaving" @click="saveProcess">保存流程</el-button></template>
  </el-dialog>

  <el-dialog v-model="ruleFormVisible" :title="ruleForm.id?'编辑自动生成规则':'新增自动生成规则'" width="min(680px, 94vw)" append-to-body destroy-on-close :close-on-click-modal="false">
    <el-form label-position="top" class="rule-form-grid">
      <el-form-item label="规则名称" required><el-input v-model="ruleForm.ruleName" maxlength="150" placeholder="例如：财务审核后生成工商交付任务" /></el-form-item>
      <el-form-item label="规则编码" required><el-input v-model="ruleForm.ruleCode" :disabled="Boolean(ruleForm.id)" maxlength="64" placeholder="例如：finance_to_gs_task" /><div v-if="ruleForm.id" class="field-help">规则产生运行记录后编码不可修改。</div></el-form-item>
      <el-form-item label="触发事件" required><el-select v-model="ruleForm.triggerEvent" :disabled="Boolean(ruleForm.id)" style="width:100%"><el-option label="订单创建" value="order_created"/><el-option label="财务审核通过" value="finance_approved"/></el-select></el-form-item>
      <el-form-item v-if="taskType !== 'business'" label="目标审批流程" required><el-select v-model="ruleForm.processId" filterable style="width:100%" placeholder="请选择已启用流程" @change="handleRuleProcessChange"><el-option v-for="item in processes" :key="item.id" :label="`${processLabel(item)}${Number(item.enabled)===1?'':'（已停用）'}`" :value="item.id" :disabled="Number(item.enabled)!==1&&item.id!==ruleForm.processId"/></el-select></el-form-item>
      <el-form-item label="订单业务类型条件"><el-input v-model="ruleForm.businessTypeCode" :disabled="taskType==='special'" maxlength="64" placeholder="留空代表全部业务类型" /><div v-if="taskType==='special'" class="field-help">专项规则随所选流程使用专项类型编码。</div></el-form-item>
      <el-form-item v-if="taskType !== 'business'" label="任务范围"><el-radio-group v-model="ruleForm.scopeType"><el-radio-button value="personal">个人</el-radio-button><el-radio-button value="team">团队</el-radio-button></el-radio-group></el-form-item>
      <el-form-item v-if="taskType !== 'business'" label="最终确认"><el-switch v-model="ruleForm.finalConfirm" :active-value="1" :inactive-value="0" /><span class="switch-help">最后一步由订单业务负责人本人确认</span></el-form-item>
      <el-form-item label="规则状态"><el-switch v-model="ruleForm.enabled" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" /></el-form-item>
    </el-form>
    <template #footer><el-button @click="ruleFormVisible=false">取消</el-button><el-button type="primary" :loading="ruleSaving" @click="saveRule">保存规则</el-button></template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type {
  AuditProcess,
  AuditProcessDetail,
  AuditProcessFormField,
  AuditProcessPayload,
  AuditProcessStepConfig,
  FeigeTaskCapabilities,
  RoleTreeNode,
  StaffOption,
  TaskBridgeRule,
  TaskBridgeRulePayload,
  TaskBridgeRun
} from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '../data-source'

type TaskTargetType = 'business' | 'once' | 'recurring' | 'project_dept' | 'special'
type EditableField = AuditProcessFormField & { localKey: number; optionsText?: string }
type EditableStep = AuditProcessStepConfig & { localKey: number; fields: EditableField[]; indicatorTypes: string[] }

const props = defineProps<{
  taskType: TaskTargetType
  roles: RoleTreeNode[]
  staff: StaffOption[]
  capabilities: FeigeTaskCapabilities
}>()
const emit = defineEmits<{ (event: 'changed'): void }>()
const visible = ref(false)
const activeTab = ref<'process'|'rule'|'run'>('process')
const processes = ref<AuditProcess[]>([])
const rules = ref<TaskBridgeRule[]>([])
const runs = ref<TaskBridgeRun[]>([])
const processLoading = ref(false), ruleLoading = ref(false), runLoading = ref(false)
const processFormVisible = ref(false), processDetailLoading = ref(false), processSaving = ref(false)
const ruleFormVisible = ref(false), ruleSaving = ref(false)
const runTotal = ref(0)
const runQuery = reactive({ status: '', orderId: undefined as number|undefined, pageNum: 1, pageSize: 10 })
let localSequence = 1

const taskTypeLabel = computed(() => targetLabel(props.taskType))
const flatRoles = computed(() => flattenRoles(props.roles))
const enabledProcesses = computed(() => processes.value.filter(item => Number(item.enabled) === 1))
const processForm = reactive<any>({ id: undefined, processCode: '', processName: '', businessTypeCode: '', description: '', enabled: 1, steps: [] as EditableStep[] })
const ruleForm = reactive<any>({ id: undefined, ruleCode: '', ruleName: '', triggerEvent: 'finance_approved', processId: undefined, businessTypeCode: '', scopeType: 'personal', finalConfirm: 0, enabled: 1 })

async function open(tab?: 'process'|'rule'|'run') {
  if (!props.capabilities.bridgeManage) {
    ElMessage.warning('当前账号没有任务配置管理权限')
    return
  }
  if ((tab === 'rule' || tab === 'run') && !props.capabilities.bridgeTriggerSupported) {
    ElMessage.warning('自动生成能力当前未开放')
    return
  }
  activeTab.value = tab || (props.taskType === 'business' ? 'rule' : 'process')
  visible.value = true
  if (props.taskType !== 'business') await loadProcesses()
  if (activeTab.value === 'rule') await loadRules()
  if (activeTab.value === 'run') await loadRuns()
}

async function handleTabChange(name: string|number) {
  if ((name === 'rule' || name === 'run') && (!props.capabilities.bridgeManage || !props.capabilities.bridgeTriggerSupported)) return
  if (name === 'process') await loadProcesses()
  if (name === 'rule') { if (props.taskType !== 'business' && !processes.value.length) await loadProcesses(); await loadRules() }
  if (name === 'run') await loadRuns()
}

async function loadProcesses() {
  processLoading.value = true
  try { processes.value = await feigeTaskData.auditProcesses({ taskType: props.taskType }) || [] }
  catch (error) { processes.value = []; ElMessage.error(`审批流程加载失败：${errorText(error)}`) }
  finally { processLoading.value = false }
}

async function openProcessForm(row?: AuditProcess) {
  resetProcessForm()
  processFormVisible.value = true
  if (!row) return
  processDetailLoading.value = true
  try {
    const detail = await feigeTaskData.auditProcess(row.id) as AuditProcessDetail
    const process = detail.process || row
    Object.assign(processForm, {
      id: process.id,
      processCode: process.processCode || '',
      processName: process.processName || '',
      businessTypeCode: process.businessTypeCode || '',
      description: process.description || '',
      enabled: Number(process.enabled) === 0 ? 0 : 1,
      steps: (detail.steps || []).map(normalizeStep)
    })
    if (!processForm.steps.length) processForm.steps.push(newStep())
  } catch (error) {
    ElMessage.error(`流程详情加载失败：${errorText(error)}`)
    processFormVisible.value = false
  } finally { processDetailLoading.value = false }
}

function resetProcessForm() {
  Object.assign(processForm, { id: undefined, processCode: '', processName: '', businessTypeCode: '', description: '', enabled: 1, steps: [newStep()] })
}

function newStep(): EditableStep {
  return { localKey: localSequence++, stepOrder: 1, stepName: '', assigneeMode: 'role', requiredRoleKey: undefined, requiredUserId: undefined, allowBatch: 0, finalStep: 1, fields: [], indicatorTypes: [] }
}

function normalizeStep(step: AuditProcessStepConfig): EditableStep {
  const fields = parseJsonList(step.formSchemaJson).map((field: any) => ({ ...field, localKey: localSequence++, optionsText: Array.isArray(field.options) ? field.options.map((option: any) => `${option.value}|${option.label}`).join(',') : '' }))
  const indicatorTypes = parseJsonList(step.indicatorSchemaJson).map((item: any) => item.indicatorType).filter(Boolean)
  return { ...step, localKey: localSequence++, fields, indicatorTypes }
}

function addStep() { processForm.steps.push(newStep()) }
function removeStep(index: number) { processForm.steps.splice(index, 1) }
function moveStep(index: number, offset: number) { const next = index + offset; if (next < 0 || next >= processForm.steps.length) return; const [step] = processForm.steps.splice(index,1); processForm.steps.splice(next,0,step) }
function addField(step: EditableStep) { step.fields.push({ localKey: localSequence++, code: '', label: '', fieldType: 'text', required: false, unit: '', optionsText: '' }) }

async function saveProcess() {
  const payload = buildProcessPayload()
  if (!payload) return
  processSaving.value = true
  try {
    if (processForm.id) await feigeTaskData.updateAuditProcess(processForm.id, payload)
    else await feigeTaskData.createAuditProcess(payload)
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：预览流程已保存' : '审批流程已保存')
    processFormVisible.value = false
    await loadProcesses()
    emit('changed')
  } catch (error) { ElMessage.error(`流程保存失败：${errorText(error)}`) }
  finally { processSaving.value = false }
}

function buildProcessPayload(): AuditProcessPayload|undefined {
  const processCode = String(processForm.processCode || '').trim()
  const processName = String(processForm.processName || '').trim()
  const businessTypeCode = String(processForm.businessTypeCode || '').trim()
  if (!processName) { ElMessage.warning('请输入流程名称'); return }
  if (!processCode) { ElMessage.warning('请输入流程编码'); return }
  if (props.taskType === 'special' && !businessTypeCode) { ElMessage.warning('专项流程必须填写专项类型编码'); return }
  if (props.taskType === 'special' && processes.value.some(item => item.id !== processForm.id && item.businessTypeCode === businessTypeCode)) { ElMessage.warning('专项类型编码已存在，请使用唯一编码'); return }
  if (!processForm.steps.length) { ElMessage.warning('至少配置一个审批步骤'); return }
  const fieldCodes = new Set<string>()
  const steps: AuditProcessStepConfig[] = []
  for (let index = 0; index < processForm.steps.length; index++) {
    const step: EditableStep = processForm.steps[index]
    if (!String(step.stepName || '').trim()) { ElMessage.warning(`请填写第 ${index+1} 步名称`); return }
    if (step.assigneeMode === 'role' && !step.requiredRoleKey) { ElMessage.warning(`请选择第 ${index+1} 步审批角色`); return }
    if (step.assigneeMode === 'specific' && !step.requiredUserId) { ElMessage.warning(`请选择第 ${index+1} 步审批人`); return }
    const fields: any[] = []
    for (const field of step.fields) {
      field.code = String(field.code || '').trim()
      field.label = String(field.label || '').trim()
      if (!field.label || !field.code) { ElMessage.warning(`请补全第 ${index+1} 步表单字段`); return }
      if (!/^[a-z][a-z0-9_]{0,39}$/.test(field.code)) { ElMessage.warning(`字段编码 ${field.code} 格式不正确`); return }
      const scopedCode = `${index}:${field.code}`
      if (fieldCodes.has(scopedCode)) { ElMessage.warning(`第 ${index+1} 步字段编码 ${field.code} 重复`); return }
      fieldCodes.add(scopedCode)
      const normalized: any = { code: field.code, label: field.label, fieldType: field.fieldType, required: Boolean(field.required) }
      if (field.unit) normalized.unit = String(field.unit).trim()
      if (field.min != null) normalized.min = Number(field.min)
      if (field.precision != null) normalized.precision = Number(field.precision)
      if (field.fieldType === 'select') {
        normalized.options = parseOptions(field.optionsText || '')
        if (!normalized.options.length) { ElMessage.warning(`下拉字段 ${field.label} 至少配置一个选项`); return }
      }
      fields.push(normalized)
    }
    steps.push({
      stepOrder: index + 1,
      stepName: String(step.stepName).trim(),
      assigneeMode: step.assigneeMode,
      requiredRoleKey: step.assigneeMode === 'role' ? step.requiredRoleKey : undefined,
      requiredUserId: step.assigneeMode === 'specific' ? step.requiredUserId : undefined,
      allowBatch: Number(step.allowBatch || 0),
      finalStep: index === processForm.steps.length - 1 ? 1 : 0,
      formSchemaJson: JSON.stringify(fields),
      indicatorSchemaJson: JSON.stringify(step.indicatorTypes.map(indicatorType => ({ indicatorType })))
    })
  }
  return { processCode, processName, taskType: props.taskType as AuditProcessPayload['taskType'], businessTypeCode: businessTypeCode || undefined, description: String(processForm.description || '').trim() || undefined, enabled: Number(processForm.enabled || 0), steps }
}

async function toggleProcess(row: AuditProcess) {
  try {
    const detail = await feigeTaskData.auditProcess(row.id) as AuditProcessDetail
    const payload = detailToPayload(detail)
    payload.enabled = Number(row.enabled) === 1 ? 0 : 1
    await feigeTaskData.updateAuditProcess(row.id, payload)
    ElMessage.success(payload.enabled ? '流程已启用' : '流程已停用')
    await loadProcesses(); emit('changed')
  } catch (error) { ElMessage.error(`流程状态更新失败：${errorText(error)}`) }
}

function detailToPayload(detail: AuditProcessDetail): AuditProcessPayload {
  const process = detail.process
  return { processCode: process.processCode, processName: process.processName, taskType: process.taskType as AuditProcessPayload['taskType'], businessTypeCode: process.businessTypeCode, description: process.description, enabled: Number(process.enabled), steps: (detail.steps || []).map((step,index,all) => ({ stepOrder: index+1, stepName: step.stepName, requiredRoleKey: step.requiredRoleKey, assigneeMode: step.assigneeMode, requiredUserId: step.requiredUserId, allowBatch: Number(step.allowBatch||0), finalStep: index===all.length-1?1:0, formSchemaJson: step.formSchemaJson || '[]', indicatorSchemaJson: step.indicatorSchemaJson || '[]' })) }
}

async function loadRules() {
  ruleLoading.value = true
  try { rules.value = await feigeTaskData.bridgeRules({ targetTaskType: props.taskType }) || [] }
  catch (error) { rules.value = []; ElMessage.error(`自动规则加载失败：${errorText(error)}`) }
  finally { ruleLoading.value = false }
}

function openRuleForm(row?: TaskBridgeRule) {
  Object.assign(ruleForm, { id: row?.id, ruleCode: row?.ruleCode || '', ruleName: row?.ruleName || '', triggerEvent: row?.triggerEvent || 'finance_approved', processId: row?.processId, businessTypeCode: row?.businessTypeCode || '', scopeType: row?.scopeType || 'personal', finalConfirm: Number(row?.finalConfirm || 0), enabled: row ? Number(row.enabled) : 1 })
  ruleFormVisible.value = true
}

function handleRuleProcessChange() {
  if (props.taskType !== 'special') return
  ruleForm.businessTypeCode = processes.value.find(item => item.id === Number(ruleForm.processId))?.businessTypeCode || ''
}

function buildRulePayload(): TaskBridgeRulePayload|undefined {
  const ruleCode = String(ruleForm.ruleCode || '').trim(), ruleName = String(ruleForm.ruleName || '').trim()
  if (!ruleName) { ElMessage.warning('请输入规则名称'); return }
  if (!ruleCode) { ElMessage.warning('请输入规则编码'); return }
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(ruleCode)) { ElMessage.warning('规则编码必须以字母开头，且只能包含字母、数字、下划线和中划线'); return }
  if (props.taskType !== 'business' && !ruleForm.processId) { ElMessage.warning('请选择目标审批流程'); return }
  const selected = processes.value.find(item => item.id === Number(ruleForm.processId))
  if (props.taskType !== 'business' && Number(ruleForm.enabled) === 1 && Number(selected?.enabled) !== 1) { ElMessage.warning('启用规则前必须选择已启用流程'); return }
  if (props.taskType === 'special' && !selected?.businessTypeCode) { ElMessage.warning('所选专项流程没有专项类型编码'); return }
  return { ruleCode, ruleName, triggerEvent: ruleForm.triggerEvent, targetTaskType: props.taskType, processId: props.taskType === 'business' ? undefined : Number(ruleForm.processId), businessTypeCode: props.taskType === 'special' ? selected?.businessTypeCode : String(ruleForm.businessTypeCode || '').trim() || undefined, scopeType: props.taskType === 'business' ? undefined : ruleForm.scopeType, finalConfirm: props.taskType === 'business' ? 0 : Number(ruleForm.finalConfirm || 0), enabled: Number(ruleForm.enabled || 0) }
}

async function saveRule() {
  const payload = buildRulePayload(); if (!payload) return
  ruleSaving.value = true
  try {
    if (ruleForm.id) await feigeTaskData.updateBridgeRule(ruleForm.id, payload)
    else await feigeTaskData.createBridgeRule(payload)
    ElMessage.success(feigeTaskLocalDemo() ? 'LOCAL-DEMO：预览规则已保存' : '自动生成规则已保存')
    ruleFormVisible.value = false; await loadRules(); emit('changed')
  } catch (error) { ElMessage.error(`规则保存失败：${errorText(error)}`) }
  finally { ruleSaving.value = false }
}

async function toggleRule(row: TaskBridgeRule) {
  const payload: TaskBridgeRulePayload = { ruleCode: row.ruleCode, ruleName: row.ruleName, triggerEvent: row.triggerEvent as any, targetTaskType: row.targetTaskType as any, processId: row.processId, businessTypeCode: row.businessTypeCode, scopeType: row.scopeType, finalConfirm: Number(row.finalConfirm||0), enabled: Number(row.enabled)===1?0:1 }
  if (payload.enabled === 1 && props.taskType !== 'business' && Number(processes.value.find(item => item.id === Number(row.processId))?.enabled) !== 1) return ElMessage.warning('请先启用规则绑定的审批流程')
  try { await feigeTaskData.updateBridgeRule(row.id,payload); ElMessage.success(payload.enabled?'规则已启用':'规则已停用'); await loadRules(); emit('changed') }
  catch (error) { ElMessage.error(`规则状态更新失败：${errorText(error)}`) }
}

async function loadRuns() {
  runLoading.value = true
  try { const result = await feigeTaskData.bridgeRuns({ ...runQuery, status: runQuery.status || undefined, orderId: runQuery.orderId || undefined }); runs.value = result?.records || []; runTotal.value = Number(result?.total || 0) }
  catch (error) { runs.value = []; runTotal.value = 0; ElMessage.error(`生成记录加载失败：${errorText(error)}`) }
  finally { runLoading.value = false }
}
function searchRuns() { runQuery.pageNum = 1; loadRuns() }
async function retryRun(row: TaskBridgeRun) {
  try { await ElMessageBox.confirm('确认重试本次任务生成？系统会执行幂等校验，已成功的目标不会重复创建。','重试生成',{type:'warning'}); await feigeTaskData.retryBridgeRun(row.id); ElMessage.success('已提交重试'); await loadRuns() }
  catch (error:any) { if (error !== 'cancel' && error !== 'close') ElMessage.error(`重试失败：${errorText(error)}`) }
}

function parseJsonList(value?: string): any[] { if (!value) return []; try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed : [] } catch { return [] } }
function parseOptions(value: string) { return value.split(/[,，\n]/).map(item=>item.trim()).filter(Boolean).map(item=>{ const [rawValue,...labelParts]=item.split('|'); const label=labelParts.join('|').trim()||rawValue.trim(); return { value:rawValue.trim(), label } }) }
function flattenRoles(nodes: RoleTreeNode[]): RoleTreeNode[] { return nodes.flatMap(node => [node, ...flattenRoles(node.children || [])]) }
function staffLabel(item: StaffOption) { return `${item.name}${item.deptName ? ` · ${item.deptName}` : ''}` }
function processLabel(item: AuditProcess) { return `${item.processName}${props.taskType==='special'&&item.businessTypeCode?` · ${item.businessTypeCode}`:''}` }
function processName(id?: number) { return processes.value.find(item => item.id === Number(id))?.processName || (id ? `流程 #${id}` : '-') }
function triggerLabel(value: string) { return ({ order_created:'订单创建', finance_approved:'财务审核通过' } as Record<string,string>)[value] || value }
function targetLabel(value?: string) { return ({ business:'业务任务', once:'一次性任务', recurring:'周期任务', project_dept:'项目部门任务', special:'专项任务' } as Record<string,string>)[value||''] || value || '-' }
function runStatusLabel(value: string) { return ({ pending:'待处理', processing:'处理中', success:'成功', failed:'失败', dead:'已终止', skipped:'已跳过' } as Record<string,string>)[value] || value }
function runStatusType(value: string): any { return value==='success'?'success':['failed','dead'].includes(value)?'danger':value==='skipped'?'info':'warning' }
function retryable(value: string) { return ['failed','dead','skipped'].includes(value) }
function errorText(error: any) { return error?.response?.data?.message || error?.message || '未知错误' }

defineExpose({ open })
</script>

<style scoped lang="scss">
.config-tabs { margin-top: 14px; }
.section-head,.step-head,.step-title,.sub-head { display:flex; align-items:center; justify-content:space-between; gap:14px; }
.section-head { margin-bottom:14px; }.section-head h3,.step-head h3 { margin:0 0 5px; }.section-head p,.step-head p { margin:0; color:#64748b; }
.inline-alert { margin-bottom:12px; }.run-filter { display:flex; gap:10px; margin-bottom:12px; }.run-filter>* { width:180px; }.run-filter .el-button { width:auto; }
.process-form-body { max-height:72vh; overflow:auto; padding-right:4px; }.base-form-grid,.step-grid,.rule-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 16px; }.full-row { grid-column:1/-1; }
.step-head { margin:18px 0 10px; }.step-card { border:1px solid #dfe5ed; border-radius:10px; padding:14px; margin-bottom:12px; background:#fbfcfe; }.step-title { margin-bottom:10px; }.step-title>div { display:flex; align-items:center; gap:5px; }
.sub-config { margin-top:12px; padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }.sub-head b { display:block; }.sub-head small { color:#64748b; }.field-row { display:grid; grid-template-columns:1fr 1fr 150px minmax(180px,1fr) 72px auto; gap:8px; align-items:center; margin-top:9px; }.capability-note,.field-help { margin:5px 0 0; color:#94a3b8; font-size:12px; }.switch-help { margin-left:10px; color:#64748b; font-size:12px; }.muted { color:#94a3b8; }.pagination-bar { display:flex; justify-content:flex-end; margin-top:12px; }
@media(max-width:800px){.base-form-grid,.step-grid,.rule-form-grid{grid-template-columns:1fr}.field-row{grid-template-columns:1fr}.run-filter{flex-wrap:wrap}.section-head,.step-head{align-items:flex-start}.step-title{align-items:flex-start;flex-direction:column}}
</style>

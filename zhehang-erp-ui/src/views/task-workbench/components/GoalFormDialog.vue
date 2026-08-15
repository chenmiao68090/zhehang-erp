<template>
  <el-dialog
    v-model="visible"
    :title="form.id ? '编辑目标' : '新增目标'"
    width="min(980px, 94vw)"
    top="5vh"
    destroy-on-close
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="96px">
      <el-form-item label="目标名称" prop="title">
        <el-input v-model="form.title" maxlength="100" />
      </el-form-item>
      <div class="form-grid">
        <el-form-item label="适用角色" prop="roleId">
          <el-tree-select v-model="form.roleId" :data="roles" node-key="id" :props="treeProps" check-strictly />
        </el-form-item>
        <el-form-item label="目标年度" prop="year">
          <el-input-number v-model="form.year" :min="2020" :max="2100" @change="resetPeriod" />
        </el-form-item>
        <el-form-item label="目标周期" prop="cycleType">
          <el-select v-model="form.cycleType" @change="resetPeriod">
            <el-option label="每月" value="month" />
            <el-option label="季度" value="quarter" />
            <el-option label="半年" value="half_year" />
            <el-option label="年度" value="year" />
          </el-select>
        </el-form-item>
        <el-form-item label="周期序号" prop="periodKey">
          <el-select v-model="form.periodKey">
            <el-option v-for="item in periodOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="指标名称" prop="metricName">
          <el-input v-model="form.metricName" placeholder="如：新签合同额" />
        </el-form-item>
        <el-form-item label="指标单位">
          <el-input v-model="form.unit" placeholder="元、单、%、户" />
        </el-form-item>
        <el-form-item label="目标值" prop="targetValue">
          <el-input-number v-model="form.targetValue" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="当前实际">
          <el-input-number v-model="form.actualValue" :min="0" :precision="2" />
        </el-form-item>
      </div>
      <el-form-item label="目标说明">
        <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
      </el-form-item>

      <section class="plan-section">
        <div class="section-heading">
          <div>
            <h3>目标计划与责任人分解</h3>
            <p>先拆分执行计划，再为每个计划分配责任人及个人目标值。</p>
          </div>
          <el-button type="primary" plain @click="addPlan">新增计划</el-button>
        </div>

        <el-empty v-if="form.plans.length === 0" description="暂未拆分执行计划" :image-size="64" />
        <article v-for="(plan, planIndex) in form.plans" :key="plan._key" class="plan-card">
          <div class="plan-heading">
            <strong>计划 {{ planIndex + 1 }}</strong>
            <div class="plan-summary">
              <span>{{ plan.users.length }} 人负责</span>
              <span>目标合计 {{ formatNumber(planTotal(plan, 'targetValue')) }}{{ form.unit }}</span>
              <span>实际合计 {{ formatNumber(planTotal(plan, 'actualValue')) }}{{ form.unit }}</span>
              <el-button link type="danger" @click="removePlan(planIndex)">删除计划</el-button>
            </div>
          </div>

          <div class="plan-fields">
            <label class="wide-field">
              <span>计划名称 <b>*</b></span>
              <el-input v-model="plan.title" maxlength="100" placeholder="如：高意向客户集中转化" />
            </label>
            <label>
              <span>开始日期</span>
              <el-date-picker v-model="plan.startDate" type="date" value-format="YYYY-MM-DD" clearable />
            </label>
            <label>
              <span>结束日期</span>
              <el-date-picker v-model="plan.endDate" type="date" value-format="YYYY-MM-DD" clearable />
            </label>
            <label class="full-field">
              <span>计划说明</span>
              <el-input v-model="plan.description" type="textarea" :rows="2" maxlength="300" show-word-limit />
            </label>
          </div>

          <div class="owner-heading">
            <div><strong>责任人分解</strong><small>同一计划中不能重复选择员工</small></div>
            <el-button :disabled="staff.length === 0 || selectedOwnerCount(plan) >= staff.length" @click="addOwner(plan)">添加责任人</el-button>
          </div>
          <el-alert
            v-if="staff.length === 0"
            title="暂未加载到可选员工，已有责任人仍会原样保留。"
            type="warning"
            :closable="false"
          />
          <div v-if="plan.users.length" class="owner-table">
            <div class="owner-table-head"><span>责任人</span><span>个人目标值</span><span>个人实际值</span><span>操作</span></div>
            <div v-for="(owner, ownerIndex) in plan.users" :key="owner._key" class="owner-row">
              <el-select
                v-model="owner.userId"
                filterable
                placeholder="选择系统员工"
                @change="syncOwnerName(owner)"
              >
                <el-option
                  v-if="owner.userId && !staff.some(person => person.id === owner.userId)"
                  :value="owner.userId"
                  :label="`${owner.userName || `员工${owner.userId}`} · 历史责任人`"
                />
                <el-option
                  v-for="person in staff"
                  :key="person.id"
                  :value="person.id"
                  :label="`${person.name}${person.deptName ? ` · ${person.deptName}` : ''}`"
                  :disabled="ownerSelected(plan, person.id, owner._key)"
                />
              </el-select>
              <el-input-number v-model="owner.targetValue" :min="0" :precision="2" controls-position="right" />
              <el-input-number v-model="owner.actualValue" :min="0" :precision="2" controls-position="right" />
              <el-button link type="danger" @click="plan.users.splice(ownerIndex, 1)">删除</el-button>
            </div>
          </div>
        </article>
      </section>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="saving" @click="submit">保存目标</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import type { Goal, GoalPayload, GoalPlan, GoalPlanUser, RoleTreeNode, StaffOption } from '@/api/feige-task'

interface EditablePlanUser extends Omit<GoalPlanUser, 'userId'> {
  _key: string
  userId?: number
}

interface EditablePlan extends Omit<GoalPlan, 'users'> {
  _key: string
  users: EditablePlanUser[]
}

interface GoalFormModel {
  id?: number
  title: string
  roleId?: number
  year: number
  cycleType: Goal['cycleType']
  periodKey: string
  metricName: string
  targetValue: number
  actualValue: number
  unit: string
  status: Goal['status']
  description: string
  plans: EditablePlan[]
}

const props = defineProps<{ roles: RoleTreeNode[]; staff: StaffOption[] }>()
const emit = defineEmits<{ (event: 'save', payload: GoalPayload, id?: number): void }>()
const visible = ref(false)
const saving = ref(false)
const formRef = ref<FormInstance>()
const treeProps = { label: 'name', children: 'children', value: 'id' }
const currentYear = new Date().getFullYear()
let draftSequence = 0

const form = reactive<GoalFormModel>({
  id: undefined,
  title: '',
  roleId: undefined,
  year: currentYear,
  cycleType: 'month',
  periodKey: `${currentYear}-01`,
  metricName: '',
  targetValue: 0,
  actualValue: 0,
  unit: '',
  status: 'draft',
  description: '',
  plans: []
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入目标名称' }],
  roleId: [{ required: true, message: '请选择适用角色' }],
  year: [{ required: true }],
  cycleType: [{ required: true }],
  periodKey: [{ required: true }],
  metricName: [{ required: true, message: '请输入指标名称' }],
  targetValue: [{ required: true, message: '请输入目标值' }]
}

const periodOptions = computed(() => {
  if (form.cycleType === 'month') return Array.from({ length: 12 }, (_, index) => ({ label: `${index + 1}月`, value: `${form.year}-${String(index + 1).padStart(2, '0')}` }))
  if (form.cycleType === 'quarter') return Array.from({ length: 4 }, (_, index) => ({ label: `第${index + 1}季度`, value: `${form.year}-Q${index + 1}` }))
  if (form.cycleType === 'half_year') return [{ label: '上半年', value: `${form.year}-H1` }, { label: '下半年', value: `${form.year}-H2` }]
  return [{ label: `${form.year}年度`, value: String(form.year) }]
})

function draftKey(prefix: string) {
  draftSequence += 1
  return `${prefix}-${draftSequence}`
}

function clonePlans(plans: GoalPlan[] = []): EditablePlan[] {
  return plans.map(plan => ({
    id: plan.id,
    title: plan.title || '',
    description: plan.description || '',
    startDate: plan.startDate,
    endDate: plan.endDate,
    _key: draftKey('plan'),
    users: (plan.users || []).map(owner => ({
      id: owner.id,
      userId: owner.userId,
      userName: owner.userName,
      targetValue: owner.targetValue,
      actualValue: owner.actualValue,
      _key: draftKey('owner')
    }))
  }))
}

function resetPeriod() {
  form.periodKey = periodOptions.value[0]?.value || String(form.year)
}

function open(row?: Goal) {
  Object.assign(form, {
    id: row?.id,
    title: row?.title || '',
    roleId: row?.roleId,
    year: row?.year ?? currentYear,
    cycleType: row?.cycleType || 'month',
    periodKey: row?.periodKey || `${currentYear}-01`,
    metricName: row?.metricName || '',
    targetValue: row?.targetValue ?? 0,
    actualValue: row?.actualValue ?? 0,
    unit: row?.unit || '',
    status: row?.status || 'draft',
    description: row?.description || '',
    plans: clonePlans(row?.plans || [])
  })
  visible.value = true
  nextTick(() => formRef.value?.clearValidate())
}

function addPlan() {
  form.plans.push({ _key: draftKey('plan'), title: '', description: '', startDate: undefined, endDate: undefined, users: [] })
}

function removePlan(index: number) {
  form.plans.splice(index, 1)
}

function addOwner(plan: EditablePlan) {
  const firstAvailable = props.staff.find(person => !plan.users.some(owner => owner.userId === person.id))
  plan.users.push({
    _key: draftKey('owner'),
    userId: firstAvailable?.id,
    userName: firstAvailable?.name,
    targetValue: 0,
    actualValue: 0
  })
}

function syncOwnerName(owner: EditablePlanUser) {
  owner.userName = props.staff.find(person => person.id === owner.userId)?.name || owner.userName
}

function ownerSelected(plan: EditablePlan, staffId: number, ownerKey: string) {
  return plan.users.some(owner => owner._key !== ownerKey && owner.userId === staffId)
}

function selectedOwnerCount(plan: EditablePlan) {
  return new Set(plan.users.map(owner => owner.userId).filter((id): id is number => typeof id === 'number')).size
}

function planTotal(plan: EditablePlan, field: 'targetValue' | 'actualValue') {
  return plan.users.reduce((sum, owner) => sum + Number(owner[field] || 0), 0)
}

function formatNumber(value: number) {
  return Number(value || 0).toLocaleString('zh-CN', { maximumFractionDigits: 2 })
}

function validatePlans() {
  for (let planIndex = 0; planIndex < form.plans.length; planIndex += 1) {
    const plan = form.plans[planIndex]
    if (!plan.title.trim()) {
      ElMessage.warning(`请填写计划 ${planIndex + 1} 的名称`)
      return false
    }
    if (plan.startDate && plan.endDate && plan.startDate > plan.endDate) {
      ElMessage.warning(`计划 ${planIndex + 1} 的结束日期不能早于开始日期`)
      return false
    }
    const selected = new Set<number>()
    for (const owner of plan.users) {
      if (!owner.userId) {
        ElMessage.warning(`请为计划 ${planIndex + 1} 选择责任人`)
        return false
      }
      if (selected.has(owner.userId)) {
        ElMessage.warning(`计划 ${planIndex + 1} 中存在重复责任人`)
        return false
      }
      selected.add(owner.userId)
    }
  }
  return true
}

function findRole(nodes: RoleTreeNode[], id: number): RoleTreeNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findRole(node.children || [], id)
    if (found) return found
  }
}

async function submit() {
  if (!await formRef.value?.validate() || !validatePlans()) return
  const role = findRole(props.roles, Number(form.roleId))
  const plans: GoalPlan[] = form.plans.map(plan => ({
    id: plan.id,
    title: plan.title.trim(),
    description: plan.description?.trim() || undefined,
    startDate: plan.startDate || undefined,
    endDate: plan.endDate || undefined,
    users: plan.users.map(owner => ({
      id: owner.id,
      userId: Number(owner.userId),
      userName: props.staff.find(person => person.id === owner.userId)?.name || owner.userName,
      targetValue: Number(owner.targetValue || 0),
      actualValue: Number(owner.actualValue || 0)
    }))
  }))
  const payload: GoalPayload = {
    roleId: form.roleId,
    roleName: role?.name,
    year: form.year,
    cycleType: form.cycleType,
    periodKey: form.periodKey,
    title: form.title.trim(),
    metricName: form.metricName.trim(),
    targetValue: Number(form.targetValue || 0),
    actualValue: Number(form.actualValue || 0),
    unit: form.unit.trim(),
    status: form.status,
    description: form.description.trim(),
    plans
  }
  emit('save', payload, form.id)
}

function setSaving(value: boolean, close = false) {
  saving.value = value
  if (close) visible.value = false
}

defineExpose({ open, setSaving })
</script>

<style scoped lang="scss">
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 16px; }
.form-grid :deep(.el-select), .form-grid :deep(.el-tree-select), .form-grid :deep(.el-input-number) { width: 100%; }
.plan-section { margin-top: 8px; padding-top: 18px; border-top: 1px solid #e5e7eb; }
.section-heading, .plan-heading, .owner-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.section-heading h3 { margin: 0 0 5px; color: #111827; font-size: 17px; }
.section-heading p { margin: 0; color: #64748b; font-size: 13px; }
.plan-card { margin-top: 14px; padding: 15px; border: 1px solid #dfe5ed; border-radius: 8px; background: #fbfcfe; }
.plan-heading { padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
.plan-summary { display: flex; align-items: center; gap: 14px; color: #64748b; font-size: 12px; }
.plan-fields { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px; }
.plan-fields label { display: grid; gap: 6px; color: #475569; font-size: 13px; }
.plan-fields label > span b { color: #ef4444; }
.wide-field, .full-field { grid-column: 1 / -1; }
.plan-fields :deep(.el-date-editor) { width: 100%; }
.owner-heading { margin: 15px 0 9px; }
.owner-heading > div { display: flex; align-items: baseline; gap: 10px; }
.owner-heading small { color: #94a3b8; }
.owner-table { overflow-x: auto; margin-top: 10px; }
.owner-table-head, .owner-row { min-width: 720px; display: grid; grid-template-columns: minmax(240px, 1.5fr) 1fr 1fr 60px; gap: 10px; align-items: center; }
.owner-table-head { padding: 8px 0; color: #64748b; font-size: 12px; }
.owner-row { padding: 8px 0; border-top: 1px solid #edf0f4; }
.owner-row :deep(.el-input-number) { width: 100%; }
@media (max-width: 700px) {
  .form-grid, .plan-fields { grid-template-columns: 1fr; }
  .wide-field, .full-field { grid-column: auto; }
  .section-heading, .plan-heading, .owner-heading { align-items: flex-start; flex-direction: column; }
  .plan-summary { flex-wrap: wrap; }
}
</style>

<template>
  <div class="task-workbench task-workbench-page goal-page">
    <header class="page-head page-heading"><div class="page-title"><div class="eyebrow"><el-icon><Aim /></el-icon> 任务工单 · 目标管理</div><h2>目标设置</h2><p>目标必须有口径、周期、责任角色和实际值来源，禁止用演示数字替代生产事实。</p></div><div class="heading-actions"><el-tag v-if="feigeTaskLocalDemo()" type="warning" size="large" effect="dark">LOCAL-DEMO 演示数据</el-tag><el-tag v-if="capabilityLoaded&&!capabilities.manager" type="info" size="large">只读查看</el-tag><el-button v-if="capabilities.manager" type="primary" :disabled="!roles.length" @click="formRef?.open()">新增目标</el-button></div></header>
    <el-alert v-if="errorText" :title="errorText" type="error" show-icon :closable="false" />
    <el-alert v-if="capabilities.manager&&!roles.length" title="系统暂无可用角色，暂不能新增目标" description="请先在系统角色管理中配置并启用角色；目标直接复用系统角色。" type="warning" show-icon :closable="false" />
    <section class="toolbar-card">
      <el-select v-model="query.year" @change="searchGoals"><el-option v-for="year in years" :key="year" :value="year" :label="`${year}年`"/></el-select>
      <el-tree-select v-model="query.roleId" :data="roles" node-key="id" :props="treeProps" check-strictly clearable placeholder="全部角色" @change="searchGoals"/>
      <el-select v-model="query.status" clearable placeholder="全部状态" @change="searchGoals"><el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"/></el-select>
      <el-button :loading="loading" @click="loadGoals">刷新</el-button>
    </section>
    <el-tabs v-model="query.cycleType" @tab-change="searchGoals"><el-tab-pane label="全部" name=""/><el-tab-pane label="每月" name="month"/><el-tab-pane label="季度" name="quarter"/><el-tab-pane label="半年" name="half_year"/><el-tab-pane label="年度" name="year"/></el-tabs>
    <el-empty v-if="!loading&&goals.length===0" :description="capabilities.manager&&roles.length?'暂无目标，可点击右上角新增':'暂无目标'"/>
    <section v-loading="loading" class="goal-grid">
      <article v-for="goal in goals" :key="goal.id" class="goal-card">
        <div class="goal-head"><div><el-tag :type="cycleTag(goal.cycleType)">{{ cycleText(goal.cycleType) }}</el-tag><el-tag :type="statusTag(goal.status)" effect="plain">{{ statusText(goal.status) }}</el-tag></div><el-dropdown v-if="capabilities.manager" trigger="click"><el-button text :icon="MoreFilled"/><template #dropdown><el-dropdown-menu><el-dropdown-item :disabled="!['draft','active'].includes(goal.status)" @click="formRef?.open(goal)">编辑</el-dropdown-item><el-dropdown-item v-if="goal.status==='draft'" @click="changeStatus(goal,'active')">启用</el-dropdown-item><el-dropdown-item v-if="goal.status==='active'" @click="complete(goal)">完成</el-dropdown-item><el-dropdown-item v-if="['active','completed'].includes(goal.status)" @click="changeStatus(goal,'archived')">归档</el-dropdown-item><el-dropdown-item divided :disabled="!['draft','archived'].includes(goal.status)" @click="remove(goal)">删除</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div>
        <h3>{{ goal.title }}</h3><p>{{ goal.description || '暂无说明' }}</p>
        <div class="goal-period"><span>{{ goal.roleName || '未设置角色' }}</span><strong>{{ goal.periodKey }}</strong></div>
        <div class="goal-numbers"><div><span>目标</span><strong>{{ number(goal.targetValue) }}{{ goal.unit }}</strong></div><div><span>实际</span><strong>{{ number(goal.actualValue||0) }}{{ goal.unit }}</strong></div></div>
        <el-progress :percentage="progress(goal)" :status="progress(goal)>=100?'success':undefined"/>
        <div v-if="goal.plans?.length" class="plan-list"><strong>执行计划</strong><div v-for="plan in goal.plans" :key="plan.id||plan.title" class="plan-item"><span>{{ plan.title }}</span><em>{{ plan.users?.length||0 }} 人负责</em><small v-if="plan.users?.length">{{ plan.users.map(user=>`${user.userName||'未命名'} ${number(user.targetValue||0)}${goal.unit||''}`).join(' · ') }}</small></div></div>
        <div v-if="goal.completionNote" class="completion-note">完成说明：{{ goal.completionNote }}</div>
      </article>
    </section>
    <div v-if="total>query.pageSize" class="pagination-bar"><el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" :page-sizes="[12,24,48]" layout="total, sizes, prev, pager, next" @current-change="loadGoals" @size-change="searchGoals"/></div>
    <GoalFormDialog v-if="capabilities.manager" ref="formRef" :roles="roles" :staff="staff" @save="saveGoal"/>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage,ElMessageBox } from 'element-plus'
import { Aim,MoreFilled } from '@element-plus/icons-vue'
import type { FeigeTaskCapabilities,Goal,GoalPayload,PageResult,RoleTreeNode,StaffOption } from '@/api/feige-task'
import { feigeTaskData, feigeTaskLocalDemo } from '@feige-task-data-source'
import GoalFormDialog from './components/GoalFormDialog.vue'
import './common.scss'
const currentYear=new Date().getFullYear(),years=Array.from({length:7},(_,i)=>currentYear-3+i)
const query=reactive({year:currentYear,roleId:undefined as number|undefined,status:'',cycleType:'',pageNum:1,pageSize:12})
const roles=ref<RoleTreeNode[]>([]),staff=ref<StaffOption[]>([]),goals=ref<Goal[]>([]),total=ref(0),loading=ref(false),errorText=ref(''),formRef=ref<InstanceType<typeof GoalFormDialog>>()
const capabilities=ref<Pick<FeigeTaskCapabilities,'manager'>>({manager:false}),capabilityLoaded=ref(false)
const treeProps={label:'name',children:'children',value:'id'}
const statusOptions=[{label:'草稿',value:'draft'},{label:'进行中',value:'active'},{label:'已完成',value:'completed'},{label:'已归档',value:'archived'}]
function unwrap<T>(v:any):T{return(v?.data?.data??v?.data??v)as T}
async function loadGoals(){loading.value=true;errorText.value='';try{const result=unwrap<PageResult<Goal>>(await feigeTaskData.goals({...query}));goals.value=result?.records||[];total.value=Number(result?.total||0)}catch{goals.value=[];total.value=0;errorText.value='目标加载失败，生产环境不会使用LOCAL-DEMO数据兜底。'}finally{loading.value=false}}
function searchGoals(){query.pageNum=1;loadGoals()}
async function loadRoles(){try{roles.value=unwrap<RoleTreeNode[]>(await feigeTaskData.roleTree())||[]}catch{roles.value=[]}}
async function loadStaff(){try{staff.value=unwrap<StaffOption[]>(await feigeTaskData.staffOptions())||[]}catch{staff.value=[];ElMessage.error('责任人选项加载失败')}}
async function loadCapabilities(){try{capabilities.value=unwrap<FeigeTaskCapabilities>(await feigeTaskData.capabilities())||{manager:false};if(capabilities.value.manager)await loadStaff()}catch{capabilities.value={manager:false};ElMessage.warning('权限信息加载失败，目标页已切换为只读')}finally{capabilityLoaded.value=true}}
async function saveGoal(payload:GoalPayload,id?:number){if(!capabilities.value.manager)return ElMessage.warning('当前账号仅可查看目标');formRef.value?.setSaving(true);try{id?await feigeTaskData.updateGoal(id,payload):await feigeTaskData.createGoal(payload);formRef.value?.setSaving(false,true);ElMessage.success(feigeTaskLocalDemo()?'LOCAL-DEMO：预览目标已更新':'目标已保存');await loadGoals()}catch{formRef.value?.setSaving(false);ElMessage.error('目标保存失败')}}
async function changeStatus(goal:Goal,status:string,payload:any={}){if(!capabilities.value.manager)return ElMessage.warning('当前账号仅可查看目标');try{await feigeTaskData.changeGoalStatus(goal.id,status,payload);ElMessage.success('状态已更新');await loadGoals()}catch{ElMessage.error('状态更新失败')}}
async function complete(goal:Goal){try{const{value}=await ElMessageBox.prompt('填写目标完成说明','完成目标',{inputType:'textarea',inputValidator:v=>!!String(v||'').trim()||'完成说明不能为空'});await changeStatus(goal,'completed',{completionNote:String(value).trim()})}catch{/* 取消时不改变状态 */}}
async function remove(goal:Goal){if(!capabilities.value.manager)return ElMessage.warning('当前账号仅可查看目标');if(!['draft','archived'].includes(goal.status))return ElMessage.warning('只有草稿或已归档目标可以删除');try{await ElMessageBox.confirm(`确认删除此${goal.status==='draft'?'草稿':'已归档'}目标？`,'删除目标',{type:'warning'});await feigeTaskData.deleteGoal(goal.id);ElMessage.success('已删除');await loadGoals()}catch{/* 取消或删除失败都保留原记录 */}}
function progress(g:Goal){return g.targetValue>0?Math.min(100,Math.round((g.actualValue||0)/g.targetValue*100)):0}function number(v:number){return Number(v||0).toLocaleString('zh-CN',{maximumFractionDigits:2})}
function statusText(v:string){return statusOptions.find(x=>x.value===v)?.label||v}function statusTag(v:string):any{return v==='active'?'primary':v==='completed'?'success':v==='archived'?'info':'warning'}
function cycleText(v:string){return({month:'每月',quarter:'季度',half_year:'半年',year:'年度'}as any)[v]||v}function cycleTag(v:string):any{return v==='month'?'primary':v==='quarter'?'success':v==='half_year'?'warning':'danger'}
onMounted(()=>{loadRoles();loadCapabilities();loadGoals()})
</script>
<style scoped lang="scss">.goal-page{display:grid;gap:16px}.heading-actions{display:flex;gap:10px;align-items:center}.toolbar-card{display:grid;grid-template-columns:160px 240px 180px auto;gap:10px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px}.goal-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:14px;min-height:120px}.goal-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px;display:grid;gap:12px}.goal-head,.goal-period,.goal-numbers{display:flex;justify-content:space-between;gap:8px;align-items:center}.goal-head>div{display:flex;gap:6px}.goal-card h3{font-size:18px;margin:0}.goal-card>p{margin:0;color:#6b7280;min-height:42px}.goal-period{color:#6b7280}.goal-numbers>div{display:grid;gap:3px}.goal-numbers span{color:#6b7280}.goal-numbers strong{font-size:20px}.plan-list{border-top:1px solid #eef2f7;padding-top:10px;display:grid;gap:7px}.plan-item{display:grid!important;grid-template-columns:1fr auto;gap:4px 10px}.plan-item em{font-style:normal;color:#6b7280}.plan-item small{grid-column:1/-1;color:#64748b;line-height:1.5}.completion-note{background:#effaf3;color:#166534;padding:9px;border-radius:7px}@media(max-width:800px){.toolbar-card{grid-template-columns:1fr 1fr}}</style>

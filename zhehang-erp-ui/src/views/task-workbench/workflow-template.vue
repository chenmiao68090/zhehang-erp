<template>
  <div class="task-workbench task-workbench-page template-page">
    <header class="page-head page-heading"><div class="page-title"><div class="eyebrow"><el-icon><Files /></el-icon> 任务工单 · 标准化</div><h2>计划模板</h2><p>主管按角色配置日、周、月固定任务；量化字段必须有明确名称、编码和单位。</p></div><div class="heading-actions"><el-tag v-if="feigeTaskLocalDemo()" type="warning" size="large" effect="dark">LOCAL-DEMO 演示数据</el-tag><el-button v-if="manager" type="primary" :disabled="!roles.length" @click="formRef?.open()">新增模板</el-button></div></header>
    <el-alert v-if="!manager && !feigeTaskLocalDemo()" title="当前账号为只读视图，只有主管、老板或管理员可以维护计划模板。" type="info" show-icon :closable="false"/>
    <el-alert v-if="manager&&!roles.length" title="系统暂无可用角色，暂不能新增计划模板" description="请先在系统角色管理中配置并启用角色；模板直接复用系统角色，不在本页另建。" type="warning" show-icon :closable="false"/>
    <el-alert v-if="errorText" :title="errorText" type="error" show-icon :closable="false"/>
    <div class="template-layout">
      <aside class="role-panel"><h3>适用角色</h3><el-input v-model="roleKeyword" clearable placeholder="搜索角色"/><el-tree ref="roleTreeRef" :data="roles" node-key="id" :props="treeProps" :filter-node-method="filterRole" default-expand-all highlight-current @node-click="selectRole"/><el-button text @click="clearRole">查看全部模板</el-button></aside>
      <main class="template-main">
        <section class="toolbar-card"><el-segmented v-model="query.cycleType" :options="cycleOptions" @change="searchTemplates"/><el-select v-model="query.enabled" clearable placeholder="全部状态" @change="searchTemplates"><el-option label="启用" :value="true"/><el-option label="停用" :value="false"/></el-select><el-button :loading="loading" @click="loadTemplates">刷新</el-button></section>
        <el-empty v-if="!loading&&templates.length===0" :description="manager&&roles.length?'当前范围没有计划模板，可点击右上角新增':'当前范围没有计划模板'"/>
        <section v-loading="loading" class="template-grid">
          <article v-for="tpl in templates" :key="tpl.id" class="template-card">
            <div class="card-head"><div><el-tag :type="cycleTag(tpl.cycleType)">{{ cycleText(tpl.cycleType) }}</el-tag><el-tag :type="tpl.enabled?'success':'info'" effect="plain">{{ tpl.enabled?'启用':'停用' }}</el-tag></div><el-dropdown v-if="manager"><el-button text :icon="MoreFilled"/><template #dropdown><el-dropdown-menu><el-dropdown-item @click="formRef?.open(tpl)">编辑</el-dropdown-item><el-dropdown-item @click="toggle(tpl)">{{ tpl.enabled?'停用':'启用' }}</el-dropdown-item><el-dropdown-item divided @click="remove(tpl)">删除</el-dropdown-item></el-dropdown-menu></template></el-dropdown></div>
            <h3>{{ tpl.taskName }}</h3><p>{{ tpl.workContent||'未填写工作内容' }}</p><div class="standard"><b>完成标准</b>{{ tpl.completionStandard||'-' }}</div>
            <div class="role-line"><span>{{ tpl.roleName||'未设置角色' }}</span><em>排序 {{ tpl.sortNo||0 }}</em></div>
            <div v-if="tpl.metrics?.length" class="metric-tags"><span>量化字段</span><el-tag v-for="m in tpl.metrics" :key="m.code" size="small" effect="plain">{{ m.label }}{{ m.unit?`（${m.unit}）`:'' }}{{ m.required?' *':'' }}</el-tag></div>
          </article>
        </section>
        <div v-if="total>query.pageSize" class="pagination-bar"><el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" :page-sizes="[12,24,48]" layout="total, sizes, prev, pager, next" @current-change="loadTemplates" @size-change="searchTemplates"/></div>
      </main>
    </div>
    <WorkflowTemplateFormDialog ref="formRef" :roles="roles" @save="saveTemplate"/>
  </div>
</template>
<script setup lang="ts">
import{onMounted,reactive,ref,watch}from'vue'
import{ElMessage,ElMessageBox}from'element-plus'
import{Files,MoreFilled}from'@element-plus/icons-vue'
import type{PageResult,RoleTreeNode,WorkflowTemplate,WorkflowTemplatePayload}from'@/api/feige-task'
import{feigeTaskData,feigeTaskLocalDemo}from'./data-source'
import WorkflowTemplateFormDialog from'./components/WorkflowTemplateFormDialog.vue'
import'./common.scss'
const roles=ref<RoleTreeNode[]>([]),templates=ref<WorkflowTemplate[]>([]),total=ref(0),loading=ref(false),errorText=ref(''),manager=ref(false),roleKeyword=ref(''),roleTreeRef=ref(),formRef=ref<InstanceType<typeof WorkflowTemplateFormDialog>>()
const query=reactive({roleId:undefined as number|undefined,cycleType:'',enabled:undefined as boolean|undefined,pageNum:1,pageSize:12}),treeProps={label:'name',children:'children'},cycleOptions=[{label:'全部',value:''},{label:'每日',value:'day'},{label:'每周',value:'week'},{label:'每月',value:'month'}]
function unwrap<T>(v:any):T{return(v?.data?.data??v?.data??v)as T}
watch(roleKeyword,v=>roleTreeRef.value?.filter(v))
async function loadRoles(){try{roles.value=unwrap<RoleTreeNode[]>(await feigeTaskData.roleTree())||[]}catch{roles.value=[]}}
async function loadCapabilities(){try{manager.value=Boolean((await feigeTaskData.capabilities())?.manager)}catch{manager.value=false}}
async function loadTemplates(){loading.value=true;errorText.value='';try{const r=unwrap<PageResult<WorkflowTemplate>>(await feigeTaskData.templates({...query}));templates.value=r?.records||[];total.value=Number(r?.total||0)}catch{templates.value=[];total.value=0;errorText.value='模板加载失败，生产环境不会回退到本地演示内容。'}finally{loading.value=false}}
function searchTemplates(){query.pageNum=1;loadTemplates()}
function selectRole(node:RoleTreeNode){query.roleId=node.id;searchTemplates()}function clearRole(){query.roleId=undefined;roleTreeRef.value?.setCurrentKey(null);searchTemplates()}function filterRole(v:string,d:RoleTreeNode){return!v||d.name.includes(v)}
async function saveTemplate(p:WorkflowTemplatePayload,id?:number){formRef.value?.setSaving(true);try{id?await feigeTaskData.updateTemplate(id,p):await feigeTaskData.createTemplate(p);formRef.value?.setSaving(false,true);ElMessage.success(feigeTaskLocalDemo()?'LOCAL-DEMO：预览模板已更新':'模板已保存');await loadTemplates()}catch{formRef.value?.setSaving(false);ElMessage.error('模板保存失败')}}
async function toggle(t:WorkflowTemplate){const{id,...payload}=t;try{await feigeTaskData.updateTemplate(id,{...payload,enabled:!t.enabled});ElMessage.success(feigeTaskLocalDemo()?`LOCAL-DEMO：模板已${t.enabled?'停用':'启用'}`:`模板已${t.enabled?'停用':'启用'}`);await loadTemplates()}catch{ElMessage.error('模板状态更新失败')}}
async function remove(t:WorkflowTemplate){try{await ElMessageBox.confirm('删除后不影响已生成的历史任务，确认继续？','删除模板',{type:'warning'})}catch{return}try{await feigeTaskData.deleteTemplate(t.id);ElMessage.success(feigeTaskLocalDemo()?'LOCAL-DEMO：预览模板已删除':'已删除');await loadTemplates()}catch{ElMessage.error('删除失败')}}
function cycleText(v:string){return({day:'每日',week:'每周',month:'每月'}as any)[v]||v}function cycleTag(v:string):any{return v==='day'?'primary':v==='week'?'success':'warning'}
onMounted(()=>{loadCapabilities();loadRoles();loadTemplates()})
</script>
<style scoped lang="scss">.template-page{display:grid;gap:16px}.heading-actions{display:flex;gap:10px;align-items:center}.template-layout{display:grid;grid-template-columns:240px 1fr;gap:14px}.role-panel,.toolbar-card,.template-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px}.role-panel{padding:16px;display:grid;align-content:start;gap:12px}.role-panel h3{margin:0}.template-main{display:grid;gap:12px}.toolbar-card{padding:12px;display:flex;gap:10px;justify-content:space-between}.template-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(330px,1fr));gap:12px;min-height:120px}.template-card{padding:16px;display:grid;gap:11px}.card-head,.role-line{display:flex;justify-content:space-between;align-items:center}.card-head>div{display:flex;gap:6px}.template-card h3{margin:0}.template-card>p{margin:0;color:#6b7280;min-height:40px}.standard{display:grid;gap:4px;background:#effaf3;color:#166534;padding:9px;border-radius:7px}.role-line{color:#6b7280}.role-line em{font-style:normal}.metric-tags{display:flex;gap:6px;flex-wrap:wrap;align-items:center;border-top:1px solid #eef2f7;padding-top:9px}.metric-tags>span{font-size:12px;color:#6b7280}@media(max-width:900px){.template-layout{grid-template-columns:1fr}.role-panel{display:none}}</style>

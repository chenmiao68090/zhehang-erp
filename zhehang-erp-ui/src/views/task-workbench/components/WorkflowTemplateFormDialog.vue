<template>
  <el-dialog v-model="visible" :title="form.id?'编辑计划模板':'新增计划模板'" width="720px" destroy-on-close>
    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
      <div class="two-cols">
        <el-form-item label="适用角色" prop="roleId"><el-tree-select v-model="form.roleId" :data="roles" node-key="id" :props="treeProps" check-strictly /></el-form-item>
        <el-form-item label="任务周期" prop="cycleType"><el-select v-model="form.cycleType"><el-option label="每日" value="day"/><el-option label="每周" value="week"/><el-option label="每月" value="month"/></el-select></el-form-item>
        <el-form-item label="任务名称" prop="taskName"><el-input v-model="form.taskName" maxlength="100"/></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="form.sortNo" :min="0" :max="999"/></el-form-item>
      </div>
      <el-form-item label="工作内容"><el-input v-model="form.workContent" type="textarea" :rows="2" maxlength="500" show-word-limit/></el-form-item>
      <el-form-item label="完成标准" prop="completionStandard"><el-input v-model="form.completionStandard" type="textarea" :rows="2" maxlength="500" show-word-limit/></el-form-item>
      <el-form-item label="是否启用"><el-switch v-model="form.enabled"/></el-form-item>
      <section class="metric-editor">
        <div class="metric-head"><div><h3>动态量化字段</h3><p>只用于可量化结果，不承载任意脚本或动态表单。</p></div><el-button type="primary" plain @click="addMetric">添加指标</el-button></div>
        <el-empty v-if="form.metrics.length===0" description="暂无量化字段" :image-size="60"/>
        <div v-for="(metric,index) in form.metrics" :key="index" class="metric-row">
          <el-input v-model="metric.label" placeholder="指标名称，如有效跟进"/>
          <el-input v-model="metric.code" placeholder="字段编码，如 follow_count"/>
          <el-input v-model="metric.unit" placeholder="单位"/>
          <el-checkbox v-model="metric.required">必填</el-checkbox>
          <el-button text type="danger" :icon="Delete" @click="form.metrics.splice(index,1)"/>
        </div>
      </section>
    </el-form>
    <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" :loading="saving" @click="submit">保存模板</el-button></template>
  </el-dialog>
</template>
<script setup lang="ts">
import { reactive,ref } from 'vue'
import{ElMessage,type FormInstance,type FormRules}from'element-plus'
import{Delete}from'@element-plus/icons-vue'
import type{RoleTreeNode,WorkflowTemplate,WorkflowTemplatePayload}from'@/api/feige-task'
const props=defineProps<{roles:RoleTreeNode[]}>(),emit=defineEmits<{(e:'save',p:WorkflowTemplatePayload,id?:number):void}>()
const visible=ref(false),saving=ref(false),formRef=ref<FormInstance>(),treeProps={label:'name',children:'children',value:'id'}
const form=reactive<any>({id:undefined,roleId:undefined,cycleType:'day',taskName:'',completionStandard:'',workContent:'',sortNo:0,enabled:true,metrics:[]})
const rules:FormRules={roleId:[{required:true,message:'请选择角色'}],cycleType:[{required:true}],taskName:[{required:true,message:'请输入任务名称'}],completionStandard:[{required:true,message:'请输入完成标准'}]}
function open(row?:WorkflowTemplate){Object.assign(form,{id:row?.id,roleId:row?.roleId,cycleType:row?.cycleType||'day',taskName:row?.taskName||'',completionStandard:row?.completionStandard||'',workContent:row?.workContent||'',sortNo:row?.sortNo||0,enabled:row?.enabled??true,metrics:(row?.metrics||[]).map(m=>({...m}))});visible.value=true}
function addMetric(){form.metrics.push({code:'',label:'',fieldType:'number',unit:'',required:true})}
async function submit(){if(!await formRef.value?.validate())return;const codes=new Set<string>();for(const m of form.metrics){m.code=String(m.code||'').trim();m.label=String(m.label||'').trim();if(!m.code||!m.label)return ElMessage.warning('请补全量化字段的名称和编码');if(!/^[a-z][a-z0-9_]{0,39}$/.test(m.code))return ElMessage.warning('字段编码必须以小写字母开头，且只能包含小写字母、数字和下划线');if(codes.has(m.code))return ElMessage.warning(`字段编码 ${m.code} 重复`);codes.add(m.code)}const role=findRole(props.roles,form.roleId);const payload={...form,roleName:role?.name,metrics:form.metrics.map((m:any)=>({...m,fieldType:'number'}))};delete payload.id;emit('save',payload,form.id)}
function findRole(nodes:RoleTreeNode[],id:number):RoleTreeNode|undefined{for(const n of nodes){if(n.id===id)return n;const f=findRole(n.children||[],id);if(f)return f}}
function setSaving(v:boolean,close=false){saving.value=v;if(close)visible.value=false}defineExpose({open,setSaving})
</script>
<style scoped>.two-cols{display:grid;grid-template-columns:1fr 1fr;gap:0 16px}.two-cols :deep(.el-select),.two-cols :deep(.el-tree-select),.two-cols :deep(.el-input-number){width:100%}.metric-editor{border:1px solid #e5e7eb;border-radius:9px;padding:14px}.metric-head{display:flex;justify-content:space-between;align-items:center}.metric-head h3{margin:0 0 4px}.metric-head p{margin:0;color:#6b7280}.metric-row{display:grid;grid-template-columns:1fr 1fr 100px auto auto;gap:8px;margin-top:10px;align-items:center}@media(max-width:720px){.two-cols{grid-template-columns:1fr}.metric-row{grid-template-columns:1fr}}</style>

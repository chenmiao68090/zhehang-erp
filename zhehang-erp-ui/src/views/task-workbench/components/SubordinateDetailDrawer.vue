<template>
  <el-drawer v-model="visible" :title="`${detail?.userName||''} · 工作详情`" size="720px">
    <el-skeleton v-if="loading" :rows="6" animated/>
    <template v-else-if="detail">
      <el-descriptions :column="2" border><el-descriptions-item label="部门">{{detail.deptName||'-'}}</el-descriptions-item><el-descriptions-item label="角色">{{detail.roleName||'-'}}</el-descriptions-item><el-descriptions-item label="统计周期">{{detail.periodKey}}</el-descriptions-item><el-descriptions-item label="报告状态"><el-tag :type="detail.submitted?'success':'danger'">{{detail.submitted?'已提交':'未提交'}}</el-tag></el-descriptions-item></el-descriptions>
      <div class="rate-block"><strong>任务完成率</strong><el-progress :percentage="detail.completionRate" :status="detail.completionRate>=100?'success':undefined"/></div>
      <h3>任务明细</h3>
      <div class="task-list"><article v-for="task in detail.tasks" :key="task.id" :class="['task-row',task.status]"><el-icon><CircleCheckFilled v-if="task.status==='done'"/><WarningFilled v-else-if="task.status==='undone'"/><Clock v-else/></el-icon><div><strong>{{task.taskName}}</strong><p>{{task.completionStandard||task.workContent||'-'}}</p><small v-if="task.undoneReason">未完成原因：{{task.undoneReason}}</small><div v-if="task.metrics?.length" class="metrics"><el-tag v-for="m in task.metrics" :key="m.code" size="small" effect="plain">{{m.label}} {{m.value??0}}/{{m.target??'-'}} {{m.unit}}</el-tag></div></div><el-tag :type="task.status==='done'?'success':task.status==='undone'?'danger':'warning'">{{task.status==='done'?'完成':task.status==='undone'?'未完成':'进行中'}}</el-tag></article></div>
      <h3>工作总结</h3><div class="summary">{{detail.summary||'未填写总结'}}</div>
    </template>
    <el-empty v-else description="没有可查看的详情"/>
  </el-drawer>
</template>
<script setup lang="ts">import{ref}from'vue';import{ElMessage}from'element-plus';import{CircleCheckFilled,WarningFilled,Clock}from'@element-plus/icons-vue';import type{SubordinateDetail}from'@/api/feige-task';const visible=ref(false),loading=ref(false),detail=ref<SubordinateDetail>();async function open(loader:()=>Promise<SubordinateDetail>){visible.value=true;loading.value=true;detail.value=undefined;try{detail.value=await loader()}catch{ElMessage.error('下属任务详情加载失败')}finally{loading.value=false}}defineExpose({open})</script>
<style scoped>.rate-block{margin:20px 0;display:grid;gap:8px}.task-list{display:grid;gap:9px;margin-bottom:20px}.task-row{display:grid;grid-template-columns:auto 1fr auto;gap:10px;border:1px solid #e5e7eb;border-left:4px solid #f59e0b;border-radius:8px;padding:12px}.task-row.done{border-left-color:#22c55e}.task-row.undone{border-left-color:#ef4444}.task-row p{margin:4px 0;color:#6b7280}.task-row small{color:#dc2626}.metrics{display:flex;gap:5px;flex-wrap:wrap;margin-top:7px}.summary{background:#f8fafc;padding:14px;border-radius:8px;line-height:1.7}</style>

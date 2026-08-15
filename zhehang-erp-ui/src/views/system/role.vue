<template>
  <!-- 角色管理(合并版):原「角色列表 / 角色权限设置」两个标签页合并为单页;
       角色的新建/编辑/删除/配置权限已并入 role-permission.vue 左栏(⋮ 菜单 + 底部新建),
       成员管理内嵌为「该角色成员」区块。旧 ?tab=perm 深链无需处理:单页直达同一内容。 -->
  <div class="page-container role-merged-page">
    <RolePermission />
  </div>
</template>

<script setup lang="ts">
import RolePermission from './role-permission.vue'
</script>

<style lang="scss" scoped>
.page-container {
  padding: 16px;
}
/* 嵌入后去掉 role-permission 自带的整页留白,避免双重 padding */
.role-merged-page :deep(.rp-page) {
  padding: 0;
  min-height: auto;
}
</style>

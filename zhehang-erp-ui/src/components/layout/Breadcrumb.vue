<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <span v-if="item.redirect">
        <router-link :to="item.redirect">{{ item.meta?.title }}</router-link>
      </span>
      <span v-else>{{ item.meta?.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta?.title)
})
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  font-size: 14px;
}
</style>

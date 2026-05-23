<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
      <span v-if="item.redirect">
        <router-link :to="item.redirect as string">{{ translateTitle(item.meta?.title as string | undefined) }}</router-link>
      </span>
      <span v-else>{{ translateTitle(item.meta?.title as string | undefined) }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const { t } = useI18n()

const translateTitle = (title: string | undefined) => {
  if (!title) return ''
  if (title.includes('.')) {
    const translated = t(title)
    return translated === title ? title : translated
  }
  return title
}

const breadcrumbs = computed(() => {
  return route.matched.filter((item) => item.meta?.title)
})
</script>

<style lang="scss" scoped>
.el-breadcrumb {
  font-size: 14px;
}
</style>

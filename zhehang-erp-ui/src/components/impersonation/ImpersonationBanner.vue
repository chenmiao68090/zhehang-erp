<template>
  <section v-if="impersonationStore.active" class="impersonation-banner" role="status" aria-live="polite">
    <div class="ib-main">
      <el-icon class="ib-icon"><View /></el-icon>
      <div class="ib-copy">
        <strong>正在以【{{ targetName }}】身份查看</strong>
        <span>实际操作人：{{ actorName }} · 查看模式</span>
        <span v-if="targetDeptName" class="ib-dept">部门：{{ targetDeptName }}</span>
        <span v-if="impersonationStore.current?.multipleRoles" class="ib-multi-role">多角色账号：按后端真实合并权限展示</span>
      </div>
    </div>
    <div class="ib-actions">
      <span class="ib-countdown">剩余 {{ remainingText }}</span>
      <el-button type="danger" plain :loading="impersonationStore.ending" @click="impersonationStore.end">
        退出员工视角
      </el-button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { View } from '@element-plus/icons-vue'
import { useImpersonationStore } from '@/stores/impersonation'

const impersonationStore = useImpersonationStore()
const now = ref(Date.now())
let timer: number | undefined

const targetName = computed(() => impersonationStore.current?.targetName || '员工')
const targetDeptName = computed(() => impersonationStore.current?.targetDeptName || '')
const actorName = computed(() => impersonationStore.current?.actorName || '超级管理员')
const remainingText = computed(() => {
  const expireTime = impersonationStore.current?.expireTime
  const remaining = Math.max(0, new Date(expireTime || '').getTime() - now.value)
  if (!Number.isFinite(remaining)) return '--:--'
  const totalSeconds = Math.ceil(remaining / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

onMounted(() => {
  timer = window.setInterval(() => { now.value = Date.now() }, 1000)
})

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer)
})
</script>

<style scoped lang="scss">
.impersonation-banner {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 7px 18px;
  border-bottom: 1px solid #ffb7a5;
  background: linear-gradient(90deg, #fff1e8 0%, #fff7ed 58%, #fff2f0 100%);
  color: #7a2e0e;
  flex-shrink: 0;
  z-index: 1001;
  box-shadow: 0 2px 8px rgba(186, 65, 28, 0.08);
}

.ib-main,
.ib-actions,
.ib-copy {
  display: flex;
  align-items: center;
}

.ib-main { min-width: 0; gap: 10px; }
.ib-icon { flex: 0 0 auto; font-size: 20px; color: #d4380d; }
.ib-copy { min-width: 0; flex-wrap: wrap; gap: 4px 12px; font-size: 13px; }
.ib-copy strong { color: #ad2102; font-size: 15px; }
.ib-copy span { color: #8c4a2f; white-space: nowrap; }
.ib-copy .ib-multi-role { color: #cf1322; font-weight: 700; }
.ib-actions { flex: 0 0 auto; gap: 12px; }
.ib-countdown { color: #ad2102; font-size: 13px; font-variant-numeric: tabular-nums; font-weight: 650; }

@media (max-width: 760px) {
  .impersonation-banner { align-items: flex-start; padding: 8px 10px; gap: 8px; }
  .ib-copy { display: grid; gap: 1px; }
  .ib-copy span { font-size: 11px; }
  .ib-copy .ib-dept { display: none; }
  .ib-actions { align-items: flex-end; flex-direction: column; gap: 3px; }
  .ib-actions :deep(.el-button) { height: 28px; padding: 5px 9px; }
  .ib-countdown { font-size: 11px; }
}
</style>

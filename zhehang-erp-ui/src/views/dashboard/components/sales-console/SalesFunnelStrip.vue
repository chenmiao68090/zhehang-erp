<template>
  <div class="funnel-strip" role="list" aria-label="销售漏斗">
    <template v-for="(stage, index) in stages" :key="stage.code">
      <button class="funnel-stage" type="button" role="listitem" @click="$emit('stage-click', stage)">
        <span class="stage-order">{{ index + 1 }}</span>
        <span class="stage-body">
          <b>{{ stage.label }}</b>
          <small>当前 {{ stage.currentCount }} 个</small>
        </span>
        <span class="stage-detail">
          <em v-if="stage.overdueCount > 0">逾期 {{ stage.overdueCount }}</em>
          <em v-else class="is-clear">无逾期</em>
          <small v-if="historyAvailable && stage.conversionRate != null">推进率 {{ stage.conversionRate }}%</small>
          <small v-else>历史从上线后统计</small>
        </span>
      </button>
      <el-icon v-if="index < stages.length - 1" class="stage-arrow"><ArrowRight /></el-icon>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ArrowRight } from '@element-plus/icons-vue'
import type { SalesStageItem } from '@/api/sales-console'

defineProps<{ stages: SalesStageItem[]; historyAvailable: boolean }>()
defineEmits<{ (event: 'stage-click', stage: SalesStageItem): void }>()
</script>

<style scoped lang="scss">
.funnel-strip {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 22px minmax(0, 1fr) 22px minmax(0, 1fr) 22px minmax(0, 1fr) 22px minmax(0, 1fr);
  align-items: stretch;
  gap: 4px;
}

.funnel-stage {
  width: 100%;
  min-width: 0;
  min-height: 116px;
  padding: 16px;
  border: 1px solid #d9e1eb;
  border-radius: 7px;
  background: #fff;
  color: #1f2a3d;
  text-align: left;
  cursor: pointer;
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 10px;
  row-gap: 12px;
  transition: border-color .16s ease, box-shadow .16s ease;

  &:hover, &:focus-visible {
    border-color: #2563eb;
    box-shadow: 0 3px 12px rgba(37, 99, 235, .1);
    outline: none;
  }
}

.stage-order {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #fff;
  background: #315f9e;
  font-size: 12px;
  font-weight: 700;
}

.stage-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;

  b { font-size: 14px; line-height: 1.35; }
  small { color: #6d7a8f; font-size: 12px; }
}

.stage-detail {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 6px;

  em { color: #c2413a; font-size: 12px; font-style: normal; font-weight: 600; }
  em.is-clear { color: #16805c; }
  small { color: #8792a4; font-size: 11px; text-align: right; }
}

.stage-arrow {
  align-self: center;
  justify-self: center;
  color: #94a0b2;
}

@media (max-width: 1100px) {
  .funnel-strip {
    grid-template-columns: repeat(5, minmax(190px, 1fr));
    overflow-x: auto;
    padding-bottom: 8px;
  }
  .stage-arrow { display: none; }
}

@media (max-width: 680px) {
  .funnel-strip { grid-template-columns: repeat(5, 178px); }
  .funnel-stage { min-height: 108px; padding: 13px; }
}
</style>

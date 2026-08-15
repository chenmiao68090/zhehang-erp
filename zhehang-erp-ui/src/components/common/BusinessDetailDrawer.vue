<template>
  <el-drawer
    v-model="visible"
    :size="size"
    :with-header="false"
    :destroy-on-close="destroyOnClose"
    class="business-detail-drawer"
  >
    <div class="bd-shell">
      <header class="bd-head">
        <div class="bd-avatar" :class="avatarClass">{{ avatar }}</div>
        <div class="bd-title">
          <span v-if="eyebrow" class="bd-eyebrow">{{ eyebrow }}</span>
          <h2>{{ title }}</h2>
          <p v-if="subtitle">{{ subtitle }}</p>
        </div>
        <div class="bd-head-actions">
          <el-tag v-if="statusText" :type="statusType" effect="plain">{{ statusText }}</el-tag>
          <slot name="actions" />
        </div>
      </header>

      <section v-if="$slots.meta" class="bd-card bd-meta">
        <slot name="meta" />
      </section>

      <section v-if="$slots.default" class="bd-card bd-content">
        <slot />
      </section>

      <section v-if="$slots.timeline" class="bd-card bd-timeline">
        <div class="bd-section-title">流转记录</div>
        <slot name="timeline" />
      </section>

      <footer v-if="$slots.footer" class="bd-footer">
        <slot name="footer" />
      </footer>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  subtitle?: string
  eyebrow?: string
  avatar?: string
  avatarClass?: string
  statusText?: string
  statusType?: 'success' | 'warning' | 'info' | 'danger' | 'primary'
  size?: string | number
  destroyOnClose?: boolean
}>(), {
  subtitle: '',
  eyebrow: '',
  avatar: '详',
  avatarClass: '',
  statusText: '',
  statusType: 'info',
  size: '560px',
  destroyOnClose: true
})

const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<style scoped lang="scss">
.business-detail-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
    background: var(--bg-page);
  }
}

:global(.business-detail-drawer.open) {
  transform: none !important;
}

.bd-shell {
  min-height: 100%;
  padding: 16px;
  background: var(--bg-page);
}

.bd-head,
.bd-card,
.bd-footer {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: #fff;
}

.bd-head {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
  padding: 16px;
}

.bd-avatar {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #e8f3ff;
  color: var(--brand-primary);
  font-size: 17px;
  font-weight: 800;
}

.bd-avatar.income,
.bd-avatar.success {
  background: #e8ffea;
  color: #00a024;
}

.bd-avatar.expense,
.bd-avatar.danger {
  background: #fff0f0;
  color: #f53f3f;
}

.bd-avatar.warning {
  background: #fff7e8;
  color: #ff7d00;
}

.bd-avatar.channel {
  background: #e8f7ff;
  color: #1682c7;
}

.bd-avatar.company {
  background: #eef2ff;
  color: #626aef;
}

.bd-title {
  min-width: 0;
}

.bd-eyebrow {
  display: inline-block;
  margin-bottom: 4px;
  color: var(--text-muted);
  font-size: 12px;
}

.bd-title h2 {
  overflow: hidden;
  margin: 0;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 26px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bd-title p {
  margin: 4px 0 0;
  color: var(--text-muted);
  font-size: 12px;
}

.bd-head-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.bd-card {
  margin-bottom: 12px;
  padding: 14px;
}

.bd-meta {
  :slotted(.bd-kv-grid) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  :slotted(.bd-kv) {
    min-width: 0;
    padding: 10px;
    border: 1px solid var(--border-soft);
    border-radius: 8px;
    background: #fbfcfd;
  }

  :slotted(.bd-kv.wide) {
    grid-column: 1 / -1;
  }

  :slotted(.bd-kv span) {
    display: block;
    margin-bottom: 5px;
    color: var(--text-muted);
    font-size: 12px;
  }

  :slotted(.bd-kv b) {
    overflow-wrap: anywhere;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 650;
  }
}

.bd-content {
  :slotted(.bd-section-title) {
    margin: 4px 0 10px;
    color: var(--text-primary);
    font-size: 14px;
    font-weight: 650;
  }
}

.bd-section-title {
  margin-bottom: 10px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 650;
}

.bd-timeline {
  :slotted(.bd-timeline-item) {
    display: grid;
    grid-template-columns: 12px minmax(0, 1fr);
    gap: 10px;
    align-items: flex-start;
    padding: 6px 0;
  }

  :slotted(.bd-timeline-dot) {
    width: 9px;
    height: 9px;
    margin-top: 5px;
    border-radius: 50%;
    background: #bedaff;
    box-shadow: 0 0 0 3px rgba(51, 112, 255, 0.08);
  }

  :slotted(.bd-timeline-dot.success) {
    background: #00b42a;
    box-shadow: 0 0 0 3px rgba(0, 180, 42, 0.12);
  }

  :slotted(.bd-timeline-item strong) {
    color: var(--text-primary);
    font-size: 13px;
  }

  :slotted(.bd-timeline-item p) {
    margin: 3px 0 0;
    color: var(--text-muted);
    font-size: 12px;
    line-height: 1.5;
  }
}

.bd-footer {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 14px;
}

@media (max-width: 720px) {
  .bd-head {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  .bd-head-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }

  .bd-meta :slotted(.bd-kv-grid) {
    grid-template-columns: 1fr;
  }
}
</style>

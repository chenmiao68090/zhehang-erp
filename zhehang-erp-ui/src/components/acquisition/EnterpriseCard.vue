<template>
  <div
    class="enterprise-card"
    :class="{ 'is-selected': selected, 'is-hot': enterprise.isHot, 'has-abnormal': abnormalList.length > 0 }"
  >
    <!-- 左侧复选框 -->
    <div class="ec-check" @click.stop>
      <el-checkbox
        :model-value="selected"
        @change="emit('select', enterprise.id)"
      />
    </div>

    <!-- 主内容区 -->
    <div class="ec-main">
      <!-- 上半部分：Logo + 信息 -->
      <div class="ec-body">
        <!-- Logo -->
        <div class="ec-logo" :style="{ background: logoBg }">
          {{ logoText }}
        </div>

        <!-- 内容列 -->
        <div class="ec-content">
          <!-- 第一行：公司名 + 标签 -->
          <div class="ec-title-row">
            <a class="ec-name" @click="emit('viewDetail', enterprise.id)">
              {{ enterprise.companyName }}
            </a>

            <span v-if="enterprise.isHot" class="tag-hot">
              <svg class="hot-flame" viewBox="0 0 24 24" width="12" height="12">
                <path
                  fill="currentColor"
                  d="M12 2c1 4 4 5 4 9a4 4 0 1 1-8 0c0-2 1-3 2-4-1 4 2 5 2 5s-1-3 0-5 2-3 0-5z"
                />
              </svg>
              HOT
            </span>

            <a
              v-if="enterprise.contactCount != null && enterprise.contactCount > 0"
              class="tag-contact"
              @click="emit('viewDetail', enterprise.id)"
            >
              联系方式 {{ enterprise.contactCount }}
              <el-icon class="arrow"><ArrowRight /></el-icon>
            </a>

            <span v-if="enterprise.employeeScale" class="tag-scale">
              {{ enterprise.employeeScale }}
            </span>

            <span class="tag-status" :class="`status-${statusType}`">
              {{ enterprise.operatingStatus || '营业' }}
            </span>

            <span v-if="abnormalCount > 0" class="tag-abnormal">
              当前待处理异常 {{ abnormalCount }}
            </span>
          </div>

          <!-- 信息行 1：成立时间 / 年营业额 / 注册资本 -->
          <div class="ec-info-row">
            <span class="info-cell">
              <span class="info-label">成立时间:</span>
              <span class="info-value">{{ enterprise.establishDate || '—' }}</span>
            </span>
            <span class="info-cell">
              <span class="info-label">年营业额:</span>
              <span class="info-value">{{ enterprise.annualRevenue || '—' }}</span>
            </span>
            <span class="info-cell">
              <span class="info-label">注册资本:</span>
              <span class="info-value">{{ enterprise.registeredCapital || '—' }}</span>
            </span>
          </div>

          <!-- 信息行 2：所属行业 / 税务资质 -->
          <div class="ec-info-row">
            <span class="info-cell">
              <span class="info-label">所属行业:</span>
              <span class="info-value">{{ enterprise.industry || '—' }}</span>
            </span>
            <span v-if="enterprise.taxQualification" class="info-cell">
              <span class="info-label">税务资质:</span>
              <span class="info-value">{{ enterprise.taxQualification }}</span>
            </span>
          </div>

          <!-- 信息行 3：注册地址 -->
          <div class="ec-info-row">
            <span class="info-cell info-cell--full">
              <span class="info-label">注册地址:</span>
              <span class="info-value">{{ enterprise.address || '—' }}</span>
            </span>
          </div>

          <!-- 异常详情区 -->
          <div v-if="abnormalList.length > 0" class="ec-abnormal-section">
            <div
              v-for="(ab, idx) in abnormalList"
              :key="idx"
              class="abnormal-item"
              :class="{ 'has-divider': idx > 0 }"
            >
              <div v-if="ab.reason" class="abnormal-line">
                <span class="abnormal-label">列入原因:</span>
                <span class="abnormal-value">{{ ab.reason }}</span>
              </div>
              <div class="abnormal-line">
                <span v-if="ab.date" class="abnormal-cell">
                  <span class="abnormal-label">列入日期:</span>
                  <span class="abnormal-value">{{ ab.date }}</span>
                </span>
                <span v-if="ab.authority" class="abnormal-cell">
                  <span class="abnormal-label">决定机关:</span>
                  <span class="abnormal-value">{{ ab.authority }}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧：立即解锁按钮 -->
    <div class="ec-action">
      <el-button
        v-if="!enterprise.isUnlocked"
        class="unlock-btn"
        @click="emit('unlock', enterprise.id)"
      >
        立即解锁
      </el-button>
      <el-button
        v-else
        class="unlock-btn unlock-btn--unlocked"
        @click="emit('viewDetail', enterprise.id)"
      >
        查看详情
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

interface AbnormalItem {
  reason?: string
  date?: string
  authority?: string
  type?: string
}

interface EnterpriseInfo {
  id: number | string
  companyName: string
  creditCode?: string
  contactCount?: number
  employeeScale?: string
  operatingStatus?: string
  establishDate?: string
  annualRevenue?: string
  registeredCapital?: string
  industry?: string
  taxQualification?: string
  address?: string
  abnormals?: AbnormalItem[]
  isHot?: boolean
  isUnlocked?: boolean
}

interface Props {
  enterprise: EnterpriseInfo
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false
})

const emit = defineEmits<{
  (e: 'select', id: number | string): void
  (e: 'unlock', id: number | string): void
  (e: 'viewDetail', id: number | string): void
}>()

// Logo 文字：取公司名前 2 个字
const logoText = computed(() => {
  const name = props.enterprise.companyName || ''
  // 去掉前缀（如"杭州""浙江"等地名）后取前2字过于复杂，这里直接取前2个有意义字符
  const cleaned = name.replace(/[\s（）()]/g, '')
  return cleaned.slice(0, 2) || '企'
})

// Logo 背景色：基于公司名哈希
const logoBg = computed(() => {
  const palette = [
    '#5B8DEF', // 蓝
    '#67C23A', // 绿
    '#E6A23C', // 橙
    '#9B6DFF', // 紫
    '#F56C6C', // 红
    '#00B8D9'  // 青
  ]
  const name = props.enterprise.companyName || ''
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  }
  return palette[hash % palette.length]
})

// 营业状态类型
const statusType = computed(() => {
  const s = props.enterprise.operatingStatus || ''
  if (s.includes('注销') || s.includes('吊销') || s.includes('清算')) return 'danger'
  if (s.includes('迁出') || s.includes('停业')) return 'warning'
  return 'success'
})

// 异常列表
const abnormalList = computed<AbnormalItem[]>(() => {
  return props.enterprise.abnormals || []
})

const abnormalCount = computed(() => abnormalList.value.length)
</script>

<style scoped lang="scss">
.enterprise-card {
  position: relative;
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 6px;
  padding: 18px 20px;
  gap: 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;

  & + & {
    margin-top: 10px;
  }

  &:hover {
    border-color: #c6dcff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.08);
  }

  &.is-selected {
    background: #f4f9ff;
    border-color: #409eff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.14);
  }

  &.is-hot {
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 140px;
      width: 90px;
      height: 90px;
      background: radial-gradient(
        circle at top right,
        rgba(245, 108, 108, 0.06),
        transparent 70%
      );
      pointer-events: none;
      border-top-right-radius: 6px;
    }
  }
}

/* ============ 左侧 Checkbox ============ */
.ec-check {
  display: flex;
  align-items: flex-start;
  padding-top: 2px;
  flex-shrink: 0;
}

/* ============ 主内容区 ============ */
.ec-main {
  flex: 1;
  min-width: 0;
}

.ec-body {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

/* Logo 56x56 圆角方块 */
.ec-logo {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  flex-shrink: 0;
  user-select: none;
  text-align: center;
  line-height: 1.15;
  word-break: break-all;
  padding: 4px;
  box-sizing: border-box;
}

.ec-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

/* ============ 第一行：公司名 + 标签 ============ */
.ec-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.ec-name {
  font-size: 16px;
  font-weight: 600;
  color: #1890ff;
  cursor: pointer;
  letter-spacing: 0.2px;
  line-height: 1.4;

  &:hover {
    color: #40a9ff;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}

/* HOT 标签 */
.tag-hot {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  height: 20px;
  padding: 0 6px;
  background: #fff1f0;
  color: #f56c6c;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  border-radius: 3px;
  border: 1px solid #ffd6d6;

  .hot-flame {
    color: #f56c6c;
  }
}

/* 联系方式标签（可点击）*/
.tag-contact {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  color: #1890ff;
  cursor: pointer;
  height: 20px;
  line-height: 20px;

  .arrow {
    font-size: 10px;
  }

  &:hover {
    color: #40a9ff;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
}

/* 人员规模 — 灰色边框 tag */
.tag-scale {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  font-size: 12px;
  color: #606266;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 3px;
}

/* 营业状态 */
.tag-status {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  font-size: 12px;
  border-radius: 3px;
  font-weight: 500;

  &.status-success {
    background: #f0f9eb;
    color: #67c23a;
    border: 1px solid #e1f3d8;
  }

  &.status-warning {
    background: #fdf6ec;
    color: #e6a23c;
    border: 1px solid #faecd8;
  }

  &.status-danger {
    background: #fef0f0;
    color: #f56c6c;
    border: 1px solid #fde2e2;
  }
}

/* 异常提示 */
.tag-abnormal {
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  font-size: 12px;
  color: #e6a23c;
  background: #fdf6ec;
  border: 1px solid #faecd8;
  border-radius: 3px;
  font-weight: 500;
}

/* ============ 信息行 ============ */
.ec-info-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 32px;
  font-size: 13px;
  line-height: 1.7;
}

.info-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  min-width: 0;

  &--full {
    flex: 1 1 100%;
  }
}

.info-label {
  color: #999999;
  flex-shrink: 0;
  font-size: 13px;
}

.info-value {
  color: #333333;
  font-size: 13px;
  word-break: break-all;
}

/* ============ 异常详情区 ============ */
.ec-abnormal-section {
  margin-top: 8px;
  padding-top: 10px;
  border-top: 1px solid #eeeeee;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.abnormal-item {
  display: flex;
  flex-direction: column;
  gap: 4px;

  &.has-divider {
    padding-top: 8px;
    border-top: 1px dashed #f0f0f0;
  }
}

.abnormal-line {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 32px;
  font-size: 13px;
  line-height: 1.7;
}

.abnormal-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}

.abnormal-label {
  color: #999999;
  flex-shrink: 0;
  font-weight: 600;
  font-size: 13px;
}

.abnormal-value {
  color: #333333;
  font-size: 13px;
  word-break: break-all;
}

/* ============ 右侧解锁按钮 ============ */
.ec-action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  flex-shrink: 0;
}

.unlock-btn {
  width: 100px;
  height: 36px;
  background: #ffffff;
  border: 1px solid #409eff;
  color: #409eff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  letter-spacing: 1px;
  transition: all 0.18s ease;

  &:hover,
  &:focus {
    background: #409eff;
    border-color: #409eff;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.25);
  }

  &--unlocked {
    border-color: #dcdfe6;
    color: #606266;

    &:hover,
    &:focus {
      background: #f0f7ff;
      border-color: #409eff;
      color: #409eff;
      box-shadow: none;
    }
  }
}

/* ============ 响应式 ============ */
@media (max-width: 1280px) {
  .ec-info-row {
    gap: 4px 20px;
  }
}

@media (max-width: 992px) {
  .enterprise-card {
    flex-wrap: wrap;
  }
  .ec-action {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
}
</style>

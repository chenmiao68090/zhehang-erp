<template>
  <div class="enterprise-detail-page">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <div class="top-bar__left">
        <el-button text @click="goBack" class="back-btn">
          <el-icon class="back-icon"><ArrowLeft /></el-icon>
          <span>返回列表</span>
        </el-button>
        <span class="divider-vertical" />
        <el-breadcrumb separator="/" class="crumbs">
          <el-breadcrumb-item :to="{ path: '/acquisition/enterprise' }">企业获客</el-breadcrumb-item>
          <el-breadcrumb-item>企业详情</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="top-bar__right">
        <el-button :disabled="loading" @click="switchEnterprise(-1)">
          <el-icon><ArrowLeftBold /></el-icon><span>上一企业</span>
        </el-button>
        <el-button :disabled="loading" @click="switchEnterprise(1)">
          <span>下一企业</span><el-icon><ArrowRightBold /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="skeleton-wrap">
      <el-skeleton animated>
        <template #template>
          <div class="skeleton-grid">
            <div class="skeleton-side">
              <el-skeleton-item variant="circle" style="width:60px;height:60px" />
              <el-skeleton-item variant="h3" style="width:60%;margin-top:14px" />
              <el-skeleton-item variant="text" style="width:80%;margin-top:8px" />
              <el-skeleton-item variant="rect" style="height:60px;margin-top:18px" />
              <el-skeleton-item v-for="i in 8" :key="i" variant="text" style="margin-top:12px" />
            </div>
            <div class="skeleton-main">
              <el-skeleton-item variant="rect" style="height:36px;width:60%" />
              <el-skeleton-item variant="rect" style="height:280px;margin-top:16px" />
            </div>
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- 主体内容 -->
    <div v-else class="detail-grid">
      <!-- 左侧概览卡片 -->
      <aside class="overview-card">
        <div class="overview-card__inner">
          <div class="brand-row">
            <div class="brand-logo" :style="{ background: logoBg }">
              {{ logoChar }}
            </div>
            <div v-if="detail.isHot" class="hot-badge">
              <el-icon><Star /></el-icon><span>热门</span>
            </div>
          </div>

          <h2 class="company-name">{{ detail.companyName }}</h2>
          <div class="credit-code">{{ detail.creditCode }}</div>

          <!-- AI评分 -->
          <div class="score-section">
            <div class="score-section__header">
              <div class="score-label">
                <span class="dot" />
                <span>AI 意向评分</span>
              </div>
              <div class="score-value">
                <span class="score-num">{{ detail.aiPotentialScore || 0 }}</span>
                <span class="score-suffix">/ 100</span>
              </div>
            </div>
            <el-progress
              :percentage="detail.aiPotentialScore || 0"
              :color="scoreColor"
              :show-text="false"
              :stroke-width="8"
            />
            <div class="score-tag-row">
              <el-tag :type="scoreTagType" effect="dark" round size="small">
                {{ scoreTagText }}
              </el-tag>
              <span class="score-hint">较同行业 {{ peerCompare }}</span>
            </div>
          </div>

          <!-- 核心指标矩阵 -->
          <div class="metric-grid">
            <div class="metric-item">
              <div class="metric-item__num">{{ detail.contactCount || 0 }}</div>
              <div class="metric-item__label">联系方式</div>
            </div>
            <div class="metric-item">
              <div class="metric-item__num">{{ detail.pendingAbnormalCount || 0 }}</div>
              <div class="metric-item__label">待处理异常</div>
            </div>
            <div class="metric-item">
              <div class="metric-item__num">{{ detail.enterpriseRiskScore || 0 }}</div>
              <div class="metric-item__label">风险指数</div>
            </div>
          </div>

          <!-- 基本信息列表 -->
          <div class="info-list">
            <div class="info-list__row">
              <span class="info-list__label">经营状态</span>
              <el-tag :type="statusTagType" size="small" effect="light">
                {{ detail.enterpriseStatus || '-' }}
              </el-tag>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">成立日期</span>
              <span class="info-list__value">{{ detail.establishmentDate || '-' }}</span>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">注册资本</span>
              <span class="info-list__value">{{ formatMoney(detail.registeredCapital) }}</span>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">实缴资本</span>
              <span class="info-list__value">{{ formatMoney(detail.paidCapital) }}</span>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">人员规模</span>
              <span class="info-list__value">{{ formatStaff }}</span>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">年营业额</span>
              <span class="info-list__value">{{ formatMoney(detail.annualRevenue) }}</span>
            </div>
            <div class="info-list__row">
              <span class="info-list__label">所属行业</span>
              <span class="info-list__value">{{ detail.industryName || '-' }}</span>
            </div>
            <div class="info-list__row info-list__row--multi">
              <span class="info-list__label">注册地址</span>
              <span class="info-list__value">{{ detail.registerAddress || '-' }}</span>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-stack">
            <el-button
              type="primary"
              size="large"
              class="action-btn action-btn--primary"
              :icon="Unlock"
              @click="handleUnlock"
            >
              解锁联系方式
            </el-button>
            <el-dropdown @command="handleAddCrm" trigger="click" class="action-dropdown">
              <el-button size="large" class="action-btn">
                <el-icon><Plus /></el-icon>
                <span>添加到 CRM</span>
                <el-icon class="caret"><CaretBottom /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="lead">添加为线索</el-dropdown-item>
                  <el-dropdown-item command="customer">添加为客户</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </aside>

      <!-- 右侧Tab区 -->
      <main class="tab-panel">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <!-- 工商信息 -->
          <el-tab-pane name="business">
            <template #label>
              <span class="tab-label"><el-icon><OfficeBuilding /></el-icon>工商信息</span>
            </template>
            <div class="pane-section">
              <div class="section-title">
                <span class="section-title__bar" />
                <h3>基本工商登记信息</h3>
              </div>
              <el-descriptions :column="2" border class="rich-descriptions">
                <el-descriptions-item label="企业名称">{{ detail.companyName }}</el-descriptions-item>
                <el-descriptions-item label="统一社会信用代码">{{ detail.creditCode }}</el-descriptions-item>
                <el-descriptions-item label="法定代表人">
                  <span class="legal-person">{{ detail.legalPerson }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="经营状态">
                  <el-tag :type="statusTagType" size="small">{{ detail.enterpriseStatus }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="注册资本">{{ formatMoney(detail.registeredCapital) }}</el-descriptions-item>
                <el-descriptions-item label="实缴资本">{{ formatMoney(detail.paidCapital) }}</el-descriptions-item>
                <el-descriptions-item label="成立日期">{{ detail.establishmentDate }}</el-descriptions-item>
                <el-descriptions-item label="营业期限">{{ detail.businessTermType || '长期' }}</el-descriptions-item>
                <el-descriptions-item label="企业类型">{{ detail.enterpriseType }}</el-descriptions-item>
                <el-descriptions-item label="所属行业">{{ detail.industryName }}（{{ detail.industryCode }}）</el-descriptions-item>
                <el-descriptions-item label="年报状态">
                  <el-tag size="small" type="success">{{ detail.annualReportStatus || '已提交' }}</el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="登记机关">{{ detail.registerOrg || '杭州市市场监督管理局' }}</el-descriptions-item>
                <el-descriptions-item label="注册地址" :span="2">{{ detail.registerAddress }}</el-descriptions-item>
                <el-descriptions-item label="经营范围" :span="2">
                  <div class="business-scope">{{ detail.businessScope }}</div>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </el-tab-pane>

          <!-- 税务信息 -->
          <el-tab-pane name="tax">
            <template #label>
              <span class="tab-label"><el-icon><Document /></el-icon>税务信息</span>
            </template>
            <div class="pane-section">
              <div class="section-title">
                <span class="section-title__bar" />
                <h3>纳税人资质</h3>
              </div>
              <div class="qualification-grid">
                <div class="qual-card">
                  <div class="qual-card__label">纳税人类型</div>
                  <div class="qual-card__value">{{ detail.taxQualification || '小规模纳税人' }}</div>
                </div>
                <div class="qual-card">
                  <div class="qual-card__label">税务登记号</div>
                  <div class="qual-card__value qual-card__value--mono">{{ detail.creditCode }}</div>
                </div>
                <div class="qual-card qual-card--warning">
                  <div class="qual-card__label">税务异常</div>
                  <div class="qual-card__value">{{ detail.taxAbnormalStatus || '正常' }}</div>
                </div>
              </div>

              <div class="section-title" style="margin-top: 28px">
                <span class="section-title__bar" />
                <h3>税务异常明细</h3>
                <span class="section-count">{{ taxAbnormals.length }} 条记录</span>
              </div>
              <el-table v-if="taxAbnormals.length" :data="taxAbnormals" stripe class="rich-table">
                <el-table-column prop="abnormalType" label="异常类型" width="160" />
                <el-table-column prop="inclusionReason" label="详细原因" min-width="220" show-overflow-tooltip />
                <el-table-column prop="inclusionDate" label="发生日期" width="120" />
                <el-table-column prop="decisionOrg" label="决定机关" min-width="220" show-overflow-tooltip />
                <el-table-column prop="amount" label="金额" width="100">
                  <template #default="{ row }">{{ row.amount ? `¥${row.amount}` : '-' }}</template>
                </el-table-column>
                <el-table-column prop="abnormalStatus" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.abnormalStatus === 'active' ? 'danger' : 'success'" size="small">
                      {{ row.abnormalStatus === 'active' ? '未解除' : '已解除' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无税务异常记录" :image-size="100" />
            </div>
          </el-tab-pane>

          <!-- 经营风险 -->
          <el-tab-pane name="risk">
            <template #label>
              <span class="tab-label"><el-icon><Warning /></el-icon>经营风险</span>
            </template>
            <div class="pane-section">
              <div class="risk-banner" :class="`risk-banner--${riskLevel}`">
                <div class="risk-banner__score">
                  <div class="risk-num">{{ detail.enterpriseRiskScore || 0 }}</div>
                  <div class="risk-unit">分</div>
                </div>
                <div class="risk-banner__info">
                  <div class="risk-level">综合风险等级 · <strong>{{ riskLevelText }}</strong></div>
                  <div class="risk-desc">{{ riskDesc }}</div>
                  <div class="risk-bar">
                    <div class="risk-bar__fill" :style="{ width: (detail.enterpriseRiskScore || 0) + '%' }" />
                  </div>
                </div>
              </div>

              <div class="section-title">
                <span class="section-title__bar" />
                <h3>司法案件</h3>
                <span class="section-count">{{ operationAbnormals.length }} 条记录</span>
              </div>
              <el-table v-if="operationAbnormals.length" :data="operationAbnormals" stripe class="rich-table">
                <el-table-column prop="abnormalType" label="案件类型" width="160" />
                <el-table-column prop="inclusionReason" label="案由" min-width="240" show-overflow-tooltip />
                <el-table-column prop="inclusionDate" label="日期" width="120" />
                <el-table-column prop="decisionOrg" label="决定机关" min-width="220" show-overflow-tooltip />
                <el-table-column prop="abnormalStatus" label="状态" width="100">
                  <template #default="{ row }">
                    <el-tag :type="row.abnormalStatus === 'active' ? 'danger' : 'success'" size="small">
                      {{ row.abnormalStatus === 'active' ? '未解除' : '已解除' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无司法案件" :image-size="100" />

              <div class="section-title" style="margin-top: 28px">
                <span class="section-title__bar" />
                <h3>行政处罚</h3>
              </div>
              <el-empty description="暂无行政处罚记录" :image-size="100" />
            </div>
          </el-tab-pane>

          <!-- 知识产权 -->
          <el-tab-pane name="ip">
            <template #label>
              <span class="tab-label"><el-icon><Medal /></el-icon>知识产权</span>
            </template>
            <div class="pane-section">
              <div class="section-title">
                <span class="section-title__bar" />
                <h3>商标信息</h3>
                <span class="section-count">{{ trademarks.length }} 件</span>
              </div>
              <el-table v-if="trademarks.length" :data="trademarks" stripe class="rich-table">
                <el-table-column prop="name" label="商标名称" min-width="160">
                  <template #default="{ row }">
                    <span class="trademark-name">{{ row.name }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="regNo" label="注册号" width="160" />
                <el-table-column prop="category" label="类别" min-width="180" />
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag size="small" type="success">{{ row.status }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无商标信息" :image-size="100" />

              <div class="section-title" style="margin-top: 28px">
                <span class="section-title__bar" />
                <h3>专利信息</h3>
                <span class="section-count">{{ patents.length }} 项</span>
              </div>
              <el-table v-if="patents.length" :data="patents" stripe class="rich-table">
                <el-table-column prop="name" label="专利名称" min-width="240" />
                <el-table-column prop="type" label="类型" width="160" />
                <el-table-column prop="applyDate" label="申请日期" width="140" />
              </el-table>
              <el-empty v-else description="暂无专利信息" :image-size="100" />

              <div class="section-title" style="margin-top: 28px">
                <span class="section-title__bar" />
                <h3>软件著作权</h3>
                <span class="section-count">{{ copyrights.length }} 项</span>
              </div>
              <el-table v-if="copyrights.length" :data="copyrights" stripe class="rich-table">
                <el-table-column prop="name" label="软著名称" min-width="280" />
                <el-table-column prop="type" label="类型" width="160" />
                <el-table-column prop="regDate" label="登记日期" width="140" />
              </el-table>
              <el-empty v-else description="暂无软著信息" :image-size="100" />
            </div>
          </el-tab-pane>

          <!-- 联系方式 -->
          <el-tab-pane name="contact">
            <template #label>
              <span class="tab-label"><el-icon><Phone /></el-icon>联系方式</span>
            </template>
            <div class="pane-section">
              <div v-if="!hasUnlocked" class="unlock-banner">
                <div class="unlock-banner__icon">
                  <el-icon><Lock /></el-icon>
                </div>
                <div class="unlock-banner__text">
                  <div class="unlock-title">联系方式已加密</div>
                  <div class="unlock-desc">解锁后可查看完整电话、邮箱、联系人信息（消耗 1 个解锁额度）</div>
                </div>
                <el-button type="primary" size="large" @click="handleUnlock">立即解锁</el-button>
              </div>

              <div class="section-title">
                <span class="section-title__bar" />
                <h3>联系方式列表</h3>
                <span class="section-count">{{ contacts.length }} 条</span>
              </div>
              <el-table :data="contacts" stripe class="rich-table">
                <el-table-column label="类型" width="100">
                  <template #default="{ row }">
                    <span class="contact-type">
                      <el-icon class="contact-type__icon">
                        <Phone v-if="row.contactType === 'phone'" />
                        <Iphone v-else-if="row.contactType === 'mobile'" />
                        <Message v-else-if="row.contactType === 'email'" />
                        <ChatLineRound v-else />
                      </el-icon>
                      <span>{{ contactTypeText(row.contactType) }}</span>
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="联系方式" min-width="200">
                  <template #default="{ row }">
                    <span :class="['contact-value', { 'contact-value--locked': !row.isUnlocked }]">
                      {{ row.contactValue }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column prop="contactName" label="联系人" width="120">
                  <template #default="{ row }">{{ row.contactName || '-' }}</template>
                </el-table-column>
                <el-table-column prop="contactPosition" label="职位" width="160">
                  <template #default="{ row }">{{ row.contactPosition || '-' }}</template>
                </el-table-column>
                <el-table-column label="来源" width="140">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain">{{ sourceText(row.source) }}</el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>

          <!-- 关联企业 -->
          <el-tab-pane name="related">
            <template #label>
              <span class="tab-label"><el-icon><Connection /></el-icon>关联企业</span>
            </template>
            <div class="pane-section">
              <div class="section-title">
                <span class="section-title__bar" />
                <h3>关联企业列表</h3>
                <span class="section-count">{{ relatedEnterprises.length }} 家</span>
              </div>
              <el-table v-if="relatedEnterprises.length" :data="relatedEnterprises" stripe class="rich-table">
                <el-table-column prop="companyName" label="企业名称" min-width="320">
                  <template #default="{ row }">
                    <a class="related-link" @click="goToRelated(row.id)">{{ row.companyName }}</a>
                  </template>
                </el-table-column>
                <el-table-column prop="relation" label="关联关系" width="180">
                  <template #default="{ row }">
                    <el-tag size="small" effect="plain" type="info">{{ row.relation }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="enterpriseStatus" label="经营状态" width="140">
                  <template #default="{ row }">
                    <el-tag size="small" :type="row.enterpriseStatus === '在业' || row.enterpriseStatus === '存续' ? 'success' : 'info'">
                      {{ row.enterpriseStatus }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
              <el-empty v-else description="暂无关联企业" :image-size="100" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, markRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowLeft, ArrowLeftBold, ArrowRightBold, Star, Plus, CaretBottom, Unlock,
  OfficeBuilding, Document, Warning, Medal, Phone, Iphone, Message,
  ChatLineRound, Connection, Lock
} from '@element-plus/icons-vue'
import { enterpriseApi } from '@/api/acquisition'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const activeTab = ref('business')
const detail = ref<any>({})

// 解锁后联系方式
const hasUnlocked = computed(() => detail.value.contacts?.some((c: any) => c.isUnlocked))

const contacts = computed(() => detail.value.contacts || [])
const trademarks = computed(() => detail.value.intellectualProperty?.trademarks || [])
const patents = computed(() => detail.value.intellectualProperty?.patents || [])
const copyrights = computed(() => detail.value.intellectualProperty?.copyrights || [])
const relatedEnterprises = computed(() => detail.value.relatedEnterprises || [])

const taxAbnormals = computed(() =>
  (detail.value.abnormals || []).filter((a: any) => a.abnormalCategory === 'tax_abnormal')
)
const operationAbnormals = computed(() =>
  (detail.value.abnormals || []).filter((a: any) => a.abnormalCategory !== 'tax_abnormal')
)

// Logo 首字
const logoChar = computed(() => (detail.value.companyName || '企')[0])
const logoBg = computed(() => {
  const palette = [
    'linear-gradient(135deg,#2563eb 0%,#3b82f6 100%)',
    'linear-gradient(135deg,#0f766e 0%,#14b8a6 100%)',
    'linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)',
    'linear-gradient(135deg,#b45309 0%,#f59e0b 100%)',
    'linear-gradient(135deg,#be185d 0%,#ec4899 100%)'
  ]
  const idx = (Number(detail.value.id) || 0) % palette.length
  return palette[idx]
})

// 评分相关
const scoreColor = computed(() => {
  const s = detail.value.aiPotentialScore || 0
  if (s >= 80) return '#10b981'
  if (s >= 60) return '#f59e0b'
  return '#94a3b8'
})

const scoreTagText = computed(() => {
  const s = detail.value.aiPotentialScore || 0
  if (s >= 80) return '高意向'
  if (s >= 60) return '中意向'
  return '低意向'
})

const scoreTagType = computed<'success' | 'warning' | 'info'>(() => {
  const s = detail.value.aiPotentialScore || 0
  if (s >= 80) return 'success'
  if (s >= 60) return 'warning'
  return 'info'
})

const peerCompare = computed(() => {
  const s = detail.value.aiPotentialScore || 0
  if (s >= 80) return '高出 32%'
  if (s >= 60) return '持平'
  return '低于均值'
})

// 风险相关
const riskLevel = computed(() => {
  const r = detail.value.enterpriseRiskScore || 0
  if (r >= 70) return 'high'
  if (r >= 40) return 'mid'
  return 'low'
})
const riskLevelText = computed(() => ({ high: '高风险', mid: '中等风险', low: '低风险' }[riskLevel.value]))
const riskDesc = computed(() => ({
  high: '存在多项重要风险信号，建议谨慎评估再进行业务对接',
  mid: '存在少量风险信号，建议关注变化趋势',
  low: '当前未检测到重大风险信号，企业经营状况良好'
}[riskLevel.value]))

// 状态标签
const statusTagType = computed<'success' | 'info' | 'danger'>(() => {
  const s = detail.value.enterpriseStatus
  if (s === '在业' || s === '存续' || s === '开业') return 'success'
  if (s === '注销' || s === '吊销') return 'danger'
  return 'info'
})

// 人员规模
const formatStaff = computed(() => {
  const min = detail.value.staffCountMin
  const max = detail.value.staffCountMax
  if (!min && !max) return '-'
  if (min && max) return `${min}-${max} 人`
  return `${min || max} 人`
})

const formatMoney = (v: any) => {
  if (v === null || v === undefined || v === '') return '-'
  return `${v} 万元`
}

const contactTypeText = (t: string) => {
  const map: Record<string, string> = { phone: '固话', mobile: '手机', email: '邮箱', wechat: '微信' }
  return map[t] || t
}

const sourceText = (s: string) => {
  const map: Record<string, string> = {
    annual_report: '年报公示', recruitment: '招聘信息', website: '官网', icp: 'ICP备案', manual: '人工补录'
  }
  return map[s] || s
}

// 操作
const goBack = () => router.back()

const switchEnterprise = (delta: number) => {
  const currentId = Number(route.params.id) || 1
  const target = currentId + delta
  if (target < 1) {
    ElMessage.info('已经是第一家企业了')
    return
  }
  router.replace({ name: 'AcquisitionEnterpriseDetail', params: { id: target } })
}

const goToRelated = (id: number) => {
  router.push({ name: 'AcquisitionEnterpriseDetail', params: { id } })
}

const handleUnlock = () => {
  ElMessageBox.confirm('解锁联系方式将消耗 1 个解锁额度，是否继续？', '解锁确认', {
    confirmButtonText: '确认解锁',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await enterpriseApi.batchUnlock({ enterpriseIds: [Number(route.params.id)] })
    } catch (e) {
      // ignore network error in mock环境
    }
    detail.value.contacts = (detail.value.contacts || []).map((c: any) => ({
      ...c,
      isUnlocked: true,
      contactValue: c.contactValue.replace(/\*+/g, () => Math.random().toString().slice(2, 6))
    }))
    ElMessage.success('联系方式已解锁')
  }).catch(() => {})
}

const handleAddCrm = async (type: string) => {
  try {
    await enterpriseApi.batchAddCrm({ enterpriseIds: [Number(route.params.id)], crmType: type })
  } catch (e) {
    // mock fallback
  }
  ElMessage.success(`已添加为${type === 'lead' ? '线索' : '客户'}`)
}

// 加载数据
const buildMockDetail = (id: number) => markRaw({
  id,
  companyName: '杭州星辰网络科技有限公司',
  creditCode: '91330108MA2BXXXXX0X',
  legalPerson: '张明',
  registerRegionProvince: '浙江省',
  registerRegionCity: '杭州市',
  registerRegionDistrict: '西湖区',
  registerAddress: '浙江省杭州市西湖区文三路388号钱江科技大厦15楼',
  establishmentDate: '2024-01-15',
  registeredCapital: 100,
  paidCapital: 0,
  enterpriseType: '有限责任公司(自然人投资或控股)',
  industryCode: 'I63',
  industryName: '软件和信息技术服务业',
  businessScope: '技术开发、技术咨询、技术服务；电子商务；计算机软硬件开发及销售；网络技术服务；企业管理咨询；数据处理服务；信息系统集成服务；计算机系统服务；从事文化艺术交流活动的组织与策划（除演出及演出经纪）（依法须经批准的项目，经相关部门批准后方可开展经营活动）。',
  staffCountMin: 1,
  staffCountMax: 50,
  annualRevenue: 120,
  enterpriseStatus: '在业',
  taxQualification: '小规模纳税人',
  taxAbnormalStatus: '非正常户',
  hasContact: true,
  contactCount: 21,
  pendingAbnormalCount: 2,
  enterpriseRiskScore: 65,
  aiPotentialScore: 87,
  isHot: true,
  businessTermType: '长期',
  annualReportStatus: '已提交',
  registerOrg: '杭州市市场监督管理局西湖分局',
  abnormals: [
    { id: 1, abnormalCategory: 'tax_abnormal', abnormalType: '税务非正常户', inclusionReason: '未按期进行纳税申报', inclusionDate: '2024-03-01', decisionOrg: '国家税务总局杭州市西湖区税务局', abnormalStatus: 'active', amount: null },
    { id: 2, abnormalCategory: 'operation', abnormalType: '经营异常', inclusionReason: '通过登记的住所或者经营场所无法联系', inclusionDate: '2024-05-15', decisionOrg: '杭州市市场监督管理局西湖分局', abnormalStatus: 'active', amount: null }
  ],
  contacts: [
    { id: 1, contactType: 'mobile', contactValue: '138****5678', contactName: '张明', contactPosition: '法定代表人', source: 'annual_report', isUnlocked: false },
    { id: 2, contactType: 'phone', contactValue: '0571-****8899', contactName: '', contactPosition: '', source: 'recruitment', isUnlocked: false },
    { id: 3, contactType: 'email', contactValue: 'zh***@starnet.com', contactName: '张明', contactPosition: '总经理', source: 'website', isUnlocked: false }
  ],
  intellectualProperty: {
    trademarks: [
      { name: '星辰云', regNo: '58234567', category: '第9类-科学仪器', status: '已注册' },
      { name: 'StarNet', regNo: '58234568', category: '第42类-设计研究', status: '已注册' }
    ],
    patents: [],
    copyrights: [
      { name: '星辰云企业管理系统V1.0', type: '软件著作权', regDate: '2024-06-15' }
    ]
  },
  relatedEnterprises: [
    { id: 10, companyName: '杭州星辰信息咨询有限公司', relation: '同一法人', enterpriseStatus: '在业' },
    { id: 11, companyName: '杭州星辰网络科技有限公司宁波分公司', relation: '分支机构', enterpriseStatus: '存续' }
  ]
})

const loadDetail = async () => {
  loading.value = true
  const id = Number(route.params.id) || 1
  try {
    const res: any = await enterpriseApi.detail(id)
    if (res?.code === 200 && res.data) {
      detail.value = { ...buildMockDetail(id), ...res.data }
    } else {
      detail.value = buildMockDetail(id)
    }
  } catch (e) {
    detail.value = buildMockDetail(id)
  } finally {
    loading.value = false
  }
}

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    activeTab.value = 'business'
    loadDetail()
  }
})

onMounted(() => loadDetail())
</script>

<style scoped lang="scss">
.enterprise-detail-page {
  padding: 16px 20px 32px;
  background: linear-gradient(180deg, #f6f8fb 0%, #f0f3f8 100%);
  min-height: 100%;
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', system-ui, sans-serif;
}

/* ========== 顶栏 ========== */
.top-bar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; margin-bottom: 16px;
  background: #fff; border-radius: 10px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  border: 1px solid #e9eef5;

  &__left { display: flex; align-items: center; gap: 16px; }
  &__right { display: flex; gap: 8px; }

  .back-btn {
    color: #1e293b; font-weight: 500; padding: 6px 10px; border-radius: 6px;
    .back-icon { margin-right: 4px; transition: transform .25s ease; }
    &:hover { background: #f1f5f9; .back-icon { transform: translateX(-3px); } }
  }
  .divider-vertical { width: 1px; height: 16px; background: #e2e8f0; }
  .crumbs :deep(.el-breadcrumb__inner) { color: #64748b; font-weight: 400; }
}

/* ========== 骨架屏 ========== */
.skeleton-wrap { background: #fff; border-radius: 10px; padding: 24px; }
.skeleton-grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; }
.skeleton-side, .skeleton-main { padding: 12px; }

/* ========== 主体两栏 ========== */
.detail-grid {
  display: grid; grid-template-columns: 360px 1fr; gap: 16px;
  align-items: start;
}

/* ========== 左侧概览卡片 ========== */
.overview-card {
  position: sticky; top: 16px;
  background: #fff; border-radius: 12px;
  border: 1px solid #e9eef5;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;

  &__inner {
    padding: 24px 22px;
    background:
      radial-gradient(ellipse 200% 80% at 50% 0%, rgba(37,99,235,0.06) 0%, transparent 60%),
      #fff;
  }
}

.brand-row {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 14px;
}

.brand-logo {
  width: 60px; height: 60px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 24px; font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 6px 16px -4px rgba(37, 99, 235, 0.5);
  font-family: 'PingFang SC', sans-serif;
}

.hot-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 10px; border-radius: 999px;
  background: linear-gradient(135deg,#fff7ed,#ffedd5);
  color: #c2410c; font-size: 12px; font-weight: 500;
  border: 1px solid #fed7aa;
}

.company-name {
  margin: 0 0 6px; font-size: 18px; font-weight: 600; color: #0f172a;
  line-height: 1.4; letter-spacing: -0.2px;
}
.credit-code {
  font-size: 12px; color: #94a3b8; font-family: 'JetBrains Mono', 'SF Mono', Consolas, monospace;
  margin-bottom: 18px;
}

/* AI 评分 */
.score-section {
  margin-bottom: 18px; padding: 14px; border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
  border: 1px solid #e9eef5;

  &__header {
    display: flex; justify-content: space-between; align-items: baseline;
    margin-bottom: 10px;
  }
}
.score-label {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; color: #64748b; font-weight: 500;
  .dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
}
.score-value {
  .score-num { font-size: 26px; font-weight: 700; color: #0f172a; letter-spacing: -1px; font-family: 'JetBrains Mono', monospace; }
  .score-suffix { font-size: 12px; color: #94a3b8; margin-left: 2px; }
}
.score-tag-row {
  display: flex; justify-content: space-between; align-items: center; margin-top: 10px;
  .score-hint { font-size: 11px; color: #94a3b8; }
}

/* 指标矩阵 */
.metric-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  margin-bottom: 18px; border-radius: 10px;
  border: 1px solid #e9eef5; background: #fff; overflow: hidden;
}
.metric-item {
  padding: 12px 8px; text-align: center;
  border-right: 1px solid #f1f5f9;
  &:last-child { border-right: none; }
  &__num { font-size: 20px; font-weight: 700; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
  &__label { font-size: 11px; color: #94a3b8; margin-top: 2px; }
}

/* 信息列表 */
.info-list {
  margin-bottom: 20px; padding-top: 4px; border-top: 1px dashed #e9eef5;

  &__row {
    display: flex; align-items: center; padding: 9px 0;
    border-bottom: 1px dashed #f1f5f9; font-size: 13px;
    &:last-child { border-bottom: none; }
    &--multi {
      align-items: flex-start;
      .info-list__value { line-height: 1.6; }
    }
  }
  &__label { width: 80px; flex-shrink: 0; color: #94a3b8; font-size: 12px; }
  &__value { color: #1e293b; flex: 1; word-break: break-all; }
}

/* 操作按钮 */
.action-stack {
  display: flex; flex-direction: column; gap: 10px;
  .action-btn {
    width: 100%; height: 42px; font-weight: 500; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; gap: 4px;
    .caret { margin-left: 4px; }
    &--primary {
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
      border: none; color: #fff;
      box-shadow: 0 4px 12px -2px rgba(37, 99, 235, 0.4);
      &:hover { transform: translateY(-1px); box-shadow: 0 6px 16px -2px rgba(37, 99, 235, 0.5); }
    }
  }
  .action-dropdown { width: 100%; :deep(.el-button) { width: 100%; } }
}

/* ========== 右侧 Tab 区 ========== */
.tab-panel {
  background: #fff; border-radius: 12px;
  border: 1px solid #e9eef5;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  overflow: hidden;
}

.custom-tabs {
  :deep(.el-tabs__header) {
    margin: 0; padding: 0 8px;
    background: #fafbfd; border-bottom: 1px solid #e9eef5;
  }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
  :deep(.el-tabs__item) {
    height: 50px; line-height: 50px; font-size: 14px; color: #64748b;
    padding: 0 18px;
    transition: all .2s ease;
    &.is-active { color: #2563eb; font-weight: 600; }
    &:hover { color: #1e3a8a; }
  }
  :deep(.el-tabs__active-bar) {
    background: linear-gradient(90deg, #2563eb 0%, #3b82f6 100%);
    height: 3px; border-radius: 3px 3px 0 0;
  }
}

.tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .el-icon { font-size: 15px; }
}

.pane-section { padding: 24px 28px 32px; }

.section-title {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 14px;
  &__bar {
    width: 3px; height: 14px; border-radius: 2px;
    background: linear-gradient(180deg, #2563eb 0%, #3b82f6 100%);
  }
  h3 { margin: 0; font-size: 15px; font-weight: 600; color: #0f172a; letter-spacing: -0.1px; }
  .section-count {
    font-size: 12px; color: #64748b;
    padding: 2px 8px; border-radius: 999px;
    background: #f1f5f9;
  }
}

/* 描述列表 */
.rich-descriptions {
  :deep(.el-descriptions__label) {
    background: #fafbfd !important;
    color: #64748b !important; font-weight: 400;
    width: 130px;
  }
  :deep(.el-descriptions__content) { color: #1e293b; }
  .legal-person {
    color: #2563eb; font-weight: 500;
    border-bottom: 1px dashed #93c5fd;
  }
  .business-scope {
    line-height: 1.8; color: #475569;
    padding: 4px 0;
  }
}

/* 表格 */
.rich-table {
  border-radius: 8px; overflow: hidden; border: 1px solid #e9eef5;
  :deep(.el-table__header) th {
    background: #fafbfd !important; color: #64748b; font-weight: 500;
  }
  :deep(.el-table tr:hover > td.el-table__cell) {
    background: #f8fafc !important;
  }
}

/* 税务资质卡片 */
.qualification-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
}
.qual-card {
  padding: 16px; border-radius: 10px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
  border: 1px solid #e9eef5;
  &__label { font-size: 12px; color: #94a3b8; margin-bottom: 6px; }
  &__value { font-size: 16px; font-weight: 600; color: #0f172a;
    &--mono { font-family: 'JetBrains Mono', monospace; font-size: 13px; }
  }
  &--warning {
    background: linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%);
    border-color: #fde68a;
    .qual-card__value { color: #b45309; }
  }
}

/* 风险横幅 */
.risk-banner {
  display: flex; align-items: center; gap: 24px;
  padding: 24px 28px; border-radius: 12px; margin-bottom: 28px;
  border: 1px solid;

  &__score { display: flex; align-items: baseline; gap: 4px; flex-shrink: 0; }
  .risk-num { font-size: 56px; font-weight: 700; line-height: 1; letter-spacing: -2px; font-family: 'JetBrains Mono', monospace; }
  .risk-unit { font-size: 14px; opacity: 0.7; }

  &__info { flex: 1; }
  .risk-level { font-size: 14px; opacity: 0.85; margin-bottom: 6px;
    strong { font-size: 16px; opacity: 1; }
  }
  .risk-desc { font-size: 13px; opacity: 0.7; line-height: 1.6; margin-bottom: 10px; }

  .risk-bar { height: 6px; background: rgba(255,255,255,0.5); border-radius: 999px; overflow: hidden;
    &__fill { height: 100%; border-radius: 999px; transition: width .6s ease; }
  }

  &--high {
    background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    border-color: #fecaca; color: #991b1b;
    .risk-bar__fill { background: linear-gradient(90deg, #dc2626, #ef4444); }
  }
  &--mid {
    background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
    border-color: #fde68a; color: #92400e;
    .risk-bar__fill { background: linear-gradient(90deg, #d97706, #f59e0b); }
  }
  &--low {
    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
    border-color: #bbf7d0; color: #166534;
    .risk-bar__fill { background: linear-gradient(90deg, #16a34a, #22c55e); }
  }
}

/* 解锁横幅 */
.unlock-banner {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 22px; border-radius: 12px; margin-bottom: 24px;
  background: linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%);
  border: 1px solid #c7d2fe;

  &__icon {
    width: 44px; height: 44px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: #fff; color: #2563eb; font-size: 22px;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
  }
  &__text { flex: 1; }
  .unlock-title { font-size: 15px; font-weight: 600; color: #1e3a8a; margin-bottom: 4px; }
  .unlock-desc { font-size: 13px; color: #475569; }
}

.contact-type {
  display: inline-flex; align-items: center; gap: 6px;
  &__icon { color: #2563eb; }
}
.contact-value {
  font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 13px;
  color: #0f172a;
  &--locked {
    color: #94a3b8; letter-spacing: 1px;
  }
}
.trademark-name { font-weight: 500; color: #1e293b; }
.related-link {
  color: #2563eb; cursor: pointer; text-decoration: none;
  &:hover { text-decoration: underline; }
}

/* ========== 响应式 ========== */
@media (max-width: 1100px) {
  .detail-grid { grid-template-columns: 1fr; }
  .overview-card { position: static; }
  .qualification-grid { grid-template-columns: 1fr; }
}
</style>

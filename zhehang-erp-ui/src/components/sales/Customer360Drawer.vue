<template>
  <el-drawer
    v-model="visible"
    class="customer-360-drawer"
    size="min(880px, 94vw)"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    :before-close="beforeDrawerClose"
    @closed="followExpanded = false"
  >
    <template #header>
      <div class="drawer-title">
        <div class="drawer-title-mark"><el-icon><UserFilled /></el-icon></div>
        <div>
          <h2>客户360</h2>
          <p>{{ overview.companyName || '销售客户档案' }}</p>
        </div>
      </div>
    </template>

    <div class="customer360-shell" v-loading="loading">
      <el-result
        v-if="!loading && errorMessage"
        icon="warning"
        title="客户360加载失败"
        :sub-title="errorMessage"
      >
        <template #extra>
          <el-button type="primary" :icon="Refresh" @click="loadData">重新加载</el-button>
        </template>
      </el-result>

      <template v-else-if="data">
        <section class="customer-hero">
          <div class="customer-avatar">{{ firstChar(overview.companyName) }}</div>
          <div class="customer-identity">
            <div class="customer-name-line">
              <h3 :title="overview.companyName">{{ overview.companyName || '未命名客户' }}</h3>
              <el-tag v-if="overview.customerLevel" effect="dark" :type="levelTagType(overview.customerLevel)">
                {{ overview.customerLevel }}类
              </el-tag>
              <el-tag v-else effect="plain" type="info">未分级</el-tag>
              <el-tag effect="plain" :type="overview.customerStatus === 1 ? 'danger' : (overview.converted ? 'success' : 'primary')">
                {{ overview.customerStatus === 1 ? '已停用' : (overview.converted ? '正式客户' : (overview.followStatus || lifecycleLabel(overview.lifecycleStatus))) }}
              </el-tag>
            </div>
            <div class="customer-contact-line">
              <span><el-icon><User /></el-icon>{{ overview.contactName || '联系人待补' }}</span>
              <span class="phone-value"><el-icon><Phone /></el-icon>{{ overview.phone || '电话待补' }}</span>
              <el-tooltip v-if="overview.phone && canDial" content="复制电话号码" placement="top">
                <el-button class="copy-button" text circle :icon="CopyDocument" aria-label="复制电话号码" @click="copyPhone" />
              </el-tooltip>
            </div>
            <div class="customer-meta-line">
              <span>负责人：{{ ownerDisplay }}</span>
              <span>来源：{{ overview.source || '未记录' }}</span>
              <span>业务：{{ overview.serviceType || '待确认' }}</span>
            </div>
          </div>
          <div class="hero-actions">
            <el-tooltip content="重新读取客户最新记录" placement="top">
              <el-button class="icon-command" :icon="Refresh" circle aria-label="刷新客户360" :loading="loading" @click="loadData" />
            </el-tooltip>
            <el-button v-if="canFollow" :icon="EditPen" @click="startFollow">写跟进</el-button>
            <el-button v-if="canConvert" :icon="Promotion" @click="convertLead">转客户</el-button>
            <el-button v-if="canHandover" :icon="SwitchIcon" @click="startHandover">发起交接</el-button>
            <el-button v-if="props.showDial !== false" type="primary" :icon="Phone" :disabled="!canDial" @click="dialCustomer">拨打</el-button>
          </div>
        </section>

        <el-alert
          v-if="overview.customerDataRestricted"
          class="restricted-alert"
          type="warning"
          :closable="false"
          show-icon
          title="当前只展示你有权查看的线索资料"
          :description="restrictedDescription"
        />

        <section v-if="!overview.customerDataRestricted" class="metric-band" aria-label="客户经营概览">
          <div>
            <span>跟进</span>
            <strong>{{ stats.followCount || 0 }}</strong>
            <small>条记录</small>
          </div>
          <div>
            <span>通话</span>
            <strong>{{ stats.callCount || 0 }}</strong>
            <small>次沟通</small>
          </div>
          <div>
            <span>商机</span>
            <strong>{{ stats.opportunityCount || 0 }}</strong>
            <small>{{ money(stats.opportunityAmount) }}</small>
          </div>
          <div>
            <span>订单</span>
            <strong>{{ stats.orderCount || 0 }}</strong>
            <small>{{ money(stats.orderAmount) }}</small>
          </div>
          <div class="is-positive">
            <span>已收</span>
            <strong>{{ moneyCompact(stats.receivedAmount) }}</strong>
            <small>确认收款</small>
          </div>
          <div :class="{ 'is-danger': Number(stats.arrearsAmount || 0) > 0 }">
            <span>待收</span>
            <strong>{{ moneyCompact(stats.arrearsAmount) }}</strong>
            <small>{{ Number(stats.arrearsAmount || 0) > 0 ? '需要跟进' : '暂无欠费' }}</small>
          </div>
          <div :class="{ 'is-warning': Number(stats.openIssueCount || 0) > 0 }">
            <span>服务问题</span>
            <strong>{{ stats.openIssueCount || 0 }}</strong>
            <small>未关闭</small>
          </div>
        </section>

        <section v-if="!overview.customerDataRestricted" class="next-action-band" :class="nextActionClass">
          <div class="next-action-icon"><el-icon><Calendar /></el-icon></div>
          <div>
            <span>下一步动作</span>
            <strong>{{ nextActionTitle }}</strong>
            <p>{{ overview.nextActionContent || overview.lastFollowContent || '还没有写具体计划' }}</p>
          </div>
          <time v-if="overview.nextActionTime">{{ dateTime(overview.nextActionTime) }}</time>
          <el-tag v-else type="warning" effect="plain">待安排</el-tag>
        </section>

        <section v-if="followExpanded" class="inline-follow">
          <div class="section-heading">
            <div>
              <h4>记录本次跟进</h4>
              <p>本次沟通与下一步计划</p>
            </div>
            <el-button text :icon="Close" @click="followExpanded = false">收起</el-button>
          </div>
          <el-form label-position="top" class="follow-form">
            <div class="follow-grid">
              <el-form-item label="跟进方式" required>
                <el-select v-model="followForm.type" style="width: 100%">
                  <el-option label="电话" :value="1" />
                  <el-option label="微信" :value="2" />
                  <el-option label="面谈" :value="3" />
                  <el-option label="邮件" :value="4" />
                  <el-option label="其他" :value="5" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="!isFormalCustomer" label="销售阶段" required>
                <el-select v-model="followForm.followStatus" style="width: 100%">
                  <el-option v-for="item in followStatusOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
              <el-form-item label="意向等级">
                <el-select v-model="followForm.customerLevel" clearable placeholder="暂不分级" style="width: 100%">
                  <el-option v-for="item in customerLevelOptions" :key="item.value" :label="item.label" :value="item.value" />
                </el-select>
              </el-form-item>
              <el-form-item v-if="!isFormalCustomer && !leadMovesToHistory" label="下一步动作" required>
                <el-select v-model="followForm.nextActionType" style="width: 100%">
                  <el-option v-for="item in nextActionOptions" :key="item" :label="item" :value="item" />
                </el-select>
              </el-form-item>
            </div>
            <el-form-item label="本次沟通内容" required>
              <el-input
                v-model="followForm.content"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="写清客户反馈、当前需求和已达成的共识"
              />
            </el-form-item>
            <SalesAiDraftPanel
              :lead-id="overview.leadId"
              :connected="1"
              result="客户跟进"
              :user-note="followForm.content"
              @apply="applyAiFollowDraft"
            />
            <el-alert
              v-if="leadMovesToHistory"
              type="warning"
              :closable="false"
              show-icon
              title="D/E 类保存后进入历史客资，全部客户记录继续保留"
            />
            <div v-if="!leadMovesToHistory" class="follow-grid follow-grid-bottom">
              <el-form-item label="下次跟进时间" required>
                <el-date-picker
                  v-model="followForm.nextTime"
                  type="datetime"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="选择具体时间"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item :label="isFormalCustomer ? '下一步具体计划' : '下次计划'" :required="isFormalCustomer">
                <el-input
                  v-model="followForm.nextContent"
                  maxlength="200"
                  :placeholder="isFormalCustomer ? '例如：发送续费合同并确认付款日期' : '例如：电话确认报价方案'"
                />
              </el-form-item>
            </div>
            <div class="follow-submit-row">
              <el-button @click="followExpanded = false">取消</el-button>
              <el-button type="primary" :loading="savingFollow" @click="saveFollow">保存跟进</el-button>
            </div>
          </el-form>
        </section>

        <el-tabs v-if="!overview.customerDataRestricted" v-model="activeTab" class="customer-tabs">
          <el-tab-pane name="timeline">
            <template #label><span class="tab-label"><el-icon><Clock /></el-icon>时间线</span></template>
            <!-- 方案甲:按天分组 + 竖轴圆点(绿=接通/灰=未接通) + 连续未接通折叠 + 录音卡片高亮 -->
            <div v-if="data.timeline.length" class="rail-list">
              <template v-for="group in timelineGroups" :key="group.date">
                <div class="rail-date"><span class="rail-date-dot" />{{ group.label }}</div>
                <template v-for="node in group.nodes" :key="node.kind === 'fold' ? node.key : `${node.item.type}-${node.item.id}-${node.item.occurredAt}`">
                  <!-- 连续未接通折叠条 -->
                  <div v-if="node.kind === 'fold'" class="rail-node">
                    <span class="rail-dot miss" />
                    <div class="fold-block">
                      <button type="button" class="fold-row" @click="toggleFold(node.key)">
                        <el-icon><Phone /></el-icon>
                        <span>连续 {{ node.items.length }} 次未接通<template v-if="node.actorLabel"> · {{ node.actorLabel }}</template></span>
                        <span class="fold-toggle">{{ foldOpen[node.key] ? '收起' : '展开' }}<el-icon><component :is="foldOpen[node.key] ? ArrowUp : ArrowDown" /></el-icon></span>
                      </button>
                      <div v-if="foldOpen[node.key]" class="fold-items">
                        <div v-for="it in node.items" :key="`${it.id}-${it.occurredAt}`" class="call-card miss">
                          <div class="call-line">
                            <strong>{{ it.title || '电话外呼' }}</strong>
                            <span v-if="it.durationSeconds != null" class="dur-pill">{{ it.durationSeconds }}秒</span>
                            <time>{{ dateTime(it.occurredAt) }}</time>
                          </div>
                          <div class="call-meta"><span v-if="it.actorName">经办：{{ it.actorName }}</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 通话卡片 -->
                  <div v-else-if="node.item.type === 'call'" class="rail-node">
                    <span class="rail-dot" :class="node.item.status === '已接通' ? 'ok' : 'miss'" />
                    <div class="call-card" :class="{ miss: node.item.status !== '已接通', hl: node.item.recordingAvailable }">
                      <div class="call-line">
                        <strong>{{ node.item.title || '电话外呼' }}</strong>
                        <el-tag size="small" effect="plain" :type="node.item.status === '已接通' ? 'success' : 'info'">{{ node.item.status }}</el-tag>
                        <span v-if="node.item.durationSeconds != null" class="dur-pill">{{ node.item.durationSeconds }}秒</span>
                        <time>{{ dateTime(node.item.occurredAt) }}</time>
                      </div>
                      <p v-if="node.item.content" class="timeline-content">{{ node.item.content }}</p>
                      <div class="call-meta">
                        <span v-if="node.item.actorName">经办：{{ node.item.actorName }}</span>
                        <el-button v-if="node.item.recordingAvailable" link type="primary" :icon="Headset" @click="openRecord(node.item.id)">
                          {{ playingRecordId === node.item.id ? '收起录音' : '听录音' }}
                        </el-button>
                      </div>
                      <audio
                        v-if="playingRecordId === node.item.id && playingAudioSrc"
                        class="timeline-audio"
                        :src="playingAudioSrc"
                        controls
                        autoplay
                        preload="none"
                      />
                    </div>
                  </div>
                  <!-- 其他业务节点(跟进/商机/订单等) -->
                  <div v-else class="rail-node">
                    <span class="rail-dot other" />
                    <div class="event-block">
                      <div class="call-line">
                        <el-icon class="event-type-icon"><component :is="timelineIcon(node.item.type)" /></el-icon>
                        <strong>{{ node.item.title || timelineTypeLabel(node.item.type) }}</strong>
                        <el-tag v-if="node.item.status" size="small" effect="plain">{{ node.item.status }}</el-tag>
                        <b v-if="hasAmount(node.item.amount)">{{ money(node.item.amount) }}</b>
                        <time>{{ dateTime(node.item.occurredAt) }}</time>
                      </div>
                      <p v-if="node.item.content" class="timeline-content">{{ node.item.content }}</p>
                      <div class="call-meta"><span v-if="node.item.actorName">经办：{{ node.item.actorName }}</span></div>
                    </div>
                  </div>
                </template>
              </template>
            </div>
            <el-empty v-else description="还没有沟通或业务记录" :image-size="72" />
          </el-tab-pane>

          <el-tab-pane name="opportunities">
            <template #label><span class="tab-label"><el-icon><TrendCharts /></el-icon>商机 {{ data.opportunities.length }}</span></template>
            <el-table v-if="data.opportunities.length" :data="data.opportunities" class="detail-table" stripe>
              <el-table-column label="商机" min-width="180" show-overflow-tooltip>
                <template #default="{ row }"><strong>{{ row.name || '未命名商机' }}</strong></template>
              </el-table-column>
              <el-table-column label="阶段" min-width="108"><template #default="{ row }"><el-tag effect="plain">{{ row.stageName }}</el-tag></template></el-table-column>
              <el-table-column label="预计金额" min-width="120"><template #default="{ row }">{{ moneyOrDash(row.amount) }}</template></el-table-column>
              <el-table-column label="赢单率" min-width="90"><template #default="{ row }">{{ row.winRate == null ? '-' : `${row.winRate}%` }}</template></el-table-column>
              <el-table-column label="预计成交" min-width="112" prop="expectedDate" />
              <el-table-column label="负责人" min-width="100" prop="ownerName" show-overflow-tooltip />
            </el-table>
            <el-empty v-else description="暂无商机" :image-size="72" />
          </el-tab-pane>

          <el-tab-pane name="transactions">
            <template #label><span class="tab-label"><el-icon><Wallet /></el-icon>交易 {{ data.transactions.length }}</span></template>
            <el-table v-if="data.transactions.length" :data="data.transactions" class="detail-table" stripe>
              <el-table-column label="类型" min-width="92"><template #default="{ row }"><el-tag :type="transactionTagType(row.type)" effect="plain">{{ transactionTypeLabel(row.type) }}</el-tag></template></el-table-column>
              <el-table-column label="单号 / 内容" min-width="210" show-overflow-tooltip>
                <template #default="{ row }"><strong>{{ row.number || row.title || '-' }}</strong><small v-if="row.number && row.title">{{ row.title }}</small></template>
              </el-table-column>
              <el-table-column label="状态" min-width="102" prop="status" />
              <el-table-column label="金额" min-width="120"><template #default="{ row }">{{ moneyOrDash(row.amount) }}</template></el-table-column>
              <el-table-column label="待收" min-width="110"><template #default="{ row }"><span :class="{ 'amount-danger': Number(row.arrearsAmount || 0) > 0 }">{{ moneyOrDash(row.arrearsAmount) }}</span></template></el-table-column>
              <el-table-column label="时间" min-width="148"><template #default="{ row }">{{ dateTime(row.eventTime) }}</template></el-table-column>
            </el-table>
            <el-empty v-else description="暂无授权可见的订单、合同或收款记录" :image-size="72" />
          </el-tab-pane>

          <el-tab-pane name="services">
            <template #label><span class="tab-label"><el-icon><Service /></el-icon>服务 {{ data.services.length }}</span></template>
            <el-table v-if="data.services.length" :data="data.services" class="detail-table" stripe>
              <el-table-column label="工单" min-width="130" prop="number" show-overflow-tooltip />
              <el-table-column label="问题" min-width="220" show-overflow-tooltip><template #default="{ row }"><strong>{{ row.title || '-' }}</strong></template></el-table-column>
              <el-table-column label="类型" min-width="88" prop="type" />
              <el-table-column label="优先级" min-width="86"><template #default="{ row }"><el-tag :type="priorityTagType(row.priority)" effect="plain">{{ row.priority || 'P2' }}</el-tag></template></el-table-column>
              <el-table-column label="状态" min-width="94"><template #default="{ row }"><span :class="{ 'amount-danger': row.overdue }">{{ row.status || '-' }}</span></template></el-table-column>
              <el-table-column label="负责人" min-width="100" prop="ownerName" show-overflow-tooltip />
              <el-table-column label="截止时间" min-width="148"><template #default="{ row }">{{ dateTime(row.deadline) }}</template></el-table-column>
            </el-table>
            <el-empty v-else description="暂无任务工单记录" :image-size="72" />
          </el-tab-pane>

          <el-tab-pane name="profile">
            <template #label><span class="tab-label"><el-icon><Document /></el-icon>资料</span></template>
            <!-- 方案1:资料页分组卡片(跟进信息/工商信息/联系人 各一张卡) -->
            <section class="profile-card">
              <div class="profile-card-head"><el-icon><DataAnalysis /></el-icon><h4>跟进信息</h4></div>
              <dl class="profile-grid">
                <div><dt>线索编号</dt><dd>{{ overview.leadNo || '-' }}</dd></div>
                <div><dt>当前阶段</dt><dd>{{ overview.followStatus || lifecycleLabel(overview.lifecycleStatus) }}</dd></div>
                <div><dt>意向等级</dt><dd>{{ overview.intentLevel || '-' }}</dd></div>
                <div><dt>报价状态</dt><dd>{{ overview.quoteStatus || '-' }}</dd></div>
                <div><dt>报价金额</dt><dd>{{ moneyOrDash(overview.quotedPrice) }}</dd></div>
                <div><dt>成交金额</dt><dd>{{ moneyOrDash(overview.dealAmount) }}</dd></div>
                <div><dt>微信</dt><dd>{{ overview.wechat || '-' }}</dd></div>
                <div><dt>邮箱</dt><dd :title="overview.email">{{ overview.email || '-' }}</dd></div>
                <div><dt>服务到期</dt><dd>{{ overview.serviceExpireDate || '-' }}</dd></div>
                <div><dt>最近跟进</dt><dd>{{ dateTime(overview.lastFollowTime) }}</dd></div>
              </dl>
            </section>
            <section class="profile-card">
              <div class="profile-card-head"><el-icon><OfficeBuilding /></el-icon><h4>工商信息</h4></div>
              <dl class="profile-grid">
              <div><dt>法定代表人</dt><dd>{{ overview.legalPerson || '-' }}</dd></div>
              <div><dt>企业联系电话</dt><dd>{{ overview.companyPhone || '-' }}</dd></div>
              <div><dt>登记状态</dt><dd>{{ overview.registerStatus || '-' }}</dd></div>
              <div><dt>企业类型</dt><dd :title="overview.enterpriseType">{{ overview.enterpriseType || '-' }}</dd></div>
              <div><dt>企业规模</dt><dd>{{ overview.enterpriseScale || '-' }}</dd></div>
              <div><dt>注册资本</dt><dd>{{ overview.registeredCapital ?? '-' }}</dd></div>
              <div><dt>实缴资本</dt><dd>{{ overview.paidCapital || '-' }}</dd></div>
              <div><dt>统一社会信用代码</dt><dd :title="overview.creditCode">{{ overview.creditCode || '-' }}</dd></div>
              <div><dt>成立日期</dt><dd>{{ overview.establishedDate || '-' }}</dd></div>
              <div><dt>所属区域</dt><dd :title="overview.region">{{ overview.region || '-' }}</dd></div>
              <div><dt>行业门类</dt><dd :title="overview.industry">{{ overview.industry || '-' }}</dd></div>
              <div><dt>参保人数</dt><dd>{{ overview.insuredCount ? `${overview.insuredCount}${overview.insuredYear ? `（${overview.insuredYear}年报）` : ''}` : '-' }}</dd></div>
            </dl>
            <dl class="profile-grid profile-grid-full">
              <div><dt>注册地址</dt><dd class="wrap-text">{{ overview.registerAddress || '-' }}</dd></div>
              <div><dt>最新地址</dt><dd class="wrap-text">{{ overview.latestAddress || '-' }}</dd></div>
              <div><dt>经营范围</dt><dd class="wrap-text">{{ overview.businessScope || '-' }}</dd></div>
            </dl>
            </section>
            <section class="profile-card">
              <div class="profile-card-head"><el-icon><User /></el-icon><h4>联系人</h4><span class="profile-card-count">{{ data.contacts.length }} 人</span></div>
              <el-table v-if="data.contacts.length" :data="data.contacts" class="detail-table" stripe>
                <el-table-column label="姓名" min-width="120"><template #default="{ row }"><strong>{{ row.name || '-' }}</strong><el-tag v-if="row.primary" class="primary-contact" size="small" type="success" effect="plain">主要</el-tag></template></el-table-column>
                <el-table-column label="职位" min-width="100" prop="position" show-overflow-tooltip />
                <el-table-column label="手机" min-width="135"><template #default="{ row }">{{ row.mobile || row.phone || '-' }}</template></el-table-column>
                <el-table-column label="微信" min-width="120" prop="wechat" show-overflow-tooltip />
                <el-table-column label="邮箱" min-width="180" prop="email" show-overflow-tooltip />
              </el-table>
              <el-empty v-else description="暂无联系人资料" :image-size="72" />
            </section>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </el-drawer>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, type Component } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  Clock,
  Close,
  CopyDocument,
  DataAnalysis,
  Document,
  EditPen,
  Headset,
  OfficeBuilding,
  Opportunity,
  Phone,
  Promotion,
  Refresh,
  Service,
  Switch as SwitchIcon,
  TrendCharts,
  User,
  UserFilled,
  Wallet
} from '@element-plus/icons-vue'
import { customerApi, leadApi, type Customer360Data, type Customer360TimelineItem } from '@/api/crm'
import { callRecordingStreamUrl, callRecordApi } from '@/api/call-record'
import type { SalesAiDraft } from '@/api/sales-ai'
import SalesAiDraftPanel from '@/components/sales/SalesAiDraftPanel.vue'

const router = useRouter()

const props = defineProps<{
  modelValue: boolean
  leadId?: number | null
  customerId?: number | null
  showDial?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'changed', payload: { leadId: number; customerId?: number; action: 'follow' | 'convert' }): void
  (event: 'dial', payload: { leadId: number; phone: string; companyName: string }): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const loading = ref(false)
const errorMessage = ref('')
const data = ref<Customer360Data | null>(null)
const activeTab = ref('timeline')
const followExpanded = ref(false)
const savingFollow = ref(false)
let requestSerial = 0

const emptyStats = {
  followCount: 0,
  callCount: 0,
  opportunityCount: 0,
  orderCount: 0,
  openIssueCount: 0,
  opportunityAmount: 0,
  orderAmount: 0,
  receivedAmount: 0,
  arrearsAmount: 0
}

const overview = computed(() => data.value?.overview || ({
  leadId: Number(props.leadId || 0),
  customerId: Number(props.customerId || 0) || undefined,
  companyName: '',
  converted: false,
  customerDataRestricted: false
} as Customer360Data['overview']))
const stats = computed(() => data.value?.stats || emptyStats)
const isFormalCustomer = computed(() => overview.value.converted && !!overview.value.customerId)
const canFollow = computed(() => overview.value.ownership !== 'pool'
  && !overview.value.customerDataRestricted
  && overview.value.customerStatus !== 1
  && (isFormalCustomer.value
    || (overview.value.lifecycleStatus !== 3 && overview.value.lifecycleStatus !== 4)))
const canConvert = computed(() => canFollow.value && !isFormalCustomer.value)
const canHandover = computed(() => overview.value.converted
  && !!overview.value.customerId
  && overview.value.customerStatus !== 1
  && !overview.value.customerDataRestricted)
const canDial = computed(() => !!overview.value.phone
  && !(overview.value.ownership === 'pool' && overview.value.customerDataRestricted))
const ownerDisplay = computed(() => overview.value.ownership === 'pool'
  ? '公海待领取'
  : (overview.value.ownerName || '未分配'))
const restrictedDescription = computed(() => overview.value.ownership === 'pool'
  ? '公海线索需先按规则领取；领取前不会返回历史负责人、跟进、报价、成交和正式客户资料。'
  : '关联的正式客户、交易或服务记录不在你的数据范围内，请联系主管核对客户归属。')

const followStatusOptions = ['线索接收', '需求沟通', '需求答疑', '签单收款']
const customerLevelOptions = [
  { value: 'A', label: 'A 高意向（1-2天跟进）' },
  { value: 'B', label: 'B 意向' },
  { value: 'C', label: 'C 潜在意向' },
  { value: 'D', label: 'D 无意向（转历史）' },
  { value: 'E', label: 'E 无效客户（转历史）' }
]
const nextActionOptions = ['电话', '微信', '发方案', '报价', '签约', '收款', '其他']
const followForm = reactive({
  type: 1,
  followStatus: '需求沟通',
  customerLevel: '',
  content: '',
  nextActionType: '电话',
  nextTime: '',
  nextContent: ''
})
const leadMovesToHistory = computed(() => !isFormalCustomer.value
  && ['D', 'E'].includes(followForm.customerLevel))

function normalizeIntentLevel(value?: string) {
  const level = String(value || '').trim().toUpperCase()
  return ['A', 'B', 'C', 'D', 'E'].includes(level) ? level : ''
}

function applyAiFollowDraft(draft: SalesAiDraft) {
  if (draft.summary?.trim()) followForm.content = draft.summary.trim()
  if (draft.intentLevel && ['A', 'B', 'C', 'D', 'E'].includes(draft.intentLevel)) {
    followForm.customerLevel = draft.intentLevel
  }
  if (!['D', 'E'].includes(followForm.customerLevel)) {
    if (draft.nextActionType && nextActionOptions.includes(draft.nextActionType)) {
      followForm.nextActionType = draft.nextActionType
    }
    if (draft.nextActionTime) followForm.nextTime = normalizeDateTime(draft.nextActionTime)
    if (draft.nextActionContent?.trim()) followForm.nextContent = draft.nextActionContent.trim()
  }
}

const nextActionTitle = computed(() => {
  if (!overview.value.nextActionTime) return '尚未安排下一步'
  return overview.value.nextActionType || '客户跟进'
})
const nextActionClass = computed(() => {
  if (!overview.value.nextActionTime) return 'is-missing'
  const due = new Date(String(overview.value.nextActionTime).replace(' ', 'T')).getTime()
  if (!Number.isNaN(due) && due < Date.now()) return 'is-overdue'
  return 'is-scheduled'
})

watch(
  () => [props.modelValue, props.leadId, props.customerId] as const,
  ([open, leadId, customerId]) => {
    if (open && (leadId || customerId)) {
      followExpanded.value = false
      activeTab.value = 'timeline'
      loadData()
    }
    if (!open) followExpanded.value = false
  },
  { immediate: true }
)

async function loadData() {
  const leadId = Number(props.leadId || 0)
  const customerId = Number(props.customerId || 0)
  if (!leadId && !customerId) {
    data.value = null
    errorMessage.value = '缺少客户编号'
    return
  }
  const serial = ++requestSerial
  const identityChanged = customerId
    ? data.value?.overview?.customerId !== customerId
    : data.value?.overview?.leadId !== leadId
  if (identityChanged) data.value = null
  loading.value = true
  errorMessage.value = ''
  try {
    const response: any = customerId
      ? await customerApi.customer360(customerId)
      : await leadApi.customer360(leadId)
    if (serial !== requestSerial) return
    const payload = (response?.data ?? response) as Customer360Data
    if (!payload?.overview) throw new Error('客户数据为空')
    data.value = {
      ...payload,
      stats: payload.stats || { ...emptyStats },
      contacts: Array.isArray(payload.contacts) ? payload.contacts : [],
      opportunities: Array.isArray(payload.opportunities) ? payload.opportunities : [],
      transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
      services: Array.isArray(payload.services) ? payload.services : [],
      timeline: Array.isArray(payload.timeline) ? payload.timeline : []
    }
    if (payload.overview.converted || payload.overview.customerDataRestricted) {
      followExpanded.value = false
    }
  } catch (error: any) {
    if (serial !== requestSerial) return
    data.value = null
    errorMessage.value = error?.message || '请稍后重试'
  } finally {
    if (serial === requestSerial) loading.value = false
  }
}

function startFollow() {
  if (!canFollow.value) return
  followForm.type = 1
  followForm.followStatus = overview.value.followStatus || '需求沟通'
  followForm.customerLevel = normalizeIntentLevel(overview.value.customerLevel)
  followForm.content = ''
  followForm.nextActionType = overview.value.nextActionType || '电话'
  followForm.nextTime = overview.value.nextActionTime && parseDateTime(overview.value.nextActionTime) > Date.now()
    ? normalizeDateTime(overview.value.nextActionTime)
    : tomorrowAtTen()
  followForm.nextContent = overview.value.nextActionContent || ''
  followExpanded.value = true
}

async function saveFollow() {
  const leadId = Number(overview.value.leadId || props.leadId || 0)
  const customerId = Number(overview.value.customerId || props.customerId || 0)
  if (!leadId && !customerId) return
  if (!followForm.content.trim()) {
    ElMessage.warning('请填写本次沟通内容')
    return
  }
  if (!leadMovesToHistory.value
      && (!followForm.nextTime || (!isFormalCustomer.value && !followForm.nextActionType))) {
    ElMessage.warning('请安排下一步动作和具体时间')
    return
  }
  if (isFormalCustomer.value && !followForm.nextContent.trim()) {
    ElMessage.warning('请写清下一步具体计划')
    return
  }
  savingFollow.value = true
  try {
    if (isFormalCustomer.value && customerId) {
      await customerApi.follow(customerId, {
        type: followForm.type,
        content: followForm.content.trim(),
        nextTime: followForm.nextTime,
        nextContent: followForm.nextContent.trim(),
        customerLevel: followForm.customerLevel || undefined
      }, { silentError: true })
    } else {
      await leadApi.follow(leadId, {
        type: followForm.type,
        content: followForm.content.trim(),
        nextTime: leadMovesToHistory.value ? undefined : followForm.nextTime,
        nextContent: leadMovesToHistory.value ? undefined : (followForm.nextContent.trim() || undefined),
        followStatus: followForm.followStatus,
        customerLevel: followForm.customerLevel || undefined,
        nextActionType: leadMovesToHistory.value ? undefined : followForm.nextActionType
      }, { silentError: true })
    }
    ElMessage.success(leadMovesToHistory.value ? '跟进已保存，客户已进入历史客资' : '跟进已保存，下一步已安排')
    followExpanded.value = false
    await loadData()
    emit('changed', { leadId, customerId: customerId || undefined, action: 'follow' })
  } catch (error: any) {
    ElMessage.error(error?.message || '跟进保存失败')
  } finally {
    savingFollow.value = false
  }
}

async function convertLead() {
  const leadId = Number(props.leadId || 0)
  if (!leadId || !canConvert.value) return
  try {
    await ElMessageBox.confirm(
      `确认把「${overview.value.companyName || '该线索'}」转为正式客户？系统会建立客户档案和主联系人。`,
      '转为正式客户',
      { confirmButtonText: '确认转客户', cancelButtonText: '取消', type: 'success' }
    )
    await leadApi.convert(leadId, { silentError: true })
    ElMessage.success('已转为正式客户')
    await loadData()
    emit('changed', { leadId, action: 'convert' })
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error?.message || '转客户失败')
    }
  }
}

function startHandover() {
  if (!canHandover.value) return
  visible.value = false
  router.push({
    path: '/customer/handover',
    query: { customerId: String(overview.value.customerId), create: '1' }
  })
}

function beforeDrawerClose(done: () => void) {
  if (savingFollow.value) return
  if (!followExpanded.value || !followForm.content.trim()) {
    done()
    return
  }
  ElMessageBox.confirm('本次跟进还没有保存，确定关闭吗？', '跟进未保存', {
    confirmButtonText: '放弃填写',
    cancelButtonText: '继续填写',
    type: 'warning'
  }).then(done).catch(() => {})
}

function dialCustomer() {
  const phone = firstPhone(overview.value.phone)
  if (!phone || !canDial.value) {
    ElMessage.warning(overview.value.ownership === 'pool' ? '请先按规则领取公海线索' : '该客户暂无电话')
    return
  }
  emit('dial', { leadId: Number(overview.value.leadId || props.leadId || 0), phone, companyName: overview.value.companyName || '未命名客户' })
}

async function copyPhone() {
  const phone = overview.value.phone || ''
  if (!phone) return
  try {
    await navigator.clipboard.writeText(phone)
    ElMessage.success('电话号码已复制')
  } catch {
    ElMessage.info(`电话号码：${phone}`)
  }
}

// ===== 时间线方案甲:按天分组 + 连续未接通折叠 =====
type TimelineNode =
  | { kind: 'item'; item: Customer360TimelineItem }
  | { kind: 'fold'; key: string; items: Customer360TimelineItem[]; actorLabel: string }
interface TimelineGroup { date: string; label: string; nodes: TimelineNode[] }

const foldOpen = ref<Record<string, boolean>>({})
function toggleFold(key: string) {
  foldOpen.value[key] = !foldOpen.value[key]
}

function timelineDateLabel(date: string) {
  if (!date) return '未知日期'
  const [y, m, d] = date.split('-')
  const thisYear = String(new Date().getFullYear())
  return y === thisYear ? `${Number(m)}月${Number(d)}日` : `${y}年${Number(m)}月${Number(d)}日`
}

// 无录音的未接通电话才参与折叠;同一天里连续 2 条及以上合并成一条可展开
const isFoldableMissedCall = (item: Customer360TimelineItem) =>
  item.type === 'call' && item.status !== '已接通' && !item.recordingAvailable

const timelineGroups = computed<TimelineGroup[]>(() => {
  const groups: TimelineGroup[] = []
  let current: TimelineGroup | null = null
  for (const item of data.value?.timeline || []) {
    const date = (item.occurredAt || '').slice(0, 10)
    if (!current || current.date !== date) {
      current = { date, label: timelineDateLabel(date), nodes: [] }
      groups.push(current)
    }
    const last = current.nodes[current.nodes.length - 1]
    if (isFoldableMissedCall(item)) {
      if (last && last.kind === 'fold') {
        last.items.push(item)
        continue
      }
      if (last && last.kind === 'item' && isFoldableMissedCall(last.item)) {
        current.nodes.pop()
        current.nodes.push({ kind: 'fold', key: `${date}-${last.item.id}`, items: [last.item, item], actorLabel: '' })
        continue
      }
    }
    current.nodes.push({ kind: 'item', item })
  }
  for (const group of groups) {
    for (const node of group.nodes) {
      if (node.kind === 'fold') {
        const names = [...new Set(node.items.map((it) => it.actorName).filter(Boolean))] as string[]
        node.actorLabel = names.length === 0 ? '' : names.length === 1 ? names[0] : `${names[0]}等${names.length}人`
      }
    }
  }
  return groups
})

// 时间线内嵌录音播放:点「听录音」在条目下方展开播放器,再点收起
const playingRecordId = ref<number | null>(null)
const playingAudioSrc = ref('')

async function openRecord(recordId?: number) {
  if (!recordId) return
  if (playingRecordId.value === recordId) {
    playingRecordId.value = null
    playingAudioSrc.value = ''
    return
  }
  try {
    const response: any = await callRecordApi.recordingTicket(recordId)
    const ticket = response?.data ?? response
    playingAudioSrc.value = callRecordingStreamUrl(recordId, ticket.token)
    playingRecordId.value = recordId
  } catch {
    ElMessage.warning('当前录音无权访问或暂时不可用')
  }
}

function timelineIcon(type: Customer360TimelineItem['type']): Component {
  const icons: Partial<Record<Customer360TimelineItem['type'], Component>> = {
    call: Phone,
    follow: EditPen,
    opportunity: Opportunity,
    order: Document,
    contract: Document,
    receipt: Wallet,
    receivable: Wallet,
    issue: Service,
    conversion: Promotion,
    lead: DataAnalysis
  }
  return icons[type] || Clock
}

function timelineTypeLabel(type: Customer360TimelineItem['type']) {
  const labels: Record<Customer360TimelineItem['type'], string> = {
    lead: '线索', follow: '跟进', call: '通话', opportunity: '商机', order: '订单', contract: '合同',
    receipt: '收款', receivable: '应收', issue: '客户问题', conversion: '转客户'
  }
  return labels[type]
}

function transactionTypeLabel(type: string) {
  return ({ order: '订单', contract: '合同', receipt: '收款', receivable: '应收' } as Record<string, string>)[type] || '交易'
}

function transactionTagType(type: string): 'primary' | 'success' | 'warning' | 'info' {
  if (type === 'receipt') return 'success'
  if (type === 'receivable') return 'warning'
  if (type === 'contract') return 'info'
  return 'primary'
}

function priorityTagType(priority?: string): 'danger' | 'warning' | 'info' {
  if (priority === 'P0') return 'danger'
  if (priority === 'P1') return 'warning'
  return 'info'
}

function levelTagType(level?: string): 'danger' | 'warning' | 'primary' | 'info' {
  if (level === 'A') return 'danger'
  if (level === 'B') return 'warning'
  if (level === 'C') return 'primary'
  return 'info'
}

function lifecycleLabel(status?: number) {
  return ({ 1: '新建', 2: '跟进中', 3: '已转化', 4: '无效' } as Record<number, string>)[Number(status)] || '线索'
}

function dateTime(value?: string) {
  return value ? String(value).replace('T', ' ').slice(0, 16) : '-'
}

function normalizeDateTime(value?: string) {
  return value ? `${String(value).replace('T', ' ').slice(0, 16)}:00` : ''
}

function parseDateTime(value?: string) {
  if (!value) return 0
  const timestamp = new Date(String(value).replace(' ', 'T')).getTime()
  return Number.isNaN(timestamp) ? 0 : timestamp
}

function tomorrowAtTen() {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(10, 0, 0, 0)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day} 10:00:00`
}

function firstPhone(value?: string) {
  return String(value || '').split(/[,，、/\s]+/)[0]
}

function firstChar(value?: string) {
  return String(value || '客').trim().charAt(0) || '客'
}

function hasAmount(value?: number) {
  return value !== null && value !== undefined
}

function money(value?: number) {
  const amount = Number(value || 0)
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function moneyOrDash(value?: number) {
  return value === null || value === undefined ? '-' : money(value)
}

function moneyCompact(value?: number) {
  const amount = Number(value || 0)
  if (Math.abs(amount) >= 10000) return `¥${(amount / 10000).toFixed(amount % 10000 === 0 ? 0 : 1)}万`
  return `¥${amount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
}
</script>

<style scoped>
:global(.customer-360-drawer) {
  --el-font-size-base: 15px;
  color: #1f2937;
}

:global(.customer-360-drawer .el-drawer__header) {
  min-height: 72px;
  margin: 0;
  padding: 16px 24px;
  border-bottom: 1px solid #e5e7eb;
}

:global(.customer-360-drawer .el-drawer__close-btn) {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

:global(.customer-360-drawer .el-drawer__body) {
  padding: 0;
  overflow: hidden;
}

.drawer-title,
.customer-hero,
.customer-name-line,
.customer-contact-line,
.customer-meta-line,
.hero-actions,
.next-action-band,
.section-heading,
.follow-submit-row,
.tab-label,
.timeline-title-line,
.timeline-foot,
.contacts-heading {
  display: flex;
  align-items: center;
}

.drawer-title {
  gap: 12px;
}

.drawer-title-mark {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  color: #ffffff;
  background: #2563eb;
  border-radius: 8px;
  font-size: 21px;
}

.drawer-title h2,
.drawer-title p,
.customer-identity h3,
.customer-identity p,
.section-heading h4,
.section-heading p,
.timeline-main p,
.contacts-heading h4 {
  margin: 0;
  letter-spacing: 0;
}

.drawer-title h2 {
  color: #111827;
  font-size: 21px;
  line-height: 1.3;
}

.drawer-title p {
  margin-top: 3px;
  color: #6b7280;
  font-size: 13px;
}

.customer360-shell {
  height: 100%;
  padding: 20px 24px 32px;
  overflow: auto;
  box-sizing: border-box;
  background: #ffffff;
  font-size: 15px;
}

.customer-hero {
  align-items: flex-start;
  gap: 16px;
}

.customer-avatar {
  display: grid;
  flex: 0 0 56px;
  height: 56px;
  place-items: center;
  color: #ffffff;
  background: #0f766e;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 700;
}

.customer-identity {
  min-width: 0;
  flex: 1;
}

.customer-name-line {
  min-width: 0;
  gap: 8px;
  flex-wrap: wrap;
}

.customer-name-line h3 {
  min-width: 120px;
  max-width: 100%;
  overflow: hidden;
  color: #111827;
  font-size: 21px;
  line-height: 30px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.customer-contact-line {
  margin-top: 7px;
  gap: 16px;
  color: #374151;
  flex-wrap: wrap;
}

.customer-contact-line > span,
.customer-meta-line span {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
}

.phone-value {
  color: #111827;
  font-size: 16px;
  font-weight: 650;
}

.copy-button {
  width: 34px;
  height: 34px;
  margin-left: -10px;
}

.customer-meta-line {
  margin-top: 7px;
  gap: 14px;
  color: #6b7280;
  font-size: 13px;
  flex-wrap: wrap;
}

.hero-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}

.hero-actions .el-button + .el-button {
  margin-left: 0;
}

.hero-actions :deep(.el-button) {
  min-height: 40px;
  padding: 8px 15px;
  font-size: 14px;
}

.hero-actions .icon-command {
  width: 40px;
  min-width: 40px;
  padding: 0;
}

.restricted-alert {
  margin-top: 18px;
}

.metric-band {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  margin-top: 22px;
  padding: 15px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.metric-band > div {
  min-width: 0;
  padding: 0 13px;
  border-right: 1px solid #e5e7eb;
}

.metric-band > div:last-child {
  border-right: 0;
}

.metric-band span,
.metric-band small {
  display: block;
  overflow: hidden;
  color: #64748b;
  font-size: 13px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-band strong {
  display: block;
  margin: 3px 0 1px;
  overflow: hidden;
  color: #111827;
  font-size: 22px;
  line-height: 28px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric-band .is-positive strong { color: #047857; }
.metric-band .is-danger strong { color: #b91c1c; }
.metric-band .is-warning strong { color: #b45309; }

.next-action-band {
  align-items: flex-start;
  gap: 12px;
  margin-top: 18px;
  padding: 14px 16px;
  border: 1px solid #dbeafe;
  border-left: 4px solid #2563eb;
  border-radius: 6px;
  background: #eff6ff;
}

.next-action-band.is-overdue {
  border-color: #fecaca;
  border-left-color: #dc2626;
  background: #fef2f2;
}

.next-action-band.is-missing {
  border-color: #fde68a;
  border-left-color: #d97706;
  background: #fffbeb;
}

.next-action-icon {
  display: grid;
  flex: 0 0 36px;
  height: 36px;
  place-items: center;
  color: #1d4ed8;
  background: #ffffff;
  border-radius: 6px;
  font-size: 18px;
}

.next-action-band > div:nth-child(2) {
  min-width: 0;
  flex: 1;
}

.next-action-band span {
  color: #64748b;
  font-size: 13px;
}

.next-action-band strong {
  display: block;
  margin-top: 2px;
  color: #111827;
  font-size: 16px;
}

.next-action-band p {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
  color: #4b5563;
  font-size: 14px;
  line-height: 21px;
}

.next-action-band time {
  flex: 0 0 auto;
  color: #1f2937;
  font-size: 14px;
  font-weight: 650;
}

.inline-follow {
  margin-top: 18px;
  padding: 18px;
  border: 1px solid #bfdbfe;
  border-radius: 8px;
  background: #f8fbff;
}

.section-heading {
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 15px;
}

.section-heading h4,
.contacts-heading h4 {
  color: #111827;
  font-size: 17px;
}

.section-heading p {
  margin-top: 4px;
  color: #6b7280;
  font-size: 13px;
}

.follow-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0 12px;
}

.follow-grid-bottom {
  grid-template-columns: minmax(220px, 0.75fr) minmax(280px, 1.25fr);
}

.follow-form :deep(.el-form-item__label) {
  color: #374151;
  font-size: 14px;
  font-weight: 600;
}

.follow-form :deep(.el-input__wrapper),
.follow-form :deep(.el-select__wrapper) {
  min-height: 42px;
}

.follow-form :deep(.el-input__inner),
.follow-form :deep(.el-textarea__inner) {
  font-size: 15px;
}

.follow-submit-row {
  justify-content: flex-end;
  gap: 8px;
}

.follow-submit-row .el-button + .el-button { margin-left: 0; }
.follow-submit-row :deep(.el-button) { min-height: 40px; min-width: 92px; }

.customer-tabs {
  margin-top: 20px;
}

.customer-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.customer-tabs :deep(.el-tabs__item) {
  height: 46px;
  padding: 0 18px;
  font-size: 15px;
}

.tab-label {
  gap: 6px;
}

.timeline-list {
  padding: 2px 0 6px;
}

/* ===== 时间线方案甲:竖轴 + 圆点 + 分组 + 折叠 + 录音高亮 ===== */
.rail-list {
  position: relative;
  padding: 4px 0 6px 26px;
}
.rail-list::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: #e5e7eb;
}
.rail-date {
  position: relative;
  margin: 14px 0 8px;
  color: #64748b;
  font-size: 12.5px;
  font-weight: 600;
}
.rail-date:first-child { margin-top: 2px; }
.rail-date-dot {
  position: absolute;
  left: -20px;
  top: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #94a3b8;
}
.rail-node {
  position: relative;
  margin-bottom: 8px;
}
.rail-dot {
  position: absolute;
  left: -22px;
  top: 12px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #cbd5e1;
}
.rail-dot.ok { background: #22c55e; }
.rail-dot.miss { background: #cbd5e1; }
.rail-dot.other { background: #93c5fd; }
.call-card {
  border-left: 3px solid #22c55e;
  background: #f8fafc;
  padding: 8px 12px;
  border-radius: 0;
}
.call-card.miss { border-left-color: #cbd5e1; }
.call-card.hl { border: 1px solid #bfdbfe; border-left: 3px solid #22c55e; }
.call-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.call-line strong { font-size: 13.5px; color: #1f2937; }
.call-line b { color: #b45309; }
.call-line time {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
  white-space: nowrap;
}
.dur-pill {
  display: inline-block;
  padding: 0 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  line-height: 18px;
}
.call-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 12px;
}
.fold-block { min-width: 0; }
.fold-row {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 7px 12px;
  border: none;
  border-left: 3px solid #cbd5e1;
  border-radius: 0;
  background: #f8fafc;
  color: #64748b;
  font-size: 12.5px;
  cursor: pointer;
  text-align: left;
}
.fold-row:hover { background: #f1f5f9; }
.fold-toggle {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #3b82f6;
  white-space: nowrap;
}
.fold-items { margin-top: 6px; display: grid; gap: 6px; }
.event-block { padding: 4px 0 2px; }
.event-type-icon { color: #64748b; font-size: 15px; }

.timeline-row {
  display: grid;
  grid-template-columns: 46px minmax(0, 1fr);
  min-height: 82px;
}

.timeline-rail {
  position: relative;
}

.timeline-rail::after {
  position: absolute;
  top: 38px;
  bottom: 0;
  left: 18px;
  width: 1px;
  background: #dbe2ea;
  content: '';
}

.timeline-row:last-child .timeline-rail::after { display: none; }

.timeline-icon {
  position: relative;
  z-index: 1;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 50%;
  background: #eff6ff;
  font-size: 16px;
}

.timeline-icon.type-call { color: #047857; border-color: #a7f3d0; background: #ecfdf5; }
.timeline-icon.type-receipt { color: #047857; border-color: #a7f3d0; background: #ecfdf5; }
.timeline-icon.type-receivable,
.timeline-icon.type-issue { color: #b45309; border-color: #fde68a; background: #fffbeb; }
.timeline-icon.type-conversion { color: #7c3aed; border-color: #ddd6fe; background: #f5f3ff; }

.timeline-main {
  min-width: 0;
  padding: 1px 0 18px;
}

.timeline-title-line {
  min-width: 0;
  gap: 8px;
  flex-wrap: wrap;
}

.timeline-title-line strong {
  min-width: 0;
  overflow: hidden;
  color: #111827;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-title-line b {
  color: #047857;
  font-size: 14px;
}

.timeline-title-line time {
  margin-left: auto;
  color: #6b7280;
  font-size: 13px;
}

.timeline-content {
  margin-top: 7px !important;
  overflow-wrap: anywhere;
  color: #4b5563;
  font-size: 14px;
  line-height: 22px;
  white-space: pre-line;
}

.timeline-foot {
  min-height: 25px;
  margin-top: 5px;
  gap: 10px;
  color: #94a3b8;
  font-size: 13px;
}

.detail-table {
  width: 100%;
  font-size: 14px;
}

.detail-table :deep(th.el-table__cell) {
  height: 44px;
  color: #374151;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 700;
}

.detail-table :deep(td.el-table__cell) {
  height: 52px;
  color: #374151;
}

.detail-table small {
  display: block;
  margin-top: 3px;
  overflow: hidden;
  color: #6b7280;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount-danger { color: #b91c1c; font-weight: 700; }

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
  border-top: 1px solid #e5e7eb;
  border-left: 1px solid #e5e7eb;
}

.profile-grid > div {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  min-height: 50px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.profile-grid dt,
.profile-grid dd {
  display: flex;
  align-items: center;
  min-width: 0;
  margin: 0;
  padding: 10px 12px;
  box-sizing: border-box;
}

.profile-grid dt {
  color: #64748b;
  background: #f8fafc;
  font-size: 14px;
  font-weight: 600;
}

.profile-grid dd {
  overflow: hidden;
  color: #1f2937;
  font-size: 14px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 资料页方案1:分组卡片 */
.profile-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #ffffff;
  padding: 12px 14px 14px;
  margin-bottom: 12px;
}
.profile-card-head {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}
.profile-card-head .el-icon {
  color: var(--el-color-primary);
  font-size: 16px;
}
.profile-card-head h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}
.profile-card-count {
  margin-left: auto;
  color: #94a3b8;
  font-size: 12px;
}

/* 工商信息:地址/经营范围整行展示并允许换行 */
.profile-grid-full {
  grid-template-columns: 1fr;
  border-top: none;
}
.profile-grid dd.wrap-text {
  white-space: normal;
  word-break: break-all;
  line-height: 1.5;
}

/* 时间线内嵌录音播放器 */
.timeline-audio {
  width: 100%;
  height: 34px;
  margin-top: 8px;
}

.contacts-heading {
  justify-content: space-between;
  margin: 22px 0 10px;
}

.contacts-heading span {
  color: #6b7280;
  font-size: 13px;
}

.primary-contact { margin-left: 7px; }

@media (max-width: 1100px) {
  .customer-hero { flex-wrap: wrap; }
  .hero-actions { width: 100%; justify-content: flex-start; padding-left: 72px; }
  .metric-band { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .metric-band > div { min-height: 66px; margin: 5px 0; }
  .metric-band > div:nth-child(4) { border-right: 0; }
  .follow-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 720px) {
  :global(.customer-360-drawer .el-drawer__header) { min-height: 64px; padding: 12px 16px; }
  .drawer-title p { display: none; }
  .customer360-shell { padding: 16px 14px 24px; }
  .customer-avatar { flex-basis: 48px; height: 48px; font-size: 20px; }
  .customer-name-line h3 { font-size: 18px; line-height: 26px; }
  .customer-contact-line { gap: 8px 12px; }
  .customer-meta-line { gap: 5px 12px; }
  .hero-actions { padding-left: 0; }
  .hero-actions :deep(.el-button) { flex: 1 1 auto; }
  .hero-actions .icon-command { flex: 0 0 40px; }
  .metric-band { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .metric-band > div { border-right: 1px solid #e5e7eb; }
  .metric-band > div:nth-child(even) { border-right: 0; }
  .next-action-band { flex-wrap: wrap; }
  .next-action-band time { width: 100%; padding-left: 48px; }
  .inline-follow { padding: 15px 13px; }
  .follow-grid,
  .follow-grid-bottom { grid-template-columns: 1fr; }
  .customer-tabs :deep(.el-tabs__item) { padding: 0 11px; font-size: 14px; }
  .timeline-row { grid-template-columns: 42px minmax(0, 1fr); }
  .timeline-title-line time { width: 100%; margin-left: 0; }
  .profile-grid { grid-template-columns: 1fr; }
}
</style>

<template>
  <div class="rule-page" v-loading="loading">
    <header class="page-head">
      <div>
        <div class="eyebrow">销售体系 / 业务规则</div>
        <h1>公海私海规则</h1>
        <p>统一管理客户领取、录入、私海容量、保护期和自动回收。</p>
      </div>
      <div class="head-actions">
        <el-button :icon="ArrowLeft" @click="goBack">返回工作台</el-button>
        <el-button :icon="Refresh" @click="loadAll">刷新</el-button>
        <el-button v-if="overview.canManage" type="primary" :icon="EditPen" @click="startEdit">
          修改规则
        </el-button>
      </div>
    </header>

    <section v-if="activeRule" class="status-bar">
      <div class="status-main">
        <span class="status-dot"></span>
        <strong>当前生效 V{{ activeRule.versionNo }}</strong>
        <el-tag type="success" effect="light">运行中</el-tag>
        <span>{{ formatTime(activeRule.effectiveTime) }} 起执行</span>
      </div>
      <div class="status-note">
        规则变更只影响后续操作，不会批量改动现有客户归属。
      </div>
    </section>

    <el-tabs v-model="activeTab" class="main-tabs">
      <el-tab-pane label="规则总览" name="overview">
        <div v-if="activeRule" class="summary-grid">
          <article class="summary-card blue">
            <div class="card-label">领取与录入</div>
            <strong>{{ activeRule.dailyClaimLimit }}</strong><span>条 / 人 / 日领取</span>
            <div class="card-lines">
              <span>单次领取 {{ activeRule.singleClaimLimit }} 条</span>
              <span>每日手工录入 {{ activeRule.dailyManualEntryLimit }} 条</span>
              <span>单次导入 {{ activeRule.singleImportLimit }} 条</span>
              <span>每日导入 {{ activeRule.dailyImportLimit }} 条</span>
            </div>
          </article>
          <article class="summary-card green">
            <div class="card-label">私海容量</div>
            <strong>{{ activeRule.privateHoldingLimit }}</strong><span>条 / 人</span>
            <div class="card-lines">
              <span>达到 {{ activeRule.privateWarningPercent }}% 开始预警</span>
              <span>领取和分配均检查容量</span>
              <span>超限由后端直接拒绝</span>
            </div>
          </article>
          <article class="summary-card amber">
            <div class="card-label">保护与回收</div>
            <strong>{{ activeRule.protectionDays }}</strong><span>天保护期</span>
            <div class="card-lines">
              <span>{{ activeRule.recycleNoFollowDays }} 天未跟进自动回收</span>
              <span>提前 {{ activeRule.recycleWarningDays }} 天提醒</span>
              <span>释放后冷却 {{ activeRule.releaseCooldownDays }} 天</span>
            </div>
          </article>
          <article class="summary-card red">
            <div class="card-label">风险控制</div>
            <strong>{{ enabledText(activeRule.duplicateBlockEnabled) }}</strong><span>重复客户拦截</span>
            <div class="card-lines">
              <span>按公司名、信用代码、电话查重</span>
              <span>正式客户不重复进入线索池</span>
              <span>所有版本保留发布记录</span>
            </div>
          </article>
        </div>

        <section class="usage-panel">
          <div class="section-title">
            <div><h2>今日个人用量</h2><p>销售只看自己的额度，老板可在规则页查看全局规则。</p></div>
          </div>
          <div class="usage-grid">
            <div class="usage-item">
              <span>已领取</span><strong>{{ overview.todayClaimed }}</strong>
              <el-progress :percentage="usageRate(overview.todayClaimed, activeRule?.dailyClaimLimit)" :show-text="false" />
              <small>上限 {{ activeRule?.dailyClaimLimit || 0 }}</small>
            </div>
            <div class="usage-item">
              <span>已手工录入</span><strong>{{ overview.todayManualEntered }}</strong>
              <el-progress :percentage="usageRate(overview.todayManualEntered, activeRule?.dailyManualEntryLimit)" :show-text="false" />
              <small>上限 {{ activeRule?.dailyManualEntryLimit || 0 }}</small>
            </div>
            <div class="usage-item">
              <span>已批量导入</span><strong>{{ overview.todayImported }}</strong>
              <el-progress :percentage="usageRate(overview.todayImported, activeRule?.dailyImportLimit)" :show-text="false" />
              <small>上限 {{ activeRule?.dailyImportLimit || 0 }}</small>
            </div>
          </div>
        </section>

        <section class="plain-panel">
          <div class="section-title">
            <div><h2>新人怎么理解</h2><p>把公海私海看成一条客户流转线。</p></div>
          </div>
          <div class="simple-flow">
            <div><b>1</b><strong>进入公海</strong><span>录入、导入、释放或回收</span></div>
            <i>→</i>
            <div><b>2</b><strong>领取到私海</strong><span>检查每日额度和个人容量</span></div>
            <i>→</i>
            <div><b>3</b><strong>持续跟进</strong><span>每次有效跟进会顺延保护期</span></div>
            <i>→</i>
            <div><b>4</b><strong>成交或回收</strong><span>成交转客户，长期不跟进回公海</span></div>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="配置向导" name="wizard">
        <section class="wizard-panel">
          <el-alert v-if="!overview.canManage" type="info" :closable="false"
            title="当前账号可查看规则，但只有老板或超级管理员可以修改和发布。" />
          <el-steps :active="step" finish-status="success" align-center>
            <el-step title="领取与录入" />
            <el-step title="私海容量" />
            <el-step title="保护与回收" />
            <el-step title="确认发布" />
          </el-steps>

          <div class="wizard-content">
            <div v-if="step === 0" class="form-stage">
              <h2>领取与录入数量</h2>
              <p>限制单个销售一天能拿多少、录多少，避免抢占过多资源。</p>
              <p class="limit-hint">单次上限可直接输入；如高于对应每日上限，保存时会提示先同步提高每日上限。</p>
              <div class="field-grid">
                <rule-number v-model="form.dailyClaimLimit" label="每日领取上限" unit="条 / 人 / 日" :min="1" :max="10000" />
                <rule-number v-model="form.singleClaimLimit" label="单次领取上限" unit="条 / 次" :min="1" :max="MAX_SINGLE_CLAIM_LIMIT" />
                <rule-number v-model="form.dailyManualEntryLimit" label="每日手工录入上限" unit="条 / 人 / 日" :min="1" :max="10000" />
                <rule-number v-model="form.singleImportLimit" label="单次批量导入上限" unit="条 / 次" :min="1" :max="MAX_SINGLE_IMPORT_LIMIT" />
                <rule-number v-model="form.dailyImportLimit" label="每日批量导入上限" unit="条 / 人 / 日" :min="1" :max="100000" />
              </div>
            </div>
            <div v-else-if="step === 1" class="form-stage">
              <h2>私海容量</h2>
              <p>客户被领取或分配后进入个人私海，满额后必须先跟进、成交或释放。</p>
              <div class="field-grid">
                <rule-number v-model="form.privateHoldingLimit" label="个人私海容量" unit="条 / 人" :min="1" :max="10000" />
                <rule-number v-model="form.privateWarningPercent" label="容量预警线" unit="%" :min="50" :max="100" />
              </div>
              <el-alert type="warning" :closable="false" title="降低容量前请先运行影响模拟，超量员工不会被自动删客户，但将无法继续领取或被分配。" />
            </div>
            <div v-else-if="step === 2" class="form-stage">
              <h2>保护与自动回收</h2>
              <p>跟进中的客户有保护期，长期不跟进才会回公海，防止客户被长期占住。</p>
              <div class="field-grid">
                <rule-number v-model="form.protectionDays" label="客户保护期" unit="天" :min="1" :max="365" />
                <rule-number v-model="form.recycleNoFollowDays" label="未跟进回收" unit="天" :min="1" :max="365" />
                <rule-number v-model="form.recycleWarningDays" label="回收前预警" unit="天" :min="1" :max="30" />
                <rule-number v-model="form.releaseCooldownDays" label="释放后冷却" unit="天" :min="0" :max="365" />
              </div>
              <div class="switch-row">
                <div><strong>重复客户拦截</strong><span>新建线索时检查公司名、信用代码和联系电话。</span></div>
                <el-switch v-model="form.duplicateBlockEnabled" />
              </div>
            </div>
            <div v-else class="form-stage review-stage">
              <h2>确认并发布</h2>
              <p>建议先模拟，再保存草稿，默认次日 00:00 生效，避免工作中途改变口径。</p>
              <el-input v-model="form.changeSummary" maxlength="255" show-word-limit
                placeholder="请简要说明为什么调整，例如：新人入职，统一每日领取与录入规则" />
              <div class="review-grid">
                <span>领取 {{ form.dailyClaimLimit }}/日</span>
                <span>录入 {{ form.dailyManualEntryLimit }}/日</span>
                <span>私海 {{ form.privateHoldingLimit }}/人</span>
                <span>保护 {{ form.protectionDays }} 天</span>
                <span>未跟进 {{ form.recycleNoFollowDays }} 天回收</span>
                <span>查重 {{ form.duplicateBlockEnabled ? '开启' : '关闭' }}</span>
              </div>
            </div>
          </div>

          <footer class="wizard-actions">
            <el-button :disabled="step === 0" @click="step--">上一步</el-button>
            <el-button v-if="step < 3" type="primary" @click="step++">下一步</el-button>
            <template v-else-if="overview.canManage">
              <el-button :icon="View" :loading="simulating" @click="runSimulation">影响模拟</el-button>
              <el-button type="primary" :loading="saving" @click="saveDraft">保存草稿</el-button>
            </template>
          </footer>
        </section>
      </el-tab-pane>

      <el-tab-pane label="客户流转" name="flow">
        <section class="flow-panel">
          <div class="flow-row">
            <div class="flow-node source"><span>01</span><strong>客户进入</strong><p>手工录入、批量导入、公司公海</p></div>
            <div class="flow-arrow">→<small>数量与查重校验</small></div>
            <div class="flow-node pool"><span>02</span><strong>公司公海</strong><p>待领取、待分配、可重新流转</p></div>
            <div class="flow-arrow">→<small>领取与容量校验</small></div>
            <div class="flow-node private"><span>03</span><strong>销售私海</strong><p>负责人持续跟进，保护期内锁定</p></div>
            <div class="flow-arrow">→<small>跟进结果</small></div>
            <div class="flow-node finish"><span>04</span><strong>成交 / 回收</strong><p>成交进入客户库，超期返回公海</p></div>
          </div>
          <div class="flow-rules">
            <article><strong>领取时</strong><p>先检查今日领取量，再检查个人私海是否有空位，两项都通过才成功。</p></article>
            <article><strong>跟进时</strong><p>写入有效跟进后，客户保护期从当天重新计算，不会误回收活跃客户。</p></article>
            <article><strong>回收时</strong><p>必须同时满足保护期已过且连续未跟进；任务按租户分别读取规则。</p></article>
            <article><strong>释放后</strong><p>原负责人进入冷却期，避免刚释放又立即抢回同一客户。</p></article>
          </div>
        </section>
      </el-tab-pane>

      <el-tab-pane label="公海池" name="pools">
        <section class="plain-panel">
          <div class="section-title">
            <div><h2>公海池</h2><p>池决定客户放在哪里，规则决定客户怎么流转。</p></div>
            <el-button v-if="overview.canManage" type="primary" :icon="Plus" @click="openPoolDialog()">新增池</el-button>
          </div>
          <el-table :data="pools" v-loading="loadingPools" class="data-table">
            <el-table-column prop="poolName" label="池名称" min-width="180" />
            <el-table-column label="类型" width="140"><template #default="{ row }"><el-tag effect="plain">{{ poolTypeText(row.poolType) }}</el-tag></template></el-table-column>
            <el-table-column prop="description" label="用途说明" min-width="260" show-overflow-tooltip />
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.status === 0 ? 'success' : 'info'">{{ row.status === 0 ? '启用' : '停用' }}</el-tag></template></el-table-column>
            <el-table-column v-if="overview.canManage" label="操作" width="100" fixed="right"><template #default="{ row }"><el-button link type="primary" @click="openPoolDialog(row)">编辑</el-button></template></el-table-column>
          </el-table>
        </section>
      </el-tab-pane>

      <el-tab-pane label="版本记录" name="versions">
        <section class="plain-panel">
          <div class="section-title"><div><h2>版本记录</h2><p>每次发布都保留口径、说明、发布时间和生效时间。</p></div></div>
          <el-table :data="overview.versions" class="data-table">
            <el-table-column label="版本" width="90"><template #default="{ row }"><strong>V{{ row.versionNo }}</strong></template></el-table-column>
            <el-table-column label="状态" width="110"><template #default="{ row }"><el-tag :type="statusType(row.status)">{{ statusText(row.status) }}</el-tag></template></el-table-column>
            <el-table-column prop="changeSummary" label="变更说明" min-width="240" show-overflow-tooltip />
            <el-table-column label="领取 / 私海" width="180"><template #default="{ row }">{{ row.dailyClaimLimit }} / {{ row.privateHoldingLimit }}</template></el-table-column>
            <el-table-column label="保护 / 回收" width="180"><template #default="{ row }">{{ row.protectionDays }}天 / {{ row.recycleNoFollowDays }}天</template></el-table-column>
            <el-table-column label="生效时间" width="190"><template #default="{ row }">{{ formatTime(row.effectiveTime) }}</template></el-table-column>
          </el-table>
        </section>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="simulationVisible" title="规则影响模拟" width="min(680px, 92vw)">
      <div v-if="simulation" class="simulation-result">
        <el-alert type="info" :closable="false" title="本次只是读取和计算，不会修改任何客户或员工数据。" />
        <div><span>超过新私海容量的员工</span><strong>{{ simulation.ownersOverHolding }} 人</strong></div>
        <div><span>按新回收规则预计进入回收范围</span><strong>{{ simulation.recycleCandidates }} 条</strong></div>
        <p>建议生效时间：{{ formatTime(simulation.effectiveTime) }}</p>
      </div>
      <template #footer>
        <el-button @click="simulationVisible = false">关闭</el-button>
        <el-button type="primary" @click="simulationVisible = false">我已了解</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="publishVisible" title="发布规则" width="min(520px, 92vw)">
      <el-radio-group v-model="publishMode" class="publish-options">
        <el-radio value="NEXT_DAY" border>次日 00:00 生效（推荐）</el-radio>
        <el-radio value="IMMEDIATE" border>立即生效</el-radio>
      </el-radio-group>
      <el-alert type="warning" :closable="false" title="立即生效会影响正在领取、录入和分配的销售，请避开高峰时段。" />
      <template #footer>
        <el-button @click="publishVisible = false">取消</el-button>
        <el-button type="primary" :loading="publishing" @click="publishDraft">确认发布</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="poolDialog.visible" :title="poolDialog.editing ? '编辑公海池' : '新增公海池'" width="min(560px, 92vw)">
      <el-form :model="poolForm" label-width="100px">
        <el-form-item label="池名称"><el-input v-model="poolForm.poolName" /></el-form-item>
        <el-form-item label="池类型"><el-select v-model="poolForm.poolType" style="width:100%"><el-option v-for="item in poolTypes" :key="item.value" :label="item.label" :value="item.value" /></el-select></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="poolForm.sortOrder" :min="1" :max="99" /></el-form-item>
        <el-form-item label="用途说明"><el-input v-model="poolForm.description" type="textarea" :rows="3" maxlength="255" show-word-limit /></el-form-item>
        <el-form-item v-if="poolDialog.editing" label="状态"><el-switch v-model="poolForm.status" :active-value="0" :inactive-value="1" active-text="启用" inactive-text="停用" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="poolDialog.visible=false">取消</el-button><el-button type="primary" :loading="savingPool" @click="savePool">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, EditPen, Plus, Refresh, View } from '@element-plus/icons-vue'
import { poolConfigApi, poolRuleApi, type PoolConfig, type PoolRuleOverview, type PoolRuleSimulation, type PoolRuleVersion } from '@/api/crm'

const RuleNumber = defineComponent({
  name: 'RuleNumber',
  props: { modelValue: Number, label: String, unit: String, min: Number, max: Number },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('label', { class: 'rule-field' }, [
      h('span', props.label),
      h('div', { class: 'number-wrap' }, [
        h(resolveComponent('el-input-number') as any, {
          modelValue: props.modelValue, min: props.min, max: props.max, controlsPosition: 'right',
          'onUpdate:modelValue': (value: number) => emit('update:modelValue', value)
        }),
        h('em', props.unit)
      ])
    ])
  }
})

import { resolveComponent } from 'vue'

const router = useRouter()
const MAX_SINGLE_CLAIM_LIMIT = 10000
const MAX_SINGLE_IMPORT_LIMIT = 100000
const activeTab = ref('overview')
const loading = ref(false)
const loadingPools = ref(false)
const overview = reactive<PoolRuleOverview>({
  active: null as unknown as PoolRuleVersion, canManage: false,
  todayClaimed: 0, todayManualEntered: 0, todayImported: 0, versions: []
})
const activeRule = computed(() => overview.active)
const pools = ref<PoolConfig[]>([])
const step = ref(0)
const saving = ref(false)
const simulating = ref(false)
const publishing = ref(false)
const simulationVisible = ref(false)
const publishVisible = ref(false)
const publishMode = ref<'NEXT_DAY' | 'IMMEDIATE'>('NEXT_DAY')
const simulation = ref<PoolRuleSimulation | null>(null)
const draftId = ref<number>()

const defaults = (): PoolRuleVersion => ({
  versionNo: 1, status: 'DRAFT', dailyClaimLimit: 1000, singleClaimLimit: 1000,
  dailyManualEntryLimit: 1000, singleImportLimit: 1000, dailyImportLimit: 10000,
  privateHoldingLimit: 1000, privateWarningPercent: 90, protectionDays: 15,
  recycleNoFollowDays: 15, recycleWarningDays: 3, releaseCooldownDays: 15,
  duplicateBlockEnabled: true, changeSummary: ''
})
const form = reactive<PoolRuleVersion>(defaults())

const loadAll = async () => {
  loading.value = true
  try {
    const data = await poolRuleApi.overview()
    Object.assign(overview, data)
    await loadPools()
  } catch (error: any) {
    ElMessage.error(error?.message || '规则读取失败')
  } finally { loading.value = false }
}

const loadPools = async () => {
  loadingPools.value = true
  try { pools.value = await poolConfigApi.list() } finally { loadingPools.value = false }
}

const startEdit = () => {
  Object.assign(form, defaults(), activeRule.value || {})
  form.id = undefined
  form.status = 'DRAFT'
  form.duplicateBlockEnabled = enabled(activeRule.value?.duplicateBlockEnabled)
  form.changeSummary = ''
  draftId.value = undefined
  step.value = 0
  activeTab.value = 'wizard'
}

const runSimulation = async () => {
  simulating.value = true
  try {
    simulation.value = await poolRuleApi.simulate(form)
    simulationVisible.value = true
  } catch (error: any) { ElMessage.error(error?.message || '影响模拟失败') }
  finally { simulating.value = false }
}

const saveDraft = async () => {
  if (!form.changeSummary?.trim()) { ElMessage.warning('请填写变更说明'); return }
  saving.value = true
  try {
    const draft = await poolRuleApi.saveDraft({ ...form, id: draftId.value })
    draftId.value = draft.id
    ElMessage.success('草稿已保存，发布后才会生效')
    publishVisible.value = true
  } catch (error: any) { ElMessage.error(error?.message || '草稿保存失败') }
  finally { saving.value = false }
}

const publishDraft = async () => {
  if (!draftId.value) return
  publishing.value = true
  try {
    await poolRuleApi.publish(draftId.value, publishMode.value)
    ElMessage.success(publishMode.value === 'NEXT_DAY' ? '规则已安排次日生效' : '规则已立即生效')
    publishVisible.value = false
    activeTab.value = 'overview'
    await loadAll()
  } catch (error: any) { ElMessage.error(error?.message || '规则发布失败') }
  finally { publishing.value = false }
}

const poolTypes = [
  { value: 'collaboration', label: '协作公海' }, { value: 'telemarketing', label: '电销公海' },
  { value: 'online', label: '线上公海' }, { value: 'new_leads', label: '新线索池' },
  { value: 'recycle', label: '回收池' }, { value: 'treasure', label: '宝藏池' },
  { value: 'frozen', label: '冷冻 / 私池' }
]
const poolTypeText = (value: string) => poolTypes.find(item => item.value === value)?.label || value
const poolDialog = reactive({ visible: false, editing: false })
const savingPool = ref(false)
const poolForm = reactive<Partial<PoolConfig>>({})
const openPoolDialog = (row?: PoolConfig) => {
  Object.assign(poolForm, { id: undefined, poolName: '', poolType: 'collaboration', sortOrder: pools.value.length + 1, description: '', status: 0 }, row || {})
  poolDialog.editing = Boolean(row)
  poolDialog.visible = true
}
const savePool = async () => {
  if (!poolForm.poolName?.trim()) { ElMessage.warning('请填写池名称'); return }
  savingPool.value = true
  try {
    if (poolDialog.editing) await poolConfigApi.update(poolForm)
    else await poolConfigApi.create(poolForm)
    ElMessage.success('公海池已保存')
    poolDialog.visible = false
    await loadPools()
  } catch (error: any) { ElMessage.error(error?.message || '公海池保存失败') }
  finally { savingPool.value = false }
}

const enabled = (value: unknown) => value === true || value === 1
const enabledText = (value: unknown) => enabled(value) ? '已开启' : '已关闭'
const usageRate = (used: number, limit?: number) => !limit ? 0 : Math.min(100, Math.round(used * 100 / limit))
const formatTime = (value?: string) => value ? value.replace('T', ' ').slice(0, 16) : '未设置'
const statusText = (value: string) => ({ ACTIVE: '生效中', SCHEDULED: '待生效', DRAFT: '草稿', ARCHIVED: '历史版本' } as Record<string, string>)[value] || value
const statusType = (value: string): 'success' | 'warning' | 'info' | 'primary' => ({ ACTIVE: 'success', SCHEDULED: 'warning', DRAFT: 'primary', ARCHIVED: 'info' } as const)[value as 'ACTIVE'] || 'info'
const goBack = () => router.push('/customer/workbench')

onMounted(loadAll)
</script>

<style scoped lang="scss">
.rule-page { min-height: 100%; padding: 24px 28px 40px; background: #f5f7fa; color: #1f2937; }
.page-head { display:flex; justify-content:space-between; gap:24px; align-items:flex-start; margin-bottom:18px; }
.eyebrow { color:#6b7280; font-size:14px; margin-bottom:6px; }
h1 { margin:0; font-size:28px; line-height:1.3; letter-spacing:0; }
.page-head p, .section-title p, .form-stage>p { margin:6px 0 0; color:#6b7280; font-size:14px; }
.head-actions { display:flex; gap:10px; flex-wrap:wrap; }
.status-bar { display:flex; justify-content:space-between; align-items:center; gap:20px; min-height:60px; padding:0 18px; background:#fff; border:1px solid #dbe4f0; border-radius:8px; }
.status-main { display:flex; align-items:center; gap:10px; font-size:14px; }
.status-dot { width:9px; height:9px; border-radius:50%; background:#16a34a; box-shadow:0 0 0 4px #dcfce7; }
.status-note { color:#64748b; font-size:13px; }
.main-tabs { margin-top:18px; }
:deep(.el-tabs__header) { margin-bottom:18px; }
:deep(.el-tabs__item) { height:46px; font-size:16px; padding:0 22px; }
.summary-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; }
.summary-card { min-height:210px; padding:20px; background:#fff; border:1px solid #e1e7ef; border-top:3px solid #2563eb; border-radius:8px; }
.summary-card.green { border-top-color:#059669; }.summary-card.amber { border-top-color:#d97706; }.summary-card.red { border-top-color:#dc2626; }
.card-label { font-weight:700; font-size:16px; margin-bottom:18px; }
.summary-card>strong { font-size:34px; line-height:1; margin-right:6px; color:#0f172a; }
.summary-card>span { color:#64748b; font-size:14px; }
.card-lines { display:flex; flex-direction:column; gap:8px; margin-top:20px; padding-top:16px; border-top:1px solid #eef2f6; color:#475569; font-size:13px; }
.usage-panel,.plain-panel,.wizard-panel,.flow-panel { margin-top:16px; padding:22px; background:#fff; border:1px solid #e1e7ef; border-radius:8px; }
.section-title { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px; }
.section-title h2,.form-stage h2 { margin:0; font-size:20px; letter-spacing:0; }
.limit-hint { color:#2563eb !important; }
.usage-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.usage-item { position:relative; padding:16px; border:1px solid #e5e7eb; border-radius:6px; }
.usage-item span { color:#64748b; font-size:14px; }.usage-item strong { display:block; margin:6px 0 12px; font-size:26px; }.usage-item small { display:block; margin-top:8px; color:#94a3b8; }
.simple-flow { display:grid; grid-template-columns:1fr auto 1fr auto 1fr auto 1fr; align-items:center; gap:14px; }
.simple-flow>div { min-height:100px; padding:16px; border:1px solid #dfe6ef; border-radius:6px; }
.simple-flow b { display:inline-grid; place-items:center; width:26px; height:26px; border-radius:50%; background:#e8f0ff; color:#1d4ed8; margin-right:8px; }
.simple-flow strong { font-size:15px; }.simple-flow span { display:block; margin-top:12px; color:#64748b; font-size:13px; line-height:1.6; }.simple-flow i { color:#94a3b8; font-style:normal; }
.wizard-panel { margin-top:0; }.wizard-content { min-height:370px; margin-top:28px; padding:26px; background:#f8fafc; border:1px solid #e5eaf1; border-radius:8px; }
.field-grid { display:grid; grid-template-columns:repeat(2,minmax(280px,1fr)); gap:18px; margin-top:24px; }
:deep(.rule-field) { display:block; padding:16px; background:#fff; border:1px solid #dfe6ef; border-radius:6px; }
:deep(.rule-field>span) { display:block; margin-bottom:10px; font-size:15px; font-weight:600; }
:deep(.number-wrap) { display:flex; align-items:center; gap:12px; }
:deep(.number-wrap .el-input-number) { width:180px; }
:deep(.number-wrap em) { color:#64748b; font-size:13px; font-style:normal; }
.switch-row { display:flex; align-items:center; justify-content:space-between; margin-top:18px; padding:16px; background:#fff; border:1px solid #dfe6ef; border-radius:6px; }
.switch-row span { display:block; margin-top:5px; color:#64748b; font-size:13px; }
.review-stage :deep(.el-input) { margin-top:22px; }.review-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; margin-top:18px; }.review-grid span { padding:14px; background:#fff; border:1px solid #dfe6ef; border-radius:6px; }
.wizard-actions { display:flex; justify-content:flex-end; gap:10px; margin-top:20px; }
.flow-panel { margin-top:0; }.flow-row { display:grid; grid-template-columns:1fr 120px 1fr 120px 1fr 120px 1fr; align-items:center; gap:8px; }
.flow-node { min-height:150px; padding:20px; border:1px solid #cbd5e1; border-top:4px solid #2563eb; border-radius:8px; }.flow-node.pool { border-top-color:#d97706; }.flow-node.private { border-top-color:#7c3aed; }.flow-node.finish { border-top-color:#059669; }
.flow-node span { color:#94a3b8; font-size:13px; }.flow-node strong { display:block; margin:18px 0 8px; font-size:18px; }.flow-node p { margin:0; color:#64748b; font-size:13px; line-height:1.7; }
.flow-arrow { text-align:center; color:#2563eb; font-size:24px; }.flow-arrow small { display:block; margin-top:8px; color:#64748b; font-size:12px; }
.flow-rules { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-top:24px; }.flow-rules article { padding:16px; background:#f8fafc; border:1px solid #e5eaf1; border-radius:6px; }.flow-rules p { margin:8px 0 0; color:#64748b; font-size:13px; line-height:1.7; }
.data-table { width:100%; }.simulation-result { display:grid; gap:14px; }.simulation-result>div { display:flex; justify-content:space-between; padding:16px; background:#f8fafc; border-radius:6px; }.simulation-result strong { font-size:20px; }.simulation-result p { color:#64748b; }
.publish-options { display:grid; gap:12px; margin-bottom:18px; }.publish-options :deep(.el-radio) { margin:0; height:46px; }
@media (max-width: 1440px) { .summary-grid { grid-template-columns:repeat(2,1fr); }.flow-row { grid-template-columns:1fr 60px 1fr 60px 1fr 60px 1fr; }.flow-rules { grid-template-columns:repeat(2,1fr); } }
@media (max-width: 900px) { .rule-page { padding:18px; }.page-head,.status-bar { flex-direction:column; align-items:flex-start; padding:16px; }.summary-grid,.usage-grid,.field-grid,.review-grid,.flow-rules { grid-template-columns:1fr; }.simple-flow,.flow-row { grid-template-columns:1fr; }.simple-flow>i,.flow-arrow { transform:rotate(90deg); }.head-actions { width:100%; } }
</style>

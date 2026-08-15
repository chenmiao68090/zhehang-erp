<template>
  <div class="collision-page">
    <section class="page-heading">
      <div>
        <p class="eyebrow">SALES DATA GOVERNANCE</p>
        <h1>防撞单记录</h1>
        <p>查看真实撞单日志并记录主管仲裁结论。</p>
      </div>
      <!-- 公海私海规则页仅 admin/boss 可达,manager 也能进本页,按钮按角色显隐防跳空白 -->
      <el-button v-if="canOpenPoolRules" @click="router.push('/sys-flow/pool-admin')">公海私海规则</el-button>
    </section>

    <el-alert
      type="warning"
      :closable="false"
      show-icon
      title="本页只记录仲裁结论，不会自动修改客户归属、合并客户或建立协作关系。需要变更归属时，请在对应客户流程中另行操作。"
    />

    <el-card shadow="never" class="rule-card">
      <template #header>
        <div class="card-title">
          <span>系统当前查重口径</span>
          <el-tag type="info" effect="plain">全部为精确匹配</el-tag>
        </div>
      </template>
      <div class="rule-grid">
        <div v-for="rule in rules" :key="rule.level" class="rule-item">
          <strong>{{ rule.level }}</strong>
          <div>
            <b>{{ rule.title }}</b>
            <p>{{ rule.description }}</p>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="never">
      <template #header>
        <div class="card-title">
          <span>撞单日志</span>
          <div class="header-actions">
            <span class="summary">共 {{ total }} 条；本页待处理 {{ pendingOnPage }} 条</span>
            <el-button :loading="loading" @click="fetchRecords">刷新</el-button>
          </div>
        </div>
      </template>

      <el-alert
        v-if="loadError"
        class="load-error"
        type="error"
        :closable="false"
        show-icon
        :title="loadError"
      />

      <el-table v-loading="loading" :data="records" empty-text="暂无撞单记录">
        <el-table-column prop="leadName" label="线索" min-width="160">
          <template #default="{ row }">{{ row.leadName || `线索 #${row.leadId}` }}</template>
        </el-table-column>
        <el-table-column label="相关人员" min-width="210">
          <template #default="{ row }">
            <div>{{ actorLabel(row.userAName, row.userAId) }}</div>
            <div class="muted">与 {{ actorLabel(row.userBName, row.userBId) }}</div>
          </template>
        </el-table-column>
        <el-table-column label="冲突来源" min-width="140">
          <template #default="{ row }">{{ conflictLabel(row.conflictType) }}</template>
        </el-table-column>
        <el-table-column label="匹配字段" min-width="130">
          <template #default="{ row }">{{ matchFieldLabel(row.matchField) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'warning'">
              {{ row.status === 1 ? '已记录结论' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="记录时间" min-width="165" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status !== 1" link type="primary" @click="openResolve(row)">记录仲裁</el-button>
            <el-button v-else link @click="openDetail(row)">查看结论</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchRecords"
        />
      </div>
    </el-card>

    <el-dialog v-model="resolveVisible" title="记录撞单仲裁结论" width="560px">
      <el-alert
        type="info"
        :closable="false"
        title="保存后只形成可追溯记录，不会自动执行客户归属、合并或协作变更。"
      />
      <el-form label-position="top" class="resolve-form">
        <el-form-item label="仲裁结论">
          <el-select v-model="resolveForm.resolution" style="width: 100%">
            <el-option label="A 方继续跟进（仅记录）" value="keep_a" />
            <el-option label="B 方继续跟进（仅记录）" value="keep_b" />
            <el-option label="建议合并（仅记录）" value="merge" />
            <el-option label="建议双方协作（仅记录）" value="cooperate" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理说明（必填）">
          <el-input v-model="resolveForm.detail" type="textarea" :rows="4" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="resolveVisible = false">取消</el-button>
        <el-button type="primary" :loading="resolving" @click="confirmResolve">保存结论</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="仲裁记录" width="520px">
      <el-descriptions v-if="active" :column="1" border>
        <el-descriptions-item label="线索">{{ active.leadName || `线索 #${active.leadId}` }}</el-descriptions-item>
        <el-descriptions-item label="仲裁结论">{{ resolutionLabel(active.resolution) }}</el-descriptions-item>
        <el-descriptions-item label="处理说明">{{ active.resolutionDetail || '未填写' }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ active.resolvedTime || '未记录' }}</el-descriptions-item>
      </el-descriptions>
      <template #footer><el-button @click="detailVisible = false">关闭</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { collisionApi, type CollisionRecord } from '@/api/crm'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
// 公海私海规则页 roles=['admin','boss'],其余角色跳过去是未注册路由(空白页)
const canOpenPoolRules = computed(() => ['admin', 'boss'].some((r) => (userStore.roles || []).includes(r)))
const rules = [
  { level: 'P0', title: '统一社会信用代码', description: '信用代码完全一致时命中。' },
  { level: 'P1', title: '公司名称', description: '公司名称完全一致时命中。' },
  { level: 'P2', title: '联系电话', description: '联系电话完全一致时命中。' },
  { level: 'P3', title: '联系人姓名', description: '联系人姓名完全一致时命中。' }
]

const records = ref<CollisionRecord[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 20
const loading = ref(false)
const loadError = ref('')
const pendingOnPage = computed(() => records.value.filter(item => item.status !== 1).length)

async function fetchRecords() {
  loading.value = true
  loadError.value = ''
  try {
    const response: any = await collisionApi.getCollisionLog({ pageNum: pageNum.value, pageSize })
    const data = response?.data ?? response
    const rows = data?.records ?? data?.list
    records.value = Array.isArray(rows) ? rows : []
    total.value = Number(data?.total ?? 0)
  } catch (error: any) {
    records.value = []
    total.value = 0
    loadError.value = error?.message || error?.msg || '撞单记录加载失败，请稍后重试。'
  } finally {
    loading.value = false
  }
}

const resolveVisible = ref(false)
const detailVisible = ref(false)
const resolving = ref(false)
const active = ref<CollisionRecord | null>(null)
const resolveForm = reactive({ resolution: 'keep_a', detail: '' })

function openResolve(row: CollisionRecord) {
  active.value = row
  resolveForm.resolution = 'keep_a'
  resolveForm.detail = ''
  resolveVisible.value = true
}

function openDetail(row: CollisionRecord) {
  active.value = row
  detailVisible.value = true
}

async function confirmResolve() {
  if (!active.value) return
  const detail = resolveForm.detail.trim()
  if (!detail) {
    ElMessage.warning('请填写处理说明，便于后续追溯。')
    return
  }
  resolving.value = true
  try {
    await collisionApi.resolveConflict({ id: active.value.id, resolution: resolveForm.resolution, detail })
    resolveVisible.value = false
    ElMessage.success('仲裁结论已记录；系统未自动变更归属或协作关系。')
    await fetchRecords()
  } catch (error: any) {
    ElMessage.error(error?.message || error?.msg || '仲裁结论保存失败。')
  } finally {
    resolving.value = false
  }
}

function actorLabel(name?: string, id?: number) {
  return name || (id ? `账号 #${id}` : '未记录账号')
}

function conflictLabel(value?: string) {
  return ({ claim: '领取冲突', same_time: '同时跟进', cross_channel: '跨渠道重复', duplicate: '重复录入', grab_conflict: '抢单冲突' } as Record<string, string>)[value || ''] || value || '未记录'
}

function matchFieldLabel(value?: string) {
  return ({ creditCode: '统一社会信用代码', name: '公司名称', phone: '联系电话', contactName: '联系人姓名' } as Record<string, string>)[value || ''] || value || '未记录'
}

function resolutionLabel(value?: string) {
  return ({ keep_a: 'A 方继续跟进（记录）', keep_b: 'B 方继续跟进（记录）', merge: '建议合并（记录）', cooperate: '建议双方协作（记录）' } as Record<string, string>)[value || ''] || value || '未记录'
}

fetchRecords()
</script>

<style scoped>
.collision-page { display: flex; flex-direction: column; gap: 18px; padding: 8px 4px 32px; }
.page-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 24px; padding: 24px 28px; border: 1px solid var(--el-border-color-light); border-radius: 12px; background: var(--el-bg-color); }
.page-heading h1 { margin: 4px 0 8px; font-size: 28px; color: var(--el-text-color-primary); }
.page-heading p { margin: 0; color: var(--el-text-color-secondary); }
.page-heading .eyebrow { color: var(--el-color-warning); font-size: 12px; letter-spacing: 0.12em; }
.card-title, .header-actions { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.summary, .muted { color: var(--el-text-color-secondary); font-size: 13px; }
.rule-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.rule-item { display: flex; gap: 12px; padding: 14px; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.rule-item > strong { color: var(--el-color-primary); }
.rule-item b { color: var(--el-text-color-primary); }
.rule-item p { margin: 6px 0 0; color: var(--el-text-color-secondary); font-size: 13px; line-height: 1.5; }
.load-error { margin-bottom: 12px; }
.pagination { display: flex; justify-content: flex-end; padding-top: 16px; }
.resolve-form { margin-top: 18px; }
@media (max-width: 1000px) { .rule-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .page-heading, .card-title, .header-actions { align-items: stretch; flex-direction: column; } .rule-grid { grid-template-columns: 1fr; } }
</style>

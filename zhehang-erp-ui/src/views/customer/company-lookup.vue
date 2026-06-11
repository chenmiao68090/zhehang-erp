<template>
  <div class="company-lookup">
    <!-- 合规说明 -->
    <el-alert
      type="info"
      :closable="false"
      show-icon
      class="compliance-tip"
    >
      <template #title>
        <span>企业号码来自<b>工商企业库（公示联系方式）</b>。当前为<b>演示数据源</b>，开通天眼查/企查查官方授权 API 后自动切换为真实数据，本页无需改动。</span>
      </template>
      <div class="compliance-detail">
        仅查询企业对外公示信息，请勿用于骚扰；外呼须遵守《个人信息保护法》《通信短信息/语音呼叫服务管理规定》，建立拒接退订机制。
      </div>
    </el-alert>

    <!-- 查询区 -->
    <div class="search-bar">
      <el-autocomplete
        v-model="keyword"
        :fetch-suggestions="querySuggest"
        placeholder="输入公司名称，如：科技 / 财税 / 浙江两杉"
        clearable
        class="search-input"
        value-key="name"
        @select="onSuggestSelect"
        @keyup.enter="doSearch()"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
        <template #default="{ item }">
          <div class="sug-item">
            <span class="sug-name">{{ item.name }}</span>
            <span class="sug-meta">{{ item.city || item.province }} · {{ item.businessStatus }}</span>
          </div>
        </template>
      </el-autocomplete>
      <el-button type="primary" :loading="loading" @click="doSearch()">
        <el-icon><Search /></el-icon>查询号码
      </el-button>
    </div>

    <!-- 结果区 -->
    <el-empty v-if="searched && !company" description="未在工商库匹配到该企业，换个关键词或开通正规数据接口后重试" />

    <div v-if="company" class="result">
      <!-- 工商资料 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-head">
            <span class="co-name">{{ company.name }}</span>
            <el-tag :type="statusType(company.businessStatus)" size="small">{{ company.businessStatus }}</el-tag>
            <el-tag v-for="t in company.riskTags || []" :key="t" type="danger" size="small" effect="plain">{{ t }}</el-tag>
            <span class="src-tag">来源：{{ company.source || '工商演示库' }}</span>
          </div>
        </template>
        <el-descriptions :column="3" size="small" border>
          <el-descriptions-item label="法人代表">{{ company.legalPerson || '-' }}</el-descriptions-item>
          <el-descriptions-item label="注册资本">{{ company.registeredCapital || '-' }}</el-descriptions-item>
          <el-descriptions-item label="成立日期">{{ company.establishDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="统一信用代码">{{ company.creditCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="行业">{{ company.industry || '-' }}</el-descriptions-item>
          <el-descriptions-item label="人员规模">{{ company.employeeScale || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所在地区" :span="3">
            {{ [company.province, company.city, company.district].filter(Boolean).join(' / ') || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="注册地址" :span="3">{{ company.address || '-' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 联系电话 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-head">
            <span>公示联系电话（{{ (company.contacts || []).length }}）</span>
            <el-button
              v-if="(company.contacts || []).length"
              size="small" type="primary" plain
              @click="createLeadFromCompany()"
            >整理为线索丢进公海</el-button>
          </div>
        </template>
        <el-table v-if="(company.contacts || []).length" :data="company.contacts" border size="small">
          <el-table-column label="联系人" prop="name" width="160">
            <template #default="{ row }">{{ row.name || '企业公示' }}</template>
          </el-table-column>
          <el-table-column label="职务" prop="title" width="160">
            <template #default="{ row }">{{ row.title || '-' }}</template>
          </el-table-column>
          <el-table-column label="电话" prop="phone" min-width="180">
            <template #default="{ row }">
              <span class="phone">{{ row.phone || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="primary" @click="copyPhone(row.phone)">复制</el-button>
              <el-button size="small" link type="success" @click="createLeadFromContact(row)">建成线索</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else :image-size="60" description="该企业暂无公示联系电话" />
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { companyApi } from '@/api/company'
import { leadApi } from '@/api/crm'
import type { EnterpriseEntity } from '@/api/growth'

const keyword = ref('')
const loading = ref(false)
const searched = ref(false)
const company = ref<EnterpriseEntity | null>(null)

/**
 * 兼容请求层两种返回形状:有的接口经拦截器直接给到业务载荷,有的把整个
 * { code, message, data } 信封透传过来。统一取出真正的载荷。
 */
const unwrap = (r: any) => (r && typeof r === 'object' && 'code' in r && 'data' in r) ? r.data : r

// 输入联想
const querySuggest = async (q: string, cb: (items: any[]) => void) => {
  const kw = (q || '').trim()
  if (!kw) { cb([]); return }
  try {
    const list = unwrap(await companyApi.suggest(kw, 8))
    cb(Array.isArray(list) ? list : [])
  } catch {
    cb([])
  }
}

const onSuggestSelect = (item: any) => {
  keyword.value = item.name
  doSearch(item.name)
}

const doSearch = async (kw?: string) => {
  const q = (kw ?? keyword.value).trim()
  if (!q) { ElMessage.warning('请输入公司名称'); return }
  loading.value = true
  searched.value = true
  try {
    const data = unwrap(await companyApi.detail(q)) as EnterpriseEntity | null
    company.value = (data && (data as any).name) ? data : null
    if (!company.value) ElMessage.info('工商库未匹配到该企业')
  } catch {
    company.value = null
  } finally {
    loading.value = false
  }
}

const statusType = (s: string) => {
  const map: Record<string, string> = { 营业: 'success', 存续: 'success', 异常: 'danger', 注销: 'info', 迁出: 'warning' }
  return map[s] || 'info'
}

const copyPhone = async (phone: string) => {
  if (!phone) return
  try {
    await navigator.clipboard.writeText(phone)
    ElMessage.success(`已复制 ${phone}`)
  } catch {
    ElMessage.warning('复制失败，请手动选择')
  }
}

// 单个联系人 → 建线索（进公海，不指定负责人）
const createLeadFromContact = async (row: { name?: string; title?: string; phone?: string }) => {
  if (!company.value) return
  try {
    await leadApi.create({
      name: row.name || company.value.shortName || company.value.name,
      company: company.value.name,
      phone: row.phone || '',
      source: 1, // 1=工商/天眼查平台
      remark: [row.title, '工商号码查询导入'].filter(Boolean).join(' · ')
    })
    ElMessage.success('已建成线索（进公海，可在线索管理领取）')
  } catch { /* 拦截器已提示 */ }
}

// 整公司所有公示号码 → 批量建线索
const createLeadFromCompany = async () => {
  if (!company.value || !(company.value.contacts || []).length) return
  let ok = 0
  for (const c of company.value.contacts) {
    try {
      await leadApi.create({
        name: c.name || company.value.shortName || company.value.name,
        company: company.value.name,
        phone: c.phone || '',
        source: 1,
        remark: [c.title, '工商号码查询导入'].filter(Boolean).join(' · ')
      })
      ok++
    } catch { /* 单条失败跳过 */ }
  }
  ElMessage.success(`已整理 ${ok} 个号码为线索丢进公海`)
}
</script>

<style scoped>
.company-lookup { padding: 4px; }
.compliance-tip { margin-bottom: 14px; }
.compliance-detail { font-size: 12px; color: var(--text-body); margin-top: 4px; }
.search-bar { display: flex; gap: 10px; margin-bottom: 16px; }
.search-input { flex: 1; max-width: 560px; }
.sug-item { display: flex; justify-content: space-between; gap: 12px; }
.sug-name { font-weight: 500; }
.sug-meta { color: var(--text-muted, #909399); font-size: 12px; }
.result { display: flex; flex-direction: column; gap: 14px; }
.info-card :deep(.el-card__header) { padding: 10px 16px; }
.card-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.co-name { font-size: 15px; font-weight: 600; }
.src-tag { margin-left: auto; font-size: 12px; color: var(--text-muted, #909399); }
.phone { font-family: var(--font-mono, monospace); letter-spacing: .5px; }
</style>

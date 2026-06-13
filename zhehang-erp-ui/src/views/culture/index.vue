<template>
  <div class="page-container culture-page">
    <!-- 顶部主视觉横幅 -->
    <section class="culture-hero">
      <div class="culture-hero-text">
        <span class="culture-hero-eyebrow">ZHEHANG · 浙杭人文</span>
        <h1>浙杭人文 携手并肩</h1>
        <p>以人为本，凝聚同心。从组织架构到行政制度，从企业文化到员工风采，构建有温度、有效率、能打硬仗的浙杭团队。</p>
      </div>
      <div class="culture-hero-stats">
        <div>
          <b>{{ heroStats.deptCount }}</b>
          <span>部门数</span>
        </div>
        <div>
          <b>{{ heroStats.memberCount }}</b>
          <span>在册人数</span>
        </div>
        <div>
          <b>{{ heroStats.activeCount }}</b>
          <span>在职人数</span>
        </div>
      </div>
    </section>

    <el-tabs v-model="activeTab" class="culture-tabs">
      <!-- Tab 1：组织架构 -->
      <el-tab-pane name="structure">
        <template #label><span class="culture-tab-label">组织架构</span></template>

        <div class="culture-section-head">
          <div>
            <h2>组织架构</h2>
            <p>共 {{ heroStats.memberCount }} 人 · {{ heroStats.deptCount }} 个部门，数据实时来自组织管理后台。</p>
          </div>
          <el-button type="primary" plain @click="goEditStructure">
            <el-icon><EditPen /></el-icon>编辑组织架构
          </el-button>
        </div>

        <!-- 部门卡片：各部门人数 -->
        <div v-loading="structureLoading" class="dept-card-grid">
          <div
            v-for="dept in deptCards"
            :key="dept.id"
            class="dept-card"
            :class="{ active: selectedDeptId === dept.id }"
            @click="selectDept(dept.id)"
          >
            <div class="dept-card-top">
              <span class="dept-card-name">{{ dept.label }}</span>
              <el-tag v-if="dept.depth === 0" size="small" effect="plain" type="primary">一级</el-tag>
            </div>
            <div class="dept-card-count">
              <b>{{ dept.memberCount }}</b><span>人</span>
            </div>
            <div class="dept-card-leader">负责人：{{ dept.leader || '—' }}</div>
          </div>
          <el-empty v-if="!structureLoading && !deptCards.length" description="暂无部门数据" :image-size="80" />
        </div>

        <div class="culture-org-layout">
          <!-- 部门与人员可展开树 -->
          <div class="culture-tree-panel">
            <div class="culture-panel-head">
              <span>部门与人员</span>
              <span class="culture-panel-sub">共 {{ heroStats.memberCount }} 人</span>
            </div>
            <el-input
              v-model="treeFilterText"
              placeholder="搜索部门 / 姓名"
              clearable
              class="culture-tree-filter"
            >
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-tree
              ref="orgTreeRef"
              v-loading="structureLoading"
              :data="orgTreeData"
              :props="{ label: 'label', children: 'children' }"
              node-key="nodeKey"
              :filter-node-method="filterTreeNode"
              :expand-on-click-node="false"
              default-expand-all
              class="culture-org-tree"
              @node-click="handleTreeNodeClick"
            >
              <template #default="{ data }">
                <span class="culture-tree-node" :class="data.type">
                  <el-icon v-if="data.type === 'dept'" class="culture-tree-icon"><OfficeBuilding /></el-icon>
                  <el-icon v-else class="culture-tree-icon"><User /></el-icon>
                  <span class="culture-tree-name">{{ data.label }}</span>
                  <span v-if="data.type === 'dept'" class="culture-tree-badge">{{ data.memberCount }}人</span>
                  <el-tag v-else size="small" :type="empStatusType(data.status)" effect="plain">
                    {{ empStatusText(data.status) }}
                  </el-tag>
                </span>
              </template>
            </el-tree>
          </div>

          <!-- 右侧：选中部门的人员明细 -->
          <div class="culture-member-panel">
            <div class="culture-panel-head">
              <span>{{ selectedDeptName || '全部人员' }}</span>
              <span class="culture-panel-sub">{{ memberList.length }} 人</span>
            </div>
            <el-table
              v-loading="memberLoading"
              :data="memberList"
              stripe
              border
              size="small"
              height="420"
              empty-text="该部门暂无在册人员"
            >
              <el-table-column type="index" label="#" width="48" align="center" />
              <el-table-column prop="name" label="姓名" width="96">
                <template #default="{ row }">
                  <span class="culture-member-name">
                    <span class="culture-member-avatar" :class="empStatusClass(row.status)">{{ avatarText(row.name) }}</span>
                    {{ row.name }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column prop="postName" label="岗位" min-width="120" show-overflow-tooltip />
              <el-table-column prop="deptName" label="部门" min-width="110" show-overflow-tooltip />
              <el-table-column prop="phone" label="联系电话" width="130" />
              <el-table-column label="状态" width="86" align="center">
                <template #default="{ row }">
                  <el-tag :type="empStatusType(row.status)" size="small">{{ empStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2：行政制度 -->
      <el-tab-pane name="policy">
        <template #label><span class="culture-tab-label">行政制度</span></template>
        <div class="culture-section-head">
          <div>
            <h2>行政制度</h2>
            <p>制度即承诺，规范即效率。以下为公司核心管理制度纲要，详细条款以正式发布的制度文件为准。</p>
          </div>
          <el-button v-if="canManage" type="primary" plain @click="openEdit('policy')">
            <el-icon><Plus /></el-icon>新增制度
          </el-button>
          <el-tag v-else type="info" effect="plain">如需调整请联系管理员</el-tag>
        </div>
        <div v-loading="policyLoading" class="culture-policy-grid">
          <el-card v-for="item in policyList" :key="item.id" shadow="hover" class="culture-policy-card">
            <div class="culture-policy-head">
              <span class="culture-policy-icon" :style="{ background: item.color }">{{ item.icon }}</span>
              <div>
                <strong>{{ item.title }}</strong>
              </div>
              <div v-if="canManage" class="culture-card-ops">
                <el-button link type="primary" size="small" @click="openEdit('policy', item)">
                  <el-icon><EditPen /></el-icon>编辑
                </el-button>
                <el-button link type="danger" size="small" @click="removeContent(item, 'policy')">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
            <ul class="culture-policy-points">
              <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
            </ul>
          </el-card>
          <el-empty v-if="!policyLoading && !policyList.length" description="暂无行政制度，请点击右上角新增" :image-size="80" />
        </div>
      </el-tab-pane>

      <!-- Tab 3：企业文化 -->
      <el-tab-pane name="value">
        <template #label><span class="culture-tab-label">企业文化</span></template>
        <div class="culture-section-head">
          <div>
            <h2>企业文化</h2>
            <p>使命、愿景、价值观，是浙杭人共同的语言与行动准则。</p>
          </div>
          <el-button v-if="canManage" type="primary" plain @click="openEdit('culture')">
            <el-icon><Plus /></el-icon>新增文化内容
          </el-button>
          <el-tag v-else type="info" effect="plain">如需调整请联系管理员</el-tag>
        </div>

        <div v-loading="cultureLoading">
          <div class="culture-mvv-grid">
            <div v-for="(item, idx) in mvvList" :key="item.id" class="culture-mvv-card" :class="mvvClass(idx)">
              <span class="culture-mvv-label">{{ item.title }}</span>
              <strong class="culture-mvv-text">{{ item.text }}</strong>
              <p>{{ item.desc }}</p>
              <div v-if="canManage" class="culture-mvv-ops">
                <el-button link size="small" @click="openEdit('culture', item)">
                  <el-icon><EditPen /></el-icon>编辑
                </el-button>
                <el-button link size="small" @click="removeContent(item, 'culture')">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </div>

          <div class="culture-value-grid">
            <div v-for="value in coreValues" :key="value.id" class="culture-value-card">
              <span class="culture-value-icon">{{ value.icon }}</span>
              <strong>{{ value.title }}</strong>
              <p>{{ value.desc }}</p>
              <div v-if="canManage" class="culture-card-ops culture-card-ops-center">
                <el-button link type="primary" size="small" @click="openEdit('culture', value)">
                  <el-icon><EditPen /></el-icon>编辑
                </el-button>
                <el-button link type="danger" size="small" @click="removeContent(value, 'culture')">
                  <el-icon><Delete /></el-icon>删除
                </el-button>
              </div>
            </div>
          </div>
          <el-empty v-if="!cultureLoading && !mvvList.length && !coreValues.length" description="暂无企业文化内容，请点击右上角新增" :image-size="80" />
        </div>
      </el-tab-pane>

      <!-- Tab 4：员工风采 -->
      <el-tab-pane name="people">
        <template #label><span class="culture-tab-label">员工风采</span></template>
        <div class="culture-section-head">
          <div>
            <h2>员工风采</h2>
            <p>每一位浙杭人，都是团队的名片。以下风采墙人员信息实时来自组织管理后台。</p>
          </div>
          <el-tag type="info" effect="plain">荣誉/标签后续可接入 CMS</el-tag>
        </div>

        <div v-loading="peopleLoading" class="culture-people-wall">
          <div v-for="emp in peopleList" :key="emp.id" class="culture-people-card">
            <span class="culture-people-avatar" :class="empStatusClass(emp.status)">{{ avatarText(emp.name) }}</span>
            <strong class="culture-people-name">{{ emp.name }}</strong>
            <span class="culture-people-post">{{ emp.postName || '—' }}</span>
            <span class="culture-people-dept">{{ emp.deptName || '—' }}</span>
            <el-tag :type="empStatusType(emp.status)" size="small" effect="plain">{{ empStatusText(emp.status) }}</el-tag>
          </div>
          <el-empty v-if="!peopleLoading && !peopleList.length" description="暂无员工数据" :image-size="80" />
        </div>
        <div v-if="peopleTotal > peopleList.length" class="culture-people-more">
          <el-button text type="primary" :loading="peopleLoading" @click="loadMorePeople">加载更多（{{ peopleList.length }}/{{ peopleTotal }}）</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 人文内容编辑弹窗（管理员） -->
    <el-dialog
      v-model="editVisible"
      :title="editTitle"
      width="560px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="84px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" maxlength="128" show-word-limit placeholder="如：考勤与休假 / 使命 Mission" />
        </el-form-item>
        <el-form-item label="图标">
          <el-input v-model="editForm.icon" maxlength="16" placeholder="emoji，如 🕘 💰 🎯（可留空）" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="6"
            maxlength="2000"
            show-word-limit
            placeholder="每行一条要点；换行分段"
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="editForm.sortOrder" :min="0" :max="9999" controls-position="right" />
          <span class="culture-form-hint">数字越小越靠前</span>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { EditPen, Search, OfficeBuilding, User, Plus, Delete } from '@element-plus/icons-vue'
import { structureApi, employeeApi } from '@/api/org'
import { contentApi } from '@/api/culture'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 管理员/老板/经理可维护人文内容
const canManage = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('boss') || roles.includes('manager')
})

const activeTab = ref('structure')

// ===== 组织架构（真后端） =====
const structureLoading = ref(false)
const rawTree = ref<any[]>([]) // /org/structure/tree 原始部门树
const allEmployees = ref<any[]>([]) // /org/employee/list 全量员工（用于挂到部门树 & 风采墙）
const employeesLoaded = ref(false)

const orgTreeRef = ref()
const treeFilterText = ref('')
const selectedDeptId = ref<number | null>(null)
const selectedDeptName = ref('')
const memberLoading = ref(false)

// 部门卡片：拍平部门树，记录层级深度
interface DeptCard { id: number; label: string; leader: string; memberCount: number; depth: number }
const deptCards = computed<DeptCard[]>(() => flattenDept(rawTree.value, 0))

function flattenDept (nodes: any[], depth: number): DeptCard[] {
  const list: DeptCard[] = []
  for (const node of nodes || []) {
    list.push({
      id: Number(node.id),
      label: node.label,
      leader: node.leader || '',
      memberCount: Number(node.memberCount || 0),
      depth
    })
    if (Array.isArray(node.children) && node.children.length) {
      list.push(...flattenDept(node.children, depth + 1))
    }
  }
  return list
}

const heroStats = computed(() => {
  const deptCount = deptCards.value.length
  // 顶层部门 memberCount 已含子部门人数时会重复；这里以员工档案数为准，回退用根节点求和
  const memberCount = employeesLoaded.value
    ? allEmployees.value.length
    : rawTree.value.reduce((sum, n) => sum + Number(n.memberCount || 0), 0)
  const activeCount = employeesLoaded.value
    ? allEmployees.value.filter(e => e.status !== 3).length
    : memberCount
  return { deptCount, memberCount, activeCount }
})

// 组织树：部门树 + 员工子节点（按 deptId 挂载）
const orgTreeData = computed(() => buildOrgTree(rawTree.value))

function buildOrgTree (nodes: any[]): any[] {
  return (nodes || []).map(node => {
    const deptId = Number(node.id)
    const childDepts = buildOrgTree(node.children || [])
    const empNodes = allEmployees.value
      .filter(e => Number(e.deptId) === deptId)
      .map(e => ({
        nodeKey: `emp-${e.id}`,
        type: 'employee',
        label: e.name,
        status: e.status,
        postName: e.postName,
        deptName: e.deptName,
        phone: e.phone,
        raw: e
      }))
    return {
      nodeKey: `dept-${deptId}`,
      type: 'dept',
      label: node.label,
      memberCount: Number(node.memberCount || 0),
      leader: node.leader,
      status: node.status,
      deptId,
      children: [...childDepts, ...empNodes]
    }
  })
}

// 右侧人员明细：选中部门时过滤，否则全部
const memberList = computed(() => {
  if (selectedDeptId.value == null) return allEmployees.value
  return allEmployees.value.filter(e => Number(e.deptId) === selectedDeptId.value)
})

const selectDept = (id: number) => {
  if (selectedDeptId.value === id) {
    selectedDeptId.value = null
    selectedDeptName.value = ''
    return
  }
  selectedDeptId.value = id
  selectedDeptName.value = deptCards.value.find(d => d.id === id)?.label || ''
}

const handleTreeNodeClick = (data: any) => {
  if (data.type === 'dept') {
    selectDept(data.deptId)
  }
}

// 树搜索
const filterTreeNode = (value: string, data: any) => {
  if (!value) return true
  return String(data.label || '').toLowerCase().includes(value.toLowerCase())
}
watch(treeFilterText, (val) => {
  orgTreeRef.value?.filter(val)
})

const goEditStructure = () => {
  // 复用现有组织管理页面（组织架构图 / 部门维护），canonical 路径在 /hrm 下
  router.push('/hrm/structure').catch(() => {
    router.push('/hrm/dept').catch(() => {})
  })
}

// ===== 员工风采（真后端，分页累加） =====
const peopleLoading = ref(false)
const peopleList = ref<any[]>([])
const peopleTotal = ref(0)
const peoplePage = reactive({ pageNum: 1, pageSize: 24 })

const loadStructure = async () => {
  structureLoading.value = true
  try {
    const res = await structureApi.tree()
    rawTree.value = res.data || []
  } catch (e) {
    rawTree.value = []
  } finally {
    structureLoading.value = false
  }
}

// 拉全量员工挂到部门树（pageSize 取大值；后端 DataScope 对非HR/管理员只返回本人，见 gaps）
const loadAllEmployees = async () => {
  memberLoading.value = true
  try {
    const res = await employeeApi.list({ pageNum: 1, pageSize: 500 })
    const data = res.data || {}
    allEmployees.value = data.records || data.list || []
    employeesLoaded.value = true
  } catch (e) {
    allEmployees.value = []
  } finally {
    memberLoading.value = false
  }
}

const loadPeople = async (append = false) => {
  peopleLoading.value = true
  try {
    const res = await employeeApi.list({ pageNum: peoplePage.pageNum, pageSize: peoplePage.pageSize })
    const data = res.data || {}
    const list = data.records || data.list || []
    peopleList.value = append ? [...peopleList.value, ...list] : list
    peopleTotal.value = Number(data.total || peopleList.value.length || 0)
  } catch (e) {
    if (!append) peopleList.value = []
  } finally {
    peopleLoading.value = false
  }
}

const loadMorePeople = () => {
  peoplePage.pageNum += 1
  loadPeople(true)
}

// 切到员工风采 Tab 时按需首次加载
watch(activeTab, (tab) => {
  if (tab === 'people' && !peopleList.value.length) {
    peoplePage.pageNum = 1
    loadPeople(false)
  }
})

// ===== 状态/工具 =====
const empStatusType = (status: number) => {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'info' }
  return (map[status] || 'info') as any
}
const empStatusText = (status: number) => {
  const map: Record<number, string> = { 1: '在职', 2: '试用', 3: '离职' }
  return map[status] || '—'
}
const empStatusClass = (status: number) => {
  const map: Record<number, string> = { 1: 'active', 2: 'trial', 3: 'left' }
  return map[status] || 'active'
}
const avatarText = (name: string) => String(name || '员').slice(0, 1)

// ===== 行政制度 / 企业文化（改为后端 /culture/content 可维护） =====
// 后端 CultureContent: { id, type(policy/culture/honor), title, content, icon, sortOrder, status }
// content 内为多行文本：每行一条要点（行政制度按行渲染为 li；企业文化首行作为主文案、其余作为描述）
const policyRaw = ref<any[]>([])
const cultureRaw = ref<any[]>([])
const policyLoading = ref(false)
const cultureLoading = ref(false)

// 卡片左侧色块（按序循环），保持原视觉
const POLICY_COLORS = ['#e6f0ff', '#fff3e0', '#e8f5e9', '#f3e8ff', '#e0f7fa', '#fde8e8']

const splitLines = (content: string): string[] =>
  String(content || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)

// 行政制度卡片：content 按行拆成要点
const policyList = computed(() =>
  policyRaw.value.map((item, idx) => ({
    id: item.id,
    title: item.title,
    icon: item.icon || '📋',
    color: POLICY_COLORS[idx % POLICY_COLORS.length],
    points: splitLines(item.content),
    raw: item
  }))
)

// 企业文化：前 3 条（按 sortOrder）作为 使命/愿景/价值观 大卡，其余作为价值观卡
const mvvList = computed(() =>
  cultureRaw.value.slice(0, 3).map(item => {
    const lines = splitLines(item.content)
    return {
      id: item.id,
      title: item.title,
      text: lines[0] || '',
      desc: lines.slice(1).join(' ') || '',
      raw: item
    }
  })
)
const coreValues = computed(() =>
  cultureRaw.value.slice(3).map(item => {
    const lines = splitLines(item.content)
    return {
      id: item.id,
      title: item.title,
      icon: item.icon || '✨',
      desc: lines.join(' '),
      raw: item
    }
  })
)
const mvvClass = (idx: number) => ['mission', 'vision', 'values'][idx] || 'mission'

const loadPolicy = async () => {
  policyLoading.value = true
  try {
    const res = await contentApi.list('policy')
    policyRaw.value = (res as any)?.data || []
  } catch (e) {
    policyRaw.value = []
  } finally {
    policyLoading.value = false
  }
}
const loadCulture = async () => {
  cultureLoading.value = true
  try {
    const res = await contentApi.list('culture')
    cultureRaw.value = (res as any)?.data || []
  } catch (e) {
    cultureRaw.value = []
  } finally {
    cultureLoading.value = false
  }
}

// ===== 编辑/新增/删除（管理员） =====
const editVisible = ref(false)
const editSaving = ref(false)
const editFormRef = ref()
const editForm = reactive<{ id: number | null; type: string; title: string; content: string; icon: string; sortOrder: number; status: number }>({
  id: null, type: 'policy', title: '', content: '', icon: '', sortOrder: 0, status: 1
})
const editRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}
const editTitle = computed(() => {
  const label = editForm.type === 'policy' ? '行政制度' : '企业文化'
  return (editForm.id ? '编辑' : '新增') + label
})

const openEdit = (type: string, row?: any) => {
  const raw = row?.raw || row
  editForm.id = raw?.id ?? null
  editForm.type = type
  editForm.title = raw?.title || ''
  editForm.content = raw?.content || ''
  editForm.icon = raw?.icon || ''
  editForm.sortOrder = Number(raw?.sortOrder ?? 0)
  editForm.status = Number(raw?.status ?? 1)
  editVisible.value = true
}

const submitEdit = async () => {
  await editFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    editSaving.value = true
    try {
      await contentApi.save({ ...editForm })
      ElMessage.success(editForm.id ? '已更新' : '已新增')
      editVisible.value = false
      editForm.type === 'policy' ? await loadPolicy() : await loadCulture()
    } catch (e) {
      // 全局拦截器已提示错误
    } finally {
      editSaving.value = false
    }
  })
}

const removeContent = async (row: any, type: string) => {
  const raw = row?.raw || row
  if (!raw?.id) return
  try {
    await ElMessageBox.confirm(`确定删除「${raw.title}」吗？`, '删除确认', {
      type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    await contentApi.remove(raw.id)
    ElMessage.success('已删除')
    type === 'policy' ? await loadPolicy() : await loadCulture()
  } catch (e) {
    // 全局拦截器已提示错误
  }
}

onMounted(async () => {
  await loadStructure()
  await loadAllEmployees()
  // 人文内容（行政制度/企业文化）从后端拉取
  loadPolicy()
  loadCulture()
  // 默认右侧明细展示全部，树默认展开
  await nextTick()
})
</script>

<style scoped>
.culture-page {
  padding-bottom: 24px;
}

/* 顶部横幅 */
.culture-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 16px;
  padding: 28px 32px;
  border-radius: 14px;
  background: linear-gradient(120deg, #F26522 0%, #ff8b4d 55%, #ffb27a 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(242, 101, 34, 0.25);
}
.culture-hero-eyebrow {
  display: inline-block;
  margin-bottom: 10px;
  padding: 3px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  font-size: 12px;
  letter-spacing: 2px;
}
.culture-hero-text h1 {
  margin: 0 0 10px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: 4px;
}
.culture-hero-text p {
  max-width: 720px;
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.94;
}
.culture-hero-stats {
  display: flex;
  gap: 14px;
  flex-shrink: 0;
}
.culture-hero-stats div {
  min-width: 92px;
  padding: 14px 18px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  text-align: center;
  backdrop-filter: blur(2px);
}
.culture-hero-stats b {
  display: block;
  font-size: 28px;
  font-weight: 800;
  line-height: 1.1;
}
.culture-hero-stats span {
  font-size: 12px;
  opacity: 0.9;
}

/* Tabs */
.culture-tabs {
  background: #fff;
  padding: 8px 18px 18px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.04);
}
.culture-tab-label {
  font-size: 15px;
  font-weight: 600;
}

/* 区块标题 */
.culture-section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin: 8px 0 18px;
}
.culture-section-head h2 {
  margin: 0 0 6px;
  color: #1f2937;
  font-size: 19px;
  font-weight: 700;
}
.culture-section-head p {
  max-width: 860px;
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

/* 部门卡片 */
.dept-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  min-height: 60px;
}
.dept-card {
  padding: 16px 18px;
  border: 1px solid #eef0f5;
  border-left: 4px solid #F26522;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
}
.dept-card:hover {
  box-shadow: 0 6px 18px rgba(242, 101, 34, 0.14);
  transform: translateY(-2px);
}
.dept-card.active {
  background: #fff5f0;
  border-color: #F26522;
  box-shadow: 0 6px 18px rgba(242, 101, 34, 0.18);
}
.dept-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.dept-card-name {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}
.dept-card-count {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 6px;
}
.dept-card-count b {
  color: #F26522;
  font-size: 26px;
  font-weight: 800;
}
.dept-card-count span {
  color: #98a2b3;
  font-size: 13px;
}
.dept-card-leader {
  color: #667085;
  font-size: 12px;
}

/* 组织树 + 人员明细 两栏 */
.culture-org-layout {
  display: grid;
  grid-template-columns: minmax(0, 360px) minmax(0, 1fr);
  gap: 16px;
}
.culture-tree-panel,
.culture-member-panel {
  padding: 16px;
  border: 1px solid #eef0f5;
  border-radius: 10px;
  background: #fbfcfe;
}
.culture-panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}
.culture-panel-head > span:first-child {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}
.culture-panel-sub {
  color: #98a2b3;
  font-size: 12px;
}
.culture-tree-filter {
  margin-bottom: 10px;
}
.culture-org-tree {
  background: transparent;
  max-height: 460px;
  overflow: auto;
}
.culture-tree-node {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding-right: 8px;
}
.culture-tree-icon {
  color: #F26522;
}
.culture-tree-node.employee .culture-tree-icon {
  color: #98a2b3;
}
.culture-tree-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.culture-tree-badge {
  padding: 1px 8px;
  border-radius: 999px;
  background: #fff0e8;
  color: #F26522;
  font-size: 12px;
}
.culture-member-name {
  display: flex;
  align-items: center;
  gap: 6px;
}
.culture-member-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  font-size: 11px;
}
.culture-member-avatar.active { background: #67c23a; }
.culture-member-avatar.trial { background: #e6a23c; }
.culture-member-avatar.left { background: #909399; }

/* 行政制度 */
.culture-policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.culture-policy-card {
  border-radius: 10px;
}
.culture-policy-head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.culture-policy-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 22px;
}
.culture-policy-head strong {
  display: block;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}
.culture-policy-head em {
  color: #98a2b3;
  font-size: 12px;
  font-style: normal;
}
/* 卡片右上角管理操作 */
.culture-card-ops {
  margin-left: auto;
  display: flex;
  gap: 2px;
  white-space: nowrap;
}
.culture-card-ops-center {
  margin: 8px auto 0;
  justify-content: center;
}
.culture-form-hint {
  margin-left: 10px;
  color: #98a2b3;
  font-size: 12px;
}
.culture-policy-points {
  margin: 0;
  padding-left: 18px;
}
.culture-policy-points li {
  margin-bottom: 7px;
  color: #475467;
  font-size: 13px;
  line-height: 1.6;
}

/* 企业文化 MVV */
.culture-mvv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.culture-mvv-card {
  padding: 22px;
  border-radius: 12px;
  color: #fff;
}
.culture-mvv-card.mission { background: linear-gradient(135deg, #F26522, #ff8b4d); }
.culture-mvv-card.vision { background: linear-gradient(135deg, #2f80ed, #56a3f5); }
.culture-mvv-card.values { background: linear-gradient(135deg, #27ae60, #4cc97f); }
.culture-mvv-label {
  display: inline-block;
  margin-bottom: 10px;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 12px;
  letter-spacing: 1px;
}
.culture-mvv-text {
  display: block;
  margin-bottom: 10px;
  font-size: 19px;
  font-weight: 800;
  line-height: 1.4;
}
.culture-mvv-card p {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
  opacity: 0.94;
}
.culture-mvv-card {
  position: relative;
}
.culture-mvv-ops {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
.culture-mvv-ops :deep(.el-button) {
  color: #fff;
  opacity: 0.92;
}
.culture-mvv-ops :deep(.el-button:hover) {
  opacity: 1;
}
.culture-value-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}
.culture-value-card {
  padding: 18px;
  border: 1px solid #eef0f5;
  border-radius: 10px;
  background: #fff;
  text-align: center;
}
.culture-value-icon {
  display: inline-block;
  margin-bottom: 8px;
  font-size: 30px;
}
.culture-value-card strong {
  display: block;
  margin-bottom: 6px;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}
.culture-value-card p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

/* 员工风采 */
.culture-people-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  min-height: 80px;
}
.culture-people-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 14px;
  border: 1px solid #eef0f5;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s;
}
.culture-people-card:hover {
  box-shadow: 0 8px 22px rgba(31, 45, 61, 0.08);
  transform: translateY(-3px);
}
.culture-people-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin-bottom: 4px;
  color: #fff;
  font-size: 22px;
  font-weight: 700;
}
.culture-people-avatar.active { background: linear-gradient(135deg, #67c23a, #95d475); }
.culture-people-avatar.trial { background: linear-gradient(135deg, #e6a23c, #f3c465); }
.culture-people-avatar.left { background: linear-gradient(135deg, #909399, #b8bcc2); }
.culture-people-name {
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
}
.culture-people-post {
  color: #F26522;
  font-size: 13px;
}
.culture-people-dept {
  color: #98a2b3;
  font-size: 12px;
}
.culture-people-more {
  margin-top: 14px;
  text-align: center;
}

@media (max-width: 960px) {
  .culture-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .culture-org-layout {
    grid-template-columns: 1fr;
  }
  .culture-mvv-grid {
    grid-template-columns: 1fr;
  }
}
</style>

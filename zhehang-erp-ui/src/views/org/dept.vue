<template>
  <div class="page-container dept-page">
    <!-- 改版:方案四架构图当总览入口 + 方案一飞书风管理页 -->
    <div class="dept-topbar">
      <div class="dept-topbar-title">
        <h3>部门管理</h3>
        <span class="dt-pill">{{ deptCountTotal }} 个部门 · {{ allEmployees.length }} 人</span>
        <span v-if="noLeaderCount" class="dt-pill warn">⚠ {{ noLeaderCount }} 个部门未设负责人</span>
      </div>
      <div class="dept-topbar-actions">
        <el-radio-group v-model="deptView" size="small">
          <el-radio-button value="chart">组织架构</el-radio-button>
          <el-radio-button value="manage">部门管理</el-radio-button>
        </el-radio-group>
        <el-button type="primary" size="small" @click="handleAddRoot"><el-icon><Plus /></el-icon>新建部门</el-button>
      </div>
    </div>

    <!-- 视图一:组织架构总览(公司整棵树,点部门节点进入管理页;按住拖动可换上级) -->
    <div v-if="deptView === 'chart'" class="chart-overview">
      <div class="chart-overview-tip">点击部门进入管理 · 按住卡片拖到另一部门上 = 调整其上级</div>
      <div v-if="deptTree.length" class="org-chart-scroll overview-scroll">
        <OrgChartNode
          v-for="root in deptTree"
          :key="root.id"
          :node="root"
          :members-map="membersByDept"
          :active-id="currentDept?.id"
          @node-click="handleChartOpen"
        />
      </div>
      <el-empty v-else description="暂无部门,点右上「新建部门」开始" />
    </div>

    <div v-else class="dept-layout">
      <!-- 左侧部门树 -->
      <div class="dept-tree-panel">
        <div class="panel-header tree-head">
          <span class="tree-head-title">部门</span>
          <span class="tree-head-sub">{{ deptCountTotal }} 个 · {{ allEmployees.length }} 人</span>
          <el-button type="primary" size="small" class="tree-head-add" @click="handleAddRoot">
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
        <div class="all-entry" :class="{ on: !currentDept }" @click="currentDept = null">
          <el-icon><UserFilled /></el-icon>
          <span>全部成员</span>
          <em>{{ allEmployees.length }}</em>
        </div>
        <el-input v-model="treeFilter" :placeholder="$t('org.searchDept')" clearable class="tree-filter" />
        <el-tree
          ref="treeRef"
          :data="deptTree"
          :props="{ label: 'deptName', children: 'children' }"
          node-key="id"
          default-expand-all
          highlight-current
          :filter-node-method="filterNode"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <span class="tree-chip" :class="deptColorClass(data)">
                <el-icon v-if="isRootDept(data)"><OfficeBuilding /></el-icon>
                <template v-else>{{ (data.deptName || '部').slice(0, 1) }}</template>
              </span>
              <span class="tree-name">{{ data.deptName }}</span>
              <i v-if="!data.leader" class="tree-warn-dot" title="未设负责人" />
              <span class="tree-actions">
                <el-icon class="action-icon" @click.stop="handleAdd(data)"><Plus /></el-icon>
                <el-icon class="action-icon" @click.stop="handleEdit(data)"><Edit /></el-icon>
                <el-icon class="action-icon danger" @click.stop="handleDelete(data)"><Delete /></el-icon>
              </span>
              <em class="tree-cnt">{{ deptMemberCount(data.id) }}</em>
            </span>
          </template>
        </el-tree>
        <button v-if="noLeaderCount" type="button" class="tree-warn-card" @click="goFirstNoLeader">
          <span>⚠ {{ noLeaderCount }} 个部门未设负责人</span>
          <b>逐个处理 ›</b>
        </button>
      </div>

      <!-- 右侧：成员列表（通讯录式） -->
      <div class="dept-detail-panel">
        <!-- 单个部门视角 -->
        <template v-if="currentDept">
          <div class="dm-hero">
            <span class="dm-hero-avatar">{{ (currentDept.deptName || '部').slice(0, 1) }}</span>
            <div class="dm-hero-main">
              <div class="dm-hero-title">
                <h3>{{ currentDept.deptName }}</h3>
                <el-tag :type="currentDept.status === 0 ? 'success' : 'danger'" size="small" effect="light" round>
                  {{ currentDept.status === 0 ? $t('org.statusNormal') : $t('org.statusDisabled') }}
                </el-tag>
              </div>
              <div class="dm-hero-pills">
                <span v-if="currentDept.leader" class="dt-pill">负责人 {{ currentDept.leader }}</span>
                <span v-else class="dt-pill warn dm-clickable" @click="handleEdit(currentDept)">⚠ 未设负责人,点此设置</span>
                <span class="dt-pill">直属 {{ currentDeptMembers.length }} 人</span>
                <span v-if="currentDept.children?.length" class="dt-pill">含下级 {{ subtreeMemberCount(currentDept) }} 人</span>
              </div>
            </div>
            <div class="detail-actions">
              <el-button size="small" @click="handleEdit(currentDept)">编辑</el-button>
              <el-button type="primary" size="small" @click="openMemberDialog()">
                <el-icon><UserFilled /></el-icon>
                添加成员
              </el-button>
            </div>
          </div>

          <div class="dm-roster-bar">
            <el-input v-model="memberSearch" placeholder="搜索姓名 / 岗位 / 手机号" clearable :prefix-icon="Search" class="dm-search" />
            <el-checkbox v-if="currentDept.children?.length" v-model="includeSubtree">含下级部门</el-checkbox>
          </div>

          <div class="dm-roster">
            <div v-for="member in filteredMemberRows" :key="member.id" class="dm-mr">
              <el-avatar :size="34" :src="member.avatar || ''">{{ employeeInitial(member) }}</el-avatar>
              <div class="dm-mr-main">
                <strong>
                  {{ member.name || member.username || '未命名' }}
                  <em v-if="member.name && member.name === currentDept.leader" class="dm-star">★ 负责人</em>
                </strong>
                <span>
                  {{ member.postName || '未设岗位' }}
                  <template v-if="includeSubtree && member.deptName"> · {{ member.deptName }}</template>
                </span>
              </div>
              <div class="dm-mr-mid">{{ member.phone || '—' }}</div>
              <div class="dm-mr-tail">
                <el-tag size="small" effect="plain" :type="member.status === 1 ? 'success' : 'info'">{{ employeeStatusText(member.status) }}</el-tag>
                <a class="dm-op" @click="goEmployeePage()">调整</a>
              </div>
            </div>
            <div v-if="!filteredMemberRows.length" class="dm-empty">暂无成员,点右上「添加成员」调人进来</div>
          </div>
        </template>

        <!-- 全部成员视角 -->
        <template v-else>
          <div class="dm-hero">
            <span class="dm-hero-avatar all"><el-icon><UserFilled /></el-icon></span>
            <div class="dm-hero-main">
              <div class="dm-hero-title"><h3>全部成员</h3></div>
              <div class="dm-hero-pills">
                <span class="dt-pill">共 {{ allEmployees.length }} 人</span>
              </div>
            </div>
          </div>

          <div class="dm-roster-bar">
            <el-input v-model="memberSearch" placeholder="搜索姓名 / 岗位 / 部门 / 手机号" clearable :prefix-icon="Search" class="dm-search" />
          </div>

          <div class="dm-roster">
            <div v-for="member in filteredMemberRows" :key="member.id" class="dm-mr">
              <el-avatar :size="34" :src="member.avatar || ''">{{ employeeInitial(member) }}</el-avatar>
              <div class="dm-mr-main">
                <strong>{{ member.name || member.username || '未命名' }}</strong>
                <span>{{ member.postName || '未设岗位' }}</span>
              </div>
              <div class="dm-mr-mid"><span class="dt-pill">{{ member.deptName || '未分部门' }}</span></div>
              <div class="dm-mr-tail">
                <el-tag size="small" effect="plain" :type="member.status === 1 ? 'success' : 'info'">{{ employeeStatusText(member.status) }}</el-tag>
                <a class="dm-op" @click="goEmployeePage()">调整</a>
              </div>
            </div>
            <div v-if="!filteredMemberRows.length" class="dm-empty">暂无成员</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-form-item :label="$t('org.parentDept')" prop="parentId">
          <el-tree-select
            v-model="formData.parentId"
            :data="deptTree"
            :props="{ label: 'deptName', value: 'id', children: 'children' }"
            :placeholder="$t('org.selectParentDept')"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item :label="$t('org.deptName')" prop="deptName">
          <el-input v-model="formData.deptName" :placeholder="$t('org.inputDeptName')" />
        </el-form-item>
        <el-form-item :label="$t('org.sort')" prop="orderNum">
          <el-input-number v-model="formData.orderNum" :min="0" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$t('org.leader')">
          <el-select
            v-model="formData.leader"
            filterable
            clearable
            :placeholder="$t('org.inputLeader')"
            style="width: 100%"
            @change="onLeaderChange"
          >
            <el-option
              v-for="emp in leaderOptions"
              :key="emp.id"
              :label="emp.name"
              :value="emp.name"
            />
          </el-select>
        </el-form-item>
        <!-- 手机号/邮箱引用负责人的人员档案,选定负责人后自动带出、只读 -->
        <el-form-item :label="$t('org.phone')">
          <el-input v-model="formData.phone" readonly placeholder="选择负责人后自动带出" />
        </el-form-item>
        <el-form-item :label="$t('org.email')">
          <el-input v-model="formData.email" readonly placeholder="选择负责人后自动带出" />
        </el-form-item>
        <el-form-item :label="$t('org.status')">
          <el-radio-group v-model="formData.status">
            <el-radio :value="0">{{ $t('org.statusNormal') }}</el-radio>
            <el-radio :value="1">{{ $t('org.statusDisabled') }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <!-- 添加成员到部门 -->
    <el-dialog v-model="memberDialog.visible" :title="`添加成员到「${memberTargetDept?.deptName || '当前部门'}」`" width="680px" destroy-on-close>
      <el-alert
        v-if="currentDept"
        :title="`将所选员工归入「${currentDept.deptName}」,保存后员工档案中的所属部门会同步更新。`"
        type="info"
        show-icon
        :closable="false"
        class="member-alert"
      />
      <el-select
        v-model="memberDialog.employeeIds"
        multiple
        filterable
        clearable
        collapse-tags
        collapse-tags-tooltip
        placeholder="请选择要加入当前部门的员工"
        style="width: 100%"
      >
        <el-option
          v-for="employee in availableEmployees"
          :key="employee.id"
          :label="employeeOptionLabel(employee)"
          :value="employee.id"
        />
      </el-select>
      <div class="member-dialog-tip">
        已在当前部门的员工不会重复显示；如员工原来在其他部门,确认后会移动到当前部门。
      </div>
      <template #footer>
        <el-button @click="memberDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="memberDialog.saving" @click="submitMembers">保存</el-button>
      </template>
    </el-dialog>

    <!-- 架构图拖拽时跟随光标的影子(pointer-events:none,不挡命中检测) -->
    <div
      v-if="chartGhost.visible"
      class="chart-drag-ghost"
      :style="{ left: chartGhost.x + 'px', top: chartGhost.y + 'px' }"
    >{{ chartGhost.label }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, reactive, ref, watch, type PropType } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus, Edit, Delete, OfficeBuilding, UserFilled, Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { deptApi, employeeApi } from '@/api/org'

const { t } = useI18n()
const treeRef = ref()
const formRef = ref<FormInstance>()
const deptTree = ref<any[]>([])
const currentDept = ref<any>(null)
const allEmployees = ref<any[]>([])
const treeFilter = ref('')
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const memberDialog = ref({
  visible: false,
  employeeIds: [] as number[],
  saving: false
})

const formData = ref({
  id: undefined as number | undefined,
  parentId: 0 as number,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: 0
})

const rules = {
  deptName: [{ required: true, message: t('org.inputDeptName'), trigger: 'blur' }],
  orderNum: [{ required: true, message: t('org.inputSort'), trigger: 'blur' }]
}

watch(treeFilter, (val) => {
  treeRef.value?.filter(val)
})

const flattenDeptTree = (nodes: any[] = []): any[] => nodes.reduce((list: any[], item) => {
  list.push(item)
  if (Array.isArray(item.children) && item.children.length) {
    list.push(...flattenDeptTree(item.children))
  }
  return list
}, [])

const findDeptById = (id: number | undefined) => flattenDeptTree(deptTree.value).find((item: any) => item.id === id)

const membersByDept = computed(() => {
  const map: Record<number, any[]> = {}
  allEmployees.value.forEach((employee: any) => {
    const deptId = Number(employee.deptId)
    if (!deptId) return
    if (!map[deptId]) map[deptId] = []
    map[deptId].push(employee)
  })
  return map
})

const currentDeptMembers = computed(() => {
  if (!currentDept.value?.id) return []
  return membersByDept.value[currentDept.value.id] || []
})

const availableEmployees = computed(() => {
  if (!currentDept.value?.id) return []
  return allEmployees.value.filter((item: any) => item.id && Number(item.deptId) !== Number(currentDept.value.id))
})

const deptMemberCount = (deptId: number) => membersByDept.value[deptId]?.length || 0

const employeeInitial = (employee: any) => String(employee?.name || employee?.username || '?').slice(0, 1)

const employeeStatusText = (status: number) => {
  // 与后端一致:1在职 2试用 3离职(0待入职)。此前错用0基映射导致在职(1)被显示成"离职"
  const map: Record<number, string> = { 0: '待入职', 1: '在职', 2: '试用', 3: '离职' }
  return map[status] || '未设置'
}

const employeeOptionLabel = (employee: any) => {
  const dept = employee.deptName || '未分部门'
  const phone = employee.phone || employee.username || '无联系方式'
  return `${employee.name || employee.username || '未命名'} · ${dept} · ${phone}`
}

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.deptName.includes(value)
}

const loadTree = async () => {
  try {
    const res = await deptApi.tree()
    deptTree.value = res.data || []
    if (currentDept.value?.id) {
      currentDept.value = findDeptById(currentDept.value.id) || currentDept.value
    } else if (deptTree.value.length) {
      currentDept.value = deptTree.value[0]
    }
  } catch (e) {
    // ignore
  }
}

const loadEmployees = async () => {
  try {
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 5000 })
    allEmployees.value = res.data?.records || res.data?.list || []
  } catch {
    allEmployees.value = []
  }
}

// 负责人下拉候选:员工档案里有姓名的都可选(el-select filterable 可搜索)
const leaderOptions = computed(() => allEmployees.value.filter((e: any) => e && e.name))

// 选定负责人后,手机号/邮箱引用该员工档案自动带出;清空负责人则一并清空
const onLeaderChange = (name: string) => {
  const emp = allEmployees.value.find((e: any) => e.name === name)
  formData.value.phone = emp?.phone || ''
  formData.value.email = emp?.email || ''
}

const handleNodeClick = (data: any) => {
  if (chartJustDragged) { chartJustDragged = false; return } // 刚拖拽过则吞掉这次点击,不切换部门
  currentDept.value = data
}

// ===== 改版:架构图总览 + 管理页 双视图 =====
const deptView = ref<'chart' | 'manage'>('chart')
const flattenDepts = (nodes: any[]): any[] =>
  nodes.flatMap((n: any) => [n, ...flattenDepts(n.children || [])])
const deptCountTotal = computed(() => flattenDepts(deptTree.value).length)
const noLeaderCount = computed(() => flattenDepts(deptTree.value).filter((d: any) => !d.leader).length)
/** 总览图上点部门 = 进入该部门的管理页(拖拽后的点击照旧吞掉) */
const handleChartOpen = (data: any) => {
  if (chartJustDragged) { chartJustDragged = false; return }
  currentDept.value = data
  deptView.value = 'manage'
}

// ===== 通讯录式:成员搜索 + 含下级 =====
const router = useRouter()
const memberSearch = ref('')
const includeSubtree = ref(false)
/** 子树(含自身)总人数 */
const subtreeMemberCount = (dept: any): number =>
  flattenDepts([dept]).reduce((sum: number, d: any) => sum + deptMemberCount(d.id), 0)
/** 当前要展示的成员:全部 / 直属 / 含下级 */
const memberRows = computed(() => {
  if (!currentDept.value?.id) return allEmployees.value
  if (includeSubtree.value) {
    const ids = flattenDepts([currentDept.value]).map((d: any) => d.id)
    return allEmployees.value.filter((e: any) => ids.includes(Number(e.deptId)))
  }
  return currentDeptMembers.value
})
/** 搜索过滤 */
const filteredMemberRows = computed(() => {
  const q = memberSearch.value.trim()
  if (!q) return memberRows.value
  return memberRows.value.filter((e: any) =>
    (e.name || '').includes(q) || (e.username || '').includes(q) ||
    (e.postName || '').includes(q) || (e.phone || '').includes(q) ||
    (e.deptName || '').includes(q))
})
// 切换部门时重置搜索与含下级
watch(currentDept, () => {
  memberSearch.value = ''
  includeSubtree.value = false
})
/** 成员行「调整」= 去员工与账号页(那里是改人的地方) */
const goEmployeePage = () => router.push('/sys-org/employee')

// ===== 左栏彩色方章树:同一一级分支同色;根=公司图标灰章 =====
const DEPT_CHIP_COLORS = ['chip-blue', 'chip-green', 'chip-coral', 'chip-purple', 'chip-pink']
const deptColorMap = computed(() => {
  const map: Record<number, string> = {}
  deptTree.value.forEach((root: any) => {
    map[root.id] = 'chip-gray'
    ;(root.children || []).forEach((branch: any, i: number) => {
      const cls = DEPT_CHIP_COLORS[i % DEPT_CHIP_COLORS.length]
      flattenDepts([branch]).forEach((d: any) => { map[d.id] = cls })
    })
  })
  return map
})
const deptColorClass = (d: any) => deptColorMap.value[d.id] || 'chip-blue'
const isRootDept = (d: any) => deptTree.value.some((r: any) => r.id === d.id)
/** 底部黄卡:定位到第一个未设负责人的部门 */
const goFirstNoLeader = () => {
  const target = flattenDepts(deptTree.value).find((d: any) => !d.leader)
  if (!target) return
  currentDept.value = target
  deptView.value = 'manage'
  nextTick(() => treeRef.value?.setCurrentKey?.(target.id))
}

/* ---------------- 架构图卡片拖拽:鼠标事件实现,拖到另一个部门 = 改其上级 ----------------
   按住卡片移动 > 5px 才算拖(否则是点击切换);拖动时 elementFromPoint 命中下方卡片做目标;
   松手落到合法目标 = deptApi.update 改 parentId;防环(不能拖到自己或子孙上)。 */
const chartDragNode = ref<any>(null)        // 正在拖的部门节点
const chartDragOverId = ref<number | null>(null) // 当前光标下的合法目标 id
const chartGhost = reactive({ visible: false, x: 0, y: 0, label: '' })
let chartPressNode: any = null
let chartPressX = 0
let chartPressY = 0
let chartMoved = false
let chartJustDragged = false

const collectDeptIds = (node: any): number[] => {
  const ids = [node.id]
  ;(node.children || []).forEach((c: any) => ids.push(...collectDeptIds(c)))
  return ids
}
const canDropDept = (targetId: string | number) => {
  const d = chartDragNode.value
  if (!d) return false
  if (String(d.id) === String(targetId)) return false
  return !collectDeptIds(d).map(String).includes(String(targetId))
}
const onChartCardDown = (node: any, e: MouseEvent) => {
  if (e.button !== 0) return
  chartPressNode = node
  chartPressX = e.clientX
  chartPressY = e.clientY
  chartMoved = false
  document.addEventListener('mousemove', onChartCardMove)
  document.addEventListener('mouseup', onChartCardUp)
}
const onChartCardMove = (e: MouseEvent) => {
  if (!chartPressNode) return
  if (!chartMoved) {
    if (Math.abs(e.clientX - chartPressX) < 5 && Math.abs(e.clientY - chartPressY) < 5) return
    chartMoved = true
    chartDragNode.value = chartPressNode
    chartGhost.label = chartPressNode.deptName || chartPressNode.label || '部门'
    chartGhost.visible = true
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'grabbing'
  }
  chartGhost.x = e.clientX + 14
  chartGhost.y = e.clientY + 14
  const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null
  const card = el && el.closest ? (el.closest('[data-dept-id]') as HTMLElement | null) : null
  const targetId = card ? card.getAttribute('data-dept-id') : null
  chartDragOverId.value = targetId && canDropDept(targetId) ? Number(targetId) : null
}
const onChartCardUp = async () => {
  document.removeEventListener('mousemove', onChartCardMove)
  document.removeEventListener('mouseup', onChartCardUp)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
  const wasDrag = chartMoved
  const source = chartDragNode.value
  const targetId = chartDragOverId.value
  chartPressNode = null
  chartMoved = false
  chartDragNode.value = null
  chartDragOverId.value = null
  chartGhost.visible = false
  if (!wasDrag) return
  chartJustDragged = true
  if (!source || !targetId) return
  let targetLabel = '目标部门'
  const tc = document.querySelector(`[data-dept-id="${targetId}"]`)
  if (tc) targetLabel = tc.getAttribute('data-dept-label') || targetLabel
  try {
    // 只发 id+parentId:后端 updateById 仅改传入字段,不动名称/负责人/排序等
    await deptApi.update({ id: source.id, parentId: targetId })
    ElMessage.success(`已把「${source.deptName || source.label}」移到「${targetLabel}」下`)
  } catch {
    ElMessage.error('移动失败,已恢复')
  }
  await loadTree()
}

const resetForm = () => {
  formData.value = { id: undefined, parentId: 0, deptName: '', orderNum: 0, leader: '', phone: '', email: '', status: 0 }
}

const handleAddRoot = () => {
  isEdit.value = false
  dialogTitle.value = t('org.addDept')
  resetForm()
  dialogVisible.value = true
}

const handleAdd = (data: any) => {
  isEdit.value = false
  dialogTitle.value = t('org.addDept')
  resetForm()
  formData.value.parentId = data.id
  dialogVisible.value = true
}

const handleEdit = (data: any) => {
  isEdit.value = true
  dialogTitle.value = t('org.editDept')
  formData.value = { ...data }
  dialogVisible.value = true
}

const handleDelete = (data: any) => {
  ElMessageBox.confirm(t('org.confirmDeleteDept'), t('common.confirm'), { type: 'warning' })
    .then(async () => {
      await deptApi.remove(data.id)
      ElMessage.success(t('common.success'))
      loadTree()
      loadEmployees()
      if (currentDept.value?.id === data.id) currentDept.value = null
    })
    .catch(() => {})
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (isEdit.value) {
      await deptApi.update(formData.value)
    } else {
      await deptApi.create(formData.value)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    loadTree()
  } catch (e) {
    // ignore
  }
}

/** 加人目标部门:默认当前部门;从分组组头点「+ 加人」时是对应下级部门 */
const memberTargetDept = ref<any>(null)

const openMemberDialog = async (dept?: any) => {
  const target = dept || currentDept.value
  if (!target?.id) {
    ElMessage.warning(t('org.selectDeptTip'))
    return
  }
  memberTargetDept.value = target
  if (!allEmployees.value.length) await loadEmployees()
  memberDialog.value.employeeIds = []
  memberDialog.value.visible = true
}

const submitMembers = async () => {
  if (!memberTargetDept.value?.id || !memberDialog.value.employeeIds.length) {
    ElMessage.warning('请选择要添加的员工')
    return
  }
  memberDialog.value.saving = true
  try {
    for (const employeeId of memberDialog.value.employeeIds) {
      const detail = await employeeApi.detail(employeeId)
      await employeeApi.update({
        ...detail.data,
        deptId: memberTargetDept.value.id
      })
    }
    ElMessage.success(`成员已添加到「${memberTargetDept.value.deptName || '当前部门'}」`)
    memberDialog.value.visible = false
    await loadEmployees()
  } catch {
    ElMessage.error('添加成员失败,请稍后再试')
  } finally {
    memberDialog.value.saving = false
  }
}

const OrgChartNode = defineComponent({
  name: 'OrgChartNode',
  props: {
    node: { type: Object as PropType<any>, required: true },
    membersMap: { type: Object as PropType<Record<number, any[]>>, default: () => ({}) },
    activeId: { type: Number, default: undefined }
  },
  emits: ['node-click'],
  setup(props, { emit }) {
    const renderMembers = (members: any[]) => {
      if (!members.length) return h('div', { class: 'chart-member-empty' }, '暂无成员')
      return h('div', { class: 'chart-members' }, [
        ...members.slice(0, 4).map((member: any) =>
          h('span', { class: 'chart-member-pill', title: member.name || member.username }, employeeInitial(member))
        ),
        members.length > 4 ? h('span', { class: 'chart-member-more' }, `+${members.length - 4}`) : null
      ])
    }

    return () => {
      const members = props.membersMap[props.node.id] || []
      const children = Array.isArray(props.node.children) ? props.node.children : []
      return h('div', { class: 'org-chart-node' }, [
        h('button', {
          type: 'button',
          class: ['org-chart-card',
            props.node.id === props.activeId ? 'is-active' : '',
            !props.node.leader ? 'is-no-leader' : '',
            chartDragOverId.value === props.node.id ? 'is-drop-over' : '',
            chartDragNode.value && chartDragNode.value.id === props.node.id ? 'is-dragging' : ''
          ],
          'data-dept-id': props.node.id,
          'data-dept-label': props.node.deptName || props.node.label,
          onMousedown: (e: MouseEvent) => onChartCardDown(props.node, e),
          onClick: () => emit('node-click', props.node)
        }, [
          h('strong', props.node.deptName || props.node.label || '未命名部门'),
          h('span', { class: ['chart-card-meta', !props.node.leader ? 'meta-warn' : ''] },
            props.node.leader ? `${members.length}人 · ${props.node.leader}` : `${members.length}人 · ⚠ 未设负责人`),
          renderMembers(members)
        ]),
        children.length
          ? h('div', { class: 'org-chart-children' }, children.map((child: any) =>
            h(OrgChartNode, {
              key: child.id,
              node: child,
              membersMap: props.membersMap,
              activeId: props.activeId,
              'onNode-click': (node: any) => emit('node-click', node)
            })
          ))
          : null
      ])
    }
  }
})

loadTree()
loadEmployees()
</script>

<style scoped>
/* ===== 改版:顶栏 + 架构总览 + 管理页行式成员 ===== */
.dept-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.dept-topbar-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.dept-topbar-title h3 { margin: 0; font-size: 18px; font-weight: 600; color: #1f2937; }
.dept-topbar-actions { display: flex; align-items: center; gap: 10px; }
.dt-pill {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  white-space: nowrap;
}
.dt-pill.warn { border-color: #fbd38d; background: #fef8ec; color: #92600a; }
.chart-overview {
  background: #ffffff;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  padding: 14px 16px;
}
.chart-overview-tip { margin-bottom: 10px; font-size: 12px; color: #94a3b8; }
.overview-scroll { overflow-x: auto; padding: 8px 4px 16px; }
.mg-header { align-items: center; }
.mg-title { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mg-title h3 { margin: 0; }
.mg-rows { border: 1px solid #eef2f7; border-radius: 8px; overflow: hidden; }
.mg-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px;
  background: #ffffff;
}
.mg-row + .mg-row { border-top: 1px solid #f1f5f9; }
.mg-row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.mg-row-main strong { font-size: 13px; color: #1f2937; }
.mg-row-main span { font-size: 12px; color: #94a3b8; }
.mg-row-add {
  width: 100%;
  justify-content: center;
  border: none;
  border-top: 1px dashed #e2e8f0 !important;
  color: #94a3b8;
  font-size: 12.5px;
  cursor: pointer;
}
.mg-row-add:hover { color: var(--el-color-primary); background: #f8fafc; }
/* ===== 左栏:彩色方章树 ===== */
.tree-head { display: flex; align-items: center; gap: 8px; }
.tree-head-title { font-size: 14px; font-weight: 600; color: #1f2937; }
.tree-head-sub { font-size: 11.5px; color: #94a3b8; }
.tree-head-add { margin-left: auto; border-radius: 8px; }
.tree-chip {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10.5px;
  font-weight: 600;
  flex: none;
}
.tree-chip .el-icon { font-size: 12px; }
.tree-chip.chip-gray { background: #f1efe8; color: #5f5e5a; }
.tree-chip.chip-blue { background: #e6f1fb; color: #0c447c; }
.tree-chip.chip-green { background: #e1f5ee; color: #085041; }
.tree-chip.chip-coral { background: #faece7; color: #712b13; }
.tree-chip.chip-purple { background: #eeedfe; color: #3c3489; }
.tree-chip.chip-pink { background: #fbeaf0; color: #72243e; }
.tree-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12.5px;
}
.tree-warn-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef9f27;
  flex: none;
}
.tree-cnt {
  margin-left: auto;
  font-style: normal;
  font-size: 10.5px;
  color: #94a3b8;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 999px;
  padding: 0 7px;
  line-height: 16px;
  flex: none;
}
.tree-warn-card {
  display: flex;
  align-items: center;
  gap: 6px;
  width: calc(100% - 8px);
  margin: 10px 4px 2px;
  padding: 9px 12px;
  border: 1px solid #f2d9a0;
  border-radius: 8px;
  background: #fff8ec;
  color: #7b4e0a;
  font-size: 12px;
  cursor: pointer;
  text-align: left;
}
.tree-warn-card b { margin-left: auto; color: #b97a12; font-weight: 600; white-space: nowrap; }
.tree-warn-card:hover { background: #fdf1da; }
:deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 8px;
  margin: 1px 0;
}
:deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: #e6f1fb;
}
:deep(.el-tree-node.is-current > .el-tree-node__content .tree-name) {
  color: #0c447c;
  font-weight: 600;
}
:deep(.el-tree-node.is-current > .el-tree-node__content .tree-cnt) {
  background: #ffffff;
  border-color: #b5d4f4;
  color: #185fa5;
}
.tree-filter :deep(.el-input__wrapper) { border-radius: 9px; }

/* ===== 定稿版:部门主页卡 + 分组花名册 ===== */
.dm-hero {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 12px;
  margin-bottom: 14px;
}
.dm-hero-avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: #e6f1fb;
  color: #0c447c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 17px;
  font-weight: 600;
  flex: none;
}
.dm-hero-avatar.all { background: #eef2f7; color: #475569; }
.dm-hero-main { flex: 1; min-width: 0; }
.dm-hero-title { display: flex; align-items: center; gap: 8px; }
.dm-hero-title h3 { margin: 0; font-size: 16px; font-weight: 600; color: #1f2937; }
.dm-hero-pills { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
.dm-clickable { cursor: pointer; }
.dm-roster-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}
.dm-roster-bar strong { font-size: 14px; color: #1f2937; }
.dm-roster-bar small { margin-left: auto; color: #94a3b8; font-size: 11.5px; }
.dm-search { width: 280px; }
.dm-roster { border: 1px solid #eef2f7; border-radius: 12px; overflow: hidden; background: #ffffff; }
.dm-gh {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
}
.dm-gh + .dm-gh, .dm-mr + .dm-gh, .dm-empty + .dm-gh { border-top: 1px solid #eef2f7; }
.dm-gh-child { cursor: pointer; }
.dm-gh.warn { background: #fffbf2; color: #7b4e0a; }
.dm-gh-cnt { color: #94a3b8; font-weight: 400; font-size: 12px; }
.dm-gh.warn .dm-gh-cnt { color: #a16b12; }
.dm-gh-ops { margin-left: auto; display: flex; gap: 12px; }
.dm-gh-ops a { color: var(--el-color-primary); font-size: 12px; font-weight: 400; cursor: pointer; }
.dm-gh-ops a.dm-warn-op { color: #b97a12; font-weight: 600; }
.dm-mr {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-top: 1px solid #f1f5f9;
  font-size: 13px;
}
.dm-mr:hover { background: #f8fafc; }
.dm-mr-mid { width: 150px; flex: none; color: #64748b; font-size: 12px; }
.dm-mr-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.dm-mr-main strong { font-size: 13px; color: #1f2937; font-weight: 500; }
.dm-mr-main span { font-size: 11.5px; color: #94a3b8; }
.dm-star { font-style: normal; color: #b97a12; font-size: 11px; margin-left: 6px; }
.dm-mr-tail { display: flex; align-items: center; gap: 10px; }
.dm-op { color: var(--el-color-primary); font-size: 12px; cursor: pointer; }
.dm-empty { padding: 24px 16px; border-top: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; text-align: center; }
.dm-foot {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  border-top: 1px solid #eef2f7;
  background: #f8fafc;
  font-size: 12px;
  color: #64748b;
}
.dm-foot a { color: var(--el-color-primary); cursor: pointer; }
.dm-foot-hint { margin-left: auto; color: #94a3b8; font-size: 11.5px; }

/* 架构图:缺负责人节点标黄 */
:deep(.org-chart-card.is-no-leader) { border-color: #f2c078; background: #fffdf8; }
:deep(.chart-card-meta.meta-warn) { color: #b7791f; }

.dept-layout {
  display: flex;
  gap: 16px;
  height: calc(100vh - 140px);
}
.dept-tree-panel {
  width: 300px;
  flex-shrink: 0;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  border: 1px solid var(--el-border-color-lighter);
}
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 15px;
}
.tree-filter {
  margin-bottom: 12px;
}
.all-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #334155;
  cursor: pointer;
  margin-bottom: 10px;
  border: 1px solid transparent;
}
.all-entry:hover { background: #f1f5f9; }
.all-entry.on { background: #e6f1fb; color: #0c447c; font-weight: 600; border-color: #b5d4f4; }
.all-entry em { margin-left: auto; font-style: normal; font-size: 11px; color: #94a3b8; background: #f8fafc; border: 1px solid #eef2f7; border-radius: 999px; padding: 0 8px; line-height: 16px; }
.all-entry.on em { background: #fff; border-color: #b5d4f4; color: #185fa5; }
.tree-node {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  padding-right: 8px;
}
.tree-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.tree-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tree-title em {
  flex-shrink: 0;
  padding: 1px 6px;
  border-radius: 999px;
  background: #eef3ff;
  color: #3370ff;
  font-size: 11px;
  font-style: normal;
  line-height: 18px;
}
.tree-actions {
  display: none;
}
.tree-node:hover .tree-actions {
  display: inline-flex;
  gap: 4px;
}
.action-icon {
  font-size: 14px;
  color: var(--el-color-primary);
  cursor: pointer;
}
.action-icon.danger {
  color: var(--el-color-danger);
}
.dept-detail-panel {
  flex: 1;
  background: var(--el-bg-color);
  border-radius: 8px;
  padding: 24px;
  border: 1px solid var(--el-border-color-lighter);
  overflow-y: auto;
}
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}
.detail-header h3 {
  margin: 0;
}
.detail-header p {
  margin: 6px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.detail-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.org-board {
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: #f8fafc;
}
.board-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}
.board-title span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.board-title small {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.org-chart-scroll {
  min-height: 260px;
  overflow: auto;
  padding: 20px;
}
.dept-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.dept-summary div {
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.dept-summary span {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.dept-summary b {
  display: block;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
  font-size: 18px;
}
.member-section {
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.section-header h4 {
  margin: 0;
  color: var(--el-text-color-primary);
}
.member-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
}
.member-card {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}
.member-card > div {
  min-width: 0;
  flex: 1;
}
.member-card strong,
.member-card p {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.member-card p {
  margin: 4px 0 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.member-card .el-tag {
  flex-shrink: 0;
}
.sub-dept-section {
  margin-top: 24px;
}
.sub-dept-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 10px;
}
.sub-dept-card {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.sub-dept-card:hover {
  border-color: #3370ff;
  box-shadow: 0 6px 18px rgb(51 112 255 / 12%);
}
.sub-dept-card strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-primary);
}
.sub-dept-card span {
  display: block;
  margin-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.member-alert {
  margin-bottom: 12px;
}
.member-dialog-tip {
  margin-top: 10px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
@media (max-width: 1200px) {
  .dept-layout {
    height: auto;
    min-height: calc(100vh - 140px);
  }
  .dept-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 900px) {
  .dept-layout {
    flex-direction: column;
  }
  .dept-tree-panel {
    width: auto;
    max-height: 360px;
  }
  .detail-header {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>

<style>
.org-chart-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 180px;
}
.org-chart-card {
  min-width: 176px;
  max-width: 220px;
  padding: 12px 14px;
  border: 1px solid #d9e2ff;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 4px 12px rgb(30 58 138 / 8%);
  color: #1f2937;
  cursor: grab;
  text-align: center;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  user-select: none;
}
.org-chart-card:active {
  cursor: grabbing;
}
.org-chart-card:hover,
.org-chart-card.is-active {
  border-color: #3370ff;
  box-shadow: 0 10px 24px rgb(51 112 255 / 14%);
  transform: translateY(-1px);
}
/* 拖拽中:被拖卡片半透明 */
.org-chart-card.is-dragging {
  opacity: 0.4;
}
/* 拖到合法目标上:绿色高亮(放这里=变成它的下级) */
.org-chart-card.is-drop-over {
  border-color: #67c23a !important;
  background: #f0f9eb !important;
  box-shadow: 0 0 0 3px rgb(103 194 58 / 35%) !important;
}
/* 跟随光标的拖拽影子 */
.chart-drag-ghost {
  position: fixed;
  z-index: 3000;
  padding: 8px 16px;
  background: #3370ff;
  color: #fff;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  pointer-events: none;
  box-shadow: 0 6px 16px rgb(0 0 0 / 25%);
  white-space: nowrap;
}
.org-chart-card strong {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}
.chart-card-meta {
  display: block;
  margin-top: 6px;
  color: #64748b;
  font-size: 12px;
}
.chart-members {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-top: 10px;
}
.chart-member-pill,
.chart-member-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3370ff;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.chart-member-more {
  background: #e8edf7;
  color: #3370ff;
}
.chart-member-empty {
  margin-top: 8px;
  color: #94a3b8;
  font-size: 12px;
}
.org-chart-children {
  position: relative;
  display: flex;
  gap: 18px;
  margin-top: 0;
  padding-top: 30px; /* 连接线区域:父竖线15 + 子竖线15 */
}
/* ① 父卡片往下到横线的竖线(容器顶 y=0 → 横线 y=15) */
.org-chart-children::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 15px;
  border-left: 2px solid #b8c6e8;
}
/* ② 横线往下到每个子卡片的竖线(横线 y=15 → 卡片顶) */
.org-chart-children > .org-chart-node::before {
  content: '';
  position: absolute;
  top: -15px;
  left: 50%;
  width: 0;
  height: 15px;
  border-left: 2px solid #b8c6e8;
}
/* ③ 连接所有子节点的横线(每个节点画一段、跨过 gap 相接;首尾裁到中心) */
.org-chart-children > .org-chart-node::after {
  content: '';
  position: absolute;
  top: -15px;
  left: -9px;
  width: calc(100% + 18px);
  border-top: 2px solid #b8c6e8;
}
.org-chart-children > .org-chart-node:first-child::after {
  left: 50%;
  width: calc(50% + 9px);
}
.org-chart-children > .org-chart-node:last-child::after {
  left: -9px;
  width: calc(50% + 9px);
}
/* 独子:不需要横线(父竖线与子竖线在中线对齐直接相连) */
.org-chart-children > .org-chart-node:only-child::after {
  display: none;
}
@media (max-width: 900px) {
  .org-chart-children {
    gap: 12px;
  }
  .org-chart-children > .org-chart-node::after {
    left: -6px;
    width: calc(100% + 12px);
  }
  .org-chart-children > .org-chart-node:first-child::after {
    left: 50%;
    width: calc(50% + 6px);
  }
  .org-chart-children > .org-chart-node:last-child::after {
    left: -6px;
    width: calc(50% + 6px);
  }
}
</style>

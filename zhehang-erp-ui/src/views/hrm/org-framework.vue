<template>
  <div class="og-page">
    <!-- 装饰性背景 -->
    <div class="og-bg">
      <div class="og-bg__grid"></div>
      <div class="og-bg__vignette"></div>
      <div class="og-bg__rays"></div>
    </div>

    <!-- 顶部操作栏 -->
    <header class="og-header">
      <div class="og-title">
        <span class="og-title__mark">◆</span>
        <div class="og-title__text">
          <h1>组织框架</h1>
          <p>Organizational Framework · 浙杭企服</p>
        </div>
        <span class="og-title__mark og-title__mark--right">◆</span>
      </div>

      <div class="og-toolbar">
        <div class="og-search">
          <el-icon class="og-search__icon"><Search /></el-icon>
          <input
            v-model="keyword"
            class="og-search__input"
            placeholder="搜索部门 / 负责人"
            @input="onSearch"
          />
          <span v-if="keyword" class="og-search__clear" @click="clearSearch">×</span>
        </div>

        <div class="og-actions">
          <button class="og-btn" @click="expandAll">
            <el-icon><Expand /></el-icon><span>展开全部</span>
          </button>
          <button class="og-btn" @click="collapseAll">
            <el-icon><Fold /></el-icon><span>收起全部</span>
          </button>
          <span class="og-divider"></span>
          <button class="og-btn og-btn--icon" @click="zoomIn" title="放大">
            <el-icon><ZoomIn /></el-icon>
          </button>
          <button class="og-btn og-btn--icon" @click="zoomOut" title="缩小">
            <el-icon><ZoomOut /></el-icon>
          </button>
          <button class="og-btn og-btn--icon" @click="resetZoom" title="重置">
            <el-icon><RefreshRight /></el-icon>
          </button>
          <span class="og-zoom-indicator">{{ Math.round(transform.scale * 100) }}%</span>
        </div>
      </div>
    </header>

    <!-- 主体：左侧画布 + 右侧详情面板 -->
    <main class="og-main">
      <section
        class="og-canvas"
        ref="canvasRef"
        @mousedown="startDrag"
        @wheel.prevent="handleWheel"
        :class="{ 'og-canvas--grabbing': isDragging }"
      >
        <!-- 角部装饰 -->
        <span class="og-corner og-corner--tl"></span>
        <span class="og-corner og-corner--tr"></span>
        <span class="og-corner og-corner--bl"></span>
        <span class="og-corner og-corner--br"></span>

        <!-- 画布内容 -->
        <div class="og-stage" :style="stageStyle">
          <div v-if="filteredTree.length" class="og-tree-root">
            <OrgNode
              :nodes="filteredTree"
              :selected-id="selected?.id"
              :collapsed-set="collapsedIds"
              @node-click="onNodeClick"
              @toggle="onToggle"
            />
          </div>
          <div v-else class="og-empty">
            <span class="og-empty__icon">∅</span>
            <p>未匹配到任何部门</p>
          </div>
        </div>

        <!-- 浮动小提示 -->
        <div class="og-hint">
          <span>滚轮缩放 · 拖拽平移 · 点击节点查看详情</span>
        </div>
      </section>

      <!-- 侧边详情面板 -->
      <aside class="og-detail" :class="{ 'og-detail--open': detailOpen }">
        <div v-if="selected" class="og-detail__inner">
          <div class="og-detail__head">
            <div class="og-detail__index">No. {{ String(selected.id).padStart(3, '0') }}</div>
            <button class="og-detail__close" @click="closeDetail">×</button>
          </div>

          <h2 class="og-detail__title">{{ selected.label }}</h2>
          <div class="og-detail__deco">
            <span></span><i>◆</i><span></span>
          </div>

          <div class="og-detail__meta">
            <div class="og-meta-item">
              <span class="og-meta__k">负责人</span>
              <span class="og-meta__v">{{ selected.leader || '—' }}</span>
            </div>
            <div class="og-meta-item">
              <span class="og-meta__k">成员数</span>
              <span class="og-meta__v og-meta__v--num">{{ selected.memberCount || 0 }}</span>
            </div>
            <div class="og-meta-item">
              <span class="og-meta__k">状态</span>
              <span
                class="og-status"
                :class="selected.status === 0 ? 'og-status--ok' : 'og-status--off'"
              >
                {{ selected.status === 0 ? '正常运转' : '已停用' }}
              </span>
            </div>
          </div>

          <div class="og-detail__section">
            <div class="og-section__title">部门职责</div>
            <p class="og-section__desc">{{ selected.description || '暂无描述。' }}</p>
          </div>

          <div class="og-detail__section">
            <div class="og-section__title">
              <span>成员名册</span>
              <span class="og-section__count">{{ (selected.members || []).length }}</span>
            </div>
            <ul class="og-member-list">
              <li
                v-for="m in selected.members || []"
                :key="m.name"
                class="og-member"
              >
                <span class="og-member__avatar">{{ m.name.slice(-2) }}</span>
                <div class="og-member__info">
                  <div class="og-member__name">{{ m.name }}</div>
                  <div class="og-member__role">{{ m.role }}</div>
                </div>
              </li>
              <li v-if="!(selected.members || []).length" class="og-member og-member--empty">
                暂无成员数据
              </li>
            </ul>
          </div>
        </div>
        <div v-else class="og-detail__placeholder">
          <span>◇</span>
          <p>选择左侧任一部门<br />查看详细信息</p>
        </div>
      </aside>
    </main>

    <!-- 底部统计 -->
    <footer class="og-footer">
      <div class="og-stat">
        <div class="og-stat__num">{{ stats.deptCount }}</div>
        <div class="og-stat__label">DEPARTMENTS · 部门总数</div>
      </div>
      <span class="og-stat-sep">/</span>
      <div class="og-stat">
        <div class="og-stat__num">{{ stats.totalMembers }}</div>
        <div class="og-stat__label">HEADCOUNT · 总人数</div>
      </div>
      <span class="og-stat-sep">/</span>
      <div class="og-stat">
        <div class="og-stat__num">{{ stats.avg }}</div>
        <div class="og-stat__label">AVG/DEPT · 平均人数</div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import {
  Search,
  Expand,
  Fold,
  ZoomIn,
  ZoomOut,
  RefreshRight
} from '@element-plus/icons-vue'
import { deptApi, structureApi } from '@/api/org'

// ========= 类型定义 =========
interface OrgNodeData {
  id: number
  label: string
  leader?: string
  memberCount?: number
  status?: number
  description?: string
  members?: { name: string; role: string }[]
  children?: OrgNodeData[]
}

// ========= 状态 =========
const canvasRef = ref<HTMLElement>()
const rawTree = ref<OrgNodeData[]>([])
const keyword = ref('')
const selected = ref<OrgNodeData | null>(null)
const detailOpen = ref(false)
const collapsedIds = ref<Set<number>>(new Set())

const transform = reactive({ scale: 0.95, x: 0, y: 0 })
const isDragging = ref(false)
const dragStart = reactive({ x: 0, y: 0, sx: 0, sy: 0 })

const stageStyle = computed(() => ({
  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`
}))

// ========= Mock 数据（API 不可用时回退） =========
const mockTree: OrgNodeData[] = [
  {
    id: 1,
    label: '浙杭企服总部',
    leader: '苏景行',
    memberCount: 58,
    status: 0,
    description: '集团总部，统筹各事业部战略落地与资源调度，承担最终决策与重大投资审批职能。',
    members: [
      { name: '苏景行', role: '董事长' },
      { name: '陆思恒', role: '总裁' },
      { name: '林溪月', role: '首席运营官' }
    ],
    children: [
      {
        id: 11,
        label: '总经办',
        leader: '林溪月',
        memberCount: 3,
        status: 0,
        description: '负责高层会议组织、战略事项跟进与对外重要事务协调。',
        members: [
          { name: '林溪月', role: '总经办主任' },
          { name: '裴知夏', role: '战略秘书' },
          { name: '宋意安', role: '行政助理' }
        ]
      },
      {
        id: 12,
        label: '销售部',
        leader: '陈砚清',
        memberCount: 12,
        status: 0,
        description: '主导客户开发、订单签约与回款跟踪，是公司收入的核心引擎。',
        members: [
          { name: '陈砚清', role: '销售总监' },
          { name: '韩星驰', role: '销售经理' },
          { name: '白书言', role: '销售经理' }
        ],
        children: [
          {
            id: 121,
            label: '销售一组',
            leader: '韩星驰',
            memberCount: 6,
            status: 0,
            description: '负责华东区域大客户拓展与维护。',
            members: [
              { name: '韩星驰', role: '组长' },
              { name: '岑云栖', role: '销售代表' },
              { name: '景听澜', role: '销售代表' }
            ]
          },
          {
            id: 122,
            label: '销售二组',
            leader: '白书言',
            memberCount: 6,
            status: 0,
            description: '负责华南、华北及海外渠道客户。',
            members: [
              { name: '白书言', role: '组长' },
              { name: '柏寒生', role: '销售代表' },
              { name: '沈微澜', role: '销售代表' }
            ]
          }
        ]
      },
      {
        id: 13,
        label: '技术部',
        leader: '顾衡之',
        memberCount: 15,
        status: 0,
        description: '产品研发与技术架构演进的执行单元，下设前端、后端与测试三个专业小组。',
        members: [
          { name: '顾衡之', role: '技术总监' },
          { name: '云知白', role: '架构师' },
          { name: '霍听风', role: '技术经理' }
        ],
        children: [
          {
            id: 131,
            label: '前端组',
            leader: '云知白',
            memberCount: 5,
            status: 0,
            description: 'Web 与移动端界面的设计实现、交互工程与性能优化。',
            members: [
              { name: '云知白', role: '组长' },
              { name: '苏念洲', role: '前端工程师' },
              { name: '池清晏', role: '前端工程师' }
            ]
          },
          {
            id: 132,
            label: '后端组',
            leader: '霍听风',
            memberCount: 6,
            status: 0,
            description: '业务服务与数据中台的开发、稳定性保障。',
            members: [
              { name: '霍听风', role: '组长' },
              { name: '商景澈', role: '后端工程师' },
              { name: '楚知白', role: '后端工程师' }
            ]
          },
          {
            id: 133,
            label: '测试组',
            leader: '安疏桐',
            memberCount: 4,
            status: 0,
            description: '负责需求验证、自动化测试体系搭建与质量度量。',
            members: [
              { name: '安疏桐', role: '组长' },
              { name: '白未晞', role: '测试工程师' }
            ]
          }
        ]
      },
      {
        id: 14,
        label: '财务部',
        leader: '夏槿言',
        memberCount: 5,
        status: 0,
        description: '集团账务核算、税务筹划、预算管理与资金调度。',
        members: [
          { name: '夏槿言', role: '财务总监' },
          { name: '柳承欢', role: '财务主管' }
        ]
      },
      {
        id: 15,
        label: '行政部',
        leader: '苏念安',
        memberCount: 4,
        status: 0,
        description: '办公环境维护、资产管理、对外接待与综合事务保障。',
        members: [
          { name: '苏念安', role: '行政经理' },
          { name: '池晚辞', role: '行政专员' }
        ]
      },
      {
        id: 16,
        label: '人力资源部',
        leader: '宋时予',
        memberCount: 3,
        status: 0,
        description: '招聘选拔、员工关系、培训发展与绩效薪酬体系建设。',
        members: [
          { name: '宋时予', role: 'HR 总监' },
          { name: '叶疏影', role: 'HRBP' },
          { name: '阮云裳', role: '招聘专员' }
        ]
      },
      {
        id: 17,
        label: '市场部',
        leader: '江辞欢',
        memberCount: 6,
        status: 0,
        description: '品牌建设、市场活动策划与公开渠道传播。',
        members: [
          { name: '江辞欢', role: '市场总监' },
          { name: '谢临川', role: '品牌经理' }
        ]
      }
    ]
  }
]

// ========= 数据加载 =========
const loadTree = async () => {
  try {
    const res: any = await structureApi.tree()
    const data = res?.data
    if (Array.isArray(data) && data.length) {
      rawTree.value = data
      return
    }
    // 二次尝试
    const res2: any = await deptApi.tree()
    if (Array.isArray(res2?.data) && res2.data.length) {
      rawTree.value = res2.data
      return
    }
    throw new Error('empty')
  } catch (e) {
    rawTree.value = mockTree
  }
}

// ========= 搜索过滤 =========
const filteredTree = computed<OrgNodeData[]>(() => {
  if (!keyword.value.trim()) return rawTree.value
  const kw = keyword.value.trim().toLowerCase()
  const walk = (list: OrgNodeData[]): OrgNodeData[] => {
    const result: OrgNodeData[] = []
    for (const n of list) {
      const hit =
        n.label?.toLowerCase().includes(kw) ||
        n.leader?.toLowerCase().includes(kw)
      const childHit = n.children ? walk(n.children) : []
      if (hit || childHit.length) {
        result.push({ ...n, children: childHit.length ? childHit : n.children })
      }
    }
    return result
  }
  return walk(rawTree.value)
})

const onSearch = () => {
  // 搜索时默认展开
  if (keyword.value.trim()) collapsedIds.value = new Set()
}
const clearSearch = () => {
  keyword.value = ''
}

// ========= 节点交互 =========
const onNodeClick = (node: OrgNodeData) => {
  selected.value = node
  detailOpen.value = true
}
const onToggle = (id: number) => {
  const set = new Set(collapsedIds.value)
  set.has(id) ? set.delete(id) : set.add(id)
  collapsedIds.value = set
}
const closeDetail = () => {
  detailOpen.value = false
  setTimeout(() => (selected.value = null), 240)
}

// ========= 展开 / 收起 =========
const collectIds = (list: OrgNodeData[], out: number[] = []): number[] => {
  for (const n of list) {
    if (n.children?.length) {
      out.push(n.id)
      collectIds(n.children, out)
    }
  }
  return out
}
const expandAll = () => {
  collapsedIds.value = new Set()
}
const collapseAll = () => {
  collapsedIds.value = new Set(collectIds(rawTree.value))
}

// ========= 缩放 =========
const zoomIn = () => {
  transform.scale = Math.min(+(transform.scale + 0.1).toFixed(2), 2)
}
const zoomOut = () => {
  transform.scale = Math.max(+(transform.scale - 0.1).toFixed(2), 0.3)
}
const resetZoom = () => {
  transform.scale = 0.95
  transform.x = 0
  transform.y = 0
}
const handleWheel = (e: WheelEvent) => {
  if (e.deltaY < 0) zoomIn()
  else zoomOut()
}

// ========= 拖拽 =========
const startDrag = (e: MouseEvent) => {
  // 仅在点击空白区域时拖拽
  const target = e.target as HTMLElement
  if (target.closest('.og-node')) return
  isDragging.value = true
  dragStart.x = e.clientX
  dragStart.y = e.clientY
  dragStart.sx = transform.x
  dragStart.sy = transform.y
  const onMove = (ev: MouseEvent) => {
    if (!isDragging.value) return
    transform.x = dragStart.sx + (ev.clientX - dragStart.x)
    transform.y = dragStart.sy + (ev.clientY - dragStart.y)
  }
  const onUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

// ========= 统计 =========
const stats = computed(() => {
  let dept = 0
  let total = 0
  const walk = (list: OrgNodeData[]) => {
    for (const n of list) {
      dept += 1
      total += n.memberCount || 0
      if (n.children?.length) walk(n.children)
    }
  }
  walk(rawTree.value)
  const avg = dept ? Math.round((total / dept) * 10) / 10 : 0
  return { deptCount: dept, totalMembers: total, avg }
})

onMounted(async () => {
  await loadTree()
  await nextTick()
})
</script>

<script lang="ts">
import { defineComponent, h, PropType } from 'vue'

// 递归节点组件
const OrgNode = defineComponent({
  name: 'OrgNode',
  props: {
    nodes: { type: Array as PropType<any[]>, default: () => [] },
    selectedId: { type: [Number, String], default: null },
    collapsedSet: { type: Object as PropType<Set<number>>, default: () => new Set() }
  },
  emits: ['node-click', 'toggle'],
  setup(props, { emit }) {
    return () => {
      if (!props.nodes.length) return null
      return h(
        'ul',
        { class: 'og-tree' },
        props.nodes.map((node: any) => {
          const collapsed = props.collapsedSet.has(node.id)
          const hasChildren = !!(node.children && node.children.length)
          const isSelected = props.selectedId === node.id
          const status = node.status === 0 || node.status === undefined ? 'ok' : 'off'
          return h('li', { key: node.id, class: 'og-tree__item' }, [
            h(
              'div',
              {
                class: [
                  'og-node',
                  isSelected && 'og-node--selected',
                  status === 'off' && 'og-node--off'
                ],
                onClick: (e: Event) => {
                  e.stopPropagation()
                  emit('node-click', node)
                }
              },
              [
                h('span', { class: 'og-node__corner og-node__corner--tl' }),
                h('span', { class: 'og-node__corner og-node__corner--tr' }),
                h('span', { class: 'og-node__corner og-node__corner--bl' }),
                h('span', { class: 'og-node__corner og-node__corner--br' }),

                h('div', { class: 'og-node__head' }, [
                  h('span', { class: 'og-node__name' }, node.label),
                  h(
                    'span',
                    {
                      class: ['og-node__status', `og-node__status--${status}`]
                    },
                    status === 'ok' ? '正常' : '停用'
                  )
                ]),
                h('div', { class: 'og-node__body' }, [
                  h('span', { class: 'og-node__leader' }, [
                    h('i', null, '负责人'),
                    h('em', null, node.leader || '—')
                  ]),
                  h(
                    'span',
                    { class: 'og-node__count' },
                    `${node.memberCount || 0} 人`
                  )
                ]),

                hasChildren
                  ? h(
                      'button',
                      {
                        class: ['og-node__toggle', collapsed && 'is-collapsed'],
                        onClick: (e: Event) => {
                          e.stopPropagation()
                          emit('toggle', node.id)
                        }
                      },
                      collapsed ? '+' : '−'
                    )
                  : null
              ]
            ),
            hasChildren && !collapsed
              ? h(OrgNode, {
                  nodes: node.children,
                  selectedId: props.selectedId,
                  collapsedSet: props.collapsedSet,
                  'onNode-click': (n: any) => emit('node-click', n),
                  onToggle: (id: number) => emit('toggle', id)
                })
              : null
          ])
        })
      )
    }
  }
})

export { OrgNode }
export default { name: 'HrmOrgFramework' }
</script>

<style scoped>
/* ============ 字体引入 ============ */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Manrope:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500&display=swap');

.og-page {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 100px);
  padding: 28px 32px 24px;
  color: #E8E2CF;
  background: #0A0A0F;
  font-family: 'Manrope', -apple-system, sans-serif;
  overflow: hidden;
}

/* ============ 装饰背景 ============ */
.og-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.og-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(212, 175, 55, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 70% at center, #000 35%, transparent 90%);
}
.og-bg__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse at top,
    rgba(212, 175, 55, 0.08) 0%,
    transparent 55%
  );
}
.og-bg__rays {
  position: absolute;
  top: -10%;
  left: 50%;
  width: 1200px;
  height: 600px;
  transform: translateX(-50%);
  background:
    conic-gradient(
      from 90deg at 50% 100%,
      transparent 0deg,
      rgba(212, 175, 55, 0.06) 30deg,
      transparent 60deg,
      rgba(212, 175, 55, 0.04) 120deg,
      transparent 150deg
    );
  filter: blur(2px);
  opacity: 0.6;
}

/* ============ 标题 ============ */
.og-header {
  position: relative;
  z-index: 1;
  margin-bottom: 22px;
}
.og-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;
  margin-bottom: 22px;
}
.og-title__mark {
  font-size: 10px;
  color: #D4AF37;
  letter-spacing: 4px;
  position: relative;
}
.og-title__mark::before,
.og-title__mark::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 90px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}
.og-title__mark::before { right: calc(100% + 10px); }
.og-title__mark::after { left: calc(100% + 10px); }
.og-title__mark--right::before {
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5));
}
.og-title__mark--right::after {
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.5), transparent);
}
.og-title__text {
  text-align: center;
}
.og-title__text h1 {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 30px;
  letter-spacing: 8px;
  color: #F5E9C8;
  background: linear-gradient(180deg, #F5E9C8 0%, #D4AF37 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}
.og-title__text p {
  margin: 4px 0 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 5px;
  color: rgba(212, 175, 55, 0.55);
  text-transform: uppercase;
}

/* ============ 工具栏 ============ */
.og-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  background: rgba(18, 18, 26, 0.6);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  backdrop-filter: blur(8px);
}
.og-search {
  position: relative;
  display: flex;
  align-items: center;
  flex: 0 0 320px;
  height: 36px;
  padding: 0 12px;
  background: rgba(10, 10, 15, 0.7);
  border: 1px solid rgba(212, 175, 55, 0.18);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.og-search:focus-within {
  border-color: rgba(212, 175, 55, 0.55);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.08);
}
.og-search__icon {
  color: rgba(212, 175, 55, 0.7);
  margin-right: 8px;
}
.og-search__input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #E8E2CF;
  font-family: 'Manrope', sans-serif;
  font-size: 13px;
  letter-spacing: 0.5px;
}
.og-search__input::placeholder {
  color: rgba(232, 226, 207, 0.35);
}
.og-search__clear {
  cursor: pointer;
  width: 18px;
  height: 18px;
  line-height: 16px;
  text-align: center;
  border-radius: 50%;
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
  font-size: 14px;
  transition: background 0.15s;
}
.og-search__clear:hover { background: rgba(212, 175, 55, 0.3); }

.og-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.og-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 6px;
  color: #E8E2CF;
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.18s ease;
}
.og-btn:hover {
  border-color: #D4AF37;
  color: #D4AF37;
  background: rgba(212, 175, 55, 0.08);
  box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
}
.og-btn--icon {
  width: 32px;
  padding: 0;
  justify-content: center;
}
.og-divider {
  width: 1px;
  height: 18px;
  margin: 0 4px;
  background: rgba(212, 175, 55, 0.2);
}
.og-zoom-indicator {
  margin-left: 6px;
  padding: 0 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 1px;
  color: #D4AF37;
  border-left: 1px dashed rgba(212, 175, 55, 0.3);
}

/* ============ 主体 ============ */
.og-main {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  flex: 1;
  min-height: 540px;
}

/* ============ 画布 ============ */
.og-canvas {
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(18, 18, 26, 0.85), rgba(10, 10, 15, 0.85));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  cursor: grab;
}
.og-canvas--grabbing { cursor: grabbing; }
.og-canvas::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(212, 175, 55, 0.08) 1px, transparent 0);
  background-size: 24px 24px;
  pointer-events: none;
  mask-image: radial-gradient(ellipse at center, #000 50%, transparent 90%);
}

.og-corner {
  position: absolute;
  width: 22px;
  height: 22px;
  pointer-events: none;
  z-index: 2;
}
.og-corner--tl { top: 10px; left: 10px; border-top: 1px solid #D4AF37; border-left: 1px solid #D4AF37; }
.og-corner--tr { top: 10px; right: 10px; border-top: 1px solid #D4AF37; border-right: 1px solid #D4AF37; }
.og-corner--bl { bottom: 10px; left: 10px; border-bottom: 1px solid #D4AF37; border-left: 1px solid #D4AF37; }
.og-corner--br { bottom: 10px; right: 10px; border-bottom: 1px solid #D4AF37; border-right: 1px solid #D4AF37; }

.og-stage {
  display: inline-block;
  min-width: 100%;
  padding: 60px 40px;
  transform-origin: center top;
  transition: transform 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.og-tree-root {
  display: flex;
  justify-content: center;
}

.og-empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: rgba(212, 175, 55, 0.5);
  font-family: 'Cormorant Garamond', serif;
  letter-spacing: 3px;
}
.og-empty__icon {
  font-size: 48px;
  color: rgba(212, 175, 55, 0.3);
}

.og-hint {
  position: absolute;
  bottom: 14px;
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 14px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(212, 175, 55, 0.5);
  border: 1px dashed rgba(212, 175, 55, 0.25);
  border-radius: 20px;
  background: rgba(10, 10, 15, 0.6);
  pointer-events: none;
}

/* ============ 侧边详情 ============ */
.og-detail {
  position: relative;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(18, 18, 26, 0.95), rgba(10, 10, 15, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  overflow: hidden;
  transition: opacity 0.25s;
}
.og-detail--open .og-detail__inner {
  animation: og-slide-in 0.4s cubic-bezier(0.4, 0, 0.2, 1) both;
}
@keyframes og-slide-in {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}
.og-detail__inner {
  flex: 1;
  padding: 24px 22px;
  overflow-y: auto;
}
.og-detail__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.og-detail__index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 3px;
  color: #D4AF37;
  padding: 3px 10px;
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 4px;
}
.og-detail__close {
  width: 26px;
  height: 26px;
  background: transparent;
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 50%;
  color: rgba(212, 175, 55, 0.7);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: all 0.18s;
}
.og-detail__close:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
  color: #D4AF37;
  transform: rotate(90deg);
}
.og-detail__title {
  margin: 0;
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 26px;
  letter-spacing: 3px;
  color: #F5E9C8;
}
.og-detail__deco {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 10px 0 22px;
}
.og-detail__deco span {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}
.og-detail__deco i {
  color: #D4AF37;
  font-size: 10px;
  font-style: normal;
}
.og-detail__meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
  padding: 14px;
  margin-bottom: 20px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 8px;
}
.og-meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.og-meta-item:nth-child(3) { grid-column: span 2; }
.og-meta__k {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 2px;
  color: rgba(212, 175, 55, 0.7);
  text-transform: uppercase;
}
.og-meta__v {
  font-size: 14px;
  color: #E8E2CF;
  letter-spacing: 0.5px;
}
.og-meta__v--num {
  font-family: 'Cormorant Garamond', serif;
  font-size: 20px;
  font-weight: 600;
  color: #D4AF37;
  letter-spacing: 1px;
}
.og-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  width: fit-content;
  font-size: 11px;
  letter-spacing: 1.5px;
  border-radius: 3px;
}
.og-status::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.og-status--ok {
  background: rgba(76, 175, 90, 0.12);
  color: #92D89F;
  border: 1px solid rgba(76, 175, 90, 0.3);
}
.og-status--ok::before { background: #5CC571; box-shadow: 0 0 6px #5CC571; }
.og-status--off {
  background: rgba(220, 80, 80, 0.12);
  color: #F4A0A0;
  border: 1px solid rgba(220, 80, 80, 0.3);
}
.og-status--off::before { background: #DC5050; }

.og-detail__section { margin-bottom: 20px; }
.og-section__title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 3px;
  color: #D4AF37;
  text-transform: uppercase;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(212, 175, 55, 0.15);
}
.og-section__count {
  padding: 1px 8px;
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  font-size: 10px;
  color: #D4AF37;
}
.og-section__desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  color: rgba(232, 226, 207, 0.8);
  letter-spacing: 0.4px;
}
.og-member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.og-member {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(212, 175, 55, 0.04);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 6px;
  transition: all 0.18s;
}
.og-member:hover {
  background: rgba(212, 175, 55, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateX(2px);
}
.og-member--empty {
  justify-content: center;
  color: rgba(232, 226, 207, 0.4);
  font-size: 12px;
}
.og-member__avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cormorant Garamond', serif;
  font-size: 13px;
  font-weight: 600;
  color: #D4AF37;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  letter-spacing: 0;
}
.og-member__info { flex: 1; }
.og-member__name {
  font-size: 13px;
  color: #E8E2CF;
  letter-spacing: 0.5px;
}
.og-member__role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 1.5px;
  color: rgba(212, 175, 55, 0.6);
  margin-top: 2px;
}

.og-detail__placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: rgba(212, 175, 55, 0.5);
  text-align: center;
}
.og-detail__placeholder span {
  font-size: 56px;
  font-family: 'Cormorant Garamond', serif;
  color: rgba(212, 175, 55, 0.3);
}
.og-detail__placeholder p {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 3px;
  line-height: 1.8;
  margin: 0;
}

/* ============ 底部统计 ============ */
.og-footer {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin-top: 18px;
  padding: 18px 24px;
  background: linear-gradient(90deg, rgba(212, 175, 55, 0.04), rgba(212, 175, 55, 0.08), rgba(212, 175, 55, 0.04));
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
}
.og-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 140px;
}
.og-stat__num {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 36px;
  letter-spacing: 2px;
  color: #D4AF37;
  line-height: 1.1;
  text-shadow: 0 0 24px rgba(212, 175, 55, 0.4);
}
.og-stat__label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  letter-spacing: 3px;
  color: rgba(232, 226, 207, 0.6);
  margin-top: 6px;
  text-transform: uppercase;
}
.og-stat-sep {
  font-family: 'Cormorant Garamond', serif;
  font-size: 32px;
  color: rgba(212, 175, 55, 0.25);
  font-weight: 300;
}
</style>

<style>
/* ============ 树形结构（非 scoped，让递归节点继承） ============ */
.og-tree {
  display: flex;
  padding: 0;
  margin: 0;
  list-style: none;
  position: relative;
  padding-top: 36px;
}
.og-tree::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 0;
  height: 36px;
  border-left: 1px solid rgba(212, 175, 55, 0.4);
}
.og-tree__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  padding: 0 14px;
}
.og-tree__item::before,
.og-tree__item::after {
  content: '';
  position: absolute;
  top: 0;
  height: 36px;
  border-top: 1px solid rgba(212, 175, 55, 0.4);
}
.og-tree__item::before {
  left: 0;
  right: 50%;
  border-left: 1px solid rgba(212, 175, 55, 0.4);
}
.og-tree__item::after {
  left: 50%;
  right: 0;
  border-right: 1px solid rgba(212, 175, 55, 0.4);
}
.og-tree__item:first-child::before {
  border-left: none;
  left: 50%;
}
.og-tree__item:last-child::after {
  border-right: none;
  right: 50%;
}
.og-tree__item:only-child::before,
.og-tree__item:only-child::after {
  border-top: none;
}
.og-tree > .og-tree__item:only-child::before {
  border-left: 1px solid rgba(212, 175, 55, 0.4);
  left: 50%;
  right: auto;
  width: 0;
}
.og-tree__item > .og-tree {
  padding-top: 36px;
}

/* ============ 节点卡片（黑金 Art Deco） ============ */
.og-node {
  position: relative;
  min-width: 180px;
  padding: 14px 18px 12px;
  background: linear-gradient(155deg, rgba(24, 24, 32, 0.95), rgba(14, 14, 20, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.25);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Manrope', sans-serif;
  color: #E8E2CF;
  user-select: none;
}
.og-node::before {
  content: '';
  position: absolute;
  inset: 4px;
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 2px;
  pointer-events: none;
  transition: border-color 0.25s;
}
.og-node:hover {
  border-color: rgba(212, 175, 55, 0.65);
  transform: translateY(-3px);
  box-shadow:
    0 0 0 1px rgba(212, 175, 55, 0.15),
    0 8px 28px rgba(212, 175, 55, 0.18),
    0 4px 12px rgba(0, 0, 0, 0.5);
}
.og-node:hover::before {
  border-color: rgba(212, 175, 55, 0.4);
}
.og-node--selected {
  border-color: #D4AF37 !important;
  background: linear-gradient(155deg, rgba(40, 32, 14, 0.95), rgba(22, 18, 10, 0.95));
  box-shadow:
    0 0 0 1px rgba(212, 175, 55, 0.5),
    0 0 32px rgba(212, 175, 55, 0.35),
    0 8px 28px rgba(0, 0, 0, 0.5);
  animation: og-node-pulse 2.4s ease-in-out infinite;
}
.og-node--selected::before {
  border-color: rgba(212, 175, 55, 0.7);
}
@keyframes og-node-pulse {
  0%, 100% { box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.5), 0 0 32px rgba(212, 175, 55, 0.35), 0 8px 28px rgba(0, 0, 0, 0.5); }
  50% { box-shadow: 0 0 0 1px rgba(212, 175, 55, 0.7), 0 0 48px rgba(212, 175, 55, 0.5), 0 8px 28px rgba(0, 0, 0, 0.5); }
}

.og-node__corner {
  position: absolute;
  width: 8px;
  height: 8px;
  pointer-events: none;
  opacity: 0.7;
}
.og-node__corner--tl { top: -1px; left: -1px; border-top: 2px solid #D4AF37; border-left: 2px solid #D4AF37; }
.og-node__corner--tr { top: -1px; right: -1px; border-top: 2px solid #D4AF37; border-right: 2px solid #D4AF37; }
.og-node__corner--bl { bottom: -1px; left: -1px; border-bottom: 2px solid #D4AF37; border-left: 2px solid #D4AF37; }
.og-node__corner--br { bottom: -1px; right: -1px; border-bottom: 2px solid #D4AF37; border-right: 2px solid #D4AF37; }

.og-node__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(212, 175, 55, 0.18);
}
.og-node__name {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 16px;
  letter-spacing: 2px;
  color: #F5E9C8;
  white-space: nowrap;
}
.og-node--selected .og-node__name {
  color: #D4AF37;
}
.og-node__status {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 1.5px;
  padding: 1px 6px;
  border-radius: 2px;
}
.og-node__status--ok {
  background: rgba(76, 175, 90, 0.15);
  color: #92D89F;
  border: 1px solid rgba(76, 175, 90, 0.3);
}
.og-node__status--off {
  background: rgba(220, 80, 80, 0.15);
  color: #F4A0A0;
  border: 1px solid rgba(220, 80, 80, 0.3);
}

.og-node__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.og-node__leader {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 12px;
}
.og-node__leader i {
  font-style: normal;
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px;
  letter-spacing: 1.5px;
  color: rgba(212, 175, 55, 0.55);
}
.og-node__leader em {
  font-style: normal;
  color: #E8E2CF;
  letter-spacing: 0.5px;
}
.og-node__count {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 600;
  font-size: 13px;
  color: #D4AF37;
  padding: 1px 8px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 10px;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.og-node__toggle {
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 20px;
  background: #0A0A0F;
  border: 1px solid rgba(212, 175, 55, 0.5);
  border-radius: 50%;
  color: #D4AF37;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  z-index: 3;
  transition: all 0.18s;
}
.og-node__toggle:hover {
  background: rgba(212, 175, 55, 0.15);
  box-shadow: 0 0 8px rgba(212, 175, 55, 0.4);
  transform: translateX(-50%) scale(1.15);
}
.og-node__toggle.is-collapsed {
  background: rgba(212, 175, 55, 0.1);
}

.og-node--off {
  opacity: 0.55;
}

/* 入场动画 */
.og-tree__item {
  animation: og-node-fade-in 0.5s cubic-bezier(0.4, 0, 0.2, 1) both;
}
.og-tree__item:nth-child(1) { animation-delay: 0.05s; }
.og-tree__item:nth-child(2) { animation-delay: 0.12s; }
.og-tree__item:nth-child(3) { animation-delay: 0.19s; }
.og-tree__item:nth-child(4) { animation-delay: 0.26s; }
.og-tree__item:nth-child(5) { animation-delay: 0.33s; }
.og-tree__item:nth-child(6) { animation-delay: 0.40s; }
.og-tree__item:nth-child(7) { animation-delay: 0.47s; }
@keyframes og-node-fade-in {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

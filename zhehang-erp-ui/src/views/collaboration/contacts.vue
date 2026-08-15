<template>
  <div class="collab-page collab-contacts" :class="{ 'is-embedded': embedded }">
    <!-- 顶部标识区(嵌入到人文中心标签时隐藏,避免与页面 hero 重复) -->
    <header v-if="!embedded" class="page-header">
      <div class="header-meta">
        <span class="meta-tag">COLLAB · 02 / SHOWCASE</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDate }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">员工风采</span>
          <span class="title-en">Staff Showcase</span>
        </h1>
        <p class="page-desc">展示全员风采,点击头像可上传真实照片 · 浏览组织架构与同事联系方式</p>
      </div>
      <div class="header-decor">
        <div class="decor-line"></div>
        <div class="decor-dot"></div>
        <div class="decor-line short"></div>
      </div>
    </header>

    <!-- 数据指标条 -->
    <section v-if="!embedded" class="metric-strip">
      <div class="metric-item" v-for="(m, idx) in metrics" :key="idx">
        <div class="metric-index">0{{ idx + 1 }}</div>
        <div class="metric-value">{{ m.value }}</div>
        <div class="metric-label">{{ m.label }}</div>
      </div>
    </section>

    <!-- 搜索栏 -->
    <section class="search-bar">
      <el-input
        v-model="search"
        placeholder="搜索姓名、岗位、手机号、邮箱或工号"
        :prefix-icon="Search"
        clearable
        size="large"
      />
    </section>

    <!-- 主体工作区 -->
    <section class="content-section">
      <div class="section-head">
        <h2 class="section-title">组织 & 风采</h2>
        <span class="section-sub">SHOWCASE / TREE + WALL</span>
        <div class="view-switch">
          <span :class="{ active: view === 'card' }" @click="view = 'card'">
            <el-icon><Grid /></el-icon> 风采墙
          </span>
          <span :class="{ active: view === 'table' }" @click="view = 'table'">
            <el-icon><Menu /></el-icon> 列表
          </span>
        </div>
      </div>

      <div class="contact-workspace" v-loading="loading">
        <!-- 左侧：组织树 -->
        <aside class="org-tree">
          <div class="tree-head">
            <span class="tree-title">浙杭集团</span>
            <span class="tree-sub">{{ deptCount }} 部门 · {{ members.length }} 人</span>
          </div>
          <el-tree
            :data="treeData"
            :default-expanded-keys="['root']"
            :highlight-current="true"
            node-key="id"
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">{{ data.count }}</span>
              </span>
            </template>
          </el-tree>
        </aside>

        <!-- 右侧：成员展示 -->
        <main class="member-pane">
          <div class="member-pane-head">
            <div class="dept-info">
              <span class="dept-name">{{ activeDept }}</span>
              <span class="dept-meta">共 {{ filteredMembers.length }} 位成员</span>
            </div>
            <el-radio-group v-model="sortKey" size="small">
              <el-radio-button label="name">姓名排序</el-radio-button>
              <el-radio-button label="post">岗位排序</el-radio-button>
              <el-radio-button label="entry">工号排序</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 风采墙视图 -->
          <div v-if="view === 'card'" class="showcase-grid">
            <div v-for="m in filteredMembers" :key="m.id" class="showcase-card">
              <span class="sc-badge" v-if="m.empCode">{{ m.empCode }}</span>
              <div
                class="showcase-avatar"
                :class="{ uploading: savingId === m.id }"
                @click="pickPhoto(m)"
                :title="`点击为 ${m.name} 上传照片`"
              >
                <img v-if="m.photo" :src="m.photo" class="sc-photo" alt="" />
                <span v-else class="sc-letter" :style="{ background: m.color }">{{ m.initial }}</span>
                <div class="sc-upload-mask">
                  <el-icon v-if="savingId === m.id"><Loading /></el-icon>
                  <template v-else>
                    <el-icon><Camera /></el-icon>
                    <span>{{ m.photo ? '更换照片' : '上传照片' }}</span>
                  </template>
                </div>
                <i class="sc-status" :class="m.status"></i>
              </div>
              <div class="sc-name">{{ m.name }}</div>
              <div class="sc-post">{{ m.post }}</div>
              <div class="sc-dept"><el-icon><OfficeBuilding /></el-icon> {{ m.dept }}</div>
              <div class="sc-contact">
                <a
                  v-if="m.phone && m.phone !== '-'"
                  :href="`tel:${m.phone}`"
                  class="sc-chip"
                  :title="m.phone"
                  @click.stop
                ><el-icon><Phone /></el-icon></a>
                <a
                  v-if="m.email && m.email !== '-'"
                  :href="`mailto:${m.email}`"
                  class="sc-chip"
                  :title="m.email"
                  @click.stop
                ><el-icon><Message /></el-icon></a>
                <el-tag size="small" :type="statusTag(m.statusCode)" effect="plain">
                  {{ statusText(m.statusCode) }}
                </el-tag>
              </div>
            </div>
            <el-empty v-if="!filteredMembers.length" description="该部门暂无成员" />
          </div>

          <!-- 表格视图 -->
          <el-table v-else :data="filteredMembers" stripe class="member-table">
            <el-table-column label="姓名" width="200">
              <template #default="{ row }">
                <div class="cell-name">
                  <div
                    class="tbl-avatar"
                    @click="pickPhoto(row)"
                    :title="`点击为 ${row.name} 上传照片`"
                  >
                    <img v-if="row.photo" :src="row.photo" alt="" />
                    <span v-else class="tbl-letter" :style="{ background: row.color }">{{ row.initial }}</span>
                    <div class="tbl-cam"><el-icon><Camera /></el-icon></div>
                  </div>
                  <div>
                    <div class="m-name">{{ row.name }}</div>
                    <div class="m-sub">{{ row.empCode }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="post" label="岗位" width="160" />
            <el-table-column prop="dept" label="所属部门" width="180" />
            <el-table-column prop="phone" label="联系电话" width="160" />
            <el-table-column prop="email" label="电子邮箱" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag size="small" :type="statusTag(row.statusCode)" effect="plain">
                  {{ statusText(row.statusCode) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </main>
      </div>
    </section>

    <!-- 隐藏的文件选择器(头像上传) -->
    <input
      ref="fileInputRef"
      type="file"
      accept="image/*"
      style="display:none"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Grid, Menu, Phone, Message, OfficeBuilding, Camera, Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { deptApi, employeeApi } from '@/api/org'

// embedded: 作为标签页嵌入(如人文中心)时隐藏自身大标题与统计条,避免与宿主页 hero 重复
defineProps<{ embedded?: boolean }>()

const currentDate = (() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
})()

const search = ref('')
const view = ref<'card' | 'table'>('card')
const sortKey = ref('name')
const activeDept = ref('全公司')
const loading = ref(false)

// 头像底色调色板(无真实照片时按 index 轮换做首字母底色)
const COLORS = [
  'linear-gradient(135deg,#5B7CFA,#324BB3)',
  'linear-gradient(135deg,#3370ff,#A8401A)',
  'linear-gradient(135deg,#9C5FB6,#5E3779)',
  'linear-gradient(135deg,#3CB371,#1F6B45)',
  'linear-gradient(135deg,#3370ff,#1f54e6)',
  'linear-gradient(135deg,#C44569,#7B2A45)',
  'linear-gradient(135deg,#1F6BA8,#0F4675)'
]

// 员工状态 1在职 2试用 3离职 → 头像角标小圆点(on/busy/off)
const STATUS_DOT: Record<number, 'on' | 'busy' | 'off'> = { 1: 'on', 2: 'busy', 3: 'off' }
const STATUS_TEXT: Record<number, string> = { 1: '在职', 2: '试用', 3: '离职' }
const statusText = (c: number) => STATUS_TEXT[c] || '未知'
const statusTag = (c: number) => (c === 1 ? 'success' : c === 2 ? 'warning' : 'info')

interface Member {
  id: string; name: string; empCode: string;
  initial: string;   // 姓名首字(无照片时显示)
  photo: string;     // 真实头像 base64/URL(可空)
  color: string;
  post: string; dept: string; phone: string; email: string;
  rawEmp: any;       // 完整员工 VO(上传头像时回传给后端)
  statusCode: number; status: 'on' | 'busy' | 'off';
}

const members = ref<Member[]>([])
const treeData = ref<any[]>([])

const deptCount = computed(() => treeData.value[0]?.children?.length || 0)

const metrics = computed(() => {
  const total = members.value.length
  const onJob = members.value.filter(m => m.statusCode === 1).length
  const probation = members.value.filter(m => m.statusCode === 2).length
  const withPhoto = members.value.filter(m => m.photo).length
  return [
    { label: '员工总数', value: String(total) },
    { label: '一级部门', value: String(deptCount.value) },
    { label: '在职', value: String(onJob) },
    { label: '已传照片', value: `${withPhoto}/${total || 0}` }
  ]
})

// 后端部门树 → el-tree 数据;count=该部门(按 deptName 直配)及子部门员工数
function toTreeNode(dept: any): any {
  const directCount = members.value.filter(m => m.dept === dept.deptName).length
  const children = (dept.children || []).map(toTreeNode)
  const childSum = children.reduce((s: number, c: any) => s + (c.count || 0), 0)
  return {
    id: dept.id, label: dept.deptName, count: directCount + childSum,
    children: children.length ? children : undefined
  }
}

async function loadData() {
  loading.value = true
  try {
    // 通讯录只读取全员选人最小字段，不再下发手机、邮箱、身份证等员工档案信息。
    const empRes: any = await employeeApi.options()
    const rows: any[] = Array.isArray(empRes?.data) ? empRes.data : (Array.isArray(empRes) ? empRes : [])
    members.value = rows.map((e, i) => ({
      id: String(e.id ?? i),
      name: e.name || '-',
      empCode: e.empCode || '',
      initial: (e.name || '?').charAt(0),
      photo: e.avatar || '',
      color: COLORS[i % COLORS.length],
      post: e.postName || '-',
      dept: e.deptName || '未分配',
      phone: e.phone || '-',
      email: e.email || '-',
      rawEmp: e,
      statusCode: e.status,
      status: STATUS_DOT[e.status] || 'off'
    }))
    // 部门树:真后端 /org/dept/tree(res.data)
    const deptRes: any = await deptApi.tree()
    const depts: any[] = deptRes?.data || []
    treeData.value = [{ id: 'root', label: '浙杭集团', count: members.value.length, children: depts.map(toTreeNode) }]
  } finally {
    loading.value = false
  }
}

function handleNodeClick(data: any) {
  activeDept.value = data.label === '浙杭集团' ? '全公司' : data.label
}

const filteredMembers = computed(() => {
  let list = members.value
  if (activeDept.value && activeDept.value !== '全公司') {
    list = list.filter(m => m.dept === activeDept.value)
  }
  if (search.value) {
    const kw = search.value
    list = list.filter(m =>
      m.name.includes(kw) || m.post.includes(kw) || m.phone.includes(kw) ||
      m.email.includes(kw) || m.empCode.includes(kw)
    )
  }
  return [...list].sort((a, b) => {
    if (sortKey.value === 'post') return a.post.localeCompare(b.post)
    if (sortKey.value === 'entry') return a.empCode.localeCompare(b.empCode)
    return a.name.localeCompare(b.name)
  })
})

/* ============ 头像上传 ============ */
const fileInputRef = ref<HTMLInputElement>()
const pickingId = ref('')   // 当前点了哪张卡的"上传"
const savingId = ref('')    // 正在保存(转圈)的卡 id

function pickPhoto(m: Member) {
  if (savingId.value) return
  pickingId.value = m.id
  fileInputRef.value?.click()
}

// 选好图片 → 压缩成正方形 base64 → 调 update 落库 → 本地刷新该成员头像
async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = '' // 立即重置,允许再次选择同一文件
  if (!file) return
  const m = members.value.find(x => x.id === pickingId.value)
  if (!m) return
  if (!file.type.startsWith('image/')) { ElMessage.warning('请选择图片文件'); return }
  if (file.size > 8 * 1024 * 1024) { ElMessage.warning('图片请小于 8MB'); return }

  savingId.value = m.id
  try {
    const base64 = await compressToBase64(file, 256)
    // 回传完整员工数据 + 新头像:满足 DTO 必填(工号/姓名/部门/岗位)校验。
    // 剔除 VO 特有字段(deptName/postName/createTime),避免与 DTO 字段不符。
    const { deptName, postName, createTime, ...dto } = m.rawEmp || {}
    await employeeApi.update({ ...dto, id: m.rawEmp?.id ?? m.id, avatar: base64 })
    m.photo = base64
    m.rawEmp = { ...m.rawEmp, avatar: base64 }
    ElMessage.success(`${m.name} 的照片已更新`)
  } catch (err) {
    console.error(err)
    ElMessage.error('照片上传失败,请重试')
  } finally {
    savingId.value = ''
  }
}

// 读图 → 居中裁成正方形 → 缩到 size 像素 → 导出 JPEG base64(约几十KB)
function compressToBase64(file: File, size: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read fail'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('decode fail'))
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('no ctx')); return }
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

onMounted(loadData)
</script>

<style lang="scss" scoped>
@use './_collab.scss';

/* —— 搜索条 —— */
.search-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(51, 112, 255, 0.12);
  border-radius: 8px;
  padding: 14px 18px;

  :deep(.el-input) { flex: 1; max-width: 480px; }
}

.view-switch {
  margin-left: auto;
  display: flex;
  gap: 4px;
  font-size: 12px;
  color: var(--text-muted, #888);

  span {
    display: flex; align-items: center; gap: 4px;
    padding: 4px 10px;
    border: 1px solid rgba(51, 112, 255, 0.16);
    border-radius: 4px;
    cursor: pointer;
    transition: all .15s;

    &:hover { color: var(--gold-primary, #3370ff); }
    &.active {
      color: var(--gold-primary, #3370ff);
      background: rgba(51, 112, 255, 0.1);
      border-color: rgba(51, 112, 255, 0.4);
    }
  }
}

/* —— 工作区 —— */
.contact-workspace {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(51, 112, 255, 0.12);
  border-radius: 12px;
  padding: 16px;
  min-height: 600px;
}

/* —— 组织树 —— */
.org-tree {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(51, 112, 255, 0.08);
  border-radius: 8px;
  padding: 14px;
  overflow-y: auto;
  max-height: 760px;
}
.tree-head {
  display: flex; flex-direction: column; gap: 4px;
  padding: 6px 8px 12px;
  border-bottom: 1px solid rgba(51, 112, 255, 0.1);
  margin-bottom: 8px;

  .tree-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    letter-spacing: 0.04em;
  }
  .tree-sub {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: rgba(51, 112, 255, 0.5);
    letter-spacing: 0.1em;
  }
}
.tree-node {
  flex: 1;
  display: flex; justify-content: space-between; align-items: center;
  padding-right: 8px;

  .node-label { font-size: 13px; }
  .node-count {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    color: var(--text-muted, #888);
  }
}

:deep(.el-tree) {
  background: transparent;
  color: var(--text-body, #B8B8C0);

  .el-tree-node__content {
    height: 32px;
    border-radius: 6px;

    &:hover { background: rgba(51, 112, 255, 0.08); }
  }
  .el-tree-node.is-current > .el-tree-node__content {
    background: linear-gradient(90deg, rgba(51, 112, 255, 0.18), rgba(51, 112, 255, 0.04));
    color: var(--gold-primary, #3370ff);
  }
}

/* —— 成员区 —— */
.member-pane {
  display: flex; flex-direction: column;
}
.member-pane-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 4px 4px 16px;
  border-bottom: 1px solid rgba(51, 112, 255, 0.1);
  margin-bottom: 16px;

  .dept-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    margin-right: 12px;
  }
  .dept-meta {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: rgba(51, 112, 255, 0.5);
  }
}

/* —— 风采墙 —— */
.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 16px;
}
.showcase-card {
  position: relative;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(51, 112, 255, 0.1);
  border-radius: 12px;
  padding: 24px 16px 18px;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
  transition: all .2s;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(51, 112, 255, 0.5), transparent);
  }
  &:hover {
    border-color: rgba(51, 112, 255, 0.3);
    background: rgba(51, 112, 255, 0.04);
    transform: translateY(-3px);
  }
}
.sc-badge {
  position: absolute; top: 10px; right: 10px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px;
  padding: 2px 5px;
  color: var(--gold-primary, #3370ff);
  background: rgba(51, 112, 255, 0.08);
  border: 1px solid rgba(51, 112, 255, 0.25);
  border-radius: 3px;
  z-index: 2;
}
.showcase-avatar {
  position: relative;
  width: 96px; height: 96px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 14px;
  border: 2px solid rgba(51, 112, 255, 0.25);
  flex-shrink: 0;

  .sc-photo { width: 100%; height: 100%; object-fit: cover; display: block; }
  .sc-letter {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 34px; font-weight: 600;
  }
  .sc-upload-mask {
    position: absolute; inset: 0;
    background: rgba(0, 0, 0, 0.55);
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
    color: #fff; font-size: 11px;
    opacity: 0; transition: opacity .2s;

    .el-icon { font-size: 20px; }
  }
  &:hover .sc-upload-mask { opacity: 1; }
  &.uploading .sc-upload-mask { opacity: 1; }
  &.uploading .el-icon { animation: sc-spin 0.9s linear infinite; }

  .sc-status {
    position: absolute; right: 6px; bottom: 6px;
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid var(--bg-card, #16161E);
    background: #888; z-index: 3;

    &.on { background: #3CB371; box-shadow: 0 0 6px #3CB371; }
    &.busy { background: #3370ff; box-shadow: 0 0 6px #3370ff; }
  }
}
@keyframes sc-spin { to { transform: rotate(360deg); } }

.sc-name {
  font-size: 16px; font-weight: 600;
  color: var(--text-primary, #F5F5F5);
}
.sc-post {
  font-size: 12px; color: var(--gold-primary, #3370ff);
  margin-top: 5px;
}
.sc-dept {
  font-size: 12px; color: var(--text-body, #B8B8C0);
  margin-top: 6px;
  display: flex; align-items: center; gap: 4px;
}
.sc-contact {
  display: flex; gap: 8px; align-items: center;
  margin-top: 14px;
}
.sc-chip {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(51, 112, 255, 0.1);
  border: 1px solid rgba(51, 112, 255, 0.25);
  color: var(--gold-primary, #3370ff);
  font-size: 13px;
  transition: all .15s;
  text-decoration: none;

  &:hover { background: rgba(51, 112, 255, 0.22); transform: translateY(-1px); }
}

/* —— 列表头像 —— */
.cell-name { display: flex; gap: 10px; align-items: center; }
.tbl-avatar {
  position: relative;
  width: 36px; height: 36px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .tbl-letter {
    width: 100%; height: 100%;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 13px; font-weight: 600;
  }
  .tbl-cam {
    position: absolute; inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-size: 14px;
    opacity: 0; transition: opacity .2s;
  }
  &:hover .tbl-cam { opacity: 1; }
}
.m-name {
  font-size: 14px; font-weight: 600;
  color: var(--text-primary, #F5F5F5);
}
.m-sub {
  font-size: 11px; color: rgba(51, 112, 255, 0.5);
  font-family: 'JetBrains Mono', monospace; margin-top: 2px;
}

@media (max-width: 1100px) {
  .contact-workspace { grid-template-columns: 1fr; }
  .org-tree { max-height: 280px; }
  .search-bar { flex-direction: column; align-items: stretch;
    :deep(.el-input) { max-width: 100%; }
  }
}
</style>

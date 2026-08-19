<template>
  <div class="rp-page">
    <!-- 左：角色列表 -->
    <el-card shadow="never" class="rp-aside">
      <template #header><div class="rp-aside-head">角色</div></template>
      <el-input v-model="keyword" placeholder="搜索角色" clearable size="small" class="rp-search">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-scrollbar class="rp-role-scroll" v-loading="roleLoading">
        <ul class="rp-role-list">
          <li
            v-for="(role, i) in filteredRoles"
            :key="role.id"
            class="rp-role-item"
            :class="{ active: currentRole?.id === role.id, 'is-dragging': roleDragIndex === i }"
            :draggable="roleDragReady && !keyword"
            @click="selectRole(role)"
            @dragstart="onRoleDragStart(i, $event)"
            @dragover.prevent="onRoleDragOver(i)"
            @drop.prevent
            @dragend="onRoleDragEnd"
          >
            <span
              v-if="!keyword"
              class="rp-drag"
              title="按住拖动排序"
              @mousedown="roleDragReady = true"
              @mouseup="roleDragReady = false"
              @click.stop
            >⠿</span>
            <span class="rp-dot" :style="{ background: roleColor(i) }"></span>
            <span class="rp-role-name">{{ role.roleName }}</span>
            <el-tag v-if="isReadonlyRole(role)" size="small" type="warning" effect="plain">只读</el-tag>
            <el-tag v-else-if="hasLimit(role)" size="small" type="success" effect="plain">已限定</el-tag>
            <el-dropdown
              v-if="!isProtectedRole(role.roleKey)"
              trigger="click"
              class="rp-role-more"
              @command="(cmd: string) => onRoleCmd(cmd, role)"
            >
              <span class="rp-more-btn" @click.stop>⋮</span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="edit">修改名称</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除角色</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </li>
        </ul>
        <el-empty v-if="!roleLoading && !filteredRoles.length" description="暂无角色" :image-size="70" />
      </el-scrollbar>
      <el-button class="rp-add-role" type="primary" plain @click="openRoleForm()">+ 新建角色</el-button>
    </el-card>

    <!-- 右：权限配置 -->
    <el-card shadow="never" class="rp-main">
      <template #header>
        <div class="rp-main-head">
          <div class="rp-main-title">
            角色权限设置
            <el-tag v-if="currentRole" size="small" effect="plain" class="rp-cur-tag">{{ currentRole.roleName }}</el-tag>
          </div>
          <div v-if="currentRole" class="rp-actions">
            <el-button :icon="View" @click="previewVisible = true">权限预览</el-button>
            <template v-if="!readonly">
              <span class="rp-summary">{{ allOn ? '全部可见（不限制）' : `已限定 ${checkedSubs.size} 个小类` }}</span>
              <el-button :icon="RefreshLeft" :disabled="saving" @click="reset">重置</el-button>
              <el-button type="primary" :icon="Check" :loading="saving" :disabled="operationLoading || !operationReady" @click="save">保存</el-button>
            </template>
          </div>
        </div>
      </template>

      <!-- 方案2：成员摘要置顶，完整管理收进右侧抽屉 -->
      <div v-if="currentRole" class="rp-members-summary">
        <div class="rp-members-summary-main">
          <span class="rp-members-summary-label">角色成员</span>
          <div v-if="members.length" class="rp-members-avatars" aria-label="角色成员头像">
            <span
              v-for="m in members.slice(0, 4)"
              :key="m.userId"
              class="rp-members-avatar"
              :title="m.nickname || m.username"
            >{{ (m.nickname || m.username || '?').slice(0, 1) }}</span>
            <span v-if="members.length > 4" class="rp-members-avatar rp-members-avatar-more">+{{ members.length - 4 }}</span>
          </div>
          <span v-else class="rp-members-empty-avatar"><el-icon><User /></el-icon></span>
          <strong class="rp-members-count">{{ members.length }} 人</strong>
        </div>
        <div class="rp-members-summary-note">
          <el-icon><InfoFilled /></el-icon>
          <span>成员变更后，仅受影响员工需重新登录</span>
        </div>
        <el-button :icon="User" plain @click="openMemberDrawer">成员管理</el-button>
      </div>

      <el-empty v-if="!currentRole" description="请选择左侧角色" />
      <el-result
        v-else-if="readonly"
        icon="success"
        title="系统内置角色"
        sub-title="唯一超级管理员拥有全部查看权限，其配置不可修改；可在上方维护成员"
      />

      <div v-else class="rp-body">
        <!-- 方案A：Tab 整合（数据范围 / 可见模块 / 操作权限 / 预览） -->
        <div class="rp-tabs">
          <div class="rp-tab" :class="{ active: activeTab === 'scope' }" @click="activeTab = 'scope'">数据范围</div>
          <div class="rp-tab" :class="{ active: activeTab === 'module' }" @click="activeTab = 'module'">
            可见模块
            <span class="rp-tab-badge">{{ allOn ? '全部' : `${checkedSubs.size}/${ALL_SUB_PATHS.length}` }}</span>
          </div>
          <div class="rp-tab" :class="{ active: activeTab === 'operation' }" @click="activeTab = 'operation'">
            操作权限
            <span class="rp-tab-badge">{{ checkedPermissionIds.size + checkedBizPermissionIds.size }}</span>
          </div>
          <div class="rp-tab" :class="{ active: activeTab === 'preview' }" @click="activeTab = 'preview'">预览</div>
        </div>

        <!-- Tab 1：数据范围 -->
        <div v-show="activeTab === 'scope'" class="rp-pane">
        <div class="rp-section-title">① 可查看的数据范围</div>
        <div class="rp-section-desc">决定这个角色能看到多大范围的数据</div>
        <div class="rp-scope">
          <div
            v-for="opt in scopeOptions"
            :key="opt.value"
            class="rp-scope-item"
            :class="{ active: dataScope === opt.value }"
            @click="dataScope = opt.value"
          >
            <span class="rp-radio"><span v-if="dataScope === opt.value" class="rp-radio-dot"></span></span>
            <div class="rp-scope-text"><div class="rp-scope-title">{{ opt.title }}</div><div class="rp-scope-sub">{{ opt.sub }}</div></div>
          </div>
        </div>
        </div>

        <!-- Tab 2：可见模块 -->
        <div v-show="activeTab === 'module'" class="rp-pane">
        <div class="rp-section-title">② 可访问的模块（可细到小类）</div>
        <div class="rp-section-desc">这里是员工页面导航的唯一配置来源。大类全开＝整块放行；全部大类全开＝不限制。首页（含内部沟通）始终可见。</div>
        <div class="rp-mod2">
          <!-- 左：大类 -->
          <div class="rp-cats">
            <div
              v-for="g in configurableGroups"
              :key="g.name"
              class="rp-cat-item"
              :class="{ active: currentGroup === g.name }"
              @click="currentGroup = g.name"
            >
              <span class="rp-cat-tile" :style="{ background: g.color }"><el-icon><component :is="g.icon" /></el-icon></span>
              <span class="rp-cat-name">{{ g.name }}</span>
              <span class="rp-cat-count" :class="groupState(g.name)">{{ groupOnCount(g.name) }}/{{ (groupSubs[g.name] || []).length }}</span>
            </div>
          </div>
          <!-- 右：当前大类的小类 -->
          <div class="rp-subs">
            <div class="rp-subs-head">
              <span class="rp-subs-title">{{ currentGroup }} · 小类</span>
              <el-button link type="primary" size="small" @click="toggleGroupAll(currentGroup, !isGroupAllOn(currentGroup))">
                {{ isGroupAllOn(currentGroup) ? '全部关闭' : '全部开启' }}
              </el-button>
            </div>
            <div class="rp-sub-list">
              <div v-for="s in (groupSubs[currentGroup] || [])" :key="s.path" class="rp-sub-item">
                <span class="rp-sub-name">{{ s.title }}</span>
                <span class="rp-sub-state" :class="checkedSubs.has(s.path) ? 'on' : 'off'">{{ checkedSubs.has(s.path) ? '可访问' : '隐藏' }}</span>
                <el-switch :model-value="checkedSubs.has(s.path)" @change="(v) => toggleSub(s.path, !!v)" />
              </div>
              <el-empty v-if="!(groupSubs[currentGroup] || []).length" description="该大类无可配小类" :image-size="60" />
            </div>
          </div>
        </div>
        </div>

        <!-- Tab 3：操作权限（原③菜单按钮 + 原④业务权限点 合并，统一按业务域分组） -->
        <div v-show="activeTab === 'operation'" class="rp-pane">
        <div class="rp-section-title">③ 可使用的操作</div>
        <div class="rp-section-desc">页面能否进入由「可见模块」决定；这里决定进入后能做什么。菜单按钮权限（进入页面的按钮/接口）与业务权限点（跨页面的业务动作，如审批/看薪酬）已按业务域合并展示。</div>
        <div class="rp-operation-box" v-loading="operationLoading">
          <el-alert
            v-if="readonly"
            title="内置超级管理员默认拥有全部操作权限，无需单独勾选"
            type="info"
            :closable="false"
            show-icon
          />
          <el-alert
            v-else-if="permissionLoadError"
            :title="permissionLoadError"
            type="error"
            :closable="false"
            show-icon
          />
          <el-collapse v-else-if="unifiedOperationGroups.length" class="rp-operation-collapse">
            <el-collapse-item v-for="group in unifiedOperationGroups" :key="group.key" :name="group.key">
              <template #title>
                <span class="rp-operation-title">{{ group.label }}</span>
                <el-tag size="small" effect="plain">{{ group.items.filter(isOperationOn).length }}/{{ group.items.length }}</el-tag>
              </template>
              <div class="rp-operation-grid">
                <div v-for="item in group.items" :key="item.uid" class="rp-operation-item">
                  <div class="rp-operation-text">
                    <strong>
                      {{ item.label }}
                      <el-tag v-if="item.source === 'biz'" size="small" type="warning" effect="plain" class="rp-src-tag">业务</el-tag>
                      <el-tag v-else size="small" effect="plain" class="rp-src-tag">菜单</el-tag>
                    </strong>
                    <span>{{ item.code }}</span>
                  </div>
                  <el-switch :model-value="isOperationOn(item)" @change="(v) => toggleUnified(item, !!v)" />
                </div>
              </div>
            </el-collapse-item>
          </el-collapse>
          <el-empty v-else-if="!operationLoading" description="暂无可配置的操作权限" :image-size="60" />
        </div>
        </div>

        <!-- Tab 4：预览（保存前最后确认） -->
        <div v-show="activeTab === 'preview'" class="rp-pane">
        <div class="rp-section-title">④ 预览：该角色登录后的效果</div>
        <div class="rp-section-desc">保存前最后确认一眼；保存后受影响成员需重新登录。</div>
        <div class="rp-preview">
          <div class="rp-preview-row">
            <span class="rp-preview-label">数据范围</span>
            <span class="rp-preview-value">{{ scopeOptions.find((o) => o.value === dataScope)?.title || '仅本人数据' }}</span>
          </div>
          <div class="rp-preview-row">
            <span class="rp-preview-label">可见模块</span>
            <span class="rp-preview-value">{{ allOn ? '全部可见（不限制）' : `已开放 ${checkedSubs.size} / ${ALL_SUB_PATHS.length} 个小类` }}</span>
          </div>
          <div class="rp-preview-row">
            <span class="rp-preview-label">菜单按钮权限</span>
            <span class="rp-preview-value">{{ checkedPermissionIds.size }} 项已勾选</span>
          </div>
          <div class="rp-preview-row">
            <span class="rp-preview-label">业务权限点</span>
            <span class="rp-preview-value">{{ checkedBizPermissionIds.size }} 项已勾选</span>
          </div>
          <div class="rp-preview-row">
            <span class="rp-preview-label">角色成员</span>
            <span class="rp-preview-value">{{ members.length }} 人（保存后需重新登录生效）</span>
          </div>
        </div>
        </div>

        <div class="rp-tip">
          <el-icon><InfoFilled /></el-icon>
          <span>角色页面、操作权限、数据范围和成员只在这里设置；保存后受影响成员需重新登录。</span>
        </div>
      </div>

    </el-card>

    <el-drawer
      v-model="memberDrawerVisible"
      size="min(460px, 94vw)"
      append-to-body
      destroy-on-close
      class="rpm-drawer"
      @closed="selectedToAdd = []"
    >
      <template #header>
        <div class="rpm-drawer-head">
          <div>
            <div class="rpm-drawer-title">成员管理</div>
            <div class="rpm-drawer-sub">{{ currentRole?.roleName || '' }} · {{ members.length }} 人</div>
          </div>
        </div>
      </template>

      <div class="mm-wrap">
        <div class="mm-notice">
          <el-icon><InfoFilled /></el-icon>
          <span>这里仅调整该角色包含的员工，不会改变角色本身的权限配置。</span>
        </div>

        <div class="mm-block">
          <div class="mm-label">添加人员</div>
          <div class="mm-add-row">
            <el-select
              v-model="selectedToAdd"
              multiple
              filterable
              remote
              clearable
              reserve-keyword
              :remote-method="searchCandidates"
              :loading="candLoading"
              placeholder="输入姓名 / 账号 / 手机号搜索员工"
              class="mm-select"
            >
              <el-option
                v-for="c in addableCandidates"
                :key="c.userId"
                :label="candLabel(c)"
                :value="Number(c.userId)"
              />
            </el-select>
            <el-button type="primary" :loading="adding" :disabled="!selectedToAdd.length" @click="addSelected">加入</el-button>
          </div>
          <div class="mm-hint">已在本角色的员工不会重复出现；加入后该员工需重新登录。</div>
        </div>

        <div class="mm-block mm-current">
          <div class="mm-label">当前成员（{{ members.length }} 人）</div>
          <el-scrollbar max-height="calc(100vh - 390px)">
            <div v-loading="membersLoading">
              <el-empty v-if="!members.length && !membersLoading" description="暂无成员，请在上方添加" :image-size="60" />
              <ul v-else class="mm-list">
                <li v-for="m in members" :key="m.userId" class="mm-item">
                  <span class="mm-avatar">{{ (m.nickname || m.username || '?').slice(0, 1) }}</span>
                  <div class="mm-info">
                    <div class="mm-name">{{ m.nickname || m.username }}</div>
                    <div class="mm-sub">{{ m.username }}{{ m.phone ? ' · ' + m.phone : '' }}</div>
                  </div>
                  <el-button link type="danger" size="small" @click="removeOne(m)">移除</el-button>
                </li>
              </ul>
            </div>
          </el-scrollbar>
        </div>
      </div>
    </el-drawer>

    <!-- 权限预览弹窗:按当前配置直观展示该角色登录后能看到的导航与页面 -->
    <el-dialog
      v-model="previewVisible"
      :title="`权限预览 · ${currentRole?.roleName || ''}`"
      width="720px"
      append-to-body
      class="rpp-dialog"
    >
      <div class="rpp-summary">
        <div class="rpp-summary-item">
          <span class="rpp-summary-label">数据范围</span>
          <b>{{ previewScopeText }}</b>
        </div>
        <div class="rpp-summary-item">
          <span class="rpp-summary-label">可用操作</span>
          <b v-if="readonly">全部（内置管理员）</b>
          <b v-else>{{ selectedOperationCount }} 项</b>
        </div>
        <div class="rpp-summary-item">
          <span class="rpp-summary-label">可见页面</span>
          <b v-if="readonly">全部（内置管理员）</b>
          <b v-else-if="allOn">全部（模块不限制）</b>
          <b v-else>{{ previewGroups.length }} 个大类 · {{ previewPageCount }} 个页面</b>
        </div>
      </div>
      <el-scrollbar max-height="58vh">
        <div class="rpp-nav">
          <!-- 全员基础模块始终可见 -->
          <div v-for="base in baselineGroups" :key="base.name" class="rpp-group">
            <div class="rpp-group-head">
              <span class="rpp-tile" :style="{ background: base.color || '#185FA5' }">
                <el-icon v-if="base.icon"><component :is="base.icon" /></el-icon>
                <span v-else>首</span>
              </span>
              <span class="rpp-group-name">{{ base.name }}</span>
              <el-tag size="small" type="info" effect="plain">始终可见</el-tag>
            </div>
          </div>
          <!-- 按大类分组列出可见页面 -->
          <div v-for="g in previewGroups" :key="g.name" class="rpp-group">
            <div class="rpp-group-head">
              <span class="rpp-tile" :style="{ background: g.color }"><el-icon><component :is="g.icon" /></el-icon></span>
              <span class="rpp-group-name">{{ g.name }}</span>
              <span class="rpp-group-count">{{ g.subs.length }} 页</span>
            </div>
            <div class="rpp-pages">
              <span v-for="s in g.subs" :key="s.path" class="rpp-page">{{ s.title }}</span>
            </div>
          </div>
          <el-empty
            v-if="!readonly && !allOn && !previewGroups.length"
            description="该角色除全员基础模块外看不到任何页面（所有可配模块均已关闭）"
            :image-size="70"
          />
        </div>
      </el-scrollbar>
      <template #footer>
        <div class="rpp-foot">
          <span class="rpp-foot-tip">这是按当前配置（含未保存改动）的效果预览，正式生效需点「保存」。</span>
          <el-button type="primary" @click="previewVisible = false">知道了</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 新建/改名角色弹窗(极简版:只填名字;数据范围/可见模块创建后在本页配置) -->
    <el-dialog v-model="roleFormVisible" :title="roleFormTitle" width="440px" append-to-body destroy-on-close>
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-position="top" @submit.prevent>
        <el-form-item :label="$t('system.role.roleName')" prop="roleName">
          <el-input v-model="roleForm.roleName" maxlength="30" placeholder="如:售后客服" @keyup.enter="submitRoleForm" />
        </el-form-item>
      </el-form>
      <div v-if="!roleForm.id" class="rp-create-note">
        新角色以最小权限创建(默认仅本人数据);创建后自动选中,直接在右侧配置数据范围和可见模块。
      </div>
      <template #footer>
        <el-button @click="roleFormVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitRoleForm" :loading="roleSubmitLoading">{{ roleForm.id ? $t('common.confirm') : '创建' }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Check, RefreshLeft, Search, InfoFilled, User, View } from '@element-plus/icons-vue'
import { menuApi, permissionApi, roleApi } from '@/api/system'
import { ALWAYS_VISIBLE_GROUPS, LEGACY_VISIBLE_GROUP_BY_ROUTE, NAV_GROUPS, MODULE_GROUP, asyncRoutes, constantRoutes } from '@/router/routes'
import { parseVisibleModuleSubs, serializeVisibleModuleSubs } from '@/router/visible-module-config'
import { useUserStore } from '@/stores/user'

const READONLY_ROLE_KEYS = ['super_admin']
const PALETTE = ['#534AB7', '#185FA5', '#0F6E56', '#D85A30', '#BA7517', '#A32D2D', '#5F5E5A', '#993556']
const userStore = useUserStore()

const scopeOptions = [
  { value: 1, title: '全部数据', sub: '看到公司所有数据' },
  { value: 4, title: '本部门及以下', sub: '只看本部门（含下级部门）的数据' },
  { value: 5, title: '仅本人数据', sub: '只看自己经手的数据' }
]

// —— 构建「大类 → 小类[]」映射（聚合各顶级模块的可见子路由；无子路由的大类，自身作为唯一小类）——
interface SubItem { path: string; title: string }
interface PermissionMenuItem {
  id: number
  parentId: number
  menuName: string
  perms: string
  status: number
}
const groupSubs: Record<string, SubItem[]> = {}
const legacyGroupSubs: Record<string, SubItem[]> = {}
// 业务模块散落在 constantRoutes(数字总部/CRM库等) 和 asyncRoutes 两处,都要扫
for (const route of [...constantRoutes, ...asyncRoutes] as any[]) {
  if (route.meta?.hidden) continue
  if (route.redirect && !(route.children && route.children.length)) continue
  const group = (MODULE_GROUP as Record<string, string>)[route.path]
  if (!group || ALWAYS_VISIBLE_GROUPS.has(group)) continue
  if (!groupSubs[group]) groupSubs[group] = []
  const kids = ((route.children || []) as any[]).filter((c) => !c.meta?.hidden && c.meta?.title)
  if (kids.length) {
    for (const c of kids) {
      const full = String(c.path).startsWith('/') ? c.path : (route.path + '/' + c.path).replace(/\/+/g, '/')
      const item = { path: full, title: c.meta.title }
      groupSubs[group].push(item)
      const legacyValue = LEGACY_VISIBLE_GROUP_BY_ROUTE[route.path]
      const legacyGroups = Array.isArray(legacyValue) ? legacyValue : (legacyValue ? [legacyValue] : [])
      legacyGroups.forEach((legacyGroup) => {
        if (!legacyGroupSubs[legacyGroup]) legacyGroupSubs[legacyGroup] = []
        legacyGroupSubs[legacyGroup].push(item)
      })
    }
  } else {
    const item = { path: route.path, title: route.meta?.title || group }
    groupSubs[group].push(item)
    const legacyValue = LEGACY_VISIBLE_GROUP_BY_ROUTE[route.path]
    const legacyGroups = Array.isArray(legacyValue) ? legacyValue : (legacyValue ? [legacyValue] : [])
    legacyGroups.forEach((legacyGroup) => {
      if (!legacyGroupSubs[legacyGroup]) legacyGroupSubs[legacyGroup] = []
      legacyGroupSubs[legacyGroup].push(item)
    })
  }
}
// 可配置的大类：有小类、且不是全员基础模块。
const configurableGroups = NAV_GROUPS.filter((g) => !ALWAYS_VISIBLE_GROUPS.has(g.name) && (groupSubs[g.name] || []).length > 0)
const ALL_SUB_PATHS = [...new Set(configurableGroups.flatMap((g) => (groupSubs[g.name] || []).map((s) => s.path)))]

const roleLoading = ref(false)
const saving = ref(false)
const roles = ref<any[]>([])
const keyword = ref('')
const currentRole = ref<any>(null)
const dataScope = ref<number>(5)
const currentGroup = ref<string>(configurableGroups[0]?.name || '')
const checkedSubs = ref<Set<string>>(new Set())
let savedScope = 5
let savedSubs = new Set<string>()
const operationLoading = ref(false)
const permissionLoadError = ref('')
const permissionLoadedRoleId = ref<number | null>(null)
const menuCatalog = ref<PermissionMenuItem[]>([])
const checkedPermissionIds = ref<Set<number>>(new Set())
let savedAssignedMenuIds: number[] = []
let permissionSelectionVersion = 0

// ④ 业务权限点（唯一可配置口径，阶段2：仅登记）
const bizPermissionList = ref<any[]>([])
const checkedBizPermissionIds = ref<Set<number>>(new Set())
let savedBizPermissionIds: number[] = []
const bizPermissionGroupLabels: Record<string, string> = {
  hr: '人事', order: '订单', finance: '财务', contract: '合同', crm: '客户',
  file: '文件', report: '报表', system: '系统', analysis: '分析', seal: '印章',
  gs: '工商', channel: '渠道', workflow: '工作流', dashboard: '驾驶舱',
  feige: '飞哥', review: '审单'
}
const bizPermissionGroups = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: any[] }>()
  bizPermissionList.value.forEach((p) => {
    const key = p.domain || 'other'
    if (!groups.has(key)) groups.set(key, { key, label: bizPermissionGroupLabels[key] || key, items: [] })
    groups.get(key)!.items.push(p)
  })
  return [...groups.values()].sort((a, b) => a.key.localeCompare(b.key))
})

// ===== 方案A：Tab 整合 =====
const activeTab = ref<'scope' | 'module' | 'operation' | 'preview'>('scope')

/** 菜单 perms 前缀与业务权限点 domain 归并到统一业务域（中文标签）。 */
const UNIFIED_DOMAIN_LABELS: Record<string, string> = {
  // 菜单 perms 前缀
  system: '系统与组织', org: '系统与组织', log: '系统与组织', monitor: '系统与组织', tool: '系统与组织',
  crm: '客户与销售', sales: '客户与销售',
  finance: '财务与收款',
  hrm: '人事行政', workflow: '审批流程', supply: '渠道与供应链',
  report: '报表与分析', file: '文件知识库', message: '内部沟通',
  dashboard: '工作台', profile: '工作台', project: '项目任务',
  // 业务权限点 domain
  hr: '人事行政', order: '订单合同', contract: '订单合同', review: '订单合同',
  analysis: '报表与分析', seal: '印章工商', gs: '印章工商',
  channel: '渠道与供应链', feige: '飞哥业务'
}

/** 操作权限统一分组：菜单按钮 + 业务权限点混排，带 source 标记。 */
const unifiedOperationGroups = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: Array<{ uid: string; source: 'menu' | 'biz'; id: number; label: string; code: string }> }>()
  const push = (rawKey: string, item: { uid: string; source: 'menu' | 'biz'; id: number; label: string; code: string }) => {
    const key = rawKey || 'other'
    const label = UNIFIED_DOMAIN_LABELS[key] || key
    if (!groups.has(key)) groups.set(key, { key, label, items: [] })
    groups.get(key)!.items.push(item)
  }
  operationItems.value.forEach((m) => push(m.perms.split(':')[0], {
    uid: `menu-${m.id}`, source: 'menu', id: m.id, label: m.menuName, code: m.perms
  }))
  bizPermissionList.value.forEach((p) => push(p.domain, {
    uid: `biz-${p.id}`, source: 'biz', id: Number(p.id), label: String(p.name || ''), code: String(p.code || '')
  }))
  return [...groups.values()].sort((a, b) => a.label.localeCompare(b.label))
})

function isOperationOn(item: { source: 'menu' | 'biz'; id: number }): boolean {
  return item.source === 'menu'
    ? checkedPermissionIds.value.has(item.id)
    : checkedBizPermissionIds.value.has(item.id)
}

function toggleUnified(item: { source: 'menu' | 'biz'; id: number }, enabled: boolean) {
  if (item.source === 'menu') togglePermission(item.id, enabled)
  else toggleBizPermission(item.id, enabled)
}

const PERMISSION_GROUP_LABELS: Record<string, string> = {
  system: '系统与组织', org: '员工与组织', crm: '销售与客户', sales: '销售业务',
  finance: '财务与收款', hrm: '人事行政', workflow: '审批流程', supply: '渠道与供应链',
  report: '报表', log: '日志审计', file: '文件知识库', message: '内部沟通', dashboard: '工作台',
  profile: '个人中心', project: '项目任务', monitor: '系统监控', tool: '系统工具'
}

const operationItems = computed(() => menuCatalog.value
  .filter((item) => item.status === 0 && !!item.perms)
  .sort((a, b) => a.perms.localeCompare(b.perms) || a.id - b.id))

const operationGroups = computed(() => {
  const groups = new Map<string, { key: string; label: string; items: PermissionMenuItem[] }>()
  operationItems.value.forEach((item) => {
    const key = item.perms.split(':')[0] || 'other'
    if (!groups.has(key)) groups.set(key, { key, label: PERMISSION_GROUP_LABELS[key] || key, items: [] })
    groups.get(key)!.items.push(item)
  })
  return [...groups.values()]
})
const selectedOperationCount = computed(() => operationItems.value.filter((item) => checkedPermissionIds.value.has(item.id)).length)
const readonly = computed(() => isReadonlyRole(currentRole.value))
const operationReady = computed(() => readonly.value || (
  !!currentRole.value
  && permissionLoadedRoleId.value === Number(currentRole.value.id)
  && !permissionLoadError.value
))

function isReadonlyRole(r: any): boolean {
  return !!r && READONLY_ROLE_KEYS.includes(r.roleKey)
}
function roleColor(i: number): string {
  return PALETTE[i % PALETTE.length]
}
function hasLimit(r: any): boolean {
  return !!r && !isReadonlyRole(r) && !!(r.visibleModules && String(r.visibleModules).trim())
}

const allOn = computed(() => checkedSubs.value.size === ALL_SUB_PATHS.length)

// —— 权限预览:直观展示该角色登录后能看到的导航与页面(按当前配置,含未保存改动) ——
const previewVisible = ref(false)
const baselineGroups = NAV_GROUPS.filter((g) => ALWAYS_VISIBLE_GROUPS.has(g.name))
const previewScopeText = computed(() => scopeOptions.find((o) => o.value === dataScope.value)?.title || '仅本人数据')
// 唯一超级管理员可见全部；其余角色按 checkedSubs 过滤。
const previewGroups = computed(() =>
  configurableGroups
    .map((g: any) => {
      const subs = groupSubs[g.name] || []
      const shown = readonly.value ? subs : subs.filter((s) => checkedSubs.value.has(s.path))
      return { name: g.name, color: g.color, icon: g.icon, subs: shown }
    })
    .filter((g) => g.subs.length > 0)
)
const previewPageCount = computed(() => (readonly.value ? ALL_SUB_PATHS.length : checkedSubs.value.size))

const filteredRoles = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return roles.value
  return roles.value.filter(
    (r) => (r.roleName || '').toLowerCase().includes(kw) || (r.roleKey || '').toLowerCase().includes(kw)
  )
})

function groupOnCount(g: string): number {
  return (groupSubs[g] || []).filter((s) => checkedSubs.value.has(s.path)).length
}
function isGroupAllOn(g: string): boolean {
  const subs = groupSubs[g] || []
  return subs.length > 0 && subs.every((s) => checkedSubs.value.has(s.path))
}
/** 大类状态样式：全开=on / 部分=part / 全关=off */
function groupState(g: string): string {
  const total = (groupSubs[g] || []).length
  const on = groupOnCount(g)
  if (on === 0) return 'off'
  if (on === total) return 'on'
  return 'part'
}

function toggleSub(path: string, on: boolean) {
  const s = new Set(checkedSubs.value)
  if (on) s.add(path)
  else s.delete(path)
  checkedSubs.value = s
}
function toggleGroupAll(g: string, on: boolean) {
  const s = new Set(checkedSubs.value)
  ;(groupSubs[g] || []).forEach((x) => { if (on) s.add(x.path); else s.delete(x.path) })
  checkedSubs.value = s
}

/** 解析 role.visibleModules（逗号串）→ 选中的小类路径集合。空=不限制=全选；大类名=该大类全部小类 */
function parseSubs(vm: any): Set<string> {
  return parseVisibleModuleSubs(vm, ALL_SUB_PATHS, configurableGroups, groupSubs, legacyGroupSubs)
}

onMounted(() => {
  loadRoles()
  loadTemplates()
})

/** 统一按 roleSort 升序(相同按id)排,保证拖拽保存后的顺序刷新不乱 */
function sortRoles(list: any[]) {
  return [...list].sort((a: any, b: any) =>
    (Number(a.roleSort) || 0) - (Number(b.roleSort) || 0) || Number(a.id) - Number(b.id))
}

async function loadRoles() {
  roleLoading.value = true
  try {
    const res: any = await roleApi.list({ pageNum: 1, pageSize: 200 })
    roles.value = sortRoles(res.data?.records || res.data?.list || res.data || [])
    const first = roles.value.find((r) => !isReadonlyRole(r)) || roles.value[0]
    if (first) selectRole(first)
  } finally {
    roleLoading.value = false
  }
}

// —— 左栏角色拖拽排序:抓手按下才允许拖;松手把新顺序写回 roleSort ——
const roleDragReady = ref(false)
const roleDragIndex = ref<number | null>(null)

function onRoleDragStart(i: number, e: DragEvent) {
  if (keyword.value) return
  roleDragIndex.value = i
  e.dataTransfer?.setData('text/plain', '')
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
}
function onRoleDragOver(i: number) {
  if (keyword.value || roleDragIndex.value === null || roleDragIndex.value === i) return
  const list = [...roles.value]
  const [moved] = list.splice(roleDragIndex.value, 1)
  list.splice(i, 0, moved)
  roles.value = list
  roleDragIndex.value = i
}
async function onRoleDragEnd() {
  roleDragReady.value = false
  if (roleDragIndex.value === null) return
  roleDragIndex.value = null
  // 只回写顺序变了的角色。后端 RoleDTO 校验 roleName/roleKey @NotBlank,必须一并携带(值不变)。
  const updates: Array<{ id: number; roleName: string; roleKey: string; roleSort: number }> = []
  roles.value.forEach((r: any, idx: number) => {
    const want = (idx + 1) * 10
    if (Number(r.roleSort) !== want) {
      r.roleSort = want
      updates.push({ id: Number(r.id), roleName: r.roleName, roleKey: r.roleKey, roleSort: want })
    }
  })
  if (!updates.length) return
  try {
    for (const u of updates) await roleApi.update(u)
    ElMessage.success('角色顺序已保存')
  } catch {
    ElMessage.error('顺序保存失败,请刷新后重试')
  }
}

async function selectRole(role: any) {
  memberDrawerVisible.value = false
  currentRole.value = role
  dataScope.value = Number(role.dataScope ?? 5)
  savedScope = dataScope.value
  checkedSubs.value = parseSubs(role.visibleModules)
  savedSubs = new Set(checkedSubs.value)
  if (!configurableGroups.some((g) => g.name === currentGroup.value)) {
    currentGroup.value = configurableGroups[0]?.name || ''
  }
  // 顶部成员摘要随角色刷新；完整管理在右侧抽屉中完成。
  selectedToAdd.value = []
  loadMembers()
  searchCandidates('')
  await loadOperationPermissions(role)
  loadBizPermissions(role)
}

function togglePermission(menuId: number, enabled: boolean) {
  const next = new Set(checkedPermissionIds.value)
  if (enabled) next.add(menuId)
  else next.delete(menuId)
  checkedPermissionIds.value = next
}

function toggleBizPermission(permissionId: number, enabled: boolean) {
  const next = new Set(checkedBizPermissionIds.value)
  if (enabled) next.add(permissionId)
  else next.delete(permissionId)
  checkedBizPermissionIds.value = next
}

async function loadBizPermissions(role: any) {
  const roleId = Number(role?.id)
  checkedBizPermissionIds.value = new Set()
  savedBizPermissionIds = []
  if (isReadonlyRole(role)) return
  try {
    const [permRes, rolePermRes]: any[] = await Promise.all([
      permissionApi.list(),
      roleApi.rolePermissions(roleId)
    ])
    if (Number(currentRole.value?.id) !== roleId) return
    bizPermissionList.value = Array.isArray(permRes.data) ? permRes.data : []
    const assigned = Array.isArray(rolePermRes.data) ? rolePermRes.data.map(Number) : []
    savedBizPermissionIds = assigned
    checkedBizPermissionIds.value = new Set(assigned)
  } catch (_e) {
    bizPermissionList.value = []
    checkedBizPermissionIds.value = new Set()
  }
}

async function loadOperationPermissions(role: any) {
  const roleId = Number(role?.id)
  const version = ++permissionSelectionVersion
  permissionLoadError.value = ''
  permissionLoadedRoleId.value = null
  menuCatalog.value = []
  checkedPermissionIds.value = new Set()
  savedAssignedMenuIds = []
  if (isReadonlyRole(role)) {
    operationLoading.value = false
    permissionLoadedRoleId.value = roleId
    return
  }
  operationLoading.value = true
  try {
    const [detailRes, menuRes]: any[] = await Promise.all([roleApi.detail(roleId), menuApi.list({})])
    if (version !== permissionSelectionVersion || Number(currentRole.value?.id) !== roleId) return
    if (Number(detailRes.data?.id) !== roleId || !Array.isArray(detailRes.data?.menuIds) || !Array.isArray(menuRes.data)) {
      throw new Error('权限数据不完整')
    }
    const catalog = menuRes.data.map((item: any) => ({
      id: Number(item.id),
      parentId: Number(item.parentId || 0),
      menuName: String(item.menuName || item.perms || item.id),
      perms: String(item.perms || '').trim(),
      status: Number(item.status ?? 0)
    }))
    if (catalog.some((item: PermissionMenuItem) => !Number.isSafeInteger(item.id) || item.id <= 0)) {
      throw new Error('权限节点格式错误')
    }
    const assigned = [...new Set<number>(detailRes.data.menuIds.map(Number))]
    if (assigned.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
      throw new Error('角色权限ID格式错误')
    }
    menuCatalog.value = catalog
    savedAssignedMenuIds = assigned
    checkedPermissionIds.value = new Set(assigned)
    permissionLoadedRoleId.value = roleId
  } catch (_e) {
    if (version !== permissionSelectionVersion || Number(currentRole.value?.id) !== roleId) return
    permissionLoadError.value = '按钮/API 权限未完整加载，已禁止保存，请刷新后重试'
  } finally {
    if (version === permissionSelectionVersion) operationLoading.value = false
  }
}

function resetOperationPermissions() {
  checkedPermissionIds.value = new Set(savedAssignedMenuIds)
}

function buildMenuIdsForSave(): number[] {
  const editableIds = new Set(operationItems.value.map((item) => item.id))
  const result = new Set(savedAssignedMenuIds.filter((id) => !editableIds.has(id)))
  const byId = new Map(menuCatalog.value.map((item) => [item.id, item]))
  const addWithAncestors = (id: number) => {
    let current = byId.get(id)
    let guard = 0
    result.add(id)
    while (current && current.parentId > 0 && guard++ < 20) {
      result.add(current.parentId)
      current = byId.get(current.parentId)
    }
  }
  operationItems.value.forEach((item) => {
    if (checkedPermissionIds.value.has(item.id)) addWithAncestors(item.id)
  })
  return [...result].sort((a, b) => a - b)
}

function reset() {
  checkedSubs.value = new Set(savedSubs)
  dataScope.value = savedScope
  resetOperationPermissions()
  ElMessage.success('已重置为上次保存的状态')
}

// ===== 角色增删改(合并版) =====
const { t } = useI18n()

function isProtectedRole(roleKey: unknown) {
  return READONLY_ROLE_KEYS.includes(String(roleKey || '').trim().toLowerCase())
}
function isPrivilegedRoleFamily(roleKey: unknown) {
  const normalized = String(roleKey || '').trim().toLowerCase()
  const separator = normalized.indexOf('__')
  const baseKey = separator > 0 ? normalized.slice(0, separator) : normalized
  return READONLY_ROLE_KEYS.includes(baseKey)
}

const templateOptions = ref<any[]>([])
async function loadTemplates() {
  try {
    const res: any = await roleApi.list({ pageNum: 1, pageSize: 100, status: 0 })
    const records = res.data?.records || res.data?.list || []
    // 管理员/老板角色只能由系统维护，不允许作为复制模板。
    templateOptions.value = Array.isArray(records)
      ? records.filter((role: any) => !isPrivilegedRoleFamily(role?.roleKey))
      : []
  } catch (_e) {
    templateOptions.value = []
  }
}
/** 无模板新建的底层基底:优先「普通员工」,保证新角色登录后基础可用(用户不感知模板概念) */
function findBaseRole() {
  const list = templateOptions.value
  return (
    list.find((r: any) => String(r.roleKey || '').split('__')[0] === 'staff') ||
    list.find((r: any) => r.roleName === '普通员工') ||
    list[0]
  )
}

const roleFormVisible = ref(false)
const roleFormTitle = ref('')
const roleFormRef = ref<FormInstance>()
const roleSubmitLoading = ref(false)
const roleForm = reactive<any>({
  id: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: 0,
  dataScope: 1,
  remark: '',
  templateKey: ''
})
const roleRules = reactive<FormRules>({
  roleName: [{ required: true, message: () => t('system.role.roleNameRequired'), trigger: 'blur' }]
})

function resetRoleForm() {
  roleForm.id = undefined
  roleForm.roleName = ''
  roleForm.roleKey = ''
  roleForm.roleSort = 0
  roleForm.status = 0
  roleForm.dataScope = 1
  roleForm.remark = ''
  roleForm.templateKey = ''
  delete roleForm.menuIds
}

function openRoleForm(role?: any) {
  resetRoleForm()
  if (role?.id) {
    // 编辑=只改名:数据范围/可见模块在本页主区改,状态与备注不再暴露
    roleFormTitle.value = '修改角色名称'
    roleForm.id = role.id
    roleForm.roleName = role.roleName || ''
    roleForm.roleKey = role.roleKey || ''
  } else {
    roleFormTitle.value = '新建角色'
  }
  roleFormVisible.value = true
}

async function submitRoleForm() {
  if (!roleFormRef.value) return
  await roleFormRef.value.validate()
  roleSubmitLoading.value = true
  try {
    if (roleForm.id) {
      // 只改名:roleKey 原值携带(后端 RoleDTO 校验 @NotBlank),权限/状态/备注一律不动
      await roleApi.update({ id: roleForm.id, roleName: roleForm.roleName, roleKey: roleForm.roleKey })
      ElMessage.success(t('common.success'))
      roleFormVisible.value = false
      await reloadRolesKeep(roleForm.id)
    } else {
      // 无模板新建:底层以「普通员工」最小权限为基底(用户不感知),数据范围默认仅本人;
      // 标识自动生成(基底前缀+随机后缀,保证后端角色族判定可用)。
      const base = findBaseRole()
      if (!base?.id) {
        ElMessage.error('未找到「普通员工」基础角色,无法创建,请联系管理员')
        return
      }
      const detailRes: any = await roleApi.detail(Number(base.id))
      const sourceMenuIds = detailRes.data?.menuIds
      if (Number(detailRes.data?.id) !== Number(base.id) || !Array.isArray(sourceMenuIds)) {
        ElMessage.error('基础角色权限数据未完整加载,已取消创建')
        return
      }
      const normalizedMenuIds = sourceMenuIds.map(Number)
      if (normalizedMenuIds.some((id: number) => !Number.isSafeInteger(id) || id <= 0)) {
        ElMessage.error('基础角色权限数据异常,已取消创建')
        return
      }
      const baseKey = String(base.roleKey || 'staff').split('__')[0]
      const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 5)
      const createdName = roleForm.roleName
      await roleApi.create({
        roleName: createdName,
        roleKey: `${baseKey}__${suffix}`,
        roleSort: 0,
        status: 0,
        dataScope: 5,
        remark: '',
        menuIds: [...new Set(normalizedMenuIds)]
      })
      ElMessage.success('已创建,请在右侧配置数据范围和可见模块')
      roleFormVisible.value = false
      await reloadRolesKeep(undefined)
      // 自动选中刚建的角色(按名称取最新一个)
      const match = [...roles.value].reverse().find((r: any) => r.roleName === createdName)
      if (match) selectRole(match)
    }
    loadTemplates()
  } finally {
    roleSubmitLoading.value = false
  }
}

function confirmDeleteRole(role: any) {
  ElMessageBox.confirm(t('system.role.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await roleApi.remove(role.id)
    ElMessage.success(t('common.success'))
    const keepId = Number(role.id) === Number(currentRole.value?.id) ? undefined : currentRole.value?.id
    await reloadRolesKeep(keepId)
    loadTemplates()
  }).catch(() => {})
}

// 页面导航以本页 visible_modules 为唯一来源；旧 sys_role_menu 仅保留给后端敏感操作兼容，不参与菜单显隐。
function onRoleCmd(cmd: string, role: any) {
  if (cmd === 'edit') openRoleForm(role)
  else if (cmd === 'delete') confirmDeleteRole(role)
}

/** 刷新角色列表并尽量保持当前选中 */
async function reloadRolesKeep(keepId?: number) {
  roleLoading.value = true
  try {
    const res: any = await roleApi.list({ pageNum: 1, pageSize: 200 })
    roles.value = sortRoles(res.data?.records || res.data?.list || res.data || [])
    const keep = keepId != null ? roles.value.find((r) => Number(r.id) === Number(keepId)) : null
    if (keep) {
      selectRole(keep)
    } else {
      const first = roles.value.find((r) => !isReadonlyRole(r)) || roles.value[0]
      if (first) selectRole(first)
      else currentRole.value = null
    }
  } finally {
    roleLoading.value = false
  }
}

// —— 成员管理:顶部只展示摘要，完整操作收进右侧抽屉 ——
const members = ref<any[]>([])
const membersLoading = ref(false)
const memberDrawerVisible = ref(false)
const candidateOptions = ref<any[]>([])
const candLoading = ref(false)
const selectedToAdd = ref<number[]>([])
const adding = ref(false)

const memberIdSet = computed(() => new Set(members.value.map((m) => Number(m.userId))))
// 候选下拉里剔除已经是本角色成员的人,避免重复加入
const addableCandidates = computed(() => candidateOptions.value.filter((c) => !memberIdSet.value.has(Number(c.userId))))

async function openMemberDrawer() {
  if (!currentRole.value) return
  memberDrawerVisible.value = true
  selectedToAdd.value = []
  await Promise.all([loadMembers(), searchCandidates('')])
}

function candLabel(c: any): string {
  const name = c.nickname || c.username || ('用户' + c.userId)
  const extra = c.phone ? ' · ' + c.phone : ''
  return `${name}（${c.username}）${extra}`
}

async function loadMembers() {
  if (!currentRole.value) return
  membersLoading.value = true
  try {
    const res: any = await roleApi.members(currentRole.value.id)
    members.value = res?.data ?? res ?? []
  } catch (e: any) {
    ElMessage.error(e?.message || '加载成员失败')
  } finally {
    membersLoading.value = false
  }
}

async function searchCandidates(kw: string) {
  candLoading.value = true
  try {
    const res: any = await roleApi.memberCandidates(kw || '')
    candidateOptions.value = res?.data ?? res ?? []
  } catch {
    candidateOptions.value = []
  } finally {
    candLoading.value = false
  }
}

async function addSelected() {
  if (!currentRole.value || !selectedToAdd.value.length) return
  const affectsCurrentUser = selectedToAdd.value.includes(Number(userStore.userInfo?.id))
  adding.value = true
  try {
    await roleApi.addMembers(currentRole.value.id, selectedToAdd.value)
    ElMessage.success('已加入，仅该成员当前会话已失效，需重新登录')
    selectedToAdd.value = []
    if (!affectsCurrentUser) await loadMembers()
  } catch (e: any) {
    ElMessage.error(e?.message || '加入失败')
  } finally {
    adding.value = false
  }
}

async function removeOne(m: any) {
  if (!currentRole.value) return
  const affectsCurrentUser = Number(m.userId) === Number(userStore.userInfo?.id)
  try {
    await ElMessageBox.confirm(`确定把「${m.nickname || m.username}」移出该角色吗？`, '移除成员', {
      type: 'warning',
      confirmButtonText: '移除',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    await roleApi.removeMember(currentRole.value.id, m.userId)
    ElMessage.success('已移除，仅该成员当前会话已失效，需重新登录')
    if (!affectsCurrentUser) await loadMembers()
  } catch (e: any) {
    ElMessage.error(e?.message || '移除失败')
  }
}

async function save() {
  if (!currentRole.value) return
  if (!operationReady.value) {
    ElMessage.error('操作权限尚未完整加载，本次未保存')
    return
  }
  if (!allOn.value && checkedSubs.value.size === 0) {
    ElMessage.warning('至少保留一个可见模块；如需不限制，请全部开启')
    return
  }
  saving.value = true
  try {
    const vm = serializeVisibleModuleSubs(checkedSubs.value, ALL_SUB_PATHS, configurableGroups, groupSubs)
    await Promise.all([
      roleApi.savePermissionSettings({
        roleId: Number(currentRole.value.id),
        dataScope: dataScope.value,
        visibleModules: vm,
        menuIds: buildMenuIdsForSave()
      }),
      roleApi.saveRolePermissions(Number(currentRole.value.id), [...checkedBizPermissionIds.value])
    ])
    currentRole.value.visibleModules = vm ?? ''
    currentRole.value.dataScope = dataScope.value
    savedScope = dataScope.value
    savedSubs = new Set(checkedSubs.value)
    savedAssignedMenuIds = buildMenuIdsForSave()
    savedBizPermissionIds = [...checkedBizPermissionIds.value]
    ElMessage.success('已保存；如权限有变化，受影响成员需重新登录')
  } catch (e: any) {
    ElMessage.error(e?.message || '保存失败')
  } finally {
    saving.value = false
  }
}
</script>

<style lang="scss" scoped>
.rp-page {
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: stretch;
  min-height: calc(100vh - 120px);
}

/* 左侧角色列表 */
.rp-aside {
  width: 240px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 12px;
    overflow: hidden;
  }
}
.rp-aside-head { font-weight: 600; }
.rp-search { margin-bottom: 10px; }
.rp-role-scroll { flex: 1; }
.rp-role-list { list-style: none; margin: 0; padding: 0; }
.rp-role-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 3px;
  border: 1px solid transparent;
  transition: all 0.2s;
  &:hover { background: var(--el-fill-color-light); }
  &.active { background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-5); }
}
.rp-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.rp-role-name { font-size: 14px; color: var(--el-text-color-primary); font-weight: 500; flex: 1; }

/* 拖拽排序:抓手悬停可见,拖动中的行虚线高亮 */
.rp-drag {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  letter-spacing: -1px;
  cursor: grab;
  visibility: hidden;
}
.rp-role-item:hover .rp-drag { visibility: visible; }
.rp-role-item.is-dragging {
  border: 1px dashed var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  opacity: 0.85;
}

/* 角色行 ⋮ 菜单 + 底部新建 */
.rp-role-more { flex-shrink: 0; }
.rp-more-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  color: var(--el-text-color-secondary);
  font-weight: 700;
  visibility: hidden;
  &:hover { background: var(--el-fill-color); color: var(--el-color-primary); }
}
.rp-role-item:hover .rp-more-btn,
.rp-role-item.active .rp-more-btn { visibility: visible; }
.rp-add-role { margin-top: 10px; width: 100%; }
.form-tip {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin-top: 4px;
}
.rp-create-note {
  padding: 9px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}

/* 右侧配置区 */
.rp-main { flex: 1; min-width: 0; }
.rp-main-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; }
.rp-main-title { font-weight: 600; display: flex; align-items: center; gap: 8px; }
.rp-actions { display: flex; align-items: center; gap: 10px; }
.rp-summary { font-size: 13px; color: var(--el-text-color-secondary); }
.rp-members-summary {
  display: flex;
  align-items: center;
  gap: 18px;
  min-height: 58px;
  margin-bottom: 18px;
  padding: 10px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}
.rp-members-summary-main { display: flex; align-items: center; min-width: 0; }
.rp-members-summary-label {
  margin-right: 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}
.rp-members-avatars { display: flex; align-items: center; padding-left: 6px; }
.rp-members-avatar,
.rp-members-empty-avatar {
  width: 28px;
  height: 28px;
  margin-left: -6px;
  border: 2px solid var(--el-bg-color);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--el-color-primary-light-8);
  color: var(--el-color-primary);
  font-size: 12px;
  font-weight: 650;
  flex-shrink: 0;
}
.rp-members-empty-avatar { margin-left: 0; color: var(--el-text-color-placeholder); background: var(--el-fill-color-light); }
.rp-members-avatar-more { background: var(--el-fill-color); color: var(--el-text-color-secondary); font-size: 11px; }
.rp-members-count { margin-left: 8px; font-size: 13px; color: var(--el-text-color-primary); white-space: nowrap; }
.rp-members-summary-note {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  margin-left: auto;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
  :deep(.el-icon) { color: var(--el-color-warning); }
}
.rp-section-title { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); margin-bottom: 3px; }

/* ===== 方案A：Tab 整合 ===== */
.rp-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 16px;
}

.rp-tab {
  padding: 9px 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  user-select: none;
  transition: color 0.15s ease;
}

.rp-tab:hover { color: var(--el-text-color-primary); }

.rp-tab.active {
  color: var(--el-color-primary);
  font-weight: 600;
  border-bottom-color: var(--el-color-primary);
}

.rp-tab-badge {
  font-size: 11px;
  padding: 0 7px;
  line-height: 17px;
  border-radius: 999px;
  background: var(--el-color-primary-light-9, #f2f7ff);
  color: var(--el-color-primary);
  font-weight: 600;
}

.rp-pane { padding-top: 2px; }

.rp-src-tag {
  transform: scale(0.86);
  transform-origin: left center;
  margin-left: 4px;
}

.rp-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
  max-width: 560px;
}

.rp-preview-row {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.rp-preview-row:last-child { border-bottom: none; }

.rp-preview-label {
  width: 110px;
  flex-shrink: 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.rp-preview-value {
  font-size: 13px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.rp-section-desc { font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 12px; }

/* 数据范围卡片 */
/* 横排三卡(2026-07-20 用户选方案一):高度从三层压成一行 */
.rp-scope { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.rp-scope-item {
  display: flex; align-items: flex-start; gap: 8px; padding: 8px 12px;
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px; cursor: pointer; transition: all 0.2s;
  &:hover { border-color: var(--el-color-primary-light-5); }
  &.active { border-color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
}
.rp-radio {
  width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid var(--el-border-color);
  flex-shrink: 0; margin-top: 2px; display: flex; align-items: center; justify-content: center;
  .rp-scope-item.active & { border-color: var(--el-color-primary); }
}
.rp-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--el-color-primary); }
.rp-scope-title { font-size: 13px; color: var(--el-text-color-primary); }
.rp-scope-sub { font-size: 12px; color: var(--el-text-color-secondary); margin-top: 1px; }

/* ② 模块：左大类 + 右小类 */
.rp-mod2 { display: flex; gap: 14px; align-items: stretch; }
.rp-cats {
  width: 40%; min-width: 190px;
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden;
}
.rp-cat-item {
  display: flex; align-items: center; gap: 10px; padding: 11px 12px; cursor: pointer;
  &:not(:first-child) { border-top: 1px solid var(--el-border-color-lighter); }
  &:hover { background: var(--el-fill-color-light); }
  &.active { background: var(--el-color-primary-light-9); }
}
.rp-cat-tile {
  width: 26px; height: 26px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
  :deep(.el-icon) { color: #fff; font-size: 15px; }
}
.rp-cat-name { font-size: 14px; color: var(--el-text-color-primary); flex: 1; }
.rp-cat-count {
  font-size: 12px; padding: 1px 8px; border-radius: 8px;
  &.on { color: var(--el-color-success); background: var(--el-color-success-light-9); }
  &.part { color: var(--el-color-warning); background: var(--el-color-warning-light-9); }
  &.off { color: var(--el-text-color-placeholder); background: var(--el-fill-color-light); }
}
.rp-subs {
  flex: 1; min-width: 0;
  border: 1px solid var(--el-border-color-lighter); border-radius: 8px; display: flex; flex-direction: column;
}
.rp-subs-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 14px; border-bottom: 1px solid var(--el-border-color-lighter); background: var(--el-fill-color-light);
}
.rp-subs-title { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.rp-sub-list { flex: 1; }
.rp-sub-item {
  display: flex; align-items: center; gap: 10px; padding: 10px 14px;
  &:not(:first-child) { border-top: 1px solid var(--el-border-color-lighter); }
}
.rp-sub-name { font-size: 13px; color: var(--el-text-color-primary); flex: 1; }
.rp-sub-state {
  font-size: 12px;
  &.on { color: var(--el-color-success); }
  &.off { color: var(--el-text-color-placeholder); }
}
.rp-operation-box {
  min-height: 92px;
  padding: 0 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}
.rp-operation-collapse { border: 0; }
.rp-operation-title { margin-right: 10px; color: var(--el-text-color-primary); font-weight: 600; }
.rp-operation-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 2px 0 12px;
}
.rp-operation-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  padding: 9px 11px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-light);
}
.rp-operation-text { flex: 1; min-width: 0; }
.rp-operation-text strong { display: block; color: var(--el-text-color-primary); font-size: 13px; font-weight: 500; }
.rp-operation-text span {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: var(--el-text-color-secondary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rp-tip {
  display: flex; align-items: flex-start; gap: 8px; margin-top: 16px; padding: 10px 14px;
  background: var(--el-fill-color-light); border-radius: 8px; font-size: 12px; color: var(--el-text-color-secondary); line-height: 1.6;
  b { color: var(--el-color-primary); font-weight: 600; }
}

/* 成员管理抽屉 */
.rpm-drawer-head { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.rpm-drawer-title { color: var(--el-text-color-primary); font-size: 17px; font-weight: 650; }
.rpm-drawer-sub { margin-top: 3px; color: var(--el-text-color-secondary); font-size: 12px; }
.mm-wrap { display: flex; flex-direction: column; gap: 18px; }
.mm-notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.55;
  :deep(.el-icon) { margin-top: 2px; color: var(--el-color-primary); }
}
.mm-block { display: flex; flex-direction: column; gap: 8px; }
.mm-label { font-size: 13px; font-weight: 600; color: var(--el-text-color-primary); }
.mm-add-row { display: flex; gap: 8px; align-items: flex-start; }
.mm-select { flex: 1; min-width: 0; }
.mm-hint { font-size: 12px; color: var(--el-text-color-secondary); }
.mm-list { list-style: none; margin: 0; padding: 0; border: 1px solid var(--el-border-color-lighter); border-radius: 8px; }
.mm-item {
  display: flex; align-items: center; gap: 10px; padding: 9px 12px;
  &:not(:first-child) { border-top: 1px solid var(--el-border-color-lighter); }
}
.mm-avatar {
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--el-color-primary-light-8); color: var(--el-color-primary); font-size: 13px; font-weight: 600;
}
.mm-info { flex: 1; min-width: 0; }
.mm-name { font-size: 13px; color: var(--el-text-color-primary); font-weight: 500; }
.mm-sub { font-size: 12px; color: var(--el-text-color-secondary); }

@media (max-width: 1100px) {
  .rp-members-summary { gap: 10px; flex-wrap: wrap; }
  .rp-members-summary-note { order: 3; width: 100%; margin-left: 0; }
  .rp-operation-grid { grid-template-columns: 1fr; }
}

/* 权限预览弹窗 */
.rpp-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  padding: 12px 16px;
  margin-bottom: 12px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}
.rpp-summary-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.rpp-summary-label { color: var(--el-text-color-secondary); }
.rpp-summary-item b { color: var(--el-color-primary); font-weight: 650; }
.rpp-nav { display: flex; flex-direction: column; gap: 6px; padding-right: 4px; }
.rpp-group {
  padding: 12px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
}
.rpp-group-head { display: flex; align-items: center; gap: 10px; }
.rpp-tile {
  width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  color: #fff; font-size: 15px; font-weight: 600;
}
.rpp-group-name { font-size: 14px; font-weight: 600; color: var(--el-text-color-primary); }
.rpp-group-count { font-size: 12px; color: var(--el-text-color-secondary); }
.rpp-pages {
  display: flex; flex-wrap: wrap; gap: 8px;
  margin: 10px 0 0 38px;
}
.rpp-page {
  font-size: 12.5px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  padding: 4px 10px;
}
.rpp-foot { display: flex; align-items: center; gap: 12px; }
.rpp-foot-tip { font-size: 12px; color: var(--el-text-color-secondary); margin-right: auto; text-align: left; }
</style>

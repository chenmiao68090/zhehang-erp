<template>
  <div class="page-container culture-page">
    <!-- 顶部主视觉横幅 -->
    <section class="culture-hero">
      <div class="culture-hero-text">
        <span class="culture-hero-eyebrow">ZHEHANG · 浙杭人文</span>
        <h1>浙杭人文 携手并肩</h1>
        <p>以人为本，凝聚同心。员工风采、企业文化、行政制度，构建有温度、有效率、能打硬仗的浙杭团队。</p>
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
      <!-- Tab 0：员工风采(嵌入照片墙组件,置于最前) -->
      <el-tab-pane name="staff" lazy>
        <template #label><span class="culture-tab-label">员工风采</span></template>
        <StaffShowcase :embedded="true" />
      </el-tab-pane>

      <!-- Tab 1：员工关怀 -->
      <el-tab-pane name="care">
        <template #label><span class="culture-tab-label">员工关怀</span></template>
        <div class="culture-section-head">
          <div>
            <h2>员工关怀</h2>
            <p>生日提醒、入职周年自动关联员工档案，行政和管理层可以按今天、本周、本月提前准备关怀动作。</p>
          </div>
          <el-segmented v-model="careType" :options="careTypeOptions" />
        </div>

        <div class="care-stat-grid">
          <article v-for="item in careStats" :key="item.label" class="care-stat-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>

        <div class="care-toolbar">
          <el-input
            v-model="careKeyword"
            clearable
            :prefix-icon="Search"
            placeholder="搜索姓名、部门、岗位"
          />
          <el-button plain @click="exportCareList">
            <el-icon><Download /></el-icon>导出名单
          </el-button>
        </div>

        <el-table v-loading="employeeLoading" :data="filteredCareItems" class="care-table" empty-text="暂无符合条件的员工">
          <el-table-column prop="name" label="姓名" min-width="150">
            <template #default="{ row }">
              <div class="care-person">
                <span class="care-avatar">{{ avatarText(row.name) }}</span>
                <div>
                  <b>{{ row.name }}</b>
                  <small>{{ row.postName || '未设岗位' }}</small>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="deptName" label="部门" min-width="150" />
          <el-table-column prop="sourceDate" :label="careType === 'birthday' ? '出生日期' : '入职日期'" width="130" />
          <el-table-column prop="monthText" :label="careType === 'birthday' ? '生日月份' : '周年月份'" width="110" />
          <el-table-column prop="nextDateText" label="最近日期" width="130" />
          <el-table-column prop="daysText" label="提醒" min-width="150">
            <template #default="{ row }">
              <el-tag :type="row.daysUntil === 0 ? 'danger' : row.daysUntil <= 7 ? 'warning' : 'info'" effect="plain">
                {{ row.daysText }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="careType === 'anniversary'" prop="yearsText" label="入职周年" width="120" />
          <el-table-column label="建议动作" min-width="180">
            <template #default="{ row }">
              {{ row.action }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- Tab 3：员工意见箱 -->
      <el-tab-pane name="feedback">
        <template #label><span class="culture-tab-label">员工意见箱</span></template>
        <div class="culture-section-head">
          <div>
            <h2>员工意见箱</h2>
            <p>支持匿名建议、投诉与管理建议。员工侧只负责提交，管理侧负责回复和闭环。</p>
          </div>
          <el-tag :type="pendingFeedbackCount ? 'warning' : 'success'" effect="plain">
            待回复 {{ pendingFeedbackCount }}
          </el-tag>
        </div>

        <div class="feedback-layout">
          <section class="feedback-form-card">
            <h3>提交建议</h3>
            <el-form ref="feedbackFormRef" :model="feedbackForm" :rules="feedbackRules" label-position="top">
              <el-form-item label="类型" prop="category">
                <el-radio-group v-model="feedbackForm.category">
                  <el-radio-button label="建议" />
                  <el-radio-button label="投诉" />
                  <el-radio-button label="制度优化" />
                </el-radio-group>
              </el-form-item>
              <el-form-item label="标题" prop="title">
                <el-input v-model="feedbackForm.title" maxlength="60" show-word-limit placeholder="一句话说明问题" />
              </el-form-item>
              <el-form-item label="内容" prop="content">
                <el-input
                  v-model="feedbackForm.content"
                  type="textarea"
                  :rows="5"
                  maxlength="800"
                  show-word-limit
                  placeholder="请说明具体场景、影响和建议方案"
                />
              </el-form-item>
              <el-form-item label="抄送人员选择">
                <el-checkbox-group v-model="feedbackForm.ccTargets" class="feedback-cc-group">
                  <el-checkbox v-for="item in feedbackCcOptions" :key="item.value" :label="item.value">
                    {{ item.label }}
                  </el-checkbox>
                </el-checkbox-group>
                <div class="feedback-field-tip">选择后会随意见一起记录，方便管理层按角色跟进。</div>
              </el-form-item>
              <el-checkbox v-model="feedbackForm.anonymous">匿名展示给管理层</el-checkbox>
              <div class="feedback-actions">
                <el-button type="primary" :loading="feedbackSaving" @click="submitFeedback">
                  <el-icon><ChatDotRound /></el-icon>提交意见
                </el-button>
              </div>
            </el-form>
          </section>

          <section class="feedback-list-card">
            <div class="panel-title">
              <h3>闭环记录</h3>
              <el-tag type="info" effect="plain">管理层可见详情</el-tag>
            </div>
            <div v-loading="feedbackLoading" class="feedback-list">
              <article v-for="item in feedbackItems" :key="item.id" class="feedback-item">
                <div class="feedback-item-head">
                  <div>
                    <el-tag size="small" :type="item.category === '投诉' ? 'danger' : item.category === '制度优化' ? 'warning' : 'primary'" effect="plain">
                      {{ item.category }}
                    </el-tag>
                    <strong>{{ item.title }}</strong>
                  </div>
                  <el-tag size="small" :type="item.reply ? 'success' : 'warning'" effect="plain">
                    {{ item.reply ? '已回复' : '待回复' }}
                  </el-tag>
                </div>
                <p>{{ canManage ? item.content : '已提交，管理层会在此闭环回复。' }}</p>
                <div class="feedback-meta">
                  <span>{{ item.anonymous ? '匿名' : '实名' }}</span>
                  <span>{{ item.createTime || '刚刚' }}</span>
                  <span v-if="canManage && item.ccLabels.length">抄送：{{ item.ccLabels.join('、') }}</span>
                </div>
                <div v-if="item.reply" class="feedback-reply">
                  <b>管理回复：</b>{{ item.reply }}
                </div>
                <div v-if="canManage" class="feedback-manage">
                  <el-button link type="primary" @click="replyFeedback(item)">登记回复</el-button>
                  <el-button link type="danger" @click="removeContent(item.raw, 'feedback')">删除</el-button>
                </div>
              </article>
              <el-empty v-if="!feedbackLoading && !feedbackItems.length" description="暂无意见记录" :image-size="72" />
            </div>
          </section>
        </div>
      </el-tab-pane>

      <!-- Tab 1：企业文化 -->
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
              <p class="culture-mvv-body">{{ item.body }}</p>
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

          <section class="culture-feed-section">
            <div class="culture-sub-head">
              <div>
                <h3><el-icon><Picture /></el-icon>文化动态</h3>
                <p>公司动态、团建活动、节日福利、员工表彰公告统一发布，员工进来就能看到公司最近发生了什么。</p>
              </div>
              <div class="culture-sub-actions">
                <el-segmented v-model="cultureNewsFilter" :options="cultureNewsFilterOptions" />
                <el-button v-if="canManage" type="primary" plain @click="openEdit('culture_news')">
                  <el-icon><Plus /></el-icon>新增动态
                </el-button>
              </div>
            </div>
            <div v-loading="cultureNewsLoading" class="culture-news-grid">
              <article v-for="item in filteredCultureNews" :key="item.id" class="culture-news-card">
                <div class="culture-news-cover" :class="{ empty: !item.imageUrl }">
                  <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" />
                  <el-icon v-else><Picture /></el-icon>
                  <el-tag class="culture-news-tag" effect="dark" size="small">{{ item.category }}</el-tag>
                </div>
                <div class="culture-news-body">
                  <span>{{ item.eventDate || '近期' }}</span>
                  <strong>{{ item.title }}</strong>
                  <p>{{ item.summary || item.detail }}</p>
                  <div v-if="canManage" class="culture-card-ops">
                    <el-button link type="primary" size="small" @click="openEdit('culture_news', item)">
                      <el-icon><EditPen /></el-icon>编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="removeContent(item, 'culture_news')">
                      <el-icon><Delete /></el-icon>删除
                    </el-button>
                  </div>
                </div>
              </article>
              <el-empty v-if="!cultureNewsLoading && !filteredCultureNews.length" description="暂无文化动态，管理员可点击右上角新增" :image-size="72" />
            </div>
          </section>

          <section class="culture-feed-section honor-wall-section">
            <div class="culture-sub-head">
              <div>
                <h3><el-icon><Medal /></el-icon>荣誉墙</h3>
                <p>员工照片、活动照片、月度销冠、优秀会计、服务之星在这里公示，让好表现被看见。</p>
              </div>
              <el-button v-if="canManage" type="primary" plain @click="openEdit('honor')">
                <el-icon><Plus /></el-icon>上传荣誉
              </el-button>
            </div>
            <div v-loading="honorLoading" class="honor-wall-grid">
              <article v-for="item in honorWallList" :key="item.id" class="honor-wall-card">
                <div class="honor-photo" :class="{ empty: !item.imageUrl }">
                  <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.title" />
                  <span v-else>{{ item.personName ? item.personName.slice(0, 1) : item.title.slice(0, 1) }}</span>
                </div>
                <div class="honor-info">
                  <el-tag size="small" type="warning" effect="plain">{{ item.category }}</el-tag>
                  <strong>{{ item.title }}</strong>
                  <p v-if="item.personName">{{ item.personName }}<span v-if="item.roleName"> · {{ item.roleName }}</span></p>
                  <p>{{ item.summary || item.detail }}</p>
                  <small>{{ item.eventDate || '持续公示' }}</small>
                  <div v-if="canManage" class="culture-card-ops culture-card-ops-center">
                    <el-button link type="primary" size="small" @click="openEdit('honor', item)">
                      <el-icon><EditPen /></el-icon>编辑
                    </el-button>
                    <el-button link type="danger" size="small" @click="removeContent(item, 'honor')">
                      <el-icon><Delete /></el-icon>删除
                    </el-button>
                  </div>
                </div>
              </article>
              <el-empty v-if="!honorLoading && !honorWallList.length" description="暂无荣誉内容，管理员可上传员工/活动照片" :image-size="72" />
            </div>
          </section>
          <el-empty v-if="!cultureLoading && !mvvList.length && !coreValues.length" description="暂无企业文化内容，请点击右上角新增" :image-size="80" />
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
            <ul class="culture-policy-points" :class="{ collapsed: isPolicyCollapsed(item) }">
              <li v-for="(point, idx) in item.points" :key="idx">{{ point }}</li>
            </ul>
            <el-button v-if="item.points.length > 5" class="culture-policy-toggle" link type="primary" @click="togglePolicy(item.id)">
              {{ policyExpanded.has(item.id) ? '收起内容' : '展开全部' }}
            </el-button>
            <div v-if="item.attachments.length" class="culture-policy-files">
              <button v-for="file in item.attachments" :key="policyFileKey(file)" type="button" @click="downloadPolicyFile(file)">
                <el-icon><Download /></el-icon>
                <span>{{ file.name }}</span>
              </button>
            </div>
          </el-card>
          <el-empty v-if="!policyLoading && !policyList.length" description="暂无行政制度，请点击右上角新增" :image-size="80" />
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- 人文内容编辑弹窗（管理员） -->
    <el-dialog
      v-model="editVisible"
      :title="editTitle"
      width="680px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editRules" label-width="84px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="editForm.title" maxlength="128" show-word-limit :placeholder="editTitlePlaceholder" />
        </el-form-item>
        <el-form-item v-if="!isRichCultureType" label="图标">
          <IconPicker v-model="editForm.icon" :options="cultureIconOptions" :maxlength="16" />
        </el-form-item>
        <template v-else>
          <el-form-item label="分类">
            <el-select v-model="editExtra.category" placeholder="请选择分类" style="width: 100%;">
              <el-option
                v-for="item in activeCategoryOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item v-if="isHonorType" label="对象">
            <div class="culture-inline-fields">
              <el-input v-model="editExtra.personName" maxlength="40" placeholder="员工姓名 / 团队名称" />
              <el-input v-model="editExtra.roleName" maxlength="40" placeholder="岗位 / 荣誉身份" />
            </div>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="editExtra.eventDate"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择发布日期/获奖月份"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="封面照片">
            <div class="culture-upload-field">
              <el-upload
                v-model:file-list="editUploadFiles"
                action="#"
                list-type="picture-card"
                :auto-upload="false"
                accept="image/*"
                :limit="1"
                :on-change="handleEditImageChange"
                :on-remove="handleEditImageRemove"
                :on-exceed="handleEditImageExceed"
              >
                <el-icon><UploadFilled /></el-icon>
              </el-upload>
              <el-input v-model="editExtra.imageUrl" placeholder="也可以粘贴图片链接，如 https://..." />
              <span class="culture-form-hint">选择图片会先上传到文件管理；粘贴外部链接也可以。</span>
            </div>
          </el-form-item>
          <el-form-item label="摘要">
            <el-input
              v-model="editExtra.summary"
              maxlength="160"
              show-word-limit
              placeholder="一句话概括，展示在卡片上"
            />
          </el-form-item>
        </template>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="editForm.content"
            type="textarea"
            :rows="isRichCultureType ? 4 : 6"
            :maxlength="isRichCultureType ? 800 : 2000"
            show-word-limit
            :placeholder="editContentPlaceholder"
          />
        </el-form-item>
        <el-form-item v-if="editForm.type === 'policy'" label="附件">
          <div class="culture-policy-upload">
            <el-button :icon="UploadFilled" :loading="policyFileUploading" @click="policyFileInput?.click()">上传图片/附件</el-button>
            <span class="culture-form-hint">支持图片、PDF、Office 等制度附件</span>
            <input ref="policyFileInput" type="file" multiple style="display:none" @change="handlePolicyFilePick" />
            <div v-if="editPolicyFiles.length" class="culture-policy-upload-list">
              <el-tag v-for="(file, idx) in editPolicyFiles" :key="policyFileKey(file)" closable @close="editPolicyFiles.splice(idx, 1)">
                {{ file.name }}
              </el-tag>
            </div>
          </div>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChatDotRound, Delete, Download, EditPen, Medal, Picture, Plus, Search, UploadFilled } from '@element-plus/icons-vue'
import { structureApi, employeeApi } from '@/api/org'
import { contentApi } from '@/api/culture'
import { fileInfoApi } from '@/api/file'
import { useUserStore } from '@/stores/user'
import IconPicker from '@/components/IconPicker.vue'
import StaffShowcase from '@/views/collaboration/contacts.vue'

const userStore = useUserStore()
const router = useRouter()

// 管理员/老板/经理可维护人文内容
const canManage = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('boss') || roles.includes('manager')
})

// 默认展示「企业文化」。人文中心定位为全员文化门户:企业文化 / 行政制度 / 员工风采;
// 组织架构与员工档案的「管理」统一在「人力组织」,本页只做文化展示,不再重复组织架构 Tab。
const activeTab = ref('staff')

// ===== 横幅统计 + 员工风采(数据实时来自人力组织后台) =====
const rawTree = ref<any[]>([])
const allEmployees = ref<any[]>([])
const employeeLoading = ref(false)

// 递归统计部门数(含子部门)
function countDepts (nodes: any[]): number {
  let n = 0
  for (const node of nodes || []) {
    n += 1
    if (Array.isArray(node.children) && node.children.length) n += countDepts(node.children)
  }
  return n
}

const heroStats = computed(() => ({
  deptCount: countDepts(rawTree.value),
  memberCount: allEmployees.value.length,
  activeCount: allEmployees.value.filter(e => e.status !== 3).length
}))

const loadStructure = async () => {
  try {
    const res = await structureApi.tree()
    rawTree.value = res.data || []
  } catch (e) {
    rawTree.value = []
  }
}

// 拉员工档案用于横幅统计与风采墙(后端 DataScope 对非HR/管理员只返回本人)
const loadEmployees = async () => {
  employeeLoading.value = true
  try {
    const res = await employeeApi.list({ pageNum: 1, pageSize: 500 })
    const data = res.data || {}
    allEmployees.value = data.records || data.list || []
  } catch (e) {
    allEmployees.value = []
  } finally {
    employeeLoading.value = false
  }
}

// ===== 员工关怀：生日 / 入职周年 =====
type CareType = 'birthday' | 'anniversary'

interface CareItem {
  id: number | string
  name: string
  postName: string
  deptName: string
  sourceDate: string
  monthText: string
  nextDateText: string
  daysUntil: number
  daysText: string
  yearsText: string
  action: string
  searchText: string
  nextDate: Date
}

const careType = ref<CareType>('birthday')
const careKeyword = ref('')
const careTypeOptions = [
  { label: '生日', value: 'birthday' },
  { label: '入职周年', value: 'anniversary' }
]

const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const parseDate = (value: any): Date | null => {
  if (!value) return null
  const text = String(value).slice(0, 10)
  const parts = text.split('-').map(Number)
  if (parts.length !== 3 || parts.some(n => Number.isNaN(n))) return null
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return Number.isNaN(d.getTime()) ? null : d
}

const pad2 = (n: number) => String(n).padStart(2, '0')
const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
const formatMonthDay = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`
const dayMs = 24 * 60 * 60 * 1000

const nextOccurrence = (source: Date) => {
  const today = startOfToday()
  let next = new Date(today.getFullYear(), source.getMonth(), source.getDate())
  if (next.getTime() < today.getTime()) {
    next = new Date(today.getFullYear() + 1, source.getMonth(), source.getDate())
  }
  return next
}

const describeDays = (days: number) => {
  if (days === 0) return '今天'
  if (days === 1) return '明天'
  return `${days} 天后`
}

const activeEmployees = computed(() =>
  allEmployees.value.filter(e => Number(e.status ?? 1) !== 3)
)

const careItems = computed<CareItem[]>(() => {
  const today = startOfToday()
  return activeEmployees.value
    .map((e: any) => {
      const source = parseDate(careType.value === 'birthday' ? e.birthDate : e.hireDate)
      if (!source) return null
      const next = nextOccurrence(source)
      const daysUntil = Math.max(0, Math.round((next.getTime() - today.getTime()) / dayMs))
      const anniversaryYears = Math.max(0, next.getFullYear() - source.getFullYear())
      const action = careType.value === 'birthday'
        ? (daysUntil === 0 ? '当天祝福 + 小礼物确认' : '提前准备祝福、蛋糕或红包')
        : (anniversaryYears > 0 ? `准备第 ${anniversaryYears} 周年关怀` : '新人入职关怀')

      return {
        id: e.id || e.employeeId || `${e.name}-${source.toISOString()}`,
        name: e.name || e.realName || '未命名',
        postName: e.postName || e.position || '',
        deptName: e.deptName || '',
        sourceDate: formatDate(source),
        monthText: `${source.getMonth() + 1} 月`,
        nextDateText: formatMonthDay(next),
        daysUntil,
        daysText: describeDays(daysUntil),
        yearsText: anniversaryYears > 0 ? `${anniversaryYears} 周年` : '未满 1 年',
        action,
        searchText: `${e.name || ''} ${e.realName || ''} ${e.postName || ''} ${e.position || ''} ${e.deptName || ''}`.toLowerCase(),
        nextDate: next
      } as CareItem
    })
    .filter(Boolean)
    .sort((a: any, b: any) => a.daysUntil - b.daysUntil) as CareItem[]
})

const filteredCareItems = computed(() => {
  const kw = careKeyword.value.trim().toLowerCase()
  if (!kw) return careItems.value
  return careItems.value.filter(item => item.searchText.includes(kw))
})

const careStats = computed(() => {
  const today = startOfToday()
  const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return [
    { label: '今天', value: careItems.value.filter(item => item.daysUntil === 0).length },
    { label: '本周', value: careItems.value.filter(item => item.daysUntil <= 7).length },
    {
      label: '本月',
      value: careItems.value.filter(item =>
        item.nextDate.getFullYear() === today.getFullYear() &&
        item.nextDate.getMonth() === today.getMonth()
      ).length
    },
    {
      label: '下月',
      value: careItems.value.filter(item =>
        item.nextDate.getFullYear() === nextMonth.getFullYear() &&
        item.nextDate.getMonth() === nextMonth.getMonth()
      ).length
    },
    { label: careType.value === 'birthday' ? '有生日档案' : '有入职档案', value: careItems.value.length }
  ]
})

const exportCareList = () => {
  const header = ['姓名', '部门', '岗位', careType.value === 'birthday' ? '出生日期' : '入职日期', '最近日期', '提醒', '建议动作']
  const rows = filteredCareItems.value.map(item => [
    item.name,
    item.deptName,
    item.postName,
    item.sourceDate,
    item.nextDateText,
    item.daysText,
    item.action
  ])
  const csv = `\uFEFF${[header, ...rows].map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n')}`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `员工关怀-${careType.value === 'birthday' ? '生日' : '入职周年'}-${formatDate(startOfToday())}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ===== 员工意见箱：复用 culture_content(type=feedback) 存闭环记录 =====
interface FeedbackPayload {
  category: string
  anonymous: boolean
  ccTargets: string[]
  content: string
  reply: string
  replyTime: string
}

const feedbackLoading = ref(false)
const feedbackSaving = ref(false)
const feedbackRaw = ref<any[]>([])
const feedbackFormRef = ref()
const feedbackCcOptions = [
  { label: '部门直属上级', value: 'direct_manager' },
  { label: 'HRBP(人事)', value: 'hrbp' },
  { label: '总经办助理', value: 'gm_assistant' }
]
const feedbackCcLabelMap = feedbackCcOptions.reduce<Record<string, string>>((map, item) => {
  map[item.value] = item.label
  return map
}, {})
const feedbackForm = reactive({
  category: '建议',
  title: '',
  content: '',
  ccTargets: ['direct_manager', 'hrbp'] as string[],
  anonymous: true
})
const feedbackRules = {
  category: [{ required: true, message: '请选择类型', trigger: 'change' }],
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

const parseFeedbackPayload = (raw: any): FeedbackPayload => {
  try {
    const parsed = JSON.parse(raw?.content || '{}')
    return {
      category: parsed.category || raw?.icon || '建议',
      anonymous: parsed.anonymous !== false,
      ccTargets: Array.isArray(parsed.ccTargets) ? parsed.ccTargets : [],
      content: parsed.content || '',
      reply: parsed.reply || '',
      replyTime: parsed.replyTime || ''
    }
  } catch {
    return {
      category: raw?.icon || '建议',
      anonymous: true,
      ccTargets: [],
      content: raw?.content || '',
      reply: '',
      replyTime: ''
    }
  }
}

const feedbackItems = computed(() =>
  feedbackRaw.value
    .map(raw => {
      const payload = parseFeedbackPayload(raw)
      return {
        id: raw.id,
        title: raw.title,
        createTime: raw.createTime,
        raw,
        payload,
        ccLabels: payload.ccTargets.map(item => feedbackCcLabelMap[item] || item).filter(Boolean),
        ...payload
      }
    })
    .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
)

const pendingFeedbackCount = computed(() => feedbackItems.value.filter(item => !item.reply).length)

const loadFeedback = async () => {
  feedbackLoading.value = true
  try {
    const res = await contentApi.list('feedback')
    feedbackRaw.value = (res as any)?.data || []
  } catch {
    feedbackRaw.value = []
  } finally {
    feedbackLoading.value = false
  }
}

const submitFeedback = async () => {
  await feedbackFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    feedbackSaving.value = true
    try {
      const payload: FeedbackPayload = {
        category: feedbackForm.category,
        anonymous: feedbackForm.anonymous,
        ccTargets: [...feedbackForm.ccTargets],
        content: feedbackForm.content,
        reply: '',
        replyTime: ''
      }
      await contentApi.save({
        type: 'feedback',
        title: feedbackForm.title,
        icon: feedbackForm.category,
        content: JSON.stringify(payload),
        sortOrder: -Math.floor(Date.now() / 1000),
        status: 1
      })
      ElMessage.success('已提交，管理层会在意见箱中闭环回复')
      Object.assign(feedbackForm, { category: '建议', title: '', content: '', ccTargets: ['direct_manager', 'hrbp'], anonymous: true })
      await loadFeedback()
    } finally {
      feedbackSaving.value = false
    }
  })
}

const replyFeedback = async (item: any) => {
  try {
    const result: any = await ElMessageBox.prompt('请输入管理回复，员工可在闭环记录中查看。', '登记回复', {
      confirmButtonText: '保存回复',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputValue: item.reply || '',
      inputValidator: (value: string) => Boolean(value && value.trim()),
      inputErrorMessage: '请填写回复内容'
    })
    const payload: FeedbackPayload = {
      ...item.payload,
      reply: result.value.trim(),
      replyTime: formatDate(startOfToday())
    }
    await contentApi.save({
      id: item.id,
      type: 'feedback',
      title: item.title,
      icon: item.category,
      content: JSON.stringify(payload),
      sortOrder: item.raw?.sortOrder ?? 0,
      status: 1
    })
    ElMessage.success('回复已保存')
    await loadFeedback()
  } catch {
    // 用户取消
  }
}

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

// ===== 行政制度 / 企业文化(后端 /culture/content 可维护) =====
// 后端 CultureContent: { id, type(policy/culture/honor), title, content, icon, sortOrder, status }
const policyRaw = ref<any[]>([])
const cultureRaw = ref<any[]>([])
const cultureNewsRaw = ref<any[]>([])
const honorRaw = ref<any[]>([])
const policyLoading = ref(false)
const cultureLoading = ref(false)
const cultureNewsLoading = ref(false)
const honorLoading = ref(false)
const cultureNewsFilter = ref('全部')

const cultureNewsFilterOptions = ['全部', '公司动态', '团建活动', '节日福利', '员工表彰']
const cultureNewsCategories = cultureNewsFilterOptions.filter(item => item !== '全部')
const honorCategories = ['月度销冠', '优秀会计', '服务之星', '优秀团队', '活动照片', '员工照片']
const cultureIconOptions = [
  '🎯', '💎', '🚀', '🤝', '📈', '❤️', '⭐', '🏆',
  '🌱', '🔥', '🌟', '💡', '🧭', '🛡️', '⚡', '🌈',
  '📌', '📣', '📚', '📝', '📋', '🗂️', '📅', '⏰',
  '💼', '💰', '🧾', '🧮', '🏢', '🏠', '☎️', '💬',
  '👥', '🙌', '👏', '😊', '🎁', '🎉', '🎂', '🥇',
  '🏅', '🎖️', '🪪', '🧑‍💼', '👩‍💼', '🧑‍🏫', '📞', '🔔',
  '✅', '🔒', '🔑', '🧩', '🧠', '🛠️', '🧰', '📊'
]

const POLICY_COLORS = ['#e6f0ff', '#fff3e0', '#e8f5e9', '#f3e8ff', '#e0f7fa', '#fde8e8']

const splitLines = (content: string): string[] =>
  String(content || '').split(/\r?\n/).map(s => s.trim()).filter(Boolean)

const hasMojibake = (value: unknown): boolean =>
  /�|Ã|Â|ðŸ|ä|å|æ|ç|è|é|娴|欐|澀|绠|悊|荤|粺|鍚|庣|锟/.test(String(value || ''))

const isReadableContent = (item: any): boolean =>
  ![item.title, item.content, item.icon].some(hasMojibake)

const cleanPolicyRaw = computed(() => policyRaw.value.filter(isReadableContent))
const cleanCultureRaw = computed(() => cultureRaw.value.filter(isReadableContent))
const cleanCultureNewsRaw = computed(() => cultureNewsRaw.value.filter(isReadableContent))
const cleanHonorRaw = computed(() => honorRaw.value.filter(isReadableContent))

interface RichCulturePayload {
  category: string
  summary: string
  detail: string
  imageUrl: string
  fileId: number | null
  eventDate: string
  personName: string
  roleName: string
}

interface PolicyFile {
  id?: number
  name: string
  url?: string
}

interface PolicyPayload {
  points: string[]
  attachments: PolicyFile[]
}

const fileImageUrls = ref<Record<number, string>>({})

const parseRichContent = (raw: any): RichCulturePayload => {
  const fallbackLines = splitLines(raw?.content || '')
  const fallback = {
    category: raw?.icon || '公司动态',
    summary: fallbackLines[0] || '',
    detail: fallbackLines.slice(1).join('\n') || raw?.content || '',
    imageUrl: '',
    fileId: null,
    eventDate: '',
    personName: '',
    roleName: ''
  }
  try {
    const parsed = JSON.parse(raw?.content || '{}')
    if (!parsed || typeof parsed !== 'object') return fallback
    return {
      category: parsed.category || raw?.icon || fallback.category,
      summary: parsed.summary || fallback.summary,
      detail: parsed.detail || fallback.detail,
      imageUrl: parsed.imageUrl || '',
      fileId: parsed.fileId ? Number(parsed.fileId) : null,
      eventDate: parsed.eventDate || '',
      personName: parsed.personName || '',
      roleName: parsed.roleName || ''
    }
  } catch {
    return fallback
  }
}

const parsePolicyContent = (raw: any): PolicyPayload => {
  try {
    const parsed = JSON.parse(raw?.content || '{}')
    if (parsed && typeof parsed === 'object' && (Array.isArray(parsed.points) || Array.isArray(parsed.attachments))) {
      return {
        points: Array.isArray(parsed.points) ? parsed.points.map((s: any) => String(s || '').trim()).filter(Boolean) : splitLines(parsed.content || ''),
        attachments: Array.isArray(parsed.attachments) ? parsed.attachments : []
      }
    }
  } catch {
    // 老数据是纯文本:继续按换行拆制度要点
  }
  return { points: splitLines(raw?.content || ''), attachments: [] }
}

const richCardOf = (raw: any, defaultCategory: string) => {
  const payload = parseRichContent(raw)
  const fileId = payload.fileId || null
  return {
    id: raw.id,
    title: raw.title || '未命名内容',
    category: payload.category || defaultCategory,
    summary: payload.summary,
    detail: payload.detail,
    imageUrl: fileId ? (fileImageUrls.value[fileId] || payload.imageUrl) : payload.imageUrl,
    fileId,
    eventDate: payload.eventDate,
    personName: payload.personName,
    roleName: payload.roleName,
    raw,
    payload
  }
}

const policyList = computed(() =>
  cleanPolicyRaw.value.map((item, idx) => {
    const payload = parsePolicyContent(item)
    return {
    id: item.id,
    title: item.title,
    icon: item.icon || '📋',
    color: POLICY_COLORS[idx % POLICY_COLORS.length],
    points: payload.points,
    attachments: payload.attachments,
    raw: item
    }
  })
)

const mvvList = computed(() =>
  cleanCultureRaw.value.slice(0, 3).map(item => {
    const lines = splitLines(item.content)
    return {
      id: item.id,
      title: item.title,
      body: lines.join('\n'),
      raw: item
    }
  })
)
const coreValues = computed(() =>
  cleanCultureRaw.value.slice(3).map(item => {
    const lines = splitLines(item.content)
    return {
      id: item.id,
      title: item.title,
      icon: item.icon || '✨',
      desc: lines.join('\n'),
      raw: item
    }
  })
)
const mvvClass = (idx: number) => ['mission', 'vision', 'values'][idx] || 'mission'

const cultureNewsList = computed(() =>
  cleanCultureNewsRaw.value.map(item => richCardOf(item, '公司动态'))
)
const filteredCultureNews = computed(() => {
  if (cultureNewsFilter.value === '全部') return cultureNewsList.value
  return cultureNewsList.value.filter(item => item.category === cultureNewsFilter.value)
})
const honorWallList = computed(() =>
  cleanHonorRaw.value.map(item => richCardOf(item, '荣誉公示'))
)

const hydrateFileImages = async (items: any[]) => {
  const ids = items
    .map(item => parseRichContent(item).fileId)
    .filter((id): id is number => Boolean(id && !fileImageUrls.value[id]))
  if (!ids.length) return
  const next = { ...fileImageUrls.value }
  await Promise.all(ids.map(async id => {
    try {
      const blob = await fileInfoApi.download(id)
      next[id] = URL.createObjectURL(blob as Blob)
    } catch {
      // 图片缺失时保留文字内容,不影响整页展示
    }
  }))
  fileImageUrls.value = next
}

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
const loadCultureNews = async () => {
  cultureNewsLoading.value = true
  try {
    const res = await contentApi.list('culture_news')
    cultureNewsRaw.value = (res as any)?.data || []
    await hydrateFileImages(cultureNewsRaw.value)
  } catch (e) {
    cultureNewsRaw.value = []
  } finally {
    cultureNewsLoading.value = false
  }
}
const loadHonor = async () => {
  honorLoading.value = true
  try {
    const res = await contentApi.list('honor')
    honorRaw.value = (res as any)?.data || []
    await hydrateFileImages(honorRaw.value)
  } catch (e) {
    honorRaw.value = []
  } finally {
    honorLoading.value = false
  }
}

// ===== 编辑/新增/删除（管理员） =====
const editVisible = ref(false)
const editSaving = ref(false)
const editFormRef = ref()
const editForm = reactive<{ id: number | null; type: string; title: string; content: string; icon: string; sortOrder: number; status: number }>({
  id: null, type: 'policy', title: '', content: '', icon: '', sortOrder: 0, status: 1
})
const editExtra = reactive<RichCulturePayload>({
  category: '公司动态',
  summary: '',
  detail: '',
  imageUrl: '',
  fileId: null,
  eventDate: '',
  personName: '',
  roleName: ''
})
const editUploadFiles = ref<any[]>([])
const editImageFile = ref<File | null>(null)
const editPolicyFiles = ref<PolicyFile[]>([])
const policyFileInput = ref<HTMLInputElement>()
const policyFileUploading = ref(false)
const editRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}
const isRichCultureType = computed(() => ['culture_news', 'honor'].includes(editForm.type))
const isHonorType = computed(() => editForm.type === 'honor')
const activeCategoryOptions = computed(() =>
  (isHonorType.value ? honorCategories : cultureNewsCategories).map(item => ({ label: item, value: item }))
)
const editTitlePlaceholder = computed(() => {
  if (editForm.type === 'culture_news') return '如：端午节福利发放 / 六月团建活动'
  if (editForm.type === 'honor') return '如：6月月度销冠 / 优秀会计 / 服务之星'
  return '如：考勤与休假 / 使命 Mission'
})
const editContentPlaceholder = computed(() =>
  isRichCultureType.value ? '填写正文说明、活动内容、表彰原因或后续安排' : '每行一条要点；换行分段'
)
const editTitle = computed(() => {
  const labelMap: Record<string, string> = {
    policy: '行政制度',
    culture: '企业文化',
    culture_news: '文化动态',
    honor: '荣誉墙',
    feedback: '意见记录'
  }
  const label = labelMap[editForm.type] || '人文内容'
  return (editForm.id ? '编辑' : '新增') + label
})

const resetEditExtra = (type: string) => {
  Object.assign(editExtra, {
    category: type === 'honor' ? '月度销冠' : '公司动态',
    summary: '',
    detail: '',
    imageUrl: '',
    fileId: null,
    eventDate: '',
    personName: '',
    roleName: ''
  })
  editUploadFiles.value = []
  editImageFile.value = null
}

const openEdit = (type: string, row?: any) => {
  const raw = row?.raw || row
  resetEditExtra(type)
  editForm.id = raw?.id ?? null
  editForm.type = type
  editForm.title = raw?.title || ''
  editForm.content = raw?.content || ''
  editForm.icon = raw?.icon || ''
  editForm.sortOrder = Number(raw?.sortOrder ?? 0)
  editForm.status = Number(raw?.status ?? 1)
  editPolicyFiles.value = []
  if (type === 'policy') {
    const payload = parsePolicyContent(raw || { content: '' })
    editForm.content = payload.points.join('\n')
    editPolicyFiles.value = [...payload.attachments]
  }
  if (['culture_news', 'honor'].includes(type)) {
    const payload = parseRichContent(raw || { icon: type === 'honor' ? '月度销冠' : '公司动态', content: '' })
    Object.assign(editExtra, payload)
    editForm.icon = payload.category
    editForm.content = payload.detail
    const imageUrl = payload.fileId ? (fileImageUrls.value[payload.fileId] || payload.imageUrl) : payload.imageUrl
    if (imageUrl) {
      editUploadFiles.value = [{ name: raw?.title || '封面照片', url: imageUrl }]
    }
  }
  editVisible.value = true
}

const policyFileKey = (file: PolicyFile) => `${file.id || file.url || file.name}`

const handlePolicyFilePick = async (e: Event) => {
  const input = e.target as HTMLInputElement
  const files = input.files ? Array.from(input.files) : []
  if (!files.length) return
  policyFileUploading.value = true
  try {
    for (const file of files) {
      const res: any = await fileInfoApi.upload(file)
      const payload = res?.data || res || {}
      editPolicyFiles.value.push({
        id: Number(payload.id || 0) || undefined,
        name: payload.originalName || payload.fileName || file.name,
        url: payload.url
      })
    }
    ElMessage.success('附件已上传')
  } catch (e: any) {
    ElMessage.error(e?.message || '附件上传失败')
  } finally {
    policyFileUploading.value = false
    input.value = ''
  }
}

const downloadPolicyFile = async (file: PolicyFile) => {
  if (file.id) {
    const blob = await fileInfoApi.download(file.id)
    const url = URL.createObjectURL(blob as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name || '制度附件'
    a.click()
    URL.revokeObjectURL(url)
  } else if (file.url) {
    window.open(file.url, '_blank')
  }
}

const policyExpanded = ref<Set<number | string>>(new Set())
const isPolicyCollapsed = (item: any) => item.points.length > 5 && !policyExpanded.value.has(item.id)
const togglePolicy = (id: number | string) => {
  const next = new Set(policyExpanded.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  policyExpanded.value = next
}

const handleEditImageChange = (file: any, fileList: any[]) => {
  editUploadFiles.value = fileList.slice(-1)
  editImageFile.value = file.raw || null
  if (file.raw) {
    editExtra.imageUrl = URL.createObjectURL(file.raw)
  } else if (file.url) {
    editExtra.imageUrl = file.url
  }
}

const handleEditImageRemove = () => {
  editUploadFiles.value = []
  editImageFile.value = null
  editExtra.imageUrl = ''
  editExtra.fileId = null
}

const handleEditImageExceed = () => {
  ElMessage.warning('每条内容最多上传 1 张封面照片')
}

const buildEditPayload = async () => {
  if (editForm.type === 'policy') {
    const payload = {
      points: splitLines(editForm.content),
      attachments: editPolicyFiles.value
    }
    return { ...editForm, content: JSON.stringify(payload) }
  }
  if (!isRichCultureType.value) return { ...editForm }
  let fileId = editExtra.fileId
  let imageUrl = editExtra.imageUrl
  if (editImageFile.value) {
    const uploadRes: any = await fileInfoApi.upload(editImageFile.value)
    fileId = Number(uploadRes?.data?.id || 0) || null
    imageUrl = fileId ? `/api/file/info/download/${fileId}` : imageUrl
  }
  const payload: RichCulturePayload = {
    category: editExtra.category || (isHonorType.value ? '月度销冠' : '公司动态'),
    summary: editExtra.summary,
    detail: editForm.content,
    imageUrl,
    fileId,
    eventDate: editExtra.eventDate,
    personName: editExtra.personName,
    roleName: editExtra.roleName
  }
  return {
    ...editForm,
    icon: payload.category,
    content: JSON.stringify(payload)
  }
}

const reloadContentByType = async (type: string) => {
  if (type === 'policy') return loadPolicy()
  if (type === 'culture') return loadCulture()
  if (type === 'culture_news') return loadCultureNews()
  if (type === 'honor') return loadHonor()
  if (type === 'feedback') return loadFeedback()
}

const submitEdit = async () => {
  await editFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return
    editSaving.value = true
    try {
      const payload = await buildEditPayload()
      await contentApi.save(payload)
      ElMessage.success(editForm.id ? '已更新' : '已新增')
      editVisible.value = false
      await reloadContentByType(editForm.type)
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
    await reloadContentByType(type)
  } catch (e) {
    // 全局拦截器已提示错误
  }
}

onMounted(() => {
  loadStructure()
  loadEmployees()
  loadPolicy()
  loadCulture()
  loadCultureNews()
  loadHonor()
  loadFeedback()
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
  background: linear-gradient(120deg, #3370ff 0%, #5a8bff 55%, #9cc0ff 100%);
  color: #fff;
  box-shadow: 0 12px 30px rgba(51, 112, 255, 0.25);
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

/* 行政制度 */
.culture-policy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 14px;
}
.culture-policy-card {
  border-radius: 8px;
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
.culture-policy-points.collapsed {
  max-height: 145px;
  overflow: hidden;
  position: relative;
}
.culture-policy-points.collapsed::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 36px;
  background: linear-gradient(180deg, rgba(255,255,255,0), #fff);
}
.culture-policy-points li {
  margin-bottom: 7px;
  color: #475467;
  font-size: 13px;
  line-height: 1.6;
}
.culture-policy-toggle {
  margin-top: 6px;
}
.culture-policy-files {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #e5e7eb;
}
.culture-policy-files button {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #dbe4ff;
  border-radius: 6px;
  background: #f8fbff;
  color: #3370ff;
  padding: 5px 8px;
  font-size: 12px;
  cursor: pointer;
  max-width: 100%;
}
.culture-policy-files span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.culture-policy-upload {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}
.culture-policy-upload-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
}

/* 企业文化 MVV */
.culture-mvv-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}
.culture-mvv-card {
  position: relative;
  padding: 22px;
  border-radius: 12px;
  color: #fff;
}
.culture-mvv-card.mission { background: linear-gradient(135deg, #3370ff, #5a8bff); }
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
.culture-mvv-body {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.94;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
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
  border-radius: 8px;
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
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* 文化动态 / 荣誉墙 */
.culture-feed-section {
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid #eef2f7;
}
.culture-sub-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}
.culture-sub-head h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 6px;
  color: #1f2937;
  font-size: 17px;
  font-weight: 700;
}
.culture-sub-head p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}
.culture-sub-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
.culture-news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
  min-height: 96px;
}
.culture-news-card {
  overflow: hidden;
  border: 1px solid #e8edf7;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s;
}
.culture-news-card:hover,
.honor-wall-card:hover {
  box-shadow: 0 10px 24px rgba(31, 45, 61, 0.08);
  transform: translateY(-2px);
}
.culture-news-cover {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #edf4ff, #f7faff);
  color: #3370ff;
  font-size: 34px;
}
.culture-news-cover img,
.honor-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.culture-news-cover.empty {
  border-bottom: 1px solid #eef2f7;
}
.culture-news-tag {
  position: absolute;
  left: 12px;
  top: 12px;
}
.culture-news-body {
  padding: 14px;
}
.culture-news-body span,
.honor-info small {
  color: #98a2b3;
  font-size: 12px;
}
.culture-news-body strong,
.honor-info strong {
  display: block;
  margin: 6px 0;
  color: #1f2937;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
}
.culture-news-body p,
.honor-info p {
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}
.honor-wall-section {
  margin-bottom: 4px;
}
.honor-wall-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 14px;
  min-height: 96px;
}
.honor-wall-card {
  overflow: hidden;
  border: 1px solid #e8edf7;
  border-radius: 12px;
  background: #fff;
  transition: all 0.2s;
}
.honor-photo {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4 / 3;
  background: linear-gradient(135deg, #fff7e8, #fff);
}
.honor-photo.empty span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #fff;
  font-size: 28px;
  font-weight: 800;
}
.honor-info {
  padding: 14px;
  text-align: center;
}
.honor-info p + p {
  margin-top: 4px;
}
.culture-inline-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  width: 100%;
}
.culture-upload-field {
  display: grid;
  gap: 8px;
  width: 100%;
}

/* 员工关怀 */
.care-stat-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 14px;
}
.care-stat-card {
  padding: 16px 18px;
  border: 1px solid #e8edf7;
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff, #f8fbff);
  text-align: center;
}
.care-stat-card span {
  display: block;
  margin-bottom: 6px;
  color: #667085;
  font-size: 13px;
}
.care-stat-card strong {
  color: #1f2937;
  font-size: 28px;
  line-height: 1;
}
.care-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}
.care-toolbar .el-input {
  max-width: 360px;
}
.care-table {
  border: 1px solid #eef0f5;
  border-radius: 8px;
  overflow: hidden;
}
.care-person {
  display: flex;
  align-items: center;
  gap: 10px;
}
.care-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #3370ff;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
}
.care-person b {
  display: block;
  color: #1f2937;
  font-size: 14px;
}
.care-person small {
  color: #98a2b3;
  font-size: 12px;
}

/* 培训成长 */
.growth-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.growth-card {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border: 1px solid #e8edf7;
  border-radius: 12px;
  background: #fff;
}
.growth-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  font-size: 22px;
}
.growth-icon.blue { background: #edf4ff; color: #3370ff; }
.growth-icon.green { background: #eaf8ef; color: #21a35b; }
.growth-icon.orange { background: #fff5e6; color: #d9822b; }
.growth-card h3,
.growth-panel h3,
.subsidy-panel h3,
.feedback-form-card h3,
.feedback-list-card h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 700;
}
.growth-card p {
  margin: 5px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}
.growth-card b {
  color: #1f2937;
  font-size: 26px;
}
.growth-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}
.growth-panel,
.subsidy-panel,
.feedback-form-card,
.feedback-list-card {
  padding: 18px;
  border: 1px solid #e8edf7;
  border-radius: 12px;
  background: #fff;
}
.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}
.growth-list {
  min-height: 130px;
}
.growth-row {
  display: grid;
  gap: 4px;
  padding: 12px 0;
  border-bottom: 1px solid #f1f3f8;
}
.growth-row:last-child {
  border-bottom: none;
}
.growth-row strong {
  color: #1f2937;
  font-size: 14px;
}
.growth-row span,
.growth-row small {
  color: #667085;
  font-size: 12px;
}
.growth-row.clickable {
  cursor: pointer;
}
.growth-row.clickable:hover strong {
  color: #3370ff;
}
.subsidy-steps {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}
.subsidy-steps span {
  padding: 12px;
  border-radius: 8px;
  background: #f7f9fd;
  color: #475467;
  font-size: 13px;
  text-align: center;
}

/* 员工意见箱 */
.feedback-layout {
  display: grid;
  grid-template-columns: minmax(360px, 0.9fr) minmax(0, 1.2fr);
  gap: 14px;
}
.feedback-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
.feedback-cc-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 18px;
  min-height: 32px;
  align-items: center;
}
.feedback-field-tip {
  margin-top: 6px;
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.5;
}
.feedback-list {
  min-height: 220px;
}
.feedback-item {
  padding: 14px 0;
  border-bottom: 1px solid #f1f3f8;
}
.feedback-item:last-child {
  border-bottom: none;
}
.feedback-item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
}
.feedback-item-head > div {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.feedback-item-head strong {
  color: #1f2937;
  font-size: 14px;
}
.feedback-item p {
  margin: 0 0 8px;
  color: #475467;
  font-size: 13px;
  line-height: 1.7;
}
.feedback-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #98a2b3;
  font-size: 12px;
}
.feedback-reply {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f1f7ff;
  color: #475467;
  font-size: 13px;
  line-height: 1.7;
}
.feedback-reply b {
  color: #3370ff;
}
.feedback-manage {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
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
  color: #3370ff;
  font-size: 13px;
}
.culture-people-dept {
  color: #98a2b3;
  font-size: 12px;
}

@media (max-width: 960px) {
  .culture-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .culture-mvv-grid {
    grid-template-columns: 1fr;
  }
  .care-stat-grid,
  .growth-grid,
  .growth-columns,
  .subsidy-steps,
  .feedback-layout,
  .culture-news-grid,
  .honor-wall-grid,
  .culture-inline-fields {
    grid-template-columns: 1fr;
  }
  .culture-sub-head,
  .culture-sub-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .care-toolbar {
    flex-direction: column;
  }
  .care-toolbar .el-input {
    max-width: none;
  }
}
</style>

<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="queryParams" inline>
        <el-form-item :label="$t('org.empName')">
          <el-input v-model="queryParams.name" :placeholder="$t('org.inputEmpName')" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item :label="$t('org.deptName')">
          <el-tree-select
            v-model="queryParams.deptId"
            :data="deptTree"
            :props="{ label: 'deptName', value: 'id', children: 'children' }"
            :placeholder="$t('org.selectDept')"
            check-strictly
            clearable
            style="width: 180px"
          />
        </el-form-item>
        <el-form-item :label="$t('org.postName')">
          <el-select v-model="queryParams.postId" :placeholder="$t('org.selectPost')" clearable style="width: 150px">
            <el-option v-for="p in postList" :key="p.id" :label="p.postName" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('org.status')">
          <el-select v-model="queryParams.status" :placeholder="$t('org.selectStatus')" clearable style="width: 120px">
            <el-option :label="$t('org.empStatusActive')" :value="1" />
            <el-option :label="$t('org.empStatusTrial')" :value="2" />
            <el-option :label="$t('org.empStatusLeft')" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
          <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
        </el-form-item>
      </el-form>
      <div class="search-actions">
        <el-button @click="downloadEmployeeTemplate">下载人员模板</el-button>
        <el-button type="warning" plain @click="openImportDialog">批量导入人员</el-button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>{{ $t('common.add') }}
        </el-button>
      </div>
    </div>

    <section class="employee-role-board">
      <div class="employee-role-head">
        <div>
          <h2>公司人员导入与角色定位</h2>
          <p>先把内部人员导入，再按岗位自动识别电销、网销、私域、财税、交付、渠道、财务和管理角色，确保业务能从获客一路跑到交付回款。</p>
        </div>
        <el-tag :type="roleCoverageSummary.level" effect="plain">{{ roleCoverageSummary.statusText }}</el-tag>
      </div>
      <div class="employee-role-metrics">
        <div><span>当前人员</span><b>{{ employeeRoleStats.total }}</b></div>
        <div><span>已定位</span><b>{{ employeeRoleStats.mapped }}</b></div>
        <div><span>关键缺口</span><b>{{ employeeRoleStats.missingRequired }}</b></div>
        <div><span>可跑链路</span><b>{{ employeeRoleStats.readyFlow }}</b></div>
      </div>
      <div class="employee-flow-grid">
        <div v-for="item in businessFlowItems" :key="item.key" class="employee-flow-card" :class="item.level">
          <div>
            <strong>{{ item.title }}</strong>
            <el-tag :type="roleCoverageTag(item.level)" size="small" effect="plain">{{ item.statusText }}</el-tag>
          </div>
          <p>{{ item.desc }}</p>
          <span>{{ item.ownerText }}</span>
        </div>
      </div>
      <div class="employee-role-grid">
        <div v-for="item in roleCoverageCards" :key="item.key" class="employee-role-card" :class="item.level">
          <div>
            <strong>{{ item.label }}</strong>
            <el-tag :type="roleCoverageTag(item.level)" size="small" effect="plain">{{ item.statusText }}</el-tag>
          </div>
          <p>{{ item.desc }}</p>
          <span>{{ item.membersText }}</span>
        </div>
      </div>
    </section>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" stripe border @row-click="handleRowClick">
      <el-table-column prop="empCode" :label="$t('org.empCode')" width="120" />
      <el-table-column prop="name" :label="$t('org.empName')" width="100" />
      <el-table-column prop="deptName" :label="$t('org.deptName')" width="140" />
      <el-table-column prop="postName" :label="$t('org.postName')" width="140" />
      <el-table-column label="业务角色" width="130">
        <template #default="{ row }">
          <el-tag :type="roleCoverageTag(employeeBusinessRole(row).level)" size="small" effect="plain">
            {{ employeeBusinessRole(row).label }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="业务定位" min-width="190">
        <template #default="{ row }">
          <span class="role-position-text">{{ employeeBusinessRole(row).flow }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="$t('org.phone')" width="130" />
      <el-table-column prop="hireDate" :label="$t('org.hireDate')" width="120" />
      <el-table-column prop="status" :label="$t('org.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="empStatusType(row.status)" size="small">{{ empStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('org.actions')" width="160" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="handleEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button type="danger" link size="small" @click.stop="handleDelete(row)">{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane :label="$t('org.tabBasic')" name="basic">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.empName')" prop="name">
                  <el-input v-model="formData.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.gender')">
                  <el-radio-group v-model="formData.gender">
                    <el-radio :value="0">{{ $t('org.male') }}</el-radio>
                    <el-radio :value="1">{{ $t('org.female') }}</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.birthDate')">
                  <el-date-picker v-model="formData.birthDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.idCard')">
                  <el-input v-model="formData.idCard" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.phone')">
                  <el-input v-model="formData.phone" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.email')">
                  <el-input v-model="formData.email" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item :label="$t('org.address')">
                  <el-input v-model="formData.address" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane :label="$t('org.tabPosition')" name="position">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.empCode')" prop="empCode">
                  <el-input v-model="formData.empCode" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.deptName')" prop="deptId">
                  <el-tree-select
                    v-model="formData.deptId"
                    :data="deptTree"
                    :props="{ label: 'deptName', value: 'id', children: 'children' }"
                    check-strictly
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.postName')" prop="postId">
                  <el-select v-model="formData.postId" style="width: 100%">
                    <el-option v-for="p in postList" :key="p.id" :label="p.postName" :value="p.id" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.hireDate')">
                  <el-date-picker v-model="formData.hireDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.regularDate')">
                  <el-date-picker v-model="formData.regularDate" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.status')">
                  <el-select v-model="formData.status" style="width: 100%">
                    <el-option :label="$t('org.empStatusActive')" :value="1" />
                    <el-option :label="$t('org.empStatusTrial')" :value="2" />
                    <el-option :label="$t('org.empStatusLeft')" :value="3" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane :label="$t('org.tabContract')" name="contract">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.contractStart')">
                  <el-date-picker v-model="formData.contractStart" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.contractEnd')">
                  <el-date-picker v-model="formData.contractEnd" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane :label="$t('org.tabEducation')" name="education">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.education')">
                  <el-select v-model="formData.education" style="width: 100%">
                    <el-option label="博士" value="博士" />
                    <el-option label="硕士" value="硕士" />
                    <el-option label="本科" value="本科" />
                    <el-option label="大专" value="大专" />
                    <el-option label="高中" value="高中" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.university')">
                  <el-input v-model="formData.university" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.major')">
                  <el-input v-model="formData.major" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>

          <el-tab-pane :label="$t('org.tabEmergency')" name="emergency">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.emergencyContact')">
                  <el-input v-model="formData.emergencyContact" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.emergencyPhone')">
                  <el-input v-model="formData.emergencyPhone" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-tab-pane>
        </el-tabs>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialog.visible" title="批量导入公司人员" width="980px" class="employee-import-dialog" destroy-on-close>
      <div class="employee-import-layout">
        <div class="employee-import-main">
          <div class="employee-import-tip">
            <strong>粘贴 Excel 人员表</strong>
            <p>支持字段：工号、姓名、部门、岗位、手机号、邮箱、入职日期、状态、备注。系统会自动匹配现有部门/岗位，并识别业务角色。</p>
          </div>
          <el-input
            v-model="importText"
            type="textarea"
            :rows="9"
            placeholder="从 Excel 复制表头和人员数据后粘贴到这里"
          />
          <div class="employee-import-actions">
            <el-button @click="fillEmployeeImportSample">填充示例</el-button>
            <el-button type="primary" @click="parseEmployeeImport">解析预览</el-button>
            <el-button @click="clearEmployeeImport">清空</el-button>
            <el-button
              type="success"
              :loading="importingEmployees"
              :disabled="employeeImportStats.ready === 0"
              @click="submitEmployeeImport"
            >
              导入 {{ employeeImportStats.ready }} 人
            </el-button>
          </div>
        </div>
        <div class="employee-import-side">
          <div><span>预览行</span><b>{{ employeeImportStats.total }}</b></div>
          <div><span>可导入</span><b>{{ employeeImportStats.ready }}</b></div>
          <div><span>待修正</span><b>{{ employeeImportStats.error }}</b></div>
          <div><span>角色覆盖</span><b>{{ employeeImportStats.roles }}</b></div>
        </div>
      </div>
      <el-table :data="importPreviewRows" border stripe height="320" empty-text="请先粘贴人员表并解析">
        <el-table-column prop="rowNo" label="行号" width="70" />
        <el-table-column prop="employee.empCode" label="工号" width="110" />
        <el-table-column prop="employee.name" label="姓名" width="100" />
        <el-table-column label="部门/岗位" min-width="190">
          <template #default="{ row }">
            <div class="import-match-cell">
              <strong>{{ row.employee.deptName || row.raw.deptName || '未填部门' }}</strong>
              <span>{{ row.employee.postName || row.raw.postName || '未填岗位' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="业务角色" width="130">
          <template #default="{ row }">
            <el-tag :type="roleCoverageTag(row.role.level)" size="small" effect="plain">{{ row.role.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ready' ? 'success' : 'danger'" size="small">{{ row.statusText }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="问题/定位" min-width="260">
          <template #default="{ row }">
            <span>{{ row.issues.length ? row.issues.join('；') : row.role.flow }}</span>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="importDialog.visible = false">关闭</el-button>
        <el-button @click="downloadEmployeeTemplate">下载模板</el-button>
        <el-button type="primary" :loading="importingEmployees" :disabled="employeeImportStats.ready === 0" @click="submitEmployeeImport">
          确认导入可用人员
        </el-button>
      </template>
    </el-dialog>

    <BusinessDetailDrawer
      v-if="detailData"
      v-model="drawerVisible"
      :title="detailData.name || $t('org.empDetail')"
      :subtitle="`${detailData.deptName || '—'} · ${detailData.postName || '—'}`"
      :eyebrow="$t('org.empDetail')"
      :avatar="employeeAvatar(detailData)"
      :avatar-class="employeeAvatarClass(detailData.status)"
      :status-text="empStatusText(detailData.status)"
      :status-type="empStatusType(detailData.status)"
      size="560px"
    >
      <template #meta>
        <div class="bd-kv-grid">
          <div class="bd-kv"><span>{{ $t('org.empCode') }}</span><b>{{ detailData.empCode || '—' }}</b></div>
          <div class="bd-kv"><span>{{ $t('org.status') }}</span><b>{{ empStatusText(detailData.status) }}</b></div>
          <div class="bd-kv"><span>{{ $t('org.hireDate') }}</span><b>{{ detailData.hireDate || '—' }}</b></div>
          <div class="bd-kv"><span>{{ $t('org.regularDate') }}</span><b>{{ detailData.regularDate || '—' }}</b></div>
          <div class="bd-kv wide"><span>{{ $t('org.phone') }}</span><b>{{ detailData.phone || '—' }}</b></div>
        </div>
      </template>

      <div class="bd-section-title">个人信息</div>
      <div class="employee-info-grid">
        <div><span>{{ $t('org.gender') }}</span><b>{{ genderText(detailData.gender) }}</b></div>
        <div><span>{{ $t('org.birthDate') }}</span><b>{{ detailData.birthDate || '—' }}</b></div>
        <div><span>{{ $t('org.email') }}</span><b>{{ detailData.email || '—' }}</b></div>
        <div><span>{{ $t('org.idCard') }}</span><b>{{ detailData.idCard || '—' }}</b></div>
        <div class="wide"><span>{{ $t('org.address') }}</span><b>{{ detailData.address || '—' }}</b></div>
      </div>

      <div class="bd-section-title">任职与合同</div>
      <div class="employee-info-grid">
        <div><span>{{ $t('org.deptName') }}</span><b>{{ detailData.deptName || '—' }}</b></div>
        <div><span>{{ $t('org.postName') }}</span><b>{{ detailData.postName || '—' }}</b></div>
        <div><span>业务角色</span><b>{{ employeeBusinessRole(detailData).label }}</b></div>
        <div><span>承接链路</span><b>{{ employeeBusinessRole(detailData).flow }}</b></div>
        <div><span>{{ $t('org.contractStart') }}</span><b>{{ detailData.contractStart || '—' }}</b></div>
        <div><span>{{ $t('org.contractEnd') }}</span><b>{{ detailData.contractEnd || '—' }}</b></div>
        <div><span>{{ $t('org.education') }}</span><b>{{ detailData.education || '—' }}</b></div>
        <div><span>{{ $t('org.major') }}</span><b>{{ detailData.major || '—' }}</b></div>
        <div class="wide"><span>{{ $t('org.university') }}</span><b>{{ detailData.university || '—' }}</b></div>
      </div>

      <div class="bd-section-title">紧急联系人</div>
      <div class="employee-info-grid compact">
        <div><span>{{ $t('org.emergencyContact') }}</span><b>{{ detailData.emergencyContact || '—' }}</b></div>
        <div><span>{{ $t('org.emergencyPhone') }}</span><b>{{ detailData.emergencyPhone || '—' }}</b></div>
      </div>

      <template #timeline>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot success" />
          <div>
            <strong>{{ $t('org.hireDate') }}</strong>
            <p>{{ detailData.hireDate || '—' }} · {{ detailData.deptName || '—' }} / {{ detailData.postName || '—' }}</p>
          </div>
        </div>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot" />
          <div>
            <strong>{{ $t('org.regularDate') }}</strong>
            <p>{{ detailData.regularDate || '—' }} · 当前状态 {{ empStatusText(detailData.status) }}</p>
          </div>
        </div>
        <div class="bd-timeline-item">
          <i class="bd-timeline-dot" />
          <div>
            <strong>{{ $t('org.tabContract') }}</strong>
            <p>{{ detailData.contractStart || '—' }} 至 {{ detailData.contractEnd || '—' }}</p>
          </div>
        </div>
      </template>

      <template #footer>
        <el-button @click="drawerVisible = false">{{ $t('common.close') }}</el-button>
        <el-button type="primary" @click="handleEdit(detailData); drawerVisible = false">{{ $t('common.edit') }}</el-button>
      </template>
    </BusinessDetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { employeeApi, deptApi, postApi } from '@/api/org'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'

const { t } = useI18n()
const formRef = ref<FormInstance>()
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const activeTab = ref('basic')
const drawerVisible = ref(false)
const detailData = ref<any>(null)
const deptTree = ref<any[]>([])
const postList = ref<any[]>([])
const importDialog = reactive({ visible: false })
const importText = ref('')
const importPreviewRows = ref<EmployeeImportPreviewRow[]>([])
const importingEmployees = ref(false)

const defaultDeptTree = [
  { id: 1, deptName: '管理层', children: [] },
  { id: 2, deptName: '财务部', children: [] },
  { id: 3, deptName: '销售部', children: [] },
  { id: 4, deptName: '客服部', children: [] },
  { id: 5, deptName: '技术部', children: [] },
  { id: 6, deptName: '人事部', children: [] }
]

const defaultPostList = [
  { id: 1, postName: '总经理' },
  { id: 2, postName: '财务总监' },
  { id: 3, postName: '技术总监' },
  { id: 4, postName: '销售总监' },
  { id: 5, postName: '会计' },
  { id: 6, postName: '销售代表' },
  { id: 7, postName: '开发工程师' },
  { id: 8, postName: '人事专员' }
]

interface BusinessRole {
  key: string
  label: string
  level: 'success' | 'warning' | 'danger' | 'primary' | 'info'
  flow: string
  desc: string
  required: boolean
  keywords: string[]
  fallbackDept: string
  fallbackPost: string
}

interface EmployeeImportPreviewRow {
  rowNo: number
  raw: Record<string, string>
  employee: Record<string, any>
  role: BusinessRole
  status: 'ready' | 'error'
  statusText: string
  issues: string[]
}

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  deptId: undefined as number | undefined,
  postId: undefined as number | undefined,
  status: undefined as number | undefined
})

const defaultForm = () => ({
  id: undefined as number | undefined,
  empCode: '',
  name: '',
  gender: 0,
  birthDate: '',
  idCard: '',
  phone: '',
  email: '',
  address: '',
  deptId: undefined as number | undefined,
  postId: undefined as number | undefined,
  hireDate: '',
  regularDate: '',
  contractStart: '',
  contractEnd: '',
  education: '',
  university: '',
  major: '',
  emergencyContact: '',
  emergencyPhone: '',
  status: 2
})

const formData = ref(defaultForm())

const businessRoles: BusinessRole[] = [
  {
    key: 'boss',
    label: '管理负责人',
    level: 'primary',
    flow: '老板审批 / 经营复盘 / 关键规则拍板',
    desc: '负责审批高金额订单、组织规则和跨部门卡点。',
    required: true,
    keywords: ['总经理', '老板', '负责人', '主管', '管理层', '合伙人', 'CEO'],
    fallbackDept: '管理层',
    fallbackPost: '总经理'
  },
  {
    key: 'sales',
    label: '销售顾问',
    level: 'success',
    flow: '线索承接 / 客户跟进 / 报价成交',
    desc: '负责客户首触、需求确认、报价和成交跟进。',
    required: true,
    keywords: ['销售', '顾问', '商务', '客户经理', '电销', '网销', '私域', '渠道销售', '销售代表'],
    fallbackDept: '销售部',
    fallbackPost: '销售代表'
  },
  {
    key: 'tele_sale',
    label: '电销拓客',
    level: 'success',
    flow: '电话外呼 / 首触记录 / 线索分配',
    desc: '负责电话触达、意向分级和首轮转化。',
    required: false,
    keywords: ['电销', '外呼', '电话销售', '呼叫', '坐席'],
    fallbackDept: '销售部',
    fallbackPost: '销售代表'
  },
  {
    key: 'online_sale',
    label: '网销运营',
    level: 'success',
    flow: '广告线索 / ROI / 在线客服承接',
    desc: '负责网销线索、投产比和广告渠道承接。',
    required: true,
    keywords: ['网销', '线上', '运营', '投放', '广告', '客服', '私域'],
    fallbackDept: '销售部',
    fallbackPost: '销售代表'
  },
  {
    key: 'finance_service',
    label: '财税会计',
    level: 'warning',
    flow: '代账服务 / 税务申报 / 财税异常处理',
    desc: '负责代账、报税、税务异常和财税咨询交付。',
    required: true,
    keywords: ['财税', '会计', '代账', '税务', '记账', '财务顾问'],
    fallbackDept: '财务部',
    fallbackPost: '会计'
  },
  {
    key: 'delivery',
    label: '工商交付',
    level: 'warning',
    flow: '工商办理 / 资料收集 / 交付节点推进',
    desc: '负责注册、变更、注销、异常解除等交付任务。',
    required: true,
    keywords: ['工商', '交付', '办理', '资料', '实施', '客服', '客户成功'],
    fallbackDept: '客服部',
    fallbackPost: '销售代表'
  },
  {
    key: 'channel',
    label: '渠道地址',
    level: 'warning',
    flow: '挂靠地址 / 同行渠道 / 供应商结算',
    desc: '负责地址资源、同行客户、渠道价格和应收结算。',
    required: true,
    keywords: ['渠道', '地址', '挂靠', '同行', '供应商', '资源'],
    fallbackDept: '销售部',
    fallbackPost: '销售代表'
  },
  {
    key: 'finance_audit',
    label: '财务审核',
    level: 'primary',
    flow: '收款核对 / 提单财审 / 应收应付',
    desc: '负责回款、合同、发票、应收和提单财务审核。',
    required: true,
    keywords: ['财务', '出纳', '收款', '应收', '应付', '财务总监', 'CFO'],
    fallbackDept: '财务部',
    fallbackPost: '财务总监'
  },
  {
    key: 'hr_admin',
    label: '人事行政',
    level: 'info',
    flow: '人员档案 / 权限开通 / 入离职',
    desc: '负责人员档案、组织归属、权限开通和入离职。',
    required: false,
    keywords: ['人事', 'HR', '行政', '招聘', '组织'],
    fallbackDept: '人事部',
    fallbackPost: '人事专员'
  }
]

const businessFlowDefs = [
  { key: 'lead', title: '获客入库', roles: ['tele_sale', 'online_sale', 'sales'], desc: '电销、网销或私域人员负责线索导入、首触和分配。' },
  { key: 'deal', title: '报价成交', roles: ['sales', 'finance_service'], desc: '销售确认需求报价,财税角色校验服务口径。' },
  { key: 'approve', title: '提单审批', roles: ['finance_audit', 'boss'], desc: '财务审核回款合同,管理负责人处理高金额或异常审批。' },
  { key: 'deliver', title: '服务交付', roles: ['delivery', 'finance_service', 'channel'], desc: '工商/财税/地址渠道角色按任务推进交付。' },
  { key: 'review', title: '回访复盘', roles: ['sales', 'delivery', 'boss'], desc: '交付完成后做满意度、续费、转介绍和经营复盘。' }
]

const rules = {
  name: [{ required: true, message: t('org.inputEmpName'), trigger: 'blur' }],
  empCode: [{ required: true, message: t('org.inputEmpCode'), trigger: 'blur' }],
  deptId: [{ required: true, message: t('org.selectDept'), trigger: 'change' }],
  postId: [{ required: true, message: t('org.selectPost'), trigger: 'change' }]
}

const activeEmployees = computed(() => tableData.value.filter(item => item.status !== 3))

const roleCoverageCards = computed(() => businessRoles.map(role => {
  const members = activeEmployees.value.filter(item => employeeBusinessRole(item).key === role.key)
  const level = members.length ? role.level : role.required ? 'danger' : 'warning'
  return {
    ...role,
    level,
    statusText: members.length ? `${members.length} 人` : role.required ? '缺关键人' : '可后补',
    membersText: members.length ? members.slice(0, 4).map(item => item.name).join('、') : `建议先导入: ${role.fallbackDept} / ${role.fallbackPost}`
  }
}))

const employeeRoleStats = computed(() => {
  const mapped = activeEmployees.value.filter(item => employeeBusinessRole(item).key !== 'staff').length
  const missingRequired = roleCoverageCards.value.filter(item => item.required && item.statusText === '缺关键人').length
  const readyFlow = businessFlowItems.value.filter(item => item.level !== 'danger').length
  return {
    total: activeEmployees.value.length,
    mapped,
    missingRequired,
    readyFlow: `${readyFlow}/${businessFlowDefs.length}`
  }
})

const roleCoverageSummary = computed(() => {
  if (!activeEmployees.value.length) return { level: 'danger' as const, statusText: '先导入人员' }
  if (employeeRoleStats.value.missingRequired > 0) return { level: 'warning' as const, statusText: `${employeeRoleStats.value.missingRequired} 个角色缺口` }
  return { level: 'success' as const, statusText: '核心角色已覆盖' }
})

const businessFlowItems = computed(() => businessFlowDefs.map(flow => {
  const owners = activeEmployees.value.filter(item => flow.roles.includes(employeeBusinessRole(item).key))
  const requiredRoles = flow.roles.filter(roleKey => businessRoles.find(item => item.key === roleKey)?.required)
  const coveredRequired = new Set(owners.map(item => employeeBusinessRole(item).key))
  const missing = requiredRoles.filter(roleKey => !coveredRequired.has(roleKey))
  const level = owners.length && !missing.length ? 'success' : owners.length ? 'warning' : 'danger'
  return {
    ...flow,
    level,
    statusText: level === 'success' ? '可跑通' : level === 'warning' ? '待补强' : '缺负责人',
    ownerText: owners.length ? `负责人: ${owners.slice(0, 4).map(item => item.name).join('、')}` : '暂无负责人'
  }
}))

const employeeImportStats = computed(() => {
  const total = importPreviewRows.value.length
  const ready = importPreviewRows.value.filter(item => item.status === 'ready').length
  const error = total - ready
  const roles = new Set(importPreviewRows.value.filter(item => item.status === 'ready').map(item => item.role.key)).size
  return { total, ready, error, roles }
})

const staffRole: BusinessRole = {
  key: 'staff',
  label: '待定位人员',
  level: 'info',
  flow: '待补充部门岗位后再进入业务链路',
  desc: '员工信息存在,但暂未识别到明确业务角色。',
  required: false,
  keywords: [],
  fallbackDept: '管理层',
  fallbackPost: '总经理'
}

const employeeImportColumns = [
  { key: 'empCode', label: '工号', aliases: ['工号', '员工编号', '员工工号', '编号'], index: 0 },
  { key: 'name', label: '姓名', aliases: ['姓名', '员工姓名', '人员姓名', '名称'], index: 1 },
  { key: 'deptName', label: '部门', aliases: ['部门', '所属部门', '部门名称', '一级部门'], index: 2 },
  { key: 'postName', label: '岗位', aliases: ['岗位', '职位', '职务', '岗位名称'], index: 3 },
  { key: 'roleName', label: '业务角色', aliases: ['业务角色', '角色', '角色定位', '业务定位'], index: 4 },
  { key: 'phone', label: '手机号', aliases: ['手机号', '手机', '电话', '联系电话'], index: 5 },
  { key: 'email', label: '邮箱', aliases: ['邮箱', '电子邮箱', '邮件'], index: 6 },
  { key: 'hireDate', label: '入职日期', aliases: ['入职日期', '入职时间', '到岗日期'], index: 7 },
  { key: 'status', label: '状态', aliases: ['状态', '员工状态', '在职状态'], index: 8 },
  { key: 'remark', label: '备注', aliases: ['备注', '说明', '补充说明'], index: 9 }
]

const flatDeptList = computed(() => flattenDeptTree(deptTree.value))

const normalizeRoleText = (value: any) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/[()（）【】\[\]{}]/g, '')

const roleCoverageTag = (level?: string) => {
  const map: Record<string, string> = {
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    primary: 'primary',
    info: 'info'
  }
  return (map[level || 'info'] || 'info') as any
}

const employeeBusinessRole = (row: any): BusinessRole => {
  const roleText = normalizeRoleText([
    row?.businessRole,
    row?.roleName,
    row?.roleLabel,
    row?.remark,
    row?.deptName,
    row?.postName,
    row?.positionName
  ].filter(Boolean).join(' '))

  if (!roleText) return staffRole

  const explicitRole = businessRoles.find(role => roleText.includes(normalizeRoleText(`业务角色:${role.label}`)) || roleText.includes(normalizeRoleText(role.label)))
  if (explicitRole) return explicitRole

  const roleScores = businessRoles.map((role, index) => {
    let score = 0
    role.keywords.forEach(keyword => {
      const normalizedKeyword = normalizeRoleText(keyword)
      if (normalizedKeyword && roleText.includes(normalizedKeyword)) {
        score += Math.max(2, normalizedKeyword.length)
      }
    })

    if (role.key === 'delivery' && roleText.includes('客服')) score += 8
    if (role.key === 'channel' && (roleText.includes('地址') || roleText.includes('同行'))) score += 10
    if (role.key === 'finance_audit' && (roleText.includes('财务总监') || roleText.includes('出纳') || roleText.includes('收款'))) score += 10
    if (role.key === 'finance_service' && (roleText.includes('会计') || roleText.includes('代账') || roleText.includes('税务'))) score += 10
    if (role.key === 'online_sale' && (roleText.includes('网销') || roleText.includes('运营') || roleText.includes('投放'))) score += 10
    if (role.key === 'tele_sale' && (roleText.includes('电销') || roleText.includes('外呼') || roleText.includes('坐席'))) score += 10

    return { role, score, index }
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)

  return roleScores[0]?.role || staffRole
}

const flattenDeptTree = (nodes: any[] = []): any[] => nodes.reduce((list: any[], item) => {
  list.push(item)
  if (Array.isArray(item.children) && item.children.length) {
    list.push(...flattenDeptTree(item.children))
  }
  return list
}, [])

const findDeptByName = (name: string, role?: BusinessRole) => {
  const normalizedName = normalizeRoleText(name)
  const exact = flatDeptList.value.find(item => normalizeRoleText(item.deptName) === normalizedName)
  if (exact) return exact

  const fuzzy = normalizedName
    ? flatDeptList.value.find(item => normalizeRoleText(item.deptName).includes(normalizedName) || normalizedName.includes(normalizeRoleText(item.deptName)))
    : undefined
  if (fuzzy) return fuzzy

  const fallbackName = normalizeRoleText(role?.fallbackDept)
  return flatDeptList.value.find(item => normalizeRoleText(item.deptName) === fallbackName)
}

const findPostByName = (name: string, role?: BusinessRole) => {
  const normalizedName = normalizeRoleText(name)
  const exact = postList.value.find(item => normalizeRoleText(item.postName) === normalizedName)
  if (exact) return exact

  const fuzzy = normalizedName
    ? postList.value.find(item => normalizeRoleText(item.postName).includes(normalizedName) || normalizedName.includes(normalizeRoleText(item.postName)))
    : undefined
  if (fuzzy) return fuzzy

  const fallbackName = normalizeRoleText(role?.fallbackPost)
  return postList.value.find(item => normalizeRoleText(item.postName) === fallbackName)
}

const splitEmployeeImportLine = (line: string) => {
  const text = line.trim()
  if (!text) return []
  if (text.includes('\t')) return text.split('\t').map(item => item.trim())

  const cells: string[] = []
  let current = ''
  let quoted = false
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      quoted = !quoted
      continue
    }
    if (char === ',' && !quoted) {
      cells.push(current.trim())
      current = ''
      continue
    }
    current += char
  }
  cells.push(current.trim())
  return cells
}

const detectEmployeeImportHeader = (cells: string[]) => {
  const headerMap: Record<string, number> = {}
  cells.forEach((cell, cellIndex) => {
    const normalizedCell = normalizeRoleText(cell)
    const column = employeeImportColumns.find(item => item.aliases.some(alias => normalizeRoleText(alias) === normalizedCell))
    if (column) headerMap[column.key] = cellIndex
  })
  return Object.keys(headerMap).length >= 2 ? headerMap : null
}

const rowValue = (cells: string[], headerMap: Record<string, number> | null, key: string) => {
  const column = employeeImportColumns.find(item => item.key === key)
  const index = headerMap?.[key] ?? column?.index ?? -1
  return index >= 0 ? String(cells[index] || '').trim() : ''
}

const normalizeEmployeeStatus = (value: string) => {
  const text = normalizeRoleText(value)
  if (!text) return 1
  if (['离职', '停用', '已离职', '3'].some(item => text.includes(normalizeRoleText(item)))) return 3
  if (['试用', '待转正', '2'].some(item => text.includes(normalizeRoleText(item)))) return 2
  return 1
}

const normalizeEmployeeGender = (value: string) => {
  const text = normalizeRoleText(value)
  if (text.includes('女') || text === '1') return 1
  return 0
}

const normalizeDateText = (value: string) => {
  const text = String(value || '').trim()
  if (!text) return ''
  const matched = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})/)
  if (!matched) return text
  const [, year, month, day] = matched
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

const buildEmployeeCode = (rowNo: number) => {
  const date = new Date()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `ZH${date.getFullYear()}${month}${day}${String(rowNo).padStart(3, '0')}`
}

const parseEmployeeImport = () => {
  const lines = importText.value
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)

  if (!lines.length) {
    importPreviewRows.value = []
    ElMessage.warning('请先粘贴公司人员表')
    return
  }

  const firstCells = splitEmployeeImportLine(lines[0])
  const headerMap = detectEmployeeImportHeader(firstCells)
  const dataLines = headerMap ? lines.slice(1) : lines
  const usedCodes = new Set(tableData.value.map(item => String(item.empCode || '').trim()).filter(Boolean))

  importPreviewRows.value = dataLines.map((line, index) => {
    const cells = splitEmployeeImportLine(line)
    const raw = {
      empCode: rowValue(cells, headerMap, 'empCode') || buildEmployeeCode(index + 1),
      name: rowValue(cells, headerMap, 'name'),
      deptName: rowValue(cells, headerMap, 'deptName'),
      postName: rowValue(cells, headerMap, 'postName'),
      roleName: rowValue(cells, headerMap, 'roleName'),
      phone: rowValue(cells, headerMap, 'phone'),
      email: rowValue(cells, headerMap, 'email'),
      hireDate: rowValue(cells, headerMap, 'hireDate'),
      status: rowValue(cells, headerMap, 'status'),
      remark: rowValue(cells, headerMap, 'remark')
    }
    const role = employeeBusinessRole(raw)
    const dept = findDeptByName(raw.deptName, role)
    const post = findPostByName(raw.postName, role)
    const issues: string[] = []

    if (!raw.name) issues.push('缺姓名')
    if (!raw.empCode) issues.push('缺工号')
    if (usedCodes.has(raw.empCode)) issues.push('工号可能重复')
    if (!dept) issues.push(`部门未匹配: ${raw.deptName || role.fallbackDept}`)
    if (!post) issues.push(`岗位未匹配: ${raw.postName || role.fallbackPost}`)
    if (dept && raw.deptName && normalizeRoleText(dept.deptName) !== normalizeRoleText(raw.deptName)) {
      issues.push(`部门已归到 ${dept.deptName}`)
    }
    if (post && raw.postName && normalizeRoleText(post.postName) !== normalizeRoleText(raw.postName)) {
      issues.push(`岗位已归到 ${post.postName}`)
    }

    usedCodes.add(raw.empCode)
    const status = issues.some(issue => issue.includes('缺') || issue.includes('重复') || issue.includes('未匹配')) ? 'error' : 'ready'
    const employee = {
      empCode: raw.empCode,
      name: raw.name,
      deptId: dept?.id,
      deptName: dept?.deptName,
      postId: post?.id,
      postName: post?.postName,
      phone: raw.phone,
      email: raw.email,
      hireDate: normalizeDateText(raw.hireDate),
      status: normalizeEmployeeStatus(raw.status),
      gender: normalizeEmployeeGender(''),
      remark: [
        raw.remark,
        `业务角色:${role.label}`,
        `承接链路:${role.flow}`,
        raw.deptName && dept?.deptName !== raw.deptName ? `原始部门:${raw.deptName}` : '',
        raw.postName && post?.postName !== raw.postName ? `原始岗位:${raw.postName}` : ''
      ].filter(Boolean).join('；')
    }

    return {
      rowNo: headerMap ? index + 2 : index + 1,
      raw,
      employee,
      role,
      status,
      statusText: status === 'ready' ? '可导入' : '待修正',
      issues
    } as EmployeeImportPreviewRow
  })

  const readyCount = importPreviewRows.value.filter(item => item.status === 'ready').length
  ElMessage.success(`已解析 ${importPreviewRows.value.length} 行,可导入 ${readyCount} 人`)
}

const fillEmployeeImportSample = () => {
  importText.value = [
    '工号\t姓名\t部门\t岗位\t业务角色\t手机号\t邮箱\t入职日期\t状态\t备注',
    'ZH001\t张明\t管理层\t总经理\t管理负责人\t13800000001\tzhangming@example.com\t2026-06-01\t在职\t负责最终审批',
    'ZH002\t李娜\t销售部\t销售代表\t电销拓客\t13800000002\tlina@example.com\t2026-06-01\t在职\t电话外呼和线索首触',
    'ZH003\t王磊\t销售部\t销售代表\t网销运营\t13800000003\twanglei@example.com\t2026-06-01\t在职\t负责线上投放和ROI',
    'ZH004\t陈会计\t财务部\t会计\t财税会计\t13800000004\tchenkj@example.com\t2026-06-01\t在职\t代账报税服务',
    'ZH005\t赵交付\t客服部\t销售代表\t工商交付\t13800000005\tzhaojf@example.com\t2026-06-01\t在职\t工商注册变更交付',
    'ZH006\t周渠道\t销售部\t销售代表\t渠道地址\t13800000006\tzhouqd@example.com\t2026-06-01\t在职\t挂靠地址和同行渠道',
    'ZH007\t钱出纳\t财务部\t财务总监\t财务审核\t13800000007\tqiancn@example.com\t2026-06-01\t在职\t回款核对和提单财审',
    'ZH008\t孙人事\t人事部\t人事专员\t人事行政\t13800000008\tsunrs@example.com\t2026-06-01\t在职\t组织和权限开通'
  ].join('\n')
  parseEmployeeImport()
}

const clearEmployeeImport = () => {
  importText.value = ''
  importPreviewRows.value = []
}

const openImportDialog = async () => {
  if (!deptTree.value.length) await loadDeptTree()
  if (!postList.value.length) await loadPostList()
  importDialog.visible = true
  if (importText.value && !importPreviewRows.value.length) parseEmployeeImport()
}

const csvCell = (value: any) => `"${String(value ?? '').replace(/"/g, '""')}"`

const downloadTextFile = (filename: string, content: string, type = 'text/plain;charset=utf-8') => {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

const downloadEmployeeTemplate = () => {
  const rows = [
    employeeImportColumns.map(item => item.label),
    ['ZH001', '张明', '管理层', '总经理', '管理负责人', '13800000001', 'zhangming@example.com', '2026-06-01', '在职', '负责老板审批'],
    ['ZH002', '李娜', '销售部', '销售代表', '电销拓客', '13800000002', 'lina@example.com', '2026-06-01', '在职', '负责电销首触'],
    ['ZH003', '王磊', '销售部', '销售代表', '网销运营', '13800000003', 'wanglei@example.com', '2026-06-01', '在职', '负责线上ROI'],
    ['ZH004', '陈会计', '财务部', '会计', '财税会计', '13800000004', 'chenkj@example.com', '2026-06-01', '在职', '代账报税交付']
  ]
  const content = `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\n')}`
  downloadTextFile('浙杭集团人员导入模板.csv', content, 'text/csv;charset=utf-8')
}

const submitEmployeeImport = async () => {
  if (!importPreviewRows.value.length) parseEmployeeImport()
  const readyRows = importPreviewRows.value.filter(item => item.status === 'ready')
  if (!readyRows.length) {
    ElMessage.warning('没有可导入的人员,请先修正预览问题')
    return
  }

  importingEmployees.value = true
  let successCount = 0
  let failCount = 0
  try {
    for (const row of readyRows) {
      const { deptName, postName, ...payload } = row.employee
      try {
        await employeeApi.create(payload)
        successCount += 1
      } catch (error) {
        failCount += 1
      }
    }
    if (successCount) {
      ElMessage.success(`已导入 ${successCount} 人${failCount ? `,失败 ${failCount} 人` : ''}`)
      importDialog.visible = false
      clearEmployeeImport()
      queryParams.pageNum = 1
      loadData()
    } else {
      ElMessage.error('导入失败,请检查工号是否重复或后端服务是否可用')
    }
  } finally {
    importingEmployees.value = false
  }
}

const empStatusType = (status: number) => {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'info' }
  return (map[status] || 'info') as any
}

const empStatusText = (status: number) => {
  const map: Record<number, string> = { 1: t('org.empStatusActive'), 2: t('org.empStatusTrial'), 3: t('org.empStatusLeft') }
  return map[status] || '-'
}

const genderText = (gender: number) => gender === 0 ? t('org.male') : t('org.female')

const employeeAvatar = (row: any) => String(row?.name || '员').slice(0, 2)

const employeeAvatarClass = (status: number) => {
  const map: Record<number, string> = { 1: 'success', 2: 'warning', 3: 'company' }
  return map[status] || 'company'
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await employeeApi.list(queryParams)
    const data = res.data
    tableData.value = data.records || data.list || []
    total.value = data.total || 0
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const loadDeptTree = async () => {
  try {
    const res = await deptApi.tree()
    deptTree.value = res.data?.length ? res.data : defaultDeptTree
  } catch (e) {
    deptTree.value = defaultDeptTree
  }
}

const loadPostList = async () => {
  try {
    const res = await postApi.all()
    postList.value = res.data?.length ? res.data : defaultPostList
  } catch (e) {
    postList.value = defaultPostList
  }
}

const handleSearch = () => {
  queryParams.pageNum = 1
  loadData()
}

const handleReset = () => {
  queryParams.name = ''
  queryParams.deptId = undefined
  queryParams.postId = undefined
  queryParams.status = undefined
  handleSearch()
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = t('org.addEmployee')
  formData.value = defaultForm()
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  isEdit.value = true
  dialogTitle.value = t('org.editEmployee')
  formData.value = { ...row }
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(t('org.confirmDeleteEmployee'), t('common.confirm'), { type: 'warning' })
    .then(async () => {
      await employeeApi.remove(row.id)
      ElMessage.success(t('common.success'))
      loadData()
    })
    .catch(() => {})
}

const handleRowClick = async (row: any) => {
  try {
    const res = await employeeApi.detail(row.id)
    detailData.value = res.data
    drawerVisible.value = true
  } catch (e) { /* ignore */ }
}

const submitForm = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    if (isEdit.value) {
      await employeeApi.update(formData.value)
    } else {
      await employeeApi.create(formData.value)
    }
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    loadData()
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  loadData()
  loadDeptTree()
  loadPostList()
})
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.search-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.employee-role-board {
  margin-bottom: 16px;
  padding: 18px;
  border: 1px solid #e5eaf3;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 8px 24px rgba(31, 45, 61, 0.04);
}
.employee-role-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 14px;
}
.employee-role-head h2 {
  margin: 0 0 6px;
  color: #1f2937;
  font-size: 18px;
  font-weight: 700;
}
.employee-role-head p {
  max-width: 820px;
  margin: 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}
.employee-role-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.employee-role-metrics div {
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #f8fafc;
}
.employee-role-metrics span,
.employee-import-side span {
  display: block;
  margin-bottom: 4px;
  color: #667085;
  font-size: 12px;
}
.employee-role-metrics b,
.employee-import-side b {
  color: #111827;
  font-size: 20px;
  font-weight: 750;
}
.employee-flow-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.employee-flow-card,
.employee-role-card {
  min-width: 0;
  padding: 12px;
  border: 1px solid #e8edf5;
  border-radius: 8px;
  background: #fff;
}
.employee-flow-card.success,
.employee-role-card.success {
  border-color: #b7eb8f;
  background: #f6ffed;
}
.employee-flow-card.warning,
.employee-role-card.warning {
  border-color: #ffe58f;
  background: #fffbe6;
}
.employee-flow-card.danger,
.employee-role-card.danger {
  border-color: #ffccc7;
  background: #fff2f0;
}
.employee-flow-card.primary,
.employee-role-card.primary {
  border-color: #b3d8ff;
  background: #f0f7ff;
}
.employee-flow-card.info,
.employee-role-card.info {
  border-color: #d9dfe8;
  background: #f8fafc;
}
.employee-flow-card > div,
.employee-role-card > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.employee-flow-card strong,
.employee-role-card strong {
  overflow: hidden;
  color: #1f2937;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.employee-flow-card p,
.employee-role-card p {
  min-height: 40px;
  margin: 0 0 8px;
  color: #667085;
  font-size: 12px;
  line-height: 1.6;
}
.employee-flow-card span,
.employee-role-card span {
  display: block;
  overflow: hidden;
  color: #344054;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.employee-role-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.role-position-text {
  color: #344054;
  font-size: 12px;
  line-height: 1.5;
}
.employee-import-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 180px;
  gap: 14px;
  margin-bottom: 14px;
}
.employee-import-main {
  min-width: 0;
}
.employee-import-tip {
  margin-bottom: 10px;
  padding: 12px;
  border: 1px solid #e6f4ff;
  border-radius: 8px;
  background: #f5fbff;
}
.employee-import-tip strong {
  display: block;
  margin-bottom: 4px;
  color: #1f2937;
  font-size: 14px;
}
.employee-import-tip p {
  margin: 0;
  color: #667085;
  font-size: 12px;
  line-height: 1.7;
}
.employee-import-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.employee-import-side {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.employee-import-side div {
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #f8fafc;
}
.import-match-cell {
  min-width: 0;
}
.import-match-cell strong,
.import-match-cell span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.import-match-cell strong {
  color: #1f2937;
  font-size: 13px;
}
.import-match-cell span {
  margin-top: 3px;
  color: #667085;
  font-size: 12px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.employee-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.employee-info-grid div {
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  background: #fbfcfd;
}
.employee-info-grid .wide {
  grid-column: 1 / -1;
}
.employee-info-grid span {
  display: block;
  margin-bottom: 5px;
  color: var(--text-muted);
  font-size: 12px;
}
.employee-info-grid b {
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 13px;
  font-weight: 650;
}
@media (max-width: 760px) {
  .search-actions {
    justify-content: flex-start;
  }
  .employee-role-head,
  .employee-import-layout {
    grid-template-columns: 1fr;
    display: grid;
  }
  .employee-role-metrics,
  .employee-flow-grid,
  .employee-role-grid {
    grid-template-columns: 1fr;
  }
  .employee-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>

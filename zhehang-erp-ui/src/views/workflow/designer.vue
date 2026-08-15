<template>
  <div class="workflow-designer">
    <!-- 流程列表视图 -->
    <div v-if="!showDesigner" class="process-list-view flow-list">
      <section class="flow-list-hero">
        <div>
          <span class="flow-eyebrow">APPROVAL WORKFLOW</span>
          <h2>审批模板设置</h2>
          <p>统一维护请假、报销、采购、用印等审批模板。按照基础设计、表单设计、流程设计、更多设置四步完成配置。</p>
        </div>
        <el-button type="primary" size="large" @click="handleCreate">
          <el-icon><Plus /></el-icon>
          新建审批模板
        </el-button>
      </section>

      <div class="flow-stat-grid">
        <div v-for="item in processStats" :key="item.label" class="flow-stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </div>
      </div>

      <section class="flow-search-panel">
        <el-input v-model="searchName" :placeholder="$t('workflow.processName')" clearable />
        <el-select v-model="searchCategory" :placeholder="$t('workflow.category')" clearable>
          <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <el-select v-model="searchStatus" :placeholder="$t('workflow.status')" clearable>
          <el-option :label="$t('workflow.draft')" :value="0" />
          <el-option :label="$t('workflow.published')" :value="1" />
          <el-option :label="$t('workflow.disabled')" :value="2" />
        </el-select>
        <el-button type="primary" @click="loadList">{{ $t('common.search') }}</el-button>
        <el-button @click="resetSearch">{{ $t('common.reset') }}</el-button>
      </section>

      <section class="flow-template-panel">
        <div class="section-title">
          <div>
            <h3>常用审批模板</h3>
            <p>选一个模板作为起点，再进入四步设计器细化字段和审批规则。</p>
          </div>
        </div>
        <div class="templates-grid">
          <button v-for="tpl in templates" :key="tpl.key" type="button" class="template-card" @click="useTemplate(tpl)">
            <span class="template-card__icon">
              <el-icon :size="24">
                <component :is="getTemplateIcon(tpl.key)" />
              </el-icon>
            </span>
            <span class="template-card__body">
              <b>{{ getTemplateName(tpl.key) }}</b>
              <small>{{ getCategoryLabel(tpl.category) }} · 点击使用模板</small>
            </span>
          </button>
        </div>
      </section>

      <section class="flow-table-panel">
        <div class="section-title">
          <div>
            <h3>流程定义</h3>
            <p>已发布流程会出现在审批中心；草稿流程可继续编辑。</p>
          </div>
        </div>
        <el-table :data="processList" v-loading="loading" class="flow-table">
          <el-table-column prop="name" label="流程名称" min-width="180">
            <template #default="{ row }">
              <div class="process-name-cell">
                <span class="process-icon">
                  <el-icon><component :is="getTemplateIcon(row.processKey)" /></el-icon>
                </span>
                <div>
                  <b>{{ row.name }}</b>
                  <small>{{ row.description || '暂无说明' }}</small>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="processKey" label="流程标识" width="150" />
          <el-table-column prop="category" label="分组" width="110">
            <template #default="{ row }">{{ getCategoryLabel(row.category) }}</template>
          </el-table-column>
          <el-table-column prop="version" :label="$t('workflow.version')" width="80" align="center">
            <template #default="{ row }">
              <el-tag size="small">v{{ row.version }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" :label="$t('workflow.status')" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusLabel(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="170" />
          <el-table-column label="操作" width="260" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="primary" text @click="openDesigner(row)">设计</el-button>
              <el-button v-if="row.status !== 1" size="small" type="success" text @click="handlePublish(row)">发布</el-button>
              <el-button v-if="row.status === 1" size="small" type="warning" text @click="handleDisable(row)">停用</el-button>
              <el-button size="small" type="danger" text @click="handleDelete(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </div>

    <!-- 流程设计器视图 -->
    <div v-else class="workflow-builder">
      <header class="builder-topbar">
        <div class="builder-title">
          <el-button text class="builder-back" @click="closeDesigner"><el-icon><ArrowLeft /></el-icon></el-button>
          <div>
            <h3>{{ editingProcess.name || '新建审批模板' }}</h3>
            <p>{{ editingProcess.id ? '正在编辑现有流程模板' : '草稿保存在本次编辑中，发布后员工才能发起' }}</p>
          </div>
        </div>
        <div class="builder-actions">
          <el-button @click="openPreview">预览</el-button>
          <el-button type="primary" @click="saveProcess">保存草稿</el-button>
        </div>
      </header>

      <nav class="builder-steps">
        <button
          v-for="step in workflowSteps"
          :key="step.key"
          type="button"
          :class="{ active: activeDesignStep === step.key }"
          @click="activeDesignStep = step.key"
        >
          <span>{{ step.no }}</span>
          <b>{{ step.title }}</b>
        </button>
      </nav>

      <section v-show="activeDesignStep === 'basic'" class="builder-panel basic-panel">
        <div class="panel-heading">
          <h3>基础设计</h3>
          <p>定义审批名称、图标、分组和谁可以提交。这里决定员工在审批中心看到什么。</p>
        </div>
        <el-form :model="editingProcess" label-width="128px" class="basic-form">
          <el-form-item label="图标">
            <div class="process-icon-editor">
              <span class="process-icon-preview">
                <el-icon><component :is="getTemplateIcon(editingProcess.processKey)" /></el-icon>
              </span>
              <el-button plain @click="ElMessage.info('当前按流程标识自动匹配图标，后续可接入统一图标选择器')">修改</el-button>
            </div>
          </el-form-item>
          <el-form-item label="名称" required>
            <el-input v-model="editingProcess.name" maxlength="60" show-word-limit placeholder="例如：正汐-费用报销审批" />
          </el-form-item>
          <el-form-item label="流程标识" required>
            <el-input v-model="editingProcess.processKey" :disabled="!!editingProcess.id" placeholder="例如：expense，创建后不建议修改" />
          </el-form-item>
          <el-form-item label="说明">
            <el-input v-model="editingProcess.description" maxlength="120" show-word-limit placeholder="说明这个审批适用于哪些场景" />
          </el-form-item>
          <el-form-item label="分组" required>
            <el-select v-model="editingProcess.category" placeholder="请选择分组" style="width: 100%">
              <el-option v-for="item in categoryOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="谁可以提交">
            <el-select v-model="processSettings.submitScope" style="width: 100%">
              <el-option label="全员" value="all" />
              <el-option label="指定角色" value="role" />
              <el-option label="仅管理员" value="admin" />
            </el-select>
          </el-form-item>
          <el-form-item v-if="processSettings.submitScope === 'role'" label="允许发起的角色">
            <el-select v-model="processSettings.submitRoles" multiple filterable collapse-tags placeholder="选择可发起该审批的角色" style="width: 100%">
              <el-option v-for="r in roleOptions" :key="r.roleKey" :label="r.roleName" :value="r.roleKey" />
            </el-select>
          </el-form-item>
        </el-form>
      </section>

      <section v-show="activeDesignStep === 'form'" class="builder-panel form-panel">
        <div class="panel-heading">
          <h3>表单设计</h3>
          <p>从左侧添加控件，中间预览员工发起审批时看到的表单，右侧维护字段名称、类型和必填。</p>
        </div>
        <div class="form-builder-grid">
          <aside class="component-palette">
            <div class="palette-tabs">
              <span class="active">控件</span>
              <span>控件组</span>
            </div>
            <div class="palette-section" v-for="group in fieldGroups" :key="group.title">
              <h4>{{ group.title }}</h4>
              <button v-for="ft in group.items" :key="ft.type" type="button" class="control-chip" @click="addFormField(ft.type)">
                <el-icon><component :is="ft.icon" /></el-icon>
                <span>{{ ft.label }}</span>
              </button>
            </div>
          </aside>

          <main class="phone-preview-wrap">
            <div class="phone-preview">
              <div class="phone-title">{{ editingProcess.name || '审批模板名称' }}</div>
              <div v-if="formFields.length" class="preview-fields">
                <div v-for="field in formFields" :key="field.field" class="preview-field">
                  <label>{{ field.label }}<em v-if="field.required">*</em></label>
                  <span>{{ previewFieldPlaceholder(field) }}</span>
                </div>
              </div>
              <div v-else class="preview-empty">点击左侧控件添加到此处</div>
            </div>
          </main>

          <aside class="field-editor">
            <div class="editor-title">
              <h4>字段列表</h4>
              <small>拖动排序，配置必填与选项</small>
            </div>
            <div class="fd-list" v-if="formFields.length">
              <div
                v-for="(f, fi) in formFields"
                :key="f.field"
                class="fd-item"
                :class="{ 'fd-item--drag': fdDragIndex === fi }"
                draggable="true"
                @dragstart="fdDragStart(fi)"
                @dragover.prevent
                @drop="fdDrop(fi)"
                @dragend="fdDragIndex = -1"
              >
                <el-icon class="fd-drag"><Rank /></el-icon>
                <div class="fd-main">
                  <el-input v-model="f.label" size="small" placeholder="字段名称" />
                  <div class="fd-subline">
                    <el-select v-model="f.type" size="small" style="width: 112px">
                      <el-option v-for="ft in fieldTypes" :key="ft.type" :label="ft.label" :value="ft.type" />
                    </el-select>
                    <el-checkbox v-model="f.required" size="small">必填</el-checkbox>
                    <el-button type="danger" text size="small" @click="formFields.splice(fi, 1)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <el-input
                    v-if="f.type === 'select' || f.type === 'multiselect'"
                    v-model="f._optionsText"
                    size="small"
                    placeholder="选项用逗号分隔，例如：同意,不同意"
                    @input="syncOptions(f)"
                  />
                </div>
              </div>
            </div>
            <el-empty v-else description="还没有表单字段" :image-size="58" />
          </aside>
        </div>
      </section>

      <section v-show="activeDesignStep === 'flow'" class="builder-panel flow-panel">
        <div class="panel-heading">
          <h3>流程设计</h3>
          <p>设置审批路径、条件分支、抄送人与多人审批方式。并行审批通过会签/或签落地，抄送在审批通过后生成通知记录。</p>
        </div>
        <div class="flow-builder-grid">
          <aside class="node-palette">
            <h4>节点组件</h4>
            <button type="button" class="node-tool approval" @click="addNode(Math.max(0, designerNodes.length - 2), 'approval')">
              <span><el-icon><UserFilled /></el-icon></span>
              <div><b>审批人</b><small>直属上级/指定人员/角色</small></div>
            </button>
            <button type="button" class="node-tool condition" @click="addNode(Math.max(0, designerNodes.length - 2), 'condition')">
              <span><el-icon><Share /></el-icon></span>
              <div><b>条件分支</b><small>按金额、天数等字段分流</small></div>
            </button>
            <button type="button" class="node-tool cc" @click="addNode(Math.max(0, designerNodes.length - 2), 'cc')">
              <span><el-icon><CopyDocument /></el-icon></span>
              <div><b>抄送人</b><small>通过后通知相关人员</small></div>
            </button>
            <button type="button" class="node-tool parallel" @click="addNode(Math.max(0, designerNodes.length - 2), 'parallel')">
              <span><el-icon><Connection /></el-icon></span>
              <div><b>并行审批</b><small>会签/或签多人处理</small></div>
            </button>
          </aside>

          <main class="flow-designer">
            <div class="flow-designer__canvas">
              <div v-for="(node, index) in designerNodes" :key="node.id" class="flow-node-wrapper">
                <div
                  class="flow-node"
                  :class="['flow-node--' + node.type, { 'flow-node--parallel': node.type === 'approval' && !!node.signMode && node.signMode !== 'single' }]"
                  @click="editNode(node)"
                >
                  <div class="flow-node__header">
                    <span>{{ nodeTypeLabel(node.type, node) }}</span>
                    <el-icon v-if="node.type !== 'start' && node.type !== 'end'" class="flow-node__delete" @click.stop="removeNode(index)"><Close /></el-icon>
                  </div>
                  <div class="flow-node__body">
                    <strong>{{ node.name }}</strong>
                    <span>{{ nodeMetaLabel(node) }}</span>
                  </div>
                </div>

                <div v-if="index < designerNodes.length - 1" class="flow-add-btn">
                  <div class="flow-line"></div>
                  <el-dropdown trigger="click" @command="(cmd: string) => addNode(index, cmd)">
                    <el-button circle type="primary" class="flow-add-btn__trigger">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="approval">审批人</el-dropdown-item>
                        <el-dropdown-item command="condition">条件分支</el-dropdown-item>
                        <el-dropdown-item command="cc">抄送人</el-dropdown-item>
                        <el-dropdown-item command="parallel">并行审批</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                  <div class="flow-line"></div>
                </div>
              </div>
            </div>
          </main>

          <aside class="flow-summary">
            <h4>当前流程检查</h4>
            <div class="summary-row"><span>节点数</span><b>{{ designerNodes.length }}</b></div>
            <div class="summary-row"><span>审批节点</span><b>{{ designerNodes.filter(n => n.type === 'approval').length }}</b></div>
            <div class="summary-row"><span>条件分支</span><b>{{ designerNodes.filter(n => n.type === 'condition').length }}</b></div>
            <div class="summary-row"><span>抄送节点</span><b>{{ designerNodes.filter(n => n.type === 'cc').length }}</b></div>
            <div class="summary-row"><span>并行审批</span><b>{{ designerNodes.filter(n => n.type === 'approval' && !!n.signMode && n.signMode !== 'single').length }}</b></div>
            <el-alert type="info" :closable="false" show-icon title="点击流程节点可编辑审批人、会签/或签、抄送人与条件目标。" />
          </aside>
        </div>
      </section>

      <section v-show="activeDesignStep === 'settings'" class="builder-panel settings-panel">
        <div class="panel-heading">
          <h3>更多设置</h3>
          <p>配置撤回规则与抄送人员。以下开关均真实生效(撤回策略由后端 cancel 校验、发起范围由后端 start 校验)。</p>
        </div>
        <div class="settings-layout">
          <section class="settings-block">
            <h4>撤回策略</h4>
            <label class="setting-line">
              <el-checkbox v-model="processSettings.allowWithdrawBeforeApproval" />
              <span>第一个审批节点通过前，允许提交人撤销申请</span>
            </label>
            <label class="setting-line">
              <el-checkbox v-model="processSettings.allowWithdrawAfterApproval" />
              <span>已有节点通过后，允许在</span>
              <el-input-number v-model="processSettings.withdrawDays" :min="1" :max="365" controls-position="right" />
              <span>天内撤销</span>
            </label>
            <p class="settings-hint">批量审批已是审批中心待办页的通用能力(多选后一键同意),无需在此逐流程开关。</p>
          </section>

          <section class="settings-block">
            <h4>抄送设置</h4>
            <label class="setting-line">
              <el-checkbox v-model="ccInitiator" />
              <span>审批通过后抄送发起人</span>
            </label>
            <el-select v-model="ccUserIds" multiple filterable collapse-tags placeholder="抄送指定成员，可多选" style="width: 100%">
              <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
            </el-select>
          </section>
        </div>
      </section>

      <!-- 节点编辑弹窗 -->
      <el-dialog v-model="nodeDialogVisible" :title="$t('workflow.nodeConfig')" width="500px">
        <el-form v-if="editingNode" :model="editingNode" label-width="100px">
          <el-form-item :label="$t('workflow.nodeName')">
            <el-input v-model="editingNode.name" />
          </el-form-item>
          <template v-if="editingNode.type === 'approval'">
            <el-form-item label="签署方式">
              <el-select v-model="editingNode.signMode">
                <el-option label="单人审批" value="single" />
                <el-option label="会签：全部同意才通过" value="and" />
                <el-option label="或签：任一同意即通过" value="or" />
              </el-select>
            </el-form-item>
            <template v-if="!editingNode.signMode || editingNode.signMode === 'single'">
              <el-form-item :label="$t('workflow.assigneeType')">
                <el-select v-model="editingNode.assigneeType" @change="onAssigneeTypeChange">
                  <el-option label="直属上级" value="supervisor" />
                  <el-option label="部门主管" value="dept_manager" />
                  <el-option :label="$t('workflow.specifyUser')" value="user" />
                  <el-option :label="$t('workflow.specifyRole')" value="role" />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('workflow.assignee')" v-if="editingNode.assigneeType === 'user' || editingNode.assigneeType === 'role'">
                <el-select v-if="editingNode.assigneeType === 'user'" v-model="specifyUserIds" multiple filterable collapse-tags placeholder="选择指定人员,可多选" style="width: 100%">
                  <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
                </el-select>
                <el-select v-else-if="editingNode.assigneeType === 'role'" v-model="editingNode.assigneeValue" filterable placeholder="选择角色" style="width: 100%" @change="checkAssignee('role', editingNode.assigneeValue)">
                  <el-option v-for="r in roleOptions" :key="r.roleKey" :label="r.roleName" :value="r.roleKey" />
                </el-select>
                <div v-if="editingNode.assigneeType === 'user'" class="assignee-multi-hint">指定多人时,任一人同意即通过(或签);需全部同意请改用上方"会签"</div>
              </el-form-item>
              <el-alert v-if="assigneeWarning" :title="assigneeWarning" type="warning" :closable="false" show-icon style="margin-bottom: 12px" />
            </template>
            <el-form-item label="审批人(多人)" v-else>
              <el-select v-model="approverUserIds" multiple filterable placeholder="选择多个审批人" style="width: 100%">
                <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
              </el-select>
            </el-form-item>
            <el-form-item label="审批时限">
              <el-input-number v-model="editingNode.timeoutHours" :min="0" :max="720" :step="1" :controls="false" placeholder="小时" style="width: 120px" />
              <span class="assignee-multi-hint" style="margin-left: 8px">小时;超时未处理系统自动提醒审批人,0或留空=不限时</span>
            </el-form-item>
          </template>
          <template v-if="editingNode.type === 'condition'">
            <div class="cond-hint">按表单里的数值字段判断,满足则走到指定节点(从上到下匹配,都不满足走默认下一节点)</div>
            <div v-for="(cond, ci) in editingNode.conditions" :key="ci" class="condition-row">
              <span class="cond-label">当</span>
              <el-select v-model="cond.field" placeholder="字段" style="width: 130px" @change="syncCondExpr(cond)">
                <el-option v-for="f in conditionFields" :key="f.field" :label="f.label" :value="f.field" />
              </el-select>
              <el-select v-model="cond.op" style="width: 78px; margin-left: 6px" @change="syncCondExpr(cond)">
                <el-option v-for="o in condOps" :key="o" :label="o" :value="o" />
              </el-select>
              <el-input-number v-model="cond.value" :controls="false" placeholder="值" style="width: 100px; margin-left: 6px" @change="syncCondExpr(cond)" />
              <span class="cond-label" style="margin-left: 6px">→</span>
              <el-select v-model="cond.nextNode" placeholder="目标节点" style="width: 140px; margin-left: 6px">
                <el-option v-for="n in targetNodeOptions" :key="n.id" :label="n.name" :value="n.id" />
              </el-select>
              <el-button type="danger" text @click="editingNode.conditions.splice(ci, 1)"><el-icon><Delete /></el-icon></el-button>
            </div>
            <el-button type="primary" text @click="editingNode.conditions.push({ expression: '', nextNode: '', field: '', op: '>', value: 0 })">
              + {{ $t('workflow.addCondition') }}
            </el-button>
          </template>
          <template v-if="editingNode.type === 'cc'">
            <el-alert type="info" :closable="false" show-icon title="抄送节点不进入审批待办，审批通过后会生成抄送记录。" class="cc-node-tip" />
            <el-form-item label="抄送对象">
              <div class="cc-node-editor">
                <el-checkbox v-model="ccNodeInitiator">抄送发起人</el-checkbox>
                <el-select v-model="ccNodeUserIds" multiple filterable collapse-tags placeholder="选择指定成员，可多选" style="width: 100%">
                  <el-option v-for="u in userOptions" :key="u.id" :label="u.name" :value="u.id" />
                </el-select>
              </div>
            </el-form-item>
          </template>
        </el-form>
        <template #footer>
          <el-button @click="nodeDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveNodeConfig">{{ $t('common.confirm') }}</el-button>
        </template>
      </el-dialog>

      <!-- 表单预览:用员工真实所见的动态表单渲染器(只读),所见即所得 -->
      <el-dialog v-model="previewVisible" title="表单预览(员工发起时所见)" width="480px" append-to-body>
        <div class="preview-phone">
          <div class="preview-phone__title">{{ editingProcess.name || '审批申请' }}</div>
          <el-form label-position="top" class="preview-phone__form">
            <ApprovalFormFields :form-config="previewFields" :model-value="previewValues" readonly />
          </el-form>
        </div>
        <template #footer>
          <el-button type="primary" @click="previewVisible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft, Close, Delete, Calendar, Money, ShoppingCart, Stamp, Rank, UserFilled, Share, CopyDocument, Connection, Paperclip } from '@element-plus/icons-vue'
import { processApi, taskApi, type ProcessDef, type ProcessTemplate } from '@/api/workflow'
import ApprovalFormFields from '@/components/workflow/ApprovalFormFields.vue'
import { roleApi } from '@/api/system'

const { t } = useI18n()

// 列表状态
const loading = ref(false)
const processList = ref<ProcessDef[]>([])
const templates = ref<ProcessTemplate[]>([])
const searchName = ref('')
const searchCategory = ref('')
const searchStatus = ref<number | undefined>(undefined)
const categoryOptions = [
  { label: '考勤', value: 'attendance' },
  { label: '财务', value: 'finance' },
  { label: '供应链', value: 'supply' },
  { label: '行政', value: 'admin' },
  { label: '人事', value: 'hrm' },
  { label: '合同', value: 'contract' }
]
const processStats = computed(() => [
  { label: '全部流程', value: processList.value.length },
  { label: '已发布', value: processList.value.filter(item => item.status === 1).length },
  { label: '草稿', value: processList.value.filter(item => item.status === 0).length },
  { label: '已停用', value: processList.value.filter(item => item.status === 2).length }
])

// 设计器状态
const showDesigner = ref(false)
type DesignStep = 'basic' | 'form' | 'flow' | 'settings'
const workflowSteps: Array<{ key: DesignStep; no: number; title: string }> = [
  { key: 'basic', no: 1, title: '基础设计' },
  { key: 'form', no: 2, title: '表单设计' },
  { key: 'flow', no: 3, title: '流程设计' },
  { key: 'settings', no: 4, title: '更多设置' }
]
const activeDesignStep = ref<DesignStep>('basic')
const editingProcess = reactive<any>({
  id: null,
  name: '',
  processKey: '',
  category: '',
  description: '',
  formConfig: '[]',
  processConfig: ''
})
// 仅保留后端真实生效的设置:submitScope(+submitRoles) 发起范围、撤回策略。
// 其余摆设开关(工作台展示/审批管理员/代提交/审批人撤回/快捷审批/去重/修改天数)已从界面撤下。
const defaultProcessSettings = () => ({
  submitScope: 'all',
  submitRoles: [] as string[],
  allowWithdrawBeforeApproval: true,
  allowWithdrawAfterApproval: false,
  withdrawDays: 31
})
const processSettings = reactive(defaultProcessSettings())

function resetProcessSettings(settings?: Record<string, any>) {
  // 只挑真实生效的字段回填,老流程里残留的摆设字段一律丢弃
  const d = defaultProcessSettings()
  const s = settings || {}
  processSettings.submitScope = s.submitScope || d.submitScope
  processSettings.submitRoles = Array.isArray(s.submitRoles) ? s.submitRoles : []
  processSettings.allowWithdrawBeforeApproval = s.allowWithdrawBeforeApproval !== undefined
    ? !!s.allowWithdrawBeforeApproval : d.allowWithdrawBeforeApproval
  processSettings.allowWithdrawAfterApproval = !!s.allowWithdrawAfterApproval
  processSettings.withdrawDays = Number(s.withdrawDays) > 0 ? Number(s.withdrawDays) : d.withdrawDays
}

interface CcTarget {
  type: string
  value?: string
}

interface DesignerNode {
  id: string
  type: string
  name: string
  assigneeType?: string
  assigneeValue?: string
  signMode?: string
  /** 审批时限(小时):超时未处理系统提醒审批人;0/空=不限时 */
  timeoutHours?: number
  assignees?: Array<{ assigneeType: string; assigneeValue: string }>
  conditions?: Array<{ expression: string; nextNode: string; field?: string; op?: string; value?: number }>
  ccTargets?: CcTarget[]
}

const designerNodes = ref<DesignerNode[]>([
  { id: 'start', type: 'start', name: '开始' },
  { id: 'end', type: 'end', name: '结束' }
])

const nodeDialogVisible = ref(false)
const editingNode = ref<DesignerNode | null>(null)

// 审批人下拉选项:用户、角色
const userOptions = ref<{ id: number; name: string }[]>([])
const roleOptions = ref<{ roleKey: string; roleName: string }[]>([])
// 抄送配置:抄送发起人 + 抄送指定成员
const ccInitiator = ref(true)
const ccUserIds = ref<number[]>([])

function normalizeCcTargets(targets?: any[]): CcTarget[] {
  if (!Array.isArray(targets)) return []
  const seen = new Set<string>()
  const normalized: CcTarget[] = []
  for (const target of targets) {
    const type = String(target?.type || '')
    const value = target?.value != null ? String(target.value) : undefined
    if (type !== 'initiator' && !(type === 'user' && value)) continue
    const key = `${type}:${value || ''}`
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(type === 'initiator' ? { type } : { type, value })
  }
  return normalized
}

function ccTargetsFromSettings(): CcTarget[] {
  const targets: CcTarget[] = []
  if (ccInitiator.value) targets.push({ type: 'initiator' })
  for (const uid of ccUserIds.value) targets.push({ type: 'user', value: String(uid) })
  return normalizeCcTargets(targets)
}

function ccTargetsFromNodes(nodes: DesignerNode[]): CcTarget[] {
  return normalizeCcTargets(nodes.flatMap(node => normalizeCcTargets(node.ccTargets)))
}

function mergeCcTargets(targets: CcTarget[]): CcTarget[] {
  return normalizeCcTargets(targets)
}

function ccTargetText(targets?: CcTarget[]) {
  const normalized = normalizeCcTargets(targets)
  if (!normalized.length) return ''
  const labels = normalized.map(target => {
    if (target.type === 'initiator') return '发起人'
    const user = userOptions.value.find(item => String(item.id) === String(target.value))
    return user?.name || target.value || '指定成员'
  })
  return `审批通过后抄送：${labels.join('、')}`
}

async function loadPickerOptions () {
  try {
    // 审批人候选:走 workflow 自有选人接口(/workflow/task/colleagues,已开通账号的员工,无 system:user:list 权限限制),
    // 与审批中心「抄送/转交」选人口径一致;避免因审批流程管理员无用户管理权限时下拉为空(飞书213)。
    const rows: any = await taskApi.colleagues()
    const list = Array.isArray(rows) ? rows : (rows?.data || [])
    userOptions.value = list.map((u: any) => ({ id: u.userId ?? u.id, name: u.name || u.nickname || u.username || ('用户' + (u.userId ?? u.id)) }))
  } catch { userOptions.value = [] }
  try {
    const rres: any = await roleApi.all()
    roleOptions.value = (rres.data || []).map((r: any) => ({ roleKey: r.roleKey, roleName: r.roleName }))
  } catch { roleOptions.value = [] }
}

onMounted(() => {
  loadList()
  loadTemplates()
  loadPickerOptions()
})

async function loadList() {
  loading.value = true
  try {
    const params: any = {}
    if (searchName.value) params.name = searchName.value
    if (searchCategory.value) params.category = searchCategory.value
    if (searchStatus.value !== undefined) params.status = searchStatus.value
    const res = await processApi.list(params)
    processList.value = (res as any).data || res || []
  } catch (e) { /* ignore */ }
  loading.value = false
}

async function loadTemplates() {
  try {
    const res = await processApi.templates()
    templates.value = (res as any).data || res || []
  } catch (e) { /* ignore */ }
}

function resetSearch() {
  searchName.value = ''
  searchCategory.value = ''
  searchStatus.value = undefined
  loadList()
}

function getStatusType(status: number) {
  switch (status) {
    case 0: return 'info'
    case 1: return 'success'
    case 2: return 'warning'
    default: return 'info'
  }
}

function getStatusLabel(status: number) {
  switch (status) {
    case 0: return t('workflow.draft')
    case 1: return t('workflow.published')
    case 2: return t('workflow.disabled')
    default: return ''
  }
}

function getCategoryLabel(category: string) {
  return categoryOptions.find(item => item.value === category)?.label || category || '未分组'
}

function getTemplateIcon(key: string) {
  switch (key) {
    case 'leave': return Calendar
    case 'expense': return Money
    case 'purchase': return ShoppingCart
    case 'seal': return Stamp
    default: return Calendar
  }
}

function getTemplateName(key: string) {
  switch (key) {
    case 'leave': return t('workflow.leaveApproval')
    case 'expense': return t('workflow.expenseApproval')
    case 'purchase': return t('workflow.purchaseApproval')
    case 'seal': return t('workflow.sealApproval')
    default: return key
  }
}

function handleCreate() {
  Object.assign(editingProcess, { id: null, name: '', processKey: '', category: '', description: '', formConfig: '[]', processConfig: '' })
  designerNodes.value = [
    { id: 'start', type: 'start', name: '开始' },
    { id: 'end', type: 'end', name: '结束' }
  ]
  ccInitiator.value = true
  ccUserIds.value = []
  resetProcessSettings()
  activeDesignStep.value = 'basic'
  parseFormFields()
  showDesigner.value = true
}

function useTemplate(tpl: ProcessTemplate) {
  Object.assign(editingProcess, {
    id: null,
    name: tpl.name,
    processKey: tpl.key,
    category: tpl.category,
    description: '',
    formConfig: tpl.formConfig,
    processConfig: tpl.processConfig
  })
  parseFormFields()
  resetProcessSettings()
  activeDesignStep.value = 'basic'
  // 解析节点
  try {
    const config = JSON.parse(tpl.processConfig)
    designerNodes.value = config.nodes || []
    resetProcessSettings(config.settings)
  } catch (e) {
    designerNodes.value = [
      { id: 'start', type: 'start', name: '开始' },
      { id: 'end', type: 'end', name: '结束' }
    ]
    resetProcessSettings()
  }
  showDesigner.value = true
}

async function openDesigner(row: ProcessDef) {
  // 已发布流程需先停用才能改:提前提示,避免用户白改一通到保存才被后端拒
  if (row.status === 1) {
    try {
      await ElMessageBox.confirm('该流程已发布,需先停用才能修改。是否停用并进入编辑?', '流程已发布', {
        confirmButtonText: '停用并编辑', cancelButtonText: '取消', type: 'warning'
      })
      await processApi.disable(row.id)
      row = { ...row, status: 2 }
      loadList()
      ElMessage.success('已停用,进入编辑')
    } catch {
      return
    }
  }
  Object.assign(editingProcess, {
    id: row.id,
    name: row.name,
    processKey: row.processKey,
    category: row.category,
    description: row.description,
    formConfig: row.formConfig || '[]',
    processConfig: row.processConfig || ''
  })
  parseFormFields()
  activeDesignStep.value = 'basic'
  try {
    const config = JSON.parse(row.processConfig || '{}')
    designerNodes.value = config.nodes || [
      { id: 'start', type: 'start', name: '开始' },
      { id: 'end', type: 'end', name: '结束' }
    ]
    resetProcessSettings(config.settings)
    const ccArr = Array.isArray(config.cc) ? config.cc : []
    ccInitiator.value = ccArr.length ? ccArr.some((c: any) => c.type === 'initiator') : true
    ccUserIds.value = ccArr.filter((c: any) => c.type === 'user' && c.value).map((c: any) => Number(c.value))
  } catch (e) {
    designerNodes.value = [
      { id: 'start', type: 'start', name: '开始' },
      { id: 'end', type: 'end', name: '结束' }
    ]
    ccInitiator.value = true
    ccUserIds.value = []
    resetProcessSettings()
  }
  showDesigner.value = true
}

function closeDesigner() {
  showDesigner.value = false
}

// 默认名自动去重:连续新增同类节点时生成"审批节点 2/3…",避免触发保存时的重名校验
function uniqueNodeName(base: string) {
  const names = designerNodes.value.map(n => n.name)
  if (!names.includes(base)) return base
  let k = 2
  while (names.includes(base + ' ' + k)) k++
  return base + ' ' + k
}
function addNode(afterIndex: number, type: string) {
  const newId = 'node_' + Date.now()
  const nodeType = type === 'parallel' ? 'approval' : type
  const baseMap: Record<string, string> = {
    approval: t('workflow.approvalNode'),
    condition: t('workflow.conditionNode'),
    cc: '抄送人',
    parallel: '并行审批'
  }
  const node: DesignerNode = {
    id: newId,
    type: nodeType,
    name: uniqueNodeName(baseMap[type] || baseMap[nodeType] || '节点')
  }
  if (nodeType === 'approval') {
    node.signMode = type === 'parallel' ? 'and' : 'single'
    node.assigneeType = type === 'parallel' ? undefined : 'role'
    node.assigneeValue = type === 'parallel' ? undefined : 'dept_manager'
    node.assignees = type === 'parallel' ? [] : undefined
  }
  if (nodeType === 'condition') {
    node.conditions = []
  }
  if (nodeType === 'cc') {
    node.ccTargets = [{ type: 'initiator' }]
  }
  designerNodes.value.splice(afterIndex + 1, 0, node)
}

function removeNode(index: number) {
  const removedId = designerNodes.value[index]?.id
  designerNodes.value.splice(index, 1)
  // 清理指向被删节点的条件分支,避免留下悬空引用(保存后变成指向不存在节点的边)
  if (removedId) {
    for (const n of designerNodes.value) {
      if (n.conditions) n.conditions = n.conditions.filter(c => c.nextNode !== removedId)
    }
  }
}

function editNode(node: DesignerNode) {
  if (node.type === 'start' || node.type === 'end') return
  editingNode.value = {
    ...node,
    signMode: node.signMode || 'single',
    assignees: node.assignees ? node.assignees.map(a => ({ ...a })) : [],
    conditions: node.conditions ? node.conditions.map(c => ({ ...c, ...parseExpr(c.expression) })) : [],
    ccTargets: node.ccTargets ? node.ccTargets.map(c => ({ ...c })) : (node.type === 'cc' ? [{ type: 'initiator' }] : undefined)
  }
  nodeDialogVisible.value = true
}

// 多人审批的"审批人"多选(会签/或签):与 assignees 互转
const approverUserIds = computed<number[]>({
  get: () => (editingNode.value?.assignees || []).map(a => Number(a.assigneeValue)).filter(n => !isNaN(n)),
  set: (ids: number[]) => {
    if (editingNode.value) editingNode.value.assignees = ids.map(id => ({ assigneeType: 'user', assigneeValue: String(id) }))
  }
})

// 单人审批模式下"指定人员"多选:同样落到 assignees[](assigneeType=user),后端一人一任务(默认或签,任一同意即过)
// 兼容旧数据:旧节点只存了单个 assigneeValue,读时把它并入选中列表
const specifyUserIds = computed<number[]>({
  get: () => {
    const node = editingNode.value
    if (!node) return []
    if (node.assignees && node.assignees.length) {
      return node.assignees
        .filter(a => a.assigneeType === 'user')
        .map(a => Number(a.assigneeValue))
        .filter(n => !isNaN(n))
    }
    // 旧数据回退:单个 assigneeValue 转成单元素数组
    if (node.assigneeType === 'user' && node.assigneeValue) {
      const single = Number(node.assigneeValue)
      return isNaN(single) ? [] : [single]
    }
    return []
  },
  set: (ids: number[]) => {
    if (editingNode.value) editingNode.value.assignees = ids.map(id => ({ assigneeType: 'user', assigneeValue: String(id) }))
  }
})

const ccNodeInitiator = computed<boolean>({
  get: () => normalizeCcTargets(editingNode.value?.ccTargets).some(target => target.type === 'initiator'),
  set: (checked: boolean) => {
    if (!editingNode.value) return
    const targets = normalizeCcTargets(editingNode.value.ccTargets).filter(target => target.type !== 'initiator')
    editingNode.value.ccTargets = checked ? [{ type: 'initiator' }, ...targets] : targets
  }
})

const ccNodeUserIds = computed<number[]>({
  get: () => normalizeCcTargets(editingNode.value?.ccTargets)
    .filter(target => target.type === 'user' && target.value)
    .map(target => Number(target.value))
    .filter(id => !Number.isNaN(id)),
  set: (ids: number[]) => {
    if (!editingNode.value) return
    const nonUsers = normalizeCcTargets(editingNode.value.ccTargets).filter(target => target.type !== 'user')
    editingNode.value.ccTargets = normalizeCcTargets([
      ...nonUsers,
      ...ids.map(id => ({ type: 'user', value: String(id) }))
    ])
  }
})

// ===== 条件分支可视化 =====
const condOps = ['>', '>=', '<', '<=', '==', '!=']
// 表单里的字段(给条件"字段"下拉);引擎只支持数值比较,优先数字类字段,也允许其它
const conditionFields = computed(() => {
  try {
    const fields = JSON.parse(editingProcess.formConfig || '[]')
    return (Array.isArray(fields) ? fields : []).map((f: any) => ({ field: f.field, label: f.label || f.field }))
  } catch { return [] }
})
// 目标节点下拉:只能选条件节点"之后"的节点,防止往回跳形成环路(后端会无限递归)
const targetNodeOptions = computed(() => {
  const idx = designerNodes.value.findIndex(n => n.id === editingNode.value?.id)
  return designerNodes.value.filter((n, i) => n.type !== 'start' && i > idx)
})
// 字段+运算符+值 → 表达式字符串(引擎用);任一项缺失则清空表达式,避免残留旧阈值
function syncCondExpr (cond: any) {
  if (cond.field && cond.op != null && cond.value != null && cond.value !== '') {
    cond.expression = `${cond.field} ${cond.op} ${cond.value}`
  } else {
    cond.expression = ''
  }
}
// 表达式字符串 → 字段/运算符/值(编辑已有条件时回填)
function parseExpr (expr?: string): { field?: string; op?: string; value?: number } {
  if (!expr) return {}
  for (const op of ['>=', '<=', '!=', '==', '>', '<']) {
    const i = expr.indexOf(op)
    if (i >= 0) {
      const field = expr.slice(0, i).trim()
      const v = Number(expr.slice(i + op.length).trim())
      return { field, op, value: isNaN(v) ? undefined : v }
    }
  }
  return {}
}

// ===== 拖拽式表单设计器 =====
const fieldTypes = [
  { type: 'text', label: '单行文本', icon: Stamp },
  { type: 'textarea', label: '多行文本', icon: Stamp },
  { type: 'description', label: '说明文字', icon: Stamp },
  { type: 'number', label: '数字', icon: Money },
  { type: 'amount', label: '金额', icon: Money },
  { type: 'date', label: '日期', icon: Calendar },
  { type: 'datetime', label: '日期时间', icon: Calendar },
  { type: 'daterange', label: '日期区间', icon: Calendar },
  { type: 'select', label: '下拉选择', icon: Rank },
  { type: 'multiselect', label: '多选', icon: Rank },
  { type: 'attachment', label: '附件', icon: Paperclip }
]
const fieldGroups = computed(() => [
  { title: '文本', items: fieldTypes.filter(item => ['text', 'textarea', 'description'].includes(item.type)) },
  { title: '数值', items: fieldTypes.filter(item => ['number', 'amount'].includes(item.type)) },
  { title: '选项', items: fieldTypes.filter(item => ['select', 'multiselect'].includes(item.type)) },
  { title: '日期', items: fieldTypes.filter(item => ['date', 'datetime', 'daterange'].includes(item.type)) },
  { title: '附件', items: fieldTypes.filter(item => ['attachment'].includes(item.type)) }
])
const formFields = ref<any[]>([])

// ===== 表单预览(所见即所得,复用员工发起页的动态表单渲染器) =====
const previewVisible = ref(false)
const previewFields = ref<any[]>([])
const previewValues = reactive<Record<string, any>>({})
function openPreview() {
  previewFields.value = formFields.value.map((f: any) => ({ ...f }))
  Object.keys(previewValues).forEach(k => delete previewValues[k])
  previewVisible.value = true
}

// ===== 审批人即时预警(选角色/直属上级/部门主管时提示无人/未设上级) =====
const assigneeWarning = ref('')
async function checkAssignee(assigneeType?: string, assigneeValue?: string) {
  assigneeWarning.value = ''
  if (!assigneeType) return
  // 选角色但还没选具体角色时不查
  if (assigneeType === 'role' && !assigneeValue) return
  try {
    const res: any = await processApi.assigneePreview(assigneeType, assigneeValue)
    const d = (res && typeof res === 'object' && 'data' in res) ? res.data : res
    if (d && d.ok === false && d.warning) assigneeWarning.value = d.warning
  } catch { /* 预警失败不打断编辑 */ }
}
function onAssigneeTypeChange(type: string) {
  assigneeWarning.value = ''
  // supervisor/dept_manager 立即校验;role 等选了具体角色再校验
  if (type === 'supervisor' || type === 'dept_manager') checkAssignee(type)
}
const fdDragIndex = ref(-1)

function previewFieldPlaceholder(field: any) {
  if (field.type === 'date' || field.type === 'datetime') return '请选择'
  if (field.type === 'daterange') return '开始日期 ~ 结束日期'
  if (field.type === 'select' || field.type === 'multiselect') return field.options?.length ? field.options.join(' / ') : '请选择'
  if (field.type === 'amount') return '¥ 0.00'
  if (field.type === 'number') return '请输入数字'
  if (field.type === 'description') return '(仅展示说明文字,员工不填写)'
  if (field.type === 'attachment') return '点击上传附件(支持图片/文件,可多个)'
  if (field.type === 'textarea') return '请输入'
  return '请输入'
}

function genFieldKey() {
  return 'field_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8)
}
// 保证生成的字段标识在当前表单内唯一(避免同毫秒撞 key 导致两字段身份相撞)
function uniqueFieldKey() {
  const existing = new Set(formFields.value.map((f: any) => f.field))
  let k = genFieldKey()
  while (existing.has(k)) k = genFieldKey()
  return k
}
function addFormField(type: string) {
  const labelMap: Record<string, string> = {
    text: '单行文本', textarea: '多行文本', description: '说明文字(如:请如实填写,虚报按公司规定处理)',
    number: '数字', amount: '金额', date: '日期', datetime: '日期时间', daterange: '日期区间',
    select: '下拉选择', multiselect: '多选', attachment: '附件'
  }
  const hasOptions = type === 'select' || type === 'multiselect'
  formFields.value.push({
    field: uniqueFieldKey(),
    label: labelMap[type] || '新字段',
    type,
    required: type === 'description' ? false : false,
    options: hasOptions ? [] : undefined,
    _optionsText: ''
  })
}
function syncOptions(f: any) {
  f.options = (f._optionsText || '').split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
}
function fdDragStart(i: number) { fdDragIndex.value = i }
function fdDrop(i: number) {
  const from = fdDragIndex.value
  if (from < 0 || from === i) { fdDragIndex.value = -1; return }
  const arr = formFields.value
  const [moved] = arr.splice(from, 1)
  arr.splice(i, 0, moved)
  fdDragIndex.value = -1
}
// 解析 formConfig(打开设计器时)→ formFields
function parseFormFields() {
  try {
    const fields = JSON.parse(editingProcess.formConfig || '[]')
    formFields.value = (Array.isArray(fields) ? fields : []).map((f: any) => ({
      ...f,
      field: f.field || genFieldKey(),
      label: f.label || f.field || '字段',
      type: f.type || 'text',
      required: !!f.required,
      options: Array.isArray(f.options) ? f.options : undefined,
      _optionsText: Array.isArray(f.options) ? f.options.join(',') : ''
    }))
  } catch {
    formFields.value = []
  }
}
// formFields 变化 → 实时写回 formConfig(条件分支、保存都读它);保留原有未知键不丢失
watch(formFields, () => {
  editingProcess.formConfig = JSON.stringify(formFields.value.map((f: any) => {
    const { _optionsText, ...rest } = f
    const o: any = { ...rest, field: f.field, label: f.label, type: f.type }
    if (f.required) o.required = true; else delete o.required
    if (f.type === 'select' || f.type === 'multiselect') o.options = f.options || []; else delete o.options
    return o
  }))
}, { deep: true })

function saveNodeConfig() {
  if (!editingNode.value) return
  const n: any = { ...editingNode.value }
  if (n.type === 'condition') {
    // 每个条件分支都必须指定目标节点,否则后端路由不到会把整单"静默自动通过"
    if ((n.conditions || []).some((c: any) => !c.nextNode)) {
      ElMessage.error('每个条件分支都必须选择"目标节点"')
      return
    }
  }
  if (n.type === 'approval') {
    if (!n.signMode || n.signMode === 'single') {
      // 单人模式:清掉会签/或签标记(引擎按或签逐个建任务)
      n.signMode = undefined
      if (n.assigneeType === 'user') {
        // "指定人员"支持多选:所选人已在 specifyUserIds 写入 assignees[](assigneeType=user)
        if (!n.assignees || !n.assignees.length) {
          ElMessage.error('请至少选择一名指定人员')
          return
        }
        // 清掉旧单值字段,避免与多选 assignees 冲突(后端优先读 assignees)
        n.assigneeValue = undefined
      } else {
        // 直属上级/部门主管/指定角色:仍走单 assigneeType/Value,清掉多人配置
        n.assignees = undefined
      }
    } else if (!n.assignees || !n.assignees.length) {
      ElMessage.error('请至少选择一名多人审批的审批人')
      return
    }
  }
  if (n.type === 'cc') {
    n.ccTargets = normalizeCcTargets(n.ccTargets)
    if (!n.ccTargets.length) {
      ElMessage.error('请至少选择一个抄送对象')
      return
    }
  }
  const idx = designerNodes.value.findIndex(x => x.id === n.id)
  if (idx >= 0) {
    designerNodes.value[idx] = n
  }
  nodeDialogVisible.value = false
}

function getAssigneeLabel(node: DesignerNode) {
  if (node.assignees && node.assignees.length) {
    const names = node.assignees.map(a => {
      const u = userOptions.value.find(x => String(x.id) === String(a.assigneeValue))
      return u ? u.name : a.assigneeValue
    }).join('、')
    // 会签/或签显示对应前缀;单人模式下的"指定人员"多选显示"指定人员"
    const prefix = node.signMode === 'and' ? '会签'
      : node.signMode === 'or' ? '或签'
      : t('workflow.specifyUser')
    return prefix + ': ' + names
  }
  if (node.assigneeType === 'supervisor') return '直属上级'
  if (node.assigneeType === 'user') {
    const u = userOptions.value.find(x => String(x.id) === String(node.assigneeValue))
    return t('workflow.specifyUser') + ': ' + (u ? u.name : (node.assigneeValue || '未指定'))
  }
  if (node.assigneeType === 'role') {
    const r = roleOptions.value.find(x => x.roleKey === node.assigneeValue)
    return t('workflow.specifyRole') + ': ' + (r ? r.roleName : (node.assigneeValue || '未指定'))
  }
  if (node.assigneeType === 'supervisor') return '直属上级'
  if (node.assigneeType === 'dept_leader' || node.assigneeType === 'dept_manager') return '部门主管'
  return ''
}

function nodeTypeLabel(type: string, node?: DesignerNode) {
  if (type === 'start') return '提交'
  if (type === 'approval' && node?.signMode && node.signMode !== 'single') return '并行审批'
  if (type === 'approval') return '审批'
  if (type === 'condition') return '条件分支'
  if (type === 'cc') return '抄送'
  if (type === 'end') return '结束'
  return type || '节点'
}

function nodeMetaLabel(node: DesignerNode) {
  if (node.type === 'start') return '提交人：按基础设计权限发起'
  if (node.type === 'approval') return getAssigneeLabel(node) || '请设置审批人'
  if (node.type === 'condition') return `${node.conditions?.length || 0} 个条件，点击配置分支`
  if (node.type === 'cc') return ccTargetText(node.ccTargets) || '请设置抄送人'
  if (node.type === 'end') return '审批完成后执行抄送与归档'
  return ''
}

function buildProcessConfig() {
  const nodes = designerNodes.value.map(node => ({
    ...node,
    assignees: node.assignees ? node.assignees.map(item => ({ ...item })) : undefined,
    conditions: node.conditions ? node.conditions.map(item => ({ ...item })) : undefined,
    ccTargets: node.ccTargets ? normalizeCcTargets(node.ccTargets) : undefined
  }))
  const validIds = new Set(nodes.map(n => n.id))
  const edges: Array<{ from: string; to: string }> = []
  for (let i = 0; i < nodes.length - 1; i++) {
    // 只保留指向真实存在节点的条件边;一条都没有则退回默认顺序边,避免条件节点没出边导致后端静默结束
    const condEdges = (nodes[i].type === 'condition' && nodes[i].conditions)
      ? nodes[i].conditions!.filter(c => c.nextNode && validIds.has(c.nextNode))
      : []
    if (condEdges.length > 0) {
      for (const cond of condEdges) {
        edges.push({ from: nodes[i].id, to: cond.nextNode })
      }
      // 默认顺序边:所有条件都不满足时走顺序下一节点(引擎按"目标不属于任何条件分支的出边"识别默认路径)
      const seqNextId = nodes[i + 1].id
      if (!condEdges.some(c => c.nextNode === seqNextId)) {
        edges.push({ from: nodes[i].id, to: seqNextId })
      }
    } else {
      edges.push({ from: nodes[i].id, to: nodes[i + 1].id })
    }
  }
  const cc = mergeCcTargets([
    ...ccTargetsFromSettings(),
    ...ccTargetsFromNodes(nodes)
  ])
  return JSON.stringify({ nodes, edges, cc, settings: { ...processSettings } })
}

async function saveProcess() {
  // 节点名称不能重复:引擎按节点名分组判断会签/或签,同名会互相串扰
  const names = designerNodes.value.map(n => n.name)
  const dupName = names.find((nm, i) => names.indexOf(nm) !== i)
  if (dupName) {
    ElMessage.error(`节点名称不能重复:「${dupName}」,请改成不同名称`)
    return
  }
  editingProcess.processConfig = buildProcessConfig()
  try {
    if (editingProcess.id) {
      await processApi.update(editingProcess)
    } else {
      await processApi.create(editingProcess)
    }
    ElMessage.success(t('common.success'))
    closeDesigner()
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || t('common.failed'))
  }
}

async function handlePublish(row: ProcessDef) {
  await ElMessageBox.confirm(t('workflow.confirmPublish'), t('common.confirm'))
  try {
    await processApi.publish(row.id)
    ElMessage.success(t('common.success'))
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || t('common.failed'))
  }
}

async function handleDisable(row: ProcessDef) {
  await ElMessageBox.confirm(t('workflow.confirmDisable'), t('common.confirm'))
  try {
    await processApi.disable(row.id)
    ElMessage.success(t('common.success'))
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || t('common.failed'))
  }
}

async function handleDelete(row: ProcessDef) {
  await ElMessageBox.confirm(`确定删除流程「${row.name}」吗?(可在数据库恢复,但前台不再显示)`, t('common.confirm'), { type: 'warning' })
  try {
    await processApi.remove(row.id)
    ElMessage.success(t('common.success'))
    loadList()
  } catch (e: any) {
    ElMessage.error(e.message || t('common.failed'))
  }
}
</script>

<style scoped>
.workflow-designer {
  color: #1f2937;
  background: #f5f7fb;
  min-height: 720px;
  padding: 16px;
}

.flow-list,
.workflow-builder {
  display: grid;
  gap: 14px;
}

.flow-list-hero,
.builder-topbar,
.flow-search-panel,
.flow-template-panel,
.flow-table-panel,
.builder-panel {
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
}

.flow-list-hero {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
}

.flow-eyebrow {
  color: #3370ff;
  font-size: 12px;
  font-weight: 700;
}

.flow-list-hero h2,
.panel-heading h3,
.section-title h3,
.builder-title h3 {
  margin: 0;
  color: #101828;
  font-weight: 700;
}

.flow-list-hero h2 {
  margin-top: 6px;
  font-size: 24px;
}

.flow-list-hero p,
.section-title p,
.panel-heading p,
.builder-title p {
  margin: 6px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.7;
}

.flow-stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.flow-stat-card {
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  padding: 16px 18px;
}

.flow-stat-card span {
  display: block;
  color: #667085;
  font-size: 13px;
}

.flow-stat-card strong {
  display: block;
  margin-top: 6px;
  color: #101828;
  font-size: 26px;
  line-height: 1;
}

.flow-search-panel {
  display: grid;
  grid-template-columns: minmax(220px, 1.1fr) minmax(150px, .7fr) minmax(130px, .6fr) auto auto;
  gap: 10px;
  padding: 14px;
}

.flow-template-panel,
.flow-table-panel,
.builder-panel {
  padding: 18px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.template-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 78px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  text-align: left;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s, transform .2s;
}

.template-card:hover {
  border-color: #3370ff;
  box-shadow: 0 8px 20px rgba(51, 112, 255, .12);
  transform: translateY(-1px);
}

.template-card__icon,
.process-icon,
.process-icon-preview {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #3370ff;
  background: #edf4ff;
  border-radius: 8px;
  width: 42px;
  height: 42px;
  flex: none;
}

.template-card__body {
  display: grid;
  gap: 4px;
}

.template-card__body b,
.process-name-cell b {
  color: #101828;
  font-size: 14px;
}

.template-card__body small,
.process-name-cell small {
  color: #98a2b3;
  font-size: 12px;
}

.process-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.process-name-cell > div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.flow-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #475467;
  font-weight: 600;
}

.builder-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
}

.builder-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.builder-back {
  width: 36px;
  height: 36px;
}

.builder-actions {
  display: flex;
  gap: 10px;
}

.builder-steps {
  display: flex;
  justify-content: center;
  gap: 28px;
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  padding: 14px 18px;
}

.builder-steps button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #475467;
  background: transparent;
  border: 0;
  border-bottom: 2px solid transparent;
  padding: 8px 8px 12px;
  cursor: pointer;
}

.builder-steps button span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: 1px solid #98a2b3;
  border-radius: 50%;
  font-size: 13px;
}

.builder-steps button.active {
  color: #0f56b3;
  border-bottom-color: #3370ff;
}

.builder-steps button.active span {
  color: #fff;
  background: #1f5fbf;
  border-color: #1f5fbf;
}

.panel-heading {
  margin-bottom: 18px;
}

.basic-form {
  max-width: 720px;
}

.process-icon-editor {
  display: flex;
  align-items: center;
  gap: 14px;
}

.process-icon-preview {
  width: 52px;
  height: 52px;
  color: #fff;
  background: #1f5fbf;
  border-radius: 50%;
  font-size: 22px;
}

.form-builder-grid {
  display: grid;
  grid-template-columns: 260px minmax(320px, 1fr) 360px;
  gap: 14px;
  min-height: 560px;
}

.component-palette,
.field-editor,
.node-palette,
.flow-summary,
.settings-block {
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
}
.settings-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.preview-phone {
  max-width: 360px;
  margin: 0 auto;
  border: 1px solid var(--el-border-color);
  border-radius: 14px;
  padding: 16px 14px;
  background: var(--el-bg-color-page);
}
.preview-phone__title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 14px;
  text-align: center;
}

.component-palette,
.field-editor,
.node-palette,
.flow-summary {
  padding: 14px;
}

.palette-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-bottom: 1px solid #e7ecf5;
  margin: -14px -14px 14px;
}

.palette-tabs span {
  text-align: center;
  color: #667085;
  padding: 12px 8px;
}

.palette-tabs .active {
  color: #3370ff;
  border-bottom: 2px solid #3370ff;
  font-weight: 700;
}

.palette-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
}

.palette-section h4,
.node-palette h4,
.flow-summary h4,
.settings-block h4,
.editor-title h4 {
  grid-column: 1 / -1;
  margin: 0 0 4px;
  color: #344054;
  font-size: 14px;
}

.control-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  color: #344054;
  background: #f8fafc;
  border: 1px solid #dce3ee;
  border-radius: 6px;
  padding: 8px 10px;
  cursor: pointer;
}

.control-chip:hover {
  color: #3370ff;
  border-color: #3370ff;
  background: #f4f8ff;
}

.phone-preview-wrap {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #eef2f7;
  border: 1px solid #e0e6ef;
  border-radius: 8px;
  padding: 28px;
}

.phone-preview {
  width: 312px;
  min-height: 520px;
  background: #fff;
  border: 10px solid #d9dee8;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 18px 42px rgba(16, 24, 40, .12);
}

.phone-title {
  text-align: center;
  color: #101828;
  border-bottom: 1px solid #e7ecf5;
  padding: 13px 12px;
  font-weight: 700;
}

.preview-fields {
  display: grid;
}

.preview-field {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  min-height: 48px;
  align-items: center;
  padding: 12px 14px;
  border-bottom: 1px solid #eef2f7;
}

.preview-field label {
  color: #344054;
  font-size: 13px;
}

.preview-field em {
  color: #f04438;
  font-style: normal;
}

.preview-field span,
.preview-empty {
  color: #98a2b3;
  font-size: 13px;
}

.preview-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
}

.editor-title {
  margin-bottom: 12px;
}

.editor-title small {
  color: #98a2b3;
}

.fd-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.fd-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  background: #fff;
}

.fd-item--drag {
  opacity: .55;
  border-style: dashed;
  border-color: #3370ff;
}

.fd-drag {
  cursor: move;
  color: #98a2b3;
  margin-top: 7px;
}

.fd-main {
  display: grid;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.fd-subline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.flow-builder-grid {
  display: grid;
  grid-template-columns: 240px minmax(360px, 1fr) 260px;
  gap: 14px;
  min-height: 560px;
}

.node-palette {
  display: grid;
  align-content: start;
  gap: 10px;
}

.node-tool {
  display: grid;
  grid-template-columns: 36px 1fr;
  align-items: center;
  gap: 10px;
  width: 100%;
  text-align: left;
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
}

.node-tool span {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
}

.node-tool b,
.flow-node__body strong {
  display: block;
  color: #101828;
  font-size: 14px;
}

.node-tool small {
  display: block;
  color: #98a2b3;
  margin-top: 3px;
}

.node-tool.approval span {
  color: #b95e00;
  background: #fff4e5;
}

.node-tool.condition span {
  color: #00856f;
  background: #e7f8f4;
}

.node-tool.cc span {
  color: #4f46e5;
  background: #eef2ff;
}

.node-tool.parallel span {
  color: #8a4b00;
  background: #fff7e6;
}

.flow-designer {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f8fafc;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  padding: 28px;
  overflow-x: auto;
}

.flow-designer__canvas {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}

.flow-node-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.flow-node {
  width: 260px;
  overflow: hidden;
  cursor: pointer;
  background: #fff;
  border: 1px solid #e7ecf5;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(16, 24, 40, .08);
  transition: box-shadow .2s, transform .2s;
}

.flow-node:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 26px rgba(16, 24, 40, .12);
}

.flow-node__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #fff;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 600;
}

.flow-node--start .flow-node__header { background: #2e7d32; }
.flow-node--end .flow-node__header { background: #475467; }
.flow-node--approval .flow-node__header { background: #a65f00; }
.flow-node--condition .flow-node__header { background: #00856f; }
.flow-node--cc .flow-node__header { background: #4f46e5; }
.flow-node--parallel .flow-node__header { background: #8a4b00; }

.flow-node__delete {
  cursor: pointer;
  opacity: .85;
}

.flow-node__delete:hover {
  opacity: 1;
}

.flow-node__body {
  display: grid;
  gap: 8px;
  min-height: 62px;
  padding: 12px;
}

.flow-node__body span {
  color: #667085;
  overflow-wrap: anywhere;
  font-size: 13px;
  line-height: 1.5;
}

.cc-node-tip {
  margin-bottom: 12px;
}

.cc-node-editor {
  display: grid;
  width: 100%;
  gap: 10px;
}

.flow-add-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
}

.flow-line {
  width: 2px;
  height: 18px;
  background: #cfd6e2;
}

.flow-add-btn__trigger {
  z-index: 1;
}

.flow-summary {
  display: grid;
  gap: 12px;
  align-content: start;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  color: #667085;
  background: #f8fafc;
  border-radius: 6px;
  padding: 10px 12px;
}

.summary-row b {
  color: #101828;
}

.settings-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.settings-block {
  padding: 16px;
}

.setting-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 36px;
  color: #344054;
  font-size: 14px;
  line-height: 1.6;
}

.setting-line :deep(.el-input-number) {
  width: 92px;
}

.settings-radio-stack {
  display: grid;
  gap: 12px;
}

.condition-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.cond-hint,
.cond-label {
  color: #667085;
  font-size: 13px;
  line-height: 1.6;
}

.cond-hint {
  margin-bottom: 10px;
}

.cond-label {
  margin-right: 6px;
}

.assignee-multi-hint {
  margin-top: 6px;
  color: #98a2b3;
  font-size: 12px;
  line-height: 1.6;
}

@media (max-width: 1180px) {
  .form-builder-grid,
  .flow-builder-grid,
  .settings-layout {
    grid-template-columns: 1fr;
  }

  .flow-search-panel {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .workflow-designer {
    padding: 10px;
  }

  .flow-list-hero,
  .builder-topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .flow-stat-grid,
  .flow-search-panel,
  .builder-steps {
    grid-template-columns: 1fr;
    display: grid;
  }

  .builder-steps {
    gap: 8px;
  }
}
</style>

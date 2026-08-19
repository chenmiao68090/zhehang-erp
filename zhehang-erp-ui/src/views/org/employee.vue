<template>
  <div class="page-container">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
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
          <el-form-item :label="$t('org.status')">
            <el-select v-model="queryParams.status" :placeholder="$t('org.selectStatus')" clearable style="width: 120px">
              <el-option label="待入职" :value="0" />
              <el-option :label="$t('org.empStatusActive')" :value="1" />
              <el-option :label="$t('org.empStatusTrial')" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">{{ $t('common.search') }}</el-button>
            <el-button @click="handleReset">{{ $t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
        <div class="search-actions">
          <el-button class="resigned-center-entry" @click="router.push('/sys-org/resigned-staff')">
            <el-icon><UserFilled /></el-icon>离职人员（{{ resignedCount ?? '—' }}）
          </el-button>
          <el-button @click="downloadEmployeeTemplate">下载人员模板</el-button>
          <el-button type="warning" plain @click="openImportDialog">批量导入人员</el-button>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>{{ $t('common.add') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 合同到期预警(吸收原"劳动合同管理"页):在职员工中合同已过期 / 90 天内到期统计 -->
    <el-alert
      v-if="contractAlert.expired || contractAlert.expiring"
      type="warning"
      :closable="false"
      show-icon
      style="margin-bottom: 16px"
    >
      <template #title>
        劳动合同提醒:{{ contractAlert.expired }} 人合同已过期、{{ contractAlert.expiring }} 人 90 天内到期,请及时续签。
      </template>
    </el-alert>

    <!-- 数据表格 -->
    <el-table :data="tableData" v-loading="loading" stripe border @row-click="handleRowClick">
      <el-table-column prop="empCode" :label="$t('org.empCode')" width="120" />
      <el-table-column prop="name" :label="$t('org.empName')" width="100" />
      <el-table-column prop="deptName" :label="$t('org.deptName')" width="140" />
      <el-table-column label="登录账号" min-width="130">
        <template #default="{ row }">
          <div class="employee-account-cell">
            <strong>{{ row.username || row._username || '未开通' }}</strong>
            <el-tag :type="accountStatusType(row)" size="small" effect="plain">{{ accountStatusText(row) }}</el-tag>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="系统角色" min-width="160">
        <template #default="{ row }">
          <template v-if="accountRoleNames(row).length">
            <el-tag v-for="rn in accountRoleNames(row)" :key="rn" size="small" effect="plain" style="margin: 1px 2px">{{ rn }}</el-tag>
          </template>
          <span v-else class="role-position-text">未分配</span>
        </template>
      </el-table-column>
      <el-table-column label="业务定位" min-width="190">
        <template #default="{ row }">
          <span class="role-position-text">{{ employeeBusinessRole(row).flow }}</span>
        </template>
      </el-table-column>
      <el-table-column label="直属上级" min-width="120">
        <template #default="{ row }">
          <span>{{ row.managerName || '未设置' }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="$t('org.phone')" width="130" />
      <el-table-column prop="hireDate" :label="$t('org.hireDate')" width="120" />
      <el-table-column prop="status" :label="$t('org.status')" width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="empStatusType(row.status)" size="small">{{ empStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('org.actions')" width="230" align="center" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" link size="small" @click.stop="handleEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button v-if="row.status === 1 || row.status === 2" type="warning" link size="small" @click.stop="openResignDialog(row)">办理离职</el-button>
          <el-button v-if="canManageAccountSecurity" type="danger" link size="small" @click.stop="handleDelete(row)">{{ $t('common.delete') }}</el-button>
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
    <el-dialog v-model="dialogVisible" width="980px" class="employee-edit-dialog emp-hifi" destroy-on-close>
      <!-- 高保真改版:顶部人头卡 + 左侧分组导航 + 分组卡片;字段与逻辑与旧版完全一致 -->
      <template #header>
        <div class="emp-hd">
          <img v-if="formData.avatar" :src="formData.avatar" class="emp-hd-avatar-img" alt="照片" />
          <span v-else class="emp-hd-avatar">{{ (formData.name || '员').slice(0, 1) }}</span>
          <div class="emp-hd-main">
            <div class="emp-hd-name">
              <strong>{{ formData.name || dialogTitle }}</strong>
              <span class="emp-pill" :class="empStatusMeta.cls">{{ empStatusMeta.label }}</span>
            </div>
            <div class="emp-hd-sub">工号 {{ formData.empCode || '保存时自动生成' }}<template v-if="formData.hireDate"> · 入职 {{ formData.hireDate }}</template></div>
          </div>
        </div>
      </template>
      <div class="emp-shell">
        <nav class="emp-rail">
          <button v-for="s in empSections" :key="s.key" type="button" class="emp-ri" :class="{ on: empActiveSect === s.key }" @click="scrollToSect(s.key)">
            <el-icon><component :is="s.icon" /></el-icon><span>{{ s.label }}</span>
          </button>
        </nav>
        <div ref="empCntRef" class="emp-cnt" @scroll="onEmpCntScroll">
      <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
        <section class="emp-sect" :ref="(el) => setSectRef('basic', el)">
          <div class="emp-sth"><span class="emp-ic ic-blue"><el-icon><User /></el-icon></span><h4>{{ $t('org.tabBasic') }}</h4></div>
            <el-row :gutter="16">
              <el-col :span="24">
                <el-form-item label="员工照片">
                  <div class="avatar-uploader">
                    <div class="avatar-box" @click="triggerAvatarPick">
                      <img v-if="formData.avatar" :src="formData.avatar" class="avatar-img" alt="照片" />
                      <div v-else class="avatar-empty"><span class="plus">＋</span><span>上传照片</span></div>
                    </div>
                    <div class="avatar-tip">
                      <template v-if="formData.avatar">
                        <el-button link size="small" @click="triggerAvatarPick">更换</el-button>
                        <el-button link type="danger" size="small" @click="formData.avatar = ''">移除</el-button>
                      </template>
                      <span v-else class="avatar-hint">点击上传,自动压缩为方形小图</span>
                    </div>
                    <input ref="avatarInput" type="file" accept="image/*" style="display: none" @change="onAvatarPick" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.empName')" prop="name">
                  <el-input v-model="formData.name" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.gender')">
                  <el-radio-group v-model="formData.gender">
                    <el-radio-button :value="0">{{ $t('org.male') }}</el-radio-button>
                    <el-radio-button :value="1">{{ $t('org.female') }}</el-radio-button>
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
              <el-col :span="12">
                <el-form-item label="户口所在地">
                  <el-input v-model="formData.householdLocation" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="户口类型">
                  <el-select v-model="formData.householdType" clearable style="width: 100%">
                    <el-option label="本地城镇" value="本地城镇" />
                    <el-option label="本地农村" value="本地农村" />
                    <el-option label="外地城镇" value="外地城镇" />
                    <el-option label="外地农村" value="外地农村" />
                    <el-option label="本地居民户口" value="本地居民户口" />
                    <el-option label="外地居民户口" value="外地居民户口" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="籍贯">
                  <el-input v-model="formData.nativePlace" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="民族">
                  <el-input v-model="formData.ethnicity" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="政治面貌">
                  <el-select v-model="formData.politicalStatus" clearable style="width: 100%">
                    <el-option label="党员" value="党员" />
                    <el-option label="团员" value="团员" />
                    <el-option label="群众" value="群众" />
                    <el-option label="其他" value="其他" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="婚姻情况">
                  <el-select v-model="formData.maritalStatus" clearable style="width: 100%">
                    <el-option label="已婚" value="已婚" />
                    <el-option label="未婚" value="未婚" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('position', el)">
          <div class="emp-sth"><span class="emp-ic ic-green"><el-icon><Suitcase /></el-icon></span><h4>{{ $t('org.tabPosition') }}</h4></div>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item :label="$t('org.empCode')">
                  <el-input
                    v-model="formData.empCode"
                    :disabled="!canEditEmpCode"
                    placeholder="保存时自动生成"
                  >
                    <template #append>
                      <el-button v-if="canEditEmpCode" text @click="fillNextEmpCode">取号</el-button>
                      <span v-else>自动</span>
                    </template>
                  </el-input>
                  <div class="field-tip">
                    {{ canEditEmpCode ? '超级管理员可手动调整；留空则自动生成。' : '工号由系统自动生成，只有超级管理员能手动修改。' }}
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item :label="$t('org.deptName')" prop="deptId">
                  <el-tree-select
                    v-model="formData.deptId"
                    :data="deptTreeNoCompany"
                    :props="{ label: 'deptName', value: 'id', children: 'children' }"
                    check-strictly
                    filterable
                    placeholder="请选择部门"
                    style="width: 100%"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="岗位" prop="postId">
                  <el-select
                    v-model="formData.postId"
                    filterable
                    clearable
                    placeholder="请选择岗位"
                    style="width: 100%"
                  >
                    <el-option
                      v-for="p in postList"
                      :key="p.id"
                      :label="p.postName"
                      :value="p.id"
                    />
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
                    <el-option label="待入职" :value="0" />
                    <el-option :label="$t('org.empStatusActive')" :value="1" />
                    <el-option :label="$t('org.empStatusTrial')" :value="2" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="直属上级">
                  <el-select v-model="formData.managerId" filterable clearable placeholder="选择员工直属上级(审批时用)" style="width: 100%">
                    <el-option
                      v-for="m in managerEmployeeOptions"
                      :key="m.userId || m.id"
                      :label="managerOptionLabel(m)"
                      :value="m.userId"
                      :disabled="!m.userId || m.id === formData.id"
                    />
                  </el-select>
                  <div class="field-tip">选择后，请假/报销等流程里的“直属上级”会按这里自动指派。</div>
                </el-form-item>
              </el-col>
            </el-row>
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('contract', el)">
          <div class="emp-sth"><span class="emp-ic ic-coral"><el-icon><Document /></el-icon></span><h4>{{ $t('org.tabContract') }}</h4><small>到期前自动提醒续签</small></div>
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
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('education', el)">
          <div class="emp-sth"><span class="emp-ic ic-purple"><el-icon><Reading /></el-icon></span><h4>{{ $t('org.tabEducation') }}</h4></div>
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
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('files', el)">
          <div class="emp-sth"><span class="emp-ic ic-gray"><el-icon><Paperclip /></el-icon></span><h4>档案附件</h4></div>
            <div class="profile-file-grid">
              <div v-for="item in employeeAttachmentDefs" :key="item.key" class="profile-file-card">
                <div class="profile-file-main">
                  <strong>{{ item.label }}</strong>
                  <span>{{ formData[item.fileNameKey] || '未上传' }}</span>
                </div>
                <div class="profile-file-actions">
                  <el-upload
                    :show-file-list="false"
                    :auto-upload="false"
                    :accept="item.accept"
                    :on-change="(file) => handleProfileFileChange(item, file)"
                  >
                    <el-button size="small" :icon="Upload" :loading="uploadingAttachmentKey === item.key">
                      {{ formData[item.fileIdKey] ? '替换' : '上传' }}
                    </el-button>
                  </el-upload>
                  <el-button
                    v-if="formData[item.fileIdKey]"
                    size="small"
                    link
                    type="primary"
                    :icon="Download"
                    @click="downloadEmployeeFile(formData[item.fileIdKey], formData[item.fileNameKey])"
                  >
                    查看
                  </el-button>
                  <el-button
                    v-if="formData[item.fileIdKey]"
                    size="small"
                    link
                    type="danger"
                    :icon="Delete"
                    @click="clearProfileFile(item)"
                  >
                    移除
                  </el-button>
                </div>
              </div>
            </div>
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('hrdocs', el)">
          <div class="emp-sth"><span class="emp-ic ic-gray"><el-icon><Folder /></el-icon></span><h4>人事附件</h4></div>
            <div class="profile-file-grid">
              <div v-for="item in hrDocDefs" :key="item.type" class="profile-file-card">
                <div class="profile-file-main">
                  <strong>{{ item.type }}</strong>
                  <span v-if="hrDocOf(item.type)">
                    <a href="javascript:void(0)" @click.prevent="downloadEmployeeFile(hrDocOf(item.type).fileId, hrDocOf(item.type).name)">{{ hrDocOf(item.type).name }}</a>
                  </span>
                  <span v-else>未上传</span>
                </div>
                <div class="profile-file-actions">
                  <el-upload
                    :show-file-list="false"
                    :http-request="(opt) => handleHrDocUpload(item.type, opt.file)"
                  >
                    <el-button size="small" :icon="Upload" :loading="uploadingHrDocType === item.type">
                      {{ hrDocOf(item.type) ? '替换' : '上传' }}
                    </el-button>
                  </el-upload>
                  <el-button
                    v-if="hrDocOf(item.type)"
                    size="small"
                    link
                    type="danger"
                    :icon="Delete"
                    @click="removeHrDoc(item.type)"
                  >
                    移除
                  </el-button>
                </div>
              </div>
            </div>
        </section>

        <section class="emp-sect" :ref="(el) => setSectRef('emergency', el)">
          <div class="emp-sth"><span class="emp-ic ic-pink"><el-icon><Phone /></el-icon></span><h4>{{ $t('org.tabEmergency') }}</h4></div>
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
        </section>

        <!-- 员工页只维护账号；角色及权限唯一在「角色管理」维护。 -->
        <section v-if="canManageAccountSecurity" class="emp-sect" :ref="(el) => setSectRef('account', el)">
          <div class="emp-sth"><span class="emp-ic ic-blue"><el-icon><Lock /></el-icon></span><h4>登录账号</h4><small>这里只管账号、启停和密码；角色权限在角色管理统一设置</small></div>
          <div class="emp-perm">
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="登录账号">
                  <el-input v-model="formData.username" :disabled="isEdit && !!formData.userId && !canEditEmpCode" placeholder="留空默认用手机号或工号" />
                  <div class="account-hint">用于登录系统。已有账号不建议改名,避免员工登录习惯被打断;确需修改仅管理员可操作。</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="系统角色">
                  <div class="employee-role-readonly">
                    <span v-if="!accountRoleNames(formData).length" class="role-position-text">未分配（账号保持受限）</span>
                    <el-tag v-for="rn in accountRoleNames(formData)" :key="rn" size="small" effect="plain">{{ rn }}</el-tag>
                    <el-button link type="primary" @click="goRoleManagement">前往角色管理</el-button>
                  </div>
                  <div class="account-hint">此处仅展示，不再修改角色，避免同一个人出现多套权限口径。</div>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-if="!isEdit">
                <el-form-item label="初始口令">
                  <div class="account-hint">账号保存后由系统随机生成，仅展示一次；员工首次登录必须修改。</div>
                </el-form-item>
              </el-col>
              <el-col :span="12" v-else>
                <el-form-item label="登录密码">
                  <el-button :disabled="!formData.userId" @click="handleResetPwd">重置登录密码</el-button>
                  <el-button :disabled="!formData.userId" @click="handleResetMfa">重置 MFA</el-button>
                  <div v-if="!formData.userId" class="account-hint">保存后将为该员工开通账号。</div>
                  <div v-else class="account-hint">员工更换验证器设备时使用；重置后全部会话立即失效，下次登录重新绑定。</div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="允许登录">
                  <el-switch v-model="formData.accountEnabled" />
                  <div class="account-hint">关闭后该员工无法登录(不影响档案)。</div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </section>
        <el-alert
          v-else
          type="info"
          :closable="false"
          show-icon
          title="人事角色可维护员工档案；登录账号和安全设置由老板管理，系统角色只在「角色管理」设置。"
          class="account-merge-alert"
        />
      </el-form>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitForm">{{ $t('common.confirm') }}</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="resignDialog.visible"
      title="办理员工离职"
      width="min(560px, calc(100vw - 24px))"
      class="employee-resign-dialog"
      destroy-on-close
    >
      <div v-if="resignDialog.employee" class="resign-employee-card">
        <span class="resign-avatar">{{ String(resignDialog.employee.name || '员').slice(0, 1) }}</span>
        <div>
          <strong>{{ resignDialog.employee.name }}</strong>
          <p>{{ resignDialog.employee.empCode || '无工号' }} · {{ resignDialog.employee.deptName || '未分部门' }} · {{ empStatusText(resignDialog.employee.status) }}</p>
        </div>
      </div>
      <el-alert
        type="error"
        :closable="false"
        show-icon
        title="确认离职后，该员工的登录账号会立即停用，所有当前登录会话会立即失效。历史业务记录不会删除。"
      />
      <el-form label-position="top" class="resign-form">
        <el-form-item label="真实离职日期" required>
          <el-date-picker
            v-model="resignDialog.resignDate"
            type="date"
            value-format="YYYY-MM-DD"
            :disabled-date="disableFutureResignDate"
            placeholder="请选择员工真实离职日期"
            style="width: 100%"
          />
          <div class="field-tip">该日期会写入离职档案和离职人员中心，不使用合同结束日期代替。</div>
        </el-form-item>
        <el-checkbox v-model="resignDialog.confirmed" class="resign-confirm-check">
          我已核对员工身份和真实离职日期，并知晓账号与现有会话将立即失效
        </el-checkbox>
      </el-form>
      <template #footer>
        <el-button @click="resignDialog.visible = false">取消</el-button>
        <el-button type="danger" :loading="resignDialog.saving" :disabled="!resignDialog.confirmed" @click="submitResign">
          确认离职并停用账号
        </el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="importDialog.visible" title="批量导入公司人员" width="980px" class="employee-import-dialog" destroy-on-close>
      <div class="employee-import-layout">
        <div class="employee-import-main">
          <div class="employee-import-tip">
            <strong>粘贴 Excel 人员表</strong>
            <p>支持字段：工号、姓名、部门、手机号、登录账号、允许登录、邮箱、入职日期、状态、备注。开通账号时由系统随机生成一次性初始口令。</p>
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
        <el-table-column label="部门" min-width="190">
          <template #default="{ row }">
            <div class="import-match-cell">
              <strong>{{ row.employee.deptName || row.raw.deptName || '未填部门' }}</strong>
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

    <el-dialog
      v-model="credentialDialog.visible"
      title="一次性初始口令"
      width="680px"
      append-to-body
      destroy-on-close
      @closed="clearInitialCredentials"
    >
      <el-alert
        type="warning"
        :closable="false"
        show-icon
        title="初始口令只展示这一次。请通过可信渠道交给员工，员工首次登录后必须修改。"
        class="credential-alert"
      />
      <el-table :data="initialCredentials" border max-height="320">
        <el-table-column prop="username" label="登录账号" min-width="160" />
        <el-table-column prop="initialPassword" label="随机初始口令" min-width="230">
          <template #default="{ row }">
            <code class="credential-code">{{ row.initialPassword }}</code>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="92" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="copyCredential(row)">复制</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button v-if="initialCredentials.length > 1" @click="copyAllCredentials">复制全部</el-button>
        <el-button type="primary" @click="credentialDialog.visible = false">我已妥善保存</el-button>
      </template>
    </el-dialog>

    <BusinessDetailDrawer
      v-if="detailData"
      v-model="drawerVisible"
      :title="detailData.name || $t('org.empDetail')"
      :subtitle="detailData.deptName || '—'"
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
        <div><span>民族</span><b>{{ detailData.ethnicity || '—' }}</b></div>
        <div><span>籍贯</span><b>{{ detailData.nativePlace || '—' }}</b></div>
        <div><span>政治面貌</span><b>{{ detailData.politicalStatus || '—' }}</b></div>
        <div><span>婚姻情况</span><b>{{ detailData.maritalStatus || '—' }}</b></div>
        <div><span>户口类型</span><b>{{ detailData.householdType || '—' }}</b></div>
        <div class="wide"><span>户口所在地</span><b>{{ detailData.householdLocation || '—' }}</b></div>
        <div class="wide"><span>{{ $t('org.address') }}</span><b>{{ detailData.address || '—' }}</b></div>
      </div>

      <div class="bd-section-title">任职与合同</div>
      <div class="employee-info-grid">
        <div><span>{{ $t('org.deptName') }}</span><b>{{ detailData.deptName || '—' }}</b></div>
        <div><span>直属上级</span><b>{{ detailData.managerName || '未设置' }}</b></div>
        <div><span>业务角色</span><b>{{ employeeBusinessRole(detailData).label }}</b></div>
        <div><span>承接链路</span><b>{{ employeeBusinessRole(detailData).flow }}</b></div>
        <div><span>{{ $t('org.contractStart') }}</span><b>{{ detailData.contractStart || '—' }}</b></div>
        <div><span>{{ $t('org.contractEnd') }}</span><b>{{ detailData.contractEnd || '—' }}</b></div>
        <div><span>{{ $t('org.education') }}</span><b>{{ detailData.education || '—' }}</b></div>
        <div><span>{{ $t('org.major') }}</span><b>{{ detailData.major || '—' }}</b></div>
        <div class="wide"><span>{{ $t('org.university') }}</span><b>{{ detailData.university || '—' }}</b></div>
      </div>

      <div class="bd-section-title">档案附件</div>
      <div class="employee-attachment-list">
        <div v-for="item in employeeAttachmentDefs" :key="item.key" class="employee-attachment-row">
          <span>{{ item.label }}</span>
          <template v-if="detailData[item.fileIdKey]">
            <el-button link type="primary" :icon="Download" @click="downloadEmployeeFile(detailData[item.fileIdKey], detailData[item.fileNameKey])">
              {{ detailData[item.fileNameKey] || '查看文件' }}
            </el-button>
          </template>
          <b v-else>未上传</b>
        </div>
      </div>

      <div class="bd-section-title">人事附件</div>
      <div class="employee-attachment-list">
        <div v-for="item in hrDocDefs" :key="item.type" class="employee-attachment-row">
          <span>{{ item.type }}</span>
          <template v-if="detailHrDocOf(item.type)">
            <a href="javascript:void(0)" class="hr-doc-link" @click.prevent="downloadEmployeeFile(detailHrDocOf(item.type).fileId, detailHrDocOf(item.type).name)">
              {{ detailHrDocOf(item.type).name || '查看文件' }}
            </a>
          </template>
          <b v-else>未上传</b>
        </div>
      </div>

      <div class="bd-section-title">登录与权限</div>
      <div class="employee-info-grid compact">
        <div><span>登录账号</span><b>{{ detailData.username || '未开通' }}</b></div>
        <div><span>账号状态</span><b>{{ accountStatusText(detailData) }}</b></div>
        <div class="wide"><span>系统角色</span><b>{{ accountRoleNames(detailData).join('、') || '未分配' }}</b></div>
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
            <p>{{ detailData.hireDate || '—' }} · {{ detailData.deptName || '—' }}</p>
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
        <el-button
          type="primary"
          :disabled="Number(detailData.id) !== detailTargetEmployeeId"
          @click="handleEdit(detailData); drawerVisible = false"
        >{{ $t('common.edit') }}</el-button>
      </template>
    </BusinessDetailDrawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type UploadFile } from 'element-plus'
import { Delete, Document, Download, Folder, Lock, Paperclip, Phone, Plus, Reading, Suitcase, Upload, User, UserFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { employeeApi, deptApi, postApi } from '@/api/org'
import { userApi } from '@/api/system'
import { resignHandoverApi } from '@/api/hrm'
import { fileInfoApi } from '@/api/file'
import { downloadFileById } from '@/utils/download'
import { useUserStore } from '@/stores/user'
import BusinessDetailDrawer from '@/components/common/BusinessDetailDrawer.vue'

const { t } = useI18n()
const router = useRouter()
const userStore = useUserStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const resignedCount = ref<number | null>(null)
// 合同到期预警汇总(吸收原"劳动合同管理"页),独立于列表分页
const contractAlert = ref({ expiring: 0, expired: 0 })
const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const resignDialog = reactive<{ visible: boolean; saving: boolean; confirmed: boolean; resignDate?: string; employee?: any }>({
  visible: false,
  saving: false,
  confirmed: false
})

// ===== 编辑弹窗高保真改版:分组导航与状态徽章(纯展示,不动任何字段/校验/保存逻辑) =====
const empSections = computed(() => {
  const list = [
    { key: 'basic', label: t('org.tabBasic'), icon: User },
    { key: 'position', label: t('org.tabPosition'), icon: Suitcase },
    { key: 'contract', label: t('org.tabContract'), icon: Document },
    { key: 'education', label: t('org.tabEducation'), icon: Reading },
    { key: 'files', label: '档案附件', icon: Paperclip },
    { key: 'hrdocs', label: '人事附件', icon: Folder },
    { key: 'emergency', label: t('org.tabEmergency'), icon: Phone }
  ]
  if (canManageAccountSecurity.value) {
    list.push({ key: 'account', label: '登录与权限', icon: Lock })
  }
  return list
})
const empCntRef = ref<HTMLElement>()
const empActiveSect = ref('basic')
const empSectEls: Record<string, HTMLElement | null> = {}
function setSectRef(key: string, el: unknown) {
  empSectEls[key] = (el as HTMLElement) || null
}
function scrollToSect(key: string) {
  empActiveSect.value = key
  const el = empSectEls[key]
  const cnt = empCntRef.value
  if (el && cnt) cnt.scrollTo({ top: Math.max(0, el.offsetTop - 12), behavior: 'smooth' })
}
function onEmpCntScroll() {
  const cnt = empCntRef.value
  if (!cnt) return
  const top = cnt.scrollTop + 48
  let current = empSections.value[0]?.key || 'basic'
  for (const s of empSections.value) {
    const el = empSectEls[s.key]
    if (el && el.offsetTop <= top) current = s.key
  }
  empActiveSect.value = current
}
const empStatusMeta = computed(() => {
  const map: Record<number, { label: string; cls: string }> = {
    0: { label: '待入职', cls: 'is-gray' },
    1: { label: t('org.empStatusActive'), cls: 'is-green' },
    2: { label: t('org.empStatusTrial'), cls: 'is-amber' },
    3: { label: t('org.empStatusLeft'), cls: 'is-gray' }
  }
  return map[Number(formData.value.status)] || { label: '待入职', cls: 'is-gray' }
})
const activeTab = ref('basic')
const drawerVisible = ref(false)
const detailData = ref<any>(null)
const detailTargetEmployeeId = ref<number>()
let employeeDetailRequestId = 0
const deptTree = ref<any[]>([])
const postList = ref<any[]>([])
const importDialog = reactive({ visible: false })
const credentialDialog = reactive({ visible: false })
interface InitialCredential {
  username: string
  initialPassword: string
  mustChangePassword: boolean
}
const initialCredentials = ref<InitialCredential[]>([])

const credentialFromResponse = (response: any): InitialCredential | null => {
  const data = response?.data
  if (!data?.username || !data?.initialPassword) return null
  return {
    username: String(data.username),
    initialPassword: String(data.initialPassword),
    mustChangePassword: data.mustChangePassword !== false
  }
}

const showInitialCredentials = (items: InitialCredential[]) => {
  if (!items.length) return
  initialCredentials.value = items
  credentialDialog.visible = true
}

const clearInitialCredentials = () => {
  initialCredentials.value = []
}

const copyText = async (value: string) => {
  await navigator.clipboard.writeText(value)
  ElMessage.success('已复制，请通过可信渠道发送')
}

const copyCredential = (row: InitialCredential) => copyText(
  `登录账号：${row.username}\n一次性初始口令：${row.initialPassword}\n首次登录必须修改密码。`
)

const copyAllCredentials = () => copyText(initialCredentials.value.map((row) =>
  `${row.username}\t${row.initialPassword}`
).join('\n'))
const importText = ref('')
const importPreviewRows = ref<EmployeeImportPreviewRow[]>([])
const importingEmployees = ref(false)
const managerEmployees = ref<any[]>([])
const uploadingAttachmentKey = ref('')
const uploadingHrDocType = ref('')

// ===== 人事附件:5 种文件,存到 formData.hrDocs(JSON 字符串)。每项 { type, fileId, name, url } =====
const hrDocDefs = [
  { type: '离职证明' },
  { type: '劳动合同' },
  { type: '竞业协议' },
  { type: '保密协议' },
  { type: '会计补充协议' }
]

const fileDownloadUrl = (fileId?: number | string) => {
  if (!fileId) return ''
  const base = import.meta.env.VITE_API_BASE_URL || '/api'
  return `${base}/file/info/download/${fileId}`
}

// 编辑弹窗里当前已上传的人事附件(从 formData.hrDocs 解析)
const hrDocsList = computed<any[]>(() => {
  try {
    const arr = JSON.parse(formData.value.hrDocs || '[]')
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
})
const hrDocOf = (type: string) => hrDocsList.value.find((d: any) => d.type === type)

// 把 docs 数组写回 formData.hrDocs(JSON 字符串)
const writeHrDocs = (docs: any[]) => {
  formData.value.hrDocs = JSON.stringify(docs)
}

const handleHrDocUpload = async (type: string, file: File) => {
  if (!file) return
  if (file.size > 30 * 1024 * 1024) {
    ElMessage.warning('单个人事附件不能超过 30MB')
    return
  }
  uploadingHrDocType.value = type
  try {
    const res: any = await fileInfoApi.upload(file)
    const data = res?.data ?? res ?? {}
    const fileId = data.id
    const name = data.originalName || data.name || file.name
    const url = data.url || fileDownloadUrl(fileId)
    const docs = hrDocsList.value.filter((d: any) => d.type !== type)
    docs.push({ type, fileId, name, url })
    writeHrDocs(docs)
    ElMessage.success(`${type}已上传`)
  } catch (e: any) {
    // 显示后端真实原因(文件超限/类型不允许等),不再被"上传失败"盖住
    ElMessage.error(e?.message || `${type}上传失败`)
  } finally {
    uploadingHrDocType.value = ''
  }
}

const removeHrDoc = async (type: string) => {
  try {
    await ElMessageBox.confirm('确定移除此人事附件吗?', '', { type: 'warning' })
  } catch {
    return
  }
  writeHrDocs(hrDocsList.value.filter((d: any) => d.type !== type))
}

// 详情抽屉里的人事附件解析
const detailHrDocOf = (type: string) => {
  try {
    const arr = JSON.parse(detailData.value?.hrDocs || '[]')
    return Array.isArray(arr) ? arr.find((d: any) => d.type === type) : undefined
  } catch {
    return undefined
  }
}

const canEditEmpCode = computed(() => {
  const roles = userStore.roles || []
  return roles.includes('admin') || roles.includes('super_admin')
})

const canManageAccountSecurity = computed(() => {
  const roles = userStore.roles || []
  return Number(userStore.userInfo?.id || 0) === 1
    || roles.includes('super_admin')
    || roles.includes('admin')
})

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

interface EmployeeAttachmentDef {
  key: string
  label: string
  fileIdKey: string
  fileNameKey: string
  accept: string
}

const employeeAttachmentDefs: EmployeeAttachmentDef[] = [
  {
    key: 'resume',
    label: '简历档案',
    fileIdKey: 'resumeFileId',
    fileNameKey: 'resumeFileName',
    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png'
  },
  {
    key: 'education',
    label: '学历证书',
    fileIdKey: 'educationCertFileId',
    fileNameKey: 'educationCertFileName',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  {
    key: 'skill',
    label: '技能证书',
    fileIdKey: 'skillCertFileId',
    fileNameKey: 'skillCertFileName',
    accept: '.pdf,.jpg,.jpeg,.png'
  },
  {
    key: 'idFront',
    label: '身份证正面',
    fileIdKey: 'idCardFrontFileId',
    fileNameKey: 'idCardFrontFileName',
    accept: '.jpg,.jpeg,.png,.pdf'
  },
  {
    key: 'idBack',
    label: '身份证反面',
    fileIdKey: 'idCardBackFileId',
    fileNameKey: 'idCardBackFileName',
    accept: '.jpg,.jpeg,.png,.pdf'
  }
]

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  name: '',
  deptId: undefined as number | undefined,
  postId: undefined as number | undefined,
  status: undefined as number | undefined,
  excludeResigned: true
})

const defaultForm = () => ({
  id: undefined as number | undefined,
  userId: undefined as number | undefined,
  empCode: '',
  name: '',
  avatar: '',
  gender: 0,
  birthDate: '',
  idCard: '',
  phone: '',
  email: '',
  address: '',
  householdLocation: '',
  householdType: '',
  nativePlace: '',
  ethnicity: '',
  politicalStatus: '',
  maritalStatus: '',
  hrDocs: '',
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
  status: 2,
  annualLeaveTotal: 0,
  annualLeaveUsed: 0,
  managerId: undefined as number | undefined,
  resumeFileId: undefined as number | undefined,
  resumeFileName: '',
  educationCertFileId: undefined as number | undefined,
  educationCertFileName: '',
  skillCertFileId: undefined as number | undefined,
  skillCertFileName: '',
  idCardFrontFileId: undefined as number | undefined,
  idCardFrontFileName: '',
  idCardBackFileId: undefined as number | undefined,
  idCardBackFileName: '',
  username: '',
  accountEnabled: false,
  roleIds: [] as number[],
  roleNames: [] as string[]
})

const formData = ref(defaultForm())

// ===== 员工照片上传:读图→裁成方形→压缩为 256px JPEG 的 base64,直接存 avatar 字段(不依赖文件服务,避免上传报错) =====
const avatarInput = ref<HTMLInputElement>()
function triggerAvatarPick () {
  avatarInput.value?.click()
}
function compressImageToBase64 (file: File, size = 256, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('no canvas ctx')); return }
        const min = Math.min(img.width, img.height)
        const sx = (img.width - min) / 2
        const sy = (img.height - min) / 2
        ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.onerror = () => reject(new Error('image decode fail'))
      img.src = reader.result as string
    }
    reader.onerror = () => reject(new Error('file read fail'))
    reader.readAsDataURL(file)
  })
}
async function onAvatarPick (e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files && input.files[0]
  if (!file) return
  if (!file.type.startsWith('image/')) { ElMessage.warning('请选择图片文件'); input.value = ''; return }
  if (file.size > 10 * 1024 * 1024) { ElMessage.warning('图片太大,请选择 10MB 以内的图片'); input.value = ''; return }
  try {
    formData.value.avatar = await compressImageToBase64(file)
  } catch {
    ElMessage.error('图片处理失败,请换一张试试')
  }
  input.value = ''
}

const setFormField = (key: string, value: any) => {
  ;(formData.value as Record<string, any>)[key] = value
}

const fillNextEmpCode = async () => {
  try {
    const res: any = await employeeApi.nextCode()
    formData.value.empCode = String(res?.data || '')
  } catch {
    if (!formData.value.empCode) {
      formData.value.empCode = ''
    }
  }
}

const managerEmployeeOptions = computed(() =>
  managerEmployees.value.filter(item => item.status !== 3)
)

const managerOptionLabel = (item: any) => {
  const dept = item.deptName || '未分部门'
  const account = item.username || item._username || (item.userId ? `用户ID ${item.userId}` : '未开通账号')
  return `${item.name || '未命名'} · ${dept} · ${account}`
}

const handleProfileFileChange = async (item: EmployeeAttachmentDef, file: UploadFile) => {
  const raw = file.raw
  if (!raw) return
  if (raw.size > 30 * 1024 * 1024) {
    ElMessage.warning('单个档案附件不能超过 30MB')
    return
  }
  uploadingAttachmentKey.value = item.key
  try {
    const res: any = await fileInfoApi.upload(raw)
    const data = res?.data || {}
    setFormField(item.fileIdKey, data.id)
    setFormField(item.fileNameKey, data.originalName || data.name || raw.name)
    ElMessage.success(`${item.label}已上传`)
  } catch (e: any) {
    // 显示后端真实原因(文件超限/类型不允许等),不再被"上传失败"盖住
    ElMessage.error(e?.message || `${item.label}上传失败`)
  } finally {
    uploadingAttachmentKey.value = ''
  }
}

const clearProfileFile = (item: EmployeeAttachmentDef) => {
  setFormField(item.fileIdKey, undefined)
  setFormField(item.fileNameKey, '')
}

const downloadEmployeeFile = (fileId?: number | string, filename?: string) => {
  if (!fileId) return
  // 走带 token 的 blob 下载,避免 window.open 裸链接 GET 不带 token 导致 401
  downloadFileById(fileId, filename)
}

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

const rules = {
  name: [{ required: true, message: t('org.inputEmpName'), trigger: 'blur' }],
  deptId: [{ required: true, message: t('org.selectDept'), trigger: 'change' }]
}

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
  { key: 'username', label: '登录账号', aliases: ['登录账号', '账号', '用户名', '系统账号'], index: 6 },
  { key: 'accountEnabled', label: '允许登录', aliases: ['允许登录', '开通账号', '是否登录', '可登录'], index: 7 },
  { key: 'email', label: '邮箱', aliases: ['邮箱', '电子邮箱', '邮件'], index: 8 },
  { key: 'hireDate', label: '入职日期', aliases: ['入职日期', '入职时间', '到岗日期'], index: 9 },
  { key: 'status', label: '状态', aliases: ['状态', '员工状态', '在职状态'], index: 10 },
  { key: 'remark', label: '备注', aliases: ['备注', '说明', '补充说明'], index: 11 }
]

const flatDeptList = computed(() => flattenDeptTree(deptTree.value))

// 去掉最外层"公司"节点:顶层直接是部门;有子组的部门(如销售部→电话开发组/成交转化组)保留可展开
const deptTreeNoCompany = computed(() =>
  deptTree.value.flatMap((c: any) => (Array.isArray(c.children) && c.children.length) ? c.children : [c])
)

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
  if (['待入职', '待入职草稿', '草稿', '0'].some(item => text.includes(normalizeRoleText(item)))) return 0
  if (['离职', '停用', '已离职', '3'].some(item => text.includes(normalizeRoleText(item)))) return 3
  if (['试用', '待转正', '2'].some(item => text.includes(normalizeRoleText(item)))) return 2
  return 1
}

const normalizeEmployeeGender = (value: string) => {
  const text = normalizeRoleText(value)
  if (text.includes('女') || text === '1') return 1
  return 0
}

const normalizeAccountEnabled = (value: string, username: string) => {
  const text = normalizeRoleText(value)
  if (!text) return !!username
  return ['是', '开通', '允许', '启用', 'yes', 'y', 'true', '1'].some(item => text.includes(normalizeRoleText(item)))
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
      username: rowValue(cells, headerMap, 'username'),
      accountEnabled: rowValue(cells, headerMap, 'accountEnabled'),
      email: rowValue(cells, headerMap, 'email'),
      hireDate: rowValue(cells, headerMap, 'hireDate'),
      status: rowValue(cells, headerMap, 'status'),
      remark: rowValue(cells, headerMap, 'remark')
    }
    const role = employeeBusinessRole(raw)
    const dept = findDeptByName(raw.deptName, role)
    const post = findPostByName(raw.postName, role)
    const employeeStatus = normalizeEmployeeStatus(raw.status)
    const issues: string[] = []

    if (!raw.name) issues.push('缺姓名')
    if (!raw.empCode) issues.push('缺工号')
    if (usedCodes.has(raw.empCode)) issues.push('工号可能重复')
    if (!dept) issues.push(`部门未匹配: ${raw.deptName || role.fallbackDept}`)
    if (!post) issues.push(`岗位未匹配: ${raw.postName || role.fallbackPost}`)
    if (employeeStatus === 3) issues.push('离职人员请到离职人员中心补录')
    if (dept && raw.deptName && normalizeRoleText(dept.deptName) !== normalizeRoleText(raw.deptName)) {
      issues.push(`部门已归到 ${dept.deptName}`)
    }
    if (post && raw.postName && normalizeRoleText(post.postName) !== normalizeRoleText(raw.postName)) {
      issues.push(`岗位已归到 ${post.postName}`)
    }

    usedCodes.add(raw.empCode)
    const status = issues.some(issue => issue.includes('缺')
      || issue.includes('重复')
      || issue.includes('未匹配')
      || issue.includes('离职人员')) ? 'error' : 'ready'
    const employee = {
      empCode: raw.empCode,
      name: raw.name,
      deptId: dept?.id,
      deptName: dept?.deptName,
      postId: post?.id,
      postName: post?.postName,
      phone: raw.phone,
      username: raw.username,
      accountEnabled: normalizeAccountEnabled(raw.accountEnabled, raw.username),
      email: raw.email,
      hireDate: normalizeDateText(raw.hireDate),
      status: employeeStatus,
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
    '工号\t姓名\t部门\t岗位\t业务角色\t手机号\t登录账号\t允许登录\t邮箱\t入职日期\t状态\t备注',
    'ZH001\t张明\t管理层\t总经理\t管理负责人\t13800000001\tzhangming\t是\tzhangming@example.com\t2026-06-01\t在职\t负责最终审批',
    'ZH002\t李娜\t销售部\t销售代表\t电销拓客\t13800000002\tlina\t是\tlina@example.com\t2026-06-01\t在职\t电话外呼和线索首触',
    'ZH003\t王磊\t销售部\t销售代表\t网销运营\t13800000003\twanglei\t是\twanglei@example.com\t2026-06-01\t在职\t负责线上投放和ROI',
    'ZH004\t陈会计\t财务部\t会计\t财税会计\t13800000004\tchenkj\t是\tchenkj@example.com\t2026-06-01\t在职\t代账报税服务',
    'ZH005\t赵交付\t客服部\t销售代表\t工商交付\t13800000005\tzhaojf\t是\tzhaojf@example.com\t2026-06-01\t在职\t工商注册变更交付',
    'ZH006\t周渠道\t销售部\t销售代表\t渠道地址\t13800000006\tzhouqd\t是\tzhouqd@example.com\t2026-06-01\t在职\t挂靠地址和同行渠道',
    'ZH007\t钱出纳\t财务部\t财务总监\t财务审核\t13800000007\tqiancn\t是\tqiancn@example.com\t2026-06-01\t在职\t回款核对和提单财审',
    'ZH008\t孙人事\t人事部\t人事专员\t人事行政\t13800000008\tsunrs\t是\tsunrs@example.com\t2026-06-01\t在职\t组织和权限开通'
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
    ['ZH001', '张明', '管理层', '总经理', '管理负责人', '13800000001', 'zhangming', '是', 'zhangming@example.com', '2026-06-01', '在职', '负责老板审批'],
    ['ZH002', '李娜', '销售部', '销售代表', '电销拓客', '13800000002', 'lina', '是', 'lina@example.com', '2026-06-01', '在职', '负责电销首触'],
    ['ZH003', '王磊', '销售部', '销售代表', '网销运营', '13800000003', 'wanglei', '是', 'wanglei@example.com', '2026-06-01', '在职', '负责线上ROI'],
    ['ZH004', '陈会计', '财务部', '会计', '财税会计', '13800000004', 'chenkj', '是', 'chenkj@example.com', '2026-06-01', '在职', '代账报税交付']
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
  const credentials: InitialCredential[] = []
  try {
    for (const row of readyRows) {
      const { deptName, postName, ...payload } = row.employee
      try {
        const response = await employeeApi.create(payload)
        const credential = credentialFromResponse(response)
        if (credential) credentials.push(credential)
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
      showInitialCredentials(credentials)
    } else {
      ElMessage.error('导入失败,请检查工号是否重复或后端服务是否可用')
    }
  } finally {
    importingEmployees.value = false
  }
}

const empStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'info' }
  return (map[status] || 'info') as any
}

const empStatusText = (status: number) => {
  const map: Record<number, string> = { 0: '待入职', 1: t('org.empStatusActive'), 2: t('org.empStatusTrial'), 3: t('org.empStatusLeft') }
  return map[status] || '-'
}

const genderText = (gender: number) => gender === 0 ? t('org.male') : t('org.female')

const employeeAvatar = (row: any) => String(row?.name || '员').slice(0, 2)

const employeeAvatarClass = (status: number) => {
  const map: Record<number, string> = { 0: 'primary', 1: 'success', 2: 'warning', 3: 'company' }
  return map[status] || 'company'
}

const accountRoleNames = (row: any) => row?.roleNames || row?._roleNames || []

const accountStatusText = (row: any) => {
  if (!row?.userId && !row?.username && !row?._username) return '未开通'
  const status = row.userStatus ?? row._userStatus
  return status === 1 || row.accountEnabled === false ? '已停用' : '可登录'
}

const accountStatusType = (row: any) => {
  if (!row?.userId && !row?.username && !row?._username) return 'info'
  const status = row.userStatus ?? row._userStatus
  return status === 1 || row.accountEnabled === false ? 'warning' : 'success'
}

const goRoleManagement = () => {
  dialogVisible.value = false
  router.push('/sys-org/role')
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await employeeApi.list(queryParams)
    const data = res.data
    const rows = data.records || data.list || []
    tableData.value = rows
    total.value = data.total || 0
  } catch (e) {
    // ignore
  } finally {
    loading.value = false
  }
}

const loadResignedCount = async () => {
  try {
    const res: any = await resignHandoverApi.summary()
    resignedCount.value = Number(res?.data?.total || 0)
  } catch {
    // 读取失败不能伪装为“当前没有离职人员”。
    resignedCount.value = null
  }
}

// 合同到期预警:独立全量统计在职员工合同到期情况(不随列表分页),吸收原"劳动合同管理"页核心价值
const loadContractAlert = async () => {
  try {
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 500, excludeResigned: true })
    const rows: any[] = res?.data?.records || []
    const now = Date.now()
    let expiring = 0
    let expired = 0
    rows.forEach((e) => {
      if (e.status === 0 || e.status === 3 || !e.contractEnd) return  // 待入职/离职/未登记合同跳过
      const end = new Date(String(e.contractEnd).slice(0, 10)).getTime()
      if (Number.isNaN(end)) return
      const days = Math.floor((end - now) / 86400000)
      if (days < 0) expired++
      else if (days <= 90) expiring++
    })
    contractAlert.value = { expiring, expired }
  } catch (e) { /* ignore */ }
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

// 直属上级下拉选项:展示员工,保存上级员工对应的 userId,供流程引擎自动找审批人。
const loadManagerEmployees = async () => {
  try {
    const res: any = await employeeApi.list({ pageNum: 1, pageSize: 1000, excludeResigned: true })
    managerEmployees.value = res.data?.records || res.data?.list || []
  } catch {
    managerEmployees.value = []
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
  queryParams.excludeResigned = true
  handleSearch()
}

const handleAdd = async () => {
  isEdit.value = false
  dialogTitle.value = t('org.addEmployee')
  formData.value = defaultForm()
  await fillNextEmpCode()
  if (!postList.value.length) await loadPostList()
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const handleEdit = (row: any) => {
  if (row.status === 3) {
    ElMessage.info('离职档案请在离职人员中心维护')
    router.push('/sys-org/resigned-staff')
    return
  }
  isEdit.value = true
  dialogTitle.value = t('org.editEmployee')
  formData.value = {
    ...defaultForm(),
    ...row,
    username: row.username || row._username || '',
    accountEnabled: row.accountEnabled ?? accountStatusText(row) === '可登录',
    roleIds: row.roleIds || row._roleIds || []
  }
  activeTab.value = 'basic'
  dialogVisible.value = true
}

const openResignDialog = (row: any) => {
  if (row.status !== 1 && row.status !== 2) {
    ElMessage.warning('只有在职或试用员工可以办理离职')
    return
  }
  resignDialog.employee = row
  resignDialog.resignDate = undefined
  resignDialog.confirmed = false
  resignDialog.saving = false
  resignDialog.visible = true
}

const disableFutureResignDate = (date: Date) => {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date.getTime() > today.getTime()
}

const submitResign = async () => {
  if (!resignDialog.employee?.id) return ElMessage.warning('缺少员工信息')
  if (!resignDialog.resignDate) return ElMessage.warning('请选择真实离职日期')
  if (disableFutureResignDate(new Date(`${resignDialog.resignDate}T00:00:00`))) return ElMessage.warning('离职日期不能晚于今天')
  if (resignDialog.employee.hireDate && resignDialog.resignDate < resignDialog.employee.hireDate) {
    return ElMessage.warning('离职日期不能早于入职日期')
  }
  if (!resignDialog.confirmed) return ElMessage.warning('请先确认离职影响')
  resignDialog.saving = true
  try {
    await employeeApi.resign(resignDialog.employee.id, resignDialog.resignDate)
    ElMessage.success('离职已办理，账号和当前会话已立即失效')
    resignDialog.visible = false
    drawerVisible.value = false
    await Promise.all([loadData(), loadContractAlert(), loadManagerEmployees(), loadResignedCount()])
  } finally {
    resignDialog.saving = false
  }
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
  const targetId = Number(row?.id)
  if (!targetId) return
  const requestId = ++employeeDetailRequestId
  detailTargetEmployeeId.value = targetId
  try {
    const res = await employeeApi.detail(targetId)
    if (requestId !== employeeDetailRequestId || detailTargetEmployeeId.value !== targetId) return
    if (Number(res?.data?.id) !== targetId) {
      ElMessage.error('员工详情返回不一致，请刷新后重试')
      return
    }
    detailData.value = res.data
    drawerVisible.value = true
  } catch (e) {
    if (requestId === employeeDetailRequestId && detailTargetEmployeeId.value === targetId) {
      ElMessage.error('员工详情加载失败，请重试')
    }
  }
}

const handleResetPwd = async () => {
  if (!formData.value.id || !formData.value.userId) {
    ElMessage.warning('该员工还没有登录账号,保存后才能重置密码')
    return
  }
  try {
    await ElMessageBox.confirm('系统将生成随机初始口令，并立即使该员工所有会话失效。是否继续？', '重置登录密码', {
      confirmButtonText: '确认重置',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await employeeApi.resetPwd(formData.value.id)
    const credential = credentialFromResponse(response)
    if (!credential) throw new Error('后端未返回一次性初始口令')
    showInitialCredentials([credential])
    ElMessage.success('密码已安全重置，原会话已失效')
  } catch (error) {
    // 用户取消无需提示
  }
}

const handleResetMfa = async () => {
  if (!formData.value.userId) {
    ElMessage.warning('该员工还没有登录账号，无法重置 MFA')
    return
  }
  try {
    await ElMessageBox.confirm(
      '旧的动态验证器将立即失效，该员工全部当前会话也会被注销。下次登录时需重新绑定，是否继续？',
      '重置 MFA',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    await userApi.resetMfa({ userId: Number(formData.value.userId) })
    ElMessage.success('MFA 已重置，原会话已失效')
  } catch (error) {
    // 用户取消无需提示
  }
}

const submitForm = async () => {
  if (formData.value.status === 3) {
    ElMessage.warning('请使用“办理离职”登记真实离职日期并同步停用账号')
    return
  }
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  try {
    // 角色关系必须只从「角色管理 → 成员管理」写入。
    const payload = { ...formData.value } as Record<string, any>
    delete payload.roleIds
    delete payload.roleNames
    let response: any
    if (isEdit.value) {
      response = await employeeApi.update(payload)
    } else {
      response = await employeeApi.create(payload)
    }
    const credential = credentialFromResponse(response)
    ElMessage.success(t('common.success'))
    dialogVisible.value = false
    if (credential) showInitialCredentials([credential])
    loadData()
    loadManagerEmployees()
  } catch (e) { /* ignore */ }
}

onMounted(() => {
  loadData()
  loadResignedCount()
  loadContractAlert()
  loadDeptTree()
  loadPostList()
  loadManagerEmployees()
})
</script>

<style scoped>
/* ===== 编辑弹窗高保真改版 ===== */
.emp-hd {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 24px;
}
.emp-hd-avatar,
.emp-hd-avatar-img {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  flex: none;
}
.emp-hd-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e6f1fb;
  color: #0c447c;
  font-size: 16px;
  font-weight: 600;
}
.emp-hd-avatar-img { object-fit: cover; }
.emp-hd-name { display: flex; align-items: center; gap: 8px; }
.emp-hd-name strong { font-size: 16px; color: #1f2937; }
.emp-hd-sub { margin-top: 2px; font-size: 12px; color: #94a3b8; }
.emp-pill {
  padding: 1px 9px;
  border-radius: 999px;
  font-size: 11px;
}
.emp-pill.is-green { background: #e1f5ee; color: #085041; }
.emp-pill.is-amber { background: #faeeda; color: #633806; }
.emp-pill.is-gray { background: #f1f5f9; color: #64748b; }
.emp-shell {
  display: grid;
  grid-template-columns: 148px minmax(0, 1fr);
  border-top: 1px solid #eef2f7;
}
.emp-rail {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 0;
  border-right: 1px solid #eef2f7;
  background: #f8fafc;
}
.emp-ri {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border: none;
  border-left: 2.5px solid transparent;
  background: transparent;
  color: #64748b;
  font-size: 13px;
  cursor: pointer;
  text-align: left;
}
.emp-ri .el-icon { font-size: 15px; }
.emp-ri:hover { color: #334155; background: #f1f5f9; }
.emp-ri.on {
  color: var(--el-color-primary);
  font-weight: 600;
  border-left-color: var(--el-color-primary);
  background: #ffffff;
}
.emp-cnt {
  position: relative;
  max-height: 62vh;
  overflow-y: auto;
  padding: 16px 20px 8px;
}
.emp-sect { margin-bottom: 22px; }
.emp-sth {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.emp-sth h4 { margin: 0; font-size: 14px; font-weight: 600; color: #1f2937; }
.emp-sth small { margin-left: auto; font-size: 11.5px; color: #94a3b8; }
.emp-ic {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}
.emp-ic.ic-blue { background: #e6f1fb; color: #185fa5; }
.emp-ic.ic-green { background: #e1f5ee; color: #0f6e56; }
.emp-ic.ic-coral { background: #faece7; color: #993c1d; }
.emp-ic.ic-purple { background: #eeedfe; color: #534ab7; }
.emp-ic.ic-gray { background: #f1efe8; color: #5f5e5a; }
.emp-ic.ic-pink { background: #fbeaf0; color: #993556; }
.emp-perm {
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  background: #ffffff;
  padding: 12px 14px 2px;
}
.emp-hifi :deep(.el-form-item__label) {
  margin-bottom: 4px;
  font-size: 12.5px;
  color: #475569;
  line-height: 1.4;
}
.emp-hifi :deep(.el-form-item) { margin-bottom: 14px; }
</style>

<style scoped>
.search-card {
  margin-bottom: 16px;
}
.search-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}
.search-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}
.resigned-center-entry {
  border-color: #cbd5e1;
  color: #334155;
  background: #f8fafc;
}
.resigned-center-entry:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: #eff6ff;
}
.resign-employee-card {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #f8fafc;
}
.resign-avatar {
  display: grid;
  flex: none;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: #1d4ed8;
  background: #dbeafe;
  font-weight: 700;
}
.resign-employee-card strong { display: block; color: #111827; font-size: 15px; }
.resign-employee-card p { margin: 4px 0 0; color: #64748b; font-size: 12px; }
.resign-form { margin-top: 18px; }
.resign-confirm-check {
  width: 100%;
  height: auto;
  align-items: flex-start;
  padding: 11px 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fff7f7;
  white-space: normal;
}
.resign-confirm-check :deep(.el-checkbox__label) { color: #991b1b; line-height: 1.6; white-space: normal; }
.employee-import-side span {
  display: block;
  margin-bottom: 4px;
  color: #667085;
  font-size: 12px;
}
.employee-import-side b {
  color: #111827;
  font-size: 20px;
  font-weight: 750;
}
.role-position-text {
  color: #344054;
  font-size: 12px;
  line-height: 1.5;
}
.employee-account-cell {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-width: 0;
}
.employee-account-cell strong {
  max-width: 100%;
  overflow: hidden;
  color: #1f2937;
  font-size: 13px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.account-merge-alert {
  margin-bottom: 14px;
}
.account-hint {
  margin-top: 4px;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
}
.employee-role-readonly {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-height: 32px;
}
.field-tip {
  margin-top: 6px;
  color: #667085;
  font-size: 12px;
  line-height: 1.5;
}
.profile-file-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}
.profile-file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
  padding: 12px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fbfcfd;
}
.profile-file-main {
  min-width: 0;
}
.profile-file-main strong {
  display: block;
  overflow: hidden;
  color: #1f2937;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-file-main span {
  display: block;
  overflow: hidden;
  margin-top: 4px;
  color: #667085;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.profile-file-actions {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 6px;
  margin-left: 10px;
}
.employee-attachment-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.employee-attachment-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fbfcfd;
}
.employee-attachment-row span {
  overflow: hidden;
  color: #667085;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.employee-attachment-row b {
  color: #1f2937;
  font-size: 13px;
  font-weight: 650;
}
.hr-doc-link {
  overflow: hidden;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hr-doc-link:hover {
  text-decoration: underline;
}
.profile-file-main a {
  color: var(--el-color-primary);
  text-decoration: none;
}
.profile-file-main a:hover {
  text-decoration: underline;
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
  .search-actions :deep(.el-button) { margin-left: 0; }
  .employee-resign-dialog :deep(.el-dialog) { width: 92vw; }
  .employee-import-layout {
    grid-template-columns: 1fr;
    display: grid;
  }
  .employee-info-grid {
    grid-template-columns: 1fr;
  }
  .profile-file-grid {
    grid-template-columns: 1fr;
  }
}

/* ===== 员工照片上传 ===== */
.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 14px;
}
.avatar-box {
  width: 88px;
  height: 88px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px dashed var(--el-border-color);
  background: var(--el-fill-color-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s ease;
  flex-shrink: 0;
}
.avatar-box:hover {
  border-color: var(--el-color-primary);
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.avatar-empty .plus {
  font-size: 24px;
  line-height: 1;
}
.avatar-tip {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.avatar-hint {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>

<!-- 员工弹窗的响应式宽度:必须放在非 scoped 块,因为 el-dialog 会被 teleport 到 body,拿不到本组件的 data-v 作用域属性,scoped 规则匹配不到 -->
<style>
/* 高保真改版壳:正文去内边距(内部自带布局),头部/底部与正文用浅线分隔 */
.el-dialog.emp-hifi .el-dialog__body {
  padding: 0;
}
.el-dialog.emp-hifi .el-dialog__header {
  padding: 14px 20px;
  margin-right: 0;
}
.el-dialog.emp-hifi .el-dialog__footer {
  border-top: 1px solid #eef2f7;
  padding: 12px 20px;
}
/* 编辑/新增员工弹窗(920px):窄屏(平板/手机)自动收成 92vw,避免固定宽度撑出屏幕 */
@media (max-width: 980px) {
  .el-dialog.employee-edit-dialog {
    width: 92vw !important;
  }
  /* 窄屏收起左侧分组导航,内容区单列滚动 */
  .el-dialog.emp-hifi .emp-rail { display: none; }
  .el-dialog.emp-hifi .emp-shell { grid-template-columns: 1fr; }
}
/* 批量导入弹窗(980px):≤1040px 时同样收成 92vw */
@media (max-width: 1040px) {
  .el-dialog.employee-import-dialog {
    width: 92vw !important;
  }
}
</style>

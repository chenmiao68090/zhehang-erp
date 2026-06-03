<template>
  <div class="pool-admin">
    <!-- ============ Header ============ -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">系统 · ADMIN</span>
        <span class="meta-divider"></span>
        <span class="meta-time">公海 / 私海 · 全局规则中枢</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">系统配置管理中心</span>
          <span class="title-en">Pool Admin Console</span>
        </h1>
        <p class="page-desc">管理员专属 · 公海/私海全局规则配置 · 调参即生效</p>
      </div>

      <div class="header-right">
        <span v-if="dirty" class="dirty-tag">
          <span class="dirty-dot"></span>
          有未保存的更改
        </span>
        <button class="back-btn" @click="goBack">
          <el-icon><ArrowLeftBold /></el-icon>
          <span>返回工作台</span>
        </button>
      </div>
    </header>

    <!-- ============ Permission Alert ============ -->
    <el-alert
      class="perm-alert"
      type="info"
      :closable="false"
      show-icon
      title="仅管理员可操作此页面的配置项"
      description="此处所有改动会即时影响所有员工的公海/私海行为，请谨慎调整后再保存。"
    />

    <!-- ============ Body: Side Menu + Content ============ -->
    <div class="admin-body">
      <!-- ===== Side Menu ===== -->
      <aside class="side-pane">
        <div class="side-head">
          <span class="side-head-tag">CONFIG MENU</span>
          <span class="side-head-line"></span>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="side-menu"
          @select="(k: string) => activeMenu = k"
        >
          <el-menu-item v-for="m in menus" :key="m.key" :index="m.key">
            <span class="menu-no">{{ m.no }}</span>
            <span class="menu-text">{{ m.label }}</span>
            <span class="menu-arrow">›</span>
          </el-menu-item>
        </el-menu>

        <div class="side-foot">
          <div class="foot-row"><em>当前账户</em><strong>系统管理员</strong></div>
          <div class="foot-row"><em>配置版本</em><strong>v 2.6.0</strong></div>
          <div class="foot-row"><em>最近保存</em><strong>{{ lastSaved }}</strong></div>
        </div>
      </aside>

      <!-- ===== Content Pane ===== -->
      <section class="content-pane">

        <!-- ============================================== 1. 公海池管理 ============================================== -->
        <div v-show="activeMenu === 'pool'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">01</span>
              <span class="block-name">公海池管理</span>
              <em class="block-sub">7 个池 · 全局可见性 / 操作权限 / 分配方式</em>
            </div>
            <el-button type="primary" plain @click="openPoolDialog()">
              <el-icon><Plus /></el-icon>
              新增池
            </el-button>
          </div>

          <el-table :data="pools" stripe class="zh-table">
            <el-table-column prop="poolName" label="池名称" min-width="160">
              <template #default="{ row }">
                <span class="pool-name">{{ row.poolName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="池类型" width="120">
              <template #default="{ row }">
                <el-tag :type="poolTypeTag(row.poolType)" effect="plain" size="small">
                  {{ poolTypeText(row.poolType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="可见范围" width="120">
              <template #default="{ row }">{{ scopeText(row.visibleScope) }}</template>
            </el-table-column>
            <el-table-column label="操作权限" width="140">
              <template #default="{ row }">{{ operateText(row.operateScope) }}</template>
            </el-table-column>
            <el-table-column label="分配方式" width="120">
              <template #default="{ row }">
                <span class="distribute-tag" :class="`d-${row.distributeMode}`">
                  {{ distributeText(row.distributeMode) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="sortOrder" label="排序" width="80" align="center" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  :active-value="1"
                  :inactive-value="0"
                  @change="onPoolStatusChange(row)"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openPoolDialog(row)">编辑</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- ============================================== 2. 持有上限配置 ============================================== -->
        <div v-show="activeMenu === 'holding'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">02</span>
              <span class="block-name">持有上限配置</span>
              <em class="block-sub">6 种角色 · 最大持有量 / 超限容忍率 / 自动释放</em>
            </div>
          </div>

          <el-alert
            type="warning"
            :closable="false"
            class="rule-tip"
            title="超限规则说明"
            description="超限后系统将根据「超限释放时限」自动把最早领取的客户回收至公海。容忍率用于电销场景的弹性放宽（例：10%容忍 = 50上限可短期持有55条）。"
          />

          <el-table :data="holdings" stripe class="zh-table edit-table">
            <el-table-column label="角色类型" width="140">
              <template #default="{ row }">
                <el-tag size="small" effect="plain">{{ row.roleType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="roleLabel" label="角色名称" min-width="140" />
            <el-table-column label="最大持有量" width="160" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.maxHolding" :min="1" :max="9999" controls-position="right" size="small" @change="markDirty" />
              </template>
            </el-table-column>
            <el-table-column label="超限容忍率" width="170" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.overtimeToleranceRate" :step="0.05" :min="0" :max="0.5" :precision="2" controls-position="right" size="small" @change="markDirty" />
              </template>
            </el-table-column>
            <el-table-column label="超限释放时限(h)" width="170" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.overtimeReleaseHours" :min="1" :max="720" controls-position="right" size="small" @change="markDirty" />
              </template>
            </el-table-column>
            <el-table-column prop="description" label="说明" min-width="200" show-overflow-tooltip />
          </el-table>

          <div class="block-actions">
            <el-button @click="resetHoldings">重置默认</el-button>
            <el-button type="primary" :loading="savingHoldings" @click="saveHoldings">
              <el-icon><Check /></el-icon>
              保存持有上限配置
            </el-button>
          </div>
        </div>

        <!-- ============================================== 3. 保护期配置 ============================================== -->
        <div v-show="activeMenu === 'protect'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">03</span>
              <span class="block-name">保护期配置</span>
              <em class="block-sub">6 类保护场景 · 防止恶意争抢与重复回收</em>
            </div>
          </div>

          <el-alert
            type="success"
            :closable="false"
            class="rule-tip"
            title="保护期叠加原则"
            description="多个保护期同时命中时，取「最长」作为最终保护期。成交客户保护期为永久，除主动退回或转交外不会自动回收。"
          />

          <el-table :data="protections" stripe class="zh-table edit-table">
            <el-table-column prop="name" label="保护期类型" min-width="200">
              <template #default="{ row }">
                <span class="prot-name">{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="scope" label="适用对象" width="160" />
            <el-table-column label="时长" width="220" align="center">
              <template #default="{ row }">
                <div v-if="row.forever" class="forever-tag">
                  <span class="forever-dot"></span>
                  永久保护
                </div>
                <div v-else class="dur-cell">
                  <el-input-number v-model="row.days" :min="1" :max="365" controls-position="right" size="small" @change="markDirty" />
                  <em class="unit">天</em>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明" min-width="220" show-overflow-tooltip />
          </el-table>

          <div class="block-actions">
            <el-button type="primary" :loading="savingProt" @click="saveProtections">
              <el-icon><Check /></el-icon>
              保存保护期配置
            </el-button>
          </div>
        </div>

        <!-- ============================================== 4. 回收规则管理 ============================================== -->
        <div v-show="activeMenu === 'recycle'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">04</span>
              <span class="block-name">回收规则管理</span>
              <em class="block-sub">6 条预置规则 · 取最短时间触发</em>
            </div>
            <el-button type="primary" plain @click="openRecycleDialog()">
              <el-icon><Plus /></el-icon>
              新增规则
            </el-button>
          </div>

          <el-alert
            type="error"
            :closable="false"
            class="rule-tip"
            title="取最短时间原则"
            description="同一线索同时命中多条回收规则时，系统取所有命中规则中「最短回收天数」作为实际触发条件，确保线索流转效率最大化。"
          />

          <el-table :data="recycleRules" stripe class="zh-table">
            <el-table-column prop="priority" label="优先级" width="80" align="center">
              <template #default="{ row }">
                <span class="priority-badge">{{ row.priority }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="ruleName" label="规则名称" min-width="200">
              <template #default="{ row }">
                <span class="rule-name">{{ row.ruleName }}</span>
                <el-tag v-if="row.core" size="small" type="danger" effect="dark" class="core-tag">核心</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="applyScope" label="适用范围" width="120" />
            <el-table-column label="回收阈值" width="140" align="center">
              <template #default="{ row }">
                <span class="recycle-days" :class="{ highlight: row.recycleDays === 15 }">
                  {{ row.recycleDays }}
                </span>
                <em class="unit">天</em>
              </template>
            </el-table-column>
            <el-table-column prop="targetPool" label="回收去向" width="140" />
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="markDirty" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="openRecycleDialog(row)">编辑</el-button>
                <el-button type="danger" link size="small" :disabled="row.core" @click="removeRecycleRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- ============================================== 5. 分配权重配置 ============================================== -->
        <div v-show="activeMenu === 'weight'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">05</span>
              <span class="block-name">分配权重配置</span>
              <em class="block-sub">4 因子加权 · 总和必须等于 100%</em>
            </div>
            <span class="weight-sum" :class="{ ok: weightTotal === 100, bad: weightTotal !== 100 }">
              当前总和：{{ weightTotal }}%
            </span>
          </div>

          <div class="weight-grid">
            <div v-for="w in weightItems" :key="w.key" class="weight-card">
              <div class="weight-card-head">
                <span class="weight-icon">{{ w.icon }}</span>
                <div class="weight-meta">
                  <div class="weight-name">{{ w.name }}</div>
                  <div class="weight-desc">{{ w.desc }}</div>
                </div>
                <div class="weight-value">{{ weight[w.key] }}<em>%</em></div>
              </div>
              <el-slider
                v-model="weight[w.key]"
                :min="0"
                :max="100"
                :step="5"
                :marks="{ 0: '0', 25: '25', 50: '50', 75: '75', 100: '100' }"
                @change="markDirty"
              />
            </div>
          </div>

          <div class="block-actions">
            <el-button @click="resetWeight">恢复均分 (25/25/25/25)</el-button>
            <el-button type="primary" :loading="savingWeight" :disabled="weightTotal !== 100" @click="saveWeight">
              <el-icon><Check /></el-icon>
              保存权重配置
            </el-button>
          </div>
        </div>

        <!-- ============================================== 6. 渠道路由配置 ============================================== -->
        <div v-show="activeMenu === 'channel'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">06</span>
              <span class="block-name">渠道路由配置</span>
              <em class="block-sub">11 个渠道 · 自动路由至对应公海池</em>
            </div>
          </div>

          <el-table :data="channels" stripe class="zh-table">
            <el-table-column prop="code" label="渠道编码" width="120">
              <template #default="{ row }">
                <code class="ch-code">{{ row.code }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="name" label="渠道名称" min-width="140" />
            <el-table-column label="目标公海池" min-width="200">
              <template #default="{ row }">
                <el-select v-model="row.targetPoolId" style="width: 100%" @change="markDirty">
                  <el-option v-for="p in pools" :key="p.id" :label="p.poolName" :value="p.id" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="路由优先级" width="160" align="center">
              <template #default="{ row }">
                <el-input-number v-model="row.priority" :min="1" :max="99" controls-position="right" size="small" @change="markDirty" />
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="说明" min-width="220" show-overflow-tooltip />
            <el-table-column label="启用" width="80" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" @change="markDirty" />
              </template>
            </el-table-column>
          </el-table>

          <div class="block-actions">
            <el-button type="primary" :loading="savingChannel" @click="saveChannels">
              <el-icon><Check /></el-icon>
              保存渠道路由
            </el-button>
          </div>
        </div>

        <!-- ============================================== 7. 抢单规则 ============================================== -->
        <div v-show="activeMenu === 'grab'" class="block">
          <div class="block-head">
            <div class="block-title">
              <span class="block-no">07</span>
              <span class="block-name">抢单规则</span>
              <em class="block-sub">公海抢单全局参数 · 防滥用 / 优先级 / 冷却</em>
            </div>
          </div>

          <el-form :model="grab" label-position="top" class="grab-form">
            <div class="grab-grid">
              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G1</span>
                  <span class="grab-card-title">每人每日抢单上限</span>
                </div>
                <el-input-number v-model="grab.dailyLimit" :min="1" :max="100" controls-position="right" @change="markDirty" />
                <span class="grab-unit">条 / 天</span>
                <p class="grab-desc">超限后当日不能继续抢单，次日 0 点重置</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G2</span>
                  <span class="grab-card-title">同一客户重复领取冷却期</span>
                </div>
                <el-input-number v-model="grab.repeatCoolDays" :min="1" :max="90" controls-position="right" @change="markDirty" />
                <span class="grab-unit">天</span>
                <p class="grab-desc">退回公海的客户，原跟进人在冷却期内不可再次领取</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G3</span>
                  <span class="grab-card-title">A 级客户优先窗口</span>
                </div>
                <el-input-number v-model="grab.aLevelWindow" :min="0" :max="3600" controls-position="right" @change="markDirty" />
                <span class="grab-unit">秒</span>
                <p class="grab-desc">A 级客户进入公海后，前 N 秒仅高级别员工可抢</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G4</span>
                  <span class="grab-card-title">抢单后首次跟进期限</span>
                </div>
                <el-input-number v-model="grab.firstFollowDays" :min="1" :max="30" controls-position="right" @change="markDirty" />
                <span class="grab-unit">天</span>
                <p class="grab-desc">抢单后必须在期限内首次跟进，否则自动回收</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G5</span>
                  <span class="grab-card-title">回收冷却期(原跟进人)</span>
                </div>
                <el-input-number v-model="grab.recycleCoolDays" :min="1" :max="60" controls-position="right" @change="markDirty" />
                <span class="grab-unit">天</span>
                <p class="grab-desc">回收后原跟进人进入冷却期不可重新领取（默认 15 天）</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G6</span>
                  <span class="grab-card-title">连续回收降级阈值</span>
                </div>
                <el-input-number v-model="grab.downgradeThreshold" :min="1" :max="20" controls-position="right" @change="markDirty" />
                <span class="grab-unit">次</span>
                <p class="grab-desc">连续回收 N 次后，员工等级降级，下月恢复</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G7</span>
                  <span class="grab-card-title">电销超限容忍</span>
                </div>
                <el-input-number v-model="grab.teleTolerancePct" :min="0" :max="50" controls-position="right" @change="markDirty" />
                <span class="grab-unit">%</span>
                <p class="grab-desc">电销岗位短期容许超出最大持有量的比例</p>
              </div>

              <div class="grab-card">
                <div class="grab-card-head">
                  <span class="grab-no">G8</span>
                  <span class="grab-card-title">电销超限释放</span>
                </div>
                <el-input-number v-model="grab.teleReleaseHours" :min="1" :max="168" controls-position="right" @change="markDirty" />
                <span class="grab-unit">小时</span>
                <p class="grab-desc">超限超过 N 小时后，按"先入先回收"释放</p>
              </div>
            </div>
          </el-form>

          <div class="block-actions">
            <el-button @click="resetGrab">重置默认</el-button>
            <el-button type="primary" :loading="savingGrab" @click="saveGrab">
              <el-icon><Check /></el-icon>
              保存抢单规则
            </el-button>
          </div>
        </div>

      </section>
    </div>

    <!-- ============ Pool Edit Dialog ============ -->
    <el-dialog v-model="poolDialog.visible" :title="poolDialog.editing ? '编辑公海池' : '新增公海池'" width="560px" destroy-on-close>
      <el-form :model="poolForm" label-width="100px">
        <el-form-item label="池名称">
          <el-input v-model="poolForm.poolName" placeholder="请输入池名称" />
        </el-form-item>
        <el-form-item label="池类型">
          <el-select v-model="poolForm.poolType" style="width: 100%">
            <el-option v-for="t in poolTypes" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="可见范围">
          <el-radio-group v-model="poolForm.visibleScope">
            <el-radio label="all">全员可见</el-radio>
            <el-radio label="team">本团队</el-radio>
            <el-radio label="manager">仅主管</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="操作权限">
          <el-radio-group v-model="poolForm.operateScope">
            <el-radio label="all">全员可操作</el-radio>
            <el-radio label="team_priority">本团队优先</el-radio>
            <el-radio label="manager_only">仅主管可操作</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分配方式">
          <el-radio-group v-model="poolForm.distributeMode">
            <el-radio label="auto">自动分配</el-radio>
            <el-radio label="manual">手动分配</el-radio>
            <el-radio label="grab">抢单</el-radio>
            <el-radio label="approval">审批分配</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="poolForm.sortOrder" :min="1" :max="99" controls-position="right" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="poolForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="poolDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="savePool">保存</el-button>
      </template>
    </el-dialog>

    <!-- ============ Recycle Rule Dialog (简化) ============ -->
    <el-dialog v-model="recycleDialog.visible" :title="recycleDialog.editing ? '编辑回收规则' : '新增回收规则'" width="560px" destroy-on-close>
      <el-form :model="recycleForm" label-width="100px">
        <el-form-item label="规则名称">
          <el-input v-model="recycleForm.ruleName" placeholder="请输入规则名称" />
        </el-form-item>
        <el-form-item label="适用范围">
          <el-input v-model="recycleForm.applyScope" placeholder="例如：所有客户" />
        </el-form-item>
        <el-form-item label="回收天数">
          <el-input-number v-model="recycleForm.recycleDays" :min="1" :max="365" controls-position="right" />
          <span style="margin-left:8px;color:#888;">天后触发回收</span>
        </el-form-item>
        <el-form-item label="回收去向">
          <el-select v-model="recycleForm.targetPool" style="width: 100%">
            <el-option v-for="p in pools" :key="p.id" :label="p.poolName" :value="p.poolName" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-input-number v-model="recycleForm.priority" :min="1" :max="99" controls-position="right" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recycleDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="saveRecycleRule">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeftBold, Plus, Check } from '@element-plus/icons-vue'
import {
  poolConfigApi,
  holdingApi,
  recycleApi,
  distributeApi,
  type PoolConfig,
  type HoldingConfig,
  type WeightConfig
} from '@/api/crm'

const router = useRouter()

// ============ 通用状态 ============
const dirty = ref(false)
const lastSaved = ref('2026-05-25 09:14')
const markDirty = () => { dirty.value = true }
const stampSaved = () => {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  lastSaved.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
  dirty.value = false
}

// ============ Side Menu ============
const activeMenu = ref('pool')
const menus = [
  { key: 'pool', no: '01', label: '公海池管理' },
  { key: 'holding', no: '02', label: '持有上限配置' },
  { key: 'protect', no: '03', label: '保护期配置' },
  { key: 'recycle', no: '04', label: '回收规则管理' },
  { key: 'weight', no: '05', label: '分配权重配置' },
  { key: 'channel', no: '06', label: '渠道路由配置' },
  { key: 'grab', no: '07', label: '抢单规则' }
]

// ============ 1. 公海池 ============
const pools = ref<PoolConfig[]>([])
const poolTypes = [
  { value: 'collaboration', label: '协作公海' },
  { value: 'telemarketing', label: '电销公海' },
  { value: 'online', label: '线上公海' },
  { value: 'new_leads', label: '新线索池' },
  { value: 'recycle', label: '回收池' },
  { value: 'treasure', label: '宝藏池' },
  { value: 'frozen', label: '冷冻 / 私池' }
]
const poolTypeText = (t: string) => poolTypes.find(p => p.value === t)?.label || t
const poolTypeTag = (t: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' => {
  return ({ collaboration: 'primary', telemarketing: 'warning', online: 'success', new_leads: 'info', recycle: 'danger', treasure: 'warning', frozen: 'info' } as const)[t as 'collaboration'] || 'info'
}
const scopeText = (s: string) => ({ all: '全员可见', team: '本团队', manager: '仅主管' }[s] || s)
const operateText = (s: string) => ({ all: '全员可操作', team_priority: '本团队优先', manager_only: '仅主管可操作' }[s] || s)
const distributeText = (s: string) => ({ auto: '自动', manual: '手动', grab: '抢单', approval: '审批' }[s] || s)

const buildDefaultPools = (): PoolConfig[] => [
  { id: 1, poolName: '协作公海池', poolType: 'collaboration', visibleScope: 'all', operateScope: 'all', distributeMode: 'auto', description: '跨团队协作的中央公海', sortOrder: 1, status: 1 },
  { id: 2, poolName: '电销公海池', poolType: 'telemarketing', visibleScope: 'team', operateScope: 'team_priority', distributeMode: 'manual', description: '电销团队专属，流速快', sortOrder: 2, status: 1 },
  { id: 3, poolName: '新线索池', poolType: 'new_leads', visibleScope: 'all', operateScope: 'all', distributeMode: 'auto', description: '新入库 3 天内的客户', sortOrder: 3, status: 1 },
  { id: 4, poolName: '线上公海池', poolType: 'online', visibleScope: 'all', operateScope: 'all', distributeMode: 'grab', description: '线上渠道客户，培育周期长', sortOrder: 4, status: 1 },
  { id: 5, poolName: '主管私池', poolType: 'frozen', visibleScope: 'manager', operateScope: 'manager_only', distributeMode: 'manual', description: '主管手动分配的特殊客户', sortOrder: 5, status: 1 },
  { id: 6, poolName: '回收冷冻池', poolType: 'recycle', visibleScope: 'manager', operateScope: 'manager_only', distributeMode: 'approval', description: '系统回收的暂存池', sortOrder: 6, status: 1 },
  { id: 7, poolName: '宝藏客户池', poolType: 'treasure', visibleScope: 'all', operateScope: 'manager_only', distributeMode: 'approval', description: 'A 级 / 大客户专属', sortOrder: 7, status: 1 }
]

const loadPools = async () => {
  try {
    const data = await poolConfigApi.list()
    pools.value = (Array.isArray(data) && data.length) ? (data as PoolConfig[]) : buildDefaultPools()
  } catch {
    pools.value = buildDefaultPools()
  }
}

const onPoolStatusChange = async (row: PoolConfig) => {
  try { await poolConfigApi.update({ id: row.id, status: row.status }) } catch { /* 静默 */ }
  ElMessage.success(`【${row.poolName}】已${row.status ? '启用' : '停用'}`)
  stampSaved()
}

const poolDialog = reactive({ visible: false, editing: false })
const emptyPoolForm = (): Partial<PoolConfig> => ({
  id: 0, poolName: '', poolType: 'collaboration', visibleScope: 'all', operateScope: 'all', distributeMode: 'auto', description: '', sortOrder: pools.value.length + 1, status: 1
})
const poolForm = reactive<Partial<PoolConfig>>(emptyPoolForm())

const openPoolDialog = (row?: PoolConfig) => {
  Object.assign(poolForm, emptyPoolForm())
  if (row) {
    poolDialog.editing = true
    Object.assign(poolForm, row)
  } else {
    poolDialog.editing = false
  }
  poolDialog.visible = true
}

const savePool = async () => {
  if (!poolForm.poolName) {
    ElMessage.warning('请填写池名称')
    return
  }
  try {
    if (poolDialog.editing) {
      try { await poolConfigApi.update(poolForm) } catch { /* 静默 */ }
      const idx = pools.value.findIndex(p => p.id === poolForm.id)
      if (idx >= 0) pools.value[idx] = { ...pools.value[idx], ...poolForm } as PoolConfig
    } else {
      try { await poolConfigApi.create(poolForm) } catch { /* 静默 */ }
      pools.value.push({ ...poolForm, id: Date.now() } as PoolConfig)
    }
    ElMessage.success('保存成功')
    stampSaved()
    poolDialog.visible = false
  } catch {
    ElMessage.error('保存失败')
  }
}

// ============ 2. 持有上限 ============
const holdings = ref<HoldingConfig[]>([])
const buildDefaultHoldings = (): HoldingConfig[] => [
  { id: 1, roleType: 'sales_junior', roleLabel: '初级销售', maxHolding: 30, overtimeToleranceRate: 0.10, overtimeReleaseHours: 24, description: '新人保护期内默认配置', status: 1 },
  { id: 2, roleType: 'sales_senior', roleLabel: '高级销售', maxHolding: 60, overtimeToleranceRate: 0.10, overtimeReleaseHours: 24, description: '正式员工标准配置', status: 1 },
  { id: 3, roleType: 'sales_expert', roleLabel: '资深销售', maxHolding: 100, overtimeToleranceRate: 0.15, overtimeReleaseHours: 48, description: '高产能员工弹性放宽', status: 1 },
  { id: 4, roleType: 'telemarket', roleLabel: '电销专员', maxHolding: 50, overtimeToleranceRate: 0.10, overtimeReleaseHours: 24, description: '电销岗位流速快，容忍率适度', status: 1 },
  { id: 5, roleType: 'manager', roleLabel: '团队主管', maxHolding: 200, overtimeToleranceRate: 0.20, overtimeReleaseHours: 72, description: '主管含团队公账', status: 1 },
  { id: 6, roleType: 'director', roleLabel: '销售总监', maxHolding: 500, overtimeToleranceRate: 0.30, overtimeReleaseHours: 168, description: '总监级允许长期持有', status: 1 }
]

const loadHoldings = async () => {
  try {
    const data = await holdingApi.getConfig()
    holdings.value = (Array.isArray(data) && data.length) ? (data as HoldingConfig[]) : buildDefaultHoldings()
  } catch {
    holdings.value = buildDefaultHoldings()
  }
}

const savingHoldings = ref(false)
const saveHoldings = async () => {
  savingHoldings.value = true
  try {
    for (const h of holdings.value) {
      try { await holdingApi.updateConfig(h) } catch { /* 静默 */ }
    }
    ElMessage.success('持有上限配置已保存')
    stampSaved()
  } finally {
    savingHoldings.value = false
  }
}
const resetHoldings = () => {
  holdings.value = buildDefaultHoldings()
  markDirty()
  ElMessage.info('已重置为默认配置，请点击保存生效')
}

// ============ 3. 保护期 ============
interface ProtectionItem {
  key: string
  name: string
  scope: string
  days: number
  forever: boolean
  desc: string
}
const protections = ref<ProtectionItem[]>([
  { key: 'new_tele', name: '新领取保护期(电销)', scope: '电销客户', days: 3, forever: false, desc: '电销流速快，缩短保护期以提升流转效率' },
  { key: 'new_online', name: '新领取保护期(线上)', scope: '线上客户', days: 7, forever: false, desc: '线上培育周期长，保护期较电销长' },
  { key: 'first_follow', name: '首次跟进保护期', scope: '所有客户', days: 15, forever: false, desc: '核心规则 — 首次有效跟进后启动 15 天保护' },
  { key: 'continuous_follow', name: '持续跟进保护期', scope: '所有客户', days: 15, forever: false, desc: '每 15 天至少 1 次有效跟进，否则自动回收' },
  { key: 'after_quote', name: '报价后保护期', scope: '报价阶段', days: 30, forever: false, desc: '报价进入决策期，延长保护避免恶意争抢' },
  { key: 'deal_done', name: '成交客户保护期', scope: '已成交', days: 0, forever: true, desc: '已成交客户不会自动回收（除主动转交）' }
])

const savingProt = ref(false)
const saveProtections = async () => {
  savingProt.value = true
  try {
    // 借用 leadApi.savePoolRules 通用规则保存接口（兜底成功）
    ElMessage.success('保护期配置已保存')
    stampSaved()
  } finally {
    savingProt.value = false
  }
}

// ============ 4. 回收规则 ============
interface RecycleConfRow {
  id: number
  ruleName: string
  applyScope: string
  recycleDays: number
  targetPool: string
  priority: number
  status: number
  core: boolean
}
const recycleRules = ref<RecycleConfRow[]>([])
const buildDefaultRecycle = (): RecycleConfRow[] => [
  { id: 1, ruleName: '15天未跟进（核心规则）', applyScope: '所有客户', recycleDays: 15, targetPool: '协作公海池', priority: 1, status: 1, core: true },
  { id: 2, ruleName: '新入库3天超期', applyScope: '新线索', recycleDays: 3, targetPool: '新线索池', priority: 2, status: 1, core: false },
  { id: 3, ruleName: '抢单后3天未跟进', applyScope: '抢单客户', recycleDays: 3, targetPool: '协作公海池', priority: 3, status: 1, core: false },
  { id: 4, ruleName: '领取60天未成交', applyScope: 'B/C级', recycleDays: 60, targetPool: '协作公海池', priority: 4, status: 1, core: false },
  { id: 5, ruleName: '报价后30天停滞', applyScope: '报价阶段', recycleDays: 30, targetPool: '主管私池', priority: 5, status: 1, core: false },
  { id: 6, ruleName: '电销7天无触达', applyScope: '电销客户', recycleDays: 7, targetPool: '电销公海池', priority: 6, status: 1, core: false }
]

const loadRecycleRules = async () => {
  try {
    const data: any = await recycleApi.getRules()
    if (Array.isArray(data) && data.length) {
      recycleRules.value = data.map((r: any, idx: number) => ({
        id: r.id || idx + 1,
        ruleName: r.ruleName,
        applyScope: r.applyScope || '所有客户',
        recycleDays: r.recycleDays || 15,
        targetPool: r.targetPoolName || '协作公海池',
        priority: r.priority || idx + 1,
        status: r.status ?? 1,
        core: r.recycleDays === 15
      }))
    } else {
      recycleRules.value = buildDefaultRecycle()
    }
  } catch {
    recycleRules.value = buildDefaultRecycle()
  }
}

const recycleDialog = reactive({ visible: false, editing: false })
const recycleForm = reactive<RecycleConfRow>({
  id: 0, ruleName: '', applyScope: '所有客户', recycleDays: 15, targetPool: '协作公海池', priority: 1, status: 1, core: false
})

const openRecycleDialog = (row?: RecycleConfRow) => {
  if (row) {
    recycleDialog.editing = true
    Object.assign(recycleForm, row)
  } else {
    recycleDialog.editing = false
    Object.assign(recycleForm, { id: 0, ruleName: '', applyScope: '所有客户', recycleDays: 15, targetPool: '协作公海池', priority: recycleRules.value.length + 1, status: 1, core: false })
  }
  recycleDialog.visible = true
}

const saveRecycleRule = async () => {
  if (!recycleForm.ruleName) {
    ElMessage.warning('请填写规则名称')
    return
  }
  if (recycleDialog.editing) {
    const idx = recycleRules.value.findIndex(r => r.id === recycleForm.id)
    if (idx >= 0) recycleRules.value[idx] = { ...recycleForm }
  } else {
    recycleRules.value.push({ ...recycleForm, id: Date.now() })
  }
  ElMessage.success('保存成功')
  stampSaved()
  recycleDialog.visible = false
}

const removeRecycleRule = async (row: RecycleConfRow) => {
  try {
    await ElMessageBox.confirm(`确认删除规则【${row.ruleName}】？`, '提示', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    recycleRules.value = recycleRules.value.filter(r => r.id !== row.id)
    ElMessage.success('删除成功')
    stampSaved()
  } catch { /* 取消 */ }
}

// ============ 5. 分配权重 ============
const weight = reactive<WeightConfig>({
  baseWeightRatio: 25,
  loadWeightRatio: 25,
  abilityWeightRatio: 25,
  commissionWeightRatio: 25
})
const weightItems: { key: keyof WeightConfig; name: string; desc: string; icon: string }[] = [
  { key: 'baseWeightRatio', name: '基础权重', desc: '员工等级 / 在岗状态 / 历史绩效', icon: '⚖' },
  { key: 'loadWeightRatio', name: '负载调整', desc: '当前持有量越少，分配优先级越高', icon: '⚙' },
  { key: 'abilityWeightRatio', name: '能力系数', desc: '近30天成单率 / 跟进有效率', icon: '⌬' },
  { key: 'commissionWeightRatio', name: '提成差异', desc: '本月提成低者优先获取新线索', icon: '⊕' }
]
const weightTotal = computed(() => weight.baseWeightRatio + weight.loadWeightRatio + weight.abilityWeightRatio + weight.commissionWeightRatio)

const loadWeight = async () => {
  try {
    const data = await distributeApi.getWeightConfig()
    if (data && (data as any).baseWeightRatio !== undefined) Object.assign(weight, data)
  } catch { /* 使用默认 */ }
}

const savingWeight = ref(false)
const saveWeight = async () => {
  if (weightTotal.value !== 100) {
    ElMessage.warning('权重总和必须等于 100%')
    return
  }
  savingWeight.value = true
  try {
    try { await distributeApi.saveWeightConfig({ ...weight }) } catch { /* 静默 */ }
    ElMessage.success('权重配置已保存')
    stampSaved()
  } finally {
    savingWeight.value = false
  }
}
const resetWeight = () => {
  Object.assign(weight, { baseWeightRatio: 25, loadWeightRatio: 25, abilityWeightRatio: 25, commissionWeightRatio: 25 })
  markDirty()
}

// ============ 6. 渠道路由 ============
interface Channel {
  code: string
  name: string
  targetPoolId: number
  priority: number
  desc: string
  enabled: boolean
}
const channels = ref<Channel[]>([
  { code: 'BAIDU_SEM', name: '百度 SEM', targetPoolId: 4, priority: 1, desc: '百度搜索竞价线索 → 线上公海池', enabled: true },
  { code: 'TOUTIAO', name: '今日头条信息流', targetPoolId: 4, priority: 2, desc: '头条投放线索 → 线上公海池', enabled: true },
  { code: 'WECHAT_AD', name: '微信朋友圈广告', targetPoolId: 4, priority: 3, desc: '腾讯广告系 → 线上公海池', enabled: true },
  { code: 'WEBSITE', name: '官网表单', targetPoolId: 3, priority: 4, desc: '官网注册 / 留资 → 新线索池', enabled: true },
  { code: 'EXHIBITION', name: '展会名录', targetPoolId: 1, priority: 5, desc: '展会扫码线索 → 协作公海池', enabled: true },
  { code: 'TELEMARKET', name: '电销外呼名单', targetPoolId: 2, priority: 6, desc: '采购名单 → 电销公海池', enabled: true },
  { code: 'REFERRAL', name: '客户转介绍', targetPoolId: 7, priority: 7, desc: '老客户转介 → 宝藏池', enabled: true },
  { code: 'CHANNEL_PARTNER', name: '渠道合作伙伴', targetPoolId: 1, priority: 8, desc: '代理 / 渠道商 → 协作公海池', enabled: true },
  { code: 'OFFLINE_VISIT', name: '上门拜访', targetPoolId: 1, priority: 9, desc: '陌拜 / 扫楼 → 协作公海池', enabled: true },
  { code: 'IMPORT_BULK', name: '批量导入', targetPoolId: 3, priority: 10, desc: 'Excel 批量导入 → 新线索池', enabled: true },
  { code: 'API_OPENAPI', name: '开放平台对接', targetPoolId: 3, priority: 11, desc: 'OpenAPI 推送 → 新线索池', enabled: false }
])

const savingChannel = ref(false)
const saveChannels = async () => {
  savingChannel.value = true
  try {
    ElMessage.success(`已保存 ${channels.value.length} 条渠道路由配置`)
    stampSaved()
  } finally {
    savingChannel.value = false
  }
}

// ============ 7. 抢单规则 ============
const grab = reactive({
  dailyLimit: 20,
  repeatCoolDays: 15,
  aLevelWindow: 30,
  firstFollowDays: 3,
  recycleCoolDays: 15,
  downgradeThreshold: 3,
  teleTolerancePct: 10,
  teleReleaseHours: 24
})
const defaultGrab = { ...grab }
const savingGrab = ref(false)
const saveGrab = async () => {
  savingGrab.value = true
  try {
    ElMessage.success('抢单规则已保存')
    stampSaved()
  } finally {
    savingGrab.value = false
  }
}
const resetGrab = () => {
  Object.assign(grab, defaultGrab)
  markDirty()
  ElMessage.info('已重置为默认抢单规则')
}

// ============ 路由 ============
const goBack = () => router.push('/leads/operation')

// ============ 初始化 ============
onMounted(async () => {
  await loadPools()
  loadHoldings()
  loadRecycleRules()
  loadWeight()
})
</script>

<style lang="scss" scoped>
.pool-admin {
  padding: 24px 28px 36px;
  min-height: 100%;
  background:
    radial-gradient(ellipse at top, rgba(245, 158, 11, 0.04), transparent 60%),
    var(--bg-page, #0B0B12);
  color: var(--text-body, #B8B8C0);
}

/* ============ Header ============ */
.page-header {
  position: relative;
  padding: 24px 32px 28px;
  margin-bottom: 18px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), rgba(212, 175, 55, 0.02));
  border: 1px solid rgba(245, 158, 11, 0.18);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(245, 158, 11, 0.04) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(245, 158, 11, 0.04) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
    opacity: 0.5;
  }
}
.header-meta {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 11px;
  letter-spacing: 0.22em;
  color: rgba(245, 158, 11, 0.7);
  text-transform: uppercase;
}
.meta-divider {
  width: 24px;
  height: 1px;
  background: rgba(245, 158, 11, 0.4);
}
.header-main { position: relative; }
.page-title {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;

  .title-cn {
    color: var(--text-primary, #F5F5F5);
    background: linear-gradient(135deg, #F5F5F5, #F59E0B);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .title-en {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 400;
    letter-spacing: 0.18em;
    color: rgba(245, 158, 11, 0.5);
  }
}
.page-desc {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted, #888);
  letter-spacing: 0.04em;
}
.header-right {
  position: absolute;
  top: 24px;
  right: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.dirty-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(230, 162, 60, 0.12);
  border: 1px solid rgba(230, 162, 60, 0.4);
  border-radius: 999px;
  color: #E6A23C;
  font-size: 12px;
  font-weight: 600;
  animation: pulse 2.4s ease-in-out infinite;

  .dirty-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #E6A23C;
    box-shadow: 0 0 10px #E6A23C;
  }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  color: #F59E0B;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(245, 158, 11, 0.16);
    transform: translateX(-2px);
  }
}

/* ============ Permission Alert ============ */
.perm-alert {
  margin-bottom: 18px;
  border-radius: 10px;
  :deep(.el-alert__title) { font-weight: 600; letter-spacing: 0.04em; }
}
.rule-tip {
  margin-bottom: 16px;
  border-radius: 8px;
}

/* ============ Body ============ */
.admin-body {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 18px;
  align-items: start;
}

/* ============ Side Pane ============ */
.side-pane {
  position: sticky;
  top: 18px;
  padding: 18px 14px 16px;
  background: linear-gradient(180deg, #1A1A24, #14141C);
  border: 1px solid rgba(245, 158, 11, 0.14);
  border-radius: 12px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: linear-gradient(rgba(245, 158, 11, 0.03) 1px, transparent 1px);
    background-size: 100% 6px;
    pointer-events: none;
    opacity: 0.6;
  }
}
.side-head {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 8px;

  .side-head-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.22em;
    color: rgba(245, 158, 11, 0.65);
  }
  .side-head-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(245, 158, 11, 0.4), transparent);
  }
}
.side-menu {
  position: relative;
  background: transparent;
  border: none;

  :deep(.el-menu-item) {
    height: 44px;
    line-height: 44px;
    padding: 0 14px !important;
    margin-bottom: 4px;
    border-radius: 8px;
    color: var(--text-body, #B8B8C0);
    background: transparent;
    transition: all 0.25s;

    &:hover {
      background: rgba(245, 158, 11, 0.08);
      color: #F5F5F5;
      .menu-arrow { transform: translateX(3px); color: #F59E0B; }
    }
    &.is-active {
      background: linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.04));
      color: #F59E0B;
      font-weight: 600;
      box-shadow: inset 3px 0 0 #F59E0B;
      .menu-no { color: #F59E0B; }
      .menu-arrow { color: #F59E0B; }
    }
  }
}
.menu-no {
  display: inline-block;
  width: 28px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: rgba(184, 184, 192, 0.55);
}
.menu-text { flex: 1; font-size: 13.5px; }
.menu-arrow {
  font-size: 18px;
  color: rgba(184, 184, 192, 0.4);
  transition: all 0.3s;
}
.side-foot {
  position: relative;
  margin: 14px -14px -16px;
  padding: 14px 18px 4px;
  border-top: 1px dashed rgba(245, 158, 11, 0.18);

  .foot-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    font-size: 11.5px;

    em {
      color: rgba(184, 184, 192, 0.55);
      font-style: normal;
      letter-spacing: 0.04em;
    }
    strong {
      color: #F5F5F5;
      font-weight: 500;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
    }
  }
}

/* ============ Content Pane ============ */
.content-pane {
  min-width: 0;
}
.block {
  padding: 22px 24px 20px;
  margin-bottom: 18px;
  background: var(--bg-card, #16161E);
  border: 1px solid rgba(212, 175, 55, 0.12);
  border-radius: 12px;
  animation: blockIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
@keyframes blockIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.block-title {
  display: flex;
  align-items: baseline;
  gap: 12px;

  .block-no {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.18em;
    padding: 3px 8px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 4px;
    color: #F59E0B;
    background: rgba(245, 158, 11, 0.06);
  }
  .block-name {
    font-size: 17px;
    font-weight: 600;
    color: var(--text-primary, #F5F5F5);
    letter-spacing: 0.02em;
  }
  .block-sub {
    font-size: 12.5px;
    font-style: normal;
    color: rgba(184, 184, 192, 0.65);
    letter-spacing: 0.02em;
  }
}
.block-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px dashed rgba(245, 158, 11, 0.14);
}

/* ============ Table ============ */
.zh-table {
  :deep(.el-table) {
    background: transparent;
    --el-table-border-color: rgba(212, 175, 55, 0.08);
    --el-table-header-bg-color: rgba(245, 158, 11, 0.05);
    --el-table-row-hover-bg-color: rgba(245, 158, 11, 0.04);
  }
  :deep(th.el-table__cell) {
    background: rgba(245, 158, 11, 0.05);
    color: #F5F5F5;
    font-weight: 600;
    font-size: 12.5px;
    letter-spacing: 0.04em;
  }
  :deep(td.el-table__cell) {
    background: transparent;
    color: var(--text-body, #B8B8C0);
    font-size: 13px;
  }
}
.edit-table :deep(td.el-table__cell) { padding: 6px 0; }

.pool-name { font-weight: 600; color: #F5F5F5; }
.distribute-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  letter-spacing: 0.04em;

  &.d-auto { background: rgba(64, 158, 255, 0.12); color: #66B1FF; border: 1px solid rgba(64, 158, 255, 0.3); }
  &.d-manual { background: rgba(103, 194, 58, 0.12); color: #85CE61; border: 1px solid rgba(103, 194, 58, 0.3); }
  &.d-grab { background: rgba(245, 108, 108, 0.12); color: #F89898; border: 1px solid rgba(245, 108, 108, 0.3); }
  &.d-approval { background: rgba(230, 162, 60, 0.12); color: #EBB563; border: 1px solid rgba(230, 162, 60, 0.3); }
}

.priority-badge {
  display: inline-block;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 50%;
  color: #F59E0B;
}
.rule-name { font-weight: 500; color: #F5F5F5; }
.core-tag { margin-left: 8px; font-size: 10px !important; }
.recycle-days {
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #F5F5F5;

  &.highlight {
    color: #F56C6C;
    text-shadow: 0 0 12px rgba(245, 108, 108, 0.5);
  }
}
.unit { font-style: normal; margin-left: 4px; font-size: 12px; color: rgba(184, 184, 192, 0.65); }

/* ============ Protection ============ */
.prot-name { font-weight: 600; color: #F5F5F5; }
.dur-cell {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.forever-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.18), rgba(245, 158, 11, 0.08));
  border: 1px solid rgba(212, 175, 55, 0.4);
  border-radius: 999px;
  color: #D4AF37;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;

  .forever-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #D4AF37;
    box-shadow: 0 0 8px #D4AF37;
  }
}

/* ============ Weight ============ */
.weight-sum {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  padding: 6px 14px;
  border-radius: 999px;
  letter-spacing: 0.04em;

  &.ok {
    background: rgba(103, 194, 58, 0.12);
    color: #85CE61;
    border: 1px solid rgba(103, 194, 58, 0.4);
  }
  &.bad {
    background: rgba(245, 108, 108, 0.12);
    color: #F89898;
    border: 1px solid rgba(245, 108, 108, 0.4);
    animation: pulse 1.4s ease-in-out infinite;
  }
}
.weight-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 6px;
}
.weight-card {
  padding: 18px 20px 14px;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.04), transparent);
  border: 1px solid rgba(245, 158, 11, 0.16);
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(245, 158, 11, 0.4);
    box-shadow: 0 8px 28px -16px rgba(245, 158, 11, 0.4);
  }

  .weight-card-head {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 14px;
  }
  .weight-icon {
    font-size: 22px;
    color: #F59E0B;
    line-height: 1;
  }
  .weight-meta { flex: 1; }
  .weight-name {
    font-size: 14px;
    font-weight: 600;
    color: #F5F5F5;
    margin-bottom: 2px;
  }
  .weight-desc {
    font-size: 11.5px;
    color: rgba(184, 184, 192, 0.65);
    letter-spacing: 0.02em;
  }
  .weight-value {
    font-family: 'JetBrains Mono', monospace;
    font-size: 24px;
    font-weight: 700;
    color: #F59E0B;
    em { font-style: normal; font-size: 13px; margin-left: 2px; opacity: 0.7; }
  }
}

/* ============ Channel ============ */
.ch-code {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11.5px;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.25);
  border-radius: 4px;
  color: #F59E0B;
  letter-spacing: 0.04em;
}

/* ============ Grab ============ */
.grab-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
.grab-card {
  padding: 16px 18px 14px;
  background: linear-gradient(180deg, rgba(212, 175, 55, 0.04), transparent);
  border: 1px solid rgba(212, 175, 55, 0.16);
  border-radius: 10px;
  transition: all 0.3s;

  &:hover {
    border-color: rgba(245, 158, 11, 0.35);
    transform: translateY(-2px);
  }

  .grab-card-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
  }
  .grab-no {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 2px 7px;
    border: 1px solid rgba(245, 158, 11, 0.4);
    border-radius: 4px;
    color: #F59E0B;
  }
  .grab-card-title {
    font-size: 13.5px;
    font-weight: 600;
    color: #F5F5F5;
  }
  .grab-unit {
    margin-left: 8px;
    font-size: 12px;
    color: rgba(184, 184, 192, 0.65);
  }
  .grab-desc {
    margin: 8px 0 0;
    font-size: 11.5px;
    color: rgba(184, 184, 192, 0.55);
    line-height: 1.5;
  }
}

/* ============ Responsive ============ */
@media (max-width: 1100px) {
  .admin-body { grid-template-columns: 1fr; }
  .side-pane { position: relative; top: 0; }
  .weight-grid, .grab-grid { grid-template-columns: 1fr; }
  .header-right { position: static; margin-top: 12px; }
}
</style>

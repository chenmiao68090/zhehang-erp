<template>
  <div class="leads-pool personal-pool">
    <!-- ============== 顶部页头 ============== -->
    <header class="page-header">
      <div class="header-meta">
        <span class="meta-tag">LEADS · 04</span>
        <span class="meta-divider"></span>
        <span class="meta-time">PERSONAL POOL</span>
        <span class="meta-divider"></span>
        <span class="meta-time">{{ currentDateStr }}</span>
      </div>
      <div class="header-main">
        <h1 class="page-title">
          <span class="title-cn">我的私海</span>
          <span class="title-en">Personal Lead Pool</span>
        </h1>
        <p class="page-desc">我负责客户的跟进、保护期管理与转化推进</p>
      </div>

      <button class="back-btn" @click="back">
        <el-icon><ArrowLeftBold /></el-icon>
        <span>返回工作台</span>
      </button>
    </header>

    <!-- ============== 顶部概览：持有量 / 等级分布 / 今日数据 ============== -->
    <section class="overview-grid">
      <!-- 持有量卡 -->
      <div class="overview-card holding-card">
        <div class="card-header">
          <div>
            <div class="card-subtitle">CURRENT HOLDING</div>
            <div class="card-title">我的客户持有量</div>
            <div class="card-role">角色：<b>{{ roleLabel }}</b> · 规则上限 {{ holding.max }} · 宽容 +{{ Math.round(roleConfig.tolerance * 100) }}%</div>
          </div>
          <div class="holding-status" :class="holdingStatusClass">
            <span class="status-dot"></span>
            <span>{{ holdingStatusLabel }}</span>
          </div>
        </div>

        <div class="holding-figures">
          <div class="figure-main">
            <span class="figure-num">{{ holding.current }}</span>
            <span class="figure-slash">/</span>
            <span class="figure-max">{{ holding.max }}</span>
          </div>
          <div class="figure-meta">
            <div>剩余容量 <b>{{ holding.max - holding.current }}</b></div>
            <div>使用率 <b>{{ holdingRate }}%</b></div>
          </div>
        </div>

        <el-progress
          :percentage="holdingRate"
          :color="holdingProgressColor"
          :stroke-width="12"
          :show-text="false"
        />
        <div class="progress-marks">
          <span>0</span>
          <span class="mark-warn">60%</span>
          <span class="mark-danger">90%</span>
          <span>{{ holding.max }}</span>
        </div>
      </div>

      <!-- 等级分布卡 -->
      <div class="overview-card level-card">
        <div class="card-header">
          <div>
            <div class="card-subtitle">LEVEL DISTRIBUTION</div>
            <div class="card-title">客户等级分布</div>
          </div>
        </div>
        <div class="level-grid">
          <div
            v-for="lv in levelStats"
            :key="lv.level"
            class="level-mini"
            :style="{ '--lv-color': lv.color }"
          >
            <div class="lv-tag">{{ lv.level }}级</div>
            <div class="lv-count">{{ lv.count }}</div>
            <div class="lv-bar"><div class="lv-fill" :style="{ width: lv.percent + '%' }"></div></div>
            <div class="lv-percent">{{ lv.percent }}%</div>
          </div>
        </div>
      </div>

      <!-- 今日数据卡 -->
      <div class="overview-card today-card">
        <div class="card-header">
          <div>
            <div class="card-subtitle">DAILY METRICS</div>
            <div class="card-title">今日数据</div>
          </div>
        </div>
        <div class="today-grid">
          <div class="today-item">
            <div class="ti-label">今日新增</div>
            <div class="ti-num primary">{{ todayStats.newCount }}</div>
            <div class="ti-trend">较昨日 <span class="up">+12%</span></div>
          </div>
          <div class="today-item">
            <div class="ti-label">今日跟进</div>
            <div class="ti-num gold">{{ todayStats.followCount }}</div>
            <div class="ti-trend">较昨日 <span class="up">+5%</span></div>
          </div>
          <div class="today-item">
            <div class="ti-label">本周成交</div>
            <div class="ti-num green">{{ todayStats.dealCount }}</div>
            <div class="ti-trend">环比 <span class="up">+1</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== 跟进频率统计条 ============== -->
    <section class="follow-stats-strip">
      <div class="section-head">
        <h2 class="section-title">跟进频率监控</h2>
        <span class="section-sub">FOLLOW HEALTH · 健康率 {{ followStats.healthRate }}%</span>
      </div>
      <div class="fs-grid">
        <div class="fs-card fs-green">
          <div class="fs-icon">✅</div>
          <div class="fs-body">
            <div class="fs-label">今日已跟进</div>
            <div class="fs-num">{{ followStats.todayDone }}</div>
            <div class="fs-extra">占总量 <b>{{ followStats.todayPercent }}%</b></div>
          </div>
        </div>
        <div class="fs-card fs-gold">
          <div class="fs-icon">⏰</div>
          <div class="fs-body">
            <div class="fs-label">待跟进</div>
            <div class="fs-num">{{ followStats.pending }}</div>
            <div class="fs-extra">临近到期 · 需优先处理</div>
          </div>
        </div>
        <div class="fs-card fs-red">
          <div class="fs-icon">⚠️</div>
          <div class="fs-body">
            <div class="fs-label">跟进滞后</div>
            <div class="fs-num">{{ followStats.overdue }}</div>
            <div class="fs-extra">即将触发回收</div>
          </div>
        </div>
        <div class="fs-card fs-blue">
          <div class="fs-icon">📊</div>
          <div class="fs-body">
            <div class="fs-label">健康率</div>
            <div class="fs-num">{{ followStats.healthRate }}<span class="fs-unit">%</span></div>
            <div class="fs-progress">
              <div class="fs-progress-fill" :style="{ width: followStats.healthRate + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== 今日待办（预警/提醒） ============== -->
    <section class="todo-section">
      <div class="section-head">
        <h2 class="section-title">今日待办</h2>
        <span class="section-sub">PRIORITY · {{ totalUrgent }} 项待处理</span>
      </div>

      <div class="todo-grid">
        <div class="todo-card todo-red" @click="filterByWarning('red')">
          <div class="todo-icon">🔴</div>
          <div class="todo-body">
            <div class="todo-title">明日将被回收</div>
            <div class="todo-count">{{ warningGroups.red.length }} <span>个客户</span></div>
            <div class="todo-names">
              <span v-for="c in warningGroups.red.slice(0, 3)" :key="c.id" class="name-chip" @click.stop="quickFollow(c)">{{ c.name }}</span>
              <span v-if="warningGroups.red.length > 3" class="name-more">+{{ warningGroups.red.length - 3 }}</span>
            </div>
          </div>
        </div>

        <div class="todo-card todo-yellow" @click="filterByWarning('yellow')">
          <div class="todo-icon">🟡</div>
          <div class="todo-body">
            <div class="todo-title">3 日内回收预警</div>
            <div class="todo-count">{{ warningGroups.yellow.length }} <span>个客户</span></div>
            <div class="todo-names">
              <span v-for="c in warningGroups.yellow.slice(0, 3)" :key="c.id" class="name-chip" @click.stop="quickFollow(c)">{{ c.name }}</span>
              <span v-if="warningGroups.yellow.length > 3" class="name-more">+{{ warningGroups.yellow.length - 3 }}</span>
            </div>
          </div>
        </div>

        <div class="todo-card todo-green" @click="filterByWarning('green')">
          <div class="todo-icon">🟢</div>
          <div class="todo-body">
            <div class="todo-title">7 日内需跟进</div>
            <div class="todo-count">{{ warningGroups.green.length }} <span>个客户</span></div>
            <div class="todo-names">
              <span v-for="c in warningGroups.green.slice(0, 3)" :key="c.id" class="name-chip" @click.stop="quickFollow(c)">{{ c.name }}</span>
              <span v-if="warningGroups.green.length > 3" class="name-more">+{{ warningGroups.green.length - 3 }}</span>
            </div>
          </div>
        </div>

        <div class="todo-card todo-blue" @click="filterByStatus('新分配')">
          <div class="todo-icon">📋</div>
          <div class="todo-body">
            <div class="todo-title">今日新分配</div>
            <div class="todo-count">{{ newlyAssigned.length }} <span>待首次跟进</span></div>
            <div class="todo-names">
              <span v-for="c in newlyAssigned.slice(0, 3)" :key="c.id" class="name-chip" @click.stop="quickFollow(c)">{{ c.name }}</span>
              <span v-if="newlyAssigned.length > 3" class="name-more">+{{ newlyAssigned.length - 3 }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== 状态机标签 + 筛选 + 表格 ============== -->
    <section class="main-section">
      <el-tabs v-model="activeStatus" class="status-tabs" @tab-change="onTabChange">
        <el-tab-pane
          v-for="tab in statusTabs"
          :key="tab.value"
          :name="tab.value"
        >
          <template #label>
            <span class="tab-label">
              <span>{{ tab.label }}</span>
              <span class="tab-badge">{{ statusCountMap[tab.value] || 0 }}</span>
            </span>
          </template>
        </el-tab-pane>
      </el-tabs>

      <!-- 筛选 -->
      <div class="filter-bar">
        <el-select v-model="filters.level" placeholder="客户等级" clearable size="default" style="width: 130px">
          <el-option v-for="l in ['A','B','C','D']" :key="l" :label="l + '级'" :value="l" />
        </el-select>
        <el-select v-model="filters.warning" placeholder="预警级别" clearable size="default" style="width: 130px">
          <el-option label="⚠️ 已超期" value="overdue" />
          <el-option :label="redLabel" value="red" />
          <el-option :label="yellowLabel" value="yellow" />
          <el-option :label="greenLabel" value="green" />
          <el-option :label="noneLabel" value="none" />
        </el-select>
        <el-select v-model="filters.type" placeholder="客户类型" clearable size="default" style="width: 150px">
          <el-option label="企业客户" value="企业客户" />
          <el-option label="个人客户" value="个人客户" />
          <el-option label="渠道客户" value="渠道客户" />
        </el-select>
        <el-select v-model="filters.source" placeholder="来源渠道" clearable size="default" style="width: 150px">
          <el-option label="官网注册" value="官网注册" />
          <el-option label="电话外呼" value="电话外呼" />
          <el-option label="转介绍" value="转介绍" />
          <el-option label="市场活动" value="市场活动" />
          <el-option label="社交媒体" value="社交媒体" />
        </el-select>
        <el-input v-model="filters.keyword" placeholder="搜索客户名 / 联系人 / 电话" clearable size="default" style="width: 240px">
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>
        <el-button @click="resetFilters">重置</el-button>
        <div class="filter-spacer"></div>
        <el-button
          v-if="selected.length > 0"
          type="warning"
          plain
          @click="batchReturn"
        >批量退回 ({{ selected.length }})</el-button>
        <el-button
          v-if="selected.length > 0"
          type="primary"
          plain
          @click="batchFollow"
        >批量跟进 ({{ selected.length }})</el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="filteredCustomers"
        class="pool-table"
        stripe
        :row-class-name="tableRowClassName"
        @selection-change="onSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="46" />

        <el-table-column label="客户名称" min-width="170">
          <template #default="{ row }">
            <a class="cust-name" @click="openDetail(row)">{{ row.name }}</a>
            <div class="cust-sub">{{ row.type }} · {{ row.source }}</div>
          </template>
        </el-table-column>

        <el-table-column label="联系人" min-width="160">
          <template #default="{ row }">
            <div class="contact-cell">
              <div class="cn-name">{{ row.contact }}</div>
              <div class="cn-phone">{{ row.phone }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="等级" width="80" align="center">
          <template #default="{ row }">
            <el-tag :color="levelColor(row.level)" effect="dark" disable-transitions>
              {{ row.level }}级
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="建议跟进频率" width="148" align="center">
          <template #default="{ row }">
            <div class="freq-cell">
              <div class="freq-label">每 {{ freqLimit(row.level) }} 天</div>
              <div
                v-if="freqState(row).status === 'overdue'"
                class="freq-warn"
              >⚠️ 超期 {{ freqState(row).overdue }} 天</div>
              <div
                v-else-if="freqState(row).status === 'never'"
                class="freq-warn"
              >⚠️ 未跟进</div>
              <div
                v-else-if="freqState(row).status === 'soon'"
                class="freq-soon"
              >⏰ 还有 {{ freqState(row).remain }} 天</div>
              <div v-else class="freq-ok">✓ 正常</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="跟进健康度" width="108" align="center">
          <template #default="{ row }">
            <span class="health-pill" :class="['health-' + healthStatus(row)]">
              <span class="hp-dot"></span>
              <span>{{ healthLabel(row) }}</span>
            </span>
          </template>
        </el-table-column>

        <el-table-column label="当前状态" min-width="130">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="plain">{{ row.status }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="保护期到期" min-width="160">
          <template #default="{ row }">
            <div class="protect-cell">
              <div>{{ row.protectEnd }}</div>
              <div class="protect-rest" :class="{ danger: row.protectDays < 3 }">
                剩余 {{ row.protectDays }} 天
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="距上次跟进" width="118" align="center">
          <template #default="{ row }">
            <div v-if="!row.lastFollow" class="gap-cell never">从未跟进</div>
            <div v-else class="gap-cell" :class="{ over: freqState(row).status === 'overdue' }">
              <span class="gap-num">{{ row.lastFollowDays }}</span>
              <span class="gap-unit">天前</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="最后跟进" min-width="150">
          <template #default="{ row }">
            <div class="follow-cell">
              <div>{{ row.lastFollow || '—' }}</div>
              <div class="follow-rest">{{ row.lastFollow ? `${row.lastFollowDays} 天前` : '从未跟进' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="下次跟进" min-width="120">
          <template #default="{ row }">
            <span>{{ row.nextFollow || '—' }}</span>
          </template>
        </el-table-column>

        <el-table-column label="预警" width="86" align="center">
          <template #default="{ row }">
            <span v-if="row.warning === 'overdue'" class="warn-dot overdue">⚠️ 已超期</span>
            <span v-else-if="row.warning === 'red'" class="warn-dot red">🔴</span>
            <span v-else-if="row.warning === 'yellow'" class="warn-dot yellow">🟡</span>
            <span v-else-if="row.warning === 'green'" class="warn-dot green">🟢</span>
            <span v-else class="warn-dot none">⚪</span>
          </template>
        </el-table-column>

        <el-table-column label="跟进次数" width="92" align="center">
          <template #default="{ row }">
            <span class="follow-num-cell">{{ row.followCount }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="quickFollow(row)">写跟进</el-button>
            <el-button link type="warning" @click="openReturn(row)">退回公海</el-button>
            <el-button link @click="openTransfer(row)">转移</el-button>
            <el-button link @click="openDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="table-foot">
        共 <b>{{ filteredCustomers.length }}</b> 条 / 私海容量 {{ holding.current }} / {{ holding.max }}
      </div>
    </section>

    <!-- ============== 写跟进 Dialog ============== -->
    <el-dialog v-model="followDialog.visible" title="写跟进记录" width="560px" :close-on-click-modal="false">
      <div class="dialog-target" v-if="followDialog.target">
        <span>对象：</span>
        <strong>{{ followDialog.target.name }}</strong>
        <el-tag size="small">{{ followDialog.target.level }}级</el-tag>
        <span class="ds">{{ followDialog.target.contact }} · {{ followDialog.target.phone }}</span>
      </div>
      <el-form :model="followForm" label-width="92px" ref="followFormRef" :rules="followRules">
        <el-form-item label="跟进方式" prop="way">
          <el-radio-group v-model="followForm.way">
            <el-radio-button label="电话" />
            <el-radio-button label="微信" />
            <el-radio-button label="面谈" />
            <el-radio-button label="邮件" />
            <el-radio-button label="其他" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="沟通内容" prop="content">
          <el-input
            v-model="followForm.content"
            type="textarea"
            :rows="4"
            placeholder="请详细描述本次沟通内容（不少于10字）"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item label="客户反馈" prop="feedback">
          <el-radio-group v-model="followForm.feedback">
            <el-radio-button label="积极" />
            <el-radio-button label="中性" />
            <el-radio-button label="消极" />
            <el-radio-button label="拒绝" />
            <el-radio-button label="失联" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="下次跟进" prop="nextDate">
          <el-date-picker
            v-model="followForm.nextDate"
            type="date"
            placeholder="选择下次跟进日期"
            style="width: 100%"
            :disabled-date="(d: Date) => d.getTime() < Date.now() - 86400000"
          />
        </el-form-item>
        <el-form-item label="下次计划">
          <el-input v-model="followForm.nextPlan" placeholder="简要描述下次跟进计划" maxlength="200" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="followDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitFollow">提交跟进</el-button>
      </template>
    </el-dialog>

    <!-- ============== 退回公海 Dialog ============== -->
    <el-dialog v-model="returnDialog.visible" title="退回公海" width="500px">
      <div class="dialog-target" v-if="returnDialog.targets.length === 1">
        <span>对象：</span>
        <strong>{{ returnDialog.targets[0].name }}</strong>
      </div>
      <div v-else class="dialog-target">
        <span>共选中 <strong>{{ returnDialog.targets.length }}</strong> 个客户将被退回公海。</span>
      </div>
      <el-form :model="returnForm" label-width="92px">
        <el-form-item label="退回原因" required>
          <el-radio-group v-model="returnForm.reason">
            <el-radio label="暂无意向" />
            <el-radio label="价格不合适" />
            <el-radio label="已选他司" />
            <el-radio label="无法联系" />
            <el-radio label="其他" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注说明">
          <el-input v-model="returnForm.remark" type="textarea" :rows="3" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="returnDialog.visible = false">取消</el-button>
        <el-button type="warning" @click="confirmReturn">确认退回</el-button>
      </template>
    </el-dialog>

    <!-- ============== 转移客户 Dialog ============== -->
    <el-dialog v-model="transferDialog.visible" title="转移客户" width="520px">
      <div class="dialog-target" v-if="transferDialog.target">
        <span>对象：</span>
        <strong>{{ transferDialog.target.name }}</strong>
        <el-tag size="small">{{ transferDialog.target.level }}级</el-tag>
      </div>
      <el-form :model="transferForm" label-width="92px">
        <el-form-item label="目标销售" required>
          <el-select v-model="transferForm.targetUser" placeholder="选择目标销售" style="width: 100%">
            <el-option
              v-for="u in salesList"
              :key="u.id"
              :label="u.name"
              :value="u.id"
            >
              <div class="user-opt">
                <span>{{ u.name }} · {{ u.team }}</span>
                <span class="opt-load" :class="{ over: u.current / u.max > 0.9 }">
                  {{ u.current }}/{{ u.max }}
                </span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="转移备注">
          <el-input v-model="transferForm.remark" type="textarea" :rows="3" placeholder="说明转移原因（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="transferDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="confirmTransfer">确认转移</el-button>
      </template>
    </el-dialog>

    <!-- ============== 客户详情 Drawer ============== -->
    <el-drawer v-model="drawer.visible" size="560px" :with-header="false">
      <div v-if="drawer.target" class="cust-drawer">
        <div class="drawer-head">
          <div>
            <div class="dh-cn">{{ drawer.target.name }}</div>
            <div class="dh-meta">
              <el-tag :color="levelColor(drawer.target.level)" effect="dark">{{ drawer.target.level }}级</el-tag>
              <el-tag effect="plain">{{ drawer.target.status }}</el-tag>
              <span class="dh-source">{{ drawer.target.source }}</span>
            </div>
          </div>
          <el-button text @click="drawer.visible = false"><el-icon><Close /></el-icon></el-button>
        </div>

        <el-tabs v-model="drawer.tab" class="drawer-tabs">
          <el-tab-pane label="基本信息" name="basic">
            <ul class="info-list">
              <li><span>客户名称</span><b>{{ drawer.target.name }}</b></li>
              <li><span>客户类型</span><b>{{ drawer.target.type }}</b></li>
              <li><span>客户等级</span><b>{{ drawer.target.level }}级</b></li>
              <li><span>当前状态</span><b>{{ drawer.target.status }}</b></li>
              <li><span>来源渠道</span><b>{{ drawer.target.source }}</b></li>
              <li><span>主联系人</span><b>{{ drawer.target.contact }}</b></li>
              <li><span>联系电话</span><b>{{ drawer.target.phone }}</b></li>
              <li><span>所在地区</span><b>{{ drawer.target.region }}</b></li>
              <li><span>所属行业</span><b>{{ drawer.target.industry }}</b></li>
              <li><span>分配时间</span><b>{{ drawer.target.assignedAt }}</b></li>
              <li><span>保护期至</span><b :class="{ danger: drawer.target.protectDays < 3 }">{{ drawer.target.protectEnd }} ({{ drawer.target.protectDays }}天)</b></li>
              <li><span>跟进次数</span><b>{{ drawer.target.followCount }} 次</b></li>
              <li><span>备注</span><b class="ellipsis">{{ drawer.target.remark || '暂无' }}</b></li>
            </ul>
          </el-tab-pane>

          <el-tab-pane label="跟进记录" name="timeline">
            <el-timeline class="follow-timeline">
              <el-timeline-item
                v-for="(t, i) in drawer.timeline"
                :key="i"
                :timestamp="t.time"
                :color="t.color"
                placement="top"
              >
                <div class="tl-card">
                  <div class="tl-head">
                    <el-tag size="small">{{ t.way }}</el-tag>
                    <span class="tl-feedback" :class="t.feedback">{{ t.feedback }}</span>
                  </div>
                  <div class="tl-content">{{ t.content }}</div>
                  <div class="tl-next" v-if="t.nextPlan">下次计划：{{ t.nextPlan }}</div>
                </div>
              </el-timeline-item>
              <div v-if="drawer.timeline.length === 0" class="empty-tip">暂无跟进记录</div>
            </el-timeline>
          </el-tab-pane>

          <el-tab-pane label="联系人" name="contacts">
            <div class="contact-list">
              <div v-for="(c, i) in drawer.contacts" :key="i" class="contact-row">
                <div class="cr-avatar">{{ c.name.slice(0, 1) }}</div>
                <div class="cr-info">
                  <div class="cr-name">{{ c.name }} <span class="cr-role">{{ c.role }}</span></div>
                  <div class="cr-meta">{{ c.phone }} · {{ c.email }}</div>
                </div>
                <el-tag v-if="c.primary" type="success" size="small">主联系人</el-tag>
              </div>
              <div v-if="drawer.contacts.length === 0" class="empty-tip">暂无联系人</div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="服务信息" name="service">
            <div v-if="drawer.services.length > 0">
              <div v-for="(s, i) in drawer.services" :key="i" class="service-row">
                <div class="sr-head">
                  <strong>{{ s.serviceType }}</strong>
                  <el-tag size="small" :type="s.status === '生效中' ? 'success' : 'info'">{{ s.status }}</el-tag>
                </div>
                <div class="sr-meta">
                  合同号：{{ s.contractNo }} · 周期 {{ s.startDate }} ~ {{ s.endDate }} · 金额 ¥{{ s.amount }}
                </div>
              </div>
            </div>
            <div v-else class="empty-tip">暂无服务订单</div>
          </el-tab-pane>
        </el-tabs>

        <div class="drawer-foot">
          <el-button type="primary" @click="quickFollow(drawer.target!)">写跟进</el-button>
          <el-button @click="openTransfer(drawer.target!)">转移</el-button>
          <el-button type="warning" plain @click="openReturn(drawer.target!)">退回公海</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watchEffect } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeftBold, Search, Close
} from '@element-plus/icons-vue'
import { leadApi, holdingApi, ROLE_HOLDING_LIMITS, poolRulesMock } from '@/api/crm'
import { useUserStore } from '@/stores/user'

interface Customer {
  id: number
  name: string
  contact: string
  phone: string
  level: 'A' | 'B' | 'C' | 'D'
  status: string
  type: string
  source: string
  region: string
  industry: string
  protectEnd: string
  protectDays: number
  lastFollow: string
  lastFollowDays: number
  nextFollow: string
  warning: 'red' | 'yellow' | 'green' | 'none' | 'overdue'
  followCount: number
  assignedAt: string
  remark?: string
  isNew?: boolean
}

const router = useRouter()
const userStore = useUserStore()

// ---------- 角色 / 持有上限 ----------
const roleConfig = computed(() => {
  const roles = userStore.roles || []
  // 优先匹配：sales-manager > online_manager > tele_senior > tele_middle > online_specialist > tele_junior
  const map: Record<string, string> = {
    'sales-manager': 'sales_manager',
    'manager': 'sales_manager',
    'online_manager': 'online_manager',
    'online-manager': 'online_manager',
    'tele_senior': 'tele_senior',
    'tele_middle': 'tele_middle',
    'tele_junior': 'tele_junior',
    'online_specialist': 'online_specialist'
  }
  for (const r of roles) {
    if (map[r]) {
      const cfg = ROLE_HOLDING_LIMITS.find(x => x.role === map[r])
      if (cfg) return cfg
    }
  }
  // 默认电销中级
  return ROLE_HOLDING_LIMITS.find(x => x.role === 'tele_middle')!
})
const roleLabel = computed(() => roleConfig.value.label)

// ---------- 基础数据 ----------
const currentDateStr = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const holding = reactive({ current: 85, max: 80 })
// 根据角色同步上限
watchEffect(() => {
  holding.max = roleConfig.value.max
})
const holdingRate = computed(() => Math.round(holding.current / holding.max * 100))
const holdingProgressColor = computed(() => {
  const r = holdingRate.value
  if (r >= 90) return '#F56C6C'
  if (r >= 60) return '#E6A23C'
  return '#67C23A'
})
const holdingStatusClass = computed(() => {
  const r = holdingRate.value
  if (r >= 90) return 'danger'
  if (r >= 60) return 'warning'
  return 'safe'
})
const holdingStatusLabel = computed(() => {
  const r = holdingRate.value
  if (r >= 90) return '接近上限'
  if (r >= 60) return '使用中'
  return '健康'
})

const todayStats = reactive({ newCount: 6, followCount: 18, dealCount: 3 })

// ---------- Mock 客户数据 ----------
const STATUSES = ['新分配', '首次触达', '需求确认', '方案报价', '谈判签约', '已成交'] as const
const LEVELS: Customer['level'][] = ['A', 'B', 'C', 'D']
const TYPES = ['企业客户', '个人客户', '渠道客户']
const SOURCES = ['官网注册', '电话外呼', '转介绍', '市场活动', '社交媒体']
const REGIONS = ['杭州', '宁波', '温州', '绍兴', '嘉兴', '台州', '湖州', '金华']
const INDUSTRIES = ['制造业', '建筑业', '科技互联网', '金融', '医疗健康', '教育', '电商零售']
const NAMES: string[] = []
const CONTACT_NAMES: string[] = []

function pad(n: number) { return String(n).padStart(2, '0') }
function dateOffset(days: number) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
function randomPhone() {
  return '1' + (3 + Math.floor(Math.random() * 6)) + Math.random().toString().slice(2, 11)
}

const customers = ref<Customer[]>([])

function generateMock() {
  customers.value = []
  return []
}

// 后端状态(1新建/2跟进中/3已转化/4无效)→ 页面阶段标签
const STATUS_INT_LABEL: Record<number, string> = {
  1: '新分配', 2: '首次触达', 3: '已成交', 4: '已成交'
}
const SOURCE_INT_LABEL: Record<number, string> = {
  1: '官网注册', 2: '电话外呼', 3: '转介绍', 4: '市场活动', 5: '社交媒体'
}

function diffDays(dateStr?: string): number {
  if (!dateStr) return 0
  const d = new Date(dateStr.replace(/-/g, '/'))
  if (isNaN(d.getTime())) return 0
  return Math.floor((d.getTime() - Date.now()) / 86400000)
}

// 后端 CrmLead → 页面 Customer 模型
function mapMyLead(r: any): Customer {
  const protectEnd = r.protectionExpireDate || ''
  const protectDays = protectEnd ? Math.max(0, diffDays(protectEnd)) : 0
  let warning: Customer['warning'] = 'none'
  if (protectEnd) {
    if (protectDays < 0) warning = 'overdue'
    else if (protectDays < 3) warning = 'red'
    else if (protectDays < 7) warning = 'yellow'
    else warning = 'green'
  }
  const lastFollow = r.lastFollowTime ? String(r.lastFollowTime).slice(0, 10) : ''
  const status = STATUS_INT_LABEL[r.status as number] || '首次触达'
  return {
    id: r.id,
    name: r.company || r.name || '',
    contact: r.name || '',
    phone: r.phone || '',
    level: (r.customerLevel as Customer['level']) || 'C',
    status,
    type: r.customerType || '企业客户',
    source: SOURCE_INT_LABEL[r.source as number] || '其他',
    region: r.region || '',
    industry: r.serviceType || '',
    protectEnd,
    protectDays,
    lastFollow,
    lastFollowDays: lastFollow ? Math.abs(diffDays(lastFollow)) : 0,
    nextFollow: r.nextFollowTime || '',
    warning,
    followCount: r.followCount || 0,
    assignedAt: r.claimTime ? String(r.claimTime).slice(0, 10) : '',
    remark: r.remark || '',
    isNew: r.status === 1
  }
}

async function fetchCustomers() {
  try {
    const resp: any = await leadApi.myList({ pageNum: 1, pageSize: 200 })
    const records = resp && (resp.records || resp.list)
    customers.value = Array.isArray(records) ? records.map(mapMyLead) : []
  } catch {
    customers.value = []
  }
}

async function loadHolding() {
  try {
    const resp: any = await holdingApi.getCurrentHolding()
    const data = resp?.data ?? resp
    if (data && typeof data.current === 'number') {
      holding.current = data.current
      if (typeof data.max === 'number' && data.max > 0) holding.max = data.max
    }
  } catch { /* 保留角色默认上限 */ }
}

// ---------- 等级分布 ----------
const levelStats = computed(() => {
  const arr = LEVELS.map(lv => ({
    level: lv,
    count: customers.value.filter(c => c.level === lv).length,
    color: lv === 'A' ? '#F56C6C' : lv === 'B' ? '#E6A23C' : lv === 'C' ? '#A78BFA' : '#909399',
    percent: 0
  }))
  const total = arr.reduce((s, x) => s + x.count, 0) || 1
  arr.forEach(x => x.percent = Math.round(x.count / total * 100))
  return arr
})

// ---------- 预警分组 ----------
const warningGroups = computed(() => ({
  red: customers.value.filter(c => c.warning === 'red' || c.warning === 'overdue'),
  yellow: customers.value.filter(c => c.warning === 'yellow'),
  green: customers.value.filter(c => c.warning === 'green')
}))
const newlyAssigned = computed(() => customers.value.filter(c => c.isNew))
const totalUrgent = computed(() =>
  warningGroups.value.red.length + warningGroups.value.yellow.length + newlyAssigned.value.length
)

// ---------- 状态标签 ----------
const statusTabs = [
  { label: '全部', value: 'all' },
  { label: '新分配', value: '新分配' },
  { label: '首次触达', value: '首次触达' },
  { label: '需求确认', value: '需求确认' },
  { label: '方案报价', value: '方案报价' },
  { label: '谈判签约', value: '谈判签约' },
  { label: '已成交', value: '已成交' }
]
const activeStatus = ref('all')
const statusCountMap = computed(() => {
  const m: Record<string, number> = { all: customers.value.length }
  STATUSES.forEach(s => m[s] = customers.value.filter(c => c.status === s).length)
  return m
})

// ---------- 筛选 ----------
const redLabel = '🔴 红色 ( <3 天 )'
const yellowLabel = '🟡 黄色 ( 3-7 天 )'
const greenLabel = '🟢 绿色 ( >7 天 )'
const noneLabel = '⚪ 无'
const filters = reactive({
  level: '',
  warning: '',
  type: '',
  source: '',
  keyword: ''
})
function resetFilters() {
  filters.level = ''
  filters.warning = ''
  filters.type = ''
  filters.source = ''
  filters.keyword = ''
  activeStatus.value = 'all'
}
function filterByWarning(level: 'red' | 'yellow' | 'green') {
  filters.warning = level
  activeStatus.value = 'all'
}
function filterByStatus(s: string) {
  activeStatus.value = s
  filters.warning = ''
}
function onTabChange() {}

const filteredCustomers = computed(() => {
  return customers.value.filter(c => {
    if (activeStatus.value !== 'all' && c.status !== activeStatus.value) return false
    if (filters.level && c.level !== filters.level) return false
    if (filters.warning && c.warning !== filters.warning) return false
    if (filters.type && c.type !== filters.type) return false
    if (filters.source && c.source !== filters.source) return false
    if (filters.keyword) {
      const k = filters.keyword.toLowerCase()
      if (!c.name.toLowerCase().includes(k) &&
          !c.contact.toLowerCase().includes(k) &&
          !c.phone.includes(k)) return false
    }
    return true
  })
})

// ---------- 表格选择 / 颜色 ----------
const selected = ref<Customer[]>([])
function onSelectionChange(rows: Customer[]) { selected.value = rows }
function levelColor(lv: string) {
  return lv === 'A' ? '#F56C6C' : lv === 'B' ? '#E6A23C' : lv === 'C' ? '#A78BFA' : '#909399'
}
function statusTagType(s: string): any {
  const m: Record<string, string> = {
    '新分配': 'info',
    '首次触达': '',
    '需求确认': 'warning',
    '方案报价': 'warning',
    '谈判签约': 'danger',
    '已成交': 'success'
  }
  return m[s] || ''
}

// ---------- 优化3: 跟进频率校验 ----------
const FREQ_STANDARD: Record<Customer['level'], number> = { A: 3, B: 7, C: 15, D: 15 }
function freqLimit(level: Customer['level']) {
  return FREQ_STANDARD[level]
}
function freqState(row: Customer) {
  const limit = FREQ_STANDARD[row.level]
  if (!row.lastFollow) {
    return { status: 'never' as const, limit, remain: 0, overdue: 0 }
  }
  const days = row.lastFollowDays
  if (days > limit) {
    return { status: 'overdue' as const, limit, remain: 0, overdue: days - limit }
  }
  const remain = limit - days
  if (remain <= Math.max(1, Math.floor(limit / 3))) {
    return { status: 'soon' as const, limit, remain, overdue: 0 }
  }
  return { status: 'ok' as const, limit, remain, overdue: 0 }
}
function tableRowClassName({ row }: { row: Customer }) {
  const st = freqState(row).status
  if (st === 'overdue' || st === 'never') return 'row-overdue'
  if (st === 'soon') return 'row-soon'
  return ''
}

// ---------- 跟进健康度 ----------
function healthStatus(row: Customer): 'normal' | 'lag' | 'danger' {
  // 即将触发回收（保护期 ≤ 1 天或已超期）
  if (row.protectDays <= 1) return 'danger'
  // 跟进频率超期且未触发回收
  const fs = freqState(row)
  if (fs.status === 'overdue' || fs.status === 'never') return 'lag'
  return 'normal'
}
function healthLabel(row: Customer) {
  const map = { normal: '正常', lag: '滞后', danger: '危险' }
  return map[healthStatus(row)]
}

// ---------- 跟进频率统计卡片 ----------
const followStats = computed(() => {
  const list = customers.value
  const total = list.length || 1
  const todayDone = list.filter(c => c.lastFollow && c.lastFollowDays === 0).length
  const overdue = list.filter(c => {
    const s = freqState(c).status
    return s === 'overdue' || s === 'never' || c.warning === 'overdue'
  }).length
  const pending = list.filter(c => freqState(c).status === 'soon' || c.warning === 'red').length
  const healthy = list.filter(c => freqState(c).status === 'ok' && c.protectDays > 1).length
  return {
    todayDone,
    pending,
    overdue,
    healthRate: Math.round(healthy / total * 100),
    todayPercent: Math.round(todayDone / total * 100)
  }
})

// ---------- 写跟进 ----------
const followFormRef = ref<FormInstance>()
const followDialog = reactive<{ visible: boolean; target: Customer | null; batch: boolean }>({
  visible: false, target: null, batch: false
})
const followForm = reactive({
  way: '电话',
  content: '',
  feedback: '积极',
  nextDate: '',
  nextPlan: ''
})
const followRules: FormRules = {
  way: [{ required: true, message: '请选择跟进方式', trigger: 'change' }],
  content: [
    { required: true, message: '请填写沟通内容', trigger: 'blur' },
    { min: 10, message: '沟通内容不少于10字', trigger: 'blur' }
  ],
  feedback: [{ required: true, message: '请选择客户反馈', trigger: 'change' }],
  nextDate: [{ required: true, message: '请选择下次跟进日期', trigger: 'change' }]
}
function quickFollow(c: Customer) {
  followDialog.batch = false
  followDialog.target = c
  followDialog.visible = true
  Object.assign(followForm, { way: '电话', content: '', feedback: '积极', nextDate: '', nextPlan: '' })
}
function batchFollow() {
  if (selected.value.length === 0) return
  followDialog.batch = true
  followDialog.target = null
  followDialog.visible = true
  Object.assign(followForm, { way: '电话', content: '', feedback: '积极', nextDate: '', nextPlan: '' })
}
async function submitFollow() {
  await followFormRef.value?.validate().catch(() => { throw new Error('校验失败') }).catch(() => false)
  if (!followForm.content || followForm.content.length < 10 || !followForm.nextDate) {
    ElMessage.warning('请完整填写跟进信息')
    return
  }
  const targets = followDialog.batch ? selected.value : (followDialog.target ? [followDialog.target] : [])
  const today = dateOffset(0)
  targets.forEach(t => {
    const c = customers.value.find(x => x.id === t.id)
    if (!c) return
    c.lastFollow = today
    c.lastFollowDays = 0
    c.nextFollow = followForm.nextDate
    c.followCount += 1
    // 重新计算保护期：根据状态推进而非简单+15，这里 +15 天作为示例
    const newDays = 15
    c.protectDays = newDays
    c.protectEnd = dateOffset(newDays)
    c.warning = newDays <= 1 ? 'red' : newDays <= 3 ? 'yellow' : newDays <= 7 ? 'green' : 'none'
    c.isNew = false
    if (c.status === '新分配') c.status = '首次触达'
  })
  ElMessage.success(`已为 ${targets.length} 个客户写入跟进`)
  followDialog.visible = false
}

// ---------- 退回公海 ----------
const returnDialog = reactive<{ visible: boolean; targets: Customer[] }>({ visible: false, targets: [] })
const returnForm = reactive({ reason: '暂无意向', remark: '' })
function openReturn(c: Customer) {
  returnDialog.targets = [c]
  returnForm.reason = '暂无意向'
  returnForm.remark = ''
  returnDialog.visible = true
}
function batchReturn() {
  if (selected.value.length === 0) return
  returnDialog.targets = [...selected.value]
  returnForm.reason = '暂无意向'
  returnForm.remark = ''
  returnDialog.visible = true
}
async function confirmReturn() {
  if (!returnForm.reason) { ElMessage.warning('请选择退回原因'); return }
  try {
    await ElMessageBox.confirm(`确认将 ${returnDialog.targets.length} 个客户退回公海？`, '退回确认', { type: 'warning' })
  } catch { return }
  const ids = returnDialog.targets.map(t => t.id)
  try {
    await leadApi.returnToPool(ids, returnForm.reason + (returnForm.remark ? ' / ' + returnForm.remark : ''))
  } catch {
    // mock 环境下接口可能不通，忽略错误，仅做本地处理
  }
  customers.value = customers.value.filter(c => !ids.includes(c.id))
  holding.current = Math.max(0, holding.current - ids.length)
  ElMessage.success(`已退回 ${ids.length} 个客户至公海`)
  returnDialog.visible = false
  drawer.visible = false
}

// ---------- 转移客户 ----------
const salesList = ref([
  { id: 11, name: '张销售', team: '一组', current: 78, max: 120 },
  { id: 12, name: '王销售', team: '一组', current: 102, max: 120 },
  { id: 13, name: '李销售', team: '二组', current: 64, max: 120 },
  { id: 14, name: '陈销售', team: '二组', current: 115, max: 120 },
  { id: 15, name: '周销售', team: '三组', current: 33, max: 100 }
])
const transferDialog = reactive<{ visible: boolean; target: Customer | null }>({ visible: false, target: null })
const transferForm = reactive({ targetUser: undefined as number | undefined, remark: '' })
function openTransfer(c: Customer) {
  transferDialog.target = c
  transferForm.targetUser = undefined
  transferForm.remark = ''
  transferDialog.visible = true
}
async function confirmTransfer() {
  if (!transferForm.targetUser) { ElMessage.warning('请选择目标销售'); return }
  if (!transferDialog.target) return
  try {
    await leadApi.distribute({ ids: [transferDialog.target.id], ownerId: transferForm.targetUser })
  } catch { /* mock 忽略 */ }
  customers.value = customers.value.filter(c => c.id !== transferDialog.target!.id)
  holding.current = Math.max(0, holding.current - 1)
  ElMessage.success('转移成功')
  transferDialog.visible = false
  drawer.visible = false
}

// ---------- 详情抽屉 ----------
const drawer = reactive<{
  visible: boolean
  target: Customer | null
  tab: string
  timeline: any[]
  contacts: any[]
  services: any[]
}>({
  visible: false,
  target: null,
  tab: 'basic',
  timeline: [],
  contacts: [],
  services: []
})
function openDetail(c: Customer) {
  drawer.target = c
  drawer.tab = 'basic'
  // mock 时间线
  const wayList = ['电话', '微信', '面谈', '邮件']
  const feedbackList = ['积极', '中性', '消极'] as const
  const colorMap: Record<string, string> = { '积极': '#67C23A', '中性': '#A78BFA', '消极': '#E6A23C' }
  drawer.timeline = Array.from({ length: Math.min(c.followCount, 6) }).map((_, i) => {
    const fb = feedbackList[i % feedbackList.length]
    return {
      time: dateOffset(-(i * 3 + 1)) + ' 14:2' + (i % 6),
      way: wayList[i % wayList.length],
      feedback: fb,
      color: colorMap[fb],
      content: `第 ${c.followCount - i} 次跟进：与客户沟通方案细节，对方对当前报价存在异议，希望追加技术演示。`,
      nextPlan: i === 0 ? '下周二上门做产品演示' : ''
    }
  })
  drawer.contacts = [
    { name: c.contact, role: '采购总监', phone: c.phone, email: c.contact.toLowerCase() + '@example.com', primary: true },
    { name: '王经理', role: '财务负责人', phone: randomPhone(), email: 'wang@example.com', primary: false }
  ]
  drawer.services = c.status === '已成交'
    ? [{ serviceType: '标准服务包', contractNo: 'HT' + (10000 + c.id), startDate: dateOffset(-30), endDate: dateOffset(335), amount: 88000, status: '生效中' }]
    : []
  drawer.visible = true
}

function back() {
  router.push('/leads/workbench')
}

onMounted(() => {
  fetchCustomers()
  loadHolding()
})
</script>

<style lang="scss" scoped>
.personal-pool {
  --pp-color: #A78BFA;
  --pp-deep: #8B5CF6;
  --pp-glow: rgba(167, 139, 250, 0.25);
  --warn-red: #F56C6C;
  --warn-yellow: #E6A23C;
  --warn-green: #67C23A;
  --gold: #D4AF37;
  --bg-card: #16161E;
  --text-body: #B8B8C0;
  --text-muted: #888;
}

.leads-pool {
  display: flex;
  flex-direction: column;
  gap: 22px;
  padding: 8px 4px 40px;
}

/* ============== Header ============== */
.page-header {
  position: relative;
  padding: 28px 36px 26px;
  background: linear-gradient(135deg, #161020 0%, #1F1830 100%);
  border: 1px solid rgba(167, 139, 250, 0.25);
  border-radius: 14px;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 90% 20%, var(--pp-glow), transparent 50%),
      radial-gradient(circle at 12% 90%, rgba(212, 175, 55, 0.1), transparent 60%);
    pointer-events: none;
  }
}
.header-meta {
  display: flex; align-items: center; gap: 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px; letter-spacing: 0.18em; color: var(--pp-color);
  margin-bottom: 14px; position: relative; z-index: 1;
}
.meta-tag {
  padding: 3px 10px; border: 1px solid rgba(167, 139, 250, 0.4);
  border-radius: 2px; background: rgba(167, 139, 250, 0.08);
}
.meta-divider { width: 24px; height: 1px; background: rgba(167, 139, 250, 0.4); }
.meta-time { color: rgba(167, 139, 250, 0.6); }
.header-main { position: relative; z-index: 1; }
.page-title {
  display: flex; align-items: baseline; gap: 16px; margin: 0 0 8px;
  .title-cn { font-size: 32px; font-weight: 700; letter-spacing: 0.04em; color: #F5F5F5; }
  .title-en {
    font-family: 'Playfair Display', Georgia, serif;
    font-style: italic; font-weight: 400; font-size: 18px;
    color: rgba(167, 139, 250, 0.7);
  }
}
.page-desc { font-size: 13px; color: var(--text-body); margin: 0; }
.back-btn {
  position: absolute; top: 26px; right: 36px; z-index: 1;
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 14px; background: rgba(167, 139, 250, 0.08);
  border: 1px solid rgba(167, 139, 250, 0.3); border-radius: 6px;
  color: var(--pp-color); font-size: 13px; cursor: pointer;
  transition: all 0.3s;
  &:hover { background: rgba(167, 139, 250, 0.18); border-color: rgba(167, 139, 250, 0.6); transform: translateX(-2px); }
}

/* ============== Overview Grid ============== */
.overview-grid {
  display: grid;
  grid-template-columns: 1.35fr 1.2fr 1fr;
  gap: 18px;
}
.overview-card {
  background: var(--bg-card);
  border: 1px solid rgba(167, 139, 250, 0.18);
  border-radius: 12px;
  padding: 22px 24px;
  position: relative;
  overflow: hidden;
}
.card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 18px;
  .card-subtitle {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px; letter-spacing: 0.24em;
    color: rgba(167, 139, 250, 0.55); margin-bottom: 4px;
  }
  .card-title { font-size: 15px; font-weight: 600; color: #F5F5F5; }
  .card-role {
    font-size: 11px;
    color: var(--text-muted);
    margin-top: 4px;
    b { color: var(--gold); font-weight: 600; }
  }
}

.holding-status {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12px; padding: 4px 10px; border-radius: 20px;
  .status-dot { width: 6px; height: 6px; border-radius: 50%; }
  &.safe { background: rgba(103,194,58,0.12); color: var(--warn-green); .status-dot { background: var(--warn-green); box-shadow: 0 0 8px var(--warn-green); } }
  &.warning { background: rgba(230,162,60,0.12); color: var(--warn-yellow); .status-dot { background: var(--warn-yellow); box-shadow: 0 0 8px var(--warn-yellow); } }
  &.danger { background: rgba(245,108,108,0.14); color: var(--warn-red); .status-dot { background: var(--warn-red); box-shadow: 0 0 10px var(--warn-red); animation: pulse 1.4s infinite; } }
}
@keyframes pulse { 0%,100%{ opacity: 1; } 50%{ opacity: 0.4; } }

.holding-figures {
  display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 14px;
}
.figure-main {
  font-family: 'JetBrains Mono', monospace;
  display: flex; align-items: baseline; gap: 4px;
  .figure-num { font-size: 44px; font-weight: 700; color: #F5F5F5; letter-spacing: -0.02em; }
  .figure-slash { font-size: 28px; color: rgba(167,139,250,0.4); }
  .figure-max { font-size: 22px; color: rgba(167,139,250,0.7); }
}
.figure-meta {
  text-align: right; font-size: 12px; color: var(--text-muted);
  line-height: 1.8;
  b { color: var(--gold); font-weight: 600; margin-left: 4px; font-family: 'JetBrains Mono', monospace; }
}
.progress-marks {
  display: flex; justify-content: space-between; margin-top: 8px;
  font-family: 'JetBrains Mono', monospace; font-size: 10px; color: rgba(255,255,255,0.3);
  .mark-warn { color: var(--warn-yellow); }
  .mark-danger { color: var(--warn-red); }
}

.level-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
}
.level-mini {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px; padding: 12px 10px;
  text-align: center; position: relative;
  border-top: 2px solid var(--lv-color);
  .lv-tag {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--lv-color); letter-spacing: 0.15em; margin-bottom: 6px;
  }
  .lv-count { font-size: 24px; font-weight: 700; color: #F5F5F5; font-family: 'JetBrains Mono', monospace; }
  .lv-bar { margin-top: 8px; height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden; }
  .lv-fill { height: 100%; background: var(--lv-color); transition: width 0.6s; }
  .lv-percent { margin-top: 4px; font-size: 10px; color: var(--text-muted); }
}

.today-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.today-item {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; padding: 14px 12px; text-align: center;
  .ti-label { font-size: 11px; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.06em; }
  .ti-num {
    font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700;
    margin-bottom: 4px;
    &.primary { color: var(--pp-color); }
    &.gold { color: var(--gold); }
    &.green { color: var(--warn-green); }
  }
  .ti-trend { font-size: 10px; color: var(--text-muted); .up { color: var(--warn-green); } }
}

/* ============== Todo Section ============== */
.section-head {
  display: flex; align-items: baseline; gap: 14px;
  margin-bottom: 12px; padding-left: 4px;
}
.section-title {
  font-size: 17px; font-weight: 600; color: #F5F5F5; margin: 0;
  position: relative; padding-left: 14px;
  &::before {
    content: ''; position: absolute; left: 0; top: 50%;
    transform: translateY(-50%); width: 4px; height: 16px;
    background: var(--pp-color); border-radius: 1px;
  }
}
.section-sub {
  font-family: 'JetBrains Mono', monospace; font-size: 11px;
  letter-spacing: 0.18em; color: rgba(167, 139, 250, 0.55);
}
.todo-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;
}
.todo-card {
  display: flex; gap: 14px; padding: 16px 18px;
  background: var(--bg-card); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px; cursor: pointer; transition: all 0.3s;
  &:hover { transform: translateY(-2px); }
  .todo-icon { font-size: 22px; }
  .todo-body { flex: 1; min-width: 0; }
  .todo-title { font-size: 13px; color: var(--text-body); margin-bottom: 4px; }
  .todo-count {
    font-family: 'JetBrains Mono', monospace; font-size: 26px; font-weight: 700;
    line-height: 1.1; margin-bottom: 8px;
    span { font-size: 11px; color: var(--text-muted); margin-left: 4px; font-weight: 400; font-family: inherit; }
  }
  .todo-names { display: flex; flex-wrap: wrap; gap: 4px; }
  .name-chip {
    font-size: 11px; padding: 2px 8px; border-radius: 3px;
    background: rgba(255,255,255,0.04); color: var(--text-body);
    cursor: pointer; transition: all 0.2s;
    &:hover { background: rgba(255,255,255,0.12); color: #fff; }
  }
  .name-more { font-size: 11px; color: var(--text-muted); padding: 2px 4px; }
}
.todo-red {
  border-color: rgba(245,108,108,0.35);
  background: linear-gradient(135deg, rgba(245,108,108,0.08), transparent 60%), var(--bg-card);
  .todo-count { color: var(--warn-red); }
  &:hover { border-color: var(--warn-red); box-shadow: 0 8px 24px -12px var(--warn-red); }
}
.todo-yellow {
  border-color: rgba(230,162,60,0.35);
  background: linear-gradient(135deg, rgba(230,162,60,0.08), transparent 60%), var(--bg-card);
  .todo-count { color: var(--warn-yellow); }
  &:hover { border-color: var(--warn-yellow); box-shadow: 0 8px 24px -12px var(--warn-yellow); }
}
.todo-green {
  border-color: rgba(103,194,58,0.35);
  background: linear-gradient(135deg, rgba(103,194,58,0.08), transparent 60%), var(--bg-card);
  .todo-count { color: var(--warn-green); }
  &:hover { border-color: var(--warn-green); box-shadow: 0 8px 24px -12px var(--warn-green); }
}
.todo-blue {
  border-color: rgba(96,165,250,0.35);
  background: linear-gradient(135deg, rgba(96,165,250,0.08), transparent 60%), var(--bg-card);
  .todo-count { color: #60A5FA; }
  &:hover { border-color: #60A5FA; box-shadow: 0 8px 24px -12px #60A5FA; }
}

/* ============== Main Section ============== */
.main-section {
  background: var(--bg-card);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 12px;
  padding: 18px 22px 22px;
}
.status-tabs {
  --el-tabs-header-height: 42px;
  margin-bottom: 8px;
}
.tab-label {
  display: inline-flex; align-items: center; gap: 6px;
  .tab-badge {
    font-family: 'JetBrains Mono', monospace; font-size: 10px;
    padding: 1px 6px; border-radius: 8px;
    background: rgba(167,139,250,0.15); color: var(--pp-color);
  }
}

.filter-bar {
  display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
  margin-bottom: 14px; padding-bottom: 14px;
  border-bottom: 1px dashed rgba(167,139,250,0.12);
  .filter-spacer { flex: 1; }
}

.pool-table {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-row-hover-bg-color: rgba(167,139,250,0.06);
  --el-table-border-color: rgba(255,255,255,0.06);
}
.cust-name {
  color: var(--pp-color); font-weight: 600; cursor: pointer;
  &:hover { color: #fff; text-decoration: underline; }
}
.cust-sub { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.contact-cell {
  .cn-name { font-weight: 500; color: #F5F5F5; }
  .cn-phone { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--text-muted); margin-top: 2px; }
}
.protect-cell {
  .protect-rest {
    font-size: 11px; color: var(--text-muted); margin-top: 2px;
    &.danger { color: var(--warn-red); font-weight: 600; }
  }
}
.follow-cell { .follow-rest { font-size: 11px; color: var(--text-muted); margin-top: 2px; } }
.warn-dot { font-size: 14px; }
.warn-dot.overdue {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: var(--warn-red);
  padding: 2px 8px;
  border: 1px solid var(--warn-red);
  border-radius: 4px;
  background: rgba(245, 108, 108, 0.12);
  animation: warn-blink 0.8s ease-in-out infinite;
}
.warn-dot.red { animation: warn-blink 1.4s ease-in-out infinite; }
@keyframes warn-blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.92); }
}
.follow-num-cell { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--gold); }

.table-foot {
  margin-top: 14px; text-align: right;
  font-size: 12px; color: var(--text-muted);
  b { color: var(--pp-color); font-family: 'JetBrains Mono', monospace; margin: 0 2px; }
}

/* ============== Dialog ============== */
.dialog-target {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  padding: 10px 14px; border-radius: 6px;
  background: rgba(167,139,250,0.06);
  border: 1px solid rgba(167,139,250,0.15);
  margin-bottom: 18px; font-size: 13px;
  strong { color: var(--pp-color); }
  .ds { color: var(--text-muted); font-size: 12px; margin-left: 4px; }
}
.user-opt {
  display: flex; justify-content: space-between; align-items: center; width: 100%;
  .opt-load {
    font-family: 'JetBrains Mono', monospace; font-size: 11px;
    color: var(--warn-green);
    &.over { color: var(--warn-red); }
  }
}

/* ============== Drawer ============== */
.cust-drawer { display: flex; flex-direction: column; height: 100%; }
.drawer-head {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 4px 8px 16px; border-bottom: 1px solid rgba(167,139,250,0.12);
  .dh-cn { font-size: 20px; font-weight: 700; color: #F5F5F5; margin-bottom: 8px; }
  .dh-meta { display: flex; gap: 8px; align-items: center; }
  .dh-source { font-size: 12px; color: var(--text-muted); }
}
.drawer-tabs { flex: 1; margin-top: 8px; }
.info-list {
  list-style: none; padding: 0; margin: 0;
  li {
    display: flex; padding: 10px 4px;
    border-bottom: 1px dashed rgba(255,255,255,0.05);
    span { width: 90px; color: var(--text-muted); font-size: 12px; flex-shrink: 0; }
    b { color: #F5F5F5; font-weight: 500; font-size: 13px; flex: 1; word-break: break-all; }
    b.danger { color: var(--warn-red); }
    b.ellipsis { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }
}
.follow-timeline { padding: 12px 4px; }
.tl-card {
  background: rgba(255,255,255,0.03); border-radius: 6px;
  padding: 10px 12px; margin-top: 4px;
  .tl-head { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; }
  .tl-feedback {
    font-size: 12px; padding: 1px 8px; border-radius: 3px;
    &.积极 { background: rgba(103,194,58,0.12); color: var(--warn-green); }
    &.中性 { background: rgba(167,139,250,0.12); color: var(--pp-color); }
    &.消极 { background: rgba(230,162,60,0.12); color: var(--warn-yellow); }
  }
  .tl-content { font-size: 13px; color: var(--text-body); line-height: 1.6; }
  .tl-next { margin-top: 6px; font-size: 12px; color: var(--gold); }
}
.contact-list { padding: 6px 4px; }
.contact-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px; border-radius: 8px;
  background: rgba(255,255,255,0.02); margin-bottom: 8px;
  .cr-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    background: linear-gradient(135deg, var(--pp-color), var(--pp-deep));
    color: #fff; display: flex; align-items: center; justify-content: center;
    font-weight: 600;
  }
  .cr-info { flex: 1; }
  .cr-name { color: #F5F5F5; font-weight: 500; .cr-role { color: var(--text-muted); font-size: 12px; font-weight: 400; margin-left: 6px; } }
  .cr-meta { font-size: 12px; color: var(--text-muted); margin-top: 2px; font-family: 'JetBrains Mono', monospace; }
}
.service-row {
  background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; margin-bottom: 8px;
  .sr-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; strong { color: #F5F5F5; } }
  .sr-meta { font-size: 12px; color: var(--text-muted); }
}
.empty-tip { text-align: center; padding: 32px 0; color: var(--text-muted); font-size: 13px; }
.drawer-foot {
  display: flex; gap: 10px; padding: 16px 8px 4px;
  border-top: 1px solid rgba(167,139,250,0.12); margin-top: 8px;
}

/* ============== Responsive ============== */
@media (max-width: 1280px) {
  .overview-grid { grid-template-columns: 1fr 1fr; }
  .overview-grid > .today-card { grid-column: 1 / -1; }
  .todo-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .overview-grid { grid-template-columns: 1fr; }
  .overview-grid > .today-card { grid-column: auto; }
  .todo-grid { grid-template-columns: 1fr; }
  .level-grid { grid-template-columns: repeat(2, 1fr); }
}

/* ============== 优化3: 跟进频率校验 ============== */
.freq-cell {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  line-height: 1.4;
}
.freq-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px; font-weight: 600;
  color: #F5F5F5;
  padding: 2px 10px;
  border: 1px solid rgba(167, 139, 250, 0.4);
  background: rgba(167, 139, 250, 0.08);
  border-radius: 12px;
}
.freq-warn {
  font-size: 11px; font-weight: 600;
  color: var(--warn-red);
  letter-spacing: 0.02em;
}
.freq-soon {
  font-size: 11px; font-weight: 600;
  color: var(--warn-yellow);
}
.freq-ok {
  font-size: 11px; color: var(--warn-green);
}

.gap-cell {
  display: inline-flex; align-items: baseline; gap: 2px;
  font-family: 'JetBrains Mono', monospace;
  padding: 4px 8px;
  background: rgba(255,255,255,0.03);
  border-radius: 6px;
}
.gap-cell .gap-num { font-size: 18px; font-weight: 700; color: #F5F5F5; }
.gap-cell .gap-unit { font-size: 11px; color: var(--text-muted); margin-left: 2px; }
.gap-cell.over {
  background: rgba(245, 108, 108, 0.12);
  border: 1px solid rgba(245, 108, 108, 0.4);
}
.gap-cell.over .gap-num { color: var(--warn-red); }
.gap-cell.never {
  font-size: 11px; padding: 4px 10px;
  background: rgba(245, 108, 108, 0.1);
  color: var(--warn-red); border: 1px dashed rgba(245, 108, 108, 0.4);
  border-radius: 6px;
}

/* 超频率行背景 */
.pool-table :deep(.row-overdue) td {
  background: rgba(255, 154, 60, 0.08) !important;
}
.pool-table :deep(.row-overdue):hover td {
  background: rgba(255, 154, 60, 0.16) !important;
}
.pool-table :deep(.row-overdue) td:first-child {
  position: relative;
}
.pool-table :deep(.row-overdue) td:first-child::before {
  content: '';
  position: absolute; left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, var(--warn-red), var(--warn-yellow));
}
.pool-table :deep(.row-soon) td {
  background: rgba(230, 162, 60, 0.04) !important;
}

/* ============== 跟进频率监控条 ============== */
.follow-stats-strip {
  background: var(--bg-card);
  border: 1px solid rgba(167, 139, 250, 0.15);
  border-radius: 12px;
  padding: 18px 22px 20px;
}
.fs-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.fs-card {
  display: flex; gap: 14px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 10px;
  position: relative; overflow: hidden;
  transition: all 0.3s;
  &::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--fs-accent, transparent);
  }
  &:hover { transform: translateY(-2px); border-color: var(--fs-accent); }
  .fs-icon { font-size: 24px; line-height: 1.2; }
  .fs-body { flex: 1; min-width: 0; }
  .fs-label {
    font-size: 12px;
    color: var(--text-muted);
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }
  .fs-num {
    font-family: 'JetBrains Mono', monospace;
    font-size: 26px; font-weight: 700;
    line-height: 1.1;
    color: var(--fs-accent);
    margin-bottom: 6px;
    .fs-unit { font-size: 14px; margin-left: 2px; opacity: 0.75; }
  }
  .fs-extra {
    font-size: 11px; color: var(--text-muted);
    b { color: var(--fs-accent); font-weight: 600; font-family: 'JetBrains Mono', monospace; padding: 0 2px; }
  }
  .fs-progress {
    margin-top: 4px;
    height: 4px;
    background: rgba(255,255,255,0.06);
    border-radius: 2px;
    overflow: hidden;
  }
  .fs-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--fs-accent), color-mix(in srgb, var(--fs-accent) 60%, white));
    transition: width 0.6s;
  }
}
.fs-green { --fs-accent: #67C23A; background: linear-gradient(135deg, rgba(103,194,58,0.07), transparent 60%), rgba(255,255,255,0.02); }
.fs-gold { --fs-accent: #D4AF37; background: linear-gradient(135deg, rgba(212,175,55,0.08), transparent 60%), rgba(255,255,255,0.02); }
.fs-red { --fs-accent: #F56C6C; background: linear-gradient(135deg, rgba(245,108,108,0.08), transparent 60%), rgba(255,255,255,0.02); }
.fs-blue { --fs-accent: #60A5FA; background: linear-gradient(135deg, rgba(96,165,250,0.08), transparent 60%), rgba(255,255,255,0.02); }

/* 跟进健康度 pill */
.health-pill {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  border: 1px solid transparent;
  .hp-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: currentColor;
  }
}
.health-pill.health-normal {
  color: var(--warn-green);
  background: rgba(103, 194, 58, 0.12);
  border-color: rgba(103, 194, 58, 0.4);
}
.health-pill.health-lag {
  color: var(--warn-yellow);
  background: rgba(230, 162, 60, 0.12);
  border-color: rgba(230, 162, 60, 0.45);
}
.health-pill.health-danger {
  color: var(--warn-red);
  background: rgba(245, 108, 108, 0.14);
  border-color: rgba(245, 108, 108, 0.45);
  animation: warn-blink 1.4s ease-in-out infinite;
  .hp-dot { box-shadow: 0 0 6px currentColor; }
}

@media (max-width: 1280px) {
  .fs-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 760px) {
  .fs-grid { grid-template-columns: 1fr; }
}
</style>

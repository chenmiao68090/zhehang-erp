<template>
  <div class="guide">
    <aside class="guide-toc">
      <div class="toc-head">销售体系 · 规则说明书</div>
      <el-input
        v-model="keyword"
        placeholder="搜索章节 / 关键词"
        clearable
        size="small"
        :prefix-icon="Search"
        class="toc-search"
      />
      <div
        v-for="s in filteredSections"
        :key="s.key"
        class="toc-item"
        :class="{ active: s.key === active }"
        @click="goSection(s.key)"
      >
        <span class="toc-ico" :style="{ background: s.color }"><el-icon><component :is="s.icon" /></el-icon></span>
        <span>{{ s.title }}</span>
      </div>
      <div v-if="filteredSections.length === 0" class="toc-empty">没有匹配的章节</div>
    </aside>

    <main class="guide-body">
      <template v-for="s in sections" :key="s.key">
        <article v-show="s.key === active" class="article">
          <h2 class="art-title">
            <span class="art-ico" :style="{ background: s.color }"><el-icon><component :is="s.icon" /></el-icon></span>
            {{ s.title }}
          </h2>
          <div class="art-content" v-html="sanitizeHtml(s.html)"></div>

          <!-- 前往对应功能页 -->
          <div v-if="s.link" class="art-goto">
            <el-button type="primary" plain @click="goFeature(s.link)">
              前往「{{ s.title }}」功能页<el-icon class="r"><Right /></el-icon>
            </el-button>
          </div>

          <!-- 上一章 / 下一章 -->
          <div class="art-nav">
            <button v-if="prevSection" class="nav-btn" @click="goSection(prevSection.key)">
              <el-icon><ArrowLeft /></el-icon> {{ prevSection.title }}
            </button>
            <span v-else></span>
            <button v-if="nextSection" class="nav-btn" @click="goSection(nextSection.key)">
              {{ nextSection.title }} <el-icon><ArrowRight /></el-icon>
            </button>
          </div>
        </article>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Search, Right, ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import { sanitizeHtml } from '@/utils/sanitize-html'

const route = useRoute()
const router = useRouter()

const callout = (txt: string, color = '#3370ff', bg = '#f0f6ff') =>
  `<div style="background:${bg};border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:10px 14px;margin:12px 0;font-size:13px;color:${color};line-height:1.7;">📌 <b>规则:</b> ${txt}</div>`

const step = (t: string, c: string) =>
  `<span style="display:inline-flex;align-items:center;padding:9px 14px;border-radius:9px;font-size:13px;font-weight:600;background:${c}1a;color:${c};border:1px solid ${c}55;white-space:nowrap;">${t}</span>`
const arrow = `<span style="color:#c0c4cc;font-size:16px;">→</span>`

const sections = [
  {
    key: 'overview', title: '总览', icon: 'Document', color: '#3370ff',
    html: `<p>销售体系把"找客户 → 跟客户 → 成交 → 流失再捞回"的全流程工具和制度集中在一起。</p>
      <p>主要包含:</p>
      <ul>
        <li><b>我的线索</b> — 销售个人工作台,管你名下的线索与待跟进。</li>
        <li><b>公司资源库</b> — 公司层面的客户池(公司公海 / 投流线索 / 藏金阁),从这里领取线索。</li>
        <li><b>投流线索</b> — 来自付费投放的客资。</li>
        <li><b>藏金阁</b> — 高价值流失客户专属池。</li>
        <li><b>龙虎榜</b> — 销售业绩实时排名。</li>
      </ul>
      <p>本说明书逐条讲清每个模块"是什么、怎么用、有什么硬规则"。</p>`
  },
  {
    key: 'flow', title: '线索流转图解', icon: 'Share', color: '#6366f1',
    html: `<p>一条线索从进入系统到流转的完整路径,以及每个环节的关键规则:</p>
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:18px 0 6px;">
        ${step('📥 投流 / 获取', '#ec4899')}${arrow}${step('🙋 认领 · 默认上限500', '#3370ff')}${arrow}${step('📞 跟进 + 下一步', '#14b8a6')}${arrow}${step('🤝 转为客户', '#f59e0b')}${arrow}${step('♻️ 公海回收', '#8b5cf6')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
        <div style="flex:1;min-width:170px;background:#fff8ec;border-radius:8px;padding:11px 14px;font-size:14px;color:#9a6a12;line-height:1.6;">⏱ <b>15 天不跟进且保护期到期</b> → 自动退回公海</div>
        <div style="flex:1;min-width:170px;background:#fdeef4;border-radius:8px;padding:11px 14px;font-size:14px;color:#a3315f;line-height:1.6;">🏆 <b>高价值资源</b> → 藏金阁领取或主管分配</div>
        <div style="flex:1;min-width:170px;background:#eef2ff;border-radius:8px;padding:11px 14px;font-size:14px;color:#3949ab;line-height:1.6;">⚖️ <b>建档前先查重</b>:信用代码优先</div>
      </div>
      <p style="margin-top:16px;color:#86909c;font-size:13px;">提示:左侧目录可逐条查看每个模块和规则的详细说明。</p>`
  },
  {
    key: 'mine', title: '我的线索', icon: 'Monitor', color: '#14b8a6', link: '/customer/workbench',
    html: `<p><b>是什么:</b>你个人的线索工作台,汇总你名下持有的全部线索、今天该跟进的客户、以及即将被系统回收的预警。</p>
      <p><b>怎么用:</b></p>
      <ul>
        <li>每天先看"今天该打给谁",按优先级跟进。</li>
        <li>每次联系后及时记录跟进,避免线索因长时间无动作被回收。</li>
        <li>谈成后把线索"转为客户",进入后续签约/交付。</li>
      </ul>
      ${callout('当前每人持有线索默认上限为 <b>500 条</b>;连续 <b>15 天无跟进且保护期到期</b>的线索会自动退回公海。每次跟进必须安排下一步时间。')}`
  },
  {
    key: 'pool', title: '公司资源库', icon: 'Aim', color: '#8b5cf6', link: '/customer/lead',
    html: `<p><b>是什么:</b>公司层面的客户资源池,包含 <b>公司公海</b>(可领取的新线索/退回线索)、<b>投流线索</b>、<b>藏金阁</b> 三类。</p>
      <p><b>怎么用:</b>在公海里挑客户"领取"到自己名下,即可开始跟进。</p>
      ${callout('领取受<b>个人持有上限</b>约束,达上限要先成交或释放再领;领取为<b>先到先得</b>(系统保证不会被两人重复领取)。')}`
  },
  {
    key: 'online', title: '投流线索', icon: 'Promotion', color: '#ec4899', link: '/customer/ad-leads',
    html: `<p><b>是什么:</b>来自<b>付费投放/网络推广(投流)</b>的客资,从广告平台进线。</p>
      <p><b>怎么用:</b></p>
      <ul>
        <li>领取后应尽快首次跟进；系统以“今天该打给谁”和下一步时间防止漏跟。</li>
        <li>明显无效的线索及时标记退回,不占名额。</li>
      </ul>
      ${callout('投流线索的有效率 / 转化会计入<b>网销投产比(ROI)</b>统计,影响投放策略评估。', '#ec4899', '#fdeef4')}`
  },
  {
    key: 'treasure', title: '藏金阁', icon: 'GoldMedal', color: '#f59e0b', link: '/customer/treasure',
    html: `<p><b>是什么:</b><b>高价值流失客户池</b>——曾经合作过、但未续费或已流失的优质客户,价值高、值得专人攻坚。</p>
      <p><b>怎么用:</b>当前与其他公海一样支持直接领取，也可由主管分配；领取后进入本人待跟进队列。</p>
      ${callout('藏金阁当前尚未接审批流，不要把“审批后领取”当作已生效规则；重点资源的归属由主管通过分配功能控制。', '#b8860b', '#fff8ec')}`
  },
  {
    key: 'rank', title: '龙虎榜', icon: 'Trophy', color: '#ef4444', link: '/customer/rank',
    html: `<p><b>是什么:</b>销售业绩<b>实时排名榜</b>,展示 姓名 / 部门 / 业绩 / 目标完成率。</p>
      <p><b>怎么用:</b>看自己当前排名与达成率,对标冠军、查差距;管理者用它做月度复盘与激励。</p>
      ${callout('当前排名按业务订单业绩口径统计；实际到账回款口径将在收款管理统一后接入，现阶段不要把排名金额直接当成已收现金。', '#ef4444', '#fdecec')}`
  },
  {
    key: 'recycle', title: '公海回收规则', icon: 'RefreshRight', color: '#06b6d4',
    html: `<p>为避免线索被"占着不跟",私海线索满足条件会自动退回公司公海,供他人领取:</p>
      <ul>
        <li>连续 <b>15 天无跟进</b>、且保护期已经到期的私海线索 → 触发回收。</li>
        <li>回收前会在"我的线索"给出<b>回收预警</b>提醒。</li>
      </ul>
      ${callout('当前执行的是统一 15 天核心规则。规则中心里标记为“历史方案/尚未启用”的项目不会影响自动回收。', '#0891b2', '#e8f8fb')}`
  },
  {
    key: 'limit', title: '持有上限规则', icon: 'Histogram', color: '#3b82f6',
    html: `<p>每位销售名下可持有的线索数量有上限，当前统一默认 <b>500 条</b>。</p>
      <ul>
        <li>达到上限后无法再领取新线索。</li>
        <li>需先把已成交/无效的线索<b>转客户或释放</b>,腾出名额再领。</li>
      </ul>
      ${callout('上限是为了保证每条线索都被认真跟进,而不是堆在某个人手里。', '#2563eb', '#eef4ff')}`
  },
  {
    key: 'collision', title: '撞单查重规则', icon: 'CopyDocument', color: '#10b981',
    html: `<p>系统提供<b>四级查重工具</b>，新建或导入前应主动查重；当前新建保存并不会自动拦截重复客户:</p>
      <ul>
        <li>P0 <b>统一社会信用代码</b>(最高优先,精准匹配)</li>
        <li>P1 公司名称</li>
        <li>P2 联系电话</li>
        <li>P3 联系人姓名</li>
      </ul>
      ${callout('查重命中后由主管根据已有负责人和跟进历史判定归属；自动保存拦截仍在后续迭代，不要跳过查重工具。', '#0f9d6e', '#e8f8f1')}`
  }
]

sections.forEach((section) => { section.html = sanitizeHtml(section.html) })

const keyword = ref('')
const filteredSections = computed(() => {
  const kw = keyword.value.trim()
  if (!kw) return sections
  return sections.filter((s) => s.title.includes(kw) || s.html.includes(kw))
})

// active 与 URL hash 同步:可直达/刷新保持/分享单章链接
const validKey = (k: string) => sections.some((s) => s.key === k)
const active = ref(validKey((route.hash || '').replace('#', '')) ? (route.hash || '').replace('#', '') : sections[0].key)

function goSection(key: string) {
  active.value = key
  router.replace({ hash: '#' + key })
  const body = document.querySelector('.guide-body')
  if (body) body.scrollTop = 0
}
function goFeature(path: string) {
  router.push(path)
}

const activeIdx = computed(() => sections.findIndex((s) => s.key === active.value))
const prevSection = computed(() => sections[activeIdx.value - 1] || null)
const nextSection = computed(() => sections[activeIdx.value + 1] || null)

// 浏览器前进/后退时同步高亮
watch(
  () => route.hash,
  (h) => {
    const k = (h || '').replace('#', '')
    if (validKey(k) && k !== active.value) active.value = k
  }
)
</script>

<style lang="scss" scoped>
.guide {
  display: flex;
  gap: 16px;
  height: 100%;
  min-height: 520px;
}

.guide-toc {
  width: 216px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid var(--border-soft, #eceef1);
  border-radius: 12px;
  padding: 12px 10px;
  align-self: flex-start;
  position: sticky;
  top: 0;
}

.toc-head {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-muted, #86909c);
  padding: 4px 10px 10px;
}
.toc-search { margin-bottom: 8px; }

.toc-item {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 9px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-body, #4e5969);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;

  &:hover { background: #f5f7fa; }

  &.active {
    background: #eaf2ff;
    color: var(--brand-primary, #3370ff);
    font-weight: 600;
  }

  .toc-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 6px;
    flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(31, 35, 41, 0.1);
    .el-icon { font-size: 14px; color: #fff; }
  }
}
.toc-empty {
  padding: 16px 10px;
  text-align: center;
  color: var(--text-subtle, #c0c4cc);
  font-size: 13px;
}

.guide-body {
  flex: 1;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--border-soft, #eceef1);
  border-radius: 12px;
  padding: 24px 28px;
  overflow-y: auto;
}

.art-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary, #1f2329);
  margin: 0 0 18px;

  .art-ico {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 8px;
    .el-icon { font-size: 18px; color: #fff; }
  }
}

.art-content {
  font-size: 16px;
  color: var(--text-body, #4e5969);
  line-height: 1.9;

  :deep(p) { margin: 0 0 10px; }
  :deep(ul) { margin: 6px 0 10px; padding-left: 22px; }
  :deep(li) { margin: 4px 0; }
  :deep(b) { color: var(--text-primary, #1f2329); font-weight: 600; }
}

.art-goto {
  margin-top: 18px;
  .r { margin-left: 4px; }
}

.art-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid var(--border-soft, #eceef1);

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #f7f8fa;
    border: 1px solid var(--border-soft, #eceef1);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    color: var(--text-body, #4e5969);
    cursor: pointer;
    transition: all 0.15s;
    max-width: 46%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    &:hover { background: #eaf2ff; color: var(--brand-primary, #3370ff); border-color: #c7dbff; }
  }
}

@media (max-width: 820px) {
  .guide { flex-direction: column; }
  .guide-toc { width: 100%; position: static; }
}
</style>

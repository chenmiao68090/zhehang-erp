<template>
  <div class="guide">
    <aside class="guide-toc">
      <div class="toc-head">提单中心 · 规则说明书</div>
      <div
        v-for="s in sections"
        :key="s.key"
        class="toc-item"
        :class="{ active: s.key === active }"
        @click="active = s.key"
      >
        <span class="toc-ico" :style="{ background: s.color }"><el-icon><component :is="s.icon" /></el-icon></span>
        <span>{{ s.title }}</span>
      </div>
    </aside>

    <main class="guide-body">
      <template v-for="s in sections" :key="s.key">
        <article v-show="s.key === active" class="article">
          <h2 class="art-title">
            <span class="art-ico" :style="{ background: s.color }"><el-icon><component :is="s.icon" /></el-icon></span>
            {{ s.title }}
          </h2>
          <div class="art-content" v-html="sanitizeHtml(s.html)"></div>
        </article>
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { sanitizeHtml } from '@/utils/sanitize-html'

const callout = (txt: string, color = '#3370ff', bg = '#f0f6ff') =>
  `<div style="background:${bg};border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:10px 14px;margin:12px 0;font-size:13px;color:${color};line-height:1.7;">📌 <b>规则:</b> ${txt}</div>`

const step = (t: string, c: string) =>
  `<span style="display:inline-flex;align-items:center;padding:9px 14px;border-radius:9px;font-size:13px;font-weight:600;background:${c}1a;color:${c};border:1px solid ${c}55;white-space:nowrap;">${t}</span>`
const arrow = `<span style="color:#c0c4cc;font-size:16px;">→</span>`

const onlineIntro = (name: string, desc: string, path: string) =>
  `<p><b>是什么:</b>${desc}</p>
   <p><b>当前状态:</b>已上线真实提单表单，提交结果以后端订单记录为准。</p>
   ${callout(`<a href="${path}" style="color:inherit;font-weight:600;">进入${name}</a>。页面提示提交成功时，系统已收到后端确认。`, '#0f9d6e', '#eafaf2')}`

const notOnlineIntro = (name: string, desc: string) =>
  `<p><b>规划用途:</b>${desc}</p>
   <p><b>当前状态:</b>尚未上线独立提单表单，也不会生成该类业务订单。</p>
   ${callout(`${name}目前仅保留规则说明，不提供提交入口；请按公司现行线下流程办理。`, '#9a6a12', '#fff8ec')}`

const sections = [
  {
    key: 'overview', title: '总览', icon: 'Document', color: '#8b5cf6',
    html: `<p>提单中心是各业务线<b>下单(提单)的统一入口</b>,把不同业务的订单提交、合同、规则集中在一处。</p>
      <p>包含:</p>
      <ul>
        <li><b>已上线:</b>代理记账、挂靠地址、工商业务、刻章业务四个真实提单入口。</li>
        <li><b>未上线:</b>法务、银行、项目申报、其他增值业务仅保留规划说明，不会写入订单。</li>
        <li><b>提单规则说明书</b> — 本页,讲清各提单的用途、流程与规则。</li>
      </ul>
      ${callout('页面显示提交成功，只代表后端已确认对应写入；审批、财务、合同和交付状态分别以各自真实记录为准。')}`
  },
  {
    key: 'flow', title: '状态口径图解', icon: 'Share', color: '#6366f1',
    html: `<p>业务从提单到交付可能涉及以下环节，但每一步都必须有对应系统记录，不能由前一步自动推定:</p>
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:18px 0 6px;">
        ${step('📝 提单(下单)', '#8b5cf6')}${arrow}${step('🧑‍💼 审批', '#f59e0b')}${arrow}${step('💰 财务确认', '#0ea5e9')}${arrow}${step('📄 签合同', '#3370ff')}${arrow}${step('🚀 交付', '#10b981')}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
        <div style="flex:1;min-width:170px;background:#fff8ec;border-radius:8px;padding:11px 14px;font-size:12px;color:#9a6a12;line-height:1.6;">⚖️ <b>审批状态</b> → 以审单中心真实记录为准</div>
        <div style="flex:1;min-width:170px;background:#e8f6fd;border-radius:8px;padding:11px 14px;font-size:12px;color:#0a6c93;line-height:1.6;">💰 <b>财务状态</b> → 以收款/确认记录为准</div>
        <div style="flex:1;min-width:170px;background:#eafaf2;border-radius:8px;padding:11px 14px;font-size:12px;color:#0f9d6e;line-height:1.6;">📄 <b>合同与交付</b> → 以合同和任务记录为准</div>
      </div>
      <p style="margin-top:16px;color:#86909c;font-size:13px;">提示:左侧目录可逐条查看每个业务提单与规则。</p>`
  },
  { key: 'bookkeeping', title: '代理记账提单', icon: 'Money', color: '#0ea5e9', html: onlineIntro('代理记账提单', '为"代理记账"业务客户下单的入口(月度/年度记账报税服务)。', '/order/bookkeeping') },
  { key: 'address', title: '挂靠地址提单', icon: 'MapLocation', color: '#06b6d4', html: onlineIntro('挂靠地址提单', '为"注册/挂靠地址"业务客户下单的入口(地址租用、续费)。', '/order/address') },
  { key: 'gs', title: '工商业务提单', icon: 'OfficeBuilding', color: '#6366f1', html: onlineIntro('工商业务提单', '为"工商代办"业务客户下单的入口(注册、变更、注销等)。', '/order/gs-order') },
  { key: 'seal', title: '刻章业务提单', icon: 'Stamp', color: '#f59e0b', html: onlineIntro('刻章业务提单', '为"刻章"业务客户下单的入口(各类印章刻制、备案)。', '/order/seal-order') },
  { key: 'legal', title: '法务业务提单', icon: 'Postcard', color: '#6366f1', html: notOnlineIntro('法务业务提单', '用于法务服务客户下单(合同审查、法律咨询、诉讼支持等)。') },
  { key: 'bank', title: '银行业务提单', icon: 'CreditCard', color: '#0ea5e9', html: notOnlineIntro('银行业务提单', '用于银行相关业务客户下单(开户、贷款对接、对公服务等)。') },
  { key: 'project', title: '项目申报提单', icon: 'Files', color: '#14b8a6', html: notOnlineIntro('项目申报提单', '用于政府项目、补贴及资质申报业务下单。') },
  { key: 'other-value', title: '其他增值提单', icon: 'Star', color: '#ec4899', html: notOnlineIntro('其他增值提单', '用于商标、知识产权、资质等其他增值服务下单。') },
  {
    key: 'approval', title: '提单审批规则', icon: 'Stamp', color: '#a855f7',
    html: `<p>不同提单类型的审批要求可能不同，请以审单中心显示的真实流程和当前规则配置为准。</p>
      ${callout('只有审单中心存在审批记录并显示通过，才能视为审批完成；本说明书不代替审批结果。', '#7c3aed', '#f5f0ff')}`
  },
  {
    key: 'finance', title: '财务确认规则', icon: 'Wallet', color: '#10b981',
    html: `<p>财务确认、收款、业绩和账务是不同事实，请分别查看对应的真实记录。</p>
      ${callout('没有收款或财务确认记录时，系统不会仅凭提单页面推定已收款、已入账或已计入业绩。', '#0f9d6e', '#eafaf2')}`
  }
]

sections.forEach((section) => { section.html = sanitizeHtml(section.html) })

const active = ref(sections[0].key)
</script>

<style lang="scss" scoped>
.guide { display: flex; gap: 16px; height: 100%; min-height: 520px; }
.guide-toc {
  width: 210px; flex-shrink: 0; background: #fff;
  border: 1px solid var(--border-soft, #eceef1); border-radius: 12px;
  padding: 12px 10px; align-self: flex-start; position: sticky; top: 0;
}
.toc-head { font-size: 13px; font-weight: 600; color: var(--text-muted, #86909c); padding: 4px 10px 10px; }
.toc-item {
  display: flex; align-items: center; gap: 9px; padding: 9px 10px;
  border-radius: 8px; font-size: 13px; color: var(--text-body, #4e5969);
  cursor: pointer; transition: background 0.15s ease, color 0.15s ease;
  &:hover { background: #f5f7fa; }
  &.active { background: #eaf2ff; color: var(--brand-primary, #3370ff); font-weight: 600; }
  .toc-ico {
    display: inline-flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0;
    box-shadow: 0 1px 2px rgba(31, 35, 41, 0.1);
    .el-icon { font-size: 14px; color: #fff; }
  }
}
.guide-body {
  flex: 1; min-width: 0; background: #fff;
  border: 1px solid var(--border-soft, #eceef1); border-radius: 12px;
  padding: 24px 28px; overflow-y: auto;
}
.art-title {
  display: flex; align-items: center; gap: 10px; font-size: 20px;
  font-weight: 700; color: var(--text-primary, #1f2329); margin: 0 0 18px;
  .art-ico {
    display: inline-flex; align-items: center; justify-content: center;
    width: 32px; height: 32px; border-radius: 8px;
    .el-icon { font-size: 18px; color: #fff; }
  }
}
.art-content {
  font-size: 14px; color: var(--text-body, #4e5969); line-height: 1.9;
  :deep(p) { margin: 0 0 10px; }
  :deep(ul) { margin: 6px 0 10px; padding-left: 22px; }
  :deep(li) { margin: 4px 0; }
  :deep(b) { color: var(--text-primary, #1f2329); font-weight: 600; }
}
</style>

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, Tt as openBlock, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Ct as arrow_left_default, Hn as right_default, Tr as vShow, Un as search_default, mt as ElInput, ot as ElButton, wt as arrow_right_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as sanitizeHtml } from "./sanitize-html-BVsHt3EZ.js";
//#region src/views/crm/sales-guide.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "guide" };
var _hoisted_2 = { class: "guide-toc" };
var _hoisted_3 = ["onClick"];
var _hoisted_4 = {
	key: 0,
	class: "toc-empty"
};
var _hoisted_5 = { class: "guide-body" };
var _hoisted_6 = { class: "art-title" };
var _hoisted_7 = ["innerHTML"];
var _hoisted_8 = {
	key: 0,
	class: "art-goto"
};
var _hoisted_9 = { class: "art-nav" };
var _hoisted_10 = { key: 1 };
var arrow = `<span style="color:#c0c4cc;font-size:16px;">→</span>`;
//#endregion
//#region src/views/crm/sales-guide.vue
var sales_guide_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "sales-guide",
	setup(__props) {
		const route = useRoute();
		const router = useRouter();
		const callout = (txt, color = "#3370ff", bg = "#f0f6ff") => `<div style="background:${bg};border-left:3px solid ${color};border-radius:0 8px 8px 0;padding:10px 14px;margin:12px 0;font-size:13px;color:${color};line-height:1.7;">📌 <b>规则:</b> ${txt}</div>`;
		const step = (t, c) => `<span style="display:inline-flex;align-items:center;padding:9px 14px;border-radius:9px;font-size:13px;font-weight:600;background:${c}1a;color:${c};border:1px solid ${c}55;white-space:nowrap;">${t}</span>`;
		const sections = [
			{
				key: "overview",
				title: "总览",
				icon: "Document",
				color: "#3370ff",
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
				key: "flow",
				title: "线索流转图解",
				icon: "Share",
				color: "#6366f1",
				html: `<p>一条线索从进入系统到流转的完整路径,以及每个环节的关键规则:</p>
      <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:18px 0 6px;">
        ${step("📥 投流 / 获取", "#ec4899")}${arrow}${step("🙋 认领 · 默认上限500", "#3370ff")}${arrow}${step("📞 跟进 + 下一步", "#14b8a6")}${arrow}${step("🤝 转为客户", "#f59e0b")}${arrow}${step("♻️ 公海回收", "#8b5cf6")}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;">
        <div style="flex:1;min-width:170px;background:#fff8ec;border-radius:8px;padding:11px 14px;font-size:14px;color:#9a6a12;line-height:1.6;">⏱ <b>15 天不跟进且保护期到期</b> → 自动退回公海</div>
        <div style="flex:1;min-width:170px;background:#fdeef4;border-radius:8px;padding:11px 14px;font-size:14px;color:#a3315f;line-height:1.6;">🏆 <b>高价值资源</b> → 藏金阁领取或主管分配</div>
        <div style="flex:1;min-width:170px;background:#eef2ff;border-radius:8px;padding:11px 14px;font-size:14px;color:#3949ab;line-height:1.6;">⚖️ <b>建档前先查重</b>:信用代码优先</div>
      </div>
      <p style="margin-top:16px;color:#86909c;font-size:13px;">提示:左侧目录可逐条查看每个模块和规则的详细说明。</p>`
			},
			{
				key: "mine",
				title: "我的线索",
				icon: "Monitor",
				color: "#14b8a6",
				link: "/customer/workbench",
				html: `<p><b>是什么:</b>你个人的线索工作台,汇总你名下持有的全部线索、今天该跟进的客户、以及即将被系统回收的预警。</p>
      <p><b>怎么用:</b></p>
      <ul>
        <li>每天先看"今天该打给谁",按优先级跟进。</li>
        <li>每次联系后及时记录跟进,避免线索因长时间无动作被回收。</li>
        <li>谈成后把线索"转为客户",进入后续签约/交付。</li>
      </ul>
      ${callout("当前每人持有线索默认上限为 <b>500 条</b>;连续 <b>15 天无跟进且保护期到期</b>的线索会自动退回公海。每次跟进必须安排下一步时间。")}`
			},
			{
				key: "pool",
				title: "公司资源库",
				icon: "Aim",
				color: "#8b5cf6",
				link: "/customer/lead",
				html: `<p><b>是什么:</b>公司层面的客户资源池,包含 <b>公司公海</b>(可领取的新线索/退回线索)、<b>投流线索</b>、<b>藏金阁</b> 三类。</p>
      <p><b>怎么用:</b>在公海里挑客户"领取"到自己名下,即可开始跟进。</p>
      ${callout("领取受<b>个人持有上限</b>约束,达上限要先成交或释放再领;领取为<b>先到先得</b>(系统保证不会被两人重复领取)。")}`
			},
			{
				key: "online",
				title: "投流线索",
				icon: "Promotion",
				color: "#ec4899",
				link: "/customer/ad-leads",
				html: `<p><b>是什么:</b>来自<b>付费投放/网络推广(投流)</b>的客资,从广告平台进线。</p>
      <p><b>怎么用:</b></p>
      <ul>
        <li>领取后应尽快首次跟进；系统以“今天该打给谁”和下一步时间防止漏跟。</li>
        <li>明显无效的线索及时标记退回,不占名额。</li>
      </ul>
      ${callout("投流线索的有效率 / 转化会计入<b>网销投产比(ROI)</b>统计,影响投放策略评估。", "#ec4899", "#fdeef4")}`
			},
			{
				key: "treasure",
				title: "藏金阁",
				icon: "GoldMedal",
				color: "#f59e0b",
				link: "/customer/treasure",
				html: `<p><b>是什么:</b><b>高价值流失客户池</b>——曾经合作过、但未续费或已流失的优质客户,价值高、值得专人攻坚。</p>
      <p><b>怎么用:</b>当前与其他公海一样支持直接领取，也可由主管分配；领取后进入本人待跟进队列。</p>
      ${callout("藏金阁当前尚未接审批流，不要把“审批后领取”当作已生效规则；重点资源的归属由主管通过分配功能控制。", "#b8860b", "#fff8ec")}`
			},
			{
				key: "rank",
				title: "龙虎榜",
				icon: "Trophy",
				color: "#ef4444",
				link: "/customer/rank",
				html: `<p><b>是什么:</b>销售业绩<b>实时排名榜</b>,展示 姓名 / 部门 / 业绩 / 目标完成率。</p>
      <p><b>怎么用:</b>看自己当前排名与达成率,对标冠军、查差距;管理者用它做月度复盘与激励。</p>
      ${callout("当前排名按业务订单业绩口径统计；实际到账回款口径将在收款管理统一后接入，现阶段不要把排名金额直接当成已收现金。", "#ef4444", "#fdecec")}`
			},
			{
				key: "recycle",
				title: "公海回收规则",
				icon: "RefreshRight",
				color: "#06b6d4",
				html: `<p>为避免线索被"占着不跟",私海线索满足条件会自动退回公司公海,供他人领取:</p>
      <ul>
        <li>连续 <b>15 天无跟进</b>、且保护期已经到期的私海线索 → 触发回收。</li>
        <li>回收前会在"我的线索"给出<b>回收预警</b>提醒。</li>
      </ul>
      ${callout("当前执行的是统一 15 天核心规则。规则中心里标记为“历史方案/尚未启用”的项目不会影响自动回收。", "#0891b2", "#e8f8fb")}`
			},
			{
				key: "limit",
				title: "持有上限规则",
				icon: "Histogram",
				color: "#3b82f6",
				html: `<p>每位销售名下可持有的线索数量有上限，当前统一默认 <b>500 条</b>。</p>
      <ul>
        <li>达到上限后无法再领取新线索。</li>
        <li>需先把已成交/无效的线索<b>转客户或释放</b>,腾出名额再领。</li>
      </ul>
      ${callout("上限是为了保证每条线索都被认真跟进,而不是堆在某个人手里。", "#2563eb", "#eef4ff")}`
			},
			{
				key: "collision",
				title: "撞单查重规则",
				icon: "CopyDocument",
				color: "#10b981",
				html: `<p>系统提供<b>四级查重工具</b>，新建或导入前应主动查重；当前新建保存并不会自动拦截重复客户:</p>
      <ul>
        <li>P0 <b>统一社会信用代码</b>(最高优先,精准匹配)</li>
        <li>P1 公司名称</li>
        <li>P2 联系电话</li>
        <li>P3 联系人姓名</li>
      </ul>
      ${callout("查重命中后由主管根据已有负责人和跟进历史判定归属；自动保存拦截仍在后续迭代，不要跳过查重工具。", "#0f9d6e", "#e8f8f1")}`
			}
		];
		sections.forEach((section) => {
			section.html = sanitizeHtml(section.html);
		});
		const keyword = ref("");
		const filteredSections = computed(() => {
			const kw = keyword.value.trim();
			if (!kw) return sections;
			return sections.filter((s) => s.title.includes(kw) || s.html.includes(kw));
		});
		const validKey = (k) => sections.some((s) => s.key === k);
		const active = ref(validKey((route.hash || "").replace("#", "")) ? (route.hash || "").replace("#", "") : sections[0].key);
		function goSection(key) {
			active.value = key;
			router.replace({ hash: "#" + key });
			const body = document.querySelector(".guide-body");
			if (body) body.scrollTop = 0;
		}
		function goFeature(path) {
			router.push(path);
		}
		const activeIdx = computed(() => sections.findIndex((s) => s.key === active.value));
		const prevSection = computed(() => sections[activeIdx.value - 1] || null);
		const nextSection = computed(() => sections[activeIdx.value + 1] || null);
		watch(() => route.hash, (h) => {
			const k = (h || "").replace("#", "");
			if (validKey(k) && k !== active.value) active.value = k;
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("aside", _hoisted_2, [
				_cache[3] || (_cache[3] = createBaseVNode("div", { class: "toc-head" }, "销售体系 · 规则说明书", -1)),
				createVNode(_component_el_input, {
					modelValue: keyword.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
					placeholder: "搜索章节 / 关键词",
					clearable: "",
					size: "small",
					"prefix-icon": unref(search_default),
					class: "toc-search"
				}, null, 8, ["modelValue", "prefix-icon"]),
				(openBlock(true), createElementBlock(Fragment, null, renderList(filteredSections.value, (s) => {
					return openBlock(), createElementBlock("div", {
						key: s.key,
						class: normalizeClass(["toc-item", { active: s.key === active.value }]),
						onClick: ($event) => goSection(s.key)
					}, [createBaseVNode("span", {
						class: "toc-ico",
						style: normalizeStyle({ background: s.color })
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(s.icon)))]),
						_: 2
					}, 1024)], 4), createBaseVNode("span", null, toDisplayString(s.title), 1)], 10, _hoisted_3);
				}), 128)),
				filteredSections.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_4, "没有匹配的章节")) : createCommentVNode("", true)
			]), createBaseVNode("main", _hoisted_5, [(openBlock(), createElementBlock(Fragment, null, renderList(sections, (s) => {
				return withDirectives(createBaseVNode("article", {
					key: s.key,
					class: "article"
				}, [
					createBaseVNode("h2", _hoisted_6, [createBaseVNode("span", {
						class: "art-ico",
						style: normalizeStyle({ background: s.color })
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(s.icon)))]),
						_: 2
					}, 1024)], 4), createTextVNode(" " + toDisplayString(s.title), 1)]),
					createBaseVNode("div", {
						class: "art-content",
						innerHTML: unref(sanitizeHtml)(s.html)
					}, null, 8, _hoisted_7),
					s.link ? (openBlock(), createElementBlock("div", _hoisted_8, [createVNode(_component_el_button, {
						type: "primary",
						plain: "",
						onClick: ($event) => goFeature(s.link)
					}, {
						default: withCtx(() => [createTextVNode(" 前往「" + toDisplayString(s.title) + "」功能页", 1), createVNode(_component_el_icon, { class: "r" }, {
							default: withCtx(() => [createVNode(unref(right_default))]),
							_: 1
						})]),
						_: 2
					}, 1032, ["onClick"])])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_9, [prevSection.value ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "nav-btn",
						onClick: _cache[1] || (_cache[1] = ($event) => goSection(prevSection.value.key))
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_left_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(prevSection.value.title), 1)])) : (openBlock(), createElementBlock("span", _hoisted_10)), nextSection.value ? (openBlock(), createElementBlock("button", {
						key: 2,
						class: "nav-btn",
						onClick: _cache[2] || (_cache[2] = ($event) => goSection(nextSection.value.key))
					}, [createTextVNode(toDisplayString(nextSection.value.title) + " ", 1), createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_right_default))]),
						_: 1
					})])) : createCommentVNode("", true)])
				], 512), [[vShow, s.key === active.value]]);
			}), 64))])]);
		};
	}
}), [["__scopeId", "data-v-780a0513"]]);
//#endregion
export { sales_guide_default as default };

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { M as ElInputNumber, Q as ElRadioGroup, Z as ElRadioButton, o as ElMessage, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as sanitizeSvg } from "./sanitize-html-BVsHt3EZ.js";
import { n as getSalesRank } from "./cockpit-DWtOaQly.js";
//#region src/views/crm/sales-rank.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "sales-page rank-page" };
var _hoisted_2 = { class: "sales-header" };
var _hoisted_3 = { class: "sh-main" };
var _hoisted_4 = { class: "sh-desc" };
var _hoisted_5 = { class: "sh-actions" };
var _hoisted_6 = { class: "target-box" };
var _hoisted_7 = { class: "podium" };
var _hoisted_8 = { class: "pod-avatar-wrap" };
var _hoisted_9 = {
	key: 0,
	class: "pod-crown"
};
var _hoisted_10 = {
	key: 1,
	class: "me-badge"
};
var _hoisted_11 = ["title"];
var _hoisted_12 = { class: "pod-amount" };
var _hoisted_13 = ["innerHTML"];
var _hoisted_14 = { class: "rank-list" };
var _hoisted_15 = { class: "rk-no" };
var _hoisted_16 = { class: "rk-avatar" };
var _hoisted_17 = { class: "rk-meta" };
var _hoisted_18 = ["title"];
var _hoisted_19 = {
	key: 0,
	class: "me-badge sm"
};
var _hoisted_20 = { class: "rk-amount" };
var _hoisted_21 = ["innerHTML"];
var _hoisted_22 = {
	key: 1,
	class: "sales-empty"
};
var _hoisted_23 = { class: "se-icon" };
//#endregion
//#region src/views/crm/sales-rank.vue
var sales_rank_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "sales-rank",
	setup(__props) {
		const loading = ref(false);
		const period = ref("month");
		const targetWan = ref(80);
		const rows = ref([]);
		const userStore = useUserStore();
		const myName = computed(() => {
			const u = userStore.userInfo || {};
			return u.nickname || u.name || u.realName || u.userName || "";
		});
		const isMe = (r) => !!myName.value && r.employeeName === myName.value;
		const periodLabel = computed(() => period.value === "year" ? "本年" : period.value === "quarter" ? "本季" : "本月");
		const DEPT_COLORS = [
			"#3370ff",
			"#14b8a6",
			"#ec4899",
			"#f59e0b",
			"#8b5cf6",
			"#06b6d4",
			"#ef4444"
		];
		function deptColor(d) {
			if (!d) return "#86909c";
			let h = 0;
			for (let i = 0; i < d.length; i++) h = h * 31 + d.charCodeAt(i) >>> 0;
			return DEPT_COLORS[h % DEPT_COLORS.length];
		}
		function deptStyle(d) {
			const c = deptColor(d);
			return {
				color: c,
				background: c + "1a"
			};
		}
		const medal = (i) => [
			"#f5b301",
			"#a8b3c2",
			"#cd8a4a"
		][i] || "#c5ccd6";
		const medalBg = (i) => [
			`linear-gradient(180deg,#f5b30133,#f5b3010d)`,
			`linear-gradient(180deg,#a8b3c233,#a8b3c20d)`,
			`linear-gradient(180deg,#cd8a4a33,#cd8a4a0d)`
		][i];
		const wan = (amt) => (amt / 1e4).toFixed(1);
		const periodFactor = computed(() => period.value === "year" ? 12 : period.value === "quarter" ? 3 : 1);
		const rate = (amt) => {
			const t = (targetWan.value || 80) * 1e4 * periodFactor.value;
			return t > 0 ? Math.round(amt / t * 100) : 0;
		};
		const rateColor = (r) => r >= 100 ? "#00b42a" : r >= 85 ? "#3370ff" : "#ff7d00";
		const trendCls = (g) => g == null || g === 0 ? "flat" : g > 0 ? "up" : "down";
		const trendArrow = (g) => g == null || g === 0 ? "—" : g > 0 ? "▲" : "▼";
		function ringSvg(p, sz = 44) {
			const r = sz / 2 - 4;
			const c = 2 * Math.PI * r;
			const off = c * (1 - Math.min(p, 100) / 100);
			const col = rateColor(p);
			return sanitizeSvg(`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">
    <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="#eef0f3" stroke-width="5"/>
    <circle cx="${sz / 2}" cy="${sz / 2}" r="${r}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 ${sz / 2} ${sz / 2})"/>
    <text x="50%" y="53%" text-anchor="middle" dominant-baseline="middle" font-size="${(sz * .25).toFixed(0)}" font-weight="700" fill="${col}">${p}%</text>
  </svg>`);
		}
		const podium = computed(() => {
			const top = rows.value.slice(0, 3);
			const order = [
				1,
				0,
				2
			];
			const heights = [
				56,
				86,
				40
			];
			return order.map((i, k) => top[i] ? {
				r: top[i],
				i,
				h: heights[k]
			} : null).filter(Boolean);
		});
		const restRows = computed(() => rows.value.slice(3));
		let meEl = null;
		const setMeRef = (el, r) => {
			if (el && isMe(r)) meEl = el;
		};
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				meEl = null;
				try {
					var _res$data;
					const res = yield getSalesRank({ period: period.value });
					const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = Array.isArray(data) ? data : [];
					yield nextTick();
					meEl === null || meEl === void 0 || meEl.scrollIntoView({
						behavior: "smooth",
						block: "center"
					});
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "加载排行失败");
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_input_number = ElInputNumber;
			const _component_Trophy = resolveComponent("Trophy");
			const _component_el_icon = ElIcon;
			const _directive_loading = vLoading;
			return withDirectives((openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("header", _hoisted_2, [_cache[7] || (_cache[7] = createBaseVNode("div", { class: "sh-eyebrow" }, [
				createBaseVNode("span", { class: "she-tag" }, "龙虎榜"),
				createBaseVNode("span", { class: "she-line" }),
				createBaseVNode("span", { class: "she-time" }, "实时排名 · 激励冲刺")
			], -1)), createBaseVNode("div", _hoisted_3, [createBaseVNode("div", null, [_cache[2] || (_cache[2] = createBaseVNode("h2", { class: "sh-title" }, [createBaseVNode("span", { class: "sht-cn" }, "🏆 龙虎榜 TOP"), createBaseVNode("span", { class: "sht-en" }, "Sales Ranking")], -1)), createBaseVNode("p", _hoisted_4, "姓名 · 部门 · 业绩 · 环比," + toDisplayString(periodLabel.value) + "实时排名,激励冲刺。", 1)]), createBaseVNode("div", _hoisted_5, [createVNode(_component_el_radio_group, {
				modelValue: period.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => period.value = $event),
				size: "default",
				onChange: load
			}, {
				default: withCtx(() => [
					createVNode(_component_el_radio_button, { value: "month" }, {
						default: withCtx(() => [..._cache[3] || (_cache[3] = [createTextVNode("本月", -1)])]),
						_: 1
					}),
					createVNode(_component_el_radio_button, { value: "quarter" }, {
						default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("本季", -1)])]),
						_: 1
					}),
					createVNode(_component_el_radio_button, { value: "year" }, {
						default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("本年", -1)])]),
						_: 1
					})
				]),
				_: 1
			}, 8, ["modelValue"]), createBaseVNode("div", _hoisted_6, [
				createBaseVNode("span", null, toDisplayString(periodLabel.value) + "目标", 1),
				createVNode(_component_el_input_number, {
					modelValue: targetWan.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => targetWan.value = $event),
					min: 1,
					step: 10,
					controls: false,
					size: "default",
					style: { "width": "84px" }
				}, null, 8, ["modelValue"]),
				_cache[6] || (_cache[6] = createBaseVNode("span", null, "万", -1))
			])])])]), rows.value.length ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("section", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(podium.value, (item) => {
				return openBlock(), createElementBlock("div", {
					key: item.r.employeeName,
					class: normalizeClass(["pod-col", ["pod-" + (item.i + 1), { "is-me": isMe(item.r) }]])
				}, [
					createBaseVNode("div", _hoisted_8, [
						createBaseVNode("div", {
							class: "pod-avatar",
							style: normalizeStyle({ background: medal(item.i) })
						}, toDisplayString((item.r.employeeName || "客").charAt(0)), 5),
						item.i === 0 ? (openBlock(), createElementBlock("span", _hoisted_9, "👑")) : createCommentVNode("", true),
						isMe(item.r) ? (openBlock(), createElementBlock("span", _hoisted_10, "我")) : createCommentVNode("", true)
					]),
					createBaseVNode("div", {
						class: "pod-name",
						title: item.r.employeeName
					}, toDisplayString(item.r.employeeName), 9, _hoisted_11),
					createBaseVNode("span", {
						class: "pod-dept",
						style: normalizeStyle(deptStyle(item.r.department))
					}, toDisplayString(item.r.department || "—"), 5),
					createBaseVNode("div", _hoisted_12, [createTextVNode("¥" + toDisplayString(wan(item.r.amount)), 1), _cache[8] || (_cache[8] = createBaseVNode("small", null, "万", -1))]),
					item.r.growthRate != null ? (openBlock(), createElementBlock("span", {
						key: 0,
						class: normalizeClass(["sm-trend pod-trend", trendCls(item.r.growthRate)])
					}, toDisplayString(trendArrow(item.r.growthRate)) + " " + toDisplayString(Math.abs(item.r.growthRate)) + "% ", 3)) : createCommentVNode("", true),
					createBaseVNode("span", {
						class: "pod-ring",
						innerHTML: unref(sanitizeSvg)(ringSvg(rate(item.r.amount), 44))
					}, null, 8, _hoisted_13),
					createBaseVNode("div", {
						class: "pod-base",
						style: normalizeStyle({
							height: item.h + "px",
							background: medalBg(item.i),
							borderColor: medal(item.i),
							color: medal(item.i)
						})
					}, toDisplayString(item.i + 1), 5)
				], 2);
			}), 128))]), createBaseVNode("section", _hoisted_14, [(openBlock(true), createElementBlock(Fragment, null, renderList(restRows.value, (r, idx) => {
				return openBlock(), createElementBlock("div", {
					key: r.employeeName,
					class: normalizeClass(["rank-row", { "is-me": isMe(r) }]),
					ref_for: true,
					ref: (el) => setMeRef(el, r)
				}, [
					createBaseVNode("span", _hoisted_15, toDisplayString(idx + 4), 1),
					createBaseVNode("div", _hoisted_16, toDisplayString((r.employeeName || "客").charAt(0)), 1),
					createBaseVNode("div", _hoisted_17, [createBaseVNode("div", {
						class: "rk-name",
						title: r.employeeName
					}, [createTextVNode(toDisplayString(r.employeeName), 1), isMe(r) ? (openBlock(), createElementBlock("span", _hoisted_19, "我")) : createCommentVNode("", true)], 8, _hoisted_18), createBaseVNode("span", {
						class: "rk-dept",
						style: normalizeStyle(deptStyle(r.department))
					}, toDisplayString(r.department || "—"), 5)]),
					r.growthRate != null ? (openBlock(), createElementBlock("span", {
						key: 0,
						class: normalizeClass(["sm-trend", trendCls(r.growthRate)])
					}, toDisplayString(trendArrow(r.growthRate)) + " " + toDisplayString(Math.abs(r.growthRate)) + "% ", 3)) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_20, [createTextVNode("¥" + toDisplayString(wan(r.amount)), 1), _cache[9] || (_cache[9] = createBaseVNode("small", null, "万", -1))]),
					createBaseVNode("span", {
						class: "rk-ring",
						innerHTML: unref(sanitizeSvg)(ringSvg(rate(r.amount), 40))
					}, null, 8, _hoisted_21)
				], 2);
			}), 128))])], 64)) : !loading.value ? (openBlock(), createElementBlock("div", _hoisted_22, [
				createBaseVNode("div", _hoisted_23, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(_component_Trophy)]),
					_: 1
				})]),
				_cache[10] || (_cache[10] = createBaseVNode("div", { class: "se-text" }, "本期暂无业绩数据", -1)),
				_cache[11] || (_cache[11] = createBaseVNode("div", { class: "se-hint" }, "有成交到款后,这里会实时排名", -1))
			])) : createCommentVNode("", true)])), [[_directive_loading, loading.value]]);
		};
	}
}), [["__scopeId", "data-v-d3c66d37"]]);
//#endregion
export { sales_rank_default as default };

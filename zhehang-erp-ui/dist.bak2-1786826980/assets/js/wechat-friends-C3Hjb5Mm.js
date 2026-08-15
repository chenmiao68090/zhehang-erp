import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, Un as search_default, _ as ElTableColumn, g as ElTable, it as ElTag, mt as ElInput, nt as ElOption, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as wechatFriendApi } from "./wechat-DSojRbKm.js";
//#region src/views/customer/wechat-friends.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "wf" };
var _hoisted_2 = { class: "wf-head" };
var _hoisted_3 = { class: "wf-stats" };
var _hoisted_4 = { class: "wf-stat" };
var _hoisted_5 = { class: "wf-num" };
var _hoisted_6 = { class: "wf-stat" };
var _hoisted_7 = { class: "wf-num" };
var _hoisted_8 = { class: "wf-toolbar" };
var _hoisted_9 = { key: 0 };
var _hoisted_10 = { class: "wf-pager" };
//#endregion
//#region src/views/customer/wechat-friends.vue
var wechat_friends_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "wechat-friends",
	setup(__props) {
		const genderText = (g) => g === 1 ? "男" : g === 2 ? "女" : "—";
		const splitLabels = (s) => s ? s.split(/[，,]/).map((x) => x.trim()).filter(Boolean) : [];
		const fmtTime = (t) => t ? String(t).replace("T", " ").slice(0, 16) : "—";
		const rows = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(20);
		const keyword = ref("");
		const wxId = ref("");
		const stats = ref({});
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _page$total;
					const res = yield wechatFriendApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value || void 0,
						wxId: wxId.value || void 0
					});
					const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (page === null || page === void 0 ? void 0 : page.records) || [];
					total.value = Number((_page$total = page === null || page === void 0 ? void 0 : page.total) !== null && _page$total !== void 0 ? _page$total : 0);
				} catch (_unused) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
				loadStats();
			});
			return function loadData() {
				return _ref.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
			loadData();
		};
		const loadStats = function() {
			var _ref2 = _asyncToGenerator(function* () {
				try {
					var _res$data2;
					const res = yield wechatFriendApi.stats();
					stats.value = ((_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) || {};
				} catch (_unused2) {}
			});
			return function loadStats() {
				return _ref2.apply(this, arguments);
			};
		}();
		onMounted(loadData);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[5] || (_cache[5] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "wf-title" }, "微信好友"), createBaseVNode("p", { class: "wf-sub" }, "系统按云客配置主动同步工作手机里的个人微信好友，页面展示最近一次同步结果。")], -1)), createVNode(_component_el_button, {
					onClick: reload,
					plain: ""
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[4] || (_cache[4] = createTextVNode(" 刷新", -1))]),
					_: 1
				})]),
				createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [createBaseVNode("span", _hoisted_5, toDisplayString(stats.value.total || 0), 1), _cache[6] || (_cache[6] = createBaseVNode("span", { class: "wf-lbl" }, "好友总数", -1))]), createBaseVNode("div", _hoisted_6, [createBaseVNode("span", _hoisted_7, toDisplayString(stats.value.staffCount || 0), 1), _cache[7] || (_cache[7] = createBaseVNode("span", { class: "wf-lbl" }, "工作手机(员工微信)数", -1))])]),
				createBaseVNode("div", _hoisted_8, [
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						class: "wf-search",
						placeholder: "搜昵称/备注/微信号/手机",
						clearable: "",
						onKeyup: withKeys(reload, ["enter"]),
						onClear: reload
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: wxId.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => wxId.value = $event),
						placeholder: "按员工微信筛选",
						clearable: "",
						filterable: "",
						class: "wf-filter",
						onChange: reload
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(stats.value.staffWxIds || [], (w) => {
							return openBlock(), createBlock(_component_el_option, {
								key: w,
								label: w,
								value: w
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, { onClick: reload }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						}), _cache[8] || (_cache[8] = createTextVNode(" 查询", -1))]),
						_: 1
					})
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有同步到微信好友",
						"image-size": 80
					}, {
						default: withCtx(() => [..._cache[9] || (_cache[9] = [createBaseVNode("p", { class: "wf-empty-tip" }, [
							createTextVNode("系统会按"),
							createBaseVNode("b", null, "「云客对接配置」"),
							createTextVNode("主动同步微信好友。若暂未显示，请检查云客配置和员工云客关联，再刷新页面。")
						], -1)])]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "好友昵称",
							"min-width": "130",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.friendNickname || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备注",
							"min-width": "120",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.friendRemark || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "微信号",
							width: "140",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.friendAlias || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "手机号",
							width: "150",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.friendWxPhone || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "性别",
							width: "64",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(genderText(row.gender)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "地区",
							width: "110",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.region || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "标签",
							"min-width": "120",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [(openBlock(true), createElementBlock(Fragment, null, renderList(splitLabels(row.contactLabelValues), (t) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: t,
									size: "small",
									effect: "plain",
									style: { "margin": "2px" }
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(t), 1)]),
									_: 2
								}, 1024);
							}), 128)), !row.contactLabelValues ? (openBlock(), createElementBlock("span", _hoisted_9, "—")) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "所属员工微信",
							width: "130",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.wxId || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "来源",
							width: "96"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.fromType || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "更新时间",
							width: "150"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtTime(row.updateTime)), 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_10, [createVNode(_component_el_pagination, {
					"current-page": pageNum.value,
					"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => pageNum.value = $event),
					"page-size": pageSize.value,
					"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => pageSize.value = $event),
					total: total.value,
					"page-sizes": [
						20,
						50,
						100
					],
					layout: "total, sizes, prev, pager, next, jumper",
					onCurrentChange: loadData,
					onSizeChange: reload
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])
			]);
		};
	}
}), [["__scopeId", "data-v-7a9fffc9"]]);
//#endregion
export { wechat_friends_default as default };

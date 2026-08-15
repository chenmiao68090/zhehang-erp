import { Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, u as ElTreeSelect } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi, t as deptApi } from "./org-DaVetSL-.js";
//#region src/views/hrm/active-staff.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "active-staff" };
var _hoisted_2 = { class: "as-head" };
var _hoisted_3 = { class: "as-head-actions" };
var _hoisted_4 = { class: "as-overview" };
var _hoisted_5 = { class: "ov-card" };
var _hoisted_6 = { class: "ov-num" };
var _hoisted_7 = { class: "ov-card" };
var _hoisted_8 = {
	class: "ov-num",
	style: { "color": "#67c23a" }
};
var _hoisted_9 = { class: "ov-card" };
var _hoisted_10 = {
	class: "ov-num",
	style: { "color": "#e6a23c" }
};
var _hoisted_11 = { class: "as-pager" };
//#endregion
//#region src/views/hrm/active-staff.vue
var active_staff_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "active-staff",
	setup(__props) {
		const loading = ref(false);
		const list = ref([]);
		const total = ref(0);
		const counts = reactive({
			total: 0,
			formal: 0,
			probation: 0
		});
		const deptTree = ref([]);
		const query = reactive({
			pageNum: 1,
			pageSize: 20
		});
		function statusText(s) {
			return s === 2 ? "试用期" : s === 1 ? "正式在职" : "-";
		}
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const base = {
						pageNum: query.pageNum,
						pageSize: query.pageSize
					};
					if (query.name) base.name = query.name;
					if (query.deptId) base.deptId = query.deptId;
					if (query.status !== void 0) {
						const res = yield employeeApi.list(_objectSpread2(_objectSpread2({}, base), {}, { status: query.status }));
						list.value = (res === null || res === void 0 ? void 0 : res.records) || [];
						total.value = (res === null || res === void 0 ? void 0 : res.total) || 0;
					} else {
						const [r1, r2] = yield Promise.all([employeeApi.list(_objectSpread2(_objectSpread2({}, base), {}, { status: 1 })), employeeApi.list(_objectSpread2(_objectSpread2({}, base), {}, { status: 2 }))]);
						list.value = [...(r1 === null || r1 === void 0 ? void 0 : r1.records) || [], ...(r2 === null || r2 === void 0 ? void 0 : r2.records) || []];
						total.value = ((r1 === null || r1 === void 0 ? void 0 : r1.total) || 0) + ((r2 === null || r2 === void 0 ? void 0 : r2.total) || 0);
					}
					yield loadCounts();
				} catch (_unused) {
					list.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		function loadCounts() {
			return _loadCounts.apply(this, arguments);
		}
		function _loadCounts() {
			_loadCounts = _asyncToGenerator(function* () {
				try {
					const cbase = {};
					if (query.name) cbase.name = query.name;
					if (query.deptId) cbase.deptId = query.deptId;
					const [f, p] = yield Promise.all([employeeApi.list(_objectSpread2(_objectSpread2({}, cbase), {}, {
						status: 1,
						pageNum: 1,
						pageSize: 1
					})), employeeApi.list(_objectSpread2(_objectSpread2({}, cbase), {}, {
						status: 2,
						pageNum: 1,
						pageSize: 1
					}))]);
					counts.formal = (f === null || f === void 0 ? void 0 : f.total) || 0;
					counts.probation = (p === null || p === void 0 ? void 0 : p.total) || 0;
					counts.total = counts.formal + counts.probation;
				} catch (_unused2) {
					counts.formal = 0;
					counts.probation = 0;
					counts.total = 0;
				}
			});
			return _loadCounts.apply(this, arguments);
		}
		function search() {
			query.pageNum = 1;
			load();
		}
		function reset() {
			query.name = void 0;
			query.deptId = void 0;
			query.status = void 0;
			query.pageNum = 1;
			load();
		}
		function loadDeptTree() {
			return _loadDeptTree.apply(this, arguments);
		}
		function _loadDeptTree() {
			_loadDeptTree = _asyncToGenerator(function* () {
				try {
					deptTree.value = (yield deptApi.tree()) || [];
				} catch (_unused3) {
					deptTree.value = [];
				}
			});
			return _loadDeptTree.apply(this, arguments);
		}
		onMounted(() => {
			load();
			loadDeptTree();
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[7] || (_cache[7] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "as-title" }, "在职人员"), createBaseVNode("p", { class: "as-sub" }, "在职 + 试用期员工花名册(数据来自员工管理,只读展示;如需修改请到「系统管理 · 员工管理」)。")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
					icon: unref(refresh_default),
					onClick: load
				}, {
					default: withCtx(() => [..._cache[6] || (_cache[6] = [createTextVNode("刷新", -1)])]),
					_: 1
				}, 8, ["icon"])])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, toDisplayString(unref(counts).total), 1), _cache[8] || (_cache[8] = createBaseVNode("div", { class: "ov-lbl" }, "在职总数", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, toDisplayString(unref(counts).formal), 1), _cache[9] || (_cache[9] = createBaseVNode("div", { class: "ov-lbl" }, "正式在职", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("div", _hoisted_10, toDisplayString(unref(counts).probation), 1), _cache[10] || (_cache[10] = createBaseVNode("div", { class: "ov-lbl" }, "试用期", -1))])
				]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "as-filter"
				}, {
					default: withCtx(() => [createVNode(_component_el_form, {
						inline: true,
						onSubmit: _cache[3] || (_cache[3] = withModifiers(() => {}, ["prevent"]))
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "姓名" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(query).name,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(query).name = $event),
									clearable: "",
									placeholder: "姓名",
									style: { "width": "160px" },
									onKeyup: withKeys(search, ["enter"]),
									onClear: search
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "部门" }, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: unref(query).deptId,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(query).deptId = $event),
									data: unref(deptTree),
									props: {
										label: "name",
										children: "children",
										value: "id"
									},
									"check-strictly": "",
									clearable: "",
									placeholder: "全部部门",
									style: { "width": "200px" },
									onChange: search
								}, null, 8, ["modelValue", "data"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(query).status,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(query).status = $event),
									clearable: "",
									placeholder: "在职+试用",
									style: { "width": "140px" },
									onChange: search
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: "正式在职",
										value: 1
									}), createVNode(_component_el_option, {
										label: "试用期",
										value: 2
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									onClick: search
								}, {
									default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("查询", -1)])]),
									_: 1
								}), createVNode(_component_el_button, { onClick: reset }, {
									default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("重置", -1)])]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "as-table-card"
				}, {
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: unref(list),
						border: "",
						stripe: ""
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "暂无在职人员",
							"image-size": 80
						})]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								type: "index",
								label: "#",
								width: "55",
								align: "center"
							}),
							createVNode(_component_el_table_column, {
								label: "工号",
								prop: "empCode",
								"min-width": "110",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "姓名",
								prop: "name",
								"min-width": "90"
							}),
							createVNode(_component_el_table_column, {
								label: "部门",
								prop: "deptName",
								"min-width": "130",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "岗位",
								prop: "postName",
								"min-width": "130",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "入职日期",
								prop: "hireDate",
								"min-width": "120",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.hireDate || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "转正日期",
								prop: "regularDate",
								"min-width": "120",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.regularDate || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "手机",
								prop: "phone",
								"min-width": "130",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.status === 2 ? "warning" : "success",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusText(row.status)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, unref(loading)]]), createBaseVNode("div", _hoisted_11, [createVNode(_component_el_pagination, {
						background: "",
						layout: "total, sizes, prev, pager, next",
						total: unref(total),
						"current-page": unref(query).pageNum,
						"page-size": unref(query).pageSize,
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						onCurrentChange: _cache[4] || (_cache[4] = (p) => {
							unref(query).pageNum = p;
							load();
						}),
						onSizeChange: _cache[5] || (_cache[5] = (s) => {
							unref(query).pageSize = s;
							unref(query).pageNum = 1;
							load();
						})
					}, null, 8, [
						"total",
						"current-page",
						"page-size"
					])])]),
					_: 1
				})
			]);
		};
	}
}), [["__scopeId", "data-v-92c12a73"]]);
//#endregion
export { active_staff_default as default };

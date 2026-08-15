import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Er as withKeys, F as ElEmpty, Ft as circle_check_filled_default, H as ElDescriptions, S as ElSkeleton, T as ElProgress, U as ElDescriptionsItem, W as ElDatePicker, _ as ElTableColumn, br as warning_filled_default, c as ElSegmented, g as ElTable, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, pr as user_filled_default, s as vLoading, u as ElTreeSelect, vt as ElAlert, yt as ElIcon, z as ElDrawer, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source-DRu8uYHw.js";
/* empty css                */
//#region src/views/task-workbench/components/SubordinateDetailDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "rate-block" };
var _hoisted_2$1 = { class: "task-list" };
var _hoisted_3$1 = { key: 0 };
var _hoisted_4$1 = {
	key: 1,
	class: "metrics"
};
var _hoisted_5$1 = { class: "summary" };
//#endregion
//#region src/views/task-workbench/components/SubordinateDetailDrawer.vue
var SubordinateDetailDrawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SubordinateDetailDrawer",
	setup(__props, { expose: __expose }) {
		const visible = ref(false), loading = ref(false), detail = ref();
		function open(_x) {
			return _open.apply(this, arguments);
		}
		function _open() {
			_open = _asyncToGenerator(function* (loader) {
				visible.value = true;
				loading.value = true;
				detail.value = void 0;
				try {
					detail.value = yield loader();
				} catch (_unused) {
					ElMessage.error("下属任务详情加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _open.apply(this, arguments);
		}
		__expose({ open });
		return (_ctx, _cache) => {
			var _detail$value;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_tag = ElTag;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_progress = ElProgress;
			const _component_el_icon = ElIcon;
			const _component_el_empty = ElEmpty;
			const _component_el_drawer = ElDrawer;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
				title: `${((_detail$value = detail.value) === null || _detail$value === void 0 ? void 0 : _detail$value.userName) || ""} · 工作详情`,
				size: "720px"
			}, {
				default: withCtx(() => [loading.value ? (openBlock(), createBlock(_component_el_skeleton, {
					key: 0,
					rows: 6,
					animated: ""
				})) : detail.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createVNode(_component_el_descriptions, {
						column: 2,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "部门" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detail.value.deptName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "角色" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detail.value.roleName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "统计周期" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detail.value.periodKey), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "报告状态" }, {
								default: withCtx(() => [createVNode(_component_el_tag, { type: detail.value.submitted ? "success" : "danger" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.submitted ? "已提交" : "未提交"), 1)]),
									_: 1
								}, 8, ["type"])]),
								_: 1
							})
						]),
						_: 1
					}),
					createBaseVNode("div", _hoisted_1$1, [_cache[1] || (_cache[1] = createBaseVNode("strong", null, "任务完成率", -1)), createVNode(_component_el_progress, {
						percentage: detail.value.completionRate,
						status: detail.value.completionRate >= 100 ? "success" : void 0
					}, null, 8, ["percentage", "status"])]),
					_cache[2] || (_cache[2] = createBaseVNode("h3", null, "任务明细", -1)),
					createBaseVNode("div", _hoisted_2$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(detail.value.tasks, (task) => {
						var _task$metrics;
						return openBlock(), createElementBlock("article", {
							key: task.id,
							class: normalizeClass(["task-row", task.status])
						}, [
							createVNode(_component_el_icon, null, {
								default: withCtx(() => [task.status === "done" ? (openBlock(), createBlock(unref(circle_check_filled_default), { key: 0 })) : task.status === "undone" ? (openBlock(), createBlock(unref(warning_filled_default), { key: 1 })) : (openBlock(), createBlock(unref(clock_default), { key: 2 }))]),
								_: 2
							}, 1024),
							createBaseVNode("div", null, [
								createBaseVNode("strong", null, toDisplayString(task.taskName), 1),
								createBaseVNode("p", null, toDisplayString(task.completionStandard || task.workContent || "-"), 1),
								task.undoneReason ? (openBlock(), createElementBlock("small", _hoisted_3$1, "未完成原因：" + toDisplayString(task.undoneReason), 1)) : createCommentVNode("", true),
								((_task$metrics = task.metrics) === null || _task$metrics === void 0 ? void 0 : _task$metrics.length) ? (openBlock(), createElementBlock("div", _hoisted_4$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(task.metrics, (m) => {
									return openBlock(), createBlock(_component_el_tag, {
										key: m.code,
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => {
											var _m$value, _m$target;
											return [createTextVNode(toDisplayString(m.label) + " " + toDisplayString((_m$value = m.value) !== null && _m$value !== void 0 ? _m$value : 0) + "/" + toDisplayString((_m$target = m.target) !== null && _m$target !== void 0 ? _m$target : "-") + " " + toDisplayString(m.unit), 1)];
										}),
										_: 2
									}, 1024);
								}), 128))])) : createCommentVNode("", true)
							]),
							createVNode(_component_el_tag, { type: task.status === "done" ? "success" : task.status === "undone" ? "danger" : "warning" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(task.status === "done" ? "完成" : task.status === "undone" ? "未完成" : "进行中"), 1)]),
								_: 2
							}, 1032, ["type"])
						], 2);
					}), 128))]),
					_cache[3] || (_cache[3] = createBaseVNode("h3", null, "工作总结", -1)),
					createBaseVNode("div", _hoisted_5$1, toDisplayString(detail.value.summary || "未填写总结"), 1)
				], 64)) : (openBlock(), createBlock(_component_el_empty, {
					key: 2,
					description: "没有可查看的详情"
				}))]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-67843b88"]]);
//#endregion
//#region src/views/task-workbench/subordinate-view.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench task-workbench-page subordinate-page" };
var _hoisted_2 = { class: "page-head page-heading" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { class: "eyebrow" };
var _hoisted_5 = {
	key: 2,
	class: "toolbar-card"
};
var _hoisted_6 = {
	key: 3,
	class: "metric-strip"
};
var _hoisted_7 = { class: "good" };
var _hoisted_8 = { class: "danger" };
var _hoisted_9 = {
	key: 4,
	class: "content-card"
};
var _hoisted_10 = {
	key: 2,
	class: "good"
};
//#endregion
//#region src/views/task-workbench/subordinate-view.vue
var subordinate_view_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "subordinate-view",
	setup(__props) {
		const now = /* @__PURE__ */ new Date();
		function pad(n) {
			return String(n).padStart(2, "0");
		}
		function dateKey(d) {
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		}
		function weekKey(d) {
			const x = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), day = x.getUTCDay() || 7;
			x.setUTCDate(x.getUTCDate() + 4 - day);
			const start = new Date(Date.UTC(x.getUTCFullYear(), 0, 1)), week = Math.ceil(((x.getTime() - start.getTime()) / 864e5 + 1) / 7);
			return `${x.getUTCFullYear()}-W${pad(week)}`;
		}
		const query = reactive({
			roleId: void 0,
			cycleType: "day",
			periodKey: dateKey(now),
			keyword: "",
			pageNum: 1,
			pageSize: 200
		}), weekDate = ref(now), roles = ref([]), rows = ref([]), loading = ref(false), manager = ref(false), errorText = ref(""), drawerRef = ref();
		const treeProps = {
			label: "name",
			children: "children",
			value: "id"
		}, cycleOptions = [
			{
				label: "每日",
				value: "day"
			},
			{
				label: "每周",
				value: "week"
			},
			{
				label: "每月",
				value: "month"
			}
		];
		function unwrap(v) {
			var _ref, _v$data$data, _v$data;
			return (_ref = (_v$data$data = v === null || v === void 0 || (_v$data = v.data) === null || _v$data === void 0 ? void 0 : _v$data.data) !== null && _v$data$data !== void 0 ? _v$data$data : v === null || v === void 0 ? void 0 : v.data) !== null && _ref !== void 0 ? _ref : v;
		}
		const submittedCount = computed(() => rows.value.filter((r) => r.submitted).length), averageRate = computed(() => rows.value.length ? Math.round(rows.value.reduce((s, r) => s + r.completionRate, 0) / rows.value.length) : 0);
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				errorText.value = "";
				try {
					const r = unwrap(yield feigeTaskData.subordinates(_objectSpread2({}, query)));
					rows.value = (r === null || r === void 0 ? void 0 : r.records) || [];
				} catch (_unused) {
					rows.value = [];
					errorText.value = "下属工作数据加载失败，生产环境不会展示演示人员。";
				} finally {
					loading.value = false;
				}
			});
			return _loadRows.apply(this, arguments);
		}
		function loadRoles() {
			return _loadRoles.apply(this, arguments);
		}
		function _loadRoles() {
			_loadRoles = _asyncToGenerator(function* () {
				try {
					roles.value = unwrap(yield feigeTaskData.roleTree()) || [];
				} catch (_unused2) {
					roles.value = [];
				}
			});
			return _loadRoles.apply(this, arguments);
		}
		function loadCapabilities() {
			return _loadCapabilities.apply(this, arguments);
		}
		function _loadCapabilities() {
			_loadCapabilities = _asyncToGenerator(function* () {
				try {
					var _await$feigeTaskData$;
					manager.value = Boolean((_await$feigeTaskData$ = yield feigeTaskData.capabilities()) === null || _await$feigeTaskData$ === void 0 ? void 0 : _await$feigeTaskData$.manager);
				} catch (_unused3) {
					manager.value = false;
				}
			});
			return _loadCapabilities.apply(this, arguments);
		}
		function changeCycle() {
			if (query.cycleType === "day") query.periodKey = dateKey(now);
			else if (query.cycleType === "week") query.periodKey = weekKey(weekDate.value);
			else query.periodKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
			loadRows();
		}
		function changeWeek(d) {
			query.periodKey = weekKey(new Date(d));
			loadRows();
		}
		function openDetail(row) {
			var _drawerRef$value;
			(_drawerRef$value = drawerRef.value) === null || _drawerRef$value === void 0 || _drawerRef$value.open(_asyncToGenerator(function* () {
				return unwrap(yield feigeTaskData.subordinateDetail({
					userId: row.userId,
					cycleType: query.cycleType,
					periodKey: query.periodKey
				}));
			}));
		}
		onMounted(_asyncToGenerator(function* () {
			yield loadCapabilities();
			if (manager.value || feigeTaskLocalDemo()) {
				loadRoles();
				loadRows();
			}
		}));
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_alert = ElAlert;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_segmented = ElSegmented;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_progress = ElProgress;
			const _component_el_table = ElTable;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(user_filled_default))]),
						_: 1
					}), _cache[6] || (_cache[6] = createTextVNode(" 任务工单 · 团队执行", -1))]),
					_cache[7] || (_cache[7] = createBaseVNode("h2", null, "下属工作视图", -1)),
					_cache[8] || (_cache[8] = createBaseVNode("p", null, "主管查看授权部门内员工的提交率、完成率和未完成原因，不能越权查看其他部门。", -1))
				]), unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tag, {
					key: 0,
					type: "warning",
					size: "large",
					effect: "dark"
				}, {
					default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("LOCAL-DEMO 演示数据", -1)])]),
					_: 1
				})) : createCommentVNode("", true)]),
				!manager.value && !unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: "只有主管、老板或管理员可以查看下属工作。",
					type: "warning",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				errorText.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 1,
					title: errorText.value,
					type: "error",
					"show-icon": "",
					closable: false
				}, null, 8, ["title"])) : createCommentVNode("", true),
				manager.value || unref(feigeTaskLocalDemo)() ? (openBlock(), createElementBlock("section", _hoisted_5, [
					createVNode(_component_el_tree_select, {
						modelValue: query.roleId,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => query.roleId = $event),
						data: roles.value,
						"node-key": "id",
						props: treeProps,
						"check-strictly": "",
						clearable: "",
						placeholder: "全部角色",
						onChange: loadRows
					}, null, 8, ["modelValue", "data"]),
					createVNode(_component_el_segmented, {
						modelValue: query.cycleType,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => query.cycleType = $event),
						options: cycleOptions,
						onChange: changeCycle
					}, null, 8, ["modelValue"]),
					query.cycleType === "day" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 0,
						modelValue: query.periodKey,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.periodKey = $event),
						type: "date",
						"value-format": "YYYY-MM-DD",
						clearable: false,
						onChange: loadRows
					}, null, 8, ["modelValue"])) : query.cycleType === "week" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 1,
						modelValue: weekDate.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => weekDate.value = $event),
						type: "week",
						format: "YYYY 第 ww 周",
						clearable: false,
						onChange: changeWeek
					}, null, 8, ["modelValue"])) : (openBlock(), createBlock(_component_el_date_picker, {
						key: 2,
						modelValue: query.periodKey,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => query.periodKey = $event),
						type: "month",
						"value-format": "YYYY-MM",
						clearable: false,
						onChange: loadRows
					}, null, 8, ["modelValue"])),
					createVNode(_component_el_input, {
						modelValue: query.keyword,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => query.keyword = $event),
						clearable: "",
						placeholder: "搜索姓名或部门",
						onKeyup: withKeys(loadRows, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						loading: loading.value,
						onClick: loadRows
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["loading"])
				])) : createCommentVNode("", true),
				manager.value || unref(feigeTaskLocalDemo)() ? (openBlock(), createElementBlock("section", _hoisted_6, [
					createBaseVNode("div", null, [_cache[11] || (_cache[11] = createBaseVNode("span", null, "下属人数", -1)), createBaseVNode("strong", null, toDisplayString(rows.value.length), 1)]),
					createBaseVNode("div", null, [_cache[12] || (_cache[12] = createBaseVNode("span", null, "已提交报告", -1)), createBaseVNode("strong", _hoisted_7, toDisplayString(submittedCount.value), 1)]),
					createBaseVNode("div", null, [_cache[13] || (_cache[13] = createBaseVNode("span", null, "未提交报告", -1)), createBaseVNode("strong", _hoisted_8, toDisplayString(rows.value.length - submittedCount.value), 1)]),
					createBaseVNode("div", null, [_cache[14] || (_cache[14] = createBaseVNode("span", null, "平均完成率", -1)), createBaseVNode("strong", null, toDisplayString(averageRate.value) + "%", 1)])
				])) : createCommentVNode("", true),
				manager.value || unref(feigeTaskLocalDemo)() ? (openBlock(), createElementBlock("section", _hoisted_9, [withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					"row-key": "userId"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "userName",
							label: "员工",
							"min-width": "140"
						}),
						createVNode(_component_el_table_column, {
							prop: "deptName",
							label: "部门",
							"min-width": "150"
						}),
						createVNode(_component_el_table_column, {
							prop: "roleName",
							label: "角色",
							"min-width": "130"
						}),
						createVNode(_component_el_table_column, {
							label: "任务进度",
							"min-width": "230"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_progress, {
								percentage: row.completionRate,
								format: () => `${row.done}/${row.total}`,
								status: row.completionRate >= 100 ? "success" : void 0
							}, null, 8, [
								"percentage",
								"format",
								"status"
							])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "报告",
							width: "100"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.submitted ? "success" : "danger" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.submitted ? "已提交" : "未提交"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "风险",
							"min-width": "140"
						}, {
							default: withCtx(({ row }) => [!row.submitted ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								type: "danger",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("缺报", -1)])]),
								_: 1
							})) : row.completionRate < 80 ? (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								type: "warning",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("完成率偏低", -1)])]),
								_: 1
							})) : (openBlock(), createElementBlock("span", _hoisted_10, "正常"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "100"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								link: "",
								type: "primary",
								onClick: ($event) => openDetail(row)
							}, {
								default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("查看详情", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])])) : createCommentVNode("", true),
				createVNode(SubordinateDetailDrawer_default, {
					ref_key: "drawerRef",
					ref: drawerRef
				}, null, 512)
			]);
		};
	}
}), [["__scopeId", "data-v-4f18e0c5"]]);
//#endregion
export { subordinate_view_default as default };

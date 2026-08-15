import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { E as ElPopconfirm, Er as withKeys, H as ElDescriptions, Jt as data_analysis_default, Q as ElRadioGroup, T as ElProgress, U as ElDescriptionsItem, V as ElDialog, W as ElDatePicker, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, c as ElSegmented, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, u as ElTreeSelect, vt as ElAlert, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source.production-DbokqIsz.js";
/* empty css                */
//#region src/views/task-workbench/components/WorkflowReportDetail.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "detail-rate" };
var _hoisted_2$1 = { class: "day-list" };
var _hoisted_3$1 = { class: "summary-box" };
//#endregion
//#region src/views/task-workbench/components/WorkflowReportDetail.vue
var WorkflowReportDetail_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "WorkflowReportDetail",
	setup(__props, { expose: __expose }) {
		const visible = ref(false);
		const row = ref();
		function open(record) {
			row.value = record;
			visible.value = true;
		}
		__expose({ open });
		return (_ctx, _cache) => {
			var _row$value;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_progress = ElProgress;
			const _component_el_tag = ElTag;
			const _component_el_drawer = ElDrawer;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
				title: `${((_row$value = row.value) === null || _row$value === void 0 ? void 0 : _row$value.userName) || ""} · 工作报告`,
				size: "720px"
			}, {
				default: withCtx(() => [row.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createVNode(_component_el_descriptions, {
						column: 2,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "部门" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.value.deptName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "角色" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.value.roleName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "应报天数" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.value.requiredDays), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "已报天数" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.value.submittedDays), 1)]),
								_: 1
							})
						]),
						_: 1
					}),
					createBaseVNode("div", _hoisted_1$1, [_cache[1] || (_cache[1] = createBaseVNode("strong", null, "报告完成率", -1)), createVNode(_component_el_progress, {
						percentage: row.value.completionRate,
						status: row.value.completionRate >= 100 ? "success" : void 0
					}, null, 8, ["percentage", "status"])]),
					_cache[2] || (_cache[2] = createBaseVNode("h3", null, "逐日提交记录", -1)),
					createBaseVNode("div", _hoisted_2$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(row.value.days, (day) => {
						return openBlock(), createElementBlock("div", {
							key: day.date,
							class: "day-row"
						}, [
							createBaseVNode("span", null, toDisplayString(day.date), 1),
							createVNode(_component_el_tag, { type: day.submitted ? "success" : "danger" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(day.submitted ? "已提交" : "缺报"), 1)]),
								_: 2
							}, 1032, ["type"]),
							createBaseVNode("em", null, toDisplayString(day.done || 0) + "/" + toDisplayString(day.total || 0) + " 项完成", 1)
						]);
					}), 128))]),
					_cache[3] || (_cache[3] = createBaseVNode("h3", null, "周期总结", -1)),
					createBaseVNode("div", _hoisted_3$1, toDisplayString(row.value.summary || "未填写总结"), 1)
				], 64)) : createCommentVNode("", true)]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-bd8ef27b"]]);
//#endregion
//#region src/views/task-workbench/workflow-report.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench task-workbench-page workflow-report-page" };
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
var _hoisted_9 = { class: "content-card heatmap-wrap" };
var _hoisted_10 = { class: "heat-table" };
var _hoisted_11 = ["onClick"];
var _hoisted_12 = ["title"];
var _hoisted_13 = { class: "content-card" };
var _hoisted_14 = { class: "content-card scope-card" };
var _hoisted_15 = { class: "section-head" };
//#endregion
//#region src/views/task-workbench/workflow-report.vue
var workflow_report_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "workflow-report",
	setup(__props) {
		const activeTab = ref("heatmap");
		const loading = ref(false), scopeLoading = ref(false), manager = ref(false);
		const reports = ref([]), scopes = ref([]);
		const roleTree = ref([]), staff = ref([]);
		const errorText = ref("");
		const now = /* @__PURE__ */ new Date();
		const weekDate = ref(new Date(now));
		const query = reactive({
			cycleType: "day",
			periodKey: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
			roleId: void 0,
			keyword: ""
		});
		const cycleOptions = [
			{
				label: "日报",
				value: "day"
			},
			{
				label: "周报",
				value: "week"
			},
			{
				label: "月报",
				value: "month"
			}
		];
		const treeProps = {
			label: "name",
			children: "children",
			value: "id"
		};
		const detailRef = ref();
		const scopeDialog = ref(false);
		const scopeForm = reactive({
			scopeType: "role",
			targetId: void 0
		});
		function unwrap(value) {
			var _ref, _value$data$data, _value$data;
			return (_ref = (_value$data$data = value === null || value === void 0 || (_value$data = value.data) === null || _value$data === void 0 ? void 0 : _value$data.data) !== null && _value$data$data !== void 0 ? _value$data$data : value === null || value === void 0 ? void 0 : value.data) !== null && _ref !== void 0 ? _ref : value;
		}
		const fullSubmitted = computed(() => reports.value.filter((row) => row.missingDays === 0).length);
		const missingPeople = computed(() => reports.value.filter((row) => row.missingDays > 0).length);
		const averageRate = computed(() => reports.value.length ? Math.round(reports.value.reduce((sum, row) => sum + row.completionRate, 0) / reports.value.length) : 0);
		const dayHeaders = computed(() => Array.from(new Set(reports.value.flatMap((row) => row.days.map((day) => day.date)))).sort());
		const heatGridStyle = computed(() => {
			const dayCount = Math.max(dayHeaders.value.length, 1);
			return {
				gridTemplateColumns: `190px repeat(${dayCount}, 28px) 76px`,
				minWidth: `${190 + dayCount * 33 + 86}px`
			};
		});
		function dayEntry(row, date) {
			return row.days.find((day) => day.date === date);
		}
		function dayState(row, date) {
			const day = dayEntry(row, date);
			if (!(day === null || day === void 0 ? void 0 : day.submitted)) return "missing";
			return (day.done || 0) >= (day.total || 0) ? "full" : "partial";
		}
		function dayStateText(row, date) {
			const state = dayState(row, date);
			return state === "full" ? "已提交且完成" : state === "partial" ? "已提交但未全部完成" : "缺报";
		}
		function currentWeekKey(date = /* @__PURE__ */ new Date()) {
			const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
			const day = utc.getUTCDay() || 7;
			utc.setUTCDate(utc.getUTCDate() + 4 - day);
			const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
			const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 864e5 + 1) / 7);
			return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
		}
		function handleCycleChange() {
			if (query.cycleType === "week") weekDate.value = new Date(now);
			query.periodKey = query.cycleType === "week" ? currentWeekKey(weekDate.value) : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
			loadReports();
		}
		function handleWeekChange(value) {
			if (!value) return;
			query.periodKey = currentWeekKey(new Date(value));
			loadReports();
		}
		function loadReports() {
			return _loadReports.apply(this, arguments);
		}
		function _loadReports() {
			_loadReports = _asyncToGenerator(function* () {
				loading.value = true;
				errorText.value = "";
				try {
					reports.value = unwrap(yield feigeTaskData.workflowReport(_objectSpread2({}, query))) || [];
				} catch (_unused) {
					reports.value = [];
					errorText.value = "报表加载失败，生产环境不会自动填充演示数据。";
				} finally {
					loading.value = false;
				}
			});
			return _loadReports.apply(this, arguments);
		}
		function loadScopes() {
			return _loadScopes.apply(this, arguments);
		}
		function _loadScopes() {
			_loadScopes = _asyncToGenerator(function* () {
				scopeLoading.value = true;
				try {
					scopes.value = unwrap(yield feigeTaskData.requiredScopes()) || [];
				} catch (_unused2) {
					scopes.value = [];
				} finally {
					scopeLoading.value = false;
				}
			});
			return _loadScopes.apply(this, arguments);
		}
		function loadOptions() {
			return _loadOptions.apply(this, arguments);
		}
		function _loadOptions() {
			_loadOptions = _asyncToGenerator(function* () {
				try {
					const [roles, people] = yield Promise.all([feigeTaskData.roleTree(), feigeTaskData.staffOptions()]);
					roleTree.value = unwrap(roles) || [];
					staff.value = unwrap(people) || [];
				} catch (_unused3) {
					roleTree.value = [];
					staff.value = [];
				}
			});
			return _loadOptions.apply(this, arguments);
		}
		function loadCapabilities() {
			return _loadCapabilities.apply(this, arguments);
		}
		function _loadCapabilities() {
			_loadCapabilities = _asyncToGenerator(function* () {
				try {
					var _await$feigeTaskData$;
					manager.value = Boolean((_await$feigeTaskData$ = yield feigeTaskData.capabilities()) === null || _await$feigeTaskData$ === void 0 ? void 0 : _await$feigeTaskData$.manager);
				} catch (_unused4) {
					manager.value = false;
				}
			});
			return _loadCapabilities.apply(this, arguments);
		}
		function openScope() {
			scopeForm.scopeType = "role";
			scopeForm.targetId = void 0;
			scopeDialog.value = true;
		}
		function saveScope() {
			return _saveScope.apply(this, arguments);
		}
		function _saveScope() {
			_saveScope = _asyncToGenerator(function* () {
				if (!scopeForm.targetId) return ElMessage.warning("请选择范围对象");
				const target = (scopeForm.scopeType === "role" ? flattenRoles(roleTree.value) : staff.value).find((item) => item.id === scopeForm.targetId);
				try {
					yield feigeTaskData.saveRequiredScope({
						scopeType: scopeForm.scopeType,
						targetId: scopeForm.targetId,
						targetName: (target === null || target === void 0 ? void 0 : target.name) || "未命名对象",
						enabled: true
					});
					scopeDialog.value = false;
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：预览范围已更新" : "必报范围已保存");
					yield loadScopes();
				} catch (_unused5) {
					ElMessage.error("必报范围保存失败");
				}
			});
			return _saveScope.apply(this, arguments);
		}
		function flattenRoles(nodes) {
			return nodes.flatMap((node) => [node, ...flattenRoles(node.children || [])]);
		}
		function removeScope(_x) {
			return _removeScope.apply(this, arguments);
		}
		function _removeScope() {
			_removeScope = _asyncToGenerator(function* (id) {
				try {
					yield feigeTaskData.deleteRequiredScope(id);
					ElMessage.success("已移除");
					yield loadScopes();
				} catch (_unused6) {
					ElMessage.error("移除失败");
				}
			});
			return _removeScope.apply(this, arguments);
		}
		function csvCell(value) {
			const text = String(value !== null && value !== void 0 ? value : "");
			return `"${(/^[=+\-@]/.test(text) ? `'${text}` : text).replace(/"/g, "\"\"")}"`;
		}
		function exportReports() {
			const csv = [[
				"员工",
				"部门",
				"角色",
				"应报",
				"已报",
				"缺报",
				"完成率"
			], ...reports.value.map((row) => [
				row.userName,
				row.deptName,
				row.roleName,
				row.requiredDays,
				row.submittedDays,
				row.missingDays,
				`${row.completionRate}%`
			])].map((row) => row.map(csvCell).join(",")).join("\n");
			const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = `工作计划报表-${query.cycleType}-${query.periodKey}.csv`;
			link.click();
			URL.revokeObjectURL(url);
		}
		onMounted(_asyncToGenerator(function* () {
			yield loadCapabilities();
			if (manager.value || feigeTaskLocalDemo()) {
				loadOptions();
				loadReports();
				loadScopes();
			}
		}));
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_alert = ElAlert;
			const _component_el_segmented = ElSegmented;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_table_column = ElTableColumn;
			const _component_el_progress = ElProgress;
			const _component_el_table = ElTable;
			const _component_el_popconfirm = ElPopconfirm;
			const _component_el_tabs = ElTabs;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(data_analysis_default))]),
						_: 1
					}), _cache[11] || (_cache[11] = createTextVNode(" 任务工单 · 执行监督", -1))]),
					_cache[12] || (_cache[12] = createBaseVNode("h2", null, "工作计划报表", -1)),
					_cache[13] || (_cache[13] = createBaseVNode("p", null, "用热力图识别缺报和低完成率，必报范围由角色或员工明确配置。", -1))
				]), unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tag, {
					key: 0,
					type: "warning",
					size: "large",
					effect: "dark"
				}, {
					default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("LOCAL-DEMO 演示数据", -1)])]),
					_: 1
				})) : createCommentVNode("", true)]),
				!manager.value && !unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: "只有主管、老板或管理员可以查看团队工作报表。",
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
					createVNode(_component_el_segmented, {
						modelValue: query.cycleType,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => query.cycleType = $event),
						options: cycleOptions,
						onChange: handleCycleChange
					}, null, 8, ["modelValue"]),
					query.cycleType === "week" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 0,
						modelValue: weekDate.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => weekDate.value = $event),
						type: "week",
						format: "YYYY-MM-DD（第 ww 周）",
						clearable: false,
						onChange: handleWeekChange
					}, null, 8, ["modelValue"])) : (openBlock(), createBlock(_component_el_date_picker, {
						key: 1,
						modelValue: query.periodKey,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.periodKey = $event),
						type: "month",
						"value-format": "YYYY-MM",
						clearable: false,
						onChange: loadReports
					}, null, 8, ["modelValue"])),
					createVNode(_component_el_tree_select, {
						modelValue: query.roleId,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => query.roleId = $event),
						data: roleTree.value,
						"node-key": "id",
						props: treeProps,
						clearable: "",
						"check-strictly": "",
						placeholder: "全部角色",
						onChange: loadReports
					}, null, 8, ["modelValue", "data"]),
					createVNode(_component_el_input, {
						modelValue: query.keyword,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => query.keyword = $event),
						clearable: "",
						placeholder: "搜索员工、部门",
						onKeyup: withKeys(loadReports, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						loading: loading.value,
						onClick: loadReports
					}, {
						default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["loading"]),
					createVNode(_component_el_button, {
						disabled: !reports.value.length,
						onClick: exportReports
					}, {
						default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("导出", -1)])]),
						_: 1
					}, 8, ["disabled"])
				])) : createCommentVNode("", true),
				manager.value || unref(feigeTaskLocalDemo)() ? (openBlock(), createElementBlock("section", _hoisted_6, [
					createBaseVNode("div", null, [_cache[17] || (_cache[17] = createBaseVNode("span", null, "必报人数", -1)), createBaseVNode("strong", null, toDisplayString(reports.value.length), 1)]),
					createBaseVNode("div", null, [_cache[18] || (_cache[18] = createBaseVNode("span", null, "已全部提交", -1)), createBaseVNode("strong", _hoisted_7, toDisplayString(fullSubmitted.value), 1)]),
					createBaseVNode("div", null, [_cache[19] || (_cache[19] = createBaseVNode("span", null, "存在缺报", -1)), createBaseVNode("strong", _hoisted_8, toDisplayString(missingPeople.value), 1)]),
					createBaseVNode("div", null, [_cache[20] || (_cache[20] = createBaseVNode("span", null, "平均完成率", -1)), createBaseVNode("strong", null, toDisplayString(averageRate.value) + "%", 1)])
				])) : createCommentVNode("", true),
				manager.value || unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tabs, {
					key: 4,
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => activeTab.value = $event),
					class: "report-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "完成热力图",
							name: "heatmap"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_9, [_cache[23] || (_cache[23] = createBaseVNode("div", { class: "heatmap-legend" }, [
								createBaseVNode("span", null, "完成情况"),
								createBaseVNode("i", { class: "heat full" }),
								createTextVNode("已提交 "),
								createBaseVNode("i", { class: "heat partial" }),
								createTextVNode("部分完成 "),
								createBaseVNode("i", { class: "heat missing" }),
								createTextVNode("缺报")
							], -1)), createBaseVNode("div", _hoisted_10, [createBaseVNode("div", {
								class: "heat-header",
								style: normalizeStyle(heatGridStyle.value)
							}, [
								_cache[21] || (_cache[21] = createBaseVNode("strong", null, "员工", -1)),
								(openBlock(true), createElementBlock(Fragment, null, renderList(dayHeaders.value, (day) => {
									return openBlock(), createElementBlock("span", { key: day }, toDisplayString(day.slice(-2)), 1);
								}), 128)),
								_cache[22] || (_cache[22] = createBaseVNode("em", null, "完成率", -1))
							], 4), (openBlock(true), createElementBlock(Fragment, null, renderList(reports.value, (row) => {
								return openBlock(), createElementBlock("button", {
									key: row.userId,
									type: "button",
									class: "heat-row",
									style: normalizeStyle(heatGridStyle.value),
									onClick: ($event) => {
										var _detailRef$value;
										return (_detailRef$value = detailRef.value) === null || _detailRef$value === void 0 ? void 0 : _detailRef$value.open(row);
									}
								}, [
									createBaseVNode("strong", null, [createBaseVNode("b", null, toDisplayString(row.userName), 1), createBaseVNode("small", null, toDisplayString(row.deptName || row.roleName), 1)]),
									(openBlock(true), createElementBlock(Fragment, null, renderList(dayHeaders.value, (day) => {
										return openBlock(), createElementBlock("span", {
											key: day,
											class: normalizeClass(["heat", dayState(row, day)]),
											title: `${day} ${dayStateText(row, day)}`
										}, null, 10, _hoisted_12);
									}), 128)),
									createBaseVNode("em", null, toDisplayString(row.completionRate) + "%", 1)
								], 12, _hoisted_11);
							}), 128))])])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "报表明细",
							name: "list"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_13, [withDirectives((openBlock(), createBlock(_component_el_table, { data: reports.value }, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "userName",
										label: "员工",
										"min-width": "130"
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
										prop: "requiredDays",
										label: "应报",
										width: "80",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "submittedDays",
										label: "已报",
										width: "80",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "missingDays",
										label: "缺报",
										width: "80",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createBaseVNode("strong", { class: normalizeClass({ danger: row.missingDays > 0 }) }, toDisplayString(row.missingDays), 3)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "完成率",
										"min-width": "180"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_progress, {
											percentage: row.completionRate,
											status: row.completionRate >= 100 ? "success" : void 0
										}, null, 8, ["percentage", "status"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "100"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											onClick: ($event) => {
												var _detailRef$value2;
												return (_detailRef$value2 = detailRef.value) === null || _detailRef$value2 === void 0 ? void 0 : _detailRef$value2.open(row);
											}
										}, {
											default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("查看详情", -1)])]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, loading.value]])])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "必报范围",
							name: "scope"
						}, {
							default: withCtx(() => [createBaseVNode("section", _hoisted_14, [
								createBaseVNode("div", _hoisted_15, [_cache[26] || (_cache[26] = createBaseVNode("div", null, [createBaseVNode("h3", null, "必报范围"), createBaseVNode("p", null, "只配置确实需要提交工作报告的角色或员工，减少无效填报。")], -1)), createVNode(_component_el_button, {
									type: "primary",
									onClick: openScope
								}, {
									default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("新增范围", -1)])]),
									_: 1
								})]),
								!scopeLoading.value && !scopes.value.length ? (openBlock(), createBlock(_component_el_alert, {
									key: 0,
									title: "尚未配置必报范围",
									description: "未配置时不会产生应报人员和缺报统计，请至少添加一个角色或员工。",
									type: "warning",
									"show-icon": "",
									closable: false,
									class: "scope-empty-alert"
								})) : createCommentVNode("", true),
								!roleTree.value.length && !staff.value.length ? (openBlock(), createBlock(_component_el_alert, {
									key: 1,
									title: "系统暂无可选角色或员工",
									description: "请先在系统角色和员工管理中完成组织配置，本页不另建角色。",
									type: "info",
									"show-icon": "",
									closable: false,
									class: "scope-empty-alert"
								})) : createCommentVNode("", true),
								withDirectives((openBlock(), createBlock(_component_el_table, {
									data: scopes.value,
									"empty-text": "暂无必报范围，请点击右上角新增"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "类型",
											width: "100"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, null, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.scopeType === "role" ? "角色" : "员工"), 1)]),
												_: 2
											}, 1024)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											prop: "targetName",
											label: "范围对象",
											"min-width": "180"
										}),
										createVNode(_component_el_table_column, {
											label: "状态",
											width: "100"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.enabled ? "success" : "info" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "启用" : "停用"), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "操作",
											width: "90"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_popconfirm, {
												title: "确认移除此必报范围？",
												onConfirm: ($event) => removeScope(row.id)
											}, {
												reference: withCtx(() => [createVNode(_component_el_button, {
													link: "",
													type: "danger"
												}, {
													default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("移除", -1)])]),
													_: 1
												})]),
												_: 1
											}, 8, ["onConfirm"])]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])), [[_directive_loading, scopeLoading.value]])
							])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: scopeDialog.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => scopeDialog.value = $event),
					title: "新增必报范围",
					width: "500px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => scopeDialog.value = false) }, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: saveScope
					}, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("保存", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-width": "90px" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, { label: "范围类型" }, {
							default: withCtx(() => [createVNode(_component_el_radio_group, {
								modelValue: scopeForm.scopeType,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => scopeForm.scopeType = $event)
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_button, { value: "role" }, {
									default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("按角色", -1)])]),
									_: 1
								}), createVNode(_component_el_radio_button, { value: "user" }, {
									default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("按员工", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "选择对象" }, {
							default: withCtx(() => [scopeForm.scopeType === "role" ? (openBlock(), createBlock(_component_el_tree_select, {
								key: 0,
								modelValue: scopeForm.targetId,
								"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => scopeForm.targetId = $event),
								data: roleTree.value,
								"node-key": "id",
								props: treeProps,
								"check-strictly": "",
								style: { "width": "100%" }
							}, null, 8, ["modelValue", "data"])) : (openBlock(), createBlock(_component_el_select, {
								key: 1,
								modelValue: scopeForm.targetId,
								"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => scopeForm.targetId = $event),
								filterable: "",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (person) => {
									return openBlock(), createBlock(_component_el_option, {
										key: person.id,
										value: person.id,
										label: `${person.name} · ${person.deptName || ""}`
									}, null, 8, ["value", "label"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"]))]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(WorkflowReportDetail_default, {
					ref_key: "detailRef",
					ref: detailRef
				}, null, 512)
			]);
		};
	}
}), [["__scopeId", "data-v-aaba6cf3"]]);
//#endregion
export { workflow_report_default as default };

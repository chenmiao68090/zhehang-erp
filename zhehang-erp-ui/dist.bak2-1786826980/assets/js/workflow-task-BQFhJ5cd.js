import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Ct as arrow_left_default, Er as withKeys, F as ElEmpty, Ft as circle_check_filled_default, M as ElInputNumber, Ot as calendar_default, S as ElSkeleton, T as ElProgress, W as ElDatePicker, a as ElMessageBox, c as ElSegmented, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, vt as ElAlert, wt as arrow_right_default, yt as ElIcon, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source.production-DbokqIsz.js";
/* empty css                */
//#region src/views/task-workbench/components/WorkflowTaskPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "workflow-task-panel" };
var _hoisted_2$1 = { class: "panel-head" };
var _hoisted_3$1 = {
	key: 2,
	class: "task-list"
};
var _hoisted_4$1 = { class: "task-main" };
var _hoisted_5$1 = ["aria-label", "onClick"];
var _hoisted_6$1 = { class: "task-copy" };
var _hoisted_7$1 = { class: "task-title-row" };
var _hoisted_8$1 = {
	key: 2,
	class: "done-time"
};
var _hoisted_9$1 = {
	key: 0,
	class: "work-content"
};
var _hoisted_10$1 = {
	key: 1,
	class: "acceptance"
};
var _hoisted_11$1 = {
	key: 2,
	class: "undone-reason"
};
var _hoisted_12$1 = {
	key: 0,
	class: "metric-grid"
};
var _hoisted_13$1 = { class: "task-footer" };
//#endregion
//#region src/views/task-workbench/components/WorkflowTaskPanel.vue
var WorkflowTaskPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "WorkflowTaskPanel",
	props: {
		title: {},
		tasks: {},
		loading: { type: Boolean },
		emptyDescription: {}
	},
	emits: [
		"action",
		"save-detail",
		"save-remark"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const drafts = reactive({});
		const remarkDrafts = reactive({});
		function parseJson(value, fallback) {
			if (typeof value !== "string") return value || fallback;
			try {
				return JSON.parse(value);
			} catch (_unused) {
				return fallback;
			}
		}
		function metricFields(task) {
			return parseJson(task.detailFields, []);
		}
		function syncDrafts() {
			props.tasks.forEach((task) => {
				const key = String(task.id);
				drafts[key] = _objectSpread2({}, parseJson(task.workDetail, {}));
				metricFields(task).forEach((field) => {
					if (drafts[key][field.key] == null) drafts[key][field.key] = 0;
				});
				remarkDrafts[key] = task.remark || "";
			});
		}
		watch(() => props.tasks, syncDrafts, {
			immediate: true,
			deep: true
		});
		const doneCount = computed(() => props.tasks.filter((task) => task.isDone === 1).length);
		const completionRate = computed(() => props.tasks.length ? Math.round(doneCount.value / props.tasks.length * 100) : 0);
		const progressColor = computed(() => completionRate.value >= 80 ? "#16a34a" : completionRate.value >= 50 ? "#f59e0b" : "#2563eb");
		function toggle(task) {
			emit("action", task, task.isDone === 1 ? "undo" : "done", task.isDone === 1 ? void 0 : _objectSpread2({}, drafts[String(task.id)]));
		}
		function requestUndone(_x) {
			return _requestUndone.apply(this, arguments);
		}
		function _requestUndone() {
			_requestUndone = _asyncToGenerator(function* (task) {
				try {
					const { value } = yield ElMessageBox.prompt("请说明未完成原因，主管可在下属视图中查看。", "登记未完成", {
						inputType: "textarea",
						inputPlaceholder: "请输入具体原因",
						inputValidator: (text) => !!String(text || "").trim() || "未完成原因不能为空"
					});
					emit("action", task, "undone", { reason: String(value).trim() });
				} catch (_unused2) {}
			});
			return _requestUndone.apply(this, arguments);
		}
		return (_ctx, _cache) => {
			const _component_el_progress = ElProgress;
			const _component_el_empty = ElEmpty;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_input_number = ElInputNumber;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			return openBlock(), createElementBlock("section", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [createBaseVNode("div", null, [createBaseVNode("h3", null, toDisplayString(__props.title), 1), createBaseVNode("p", null, "共 " + toDisplayString(__props.tasks.length) + " 项，已完成 " + toDisplayString(doneCount.value) + " 项", 1)]), createVNode(_component_el_progress, {
				type: "dashboard",
				width: 72,
				"stroke-width": 7,
				percentage: completionRate.value,
				color: progressColor.value
			}, null, 8, ["percentage", "color"])]), !__props.loading && __props.tasks.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
				key: 0,
				description: __props.emptyDescription || "当前周期没有工作计划；请联系主管检查计划模板和适用角色",
				"image-size": 76
			}, null, 8, ["description"])) : __props.loading ? (openBlock(), createBlock(_component_el_skeleton, {
				key: 1,
				rows: 4,
				animated: ""
			})) : (openBlock(), createElementBlock("div", _hoisted_3$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.tasks, (task) => {
				return openBlock(), createElementBlock("article", {
					key: task.id,
					class: normalizeClass(["task-card", { done: task.isDone === 1 }])
				}, [
					createBaseVNode("div", _hoisted_4$1, [createBaseVNode("button", {
						class: "state-button",
						type: "button",
						"aria-label": task.isDone === 1 ? "撤回完成" : "标记完成",
						onClick: ($event) => toggle(task)
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [task.isDone === 1 ? (openBlock(), createBlock(unref(circle_check_filled_default), { key: 0 })) : (openBlock(), createBlock(unref(clock_default), { key: 1 }))]),
						_: 2
					}, 1024)], 8, _hoisted_5$1), createBaseVNode("div", _hoisted_6$1, [
						createBaseVNode("div", _hoisted_7$1, [
							createBaseVNode("strong", null, toDisplayString(task.taskName), 1),
							task.source === "template" ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[0] || (_cache[0] = [createTextVNode("模板任务", -1)])]),
								_: 1
							})) : createCommentVNode("", true),
							task.priority === "urgent" ? (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								size: "small",
								type: "danger"
							}, {
								default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("紧急", -1)])]),
								_: 1
							})) : createCommentVNode("", true),
							task.doneTime ? (openBlock(), createElementBlock("span", _hoisted_8$1, toDisplayString(task.doneTime), 1)) : createCommentVNode("", true)
						]),
						task.workContent ? (openBlock(), createElementBlock("p", _hoisted_9$1, toDisplayString(task.workContent), 1)) : createCommentVNode("", true),
						task.acceptanceStandard || task.taskDesc ? (openBlock(), createElementBlock("p", _hoisted_10$1, [_cache[2] || (_cache[2] = createBaseVNode("span", null, "完成标准", -1)), createTextVNode(toDisplayString(task.acceptanceStandard || task.taskDesc), 1)])) : createCommentVNode("", true),
						task.undoneReason ? (openBlock(), createElementBlock("p", _hoisted_11$1, "未完成原因：" + toDisplayString(task.undoneReason), 1)) : createCommentVNode("", true)
					])]),
					metricFields(task).length ? (openBlock(), createElementBlock("div", _hoisted_12$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(metricFields(task), (field) => {
						return openBlock(), createElementBlock("label", { key: field.key }, [
							createBaseVNode("span", null, toDisplayString(field.label), 1),
							createVNode(_component_el_input_number, {
								modelValue: drafts[task.id][field.key],
								"onUpdate:modelValue": ($event) => drafts[task.id][field.key] = $event,
								min: 0,
								precision: field.precision || 0,
								"controls-position": "right"
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"precision"
							]),
							createBaseVNode("em", null, toDisplayString(field.unit), 1)
						]);
					}), 128)), createVNode(_component_el_button, {
						type: "primary",
						plain: "",
						onClick: ($event) => _ctx.$emit("save-detail", task, _objectSpread2({}, drafts[task.id]))
					}, {
						default: withCtx(() => [..._cache[3] || (_cache[3] = [createTextVNode("保存量化结果", -1)])]),
						_: 1
					}, 8, ["onClick"])])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_13$1, [
						createVNode(_component_el_input, {
							modelValue: remarkDrafts[task.id],
							"onUpdate:modelValue": ($event) => remarkDrafts[task.id] = $event,
							maxlength: "500",
							"show-word-limit": "",
							placeholder: "补充工作备注",
							onKeyup: withKeys(($event) => _ctx.$emit("save-remark", task, remarkDrafts[task.id]), ["enter"])
						}, null, 8, [
							"modelValue",
							"onUpdate:modelValue",
							"onKeyup"
						]),
						createVNode(_component_el_button, { onClick: ($event) => _ctx.$emit("save-remark", task, remarkDrafts[task.id]) }, {
							default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("保存备注", -1)])]),
							_: 1
						}, 8, ["onClick"]),
						task.isDone === 1 ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "warning",
							plain: "",
							onClick: ($event) => requestUndone(task)
						}, {
							default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("登记未完成", -1)])]),
							_: 1
						}, 8, ["onClick"])) : createCommentVNode("", true)
					])
				], 2);
			}), 128))]))]);
		};
	}
}), [["__scopeId", "data-v-de14588b"]]);
//#endregion
//#region src/views/task-workbench/workflow-task.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench task-workbench-page workflow-task-page" };
var _hoisted_2 = { class: "page-head page-heading" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { class: "eyebrow" };
var _hoisted_5 = { class: "toolbar-card" };
var _hoisted_6 = { class: "period-nav" };
var _hoisted_7 = {
	key: 2,
	class: "calendar-card"
};
var _hoisted_8 = { class: "calendar-head" };
var _hoisted_9 = { class: "week-labels" };
var _hoisted_10 = { class: "calendar-grid" };
var _hoisted_11 = ["disabled", "onClick"];
var _hoisted_12 = { key: 0 };
var _hoisted_13 = { key: 1 };
var _hoisted_14 = { class: "summary-card" };
//#endregion
//#region src/views/task-workbench/workflow-task.vue
var workflow_task_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "workflow-task",
	setup(__props) {
		const isLocalDemo = computed(() => feigeTaskLocalDemo());
		const cycleType = ref("daily");
		const cycleOptions = [
			{
				label: "每日任务",
				value: "daily"
			},
			{
				label: "每周任务",
				value: "weekly"
			},
			{
				label: "每月任务",
				value: "monthly"
			}
		];
		const today = /* @__PURE__ */ new Date();
		const selectedDate = ref(formatDate(today));
		const selectedWeekDate = ref(today);
		const selectedWeek = ref(formatWeek(today));
		const selectedMonth = ref(formatMonth(today));
		const calendarYear = ref(today.getFullYear());
		const calendarMonth = ref(today.getMonth() + 1);
		const monthStats = ref({});
		const tasks = ref([]);
		const summary = ref("");
		const isExempt = ref(false);
		const loading = ref(false);
		const savingSummary = ref(false);
		const loadError = ref("");
		const weekLabels = [
			"一",
			"二",
			"三",
			"四",
			"五",
			"六",
			"日"
		];
		function unwrap(response) {
			var _ref, _response$data$data, _response$data;
			return (_ref = (_response$data$data = response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.data) !== null && _response$data$data !== void 0 ? _response$data$data : response === null || response === void 0 ? void 0 : response.data) !== null && _ref !== void 0 ? _ref : response;
		}
		function pad(value) {
			return String(value).padStart(2, "0");
		}
		function formatDate(date) {
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
		}
		function formatMonth(date) {
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
		}
		function formatWeek(date) {
			const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
			const day = d.getUTCDay() || 7;
			d.setUTCDate(d.getUTCDate() + 4 - day);
			const start = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
			const week = Math.ceil(((d.getTime() - start.getTime()) / 864e5 + 1) / 7);
			return `${d.getUTCFullYear()}-W${pad(week)}`;
		}
		const periodKey = computed(() => cycleType.value === "daily" ? selectedDate.value : cycleType.value === "weekly" ? selectedWeek.value : selectedMonth.value);
		const cycleLabel = computed(() => cycleType.value === "daily" ? "每日" : cycleType.value === "weekly" ? "每周" : "每月");
		const panelTitle = computed(() => `${periodKey.value} · ${cycleLabel.value}任务`);
		const calendarCells = computed(() => {
			const first = new Date(calendarYear.value, calendarMonth.value - 1, 1);
			const days = new Date(calendarYear.value, calendarMonth.value, 0).getDate();
			const offset = (first.getDay() || 7) - 1;
			const cells = [];
			for (let i = 0; i < offset; i++) cells.push({
				key: `pre-${i}`,
				day: "",
				date: "",
				inMonth: false,
				total: 0,
				done: 0,
				rate: 0
			});
			for (let day = 1; day <= days; day++) {
				const date = `${calendarYear.value}-${pad(calendarMonth.value)}-${pad(day)}`;
				const stat = monthStats.value[date] || {
					total: 0,
					done: 0,
					rate: 0
				};
				cells.push(_objectSpread2({
					key: date,
					day,
					date,
					inMonth: true
				}, stat));
			}
			while (cells.length % 7) cells.push({
				key: `next-${cells.length}`,
				day: "",
				date: "",
				inMonth: false,
				total: 0,
				done: 0,
				rate: 0
			});
			return cells;
		});
		function heatClass(rate) {
			if (!rate) return "heat-0";
			if (rate < 50) return "heat-1";
			if (rate < 80) return "heat-2";
			if (rate < 100) return "heat-3";
			return "heat-4";
		}
		function toPanelTask(row) {
			return {
				id: row.id,
				taskName: row.taskName,
				taskDesc: row.completionStandard,
				workContent: row.workContent,
				acceptanceStandard: row.completionStandard,
				isDone: row.status === "done" ? 1 : 0,
				doneTime: row.completedTime,
				undoneReason: row.undoneReason,
				remark: row.remark,
				source: "template",
				detailFields: (row.metrics || []).map((metric) => ({
					key: metric.code,
					label: metric.label,
					unit: metric.unit,
					target: metric.target
				})),
				workDetail: Object.fromEntries((row.metrics || []).map((metric) => [metric.code, Number(metric.value || 0)]))
			};
		}
		function loadMonthStats() {
			return _loadMonthStats.apply(this, arguments);
		}
		function _loadMonthStats() {
			_loadMonthStats = _asyncToGenerator(function* () {
				try {
					const result = unwrap(yield feigeTaskData.workflowMonthStats({ month: `${calendarYear.value}-${pad(calendarMonth.value)}` })) || [];
					monthStats.value = Object.fromEntries(result.map((day) => [day.date, {
						total: day.total,
						done: day.done,
						rate: day.rate
					}]));
				} catch (_unused) {
					monthStats.value = {};
					loadError.value = "工作计划热力图加载失败，请稍后重试。生产环境不会用演示数据替代。";
				}
			});
			return _loadMonthStats.apply(this, arguments);
		}
		function loadTasks() {
			return _loadTasks.apply(this, arguments);
		}
		function _loadTasks() {
			_loadTasks = _asyncToGenerator(function* () {
				loadError.value = "";
				loading.value = true;
				try {
					const result = unwrap(yield feigeTaskData.workflowTasks({
						cycleType: cycleType.value === "daily" ? "day" : cycleType.value === "weekly" ? "week" : "month",
						periodKey: periodKey.value,
						pageNum: 1,
						pageSize: 100
					}));
					tasks.value = ((result === null || result === void 0 ? void 0 : result.records) || []).map(toPanelTask);
					summary.value = (result === null || result === void 0 ? void 0 : result.summary) || "";
					isExempt.value = !!(result === null || result === void 0 ? void 0 : result.isExempt);
				} catch (_unused2) {
					tasks.value = [];
					summary.value = "";
					loadError.value = "工作计划加载失败，请稍后重试。生产环境不会用本地样例填充。";
				} finally {
					loading.value = false;
				}
			});
			return _loadTasks.apply(this, arguments);
		}
		function runAction(_x, _x2) {
			return _runAction.apply(this, arguments);
		}
		function _runAction() {
			_runAction = _asyncToGenerator(function* (task, action, data = {}) {
				try {
					const apiAction = action === "save-detail" ? "detail" : action;
					const payload = action === "save-detail" || action === "done" && Array.isArray(task.detailFields) && task.detailFields.length > 0 ? { metrics: (Array.isArray(task.detailFields) ? task.detailFields : []).map((field) => {
						var _data$field$key;
						return {
							code: field.key,
							label: field.label,
							unit: field.unit,
							target: field.target,
							value: Number((_data$field$key = data[field.key]) !== null && _data$field$key !== void 0 ? _data$field$key : 0)
						};
					}) } : data;
					yield feigeTaskData.workflowAction(Number(task.id), apiAction, payload);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：仅更新当前预览" : "操作成功");
					yield Promise.all([loadTasks(), loadMonthStats()]);
				} catch (_unused3) {
					ElMessage.error("操作失败，请检查权限或任务状态");
				}
			});
			return _runAction.apply(this, arguments);
		}
		function handleAction(task, action, data) {
			return runAction(task, action, data);
		}
		function saveDetail(task, values) {
			return runAction(task, "save-detail", values);
		}
		function saveRemark(task, remark) {
			return runAction(task, "remark", { remark });
		}
		function saveSummary() {
			return _saveSummary.apply(this, arguments);
		}
		function _saveSummary() {
			_saveSummary = _asyncToGenerator(function* () {
				if (!summary.value.trim()) return ElMessage.warning("请先填写工作总结");
				savingSummary.value = true;
				try {
					yield feigeTaskData.workflowSummary({
						cycleType: cycleType.value === "daily" ? "day" : cycleType.value === "weekly" ? "week" : "month",
						periodKey: periodKey.value,
						summary: summary.value.trim()
					});
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：总结仅保存在当前预览" : "工作总结已保存");
				} catch (_unused4) {
					ElMessage.error("工作总结保存失败");
				} finally {
					savingSummary.value = false;
				}
			});
			return _saveSummary.apply(this, arguments);
		}
		function selectCalendarDate(date) {
			selectedDate.value = date;
			loadTasks();
		}
		function handleDailyChange(value) {
			const date = /* @__PURE__ */ new Date(`${value}T00:00:00`);
			calendarYear.value = date.getFullYear();
			calendarMonth.value = date.getMonth() + 1;
			loadMonthStats();
			loadTasks();
		}
		function handleWeekChange(value) {
			selectedWeek.value = formatWeek(new Date(value));
			loadTasks();
		}
		function handleCycleChange() {
			loadTasks();
			if (cycleType.value === "daily") loadMonthStats();
		}
		function movePeriod(direction) {
			if (cycleType.value === "daily") {
				const date = /* @__PURE__ */ new Date(`${selectedDate.value}T00:00:00`);
				date.setDate(date.getDate() + direction);
				selectedDate.value = formatDate(date);
				calendarYear.value = date.getFullYear();
				calendarMonth.value = date.getMonth() + 1;
				loadMonthStats();
			} else if (cycleType.value === "weekly") {
				const date = new Date(selectedWeekDate.value);
				date.setDate(date.getDate() + direction * 7);
				selectedWeekDate.value = date;
				selectedWeek.value = formatWeek(date);
			} else {
				const [year, month] = selectedMonth.value.split("-").map(Number);
				selectedMonth.value = formatMonth(new Date(year, month - 1 + direction, 1));
			}
			loadTasks();
		}
		function goCurrent() {
			selectedDate.value = formatDate(today);
			selectedWeekDate.value = today;
			selectedWeek.value = formatWeek(today);
			selectedMonth.value = formatMonth(today);
			calendarYear.value = today.getFullYear();
			calendarMonth.value = today.getMonth() + 1;
			loadMonthStats();
			loadTasks();
		}
		onMounted(() => {
			loadMonthStats();
			loadTasks();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_alert = ElAlert;
			const _component_el_segmented = ElSegmented;
			const _component_el_button = ElButton;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input = ElInput;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(calendar_default))]),
						_: 1
					}), _cache[7] || (_cache[7] = createTextVNode(" 任务工单 · 工作计划", -1))]),
					_cache[8] || (_cache[8] = createBaseVNode("h2", null, "工作计划任务", -1)),
					_cache[9] || (_cache[9] = createBaseVNode("p", null, "按日、周、月执行固定工作，完成标准、量化结果和未完成原因全程留痕。", -1))
				]), isLocalDemo.value ? (openBlock(), createBlock(_component_el_tag, {
					key: 0,
					type: "warning",
					size: "large",
					effect: "dark"
				}, {
					default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("LOCAL-DEMO 演示数据", -1)])]),
					_: 1
				})) : createCommentVNode("", true)]),
				isLocalDemo.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: "当前仅展示明确标记的本地演示任务，不会写入生产数据。",
					type: "warning",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				loadError.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 1,
					title: loadError.value,
					type: "error",
					"show-icon": "",
					closable: false
				}, null, 8, ["title"])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_5, [createVNode(_component_el_segmented, {
					modelValue: cycleType.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => cycleType.value = $event),
					options: cycleOptions,
					onChange: handleCycleChange
				}, null, 8, ["modelValue"]), createBaseVNode("div", _hoisted_6, [
					createVNode(_component_el_button, {
						icon: unref(arrow_left_default),
						circle: "",
						onClick: _cache[1] || (_cache[1] = ($event) => movePeriod(-1))
					}, null, 8, ["icon"]),
					cycleType.value === "daily" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 0,
						modelValue: selectedDate.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => selectedDate.value = $event),
						type: "date",
						"value-format": "YYYY-MM-DD",
						clearable: false,
						onChange: handleDailyChange
					}, null, 8, ["modelValue"])) : cycleType.value === "weekly" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 1,
						modelValue: selectedWeekDate.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => selectedWeekDate.value = $event),
						type: "week",
						format: "YYYY 第 ww 周",
						clearable: false,
						onChange: handleWeekChange
					}, null, 8, ["modelValue"])) : (openBlock(), createBlock(_component_el_date_picker, {
						key: 2,
						modelValue: selectedMonth.value,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => selectedMonth.value = $event),
						type: "month",
						"value-format": "YYYY-MM",
						clearable: false,
						onChange: loadTasks
					}, null, 8, ["modelValue"])),
					createVNode(_component_el_button, {
						icon: unref(arrow_right_default),
						circle: "",
						onClick: _cache[5] || (_cache[5] = ($event) => movePeriod(1))
					}, null, 8, ["icon"]),
					createVNode(_component_el_button, { onClick: goCurrent }, {
						default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("回到当前", -1)])]),
						_: 1
					})
				])]),
				cycleType.value === "daily" ? (openBlock(), createElementBlock("section", _hoisted_7, [
					createBaseVNode("div", _hoisted_8, [createBaseVNode("strong", null, toDisplayString(calendarYear.value) + " 年 " + toDisplayString(calendarMonth.value) + " 月完成热力图", 1), _cache[12] || (_cache[12] = createBaseVNode("span", null, "颜色越深代表完成率越高，灰色代表尚无任务。", -1))]),
					createBaseVNode("div", _hoisted_9, [(openBlock(), createElementBlock(Fragment, null, renderList(weekLabels, (day) => {
						return createBaseVNode("span", { key: day }, toDisplayString(day), 1);
					}), 64))]),
					createBaseVNode("div", _hoisted_10, [(openBlock(true), createElementBlock(Fragment, null, renderList(calendarCells.value, (cell) => {
						return openBlock(), createElementBlock("button", {
							key: cell.key,
							type: "button",
							class: normalizeClass(["calendar-cell", [{
								muted: !cell.inMonth,
								selected: cell.date === selectedDate.value
							}, heatClass(cell.rate)]]),
							disabled: !cell.inMonth,
							onClick: ($event) => selectCalendarDate(cell.date)
						}, [
							createBaseVNode("span", null, toDisplayString(cell.day), 1),
							cell.total ? (openBlock(), createElementBlock("strong", _hoisted_12, toDisplayString(cell.rate) + "%", 1)) : createCommentVNode("", true),
							cell.total ? (openBlock(), createElementBlock("small", _hoisted_13, toDisplayString(cell.done) + "/" + toDisplayString(cell.total), 1)) : createCommentVNode("", true)
						], 10, _hoisted_11);
					}), 128))])
				])) : createCommentVNode("", true),
				isExempt.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 3,
					title: "当前账号不在本周期必报范围内",
					description: "仍可查看任务；如需提交报告，请联系部门主管调整必报范围。",
					type: "success",
					"show-icon": "",
					closable: false
				})) : createCommentVNode("", true),
				createVNode(WorkflowTaskPanel_default, {
					title: panelTitle.value,
					tasks: tasks.value,
					loading: loading.value,
					onAction: handleAction,
					onSaveDetail: saveDetail,
					onSaveRemark: saveRemark
				}, null, 8, [
					"title",
					"tasks",
					"loading"
				]),
				createBaseVNode("section", _hoisted_14, [
					createBaseVNode("div", null, [createBaseVNode("h3", null, toDisplayString(cycleLabel.value) + "工作总结", 1), _cache[13] || (_cache[13] = createBaseVNode("p", null, "写清本周期产出、未完成原因和需要协助的事项。", -1))]),
					createVNode(_component_el_input, {
						modelValue: summary.value,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => summary.value = $event),
						type: "textarea",
						rows: 4,
						maxlength: "2000",
						"show-word-limit": "",
						placeholder: "请输入工作总结"
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						loading: savingSummary.value,
						onClick: saveSummary
					}, {
						default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("保存总结", -1)])]),
						_: 1
					}, 8, ["loading"])
				])
			]);
		};
	}
}), [["__scopeId", "data-v-e76908c4"]]);
//#endregion
export { workflow_task_default as default };

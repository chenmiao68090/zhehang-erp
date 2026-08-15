const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/js/attendance-Bo4dxgu1.js","assets/js/vendor-Cuzsyfny.js","assets/js/_plugin-vue_export-helper-a0essBwH.js","assets/js/index-C4y3JnUs.js","assets/js/preload-helper-CWSTg_Zh.js","assets/js/vendor-element-plus-CqO9XRGg.js","assets/js/rolldown-runtime-Ce7cXt08.js","assets/js/vendor-dayjs-QmXXJDJb.js","assets/css/vendor-element-plus-lWwr2qJs.css","assets/js/vendor-i18n-CjJLjKpl.js","assets/js/vendor-vue-iXxhUOfN.js","assets/js/request-CZ5tKmxn.js","assets/js/vendor-axios-CsdGTjXP.js","assets/js/catalog-BHsgVXPT.js","assets/css/index-n62iQK1O.css","assets/js/hrm-x4tssCAy.js","assets/js/org-DaVetSL-.js","assets/js/workflow-CeqrP-pL.js","assets/css/attendance-CmOGXZMC.css"])))=>i.map(i=>d[i]);
import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, ot as defineAsyncComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, Cn as moon_night_default, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, Ot as calendar_default, Pn as position_default, Q as ElRadioGroup, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tr as suitcase_default, tt as ElCard, v as ElSwitch, vt as ElAlert, xt as alarm_clock_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { t as __vitePreload } from "./preload-helper-CWSTg_Zh.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { a as leaveBalanceApi, n as attendanceSummaryApi, o as leaveTypeApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/leave-management.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "leave-mgmt" };
var _hoisted_2 = { class: "lm-header" };
var _hoisted_3 = { class: "lm-header-quick" };
var _hoisted_4 = { class: "lm-quick-label" };
var _hoisted_5 = { class: "lm-card-head" };
var _hoisted_6 = { class: "lm-noset" };
var _hoisted_7 = { class: "lm-card-head" };
var _hoisted_8 = {
	key: 1,
	class: "lm-noset"
};
var _hoisted_9 = { class: "quota-add" };
var _hoisted_10 = { class: "lm-card-head" };
var _hoisted_11 = { style: {
	"display": "flex",
	"gap": "10px",
	"align-items": "center"
} };
var _hoisted_12 = {
	key: 3,
	class: "lm-noset"
};
var _hoisted_13 = { class: "lm-apply-grid" };
var _hoisted_14 = { class: "lm-apply-name" };
var _hoisted_15 = { class: "lm-apply-desc" };
//#endregion
//#region src/views/hrm/leave-management.vue
var leave_management_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "leave-management",
	setup(__props) {
		const AttendanceStats = defineAsyncComponent(() => __vitePreload(() => import("./attendance-Bo4dxgu1.js"), __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18])));
		const router = useRouter();
		const activeTab = ref("stats");
		const quickEntries = [
			{
				key: "leave",
				label: "请假",
				icon: calendar_default,
				color: "#3370ff",
				desc: "年假/事假/病假等,带薪假自动核额度"
			},
			{
				key: "overtime",
				label: "加班",
				icon: moon_night_default,
				color: "#7c5cff",
				desc: "加班申请,审批后计入"
			},
			{
				key: "makeup",
				label: "补卡",
				icon: alarm_clock_default,
				color: "#00b3a4",
				desc: "漏打卡补卡申请"
			},
			{
				key: "travel",
				label: "出差",
				icon: suitcase_default,
				color: "#ff8800",
				desc: "出差申请与天数登记"
			},
			{
				key: "outing",
				label: "外出",
				icon: position_default,
				color: "#36b37e",
				desc: "工作时间外出申请"
			}
		];
		function goApply() {
			router.push("/approval");
		}
		const paidLeaveTypes = [
			"年假",
			"调休",
			"育儿假",
			"事假",
			"病假",
			"婚假",
			"产假",
			"陪产假",
			"丧假"
		];
		const leaveTypes = ref([]);
		const typeLoading = ref(false);
		const typeDialog = ref(false);
		const typeSaving = ref(false);
		const typeForm = ref({});
		function loadTypes() {
			return _loadTypes.apply(this, arguments);
		}
		function _loadTypes() {
			_loadTypes = _asyncToGenerator(function* () {
				typeLoading.value = true;
				try {
					var _res$data;
					const res = yield leaveTypeApi.list();
					leaveTypes.value = ((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || [];
				} catch (_unused) {
					leaveTypes.value = [];
				} finally {
					typeLoading.value = false;
				}
			});
			return _loadTypes.apply(this, arguments);
		}
		function openType(row) {
			typeForm.value = row ? _objectSpread2({}, row) : {
				typeName: "",
				displayOrder: leaveTypes.value.length + 1,
				durationUnit: 2,
				balanceRule: 2,
				status: 1
			};
			typeDialog.value = true;
		}
		function saveType() {
			return _saveType.apply(this, arguments);
		}
		function _saveType() {
			_saveType = _asyncToGenerator(function* () {
				if (!typeForm.value.typeName) {
					ElMessage.warning("请填写假期类型名");
					return;
				}
				typeSaving.value = true;
				try {
					yield leaveTypeApi.save(typeForm.value);
					ElMessage.success("已保存");
					typeDialog.value = false;
					loadTypes();
				} catch (_unused2) {
					ElMessage.error("保存失败");
				} finally {
					typeSaving.value = false;
				}
			});
			return _saveType.apply(this, arguments);
		}
		function toggleType(_x) {
			return _toggleType.apply(this, arguments);
		}
		function _toggleType() {
			_toggleType = _asyncToGenerator(function* (row) {
				try {
					yield leaveTypeApi.toggle(row.id);
					loadTypes();
				} catch (_unused3) {
					ElMessage.error("操作失败");
					loadTypes();
				}
			});
			return _toggleType.apply(this, arguments);
		}
		function removeType(_x2) {
			return _removeType.apply(this, arguments);
		}
		function _removeType() {
			_removeType = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确定删除假期类型「${row.typeName}」?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield leaveTypeApi.remove(row.id);
					ElMessage.success("已删除");
					loadTypes();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return _removeType.apply(this, arguments);
		}
		function currentMonthStr() {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
		}
		const summaryMonth = ref(currentMonthStr());
		const summaryList = ref([]);
		const summaryLoading = ref(false);
		const summaryGenerating = ref(false);
		const summaryDialog = ref(false);
		const summarySaving = ref(false);
		const summaryForm = ref({});
		function loadSummary() {
			return _loadSummary.apply(this, arguments);
		}
		function _loadSummary() {
			_loadSummary = _asyncToGenerator(function* () {
				summaryLoading.value = true;
				try {
					var _res$data2;
					const res = yield attendanceSummaryApi.list(summaryMonth.value);
					summaryList.value = ((_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) || [];
				} catch (_unused6) {
					summaryList.value = [];
				} finally {
					summaryLoading.value = false;
				}
			});
			return _loadSummary.apply(this, arguments);
		}
		function generateSummary() {
			return _generateSummary.apply(this, arguments);
		}
		function _generateSummary() {
			_generateSummary = _asyncToGenerator(function* () {
				if (!summaryMonth.value) {
					ElMessage.warning("请先选择月份");
					return;
				}
				summaryGenerating.value = true;
				try {
					var _res$data3;
					const res = yield attendanceSummaryApi.generate(summaryMonth.value);
					const n = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					ElMessage.success(`已生成/更新 ${n} 条汇总`);
					loadSummary();
				} catch (_unused7) {
					ElMessage.error("生成失败");
				} finally {
					summaryGenerating.value = false;
				}
			});
			return _generateSummary.apply(this, arguments);
		}
		function openSummaryEdit(row) {
			summaryForm.value = _objectSpread2({}, row);
			summaryDialog.value = true;
		}
		function saveSummary() {
			return _saveSummary.apply(this, arguments);
		}
		function _saveSummary() {
			_saveSummary = _asyncToGenerator(function* () {
				summarySaving.value = true;
				try {
					yield attendanceSummaryApi.edit(summaryForm.value);
					ElMessage.success("已保存");
					summaryDialog.value = false;
					loadSummary();
				} catch (_unused8) {
					ElMessage.error("保存失败");
				} finally {
					summarySaving.value = false;
				}
			});
			return _saveSummary.apply(this, arguments);
		}
		const userStore = useUserStore();
		const isHr = computed(() => {
			const r = userStore.roles || [];
			return r.includes("admin") || r.includes("hr") || r.includes("super_admin") || r.includes("boss");
		});
		const summaryConfirming = ref(false);
		function hrConfirmRow(_x3) {
			return _hrConfirmRow.apply(this, arguments);
		}
		function _hrConfirmRow() {
			_hrConfirmRow = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认「${row.employeeName}」${row.month} 的考勤无误,并发送给本人二次确认?`, "发送确认", { type: "warning" });
				} catch (_unused9) {
					return;
				}
				try {
					yield attendanceSummaryApi.hrConfirm(row.id);
					ElMessage.success("已发送,等待员工确认");
					loadSummary();
				} catch (_unused10) {
					ElMessage.error("操作失败");
				}
			});
			return _hrConfirmRow.apply(this, arguments);
		}
		function confirmAllRows() {
			return _confirmAllRows.apply(this, arguments);
		}
		function _confirmAllRows() {
			_confirmAllRows = _asyncToGenerator(function* () {
				if (!summaryMonth.value) {
					ElMessage.warning("请先选择月份");
					return;
				}
				try {
					yield ElMessageBox.confirm(`确认 ${summaryMonth.value} 全部「待HR确认」的汇总并发送给员工?`, "一键发送确认", { type: "warning" });
				} catch (_unused11) {
					return;
				}
				summaryConfirming.value = true;
				try {
					var _res$data4;
					const res = yield attendanceSummaryApi.confirmAll(summaryMonth.value);
					const n = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res;
					ElMessage.success(`已发送 ${n} 人`);
					loadSummary();
				} catch (_unused12) {
					ElMessage.error("操作失败");
				} finally {
					summaryConfirming.value = false;
				}
			});
			return _confirmAllRows.apply(this, arguments);
		}
		function employeeConfirmRow(_x4) {
			return _employeeConfirmRow.apply(this, arguments);
		}
		function _employeeConfirmRow() {
			_employeeConfirmRow = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认你 ${row.month} 的考勤无误?`, "确认考勤", { type: "info" });
				} catch (_unused13) {
					return;
				}
				try {
					yield attendanceSummaryApi.employeeConfirm(row.id);
					ElMessage.success("已确认");
					loadSummary();
				} catch (_unused14) {
					ElMessage.error("操作失败");
				}
			});
			return _employeeConfirmRow.apply(this, arguments);
		}
		function employeeDisputeRow(_x5) {
			return _employeeDisputeRow.apply(this, arguments);
		}
		function _employeeDisputeRow() {
			_employeeDisputeRow = _asyncToGenerator(function* (row) {
				try {
					const { value } = yield ElMessageBox.prompt(`对 ${row.month} 的考勤有异议?请说明:`, "提出异议", {
						inputType: "textarea",
						inputValidator: (v) => v && v.trim() ? true : "请填写异议说明"
					});
					yield attendanceSummaryApi.employeeDispute(row.id, (value || "").trim());
					ElMessage.success("已提交异议,HR 会复核");
					loadSummary();
				} catch (_unused15) {}
			});
			return _employeeDisputeRow.apply(this, arguments);
		}
		const confirmLabel = (s) => [
			"待HR确认",
			"HR已确认待员工",
			"员工已确认",
			"员工有异议"
		][s] || "待HR确认";
		const confirmTagType = (s) => [
			"info",
			"warning",
			"success",
			"danger"
		][s] || "info";
		const employees = ref([]);
		const allBalances = ref([]);
		const balanceLoading = ref(false);
		function loadBalanceData() {
			return _loadBalanceData.apply(this, arguments);
		}
		function _loadBalanceData() {
			_loadBalanceData = _asyncToGenerator(function* () {
				balanceLoading.value = true;
				try {
					var _empRes$data, _balRes$data;
					const [empRes, balRes] = yield Promise.all([employeeApi.roster(), leaveBalanceApi.listAll()]);
					const empData = (_empRes$data = empRes === null || empRes === void 0 ? void 0 : empRes.data) !== null && _empRes$data !== void 0 ? _empRes$data : empRes;
					const roster = Array.isArray(empData) ? empData : (empData === null || empData === void 0 ? void 0 : empData.records) || (empData === null || empData === void 0 ? void 0 : empData.list) || [];
					allBalances.value = ((_balRes$data = balRes === null || balRes === void 0 ? void 0 : balRes.data) !== null && _balRes$data !== void 0 ? _balRes$data : balRes) || [];
					const rosterIds = new Set(roster.map((e) => e.id));
					const merged = [...roster];
					for (const b of allBalances.value) if (b.employeeId != null && !rosterIds.has(b.employeeId)) {
						rosterIds.add(b.employeeId);
						merged.push({
							id: b.employeeId,
							name: b.employeeName || `员工#${b.employeeId}`,
							deptName: "",
							postName: ""
						});
					}
					employees.value = merged;
				} catch (_unused16) {} finally {
					balanceLoading.value = false;
				}
			});
			return _loadBalanceData.apply(this, arguments);
		}
		loadBalanceData();
		loadTypes();
		loadSummary();
		function empBalances(empId) {
			return allBalances.value.filter((b) => b.employeeId === empId);
		}
		const quotaDialog = ref(false);
		const quotaEmp = ref(null);
		const quotaSaving = ref(false);
		const quotaForm = ref({
			leaveType: "年假",
			totalDays: 5
		});
		const quotaList = ref([]);
		function openQuota(emp) {
			quotaEmp.value = emp;
			quotaForm.value = {
				leaveType: "年假",
				totalDays: 5
			};
			quotaList.value = empBalances(emp.id);
			quotaDialog.value = true;
		}
		function saveQuota() {
			return _saveQuota.apply(this, arguments);
		}
		function _saveQuota() {
			_saveQuota = _asyncToGenerator(function* () {
				if (!quotaForm.value.leaveType) {
					ElMessage.warning("请选择假期类型");
					return;
				}
				quotaSaving.value = true;
				try {
					yield leaveBalanceApi.save({
						employeeId: quotaEmp.value.id,
						leaveType: quotaForm.value.leaveType,
						totalDays: quotaForm.value.totalDays
					});
					ElMessage.success("已保存");
					yield loadBalanceData();
					quotaList.value = empBalances(quotaEmp.value.id);
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "保存失败");
				} finally {
					quotaSaving.value = false;
				}
			});
			return _saveQuota.apply(this, arguments);
		}
		function removeQuota(_x7) {
			return _removeQuota.apply(this, arguments);
		}
		function _removeQuota() {
			_removeQuota = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确定删除「${row.leaveType}」的额度吗?`, "提示", { type: "warning" }).catch(() => "cancel").then(function() {
					var _ref = _asyncToGenerator(function* (r) {
						if (r === "cancel") return;
						yield leaveBalanceApi.remove(row.id);
						ElMessage.success("已删除");
						yield loadBalanceData();
						quotaList.value = empBalances(quotaEmp.value.id);
					});
					return function(_x6) {
						return _ref.apply(this, arguments);
					};
				}());
			});
			return _removeQuota.apply(this, arguments);
		}
		function num(v) {
			return Number(v !== null && v !== void 0 ? v : 0) || 0;
		}
		function fmt(v) {
			const n = num(v);
			return n === Math.floor(n) ? String(n) : n.toFixed(1);
		}
		function remainOf(b) {
			return Math.max(0, num(b.totalDays) - num(b.usedDays));
		}
		function remainColorVal(r, total) {
			if (num(total) <= 0) return "#c0c4cc";
			if (r <= 0) return "#f56c6c";
			if (r <= 1) return "#e6a23c";
			return "#3370ff";
		}
		function remainTagType(b) {
			const r = remainOf(b);
			if (r <= 0) return "danger";
			if (r <= 1) return "warning";
			return "primary";
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_switch = ElSwitch;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_card = ElCard;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_alert = ElAlert;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_tabs = ElTabs;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("header", _hoisted_2, [_cache[25] || (_cache[25] = createBaseVNode("div", { class: "lm-header-main" }, [createBaseVNode("h1", { class: "lm-title" }, "假勤管理"), createBaseVNode("p", { class: "lm-desc" }, "考勤统计、假期额度与假勤申请,统一在此管理")], -1)), createBaseVNode("div", _hoisted_3, [(openBlock(), createElementBlock(Fragment, null, renderList(quickEntries, (q) => {
				return createBaseVNode("div", {
					class: "lm-quick",
					key: q.key,
					onClick: goApply
				}, [createBaseVNode("span", {
					class: "lm-quick-ico",
					style: normalizeStyle({ background: q.color })
				}, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(q.icon)))]),
					_: 2
				}, 1024)], 4), createBaseVNode("span", _hoisted_4, toDisplayString(q.label), 1)]);
			}), 64))])]), createVNode(_component_el_tabs, {
				modelValue: activeTab.value,
				"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => activeTab.value = $event),
				class: "lm-tabs"
			}, {
				default: withCtx(() => [
					createVNode(_component_el_tab_pane, {
						name: "stats",
						label: "假勤统计",
						lazy: ""
					}, {
						default: withCtx(() => [createVNode(unref(AttendanceStats))]),
						_: 1
					}),
					createVNode(_component_el_tab_pane, {
						name: "type",
						label: "假期类型",
						lazy: ""
					}, {
						default: withCtx(() => [createVNode(_component_el_card, {
							shadow: "never",
							class: "lm-card"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_5, [_cache[27] || (_cache[27] = createBaseVNode("div", null, [createBaseVNode("span", { class: "lm-card-title" }, "假期类型"), createBaseVNode("span", { class: "lm-card-sub" }, "配置公司的假期类型;请假与额度按这里启用的类型来")], -1)), createVNode(_component_el_button, {
								type: "primary",
								icon: unref(plus_default),
								onClick: _cache[0] || (_cache[0] = ($event) => openType())
							}, {
								default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("新建假期类型", -1)])]),
								_: 1
							}, 8, ["icon"])]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: leaveTypes.value,
								border: "",
								stripe: ""
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "还没有假期类型,点右上角新建",
									"image-size": 80
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "展示顺序",
										prop: "displayOrder",
										width: "100",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										label: "假期类型",
										prop: "typeName",
										"min-width": "130"
									}),
									createVNode(_component_el_table_column, {
										label: "时长单位",
										width: "100",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.durationUnit === 1 ? "半天" : "天"), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "余额规则",
										width: "100",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, {
											size: "small",
											type: row.balanceRule === 1 ? "warning" : "info",
											effect: "plain"
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(row.balanceRule === 1 ? "限额" : "不限额"), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "状态",
										width: "100",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_switch, {
											"model-value": row.status === 1,
											onChange: ($event) => toggleType(row)
										}, null, 8, ["model-value", "onChange"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "130",
										align: "center",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											onClick: ($event) => openType(row)
										}, {
											default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("编辑", -1)])]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											type: "danger",
											onClick: ($event) => removeType(row)
										}, {
											default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("删除", -1)])]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, typeLoading.value]])]),
							_: 1
						}), createVNode(_component_el_dialog, {
							modelValue: typeDialog.value,
							"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => typeDialog.value = $event),
							title: typeForm.value.id ? "编辑假期类型" : "新建假期类型",
							width: "480px"
						}, {
							footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[6] || (_cache[6] = ($event) => typeDialog.value = false) }, {
								default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("取消", -1)])]),
								_: 1
							}), createVNode(_component_el_button, {
								type: "primary",
								loading: typeSaving.value,
								onClick: saveType
							}, {
								default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("保存", -1)])]),
								_: 1
							}, 8, ["loading"])]),
							default: withCtx(() => [createVNode(_component_el_form, {
								model: typeForm.value,
								"label-width": "90px"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_form_item, {
										label: "假期类型",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: typeForm.value.typeName,
											"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => typeForm.value.typeName = $event),
											placeholder: "如:年假"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "展示顺序" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: typeForm.value.displayOrder,
											"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => typeForm.value.displayOrder = $event),
											min: 0,
											"controls-position": "right"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "时长单位" }, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: typeForm.value.durationUnit,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => typeForm.value.durationUnit = $event)
										}, {
											default: withCtx(() => [createVNode(_component_el_radio_button, { value: 1 }, {
												default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("半天", -1)])]),
												_: 1
											}), createVNode(_component_el_radio_button, { value: 2 }, {
												default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("天", -1)])]),
												_: 1
											})]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "余额规则" }, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: typeForm.value.balanceRule,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => typeForm.value.balanceRule = $event)
										}, {
											default: withCtx(() => [createVNode(_component_el_radio_button, { value: 1 }, {
												default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("限额", -1)])]),
												_: 1
											}), createVNode(_component_el_radio_button, { value: 2 }, {
												default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("不限额", -1)])]),
												_: 1
											})]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "状态" }, {
										default: withCtx(() => [
											createVNode(_component_el_switch, {
												modelValue: typeForm.value.status,
												"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => typeForm.value.status = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"]),
											_cache[34] || (_cache[34] = createTextVNode()),
											createBaseVNode("span", _hoisted_6, toDisplayString(typeForm.value.status === 1 ? "已启用" : "已停用"), 1)
										]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["model"])]),
							_: 1
						}, 8, ["modelValue", "title"])]),
						_: 1
					}),
					createVNode(_component_el_tab_pane, {
						name: "balance",
						label: "假期额度",
						lazy: ""
					}, {
						default: withCtx(() => [createVNode(_component_el_card, {
							shadow: "never",
							class: "lm-card"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_7, [_cache[38] || (_cache[38] = createBaseVNode("div", null, [createBaseVNode("span", { class: "lm-card-title" }, "假期额度管理"), createBaseVNode("span", { class: "lm-card-sub" }, "给员工设置各类带薪假期额度;请假时按额度校验,余额不足无法申请")], -1)), createVNode(_component_el_button, {
								icon: unref(refresh_default),
								onClick: loadBalanceData
							}, {
								default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("刷新", -1)])]),
								_: 1
							}, 8, ["icon"])]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: employees.value,
								border: "",
								stripe: ""
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "暂无员工数据",
									"image-size": 80
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										type: "index",
										label: "#",
										width: "50",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "name",
										label: "姓名",
										width: "110"
									}),
									createVNode(_component_el_table_column, {
										prop: "deptName",
										label: "部门",
										"min-width": "110",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										prop: "postName",
										label: "岗位",
										"min-width": "110",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "已设额度",
										"min-width": "260"
									}, {
										default: withCtx(({ row }) => [empBalances(row.id).length ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(empBalances(row.id), (b) => {
											return openBlock(), createBlock(_component_el_tag, {
												key: b.id,
												class: "lm-bal-tag",
												type: remainTagType(b),
												effect: "light"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(b.leaveType) + " 剩" + toDisplayString(fmt(remainOf(b))) + "/" + toDisplayString(fmt(b.totalDays)) + "天 ", 1)]),
												_: 2
											}, 1032, ["type"]);
										}), 128)) : (openBlock(), createElementBlock("span", _hoisted_8, "未设置(不限制)"))]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "110",
										align: "center",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											onClick: ($event) => openQuota(row)
										}, {
											default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("设置额度", -1)])]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, balanceLoading.value]])]),
							_: 1
						}), createVNode(_component_el_dialog, {
							modelValue: quotaDialog.value,
							"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => quotaDialog.value = $event),
							title: `设置「${quotaEmp.value ? quotaEmp.value.name : ""}」的假期额度`,
							width: "580px"
						}, {
							default: withCtx(() => [
								createBaseVNode("div", _hoisted_9, [
									createVNode(_component_el_select, {
										modelValue: quotaForm.value.leaveType,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => quotaForm.value.leaveType = $event),
										placeholder: "选择假期类型",
										style: { "width": "150px" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(paidLeaveTypes, (t) => {
											return createVNode(_component_el_option, {
												key: t,
												label: t,
												value: t
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"]),
									createVNode(_component_el_input_number, {
										modelValue: quotaForm.value.totalDays,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => quotaForm.value.totalDays = $event),
										min: 0,
										step: .5,
										precision: 1,
										"controls-position": "right",
										style: { "width": "160px" }
									}, null, 8, ["modelValue"]),
									_cache[41] || (_cache[41] = createBaseVNode("span", { class: "quota-unit" }, "天", -1)),
									createVNode(_component_el_button, {
										type: "primary",
										icon: unref(plus_default),
										loading: quotaSaving.value,
										onClick: saveQuota
									}, {
										default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("添加 / 更新", -1)])]),
										_: 1
									}, 8, ["icon", "loading"])
								]),
								createVNode(_component_el_table, {
									data: quotaList.value,
									border: "",
									size: "small",
									style: { "margin-top": "14px" }
								}, {
									empty: withCtx(() => [createVNode(_component_el_empty, {
										description: "尚未设置额度,在上方添加",
										"image-size": 60
									})]),
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											prop: "leaveType",
											label: "假期类型",
											"min-width": "100"
										}),
										createVNode(_component_el_table_column, {
											label: "总额度",
											align: "center",
											width: "90"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.totalDays)) + " 天", 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "已用",
											align: "center",
											width: "80"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.usedDays)) + " 天", 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "剩余",
											align: "center",
											width: "90"
										}, {
											default: withCtx(({ row }) => [createBaseVNode("b", { style: normalizeStyle({ color: remainColorVal(remainOf(row), row.totalDays) }) }, toDisplayString(fmt(remainOf(row))) + " 天", 5)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "操作",
											width: "70",
											align: "center"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_button, {
												link: "",
												type: "danger",
												onClick: ($event) => removeQuota(row)
											}, {
												default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("删除", -1)])]),
												_: 1
											}, 8, ["onClick"])]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"]),
								createVNode(_component_el_alert, {
									class: "quota-tip",
									type: "info",
									closable: false,
									"show-icon": "",
									title: "未设额度的假期类型(如事假/病假)不做天数限制;设了额度的(如年假/育儿假)请假超额会被拦下。"
								})
							]),
							_: 1
						}, 8, ["modelValue", "title"])]),
						_: 1
					}),
					createVNode(_component_el_tab_pane, {
						name: "summary",
						label: "月度汇总",
						lazy: ""
					}, {
						default: withCtx(() => [createVNode(_component_el_card, {
							shadow: "never",
							class: "lm-card"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_10, [_cache[45] || (_cache[45] = createBaseVNode("div", null, [createBaseVNode("span", { class: "lm-card-title" }, "月度考勤汇总"), createBaseVNode("span", { class: "lm-card-sub" }, "按月生成每位员工的考勤汇总,HR 核对(可改)后(下一步)可发员工二次确认")], -1)), createBaseVNode("div", _hoisted_11, [
								createVNode(_component_el_date_picker, {
									modelValue: summaryMonth.value,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => summaryMonth.value = $event),
									type: "month",
									"value-format": "YYYY-MM",
									placeholder: "选择月份",
									style: { "width": "140px" },
									onChange: loadSummary
								}, null, 8, ["modelValue"]),
								unref(isHr) ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "primary",
									icon: unref(refresh_default),
									loading: summaryGenerating.value,
									onClick: generateSummary
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("生成本月汇总", -1)])]),
									_: 1
								}, 8, ["icon", "loading"])) : createCommentVNode("", true),
								unref(isHr) ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									type: "success",
									loading: summaryConfirming.value,
									onClick: confirmAllRows
								}, {
									default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("一键发送确认", -1)])]),
									_: 1
								}, 8, ["loading"])) : createCommentVNode("", true)
							])]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: summaryList.value,
								border: "",
								stripe: "",
								size: "small"
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "本月还没有汇总,选好月份点「生成本月汇总」",
									"image-size": 80
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										type: "index",
										label: "#",
										width: "46",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "employeeName",
										label: "姓名",
										width: "100",
										fixed: "left"
									}),
									createVNode(_component_el_table_column, {
										prop: "month",
										label: "月份",
										width: "86",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "expectedDays",
										label: "应出勤",
										width: "74",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "paidHolidayDays",
										label: "法定带薪",
										width: "84",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "actualDays",
										label: "实际",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "normal",
										label: "正常",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "late",
										label: "迟到",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "early",
										label: "早退",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "absent",
										label: "旷工",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "personalLeave",
										label: "事假",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										prop: "sickLeave",
										label: "病假",
										width: "62",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										label: "确认状态",
										width: "120",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, {
											size: "small",
											type: confirmTagType(row.confirmStatus)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(confirmLabel(row.confirmStatus)), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "180",
										align: "center",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [
											unref(isHr) ? (openBlock(), createBlock(_component_el_button, {
												key: 0,
												link: "",
												type: "primary",
												onClick: ($event) => openSummaryEdit(row)
											}, {
												default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("编辑", -1)])]),
												_: 1
											}, 8, ["onClick"])) : createCommentVNode("", true),
											unref(isHr) && row.confirmStatus === 0 ? (openBlock(), createBlock(_component_el_button, {
												key: 1,
												link: "",
												type: "success",
												onClick: ($event) => hrConfirmRow(row)
											}, {
												default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("发送确认", -1)])]),
												_: 1
											}, 8, ["onClick"])) : createCommentVNode("", true),
											!unref(isHr) && row.confirmStatus === 1 ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [createVNode(_component_el_button, {
												link: "",
												type: "success",
												onClick: ($event) => employeeConfirmRow(row)
											}, {
												default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("确认", -1)])]),
												_: 1
											}, 8, ["onClick"]), createVNode(_component_el_button, {
												link: "",
												type: "warning",
												onClick: ($event) => employeeDisputeRow(row)
											}, {
												default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("有异议", -1)])]),
												_: 1
											}, 8, ["onClick"])], 64)) : createCommentVNode("", true),
											row.confirmStatus === 2 || row.confirmStatus === 3 ? (openBlock(), createElementBlock("span", _hoisted_12, "—")) : createCommentVNode("", true)
										]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, summaryLoading.value]])]),
							_: 1
						}), createVNode(_component_el_dialog, {
							modelValue: summaryDialog.value,
							"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => summaryDialog.value = $event),
							title: "编辑考勤汇总",
							width: "560px"
						}, {
							footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[22] || (_cache[22] = ($event) => summaryDialog.value = false) }, {
								default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("取消", -1)])]),
								_: 1
							}), createVNode(_component_el_button, {
								type: "primary",
								loading: summarySaving.value,
								onClick: saveSummary
							}, {
								default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("保存", -1)])]),
								_: 1
							}, 8, ["loading"])]),
							default: withCtx(() => [createVNode(_component_el_form, {
								model: summaryForm.value,
								"label-width": "92px"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_form_item, { label: "员工/月份" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(summaryForm.value.employeeName) + " · " + toDisplayString(summaryForm.value.month), 1)]),
										_: 1
									}),
									createVNode(_component_el_row, { gutter: 12 }, {
										default: withCtx(() => [
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "应出勤" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.expectedDays,
														"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => summaryForm.value.expectedDays = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "法定带薪" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.paidHolidayDays,
														"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => summaryForm.value.paidHolidayDays = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "实际出勤" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.actualDays,
														"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => summaryForm.value.actualDays = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "正常" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.normal,
														"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => summaryForm.value.normal = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "迟到" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.late,
														"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => summaryForm.value.late = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "早退" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.early,
														"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => summaryForm.value.early = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "旷工" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.absent,
														"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => summaryForm.value.absent = $event),
														min: 0,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "事假" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.personalLeave,
														"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => summaryForm.value.personalLeave = $event),
														min: 0,
														precision: 1,
														step: .5,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "病假" }, {
													default: withCtx(() => [createVNode(_component_el_input_number, {
														modelValue: summaryForm.value.sickLeave,
														"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => summaryForm.value.sickLeave = $event),
														min: 0,
														precision: 1,
														step: .5,
														"controls-position": "right",
														style: { "width": "100%" }
													}, null, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											})
										]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "HR备注" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: summaryForm.value.remark,
											"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => summaryForm.value.remark = $event),
											type: "textarea",
											rows: 2
										}, null, 8, ["modelValue"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["model"])]),
							_: 1
						}, 8, ["modelValue"])]),
						_: 1
					}),
					createVNode(_component_el_tab_pane, {
						name: "apply",
						label: "假勤申请",
						lazy: ""
					}, {
						default: withCtx(() => [createVNode(_component_el_card, {
							shadow: "never",
							class: "lm-card"
						}, {
							default: withCtx(() => [
								_cache[52] || (_cache[52] = createBaseVNode("div", { class: "lm-card-head" }, [createBaseVNode("span", { class: "lm-card-title" }, "发起假勤申请"), createBaseVNode("span", { class: "lm-card-sub" }, "点击进入审批中心发起对应流程,审批通过后生效")], -1)),
								createBaseVNode("div", _hoisted_13, [(openBlock(), createElementBlock(Fragment, null, renderList(quickEntries, (q) => {
									return createBaseVNode("div", {
										class: "lm-apply-card",
										key: q.key,
										onClick: goApply
									}, [
										createBaseVNode("span", {
											class: "lm-apply-ico",
											style: normalizeStyle({ background: q.color })
										}, [createVNode(_component_el_icon, { size: 22 }, {
											default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(q.icon)))]),
											_: 2
										}, 1024)], 4),
										createBaseVNode("div", _hoisted_14, toDisplayString(q.label), 1),
										createBaseVNode("div", _hoisted_15, toDisplayString(q.desc), 1)
									]);
								}), 64))]),
								createVNode(_component_el_alert, {
									class: "lm-apply-tip",
									type: "info",
									closable: false,
									"show-icon": "",
									title: "带薪假期申请会自动校验剩余额度:剩余不足时无法提交;通过后扣减、被驳回/撤销则退还。"
								})
							]),
							_: 1
						})]),
						_: 1
					})
				]),
				_: 1
			}, 8, ["modelValue"])]);
		};
	}
}), [["__scopeId", "data-v-648d6c74"]]);
//#endregion
export { leave_management_default as default };

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, D as ElPagination, J as ElCol, T as ElProgress, V as ElDialog, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, fn as info_filled_default, g as ElTable, gt as ElForm, ht as ElTooltip, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as instanceApi } from "./workflow-CeqrP-pL.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { t as attendanceApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/attendance.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "hrm-attendance" };
var _hoisted_2 = { class: "toolbar" };
var _hoisted_3 = { class: "toolbar-left" };
var _hoisted_4 = { class: "toolbar-right" };
var _hoisted_5 = { class: "stat-value" };
var _hoisted_6 = {
	key: 0,
	class: "gap-text"
};
var _hoisted_7 = {
	key: 0,
	class: "stat-suffix"
};
var _hoisted_8 = { class: "stat-label" };
var _hoisted_9 = { class: "rate-header" };
var _hoisted_10 = { class: "rate-title" };
var _hoisted_11 = { class: "rate-value" };
var _hoisted_12 = { class: "card-header" };
var _hoisted_13 = { class: "num-normal" };
var _hoisted_14 = { class: "num-normal" };
var _hoisted_15 = { class: "num-bad" };
//#endregion
//#region src/views/hrm/attendance.vue
var attendance_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "attendance",
	setup(__props) {
		const { t } = useI18n();
		const userStore = useUserStore();
		const loading = ref(false);
		const statsLoading = ref(false);
		const leaveDialogVisible = ref(false);
		const leaveFormRef = ref();
		const clockedIn = ref(false);
		const clockedOut = ref(false);
		const now = /* @__PURE__ */ new Date();
		const selectedMonth = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
		const showResigned = ref(false);
		const pageNum = ref(1);
		const pageSize = ref(20);
		const total = ref(0);
		const tableData = ref([]);
		const summary = reactive({
			headcount: 0,
			expected: 0,
			actual: 0,
			normal: 0,
			late: 0,
			early: 0,
			absent: 0,
			leaveDays: 0
		});
		const colExpectedLabel = computed(() => t("hrm.attendance.colExpected"));
		const colMissingLabel = computed(() => t("hrm.attendance.colMissingCard"));
		const colMakeupLabel = computed(() => t("hrm.attendance.colMakeup"));
		const colPersonalLabel = computed(() => t("hrm.attendance.colPersonalLeave"));
		const colSickLabel = computed(() => t("hrm.attendance.colSickLeave"));
		const colMaternityLabel = computed(() => t("hrm.attendance.colMaternity"));
		const colMakeupFeeLabel = computed(() => t("hrm.attendance.colMakeupFee"));
		const statCards = computed(() => [
			{
				key: "headcount",
				label: t("hrm.attendance.statHeadcount"),
				value: summary.headcount,
				class: "c-blue",
				gap: false
			},
			{
				key: "expected",
				label: t("hrm.attendance.statExpected"),
				value: summary.expected,
				class: "c-cyan",
				gap: false
			},
			{
				key: "actual",
				label: t("hrm.attendance.statActualClock"),
				value: summary.actual,
				class: "c-teal",
				gap: false
			},
			{
				key: "normal",
				label: t("hrm.attendance.statNormal"),
				value: summary.normal,
				class: "c-green",
				gap: false
			},
			{
				key: "late",
				label: t("hrm.attendance.statLate"),
				value: summary.late,
				class: "c-orange",
				gap: false
			},
			{
				key: "absent",
				label: t("hrm.attendance.statAbsent"),
				value: summary.absent,
				class: "c-red",
				gap: false
			},
			{
				key: "missing",
				label: t("hrm.attendance.statMissingCard"),
				value: 0,
				class: "c-purple",
				gap: true
			},
			{
				key: "leaveHours",
				label: t("hrm.attendance.statLeaveHours"),
				value: 0,
				suffix: "h",
				class: "c-gray",
				gap: true
			}
		]);
		const overallRate = computed(() => {
			const denom = summary.normal + summary.late + summary.early + summary.absent;
			if (!denom) return 0;
			return Math.round(summary.normal / denom * 1e3) / 10;
		});
		const rateColor = computed(() => {
			if (overallRate.value >= 95) return "#67c23a";
			if (overallRate.value >= 85) return "#e6a23c";
			return "#f56c6c";
		});
		const LEAVE_TYPE_OPTIONS = [
			"年假",
			"调休",
			"事假",
			"病假",
			"婚假",
			"产假",
			"陪产假",
			"育儿假",
			"丧假"
		];
		const leaveForm = reactive({
			leaveType: "年假",
			startTime: "",
			endTime: "",
			reason: "",
			employeeId: 0
		});
		const computedDuration = computed(() => {
			if (!leaveForm.startTime || !leaveForm.endTime) return "0";
			return ((new Date(leaveForm.endTime).getTime() - new Date(leaveForm.startTime).getTime()) / (1e3 * 60 * 60 * 24)).toFixed(1);
		});
		/**
		* 加载考勤统计:
		* 1) 拉员工列表(后端已按数据范围收敛:HR/管理员看全部,普通员工只看自己一条)。
		*    showResigned 关闭时只看在职/试用(status 1、2),开启则不传 status(含离职 3)。
		* 2) 对每个员工调 /hrm/attendance/stats?employeeId&month 取月度统计,拼成明细行并汇总卡片。
		*    stats 返回 {normal,late,early,absent,total};total=当月考勤记录数=实际出勤/打卡人次。
		*/
		function loadAll() {
			return _loadAll.apply(this, arguments);
		}
		function _loadAll() {
			_loadAll = _asyncToGenerator(function* () {
				loading.value = true;
				statsLoading.value = true;
				try {
					var _empRes$data, _empRes$data2, _userStore$userInfo, _userStore$userInfo2;
					const empRes = yield employeeApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						status: showResigned.value ? void 0 : 1
					});
					const employees = ((_empRes$data = empRes.data) === null || _empRes$data === void 0 ? void 0 : _empRes$data.records) || [];
					total.value = ((_empRes$data2 = empRes.data) === null || _empRes$data2 === void 0 ? void 0 : _empRes$data2.total) || employees.length;
					const myUserId = ((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.userId) || ((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.id);
					const mine = employees.find((e) => Number(e.userId) === Number(myUserId));
					if (mine) leaveForm.employeeId = mine.id;
					const statsList = yield Promise.all(employees.map((e) => attendanceApi.stats({
						employeeId: e.id,
						month: selectedMonth.value
					}).then((r) => ({
						emp: e,
						s: r.data || {}
					})).catch(() => ({
						emp: e,
						s: {}
					}))));
					let sNormal = 0, sLate = 0, sEarly = 0, sAbsent = 0, sActual = 0, sExpected = 0, sLeave = 0;
					tableData.value = statsList.map(({ emp, s }) => {
						const normal = Number(s.normal || 0);
						const late = Number(s.late || 0);
						const early = Number(s.early || 0);
						const absent = Number(s.absent || 0);
						const actual = Number(s.total || 0);
						const expectedDays = Number(s.expectedDays || 0);
						const paidHolidayDays = Number(s.paidHolidayDays || 0);
						const personalLeave = Number(s.personalLeave || 0);
						const sickLeave = Number(s.sickLeave || 0);
						sNormal += normal;
						sLate += late;
						sEarly += early;
						sAbsent += absent;
						sActual += actual;
						sExpected += expectedDays;
						sLeave += personalLeave + sickLeave;
						return {
							employeeId: emp.id,
							name: emp.name || "",
							deptName: emp.deptName || "",
							month: s.month || selectedMonth.value,
							expectedDays,
							paidHolidayDays,
							actual,
							normal,
							late,
							early,
							absent,
							abnormal: late + early + absent,
							personalLeave,
							sickLeave
						};
					});
					summary.headcount = total.value;
					summary.expected = sExpected;
					summary.actual = sActual;
					summary.normal = sNormal;
					summary.late = sLate;
					summary.early = sEarly;
					summary.absent = sAbsent;
					summary.leaveDays = sLeave;
				} catch (_unused) {
					tableData.value = [];
					total.value = 0;
					summary.headcount = 0;
					summary.expected = 0;
					summary.actual = 0;
					summary.normal = 0;
					summary.late = 0;
					summary.early = 0;
					summary.absent = 0;
					summary.leaveDays = 0;
				} finally {
					loading.value = false;
					statsLoading.value = false;
				}
			});
			return _loadAll.apply(this, arguments);
		}
		function handleClockIn() {
			return _handleClockIn.apply(this, arguments);
		}
		function _handleClockIn() {
			_handleClockIn = _asyncToGenerator(function* () {
				if (!leaveForm.employeeId) {
					ElMessage.warning(t("hrm.attendance.needEmployeeProfile"));
					return;
				}
				yield attendanceApi.clockIn(leaveForm.employeeId);
				ElMessage.success(t("hrm.attendance.clockInSuccess"));
				clockedIn.value = true;
				loadAll();
			});
			return _handleClockIn.apply(this, arguments);
		}
		function handleClockOut() {
			return _handleClockOut.apply(this, arguments);
		}
		function _handleClockOut() {
			_handleClockOut = _asyncToGenerator(function* () {
				if (!leaveForm.employeeId) return;
				yield attendanceApi.clockOut(leaveForm.employeeId);
				ElMessage.success(t("hrm.attendance.clockOutSuccess"));
				clockedOut.value = true;
				loadAll();
			});
			return _handleClockOut.apply(this, arguments);
		}
		function handleLeaveSubmit() {
			return _handleLeaveSubmit.apply(this, arguments);
		}
		function _handleLeaveSubmit() {
			_handleLeaveSubmit = _asyncToGenerator(function* () {
				if (!leaveForm.leaveType || !leaveForm.startTime || !leaveForm.endTime) {
					ElMessage.warning("请填写请假类型与起止时间");
					return;
				}
				if (!leaveForm.reason || !leaveForm.reason.trim()) {
					ElMessage.warning("请填写请假事由");
					return;
				}
				const toHalf = (dt) => ({
					date: dt.slice(0, 10),
					ampm: new Date(dt.replace(/-/g, "/")).getHours() < 12 ? "上午" : "下午"
				});
				const s = toHalf(leaveForm.startTime);
				const e = toHalf(leaveForm.endTime);
				const formData = {
					leaveType: leaveForm.leaveType,
					startDate: s.date,
					startAmpm: s.ampm,
					endDate: e.date,
					endAmpm: e.ampm,
					days: parseFloat(computedDuration.value),
					reason: leaveForm.reason.trim()
				};
				try {
					yield instanceApi.start({
						processKey: "leave",
						title: `请假申请-${leaveForm.leaveType}`,
						formData
					});
					ElMessage.success("已提交请假审批,主管批准后自动计入考勤");
					leaveDialogVisible.value = false;
				} catch (err) {
					ElMessage.error((err === null || err === void 0 ? void 0 : err.message) || "提交失败");
				}
			});
			return _handleLeaveSubmit.apply(this, arguments);
		}
		onMounted(loadAll);
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_button = ElButton;
			const _component_el_card = ElCard;
			const _component_el_icon = ElIcon;
			const _component_el_tooltip = ElTooltip;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_progress = ElProgress;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(_component_el_alert, {
					class: "rule-alert",
					title: _ctx.$t("hrm.attendance.workRuleTitle"),
					type: "info",
					description: _ctx.$t("hrm.attendance.workRuleDesc"),
					"show-icon": "",
					closable: false
				}, null, 8, ["title", "description"]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "toolbar-card"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createVNode(_component_el_date_picker, {
						modelValue: selectedMonth.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => selectedMonth.value = $event),
						type: "month",
						"value-format": "YYYY-MM",
						clearable: false,
						placeholder: _ctx.$t("hrm.attendance.month"),
						style: { "width": "150px" },
						onChange: loadAll
					}, null, 8, ["modelValue", "placeholder"]), createVNode(_component_el_checkbox, {
						modelValue: showResigned.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => showResigned.value = $event),
						onChange: loadAll,
						style: { "margin-left": "16px" }
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("hrm.attendance.showResigned")), 1)]),
						_: 1
					}, 8, ["modelValue"])]), createBaseVNode("div", _hoisted_4, [
						createVNode(_component_el_button, {
							type: "primary",
							disabled: clockedIn.value,
							onClick: handleClockIn
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("hrm.attendance.clockIn")), 1)]),
							_: 1
						}, 8, ["disabled"]),
						createVNode(_component_el_button, {
							type: "success",
							disabled: !clockedIn.value || clockedOut.value,
							onClick: handleClockOut
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("hrm.attendance.clockOut")), 1)]),
							_: 1
						}, 8, ["disabled"]),
						createVNode(_component_el_button, {
							type: "warning",
							onClick: _cache[2] || (_cache[2] = ($event) => leaveDialogVisible.value = true)
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("hrm.attendance.leave")), 1)]),
							_: 1
						})
					])])]),
					_: 1
				}),
				withDirectives((openBlock(), createBlock(_component_el_row, {
					gutter: 12,
					class: "stats-row"
				}, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(statCards.value, (card) => {
						return openBlock(), createBlock(_component_el_col, {
							span: 3,
							key: card.key
						}, {
							default: withCtx(() => [createVNode(_component_el_card, {
								shadow: "never",
								class: normalizeClass(["stat-card", card.class])
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_5, [card.gap ? (openBlock(), createElementBlock("span", _hoisted_6, "—")) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(toDisplayString(card.value), 1), card.suffix ? (openBlock(), createElementBlock("span", _hoisted_7, toDisplayString(card.suffix), 1)) : createCommentVNode("", true)], 64))]), createBaseVNode("div", _hoisted_8, [createTextVNode(toDisplayString(card.label) + " ", 1), card.gap ? (openBlock(), createBlock(_component_el_tooltip, {
									key: 0,
									content: _ctx.$t("hrm.attendance.noBackendTip"),
									placement: "top"
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, { class: "gap-icon" }, {
										default: withCtx(() => [createVNode(unref(info_filled_default))]),
										_: 1
									})]),
									_: 1
								}, 8, ["content"])) : createCommentVNode("", true)])]),
								_: 2
							}, 1032, ["class"])]),
							_: 2
						}, 1024);
					}), 128))]),
					_: 1
				})), [[_directive_loading, statsLoading.value]]),
				withDirectives((openBlock(), createBlock(_component_el_card, {
					shadow: "never",
					class: "rate-card"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, toDisplayString(_ctx.$t("hrm.attendance.overallRate")), 1), createBaseVNode("span", _hoisted_11, toDisplayString(overallRate.value) + "%", 1)]), createVNode(_component_el_progress, {
						percentage: overallRate.value,
						"stroke-width": 16,
						color: rateColor.value,
						"show-text": false
					}, null, 8, ["percentage", "color"])]),
					_: 1
				})), [[_directive_loading, statsLoading.value]]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "table-card"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_12, [createBaseVNode("span", null, toDisplayString(_ctx.$t("hrm.attendance.detailTitle")), 1)])]),
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: tableData.value,
						border: "",
						stripe: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								type: "index",
								label: "#",
								width: "50",
								align: "center"
							}),
							createVNode(_component_el_table_column, {
								prop: "name",
								label: _ctx.$t("hrm.attendance.colName"),
								width: "110",
								fixed: "left"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "deptName",
								label: _ctx.$t("hrm.attendance.colDept"),
								"min-width": "120",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.deptName || "—"), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: "月份",
								width: "90",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.month || selectedMonth.value), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: colExpectedLabel.value,
								width: "90",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.expectedDays), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: "法定节假日带薪",
								width: "120",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_13, toDisplayString(row.paidHolidayDays), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "actual",
								label: _ctx.$t("hrm.attendance.colActual"),
								width: "90",
								align: "center"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "normal",
								label: _ctx.$t("hrm.attendance.colNormal"),
								width: "80",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_14, toDisplayString(row.normal), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("hrm.attendance.colAbnormal"),
								width: "80",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_15, toDisplayString(row.abnormal), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "late",
								label: _ctx.$t("hrm.attendance.colLate"),
								width: "70",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "num-warn": row.late }) }, toDisplayString(row.late), 3)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "early",
								label: _ctx.$t("hrm.attendance.colEarly"),
								width: "70",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "num-warn": row.early }) }, toDisplayString(row.early), 3)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								prop: "absent",
								label: _ctx.$t("hrm.attendance.colAbsent"),
								width: "70",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "num-bad": row.absent }) }, toDisplayString(row.absent), 3)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colMissingLabel.value,
								width: "70",
								align: "center"
							}, {
								default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("—", -1)])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colMakeupLabel.value,
								width: "70",
								align: "center"
							}, {
								default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("—", -1)])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colPersonalLabel.value,
								width: "70",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "num-warn": row.personalLeave }) }, toDisplayString(row.personalLeave), 3)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colSickLabel.value,
								width: "70",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "num-warn": row.sickLeave }) }, toDisplayString(row.sickLeave), 3)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colMaternityLabel.value,
								width: "70",
								align: "center"
							}, {
								default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("—", -1)])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: colMakeupFeeLabel.value,
								width: "90",
								align: "center"
							}, {
								default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("—", -1)])]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]), createVNode(_component_el_pagination, {
						"current-page": pageNum.value,
						"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => pageNum.value = $event),
						"page-size": pageSize.value,
						"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => pageSize.value = $event),
						total: total.value,
						"page-sizes": [
							10,
							20,
							50
						],
						layout: "total, sizes, prev, pager, next, jumper",
						onSizeChange: loadAll,
						onCurrentChange: loadAll,
						class: "pagination"
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: leaveDialogVisible.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => leaveDialogVisible.value = $event),
					title: _ctx.$t("hrm.attendance.leave"),
					width: "500px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => leaveDialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: handleLeaveSubmit
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: leaveForm,
						ref_key: "leaveFormRef",
						ref: leaveFormRef,
						"label-width": "90px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: _ctx.$t("hrm.attendance.leaveType"),
								prop: "leaveType"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: leaveForm.leaveType,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => leaveForm.leaveType = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(LEAVE_TYPE_OPTIONS, (tOpt) => {
										return createVNode(_component_el_option, {
											key: tOpt,
											label: tOpt,
											value: tOpt
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("hrm.attendance.leaveStart"),
								prop: "startTime"
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: leaveForm.startTime,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => leaveForm.startTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("hrm.attendance.leaveEnd"),
								prop: "endTime"
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: leaveForm.endTime,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => leaveForm.endTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("hrm.attendance.leaveDuration") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									"model-value": computedDuration.value,
									disabled: ""
								}, {
									append: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("hrm.attendance.days")), 1)]),
									_: 1
								}, 8, ["model-value"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("hrm.attendance.leaveReason"),
								prop: "reason"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: leaveForm.reason,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => leaveForm.reason = $event),
									type: "textarea",
									rows: 3
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-02c62a95"]]);
//#endregion
export { attendance_default as default };

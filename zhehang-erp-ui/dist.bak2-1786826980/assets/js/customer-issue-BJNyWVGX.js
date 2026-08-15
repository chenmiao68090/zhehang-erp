import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Er as withKeys, F as ElEmpty, H as ElDescriptions, J as ElCol, Nn as plus_default, Pt as circle_check_default, Q as ElRadioGroup, U as ElDescriptionsItem, Un as search_default, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, f as ElTimeline, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, pr as user_filled_default, rt as ElSelect, s as vLoading, sr as timer_default, v as ElSwitch, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as hasRole } from "./permission-WmkjwRL4.js";
import { n as customerApi } from "./crm-DKTvHmZR.js";
import { n as staffCandidatesApi, t as customerIssueApi } from "./customer-issue-ZVBFkyDD.js";
//#region src/views/crm/customer-issue.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ci" };
var _hoisted_2 = { class: "ci-head" };
var _hoisted_3 = { class: "ci-head-main" };
var _hoisted_4 = { class: "ci-title-line" };
var _hoisted_5 = { class: "ci-rules" };
var _hoisted_6 = { class: "ci-stats" };
var _hoisted_7 = { class: "ci-stat-num" };
var _hoisted_8 = { class: "ci-stat-num is-warning" };
var _hoisted_9 = { class: "ci-stat-num is-danger" };
var _hoisted_10 = { class: "ci-stat-num is-danger" };
var _hoisted_11 = { class: "ci-board" };
var _hoisted_12 = { class: "ci-stage-bar" };
var _hoisted_13 = { class: "ci-toolbar" };
var _hoisted_14 = { class: "ci-task-cell" };
var _hoisted_15 = { class: "ci-task-top" };
var _hoisted_16 = { class: "ci-customer" };
var _hoisted_17 = { class: "ci-task-desc" };
var _hoisted_18 = { class: "ci-task-meta" };
var _hoisted_19 = { class: "ci-people" };
var _hoisted_20 = { class: "ci-owner" };
var _hoisted_21 = {
	key: 0,
	class: "ci-assist"
};
var _hoisted_22 = {
	key: 1,
	class: "ci-assist"
};
var _hoisted_23 = { class: "ci-sla" };
var _hoisted_24 = { class: "ci-next" };
var _hoisted_25 = { class: "ci-pager" };
var _hoisted_26 = { class: "ci-form-main" };
var _hoisted_27 = { class: "ci-form-section" };
var _hoisted_28 = { class: "ci-label-line" };
var _hoisted_29 = { class: "ci-form-section" };
var _hoisted_30 = { class: "ci-quick-deadline" };
var _hoisted_31 = { class: "ci-switch-row" };
var _hoisted_32 = { class: "ci-switch-row" };
var _hoisted_33 = {
	key: 0,
	class: "ci-form-section"
};
var _hoisted_34 = { class: "ci-detail-head" };
var _hoisted_35 = { class: "ci-detail-customer" };
var _hoisted_36 = { class: "ci-next-card" };
var _hoisted_37 = {
	key: 0,
	class: "ci-detail-actions"
};
var _hoisted_38 = { class: "ci-tl-op" };
var _hoisted_39 = {
	key: 0,
	class: "ci-tl-remark"
};
//#endregion
//#region src/views/crm/customer-issue.vue
var customer_issue_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "customer-issue",
	setup(__props) {
		const SOURCES = [
			{
				value: "wechat",
				label: "微信"
			},
			{
				value: "phone",
				label: "电话"
			},
			{
				value: "system",
				label: "系统"
			},
			{
				value: "feishu",
				label: "飞书"
			},
			{
				value: "other",
				label: "其他"
			}
		];
		const ISSUE_TYPES = [
			{
				value: "complaint",
				label: "投诉安抚"
			},
			{
				value: "consult",
				label: "业务咨询"
			},
			{
				value: "urge",
				label: "客户催办"
			},
			{
				value: "tax",
				label: "税务处理"
			},
			{
				value: "invoice",
				label: "开票问题"
			},
			{
				value: "gs",
				label: "工商事项"
			},
			{
				value: "fee",
				label: "费用疑问"
			},
			{
				value: "other",
				label: "其他服务"
			}
		];
		const PRIORITIES = [
			{
				value: "P0",
				label: "P0 紧急"
			},
			{
				value: "P1",
				label: "P1 重要"
			},
			{
				value: "P2",
				label: "P2 普通"
			}
		];
		const STATUS = [
			{
				value: "pending",
				label: "待接单"
			},
			{
				value: "processing",
				label: "处理中"
			},
			{
				value: "waiting",
				label: "等客户反馈"
			},
			{
				value: "completed",
				label: "已完成"
			},
			{
				value: "closed",
				label: "已关闭"
			}
		];
		const STATUS_TABS = STATUS.filter((s) => s.value !== "closed");
		const labelOf = (list, v) => {
			var _list$find;
			return ((_list$find = list.find((x) => x.value === v)) === null || _list$find === void 0 ? void 0 : _list$find.label) || v || "未填写";
		};
		const prioTag = (p) => ({
			P0: "danger",
			P1: "warning",
			P2: "info"
		})[p || "P2"] || "info";
		const statusTag = (s) => ({
			pending: "danger",
			processing: "warning",
			waiting: "primary",
			completed: "success",
			closed: "info"
		})[s || ""] || "info";
		const fmtTime = (t) => t ? String(t).replace("T", " ").slice(0, 16) : "未设置";
		const parseTime = (t) => t ? new Date(String(t).replace(/-/g, "/")).getTime() : 0;
		const isFinished = (row) => row.status === "completed" || row.status === "closed";
		const isOverdue = (row) => !!row.deadline && parseTime(row.deadline) < Date.now() && !isFinished(row);
		const durationText = (ms) => {
			const minutes = Math.max(1, Math.round(ms / 6e4));
			if (minutes < 60) return `${minutes}分钟`;
			const hours = Math.round(minutes / 60);
			if (hours < 24) return `${hours}小时`;
			return `${Math.round(hours / 24)}天`;
		};
		const deadlineHint = (row) => {
			if (!row.deadline) return "请补截止时间";
			if (isFinished(row)) return row.resolveTime ? `完成于 ${fmtTime(row.resolveTime)}` : "已结束";
			const diff = parseTime(row.deadline) - Date.now();
			if (diff < 0) return `逾期 ${durationText(Math.abs(diff))}`;
			if (diff <= 7200 * 1e3) return `${durationText(diff)}内到期`;
			return `剩余 ${durationText(diff)}`;
		};
		const nextAction = (row) => {
			if (row.status === "completed") return row.needReview === 1 ? "结果已闭环,补充改进沉淀" : "确认客户无后续反馈";
			if (row.status === "closed") return "已关闭,无需继续推进";
			if (!row.ownerId) return "先指定主办人,避免无人负责";
			if (isOverdue(row)) return "先回复客户当前进展,再处理逾期原因";
			if (row.status === "pending") return "主办人接单,给客户第一句回应";
			if (row.status === "processing") return "按截止时间推进,需要协同时直接补协同人";
			if (row.status === "waiting") return "跟进客户缺少的资料或确认意见";
			return "保持推进";
		};
		const rowClass = ({ row }) => isOverdue(row) ? "row-overdue" : row.priority === "P0" && !isFinished(row) ? "row-p0" : "";
		const actionLabel = (lg) => {
			if (lg.action === "create") return "创建了工单";
			if (lg.action === "assign") return "调整了主办/协同";
			if (lg.action === "close") return "关闭了工单";
			if (lg.action === "status") return `将状态改为「${labelOf(STATUS, lg.toStatus)}」`;
			if (lg.action === "update") return "更新了工单信息";
			return "更新了工单";
		};
		const canAssign = computed(() => hasRole([
			"admin",
			"boss",
			"manager",
			"dept_manager"
		]));
		const canClose = computed(() => hasRole(["admin", "boss"]));
		const rows = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(10);
		const query = ref({ status: "" });
		const stats = ref({});
		const clients = ref([]);
		const staffList = ref([]);
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _page$total;
					const res = yield customerIssueApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: query.value.keyword || void 0,
						status: query.value.status || void 0,
						priority: query.value.priority || void 0,
						issueType: query.value.issueType || void 0,
						ownerId: query.value.ownerId || void 0,
						overdue: query.value.overdue || void 0,
						openOnly: query.value.openOnly || void 0,
						unhandled: query.value.unhandled || void 0
					});
					const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (page === null || page === void 0 ? void 0 : page.records) || (page === null || page === void 0 ? void 0 : page.list) || [];
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
					const res = yield customerIssueApi.stats();
					stats.value = ((_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) || {};
				} catch (_unused2) {}
			});
			return function loadStats() {
				return _ref2.apply(this, arguments);
			};
		}();
		const filterStatus = (status) => {
			query.value.status = status;
			query.value.overdue = void 0;
			query.value.openOnly = void 0;
			query.value.unhandled = void 0;
			reload();
		};
		const filterOverdue = () => {
			query.value.overdue = true;
			query.value.status = "";
			query.value.openOnly = void 0;
			query.value.unhandled = void 0;
			reload();
		};
		const filterP0 = () => {
			query.value.priority = "P0";
			query.value.overdue = void 0;
			query.value.status = "";
			query.value.openOnly = true;
			query.value.unhandled = void 0;
			reload();
		};
		const filterUnhandled = () => {
			query.value.status = "";
			query.value.priority = void 0;
			query.value.overdue = void 0;
			query.value.openOnly = void 0;
			query.value.unhandled = true;
			reload();
		};
		const clearFastFilter = () => {
			query.value = { status: "" };
			reload();
		};
		const clearDrillDownFilter = () => {
			query.value.openOnly = void 0;
			query.value.unhandled = void 0;
		};
		const onStatusChange = () => {
			clearDrillDownFilter();
			query.value.overdue = void 0;
			reload();
		};
		const onPriorityFilterChange = () => {
			clearDrillDownFilter();
			reload();
		};
		const onOverdueChange = () => {
			clearDrillDownFilter();
			query.value.status = "";
			reload();
		};
		const remoteCustomers = function() {
			var _ref5 = _asyncToGenerator(function* (q) {
				if (!q) return;
				try {
					var _ref3, _res$data3, _ref4, _res$data4;
					const res = yield customerApi.list({
						pageNum: 1,
						pageSize: 20,
						name: q
					});
					clients.value = ((_ref3 = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res) === null || _ref3 === void 0 ? void 0 : _ref3.records) || ((_ref4 = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) === null || _ref4 === void 0 ? void 0 : _ref4.list) || [];
				} catch (_unused3) {
					clients.value = [];
				}
			});
			return function remoteCustomers(_x) {
				return _ref5.apply(this, arguments);
			};
		}();
		const loadStaff = function() {
			var _ref6 = _asyncToGenerator(function* () {
				try {
					staffList.value = (yield staffCandidatesApi()) || [];
				} catch (_unused4) {
					staffList.value = [];
				}
			});
			return function loadStaff() {
				return _ref6.apply(this, arguments);
			};
		}();
		const dialog = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const openForm = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				status: "pending",
				priority: "P2",
				source: "wechat",
				bossInvolved: 0,
				needReview: 0,
				deadline: defaultDeadline("P2")
			};
			if (row === null || row === void 0 ? void 0 : row.customerName) clients.value = [{
				id: row.customerId || 0,
				name: row.customerName
			}];
			dialog.value = {
				visible: true,
				saving: false
			};
		};
		const onPickCustomer = (name) => {
			var _clients$value$find;
			form.value.customerId = (_clients$value$find = clients.value.find((c) => c.name === name)) === null || _clients$value$find === void 0 ? void 0 : _clients$value$find.id;
		};
		const onPickStaff = (which, id) => {
			const u = staffList.value.find((x) => x.id === id);
			if (which === "owner") form.value.ownerName = u === null || u === void 0 ? void 0 : u.name;
			else form.value.assistName = u === null || u === void 0 ? void 0 : u.name;
		};
		const pad = (n) => String(n).padStart(2, "0");
		const formatDateTime = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
		const dateAt = (offsetDays, hour, minute = 0) => {
			const d = /* @__PURE__ */ new Date();
			d.setDate(d.getDate() + offsetDays);
			d.setHours(hour, minute, 0, 0);
			return formatDateTime(d);
		};
		const defaultDeadline = (priority) => {
			const now = /* @__PURE__ */ new Date();
			if (priority === "P0") return formatDateTime(new Date(now.getTime() + 14400 * 1e3));
			if (priority === "P1") return dateAt(1, 18);
			return dateAt(3, 18);
		};
		const onPriorityChange = (p) => {
			if (!form.value.id || !form.value.deadline) form.value.deadline = defaultDeadline(p);
			if (p === "P0") form.value.bossInvolved = 1;
		};
		const setQuickDeadline = (kind) => {
			if (kind === "today") form.value.deadline = dateAt(0, 18);
			if (kind === "tomorrow") form.value.deadline = dateAt(1, 12);
			if (kind === "twoDays") form.value.deadline = dateAt(2, 18);
			if (kind === "priority") form.value.deadline = defaultDeadline(form.value.priority);
		};
		const applyDescriptionTemplate = () => {
			const template = "客户反馈:\n影响/风险:\n客户期望:\n已承诺下一步:";
			if (!form.value.description) {
				form.value.description = template;
				return;
			}
			if (!form.value.description.includes("客户反馈:")) form.value.description = `${form.value.description}\n\n${template}`;
		};
		const submit = function() {
			var _ref7 = _asyncToGenerator(function* () {
				if (!form.value.customerName) {
					ElMessage.warning("请选择或填写客户");
					return;
				}
				if (!form.value.ownerId) {
					ElMessage.warning("请选择主办人;没有主办人就不是可闭环的任务");
					return;
				}
				if (!form.value.deadline) {
					ElMessage.warning("请填写截止时间");
					return;
				}
				if (!form.value.description || form.value.description.trim().length < 8) {
					ElMessage.warning("请把客户问题写具体一点");
					return;
				}
				if (form.value.status === "completed" && !form.value.result) {
					ElMessage.warning("已完成的工单必须填写处理结果");
					return;
				}
				dialog.value.saving = true;
				try {
					if (form.value.id) yield customerIssueApi.update(form.value);
					else yield customerIssueApi.create(form.value);
					ElMessage.success("工单已保存");
					dialog.value.visible = false;
					loadData();
				} catch (_unused5) {} finally {
					dialog.value.saving = false;
				}
			});
			return function submit() {
				return _ref7.apply(this, arguments);
			};
		}();
		const quickStatus = function() {
			var _ref8 = _asyncToGenerator(function* (row, status) {
				yield doChangeStatus(row, status, void 0, status === "processing" ? "已接单并开始处理" : status === "waiting" ? "等待客户补充/确认" : void 0);
			});
			return function quickStatus(_x2, _x3) {
				return _ref8.apply(this, arguments);
			};
		}();
		const completeIssue = function() {
			var _ref9 = _asyncToGenerator(function* (row) {
				let result = row.result || "";
				try {
					result = (yield ElMessageBox.prompt("请写清客户问题最终如何闭环", "填写处理结果", {
						inputType: "textarea",
						inputValue: result,
						confirmButtonText: "完成工单",
						cancelButtonText: "取消"
					})).value;
				} catch (_unused6) {
					return;
				}
				if (!result || result.trim().length < 6) {
					ElMessage.warning("处理结果请写具体一点");
					return;
				}
				yield doChangeStatus(row, "completed", result, "客户问题已闭环");
			});
			return function completeIssue(_x4) {
				return _ref9.apply(this, arguments);
			};
		}();
		const doChangeStatus = function() {
			var _ref10 = _asyncToGenerator(function* (row, status, result, remark) {
				row._saving = true;
				try {
					yield customerIssueApi.changeStatus(row.id, {
						status,
						result,
						remark
					});
					ElMessage.success("状态已更新");
					yield loadData();
					if (detail.value.visible && row.id) yield refreshDetail(row.id);
				} catch (_unused7) {
					loadData();
				} finally {
					row._saving = false;
				}
			});
			return function doChangeStatus(_x5, _x6, _x7, _x8) {
				return _ref10.apply(this, arguments);
			};
		}();
		const assignDlg = ref({
			visible: false,
			saving: false
		});
		const openAssign = (row) => {
			assignDlg.value = {
				visible: true,
				saving: false,
				id: row.id,
				ownerId: row.ownerId,
				assistId: row.assistId
			};
		};
		const submitAssign = function() {
			var _ref11 = _asyncToGenerator(function* () {
				if (!assignDlg.value.ownerId) {
					ElMessage.warning("请选择主办人");
					return;
				}
				assignDlg.value.saving = true;
				try {
					const owner = staffList.value.find((u) => u.id === assignDlg.value.ownerId);
					const assist = staffList.value.find((u) => u.id === assignDlg.value.assistId);
					yield customerIssueApi.assign(assignDlg.value.id, {
						ownerId: assignDlg.value.ownerId,
						ownerName: owner === null || owner === void 0 ? void 0 : owner.name,
						assistId: assignDlg.value.assistId,
						assistName: assist === null || assist === void 0 ? void 0 : assist.name
					});
					ElMessage.success("主办人已调整");
					assignDlg.value.visible = false;
					loadData();
				} catch (_unused8) {} finally {
					assignDlg.value.saving = false;
				}
			});
			return function submitAssign() {
				return _ref11.apply(this, arguments);
			};
		}();
		const closeIssue = function() {
			var _ref12 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`关闭工单「${row.issueNo}」? 关闭后不再进入待处理。`, "关闭工单", { type: "warning" });
				} catch (_unused9) {
					return;
				}
				try {
					yield customerIssueApi.close(row.id, { remark: "管理关闭" });
					ElMessage.success("已关闭");
					loadData();
				} catch (_unused10) {}
			});
			return function closeIssue(_x9) {
				return _ref12.apply(this, arguments);
			};
		}();
		const detail = ref({
			visible: false,
			issue: null,
			logs: []
		});
		const refreshDetail = function() {
			var _ref13 = _asyncToGenerator(function* (id) {
				var _res$data5;
				const res = yield customerIssueApi.detail(id);
				const d = (_res$data5 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data5 !== void 0 ? _res$data5 : res;
				detail.value.issue = (d === null || d === void 0 ? void 0 : d.issue) || detail.value.issue;
				detail.value.logs = (d === null || d === void 0 ? void 0 : d.logs) || [];
			});
			return function refreshDetail(_x10) {
				return _ref13.apply(this, arguments);
			};
		}();
		const openDetail = function() {
			var _ref14 = _asyncToGenerator(function* (row) {
				detail.value = {
					visible: true,
					issue: row,
					logs: []
				};
				try {
					yield refreshDetail(row.id);
				} catch (_unused11) {
					detail.value.visible = false;
				}
			});
			return function openDetail(_x11) {
				return _ref14.apply(this, arguments);
			};
		}();
		const route = useRoute();
		onMounted(_asyncToGenerator(function* () {
			var _route$query, _route$query2, _route$query3;
			loadStaff();
			const issueIdValue = Array.isArray((_route$query = route.query) === null || _route$query === void 0 ? void 0 : _route$query.issueId) ? route.query.issueId[0] : (_route$query2 = route.query) === null || _route$query2 === void 0 ? void 0 : _route$query2.issueId;
			const issueId = Number(issueIdValue);
			if (Number.isSafeInteger(issueId) && issueId > 0) {
				yield loadData();
				yield openDetail(rows.value.find((row) => Number(row.id) === issueId) || { id: issueId });
				return;
			}
			const view = (_route$query3 = route.query) === null || _route$query3 === void 0 ? void 0 : _route$query3.view;
			if (view === "overdue") filterOverdue();
			else if (view === "p0") filterP0();
			else if (view === "unhandled") filterUnhandled();
			else loadData();
		}));
		return (_ctx, _cache) => {
			var _detail$value$issue;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("div", _hoisted_4, [createVNode(_component_el_tag, {
						type: "primary",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("服务工单", -1)])]),
						_: 1
					}), _cache[41] || (_cache[41] = createBaseVNode("h2", { class: "ci-title" }, "服务工单", -1))]),
					_cache[45] || (_cache[45] = createBaseVNode("p", { class: "ci-sub" }, " 客户问题、催办、咨询统一变成服务任务:一个主办人、一个截止时间、一个处理结果,过程围绕客户闭环。 ", -1)),
					createBaseVNode("div", _hoisted_5, [
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(user_filled_default))]),
							_: 1
						}), _cache[42] || (_cache[42] = createTextVNode(" 主办人负责闭环", -1))]),
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(timer_default))]),
							_: 1
						}), _cache[43] || (_cache[43] = createTextVNode(" 按 SLA 截止", -1))]),
						createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(circle_check_default))]),
							_: 1
						}), _cache[44] || (_cache[44] = createTextVNode(" 完成必须写结果", -1))])
					])
				]), createVNode(_component_el_button, {
					type: "primary",
					size: "large",
					onClick: _cache[0] || (_cache[0] = ($event) => openForm())
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[46] || (_cache[46] = createTextVNode(" 新建服务工单 ", -1))]),
					_: 1
				})]),
				createBaseVNode("div", _hoisted_6, [
					createBaseVNode("button", {
						class: "ci-stat",
						type: "button",
						onClick: clearFastFilter
					}, [createBaseVNode("span", _hoisted_7, toDisplayString(stats.value.todayNew || 0), 1), _cache[47] || (_cache[47] = createBaseVNode("span", { class: "ci-stat-label" }, "今日新问题", -1))]),
					createBaseVNode("button", {
						class: "ci-stat",
						type: "button",
						onClick: _cache[1] || (_cache[1] = ($event) => filterStatus("pending"))
					}, [createBaseVNode("span", _hoisted_8, toDisplayString(stats.value.unhandled || 0), 1), _cache[48] || (_cache[48] = createBaseVNode("span", { class: "ci-stat-label" }, "待接单", -1))]),
					createBaseVNode("button", {
						class: "ci-stat",
						type: "button",
						onClick: filterOverdue
					}, [createBaseVNode("span", _hoisted_9, toDisplayString(stats.value.overdue || 0), 1), _cache[49] || (_cache[49] = createBaseVNode("span", { class: "ci-stat-label" }, "已逾期", -1))]),
					createBaseVNode("button", {
						class: "ci-stat",
						type: "button",
						onClick: filterP0
					}, [createBaseVNode("span", _hoisted_10, toDisplayString(stats.value.p0 || 0), 1), _cache[50] || (_cache[50] = createBaseVNode("span", { class: "ci-stat-label" }, "P0 升级关注", -1))])
				]),
				createBaseVNode("div", _hoisted_11, [
					createBaseVNode("div", _hoisted_12, [createVNode(_component_el_radio_group, {
						modelValue: query.value.status,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.value.status = $event),
						size: "large",
						onChange: onStatusChange
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { label: "" }, {
							default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("全部", -1)])]),
							_: 1
						}), (openBlock(true), createElementBlock(Fragment, null, renderList(unref(STATUS_TABS), (s) => {
							return openBlock(), createBlock(_component_el_radio_button, {
								key: s.value,
								label: s.value
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(s.label), 1)]),
								_: 2
							}, 1032, ["label"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]), query.value.unhandled ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						closable: "",
						type: "warning",
						onClose: clearFastFilter
					}, {
						default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode(" 老板下钻：未处理（待接单、处理中、等客户反馈） ", -1)])]),
						_: 1
					})) : query.value.openOnly ? (openBlock(), createBlock(_component_el_tag, {
						key: 1,
						closable: "",
						type: "danger",
						onClose: clearFastFilter
					}, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode(" 老板下钻：仅看未结案 ", -1)])]),
						_: 1
					})) : createCommentVNode("", true)]),
					createBaseVNode("div", _hoisted_13, [
						createVNode(_component_el_input, {
							modelValue: query.value.keyword,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => query.value.keyword = $event),
							class: "ci-search",
							placeholder: "搜客户、编号、问题关键词",
							clearable: "",
							onKeyup: withKeys(reload, ["enter"]),
							onClear: reload
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: query.value.priority,
							"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => query.value.priority = $event),
							placeholder: "紧急度",
							clearable: "",
							class: "ci-filter",
							onChange: onPriorityFilterChange
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PRIORITIES, (p) => {
								return createVNode(_component_el_option, {
									key: p.value,
									label: p.label,
									value: p.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: query.value.issueType,
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => query.value.issueType = $event),
							placeholder: "服务类型",
							clearable: "",
							class: "ci-filter",
							onChange: reload
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(ISSUE_TYPES, (t) => {
								return createVNode(_component_el_option, {
									key: t.value,
									label: t.label,
									value: t.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: query.value.ownerId,
							"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => query.value.ownerId = $event),
							placeholder: "主办人",
							clearable: "",
							filterable: "",
							class: "ci-filter",
							onChange: reload
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffList.value, (u) => {
								return openBlock(), createBlock(_component_el_option, {
									key: u.id,
									label: u.name,
									value: u.id
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: query.value.overdue,
							"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => query.value.overdue = $event),
							placeholder: "时效",
							clearable: "",
							class: "ci-filter",
							onChange: onOverdueChange
						}, {
							default: withCtx(() => [createVNode(_component_el_option, {
								label: "仅看逾期",
								value: true
							})]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_button, { onClick: reload }, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(search_default))]),
								_: 1
							}), _cache[54] || (_cache[54] = createTextVNode(" 查询", -1))]),
							_: 1
						})
					]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-class-name": rowClass,
						class: "ci-table",
						border: ""
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "还没有服务工单",
							"image-size": 80
						}, {
							default: withCtx(() => [createVNode(_component_el_button, {
								type: "primary",
								onClick: _cache[8] || (_cache[8] = ($event) => openForm())
							}, {
								default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("新建服务工单", -1)])]),
								_: 1
							})]),
							_: 1
						})]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "服务任务",
								"min-width": "310",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_14, [
									createBaseVNode("div", _hoisted_15, [createVNode(_component_el_tag, {
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(row.issueNo || "未编号"), 1)]),
										_: 2
									}, 1024), createBaseVNode("span", _hoisted_16, toDisplayString(row.customerName || "未填写客户"), 1)]),
									createBaseVNode("div", _hoisted_17, toDisplayString(row.description || "暂无问题描述"), 1),
									createBaseVNode("div", _hoisted_18, [createBaseVNode("span", null, toDisplayString(labelOf(SOURCES, row.source)), 1), createBaseVNode("span", null, toDisplayString(labelOf(ISSUE_TYPES, row.issueType)), 1)])
								])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "主办/协同",
								width: "150"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_19, [createBaseVNode("span", _hoisted_20, toDisplayString(row.ownerName || "待指定"), 1), row.assistName ? (openBlock(), createElementBlock("span", _hoisted_21, "协同:" + toDisplayString(row.assistName), 1)) : (openBlock(), createElementBlock("span", _hoisted_22, "协同:无"))])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "SLA",
								width: "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_23, [
									createVNode(_component_el_tag, {
										type: prioTag(row.priority),
										size: "small",
										effect: "dark"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(labelOf(PRIORITIES, row.priority)), 1)]),
										_: 2
									}, 1032, ["type"]),
									createBaseVNode("span", { class: normalizeClass({ "is-overdue": isOverdue(row) }) }, toDisplayString(fmtTime(row.deadline)), 3),
									createBaseVNode("em", { class: normalizeClass({ "is-overdue": isOverdue(row) }) }, toDisplayString(deadlineHint(row)), 3)
								])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态与下一步",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_24, [createVNode(_component_el_tag, {
									type: statusTag(row.status),
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(labelOf(STATUS, row.status)), 1)]),
									_: 2
								}, 1032, ["type"]), createBaseVNode("span", null, toDisplayString(nextAction(row)), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "创建时间",
								width: "140"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtTime(row.createTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "245",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [
									createVNode(_component_el_button, {
										size: "small",
										link: "",
										type: "primary",
										onClick: ($event) => openDetail(row)
									}, {
										default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("详情", -1)])]),
										_: 1
									}, 8, ["onClick"]),
									createVNode(_component_el_button, {
										size: "small",
										link: "",
										type: "primary",
										onClick: ($event) => openForm(row)
									}, {
										default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["onClick"]),
									row.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										size: "small",
										link: "",
										type: "success",
										loading: row._saving,
										onClick: ($event) => quickStatus(row, "processing")
									}, {
										default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode(" 开始处理 ", -1)])]),
										_: 1
									}, 8, ["loading", "onClick"])) : createCommentVNode("", true),
									row.status === "processing" ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										size: "small",
										link: "",
										type: "warning",
										loading: row._saving,
										onClick: ($event) => quickStatus(row, "waiting")
									}, {
										default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode(" 等客户 ", -1)])]),
										_: 1
									}, 8, ["loading", "onClick"])) : createCommentVNode("", true),
									row.status !== "completed" && row.status !== "closed" ? (openBlock(), createBlock(_component_el_button, {
										key: 2,
										size: "small",
										link: "",
										type: "success",
										loading: row._saving,
										onClick: ($event) => completeIssue(row)
									}, {
										default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode(" 完成 ", -1)])]),
										_: 1
									}, 8, ["loading", "onClick"])) : createCommentVNode("", true),
									canAssign.value ? (openBlock(), createBlock(_component_el_button, {
										key: 3,
										size: "small",
										link: "",
										type: "primary",
										onClick: ($event) => openAssign(row)
									}, {
										default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("调整主办", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									canClose.value && row.status !== "closed" ? (openBlock(), createBlock(_component_el_button, {
										key: 4,
										size: "small",
										link: "",
										type: "danger",
										onClick: ($event) => closeIssue(row)
									}, {
										default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("关闭", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_25, [createVNode(_component_el_pagination, {
						"current-page": pageNum.value,
						"onUpdate:currentPage": _cache[9] || (_cache[9] = ($event) => pageNum.value = $event),
						"page-size": pageSize.value,
						"onUpdate:pageSize": _cache[10] || (_cache[10] = ($event) => pageSize.value = $event),
						total: total.value,
						"page-sizes": [
							10,
							20,
							50
						],
						layout: "total, sizes, prev, pager, next",
						onCurrentChange: loadData,
						onSizeChange: reload
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(_component_el_dialog, {
					modelValue: dialog.value.visible,
					"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => dialog.value.visible = $event),
					title: form.value.id ? "编辑服务工单" : "新建服务工单",
					width: "920px",
					top: "6vh",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[30] || (_cache[30] = ($event) => dialog.value.visible = false) }, {
						default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: dialog.value.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("保存工单", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-position": "top",
						class: "ci-form"
					}, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_26, [
							createBaseVNode("section", _hoisted_27, [
								_cache[65] || (_cache[65] = createBaseVNode("div", { class: "ci-section-title" }, [createBaseVNode("span", null, "1. 客户与问题"), createBaseVNode("small", null, "把客户原话和影响写清楚,后面才好处理")], -1)),
								createVNode(_component_el_form_item, {
									label: "客户",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.value.customerName,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.customerName = $event),
										filterable: "",
										"allow-create": "",
										"default-first-option": "",
										remote: "",
										clearable: "",
										"remote-method": remoteCustomers,
										placeholder: "搜索选择客户,或直接输入客户名称",
										style: { "width": "100%" },
										onChange: onPickCustomer
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(clients.value, (c) => {
											return openBlock(), createBlock(_component_el_option, {
												key: c.id,
												label: c.name,
												value: c.name
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "来源" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.source,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.source = $event),
												clearable: "",
												placeholder: "客户从哪里反馈",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SOURCES, (s) => {
													return createVNode(_component_el_option, {
														key: s.value,
														label: s.label,
														value: s.value
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "服务类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.issueType,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.issueType = $event),
												clearable: "",
												placeholder: "问题归类",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(ISSUE_TYPES, (t) => {
													return createVNode(_component_el_option, {
														key: t.value,
														label: t.label,
														value: t.value
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "问题描述",
									required: ""
								}, {
									label: withCtx(() => [createBaseVNode("div", _hoisted_28, [_cache[64] || (_cache[64] = createBaseVNode("span", null, "问题描述", -1)), createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: applyDescriptionTemplate
									}, {
										default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("套用模板", -1)])]),
										_: 1
									})])]),
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.value.description,
										"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.description = $event),
										type: "textarea",
										rows: 6,
										maxlength: "2000",
										"show-word-limit": "",
										placeholder: "建议写:客户反馈什么、影响什么、客户期望什么、已承诺下一步是什么。"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createBaseVNode("section", _hoisted_29, [
								_cache[73] || (_cache[73] = createBaseVNode("div", { class: "ci-section-title" }, [createBaseVNode("span", null, "2. 处理安排"), createBaseVNode("small", null, "一张工单只设一个主办人,协同人只帮忙不抢责任")], -1)),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "主办人",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.ownerId,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.ownerId = $event),
												clearable: "",
												filterable: "",
												placeholder: "选择负责闭环的人",
												style: { "width": "100%" },
												onChange: _cache[16] || (_cache[16] = (v) => onPickStaff("owner", v))
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffList.value, (u) => {
													return openBlock(), createBlock(_component_el_option, {
														key: u.id,
														label: u.name,
														value: u.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "协同人" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.assistId,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.value.assistId = $event),
												clearable: "",
												filterable: "",
												placeholder: "可选,需要配合才填",
												style: { "width": "100%" },
												onChange: _cache[18] || (_cache[18] = (v) => onPickStaff("assist", v))
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffList.value, (u) => {
													return openBlock(), createBlock(_component_el_option, {
														key: u.id,
														label: u.name,
														value: u.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "紧急度",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.priority,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.value.priority = $event),
												style: { "width": "100%" },
												onChange: onPriorityChange
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PRIORITIES, (p) => {
													return createVNode(_component_el_option, {
														key: p.value,
														label: p.label,
														value: p.value
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "截止时间",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.value.deadline,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.value.deadline = $event),
												type: "datetime",
												placeholder: "必须给客户一个处理节点",
												"value-format": "YYYY-MM-DD HH:mm:ss",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})]),
									_: 1
								}),
								createBaseVNode("div", _hoisted_30, [
									_cache[70] || (_cache[70] = createBaseVNode("span", null, "快捷截止:", -1)),
									createVNode(_component_el_button, {
										size: "small",
										onClick: _cache[21] || (_cache[21] = ($event) => setQuickDeadline("today"))
									}, {
										default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("今天 18:00", -1)])]),
										_: 1
									}),
									createVNode(_component_el_button, {
										size: "small",
										onClick: _cache[22] || (_cache[22] = ($event) => setQuickDeadline("tomorrow"))
									}, {
										default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode("明天 12:00", -1)])]),
										_: 1
									}),
									createVNode(_component_el_button, {
										size: "small",
										onClick: _cache[23] || (_cache[23] = ($event) => setQuickDeadline("twoDays"))
									}, {
										default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("2 天内", -1)])]),
										_: 1
									}),
									createVNode(_component_el_button, {
										size: "small",
										onClick: _cache[24] || (_cache[24] = ($event) => setQuickDeadline("priority"))
									}, {
										default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("按紧急度", -1)])]),
										_: 1
									})
								]),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "升级关注" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_31, [createVNode(_component_el_switch, {
												modelValue: form.value.bossInvolved,
												"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => form.value.bossInvolved = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"]), _cache[71] || (_cache[71] = createBaseVNode("span", null, "P0、客户情绪强、影响续费时打开,用于管理层及时看见风险。", -1))])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "沉淀改进" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_32, [createVNode(_component_el_switch, {
												modelValue: form.value.needReview,
												"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => form.value.needReview = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"]), _cache[72] || (_cache[72] = createBaseVNode("span", null, "重复问题、流程缺口、客户体验问题,处理后沉淀为改进项。", -1))])]),
											_: 1
										})]),
										_: 1
									})]),
									_: 1
								})
							]),
							form.value.id ? (openBlock(), createElementBlock("section", _hoisted_33, [
								_cache[74] || (_cache[74] = createBaseVNode("div", { class: "ci-section-title" }, [createBaseVNode("span", null, "3. 结果与沉淀"), createBaseVNode("small", null, "完成时必须写客户已得到什么结果")], -1)),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "当前状态" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.status,
												"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => form.value.status = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUS, (s) => {
													return createVNode(_component_el_option, {
														key: s.value,
														label: s.label,
														value: s.value
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "处理结果" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.value.result,
										"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => form.value.result = $event),
										type: "textarea",
										rows: 3,
										maxlength: "2000",
										"show-word-limit": "",
										placeholder: "例如:已联系客户说明原因,补开发票并发送截图,客户确认满意。"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								form.value.needReview === 1 ? (openBlock(), createBlock(_component_el_form_item, {
									key: 0,
									label: "改进沉淀"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.value.reviewNote,
										"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => form.value.reviewNote = $event),
										type: "textarea",
										rows: 3,
										maxlength: "2000",
										"show-word-limit": "",
										placeholder: "写清以后怎么避免:话术、SOP、提醒、表单字段、质检点。"
									}, null, 8, ["modelValue"])]),
									_: 1
								})) : createCommentVNode("", true)
							])) : createCommentVNode("", true)
						]), _cache[75] || (_cache[75] = createBaseVNode("aside", { class: "ci-form-aside" }, [createBaseVNode("div", { class: "ci-playbook" }, [createBaseVNode("h4", null, "处理原则"), createBaseVNode("ul", null, [
							createBaseVNode("li", null, "先安抚客户,再查内部原因。"),
							createBaseVNode("li", null, "主办人只对客户结果负责,协同人按事项配合。"),
							createBaseVNode("li", null, "等客户时要写清等什么,不要让工单悬空。"),
							createBaseVNode("li", null, "完成不是“我处理了”,而是客户问题已闭环。")
						])]), createBaseVNode("div", { class: "ci-playbook" }, [
							createBaseVNode("h4", null, "SLA 建议"),
							createBaseVNode("div", { class: "ci-sla-rule" }, [createBaseVNode("strong", null, "P0"), createBaseVNode("span", null, "4 小时内给方案,必要时升级关注。")]),
							createBaseVNode("div", { class: "ci-sla-rule" }, [createBaseVNode("strong", null, "P1"), createBaseVNode("span", null, "24 小时内处理或明确下一步。")]),
							createBaseVNode("div", { class: "ci-sla-rule" }, [createBaseVNode("strong", null, "P2"), createBaseVNode("span", null, "3 天内闭环,避免拖成投诉。")])
						])], -1))]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: assignDlg.value.visible,
					"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => assignDlg.value.visible = $event),
					title: "调整主办人",
					width: "520px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[34] || (_cache[34] = ($event) => assignDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: assignDlg.value.saving,
						onClick: submitAssign
					}, {
						default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("确定调整", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [_cache[80] || (_cache[80] = createBaseVNode("div", { class: "ci-assign-tip" }, "主办人负责对客户闭环;协同人只代表需要配合的同事或部门。", -1)), createVNode(_component_el_form, { "label-width": "86px" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "主办人",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: assignDlg.value.ownerId,
								"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => assignDlg.value.ownerId = $event),
								clearable: "",
								filterable: "",
								placeholder: "选择负责闭环的人",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffList.value, (u) => {
									return openBlock(), createBlock(_component_el_option, {
										key: u.id,
										label: u.name,
										value: u.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "协同人" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: assignDlg.value.assistId,
								"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => assignDlg.value.assistId = $event),
								clearable: "",
								filterable: "",
								placeholder: "可选",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffList.value, (u) => {
									return openBlock(), createBlock(_component_el_option, {
										key: u.id,
										label: u.name,
										value: u.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: detail.value.visible,
					"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => detail.value.visible = $event),
					title: ((_detail$value$issue = detail.value.issue) === null || _detail$value$issue === void 0 ? void 0 : _detail$value$issue.issueNo) || "工单详情",
					size: "620px",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [detail.value.issue ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createBaseVNode("div", _hoisted_34, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_35, toDisplayString(detail.value.issue.customerName || "未填写客户"), 1), createBaseVNode("p", null, toDisplayString(detail.value.issue.description || "暂无问题描述"), 1)]), createVNode(_component_el_tag, {
							type: statusTag(detail.value.issue.status),
							size: "large"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(labelOf(STATUS, detail.value.issue.status)), 1)]),
							_: 1
						}, 8, ["type"])]),
						createBaseVNode("div", _hoisted_36, [_cache[81] || (_cache[81] = createBaseVNode("strong", null, "下一步", -1)), createBaseVNode("span", null, toDisplayString(nextAction(detail.value.issue)), 1)]),
						detail.value.issue.status !== "completed" && detail.value.issue.status !== "closed" ? (openBlock(), createElementBlock("div", _hoisted_37, [
							detail.value.issue.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "success",
								onClick: _cache[36] || (_cache[36] = ($event) => quickStatus(detail.value.issue, "processing"))
							}, {
								default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("开始处理", -1)])]),
								_: 1
							})) : createCommentVNode("", true),
							detail.value.issue.status === "processing" ? (openBlock(), createBlock(_component_el_button, {
								key: 1,
								type: "warning",
								onClick: _cache[37] || (_cache[37] = ($event) => quickStatus(detail.value.issue, "waiting"))
							}, {
								default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("等客户反馈", -1)])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_button, {
								type: "success",
								onClick: _cache[38] || (_cache[38] = ($event) => completeIssue(detail.value.issue))
							}, {
								default: withCtx(() => [..._cache[84] || (_cache[84] = [createTextVNode("填写结果并完成", -1)])]),
								_: 1
							})
						])) : createCommentVNode("", true),
						createVNode(_component_el_descriptions, {
							column: 2,
							border: "",
							size: "small"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_descriptions_item, { label: "主办人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.ownerName || "待指定"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "协同人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.assistName || "无"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "紧急度" }, {
									default: withCtx(() => [createVNode(_component_el_tag, {
										type: prioTag(detail.value.issue.priority),
										size: "small",
										effect: "dark"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(labelOf(PRIORITIES, detail.value.issue.priority)), 1)]),
										_: 1
									}, 8, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "截止时间" }, {
									default: withCtx(() => [createBaseVNode("span", { class: normalizeClass({ "is-overdue": isOverdue(detail.value.issue) }) }, toDisplayString(fmtTime(detail.value.issue.deadline)), 3)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "来源" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(labelOf(SOURCES, detail.value.issue.source)), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "类型" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(labelOf(ISSUE_TYPES, detail.value.issue.issueType)), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "升级关注" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.bossInvolved === 1 ? "是" : "否"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "沉淀改进" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.needReview === 1 ? "是" : "否"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "处理结果",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.result || "未完成"), 1)]),
									_: 1
								}),
								detail.value.issue.needReview === 1 ? (openBlock(), createBlock(_component_el_descriptions_item, {
									key: 0,
									label: "改进沉淀",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(detail.value.issue.reviewNote || "待补充"), 1)]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							_: 1
						}),
						_cache[85] || (_cache[85] = createBaseVNode("h4", { class: "ci-tl-title" }, "进展记录", -1)),
						detail.value.logs.length ? (openBlock(), createBlock(_component_el_timeline, { key: 1 }, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(detail.value.logs, (lg) => {
								return openBlock(), createBlock(_component_el_timeline_item, {
									key: lg.id,
									timestamp: fmtTime(lg.createTime),
									placement: "top"
								}, {
									default: withCtx(() => [
										createBaseVNode("span", _hoisted_38, toDisplayString(lg.operatorName || "系统"), 1),
										createTextVNode(" " + toDisplayString(actionLabel(lg)) + " ", 1),
										lg.remark ? (openBlock(), createElementBlock("span", _hoisted_39, " - " + toDisplayString(lg.remark), 1)) : createCommentVNode("", true)
									]),
									_: 2
								}, 1032, ["timestamp"]);
							}), 128))]),
							_: 1
						})) : (openBlock(), createBlock(_component_el_empty, {
							key: 2,
							description: "暂无进展记录",
							"image-size": 60
						}))
					], 64)) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-034c3a6e"]]);
//#endregion
export { customer_issue_default as default };

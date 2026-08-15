import { $ as createCommentVNode, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, ht as mergeProps, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Bn as refresh_default, C as ElResult, Ct as arrow_left_default, D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, Nn as plus_default, Q as ElRadioGroup, Un as search_default, V as ElDialog, W as ElDatePicker, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, f as ElTimeline, g as ElTable, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, pr as user_filled_default, rt as ElSelect, s as vLoading, tt as ElCard, u as ElTreeSelect, ur as upload_default, vt as ElAlert, wt as arrow_right_default, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi, r as postApi, t as deptApi } from "./org-DaVetSL-.js";
import { u as resignHandoverApi } from "./hrm-x4tssCAy.js";
import { n as downloadFileById } from "./download-DmWzpvAG.js";
//#region src/views/hrm/resigned-staff.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "offboarding-center" };
var _hoisted_2 = { class: "page-head" };
var _hoisted_3 = { class: "head-copy" };
var _hoisted_4 = { class: "title-row" };
var _hoisted_5 = { class: "title-icon" };
var _hoisted_6 = { class: "head-actions" };
var _hoisted_7 = {
	key: 0,
	class: "data-error-banner",
	role: "alert"
};
var _hoisted_8 = {
	class: "summary-grid",
	"aria-label": "离职交接汇总"
};
var _hoisted_9 = { class: "summary-card is-neutral" };
var _hoisted_10 = { class: "summary-card is-warning" };
var _hoisted_11 = { class: "summary-card is-danger" };
var _hoisted_12 = { class: "summary-card is-danger-soft" };
var _hoisted_13 = { class: "summary-card is-success" };
var _hoisted_14 = { class: "matrix-title" };
var _hoisted_15 = { class: "desktop-matrix" };
var _hoisted_16 = { class: "employee-cell" };
var _hoisted_17 = { class: "employee-avatar" };
var _hoisted_18 = { class: "domain-head" };
var _hoisted_19 = { class: "risk-cell" };
var _hoisted_20 = { key: 0 };
var _hoisted_21 = { class: "mobile-matrix" };
var _hoisted_22 = ["onClick"];
var _hoisted_23 = { class: "staff-card-head" };
var _hoisted_24 = { class: "employee-cell" };
var _hoisted_25 = { class: "employee-avatar" };
var _hoisted_26 = { class: "mobile-domain-grid" };
var _hoisted_27 = { class: "staff-card-foot" };
var _hoisted_28 = {
	key: 0,
	class: "pager"
};
var _hoisted_29 = { class: "drawer-heading" };
var _hoisted_30 = { class: "employee-avatar is-large" };
var _hoisted_31 = { class: "drawer-body" };
var _hoisted_32 = { class: "drawer-state-row" };
var _hoisted_33 = { class: "drawer-domain-grid" };
var _hoisted_34 = { class: "domain-box system-domain" };
var _hoisted_35 = { class: "two-column" };
var _hoisted_36 = { class: "manual-editor-grid" };
var _hoisted_37 = { class: "sop-actions" };
var _hoisted_38 = { key: 0 };
var _hoisted_39 = { class: "drawer-footer" };
var _hoisted_40 = { class: "two-column" };
var _hoisted_41 = { class: "two-column" };
//#endregion
//#region src/views/hrm/resigned-staff.vue
var resigned_staff_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "resigned-staff",
	setup(__props) {
		const router = useRouter();
		const manualDomains = [
			{
				key: "customerCheckStatus",
				label: "客户"
			},
			{
				key: "taskCheckStatus",
				label: "任务"
			},
			{
				key: "documentCheckStatus",
				label: "资料"
			},
			{
				key: "assetCheckStatus",
				label: "资产"
			},
			{
				key: "settlementCheckStatus",
				label: "结算"
			}
		];
		const checkOptions = [
			{
				value: 0,
				label: "待确认"
			},
			{
				value: 1,
				label: "处理中"
			},
			{
				value: 2,
				label: "已完成"
			},
			{
				value: 3,
				label: "异常"
			}
		];
		const handoverOptions = [
			{
				value: 0,
				label: "待交接"
			},
			{
				value: 1,
				label: "交接中"
			},
			{
				value: 2,
				label: "已闭环"
			}
		];
		const loading = ref(false);
		const centerError = ref(false);
		const summaryError = ref(false);
		const hasDataError = computed(() => centerError.value || summaryError.value);
		const rows = ref([]);
		const total = ref(0);
		const summary = reactive({
			total: 0,
			inProgress: 0,
			riskCount: 0,
			accountRiskCount: 0,
			closedCount: 0
		});
		const deptTree = ref([]);
		const postList = ref([]);
		const colleagues = ref([]);
		const query = reactive({
			pageNum: 1,
			pageSize: 20
		});
		const detailVisible = ref(false);
		const detailLoading = ref(false);
		const detail = ref();
		const detailTargetId = ref();
		let detailRequestId = 0;
		let sopUploadRequestId = 0;
		const saving = ref(false);
		const uploading = ref(false);
		const sopName = ref("");
		const emptyHandover = (employeeId = 0) => ({
			id: void 0,
			recordVersion: void 0,
			employeeId,
			handoverDate: void 0,
			handoverToEmployeeId: void 0,
			sopFileId: void 0,
			clearSopFile: false,
			items: void 0,
			status: 0,
			remark: void 0,
			customerCheckStatus: 0,
			taskCheckStatus: 0,
			documentCheckStatus: 0,
			assetCheckStatus: 0,
			settlementCheckStatus: 0
		});
		const handoverForm = reactive(emptyHandover());
		const historyVisible = ref(false);
		const historySaving = ref(false);
		const historyForm = reactive({ name: "" });
		function avatarText(name) {
			return String(name || "离").trim().slice(0, 1);
		}
		function disableFutureDate(date) {
			const today = /* @__PURE__ */ new Date();
			today.setHours(23, 59, 59, 999);
			return date.getTime() > today.getTime();
		}
		function accountMeta(status) {
			if (status === 0) return {
				label: "仍可登录",
				type: "danger",
				tone: "danger"
			};
			if (status === 1) return {
				label: "已停用",
				type: "success",
				tone: "success"
			};
			if (status === 3) return {
				label: "关联异常",
				type: "danger",
				tone: "danger"
			};
			return {
				label: "未开通",
				type: "info",
				tone: "neutral"
			};
		}
		function checkMeta(status) {
			return {
				0: {
					label: "待确认",
					type: "info",
					tone: "neutral"
				},
				1: {
					label: "处理中",
					type: "warning",
					tone: "warning"
				},
				2: {
					label: "已完成",
					type: "success",
					tone: "success"
				},
				3: {
					label: "异常",
					type: "danger",
					tone: "danger"
				}
			}[status !== null && status !== void 0 ? status : 0];
		}
		function handoverMeta(status) {
			if (status === 2) return {
				label: "已闭环",
				type: "success"
			};
			if (status === 1) return {
				label: "交接中",
				type: "warning"
			};
			return {
				label: "待交接",
				type: "info"
			};
		}
		function riskMeta(row) {
			const level = String(row.riskLevel || "").toLowerCase();
			if (row.accountStatus === 0 || [
				"high",
				"高",
				"高风险"
			].includes(level)) return {
				label: "高风险",
				type: "danger"
			};
			if ([
				"medium",
				"中",
				"中风险"
			].includes(level)) return {
				label: "中风险",
				type: "warning"
			};
			if (!row.riskCount || row.status === 2 || [
				"closed",
				"safe",
				"已闭环"
			].includes(level)) return {
				label: "已闭环",
				type: "success"
			};
			return {
				label: "低风险",
				type: "info"
			};
		}
		function timelineType(type) {
			const value = String(type || "").toLowerCase();
			if (value.includes("resign") || value.includes("离职")) return "danger";
			if (value.includes("complete") || value.includes("closed") || value.includes("完成")) return "success";
			if (value.includes("handover") || value.includes("交接")) return "warning";
			return "primary";
		}
		function loadCenter() {
			return _loadCenter.apply(this, arguments);
		}
		function _loadCenter() {
			_loadCenter = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const res = yield resignHandoverApi.center({
						pageNum: query.pageNum,
						pageSize: query.pageSize,
						name: query.name || void 0,
						deptId: query.deptId,
						status: query.status,
						riskOnly: query.riskOnly || void 0
					});
					const page = (res === null || res === void 0 ? void 0 : res.data) || {};
					rows.value = page.records || [];
					total.value = Number(page.total || 0);
					centerError.value = false;
				} catch (_unused) {
					centerError.value = true;
				} finally {
					loading.value = false;
				}
			});
			return _loadCenter.apply(this, arguments);
		}
		function loadSummary() {
			return _loadSummary.apply(this, arguments);
		}
		function _loadSummary() {
			_loadSummary = _asyncToGenerator(function* () {
				try {
					const res = yield resignHandoverApi.summary();
					const data = (res === null || res === void 0 ? void 0 : res.data) || {};
					summary.total = Number(data.total || 0);
					summary.inProgress = Number(data.inProgress || 0);
					summary.riskCount = Number(data.riskCount || 0);
					summary.accountRiskCount = Number(data.accountRiskCount || 0);
					summary.closedCount = Number(data.closedCount || 0);
					summaryError.value = false;
				} catch (_unused2) {
					summaryError.value = true;
				}
			});
			return _loadSummary.apply(this, arguments);
		}
		function loadAll() {
			return _loadAll.apply(this, arguments);
		}
		function _loadAll() {
			_loadAll = _asyncToGenerator(function* () {
				yield Promise.all([loadCenter(), loadSummary()]);
			});
			return _loadAll.apply(this, arguments);
		}
		function search() {
			query.pageNum = 1;
			loadCenter();
		}
		function reset() {
			Object.assign(query, {
				pageNum: 1,
				pageSize: query.pageSize,
				name: void 0,
				deptId: void 0,
				status: void 0,
				riskOnly: void 0
			});
			loadCenter();
		}
		function handleSizeChange() {
			query.pageNum = 1;
			loadCenter();
		}
		function loadOptions() {
			return _loadOptions.apply(this, arguments);
		}
		function _loadOptions() {
			_loadOptions = _asyncToGenerator(function* () {
				var _deptResult$value, _postResult$value, _employeeResult$value;
				const [deptResult, postResult, employeeResult] = yield Promise.allSettled([
					deptApi.tree(),
					postApi.all(),
					employeeApi.roster()
				]);
				deptTree.value = deptResult.status === "fulfilled" ? ((_deptResult$value = deptResult.value) === null || _deptResult$value === void 0 ? void 0 : _deptResult$value.data) || [] : [];
				postList.value = postResult.status === "fulfilled" ? ((_postResult$value = postResult.value) === null || _postResult$value === void 0 ? void 0 : _postResult$value.data) || [] : [];
				colleagues.value = (employeeResult.status === "fulfilled" ? ((_employeeResult$value = employeeResult.value) === null || _employeeResult$value === void 0 ? void 0 : _employeeResult$value.data) || [] : []).filter((employee) => employee.status === 1 || employee.status === 2);
			});
			return _loadOptions.apply(this, arguments);
		}
		function fillHandoverForm(detailData) {
			var _detailData$handovers, _detailData$handovers2, _ref, _latest$status, _ref2, _latest$customerCheck, _ref3, _latest$taskCheckStat, _ref4, _latest$documentCheck, _ref5, _latest$assetCheckSta, _ref6, _latest$settlementChe;
			const employee = detailData.employee;
			const latest = ((_detailData$handovers = detailData.handovers) === null || _detailData$handovers === void 0 ? void 0 : _detailData$handovers.find((record) => String(record.id || "") === String(employee.handoverId || ""))) || ((_detailData$handovers2 = detailData.handovers) === null || _detailData$handovers2 === void 0 ? void 0 : _detailData$handovers2[0]);
			replaceHandoverForm({
				id: (latest === null || latest === void 0 ? void 0 : latest.id) || employee.handoverId,
				recordVersion: latest === null || latest === void 0 ? void 0 : latest.recordVersion,
				employeeId: employee.employeeId,
				handoverDate: (latest === null || latest === void 0 ? void 0 : latest.handoverDate) || employee.handoverDate,
				handoverToEmployeeId: (latest === null || latest === void 0 ? void 0 : latest.handoverToEmployeeId) || employee.handoverToEmployeeId,
				sopFileId: latest === null || latest === void 0 ? void 0 : latest.sopFileId,
				clearSopFile: false,
				items: latest === null || latest === void 0 ? void 0 : latest.items,
				status: (_ref = (_latest$status = latest === null || latest === void 0 ? void 0 : latest.status) !== null && _latest$status !== void 0 ? _latest$status : employee.status) !== null && _ref !== void 0 ? _ref : 0,
				remark: latest === null || latest === void 0 ? void 0 : latest.remark,
				customerCheckStatus: (_ref2 = (_latest$customerCheck = latest === null || latest === void 0 ? void 0 : latest.customerCheckStatus) !== null && _latest$customerCheck !== void 0 ? _latest$customerCheck : employee.customerCheckStatus) !== null && _ref2 !== void 0 ? _ref2 : 0,
				taskCheckStatus: (_ref3 = (_latest$taskCheckStat = latest === null || latest === void 0 ? void 0 : latest.taskCheckStatus) !== null && _latest$taskCheckStat !== void 0 ? _latest$taskCheckStat : employee.taskCheckStatus) !== null && _ref3 !== void 0 ? _ref3 : 0,
				documentCheckStatus: (_ref4 = (_latest$documentCheck = latest === null || latest === void 0 ? void 0 : latest.documentCheckStatus) !== null && _latest$documentCheck !== void 0 ? _latest$documentCheck : employee.documentCheckStatus) !== null && _ref4 !== void 0 ? _ref4 : 0,
				assetCheckStatus: (_ref5 = (_latest$assetCheckSta = latest === null || latest === void 0 ? void 0 : latest.assetCheckStatus) !== null && _latest$assetCheckSta !== void 0 ? _latest$assetCheckSta : employee.assetCheckStatus) !== null && _ref5 !== void 0 ? _ref5 : 0,
				settlementCheckStatus: (_ref6 = (_latest$settlementChe = latest === null || latest === void 0 ? void 0 : latest.settlementCheckStatus) !== null && _latest$settlementChe !== void 0 ? _latest$settlementChe : employee.settlementCheckStatus) !== null && _ref6 !== void 0 ? _ref6 : 0
			});
			sopName.value = handoverForm.sopFileId ? "已上传 SOP 附件" : "";
		}
		function replaceHandoverForm(next) {
			for (const key of Object.keys(handoverForm)) delete handoverForm[key];
			Object.assign(handoverForm, emptyHandover(next.employeeId), next);
		}
		function loadDetail(_x) {
			return _loadDetail.apply(this, arguments);
		}
		function _loadDetail() {
			_loadDetail = _asyncToGenerator(function* (employeeId) {
				const requestId = ++detailRequestId;
				detailLoading.value = true;
				try {
					const res = yield resignHandoverApi.centerDetail(employeeId);
					if (requestId !== detailRequestId || detailTargetId.value !== employeeId) return;
					detail.value = res === null || res === void 0 ? void 0 : res.data;
					if (detail.value) fillHandoverForm(detail.value);
				} catch (_unused3) {
					if (requestId !== detailRequestId || detailTargetId.value !== employeeId) return;
					detail.value = void 0;
					replaceHandoverForm(emptyHandover(employeeId));
					sopName.value = "";
				} finally {
					if (requestId === detailRequestId && detailTargetId.value === employeeId) detailLoading.value = false;
				}
			});
			return _loadDetail.apply(this, arguments);
		}
		function openDetail(row) {
			sopUploadRequestId++;
			uploading.value = false;
			detailVisible.value = true;
			detail.value = void 0;
			detailTargetId.value = row.employeeId;
			replaceHandoverForm(emptyHandover(row.employeeId));
			sopName.value = "";
			loadDetail(row.employeeId);
		}
		function uploadSop(_x2) {
			return _uploadSop.apply(this, arguments);
		}
		function _uploadSop() {
			_uploadSop = _asyncToGenerator(function* (file) {
				const requestId = ++sopUploadRequestId;
				const employeeId = handoverForm.employeeId;
				uploading.value = true;
				try {
					const res = yield resignHandoverApi.uploadSop(file);
					if (requestId !== sopUploadRequestId || detailTargetId.value !== employeeId || handoverForm.employeeId !== employeeId) return false;
					const data = (res === null || res === void 0 ? void 0 : res.data) || {};
					if (!data.id) throw new Error("上传结果缺少文件编号");
					handoverForm.sopFileId = data.id;
					handoverForm.clearSopFile = false;
					sopName.value = data.originalName || data.fileName || file.name;
					ElMessage.success("SOP 附件上传成功");
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "SOP 附件上传失败");
				} finally {
					if (requestId === sopUploadRequestId) uploading.value = false;
				}
				return false;
			});
			return _uploadSop.apply(this, arguments);
		}
		function clearSop() {
			handoverForm.sopFileId = void 0;
			handoverForm.clearSopFile = true;
			sopName.value = "";
		}
		function downloadSop() {
			return _downloadSop.apply(this, arguments);
		}
		function _downloadSop() {
			_downloadSop = _asyncToGenerator(function* () {
				if (handoverForm.sopFileId) yield downloadFileById(handoverForm.sopFileId, sopName.value || void 0);
			});
			return _downloadSop.apply(this, arguments);
		}
		function saveHandover() {
			return _saveHandover.apply(this, arguments);
		}
		function _saveHandover() {
			_saveHandover = _asyncToGenerator(function* () {
				if (!handoverForm.employeeId) return ElMessage.warning("缺少离职员工信息");
				if (uploading.value) return ElMessage.warning("附件仍在上传，请稍候再保存");
				if ((handoverForm.status || 0) > 0 && !handoverForm.handoverToEmployeeId) return ElMessage.warning("交接开始后必须选择接收人");
				saving.value = true;
				try {
					const payload = {
						id: handoverForm.id,
						recordVersion: handoverForm.recordVersion,
						employeeId: handoverForm.employeeId,
						handoverDate: handoverForm.handoverDate,
						handoverToEmployeeId: handoverForm.handoverToEmployeeId,
						sopFileId: handoverForm.sopFileId,
						clearSopFile: Boolean(handoverForm.clearSopFile),
						items: handoverForm.items,
						status: handoverForm.status,
						remark: handoverForm.remark,
						customerCheckStatus: handoverForm.customerCheckStatus,
						taskCheckStatus: handoverForm.taskCheckStatus,
						documentCheckStatus: handoverForm.documentCheckStatus,
						assetCheckStatus: handoverForm.assetCheckStatus,
						settlementCheckStatus: handoverForm.settlementCheckStatus
					};
					yield resignHandoverApi.save(payload);
					ElMessage.success("离职交接已保存");
					yield Promise.all([
						loadCenter(),
						loadSummary(),
						loadDetail(handoverForm.employeeId)
					]);
				} finally {
					saving.value = false;
				}
			});
			return _saveHandover.apply(this, arguments);
		}
		function resetHistoryForm() {
			Object.assign(historyForm, {
				name: "",
				deptId: void 0,
				postId: void 0,
				hireDate: void 0,
				resignDate: void 0,
				remark: void 0
			});
		}
		function openHistoryDialog() {
			if (hasDataError.value) {
				ElMessage.error("离职数据尚未完整加载，请先重新加载后再补录");
				return;
			}
			resetHistoryForm();
			historyVisible.value = true;
		}
		function submitHistory() {
			return _submitHistory.apply(this, arguments);
		}
		function _submitHistory() {
			_submitHistory = _asyncToGenerator(function* () {
				if (!historyForm.name.trim()) return ElMessage.warning("请输入员工姓名");
				if (!historyForm.deptId) return ElMessage.warning("请选择原部门");
				if (!historyForm.postId) return ElMessage.warning("请选择原岗位");
				if (!historyForm.resignDate) return ElMessage.warning("请选择真实离职日期");
				if (disableFutureDate(/* @__PURE__ */ new Date(`${historyForm.resignDate}T00:00:00`))) return ElMessage.warning("离职日期不能晚于今天");
				if (historyForm.hireDate && historyForm.hireDate > historyForm.resignDate) return ElMessage.warning("入职日期不能晚于离职日期");
				historySaving.value = true;
				try {
					yield employeeApi.create({
						name: historyForm.name.trim(),
						deptId: historyForm.deptId,
						postId: historyForm.postId,
						hireDate: historyForm.hireDate,
						resignDate: historyForm.resignDate,
						remark: historyForm.remark,
						status: 3,
						accountEnabled: false
					});
					ElMessage.success("历史离职员工已补录");
					historyVisible.value = false;
					yield loadAll();
				} finally {
					historySaving.value = false;
				}
			});
			return _submitHistory.apply(this, arguments);
		}
		onMounted(() => {
			loadAll();
			loadOptions();
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_icon = ElIcon;
			const _component_el_alert = ElAlert;
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
			const _component_el_divider = ElDivider;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_upload = ElUpload;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_result = ElResult;
			const _component_el_drawer = ElDrawer;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
					class: "back-button",
					icon: unref(arrow_left_default),
					link: "",
					onClick: _cache[0] || (_cache[0] = ($event) => unref(router).push("/sys-org/employee"))
				}, {
					default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode(" 返回员工与账号 ", -1)])]),
					_: 1
				}, 8, ["icon"]), createBaseVNode("div", _hoisted_4, [createBaseVNode("span", _hoisted_5, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(user_filled_default))]),
					_: 1
				})]), _cache[30] || (_cache[30] = createBaseVNode("div", null, [createBaseVNode("h2", null, "离职人员中心"), createBaseVNode("p", null, "统一查看离职档案、账号停用和交接闭环，历史业务记录继续保留。")], -1))])]), createBaseVNode("div", _hoisted_6, [createVNode(_component_el_button, {
					icon: unref(refresh_default),
					loading: unref(loading),
					onClick: loadAll
				}, {
					default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("刷新", -1)])]),
					_: 1
				}, 8, ["icon", "loading"]), createVNode(_component_el_button, {
					type: "primary",
					icon: unref(plus_default),
					disabled: unref(hasDataError),
					onClick: openHistoryDialog
				}, {
					default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("补录历史离职", -1)])]),
					_: 1
				}, 8, ["icon", "disabled"])])]),
				createVNode(_component_el_alert, {
					class: "truth-alert",
					type: "info",
					closable: false,
					"show-icon": ""
				}, {
					title: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode(" 账号状态由系统实时校验；客户、任务、资料、资产、结算为人工确认项，请负责人核实后更新，页面不会把人工结果伪装成系统自动统计。 ", -1)])]),
					_: 1
				}),
				unref(hasDataError) ? (openBlock(), createElementBlock("div", _hoisted_7, [_cache[35] || (_cache[35] = createBaseVNode("div", null, [createBaseVNode("strong", null, "离职数据暂时无法完整读取"), createBaseVNode("span", null, "当前数字和列表不可作为判断依据，已暂停历史补录，避免误判或重复建档。")], -1)), createVNode(_component_el_button, {
					type: "danger",
					plain: "",
					loading: unref(loading),
					onClick: loadAll
				}, {
					default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("重新加载", -1)])]),
					_: 1
				}, 8, ["loading"])])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_8, [
					createBaseVNode("article", _hoisted_9, [
						_cache[36] || (_cache[36] = createBaseVNode("span", { class: "summary-label" }, "离职总人数", -1)),
						createBaseVNode("strong", null, toDisplayString(unref(summaryError) ? "—" : unref(summary).total), 1),
						_cache[37] || (_cache[37] = createBaseVNode("small", null, "历史档案完整保留", -1))
					]),
					createBaseVNode("article", _hoisted_10, [
						_cache[38] || (_cache[38] = createBaseVNode("span", { class: "summary-label" }, "交接进行中", -1)),
						createBaseVNode("strong", null, toDisplayString(unref(summaryError) ? "—" : unref(summary).inProgress), 1),
						_cache[39] || (_cache[39] = createBaseVNode("small", null, "需要继续跟进", -1))
					]),
					createBaseVNode("article", _hoisted_11, [
						_cache[40] || (_cache[40] = createBaseVNode("span", { class: "summary-label" }, "存在风险", -1)),
						createBaseVNode("strong", null, toDisplayString(unref(summaryError) ? "—" : unref(summary).riskCount), 1),
						_cache[41] || (_cache[41] = createBaseVNode("small", null, "任一域尚未闭环", -1))
					]),
					createBaseVNode("article", _hoisted_12, [
						_cache[42] || (_cache[42] = createBaseVNode("span", { class: "summary-label" }, "账号安全风险", -1)),
						createBaseVNode("strong", null, toDisplayString(unref(summaryError) ? "—" : unref(summary).accountRiskCount), 1),
						_cache[43] || (_cache[43] = createBaseVNode("small", null, "仍可登录或账号关联异常", -1))
					]),
					createBaseVNode("article", _hoisted_13, [
						_cache[44] || (_cache[44] = createBaseVNode("span", { class: "summary-label" }, "已闭环", -1)),
						createBaseVNode("strong", null, toDisplayString(unref(summaryError) ? "—" : unref(summary).closedCount), 1),
						_cache[45] || (_cache[45] = createBaseVNode("small", null, "六域全部完成", -1))
					])
				]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "filter-card"
				}, {
					default: withCtx(() => [createVNode(_component_el_form, {
						inline: true,
						class: "filter-form",
						onSubmit: _cache[5] || (_cache[5] = withModifiers(() => {}, ["prevent"]))
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "员工姓名" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(query).name,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(query).name = $event),
									clearable: "",
									placeholder: "输入员工姓名",
									onKeyup: withKeys(search, ["enter"]),
									onClear: search
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "原部门" }, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: unref(query).deptId,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(query).deptId = $event),
									data: unref(deptTree),
									props: {
										label: "deptName",
										children: "children",
										value: "id"
									},
									"check-strictly": "",
									clearable: "",
									placeholder: "全部部门"
								}, null, 8, ["modelValue", "data"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "交接状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(query).status,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(query).status = $event),
									clearable: "",
									placeholder: "全部状态"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "待登记 / 待交接",
											value: 0
										}),
										createVNode(_component_el_option, {
											label: "交接中",
											value: 1
										}),
										createVNode(_component_el_option, {
											label: "已闭环",
											value: 2
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "风险情况" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(query).riskOnly,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(query).riskOnly = $event),
									clearable: "",
									placeholder: "全部人员"
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: "仅看存在风险",
										value: true
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { class: "filter-actions" }, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									icon: unref(search_default),
									onClick: search
								}, {
									default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("查询", -1)])]),
									_: 1
								}, 8, ["icon"]), createVNode(_component_el_button, { onClick: reset }, {
									default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("重置", -1)])]),
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
					class: "matrix-card"
				}, {
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_14, [_cache[48] || (_cache[48] = createBaseVNode("div", null, [createBaseVNode("h3", null, "六域离职风险矩阵"), createBaseVNode("p", null, "账号为系统状态，其余五域均需人工确认。")], -1)), createBaseVNode("span", null, "共 " + toDisplayString(unref(total)) + " 人", 1)]),
						createBaseVNode("div", _hoisted_15, [withDirectives((openBlock(), createBlock(_component_el_table, {
							data: unref(rows),
							"row-key": "employeeId",
							border: ""
						}, {
							empty: withCtx(() => [createVNode(_component_el_empty, {
								description: "暂无符合条件的离职人员",
								"image-size": 86
							}, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									plain: "",
									onClick: openHistoryDialog
								}, {
									default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("补录历史离职", -1)])]),
									_: 1
								})]),
								_: 1
							})]),
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									label: "离职员工",
									fixed: "",
									"min-width": "184"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_16, [createBaseVNode("span", _hoisted_17, toDisplayString(avatarText(row.name)), 1), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(row.name || "未命名员工"), 1), createBaseVNode("small", null, toDisplayString(row.empCode || "无工号") + " · " + toDisplayString(row.deptName || "未分部门"), 1)])])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "离职日期",
									"min-width": "112",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.resignDate || "未记录"), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									"min-width": "118",
									align: "center"
								}, {
									header: withCtx(() => [..._cache[49] || (_cache[49] = [createBaseVNode("div", { class: "domain-head" }, [createBaseVNode("b", null, "账号"), createBaseVNode("small", null, "系统校验")], -1)])]),
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										type: accountMeta(row.accountStatus).type,
										size: "small",
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(accountMeta(row.accountStatus).label), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								(openBlock(), createElementBlock(Fragment, null, renderList(manualDomains, (domain) => {
									return createVNode(_component_el_table_column, {
										key: domain.key,
										"min-width": "112",
										align: "center"
									}, {
										header: withCtx(() => [createBaseVNode("div", _hoisted_18, [createBaseVNode("b", null, toDisplayString(domain.label), 1), _cache[50] || (_cache[50] = createBaseVNode("small", null, "人工确认", -1))])]),
										default: withCtx(({ row }) => [createVNode(_component_el_tag, {
											type: checkMeta(row[domain.key]).type,
											size: "small",
											effect: "plain"
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(checkMeta(row[domain.key]).label), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 2
									}, 1024);
								}), 64)),
								createVNode(_component_el_table_column, {
									label: "风险",
									"min-width": "112",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_19, [createVNode(_component_el_tag, {
										type: riskMeta(row).type,
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(riskMeta(row).label), 1)]),
										_: 2
									}, 1032, ["type"]), row.riskCount ? (openBlock(), createElementBlock("small", _hoisted_20, toDisplayString(row.riskCount) + " 项待处理", 1)) : createCommentVNode("", true)])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "交接状态",
									"min-width": "112",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										type: handoverMeta(row.status).type,
										size: "small",
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(handoverMeta(row.status).label), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "操作",
									width: "92",
									align: "center",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => openDetail(row)
									}, {
										default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("查看详情", -1)])]),
										_: 1
									}, 8, ["onClick"])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["data"])), [[_directive_loading, unref(loading)]])]),
						withDirectives((openBlock(), createElementBlock("div", _hoisted_21, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(rows), (row) => {
							return openBlock(), createElementBlock("article", {
								key: row.employeeId,
								class: "staff-card",
								onClick: ($event) => openDetail(row)
							}, [
								createBaseVNode("div", _hoisted_23, [createBaseVNode("div", _hoisted_24, [createBaseVNode("span", _hoisted_25, toDisplayString(avatarText(row.name)), 1), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(row.name || "未命名员工"), 1), createBaseVNode("small", null, toDisplayString(row.deptName || "未分部门") + " · 离职 " + toDisplayString(row.resignDate || "未记录"), 1)])]), createVNode(_component_el_tag, {
									type: riskMeta(row).type,
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(riskMeta(row).label), 1)]),
									_: 2
								}, 1032, ["type"])]),
								createBaseVNode("div", _hoisted_26, [createBaseVNode("div", null, [_cache[53] || (_cache[53] = createBaseVNode("span", null, "账号", -1)), createBaseVNode("b", { class: normalizeClass(`state-${accountMeta(row.accountStatus).tone}`) }, toDisplayString(accountMeta(row.accountStatus).label), 3)]), (openBlock(), createElementBlock(Fragment, null, renderList(manualDomains, (domain) => {
									return createBaseVNode("div", { key: domain.key }, [createBaseVNode("span", null, [createTextVNode(toDisplayString(domain.label), 1), _cache[54] || (_cache[54] = createBaseVNode("em", null, "人工", -1))]), createBaseVNode("b", { class: normalizeClass(`state-${checkMeta(row[domain.key]).tone}`) }, toDisplayString(checkMeta(row[domain.key]).label), 3)]);
								}), 64))]),
								createBaseVNode("div", _hoisted_27, [createBaseVNode("span", null, toDisplayString(handoverMeta(row.status).label), 1), createVNode(_component_el_button, {
									link: "",
									type: "primary"
								}, {
									default: withCtx(() => [_cache[55] || (_cache[55] = createTextVNode("详情与更新 ", -1)), createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(arrow_right_default))]),
										_: 1
									})]),
									_: 1
								})])
							], 8, _hoisted_22);
						}), 128)), !unref(rows).length && !unref(loading) && !unref(centerError) ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "暂无符合条件的离职人员",
							"image-size": 72
						})) : createCommentVNode("", true)])), [[_directive_loading, unref(loading)]]),
						unref(total) > 0 ? (openBlock(), createElementBlock("div", _hoisted_28, [createVNode(_component_el_pagination, {
							"current-page": unref(query).pageNum,
							"onUpdate:currentPage": _cache[6] || (_cache[6] = ($event) => unref(query).pageNum = $event),
							"page-size": unref(query).pageSize,
							"onUpdate:pageSize": _cache[7] || (_cache[7] = ($event) => unref(query).pageSize = $event),
							background: "",
							layout: "total, sizes, prev, pager, next",
							total: unref(total),
							"page-sizes": [
								10,
								20,
								50,
								100
							],
							onCurrentChange: loadCenter,
							onSizeChange: handleSizeChange
						}, null, 8, [
							"current-page",
							"page-size",
							"total"
						])])) : createCommentVNode("", true)
					]),
					_: 1
				}),
				createVNode(_component_el_drawer, {
					modelValue: unref(detailVisible),
					"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => isRef(detailVisible) ? detailVisible.value = $event : null),
					class: "detail-drawer",
					size: "min(760px, 100%)",
					"destroy-on-close": ""
				}, {
					header: withCtx(() => {
						var _unref2, _unref3, _unref4, _unref5, _unref6;
						return [createBaseVNode("div", _hoisted_29, [createBaseVNode("span", _hoisted_30, toDisplayString(avatarText((_unref2 = unref(detail)) === null || _unref2 === void 0 || (_unref2 = _unref2.employee) === null || _unref2 === void 0 ? void 0 : _unref2.name)), 1), createBaseVNode("div", null, [createBaseVNode("h3", null, toDisplayString(((_unref3 = unref(detail)) === null || _unref3 === void 0 || (_unref3 = _unref3.employee) === null || _unref3 === void 0 ? void 0 : _unref3.name) || "离职交接详情"), 1), createBaseVNode("p", null, toDisplayString(((_unref4 = unref(detail)) === null || _unref4 === void 0 || (_unref4 = _unref4.employee) === null || _unref4 === void 0 ? void 0 : _unref4.empCode) || "无工号") + " · " + toDisplayString(((_unref5 = unref(detail)) === null || _unref5 === void 0 || (_unref5 = _unref5.employee) === null || _unref5 === void 0 ? void 0 : _unref5.deptName) || "未分部门") + " · 离职 " + toDisplayString(((_unref6 = unref(detail)) === null || _unref6 === void 0 || (_unref6 = _unref6.employee) === null || _unref6 === void 0 ? void 0 : _unref6.resignDate) || "未记录"), 1)])])];
					}),
					footer: withCtx(() => [createBaseVNode("div", _hoisted_39, [createVNode(_component_el_button, { onClick: _cache[19] || (_cache[19] = ($event) => detailVisible.value = false) }, {
						default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("关闭", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: unref(saving),
						disabled: unref(detailLoading) || unref(uploading) || !unref(detail),
						onClick: saveHandover
					}, {
						default: withCtx(() => [..._cache[65] || (_cache[65] = [createTextVNode("保存交接确认", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])])]),
					default: withCtx(() => {
						var _unref$timeline;
						return [withDirectives((openBlock(), createElementBlock("div", _hoisted_31, [unref(detail) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
							createBaseVNode("div", _hoisted_32, [
								createVNode(_component_el_tag, { type: accountMeta(unref(detail).employee.accountStatus).type }, {
									default: withCtx(() => [createTextVNode(" 账号：" + toDisplayString(accountMeta(unref(detail).employee.accountStatus).label), 1)]),
									_: 1
								}, 8, ["type"]),
								createVNode(_component_el_tag, { type: riskMeta(unref(detail).employee).type }, {
									default: withCtx(() => [createTextVNode(toDisplayString(riskMeta(unref(detail).employee).label), 1)]),
									_: 1
								}, 8, ["type"]),
								createVNode(_component_el_tag, { type: handoverMeta(unref(detail).employee.status).type }, {
									default: withCtx(() => [createTextVNode(toDisplayString(handoverMeta(unref(detail).employee.status).label), 1)]),
									_: 1
								}, 8, ["type"])
							]),
							createVNode(_component_el_alert, {
								type: "warning",
								closable: false,
								"show-icon": "",
								title: "下列五项均为人工确认，请核对实际交接凭据后再更新状态。"
							}),
							createBaseVNode("div", _hoisted_33, [createBaseVNode("div", _hoisted_34, [_cache[56] || (_cache[56] = createBaseVNode("span", null, [createTextVNode("账号 "), createBaseVNode("em", null, "系统校验")], -1)), createBaseVNode("strong", null, toDisplayString(accountMeta(unref(detail).employee.accountStatus).label), 1)]), (openBlock(), createElementBlock(Fragment, null, renderList(manualDomains, (domain) => {
								return createBaseVNode("div", {
									key: domain.key,
									class: "domain-box"
								}, [createBaseVNode("span", null, [createTextVNode(toDisplayString(domain.label) + " ", 1), _cache[57] || (_cache[57] = createBaseVNode("em", null, "人工确认", -1))]), createBaseVNode("strong", null, toDisplayString(checkMeta(unref(detail).employee[domain.key]).label), 1)]);
							}), 64))]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("交接登记", -1)])]),
								_: 1
							}),
							createVNode(_component_el_form, {
								model: unref(handoverForm),
								"label-position": "top",
								class: "handover-form"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_35, [createVNode(_component_el_form_item, { label: "交接日期" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: unref(handoverForm).handoverDate,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(handoverForm).handoverDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											placeholder: "选择交接日期"
										}, null, 8, ["modelValue"])]),
										_: 1
									}), createVNode(_component_el_form_item, { label: "接收人（稳定员工 ID）" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: unref(handoverForm).handoverToEmployeeId,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(handoverForm).handoverToEmployeeId = $event),
											filterable: "",
											clearable: "",
											placeholder: "选择在职接收人"
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(colleagues), (employee) => {
												return openBlock(), createBlock(_component_el_option, {
													key: employee.id,
													label: `${employee.name}${employee.deptName ? ` / ${employee.deptName}` : ""}`,
													value: Number(employee.id)
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									createVNode(_component_el_form_item, { label: "总体交接状态" }, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: unref(handoverForm).status,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(handoverForm).status = $event)
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(handoverOptions, (option) => {
												return createVNode(_component_el_radio_button, {
													key: option.value,
													value: option.value
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(option.label), 1)]),
													_: 2
												}, 1032, ["value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}),
									_cache[61] || (_cache[61] = createBaseVNode("div", { class: "manual-editor-title" }, [createBaseVNode("strong", null, "五项人工确认"), createBaseVNode("span", null, "异常表示已核实存在阻塞，不等同于系统自动发现。")], -1)),
									createBaseVNode("div", _hoisted_36, [
										createVNode(_component_el_form_item, { label: "客户交接 · 人工确认" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(handoverForm).customerCheckStatus,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(handoverForm).customerCheckStatus = $event)
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(checkOptions, (option) => {
													return createVNode(_component_el_option, mergeProps({ key: option.value }, { ref_for: true }, option), null, 16);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_form_item, { label: "任务交接 · 人工确认" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(handoverForm).taskCheckStatus,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(handoverForm).taskCheckStatus = $event)
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(checkOptions, (option) => {
													return createVNode(_component_el_option, mergeProps({ key: option.value }, { ref_for: true }, option), null, 16);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_form_item, { label: "资料归档 · 人工确认" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(handoverForm).documentCheckStatus,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(handoverForm).documentCheckStatus = $event)
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(checkOptions, (option) => {
													return createVNode(_component_el_option, mergeProps({ key: option.value }, { ref_for: true }, option), null, 16);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_form_item, { label: "资产归还 · 人工确认" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(handoverForm).assetCheckStatus,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(handoverForm).assetCheckStatus = $event)
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(checkOptions, (option) => {
													return createVNode(_component_el_option, mergeProps({ key: option.value }, { ref_for: true }, option), null, 16);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_form_item, { label: "薪资结算 · 人工确认" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(handoverForm).settlementCheckStatus,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(handoverForm).settlementCheckStatus = $event)
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(checkOptions, (option) => {
													return createVNode(_component_el_option, mergeProps({ key: option.value }, { ref_for: true }, option), null, 16);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})
									]),
									createVNode(_component_el_form_item, { label: "交接事项" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: unref(handoverForm).items,
											"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(handoverForm).items = $event),
											type: "textarea",
											rows: 4,
											maxlength: "2000",
											"show-word-limit": "",
											placeholder: "记录客户、任务、资料、资产、结算等实际交接事项"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "交接 SOP 附件" }, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_37, [
											createVNode(_component_el_upload, {
												"show-file-list": false,
												"before-upload": uploadSop,
												disabled: unref(uploading)
											}, {
												default: withCtx(() => [createVNode(_component_el_button, {
													icon: unref(upload_default),
													loading: unref(uploading)
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(unref(sopName) || "上传 SOP 附件"), 1)]),
													_: 1
												}, 8, ["icon", "loading"])]),
												_: 1
											}, 8, ["disabled"]),
											unref(handoverForm).sopFileId ? (openBlock(), createBlock(_component_el_button, {
												key: 0,
												link: "",
												type: "primary",
												onClick: downloadSop
											}, {
												default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("下载", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											unref(handoverForm).sopFileId ? (openBlock(), createBlock(_component_el_button, {
												key: 1,
												link: "",
												type: "danger",
												onClick: clearSop
											}, {
												default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("移除", -1)])]),
												_: 1
											})) : createCommentVNode("", true)
										])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "备注" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: unref(handoverForm).remark,
											"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(handoverForm).remark = $event),
											type: "textarea",
											rows: 2,
											maxlength: "500",
											placeholder: "记录阻塞原因或后续安排"
										}, null, 8, ["modelValue"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["model"]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("真实时间线", -1)])]),
								_: 1
							}),
							((_unref$timeline = unref(detail).timeline) === null || _unref$timeline === void 0 ? void 0 : _unref$timeline.length) ? (openBlock(), createBlock(_component_el_timeline, {
								key: 0,
								class: "truth-timeline"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(detail).timeline, (item, index) => {
									return openBlock(), createBlock(_component_el_timeline_item, {
										key: `${item.time || "time"}-${index}`,
										timestamp: item.time || "时间未记录",
										placement: "top",
										type: timelineType(item.type)
									}, {
										default: withCtx(() => [createBaseVNode("strong", null, toDisplayString(item.title), 1), item.description ? (openBlock(), createElementBlock("p", _hoisted_38, toDisplayString(item.description), 1)) : createCommentVNode("", true)]),
										_: 2
									}, 1032, ["timestamp", "type"]);
								}), 128))]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								description: "暂无可核验的时间线记录",
								"image-size": 68
							}))
						], 64)) : !unref(detailLoading) ? (openBlock(), createBlock(_component_el_result, {
							key: 1,
							icon: "warning",
							title: "详情暂时加载失败",
							"sub-title": "尚未加载成功前不会允许保存，避免误写交接记录。"
						}, {
							extra: withCtx(() => [createVNode(_component_el_button, {
								type: "primary",
								onClick: _cache[18] || (_cache[18] = ($event) => unref(detailTargetId) && loadDetail(unref(detailTargetId)))
							}, {
								default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("重新加载", -1)])]),
								_: 1
							})]),
							_: 1
						})) : createCommentVNode("", true)])), [[_directive_loading, unref(detailLoading)]])];
					}),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: unref(historyVisible),
					"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => isRef(historyVisible) ? historyVisible.value = $event : null),
					title: "补录历史离职员工",
					width: "min(600px, calc(100vw - 24px))",
					class: "history-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[27] || (_cache[27] = ($event) => historyVisible.value = false) }, {
						default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: unref(historySaving),
						onClick: submitHistory
					}, {
						default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode("确认补录", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "info",
						closable: false,
						"show-icon": "",
						title: "适用于系统启用前已经离职的人员；不会创建登录账号，也不会发送任何通知。"
					}), createVNode(_component_el_form, {
						model: unref(historyForm),
						"label-position": "top",
						class: "history-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "姓名",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(historyForm).name,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(historyForm).name = $event),
									maxlength: "64",
									placeholder: "请输入真实姓名"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_40, [createVNode(_component_el_form_item, {
								label: "原部门",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_tree_select, {
									modelValue: unref(historyForm).deptId,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(historyForm).deptId = $event),
									data: unref(deptTree),
									props: {
										label: "deptName",
										children: "children",
										value: "id"
									},
									"check-strictly": "",
									placeholder: "选择原部门"
								}, null, 8, ["modelValue", "data"])]),
								_: 1
							}), createVNode(_component_el_form_item, {
								label: "原岗位",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(historyForm).postId,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => unref(historyForm).postId = $event),
									filterable: "",
									placeholder: "选择原岗位"
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(postList), (post) => {
										return openBlock(), createBlock(_component_el_option, {
											key: post.id,
											label: post.postName,
											value: Number(post.id)
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})]),
							createBaseVNode("div", _hoisted_41, [createVNode(_component_el_form_item, { label: "入职日期（可选）" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: unref(historyForm).hireDate,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => unref(historyForm).hireDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									placeholder: "未记录可留空"
								}, null, 8, ["modelValue"])]),
								_: 1
							}), createVNode(_component_el_form_item, {
								label: "真实离职日期",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: unref(historyForm).resignDate,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => unref(historyForm).resignDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									"disabled-date": disableFutureDate,
									placeholder: "请选择离职日期"
								}, null, 8, ["modelValue"])]),
								_: 1
							})]),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(historyForm).remark,
									"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => unref(historyForm).remark = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									placeholder: "可记录资料缺失项或补录说明，请勿填写敏感离职原因"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-e8e85932"]]);
//#endregion
export { resigned_staff_default as default };

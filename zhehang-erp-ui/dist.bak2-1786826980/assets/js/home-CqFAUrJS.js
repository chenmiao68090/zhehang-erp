import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, Dr as withModifiers, Er as withKeys, F as ElEmpty, J as ElCol, Ot as calendar_default, Q as ElRadioGroup, S as ElSkeleton, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, j as ElLink, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, v as ElSwitch, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { c as SYSTEM_ROLES, l as useUserStore, s as isOwnerRole } from "./index-C4y3JnUs.js";
import { r as taskApi } from "./workflow-CeqrP-pL.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { r as leadApi } from "./crm-DKTvHmZR.js";
import { t as customerIssueApi } from "./customer-issue-ZVBFkyDD.js";
import { a as orderApi } from "./order-BHZ2ZADL.js";
import { t as memoApi } from "./memo-EpvqH3OW.js";
//#region src/api/daily-report.ts
var dailyReportApi = {
	/** 我的日报(最近30条) */
	list: () => get("/dashboard/daily-report/list"),
	/** 新增日报(ccUserIds:逗号分隔的 userId,可选) */
	create: (data) => post("/dashboard/daily-report", data),
	/** 删除自己的日报 */
	remove: (id) => del(`/dashboard/daily-report/${id}`),
	/** 可抄送的同事列表(已开通账号的员工) */
	colleagues: () => get("/dashboard/daily-report/colleagues"),
	/** 抄送给我的日报(含作者姓名) */
	ccToMe: () => get("/dashboard/daily-report/cc-to-me")
};
//#endregion
//#region src/views/dashboard/home.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "dashboard-home" };
var _hoisted_2 = { class: "profile-banner" };
var _hoisted_3 = { class: "profile-left" };
var _hoisted_4 = { class: "profile-avatar" };
var _hoisted_5 = { class: "profile-meta" };
var _hoisted_6 = { class: "profile-name-row" };
var _hoisted_7 = { class: "profile-position" };
var _hoisted_8 = { class: "profile-sub" };
var _hoisted_9 = { class: "profile-tenure" };
var _hoisted_10 = { class: "profile-date" };
var _hoisted_11 = { class: "tc-grid" };
var _hoisted_12 = { class: "tc-ic" };
var _hoisted_13 = { class: "tc-body" };
var _hoisted_14 = { class: "tc-num" };
var _hoisted_15 = { class: "tc-ic" };
var _hoisted_16 = { class: "tc-body" };
var _hoisted_17 = { class: "tc-num" };
var _hoisted_18 = { class: "tc-ic" };
var _hoisted_19 = { class: "tc-body" };
var _hoisted_20 = { class: "tc-num" };
var _hoisted_21 = { class: "tc-ic" };
var _hoisted_22 = { class: "tc-body" };
var _hoisted_23 = { class: "tc-num" };
var _hoisted_24 = { class: "card-header" };
var _hoisted_25 = { class: "perf-grid" };
var _hoisted_26 = { class: "perf-item" };
var _hoisted_27 = { class: "perf-value" };
var _hoisted_28 = { class: "perf-item" };
var _hoisted_29 = { class: "perf-item" };
var _hoisted_30 = { class: "perf-item" };
var _hoisted_31 = { class: "card-header" };
var _hoisted_32 = { class: "flow-grid" };
var _hoisted_33 = { class: "flow-num" };
var _hoisted_34 = { class: "flow-num" };
var _hoisted_35 = { class: "flow-num" };
var _hoisted_36 = { class: "card-header" };
var _hoisted_37 = { class: "perf-grid" };
var _hoisted_38 = { class: "perf-item" };
var _hoisted_39 = { class: "perf-value" };
var _hoisted_40 = { class: "perf-item" };
var _hoisted_41 = { class: "perf-value" };
var _hoisted_42 = { class: "perf-item" };
var _hoisted_43 = { class: "perf-value" };
var _hoisted_44 = {
	key: 2,
	class: "flow-list"
};
var _hoisted_45 = { class: "flow-row-main" };
var _hoisted_46 = { class: "flow-row-title text-ellipsis" };
var _hoisted_47 = { class: "flow-row-meta" };
var _hoisted_48 = { class: "flow-row-right" };
var _hoisted_49 = { class: "flow-row-date" };
var _hoisted_50 = {
	key: 2,
	class: "flow-list"
};
var _hoisted_51 = ["onClick"];
var _hoisted_52 = { class: "flow-row-main" };
var _hoisted_53 = { class: "flow-row-title text-ellipsis" };
var _hoisted_54 = { class: "flow-row-meta" };
var _hoisted_55 = { class: "flow-row-right" };
var _hoisted_56 = { class: "flow-row-date" };
var _hoisted_57 = { class: "card-header" };
var _hoisted_58 = { class: "memo-summary" };
var _hoisted_59 = { class: "memo-summary-item" };
var _hoisted_60 = { class: "memo-summary-item success" };
var _hoisted_61 = {
	key: 1,
	class: "memo-list"
};
var _hoisted_62 = ["onClick"];
var _hoisted_63 = { class: "memo-time" };
var _hoisted_64 = { class: "memo-main" };
var _hoisted_65 = { class: "memo-content" };
var _hoisted_66 = { class: "memo-meta" };
var _hoisted_67 = { class: "card-header" };
var _hoisted_68 = { class: "report-header-left" };
var _hoisted_69 = {
	key: 1,
	class: "report-list"
};
var _hoisted_70 = { class: "report-item-head" };
var _hoisted_71 = { class: "report-date" };
var _hoisted_72 = { class: "report-block" };
var _hoisted_73 = {
	key: 0,
	class: "report-block"
};
var _hoisted_74 = {
	key: 0,
	class: "empty-tip report-empty"
};
var _hoisted_75 = {
	key: 1,
	class: "report-list"
};
var _hoisted_76 = { class: "report-item-head" };
var _hoisted_77 = { class: "report-date" };
var _hoisted_78 = { class: "report-block" };
var _hoisted_79 = { class: "card-header" };
var _hoisted_80 = { class: "memo-editor" };
var _hoisted_81 = { class: "memo-form-grid" };
var _hoisted_82 = { class: "memo-form-grid" };
var _hoisted_83 = { class: "memo-editor-actions" };
var _hoisted_84 = { class: "memo-filter-bar" };
var _hoisted_85 = {
	key: 2,
	class: "memo-drawer-list"
};
var _hoisted_86 = ["onClick"];
var _hoisted_87 = { class: "memo-drawer-title" };
var _hoisted_88 = { class: "memo-meta" };
var _hoisted_89 = { class: "memo-row-actions" };
var slogan = "遇到对的人，才可以一起走的更远！";
//#endregion
//#region src/views/dashboard/home.vue
var home_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "home",
	setup(__props) {
		const router = useRouter();
		const issueStats = reactive({
			todayNew: 0,
			unhandled: 0,
			overdue: 0,
			p0: 0
		});
		const loadIssueStats = function() {
			var _ref = _asyncToGenerator(function* () {
				try {
					var _res$data;
					const res = yield customerIssueApi.stats();
					const d = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					issueStats.todayNew = Number((d === null || d === void 0 ? void 0 : d.todayNew) || 0);
					issueStats.unhandled = Number((d === null || d === void 0 ? void 0 : d.unhandled) || 0);
					issueStats.overdue = Number((d === null || d === void 0 ? void 0 : d.overdue) || 0);
					issueStats.p0 = Number((d === null || d === void 0 ? void 0 : d.p0) || 0);
				} catch (_unused) {}
			});
			return function loadIssueStats() {
				return _ref.apply(this, arguments);
			};
		}();
		const userStore = useUserStore();
		const canOpenOwnerMonitor = computed(() => {
			var _userStore$userInfo;
			return isOwnerRole(userStore.roles, (_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id);
		});
		const ROLE_LABELS = {
			admin: "超级管理员",
			super_admin: "超级管理员",
			sys_admin: "系统管理员",
			dept_manager: "部门主管",
			manager: "部门主管",
			boss: "老板",
			finance: "财务/会计",
			finance_hq: "财务部",
			sales: "电销",
			online_sales: "网销",
			hr: "人事",
			staff: "普通员工",
			user: "普通用户"
		};
		const userName = computed(() => {
			var _userStore$userInfo2, _userStore$userInfo3;
			return ((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.nickname) || ((_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.username) || "用户";
		});
		const avatarText = computed(() => userName.value.slice(0, 1));
		const positionLabel = computed(() => {
			var _userStore$roles, _SYSTEM_ROLES$find;
			const role = (_userStore$roles = userStore.roles) === null || _userStore$roles === void 0 ? void 0 : _userStore$roles[0];
			if (!role) return "员工";
			return ROLE_LABELS[role] || ((_SYSTEM_ROLES$find = SYSTEM_ROLES.find((r) => r.value === role)) === null || _SYSTEM_ROLES$find === void 0 ? void 0 : _SYSTEM_ROLES$find.label) || role;
		});
		const tenureDays = ref("--");
		const currentDateStr = computed(() => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 星期${[
				"日",
				"一",
				"二",
				"三",
				"四",
				"五",
				"六"
			][d.getDay()]}`;
		});
		const flow = reactive({
			todo: 0,
			cc: 0,
			started: 0,
			done: 0
		});
		const taskCenter = reactive({
			follow: 0,
			recycle: 0,
			myLeads: 0
		});
		function loadTaskCenter() {
			return _loadTaskCenter.apply(this, arguments);
		}
		function _loadTaskCenter() {
			_loadTaskCenter = _asyncToGenerator(function* () {
				const tryTotal = function() {
					var _ref2 = _asyncToGenerator(function* (fn) {
						try {
							const res = yield fn();
							return Number((res === null || res === void 0 ? void 0 : res.total) || 0);
						} catch (_unused2) {
							return 0;
						}
					});
					return function tryTotal(_x) {
						return _ref2.apply(this, arguments);
					};
				}();
				taskCenter.follow = yield tryTotal(() => leadApi.todoFollow({
					pageNum: 1,
					pageSize: 1
				}));
				taskCenter.recycle = yield tryTotal(() => leadApi.recycleWarning({
					pageNum: 1,
					pageSize: 1
				}));
				taskCenter.myLeads = yield tryTotal(() => leadApi.myList({
					pageNum: 1,
					pageSize: 1
				}));
			});
			return _loadTaskCenter.apply(this, arguments);
		}
		function goWorkbench(section) {
			router.push({
				path: "/customer/workbench",
				query: { section }
			});
		}
		function goApprovalCenter(tab) {
			router.push({
				path: "/approval/center",
				query: { tab }
			});
		}
		const perf = reactive({
			dealCount: 0,
			dealAmount: 0,
			conversionRate: 0
		});
		const activeTab = ref("done");
		const ccList = ref([]);
		const doneList = ref([]);
		const ccLoading = ref(false);
		const doneLoading = ref(false);
		function taskStatusMeta(status) {
			switch (Number(status)) {
				case 2: return {
					label: "已同意",
					type: "success"
				};
				case 3: return {
					label: "已驳回",
					type: "danger"
				};
				case 4: return {
					label: "已转交",
					type: "info"
				};
				default: return {
					label: "待处理",
					type: "warning"
				};
			}
		}
		function adaptTask(t) {
			const meta = taskStatusMeta(t.status);
			return {
				id: t.id,
				instanceId: t.instanceId,
				title: t.instanceTitle || t.processName || "审批事项",
				applicant: t.initiatorName || "",
				approver: t.assigneeName || "",
				date: (t.handleTime || t.startTime || t.createTime || "").toString().replace("T", " ").slice(0, 10),
				statusLabel: meta.label,
				statusType: meta.type
			};
		}
		function openInstance(instanceId) {
			if (!instanceId) return;
			router.push({
				path: "/approval/center",
				query: { instanceId }
			});
		}
		const memoHomeList = ref([]);
		const memoList = ref([]);
		const memoLoading = ref(false);
		const memoListLoading = ref(false);
		const memoDrawerVisible = ref(false);
		const memoFilter = ref("today");
		const memoKeyword = ref("");
		const memoEditingId = ref(null);
		const memoSummary = reactive({
			pending: 0,
			today: 0,
			doneToday: 0,
			overdue: 0
		});
		const memoForm = reactive({
			content: "",
			remindTime: "",
			priority: 2,
			category: "客户跟进",
			completed: false
		});
		function pad2(n) {
			return String(n).padStart(2, "0");
		}
		function nowDateTimeText() {
			const d = /* @__PURE__ */ new Date();
			d.setMinutes(0, 0, 0);
			d.setHours(d.getHours() + 1);
			return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:00:00`;
		}
		function toDate(value) {
			if (!value) return null;
			const d = new Date(value.replace(" ", "T"));
			return Number.isNaN(d.getTime()) ? null : d;
		}
		function sameDate(a, b) {
			return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
		}
		function formatMemoTime(value, completed) {
			if (completed) return "已完";
			const d = toDate(value);
			if (!d) return "待定";
			const now = /* @__PURE__ */ new Date();
			if (sameDate(d, now)) return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
			const tomorrow = new Date(now);
			tomorrow.setDate(now.getDate() + 1);
			if (sameDate(d, tomorrow)) return `明天 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
			return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
		}
		function formatMemoHomeTime(value, completed) {
			if (completed) return "已完成";
			const d = toDate(value);
			if (!d) return "待定";
			const clock = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
			const now = /* @__PURE__ */ new Date();
			if (sameDate(d, now)) return `今天\n${clock}`;
			const tomorrow = new Date(now);
			tomorrow.setDate(now.getDate() + 1);
			if (sameDate(d, tomorrow)) return `明天\n${clock}`;
			return `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}\n${clock}`;
		}
		function isMemoOverdue(item) {
			const d = toDate(item.remindTime);
			return !item.completed && !!d && d.getTime() < Date.now();
		}
		function priorityMeta(priority) {
			if (Number(priority) === 3) return {
				label: "重要",
				type: "warning"
			};
			if (Number(priority) === 1) return {
				label: "低",
				type: "info"
			};
			return {
				label: "普通",
				type: "info"
			};
		}
		function resetMemoForm() {
			memoEditingId.value = null;
			memoForm.content = "";
			memoForm.remindTime = nowDateTimeText();
			memoForm.priority = 2;
			memoForm.category = "客户跟进";
			memoForm.completed = false;
			memoForm.completedTime = void 0;
			memoForm.remark = "";
		}
		function loadMemoSummary() {
			return _loadMemoSummary.apply(this, arguments);
		}
		function _loadMemoSummary() {
			_loadMemoSummary = _asyncToGenerator(function* () {
				try {
					const res = yield memoApi.summary();
					const data = (res === null || res === void 0 ? void 0 : res.data) || res || {};
					memoSummary.pending = Number(data.pending || 0);
					memoSummary.today = Number(data.today || 0);
					memoSummary.doneToday = Number(data.doneToday || 0);
					memoSummary.overdue = Number(data.overdue || 0);
				} catch (_unused3) {
					memoSummary.pending = 0;
					memoSummary.today = 0;
					memoSummary.doneToday = 0;
					memoSummary.overdue = 0;
				}
			});
			return _loadMemoSummary.apply(this, arguments);
		}
		function loadMemoHome() {
			return _loadMemoHome.apply(this, arguments);
		}
		function _loadMemoHome() {
			_loadMemoHome = _asyncToGenerator(function* () {
				memoLoading.value = true;
				try {
					const res = yield memoApi.list({
						scope: "home",
						limit: 5
					});
					memoHomeList.value = (res === null || res === void 0 ? void 0 : res.data) || [];
				} catch (_unused4) {
					memoHomeList.value = [];
				} finally {
					memoLoading.value = false;
				}
				loadMemoSummary();
			});
			return _loadMemoHome.apply(this, arguments);
		}
		function loadMemoList() {
			return _loadMemoList.apply(this, arguments);
		}
		function _loadMemoList() {
			_loadMemoList = _asyncToGenerator(function* () {
				memoListLoading.value = true;
				try {
					const params = {
						scope: "all",
						limit: 80
					};
					if (memoFilter.value === "today") params.scope = "today";
					if (memoFilter.value === "week") params.scope = "week";
					if (memoFilter.value === "pending") params.completed = false;
					if (memoFilter.value === "done") params.completed = true;
					if (memoKeyword.value.trim()) params.keyword = memoKeyword.value.trim();
					const res = yield memoApi.list(params);
					memoList.value = (res === null || res === void 0 ? void 0 : res.data) || [];
				} catch (_unused5) {
					memoList.value = [];
				} finally {
					memoListLoading.value = false;
				}
			});
			return _loadMemoList.apply(this, arguments);
		}
		function openMemoPage(id) {
			router.push({
				path: "/memo",
				query: id ? { edit: String(id) } : void 0
			});
		}
		function editMemo(item) {
			memoDrawerVisible.value = true;
			memoEditingId.value = item.id || null;
			memoForm.content = item.content || "";
			memoForm.remindTime = item.remindTime || "";
			memoForm.priority = item.priority || 2;
			memoForm.category = item.category || "客户跟进";
			memoForm.completed = !!item.completed;
			memoForm.completedTime = item.completedTime;
			memoForm.remark = item.remark || "";
		}
		function submitMemo() {
			return _submitMemo.apply(this, arguments);
		}
		function _submitMemo() {
			_submitMemo = _asyncToGenerator(function* () {
				if (!memoForm.content.trim()) {
					ElMessage.warning("请填写备忘内容");
					return;
				}
				try {
					const data = {
						id: memoEditingId.value || void 0,
						content: memoForm.content.trim(),
						remindTime: memoForm.remindTime || void 0,
						priority: memoForm.priority || 2,
						category: memoForm.category || void 0,
						completed: !!memoForm.completed,
						completedTime: memoForm.completedTime,
						remark: memoForm.remark || void 0
					};
					if (memoEditingId.value) {
						yield memoApi.update(data);
						ElMessage.success("备忘已更新");
					} else {
						yield memoApi.create(data);
						ElMessage.success("备忘已新增");
					}
					resetMemoForm();
					yield Promise.all([loadMemoHome(), loadMemoList()]);
				} catch (_unused6) {
					ElMessage.error("备忘保存失败，请重试");
				}
			});
			return _submitMemo.apply(this, arguments);
		}
		function toggleMemo(_x2, _x3) {
			return _toggleMemo.apply(this, arguments);
		}
		function _toggleMemo() {
			_toggleMemo = _asyncToGenerator(function* (item, completed) {
				if (!item.id) return;
				try {
					yield memoApi.complete(item.id, completed);
					yield Promise.all([loadMemoHome(), loadMemoList()]);
				} catch (_unused7) {
					ElMessage.error("状态更新失败，请重试");
				}
			});
			return _toggleMemo.apply(this, arguments);
		}
		function removeMemo(_x4) {
			return _removeMemo.apply(this, arguments);
		}
		function _removeMemo() {
			_removeMemo = _asyncToGenerator(function* (item) {
				if (!item.id) return;
				try {
					yield ElMessageBox.confirm("确定删除这条备忘吗?", "", { type: "warning" });
				} catch (_unused8) {
					return;
				}
				try {
					yield memoApi.remove(item.id);
					yield Promise.all([loadMemoHome(), loadMemoList()]);
					ElMessage.success("删除成功");
				} catch (_unused9) {
					ElMessage.error("删除失败，请重试");
				}
			});
			return _removeMemo.apply(this, arguments);
		}
		const reportView = ref("mine");
		const reportList = ref([]);
		const reportLoading = ref(false);
		const reportLoadError = ref(false);
		const ccReportList = ref([]);
		const ccReportLoading = ref(false);
		const ccReportLoadError = ref(false);
		const ccLoaded = ref(false);
		const colleagueList = ref([]);
		const colleagueLoading = ref(false);
		const reportDialogVisible = ref(false);
		const reportForm = reactive({
			date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
			today: "",
			tomorrow: "",
			ccUserIds: []
		});
		function loadReports() {
			return _loadReports.apply(this, arguments);
		}
		function _loadReports() {
			_loadReports = _asyncToGenerator(function* () {
				reportLoading.value = true;
				reportLoadError.value = false;
				try {
					const res = yield dailyReportApi.list();
					const list = (res === null || res === void 0 ? void 0 : res.data) || [];
					reportList.value = (Array.isArray(list) ? list : []).map((r) => ({
						id: r.id,
						date: (r.reportDate || "").slice(0, 10),
						today: r.todayWork || "",
						tomorrow: r.tomorrowPlan || ""
					}));
				} catch (_unused10) {
					reportList.value = [];
					reportLoadError.value = true;
				} finally {
					reportLoading.value = false;
				}
			});
			return _loadReports.apply(this, arguments);
		}
		function loadCcReports() {
			return _loadCcReports.apply(this, arguments);
		}
		function _loadCcReports() {
			_loadCcReports = _asyncToGenerator(function* () {
				ccReportLoading.value = true;
				ccReportLoadError.value = false;
				try {
					const res = yield dailyReportApi.ccToMe();
					const list = (res === null || res === void 0 ? void 0 : res.data) || [];
					ccReportList.value = (Array.isArray(list) ? list : []).map((r) => ({
						id: r.id,
						date: (r.reportDate || "").slice(0, 10),
						today: r.todayWork || "",
						authorName: r.authorName || ""
					}));
					ccLoaded.value = true;
				} catch (_unused11) {
					ccReportList.value = [];
					ccReportLoadError.value = true;
				} finally {
					ccReportLoading.value = false;
				}
			});
			return _loadCcReports.apply(this, arguments);
		}
		function loadColleagues() {
			return _loadColleagues.apply(this, arguments);
		}
		function _loadColleagues() {
			_loadColleagues = _asyncToGenerator(function* () {
				if (colleagueList.value.length > 0) return;
				colleagueLoading.value = true;
				try {
					const res = yield dailyReportApi.colleagues();
					const list = (res === null || res === void 0 ? void 0 : res.data) || [];
					colleagueList.value = (Array.isArray(list) ? list : []).filter((c) => c.userId != null).map((c) => ({
						userId: c.userId,
						name: c.name || "",
						deptName: c.deptName || ""
					}));
				} catch (_unused12) {
					colleagueList.value = [];
				} finally {
					colleagueLoading.value = false;
				}
			});
			return _loadColleagues.apply(this, arguments);
		}
		function onReportViewChange() {
			if (reportView.value === "cc" && !ccLoaded.value) loadCcReports();
		}
		function openReportDialog() {
			reportForm.date = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			reportForm.today = "";
			reportForm.tomorrow = "";
			reportForm.ccUserIds = [];
			reportDialogVisible.value = true;
			loadColleagues();
		}
		function submitReport() {
			return _submitReport.apply(this, arguments);
		}
		function _submitReport() {
			_submitReport = _asyncToGenerator(function* () {
				if (!reportForm.today.trim()) {
					ElMessage.warning("请填写今日工作");
					return;
				}
				try {
					yield dailyReportApi.create({
						reportDate: reportForm.date,
						todayWork: reportForm.today.trim(),
						tomorrowPlan: reportForm.tomorrow.trim(),
						ccUserIds: reportForm.ccUserIds.join(",")
					});
					reportDialogVisible.value = false;
					ElMessage.success("日报已保存");
					yield loadReports();
				} catch (_unused13) {
					ElMessage.error("日报保存失败，请重试");
				}
			});
			return _submitReport.apply(this, arguments);
		}
		function removeReport(_x5) {
			return _removeReport.apply(this, arguments);
		}
		function _removeReport() {
			_removeReport = _asyncToGenerator(function* (id) {
				try {
					yield ElMessageBox.confirm("确定删除此报告吗?", "", { type: "warning" });
				} catch (_unused14) {
					return;
				}
				try {
					yield dailyReportApi.remove(id);
					yield loadReports();
					ElMessage.success("删除成功");
				} catch (_unused15) {
					ElMessage.error("删除失败，请重试");
				}
			});
			return _removeReport.apply(this, arguments);
		}
		const orderList = ref([]);
		const orderLoading = ref(false);
		const SERVICE_TYPE_LABELS = {
			bookkeeping: "代理记账",
			registration: "工商注册",
			tax_planning: "税务筹划",
			qualification: "资质办理",
			audit: "审计",
			cancellation: "注销",
			other: "其他"
		};
		const ORDER_STATUS_LABELS = {
			draft: {
				label: "草稿",
				type: "info"
			},
			pending_approval: {
				label: "待审批",
				type: "warning"
			},
			pending_finance: {
				label: "待财务确认",
				type: "warning"
			},
			pending_boss: {
				label: "待终审",
				type: "warning"
			},
			completed: {
				label: "已完成",
				type: "success"
			},
			rejected: {
				label: "已驳回",
				type: "danger"
			},
			cancelled: {
				label: "已取消",
				type: "info"
			}
		};
		function adaptOrderRow(o) {
			var _o$items;
			const st = ORDER_STATUS_LABELS[o.status] || {
				label: o.status,
				type: "info"
			};
			const firstType = (_o$items = o.items) === null || _o$items === void 0 || (_o$items = _o$items[0]) === null || _o$items === void 0 ? void 0 : _o$items.serviceType;
			return _objectSpread2(_objectSpread2({}, o), {}, {
				serviceTypeLabel: SERVICE_TYPE_LABELS[firstType || ""] || "—",
				statusLabel: st.label,
				statusType: st.type
			});
		}
		function formatMoney(n) {
			const v = Number(n || 0);
			if (v >= 1e4) return `¥${(v / 1e4).toFixed(2)}万`;
			return `¥${v.toLocaleString("zh-CN")}`;
		}
		function loadTenure() {
			return _loadTenure.apply(this, arguments);
		}
		function _loadTenure() {
			_loadTenure = _asyncToGenerator(function* () {
				var _userStore$userInfo4, _userStore$userInfo5;
				const myHire = (_userStore$userInfo4 = userStore.userInfo) === null || _userStore$userInfo4 === void 0 ? void 0 : _userStore$userInfo4.hireDate;
				if (myHire) {
					const diff = Date.now() - new Date(String(myHire)).getTime();
					tenureDays.value = Math.max(0, Math.floor(diff / 864e5));
					return;
				}
				const uid = Number(((_userStore$userInfo5 = userStore.userInfo) === null || _userStore$userInfo5 === void 0 ? void 0 : _userStore$userInfo5.id) || 0);
				if (!uid) return;
				try {
					const res = yield employeeApi.list({
						pageNum: 1,
						pageSize: 50
					});
					const me = ((res === null || res === void 0 ? void 0 : res.records) || (res === null || res === void 0 ? void 0 : res.list) || []).find((e) => Number(e.userId) === uid);
					if (me === null || me === void 0 ? void 0 : me.hireDate) {
						const diff = Date.now() - new Date(String(me.hireDate)).getTime();
						tenureDays.value = Math.max(0, Math.floor(diff / 864e5));
					}
				} catch (_unused16) {}
			});
			return _loadTenure.apply(this, arguments);
		}
		function loadFlowCounts() {
			return _loadFlowCounts.apply(this, arguments);
		}
		function _loadFlowCounts() {
			_loadFlowCounts = _asyncToGenerator(function* () {
				const unwrap = (res) => res && typeof res === "object" && "data" in res ? res.data : res;
				try {
					const summary = unwrap(yield get("/dashboard/approval-summary"));
					flow.todo = Number((summary === null || summary === void 0 ? void 0 : summary.total) || 0);
				} catch (_unused17) {
					try {
						const res = yield taskApi.todo({
							pageNum: 1,
							pageSize: 1
						});
						flow.todo = Number((res === null || res === void 0 ? void 0 : res.total) || 0);
					} catch (_unused18) {
						flow.todo = 0;
					}
				}
				try {
					const c = unwrap(yield taskApi.counts());
					flow.started = Number((c === null || c === void 0 ? void 0 : c.started) || 0);
					flow.done = Number((c === null || c === void 0 ? void 0 : c.done) || 0);
					flow.cc = Number((c === null || c === void 0 ? void 0 : c.cc) || 0);
				} catch (_unused19) {
					flow.started = 0;
					flow.done = 0;
					flow.cc = 0;
				}
			});
			return _loadFlowCounts.apply(this, arguments);
		}
		function loadDoneList() {
			return _loadDoneList.apply(this, arguments);
		}
		function _loadDoneList() {
			_loadDoneList = _asyncToGenerator(function* () {
				doneLoading.value = true;
				try {
					const res = yield taskApi.done({
						pageNum: 1,
						pageSize: 8
					});
					doneList.value = ((res === null || res === void 0 ? void 0 : res.records) || (res === null || res === void 0 ? void 0 : res.list) || []).map(adaptTask);
				} catch (_unused20) {
					doneList.value = [];
				} finally {
					doneLoading.value = false;
				}
			});
			return _loadDoneList.apply(this, arguments);
		}
		function loadCcList() {
			return _loadCcList.apply(this, arguments);
		}
		function _loadCcList() {
			_loadCcList = _asyncToGenerator(function* () {
				ccLoading.value = true;
				try {
					const res = yield get("/workflow/task/cc", {
						pageNum: 1,
						pageSize: 8
					});
					const payload = res && typeof res === "object" && "data" in res ? res.data : res;
					ccList.value = ((payload === null || payload === void 0 ? void 0 : payload.records) || (payload === null || payload === void 0 ? void 0 : payload.list) || []).map(adaptTask);
				} catch (_unused21) {
					ccList.value = [];
				} finally {
					ccLoading.value = false;
				}
			});
			return _loadCcList.apply(this, arguments);
		}
		function loadPerformance() {
			return _loadPerformance.apply(this, arguments);
		}
		function _loadPerformance() {
			_loadPerformance = _asyncToGenerator(function* () {
				try {
					const stats = yield orderApi.stats();
					perf.dealCount = stats.completedCount || 0;
					perf.dealAmount = stats.monthAmount || 0;
				} catch (_unused22) {
					perf.dealCount = 0;
					perf.dealAmount = 0;
				}
				try {
					const conv = yield leadApi.conversionStats();
					perf.conversionRate = Number((conv === null || conv === void 0 ? void 0 : conv.conversionRate) || 0);
				} catch (_unused23) {
					perf.conversionRate = 0;
				}
			});
			return _loadPerformance.apply(this, arguments);
		}
		function loadMyOrders() {
			return _loadMyOrders.apply(this, arguments);
		}
		function _loadMyOrders() {
			_loadMyOrders = _asyncToGenerator(function* () {
				orderLoading.value = true;
				try {
					orderList.value = ((yield orderApi.list({
						page: 1,
						pageSize: 5
					})).list || []).map(adaptOrderRow);
				} catch (_unused24) {
					orderList.value = [];
				} finally {
					orderLoading.value = false;
				}
			});
			return _loadMyOrders.apply(this, arguments);
		}
		onMounted(() => {
			loadReports();
			loadIssueStats();
			loadTenure();
			loadFlowCounts();
			loadTaskCenter();
			loadDoneList();
			loadCcList();
			loadMemoHome();
			loadPerformance();
			loadMyOrders();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_Stamp = resolveComponent("Stamp");
			const _component_ArrowRightBold = resolveComponent("ArrowRightBold");
			const _component_PhoneFilled = resolveComponent("PhoneFilled");
			const _component_Warning = resolveComponent("Warning");
			const _component_User = resolveComponent("User");
			const _component_el_card = ElCard;
			const _component_el_link = ElLink;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_empty = ElEmpty;
			const _component_el_tag = ElTag;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_col = ElCol;
			const _component_el_button = ElButton;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_row = ElRow;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_drawer = ElDrawer;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, toDisplayString(avatarText.value), 1), createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [createBaseVNode("h2", null, toDisplayString(userName.value), 1), createBaseVNode("span", _hoisted_7, toDisplayString(positionLabel.value), 1)]), createBaseVNode("div", _hoisted_8, [
					createBaseVNode("span", _hoisted_9, [
						_cache[30] || (_cache[30] = createTextVNode("您已入职 ", -1)),
						createBaseVNode("b", null, toDisplayString(tenureDays.value), 1),
						_cache[31] || (_cache[31] = createTextVNode(" 天", -1))
					]),
					_cache[32] || (_cache[32] = createBaseVNode("span", { class: "profile-divider" }, "·", -1)),
					createBaseVNode("span", { class: "profile-slogan" }, toDisplayString(slogan))
				])])]), createBaseVNode("div", _hoisted_10, [createVNode(_component_el_icon, { size: 18 }, {
					default: withCtx(() => [createVNode(unref(calendar_default))]),
					_: 1
				}), createBaseVNode("span", null, toDisplayString(currentDateStr.value), 1)])]),
				createVNode(_component_el_row, { gutter: 16 }, {
					default: withCtx(() => [createVNode(_component_el_col, {
						xs: 24,
						lg: 16
					}, {
						default: withCtx(() => [
							createVNode(_component_el_card, {
								class: "task-center-card",
								shadow: "never"
							}, {
								header: withCtx(() => [..._cache[33] || (_cache[33] = [createBaseVNode("div", { class: "card-header" }, [createBaseVNode("span", { class: "card-title" }, "个人任务中心"), createBaseVNode("span", { class: "tc-sub" }, "今天要处理的事都在这里")], -1)])]),
								default: withCtx(() => [createBaseVNode("div", _hoisted_11, [
									createBaseVNode("div", {
										class: "tc-item is-approval",
										onClick: _cache[0] || (_cache[0] = ($event) => goApprovalCenter("todo"))
									}, [
										createBaseVNode("div", _hoisted_12, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_Stamp)]),
											_: 1
										})]),
										createBaseVNode("div", _hoisted_13, [createBaseVNode("div", _hoisted_14, toDisplayString(flow.todo), 1), _cache[34] || (_cache[34] = createBaseVNode("div", { class: "tc-label" }, "待我审批", -1))]),
										createVNode(_component_el_icon, { class: "tc-arrow" }, {
											default: withCtx(() => [createVNode(_component_ArrowRightBold)]),
											_: 1
										})
									]),
									createBaseVNode("div", {
										class: "tc-item is-follow",
										onClick: _cache[1] || (_cache[1] = ($event) => goWorkbench("today"))
									}, [
										createBaseVNode("div", _hoisted_15, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_PhoneFilled)]),
											_: 1
										})]),
										createBaseVNode("div", _hoisted_16, [createBaseVNode("div", _hoisted_17, toDisplayString(taskCenter.follow), 1), _cache[35] || (_cache[35] = createBaseVNode("div", { class: "tc-label" }, "今日待跟进", -1))]),
										createVNode(_component_el_icon, { class: "tc-arrow" }, {
											default: withCtx(() => [createVNode(_component_ArrowRightBold)]),
											_: 1
										})
									]),
									createBaseVNode("div", {
										class: "tc-item is-recycle",
										onClick: _cache[2] || (_cache[2] = ($event) => goWorkbench("warning"))
									}, [
										createBaseVNode("div", _hoisted_18, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_Warning)]),
											_: 1
										})]),
										createBaseVNode("div", _hoisted_19, [createBaseVNode("div", _hoisted_20, toDisplayString(taskCenter.recycle), 1), _cache[36] || (_cache[36] = createBaseVNode("div", { class: "tc-label" }, "回收预警", -1))]),
										createVNode(_component_el_icon, { class: "tc-arrow" }, {
											default: withCtx(() => [createVNode(_component_ArrowRightBold)]),
											_: 1
										})
									]),
									createBaseVNode("div", {
										class: "tc-item is-leads",
										onClick: _cache[3] || (_cache[3] = ($event) => goWorkbench("my"))
									}, [
										createBaseVNode("div", _hoisted_21, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_User)]),
											_: 1
										})]),
										createBaseVNode("div", _hoisted_22, [createBaseVNode("div", _hoisted_23, toDisplayString(taskCenter.myLeads), 1), _cache[37] || (_cache[37] = createBaseVNode("div", { class: "tc-label" }, "我的线索", -1))]),
										createVNode(_component_el_icon, { class: "tc-arrow" }, {
											default: withCtx(() => [createVNode(_component_ArrowRightBold)]),
											_: 1
										})
									])
								])]),
								_: 1
							}),
							createVNode(_component_el_card, {
								class: "perf-card",
								shadow: "never"
							}, {
								header: withCtx(() => [createBaseVNode("div", _hoisted_24, [_cache[39] || (_cache[39] = createBaseVNode("span", { class: "card-title" }, "任务工单", -1)), createVNode(_component_el_link, {
									type: "primary",
									underline: false,
									onClick: _cache[4] || (_cache[4] = ($event) => unref(router).push("/customer-issue/list"))
								}, {
									default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("查看全部", -1)])]),
									_: 1
								})])]),
								default: withCtx(() => [createBaseVNode("div", _hoisted_25, [
									createBaseVNode("div", _hoisted_26, [createBaseVNode("div", _hoisted_27, toDisplayString(issueStats.todayNew), 1), _cache[40] || (_cache[40] = createBaseVNode("div", { class: "perf-label" }, "今日新增", -1))]),
									createBaseVNode("div", _hoisted_28, [createBaseVNode("div", {
										class: "perf-value",
										style: normalizeStyle(issueStats.unhandled ? "color:var(--el-color-warning)" : "")
									}, toDisplayString(issueStats.unhandled), 5), _cache[41] || (_cache[41] = createBaseVNode("div", { class: "perf-label" }, "未处理", -1))]),
									createBaseVNode("div", _hoisted_29, [createBaseVNode("div", {
										class: "perf-value",
										style: normalizeStyle(issueStats.overdue ? "color:var(--el-color-danger)" : "")
									}, toDisplayString(issueStats.overdue), 5), _cache[42] || (_cache[42] = createBaseVNode("div", { class: "perf-label" }, "逾期", -1))]),
									createBaseVNode("div", _hoisted_30, [createBaseVNode("div", {
										class: "perf-value",
										style: normalizeStyle(issueStats.p0 ? "color:var(--el-color-danger)" : "")
									}, toDisplayString(issueStats.p0), 5), _cache[43] || (_cache[43] = createBaseVNode("div", { class: "perf-label" }, "P0 紧急", -1))])
								])]),
								_: 1
							}),
							createVNode(_component_el_card, {
								class: "flow-card",
								shadow: "never"
							}, {
								header: withCtx(() => [createBaseVNode("div", _hoisted_31, [_cache[44] || (_cache[44] = createBaseVNode("span", { class: "card-title" }, "流程待办", -1)), createVNode(_component_el_link, {
									type: "primary",
									underline: false,
									onClick: _cache[5] || (_cache[5] = ($event) => goApprovalCenter("done"))
								}, {
									default: withCtx(() => [createTextVNode(" 已完成 " + toDisplayString(flow.done) + " 件 ", 1)]),
									_: 1
								})])]),
								default: withCtx(() => [createBaseVNode("div", _hoisted_32, [
									createBaseVNode("div", {
										class: "flow-item",
										onClick: _cache[6] || (_cache[6] = ($event) => goApprovalCenter("todo"))
									}, [createBaseVNode("div", _hoisted_33, toDisplayString(flow.todo), 1), _cache[45] || (_cache[45] = createBaseVNode("div", { class: "flow-label" }, "待我审批", -1))]),
									createBaseVNode("div", {
										class: "flow-item",
										onClick: _cache[7] || (_cache[7] = ($event) => goApprovalCenter("cc"))
									}, [createBaseVNode("div", _hoisted_34, toDisplayString(flow.cc), 1), _cache[46] || (_cache[46] = createBaseVNode("div", { class: "flow-label" }, "抄送我", -1))]),
									createBaseVNode("div", {
										class: "flow-item",
										onClick: _cache[8] || (_cache[8] = ($event) => goApprovalCenter("started"))
									}, [createBaseVNode("div", _hoisted_35, toDisplayString(flow.started), 1), _cache[47] || (_cache[47] = createBaseVNode("div", { class: "flow-label" }, "我发起", -1))])
								])]),
								_: 1
							}),
							createVNode(_component_el_card, {
								class: "perf-card",
								shadow: "never"
							}, {
								header: withCtx(() => [createBaseVNode("div", _hoisted_36, [_cache[49] || (_cache[49] = createBaseVNode("span", { class: "card-title" }, "本月业绩", -1)), canOpenOwnerMonitor.value ? (openBlock(), createBlock(_component_el_link, {
									key: 0,
									type: "primary",
									underline: false,
									onClick: _cache[9] || (_cache[9] = ($event) => unref(router).push("/dashboard/cockpit"))
								}, {
									default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("查看详情", -1)])]),
									_: 1
								})) : createCommentVNode("", true)])]),
								default: withCtx(() => [createBaseVNode("div", _hoisted_37, [
									createBaseVNode("div", _hoisted_38, [createBaseVNode("div", _hoisted_39, toDisplayString(perf.dealCount), 1), _cache[50] || (_cache[50] = createBaseVNode("div", { class: "perf-label" }, "成单数", -1))]),
									createBaseVNode("div", _hoisted_40, [createBaseVNode("div", _hoisted_41, toDisplayString(formatMoney(perf.dealAmount)), 1), _cache[51] || (_cache[51] = createBaseVNode("div", { class: "perf-label" }, "成交金额", -1))]),
									createBaseVNode("div", _hoisted_42, [createBaseVNode("div", _hoisted_43, [createTextVNode(toDisplayString(perf.conversionRate), 1), _cache[52] || (_cache[52] = createBaseVNode("em", null, "%", -1))]), _cache[53] || (_cache[53] = createBaseVNode("div", { class: "perf-label" }, "线索转化率", -1))])
								]), _cache[54] || (_cache[54] = createBaseVNode("p", { class: "perf-note" }, "成单数 / 成交金额取我的订单中本月已完成单据聚合；转化率取我数据范围内线索转化汇总。", -1))]),
								_: 1
							}),
							createVNode(_component_el_card, {
								class: "approval-card",
								shadow: "never"
							}, {
								default: withCtx(() => [createVNode(_component_el_tabs, {
									modelValue: activeTab.value,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => activeTab.value = $event),
									class: "approval-tabs"
								}, {
									default: withCtx(() => [createVNode(_component_el_tab_pane, {
										name: "cc",
										label: `抄送我的 (${flow.cc})`
									}, {
										default: withCtx(() => [ccLoading.value ? (openBlock(), createBlock(_component_el_skeleton, {
											key: 0,
											rows: 3,
											animated: "",
											class: "tab-loading"
										})) : ccList.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
											key: 1,
											description: "暂无抄送给我的事项",
											"image-size": 70
										})) : (openBlock(), createElementBlock("div", _hoisted_44, [(openBlock(true), createElementBlock(Fragment, null, renderList(ccList.value, (item) => {
											return openBlock(), createElementBlock("div", {
												key: item.id,
												class: "flow-row"
											}, [createBaseVNode("div", _hoisted_45, [createBaseVNode("span", _hoisted_46, toDisplayString(item.title), 1), createBaseVNode("span", _hoisted_47, "申请人：" + toDisplayString(item.applicant || "—") + " · 审批人：" + toDisplayString(item.approver || "—"), 1)]), createBaseVNode("div", _hoisted_48, [createVNode(_component_el_tag, {
												type: item.statusType,
												size: "small",
												effect: "light"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(item.statusLabel), 1)]),
												_: 2
											}, 1032, ["type"]), createBaseVNode("span", _hoisted_49, toDisplayString(item.date), 1)])]);
										}), 128))]))]),
										_: 1
									}, 8, ["label"]), createVNode(_component_el_tab_pane, {
										name: "done",
										label: `已完成事项 (${flow.done})`
									}, {
										default: withCtx(() => [doneLoading.value ? (openBlock(), createBlock(_component_el_skeleton, {
											key: 0,
											rows: 3,
											animated: "",
											class: "tab-loading"
										})) : doneList.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
											key: 1,
											description: "暂无已完成事项",
											"image-size": 70
										})) : (openBlock(), createElementBlock("div", _hoisted_50, [(openBlock(true), createElementBlock(Fragment, null, renderList(doneList.value, (item) => {
											return openBlock(), createElementBlock("div", {
												key: item.id,
												class: "flow-row",
												onClick: ($event) => openInstance(item.instanceId)
											}, [createBaseVNode("div", _hoisted_52, [createBaseVNode("span", _hoisted_53, toDisplayString(item.title), 1), createBaseVNode("span", _hoisted_54, "申请人：" + toDisplayString(item.applicant || "—") + " · 审批人：" + toDisplayString(item.approver || "—"), 1)]), createBaseVNode("div", _hoisted_55, [createVNode(_component_el_tag, {
												type: item.statusType,
												size: "small",
												effect: "light"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(item.statusLabel), 1)]),
												_: 2
											}, 1032, ["type"]), createBaseVNode("span", _hoisted_56, toDisplayString(item.date), 1)])], 8, _hoisted_51);
										}), 128))]))]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}), createVNode(_component_el_col, {
						xs: 24,
						lg: 8
					}, {
						default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_card, {
							class: "memo-card",
							shadow: "never"
						}, {
							header: withCtx(() => [createBaseVNode("div", _hoisted_57, [_cache[56] || (_cache[56] = createBaseVNode("div", { class: "report-header-left" }, [createBaseVNode("span", { class: "card-title" }, "备忘速览"), createBaseVNode("span", { class: "tc-sub" }, "仅自己可见")], -1)), createVNode(_component_el_button, {
								type: "primary",
								size: "small",
								onClick: _cache[11] || (_cache[11] = ($event) => openMemoPage())
							}, {
								default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("进入备忘录", -1)])]),
								_: 1
							})])]),
							default: withCtx(() => [createBaseVNode("div", _hoisted_58, [
								createBaseVNode("div", _hoisted_59, [createBaseVNode("b", null, toDisplayString(memoSummary.pending), 1), _cache[57] || (_cache[57] = createBaseVNode("span", null, "待完成", -1))]),
								createBaseVNode("div", { class: normalizeClass(["memo-summary-item", { danger: memoSummary.overdue > 0 }]) }, [createBaseVNode("b", null, toDisplayString(memoSummary.overdue), 1), _cache[58] || (_cache[58] = createBaseVNode("span", null, "已超时", -1))], 2),
								createBaseVNode("div", _hoisted_60, [createBaseVNode("b", null, toDisplayString(memoSummary.doneToday), 1), _cache[59] || (_cache[59] = createBaseVNode("span", null, "今日完成", -1))])
							]), memoHomeList.value.length === 0 ? (openBlock(), createElementBlock("div", {
								key: 0,
								class: "empty-tip memo-empty",
								onClick: _cache[12] || (_cache[12] = ($event) => openMemoPage())
							}, " 暂无备忘，点击新建 ")) : (openBlock(), createElementBlock("div", _hoisted_61, [(openBlock(true), createElementBlock(Fragment, null, renderList(memoHomeList.value, (item) => {
								return openBlock(), createElementBlock("div", {
									key: item.id,
									class: normalizeClass(["memo-row", {
										done: item.completed,
										overdue: isMemoOverdue(item)
									}]),
									onClick: ($event) => openMemoPage(item.id)
								}, [
									createVNode(_component_el_checkbox, {
										"model-value": !!item.completed,
										onClick: _cache[13] || (_cache[13] = withModifiers(() => {}, ["stop"])),
										onChange: (val) => toggleMemo(item, !!val)
									}, null, 8, ["model-value", "onChange"]),
									createBaseVNode("div", _hoisted_63, toDisplayString(formatMemoHomeTime(item.remindTime, item.completed)), 1),
									createBaseVNode("div", _hoisted_64, [createBaseVNode("div", _hoisted_65, toDisplayString(item.content), 1), createBaseVNode("div", _hoisted_66, toDisplayString(item.category || "未分类") + " · " + toDisplayString(item.completed ? "已完成" : "待处理"), 1)]),
									createVNode(_component_el_tag, {
										type: priorityMeta(item.priority).type,
										size: "small",
										effect: "light"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(priorityMeta(item.priority).label), 1)]),
										_: 2
									}, 1032, ["type"])
								], 10, _hoisted_62);
							}), 128))]))]),
							_: 1
						})), [[_directive_loading, memoLoading.value]]), withDirectives((openBlock(), createBlock(_component_el_card, {
							class: "report-card",
							shadow: "never"
						}, {
							header: withCtx(() => [createBaseVNode("div", _hoisted_67, [createBaseVNode("div", _hoisted_68, [_cache[62] || (_cache[62] = createBaseVNode("span", { class: "card-title" }, "工作日报", -1)), createVNode(_component_el_radio_group, {
								modelValue: reportView.value,
								"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => reportView.value = $event),
								size: "small",
								class: "report-view-switch",
								onChange: onReportViewChange
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_button, { label: "mine" }, {
									default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("我的", -1)])]),
									_: 1
								}), createVNode(_component_el_radio_button, { label: "cc" }, {
									default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("抄送我的", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]), createVNode(_component_el_button, {
								type: "primary",
								size: "small",
								plain: "",
								onClick: openReportDialog
							}, {
								default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("填写日报", -1)])]),
								_: 1
							})])]),
							default: withCtx(() => [reportView.value === "mine" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [reportList.value.length === 0 ? (openBlock(), createElementBlock("div", {
								key: 0,
								class: "empty-tip report-empty",
								onClick: openReportDialog
							}, toDisplayString(reportLoadError.value ? "日报加载失败，点击可重新填写" : "暂无日报记录，点击右上角填写"), 1)) : (openBlock(), createElementBlock("div", _hoisted_69, [(openBlock(true), createElementBlock(Fragment, null, renderList(reportList.value, (r) => {
								return openBlock(), createElementBlock("div", {
									key: r.id,
									class: "report-item"
								}, [
									createBaseVNode("div", _hoisted_70, [createBaseVNode("span", _hoisted_71, toDisplayString(r.date), 1), createVNode(_component_el_button, {
										link: "",
										type: "danger",
										size: "small",
										onClick: ($event) => removeReport(r.id)
									}, {
										default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("删除", -1)])]),
										_: 1
									}, 8, ["onClick"])]),
									createBaseVNode("div", _hoisted_72, [_cache[65] || (_cache[65] = createBaseVNode("span", { class: "report-block-label" }, "今日工作", -1)), createBaseVNode("p", null, toDisplayString(r.today), 1)]),
									r.tomorrow ? (openBlock(), createElementBlock("div", _hoisted_73, [_cache[66] || (_cache[66] = createBaseVNode("span", { class: "report-block-label" }, "明日计划", -1)), createBaseVNode("p", null, toDisplayString(r.tomorrow), 1)])) : createCommentVNode("", true)
								]);
							}), 128))])), createBaseVNode("p", { class: normalizeClass(["report-tip", { error: reportLoadError.value }]) }, toDisplayString(reportLoadError.value ? "当前无法读取服务器日报，请稍后刷新重试。" : "日报已保存到系统，换设备登录也能查看最近 30 条记录。"), 3)], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [ccReportList.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_74, toDisplayString(ccReportLoadError.value ? "抄送日报加载失败，请稍后刷新重试" : "暂无抄送给我的日报"), 1)) : (openBlock(), createElementBlock("div", _hoisted_75, [(openBlock(true), createElementBlock(Fragment, null, renderList(ccReportList.value, (r) => {
								return openBlock(), createElementBlock("div", {
									key: r.id,
									class: "report-item"
								}, [createBaseVNode("div", _hoisted_76, [createBaseVNode("span", _hoisted_77, toDisplayString(r.authorName || "同事") + " · " + toDisplayString(r.date), 1)]), createBaseVNode("div", _hoisted_78, [_cache[67] || (_cache[67] = createBaseVNode("span", { class: "report-block-label" }, "今日工作", -1)), createBaseVNode("p", null, toDisplayString(r.today), 1)])]);
							}), 128))])), createBaseVNode("p", { class: normalizeClass(["report-tip", { error: ccReportLoadError.value }]) }, toDisplayString(ccReportLoadError.value ? "当前无法读取抄送日报，请稍后刷新重试。" : "这里显示同事抄送给你的日报（最近 30 条）。"), 3)], 64))]),
							_: 1
						})), [[_directive_loading, reportView.value === "mine" ? reportLoading.value : ccReportLoading.value]])]),
						_: 1
					})]),
					_: 1
				}),
				createVNode(_component_el_card, {
					class: "order-card",
					shadow: "never"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_79, [_cache[69] || (_cache[69] = createBaseVNode("span", { class: "card-title" }, "我的订单", -1)), createVNode(_component_el_link, {
						type: "primary",
						underline: false,
						onClick: _cache[15] || (_cache[15] = ($event) => unref(router).push("/order/bill"))
					}, {
						default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("查看全部", -1)])]),
						_: 1
					})])]),
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: orderList.value,
						size: "default",
						"empty-text": "暂无订单记录",
						style: { "width": "100%" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "orderNo",
								label: "订单编号",
								"min-width": "160",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								prop: "customerName",
								label: "客户名称",
								"min-width": "140",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "业务类型",
								"min-width": "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.serviceTypeLabel), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "金额",
								"min-width": "120",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatMoney(row.finalAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								"min-width": "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.statusType,
									size: "small",
									effect: "light"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.statusLabel), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "日期",
								"min-width": "120"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString((row.submitTime || row.createTime || "").slice(0, 10) || "—"), 1)]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, orderLoading.value]])]),
					_: 1
				}),
				createVNode(_component_el_drawer, {
					modelValue: memoDrawerVisible.value,
					"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => memoDrawerVisible.value = $event),
					title: "我的备忘录",
					size: "720px",
					class: "memo-drawer"
				}, {
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_80, [createVNode(_component_el_form, { "label-position": "top" }, {
							default: withCtx(() => [
								createVNode(_component_el_form_item, { label: "备忘内容" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: memoForm.content,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => memoForm.content = $event),
										type: "textarea",
										rows: 4,
										maxlength: "500",
										"show-word-limit": "",
										placeholder: "例如：提醒客户补开户地址材料"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createBaseVNode("div", _hoisted_81, [createVNode(_component_el_form_item, { label: "提醒时间" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: memoForm.remindTime,
										"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => memoForm.remindTime = $event),
										type: "datetime",
										"value-format": "YYYY-MM-DD HH:mm:ss",
										placeholder: "选择时间",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}), createVNode(_component_el_form_item, { label: "优先级" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: memoForm.priority,
										"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => memoForm.priority = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [
											createVNode(_component_el_option, {
												label: "重要",
												value: 3
											}),
											createVNode(_component_el_option, {
												label: "普通",
												value: 2
											}),
											createVNode(_component_el_option, {
												label: "低",
												value: 1
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})]),
								createBaseVNode("div", _hoisted_82, [createVNode(_component_el_form_item, { label: "分类" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: memoForm.category,
										"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => memoForm.category = $event),
										filterable: "",
										"allow-create": "",
										clearable: "",
										"default-first-option": "",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [
											createVNode(_component_el_option, {
												label: "客户跟进",
												value: "客户跟进"
											}),
											createVNode(_component_el_option, {
												label: "财务协同",
												value: "财务协同"
											}),
											createVNode(_component_el_option, {
												label: "团队管理",
												value: "团队管理"
											}),
											createVNode(_component_el_option, {
												label: "个人事项",
												value: "个人事项"
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}), createVNode(_component_el_form_item, { label: "状态" }, {
									default: withCtx(() => [createVNode(_component_el_switch, {
										modelValue: memoForm.completed,
										"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => memoForm.completed = $event),
										"active-text": "已完成",
										"inactive-text": "未完成"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								createBaseVNode("div", _hoisted_83, [memoEditingId.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									plain: "",
									onClick: resetMemoForm
								}, {
									default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("新增一条", -1)])]),
									_: 1
								})) : createCommentVNode("", true), createVNode(_component_el_button, {
									type: "primary",
									onClick: submitMemo
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(memoEditingId.value ? "保存修改" : "新增备忘"), 1)]),
									_: 1
								})])
							]),
							_: 1
						})]),
						createBaseVNode("div", _hoisted_84, [createVNode(_component_el_radio_group, {
							modelValue: memoFilter.value,
							"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => memoFilter.value = $event),
							size: "small",
							onChange: loadMemoList
						}, {
							default: withCtx(() => [
								createVNode(_component_el_radio_button, { label: "today" }, {
									default: withCtx(() => [..._cache[71] || (_cache[71] = [createTextVNode("今天", -1)])]),
									_: 1
								}),
								createVNode(_component_el_radio_button, { label: "week" }, {
									default: withCtx(() => [..._cache[72] || (_cache[72] = [createTextVNode("本周", -1)])]),
									_: 1
								}),
								createVNode(_component_el_radio_button, { label: "pending" }, {
									default: withCtx(() => [..._cache[73] || (_cache[73] = [createTextVNode("未完成", -1)])]),
									_: 1
								}),
								createVNode(_component_el_radio_button, { label: "done" }, {
									default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("已完成", -1)])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["modelValue"]), createVNode(_component_el_input, {
							modelValue: memoKeyword.value,
							"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => memoKeyword.value = $event),
							clearable: "",
							size: "small",
							placeholder: "搜索",
							class: "memo-search",
							onKeyup: withKeys(loadMemoList, ["enter"]),
							onClear: loadMemoList
						}, null, 8, ["modelValue"])]),
						memoListLoading.value ? (openBlock(), createBlock(_component_el_skeleton, {
							key: 0,
							rows: 4,
							animated: ""
						})) : memoList.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
							key: 1,
							description: "暂无备忘",
							"image-size": 80
						})) : (openBlock(), createElementBlock("div", _hoisted_85, [(openBlock(true), createElementBlock(Fragment, null, renderList(memoList.value, (item) => {
							return openBlock(), createElementBlock("div", {
								key: item.id,
								class: normalizeClass(["memo-drawer-row", {
									done: item.completed,
									overdue: isMemoOverdue(item)
								}])
							}, [
								createVNode(_component_el_checkbox, {
									"model-value": !!item.completed,
									onChange: (val) => toggleMemo(item, !!val)
								}, null, 8, ["model-value", "onChange"]),
								createBaseVNode("div", {
									class: "memo-drawer-main",
									onClick: ($event) => editMemo(item)
								}, [createBaseVNode("div", _hoisted_87, toDisplayString(item.content), 1), createBaseVNode("div", _hoisted_88, toDisplayString(formatMemoTime(item.remindTime, item.completed)) + " · " + toDisplayString(item.category || "未分类"), 1)], 8, _hoisted_86),
								createBaseVNode("div", _hoisted_89, [createVNode(_component_el_tag, {
									type: priorityMeta(item.priority).type,
									size: "small",
									effect: "light"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(priorityMeta(item.priority).label), 1)]),
									_: 2
								}, 1032, ["type"]), createVNode(_component_el_button, {
									link: "",
									type: "danger",
									size: "small",
									onClick: ($event) => removeMemo(item)
								}, {
									default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])])
							], 2);
						}), 128))]))
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: reportDialogVisible.value,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => reportDialogVisible.value = $event),
					title: "填写工作日报",
					width: "520px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => reportDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitReport
					}, {
						default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("提交", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: reportForm.date,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => reportForm.date = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "今日工作" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: reportForm.today,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => reportForm.today = $event),
									type: "textarea",
									rows: 4,
									placeholder: "今天完成了哪些工作？"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "明日计划" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: reportForm.tomorrow,
									"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => reportForm.tomorrow = $event),
									type: "textarea",
									rows: 3,
									placeholder: "明天准备做什么？（可选）"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "抄送给" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: reportForm.ccUserIds,
									"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => reportForm.ccUserIds = $event),
									multiple: "",
									filterable: "",
									clearable: "",
									placeholder: "选择要抄送的同事（可选）",
									style: { "width": "100%" },
									loading: colleagueLoading.value
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagueList.value, (c) => {
										return openBlock(), createBlock(_component_el_option, {
											key: c.userId,
											label: c.deptName ? `${c.name}（${c.deptName}）` : c.name,
											value: c.userId
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue", "loading"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-9be4afbe"]]);
//#endregion
export { home_default as default };

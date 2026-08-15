import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, dt as h, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, C as ElResult, F as ElEmpty, _ as ElTableColumn, c as ElSegmented, fn as info_filled_default, g as ElTable, h as ElTabs, it as ElTag, m as ElTabPane, ot as ElButton, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as get } from "./request-CZ5tKmxn.js";
import { l as useUserStore, s as isOwnerRole } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as callRecordApi } from "./call-record-vMQDzD4r.js";
//#region src/api/dashboard.ts
/** 老板总控台:一次拉全部今日关键统计 + 异常清单 + 员工执行排行(仅老板/超管) */
function getBossOverview() {
	return get("/dashboard/boss/overview");
}
//#endregion
//#region src/api/analysis.ts
/** 经营分析(只读聚合,老板/主管/经理可见) */
var analysisApi = {
	overview: (year) => get("/analysis/overview", { year }),
	newOrders: (year, month) => get("/analysis/new-orders", {
		year,
		month
	}),
	renewal: (year) => get("/analysis/renewal", { year }),
	loss: () => get("/analysis/loss"),
	customerValue: () => get("/analysis/customer-value"),
	leadRoi: (start, end) => get("/analysis/lead-roi", {
		start,
		end
	}),
	sales: (year) => get("/analysis/sales", { year })
};
//#endregion
//#region src/api/owner-monitor.ts
function getOwnerCashStats() {
	return get("/dashboard/owner-monitor/cash-stats");
}
//#endregion
//#region src/views/dashboard/owner-monitor.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = {
	key: 0,
	class: "owner-monitor forbidden"
};
var _hoisted_2 = {
	key: 1,
	class: "owner-monitor"
};
var _hoisted_3 = { class: "monitor-header" };
var _hoisted_4 = { class: "title-row" };
var _hoisted_5 = { class: "header-actions" };
var _hoisted_6 = { class: "truth-banner" };
var _hoisted_7 = { class: "updated" };
var _hoisted_8 = { class: "section-block priority-section" };
var _hoisted_9 = { class: "priority-grid" };
var _hoisted_10 = ["disabled", "onClick"];
var _hoisted_11 = {
	key: 1,
	id: "owner-risk-details",
	class: "risk-detail-grid"
};
var _hoisted_12 = { class: "section-block" };
var _hoisted_13 = { class: "metric-grid cash-grid" };
var _hoisted_14 = { class: "two-column" };
var _hoisted_15 = { class: "section-block" };
var _hoisted_16 = { class: "sales-section-head" };
var _hoisted_17 = { class: "call-range-control" };
var _hoisted_18 = { class: "metric-grid compact-grid" };
var _hoisted_19 = { class: "section-block" };
var _hoisted_20 = {
	key: 0,
	class: "rank-list"
};
var _hoisted_21 = { class: "rank-no" };
var _hoisted_22 = { class: "rank-person" };
var _hoisted_23 = { class: "rank-bar" };
var _hoisted_24 = {
	key: 3,
	class: "skeleton-lines"
};
var _hoisted_25 = { class: "two-column" };
var _hoisted_26 = { class: "section-block" };
var _hoisted_27 = { class: "metric-grid compact-grid" };
var _hoisted_28 = { class: "section-block" };
var _hoisted_29 = { class: "analysis-layout" };
var _hoisted_30 = { class: "section-block" };
var _hoisted_31 = { class: "section-block readiness-panel" };
var _hoisted_32 = { class: "readiness-list" };
var _hoisted_33 = { class: "ready" };
var _hoisted_34 = { class: "pending" };
var _hoisted_35 = { class: "pending" };
var _hoisted_36 = { class: "stopped" };
//#endregion
//#region src/views/dashboard/owner-monitor.vue
var owner_monitor_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "owner-monitor",
	setup(__props) {
		const SectionTitle = defineComponent({
			props: {
				title: String,
				subtitle: String,
				source: String
			},
			setup(props) {
				return () => h("div", { class: "section-title" }, [h("div", [h("h2", props.title), props.subtitle ? h("p", props.subtitle) : null]), props.source ? h("span", { class: "source-pill" }, props.source) : null]);
			}
		});
		const MetricCard = defineComponent({
			props: {
				label: String,
				value: String,
				note: String,
				pending: Boolean,
				tone: String
			},
			setup(props) {
				return () => h("article", { class: ["metric-card", props.tone || ""] }, [
					h("span", props.label),
					h("strong", props.pending ? "—" : props.value),
					h("small", props.note)
				]);
			}
		});
		const SectionError = defineComponent({
			props: { message: String },
			emits: ["retry"],
			setup(props, { emit }) {
				return () => h("div", { class: "section-error" }, [h("span", `数据加载失败：${props.message || "请稍后重试"}。未使用旧数据。`), h("button", {
					type: "button",
					onClick: () => emit("retry")
				}, "重试")]);
			}
		});
		const RiskList = defineComponent({
			props: {
				anchorId: String,
				title: String,
				rows: {
					type: Array,
					default: () => []
				},
				emptyText: String,
				linkLabel: String
			},
			emits: ["open"],
			setup(props, { emit }) {
				const rowName = (row) => row.customerName || row.companyName || (row.orderId ? `订单 #${row.orderId}` : "未命名对象");
				const rowMeta = (row) => {
					const pieces = [];
					if (row.ownerName) pieces.push(`负责人 ${row.ownerName}`);
					const date = row.deadline || row.serviceEnd || row.earliestDue;
					if (date) pieces.push(`期限 ${String(date).slice(0, 10)}`);
					if (Number(row.arrears || 0) > 0) pieces.push(`欠费 ¥${Number(row.arrears).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`);
					return pieces.join(" · ") || "责任人与期限待补齐";
				};
				return () => h("article", {
					id: props.anchorId,
					class: "risk-list-card"
				}, [h("div", { class: "risk-list-head" }, [h("div", [h("h3", props.title), props.rows.length ? h("small", props.linkLabel ? `当前返回 ${props.rows.length} 条` : `当前返回 ${props.rows.length} 条（最多10条）· 处理入口待接入`) : null]), props.linkLabel ? h("button", {
					type: "button",
					onClick: () => emit("open")
				}, props.linkLabel) : null]), props.rows.length ? h("div", { class: "risk-list-rows" }, props.rows.slice(0, 10).map((row) => h("div", {
					class: "risk-list-row",
					key: row.id || row.orderId || rowName(row)
				}, [h("b", rowName(row)), h("span", rowMeta(row))]))) : h("p", { class: "risk-list-empty" }, props.emptyText || "当前无异常")]);
			}
		});
		const router = useRouter();
		const route = useRoute();
		const userStore = useUserStore();
		const canManage = computed(() => {
			var _userStore$userInfo;
			return isOwnerRole(userStore.roles, (_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id);
		});
		const scopeLabel = computed(() => "老板 · 当前租户全公司视图");
		const activeView = ref(route.query.view === "analysis" ? "analysis" : "overview");
		const callRange = ref("today");
		const rangeOptions = [
			{
				label: "今日",
				value: "today"
			},
			{
				label: "近7天",
				value: "7d"
			},
			{
				label: "近30天",
				value: "30d"
			}
		];
		const rangeLabel = computed(() => {
			var _rangeOptions$find;
			return ((_rangeOptions$find = rangeOptions.find((item) => item.value === callRange.value)) === null || _rangeOptions$find === void 0 ? void 0 : _rangeOptions$find.label) || "今日";
		});
		const loading = computed(() => Object.values(sectionStatus).some((state) => state === "loading"));
		const lastUpdated = ref("");
		const sectionStatus = reactive({
			boss: "idle",
			cash: "idle",
			call: "idle",
			sales: "idle",
			source: "idle"
		});
		const sectionErrors = reactive({
			boss: "",
			cash: "",
			call: "",
			sales: "",
			source: ""
		});
		const emptyCash = {
			todayAmount: 0,
			todayCount: 0,
			todayMatched: 0,
			todayUnmatched: 0,
			monthAmount: 0,
			monthMatched: 0,
			monthUnmatched: 0,
			waitingCount: 0,
			partialCount: 0,
			pendingReviewCount: 0,
			exceptionCount: 0,
			over24hCount: 0
		};
		const cash = reactive(_objectSpread2({}, emptyCash));
		const callData = ref(null);
		const salesFunnel = reactive({
			leadTotal: 0,
			following: 0,
			converted: 0,
			yearCalls: 0
		});
		const leadRows = ref([]);
		const boss = reactive({
			issue: {
				todayNew: 0,
				unhandled: 0,
				overdue: 0,
				p0: 0
			},
			book: {
				active: 0,
				completed: 0,
				processing: 0,
				overdue: 0
			},
			sales: {
				todayLeads: 0,
				todayFollows: 0
			},
			receipt: {
				todayDue: 0,
				todayReceived: 0,
				overdueArrears: 0,
				arrearsCount: 0
			},
			employees: [],
			exceptions: {
				overdueIssues: [],
				p0Issues: [],
				bookkeepingAbnormal: [],
				arrears: []
			}
		});
		const callSummary = computed(() => {
			var _callData$value;
			return ((_callData$value = callData.value) === null || _callData$value === void 0 ? void 0 : _callData$value.summary) || {
				totalCalls: 0,
				connectedCount: 0,
				missedCount: 0,
				failedCount: 0,
				validCount: 0,
				recordCount: 0,
				highIntentCount: 0,
				connectRate: 0,
				validRate: 0,
				totalDuration: 0,
				totalDurationText: "0m 0s",
				avgDuration: 0,
				avgDurationText: "0m 0s"
			};
		});
		const previousCallSummary = computed(() => {
			var _callData$value2;
			return ((_callData$value2 = callData.value) === null || _callData$value2 === void 0 ? void 0 : _callData$value2.previousSummary) || callSummary.value;
		});
		const callSourceLabel = computed(() => {
			var _callData$value3;
			const latest = (_callData$value3 = callData.value) === null || _callData$value3 === void 0 || (_callData$value3 = _callData$value3.summary) === null || _callData$value3 === void 0 ? void 0 : _callData$value3.latestCallTime;
			return latest ? `最新通话时间 ${String(latest).replace("T", " ").slice(0, 16)}` : "云客话单 / CRM";
		});
		const topAgents = computed(() => {
			var _callData$value4;
			return (((_callData$value4 = callData.value) === null || _callData$value4 === void 0 ? void 0 : _callData$value4.agents) || []).slice(0, 6);
		});
		const maxCalls = computed(() => Math.max(...topAgents.value.map((item) => Number(item.callCount || 0)), 1));
		const priorityCards = computed(() => [
			{
				key: "overdue-issue",
				label: "逾期客户工单",
				value: boss.issue.overdue,
				statusKey: "boss",
				note: "进入逾期清单",
				tone: alertTone(boss.issue.overdue, "boss", "danger"),
				path: "/customer-issue/list",
				query: { view: "overdue" },
				anchor: ""
			},
			{
				key: "p0",
				label: "P0 客户工单",
				value: boss.issue.p0,
				statusKey: "boss",
				note: "立即处理",
				tone: alertTone(boss.issue.p0, "boss", "danger"),
				path: "/customer-issue/list",
				query: { view: "p0" },
				anchor: ""
			},
			{
				key: "unhandled",
				label: "未处理客户问题",
				value: boss.issue.unhandled,
				statusKey: "boss",
				note: "进入未处理清单",
				tone: alertTone(boss.issue.unhandled, "boss", "warning"),
				path: "/customer-issue/list",
				query: { view: "unhandled" },
				anchor: ""
			},
			{
				key: "arrears",
				label: "应收欠费订单",
				value: boss.receipt.arrearsCount,
				statusKey: "boss",
				note: "查看欠费订单明细",
				tone: alertTone(boss.receipt.arrearsCount, "boss", "warning"),
				path: "",
				query: {},
				anchor: "risk-arrears"
			}
		]);
		const SOURCE_LABELS = {
			1: "工商公开名单",
			2: "客户转介绍",
			3: "美团投流",
			4: "抖音投流",
			5: "线下来客",
			6: "其他投流",
			7: "名单采购/电销",
			8: "渠道合作",
			9: "私域二开",
			10: "其他"
		};
		function unwrap(response) {
			var _response$data;
			return (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
		}
		function errorMessage(error) {
			return (error === null || error === void 0 ? void 0 : error.message) || "服务暂时不可用";
		}
		function requireObject(value, label) {
			if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label}返回结构不完整`);
			return value;
		}
		function requireArray(value, label) {
			if (!Array.isArray(value)) throw new Error(`${label}返回结构不完整`);
			return value;
		}
		function requireNumberFields(value, keys, label) {
			const source = requireObject(value, label);
			const result = {};
			keys.forEach((key) => {
				const raw = source[key];
				if (raw === null || raw === void 0 || raw === "" || !Number.isFinite(Number(raw))) throw new Error(`${label}缺少字段 ${key}`);
				result[key] = Number(raw);
			});
			return result;
		}
		function validateCallData(value) {
			const data = requireObject(value, "云客话单");
			const summaryKeys = [
				"totalCalls",
				"connectedCount",
				"missedCount",
				"failedCount",
				"validCount",
				"recordCount",
				"highIntentCount",
				"connectRate",
				"validRate",
				"totalDuration",
				"avgDuration"
			];
			requireNumberFields(data.summary, summaryKeys, "云客话单本期汇总");
			requireNumberFields(data.previousSummary, summaryKeys, "云客话单上期汇总");
			requireArray(data.agents, "云客坐席排行").forEach((row, index) => requireNumberFields(row, [
				"callCount",
				"connectedCount",
				"missedCount",
				"validCount",
				"recordCount",
				"connectRate",
				"totalDuration"
			], `云客坐席排行第${index + 1}行`));
			requireArray(data.trend, "云客话单趋势").forEach((row, index) => requireNumberFields(row, [
				"callCount",
				"connectedCount",
				"validCount",
				"totalDuration"
			], `云客话单趋势第${index + 1}行`));
			requireNumberFields(data.todo, [
				"callbackCount",
				"highIntentCount",
				"recordReviewCount",
				"lowConnectAgentCount"
			], "云客行动项");
			return data;
		}
		function validateCashData(value) {
			return requireNumberFields(value, Object.keys(emptyCash), "收款日记账");
		}
		function validateBossData(value) {
			const data = requireObject(value, "老板风险");
			const exceptions = requireObject(data.exceptions, "老板异常清单");
			const employees = requireArray(data.employees, "员工执行");
			employees.forEach((row, index) => requireNumberFields(row, [
				"todayCount",
				"overdueCount",
				"doneCount",
				"totalCount",
				"doneRate"
			], `员工执行第${index + 1}行`));
			return {
				issue: requireNumberFields(data.customerIssue, [
					"todayNew",
					"unhandled",
					"overdue",
					"p0"
				], "客户问题"),
				book: requireNumberFields(data.bookkeeping, [
					"active",
					"completed",
					"processing",
					"overdue"
				], "代账服务"),
				sales: requireNumberFields(data.sales, ["todayLeads", "todayFollows"], "今日销售行动"),
				receipt: requireNumberFields(data.receipt, [
					"todayDue",
					"todayReceived",
					"overdueArrears",
					"arrearsCount"
				], "应收欠费"),
				employees,
				exceptions: {
					overdueIssues: requireArray(exceptions.overdueIssues, "逾期客户工单"),
					p0Issues: requireArray(exceptions.p0Issues, "P0客户工单"),
					bookkeepingAbnormal: requireArray(exceptions.bookkeepingAbnormal, "代账逾期"),
					arrears: requireArray(exceptions.arrears, "欠费订单")
				}
			};
		}
		function clearSection(key) {
			if (key === "boss") {
				Object.assign(boss.issue, {
					todayNew: 0,
					unhandled: 0,
					overdue: 0,
					p0: 0
				});
				Object.assign(boss.book, {
					active: 0,
					completed: 0,
					processing: 0,
					overdue: 0
				});
				Object.assign(boss.sales, {
					todayLeads: 0,
					todayFollows: 0
				});
				Object.assign(boss.receipt, {
					todayDue: 0,
					todayReceived: 0,
					overdueArrears: 0,
					arrearsCount: 0
				});
				boss.employees = [];
				boss.exceptions.overdueIssues = [];
				boss.exceptions.p0Issues = [];
				boss.exceptions.bookkeepingAbnormal = [];
				boss.exceptions.arrears = [];
			} else if (key === "cash") Object.assign(cash, emptyCash);
			else if (key === "call") callData.value = null;
			else if (key === "sales") Object.assign(salesFunnel, {
				leadTotal: 0,
				following: 0,
				converted: 0,
				yearCalls: 0
			});
			else if (key === "source") leadRows.value = [];
		}
		const requestGeneration = reactive({
			boss: 0,
			cash: 0,
			call: 0,
			sales: 0,
			source: 0
		});
		function runSection(_x, _x2, _x3) {
			return _runSection.apply(this, arguments);
		}
		function _runSection() {
			_runSection = _asyncToGenerator(function* (key, loader, commit) {
				const generation = ++requestGeneration[key];
				sectionStatus[key] = "loading";
				sectionErrors[key] = "";
				try {
					const data = yield loader();
					if (generation !== requestGeneration[key]) return;
					commit(data);
					sectionStatus[key] = "ready";
				} catch (error) {
					if (generation !== requestGeneration[key]) return;
					clearSection(key);
					sectionStatus[key] = "error";
					sectionErrors[key] = errorMessage(error);
				}
			});
			return _runSection.apply(this, arguments);
		}
		function loadBossData() {
			return _loadBossData.apply(this, arguments);
		}
		function _loadBossData() {
			_loadBossData = _asyncToGenerator(function* () {
				yield runSection("boss", _asyncToGenerator(function* () {
					return validateBossData(unwrap(yield getBossOverview()));
				}), (data) => {
					Object.assign(boss.issue, data.issue);
					Object.assign(boss.book, data.book);
					Object.assign(boss.sales, data.sales);
					Object.assign(boss.receipt, data.receipt);
					boss.employees = data.employees;
					Object.assign(boss.exceptions, data.exceptions);
				});
			});
			return _loadBossData.apply(this, arguments);
		}
		function loadCashData() {
			return _loadCashData.apply(this, arguments);
		}
		function _loadCashData() {
			_loadCashData = _asyncToGenerator(function* () {
				yield runSection("cash", _asyncToGenerator(function* () {
					return validateCashData(unwrap(yield getOwnerCashStats()));
				}), (data) => Object.assign(cash, emptyCash, data));
			});
			return _loadCashData.apply(this, arguments);
		}
		function loadCallData() {
			return _loadCallData.apply(this, arguments);
		}
		function _loadCallData() {
			_loadCallData = _asyncToGenerator(function* () {
				const range = callRange.value;
				yield runSection("call", _asyncToGenerator(function* () {
					return validateCallData(unwrap(yield callRecordApi.dashboard({ range })));
				}), (data) => {
					callData.value = data;
				});
			});
			return _loadCallData.apply(this, arguments);
		}
		function loadSalesData() {
			return _loadSalesData.apply(this, arguments);
		}
		function _loadSalesData() {
			_loadSalesData = _asyncToGenerator(function* () {
				yield runSection("sales", _asyncToGenerator(function* () {
					const data = requireObject(unwrap(yield analysisApi.sales((/* @__PURE__ */ new Date()).getFullYear())), "CRM销售漏斗");
					const funnel = requireArray(data.funnel, "CRM销售漏斗");
					const calls = requireArray(data.calls, "CRM年度通话");
					funnel.forEach((row, index) => requireNumberFields(row, ["status", "cnt"], `CRM销售漏斗第${index + 1}行`));
					const byStatus = (status) => {
						var _funnel$find;
						return Number(((_funnel$find = funnel.find((row) => Number(row.status) === status)) === null || _funnel$find === void 0 ? void 0 : _funnel$find.cnt) || 0);
					};
					return {
						leadTotal: byStatus(1) + byStatus(2) + byStatus(3),
						following: byStatus(2),
						converted: byStatus(3),
						yearCalls: calls.reduce((sum, row) => sum + Number(row.cnt || 0), 0)
					};
				}), (data) => Object.assign(salesFunnel, data));
			});
			return _loadSalesData.apply(this, arguments);
		}
		function loadSourceData() {
			return _loadSourceData.apply(this, arguments);
		}
		function _loadSourceData() {
			_loadSourceData = _asyncToGenerator(function* () {
				yield runSection("source", _asyncToGenerator(function* () {
					return requireArray(requireObject(unwrap(yield analysisApi.leadRoi()), "线索来源转化").leads, "线索来源转化").map((row, index) => {
						requireNumberFields(row, ["lead_cnt", "converted"], `线索来源转化第${index + 1}行`);
						return _objectSpread2(_objectSpread2({}, row), {}, { sourceLabel: SOURCE_LABELS[Number(row.source)] || `来源 ${row.source || "未标记"}` });
					});
				}), (data) => {
					leadRows.value = data;
				});
			});
			return _loadSourceData.apply(this, arguments);
		}
		function loadAll() {
			return _loadAll.apply(this, arguments);
		}
		function _loadAll() {
			_loadAll = _asyncToGenerator(function* () {
				if (!canManage.value) return;
				const jobs = [
					loadCashData(),
					loadCallData(),
					loadSalesData(),
					loadSourceData(),
					loadBossData()
				];
				yield Promise.allSettled(jobs);
				lastUpdated.value = (/* @__PURE__ */ new Date()).toLocaleTimeString("zh-CN", {
					hour: "2-digit",
					minute: "2-digit"
				});
			});
			return _loadAll.apply(this, arguments);
		}
		function metric(value, key) {
			return sectionStatus[key] === "ready" ? count(value) : "—";
		}
		function count(value) {
			return Number(value || 0).toLocaleString("zh-CN");
		}
		function money(value) {
			const amount = Number(value || 0);
			if (Math.abs(amount) >= 1e4) return `¥${(amount / 1e4).toFixed(1)}万`;
			return `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
		}
		function percent(value) {
			return `${Number(value || 0).toFixed(1).replace(/\.0$/, "")}%`;
		}
		function callDelta(current, previous, unit) {
			if (sectionStatus.call !== "ready") return "等待话单数据";
			const delta = Number(current || 0) - Number(previous || 0);
			if (Math.abs(delta) < .05) return "与上一周期持平";
			const value = unit === "个百分点" ? Math.abs(delta).toFixed(1).replace(/\.0$/, "") : count(Math.abs(delta));
			return `较上一周期${delta > 0 ? "增加" : "减少"} ${value}${unit}`;
		}
		function alertTone(value, key, warningTone) {
			if (sectionStatus[key] !== "ready") return "neutral";
			return Number(value || 0) > 0 ? warningTone : "healthy";
		}
		function conversionRate(row) {
			const total = Number(row.lead_cnt || 0);
			return total ? percent(Number(row.converted || 0) / total * 100) : "—";
		}
		function rankWidth(value) {
			return `${Math.max(Number(value || 0) / maxCalls.value * 100, 3)}%`;
		}
		function go(path, query) {
			router.push({
				path,
				query
			});
		}
		function openPriority(card) {
			var _document$getElementB;
			if (card.path) {
				go(card.path, card.query);
				return;
			}
			if (card.anchor) (_document$getElementB = document.getElementById(card.anchor)) === null || _document$getElementB === void 0 || _document$getElementB.scrollIntoView({
				behavior: "smooth",
				block: "start"
			});
		}
		watch(() => route.query.view, (view) => {
			activeView.value = view === "analysis" ? "analysis" : "overview";
		});
		watch(activeView, (view) => {
			if ((route.query.view === "analysis" ? "analysis" : "overview") === view) return;
			const query = _objectSpread2({}, route.query);
			if (view === "analysis") query.view = "analysis";
			else delete query.view;
			router.replace({ query });
		});
		onMounted(loadAll);
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_result = ElResult;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_segmented = ElSegmented;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			return !canManage.value ? (openBlock(), createElementBlock("div", _hoisted_1, [createVNode(_component_el_result, {
				icon: "warning",
				title: "无访问权限",
				"sub-title": "经营监控中心仅对老板和平台最高账号开放"
			}, {
				extra: withCtx(() => [createVNode(_component_el_button, {
					type: "primary",
					onClick: _cache[0] || (_cache[0] = ($event) => go("/"))
				}, {
					default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("返回首页", -1)])]),
					_: 1
				})]),
				_: 1
			})])) : (openBlock(), createElementBlock("div", _hoisted_2, [
				createBaseVNode("header", _hoisted_3, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_4, [_cache[6] || (_cache[6] = createBaseVNode("h1", null, "经营监控中心", -1)), createVNode(_component_el_tag, {
					effect: "plain",
					round: ""
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(scopeLabel.value), 1)]),
					_: 1
				})]), _cache[7] || (_cache[7] = createBaseVNode("p", null, "先处理风险，再看到账登记、销售执行、服务交付和团队状态", -1))]), createBaseVNode("div", _hoisted_5, [createVNode(_component_el_button, {
					icon: unref(refresh_default),
					loading: loading.value,
					onClick: loadAll
				}, {
					default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("刷新全部", -1)])]),
					_: 1
				}, 8, ["icon", "loading"])])]),
				createBaseVNode("div", _hoisted_6, [
					createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(info_filled_default))]),
						_: 1
					}),
					_cache[9] || (_cache[9] = createBaseVNode("div", null, [createBaseVNode("b", null, "本页只展示可追溯的真实业务事实"), createBaseVNode("span", null, "到账登记来自收款日记账，销售执行来自云客话单和 CRM，风险来自客户问题与服务记录；没有演示数据。")], -1)),
					createBaseVNode("span", _hoisted_7, "最近请求 " + toDisplayString(lastUpdated.value || "尚未完成"), 1)
				]),
				createVNode(_component_el_tabs, {
					modelValue: activeView.value,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => activeView.value = $event),
					class: "monitor-tabs"
				}, {
					default: withCtx(() => [createVNode(_component_el_tab_pane, {
						label: "总览与行动",
						name: "overview"
					}, {
						default: withCtx(() => [
							createBaseVNode("section", _hoisted_8, [
								createVNode(unref(SectionTitle), {
									title: "今天必须处理",
									subtitle: "先看红灯；有正式入口的直接下钻，暂缺入口的先看责任明细"
								}),
								createBaseVNode("div", _hoisted_9, [(openBlock(true), createElementBlock(Fragment, null, renderList(priorityCards.value, (card) => {
									return openBlock(), createElementBlock("button", {
										key: card.key,
										class: normalizeClass(["priority-card", [card.tone, { disabled: !card.path && !card.anchor }]]),
										type: "button",
										disabled: !card.path && !card.anchor,
										onClick: ($event) => openPriority(card)
									}, [
										createBaseVNode("span", null, toDisplayString(card.label), 1),
										createBaseVNode("strong", null, toDisplayString(metric(card.value, card.statusKey)), 1),
										createBaseVNode("small", null, toDisplayString(card.note), 1)
									], 10, _hoisted_10);
								}), 128))]),
								sectionStatus.boss === "error" ? (openBlock(), createBlock(unref(SectionError), {
									key: 0,
									message: sectionErrors.boss,
									onRetry: loadBossData
								}, null, 8, ["message"])) : createCommentVNode("", true),
								sectionStatus.boss === "ready" ? (openBlock(), createElementBlock("div", _hoisted_11, [
									createVNode(unref(RiskList), {
										"anchor-id": "risk-overdue",
										title: "逾期客户工单",
										rows: boss.exceptions.overdueIssues,
										"empty-text": "当前无逾期客户工单",
										"link-label": "打开逾期清单",
										onOpen: _cache[1] || (_cache[1] = ($event) => go("/customer-issue/list", { view: "overdue" }))
									}, null, 8, ["rows"]),
									createVNode(unref(RiskList), {
										"anchor-id": "risk-p0",
										title: "P0 客户工单",
										rows: boss.exceptions.p0Issues,
										"empty-text": "当前无 P0 客户工单",
										"link-label": "打开 P0 清单",
										onOpen: _cache[2] || (_cache[2] = ($event) => go("/customer-issue/list", { view: "p0" }))
									}, null, 8, ["rows"]),
									createVNode(unref(RiskList), {
										"anchor-id": "risk-bookkeeping",
										title: "代账逾期明细",
										rows: boss.exceptions.bookkeepingAbnormal,
										"empty-text": "当前无代账逾期"
									}, null, 8, ["rows"]),
									createVNode(unref(RiskList), {
										"anchor-id": "risk-arrears",
										title: "应收欠费订单明细",
										rows: boss.exceptions.arrears,
										"empty-text": "当前无应收欠费订单"
									}, null, 8, ["rows"])
								])) : createCommentVNode("", true)
							]),
							createBaseVNode("section", _hoisted_12, [
								createVNode(unref(SectionTitle), {
									title: "到账登记",
									subtitle: "金额来自全部未作废收款日记账（含草稿、待审、驳回待修和反审核）；登记、核销和审核状态分开呈现",
									source: "收款日记账 · 当日/本月"
								}),
								createBaseVNode("div", _hoisted_13, [
									createVNode(unref(MetricCard), {
										label: "今日已登记到账",
										value: money(cash.todayAmount),
										pending: sectionStatus.cash !== "ready",
										note: "按收款日期，含全部未作废登记",
										tone: "blue"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "本月已登记到账",
										value: money(cash.monthAmount),
										pending: sectionStatus.cash !== "ready",
										note: "含草稿/待审等，不等同银行终审余额",
										tone: "blue"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "本月已核销",
										value: money(cash.monthMatched),
										pending: sectionStatus.cash !== "ready",
										note: "已匹配业务单据",
										tone: "green"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "本月未核销",
										value: money(cash.monthUnmatched),
										pending: sectionStatus.cash !== "ready",
										note: "需要财务继续处理",
										tone: cash.monthUnmatched > 0 ? "red" : "green"
									}, null, 8, [
										"value",
										"pending",
										"tone"
									]),
									createVNode(unref(MetricCard), {
										label: "待审核记录",
										value: count(cash.pendingReviewCount),
										pending: sectionStatus.cash !== "ready",
										note: "收款审核队列",
										tone: cash.pendingReviewCount > 0 ? "amber" : "green"
									}, null, 8, [
										"value",
										"pending",
										"tone"
									]),
									createVNode(unref(MetricCard), {
										label: "超过24小时未核销",
										value: count(cash.over24hCount),
										pending: sectionStatus.cash !== "ready",
										note: "到账登记闭环预警",
										tone: cash.over24hCount > 0 ? "red" : "green"
									}, null, 8, [
										"value",
										"pending",
										"tone"
									])
								]),
								sectionStatus.cash === "error" ? (openBlock(), createBlock(unref(SectionError), {
									key: 0,
									message: sectionErrors.cash,
									onRetry: loadCashData
								}, null, 8, ["message"])) : createCommentVNode("", true)
							]),
							createBaseVNode("div", _hoisted_14, [createBaseVNode("section", _hoisted_15, [
								createBaseVNode("div", _hoisted_16, [createVNode(unref(SectionTitle), {
									title: "销售执行",
									subtitle: `${rangeLabel.value}云客话单；CRM 为全量快照，不随话单周期变化`,
									source: callSourceLabel.value
								}, null, 8, ["subtitle", "source"]), createBaseVNode("div", _hoisted_17, [_cache[10] || (_cache[10] = createBaseVNode("span", null, "话单周期", -1)), createVNode(_component_el_segmented, {
									modelValue: callRange.value,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => callRange.value = $event),
									options: rangeOptions,
									onChange: loadCallData
								}, null, 8, ["modelValue"])])]),
								createBaseVNode("div", _hoisted_18, [
									createVNode(unref(MetricCard), {
										label: "外呼量",
										value: count(callSummary.value.totalCalls),
										pending: sectionStatus.call !== "ready",
										note: callDelta(callSummary.value.totalCalls, previousCallSummary.value.totalCalls, "通"),
										tone: "blue"
									}, null, 8, [
										"value",
										"pending",
										"note"
									]),
									createVNode(unref(MetricCard), {
										label: "接通率",
										value: percent(callSummary.value.connectRate),
										pending: sectionStatus.call !== "ready",
										note: callDelta(callSummary.value.connectRate, previousCallSummary.value.connectRate, "个百分点"),
										tone: "blue"
									}, null, 8, [
										"value",
										"pending",
										"note"
									]),
									createVNode(unref(MetricCard), {
										label: "有效沟通",
										value: count(callSummary.value.validCount),
										pending: sectionStatus.call !== "ready",
										note: `接通≥60秒；${callDelta(callSummary.value.validCount, previousCallSummary.value.validCount, "通")}`,
										tone: "green"
									}, null, 8, [
										"value",
										"pending",
										"note"
									]),
									createVNode(unref(MetricCard), {
										label: "高意向通话记录",
										value: count(callSummary.value.highIntentCount),
										pending: sectionStatus.call !== "ready",
										note: "按话单意向标记，同一客户可能多次",
										tone: "blue"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "有效线索总量",
										value: count(salesFunnel.leadTotal),
										pending: sectionStatus.sales !== "ready",
										note: "CRM全量快照：状态1-3，排除无效",
										tone: "blue"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "已转化线索",
										value: count(salesFunnel.converted),
										pending: sectionStatus.sales !== "ready",
										note: "CRM全量快照：状态=已转化",
										tone: "green"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "今日新增线索",
										value: count(boss.sales.todayLeads),
										pending: sectionStatus.boss !== "ready",
										note: "老板风险源今日统计",
										tone: "blue"
									}, null, 8, ["value", "pending"]),
									createVNode(unref(MetricCard), {
										label: "今日跟进次数",
										value: count(boss.sales.todayFollows),
										pending: sectionStatus.boss !== "ready",
										note: "CRM今日跟进记录",
										tone: "green"
									}, null, 8, ["value", "pending"])
								]),
								sectionStatus.call === "error" ? (openBlock(), createBlock(unref(SectionError), {
									key: 0,
									message: sectionErrors.call,
									onRetry: loadCallData
								}, null, 8, ["message"])) : createCommentVNode("", true),
								sectionStatus.sales === "error" ? (openBlock(), createBlock(unref(SectionError), {
									key: 1,
									message: sectionErrors.sales,
									onRetry: loadSalesData
								}, null, 8, ["message"])) : createCommentVNode("", true)
							]), createBaseVNode("section", _hoisted_19, [createVNode(unref(SectionTitle), {
								title: "销售团队执行",
								subtitle: "排行只反映通话执行，不等同于成交业绩",
								source: "云客话单"
							}), sectionStatus.call === "ready" && topAgents.value.length ? (openBlock(), createElementBlock("div", _hoisted_20, [(openBlock(true), createElementBlock(Fragment, null, renderList(topAgents.value, (agent, index) => {
								return openBlock(), createElementBlock("div", {
									key: agent.agentName,
									class: "rank-row"
								}, [
									createBaseVNode("span", _hoisted_21, toDisplayString(index + 1), 1),
									createBaseVNode("div", _hoisted_22, [createBaseVNode("b", null, toDisplayString(agent.agentName || "未命名"), 1), createBaseVNode("small", null, "接通率 " + toDisplayString(percent(agent.connectRate)), 1)]),
									createBaseVNode("div", _hoisted_23, [createBaseVNode("i", { style: normalizeStyle({ width: rankWidth(agent.callCount) }) }, null, 4)]),
									createBaseVNode("strong", null, toDisplayString(agent.callCount || 0) + " 通", 1)
								]);
							}), 128))])) : sectionStatus.call === "ready" ? (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								description: "当前范围暂无云客话单",
								"image-size": 76
							})) : sectionStatus.call === "error" ? (openBlock(), createBlock(unref(SectionError), {
								key: 2,
								message: sectionErrors.call,
								onRetry: loadCallData
							}, null, 8, ["message"])) : (openBlock(), createElementBlock("div", _hoisted_24, [(openBlock(), createElementBlock(Fragment, null, renderList(5, (n) => {
								return createBaseVNode("i", { key: n });
							}), 64))]))])]),
							createBaseVNode("div", _hoisted_25, [createBaseVNode("section", _hoisted_26, [createVNode(unref(SectionTitle), {
								title: "服务交付",
								subtitle: "老板视图来自客户问题和旧任务台；旧任务台不代表全公司所有新任务"
							}), createBaseVNode("div", _hoisted_27, [
								createVNode(unref(MetricCard), {
									label: "未处理客户问题",
									value: count(boss.issue.unhandled),
									pending: sectionStatus.boss !== "ready",
									note: "客户问题表",
									tone: boss.issue.unhandled > 0 ? "amber" : "green"
								}, null, 8, [
									"value",
									"pending",
									"tone"
								]),
								createVNode(unref(MetricCard), {
									label: "代账在办",
									value: count(boss.book.active),
									pending: sectionStatus.boss !== "ready",
									note: "旧代账服务记录",
									tone: "blue"
								}, null, 8, ["value", "pending"]),
								createVNode(unref(MetricCard), {
									label: "代账已完成",
									value: count(boss.book.completed),
									pending: sectionStatus.boss !== "ready",
									note: "旧代账服务记录",
									tone: "green"
								}, null, 8, ["value", "pending"]),
								createVNode(unref(MetricCard), {
									label: "代账处理中",
									value: count(boss.book.processing),
									pending: sectionStatus.boss !== "ready",
									note: "旧代账服务记录",
									tone: "blue"
								}, null, 8, ["value", "pending"]),
								createVNode(unref(MetricCard), {
									label: "代账逾期",
									value: count(boss.book.overdue),
									pending: sectionStatus.boss !== "ready",
									note: "按服务到期日",
									tone: boss.book.overdue > 0 ? "red" : "green"
								}, null, 8, [
									"value",
									"pending",
									"tone"
								]),
								createVNode(unref(MetricCard), {
									label: "今日新增问题",
									value: count(boss.issue.todayNew),
									pending: sectionStatus.boss !== "ready",
									note: "今日创建",
									tone: "blue"
								}, null, 8, ["value", "pending"])
							])]), createBaseVNode("section", _hoisted_28, [createVNode(unref(SectionTitle), {
								title: "团队任务信号",
								subtitle: "仅覆盖旧任务台，作为异常信号，不作为完整绩效结论",
								source: "旧 biz_task（部分任务源）"
							}), sectionStatus.boss === "ready" && boss.employees.length ? (openBlock(), createBlock(_component_el_table, {
								key: 0,
								data: boss.employees.slice(0, 8),
								size: "small",
								class: "team-table"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "executorName",
										label: "员工",
										"min-width": "110"
									}),
									createVNode(_component_el_table_column, {
										prop: "todayCount",
										label: "今日任务",
										width: "86",
										align: "right"
									}),
									createVNode(_component_el_table_column, {
										prop: "overdueCount",
										label: "逾期",
										width: "70",
										align: "right"
									}, {
										default: withCtx(({ row }) => [createBaseVNode("b", { class: normalizeClass({ danger: Number(row.overdueCount) > 0 }) }, toDisplayString(row.overdueCount || 0), 3)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "完成率",
										width: "90",
										align: "right"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(percent(row.doneRate)), 1)]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])) : sectionStatus.boss === "ready" ? (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								description: "旧任务台暂无执行记录",
								"image-size": 72
							})) : createCommentVNode("", true)])])
						]),
						_: 1
					}), createVNode(_component_el_tab_pane, {
						label: "深度分析",
						name: "analysis"
					}, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_29, [createBaseVNode("section", _hoisted_30, [
							createVNode(unref(SectionTitle), {
								title: "线索来源转化",
								subtitle: "只计算线索与转化数量；未接投放成本，所以不称 ROI",
								source: "CRM 线索"
							}),
							leadRows.value.length ? (openBlock(), createBlock(_component_el_table, {
								key: 0,
								data: leadRows.value,
								size: "small",
								stripe: ""
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "sourceLabel",
										label: "来源",
										"min-width": "130"
									}),
									createVNode(_component_el_table_column, {
										prop: "lead_cnt",
										label: "线索数",
										width: "90",
										align: "right"
									}),
									createVNode(_component_el_table_column, {
										prop: "converted",
										label: "已转化",
										width: "90",
										align: "right"
									}),
									createVNode(_component_el_table_column, {
										label: "转化率",
										width: "100",
										align: "right"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(conversionRate(row)), 1)]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])) : sectionStatus.source === "ready" ? (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								description: "当前暂无来源转化记录",
								"image-size": 76
							})) : createCommentVNode("", true),
							sectionStatus.source === "error" ? (openBlock(), createBlock(unref(SectionError), {
								key: 2,
								message: sectionErrors.source,
								onRetry: loadSourceData
							}, null, 8, ["message"])) : createCommentVNode("", true)
						]), createBaseVNode("section", _hoisted_31, [
							createVNode(unref(SectionTitle), {
								title: "指标接入状态",
								subtitle: "不能核对到权威明细的数字，暂不进入老板决策区"
							}),
							createBaseVNode("div", _hoisted_32, [
								createBaseVNode("div", _hoisted_33, [_cache[12] || (_cache[12] = createBaseVNode("span", null, "客户风险 / 收款日记账 / 云客话单 / CRM线索", -1)), createVNode(_component_el_tag, {
									type: "success",
									effect: "light"
								}, {
									default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("已接真实事实源", -1)])]),
									_: 1
								})]),
								createBaseVNode("div", _hoisted_34, [_cache[14] || (_cache[14] = createBaseVNode("span", null, "订单营收 / 合同续费 / 客户价值", -1)), createVNode(_component_el_tag, {
									type: "warning",
									effect: "light"
								}, {
									default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("口径治理中", -1)])]),
									_: 1
								})]),
								createBaseVNode("div", _hoisted_35, [_cache[16] || (_cache[16] = createBaseVNode("span", null, "跨任务域团队完成率", -1)), createVNode(_component_el_tag, {
									type: "warning",
									effect: "light"
								}, {
									default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("待统一任务事实源", -1)])]),
									_: 1
								})]),
								createBaseVNode("div", _hoisted_36, [_cache[18] || (_cache[18] = createBaseVNode("span", null, "AI经营摘要", -1)), createVNode(_component_el_tag, {
									type: "info",
									effect: "light"
								}, {
									default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("暂不作为决策依据", -1)])]),
									_: 1
								})])
							]),
							_cache[19] || (_cache[19] = createBaseVNode("p", { class: "readiness-note" }, "“暂无记录”和“尚未接入”分开显示，系统不会把接口失败或未迁移数据伪装成 0。", -1))
						])])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]));
		};
	}
}), [["__scopeId", "data-v-bc8c60d5"]]);
//#endregion
export { owner_monitor_default as default };

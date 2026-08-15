import { $ as createCommentVNode, Ct as onUnmounted, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { An as phone_default, Bn as refresh_default, Er as withKeys, F as ElEmpty, Jt as data_analysis_default, K as ElCollapse, T as ElProgress, Un as search_default, V as ElDialog, W as ElDatePicker, a as ElMessageBox, fr as user_default, ht as ElTooltip, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, q as ElCollapseItem, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as callRecordingStreamUrl, t as callRecordApi } from "./call-record-vMQDzD4r.js";
import { r as leadApi } from "./crm-DKTvHmZR.js";
import { t as yunkeApi } from "./yunke-DhOFgmEW.js";
import { n as SalesAiDraftPanel_default, t as Customer360Drawer_default } from "./Customer360Drawer-DN258pWR.js";
function parseCallTime(value) {
	if (!value) return null;
	const date = new Date(String(value).replace("T", " ").replace(/-/g, "/"));
	return Number.isNaN(date.getTime()) ? null : date;
}
function isSameDay(left, right) {
	return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}
function workingHoursElapsed(now) {
	const minutes = now.getHours() * 60 + now.getMinutes();
	if (minutes <= 540) return 0;
	if (minutes <= 720) return (minutes - 540) / 60;
	if (minutes <= 780) return 3;
	return Math.min(8, 3 + (minutes - 780) / 60);
}
function workingHoursRemaining(now) {
	return Math.max(0, 8 - workingHoursElapsed(now));
}
function nextCheckpoint(now) {
	const minutes = now.getHours() * 60 + now.getMinutes();
	if (minutes < 720) return {
		target: 100,
		label: "上午12点"
	};
	if (minutes < 900) return {
		target: 250,
		label: "下午15点"
	};
	return {
		target: 400,
		label: "下班前"
	};
}
function buildSalesCallGoalSnapshot(now, callCountValue, records = []) {
	const callCount = Math.max(0, Number(callCountValue || 0));
	const todayCalls = records.map((item) => parseCallTime(item.callTime)).filter((date) => !!date && isSameDay(date, now));
	const noonActual = todayCalls.filter((date) => date.getHours() < 12).length;
	const afternoonActual = todayCalls.filter((date) => {
		return date.getHours() * 60 + date.getMinutes() <= 900;
	}).length;
	const checkpoint = nextCheckpoint(now);
	const elapsed = workingHoursElapsed(now);
	const remainingHours = workingHoursRemaining(now);
	return {
		target: 400,
		callCount,
		remaining: Math.max(0, 400 - callCount),
		completionRate: Math.min(100, Math.round(callCount * 100 / 400)),
		noonActual,
		afternoonActual,
		checkpointTarget: checkpoint.target,
		checkpointLabel: checkpoint.label,
		checkpointGap: Math.max(0, checkpoint.target - callCount),
		currentPace: elapsed > 0 ? Math.round(callCount / elapsed) : 0,
		requiredPace: remainingHours > 0 ? Math.ceil(Math.max(0, 400 - callCount) / remainingHours) : Math.max(0, 400 - callCount)
	};
}
//#endregion
//#region src/utils/tele-summary-draft.ts
/**
* A saved call summary may only block the next call while its lead is still an
* active private lead owned by the current salesperson. Unknown identity is
* kept instead of discarded so a transient login/bootstrap issue cannot lose
* an unfinished summary.
*/
function evaluateTeleSummaryDraftLead(lead, draftLeadId, currentUserId) {
	if (!Number.isFinite(draftLeadId) || draftLeadId <= 0) return "active";
	if (!lead) return "stale";
	const userId = Number(currentUserId);
	if (!Number.isFinite(userId) || userId <= 0) return "unknown";
	const leadId = Number(lead.id);
	const ownerId = Number(lead.ownerId);
	const ownership = String(lead.ownership || "").toLowerCase();
	const status = Number(lead.status);
	if (leadId !== draftLeadId) return "stale";
	if (ownership !== "private") return "stale";
	if (ownerId !== userId) return "stale";
	if (![1, 2].includes(status)) return "stale";
	return "active";
}
function isTeleSummaryDraftStaleError(error) {
	const message = String((error === null || error === void 0 ? void 0 : error.message) || "");
	return /无权限|不存在|已删除|已回收|已转交/.test(message);
}
//#endregion
//#region src/views/call-center/tele-workbench.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "tele-workbench" };
var _hoisted_2 = { class: "today-head" };
var _hoisted_3 = { class: "today-actions" };
var _hoisted_4 = { class: "tw-layout" };
var _hoisted_5 = { class: "left-column" };
var _hoisted_6 = {
	class: "goal-overview",
	"aria-label": "今日外呼目标"
};
var _hoisted_7 = { class: "goal-summary-row" };
var _hoisted_8 = { class: "goal-main" };
var _hoisted_9 = { class: "goal-progress" };
var _hoisted_10 = { class: "goal-progress-head" };
var _hoisted_11 = { class: "goal-progress-foot" };
var _hoisted_12 = { class: "goal-checkpoints" };
var _hoisted_13 = { class: "goal-metrics" };
var _hoisted_14 = { class: "left-panel" };
var _hoisted_15 = { class: "panel-head" };
var _hoisted_16 = { class: "search-line" };
var _hoisted_17 = {
	key: 0,
	class: "summary-draft-card"
};
var _hoisted_18 = ["data-lead-id", "onClick"];
var _hoisted_19 = { class: "lead-time" };
var _hoisted_20 = {
	key: 1,
	class: "lead-tag next"
};
var _hoisted_21 = {
	key: 2,
	class: "lead-tag due"
};
var _hoisted_22 = { class: "right-panel" };
var _hoisted_23 = { class: "customer-card" };
var _hoisted_24 = { class: "customer-title-row" };
var _hoisted_25 = { class: "cust-info" };
var _hoisted_26 = { class: "customer-name-line" };
var _hoisted_27 = { class: "cust-actions" };
var _hoisted_28 = { class: "customer-facts" };
var _hoisted_29 = { class: "source-detail-fact" };
var _hoisted_30 = { class: "address-fact" };
var _hoisted_31 = {
	key: 0,
	class: "resume-summary-bar"
};
var _hoisted_32 = {
	key: 1,
	class: "summary-guide"
};
var _hoisted_33 = { class: "summary-step result-step" };
var _hoisted_34 = { class: "step-title" };
var _hoisted_35 = { class: "result-buttons" };
var _hoisted_36 = ["onClick"];
var _hoisted_37 = { class: "field-label" };
var _hoisted_38 = { key: 0 };
var _hoisted_39 = {
	key: 0,
	class: "summary-step"
};
var _hoisted_40 = { class: "intent-options" };
var _hoisted_41 = ["onClick"];
var _hoisted_42 = {
	key: 1,
	class: "feedback-grid"
};
var _hoisted_43 = {
	key: 1,
	class: "summary-step next-action-step"
};
var _hoisted_44 = { class: "step-title" };
var _hoisted_45 = { class: "next-step-grid" };
var _hoisted_46 = { class: "next-content" };
var _hoisted_47 = {
	key: 2,
	class: "terminal-note"
};
var _hoisted_48 = { class: "summary-actions" };
var _hoisted_49 = { class: "call-list" };
var _hoisted_50 = { class: "call-main" };
var _hoisted_51 = {
	key: 0,
	class: "dial-float"
};
var _hoisted_52 = { class: "dialpad" };
var _hoisted_53 = { class: "dialpad-keys" };
var _hoisted_54 = ["onClick"];
//#endregion
//#region src/views/call-center/tele-workbench.vue
var tele_workbench_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "tele-workbench",
	setup(__props) {
		function unwrap(res) {
			var _res$data;
			return (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
		}
		const userStore = useUserStore();
		const currentUserName = computed(() => {
			var _userStore$userInfo, _userStore$userInfo2;
			return ((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.nickname) || ((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.username) || "当前销售";
		});
		const stats = reactive({
			callCount: 0,
			connectedCount: 0,
			connectRate: 0,
			totalDurationText: "0m 0s",
			over1minCount: 0
		});
		const todayCallRecords = ref([]);
		const nowTick = ref(/* @__PURE__ */ new Date());
		const callGoal = computed(() => buildSalesCallGoalSnapshot(nowTick.value, stats.callCount, todayCallRecords.value));
		const leadKeyword = ref("");
		const leads = ref([]);
		const leadLoading = ref(false);
		const leadPage = ref(1);
		const leadTotal = ref(0);
		const leadHasMore = computed(() => leads.value.length < leadTotal.value);
		const current = ref(null);
		const customer360Visible = ref(false);
		const customer360LeadId = ref(null);
		const callProgressMap = ref({});
		const lastCallProgress = computed(() => {
			return Object.values(callProgressMap.value).sort((a, b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0))[0] || null;
		});
		const nextLeadAfterLast = computed(() => getNextLeadFromList(leads.value));
		const callList = ref([]);
		const callLoading = ref(false);
		const dialing = ref(false);
		const startingDial = ref(false);
		const hangingUp = ref(false);
		const hangupFailed = ref(false);
		const dialSeconds = ref(0);
		let timer = null;
		const dialCtx = reactive({
			leadId: 0,
			customerName: "",
			phone: "",
			callId: ""
		});
		const summaryVisible = ref(false);
		const savingSummary = ref(false);
		const hasSummaryDraft = ref(false);
		const summaryDraftLead = ref(null);
		const summary = reactive({
			leadId: 0,
			customerName: "",
			phone: "",
			duration: 0,
			connected: 1,
			result: "接通",
			intentLevel: "",
			customerLevel: "",
			followStatus: "需求沟通",
			needTypes: [],
			quoteStatus: "未报价",
			remark: "",
			nextActionType: "电话",
			nextActionTime: "",
			nextActionContent: ""
		});
		const summaryReady = computed(() => Boolean(summaryVisible.value && current.value && Number(current.value.id) === Number(summary.leadId)));
		const followStatusOptions = [
			"线索接收",
			"需求沟通",
			"需求答疑",
			"签单收款"
		];
		const customerLevelOptions = [
			{
				value: "A",
				name: "高意向",
				cycle: "1-2天",
				days: 1,
				strategy: "需求明确，优先发方案、定节点并推进成交。"
			},
			{
				value: "B",
				name: "意向客户",
				cycle: "3-5天",
				days: 3,
				strategy: "解决预算、比价或内部商议等顾虑，持续建立信任。"
			},
			{
				value: "C",
				name: "潜在意向",
				cycle: "7-15天",
				days: 7,
				strategy: "轻量触达与长期培育，等待需求触发。"
			},
			{
				value: "D",
				name: "无意向",
				cycle: "转历史",
				days: 0,
				strategy: "停止高频拨打，转入历史客资供后续培育和轮转。"
			},
			{
				value: "E",
				name: "无效客户",
				cycle: "暂停拨打",
				days: 0,
				strategy: "空号、错号、非本人或拉黑风险，暂停拨打并保留原因。"
			}
		];
		const needTypeOptions = [
			"代理记账",
			"工商",
			"刻章",
			"地址",
			"税务咨询",
			"其他"
		];
		const quoteStatusOptions = [
			"未报价",
			"已报价",
			"已成交"
		];
		const nextActionOptions = [
			"电话",
			"微信",
			"发方案",
			"报价",
			"签约",
			"收款",
			"其他"
		];
		const callResultOptions = [
			{
				label: "接通",
				value: "接通",
				connected: 1,
				tone: "success",
				desc: "已沟通，继续记录意向"
			},
			{
				label: "无人接听",
				value: "无人接听",
				connected: 0,
				tone: "warning",
				desc: "稍后再拨，不算有效沟通"
			},
			{
				label: "占线/关机",
				value: "占线/关机",
				connected: 0,
				tone: "warning",
				desc: "暂未联系上客户"
			},
			{
				label: "号码无效",
				value: "号码无效",
				connected: 0,
				tone: "danger",
				desc: "号码错误、停机或空号"
			},
			{
				label: "明确拒绝",
				value: "明确拒绝",
				connected: 1,
				tone: "danger",
				desc: "已接通，对方明确拒绝"
			}
		];
		watch(() => summary.quoteStatus, (value) => {
			if (value === "已成交") {
				summary.followStatus = "签单收款";
				return;
			}
			if (value === "已报价" && ["线索接收", "需求沟通"].includes(summary.followStatus)) summary.followStatus = "需求答疑";
		});
		const selectedIntent = computed(() => customerLevelOptions.find((item) => item.value === summary.customerLevel));
		const isHistoryIntent = computed(() => ["D", "E"].includes(summary.customerLevel));
		const requiresNextAction = computed(() => summary.leadId > 0 && !isTerminalResult(summary.result) && !isHistoryIntent.value);
		const dialpadVisible = ref(false);
		const dialpadNumber = ref("");
		const dialpadKeys = [
			"1",
			"2",
			"3",
			"4",
			"5",
			"6",
			"7",
			"8",
			"9",
			"*",
			"0",
			"#"
		];
		function chooseCallResult(option) {
			summary.result = option.value;
			summary.connected = option.connected;
			if (option.value === "号码无效") summary.customerLevel = "E";
			else if (option.value === "明确拒绝") summary.customerLevel = "D";
			else if (!option.connected) summary.customerLevel = "";
			else if (["D", "E"].includes(summary.customerLevel)) summary.customerLevel = "";
			if (isTerminalResult(option.value)) {
				summary.nextActionType = "";
				summary.nextActionTime = "";
				summary.nextActionContent = "";
			} else ensureNextActionDefaults();
		}
		watch(() => summary.connected, (value) => {
			const connected = Number(value) === 1 ? 1 : 0;
			const currentOption = callResultOptions.find((item) => item.value === summary.result);
			if (!currentOption || currentOption.connected !== connected) summary.result = connected ? "接通" : "无人接听";
			if (!connected && !isTerminalResult(summary.result)) summary.customerLevel = "";
			if (!isTerminalResult(summary.result)) ensureNextActionDefaults();
		});
		watch(() => summary.customerLevel, (value) => {
			summary.intentLevel = value;
			if (["D", "E"].includes(value)) {
				summary.nextActionType = "";
				summary.nextActionTime = "";
				summary.nextActionContent = "";
				return;
			}
			const option = customerLevelOptions.find((item) => item.value === value);
			if (!option || option.days <= 0) return;
			summary.nextActionType = summary.nextActionType || "电话";
			const next = /* @__PURE__ */ new Date();
			next.setDate(next.getDate() + option.days);
			next.setHours(10, 0, 0, 0);
			summary.nextActionTime = formatLocalDateTime(next);
		});
		function isTerminalResult(result) {
			return result === "号码无效" || result === "明确拒绝";
		}
		function normalizeIntentLevel(value) {
			const level = String(value || "").trim().toUpperCase();
			return [
				"A",
				"B",
				"C",
				"D",
				"E"
			].includes(level) ? level : "";
		}
		function applyAiSummaryDraft(draft) {
			var _draft$summary;
			if ((_draft$summary = draft.summary) === null || _draft$summary === void 0 ? void 0 : _draft$summary.trim()) summary.remark = draft.summary.trim();
			if (summary.connected === 1 && draft.intentLevel && [
				"A",
				"B",
				"C",
				"D",
				"E"
			].includes(draft.intentLevel)) {
				summary.customerLevel = draft.intentLevel;
				summary.intentLevel = draft.intentLevel;
			}
			if (!["D", "E"].includes(summary.customerLevel)) {
				var _draft$nextActionCont;
				if (draft.nextActionType && nextActionOptions.includes(draft.nextActionType)) summary.nextActionType = draft.nextActionType;
				if (draft.nextActionTime) summary.nextActionTime = normalizeAiDateTime(draft.nextActionTime);
				if ((_draft$nextActionCont = draft.nextActionContent) === null || _draft$nextActionCont === void 0 ? void 0 : _draft$nextActionCont.trim()) summary.nextActionContent = draft.nextActionContent.trim();
			}
		}
		function normalizeAiDateTime(value) {
			const parsed = new Date(String(value).replace(" ", "T"));
			return Number.isNaN(parsed.getTime()) ? "" : formatLocalDateTime(parsed);
		}
		function formatLocalDateTime(date) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:00`;
		}
		function ensureNextActionDefaults() {
			if (!summary.nextActionType) summary.nextActionType = "电话";
			if (!summary.nextActionTime) {
				const next = /* @__PURE__ */ new Date();
				next.setDate(next.getDate() + 1);
				next.setHours(10, 0, 0, 0);
				summary.nextActionTime = formatLocalDateTime(next);
			}
		}
		function todayKey(date = /* @__PURE__ */ new Date()) {
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
		}
		const progressStorageKey = computed(() => {
			var _userStore$userInfo3, _userStore$userInfo4, _userStore$userInfo5;
			const user = ((_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.id) || ((_userStore$userInfo4 = userStore.userInfo) === null || _userStore$userInfo4 === void 0 ? void 0 : _userStore$userInfo4.userId) || ((_userStore$userInfo5 = userStore.userInfo) === null || _userStore$userInfo5 === void 0 ? void 0 : _userStore$userInfo5.username) || "current";
			return `zhehang:tele-call-progress:${todayKey()}:${user}`;
		});
		const summaryDraftKey = computed(() => {
			var _userStore$userInfo6, _userStore$userInfo7, _userStore$userInfo8;
			return `zhehang:tele-summary-draft:${((_userStore$userInfo6 = userStore.userInfo) === null || _userStore$userInfo6 === void 0 ? void 0 : _userStore$userInfo6.id) || ((_userStore$userInfo7 = userStore.userInfo) === null || _userStore$userInfo7 === void 0 ? void 0 : _userStore$userInfo7.userId) || ((_userStore$userInfo8 = userStore.userInfo) === null || _userStore$userInfo8 === void 0 ? void 0 : _userStore$userInfo8.username) || "current"}`;
		});
		function persistSummaryDraft() {
			if (!summary.customerName && !summary.phone) return;
			try {
				localStorage.setItem(summaryDraftKey.value, JSON.stringify({
					savedAt: Date.now(),
					platformCallId: dialCtx.callId,
					summary: _objectSpread2(_objectSpread2({}, summary), {}, { needTypes: [...summary.needTypes] })
				}));
				hasSummaryDraft.value = true;
			} catch (_unused) {}
		}
		function clearSummaryDraft() {
			try {
				localStorage.removeItem(summaryDraftKey.value);
			} catch (_unused2) {}
			hasSummaryDraft.value = false;
			summaryDraftLead.value = null;
		}
		function loadSummaryDraft() {
			try {
				const raw = localStorage.getItem(summaryDraftKey.value);
				if (!raw) return;
				const draft = JSON.parse(raw);
				if (!(draft === null || draft === void 0 ? void 0 : draft.summary) || !draft.savedAt || Date.now() - Number(draft.savedAt) > 10080 * 60 * 1e3) {
					clearSummaryDraft();
					return;
				}
				Object.assign(summary, draft.summary, { needTypes: Array.isArray(draft.summary.needTypes) ? draft.summary.needTypes : [] });
				dialCtx.leadId = Number(summary.leadId || 0);
				dialCtx.customerName = summary.customerName || "";
				dialCtx.phone = summary.phone || "";
				dialCtx.callId = String(draft.platformCallId || "");
				hasSummaryDraft.value = true;
			} catch (_unused3) {
				clearSummaryDraft();
			}
		}
		function currentUserId() {
			var _userStore$userInfo9, _userStore$userInfo10;
			const id = Number(((_userStore$userInfo9 = userStore.userInfo) === null || _userStore$userInfo9 === void 0 ? void 0 : _userStore$userInfo9.id) || ((_userStore$userInfo10 = userStore.userInfo) === null || _userStore$userInfo10 === void 0 ? void 0 : _userStore$userInfo10.userId));
			return Number.isFinite(id) && id > 0 ? id : null;
		}
		function clearStaleSummaryDraft(notify) {
			var _current$value;
			const staleLeadId = Number(summary.leadId || 0);
			summaryVisible.value = false;
			clearSummaryDraft();
			if (Number((_current$value = current.value) === null || _current$value === void 0 ? void 0 : _current$value.id) === staleLeadId) current.value = null;
			if (notify) ElMessage.info("原客户已删除、回公海或不再归您，待小结已自动清除，可继续下一通");
		}
		function reconcileSummaryDraft() {
			return _reconcileSummaryDraft.apply(this, arguments);
		}
		function _reconcileSummaryDraft() {
			_reconcileSummaryDraft = _asyncToGenerator(function* (notify = false) {
				if (!hasSummaryDraft.value) return false;
				const draftLeadId = Number(summary.leadId || 0);
				if (draftLeadId <= 0) return true;
				try {
					const lead = unwrap(yield leadApi.detail(draftLeadId, { silentError: true }));
					if (!hasSummaryDraft.value || Number(summary.leadId) !== draftLeadId) return hasSummaryDraft.value;
					const validity = evaluateTeleSummaryDraftLead(lead, draftLeadId, currentUserId());
					if (validity === "stale") {
						clearStaleSummaryDraft(notify);
						return false;
					}
					if (validity === "active") summaryDraftLead.value = mapLead(lead);
					return true;
				} catch (error) {
					if (isTeleSummaryDraftStaleError(error)) {
						clearStaleSummaryDraft(notify);
						return false;
					}
					return true;
				}
			});
			return _reconcileSummaryDraft.apply(this, arguments);
		}
		function reopenSummaryDraft() {
			return _reopenSummaryDraft.apply(this, arguments);
		}
		function _reopenSummaryDraft() {
			_reopenSummaryDraft = _asyncToGenerator(function* () {
				loadSummaryDraft();
				if (!hasSummaryDraft.value) return;
				if (!(yield reconcileSummaryDraft(true))) {
					const next = getNextLeadFromList(leads.value) || leads.value[0];
					if (next) yield selectLead(next);
					return;
				}
				const draftLead = findDraftLead();
				if (draftLead) {
					current.value = draftLead;
					loadCalls();
					scrollToLead(draftLead.id);
				}
				summaryVisible.value = true;
			});
			return _reopenSummaryDraft.apply(this, arguments);
		}
		function findDraftLead() {
			var _summaryDraftLead$val;
			const saved = leads.value.find((item) => item.id === Number(summary.leadId));
			if (saved) return saved;
			if (((_summaryDraftLead$val = summaryDraftLead.value) === null || _summaryDraftLead$val === void 0 ? void 0 : _summaryDraftLead$val.id) === Number(summary.leadId)) return summaryDraftLead.value;
			if (Number(summary.leadId) === 0 && summary.phone) return {
				id: 0,
				company: summary.customerName || "手动拨号",
				phone: summary.phone
			};
			return null;
		}
		watch(summary, () => {
			if (summaryVisible.value) persistSummaryDraft();
		}, { deep: true });
		function loadLocalCallProgress() {
			try {
				const raw = localStorage.getItem(progressStorageKey.value);
				if (!raw) return;
				const parsed = JSON.parse(raw);
				if (!parsed || typeof parsed !== "object") return;
				const next = {};
				Object.keys(parsed).forEach((key) => {
					const item = parsed[key];
					if (!(item === null || item === void 0 ? void 0 : item.leadId) || !(item === null || item === void 0 ? void 0 : item.callTime) || !isToday(item.callTime)) return;
					next[String(item.leadId)] = {
						leadId: Number(item.leadId),
						customerName: String(item.customerName || "未命名客户"),
						phone: item.phone ? String(item.phone) : "",
						status: item.status === "dialing" ? "dialing" : "called",
						result: item.result ? String(item.result) : "",
						connected: item.connected === void 0 ? void 0 : Number(item.connected),
						duration: item.duration === void 0 ? void 0 : Number(item.duration),
						callTime: String(item.callTime),
						updatedAt: Number(item.updatedAt || Date.now()),
						summarySaved: !!item.summarySaved
					};
				});
				callProgressMap.value = next;
			} catch (_unused4) {
				callProgressMap.value = {};
			}
		}
		function persistCallProgress() {
			try {
				localStorage.setItem(progressStorageKey.value, JSON.stringify(callProgressMap.value));
			} catch (_unused5) {}
		}
		function mergeCallProgress(progress, persist = true) {
			if (!progress.leadId || !isToday(progress.callTime)) return;
			const key = String(progress.leadId);
			const prev = callProgressMap.value[key];
			if (prev && Number(prev.updatedAt || 0) > Number(progress.updatedAt || 0)) return;
			callProgressMap.value = _objectSpread2(_objectSpread2({}, callProgressMap.value), {}, { [key]: progress });
			if (persist) persistCallProgress();
		}
		function markLeadProgress(input) {
			if (!input.leadId) return;
			const now = /* @__PURE__ */ new Date();
			mergeCallProgress({
				leadId: Number(input.leadId),
				customerName: input.customerName || "未命名客户",
				phone: input.phone || "",
				status: input.status || "called",
				result: input.result || "",
				connected: input.connected,
				duration: input.duration,
				callTime: input.callTime || now.toISOString(),
				updatedAt: now.getTime(),
				summarySaved: !!input.summarySaved
			});
		}
		function loadTodayCallProgress() {
			return _loadTodayCallProgress.apply(this, arguments);
		}
		function _loadTodayCallProgress() {
			_loadTodayCallProgress = _asyncToGenerator(function* () {
				try {
					const data = unwrap(yield callRecordApi.list({
						todayOnly: true,
						limit: 1e3
					}));
					const records = Array.isArray(data) ? data : (data === null || data === void 0 ? void 0 : data.records) || (data === null || data === void 0 ? void 0 : data.list) || [];
					todayCallRecords.value = records;
					records.forEach((record) => {
						if (!(record === null || record === void 0 ? void 0 : record.leadId) || !(record === null || record === void 0 ? void 0 : record.callTime)) return;
						const date = parseDate(record.callTime);
						const ts = (date === null || date === void 0 ? void 0 : date.getTime()) || 0;
						if (isToday(record.callTime)) mergeCallProgress({
							leadId: Number(record.leadId),
							customerName: record.customerName || "未命名客户",
							phone: record.phone || "",
							status: "called",
							result: record.result || (Number(record.connected) === 1 ? "接通" : "未接通"),
							connected: Number(record.connected || 0),
							duration: Number(record.duration || 0),
							callTime: String(record.callTime),
							updatedAt: ts || Date.now(),
							summarySaved: true
						}, false);
					});
					persistCallProgress();
				} catch (_unused6) {
					todayCallRecords.value = [];
				}
			});
			return _loadTodayCallProgress.apply(this, arguments);
		}
		function parseDate(value) {
			if (!value) return null;
			const normalized = String(value).replace("T", " ").replace(/-/g, "/");
			const date = new Date(normalized);
			return Number.isNaN(date.getTime()) ? null : date;
		}
		function isToday(value) {
			const date = parseDate(value);
			return !!date && todayKey(date) === todayKey();
		}
		function leadProgress(item) {
			return callProgressMap.value[String(item.id)] || null;
		}
		function isUncalledLead(item) {
			return !leadProgress(item);
		}
		function isNextLead(item) {
			var _nextLeadAfterLast$va;
			return ((_nextLeadAfterLast$va = nextLeadAfterLast.value) === null || _nextLeadAfterLast$va === void 0 ? void 0 : _nextLeadAfterLast$va.id) === item.id;
		}
		function leadItemClasses(item) {
			var _current$value2;
			const progress = leadProgress(item);
			return {
				active: ((_current$value2 = current.value) === null || _current$value2 === void 0 ? void 0 : _current$value2.id) === item.id,
				called: !!progress,
				dialing: (progress === null || progress === void 0 ? void 0 : progress.status) === "dialing",
				next: !progress && isNextLead(item)
			};
		}
		function leadProgressClass(item) {
			const progress = leadProgress(item);
			if ((progress === null || progress === void 0 ? void 0 : progress.status) === "dialing") return "dialing";
			if (Number(progress === null || progress === void 0 ? void 0 : progress.connected) === 1) return "connected";
			return "called";
		}
		function leadStatusText(item) {
			const progress = leadProgress(item);
			if (!progress) return "";
			if (progress.status === "dialing") return "拨打中";
			return `${progress.result || "已拨"} ${formatProgressTime(progress.callTime)}`;
		}
		function formatProgressTime(value) {
			const date = parseDate(value);
			if (!date) return "";
			return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
		}
		function getNextLeadFromList(list) {
			if (!list.length) return null;
			const firstUncalled = list.find((item) => isUncalledLead(item)) || null;
			const last = lastCallProgress.value;
			if (!last) return firstUncalled;
			const lastIndex = list.findIndex((item) => item.id === last.leadId);
			if (lastIndex >= 0) {
				const next = list.slice(lastIndex + 1).find((item) => isUncalledLead(item));
				if (next) return next;
			}
			return firstUncalled;
		}
		function leadDueLabel(item) {
			const due = parseDate(item.nextActionTime || item.nextFollowTime);
			if (!due) return item.lastFollowTime ? `漏排下一步 · 上次${formatShortDate(item.lastFollowTime)}` : "首次联系";
			const now = /* @__PURE__ */ new Date();
			if (due.getTime() < now.getTime()) return `已到期 · ${formatShortDate(item.nextActionTime || item.nextFollowTime)}`;
			return `${item.nextActionType || "跟进"} · ${formatShortDate(item.nextActionTime || item.nextFollowTime)}`;
		}
		function isOverdueLead(item) {
			const due = parseDate(item.nextActionTime || item.nextFollowTime);
			return Boolean(due && due.getTime() < Date.now());
		}
		function formatShortDate(value) {
			const date = parseDate(value);
			if (!date) return "";
			return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
		}
		function queueTime(item) {
			const date = parseDate(item.nextActionTime || item.nextFollowTime);
			if (!date) return "待安排";
			return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
		}
		const leadListRef = ref();
		function scrollToLead(id) {
			if (id == null) return;
			nextTick(() => {
				var _leadListRef$value;
				const el = (_leadListRef$value = leadListRef.value) === null || _leadListRef$value === void 0 ? void 0 : _leadListRef$value.querySelector(`[data-lead-id="${id}"]`);
				el === null || el === void 0 || el.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
			});
		}
		const nextUncalledLead = computed(() => {
			if (!leads.value.length) return null;
			const currentIndex = current.value ? leads.value.findIndex((item) => {
				var _current$value3;
				return item.id === ((_current$value3 = current.value) === null || _current$value3 === void 0 ? void 0 : _current$value3.id);
			}) : -1;
			if (currentIndex >= 0) {
				const later = leads.value.slice(currentIndex + 1).find((item) => isUncalledLead(item));
				if (later) return later;
			}
			return leads.value.find((item) => {
				var _current$value4;
				return item.id !== ((_current$value4 = current.value) === null || _current$value4 === void 0 ? void 0 : _current$value4.id) && isUncalledLead(item);
			}) || null;
		});
		function skipCurrent() {
			return _skipCurrent.apply(this, arguments);
		}
		function _skipCurrent() {
			_skipCurrent = _asyncToGenerator(function* () {
				if (hasSummaryDraft.value) {
					yield reconcileSummaryDraft(true);
					if (hasSummaryDraft.value) {
						yield reopenSummaryDraft();
						ElMessage.warning("请先完成上一通电话的小结");
						return;
					}
				}
				const next = nextUncalledLead.value;
				if (!next) {
					ElMessage.info("当前名单没有其他待拨客户");
					return;
				}
				selectLead(next);
				scrollToLead(next.id);
			});
			return _skipCurrent.apply(this, arguments);
		}
		function loadStats() {
			return _loadStats.apply(this, arguments);
		}
		function _loadStats() {
			_loadStats = _asyncToGenerator(function* () {
				try {
					const data = unwrap(yield callRecordApi.stats()) || {};
					stats.callCount = data.callCount || 0;
					stats.connectedCount = data.connectedCount || 0;
					stats.connectRate = data.connectRate || 0;
					stats.totalDurationText = data.totalDurationText || formatDuration(data.totalDuration);
					stats.over1minCount = data.over1minCount || 0;
				} catch (_unused7) {}
			});
			return _loadStats.apply(this, arguments);
		}
		function mapLead(row) {
			return {
				id: row.id,
				company: row.company || row.companyName || row.name || "未命名线索",
				legalPerson: row.legalPerson || row.contactName || row.contact || "",
				phone: row.phone || "",
				source: row.source,
				sourceDetail: row.sourceDetail || "",
				creditCode: row.creditCode,
				customerLevel: normalizeIntentLevel(row.customerLevel),
				intentLevel: normalizeIntentLevel(row.intentLevel),
				registerAddress: row.registerAddress || "",
				latestAddress: row.latestAddress || "",
				followStatus: row.followStatus,
				lastFollowTime: row.lastFollowTime,
				nextFollowTime: row.nextFollowTime,
				nextActionTime: row.nextActionTime,
				nextActionType: row.nextActionType,
				ownerName: row.ownerName || row.assigneeName || "",
				createTime: row.createTime
			};
		}
		function loadLeads() {
			return _loadLeads.apply(this, arguments);
		}
		function _loadLeads() {
			_loadLeads = _asyncToGenerator(function* (reset = true) {
				leadLoading.value = true;
				try {
					var _data$total;
					if (reset) leadPage.value = 1;
					const data = unwrap(yield leadApi.todoFollow({
						pageNum: leadPage.value,
						pageSize: 50,
						keyword: leadKeyword.value.trim() || void 0
					}));
					const records = (data === null || data === void 0 ? void 0 : data.records) || (data === null || data === void 0 ? void 0 : data.list) || [];
					const mapped = Array.isArray(records) ? records.map(mapLead) : [];
					leadTotal.value = Number((_data$total = data === null || data === void 0 ? void 0 : data.total) !== null && _data$total !== void 0 ? _data$total : mapped.length) || 0;
					leads.value = reset ? mapped : [...leads.value, ...mapped];
					yield reconcileSummaryDraft();
					const draftLead = hasSummaryDraft.value ? findDraftLead() : null;
					if (draftLead) {
						current.value = draftLead;
						summaryVisible.value = true;
						yield loadCalls();
					} else if (!current.value && leads.value.length) selectLead(getNextLeadFromList(leads.value) || leads.value[0]);
				} catch (_unused8) {
					ElMessage.error("待打名单加载失败");
				} finally {
					leadLoading.value = false;
				}
			});
			return _loadLeads.apply(this, arguments);
		}
		function loadMoreLeads() {
			if (leadLoading.value || !leadHasMore.value) return;
			leadPage.value += 1;
			loadLeads(false);
		}
		function selectLead(_x) {
			return _selectLead.apply(this, arguments);
		}
		function _selectLead() {
			_selectLead = _asyncToGenerator(function* (item) {
				if (hasSummaryDraft.value && Number(summary.leadId) !== Number(item.id)) {
					yield reconcileSummaryDraft(true);
					if (hasSummaryDraft.value) {
						yield reopenSummaryDraft();
						ElMessage.warning("请先完成上一通电话的小结");
						return;
					}
				}
				current.value = item;
				loadCalls();
			});
			return _selectLead.apply(this, arguments);
		}
		function openCustomer360() {
			var _current$value5;
			if (!((_current$value5 = current.value) === null || _current$value5 === void 0 ? void 0 : _current$value5.id)) return;
			customer360LeadId.value = current.value.id;
			customer360Visible.value = true;
		}
		function handleCustomer360Changed(_x2) {
			return _handleCustomer360Changed.apply(this, arguments);
		}
		function _handleCustomer360Changed() {
			_handleCustomer360Changed = _asyncToGenerator(function* (payload) {
				var _current$value6;
				const selectedId = (_current$value6 = current.value) === null || _current$value6 === void 0 ? void 0 : _current$value6.id;
				yield Promise.all([loadStats(), loadTodayCallProgress()]);
				yield loadLeads(true);
				if (!selectedId) return;
				const refreshed = leads.value.find((item) => item.id === selectedId);
				if (refreshed) {
					current.value = refreshed;
					yield loadCalls();
				} else {
					current.value = null;
					const next = getNextLeadFromList(leads.value) || leads.value[0];
					if (next) selectLead(next);
				}
				if (payload.action === "convert") customer360Visible.value = false;
			});
			return _handleCustomer360Changed.apply(this, arguments);
		}
		function handleCustomer360Dial(_x3) {
			return _handleCustomer360Dial.apply(this, arguments);
		}
		function _handleCustomer360Dial() {
			_handleCustomer360Dial = _asyncToGenerator(function* (payload) {
				var _current$value7, _current$value8;
				if (hasSummaryDraft.value) {
					yield reconcileSummaryDraft(true);
					if (hasSummaryDraft.value) {
						customer360Visible.value = false;
						yield reopenSummaryDraft();
						ElMessage.warning("请先完成上一通电话的小结");
						return;
					}
				}
				if (dialing.value || startingDial.value) {
					ElMessage.warning("当前已有外呼任务，请先完成后再拨下一通");
					return;
				}
				const target = leads.value.find((item) => item.id === payload.leadId) || (((_current$value7 = current.value) === null || _current$value7 === void 0 ? void 0 : _current$value7.id) === payload.leadId ? current.value : null) || {
					id: payload.leadId,
					company: payload.companyName,
					phone: payload.phone
				};
				customer360Visible.value = false;
				if (((_current$value8 = current.value) === null || _current$value8 === void 0 ? void 0 : _current$value8.id) !== target.id) selectLead(target);
				yield nextTick();
				yield startDial(target);
			});
			return _handleCustomer360Dial.apply(this, arguments);
		}
		function loadCalls() {
			return _loadCalls.apply(this, arguments);
		}
		function _loadCalls() {
			_loadCalls = _asyncToGenerator(function* () {
				if (!current.value) return;
				if (!current.value.id) {
					callList.value = [];
					return;
				}
				callLoading.value = true;
				try {
					const data = unwrap(yield callRecordApi.list({ leadId: current.value.id }));
					callList.value = Array.isArray(data) ? data : (data === null || data === void 0 ? void 0 : data.records) || (data === null || data === void 0 ? void 0 : data.list) || [];
				} catch (_unused9) {
					callList.value = [];
				} finally {
					callLoading.value = false;
				}
			});
			return _loadCalls.apply(this, arguments);
		}
		function refreshAll() {
			return _refreshAll.apply(this, arguments);
		}
		function _refreshAll() {
			_refreshAll = _asyncToGenerator(function* () {
				nowTick.value = /* @__PURE__ */ new Date();
				yield Promise.all([loadStats(), loadTodayCallProgress()]);
				yield loadLeads(true);
			});
			return _refreshAll.apply(this, arguments);
		}
		function startCallTimer() {
			timer && clearInterval(timer);
			timer = setInterval(() => {
				dialSeconds.value += 1;
			}, 1e3);
		}
		function stopCallTimer() {
			timer && clearInterval(timer);
			timer = null;
		}
		function beginDialing(ctx) {
			dialCtx.leadId = ctx.leadId;
			dialCtx.customerName = ctx.customerName;
			dialCtx.phone = ctx.phone;
			dialCtx.callId = ctx.callId;
			markLeadProgress({
				leadId: ctx.leadId,
				customerName: ctx.customerName,
				phone: ctx.phone,
				status: "dialing",
				result: "拨打中"
			});
			dialSeconds.value = 0;
			hangupFailed.value = false;
			dialing.value = true;
			startCallTimer();
		}
		function requestDial(_x4) {
			return _requestDial.apply(this, arguments);
		}
		function _requestDial() {
			_requestDial = _asyncToGenerator(function* (ctx) {
				if (hasSummaryDraft.value) {
					yield reconcileSummaryDraft(true);
					if (hasSummaryDraft.value) {
						yield reopenSummaryDraft();
						ElMessage.warning("请先完成上一通电话的小结");
						return false;
					}
				}
				if (startingDial.value || dialing.value) return false;
				startingDial.value = true;
				hangupFailed.value = false;
				try {
					const data = unwrap(yield yunkeApi.dial({ phone: ctx.phone }));
					const callId = String((data === null || data === void 0 ? void 0 : data.callId) || (data === null || data === void 0 ? void 0 : data.data) || "").trim();
					if (!callId) throw new Error("云客未返回外呼ID，无法使用系统按钮挂断手机");
					beginDialing(_objectSpread2(_objectSpread2({}, ctx), {}, { callId }));
					ElMessage.success((data === null || data === void 0 ? void 0 : data.message) || "已通知工作手机拨号");
					return true;
				} catch (e) {
					ElMessage.warning("云客外呼未发起：" + ((e === null || e === void 0 ? void 0 : e.message) || "当前坐席未开通或工作手机不在线"));
					return false;
				} finally {
					startingDial.value = false;
				}
			});
			return _requestDial.apply(this, arguments);
		}
		function startDial(_x5) {
			return _startDial.apply(this, arguments);
		}
		function _startDial() {
			_startDial = _asyncToGenerator(function* (item) {
				if (!item.phone) {
					ElMessage.warning("该客户暂无电话号码");
					return;
				}
				const phone = String(item.phone).split(/[,，、/\s]+/)[0];
				yield requestDial({
					leadId: item.id,
					customerName: item.company,
					phone
				});
			});
			return _startDial.apply(this, arguments);
		}
		function dialManual() {
			return _dialManual.apply(this, arguments);
		}
		function _dialManual() {
			_dialManual = _asyncToGenerator(function* () {
				var _current$value9, _current$value10, _current$value11;
				const phone = dialpadNumber.value.trim();
				if (!phone) return;
				const hadCurrent = Boolean(current.value);
				if (!current.value) current.value = {
					id: 0,
					company: "手动拨号",
					legalPerson: "手动输入号码",
					phone
				};
				if (yield requestDial({
					leadId: ((_current$value9 = current.value) === null || _current$value9 === void 0 ? void 0 : _current$value9.id) || 0,
					customerName: ((_current$value10 = current.value) === null || _current$value10 === void 0 ? void 0 : _current$value10.company) || "手动拨号",
					phone
				})) {
					dialpadVisible.value = false;
					dialpadNumber.value = "";
				} else if (!hadCurrent && ((_current$value11 = current.value) === null || _current$value11 === void 0 ? void 0 : _current$value11.id) === 0) current.value = null;
			});
			return _dialManual.apply(this, arguments);
		}
		function finishCallAfterHangup() {
			var _current$value12, _current$value13;
			stopCallTimer();
			dialing.value = false;
			hangingUp.value = false;
			hangupFailed.value = false;
			summary.leadId = dialCtx.leadId;
			summary.customerName = dialCtx.customerName;
			summary.phone = dialCtx.phone;
			summary.duration = dialSeconds.value;
			summary.connected = dialSeconds.value > 5 ? 1 : 0;
			summary.result = summary.connected ? "接通" : "无人接听";
			summary.intentLevel = "";
			summary.customerLevel = normalizeIntentLevel((_current$value12 = current.value) === null || _current$value12 === void 0 ? void 0 : _current$value12.customerLevel);
			summary.followStatus = ((_current$value13 = current.value) === null || _current$value13 === void 0 ? void 0 : _current$value13.followStatus) || (summary.connected ? "需求沟通" : "线索接收");
			summary.needTypes = [];
			summary.quoteStatus = "未报价";
			summary.remark = "";
			summary.nextActionType = "电话";
			summary.nextActionTime = "";
			summary.nextActionContent = "";
			ensureNextActionDefaults();
			markLeadProgress({
				leadId: summary.leadId,
				customerName: summary.customerName,
				phone: summary.phone,
				status: "called",
				result: summary.result,
				connected: summary.connected,
				duration: summary.duration
			});
			summaryVisible.value = true;
			persistSummaryDraft();
		}
		function hangUp() {
			return _hangUp.apply(this, arguments);
		}
		function _hangUp() {
			_hangUp = _asyncToGenerator(function* () {
				if (hangingUp.value) return;
				if (!dialCtx.callId) {
					hangupFailed.value = true;
					ElMessage.error("缺少云客外呼ID，无法通知工作手机挂断");
					return;
				}
				hangingUp.value = true;
				try {
					const data = unwrap(yield yunkeApi.hangup({ callId: dialCtx.callId }));
					ElMessage.success((data === null || data === void 0 ? void 0 : data.message) || "已通知工作手机挂断");
					finishCallAfterHangup();
				} catch (e) {
					hangupFailed.value = true;
					ElMessage.error("手机挂断失败：" + ((e === null || e === void 0 ? void 0 : e.message) || "请确认工作手机在线，或先在手机上手动挂断"));
				} finally {
					hangingUp.value = false;
				}
			});
			return _hangUp.apply(this, arguments);
		}
		function saveSummary() {
			return _saveSummary.apply(this, arguments);
		}
		function _saveSummary() {
			_saveSummary = _asyncToGenerator(function* () {
				if (summary.connected === 1 && !summary.remark.trim()) {
					ElMessage.warning("接通后请写清客户反馈或本次结论");
					return;
				}
				if (summary.connected === 1 && !summary.customerLevel) {
					ElMessage.warning("请选择客户意向等级");
					return;
				}
				if (requiresNextAction.value && (!summary.nextActionType || !summary.nextActionTime)) {
					ElMessage.warning("请安排下一步动作和具体时间");
					return;
				}
				savingSummary.value = true;
				try {
					yield callRecordApi.saveSummary({
						leadId: summary.leadId,
						customerName: summary.customerName,
						phone: summary.phone,
						platformCallId: dialCtx.callId || void 0,
						duration: summary.duration,
						connected: summary.connected,
						result: summary.result,
						remark: summary.remark.trim(),
						intentLevel: summary.connected ? summary.intentLevel : "",
						customerLevel: summary.customerLevel || void 0,
						followStatus: summary.followStatus || void 0,
						needType: summary.needTypes.join(","),
						quoteStatus: summary.connected ? summary.quoteStatus : void 0,
						nextActionType: requiresNextAction.value ? summary.nextActionType : void 0,
						nextActionTime: requiresNextAction.value ? summary.nextActionTime : void 0,
						nextActionContent: requiresNextAction.value ? summary.nextActionContent.trim() : void 0
					});
					ElMessage.success(isHistoryIntent.value ? "小结已保存，客户已进入历史客资" : "小结已保存，下一步已进入待办");
					clearSummaryDraft();
					markLeadProgress({
						leadId: summary.leadId,
						customerName: summary.customerName,
						phone: summary.phone,
						status: "called",
						result: summary.result,
						connected: summary.connected,
						duration: summary.duration,
						summarySaved: true
					});
					summaryVisible.value = false;
					current.value = null;
					yield Promise.all([loadStats(), loadTodayCallProgress()]);
					yield loadLeads(true);
					const selectedLead = current.value;
					if (selectedLead) scrollToLead(selectedLead.id);
				} catch (_unused10) {
					ElMessage.error("保存失败，请重试");
				} finally {
					savingSummary.value = false;
				}
			});
			return _saveSummary.apply(this, arguments);
		}
		function beforeSummaryClose(done) {
			if (savingSummary.value) return;
			ElMessageBox.confirm("这通电话还没有形成跟进记录，确定稍后再补吗？", "小结尚未保存", {
				confirmButtonText: "稍后再补",
				cancelButtonText: "继续填写",
				type: "warning"
			}).then(() => {
				persistSummaryDraft();
				done();
				ElMessage.info("小结已暂存，请完成后再继续下一通");
			}).catch(() => {});
		}
		function discardSummary() {
			beforeSummaryClose(() => {
				summaryVisible.value = false;
			});
		}
		function openRecord(_x6) {
			return _openRecord.apply(this, arguments);
		}
		function _openRecord() {
			_openRecord = _asyncToGenerator(function* (recordId) {
				if (!recordId) return;
				try {
					const data = unwrap(yield callRecordApi.recordingTicket(recordId));
					const target = window.open(callRecordingStreamUrl(recordId, data.token), "_blank");
					if (target) target.opener = null;
				} catch (_unused11) {
					ElMessage.warning("当前录音无权访问或暂时不可用");
				}
			});
			return _openRecord.apply(this, arguments);
		}
		function formatDateTime(value) {
			return value ? String(value).replace("T", " ").slice(0, 16) : "";
		}
		function formatDuration(seconds) {
			const total = Number(seconds || 0);
			if (total <= 0) return "0m 0s";
			const h = Math.floor(total / 3600);
			const m = Math.floor(total % 3600 / 60);
			const s = total % 60;
			return h ? `${h}h ${m}m` : `${m}m ${s}s`;
		}
		function formatClock(seconds) {
			const m = Math.floor(seconds / 60);
			const s = seconds % 60;
			return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
		}
		let clockTimer = null;
		onMounted(() => {
			loadLocalCallProgress();
			loadSummaryDraft();
			refreshAll();
			clockTimer = setInterval(() => {
				nowTick.value = /* @__PURE__ */ new Date();
			}, 60 * 1e3);
		});
		onUnmounted(() => {
			stopCallTimer();
			if (clockTimer) clearInterval(clockTimer);
			clockTimer = null;
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_progress = ElProgress;
			const _component_el_input = ElInput;
			const _component_el_empty = ElEmpty;
			const _component_el_tooltip = ElTooltip;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_collapse_item = ElCollapseItem;
			const _component_el_collapse = ElCollapse;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[17] || (_cache[17] = createBaseVNode("div", null, [createBaseVNode("h1", null, "今日工作"), createBaseVNode("p", null, "今日待办、外呼执行与客户跟进")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
					icon: unref(refresh_default),
					onClick: refreshAll
				}, {
					default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("刷新", -1)])]),
					_: 1
				}, 8, ["icon"]), createVNode(_component_el_button, {
					type: "primary",
					icon: unref(phone_default),
					onClick: _cache[0] || (_cache[0] = ($event) => dialpadVisible.value = true)
				}, {
					default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("拨号盘", -1)])]),
					_: 1
				}, 8, ["icon"])])]),
				createBaseVNode("section", _hoisted_4, [createBaseVNode("div", _hoisted_5, [createBaseVNode("section", _hoisted_6, [
					createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, [
						_cache[19] || (_cache[19] = createBaseVNode("span", null, "今日目标", -1)),
						createBaseVNode("strong", null, [createTextVNode(toDisplayString(callGoal.value.target), 1), _cache[18] || (_cache[18] = createBaseVNode("small", null, "通", -1))]),
						_cache[20] || (_cache[20] = createBaseVNode("em", null, "个人固定目标", -1))
					]), createBaseVNode("div", _hoisted_9, [
						createBaseVNode("div", _hoisted_10, [createBaseVNode("span", null, [
							_cache[21] || (_cache[21] = createTextVNode("已拨 ", -1)),
							createBaseVNode("b", null, toDisplayString(callGoal.value.callCount), 1),
							_cache[22] || (_cache[22] = createTextVNode(" 通", -1))
						]), createBaseVNode("strong", null, "剩余 " + toDisplayString(callGoal.value.remaining) + " 通", 1)]),
						createVNode(_component_el_progress, {
							percentage: callGoal.value.completionRate,
							"stroke-width": 10,
							"show-text": false
						}, null, 8, ["percentage"]),
						createBaseVNode("div", _hoisted_11, [createBaseVNode("span", null, toDisplayString(callGoal.value.checkpointLabel) + "目标 " + toDisplayString(callGoal.value.checkpointTarget) + " 通", 1), createBaseVNode("em", null, toDisplayString(callGoal.value.checkpointGap > 0 ? `还差 ${callGoal.value.checkpointGap} 通` : "当前节点已达"), 1)])
					])]),
					createBaseVNode("div", _hoisted_12, [
						createBaseVNode("article", { class: normalizeClass({
							active: callGoal.value.checkpointLabel === "上午12点",
							done: callGoal.value.noonActual >= 100
						}) }, [
							_cache[24] || (_cache[24] = createBaseVNode("i", null, [createBaseVNode("span")], -1)),
							createBaseVNode("div", null, [_cache[23] || (_cache[23] = createBaseVNode("b", null, "12:00", -1)), createBaseVNode("p", null, toDisplayString(callGoal.value.noonActual) + " / 100 通", 1)]),
							createBaseVNode("em", null, toDisplayString(Math.min(100, callGoal.value.noonActual)) + "%", 1)
						], 2),
						createBaseVNode("article", { class: normalizeClass({
							active: callGoal.value.checkpointLabel === "下午15点",
							done: callGoal.value.afternoonActual >= 250
						}) }, [
							_cache[26] || (_cache[26] = createBaseVNode("i", null, [createBaseVNode("span")], -1)),
							createBaseVNode("div", null, [_cache[25] || (_cache[25] = createBaseVNode("b", null, "15:00", -1)), createBaseVNode("p", null, toDisplayString(callGoal.value.afternoonActual) + " / 250 通", 1)]),
							createBaseVNode("em", null, toDisplayString(Math.min(100, Math.round(callGoal.value.afternoonActual * 100 / 250))) + "%", 1)
						], 2),
						createBaseVNode("article", { class: normalizeClass({
							active: callGoal.value.checkpointLabel === "下班前",
							done: callGoal.value.callCount >= callGoal.value.target
						}) }, [
							_cache[28] || (_cache[28] = createBaseVNode("i", null, [createBaseVNode("span")], -1)),
							createBaseVNode("div", null, [_cache[27] || (_cache[27] = createBaseVNode("b", null, "下班前", -1)), createBaseVNode("p", null, toDisplayString(callGoal.value.callCount) + " / " + toDisplayString(callGoal.value.target) + " 通", 1)]),
							createBaseVNode("em", null, toDisplayString(callGoal.value.completionRate) + "%", 1)
						], 2)
					]),
					createBaseVNode("div", _hoisted_13, [
						createBaseVNode("article", null, [_cache[30] || (_cache[30] = createBaseVNode("span", null, "接通", -1)), createBaseVNode("strong", null, [createTextVNode(toDisplayString(stats.connectedCount), 1), _cache[29] || (_cache[29] = createBaseVNode("small", null, "通", -1))])]),
						createBaseVNode("article", null, [_cache[32] || (_cache[32] = createBaseVNode("span", null, "有效沟通", -1)), createBaseVNode("strong", null, [createTextVNode(toDisplayString(stats.over1minCount), 1), _cache[31] || (_cache[31] = createBaseVNode("small", null, "通", -1))])]),
						createBaseVNode("article", null, [_cache[34] || (_cache[34] = createBaseVNode("span", null, "建议节奏", -1)), createBaseVNode("strong", null, [createTextVNode(toDisplayString(callGoal.value.requiredPace), 1), _cache[33] || (_cache[33] = createBaseVNode("small", null, "通/小时", -1))])])
					])
				]), createBaseVNode("aside", _hoisted_14, [
					createBaseVNode("div", _hoisted_15, [_cache[35] || (_cache[35] = createBaseVNode("h3", null, "待拨打客户", -1)), createBaseVNode("span", null, toDisplayString(leadTotal.value || leads.value.length) + " 条", 1)]),
					createBaseVNode("div", _hoisted_16, [createVNode(_component_el_input, {
						modelValue: leadKeyword.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => leadKeyword.value = $event),
						placeholder: "搜索公司 / 联系人 / 电话",
						clearable: "",
						"prefix-icon": unref(search_default),
						onKeyup: _cache[2] || (_cache[2] = withKeys(($event) => loadLeads(true), ["enter"])),
						onClear: _cache[3] || (_cache[3] = ($event) => loadLeads(true))
					}, null, 8, ["modelValue", "prefix-icon"])]),
					hasSummaryDraft.value ? (openBlock(), createElementBlock("div", _hoisted_17, [createBaseVNode("div", null, [createBaseVNode("b", null, "待补小结：" + toDisplayString(summary.customerName || "上一通电话"), 1), _cache[36] || (_cache[36] = createBaseVNode("span", null, "完成并保存后再继续下一通", -1))]), createVNode(_component_el_button, {
						size: "small",
						type: "warning",
						onClick: reopenSummaryDraft
					}, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("继续填写", -1)])]),
						_: 1
					})])) : createCommentVNode("", true),
					withDirectives((openBlock(), createElementBlock("div", {
						class: "lead-list",
						ref_key: "leadListRef",
						ref: leadListRef
					}, [
						(openBlock(true), createElementBlock(Fragment, null, renderList(leads.value, (item) => {
							return openBlock(), createElementBlock("button", {
								key: item.id,
								class: normalizeClass(["lead-item", leadItemClasses(item)]),
								"data-lead-id": item.id,
								onClick: ($event) => selectLead(item)
							}, [
								createBaseVNode("time", _hoisted_19, toDisplayString(queueTime(item)), 1),
								createBaseVNode("span", null, [
									createBaseVNode("b", null, toDisplayString(item.company), 1),
									createBaseVNode("em", null, toDisplayString(item.legalPerson || "联系人待补") + " · " + toDisplayString(item.phone || "无号码"), 1),
									leadProgress(item) ? (openBlock(), createElementBlock("small", {
										key: 0,
										class: normalizeClass(["lead-tag", leadProgressClass(item)])
									}, toDisplayString(leadStatusText(item)), 3)) : isNextLead(item) ? (openBlock(), createElementBlock("small", _hoisted_20, "推荐拨打")) : leadDueLabel(item) ? (openBlock(), createElementBlock("small", _hoisted_21, toDisplayString(leadDueLabel(item)), 1)) : createCommentVNode("", true)
								]),
								_cache[38] || (_cache[38] = createBaseVNode("strong", { class: "lead-open" }, "选择", -1))
							], 10, _hoisted_18);
						}), 128)),
						!leadLoading.value && !leads.value.length ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "暂无待打客户",
							"image-size": 80
						})) : createCommentVNode("", true),
						leadHasMore.value ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							class: "more-btn",
							text: "",
							type: "primary",
							onClick: loadMoreLeads
						}, {
							default: withCtx(() => [createTextVNode(" 加载更多 " + toDisplayString(leads.value.length) + "/" + toDisplayString(leadTotal.value), 1)]),
							_: 1
						})) : createCommentVNode("", true)
					])), [[_directive_loading, leadLoading.value]])
				])]), createBaseVNode("main", _hoisted_22, [current.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createBaseVNode("section", _hoisted_23, [createBaseVNode("div", _hoisted_24, [createBaseVNode("div", _hoisted_25, [createBaseVNode("div", _hoisted_26, [
						createVNode(_component_el_tooltip, {
							content: current.value.company,
							placement: "top",
							"show-after": 500
						}, {
							default: withCtx(() => [createBaseVNode("h2", null, toDisplayString(current.value.company), 1)]),
							_: 1
						}, 8, ["content"]),
						isOverdueLead(current.value) ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: "danger",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("已逾期", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						current.value.intentLevel ? (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							type: "warning",
							effect: "plain"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.intentLevel) + "类意向", 1)]),
							_: 1
						})) : (openBlock(), createBlock(_component_el_tag, {
							key: 2,
							type: "info",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("未分级", -1)])]),
							_: 1
						}))
					]), createBaseVNode("p", null, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(user_default))]),
						_: 1
					}), createTextVNode(toDisplayString(current.value.legalPerson || "联系人待补"), 1)]), createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(phone_default))]),
						_: 1
					}), createTextVNode(toDisplayString(current.value.phone || "暂无号码"), 1)])])]), createBaseVNode("div", _hoisted_27, [createVNode(_component_el_button, {
						class: "dial-main-btn",
						type: "primary",
						loading: startingDial.value,
						disabled: !current.value.phone || dialing.value || hasSummaryDraft.value,
						onClick: _cache[4] || (_cache[4] = ($event) => startDial(current.value))
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(phone_default))]),
							_: 1
						}), _cache[41] || (_cache[41] = createTextVNode("拨打客户 ", -1))]),
						_: 1
					}, 8, ["loading", "disabled"]), createVNode(_component_el_button, {
						icon: unref(data_analysis_default),
						disabled: !current.value.id,
						onClick: openCustomer360
					}, {
						default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("客户360", -1)])]),
						_: 1
					}, 8, ["icon", "disabled"])])]), createBaseVNode("div", _hoisted_28, [
						createBaseVNode("article", null, [_cache[43] || (_cache[43] = createBaseVNode("span", null, "客户阶段", -1)), createBaseVNode("strong", null, toDisplayString(current.value.followStatus || "线索接收"), 1)]),
						createBaseVNode("article", null, [_cache[44] || (_cache[44] = createBaseVNode("span", null, "负责人", -1)), createBaseVNode("strong", null, toDisplayString(current.value.ownerName || currentUserName.value), 1)]),
						createBaseVNode("article", null, [_cache[45] || (_cache[45] = createBaseVNode("span", null, "最近跟进", -1)), createBaseVNode("strong", null, toDisplayString(formatDateTime(current.value.lastFollowTime) || "暂无记录"), 1)]),
						createBaseVNode("article", null, [_cache[46] || (_cache[46] = createBaseVNode("span", null, "下次跟进", -1)), createBaseVNode("strong", null, toDisplayString(formatDateTime(current.value.nextActionTime || current.value.nextFollowTime) || "待安排"), 1)]),
						createBaseVNode("article", _hoisted_29, [_cache[47] || (_cache[47] = createBaseVNode("span", null, "来源说明/活动名称", -1)), createBaseVNode("strong", null, toDisplayString(current.value.sourceDetail || "未填写"), 1)]),
						createBaseVNode("article", _hoisted_30, [_cache[48] || (_cache[48] = createBaseVNode("span", null, "单位地址", -1)), createBaseVNode("strong", null, toDisplayString(current.value.latestAddress || current.value.registerAddress || "未填写"), 1)])
					])]),
					createBaseVNode("section", { class: normalizeClass(["inline-summary", {
						waiting: !summaryReady.value,
						compact: summaryReady.value && summary.connected !== 1
					}]) }, [!summaryReady.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [hasSummaryDraft.value ? (openBlock(), createElementBlock("div", _hoisted_31, [createBaseVNode("div", null, [_cache[49] || (_cache[49] = createBaseVNode("strong", null, "上一通小结还未保存", -1)), createBaseVNode("span", null, toDisplayString(summary.customerName) + " · " + toDisplayString(summary.phone), 1)]), createVNode(_component_el_button, {
						type: "warning",
						onClick: reopenSummaryDraft
					}, {
						default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("继续填写", -1)])]),
						_: 1
					})])) : (openBlock(), createElementBlock("div", _hoisted_32, [_cache[52] || (_cache[52] = createBaseVNode("div", null, [createBaseVNode("span", null, "准备拨打"), createBaseVNode("p", null, "拨通后，系统会在这里显示本次联系结果。")], -1)), createVNode(_component_el_button, {
						disabled: !nextUncalledLead.value,
						onClick: skipCurrent
					}, {
						default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("跳过本次", -1)])]),
						_: 1
					}, 8, ["disabled"])]))], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
						createBaseVNode("div", _hoisted_33, [
							createBaseVNode("div", _hoisted_34, [
								_cache[53] || (_cache[53] = createBaseVNode("i", null, "1", -1)),
								_cache[54] || (_cache[54] = createBaseVNode("h3", null, "联系结果", -1)),
								createBaseVNode("em", null, toDisplayString(formatClock(summary.duration)), 1)
							]),
							createBaseVNode("div", _hoisted_35, [(openBlock(), createElementBlock(Fragment, null, renderList(callResultOptions, (item) => {
								return createBaseVNode("button", {
									key: item.value,
									type: "button",
									class: normalizeClass([`tone-${item.tone}`, { active: summary.result === item.value }]),
									onClick: ($event) => chooseCallResult(item)
								}, toDisplayString(item.label), 11, _hoisted_36);
							}), 64))]),
							createBaseVNode("label", _hoisted_37, [createTextVNode(toDisplayString(summary.connected === 1 ? "沟通摘要" : "备注（选填）") + " ", 1), summary.connected === 1 ? (openBlock(), createElementBlock("b", _hoisted_38, "*")) : createCommentVNode("", true)]),
							createVNode(_component_el_input, {
								modelValue: summary.remark,
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => summary.remark = $event),
								type: "textarea",
								rows: summary.connected === 1 ? 3 : 2,
								maxlength: "500",
								"show-word-limit": "",
								placeholder: summary.connected === 1 ? "记录客户关注点、沟通结论和承诺事项" : "可补充无人接听、关机等具体情况"
							}, null, 8, [
								"modelValue",
								"rows",
								"placeholder"
							]),
							createVNode(SalesAiDraftPanel_default, {
								"lead-id": summary.leadId,
								"platform-call-id": dialCtx.callId || void 0,
								connected: summary.connected,
								result: summary.result,
								"user-note": summary.remark,
								onApply: applyAiSummaryDraft
							}, null, 8, [
								"lead-id",
								"platform-call-id",
								"connected",
								"result",
								"user-note"
							])
						]),
						summary.connected === 1 ? (openBlock(), createElementBlock("div", _hoisted_39, [
							_cache[58] || (_cache[58] = createBaseVNode("div", { class: "step-title" }, [
								createBaseVNode("i", null, "2"),
								createBaseVNode("h3", null, "客户意向"),
								createBaseVNode("em", null, "决定客户进入跟进或历史")
							], -1)),
							_cache[59] || (_cache[59] = createBaseVNode("label", { class: "field-label" }, [createTextVNode("意向等级 "), createBaseVNode("b", null, "*")], -1)),
							createBaseVNode("div", _hoisted_40, [(openBlock(), createElementBlock(Fragment, null, renderList(customerLevelOptions, (item) => {
								return createBaseVNode("button", {
									key: item.value,
									type: "button",
									class: normalizeClass([`intent-${item.value.toLowerCase()}`, { active: summary.customerLevel === item.value }]),
									onClick: ($event) => summary.customerLevel = item.value
								}, [
									createBaseVNode("strong", null, toDisplayString(item.value) + " 类", 1),
									createBaseVNode("span", null, toDisplayString(item.name), 1),
									createBaseVNode("em", null, toDisplayString(item.cycle), 1)
								], 10, _hoisted_41);
							}), 64))]),
							selectedIntent.value ? (openBlock(), createElementBlock("p", {
								key: 0,
								class: normalizeClass(["intent-strategy", { history: isHistoryIntent.value }])
							}, [
								createBaseVNode("strong", null, toDisplayString(selectedIntent.value.name) + "：", 1),
								createTextVNode(toDisplayString(selectedIntent.value.strategy) + " ", 1),
								createBaseVNode("span", null, toDisplayString(isHistoryIntent.value ? "保存后进入历史客资" : "保存后保留在我的客户·跟进中"), 1)
							], 2)) : createCommentVNode("", true),
							requiresNextAction.value ? (openBlock(), createElementBlock("div", _hoisted_42, [
								createBaseVNode("label", null, [_cache[55] || (_cache[55] = createBaseVNode("span", null, "客户需求", -1)), createVNode(_component_el_select, {
									modelValue: summary.needTypes,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => summary.needTypes = $event),
									multiple: "",
									"collapse-tags": "",
									"collapse-tags-tooltip": "",
									placeholder: "请选择"
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(needTypeOptions, (item) => {
										return createVNode(_component_el_option, {
											key: item,
											label: item,
											value: item
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								createBaseVNode("label", null, [_cache[56] || (_cache[56] = createBaseVNode("span", null, "报价情况", -1)), createVNode(_component_el_select, {
									modelValue: summary.quoteStatus,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => summary.quoteStatus = $event),
									placeholder: "请选择"
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(quoteStatusOptions, (item) => {
										return createVNode(_component_el_option, {
											key: item,
											label: item,
											value: item
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								createBaseVNode("label", null, [_cache[57] || (_cache[57] = createBaseVNode("span", null, "当前阶段", -1)), createVNode(_component_el_select, {
									modelValue: summary.followStatus,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => summary.followStatus = $event),
									placeholder: "请选择"
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(followStatusOptions, (item) => {
										return createVNode(_component_el_option, {
											key: item,
											label: item,
											value: item
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])])
							])) : createCommentVNode("", true)
						])) : createCommentVNode("", true),
						requiresNextAction.value ? (openBlock(), createElementBlock("div", _hoisted_43, [createBaseVNode("div", _hoisted_44, [
							createBaseVNode("i", null, toDisplayString(summary.connected === 1 ? 3 : 2), 1),
							createBaseVNode("h3", null, toDisplayString(summary.connected === 1 ? "安排下一步" : "再次联系"), 1),
							createBaseVNode("em", null, toDisplayString(summary.connected === 1 ? "形成明确待办" : "系统已默认明天10点"), 1)
						]), createBaseVNode("div", _hoisted_45, [
							createBaseVNode("label", null, [_cache[60] || (_cache[60] = createBaseVNode("span", null, "时间", -1)), createVNode(_component_el_date_picker, {
								modelValue: summary.nextActionTime,
								"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => summary.nextActionTime = $event),
								type: "datetime",
								"value-format": "YYYY-MM-DD HH:mm:ss",
								placeholder: "选择日期时间",
								style: { "width": "100%" }
							}, null, 8, ["modelValue"])]),
							createBaseVNode("label", null, [_cache[61] || (_cache[61] = createBaseVNode("span", null, "方式", -1)), createVNode(_component_el_select, {
								modelValue: summary.nextActionType,
								"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => summary.nextActionType = $event),
								placeholder: "选择方式"
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(nextActionOptions, (item) => {
									return createVNode(_component_el_option, {
										key: item,
										label: item,
										value: item
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, ["modelValue"])]),
							createBaseVNode("label", _hoisted_46, [_cache[62] || (_cache[62] = createBaseVNode("span", null, "具体事项", -1)), createVNode(_component_el_input, {
								modelValue: summary.nextActionContent,
								"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => summary.nextActionContent = $event),
								placeholder: summary.connected === 1 ? "例如：确认报价、发方案、约签约" : "例如：再次拨打"
							}, null, 8, ["modelValue", "placeholder"])])
						])])) : (openBlock(), createElementBlock("div", _hoisted_47, [createBaseVNode("strong", null, toDisplayString(summary.customerLevel === "E" ? "E类客户暂停拨打" : "本次联系已结束"), 1), _cache[63] || (_cache[63] = createBaseVNode("span", null, "保存后客户进入历史客资，全部跟进、通话和备注记录仍会保留，后续可按权限重新激活轮转。", -1))])),
						createBaseVNode("footer", _hoisted_48, [createVNode(_component_el_button, { onClick: discardSummary }, {
							default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("稍后补", -1)])]),
							_: 1
						}), createVNode(_component_el_button, {
							type: "primary",
							loading: savingSummary.value,
							onClick: saveSummary
						}, {
							default: withCtx(() => [..._cache[65] || (_cache[65] = [createTextVNode("保存并进入下一位", -1)])]),
							_: 1
						}, 8, ["loading"])])
					], 64))], 2),
					createVNode(_component_el_collapse, { class: "call-history" }, {
						default: withCtx(() => [createVNode(_component_el_collapse_item, {
							title: `最近通话记录（${callList.value.length}）`,
							name: "history"
						}, {
							default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", _hoisted_49, [(openBlock(true), createElementBlock(Fragment, null, renderList(callList.value, (item) => {
								return openBlock(), createElementBlock("div", {
									key: item.id,
									class: "call-row"
								}, [
									createBaseVNode("span", { class: normalizeClass(["call-status", { on: Number(item.connected) === 1 }]) }, toDisplayString(Number(item.connected) === 1 ? "接通" : "未接"), 3),
									createBaseVNode("div", _hoisted_50, [
										createBaseVNode("b", null, toDisplayString(formatDateTime(item.callTime)), 1),
										createBaseVNode("p", null, toDisplayString(item.remark || item.result || "无小结"), 1),
										createBaseVNode("em", null, toDisplayString(item.agentName || "坐席") + " · " + toDisplayString(formatDuration(item.duration)), 1)
									]),
									item.recordingAvailable ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "primary",
										onClick: ($event) => openRecord(item.id)
									}, {
										default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("听录音", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								]);
							}), 128)), !callLoading.value && !callList.value.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								description: "还没有通话记录",
								"image-size": 70
							})) : createCommentVNode("", true)])), [[_directive_loading, callLoading.value]])]),
							_: 1
						}, 8, ["title"])]),
						_: 1
					})
				], 64)) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: "请从左侧选择一个客户开始外呼",
					"image-size": 120
				}))])]),
				dialing.value ? (openBlock(), createElementBlock("div", _hoisted_51, [
					_cache[68] || (_cache[68] = createBaseVNode("div", { class: "df-state" }, [createBaseVNode("i"), createTextVNode(" 通话中")], -1)),
					createBaseVNode("h3", null, toDisplayString(dialCtx.customerName), 1),
					createBaseVNode("p", null, toDisplayString(dialCtx.phone), 1),
					createBaseVNode("strong", null, toDisplayString(formatClock(dialSeconds.value)), 1),
					createVNode(_component_el_button, {
						type: "danger",
						round: "",
						loading: hangingUp.value,
						onClick: hangUp
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(hangingUp.value ? "同步挂断中" : "挂断并填写小结"), 1)]),
						_: 1
					}, 8, ["loading"]),
					hangupFailed.value ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						class: "df-secondary",
						text: "",
						onClick: finishCallAfterHangup
					}, {
						default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode(" 已手动挂断，填写小结 ", -1)])]),
						_: 1
					})) : createCommentVNode("", true)
				])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: dialpadVisible.value,
					"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => dialpadVisible.value = $event),
					title: "拨号盘",
					width: "340px",
					"append-to-body": ""
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_52, [
						createVNode(_component_el_input, {
							modelValue: dialpadNumber.value,
							"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => dialpadNumber.value = $event),
							placeholder: "输入号码",
							size: "large"
						}, null, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_53, [(openBlock(), createElementBlock(Fragment, null, renderList(dialpadKeys, (key) => {
							return createBaseVNode("button", {
								key,
								onClick: ($event) => dialpadNumber.value += key
							}, toDisplayString(key), 9, _hoisted_54);
						}), 64))]),
						createVNode(_component_el_button, {
							type: "primary",
							loading: startingDial.value,
							disabled: !dialpadNumber.value || dialing.value,
							onClick: dialManual
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(phone_default))]),
								_: 1
							}), _cache[69] || (_cache[69] = createTextVNode(" 拨打 ", -1))]),
							_: 1
						}, 8, ["loading", "disabled"])
					])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(Customer360Drawer_default, {
					modelValue: customer360Visible.value,
					"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => customer360Visible.value = $event),
					"lead-id": customer360LeadId.value,
					onChanged: handleCustomer360Changed,
					onDial: handleCustomer360Dial
				}, null, 8, ["modelValue", "lead-id"])
			]);
		};
	}
}), [["__scopeId", "data-v-c81cc7f6"]]);
//#endregion
export { tele_workbench_default as default };

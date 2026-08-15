import { Ct as onUnmounted, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, M as ElInputNumber, Nn as plus_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, br as warning_filled_default, en as edit_default, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as opMetricApi } from "./operation-BdrTFFtn.js";
//#region src/api/operation-service.ts
function unwrap(res) {
	if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
	return res;
}
var operationServiceApi = {
	listFeedback(params) {
		return _asyncToGenerator(function* () {
			const data = unwrap(yield get("/ops/ad-feedback/list", params));
			const list = Array.isArray(data === null || data === void 0 ? void 0 : data.list) ? data.list : Array.isArray(data === null || data === void 0 ? void 0 : data.records) ? data.records : [];
			return _objectSpread2(_objectSpread2({}, data), {}, {
				list,
				total: Number((data === null || data === void 0 ? void 0 : data.total) || list.length || 0)
			});
		})();
	},
	getSummary(params) {
		return _asyncToGenerator(function* () {
			return unwrap(yield get("/ops/ad-feedback/summary", params));
		})();
	},
	saveFeedback(payload) {
		return _asyncToGenerator(function* () {
			const body = {
				id: payload.id,
				feedbackDate: payload.feedbackDate,
				platform: payload.platform,
				accountName: payload.accountName,
				campaignName: payload.campaignName,
				spendAmount: Number(payload.spendAmount || 0),
				totalLeads: Number(payload.totalLeads || 0),
				validLeads: Number(payload.validLeads || 0),
				invalidLeads: Number(payload.invalidLeads || 0),
				conversionCount: Number(payload.conversionCount || 0),
				revenueAmount: Number(payload.revenueAmount || 0),
				ownerName: payload.ownerName,
				status: payload.status || "normal",
				remark: payload.remark
			};
			return unwrap(payload.id ? yield put("/ops/ad-feedback", body) : yield post("/ops/ad-feedback", body));
		})();
	},
	deleteFeedback(id) {
		return _asyncToGenerator(function* () {
			return unwrap(yield del(`/ops/ad-feedback/${id}`));
		})();
	}
};
//#endregion
//#region src/views/operation/service-center.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ops-center-page" };
var _hoisted_2 = { class: "ops-hero" };
var _hoisted_3 = { class: "hero-actions" };
var _hoisted_4 = { class: "ops-block" };
var _hoisted_5 = { class: "block-head" };
var _hoisted_6 = { class: "card-grid cols-5" };
var _hoisted_7 = { class: "stat-label" };
var _hoisted_8 = { class: "stat-value" };
var _hoisted_9 = { class: "stat-sub" };
var _hoisted_10 = { class: "ops-block" };
var _hoisted_11 = { class: "block-head" };
var _hoisted_12 = { class: "card-grid cols-6" };
var _hoisted_13 = { class: "pc-head" };
var _hoisted_14 = { class: "pc-name" };
var _hoisted_15 = {
	key: 0,
	class: "pc-rows"
};
var _hoisted_16 = { class: "pc-row" };
var _hoisted_17 = { class: "pc-row" };
var _hoisted_18 = { class: "ok" };
var _hoisted_19 = { class: "pc-row" };
var _hoisted_20 = { class: "danger" };
var _hoisted_21 = { class: "pc-row" };
var _hoisted_22 = {
	key: 1,
	class: "pc-empty"
};
var _hoisted_23 = { class: "ops-block" };
var _hoisted_24 = { class: "block-head" };
var _hoisted_25 = { class: "card-grid cols-6" };
var _hoisted_26 = { class: "pc-head" };
var _hoisted_27 = { class: "pc-name" };
var _hoisted_28 = {
	key: 0,
	class: "pc-rows"
};
var _hoisted_29 = { class: "pc-row" };
var _hoisted_30 = { class: "pc-row" };
var _hoisted_31 = { class: "ok" };
var _hoisted_32 = { class: "pc-row" };
var _hoisted_33 = { class: "danger" };
var _hoisted_34 = { class: "pc-row" };
var _hoisted_35 = {
	key: 1,
	class: "pc-empty"
};
var _hoisted_36 = { class: "ops-block" };
var _hoisted_37 = { class: "block-head" };
var _hoisted_38 = { class: "card-grid cols-2" };
var _hoisted_39 = { class: "board-head" };
var _hoisted_40 = { class: "pc-name" };
var _hoisted_41 = { class: "card-grid cols-4 board-inner" };
var _hoisted_42 = { class: "stat-card" };
var _hoisted_43 = { class: "stat-value" };
var _hoisted_44 = { class: "stat-card" };
var _hoisted_45 = { class: "stat-value" };
var _hoisted_46 = { class: "stat-card" };
var _hoisted_47 = { class: "stat-value" };
var _hoisted_48 = { class: "stat-card is-orange" };
var _hoisted_49 = { class: "stat-value" };
var _hoisted_50 = { class: "card-grid cols-3 board-inner" };
var _hoisted_51 = { class: "stat-card" };
var _hoisted_52 = { class: "stat-value" };
var _hoisted_53 = { class: "stat-card is-green" };
var _hoisted_54 = { class: "stat-value" };
var _hoisted_55 = { class: "stat-card is-blue" };
var _hoisted_56 = { class: "stat-value" };
var _hoisted_57 = { class: "content-grid" };
var _hoisted_58 = { class: "ops-block" };
var _hoisted_59 = { class: "block-head" };
var _hoisted_60 = { class: "today-list" };
var _hoisted_61 = { class: "danger" };
var _hoisted_62 = { class: "ops-block" };
var _hoisted_63 = { class: "ops-block" };
var _hoisted_64 = { class: "block-head" };
var _hoisted_65 = { class: "block-tools" };
var _hoisted_66 = { class: "bottom-grid" };
var _hoisted_67 = { class: "ops-block" };
var _hoisted_68 = { class: "block-head" };
var _hoisted_69 = { class: "alert-list" };
var _hoisted_70 = { class: "ops-block" };
var _hoisted_71 = { class: "block-head" };
var _hoisted_72 = { class: "stack-cell" };
var _hoisted_73 = { class: "pager" };
var _hoisted_74 = { class: "form-grid" };
//#endregion
//#region src/views/operation/service-center.vue
var service_center_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "service-center",
	setup(__props) {
		const platformOptions = [
			"抖音-账多多",
			"抖音-云航",
			"抖音-展优",
			"抖音-利势企业",
			"小红书",
			"高德",
			"视频号",
			"淘宝",
			"柯沃旗舰店",
			"税小象旗舰店",
			"朋友圈",
			"百度"
		];
		const platformDims = [
			{
				key: "xiaohongshu",
				label: "小红书",
				short: "红",
				color: "#FF2442",
				match: ["小红书"]
			},
			{
				key: "douyin",
				label: "抖音",
				short: "抖",
				color: "#161823",
				match: ["抖音"]
			},
			{
				key: "shipinhao",
				label: "视频号",
				short: "视",
				color: "#FA5150",
				match: ["视频号"]
			},
			{
				key: "meituan",
				label: "美团",
				short: "美",
				color: "#FFC300",
				match: ["美团"]
			},
			{
				key: "gaode",
				label: "高德",
				short: "德",
				color: "#00A0EA",
				match: ["高德"]
			},
			{
				key: "dianping",
				label: "大众点评",
				short: "评",
				color: "#FF6633",
				match: ["大众点评", "点评"]
			}
		];
		const today = formatDate(/* @__PURE__ */ new Date());
		const dateRange = ref([firstDayOfMonth(), today]);
		const loading = ref(false);
		const saving = ref(false);
		const dialogVisible = ref(false);
		const records = ref([]);
		const formRef = ref();
		const refreshTimer = ref();
		const filters = reactive({
			platform: "",
			keyword: ""
		});
		const page = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		const emptySummary = () => ({
			totalLeads: 0,
			validLeads: 0,
			invalidLeads: 0,
			conversionCount: 0,
			spendAmount: 0,
			revenueAmount: 0,
			validRate: 0,
			costPerLead: 0,
			roi: 0,
			byPlatform: [],
			byDay: [],
			alerts: ["当前筛选范围还没有投流反馈，请先录入今天的平台数据。"]
		});
		const summary = ref(emptySummary());
		const todayPlatformItems = ref([]);
		const monthPlatformItems = ref([]);
		const channelMetrics = ref([]);
		const defaultForm = () => ({
			feedbackDate: today,
			platform: "",
			accountName: "",
			campaignName: "",
			spendAmount: 0,
			totalLeads: 0,
			validLeads: 0,
			invalidLeads: 0,
			conversionCount: 0,
			revenueAmount: 0,
			ownerName: "",
			status: "normal",
			remark: ""
		});
		const form = reactive(defaultForm());
		const rules = {
			feedbackDate: [{
				required: true,
				message: "请选择反馈日期",
				trigger: "change"
			}],
			platform: [{
				required: true,
				message: "请选择或填写投放平台",
				trigger: "change"
			}]
		};
		const recentDays = computed(() => summary.value.byDay.slice(0, 3));
		const todayRow = computed(() => findDay(today));
		const yesterdayRow = computed(() => findDay(offsetDate(-1)));
		const invalidRateText = computed(() => formatPercent(rate(summary.value.invalidLeads, summary.value.totalLeads)));
		const rangeText = computed(() => {
			var _dateRange$value, _dateRange$value2;
			const start = (_dateRange$value = dateRange.value) === null || _dateRange$value === void 0 ? void 0 : _dateRange$value[0];
			const end = (_dateRange$value2 = dateRange.value) === null || _dateRange$value2 === void 0 ? void 0 : _dateRange$value2[1];
			return start && end ? `${start} ~ ${end}` : "全部时间";
		});
		const monthLabel = computed(() => {
			const now = /* @__PURE__ */ new Date();
			return `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`;
		});
		const coreCards = computed(() => [
			{
				key: "total",
				label: "总客资",
				tone: "",
				value: formatNumber(summary.value.totalLeads),
				sub: "筛选范围内全部投流客资"
			},
			{
				key: "valid",
				label: "有效客资",
				tone: "is-green",
				value: formatNumber(summary.value.validLeads),
				sub: `有效率 ${formatPercent(summary.value.validRate)}`
			},
			{
				key: "invalid",
				label: "无效客资",
				tone: "is-red",
				value: formatNumber(summary.value.invalidLeads),
				sub: `无效率 ${invalidRateText.value}`
			},
			{
				key: "spend",
				label: "投放消耗",
				tone: "is-orange",
				value: formatMoney(summary.value.spendAmount),
				sub: `单客资 ${formatMoney(summary.value.costPerLead)}`
			},
			{
				key: "revenue",
				label: "成交金额",
				tone: "is-blue",
				value: formatMoney(summary.value.revenueAmount),
				sub: `ROI ${formatRoi(summary.value.roi)}`
			}
		]);
		function toPlatformCards(items) {
			return platformDims.map((dim) => {
				const matched = items.filter((it) => {
					const name = String(it.platform || "");
					return dim.match.some((m) => name.includes(m));
				});
				if (!matched.length) return _objectSpread2(_objectSpread2({}, dim), {}, {
					hasData: false,
					totalLeads: 0,
					validLeads: 0,
					invalidLeads: 0,
					spendAmount: 0
				});
				return _objectSpread2(_objectSpread2({}, dim), {}, {
					hasData: true,
					totalLeads: sumBy(matched, (it) => it.totalLeads),
					validLeads: sumBy(matched, (it) => it.validLeads),
					invalidLeads: sumBy(matched, (it) => it.invalidLeads),
					spendAmount: sumBy(matched, (it) => Number(it.spendAmount || 0))
				});
			});
		}
		const platformCardsToday = computed(() => toPlatformCards(todayPlatformItems.value));
		const platformCardsMonth = computed(() => toPlatformCards(monthPlatformItems.value));
		const localLifeBoards = computed(() => {
			const start = firstDayOfMonth();
			return [{
				key: "meituan",
				label: "美团",
				short: "美",
				color: "#FFC300",
				metricKeys: ["meituan"],
				leadMatch: ["美团"]
			}, {
				key: "dianping",
				label: "大众点评",
				short: "评",
				color: "#FF6633",
				metricKeys: ["dianping", "dazhongdianping"],
				leadMatch: ["大众点评", "点评"]
			}].map((biz) => {
				const monthMetrics = channelMetrics.value.filter((m) => biz.metricKeys.includes(String(m.platform)) && String(m.statDate) >= start);
				const key0 = monthMetrics.length ? {
					views: sumBy(monthMetrics, (m) => Number(m.views || 0)),
					visits: sumBy(monthMetrics, (m) => Number(m.visits || 0)),
					inquiries: sumBy(monthMetrics, (m) => Number(m.inquiries || 0)),
					adCost: sumBy(monthMetrics, (m) => Number(m.adCost || 0))
				} : {
					views: null,
					visits: null,
					inquiries: null,
					adCost: null
				};
				const matched = monthPlatformItems.value.filter((it) => {
					const name = String(it.platform || "");
					return biz.leadMatch.some((m) => name.includes(m));
				});
				const leads = matched.length ? {
					hasData: true,
					totalLeads: sumBy(matched, (it) => it.totalLeads),
					validLeads: sumBy(matched, (it) => it.validLeads),
					conversionCount: sumBy(matched, (it) => Number(it.conversionCount || 0))
				} : {
					hasData: false,
					totalLeads: 0,
					validLeads: 0,
					conversionCount: 0
				};
				return _objectSpread2(_objectSpread2({}, biz), {}, {
					key0,
					leads
				});
			});
		});
		function queryParams() {
			var _dateRange$value3, _dateRange$value4;
			return {
				startDate: (_dateRange$value3 = dateRange.value) === null || _dateRange$value3 === void 0 ? void 0 : _dateRange$value3[0],
				endDate: (_dateRange$value4 = dateRange.value) === null || _dateRange$value4 === void 0 ? void 0 : _dateRange$value4[1],
				platform: filters.platform || void 0,
				keyword: filters.keyword || void 0
			};
		}
		function loadData() {
			return _loadData.apply(this, arguments);
		}
		function _loadData() {
			_loadData = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const params = queryParams();
					const monthStart = firstDayOfMonth();
					const [summaryData, pageData] = yield Promise.all([operationServiceApi.getSummary(params), operationServiceApi.listFeedback(_objectSpread2(_objectSpread2({}, params), {}, {
						pageNum: page.pageNum,
						pageSize: page.pageSize
					}))]);
					summary.value = _objectSpread2(_objectSpread2({}, emptySummary()), summaryData);
					records.value = pageData.list || [];
					page.total = pageData.total || 0;
					try {
						const [todaySummary, monthSummary] = yield Promise.all([operationServiceApi.getSummary({
							startDate: today,
							endDate: today
						}), operationServiceApi.getSummary({
							startDate: monthStart,
							endDate: today
						})]);
						todayPlatformItems.value = (todaySummary === null || todaySummary === void 0 ? void 0 : todaySummary.byPlatform) || [];
						monthPlatformItems.value = (monthSummary === null || monthSummary === void 0 ? void 0 : monthSummary.byPlatform) || [];
					} catch (_unused) {
						todayPlatformItems.value = [];
						monthPlatformItems.value = [];
					}
					try {
						var _res$data;
						const res = yield opMetricApi.recent({
							days: 31,
							category: "overview"
						});
						const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
						channelMetrics.value = Array.isArray(data) ? data : [];
					} catch (_unused2) {
						channelMetrics.value = [];
					}
				} finally {
					loading.value = false;
				}
			});
			return _loadData.apply(this, arguments);
		}
		function openCreate() {
			Object.assign(form, defaultForm());
			dialogVisible.value = true;
		}
		function openEdit(row) {
			Object.assign(form, defaultForm(), row);
			dialogVisible.value = true;
		}
		function submitForm() {
			return _submitForm.apply(this, arguments);
		}
		function _submitForm() {
			_submitForm = _asyncToGenerator(function* () {
				var _formRef$value;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				saving.value = true;
				try {
					yield operationServiceApi.saveFeedback(_objectSpread2({}, form));
					ElMessage.success("投流反馈已保存");
					dialogVisible.value = false;
					yield loadData();
				} finally {
					saving.value = false;
				}
			});
			return _submitForm.apply(this, arguments);
		}
		function removeRecord(_x) {
			return _removeRecord.apply(this, arguments);
		}
		function _removeRecord() {
			_removeRecord = _asyncToGenerator(function* (row) {
				if (!row.id) return;
				yield ElMessageBox.confirm(`确认删除 ${row.feedbackDate} ${row.platform} 的投流反馈吗？`, "删除确认", {
					type: "warning",
					confirmButtonText: "删除",
					cancelButtonText: "取消"
				});
				yield operationServiceApi.deleteFeedback(row.id);
				ElMessage.success("已删除");
				yield loadData();
			});
			return _removeRecord.apply(this, arguments);
		}
		function findDay(date) {
			return summary.value.byDay.find((item) => item.date === date) || {
				date,
				totalLeads: 0,
				validLeads: 0,
				invalidLeads: 0,
				spendAmount: 0,
				conversionCount: 0,
				revenueAmount: 0
			};
		}
		function sumBy(list, getter) {
			return list.reduce((acc, item) => acc + Number(getter(item) || 0), 0);
		}
		function formatDate(date) {
			return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
		}
		function firstDayOfMonth() {
			const now = /* @__PURE__ */ new Date();
			return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
		}
		function offsetDate(offset) {
			const date = /* @__PURE__ */ new Date();
			date.setDate(date.getDate() + offset);
			return formatDate(date);
		}
		function formatNumber(value) {
			return Number(value || 0).toLocaleString("zh-CN");
		}
		function formatMoney(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
		}
		function formatPercent(value) {
			return `${Number(value || 0).toFixed(1)}%`;
		}
		function formatRoi(value) {
			return `${Number(value || 0).toFixed(2)}`;
		}
		function rate(part, total) {
			return Number(total || 0) > 0 ? Number(part || 0) * 100 / Number(total || 0) : 0;
		}
		function deltaText(current, previous) {
			const delta = Number(current || 0) - Number(previous || 0);
			if (delta === 0) return "持平";
			return `${delta > 0 ? "+" : ""}${delta}`;
		}
		function moneyDeltaText(current, previous) {
			const delta = Number(current || 0) - Number(previous || 0);
			if (delta === 0) return "持平";
			return `${delta > 0 ? "+" : ""}${formatMoney(delta)}`;
		}
		function trendClass(current, previous) {
			const delta = Number(current || 0) - Number(previous || 0);
			if (delta > 0) return "up";
			if (delta < 0) return "down";
			return "";
		}
		onMounted(() => {
			loadData();
			refreshTimer.value = window.setInterval(loadData, 6e4);
		});
		onUnmounted(() => {
			if (refreshTimer.value) window.clearInterval(refreshTimer.value);
		});
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [_cache[22] || (_cache[22] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "eyebrow" }, "OPERATION · REALTIME FEEDBACK"),
					createBaseVNode("h1", null, "运营看板"),
					createBaseVNode("p", null, "实时记录线上投流消耗、客资质量、有效率、转化和成交金额，让运营每天能用数据复盘。")
				], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_date_picker, {
						modelValue: dateRange.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => dateRange.value = $event),
						type: "daterange",
						"range-separator": "至",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						"value-format": "YYYY-MM-DD",
						class: "date-range",
						onChange: loadData
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: loadData
					}, {
						default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: openCreate
					}, {
						default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("录入今日反馈", -1)])]),
						_: 1
					}, 8, ["icon"])
				])]),
				createBaseVNode("section", _hoisted_4, [createBaseVNode("div", _hoisted_5, [_cache[23] || (_cache[23] = createBaseVNode("div", null, [createBaseVNode("h2", null, "全域核心数据"), createBaseVNode("p", null, "当前筛选范围内的全部投流客资、消耗与成交汇总。")], -1)), createVNode(_component_el_tag, {
					type: "info",
					effect: "plain"
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(rangeText.value), 1)]),
					_: 1
				})]), createBaseVNode("div", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(coreCards.value, (c) => {
					return openBlock(), createElementBlock("div", {
						key: c.key,
						class: normalizeClass(["stat-card", c.tone])
					}, [
						createBaseVNode("span", _hoisted_7, toDisplayString(c.label), 1),
						createBaseVNode("strong", _hoisted_8, toDisplayString(c.value), 1),
						createBaseVNode("small", _hoisted_9, toDisplayString(c.sub), 1)
					], 2);
				}), 128))])]),
				createBaseVNode("section", _hoisted_10, [createBaseVNode("div", _hoisted_11, [createBaseVNode("div", null, [_cache[24] || (_cache[24] = createBaseVNode("h2", null, "各平台今日数据", -1)), createBaseVNode("p", null, toDisplayString(unref(today)) + " · 按平台拆分客资质量与消耗，暂无投放的平台显示占位。", 1)]), createVNode(_component_el_tag, {
					type: "success",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("今日", -1)])]),
					_: 1
				})]), createBaseVNode("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(platformCardsToday.value, (p) => {
					return openBlock(), createElementBlock("div", {
						key: "today-" + p.key,
						class: "platform-card"
					}, [createBaseVNode("div", _hoisted_13, [createBaseVNode("span", {
						class: "pc-logo",
						style: normalizeStyle({ background: p.color })
					}, toDisplayString(p.short), 5), createBaseVNode("span", _hoisted_14, toDisplayString(p.label), 1)]), p.hasData ? (openBlock(), createElementBlock("div", _hoisted_15, [
						createBaseVNode("div", _hoisted_16, [_cache[26] || (_cache[26] = createBaseVNode("span", null, "客资", -1)), createBaseVNode("b", null, toDisplayString(formatNumber(p.totalLeads)), 1)]),
						createBaseVNode("div", _hoisted_17, [_cache[27] || (_cache[27] = createBaseVNode("span", null, "有效", -1)), createBaseVNode("b", _hoisted_18, toDisplayString(formatNumber(p.validLeads)), 1)]),
						createBaseVNode("div", _hoisted_19, [_cache[28] || (_cache[28] = createBaseVNode("span", null, "无效", -1)), createBaseVNode("b", _hoisted_20, toDisplayString(formatNumber(p.invalidLeads)), 1)]),
						createBaseVNode("div", _hoisted_21, [_cache[29] || (_cache[29] = createBaseVNode("span", null, "消耗", -1)), createBaseVNode("b", null, toDisplayString(formatMoney(p.spendAmount)), 1)])
					])) : (openBlock(), createElementBlock("div", _hoisted_22, "今日暂无数据"))]);
				}), 128))])]),
				createBaseVNode("section", _hoisted_23, [createBaseVNode("div", _hoisted_24, [createBaseVNode("div", null, [_cache[30] || (_cache[30] = createBaseVNode("h2", null, "各平台本月数据", -1)), createBaseVNode("p", null, toDisplayString(monthLabel.value) + " · 按平台拆分本月累计客资与消耗。", 1)]), createVNode(_component_el_tag, {
					type: "warning",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("本月", -1)])]),
					_: 1
				})]), createBaseVNode("div", _hoisted_25, [(openBlock(true), createElementBlock(Fragment, null, renderList(platformCardsMonth.value, (p) => {
					return openBlock(), createElementBlock("div", {
						key: "month-" + p.key,
						class: "platform-card"
					}, [createBaseVNode("div", _hoisted_26, [createBaseVNode("span", {
						class: "pc-logo",
						style: normalizeStyle({ background: p.color })
					}, toDisplayString(p.short), 5), createBaseVNode("span", _hoisted_27, toDisplayString(p.label), 1)]), p.hasData ? (openBlock(), createElementBlock("div", _hoisted_28, [
						createBaseVNode("div", _hoisted_29, [_cache[32] || (_cache[32] = createBaseVNode("span", null, "客资", -1)), createBaseVNode("b", null, toDisplayString(formatNumber(p.totalLeads)), 1)]),
						createBaseVNode("div", _hoisted_30, [_cache[33] || (_cache[33] = createBaseVNode("span", null, "有效", -1)), createBaseVNode("b", _hoisted_31, toDisplayString(formatNumber(p.validLeads)), 1)]),
						createBaseVNode("div", _hoisted_32, [_cache[34] || (_cache[34] = createBaseVNode("span", null, "无效", -1)), createBaseVNode("b", _hoisted_33, toDisplayString(formatNumber(p.invalidLeads)), 1)]),
						createBaseVNode("div", _hoisted_34, [_cache[35] || (_cache[35] = createBaseVNode("span", null, "消耗", -1)), createBaseVNode("b", null, toDisplayString(formatMoney(p.spendAmount)), 1)])
					])) : (openBlock(), createElementBlock("div", _hoisted_35, "本月暂无数据"))]);
				}), 128))])]),
				createBaseVNode("section", _hoisted_36, [createBaseVNode("div", _hoisted_37, [_cache[37] || (_cache[37] = createBaseVNode("div", null, [createBaseVNode("h2", null, "美团 & 大众点评"), createBaseVNode("p", null, "关键数据来自「平台运营数据」录入，线索数据来自投流反馈台账；未录入项显示占位。")], -1)), createVNode(_component_el_tag, {
					type: "info",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("本月", -1)])]),
					_: 1
				})]), createBaseVNode("div", _hoisted_38, [(openBlock(true), createElementBlock(Fragment, null, renderList(localLifeBoards.value, (biz) => {
					return openBlock(), createElementBlock("div", {
						key: biz.key,
						class: "board-card"
					}, [
						createBaseVNode("div", _hoisted_39, [createBaseVNode("span", {
							class: "pc-logo",
							style: normalizeStyle({ background: biz.color })
						}, toDisplayString(biz.short), 5), createBaseVNode("span", _hoisted_40, toDisplayString(biz.label), 1)]),
						_cache[45] || (_cache[45] = createBaseVNode("div", { class: "board-section-title" }, "关键数据", -1)),
						createBaseVNode("div", _hoisted_41, [
							createBaseVNode("div", _hoisted_42, [_cache[38] || (_cache[38] = createBaseVNode("span", { class: "stat-label" }, "浏览量", -1)), createBaseVNode("strong", _hoisted_43, toDisplayString(biz.key0.views == null ? "本月暂无数据" : formatNumber(biz.key0.views)), 1)]),
							createBaseVNode("div", _hoisted_44, [_cache[39] || (_cache[39] = createBaseVNode("span", { class: "stat-label" }, "访问量", -1)), createBaseVNode("strong", _hoisted_45, toDisplayString(biz.key0.visits == null ? "本月暂无数据" : formatNumber(biz.key0.visits)), 1)]),
							createBaseVNode("div", _hoisted_46, [_cache[40] || (_cache[40] = createBaseVNode("span", { class: "stat-label" }, "咨询量", -1)), createBaseVNode("strong", _hoisted_47, toDisplayString(biz.key0.inquiries == null ? "本月暂无数据" : formatNumber(biz.key0.inquiries)), 1)]),
							createBaseVNode("div", _hoisted_48, [_cache[41] || (_cache[41] = createBaseVNode("span", { class: "stat-label" }, "推广消耗", -1)), createBaseVNode("strong", _hoisted_49, toDisplayString(biz.key0.adCost == null ? "本月暂无数据" : formatMoney(biz.key0.adCost)), 1)])
						]),
						_cache[46] || (_cache[46] = createBaseVNode("div", { class: "board-section-title" }, "线索数据", -1)),
						createBaseVNode("div", _hoisted_50, [
							createBaseVNode("div", _hoisted_51, [_cache[42] || (_cache[42] = createBaseVNode("span", { class: "stat-label" }, "客资", -1)), createBaseVNode("strong", _hoisted_52, toDisplayString(biz.leads.hasData ? formatNumber(biz.leads.totalLeads) : "本月暂无数据"), 1)]),
							createBaseVNode("div", _hoisted_53, [_cache[43] || (_cache[43] = createBaseVNode("span", { class: "stat-label" }, "有效客资", -1)), createBaseVNode("strong", _hoisted_54, toDisplayString(biz.leads.hasData ? formatNumber(biz.leads.validLeads) : "本月暂无数据"), 1)]),
							createBaseVNode("div", _hoisted_55, [_cache[44] || (_cache[44] = createBaseVNode("span", { class: "stat-label" }, "成交（转化）", -1)), createBaseVNode("strong", _hoisted_56, toDisplayString(biz.leads.hasData ? formatNumber(biz.leads.conversionCount) : "本月暂无数据"), 1)])
						])
					]);
				}), 128))])]),
				createBaseVNode("section", _hoisted_57, [createBaseVNode("div", _hoisted_58, [createBaseVNode("div", _hoisted_59, [createBaseVNode("div", null, [_cache[47] || (_cache[47] = createBaseVNode("h2", null, "今日投流反馈", -1)), createBaseVNode("p", null, toDisplayString(unref(today)) + " · 页面每 60 秒自动刷新一次", 1)]), createVNode(_component_el_tag, {
					type: "success",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("实时", -1)])]),
					_: 1
				})]), createBaseVNode("div", _hoisted_60, [
					createBaseVNode("div", null, [
						_cache[49] || (_cache[49] = createBaseVNode("span", null, "新增客资", -1)),
						createBaseVNode("strong", null, toDisplayString(formatNumber(todayRow.value.totalLeads)), 1),
						createBaseVNode("small", { class: normalizeClass(trendClass(todayRow.value.totalLeads, yesterdayRow.value.totalLeads)) }, toDisplayString(deltaText(todayRow.value.totalLeads, yesterdayRow.value.totalLeads)), 3)
					]),
					createBaseVNode("div", null, [
						_cache[50] || (_cache[50] = createBaseVNode("span", null, "有效", -1)),
						createBaseVNode("strong", null, toDisplayString(formatNumber(todayRow.value.validLeads)), 1),
						createBaseVNode("small", { class: normalizeClass(trendClass(todayRow.value.validLeads, yesterdayRow.value.validLeads)) }, toDisplayString(deltaText(todayRow.value.validLeads, yesterdayRow.value.validLeads)), 3)
					]),
					createBaseVNode("div", null, [
						_cache[51] || (_cache[51] = createBaseVNode("span", null, "无效", -1)),
						createBaseVNode("strong", _hoisted_61, toDisplayString(formatNumber(todayRow.value.invalidLeads)), 1),
						createBaseVNode("small", { class: normalizeClass(trendClass(yesterdayRow.value.invalidLeads, todayRow.value.invalidLeads)) }, toDisplayString(deltaText(todayRow.value.invalidLeads, yesterdayRow.value.invalidLeads)), 3)
					]),
					createBaseVNode("div", null, [
						_cache[52] || (_cache[52] = createBaseVNode("span", null, "今日消耗", -1)),
						createBaseVNode("strong", null, toDisplayString(formatMoney(todayRow.value.spendAmount)), 1),
						createBaseVNode("small", { class: normalizeClass(trendClass(yesterdayRow.value.spendAmount, todayRow.value.spendAmount)) }, toDisplayString(moneyDeltaText(todayRow.value.spendAmount, yesterdayRow.value.spendAmount)), 3)
					])
				])]), createBaseVNode("div", _hoisted_62, [_cache[53] || (_cache[53] = createBaseVNode("div", { class: "block-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "近三天客资对比"), createBaseVNode("p", null, "快速判断今天是否异常波动")])], -1)), createVNode(_component_el_table, {
					data: recentDays.value,
					size: "small",
					class: "mini-table",
					"empty-text": "暂无数据"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "date",
							label: "日期",
							"min-width": "120"
						}),
						createVNode(_component_el_table_column, {
							prop: "totalLeads",
							label: "总客资",
							width: "90",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							prop: "validLeads",
							label: "有效",
							width: "90",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							prop: "invalidLeads",
							label: "无效",
							width: "90",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "消耗",
							width: "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatMoney(row.spendAmount)), 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])])]),
				createBaseVNode("section", _hoisted_63, [createBaseVNode("div", _hoisted_64, [_cache[55] || (_cache[55] = createBaseVNode("div", null, [createBaseVNode("h2", null, "平台投流反馈"), createBaseVNode("p", null, "按平台汇总客资质量、单客资成本与 ROI。")], -1)), createBaseVNode("div", _hoisted_65, [
					createVNode(_component_el_select, {
						modelValue: filters.platform,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.platform = $event),
						clearable: "",
						filterable: "",
						placeholder: "全部平台",
						style: { "width": "180px" },
						onChange: loadData
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(platformOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item,
								label: item,
								value: item
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_input, {
						modelValue: filters.keyword,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.keyword = $event),
						clearable: "",
						placeholder: "搜索账户/计划/负责人",
						style: { "width": "240px" },
						onKeyup: withKeys(loadData, ["enter"]),
						onClear: loadData
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, { onClick: loadData }, {
						default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("查询", -1)])]),
						_: 1
					})
				])]), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: summary.value.byPlatform,
					stripe: "",
					class: "ops-table",
					"empty-text": "暂无数据"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "platform",
							label: "平台",
							"min-width": "160"
						}),
						createVNode(_component_el_table_column, {
							prop: "totalLeads",
							label: "总客资",
							width: "100",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							prop: "validLeads",
							label: "有效客资",
							width: "110",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							prop: "invalidLeads",
							label: "无效客资",
							width: "110",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "有效率",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatPercent(row.validRate)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "投放消耗",
							width: "130",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatMoney(row.spendAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "单客资成本",
							width: "130",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatMoney(row.costPerLead)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "conversionCount",
							label: "成交数",
							width: "100",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "ROI",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: Number(row.roi) >= 1 ? "success" : "warning",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(formatRoi(row.roi)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])]),
				createBaseVNode("section", _hoisted_66, [createBaseVNode("div", _hoisted_67, [createBaseVNode("div", _hoisted_68, [_cache[56] || (_cache[56] = createBaseVNode("div", null, [createBaseVNode("h2", null, "异常预警"), createBaseVNode("p", null, "无效率、单客资成本、数据缺口会自动提示。")], -1)), createVNode(_component_el_icon, { class: "warn-icon" }, {
					default: withCtx(() => [createVNode(unref(warning_filled_default))]),
					_: 1
				})]), createBaseVNode("div", _hoisted_69, [(openBlock(true), createElementBlock(Fragment, null, renderList(summary.value.alerts, (alert) => {
					return openBlock(), createElementBlock("div", {
						key: alert,
						class: "alert-item"
					}, toDisplayString(alert), 1);
				}), 128))])]), createBaseVNode("div", _hoisted_70, [
					createBaseVNode("div", _hoisted_71, [_cache[58] || (_cache[58] = createBaseVNode("div", null, [createBaseVNode("h2", null, "投流反馈台账"), createBaseVNode("p", null, "每天每个平台至少录入一次，保持数据连续。")], -1)), createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: openCreate
					}, {
						default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("新增反馈", -1)])]),
						_: 1
					}, 8, ["icon"])]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: records.value,
						stripe: "",
						class: "ops-table",
						"empty-text": "暂无数据"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "feedbackDate",
								label: "日期",
								width: "120"
							}),
							createVNode(_component_el_table_column, {
								prop: "platform",
								label: "平台",
								"min-width": "110"
							}),
							createVNode(_component_el_table_column, {
								label: "账户/计划",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_72, [createBaseVNode("strong", null, toDisplayString(row.accountName || "-"), 1), createBaseVNode("span", null, toDisplayString(row.campaignName || "未填写计划"), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "totalLeads",
								label: "客资",
								width: "80",
								align: "right"
							}),
							createVNode(_component_el_table_column, {
								prop: "validLeads",
								label: "有效",
								width: "80",
								align: "right"
							}),
							createVNode(_component_el_table_column, {
								prop: "invalidLeads",
								label: "无效",
								width: "80",
								align: "right"
							}),
							createVNode(_component_el_table_column, {
								label: "消耗",
								width: "120",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(formatMoney(row.spendAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "负责人",
								prop: "ownerName",
								width: "110"
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "130",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									icon: unref(edit_default),
									onClick: ($event) => openEdit(row)
								}, {
									default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["icon", "onClick"]), createVNode(_component_el_button, {
									link: "",
									type: "danger",
									icon: unref(delete_default),
									onClick: ($event) => removeRecord(row)
								}, {
									default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["icon", "onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_73, [createVNode(_component_el_pagination, {
						"current-page": page.pageNum,
						"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => page.pageNum = $event),
						"page-size": page.pageSize,
						"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => page.pageSize = $event),
						layout: "total, sizes, prev, pager, next",
						total: page.total,
						"page-sizes": [
							10,
							20,
							50
						],
						onSizeChange: loadData,
						onCurrentChange: loadData
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				])]),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => dialogVisible.value = $event),
					title: form.id ? "编辑投流反馈" : "新增投流反馈",
					width: "760px",
					class: "ops-dialog"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[18] || (_cache[18] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: saving.value,
						onClick: submitForm
					}, {
						default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form,
						rules,
						"label-width": "96px"
					}, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_74, [
							createVNode(_component_el_form_item, {
								label: "反馈日期",
								prop: "feedbackDate"
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: form.feedbackDate,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.feedbackDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									placeholder: "选择日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "投放平台",
								prop: "platform"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.platform,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.platform = $event),
									filterable: "",
									"allow-create": "",
									"default-first-option": "",
									placeholder: "选择或输入平台"
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(platformOptions, (item) => {
										return createVNode(_component_el_option, {
											key: item,
											label: item,
											value: item
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "投放账户" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.accountName,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.accountName = $event),
									placeholder: "例如 抖音-账多多"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "计划/素材" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.campaignName,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.campaignName = $event),
									placeholder: "例如 杭州代理记账-表单"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "投放消耗" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.spendAmount,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.spendAmount = $event),
									min: 0,
									precision: 2,
									step: 100,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "总客资" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.totalLeads,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.totalLeads = $event),
									min: 0,
									step: 1,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "有效客资" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.validLeads,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.validLeads = $event),
									min: 0,
									step: 1,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "无效客资" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.invalidLeads,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.invalidLeads = $event),
									min: 0,
									step: 1,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "成交数" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.conversionCount,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.conversionCount = $event),
									min: 0,
									step: 1,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "成交金额" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.revenueAmount,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.revenueAmount = $event),
									min: 0,
									precision: 2,
									step: 500,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "负责人" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.ownerName,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.ownerName = $event),
									placeholder: "例如 运营负责人"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.status,
									"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.status = $event)
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "正常投放",
											value: "normal"
										}),
										createVNode(_component_el_option, {
											label: "重点观察",
											value: "watch"
										}),
										createVNode(_component_el_option, {
											label: "暂停投放",
											value: "paused"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})
						]), createVNode(_component_el_form_item, { label: "复盘备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.remark,
								"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.remark = $event),
								type: "textarea",
								rows: 3,
								placeholder: "记录无效原因、素材调整、客服反馈等"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-3129f397"]]);
//#endregion
export { service_center_default as default };

import { Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, F as ElEmpty, _ as ElTableColumn, c as ElSegmented, g as ElTable, it as ElTag, o as ElMessage, ot as ElButton, s as vLoading } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as callRecordApi } from "./call-record-vMQDzD4r.js";
//#region src/views/call-center/tele-statistics.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "tele-board" };
var _hoisted_2 = { class: "board-head" };
var _hoisted_3 = { class: "head-actions" };
var _hoisted_4 = { class: "kpi-grid" };
var _hoisted_5 = { class: "kpi-label" };
var _hoisted_6 = { class: "kpi-value" };
var _hoisted_7 = { class: "main-grid" };
var _hoisted_8 = { class: "panel trend-panel" };
var _hoisted_9 = { class: "panel-head" };
var _hoisted_10 = {
	key: 0,
	class: "chart-wrap"
};
var _hoisted_11 = {
	viewBox: "0 0 900 260",
	preserveAspectRatio: "none",
	"aria-label": "外呼趋势"
};
var _hoisted_12 = ["y1", "y2"];
var _hoisted_13 = ["points"];
var _hoisted_14 = ["points"];
var _hoisted_15 = ["points"];
var _hoisted_16 = ["x"];
var _hoisted_17 = { class: "panel rank-panel" };
var _hoisted_18 = {
	key: 0,
	class: "rank-bars"
};
var _hoisted_19 = { class: "rank-name" };
var _hoisted_20 = { class: "rank-track" };
var _hoisted_21 = { class: "panel table-panel" };
var _hoisted_22 = { class: "agent-cell" };
var _hoisted_23 = { class: "side-stack" };
var _hoisted_24 = { class: "panel rate-panel" };
var _hoisted_25 = {
	key: 0,
	class: "rate-list"
};
var _hoisted_26 = { class: "panel todo-panel" };
var _hoisted_27 = { class: "todo-list" };
var _hoisted_28 = { class: "sync-tip" };
//#endregion
//#region src/views/call-center/tele-statistics.vue
var tele_statistics_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "tele-statistics",
	setup(__props) {
		function unwrap(res) {
			var _res$data;
			return (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
		}
		const rangeOptions = [
			{
				label: "今日",
				value: "today"
			},
			{
				label: "昨日",
				value: "yesterday"
			},
			{
				label: "最近7天",
				value: "7d"
			},
			{
				label: "最近30天",
				value: "30d"
			}
		];
		const range = ref("today");
		const loading = ref(false);
		const syncing = ref(false);
		const dashboard = ref(null);
		const emptySummary = {
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
			avgDurationText: "0m 0s",
			topAgentName: "暂无",
			topAgentCalls: 0
		};
		const summary = computed(() => {
			var _dashboard$value;
			return ((_dashboard$value = dashboard.value) === null || _dashboard$value === void 0 ? void 0 : _dashboard$value.summary) || emptySummary;
		});
		const previousSummary = computed(() => {
			var _dashboard$value2;
			return ((_dashboard$value2 = dashboard.value) === null || _dashboard$value2 === void 0 ? void 0 : _dashboard$value2.previousSummary) || emptySummary;
		});
		const agents = computed(() => {
			var _dashboard$value3;
			return ((_dashboard$value3 = dashboard.value) === null || _dashboard$value3 === void 0 ? void 0 : _dashboard$value3.agents) || [];
		});
		const trend = computed(() => {
			var _dashboard$value4;
			return ((_dashboard$value4 = dashboard.value) === null || _dashboard$value4 === void 0 ? void 0 : _dashboard$value4.trend) || [];
		});
		const todo = computed(() => {
			var _dashboard$value5;
			return ((_dashboard$value5 = dashboard.value) === null || _dashboard$value5 === void 0 ? void 0 : _dashboard$value5.todo) || {
				callbackCount: 0,
				highIntentCount: 0,
				recordReviewCount: 0,
				lowConnectAgentCount: 0
			};
		});
		const latestCallTime = computed(() => formatDateTime(summary.value.latestCallTime));
		const rangeLabel = computed(() => {
			var _rangeOptions$find;
			return ((_rangeOptions$find = rangeOptions.find((item) => item.value === range.value)) === null || _rangeOptions$find === void 0 ? void 0 : _rangeOptions$find.label) || "今日";
		});
		const kpiCards = computed(() => [
			{
				key: "total",
				label: "总电话量",
				value: formatNumber(summary.value.totalCalls),
				sub: deltaText(summary.value.totalCalls, previousSummary.value.totalCalls, "通"),
				tone: toneByDelta(summary.value.totalCalls, previousSummary.value.totalCalls)
			},
			{
				key: "connected",
				label: "接通量",
				value: formatNumber(summary.value.connectedCount),
				sub: `未接 ${summary.value.missedCount || 0} / 失败 ${summary.value.failedCount || 0}`,
				tone: ""
			},
			{
				key: "rate",
				label: "接通率",
				value: `${summary.value.connectRate || 0}%`,
				sub: "目标 40%",
				tone: (summary.value.connectRate || 0) >= 40 ? "up" : "down"
			},
			{
				key: "duration",
				label: "通话时长",
				value: summary.value.totalDurationText || "0m 0s",
				sub: `平均 ${summary.value.avgDurationText || "0m 0s"}`,
				tone: ""
			},
			{
				key: "valid",
				label: "有效沟通",
				value: formatNumber(summary.value.validCount),
				sub: `有效/接通 ${summary.value.validRate || 0}%`,
				tone: "up"
			},
			{
				key: "top",
				label: "今日排行第一",
				value: summary.value.topAgentName || "暂无",
				sub: `${summary.value.topAgentCalls || 0} 通`,
				tone: ""
			}
		]);
		const topAgents = computed(() => agents.value.slice(0, 7));
		const maxCalls = computed(() => Math.max(...topAgents.value.map((item) => item.callCount || 0), 1));
		const connectRateRank = computed(() => agents.value.filter((item) => (item.callCount || 0) > 0).slice().sort((a, b) => (b.connectRate || 0) - (a.connectRate || 0)).slice(0, 5));
		const todoRows = computed(() => [
			{
				label: "未接客户二次回拨",
				value: `${todo.value.callbackCount || 0} 条`
			},
			{
				label: "高意向客户待建任务",
				value: `${todo.value.highIntentCount || 0} 条`
			},
			{
				label: "录音质检待复盘",
				value: `${todo.value.recordReviewCount || 0} 条`
			},
			{
				label: "接通率低于35%坐席",
				value: `${todo.value.lowConnectAgentCount || 0} 人`
			}
		]);
		const gridLines = [
			46,
			96,
			146,
			196
		];
		const maxTrendValue = computed(() => Math.max(...trend.value.flatMap((item) => [
			item.callCount || 0,
			item.connectedCount || 0,
			item.validCount || 0
		]), 1));
		function loadDashboard() {
			return _loadDashboard.apply(this, arguments);
		}
		function _loadDashboard() {
			_loadDashboard = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					dashboard.value = unwrap(yield callRecordApi.dashboard({ range: range.value }));
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "电销外呼看板加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _loadDashboard.apply(this, arguments);
		}
		function syncNow() {
			return _syncNow.apply(this, arguments);
		}
		function _syncNow() {
			_syncNow = _asyncToGenerator(function* () {
				syncing.value = true;
				try {
					const res = unwrap(yield callRecordApi.syncYunkeFailed(20));
					ElMessage.success(`已同步 ${(res === null || res === void 0 ? void 0 : res.inserted) || 0} 条，更新 ${(res === null || res === void 0 ? void 0 : res.updated) || 0} 条`);
					yield loadDashboard();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "同步失败");
				} finally {
					syncing.value = false;
				}
			});
			return _syncNow.apply(this, arguments);
		}
		function chartX(index) {
			if (trend.value.length <= 1) return 458;
			return 60 + index * (800 / (trend.value.length - 1));
		}
		function chartY(value) {
			return 218 - (value || 0) / maxTrendValue.value * 168;
		}
		function linePoints(key) {
			return trend.value.map((item, index) => `${chartX(index)},${chartY(item[key])}`).join(" ");
		}
		function barWidth(value) {
			return `${Math.max((value || 0) / maxCalls.value * 100, 4)}%`;
		}
		function firstChar(name) {
			return name ? String(name).trim().charAt(0) : "客";
		}
		function formatNumber(value) {
			return Number(value || 0).toLocaleString("zh-CN");
		}
		function formatDateTime(value) {
			if (!value) return "";
			return String(value).replace("T", " ").slice(0, 16);
		}
		function deltaText(current, previous, unit = "") {
			const cur = Number(current || 0);
			const prev = Number(previous || 0);
			if (!prev && cur) return `新增 ${formatNumber(cur)}${unit}`;
			if (!prev) return "较前期持平";
			const diff = cur - prev;
			const rate = Math.round(diff / prev * 1e3) / 10;
			return `${diff >= 0 ? "较前期 +" : "较前期 "}${rate}%`;
		}
		function toneByDelta(current, previous) {
			return Number(current || 0) >= Number(previous || 0) ? "up" : "down";
		}
		function rankClass(index) {
			return index === 0 ? "gold" : index === 1 ? "silver" : index === 2 ? "bronze" : "";
		}
		function statusText(rank) {
			if (!rank || rank <= 3) return "领先";
			if (rank <= 6) return "达标";
			return "追赶";
		}
		function statusType(rank) {
			if (!rank || rank <= 3) return "success";
			if (rank <= 6) return "primary";
			return "warning";
		}
		onMounted(loadDashboard);
		return (_ctx, _cache) => {
			const _component_el_segmented = ElSegmented;
			const _component_el_button = ElButton;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _directive_loading = vLoading;
			return withDirectives((openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[3] || (_cache[3] = createBaseVNode("div", null, [createBaseVNode("h2", null, "电销外呼统计"), createBaseVNode("p", null, "贴近现有销售体系风格，按云客同步话单统计电话量、接通率、通话时长和人员排名")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_segmented, {
						modelValue: range.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => range.value = $event),
						options: rangeOptions,
						onChange: loadDashboard
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: loadDashboard
					}, {
						default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						type: "primary",
						loading: syncing.value,
						onClick: syncNow
					}, {
						default: withCtx(() => [..._cache[2] || (_cache[2] = [createTextVNode(" 立即同步 ", -1)])]),
						_: 1
					}, 8, ["loading"])
				])]),
				createBaseVNode("section", _hoisted_4, [(openBlock(true), createElementBlock(Fragment, null, renderList(kpiCards.value, (card) => {
					return openBlock(), createElementBlock("article", {
						key: card.key,
						class: "kpi-card"
					}, [
						createBaseVNode("div", _hoisted_5, toDisplayString(card.label), 1),
						createBaseVNode("div", _hoisted_6, toDisplayString(card.value), 1),
						createBaseVNode("div", { class: normalizeClass(["kpi-sub", card.tone]) }, toDisplayString(card.sub), 3)
					]);
				}), 128))]),
				createBaseVNode("section", _hoisted_7, [
					createBaseVNode("article", _hoisted_8, [createBaseVNode("div", _hoisted_9, [_cache[4] || (_cache[4] = createBaseVNode("div", null, [createBaseVNode("h3", null, "组员电话统计"), createBaseVNode("p", null, "总电话量 / 接通量 / 有效沟通")], -1)), createBaseVNode("span", null, toDisplayString(rangeLabel.value), 1)]), trend.value.length ? (openBlock(), createElementBlock("div", _hoisted_10, [(openBlock(), createElementBlock("svg", _hoisted_11, [
						(openBlock(), createElementBlock(Fragment, null, renderList(gridLines, (y) => {
							return createBaseVNode("line", {
								key: y,
								x1: "46",
								x2: "870",
								y1: y,
								y2: y,
								stroke: "#e7edf6"
							}, null, 8, _hoisted_12);
						}), 64)),
						createBaseVNode("polyline", {
							points: linePoints("callCount"),
							fill: "none",
							stroke: "#1f5fbf",
							"stroke-width": "4",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, null, 8, _hoisted_13),
						createBaseVNode("polyline", {
							points: linePoints("connectedCount"),
							fill: "none",
							stroke: "#0f8b8d",
							"stroke-width": "4",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, null, 8, _hoisted_14),
						createBaseVNode("polyline", {
							points: linePoints("validCount"),
							fill: "none",
							stroke: "#f28c28",
							"stroke-width": "4",
							"stroke-linecap": "round",
							"stroke-linejoin": "round"
						}, null, 8, _hoisted_15),
						(openBlock(true), createElementBlock(Fragment, null, renderList(trend.value, (item, index) => {
							return openBlock(), createElementBlock("text", {
								key: item.label,
								x: chartX(index),
								y: "244",
								"text-anchor": "middle",
								fill: "#667085",
								"font-size": "12",
								"font-weight": "700"
							}, toDisplayString(item.label), 9, _hoisted_16);
						}), 128))
					])), _cache[5] || (_cache[5] = createBaseVNode("div", { class: "legend" }, [
						createBaseVNode("span", null, [createBaseVNode("i", { class: "blue" }), createTextVNode("外呼")]),
						createBaseVNode("span", null, [createBaseVNode("i", { class: "teal" }), createTextVNode("接通")]),
						createBaseVNode("span", null, [createBaseVNode("i", { class: "orange" }), createTextVNode("有效")])
					], -1))])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "当前时间范围暂无通话趋势",
						"image-size": 90
					}))]),
					createBaseVNode("article", _hoisted_17, [_cache[6] || (_cache[6] = createBaseVNode("div", { class: "panel-head" }, [createBaseVNode("div", null, [createBaseVNode("h3", null, "呼叫排名"), createBaseVNode("p", null, "按电话量排序")])], -1)), topAgents.value.length ? (openBlock(), createElementBlock("div", _hoisted_18, [(openBlock(true), createElementBlock(Fragment, null, renderList(topAgents.value, (item) => {
						return openBlock(), createElementBlock("div", {
							key: item.agentName,
							class: "rank-bar-row"
						}, [
							createBaseVNode("span", _hoisted_19, toDisplayString(item.agentName), 1),
							createBaseVNode("div", _hoisted_20, [createBaseVNode("div", {
								class: "rank-fill",
								style: normalizeStyle({ width: barWidth(item.callCount) })
							}, null, 4)]),
							createBaseVNode("b", null, toDisplayString(item.callCount), 1)
						]);
					}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "暂无坐席排名",
						"image-size": 80
					}))]),
					createBaseVNode("article", _hoisted_21, [_cache[7] || (_cache[7] = createBaseVNode("div", { class: "panel-head" }, [createBaseVNode("div", null, [createBaseVNode("h3", null, "人员明细表"), createBaseVNode("p", null, "每个人的电话量、接通量、接通率、通话时长和有效沟通")])], -1)), createVNode(_component_el_table, {
						data: agents.value,
						height: "334",
						class: "agent-table",
						"empty-text": "暂无人员通话数据"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "成员",
								"min-width": "140"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_22, [createBaseVNode("i", null, toDisplayString(firstChar(row.agentName)), 1), createTextVNode(toDisplayString(row.agentName), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "callCount",
								label: "外呼",
								width: "100"
							}),
							createVNode(_component_el_table_column, {
								prop: "connectedCount",
								label: "接通",
								width: "100"
							}),
							createVNode(_component_el_table_column, {
								label: "接通率",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.connectRate || 0) + "%", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "totalDurationText",
								label: "通话时长",
								width: "130"
							}),
							createVNode(_component_el_table_column, {
								prop: "validCount",
								label: "有效沟通",
								width: "110"
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "100"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: statusType(row.rank),
									effect: "light",
									round: ""
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusText(row.rank)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])]),
					createBaseVNode("aside", _hoisted_23, [createBaseVNode("article", _hoisted_24, [_cache[8] || (_cache[8] = createBaseVNode("div", { class: "panel-head compact" }, [createBaseVNode("h3", null, "接通率排行"), createBaseVNode("span", null, "TOP 5")], -1)), connectRateRank.value.length ? (openBlock(), createElementBlock("div", _hoisted_25, [(openBlock(true), createElementBlock(Fragment, null, renderList(connectRateRank.value, (item, index) => {
						return openBlock(), createElementBlock("div", {
							key: item.agentName,
							class: "rate-item"
						}, [
							createBaseVNode("span", { class: normalizeClass(["rank-no", rankClass(index)]) }, toDisplayString(index + 1), 3),
							createBaseVNode("b", null, toDisplayString(item.agentName), 1),
							createBaseVNode("em", null, toDisplayString(item.connectRate || 0) + "%", 1)
						]);
					}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "暂无接通率排行",
						"image-size": 70
					}))]), createBaseVNode("article", _hoisted_26, [
						_cache[9] || (_cache[9] = createBaseVNode("div", { class: "panel-head compact" }, [createBaseVNode("h3", null, "今日待办")], -1)),
						createBaseVNode("div", _hoisted_27, [(openBlock(true), createElementBlock(Fragment, null, renderList(todoRows.value, (item) => {
							return openBlock(), createElementBlock("div", {
								key: item.label,
								class: "todo-item"
							}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("b", null, toDisplayString(item.value), 1)]);
						}), 128))]),
						createBaseVNode("p", _hoisted_28, "最近话单：" + toDisplayString(latestCallTime.value || "暂无"), 1)
					])])
				])
			])), [[_directive_loading, loading.value]]);
		};
	}
}), [["__scopeId", "data-v-fac507f5"]]);
//#endregion
export { tele_statistics_default as default };

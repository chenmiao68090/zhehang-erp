import { r as __toESM } from "./rolldown-runtime-Ce7cXt08.js";
import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, C as ElResult, Ct as arrow_left_default, D as ElPagination, Dr as withModifiers, Er as withKeys, F as ElEmpty, Jt as data_analysis_default, Un as search_default, W as ElDatePicker, _ as ElTableColumn, c as ElSegmented, g as ElTable, ht as ElTooltip, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert, wt as arrow_right_default, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { l as require_dayjs_min } from "./vendor-dayjs-QmXXJDJb.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as get } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as generateSalesManagementInsight, t as Customer360Drawer_default } from "./Customer360Drawer-DN258pWR.js";
import { t as biz_perf_default } from "./biz-perf-Bt1aAu2C.js";
//#region src/api/sales-console.ts
var import_dayjs_min = /* @__PURE__ */ __toESM(require_dayjs_min(), 1);
function getSalesConsoleOverview(params) {
	return get("/crm/sales-console/overview", params);
}
function getSalesStageCustomers(stageCode, params) {
	return get(`/crm/sales-console/stages/${stageCode}/customers`, params);
}
//#endregion
//#region src/components/sales/SalesAiInsightPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$8 = { class: "sales-ai-insight" };
var _hoisted_2$7 = { class: "title" };
var _hoisted_3$7 = {
	key: 1,
	class: "content"
};
var _hoisted_4$7 = { class: "meta" };
var _hoisted_5$6 = { class: "summary" };
var _hoisted_6$5 = { class: "columns" };
var _hoisted_7$5 = { key: 0 };
var _hoisted_8$4 = { class: "risk" };
var _hoisted_9$2 = { key: 0 };
var _hoisted_10$1 = { key: 0 };
var _hoisted_11$1 = { key: 0 };
var _hoisted_12$1 = { class: "quality" };
//#endregion
//#region src/components/sales/SalesAiInsightPanel.vue
var SalesAiInsightPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesAiInsightPanel",
	props: {
		query: {},
		localDemo: { type: Boolean },
		demoInsight: {}
	},
	setup(__props) {
		const props = __props;
		const loading = ref(false);
		const errorMessage = ref("");
		const insight = ref(props.demoInsight || null);
		function generate() {
			return _generate.apply(this, arguments);
		}
		function _generate() {
			_generate = _asyncToGenerator(function* () {
				if (props.localDemo && props.demoInsight) {
					insight.value = props.demoInsight;
					errorMessage.value = "";
					return;
				}
				loading.value = true;
				errorMessage.value = "";
				try {
					var _response$data, _insight$value, _insight$value2;
					const response = yield generateSalesManagementInsight(props.query);
					insight.value = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
					if (!((_insight$value = insight.value) === null || _insight$value === void 0 ? void 0 : _insight$value.available)) errorMessage.value = ((_insight$value2 = insight.value) === null || _insight$value2 === void 0 ? void 0 : _insight$value2.message) || "AI服务暂时不可用";
				} catch (error) {
					errorMessage.value = (error === null || error === void 0 ? void 0 : error.message) || "AI服务暂时不可用，经营台原数据仍可正常查看";
				} finally {
					loading.value = false;
				}
			});
			return _generate.apply(this, arguments);
		}
		function dateTime(value) {
			return value && (0, import_dayjs_min.default)(value).isValid() ? (0, import_dayjs_min.default)(value).format("YYYY-MM-DD HH:mm") : "—";
		}
		return (_ctx, _cache) => {
			var _insight$value3;
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			return openBlock(), createElementBlock("section", _hoisted_1$8, [
				createBaseVNode("header", null, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_2$7, [
					createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(data_analysis_default))]),
						_: 1
					}),
					_cache[2] || (_cache[2] = createBaseVNode("strong", null, "AI 经营复盘", -1)),
					createVNode(_component_el_tag, {
						size: "small",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[0] || (_cache[0] = [createTextVNode("按需生成", -1)])]),
						_: 1
					}),
					__props.localDemo ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						size: "small",
						type: "warning",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("LOCAL-DEMO", -1)])]),
						_: 1
					})) : createCommentVNode("", true)
				]), _cache[3] || (_cache[3] = createBaseVNode("p", null, "沿用当前日期、部门和人员范围；只做辅助分析，不自动创建任务或考核。", -1))]), createVNode(_component_el_button, {
					type: "primary",
					plain: "",
					loading: loading.value,
					onClick: generate
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(insight.value ? "重新分析" : "生成复盘"), 1)]),
					_: 1
				}, 8, ["loading"])]),
				errorMessage.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					type: "warning",
					closable: false,
					"show-icon": "",
					title: errorMessage.value
				}, null, 8, ["title"])) : createCommentVNode("", true),
				((_insight$value3 = insight.value) === null || _insight$value3 === void 0 ? void 0 : _insight$value3.available) ? (openBlock(), createElementBlock("div", _hoisted_3$7, [
					createBaseVNode("div", _hoisted_4$7, [
						createBaseVNode("span", null, toDisplayString(insight.value.scopeLabel), 1),
						createBaseVNode("span", null, toDisplayString(insight.value.dataRange), 1),
						createBaseVNode("span", null, "置信度 " + toDisplayString(insight.value.confidence) + "%", 1)
					]),
					createBaseVNode("p", _hoisted_5$6, toDisplayString(insight.value.summary), 1),
					createBaseVNode("div", _hoisted_6$5, [
						createBaseVNode("article", null, [_cache[4] || (_cache[4] = createBaseVNode("h4", null, "值得关注", -1)), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(insight.value.highlights, (item) => {
							return openBlock(), createElementBlock("li", { key: item }, toDisplayString(item), 1);
						}), 128)), !insight.value.highlights.length ? (openBlock(), createElementBlock("li", _hoisted_7$5, "暂无明确亮点")) : createCommentVNode("", true)])]),
						createBaseVNode("article", _hoisted_8$4, [_cache[5] || (_cache[5] = createBaseVNode("h4", null, "风险与异常", -1)), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(insight.value.risks, (item) => {
							return openBlock(), createElementBlock("li", { key: item }, toDisplayString(item), 1);
						}), 128)), !insight.value.risks.length ? (openBlock(), createElementBlock("li", _hoisted_9$2, "暂无明确风险")) : createCommentVNode("", true)])]),
						createBaseVNode("article", null, [_cache[6] || (_cache[6] = createBaseVNode("h4", null, "主管辅导建议", -1)), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(insight.value.coaching, (item) => {
							return openBlock(), createElementBlock("li", { key: item }, toDisplayString(item), 1);
						}), 128)), !insight.value.coaching.length ? (openBlock(), createElementBlock("li", _hoisted_10$1, "事实不足，暂不建议")) : createCommentVNode("", true)])]),
						createBaseVNode("article", null, [_cache[7] || (_cache[7] = createBaseVNode("h4", null, "团队共性异议", -1)), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(insight.value.commonObjections, (item) => {
							return openBlock(), createElementBlock("li", { key: item }, toDisplayString(item), 1);
						}), 128)), !insight.value.commonObjections.length ? (openBlock(), createElementBlock("li", _hoisted_11$1, "尚无结构化异议证据")) : createCommentVNode("", true)])])
					]),
					createBaseVNode("div", _hoisted_12$1, [_cache[8] || (_cache[8] = createBaseVNode("b", null, "异议与来源口径：", -1)), createTextVNode(toDisplayString(insight.value.sourceQuality || "当前事实源不足，未作推断"), 1)]),
					createBaseVNode("footer", null, "生成于 " + toDisplayString(dateTime(insight.value.generatedAt)) + " · " + toDisplayString(insight.value.promptVersion) + " · 数据不足时不补造结论", 1)
				])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-a85d3845"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/SalesMetricGrid.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$7 = { class: "metric-label" };
//#endregion
//#region src/views/dashboard/components/sales-console/SalesMetricGrid.vue
var SalesMetricGrid_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesMetricGrid",
	props: { items: {} },
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", { class: normalizeClass(["metric-grid", `columns-${Math.min(__props.items.length, 5)}`]) }, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item) => {
				return openBlock(), createElementBlock("div", {
					key: item.label,
					class: normalizeClass(["metric-item", `tone-${item.tone || "neutral"}`])
				}, [
					createBaseVNode("span", _hoisted_1$7, toDisplayString(item.label), 1),
					createBaseVNode("strong", null, toDisplayString(item.value), 1),
					createBaseVNode("small", null, toDisplayString(item.hint), 1)
				], 2);
			}), 128))], 2);
		};
	}
}), [["__scopeId", "data-v-13db2843"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/SalesFunnelStrip.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$6 = {
	class: "funnel-strip",
	role: "list",
	"aria-label": "销售漏斗"
};
var _hoisted_2$6 = ["onClick"];
var _hoisted_3$6 = { class: "stage-order" };
var _hoisted_4$6 = { class: "stage-body" };
var _hoisted_5$5 = { class: "stage-detail" };
var _hoisted_6$4 = { key: 0 };
var _hoisted_7$4 = {
	key: 1,
	class: "is-clear"
};
var _hoisted_8$3 = { key: 2 };
var _hoisted_9$1 = { key: 3 };
//#endregion
//#region src/views/dashboard/components/sales-console/SalesFunnelStrip.vue
var SalesFunnelStrip_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesFunnelStrip",
	props: {
		stages: {},
		historyAvailable: { type: Boolean }
	},
	emits: ["stage-click"],
	setup(__props) {
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			return openBlock(), createElementBlock("div", _hoisted_1$6, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.stages, (stage, index) => {
				return openBlock(), createElementBlock(Fragment, { key: stage.code }, [createBaseVNode("button", {
					class: "funnel-stage",
					type: "button",
					role: "listitem",
					onClick: ($event) => _ctx.$emit("stage-click", stage)
				}, [
					createBaseVNode("span", _hoisted_3$6, toDisplayString(index + 1), 1),
					createBaseVNode("span", _hoisted_4$6, [createBaseVNode("b", null, toDisplayString(stage.label), 1), createBaseVNode("small", null, "当前 " + toDisplayString(stage.currentCount) + " 个", 1)]),
					createBaseVNode("span", _hoisted_5$5, [stage.overdueCount > 0 ? (openBlock(), createElementBlock("em", _hoisted_6$4, "逾期 " + toDisplayString(stage.overdueCount), 1)) : (openBlock(), createElementBlock("em", _hoisted_7$4, "无逾期")), __props.historyAvailable && stage.conversionRate != null ? (openBlock(), createElementBlock("small", _hoisted_8$3, "推进率 " + toDisplayString(stage.conversionRate) + "%", 1)) : (openBlock(), createElementBlock("small", _hoisted_9$1, "历史从上线后统计"))])
				], 8, _hoisted_2$6), index < __props.stages.length - 1 ? (openBlock(), createBlock(_component_el_icon, {
					key: 0,
					class: "stage-arrow"
				}, {
					default: withCtx(() => [createVNode(unref(arrow_right_default))]),
					_: 1
				})) : createCommentVNode("", true)], 64);
			}), 128))]);
		};
	}
}), [["__scopeId", "data-v-f903b74e"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/BossSalesConsole.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$5 = { class: "role-console boss-console" };
var _hoisted_2$5 = { class: "console-section" };
var _hoisted_3$5 = { class: "decision-list" };
var _hoisted_4$5 = { key: 0 };
var _hoisted_5$4 = { key: 1 };
var _hoisted_6$3 = { key: 2 };
var _hoisted_7$3 = { class: "console-section" };
var _hoisted_8$2 = { class: "section-heading" };
var _hoisted_9 = { class: "history-note" };
var _hoisted_10 = { class: "console-section renewal-section" };
var _hoisted_11 = { class: "renewal-grid" };
var _hoisted_12 = { class: "is-danger" };
var _hoisted_13 = { class: "is-danger" };
var _hoisted_14 = { class: "console-section" };
//#endregion
//#region src/views/dashboard/components/sales-console/BossSalesConsole.vue
var BossSalesConsole_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "BossSalesConsole",
	props: { data: {} },
	emits: ["stage-click"],
	setup(__props) {
		const props = __props;
		const metricItems = computed(() => [
			{
				label: "确认到款",
				value: money(props.data.metrics.confirmedAmount),
				hint: `${props.data.metrics.confirmedOrderCount} 单，财务确认口径`,
				tone: "success"
			},
			{
				label: "新业务到款",
				value: money(props.data.metrics.newBusinessAmount),
				hint: `${props.data.metrics.newBusinessCount} 单`,
				tone: "primary"
			},
			{
				label: "续费到款",
				value: money(props.data.metrics.renewalAmount),
				hint: `${props.data.metrics.renewalCount} 单`,
				tone: "success"
			},
			{
				label: "加权预测",
				value: money(props.data.metrics.weightedForecastAmount),
				hint: `数据完整度 ${props.data.metrics.forecastDataCompleteness}%`,
				tone: "warning"
			},
			{
				label: "经营目标",
				value: props.data.metrics.targetConfigured ? money(props.data.metrics.targetAmount || 0) : "未配置",
				hint: "未配置前不计算目标差额",
				tone: "neutral"
			}
		]);
		const historyText = computed(() => props.data.historyAvailable && props.data.dataSince ? `推进记录自 ${(0, import_dayjs_min.default)(props.data.dataSince).format("YYYY-MM-DD")} 起` : "推进率从本功能上线后开始统计");
		function money(value) {
			const amount = Number(value || 0);
			if (Math.abs(amount) >= 1e4) return `¥${(amount / 1e4).toFixed(2)}万`;
			return `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			return openBlock(), createElementBlock("div", _hoisted_1$5, [
				createVNode(SalesMetricGrid_default, { items: metricItems.value }, null, 8, ["items"]),
				createBaseVNode("section", _hoisted_2$5, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "老板三分钟"), createBaseVNode("p", null, "先看需要拍板的事项，再看团队明细")])], -1)), createBaseVNode("div", _hoisted_3$5, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.data.bossActions, (item) => {
					return openBlock(), createElementBlock("div", {
						key: item.type,
						class: normalizeClass(["decision-item", `tone-${item.severity}`])
					}, [
						_cache[1] || (_cache[1] = createBaseVNode("span", { class: "decision-mark" }, null, -1)),
						createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(item.title), 1), createBaseVNode("p", null, toDisplayString(item.reason), 1)]),
						item.amount ? (openBlock(), createElementBlock("strong", _hoisted_4$5, toDisplayString(money(item.amount)), 1)) : item.count ? (openBlock(), createElementBlock("strong", _hoisted_5$4, toDisplayString(item.count) + " 项", 1)) : (openBlock(), createElementBlock("strong", _hoisted_6$3, "正常"))
					], 2);
				}), 128))])]),
				createBaseVNode("section", _hoisted_7$3, [createBaseVNode("div", _hoisted_8$2, [_cache[3] || (_cache[3] = createBaseVNode("div", null, [createBaseVNode("h2", null, "新业务销售漏斗"), createBaseVNode("p", null, "点击任一阶段查看客户明细")], -1)), createBaseVNode("span", _hoisted_9, toDisplayString(historyText.value), 1)]), createVNode(SalesFunnelStrip_default, {
					stages: __props.data.newBusinessFunnel,
					"history-available": __props.data.historyAvailable,
					onStageClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("stage-click", $event))
				}, null, 8, ["stages", "history-available"])]),
				createBaseVNode("section", _hoisted_10, [_cache[9] || (_cache[9] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "续费与存量风险"), createBaseVNode("p", null, "按当前应收台账实时统计")])], -1)), createBaseVNode("div", _hoisted_11, [
					createBaseVNode("div", null, [
						_cache[4] || (_cache[4] = createBaseVNode("span", null, "全部待收", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.renewalSummary.outstandingAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.renewalSummary.outstandingCount) + " 笔", 1)
					]),
					createBaseVNode("div", null, [
						_cache[5] || (_cache[5] = createBaseVNode("span", null, "30天内到期", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.renewalSummary.dueSoonAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.renewalSummary.dueSoonCount) + " 笔", 1)
					]),
					createBaseVNode("div", _hoisted_12, [
						_cache[6] || (_cache[6] = createBaseVNode("span", null, "已经逾期", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.renewalSummary.overdueAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.renewalSummary.overdueCount) + " 笔", 1)
					]),
					createBaseVNode("div", null, [
						_cache[7] || (_cache[7] = createBaseVNode("span", null, "承诺付款", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.renewalSummary.promisedAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.renewalSummary.promisedCount) + " 笔", 1)
					]),
					createBaseVNode("div", _hoisted_13, [
						_cache[8] || (_cache[8] = createBaseVNode("span", null, "坏账风险", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.renewalSummary.badRiskAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.renewalSummary.badRiskCount) + " 笔", 1)
					])
				])]),
				createBaseVNode("section", _hoisted_14, [_cache[10] || (_cache[10] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "团队执行"), createBaseVNode("p", null, "按逾期数量优先排序")])], -1)), createVNode(_component_el_table, {
					data: __props.data.team,
					"empty-text": "所选范围暂无团队数据"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "员工",
							"min-width": "120"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", null, toDisplayString(row.ownerName || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "部门",
							"min-width": "110",
							prop: "deptName",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "持有线索",
							width: "92",
							prop: "activeLeadCount",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "逾期",
							width: "78",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ danger: row.overdueCount > 0 }) }, toDisplayString(row.overdueCount), 3)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "未排下一步",
							width: "108",
							prop: "noNextActionCount",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "确认到款",
							"min-width": "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", null, toDisplayString(money(row.confirmedAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "订单",
							width: "76",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.confirmedOrderCount) + " 单", 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])])
			]);
		};
	}
}), [["__scopeId", "data-v-8678334f"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/SalesActionTable.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = { class: "action-table-wrap" };
var _hoisted_2$4 = { class: "company-name" };
var _hoisted_3$4 = { class: "next-action" };
var _hoisted_4$4 = {
	key: 1,
	class: "action-mobile-list"
};
var _hoisted_5$3 = ["onClick"];
var _hoisted_6$2 = { class: "mobile-item-head" };
var _hoisted_7$2 = { class: "mobile-item-action" };
var _hoisted_8$1 = { class: "mobile-item-foot" };
//#endregion
//#region src/views/dashboard/components/sales-console/SalesActionTable.vue
var SalesActionTable_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesActionTable",
	props: { rows: {} },
	emits: ["lead-click"],
	setup(__props) {
		function actionLabel(type) {
			return type === "OVERDUE" ? "逾期" : type === "NO_ACTION" ? "未安排" : "今天";
		}
		function tagType(type) {
			return type === "OVERDUE" ? "danger" : type === "NO_ACTION" ? "warning" : "primary";
		}
		function timeLabel(value) {
			return value ? (0, import_dayjs_min.default)(value).format("MM-DD HH:mm") : "尚未设置时间";
		}
		function money(value) {
			const amount = Number(value || 0);
			return amount === 0 ? "-" : `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_table_column = ElTableColumn;
			const _component_el_button = ElButton;
			const _component_el_table = ElTable;
			const _component_el_empty = ElEmpty;
			return openBlock(), createElementBlock("div", _hoisted_1$4, [__props.rows.length ? (openBlock(), createBlock(_component_el_table, {
				key: 0,
				data: __props.rows,
				class: "action-table",
				"row-key": "leadId",
				onRowClick: _cache[0] || (_cache[0] = (row) => _ctx.$emit("lead-click", row))
			}, {
				default: withCtx(() => [
					createVNode(_component_el_table_column, {
						label: "优先",
						width: "74"
					}, {
						default: withCtx(({ row }) => [createVNode(_component_el_tag, {
							size: "small",
							type: tagType(row.actionType),
							effect: "light"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(actionLabel(row.actionType)), 1)]),
							_: 2
						}, 1032, ["type"])]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "客户",
						"min-width": "180",
						"show-overflow-tooltip": ""
					}, {
						default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_2$4, toDisplayString(row.companyName || "未命名客户"), 1)]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "阶段",
						"min-width": "112"
					}, {
						default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.stageName), 1)]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "下一步",
						"min-width": "190"
					}, {
						default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_3$4, [createBaseVNode("span", null, toDisplayString(row.nextActionType || "待安排"), 1), createBaseVNode("small", { class: normalizeClass({ overdue: row.actionType === "OVERDUE" }) }, toDisplayString(timeLabel(row.nextActionTime)), 3)])]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "负责人",
						"min-width": "104",
						"show-overflow-tooltip": ""
					}, {
						default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.ownerName || "-"), 1)]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "预计金额",
						width: "112",
						align: "right"
					}, {
						default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.expectedAmount)), 1)]),
						_: 1
					}),
					createVNode(_component_el_table_column, {
						label: "操作",
						width: "74",
						fixed: "right"
					}, {
						default: withCtx(({ row }) => [createVNode(_component_el_button, {
							link: "",
							type: "primary",
							onClick: withModifiers(($event) => _ctx.$emit("lead-click", row), ["stop"])
						}, {
							default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("查看", -1)])]),
							_: 1
						}, 8, ["onClick"])]),
						_: 1
					})
				]),
				_: 1
			}, 8, ["data"])) : createCommentVNode("", true), __props.rows.length ? (openBlock(), createElementBlock("div", _hoisted_4$4, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.rows, (row) => {
				return openBlock(), createElementBlock("button", {
					key: row.leadId,
					type: "button",
					class: "action-mobile-item",
					onClick: ($event) => _ctx.$emit("lead-click", row)
				}, [
					createBaseVNode("div", _hoisted_6$2, [createVNode(_component_el_tag, {
						size: "small",
						type: tagType(row.actionType),
						effect: "light"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(actionLabel(row.actionType)), 1)]),
						_: 2
					}, 1032, ["type"]), createBaseVNode("span", null, toDisplayString(row.stageName), 1)]),
					createBaseVNode("b", null, toDisplayString(row.companyName || "未命名客户"), 1),
					createBaseVNode("div", _hoisted_7$2, [createBaseVNode("span", null, toDisplayString(row.nextActionType || "待安排下一步"), 1), createBaseVNode("small", { class: normalizeClass({ overdue: row.actionType === "OVERDUE" }) }, toDisplayString(timeLabel(row.nextActionTime)), 3)]),
					createBaseVNode("div", _hoisted_8$1, [createBaseVNode("span", null, toDisplayString(row.ownerName || "-"), 1), createBaseVNode("strong", null, toDisplayString(money(row.expectedAmount)), 1)])
				], 8, _hoisted_5$3);
			}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
				key: 2,
				description: "当前没有需要处理的销售动作",
				"image-size": 72
			}))]);
		};
	}
}), [["__scopeId", "data-v-61add6b5"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/ManagerSalesConsole.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "role-console" };
var _hoisted_2$3 = { class: "console-section" };
var _hoisted_3$3 = {
	key: 0,
	class: "exception-line"
};
var _hoisted_4$3 = { key: 0 };
var _hoisted_5$2 = { class: "console-section" };
var _hoisted_6$1 = { class: "console-section" };
var _hoisted_7$1 = { class: "console-section" };
//#endregion
//#region src/views/dashboard/components/sales-console/ManagerSalesConsole.vue
var ManagerSalesConsole_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ManagerSalesConsole",
	props: { data: {} },
	emits: ["stage-click", "lead-click"],
	setup(__props) {
		const props = __props;
		const metricItems = computed(() => [
			{
				label: "部门确认到款",
				value: money(props.data.metrics.confirmedAmount),
				hint: `${props.data.metrics.confirmedOrderCount} 单`,
				tone: "success"
			},
			{
				label: "今天待跟进",
				value: props.data.taskSummary.todayActionCount,
				hint: "已安排在今天",
				tone: "primary"
			},
			{
				label: "跟进逾期",
				value: props.data.taskSummary.overdueCount,
				hint: "需要当天处理",
				tone: "danger"
			},
			{
				label: "未排下一步",
				value: props.data.taskSummary.noNextActionCount,
				hint: "容易造成漏跟进",
				tone: "warning"
			},
			{
				label: "续费逾期",
				value: money(props.data.renewalSummary.overdueAmount),
				hint: `${props.data.renewalSummary.overdueCount} 笔`,
				tone: "danger"
			}
		]);
		function money(value) {
			const amount = Number(value || 0);
			return Math.abs(amount) >= 1e4 ? `¥${(amount / 1e4).toFixed(2)}万` : `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			return openBlock(), createElementBlock("div", _hoisted_1$3, [
				createVNode(SalesMetricGrid_default, { items: metricItems.value }, null, 8, ["items"]),
				createBaseVNode("section", _hoisted_2$3, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "异常先行"), createBaseVNode("p", null, "先清掉会影响成交和回款的事项")])], -1)), __props.data.exceptions.length ? (openBlock(), createElementBlock("div", _hoisted_3$3, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.data.exceptions, (item) => {
					return openBlock(), createElementBlock("div", {
						key: item.type,
						class: normalizeClass(`tone-${item.severity}`)
					}, [
						createBaseVNode("span", null, toDisplayString(item.label), 1),
						createBaseVNode("b", null, toDisplayString(item.count), 1),
						item.amount ? (openBlock(), createElementBlock("small", _hoisted_4$3, toDisplayString(money(item.amount)), 1)) : createCommentVNode("", true)
					], 2);
				}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: "当前没有销售或续费异常",
					"image-size": 64
				}))]),
				createBaseVNode("section", _hoisted_5$2, [_cache[3] || (_cache[3] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "今天要盯的人和事"), createBaseVNode("p", null, "按逾期、未安排、今天到期依次排序")])], -1)), createVNode(SalesActionTable_default, {
					rows: __props.data.actions,
					onLeadClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("lead-click", $event))
				}, null, 8, ["rows"])]),
				createBaseVNode("section", _hoisted_6$1, [_cache[4] || (_cache[4] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "部门销售漏斗"), createBaseVNode("p", null, "点击阶段下钻到客户")])], -1)), createVNode(SalesFunnelStrip_default, {
					stages: __props.data.newBusinessFunnel,
					"history-available": __props.data.historyAvailable,
					onStageClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("stage-click", $event))
				}, null, 8, ["stages", "history-available"])]),
				createBaseVNode("section", _hoisted_7$1, [_cache[5] || (_cache[5] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "团队执行对比"), createBaseVNode("p", null, "数据由系统按当前部门权限自动收敛")])], -1)), createVNode(_component_el_table, {
					data: __props.data.team,
					"empty-text": "所选范围暂无员工数据"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "员工",
							"min-width": "120"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", null, toDisplayString(row.ownerName || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "持有线索",
							width: "92",
							prop: "activeLeadCount",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "逾期",
							width: "78",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ danger: row.overdueCount > 0 }) }, toDisplayString(row.overdueCount), 3)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "未排下一步",
							width: "108",
							prop: "noNextActionCount",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "确认到款",
							"min-width": "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", null, toDisplayString(money(row.confirmedAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "订单",
							width: "76",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.confirmedOrderCount) + " 单", 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])])
			]);
		};
	}
}), [["__scopeId", "data-v-2c9d38ea"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/EmployeeSalesConsole.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "role-console" };
var _hoisted_2$2 = { class: "console-section" };
var _hoisted_3$2 = { class: "console-section" };
var _hoisted_4$2 = { class: "console-section result-band" };
//#endregion
//#region src/views/dashboard/components/sales-console/EmployeeSalesConsole.vue
var EmployeeSalesConsole_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "EmployeeSalesConsole",
	props: { data: {} },
	emits: ["stage-click", "lead-click"],
	setup(__props) {
		const props = __props;
		const metricItems = computed(() => [
			{
				label: "今天待跟进",
				value: props.data.taskSummary.todayActionCount,
				hint: "今天必须完成",
				tone: "primary"
			},
			{
				label: "已经逾期",
				value: props.data.taskSummary.overdueCount,
				hint: "优先处理",
				tone: "danger"
			},
			{
				label: "未排下一步",
				value: props.data.taskSummary.noNextActionCount,
				hint: "完成后立即补齐",
				tone: "warning"
			},
			{
				label: "高意向客户",
				value: props.data.taskSummary.highIntentCount,
				hint: "重点推进成交",
				tone: "success"
			},
			{
				label: "持有客户",
				value: props.data.taskSummary.activeLeadCount,
				hint: "当前跟进中",
				tone: "neutral"
			}
		]);
		function money(value) {
			const amount = Number(value || 0);
			return Math.abs(amount) >= 1e4 ? `¥${(amount / 1e4).toFixed(2)}万` : `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [
				createVNode(SalesMetricGrid_default, { items: metricItems.value }, null, 8, ["items"]),
				createBaseVNode("section", _hoisted_2$2, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "今日作战清单"), createBaseVNode("p", null, "先处理逾期，再补齐未安排，最后完成今天动作")])], -1)), createVNode(SalesActionTable_default, {
					rows: __props.data.actions,
					onLeadClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("lead-click", $event))
				}, null, 8, ["rows"])]),
				createBaseVNode("section", _hoisted_3$2, [_cache[3] || (_cache[3] = createBaseVNode("div", { class: "section-heading" }, [createBaseVNode("div", null, [createBaseVNode("h2", null, "我的客户推进"), createBaseVNode("p", null, "点击阶段查看自己名下的客户")])], -1)), createVNode(SalesFunnelStrip_default, {
					stages: __props.data.newBusinessFunnel,
					"history-available": __props.data.historyAvailable,
					onStageClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("stage-click", $event))
				}, null, 8, ["stages", "history-available"])]),
				createBaseVNode("section", _hoisted_4$2, [
					createBaseVNode("div", null, [
						_cache[4] || (_cache[4] = createBaseVNode("span", null, "本期确认到款", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.metrics.confirmedAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.metrics.confirmedOrderCount) + " 单", 1)
					]),
					createBaseVNode("div", null, [
						_cache[5] || (_cache[5] = createBaseVNode("span", null, "新业务到款", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.metrics.newBusinessAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.metrics.newBusinessCount) + " 单", 1)
					]),
					createBaseVNode("div", null, [
						_cache[6] || (_cache[6] = createBaseVNode("span", null, "续费到款", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.metrics.renewalAmount)), 1),
						createBaseVNode("small", null, toDisplayString(__props.data.metrics.renewalCount) + " 单", 1)
					]),
					createBaseVNode("div", null, [
						_cache[7] || (_cache[7] = createBaseVNode("span", null, "加权预测", -1)),
						createBaseVNode("b", null, toDisplayString(money(__props.data.metrics.weightedForecastAmount)), 1),
						createBaseVNode("small", null, "完整度 " + toDisplayString(__props.data.metrics.forecastDataCompleteness) + "%", 1)
					])
				])
			]);
		};
	}
}), [["__scopeId", "data-v-209e6694"]]);
//#endregion
//#region src/views/dashboard/components/sales-console/SalesStageDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "drawer-heading" };
var _hoisted_2$1 = { class: "drawer-toolbar" };
var _hoisted_3$1 = { class: "company-name" };
var _hoisted_4$1 = { class: "next-time" };
var _hoisted_5$1 = { class: "drawer-pagination" };
//#endregion
//#region src/views/dashboard/components/sales-console/SalesStageDrawer.vue
var SalesStageDrawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesStageDrawer",
	props: {
		modelValue: { type: Boolean },
		stage: {},
		query: {}
	},
	emits: ["update:modelValue", "lead-click"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		const loading = ref(false);
		const keyword = ref("");
		const pageNum = ref(1);
		const total = ref(0);
		const rows = ref([]);
		watch(() => {
			var _props$stage;
			return [
				props.modelValue,
				(_props$stage = props.stage) === null || _props$stage === void 0 ? void 0 : _props$stage.code,
				props.query.startDate,
				props.query.endDate,
				props.query.ownerId,
				props.query.deptId
			];
		}, ([open]) => {
			if (open) {
				pageNum.value = 1;
				load();
			}
		});
		function search() {
			pageNum.value = 1;
			load();
		}
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				var _props$stage2;
				if (!((_props$stage2 = props.stage) === null || _props$stage2 === void 0 ? void 0 : _props$stage2.code) || !props.modelValue) return;
				loading.value = true;
				try {
					var _ref, _response$data;
					const response = yield getSalesStageCustomers(props.stage.code, _objectSpread2(_objectSpread2({}, props.query), {}, {
						keyword: keyword.value.trim() || void 0,
						pageNum: pageNum.value,
						pageSize: 20
					}));
					const data = (_ref = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response) !== null && _ref !== void 0 ? _ref : {};
					rows.value = data.records || data.list || [];
					total.value = Number(data.total || 0);
				} catch (error) {
					rows.value = [];
					total.value = 0;
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "阶段客户加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		function openLead(row) {
			emit("lead-click", row);
		}
		function dateTime(value) {
			return value ? (0, import_dayjs_min.default)(value).format("MM-DD HH:mm") : "尚未设置";
		}
		function money(value) {
			const amount = Number(value || 0);
			return amount === 0 ? "-" : `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => visible.value = $event),
				size: "min(1040px, 96vw)",
				"append-to-body": "",
				"destroy-on-close": ""
			}, {
				header: withCtx(() => {
					var _props$stage3;
					return [createBaseVNode("div", _hoisted_1$1, [createBaseVNode("div", null, [createBaseVNode("h2", null, toDisplayString(((_props$stage3 = __props.stage) === null || _props$stage3 === void 0 ? void 0 : _props$stage3.label) || "阶段客户"), 1), _cache[3] || (_cache[3] = createBaseVNode("p", null, "点击客户可进入客户360查看完整跟进和交易记录", -1))]), __props.stage ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						effect: "plain"
					}, {
						default: withCtx(() => [createTextVNode("当前 " + toDisplayString(__props.stage.currentCount) + " 个", 1)]),
						_: 1
					})) : createCommentVNode("", true)])];
				}),
				default: withCtx(() => [
					createBaseVNode("div", _hoisted_2$1, [createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						clearable: "",
						placeholder: "搜索公司或负责人",
						"prefix-icon": unref(search_default),
						onKeyup: withKeys(search, ["enter"]),
						onClear: search
					}, null, 8, ["modelValue", "prefix-icon"]), createVNode(_component_el_button, {
						icon: unref(refresh_default),
						loading: loading.value,
						onClick: load
					}, {
						default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon", "loading"])]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "leadId",
						onRowClick: openLead
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "公司",
								"min-width": "210",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_3$1, toDisplayString(row.companyName || "未命名客户"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "负责人",
								width: "108",
								"show-overflow-tooltip": "",
								prop: "ownerName"
							}),
							createVNode(_component_el_table_column, {
								label: "部门",
								width: "116",
								"show-overflow-tooltip": "",
								prop: "deptName"
							}),
							createVNode(_component_el_table_column, {
								label: "停留",
								width: "82"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.stageAgeDays || 0) + " 天", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "下一步",
								"min-width": "170"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ overdue: row.overdue }) }, toDisplayString(row.nextActionType || "待安排"), 3), createBaseVNode("small", _hoisted_4$1, toDisplayString(dateTime(row.nextActionTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "预计金额",
								width: "110",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.expectedAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "72",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: withModifiers(($event) => openLead(row), ["stop"])
								}, {
									default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("查看", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_5$1, [createBaseVNode("span", null, "共 " + toDisplayString(total.value) + " 个", 1), createVNode(_component_el_pagination, {
						"current-page": pageNum.value,
						"onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => pageNum.value = $event),
						"page-size": 20,
						layout: "prev, pager, next",
						total: total.value,
						onCurrentChange: load
					}, null, 8, ["current-page", "total"])])
				]),
				_: 1
			}, 8, ["modelValue"]);
		};
	}
}), [["__scopeId", "data-v-3a16ed2d"]]);
//#endregion
//#region src/views/dashboard/sales-operating-console.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "sales-operating-console" };
var _hoisted_2 = { class: "console-header" };
var _hoisted_3 = { class: "title-group" };
var _hoisted_4 = { class: "title-line" };
var _hoisted_5 = {
	key: 0,
	class: "console-toolbar"
};
var _hoisted_6 = { class: "filter-group" };
var _hoisted_7 = {
	key: 2,
	class: "overview-body"
};
var _hoisted_8 = {
	key: 3,
	class: "legacy-shell"
};
//#endregion
//#region src/views/dashboard/sales-operating-console.vue
var sales_operating_console_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "sales-operating-console",
	setup(__props) {
		const viewOptions = [{
			label: "经营概览",
			value: "overview"
		}, {
			label: "业绩与录音",
			value: "performance"
		}];
		const router = useRouter();
		const activeView = ref("overview");
		const loading = ref(false);
		const errorMessage = ref("");
		const overview = ref(null);
		const dateRange = ref([(0, import_dayjs_min.default)().startOf("month").format("YYYY-MM-DD"), (0, import_dayjs_min.default)().format("YYYY-MM-DD")]);
		const selectedDeptId = ref();
		const selectedOwnerId = ref();
		const stageDrawerOpen = ref(false);
		const selectedStage = ref(null);
		const customerDrawerOpen = ref(false);
		const selectedLeadId = ref(null);
		const canFilterTeam = computed(() => {
			var _overview$value, _overview$value2;
			return ((_overview$value = overview.value) === null || _overview$value === void 0 ? void 0 : _overview$value.viewMode) === "boss" || ((_overview$value2 = overview.value) === null || _overview$value2 === void 0 ? void 0 : _overview$value2.viewMode) === "manager";
		});
		const departmentOptions = computed(() => {
			var _overview$value3;
			return ((_overview$value3 = overview.value) === null || _overview$value3 === void 0 || (_overview$value3 = _overview$value3.filters) === null || _overview$value3 === void 0 ? void 0 : _overview$value3.departments) || [];
		});
		const ownerOptions = computed(() => {
			var _overview$value4;
			return ((_overview$value4 = overview.value) === null || _overview$value4 === void 0 || (_overview$value4 = _overview$value4.filters) === null || _overview$value4 === void 0 ? void 0 : _overview$value4.owners) || [];
		});
		const filteredOwnerOptions = computed(() => selectedDeptId.value ? ownerOptions.value.filter((owner) => owner.deptId === selectedDeptId.value) : ownerOptions.value);
		const currentQuery = computed(() => {
			var _dateRange$value, _dateRange$value2;
			return {
				startDate: (_dateRange$value = dateRange.value) === null || _dateRange$value === void 0 ? void 0 : _dateRange$value[0],
				endDate: (_dateRange$value2 = dateRange.value) === null || _dateRange$value2 === void 0 ? void 0 : _dateRange$value2[1],
				deptId: selectedDeptId.value,
				ownerId: selectedOwnerId.value
			};
		});
		const viewSubtitle = computed(() => {
			if (!overview.value) return "把销售执行、成交到款和续费风险放在一页看清";
			if (overview.value.viewMode === "boss") return "三分钟看结果、风险和需要拍板的事项";
			if (overview.value.viewMode === "manager") return "先看异常，再盯团队执行和客户推进";
			return "今天该做什么、先做什么、做到什么结果";
		});
		onMounted(loadOverview);
		function loadOverview() {
			return _loadOverview.apply(this, arguments);
		}
		function _loadOverview() {
			_loadOverview = _asyncToGenerator(function* () {
				loading.value = true;
				errorMessage.value = "";
				try {
					var _response$data;
					const response = yield getSalesConsoleOverview(currentQuery.value);
					overview.value = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
				} catch (error) {
					errorMessage.value = (error === null || error === void 0 ? void 0 : error.message) || "请稍后重试";
					if (!overview.value) ElMessage.error(errorMessage.value);
				} finally {
					loading.value = false;
				}
			});
			return _loadOverview.apply(this, arguments);
		}
		function reloadFromFirstPage() {
			loadOverview();
		}
		function onDepartmentChange() {
			if (selectedOwnerId.value && !filteredOwnerOptions.value.some((item) => item.id === selectedOwnerId.value)) selectedOwnerId.value = void 0;
			loadOverview();
		}
		function openStage(stage) {
			selectedStage.value = stage;
			stageDrawerOpen.value = true;
		}
		function openLead(row) {
			selectedLeadId.value = Number(row.leadId);
			customerDrawerOpen.value = true;
		}
		function disableFutureDate(date) {
			return (0, import_dayjs_min.default)(date).isAfter((0, import_dayjs_min.default)(), "day");
		}
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_tooltip = ElTooltip;
			const _component_el_tag = ElTag;
			const _component_el_segmented = ElSegmented;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_result = ElResult;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [
					createVNode(_component_el_tooltip, {
						content: "返回今日工作",
						placement: "bottom"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							class: "mobile-back",
							icon: unref(arrow_left_default),
							circle: "",
							"aria-label": "返回今日工作",
							onClick: _cache[0] || (_cache[0] = ($event) => unref(router).push("/customer/workbench"))
						}, null, 8, ["icon"])]),
						_: 1
					}),
					_cache[7] || (_cache[7] = createBaseVNode("h1", null, "销售经营台", -1)),
					overview.value ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						effect: "plain",
						type: "info"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(overview.value.scope.label), 1)]),
						_: 1
					})) : createCommentVNode("", true)
				]), createBaseVNode("p", null, toDisplayString(viewSubtitle.value), 1)]), createVNode(_component_el_segmented, {
					modelValue: activeView.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => activeView.value = $event),
					options: viewOptions,
					class: "view-switch"
				}, null, 8, ["modelValue"])]),
				activeView.value === "overview" ? (openBlock(), createElementBlock("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, [
					createVNode(_component_el_date_picker, {
						modelValue: dateRange.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => dateRange.value = $event),
						class: "date-range",
						type: "daterange",
						"value-format": "YYYY-MM-DD",
						format: "YYYY-MM-DD",
						"range-separator": "至",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						clearable: false,
						editable: false,
						"disabled-date": disableFutureDate,
						"unlink-panels": "",
						onChange: reloadFromFirstPage
					}, null, 8, ["modelValue"]),
					canFilterTeam.value && departmentOptions.value.length > 1 ? (openBlock(), createBlock(_component_el_select, {
						key: 0,
						modelValue: selectedDeptId.value,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => selectedDeptId.value = $event),
						clearable: "",
						filterable: "",
						placeholder: "全部部门",
						class: "scope-select",
						onChange: onDepartmentChange
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(departmentOptions.value, (dept) => {
							return openBlock(), createBlock(_component_el_option, {
								key: dept.id,
								label: dept.name,
								value: dept.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true),
					canFilterTeam.value && ownerOptions.value.length > 1 ? (openBlock(), createBlock(_component_el_select, {
						key: 1,
						modelValue: selectedOwnerId.value,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => selectedOwnerId.value = $event),
						clearable: "",
						filterable: "",
						placeholder: "全部员工",
						class: "scope-select",
						onChange: loadOverview
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredOwnerOptions.value, (owner) => {
							return openBlock(), createBlock(_component_el_option, {
								key: owner.id,
								label: owner.deptName ? `${owner.name} · ${owner.deptName}` : owner.name,
								value: owner.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true)
				]), createVNode(_component_el_tooltip, {
					content: "刷新经营数据",
					placement: "top"
				}, {
					default: withCtx(() => [createVNode(_component_el_button, {
						icon: unref(refresh_default),
						circle: "",
						loading: loading.value,
						"aria-label": "刷新经营数据",
						onClick: loadOverview
					}, null, 8, ["icon", "loading"])]),
					_: 1
				})])) : createCommentVNode("", true),
				activeView.value === "overview" && overview.value && ["boss", "manager"].includes(overview.value.viewMode) ? (openBlock(), createBlock(SalesAiInsightPanel_default, {
					key: 1,
					query: currentQuery.value
				}, null, 8, ["query"])) : createCommentVNode("", true),
				activeView.value === "overview" ? withDirectives((openBlock(), createElementBlock("main", _hoisted_7, [errorMessage.value && !loading.value ? (openBlock(), createBlock(_component_el_result, {
					key: 0,
					icon: "warning",
					title: "销售经营台加载失败",
					"sub-title": errorMessage.value
				}, {
					extra: withCtx(() => [createVNode(_component_el_button, {
						type: "primary",
						icon: unref(refresh_default),
						onClick: loadOverview
					}, {
						default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("重新加载", -1)])]),
						_: 1
					}, 8, ["icon"])]),
					_: 1
				}, 8, ["sub-title"])) : overview.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [overview.value.viewMode === "boss" ? (openBlock(), createBlock(BossSalesConsole_default, {
					key: 0,
					data: overview.value,
					onStageClick: openStage
				}, null, 8, ["data"])) : overview.value.viewMode === "manager" ? (openBlock(), createBlock(ManagerSalesConsole_default, {
					key: 1,
					data: overview.value,
					onStageClick: openStage,
					onLeadClick: openLead
				}, null, 8, ["data"])) : (openBlock(), createBlock(EmployeeSalesConsole_default, {
					key: 2,
					data: overview.value,
					onStageClick: openStage,
					onLeadClick: openLead
				}, null, 8, ["data"]))], 64)) : createCommentVNode("", true)])), [[_directive_loading, loading.value]]) : (openBlock(), createElementBlock("section", _hoisted_8, [createVNode(biz_perf_default)])),
				createVNode(SalesStageDrawer_default, {
					modelValue: stageDrawerOpen.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => stageDrawerOpen.value = $event),
					stage: selectedStage.value,
					query: currentQuery.value,
					onLeadClick: openLead
				}, null, 8, [
					"modelValue",
					"stage",
					"query"
				]),
				createVNode(Customer360Drawer_default, {
					modelValue: customerDrawerOpen.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => customerDrawerOpen.value = $event),
					"lead-id": selectedLeadId.value,
					onChanged: loadOverview
				}, null, 8, ["modelValue", "lead-id"])
			]);
		};
	}
}), [["__scopeId", "data-v-545df179"]]);
//#endregion
export { sales_operating_console_default as default };

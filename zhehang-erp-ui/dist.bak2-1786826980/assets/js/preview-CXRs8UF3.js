import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, st as defineComponent, yt as onBeforeUnmount } from "./vendor-Cuzsyfny.js";
import { $t as download_default, B as ElDivider, C as ElResult, Ct as arrow_left_default, F as ElEmpty, V as ElDialog, _ as ElTableColumn, _t as ElFormItem, en as edit_default, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as init } from "./vendor-echarts-INkQTIfO.js";
import { n as reportDefinitionApi, r as reportScheduleApi, t as reportDataApi } from "./report-Vj0uVoII.js";
//#region src/views/report/preview.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container report-preview-page" };
var _hoisted_2 = { class: "preview-toolbar" };
var _hoisted_3 = { class: "toolbar-left" };
var _hoisted_4 = { class: "report-title" };
var _hoisted_5 = { class: "toolbar-right" };
var _hoisted_6 = { class: "preview-body" };
var _hoisted_7 = {
	key: 0,
	class: "empty-state"
};
var _hoisted_8 = {
	key: 1,
	class: "empty-state"
};
var _hoisted_9 = {
	key: 2,
	class: "empty-state"
};
var _hoisted_10 = {
	key: 3,
	class: "preview-grid"
};
var _hoisted_11 = { class: "card-title" };
var _hoisted_12 = {
	key: 0,
	class: "kpi-display"
};
var _hoisted_13 = { class: "kpi-value" };
var _hoisted_14 = { class: "kpi-label" };
//#endregion
//#region src/views/report/preview.vue
var preview_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "preview",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const route = useRoute();
		const loading = ref(false);
		const reportData = ref(null);
		const chartItems = ref([]);
		const queryResult = ref([]);
		const executeError = ref("");
		const showSubscribe = ref(false);
		const chartRefs = ref([]);
		const chartInstances = ref([]);
		const scheduleForm = reactive({
			cronExpression: "0 0 8 * * ?",
			recipients: "",
			channel: "email"
		});
		const tableColumns = computed(() => {
			if (queryResult.value.length === 0) return [];
			return Object.keys(queryResult.value[0]);
		});
		const componentTypes = [
			{
				type: "kpi",
				label: t("report.chartKpi")
			},
			{
				type: "table",
				label: t("report.chartTable")
			},
			{
				type: "line",
				label: t("report.chartLine")
			},
			{
				type: "bar",
				label: t("report.chartBar")
			},
			{
				type: "pie",
				label: t("report.chartPie")
			},
			{
				type: "funnel",
				label: t("report.chartFunnel")
			},
			{
				type: "radar",
				label: t("report.chartRadar")
			}
		];
		function getChartLabel(type) {
			const found = componentTypes.find((c) => c.type === type);
			return found ? found.label : type;
		}
		function getKpiValue(index) {
			if (queryResult.value.length > 0 && queryResult.value[index]) {
				var _ref, _queryResult$value$in;
				return (_ref = (_queryResult$value$in = queryResult.value[index].value) !== null && _queryResult$value$in !== void 0 ? _queryResult$value$in : queryResult.value[index].count) !== null && _ref !== void 0 ? _ref : "-";
			}
			return "-";
		}
		function setChartRef(el, index) {
			chartRefs.value[index] = el;
		}
		function goBack() {
			router.push("/report/list");
		}
		function goEdit() {
			var _reportData$value;
			if ((_reportData$value = reportData.value) === null || _reportData$value === void 0 ? void 0 : _reportData$value.id) router.push({
				path: "/report/designer",
				query: { id: String(reportData.value.id) }
			});
		}
		function loadReport() {
			return _loadReport.apply(this, arguments);
		}
		function _loadReport() {
			_loadReport = _asyncToGenerator(function* () {
				const id = route.query.id;
				if (!id) return;
				loading.value = true;
				try {
					var _res$data;
					const res = yield reportDefinitionApi.detail(Number(id));
					reportData.value = res.data;
					if ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.chartConfig) try {
						chartItems.value = JSON.parse(res.data.chartConfig);
					} catch (_unused) {}
					yield executeReport();
				} finally {
					loading.value = false;
				}
			});
			return _loadReport.apply(this, arguments);
		}
		function executeReport() {
			return _executeReport.apply(this, arguments);
		}
		function _executeReport() {
			_executeReport = _asyncToGenerator(function* () {
				const id = route.query.id;
				if (!id) return;
				executeError.value = "";
				try {
					const res = yield reportDataApi.execute(Number(id));
					queryResult.value = Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data : Array.isArray(res) ? res : [];
				} catch (error) {
					queryResult.value = [];
					executeError.value = (error === null || error === void 0 ? void 0 : error.message) || "查询失败，请检查报表的数据集、表名和字段配置。";
				}
				nextTick(() => {
					chartItems.value.forEach((item, idx) => {
						if (item.chartType !== "kpi" && item.chartType !== "table") renderChart(idx, item);
					});
				});
			});
			return _executeReport.apply(this, arguments);
		}
		function renderChart(index, item) {
			const el = chartRefs.value[index];
			if (!el) return;
			let instance = chartInstances.value[index];
			if (!instance) {
				instance = init(el);
				chartInstances.value[index] = instance;
			}
			const data = queryResult.value;
			if (!data.length) {
				instance.clear();
				return;
			}
			const color = item.color || "#3370ff";
			const xData = data.map((d) => d[item.xField] || d.name || d.metric || "");
			const yData = data.map((d) => Number(d[item.yField] || d.value || d.count || 0));
			let option = {};
			switch (item.chartType) {
				case "line":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 14 }
						},
						tooltip: { trigger: "axis" },
						grid: {
							top: 50,
							bottom: 30,
							left: 50,
							right: 20
						},
						xAxis: {
							type: "category",
							data: xData
						},
						yAxis: { type: "value" },
						series: [{
							type: "line",
							data: yData,
							smooth: true,
							itemStyle: { color },
							areaStyle: { color: color + "22" }
						}]
					};
					break;
				case "bar":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 14 }
						},
						tooltip: { trigger: "axis" },
						grid: {
							top: 50,
							bottom: 30,
							left: 50,
							right: 20
						},
						xAxis: {
							type: "category",
							data: xData
						},
						yAxis: { type: "value" },
						series: [{
							type: "bar",
							data: yData,
							itemStyle: {
								color,
								borderRadius: [
									4,
									4,
									0,
									0
								]
							}
						}]
					};
					break;
				case "pie":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 14 }
						},
						tooltip: { trigger: "item" },
						legend: {
							orient: "horizontal",
							bottom: 0
						},
						series: [{
							type: "pie",
							radius: ["35%", "65%"],
							data: data.map((d, i) => ({
								name: d.name || d.metric,
								value: Number(d.value || d.count || 0),
								itemStyle: { color: [
									"#3370ff",
									"#3B82F6",
									"#10B981",
									"#F59E0B",
									"#8B5CF6",
									"#EC4899"
								][i % 6] }
							}))
						}]
					};
					break;
				case "funnel":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 14 }
						},
						tooltip: { trigger: "item" },
						series: [{
							type: "funnel",
							left: "10%",
							width: "80%",
							data: data.map((d) => ({
								name: d.name || d.metric,
								value: Number(d.value || d.count || 0)
							}))
						}]
					};
					break;
				case "radar":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 14 }
						},
						radar: { indicator: data.map((d) => ({
							name: d.name || d.metric,
							max: Math.max(...yData) * 1.2 || 100
						})) },
						series: [{
							type: "radar",
							data: [{
								value: yData,
								itemStyle: { color }
							}]
						}]
					};
					break;
			}
			instance.setOption(option, true);
		}
		function handleExportExcel() {
			var _reportData$value2;
			if (queryResult.value.length === 0) {
				ElMessage.warning(t("common.noData"));
				return;
			}
			const cols = tableColumns.value;
			let csv = cols.join(",") + "\n";
			queryResult.value.forEach((row) => {
				csv += cols.map((c) => {
					var _row$c;
					return (_row$c = row[c]) !== null && _row$c !== void 0 ? _row$c : "";
				}).join(",") + "\n";
			});
			const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = (((_reportData$value2 = reportData.value) === null || _reportData$value2 === void 0 ? void 0 : _reportData$value2.name) || "report") + ".csv";
			a.click();
			URL.revokeObjectURL(url);
			ElMessage.success(t("common.success"));
		}
		function submitSubscribe() {
			return _submitSubscribe.apply(this, arguments);
		}
		function _submitSubscribe() {
			_submitSubscribe = _asyncToGenerator(function* () {
				var _reportData$value3;
				if (!((_reportData$value3 = reportData.value) === null || _reportData$value3 === void 0 ? void 0 : _reportData$value3.id)) return;
				yield reportScheduleApi.create({
					reportId: reportData.value.id,
					cronExpression: scheduleForm.cronExpression,
					recipients: scheduleForm.recipients,
					channel: scheduleForm.channel,
					status: 1
				});
				ElMessage.success(t("common.success"));
				showSubscribe.value = false;
			});
			return _submitSubscribe.apply(this, arguments);
		}
		onMounted(() => {
			loadReport();
		});
		onBeforeUnmount(() => {
			chartInstances.value.forEach((inst) => inst === null || inst === void 0 ? void 0 : inst.dispose());
		});
		return (_ctx, _cache) => {
			var _reportData$value4;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_divider = ElDivider;
			const _component_el_tag = ElTag;
			const _component_el_result = ElResult;
			const _component_el_empty = ElEmpty;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_button, { onClick: goBack }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(arrow_left_default))]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.back")), 1)]),
						_: 1
					}),
					createVNode(_component_el_divider, { direction: "vertical" }),
					createBaseVNode("h3", _hoisted_4, toDisplayString(((_reportData$value4 = reportData.value) === null || _reportData$value4 === void 0 ? void 0 : _reportData$value4.name) || _ctx.$t("report.preview")), 1),
					reportData.value ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						size: "small",
						type: reportData.value.status === 1 ? "success" : "warning"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(reportData.value.status === 1 ? _ctx.$t("report.statusPublished") : _ctx.$t("report.statusDraft")), 1)]),
						_: 1
					}, 8, ["type"])) : createCommentVNode("", true)
				]), createBaseVNode("div", _hoisted_5, [
					createVNode(_component_el_button, { onClick: handleExportExcel }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(download_default))]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("report.exportExcel")), 1)]),
						_: 1
					}),
					createCommentVNode("", true),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: goEdit
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(edit_default))]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
						_: 1
					})
				])]),
				withDirectives((openBlock(), createElementBlock("div", _hoisted_6, [executeError.value && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_7, [createVNode(_component_el_result, {
					icon: "error",
					title: "报表数据源不可用",
					"sub-title": executeError.value
				}, {
					extra: withCtx(() => [createVNode(_component_el_button, {
						type: "primary",
						onClick: executeReport
					}, {
						default: withCtx(() => [..._cache[6] || (_cache[6] = [createTextVNode("重新查询", -1)])]),
						_: 1
					})]),
					_: 1
				}, 8, ["sub-title"])])) : chartItems.value.length === 0 && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_8, [createVNode(_component_el_empty, { description: "报表尚未配置图表" })])) : queryResult.value.length === 0 && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_9, [createVNode(_component_el_empty, { description: "查询成功，当前条件下暂无真实数据" })])) : (openBlock(), createElementBlock("div", _hoisted_10, [(openBlock(true), createElementBlock(Fragment, null, renderList(chartItems.value, (item, index) => {
					return openBlock(), createElementBlock("div", {
						key: index,
						class: "preview-card"
					}, [createBaseVNode("div", _hoisted_11, toDisplayString(item.title || getChartLabel(item.chartType)), 1), item.chartType === "kpi" ? (openBlock(), createElementBlock("div", _hoisted_12, [createBaseVNode("div", _hoisted_13, toDisplayString(getKpiValue(index)), 1), createBaseVNode("div", _hoisted_14, toDisplayString(item.title), 1)])) : item.chartType === "table" ? (openBlock(), createBlock(_component_el_table, {
						key: 1,
						data: queryResult.value,
						size: "small",
						"max-height": "320",
						stripe: "",
						border: ""
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(tableColumns.value, (col) => {
							return openBlock(), createBlock(_component_el_table_column, {
								key: col,
								prop: col,
								label: col,
								"min-width": "120"
							}, null, 8, ["prop", "label"]);
						}), 128))]),
						_: 1
					}, 8, ["data"])) : (openBlock(), createElementBlock("div", {
						key: 2,
						ref_for: true,
						ref: (el) => setChartRef(el, index),
						class: "chart-container"
					}, null, 512))]);
				}), 128))]))])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: showSubscribe.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => showSubscribe.value = $event),
					title: _ctx.$t("report.subscribeReport"),
					width: "500px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[4] || (_cache[4] = ($event) => showSubscribe.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitSubscribe
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: scheduleForm,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: _ctx.$t("report.cronExpression") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: scheduleForm.cronExpression,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => scheduleForm.cronExpression = $event),
									placeholder: "0 0 8 * * ?"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.recipients") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: scheduleForm.recipients,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => scheduleForm.recipients = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.channel") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: scheduleForm.channel,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => scheduleForm.channel = $event)
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: _ctx.$t("report.channelEmail"),
											value: "email"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("report.channelSms"),
											value: "sms"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("report.channelIm"),
											value: "im"
										}, null, 8, ["label"])
									]),
									_: 1
								}, 8, ["modelValue"])]),
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
}), [["__scopeId", "data-v-c2da90b0"]]);
//#endregion
export { preview_default as default };

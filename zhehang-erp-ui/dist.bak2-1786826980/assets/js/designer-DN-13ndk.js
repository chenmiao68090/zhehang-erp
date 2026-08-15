import { Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, yt as onBeforeUnmount } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Ct as arrow_left_default, Dr as withModifiers, G as ElColorPicker, Jt as data_analysis_default, Nt as check_default, Q as ElRadioGroup, Vt as close_default, Z as ElRadioButton, _t as ElFormItem, gr as view_default, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as init } from "./vendor-echarts-INkQTIfO.js";
import { n as reportDefinitionApi } from "./report-Vj0uVoII.js";
//#region src/views/report/designer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container report-designer-page" };
var _hoisted_2 = { class: "designer-toolbar" };
var _hoisted_3 = { class: "toolbar-left" };
var _hoisted_4 = { class: "toolbar-right" };
var _hoisted_5 = { class: "designer-body" };
var _hoisted_6 = { class: "panel-left" };
var _hoisted_7 = { class: "component-list" };
var _hoisted_8 = ["onDragstart"];
var _hoisted_9 = {
	key: 0,
	class: "data-config"
};
var _hoisted_10 = {
	key: 1,
	class: "data-config"
};
var _hoisted_11 = {
	key: 0,
	class: "canvas-empty"
};
var _hoisted_12 = {
	key: 1,
	class: "canvas-grid"
};
var _hoisted_13 = ["onClick"];
var _hoisted_14 = { class: "item-header" };
var _hoisted_15 = { class: "item-preview" };
var _hoisted_16 = { class: "panel-right" };
var _hoisted_17 = {
	key: 1,
	class: "no-selection"
};
var _hoisted_18 = { style: {
	"color": "var(--el-text-color-secondary)",
	"text-align": "center",
	"margin-top": "40px"
} };
//#endregion
//#region src/views/report/designer.vue
var designer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "designer",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const route = useRoute();
		const reportForm = reactive({
			name: "",
			category: "crm",
			type: "chart",
			dataSourceType: "preset",
			sqlQuery: "",
			permissionType: "public",
			status: 0
		});
		const canvasItems = ref([]);
		const selectedIndex = ref(-1);
		const chartRefs = ref([]);
		const chartInstances = ref([]);
		const componentTypes = [
			{
				type: "kpi",
				label: t("report.chartKpi"),
				icon: "DataAnalysis"
			},
			{
				type: "table",
				label: t("report.chartTable"),
				icon: "Grid"
			},
			{
				type: "line",
				label: t("report.chartLine"),
				icon: "TrendCharts"
			},
			{
				type: "bar",
				label: t("report.chartBar"),
				icon: "Histogram"
			},
			{
				type: "pie",
				label: t("report.chartPie"),
				icon: "PieChart"
			},
			{
				type: "funnel",
				label: t("report.chartFunnel"),
				icon: "Sort"
			},
			{
				type: "radar",
				label: t("report.chartRadar"),
				icon: "Aim"
			}
		];
		function getChartLabel(type) {
			const found = componentTypes.find((c) => c.type === type);
			return found ? found.label : type;
		}
		function setChartRef(el, index) {
			chartRefs.value[index] = el;
			if (el) nextTick(() => renderChart(index));
		}
		function onDragStart(e, type) {
			var _e$dataTransfer;
			(_e$dataTransfer = e.dataTransfer) === null || _e$dataTransfer === void 0 || _e$dataTransfer.setData("chartType", type);
		}
		function onDrop(e) {
			var _e$dataTransfer2;
			const type = (_e$dataTransfer2 = e.dataTransfer) === null || _e$dataTransfer2 === void 0 ? void 0 : _e$dataTransfer2.getData("chartType");
			if (type) {
				canvasItems.value.push({
					chartType: type,
					title: "",
					xField: "name",
					yField: "value",
					color: "#3370ff",
					legendPosition: "top"
				});
				nextTick(() => {
					selectedIndex.value = canvasItems.value.length - 1;
					renderChart(canvasItems.value.length - 1);
				});
			}
		}
		function selectItem(index) {
			selectedIndex.value = index;
		}
		function removeItem(index) {
			if (chartInstances.value[index]) chartInstances.value[index].dispose();
			canvasItems.value.splice(index, 1);
			chartInstances.value.splice(index, 1);
			chartRefs.value.splice(index, 1);
			if (selectedIndex.value >= canvasItems.value.length) selectedIndex.value = canvasItems.value.length - 1;
		}
		function renderChart(index) {
			const el = chartRefs.value[index];
			if (!el) return;
			const item = canvasItems.value[index];
			if (!item) return;
			let instance = chartInstances.value[index];
			if (!instance) {
				instance = init(el);
				chartInstances.value[index] = instance;
			}
			const previewData = [];
			const color = item.color || "#3370ff";
			let option = {};
			switch (item.chartType) {
				case "line":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 13 }
						},
						tooltip: { trigger: "axis" },
						legend: {
							show: true,
							[item.legendPosition === "left" || item.legendPosition === "right" ? item.legendPosition : item.legendPosition || "top"]: 0
						},
						xAxis: {
							type: "category",
							data: previewData.map((d) => d.name)
						},
						yAxis: { type: "value" },
						series: [{
							type: "line",
							data: previewData.map((d) => d.value),
							smooth: true,
							itemStyle: { color },
							areaStyle: { color: color + "33" }
						}]
					};
					break;
				case "bar":
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 13 }
						},
						tooltip: { trigger: "axis" },
						xAxis: {
							type: "category",
							data: previewData.map((d) => d.name)
						},
						yAxis: { type: "value" },
						series: [{
							type: "bar",
							data: previewData.map((d) => d.value),
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
							textStyle: { fontSize: 13 }
						},
						tooltip: { trigger: "item" },
						legend: {
							orient: "horizontal",
							[item.legendPosition || "bottom"]: 0
						},
						series: [{
							type: "pie",
							radius: ["35%", "60%"],
							data: previewData.map((d, i) => _objectSpread2(_objectSpread2({}, d), {}, { itemStyle: { color: [
								"#3370ff",
								"#3B82F6",
								"#10B981",
								"#F59E0B",
								"#8B5CF6",
								"#EC4899"
							][i] } }))
						}]
					};
					break;
				case "kpi":
					instance.clear();
					option = {
						title: {
							text: item.title || "KPI",
							left: "center",
							textStyle: {
								fontSize: 13,
								color: "#666"
							}
						},
						graphic: realDataPreviewHint()
					};
					break;
				case "table":
					instance.clear();
					option = {
						title: {
							text: item.title || t("report.chartTable"),
							left: "center",
							textStyle: { fontSize: 13 }
						},
						tooltip: {},
						xAxis: {
							type: "category",
							data: previewData.map((d) => d.name)
						},
						yAxis: { type: "value" },
						series: [{
							type: "bar",
							data: previewData.map((d) => d.value),
							itemStyle: { color: "#3B82F6" }
						}]
					};
					break;
				case "funnel":
					instance.clear();
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 13 }
						},
						graphic: realDataPreviewHint()
					};
					break;
				case "radar":
					instance.clear();
					option = {
						title: {
							text: item.title,
							left: "center",
							textStyle: { fontSize: 13 }
						},
						graphic: realDataPreviewHint()
					};
					break;
			}
			instance.setOption(option, true);
		}
		function realDataPreviewHint() {
			return {
				type: "text",
				left: "center",
				top: "middle",
				style: {
					text: "设计器不展示演示数值\n保存后请到预览页加载真实数据",
					fill: "#909399",
					fontSize: 13,
					lineHeight: 22,
					align: "center"
				}
			};
		}
		function goBack() {
			router.push("/report/list");
		}
		function resolveCreatedReportId(_x) {
			return _resolveCreatedReportId.apply(this, arguments);
		}
		function _resolveCreatedReportId() {
			_resolveCreatedReportId = _asyncToGenerator(function* (data) {
				var _response$data, _response$data2;
				const response = yield reportDefinitionApi.list({
					pageNum: 1,
					pageSize: 50,
					name: data.name,
					category: data.category,
					type: data.type
				});
				const saved = ((response === null || response === void 0 || (_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.records) || (response === null || response === void 0 || (_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.list) || []).filter((row) => row.name === data.name && row.category === data.category && row.type === data.type && row.dataSourceType === data.dataSourceType && row.chartConfig === data.chartConfig && row.filterConfig === data.filterConfig).sort((a, b) => Number(b.id || 0) - Number(a.id || 0))[0];
				return (saved === null || saved === void 0 ? void 0 : saved.id) ? Number(saved.id) : null;
			});
			return _resolveCreatedReportId.apply(this, arguments);
		}
		function handleSave() {
			return _handleSave.apply(this, arguments);
		}
		function _handleSave() {
			_handleSave = _asyncToGenerator(function* () {
				if (!reportForm.name) {
					ElMessage.warning(t("common.pleaseInput") + t("report.name"));
					return null;
				}
				const chartConfig = JSON.stringify(canvasItems.value);
				const data = _objectSpread2(_objectSpread2({}, reportForm), {}, {
					chartConfig,
					filterConfig: "[]"
				});
				if (data.id) yield reportDefinitionApi.update(data);
				else {
					var _ref, _created$data$id, _created$data;
					const created = yield reportDefinitionApi.create(data);
					const responseId = Number((_ref = (_created$data$id = created === null || created === void 0 || (_created$data = created.data) === null || _created$data === void 0 ? void 0 : _created$data.id) !== null && _created$data$id !== void 0 ? _created$data$id : created === null || created === void 0 ? void 0 : created.data) !== null && _ref !== void 0 ? _ref : 0);
					const createdId = responseId > 0 ? responseId : yield resolveCreatedReportId(data);
					if (!createdId) {
						ElMessage.warning("报表已提交保存，但未能确认真实编号；请返回报表列表后再预览。");
						return null;
					}
					reportForm.id = createdId;
					yield router.replace({
						path: route.path,
						query: _objectSpread2(_objectSpread2({}, route.query), {}, { id: String(createdId) })
					});
				}
				ElMessage.success(t("report.saveSuccess"));
				return Number(reportForm.id || data.id) || null;
			});
			return _handleSave.apply(this, arguments);
		}
		function handlePreview() {
			return _handlePreview.apply(this, arguments);
		}
		function _handlePreview() {
			_handlePreview = _asyncToGenerator(function* () {
				const savedId = yield handleSave();
				if (savedId) router.push({
					path: "/report/preview",
					query: { id: String(savedId) }
				});
			});
			return _handlePreview.apply(this, arguments);
		}
		function loadReport(_x2) {
			return _loadReport.apply(this, arguments);
		}
		function _loadReport() {
			_loadReport = _asyncToGenerator(function* (id) {
				const data = (yield reportDefinitionApi.detail(id)).data;
				if (data) {
					Object.assign(reportForm, data);
					if (data.chartConfig) try {
						canvasItems.value = JSON.parse(data.chartConfig);
					} catch (_unused) {}
					nextTick(() => {
						canvasItems.value.forEach((_, i) => renderChart(i));
					});
				}
			});
			return _loadReport.apply(this, arguments);
		}
		onMounted(() => {
			const id = route.query.id;
			if (id) loadReport(Number(id));
		});
		onBeforeUnmount(() => {
			chartInstances.value.forEach((inst) => inst === null || inst === void 0 ? void 0 : inst.dispose());
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_divider = ElDivider;
			const _component_el_input = ElInput;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_color_picker = ElColorPicker;
			const _component_el_form = ElForm;
			const _component_el_alert = ElAlert;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
				createVNode(_component_el_button, { onClick: goBack }, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_left_default))]),
						_: 1
					}), createTextVNode(toDisplayString(_ctx.$t("common.back")), 1)]),
					_: 1
				}),
				createVNode(_component_el_divider, { direction: "vertical" }),
				createVNode(_component_el_input, {
					modelValue: reportForm.name,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => reportForm.name = $event),
					placeholder: _ctx.$t("report.name"),
					style: { "width": "220px" }
				}, null, 8, ["modelValue", "placeholder"])
			]), createBaseVNode("div", _hoisted_4, [createVNode(_component_el_button, { onClick: handlePreview }, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(view_default))]),
					_: 1
				}), createTextVNode(toDisplayString(_ctx.$t("report.preview")), 1)]),
				_: 1
			}), createVNode(_component_el_button, {
				type: "primary",
				onClick: handleSave
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(check_default))]),
					_: 1
				}), createTextVNode(toDisplayString(_ctx.$t("common.save")), 1)]),
				_: 1
			})])]), createBaseVNode("div", _hoisted_5, [
				createBaseVNode("div", _hoisted_6, [
					createBaseVNode("h4", null, toDisplayString(_ctx.$t("report.componentLibrary")), 1),
					createBaseVNode("div", _hoisted_7, [(openBlock(), createElementBlock(Fragment, null, renderList(componentTypes, (comp) => {
						return createBaseVNode("div", {
							key: comp.type,
							class: "component-item",
							draggable: "true",
							onDragstart: ($event) => onDragStart($event, comp.type)
						}, [createVNode(_component_el_icon, { size: 22 }, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(comp.icon)))]),
							_: 2
						}, 1024), createBaseVNode("span", null, toDisplayString(comp.label), 1)], 40, _hoisted_8);
					}), 64))]),
					createVNode(_component_el_divider),
					createBaseVNode("h4", null, toDisplayString(_ctx.$t("report.dataSourceType")), 1),
					createVNode(_component_el_radio_group, {
						modelValue: reportForm.dataSourceType,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => reportForm.dataSourceType = $event),
						size: "small"
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { value: "preset" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("report.dataSourcePreset")), 1)]),
							_: 1
						}), createVNode(_component_el_radio_button, { value: "sql" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("report.dataSourceSql")), 1)]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					reportForm.dataSourceType === "preset" ? (openBlock(), createElementBlock("div", _hoisted_9, [createVNode(_component_el_select, {
						modelValue: reportForm.category,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => reportForm.category = $event),
						placeholder: _ctx.$t("report.category"),
						style: {
							"width": "100%",
							"margin-top": "10px"
						}
					}, {
						default: withCtx(() => [
							createVNode(_component_el_option, {
								label: "CRM",
								value: "crm"
							}),
							createVNode(_component_el_option, {
								label: _ctx.$t("report.categoryFinance"),
								value: "finance"
							}, null, 8, ["label"]),
							createVNode(_component_el_option, {
								label: _ctx.$t("report.categoryHrm"),
								value: "hrm"
							}, null, 8, ["label"]),
							createVNode(_component_el_option, {
								label: _ctx.$t("report.categorySales"),
								value: "sales"
							}, null, 8, ["label"])
						]),
						_: 1
					}, 8, ["modelValue", "placeholder"])])) : (openBlock(), createElementBlock("div", _hoisted_10, [createVNode(_component_el_input, {
						modelValue: reportForm.sqlQuery,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => reportForm.sqlQuery = $event),
						type: "textarea",
						rows: 5,
						placeholder: _ctx.$t("report.sqlPlaceholder"),
						style: { "margin-top": "10px" }
					}, null, 8, ["modelValue", "placeholder"])]))
				]),
				createBaseVNode("div", {
					class: "panel-center",
					onDragover: _cache[4] || (_cache[4] = withModifiers(() => {}, ["prevent"])),
					onDrop
				}, [canvasItems.value.length === 0 ? (openBlock(), createElementBlock("div", _hoisted_11, [createVNode(_component_el_icon, {
					size: 48,
					color: "#ddd"
				}, {
					default: withCtx(() => [createVNode(unref(data_analysis_default))]),
					_: 1
				}), createBaseVNode("p", null, toDisplayString(_ctx.$t("report.dragHint")), 1)])) : (openBlock(), createElementBlock("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(canvasItems.value, (item, index) => {
					return openBlock(), createElementBlock("div", {
						key: index,
						class: normalizeClass(["canvas-item", { selected: selectedIndex.value === index }]),
						onClick: ($event) => selectItem(index)
					}, [createBaseVNode("div", _hoisted_14, [createBaseVNode("span", null, toDisplayString(item.title || getChartLabel(item.chartType)), 1), createVNode(_component_el_icon, {
						class: "item-remove",
						onClick: withModifiers(($event) => removeItem(index), ["stop"])
					}, {
						default: withCtx(() => [createVNode(unref(close_default))]),
						_: 1
					}, 8, ["onClick"])]), createBaseVNode("div", _hoisted_15, [createBaseVNode("div", {
						ref_for: true,
						ref: (el) => setChartRef(el, index),
						class: "chart-preview-box"
					}, null, 512)])], 10, _hoisted_13);
				}), 128))]))], 32),
				createBaseVNode("div", _hoisted_16, [
					createBaseVNode("h4", null, toDisplayString(_ctx.$t("report.properties")), 1),
					selectedIndex.value >= 0 && canvasItems.value[selectedIndex.value] ? (openBlock(), createBlock(_component_el_form, {
						key: 0,
						"label-position": "top",
						size: "small"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: _ctx.$t("report.chartTitle") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: canvasItems.value[selectedIndex.value].title,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => canvasItems.value[selectedIndex.value].title = $event),
									onChange: _cache[6] || (_cache[6] = ($event) => renderChart(selectedIndex.value))
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.type") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: canvasItems.value[selectedIndex.value].chartType,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => canvasItems.value[selectedIndex.value].chartType = $event),
									onChange: _cache[8] || (_cache[8] = ($event) => renderChart(selectedIndex.value))
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(componentTypes, (ct) => {
										return createVNode(_component_el_option, {
											key: ct.type,
											label: ct.label,
											value: ct.type
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.dimension") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: canvasItems.value[selectedIndex.value].xField,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => canvasItems.value[selectedIndex.value].xField = $event),
									placeholder: "X轴字段",
									onChange: _cache[10] || (_cache[10] = ($event) => renderChart(selectedIndex.value))
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.metric") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: canvasItems.value[selectedIndex.value].yField,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => canvasItems.value[selectedIndex.value].yField = $event),
									placeholder: "Y轴字段",
									onChange: _cache[12] || (_cache[12] = ($event) => renderChart(selectedIndex.value))
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.color") }, {
								default: withCtx(() => [createVNode(_component_el_color_picker, {
									modelValue: canvasItems.value[selectedIndex.value].color,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => canvasItems.value[selectedIndex.value].color = $event),
									onChange: _cache[14] || (_cache[14] = ($event) => renderChart(selectedIndex.value))
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("report.legendPosition") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: canvasItems.value[selectedIndex.value].legendPosition,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => canvasItems.value[selectedIndex.value].legendPosition = $event),
									onChange: _cache[16] || (_cache[16] = ($event) => renderChart(selectedIndex.value))
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: _ctx.$t("report.positionTop"),
											value: "top"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("report.positionBottom"),
											value: "bottom"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("report.positionLeft"),
											value: "left"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("report.positionRight"),
											value: "right"
										}, null, 8, ["label"])
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					})) : (openBlock(), createElementBlock("div", _hoisted_17, [createBaseVNode("p", _hoisted_18, toDisplayString(_ctx.$t("report.noComponents")), 1)])),
					createVNode(_component_el_divider),
					createBaseVNode("h4", null, toDisplayString(_ctx.$t("report.filterConfig")), 1),
					createVNode(_component_el_alert, {
						title: "筛选条件暂未开放",
						description: "当前查询服务尚未接入参数绑定，系统不会展示或保存一个看似生效、实际未筛选的条件。",
						type: "warning",
						closable: false,
						"show-icon": ""
					})
				])
			])]);
		};
	}
}), [["__scopeId", "data-v-20d6d446"]]);
//#endregion
export { designer_default as default };

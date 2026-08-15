import { $ as createCommentVNode, At as resolveDirective, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $t as download_default, D as ElPagination, Er as withKeys, H as ElDescriptions, U as ElDescriptionsItem, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as operLogApi } from "./system-CuP08T_i.js";
import { t as downloadBlob } from "./download-DmWzpvAG.js";
//#region src/views/system/oper-log.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container" };
var _hoisted_2 = { class: "card-header" };
var _hoisted_3 = { class: "toolbar-btns" };
var _hoisted_4 = {
	key: 0,
	class: "normal-identity"
};
var _hoisted_5 = { style: { "color": "#f56c6c" } };
//#endregion
//#region src/views/system/oper-log.vue
var oper_log_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "oper-log",
	setup(__props) {
		const { t } = useI18n();
		const queryParams = reactive({
			pageNum: 1,
			pageSize: 20,
			module: "",
			operType: "",
			operator: ""
		});
		const dateRange = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const logList = ref([]);
		const detailVisible = ref(false);
		const detailData = ref({});
		onMounted(() => {
			getList();
		});
		function getList() {
			return _getList.apply(this, arguments);
		}
		function _getList() {
			_getList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _res$data2, _res$data3;
					const params = _objectSpread2({}, queryParams);
					if (dateRange.value && dateRange.value.length === 2) {
						params.beginTime = dateRange.value[0];
						params.endTime = dateRange.value[1];
					}
					const res = yield operLogApi.list(params);
					logList.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.list) || [];
					total.value = ((_res$data3 = res.data) === null || _res$data3 === void 0 ? void 0 : _res$data3.total) || 0;
				} finally {
					loading.value = false;
				}
			});
			return _getList.apply(this, arguments);
		}
		function handleQuery() {
			queryParams.pageNum = 1;
			getList();
		}
		function resetQuery() {
			queryParams.module = "";
			queryParams.operType = "";
			queryParams.operator = "";
			dateRange.value = [];
			handleQuery();
		}
		function handleExport() {
			return _handleExport.apply(this, arguments);
		}
		function _handleExport() {
			_handleExport = _asyncToGenerator(function* () {
				downloadBlob(yield operLogApi.export(buildQueryParams()), `operation-logs-${Date.now()}.csv`);
				ElMessage.success(t("common.success"));
			});
			return _handleExport.apply(this, arguments);
		}
		function handleRowClick(_x) {
			return _handleRowClick.apply(this, arguments);
		}
		function _handleRowClick() {
			_handleRowClick = _asyncToGenerator(function* (row) {
				try {
					detailData.value = (yield operLogApi.detail(row.id)).data || row;
				} catch (_e) {
					detailData.value = row;
				}
				detailVisible.value = true;
			});
			return _handleRowClick.apply(this, arguments);
		}
		function handleClean() {
			ElMessageBox.confirm(t("system.operLog.cleanConfirm"), t("common.warning"), {
				confirmButtonText: t("common.confirm"),
				cancelButtonText: t("common.cancel"),
				type: "warning"
			}).then(_asyncToGenerator(function* () {
				yield operLogApi.clean();
				ElMessage.success(t("common.success"));
				getList();
			})).catch(() => {});
		}
		function buildQueryParams() {
			const params = _objectSpread2({}, queryParams);
			if (dateRange.value && dateRange.value.length === 2) {
				params.beginTime = dateRange.value[0];
				params.endTime = dateRange.value[1];
			}
			return params;
		}
		function getOperTypeTag(type) {
			return {
				INSERT: "success",
				UPDATE: "warning",
				DELETE: "danger",
				EXPORT: "info",
				QUERY: "",
				OTHER: "info"
			}[type] || "info";
		}
		function getOperTypeLabel(type) {
			return {
				INSERT: t("system.operLog.typeInsert"),
				UPDATE: t("system.operLog.typeUpdate"),
				DELETE: t("system.operLog.typeDelete"),
				EXPORT: t("system.operLog.typeExport"),
				QUERY: t("system.operLog.typeQuery"),
				OTHER: t("system.operLog.typeOther")
			}[type] || type || "-";
		}
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_Search = resolveComponent("Search");
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_Refresh = resolveComponent("Refresh");
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			const _component_Delete = resolveComponent("Delete");
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_dialog = ElDialog;
			const _directive_hasPermi = resolveDirective("hasPermi");
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(_component_el_card, {
					shadow: "never",
					class: "search-card"
				}, {
					default: withCtx(() => [createVNode(_component_el_form, {
						model: queryParams,
						inline: true
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.operLog.module"),
								prop: "module"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.module,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.module = $event),
									placeholder: _ctx.$t("common.inputPlaceholder"),
									clearable: "",
									onKeyup: withKeys(handleQuery, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.operLog.operType"),
								prop: "operType"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: queryParams.operType,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.operType = $event),
									placeholder: _ctx.$t("common.selectPlaceholder"),
									clearable: ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: _ctx.$t("system.operLog.typeInsert"),
											value: "INSERT"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("system.operLog.typeUpdate"),
											value: "UPDATE"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("system.operLog.typeDelete"),
											value: "DELETE"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("system.operLog.typeExport"),
											value: "EXPORT"
										}, null, 8, ["label"]),
										createVNode(_component_el_option, {
											label: _ctx.$t("system.operLog.typeOther"),
											value: "OTHER"
										}, null, 8, ["label"])
									]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.operLog.operator"),
								prop: "operator"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.operator,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => queryParams.operator = $event),
									placeholder: _ctx.$t("common.inputPlaceholder"),
									clearable: "",
									onKeyup: withKeys(handleQuery, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.operLog.operTime"),
								prop: "dateRange"
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: dateRange.value,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => dateRange.value = $event),
									type: "daterange",
									"range-separator": "-",
									"start-placeholder": _ctx.$t("common.startDate"),
									"end-placeholder": _ctx.$t("common.endDate"),
									"value-format": "YYYY-MM-DD"
								}, null, 8, [
									"modelValue",
									"start-placeholder",
									"end-placeholder"
								])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									onClick: handleQuery
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(_component_Search)]),
										_: 1
									}), createTextVNode(toDisplayString(_ctx.$t("common.search")), 1)]),
									_: 1
								}), createVNode(_component_el_button, { onClick: resetQuery }, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(_component_Refresh)]),
										_: 1
									}), createTextVNode(toDisplayString(_ctx.$t("common.reset")), 1)]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "table-card"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_2, [createBaseVNode("span", null, toDisplayString(_ctx.$t("system.operLog.title")), 1), createBaseVNode("div", _hoisted_3, [withDirectives((openBlock(), createBlock(_component_el_button, {
						type: "warning",
						onClick: handleExport
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(download_default))]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.export")), 1)]),
						_: 1
					})), [[_directive_hasPermi, ["log:oper:export", "system:log:export"]]]), withDirectives((openBlock(), createBlock(_component_el_button, {
						type: "danger",
						onClick: handleClean
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_Delete)]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.clean")), 1)]),
						_: 1
					})), [[_directive_hasPermi, ["log:oper:remove", "system:log:remove"]]])])])]),
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: logList.value,
						border: "",
						stripe: "",
						onRowClick: handleRowClick
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.module"),
								prop: "module",
								"min-width": "120"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.operType"),
								prop: "operType",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: getOperTypeTag(row.operType) }, {
									default: withCtx(() => [createTextVNode(toDisplayString(getOperTypeLabel(row.operType)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.operator"),
								prop: "operator",
								"min-width": "120"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: "身份视角",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [!row.impersonationSessionId ? (openBlock(), createElementBlock("span", _hoisted_4, "本人操作")) : (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									type: "warning",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.actorUsername || row.operator || "超级管理员") + " → " + toDisplayString(row.effectiveUsername || row.effectiveUserId || "员工"), 1)]),
									_: 2
								}, 1024))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.ipAddr"),
								prop: "ipAddr",
								"min-width": "140"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.operTime"),
								prop: "operTime",
								width: "180",
								align: "center"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.status"),
								prop: "status",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.status === 0 ? "success" : "danger" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.status === 0 ? _ctx.$t("common.success") : _ctx.$t("common.failed")), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.operLog.costTime"),
								prop: "costTime",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.costTime) + "ms ", 1)]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]), createVNode(_component_el_pagination, {
						class: "pagination",
						"current-page": queryParams.pageNum,
						"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => queryParams.pageNum = $event),
						"page-size": queryParams.pageSize,
						"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => queryParams.pageSize = $event),
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						total: total.value,
						layout: "total, sizes, prev, pager, next, jumper",
						onSizeChange: getList,
						onCurrentChange: getList
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => detailVisible.value = $event),
					title: _ctx.$t("system.operLog.detail"),
					width: "800px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[6] || (_cache[6] = ($event) => detailVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.close")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_descriptions, {
						column: 2,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.module") }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.module), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.operType") }, {
								default: withCtx(() => [createTextVNode(toDisplayString(getOperTypeLabel(detailData.value.operType)), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.operator") }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.operator), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.ipAddr") }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.ipAddr), 1)]),
								_: 1
							}, 8, ["label"]),
							detailData.value.impersonationSessionId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
								createVNode(_component_el_descriptions_item, { label: "实际操作人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.actorUsername || detailData.value.operator) + "（ID：" + toDisplayString(detailData.value.actorUserId || detailData.value.operatorId) + "） ", 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "被模拟员工" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.effectiveUsername || "-") + "（ID：" + toDisplayString(detailData.value.effectiveUserId || "-") + "） ", 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "代登录会话",
									span: 2
								}, {
									default: withCtx(() => [createBaseVNode("code", null, toDisplayString(detailData.value.impersonationSessionId), 1)]),
									_: 1
								})
							], 64)) : createCommentVNode("", true),
							createVNode(_component_el_descriptions_item, {
								label: _ctx.$t("system.operLog.requestUri"),
								span: 2
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.requestUri), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, {
								label: _ctx.$t("system.operLog.requestMethod"),
								span: 2
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.requestMethod), 1)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, {
								label: _ctx.$t("system.operLog.requestParams"),
								span: 2
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									type: "textarea",
									"model-value": detailData.value.requestParams,
									rows: 4,
									readonly: ""
								}, null, 8, ["model-value"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, {
								label: _ctx.$t("system.operLog.responseResult"),
								span: 2
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									type: "textarea",
									"model-value": detailData.value.responseResult,
									rows: 4,
									readonly: ""
								}, null, 8, ["model-value"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.status") }, {
								default: withCtx(() => [createVNode(_component_el_tag, { type: detailData.value.status === 0 ? "success" : "danger" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.status === 0 ? _ctx.$t("common.success") : _ctx.$t("common.failed")), 1)]),
									_: 1
								}, 8, ["type"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_descriptions_item, { label: _ctx.$t("system.operLog.costTime") }, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.costTime) + "ms", 1)]),
								_: 1
							}, 8, ["label"]),
							detailData.value.errorMsg ? (openBlock(), createBlock(_component_el_descriptions_item, {
								key: 1,
								label: _ctx.$t("system.operLog.errorMsg"),
								span: 2
							}, {
								default: withCtx(() => [createBaseVNode("span", _hoisted_5, toDisplayString(detailData.value.errorMsg), 1)]),
								_: 1
							}, 8, ["label"])) : createCommentVNode("", true),
							createVNode(_component_el_descriptions_item, {
								label: _ctx.$t("system.operLog.operTime"),
								span: 2
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(detailData.value.operTime), 1)]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-0db8cfe8"]]);
//#endregion
export { oper_log_default as default };

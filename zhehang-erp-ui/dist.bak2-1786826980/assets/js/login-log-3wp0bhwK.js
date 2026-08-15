import { $ as createCommentVNode, At as resolveDirective, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Er as withKeys, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as loginLogApi } from "./system-CuP08T_i.js";
import { t as downloadBlob } from "./download-DmWzpvAG.js";
//#region src/views/system/login-log.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container" };
var _hoisted_2 = { class: "log-overview" };
var _hoisted_3 = { class: "overview-item" };
var _hoisted_4 = { class: "overview-item success" };
var _hoisted_5 = { class: "overview-item danger" };
var _hoisted_6 = { class: "card-header" };
var _hoisted_7 = { class: "toolbar-btns" };
//#endregion
//#region src/views/system/login-log.vue
var login_log_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "login-log",
	setup(__props) {
		const { t } = useI18n();
		const queryParams = reactive({
			pageNum: 1,
			pageSize: 20,
			username: "",
			ipAddr: "",
			status: void 0
		});
		const dateRange = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const logList = ref([]);
		const successCount = computed(() => logList.value.filter((item) => item.status === 0).length);
		const failCount = computed(() => logList.value.filter((item) => item.status === 1).length);
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
					const res = yield loginLogApi.list(params);
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
			queryParams.username = "";
			queryParams.ipAddr = "";
			queryParams.status = void 0;
			dateRange.value = [];
			handleQuery();
		}
		function handleExport() {
			return _handleExport.apply(this, arguments);
		}
		function _handleExport() {
			_handleExport = _asyncToGenerator(function* () {
				downloadBlob(yield loginLogApi.export(buildQueryParams()), `login-logs-${Date.now()}.csv`);
				ElMessage.success(t("common.success"));
			});
			return _handleExport.apply(this, arguments);
		}
		function handleClean() {
			ElMessageBox.confirm(t("system.loginLog.cleanConfirm"), t("common.warning"), {
				confirmButtonText: t("common.confirm"),
				cancelButtonText: t("common.cancel"),
				type: "warning"
			}).then(_asyncToGenerator(function* () {
				yield loginLogApi.clean();
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
			const _component_el_alert = ElAlert;
			const _component_Download = resolveComponent("Download");
			const _component_Delete = resolveComponent("Delete");
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
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
								label: _ctx.$t("system.loginLog.username"),
								prop: "username"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.username,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.username = $event),
									placeholder: _ctx.$t("common.inputPlaceholder"),
									clearable: "",
									onKeyup: withKeys(handleQuery, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.loginLog.ipAddr"),
								prop: "ipAddr"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.ipAddr,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.ipAddr = $event),
									placeholder: _ctx.$t("common.inputPlaceholder"),
									clearable: "",
									onKeyup: withKeys(handleQuery, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.loginLog.status"),
								prop: "status"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: queryParams.status,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => queryParams.status = $event),
									placeholder: _ctx.$t("common.selectPlaceholder"),
									clearable: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: _ctx.$t("common.success"),
										value: 0
									}, null, 8, ["label"]), createVNode(_component_el_option, {
										label: _ctx.$t("common.failed"),
										value: 1
									}, null, 8, ["label"])]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.loginLog.loginTime"),
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
				createBaseVNode("div", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [_cache[6] || (_cache[6] = createBaseVNode("span", null, "当前筛选记录", -1)), createBaseVNode("b", null, toDisplayString(total.value), 1)]),
					createBaseVNode("div", _hoisted_4, [_cache[7] || (_cache[7] = createBaseVNode("span", null, "当前页成功", -1)), createBaseVNode("b", null, toDisplayString(successCount.value), 1)]),
					createBaseVNode("div", _hoisted_5, [_cache[8] || (_cache[8] = createBaseVNode("span", null, "当前页失败", -1)), createBaseVNode("b", null, toDisplayString(failCount.value), 1)]),
					!loading.value && total.value === 0 ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						class: "overview-tip",
						title: "登录日志已接入，从下一次登录开始自动记录成功/失败、IP、浏览器和操作系统。",
						type: "info",
						"show-icon": "",
						closable: false
					})) : createCommentVNode("", true)
				]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "table-card"
				}, {
					header: withCtx(() => [createBaseVNode("div", _hoisted_6, [createBaseVNode("span", null, toDisplayString(_ctx.$t("system.loginLog.title")), 1), createBaseVNode("div", _hoisted_7, [
						createVNode(_component_el_button, { onClick: getList }, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(_component_Refresh)]),
								_: 1
							}), _cache[9] || (_cache[9] = createTextVNode("刷新", -1))]),
							_: 1
						}),
						withDirectives((openBlock(), createBlock(_component_el_button, {
							type: "warning",
							onClick: handleExport
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(_component_Download)]),
								_: 1
							}), createTextVNode(toDisplayString(_ctx.$t("common.export")), 1)]),
							_: 1
						})), [[_directive_hasPermi, ["log:login:export", "system:log:export"]]]),
						withDirectives((openBlock(), createBlock(_component_el_button, {
							type: "danger",
							onClick: handleClean
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(_component_Delete)]),
								_: 1
							}), createTextVNode(toDisplayString(_ctx.$t("common.clean")), 1)]),
							_: 1
						})), [[_directive_hasPermi, ["log:login:remove", "system:log:remove"]]])
					])])]),
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: logList.value,
						border: "",
						stripe: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.username"),
								prop: "username",
								"min-width": "120"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.ipAddr"),
								prop: "ipAddr",
								"min-width": "140"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.loginLocation"),
								prop: "loginLocation",
								"min-width": "150"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.browser"),
								prop: "browser",
								"min-width": "120"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.os"),
								prop: "os",
								"min-width": "120"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.status"),
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
								label: _ctx.$t("system.loginLog.msg"),
								prop: "msg",
								"min-width": "150",
								"show-overflow-tooltip": ""
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.loginLog.loginTime"),
								prop: "loginTime",
								width: "180",
								align: "center"
							}, null, 8, ["label"])
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
				})
			]);
		};
	}
}), [["__scopeId", "data-v-69e802ed"]]);
//#endregion
export { login_log_default as default };

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Dr as withModifiers, Er as withKeys, Et as bell_default, F as ElEmpty, I as ElDropdown, Jt as data_analysis_default, L as ElDropdownItem, Nn as plus_default, R as ElDropdownMenu, Tn as more_filled_default, V as ElDialog, Wt as copy_document_default, Xt as delete_default, Yt as data_line_default, _t as ElFormItem, a as ElMessageBox, en as edit_default, gr as view_default, gt as ElForm, it as ElTag, ln as grid_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as reportDefinitionApi, r as reportScheduleApi } from "./report-Vj0uVoII.js";
//#region src/views/report/list.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container report-list-page" };
var _hoisted_2 = { class: "report-layout" };
var _hoisted_3 = { class: "category-sidebar" };
var _hoisted_4 = { class: "category-list" };
var _hoisted_5 = ["onClick"];
var _hoisted_6 = { class: "report-content" };
var _hoisted_7 = { class: "search-bar" };
var _hoisted_8 = { class: "report-grid" };
var _hoisted_9 = {
	key: 0,
	class: "empty-state"
};
var _hoisted_10 = ["onClick"];
var _hoisted_11 = { class: "card-header" };
var _hoisted_12 = { class: "card-body" };
var _hoisted_13 = { class: "card-title" };
var _hoisted_14 = { class: "card-tags" };
var _hoisted_15 = { class: "card-footer" };
var _hoisted_16 = { class: "card-time" };
var _hoisted_17 = { class: "pagination-wrapper" };
//#endregion
//#region src/views/report/list.vue
var list_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "list",
	setup(__props) {
		const { t } = useI18n();
		const router = useRouter();
		const loading = ref(false);
		const reportList = ref([]);
		const total = ref(0);
		const activeCategory = ref("");
		const subscribeVisible = ref(false);
		const currentReport = ref(null);
		const queryParams = reactive({
			pageNum: 1,
			pageSize: 12,
			name: "",
			type: "",
			category: ""
		});
		const scheduleForm = reactive({
			cronExpression: "0 0 8 * * ?",
			recipients: "",
			channel: "email",
			status: 1
		});
		const categories = computed(() => [
			{
				value: "",
				label: t("report.categoryAll"),
				icon: "Grid"
			},
			{
				value: "crm",
				label: t("report.categoryCrm"),
				icon: "User"
			},
			{
				value: "finance",
				label: t("report.categoryFinance"),
				icon: "Money"
			},
			{
				value: "hrm",
				label: t("report.categoryHrm"),
				icon: "Avatar"
			},
			{
				value: "sales",
				label: t("report.categorySales"),
				icon: "ShoppingCart"
			},
			{
				value: "supply",
				label: t("report.categorySupply"),
				icon: "Van"
			},
			{
				value: "other",
				label: t("report.categoryOther"),
				icon: "More"
			}
		]);
		function getCategoryLabel(cat) {
			const found = categories.value.find((c) => c.value === cat);
			return found ? found.label : cat;
		}
		function loadData() {
			return _loadData.apply(this, arguments);
		}
		function _loadData() {
			_loadData = _asyncToGenerator(function* () {
				loading.value = true;
				queryParams.category = activeCategory.value;
				try {
					var _res$data, _res$data2, _res$data3;
					const res = yield reportDefinitionApi.list(queryParams);
					reportList.value = ((_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || ((_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.list) || [];
					total.value = ((_res$data3 = res.data) === null || _res$data3 === void 0 ? void 0 : _res$data3.total) || 0;
				} finally {
					loading.value = false;
				}
			});
			return _loadData.apply(this, arguments);
		}
		function resetQuery() {
			queryParams.name = "";
			queryParams.type = "";
			activeCategory.value = "";
			loadData();
		}
		function handleCreate() {
			router.push("/report/designer");
		}
		function handlePreview(item) {
			router.push({
				path: "/report/preview",
				query: { id: String(item.id) }
			});
		}
		function handleCommand(cmd, item) {
			switch (cmd) {
				case "preview":
					handlePreview(item);
					break;
				case "edit":
					router.push({
						path: "/report/designer",
						query: { id: String(item.id) }
					});
					break;
				case "copy":
					handleCopy(item);
					break;
				case "subscribe":
					showSubscribe(item);
					break;
				case "delete":
					handleDelete(item);
					break;
			}
		}
		function handleCopy(_x) {
			return _handleCopy.apply(this, arguments);
		}
		function _handleCopy() {
			_handleCopy = _asyncToGenerator(function* (item) {
				yield ElMessageBox.confirm(t("report.confirmCopy"), t("report.copyReport"));
				yield reportDefinitionApi.copy(item.id);
				ElMessage.success(t("report.copySuccess"));
				loadData();
			});
			return _handleCopy.apply(this, arguments);
		}
		function handleDelete(_x2) {
			return _handleDelete.apply(this, arguments);
		}
		function _handleDelete() {
			_handleDelete = _asyncToGenerator(function* (item) {
				yield ElMessageBox.confirm(t("report.confirmDelete"), t("report.deleteReport"));
				yield reportDefinitionApi.remove(item.id);
				ElMessage.success(t("common.success"));
				loadData();
			});
			return _handleDelete.apply(this, arguments);
		}
		function showSubscribe(item) {
			currentReport.value = item;
			subscribeVisible.value = true;
		}
		function submitSubscribe() {
			return _submitSubscribe.apply(this, arguments);
		}
		function _submitSubscribe() {
			_submitSubscribe = _asyncToGenerator(function* () {
				if (!currentReport.value) return;
				yield reportScheduleApi.create({
					reportId: currentReport.value.id,
					cronExpression: scheduleForm.cronExpression,
					recipients: scheduleForm.recipients,
					channel: scheduleForm.channel,
					status: 1
				});
				ElMessage.success(t("common.success"));
				subscribeVisible.value = false;
			});
			return _submitSubscribe.apply(this, arguments);
		}
		onMounted(() => {
			loadData();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_form = ElForm;
			const _component_el_empty = ElEmpty;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_tag = ElTag;
			const _component_el_pagination = ElPagination;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("h4", null, toDisplayString(_ctx.$t("report.category")), 1), createBaseVNode("ul", _hoisted_4, [(openBlock(true), createElementBlock(Fragment, null, renderList(categories.value, (cat) => {
				return openBlock(), createElementBlock("li", {
					key: cat.value,
					class: normalizeClass({ active: activeCategory.value === cat.value }),
					onClick: ($event) => {
						activeCategory.value = cat.value;
						loadData();
					}
				}, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(cat.icon)))]),
					_: 2
				}, 1024), createBaseVNode("span", null, toDisplayString(cat.label), 1)], 10, _hoisted_5);
			}), 128))])]), createBaseVNode("div", _hoisted_6, [
				createBaseVNode("div", _hoisted_7, [createVNode(_component_el_form, {
					model: queryParams,
					inline: ""
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: queryParams.name,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.name = $event),
								placeholder: _ctx.$t("report.name"),
								clearable: "",
								onKeyup: withKeys(loadData, ["enter"]),
								"prefix-icon": "Search"
							}, null, 8, ["modelValue", "placeholder"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: queryParams.type,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.type = $event),
								placeholder: _ctx.$t("report.type"),
								clearable: ""
							}, {
								default: withCtx(() => [
									createVNode(_component_el_option, {
										label: _ctx.$t("report.typeTable"),
										value: "table"
									}, null, 8, ["label"]),
									createVNode(_component_el_option, {
										label: _ctx.$t("report.typeChart"),
										value: "chart"
									}, null, 8, ["label"]),
									createVNode(_component_el_option, {
										label: _ctx.$t("report.typeDashboard"),
										value: "dashboard"
									}, null, 8, ["label"])
								]),
								_: 1
							}, 8, ["modelValue", "placeholder"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createVNode(_component_el_button, {
								type: "primary",
								onClick: loadData
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.search")), 1)]),
								_: 1
							}), createVNode(_component_el_button, { onClick: resetQuery }, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.reset")), 1)]),
								_: 1
							})]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["model"]), createVNode(_component_el_button, {
					type: "primary",
					onClick: handleCreate
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), createTextVNode(toDisplayString(_ctx.$t("report.newReport")), 1)]),
					_: 1
				})]),
				withDirectives((openBlock(), createElementBlock("div", _hoisted_8, [reportList.value.length === 0 && !loading.value ? (openBlock(), createElementBlock("div", _hoisted_9, [createVNode(_component_el_empty, { description: _ctx.$t("common.noData") }, null, 8, ["description"])])) : createCommentVNode("", true), (openBlock(true), createElementBlock(Fragment, null, renderList(reportList.value, (item) => {
					var _item$createTime;
					return openBlock(), createElementBlock("div", {
						key: item.id,
						class: "report-card",
						onClick: ($event) => handlePreview(item)
					}, [
						createBaseVNode("div", _hoisted_11, [createBaseVNode("div", { class: normalizeClass(["card-icon", "type-" + item.type]) }, [createVNode(_component_el_icon, { size: 28 }, {
							default: withCtx(() => [item.type === "chart" ? (openBlock(), createBlock(unref(data_line_default), { key: 0 })) : item.type === "table" ? (openBlock(), createBlock(unref(grid_default), { key: 1 })) : (openBlock(), createBlock(unref(data_analysis_default), { key: 2 }))]),
							_: 2
						}, 1024)], 2), createVNode(_component_el_dropdown, {
							trigger: "click",
							onCommand: (cmd) => handleCommand(cmd, item),
							onClick: _cache[2] || (_cache[2] = withModifiers(() => {}, ["stop"]))
						}, {
							dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
								default: withCtx(() => [
									createVNode(_component_el_dropdown_item, { command: "preview" }, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(view_default))]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.view")), 1)]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, { command: "edit" }, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(edit_default))]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, { command: "copy" }, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(copy_document_default))]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("report.copyReport")), 1)]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, { command: "subscribe" }, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(bell_default))]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("report.subscribe")), 1)]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, {
										command: "delete",
										divided: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(delete_default))]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)]),
										_: 1
									})
								]),
								_: 1
							})]),
							default: withCtx(() => [createVNode(_component_el_icon, { class: "card-more" }, {
								default: withCtx(() => [createVNode(unref(more_filled_default))]),
								_: 1
							})]),
							_: 1
						}, 8, ["onCommand"])]),
						createBaseVNode("div", _hoisted_12, [createBaseVNode("h3", _hoisted_13, toDisplayString(item.name), 1), createBaseVNode("div", _hoisted_14, [createVNode(_component_el_tag, {
							size: "small",
							type: "info"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(getCategoryLabel(item.category)), 1)]),
							_: 2
						}, 1024), createVNode(_component_el_tag, {
							size: "small",
							type: item.status === 1 ? "success" : "warning"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(item.status === 1 ? _ctx.$t("report.statusPublished") : _ctx.$t("report.statusDraft")), 1)]),
							_: 2
						}, 1032, ["type"])])]),
						createBaseVNode("div", _hoisted_15, [createBaseVNode("span", _hoisted_16, toDisplayString((_item$createTime = item.createTime) === null || _item$createTime === void 0 ? void 0 : _item$createTime.substring(0, 10)), 1)])
					], 8, _hoisted_10);
				}), 128))])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_17, [createVNode(_component_el_pagination, {
					"current-page": queryParams.pageNum,
					"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => queryParams.pageNum = $event),
					"page-size": queryParams.pageSize,
					"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => queryParams.pageSize = $event),
					total: total.value,
					"page-sizes": [
						12,
						24,
						48
					],
					layout: "total, sizes, prev, pager, next",
					onSizeChange: loadData,
					onCurrentChange: loadData
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])
			])]), createVNode(_component_el_dialog, {
				modelValue: subscribeVisible.value,
				"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => subscribeVisible.value = $event),
				title: _ctx.$t("report.subscribeReport"),
				width: "500px"
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[8] || (_cache[8] = ($event) => subscribeVisible.value = false) }, {
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
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => scheduleForm.cronExpression = $event),
								placeholder: "0 0 8 * * ?"
							}, null, 8, ["modelValue"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_form_item, { label: _ctx.$t("report.recipients") }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: scheduleForm.recipients,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => scheduleForm.recipients = $event),
								placeholder: _ctx.$t("report.recipients")
							}, null, 8, ["modelValue", "placeholder"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_form_item, { label: _ctx.$t("report.channel") }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: scheduleForm.channel,
								"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => scheduleForm.channel = $event)
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
			}, 8, ["modelValue", "title"])]);
		};
	}
}), [["__scopeId", "data-v-1758f636"]]);
//#endregion
export { list_default as default };

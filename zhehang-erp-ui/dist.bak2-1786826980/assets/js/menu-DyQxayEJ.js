import { $ as createCommentVNode, At as resolveDirective, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, jt as resolveDynamicComponent, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Er as withKeys, J as ElCol, M as ElInputNumber, Q as ElRadioGroup, V as ElDialog, X as ElRadio, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, u as ElTreeSelect, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as menuApi } from "./system-CuP08T_i.js";
import { t as IconPicker_default } from "./IconPicker-EsVze-xY.js";
//#region src/views/system/menu.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container" };
var _hoisted_2 = { class: "card-header" };
var _hoisted_3 = { class: "toolbar-btns" };
//#endregion
//#region src/views/system/menu.vue
var menu_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "menu",
	setup(__props) {
		const { t } = useI18n();
		const queryParams = reactive({
			menuName: "",
			status: void 0
		});
		const loading = ref(false);
		const menuList = ref([]);
		const isExpandAll = ref(true);
		const refreshTable = ref(true);
		const dialogVisible = ref(false);
		const dialogTitle = ref("");
		const formRef = ref();
		const submitLoading = ref(false);
		const menuOptions = ref([]);
		const form = reactive({
			id: void 0,
			parentId: 0,
			menuType: "M",
			menuName: "",
			orderNum: 0,
			path: "",
			component: "",
			perms: "",
			icon: "",
			status: 0,
			visible: 1
		});
		const rules = reactive({
			menuName: [{
				required: true,
				message: () => t("system.menu.menuNameRequired"),
				trigger: "blur"
			}],
			orderNum: [{
				required: true,
				message: () => t("system.menu.orderNumRequired"),
				trigger: "blur"
			}]
		});
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
					menuList.value = buildTree((yield menuApi.list(queryParams)).data || []);
				} finally {
					loading.value = false;
				}
			});
			return _getList.apply(this, arguments);
		}
		function buildTree(data, parentId = 0) {
			const tree = [];
			data.forEach((item) => {
				if (item.parentId === parentId) {
					const children = buildTree(data, item.id);
					if (children.length > 0) item.children = children;
					tree.push(item);
				}
			});
			return tree.sort((a, b) => (a.orderNum || 0) - (b.orderNum || 0));
		}
		function handleQuery() {
			getList();
		}
		function resetQuery() {
			queryParams.menuName = "";
			queryParams.status = void 0;
			getList();
		}
		function toggleExpandAll() {
			refreshTable.value = false;
			isExpandAll.value = !isExpandAll.value;
			nextTick(() => {
				refreshTable.value = true;
			});
		}
		function loadMenuOptions() {
			return _loadMenuOptions.apply(this, arguments);
		}
		function _loadMenuOptions() {
			_loadMenuOptions = _asyncToGenerator(function* () {
				try {
					const res = yield menuApi.treeselect();
					menuOptions.value = [{
						id: 0,
						label: t("system.menu.rootMenu"),
						children: res.data || []
					}];
				} catch (_e) {
					menuOptions.value = [{
						id: 0,
						label: t("system.menu.rootMenu"),
						children: []
					}];
				}
			});
			return _loadMenuOptions.apply(this, arguments);
		}
		function handleAdd(row) {
			resetForm();
			loadMenuOptions();
			dialogTitle.value = t("common.add");
			if (row) form.parentId = row.id;
			dialogVisible.value = true;
		}
		function handleEdit(_x) {
			return _handleEdit.apply(this, arguments);
		}
		function _handleEdit() {
			_handleEdit = _asyncToGenerator(function* (row) {
				resetForm();
				loadMenuOptions();
				dialogTitle.value = t("common.edit");
				try {
					const res = yield menuApi.detail(row.id);
					Object.assign(form, res.data);
				} catch (_e) {}
				dialogVisible.value = true;
			});
			return _handleEdit.apply(this, arguments);
		}
		function handleDelete(row) {
			ElMessageBox.confirm(t("system.menu.deleteConfirm"), t("common.warning"), {
				confirmButtonText: t("common.confirm"),
				cancelButtonText: t("common.cancel"),
				type: "warning"
			}).then(_asyncToGenerator(function* () {
				yield menuApi.remove(row.id);
				ElMessage.success(t("common.success"));
				getList();
			})).catch(() => {});
		}
		function submitForm() {
			return _submitForm.apply(this, arguments);
		}
		function _submitForm() {
			_submitForm = _asyncToGenerator(function* () {
				if (!formRef.value) return;
				yield formRef.value.validate();
				submitLoading.value = true;
				try {
					if (form.id) yield menuApi.update(form);
					else yield menuApi.create(form);
					ElMessage.success(t("common.success"));
					dialogVisible.value = false;
					getList();
				} finally {
					submitLoading.value = false;
				}
			});
			return _submitForm.apply(this, arguments);
		}
		function resetForm() {
			form.id = void 0;
			form.parentId = 0;
			form.menuType = "M";
			form.menuName = "";
			form.orderNum = 0;
			form.path = "";
			form.component = "";
			form.perms = "";
			form.icon = "";
			form.status = 0;
			form.visible = 1;
		}
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_Search = resolveComponent("Search");
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_Refresh = resolveComponent("Refresh");
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			const _component_Plus = resolveComponent("Plus");
			const _component_Sort = resolveComponent("Sort");
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_Edit = resolveComponent("Edit");
			const _component_Delete = resolveComponent("Delete");
			const _component_el_table = ElTable;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_input_number = ElInputNumber;
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
								label: _ctx.$t("system.menu.menuName"),
								prop: "menuName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.menuName,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.menuName = $event),
									placeholder: _ctx.$t("common.inputPlaceholder"),
									clearable: "",
									onKeyup: withKeys(handleQuery, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("system.menu.status"),
								prop: "status"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: queryParams.status,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.status = $event),
									placeholder: _ctx.$t("common.selectPlaceholder"),
									clearable: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: _ctx.$t("common.enabled"),
										value: 0
									}, null, 8, ["label"]), createVNode(_component_el_option, {
										label: _ctx.$t("common.disabled"),
										value: 1
									}, null, 8, ["label"])]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
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
					header: withCtx(() => [createBaseVNode("div", _hoisted_2, [createBaseVNode("span", null, toDisplayString(_ctx.$t("system.menu.title")), 1), createBaseVNode("div", _hoisted_3, [withDirectives((openBlock(), createBlock(_component_el_button, {
						type: "primary",
						onClick: _cache[2] || (_cache[2] = ($event) => handleAdd())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_Plus)]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.add")), 1)]),
						_: 1
					})), [[_directive_hasPermi, ["system:menu:add"]]]), createVNode(_component_el_button, {
						type: "info",
						onClick: toggleExpandAll
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_Sort)]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.expandCollapse")), 1)]),
						_: 1
					})])])]),
					default: withCtx(() => [refreshTable.value ? withDirectives((openBlock(), createBlock(_component_el_table, {
						key: 0,
						data: menuList.value,
						border: "",
						"row-key": "id",
						"default-expand-all": isExpandAll.value,
						"tree-props": { children: "children" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.menu.menuName"),
								prop: "menuName",
								"min-width": "180"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.menu.icon"),
								prop: "icon",
								width: "80",
								align: "center"
							}, {
								default: withCtx(({ row }) => [row.icon ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
									default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(row.icon)))]),
									_: 2
								}, 1024)) : createCommentVNode("", true)]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.menu.orderNum"),
								prop: "orderNum",
								width: "80",
								align: "center"
							}, null, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.menu.status"),
								prop: "status",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.status === 0 ? "success" : "danger" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.status === 0 ? _ctx.$t("common.enabled") : _ctx.$t("common.disabled")), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("system.menu.visible"),
								prop: "visible",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.visible === 1 ? "success" : "info" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.visible === 1 ? _ctx.$t("system.menu.show") : _ctx.$t("system.menu.hide")), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_table_column, {
								label: _ctx.$t("common.operation"),
								width: "200",
								align: "center",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [
									withDirectives((openBlock(), createBlock(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => handleAdd(row)
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_Plus)]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.add")), 1)]),
										_: 1
									}, 8, ["onClick"])), [[_directive_hasPermi, ["system:menu:add"]]]),
									withDirectives((openBlock(), createBlock(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => handleEdit(row)
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_Edit)]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
										_: 1
									}, 8, ["onClick"])), [[_directive_hasPermi, ["system:menu:edit"]]]),
									withDirectives((openBlock(), createBlock(_component_el_button, {
										link: "",
										type: "danger",
										onClick: ($event) => handleDelete(row)
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(_component_Delete)]),
											_: 1
										}), createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)]),
										_: 1
									}, 8, ["onClick"])), [[_directive_hasPermi, ["system:menu:remove"]]])
								]),
								_: 1
							}, 8, ["label"])
						]),
						_: 1
					}, 8, ["data", "default-expand-all"])), [[_directive_loading, loading.value]]) : createCommentVNode("", true)]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => dialogVisible.value = $event),
					title: dialogTitle.value,
					width: "700px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[13] || (_cache[13] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitForm,
						loading: submitLoading.value
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form,
						rules,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_row, { gutter: 20 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.parentMenu"),
										prop: "parentId"
									}, {
										default: withCtx(() => [createVNode(_component_el_tree_select, {
											modelValue: form.parentId,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.parentId = $event),
											data: menuOptions.value,
											props: {
												label: "label",
												children: "children",
												value: "id"
											},
											placeholder: _ctx.$t("common.selectPlaceholder"),
											"check-strictly": "",
											filterable: ""
										}, null, 8, [
											"modelValue",
											"data",
											"placeholder"
										])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 20 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.menuType"),
										prop: "menuType"
									}, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: form.menuType,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.menuType = $event)
										}, {
											default: withCtx(() => [
												createVNode(_component_el_radio, { value: "M" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("system.menu.typeDir")), 1)]),
													_: 1
												}),
												createVNode(_component_el_radio, { value: "C" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("system.menu.typeMenu")), 1)]),
													_: 1
												}),
												createVNode(_component_el_radio, { value: "F" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("system.menu.typeBtn")), 1)]),
													_: 1
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 20 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.menuName"),
										prop: "menuName"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.menuName,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.menuName = $event),
											placeholder: _ctx.$t("common.inputPlaceholder")
										}, null, 8, ["modelValue", "placeholder"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.orderNum"),
										prop: "orderNum"
									}, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.orderNum,
											"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.orderNum = $event),
											min: 0
										}, null, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							}),
							form.menuType !== "F" ? (openBlock(), createBlock(_component_el_row, {
								key: 0,
								gutter: 20
							}, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.path"),
										prop: "path"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.path,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.path = $event),
											placeholder: _ctx.$t("common.inputPlaceholder")
										}, null, 8, ["modelValue", "placeholder"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								}), form.menuType === "C" ? (openBlock(), createBlock(_component_el_col, {
									key: 0,
									span: 12
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.component"),
										prop: "component"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.component,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.component = $event),
											placeholder: _ctx.$t("common.inputPlaceholder")
										}, null, 8, ["modelValue", "placeholder"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})) : createCommentVNode("", true)]),
								_: 1
							})) : createCommentVNode("", true),
							form.menuType !== "M" ? (openBlock(), createBlock(_component_el_row, {
								key: 1,
								gutter: 20
							}, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: _ctx.$t("system.menu.perms"),
										prop: "perms"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.perms,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.perms = $event),
											placeholder: _ctx.$t("system.menu.permsPlaceholder")
										}, null, 8, ["modelValue", "placeholder"])]),
										_: 1
									}, 8, ["label"])]),
									_: 1
								})]),
								_: 1
							})) : createCommentVNode("", true),
							form.menuType !== "F" ? (openBlock(), createBlock(_component_el_row, {
								key: 2,
								gutter: 20
							}, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: _ctx.$t("system.menu.icon"),
											prop: "icon"
										}, {
											default: withCtx(() => [createVNode(IconPicker_default, {
												modelValue: form.icon,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.icon = $event),
												mode: "element",
												columns: 6,
												"panel-width": 420,
												placeholder: "请选择菜单图标，也可输入图标组件名"
											}, null, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: _ctx.$t("system.menu.status"),
											prop: "status"
										}, {
											default: withCtx(() => [createVNode(_component_el_radio_group, {
												modelValue: form.status,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.status = $event)
											}, {
												default: withCtx(() => [createVNode(_component_el_radio, { value: 0 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.enabled")), 1)]),
													_: 1
												}), createVNode(_component_el_radio, { value: 1 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.disabled")), 1)]),
													_: 1
												})]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: _ctx.$t("system.menu.visible"),
											prop: "visible"
										}, {
											default: withCtx(() => [createVNode(_component_el_radio_group, {
												modelValue: form.visible,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.visible = $event)
											}, {
												default: withCtx(() => [createVNode(_component_el_radio, { value: 1 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("system.menu.show")), 1)]),
													_: 1
												}), createVNode(_component_el_radio, { value: 0 }, {
													default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("system.menu.hide")), 1)]),
													_: 1
												})]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										}, 8, ["label"])]),
										_: 1
									})
								]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["model", "rules"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-9c9b52c1"]]);
//#endregion
export { menu_default as default };

import { Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Er as withKeys, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, V as ElDialog, X as ElRadio, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as postApi } from "./org-DaVetSL-.js";
//#region src/views/org/post.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "page-container" };
var _hoisted_2 = { class: "search-bar" };
var _hoisted_3 = { class: "pagination-wrap" };
//#endregion
//#region src/views/org/post.vue
var post_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "post",
	setup(__props) {
		const { t } = useI18n();
		const formRef = ref();
		const loading = ref(false);
		const tableData = ref([]);
		const total = ref(0);
		const dialogVisible = ref(false);
		const dialogTitle = ref("");
		const isEdit = ref(false);
		const queryParams = reactive({
			pageNum: 1,
			pageSize: 10,
			postName: "",
			status: void 0
		});
		const formData = ref({
			id: void 0,
			postCode: "",
			postName: "",
			sort: 0,
			headcount: 0,
			responsibilities: "",
			status: 0
		});
		const rules = { postName: [{
			required: true,
			message: t("org.inputPostName"),
			trigger: "blur"
		}] };
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = (yield postApi.list(queryParams)).data;
					tableData.value = data.records || data.list || [];
					total.value = data.total || 0;
				} catch (e) {} finally {
					loading.value = false;
				}
			});
			return function loadData() {
				return _ref.apply(this, arguments);
			};
		}();
		const handleSearch = () => {
			queryParams.pageNum = 1;
			loadData();
		};
		const handleReset = () => {
			queryParams.postName = "";
			queryParams.status = void 0;
			handleSearch();
		};
		const handleAdd = () => {
			isEdit.value = false;
			dialogTitle.value = t("org.addPost");
			formData.value = {
				id: void 0,
				postCode: "",
				postName: "",
				sort: 0,
				headcount: 0,
				responsibilities: "",
				status: 0
			};
			dialogVisible.value = true;
		};
		const handleEdit = (row) => {
			isEdit.value = true;
			dialogTitle.value = t("org.editPost");
			formData.value = _objectSpread2({}, row);
			dialogVisible.value = true;
		};
		const handleDelete = (row) => {
			ElMessageBox.confirm(t("org.confirmDeletePost"), t("common.confirm"), { type: "warning" }).then(_asyncToGenerator(function* () {
				yield postApi.remove(row.id);
				ElMessage.success(t("common.success"));
				loadData();
			})).catch(() => {});
		};
		const submitForm = function() {
			var _ref2 = _asyncToGenerator(function* () {
				var _formRef$value;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				try {
					if (isEdit.value) yield postApi.update(formData.value);
					else yield postApi.create(formData.value);
					ElMessage.success(t("common.success"));
					dialogVisible.value = false;
					loadData();
				} catch (e) {}
			});
			return function submitForm() {
				return _ref2.apply(this, arguments);
			};
		}();
		loadData();
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_form = ElForm;
			const _component_el_icon = ElIcon;
			const _component_el_card = ElCard;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_input_number = ElInputNumber;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(_component_el_card, {
					shadow: "never",
					class: "search-card"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_2, [createVNode(_component_el_form, {
						model: queryParams,
						inline: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: _ctx.$t("org.postName") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.postName,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.postName = $event),
									placeholder: _ctx.$t("org.inputPostName"),
									clearable: "",
									onKeyup: withKeys(handleSearch, ["enter"])
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.status") }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: queryParams.status,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.status = $event),
									placeholder: _ctx.$t("org.selectStatus"),
									clearable: "",
									style: { "width": "120px" }
								}, {
									default: withCtx(() => [createVNode(_component_el_option, {
										label: _ctx.$t("org.statusNormal"),
										value: 0
									}, null, 8, ["label"]), createVNode(_component_el_option, {
										label: _ctx.$t("org.statusDisabled"),
										value: 1
									}, null, 8, ["label"])]),
									_: 1
								}, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									onClick: handleSearch
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.search")), 1)]),
									_: 1
								}), createVNode(_component_el_button, { onClick: handleReset }, {
									default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.reset")), 1)]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"]), createVNode(_component_el_button, {
						type: "primary",
						onClick: handleAdd
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), createTextVNode(toDisplayString(_ctx.$t("common.add")), 1)]),
						_: 1
					})])]),
					_: 1
				}),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: tableData.value,
					stripe: "",
					border: ""
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "postName",
							label: _ctx.$t("org.postName"),
							"min-width": "150"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "headcount",
							label: _ctx.$t("org.headcount"),
							width: "100",
							align: "center"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "sort",
							label: _ctx.$t("org.sort"),
							width: "80",
							align: "center"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "status",
							label: _ctx.$t("org.status"),
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: row.status === 0 ? "success" : "danger",
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.status === 0 ? _ctx.$t("org.statusNormal") : _ctx.$t("org.statusDisabled")), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "createTime",
							label: _ctx.$t("org.createTime"),
							width: "170"
						}, null, 8, ["label"]),
						createVNode(_component_el_table_column, {
							label: _ctx.$t("org.actions"),
							width: "160",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								type: "primary",
								link: "",
								size: "small",
								onClick: ($event) => handleEdit(row)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.edit")), 1)]),
								_: 1
							}, 8, ["onClick"]), createVNode(_component_el_button, {
								type: "danger",
								link: "",
								size: "small",
								onClick: ($event) => handleDelete(row)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.delete")), 1)]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						}, 8, ["label"])
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_3, [createVNode(_component_el_pagination, {
					"current-page": queryParams.pageNum,
					"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => queryParams.pageNum = $event),
					"page-size": queryParams.pageSize,
					"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => queryParams.pageSize = $event),
					total: total.value,
					"page-sizes": [
						10,
						20,
						50
					],
					layout: "total, sizes, prev, pager, next, jumper",
					onSizeChange: loadData,
					onCurrentChange: loadData
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])]),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => dialogVisible.value = $event),
					title: dialogTitle.value,
					width: "760px",
					class: "post-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitForm
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: formData.value,
						rules,
						"label-width": "112px",
						class: "post-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: _ctx.$t("org.postName"),
								prop: "postName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: formData.value.postName,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => formData.value.postName = $event),
									placeholder: _ctx.$t("org.inputPostName")
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, {
								label: _ctx.$t("org.sort"),
								prop: "sort"
							}, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: formData.value.sort,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => formData.value.sort = $event),
									min: 0,
									"controls-position": "right"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.headcount") }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: formData.value.headcount,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => formData.value.headcount = $event),
									min: 0,
									"controls-position": "right"
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.responsibilities") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: formData.value.responsibilities,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => formData.value.responsibilities = $event),
									type: "textarea",
									rows: 7,
									placeholder: _ctx.$t("org.inputResponsibilities")
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: _ctx.$t("org.status") }, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: formData.value.status,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => formData.value.status = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { value: 0 }, {
										default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.statusNormal")), 1)]),
										_: 1
									}), createVNode(_component_el_radio, { value: 1 }, {
										default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("org.statusDisabled")), 1)]),
										_: 1
									})]),
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
}), [["__scopeId", "data-v-87cbfb5c"]]);
//#endregion
export { post_default as default };

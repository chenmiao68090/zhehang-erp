import { Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { F as ElEmpty, Nn as plus_default, Qt as document_default, Un as search_default, V as ElDialog, _ as ElTableColumn, _t as ElFormItem, en as edit_default, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as contractMgmtApi } from "./contract-mgmt-Dk4ZOG47.js";
//#region src/views/order/contract-template.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ct-page" };
var _hoisted_2 = { class: "ct-header" };
var _hoisted_3 = { class: "ct-header__title" };
var _hoisted_4 = { class: "ct-header__actions" };
//#endregion
//#region src/views/order/contract-template.vue
var contract_template_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "contract-template",
	setup(__props) {
		const SERVICE_TYPES = [
			{
				value: "bookkeeping",
				label: "代理记账"
			},
			{
				value: "registration",
				label: "公司注册"
			},
			{
				value: "tax_planning",
				label: "税务筹划"
			},
			{
				value: "qualification",
				label: "资质办理"
			},
			{
				value: "audit",
				label: "审计验资"
			},
			{
				value: "cancellation",
				label: "公司注销"
			},
			{
				value: "other",
				label: "其他"
			}
		];
		function serviceTypeLabel(v) {
			var _SERVICE_TYPES$find;
			return ((_SERVICE_TYPES$find = SERVICE_TYPES.find((o) => o.value === v)) === null || _SERVICE_TYPES$find === void 0 ? void 0 : _SERVICE_TYPES$find.label) || v || "其他";
		}
		const loading = ref(false);
		const saving = ref(false);
		const list = ref([]);
		const keyword = ref("");
		const filteredList = computed(() => {
			const kw = keyword.value.trim().toLowerCase();
			if (!kw) return list.value;
			return list.value.filter((t) => (t.templateName || "").toLowerCase().includes(kw) || (t.templateCode || "").toLowerCase().includes(kw));
		});
		function loadTemplates() {
			return _loadTemplates.apply(this, arguments);
		}
		function _loadTemplates() {
			_loadTemplates = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					list.value = yield contractMgmtApi.getTemplates();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "模板加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _loadTemplates.apply(this, arguments);
		}
		const dialogVisible = ref(false);
		const formRef = ref();
		const emptyForm = () => ({
			templateName: "",
			serviceType: "bookkeeping",
			templateCode: "",
			templateContent: "",
			version: "v1.0",
			enabled: true
		});
		const form = ref(emptyForm());
		const rules = {
			templateName: [{
				required: true,
				message: "请输入模板名称",
				trigger: "blur"
			}],
			serviceType: [{
				required: true,
				message: "请选择服务类型",
				trigger: "change"
			}],
			templateContent: [{
				required: true,
				message: "请输入模板内容",
				trigger: "blur"
			}]
		};
		function openCreate() {
			form.value = emptyForm();
			dialogVisible.value = true;
		}
		function openEdit(row) {
			form.value = _objectSpread2({}, row);
			dialogVisible.value = true;
		}
		function handleSave() {
			return _handleSave.apply(this, arguments);
		}
		function _handleSave() {
			_handleSave = _asyncToGenerator(function* () {
				var _formRef$value;
				yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate(function() {
					var _ref = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						saving.value = true;
						try {
							yield contractMgmtApi.saveTemplate(form.value);
							ElMessage.success("保存成功");
							dialogVisible.value = false;
							yield loadTemplates();
						} catch (e) {
							ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "保存失败");
						} finally {
							saving.value = false;
						}
					});
					return function(_x) {
						return _ref.apply(this, arguments);
					};
				}());
			});
			return _handleSave.apply(this, arguments);
		}
		onMounted(loadTemplates);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(document_default))]),
					_: 1
				}), _cache[9] || (_cache[9] = createBaseVNode("span", null, "合同模板管理", -1))]), createBaseVNode("div", _hoisted_4, [createVNode(_component_el_input, {
					modelValue: keyword.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
					placeholder: "搜索模板名称/编码",
					clearable: "",
					style: { "width": "220px" },
					"prefix-icon": unref(search_default)
				}, null, 8, ["modelValue", "prefix-icon"]), createVNode(_component_el_button, {
					type: "primary",
					icon: unref(plus_default),
					onClick: openCreate
				}, {
					default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("新建模板", -1)])]),
					_: 1
				}, 8, ["icon"])])]),
				createVNode(_component_el_alert, {
					type: "info",
					closable: false,
					"show-icon": "",
					title: "提单中心设置 · 合同模板",
					description: "此处维护各服务类型的标准合同模板;新建/续签合同时按服务类型自动带出对应模板。修改会即时影响后续新合同。",
					style: { "margin-bottom": "16px" }
				}),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: filteredList.value,
					border: "",
					stripe: "",
					style: { "width": "100%" }
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, { description: "暂无合同模板,点击右上角『新建模板』添加" })]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "templateName",
							label: "模板名称",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "服务类型",
							width: "120"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								effect: "light"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(serviceTypeLabel(row.serviceType)), 1)]),
								_: 2
							}, 1024)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "templateCode",
							label: "模板编码",
							width: "140",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "version",
							label: "版本",
							width: "90"
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "90"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: row.enabled ? "success" : "info",
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "启用" : "禁用"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "updateTime",
							label: "更新时间",
							width: "170"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "120",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								link: "",
								type: "primary",
								icon: unref(edit_default),
								onClick: ($event) => openEdit(row)
							}, {
								default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("编辑", -1)])]),
								_: 1
							}, 8, ["icon", "onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => dialogVisible.value = $event),
					title: form.value.id ? "编辑合同模板" : "新建合同模板",
					width: "640px",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[7] || (_cache[7] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: saving.value,
						onClick: handleSave
					}, {
						default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form.value,
						rules,
						"label-width": "90px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "模板名称",
								prop: "templateName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.templateName,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.value.templateName = $event),
									placeholder: "如:代理记账服务合同",
									maxlength: "60",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "服务类型",
								prop: "serviceType"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.value.serviceType,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.value.serviceType = $event),
									placeholder: "请选择服务类型",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SERVICE_TYPES, (opt) => {
										return createVNode(_component_el_option, {
											key: opt.value,
											label: opt.label,
											value: opt.value
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "模板编码" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.templateCode,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.value.templateCode = $event),
									placeholder: "选填,如 TPL_BOOKKEEPING(留空自动生成)",
									maxlength: "40"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "版本" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.version,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.version = $event),
									placeholder: "如 v1.0",
									style: { "width": "160px" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "启用" }, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: form.value.enabled,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.enabled = $event)
								}, null, 8, ["modelValue"]), _cache[12] || (_cache[12] = createBaseVNode("span", { class: "ct-hint" }, "禁用后新建合同时不再可选此模板", -1))]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "模板内容",
								prop: "templateContent"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.templateContent,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.templateContent = $event),
									type: "textarea",
									rows: 10,
									placeholder: "合同正文,可用 {甲方}、{乙方}、{金额}、{起始日}、{到期日} 等变量占位"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-aa71980c"]]);
//#endregion
export { contract_template_default as default };

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, F as ElEmpty, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, Un as search_default, V as ElDialog, X as ElRadio, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as unwrapGovernanceData, t as settingsGovernanceApi } from "./settings-governance-qdMEMNS_.js";
//#region src/api/dict.ts
var dictDataApi = {
	/** 某类型下全部字典项(管理用,含停用) */
	list: (dictType) => get(`/system/dict/data/list/${dictType}`),
	detail: (id) => get(`/system/dict/data/${id}`),
	create: (data) => post("/system/dict/data", data),
	update: (data) => put("/system/dict/data", data),
	remove: (id) => del(`/system/dict/data/${id}`)
};
//#endregion
//#region src/views/system/field-mapping.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "governance-page" };
var _hoisted_2 = { class: "page-heading" };
var _hoisted_3 = { class: "toolbar" };
var _hoisted_4 = { class: "primary-title" };
var _hoisted_5 = { class: "secondary-text" };
var _hoisted_6 = { class: "chip-row" };
var _hoisted_7 = { class: "secondary-text" };
var _hoisted_8 = { class: "secondary-text" };
var _hoisted_9 = { class: "primary-title" };
var _hoisted_10 = { class: "secondary-text" };
var _hoisted_11 = { key: 0 };
var _hoisted_12 = { class: "tag-gap" };
var _hoisted_13 = { class: "secondary-text" };
var _hoisted_14 = { class: "secondary-text" };
var _hoisted_15 = {
	key: 0,
	class: "warning-text"
};
var _hoisted_16 = {
	key: 2,
	class: "secondary-text"
};
var _hoisted_17 = { class: "options-layout" };
var _hoisted_18 = { class: "field-list" };
var _hoisted_19 = { class: "field-list-scroll" };
var _hoisted_20 = ["onClick"];
var _hoisted_21 = { class: "option-panel" };
var _hoisted_22 = { class: "option-head" };
var _hoisted_23 = { class: "option-title" };
var _hoisted_24 = { class: "field-facts" };
var _hoisted_25 = { key: 1 };
var _hoisted_26 = {
	key: 3,
	class: "safe-note"
};
//#endregion
//#region src/views/system/field-mapping.vue
var field_mapping_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "field-mapping",
	setup(__props) {
		const router = useRouter();
		const activeTab = ref("catalog");
		const loading = ref(false);
		const loadError = ref("");
		const fields = ref([]);
		const keyword = ref("");
		const module = ref("");
		const sourceKind = ref("");
		const integration = ref("");
		const optionKeyword = ref("");
		const selectedField = ref(null);
		const optionsLoading = ref(false);
		const optionsConfigured = ref(false);
		const optionItems = ref([]);
		const optionError = ref("");
		let optionsRequestVersion = 0;
		const sourceOptions = [
			{
				value: "DICTIONARY",
				label: "受控选项目录"
			},
			{
				value: "CODE_CATALOG",
				label: "代码目录"
			},
			{
				value: "STATE_MACHINE",
				label: "业务状态机"
			},
			{
				value: "ENTITY",
				label: "业务实体"
			},
			{
				value: "MIXED",
				label: "多来源待映射"
			},
			{
				value: "PROCESS_VERSION",
				label: "流程版本"
			},
			{
				value: "EXTERNAL_PROTOCOL",
				label: "第三方协议"
			}
		];
		const integrationOptions = [
			{
				value: "CONNECTED",
				label: "已接入"
			},
			{
				value: "PENDING",
				label: "待接入"
			},
			{
				value: "READ_ONLY",
				label: "只读"
			},
			{
				value: "DOMAIN_MANAGED",
				label: "领域维护"
			}
		];
		const moduleOptions = computed(() => {
			const map = /* @__PURE__ */ new Map();
			fields.value.forEach((item) => map.set(item.moduleCode, item.moduleName));
			return [...map.entries()].map(([value, label]) => ({
				value,
				label
			}));
		});
		const filteredFields = computed(() => {
			const query = keyword.value.trim().toLowerCase();
			return fields.value.filter((item) => {
				if (module.value && item.moduleCode !== module.value) return false;
				if (sourceKind.value && item.sourceKind !== sourceKind.value) return false;
				if (integration.value && item.integrationState !== integration.value) return false;
				if (!query) return true;
				return [
					item.name,
					item.key,
					item.moduleName,
					item.storageField,
					item.sourceName,
					item.dictType,
					...item.pageNames || [],
					...item.pageRoutes || []
				].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
			});
		});
		const optionFields = computed(() => {
			const query = optionKeyword.value.trim().toLowerCase();
			return fields.value.filter((item) => {
				if (![
					"SELECT",
					"SELECT_MULTI",
					"DYNAMIC_SELECT",
					"ENTITY_SELECT",
					"TREE_SELECT",
					"MIXED"
				].includes(item.controlType)) return false;
				return !query || [
					item.name,
					item.sourceName,
					item.dictType,
					item.moduleName
				].filter(Boolean).some((value) => String(value).toLowerCase().includes(query));
			});
		});
		function loadFields() {
			return _loadFields.apply(this, arguments);
		}
		function _loadFields() {
			_loadFields = _asyncToGenerator(function* () {
				loading.value = true;
				loadError.value = "";
				try {
					fields.value = [...unwrapGovernanceData(yield settingsGovernanceApi.fields()) || []].sort((a, b) => {
						var _a$sort, _b$sort;
						return ((_a$sort = a.sort) !== null && _a$sort !== void 0 ? _a$sort : 9999) - ((_b$sort = b.sort) !== null && _b$sort !== void 0 ? _b$sort : 9999);
					});
					if (selectedField.value) selectedField.value = fields.value.find((item) => {
						var _selectedField$value;
						return item.key === ((_selectedField$value = selectedField.value) === null || _selectedField$value === void 0 ? void 0 : _selectedField$value.key);
					}) || null;
				} catch (error) {
					fields.value = [];
					loadError.value = (error === null || error === void 0 ? void 0 : error.message) || "字段目录加载失败";
				} finally {
					loading.value = false;
				}
			});
			return _loadFields.apply(this, arguments);
		}
		function isMaintainableCatalog(field) {
			return (field === null || field === void 0 ? void 0 : field.sourceKind) === "DICTIONARY" && field.integrationState === "CONNECTED" && field.editPolicy === "ADD_DISABLE_LOCK_VALUE" && Boolean(field.dictType);
		}
		function selectField(_x) {
			return _selectField.apply(this, arguments);
		}
		function _selectField() {
			_selectField = _asyncToGenerator(function* (field) {
				selectedField.value = field;
				yield loadSelectedOptions();
			});
			return _selectField.apply(this, arguments);
		}
		function openOptions(_x2) {
			return _openOptions.apply(this, arguments);
		}
		function _openOptions() {
			_openOptions = _asyncToGenerator(function* (field) {
				activeTab.value = "options";
				yield selectField(field);
			});
			return _openOptions.apply(this, arguments);
		}
		function loadSelectedOptions() {
			return _loadSelectedOptions.apply(this, arguments);
		}
		function _loadSelectedOptions() {
			_loadSelectedOptions = _asyncToGenerator(function* () {
				const version = ++optionsRequestVersion;
				const field = selectedField.value;
				optionItems.value = [];
				optionError.value = "";
				optionsConfigured.value = false;
				if (!(field === null || field === void 0 ? void 0 : field.dictType)) {
					optionsLoading.value = false;
					return;
				}
				const isCurrentRequest = () => {
					var _selectedField$value2;
					return version === optionsRequestVersion && ((_selectedField$value2 = selectedField.value) === null || _selectedField$value2 === void 0 ? void 0 : _selectedField$value2.key) === field.key;
				};
				optionsLoading.value = true;
				try {
					const payload = unwrapGovernanceData(yield settingsGovernanceApi.options(field.dictType));
					if (!isCurrentRequest()) return;
					const nextConfigured = payload.configured === true;
					let nextItems = [];
					if (!payload.configured) {
						optionsConfigured.value = false;
						optionItems.value = [];
						return;
					}
					if (isMaintainableCatalog(field)) {
						const adminResponse = yield dictDataApi.list(field.dictType);
						if (!isCurrentRequest()) return;
						nextItems = ((adminResponse === null || adminResponse === void 0 ? void 0 : adminResponse.data) || adminResponse || []).map((item) => ({
							id: item.id,
							label: item.dictLabel,
							value: item.dictValue,
							sort: item.dictSort,
							defaultValue: item.isDefault === 1,
							enabled: item.status !== 1,
							remark: item.remark
						}));
					} else nextItems = payload.items || [];
					if (!isCurrentRequest()) return;
					optionsConfigured.value = nextConfigured;
					optionItems.value = nextItems;
				} catch (error) {
					if (isCurrentRequest()) optionError.value = (error === null || error === void 0 ? void 0 : error.message) || "选项加载失败";
				} finally {
					if (isCurrentRequest()) optionsLoading.value = false;
				}
			});
			return _loadSelectedOptions.apply(this, arguments);
		}
		function openManageRoute(route) {
			if (route === "/sys-flow/field-mapping") {
				activeTab.value = "options";
				return;
			}
			if (route === null || route === void 0 ? void 0 : route.startsWith("/")) router.push(route);
		}
		function readonlyReason(field) {
			if (field.sourceKind === "ENTITY") return "人员、部门、角色、客户和账户必须通过对应业务实体维护，并继续执行租户与数据范围校验。";
			if (field.sourceKind === "STATE_MACHINE") return "状态只能由真实业务动作推进，不能把状态码当普通选项增删。";
			if (field.sourceKind === "PROCESS_VERSION") return "流程选项随已发布版本留档，不能修改在途实例。";
			if (field.sourceKind === "EXTERNAL_PROTOCOL") return "第三方协议码由供应商契约决定，只能提供中文展示。";
			if (field.integrationState === "PENDING") return "该字段仍在代码常量或多来源阶段，本批只登记影响，不冒充已接入。";
			return "当前来源不满足“受控字典 + 已接入 + 锁定存储值”三项条件，因此失败收紧为只读。";
		}
		const optionDialogVisible = ref(false);
		const optionFormRef = ref();
		const saving = ref(false);
		const optionForm = reactive({
			dictType: "",
			dictLabel: "",
			dictValue: "",
			dictSort: 0,
			isDefault: 0,
			status: 0,
			remark: ""
		});
		const optionRules = {
			dictLabel: [{
				required: true,
				message: "请输入展示名称",
				trigger: "blur"
			}],
			dictValue: [{
				required: true,
				message: "请输入稳定存储值",
				trigger: "blur"
			}, {
				pattern: /^[^\s,，]+$/,
				message: "存储值不能包含空格或逗号",
				trigger: "blur"
			}]
		};
		function resetOptionForm(row) {
			var _row$id, _selectedField$value3, _row$sort;
			Object.assign(optionForm, {
				id: (_row$id = row === null || row === void 0 ? void 0 : row.id) !== null && _row$id !== void 0 ? _row$id : void 0,
				dictType: ((_selectedField$value3 = selectedField.value) === null || _selectedField$value3 === void 0 ? void 0 : _selectedField$value3.dictType) || "",
				dictLabel: (row === null || row === void 0 ? void 0 : row.label) || "",
				dictValue: (row === null || row === void 0 ? void 0 : row.value) || "",
				dictSort: (_row$sort = row === null || row === void 0 ? void 0 : row.sort) !== null && _row$sort !== void 0 ? _row$sort : optionItems.value.length + 1,
				isDefault: (row === null || row === void 0 ? void 0 : row.defaultValue) ? 1 : 0,
				status: row ? row.enabled ? 0 : 1 : 0,
				remark: (row === null || row === void 0 ? void 0 : row.remark) || ""
			});
		}
		function openCreateOption() {
			if (!isMaintainableCatalog(selectedField.value) || !optionsConfigured.value) return;
			resetOptionForm();
			optionDialogVisible.value = true;
		}
		function openEditOption(row) {
			if (!isMaintainableCatalog(selectedField.value)) return;
			resetOptionForm(row);
			optionDialogVisible.value = true;
		}
		function saveOption() {
			return _saveOption.apply(this, arguments);
		}
		function _saveOption() {
			_saveOption = _asyncToGenerator(function* () {
				var _optionFormRef$value;
				if (!isMaintainableCatalog(selectedField.value) || !optionsConfigured.value) return;
				if (!(yield (_optionFormRef$value = optionFormRef.value) === null || _optionFormRef$value === void 0 ? void 0 : _optionFormRef$value.validate().catch(() => false))) return;
				saving.value = true;
				try {
					if (optionForm.id) yield dictDataApi.update(_objectSpread2({}, optionForm));
					else yield dictDataApi.create(_objectSpread2({}, optionForm));
					ElMessage.success("选项已保存；已保存的存储值保持不变");
					optionDialogVisible.value = false;
					yield loadSelectedOptions();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "保存失败");
				} finally {
					saving.value = false;
				}
			});
			return _saveOption.apply(this, arguments);
		}
		function toggleOption(_x3) {
			return _toggleOption.apply(this, arguments);
		}
		function _toggleOption() {
			_toggleOption = _asyncToGenerator(function* (row) {
				if (!row.id || !isMaintainableCatalog(selectedField.value)) return;
				const nextEnabled = !row.enabled;
				try {
					yield ElMessageBox.confirm(nextEnabled ? `重新启用“${row.label}”供新记录选择？` : `停用“${row.label}”后，新记录不可选择，历史值仍保留。确认停用？`, nextEnabled ? "启用选项" : "停用选项", { type: nextEnabled ? "info" : "warning" });
				} catch (_unused) {
					return;
				}
				try {
					var _row$sort2;
					yield dictDataApi.update({
						id: row.id,
						dictType: selectedField.value.dictType,
						dictLabel: row.label,
						dictValue: row.value,
						dictSort: (_row$sort2 = row.sort) !== null && _row$sort2 !== void 0 ? _row$sort2 : 0,
						isDefault: row.defaultValue ? 1 : 0,
						status: nextEnabled ? 0 : 1,
						remark: row.remark || ""
					});
					ElMessage.success(nextEnabled ? "已启用" : "已停用，历史记录不受影响");
					yield loadSelectedOptions();
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "状态更新失败");
				}
			});
			return _toggleOption.apply(this, arguments);
		}
		function riskLabel(value) {
			return {
				LOW: "低风险",
				MEDIUM: "中风险",
				HIGH: "高风险",
				CRITICAL: "极高风险"
			}[value] || value;
		}
		function riskTag(value) {
			return {
				LOW: "success",
				MEDIUM: "warning",
				HIGH: "danger",
				CRITICAL: "danger"
			}[value] || "info";
		}
		function integrationLabel(value) {
			return {
				CONNECTED: "已接入",
				PENDING: "待接入",
				READ_ONLY: "只读",
				DOMAIN_MANAGED: "领域维护"
			}[value] || value;
		}
		function integrationTag(value) {
			return {
				CONNECTED: "success",
				PENDING: "warning",
				READ_ONLY: "info",
				DOMAIN_MANAGED: "primary"
			}[value] || "info";
		}
		function sourceKindLabel(value) {
			return {
				DICTIONARY: "受控选项目录",
				CODE_CATALOG: "代码目录",
				STATE_MACHINE: "业务状态机",
				ENTITY: "业务实体",
				MIXED: "多来源待映射",
				PROCESS_VERSION: "流程版本",
				EXTERNAL_PROTOCOL: "第三方协议"
			}[value] || value;
		}
		function controlTypeLabel(value) {
			return {
				SELECT: "单选下拉",
				SELECT_MULTI: "多选下拉",
				ENTITY_SELECT: "实体选择器",
				TREE_SELECT: "树形实体选择器",
				DYNAMIC_SELECT: "流程动态选项",
				MIXED: "混合控件"
			}[value] || value;
		}
		function editPolicyLabel(value) {
			return {
				ADD_DISABLE_LOCK_VALUE: "可新增/停用，存储值锁定",
				DISPLAY_ONLY: "仅展示",
				ALIAS_ADD_DISABLE: "待建设别名与停用",
				DOMAIN_MANAGED: "到业务实体维护",
				MAPPING_ONLY: "仅做映射治理",
				VERSIONED_REFERENCE: "随版本维护",
				AUDIT_FIRST: "先完成引用审计"
			}[value] || value;
		}
		function historyPolicyLabel(value) {
			return {
				KEEP_VALUE: "保留原存储值",
				SNAPSHOT: "按业务快照回放",
				ENTITY_REFERENCE: "保留实体引用",
				PROTOCOL_LOCKED: "协议码锁定"
			}[value] || value;
		}
		onMounted(loadFields);
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_tag = ElTag;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_switch = ElSwitch;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[16] || (_cache[16] = createBaseVNode("div", null, [
					createBaseVNode("div", { class: "eyebrow" }, "系统设置 · 字段治理目录"),
					createBaseVNode("h1", null, "字段匹配设置中心"),
					createBaseVNode("p", null, "统一查看字段来自哪里、在哪些页面使用、修改会影响什么；只对已接入的纯选项目录开放维护。")
				], -1)), createVNode(_component_el_button, {
					icon: unref(refresh_default),
					loading: loading.value,
					onClick: loadFields
				}, {
					default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("刷新目录", -1)])]),
					_: 1
				}, 8, ["icon", "loading"])]),
				createVNode(_component_el_alert, {
					class: "boundary-alert",
					type: "warning",
					closable: false,
					"show-icon": "",
					title: "员工、部门、角色、客户、账户和业务状态不是普通下拉选项",
					description: "实体选择器、状态机、审批版本和第三方协议均保持只读或进入原业务页面；本中心不会新建人员、伪造角色、改客户状态或改资金账户。"
				}),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => activeTab.value = $event),
					class: "governance-tabs"
				}, {
					default: withCtx(() => [createVNode(_component_el_tab_pane, {
						label: "字段目录与影响",
						name: "catalog"
					}, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_3, [
							createVNode(_component_el_input, {
								modelValue: keyword.value,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
								clearable: "",
								placeholder: "搜索字段、页面、表字段或来源",
								"prefix-icon": unref(search_default)
							}, null, 8, ["modelValue", "prefix-icon"]),
							createVNode(_component_el_select, {
								modelValue: module.value,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => module.value = $event),
								clearable: "",
								placeholder: "全部模块"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(moduleOptions.value, (item) => {
									return openBlock(), createBlock(_component_el_option, {
										key: item.value,
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"]),
							createVNode(_component_el_select, {
								modelValue: sourceKind.value,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => sourceKind.value = $event),
								clearable: "",
								placeholder: "全部来源"
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(sourceOptions, (item) => {
									return createVNode(_component_el_option, {
										key: item.value,
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, ["modelValue"]),
							createVNode(_component_el_select, {
								modelValue: integration.value,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => integration.value = $event),
								clearable: "",
								placeholder: "全部状态"
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(integrationOptions, (item) => {
									return createVNode(_component_el_option, {
										key: item.value,
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, ["modelValue"])
						]), withDirectives((openBlock(), createBlock(_component_el_table, {
							data: filteredFields.value,
							border: "",
							stripe: "",
							"row-key": "key"
						}, {
							empty: withCtx(() => [createVNode(_component_el_empty, { description: loadError.value || "没有符合条件的字段" }, {
								default: withCtx(() => [loadError.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									type: "primary",
									onClick: loadFields
								}, {
									default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("重新加载", -1)])]),
									_: 1
								})) : createCommentVNode("", true)]),
								_: 1
							}, 8, ["description"])]),
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									label: "字段",
									"min-width": "230",
									fixed: "left"
								}, {
									default: withCtx(({ row }) => [
										createBaseVNode("div", _hoisted_4, [createTextVNode(toDisplayString(row.name) + " ", 1), row.required ? (openBlock(), createBlock(_component_el_tag, {
											key: 0,
											size: "small",
											type: "danger",
											effect: "plain"
										}, {
											default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("必填", -1)])]),
											_: 1
										})) : createCommentVNode("", true)]),
										createBaseVNode("div", _hoisted_5, toDisplayString(row.description), 1),
										createBaseVNode("code", null, toDisplayString(row.key), 1)
									]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "模块 / 使用页面",
									"min-width": "205"
								}, {
									default: withCtx(({ row }) => [
										createBaseVNode("div", null, toDisplayString(row.moduleName), 1),
										createBaseVNode("div", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(row.pageNames, (page) => {
											return openBlock(), createBlock(_component_el_tag, {
												key: page,
												size: "small",
												effect: "plain"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(page), 1)]),
												_: 2
											}, 1024);
										}), 128))]),
										createBaseVNode("div", _hoisted_7, toDisplayString((row.pageRoutes || []).join("、") || "未登记页面路由"), 1)
									]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "存储与控件",
									"min-width": "205"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("code", null, toDisplayString(row.storageField), 1), createBaseVNode("div", _hoisted_8, toDisplayString(controlTypeLabel(row.controlType)) + " · " + toDisplayString(row.valueType), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "真实来源",
									"min-width": "190"
								}, {
									default: withCtx(({ row }) => [
										createBaseVNode("div", _hoisted_9, toDisplayString(row.sourceName), 1),
										createBaseVNode("div", _hoisted_10, toDisplayString(sourceKindLabel(row.sourceKind)), 1),
										row.dictType ? (openBlock(), createElementBlock("code", _hoisted_11, toDisplayString(row.dictType), 1)) : createCommentVNode("", true)
									]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "风险 / 接入",
									width: "140",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("div", null, [createVNode(_component_el_tag, {
										type: riskTag(row.riskLevel),
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(riskLabel(row.riskLevel)), 1)]),
										_: 2
									}, 1032, ["type"])]), createBaseVNode("div", _hoisted_12, [createVNode(_component_el_tag, {
										type: integrationTag(row.integrationState),
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(integrationLabel(row.integrationState)), 1)]),
										_: 2
									}, 1032, ["type"])])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "允许动作与历史",
									"min-width": "210"
								}, {
									default: withCtx(({ row }) => {
										var _row$usageCount, _row$optionCount;
										return [
											createBaseVNode("div", null, toDisplayString(editPolicyLabel(row.editPolicy)), 1),
											createBaseVNode("div", _hoisted_13, "历史：" + toDisplayString(historyPolicyLabel(row.historyPolicy)), 1),
											createBaseVNode("div", _hoisted_14, "约 " + toDisplayString((_row$usageCount = row.usageCount) !== null && _row$usageCount !== void 0 ? _row$usageCount : 0) + " 处引用 · " + toDisplayString((_row$optionCount = row.optionCount) !== null && _row$optionCount !== void 0 ? _row$optionCount : "待盘点") + " 个选项", 1),
											row.warning ? (openBlock(), createElementBlock("div", _hoisted_15, toDisplayString(row.warning), 1)) : createCommentVNode("", true)
										];
									}),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "处理",
									width: "118",
									align: "center",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [isMaintainableCatalog(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "primary",
										onClick: ($event) => openOptions(row)
									}, {
										default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("维护选项", -1)])]),
										_: 1
									}, 8, ["onClick"])) : row.manageRoute ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										link: "",
										type: "primary",
										onClick: ($event) => openManageRoute(row.manageRoute)
									}, {
										default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("进入来源", -1)])]),
										_: 1
									}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_16, "只读查看"))]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["data"])), [[_directive_loading, loading.value]])]),
						_: 1
					}), createVNode(_component_el_tab_pane, {
						label: "选项与映射规则",
						name: "options"
					}, {
						default: withCtx(() => [createBaseVNode("div", _hoisted_17, [createBaseVNode("aside", _hoisted_18, [createVNode(_component_el_input, {
							modelValue: optionKeyword.value,
							"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => optionKeyword.value = $event),
							clearable: "",
							placeholder: "搜索可查看字段",
							"prefix-icon": unref(search_default)
						}, null, 8, ["modelValue", "prefix-icon"]), createBaseVNode("div", _hoisted_19, [(openBlock(true), createElementBlock(Fragment, null, renderList(optionFields.value, (field) => {
							var _selectedField$value4;
							return openBlock(), createElementBlock("button", {
								key: field.key,
								type: "button",
								class: normalizeClass(["field-list-item", { active: ((_selectedField$value4 = selectedField.value) === null || _selectedField$value4 === void 0 ? void 0 : _selectedField$value4.key) === field.key }]),
								onClick: ($event) => selectField(field)
							}, [createBaseVNode("span", null, [createBaseVNode("strong", null, toDisplayString(field.name), 1), createBaseVNode("small", null, toDisplayString(field.sourceName) + " · " + toDisplayString(sourceKindLabel(field.sourceKind)), 1)]), isMaintainableCatalog(field) ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								type: "success"
							}, {
								default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("可维护", -1)])]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								size: "small",
								type: "info"
							}, {
								default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("只读", -1)])]),
								_: 1
							}))], 10, _hoisted_20);
						}), 128)), !optionFields.value.length ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "暂无匹配字段",
							"image-size": 64
						})) : createCommentVNode("", true)])]), createBaseVNode("section", _hoisted_21, [!selectedField.value ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "请从左侧选择字段"
						})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
							createBaseVNode("div", _hoisted_22, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_23, [createTextVNode(toDisplayString(selectedField.value.name) + " ", 1), createVNode(_component_el_tag, {
								type: isMaintainableCatalog(selectedField.value) ? "success" : "info",
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(isMaintainableCatalog(selectedField.value) ? "纯目录可维护" : "只读来源"), 1)]),
								_: 1
							}, 8, ["type"])]), createBaseVNode("p", null, toDisplayString(selectedField.value.description), 1)]), isMaintainableCatalog(selectedField.value) ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "primary",
								icon: unref(plus_default),
								disabled: !optionsConfigured.value,
								onClick: openCreateOption
							}, {
								default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("新增选项", -1)])]),
								_: 1
							}, 8, ["icon", "disabled"])) : selectedField.value.manageRoute ? (openBlock(), createBlock(_component_el_button, {
								key: 1,
								onClick: _cache[5] || (_cache[5] = ($event) => openManageRoute(selectedField.value.manageRoute))
							}, {
								default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("进入真实来源", -1)])]),
								_: 1
							})) : createCommentVNode("", true)]),
							createBaseVNode("div", _hoisted_24, [
								createBaseVNode("div", null, [_cache[25] || (_cache[25] = createBaseVNode("span", null, "存储字段", -1)), createBaseVNode("code", null, toDisplayString(selectedField.value.storageField), 1)]),
								createBaseVNode("div", null, [_cache[26] || (_cache[26] = createBaseVNode("span", null, "目录编码", -1)), createBaseVNode("code", null, toDisplayString(selectedField.value.dictType || "无（不可作为字典维护）"), 1)]),
								createBaseVNode("div", null, [_cache[27] || (_cache[27] = createBaseVNode("span", null, "修改策略", -1)), createBaseVNode("b", null, toDisplayString(editPolicyLabel(selectedField.value.editPolicy)), 1)]),
								createBaseVNode("div", null, [_cache[28] || (_cache[28] = createBaseVNode("span", null, "历史策略", -1)), createBaseVNode("b", null, toDisplayString(historyPolicyLabel(selectedField.value.historyPolicy)), 1)])
							]),
							selectedField.value.warning ? (openBlock(), createBlock(_component_el_alert, {
								key: 0,
								class: "option-alert",
								type: "warning",
								closable: false,
								title: selectedField.value.warning
							}, null, 8, ["title"])) : createCommentVNode("", true),
							selectedField.value.dictType && !optionsLoading.value && !optionsConfigured.value ? (openBlock(), createBlock(_component_el_alert, {
								key: 1,
								class: "option-alert",
								type: "info",
								closable: false,
								title: "该字段尚未配置受控目录",
								description: "业务页面仍使用随版本发布的兼容选项。本中心不会临时创建未经登记的字段类型。"
							})) : createCommentVNode("", true),
							!isMaintainableCatalog(selectedField.value) ? (openBlock(), createBlock(_component_el_alert, {
								key: 2,
								class: "option-alert",
								type: "info",
								closable: false,
								title: "此来源仅供核对，不能在本页增删改",
								description: readonlyReason(selectedField.value)
							}, null, 8, ["description"])) : createCommentVNode("", true),
							withDirectives((openBlock(), createBlock(_component_el_table, {
								data: optionItems.value,
								border: "",
								stripe: "",
								"row-key": "value"
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: optionError.value || (optionsConfigured.value ? "当前没有启用或历史选项" : "尚未接入选项目录"),
									"image-size": 76
								}, null, 8, ["description"])]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "label",
										label: "展示名称",
										"min-width": "160"
									}),
									createVNode(_component_el_table_column, {
										label: "存储值",
										"min-width": "170"
									}, {
										default: withCtx(({ row }) => [createBaseVNode("code", null, toDisplayString(row.value), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										prop: "sort",
										label: "排序",
										width: "80",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										label: "默认",
										width: "78",
										align: "center"
									}, {
										default: withCtx(({ row }) => [row.defaultValue ? (openBlock(), createBlock(_component_el_tag, {
											key: 0,
											type: "success",
											size: "small"
										}, {
											default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("默认", -1)])]),
											_: 1
										})) : (openBlock(), createElementBlock("span", _hoisted_25, "—"))]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "状态",
										width: "88",
										align: "center"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_tag, {
											type: row.enabled ? "success" : "info",
											size: "small"
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "启用" : "停用"), 1)]),
											_: 2
										}, 1032, ["type"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										prop: "remark",
										label: "说明",
										"min-width": "180",
										"show-overflow-tooltip": ""
									}),
									isMaintainableCatalog(selectedField.value) ? (openBlock(), createBlock(_component_el_table_column, {
										key: 0,
										label: "操作",
										width: "140",
										align: "center",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											link: "",
											type: "primary",
											onClick: ($event) => openEditOption(row)
										}, {
											default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("编辑展示", -1)])]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											link: "",
											type: row.enabled ? "warning" : "success",
											onClick: ($event) => toggleOption(row)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "停用" : "启用"), 1)]),
											_: 2
										}, 1032, ["type", "onClick"])]),
										_: 1
									})) : createCommentVNode("", true)
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, optionsLoading.value]]),
							isMaintainableCatalog(selectedField.value) ? (openBlock(), createElementBlock("p", _hoisted_26, " 已引用的存储值锁定；允许新增、修改展示名称/排序/默认值和停用。停用只阻止新选择，历史记录继续回显。 ")) : createCommentVNode("", true)
						], 64))])])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: optionDialogVisible.value,
					"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => optionDialogVisible.value = $event),
					title: optionForm.id ? "编辑选项展示" : "新增选项",
					width: "520px",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[13] || (_cache[13] = ($event) => optionDialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: saving.value,
						onClick: saveOption
					}, {
						default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "optionFormRef",
						ref: optionFormRef,
						model: optionForm,
						rules: optionRules,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "展示名称",
								prop: "dictLabel"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: optionForm.dictLabel,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => optionForm.dictLabel = $event),
									maxlength: "100"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "存储值",
								prop: "dictValue"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: optionForm.dictValue,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => optionForm.dictValue = $event),
									disabled: Boolean(optionForm.id),
									maxlength: "100"
								}, null, 8, ["modelValue", "disabled"]), _cache[31] || (_cache[31] = createBaseVNode("div", { class: "form-tip" }, "创建后锁定，避免历史记录和接口匹配失效。", -1))]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "排序" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: optionForm.dictSort,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => optionForm.dictSort = $event),
									min: 0,
									max: 9999
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "默认选项" }, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: optionForm.isDefault,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => optionForm.isDefault = $event),
									"active-value": 1,
									"inactive-value": 0
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "状态" }, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: optionForm.status,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => optionForm.status = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { value: 0 }, {
										default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("启用", -1)])]),
										_: 1
									}), createVNode(_component_el_radio, { value: 1 }, {
										default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("停用", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "说明" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: optionForm.remark,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => optionForm.remark = $event),
									type: "textarea",
									rows: 3,
									maxlength: "255"
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
}), [["__scopeId", "data-v-c28ba397"]]);
//#endregion
export { field_mapping_default as default };

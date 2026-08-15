import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, h as _objectWithoutProperties, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, Ct as arrow_left_default, Dr as withModifiers, F as ElEmpty, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, Nn as plus_default, Ot as calendar_default, Qn as stamp_default, R as ElDropdownMenu, Rn as rank_default, Sn as money_default, Tr as vShow, Ut as connection_default, V as ElDialog, Vt as close_default, W as ElDatePicker, Wt as copy_document_default, Xn as shopping_cart_default, Xt as delete_default, Yn as share_default, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, kn as paperclip_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pr as user_filled_default, rt as ElSelect, s as vLoading, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { n as processApi, r as taskApi } from "./workflow-CeqrP-pL.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as roleApi } from "./system-CuP08T_i.js";
//#region src/components/workflow/ApprovalFormFields.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "approval-form-fields" };
var _hoisted_2$1 = {
	key: 9,
	class: "aff-attach-hint"
};
//#endregion
//#region src/components/workflow/ApprovalFormFields.vue
var ApprovalFormFields_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ApprovalFormFields",
	props: {
		formConfig: { default: "" },
		modelValue: { default: () => ({}) },
		readonly: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const props = __props;
		const model = computed(() => props.modelValue || {});
		const parsedFields = computed(() => {
			const raw = props.formConfig;
			if (Array.isArray(raw)) return raw;
			try {
				const arr = JSON.parse(raw || "[]");
				return Array.isArray(arr) ? arr : [];
			} catch (_unused) {
				return [];
			}
		});
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_icon = ElIcon;
			const _component_el_form_item = ElFormItem;
			const _component_el_empty = ElEmpty;
			return openBlock(), createElementBlock("div", _hoisted_1$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(parsedFields.value, (field) => {
				return openBlock(), createElementBlock(Fragment, { key: field.field }, [field.type === "description" ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: field.label,
					type: "info",
					closable: false,
					"show-icon": "",
					style: { "margin-bottom": "14px" }
				}, null, 8, ["title"])) : (openBlock(), createBlock(_component_el_form_item, {
					key: 1,
					label: field.label,
					required: field.required
				}, {
					default: withCtx(() => [field.type === "text" ? (openBlock(), createBlock(_component_el_input, {
						key: 0,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						disabled: __props.readonly
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "textarea" ? (openBlock(), createBlock(_component_el_input, {
						key: 1,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						type: "textarea",
						rows: 3,
						disabled: __props.readonly
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "number" ? (openBlock(), createBlock(_component_el_input_number, {
						key: 2,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						min: 0,
						disabled: __props.readonly,
						style: { "width": "100%" }
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "amount" ? (openBlock(), createBlock(_component_el_input_number, {
						key: 3,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						min: 0,
						precision: 2,
						step: 100,
						"controls-position": "right",
						placeholder: "0.00",
						disabled: __props.readonly,
						style: { "width": "100%" }
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "date" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 4,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						type: "date",
						"value-format": "YYYY-MM-DD",
						placeholder: "请选择日期",
						disabled: __props.readonly,
						style: { "width": "100%" }
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "datetime" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 5,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						type: "datetime",
						"value-format": "YYYY-MM-DD HH:mm",
						placeholder: "请选择时间",
						disabled: __props.readonly,
						style: { "width": "100%" }
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "daterange" ? (openBlock(), createBlock(_component_el_date_picker, {
						key: 6,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						type: "daterange",
						"range-separator": "~",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						"value-format": "YYYY-MM-DD",
						disabled: __props.readonly,
						style: { "width": "100%" }
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "select" ? (openBlock(), createBlock(_component_el_select, {
						key: 7,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						disabled: __props.readonly,
						style: { "width": "100%" },
						placeholder: "请选择"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (opt) => {
							return openBlock(), createBlock(_component_el_option, {
								key: opt,
								label: opt,
								value: opt
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 2
					}, 1032, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "multiselect" ? (openBlock(), createBlock(_component_el_select, {
						key: 8,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						multiple: "",
						filterable: "",
						"collapse-tags": "",
						disabled: __props.readonly,
						style: { "width": "100%" },
						placeholder: "可多选"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (opt) => {
							return openBlock(), createBlock(_component_el_option, {
								key: opt,
								label: opt,
								value: opt
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 2
					}, 1032, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					])) : field.type === "attachment" ? (openBlock(), createElementBlock("div", _hoisted_2$1, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(paperclip_default))]),
						_: 1
					}), _cache[0] || (_cache[0] = createBaseVNode("span", null, "附件上传", -1))])) : (openBlock(), createBlock(_component_el_input, {
						key: 10,
						modelValue: model.value[field.field],
						"onUpdate:modelValue": ($event) => model.value[field.field] = $event,
						disabled: __props.readonly
					}, null, 8, [
						"modelValue",
						"onUpdate:modelValue",
						"disabled"
					]))]),
					_: 2
				}, 1032, ["label", "required"]))], 64);
			}), 128)), !parsedFields.value.length ? (openBlock(), createBlock(_component_el_empty, {
				key: 0,
				description: "该流程暂无表单字段",
				"image-size": 60
			})) : createCommentVNode("", true)]);
		};
	}
}), [["__scopeId", "data-v-1247f573"]]);
//#endregion
//#region src/views/workflow/designer.vue?vue&type=script&setup=true&lang.ts
var _excluded = ["_optionsText"];
var _hoisted_1 = { class: "workflow-designer" };
var _hoisted_2 = {
	key: 0,
	class: "process-list-view flow-list"
};
var _hoisted_3 = { class: "flow-list-hero" };
var _hoisted_4 = { class: "flow-stat-grid" };
var _hoisted_5 = { class: "flow-search-panel" };
var _hoisted_6 = { class: "flow-template-panel" };
var _hoisted_7 = { class: "templates-grid" };
var _hoisted_8 = ["onClick"];
var _hoisted_9 = { class: "template-card__icon" };
var _hoisted_10 = { class: "template-card__body" };
var _hoisted_11 = { class: "flow-table-panel" };
var _hoisted_12 = { class: "process-name-cell" };
var _hoisted_13 = { class: "process-icon" };
var _hoisted_14 = {
	key: 1,
	class: "workflow-builder"
};
var _hoisted_15 = { class: "builder-topbar" };
var _hoisted_16 = { class: "builder-title" };
var _hoisted_17 = { class: "builder-actions" };
var _hoisted_18 = { class: "builder-steps" };
var _hoisted_19 = ["onClick"];
var _hoisted_20 = { class: "builder-panel basic-panel" };
var _hoisted_21 = { class: "process-icon-editor" };
var _hoisted_22 = { class: "process-icon-preview" };
var _hoisted_23 = { class: "builder-panel form-panel" };
var _hoisted_24 = { class: "form-builder-grid" };
var _hoisted_25 = { class: "component-palette" };
var _hoisted_26 = ["onClick"];
var _hoisted_27 = { class: "phone-preview-wrap" };
var _hoisted_28 = { class: "phone-preview" };
var _hoisted_29 = { class: "phone-title" };
var _hoisted_30 = {
	key: 0,
	class: "preview-fields"
};
var _hoisted_31 = { key: 0 };
var _hoisted_32 = {
	key: 1,
	class: "preview-empty"
};
var _hoisted_33 = { class: "field-editor" };
var _hoisted_34 = {
	key: 0,
	class: "fd-list"
};
var _hoisted_35 = ["onDragstart", "onDrop"];
var _hoisted_36 = { class: "fd-main" };
var _hoisted_37 = { class: "fd-subline" };
var _hoisted_38 = { class: "builder-panel flow-panel" };
var _hoisted_39 = { class: "flow-builder-grid" };
var _hoisted_40 = { class: "node-palette" };
var _hoisted_41 = { class: "flow-designer" };
var _hoisted_42 = { class: "flow-designer__canvas" };
var _hoisted_43 = ["onClick"];
var _hoisted_44 = { class: "flow-node__header" };
var _hoisted_45 = { class: "flow-node__body" };
var _hoisted_46 = {
	key: 0,
	class: "flow-add-btn"
};
var _hoisted_47 = { class: "flow-summary" };
var _hoisted_48 = { class: "summary-row" };
var _hoisted_49 = { class: "summary-row" };
var _hoisted_50 = { class: "summary-row" };
var _hoisted_51 = { class: "summary-row" };
var _hoisted_52 = { class: "summary-row" };
var _hoisted_53 = { class: "builder-panel settings-panel" };
var _hoisted_54 = { class: "settings-layout" };
var _hoisted_55 = { class: "settings-block" };
var _hoisted_56 = { class: "setting-line" };
var _hoisted_57 = { class: "setting-line" };
var _hoisted_58 = { class: "settings-block" };
var _hoisted_59 = { class: "setting-line" };
var _hoisted_60 = {
	key: 2,
	class: "assignee-multi-hint"
};
var _hoisted_61 = { class: "cc-node-editor" };
var _hoisted_62 = { class: "preview-phone" };
var _hoisted_63 = { class: "preview-phone__title" };
//#endregion
//#region src/views/workflow/designer.vue
var designer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "designer",
	setup(__props) {
		const { t } = useI18n();
		const loading = ref(false);
		const processList = ref([]);
		const templates = ref([]);
		const searchName = ref("");
		const searchCategory = ref("");
		const searchStatus = ref(void 0);
		const categoryOptions = [
			{
				label: "考勤",
				value: "attendance"
			},
			{
				label: "财务",
				value: "finance"
			},
			{
				label: "供应链",
				value: "supply"
			},
			{
				label: "行政",
				value: "admin"
			},
			{
				label: "人事",
				value: "hrm"
			},
			{
				label: "合同",
				value: "contract"
			}
		];
		const processStats = computed(() => [
			{
				label: "全部流程",
				value: processList.value.length
			},
			{
				label: "已发布",
				value: processList.value.filter((item) => item.status === 1).length
			},
			{
				label: "草稿",
				value: processList.value.filter((item) => item.status === 0).length
			},
			{
				label: "已停用",
				value: processList.value.filter((item) => item.status === 2).length
			}
		]);
		const showDesigner = ref(false);
		const workflowSteps = [
			{
				key: "basic",
				no: 1,
				title: "基础设计"
			},
			{
				key: "form",
				no: 2,
				title: "表单设计"
			},
			{
				key: "flow",
				no: 3,
				title: "流程设计"
			},
			{
				key: "settings",
				no: 4,
				title: "更多设置"
			}
		];
		const activeDesignStep = ref("basic");
		const editingProcess = reactive({
			id: null,
			name: "",
			processKey: "",
			category: "",
			description: "",
			formConfig: "[]",
			processConfig: ""
		});
		const defaultProcessSettings = () => ({
			submitScope: "all",
			submitRoles: [],
			allowWithdrawBeforeApproval: true,
			allowWithdrawAfterApproval: false,
			withdrawDays: 31
		});
		const processSettings = reactive(defaultProcessSettings());
		function resetProcessSettings(settings) {
			const d = defaultProcessSettings();
			const s = settings || {};
			processSettings.submitScope = s.submitScope || d.submitScope;
			processSettings.submitRoles = Array.isArray(s.submitRoles) ? s.submitRoles : [];
			processSettings.allowWithdrawBeforeApproval = s.allowWithdrawBeforeApproval !== void 0 ? !!s.allowWithdrawBeforeApproval : d.allowWithdrawBeforeApproval;
			processSettings.allowWithdrawAfterApproval = !!s.allowWithdrawAfterApproval;
			processSettings.withdrawDays = Number(s.withdrawDays) > 0 ? Number(s.withdrawDays) : d.withdrawDays;
		}
		const designerNodes = ref([{
			id: "start",
			type: "start",
			name: "开始"
		}, {
			id: "end",
			type: "end",
			name: "结束"
		}]);
		const nodeDialogVisible = ref(false);
		const editingNode = ref(null);
		const userOptions = ref([]);
		const roleOptions = ref([]);
		const ccInitiator = ref(true);
		const ccUserIds = ref([]);
		function normalizeCcTargets(targets) {
			if (!Array.isArray(targets)) return [];
			const seen = /* @__PURE__ */ new Set();
			const normalized = [];
			for (const target of targets) {
				const type = String((target === null || target === void 0 ? void 0 : target.type) || "");
				const value = (target === null || target === void 0 ? void 0 : target.value) != null ? String(target.value) : void 0;
				if (type !== "initiator" && !(type === "user" && value)) continue;
				const key = `${type}:${value || ""}`;
				if (seen.has(key)) continue;
				seen.add(key);
				normalized.push(type === "initiator" ? { type } : {
					type,
					value
				});
			}
			return normalized;
		}
		function ccTargetsFromSettings() {
			const targets = [];
			if (ccInitiator.value) targets.push({ type: "initiator" });
			for (const uid of ccUserIds.value) targets.push({
				type: "user",
				value: String(uid)
			});
			return normalizeCcTargets(targets);
		}
		function ccTargetsFromNodes(nodes) {
			return normalizeCcTargets(nodes.flatMap((node) => normalizeCcTargets(node.ccTargets)));
		}
		function mergeCcTargets(targets) {
			return normalizeCcTargets(targets);
		}
		function ccTargetText(targets) {
			const normalized = normalizeCcTargets(targets);
			if (!normalized.length) return "";
			return `审批通过后抄送：${normalized.map((target) => {
				if (target.type === "initiator") return "发起人";
				const user = userOptions.value.find((item) => String(item.id) === String(target.value));
				return (user === null || user === void 0 ? void 0 : user.name) || target.value || "指定成员";
			}).join("、")}`;
		}
		function loadPickerOptions() {
			return _loadPickerOptions.apply(this, arguments);
		}
		function _loadPickerOptions() {
			_loadPickerOptions = _asyncToGenerator(function* () {
				try {
					const rows = yield taskApi.colleagues();
					userOptions.value = (Array.isArray(rows) ? rows : (rows === null || rows === void 0 ? void 0 : rows.data) || []).map((u) => {
						var _u$userId, _u$userId2;
						return {
							id: (_u$userId = u.userId) !== null && _u$userId !== void 0 ? _u$userId : u.id,
							name: u.name || u.nickname || u.username || "用户" + ((_u$userId2 = u.userId) !== null && _u$userId2 !== void 0 ? _u$userId2 : u.id)
						};
					});
				} catch (_unused) {
					userOptions.value = [];
				}
				try {
					roleOptions.value = ((yield roleApi.all()).data || []).map((r) => ({
						roleKey: r.roleKey,
						roleName: r.roleName
					}));
				} catch (_unused2) {
					roleOptions.value = [];
				}
			});
			return _loadPickerOptions.apply(this, arguments);
		}
		onMounted(() => {
			loadList();
			loadTemplates();
			loadPickerOptions();
		});
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const params = {};
					if (searchName.value) params.name = searchName.value;
					if (searchCategory.value) params.category = searchCategory.value;
					if (searchStatus.value !== void 0) params.status = searchStatus.value;
					const res = yield processApi.list(params);
					processList.value = res.data || res || [];
				} catch (e) {}
				loading.value = false;
			});
			return _loadList.apply(this, arguments);
		}
		function loadTemplates() {
			return _loadTemplates.apply(this, arguments);
		}
		function _loadTemplates() {
			_loadTemplates = _asyncToGenerator(function* () {
				try {
					const res = yield processApi.templates();
					templates.value = res.data || res || [];
				} catch (e) {}
			});
			return _loadTemplates.apply(this, arguments);
		}
		function resetSearch() {
			searchName.value = "";
			searchCategory.value = "";
			searchStatus.value = void 0;
			loadList();
		}
		function getStatusType(status) {
			switch (status) {
				case 0: return "info";
				case 1: return "success";
				case 2: return "warning";
				default: return "info";
			}
		}
		function getStatusLabel(status) {
			switch (status) {
				case 0: return t("workflow.draft");
				case 1: return t("workflow.published");
				case 2: return t("workflow.disabled");
				default: return "";
			}
		}
		function getCategoryLabel(category) {
			var _categoryOptions$find;
			return ((_categoryOptions$find = categoryOptions.find((item) => item.value === category)) === null || _categoryOptions$find === void 0 ? void 0 : _categoryOptions$find.label) || category || "未分组";
		}
		function getTemplateIcon(key) {
			switch (key) {
				case "leave": return calendar_default;
				case "expense": return money_default;
				case "purchase": return shopping_cart_default;
				case "seal": return stamp_default;
				default: return calendar_default;
			}
		}
		function getTemplateName(key) {
			switch (key) {
				case "leave": return t("workflow.leaveApproval");
				case "expense": return t("workflow.expenseApproval");
				case "purchase": return t("workflow.purchaseApproval");
				case "seal": return t("workflow.sealApproval");
				default: return key;
			}
		}
		function handleCreate() {
			Object.assign(editingProcess, {
				id: null,
				name: "",
				processKey: "",
				category: "",
				description: "",
				formConfig: "[]",
				processConfig: ""
			});
			designerNodes.value = [{
				id: "start",
				type: "start",
				name: "开始"
			}, {
				id: "end",
				type: "end",
				name: "结束"
			}];
			ccInitiator.value = true;
			ccUserIds.value = [];
			resetProcessSettings();
			activeDesignStep.value = "basic";
			parseFormFields();
			showDesigner.value = true;
		}
		function useTemplate(tpl) {
			Object.assign(editingProcess, {
				id: null,
				name: tpl.name,
				processKey: tpl.key,
				category: tpl.category,
				description: "",
				formConfig: tpl.formConfig,
				processConfig: tpl.processConfig
			});
			parseFormFields();
			resetProcessSettings();
			activeDesignStep.value = "basic";
			try {
				const config = JSON.parse(tpl.processConfig);
				designerNodes.value = config.nodes || [];
				resetProcessSettings(config.settings);
			} catch (e) {
				designerNodes.value = [{
					id: "start",
					type: "start",
					name: "开始"
				}, {
					id: "end",
					type: "end",
					name: "结束"
				}];
				resetProcessSettings();
			}
			showDesigner.value = true;
		}
		function openDesigner(_x) {
			return _openDesigner.apply(this, arguments);
		}
		function _openDesigner() {
			_openDesigner = _asyncToGenerator(function* (row) {
				if (row.status === 1) try {
					yield ElMessageBox.confirm("该流程已发布,需先停用才能修改。是否停用并进入编辑?", "流程已发布", {
						confirmButtonText: "停用并编辑",
						cancelButtonText: "取消",
						type: "warning"
					});
					yield processApi.disable(row.id);
					row = _objectSpread2(_objectSpread2({}, row), {}, { status: 2 });
					loadList();
					ElMessage.success("已停用,进入编辑");
				} catch (_unused3) {
					return;
				}
				Object.assign(editingProcess, {
					id: row.id,
					name: row.name,
					processKey: row.processKey,
					category: row.category,
					description: row.description,
					formConfig: row.formConfig || "[]",
					processConfig: row.processConfig || ""
				});
				parseFormFields();
				activeDesignStep.value = "basic";
				try {
					const config = JSON.parse(row.processConfig || "{}");
					designerNodes.value = config.nodes || [{
						id: "start",
						type: "start",
						name: "开始"
					}, {
						id: "end",
						type: "end",
						name: "结束"
					}];
					resetProcessSettings(config.settings);
					const ccArr = Array.isArray(config.cc) ? config.cc : [];
					ccInitiator.value = ccArr.length ? ccArr.some((c) => c.type === "initiator") : true;
					ccUserIds.value = ccArr.filter((c) => c.type === "user" && c.value).map((c) => Number(c.value));
				} catch (e) {
					designerNodes.value = [{
						id: "start",
						type: "start",
						name: "开始"
					}, {
						id: "end",
						type: "end",
						name: "结束"
					}];
					ccInitiator.value = true;
					ccUserIds.value = [];
					resetProcessSettings();
				}
				showDesigner.value = true;
			});
			return _openDesigner.apply(this, arguments);
		}
		function closeDesigner() {
			showDesigner.value = false;
		}
		function uniqueNodeName(base) {
			const names = designerNodes.value.map((n) => n.name);
			if (!names.includes(base)) return base;
			let k = 2;
			while (names.includes(base + " " + k)) k++;
			return base + " " + k;
		}
		function addNode(afterIndex, type) {
			const newId = "node_" + Date.now();
			const nodeType = type === "parallel" ? "approval" : type;
			const baseMap = {
				approval: t("workflow.approvalNode"),
				condition: t("workflow.conditionNode"),
				cc: "抄送人",
				parallel: "并行审批"
			};
			const node = {
				id: newId,
				type: nodeType,
				name: uniqueNodeName(baseMap[type] || baseMap[nodeType] || "节点")
			};
			if (nodeType === "approval") {
				node.signMode = type === "parallel" ? "and" : "single";
				node.assigneeType = type === "parallel" ? void 0 : "role";
				node.assigneeValue = type === "parallel" ? void 0 : "dept_manager";
				node.assignees = type === "parallel" ? [] : void 0;
			}
			if (nodeType === "condition") node.conditions = [];
			if (nodeType === "cc") node.ccTargets = [{ type: "initiator" }];
			designerNodes.value.splice(afterIndex + 1, 0, node);
		}
		function removeNode(index) {
			var _designerNodes$value$;
			const removedId = (_designerNodes$value$ = designerNodes.value[index]) === null || _designerNodes$value$ === void 0 ? void 0 : _designerNodes$value$.id;
			designerNodes.value.splice(index, 1);
			if (removedId) {
				for (const n of designerNodes.value) if (n.conditions) n.conditions = n.conditions.filter((c) => c.nextNode !== removedId);
			}
		}
		function editNode(node) {
			if (node.type === "start" || node.type === "end") return;
			editingNode.value = _objectSpread2(_objectSpread2({}, node), {}, {
				signMode: node.signMode || "single",
				assignees: node.assignees ? node.assignees.map((a) => _objectSpread2({}, a)) : [],
				conditions: node.conditions ? node.conditions.map((c) => _objectSpread2(_objectSpread2({}, c), parseExpr(c.expression))) : [],
				ccTargets: node.ccTargets ? node.ccTargets.map((c) => _objectSpread2({}, c)) : node.type === "cc" ? [{ type: "initiator" }] : void 0
			});
			nodeDialogVisible.value = true;
		}
		const approverUserIds = computed({
			get: () => {
				var _editingNode$value;
				return (((_editingNode$value = editingNode.value) === null || _editingNode$value === void 0 ? void 0 : _editingNode$value.assignees) || []).map((a) => Number(a.assigneeValue)).filter((n) => !isNaN(n));
			},
			set: (ids) => {
				if (editingNode.value) editingNode.value.assignees = ids.map((id) => ({
					assigneeType: "user",
					assigneeValue: String(id)
				}));
			}
		});
		const specifyUserIds = computed({
			get: () => {
				const node = editingNode.value;
				if (!node) return [];
				if (node.assignees && node.assignees.length) return node.assignees.filter((a) => a.assigneeType === "user").map((a) => Number(a.assigneeValue)).filter((n) => !isNaN(n));
				if (node.assigneeType === "user" && node.assigneeValue) {
					const single = Number(node.assigneeValue);
					return isNaN(single) ? [] : [single];
				}
				return [];
			},
			set: (ids) => {
				if (editingNode.value) editingNode.value.assignees = ids.map((id) => ({
					assigneeType: "user",
					assigneeValue: String(id)
				}));
			}
		});
		const ccNodeInitiator = computed({
			get: () => {
				var _editingNode$value2;
				return normalizeCcTargets((_editingNode$value2 = editingNode.value) === null || _editingNode$value2 === void 0 ? void 0 : _editingNode$value2.ccTargets).some((target) => target.type === "initiator");
			},
			set: (checked) => {
				if (!editingNode.value) return;
				const targets = normalizeCcTargets(editingNode.value.ccTargets).filter((target) => target.type !== "initiator");
				editingNode.value.ccTargets = checked ? [{ type: "initiator" }, ...targets] : targets;
			}
		});
		const ccNodeUserIds = computed({
			get: () => {
				var _editingNode$value3;
				return normalizeCcTargets((_editingNode$value3 = editingNode.value) === null || _editingNode$value3 === void 0 ? void 0 : _editingNode$value3.ccTargets).filter((target) => target.type === "user" && target.value).map((target) => Number(target.value)).filter((id) => !Number.isNaN(id));
			},
			set: (ids) => {
				if (!editingNode.value) return;
				const nonUsers = normalizeCcTargets(editingNode.value.ccTargets).filter((target) => target.type !== "user");
				editingNode.value.ccTargets = normalizeCcTargets([...nonUsers, ...ids.map((id) => ({
					type: "user",
					value: String(id)
				}))]);
			}
		});
		const condOps = [
			">",
			">=",
			"<",
			"<=",
			"==",
			"!="
		];
		const conditionFields = computed(() => {
			try {
				const fields = JSON.parse(editingProcess.formConfig || "[]");
				return (Array.isArray(fields) ? fields : []).map((f) => ({
					field: f.field,
					label: f.label || f.field
				}));
			} catch (_unused4) {
				return [];
			}
		});
		const targetNodeOptions = computed(() => {
			const idx = designerNodes.value.findIndex((n) => {
				var _editingNode$value4;
				return n.id === ((_editingNode$value4 = editingNode.value) === null || _editingNode$value4 === void 0 ? void 0 : _editingNode$value4.id);
			});
			return designerNodes.value.filter((n, i) => n.type !== "start" && i > idx);
		});
		function syncCondExpr(cond) {
			if (cond.field && cond.op != null && cond.value != null && cond.value !== "") cond.expression = `${cond.field} ${cond.op} ${cond.value}`;
			else cond.expression = "";
		}
		function parseExpr(expr) {
			if (!expr) return {};
			for (const op of [
				">=",
				"<=",
				"!=",
				"==",
				">",
				"<"
			]) {
				const i = expr.indexOf(op);
				if (i >= 0) {
					const field = expr.slice(0, i).trim();
					const v = Number(expr.slice(i + op.length).trim());
					return {
						field,
						op,
						value: isNaN(v) ? void 0 : v
					};
				}
			}
			return {};
		}
		const fieldTypes = [
			{
				type: "text",
				label: "单行文本",
				icon: stamp_default
			},
			{
				type: "textarea",
				label: "多行文本",
				icon: stamp_default
			},
			{
				type: "description",
				label: "说明文字",
				icon: stamp_default
			},
			{
				type: "number",
				label: "数字",
				icon: money_default
			},
			{
				type: "amount",
				label: "金额",
				icon: money_default
			},
			{
				type: "date",
				label: "日期",
				icon: calendar_default
			},
			{
				type: "datetime",
				label: "日期时间",
				icon: calendar_default
			},
			{
				type: "daterange",
				label: "日期区间",
				icon: calendar_default
			},
			{
				type: "select",
				label: "下拉选择",
				icon: rank_default
			},
			{
				type: "multiselect",
				label: "多选",
				icon: rank_default
			},
			{
				type: "attachment",
				label: "附件",
				icon: paperclip_default
			}
		];
		const fieldGroups = computed(() => [
			{
				title: "文本",
				items: fieldTypes.filter((item) => [
					"text",
					"textarea",
					"description"
				].includes(item.type))
			},
			{
				title: "数值",
				items: fieldTypes.filter((item) => ["number", "amount"].includes(item.type))
			},
			{
				title: "选项",
				items: fieldTypes.filter((item) => ["select", "multiselect"].includes(item.type))
			},
			{
				title: "日期",
				items: fieldTypes.filter((item) => [
					"date",
					"datetime",
					"daterange"
				].includes(item.type))
			},
			{
				title: "附件",
				items: fieldTypes.filter((item) => ["attachment"].includes(item.type))
			}
		]);
		const formFields = ref([]);
		const previewVisible = ref(false);
		const previewFields = ref([]);
		const previewValues = reactive({});
		function openPreview() {
			previewFields.value = formFields.value.map((f) => _objectSpread2({}, f));
			Object.keys(previewValues).forEach((k) => delete previewValues[k]);
			previewVisible.value = true;
		}
		const assigneeWarning = ref("");
		function checkAssignee(_x2, _x3) {
			return _checkAssignee.apply(this, arguments);
		}
		function _checkAssignee() {
			_checkAssignee = _asyncToGenerator(function* (assigneeType, assigneeValue) {
				assigneeWarning.value = "";
				if (!assigneeType) return;
				if (assigneeType === "role" && !assigneeValue) return;
				try {
					const res = yield processApi.assigneePreview(assigneeType, assigneeValue);
					const d = res && typeof res === "object" && "data" in res ? res.data : res;
					if (d && d.ok === false && d.warning) assigneeWarning.value = d.warning;
				} catch (_unused5) {}
			});
			return _checkAssignee.apply(this, arguments);
		}
		function onAssigneeTypeChange(type) {
			assigneeWarning.value = "";
			if (type === "supervisor" || type === "dept_manager") checkAssignee(type);
		}
		const fdDragIndex = ref(-1);
		function previewFieldPlaceholder(field) {
			var _field$options;
			if (field.type === "date" || field.type === "datetime") return "请选择";
			if (field.type === "daterange") return "开始日期 ~ 结束日期";
			if (field.type === "select" || field.type === "multiselect") return ((_field$options = field.options) === null || _field$options === void 0 ? void 0 : _field$options.length) ? field.options.join(" / ") : "请选择";
			if (field.type === "amount") return "¥ 0.00";
			if (field.type === "number") return "请输入数字";
			if (field.type === "description") return "(仅展示说明文字,员工不填写)";
			if (field.type === "attachment") return "点击上传附件(支持图片/文件,可多个)";
			if (field.type === "textarea") return "请输入";
			return "请输入";
		}
		function genFieldKey() {
			return "field_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
		}
		function uniqueFieldKey() {
			const existing = new Set(formFields.value.map((f) => f.field));
			let k = genFieldKey();
			while (existing.has(k)) k = genFieldKey();
			return k;
		}
		function addFormField(type) {
			const labelMap = {
				text: "单行文本",
				textarea: "多行文本",
				description: "说明文字(如:请如实填写,虚报按公司规定处理)",
				number: "数字",
				amount: "金额",
				date: "日期",
				datetime: "日期时间",
				daterange: "日期区间",
				select: "下拉选择",
				multiselect: "多选",
				attachment: "附件"
			};
			const hasOptions = type === "select" || type === "multiselect";
			formFields.value.push({
				field: uniqueFieldKey(),
				label: labelMap[type] || "新字段",
				type,
				required: type === "description" ? false : false,
				options: hasOptions ? [] : void 0,
				_optionsText: ""
			});
		}
		function syncOptions(f) {
			f.options = (f._optionsText || "").split(/[,，]/).map((s) => s.trim()).filter(Boolean);
		}
		function fdDragStart(i) {
			fdDragIndex.value = i;
		}
		function fdDrop(i) {
			const from = fdDragIndex.value;
			if (from < 0 || from === i) {
				fdDragIndex.value = -1;
				return;
			}
			const arr = formFields.value;
			const [moved] = arr.splice(from, 1);
			arr.splice(i, 0, moved);
			fdDragIndex.value = -1;
		}
		function parseFormFields() {
			try {
				const fields = JSON.parse(editingProcess.formConfig || "[]");
				formFields.value = (Array.isArray(fields) ? fields : []).map((f) => _objectSpread2(_objectSpread2({}, f), {}, {
					field: f.field || genFieldKey(),
					label: f.label || f.field || "字段",
					type: f.type || "text",
					required: !!f.required,
					options: Array.isArray(f.options) ? f.options : void 0,
					_optionsText: Array.isArray(f.options) ? f.options.join(",") : ""
				}));
			} catch (_unused6) {
				formFields.value = [];
			}
		}
		watch(formFields, () => {
			editingProcess.formConfig = JSON.stringify(formFields.value.map((f) => {
				const { _optionsText } = f;
				const o = _objectSpread2(_objectSpread2({}, _objectWithoutProperties(f, _excluded)), {}, {
					field: f.field,
					label: f.label,
					type: f.type
				});
				if (f.required) o.required = true;
				else delete o.required;
				if (f.type === "select" || f.type === "multiselect") o.options = f.options || [];
				else delete o.options;
				return o;
			}));
		}, { deep: true });
		function saveNodeConfig() {
			if (!editingNode.value) return;
			const n = _objectSpread2({}, editingNode.value);
			if (n.type === "condition") {
				if ((n.conditions || []).some((c) => !c.nextNode)) {
					ElMessage.error("每个条件分支都必须选择\"目标节点\"");
					return;
				}
			}
			if (n.type === "approval") {
				if (!n.signMode || n.signMode === "single") {
					n.signMode = void 0;
					if (n.assigneeType === "user") {
						if (!n.assignees || !n.assignees.length) {
							ElMessage.error("请至少选择一名指定人员");
							return;
						}
						n.assigneeValue = void 0;
					} else n.assignees = void 0;
				} else if (!n.assignees || !n.assignees.length) {
					ElMessage.error("请至少选择一名多人审批的审批人");
					return;
				}
			}
			if (n.type === "cc") {
				n.ccTargets = normalizeCcTargets(n.ccTargets);
				if (!n.ccTargets.length) {
					ElMessage.error("请至少选择一个抄送对象");
					return;
				}
			}
			const idx = designerNodes.value.findIndex((x) => x.id === n.id);
			if (idx >= 0) designerNodes.value[idx] = n;
			nodeDialogVisible.value = false;
		}
		function getAssigneeLabel(node) {
			if (node.assignees && node.assignees.length) {
				const names = node.assignees.map((a) => {
					const u = userOptions.value.find((x) => String(x.id) === String(a.assigneeValue));
					return u ? u.name : a.assigneeValue;
				}).join("、");
				return (node.signMode === "and" ? "会签" : node.signMode === "or" ? "或签" : t("workflow.specifyUser")) + ": " + names;
			}
			if (node.assigneeType === "supervisor") return "直属上级";
			if (node.assigneeType === "user") {
				const u = userOptions.value.find((x) => String(x.id) === String(node.assigneeValue));
				return t("workflow.specifyUser") + ": " + (u ? u.name : node.assigneeValue || "未指定");
			}
			if (node.assigneeType === "role") {
				const r = roleOptions.value.find((x) => x.roleKey === node.assigneeValue);
				return t("workflow.specifyRole") + ": " + (r ? r.roleName : node.assigneeValue || "未指定");
			}
			if (node.assigneeType === "supervisor") return "直属上级";
			if (node.assigneeType === "dept_leader" || node.assigneeType === "dept_manager") return "部门主管";
			return "";
		}
		function nodeTypeLabel(type, node) {
			if (type === "start") return "提交";
			if (type === "approval" && (node === null || node === void 0 ? void 0 : node.signMode) && node.signMode !== "single") return "并行审批";
			if (type === "approval") return "审批";
			if (type === "condition") return "条件分支";
			if (type === "cc") return "抄送";
			if (type === "end") return "结束";
			return type || "节点";
		}
		function nodeMetaLabel(node) {
			var _node$conditions;
			if (node.type === "start") return "提交人：按基础设计权限发起";
			if (node.type === "approval") return getAssigneeLabel(node) || "请设置审批人";
			if (node.type === "condition") return `${((_node$conditions = node.conditions) === null || _node$conditions === void 0 ? void 0 : _node$conditions.length) || 0} 个条件，点击配置分支`;
			if (node.type === "cc") return ccTargetText(node.ccTargets) || "请设置抄送人";
			if (node.type === "end") return "审批完成后执行抄送与归档";
			return "";
		}
		function buildProcessConfig() {
			const nodes = designerNodes.value.map((node) => _objectSpread2(_objectSpread2({}, node), {}, {
				assignees: node.assignees ? node.assignees.map((item) => _objectSpread2({}, item)) : void 0,
				conditions: node.conditions ? node.conditions.map((item) => _objectSpread2({}, item)) : void 0,
				ccTargets: node.ccTargets ? normalizeCcTargets(node.ccTargets) : void 0
			}));
			const validIds = new Set(nodes.map((n) => n.id));
			const edges = [];
			for (let i = 0; i < nodes.length - 1; i++) {
				const condEdges = nodes[i].type === "condition" && nodes[i].conditions ? nodes[i].conditions.filter((c) => c.nextNode && validIds.has(c.nextNode)) : [];
				if (condEdges.length > 0) {
					for (const cond of condEdges) edges.push({
						from: nodes[i].id,
						to: cond.nextNode
					});
					const seqNextId = nodes[i + 1].id;
					if (!condEdges.some((c) => c.nextNode === seqNextId)) edges.push({
						from: nodes[i].id,
						to: seqNextId
					});
				} else edges.push({
					from: nodes[i].id,
					to: nodes[i + 1].id
				});
			}
			const cc = mergeCcTargets([...ccTargetsFromSettings(), ...ccTargetsFromNodes(nodes)]);
			return JSON.stringify({
				nodes,
				edges,
				cc,
				settings: _objectSpread2({}, processSettings)
			});
		}
		function saveProcess() {
			return _saveProcess.apply(this, arguments);
		}
		function _saveProcess() {
			_saveProcess = _asyncToGenerator(function* () {
				const names = designerNodes.value.map((n) => n.name);
				const dupName = names.find((nm, i) => names.indexOf(nm) !== i);
				if (dupName) {
					ElMessage.error(`节点名称不能重复:「${dupName}」,请改成不同名称`);
					return;
				}
				editingProcess.processConfig = buildProcessConfig();
				try {
					if (editingProcess.id) yield processApi.update(editingProcess);
					else yield processApi.create(editingProcess);
					ElMessage.success(t("common.success"));
					closeDesigner();
					loadList();
				} catch (e) {
					ElMessage.error(e.message || t("common.failed"));
				}
			});
			return _saveProcess.apply(this, arguments);
		}
		function handlePublish(_x4) {
			return _handlePublish.apply(this, arguments);
		}
		function _handlePublish() {
			_handlePublish = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(t("workflow.confirmPublish"), t("common.confirm"));
				try {
					yield processApi.publish(row.id);
					ElMessage.success(t("common.success"));
					loadList();
				} catch (e) {
					ElMessage.error(e.message || t("common.failed"));
				}
			});
			return _handlePublish.apply(this, arguments);
		}
		function handleDisable(_x5) {
			return _handleDisable.apply(this, arguments);
		}
		function _handleDisable() {
			_handleDisable = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(t("workflow.confirmDisable"), t("common.confirm"));
				try {
					yield processApi.disable(row.id);
					ElMessage.success(t("common.success"));
					loadList();
				} catch (e) {
					ElMessage.error(e.message || t("common.failed"));
				}
			});
			return _handleDisable.apply(this, arguments);
		}
		function handleDelete(_x6) {
			return _handleDelete.apply(this, arguments);
		}
		function _handleDelete() {
			_handleDelete = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确定删除流程「${row.name}」吗?(可在数据库恢复,但前台不再显示)`, t("common.confirm"), { type: "warning" });
				try {
					yield processApi.remove(row.id);
					ElMessage.success(t("common.success"));
					loadList();
				} catch (e) {
					ElMessage.error(e.message || t("common.failed"));
				}
			});
			return _handleDelete.apply(this, arguments);
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_empty = ElEmpty;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_alert = ElAlert;
			const _component_el_input_number = ElInputNumber;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [!showDesigner.value ? (openBlock(), createElementBlock("div", _hoisted_2, [
				createBaseVNode("section", _hoisted_3, [_cache[37] || (_cache[37] = createBaseVNode("div", null, [
					createBaseVNode("span", { class: "flow-eyebrow" }, "APPROVAL WORKFLOW"),
					createBaseVNode("h2", null, "审批模板设置"),
					createBaseVNode("p", null, "统一维护请假、报销、采购、用印等审批模板。按照基础设计、表单设计、流程设计、更多设置四步完成配置。")
				], -1)), createVNode(_component_el_button, {
					type: "primary",
					size: "large",
					onClick: handleCreate
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[36] || (_cache[36] = createTextVNode(" 新建审批模板 ", -1))]),
					_: 1
				})]),
				createBaseVNode("div", _hoisted_4, [(openBlock(true), createElementBlock(Fragment, null, renderList(processStats.value, (item) => {
					return openBlock(), createElementBlock("div", {
						key: item.label,
						class: "flow-stat-card"
					}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("strong", null, toDisplayString(item.value), 1)]);
				}), 128))]),
				createBaseVNode("section", _hoisted_5, [
					createVNode(_component_el_input, {
						modelValue: searchName.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchName.value = $event),
						placeholder: _ctx.$t("workflow.processName"),
						clearable: ""
					}, null, 8, ["modelValue", "placeholder"]),
					createVNode(_component_el_select, {
						modelValue: searchCategory.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchCategory.value = $event),
						placeholder: _ctx.$t("workflow.category"),
						clearable: ""
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(categoryOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue", "placeholder"]),
					createVNode(_component_el_select, {
						modelValue: searchStatus.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => searchStatus.value = $event),
						placeholder: _ctx.$t("workflow.status"),
						clearable: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_option, {
								label: _ctx.$t("workflow.draft"),
								value: 0
							}, null, 8, ["label"]),
							createVNode(_component_el_option, {
								label: _ctx.$t("workflow.published"),
								value: 1
							}, null, 8, ["label"]),
							createVNode(_component_el_option, {
								label: _ctx.$t("workflow.disabled"),
								value: 2
							}, null, 8, ["label"])
						]),
						_: 1
					}, 8, ["modelValue", "placeholder"]),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: loadList
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.search")), 1)]),
						_: 1
					}),
					createVNode(_component_el_button, { onClick: resetSearch }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.reset")), 1)]),
						_: 1
					})
				]),
				createBaseVNode("section", _hoisted_6, [_cache[38] || (_cache[38] = createBaseVNode("div", { class: "section-title" }, [createBaseVNode("div", null, [createBaseVNode("h3", null, "常用审批模板"), createBaseVNode("p", null, "选一个模板作为起点，再进入四步设计器细化字段和审批规则。")])], -1)), createBaseVNode("div", _hoisted_7, [(openBlock(true), createElementBlock(Fragment, null, renderList(templates.value, (tpl) => {
					return openBlock(), createElementBlock("button", {
						key: tpl.key,
						type: "button",
						class: "template-card",
						onClick: ($event) => useTemplate(tpl)
					}, [createBaseVNode("span", _hoisted_9, [createVNode(_component_el_icon, { size: 24 }, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(getTemplateIcon(tpl.key))))]),
						_: 2
					}, 1024)]), createBaseVNode("span", _hoisted_10, [createBaseVNode("b", null, toDisplayString(getTemplateName(tpl.key)), 1), createBaseVNode("small", null, toDisplayString(getCategoryLabel(tpl.category)) + " · 点击使用模板", 1)])], 8, _hoisted_8);
				}), 128))])]),
				createBaseVNode("section", _hoisted_11, [_cache[43] || (_cache[43] = createBaseVNode("div", { class: "section-title" }, [createBaseVNode("div", null, [createBaseVNode("h3", null, "流程定义"), createBaseVNode("p", null, "已发布流程会出现在审批中心；草稿流程可继续编辑。")])], -1)), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: processList.value,
					class: "flow-table"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "name",
							label: "流程名称",
							"min-width": "180"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_12, [createBaseVNode("span", _hoisted_13, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(getTemplateIcon(row.processKey))))]),
								_: 2
							}, 1024)]), createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(row.name), 1), createBaseVNode("small", null, toDisplayString(row.description || "暂无说明"), 1)])])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "processKey",
							label: "流程标识",
							width: "150"
						}),
						createVNode(_component_el_table_column, {
							prop: "category",
							label: "分组",
							width: "110"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(getCategoryLabel(row.category)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "version",
							label: _ctx.$t("workflow.version"),
							width: "80",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { size: "small" }, {
								default: withCtx(() => [createTextVNode("v" + toDisplayString(row.version), 1)]),
								_: 2
							}, 1024)]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "status",
							label: _ctx.$t("workflow.status"),
							width: "100",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: getStatusType(row.status),
								size: "small"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(getStatusLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_table_column, {
							prop: "createTime",
							label: "创建时间",
							width: "170"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "260",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									size: "small",
									type: "primary",
									text: "",
									onClick: ($event) => openDesigner(row)
								}, {
									default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("设计", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								row.status !== 1 ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									type: "success",
									text: "",
									onClick: ($event) => handlePublish(row)
								}, {
									default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("发布", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								row.status === 1 ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									size: "small",
									type: "warning",
									text: "",
									onClick: ($event) => handleDisable(row)
								}, {
									default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("停用", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								createVNode(_component_el_button, {
									size: "small",
									type: "danger",
									text: "",
									onClick: ($event) => handleDelete(row)
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])
							]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])])
			])) : (openBlock(), createElementBlock("div", _hoisted_14, [
				createBaseVNode("header", _hoisted_15, [createBaseVNode("div", _hoisted_16, [createVNode(_component_el_button, {
					text: "",
					class: "builder-back",
					onClick: closeDesigner
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_left_default))]),
						_: 1
					})]),
					_: 1
				}), createBaseVNode("div", null, [createBaseVNode("h3", null, toDisplayString(editingProcess.name || "新建审批模板"), 1), createBaseVNode("p", null, toDisplayString(editingProcess.id ? "正在编辑现有流程模板" : "草稿保存在本次编辑中，发布后员工才能发起"), 1)])]), createBaseVNode("div", _hoisted_17, [createVNode(_component_el_button, { onClick: openPreview }, {
					default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("预览", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					onClick: saveProcess
				}, {
					default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("保存草稿", -1)])]),
					_: 1
				})])]),
				createBaseVNode("nav", _hoisted_18, [(openBlock(), createElementBlock(Fragment, null, renderList(workflowSteps, (step) => {
					return createBaseVNode("button", {
						key: step.key,
						type: "button",
						class: normalizeClass({ active: activeDesignStep.value === step.key }),
						onClick: ($event) => activeDesignStep.value = step.key
					}, [createBaseVNode("span", null, toDisplayString(step.no), 1), createBaseVNode("b", null, toDisplayString(step.title), 1)], 10, _hoisted_19);
				}), 64))]),
				withDirectives(createBaseVNode("section", _hoisted_20, [_cache[47] || (_cache[47] = createBaseVNode("div", { class: "panel-heading" }, [createBaseVNode("h3", null, "基础设计"), createBaseVNode("p", null, "定义审批名称、图标、分组和谁可以提交。这里决定员工在审批中心看到什么。")], -1)), createVNode(_component_el_form, {
					model: editingProcess,
					"label-width": "128px",
					class: "basic-form"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, { label: "图标" }, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_21, [createBaseVNode("span", _hoisted_22, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(getTemplateIcon(editingProcess.processKey))))]),
								_: 1
							})]), createVNode(_component_el_button, {
								plain: "",
								onClick: _cache[3] || (_cache[3] = ($event) => unref(ElMessage).info("当前按流程标识自动匹配图标，后续可接入统一图标选择器"))
							}, {
								default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("修改", -1)])]),
								_: 1
							})])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "名称",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: editingProcess.name,
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => editingProcess.name = $event),
								maxlength: "60",
								"show-word-limit": "",
								placeholder: "例如：正汐-费用报销审批"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "流程标识",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: editingProcess.processKey,
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => editingProcess.processKey = $event),
								disabled: !!editingProcess.id,
								placeholder: "例如：expense，创建后不建议修改"
							}, null, 8, ["modelValue", "disabled"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "说明" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: editingProcess.description,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => editingProcess.description = $event),
								maxlength: "120",
								"show-word-limit": "",
								placeholder: "说明这个审批适用于哪些场景"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "分组",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: editingProcess.category,
								"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => editingProcess.category = $event),
								placeholder: "请选择分组",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(categoryOptions, (item) => {
									return createVNode(_component_el_option, {
										key: item.value,
										label: item.label,
										value: item.value
									}, null, 8, ["label", "value"]);
								}), 64))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "谁可以提交" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: processSettings.submitScope,
								"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => processSettings.submitScope = $event),
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [
									createVNode(_component_el_option, {
										label: "全员",
										value: "all"
									}),
									createVNode(_component_el_option, {
										label: "指定角色",
										value: "role"
									}),
									createVNode(_component_el_option, {
										label: "仅管理员",
										value: "admin"
									})
								]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}),
						processSettings.submitScope === "role" ? (openBlock(), createBlock(_component_el_form_item, {
							key: 0,
							label: "允许发起的角色"
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: processSettings.submitRoles,
								"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => processSettings.submitRoles = $event),
								multiple: "",
								filterable: "",
								"collapse-tags": "",
								placeholder: "选择可发起该审批的角色",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(roleOptions.value, (r) => {
									return openBlock(), createBlock(_component_el_option, {
										key: r.roleKey,
										label: r.roleName,
										value: r.roleKey
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, ["model"])], 512), [[vShow, activeDesignStep.value === "basic"]]),
				withDirectives(createBaseVNode("section", _hoisted_23, [_cache[51] || (_cache[51] = createBaseVNode("div", { class: "panel-heading" }, [createBaseVNode("h3", null, "表单设计"), createBaseVNode("p", null, "从左侧添加控件，中间预览员工发起审批时看到的表单，右侧维护字段名称、类型和必填。")], -1)), createBaseVNode("div", _hoisted_24, [
					createBaseVNode("aside", _hoisted_25, [_cache[48] || (_cache[48] = createBaseVNode("div", { class: "palette-tabs" }, [createBaseVNode("span", { class: "active" }, "控件"), createBaseVNode("span", null, "控件组")], -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(fieldGroups.value, (group) => {
						return openBlock(), createElementBlock("div", {
							class: "palette-section",
							key: group.title
						}, [createBaseVNode("h4", null, toDisplayString(group.title), 1), (openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (ft) => {
							return openBlock(), createElementBlock("button", {
								key: ft.type,
								type: "button",
								class: "control-chip",
								onClick: ($event) => addFormField(ft.type)
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(ft.icon)))]),
								_: 2
							}, 1024), createBaseVNode("span", null, toDisplayString(ft.label), 1)], 8, _hoisted_26);
						}), 128))]);
					}), 128))]),
					createBaseVNode("main", _hoisted_27, [createBaseVNode("div", _hoisted_28, [createBaseVNode("div", _hoisted_29, toDisplayString(editingProcess.name || "审批模板名称"), 1), formFields.value.length ? (openBlock(), createElementBlock("div", _hoisted_30, [(openBlock(true), createElementBlock(Fragment, null, renderList(formFields.value, (field) => {
						return openBlock(), createElementBlock("div", {
							key: field.field,
							class: "preview-field"
						}, [createBaseVNode("label", null, [createTextVNode(toDisplayString(field.label), 1), field.required ? (openBlock(), createElementBlock("em", _hoisted_31, "*")) : createCommentVNode("", true)]), createBaseVNode("span", null, toDisplayString(previewFieldPlaceholder(field)), 1)]);
					}), 128))])) : (openBlock(), createElementBlock("div", _hoisted_32, "点击左侧控件添加到此处"))])]),
					createBaseVNode("aside", _hoisted_33, [_cache[50] || (_cache[50] = createBaseVNode("div", { class: "editor-title" }, [createBaseVNode("h4", null, "字段列表"), createBaseVNode("small", null, "拖动排序，配置必填与选项")], -1)), formFields.value.length ? (openBlock(), createElementBlock("div", _hoisted_34, [(openBlock(true), createElementBlock(Fragment, null, renderList(formFields.value, (f, fi) => {
						return openBlock(), createElementBlock("div", {
							key: f.field,
							class: normalizeClass(["fd-item", { "fd-item--drag": fdDragIndex.value === fi }]),
							draggable: "true",
							onDragstart: ($event) => fdDragStart(fi),
							onDragover: _cache[10] || (_cache[10] = withModifiers(() => {}, ["prevent"])),
							onDrop: ($event) => fdDrop(fi),
							onDragend: _cache[11] || (_cache[11] = ($event) => fdDragIndex.value = -1)
						}, [createVNode(_component_el_icon, { class: "fd-drag" }, {
							default: withCtx(() => [createVNode(unref(rank_default))]),
							_: 1
						}), createBaseVNode("div", _hoisted_36, [
							createVNode(_component_el_input, {
								modelValue: f.label,
								"onUpdate:modelValue": ($event) => f.label = $event,
								size: "small",
								placeholder: "字段名称"
							}, null, 8, ["modelValue", "onUpdate:modelValue"]),
							createBaseVNode("div", _hoisted_37, [
								createVNode(_component_el_select, {
									modelValue: f.type,
									"onUpdate:modelValue": ($event) => f.type = $event,
									size: "small",
									style: { "width": "112px" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(fieldTypes, (ft) => {
										return createVNode(_component_el_option, {
											key: ft.type,
											label: ft.label,
											value: ft.type
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue", "onUpdate:modelValue"]),
								createVNode(_component_el_checkbox, {
									modelValue: f.required,
									"onUpdate:modelValue": ($event) => f.required = $event,
									size: "small"
								}, {
									default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("必填", -1)])]),
									_: 1
								}, 8, ["modelValue", "onUpdate:modelValue"]),
								createVNode(_component_el_button, {
									type: "danger",
									text: "",
									size: "small",
									onClick: ($event) => formFields.value.splice(fi, 1)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(delete_default))]),
										_: 1
									})]),
									_: 1
								}, 8, ["onClick"])
							]),
							f.type === "select" || f.type === "multiselect" ? (openBlock(), createBlock(_component_el_input, {
								key: 0,
								modelValue: f._optionsText,
								"onUpdate:modelValue": ($event) => f._optionsText = $event,
								size: "small",
								placeholder: "选项用逗号分隔，例如：同意,不同意",
								onInput: ($event) => syncOptions(f)
							}, null, 8, [
								"modelValue",
								"onUpdate:modelValue",
								"onInput"
							])) : createCommentVNode("", true)
						])], 42, _hoisted_35);
					}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "还没有表单字段",
						"image-size": 58
					}))])
				])], 512), [[vShow, activeDesignStep.value === "form"]]),
				withDirectives(createBaseVNode("section", _hoisted_38, [_cache[69] || (_cache[69] = createBaseVNode("div", { class: "panel-heading" }, [createBaseVNode("h3", null, "流程设计"), createBaseVNode("p", null, "设置审批路径、条件分支、抄送人与多人审批方式。并行审批通过会签/或签落地，抄送在审批通过后生成通知记录。")], -1)), createBaseVNode("div", _hoisted_39, [
					createBaseVNode("aside", _hoisted_40, [
						_cache[56] || (_cache[56] = createBaseVNode("h4", null, "节点组件", -1)),
						createBaseVNode("button", {
							type: "button",
							class: "node-tool approval",
							onClick: _cache[12] || (_cache[12] = ($event) => addNode(Math.max(0, designerNodes.value.length - 2), "approval"))
						}, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(user_filled_default))]),
							_: 1
						})]), _cache[52] || (_cache[52] = createBaseVNode("div", null, [createBaseVNode("b", null, "审批人"), createBaseVNode("small", null, "直属上级/指定人员/角色")], -1))]),
						createBaseVNode("button", {
							type: "button",
							class: "node-tool condition",
							onClick: _cache[13] || (_cache[13] = ($event) => addNode(Math.max(0, designerNodes.value.length - 2), "condition"))
						}, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(share_default))]),
							_: 1
						})]), _cache[53] || (_cache[53] = createBaseVNode("div", null, [createBaseVNode("b", null, "条件分支"), createBaseVNode("small", null, "按金额、天数等字段分流")], -1))]),
						createBaseVNode("button", {
							type: "button",
							class: "node-tool cc",
							onClick: _cache[14] || (_cache[14] = ($event) => addNode(Math.max(0, designerNodes.value.length - 2), "cc"))
						}, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(copy_document_default))]),
							_: 1
						})]), _cache[54] || (_cache[54] = createBaseVNode("div", null, [createBaseVNode("b", null, "抄送人"), createBaseVNode("small", null, "通过后通知相关人员")], -1))]),
						createBaseVNode("button", {
							type: "button",
							class: "node-tool parallel",
							onClick: _cache[15] || (_cache[15] = ($event) => addNode(Math.max(0, designerNodes.value.length - 2), "parallel"))
						}, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(connection_default))]),
							_: 1
						})]), _cache[55] || (_cache[55] = createBaseVNode("div", null, [createBaseVNode("b", null, "并行审批"), createBaseVNode("small", null, "会签/或签多人处理")], -1))])
					]),
					createBaseVNode("main", _hoisted_41, [createBaseVNode("div", _hoisted_42, [(openBlock(true), createElementBlock(Fragment, null, renderList(designerNodes.value, (node, index) => {
						return openBlock(), createElementBlock("div", {
							key: node.id,
							class: "flow-node-wrapper"
						}, [createBaseVNode("div", {
							class: normalizeClass(["flow-node", ["flow-node--" + node.type, { "flow-node--parallel": node.type === "approval" && !!node.signMode && node.signMode !== "single" }]]),
							onClick: ($event) => editNode(node)
						}, [createBaseVNode("div", _hoisted_44, [createBaseVNode("span", null, toDisplayString(nodeTypeLabel(node.type, node)), 1), node.type !== "start" && node.type !== "end" ? (openBlock(), createBlock(_component_el_icon, {
							key: 0,
							class: "flow-node__delete",
							onClick: withModifiers(($event) => removeNode(index), ["stop"])
						}, {
							default: withCtx(() => [createVNode(unref(close_default))]),
							_: 1
						}, 8, ["onClick"])) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_45, [createBaseVNode("strong", null, toDisplayString(node.name), 1), createBaseVNode("span", null, toDisplayString(nodeMetaLabel(node)), 1)])], 10, _hoisted_43), index < designerNodes.value.length - 1 ? (openBlock(), createElementBlock("div", _hoisted_46, [
							_cache[61] || (_cache[61] = createBaseVNode("div", { class: "flow-line" }, null, -1)),
							createVNode(_component_el_dropdown, {
								trigger: "click",
								onCommand: (cmd) => addNode(index, cmd)
							}, {
								dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
									default: withCtx(() => [
										createVNode(_component_el_dropdown_item, { command: "approval" }, {
											default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("审批人", -1)])]),
											_: 1
										}),
										createVNode(_component_el_dropdown_item, { command: "condition" }, {
											default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("条件分支", -1)])]),
											_: 1
										}),
										createVNode(_component_el_dropdown_item, { command: "cc" }, {
											default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("抄送人", -1)])]),
											_: 1
										}),
										createVNode(_component_el_dropdown_item, { command: "parallel" }, {
											default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("并行审批", -1)])]),
											_: 1
										})
									]),
									_: 1
								})]),
								default: withCtx(() => [createVNode(_component_el_button, {
									circle: "",
									type: "primary",
									class: "flow-add-btn__trigger"
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(plus_default))]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}, 8, ["onCommand"]),
							_cache[62] || (_cache[62] = createBaseVNode("div", { class: "flow-line" }, null, -1))
						])) : createCommentVNode("", true)]);
					}), 128))])]),
					createBaseVNode("aside", _hoisted_47, [
						_cache[68] || (_cache[68] = createBaseVNode("h4", null, "当前流程检查", -1)),
						createBaseVNode("div", _hoisted_48, [_cache[63] || (_cache[63] = createBaseVNode("span", null, "节点数", -1)), createBaseVNode("b", null, toDisplayString(designerNodes.value.length), 1)]),
						createBaseVNode("div", _hoisted_49, [_cache[64] || (_cache[64] = createBaseVNode("span", null, "审批节点", -1)), createBaseVNode("b", null, toDisplayString(designerNodes.value.filter((n) => n.type === "approval").length), 1)]),
						createBaseVNode("div", _hoisted_50, [_cache[65] || (_cache[65] = createBaseVNode("span", null, "条件分支", -1)), createBaseVNode("b", null, toDisplayString(designerNodes.value.filter((n) => n.type === "condition").length), 1)]),
						createBaseVNode("div", _hoisted_51, [_cache[66] || (_cache[66] = createBaseVNode("span", null, "抄送节点", -1)), createBaseVNode("b", null, toDisplayString(designerNodes.value.filter((n) => n.type === "cc").length), 1)]),
						createBaseVNode("div", _hoisted_52, [_cache[67] || (_cache[67] = createBaseVNode("span", null, "并行审批", -1)), createBaseVNode("b", null, toDisplayString(designerNodes.value.filter((n) => n.type === "approval" && !!n.signMode && n.signMode !== "single").length), 1)]),
						createVNode(_component_el_alert, {
							type: "info",
							closable: false,
							"show-icon": "",
							title: "点击流程节点可编辑审批人、会签/或签、抄送人与条件目标。"
						})
					])
				])], 512), [[vShow, activeDesignStep.value === "flow"]]),
				withDirectives(createBaseVNode("section", _hoisted_53, [_cache[77] || (_cache[77] = createBaseVNode("div", { class: "panel-heading" }, [createBaseVNode("h3", null, "更多设置"), createBaseVNode("p", null, "配置撤回规则与抄送人员。以下开关均真实生效(撤回策略由后端 cancel 校验、发起范围由后端 start 校验)。")], -1)), createBaseVNode("div", _hoisted_54, [createBaseVNode("section", _hoisted_55, [
					_cache[73] || (_cache[73] = createBaseVNode("h4", null, "撤回策略", -1)),
					createBaseVNode("label", _hoisted_56, [createVNode(_component_el_checkbox, {
						modelValue: processSettings.allowWithdrawBeforeApproval,
						"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => processSettings.allowWithdrawBeforeApproval = $event)
					}, null, 8, ["modelValue"]), _cache[70] || (_cache[70] = createBaseVNode("span", null, "第一个审批节点通过前，允许提交人撤销申请", -1))]),
					createBaseVNode("label", _hoisted_57, [
						createVNode(_component_el_checkbox, {
							modelValue: processSettings.allowWithdrawAfterApproval,
							"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => processSettings.allowWithdrawAfterApproval = $event)
						}, null, 8, ["modelValue"]),
						_cache[71] || (_cache[71] = createBaseVNode("span", null, "已有节点通过后，允许在", -1)),
						createVNode(_component_el_input_number, {
							modelValue: processSettings.withdrawDays,
							"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => processSettings.withdrawDays = $event),
							min: 1,
							max: 365,
							"controls-position": "right"
						}, null, 8, ["modelValue"]),
						_cache[72] || (_cache[72] = createBaseVNode("span", null, "天内撤销", -1))
					]),
					_cache[74] || (_cache[74] = createBaseVNode("p", { class: "settings-hint" }, "批量审批已是审批中心待办页的通用能力(多选后一键同意),无需在此逐流程开关。", -1))
				]), createBaseVNode("section", _hoisted_58, [
					_cache[76] || (_cache[76] = createBaseVNode("h4", null, "抄送设置", -1)),
					createBaseVNode("label", _hoisted_59, [createVNode(_component_el_checkbox, {
						modelValue: ccInitiator.value,
						"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => ccInitiator.value = $event)
					}, null, 8, ["modelValue"]), _cache[75] || (_cache[75] = createBaseVNode("span", null, "审批通过后抄送发起人", -1))]),
					createVNode(_component_el_select, {
						modelValue: ccUserIds.value,
						"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => ccUserIds.value = $event),
						multiple: "",
						filterable: "",
						"collapse-tags": "",
						placeholder: "抄送指定成员，可多选",
						style: { "width": "100%" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(userOptions.value, (u) => {
							return openBlock(), createBlock(_component_el_option, {
								key: u.id,
								label: u.name,
								value: u.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"])
				])])], 512), [[vShow, activeDesignStep.value === "settings"]]),
				createVNode(_component_el_dialog, {
					modelValue: nodeDialogVisible.value,
					"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => nodeDialogVisible.value = $event),
					title: _ctx.$t("workflow.nodeConfig"),
					width: "500px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[32] || (_cache[32] = ($event) => nodeDialogVisible.value = false) }, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.cancel")), 1)]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: saveNodeConfig
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(_ctx.$t("common.confirm")), 1)]),
						_: 1
					})]),
					default: withCtx(() => [editingNode.value ? (openBlock(), createBlock(_component_el_form, {
						key: 0,
						model: editingNode.value,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: _ctx.$t("workflow.nodeName") }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: editingNode.value.name,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => editingNode.value.name = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							editingNode.value.type === "approval" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
								createVNode(_component_el_form_item, { label: "签署方式" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: editingNode.value.signMode,
										"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => editingNode.value.signMode = $event)
									}, {
										default: withCtx(() => [
											createVNode(_component_el_option, {
												label: "单人审批",
												value: "single"
											}),
											createVNode(_component_el_option, {
												label: "会签：全部同意才通过",
												value: "and"
											}),
											createVNode(_component_el_option, {
												label: "或签：任一同意即通过",
												value: "or"
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								!editingNode.value.signMode || editingNode.value.signMode === "single" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
									createVNode(_component_el_form_item, { label: _ctx.$t("workflow.assigneeType") }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: editingNode.value.assigneeType,
											"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => editingNode.value.assigneeType = $event),
											onChange: onAssigneeTypeChange
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "直属上级",
													value: "supervisor"
												}),
												createVNode(_component_el_option, {
													label: "部门主管",
													value: "dept_manager"
												}),
												createVNode(_component_el_option, {
													label: _ctx.$t("workflow.specifyUser"),
													value: "user"
												}, null, 8, ["label"]),
												createVNode(_component_el_option, {
													label: _ctx.$t("workflow.specifyRole"),
													value: "role"
												}, null, 8, ["label"])
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}, 8, ["label"]),
									editingNode.value.assigneeType === "user" || editingNode.value.assigneeType === "role" ? (openBlock(), createBlock(_component_el_form_item, {
										key: 0,
										label: _ctx.$t("workflow.assignee")
									}, {
										default: withCtx(() => [editingNode.value.assigneeType === "user" ? (openBlock(), createBlock(_component_el_select, {
											key: 0,
											modelValue: specifyUserIds.value,
											"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => specifyUserIds.value = $event),
											multiple: "",
											filterable: "",
											"collapse-tags": "",
											placeholder: "选择指定人员,可多选",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(userOptions.value, (u) => {
												return openBlock(), createBlock(_component_el_option, {
													key: u.id,
													label: u.name,
													value: u.id
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])) : editingNode.value.assigneeType === "role" ? (openBlock(), createBlock(_component_el_select, {
											key: 1,
											modelValue: editingNode.value.assigneeValue,
											"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => editingNode.value.assigneeValue = $event),
											filterable: "",
											placeholder: "选择角色",
											style: { "width": "100%" },
											onChange: _cache[26] || (_cache[26] = ($event) => checkAssignee("role", editingNode.value.assigneeValue))
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(roleOptions.value, (r) => {
												return openBlock(), createBlock(_component_el_option, {
													key: r.roleKey,
													label: r.roleName,
													value: r.roleKey
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])) : createCommentVNode("", true), editingNode.value.assigneeType === "user" ? (openBlock(), createElementBlock("div", _hoisted_60, "指定多人时,任一人同意即通过(或签);需全部同意请改用上方\"会签\"")) : createCommentVNode("", true)]),
										_: 1
									}, 8, ["label"])) : createCommentVNode("", true),
									assigneeWarning.value ? (openBlock(), createBlock(_component_el_alert, {
										key: 1,
										title: assigneeWarning.value,
										type: "warning",
										closable: false,
										"show-icon": "",
										style: { "margin-bottom": "12px" }
									}, null, 8, ["title"])) : createCommentVNode("", true)
								], 64)) : (openBlock(), createBlock(_component_el_form_item, {
									key: 1,
									label: "审批人(多人)"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: approverUserIds.value,
										"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => approverUserIds.value = $event),
										multiple: "",
										filterable: "",
										placeholder: "选择多个审批人",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(userOptions.value, (u) => {
											return openBlock(), createBlock(_component_el_option, {
												key: u.id,
												label: u.name,
												value: u.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})),
								createVNode(_component_el_form_item, { label: "审批时限" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: editingNode.value.timeoutHours,
										"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => editingNode.value.timeoutHours = $event),
										min: 0,
										max: 720,
										step: 1,
										controls: false,
										placeholder: "小时",
										style: { "width": "120px" }
									}, null, 8, ["modelValue"]), _cache[78] || (_cache[78] = createBaseVNode("span", {
										class: "assignee-multi-hint",
										style: { "margin-left": "8px" }
									}, "小时;超时未处理系统自动提醒审批人,0或留空=不限时", -1))]),
									_: 1
								})
							], 64)) : createCommentVNode("", true),
							editingNode.value.type === "condition" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
								_cache[81] || (_cache[81] = createBaseVNode("div", { class: "cond-hint" }, "按表单里的数值字段判断,满足则走到指定节点(从上到下匹配,都不满足走默认下一节点)", -1)),
								(openBlock(true), createElementBlock(Fragment, null, renderList(editingNode.value.conditions, (cond, ci) => {
									return openBlock(), createElementBlock("div", {
										key: ci,
										class: "condition-row"
									}, [
										_cache[79] || (_cache[79] = createBaseVNode("span", { class: "cond-label" }, "当", -1)),
										createVNode(_component_el_select, {
											modelValue: cond.field,
											"onUpdate:modelValue": ($event) => cond.field = $event,
											placeholder: "字段",
											style: { "width": "130px" },
											onChange: ($event) => syncCondExpr(cond)
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(conditionFields.value, (f) => {
												return openBlock(), createBlock(_component_el_option, {
													key: f.field,
													label: f.label,
													value: f.field
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"onChange"
										]),
										createVNode(_component_el_select, {
											modelValue: cond.op,
											"onUpdate:modelValue": ($event) => cond.op = $event,
											style: {
												"width": "78px",
												"margin-left": "6px"
											},
											onChange: ($event) => syncCondExpr(cond)
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(condOps, (o) => {
												return createVNode(_component_el_option, {
													key: o,
													label: o,
													value: o
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"onChange"
										]),
										createVNode(_component_el_input_number, {
											modelValue: cond.value,
											"onUpdate:modelValue": ($event) => cond.value = $event,
											controls: false,
											placeholder: "值",
											style: {
												"width": "100px",
												"margin-left": "6px"
											},
											onChange: ($event) => syncCondExpr(cond)
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"onChange"
										]),
										_cache[80] || (_cache[80] = createBaseVNode("span", {
											class: "cond-label",
											style: { "margin-left": "6px" }
										}, "→", -1)),
										createVNode(_component_el_select, {
											modelValue: cond.nextNode,
											"onUpdate:modelValue": ($event) => cond.nextNode = $event,
											placeholder: "目标节点",
											style: {
												"width": "140px",
												"margin-left": "6px"
											}
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(targetNodeOptions.value, (n) => {
												return openBlock(), createBlock(_component_el_option, {
													key: n.id,
													label: n.name,
													value: n.id
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"]),
										createVNode(_component_el_button, {
											type: "danger",
											text: "",
											onClick: ($event) => editingNode.value.conditions.splice(ci, 1)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(delete_default))]),
												_: 1
											})]),
											_: 1
										}, 8, ["onClick"])
									]);
								}), 128)),
								createVNode(_component_el_button, {
									type: "primary",
									text: "",
									onClick: _cache[29] || (_cache[29] = ($event) => editingNode.value.conditions.push({
										expression: "",
										nextNode: "",
										field: "",
										op: ">",
										value: 0
									}))
								}, {
									default: withCtx(() => [createTextVNode(" + " + toDisplayString(_ctx.$t("workflow.addCondition")), 1)]),
									_: 1
								})
							], 64)) : createCommentVNode("", true),
							editingNode.value.type === "cc" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [createVNode(_component_el_alert, {
								type: "info",
								closable: false,
								"show-icon": "",
								title: "抄送节点不进入审批待办，审批通过后会生成抄送记录。",
								class: "cc-node-tip"
							}), createVNode(_component_el_form_item, { label: "抄送对象" }, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_61, [createVNode(_component_el_checkbox, {
									modelValue: ccNodeInitiator.value,
									"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => ccNodeInitiator.value = $event)
								}, {
									default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("抄送发起人", -1)])]),
									_: 1
								}, 8, ["modelValue"]), createVNode(_component_el_select, {
									modelValue: ccNodeUserIds.value,
									"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => ccNodeUserIds.value = $event),
									multiple: "",
									filterable: "",
									"collapse-tags": "",
									placeholder: "选择指定成员，可多选",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(userOptions.value, (u) => {
										return openBlock(), createBlock(_component_el_option, {
											key: u.id,
											label: u.name,
											value: u.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])])]),
								_: 1
							})], 64)) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["model"])) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: previewVisible.value,
					"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => previewVisible.value = $event),
					title: "表单预览(员工发起时所见)",
					width: "480px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[34] || (_cache[34] = ($event) => previewVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_62, [createBaseVNode("div", _hoisted_63, toDisplayString(editingProcess.name || "审批申请"), 1), createVNode(_component_el_form, {
						"label-position": "top",
						class: "preview-phone__form"
					}, {
						default: withCtx(() => [createVNode(ApprovalFormFields_default, {
							"form-config": previewFields.value,
							"model-value": previewValues,
							readonly: ""
						}, null, 8, ["form-config", "model-value"])]),
						_: 1
					})])]),
					_: 1
				}, 8, ["modelValue"])
			]))]);
		};
	}
}), [["__scopeId", "data-v-8b1b6124"]]);
//#endregion
export { designer_default as default };

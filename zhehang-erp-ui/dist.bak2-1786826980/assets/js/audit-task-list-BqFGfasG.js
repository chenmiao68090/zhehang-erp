import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Er as withKeys, F as ElEmpty, H as ElDescriptions, M as ElInputNumber, Q as ElRadioGroup, T as ElProgress, U as ElDescriptionsItem, V as ElDialog, W as ElDatePicker, X as ElRadio, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source.production-DbokqIsz.js";
import { n as createTaskRequestKey, t as TaskConfigDialog_default } from "./common.scss_vue_type_style_index_0_src_true_lang-xUwxK3Ya.js";
//#region src/views/task-workbench/components/AuditTaskCreateDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = {
	key: 1,
	class: "empty-action"
};
var _hoisted_2$2 = { class: "form-grid" };
var _hoisted_3$2 = { class: "field-help" };
//#endregion
//#region src/views/task-workbench/components/AuditTaskCreateDialog.vue
var AuditTaskCreateDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "AuditTaskCreateDialog",
	props: {
		taskType: {},
		processes: {},
		staff: {},
		orders: {}
	},
	emits: ["create", "configure"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = ref(false);
		const saving = ref(false);
		const formRef = ref();
		const form = reactive({});
		const enabledProcesses = computed(() => props.processes.filter((item) => Number(item.enabled) === 1));
		const selectedProcess = computed(() => enabledProcesses.value.find((item) => item.id === Number(form.processId)));
		const taskTypeLabel = computed(() => ({
			once: "一次性任务",
			recurring: "周期任务",
			project_dept: "项目部门任务",
			special: "专项任务"
		})[props.taskType]);
		const rules = computed(() => ({
			processId: [{
				required: true,
				message: "请选择审批流程",
				trigger: "change"
			}],
			companyName: [{
				required: true,
				message: "请输入公司名称",
				trigger: "blur"
			}],
			businessOwnerId: [{
				required: true,
				message: "请选择业务负责人",
				trigger: "change"
			}],
			teamName: form.scopeType === "team" ? [{
				required: true,
				message: "请输入团队或项目部门名称",
				trigger: "blur"
			}] : [],
			startMonth: props.taskType === "recurring" ? [{
				required: true,
				message: "请选择服务开始月",
				trigger: "change"
			}] : [],
			endMonth: props.taskType === "recurring" ? [{
				required: true,
				message: "请选择服务结束月",
				trigger: "change"
			}] : []
		}));
		function reset() {
			var _enabledProcesses$val;
			Object.assign(form, {
				processId: (_enabledProcesses$val = enabledProcesses.value[0]) === null || _enabledProcesses$val === void 0 ? void 0 : _enabledProcesses$val.id,
				orderId: void 0,
				orderNo: "",
				companyName: "",
				businessTypeCode: "",
				businessTypeName: "",
				businessOwnerId: void 0,
				scopeType: props.taskType === "project_dept" ? "team" : "personal",
				teamName: "",
				region: "",
				amount: 0,
				expenseAmount: 0,
				startMonth: "",
				endMonth: "",
				servicePersonId: void 0,
				remarks: "",
				finalConfirm: 0
			});
			handleProcessChange();
		}
		function open() {
			reset();
			form.requestKey = createTaskRequestKey();
			visible.value = true;
		}
		function handleProcessChange() {
			const process = selectedProcess.value;
			form.businessTypeCode = (process === null || process === void 0 ? void 0 : process.businessTypeCode) || "";
			if (props.taskType === "special") form.businessTypeName = (process === null || process === void 0 ? void 0 : process.processName) || "";
		}
		function handleOrderChange(id) {
			var _selectedProcess$valu;
			const order = props.orders.find((item) => item.id === Number(id));
			if (!order) return;
			form.orderNo = order.orderNo;
			form.companyName = order.companyName;
			form.region = order.region || "";
			form.amount = Number(order.amount || 0);
			if (props.taskType !== "special") form.businessTypeName = order.businessType || "";
			if (!((_selectedProcess$valu = selectedProcess.value) === null || _selectedProcess$valu === void 0 ? void 0 : _selectedProcess$valu.businessTypeCode)) form.businessTypeCode = order.businessType || "";
			if (order.salesmanId && props.staff.some((item) => item.id === order.salesmanId)) form.businessOwnerId = order.salesmanId;
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value, _selectedProcess$valu2, _selectedProcess$valu3;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate())) return;
				if (props.taskType === "special" && !((_selectedProcess$valu2 = selectedProcess.value) === null || _selectedProcess$valu2 === void 0 ? void 0 : _selectedProcess$valu2.businessTypeCode)) return ElMessage.warning("专项流程尚未配置专项类型编码");
				if (props.taskType === "recurring" && form.startMonth > form.endMonth) return ElMessage.warning("服务结束月不能早于开始月");
				emit("create", {
					requestKey: form.requestKey,
					processId: Number(form.processId),
					orderId: form.orderId || void 0,
					orderNo: form.orderNo.trim() || void 0,
					companyName: form.companyName.trim(),
					businessTypeCode: ((_selectedProcess$valu3 = selectedProcess.value) === null || _selectedProcess$valu3 === void 0 ? void 0 : _selectedProcess$valu3.businessTypeCode) || void 0,
					businessTypeName: form.businessTypeName.trim() || void 0,
					businessOwnerId: Number(form.businessOwnerId),
					scopeType: form.scopeType,
					teamName: form.scopeType === "team" ? form.teamName.trim() : void 0,
					region: form.region.trim() || void 0,
					amount: Number(form.amount || 0),
					expenseAmount: Number(form.expenseAmount || 0),
					startMonth: props.taskType === "recurring" ? form.startMonth : void 0,
					endMonth: props.taskType === "recurring" ? form.endMonth : void 0,
					servicePersonId: form.servicePersonId || void 0,
					remarks: form.remarks.trim() || void 0,
					finalConfirm: Number(form.finalConfirm || 0)
				});
			});
			return _submit.apply(this, arguments);
		}
		function setSaving(value, close = false) {
			saving.value = value;
			if (close) visible.value = false;
		}
		function processLabel(item) {
			const special = props.taskType === "special" && item.businessTypeCode ? ` · ${item.businessTypeCode}` : "";
			return `${item.processName}${special}`;
		}
		function orderLabel(item) {
			return `${item.orderNo} · ${item.companyName}${item.businessType ? ` · ${item.businessType}` : ""}`;
		}
		function staffLabel(item) {
			return `${item.name}${item.deptName ? ` · ${item.deptName}` : ""}`;
		}
		__expose({
			open,
			setSaving
		});
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_button = ElButton;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input_number = ElInputNumber;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => visible.value = $event),
				title: `手工补发${taskTypeLabel.value}`,
				width: "min(820px, 96vw)",
				top: "4vh",
				"append-to-body": "",
				"destroy-on-close": "",
				"close-on-click-modal": false
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[17] || (_cache[17] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					disabled: !enabledProcesses.value.length,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("创建任务", -1)])]),
					_: 1
				}, 8, ["loading", "disabled"])]),
				default: withCtx(() => [
					!enabledProcesses.value.length ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						type: "warning",
						"show-icon": "",
						closable: false,
						title: "当前没有已启用的审批流程",
						description: "请先配置并启用流程，再创建任务。专项类型也在专项审批流程中配置。"
					})) : createCommentVNode("", true),
					!enabledProcesses.value.length ? (openBlock(), createElementBlock("div", _hoisted_1$2, [createVNode(_component_el_button, {
						type: "primary",
						link: "",
						onClick: _cache[0] || (_cache[0] = ($event) => emit("configure"))
					}, {
						default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("立即配置流程", -1)])]),
						_: 1
					})])) : (openBlock(), createBlock(_component_el_alert, {
						key: 2,
						type: "info",
						"show-icon": "",
						closable: false,
						title: "手工补发不会修改关联订单",
						description: "可补充未命中自动规则或生成失败的任务；审批人与动态表单以所选流程为准。"
					})),
					createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form,
						rules: rules.value,
						"label-position": "top",
						class: "create-form"
					}, {
						default: withCtx(() => [
							createBaseVNode("div", _hoisted_2$2, [
								createVNode(_component_el_form_item, {
									label: "审批流程",
									prop: "processId"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.processId,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.processId = $event),
										filterable: "",
										placeholder: "请选择已启用流程",
										style: { "width": "100%" },
										onChange: handleProcessChange
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(enabledProcesses.value, (item) => {
											return openBlock(), createBlock(_component_el_option, {
												key: item.id,
												label: processLabel(item),
												value: item.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								__props.taskType === "special" ? (openBlock(), createBlock(_component_el_form_item, {
									key: 0,
									label: "专项类型"
								}, {
									default: withCtx(() => {
										var _selectedProcess$valu4, _selectedProcess$valu5;
										return [createVNode(_component_el_input, {
											"model-value": ((_selectedProcess$valu4 = selectedProcess.value) === null || _selectedProcess$valu4 === void 0 ? void 0 : _selectedProcess$valu4.processName) || "",
											disabled: "",
											placeholder: "随专项流程确定"
										}, null, 8, ["model-value"]), createBaseVNode("div", _hoisted_3$2, "类型编码：" + toDisplayString(((_selectedProcess$valu5 = selectedProcess.value) === null || _selectedProcess$valu5 === void 0 ? void 0 : _selectedProcess$valu5.businessTypeCode) || "尚未配置"), 1)];
									}),
									_: 1
								})) : (openBlock(), createBlock(_component_el_form_item, {
									key: 1,
									label: "业务类型"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.businessTypeName,
										"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.businessTypeName = $event),
										maxlength: "150",
										placeholder: "选填，例如代理记账"
									}, null, 8, ["modelValue"])]),
									_: 1
								})),
								createVNode(_component_el_form_item, { label: "关联订单" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.orderId,
										"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.orderId = $event),
										filterable: "",
										clearable: "",
										placeholder: "选填；选择后自动带入订单资料",
										style: { "width": "100%" },
										onChange: handleOrderChange
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.orders, (item) => {
											return openBlock(), createBlock(_component_el_option, {
												key: item.id,
												label: orderLabel(item),
												value: item.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"]), _cache[20] || (_cache[20] = createBaseVNode("div", { class: "field-help" }, "不关联订单仍可补发，但费用与订单流程记录不可联查。", -1))]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "公司名称",
									prop: "companyName"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.companyName,
										"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.companyName = $event),
										maxlength: "200",
										placeholder: "请输入公司名称"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "订单编号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.orderNo,
										"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.orderNo = $event),
										maxlength: "64",
										placeholder: "选填，便于业务核对"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "业务负责人",
									prop: "businessOwnerId"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.businessOwnerId,
										"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.businessOwnerId = $event),
										filterable: "",
										placeholder: "请选择任务归属人员",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (item) => {
											return openBlock(), createBlock(_component_el_option, {
												key: item.id,
												label: staffLabel(item),
												value: item.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "服务人员" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.servicePersonId,
										"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.servicePersonId = $event),
										filterable: "",
										clearable: "",
										placeholder: "选填",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (item) => {
											return openBlock(), createBlock(_component_el_option, {
												key: item.id,
												label: staffLabel(item),
												value: item.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "查看范围" }, {
									default: withCtx(() => [createVNode(_component_el_radio_group, {
										modelValue: form.scopeType,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.scopeType = $event)
									}, {
										default: withCtx(() => [createVNode(_component_el_radio_button, { value: "personal" }, {
											default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("个人", -1)])]),
											_: 1
										}), createVNode(_component_el_radio_button, { value: "team" }, {
											default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("团队", -1)])]),
											_: 1
										})]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								form.scopeType === "team" ? (openBlock(), createBlock(_component_el_form_item, {
									key: 2,
									label: "团队 / 项目部门",
									prop: "teamName"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.teamName,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.teamName = $event),
										maxlength: "150",
										placeholder: "请输入团队或项目部门名称"
									}, null, 8, ["modelValue"])]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_form_item, { label: "所属地区" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.region,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.region = $event),
										maxlength: "150",
										placeholder: "选填"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								__props.taskType === "recurring" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [createVNode(_component_el_form_item, {
									label: "服务开始月",
									prop: "startMonth"
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: form.startMonth,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.startMonth = $event),
										type: "month",
										"value-format": "YYYY-MM",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}), createVNode(_component_el_form_item, {
									label: "服务结束月",
									prop: "endMonth"
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: form.endMonth,
										"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.endMonth = $event),
										type: "month",
										"value-format": "YYYY-MM",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})], 64)) : createCommentVNode("", true),
								createVNode(_component_el_form_item, { label: "订单金额" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: form.amount,
										"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.amount = $event),
										min: 0,
										precision: 2,
										"controls-position": "right",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "已知费用金额" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: form.expenseAmount,
										"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.expenseAmount = $event),
										min: 0,
										precision: 2,
										"controls-position": "right",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_form_item, { label: "任务备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.remarks,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.remarks = $event),
									type: "textarea",
									rows: 3,
									maxlength: "1000",
									"show-word-limit": "",
									placeholder: "填写交付要求或补发原因"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "最终确认" }, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: form.finalConfirm,
									"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.finalConfirm = $event),
									"active-value": 1,
									"inactive-value": 0
								}, null, 8, ["modelValue"]), _cache[23] || (_cache[23] = createBaseVNode("span", { class: "switch-help" }, "开启后，最终步骤必须由业务负责人本人确认。", -1))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model", "rules"])
				]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-a5c7f639"]]);
//#endregion
//#region src/views/task-workbench/components/TaskAuditDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "audit-dialog-body" };
var _hoisted_2$1 = { class: "audit-section" };
var _hoisted_3$1 = { class: "amount primary" };
var _hoisted_4$1 = { key: 0 };
var _hoisted_5$1 = { class: "amount warning" };
var _hoisted_6$1 = {
	key: 1,
	class: "parallel-block"
};
var _hoisted_7$1 = { class: "audit-section" };
var _hoisted_8$1 = {
	key: 0,
	class: "dynamic-grid"
};
var _hoisted_9$1 = {
	key: 1,
	class: "indicator-card"
};
var _hoisted_10$1 = {
	key: 2,
	class: "indicator-card"
};
var _hoisted_11$1 = { class: "minor-title row-between" };
var _hoisted_12$1 = {
	key: 3,
	class: "indicator-card conversion-grid"
};
var _hoisted_13$1 = { class: "audit-section" };
//#endregion
//#region src/views/task-workbench/components/TaskAuditDialog.vue
var TaskAuditDialog_default = /* @__PURE__ */ defineComponent({
	__name: "TaskAuditDialog",
	props: {
		modelValue: { type: Boolean },
		task: { default: () => ({}) },
		detail: { default: () => ({}) },
		staff: { default: () => [] },
		capabilities: { default: () => ({
			manager: false,
			bridgeManage: false,
			bridgeTriggerSupported: false,
			contractConversionSupported: false,
			addressConversionSupported: false
		}) },
		loading: {
			type: Boolean,
			default: false
		},
		submitting: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue", "submit"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		const info = computed(() => {
			var _props$detail;
			return _objectSpread2(_objectSpread2({}, props.task || {}), ((_props$detail = props.detail) === null || _props$detail === void 0 ? void 0 : _props$detail.task) || props.detail || {});
		});
		const parallelTasks = computed(() => {
			var _props$detail2;
			return ((_props$detail2 = props.detail) === null || _props$detail2 === void 0 ? void 0 : _props$detail2.parallelTasks) || info.value.parallelTasks || [];
		});
		const indicators = computed(() => {
			var _props$detail3;
			return ((_props$detail3 = props.detail) === null || _props$detail3 === void 0 ? void 0 : _props$detail3.indicators) || info.value.indicators || [];
		});
		const selectedParallel = computed(() => parallelTasks.value.find((item) => String(item.id) === form.selectedTaskId));
		const isFinalConfirm = computed(() => {
			var _selectedParallel$val, _selectedParallel$val2;
			return Boolean((_selectedParallel$val = (_selectedParallel$val2 = selectedParallel.value) === null || _selectedParallel$val2 === void 0 ? void 0 : _selectedParallel$val2.isFinalConfirm) !== null && _selectedParallel$val !== void 0 ? _selectedParallel$val : info.value.isFinalConfirm);
		});
		const hasNextAuditor = computed(() => indicators.value.some((item) => item.indicatorType === "next_auditor"));
		const hasCostInput = computed(() => indicators.value.some((item) => item.indicatorType === "cost_input"));
		const hasConvertContract = computed(() => indicators.value.some((item) => item.indicatorType === "convert_contract"));
		const hasConvertAddress = computed(() => indicators.value.some((item) => item.indicatorType === "convert_address"));
		const contractConversionSupported = computed(() => props.capabilities.contractConversionSupported);
		const addressConversionSupported = computed(() => props.capabilities.addressConversionSupported);
		const showContractConversion = computed(() => hasConvertContract.value && contractConversionSupported.value);
		const showAddressConversion = computed(() => hasConvertAddress.value && addressConversionSupported.value);
		const hasVisibleIndicators = computed(() => hasNextAuditor.value || hasCostInput.value || showContractConversion.value || showAddressConversion.value);
		const dynamicFields = computed(() => {
			var _ref, _ref2, _ref3, _props$detail$formFie, _props$detail4, _props$detail5;
			const source = (_ref = (_ref2 = (_ref3 = (_props$detail$formFie = (_props$detail4 = props.detail) === null || _props$detail4 === void 0 ? void 0 : _props$detail4.formFields) !== null && _props$detail$formFie !== void 0 ? _props$detail$formFie : (_props$detail5 = props.detail) === null || _props$detail5 === void 0 || (_props$detail5 = _props$detail5.formConfig) === null || _props$detail5 === void 0 ? void 0 : _props$detail5.fields) !== null && _ref3 !== void 0 ? _ref3 : info.value.formFields) !== null && _ref2 !== void 0 ? _ref2 : info.value.fields) !== null && _ref !== void 0 ? _ref : [];
			if (Array.isArray(source)) return source.map(normalizeField);
			if (typeof source === "string") try {
				const parsed = JSON.parse(source);
				return (Array.isArray(parsed) ? parsed : (parsed === null || parsed === void 0 ? void 0 : parsed.fields) || []).map(normalizeField);
			} catch (_unused) {
				return [];
			}
			return [];
		});
		const form = reactive({
			selectedTaskId: "",
			result: "approved",
			rejectReason: "",
			remark: "",
			nextAuditorId: void 0,
			dynamicData: {},
			costItems: [],
			convertContract: false,
			convertAddress: false
		});
		watch(() => props.modelValue, (open) => {
			var _ref4, _first$id;
			if (!open) return;
			const first = parallelTasks.value[0];
			form.selectedTaskId = String((_ref4 = (_first$id = first === null || first === void 0 ? void 0 : first.id) !== null && _first$id !== void 0 ? _first$id : info.value.id) !== null && _ref4 !== void 0 ? _ref4 : "");
			form.result = "approved";
			form.rejectReason = "";
			form.remark = "";
			form.nextAuditorId = void 0;
			form.dynamicData = {};
			form.costItems = [];
			form.convertContract = false;
			form.convertAddress = false;
			for (const field of dynamicFields.value) {
				var _ref5, _ref6, _info$value$formValue, _info$value$formValue2;
				form.dynamicData[field.key] = (_ref5 = (_ref6 = (_info$value$formValue = (_info$value$formValue2 = info.value.formValues) === null || _info$value$formValue2 === void 0 ? void 0 : _info$value$formValue2[field.key]) !== null && _info$value$formValue !== void 0 ? _info$value$formValue : field.defaultValue) !== null && _ref6 !== void 0 ? _ref6 : field.value) !== null && _ref5 !== void 0 ? _ref5 : "";
			}
			if (hasCostInput.value) addCost();
		});
		function normalizeField(field, index) {
			return _objectSpread2(_objectSpread2({}, field), {}, {
				key: field.key || field.code || field.field || `field_${index}`,
				label: field.label || field.title || field.name || `字段${index + 1}`,
				type: { text: "input" }[field.fieldType] || field.type || field.fieldType || field.componentType || "input"
			});
		}
		function addCost() {
			form.costItems.push({
				expenseName: "",
				categoryName: "",
				amount: 0,
				remark: ""
			});
		}
		function staffId(item) {
			var _ref7, _item$id;
			return (_ref7 = (_item$id = item.id) !== null && _item$id !== void 0 ? _item$id : item.userId) !== null && _ref7 !== void 0 ? _ref7 : item.value;
		}
		function staffName(item) {
			var _ref8, _ref9, _item$name;
			return (_ref8 = (_ref9 = (_item$name = item.name) !== null && _item$name !== void 0 ? _item$name : item.realName) !== null && _ref9 !== void 0 ? _ref9 : item.userName) !== null && _ref8 !== void 0 ? _ref8 : item.label;
		}
		function money(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		const taskTypeText = computed(() => ({
			once: "一次性任务",
			recurring: "周期任务",
			project_dept: "项目部门任务",
			special: "专项任务"
		})[info.value.taskType] || info.value.taskTypeName || "-");
		const taskTypeTag = computed(() => ({
			once: "primary",
			recurring: "success",
			project_dept: "warning",
			special: "danger"
		})[info.value.taskType] || "info");
		function submit() {
			if (form.result === "rejected" && !form.rejectReason.trim()) return ElMessage.warning("请填写驳回原因");
			if (form.result === "approved") {
				for (const field of dynamicFields.value) if (field.required && (form.dynamicData[field.key] === "" || form.dynamicData[field.key] == null)) return ElMessage.warning(`请填写${field.label}`);
				if (hasNextAuditor.value && !form.nextAuditorId && !isFinalConfirm.value) return ElMessage.warning("请选择下个审批人员");
				if (hasCostInput.value && form.costItems.some((item) => !item.expenseName || Number(item.amount) <= 0)) return ElMessage.warning("请完整填写报销名称和金额");
			}
			const formData = Object.fromEntries(Object.entries(form.dynamicData).filter(([, value]) => value !== "" && value !== null && value !== void 0));
			emit("submit", {
				taskId: form.selectedTaskId || info.value.id,
				result: form.result,
				remark: form.remark.trim() || void 0,
				rejectReason: form.result === "rejected" ? form.rejectReason.trim() : void 0,
				nextAuditorId: form.result === "approved" ? form.nextAuditorId : void 0,
				formData,
				costItems: form.result === "approved" && hasCostInput.value ? form.costItems.map((item) => _objectSpread2({}, item)) : void 0,
				convertContract: form.result === "approved" && showContractConversion.value ? form.convertContract : void 0,
				convertAddress: form.result === "approved" && showAddressConversion.value ? form.convertAddress : void 0
			});
		}
		return (_ctx, _cache) => {
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_tag = ElTag;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_alert = ElAlert;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_input = ElInput;
			const _component_el_input_number = ElInputNumber;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_form_item = ElFormItem;
			const _component_el_button = ElButton;
			const _component_el_empty = ElEmpty;
			const _component_el_form = ElForm;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => visible.value = $event),
				title: "审核任务",
				width: "min(1000px, 96vw)",
				top: "4vh",
				"destroy-on-close": "",
				"append-to-body": "",
				"close-on-click-modal": false
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[7] || (_cache[7] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("关闭", -1)])]),
					_: 1
				}), info.value.auditAllowed !== false ? (openBlock(), createBlock(_component_el_button, {
					key: 0,
					type: form.result === "rejected" ? "danger" : "primary",
					loading: __props.submitting,
					onClick: submit
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(form.result === "rejected" ? "确认驳回" : "确认通过"), 1)]),
					_: 1
				}, 8, ["type", "loading"])) : createCommentVNode("", true)]),
				default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", _hoisted_1$1, [
					createBaseVNode("section", _hoisted_2$1, [
						_cache[10] || (_cache[10] = createBaseVNode("h3", null, "任务信息", -1)),
						createVNode(_component_el_descriptions, {
							column: 2,
							border: ""
						}, {
							default: withCtx(() => [
								createVNode(_component_el_descriptions_item, { label: "公司名称" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.companyName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "业务类型" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.businessTypeName || info.value.businessType || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "订单编号" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.orderNo || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "任务类型" }, {
									default: withCtx(() => [createVNode(_component_el_tag, { type: taskTypeTag.value }, {
										default: withCtx(() => [createTextVNode(toDisplayString(taskTypeText.value), 1)]),
										_: 1
									}, 8, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "下单时间" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.orderCreateTime || info.value.createTime || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "业务人员" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.salesman || info.value.salesmanName || info.value.salesName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "订单金额" }, {
									default: withCtx(() => {
										var _info$value$contractA;
										return [createBaseVNode("strong", _hoisted_3$1, toDisplayString(money((_info$value$contractA = info.value.contractAmount) !== null && _info$value$contractA !== void 0 ? _info$value$contractA : info.value.amount)), 1)];
									}),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "当前步骤" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.stepName || "-"), 1), info.value.stepNo ? (openBlock(), createElementBlock("span", _hoisted_4$1, "（第 " + toDisplayString(info.value.stepNo) + "/" + toDisplayString(info.value.stepCount || "-") + " 步）", 1)) : createCommentVNode("", true)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "服务人员" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.servicePersonName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "所属团队" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.teamName || "-"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "费用金额" }, {
									default: withCtx(() => [createBaseVNode("strong", _hoisted_5$1, toDisplayString(money(info.value.expenseAmount)), 1)]),
									_: 1
								}),
								info.value.startMonth || info.value.endMonth ? (openBlock(), createBlock(_component_el_descriptions_item, {
									key: 0,
									label: "服务周期"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(info.value.startMonth || "-") + " 至 " + toDisplayString(info.value.endMonth || "-"), 1)]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							_: 1
						}),
						isFinalConfirm.value ? (openBlock(), createBlock(_component_el_alert, {
							key: 0,
							class: "audit-alert",
							type: "warning",
							"show-icon": "",
							closable: false,
							title: "最终确认步骤",
							description: "必须由订单业务人员本人确认，系统不会绕过本人权限。"
						})) : createCommentVNode("", true),
						parallelTasks.value.length > 1 ? (openBlock(), createElementBlock("div", _hoisted_6$1, [_cache[9] || (_cache[9] = createBaseVNode("div", { class: "minor-title" }, "选择审核角色", -1)), createVNode(_component_el_radio_group, {
							modelValue: form.selectedTaskId,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.selectedTaskId = $event),
							class: "parallel-grid"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(parallelTasks.value, (item) => {
								return openBlock(), createBlock(_component_el_radio, {
									key: item.id,
									value: String(item.id),
									border: ""
								}, {
									default: withCtx(() => [createBaseVNode("span", null, toDisplayString(item.roleName || "-"), 1), createBaseVNode("small", null, toDisplayString(item.assignedUserName ? ` · ${item.assignedUserName}` : ""), 1)]),
									_: 2
								}, 1032, ["value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"])])) : createCommentVNode("", true)
					]),
					createBaseVNode("section", _hoisted_7$1, [_cache[15] || (_cache[15] = createBaseVNode("h3", null, "审核表单", -1)), createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							dynamicFields.value.length ? (openBlock(), createElementBlock("div", _hoisted_8$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(dynamicFields.value, (field) => {
								return openBlock(), createBlock(_component_el_form_item, {
									key: field.key,
									label: field.label,
									required: field.required
								}, {
									default: withCtx(() => {
										var _field$min, _field$precision;
										return [field.type === "textarea" ? (openBlock(), createBlock(_component_el_input, {
											key: 0,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event,
											type: "textarea",
											rows: 3,
											placeholder: field.placeholder || `请输入${field.label}`
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										])) : field.type === "number" ? (openBlock(), createBlock(_component_el_input_number, {
											key: 1,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event,
											min: (_field$min = field.min) !== null && _field$min !== void 0 ? _field$min : 0,
											precision: (_field$precision = field.precision) !== null && _field$precision !== void 0 ? _field$precision : 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"min",
											"precision"
										])) : field.type === "select" ? (openBlock(), createBlock(_component_el_select, {
											key: 2,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event,
											clearable: "",
											filterable: "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (option) => {
												var _option$value, _option$label, _option$value2;
												return openBlock(), createBlock(_component_el_option, {
													key: (_option$value = option.value) !== null && _option$value !== void 0 ? _option$value : option,
													label: (_option$label = option.label) !== null && _option$label !== void 0 ? _option$label : option,
													value: (_option$value2 = option.value) !== null && _option$value2 !== void 0 ? _option$value2 : option
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 2
										}, 1032, ["modelValue", "onUpdate:modelValue"])) : field.type === "date" || field.type === "datetime" ? (openBlock(), createBlock(_component_el_date_picker, {
											key: 3,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event,
											type: field.type === "datetime" ? "datetime" : "date",
											"value-format": field.type === "datetime" ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"type",
											"value-format"
										])) : field.type === "switch" ? (openBlock(), createBlock(_component_el_switch, {
											key: 4,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createBlock(_component_el_input, {
											key: 5,
											modelValue: form.dynamicData[field.key],
											"onUpdate:modelValue": ($event) => form.dynamicData[field.key] = $event,
											placeholder: field.placeholder || `请输入${field.label}`
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										]))];
									}),
									_: 2
								}, 1032, ["label", "required"]);
							}), 128))])) : createCommentVNode("", true),
							hasNextAuditor.value ? (openBlock(), createElementBlock("div", _hoisted_9$1, [_cache[11] || (_cache[11] = createBaseVNode("div", { class: "minor-title" }, "下个流程审批人员", -1)), createVNode(_component_el_select, {
								modelValue: form.nextAuditorId,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.nextAuditorId = $event),
								clearable: "",
								filterable: "",
								placeholder: "请选择下个审批人员",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (item) => {
									return openBlock(), createBlock(_component_el_option, {
										key: staffId(item),
										label: staffName(item),
										value: staffId(item)
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])])) : createCommentVNode("", true),
							hasCostInput.value ? (openBlock(), createElementBlock("div", _hoisted_10$1, [createBaseVNode("div", _hoisted_11$1, [_cache[13] || (_cache[13] = createBaseVNode("span", null, "成本填写", -1)), createVNode(_component_el_button, {
								type: "primary",
								plain: "",
								size: "small",
								onClick: addCost
							}, {
								default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("添加报销项", -1)])]),
								_: 1
							})]), (openBlock(true), createElementBlock(Fragment, null, renderList(form.costItems, (item, index) => {
								return openBlock(), createElementBlock("div", {
									key: index,
									class: "cost-row"
								}, [
									createVNode(_component_el_input, {
										modelValue: item.expenseName,
										"onUpdate:modelValue": ($event) => item.expenseName = $event,
										placeholder: "报销名称"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_input, {
										modelValue: item.categoryName,
										"onUpdate:modelValue": ($event) => item.categoryName = $event,
										placeholder: "报销类目"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_input_number, {
										modelValue: item.amount,
										"onUpdate:modelValue": ($event) => item.amount = $event,
										min: 0,
										precision: 2,
										"controls-position": "right",
										placeholder: "金额"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_input, {
										modelValue: item.remark,
										"onUpdate:modelValue": ($event) => item.remark = $event,
										placeholder: "备注"
									}, null, 8, ["modelValue", "onUpdate:modelValue"]),
									createVNode(_component_el_button, {
										type: "danger",
										link: "",
										onClick: ($event) => form.costItems.splice(index, 1)
									}, {
										default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("删除", -1)])]),
										_: 1
									}, 8, ["onClick"])
								]);
							}), 128))])) : createCommentVNode("", true),
							showContractConversion.value || showAddressConversion.value ? (openBlock(), createElementBlock("div", _hoisted_12$1, [showContractConversion.value ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "流程完成后转为合同"
							}, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: form.convertContract,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.convertContract = $event),
									"inline-prompt": "",
									"active-text": "是",
									"inactive-text": "否"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true), showAddressConversion.value ? (openBlock(), createBlock(_component_el_form_item, {
								key: 1,
								label: "流程完成后转为地址"
							}, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: form.convertAddress,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.convertAddress = $event),
									"inline-prompt": "",
									"active-text": "是",
									"inactive-text": "否"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true)])) : createCommentVNode("", true),
							!dynamicFields.value.length && !hasVisibleIndicators.value ? (openBlock(), createBlock(_component_el_empty, {
								key: 4,
								"image-size": 60,
								description: "此步骤无需填写附加表单，可直接审核"
							})) : createCommentVNode("", true)
						]),
						_: 1
					})]),
					createBaseVNode("section", _hoisted_13$1, [_cache[18] || (_cache[18] = createBaseVNode("h3", null, "审核操作", -1)), info.value.auditAllowed === false ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						type: "warning",
						"show-icon": "",
						closable: false,
						title: "当前账号没有该步骤审核权限"
					})) : (openBlock(), createBlock(_component_el_form, {
						key: 1,
						"label-position": "top"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "审核结果",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: form.result,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.result = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_button, { value: "approved" }, {
										default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("审核通过", -1)])]),
										_: 1
									}), createVNode(_component_el_radio_button, { value: "rejected" }, {
										default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("审核驳回", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							form.result === "rejected" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "驳回原因",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.rejectReason,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.rejectReason = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": "",
									placeholder: "请明确写出需要补充或修改的内容"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_form_item, { label: "审核备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.remark,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.remark = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": "",
									placeholder: "选填，记录本次审核依据"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}))])
				])), [[_directive_loading, __props.loading]])]),
				_: 1
			}, 8, ["modelValue"]);
		};
	}
});
//#endregion
//#region src/views/task-workbench/components/TaskRecordDrawer.vue
var TaskRecordDrawer_default = /* @__PURE__ */ defineComponent({
	__name: "TaskRecordDrawer",
	props: {
		modelValue: { type: Boolean },
		title: {},
		mode: {},
		rows: {},
		loading: {
			type: Boolean,
			default: false
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		function money(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		function stepLabel(status) {
			return {
				pending: "待处理",
				current: "处理中",
				processing: "处理中",
				completed: "已完成",
				approved: "已通过",
				rejected: "已驳回"
			}[status] || status || "-";
		}
		function stepType(status) {
			return {
				pending: "warning",
				current: "primary",
				processing: "primary",
				completed: "success",
				approved: "success",
				rejected: "danger"
			}[status] || "info";
		}
		return (_ctx, _cache) => {
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
				title: __props.title,
				size: "min(900px, 94vw)",
				"destroy-on-close": "",
				"append-to-body": ""
			}, {
				default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
					data: __props.rows,
					"row-key": "id",
					"empty-text": "暂无记录",
					border: ""
				}, {
					default: withCtx(() => [__props.mode === "payments" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
						createVNode(_component_el_table_column, {
							prop: "paymentTime",
							label: "收款时间",
							"min-width": "170"
						}),
						createVNode(_component_el_table_column, {
							label: "金额",
							width: "130",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.amount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "paymentMethod",
							label: "方式",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							prop: "accountNumber",
							label: "收款账户",
							"min-width": "150",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "statusLabel",
							label: "状态",
							width: "105"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: row.status === "confirmed" ? "success" : "info" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.statusLabel || row.status || "-"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备注",
							"min-width": "190",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.remarks || row.remark || "-"), 1)]),
							_: 1
						})
					], 64)) : __props.mode === "steps" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
						createVNode(_component_el_table_column, {
							label: "步骤",
							width: "80",
							align: "center"
						}, {
							default: withCtx(({ row }) => {
								var _ref, _row$stepOrder;
								return [createTextVNode(toDisplayString((_ref = (_row$stepOrder = row.stepOrder) !== null && _row$stepOrder !== void 0 ? _row$stepOrder : row.sequence) !== null && _ref !== void 0 ? _ref : "-"), 1)];
							}),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "流程节点",
							"min-width": "170"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.stepName || row.name || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "roleName",
							label: "审核角色",
							width: "130"
						}),
						createVNode(_component_el_table_column, {
							prop: "assigneeName",
							label: "处理人",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "105"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: stepType(row.status) }, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.statusLabel || stepLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "completedTime",
							label: "处理时间",
							"min-width": "170"
						}),
						createVNode(_component_el_table_column, {
							label: "处理意见",
							"min-width": "200",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.remark || row.comment || "-"), 1)]),
							_: 1
						})
					], 64)) : (openBlock(), createElementBlock(Fragment, { key: 2 }, [
						createVNode(_component_el_table_column, {
							label: "操作时间",
							"min-width": "170"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.operateTime || row.createTime || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "operatorName",
							label: "操作人",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							prop: "actionLabel",
							label: "动作",
							width: "120"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.actionLabel || row.action || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "结果",
							width: "110"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: stepType(row.result) }, {
								default: withCtx(() => [createTextVNode(toDisplayString(stepLabel(row.result)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作内容",
							"min-width": "260",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.content || row.comment || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备注",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.remark || "-"), 1)]),
							_: 1
						})
					], 64))]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, __props.loading]])]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
});
//#endregion
//#region src/views/task-workbench/audit-task-list.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench" };
var _hoisted_2 = { class: "page-head" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { key: 1 };
var _hoisted_5 = { class: "page-card" };
var _hoisted_6 = { class: "card-actions" };
var _hoisted_7 = {
	key: 0,
	class: "step-strip",
	"aria-label": "流程步骤筛选"
};
var _hoisted_8 = ["onClick"];
var _hoisted_9 = { class: "toolbar" };
var _hoisted_10 = { class: "toolbar-main" };
var _hoisted_11 = { class: "toolbar-extra" };
var _hoisted_12 = { class: "table-wrap" };
var _hoisted_13 = { class: "company-cell" };
var _hoisted_14 = { class: "money" };
var _hoisted_15 = ["onClick"];
var _hoisted_16 = { class: "pagination-bar" };
//#endregion
//#region src/views/task-workbench/audit-task-list.vue
var audit_task_list_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "audit-task-list",
	props: {
		taskType: {},
		title: {},
		description: {}
	},
	setup(__props) {
		const props = __props;
		const rows = ref([]);
		const loading = ref(false);
		const errorMessage = ref("");
		const staffOptions = ref([]);
		const roleOptions = ref([]);
		const orderOptions = ref([]);
		const processes = ref([]);
		const CLOSED_CAPABILITIES = {
			manager: false,
			bridgeManage: false,
			bridgeTriggerSupported: false,
			contractConversionSupported: false,
			addressConversionSupported: false
		};
		const capabilities = ref(_objectSpread2({}, CLOSED_CAPABILITIES));
		const filters = reactive({
			status: "pending",
			scopeType: "personal",
			keyword: "",
			businessType: "",
			salesId: void 0,
			stepNo: void 0
		});
		const pagination = reactive({
			pageNum: 1,
			pageSize: 20,
			total: 0
		});
		const auditVisible = ref(false);
		const detailLoading = ref(false);
		const submitting = ref(false);
		const activeTask = ref(null);
		const auditDetail = ref({});
		const recordVisible = ref(false);
		const recordLoading = ref(false);
		const recordMode = ref("logs");
		const recordTitle = ref("");
		const recordRows = ref([]);
		const specialistVisible = ref(false);
		const specialistId = ref();
		const createRef = ref();
		const configRef = ref();
		const stepOptions = computed(() => {
			const count = Math.max(0, ...rows.value.map((row) => Number(row.stepCount || 0)));
			return Array.from({ length: count }, (_, index) => index + 1);
		});
		const auditEmptyText = computed(() => {
			if (!capabilities.value.manager) return "暂无符合条件的任务";
			return capabilities.value.bridgeTriggerSupported ? "暂无任务，可配置流程与自动生成规则，或手工补发" : "暂无任务，可先配置流程后手工补发";
		});
		onMounted(_asyncToGenerator(function* () {
			const [capabilityResult, staffResult] = yield Promise.allSettled([
				feigeTaskData.capabilities(),
				feigeTaskData.staffOptions(),
				loadRows()
			]);
			if (capabilityResult.status === "fulfilled") capabilities.value = capabilityResult.value || _objectSpread2({}, CLOSED_CAPABILITIES);
			else capabilities.value = _objectSpread2({}, CLOSED_CAPABILITIES);
			if (staffResult.status === "fulfilled") staffOptions.value = staffResult.value || [];
			else ElMessage.error(`人员选项加载失败：${errorText(staffResult.reason)}`);
			if (capabilities.value.bridgeManage) {
				const [roleResult, orderResult] = yield Promise.allSettled([
					feigeTaskData.roleTree(),
					feigeTaskData.orderOptions({ pageSize: 100 }),
					loadProcesses()
				]);
				if (roleResult.status === "fulfilled") roleOptions.value = roleResult.value || [];
				else ElMessage.warning(`角色选项加载失败：${errorText(roleResult.reason)}`);
				if (orderResult.status === "fulfilled") orderOptions.value = orderResult.value || [];
				else ElMessage.warning(`可关联订单加载失败：${errorText(orderResult.reason)}`);
			} else if (capabilities.value.manager) {
				const [orderResult] = yield Promise.allSettled([feigeTaskData.orderOptions({ pageSize: 100 }), loadProcesses()]);
				if (orderResult.status === "fulfilled") orderOptions.value = orderResult.value || [];
				else ElMessage.warning(`可关联订单加载失败：${errorText(orderResult.reason)}`);
			}
		}));
		function loadProcesses() {
			return _loadProcesses.apply(this, arguments);
		}
		function _loadProcesses() {
			_loadProcesses = _asyncToGenerator(function* () {
				try {
					processes.value = (yield feigeTaskData.auditProcesses({ taskType: props.taskType })) || [];
				} catch (error) {
					processes.value = [];
					ElMessage.warning(`审批流程加载失败：${errorText(error)}`);
				}
			});
			return _loadProcesses.apply(this, arguments);
		}
		function createAuditTask(_x) {
			return _createAuditTask.apply(this, arguments);
		}
		function _createAuditTask() {
			_createAuditTask = _asyncToGenerator(function* (payload) {
				var _createRef$value;
				(_createRef$value = createRef.value) === null || _createRef$value === void 0 || _createRef$value.setSaving(true);
				try {
					var _createRef$value2;
					yield feigeTaskData.createAuditTask(payload);
					(_createRef$value2 = createRef.value) === null || _createRef$value2 === void 0 || _createRef$value2.setSaving(false, true);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：审批任务已补发" : "审批任务已补发");
					filters.status = "pending";
					filters.stepNo = void 0;
					pagination.pageNum = 1;
					yield loadRows();
				} catch (error) {
					var _createRef$value3;
					(_createRef$value3 = createRef.value) === null || _createRef$value3 === void 0 || _createRef$value3.setSaving(false);
					ElMessage.error(`任务创建失败：${errorText(error)}`);
				}
			});
			return _createAuditTask.apply(this, arguments);
		}
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				errorMessage.value = "";
				try {
					const page = normalizePage(yield feigeTaskData.auditTasks({
						taskType: props.taskType,
						status: filters.stepNo === "completed" ? void 0 : filters.status,
						scopeType: filters.scopeType,
						keyword: filters.keyword.trim() || void 0,
						businessType: filters.businessType.trim() || void 0,
						salesId: filters.salesId,
						stepNo: typeof filters.stepNo === "number" ? filters.stepNo : void 0,
						showCompleted: filters.stepNo === "completed" || void 0,
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize
					}));
					rows.value = page.records;
					pagination.total = page.total;
				} catch (error) {
					rows.value = [];
					pagination.total = 0;
					errorMessage.value = `任务列表加载失败：${errorText(error)}`;
				} finally {
					loading.value = false;
				}
			});
			return _loadRows.apply(this, arguments);
		}
		function normalizePage(result) {
			var _ref, _ref2, _ref3, _result$data$data, _result$data, _ref4, _value$total;
			const value = (_ref = (_ref2 = (_ref3 = (_result$data$data = result === null || result === void 0 || (_result$data = result.data) === null || _result$data === void 0 ? void 0 : _result$data.data) !== null && _result$data$data !== void 0 ? _result$data$data : result === null || result === void 0 ? void 0 : result.data) !== null && _ref3 !== void 0 ? _ref3 : result === null || result === void 0 ? void 0 : result.result) !== null && _ref2 !== void 0 ? _ref2 : result) !== null && _ref !== void 0 ? _ref : {};
			const records = Array.isArray(value) ? value : value.records || value.list || value.rows || [];
			return {
				records,
				total: Number((_ref4 = (_value$total = value.total) !== null && _value$total !== void 0 ? _value$total : value.totalCount) !== null && _ref4 !== void 0 ? _ref4 : records.length)
			};
		}
		function handleSearch() {
			pagination.pageNum = 1;
			loadRows();
		}
		function resetFilters() {
			filters.keyword = "";
			filters.businessType = "";
			filters.salesId = void 0;
			filters.stepNo = void 0;
			pagination.pageNum = 1;
			loadRows();
		}
		function handleStatusChange() {
			pagination.pageNum = 1;
			filters.stepNo = void 0;
			loadRows();
		}
		function handleScopeChange() {
			pagination.pageNum = 1;
			loadRows();
		}
		function selectStep(step) {
			filters.stepNo = step;
			pagination.pageNum = 1;
			loadRows();
		}
		function handlePageChange() {
			loadRows();
		}
		function handleSizeChange() {
			pagination.pageNum = 1;
			loadRows();
		}
		function openAudit(_x2) {
			return _openAudit.apply(this, arguments);
		}
		function _openAudit() {
			_openAudit = _asyncToGenerator(function* (row) {
				activeTask.value = row;
				auditDetail.value = {};
				auditVisible.value = true;
				detailLoading.value = true;
				try {
					auditDetail.value = yield feigeTaskData.auditTaskDetail(row.id);
				} catch (error) {
					ElMessage.error(`任务详情加载失败：${errorText(error)}`);
					auditVisible.value = false;
				} finally {
					detailLoading.value = false;
				}
			});
			return _openAudit.apply(this, arguments);
		}
		function submitAudit(_x3) {
			return _submitAudit.apply(this, arguments);
		}
		function _submitAudit() {
			_submitAudit = _asyncToGenerator(function* (payload) {
				if (!activeTask.value) return;
				submitting.value = true;
				try {
					yield feigeTaskData.auditAction(activeTask.value.id, payload);
					ElMessage.success(payload.result === "rejected" ? "已驳回任务" : "审核已通过");
					auditVisible.value = false;
					yield loadRows();
				} catch (error) {
					ElMessage.error(`审核提交失败：${errorText(error)}`);
				} finally {
					submitting.value = false;
				}
			});
			return _submitAudit.apply(this, arguments);
		}
		function openPayments(_x4) {
			return _openPayments.apply(this, arguments);
		}
		function _openPayments() {
			_openPayments = _asyncToGenerator(function* (row) {
				if (!row.orderId) return ElMessage.warning("当前任务未关联订单，无法查看费用明细");
				openRecord("payments", `${row.companyName} · 收款与费用明细`);
				try {
					recordRows.value = (yield feigeTaskData.auditTaskPayments(row.orderId)) || [];
				} catch (error) {
					ElMessage.error(`费用明细加载失败：${errorText(error)}`);
				} finally {
					recordLoading.value = false;
				}
			});
			return _openPayments.apply(this, arguments);
		}
		function openSteps(_x5) {
			return _openSteps.apply(this, arguments);
		}
		function _openSteps() {
			_openSteps = _asyncToGenerator(function* (row) {
				if (!row.orderId) return ElMessage.warning("当前任务未关联订单，无法查看流程");
				openRecord("steps", `${row.companyName} · 流程进度`);
				try {
					recordRows.value = (yield feigeTaskData.auditTaskSteps(row.orderId)) || [];
				} catch (error) {
					ElMessage.error(`流程记录加载失败：${errorText(error)}`);
				} finally {
					recordLoading.value = false;
				}
			});
			return _openSteps.apply(this, arguments);
		}
		function openLogs(_x6) {
			return _openLogs.apply(this, arguments);
		}
		function _openLogs() {
			_openLogs = _asyncToGenerator(function* (row) {
				openRecord("logs", `${row.companyName} · 操作记录`);
				try {
					const detail = yield feigeTaskData.auditTaskDetail(row.id);
					recordRows.value = (detail === null || detail === void 0 ? void 0 : detail.logs) || [];
				} catch (error) {
					ElMessage.error(`操作记录加载失败：${errorText(error)}`);
				} finally {
					recordLoading.value = false;
				}
			});
			return _openLogs.apply(this, arguments);
		}
		function openRecord(mode, titleText) {
			recordMode.value = mode;
			recordTitle.value = titleText;
			recordRows.value = [];
			recordLoading.value = true;
			recordVisible.value = true;
		}
		function openSpecialist(row) {
			activeTask.value = row;
			specialistId.value = row.servicePersonId;
			specialistVisible.value = true;
		}
		function canChangeSpecialist(row) {
			return feigeTaskLocalDemo() ? props.taskType === "special" && row.status === "pending" : row.canChangeGsSpecialist === true;
		}
		function saveSpecialist() {
			return _saveSpecialist.apply(this, arguments);
		}
		function _saveSpecialist() {
			_saveSpecialist = _asyncToGenerator(function* () {
				if (!activeTask.value || !specialistId.value) return ElMessage.warning("请选择工商专员");
				submitting.value = true;
				try {
					yield feigeTaskData.auditAction(activeTask.value.id, {
						action: "reassign_specialist",
						servicePersonId: specialistId.value
					});
					ElMessage.success("工商专员已调整");
					specialistVisible.value = false;
					yield loadRows();
				} catch (error) {
					ElMessage.error(`工商专员调整失败：${errorText(error)}`);
				} finally {
					submitting.value = false;
				}
			});
			return _saveSpecialist.apply(this, arguments);
		}
		function staffLabel(item) {
			return `${item.name}${item.deptName ? ` · ${item.deptName}` : ""}`;
		}
		function statusLabel(status) {
			return {
				pending: "待审核",
				approved: "已通过",
				rejected: "已驳回"
			}[status] || status || "-";
		}
		function statusType(status) {
			return {
				pending: "warning",
				approved: "success",
				rejected: "danger"
			}[status] || "info";
		}
		function money(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		function progress(row) {
			return row.stepCount ? Math.min(100, Math.round(Number(row.stepNo || 0) / Number(row.stepCount) * 100)) : 0;
		}
		function errorText(error) {
			var _error$response;
			return (error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || "未知错误";
		}
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_table_column = ElTableColumn;
			const _component_el_progress = ElProgress;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("section", _hoisted_1, [
				unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					class: "demo-banner",
					type: "warning",
					"show-icon": "",
					closable: false,
					title: "LOCAL-DEMO 本地验收模式",
					description: "当前全部公司、人员、订单和金额均为虚构数据，不连接生产环境。"
				})) : createCommentVNode("", true),
				errorMessage.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 1,
					class: "error-alert",
					type: "error",
					"show-icon": "",
					closable: false,
					title: errorMessage.value
				}, null, 8, ["title"])) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_2, [createBaseVNode("div", _hoisted_3, [
					createBaseVNode("h2", null, toDisplayString(__props.title), 1),
					createVNode(_component_el_tag, { effect: "plain" }, {
						default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("任务管理", -1)])]),
						_: 1
					}),
					unref(feigeTaskLocalDemo)() ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						type: "warning"
					}, {
						default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("LOCAL-DEMO", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.description ? (openBlock(), createElementBlock("p", _hoisted_4, toDisplayString(__props.description), 1)) : createCommentVNode("", true)
				])]),
				createBaseVNode("div", _hoisted_5, [
					createBaseVNode("div", _hoisted_6, [
						capabilities.value.bridgeManage ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							onClick: _cache[0] || (_cache[0] = ($event) => {
								var _configRef$value;
								return (_configRef$value = configRef.value) === null || _configRef$value === void 0 ? void 0 : _configRef$value.open("process");
							})
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(capabilities.value.bridgeTriggerSupported ? "流程与生成规则" : "审批流程设置"), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						capabilities.value.manager ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							type: "primary",
							onClick: _cache[1] || (_cache[1] = ($event) => {
								var _createRef$value4;
								return (_createRef$value4 = createRef.value) === null || _createRef$value4 === void 0 ? void 0 : _createRef$value4.open();
							})
						}, {
							default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("手工补发", -1)])]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_button, {
							loading: loading.value,
							onClick: loadRows
						}, {
							default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("刷新", -1)])]),
							_: 1
						}, 8, ["loading"])
					]),
					createVNode(_component_el_tabs, {
						modelValue: filters.status,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.status = $event),
						class: "status-tabs",
						onTabChange: handleStatusChange
					}, {
						default: withCtx(() => [
							createVNode(_component_el_tab_pane, {
								label: "待审核",
								name: "pending"
							}),
							createVNode(_component_el_tab_pane, {
								label: "已审核",
								name: "approved"
							}),
							createVNode(_component_el_tab_pane, {
								label: "已驳回",
								name: "rejected"
							})
						]),
						_: 1
					}, 8, ["modelValue"]),
					filters.status === "pending" ? (openBlock(), createElementBlock("div", _hoisted_7, [
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["step-chip", { "is-active": filters.stepNo === void 0 }]),
							onClick: _cache[3] || (_cache[3] = ($event) => selectStep(void 0))
						}, "全部步骤", 2),
						(openBlock(true), createElementBlock(Fragment, null, renderList(stepOptions.value, (step) => {
							return openBlock(), createElementBlock("button", {
								key: step,
								type: "button",
								class: normalizeClass(["step-chip", { "is-active": filters.stepNo === step }]),
								onClick: ($event) => selectStep(step)
							}, " 第 " + toDisplayString(step) + " 步 ", 11, _hoisted_8);
						}), 128)),
						createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["step-chip", { "is-active": filters.stepNo === "completed" }]),
							onClick: _cache[4] || (_cache[4] = ($event) => selectStep("completed"))
						}, "已完成", 2)
					])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("div", _hoisted_10, [
						createVNode(_component_el_input, {
							modelValue: filters.keyword,
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => filters.keyword = $event),
							class: "search-input",
							clearable: "",
							placeholder: "搜索公司名称或订单编号",
							onKeyup: withKeys(handleSearch, ["enter"])
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_input, {
							modelValue: filters.businessType,
							"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => filters.businessType = $event),
							class: "filter-select",
							clearable: "",
							placeholder: "业务类型",
							onKeyup: withKeys(handleSearch, ["enter"])
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: filters.salesId,
							"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => filters.salesId = $event),
							class: "filter-select",
							clearable: "",
							filterable: "",
							placeholder: "业务人员"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffOptions.value, (item) => {
								return openBlock(), createBlock(_component_el_option, {
									key: item.id,
									label: staffLabel(item),
									value: item.id
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_button, {
							type: "primary",
							onClick: handleSearch
						}, {
							default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("查询", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, { onClick: resetFilters }, {
							default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("重置", -1)])]),
							_: 1
						})
					]), createBaseVNode("div", _hoisted_11, [_cache[25] || (_cache[25] = createBaseVNode("span", { class: "muted" }, "查看范围", -1)), createVNode(_component_el_radio_group, {
						modelValue: filters.scopeType,
						"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => filters.scopeType = $event),
						onChange: handleScopeChange
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { value: "personal" }, {
							default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("我的", -1)])]),
							_: 1
						}), createVNode(_component_el_radio_button, { value: "team" }, {
							default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("团队", -1)])]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"])])]),
					createBaseVNode("div", _hoisted_12, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						border: "",
						"empty-text": auditEmptyText.value
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "客户 / 订单",
								"min-width": "230",
								fixed: "left"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_13, [createBaseVNode("strong", null, toDisplayString(row.companyName || "-"), 1), createBaseVNode("small", null, toDisplayString(row.orderNo || "未关联订单编号"), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "105",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: statusType(row.status) }, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "createTime",
								label: "下单时间",
								"min-width": "165"
							}),
							createVNode(_component_el_table_column, {
								prop: "salesName",
								label: "业务人员",
								width: "120"
							}),
							__props.taskType !== "special" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 0,
								prop: "businessType",
								label: "业务类型",
								"min-width": "150",
								"show-overflow-tooltip": ""
							})) : (openBlock(), createBlock(_component_el_table_column, {
								key: 1,
								prop: "businessType",
								label: "专项类型",
								"min-width": "165",
								"show-overflow-tooltip": ""
							})),
							__props.taskType === "recurring" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 2,
								label: "服务周期",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.startMonth || "-") + " 至 " + toDisplayString(row.endMonth || "-"), 1)]),
								_: 1
							})) : createCommentVNode("", true),
							__props.taskType === "project_dept" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 3,
								prop: "teamName",
								label: "项目部门",
								"min-width": "150",
								"show-overflow-tooltip": ""
							})) : createCommentVNode("", true),
							__props.taskType === "project_dept" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 4,
								prop: "servicePersonName",
								label: "项目负责人",
								width: "125"
							})) : createCommentVNode("", true),
							__props.taskType === "special" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 5,
								prop: "servicePersonName",
								label: "工商专员",
								width: "125"
							})) : createCommentVNode("", true),
							__props.taskType === "once" || __props.taskType === "recurring" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 6,
								prop: "servicePersonName",
								label: "服务人员",
								width: "125"
							})) : createCommentVNode("", true),
							createVNode(_component_el_table_column, {
								prop: "region",
								label: "所属地区",
								"min-width": "145",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "订单金额",
								width: "125",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_14, toDisplayString(money(row.amount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "费用明细",
								width: "125",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									type: "primary",
									link: "",
									onClick: ($event) => openPayments(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(money(row.expenseAmount)), 1)]),
									_: 2
								}, 1032, ["onClick"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "流程进度",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("button", {
									type: "button",
									class: "plain-action",
									onClick: ($event) => openSteps(row)
								}, [
									createBaseVNode("span", null, toDisplayString(row.stepName || "查看流程"), 1),
									createVNode(_component_el_progress, {
										percentage: progress(row),
										"show-text": false,
										"stroke-width": 6
									}, null, 8, ["percentage"]),
									createBaseVNode("small", null, "第 " + toDisplayString(row.stepNo || "-") + "/" + toDisplayString(row.stepCount || "-") + " 步", 1)
								], 8, _hoisted_15)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "remarks",
								label: "备注",
								"min-width": "180",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "250",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [
									row.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										type: "primary",
										link: "",
										onClick: ($event) => openAudit(row)
									}, {
										default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("审核", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									createVNode(_component_el_button, {
										type: "primary",
										link: "",
										onClick: ($event) => openLogs(row)
									}, {
										default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("操作记录", -1)])]),
										_: 1
									}, 8, ["onClick"]),
									canChangeSpecialist(row) ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										type: "warning",
										link: "",
										onClick: ($event) => openSpecialist(row)
									}, {
										default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("修改工商专员", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data", "empty-text"])), [[_directive_loading, loading.value]])]),
					createBaseVNode("div", _hoisted_16, [createVNode(_component_el_pagination, {
						"current-page": pagination.pageNum,
						"onUpdate:currentPage": _cache[9] || (_cache[9] = ($event) => pagination.pageNum = $event),
						"page-size": pagination.pageSize,
						"onUpdate:pageSize": _cache[10] || (_cache[10] = ($event) => pagination.pageSize = $event),
						total: pagination.total,
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						layout: "total, sizes, prev, pager, next, jumper",
						onCurrentChange: handlePageChange,
						onSizeChange: handleSizeChange
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(TaskAuditDialog_default, {
					modelValue: auditVisible.value,
					"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => auditVisible.value = $event),
					task: activeTask.value,
					detail: auditDetail.value,
					staff: staffOptions.value,
					capabilities: capabilities.value,
					loading: detailLoading.value,
					submitting: submitting.value,
					onSubmit: submitAudit
				}, null, 8, [
					"modelValue",
					"task",
					"detail",
					"staff",
					"capabilities",
					"loading",
					"submitting"
				]),
				createVNode(TaskRecordDrawer_default, {
					modelValue: recordVisible.value,
					"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => recordVisible.value = $event),
					title: recordTitle.value,
					mode: recordMode.value,
					rows: recordRows.value,
					loading: recordLoading.value
				}, null, 8, [
					"modelValue",
					"title",
					"mode",
					"rows",
					"loading"
				]),
				createVNode(_component_el_dialog, {
					modelValue: specialistVisible.value,
					"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => specialistVisible.value = $event),
					title: "修改工商专员",
					width: "480px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[14] || (_cache[14] = ($event) => specialistVisible.value = false) }, {
						default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: saveSpecialist
					}, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("确认调整", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [_cache[31] || (_cache[31] = createBaseVNode("p", { class: "form-note" }, "只调整当前专项任务的承办人，不修改员工角色和部门权限。", -1)), createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "工商专员",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: specialistId.value,
								"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => specialistId.value = $event),
								filterable: "",
								placeholder: "请选择人员",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staffOptions.value, (item) => {
									return openBlock(), createBlock(_component_el_option, {
										key: item.id,
										label: staffLabel(item),
										value: item.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(AuditTaskCreateDialog_default, {
					ref_key: "createRef",
					ref: createRef,
					"task-type": __props.taskType,
					processes: processes.value,
					staff: staffOptions.value,
					orders: orderOptions.value,
					onCreate: createAuditTask,
					onConfigure: _cache[16] || (_cache[16] = ($event) => {
						var _configRef$value2;
						return (_configRef$value2 = configRef.value) === null || _configRef$value2 === void 0 ? void 0 : _configRef$value2.open("process");
					})
				}, null, 8, [
					"task-type",
					"processes",
					"staff",
					"orders"
				]),
				capabilities.value.bridgeManage ? (openBlock(), createBlock(TaskConfigDialog_default, {
					key: 2,
					ref_key: "configRef",
					ref: configRef,
					"task-type": __props.taskType,
					roles: roleOptions.value,
					staff: staffOptions.value,
					capabilities: capabilities.value,
					onChanged: loadProcesses
				}, null, 8, [
					"task-type",
					"roles",
					"staff",
					"capabilities"
				])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-c5fd14ab"]]);
//#endregion
export { audit_task_list_default as t };

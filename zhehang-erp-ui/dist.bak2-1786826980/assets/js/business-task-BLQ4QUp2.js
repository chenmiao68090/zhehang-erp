import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Dr as withModifiers, Er as withKeys, M as ElInputNumber, Q as ElRadioGroup, V as ElDialog, X as ElRadio, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, ht as ElTooltip, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as feigeTaskLocalDemo, t as feigeTaskData } from "./data-source.production-DbokqIsz.js";
import { n as createTaskRequestKey, t as TaskConfigDialog_default } from "./common.scss_vue_type_style_index_0_src_true_lang-xUwxK3Ya.js";
//#endregion
//#region src/views/task-workbench/components/BusinessTaskCreateDialog.vue
var BusinessTaskCreateDialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "BusinessTaskCreateDialog",
	props: {
		staff: {},
		orders: {}
	},
	emits: ["create"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = ref(false);
		const saving = ref(false);
		const formRef = ref();
		const form = reactive({
			requestKey: "",
			orderId: void 0,
			companyName: "",
			orderNo: "",
			businessOwnerId: void 0,
			remarks: ""
		});
		const rules = {
			companyName: [{
				required: true,
				message: "请输入公司名称",
				trigger: "blur"
			}],
			businessOwnerId: [{
				required: true,
				message: "请选择业务负责人",
				trigger: "change"
			}]
		};
		function open() {
			Object.assign(form, {
				requestKey: createTaskRequestKey(),
				orderId: void 0,
				companyName: "",
				orderNo: "",
				businessOwnerId: void 0,
				remarks: ""
			});
			visible.value = true;
		}
		function handleOrderChange(id) {
			const order = props.orders.find((item) => item.id === Number(id));
			if (!order) return;
			form.companyName = order.companyName;
			form.orderNo = order.orderNo;
			if (order.salesmanId && props.staff.some((item) => item.id === order.salesmanId)) form.businessOwnerId = order.salesmanId;
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value, _form$orderNo, _form$remarks;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate())) return;
				emit("create", {
					requestKey: form.requestKey,
					orderId: form.orderId || void 0,
					companyName: form.companyName.trim(),
					orderNo: ((_form$orderNo = form.orderNo) === null || _form$orderNo === void 0 ? void 0 : _form$orderNo.trim()) || void 0,
					businessOwnerId: form.businessOwnerId,
					remarks: ((_form$remarks = form.remarks) === null || _form$remarks === void 0 ? void 0 : _form$remarks.trim()) || void 0
				});
			});
			return _submit.apply(this, arguments);
		}
		function orderLabel(item) {
			return `${item.orderNo} · ${item.companyName}`;
		}
		function setSaving(value, close = false) {
			saving.value = value;
			if (close) visible.value = false;
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
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_form = ElForm;
			const _component_el_button = ElButton;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => visible.value = $event),
				title: "手工补发业务任务",
				width: "min(620px, 94vw)",
				"append-to-body": "",
				"destroy-on-close": "",
				"close-on-click-modal": false
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[5] || (_cache[5] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("创建任务", -1)])]),
					_: 1
				}, 8, ["loading"])]),
				default: withCtx(() => [createVNode(_component_el_alert, {
					title: "补充未命中自动规则或生成失败的业务任务",
					description: "如任务来自订单，请选择关联订单以带入订单编号和负责人；本操作不会修改订单本身。",
					type: "info",
					"show-icon": "",
					closable: false
				}), createVNode(_component_el_form, {
					ref_key: "formRef",
					ref: formRef,
					model: form,
					rules,
					"label-position": "top",
					class: "create-form"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, { label: "关联订单" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: form.orderId,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.orderId = $event),
								filterable: "",
								clearable: "",
								placeholder: "选填；选择后自动带入公司、订单号和负责人",
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
							}, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "公司名称",
							prop: "companyName"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.companyName,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.companyName = $event),
								maxlength: "200",
								"show-word-limit": "",
								placeholder: "请输入公司名称"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "订单编号" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.orderNo,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.orderNo = $event),
								maxlength: "64",
								placeholder: "选填，例如订单编号"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "业务负责人",
							prop: "businessOwnerId"
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: form.businessOwnerId,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.businessOwnerId = $event),
								filterable: "",
								placeholder: "请选择任务责任人",
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
						createVNode(_component_el_form_item, { label: "补发说明" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.remarks,
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.remarks = $event),
								type: "textarea",
								rows: 3,
								maxlength: "1000",
								"show-word-limit": "",
								placeholder: "说明补发原因或交付要求"
							}, null, 8, ["modelValue"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["model"])]),
				_: 1
			}, 8, ["modelValue"]);
		};
	}
}), [["__scopeId", "data-v-3d9a6f5d"]]);
//#endregion
//#region src/views/task-workbench/business-task.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "task-workbench" };
var _hoisted_2 = { class: "page-head" };
var _hoisted_3 = { class: "page-title" };
var _hoisted_4 = { class: "heading-actions" };
var _hoisted_5 = { class: "page-card" };
var _hoisted_6 = { class: "tab-label" };
var _hoisted_7 = {
	key: 0,
	class: "tab-count"
};
var _hoisted_8 = { class: "table-wrap" };
var _hoisted_9 = { class: "pagination-bar" };
//#endregion
//#region src/views/task-workbench/business-task.vue
var business_task_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "business-task",
	setup(__props) {
		const tabs = [
			{
				value: "pending_manager_audit",
				label: "工商经理审核"
			},
			{
				value: "public_sea",
				label: "公海待接收"
			},
			{
				value: "assigned_to_me",
				label: "待本人接收"
			},
			{
				value: "task",
				label: "任务"
			},
			{
				value: "handover",
				label: "交接"
			},
			{
				value: "completed",
				label: "已完单"
			},
			{
				value: "problem_task",
				label: "问题任务"
			},
			{
				value: "recycle_bin",
				label: "回收站"
			}
		];
		const activeStatus = ref("pending_manager_audit");
		const rows = ref([]);
		const staffOptions = ref([]);
		const orderOptions = ref([]);
		const CLOSED_CAPABILITIES = {
			manager: false,
			bridgeManage: false,
			bridgeTriggerSupported: false,
			contractConversionSupported: false,
			addressConversionSupported: false
		};
		const capabilities = ref(_objectSpread2({}, CLOSED_CAPABILITIES));
		const businessIntro = computed(() => capabilities.value.bridgeTriggerSupported ? "订单创建或财务审核通过后可按启用规则自动生成任务；经理也可手工补发未覆盖或生成失败的任务。" : "经理可关联真实订单手工补发任务；自动生成入口仅在后端能力开放后显示。");
		const loading = ref(false);
		const submitting = ref(false);
		const errorMessage = ref("");
		const activeTask = ref(null);
		const filters = reactive({
			orderNo: "",
			companyName: ""
		});
		const pagination = reactive({
			pageNum: 1,
			pageSize: 20,
			total: 0
		});
		const managerVisible = ref(false);
		const managerForm = reactive({
			result: "approved",
			targetStatus: "public_sea",
			assigneeId: void 0,
			remark: ""
		});
		const costVisible = ref(false);
		const costForm = reactive({
			category: "",
			costAmount: 0
		});
		const staffVisible = ref(false);
		const staffForm = reactive({ staffId: void 0 });
		const exceptionVisible = ref(false);
		const exceptionForm = reactive({ reason: "" });
		const createRef = ref();
		const configRef = ref();
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
			if (capabilities.value.manager) yield loadOrderOptions();
		}));
		function loadOrderOptions() {
			return _loadOrderOptions.apply(this, arguments);
		}
		function _loadOrderOptions() {
			_loadOrderOptions = _asyncToGenerator(function* () {
				try {
					orderOptions.value = (yield feigeTaskData.orderOptions({ pageSize: 100 })) || [];
				} catch (error) {
					orderOptions.value = [];
					ElMessage.warning(`可关联订单加载失败：${errorText(error)}`);
				}
			});
			return _loadOrderOptions.apply(this, arguments);
		}
		function createBusinessTask(_x) {
			return _createBusinessTask.apply(this, arguments);
		}
		function _createBusinessTask() {
			_createBusinessTask = _asyncToGenerator(function* (payload) {
				var _createRef$value;
				(_createRef$value = createRef.value) === null || _createRef$value === void 0 || _createRef$value.setSaving(true);
				try {
					var _createRef$value2;
					yield feigeTaskData.createBusinessTask(payload);
					(_createRef$value2 = createRef.value) === null || _createRef$value2 === void 0 || _createRef$value2.setSaving(false, true);
					ElMessage.success(feigeTaskLocalDemo() ? "LOCAL-DEMO：业务任务已补发" : "业务任务已补发");
					activeStatus.value = "pending_manager_audit";
					pagination.pageNum = 1;
					yield loadRows();
				} catch (error) {
					var _createRef$value3;
					(_createRef$value3 = createRef.value) === null || _createRef$value3 === void 0 || _createRef$value3.setSaving(false);
					ElMessage.error(`任务创建失败：${errorText(error)}`);
				}
			});
			return _createBusinessTask.apply(this, arguments);
		}
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				errorMessage.value = "";
				try {
					const page = normalizePage(yield feigeTaskData.businessTasks({
						status: activeStatus.value,
						orderNo: filters.orderNo.trim() || void 0,
						companyName: filters.companyName.trim() || void 0,
						pageNum: pagination.pageNum,
						pageSize: pagination.pageSize
					}));
					rows.value = page.records;
					pagination.total = page.total;
				} catch (error) {
					rows.value = [];
					pagination.total = 0;
					errorMessage.value = `业务任务加载失败：${errorText(error)}`;
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
		function handleTabChange() {
			pagination.pageNum = 1;
			loadRows();
		}
		function handleSearch() {
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
		function resetFilters() {
			filters.orderNo = "";
			filters.companyName = "";
			pagination.pageNum = 1;
			loadRows();
		}
		function openManagerAudit(row) {
			activeTask.value = row;
			managerForm.result = "approved";
			managerForm.targetStatus = "public_sea";
			managerForm.assigneeId = void 0;
			managerForm.remark = "";
			managerVisible.value = true;
		}
		function submitManagerAudit() {
			return _submitManagerAudit.apply(this, arguments);
		}
		function _submitManagerAudit() {
			_submitManagerAudit = _asyncToGenerator(function* () {
				if (!activeTask.value) return;
				if (managerForm.result === "approved" && managerForm.targetStatus === "assigned_to_me" && !managerForm.assigneeId) return ElMessage.warning("请选择经办人员");
				if (managerForm.result === "rejected" && !managerForm.remark.trim()) return ElMessage.warning("请填写驳回原因");
				yield runAction(activeTask.value, managerForm.result === "approved" ? "approve" : "reject", {
					targetStatus: managerForm.targetStatus,
					assigneeId: managerForm.assigneeId,
					remark: managerForm.remark.trim() || void 0
				}, "经理审核已提交", () => {
					managerVisible.value = false;
				});
			});
			return _submitManagerAudit.apply(this, arguments);
		}
		function openCost(row) {
			activeTask.value = row;
			costForm.category = "";
			costForm.costAmount = Number(row.costAmount || 0);
			costVisible.value = true;
		}
		function submitCost() {
			return _submitCost.apply(this, arguments);
		}
		function _submitCost() {
			_submitCost = _asyncToGenerator(function* () {
				if (!activeTask.value || !costForm.category.trim()) return ElMessage.warning("请填写成本类目");
				if (costForm.costAmount < 0) return ElMessage.warning("成本金额不能小于 0");
				yield runAction(activeTask.value, "cost", {
					costCategory: costForm.category.trim(),
					costAmount: costForm.costAmount
				}, "成本已保存", () => {
					costVisible.value = false;
				});
			});
			return _submitCost.apply(this, arguments);
		}
		function openReassign(row) {
			activeTask.value = row;
			staffForm.staffId = row.assigneeId;
			staffVisible.value = true;
		}
		function submitReassign() {
			return _submitReassign.apply(this, arguments);
		}
		function _submitReassign() {
			_submitReassign = _asyncToGenerator(function* () {
				if (!activeTask.value || !staffForm.staffId) return ElMessage.warning("请选择人员");
				yield runAction(activeTask.value, "reassign", { assigneeId: staffForm.staffId }, "任务已重新指派", () => {
					staffVisible.value = false;
				});
			});
			return _submitReassign.apply(this, arguments);
		}
		function openException(row) {
			activeTask.value = row;
			exceptionForm.reason = "";
			exceptionVisible.value = true;
		}
		function submitException() {
			return _submitException.apply(this, arguments);
		}
		function _submitException() {
			_submitException = _asyncToGenerator(function* () {
				if (!activeTask.value) return;
				if (!exceptionForm.reason.trim()) return ElMessage.warning("请填写问题说明");
				yield runAction(activeTask.value, "exception", {
					targetStatus: "problem_task",
					reason: exceptionForm.reason.trim()
				}, "已转入问题任务", () => {
					exceptionVisible.value = false;
				});
			});
			return _submitException.apply(this, arguments);
		}
		function confirmSimple(_x2, _x3, _x4, _x5) {
			return _confirmSimple.apply(this, arguments);
		}
		function _confirmSimple() {
			_confirmSimple = _asyncToGenerator(function* (row, action, title, message) {
				try {
					yield ElMessageBox.confirm(message, title, {
						type: action === "recycle" ? "warning" : "info",
						confirmButtonText: "确认",
						cancelButtonText: "取消"
					});
					yield runAction(row, action, {}, `${title}成功`);
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error(errorText(error));
				}
			});
			return _confirmSimple.apply(this, arguments);
		}
		function runAction(_x6, _x7, _x8, _x9, _x10) {
			return _runAction.apply(this, arguments);
		}
		function _runAction() {
			_runAction = _asyncToGenerator(function* (row, action, payload, successText, done) {
				submitting.value = true;
				try {
					yield feigeTaskData.businessAction(row.id, action, payload);
					ElMessage.success(successText);
					done === null || done === void 0 || done();
					yield loadRows();
				} catch (error) {
					ElMessage.error(`操作失败：${errorText(error)}`);
				} finally {
					submitting.value = false;
				}
			});
			return _runAction.apply(this, arguments);
		}
		function staffLabel(item) {
			return `${item.name}${item.deptName ? ` · ${item.deptName}` : ""}`;
		}
		function canUse(row, capability) {
			return feigeTaskLocalDemo() || row[capability] === true;
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
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tooltip = ElTooltip;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_dialog = ElDialog;
			const _component_el_input_number = ElInputNumber;
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
					_cache[25] || (_cache[25] = createBaseVNode("h2", null, "业务任务", -1)),
					createVNode(_component_el_tag, { effect: "plain" }, {
						default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("任务管理", -1)])]),
						_: 1
					}),
					createBaseVNode("p", null, toDisplayString(businessIntro.value), 1)
				]), createBaseVNode("div", _hoisted_4, [
					capabilities.value.bridgeManage && capabilities.value.bridgeTriggerSupported ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						onClick: _cache[0] || (_cache[0] = ($event) => {
							var _configRef$value;
							return (_configRef$value = configRef.value) === null || _configRef$value === void 0 ? void 0 : _configRef$value.open("rule");
						})
					}, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("自动生成规则", -1)])]),
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
						default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("手工补发", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					createVNode(_component_el_button, {
						loading: loading.value,
						onClick: loadRows
					}, {
						default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["loading"])
				])]),
				createBaseVNode("div", _hoisted_5, [
					createVNode(_component_el_tabs, {
						modelValue: activeStatus.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => activeStatus.value = $event),
						class: "business-tabs",
						onTabChange: handleTabChange
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(tabs, (tab) => {
							return createVNode(_component_el_tab_pane, {
								key: tab.value,
								name: tab.value
							}, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_6, [createTextVNode(toDisplayString(tab.label), 1), activeStatus.value === tab.value ? (openBlock(), createElementBlock("span", _hoisted_7, toDisplayString(pagination.total), 1)) : createCommentVNode("", true)])]),
								_: 2
							}, 1032, ["name"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_form, {
						class: "legacy-search-form",
						inline: true,
						onSubmit: _cache[5] || (_cache[5] = withModifiers(() => {}, ["prevent"]))
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "订单编号" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: filters.orderNo,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => filters.orderNo = $event),
									clearable: "",
									placeholder: "请输入订单编号",
									onKeyup: withKeys(handleSearch, ["enter"])
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "公司名称" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: filters.companyName,
									"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => filters.companyName = $event),
									clearable: "",
									placeholder: "请输入公司名称",
									onKeyup: withKeys(handleSearch, ["enter"])
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [createVNode(_component_el_button, {
									type: "primary",
									onClick: handleSearch
								}, {
									default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("查询", -1)])]),
									_: 1
								}), createVNode(_component_el_button, { onClick: resetFilters }, {
									default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("重置", -1)])]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}),
					createBaseVNode("div", _hoisted_8, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						border: "",
						"empty-text": capabilities.value.manager ? "当前环节暂无任务，可用右上角手工补发" : "当前环节暂无任务"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "orderNo",
								label: "订单编号",
								width: "150",
								align: "center"
							}),
							createVNode(_component_el_table_column, {
								prop: "companyName",
								label: "公司名称",
								"min-width": "200",
								align: "center",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.companyName || "-"), 1), row.managerReviewStatus === "rejected" ? (openBlock(), createBlock(_component_el_tooltip, {
									key: 0,
									content: row.managerReviewRemark || "经理审核驳回"
								}, {
									default: withCtx(() => [createVNode(_component_el_tag, {
										class: "review-state-tag",
										type: "danger",
										size: "small"
									}, {
										default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("已驳回", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["content"])) : createCommentVNode("", true)]),
								_: 1
							}),
							activeStatus.value === "pending_manager_audit" ? (openBlock(), createBlock(_component_el_table_column, {
								key: 0,
								prop: "createTime",
								label: "创建时间",
								width: "180",
								align: "center"
							})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
								createVNode(_component_el_table_column, {
									prop: "assigneeName",
									label: "分配人员",
									width: "120",
									align: "center"
								}),
								createVNode(_component_el_table_column, {
									prop: "receivedUserName",
									label: "接收人",
									width: "120",
									align: "center"
								}),
								createVNode(_component_el_table_column, {
									prop: "costCategory",
									label: "成本类目",
									width: "150",
									align: "center"
								}),
								createVNode(_component_el_table_column, {
									prop: "costAmount",
									label: "成本金额",
									width: "120",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.costAmount == null ? "-" : row.costAmount), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									prop: "receivedTime",
									label: "接收时间",
									width: "180",
									align: "center"
								})
							], 64)),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "230",
								fixed: "right",
								align: "center"
							}, {
								default: withCtx(({ row }) => [
									activeStatus.value === "pending_manager_audit" && canUse(row, "canManagerReview") ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										type: "primary",
										link: "",
										onClick: ($event) => openManagerAudit(row)
									}, {
										default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("审核", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									(activeStatus.value === "public_sea" || activeStatus.value === "assigned_to_me") && canUse(row, "canReceive") ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										type: "primary",
										link: "",
										onClick: ($event) => confirmSimple(row, "receive", "确认接收", `确定要接收订单 ${row.orderNo || "-"} 的任务吗？`)
									}, {
										default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("接收", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									activeStatus.value === "task" && canUse(row, "canOperate") ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
										createVNode(_component_el_button, {
											type: "primary",
											link: "",
											onClick: ($event) => openCost(row)
										}, {
											default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("填写成本", -1)])]),
											_: 1
										}, 8, ["onClick"]),
										canUse(row, "canHandover") ? (openBlock(), createBlock(_component_el_button, {
											key: 0,
											type: "primary",
											link: "",
											onClick: ($event) => confirmSimple(row, "handover", "确认交接", `确定要交接订单 ${row.orderNo || "-"} 的任务吗？`)
										}, {
											default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("去交接", -1)])]),
											_: 1
										}, 8, ["onClick"])) : createCommentVNode("", true),
										canUse(row, "canReassign") ? (openBlock(), createBlock(_component_el_button, {
											key: 1,
											type: "primary",
											link: "",
											onClick: ($event) => openReassign(row)
										}, {
											default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("转分配", -1)])]),
											_: 1
										}, 8, ["onClick"])) : createCommentVNode("", true),
										createVNode(_component_el_button, {
											type: "danger",
											link: "",
											onClick: ($event) => openException(row)
										}, {
											default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("转为异常", -1)])]),
											_: 1
										}, 8, ["onClick"])
									], 64)) : createCommentVNode("", true),
									activeStatus.value === "handover" && canUse(row, "canConfirmHandover") ? (openBlock(), createBlock(_component_el_button, {
										key: 3,
										type: "primary",
										link: "",
										onClick: ($event) => confirmSimple(row, "confirm-handover", "确认完成", `确定订单 ${row.orderNo || "-"} 的交接已完成吗？`)
									}, {
										default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("确认完成", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									activeStatus.value === "problem_task" ? (openBlock(), createElementBlock(Fragment, { key: 4 }, [canUse(row, "canReassign") ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										type: "primary",
										link: "",
										onClick: ($event) => openReassign(row)
									}, {
										default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("转分配", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true), canUse(row, "canRecycle") ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										type: "danger",
										link: "",
										onClick: ($event) => confirmSimple(row, "recycle", "移入回收站", "确认将该任务移入回收站？")
									}, {
										default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("回收站", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)], 64)) : createCommentVNode("", true),
									activeStatus.value === "recycle_bin" && canUse(row, "canReassign") ? (openBlock(), createBlock(_component_el_button, {
										key: 5,
										type: "primary",
										link: "",
										onClick: ($event) => openReassign(row)
									}, {
										default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("转分配", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data", "empty-text"])), [[_directive_loading, loading.value]])]),
					createBaseVNode("div", _hoisted_9, [createVNode(_component_el_pagination, {
						"current-page": pagination.pageNum,
						"onUpdate:currentPage": _cache[6] || (_cache[6] = ($event) => pagination.pageNum = $event),
						"page-size": pagination.pageSize,
						"onUpdate:pageSize": _cache[7] || (_cache[7] = ($event) => pagination.pageSize = $event),
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
				createVNode(_component_el_dialog, {
					modelValue: managerVisible.value,
					"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => managerVisible.value = $event),
					title: "工商经理审核",
					width: "800px",
					"append-to-body": "",
					"destroy-on-close": "",
					"close-on-click-modal": false
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[12] || (_cache[12] = ($event) => managerVisible.value = false) }, {
						default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: managerForm.result === "rejected" ? "danger" : "primary",
						loading: submitting.value,
						onClick: submitManagerAudit
					}, {
						default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("确认提交", -1)])]),
						_: 1
					}, 8, ["type", "loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "审核结果",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: managerForm.result,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => managerForm.result = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { value: "approved" }, {
										default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("通过", -1)])]),
										_: 1
									}), createVNode(_component_el_radio, { value: "rejected" }, {
										default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("驳回", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							managerForm.result === "approved" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_form_item, {
								label: "分配方式",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: managerForm.targetStatus,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => managerForm.targetStatus = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { value: "public_sea" }, {
										default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("放入公海", -1)])]),
										_: 1
									}), createVNode(_component_el_radio, { value: "assigned_to_me" }, {
										default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("指定工商人员", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}), managerForm.targetStatus === "assigned_to_me" ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "指定工商人员",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: managerForm.assigneeId,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => managerForm.assigneeId = $event),
									filterable: "",
									style: { "width": "100%" },
									placeholder: "请选择工商人员"
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
							})) : createCommentVNode("", true)], 64)) : createCommentVNode("", true),
							createVNode(_component_el_form_item, { label: "审核备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: managerForm.remark,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => managerForm.remark = $event),
									type: "textarea",
									rows: 4,
									maxlength: "500",
									"show-word-limit": "",
									placeholder: "请输入审核备注"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: costVisible.value,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => costVisible.value = $event),
					title: "填写成本信息",
					width: "600px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[16] || (_cache[16] = ($event) => costVisible.value = false) }, {
						default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitCost
					}, {
						default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("确定", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "成本类目",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: costForm.category,
								"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => costForm.category = $event),
								placeholder: "请输入成本类目",
								maxlength: "100"
							}, null, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, {
							label: "成本金额",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input_number, {
								modelValue: costForm.costAmount,
								"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => costForm.costAmount = $event),
								min: 0,
								precision: 2,
								"controls-position": "right",
								style: { "width": "100%" }
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: staffVisible.value,
					"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => staffVisible.value = $event),
					title: "转分配工商人员",
					width: "600px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[19] || (_cache[19] = ($event) => staffVisible.value = false) }, {
						default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitReassign
					}, {
						default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("确定", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "工商人员",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: staffForm.staffId,
								"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => staffForm.staffId = $event),
								filterable: "",
								style: { "width": "100%" },
								placeholder: "请选择工商人员"
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
				createVNode(_component_el_dialog, {
					modelValue: exceptionVisible.value,
					"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => exceptionVisible.value = $event),
					title: "转为异常",
					width: "600px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[22] || (_cache[22] = ($event) => exceptionVisible.value = false) }, {
						default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						loading: submitting.value,
						onClick: submitException
					}, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("确定", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "原因",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: exceptionForm.reason,
								"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => exceptionForm.reason = $event),
								type: "textarea",
								rows: 4,
								maxlength: "500",
								"show-word-limit": "",
								placeholder: "请输入原因"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(BusinessTaskCreateDialog_default, {
					ref_key: "createRef",
					ref: createRef,
					staff: staffOptions.value,
					orders: orderOptions.value,
					onCreate: createBusinessTask
				}, null, 8, ["staff", "orders"]),
				createVNode(TaskConfigDialog_default, {
					ref_key: "configRef",
					ref: configRef,
					"task-type": "business",
					roles: [],
					staff: staffOptions.value,
					capabilities: capabilities.value
				}, null, 8, ["staff", "capabilities"])
			]);
		};
	}
}), [["__scopeId", "data-v-7a09923d"]]);
//#endregion
export { business_task_default as default };

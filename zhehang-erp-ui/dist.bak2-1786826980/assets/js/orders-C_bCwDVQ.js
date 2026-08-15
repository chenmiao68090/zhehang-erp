import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, H as ElDescriptions, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, R as ElDropdownMenu, St as arrow_down_default, U as ElDescriptionsItem, Un as search_default, V as ElDialog, Vt as close_default, W as ElDatePicker, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, lr as trend_charts_default, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { y as hasImpersonationSessionMarker } from "./request-CZ5tKmxn.js";
import { o as usePermissionStore } from "./index-C4y3JnUs.js";
import { a as formatDateTime, c as optionType, l as orderStatuses, o as money, r as businessTypes, s as optionLabel, t as feigeOrderData } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
import { t as OrderFormDialog_default } from "./OrderFormDialog-BLIZwwKy.js";
import { t as OrderDetailDrawer_default } from "./OrderDetailDrawer-Cbl_Rc56.js";
import { t as registration_default } from "./registration-B8MA4Ghn.js";
//#region src/views/feige-order-contract/orders.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "feige-module feige-legacy-page" };
var _hoisted_2 = { class: "content-card legacy-order-card" };
var _hoisted_3 = { class: "legacy-toolbar" };
var _hoisted_4 = { class: "header-actions" };
var _hoisted_5 = {
	key: 0,
	class: "header-actions"
};
var _hoisted_6 = {
	key: 0,
	class: "active-filter-row"
};
var _hoisted_7 = { class: "table-wrap legacy-wide-table" };
var _hoisted_8 = { class: "pagination-row" };
var _hoisted_9 = { class: "drawer-footer" };
var _hoisted_10 = { class: "drawer-section" };
//#endregion
//#region src/views/feige-order-contract/orders.vue
var orders_default = /* @__PURE__ */ defineComponent({
	__name: "orders",
	setup(__props) {
		const sourceOptions = [
			"新媒体",
			"客户转介绍",
			"线下活动",
			"渠道合作",
			"老客户复购",
			"自然到访",
			"合作伙伴",
			"其他"
		];
		const permissionStore = usePermissionStore();
		const loading = ref(false);
		const submitting = ref(false);
		const rows = ref([]);
		const staff = ref([]);
		const orderView = ref("standard");
		const sealListVersion = ref(0);
		const filters = reactive({
			scope: "mine",
			keyword: "",
			salesmanId: void 0,
			status: "",
			businessType: "",
			customerSource: "",
			dates: []
		});
		const page = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		const filterVisible = ref(false);
		const formVisible = ref(false);
		const sealCreateVisible = ref(false);
		const detailVisible = ref(false);
		const paymentsVisible = ref(false);
		const recurringVisible = ref(false);
		const paymentVisible = ref(false);
		const refundVisible = ref(false);
		const sealPrefill = ref({});
		const current = ref(null);
		const editingOrder = ref(null);
		const actionOrder = ref(null);
		const payments = ref([]);
		const recurringOrders = ref([]);
		const paymentForm = reactive({
			amount: 0,
			paymentTime: "",
			paymentMethod: "银行转账",
			accountNumber: "",
			remarks: ""
		});
		const refundForm = reactive({
			refundAmount: 0,
			reason: ""
		});
		const activeFilterCount = computed(() => [
			filters.keyword,
			filters.salesmanId,
			filters.status,
			filters.businessType,
			filters.customerSource,
			filters.dates.length
		].filter(Boolean).length);
		const canManageSeal = computed(() => !hasImpersonationSessionMarker() && permissionStore.routes.some((route) => route.path === "/order" && (route.children || []).some((child) => child.path === "seal-order")));
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = yield feigeOrderData.orders({
						pageNum: page.pageNum,
						pageSize: page.pageSize,
						scope: filters.scope,
						keyword: filters.keyword || void 0,
						salesmanId: filters.salesmanId,
						status: filters.status || void 0,
						businessType: filters.businessType || void 0,
						customerSource: filters.customerSource || void 0,
						startDate: filters.dates[0],
						endDate: filters.dates[1]
					});
					rows.value = data.records || [];
					page.total = Number(data.total || 0);
				} finally {
					loading.value = false;
				}
			});
			return _loadRows.apply(this, arguments);
		}
		function search() {
			page.pageNum = 1;
			loadRows();
		}
		function reset() {
			Object.assign(filters, {
				keyword: "",
				salesmanId: void 0,
				status: "",
				businessType: "",
				customerSource: "",
				dates: []
			});
			filterVisible.value = false;
			search();
		}
		function applyFilter() {
			filterVisible.value = false;
			search();
		}
		function openCreate() {
			editingOrder.value = null;
			formVisible.value = true;
		}
		function openSealCreate(prefill) {
			sealPrefill.value = _objectSpread2({}, prefill);
			sealCreateVisible.value = true;
		}
		function closeSealCreate() {
			sealCreateVisible.value = false;
			sealPrefill.value = {};
		}
		function handleSealSaved() {
			sealListVersion.value += 1;
			orderView.value = "seal";
		}
		function edit(row) {
			editingOrder.value = row;
			formVisible.value = true;
		}
		function openDetail(_x) {
			return _openDetail.apply(this, arguments);
		}
		function _openDetail() {
			_openDetail = _asyncToGenerator(function* (row) {
				current.value = yield feigeOrderData.order(row.id);
				detailVisible.value = true;
			});
			return _openDetail.apply(this, arguments);
		}
		function openPayments(_x2) {
			return _openPayments.apply(this, arguments);
		}
		function _openPayments() {
			_openPayments = _asyncToGenerator(function* (row) {
				current.value = row;
				payments.value = yield feigeOrderData.payments(row.id);
				paymentsVisible.value = true;
			});
			return _openPayments.apply(this, arguments);
		}
		function openRecurring(_x3) {
			return _openRecurring.apply(this, arguments);
		}
		function _openRecurring() {
			_openRecurring = _asyncToGenerator(function* (row) {
				current.value = row;
				const data = yield feigeOrderData.orders({
					pageNum: 1,
					pageSize: 100,
					keyword: row.companyName
				});
				recurringOrders.value = data.records.length > 1 ? data.records : [row, _objectSpread2(_objectSpread2({}, row), {}, {
					id: row.id + 1e4,
					orderNo: `${row.orderNo}-HISTORY`,
					orderDate: "2025-08-01",
					status: "completed",
					remarks: "LOCAL-DEMO历史复购订单"
				})];
				recurringVisible.value = true;
			});
			return _openRecurring.apply(this, arguments);
		}
		function openPayment(row) {
			actionOrder.value = row;
			Object.assign(paymentForm, {
				amount: Number(row.outstandingAmount || 0),
				paymentTime: "",
				paymentMethod: "银行转账",
				accountNumber: "",
				remarks: ""
			});
			paymentVisible.value = true;
		}
		function openRefund(row) {
			actionOrder.value = row;
			Object.assign(refundForm, {
				refundAmount: Number(row.receivedAmount || 0),
				reason: ""
			});
			refundVisible.value = true;
		}
		function submitPayment() {
			return _submitPayment.apply(this, arguments);
		}
		function _submitPayment() {
			_submitPayment = _asyncToGenerator(function* () {
				if (!actionOrder.value || paymentForm.amount <= 0) return ElMessage.warning("请填写正确的收款金额");
				submitting.value = true;
				try {
					yield feigeOrderData.addPayment(actionOrder.value.id, paymentForm);
					ElMessage.success("收款已登记");
					paymentVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitPayment.apply(this, arguments);
		}
		function submitRefund() {
			return _submitRefund.apply(this, arguments);
		}
		function _submitRefund() {
			_submitRefund = _asyncToGenerator(function* () {
				if (!actionOrder.value || refundForm.refundAmount <= 0 || !refundForm.reason.trim()) return ElMessage.warning("请填写退费金额和原因");
				submitting.value = true;
				try {
					yield feigeOrderData.applyRefund(actionOrder.value.id, refundForm);
					ElMessage.success("退单申请已提交");
					refundVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitRefund.apply(this, arguments);
		}
		function confirm(_x4) {
			return _confirm.apply(this, arguments);
		}
		function _confirm() {
			_confirm = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认“${row.companyName}”的订单并进入办理？`, "确认订单", { type: "warning" });
				yield feigeOrderData.confirmOrder(row.id);
				ElMessage.success("订单已确认");
				yield loadRows();
			});
			return _confirm.apply(this, arguments);
		}
		function reject(_x5) {
			return _reject.apply(this, arguments);
		}
		function _reject() {
			_reject = _asyncToGenerator(function* (row) {
				const result = yield ElMessageBox.prompt(`请填写驳回“${row.companyName}”订单的原因`, "驳回订单", {
					inputValidator: (value) => !!String(value || "").trim() || "请填写原因",
					type: "warning"
				});
				yield feigeOrderData.rejectOrder(row.id, result.value);
				ElMessage.success("订单已驳回");
				yield loadRows();
			});
			return _reject.apply(this, arguments);
		}
		function complete(_x6) {
			return _complete.apply(this, arguments);
		}
		function _complete() {
			_complete = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认“${row.companyName}”已办理完成？`, "完成订单", { type: "warning" });
				yield feigeOrderData.completeOrder(row.id);
				ElMessage.success("订单已完成");
				yield loadRows();
			});
			return _complete.apply(this, arguments);
		}
		function handleCommand(_x7, _x8) {
			return _handleCommand.apply(this, arguments);
		}
		function _handleCommand() {
			_handleCommand = _asyncToGenerator(function* (command, row) {
				if (command === "edit") edit(row);
				else if (command === "detail" || command === "logs") yield openDetail(row);
				else if (command === "recurring") yield openRecurring(row);
				else if (command === "payment") openPayment(row);
				else if (command === "refund") openRefund(row);
				else if (command === "confirm") yield confirm(row);
				else if (command === "reject") yield reject(row);
				else if (command === "complete") yield complete(row);
			});
			return _handleCommand.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			staff.value = yield feigeOrderData.staffOptions();
			yield loadRows();
		}));
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_tag = ElTag;
			const _component_el_table_column = ElTableColumn;
			const _component_el_icon = ElIcon;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form = ElForm;
			const _component_el_drawer = ElDrawer;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_alert = ElAlert;
			const _component_el_input_number = ElInputNumber;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: openCreate
					}, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("新增订单", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_radio_group, {
						modelValue: orderView.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => orderView.value = $event)
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { value: "standard" }, {
							default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("标准订单", -1)])]),
							_: 1
						}), canManageSeal.value ? (openBlock(), createBlock(_component_el_radio_button, {
							key: 0,
							value: "seal"
						}, {
							default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("刻章订单", -1)])]),
							_: 1
						})) : createCommentVNode("", true)]),
						_: 1
					}, 8, ["modelValue"]),
					orderView.value === "standard" ? (openBlock(), createBlock(_component_el_radio_group, {
						key: 0,
						modelValue: filters.scope,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.scope = $event),
						onChange: search
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { value: "mine" }, {
							default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("我的订单", -1)])]),
							_: 1
						}), createVNode(_component_el_radio_button, { value: "all" }, {
							default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("全部订单", -1)])]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true)
				]), orderView.value === "standard" ? (openBlock(), createElementBlock("div", _hoisted_5, [
					createVNode(_component_el_button, {
						icon: unref(search_default),
						onClick: _cache[2] || (_cache[2] = ($event) => filterVisible.value = true)
					}, {
						default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					activeFilterCount.value ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						icon: unref(close_default),
						onClick: reset
					}, {
						default: withCtx(() => [createTextVNode("清空筛选（" + toDisplayString(activeFilterCount.value) + "）", 1)]),
						_: 1
					}, 8, ["icon"])) : createCommentVNode("", true),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: loadRows
					}, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"])
				])) : createCommentVNode("", true)]), orderView.value === "standard" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					activeFilterCount.value ? (openBlock(), createElementBlock("div", _hoisted_6, [
						_cache[39] || (_cache[39] = createBaseVNode("span", null, "当前筛选", -1)),
						filters.keyword ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							closable: "",
							onClose: _cache[3] || (_cache[3] = ($event) => filters.keyword = "")
						}, {
							default: withCtx(() => [createTextVNode("关键词：" + toDisplayString(filters.keyword), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						filters.status ? (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							closable: "",
							onClose: _cache[4] || (_cache[4] = ($event) => filters.status = "")
						}, {
							default: withCtx(() => [createTextVNode("状态：" + toDisplayString(unref(optionLabel)(unref(orderStatuses), filters.status)), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						filters.businessType ? (openBlock(), createBlock(_component_el_tag, {
							key: 2,
							closable: "",
							onClose: _cache[5] || (_cache[5] = ($event) => filters.businessType = "")
						}, {
							default: withCtx(() => [createTextVNode("业务：" + toDisplayString(unref(optionLabel)(unref(businessTypes), filters.businessType)), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						filters.customerSource ? (openBlock(), createBlock(_component_el_tag, {
							key: 3,
							closable: "",
							onClose: _cache[6] || (_cache[6] = ($event) => filters.customerSource = "")
						}, {
							default: withCtx(() => [createTextVNode("来源：" + toDisplayString(filters.customerSource), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_button, {
							link: "",
							type: "primary",
							onClick: search
						}, {
							default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("应用", -1)])]),
							_: 1
						})
					])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_7, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						"empty-text": "暂无订单",
						"highlight-current-row": ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "订单编号",
								width: "178",
								fixed: "left"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.orderNo), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "下单时间",
								width: "155"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.createTime || row.orderDate)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务人员",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.salesmanName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "所属团队",
								width: "145",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.teamName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "公司名称",
								"min-width": "225",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									class: "company-link",
									onClick: ($event) => openDetail(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.companyName), 1)]),
									_: 2
								}, 1032, ["onClick"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务类型",
								width: "135"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(businessTypes), row.businessType)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "客户来源",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.customerSource || row.opportunitySource || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "订单状态",
								width: "115",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: unref(optionType)(unref(orderStatuses), row.status),
									effect: "light"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(orderStatuses), row.status)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "流程进度",
								width: "118",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									type: "primary",
									plain: "",
									onClick: ($event) => openDetail(row)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(trend_charts_default))]),
										_: 1
									}), createTextVNode(toDisplayString(row.flowProgress || "查看"), 1)]),
									_: 2
								}, 1032, ["onClick"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "费用详情",
								width: "118",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									type: "primary",
									plain: "",
									onClick: ($event) => openPayments(row)
								}, {
									default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("收款详情", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "复购信息",
								width: "105",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.recurring ? "success" : "info",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.recurring ? `${row.repurchaseCount || 1}单` : "首单"), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "备注信息",
								"min-width": "190",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.remarks || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "112",
								fixed: "right",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_dropdown, {
									trigger: "click",
									onCommand: ($event) => handleCommand($event, row)
								}, {
									dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
										default: withCtx(() => [
											createVNode(_component_el_dropdown_item, { command: "edit" }, {
												default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("修改信息", -1)])]),
												_: 1
											}),
											createVNode(_component_el_dropdown_item, { command: "detail" }, {
												default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("订单详情", -1)])]),
												_: 1
											}),
											createVNode(_component_el_dropdown_item, { command: "logs" }, {
												default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("操作记录", -1)])]),
												_: 1
											}),
											row.recurring ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 0,
												command: "recurring"
											}, {
												default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("客户全部订单", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											["pending", "rejected"].includes(row.status) ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 1,
												command: "confirm",
												divided: ""
											}, {
												default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("确认订单", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											["pending", "in_progress"].includes(row.status) ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 2,
												command: "reject"
											}, {
												default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("驳回订单", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											Number(row.receivedAmount) > 0 && !["refunded", "cancelled"].includes(row.status) ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 3,
												command: "refund"
											}, {
												default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("退单申请", -1)])]),
												_: 1
											})) : createCommentVNode("", true),
											row.status === "in_progress" ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 4,
												command: "complete"
											}, {
												default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("完成订单", -1)])]),
												_: 1
											})) : createCommentVNode("", true)
										]),
										_: 2
									}, 1024)]),
									default: withCtx(() => [createVNode(_component_el_button, {
										link: "",
										type: "primary"
									}, {
										default: withCtx(() => [_cache[41] || (_cache[41] = createTextVNode("操作", -1)), createVNode(_component_el_icon, { class: "el-icon--right" }, {
											default: withCtx(() => [createVNode(unref(arrow_down_default))]),
											_: 1
										})]),
										_: 1
									})]),
									_: 2
								}, 1032, ["onCommand"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]])]),
					createBaseVNode("div", _hoisted_8, [createVNode(_component_el_pagination, {
						"current-page": page.pageNum,
						"onUpdate:currentPage": _cache[7] || (_cache[7] = ($event) => page.pageNum = $event),
						"page-size": page.pageSize,
						"onUpdate:pageSize": _cache[8] || (_cache[8] = ($event) => page.pageSize = $event),
						total: page.total,
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						layout: "total, prev, pager, next, sizes, jumper",
						onChange: loadRows
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				], 64)) : canManageSeal.value ? (openBlock(), createBlock(registration_default, {
					key: sealListVersion.value,
					embedded: ""
				})) : createCommentVNode("", true)]),
				createVNode(_component_el_drawer, {
					modelValue: filterVisible.value,
					"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => filterVisible.value = $event),
					class: "feige-filter-drawer",
					size: "min(440px, 94vw)",
					title: "订单查询",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createBaseVNode("div", _hoisted_9, [createVNode(_component_el_button, { onClick: reset }, {
						default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("重置", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: applyFilter
					}, {
						default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("查询订单", -1)])]),
						_: 1
					})])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "订单编号 / 公司名称" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: filters.keyword,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => filters.keyword = $event),
									clearable: "",
									placeholder: "订单号、公司、联系人或电话"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "业务人员" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: filters.salesmanId,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => filters.salesmanId = $event),
									clearable: "",
									filterable: "",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
										return openBlock(), createBlock(_component_el_option, {
											key: item.id,
											label: `${item.name} · ${item.deptName || "-"}`,
											value: item.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "订单状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: filters.status,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => filters.status = $event),
									clearable: "",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(orderStatuses), (item) => {
										return openBlock(), createBlock(_component_el_option, {
											key: item.value,
											label: item.label,
											value: item.value
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "业务类型" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: filters.businessType,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => filters.businessType = $event),
									clearable: "",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(businessTypes), (item) => {
										return openBlock(), createBlock(_component_el_option, {
											key: item.value,
											label: item.label,
											value: item.value
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "客户来源" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: filters.customerSource,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => filters.customerSource = $event),
									clearable: "",
									filterable: "",
									"allow-create": "",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(sourceOptions, (item) => {
										return createVNode(_component_el_option, {
											key: item,
											label: item,
											value: item
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "下单时间" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: filters.dates,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => filters.dates = $event),
									type: "daterange",
									"value-format": "YYYY-MM-DD",
									"range-separator": "至",
									"start-placeholder": "开始日期",
									"end-placeholder": "结束日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(OrderFormDialog_default, {
					modelValue: formVisible.value,
					"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => formVisible.value = $event),
					order: editingOrder.value,
					staff: staff.value,
					"allow-seal": canManageSeal.value,
					onSaved: loadRows,
					onSealRequested: openSealCreate
				}, null, 8, [
					"modelValue",
					"order",
					"staff",
					"allow-seal"
				]),
				sealCreateVisible.value ? (openBlock(), createBlock(registration_default, {
					key: 0,
					"create-only": "",
					"initial-data": sealPrefill.value,
					onClosed: closeSealCreate,
					onSaved: handleSealSaved
				}, null, 8, ["initial-data"])) : createCommentVNode("", true),
				createVNode(OrderDetailDrawer_default, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => detailVisible.value = $event),
					order: current.value
				}, null, 8, ["modelValue", "order"]),
				createVNode(_component_el_drawer, {
					modelValue: paymentsVisible.value,
					"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => paymentsVisible.value = $event),
					class: "feige-detail-drawer",
					size: "min(720px, 94vw)",
					title: "费用详情",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [current.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_descriptions, {
						column: 3,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "合同金额" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "已收金额" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.receivedAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "待收金额" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.outstandingAmount)), 1)]),
								_: 1
							})
						]),
						_: 1
					}), createBaseVNode("div", _hoisted_10, [_cache[52] || (_cache[52] = createBaseVNode("h3", null, "收款记录", -1)), createVNode(_component_el_table, {
						data: payments.value,
						"empty-text": "暂无收款记录"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "收款时间",
								"min-width": "170"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.paymentTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "金额",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(money)(row.amount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "paymentMethod",
								label: "方式",
								width: "110"
							}),
							createVNode(_component_el_table_column, {
								prop: "accountNumber",
								label: "账户",
								"min-width": "140"
							}),
							createVNode(_component_el_table_column, {
								prop: "remarks",
								label: "备注",
								"min-width": "160"
							})
						]),
						_: 1
					}, 8, ["data"])])], 64)) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: recurringVisible.value,
					"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => recurringVisible.value = $event),
					class: "feige-detail-drawer",
					size: "min(860px, 95vw)",
					title: "客户全部订单",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [current.value ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						title: current.value.companyName,
						description: "同一客户历史订单，便于查看复购和服务连续性。",
						type: "info",
						closable: false,
						"show-icon": ""
					}, null, 8, ["title"])) : createCommentVNode("", true), createVNode(_component_el_table, {
						data: recurringOrders.value,
						style: { "margin-top": "16px" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "orderNo",
								label: "订单编号",
								width: "190"
							}),
							createVNode(_component_el_table_column, {
								prop: "orderDate",
								label: "下单日期",
								width: "125"
							}),
							createVNode(_component_el_table_column, {
								label: "业务类型",
								width: "140"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(businessTypes), row.businessType)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "合同金额",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(money)(row.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(orderStatuses), row.status)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "remarks",
								label: "备注",
								"min-width": "180"
							})
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: paymentVisible.value,
					"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => paymentVisible.value = $event),
					width: "520px",
					title: "登记收款",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[25] || (_cache[25] = ($event) => paymentVisible.value = false) }, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitPayment
					}, {
						default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("确认收款", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: paymentForm,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "客户" }, {
								default: withCtx(() => {
									var _actionOrder$value;
									return [createTextVNode(toDisplayString((_actionOrder$value = actionOrder.value) === null || _actionOrder$value === void 0 ? void 0 : _actionOrder$value.companyName), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "待收金额" }, {
								default: withCtx(() => {
									var _actionOrder$value2;
									return [createTextVNode(toDisplayString(unref(money)(((_actionOrder$value2 = actionOrder.value) === null || _actionOrder$value2 === void 0 ? void 0 : _actionOrder$value2.outstandingAmount) || 0)), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "本次收款",
								required: ""
							}, {
								default: withCtx(() => {
									var _actionOrder$value3;
									return [createVNode(_component_el_input_number, {
										modelValue: paymentForm.amount,
										"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => paymentForm.amount = $event),
										min: .01,
										max: Number(((_actionOrder$value3 = actionOrder.value) === null || _actionOrder$value3 === void 0 ? void 0 : _actionOrder$value3.outstandingAmount) || 0),
										precision: 2,
										"controls-position": "right",
										style: { "width": "100%" }
									}, null, 8, ["modelValue", "max"])];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款时间" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: paymentForm.paymentTime,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => paymentForm.paymentTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DDTHH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款方式" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: paymentForm.paymentMethod,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => paymentForm.paymentMethod = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "微信",
											value: "微信"
										}),
										createVNode(_component_el_option, {
											label: "支付宝",
											value: "支付宝"
										}),
										createVNode(_component_el_option, {
											label: "银行转账",
											value: "银行转账"
										}),
										createVNode(_component_el_option, {
											label: "现金",
											value: "现金"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款账户" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: paymentForm.accountNumber,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => paymentForm.accountNumber = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: paymentForm.remarks,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => paymentForm.remarks = $event),
									type: "textarea",
									rows: 3
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: refundVisible.value,
					"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => refundVisible.value = $event),
					width: "540px",
					title: "退单申请",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[29] || (_cache[29] = ($event) => refundVisible.value = false) }, {
						default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitRefund
					}, {
						default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("提交申请", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						title: "提交后进入退费订单，由主管审核、财务完成。",
						type: "warning",
						closable: false,
						"show-icon": ""
					}), createVNode(_component_el_form, {
						"label-width": "92px",
						style: { "margin-top": "18px" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "客户" }, {
								default: withCtx(() => {
									var _actionOrder$value4;
									return [createTextVNode(toDisplayString((_actionOrder$value4 = actionOrder.value) === null || _actionOrder$value4 === void 0 ? void 0 : _actionOrder$value4.companyName), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "退费金额",
								required: ""
							}, {
								default: withCtx(() => {
									var _actionOrder$value5;
									return [createVNode(_component_el_input_number, {
										modelValue: refundForm.refundAmount,
										"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => refundForm.refundAmount = $event),
										min: .01,
										max: Number(((_actionOrder$value5 = actionOrder.value) === null || _actionOrder$value5 === void 0 ? void 0 : _actionOrder$value5.receivedAmount) || 0),
										precision: 2,
										style: { "width": "100%" }
									}, null, 8, ["modelValue", "max"])];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "退费原因",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: refundForm.reason,
									"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => refundForm.reason = $event),
									type: "textarea",
									rows: 4,
									maxlength: "500",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
});
//#endregion
export { orders_default as default };

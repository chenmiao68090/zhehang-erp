import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, H as ElDescriptions, M as ElInputNumber, U as ElDescriptionsItem, Un as search_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { a as formatDateTime, o as money, r as businessTypes, s as optionLabel, t as feigeOrderData } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
//#region src/views/feige-order-contract/unreceived.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "feige-module feige-legacy-page" };
var _hoisted_2 = { class: "stats-grid" };
var _hoisted_3 = { class: "stat-card" };
var _hoisted_4 = { class: "stat-value warning" };
var _hoisted_5 = { class: "stat-card" };
var _hoisted_6 = { class: "stat-value" };
var _hoisted_7 = { class: "stat-card" };
var _hoisted_8 = { class: "stat-value success" };
var _hoisted_9 = { class: "stat-card" };
var _hoisted_10 = { class: "stat-value danger" };
var _hoisted_11 = { class: "content-card" };
var _hoisted_12 = { class: "filter-bar" };
var _hoisted_13 = { class: "filter-actions" };
var _hoisted_14 = { class: "table-wrap" };
var _hoisted_15 = { class: "customer-name" };
var _hoisted_16 = { class: "sub-text" };
var _hoisted_17 = { class: "money" };
var _hoisted_18 = { class: "money strong" };
var _hoisted_19 = { class: "money debt" };
var _hoisted_20 = { class: "pagination-row" };
var _hoisted_21 = { class: "money strong" };
//#endregion
//#region src/views/feige-order-contract/unreceived.vue
var unreceived_default = /* @__PURE__ */ defineComponent({
	__name: "unreceived",
	setup(__props) {
		const loading = ref(false);
		const submitting = ref(false);
		const keyword = ref("");
		const salesmanId = ref();
		const staff = ref([]);
		const rows = ref([]);
		const page = reactive({
			pageNum: 1,
			pageSize: 20,
			total: 0
		});
		const current = ref(null);
		const paymentVisible = ref(false);
		const historyVisible = ref(false);
		const payments = ref([]);
		const paymentForm = reactive({
			amount: 0,
			paymentTime: "",
			paymentMethod: "bank",
			accountNumber: "",
			voucher: "",
			remarks: ""
		});
		const pageContract = computed(() => rows.value.reduce((sum, row) => sum + Number(row.contractAmount || 0), 0));
		const pageReceived = computed(() => rows.value.reduce((sum, row) => sum + Number(row.receivedAmount || 0), 0));
		const pageOutstanding = computed(() => rows.value.reduce((sum, row) => sum + Number(row.outstandingAmount || 0), 0));
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = yield feigeOrderData.unreceived({
						pageNum: page.pageNum,
						pageSize: page.pageSize,
						keyword: keyword.value || void 0,
						salesmanId: salesmanId.value
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
			keyword.value = "";
			salesmanId.value = void 0;
			search();
		}
		function openPayment(row) {
			current.value = row;
			Object.assign(paymentForm, {
				amount: Number(row.outstandingAmount || 0),
				paymentTime: "",
				paymentMethod: "bank",
				accountNumber: "",
				voucher: "",
				remarks: ""
			});
			paymentVisible.value = true;
		}
		function submitPayment() {
			return _submitPayment.apply(this, arguments);
		}
		function _submitPayment() {
			_submitPayment = _asyncToGenerator(function* () {
				if (!current.value || paymentForm.amount <= 0) return ElMessage.warning("请填写正确的收款金额");
				submitting.value = true;
				try {
					yield feigeOrderData.addPayment(current.value.id, paymentForm);
					ElMessage.success("收款已登记，待收金额已更新");
					paymentVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitPayment.apply(this, arguments);
		}
		function showHistory(_x) {
			return _showHistory.apply(this, arguments);
		}
		function _showHistory() {
			_showHistory = _asyncToGenerator(function* (row) {
				current.value = row;
				payments.value = yield feigeOrderData.payments(row.id);
				historyVisible.value = true;
			});
			return _showHistory.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			staff.value = yield feigeOrderData.staffOptions();
			yield loadRows();
		}));
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form_item = ElFormItem;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [_cache[13] || (_cache[13] = createBaseVNode("div", { class: "stat-label" }, "未收款订单", -1)), createBaseVNode("div", _hoisted_4, toDisplayString(page.total), 1)]),
					createBaseVNode("div", _hoisted_5, [_cache[14] || (_cache[14] = createBaseVNode("div", { class: "stat-label" }, "本页合同金额", -1)), createBaseVNode("div", _hoisted_6, toDisplayString(unref(money)(pageContract.value)), 1)]),
					createBaseVNode("div", _hoisted_7, [_cache[15] || (_cache[15] = createBaseVNode("div", { class: "stat-label" }, "本页已收", -1)), createBaseVNode("div", _hoisted_8, toDisplayString(unref(money)(pageReceived.value)), 1)]),
					createBaseVNode("div", _hoisted_9, [_cache[16] || (_cache[16] = createBaseVNode("div", { class: "stat-label" }, "本页待收", -1)), createBaseVNode("div", _hoisted_10, toDisplayString(unref(money)(pageOutstanding.value)), 1)])
				]),
				createBaseVNode("section", _hoisted_11, [
					createBaseVNode("div", _hoisted_12, [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
							class: "filter-keyword",
							clearable: "",
							placeholder: "搜索订单号、公司或联系人",
							"prefix-icon": unref(search_default),
							onKeyup: withKeys(search, ["enter"])
						}, null, 8, ["modelValue", "prefix-icon"]),
						createVNode(_component_el_select, {
							modelValue: salesmanId.value,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => salesmanId.value = $event),
							class: "filter-select",
							clearable: "",
							placeholder: "业务人员"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
								return openBlock(), createBlock(_component_el_option, {
									key: item.id,
									label: item.name,
									value: item.id
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_13, [
							createVNode(_component_el_button, {
								type: "primary",
								icon: unref(search_default),
								onClick: search
							}, {
								default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("查询", -1)])]),
								_: 1
							}, 8, ["icon"]),
							createVNode(_component_el_button, { onClick: reset }, {
								default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("重置", -1)])]),
								_: 1
							}),
							createVNode(_component_el_button, {
								icon: unref(refresh_default),
								onClick: loadRows
							}, {
								default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("刷新", -1)])]),
								_: 1
							}, 8, ["icon"])
						])
					]),
					createBaseVNode("div", _hoisted_14, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						"empty-text": "当前没有未收款订单"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "订单编号",
								width: "190"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.orderNo), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "客户",
								"min-width": "250",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_15, toDisplayString(row.companyName), 1), createBaseVNode("div", _hoisted_16, toDisplayString(row.contacts || "未填联系人"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务人员",
								width: "120",
								prop: "salesmanName"
							}),
							createVNode(_component_el_table_column, {
								label: "业务类型",
								width: "135"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(businessTypes), row.businessType)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "合同金额",
								width: "135",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_17, toDisplayString(unref(money)(row.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "已收金额",
								width: "135",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_18, toDisplayString(unref(money)(row.receivedAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "待收金额",
								width: "140",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_19, toDisplayString(unref(money)(row.outstandingAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "最近收款",
								width: "175"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.collectionTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "150",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openPayment(row)
								}, {
									default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("登记收款", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									link: "",
									onClick: ($event) => showHistory(row)
								}, {
									default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("明细", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]])]),
					createBaseVNode("div", _hoisted_20, [createVNode(_component_el_pagination, {
						"current-page": page.pageNum,
						"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => page.pageNum = $event),
						"page-size": page.pageSize,
						"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => page.pageSize = $event),
						total: page.total,
						"page-sizes": [
							20,
							50,
							100
						],
						layout: "total, sizes, prev, pager, next",
						onChange: loadRows
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(_component_el_dialog, {
					modelValue: paymentVisible.value,
					"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => paymentVisible.value = $event),
					width: "520px",
					title: "登记收款",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[10] || (_cache[10] = ($event) => paymentVisible.value = false) }, {
						default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitPayment
					}, {
						default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("确认收款", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [current.value ? (openBlock(), createBlock(_component_el_descriptions, {
						key: 0,
						column: 1,
						border: "",
						style: { "margin-bottom": "18px" }
					}, {
						default: withCtx(() => [createVNode(_component_el_descriptions_item, { label: "客户" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.companyName), 1)]),
							_: 1
						}), createVNode(_component_el_descriptions_item, { label: "当前待收" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.outstandingAmount)), 1)]),
							_: 1
						})]),
						_: 1
					})) : createCommentVNode("", true), createVNode(_component_el_form, {
						model: paymentForm,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "本次收款",
								required: ""
							}, {
								default: withCtx(() => {
									var _current$value;
									return [createVNode(_component_el_input_number, {
										modelValue: paymentForm.amount,
										"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => paymentForm.amount = $event),
										min: .01,
										max: Number(((_current$value = current.value) === null || _current$value === void 0 ? void 0 : _current$value.outstandingAmount) || 0),
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
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => paymentForm.paymentTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DDTHH:mm:ss",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款方式" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: paymentForm.paymentMethod,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => paymentForm.paymentMethod = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "微信",
											value: "wechat"
										}),
										createVNode(_component_el_option, {
											label: "支付宝",
											value: "alipay"
										}),
										createVNode(_component_el_option, {
											label: "银行转账",
											value: "bank"
										}),
										createVNode(_component_el_option, {
											label: "现金",
											value: "cash"
										}),
										createVNode(_component_el_option, {
											label: "其他",
											value: "other"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款账户" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: paymentForm.accountNumber,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => paymentForm.accountNumber = $event),
									placeholder: "填写账户简称或尾号"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "收款凭证" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: paymentForm.voucher,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => paymentForm.voucher = $event),
									placeholder: "选择已有附件或填写演示说明"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: paymentForm.remarks,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => paymentForm.remarks = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: historyVisible.value,
					"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => historyVisible.value = $event),
					class: "feige-detail-drawer",
					size: "min(680px, 94vw)",
					title: "收款明细",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createVNode(_component_el_table, {
						data: payments.value,
						"empty-text": "暂无收款记录"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "时间",
								"min-width": "170"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.paymentTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "金额",
								width: "125"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_21, toDisplayString(unref(money)(row.amount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "paymentMethod",
								label: "方式",
								width: "100"
							}),
							createVNode(_component_el_table_column, {
								prop: "remarks",
								label: "备注",
								"min-width": "160",
								"show-overflow-tooltip": ""
							})
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
});
//#endregion
export { unreceived_default as default };

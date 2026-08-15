import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, H as ElDescriptions, Q as ElRadioGroup, U as ElDescriptionsItem, Un as search_default, V as ElDialog, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { a as formatDateTime, o as money, r as businessTypes, s as optionLabel, t as feigeOrderData } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
import { t as OrderDetailDrawer_default } from "./OrderDetailDrawer-Cbl_Rc56.js";
//#region src/views/feige-order-contract/new-order.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "feige-module feige-legacy-page" };
var _hoisted_2 = { class: "content-card" };
var _hoisted_3 = { class: "filter-bar" };
var _hoisted_4 = { class: "filter-actions" };
var _hoisted_5 = { class: "status-tabs" };
var _hoisted_6 = { class: "table-wrap" };
var _hoisted_7 = { class: "customer-name" };
var _hoisted_8 = { class: "money" };
var _hoisted_9 = { class: "sub-text" };
var _hoisted_10 = { class: "pagination-row" };
//#endregion
//#region src/views/feige-order-contract/new-order.vue
var new_order_default = /* @__PURE__ */ defineComponent({
	__name: "new-order",
	setup(__props) {
		const loading = ref(false);
		const submitting = ref(false);
		const rows = ref([]);
		const staff = ref([]);
		const current = ref(null);
		const detailVisible = ref(false);
		const auditVisible = ref(false);
		const filters = reactive({
			keyword: "",
			salesmanId: void 0,
			auditStatus: "pending"
		});
		const page = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		const auditForm = reactive({
			result: "approved",
			remark: ""
		});
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = yield feigeOrderData.auditOrders({
						pageNum: page.pageNum,
						pageSize: page.pageSize,
						keyword: filters.keyword || void 0,
						salesmanId: filters.salesmanId,
						auditStatus: filters.auditStatus || void 0
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
				auditStatus: "pending"
			});
			search();
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
		function openAudit(row) {
			current.value = row;
			Object.assign(auditForm, {
				result: "approved",
				remark: ""
			});
			auditVisible.value = true;
		}
		function submitAudit() {
			return _submitAudit.apply(this, arguments);
		}
		function _submitAudit() {
			_submitAudit = _asyncToGenerator(function* () {
				if (!current.value) return;
				if (auditForm.result === "rejected" && !auditForm.remark.trim()) return ElMessage.warning("驳回订单时请填写审核意见");
				submitting.value = true;
				try {
					yield feigeOrderData.auditOrder(current.value.id, auditForm);
					ElMessage.success(auditForm.result === "approved" ? "新单审核已通过" : "新单已驳回");
					auditVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitAudit.apply(this, arguments);
		}
		function auditLabel(value) {
			return {
				pending: "待审核",
				approved: "已通过",
				rejected: "已驳回"
			}[value || ""] || "待审核";
		}
		function auditType(value) {
			return value === "approved" ? "success" : value === "rejected" ? "danger" : "warning";
		}
		onMounted(_asyncToGenerator(function* () {
			staff.value = yield feigeOrderData.staffOptions();
			yield loadRows();
		}));
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createVNode(_component_el_alert, {
					title: "待财务审核用于核验新单收款，不是重复录单表单。审核通过后订单进入服务办理。",
					type: "info",
					closable: false,
					"show-icon": "",
					style: { "margin-bottom": "16px" }
				}),
				createBaseVNode("section", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [
						createVNode(_component_el_input, {
							modelValue: filters.keyword,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.keyword = $event),
							class: "filter-keyword",
							clearable: "",
							placeholder: "订单编号或公司名称",
							"prefix-icon": unref(search_default),
							onKeyup: withKeys(search, ["enter"])
						}, null, 8, ["modelValue", "prefix-icon"]),
						createVNode(_component_el_select, {
							modelValue: filters.salesmanId,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.salesmanId = $event),
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
						createVNode(_component_el_select, {
							modelValue: filters.auditStatus,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.auditStatus = $event),
							class: "filter-select",
							clearable: "",
							placeholder: "审核状态"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_option, {
									label: "待审核",
									value: "pending"
								}),
								createVNode(_component_el_option, {
									label: "已通过",
									value: "approved"
								}),
								createVNode(_component_el_option, {
									label: "已驳回",
									value: "rejected"
								})
							]),
							_: 1
						}, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_4, [
							createVNode(_component_el_button, {
								type: "primary",
								icon: unref(search_default),
								onClick: search
							}, {
								default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("查询", -1)])]),
								_: 1
							}, 8, ["icon"]),
							createVNode(_component_el_button, { onClick: reset }, {
								default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("重置", -1)])]),
								_: 1
							}),
							createVNode(_component_el_button, {
								icon: unref(refresh_default),
								onClick: loadRows
							}, {
								default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("刷新", -1)])]),
								_: 1
							}, 8, ["icon"])
						])
					]),
					createBaseVNode("div", _hoisted_5, [createVNode(_component_el_radio_group, {
						modelValue: filters.auditStatus,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => filters.auditStatus = $event),
						onChange: search
					}, {
						default: withCtx(() => [
							createVNode(_component_el_radio_button, { value: "pending" }, {
								default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("待审核", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "approved" }, {
								default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("已通过", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "rejected" }, {
								default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("已驳回", -1)])]),
								_: 1
							}),
							createVNode(_component_el_radio_button, { value: "" }, {
								default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("全部", -1)])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["modelValue"])]),
					createBaseVNode("div", _hoisted_6, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						"empty-text": "当前没有待审核新单"
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
								label: "公司名称",
								"min-width": "240",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_7, toDisplayString(row.companyName), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务人员",
								width: "130",
								prop: "salesmanName"
							}),
							createVNode(_component_el_table_column, {
								label: "业务类型",
								width: "145"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(businessTypes), row.businessType)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "订单金额",
								width: "140",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("strong", _hoisted_8, toDisplayString(unref(money)(row.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "审核状态",
								width: "120",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: auditType(row.auditStatus) }, {
									default: withCtx(() => [createTextVNode(toDisplayString(auditLabel(row.auditStatus)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "提交时间",
								width: "175"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.createTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "审核信息",
								"min-width": "190",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(row.auditorName || "-"), 1), createBaseVNode("div", _hoisted_9, toDisplayString(row.auditRemark || "暂无审核意见"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "160",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openDetail(row)
								}, {
									default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("详情", -1)])]),
									_: 1
								}, 8, ["onClick"]), row.auditStatus === "pending" ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "success",
									onClick: ($event) => openAudit(row)
								}, {
									default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("收银审核", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]])]),
					createBaseVNode("div", _hoisted_10, [createVNode(_component_el_pagination, {
						"current-page": page.pageNum,
						"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => page.pageNum = $event),
						"page-size": page.pageSize,
						"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => page.pageSize = $event),
						total: page.total,
						"page-sizes": [
							10,
							20,
							50
						],
						layout: "total, prev, pager, next, sizes",
						onChange: loadRows
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(OrderDetailDrawer_default, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => detailVisible.value = $event),
					order: current.value
				}, null, 8, ["modelValue", "order"]),
				createVNode(_component_el_dialog, {
					modelValue: auditVisible.value,
					"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => auditVisible.value = $event),
					width: "min(680px, 94vw)",
					title: "新单收银审核",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[9] || (_cache[9] = ($event) => auditVisible.value = false) }, {
						default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitAudit
					}, {
						default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("确认审核", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [current.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_descriptions, {
						column: 2,
						border: ""
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "订单编号" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(current.value.orderNo), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "业务人员" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(current.value.salesmanName), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, {
								label: "客户名称",
								span: 2
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(current.value.companyName), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "合同金额" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "实收金额" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.receivedAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "收款账户" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(current.value.collectionAccountNumber || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "收款时间" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(formatDateTime)(current.value.collectionTime)), 1)]),
								_: 1
							})
						]),
						_: 1
					}), createVNode(_component_el_form, {
						"label-position": "top",
						style: { "margin-top": "18px" }
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "审核结果",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_group, {
								modelValue: auditForm.result,
								"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => auditForm.result = $event)
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_button, { value: "approved" }, {
									default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("审核通过", -1)])]),
									_: 1
								}), createVNode(_component_el_radio_button, { value: "rejected" }, {
									default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("审核驳回", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "审核意见" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: auditForm.remark,
								"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => auditForm.remark = $event),
								type: "textarea",
								rows: 4,
								maxlength: "500",
								"show-word-limit": "",
								placeholder: "通过可填写核验说明；驳回请写清补充要求"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})], 64)) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
});
//#endregion
export { new_order_default as default };

import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, H as ElDescriptions, U as ElDescriptionsItem, Un as search_default, W as ElDatePicker, _ as ElTableColumn, a as ElMessageBox, b as ElSteps, g as ElTable, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, y as ElStep, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { a as formatDateTime, c as optionType, o as money, r as businessTypes, s as optionLabel, t as feigeOrderData, u as refundStatuses } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
//#region src/views/feige-order-contract/refunds.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "feige-module feige-legacy-page" };
var _hoisted_2 = { class: "content-card" };
var _hoisted_3 = { class: "filter-bar" };
var _hoisted_4 = { class: "filter-actions" };
var _hoisted_5 = { class: "table-wrap legacy-wide-table" };
var _hoisted_6 = { class: "customer-name" };
var _hoisted_7 = { class: "money debt" };
var _hoisted_8 = { class: "pagination-row" };
var _hoisted_9 = { class: "drawer-section" };
//#endregion
//#region src/views/feige-order-contract/refunds.vue
var refunds_default = /* @__PURE__ */ defineComponent({
	__name: "refunds",
	setup(__props) {
		const userStore = useUserStore();
		const roleSet = computed(() => new Set((userStore.roles || []).flatMap((role) => [role, role.split("__")[0]])));
		const canReview = computed(() => [
			"admin",
			"super_admin",
			"boss",
			"manager",
			"dept_manager",
			"finance",
			"finance_hq"
		].some((role) => roleSet.value.has(role)));
		const canComplete = computed(() => [
			"admin",
			"super_admin",
			"boss",
			"finance",
			"finance_hq"
		].some((role) => roleSet.value.has(role)));
		const loading = ref(false);
		const rows = ref([]);
		const current = ref(null);
		const detailVisible = ref(false);
		const filters = reactive({
			keyword: "",
			status: "",
			dates: []
		});
		const page = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const [data, orderData] = yield Promise.all([feigeOrderData.refunds({
						pageNum: page.pageNum,
						pageSize: page.pageSize,
						keyword: filters.keyword || void 0,
						status: filters.status || void 0,
						startDate: filters.dates[0],
						endDate: filters.dates[1]
					}), feigeOrderData.orders({
						pageNum: 1,
						pageSize: 1e3
					})]);
					const map = new Map(orderData.records.map((item) => [item.id, item]));
					rows.value = data.records.map((item) => {
						var _map$get, _map$get2;
						return _objectSpread2(_objectSpread2({}, item), {}, {
							teamName: (_map$get = map.get(item.orderId)) === null || _map$get === void 0 ? void 0 : _map$get.teamName,
							businessType: (_map$get2 = map.get(item.orderId)) === null || _map$get2 === void 0 ? void 0 : _map$get2.businessType
						});
					});
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
				status: "",
				dates: []
			});
			search();
		}
		function openDetail(row) {
			current.value = row;
			detailVisible.value = true;
		}
		function review(_x, _x2) {
			return _review.apply(this, arguments);
		}
		function _review() {
			_review = _asyncToGenerator(function* (row, action) {
				const label = action === "approve" ? "通过" : "驳回";
				const result = yield ElMessageBox.prompt(`确认${label}“${row.companyName}”的退费申请？`, `${label}退费`, {
					inputPlaceholder: action === "reject" ? "请填写驳回原因" : "审核意见（可选）",
					inputValidator: action === "reject" ? (value) => !!String(value || "").trim() || "请填写原因" : void 0,
					type: action === "approve" ? "warning" : "error"
				});
				if (action === "approve") yield feigeOrderData.approveRefund(row.id, result.value);
				else yield feigeOrderData.rejectRefund(row.id, result.value);
				ElMessage.success(`退费申请已${label}`);
				yield loadRows();
			});
			return _review.apply(this, arguments);
		}
		function finish(_x3) {
			return _finish.apply(this, arguments);
		}
		function _finish() {
			_finish = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认已向“${row.companyName}”退回 ${money(row.refundAmount)}？`, "确认完成退费", { type: "warning" });
				yield feigeOrderData.completeRefund(row.id, "财务确认已退款");
				ElMessage.success("退费已完成");
				yield loadRows();
			});
			return _finish.apply(this, arguments);
		}
		function refundStep(status) {
			return status === "completed" ? 3 : status === "approved" ? 2 : status === "rejected" ? 1 : 1;
		}
		onMounted(loadRows);
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("section", _hoisted_2, [
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
						modelValue: filters.status,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.status = $event),
						class: "filter-select",
						clearable: "",
						placeholder: "全部状态"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(refundStatuses), (item) => {
							return openBlock(), createBlock(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_date_picker, {
						modelValue: filters.dates,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.dates = $event),
						class: "filter-date",
						type: "daterange",
						"value-format": "YYYY-MM-DD",
						"start-placeholder": "申请开始",
						"end-placeholder": "申请结束"
					}, null, 8, ["modelValue"]),
					createBaseVNode("div", _hoisted_4, [
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(search_default),
							onClick: search
						}, {
							default: withCtx(() => [..._cache[6] || (_cache[6] = [createTextVNode("查询", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, { onClick: reset }, {
							default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("重置", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							icon: unref(refresh_default),
							onClick: loadRows
						}, {
							default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("刷新", -1)])]),
							_: 1
						}, 8, ["icon"])
					])
				]),
				createBaseVNode("div", _hoisted_5, [withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					"row-key": "id",
					"empty-text": "暂无退费订单"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "订单编号",
							width: "190",
							fixed: "left"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.orderNo), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "申请时间",
							width: "170"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.createTime)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "业务人员",
							width: "130",
							prop: "salesmanName"
						}),
						createVNode(_component_el_table_column, {
							label: "所属团队",
							width: "145"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.teamName || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "公司名称",
							"min-width": "230",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_6, toDisplayString(row.companyName), 1)]),
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
							label: "订单状态",
							width: "115",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, { type: unref(optionType)(unref(refundStatuses), row.status) }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(refundStatuses), row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "退费金额",
							width: "130",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("strong", _hoisted_7, toDisplayString(unref(money)(row.refundAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "退费原因",
							"min-width": "220",
							prop: "reason",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "操作记录",
							"min-width": "190",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.reviewComment || (row.status === "pending" ? "等待主管审核" : "-")), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "195",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openDetail(row)
								}, {
									default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("详情", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								row.status === "pending" && canReview.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "success",
									onClick: ($event) => review(row, "approve")
								}, {
									default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("审核", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								row.status === "approved" && canComplete.value ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									link: "",
									type: "success",
									onClick: ($event) => finish(row)
								}, {
									default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("确认退款", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								["pending", "approved"].includes(row.status) && canReview.value ? (openBlock(), createBlock(_component_el_button, {
									key: 2,
									link: "",
									type: "danger",
									onClick: ($event) => review(row, "reject")
								}, {
									default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("驳回", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)
							]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])]),
				createBaseVNode("div", _hoisted_8, [createVNode(_component_el_pagination, {
					"current-page": page.pageNum,
					"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => page.pageNum = $event),
					"page-size": page.pageSize,
					"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => page.pageSize = $event),
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
			]), createVNode(_component_el_drawer, {
				modelValue: detailVisible.value,
				"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => detailVisible.value = $event),
				class: "feige-detail-drawer",
				size: "min(720px, 94vw)",
				title: "退费详情",
				"destroy-on-close": ""
			}, {
				default: withCtx(() => [current.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_descriptions, {
					column: 2,
					border: ""
				}, {
					default: withCtx(() => [
						createVNode(_component_el_descriptions_item, { label: "订单编号" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.orderNo), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "申请时间" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(formatDateTime)(current.value.createTime)), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, {
							label: "客户名称",
							span: 2
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.companyName), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "业务人员" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.salesmanName), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "所属团队" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.teamName || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "退费金额" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(current.value.refundAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "当前状态" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(refundStatuses), current.value.status)), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, {
							label: "退费原因",
							span: 2
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.reason), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "审核人" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.reviewerName || "-"), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, { label: "审核时间" }, {
							default: withCtx(() => [createTextVNode(toDisplayString(unref(formatDateTime)(current.value.reviewTime)), 1)]),
							_: 1
						}),
						createVNode(_component_el_descriptions_item, {
							label: "审核意见",
							span: 2
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(current.value.reviewComment || "-"), 1)]),
							_: 1
						})
					]),
					_: 1
				}), createBaseVNode("div", _hoisted_9, [_cache[13] || (_cache[13] = createBaseVNode("h3", null, "退费流程", -1)), createVNode(_component_el_steps, {
					active: refundStep(current.value.status),
					"finish-status": "success"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_step, { title: "提交申请" }),
						createVNode(_component_el_step, { title: "主管审核" }),
						createVNode(_component_el_step, { title: "财务退款" })
					]),
					_: 1
				}, 8, ["active"])])], 64)) : createCommentVNode("", true)]),
				_: 1
			}, 8, ["modelValue"])]);
		};
	}
});
//#endregion
export { refunds_default as default };

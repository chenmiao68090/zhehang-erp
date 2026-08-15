import { $ as createCommentVNode, Dt as renderList, G as Fragment, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { F as ElEmpty, H as ElDescriptions, U as ElDescriptionsItem, _ as ElTableColumn, b as ElSteps, f as ElTimeline, g as ElTable, h as ElTabs, it as ElTag, m as ElTabPane, p as ElTimelineItem, y as ElStep, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { a as formatDateTime, c as optionType, l as orderStatuses, o as money, r as businessTypes, s as optionLabel } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
import { t as feigeOrderData } from "./data-source-Cb9cli9s.js";
//#region src/views/feige-order-contract/components/OrderDetailDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "detail-hero" };
var _hoisted_2 = { class: "detail-number" };
var _hoisted_3 = { class: "money strong" };
var _hoisted_4 = { class: "sub-text" };
//#endregion
//#region src/views/feige-order-contract/components/OrderDetailDrawer.vue
var OrderDetailDrawer_default = /* @__PURE__ */ defineComponent({
	__name: "OrderDetailDrawer",
	props: {
		modelValue: { type: Boolean },
		order: {}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const tab = ref("info");
		const payments = ref([]);
		const steps = ref([]);
		const logs = ref([]);
		const activeStep = computed(() => Math.max(0, steps.value.findIndex((item) => item.status === "processing")));
		watch([() => props.modelValue, () => {
			var _props$order;
			return (_props$order = props.order) === null || _props$order === void 0 ? void 0 : _props$order.id;
		}], function() {
			var _ref = _asyncToGenerator(function* ([visible, id]) {
				if (!visible || !id) return;
				tab.value = "info";
				[payments.value, steps.value, logs.value] = yield Promise.all([
					feigeOrderData.payments(id),
					feigeOrderData.steps(id),
					feigeOrderData.logs(id)
				]);
			});
			return function(_x) {
				return _ref.apply(this, arguments);
			};
		}());
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_empty = ElEmpty;
			const _component_el_tabs = ElTabs;
			const _component_el_drawer = ElDrawer;
			return openBlock(), createBlock(_component_el_drawer, {
				"model-value": __props.modelValue,
				class: "feige-detail-drawer",
				size: "min(920px, 96vw)",
				title: "订单详情",
				"destroy-on-close": "",
				onClose: _cache[1] || (_cache[1] = ($event) => emit("update:modelValue", false))
			}, {
				default: withCtx(() => [__props.order ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createBaseVNode("div", _hoisted_1, [createBaseVNode("div", null, [
					createBaseVNode("div", _hoisted_2, toDisplayString(__props.order.orderNo), 1),
					createBaseVNode("h2", null, toDisplayString(__props.order.companyName), 1),
					createBaseVNode("p", null, toDisplayString(__props.order.contacts || "未填联系人") + " · " + toDisplayString(__props.order.contactPhone || "未填电话"), 1)
				]), createVNode(_component_el_tag, {
					type: unref(optionType)(unref(orderStatuses), __props.order.status),
					size: "large"
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(orderStatuses), __props.order.status)), 1)]),
					_: 1
				}, 8, ["type"])]), createVNode(_component_el_tabs, {
					modelValue: tab.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => tab.value = $event)
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "订单信息",
							name: "info"
						}, {
							default: withCtx(() => [createVNode(_component_el_descriptions, {
								column: 2,
								border: ""
							}, {
								default: withCtx(() => [
									createVNode(_component_el_descriptions_item, { label: "下单时间" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.orderDate), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "业务类型" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(businessTypes), __props.order.businessType)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "业务人员" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.salesmanName), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "所属团队" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.teamName || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "客户来源" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.customerSource || __props.order.opportunitySource || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "来源说明" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.sourceDetail || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "订单金额" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(__props.order.orderAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "合同金额" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(__props.order.contractAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "实收金额" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(__props.order.receivedAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "待收金额" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(money)(__props.order.outstandingAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, {
										label: "联系地址",
										span: 2
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString([__props.order.region, __props.order.address].filter(Boolean).join(" ") || "-"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, {
										label: "备注",
										span: 2
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(__props.order.remarks || "-"), 1)]),
										_: 1
									})
								]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "办理流程",
							name: "flow"
						}, {
							default: withCtx(() => [createVNode(_component_el_steps, {
								direction: "vertical",
								active: activeStep.value,
								"finish-status": "success",
								"process-status": "process"
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(steps.value, (item) => {
									return openBlock(), createBlock(_component_el_step, {
										key: item.id,
										title: item.stepName,
										description: `${item.assigneeName || "待分配"}${item.completedTime ? ` · ${unref(formatDateTime)(item.completedTime)}` : ""}${item.remark ? ` · ${item.remark}` : ""}`
									}, null, 8, ["title", "description"]);
								}), 128))]),
								_: 1
							}, 8, ["active"])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: `费用详情 ${payments.value.length}`,
							name: "payment"
						}, {
							default: withCtx(() => [createVNode(_component_el_table, {
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
										default: withCtx(({ row }) => [createBaseVNode("strong", _hoisted_3, toDisplayString(unref(money)(row.amount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										prop: "paymentMethod",
										label: "方式",
										width: "120"
									}),
									createVNode(_component_el_table_column, {
										prop: "accountNumber",
										label: "账户",
										"min-width": "140"
									}),
									createVNode(_component_el_table_column, {
										prop: "remarks",
										label: "备注",
										"min-width": "180",
										"show-overflow-tooltip": ""
									})
								]),
								_: 1
							}, 8, ["data"])]),
							_: 1
						}, 8, ["label"]),
						createVNode(_component_el_tab_pane, {
							label: "操作记录",
							name: "logs"
						}, {
							default: withCtx(() => [logs.value.length ? (openBlock(), createBlock(_component_el_timeline, { key: 0 }, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(logs.value, (item) => {
									return openBlock(), createBlock(_component_el_timeline_item, {
										key: item.id,
										timestamp: unref(formatDateTime)(item.createTime)
									}, {
										default: withCtx(() => [createBaseVNode("strong", null, toDisplayString(item.operationDesc), 1), createBaseVNode("div", _hoisted_4, toDisplayString(item.operatorName || "系统") + toDisplayString(item.remarks ? ` · ${item.remarks}` : ""), 1)]),
										_: 2
									}, 1032, ["timestamp"]);
								}), 128))]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								"image-size": 80,
								description: "暂无操作记录"
							}))]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"])], 64)) : createCommentVNode("", true)]),
				_: 1
			}, 8, ["model-value"]);
		};
	}
});
//#endregion
export { OrderDetailDrawer_default as t };

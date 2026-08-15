import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, V as ElDialog, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yr as warning_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as supplyApi } from "./admin-CReSJXAx.js";
//#region src/views/admin/supply.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "adm-supply" };
var _hoisted_2 = { class: "as-bar" };
var _hoisted_3 = {
	key: 0,
	class: "as-low-tip"
};
var _hoisted_4 = { class: "as-unit" };
//#endregion
//#region src/views/admin/supply.vue
var supply_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "supply",
	setup(__props) {
		const CATEGORIES = [
			"通用办公耗材",
			"业务专用耗材",
			"劳保福利品"
		];
		const STATUSES = [
			"待验收",
			"已入库",
			"已驳回"
		];
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const todayStr = () => {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		};
		const statusType = (s) => s === "已入库" ? "success" : s === "已驳回" ? "danger" : "warning";
		const rows = ref([]);
		const loading = ref(false);
		const kw = ref("");
		const isLow = (r) => {
			var _r$safetyStock, _r$quantity, _r$safetyStock2;
			return ((_r$safetyStock = r.safetyStock) !== null && _r$safetyStock !== void 0 ? _r$safetyStock : 0) > 0 && ((_r$quantity = r.quantity) !== null && _r$quantity !== void 0 ? _r$quantity : 0) <= ((_r$safetyStock2 = r.safetyStock) !== null && _r$safetyStock2 !== void 0 ? _r$safetyStock2 : 0);
		};
		const lowCount = computed(() => rows.value.filter(isLow).length);
		const rowClass = ({ row }) => isLow(row) ? "as-low-row" : "";
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield supplyApi.list(kw.value || void 0);
					rows.value = ((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || [];
				} catch (_unused) {
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const dlg = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const openDlg = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				category: "通用办公耗材",
				unit: "个",
				quantity: 0,
				safetyStock: 0,
				amount: 0,
				inDate: todayStr(),
				status: "已入库"
			};
			dlg.value = {
				visible: true,
				saving: false
			};
		};
		const submit = function() {
			var _ref2 = _asyncToGenerator(function* () {
				if (!form.value.supplyName) {
					ElMessage.warning("请填写品名");
					return;
				}
				dlg.value.saving = true;
				try {
					yield supplyApi.save(form.value);
					ElMessage.success("已保存");
					dlg.value.visible = false;
					load();
				} catch (_unused2) {
					ElMessage.error("保存失败");
				} finally {
					dlg.value.saving = false;
				}
			});
			return function submit() {
				return _ref2.apply(this, arguments);
			};
		}();
		const remove = function() {
			var _ref3 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除办公用品「${row.supplyName}」?`, "删除", { type: "warning" });
				} catch (_unused3) {
					return;
				}
				try {
					yield supplyApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused4) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x) {
				return _ref3.apply(this, arguments);
			};
		}();
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[26] || (_cache[26] = createBaseVNode("header", { class: "as-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "as-title" }, "办公用品管理"), createBaseVNode("p", { class: "as-sub" }, "分类物料台账与入库采购:登记办公耗材/劳保福利品的库存、入库与采购审批关联;库存低于安全库存自动标红。")])], -1)),
				createBaseVNode("div", _hoisted_2, [
					createVNode(_component_el_input, {
						modelValue: kw.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => kw.value = $event),
						class: "as-search",
						placeholder: "搜品名/单号/分类/经办人…",
						clearable: "",
						onKeyup: withKeys(load, ["enter"]),
						onClear: load
					}, null, 8, ["modelValue"]),
					lowCount.value ? (openBlock(), createElementBlock("span", _hoisted_3, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(warning_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(lowCount.value) + " 项低于安全库存", 1)])) : createCommentVNode("", true),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[1] || (_cache[1] = ($event) => openDlg())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[19] || (_cache[19] = createTextVNode(" 新增入库", -1))]),
						_: 1
					})
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: "",
					"row-class-name": rowClass
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有办公用品台账,先登记一笔入库",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[2] || (_cache[2] = ($event) => openDlg())
						}, {
							default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("新增入库", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "品名",
							prop: "supplyName",
							"min-width": "140",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "分类",
							prop: "category",
							width: "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "规格",
							prop: "spec",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "库存",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => {
								var _row$quantity;
								return [
									createBaseVNode("span", { class: normalizeClass({ "as-low": isLow(row) }) }, toDisplayString((_row$quantity = row.quantity) !== null && _row$quantity !== void 0 ? _row$quantity : 0), 3),
									createBaseVNode("span", _hoisted_4, toDisplayString(row.unit || ""), 1),
									isLow(row) ? (openBlock(), createBlock(_component_el_tag, {
										key: 0,
										size: "small",
										type: "danger",
										effect: "plain",
										style: { "margin-left": "4px" }
									}, {
										default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("不足", -1)])]),
										_: 1
									})) : createCommentVNode("", true)
								];
							}),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "安全库存",
							prop: "safetyStock",
							width: "90",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "含税金额",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.amount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "入库时间",
							prop: "inDate",
							width: "108"
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "92"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: statusType(row.status)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.status || "—"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "经办人",
							prop: "operator",
							width: "86",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "150",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								size: "small",
								link: "",
								onClick: ($event) => openDlg(row)
							}, {
								default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("编辑", -1)])]),
								_: 1
							}, 8, ["onClick"]), createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "danger",
								onClick: ($event) => remove(row)
							}, {
								default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("删", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dlg.value.visible,
					"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => dlg.value.visible = $event),
					title: form.value.id ? "编辑办公用品" : "新增入库",
					width: "600px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[17] || (_cache[17] = ($event) => dlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: dlg.value.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-width": "100px"
					}, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 14 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "品名",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.supplyName,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.value.supplyName = $event),
											placeholder: "如:A4打印纸"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "入库单号" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.supplyNo,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.supplyNo = $event),
											placeholder: "留空自动按规则"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "分类" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.category,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.category = $event),
											placeholder: "选择分类",
											clearable: "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORIES, (opt) => {
												return createVNode(_component_el_option, {
													key: opt,
													label: opt,
													value: opt
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "规格" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.spec,
											"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.spec = $event),
											placeholder: "如:70g/500张"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "单位" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.unit,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.unit = $event),
											placeholder: "个/盒/包/件"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "当前库存" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.quantity,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.quantity = $event),
											min: 0,
											precision: 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "安全库存" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.safetyStock,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.safetyStock = $event),
											min: 0,
											precision: 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "含税总金额" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.amount,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.value.amount = $event),
											min: 0,
											precision: 2,
											controls: false,
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "入库时间" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.value.inDate,
											"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.inDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											placeholder: "选择日期",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "状态" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.status,
											"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.status = $event),
											placeholder: "选择状态",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUSES, (opt) => {
												return createVNode(_component_el_option, {
													key: opt,
													label: opt,
													value: opt
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "经办人" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.operator,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.operator = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "关联审批单" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.relatedApproval,
											"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.relatedApproval = $event),
											placeholder: "采购审批单号"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "附件" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.attach,
											"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.attach = $event),
											placeholder: "附件URL/说明"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.value.remark,
								"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.value.remark = $event),
								type: "textarea",
								rows: 2
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-5334e330"]]);
//#endregion
export { supply_default as default };

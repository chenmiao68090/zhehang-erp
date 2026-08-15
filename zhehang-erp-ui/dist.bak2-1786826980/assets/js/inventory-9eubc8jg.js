import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, D as ElPagination, Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, V as ElDialog, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, yr as warning_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as sealPurchaseApi, o as sealStockApi, s as stockCheckApi } from "./seal-ChbS7lCl.js";
//#region src/views/seal/inventory.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-inv" };
var _hoisted_2 = { class: "si-bar" };
var _hoisted_3 = {
	key: 0,
	class: "si-low-tip"
};
var _hoisted_4 = { class: "si-bar" };
var _hoisted_5 = { class: "si-pager" };
var _hoisted_6 = { class: "si-bar" };
//#endregion
//#region src/views/seal/inventory.vue
var inventory_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "inventory",
	setup(__props) {
		const tab = ref("stock");
		const SEAL_ITEM_CATEGORIES = [
			"公章/合同章 圆42",
			"财务章/个 抓把25*25",
			"法人章/个 方20*60",
			"发票章",
			"曝光膜/张",
			"硫酸纸/张",
			"鹰牌砂纸",
			"透明密封袋10丝|12*17cm",
			"印油/瓶 1000ml",
			"特殊章汇总",
			"其他消耗品(纸巾)"
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
		const stockRows = ref([]);
		const stockLoading = ref(false);
		const stockKw = ref("");
		const isLow = (r) => {
			var _r$safetyStock, _r$quantity, _r$safetyStock2;
			return ((_r$safetyStock = r.safetyStock) !== null && _r$safetyStock !== void 0 ? _r$safetyStock : 0) > 0 && ((_r$quantity = r.quantity) !== null && _r$quantity !== void 0 ? _r$quantity : 0) <= ((_r$safetyStock2 = r.safetyStock) !== null && _r$safetyStock2 !== void 0 ? _r$safetyStock2 : 0);
		};
		const lowCount = computed(() => stockRows.value.filter(isLow).length);
		const stockRowClass = ({ row }) => isLow(row) ? "si-low-row" : "";
		const loadStock = function() {
			var _ref = _asyncToGenerator(function* () {
				stockLoading.value = true;
				try {
					var _res$data;
					const res = yield sealStockApi.list(stockKw.value || void 0);
					stockRows.value = ((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || [];
				} catch (_unused) {
					stockRows.value = [];
				} finally {
					stockLoading.value = false;
				}
			});
			return function loadStock() {
				return _ref.apply(this, arguments);
			};
		}();
		const stockDlg = ref({
			visible: false,
			saving: false
		});
		const stockForm = ref({});
		const openStock = (row) => {
			stockForm.value = row ? _objectSpread2({}, row) : {
				unit: "个",
				quantity: 0,
				safetyStock: 0,
				unitPrice: 0,
				purchaseDate: "",
				buyQty: 0,
				buyPrice: 0,
				discount: 0,
				invoiceDone: 0,
				invoiceFile: "",
				purchaseLink: ""
			};
			stockDlg.value = {
				visible: true,
				saving: false
			};
		};
		const submitStock = function() {
			var _ref2 = _asyncToGenerator(function* () {
				if (!stockForm.value.itemName) {
					ElMessage.warning("请填写品名");
					return;
				}
				stockDlg.value.saving = true;
				try {
					if (stockForm.value.id) yield sealStockApi.update(stockForm.value);
					else yield sealStockApi.create(stockForm.value);
					ElMessage.success("已保存");
					stockDlg.value.visible = false;
					loadStock();
				} catch (_unused2) {
					ElMessage.error("保存失败");
				} finally {
					stockDlg.value.saving = false;
				}
			});
			return function submitStock() {
				return _ref2.apply(this, arguments);
			};
		}();
		const removeStock = function() {
			var _ref3 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除耗材「${row.itemName}」?`, "删除", { type: "warning" });
				} catch (_unused3) {
					return;
				}
				try {
					yield sealStockApi.remove(row.id);
					ElMessage.success("已删除");
					loadStock();
				} catch (_unused4) {
					ElMessage.error("删除失败");
				}
			});
			return function removeStock(_x) {
				return _ref3.apply(this, arguments);
			};
		}();
		const adjDlg = ref({
			visible: false,
			saving: false,
			sign: 1,
			qty: 1,
			reason: ""
		});
		const openAdjust = (row, sign) => {
			adjDlg.value = {
				visible: true,
				saving: false,
				row,
				sign,
				qty: 1,
				reason: ""
			};
		};
		const submitAdjust = function() {
			var _ref4 = _asyncToGenerator(function* () {
				adjDlg.value.saving = true;
				try {
					yield sealStockApi.adjust(adjDlg.value.row.id, adjDlg.value.sign * adjDlg.value.qty, adjDlg.value.reason);
					ElMessage.success("库存已更新");
					adjDlg.value.visible = false;
					loadStock();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "操作失败");
				} finally {
					adjDlg.value.saving = false;
				}
			});
			return function submitAdjust() {
				return _ref4.apply(this, arguments);
			};
		}();
		const logDlg = ref({
			visible: false,
			loading: false,
			itemName: "",
			rows: []
		});
		const openLogs = function() {
			var _ref6 = _asyncToGenerator(function* (row) {
				logDlg.value = {
					visible: true,
					loading: true,
					itemName: row.itemName || "",
					rows: []
				};
				try {
					var _ref5, _res$data2;
					const res = yield sealStockApi.logs(row.id);
					logDlg.value.rows = (_ref5 = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) !== null && _ref5 !== void 0 ? _ref5 : [];
				} catch (_unused5) {
					logDlg.value.rows = [];
				} finally {
					logDlg.value.loading = false;
				}
			});
			return function openLogs(_x2) {
				return _ref6.apply(this, arguments);
			};
		}();
		const purRows = ref([]);
		const purLoading = ref(false);
		const purTotal = ref(0);
		const purPage = ref(1);
		const purSize = ref(10);
		const purKw = ref("");
		const purStatus = ref();
		const loadPur = function() {
			var _ref7 = _asyncToGenerator(function* () {
				purLoading.value = true;
				try {
					var _res$data3, _page$total;
					const res = yield sealPurchaseApi.list({
						pageNum: purPage.value,
						pageSize: purSize.value,
						keyword: purKw.value || void 0,
						status: purStatus.value || void 0
					});
					const page = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					purRows.value = (page === null || page === void 0 ? void 0 : page.records) || [];
					purTotal.value = Number((_page$total = page === null || page === void 0 ? void 0 : page.total) !== null && _page$total !== void 0 ? _page$total : purRows.value.length);
				} catch (_unused6) {
					purRows.value = [];
				} finally {
					purLoading.value = false;
				}
			});
			return function loadPur() {
				return _ref7.apply(this, arguments);
			};
		}();
		const reloadPur = () => {
			purPage.value = 1;
			loadPur();
		};
		const purDlg = ref({
			visible: false,
			saving: false
		});
		const purForm = ref({});
		const openPur = (row) => {
			purForm.value = row ? _objectSpread2({}, row) : {
				purchaseDate: todayStr(),
				quantity: 0,
				unitPrice: 0,
				status: "ordered"
			};
			purDlg.value = {
				visible: true,
				saving: false
			};
		};
		const submitPur = function() {
			var _ref8 = _asyncToGenerator(function* () {
				if (!purForm.value.itemName) {
					ElMessage.warning("请填写品名");
					return;
				}
				purDlg.value.saving = true;
				try {
					if (purForm.value.id) yield sealPurchaseApi.update(purForm.value);
					else yield sealPurchaseApi.create(purForm.value);
					ElMessage.success("已保存");
					purDlg.value.visible = false;
					loadPur();
				} catch (_unused7) {
					ElMessage.error("保存失败");
				} finally {
					purDlg.value.saving = false;
				}
			});
			return function submitPur() {
				return _ref8.apply(this, arguments);
			};
		}();
		const arrive = function() {
			var _ref9 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认「${row.itemName}」已到货,把 ${row.quantity} 加入库存?`, "到货入库", { type: "info" });
				} catch (_unused8) {
					return;
				}
				try {
					yield sealPurchaseApi.arrive(row.id);
					ElMessage.success("已入库");
					loadPur();
					loadStock();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "入库失败");
				}
			});
			return function arrive(_x3) {
				return _ref9.apply(this, arguments);
			};
		}();
		const removePur = function() {
			var _ref10 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除采购记录「${row.itemName}」?`, "删除", { type: "warning" });
				} catch (_unused9) {
					return;
				}
				try {
					yield sealPurchaseApi.remove(row.id);
					ElMessage.success("已删除");
					loadPur();
				} catch (_unused10) {
					ElMessage.error("删除失败");
				}
			});
			return function removePur(_x4) {
				return _ref10.apply(this, arguments);
			};
		}();
		const checkRows = ref([]);
		const checkLoading = ref(false);
		const diffClass = (d) => (d !== null && d !== void 0 ? d : 0) === 0 ? "si-muted" : (d !== null && d !== void 0 ? d : 0) > 0 ? "si-diff-up" : "si-low";
		const loadCheck = function() {
			var _ref11 = _asyncToGenerator(function* () {
				checkLoading.value = true;
				try {
					var _res$data4;
					const res = yield stockCheckApi.list();
					checkRows.value = ((_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) || [];
				} catch (_unused11) {
					checkRows.value = [];
				} finally {
					checkLoading.value = false;
				}
			});
			return function loadCheck() {
				return _ref11.apply(this, arguments);
			};
		}();
		const checkDlg = ref({
			visible: false,
			saving: false
		});
		const checkForm = ref({});
		const checkDiff = computed(() => {
			var _checkForm$value$actu, _checkForm$value$book;
			return ((_checkForm$value$actu = checkForm.value.actualQty) !== null && _checkForm$value$actu !== void 0 ? _checkForm$value$actu : 0) - ((_checkForm$value$book = checkForm.value.bookQty) !== null && _checkForm$value$book !== void 0 ? _checkForm$value$book : 0);
		});
		const openCheck = (row) => {
			checkForm.value = row ? _objectSpread2({}, row) : {
				checkDate: todayStr(),
				bookQty: 0,
				actualQty: 0
			};
			checkDlg.value = {
				visible: true,
				saving: false
			};
		};
		const submitCheck = function() {
			var _ref12 = _asyncToGenerator(function* () {
				if (!checkForm.value.itemName) {
					ElMessage.warning("请填写品名");
					return;
				}
				checkDlg.value.saving = true;
				try {
					yield stockCheckApi.save(_objectSpread2(_objectSpread2({}, checkForm.value), {}, { diff: checkDiff.value }));
					ElMessage.success("已保存");
					checkDlg.value.visible = false;
					loadCheck();
				} catch (_unused12) {
					ElMessage.error("保存失败");
				} finally {
					checkDlg.value.saving = false;
				}
			});
			return function submitCheck() {
				return _ref12.apply(this, arguments);
			};
		}();
		const removeCheck = function() {
			var _ref13 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除盘点记录「${row.itemName}」?`, "删除", { type: "warning" });
				} catch (_unused13) {
					return;
				}
				try {
					yield stockCheckApi.remove(row.id);
					ElMessage.success("已删除");
					loadCheck();
				} catch (_unused14) {
					ElMessage.error("删除失败");
				}
			});
			return function removeCheck(_x5) {
				return _ref13.apply(this, arguments);
			};
		}();
		onMounted(() => {
			loadStock();
			loadPur();
			loadCheck();
		});
		return (_ctx, _cache) => {
			var _adjDlg$value$row;
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_pagination = ElPagination;
			const _component_el_tabs = ElTabs;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_input_number = ElInputNumber;
			const _component_el_row = ElRow;
			const _component_el_divider = ElDivider;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[80] || (_cache[80] = createBaseVNode("header", { class: "si-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "si-title" }, "印章库存与采购"), createBaseVNode("p", { class: "si-sub" }, "刻章部门的章料/印油/章盒等耗材库存,以及采购记录;采购到货可一键入库。")])], -1)),
				createVNode(_component_el_tabs, {
					modelValue: tab.value,
					"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => tab.value = $event),
					class: "si-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "库存",
							name: "stock"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_2, [
								createVNode(_component_el_input, {
									modelValue: stockKw.value,
									"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => stockKw.value = $event),
									class: "si-search",
									placeholder: "搜品名…",
									clearable: "",
									onKeyup: withKeys(loadStock, ["enter"]),
									onClear: loadStock
								}, null, 8, ["modelValue"]),
								lowCount.value ? (openBlock(), createElementBlock("span", _hoisted_3, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(warning_default))]),
									_: 1
								}), createTextVNode(" " + toDisplayString(lowCount.value) + " 项低于安全库存", 1)])) : createCommentVNode("", true),
								createVNode(_component_el_button, {
									type: "primary",
									onClick: _cache[1] || (_cache[1] = ($event) => openStock())
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(plus_default))]),
										_: 1
									}), _cache[52] || (_cache[52] = createTextVNode(" 新增耗材", -1))]),
									_: 1
								})
							]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: stockRows.value,
								border: "",
								stripe: "",
								"row-class-name": stockRowClass
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "还没有耗材,先把常用章料/印油录进来",
									"image-size": 80
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[2] || (_cache[2] = ($event) => openStock())
									}, {
										default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("新增耗材", -1)])]),
										_: 1
									})]),
									_: 1
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "品名",
										prop: "itemName",
										"min-width": "140",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "规格",
										prop: "spec",
										width: "110"
									}),
									createVNode(_component_el_table_column, {
										label: "单位",
										prop: "unit",
										width: "64"
									}),
									createVNode(_component_el_table_column, {
										label: "当前库存",
										width: "110",
										align: "right"
									}, {
										default: withCtx(({ row }) => {
											var _row$quantity;
											return [createBaseVNode("span", { class: normalizeClass({ "si-low": isLow(row) }) }, toDisplayString((_row$quantity = row.quantity) !== null && _row$quantity !== void 0 ? _row$quantity : 0), 3), isLow(row) ? (openBlock(), createBlock(_component_el_tag, {
												key: 0,
												size: "small",
												type: "danger",
												effect: "plain",
												style: { "margin-left": "4px" }
											}, {
												default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("不足", -1)])]),
												_: 1
											})) : createCommentVNode("", true)];
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
										label: "参考单价",
										width: "96",
										align: "right"
									}, {
										default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.unitPrice)), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "常用供应商",
										prop: "supplier",
										"min-width": "120",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "260",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [
											createVNode(_component_el_button, {
												size: "small",
												type: "success",
												plain: "",
												onClick: ($event) => openAdjust(row, 1)
											}, {
												default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("入库", -1)])]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												type: "warning",
												plain: "",
												onClick: ($event) => openAdjust(row, -1)
											}, {
												default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("出库", -1)])]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												onClick: ($event) => openLogs(row)
											}, {
												default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("记录", -1)])]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												onClick: ($event) => openStock(row)
											}, {
												default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("编辑", -1)])]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												type: "danger",
												onClick: ($event) => removeStock(row)
											}, {
												default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("删", -1)])]),
												_: 1
											}, 8, ["onClick"])
										]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, stockLoading.value]])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "采购记录",
							name: "purchase"
						}, {
							default: withCtx(() => [
								createBaseVNode("div", _hoisted_4, [
									createVNode(_component_el_input, {
										modelValue: purKw.value,
										"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => purKw.value = $event),
										class: "si-search",
										placeholder: "搜品名…",
										clearable: "",
										onKeyup: withKeys(reloadPur, ["enter"]),
										onClear: reloadPur
									}, null, 8, ["modelValue"]),
									createVNode(_component_el_select, {
										modelValue: purStatus.value,
										"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => purStatus.value = $event),
										placeholder: "状态",
										clearable: "",
										class: "si-filter",
										onChange: reloadPur
									}, {
										default: withCtx(() => [createVNode(_component_el_option, {
											label: "已下单",
											value: "ordered"
										}), createVNode(_component_el_option, {
											label: "已到货",
											value: "arrived"
										})]),
										_: 1
									}, 8, ["modelValue"]),
									createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[5] || (_cache[5] = ($event) => openPur())
									}, {
										default: withCtx(() => [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(plus_default))]),
											_: 1
										}), _cache[60] || (_cache[60] = createTextVNode(" 新增采购", -1))]),
										_: 1
									})
								]),
								withDirectives((openBlock(), createBlock(_component_el_table, {
									data: purRows.value,
									border: "",
									stripe: ""
								}, {
									empty: withCtx(() => [createVNode(_component_el_empty, {
										description: "还没有采购记录",
										"image-size": 80
									}, {
										default: withCtx(() => [createVNode(_component_el_button, {
											type: "primary",
											onClick: _cache[6] || (_cache[6] = ($event) => openPur())
										}, {
											default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("新增采购", -1)])]),
											_: 1
										})]),
										_: 1
									})]),
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "采购日期",
											prop: "purchaseDate",
											width: "108"
										}),
										createVNode(_component_el_table_column, {
											label: "品名",
											prop: "itemName",
											"min-width": "130",
											"show-overflow-tooltip": ""
										}),
										createVNode(_component_el_table_column, {
											label: "规格",
											prop: "spec",
											width: "100"
										}),
										createVNode(_component_el_table_column, {
											label: "数量",
											prop: "quantity",
											width: "72",
											align: "right"
										}),
										createVNode(_component_el_table_column, {
											label: "单价",
											width: "90",
											align: "right"
										}, {
											default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.unitPrice)), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "金额",
											width: "100",
											align: "right"
										}, {
											default: withCtx(({ row }) => {
												var _row$amount;
												return [createTextVNode("¥" + toDisplayString(fmtMoney((_row$amount = row.amount) !== null && _row$amount !== void 0 ? _row$amount : (row.unitPrice || 0) * (row.quantity || 0))), 1)];
											}),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "供应商",
											prop: "supplier",
											"min-width": "110",
											"show-overflow-tooltip": ""
										}),
										createVNode(_component_el_table_column, {
											label: "采购人",
											prop: "operator",
											width: "86"
										}),
										createVNode(_component_el_table_column, {
											label: "状态",
											width: "84"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, {
												size: "small",
												type: row.status === "arrived" ? "success" : "info"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.status === "arrived" ? "已到货" : "已下单"), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "操作",
											width: "180",
											fixed: "right"
										}, {
											default: withCtx(({ row }) => [
												row.status !== "arrived" ? (openBlock(), createBlock(_component_el_button, {
													key: 0,
													size: "small",
													type: "primary",
													onClick: ($event) => arrive(row)
												}, {
													default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("到货入库", -1)])]),
													_: 1
												}, 8, ["onClick"])) : createCommentVNode("", true),
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													onClick: ($event) => openPur(row)
												}, {
													default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("编辑", -1)])]),
													_: 1
												}, 8, ["onClick"]),
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													type: "danger",
													onClick: ($event) => removePur(row)
												}, {
													default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("删", -1)])]),
													_: 1
												}, 8, ["onClick"])
											]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])), [[_directive_loading, purLoading.value]]),
								createBaseVNode("div", _hoisted_5, [createVNode(_component_el_pagination, {
									"current-page": purPage.value,
									"onUpdate:currentPage": _cache[7] || (_cache[7] = ($event) => purPage.value = $event),
									"page-size": purSize.value,
									"onUpdate:pageSize": _cache[8] || (_cache[8] = ($event) => purSize.value = $event),
									total: purTotal.value,
									"page-sizes": [
										10,
										20,
										50
									],
									layout: "total, sizes, prev, pager, next",
									onCurrentChange: loadPur,
									onSizeChange: reloadPur
								}, null, 8, [
									"current-page",
									"page-size",
									"total"
								])])
							]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "盘点记录",
							name: "check"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_6, [createVNode(_component_el_button, {
								type: "primary",
								onClick: _cache[9] || (_cache[9] = ($event) => openCheck())
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[65] || (_cache[65] = createTextVNode(" 新增盘点", -1))]),
								_: 1
							})]), withDirectives((openBlock(), createBlock(_component_el_table, {
								data: checkRows.value,
								border: "",
								stripe: ""
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "还没有盘点记录",
									"image-size": 80
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										type: "primary",
										onClick: _cache[10] || (_cache[10] = ($event) => openCheck())
									}, {
										default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("新增盘点", -1)])]),
										_: 1
									})]),
									_: 1
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "盘点日期",
										prop: "checkDate",
										width: "120"
									}),
									createVNode(_component_el_table_column, {
										label: "品名",
										prop: "itemName",
										"min-width": "160",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "账面库存",
										prop: "bookQty",
										width: "100",
										align: "right"
									}),
									createVNode(_component_el_table_column, {
										label: "实际盘点",
										prop: "actualQty",
										width: "100",
										align: "right"
									}),
									createVNode(_component_el_table_column, {
										label: "差异",
										width: "100",
										align: "right"
									}, {
										default: withCtx(({ row }) => {
											var _row$diff, _row$diff2;
											return [createBaseVNode("span", { class: normalizeClass(diffClass(row.diff)) }, toDisplayString(((_row$diff = row.diff) !== null && _row$diff !== void 0 ? _row$diff : 0) > 0 ? "+" + row.diff : (_row$diff2 = row.diff) !== null && _row$diff2 !== void 0 ? _row$diff2 : 0), 3)];
										}),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "盘点人",
										prop: "operator",
										width: "100"
									}),
									createVNode(_component_el_table_column, {
										label: "备注",
										prop: "remark",
										"min-width": "140",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "120",
										fixed: "right"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_button, {
											size: "small",
											link: "",
											onClick: ($event) => openCheck(row)
										}, {
											default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("编辑", -1)])]),
											_: 1
										}, 8, ["onClick"]), createVNode(_component_el_button, {
											size: "small",
											link: "",
											type: "danger",
											onClick: ($event) => removeCheck(row)
										}, {
											default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode("删", -1)])]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, checkLoading.value]])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: stockDlg.value.visible,
					"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => stockDlg.value.visible = $event),
					title: stockForm.value.id ? "编辑耗材" : "新增耗材",
					width: "540px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[27] || (_cache[27] = ($event) => stockDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: stockDlg.value.saving,
						onClick: submitStock
					}, {
						default: withCtx(() => [..._cache[71] || (_cache[71] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: stockForm.value,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "品名",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: stockForm.value.itemName,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => stockForm.value.itemName = $event),
												filterable: "",
												"allow-create": "",
												"default-first-option": "",
												placeholder: "选择或输入品名",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SEAL_ITEM_CATEGORIES, (opt) => {
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
												modelValue: stockForm.value.spec,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => stockForm.value.spec = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "单位" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: stockForm.value.unit,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => stockForm.value.unit = $event),
												placeholder: "个/盒/瓶"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "当前库存" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: stockForm.value.quantity,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => stockForm.value.quantity = $event),
												min: 0,
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
												modelValue: stockForm.value.safetyStock,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => stockForm.value.safetyStock = $event),
												min: 0,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "参考单价" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: stockForm.value.unitPrice,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => stockForm.value.unitPrice = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("采购信息", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "采购日期" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: stockForm.value.purchaseDate,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => stockForm.value.purchaseDate = $event),
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "购买数量" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: stockForm.value.buyQty,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => stockForm.value.buyQty = $event),
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "购入价" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: stockForm.value.buyPrice,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => stockForm.value.buyPrice = $event),
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "优惠总计" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: stockForm.value.discount,
												"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => stockForm.value.discount = $event),
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "发票开具" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: stockForm.value.invoiceDone,
												"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => stockForm.value.invoiceDone = $event),
												"active-value": 1,
												"inactive-value": 0,
												"active-text": "已开",
												"inactive-text": "未开"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "发票附件" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: stockForm.value.invoiceFile,
												"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => stockForm.value.invoiceFile = $event),
												placeholder: "附件URL/说明"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "采购链接" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: stockForm.value.purchaseLink,
												"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => stockForm.value.purchaseLink = $event),
												placeholder: "淘宝/京东链接"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "常用供应商" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: stockForm.value.supplier,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => stockForm.value.supplier = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: stockForm.value.remark,
									"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => stockForm.value.remark = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: adjDlg.value.visible,
					"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => adjDlg.value.visible = $event),
					title: (adjDlg.value.sign > 0 ? "入库" : "出库") + " · " + (((_adjDlg$value$row = adjDlg.value.row) === null || _adjDlg$value$row === void 0 ? void 0 : _adjDlg$value$row.itemName) || ""),
					width: "420px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[31] || (_cache[31] = ($event) => adjDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[72] || (_cache[72] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: adjDlg.value.saving,
						onClick: submitAdjust
					}, {
						default: withCtx(() => [..._cache[73] || (_cache[73] = [createTextVNode("确认", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-width": "72px" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "当前库存" }, {
								default: withCtx(() => {
									var _adjDlg$value$row$qua, _adjDlg$value$row2, _adjDlg$value$row3;
									return [createTextVNode(toDisplayString((_adjDlg$value$row$qua = (_adjDlg$value$row2 = adjDlg.value.row) === null || _adjDlg$value$row2 === void 0 ? void 0 : _adjDlg$value$row2.quantity) !== null && _adjDlg$value$row$qua !== void 0 ? _adjDlg$value$row$qua : 0) + " " + toDisplayString(((_adjDlg$value$row3 = adjDlg.value.row) === null || _adjDlg$value$row3 === void 0 ? void 0 : _adjDlg$value$row3.unit) || ""), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: adjDlg.value.sign > 0 ? "入库数量" : "出库数量" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: adjDlg.value.qty,
									"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => adjDlg.value.qty = $event),
									min: 1,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_form_item, { label: "变更后" }, {
								default: withCtx(() => {
									var _adjDlg$value$row$qua2, _adjDlg$value$row4;
									return [createTextVNode(toDisplayString(((_adjDlg$value$row$qua2 = (_adjDlg$value$row4 = adjDlg.value.row) === null || _adjDlg$value$row4 === void 0 ? void 0 : _adjDlg$value$row4.quantity) !== null && _adjDlg$value$row$qua2 !== void 0 ? _adjDlg$value$row$qua2 : 0) + adjDlg.value.sign * adjDlg.value.qty), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "事由" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: adjDlg.value.reason,
									"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => adjDlg.value.reason = $event),
									placeholder: "可选,如:领用刻章/盘点修正"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: logDlg.value.visible,
					"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => logDlg.value.visible = $event),
					title: "调整记录 · " + (logDlg.value.itemName || ""),
					width: "640px",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: logDlg.value.rows,
						size: "small",
						border: "",
						"max-height": "420"
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "还没有调整记录",
							"image-size": 60
						})]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "时间",
								width: "160"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString((row.createTime || "").replace("T", " ").slice(0, 16)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "变动",
								width: "100"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.delta >= 0 ? "success" : "warning",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.delta >= 0 ? "入库+" + row.delta : "出库" + row.delta), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "前→后",
								width: "100"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.beforeQty) + " → " + toDisplayString(row.afterQty), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "事由",
								prop: "reason",
								"min-width": "160",
								"show-overflow-tooltip": ""
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, logDlg.value.loading]])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: purDlg.value.visible,
					"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => purDlg.value.visible = $event),
					title: purForm.value.id ? "编辑采购" : "新增采购",
					width: "560px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[42] || (_cache[42] = ($event) => purDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: purDlg.value.saving,
						onClick: submitPur
					}, {
						default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: purForm.value,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "品名",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: purForm.value.itemName,
												"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => purForm.value.itemName = $event),
												placeholder: "与库存品名一致可自动入库"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "规格" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: purForm.value.spec,
												"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => purForm.value.spec = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "数量" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: purForm.value.quantity,
												"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => purForm.value.quantity = $event),
												min: 0,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "单价" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: purForm.value.unitPrice,
												"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => purForm.value.unitPrice = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "供应商" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: purForm.value.supplier,
												"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => purForm.value.supplier = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "采购人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: purForm.value.operator,
												"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => purForm.value.operator = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "采购日期" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: purForm.value.purchaseDate,
												"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => purForm.value.purchaseDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "金额" }, {
								default: withCtx(() => [createTextVNode("¥" + toDisplayString(fmtMoney((purForm.value.unitPrice || 0) * (purForm.value.quantity || 0))) + " ", 1), _cache[74] || (_cache[74] = createBaseVNode("span", { class: "si-muted" }, "(数量×单价,自动计算)", -1))]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: purForm.value.remark,
									"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => purForm.value.remark = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: checkDlg.value.visible,
					"onUpdate:modelValue": _cache[51] || (_cache[51] = ($event) => checkDlg.value.visible = $event),
					title: checkForm.value.id ? "编辑盘点" : "新增盘点",
					width: "520px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[50] || (_cache[50] = ($event) => checkDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: checkDlg.value.saving,
						onClick: submitCheck
					}, {
						default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: checkForm.value,
						"label-width": "92px"
					}, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 14 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "品名",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: checkForm.value.itemName,
											"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => checkForm.value.itemName = $event),
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											placeholder: "选择或输入品名",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SEAL_ITEM_CATEGORIES, (opt) => {
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "盘点日期" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: checkForm.value.checkDate,
											"onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => checkForm.value.checkDate = $event),
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "账面库存" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: checkForm.value.bookQty,
											"onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => checkForm.value.bookQty = $event),
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "实际盘点" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: checkForm.value.actualQty,
											"onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => checkForm.value.actualQty = $event),
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "差异" }, {
										default: withCtx(() => [createBaseVNode("span", { class: normalizeClass(diffClass(checkDiff.value)) }, toDisplayString(checkDiff.value > 0 ? "+" + checkDiff.value : checkDiff.value), 3), _cache[77] || (_cache[77] = createBaseVNode("span", { class: "si-muted" }, "(实际-账面,自动计算)", -1))]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "盘点人" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: checkForm.value.operator,
											"onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => checkForm.value.operator = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: checkForm.value.remark,
								"onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => checkForm.value.remark = $event),
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
}), [["__scopeId", "data-v-ead87cfb"]]);
//#endregion
export { inventory_default as default };

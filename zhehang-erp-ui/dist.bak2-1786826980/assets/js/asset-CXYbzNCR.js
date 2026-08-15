import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, Un as search_default, V as ElDialog, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, f as ElTimeline, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, rt as ElSelect, s as vLoading, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { t as assetApi } from "./admin-CReSJXAx.js";
//#region src/views/admin/asset.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "asset-mgr" };
var _hoisted_2 = { class: "am-bar" };
var _hoisted_3 = { class: "am-bar-right" };
var _hoisted_4 = { class: "am-asset-name" };
var _hoisted_5 = { class: "am-asset-name" };
var _hoisted_6 = { class: "am-rec" };
var _hoisted_7 = {
	key: 0,
	class: "am-rec-emp"
};
var _hoisted_8 = {
	key: 1,
	class: "am-rec-status"
};
var _hoisted_9 = {
	key: 0,
	class: "am-rec-amount"
};
var _hoisted_10 = {
	key: 1,
	class: "am-rec-remark"
};
var _hoisted_11 = { class: "am-rec-operator" };
var _hoisted_12 = { class: "am-offboard-bar" };
var _hoisted_13 = {
	key: 0,
	class: "am-offboard-hint"
};
//#endregion
//#region src/views/admin/asset.vue
var asset_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "asset",
	setup(__props) {
		const CATEGORIES = [
			"办公设备",
			"电子设备",
			"税控专用设备",
			"家具",
			"其他"
		];
		const STATUSES = [
			"待验收",
			"已入库",
			"在用",
			"闲置",
			"领用中",
			"已归还",
			"维修中",
			"已报废",
			"报废",
			"已驳回"
		];
		const USE_TYPES = ["永久领用", "临时领用"];
		const MAINTAIN_TYPES = ["故障维修", "定期保养"];
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const todayStr = () => {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		};
		const statusTag = (s) => {
			switch (s) {
				case "已入库":
				case "闲置": return "success";
				case "在用":
				case "领用中": return "primary";
				case "维修中": return "warning";
				case "已报废":
				case "报废":
				case "已驳回": return "danger";
				case "待验收":
				case "已归还": return "info";
				default: return "info";
			}
		};
		const isScrapped = (row) => row.status === "报废" || row.status === "已报废";
		const rows = ref([]);
		const loading = ref(false);
		const kw = ref("");
		const filterStatus = ref();
		const filterCategory = ref();
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield assetApi.list({
						keyword: kw.value || void 0,
						status: filterStatus.value || void 0,
						category: filterCategory.value || void 0
					});
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
		const reload = () => load();
		const employees = ref([]);
		const empLoading = ref(false);
		const empLabel = (e) => `${e.name || ""}${e.deptName ? " · " + e.deptName : ""}${e.empCode ? " (" + e.empCode + ")" : ""}`;
		const loadEmployees = function() {
			var _ref2 = _asyncToGenerator(function* () {
				if (employees.value.length) return;
				empLoading.value = true;
				try {
					var _res$data2;
					const res = yield employeeApi.options();
					const rows = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					employees.value = Array.isArray(rows) ? rows : [];
				} catch (_unused2) {
					employees.value = [];
				} finally {
					empLoading.value = false;
				}
			});
			return function loadEmployees() {
				return _ref2.apply(this, arguments);
			};
		}();
		const dlg = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const openDlg = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				category: "办公设备",
				status: "待验收",
				quantity: 1,
				amount: 0,
				inDate: todayStr()
			};
			dlg.value = {
				visible: true,
				saving: false
			};
		};
		const submit = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!form.value.assetNo) {
					ElMessage.warning("请填写资产编号");
					return;
				}
				if (!form.value.assetName) {
					ElMessage.warning("请填写资产名称");
					return;
				}
				dlg.value.saving = true;
				try {
					yield assetApi.save(form.value);
					ElMessage.success("已保存");
					dlg.value.visible = false;
					load();
				} catch (_unused3) {
					ElMessage.error("保存失败");
				} finally {
					dlg.value.saving = false;
				}
			});
			return function submit() {
				return _ref3.apply(this, arguments);
			};
		}();
		const remove = function() {
			var _ref4 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除资产「${row.assetName || row.assetNo}」?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield assetApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x) {
				return _ref4.apply(this, arguments);
			};
		}();
		const claimDlg = ref({
			visible: false,
			saving: false
		});
		const claimForm = ref({});
		const openClaim = (row) => {
			claimDlg.value = {
				visible: true,
				saving: false,
				asset: row
			};
			claimForm.value = { recordDate: todayStr() };
			loadEmployees();
		};
		const onEmpChange = (id) => {
			const e = employees.value.find((x) => x.id === id);
			claimForm.value.employeeName = e === null || e === void 0 ? void 0 : e.name;
		};
		const submitClaim = function() {
			var _ref5 = _asyncToGenerator(function* () {
				if (!claimForm.value.employeeId) {
					ElMessage.warning("请选择领用人");
					return;
				}
				claimDlg.value.saving = true;
				try {
					yield assetApi.claim(claimDlg.value.asset.id, {
						employeeId: claimForm.value.employeeId,
						employeeName: claimForm.value.employeeName,
						recordDate: claimForm.value.recordDate,
						remark: claimForm.value.remark
					});
					ElMessage.success("领用成功");
					claimDlg.value.visible = false;
					load();
				} catch (_unused6) {
					ElMessage.error("领用失败");
				} finally {
					claimDlg.value.saving = false;
				}
			});
			return function submitClaim() {
				return _ref5.apply(this, arguments);
			};
		}();
		const doReturn = function() {
			var _ref6 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认归还资产「${row.assetName || row.assetNo}」(当前领用人:${row.holder || "—"})?`, "归还", { type: "warning" });
				} catch (_unused7) {
					return;
				}
				try {
					yield assetApi.return(row.id, { recordDate: todayStr() });
					ElMessage.success("已归还");
					load();
				} catch (_unused8) {
					ElMessage.error("归还失败");
				}
			});
			return function doReturn(_x2) {
				return _ref6.apply(this, arguments);
			};
		}();
		const maintainDlg = ref({
			visible: false,
			saving: false
		});
		const maintainForm = ref({});
		const openMaintain = (row) => {
			maintainDlg.value = {
				visible: true,
				saving: false,
				asset: row
			};
			maintainForm.value = {
				recordDate: todayStr(),
				status: "维修中"
			};
		};
		const submitMaintain = function() {
			var _ref7 = _asyncToGenerator(function* () {
				maintainDlg.value.saving = true;
				try {
					yield assetApi.maintain(maintainDlg.value.asset.id, {
						recordDate: maintainForm.value.recordDate,
						amount: maintainForm.value.amount,
						status: maintainForm.value.status,
						remark: maintainForm.value.remark
					});
					ElMessage.success("维保记录已登记");
					maintainDlg.value.visible = false;
					load();
				} catch (_unused9) {
					ElMessage.error("维保登记失败");
				} finally {
					maintainDlg.value.saving = false;
				}
			});
			return function submitMaintain() {
				return _ref7.apply(this, arguments);
			};
		}();
		const doScrap = function() {
			var _ref8 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认报废资产「${row.assetName || row.assetNo}」?报废后不可领用。`, "报废", { type: "warning" });
				} catch (_unused10) {
					return;
				}
				try {
					yield assetApi.scrap(row.id, { recordDate: todayStr() });
					ElMessage.success("已报废");
					load();
				} catch (_unused11) {
					ElMessage.error("报废失败");
				}
			});
			return function doScrap(_x3) {
				return _ref8.apply(this, arguments);
			};
		}();
		const recDrawer = ref({
			visible: false,
			loading: false
		});
		const records = ref([]);
		const recTagType = (t) => {
			switch (t) {
				case "入库": return "success";
				case "领用": return "primary";
				case "归还": return "info";
				case "维保": return "warning";
				case "报废": return "danger";
				default: return "info";
			}
		};
		const openRecords = function() {
			var _ref9 = _asyncToGenerator(function* (row) {
				recDrawer.value = {
					visible: true,
					loading: true,
					asset: row
				};
				records.value = [];
				try {
					var _res$data3;
					const res = yield assetApi.records(row.id);
					records.value = ((_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res) || [];
				} catch (_unused12) {
					records.value = [];
				} finally {
					recDrawer.value.loading = false;
				}
			});
			return function openRecords(_x4) {
				return _ref9.apply(this, arguments);
			};
		}();
		const offboardDlg = ref({
			visible: false,
			loading: false
		});
		const offboardRows = ref([]);
		const openOffboard = () => {
			offboardDlg.value = {
				visible: true,
				loading: false,
				employeeId: void 0
			};
			offboardRows.value = [];
			loadEmployees();
		};
		const checkOffboard = function() {
			var _ref10 = _asyncToGenerator(function* (id) {
				if (!id) {
					offboardRows.value = [];
					return;
				}
				offboardDlg.value.loading = true;
				try {
					var _res$data4;
					const res = yield assetApi.unreturned(id);
					offboardRows.value = ((_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) || [];
				} catch (_unused13) {
					offboardRows.value = [];
				} finally {
					offboardDlg.value.loading = false;
				}
			});
			return function checkOffboard(_x5) {
				return _ref10.apply(this, arguments);
			};
		}();
		const returnInOffboard = function() {
			var _ref11 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认归还资产「${row.assetName || row.assetNo}」?`, "归还", { type: "warning" });
				} catch (_unused14) {
					return;
				}
				try {
					yield assetApi.return(row.id, { recordDate: todayStr() });
					ElMessage.success("已归还");
					if (offboardDlg.value.employeeId) checkOffboard(offboardDlg.value.employeeId);
					load();
				} catch (_unused15) {
					ElMessage.error("归还失败");
				}
			});
			return function returnInOffboard(_x6) {
				return _ref11.apply(this, arguments);
			};
		}();
		onMounted(() => load());
		return (_ctx, _cache) => {
			var _recDrawer$value$asse;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_divider = ElDivider;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[62] || (_cache[62] = createBaseVNode("header", { class: "am-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "am-title" }, "固定资产管理"), createBaseVNode("p", { class: "am-sub" }, "固定资产全生命周期台账:采购入库 → 领用分配 → 维保维修 → 报废,统一编号登记与状态流转。")])], -1)),
				createBaseVNode("div", _hoisted_2, [
					createVNode(_component_el_input, {
						modelValue: kw.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => kw.value = $event),
						class: "am-search",
						placeholder: "搜单号/名称/领用人…",
						clearable: "",
						onKeyup: withKeys(reload, ["enter"]),
						onClear: reload
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: filterCategory.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filterCategory.value = $event),
						placeholder: "分类",
						clearable: "",
						class: "am-filter",
						onChange: reload
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORIES, (c) => {
							return createVNode(_component_el_option, {
								key: c,
								label: c,
								value: c
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: filterStatus.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filterStatus.value = $event),
						placeholder: "状态",
						clearable: "",
						class: "am-filter",
						onChange: reload
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUSES, (s) => {
							return createVNode(_component_el_option, {
								key: s,
								label: s,
								value: s
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, { onClick: openOffboard }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						}), _cache[39] || (_cache[39] = createTextVNode(" 离职归还校验", -1))]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[3] || (_cache[3] = ($event) => openDlg())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[40] || (_cache[40] = createTextVNode(" 新增资产", -1))]),
						_: 1
					})])
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有固定资产记录,先把办公设备/电子设备等登记入账",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[4] || (_cache[4] = ($event) => openDlg())
						}, {
							default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("新增资产", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "资产编号",
							prop: "assetNo",
							"min-width": "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "资产名称",
							prop: "assetName",
							"min-width": "140",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "分类",
							prop: "category",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							label: "数量",
							prop: "quantity",
							width: "72",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "总金额",
							width: "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.amount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "96"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: statusTag(row.status),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.status || "—"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "领用人",
							prop: "holder",
							width: "100",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "所属部门",
							prop: "holderDept",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "入库时间",
							prop: "inDate",
							width: "110"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "320",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									disabled: isScrapped(row),
									onClick: ($event) => openClaim(row)
								}, {
									default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("领用", -1)])]),
									_: 1
								}, 8, ["disabled", "onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "success",
									disabled: !row.holderId,
									onClick: ($event) => doReturn(row)
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("归还", -1)])]),
									_: 1
								}, 8, ["disabled", "onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "warning",
									disabled: isScrapped(row),
									onClick: ($event) => openMaintain(row)
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("维保", -1)])]),
									_: 1
								}, 8, ["disabled", "onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									disabled: isScrapped(row),
									onClick: ($event) => doScrap(row)
								}, {
									default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("报废", -1)])]),
									_: 1
								}, 8, ["disabled", "onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									onClick: ($event) => openRecords(row)
								}, {
									default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("流水", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									onClick: ($event) => openDlg(row)
								}, {
									default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("删", -1)])]),
									_: 1
								}, 8, ["onClick"])
							]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dlg.value.visible,
					"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => dlg.value.visible = $event),
					title: form.value.id ? "编辑资产" : "新增资产",
					width: "680px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[23] || (_cache[23] = ($event) => dlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: dlg.value.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-width": "100px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("采购入库", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "资产编号",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.assetNo,
												"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.assetNo = $event),
												placeholder: "入库单号/资产编号"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "资产名称",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.assetName,
												"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.assetName = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "资产分类" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.category,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.category = $event),
												placeholder: "选择分类",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORIES, (c) => {
													return createVNode(_component_el_option, {
														key: c,
														label: c,
														value: c
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "状态" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.status,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.status = $event),
												placeholder: "选择状态",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUSES, (s) => {
													return createVNode(_component_el_option, {
														key: s,
														label: s,
														value: s
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "数量" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.quantity,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.quantity = $event),
												min: 0,
												precision: 0,
												controls: false,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "总金额" }, {
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "经办人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.operator,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.operator = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "关联审批单" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.relatedApproval,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.relatedApproval = $event),
												placeholder: "关联采购审批单号"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("领用分配", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "领用人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.holder,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.holder = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属部门" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.holderDept,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.holderDept = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "领用日期" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.value.useDate,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.value.useDate = $event),
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
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "领用类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.useType,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.value.useType = $event),
												placeholder: "选择领用类型",
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(USE_TYPES, (t) => {
													return createVNode(_component_el_option, {
														key: t,
														label: t,
														value: t
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("维保维修", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "维保类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.maintainType,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.value.maintainType = $event),
												placeholder: "选择维保类型",
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(MAINTAIN_TYPES, (t) => {
													return createVNode(_component_el_option, {
														key: t,
														label: t,
														value: t
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "维修费用" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.maintainFee,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.value.maintainFee = $event),
												min: 0,
												precision: 2,
												controls: false,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "故障描述" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.faultDesc,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.value.faultDesc = $event),
												type: "textarea",
												rows: 2,
												placeholder: "故障/保养情况说明"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("其他", -1)])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "附件" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.attach,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => form.value.attach = $event),
									placeholder: "附件URL/说明"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.value.remark,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => form.value.remark = $event),
									type: "textarea",
									rows: 2
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: claimDlg.value.visible,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => claimDlg.value.visible = $event),
					title: "资产领用",
					width: "480px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => claimDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: claimDlg.value.saving,
						onClick: submitClaim
					}, {
						default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("确认领用", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: claimForm.value,
						"label-width": "90px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "资产" }, {
								default: withCtx(() => {
									var _claimDlg$value$asset, _claimDlg$value$asset2;
									return [createBaseVNode("span", _hoisted_4, toDisplayString((_claimDlg$value$asset = claimDlg.value.asset) === null || _claimDlg$value$asset === void 0 ? void 0 : _claimDlg$value$asset.assetName) + "(" + toDisplayString((_claimDlg$value$asset2 = claimDlg.value.asset) === null || _claimDlg$value$asset2 === void 0 ? void 0 : _claimDlg$value$asset2.assetNo) + ")", 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "领用人",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: claimForm.value.employeeId,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => claimForm.value.employeeId = $event),
									filterable: "",
									placeholder: "选择领用员工",
									style: { "width": "100%" },
									loading: empLoading.value,
									onChange: onEmpChange
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(employees.value, (e) => {
										return openBlock(), createBlock(_component_el_option, {
											key: e.id,
											label: empLabel(e),
											value: e.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue", "loading"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "领用日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: claimForm.value.recordDate,
									"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => claimForm.value.recordDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									placeholder: "选择日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: claimForm.value.remark,
									"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => claimForm.value.remark = $event),
									type: "textarea",
									rows: 2
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: maintainDlg.value.visible,
					"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => maintainDlg.value.visible = $event),
					title: "资产维保",
					width: "480px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[34] || (_cache[34] = ($event) => maintainDlg.value.visible = false) }, {
						default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: maintainDlg.value.saving,
						onClick: submitMaintain
					}, {
						default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("确认维保", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: maintainForm.value,
						"label-width": "90px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "资产" }, {
								default: withCtx(() => {
									var _maintainDlg$value$as, _maintainDlg$value$as2;
									return [createBaseVNode("span", _hoisted_5, toDisplayString((_maintainDlg$value$as = maintainDlg.value.asset) === null || _maintainDlg$value$as === void 0 ? void 0 : _maintainDlg$value$as.assetName) + "(" + toDisplayString((_maintainDlg$value$as2 = maintainDlg.value.asset) === null || _maintainDlg$value$as2 === void 0 ? void 0 : _maintainDlg$value$as2.assetNo) + ")", 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "维保日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: maintainForm.value.recordDate,
									"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => maintainForm.value.recordDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									placeholder: "选择日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "维修费用" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: maintainForm.value.amount,
									"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => maintainForm.value.amount = $event),
									min: 0,
									precision: 2,
									controls: false,
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "动作后状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: maintainForm.value.status,
									"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => maintainForm.value.status = $event),
									placeholder: "维保后资产状态(可选)",
									clearable: "",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUSES, (s) => {
										return createVNode(_component_el_option, {
											key: s,
											label: s,
											value: s
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: maintainForm.value.remark,
									"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => maintainForm.value.remark = $event),
									type: "textarea",
									rows: 2,
									placeholder: "故障/保养情况说明"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: recDrawer.value.visible,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => recDrawer.value.visible = $event),
					title: `流水 · ${((_recDrawer$value$asse = recDrawer.value.asset) === null || _recDrawer$value$asse === void 0 ? void 0 : _recDrawer$value$asse.assetName) || ""}`,
					size: "420px"
				}, {
					default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", null, [records.value.length ? (openBlock(), createBlock(_component_el_timeline, { key: 0 }, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(records.value, (r) => {
							return openBlock(), createBlock(_component_el_timeline_item, {
								key: r.id,
								type: recTagType(r.type),
								timestamp: r.recordDate || (r.createTime || "").slice(0, 10),
								placement: "top"
							}, {
								default: withCtx(() => [
									createBaseVNode("div", _hoisted_6, [
										createVNode(_component_el_tag, {
											size: "small",
											type: recTagType(r.type),
											effect: "dark"
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(r.type), 1)]),
											_: 2
										}, 1032, ["type"]),
										r.employeeName ? (openBlock(), createElementBlock("span", _hoisted_7, toDisplayString(r.employeeName), 1)) : createCommentVNode("", true),
										r.status ? (openBlock(), createElementBlock("span", _hoisted_8, "→ " + toDisplayString(r.status), 1)) : createCommentVNode("", true)
									]),
									r.amount ? (openBlock(), createElementBlock("div", _hoisted_9, "费用:¥" + toDisplayString(fmtMoney(r.amount)), 1)) : createCommentVNode("", true),
									r.remark ? (openBlock(), createElementBlock("div", _hoisted_10, toDisplayString(r.remark), 1)) : createCommentVNode("", true),
									createBaseVNode("div", _hoisted_11, "经办:" + toDisplayString(r.operator || "—"), 1)
								]),
								_: 2
							}, 1032, ["type", "timestamp"]);
						}), 128))]),
						_: 1
					})) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "暂无流水记录",
						"image-size": 70
					}))])), [[_directive_loading, recDrawer.value.loading]])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: offboardDlg.value.visible,
					"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => offboardDlg.value.visible = $event),
					title: "离职归还校验",
					width: "640px",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_12, [createVNode(_component_el_select, {
						modelValue: offboardDlg.value.employeeId,
						"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => offboardDlg.value.employeeId = $event),
						filterable: "",
						placeholder: "选择待离职员工",
						style: { "width": "280px" },
						loading: empLoading.value,
						onChange: checkOffboard
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(employees.value, (e) => {
							return openBlock(), createBlock(_component_el_option, {
								key: e.id,
								label: empLabel(e),
								value: e.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue", "loading"]), offboardDlg.value.employeeId ? (openBlock(), createElementBlock("span", _hoisted_13, [
						_cache[59] || (_cache[59] = createTextVNode(" 名下未归还资产 ", -1)),
						createBaseVNode("b", null, toDisplayString(offboardRows.value.length), 1),
						_cache[60] || (_cache[60] = createTextVNode(" 件 ", -1))
					])) : createCommentVNode("", true)]), withDirectives((openBlock(), createBlock(_component_el_table, {
						data: offboardRows.value,
						border: "",
						stripe: "",
						"max-height": "360",
						style: { "margin-top": "12px" }
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: offboardDlg.value.employeeId ? "该员工名下无未归还资产,可放行离职" : "请选择员工",
							"image-size": 70
						}, null, 8, ["description"])]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "资产编号",
								prop: "assetNo",
								"min-width": "120",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "资产名称",
								prop: "assetName",
								"min-width": "130",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "90"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									size: "small",
									type: statusTag(row.status),
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.status || "—"), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "90",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "success",
									onClick: ($event) => returnInOffboard(row)
								}, {
									default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("归还", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, offboardDlg.value.loading]])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-b51bcaf0"]]);
//#endregion
export { asset_default as default };

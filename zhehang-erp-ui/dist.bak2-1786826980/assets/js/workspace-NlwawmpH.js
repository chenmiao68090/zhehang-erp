import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kt as resolveComponent, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, Er as withKeys, F as ElEmpty, M as ElInputNumber, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
//#region src/api/finance.ts
var bookkeepingLedgerApi = {
	list: (params) => get("/finance/bookkeeping-ledger/list", params),
	statusCount: (params) => get("/finance/bookkeeping-ledger/status-count", params),
	colleagues: () => get("/finance/bookkeeping-ledger/colleagues"),
	detail: (id) => get(`/finance/bookkeeping-ledger/${id}`),
	add: (data) => post("/finance/bookkeeping-ledger", data),
	update: (data) => put("/finance/bookkeeping-ledger", data),
	remove: (id) => del(`/finance/bookkeeping-ledger/${id}`)
};
//#endregion
//#region src/views/accounting/workspace.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "acc-workspace" };
var _hoisted_2 = { class: "acc-stats" };
var _hoisted_3 = { class: "acc-stat acc-stat--total" };
var _hoisted_4 = { class: "acc-stat-num" };
var _hoisted_5 = { class: "acc-stat acc-stat--todo" };
var _hoisted_6 = { class: "acc-stat-num" };
var _hoisted_7 = { class: "acc-stat acc-stat--doing" };
var _hoisted_8 = { class: "acc-stat-num" };
var _hoisted_9 = { class: "acc-stat acc-stat--done" };
var _hoisted_10 = { class: "acc-stat-num" };
var _hoisted_11 = { class: "acc-stat acc-stat--tax" };
var _hoisted_12 = { class: "acc-stat-num" };
var _hoisted_13 = { class: "acc-section" };
var _hoisted_14 = { class: "acc-section-head" };
var _hoisted_15 = { class: "acc-toolbar" };
var _hoisted_16 = {
	key: 0,
	class: "acc-pager"
};
//#endregion
//#region src/views/accounting/workspace.vue
var workspace_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "workspace",
	setup(__props) {
		const BK_OPTIONS = [
			{
				label: "待记账",
				value: 0
			},
			{
				label: "记账中",
				value: 1
			},
			{
				label: "已完成",
				value: 2
			}
		];
		const TAX_OPTIONS = [
			{
				label: "待申报",
				value: 0
			},
			{
				label: "已申报",
				value: 1
			},
			{
				label: "无需申报",
				value: 2
			}
		];
		function bkLabel(v) {
			var _BK_OPTIONS$find$labe, _BK_OPTIONS$find;
			return (_BK_OPTIONS$find$labe = (_BK_OPTIONS$find = BK_OPTIONS.find((o) => o.value === v)) === null || _BK_OPTIONS$find === void 0 ? void 0 : _BK_OPTIONS$find.label) !== null && _BK_OPTIONS$find$labe !== void 0 ? _BK_OPTIONS$find$labe : "—";
		}
		function bkType(v) {
			return v === 2 ? "success" : v === 1 ? "warning" : "info";
		}
		function taxLabel(v) {
			var _TAX_OPTIONS$find$lab, _TAX_OPTIONS$find;
			return (_TAX_OPTIONS$find$lab = (_TAX_OPTIONS$find = TAX_OPTIONS.find((o) => o.value === v)) === null || _TAX_OPTIONS$find === void 0 ? void 0 : _TAX_OPTIONS$find.label) !== null && _TAX_OPTIONS$find$lab !== void 0 ? _TAX_OPTIONS$find$lab : "—";
		}
		function taxType(v) {
			return v === 1 ? "success" : v === 2 ? "" : "info";
		}
		function fmtMoney(val) {
			return Number(val !== null && val !== void 0 ? val : 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}
		const loading = ref(false);
		const rows = ref([]);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(10);
		const keyword = ref("");
		const periodFilter = ref("");
		const bkStatusFilter = ref("");
		const taxStatusFilter = ref("");
		const counts = reactive({});
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield bookkeepingLedgerApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value || void 0,
						period: periodFilter.value || void 0,
						bookkeepingStatus: bkStatusFilter.value === "" ? void 0 : bkStatusFilter.value,
						taxFilingStatus: taxStatusFilter.value === "" ? void 0 : taxStatusFilter.value
					});
					const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (data === null || data === void 0 ? void 0 : data.records) || [];
					total.value = (data === null || data === void 0 ? void 0 : data.total) || 0;
				} catch (e) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return _loadList.apply(this, arguments);
		}
		function loadCounts() {
			return _loadCounts.apply(this, arguments);
		}
		function _loadCounts() {
			_loadCounts = _asyncToGenerator(function* () {
				try {
					var _ref, _res$data2;
					const res = yield bookkeepingLedgerApi.statusCount({
						keyword: keyword.value || void 0,
						period: periodFilter.value || void 0
					});
					const data = (_ref = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) !== null && _ref !== void 0 ? _ref : {};
					Object.keys(data).forEach((k) => {
						var _data$k;
						counts[k] = Number((_data$k = data[k]) !== null && _data$k !== void 0 ? _data$k : 0);
					});
				} catch (e) {}
			});
			return _loadCounts.apply(this, arguments);
		}
		function reload() {
			pageNum.value = 1;
			loadList();
			loadCounts();
		}
		function onPage(p) {
			pageNum.value = p;
			loadList();
		}
		const colleagues = ref([]);
		function loadColleagues() {
			return _loadColleagues.apply(this, arguments);
		}
		function _loadColleagues() {
			_loadColleagues = _asyncToGenerator(function* () {
				try {
					var _ref2, _res$data3;
					const res = yield bookkeepingLedgerApi.colleagues();
					colleagues.value = (_ref2 = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res) !== null && _ref2 !== void 0 ? _ref2 : [];
				} catch (e) {
					colleagues.value = [];
				}
			});
			return _loadColleagues.apply(this, arguments);
		}
		const dialogVisible = ref(false);
		const saving = ref(false);
		const formRef = ref();
		const form = reactive({
			id: null,
			clientName: "",
			clientId: null,
			period: "",
			bookkeepingStatus: 0,
			taxFilingStatus: 0,
			accountantId: null,
			accountantName: "",
			amount: void 0,
			remark: ""
		});
		const rules = {
			clientName: [{
				required: true,
				message: "请输入客户名",
				trigger: "blur"
			}],
			period: [{
				required: true,
				message: "请选择账期",
				trigger: "change"
			}]
		};
		function resetForm() {
			form.id = null;
			form.clientName = "";
			form.clientId = null;
			form.period = "";
			form.bookkeepingStatus = 0;
			form.taxFilingStatus = 0;
			form.accountantId = null;
			form.accountantName = "";
			form.amount = void 0;
			form.remark = "";
		}
		function openForm(row) {
			resetForm();
			if (row) {
				var _row$clientId, _row$bookkeepingStatu, _row$taxFilingStatus, _row$accountantId, _row$accountantName, _row$amount, _row$remark;
				Object.assign(form, {
					id: row.id,
					clientName: row.clientName,
					clientId: (_row$clientId = row.clientId) !== null && _row$clientId !== void 0 ? _row$clientId : null,
					period: row.period,
					bookkeepingStatus: (_row$bookkeepingStatu = row.bookkeepingStatus) !== null && _row$bookkeepingStatu !== void 0 ? _row$bookkeepingStatu : 0,
					taxFilingStatus: (_row$taxFilingStatus = row.taxFilingStatus) !== null && _row$taxFilingStatus !== void 0 ? _row$taxFilingStatus : 0,
					accountantId: (_row$accountantId = row.accountantId) !== null && _row$accountantId !== void 0 ? _row$accountantId : null,
					accountantName: (_row$accountantName = row.accountantName) !== null && _row$accountantName !== void 0 ? _row$accountantName : "",
					amount: (_row$amount = row.amount) !== null && _row$amount !== void 0 ? _row$amount : void 0,
					remark: (_row$remark = row.remark) !== null && _row$remark !== void 0 ? _row$remark : ""
				});
			}
			dialogVisible.value = true;
		}
		function onAccountantChange(userId) {
			const c = colleagues.value.find((it) => it.userId === userId);
			form.accountantName = c ? c.name : "";
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				if (!formRef.value) return;
				yield formRef.value.validate(function() {
					var _ref3 = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						saving.value = true;
						try {
							const payload = _objectSpread2({}, form);
							if (payload.amount === void 0 || payload.amount === null || payload.amount === "") payload.amount = null;
							if (form.id) yield bookkeepingLedgerApi.update(payload);
							else {
								delete payload.id;
								yield bookkeepingLedgerApi.add(payload);
							}
							ElMessage.success("保存成功");
							dialogVisible.value = false;
							loadList();
							loadCounts();
						} catch (e) {} finally {
							saving.value = false;
						}
					});
					return function(_x) {
						return _ref3.apply(this, arguments);
					};
				}());
			});
			return _submit.apply(this, arguments);
		}
		function remove(_x2) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认删除「${row.clientName}」${row.period} 的台账记录？`, "提示", { type: "warning" }).then(_asyncToGenerator(function* () {
					yield bookkeepingLedgerApi.remove(row.id);
					ElMessage.success("已删除");
					loadList();
					loadCounts();
				})).catch(() => {});
			});
			return _remove.apply(this, arguments);
		}
		onMounted(() => {
			loadList();
			loadCounts();
			loadColleagues();
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_Plus = resolveComponent("Plus");
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[25] || (_cache[25] = createBaseVNode("header", { class: "acc-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "acc-title" }, "会计体系 · 代理记账工作台"), createBaseVNode("p", { class: "acc-sub" }, "代理记账业务线：给客户做账/报税的进度台账与记账工具入口（区别于公司自己的财务中心）。")])], -1)),
				createBaseVNode("div", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("span", _hoisted_4, toDisplayString(counts.total || 0), 1), _cache[14] || (_cache[14] = createBaseVNode("span", { class: "acc-stat-label" }, "代账客户数", -1))]),
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(counts.bkTodo || 0), 1), _cache[15] || (_cache[15] = createBaseVNode("span", { class: "acc-stat-label" }, "待记账", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(counts.bkDoing || 0), 1), _cache[16] || (_cache[16] = createBaseVNode("span", { class: "acc-stat-label" }, "记账中", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, toDisplayString(counts.bkDone || 0), 1), _cache[17] || (_cache[17] = createBaseVNode("span", { class: "acc-stat-label" }, "已完成", -1))]),
					createBaseVNode("div", _hoisted_11, [createBaseVNode("span", _hoisted_12, toDisplayString(counts.taxTodo || 0), 1), _cache[18] || (_cache[18] = createBaseVNode("span", { class: "acc-stat-label" }, "待申报", -1))])
				]),
				createBaseVNode("section", _hoisted_13, [
					createBaseVNode("div", _hoisted_14, [_cache[20] || (_cache[20] = createBaseVNode("h3", { class: "acc-section-title" }, "代账客户台账", -1)), createBaseVNode("div", _hoisted_15, [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
							class: "acc-search",
							placeholder: "搜客户名/会计…",
							clearable: "",
							onKeyup: withKeys(reload, ["enter"]),
							onClear: reload
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_date_picker, {
							modelValue: periodFilter.value,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => periodFilter.value = $event),
							type: "month",
							"value-format": "YYYY-MM",
							placeholder: "账期(月)",
							class: "acc-period",
							clearable: "",
							onChange: reload
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: bkStatusFilter.value,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => bkStatusFilter.value = $event),
							placeholder: "记账状态",
							clearable: "",
							class: "acc-filter",
							onChange: reload
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(BK_OPTIONS, (s) => {
								return createVNode(_component_el_option, {
									key: s.value,
									label: s.label,
									value: s.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: taxStatusFilter.value,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => taxStatusFilter.value = $event),
							placeholder: "报税状态",
							clearable: "",
							class: "acc-filter",
							onChange: reload
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(TAX_OPTIONS, (s) => {
								return createVNode(_component_el_option, {
									key: s.value,
									label: s.label,
									value: s.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[4] || (_cache[4] = ($event) => openForm())
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(_component_Plus)]),
								_: 1
							}), _cache[19] || (_cache[19] = createTextVNode(" 新增", -1))]),
							_: 1
						})
					])]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						border: "",
						stripe: ""
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, { description: "暂无代账客户，点右上角「新增」建立台账" })]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "客户名",
								prop: "clientName",
								"min-width": "180",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "账期",
								prop: "period",
								width: "100",
								align: "center"
							}),
							createVNode(_component_el_table_column, {
								label: "记账状态",
								width: "110",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									size: "small",
									type: bkType(row.bookkeepingStatus)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(bkLabel(row.bookkeepingStatus)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "报税状态",
								width: "110",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									size: "small",
									type: taxType(row.taxFilingStatus)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(taxLabel(row.taxFilingStatus)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "负责会计",
								prop: "accountantName",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.accountantName || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "本期费用",
								width: "110",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.amount != null ? "¥" + fmtMoney(row.amount) : "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "备注",
								prop: "remark",
								"min-width": "140",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "140",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => openForm(row)
								}, {
									default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					total.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_16, [createVNode(_component_el_pagination, {
						layout: "total, prev, pager, next",
						total: total.value,
						"current-page": pageNum.value,
						"page-size": pageSize.value,
						onCurrentChange: onPage
					}, null, 8, [
						"total",
						"current-page",
						"page-size"
					])])) : createCommentVNode("", true)
				]),
				createVNode(_component_el_dialog, {
					modelValue: dialogVisible.value,
					"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => dialogVisible.value = $event),
					title: form.id ? "编辑代账台账" : "新增代账台账",
					width: "520px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[12] || (_cache[12] = ($event) => dialogVisible.value = false) }, {
						default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: saving.value,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form,
						"label-width": "88px",
						rules,
						ref_key: "formRef",
						ref: formRef
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "客户名",
								prop: "clientName"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.clientName,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.clientName = $event),
									placeholder: "代账客户公司名"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "账期",
								prop: "period"
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: form.period,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.period = $event),
									type: "month",
									"value-format": "YYYY-MM",
									placeholder: "选择账期月份",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "记账状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.bookkeepingStatus,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.bookkeepingStatus = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(BK_OPTIONS, (s) => {
										return createVNode(_component_el_option, {
											key: s.value,
											label: s.label,
											value: s.value
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "报税状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.taxFilingStatus,
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.taxFilingStatus = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(TAX_OPTIONS, (s) => {
										return createVNode(_component_el_option, {
											key: s.value,
											label: s.label,
											value: s.value
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "负责会计" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: form.accountantId,
									"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.accountantId = $event),
									placeholder: "选择会计",
									clearable: "",
									filterable: "",
									style: { "width": "100%" },
									onChange: onAccountantChange
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
										return openBlock(), createBlock(_component_el_option, {
											key: c.userId,
											label: c.deptName ? c.name + "（" + c.deptName + "）" : c.name,
											value: c.userId
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "本期费用" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: form.amount,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.amount = $event),
									min: 0,
									precision: 2,
									controls: false,
									placeholder: "可空",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.remark,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.remark = $event),
									type: "textarea",
									rows: 2,
									placeholder: "选填"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-3644591d"]]);
//#endregion
export { workspace_default as default };

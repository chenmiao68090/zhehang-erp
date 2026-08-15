import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, H as ElDescriptions, I as ElDropdown, J as ElCol, L as ElDropdownItem, M as ElInputNumber, Nn as plus_default, R as ElDropdownMenu, St as arrow_down_default, U as ElDescriptionsItem, Un as search_default, V as ElDialog, W as ElDatePicker, Wt as copy_document_default, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, f as ElTimeline, g as ElTable, gr as view_default, gt as ElForm, h as ElTabs, ir as switch_default, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, rt as ElSelect, s as vLoading, vt as ElAlert, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { a as formatDateTime, c as optionType, i as contractStatuses, o as money, s as optionLabel, t as feigeOrderData } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
import { t as feigeOrderData$1 } from "./data-source-Cb9cli9s.js";
import { t as OrderFormDialog_default } from "./OrderFormDialog-BLIZwwKy.js";
//#region src/views/feige-order-contract/components/ContractDetailDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "detail-hero" };
var _hoisted_2$1 = { class: "detail-number" };
var _hoisted_3$1 = { class: "contract-metrics" };
var _hoisted_4$1 = { class: "staff-role-grid" };
var _hoisted_5$1 = { class: "sub-text" };
//#endregion
//#region src/views/feige-order-contract/components/ContractDetailDrawer.vue
var ContractDetailDrawer_default = /* @__PURE__ */ defineComponent({
	__name: "ContractDetailDrawer",
	props: {
		modelValue: { type: Boolean },
		contract: {}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const tab = ref("info");
		const renewals = ref([]);
		const changes = ref([]);
		watch([() => props.modelValue, () => {
			var _props$contract;
			return (_props$contract = props.contract) === null || _props$contract === void 0 ? void 0 : _props$contract.id;
		}], function() {
			var _ref = _asyncToGenerator(function* ([visible, id]) {
				if (!visible || !id) return;
				tab.value = "info";
				[renewals.value, changes.value] = yield Promise.all([feigeOrderData$1.contractRenewals(id), feigeOrderData$1.contractChanges(id)]);
			});
			return function(_x) {
				return _ref.apply(this, arguments);
			};
		}());
		function renewalLabel(value) {
			return {
				normal: "正常服务",
				currentRenewal: "本期续费",
				t2OverdueRenewal: "逾期2期",
				t6ExpectedRenewal: "预计6期内续费",
				t3OverdueCustomer: "逾期3期客户",
				lossAudit: "流失审核",
				lossCustomer: "已流失"
			}[value || ""] || value || "-";
		}
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_tab_pane = ElTabPane;
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
				size: "min(980px, 96vw)",
				title: "合约详情",
				"destroy-on-close": "",
				onClose: _cache[1] || (_cache[1] = ($event) => emit("update:modelValue", false))
			}, {
				default: withCtx(() => [__props.contract ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createBaseVNode("div", _hoisted_1$1, [createBaseVNode("div", null, [
						createBaseVNode("div", _hoisted_2$1, toDisplayString(__props.contract.contractNo), 1),
						createBaseVNode("h2", null, toDisplayString(__props.contract.companyName), 1),
						createBaseVNode("p", null, toDisplayString(__props.contract.productName || "代理记账服务") + " · " + toDisplayString(__props.contract.signDate || "-") + " 至 " + toDisplayString(__props.contract.expireDate || "-"), 1)
					]), createVNode(_component_el_tag, {
						type: unref(optionType)(unref(contractStatuses), __props.contract.contractStatus),
						size: "large"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(unref(optionLabel)(unref(contractStatuses), __props.contract.contractStatus)), 1)]),
						_: 1
					}, 8, ["type"])]),
					createBaseVNode("section", _hoisted_3$1, [
						createBaseVNode("div", null, [_cache[2] || (_cache[2] = createBaseVNode("span", null, "合同金额", -1)), createBaseVNode("strong", null, toDisplayString(unref(money)(__props.contract.contractAmount)), 1)]),
						createBaseVNode("div", null, [_cache[3] || (_cache[3] = createBaseVNode("span", null, "已收金额", -1)), createBaseVNode("strong", null, toDisplayString(unref(money)(__props.contract.paidAmount || 0)), 1)]),
						createBaseVNode("div", null, [_cache[4] || (_cache[4] = createBaseVNode("span", null, "服务月份", -1)), createBaseVNode("strong", null, toDisplayString(__props.contract.serviceMonths || 0) + "个月", 1)]),
						createBaseVNode("div", null, [_cache[5] || (_cache[5] = createBaseVNode("span", null, "企业等级", -1)), createBaseVNode("strong", null, toDisplayString(__props.contract.enterpriseLevel || "-"), 1)])
					]),
					createVNode(_component_el_tabs, {
						modelValue: tab.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => tab.value = $event)
					}, {
						default: withCtx(() => [
							createVNode(_component_el_tab_pane, {
								label: "合同信息",
								name: "info"
							}, {
								default: withCtx(() => [createVNode(_component_el_descriptions, {
									column: 2,
									border: ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_descriptions_item, { label: "关联订单" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.orderNo || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "签约人" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.signerName || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "客户来源" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.customerSource || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "付款周期" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.payType || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "续费状态" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(renewalLabel(__props.contract.renewalStatus)), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "赠送月份" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.giftMonth || 0) + "个月", 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "企业性质" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.enterpriseNature || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "业务标签" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.businessTag || __props.contract.manualBusinessTag || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "关联企业" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.relatedCompanyName || "无"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, { label: "企微群" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.weworkGroupBound ? "已关联" : "未关联"), 1)]),
											_: 1
										}),
										createVNode(_component_el_descriptions_item, {
											label: "备注",
											span: 2
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(__props.contract.remarks || "-"), 1)]),
											_: 1
										})
									]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, {
								label: "服务人员",
								name: "staff"
							}, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_4$1, [
									createBaseVNode("div", null, [_cache[6] || (_cache[6] = createBaseVNode("span", null, "财税主管", -1)), createBaseVNode("strong", null, toDisplayString(__props.contract.financeDirectorName || "待分配"), 1)]),
									createBaseVNode("div", null, [_cache[7] || (_cache[7] = createBaseVNode("span", null, "财税顾问", -1)), createBaseVNode("strong", null, toDisplayString(__props.contract.financeAdvisorName || "待分配"), 1)]),
									createBaseVNode("div", null, [_cache[8] || (_cache[8] = createBaseVNode("span", null, "主办会计", -1)), createBaseVNode("strong", null, toDisplayString(__props.contract.accountantName || __props.contract.servicePersonName || "待分配"), 1)])
								])]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, {
								label: `续费记录 ${renewals.value.length}`,
								name: "renewals"
							}, {
								default: withCtx(() => [createVNode(_component_el_table, {
									data: renewals.value,
									"empty-text": "暂无续费记录"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "续费日期",
											width: "165",
											prop: "renewalDate"
										}),
										createVNode(_component_el_table_column, {
											label: "服务期限",
											"min-width": "220"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.startDate || "-") + " 至 " + toDisplayString(row.expireDate || "-"), 1)]),
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
											prop: "giftMonth",
											label: "赠送月",
											width: "90"
										}),
										createVNode(_component_el_table_column, {
											prop: "operatorName",
											label: "操作人",
											width: "130"
										}),
										createVNode(_component_el_table_column, {
											prop: "remark",
											label: "备注",
											"min-width": "160"
										})
									]),
									_: 1
								}, 8, ["data"])]),
								_: 1
							}, 8, ["label"]),
							createVNode(_component_el_tab_pane, {
								label: "变更记录",
								name: "changes"
							}, {
								default: withCtx(() => [changes.value.length ? (openBlock(), createBlock(_component_el_timeline, { key: 0 }, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(changes.value, (item) => {
										return openBlock(), createBlock(_component_el_timeline_item, {
											key: item.id,
											timestamp: unref(formatDateTime)(item.createTime)
										}, {
											default: withCtx(() => [createBaseVNode("strong", null, toDisplayString(item.changeDesc), 1), createBaseVNode("div", _hoisted_5$1, toDisplayString(item.operatorName || "系统"), 1)]),
											_: 2
										}, 1032, ["timestamp"]);
									}), 128))]),
									_: 1
								})) : (openBlock(), createBlock(_component_el_empty, {
									key: 1,
									"image-size": 80,
									description: "暂无变更记录"
								}))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["modelValue"])
				], 64)) : createCommentVNode("", true)]),
				_: 1
			}, 8, ["model-value"]);
		};
	}
});
//#endregion
//#region src/views/feige-order-contract/contracts.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "feige-module feige-legacy-page contract-ledger-page" };
var _hoisted_2 = { class: "content-card" };
var _hoisted_3 = { class: "legacy-toolbar contract-toolbar" };
var _hoisted_4 = { class: "header-actions" };
var _hoisted_5 = { class: "contract-view-tabs" };
var _hoisted_6 = ["onClick"];
var _hoisted_7 = { class: "filter-bar" };
var _hoisted_8 = { class: "filter-actions" };
var _hoisted_9 = { class: "table-wrap legacy-wide-table" };
var _hoisted_10 = { class: "sub-text" };
var _hoisted_11 = { class: "sub-text" };
var _hoisted_12 = { class: "money" };
var _hoisted_13 = { class: "pagination-row" };
var _hoisted_14 = { class: "dialog-actions" };
//#endregion
//#region src/views/feige-order-contract/contracts.vue
var contracts_default = /* @__PURE__ */ defineComponent({
	__name: "contracts",
	setup(__props) {
		const viewOptions = [
			{
				label: "在服客户",
				value: "normal",
				hint: "正常履约"
			},
			{
				label: "本期续费",
				value: "currentRenewal",
				hint: "当前周期"
			},
			{
				label: "逾期2期",
				value: "t2OverdueRenewal",
				hint: "重点催续"
			},
			{
				label: "预计续费",
				value: "t6ExpectedRenewal",
				hint: "6期内到期"
			},
			{
				label: "逾期3期",
				value: "t3OverdueCustomer",
				hint: "高风险"
			},
			{
				label: "流失审核",
				value: "lossAudit",
				hint: "待决策"
			},
			{
				label: "流失客户",
				value: "lossCustomer",
				hint: "已终止"
			}
		];
		const loading = ref(false);
		const submitting = ref(false);
		const rows = ref([]);
		const staff = ref([]);
		const current = ref(null);
		const page = reactive({
			pageNum: 1,
			pageSize: 10,
			total: 0
		});
		const filters = reactive({
			keyword: "",
			status: "",
			staffId: void 0,
			dates: [],
			view: "normal"
		});
		const detailVisible = ref(false);
		const contractVisible = ref(false);
		const orderVisible = ref(false);
		const renewVisible = ref(false);
		const duplicateVisible = ref(false);
		const handoverVisible = ref(false);
		const editingId = ref(null);
		const formRef = ref();
		const blank = () => ({
			companyName: "",
			salesmanId: void 0,
			servicePersonId: void 0,
			contractAmount: 0,
			paidAmount: 0,
			signDate: "",
			expireDate: "",
			contractStatus: "executing",
			lossFlag: 0,
			backupFlag: 0,
			payType: "annual",
			giftMonth: 0,
			enterpriseNature: "",
			productName: "代理记账年度服务",
			signerName: "",
			customerSource: "",
			renewalStatus: "normal",
			enterpriseLevel: "C",
			businessTag: "",
			remarks: ""
		});
		const form = reactive(blank());
		const rules = { companyName: [{
			required: true,
			message: "请输入客户名称",
			trigger: "blur"
		}] };
		const renewForm = reactive({
			startDate: "",
			expireDate: "",
			amount: 0,
			giftMonth: 0,
			payType: "annual",
			remark: ""
		});
		const duplicateRows = ref([]);
		const handoverTab = ref("create");
		const handoverForm = reactive({
			sourceStaffId: void 0,
			targetStaffId: void 0,
			serviceRole: "主办会计"
		});
		const handoverPreview = ref([]);
		const handoverHistory = ref([]);
		function loadRows() {
			return _loadRows.apply(this, arguments);
		}
		function _loadRows() {
			_loadRows = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const data = yield feigeOrderData.contracts({
						pageNum: page.pageNum,
						pageSize: page.pageSize,
						keyword: filters.keyword || void 0,
						status: filters.status || void 0,
						staffId: filters.staffId,
						startDate: filters.dates[0],
						endDate: filters.dates[1],
						view: filters.view
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
		function switchView(value) {
			filters.view = value;
			search();
		}
		function resetFilter() {
			Object.assign(filters, {
				keyword: "",
				status: "",
				staffId: void 0,
				dates: [],
				view: "normal"
			});
			search();
		}
		function openCreate() {
			editingId.value = null;
			Object.assign(form, blank());
			contractVisible.value = true;
		}
		function openEdit(row) {
			editingId.value = row.id;
			Object.assign(form, _objectSpread2(_objectSpread2({}, blank()), row));
			contractVisible.value = true;
		}
		function openDetail(_x) {
			return _openDetail.apply(this, arguments);
		}
		function _openDetail() {
			_openDetail = _asyncToGenerator(function* (row) {
				current.value = yield feigeOrderData.contract(row.id);
				detailVisible.value = true;
			});
			return _openDetail.apply(this, arguments);
		}
		function submitContract() {
			return _submitContract.apply(this, arguments);
		}
		function _submitContract() {
			_submitContract = _asyncToGenerator(function* () {
				var _formRef$value;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				if (form.signDate && form.expireDate && form.expireDate < form.signDate) return ElMessage.warning("合同截止日期不能早于开始日期");
				submitting.value = true;
				try {
					if (editingId.value) yield feigeOrderData.updateContract(editingId.value, form);
					else yield feigeOrderData.createContract(form);
					ElMessage.success("合同已保存");
					contractVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitContract.apply(this, arguments);
		}
		function openRenew(row) {
			current.value = row;
			Object.assign(renewForm, {
				startDate: row.expireDate || "",
				expireDate: "",
				amount: Number(row.contractAmount || 0),
				giftMonth: 0,
				payType: row.payType || "annual",
				remark: ""
			});
			renewVisible.value = true;
		}
		function submitRenewal() {
			return _submitRenewal.apply(this, arguments);
		}
		function _submitRenewal() {
			_submitRenewal = _asyncToGenerator(function* () {
				if (!current.value || !renewForm.expireDate || renewForm.amount <= 0) return ElMessage.warning("请填写续费截止日期和金额");
				submitting.value = true;
				try {
					yield feigeOrderData.renewContract(current.value.id, renewForm);
					ElMessage.success("续费已登记");
					renewVisible.value = false;
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitRenewal.apply(this, arguments);
		}
		function loss(_x2) {
			return _loss.apply(this, arguments);
		}
		function _loss() {
			_loss = _asyncToGenerator(function* (row) {
				const result = yield ElMessageBox.prompt(`提交“${row.companyName}”流失申请，请填写原因。`, "流失申请", {
					inputValidator: (value) => !!String(value || "").trim() || "请填写流失原因",
					type: "warning"
				});
				yield feigeOrderData.terminateContract(row.id, result.value);
				ElMessage.success("已进入流失客户");
				yield loadRows();
			});
			return _loss.apply(this, arguments);
		}
		function restore(_x3) {
			return _restore.apply(this, arguments);
		}
		function _restore() {
			_restore = _asyncToGenerator(function* (row) {
				const result = yield ElMessageBox.prompt(`恢复“${row.companyName}”为正常服务合同？`, "恢复正常", { inputPlaceholder: "恢复说明（可选）" });
				yield feigeOrderData.restoreContract(row.id, result.value);
				ElMessage.success("合同已恢复");
				yield loadRows();
			});
			return _restore.apply(this, arguments);
		}
		function handleCommand(_x4, _x5) {
			return _handleCommand.apply(this, arguments);
		}
		function _handleCommand() {
			_handleCommand = _asyncToGenerator(function* (command, row) {
				if (command === "detail") yield openDetail(row);
				else if (command === "edit") openEdit(row);
				else if (command === "newOrder") orderVisible.value = true;
				else if (command === "renew") openRenew(row);
				else if (command === "loss") yield loss(row);
				else if (command === "restore") yield restore(row);
				else if (command === "wework") ElMessage.success("已打开企微关联流程（本地演示不连接真实企微）");
			});
			return _handleCommand.apply(this, arguments);
		}
		function openDuplicate() {
			return _openDuplicate.apply(this, arguments);
		}
		function _openDuplicate() {
			_openDuplicate = _asyncToGenerator(function* () {
				const data = yield feigeOrderData.contracts({
					pageNum: 1,
					pageSize: 1e3
				});
				duplicateRows.value = data.records.filter((item, index, list) => list.findIndex((candidate) => candidate.companyName.replace(/^本地演示·/, "") === item.companyName.replace(/^本地演示·/, "")) !== index);
				if (!duplicateRows.value.length && data.records.length) duplicateRows.value = data.records.slice(0, 2);
				duplicateVisible.value = true;
			});
			return _openDuplicate.apply(this, arguments);
		}
		function openHandover() {
			return _openHandover.apply(this, arguments);
		}
		function _openHandover() {
			_openHandover = _asyncToGenerator(function* () {
				handoverTab.value = "create";
				handoverPreview.value = [];
				handoverHistory.value = yield feigeOrderData.handoverHistory();
				handoverVisible.value = true;
			});
			return _openHandover.apply(this, arguments);
		}
		function previewHandover() {
			return _previewHandover.apply(this, arguments);
		}
		function _previewHandover() {
			_previewHandover = _asyncToGenerator(function* () {
				if (!handoverForm.targetStaffId) return ElMessage.warning("请选择目标服务人员");
				handoverPreview.value = yield feigeOrderData.handoverPreview(handoverForm);
			});
			return _previewHandover.apply(this, arguments);
		}
		function submitHandover() {
			return _submitHandover.apply(this, arguments);
		}
		function _submitHandover() {
			_submitHandover = _asyncToGenerator(function* () {
				if (!handoverPreview.value.length) return;
				yield ElMessageBox.confirm(`确认将 ${handoverPreview.value.length} 份合同交接给目标人员？`, "确认批量交接", { type: "warning" });
				submitting.value = true;
				try {
					yield feigeOrderData.handover(handoverForm);
					ElMessage.success("合同交接已完成");
					handoverPreview.value = [];
					handoverHistory.value = yield feigeOrderData.handoverHistory();
					handoverTab.value = "history";
					yield loadRows();
				} finally {
					submitting.value = false;
				}
			});
			return _submitHandover.apply(this, arguments);
		}
		function revoke(_x6) {
			return _revoke.apply(this, arguments);
		}
		function _revoke() {
			_revoke = _asyncToGenerator(function* (id) {
				yield feigeOrderData.revokeHandover(id);
				ElMessage.success("交接记录已撤销");
				handoverHistory.value = yield feigeOrderData.handoverHistory();
			});
			return _revoke.apply(this, arguments);
		}
		function exportRows() {
			const csv = ["合同编号,公司名称,负责人,到期日,合同金额,状态", ...rows.value.map((row) => [
				row.contractNo,
				row.companyName,
				row.salesmanName,
				row.expireDate,
				row.contractAmount,
				optionLabel(contractStatuses, row.contractStatus)
			].map((cell) => `"${String(cell || "").replaceAll("\"", "\"\"")}"`).join(","))].join("\n");
			const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
			const link = document.createElement("a");
			link.href = url;
			link.download = "LOCAL-DEMO-代理记账合同.csv";
			link.click();
			URL.revokeObjectURL(url);
		}
		onMounted(_asyncToGenerator(function* () {
			staff.value = yield feigeOrderData.staffOptions();
			yield loadRows();
		}));
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_input_number = ElInputNumber;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_alert = ElAlert;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("section", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [
						createVNode(_component_el_button, {
							icon: unref(download_default),
							onClick: exportRows
						}, {
							default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("导出", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							icon: unref(copy_document_default),
							onClick: openDuplicate
						}, {
							default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("查重", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							icon: unref(switch_default),
							onClick: openHandover
						}, {
							default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("一键交接", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(plus_default),
							onClick: openCreate
						}, {
							default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("新建合同", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							icon: unref(refresh_default),
							onClick: loadRows
						}, {
							default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("刷新", -1)])]),
							_: 1
						}, 8, ["icon"])
					])]),
					createBaseVNode("div", _hoisted_5, [(openBlock(), createElementBlock(Fragment, null, renderList(viewOptions, (item) => {
						return createBaseVNode("button", {
							key: item.value,
							class: normalizeClass({ active: filters.view === item.value }),
							onClick: ($event) => switchView(item.value)
						}, [createBaseVNode("span", null, toDisplayString(item.label), 1), createBaseVNode("small", null, toDisplayString(item.hint), 1)], 10, _hoisted_6);
					}), 64))]),
					createBaseVNode("div", _hoisted_7, [
						createVNode(_component_el_input, {
							modelValue: filters.keyword,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => filters.keyword = $event),
							class: "filter-keyword",
							clearable: "",
							placeholder: "合同号、订单号或公司名称",
							"prefix-icon": unref(search_default),
							onKeyup: withKeys(search, ["enter"])
						}, null, 8, ["modelValue", "prefix-icon"]),
						createVNode(_component_el_select, {
							modelValue: filters.status,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => filters.status = $event),
							class: "filter-select",
							clearable: "",
							placeholder: "合同状态"
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(contractStatuses), (item) => {
								return openBlock(), createBlock(_component_el_option, {
									key: item.value,
									label: item.label,
									value: item.value
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: filters.staffId,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => filters.staffId = $event),
							class: "filter-select",
							clearable: "",
							filterable: "",
							placeholder: "服务人员"
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
						createVNode(_component_el_date_picker, {
							modelValue: filters.dates,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => filters.dates = $event),
							class: "filter-date",
							type: "daterange",
							"value-format": "YYYY-MM-DD",
							"start-placeholder": "到期开始",
							"end-placeholder": "到期结束"
						}, null, 8, ["modelValue"]),
						createBaseVNode("div", _hoisted_8, [createVNode(_component_el_button, {
							type: "primary",
							icon: unref(search_default),
							onClick: search
						}, {
							default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("查询", -1)])]),
							_: 1
						}, 8, ["icon"]), createVNode(_component_el_button, { onClick: resetFilter }, {
							default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("重置", -1)])]),
							_: 1
						})])
					]),
					createBaseVNode("div", _hoisted_9, [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						"row-key": "id",
						"empty-text": "当前视图暂无代理记账合同"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "公司名称",
								"min-width": "240",
								fixed: "left",
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
								}, 1032, ["onClick"]), createBaseVNode("div", _hoisted_10, toDisplayString(row.contractNo), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "人员信息",
								width: "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", null, toDisplayString(row.salesmanName || "-"), 1), createBaseVNode("div", _hoisted_11, toDisplayString(row.accountantName || row.servicePersonName || "未分配会计"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "创建时间",
								width: "165"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(formatDateTime)(row.createTime)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "到期时间",
								width: "125",
								prop: "expireDate"
							}),
							createVNode(_component_el_table_column, {
								label: "消费金额",
								width: "135",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("strong", _hoisted_12, toDisplayString(unref(money)(row.totalSpending || row.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "复购信息",
								width: "105",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.customerOrderCount || 1) + "单", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "转介绍数",
								width: "100",
								align: "center",
								prop: "referralCount"
							}),
							createVNode(_component_el_table_column, {
								label: "跟进记录",
								width: "105",
								align: "center",
								prop: "followupCount"
							}),
							createVNode(_component_el_table_column, {
								label: "续费记录",
								width: "105",
								align: "center",
								prop: "collectionCount"
							}),
							createVNode(_component_el_table_column, {
								label: "累计时间",
								width: "110",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.serviceMonths || 0) + "个月", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "企业等级",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, { effect: "plain" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.enterpriseLevel || "-"), 1)]),
									_: 2
								}, 1024)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "业务标签",
								width: "130",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.businessTag || row.manualBusinessTag || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "关联企业",
								"min-width": "170",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.relatedCompanyName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "关联状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: row.weworkGroupBound ? "success" : "info",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.weworkGroupBound ? "企微已关联" : "未关联"), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "118",
								fixed: "right",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_dropdown, {
									trigger: "click",
									onCommand: ($event) => handleCommand($event, row)
								}, {
									dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
										default: withCtx(() => [
											createVNode(_component_el_dropdown_item, { command: "detail" }, {
												default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("合约详情", -1)])]),
												_: 1
											}),
											createVNode(_component_el_dropdown_item, { command: "edit" }, {
												default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("合约升级", -1)])]),
												_: 1
											}),
											createVNode(_component_el_dropdown_item, { command: "newOrder" }, {
												default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("新增订单", -1)])]),
												_: 1
											}),
											createVNode(_component_el_dropdown_item, { command: "renew" }, {
												default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("续费操作", -1)])]),
												_: 1
											}),
											row.contractStatus !== "terminated" ? (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 0,
												command: "loss",
												divided: ""
											}, {
												default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("流失申请", -1)])]),
												_: 1
											})) : (openBlock(), createBlock(_component_el_dropdown_item, {
												key: 1,
												command: "restore"
											}, {
												default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("恢复正常", -1)])]),
												_: 1
											})),
											createVNode(_component_el_dropdown_item, { command: "wework" }, {
												default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("企微关联", -1)])]),
												_: 1
											})
										]),
										_: 2
									}, 1024)]),
									default: withCtx(() => [createVNode(_component_el_button, {
										link: "",
										type: "primary"
									}, {
										default: withCtx(() => [_cache[47] || (_cache[47] = createTextVNode("操作", -1)), createVNode(_component_el_icon, { class: "el-icon--right" }, {
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
					createBaseVNode("div", _hoisted_13, [createVNode(_component_el_pagination, {
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
						layout: "total, prev, pager, next, sizes, jumper",
						onChange: loadRows
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(ContractDetailDrawer_default, {
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => detailVisible.value = $event),
					contract: current.value
				}, null, 8, ["modelValue", "contract"]),
				createVNode(OrderFormDialog_default, {
					modelValue: orderVisible.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => orderVisible.value = $event),
					staff: staff.value,
					onSaved: _cache[8] || (_cache[8] = ($event) => orderVisible.value = false)
				}, null, 8, ["modelValue", "staff"]),
				createVNode(_component_el_dialog, {
					modelValue: contractVisible.value,
					"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => contractVisible.value = $event),
					width: "min(900px, 94vw)",
					title: editingId.value ? "合约升级" : "新建代理记账合同",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[25] || (_cache[25] = ($event) => contractVisible.value = false) }, {
						default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitContract
					}, {
						default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("保存合同", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form,
						rules,
						"label-position": "top"
					}, {
						default: withCtx(() => [
							_cache[55] || (_cache[55] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "1"), createTextVNode("合同基础")], -1)),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "客户名称",
											prop: "companyName"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.companyName,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.companyName = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "服务产品" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.productName,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.productName = $event),
												placeholder: "代理记账年度服务"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "签约人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.signerName,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.signerName = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户来源" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.customerSource,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.customerSource = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同金额" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.contractAmount,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.contractAmount = $event),
												min: 0,
												precision: 2,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "已收金额" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.paidAmount,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.paidAmount = $event),
												min: 0,
												precision: 2,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同开始" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.signDate,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.signDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同截止" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.expireDate,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.expireDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "付款周期" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.payType,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.payType = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "月付",
														value: "monthly"
													}),
													createVNode(_component_el_option, {
														label: "季付",
														value: "quarterly"
													}),
													createVNode(_component_el_option, {
														label: "年付",
														value: "annual"
													}),
													createVNode(_component_el_option, {
														label: "一次性",
														value: "once"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "赠送月份" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.giftMonth,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.giftMonth = $event),
												min: 0,
												max: 36,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							_cache[56] || (_cache[56] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "2"), createTextVNode("客户与服务")], -1)),
							createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "负责人" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.salesmanId,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.salesmanId = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
													return openBlock(), createBlock(_component_el_option, {
														key: item.id,
														label: item.name,
														value: item.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "主办会计" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.servicePersonId,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.servicePersonId = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
													return openBlock(), createBlock(_component_el_option, {
														key: item.id,
														label: item.name,
														value: item.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业性质" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.enterpriseNature,
												"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => form.enterpriseNature = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "小规模纳税人",
														value: "小规模纳税人"
													}),
													createVNode(_component_el_option, {
														label: "一般纳税人",
														value: "一般纳税人"
													}),
													createVNode(_component_el_option, {
														label: "个体工商户",
														value: "个体工商户"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, {
										xs: 24,
										sm: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业等级" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.enterpriseLevel,
												"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => form.enterpriseLevel = $event),
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [
													createVNode(_component_el_option, {
														label: "A",
														value: "A"
													}),
													createVNode(_component_el_option, {
														label: "B",
														value: "B"
													}),
													createVNode(_component_el_option, {
														label: "C",
														value: "C"
													})
												]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "业务标签" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.businessTag,
												"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => form.businessTag = $event),
												placeholder: "重点续费、需补资料等"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.remarks,
												"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => form.remarks = $event),
												type: "textarea",
												rows: 4,
												maxlength: "1000",
												"show-word-limit": ""
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: renewVisible.value,
					"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => renewVisible.value = $event),
					width: "min(700px, 94vw)",
					title: "合同续费",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[32] || (_cache[32] = ($event) => renewVisible.value = false) }, {
						default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: submitting.value,
						onClick: submitRenewal
					}, {
						default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("确认续费", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 16 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户" }, {
										default: withCtx(() => {
											var _current$value;
											return [createTextVNode(toDisplayString((_current$value = current.value) === null || _current$value === void 0 ? void 0 : _current$value.companyName), 1)];
										}),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "当前到期" }, {
										default: withCtx(() => {
											var _current$value2;
											return [createTextVNode(toDisplayString(((_current$value2 = current.value) === null || _current$value2 === void 0 ? void 0 : _current$value2.expireDate) || "-"), 1)];
										}),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "续费开始" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: renewForm.startDate,
											"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => renewForm.startDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "续费截止" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: renewForm.expireDate,
											"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => renewForm.expireDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "续费金额" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: renewForm.amount,
											"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => renewForm.amount = $event),
											min: 0,
											precision: 2,
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "赠送月份" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: renewForm.giftMonth,
											"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => renewForm.giftMonth = $event),
											min: 0,
											max: 36,
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "续费备注" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: renewForm.remark,
											"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => renewForm.remark = $event),
											type: "textarea",
											rows: 3
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: duplicateVisible.value,
					"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => duplicateVisible.value = $event),
					width: "min(780px, 94vw)",
					title: "企业合同查重",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createVNode(_component_el_alert, {
						title: "按企业名称、联系电话和关联企业识别重复合同；本地预览只展示虚构数据。",
						type: "info",
						closable: false,
						"show-icon": ""
					}), createVNode(_component_el_table, {
						data: duplicateRows.value,
						style: { "margin-top": "16px" },
						"empty-text": "当前未发现重复企业"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "companyName",
								label: "企业名称",
								"min-width": "230"
							}),
							createVNode(_component_el_table_column, {
								prop: "contractNo",
								label: "合同编号",
								width: "200"
							}),
							createVNode(_component_el_table_column, {
								prop: "salesmanName",
								label: "负责人",
								width: "130"
							}),
							createVNode(_component_el_table_column, {
								prop: "contractStatus",
								label: "状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(unref(optionLabel)(unref(contractStatuses), row.contractStatus)), 1)]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: handoverVisible.value,
					"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => handoverVisible.value = $event),
					width: "min(960px, 96vw)",
					title: "服务人员一键交接",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createVNode(_component_el_tabs, {
						modelValue: handoverTab.value,
						"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => handoverTab.value = $event)
					}, {
						default: withCtx(() => [createVNode(_component_el_tab_pane, {
							label: "发起交接",
							name: "create"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_alert, {
									title: "先预览再执行，批量变更只作用于合同台账。",
									type: "warning",
									closable: false,
									"show-icon": ""
								}),
								createVNode(_component_el_form, {
									"label-position": "top",
									style: { "margin-top": "16px" }
								}, {
									default: withCtx(() => [createVNode(_component_el_row, { gutter: 16 }, {
										default: withCtx(() => [
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "原服务人员" }, {
													default: withCtx(() => [createVNode(_component_el_select, {
														modelValue: handoverForm.sourceStaffId,
														"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => handoverForm.sourceStaffId = $event),
														clearable: "",
														style: { "width": "100%" }
													}, {
														default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
															return openBlock(), createBlock(_component_el_option, {
																key: item.id,
																label: item.name,
																value: item.id
															}, null, 8, ["label", "value"]);
														}), 128))]),
														_: 1
													}, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "服务角色" }, {
													default: withCtx(() => [createVNode(_component_el_select, {
														modelValue: handoverForm.serviceRole,
														"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => handoverForm.serviceRole = $event),
														style: { "width": "100%" }
													}, {
														default: withCtx(() => [
															createVNode(_component_el_option, {
																label: "财税主管",
																value: "财税主管"
															}),
															createVNode(_component_el_option, {
																label: "财税顾问",
																value: "财税顾问"
															}),
															createVNode(_component_el_option, {
																label: "主办会计",
																value: "主办会计"
															})
														]),
														_: 1
													}, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											}),
											createVNode(_component_el_col, { span: 8 }, {
												default: withCtx(() => [createVNode(_component_el_form_item, { label: "目标服务人员" }, {
													default: withCtx(() => [createVNode(_component_el_select, {
														modelValue: handoverForm.targetStaffId,
														"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => handoverForm.targetStaffId = $event),
														clearable: "",
														style: { "width": "100%" }
													}, {
														default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(staff.value, (item) => {
															return openBlock(), createBlock(_component_el_option, {
																key: item.id,
																label: item.name,
																value: item.id
															}, null, 8, ["label", "value"]);
														}), 128))]),
														_: 1
													}, 8, ["modelValue"])]),
													_: 1
												})]),
												_: 1
											})
										]),
										_: 1
									})]),
									_: 1
								}),
								createBaseVNode("div", _hoisted_14, [createVNode(_component_el_button, {
									icon: unref(view_default),
									onClick: previewHandover
								}, {
									default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("预览影响合同", -1)])]),
									_: 1
								}, 8, ["icon"]), createVNode(_component_el_button, {
									type: "primary",
									disabled: !handoverPreview.value.length,
									loading: submitting.value,
									onClick: submitHandover
								}, {
									default: withCtx(() => [createTextVNode("确认交接 " + toDisplayString(handoverPreview.value.length) + " 份合同", 1)]),
									_: 1
								}, 8, ["disabled", "loading"])]),
								createVNode(_component_el_table, {
									data: handoverPreview.value,
									style: { "margin-top": "16px" },
									"empty-text": "请选择人员并点击预览"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											prop: "contractNo",
											label: "合同编号",
											width: "200"
										}),
										createVNode(_component_el_table_column, {
											prop: "companyName",
											label: "企业名称",
											"min-width": "240"
										}),
										createVNode(_component_el_table_column, {
											prop: "servicePersonName",
											label: "当前服务人",
											width: "140"
										}),
										createVNode(_component_el_table_column, {
											prop: "expireDate",
											label: "到期日",
											width: "120"
										})
									]),
									_: 1
								}, 8, ["data"])
							]),
							_: 1
						}), createVNode(_component_el_tab_pane, {
							label: "交接历史",
							name: "history"
						}, {
							default: withCtx(() => [createVNode(_component_el_table, { data: handoverHistory.value }, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										prop: "createTime",
										label: "交接时间",
										width: "175"
									}),
									createVNode(_component_el_table_column, {
										prop: "sourceStaffName",
										label: "原人员",
										width: "130"
									}),
									createVNode(_component_el_table_column, {
										prop: "targetStaffName",
										label: "目标人员",
										width: "130"
									}),
									createVNode(_component_el_table_column, {
										prop: "serviceRole",
										label: "角色",
										width: "110"
									}),
									createVNode(_component_el_table_column, {
										prop: "contractCount",
										label: "合同数",
										width: "90"
									}),
									createVNode(_component_el_table_column, {
										prop: "status",
										label: "状态",
										width: "100"
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "100"
									}, {
										default: withCtx(({ row }) => [row.status === "completed" ? (openBlock(), createBlock(_component_el_button, {
											key: 0,
											link: "",
											type: "danger",
											onClick: ($event) => revoke(row.id)
										}, {
											default: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("撤销", -1)])]),
											_: 1
										}, 8, ["onClick"])) : createCommentVNode("", true)]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"])]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
});
//#endregion
export { contracts_default as default };

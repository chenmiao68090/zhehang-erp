import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, dt as h, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, M as ElInputNumber, Nn as plus_default, Qt as document_default, Un as search_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, u as ElTreeSelect, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as deptApi } from "./org-DaVetSL-.js";
import { n as hrExpenseApi } from "./admin-CReSJXAx.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
//#region src/views/admin/hr-expense.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "hr-expense-page" };
var _hoisted_2 = { class: "he-head" };
var _hoisted_3 = { class: "he-actions" };
var _hoisted_4 = { class: "he-stats" };
var _hoisted_5 = { class: "he-stat" };
var _hoisted_6 = { class: "he-stat" };
var _hoisted_7 = { class: "he-stat" };
var _hoisted_8 = { class: "he-stat" };
var _hoisted_9 = { class: "he-filter" };
var _hoisted_10 = { class: "he-filter-total" };
var _hoisted_11 = { class: "he-grid" };
var _hoisted_12 = { class: "he-grid" };
var _hoisted_13 = { class: "he-grid" };
var _hoisted_14 = {
	key: 0,
	class: "he-file-list"
};
var _hoisted_15 = ["onClick"];
//#endregion
//#region src/views/admin/hr-expense.vue
var hr_expense_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "hr-expense",
	setup(__props) {
		const FileField = defineComponent({
			props: {
				files: {
					type: Array,
					default: () => []
				},
				loading: {
					type: Boolean,
					default: false
				}
			},
			emits: [
				"upload",
				"remove",
				"download"
			],
			setup(props, { emit }) {
				return () => h("div", { class: "he-file-field" }, [h(ElButton, {
					loading: props.loading,
					onClick: () => emit("upload")
				}, () => "上传附件"), props.files.length ? h("div", { class: "he-file-chips" }, props.files.map((file, index) => h(ElTag, {
					key: `${file.id || file.name}-${index}`,
					closable: true,
					onClose: () => emit("remove", index),
					onClick: () => emit("download", file)
				}, () => file.name))) : h("span", { class: "he-file-empty" }, "未上传")]);
			}
		});
		const CATEGORY_OPTIONS = [
			"办公生活用品",
			"业务招待费",
			"员工福利费",
			"房租水电",
			"设备采购费",
			"刻章采购",
			"其他"
		];
		const PAY_METHODS = [
			"对公支付",
			"支付宝支付",
			"个人代垫",
			"备用金支出"
		];
		const STATUS_OPTIONS = [
			"待提交",
			"已报销",
			"已提交付款申请"
		];
		const INVOICE_TITLES = [
			"诚路会计服务（杭州）有限公司",
			"浙杭企业服务（杭州）有限公司",
			"浙江诚路建设有限公司"
		];
		const today = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
		const thisMonth = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		const num = (v) => Number(v) || 0;
		const money = (v) => num(v).toLocaleString("zh-CN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const statusType = (status) => status === "已报销" ? "success" : status === "已提交付款申请" ? "warning" : "info";
		const loading = ref(false);
		const rows = ref([]);
		const total = ref(0);
		const stats = reactive({});
		const deptTree = ref([]);
		const query = reactive({
			pageNum: 1,
			pageSize: 10,
			month: thisMonth(),
			category: "",
			deptId: void 0,
			keyword: ""
		});
		function loadDeptTree() {
			return _loadDeptTree.apply(this, arguments);
		}
		function _loadDeptTree() {
			_loadDeptTree = _asyncToGenerator(function* () {
				try {
					const res = yield deptApi.tree();
					deptTree.value = (res === null || res === void 0 ? void 0 : res.data) || res || [];
				} catch (_unused) {
					deptTree.value = [];
				}
			});
			return _loadDeptTree.apply(this, arguments);
		}
		function findDept(id, nodes = deptTree.value) {
			for (const node of nodes || []) {
				if (String(node.id) === String(id)) return node;
				const hit = findDept(id, node.children || []);
				if (hit) return hit;
			}
			return null;
		}
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const res = yield hrExpenseApi.list({
						pageNum: query.pageNum,
						pageSize: query.pageSize,
						month: query.month || void 0,
						category: query.category || void 0,
						deptId: query.deptId || void 0,
						keyword: query.keyword || void 0
					});
					const page = (res === null || res === void 0 ? void 0 : res.page) || {};
					rows.value = page.records || [];
					total.value = page.total || 0;
					Object.assign(stats, (res === null || res === void 0 ? void 0 : res.stats) || {});
				} catch (_unused2) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		function reset() {
			Object.assign(query, {
				pageNum: 1,
				pageSize: 10,
				month: thisMonth(),
				category: "",
				deptId: void 0,
				keyword: ""
			});
			load();
		}
		const editDlg = reactive({
			visible: false,
			saving: false
		});
		const form = reactive({});
		const expenseFiles = ref([]);
		const invoiceFiles = ref([]);
		const expenseInput = ref();
		const invoiceInput = ref();
		const uploadingExpense = ref(false);
		const uploadingInvoice = ref(false);
		const calcTotal = computed(() => num(form.quantity) * num(form.unitPrice));
		function emptyForm() {
			return {
				expenseDate: today(),
				category: "办公生活用品",
				quantity: 1,
				unitPrice: 0,
				totalPrice: 0,
				payMethod: "对公支付",
				status: "待提交",
				invoiceType: "无票",
				invoiceAmount: 0
			};
		}
		function openEdit(_x) {
			return _openEdit.apply(this, arguments);
		}
		function _openEdit() {
			_openEdit = _asyncToGenerator(function* (row) {
				Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {});
				expenseFiles.value = parseFiles(form.attach);
				invoiceFiles.value = parseFiles(form.invoiceAttach);
				editDlg.visible = true;
				if (!row) refreshNo();
			});
			return _openEdit.apply(this, arguments);
		}
		function refreshNo() {
			return _refreshNo.apply(this, arguments);
		}
		function _refreshNo() {
			_refreshNo = _asyncToGenerator(function* () {
				if (form.id || form.expenseNo) return;
				try {
					form.expenseNo = String(yield hrExpenseApi.nextNo(form.expenseDate));
				} catch (_unused3) {
					form.expenseNo = "";
				}
			});
			return _refreshNo.apply(this, arguments);
		}
		function syncDeptName() {
			const dept = findDept(form.deptId);
			form.deptName = (dept === null || dept === void 0 ? void 0 : dept.deptName) || "";
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				if (!form.category) {
					ElMessage.warning("请选择费用大类");
					return;
				}
				if (!form.content) {
					ElMessage.warning("请填写具体支出内容");
					return;
				}
				editDlg.saving = true;
				try {
					syncDeptName();
					form.totalPrice = calcTotal.value;
					form.attach = JSON.stringify(expenseFiles.value);
					form.invoiceAttach = JSON.stringify(invoiceFiles.value);
					yield hrExpenseApi.save(form);
					ElMessage.success("已保存");
					editDlg.visible = false;
					load();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "保存失败");
				} finally {
					editDlg.saving = false;
				}
			});
			return _submit.apply(this, arguments);
		}
		function remove(_x2) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认删除「${row.expenseNo || row.content}」?`, "删除", { type: "warning" });
					yield hrExpenseApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "删除失败");
				}
			});
			return _remove.apply(this, arguments);
		}
		function parseFiles(raw) {
			if (!raw) return [];
			try {
				const parsed = JSON.parse(raw);
				return Array.isArray(parsed) ? parsed : [];
			} catch (_unused4) {
				return raw ? [{ name: raw }] : [];
			}
		}
		function fileCount(row) {
			return parseFiles(row.attach).length + parseFiles(row.invoiceAttach).length;
		}
		function fileKey(file) {
			return `${file.id || file.url || file.name}`;
		}
		function pickExpense() {
			var _expenseInput$value;
			(_expenseInput$value = expenseInput.value) === null || _expenseInput$value === void 0 || _expenseInput$value.click();
		}
		function pickInvoice() {
			var _invoiceInput$value;
			(_invoiceInput$value = invoiceInput.value) === null || _invoiceInput$value === void 0 || _invoiceInput$value.click();
		}
		function removeExpenseFile(idx) {
			expenseFiles.value.splice(idx, 1);
		}
		function removeInvoiceFile(idx) {
			invoiceFiles.value.splice(idx, 1);
		}
		function uploadFiles(_x3, _x4, _x5) {
			return _uploadFiles.apply(this, arguments);
		}
		function _uploadFiles() {
			_uploadFiles = _asyncToGenerator(function* (files, target, loadingRef) {
				loadingRef.value = true;
				try {
					for (const file of files) {
						const res = yield fileInfoApi.upload(file);
						const payload = (res === null || res === void 0 ? void 0 : res.data) || res || {};
						target.value.push({
							id: Number(payload.id || 0) || void 0,
							name: payload.originalName || payload.fileName || file.name,
							url: payload.url
						});
					}
					ElMessage.success("附件已上传");
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "附件上传失败");
				} finally {
					loadingRef.value = false;
				}
			});
			return _uploadFiles.apply(this, arguments);
		}
		function onExpensePick(_x6) {
			return _onExpensePick.apply(this, arguments);
		}
		function _onExpensePick() {
			_onExpensePick = _asyncToGenerator(function* (e) {
				const input = e.target;
				yield uploadFiles(input.files ? Array.from(input.files) : [], expenseFiles, uploadingExpense);
				input.value = "";
			});
			return _onExpensePick.apply(this, arguments);
		}
		function onInvoicePick(_x7) {
			return _onInvoicePick.apply(this, arguments);
		}
		function _onInvoicePick() {
			_onInvoicePick = _asyncToGenerator(function* (e) {
				const input = e.target;
				yield uploadFiles(input.files ? Array.from(input.files) : [], invoiceFiles, uploadingInvoice);
				input.value = "";
			});
			return _onInvoicePick.apply(this, arguments);
		}
		function downloadFile(_x8) {
			return _downloadFile.apply(this, arguments);
		}
		function _downloadFile() {
			_downloadFile = _asyncToGenerator(function* (file) {
				if (file.id) {
					const blob = yield fileInfoApi.download(file.id);
					const url = URL.createObjectURL(blob);
					const a = document.createElement("a");
					a.href = url;
					a.download = file.name || "附件";
					a.click();
					URL.revokeObjectURL(url);
				} else if (file.url) window.open(file.url, "_blank");
			});
			return _downloadFile.apply(this, arguments);
		}
		const attachDlg = reactive({
			visible: false,
			files: []
		});
		function openAttachView(row) {
			attachDlg.files = [...parseFiles(row.attach), ...parseFiles(row.invoiceAttach)];
			attachDlg.visible = true;
		}
		onMounted(() => {
			loadDeptTree();
			load();
		});
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_input = ElInput;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_divider = ElDivider;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_icon = ElIcon;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[25] || (_cache[25] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "he-title" }, "人事行政支出明细登记"), createBaseVNode("p", { class: "he-sub" }, "登记行政、人事、办公与采购支出，沉淀付款、凭证、发票与部门归属明细。")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(unref(ElButton), {
					type: "primary",
					icon: unref(plus_default),
					onClick: _cache[0] || (_cache[0] = ($event) => openEdit())
				}, {
					default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("新增明细", -1)])]),
					_: 1
				}, 8, ["icon"]), createVNode(unref(ElButton), {
					icon: unref(refresh_default),
					onClick: load
				}, {
					default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("刷新", -1)])]),
					_: 1
				}, 8, ["icon"])])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [_cache[26] || (_cache[26] = createBaseVNode("span", null, "本月总支出", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).monthTotal)), 1)]),
					createBaseVNode("div", _hoisted_6, [_cache[27] || (_cache[27] = createBaseVNode("span", null, "上月总支出", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).lastMonthTotal)), 1)]),
					createBaseVNode("div", _hoisted_7, [_cache[28] || (_cache[28] = createBaseVNode("span", null, "季度总支出", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).quarterTotal)), 1)]),
					createBaseVNode("div", _hoisted_8, [_cache[29] || (_cache[29] = createBaseVNode("span", null, "年度总支出", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).yearTotal)), 1)])
				]),
				createBaseVNode("div", _hoisted_9, [
					createVNode(_component_el_date_picker, {
						modelValue: unref(query).month,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(query).month = $event),
						type: "month",
						"value-format": "YYYY-MM",
						placeholder: "月份",
						style: { "width": "150px" },
						clearable: ""
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(query).category,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(query).category = $event),
						placeholder: "类别",
						clearable: "",
						style: { "width": "170px" }
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORY_OPTIONS, (item) => {
							return createVNode(_component_el_option, {
								key: item,
								label: item,
								value: item
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_tree_select, {
						modelValue: unref(query).deptId,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(query).deptId = $event),
						data: unref(deptTree),
						"node-key": "id",
						props: {
							label: "deptName",
							children: "children"
						},
						"check-strictly": "",
						clearable: "",
						placeholder: "归属部门",
						style: { "width": "190px" }
					}, null, 8, ["modelValue", "data"]),
					createVNode(_component_el_input, {
						modelValue: unref(query).keyword,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(query).keyword = $event),
						placeholder: "登记编号/内容/备注",
						clearable: "",
						style: { "width": "220px" },
						onKeyup: withKeys(load, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(unref(ElButton), {
						type: "primary",
						icon: unref(search_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(unref(ElButton), { onClick: reset }, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("重置", -1)])]),
						_: 1
					}),
					createBaseVNode("span", _hoisted_10, "筛选支出总计：¥" + toDisplayString(money(unref(stats).filteredTotal)), 1)
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: unref(rows),
					border: "",
					stripe: "",
					size: "small",
					"max-height": "590"
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "暂无支出明细",
						"image-size": 80
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							prop: "expenseNo",
							label: "登记编号",
							width: "150",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "expenseDate",
							label: "支出日期",
							width: "105"
						}),
						createVNode(_component_el_table_column, {
							prop: "deptName",
							label: "费用归属部门",
							width: "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "category",
							label: "费用大类",
							width: "120",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "content",
							label: "具体支出内容",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "quantity",
							label: "数量",
							width: "70",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "单价",
							width: "105",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(money(row.unitPrice)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "总价",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", null, "¥" + toDisplayString(money(row.totalPrice)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "payMethod",
							label: "支付方式",
							width: "105"
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "116",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(unref(ElTag), {
								size: "small",
								type: statusType(row.status)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.status || "待提交"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "invoiceType",
							label: "发票类型",
							width: "82"
						}),
						createVNode(_component_el_table_column, {
							prop: "invoiceTitle",
							label: "发票抬头",
							width: "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "开票金额",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(money(row.invoiceAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "附件",
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(unref(ElButton), {
								link: "",
								type: "primary",
								onClick: ($event) => openAttachView(row)
							}, {
								default: withCtx(() => [createTextVNode("附件(" + toDisplayString(fileCount(row)) + ")", 1)]),
								_: 2
							}, 1032, ["onClick"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "130",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(unref(ElButton), {
								link: "",
								size: "small",
								type: "primary",
								onClick: ($event) => openEdit(row)
							}, {
								default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("编辑", -1)])]),
								_: 1
							}, 8, ["onClick"]), createVNode(unref(ElButton), {
								link: "",
								size: "small",
								type: "danger",
								onClick: ($event) => remove(row)
							}, {
								default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("删除", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, unref(loading)]]),
				unref(total) > 0 ? (openBlock(), createBlock(_component_el_pagination, {
					key: 0,
					class: "he-pager",
					background: "",
					layout: "total, sizes, prev, pager, next",
					"current-page": unref(query).pageNum,
					"onUpdate:currentPage": _cache[5] || (_cache[5] = ($event) => unref(query).pageNum = $event),
					"page-size": unref(query).pageSize,
					"onUpdate:pageSize": _cache[6] || (_cache[6] = ($event) => unref(query).pageSize = $event),
					"page-sizes": [
						10,
						20,
						50
					],
					total: unref(total),
					onChange: load
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: unref(editDlg).visible,
					"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(editDlg).visible = $event),
					title: unref(form).id ? "编辑支出明细" : "新增支出明细",
					width: "860px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(unref(ElButton), { onClick: _cache[20] || (_cache[20] = ($event) => unref(editDlg).visible = false) }, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(unref(ElButton), {
						type: "primary",
						loading: unref(editDlg).saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: unref(form),
						"label-width": "112px",
						class: "he-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("基础信息", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_11, [
								createVNode(_component_el_form_item, { label: "登记编号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).expenseNo,
										"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(form).expenseNo = $event),
										placeholder: "留空自动生成"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "支出日期",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).expenseDate,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(form).expenseDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "width": "100%" },
										onChange: refreshNo
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "归属部门" }, {
									default: withCtx(() => [createVNode(_component_el_tree_select, {
										modelValue: unref(form).deptId,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(form).deptId = $event),
										data: unref(deptTree),
										"node-key": "id",
										props: {
											label: "deptName",
											children: "children"
										},
										"check-strictly": "",
										clearable: "",
										style: { "width": "100%" },
										onChange: syncDeptName
									}, null, 8, ["modelValue", "data"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "费用大类",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).category,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(form).category = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORY_OPTIONS, (item) => {
											return createVNode(_component_el_option, {
												key: item,
												label: item,
												value: item
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("费用明细", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_12, [
								createVNode(_component_el_form_item, {
									label: "支出内容",
									required: "",
									class: "he-span2"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).content,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(form).content = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "数量" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).quantity,
										"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(form).quantity = $event),
										min: 1,
										precision: 0,
										"controls-position": "right",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "单价" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).unitPrice,
										"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(form).unitPrice = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "总价" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										"model-value": money(unref(calcTotal)),
										readonly: ""
									}, null, 8, ["model-value"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "支付方式" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).payMethod,
										"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(form).payMethod = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PAY_METHODS, (item) => {
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
								createVNode(_component_el_form_item, { label: "状态" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).status,
										"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(form).status = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUS_OPTIONS, (item) => {
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
								createVNode(_component_el_form_item, {
									label: "支出凭证",
									class: "he-span3"
								}, {
									default: withCtx(() => [createVNode(unref(FileField), {
										files: unref(expenseFiles),
										loading: unref(uploadingExpense),
										onUpload: pickExpense,
										onRemove: removeExpenseFile,
										onDownload: downloadFile
									}, null, 8, ["files", "loading"]), createBaseVNode("input", {
										ref_key: "expenseInput",
										ref: expenseInput,
										type: "file",
										multiple: "",
										style: { "display": "none" },
										onChange: onExpensePick
									}, null, 544)]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "备注",
									class: "he-span3"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).remark,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(form).remark = $event),
										type: "textarea",
										rows: 2
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("开票信息", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_13, [
								createVNode(_component_el_form_item, { label: "发票类型" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).invoiceType,
										"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(form).invoiceType = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [
											createVNode(_component_el_option, {
												label: "专票",
												value: "专票"
											}),
											createVNode(_component_el_option, {
												label: "普票",
												value: "普票"
											}),
											createVNode(_component_el_option, {
												label: "无票",
												value: "无票"
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "发票抬头" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).invoiceTitle,
										"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(form).invoiceTitle = $event),
										style: { "width": "100%" },
										clearable: ""
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(INVOICE_TITLES, (item) => {
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
								createVNode(_component_el_form_item, { label: "开票金额" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).invoiceAmount,
										"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(form).invoiceAmount = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "发票附件",
									class: "he-span3"
								}, {
									default: withCtx(() => [createVNode(unref(FileField), {
										files: unref(invoiceFiles),
										loading: unref(uploadingInvoice),
										onUpload: pickInvoice,
										onRemove: removeInvoiceFile,
										onDownload: downloadFile
									}, null, 8, ["files", "loading"]), createBaseVNode("input", {
										ref_key: "invoiceInput",
										ref: invoiceInput,
										type: "file",
										multiple: "",
										style: { "display": "none" },
										onChange: onInvoicePick
									}, null, 544)]),
									_: 1
								})
							])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: unref(attachDlg).visible,
					"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(attachDlg).visible = $event),
					title: "附件",
					width: "520px"
				}, {
					default: withCtx(() => [unref(attachDlg).files.length ? (openBlock(), createElementBlock("div", _hoisted_14, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(attachDlg).files, (file) => {
						return openBlock(), createElementBlock("button", {
							key: fileKey(file),
							type: "button",
							class: "he-file-row",
							onClick: ($event) => downloadFile(file)
						}, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(document_default))]),
							_: 1
						}), createBaseVNode("span", null, toDisplayString(file.name), 1)], 8, _hoisted_15);
					}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "暂无附件",
						"image-size": 70
					}))]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-cbaf2c70"]]);
//#endregion
export { hr_expense_default as default };

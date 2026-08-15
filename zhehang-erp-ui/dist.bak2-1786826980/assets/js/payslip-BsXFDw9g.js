import { $ as createCommentVNode, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Bn as refresh_default, D as ElPagination, F as ElEmpty, Ln as promotion_default, M as ElInputNumber, Nn as plus_default, Un as search_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, ur as upload_default, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi, t as deptApi } from "./org-DaVetSL-.js";
import { c as payslipApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/payslip.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "payslip" };
var _hoisted_2 = { class: "ps-head" };
var _hoisted_3 = { class: "ps-head-actions" };
var _hoisted_4 = { class: "ps-overview" };
var _hoisted_5 = { class: "ov-num" };
var _hoisted_6 = {
	class: "ov-num",
	style: { "color": "#e6a23c" }
};
var _hoisted_7 = {
	class: "ov-num",
	style: { "color": "#67c23a" }
};
var _hoisted_8 = {
	class: "ov-num",
	style: { "color": "#f56c6c" }
};
var _hoisted_9 = { class: "ps-filter" };
var _hoisted_10 = { class: "ps-net" };
var _hoisted_11 = {
	key: 0,
	style: { "color": "#f56c6c" }
};
var _hoisted_12 = { key: 1 };
var _hoisted_13 = { class: "ps-grid" };
var _hoisted_14 = { class: "ps-grid" };
var _hoisted_15 = { class: "ps-grid" };
var _hoisted_16 = { class: "ps-grid" };
var _hoisted_17 = { class: "ps-grid" };
var _hoisted_18 = {
	key: 0,
	class: "ps-preview"
};
//#endregion
//#region src/views/hrm/payslip.vue
var payslip_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "payslip",
	setup(__props) {
		const STATUS_LABEL = {
			0: "待发放",
			1: "已发放待确认",
			2: "员工已确认",
			3: "员工有异议"
		};
		const STATUS_TAG = {
			0: "info",
			1: "warning",
			2: "success",
			3: "danger"
		};
		const loading = ref(false);
		const rows = ref([]);
		const total = ref(0);
		const counts = reactive({
			all: 0,
			pending: 0,
			confirmed: 0,
			disputed: 0
		});
		const query = reactive({
			pageNum: 1,
			pageSize: 10,
			payMonth: "",
			deptName: "",
			employeeId: void 0,
			confirmStatus: void 0
		});
		const employees = ref([]);
		const deptOptions = ref([]);
		const fmt = (v) => {
			const n = v === null || v === void 0 || v === "" ? 0 : Number(v);
			return (isNaN(n) ? 0 : n).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		};
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$page, _res$page2;
					const res = yield payslipApi.list({
						pageNum: query.pageNum,
						pageSize: query.pageSize,
						payMonth: query.payMonth || void 0,
						deptName: query.deptName || void 0,
						employeeId: query.employeeId || void 0,
						confirmStatus: query.confirmStatus
					});
					rows.value = (res === null || res === void 0 || (_res$page = res.page) === null || _res$page === void 0 ? void 0 : _res$page.records) || [];
					total.value = (res === null || res === void 0 || (_res$page2 = res.page) === null || _res$page2 === void 0 ? void 0 : _res$page2.total) || 0;
					const c = (res === null || res === void 0 ? void 0 : res.counts) || {};
					counts.all = c.all || 0;
					counts.pending = c.pending || 0;
					counts.confirmed = c.confirmed || 0;
					counts.disputed = c.disputed || 0;
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		function filterStatus(s) {
			query.confirmStatus = s;
			query.pageNum = 1;
			load();
		}
		function resetFilter() {
			query.payMonth = "";
			query.deptName = "";
			query.employeeId = void 0;
			query.confirmStatus = void 0;
			query.pageNum = 1;
			load();
		}
		function onPageChange(p) {
			query.pageNum = p;
			load();
		}
		function employeeLabel(c) {
			return c.name + (c.deptName ? " / " + c.deptName : "");
		}
		const editDlg = reactive({
			visible: false,
			saving: false
		});
		const emptyForm = () => ({
			personalLeave: 0,
			sickLeave: 0,
			otherPaidLeave: 0,
			actualAttendanceDays: 0,
			baseSalary: 0,
			performanceSalary: 0,
			commission: 0,
			bonus: 0,
			reissue: 0,
			socialInsuranceDeduct: 0,
			fundDeduct: 0,
			taxDeduct: 0,
			otherDeduct: 0,
			netSalary: 0
		});
		const form = reactive(emptyForm());
		function openEdit(row) {
			Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {});
			editDlg.visible = true;
		}
		function onEmpPick(empId) {
			const c = employees.value.find((x) => x.id === empId);
			if (c) {
				form.employeeName = c.name;
				form.deptName = c.deptName;
				form.postName = c.postName;
			}
		}
		function recalc(force = false) {
			const income = num(form.baseSalary) + num(form.performanceSalary) + num(form.commission) + num(form.bonus) + num(form.reissue);
			const deduct = num(form.socialInsuranceDeduct) + num(form.fundDeduct) + num(form.taxDeduct) + num(form.otherDeduct);
			const net = Math.round((income - deduct) * 100) / 100;
			if (force || !form.netSalary) form.netSalary = net;
		}
		function num(v) {
			return Number(v) || 0;
		}
		function submitEdit() {
			return _submitEdit.apply(this, arguments);
		}
		function _submitEdit() {
			_submitEdit = _asyncToGenerator(function* () {
				if (!form.payMonth) {
					ElMessage.warning("请填写薪资月份");
					return;
				}
				if (!form.employeeName) {
					ElMessage.warning("请选择员工或填写姓名");
					return;
				}
				editDlg.saving = true;
				try {
					yield payslipApi.save(form);
					ElMessage.success("保存成功");
					editDlg.visible = false;
					load();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "保存失败");
				} finally {
					editDlg.saving = false;
				}
			});
			return _submitEdit.apply(this, arguments);
		}
		function remove(_x) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认删除 ${row.employeeName} ${row.payMonth} 的工资条?`, "提示", { type: "warning" });
					yield payslipApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "删除失败");
				}
			});
			return _remove.apply(this, arguments);
		}
		function distributeOne(_x2) {
			return _distributeOne.apply(this, arguments);
		}
		function _distributeOne() {
			_distributeOne = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认发放 ${row.employeeName} ${row.payMonth} 的工资条?员工将收到确认通知。`, "发放", { type: "warning" });
					const n = yield payslipApi.distribute({ ids: [row.id] });
					ElMessage.success(`已发放 ${n} 条`);
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "发放失败");
				}
			});
			return _distributeOne.apply(this, arguments);
		}
		function distributeMonth() {
			return _distributeMonth.apply(this, arguments);
		}
		function _distributeMonth() {
			_distributeMonth = _asyncToGenerator(function* () {
				if (!query.payMonth) {
					ElMessage.warning("请先在筛选里填写薪资月份");
					return;
				}
				try {
					yield ElMessageBox.confirm(`确认发放 ${query.payMonth} 全部「待发放」工资条?`, "整月发放", { type: "warning" });
					const n = yield payslipApi.distribute({ payMonth: query.payMonth });
					ElMessage.success(`已发放 ${n} 条`);
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "发放失败");
				}
			});
			return _distributeMonth.apply(this, arguments);
		}
		const importDlg = reactive({
			visible: false,
			saving: false
		});
		const importText = ref("");
		const importPreview = ref([]);
		const HEAD_MAP = [
			{
				keys: ["薪资月份", "月份"],
				field: "payMonth"
			},
			{
				keys: ["姓名"],
				field: "employeeName"
			},
			{
				keys: ["部门"],
				field: "deptName"
			},
			{
				keys: ["岗位"],
				field: "postName"
			},
			{
				keys: ["身份证"],
				field: "idCard"
			},
			{
				keys: ["手机", "电话"],
				field: "phone"
			},
			{
				keys: ["银行卡", "卡号"],
				field: "bankCard"
			},
			{
				keys: ["事假"],
				field: "personalLeave",
				num: true
			},
			{
				keys: ["病假"],
				field: "sickLeave",
				num: true
			},
			{
				keys: ["带薪假"],
				field: "otherPaidLeave",
				num: true
			},
			{
				keys: ["出勤"],
				field: "actualAttendanceDays",
				num: true
			},
			{
				keys: ["基本"],
				field: "baseSalary",
				num: true
			},
			{
				keys: ["绩效"],
				field: "performanceSalary",
				num: true
			},
			{
				keys: ["提成"],
				field: "commission",
				num: true
			},
			{
				keys: ["奖金"],
				field: "bonus",
				num: true
			},
			{
				keys: ["补发"],
				field: "reissue",
				num: true
			},
			{
				keys: ["社保"],
				field: "socialInsuranceDeduct",
				num: true
			},
			{
				keys: ["公积金"],
				field: "fundDeduct",
				num: true
			},
			{
				keys: ["个税"],
				field: "taxDeduct",
				num: true
			},
			{
				keys: ["其他扣"],
				field: "otherDeduct",
				num: true
			},
			{
				keys: ["实发"],
				field: "netSalary",
				num: true
			},
			{
				keys: ["备注"],
				field: "remark"
			}
		];
		function openImport() {
			importText.value = "";
			importPreview.value = [];
			importDlg.visible = true;
		}
		function splitCells(line) {
			return line.includes("	") ? line.split("	") : line.split(",");
		}
		function parseImport() {
			const lines = importText.value.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length);
			if (lines.length < 2) {
				ElMessage.warning("至少需要表头 + 1 行数据");
				importPreview.value = [];
				return;
			}
			const colField = splitCells(lines[0]).map((h) => h.trim()).map((h) => {
				const hit = HEAD_MAP.find((m) => m.keys.some((k) => h.includes(k)));
				return hit ? hit.field : null;
			});
			const list = [];
			for (let i = 1; i < lines.length; i++) {
				const cells = splitCells(lines[i]);
				const item = { confirmStatus: 0 };
				colField.forEach((field, idx) => {
					var _cells$idx;
					if (!field) return;
					const raw = ((_cells$idx = cells[idx]) !== null && _cells$idx !== void 0 ? _cells$idx : "").trim();
					const meta = HEAD_MAP.find((m) => m.field === field);
					item[field] = (meta === null || meta === void 0 ? void 0 : meta.num) ? raw === "" ? 0 : Number(raw.replace(/,/g, "")) || 0 : raw;
				});
				if (!item.employeeName && !item.payMonth) continue;
				list.push(item);
			}
			importPreview.value = list;
			ElMessage.success(`解析出 ${list.length} 条,请核对后导入`);
		}
		function submitImport() {
			return _submitImport.apply(this, arguments);
		}
		function _submitImport() {
			_submitImport = _asyncToGenerator(function* () {
				if (!importPreview.value.length) {
					ElMessage.warning("请先解析预览");
					return;
				}
				importDlg.saving = true;
				try {
					const n = yield payslipApi.batchSave(importPreview.value);
					ElMessage.success(`导入成功 ${n} 条`);
					importDlg.visible = false;
					load();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "导入失败");
				} finally {
					importDlg.saving = false;
				}
			});
			return _submitImport.apply(this, arguments);
		}
		function loadEmployees() {
			return _loadEmployees.apply(this, arguments);
		}
		function _loadEmployees() {
			_loadEmployees = _asyncToGenerator(function* () {
				try {
					employees.value = ((yield employeeApi.roster()) || []).filter((e) => e.status !== 3);
				} catch (_unused) {
					employees.value = [];
				}
			});
			return _loadEmployees.apply(this, arguments);
		}
		function flattenDeptTree(nodes, list = []) {
			for (const node of nodes || []) {
				list.push(node);
				if (Array.isArray(node.children) && node.children.length) flattenDeptTree(node.children, list);
			}
			return list;
		}
		function loadDepts() {
			return _loadDepts.apply(this, arguments);
		}
		function _loadDepts() {
			_loadDepts = _asyncToGenerator(function* () {
				try {
					const tree = yield deptApi.tree();
					deptOptions.value = flattenDeptTree((tree === null || tree === void 0 ? void 0 : tree.data) || tree || []).filter((d) => d.deptName);
				} catch (_unused2) {
					deptOptions.value = [];
				}
			});
			return _loadDepts.apply(this, arguments);
		}
		onMounted(() => {
			load();
			loadEmployees();
			loadDepts();
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_divider = ElDivider;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_alert = ElAlert;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[43] || (_cache[43] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "ps-title" }, "工资条核算"), createBaseVNode("p", { class: "ps-sub" }, "按月录入员工工资条(可逐条新增或批量导入),核对后「发放」,员工在自助端签字确认或提出异议。")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: _cache[0] || (_cache[0] = ($event) => openEdit())
					}, {
						default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("新增工资条", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(upload_default),
						onClick: openImport
					}, {
						default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("批量导入", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"])
				])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).confirmStatus === void 0 }]),
						onClick: _cache[1] || (_cache[1] = ($event) => filterStatus(void 0))
					}, [createBaseVNode("div", _hoisted_5, toDisplayString(unref(counts).all), 1), _cache[44] || (_cache[44] = createBaseVNode("div", { class: "ov-lbl" }, "全部", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).confirmStatus === 1 }]),
						onClick: _cache[2] || (_cache[2] = ($event) => filterStatus(1))
					}, [createBaseVNode("div", _hoisted_6, toDisplayString(unref(counts).pending), 1), _cache[45] || (_cache[45] = createBaseVNode("div", { class: "ov-lbl" }, "待确认", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).confirmStatus === 2 }]),
						onClick: _cache[3] || (_cache[3] = ($event) => filterStatus(2))
					}, [createBaseVNode("div", _hoisted_7, toDisplayString(unref(counts).confirmed), 1), _cache[46] || (_cache[46] = createBaseVNode("div", { class: "ov-lbl" }, "已确认", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).confirmStatus === 3 }]),
						onClick: _cache[4] || (_cache[4] = ($event) => filterStatus(3))
					}, [createBaseVNode("div", _hoisted_8, toDisplayString(unref(counts).disputed), 1), _cache[47] || (_cache[47] = createBaseVNode("div", { class: "ov-lbl" }, "有异议", -1))], 2)
				]),
				createBaseVNode("div", _hoisted_9, [
					createVNode(_component_el_date_picker, {
						modelValue: unref(query).payMonth,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(query).payMonth = $event),
						type: "month",
						"value-format": "YYYY-MM",
						placeholder: "选择薪资月份",
						clearable: "",
						style: { "width": "170px" }
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(query).deptName,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(query).deptName = $event),
						placeholder: "部门",
						clearable: "",
						filterable: "",
						style: { "width": "180px" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(deptOptions), (d) => {
							return openBlock(), createBlock(_component_el_option, {
								key: d.id || d.deptName,
								label: d.deptName,
								value: d.deptName
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(query).employeeId,
						"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(query).employeeId = $event),
						placeholder: "员工姓名",
						clearable: "",
						filterable: "",
						style: { "width": "190px" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (c) => {
							return openBlock(), createBlock(_component_el_option, {
								key: c.id,
								label: employeeLabel(c),
								value: c.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, { onClick: resetFilter }, {
						default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("重置", -1)])]),
						_: 1
					}),
					unref(query).payMonth ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						type: "warning",
						plain: "",
						icon: unref(promotion_default),
						onClick: distributeMonth
					}, {
						default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("发放本月全部待发放", -1)])]),
						_: 1
					}, 8, ["icon"])) : createCommentVNode("", true)
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: unref(rows),
					"element-loading-text": "加载中…",
					border: "",
					stripe: "",
					size: "small",
					"max-height": "560"
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "暂无工资条,请新增或批量导入",
						"image-size": 80
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "月份",
							prop: "payMonth",
							width: "90",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "姓名",
							prop: "employeeName",
							width: "90",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "部门",
							prop: "deptName",
							width: "110",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "岗位",
							prop: "postName",
							width: "100",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "出勤天",
							prop: "actualAttendanceDays",
							width: "72",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "基本",
							prop: "baseSalary",
							width: "90",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.baseSalary)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "绩效",
							prop: "performanceSalary",
							width: "90",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.performanceSalary)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "提成",
							prop: "commission",
							width: "90",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.commission)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "社保扣",
							prop: "socialInsuranceDeduct",
							width: "90",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.socialInsuranceDeduct)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "个税扣",
							prop: "taxDeduct",
							width: "90",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(row.taxDeduct)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "实发",
							prop: "netSalary",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_10, "¥" + toDisplayString(fmt(row.netSalary)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: STATUS_TAG[row.confirmStatus] || "info",
								effect: "light"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(STATUS_LABEL[row.confirmStatus] || "-"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "异议内容",
							prop: "feedback",
							"min-width": "140",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [row.confirmStatus === 3 ? (openBlock(), createElementBlock("span", _hoisted_11, toDisplayString(row.feedback || "-"), 1)) : (openBlock(), createElementBlock("span", _hoisted_12, "-"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "180",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => openEdit(row)
								}, {
									default: withCtx(() => [..._cache[51] || (_cache[51] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								row.confirmStatus === 0 ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									link: "",
									type: "warning",
									onClick: ($event) => distributeOne(row)
								}, {
									default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("发放", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])
							]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, unref(loading)]]),
				unref(total) > 0 ? (openBlock(), createBlock(_component_el_pagination, {
					key: 0,
					class: "ps-pager",
					background: "",
					layout: "total, prev, pager, next",
					total: unref(total),
					"current-page": unref(query).pageNum,
					"page-size": unref(query).pageSize,
					onCurrentChange: onPageChange
				}, null, 8, [
					"total",
					"current-page",
					"page-size"
				])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: unref(editDlg).visible,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => unref(editDlg).visible = $event),
					title: unref(form).id ? "编辑工资条" : "新增工资条",
					width: "820px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[35] || (_cache[35] = ($event) => unref(editDlg).visible = false) }, {
						default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: unref(editDlg).saving,
						onClick: submitEdit
					}, {
						default: withCtx(() => [..._cache[61] || (_cache[61] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: unref(form),
						"label-width": "96px",
						class: "ps-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("基本信息", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_13, [
								createVNode(_component_el_form_item, {
									label: "薪资月份",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).payMonth,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(form).payMonth = $event),
										placeholder: "如 2026-06"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "员工" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).employeeId,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(form).employeeId = $event),
										filterable: "",
										placeholder: "选择员工(用于员工自助查看)",
										style: { "width": "100%" },
										onChange: onEmpPick
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (c) => {
											return openBlock(), createBlock(_component_el_option, {
												key: c.id,
												label: c.name + (c.deptName ? " / " + c.deptName : ""),
												value: c.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "姓名" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).employeeName,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(form).employeeName = $event),
										placeholder: "员工姓名"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "部门" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).deptName,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(form).deptName = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "岗位" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).postName,
										"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(form).postName = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "身份证号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).idCard,
										"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(form).idCard = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "手机号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).phone,
										"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(form).phone = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "银行卡号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).bankCard,
										"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(form).bankCard = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "入职日期" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).entryDate,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(form).entryDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "转正日期" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).regularDate,
										"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(form).regularDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "离职日期" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).leaveDate,
										"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(form).leaveDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("考勤", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_14, [
								createVNode(_component_el_form_item, { label: "事假(天)" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).personalLeave,
										"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(form).personalLeave = $event),
										min: 0,
										precision: 1,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "病假(天)" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).sickLeave,
										"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(form).sickLeave = $event),
										min: 0,
										precision: 1,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "带薪假(天)" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).otherPaidLeave,
										"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(form).otherPaidLeave = $event),
										min: 0,
										precision: 1,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "出勤天数" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).actualAttendanceDays,
										"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(form).actualAttendanceDays = $event),
										min: 0,
										precision: 1,
										controls: false,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("收入", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_15, [
								createVNode(_component_el_form_item, { label: "基本工资" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).baseSalary,
										"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => unref(form).baseSalary = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "绩效工资" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).performanceSalary,
										"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => unref(form).performanceSalary = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "提成" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).commission,
										"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => unref(form).commission = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "奖金" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).bonus,
										"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => unref(form).bonus = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "补发" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).reissue,
										"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => unref(form).reissue = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("扣款", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_16, [
								createVNode(_component_el_form_item, { label: "社保扣款" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).socialInsuranceDeduct,
										"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => unref(form).socialInsuranceDeduct = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "公积金扣款" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).fundDeduct,
										"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => unref(form).fundDeduct = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "个税扣款" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).taxDeduct,
										"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => unref(form).taxDeduct = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "其他扣款" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: unref(form).otherDeduct,
										"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => unref(form).otherDeduct = $event),
										min: 0,
										precision: 2,
										controls: false,
										style: { "width": "100%" },
										onChange: recalc
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("实发", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_17, [createVNode(_component_el_form_item, { label: "实发工资" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: unref(form).netSalary,
									"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => unref(form).netSalary = $event),
									min: 0,
									precision: 2,
									controls: false,
									style: { "width": "100%" }
								}, null, 8, ["modelValue"]), createVNode(_component_el_button, {
									link: "",
									type: "primary",
									size: "small",
									onClick: _cache[33] || (_cache[33] = ($event) => recalc(true))
								}, {
									default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("按上方自动算", -1)])]),
									_: 1
								})]),
								_: 1
							}), createVNode(_component_el_form_item, {
								label: "备注",
								style: { "grid-column": "span 3" }
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(form).remark,
									"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => unref(form).remark = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							})])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: unref(importDlg).visible,
					"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => unref(importDlg).visible = $event),
					title: "批量导入工资条",
					width: "720px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[38] || (_cache[38] = ($event) => unref(importDlg).visible = false) }, {
							default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("取消", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, { onClick: parseImport }, {
							default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("解析预览", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "primary",
							loading: unref(importDlg).saving,
							disabled: !unref(importPreview).length,
							onClick: submitImport
						}, {
							default: withCtx(() => [createTextVNode("导入 " + toDisplayString(unref(importPreview).length ? "(" + unref(importPreview).length + "条)" : ""), 1)]),
							_: 1
						}, 8, ["loading", "disabled"])
					]),
					default: withCtx(() => [
						createVNode(_component_el_alert, {
							type: "info",
							closable: false,
							"show-icon": "",
							style: { "margin-bottom": "10px" },
							title: "从 Excel 复制整块单元格,直接粘贴到下方文本框(支持制表符/逗号分隔)。首行必须是表头。"
						}),
						_cache[65] || (_cache[65] = createBaseVNode("p", { class: "ps-tpl" }, [
							createTextVNode("列顺序(表头名需包含以下关键词即可):"),
							createBaseVNode("br"),
							createBaseVNode("code", null, "薪资月份 姓名 部门 岗位 身份证号 手机号 银行卡号 出勤天数 基本工资 绩效工资 提成 奖金 补发 社保扣款 公积金扣款 个税扣款 其他扣款 实发工资 备注")
						], -1)),
						createVNode(_component_el_input, {
							modelValue: unref(importText),
							"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => isRef(importText) ? importText.value = $event : null),
							type: "textarea",
							rows: 10,
							placeholder: "粘贴 Excel 数据(含表头行)"
						}, null, 8, ["modelValue"]),
						unref(importPreview).length ? (openBlock(), createElementBlock("div", _hoisted_18, [
							_cache[62] || (_cache[62] = createTextVNode("已解析 ", -1)),
							createBaseVNode("b", null, toDisplayString(unref(importPreview).length), 1),
							createTextVNode(" 条,例:" + toDisplayString(unref(importPreview)[0].employeeName) + " / " + toDisplayString(unref(importPreview)[0].payMonth) + " / 实发 " + toDisplayString(unref(importPreview)[0].netSalary), 1)
						])) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-6087266d"]]);
//#endregion
export { payslip_default as default };

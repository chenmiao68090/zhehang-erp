import { $ as createCommentVNode, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, dt as h, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, M as ElInputNumber, Nn as plus_default, Un as search_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, ur as upload_default, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { f as socialFundApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/social-fund.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "social-fund-page" };
var _hoisted_2 = { class: "sf-head" };
var _hoisted_3 = { class: "sf-actions" };
var _hoisted_4 = { class: "sf-stats" };
var _hoisted_5 = { class: "sf-stat" };
var _hoisted_6 = { class: "sf-stat" };
var _hoisted_7 = { class: "sf-stat" };
var _hoisted_8 = { class: "sf-stat" };
var _hoisted_9 = { class: "sf-filter" };
var _hoisted_10 = { class: "sf-grid" };
var _hoisted_11 = { class: "sf-grid" };
var _hoisted_12 = { class: "sf-grid" };
var _hoisted_13 = {
	key: 0,
	class: "sf-preview"
};
//#endregion
//#region src/views/hrm/social-fund.vue
var social_fund_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "social-fund",
	setup(__props) {
		const MoneyInput = defineComponent({
			props: {
				label: {
					type: String,
					required: true
				},
				modelValue: {
					type: Number,
					default: 0
				}
			},
			emits: ["update:modelValue"],
			setup(props, { emit }) {
				return () => h(ElFormItem, { label: props.label }, () => h(ElInputNumber, {
					modelValue: props.modelValue,
					"onUpdate:modelValue": (v) => emit("update:modelValue", v),
					min: 0,
					precision: 2,
					controls: false,
					style: "width: 100%"
				}));
			}
		});
		const todayMonth = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 7);
		const num = (v) => Number(v) || 0;
		const money = (v) => num(v).toLocaleString("zh-CN", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const socialCompany = (r) => num(r.pensionCompany) + num(r.unemploymentCompany) + num(r.workInjuryCompany) + num(r.medicalCompany);
		const socialPersonal = (r) => num(r.pensionPersonal) + num(r.unemploymentPersonal) + num(r.workInjuryPersonal) + num(r.medicalPersonal);
		const loading = ref(false);
		const rows = ref([]);
		const total = ref(0);
		const stats = reactive({});
		const employees = ref([]);
		const query = reactive({
			pageNum: 1,
			pageSize: 10,
			recordMonth: todayMonth(),
			employeeId: void 0,
			keyword: ""
		});
		function employeeLabel(e) {
			return `${e.name || e.employeeName || "-"}${e.deptName ? " / " + e.deptName : ""}`;
		}
		function loadEmployees() {
			return _loadEmployees.apply(this, arguments);
		}
		function _loadEmployees() {
			_loadEmployees = _asyncToGenerator(function* () {
				try {
					const res = yield employeeApi.list({
						pageNum: 1,
						pageSize: 500
					});
					const data = (res === null || res === void 0 ? void 0 : res.data) || res || {};
					employees.value = (data.records || data.list || []).filter((e) => {
						var _e$status;
						return Number((_e$status = e.status) !== null && _e$status !== void 0 ? _e$status : 1) !== 3;
					});
				} catch (_unused) {
					employees.value = [];
				}
			});
			return _loadEmployees.apply(this, arguments);
		}
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const res = yield socialFundApi.list({
						pageNum: query.pageNum,
						pageSize: query.pageSize,
						recordMonth: query.recordMonth || void 0,
						employeeId: query.employeeId || void 0,
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
				recordMonth: todayMonth(),
				employeeId: void 0,
				keyword: ""
			});
			load();
		}
		const emptyForm = () => ({
			recordMonth: query.recordMonth || todayMonth(),
			pensionCompany: 0,
			pensionPersonal: 0,
			unemploymentCompany: 0,
			unemploymentPersonal: 0,
			workInjuryCompany: 0,
			workInjuryPersonal: 0,
			medicalCompany: 0,
			medicalPersonal: 0,
			housingFundCompany: 0,
			housingFundPersonal: 0
		});
		const editDlg = reactive({
			visible: false,
			saving: false
		});
		const form = reactive(emptyForm());
		function openEdit(row) {
			Object.assign(form, emptyForm(), row ? JSON.parse(JSON.stringify(row)) : {});
			editDlg.visible = true;
		}
		function onEmployeePick(id) {
			const e = employees.value.find((x) => x.id === id);
			if (!e) return;
			form.employeeName = e.name;
			form.idCard = e.idCard;
			form.phone = e.phone;
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				if (!form.recordMonth) {
					ElMessage.warning("请选择月份");
					return;
				}
				if (!form.employeeName) {
					ElMessage.warning("请选择或填写员工");
					return;
				}
				editDlg.saving = true;
				try {
					yield socialFundApi.save(form);
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
		function remove(_x) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认删除 ${row.employeeName} ${row.recordMonth} 的社保公积金记录?`, "删除", { type: "warning" });
					yield socialFundApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "删除失败");
				}
			});
			return _remove.apply(this, arguments);
		}
		const importDlg = reactive({
			visible: false,
			saving: false
		});
		const importText = ref("");
		const importPreview = ref([]);
		const HEADS = [
			{
				keys: ["月份"],
				field: "recordMonth"
			},
			{
				keys: ["员工", "姓名"],
				field: "employeeName"
			},
			{
				keys: ["身份证"],
				field: "idCard"
			},
			{
				keys: ["手机号", "手机"],
				field: "phone"
			},
			{
				keys: ["养老公司"],
				field: "pensionCompany",
				num: true
			},
			{
				keys: ["养老个人"],
				field: "pensionPersonal",
				num: true
			},
			{
				keys: ["失业公司"],
				field: "unemploymentCompany",
				num: true
			},
			{
				keys: ["失业个人"],
				field: "unemploymentPersonal",
				num: true
			},
			{
				keys: ["工伤公司"],
				field: "workInjuryCompany",
				num: true
			},
			{
				keys: ["工伤个人"],
				field: "workInjuryPersonal",
				num: true
			},
			{
				keys: ["医疗公司"],
				field: "medicalCompany",
				num: true
			},
			{
				keys: ["医疗个人"],
				field: "medicalPersonal",
				num: true
			},
			{
				keys: ["社保首次"],
				field: "socialFirstMonth"
			},
			{
				keys: ["公积金公司"],
				field: "housingFundCompany",
				num: true
			},
			{
				keys: ["公积金个人"],
				field: "housingFundPersonal",
				num: true
			},
			{
				keys: ["公积金首次"],
				field: "fundFirstMonth"
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
			const lines = importText.value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
			if (lines.length < 2) {
				ElMessage.warning("至少需要表头和一行数据");
				return;
			}
			const fields = splitCells(lines[0]).map((h) => h.trim()).map((h) => HEADS.find((item) => item.keys.some((k) => h.includes(k))) || null);
			importPreview.value = lines.slice(1).map((line) => {
				const cells = splitCells(line);
				const item = {};
				fields.forEach((meta, idx) => {
					if (!meta) return;
					const raw = (cells[idx] || "").trim();
					item[meta.field] = meta.num ? num(raw.replace(/,/g, "")) : raw;
				});
				if (!item.recordMonth) item.recordMonth = query.recordMonth || todayMonth();
				return item;
			}).filter((item) => item.employeeName);
			ElMessage.success(`解析出 ${importPreview.value.length} 条`);
		}
		function submitImport() {
			return _submitImport.apply(this, arguments);
		}
		function _submitImport() {
			_submitImport = _asyncToGenerator(function* () {
				importDlg.saving = true;
				try {
					const n = yield socialFundApi.batchSave(importPreview.value);
					ElMessage.success(`已导入 ${n} 条`);
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
		onMounted(() => {
			loadEmployees();
			load();
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input = ElInput;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_divider = ElDivider;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_alert = ElAlert;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[32] || (_cache[32] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "sf-title" }, "社保公积金"), createBaseVNode("p", { class: "sf-sub" }, "按月维护员工社保、公积金公司部分与个人部分，支持批量粘贴导入、编辑和删除。")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: _cache[0] || (_cache[0] = ($event) => openEdit())
					}, {
						default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("新增明细", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(upload_default),
						onClick: openImport
					}, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("批量导入", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"])
				])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [_cache[33] || (_cache[33] = createBaseVNode("span", null, "本月社保参保人数", -1)), createBaseVNode("b", null, toDisplayString(unref(stats).socialPeople || 0), 1)]),
					createBaseVNode("div", _hoisted_6, [_cache[34] || (_cache[34] = createBaseVNode("span", null, "本月公积金缴纳人数", -1)), createBaseVNode("b", null, toDisplayString(unref(stats).fundPeople || 0), 1)]),
					createBaseVNode("div", _hoisted_7, [_cache[35] || (_cache[35] = createBaseVNode("span", null, "公司部分本月社保合计", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).socialCompanyTotal)), 1)]),
					createBaseVNode("div", _hoisted_8, [_cache[36] || (_cache[36] = createBaseVNode("span", null, "公司部分本月公积金合计", -1)), createBaseVNode("b", null, "¥" + toDisplayString(money(unref(stats).fundCompanyTotal)), 1)])
				]),
				createBaseVNode("div", _hoisted_9, [
					createVNode(_component_el_date_picker, {
						modelValue: unref(query).recordMonth,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(query).recordMonth = $event),
						type: "month",
						"value-format": "YYYY-MM",
						placeholder: "选择月份",
						style: { "width": "160px" },
						clearable: ""
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: unref(query).employeeId,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(query).employeeId = $event),
						filterable: "",
						clearable: "",
						placeholder: "员工",
						style: { "width": "180px" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (e) => {
							return openBlock(), createBlock(_component_el_option, {
								key: e.id,
								label: employeeLabel(e),
								value: e.id
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_input, {
						modelValue: unref(query).keyword,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(query).keyword = $event),
						placeholder: "姓名/身份证/手机号",
						clearable: "",
						style: { "width": "220px" },
						onKeyup: withKeys(load, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, { onClick: reset }, {
						default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("重置", -1)])]),
						_: 1
					})
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: unref(rows),
					border: "",
					stripe: "",
					size: "small",
					class: "sf-table",
					"max-height": "580"
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "暂无社保公积金记录",
						"image-size": 80
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "序号",
							type: "index",
							width: "56",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							prop: "recordMonth",
							label: "月份",
							width: "90",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							prop: "employeeName",
							label: "员工",
							width: "90",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "idCard",
							label: "身份证号",
							width: "170",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							prop: "phone",
							label: "手机号",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							label: "养老保险",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.pensionCompany)), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.pensionPersonal)), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "失业保险",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.unemploymentCompany)), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.unemploymentPersonal)), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "工伤保险",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.workInjuryCompany)), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.workInjuryPersonal)), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "医疗保险",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.medicalCompany)), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.medicalPersonal)), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "社保合计",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司部分",
								width: "100",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(socialCompany(row))), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人部分",
								width: "100",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(socialPersonal(row))), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "socialFirstMonth",
							label: "社保首次参保月份",
							width: "130",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "公积金",
							align: "center"
						}, {
							default: withCtx(() => [createVNode(_component_el_table_column, {
								label: "公司",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.housingFundCompany)), 1)]),
								_: 1
							}), createVNode(_component_el_table_column, {
								label: "个人",
								width: "88",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(money(row.housingFundPersonal)), 1)]),
								_: 1
							})]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "fundFirstMonth",
							label: "公积金首次缴纳月份",
							width: "140",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "130",
							fixed: "right",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								link: "",
								size: "small",
								type: "primary",
								onClick: ($event) => openEdit(row)
							}, {
								default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("编辑", -1)])]),
								_: 1
							}, 8, ["onClick"]), createVNode(_component_el_button, {
								link: "",
								size: "small",
								type: "danger",
								onClick: ($event) => remove(row)
							}, {
								default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("删除", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, unref(loading)]]),
				unref(total) > 0 ? (openBlock(), createBlock(_component_el_pagination, {
					key: 0,
					class: "sf-pager",
					background: "",
					layout: "total, sizes, prev, pager, next",
					"current-page": unref(query).pageNum,
					"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => unref(query).pageNum = $event),
					"page-size": unref(query).pageSize,
					"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => unref(query).pageSize = $event),
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
					"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => unref(editDlg).visible = $event),
					title: unref(form).id ? "编辑社保公积金" : "新增社保公积金",
					width: "880px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[24] || (_cache[24] = ($event) => unref(editDlg).visible = false) }, {
						default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: unref(editDlg).saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: unref(form),
						"label-width": "118px",
						class: "sf-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("基础信息", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_10, [
								createVNode(unref(ElFormItem), {
									label: "月份",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).recordMonth,
										"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(form).recordMonth = $event),
										type: "month",
										"value-format": "YYYY-MM",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), {
									label: "员工",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: unref(form).employeeId,
										"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(form).employeeId = $event),
										filterable: "",
										clearable: "",
										placeholder: "选择员工",
										style: { "width": "100%" },
										onChange: onEmployeePick
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (e) => {
											return openBlock(), createBlock(_component_el_option, {
												key: e.id,
												label: employeeLabel(e),
												value: e.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), {
									label: "员工姓名",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).employeeName,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(form).employeeName = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), { label: "身份证号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).idCard,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(form).idCard = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), { label: "手机号" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).phone,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(form).phone = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), { label: "备注" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: unref(form).remark,
										"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(form).remark = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("社保明细", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_11, [
								createVNode(unref(MoneyInput), {
									label: "养老公司",
									modelValue: unref(form).pensionCompany,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(form).pensionCompany = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "养老个人",
									modelValue: unref(form).pensionPersonal,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(form).pensionPersonal = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "失业公司",
									modelValue: unref(form).unemploymentCompany,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(form).unemploymentCompany = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "失业个人",
									modelValue: unref(form).unemploymentPersonal,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(form).unemploymentPersonal = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "工伤公司",
									modelValue: unref(form).workInjuryCompany,
									"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(form).workInjuryCompany = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "工伤个人",
									modelValue: unref(form).workInjuryPersonal,
									"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(form).workInjuryPersonal = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "医疗公司",
									modelValue: unref(form).medicalCompany,
									"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(form).medicalCompany = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "医疗个人",
									modelValue: unref(form).medicalPersonal,
									"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(form).medicalPersonal = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(ElFormItem), { label: "社保首次参保" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).socialFirstMonth,
										"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(form).socialFirstMonth = $event),
										type: "month",
										"value-format": "YYYY-MM",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("公积金", -1)])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_12, [
								createVNode(unref(MoneyInput), {
									label: "公积金公司",
									modelValue: unref(form).housingFundCompany,
									"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(form).housingFundCompany = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(MoneyInput), {
									label: "公积金个人",
									modelValue: unref(form).housingFundPersonal,
									"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(form).housingFundPersonal = $event)
								}, null, 8, ["modelValue"]),
								createVNode(unref(ElFormItem), { label: "首次缴纳月份" }, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: unref(form).fundFirstMonth,
										"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => unref(form).fundFirstMonth = $event),
										type: "month",
										"value-format": "YYYY-MM",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), { label: "社保公司合计" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										"model-value": money(socialCompany(unref(form))),
										readonly: ""
									}, null, 8, ["model-value"])]),
									_: 1
								}),
								createVNode(unref(ElFormItem), { label: "社保个人合计" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										"model-value": money(socialPersonal(unref(form))),
										readonly: ""
									}, null, 8, ["model-value"])]),
									_: 1
								})
							])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: unref(importDlg).visible,
					"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => unref(importDlg).visible = $event),
					title: "批量导入社保公积金",
					width: "760px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[27] || (_cache[27] = ($event) => unref(importDlg).visible = false) }, {
							default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("取消", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, { onClick: parseImport }, {
							default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("解析预览", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "primary",
							loading: unref(importDlg).saving,
							disabled: !unref(importPreview).length,
							onClick: submitImport
						}, {
							default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("导入", -1)])]),
							_: 1
						}, 8, ["loading", "disabled"])
					]),
					default: withCtx(() => [
						createVNode(_component_el_alert, {
							type: "info",
							closable: false,
							"show-icon": "",
							title: "从 Excel 复制含表头的数据粘贴到下方。表头包含关键词即可自动识别。"
						}),
						_cache[49] || (_cache[49] = createBaseVNode("p", { class: "sf-template" }, "建议表头：月份、员工、身份证号、手机号、养老公司、养老个人、失业公司、失业个人、工伤公司、工伤个人、医疗公司、医疗个人、社保首次参保月份、公积金公司、公积金个人、公积金首次缴纳月份、备注", -1)),
						createVNode(_component_el_input, {
							modelValue: unref(importText),
							"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => isRef(importText) ? importText.value = $event : null),
							type: "textarea",
							rows: 10,
							placeholder: "粘贴 Excel 内容"
						}, null, 8, ["modelValue"]),
						unref(importPreview).length ? (openBlock(), createElementBlock("div", _hoisted_13, "已解析 " + toDisplayString(unref(importPreview).length) + " 条，示例：" + toDisplayString(unref(importPreview)[0].employeeName) + " / " + toDisplayString(unref(importPreview)[0].recordMonth), 1)) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-3978ed61"]]);
//#endregion
export { social_fund_default as default };

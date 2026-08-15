import { $ as createCommentVNode, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Dr as withModifiers, Et as bell_default, F as ElEmpty, M as ElInputNumber, Nn as plus_default, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, ur as upload_default } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { i as laborContractApi } from "./hrm-x4tssCAy.js";
import { t as useFieldOptions } from "./useFieldOptions-Ck3wetP1.js";
//#region src/views/hrm/labor-contract.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "labor-contract" };
var _hoisted_2 = { class: "lc-head" };
var _hoisted_3 = { class: "lc-head-actions" };
var _hoisted_4 = { class: "lc-overview" };
var _hoisted_5 = { class: "ov-num" };
var _hoisted_6 = {
	class: "ov-num",
	style: { "color": "#67c23a" }
};
var _hoisted_7 = {
	class: "ov-num",
	style: { "color": "#f56c6c" }
};
var _hoisted_8 = {
	class: "ov-num",
	style: { "color": "#e6a23c" }
};
var _hoisted_9 = {
	class: "ov-num",
	style: { "color": "#909399" }
};
var _hoisted_10 = {
	key: 0,
	style: { "color": "#909399" }
};
var _hoisted_11 = { class: "lc-pager" };
//#endregion
//#region src/views/hrm/labor-contract.vue
var labor_contract_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "labor-contract",
	setup(__props) {
		const { options: contractTypeOptions, loading: contractTypeLoading, resolved: contractTypeResolved, defaultValue: contractTypeDefaultValue, withHistoricalValues: withContractTypeHistory, isSelectable: isContractTypeSelectable } = useFieldOptions("hr_labor_contract_type", [
			"固定期限",
			"无固定期限",
			"以完成一定工作为期限"
		]);
		const STATUS_OPTIONS = [
			{
				value: 1,
				label: "生效"
			},
			{
				value: 2,
				label: "即将到期"
			},
			{
				value: 3,
				label: "已到期"
			},
			{
				value: 4,
				label: "已终止"
			},
			{
				value: 5,
				label: "已续签"
			}
		];
		const loading = ref(false);
		const list = ref([]);
		const total = ref(0);
		const counts = reactive({
			all: 0,
			active: 0,
			expiring: 0,
			expired: 0,
			terminated: 0
		});
		const employees = ref([]);
		const endRange = ref(null);
		const query = reactive({
			pageNum: 1,
			pageSize: 10
		});
		const dlg = reactive({
			visible: false,
			saving: false,
			uploading: false,
			attachmentName: "",
			form: {}
		});
		const contractTypeEditOptions = computed(() => withContractTypeHistory(dlg.form.contractType));
		function applyContractTypeDefault() {
			if (!dlg.visible || dlg.form.id || dlg.form.contractType || !contractTypeResolved.value) return;
			dlg.form.contractType = contractTypeDefaultValue.value || void 0;
		}
		watch([contractTypeResolved, contractTypeDefaultValue], applyContractTypeDefault);
		function remainDays(endDate) {
			if (!endDate) return 0;
			const end = new Date(endDate);
			const today = /* @__PURE__ */ new Date();
			end.setHours(0, 0, 0, 0);
			today.setHours(0, 0, 0, 0);
			return Math.round((end.getTime() - today.getTime()) / 864e5);
		}
		function remainStyle(endDate) {
			return remainDays(endDate) <= 30 ? {
				color: "#f56c6c",
				fontWeight: 600
			} : {};
		}
		function statusText(s) {
			var _STATUS_OPTIONS$find;
			return ((_STATUS_OPTIONS$find = STATUS_OPTIONS.find((o) => o.value === s)) === null || _STATUS_OPTIONS$find === void 0 ? void 0 : _STATUS_OPTIONS$find.label) || "-";
		}
		function statusTag(s) {
			return {
				1: "success",
				2: "danger",
				3: "warning",
				4: "info",
				5: "primary"
			}[s !== null && s !== void 0 ? s : 0] || "info";
		}
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const params = {
						pageNum: query.pageNum,
						pageSize: query.pageSize
					};
					if (query.employeeId) params.employeeId = query.employeeId;
					if (query.contractType) params.contractType = query.contractType;
					if (query.status !== void 0) params.status = query.status;
					if (endRange.value && endRange.value.length === 2) {
						params.endFrom = endRange.value[0];
						params.endTo = endRange.value[1];
					}
					const res = yield laborContractApi.list(params);
					const page = (res === null || res === void 0 ? void 0 : res.page) || {};
					list.value = page.records || [];
					total.value = page.total || 0;
					const c = (res === null || res === void 0 ? void 0 : res.counts) || {};
					counts.all = c.all || 0;
					counts.active = c.active || 0;
					counts.expiring = c.expiring || 0;
					counts.expired = c.expired || 0;
					counts.terminated = c.terminated || 0;
				} catch (_unused) {
					list.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		function filterStatus(s) {
			query.status = s;
			query.pageNum = 1;
			load();
		}
		function reset() {
			query.employeeId = void 0;
			query.contractType = void 0;
			query.status = void 0;
			endRange.value = null;
			query.pageNum = 1;
			load();
		}
		function quickExpiring() {
			const today = /* @__PURE__ */ new Date();
			const later = new Date(today.getTime() + 30 * 864e5);
			const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			endRange.value = [fmt(today), fmt(later)];
			query.status = void 0;
			query.pageNum = 1;
			load();
		}
		function loadEmployees() {
			return _loadEmployees.apply(this, arguments);
		}
		function _loadEmployees() {
			_loadEmployees = _asyncToGenerator(function* () {
				try {
					employees.value = ((yield employeeApi.roster()) || []).filter((e) => e.status !== 3);
				} catch (_unused2) {
					employees.value = [];
				}
			});
			return _loadEmployees.apply(this, arguments);
		}
		function openEdit(row) {
			if (row) {
				dlg.form = _objectSpread2({}, row);
				dlg.attachmentName = row.attachmentFileId ? "已上传附件" : "";
			} else {
				dlg.form = { status: 1 };
				dlg.attachmentName = "";
			}
			dlg.visible = true;
			applyContractTypeDefault();
		}
		function onDlgClosed() {
			dlg.form = {};
			dlg.attachmentName = "";
			dlg.uploading = false;
		}
		function onEmpChange(id) {
			const e = employees.value.find((x) => x.id === id);
			if (e) {
				dlg.form.employeeName = e.name;
				dlg.form.deptName = e.deptName;
			}
		}
		function onUpload(_x) {
			return _onUpload.apply(this, arguments);
		}
		function _onUpload() {
			_onUpload = _asyncToGenerator(function* (file) {
				dlg.uploading = true;
				try {
					var _res$data;
					const res = yield fileInfoApi.upload(file);
					const d = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					dlg.form.attachmentFileId = d === null || d === void 0 ? void 0 : d.id;
					dlg.attachmentName = (d === null || d === void 0 ? void 0 : d.originalName) || (d === null || d === void 0 ? void 0 : d.fileName) || file.name;
					ElMessage.success("附件上传成功");
				} catch (_unused3) {
					ElMessage.error("附件上传失败");
				} finally {
					dlg.uploading = false;
				}
				return false;
			});
			return _onUpload.apply(this, arguments);
		}
		function clearAttachment() {
			dlg.form.attachmentFileId = void 0;
			dlg.attachmentName = "";
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				if (!contractTypeResolved.value) return ElMessage.warning("合同类型正在加载，请稍后保存");
				if (!dlg.form.employeeId) return ElMessage.warning("请选择员工");
				if (!dlg.form.contractType) return ElMessage.warning("请选择合同类型");
				if (!dlg.form.id && !isContractTypeSelectable(dlg.form.contractType)) return ElMessage.warning("所选合同类型已停用，请重新选择");
				dlg.saving = true;
				try {
					yield laborContractApi.save(dlg.form);
					ElMessage.success("保存成功");
					dlg.visible = false;
					load();
				} catch (_unused4) {} finally {
					dlg.saving = false;
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
					yield ElMessageBox.confirm(`确认删除员工「${row.employeeName || ""}」的这份劳动合同?`, "删除确认", { type: "warning" });
				} catch (_unused5) {
					return;
				}
				try {
					yield laborContractApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused6) {}
			});
			return _remove.apply(this, arguments);
		}
		function remind() {
			return _remind.apply(this, arguments);
		}
		function _remind() {
			_remind = _asyncToGenerator(function* () {
				try {
					yield ElMessageBox.confirm("将给未来 30 天内到期的合同员工本人发送到期提醒,是否继续?", "发送到期提醒", { type: "info" });
				} catch (_unused7) {
					return;
				}
				try {
					const n = yield laborContractApi.remindExpiring(30);
					ElMessage.success(`已发送 ${n !== null && n !== void 0 ? n : 0} 条到期提醒`);
				} catch (_unused8) {}
			});
			return _remind.apply(this, arguments);
		}
		onMounted(() => {
			load();
			loadEmployees();
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_input = ElInput;
			const _component_el_input_number = ElInputNumber;
			const _component_el_upload = ElUpload;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[26] || (_cache[26] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "lc-title" }, "劳动合同管理"), createBaseVNode("p", { class: "lc-sub" }, "登记员工劳动合同(编号/类型/起止/约定薪资/附件),按到期日跟进续签,并可主动提醒即将到期的员工。")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: _cache[0] || (_cache[0] = ($event) => openEdit())
					}, {
						default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("新增合同", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(bell_default),
						onClick: remind
					}, {
						default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("发送到期提醒", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						onClick: load
					}, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon"])
				])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).status === void 0 }]),
						onClick: _cache[1] || (_cache[1] = ($event) => filterStatus(void 0))
					}, [createBaseVNode("div", _hoisted_5, toDisplayString(unref(counts).all), 1), _cache[27] || (_cache[27] = createBaseVNode("div", { class: "ov-lbl" }, "全部", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).status === 1 }]),
						onClick: _cache[2] || (_cache[2] = ($event) => filterStatus(1))
					}, [createBaseVNode("div", _hoisted_6, toDisplayString(unref(counts).active), 1), _cache[28] || (_cache[28] = createBaseVNode("div", { class: "ov-lbl" }, "生效", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).status === 2 }]),
						onClick: _cache[3] || (_cache[3] = ($event) => filterStatus(2))
					}, [createBaseVNode("div", _hoisted_7, toDisplayString(unref(counts).expiring), 1), _cache[29] || (_cache[29] = createBaseVNode("div", { class: "ov-lbl" }, "即将到期", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).status === 3 }]),
						onClick: _cache[4] || (_cache[4] = ($event) => filterStatus(3))
					}, [createBaseVNode("div", _hoisted_8, toDisplayString(unref(counts).expired), 1), _cache[30] || (_cache[30] = createBaseVNode("div", { class: "ov-lbl" }, "已到期", -1))], 2),
					createBaseVNode("div", {
						class: normalizeClass(["ov-card", { active: unref(query).status === 4 }]),
						onClick: _cache[5] || (_cache[5] = ($event) => filterStatus(4))
					}, [createBaseVNode("div", _hoisted_9, toDisplayString(unref(counts).terminated), 1), _cache[31] || (_cache[31] = createBaseVNode("div", { class: "ov-lbl" }, "已终止", -1))], 2)
				]),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "lc-filter"
				}, {
					default: withCtx(() => [createVNode(_component_el_form, {
						inline: true,
						onSubmit: _cache[9] || (_cache[9] = withModifiers(() => {}, ["prevent"]))
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "员工" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(query).employeeId,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(query).employeeId = $event),
									filterable: "",
									clearable: "",
									placeholder: "全部员工",
									style: { "width": "180px" },
									onChange: load
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (e) => {
										return openBlock(), createBlock(_component_el_option, {
											key: e.id,
											label: e.name,
											value: e.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "合同类型" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(query).contractType,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(query).contractType = $event),
									clearable: "",
									loading: unref(contractTypeLoading),
									disabled: !unref(contractTypeResolved),
									placeholder: "全部类型",
									style: { "width": "200px" },
									onChange: load
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(contractTypeOptions), (t) => {
										return openBlock(), createBlock(_component_el_option, {
											key: t.value,
											label: t.label,
											value: t.value
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, [
									"modelValue",
									"loading",
									"disabled"
								])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "到期区间" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: unref(endRange),
									"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => isRef(endRange) ? endRange.value = $event : null),
									type: "daterange",
									"value-format": "YYYY-MM-DD",
									"range-separator": "至",
									"start-placeholder": "开始",
									"end-placeholder": "结束",
									style: { "width": "260px" },
									onChange: load
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, null, {
								default: withCtx(() => [
									createVNode(_component_el_button, {
										type: "primary",
										onClick: load
									}, {
										default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("查询", -1)])]),
										_: 1
									}),
									createVNode(_component_el_button, { onClick: reset }, {
										default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("重置", -1)])]),
										_: 1
									}),
									createVNode(_component_el_button, {
										link: "",
										type: "danger",
										onClick: quickExpiring
									}, {
										default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("即将到期(30天)", -1)])]),
										_: 1
									})
								]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}),
				createVNode(_component_el_card, {
					shadow: "never",
					class: "lc-table-card"
				}, {
					default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
						data: unref(list),
						border: "",
						stripe: ""
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "暂无劳动合同",
							"image-size": 80
						})]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								type: "index",
								label: "#",
								width: "55",
								align: "center"
							}),
							createVNode(_component_el_table_column, {
								label: "员工",
								prop: "employeeName",
								"min-width": "100"
							}),
							createVNode(_component_el_table_column, {
								label: "部门",
								prop: "deptName",
								"min-width": "120",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "合同编号",
								prop: "contractNo",
								"min-width": "140",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "合同类型",
								prop: "contractType",
								"min-width": "150",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "起止",
								"min-width": "200",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.startDate || "-") + " ~ " + toDisplayString(row.endDate || "长期"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "剩余天数",
								width: "110",
								align: "center"
							}, {
								default: withCtx(({ row }) => [!row.endDate ? (openBlock(), createElementBlock("span", _hoisted_10, "-")) : (openBlock(), createElementBlock("span", {
									key: 1,
									style: normalizeStyle(remainStyle(row.endDate))
								}, toDisplayString(remainDays(row.endDate)) + " 天", 5))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: statusTag(row.status),
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusText(row.status)), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "150",
								align: "center",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									size: "small",
									onClick: ($event) => openEdit(row)
								}, {
									default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									link: "",
									type: "danger",
									size: "small",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, unref(loading)]]), createBaseVNode("div", _hoisted_11, [createVNode(_component_el_pagination, {
						background: "",
						layout: "total, sizes, prev, pager, next",
						total: unref(total),
						"current-page": unref(query).pageNum,
						"page-size": unref(query).pageSize,
						"page-sizes": [
							10,
							20,
							50
						],
						onCurrentChange: _cache[10] || (_cache[10] = (p) => {
							unref(query).pageNum = p;
							load();
						}),
						onSizeChange: _cache[11] || (_cache[11] = (s) => {
							unref(query).pageSize = s;
							unref(query).pageNum = 1;
							load();
						})
					}, null, 8, [
						"total",
						"current-page",
						"page-size"
					])])]),
					_: 1
				}),
				createVNode(_component_el_dialog, {
					modelValue: unref(dlg).visible,
					"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(dlg).visible = $event),
					title: unref(dlg).form.id ? "编辑劳动合同" : "新增劳动合同",
					width: "620px",
					onClosed: onDlgClosed
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[21] || (_cache[21] = ($event) => unref(dlg).visible = false) }, {
						default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: unref(dlg).saving,
						disabled: !unref(contractTypeResolved),
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: unref(dlg).form,
						"label-width": "96px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "员工",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(dlg).form.employeeId,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(dlg).form.employeeId = $event),
									filterable: "",
									placeholder: "选择员工",
									style: { "width": "100%" },
									onChange: onEmpChange
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(employees), (e) => {
										return openBlock(), createBlock(_component_el_option, {
											key: e.id,
											label: e.name,
											value: e.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "合同编号" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(dlg).form.contractNo,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(dlg).form.contractNo = $event),
									placeholder: "合同编号"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "合同类型",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(dlg).form.contractType,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => unref(dlg).form.contractType = $event),
									loading: unref(contractTypeLoading),
									disabled: !unref(contractTypeResolved),
									placeholder: "选择合同类型",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(contractTypeEditOptions), (t) => {
										return openBlock(), createBlock(_component_el_option, {
											key: t.value,
											label: t.label,
											value: t.value,
											disabled: t.disabled
										}, null, 8, [
											"label",
											"value",
											"disabled"
										]);
									}), 128))]),
									_: 1
								}, 8, [
									"modelValue",
									"loading",
									"disabled"
								])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "签订日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: unref(dlg).form.signDate,
									"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => unref(dlg).form.signDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									placeholder: "签订日期",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "合同期限" }, {
								default: withCtx(() => [
									createVNode(_component_el_date_picker, {
										modelValue: unref(dlg).form.startDate,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(dlg).form.startDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										placeholder: "开始日期",
										style: { "width": "47%" }
									}, null, 8, ["modelValue"]),
									_cache[37] || (_cache[37] = createBaseVNode("span", { style: { "margin": "0 6px" } }, "~", -1)),
									createVNode(_component_el_date_picker, {
										modelValue: unref(dlg).form.endDate,
										"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(dlg).form.endDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										placeholder: "结束日期(无固定期限可空)",
										style: { "width": "47%" }
									}, null, 8, ["modelValue"])
								]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "状态" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: unref(dlg).form.status,
									"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(dlg).form.status = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(STATUS_OPTIONS, (s) => {
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
							createVNode(_component_el_form_item, { label: "约定薪资" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: unref(dlg).form.salaryAgreed,
									"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(dlg).form.salaryAgreed = $event),
									min: 0,
									precision: 2,
									controls: false,
									placeholder: "约定薪资(元)",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "合同附件" }, {
								default: withCtx(() => [createVNode(_component_el_upload, {
									"show-file-list": false,
									"before-upload": onUpload,
									disabled: unref(dlg).uploading
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										loading: unref(dlg).uploading,
										icon: unref(upload_default)
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(unref(dlg).attachmentName || "上传附件"), 1)]),
										_: 1
									}, 8, ["loading", "icon"])]),
									_: 1
								}, 8, ["disabled"]), unref(dlg).form.attachmentFileId ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "danger",
									style: { "margin-left": "8px" },
									onClick: clearAttachment
								}, {
									default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("移除", -1)])]),
									_: 1
								})) : createCommentVNode("", true)]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: unref(dlg).form.remark,
									"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(dlg).form.remark = $event),
									type: "textarea",
									rows: 2,
									placeholder: "备注"
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
}), [["__scopeId", "data-v-1dbbd41b"]]);
//#endregion
export { labor_contract_default as default };

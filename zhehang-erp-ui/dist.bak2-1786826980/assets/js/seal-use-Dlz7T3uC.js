import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { r as taskApi } from "./workflow-CeqrP-pL.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as sealUseApi } from "./admin-CReSJXAx.js";
//#region src/views/admin/seal-use.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-use" };
var _hoisted_2 = { class: "su-bar" };
//#endregion
//#region src/views/admin/seal-use.vue
var seal_use_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "seal-use",
	setup(__props) {
		const SEAL_TYPES = [
			"公章",
			"法人章",
			"财务章",
			"合同章"
		];
		const USE_POSITIONS = [
			"开头",
			"骑缝章",
			"落款",
			"其他"
		];
		const todayStr = () => {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		};
		const splitPos = (s) => s ? String(s).split(",").filter(Boolean) : [];
		const rows = ref([]);
		const loading = ref(false);
		const kw = ref("");
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield sealUseApi.list(kw.value || void 0);
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
		const viewMode = ref("all");
		const todoCount = computed(() => rows.value.filter((r) => r.userConfirm !== 1).length);
		const displayRows = computed(() => viewMode.value === "todo" ? rows.value.filter((r) => r.userConfirm !== 1) : rows.value);
		const confirmUse = function() {
			var _ref2 = _asyncToGenerator(function* (row) {
				try {
					yield sealUseApi.save(_objectSpread2(_objectSpread2({}, row), {}, { userConfirm: 1 }));
					ElMessage.success("已确认用印");
					load();
				} catch (_unused2) {
					ElMessage.error("确认失败");
				}
			});
			return function confirmUse(_x) {
				return _ref2.apply(this, arguments);
			};
		}();
		const dlg = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const posList = computed({
			get: () => splitPos(form.value.usePosition),
			set: (v) => {
				form.value.usePosition = (v || []).join(",");
			}
		});
		const genSerialNo = () => {
			const date = (form.value.useDate || todayStr()).replace(/-/g, "");
			const sameDay = rows.value.filter((r) => (r.serialNo || "").startsWith(date)).length;
			form.value.serialNo = `${date}${String(sameDay + 1).padStart(3, "0")}`;
		};
		const onDateChange = () => {
			if (!form.value.id && !form.value.serialNo) genSerialNo();
		};
		const openForm = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				useDate: todayStr(),
				serialNo: "",
				sealType: "",
				usePosition: "",
				pageCount: 0,
				userConfirm: 0
			};
			if (!row) genSerialNo();
			dlg.value = {
				visible: true,
				saving: false
			};
		};
		const submit = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!form.value.useDate) {
					ElMessage.warning("请选择用印日期");
					return;
				}
				if (!form.value.applicant) {
					ElMessage.warning("请填写申请人");
					return;
				}
				if (!form.value.sealType) {
					ElMessage.warning("请选择用印类型");
					return;
				}
				dlg.value.saving = true;
				try {
					yield sealUseApi.save(form.value);
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
					yield ElMessageBox.confirm(`删除用印登记「${row.serialNo || row.fileName || ""}」?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield sealUseApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x2) {
				return _ref4.apply(this, arguments);
			};
		}();
		const colleagues = ref([]);
		const loadColleagues = function() {
			var _ref5 = _asyncToGenerator(function* () {
				try {
					var _res$data2;
					const res = yield taskApi.colleagues();
					colleagues.value = ((_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) || [];
				} catch (_unused6) {
					colleagues.value = [];
				}
			});
			return function loadColleagues() {
				return _ref5.apply(this, arguments);
			};
		}();
		onMounted(() => {
			load();
			loadColleagues();
		});
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_input_number = ElInputNumber;
			const _component_el_switch = ElSwitch;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[26] || (_cache[26] = createBaseVNode("header", { class: "su-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "su-title" }, "印章登记"), createBaseVNode("p", { class: "su-sub" }, "用印申请闭环:登记用印日期、事由、用印类型与位置,并记录用印人是否确认。")])], -1)),
				createBaseVNode("div", _hoisted_2, [
					createVNode(_component_el_input, {
						modelValue: kw.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => kw.value = $event),
						class: "su-search",
						placeholder: "搜编号/申请人/文件/事由…",
						clearable: "",
						onKeyup: withKeys(load, ["enter"]),
						onClear: load
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_radio_group, {
						modelValue: viewMode.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => viewMode.value = $event)
					}, {
						default: withCtx(() => [createVNode(_component_el_radio_button, { value: "all" }, {
							default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("全部登记", -1)])]),
							_: 1
						}), createVNode(_component_el_radio_button, { value: "todo" }, {
							default: withCtx(() => [createTextVNode("待办·待确认" + toDisplayString(todoCount.value ? ` (${todoCount.value})` : ""), 1)]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[2] || (_cache[2] = ($event) => openForm())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[18] || (_cache[18] = createTextVNode(" 发起用印申请", -1))]),
						_: 1
					})
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: displayRows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有用印申请,点右上角「发起用印申请」开始",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[3] || (_cache[3] = ($event) => openForm())
						}, {
							default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("发起用印申请", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "用印日期",
							prop: "useDate",
							width: "110"
						}),
						createVNode(_component_el_table_column, {
							label: "编号",
							prop: "serialNo",
							width: "130",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "申请人",
							prop: "applicant",
							width: "90"
						}),
						createVNode(_component_el_table_column, {
							label: "用印类型",
							prop: "sealType",
							width: "100"
						}, {
							default: withCtx(({ row }) => [row.sealType ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.sealType), 1)]),
								_: 2
							}, 1024)) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "文件名称",
							prop: "fileName",
							"min-width": "150",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "用印事由",
							prop: "reason",
							"min-width": "160",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "用印位置",
							"min-width": "150"
						}, {
							default: withCtx(({ row }) => [(openBlock(true), createElementBlock(Fragment, null, renderList(splitPos(row.usePosition), (p) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: p,
									size: "small",
									type: "info",
									effect: "plain",
									style: { "margin-right": "4px" }
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(p), 1)]),
									_: 2
								}, 1024);
							}), 128))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "页数",
							prop: "pageCount",
							width: "70",
							align: "right"
						}),
						createVNode(_component_el_table_column, {
							label: "用印人确认",
							width: "100",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: row.userConfirm === 1 ? "success" : "warning"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.userConfirm === 1 ? "已确认" : "未确认"), 1)]),
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
								row.userConfirm !== 1 ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									link: "",
									type: "success",
									onClick: ($event) => confirmUse(row)
								}, {
									default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("确认", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									onClick: ($event) => openForm(row)
								}, {
									default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("删", -1)])]),
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
					"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => dlg.value.visible = $event),
					title: form.value.id ? "编辑用印登记" : "新增用印登记",
					width: "600px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[15] || (_cache[15] = ($event) => dlg.value.visible = false) }, {
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
						"label-width": "92px"
					}, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 14 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "用印日期",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.value.useDate,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.value.useDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											placeholder: "选择日期",
											style: { "width": "100%" },
											onChange: onDateChange
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "编号" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.serialNo,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.value.serialNo = $event),
											placeholder: "留空将按日期+序号生成"
										}, {
											append: withCtx(() => [createVNode(_component_el_button, { onClick: genSerialNo }, {
												default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("生成", -1)])]),
												_: 1
											})]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "申请人",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.applicant,
											"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.value.applicant = $event),
											filterable: "",
											"allow-create": "",
											"default-first-option": "",
											placeholder: "选择系统员工(也可直接输入)",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
												return openBlock(), createBlock(_component_el_option, {
													key: c.userId,
													label: c.deptName ? `${c.name}(${c.deptName})` : c.name,
													value: c.name
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "用印类型",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.sealType,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.sealType = $event),
											placeholder: "选择用印类型",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SEAL_TYPES, (t) => {
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
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "文件名称" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.fileName,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.fileName = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "用印事由" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.reason,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.reason = $event),
											type: "textarea",
											rows: 2
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "用印位置" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: posList.value,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => posList.value = $event),
											multiple: "",
											placeholder: "可多选",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(USE_POSITIONS, (p) => {
												return createVNode(_component_el_option, {
													key: p,
													label: p,
													value: p
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "用印页数" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.pageCount,
											"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.pageCount = $event),
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "用印人确认" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: form.value.userConfirm,
											"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.userConfirm = $event),
											"active-value": 1,
											"inactive-value": 0,
											"active-text": "已确认",
											"inactive-text": "未确认"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "文件附件" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.fileAttach,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.fileAttach = $event),
											placeholder: "附件URL/说明"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.remark,
											"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.remark = $event),
											type: "textarea",
											rows: 2
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						})]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-807ce77d"]]);
//#endregion
export { seal_use_default as default };

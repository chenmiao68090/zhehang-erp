import { $ as createCommentVNode, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, Er as withKeys, F as ElEmpty, H as ElDescriptions, U as ElDescriptionsItem, V as ElDialog, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { c as payslipApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/my-payslip.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "my-payslip" };
var _hoisted_2 = { class: "mp-head" };
var _hoisted_3 = { class: "mp-head-actions" };
var _hoisted_4 = { class: "mp-overview" };
var _hoisted_5 = { class: "ov-card" };
var _hoisted_6 = { class: "ov-num" };
var _hoisted_7 = { class: "ov-card" };
var _hoisted_8 = {
	class: "ov-num",
	style: { "color": "#67c23a" }
};
var _hoisted_9 = { class: "ov-card" };
var _hoisted_10 = {
	class: "ov-num",
	style: { "color": "#e6a23c" }
};
var _hoisted_11 = { style: { "color": "#409eff" } };
var _hoisted_12 = { style: {
	"color": "#409eff",
	"font-size": "15px"
} };
var _hoisted_13 = { style: { "color": "#f56c6c" } };
//#endregion
//#region src/views/hrm/my-payslip.vue
var my_payslip_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "my-payslip",
	setup(__props) {
		const STATUS_LABEL = {
			0: "待发放",
			1: "待确认",
			2: "已确认",
			3: "有异议"
		};
		const STATUS_TAG = {
			0: "info",
			1: "warning",
			2: "success",
			3: "danger"
		};
		const loading = ref(false);
		const rows = ref([]);
		const payMonth = ref("");
		const counts = reactive({
			all: 0,
			confirmed: 0,
			pending: 0
		});
		const fmt = (v) => v === null || v === void 0 || v === "" ? "0.00" : Number(v).toFixed(2);
		const totalDeduct = (r) => (Number(r.socialInsuranceDeduct) || 0) + (Number(r.fundDeduct) || 0) + (Number(r.taxDeduct) || 0) + (Number(r.otherDeduct) || 0);
		function load() {
			return _load.apply(this, arguments);
		}
		function _load() {
			_load = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const list = (yield payslipApi.my(payMonth.value || void 0)) || [];
					rows.value = list;
					counts.all = list.length;
					counts.confirmed = list.filter((x) => x.confirmStatus === 2).length;
					counts.pending = list.filter((x) => x.confirmStatus === 1).length;
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "加载失败");
				} finally {
					loading.value = false;
				}
			});
			return _load.apply(this, arguments);
		}
		const detailDlg = reactive({ visible: false });
		const cur = ref(null);
		function openDetail(row) {
			cur.value = row;
			detailDlg.visible = true;
		}
		function confirm(_x) {
			return _confirm.apply(this, arguments);
		}
		function _confirm() {
			_confirm = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确认 ${row.payMonth} 工资条无误?确认后视为签字。`, "签字确认", { type: "success" });
					yield payslipApi.confirm(row.id);
					ElMessage.success("已确认");
					detailDlg.visible = false;
					load();
				} catch (e) {
					if (e !== "cancel") ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "确认失败");
				}
			});
			return _confirm.apply(this, arguments);
		}
		const fbDlg = reactive({
			visible: false,
			saving: false
		});
		const fbContent = ref("");
		const fbRow = ref(null);
		function openFeedback(row) {
			fbRow.value = row;
			fbContent.value = "";
			fbDlg.visible = true;
		}
		function submitFeedback() {
			return _submitFeedback.apply(this, arguments);
		}
		function _submitFeedback() {
			_submitFeedback = _asyncToGenerator(function* () {
				if (!fbContent.value.trim()) {
					ElMessage.warning("请填写异议内容");
					return;
				}
				fbDlg.saving = true;
				try {
					yield payslipApi.feedback(fbRow.value.id, fbContent.value.trim());
					ElMessage.success("反馈已提交");
					fbDlg.visible = false;
					detailDlg.visible = false;
					load();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "提交失败");
				} finally {
					fbDlg.saving = false;
				}
			});
			return _submitFeedback.apply(this, arguments);
		}
		onMounted(load);
		return (_ctx, _cache) => {
			var _unref2;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_dialog = ElDialog;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[9] || (_cache[9] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "mp-title" }, "我的薪资"), createBaseVNode("p", { class: "mp-sub" }, "查看已发放的工资条明细,核对无误请「签字确认」,有疑问请「异常反馈」提交给 HR。")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_input, {
					modelValue: unref(payMonth),
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(payMonth) ? payMonth.value = $event : null),
					placeholder: "按月份筛选 如 2026-06",
					clearable: "",
					style: { "width": "180px" },
					onKeyup: withKeys(load, ["enter"]),
					onClear: load
				}, null, 8, ["modelValue"]), createVNode(_component_el_button, {
					icon: unref(refresh_default),
					onClick: load
				}, {
					default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("刷新", -1)])]),
					_: 1
				}, 8, ["icon"])])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createBaseVNode("div", _hoisted_6, toDisplayString(unref(counts).all), 1), _cache[10] || (_cache[10] = createBaseVNode("div", { class: "ov-lbl" }, "全部", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("div", _hoisted_8, toDisplayString(unref(counts).confirmed), 1), _cache[11] || (_cache[11] = createBaseVNode("div", { class: "ov-lbl" }, "已确认", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("div", _hoisted_10, toDisplayString(unref(counts).pending), 1), _cache[12] || (_cache[12] = createBaseVNode("div", { class: "ov-lbl" }, "待确认", -1))])
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: unref(rows),
					border: "",
					stripe: "",
					size: "small"
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "暂无已发放的工资条",
						"image-size": 80
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "月份",
							prop: "payMonth",
							width: "100",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "基本工资",
							prop: "baseSalary",
							width: "100",
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
							label: "扣款合计",
							width: "100",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmt(totalDeduct(row))), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "实发工资",
							prop: "netSalary",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_11, toDisplayString(fmt(row.netSalary)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "120",
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
							label: "操作",
							width: "220",
							align: "center",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "primary",
								onClick: ($event) => openDetail(row)
							}, {
								default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("查看详情", -1)])]),
								_: 1
							}, 8, ["onClick"]), row.confirmStatus === 1 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "success",
								onClick: ($event) => confirm(row)
							}, {
								default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("签字确认", -1)])]),
								_: 1
							}, 8, ["onClick"]), createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "danger",
								onClick: ($event) => openFeedback(row)
							}, {
								default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("异常反馈", -1)])]),
								_: 1
							}, 8, ["onClick"])], 64)) : createCommentVNode("", true)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, unref(loading)]]),
				createVNode(_component_el_dialog, {
					modelValue: unref(detailDlg).visible,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(detailDlg).visible = $event),
					title: `工资条详情 · ${((_unref2 = unref(cur)) === null || _unref2 === void 0 ? void 0 : _unref2.payMonth) || ""}`,
					width: "560px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => {
						var _unref3;
						return [createVNode(_component_el_button, { onClick: _cache[1] || (_cache[1] = ($event) => unref(detailDlg).visible = false) }, {
							default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("关闭", -1)])]),
							_: 1
						}), ((_unref3 = unref(cur)) === null || _unref3 === void 0 ? void 0 : _unref3.confirmStatus) === 1 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_button, {
							type: "danger",
							plain: "",
							onClick: _cache[2] || (_cache[2] = ($event) => openFeedback(unref(cur)))
						}, {
							default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("异常反馈", -1)])]),
							_: 1
						}), createVNode(_component_el_button, {
							type: "success",
							onClick: _cache[3] || (_cache[3] = ($event) => confirm(unref(cur)))
						}, {
							default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("签字确认", -1)])]),
							_: 1
						})], 64)) : createCommentVNode("", true)];
					}),
					default: withCtx(() => [unref(cur) ? (openBlock(), createBlock(_component_el_descriptions, {
						key: 0,
						column: 2,
						border: "",
						size: "small"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "月份" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(cur).payMonth), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "姓名" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(cur).employeeName), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "部门" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(cur).deptName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "岗位" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(cur).postName || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "出勤天数" }, {
								default: withCtx(() => {
									var _unref$actualAttendan;
									return [createTextVNode(toDisplayString((_unref$actualAttendan = unref(cur).actualAttendanceDays) !== null && _unref$actualAttendan !== void 0 ? _unref$actualAttendan : "-"), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "事假/病假" }, {
								default: withCtx(() => {
									var _unref$personalLeave, _unref$sickLeave;
									return [createTextVNode(toDisplayString((_unref$personalLeave = unref(cur).personalLeave) !== null && _unref$personalLeave !== void 0 ? _unref$personalLeave : 0) + " / " + toDisplayString((_unref$sickLeave = unref(cur).sickLeave) !== null && _unref$sickLeave !== void 0 ? _unref$sickLeave : 0), 1)];
								}),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "基本工资" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).baseSalary)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "绩效工资" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).performanceSalary)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "提成" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).commission)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "奖金" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).bonus)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "补发" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).reissue)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "社保扣款" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).socialInsuranceDeduct)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "公积金扣款" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).fundDeduct)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "个税扣款" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).taxDeduct)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "其他扣款" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(fmt(unref(cur).otherDeduct)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "实发工资" }, {
								default: withCtx(() => [createBaseVNode("b", _hoisted_12, toDisplayString(fmt(unref(cur).netSalary)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, {
								label: "备注",
								span: 2
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(unref(cur).remark || "-"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, {
								label: "状态",
								span: 2
							}, {
								default: withCtx(() => [createVNode(_component_el_tag, {
									size: "small",
									type: STATUS_TAG[unref(cur).confirmStatus] || "info",
									effect: "light"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(STATUS_LABEL[unref(cur).confirmStatus] || "-"), 1)]),
									_: 1
								}, 8, ["type"])]),
								_: 1
							}),
							unref(cur).confirmStatus === 3 ? (openBlock(), createBlock(_component_el_descriptions_item, {
								key: 0,
								label: "我的异议",
								span: 2
							}, {
								default: withCtx(() => [createBaseVNode("span", _hoisted_13, toDisplayString(unref(cur).feedback || "-"), 1)]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					})) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: unref(fbDlg).visible,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(fbDlg).visible = $event),
					title: "工资条异常反馈",
					width: "480px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[6] || (_cache[6] = ($event) => unref(fbDlg).visible = false) }, {
						default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						loading: unref(fbDlg).saving,
						onClick: submitFeedback
					}, {
						default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("提交反馈", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-width": "80px" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "异议内容",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: unref(fbContent),
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => isRef(fbContent) ? fbContent.value = $event : null),
								type: "textarea",
								rows: 4,
								placeholder: "请说明工资条中有疑问的项目及理由,HR 将核实处理"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-b7365fea"]]);
//#endregion
export { my_payslip_default as default };

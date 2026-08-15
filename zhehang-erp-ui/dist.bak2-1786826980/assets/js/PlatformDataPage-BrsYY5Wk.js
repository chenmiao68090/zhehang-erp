import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, M as ElInputNumber, V as ElDialog, W as ElDatePicker, _ as ElTableColumn, _t as ElFormItem, g as ElTable, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tn as edit_pen_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as opMetricApi } from "./operation-BdrTFFtn.js";
//#region src/views/operation/PlatformDataPage.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "pdp" };
var _hoisted_2 = { class: "pdp-head" };
var _hoisted_3 = { class: "pdp-title" };
var _hoisted_4 = { class: "pdp-sub" };
var _hoisted_5 = { class: "pdp-actions" };
var _hoisted_6 = { class: "pdp-block-head" };
var _hoisted_7 = { class: "pdp-block-title" };
var _hoisted_8 = {
	key: 0,
	class: "pdp-block-desc"
};
var _hoisted_9 = { class: "pdp-summary" };
var _hoisted_10 = { class: "pdp-slabel" };
var _hoisted_11 = { class: "pdp-scard latest" };
var _hoisted_12 = { class: "pdp-svalue small" };
var OVERVIEW = "overview";
//#endregion
//#region src/views/operation/PlatformDataPage.vue
var PlatformDataPage_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "PlatformDataPage",
	props: {
		platform: {},
		platformLabel: {},
		categories: {}
	},
	setup(__props) {
		const props = __props;
		const days = ref(30);
		const loading = ref(false);
		/** 各类别数据:catKey -> rows */
		const dataMap = ref({});
		/** overview 概览:固定四指标直接落实体列;其余类别的指标全部走 metrics JSON。 */
		const OVERVIEW_COLS = {
			views: "views",
			visits: "visits",
			inquiries: "inquiries",
			adCost: "adCost"
		};
		const loadCat = function() {
			var _ref = _asyncToGenerator(function* (cat) {
				var _res$data;
				const res = yield opMetricApi.recent({
					days: days.value,
					platform: props.platform,
					category: cat.key
				});
				const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
				dataMap.value[cat.key] = Array.isArray(data) ? data : [];
			});
			return function loadCat(_x) {
				return _ref.apply(this, arguments);
			};
		}();
		const loadAll = function() {
			var _ref2 = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					yield Promise.all(props.categories.map(loadCat));
				} catch (_unused) {
					props.categories.forEach((c) => dataMap.value[c.key] = []);
				} finally {
					loading.value = false;
				}
			});
			return function loadAll() {
				return _ref2.apply(this, arguments);
			};
		}();
		const rowsOf = (cat) => dataMap.value[cat.key] || [];
		const latestRow = (cat) => {
			const list = rowsOf(cat);
			if (!list.length) return void 0;
			return list.reduce((a, b) => a.statDate >= b.statDate ? a : b);
		};
		/** 解析某行某字段的值:overview 取实体列,其余从 metrics JSON 取 */
		const cellVal = (row, cat, fieldKey) => {
			if (cat.key === OVERVIEW && OVERVIEW_COLS[fieldKey]) return row[OVERVIEW_COLS[fieldKey]];
			return parseMetrics(row.metrics)[fieldKey];
		};
		const latestVal = (cat, fieldKey) => {
			const row = latestRow(cat);
			return row ? cellVal(row, cat, fieldKey) : void 0;
		};
		const parseMetrics = (raw) => {
			if (!raw) return {};
			try {
				const obj = JSON.parse(raw);
				return obj && typeof obj === "object" ? obj : {};
			} catch (_unused2) {
				return {};
			}
		};
		const todayStr = () => {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		};
		const entry = ref({
			visible: false,
			saving: false,
			cat: null,
			form: {
				platform: props.platform,
				statDate: "",
				remark: ""
			},
			values: {}
		});
		const entryTitle = computed(() => {
			const c = entry.value.cat;
			return `${entry.value.form.id ? "编辑" : "录入"}${c ? c.label : ""}`;
		});
		const openEntry = (cat, row) => {
			const values = {};
			cat.fields.forEach((f) => {
				values[f.key] = row ? cellVal(row, cat, f.key) : void 0;
			});
			entry.value = {
				visible: true,
				saving: false,
				cat,
				form: row ? _objectSpread2({}, row) : {
					platform: props.platform,
					category: cat.key,
					statDate: todayStr(),
					remark: ""
				},
				values
			};
		};
		const submitEntry = function() {
			var _ref3 = _asyncToGenerator(function* () {
				const cat = entry.value.cat;
				if (!cat) return;
				const f = entry.value.form;
				if (!f.statDate) {
					ElMessage.warning("请选择日期");
					return;
				}
				const payload = _objectSpread2(_objectSpread2({}, f), {}, {
					platform: props.platform,
					category: cat.key,
					source: f.source || "manual"
				});
				if (cat.key === OVERVIEW) cat.fields.forEach((fld) => {
					var _entry$value$values$f;
					const col = OVERVIEW_COLS[fld.key];
					if (col) payload[col] = (_entry$value$values$f = entry.value.values[fld.key]) !== null && _entry$value$values$f !== void 0 ? _entry$value$values$f : 0;
				});
				else {
					const kv = {};
					cat.fields.forEach((fld) => {
						var _entry$value$values$f2;
						kv[fld.key] = (_entry$value$values$f2 = entry.value.values[fld.key]) !== null && _entry$value$values$f2 !== void 0 ? _entry$value$values$f2 : 0;
					});
					payload.metrics = JSON.stringify(kv);
				}
				entry.value.saving = true;
				try {
					yield opMetricApi.save(payload);
					ElMessage.success("已保存");
					entry.value.visible = false;
					yield loadCat(cat);
				} catch (_unused3) {
					ElMessage.error("保存失败");
				} finally {
					entry.value.saving = false;
				}
			});
			return function submitEntry() {
				return _ref3.apply(this, arguments);
			};
		}();
		const fmtNum = (n) => n == null ? "—" : Number(n).toLocaleString();
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		onMounted(loadAll);
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form_item = ElFormItem;
			const _component_el_input_number = ElInputNumber;
			const _component_el_input = ElInput;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [createBaseVNode("div", null, [createBaseVNode("h2", _hoisted_3, toDisplayString(__props.platformLabel) + "数据", 1), createBaseVNode("p", _hoisted_4, [createVNode(_component_el_tag, {
					type: "warning",
					size: "small",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("平台不支持 API 接入", -1)])]),
					_: 1
				}), createTextVNode(" 以下为手动录入的真实运营数据,按分区分类记录。近 " + toDisplayString(days.value) + " 天明细。 ", 1)])]), createBaseVNode("div", _hoisted_5, [createVNode(_component_el_select, {
					modelValue: days.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => days.value = $event),
					size: "small",
					style: { "width": "120px" },
					onChange: loadAll
				}, {
					default: withCtx(() => [
						createVNode(_component_el_option, {
							value: 30,
							label: "近 30 天"
						}),
						createVNode(_component_el_option, {
							value: 90,
							label: "近 90 天"
						}),
						createVNode(_component_el_option, {
							value: 180,
							label: "近 180 天"
						})
					]),
					_: 1
				}, 8, ["modelValue"]), createVNode(_component_el_button, { onClick: loadAll }, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[6] || (_cache[6] = createTextVNode(" 刷新", -1))]),
					_: 1
				})])]),
				(openBlock(true), createElementBlock(Fragment, null, renderList(__props.categories, (cat) => {
					var _latestRow;
					return withDirectives((openBlock(), createElementBlock("section", {
						key: cat.key,
						class: "pdp-block"
					}, [
						createBaseVNode("div", _hoisted_6, [createBaseVNode("div", null, [createBaseVNode("h3", _hoisted_7, toDisplayString(cat.label), 1), cat.desc ? (openBlock(), createElementBlock("p", _hoisted_8, toDisplayString(cat.desc), 1)) : createCommentVNode("", true)]), createVNode(_component_el_button, {
							type: "primary",
							size: "small",
							onClick: ($event) => openEntry(cat)
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(edit_pen_default))]),
								_: 1
							}), createTextVNode(" 录入" + toDisplayString(cat.label), 1)]),
							_: 2
						}, 1032, ["onClick"])]),
						createBaseVNode("div", _hoisted_9, [(openBlock(true), createElementBlock(Fragment, null, renderList(cat.fields, (f) => {
							return openBlock(), createElementBlock("div", {
								key: f.key,
								class: "pdp-scard"
							}, [createBaseVNode("span", _hoisted_10, toDisplayString(f.label), 1), createBaseVNode("b", { class: normalizeClass(["pdp-svalue", { money: f.money }]) }, toDisplayString(f.money ? "¥" + fmtMoney(latestVal(cat, f.key)) : fmtNum(latestVal(cat, f.key))), 3)]);
						}), 128)), createBaseVNode("div", _hoisted_11, [_cache[7] || (_cache[7] = createBaseVNode("span", { class: "pdp-slabel" }, "数据日期", -1)), createBaseVNode("b", _hoisted_12, toDisplayString(((_latestRow = latestRow(cat)) === null || _latestRow === void 0 ? void 0 : _latestRow.statDate) || "暂无数据"), 1)])]),
						createVNode(_component_el_table, {
							data: rowsOf(cat),
							size: "small",
							"empty-text": "还没有数据,点右上角「录入」开始记录"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									label: "日期",
									prop: "statDate",
									width: "120",
									fixed: ""
								}),
								(openBlock(true), createElementBlock(Fragment, null, renderList(cat.fields, (f) => {
									return openBlock(), createBlock(_component_el_table_column, {
										key: f.key,
										label: f.label,
										align: "right",
										"min-width": "90"
									}, {
										default: withCtx(({ row }) => [createTextVNode(toDisplayString(f.money ? "¥" + fmtMoney(cellVal(row, cat, f.key)) : fmtNum(cellVal(row, cat, f.key))), 1)]),
										_: 2
									}, 1032, ["label"]);
								}), 128)),
								createVNode(_component_el_table_column, {
									label: "备注",
									prop: "remark",
									"min-width": "120",
									"show-overflow-tooltip": ""
								}),
								createVNode(_component_el_table_column, {
									label: "操作",
									width: "70",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_button, {
										size: "small",
										link: "",
										type: "primary",
										onClick: ($event) => openEntry(cat, row)
									}, {
										default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["onClick"])]),
									_: 2
								}, 1024)
							]),
							_: 2
						}, 1032, ["data"])
					])), [[_directive_loading, loading.value]]);
				}), 128)),
				createVNode(_component_el_dialog, {
					modelValue: entry.value.visible,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => entry.value.visible = $event),
					title: entryTitle.value,
					width: "480px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[3] || (_cache[3] = ($event) => entry.value.visible = false) }, {
						default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: entry.value.saving,
						onClick: submitEntry
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: entry.value.form,
						"label-width": "96px"
					}, {
						default: withCtx(() => {
							var _entry$value$cat;
							return [
								createVNode(_component_el_form_item, {
									label: "日期",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: entry.value.form.statDate,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => entry.value.form.statDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										placeholder: "选择日期",
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								(openBlock(true), createElementBlock(Fragment, null, renderList(((_entry$value$cat = entry.value.cat) === null || _entry$value$cat === void 0 ? void 0 : _entry$value$cat.fields) || [], (f) => {
									return openBlock(), createBlock(_component_el_form_item, {
										key: f.key,
										label: f.label
									}, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: entry.value.values[f.key],
											"onUpdate:modelValue": ($event) => entry.value.values[f.key] = $event,
											min: 0,
											precision: f.money ? 2 : 0,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"precision"
										])]),
										_: 2
									}, 1032, ["label"]);
								}), 128)),
								createVNode(_component_el_form_item, { label: "备注" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: entry.value.form.remark,
										"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => entry.value.form.remark = $event),
										placeholder: "可选"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							];
						}),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-1e70a434"]]);
//#endregion
export { PlatformDataPage_default as t };

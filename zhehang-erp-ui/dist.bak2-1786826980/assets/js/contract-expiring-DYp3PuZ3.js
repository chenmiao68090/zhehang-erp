import { Gt as isRef, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { F as ElEmpty, _ as ElTableColumn, g as ElTable, nt as ElOption, rt as ElSelect, s as vLoading, tt as ElCard } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
//#region src/views/hrm/contract-expiring.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "contract-expiring" };
var _hoisted_2 = { class: "ce-header" };
var _hoisted_3 = { class: "ce-header-filter" };
//#endregion
//#region src/views/hrm/contract-expiring.vue
var contract_expiring_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "contract-expiring",
	setup(__props) {
		const days = ref(30);
		const loading = ref(false);
		const list = ref([]);
		function remainDays(contractEnd) {
			if (!contractEnd) return 0;
			const end = new Date(contractEnd);
			const today = /* @__PURE__ */ new Date();
			end.setHours(0, 0, 0, 0);
			today.setHours(0, 0, 0, 0);
			return Math.round((end.getTime() - today.getTime()) / 864e5);
		}
		function remainStyle(contractEnd) {
			const d = remainDays(contractEnd);
			if (d <= 7) return {
				color: "#f56c6c",
				fontWeight: 600
			};
			if (d <= 15) return {
				color: "#e6a23c",
				fontWeight: 600
			};
			return {};
		}
		function loadData() {
			return _loadData.apply(this, arguments);
		}
		function _loadData() {
			_loadData = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _ref, _res$data;
					const res = yield employeeApi.contractExpiring(days.value);
					list.value = (_ref = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) !== null && _ref !== void 0 ? _ref : [];
				} catch (e) {
					list.value = [];
				} finally {
					loading.value = false;
				}
			});
			return _loadData.apply(this, arguments);
		}
		onMounted(loadData);
		return (_ctx, _cache) => {
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_card = ElCard;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("header", _hoisted_2, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "ce-header-main" }, [createBaseVNode("h1", { class: "ce-title" }, "合同到期提醒"), createBaseVNode("p", { class: "ce-desc" }, "列出劳动合同即将到期的在职员工,请 HR 及时跟进续签")], -1)), createBaseVNode("div", _hoisted_3, [_cache[1] || (_cache[1] = createBaseVNode("span", { class: "ce-filter-label" }, "到期范围", -1)), createVNode(_component_el_select, {
				modelValue: unref(days),
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(days) ? days.value = $event : null),
				style: { "width": "140px" },
				onChange: loadData
			}, {
				default: withCtx(() => [
					createVNode(_component_el_option, {
						value: 15,
						label: "15 天内"
					}),
					createVNode(_component_el_option, {
						value: 30,
						label: "30 天内"
					}),
					createVNode(_component_el_option, {
						value: 60,
						label: "60 天内"
					}),
					createVNode(_component_el_option, {
						value: 90,
						label: "90 天内"
					})
				]),
				_: 1
			}, 8, ["modelValue"])])]), createVNode(_component_el_card, {
				shadow: "never",
				class: "ce-card"
			}, {
				default: withCtx(() => [withDirectives((openBlock(), createBlock(_component_el_table, {
					data: unref(list),
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: `未来 ${unref(days)} 天内没有合同到期的在职员工`,
						"image-size": 80
					}, null, 8, ["description"])]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							type: "index",
							label: "#",
							width: "60",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "姓名",
							prop: "name",
							"min-width": "110"
						}),
						createVNode(_component_el_table_column, {
							label: "部门",
							"min-width": "140"
						}, {
							default: withCtx(({ row }) => {
								var _ref2, _row$deptName;
								return [createTextVNode(toDisplayString((_ref2 = (_row$deptName = row.deptName) !== null && _row$deptName !== void 0 ? _row$deptName : row.deptId) !== null && _ref2 !== void 0 ? _ref2 : "-"), 1)];
							}),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "岗位",
							"min-width": "140"
						}, {
							default: withCtx(({ row }) => {
								var _ref3, _row$postName;
								return [createTextVNode(toDisplayString((_ref3 = (_row$postName = row.postName) !== null && _row$postName !== void 0 ? _row$postName : row.postId) !== null && _ref3 !== void 0 ? _ref3 : "-"), 1)];
							}),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "合同开始",
							prop: "contractStart",
							width: "130",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "合同结束",
							prop: "contractEnd",
							width: "130",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "剩余天数",
							width: "120",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", { style: normalizeStyle(remainStyle(row.contractEnd)) }, toDisplayString(remainDays(row.contractEnd)) + " 天", 5)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, unref(loading)]])]),
				_: 1
			})]);
		};
	}
}), [["__scopeId", "data-v-2fd9ad06"]]);
//#endregion
export { contract_expiring_default as default };

import { Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, Un as search_default, W as ElDatePicker, _ as ElTableColumn, g as ElTable, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { i as sealOrderApi } from "./seal-ChbS7lCl.js";
//#region src/views/seal/new-sign.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-new-sign" };
var _hoisted_2 = { class: "sns-head" };
var _hoisted_3 = { class: "sns-actions" };
var _hoisted_4 = { class: "sns-stats" };
var _hoisted_5 = { class: "sns-stat" };
var _hoisted_6 = { class: "sns-stat-num" };
var _hoisted_7 = { class: "sns-stat sns-stat--money" };
var _hoisted_8 = { class: "sns-stat-num" };
var _hoisted_9 = { class: "sns-stat" };
var _hoisted_10 = { class: "sns-stat-num" };
var _hoisted_11 = { class: "sns-stat" };
var _hoisted_12 = { class: "sns-stat-num" };
var _hoisted_13 = { class: "sns-money" };
var _hoisted_14 = { class: "sns-remark" };
var _hoisted_15 = { class: "sns-pager" };
//#endregion
//#region src/views/seal/new-sign.vue
var new_sign_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "new-sign",
	setup(__props) {
		const todayMonth = () => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
		};
		const rows = ref([]);
		const loading = ref(false);
		const keyword = ref("");
		const monthFilter = ref(todayMonth());
		const pageNum = ref(1);
		const pageSize = ref(10);
		const rowMonth = (row) => {
			if (row.regDate && row.regDate.length >= 7) return row.regDate.slice(0, 7);
			if (row.billYear && row.billMonth) return `${row.billYear}-${String(row.billMonth).padStart(2, "0")}`;
			return "";
		};
		const filteredRows = computed(() => {
			const kw = keyword.value.trim();
			return rows.value.filter((r) => r.bizType === "new").filter((r) => !monthFilter.value || rowMonth(r) === monthFilter.value).filter((r) => !kw || `${r.companyName || ""}${r.ownerName || ""}`.includes(kw));
		});
		const pagedRows = computed(() => {
			const start = (pageNum.value - 1) * pageSize.value;
			return filteredRows.value.slice(start, start + pageSize.value);
		});
		const totalAmount = computed(() => filteredRows.value.reduce((sum, row) => sum + Number(row.fee || 0), 0));
		const ownerCount = computed(() => new Set(filteredRows.value.map((row) => row.ownerName).filter(Boolean)).size);
		watch([keyword, monthFilter], () => {
			pageNum.value = 1;
		});
		const unwrapPage = (res) => {
			var _res$data;
			const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
			return {
				list: (page === null || page === void 0 ? void 0 : page.records) || (page === null || page === void 0 ? void 0 : page.list) || [],
				total: Number((page === null || page === void 0 ? void 0 : page.total) || 0)
			};
		};
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const pageSizeAll = 500;
					const first = unwrapPage(yield sealOrderApi.list({
						pageNum: 1,
						pageSize: pageSizeAll
					}));
					const list = [...first.list];
					const total = first.total || list.length;
					for (let page = 2; list.length < total && page <= 10; page++) {
						const next = unwrapPage(yield sealOrderApi.list({
							pageNum: page,
							pageSize: pageSizeAll
						}));
						list.push(...next.list);
						if (!next.list.length) break;
					}
					rows.value = list;
				} catch (_unused) {
					rows.value = [];
					ElMessage.error("新签客户数据加载失败");
				} finally {
					loading.value = false;
				}
			});
			return function loadData() {
				return _ref.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
		};
		const fmtMoney = (n) => Number(n || 0).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const statusMap = {
			lack: "缺资料",
			recorded: "已备案",
			pending: "待刻章",
			engraved: "已刻制",
			mailed: "已邮寄",
			taken: "已取走",
			done: "已完成"
		};
		const statusLabel = (v) => statusMap[v || ""] || "待处理";
		const statusType = (v) => v === "done" ? "success" : v === "lack" ? "warning" : "info";
		const csvCell = (v) => `"${String(v !== null && v !== void 0 ? v : "").replace(/"/g, "\"\"")}"`;
		const exportCsv = () => {
			if (!filteredRows.value.length) {
				ElMessage.warning("当前没有可导出的新签数据");
				return;
			}
			const header = [
				"日期",
				"月份",
				"新签对接人",
				"公司名称",
				"收款总金额/新签当月",
				"收款方式",
				"状态",
				"备注"
			];
			const lines = filteredRows.value.map((row) => [
				row.regDate || "",
				rowMonth(row),
				row.ownerName || "",
				row.companyName || "",
				fmtMoney(row.fee),
				row.payMethod || "",
				statusLabel(row.status),
				row.remark || ""
			].map(csvCell).join(","));
			const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `新签客户数据-${monthFilter.value || "全部"}.csv`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			setTimeout(() => URL.revokeObjectURL(url), 300);
		};
		onMounted(loadData);
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[6] || (_cache[6] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "sns-title" }, "新签客户数据"), createBaseVNode("p", { class: "sns-sub" }, "来自「刻章业务提单」中新客户数据，按月份汇总新签收款。")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_date_picker, {
						modelValue: monthFilter.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => monthFilter.value = $event),
						type: "month",
						"value-format": "YYYY-MM",
						placeholder: "筛选月份",
						clearable: "",
						class: "sns-month"
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => keyword.value = $event),
						placeholder: "搜公司/对接人",
						clearable: "",
						class: "sns-search",
						onKeyup: withKeys(reload, ["enter"]),
						onClear: reload
					}, {
						prefix: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						loading: loading.value,
						onClick: loadData
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(refresh_default))]),
							_: 1
						}), _cache[4] || (_cache[4] = createTextVNode(" 刷新", -1))]),
						_: 1
					}, 8, ["loading"]),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: exportCsv
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(download_default))]),
							_: 1
						}), _cache[5] || (_cache[5] = createTextVNode(" 导出表格", -1))]),
						_: 1
					})
				])]),
				createBaseVNode("section", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(filteredRows.value.length), 1), _cache[7] || (_cache[7] = createBaseVNode("span", { class: "sns-stat-label" }, "新签个数", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, "¥" + toDisplayString(fmtMoney(totalAmount.value)), 1), _cache[8] || (_cache[8] = createBaseVNode("span", { class: "sns-stat-label" }, "收款总金额/新签当月", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, toDisplayString(monthFilter.value || "全部"), 1), _cache[9] || (_cache[9] = createBaseVNode("span", { class: "sns-stat-label" }, "当前月份", -1))]),
					createBaseVNode("div", _hoisted_11, [createBaseVNode("span", _hoisted_12, toDisplayString(ownerCount.value), 1), _cache[10] || (_cache[10] = createBaseVNode("span", { class: "sns-stat-label" }, "新签对接人数", -1))])
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: pagedRows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "当前筛选条件下暂无新签客户数据",
						"image-size": 80
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "日期",
							prop: "regDate",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							label: "月份",
							width: "110"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(rowMonth(row) || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "新签对接人",
							"min-width": "140"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.ownerName || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "公司名称",
							prop: "companyName",
							"min-width": "230",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "收款总金额/新签当月",
							width: "180",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_13, "¥" + toDisplayString(fmtMoney(row.fee)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "收款方式",
							prop: "payMethod",
							"min-width": "160",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "100",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: statusType(row.status),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备注",
							"min-width": "220"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_14, toDisplayString(row.remark || "—"), 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_15, [createVNode(_component_el_pagination, {
					"current-page": pageNum.value,
					"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => pageNum.value = $event),
					"page-size": pageSize.value,
					"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => pageSize.value = $event),
					total: filteredRows.value.length,
					"page-sizes": [
						10,
						20,
						50,
						100
					],
					layout: "total, sizes, prev, pager, next, jumper"
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])
			]);
		};
	}
}), [["__scopeId", "data-v-82df2b35"]]);
//#endregion
export { new_sign_default as default };

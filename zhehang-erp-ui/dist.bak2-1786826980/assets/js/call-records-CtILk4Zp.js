import { Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, Er as withKeys, F as ElEmpty, Un as search_default, _ as ElTableColumn, g as ElTable, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as callRecordingStreamUrl, t as callRecordApi } from "./call-record-vMQDzD4r.js";
//#region src/views/customer/call-records.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "cr" };
var _hoisted_2 = { class: "cr-head" };
var _hoisted_3 = { class: "cr-actions" };
var _hoisted_4 = { class: "cr-stats" };
var _hoisted_5 = { class: "cr-stat" };
var _hoisted_6 = { class: "cr-num" };
var _hoisted_7 = { class: "cr-stat" };
var _hoisted_8 = { class: "cr-num" };
var _hoisted_9 = { class: "cr-stat" };
var _hoisted_10 = { class: "cr-num" };
var _hoisted_11 = { class: "cr-stat" };
var _hoisted_12 = { class: "cr-num sm" };
var _hoisted_13 = { class: "cr-toolbar" };
var _hoisted_14 = { class: "cr-dur" };
var _hoisted_15 = ["src"];
var _hoisted_16 = {
	key: 2,
	class: "cr-muted"
};
var _hoisted_17 = { class: "cr-pager" };
//#endregion
//#region src/views/customer/call-records.vue
var call_records_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "call-records",
	setup(__props) {
		const fmtTime = (t) => t ? String(t).replace("T", " ").slice(0, 16) : "—";
		const fmtDur = (s) => {
			if (!s || s <= 0) return "00:00";
			const m = Math.floor(s / 60);
			const x = s % 60;
			return String(m).padStart(2, "0") + ":" + String(x).padStart(2, "0");
		};
		const rows = ref([]);
		const loading = ref(false);
		const syncing = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(20);
		const keyword = ref("");
		const stats = ref({});
		const playingRecordId = ref(null);
		const secureAudioSrc = ref("");
		const playRecording = function() {
			var _ref = _asyncToGenerator(function* (row) {
				if (!row.id) return;
				try {
					var _res$data;
					const res = yield callRecordApi.recordingTicket(row.id);
					const ticket = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					playingRecordId.value = row.id;
					secureAudioSrc.value = callRecordingStreamUrl(row.id, ticket.token);
				} catch (_unused) {
					ElMessage.warning("当前录音无权访问或暂时不可用");
				}
			});
			return function playRecording(_x) {
				return _ref.apply(this, arguments);
			};
		}();
		const loadData = function() {
			var _ref2 = _asyncToGenerator(function* () {
				playingRecordId.value = null;
				secureAudioSrc.value = "";
				loading.value = true;
				try {
					var _res$data2, _page$total;
					const res = yield callRecordApi.syncList({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value || void 0
					});
					const page = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					rows.value = (page === null || page === void 0 ? void 0 : page.records) || [];
					total.value = Number((_page$total = page === null || page === void 0 ? void 0 : page.total) !== null && _page$total !== void 0 ? _page$total : 0);
				} catch (_unused2) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
				loadStats();
			});
			return function loadData() {
				return _ref2.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
			loadData();
		};
		const loadStats = function() {
			var _ref3 = _asyncToGenerator(function* () {
				try {
					var _res$data3;
					const res = yield callRecordApi.syncStats();
					stats.value = ((_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res) || {};
				} catch (_unused3) {}
			});
			return function loadStats() {
				return _ref3.apply(this, arguments);
			};
		}();
		const syncNow = function() {
			var _ref4 = _asyncToGenerator(function* () {
				syncing.value = true;
				try {
					var _res$data4;
					const res = yield callRecordApi.syncYunkeFailed(20);
					const data = ((_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) || {};
					const changed = Number(data.inserted || 0) + Number(data.updated || 0);
					const remain = Number(data.yunkeTotal || 0);
					if (changed > 0) ElMessage.success(`已补同步 ${changed} 条,云客队列约剩 ${remain} 条`);
					else ElMessage.info("本次没有新的通话记录");
					reload();
				} finally {
					syncing.value = false;
				}
			});
			return function syncNow() {
				return _ref4.apply(this, arguments);
			};
		}();
		onMounted(loadData);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_tag = ElTag;
			const _component_el_table_column = ElTableColumn;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[5] || (_cache[5] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "cr-title" }, "通话记录"), createBaseVNode("p", { class: "cr-sub" }, "系统按云客配置主动同步工作手机通话，通话时长和录音一并进入系统，也可随时手动补拉。")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
					type: "primary",
					loading: syncing.value,
					onClick: syncNow
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[3] || (_cache[3] = createTextVNode(" 立即同步", -1))]),
					_: 1
				}, 8, ["loading"]), createVNode(_component_el_button, {
					onClick: reload,
					plain: ""
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[4] || (_cache[4] = createTextVNode(" 刷新", -1))]),
					_: 1
				})])]),
				createBaseVNode("div", _hoisted_4, [
					createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(stats.value.total || 0), 1), _cache[6] || (_cache[6] = createBaseVNode("span", { class: "cr-lbl" }, "通话总数", -1))]),
					createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(stats.value.todayCount || 0), 1), _cache[7] || (_cache[7] = createBaseVNode("span", { class: "cr-lbl" }, "今日通话", -1))]),
					createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, [createTextVNode(toDisplayString(stats.value.connectRate || 0), 1), _cache[8] || (_cache[8] = createBaseVNode("i", null, "%", -1))]), _cache[9] || (_cache[9] = createBaseVNode("span", { class: "cr-lbl" }, "接通率", -1))]),
					createBaseVNode("div", _hoisted_11, [createBaseVNode("span", _hoisted_12, toDisplayString(stats.value.totalDurationText || "0m 0s"), 1), _cache[10] || (_cache[10] = createBaseVNode("span", { class: "cr-lbl" }, "总通话时长", -1))])
				]),
				createBaseVNode("div", _hoisted_13, [createVNode(_component_el_input, {
					modelValue: keyword.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
					class: "cr-search",
					placeholder: "搜客户号码 / 坐席",
					clearable: "",
					onKeyup: withKeys(reload, ["enter"]),
					onClear: reload
				}, null, 8, ["modelValue"]), createVNode(_component_el_button, { onClick: reload }, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(search_default))]),
						_: 1
					}), _cache[11] || (_cache[11] = createTextVNode(" 查询", -1))]),
					_: 1
				})]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有同步到通话记录",
						"image-size": 80
					}, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createBaseVNode("p", { class: "cr-empty-tip" }, [
							createTextVNode("系统会按"),
							createBaseVNode("b", null, "「云客对接配置」"),
							createTextVNode("主动同步话单，也可点击右上角"),
							createBaseVNode("b", null, "「立即同步」"),
							createTextVNode("补拉未同步记录。若仍无数据，请检查云客配置和员工云客关联。")
						], -1)])]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "方向/结果",
							width: "132"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: row.connected === 1 ? "success" : "info",
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.result || "—"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "客户号码",
							"min-width": "140",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.phone || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "坐席/员工",
							width: "130",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.agentName || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "通话时长",
							width: "98",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_14, toDisplayString(fmtDur(row.duration)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "接通",
							width: "72",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: row.connected === 1 ? "success" : "danger",
								size: "small",
								effect: "dark"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.connected === 1 ? "接通" : "未接"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "通话时间",
							width: "158"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtTime(row.callTime)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "录音",
							"min-width": "250"
						}, {
							default: withCtx(({ row }) => [playingRecordId.value === row.id && secureAudioSrc.value ? (openBlock(), createElementBlock("audio", {
								key: 0,
								src: secureAudioSrc.value,
								controls: "",
								autoplay: "",
								controlslist: "nodownload",
								preload: "metadata",
								class: "cr-audio"
							}, null, 8, _hoisted_15)) : row.recordingAvailable ? (openBlock(), createBlock(_component_el_button, {
								key: 1,
								link: "",
								type: "primary",
								onClick: ($event) => playRecording(row)
							}, {
								default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("播放录音", -1)])]),
								_: 1
							}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_16, "无录音"))]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_17, [createVNode(_component_el_pagination, {
					"current-page": pageNum.value,
					"onUpdate:currentPage": _cache[1] || (_cache[1] = ($event) => pageNum.value = $event),
					"page-size": pageSize.value,
					"onUpdate:pageSize": _cache[2] || (_cache[2] = ($event) => pageSize.value = $event),
					total: total.value,
					"page-sizes": [
						20,
						50,
						100
					],
					layout: "total, sizes, prev, pager, next, jumper",
					onCurrentChange: loadData,
					onSizeChange: reload
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])
			]);
		};
	}
}), [["__scopeId", "data-v-b3c7aeb4"]]);
//#endregion
export { call_records_default as default };

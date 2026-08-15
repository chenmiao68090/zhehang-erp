import { $ as createCommentVNode, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, F as ElEmpty, W as ElDatePicker, _ as ElTableColumn, g as ElTable, it as ElTag, nt as ElOption, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as callRecordingExternalStreamUrl } from "./call-record-vMQDzD4r.js";
import { t as yunkeApi } from "./yunke-DhOFgmEW.js";
//#region src/views/customer/wechat-voice.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "wv" };
var _hoisted_2 = { class: "wv-head" };
var _hoisted_3 = { class: "wv-filter" };
var _hoisted_4 = {
	key: 0,
	class: "wv-stat"
};
var _hoisted_5 = { class: "wv-name" };
var _hoisted_6 = { class: "wv-sub2" };
var _hoisted_7 = { class: "wv-sub2" };
var _hoisted_8 = ["src"];
var _hoisted_9 = {
	key: 1,
	class: "wv-na"
};
var _hoisted_10 = {
	key: 2,
	class: "wv-na"
};
var _hoisted_11 = { class: "wv-pager" };
//#endregion
//#region src/views/customer/wechat-voice.vue
var wechat_voice_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "wechat-voice",
	setup(__props) {
		const rows = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(50);
		const range = ref([]);
		const callType = ref("");
		const isSend = ref("");
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _range$value, _res$data, _d$total;
					const params = {
						pageNum: pageNum.value,
						pageSize: pageSize.value
					};
					if (((_range$value = range.value) === null || _range$value === void 0 ? void 0 : _range$value.length) === 2) {
						params.beginYmd = range.value[0];
						params.endYmd = range.value[1];
					}
					if (callType.value !== "") params.callType = callType.value;
					if (isSend.value !== "") params.isSend = isSend.value;
					const res = yield yunkeApi.voiceList(params);
					const d = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (d === null || d === void 0 ? void 0 : d.list) || [];
					total.value = Number((_d$total = d === null || d === void 0 ? void 0 : d.total) !== null && _d$total !== void 0 ? _d$total : 0);
				} catch (_unused) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
			load();
		};
		const recordingUrl = (token) => callRecordingExternalStreamUrl(token);
		const fmtDur = (dur, secs) => {
			const s = Number(secs !== null && secs !== void 0 ? secs : dur);
			if (!s || isNaN(s)) return dur || "—";
			const m = Math.floor(s / 60);
			return m > 0 ? `${m}分${s % 60}秒` : `${s}秒`;
		};
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[6] || (_cache[6] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "wv-title" }, "微信语音通话"), createBaseVNode("p", { class: "wv-sub" }, "销售和客户的微信语音/视频通话记录,含通话时长和录音,从云客实时拉取。")], -1)), createVNode(_component_el_button, {
					onClick: load,
					plain: "",
					loading: loading.value
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[5] || (_cache[5] = createTextVNode(" 刷新", -1))]),
					_: 1
				}, 8, ["loading"])]),
				createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_date_picker, {
						modelValue: range.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => range.value = $event),
						type: "daterange",
						"range-separator": "至",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						"value-format": "YYYY-MM-DD",
						class: "f-date",
						onChange: reload
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: callType.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => callType.value = $event),
						placeholder: "全部类型",
						clearable: "",
						class: "f-sel",
						onChange: reload
					}, {
						default: withCtx(() => [createVNode(_component_el_option, {
							label: "语音通话",
							value: 1
						}), createVNode(_component_el_option, {
							label: "视频通话",
							value: 2
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: isSend.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => isSend.value = $event),
						placeholder: "全部方向",
						clearable: "",
						class: "f-sel",
						onChange: reload
					}, {
						default: withCtx(() => [createVNode(_component_el_option, {
							label: "呼出",
							value: 1
						}), createVNode(_component_el_option, {
							label: "呼入",
							value: 0
						})]),
						_: 1
					}, 8, ["modelValue"]),
					total.value ? (openBlock(), createElementBlock("span", _hoisted_4, "共 " + toDisplayString(total.value) + " 通", 1)) : createCommentVNode("", true)
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: loading.value ? "正在从云客拉取…" : "该时段暂无语音通话(确认云客对接配置已保存)",
						"image-size": 80
					}, null, 8, ["description"])]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "员工",
							"min-width": "150"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_5, toDisplayString(row.userName || "—"), 1), createBaseVNode("div", _hoisted_6, toDisplayString(row.userWeChatNickName || row.userWeChatAlias || ""), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "对方(好友)",
							"min-width": "150"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.talkerNickName || "—"), 1), createBaseVNode("div", _hoisted_7, toDisplayString(row.talkerAlias || ""), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "类型",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: row.callType == 2 ? "warning" : "primary",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.callType == 2 ? "视频" : "语音"), 1)]),
								_: 2
							}, 1032, ["type"]), row.isRoom == 1 ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								type: "info",
								effect: "plain",
								style: { "margin-left": "4px" }
							}, {
								default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("群", -1)])]),
								_: 1
							})) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "方向",
							width: "80",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.isSend == 1 ? "呼出" : "呼入"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: row.callStatus == 1 ? "success" : "danger",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.callStatus == 1 ? "接通" : "未接"), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "时长",
							width: "90",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(fmtDur(row.duration, row.durationFile)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "录音",
							width: "230"
						}, {
							default: withCtx(({ row }) => [row.recordingToken ? (openBlock(), createElementBlock("audio", {
								key: 0,
								src: recordingUrl(row.recordingToken),
								controls: "",
								class: "wv-audio",
								preload: "none"
							}, null, 8, _hoisted_8)) : row.recordingStatus === "unavailable" ? (openBlock(), createElementBlock("span", _hoisted_9, "录音服务暂不可用")) : (openBlock(), createElementBlock("span", _hoisted_10, "暂无录音"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "通话时间",
							width: "160"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.startTime || "—"), 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createBaseVNode("div", _hoisted_11, [createVNode(_component_el_pagination, {
					"current-page": pageNum.value,
					"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => pageNum.value = $event),
					"page-size": pageSize.value,
					"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => pageSize.value = $event),
					total: total.value,
					"page-sizes": [
						50,
						100,
						200
					],
					layout: "total, sizes, prev, pager, next",
					onCurrentChange: load,
					onSizeChange: reload
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])
			]);
		};
	}
}), [["__scopeId", "data-v-c4754f0d"]]);
//#endregion
export { wechat_voice_default as default };

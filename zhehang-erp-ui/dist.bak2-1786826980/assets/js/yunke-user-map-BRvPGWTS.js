import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, _ as ElTableColumn, g as ElTable, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as yunkeApi } from "./yunke-DhOFgmEW.js";
//#region src/views/customer/yunke-user-map.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "yum" };
var _hoisted_2 = { class: "yum-head" };
var _hoisted_3 = { class: "yum-toolbar" };
var _hoisted_4 = { class: "yum-stat" };
var _hoisted_5 = { class: "emp-name" };
var _hoisted_6 = { class: "yum-sub2" };
var _hoisted_7 = { class: "ok" };
var _hoisted_8 = { class: "bad" };
var _hoisted_9 = {
	key: 0,
	class: "yum-errs"
};
var _hoisted_10 = {
	key: 1,
	class: "yum-tip"
};
//#endregion
//#region src/views/customer/yunke-user-map.vue
var yunke_user_map_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "yunke-user-map",
	setup(__props) {
		const loading = ref(false);
		const enabling = ref(false);
		const rows = ref([]);
		const accounts = ref([]);
		const selected = ref([]);
		const keyword = ref("");
		const lastResult = ref(null);
		const enabledCount = computed(() => rows.value.filter((r) => r.enabled).length);
		const filteredRows = computed(() => {
			const k = keyword.value.trim();
			if (!k) return rows.value;
			return rows.value.filter((r) => (r.name || "").includes(k));
		});
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					let users = [];
					try {
						var _uRes$data;
						const uRes = yield yunkeApi.staffCandidates();
						const d = (_uRes$data = uRes === null || uRes === void 0 ? void 0 : uRes.data) !== null && _uRes$data !== void 0 ? _uRes$data : uRes;
						users = Array.isArray(d) ? d : (d === null || d === void 0 ? void 0 : d.records) || (d === null || d === void 0 ? void 0 : d.list) || [];
					} catch (_unused) {
						ElMessage.error("员工列表加载失败,请重试");
					}
					try {
						var _aRes$data;
						const aRes = yield yunkeApi.yunkeMembers();
						accounts.value = ((_aRes$data = aRes === null || aRes === void 0 ? void 0 : aRes.data) !== null && _aRes$data !== void 0 ? _aRes$data : aRes) || [];
					} catch (_unused2) {
						accounts.value = [];
					}
					let maps = [];
					try {
						var _mRes$data;
						const mRes = yield yunkeApi.userMap();
						maps = ((_mRes$data = mRes === null || mRes === void 0 ? void 0 : mRes.data) !== null && _mRes$data !== void 0 ? _mRes$data : mRes) || [];
					} catch (_unused3) {}
					const mapById = {};
					maps.forEach((m) => {
						mapById[String(m.userId)] = m;
					});
					rows.value = users.map((u) => {
						const name = u.name || u.nickName || u.nickname || u.username;
						const m = mapById[String(u.id)];
						let acc = (m === null || m === void 0 ? void 0 : m.yunkePhone) || "";
						if (!acc && name) {
							const matched = accounts.value.find((a) => a.name && (a.name === name || a.name.includes(name) || name.includes(a.name)));
							if (matched) acc = matched.phone;
						}
						return {
							id: u.id,
							name,
							phone: u.phone || u.phonenumber || u.mobile || "",
							yunkeAccountPhone: acc,
							enabled: !!(m && m.yunkeUserId),
							_loading: false
						};
					});
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const onSel = (rowsSel) => {
			selected.value = rowsSel;
		};
		const doEnable = function() {
			var _ref2 = _asyncToGenerator(function* (emps) {
				var _res$data, _lastResult$value$suc, _lastResult$value;
				const payload = emps.filter((e) => e.yunkeAccountPhone).map((e) => ({
					userId: e.id,
					name: e.name,
					phone: e.yunkeAccountPhone
				}));
				if (!payload.length) {
					ElMessage.warning("请先给员工选云客账号(工作手机)");
					return;
				}
				const res = yield yunkeApi.enableDial(payload);
				lastResult.value = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
				const ok = (_lastResult$value$suc = (_lastResult$value = lastResult.value) === null || _lastResult$value === void 0 ? void 0 : _lastResult$value.success) !== null && _lastResult$value$suc !== void 0 ? _lastResult$value$suc : 0;
				if (ok > 0) ElMessage.success(`开通成功 ${ok} 人`);
				else ElMessage.warning("开通 0 人,看下方失败原因");
				load();
			});
			return function doEnable(_x) {
				return _ref2.apply(this, arguments);
			};
		}();
		const enableSelected = function() {
			var _ref3 = _asyncToGenerator(function* () {
				enabling.value = true;
				try {
					yield doEnable(selected.value);
				} finally {
					enabling.value = false;
				}
			});
			return function enableSelected() {
				return _ref3.apply(this, arguments);
			};
		}();
		const enableOne = function() {
			var _ref4 = _asyncToGenerator(function* (row) {
				row._loading = true;
				try {
					yield doEnable([row]);
				} finally {
					row._loading = false;
				}
			});
			return function enableOne(_x2) {
				return _ref4.apply(this, arguments);
			};
		}();
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_table_column = ElTableColumn;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_card = ElCard;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[2] || (_cache[2] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "yum-title" }, "员工云客关联(点击拨打)"), createBaseVNode("p", { class: "yum-sub" }, "给员工选好他的云客账号(工作手机)并\"开通外呼\"后,在电销外呼页点「拨打」,就会用该员工的云客工作手机拨打客户号码。")], -1)), createVNode(_component_el_button, {
					onClick: load,
					plain: "",
					loading: loading.value
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[1] || (_cache[1] = createTextVNode(" 刷新", -1))]),
					_: 1
				}, 8, ["loading"])]),
				createVNode(_component_el_alert, {
					type: "warning",
					closable: false,
					"show-icon": "",
					class: "yum-alert"
				}, {
					title: withCtx(() => [..._cache[3] || (_cache[3] = [createTextVNode("怎么用(重要)", -1)])]),
					default: withCtx(() => [
						_cache[4] || (_cache[4] = createTextVNode(" 系统登录手机 和 云客工作手机", -1)),
						_cache[5] || (_cache[5] = createBaseVNode("b", null, "通常不是同一个号", -1)),
						_cache[6] || (_cache[6] = createTextVNode(",所以要给每个员工", -1)),
						_cache[7] || (_cache[7] = createBaseVNode("b", null, "选他对应的云客成员(姓名·部门·手机)", -1)),
						_cache[8] || (_cache[8] = createTextVNode("——下拉里是云客组织架构里的真实成员,已按姓名帮你", -1)),
						_cache[9] || (_cache[9] = createBaseVNode("b", null, "智能预选", -1)),
						_cache[10] || (_cache[10] = createTextVNode("了一部分,核对一下。选好 → 勾选 → 点", -1)),
						_cache[11] || (_cache[11] = createBaseVNode("b", null, "「批量开通外呼」", -1)),
						_cache[12] || (_cache[12] = createTextVNode("。", -1)),
						_cache[13] || (_cache[13] = createBaseVNode("b", null, "前提", -1)),
						_cache[14] || (_cache[14] = createTextVNode(":该云客工作手机要登录", -1)),
						_cache[15] || (_cache[15] = createBaseVNode("b", null, "云客工作台 app 并联网在线", -1)),
						_cache[16] || (_cache[16] = createTextVNode(",否则拨号发不出去。 ", -1))
					]),
					_: 1
				}),
				createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						class: "yum-search",
						placeholder: "搜姓名",
						clearable: ""
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						disabled: !selected.value.length,
						loading: enabling.value,
						onClick: enableSelected
					}, {
						default: withCtx(() => [createTextVNode(" 批量开通外呼" + toDisplayString(selected.value.length ? `(${selected.value.length})` : ""), 1)]),
						_: 1
					}, 8, ["disabled", "loading"]),
					createBaseVNode("span", _hoisted_4, "已开通 " + toDisplayString(enabledCount.value) + " / 共 " + toDisplayString(rows.value.length) + " 人 · 云客成员 " + toDisplayString(accounts.value.length) + " 个", 1)
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: filteredRows.value,
					border: "",
					stripe: "",
					onSelectionChange: onSel,
					"row-key": "id"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							type: "selection",
							width: "46",
							selectable: (r) => !!r.yunkeAccountPhone
						}, null, 8, ["selectable"]),
						createVNode(_component_el_table_column, {
							label: "员工",
							"min-width": "120"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_5, toDisplayString(row.name || "—"), 1), createBaseVNode("div", _hoisted_6, "系统手机 " + toDisplayString(row.phone || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "关联云客成员",
							"min-width": "300"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_select, {
								modelValue: row.yunkeAccountPhone,
								"onUpdate:modelValue": ($event) => row.yunkeAccountPhone = $event,
								filterable: "",
								clearable: "",
								placeholder: "选该员工对应的云客成员",
								size: "small",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(accounts.value, (a) => {
									return openBlock(), createBlock(_component_el_option, {
										key: a.phone,
										label: `${a.name || a.phone}(${a.phone})${a.dept ? " · " + a.dept : ""}`,
										value: a.phone
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue", "onUpdate:modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "外呼状态",
							width: "110",
							align: "center"
						}, {
							default: withCtx(({ row }) => [row.enabled ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								type: "success",
								size: "small"
							}, {
								default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("已开通", -1)])]),
								_: 1
							})) : (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								type: "info",
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("未开通", -1)])]),
								_: 1
							}))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "120",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_button, {
								size: "small",
								type: "primary",
								plain: "",
								disabled: !row.yunkeAccountPhone,
								loading: row._loading,
								onClick: ($event) => enableOne(row)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "重新开通" : "开通外呼"), 1)]),
								_: 2
							}, 1032, [
								"disabled",
								"loading",
								"onClick"
							])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				lastResult.value ? (openBlock(), createBlock(_component_el_card, {
					key: 0,
					class: "yum-result",
					shadow: "never"
				}, {
					default: withCtx(() => [
						createBaseVNode("div", null, [
							_cache[19] || (_cache[19] = createTextVNode("开通结果:成功 ", -1)),
							createBaseVNode("b", _hoisted_7, toDisplayString(lastResult.value.success), 1),
							_cache[20] || (_cache[20] = createTextVNode(" 人,失败 ", -1)),
							createBaseVNode("b", _hoisted_8, toDisplayString(lastResult.value.fail), 1),
							_cache[21] || (_cache[21] = createTextVNode(" 人", -1))
						]),
						lastResult.value.errors && lastResult.value.errors.length ? (openBlock(), createElementBlock("ul", _hoisted_9, [(openBlock(true), createElementBlock(Fragment, null, renderList(lastResult.value.errors, (e, i) => {
							return openBlock(), createElementBlock("li", { key: i }, toDisplayString(e), 1);
						}), 128))])) : createCommentVNode("", true),
						lastResult.value.fail ? (openBlock(), createElementBlock("p", _hoisted_10, "失败多为\"登录账户不存在\"=选的云客账号不对,或该工作手机没登录过云客工作台。")) : createCommentVNode("", true)
					]),
					_: 1
				})) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-b4a50114"]]);
//#endregion
export { yunke_user_map_default as default };

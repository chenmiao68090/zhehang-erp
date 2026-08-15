import { $ as createCommentVNode, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Lt as circle_close_filled_default, Ut as connection_default, _t as ElFormItem, er as success_filled_default, gt as ElForm, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading, tt as ElCard, v as ElSwitch, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as yunkeApi } from "./yunke-DhOFgmEW.js";
//#region src/views/customer/yunke-config.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "yk" };
var _hoisted_2 = { class: "yk-result-head" };
var _hoisted_3 = { class: "yk-result-msg" };
var _hoisted_4 = {
	key: 0,
	class: "yk-raw"
};
//#endregion
//#region src/views/customer/yunke-config.vue
var yunke_config_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "yunke-config",
	setup(__props) {
		const loading = ref(false);
		const saving = ref(false);
		const testing = ref(false);
		const testResult = ref(null);
		const form = reactive({
			company: "",
			partnerId: "",
			signKey: "",
			baseUrl: "https://phone.yunkecn.com",
			enabled: 1
		});
		const prettyRaw = computed(() => {
			try {
				var _testResult$value;
				return JSON.stringify((_testResult$value = testResult.value) === null || _testResult$value === void 0 ? void 0 : _testResult$value.raw, null, 2);
			} catch (_unused) {
				var _testResult$value$raw, _testResult$value2;
				return String((_testResult$value$raw = (_testResult$value2 = testResult.value) === null || _testResult$value2 === void 0 ? void 0 : _testResult$value2.raw) !== null && _testResult$value$raw !== void 0 ? _testResult$value$raw : "");
			}
		});
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _c$enabled;
					const res = yield yunkeApi.getConfig();
					const c = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					if (c) Object.assign(form, {
						company: c.company || "",
						partnerId: c.partnerId || "",
						signKey: c.signKey || "",
						baseUrl: c.baseUrl || "https://phone.yunkecn.com",
						enabled: (_c$enabled = c.enabled) !== null && _c$enabled !== void 0 ? _c$enabled : 1
					});
				} catch (_unused2) {} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const save = function() {
			var _ref2 = _asyncToGenerator(function* () {
				saving.value = true;
				try {
					yield yunkeApi.saveConfig(_objectSpread2({}, form));
					ElMessage.success("已保存");
					load();
				} catch (e) {
					ElMessage.error("保存失败:" + ((e === null || e === void 0 ? void 0 : e.message) || ""));
				} finally {
					saving.value = false;
				}
			});
			return function save() {
				return _ref2.apply(this, arguments);
			};
		}();
		const test = function() {
			var _ref3 = _asyncToGenerator(function* () {
				testing.value = true;
				testResult.value = null;
				try {
					var _res$data2;
					const res = yield yunkeApi.test();
					testResult.value = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
				} catch (e) {
					testResult.value = {
						success: false,
						message: (e === null || e === void 0 ? void 0 : e.message) || "请求失败"
					};
				} finally {
					testing.value = false;
				}
			});
			return function test() {
				return _ref3.apply(this, arguments);
			};
		}();
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_switch = ElSwitch;
			const _component_el_button = ElButton;
			const _component_el_icon = ElIcon;
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[22] || (_cache[22] = createBaseVNode("header", { class: "yk-head" }, [createBaseVNode("div", null, [createBaseVNode("h2", { class: "yk-title" }, "云客对接配置"), createBaseVNode("p", { class: "yk-sub" }, "填入云客后台【设置 → 系统设置 → 接口申请配置】里的凭证,系统就能调云客拉数据(通话、微信、沟通统计等)。")])], -1)),
				createVNode(_component_el_alert, {
					type: "info",
					closable: false,
					"show-icon": "",
					class: "yk-alert"
				}, {
					title: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("凭证怎么填", -1)])]),
					default: withCtx(() => [
						_cache[6] || (_cache[6] = createBaseVNode("b", null, "企业串码", -1)),
						_cache[7] || (_cache[7] = createTextVNode("=接口申请配置页的\"企业串码\";", -1)),
						_cache[8] || (_cache[8] = createBaseVNode("b", null, "管理员ID", -1)),
						_cache[9] || (_cache[9] = createTextVNode("=页面上的\"管理员ID\";", -1)),
						_cache[10] || (_cache[10] = createBaseVNode("b", null, "签名KEY", -1)),
						_cache[11] || (_cache[11] = createTextVNode("=点\"查看\"复制的那串。签名KEY 加密保管,本页只显示掩码 ", -1)),
						_cache[12] || (_cache[12] = createBaseVNode("code", null, "********", -1)),
						_cache[13] || (_cache[13] = createTextVNode(";不改 KEY 时留着掩码即可。改完点", -1)),
						_cache[14] || (_cache[14] = createBaseVNode("b", null, "保存", -1)),
						_cache[15] || (_cache[15] = createTextVNode(",再点", -1)),
						_cache[16] || (_cache[16] = createBaseVNode("b", null, "测试连接", -1)),
						_cache[17] || (_cache[17] = createTextVNode("验证。 ", -1))
					]),
					_: 1
				}),
				withDirectives((openBlock(), createBlock(_component_el_form, {
					model: form,
					"label-width": "110px",
					class: "yk-form"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, { label: "企业串码" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.company,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.company = $event),
								placeholder: "如 mdihf4",
								clearable: ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "管理员ID" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.partnerId,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.partnerId = $event),
								placeholder: "p 开头的一串",
								clearable: ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "签名KEY" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.signKey,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.signKey = $event),
								type: "password",
								"show-password": "",
								placeholder: "留空或掩码=不修改",
								clearable: ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "接口地址" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.baseUrl,
								"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.baseUrl = $event),
								placeholder: "https://phone.yunkecn.com",
								clearable: ""
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { label: "启用" }, {
							default: withCtx(() => [createVNode(_component_el_switch, {
								modelValue: form.enabled,
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.enabled = $event),
								"active-value": 1,
								"inactive-value": 0
							}, null, 8, ["modelValue"]), _cache[18] || (_cache[18] = createBaseVNode("span", { class: "yk-hint" }, "关掉后系统不再调用云客", -1))]),
							_: 1
						}),
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createVNode(_component_el_button, {
								type: "primary",
								loading: saving.value,
								onClick: save
							}, {
								default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("保存", -1)])]),
								_: 1
							}, 8, ["loading"]), createVNode(_component_el_button, {
								loading: testing.value,
								onClick: test
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(connection_default))]),
									_: 1
								}), _cache[20] || (_cache[20] = createTextVNode(" 测试连接", -1))]),
								_: 1
							}, 8, ["loading"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["model"])), [[_directive_loading, loading.value]]),
				testResult.value ? (openBlock(), createBlock(_component_el_card, {
					key: 0,
					class: normalizeClass(["yk-result", testResult.value.success ? "ok" : "bad"]),
					shadow: "never"
				}, {
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_2, [createVNode(_component_el_icon, { size: 18 }, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(testResult.value.success ? unref(success_filled_default) : unref(circle_close_filled_default))))]),
							_: 1
						}), createBaseVNode("span", null, toDisplayString(testResult.value.success ? "连接成功 —— 凭证、签名、IP 白名单都通了" : "连接失败"), 1)]),
						createBaseVNode("p", _hoisted_3, toDisplayString(testResult.value.message), 1),
						testResult.value.raw ? (openBlock(), createElementBlock("details", _hoisted_4, [_cache[21] || (_cache[21] = createBaseVNode("summary", null, "云客原始返回(调试用)", -1)), createBaseVNode("pre", null, toDisplayString(prettyRaw.value), 1)])) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, ["class"])) : createCommentVNode("", true),
				_cache[23] || (_cache[23] = createBaseVNode("div", { class: "yk-tip" }, [
					createBaseVNode("b", null, "安全提醒:"),
					createTextVNode("安全 IP 白名单里要有我们服务器 IP "),
					createBaseVNode("code", null, "47.243.27.11"),
					createTextVNode("(你已经配好了)。测试成功后,我就能把「员工微信」等页面接上真实数据。 ")
				], -1))
			]);
		};
	}
}), [["__scopeId", "data-v-de346669"]]);
//#endregion
export { yunke_config_default as default };

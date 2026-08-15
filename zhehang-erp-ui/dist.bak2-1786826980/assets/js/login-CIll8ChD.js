import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, rt as createStaticVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, Dr as withModifiers, Er as withKeys, S as ElSkeleton, _t as ElFormItem, gt as ElForm, it as ElTag, mt as ElInput, o as ElMessage, ot as ElButton, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { d as confirmMfaEnrollmentApi, f as getCaptchaApi, l as useUserStore, m as verifyMfaApi, p as startMfaEnrollmentApi, u as changeInitialPasswordApi } from "./index-C4y3JnUs.js";
import "./logo-Bgp5DlLw.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import QRCode from "qrcode";
//#region src/views/login/index.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "login-container" };
var _hoisted_2 = { class: "login-left" };
var _hoisted_3 = { class: "brand-content" };
var _hoisted_4 = { class: "value-list" };
var _hoisted_5 = { class: "value-index" };
var _hoisted_6 = { class: "value-no" };
var _hoisted_7 = {
	key: 0,
	class: "value-line"
};
var _hoisted_8 = { class: "value-body" };
var _hoisted_9 = { class: "value-title" };
var _hoisted_10 = { class: "value-desc" };
var _hoisted_11 = { class: "login-right" };
var _hoisted_12 = { class: "login-form-wrapper" };
var _hoisted_13 = {
	key: 0,
	class: "security-step"
};
var _hoisted_14 = { class: "login-title" };
var _hoisted_15 = { class: "stage-description" };
var _hoisted_16 = { class: "captcha-row" };
var _hoisted_17 = ["src"];
var _hoisted_18 = { key: 1 };
var _hoisted_19 = { class: "login-options" };
var _hoisted_20 = {
	key: 3,
	class: "mfa-panel"
};
var _hoisted_21 = { class: "mfa-qr-wrap" };
var _hoisted_22 = ["src"];
var _hoisted_23 = { class: "mfa-secret" };
var _hoisted_24 = {
	key: 4,
	class: "mfa-panel"
};
//#endregion
//#region src/views/login/index.vue
var login_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "index",
	setup(__props) {
		const values = [
			{
				no: "01",
				title: "客户第一",
				desc: "我们坚持客户第一。客户的信任，是公司存在的根基。"
			},
			{
				no: "02",
				title: "员工成长",
				desc: "我们重视员工成长。员工的专业与责任，是服务客户的保障。"
			},
			{
				no: "03",
				title: "长期回报",
				desc: "我们追求长期回报。股东收益来自客户价值、员工奋斗和公司的稳健经营。"
			}
		];
		const router = useRouter();
		const route = useRoute();
		const userStore = useUserStore();
		const loginFormRef = ref();
		const loading = ref(false);
		const rememberMe = ref(false);
		const authStage = ref("LOGIN");
		const challengeId = ref("");
		const challengedUsername = ref("");
		const captchaUrl = ref("");
		const captchaLoading = ref(false);
		const captchaRequired = ref(false);
		const captchaEmpty = ref(false);
		const mfaQrCode = ref("");
		const mfaSecret = ref("");
		const mfaCode = ref("");
		const loginForm = reactive({
			username: "",
			password: "",
			code: "",
			uuid: ""
		});
		const passwordForm = reactive({
			newPassword: "",
			confirmPassword: ""
		});
		const stageTitle = computed(() => ({
			LOGIN: "欢迎登录",
			PASSWORD_CHANGE: "首次登录，请设置新密码",
			MFA_ENROLL: "启用双重验证",
			MFA: "双重验证"
		})[authStage.value]);
		const stageDescription = computed(() => ({
			LOGIN: "使用公司账号进入浙杭集团系统",
			PASSWORD_CHANGE: `正在保护账号 ${challengedUsername.value || ""}`,
			MFA_ENROLL: `正在保护账号 ${challengedUsername.value || ""}`,
			MFA: `正在验证账号 ${challengedUsername.value || ""}`
		})[authStage.value]);
		const loginRules = {
			username: [{
				required: true,
				message: "请输入用户名",
				trigger: "blur"
			}],
			password: [{
				required: true,
				message: "请输入密码",
				trigger: "blur"
			}]
		};
		function refreshCaptcha() {
			return _refreshCaptcha.apply(this, arguments);
		}
		function _refreshCaptcha() {
			_refreshCaptcha = _asyncToGenerator(function* () {
				captchaLoading.value = true;
				captchaEmpty.value = false;
				try {
					const { data } = yield getCaptchaApi();
					loginForm.uuid = data.uuid;
					loginForm.code = "";
					captchaUrl.value = data.image;
				} catch (_unused) {
					loginForm.uuid = "";
					captchaUrl.value = "";
					captchaEmpty.value = true;
					ElMessage.warning("验证码加载失败，请点击重试");
				} finally {
					captchaLoading.value = false;
				}
			});
			return _refreshCaptcha.apply(this, arguments);
		}
		function safeRedirect() {
			const redirect = String(route.query.redirect || "/");
			return redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
		}
		function handleLogin() {
			return _handleLogin.apply(this, arguments);
		}
		function _handleLogin() {
			_handleLogin = _asyncToGenerator(function* () {
				if (!loginFormRef.value) return;
				yield loginFormRef.value.validate(function() {
					var _ref = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						loading.value = true;
						try {
							yield processAuthResult(yield userStore.login(_objectSpread2(_objectSpread2({}, loginForm), {}, { username: loginForm.username.trim() })));
						} catch (error) {
							ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "登录失败，请检查账号密码或后端服务");
							if (Number(error === null || error === void 0 ? void 0 : error.code) === 428) captchaRequired.value = true;
							if (captchaRequired.value) yield refreshCaptcha();
						} finally {
							loading.value = false;
						}
					});
					return function(_x) {
						return _ref.apply(this, arguments);
					};
				}());
			});
			return _handleLogin.apply(this, arguments);
		}
		function processAuthResult(_x2) {
			return _processAuthResult.apply(this, arguments);
		}
		function _processAuthResult() {
			_processAuthResult = _asyncToGenerator(function* (result) {
				challengeId.value = result.challengeId || "";
				challengedUsername.value = result.username || loginForm.username.trim();
				mfaCode.value = "";
				if (result.action === "AUTHENTICATED") {
					yield userStore.acceptAuthTokens(result);
					yield router.replace(safeRedirect());
					ElMessage.success("登录成功");
					return;
				}
				if (result.action === "REQUIRE_PASSWORD_CHANGE") {
					authStage.value = "PASSWORD_CHANGE";
					passwordForm.newPassword = "";
					passwordForm.confirmPassword = "";
					return;
				}
				if (result.action === "REQUIRE_MFA_ENROLL") {
					authStage.value = "MFA_ENROLL";
					yield loadMfaEnrollment();
					return;
				}
				if (result.action === "REQUIRE_MFA") {
					authStage.value = "MFA";
					return;
				}
				returnToLogin();
				ElMessage.success(result.message || "账号安全设置已更新，请重新登录");
			});
			return _processAuthResult.apply(this, arguments);
		}
		function submitInitialPassword() {
			return _submitInitialPassword.apply(this, arguments);
		}
		function _submitInitialPassword() {
			_submitInitialPassword = _asyncToGenerator(function* () {
				const password = passwordForm.newPassword;
				if (password.length < 10 || password.length > 128) return ElMessage.warning("密码长度必须为 10 至 128 位");
				if (password !== passwordForm.confirmPassword) return ElMessage.warning("两次输入的新密码不一致");
				loading.value = true;
				try {
					const { data } = yield changeInitialPasswordApi({
						challengeId: challengeId.value,
						newPassword: password
					});
					returnToLogin();
					ElMessage.success(data.message || "密码设置成功，请重新登录");
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "密码设置失败");
				} finally {
					loading.value = false;
				}
			});
			return _submitInitialPassword.apply(this, arguments);
		}
		function loadMfaEnrollment() {
			return _loadMfaEnrollment.apply(this, arguments);
		}
		function _loadMfaEnrollment() {
			_loadMfaEnrollment = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					const { data } = yield startMfaEnrollmentApi(challengeId.value);
					mfaSecret.value = data.secret;
					mfaQrCode.value = yield QRCode.toDataURL(data.otpauthUri, {
						width: 220,
						margin: 1
					});
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "MFA 绑定信息加载失败");
					returnToLogin();
				} finally {
					loading.value = false;
				}
			});
			return _loadMfaEnrollment.apply(this, arguments);
		}
		function confirmMfaEnrollment() {
			return _confirmMfaEnrollment.apply(this, arguments);
		}
		function _confirmMfaEnrollment() {
			_confirmMfaEnrollment = _asyncToGenerator(function* () {
				if (!/^\d{6}$/.test(mfaCode.value)) return ElMessage.warning("请输入 6 位动态验证码");
				loading.value = true;
				try {
					const { data } = yield confirmMfaEnrollmentApi({
						challengeId: challengeId.value,
						code: mfaCode.value
					});
					returnToLogin();
					ElMessage.success(data.message || "MFA 已启用，请重新登录");
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "动态验证码不正确");
				} finally {
					loading.value = false;
				}
			});
			return _confirmMfaEnrollment.apply(this, arguments);
		}
		function submitMfaVerification() {
			return _submitMfaVerification.apply(this, arguments);
		}
		function _submitMfaVerification() {
			_submitMfaVerification = _asyncToGenerator(function* () {
				if (!/^\d{6}$/.test(mfaCode.value)) return ElMessage.warning("请输入 6 位动态验证码");
				loading.value = true;
				try {
					const { data } = yield verifyMfaApi({
						challengeId: challengeId.value,
						code: mfaCode.value
					});
					yield processAuthResult(data);
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "动态验证码不正确");
				} finally {
					loading.value = false;
				}
			});
			return _submitMfaVerification.apply(this, arguments);
		}
		function returnToLogin() {
			authStage.value = "LOGIN";
			challengeId.value = "";
			challengedUsername.value = "";
			loginForm.password = "";
			loginForm.code = "";
			loginForm.uuid = "";
			mfaCode.value = "";
			mfaSecret.value = "";
			mfaQrCode.value = "";
			passwordForm.newPassword = "";
			passwordForm.confirmPassword = "";
			if (captchaRequired.value) refreshCaptcha();
		}
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_form = ElForm;
			const _component_el_alert = ElAlert;
			const _component_el_skeleton = ElSkeleton;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [
				_cache[12] || (_cache[12] = createBaseVNode("div", { class: "bg-glow bg-glow--tr" }, null, -1)),
				_cache[13] || (_cache[13] = createBaseVNode("div", { class: "bg-glow bg-glow--bl" }, null, -1)),
				_cache[14] || (_cache[14] = createBaseVNode("div", { class: "bg-grid" }, null, -1)),
				createBaseVNode("div", _hoisted_3, [
					_cache[10] || (_cache[10] = createStaticVNode("<div class=\"brand-logo\" data-v-b93f355b><img class=\"brand-mark\" src=\"/logo.svg\" alt=\"浙杭集团\" data-v-b93f355b><div class=\"brand-name\" data-v-b93f355b><span class=\"brand-name__cn\" data-v-b93f355b>浙杭集团</span><span class=\"brand-name__en\" data-v-b93f355b>ZHEHANG\xA0GROUP</span></div></div><div class=\"values-head\" data-v-b93f355b><div class=\"values-eyebrow\" data-v-b93f355b>我 们 的 价 值 观</div><h2 class=\"values-title\" data-v-b93f355b>以信任为本\xA0\xA0与客户长期同行</h2></div>", 2)),
					createBaseVNode("ul", _hoisted_4, [(openBlock(), createElementBlock(Fragment, null, renderList(values, (v, i) => {
						return createBaseVNode("li", {
							key: v.no,
							class: "value-item"
						}, [createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(v.no), 1), i < values.length - 1 ? (openBlock(), createElementBlock("span", _hoisted_7)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, toDisplayString(v.title), 1), createBaseVNode("div", _hoisted_10, toDisplayString(v.desc), 1)])]);
					}), 64))]),
					_cache[11] || (_cache[11] = createBaseVNode("div", { class: "brand-footer" }, "财税代账 · 工商注册 · 企业渠道服务", -1))
				])
			]), createBaseVNode("div", _hoisted_11, [createBaseVNode("div", _hoisted_12, [
				authStage.value !== "LOGIN" ? (openBlock(), createElementBlock("div", _hoisted_13, [createVNode(_component_el_button, {
					link: "",
					type: "primary",
					onClick: returnToLogin
				}, {
					default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("返回账号登录", -1)])]),
					_: 1
				}), createVNode(_component_el_tag, {
					type: "warning",
					effect: "plain"
				}, {
					default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("账号安全验证", -1)])]),
					_: 1
				})])) : createCommentVNode("", true),
				createBaseVNode("h2", _hoisted_14, toDisplayString(stageTitle.value), 1),
				createBaseVNode("p", _hoisted_15, toDisplayString(stageDescription.value), 1),
				authStage.value === "LOGIN" ? (openBlock(), createBlock(_component_el_form, {
					key: 1,
					ref_key: "loginFormRef",
					ref: loginFormRef,
					model: loginForm,
					rules: loginRules,
					size: "large"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_form_item, { prop: "username" }, {
							default: withCtx(() => [_cache[17] || (_cache[17] = createBaseVNode("label", { class: "field-label" }, "用户名", -1)), createVNode(_component_el_input, {
								modelValue: loginForm.username,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => loginForm.username = $event),
								placeholder: "请输入用户名",
								"prefix-icon": "User"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, { prop: "password" }, {
							default: withCtx(() => [_cache[18] || (_cache[18] = createBaseVNode("label", { class: "field-label" }, "密码", -1)), createVNode(_component_el_input, {
								modelValue: loginForm.password,
								"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => loginForm.password = $event),
								type: "password",
								placeholder: "请输入密码",
								"prefix-icon": "Lock",
								"show-password": "",
								onKeyup: withKeys(handleLogin, ["enter"])
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						captchaRequired.value ? (openBlock(), createBlock(_component_el_form_item, {
							key: 0,
							prop: "code"
						}, {
							default: withCtx(() => [_cache[19] || (_cache[19] = createBaseVNode("label", { class: "field-label" }, "验证码", -1)), createBaseVNode("div", _hoisted_16, [createVNode(_component_el_input, {
								modelValue: loginForm.code,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => loginForm.code = $event),
								placeholder: "请输入验证码",
								"prefix-icon": "Key"
							}, null, 8, ["modelValue"]), createBaseVNode("div", {
								class: normalizeClass(["captcha-img", { placeholder: captchaEmpty.value }]),
								onClick: refreshCaptcha
							}, [captchaUrl.value ? (openBlock(), createElementBlock("img", {
								key: 0,
								src: captchaUrl.value,
								alt: "图形验证码",
								onError: _cache[3] || (_cache[3] = ($event) => captchaEmpty.value = true)
							}, null, 40, _hoisted_17)) : createCommentVNode("", true), !captchaUrl.value || captchaEmpty.value ? (openBlock(), createElementBlock("span", _hoisted_18, toDisplayString(captchaLoading.value ? "加载中" : "点击刷新验证码"), 1)) : createCommentVNode("", true)], 2)])]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_19, [createVNode(_component_el_checkbox, {
								modelValue: rememberMe.value,
								"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => rememberMe.value = $event)
							}, {
								default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("记住我", -1)])]),
								_: 1
							}, 8, ["modelValue"])])]),
							_: 1
						}),
						createVNode(_component_el_form_item, null, {
							default: withCtx(() => [createVNode(_component_el_button, {
								type: "primary",
								class: "login-btn",
								loading: loading.value,
								onClick: handleLogin
							}, {
								default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode(" 登 录 ", -1)])]),
								_: 1
							}, 8, ["loading"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["model"])) : authStage.value === "PASSWORD_CHANGE" ? (openBlock(), createBlock(_component_el_form, {
					key: 2,
					size: "large",
					onSubmit: _cache[7] || (_cache[7] = withModifiers(() => {}, ["prevent"]))
				}, {
					default: withCtx(() => [
						createVNode(_component_el_alert, {
							title: "该账号使用的是一次性初始口令，设置新密码前不会创建登录令牌。",
							type: "warning",
							closable: false,
							"show-icon": ""
						}),
						createVNode(_component_el_form_item, {
							label: "新密码",
							class: "security-form-item"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: passwordForm.newPassword,
								"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => passwordForm.newPassword = $event),
								type: "password",
								"show-password": "",
								autocomplete: "new-password",
								placeholder: "10-128 位，至少包含三类字符"
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						createVNode(_component_el_form_item, {
							label: "确认新密码",
							class: "security-form-item"
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: passwordForm.confirmPassword,
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => passwordForm.confirmPassword = $event),
								type: "password",
								"show-password": "",
								autocomplete: "new-password",
								placeholder: "再次输入新密码",
								onKeyup: withKeys(submitInitialPassword, ["enter"])
							}, null, 8, ["modelValue"])]),
							_: 1
						}),
						_cache[23] || (_cache[23] = createBaseVNode("div", { class: "password-hint" }, "不能包含账号、空格、连续字符或常见弱口令。", -1)),
						createVNode(_component_el_button, {
							type: "primary",
							class: "login-btn",
							loading: loading.value,
							onClick: submitInitialPassword
						}, {
							default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode(" 设置密码并重新登录 ", -1)])]),
							_: 1
						}, 8, ["loading"])
					]),
					_: 1
				})) : authStage.value === "MFA_ENROLL" ? (openBlock(), createElementBlock("div", _hoisted_20, [
					createVNode(_component_el_alert, {
						title: "该角色必须启用双重验证。请用身份验证器扫描二维码，再输入 6 位动态验证码。",
						type: "warning",
						closable: false,
						"show-icon": ""
					}),
					createBaseVNode("div", _hoisted_21, [mfaQrCode.value ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: mfaQrCode.value,
						class: "mfa-qr",
						alt: "MFA 绑定二维码"
					}, null, 8, _hoisted_22)) : (openBlock(), createBlock(_component_el_skeleton, {
						key: 1,
						rows: 4,
						animated: ""
					}))]),
					createBaseVNode("div", _hoisted_23, [_cache[24] || (_cache[24] = createBaseVNode("span", null, "无法扫码时手动输入：", -1)), createBaseVNode("code", null, toDisplayString(mfaSecret.value), 1)]),
					createVNode(_component_el_input, {
						modelValue: mfaCode.value,
						"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => mfaCode.value = $event),
						maxlength: "6",
						inputmode: "numeric",
						autocomplete: "one-time-code",
						placeholder: "请输入 6 位动态验证码",
						onKeyup: withKeys(confirmMfaEnrollment, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						class: "login-btn mfa-submit",
						loading: loading.value,
						onClick: confirmMfaEnrollment
					}, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode(" 验证并启用 MFA ", -1)])]),
						_: 1
					}, 8, ["loading"])
				])) : (openBlock(), createElementBlock("div", _hoisted_24, [
					createVNode(_component_el_alert, {
						title: "请输入身份验证器中的 6 位动态验证码。",
						type: "info",
						closable: false,
						"show-icon": ""
					}),
					createVNode(_component_el_input, {
						modelValue: mfaCode.value,
						"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => mfaCode.value = $event),
						maxlength: "6",
						inputmode: "numeric",
						autocomplete: "one-time-code",
						placeholder: "6 位动态验证码",
						onKeyup: withKeys(submitMfaVerification, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						class: "login-btn mfa-submit",
						loading: loading.value,
						onClick: submitMfaVerification
					}, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode(" 验证并登录 ", -1)])]),
						_: 1
					}, 8, ["loading"])
				]))
			])])]);
		};
	}
}), [["__scopeId", "data-v-b93f355b"]]);
//#endregion
export { login_default as default };

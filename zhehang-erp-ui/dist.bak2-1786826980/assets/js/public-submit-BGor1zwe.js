import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { C as ElResult, J as ElCol, Y as ElRow, _t as ElFormItem, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, tt as ElCard, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { n as get, r as post } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
//#region src/api/seal-public.ts
var sealPublicApi = {
	/** 凭24小时安全票据获取刻章自助表单选项 */
	options: (token) => get("/seal/public/options", void 0, publicTicketConfig(token)),
	/** 凭一次性安全票据提交基本信息并生成刻章提单草稿 */
	submit: (token, data) => post("/seal/public/submit", data, publicTicketConfig(token))
};
/** 票据走请求头，避免出现在服务端/Nginx访问日志；公开页失败自行展示，不跳后台登录。 */
function publicTicketConfig(token) {
	return {
		headers: { "X-Seal-Ticket": token },
		silentError: true,
		skipAuthRedirect: true
	};
}
//#endregion
//#region src/views/seal/public-submit.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-public" };
var _hoisted_2 = { class: "form-shell" };
var _hoisted_3 = { class: "form-actions" };
//#endregion
//#region src/views/seal/public-submit.vue
var public_submit_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "public-submit",
	setup(__props) {
		const formRef = ref();
		const submitting = ref(false);
		const submitted = ref(false);
		const linkError = ref("");
		const materialList = ref([]);
		const typeList = ref([]);
		const fragment = new URLSearchParams(window.location.hash.replace(/^#/, ""));
		const token = String(fragment.get("ticket") || "");
		const options = reactive({
			sealStatuses: [],
			recordStatuses: [],
			sealCities: [],
			sealMaterials: [],
			sealTypes: []
		});
		function emptyForm() {
			return {
				companyName: "",
				legalPerson: "",
				phone: "",
				sealStatus: "",
				recordStatus: "",
				sealCity: "",
				sealMaterial: "",
				sealTypes: "",
				recipient: "",
				address: "",
				remark: ""
			};
		}
		const form = reactive(emptyForm());
		const rules = {
			companyName: [{
				required: true,
				message: "请填写公司名称",
				trigger: "blur"
			}],
			phone: [{
				required: true,
				message: "请填写联系电话",
				trigger: "blur"
			}]
		};
		function loadOptions() {
			return _loadOptions.apply(this, arguments);
		}
		function _loadOptions() {
			_loadOptions = _asyncToGenerator(function* () {
				if (!/^[0-9a-f]{64}$/.test(token)) {
					linkError.value = "链接格式不正确，请联系经办人重新生成。";
					return;
				}
				try {
					var _ref, _res$data;
					const res = yield sealPublicApi.options(token);
					Object.assign(options, (_ref = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) !== null && _ref !== void 0 ? _ref : {});
				} catch (error) {
					var _error$response;
					linkError.value = (error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || "链接无效或已过期，请联系经办人重新生成。";
				}
			});
			return _loadOptions.apply(this, arguments);
		}
		function submitForm() {
			return _submitForm.apply(this, arguments);
		}
		function _submitForm() {
			_submitForm = _asyncToGenerator(function* () {
				var _formRef$value;
				yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate();
				submitting.value = true;
				try {
					form.sealMaterial = materialList.value.join(",");
					form.sealTypes = typeList.value.join(",");
					yield sealPublicApi.submit(token, _objectSpread2({}, form));
					submitted.value = true;
					ElMessage.success("提交成功,我们会尽快联系您");
				} catch (error) {
					var _error$response2;
					ElMessage.error((error === null || error === void 0 || (_error$response2 = error.response) === null || _error$response2 === void 0 || (_error$response2 = _error$response2.data) === null || _error$response2 === void 0 ? void 0 : _error$response2.message) || (error === null || error === void 0 ? void 0 : error.message) || "提交失败,请稍后重试");
				} finally {
					submitting.value = false;
				}
			});
			return _submitForm.apply(this, arguments);
		}
		onMounted(loadOptions);
		return (_ctx, _cache) => {
			const _component_el_result = ElResult;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_alert = ElAlert;
			const _component_el_row = ElRow;
			const _component_el_button = ElButton;
			const _component_el_form = ElForm;
			const _component_el_card = ElCard;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [_cache[12] || (_cache[12] = createBaseVNode("section", { class: "form-hero" }, [createBaseVNode("div", null, [
				createBaseVNode("div", { class: "eyebrow" }, "ZHEHANG · 刻章自助登记"),
				createBaseVNode("h1", null, "刻章资料自助提交"),
				createBaseVNode("p", null, "请填写基本信息,提交后我们会尽快与您联系核对并办理。")
			])], -1)), createVNode(_component_el_card, {
				shadow: "never",
				class: "form-card"
			}, {
				default: withCtx(() => [linkError.value ? (openBlock(), createBlock(_component_el_result, {
					key: 0,
					icon: "warning",
					title: "安全链接不可用",
					"sub-title": linkError.value
				}, null, 8, ["sub-title"])) : submitted.value ? (openBlock(), createBlock(_component_el_result, {
					key: 1,
					icon: "success",
					title: "提交成功",
					"sub-title": "资料已安全提交，我们会尽快联系您；本链接现已失效。"
				})) : (openBlock(), createBlock(_component_el_form, {
					key: 2,
					ref_key: "formRef",
					ref: formRef,
					model: form,
					rules,
					"label-position": "top"
				}, {
					default: withCtx(() => [createVNode(_component_el_row, { gutter: 16 }, {
						default: withCtx(() => [
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, {
									label: "公司名称",
									prop: "companyName"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.companyName,
										"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.companyName = $event),
										placeholder: "刻章单位公司全称"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, {
									label: "法人",
									prop: "legalPerson"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.legalPerson,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.legalPerson = $event),
										placeholder: "请输入法人姓名"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, {
									label: "联系电话",
									prop: "phone"
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.phone,
										"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.phone = $event),
										placeholder: "请输入联系电话"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, {
									label: "印章状态",
									prop: "sealStatus"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.sealStatus,
										"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.sealStatus = $event),
										clearable: "",
										filterable: "",
										style: { "width": "100%" },
										placeholder: "请选择印章状态"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(options.sealStatuses, (s) => {
											return openBlock(), createBlock(_component_el_option, {
												key: s,
												label: s,
												value: s
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "备案状态" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.recordStatus,
										"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.recordStatus = $event),
										clearable: "",
										filterable: "",
										style: { "width": "100%" },
										placeholder: "请选择备案状态"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(options.recordStatuses, (s) => {
											return openBlock(), createBlock(_component_el_option, {
												key: s,
												label: s,
												value: s
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
									label: "刻章城市",
									prop: "sealCity"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: form.sealCity,
										"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.sealCity = $event),
										clearable: "",
										filterable: "",
										style: { "width": "100%" },
										placeholder: "请选择城市"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(options.sealCities, (c) => {
											return openBlock(), createBlock(_component_el_option, {
												key: c,
												label: c,
												value: c
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							form.sealCity && form.sealCity !== "杭州" ? (openBlock(), createBlock(_component_el_col, {
								key: 0,
								span: 24
							}, {
								default: withCtx(() => [createVNode(_component_el_alert, {
									type: "warning",
									closable: false,
									"show-icon": "",
									title: "刻章城市为杭州以外:通常加收 80 元/个,且需提供法人靠白墙半身照,我们会与您确认。",
									style: { "margin-bottom": "12px" }
								})]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, {
									label: "印章材质",
									prop: "sealMaterial"
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: materialList.value,
										"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => materialList.value = $event),
										multiple: "",
										clearable: "",
										style: { "width": "100%" },
										placeholder: "可多选"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(options.sealMaterials, (m) => {
											return openBlock(), createBlock(_component_el_option, {
												key: m,
												label: m,
												value: m
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 24 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "印章类型" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: typeList.value,
										"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => typeList.value = $event),
										multiple: "",
										clearable: "",
										filterable: "",
										style: { "width": "100%" },
										placeholder: "可多选,留空也可"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(options.sealTypes, (t) => {
											return openBlock(), createBlock(_component_el_option, {
												key: t,
												label: t,
												value: t
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 24 }, {
								default: withCtx(() => [createVNode(_component_el_alert, {
									type: "info",
									closable: false,
									"show-icon": "",
									title: "身份证等敏感材料请勿在本页上传；经办人会通过已确认的安全渠道另行收取。",
									style: { "margin-bottom": "12px" }
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件人" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.recipient,
										"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.recipient = $event),
										placeholder: "如需邮寄请填写收件人"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 12 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件地址" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.address,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.address = $event),
										placeholder: "如需邮寄请填写收件地址"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_col, { span: 24 }, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.remark,
										"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.remark = $event),
										type: "textarea",
										rows: 3,
										placeholder: "其他需要说明的信息"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_button, {
						type: "primary",
						size: "large",
						loading: submitting.value,
						onClick: submitForm
					}, {
						default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("提交资料", -1)])]),
						_: 1
					}, 8, ["loading"])])]),
					_: 1
				}, 8, ["model"]))]),
				_: 1
			})])]);
		};
	}
}), [["__scopeId", "data-v-24fa2ff5"]]);
//#endregion
export { public_submit_default as default };

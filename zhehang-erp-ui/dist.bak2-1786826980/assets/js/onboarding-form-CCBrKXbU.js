import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { J as ElCol, W as ElDatePicker, Y as ElRow, _t as ElFormItem, gt as ElForm, it as ElTag, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, tt as ElCard, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { s as onboardingApi } from "./hrm-x4tssCAy.js";
//#region src/views/hrm/onboarding-form.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "onboarding-public" };
var _hoisted_2 = { class: "form-shell" };
var _hoisted_3 = { class: "form-hero" };
var _hoisted_4 = { key: 0 };
var _hoisted_5 = { class: "form-actions" };
//#endregion
//#region src/views/hrm/onboarding-form.vue
var onboarding_form_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "onboarding-form",
	setup(__props) {
		const route = useRoute();
		const token = String(route.params.token || "");
		const loading = ref(false);
		const submitting = ref(false);
		const submitted = ref(false);
		const errorMessage = ref("");
		const formRef = ref();
		const info = reactive({});
		const formModel = reactive({});
		const fields = ref([]);
		const rules = computed(() => {
			const result = {};
			fields.value.forEach((field) => {
				if (field.required) result[field.key] = [{
					required: true,
					message: `请填写${field.label}`,
					trigger: field.type === "select" ? "change" : "blur"
				}];
			});
			return result;
		});
		const closed = computed(() => submitted.value || Number(info.status) >= 1);
		function statusLabel(status) {
			return {
				0: "待填写",
				1: "已提交",
				2: "已确认",
				3: "Offer已生成",
				4: "Offer已发送",
				5: "员工草稿",
				6: "已入职",
				7: "已取消"
			}[Number(status)] || "待填写";
		}
		function statusType(status) {
			return {
				0: "warning",
				1: "primary",
				2: "success",
				3: "success",
				4: "success",
				5: "success",
				6: "success",
				7: "danger"
			}[Number(status)] || "warning";
		}
		function parseJson(value, fallback) {
			if (!value) return fallback;
			if (typeof value === "object") return value;
			try {
				return JSON.parse(value);
			} catch (_error) {
				return fallback;
			}
		}
		function fillDefaults() {
			fields.value.forEach((field) => {
				if (formModel[field.key] === void 0) formModel[field.key] = "";
			});
			if (!formModel.name && info.name) formModel.name = info.name;
			if (!formModel.phone && info.phone) formModel.phone = info.phone;
			if (!formModel.email && info.email) formModel.email = info.email;
		}
		function readPublicError(error, fallback) {
			var _error$response;
			return (error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || fallback;
		}
		function formatDateTime(value) {
			if (!value) return "-";
			return String(value).replace("T", " ").slice(0, 16);
		}
		function loadInfo() {
			return _loadInfo.apply(this, arguments);
		}
		function _loadInfo() {
			_loadInfo = _asyncToGenerator(function* () {
				loading.value = true;
				errorMessage.value = "";
				try {
					const res = yield onboardingApi.publicInfo(token);
					Object.assign(info, res.data || {});
					fields.value = parseJson(info.formSchema, []);
					Object.assign(formModel, parseJson(info.formData, {}));
					fillDefaults();
					submitted.value = Number(info.status) >= 1;
				} catch (error) {
					errorMessage.value = readPublicError(error, "登记链接无效或已过期，请联系 HR 重新发送。");
				} finally {
					loading.value = false;
				}
			});
			return _loadInfo.apply(this, arguments);
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
					yield onboardingApi.publicSubmit(token, { formData: formModel });
					submitted.value = true;
					info.status = 1;
					ElMessage.success("登记表已提交");
				} catch (error) {
					const message = readPublicError(error, "提交失败，请联系 HR 处理。");
					errorMessage.value = message;
					ElMessage.error(message);
				} finally {
					submitting.value = false;
				}
			});
			return _submitForm.apply(this, arguments);
		}
		onMounted(loadInfo);
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_button = ElButton;
			const _component_el_card = ElCard;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createBaseVNode("section", _hoisted_3, [createBaseVNode("div", null, [
				_cache[0] || (_cache[0] = createBaseVNode("div", { class: "eyebrow" }, "ZHEHANG · 入职登记", -1)),
				createBaseVNode("h1", null, toDisplayString(info.name || "候选人") + "，请完善入职信息", 1),
				createBaseVNode("p", null, [createTextVNode(toDisplayString(info.positionName || "待入职岗位") + " ", 1), info.tokenExpiresAt ? (openBlock(), createElementBlock("span", _hoisted_4, " · 有效期至 " + toDisplayString(formatDateTime(info.tokenExpiresAt)), 1)) : createCommentVNode("", true)])
			]), createVNode(_component_el_tag, {
				type: statusType(info.status),
				size: "large"
			}, {
				default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(info.status)), 1)]),
				_: 1
			}, 8, ["type"])]), withDirectives((openBlock(), createBlock(_component_el_card, {
				shadow: "never",
				class: "form-card"
			}, {
				default: withCtx(() => [errorMessage.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					title: errorMessage.value,
					type: "error",
					"show-icon": "",
					closable: false,
					class: "submit-alert"
				}, null, 8, ["title"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					submitted.value ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						title: "信息已提交，HR 确认后会继续发送 Offer。",
						type: "success",
						"show-icon": "",
						closable: false,
						class: "submit-alert"
					})) : createCommentVNode("", true),
					createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: formModel,
						rules: rules.value,
						"label-position": "top"
					}, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 16 }, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(fields.value, (field) => {
								return openBlock(), createBlock(_component_el_col, {
									key: field.key,
									span: field.type === "textarea" ? 24 : 12
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: field.label,
										prop: field.key
									}, {
										default: withCtx(() => [field.type === "textarea" ? (openBlock(), createBlock(_component_el_input, {
											key: 0,
											modelValue: formModel[field.key],
											"onUpdate:modelValue": ($event) => formModel[field.key] = $event,
											type: "textarea",
											rows: 4,
											placeholder: field.placeholder || `请输入${field.label}`
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										])) : field.type === "select" ? (openBlock(), createBlock(_component_el_select, {
											key: 1,
											modelValue: formModel[field.key],
											"onUpdate:modelValue": ($event) => formModel[field.key] = $event,
											clearable: "",
											filterable: "",
											style: { "width": "100%" },
											placeholder: field.placeholder || `请选择${field.label}`
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (item) => {
												return openBlock(), createBlock(_component_el_option, {
													key: item,
													label: item,
													value: item
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 2
										}, 1032, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										])) : field.type === "date" ? (openBlock(), createBlock(_component_el_date_picker, {
											key: 2,
											modelValue: formModel[field.key],
											"onUpdate:modelValue": ($event) => formModel[field.key] = $event,
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" },
											placeholder: field.placeholder || `请选择${field.label}`
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										])) : (openBlock(), createBlock(_component_el_input, {
											key: 3,
											modelValue: formModel[field.key],
											"onUpdate:modelValue": ($event) => formModel[field.key] = $event,
											placeholder: field.placeholder || `请输入${field.label}`
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"placeholder"
										]))]),
										_: 2
									}, 1032, ["label", "prop"])]),
									_: 2
								}, 1032, ["span"]);
							}), 128))]),
							_: 1
						})]),
						_: 1
					}, 8, ["model", "rules"]),
					createBaseVNode("div", _hoisted_5, [createVNode(_component_el_button, {
						type: "primary",
						size: "large",
						loading: submitting.value,
						disabled: closed.value,
						onClick: submitForm
					}, {
						default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("提交登记表", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])])
				], 64))]),
				_: 1
			})), [[_directive_loading, loading.value]])])]);
		};
	}
}), [["__scopeId", "data-v-621cc9a7"]]);
//#endregion
export { onboarding_form_default as default };

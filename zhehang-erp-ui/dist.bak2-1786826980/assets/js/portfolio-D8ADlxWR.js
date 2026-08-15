import { $ as createCommentVNode, Dt as renderList, G as Fragment, Gt as isRef, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, Ct as arrow_left_default, D as ElPagination, Er as withKeys, J as ElCol, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, Un as search_default, V as ElDialog, W as ElDatePicker, Wt as copy_document_default, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, c as ElSegmented, g as ElTable, gt as ElForm, ht as ElTooltip, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pt as ElScrollbar, rt as ElSelect, s as vLoading, ur as upload_default, wt as arrow_right_default } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as employeeApi } from "./org-DaVetSL-.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { n as customerApi, r as leadApi } from "./crm-DKTvHmZR.js";
import { t as Customer360Drawer_default } from "./Customer360Drawer-DN258pWR.js";
import { a as leadSourceLabel, n as LEAD_SOURCE_OPTIONS, r as LEAD_SOURCE_PLATFORM_OPTIONS } from "./lead-source-B8JVaFME.js";
import { t as useFieldOptions } from "./useFieldOptions-Ck3wetP1.js";
//#region src/views/customer/lead-create-dialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "lead-form-section" };
var _hoisted_2$1 = { class: "lead-form-section" };
var _hoisted_3$1 = { class: "lead-doc-list" };
var _hoisted_4$1 = {
	key: 0,
	class: "field-tip"
};
var _hoisted_5$1 = { class: "lead-form-section" };
var _hoisted_6$1 = { class: "lead-form-section" };
//#endregion
//#region src/views/customer/lead-create-dialog.vue
var lead_create_dialog_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "lead-create-dialog",
	props: { modelValue: { type: Boolean } },
	emits: ["update:modelValue", "saved"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (v) => emit("update:modelValue", v)
		});
		const userStore = useUserStore();
		const currentUserId = computed(() => {
			var _userStore$userInfo$i, _userStore$userInfo;
			return (_userStore$userInfo$i = (_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id) !== null && _userStore$userInfo$i !== void 0 ? _userStore$userInfo$i : null;
		});
		const formRef = ref();
		const saving = ref(false);
		const SOURCE_PLATFORM_OPTIONS = LEAD_SOURCE_PLATFORM_OPTIONS;
		const FALLBACK_BUSINESS_OPTIONS = [
			"工商注册",
			"工商变更",
			"代账",
			"代理记账",
			"税务合规",
			"商标业务",
			"专利业务",
			"项目申报",
			"刻章业务",
			"未知业务"
		];
		const FALLBACK_FOLLOW_STAGE_OPTIONS = [
			"线索接收",
			"需求沟通",
			"需求答疑",
			"签单收款",
			"移交结束交付"
		];
		const FALLBACK_VALIDITY_OPTIONS = [
			"有效",
			"无效",
			"待定"
		];
		const { loading: consultBusinessLoading, resolved: consultBusinessResolved, defaultValue: consultBusinessDefault, withHistoricalValues: withConsultBusinessHistory, isSelectable: isConsultBusinessSelectable } = useFieldOptions("crm_consult_business", FALLBACK_BUSINESS_OPTIONS);
		const validityOptions = FALLBACK_VALIDITY_OPTIONS;
		const followStageOptions = FALLBACK_FOLLOW_STAGE_OPTIONS;
		function blankForm() {
			return {
				id: 0,
				name: "",
				company: "",
				legalPerson: "",
				phone: "",
				registerDate: "",
				establishedDate: "",
				approvedDate: "",
				email: "",
				registerStatus: "",
				enterpriseScale: "",
				enterpriseType: "",
				registeredCapital: "",
				paidCapital: "",
				creditCode: "",
				insuredCount: "",
				insuredYear: "",
				registerAddress: "",
				latestAddress: "",
				businessScope: "",
				region: "",
				sourceDetail: "",
				source: 1,
				status: 1,
				remark: "",
				leadNo: "",
				sourcePlatform: "",
				storeBrand: "",
				consultBusiness: "",
				nickname: "",
				wechatNo: "",
				virtualPhone: "",
				validity: "",
				followStatus: "",
				dealAmount: "",
				createTime: ""
			};
		}
		const formData = reactive(blankForm());
		const dealBusinessArr = ref([]);
		const fieldOptionsReady = computed(() => consultBusinessResolved.value);
		const consultBusinessSelectOptions = computed(() => withConsultBusinessHistory(formData.consultBusiness));
		const dealBusinessSelectOptions = computed(() => withConsultBusinessHistory(dealBusinessArr.value));
		const leadDocs = ref({});
		const leadDocList = computed(() => Object.entries(leadDocs.value).map(([key, v]) => _objectSpread2({ key }, v)));
		let leadDocSeq = 0;
		function resetFormData() {
			var _formRef$value, _formRef$value$clearV;
			Object.assign(formData, blankForm());
			dealBusinessArr.value = [];
			leadDocs.value = {};
			(_formRef$value = formRef.value) === null || _formRef$value === void 0 || (_formRef$value$clearV = _formRef$value.clearValidate) === null || _formRef$value$clearV === void 0 || _formRef$value$clearV.call(_formRef$value);
		}
		function applyFieldDefaults() {
			if (!fieldOptionsReady.value) return;
			if (!formData.consultBusiness && consultBusinessDefault.value) formData.consultBusiness = consultBusinessDefault.value;
		}
		watch(() => props.modelValue, (v) => {
			if (v) {
				resetFormData();
				applyFieldDefaults();
			}
		});
		watch([fieldOptionsReady, consultBusinessDefault], () => {
			if (props.modelValue) applyFieldDefaults();
		});
		function validateFieldOptionSelections() {
			if (!fieldOptionsReady.value) {
				ElMessage.warning("字段选项正在加载，请稍后保存");
				return false;
			}
			const invalid = formData.consultBusiness && !isConsultBusinessSelectable(formData.consultBusiness) || dealBusinessArr.value.some((value) => !isConsultBusinessSelectable(value));
			if (invalid) ElMessage.warning("所选字段值已停用，请重新选择");
			return !invalid;
		}
		const uploadLeadDoc = function() {
			var _ref = _asyncToGenerator(function* (options) {
				try {
					var _res$data;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					leadDocSeq++;
					leadDocs.value = _objectSpread2(_objectSpread2({}, leadDocs.value), {}, { [`doc-${Date.now()}-${leadDocSeq}`]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadLeadDoc(_x) {
				return _ref.apply(this, arguments);
			};
		}();
		const removeLeadDoc = (key) => {
			const d = _objectSpread2({}, leadDocs.value);
			delete d[key];
			leadDocs.value = d;
		};
		const onLeadDocPaste = (e) => {
			var _e$clipboardData;
			const items = (_e$clipboardData = e.clipboardData) === null || _e$clipboardData === void 0 ? void 0 : _e$clipboardData.items;
			if (!items) return;
			for (const it of Array.from(items)) if (it.type.startsWith("image/")) {
				const file = it.getAsFile();
				if (file) uploadLeadDoc({ file });
			}
		};
		const derivedMonth = computed(() => {
			const t = formData.createTime || "";
			return t ? String(t).slice(0, 7) : "";
		});
		const dealAmountNum = computed({
			get: () => {
				const v = formData.dealAmount;
				if (v === "" || v == null) return void 0;
				const n = Number(v);
				return Number.isNaN(n) ? void 0 : n;
			},
			set: (val) => {
				formData.dealAmount = val == null ? "" : val;
			}
		});
		const formRules = {
			company: [{
				required: true,
				message: "请输入公司名称",
				trigger: "blur"
			}],
			source: [{
				required: true,
				message: "请选择来源",
				trigger: "change"
			}],
			legalPerson: [{
				required: true,
				message: "请输入联系人（法定代表人）",
				trigger: "blur"
			}],
			phone: [{
				required: true,
				message: "请输入有效手机号",
				trigger: "blur"
			}],
			registeredCapital: [{
				required: true,
				message: "请输入注册资本",
				trigger: "blur"
			}],
			creditCode: [{
				required: true,
				message: "请输入统一社会信用代码",
				trigger: "blur"
			}],
			establishedDate: [{
				required: true,
				message: "请选择成立日期",
				trigger: "change"
			}],
			registerAddress: [{
				required: true,
				message: "请输入注册地址",
				trigger: "blur"
			}]
		};
		const onPhoneInput = (val) => {
			const cleaned = (val || "").replace(/\s/g, "");
			if (cleaned !== val) formData.phone = cleaned;
		};
		const onPhonePaste = (e) => {
			var _e$clipboardData2;
			const text = (_e$clipboardData2 = e.clipboardData) === null || _e$clipboardData2 === void 0 ? void 0 : _e$clipboardData2.getData("text");
			if (text && /\s/.test(text)) {
				e.preventDefault();
				formData.phone = ((formData.phone || "") + text).replace(/\s/g, "");
			}
		};
		const normalizeMoneyText = (value) => {
			if (!value) return "";
			const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
			return match ? match[0] : "";
		};
		function buildLeadPayload() {
			const companyName = (formData.company || "").trim();
			const legalPerson = (formData.legalPerson || formData.name || "").trim();
			return {
				id: formData.id,
				name: legalPerson || companyName,
				company: companyName,
				legalPerson,
				phone: formData.phone || "",
				email: formData.email || "",
				registerStatus: formData.registerStatus || "",
				source: formData.source || 1,
				status: formData.status || 1,
				remark: formData.remark || "",
				region: formData.region || "",
				enterpriseScale: formData.enterpriseScale || "",
				enterpriseType: formData.enterpriseType || "",
				registeredCapital: normalizeMoneyText(String(formData.registeredCapital || "")) || null,
				paidCapital: formData.paidCapital || "",
				establishedDate: formData.establishedDate || formData.registerDate || null,
				approvedDate: formData.approvedDate || null,
				creditCode: formData.creditCode || "",
				insuredCount: formData.insuredCount || "",
				insuredYear: formData.insuredYear || "",
				registerAddress: formData.registerAddress || "",
				latestAddress: formData.latestAddress || "",
				businessScope: formData.businessScope || "",
				sourceDetail: formData.sourceDetail || "",
				sourcePlatform: formData.sourcePlatform || "",
				storeBrand: formData.storeBrand || "",
				consultBusiness: formData.consultBusiness || "",
				nickname: formData.nickname || "",
				wechatNo: formData.wechatNo || "",
				virtualPhone: formData.virtualPhone || "",
				validity: formData.validity || "",
				followStatus: formData.followStatus || "",
				dealAmount: formData.dealAmount === "" || formData.dealAmount == null ? null : Number(formData.dealAmount),
				dealBusiness: dealBusinessArr.value.join(","),
				attachments: JSON.stringify(Object.values(leadDocs.value))
			};
		}
		const submitForm = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!formRef.value) return;
				if (!validateFieldOptionSelections()) return;
				yield formRef.value.validate(function() {
					var _ref2 = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						const payload = buildLeadPayload();
						payload.ownerId = currentUserId.value;
						payload.status = 1;
						saving.value = true;
						try {
							yield leadApi.create(payload);
						} catch (_unused2) {
							saving.value = false;
							return;
						}
						saving.value = false;
						ElMessage.success("已创建");
						visible.value = false;
						emit("saved");
					});
					return function(_x2) {
						return _ref2.apply(this, arguments);
					};
				}());
			});
			return function submitForm() {
				return _ref3.apply(this, arguments);
			};
		}();
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_row = ElRow;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input_number = ElInputNumber;
			const _component_el_button = ElButton;
			const _component_el_upload = ElUpload;
			const _component_el_tag = ElTag;
			const _component_el_form = ElForm;
			const _component_el_scrollbar = ElScrollbar;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				modelValue: unref(visible),
				"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => isRef(visible) ? visible.value = $event : null),
				title: "新建客户",
				width: "980px",
				top: "5vh",
				class: "lead-form-dialog",
				"destroy-on-close": ""
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[33] || (_cache[33] = ($event) => visible.value = false) }, {
					default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: unref(saving),
					disabled: !unref(fieldOptionsReady),
					onClick: submitForm
				}, {
					default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("保存", -1)])]),
					_: 1
				}, 8, ["loading", "disabled"])]),
				default: withCtx(() => [createVNode(_component_el_scrollbar, { "max-height": "70vh" }, {
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: unref(formData),
						rules: formRules,
						"label-position": "top",
						class: "lead-form"
					}, {
						default: withCtx(() => [
							createBaseVNode("section", _hoisted_1$1, [_cache[35] || (_cache[35] = createBaseVNode("div", { class: "section-title" }, "基础信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "公司名称",
											prop: "company"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).company,
												"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => unref(formData).company = $event),
												placeholder: "请输入企业全称"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "联系人（法定代表人）",
											prop: "legalPerson"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).legalPerson,
												"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => unref(formData).legalPerson = $event),
												placeholder: "默认填写法定代表人"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "有效手机号",
											prop: "phone"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).phone,
												"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => unref(formData).phone = $event),
												placeholder: "手机号/可拨打电话",
												onInput: onPhoneInput,
												onPaste: onPhonePaste
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "来源",
											prop: "source"
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(formData).source,
												"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => unref(formData).source = $event),
												placeholder: "请选择来源",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(LEAD_SOURCE_OPTIONS), (item) => {
													return openBlock(), createBlock(_component_el_option, {
														key: item.value,
														label: item.label,
														value: item.value
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})]),
							createBaseVNode("section", _hoisted_2$1, [_cache[37] || (_cache[37] = createBaseVNode("div", { class: "section-title" }, "投流客资信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户编号" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).leadNo,
												"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => unref(formData).leadNo = $event),
												readonly: "",
												placeholder: "保存后自动生成"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "创建时间" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: unref(formData).createTime,
												"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => unref(formData).createTime = $event),
												type: "datetime",
												placeholder: "默认取保存时间",
												"value-format": "YYYY-MM-DD HH:mm:ss",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "月份（按创建时间）" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												"model-value": unref(derivedMonth),
												readonly: "",
												placeholder: "保存后自动派生"
											}, null, 8, ["model-value"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "来源平台" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(formData).sourcePlatform,
												"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => unref(formData).sourcePlatform = $event),
												placeholder: "请选择来源平台",
												clearable: "",
												filterable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(SOURCE_PLATFORM_OPTIONS), (p) => {
													return openBlock(), createBlock(_component_el_option, {
														key: p,
														label: p,
														value: p
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "门店&品牌词" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).storeBrand,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => unref(formData).storeBrand = $event),
												placeholder: "门店 / 品牌词"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "咨询业务" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(formData).consultBusiness,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => unref(formData).consultBusiness = $event),
												placeholder: "请选择咨询业务",
												clearable: "",
												filterable: "",
												style: { "width": "100%" },
												loading: unref(consultBusinessLoading),
												disabled: !unref(consultBusinessResolved)
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(consultBusinessSelectOptions), (b) => {
													return openBlock(), createBlock(_component_el_option, {
														key: b.value,
														label: b.label,
														value: b.value,
														disabled: b.disabled
													}, null, 8, [
														"label",
														"value",
														"disabled"
													]);
												}), 128))]),
												_: 1
											}, 8, [
												"modelValue",
												"loading",
												"disabled"
											])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户昵称" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).nickname,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => unref(formData).nickname = $event),
												placeholder: "客户昵称"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户微信" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).wechatNo,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => unref(formData).wechatNo = $event),
												placeholder: "微信号（可含 -）"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "虚拟电话" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).virtualPhone,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => unref(formData).virtualPhone = $event),
												placeholder: "虚拟电话（可含 -）"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否有效" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(formData).validity,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => unref(formData).validity = $event),
												placeholder: "请选择",
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(validityOptions), (v) => {
													return openBlock(), createBlock(_component_el_option, {
														key: v,
														label: v,
														value: v
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 16 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "跟进状态" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(formData).followStatus,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => unref(formData).followStatus = $event),
												placeholder: "请选择跟进状态",
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(followStageOptions), (s) => {
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
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "成交金额（元）" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: unref(dealAmountNum),
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => isRef(dealAmountNum) ? dealAmountNum.value = $event : null),
												min: 0,
												precision: 2,
												controls: false,
												placeholder: "0.00",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 16 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "实际成交业务" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: unref(dealBusinessArr),
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => isRef(dealBusinessArr) ? dealBusinessArr.value = $event : null),
												multiple: "",
												placeholder: "可多选",
												filterable: "",
												"collapse-tags": "",
												"collapse-tags-tooltip": "",
												style: { "width": "100%" },
												loading: unref(consultBusinessLoading),
												disabled: !unref(consultBusinessResolved)
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(dealBusinessSelectOptions), (b) => {
													return openBlock(), createBlock(_component_el_option, {
														key: b.value,
														label: b.label,
														value: b.value,
														disabled: b.disabled
													}, null, 8, [
														"label",
														"value",
														"disabled"
													]);
												}), 128))]),
												_: 1
											}, 8, [
												"modelValue",
												"loading",
												"disabled"
											])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "附件（支持粘贴图片）" }, {
											default: withCtx(() => [createBaseVNode("div", {
												class: "lead-doc-uploader",
												onPaste: onLeadDocPaste
											}, [createVNode(_component_el_upload, {
												"show-file-list": false,
												"http-request": (o) => uploadLeadDoc(o),
												accept: "image/*,.pdf",
												multiple: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_button, { icon: unref(upload_default) }, {
													default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("上传附件", -1)])]),
													_: 1
												}, 8, ["icon"])]),
												_: 1
											}, 8, ["http-request"]), createBaseVNode("div", _hoisted_3$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(leadDocList), (d) => {
												return openBlock(), createBlock(_component_el_tag, {
													key: d.key,
													closable: "",
													type: "info",
													class: "lead-doc-tag",
													onClose: ($event) => removeLeadDoc(d.key)
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(d.fileName), 1)]),
													_: 2
												}, 1032, ["onClose"]);
											}), 128)), !unref(leadDocList).length ? (openBlock(), createElementBlock("span", _hoisted_4$1, "可点击上传或在此区域直接粘贴（Ctrl+V）图片")) : createCommentVNode("", true)])], 32)]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})]),
							createBaseVNode("section", _hoisted_5$1, [_cache[38] || (_cache[38] = createBaseVNode("div", { class: "section-title" }, "工商信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "登记状态" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).registerStatus,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => unref(formData).registerStatus = $event),
												placeholder: "如：存续、在业、注销"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业规模" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).enterpriseScale,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => unref(formData).enterpriseScale = $event),
												placeholder: "如：1-49人"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业类型" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).enterpriseType,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => unref(formData).enterpriseType = $event),
												placeholder: "如：有限责任公司"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "注册资本",
											prop: "registeredCapital"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).registeredCapital,
												"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => unref(formData).registeredCapital = $event),
												placeholder: "金额或数值"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "实缴资本" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).paidCapital,
												"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => unref(formData).paidCapital = $event),
												placeholder: "如：20万人民币"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "统一社会信用代码",
											prop: "creditCode"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).creditCode,
												"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => unref(formData).creditCode = $event),
												placeholder: "请输入统一社会信用代码"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "成立日期",
											prop: "establishedDate"
										}, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: unref(formData).establishedDate,
												"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => unref(formData).establishedDate = $event),
												type: "date",
												placeholder: "选择日期",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "核准日期" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: unref(formData).approvedDate,
												"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => unref(formData).approvedDate = $event),
												type: "date",
												placeholder: "选择日期",
												"value-format": "YYYY-MM-DD",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 4 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "参保人数" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).insuredCount,
												"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => unref(formData).insuredCount = $event),
												placeholder: "人数"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 4 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属年报" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).insuredYear,
												"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => unref(formData).insuredYear = $event),
												placeholder: "年份"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属区域" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).region,
												"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => unref(formData).region = $event),
												placeholder: "省 / 市 / 区县"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "来源说明/来源细分" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).sourceDetail,
												"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => unref(formData).sourceDetail = $event),
												maxlength: "50",
												placeholder: "如：推广活动、渠道批次或来源补充"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})]),
							createBaseVNode("section", _hoisted_6$1, [_cache[40] || (_cache[40] = createBaseVNode("div", { class: "section-title" }, "地址与经营范围", -1)), createVNode(_component_el_row, { gutter: 16 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "注册地址",
											prop: "registerAddress"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).registerAddress,
												"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => unref(formData).registerAddress = $event),
												type: "textarea",
												rows: 2,
												placeholder: "工商注册地址"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "最新地址" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).latestAddress,
												"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => unref(formData).latestAddress = $event),
												type: "textarea",
												rows: 2,
												placeholder: "实际经营地址/客户联系地址（区别于注册地址）"
											}, null, 8, ["modelValue"]), _cache[39] || (_cache[39] = createBaseVNode("div", { class: "field-tip" }, "填写客户当前实际经营地址或联系地址，与工商注册地址区分", -1))]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "邮箱" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).email,
												"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => unref(formData).email = $event),
												placeholder: "企业邮箱"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).remark,
												"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => unref(formData).remark = $event),
												placeholder: "补充说明"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "经营范围" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: unref(formData).businessScope,
												"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => unref(formData).businessScope = $event),
												type: "textarea",
												rows: 4,
												placeholder: "企业经营范围"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})])
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				})]),
				_: 1
			}, 8, ["modelValue"]);
		};
	}
}), [["__scopeId", "data-v-24b5b7c6"]]);
//#endregion
//#region src/views/customer/portfolio.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "portfolio-page" };
var _hoisted_2 = { class: "resource-header" };
var _hoisted_3 = { class: "resource-title" };
var _hoisted_4 = { class: "resource-summary" };
var _hoisted_5 = { class: "filter-bar" };
var _hoisted_6 = {
	key: 0,
	class: "filter-left"
};
var _hoisted_7 = {
	key: 1,
	class: "filter-left formal-filters"
};
var _hoisted_8 = { class: "filter-right" };
var _hoisted_9 = { class: "customer-workspace" };
var _hoisted_10 = { class: "attention-row" };
var _hoisted_11 = {
	key: 2,
	class: "scope-switch"
};
var _hoisted_12 = { class: "attention-total" };
var _hoisted_13 = {
	key: 0,
	class: "batch-bar"
};
var _hoisted_14 = { class: "customer-cell" };
var _hoisted_15 = ["onClick"];
var _hoisted_16 = { class: "contact-cell" };
var _hoisted_17 = { key: 0 };
var _hoisted_18 = { key: 1 };
var _hoisted_19 = { class: "stack-cell" };
var _hoisted_20 = { class: "follow-cell" };
var _hoisted_21 = {
	key: 0,
	class: "follow-cell"
};
var _hoisted_22 = { class: "row-actions" };
var _hoisted_23 = { class: "customer-cell" };
var _hoisted_24 = ["onClick"];
var _hoisted_25 = { class: "contact-cell" };
var _hoisted_26 = { key: 0 };
var _hoisted_27 = { key: 1 };
var _hoisted_28 = { class: "stack-cell" };
var _hoisted_29 = { key: 0 };
var _hoisted_30 = {
	key: 0,
	class: "follow-cell"
};
var _hoisted_31 = { class: "business-cell" };
var _hoisted_32 = { key: 1 };
var _hoisted_33 = { key: 2 };
var _hoisted_34 = { key: 0 };
var _hoisted_35 = { key: 0 };
var _hoisted_36 = { key: 1 };
var _hoisted_37 = {
	key: 0,
	class: "arrears-cell"
};
var _hoisted_38 = { key: 0 };
var _hoisted_39 = {
	key: 1,
	class: "muted"
};
var _hoisted_40 = { class: "row-actions" };
var _hoisted_41 = { class: "pagination-row" };
//#endregion
//#region src/views/customer/portfolio.vue
var portfolio_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "portfolio",
	setup(__props) {
		const router = useRouter();
		const route = useRoute();
		const loading = ref(false);
		const initialCustomerView = route.query.view === "formal" ? "formal" : "active";
		const initialKeyword = typeof route.query.keyword === "string" ? route.query.keyword : "";
		const customerView = ref(initialCustomerView);
		const leadRows = ref([]);
		const leadTableRef = ref();
		const leadSelection = ref([]);
		const batchReturning = ref(false);
		const leadTotal = ref(0);
		const leadAttention = ref("all");
		const leadSummary = reactive({
			total: 0,
			today: 0,
			warning: 0
		});
		const formalCustomerTotal = ref(0);
		const rows = ref([]);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(20);
		const attention = ref("all");
		const customer360Visible = ref(false);
		const selectedCustomerId = ref(null);
		const selectedLeadId = ref(null);
		const ownerOptions = ref([]);
		const stats = ref(emptyStats());
		let portfolioRequestSerial = 0;
		const filters = reactive({
			keyword: initialKeyword,
			level: void 0,
			status: void 0,
			ownerId: void 0,
			serviceType: ""
		});
		const leadFilters = reactive({
			keyword: initialKeyword,
			source: void 0,
			intentLevel: void 0
		});
		const userStore = useUserStore();
		const myRoles = computed(() => userStore.roles || []);
		const isBossAdmin = computed(() => myRoles.value.some((r) => [
			"admin",
			"boss",
			"super_admin",
			"sys_admin"
		].includes(r)));
		const isDeptManager = computed(() => myRoles.value.some((r) => ["dept_manager", "manager"].includes(r)));
		const canSeeAll = computed(() => isBossAdmin.value || isDeptManager.value);
		const scopeAllLabel = computed(() => isBossAdmin.value ? "公司客户" : "部门客户");
		const leadScope = ref("mine");
		const createDialogVisible = ref(false);
		const customerViewOptions = [{
			label: "跟进中客户",
			value: "active"
		}, {
			label: "已成交客户",
			value: "formal"
		}];
		const sourceOptions = LEAD_SOURCE_OPTIONS;
		const intentLevelOptions = [
			{
				value: "A",
				label: "A类 高意向"
			},
			{
				value: "B",
				label: "B类 意向"
			},
			{
				value: "C",
				label: "C类 潜在意向"
			},
			{
				value: "D",
				label: "D类 无意向"
			},
			{
				value: "E",
				label: "E类 无效客户"
			}
		];
		const levelOptions = [
			{
				value: "A",
				label: "A类 重点"
			},
			{
				value: "B",
				label: "B类 稳定维护"
			},
			{
				value: "C",
				label: "C类 一般"
			},
			{
				value: "D",
				label: "D类 低频"
			},
			{
				value: "F",
				label: "F类 暂停"
			}
		];
		const attentionOptions = [
			{
				label: "全部客户",
				value: "all"
			},
			{
				label: "今天跟进",
				value: "today"
			},
			{
				label: "逾期跟进",
				value: "overdue"
			},
			{
				label: "交接处理中",
				value: "handover"
			},
			{
				label: "存在欠费",
				value: "arrears"
			}
		];
		const leadAttentionOptions = computed(() => [
			{
				label: "全部客户",
				value: "all"
			},
			{
				label: `今天跟进 ${leadSummary.today}`,
				value: "today"
			},
			{
				label: `回收预警 ${leadSummary.warning}`,
				value: "warning"
			}
		]);
		const currentTotal = computed(() => customerView.value === "active" ? leadTotal.value : total.value);
		onMounted(() => {
			loadCurrentView();
			loadLeadSummary();
			loadFormalSummary();
			loadOwners();
		});
		function emptyStats() {
			return {
				total: 0,
				active: 0,
				dueToday: 0,
				overdue: 0,
				handoverPending: 0,
				arrearsCustomers: 0,
				arrearsAmount: 0
			};
		}
		function readPage(response) {
			var _ref, _response$data, _ref2, _payload$records, _payload$total;
			const payload = (_ref = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response) !== null && _ref !== void 0 ? _ref : {};
			const records = (_ref2 = (_payload$records = payload.records) !== null && _payload$records !== void 0 ? _payload$records : payload.list) !== null && _ref2 !== void 0 ? _ref2 : [];
			return {
				records: Array.isArray(records) ? records : [],
				total: Number((_payload$total = payload.total) !== null && _payload$total !== void 0 ? _payload$total : records.length) || 0
			};
		}
		const looksLikeCompany = (value) => /公司|集团|企业|事务所|中心|工作室|商行|店|厂|合伙/.test(value || "");
		function mapMyLead(raw) {
			const rawName = String((raw === null || raw === void 0 ? void 0 : raw.name) || "");
			return {
				id: Number(raw.id),
				company: raw.company || (looksLikeCompany(rawName) ? rawName : "") || rawName || "未命名客户",
				contactName: raw.legalPerson || (!looksLikeCompany(rawName) ? rawName : "") || raw.contactName || "",
				phone: raw.phone || "",
				source: raw.source,
				intentLevel: normalizeIntentLevel(raw.intentLevel),
				ownerName: raw.ownerName || "",
				followStatus: raw.followStatus || (Number(raw.status) === 2 ? "需求沟通" : "线索接收"),
				lastFollowTime: raw.lastFollowTime,
				lastFollowContent: raw.lastFollowContent || "",
				nextFollowTime: raw.nextFollowTime,
				nextActionTime: raw.nextActionTime,
				nextActionType: raw.nextActionType || "",
				nextActionContent: raw.nextActionContent || ""
			};
		}
		function loadLeadSummary() {
			return _loadLeadSummary.apply(this, arguments);
		}
		function _loadLeadSummary() {
			_loadLeadSummary = _asyncToGenerator(function* () {
				try {
					var _ref3, _response$data2;
					const response = yield leadApi.workbenchSummary(leadScope.value === "all" ? { scope: "all" } : void 0);
					const payload = (_ref3 = (_response$data2 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data2 !== void 0 ? _response$data2 : response) !== null && _ref3 !== void 0 ? _ref3 : {};
					leadSummary.total = Number(payload.myLeadTotal || 0);
					leadSummary.today = Number(payload.todoTotal || 0);
					leadSummary.warning = Number(payload.warningTotal || 0);
				} catch (_unused) {
					Object.assign(leadSummary, {
						total: leadTotal.value,
						today: 0,
						warning: 0
					});
				}
			});
			return _loadLeadSummary.apply(this, arguments);
		}
		function loadFormalSummary() {
			return _loadFormalSummary.apply(this, arguments);
		}
		function _loadFormalSummary() {
			_loadFormalSummary = _asyncToGenerator(function* () {
				try {
					var _response$data3, _ref4, _payload$stats$total, _payload$stats;
					const response = yield customerApi.portfolio({
						pageNum: 1,
						pageSize: 10,
						attention: "all"
					});
					const payload = (_response$data3 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data3 !== void 0 ? _response$data3 : response;
					formalCustomerTotal.value = Number((_ref4 = (_payload$stats$total = payload === null || payload === void 0 || (_payload$stats = payload.stats) === null || _payload$stats === void 0 ? void 0 : _payload$stats.total) !== null && _payload$stats$total !== void 0 ? _payload$stats$total : payload === null || payload === void 0 ? void 0 : payload.total) !== null && _ref4 !== void 0 ? _ref4 : 0);
				} catch (_unused2) {
					formalCustomerTotal.value = total.value;
				}
			});
			return _loadFormalSummary.apply(this, arguments);
		}
		function loadLeadRows() {
			return _loadLeadRows.apply(this, arguments);
		}
		function _loadLeadRows() {
			_loadLeadRows = _asyncToGenerator(function* () {
				const serial = ++portfolioRequestSerial;
				loading.value = true;
				try {
					const params = {
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						name: leadFilters.keyword.trim() || void 0,
						keyword: leadFilters.keyword.trim() || void 0,
						source: leadFilters.source,
						intentLevel: leadFilters.intentLevel,
						scope: leadScope.value === "all" ? "all" : void 0
					};
					const response = leadAttention.value === "today" ? yield leadApi.todoFollow(params) : leadAttention.value === "warning" ? yield leadApi.recycleWarning(params) : yield leadApi.myList(params);
					if (serial !== portfolioRequestSerial) return;
					const page = readPage(response);
					leadRows.value = page.records.map(mapMyLead);
					leadTotal.value = page.total;
					if (leadAttention.value === "all" && !leadFilters.keyword && !leadFilters.source && !leadFilters.intentLevel) leadSummary.total = page.total;
				} catch (error) {
					if (serial !== portfolioRequestSerial) return;
					leadRows.value = [];
					leadTotal.value = 0;
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "跟进中客户加载失败");
				} finally {
					if (serial === portfolioRequestSerial) loading.value = false;
				}
			});
			return _loadLeadRows.apply(this, arguments);
		}
		function loadCurrentView() {
			return customerView.value === "active" ? loadLeadRows() : loadPortfolio();
		}
		function onScopeChange() {
			pageNum.value = 1;
			clearLeadSelection();
			loadLeadRows();
			loadLeadSummary();
		}
		function onLeadCreated() {
			loadLeadRows();
			loadLeadSummary();
		}
		function onLeadSelectionChange(selection) {
			leadSelection.value = selection;
		}
		function clearLeadSelection() {
			var _leadTableRef$value, _leadTableRef$value$c;
			(_leadTableRef$value = leadTableRef.value) === null || _leadTableRef$value === void 0 || (_leadTableRef$value$c = _leadTableRef$value.clearSelection) === null || _leadTableRef$value$c === void 0 || _leadTableRef$value$c.call(_leadTableRef$value);
			leadSelection.value = [];
		}
		function batchReturnToPool() {
			return _batchReturnToPool.apply(this, arguments);
		}
		function _batchReturnToPool() {
			_batchReturnToPool = _asyncToGenerator(function* () {
				if (!leadSelection.value.length) return;
				let reason = "";
				try {
					const { value } = yield ElMessageBox.prompt(`确定把选中的 ${leadSelection.value.length} 家客户退回公海吗?退回后 15 天内您不能再领取同一客户。可填写退回原因(选填):`, "批量退回公海", {
						confirmButtonText: "退回公海",
						cancelButtonText: "再想想",
						inputType: "textarea",
						inputPlaceholder: "如:多次联系无意向"
					});
					reason = (value || "").trim();
				} catch (_unused3) {
					return;
				}
				batchReturning.value = true;
				const count = leadSelection.value.length;
				try {
					yield leadApi.returnToPool(leadSelection.value.map((r) => r.id), reason || "批量退回");
					ElMessage.success(`已退回 ${count} 家客户到公海`);
					clearLeadSelection();
					yield Promise.all([loadLeadRows(), loadLeadSummary()]);
				} catch (_unused4) {
					ElMessage.error("批量退回失败,请稍后再试");
				} finally {
					batchReturning.value = false;
				}
			});
			return _batchReturnToPool.apply(this, arguments);
		}
		function loadPortfolio() {
			return _loadPortfolio.apply(this, arguments);
		}
		function _loadPortfolio() {
			_loadPortfolio = _asyncToGenerator(function* () {
				const serial = ++portfolioRequestSerial;
				loading.value = true;
				try {
					var _response$data4;
					const response = yield customerApi.portfolio({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: filters.keyword.trim() || void 0,
						level: filters.level,
						status: filters.status,
						ownerId: filters.ownerId,
						serviceType: filters.serviceType.trim() || void 0,
						attention: attention.value
					});
					if (serial !== portfolioRequestSerial) return;
					const payload = (_response$data4 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data4 !== void 0 ? _response$data4 : response;
					rows.value = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.records) ? payload.records : [];
					total.value = Number((payload === null || payload === void 0 ? void 0 : payload.total) || 0);
					stats.value = (payload === null || payload === void 0 ? void 0 : payload.stats) || emptyStats();
				} catch (error) {
					if (serial !== portfolioRequestSerial) return;
					rows.value = [];
					total.value = 0;
					stats.value = emptyStats();
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "客户列表加载失败");
				} finally {
					if (serial === portfolioRequestSerial) loading.value = false;
				}
			});
			return _loadPortfolio.apply(this, arguments);
		}
		function loadOwners() {
			return _loadOwners.apply(this, arguments);
		}
		function _loadOwners() {
			_loadOwners = _asyncToGenerator(function* () {
				try {
					var _response$data5;
					const response = yield employeeApi.options();
					const payload = (_response$data5 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data5 !== void 0 ? _response$data5 : response;
					ownerOptions.value = (Array.isArray(payload) ? payload : Array.isArray(payload === null || payload === void 0 ? void 0 : payload.records) ? payload.records : Array.isArray(payload === null || payload === void 0 ? void 0 : payload.list) ? payload.list : []).filter((item) => item.userId && item.status !== 3).map((item) => ({
						userId: Number(item.userId),
						name: item.name || "未命名员工"
					}));
				} catch (_unused5) {
					ownerOptions.value = [];
				}
			});
			return _loadOwners.apply(this, arguments);
		}
		function search() {
			pageNum.value = 1;
			loadCurrentView();
		}
		function resetFilters() {
			if (customerView.value === "active") Object.assign(leadFilters, {
				keyword: "",
				source: void 0,
				intentLevel: void 0
			});
			else Object.assign(filters, {
				keyword: "",
				level: void 0,
				status: void 0,
				ownerId: void 0,
				serviceType: ""
			});
			pageNum.value = 1;
			loadCurrentView();
		}
		function changeCustomerView() {
			pageNum.value = 1;
			loadCurrentView();
		}
		function changeAttention() {
			pageNum.value = 1;
			loadCurrentView();
		}
		function changePageSize() {
			pageNum.value = 1;
			loadCurrentView();
		}
		function openCustomer(row) {
			selectedLeadId.value = null;
			selectedCustomerId.value = row.id;
			customer360Visible.value = true;
		}
		function openLead(row) {
			selectedCustomerId.value = null;
			selectedLeadId.value = row.id;
			customer360Visible.value = true;
		}
		function openHandover(row) {
			router.push({
				path: "/customer/handover",
				query: _objectSpread2({ customerId: String(row.id) }, row.handoverId ? { handoverId: String(row.handoverId) } : { create: "1" })
			});
		}
		function handleCustomerChanged() {
			loadCurrentView();
			loadLeadSummary();
			loadFormalSummary();
		}
		function copyPhone(_x) {
			return _copyPhone.apply(this, arguments);
		}
		function _copyPhone() {
			_copyPhone = _asyncToGenerator(function* (phone) {
				if (!phone) return;
				try {
					yield navigator.clipboard.writeText(phone);
					ElMessage.success("电话号码已复制");
				} catch (_unused6) {
					ElMessage.info(`电话号码：${phone}`);
				}
			});
			return _copyPhone.apply(this, arguments);
		}
		function levelType(level) {
			return {
				A: "danger",
				B: "warning",
				C: "success",
				D: "info",
				E: "info"
			}[String(level || "").toUpperCase()] || "primary";
		}
		function normalizeIntentLevel(value) {
			const level = String(value || "").trim().toUpperCase();
			return [
				"A",
				"B",
				"C",
				"D",
				"E"
			].includes(level) ? level : "";
		}
		function intentLevelLabel(value) {
			var _intentLevelOptions$f;
			return ((_intentLevelOptions$f = intentLevelOptions.find((item) => item.value === normalizeIntentLevel(value))) === null || _intentLevelOptions$f === void 0 ? void 0 : _intentLevelOptions$f.label) || "未分级";
		}
		function contractLabel(status) {
			return {
				1: "草稿",
				2: "待签署",
				3: "签署中",
				4: "已签署",
				5: "执行中",
				6: "已到期",
				7: "已终止"
			}[Number(status)] || "未知";
		}
		function contractType(status) {
			if (status === 4 || status === 5) return "success";
			if (status === 2 || status === 3) return "warning";
			if (status === 6 || status === 7) return "danger";
			return "info";
		}
		function handoverLabel(row) {
			if (row.handoverOverdue) return "交接逾期";
			return {
				pending: "待接收",
				in_progress: "交接中",
				returned: "已退回",
				completed: "已完成"
			}[row.handoverStatus || ""] || "交接中";
		}
		function handoverType(row) {
			if (row.handoverOverdue || row.handoverStatus === "returned") return "danger";
			if (row.handoverStatus === "completed") return "success";
			if (row.handoverStatus === "in_progress") return "warning";
			return "info";
		}
		function sourceLabel(source) {
			return leadSourceLabel(source, "来源未记录");
		}
		function leadFollowOverdue(row) {
			const value = row.nextActionTime || row.nextFollowTime;
			if (!value) return false;
			const date = new Date(String(value).replace("T", " ").replace(/-/g, "/"));
			return !Number.isNaN(date.getTime()) && date.getTime() < Date.now();
		}
		function money(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		function dateOnly(value) {
			return value ? String(value).slice(0, 10) : "-";
		}
		function dateTime(value) {
			return value ? String(value).replace("T", " ").slice(0, 16) : "-";
		}
		return (_ctx, _cache) => {
			const _component_el_segmented = ElSegmented;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_button = ElButton;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tooltip = ElTooltip;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [_cache[19] || (_cache[19] = createBaseVNode("h1", null, "我的客户", -1)), createBaseVNode("p", null, toDisplayString(customerView.value === "active" ? "已领取和已分配给我的客户，持续跟进直到成交。" : "已成交客户的跟进、交接与回款风险。"), 1)]),
					createVNode(_component_el_segmented, {
						class: "resource-tabs",
						modelValue: customerView.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => customerView.value = $event),
						options: customerViewOptions,
						onChange: changeCustomerView
					}, null, 8, ["modelValue"]),
					createBaseVNode("div", _hoisted_4, [
						_cache[20] || (_cache[20] = createTextVNode(" 跟进中 ", -1)),
						createBaseVNode("b", null, toDisplayString(leadSummary.total), 1),
						_cache[21] || (_cache[21] = createTextVNode(" · 已成交 ", -1)),
						createBaseVNode("b", null, toDisplayString(formalCustomerTotal.value), 1)
					])
				]),
				createBaseVNode("section", _hoisted_5, [customerView.value === "active" ? (openBlock(), createElementBlock("div", _hoisted_6, [
					createVNode(_component_el_input, {
						modelValue: leadFilters.keyword,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => leadFilters.keyword = $event),
						class: "keyword-input",
						clearable: "",
						"prefix-icon": unref(search_default),
						placeholder: "搜索公司、联系人或电话",
						onKeyup: withKeys(search, ["enter"]),
						onClear: search
					}, null, 8, ["modelValue", "prefix-icon"]),
					createVNode(_component_el_select, {
						modelValue: leadFilters.source,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => leadFilters.source = $event),
						clearable: "",
						placeholder: "来源"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(sourceOptions), (item) => {
							return openBlock(), createBlock(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: leadFilters.intentLevel,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => leadFilters.intentLevel = $event),
						clearable: "",
						placeholder: "意向等级"
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(intentLevelOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: search
					}, {
						default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, { onClick: resetFilters }, {
						default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("重置", -1)])]),
						_: 1
					})
				])) : (openBlock(), createElementBlock("div", _hoisted_7, [
					createVNode(_component_el_input, {
						modelValue: filters.keyword,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => filters.keyword = $event),
						class: "keyword-input",
						clearable: "",
						"prefix-icon": unref(search_default),
						placeholder: "搜索客户、联系人、电话或负责人",
						onKeyup: withKeys(search, ["enter"]),
						onClear: search
					}, null, 8, ["modelValue", "prefix-icon"]),
					createVNode(_component_el_select, {
						modelValue: filters.level,
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => filters.level = $event),
						clearable: "",
						placeholder: "客户分级"
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(levelOptions, (item) => {
							return createVNode(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: filters.ownerId,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => filters.ownerId = $event),
						clearable: "",
						filterable: "",
						placeholder: "负责人"
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(ownerOptions.value, (item) => {
							return openBlock(), createBlock(_component_el_option, {
								key: item.userId,
								label: item.name,
								value: item.userId
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_input, {
						modelValue: filters.serviceType,
						"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => filters.serviceType = $event),
						clearable: "",
						placeholder: "服务类型",
						onKeyup: withKeys(search, ["enter"])
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: filters.status,
						"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => filters.status = $event),
						clearable: "",
						placeholder: "客户状态"
					}, {
						default: withCtx(() => [createVNode(_component_el_option, {
							label: "正常",
							value: 0
						}), createVNode(_component_el_option, {
							label: "停用",
							value: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(search_default),
						onClick: search
					}, {
						default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("查询", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, { onClick: resetFilters }, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("重置", -1)])]),
						_: 1
					})
				])), createBaseVNode("div", _hoisted_8, [
					createVNode(_component_el_button, {
						icon: unref(arrow_left_default),
						onClick: _cache[9] || (_cache[9] = ($event) => unref(router).push("/customer/perf-board"))
					}, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("返回销售经营台", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						onClick: _cache[10] || (_cache[10] = ($event) => createDialogVisible.value = true)
					}, {
						default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("新建", -1)])]),
						_: 1
					}, 8, ["icon"]),
					createVNode(_component_el_button, {
						icon: unref(refresh_default),
						loading: loading.value,
						onClick: loadCurrentView
					}, {
						default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("刷新", -1)])]),
						_: 1
					}, 8, ["icon", "loading"]),
					createVNode(_component_el_button, {
						icon: unref(arrow_right_default),
						onClick: _cache[11] || (_cache[11] = ($event) => unref(router).push("/customer/workbench"))
					}, {
						default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("去今日工作", -1)])]),
						_: 1
					}, 8, ["icon"])
				])]),
				createBaseVNode("section", _hoisted_9, [
					createBaseVNode("div", _hoisted_10, [
						customerView.value === "active" ? (openBlock(), createBlock(_component_el_segmented, {
							key: 0,
							modelValue: leadAttention.value,
							"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => leadAttention.value = $event),
							options: leadAttentionOptions.value,
							onChange: changeAttention
						}, null, 8, ["modelValue", "options"])) : (openBlock(), createBlock(_component_el_segmented, {
							key: 1,
							modelValue: attention.value,
							"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => attention.value = $event),
							options: attentionOptions,
							onChange: changeAttention
						}, null, 8, ["modelValue"])),
						customerView.value === "active" && canSeeAll.value ? (openBlock(), createElementBlock("div", _hoisted_11, [_cache[31] || (_cache[31] = createBaseVNode("span", { class: "scope-label" }, "查看范围", -1)), createVNode(_component_el_radio_group, {
							modelValue: leadScope.value,
							"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => leadScope.value = $event),
							size: "small",
							onChange: onScopeChange
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_button, { label: "mine" }, {
								default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("我的", -1)])]),
								_: 1
							}), createVNode(_component_el_radio_button, { label: "all" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(scopeAllLabel.value), 1)]),
								_: 1
							})]),
							_: 1
						}, 8, ["modelValue"])])) : createCommentVNode("", true),
						createBaseVNode("span", _hoisted_12, "共 " + toDisplayString(currentTotal.value) + " 位客户", 1)
					]),
					customerView.value === "active" && leadSelection.value.length ? (openBlock(), createElementBlock("div", _hoisted_13, [
						createBaseVNode("span", null, [
							_cache[32] || (_cache[32] = createTextVNode("已选 ", -1)),
							createBaseVNode("b", null, toDisplayString(leadSelection.value.length), 1),
							_cache[33] || (_cache[33] = createTextVNode(" 家客户", -1))
						]),
						createVNode(_component_el_button, {
							size: "small",
							type: "warning",
							plain: "",
							loading: batchReturning.value,
							onClick: batchReturnToPool
						}, {
							default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("批量退回公海", -1)])]),
							_: 1
						}, 8, ["loading"]),
						createVNode(_component_el_button, {
							size: "small",
							text: "",
							onClick: clearLeadSelection
						}, {
							default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("取消选择", -1)])]),
							_: 1
						})
					])) : createCommentVNode("", true),
					customerView.value === "active" ? withDirectives((openBlock(), createBlock(_component_el_table, {
						key: 1,
						ref_key: "leadTableRef",
						ref: leadTableRef,
						data: leadRows.value,
						class: "customer-table",
						"row-key": "id",
						"empty-text": "暂无跟进中客户",
						onSelectionChange: onLeadSelectionChange
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								type: "selection",
								width: "42"
							}),
							createVNode(_component_el_table_column, {
								label: "客户",
								"min-width": "200"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_14, [createVNode(_component_el_tooltip, {
									content: row.company,
									placement: "top",
									"show-after": 400
								}, {
									default: withCtx(() => [createBaseVNode("button", {
										type: "button",
										class: "customer-name",
										onClick: ($event) => openLead(row)
									}, toDisplayString(row.company), 9, _hoisted_15)]),
									_: 2
								}, 1032, ["content"]), createBaseVNode("div", null, [row.intentLevel ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									effect: "plain",
									type: levelType(row.intentLevel)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(intentLevelLabel(row.intentLevel)), 1)]),
									_: 2
								}, 1032, ["type"])) : (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									size: "small",
									effect: "plain",
									type: "info"
								}, {
									default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("未分级", -1)])]),
									_: 1
								})), createBaseVNode("span", null, toDisplayString(sourceLabel(row.source)), 1)])])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "联系人",
								"min-width": "150"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_16, [createBaseVNode("strong", null, toDisplayString(row.contactName || "待补联系人"), 1), row.phone ? (openBlock(), createElementBlock("div", _hoisted_17, [createBaseVNode("span", null, toDisplayString(row.phone), 1), createVNode(_component_el_tooltip, {
									content: "复制电话号码",
									placement: "top"
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										text: "",
										circle: "",
										icon: unref(copy_document_default),
										"aria-label": "复制电话号码",
										onClick: ($event) => copyPhone(row.phone)
									}, null, 8, ["icon", "onClick"])]),
									_: 2
								}, 1024)])) : (openBlock(), createElementBlock("small", _hoisted_18, "电话待补"))])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "销售阶段",
								"min-width": "135"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_19, [createBaseVNode("strong", null, toDisplayString(row.followStatus || "线索接收"), 1), createBaseVNode("span", null, toDisplayString(row.ownerName || "当前销售"), 1)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "最近跟进",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_20, [createBaseVNode("time", null, toDisplayString(dateTime(row.lastFollowTime)), 1), createVNode(_component_el_tooltip, {
									content: row.lastFollowContent || "尚未跟进",
									placement: "top",
									"show-after": 400
								}, {
									default: withCtx(() => [createBaseVNode("p", null, toDisplayString(row.lastFollowContent || "尚未跟进"), 1)]),
									_: 2
								}, 1032, ["content"])])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "下一步",
								"min-width": "190"
							}, {
								default: withCtx(({ row }) => [row.nextActionTime || row.nextFollowTime ? (openBlock(), createElementBlock("div", _hoisted_21, [createBaseVNode("div", null, [leadFollowOverdue(row) ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									type: "danger",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("已逾期", -1)])]),
									_: 1
								})) : createCommentVNode("", true), createBaseVNode("time", null, toDisplayString(dateTime(row.nextActionTime || row.nextFollowTime)), 1)]), createVNode(_component_el_tooltip, {
									content: row.nextActionContent || row.nextActionType || "待补具体计划",
									placement: "top",
									"show-after": 400
								}, {
									default: withCtx(() => [createBaseVNode("p", null, toDisplayString(row.nextActionContent || row.nextActionType || "待补具体计划"), 1)]),
									_: 2
								}, 1032, ["content"])])) : (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									type: "warning",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[38] || (_cache[38] = [createTextVNode("待安排", -1)])]),
									_: 1
								}))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "116",
								fixed: "right",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_22, [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openLead(row)
								}, {
									default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("客户360", -1)])]),
									_: 1
								}, 8, ["onClick"])])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]) : withDirectives((openBlock(), createBlock(_component_el_table, {
						key: 2,
						data: rows.value,
						class: "customer-table",
						"row-key": "id",
						"empty-text": "暂无客户"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "客户",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_23, [createVNode(_component_el_tooltip, {
									content: row.name || "未命名客户",
									placement: "top",
									"show-after": 400
								}, {
									default: withCtx(() => [createBaseVNode("button", {
										type: "button",
										class: "customer-name",
										onClick: ($event) => openCustomer(row)
									}, toDisplayString(row.name || "未命名客户"), 9, _hoisted_24)]),
									_: 2
								}, 1032, ["content"]), createBaseVNode("div", null, [row.level ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									effect: "plain",
									type: levelType(row.level)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.level) + "类", 1)]),
									_: 2
								}, 1032, ["type"])) : createCommentVNode("", true), createBaseVNode("span", null, toDisplayString(row.status === 1 ? "已停用" : row.source || "来源未记录"), 1)])])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "联系人",
								"min-width": "140"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_25, [createBaseVNode("strong", null, toDisplayString(row.contactName || "待补联系人"), 1), row.contactPhone ? (openBlock(), createElementBlock("div", _hoisted_26, [createBaseVNode("span", null, toDisplayString(row.contactPhone), 1), createVNode(_component_el_tooltip, {
									content: "复制电话号码",
									placement: "top"
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										text: "",
										circle: "",
										icon: unref(copy_document_default),
										"aria-label": "复制电话号码",
										onClick: ($event) => copyPhone(row.contactPhone)
									}, null, 8, ["icon", "onClick"])]),
									_: 2
								}, 1024)])) : (openBlock(), createElementBlock("small", _hoisted_27, "电话待补"))])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "负责人 / 服务",
								"min-width": "130"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_28, [
									createBaseVNode("strong", null, toDisplayString(row.ownerName || "未分配"), 1),
									createBaseVNode("span", null, toDisplayString(row.servicePackage || "服务待确认"), 1),
									row.billingCycle ? (openBlock(), createElementBlock("small", _hoisted_29, toDisplayString(row.billingCycle), 1)) : createCommentVNode("", true)
								])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "下一步跟进",
								"min-width": "170"
							}, {
								default: withCtx(({ row }) => [row.nextFollowTime ? (openBlock(), createElementBlock("div", _hoisted_30, [createBaseVNode("div", null, [row.followOverdue ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									type: "danger",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("已逾期", -1)])]),
									_: 1
								})) : row.followDueToday ? (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									size: "small",
									type: "warning",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("今天", -1)])]),
									_: 1
								})) : createCommentVNode("", true), createBaseVNode("time", null, toDisplayString(dateTime(row.nextFollowTime)), 1)]), createVNode(_component_el_tooltip, {
									content: row.nextFollowContent || "待补具体计划",
									placement: "top",
									"show-after": 400
								}, {
									default: withCtx(() => [createBaseVNode("p", null, toDisplayString(row.nextFollowContent || "待补具体计划"), 1)]),
									_: 2
								}, 1032, ["content"])])) : (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									type: "info",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("待安排", -1)])]),
									_: 1
								}))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "合同 / 交接",
								"min-width": "160"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_31, [createBaseVNode("div", null, [row.latestContractStatus ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									effect: "plain",
									type: contractType(row.latestContractStatus)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(contractLabel(row.latestContractStatus)), 1)]),
									_: 2
								}, 1032, ["type"])) : (openBlock(), createElementBlock("span", _hoisted_32, "暂无合同")), row.contractCount ? (openBlock(), createElementBlock("small", _hoisted_33, toDisplayString(row.contractCount) + "份", 1)) : createCommentVNode("", true)]), row.handoverStatus ? (openBlock(), createElementBlock("div", _hoisted_34, [createVNode(_component_el_tag, {
									size: "small",
									effect: "plain",
									type: handoverType(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(handoverLabel(row)), 1)]),
									_: 2
								}, 1032, ["type"]), row.handoverDeadline ? (openBlock(), createElementBlock("time", _hoisted_35, toDisplayString(dateOnly(row.handoverDeadline)), 1)) : createCommentVNode("", true)])) : row.contractCount ? (openBlock(), createElementBlock("small", _hoisted_36, "尚未发起交接")) : createCommentVNode("", true)])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "回款续费",
								"min-width": "145"
							}, {
								default: withCtx(({ row }) => [Number(row.arrearsAmount || 0) > 0 ? (openBlock(), createElementBlock("div", _hoisted_37, [
									createBaseVNode("strong", null, toDisplayString(money(row.arrearsAmount)), 1),
									row.receivableDueDate ? (openBlock(), createElementBlock("span", _hoisted_38, "到期 " + toDisplayString(dateOnly(row.receivableDueDate)), 1)) : createCommentVNode("", true),
									createBaseVNode("div", null, [row.badDebtRisk ? (openBlock(), createBlock(_component_el_tag, {
										key: 0,
										size: "small",
										type: "danger",
										effect: "dark"
									}, {
										default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("坏账风险", -1)])]),
										_: 1
									})) : createCommentVNode("", true), row.pausedService ? (openBlock(), createBlock(_component_el_tag, {
										key: 1,
										size: "small",
										type: "warning",
										effect: "plain"
									}, {
										default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("暂停服务", -1)])]),
										_: 1
									})) : createCommentVNode("", true)])
								])) : (openBlock(), createElementBlock("span", _hoisted_39, "暂无欠费"))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "126",
								fixed: "right",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_40, [createVNode(_component_el_button, {
									link: "",
									type: "primary",
									onClick: ($event) => openCustomer(row)
								}, {
									default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("客户360", -1)])]),
									_: 1
								}, 8, ["onClick"]), row.handoverId || row.contractCount ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: row.handoverId ? "success" : "primary",
									onClick: ($event) => openHandover(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.handoverId ? "查看交接" : "发起交接"), 1)]),
									_: 2
								}, 1032, ["type", "onClick"])) : createCommentVNode("", true)])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_41, [createVNode(_component_el_pagination, {
						"current-page": pageNum.value,
						"onUpdate:currentPage": _cache[15] || (_cache[15] = ($event) => pageNum.value = $event),
						"page-size": pageSize.value,
						"onUpdate:pageSize": _cache[16] || (_cache[16] = ($event) => pageSize.value = $event),
						"page-sizes": [
							10,
							20,
							50,
							100
						],
						total: currentTotal.value,
						layout: "total, sizes, prev, pager, next, jumper",
						onCurrentChange: loadCurrentView,
						onSizeChange: changePageSize
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createVNode(Customer360Drawer_default, {
					modelValue: customer360Visible.value,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => customer360Visible.value = $event),
					"customer-id": selectedCustomerId.value,
					"lead-id": selectedLeadId.value,
					"show-dial": false,
					onChanged: handleCustomerChanged
				}, null, 8, [
					"modelValue",
					"customer-id",
					"lead-id"
				]),
				createVNode(lead_create_dialog_default, {
					modelValue: createDialogVisible.value,
					"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => createDialogVisible.value = $event),
					onSaved: onLeadCreated
				}, null, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-36d53d02"]]);
//#endregion
export { portfolio_default as default };

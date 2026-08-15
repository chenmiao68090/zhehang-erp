import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { J as ElCol, M as ElInputNumber, V as ElDialog, W as ElDatePicker, Y as ElRow, _t as ElFormItem, gt as ElForm, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, v as ElSwitch, vt as ElAlert } from "./vendor-element-plus-CqO9XRGg.js";
import { r as businessTypes } from "./module.scss_vue_type_style_index_0_src_true_lang-DZsVCiit.js";
import { t as feigeOrderData } from "./data-source-Cb9cli9s.js";
//#region src/views/feige-order-contract/components/OrderFormDialog.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "contract-switch-row" };
//#endregion
//#region src/views/feige-order-contract/components/OrderFormDialog.vue
var OrderFormDialog_default = /* @__PURE__ */ defineComponent({
	__name: "OrderFormDialog",
	props: {
		modelValue: { type: Boolean },
		order: {},
		staff: {},
		allowSeal: {
			type: Boolean,
			default: false
		}
	},
	emits: [
		"update:modelValue",
		"saved",
		"seal-requested"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const formRef = ref();
		const saving = ref(false);
		const businessData = reactive({});
		const sourceOptions = [
			"新媒体",
			"客户转介绍",
			"线下活动",
			"渠道合作",
			"老客户复购",
			"自然到访",
			"合作伙伴",
			"其他"
		];
		const selectableBusinessTypes = computed(() => businessTypes.filter((item) => {
			var _props$order;
			return item.value !== "seal" || props.allowSeal || ((_props$order = props.order) === null || _props$order === void 0 ? void 0 : _props$order.businessType) === "seal";
		}));
		const blank = () => ({
			orderDate: (/* @__PURE__ */ new Date()).toLocaleDateString("sv-SE"),
			companyName: "",
			contacts: "",
			contactPhone: "",
			region: "",
			address: "",
			salesmanId: void 0,
			teamName: "",
			businessType: "bookkeeping",
			customerSource: "",
			sourceDetail: "",
			opportunitySource: "",
			deliveryMethod: "",
			orderAmount: 0,
			contractAmount: 0,
			finalPaymentAmount: 0,
			receivedAmount: 0,
			collectionTime: "",
			collectionAccountNumber: "",
			recurring: 0,
			voucher: "",
			remarks: "",
			createContract: false,
			contractSignDate: "",
			contractExpireDate: "",
			contractPayType: "annual",
			contractGiftMonth: 0,
			enterpriseNature: ""
		});
		const form = reactive(blank());
		const recurring = computed({
			get: () => form.recurring === 1,
			set: (value) => {
				form.recurring = value ? 1 : 0;
			}
		});
		const rules = {
			companyName: [{
				required: true,
				message: "请输入客户名称",
				trigger: "blur"
			}],
			orderDate: [{
				required: true,
				message: "请选择下单日期",
				trigger: "change"
			}],
			businessType: [{
				required: true,
				message: "请选择业务类型",
				trigger: "change"
			}],
			contractAmount: [{
				validator: (_rule, _value, callback) => Number(form.receivedAmount || 0) > Number(form.contractAmount || 0) ? callback(/* @__PURE__ */ new Error("实收金额不能超过合同金额")) : callback(),
				trigger: "change"
			}]
		};
		watch(() => props.modelValue, (visible) => {
			var _props$order2;
			if (!visible) return;
			Object.assign(form, blank(), props.order ? _objectSpread2(_objectSpread2({}, props.order), {}, { createContract: false }) : {});
			Object.keys(businessData).forEach((key) => delete businessData[key]);
			Object.assign(businessData, ((_props$order2 = props.order) === null || _props$order2 === void 0 ? void 0 : _props$order2.businessData) || {});
		});
		watch(() => form.salesmanId, (id) => {
			const selected = props.staff.find((item) => item.id === id);
			if (selected) form.teamName = selected.deptName || "";
		});
		function close() {
			emit("update:modelValue", false);
		}
		function requestSealOrder() {
			var _props$order3, _form$contactPhone, _form$address;
			if (((_props$order3 = props.order) === null || _props$order3 === void 0 ? void 0 : _props$order3.id) || form.businessType !== "seal") return false;
			if (!props.allowSeal) {
				ElMessage.error("当前角色未配置刻章提单权限，请联系管理员");
				return true;
			}
			const selected = props.staff.find((item) => item.id === form.salesmanId);
			emit("seal-requested", {
				regDate: form.orderDate || void 0,
				companyName: form.companyName.trim() || void 0,
				phone: ((_form$contactPhone = form.contactPhone) === null || _form$contactPhone === void 0 ? void 0 : _form$contactPhone.trim()) || void 0,
				address: ((_form$address = form.address) === null || _form$address === void 0 ? void 0 : _form$address.trim()) || void 0,
				ownerName: (selected === null || selected === void 0 ? void 0 : selected.name) || void 0,
				perfDept: (selected === null || selected === void 0 ? void 0 : selected.deptName) || void 0
			});
			close();
			return true;
		}
		function onBusinessTypeChange(value) {
			if (value === "seal") requestSealOrder();
		}
		function submit() {
			return _submit.apply(this, arguments);
		}
		function _submit() {
			_submit = _asyncToGenerator(function* () {
				var _formRef$value;
				if (requestSealOrder()) return;
				if (!(yield (_formRef$value = formRef.value) === null || _formRef$value === void 0 ? void 0 : _formRef$value.validate().catch(() => false))) return;
				if (form.createContract && form.contractSignDate && form.contractExpireDate && form.contractExpireDate < form.contractSignDate) return ElMessage.warning("合同截止日期不能早于开始日期");
				saving.value = true;
				try {
					var _props$order4;
					const payload = _objectSpread2(_objectSpread2({}, form), {}, {
						opportunitySource: form.customerSource,
						businessData: _objectSpread2({}, businessData)
					});
					if ((_props$order4 = props.order) === null || _props$order4 === void 0 ? void 0 : _props$order4.id) yield feigeOrderData.updateOrder(props.order.id, payload);
					else yield feigeOrderData.createOrder(payload);
					ElMessage.success(props.order ? "订单已更新" : "订单已保存并进入财务审核");
					close();
					emit("saved");
				} finally {
					saving.value = false;
				}
			});
			return _submit.apply(this, arguments);
		}
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_row = ElRow;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_input_number = ElInputNumber;
			const _component_el_alert = ElAlert;
			const _component_el_form = ElForm;
			const _component_el_button = ElButton;
			const _component_el_dialog = ElDialog;
			return openBlock(), createBlock(_component_el_dialog, {
				"model-value": __props.modelValue,
				class: "feige-order-dialog",
				width: "min(980px, 94vw)",
				title: __props.order ? "修改订单" : "新增订单",
				"destroy-on-close": "",
				onClose: close
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: close }, {
					default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: saving.value,
					onClick: submit
				}, {
					default: withCtx(() => [..._cache[40] || (_cache[40] = [createTextVNode("保存并提交审核", -1)])]),
					_: 1
				}, 8, ["loading"])]),
				default: withCtx(() => [createVNode(_component_el_form, {
					ref_key: "formRef",
					ref: formRef,
					model: form,
					rules,
					"label-position": "top"
				}, {
					default: withCtx(() => [
						_cache[34] || (_cache[34] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "1"), createTextVNode("客户信息")], -1)),
						createVNode(_component_el_row, { gutter: 16 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "客户名称",
										prop: "companyName"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.companyName,
											"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.companyName = $event),
											placeholder: "请输入客户或企业全称",
											maxlength: "200"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "所在区域" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.region,
											"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.region = $event),
											placeholder: "省 / 市 / 区"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业性质" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.enterpriseNature,
											"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.enterpriseNature = $event),
											clearable: "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "小规模纳税人",
													value: "小规模纳税人"
												}),
												createVNode(_component_el_option, {
													label: "一般纳税人",
													value: "一般纳税人"
												}),
												createVNode(_component_el_option, {
													label: "个体工商户",
													value: "个体工商户"
												}),
												createVNode(_component_el_option, {
													label: "其他",
													value: "其他"
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系人" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.contacts,
											"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.contacts = $event),
											placeholder: "客户联系人"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系电话" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.contactPhone,
											"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.contactPhone = $event),
											placeholder: "手机号或企业电话"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 24,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "详细地址" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.address,
											"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.address = $event),
											placeholder: "客户经营或联系地址"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}),
						_cache[35] || (_cache[35] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "2"), createTextVNode("订单信息")], -1)),
						createVNode(_component_el_row, { gutter: 16 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "下单时间",
										prop: "orderDate"
									}, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.orderDate,
											"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.orderDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "业务人员" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.salesmanId,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.salesmanId = $event),
											clearable: "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.staff, (item) => {
												return openBlock(), createBlock(_component_el_option, {
													key: item.id,
													label: `${item.name} · ${item.deptName || "未分组"}`,
													value: item.id
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属团队" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.teamName,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.teamName = $event),
											placeholder: "随业务人员自动带出，也可补充"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "业务类型",
										prop: "businessType"
									}, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.businessType,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.businessType = $event),
											style: { "width": "100%" },
											onChange: onBusinessTypeChange
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(selectableBusinessTypes.value, (item) => {
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
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户来源" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.customerSource,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.customerSource = $event),
											clearable: "",
											filterable: "",
											"allow-create": "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(sourceOptions, (item) => {
												return createVNode(_component_el_option, {
													key: item,
													label: item,
													value: item
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "来源说明" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.sourceDetail,
											"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.sourceDetail = $event),
											placeholder: "活动、渠道或批次名称"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "交付方式" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.deliveryMethod,
											"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.deliveryMethod = $event),
											clearable: "",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "线上办理",
													value: "online"
												}),
												createVNode(_component_el_option, {
													label: "到店办理",
													value: "onsite"
												}),
												createVNode(_component_el_option, {
													label: "上门服务",
													value: "door"
												}),
												createVNode(_component_el_option, {
													label: "邮寄交付",
													value: "mail"
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "复购订单" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: recurring.value,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => recurring.value = $event),
											"inline-prompt": "",
											"active-text": "是",
											"inactive-text": "否"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}),
						_cache[36] || (_cache[36] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "3"), createTextVNode("金额与收款")], -1)),
						createVNode(_component_el_row, { gutter: 16 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "订单金额" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.orderAmount,
											"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.orderAmount = $event),
											min: 0,
											precision: 2,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "合同金额",
										prop: "contractAmount"
									}, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.contractAmount,
											"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.contractAmount = $event),
											min: 0,
											precision: 2,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "成交金额" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.finalPaymentAmount,
											"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.finalPaymentAmount = $event),
											min: 0,
											precision: 2,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "实收金额" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.receivedAmount,
											"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.receivedAmount = $event),
											min: 0,
											max: Number(form.contractAmount || 0),
											precision: 2,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "max"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款时间" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.collectionTime,
											"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.collectionTime = $event),
											type: "datetime",
											"value-format": "YYYY-MM-DDTHH:mm:ss",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款账户" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.collectionAccountNumber,
											"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.collectionAccountNumber = $event),
											placeholder: "账户简称或尾号"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款凭证" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.voucher,
											"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.voucher = $event),
											placeholder: "选择现有附件或填写本地演示说明"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}),
						_cache[37] || (_cache[37] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "4"), createTextVNode("业务办理内容")], -1)),
						createVNode(_component_el_alert, {
							title: form.businessType === "seal" ? "刻章业务使用现有完整刻章提单，仍进入原刻章台账和办理流程，不重复生成通用订单。" : "业务字段随业务类型变化；通用订单仍使用订单管理台账。",
							type: "info",
							closable: false,
							"show-icon": ""
						}, null, 8, ["title"]),
						createVNode(_component_el_row, {
							gutter: 16,
							style: { "margin-top": "14px" }
						}, {
							default: withCtx(() => [form.businessType === "bookkeeping" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "服务年度" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: businessData.serviceYear,
											"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => businessData.serviceYear = $event),
											placeholder: "例如 2026"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "纳税区域" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: businessData.taxArea,
											"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => businessData.taxArea = $event),
											placeholder: "所属税务区域"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 8
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "资料是否齐全" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: businessData.materialReady,
											"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => businessData.materialReady = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							], 64)) : form.businessType === "invoice" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_col, {
								xs: 24,
								sm: 12
							}, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "开票项目" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: businessData.invoiceItem,
										"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => businessData.invoiceItem = $event)
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}), createVNode(_component_el_col, {
								xs: 24,
								sm: 12
							}, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "开票金额" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: businessData.invoiceAmount,
										"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => businessData.invoiceAmount = $event),
										min: 0,
										precision: 2,
										style: { "width": "100%" }
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							})], 64)) : (openBlock(), createBlock(_component_el_col, {
								key: 2,
								span: 24
							}, {
								default: withCtx(() => [createVNode(_component_el_form_item, { label: "办理要求" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: businessData.requirement,
										"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => businessData.requirement = $event),
										type: "textarea",
										rows: 3,
										placeholder: "填写该业务的具体办理内容、资料和交付要求"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								_: 1
							}))]),
							_: 1
						}),
						_cache[38] || (_cache[38] = createBaseVNode("div", { class: "form-section-title" }, [createBaseVNode("span", null, "5"), createTextVNode("合同与备注")], -1)),
						createBaseVNode("div", _hoisted_1, [_cache[33] || (_cache[33] = createBaseVNode("div", null, [createBaseVNode("strong", null, "同时建立代理记账合同"), createBaseVNode("p", null, "仅写入独立合同台账")], -1)), createVNode(_component_el_switch, {
							modelValue: form.createContract,
							"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => form.createContract = $event)
						}, null, 8, ["modelValue"])]),
						form.createContract ? (openBlock(), createBlock(_component_el_row, {
							key: 0,
							gutter: 16,
							style: { "margin-top": "12px" }
						}, {
							default: withCtx(() => [
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同开始" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.contractSignDate,
											"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => form.contractSignDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同截止" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.contractExpireDate,
											"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => form.contractExpireDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "付款周期" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.contractPayType,
											"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => form.contractPayType = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [
												createVNode(_component_el_option, {
													label: "月付",
													value: "monthly"
												}),
												createVNode(_component_el_option, {
													label: "季付",
													value: "quarterly"
												}),
												createVNode(_component_el_option, {
													label: "年付",
													value: "annual"
												}),
												createVNode(_component_el_option, {
													label: "一次性",
													value: "once"
												})
											]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, {
									xs: 24,
									sm: 12,
									lg: 6
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "赠送月份" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.contractGiftMonth,
											"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => form.contractGiftMonth = $event),
											min: 0,
											max: 36,
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_form_item, { label: "订单备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.remarks,
								"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => form.remarks = $event),
								type: "textarea",
								rows: 4,
								maxlength: "1000",
								"show-word-limit": "",
								placeholder: "记录客户约定、特殊要求和交接事项"
							}, null, 8, ["modelValue"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["model"])]),
				_: 1
			}, 8, ["model-value", "title"]);
		};
	}
});
//#endregion
export { OrderFormDialog_default as t };

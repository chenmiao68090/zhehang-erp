import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { B as ElDivider, F as ElEmpty, Ft as circle_check_filled_default, H as ElDescriptions, J as ElCol, M as ElInputNumber, Nn as plus_default, Pt as circle_check_default, Qt as document_default, Tr as vShow, U as ElDescriptionsItem, Un as search_default, V as ElDialog, Vt as close_default, W as ElDatePicker, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, b as ElSteps, dr as upload_filled_default, g as ElTable, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, y as ElStep, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { r as leadApi } from "./crm-DKTvHmZR.js";
//#region src/api/bookkeeping.ts
var bookkeepingApi = {
	list: (params) => get("/bookkeeping-order/list", params),
	save: (data) => post("/bookkeeping-order", data),
	remove: (id) => del(`/bookkeeping-order/${id}`),
	/** 提交审核:进审单中心「合同审理」节点,提单锁定为审核中 */
	submitReview: (id) => post(`/bookkeeping-order/${id}/submit-review`)
};
//#endregion
//#region src/api/company.ts
/**
* 工商企业信息查询（对接后端 /company）。
*
* 仅展示后端企业数据提供方返回的可核验结果；未配置真实数据源时返回空结果，
* 不使用浏览器种子或示例公司冒充正式工商数据。
*/
var companyApi = {
	/** 输入联想：返回候选企业 */
	suggest: (keyword, limit = 8) => get("/company/suggest", {
		keyword,
		limit
	}),
	/** 自动带出：按公司名/信用代码返回单个企业完整工商信息（无命中返回 null） */
	detail: (keyword) => get("/company/detail", { keyword }),
	/** 企业主体库分页 */
	list: (params) => get("/company/list", params),
	/** 概览统计 */
	stats: () => get("/company/stats")
};
//#endregion
//#region src/views/order/bookkeeping.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "bk-page" };
var _hoisted_2 = { class: "bk-head" };
var _hoisted_3 = { key: 0 };
var _hoisted_4 = {
	key: 1,
	class: "bk-muted"
};
var _hoisted_5 = {
	key: 1,
	class: "bk-muted"
};
var _hoisted_6 = { class: "bk-step" };
var _hoisted_7 = { class: "bk-step-bar" };
var _hoisted_8 = { class: "bk-step" };
var _hoisted_9 = { class: "bk-step" };
var _hoisted_10 = {
	key: 0,
	class: "bk-files"
};
var _hoisted_11 = ["title"];
var _hoisted_12 = { class: "bk-step" };
//#endregion
//#region src/views/order/bookkeeping.vue
var bookkeeping_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "bookkeeping",
	setup(__props) {
		const PAY_METHODS = [
			"对公转账",
			"支付宝",
			"微信",
			"现金",
			"其他"
		];
		const COMPANY_NATURES = [
			"个体户(查账)",
			"个体户(核定)",
			"小规模(0申报)",
			"小规模(有账)",
			"一般纳税人(0申报)",
			"一般纳税人(有账)"
		];
		const COOP_PERIODS = ["一年", "多年"];
		const REG_ADDRESS_OWNERS = ["客户", "公司"];
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const fileCount = (row) => {
			try {
				const arr = JSON.parse(row.contractFile || "[]");
				return Array.isArray(arr) ? arr.length : 0;
			} catch (_unused) {
				return 0;
			}
		};
		const statusLabel = (s) => ({
			done: "已完成",
			processing: "处理中",
			reviewing: "审核中",
			confirmed: "已确认",
			rejected: "已驳回"
		})[s || ""] || "待提交";
		const statusType = (s) => ({
			done: "success",
			processing: "warning",
			reviewing: "warning",
			confirmed: "success",
			rejected: "danger"
		})[s || ""] || "info";
		const isLocked = (row) => ["reviewing", "confirmed"].includes(row.status || "");
		const canSubmitReview = (row) => ["pending", "rejected"].includes(row.status || "pending");
		function submitReview(_x) {
			return _submitReview.apply(this, arguments);
		}
		function _submitReview() {
			_submitReview = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`提交「${row.companyName}」进入审核流程?\n流程:部门主管合同审理 → 财务到款确认 → 分配办理 → 验收。提交后本单锁定,驳回后可修改重提。`, "提交审核", {
						type: "warning",
						confirmButtonText: "提交",
						cancelButtonText: "取消"
					});
				} catch (_unused2) {
					return;
				}
				yield bookkeepingApi.submitReview(row.id);
				ElMessage.success("已提交,主管可在「审单中心」进行合同审理");
				load();
			});
			return _submitReview.apply(this, arguments);
		}
		const rows = ref([]);
		const loading = ref(false);
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield bookkeepingApi.list();
					rows.value = ((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || [];
				} catch (_unused3) {
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const remove = function() {
			var _ref2 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除「${row.companyName}」的提单?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield bookkeepingApi.remove(row.id);
					ElMessage.success("已删除");
					load();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x2) {
				return _ref2.apply(this, arguments);
			};
		}();
		const dlg = reactive({
			visible: false,
			saving: false
		});
		const step = ref(0);
		const blankForm = () => ({
			leadId: void 0,
			companyName: "",
			contactName: "",
			phone: "",
			creditCode: "",
			contractAmount: 0,
			serviceStart: "",
			serviceEnd: "",
			signDate: "",
			payMethod: "",
			serviceContent: "",
			companyNature: "",
			coopPeriod: "",
			coopStart: "",
			coopEnd: "",
			regAddress: "",
			regAddressOwner: "",
			bookkeepingAmount: void 0,
			specialRemark: ""
		});
		const form = reactive(blankForm());
		const serviceRange = ref(null);
		watch(serviceRange, (v) => {
			if (v && v.length === 2) {
				form.serviceStart = v[0];
				form.serviceEnd = v[1];
			} else {
				form.serviceStart = "";
				form.serviceEnd = "";
			}
		});
		const coopRange = ref(null);
		watch(coopRange, (v) => {
			if (v && v.length === 2) {
				form.coopStart = v[0];
				form.coopEnd = v[1];
			} else {
				form.coopStart = "";
				form.coopEnd = "";
			}
		});
		const contractFiles = ref([]);
		const openWizard = () => {
			resetWizard();
			dlg.visible = true;
			loadLeads();
		};
		const resetWizard = () => {
			step.value = 0;
			Object.assign(form, blankForm());
			serviceRange.value = null;
			coopRange.value = null;
			contractFiles.value = [];
			picked.value = null;
		};
		const leads = ref([]);
		const leadLoading = ref(false);
		const leadKw = ref("");
		const picked = ref(null);
		const loadLeads = function() {
			var _ref3 = _asyncToGenerator(function* () {
				leadLoading.value = true;
				try {
					var _res$data2;
					const res = yield leadApi.myList({
						pageNum: 1,
						pageSize: 50
					});
					const page = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					leads.value = (page === null || page === void 0 ? void 0 : page.records) || [];
				} catch (_unused6) {
					leads.value = [];
				} finally {
					leadLoading.value = false;
				}
			});
			return function loadLeads() {
				return _ref3.apply(this, arguments);
			};
		}();
		const filteredLeads = computed(() => {
			const kw = leadKw.value.trim().toLowerCase();
			if (!kw) return leads.value;
			return leads.value.filter((l) => [
				l.company,
				l.legalPerson,
				l.phone,
				l.creditCode
			].some((v) => String(v || "").toLowerCase().includes(kw)));
		});
		const leadRowClass = ({ row }) => picked.value && picked.value.id === row.id ? "bk-picked-row" : "";
		const onPickLead = function() {
			var _ref4 = _asyncToGenerator(function* (row) {
				if (!row) return;
				picked.value = row;
				form.leadId = row.id;
				form.companyName = row.company || "";
				form.contactName = row.legalPerson || "";
				form.phone = row.phone || "";
				form.creditCode = row.creditCode || "";
				if ((!form.contactName || !form.creditCode) && form.companyName) try {
					var _res$data3;
					const res = yield companyApi.detail(form.companyName);
					const info = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					if (info) {
						const filledLegal = !form.contactName && info.legalPerson;
						const filledCredit = !form.creditCode && info.creditCode;
						if (filledLegal) form.contactName = info.legalPerson || "";
						if (filledCredit) form.creditCode = info.creditCode || "";
						if (filledLegal || filledCredit) ElMessage.success("已从工商库自动补全法人/信用代码");
					}
				} catch (_unused7) {}
			});
			return function onPickLead(_x3) {
				return _ref4.apply(this, arguments);
			};
		}();
		const doUpload = function() {
			var _ref5 = _asyncToGenerator(function* (options) {
				try {
					var _res$data4;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res;
					contractFiles.value.push({
						name: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name,
						url: (data === null || data === void 0 ? void 0 : data.filePath) || (data === null || data === void 0 ? void 0 : data.url) || (data === null || data === void 0 ? void 0 : data.path) || "",
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : ""
					});
					ElMessage.success("上传成功");
				} catch (_unused8) {
					ElMessage.error("上传失败");
				}
			});
			return function doUpload(_x4) {
				return _ref5.apply(this, arguments);
			};
		}();
		const removeFile = (i) => {
			contractFiles.value.splice(i, 1);
		};
		const validateStep = (s) => {
			if (s === 0) {
				if (!form.companyName || !form.contactName || !form.phone || !form.creditCode) {
					ElMessage.warning("请选择线索或补全公司/联系人/电话/信用代码");
					return false;
				}
			} else if (s === 1) {
				if (!form.contractAmount || form.contractAmount <= 0) {
					ElMessage.warning("请填写合同金额");
					return false;
				}
				if (!serviceRange.value || !serviceRange.value[0] || !serviceRange.value[1]) {
					ElMessage.warning("请选择服务周期");
					return false;
				}
				if (!form.signDate) {
					ElMessage.warning("请选择签约日期");
					return false;
				}
				if (!form.payMethod) {
					ElMessage.warning("请选择收款方式");
					return false;
				}
				if (!form.serviceContent) {
					ElMessage.warning("请填写服务内容");
					return false;
				}
			} else if (s === 2) {
				if (!contractFiles.value.length) {
					ElMessage.warning("请至少上传 1 个合同附件");
					return false;
				}
			}
			return true;
		};
		const nextStep = () => {
			if (!validateStep(step.value)) return;
			if (step.value === 1 && serviceRange.value) {
				form.serviceStart = serviceRange.value[0];
				form.serviceEnd = serviceRange.value[1];
			}
			step.value++;
		};
		const prevStep = () => {
			if (step.value > 0) step.value--;
		};
		const submit = function() {
			var _ref6 = _asyncToGenerator(function* () {
				for (let s = 0; s <= 2; s++) if (!validateStep(s)) {
					step.value = s;
					return;
				}
				if (serviceRange.value) {
					form.serviceStart = serviceRange.value[0];
					form.serviceEnd = serviceRange.value[1];
				}
				dlg.saving = true;
				try {
					const payload = {
						leadId: form.leadId,
						companyName: form.companyName,
						contactName: form.contactName,
						phone: form.phone,
						creditCode: form.creditCode,
						contractAmount: form.contractAmount,
						serviceStart: form.serviceStart,
						serviceEnd: form.serviceEnd,
						signDate: form.signDate,
						payMethod: form.payMethod,
						serviceContent: form.serviceContent,
						companyNature: form.companyNature,
						coopPeriod: form.coopPeriod,
						coopStart: form.coopStart,
						coopEnd: form.coopEnd,
						regAddress: form.regAddress,
						regAddressOwner: form.regAddressOwner,
						bookkeepingAmount: form.bookkeepingAmount,
						specialRemark: form.specialRemark,
						contractFile: JSON.stringify(contractFiles.value),
						status: "pending"
					};
					yield bookkeepingApi.save(payload);
					ElMessage.success("提交成功");
					dlg.visible = false;
					load();
				} catch (_unused9) {
					ElMessage.error("提交失败");
				} finally {
					dlg.saving = false;
				}
			});
			return function submit() {
				return _ref6.apply(this, arguments);
			};
		}();
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _component_el_input = ElInput;
			const _component_el_divider = ElDivider;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_upload = ElUpload;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[19] || (_cache[19] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "bk-title" }, "代理记账提单"), createBaseVNode("p", { class: "bk-sub" }, "从我的线索快速发起代理记账提单,录入合同信息并上传合同附件。")], -1)), createVNode(_component_el_button, {
					type: "primary",
					onClick: openWizard
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[18] || (_cache[18] = createTextVNode(" 新增提单", -1))]),
					_: 1
				})]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有代理记账提单,点右上角「新增提单」开始",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: openWizard
						}, {
							default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("新增提单", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "公司名称",
							prop: "companyName",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "合同金额",
							width: "130",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.contractAmount)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "服务周期",
							"min-width": "190"
						}, {
							default: withCtx(({ row }) => [row.serviceStart || row.serviceEnd ? (openBlock(), createElementBlock("span", _hoisted_3, toDisplayString(row.serviceStart || "—") + " ~ " + toDisplayString(row.serviceEnd || "—"), 1)) : (openBlock(), createElementBlock("span", _hoisted_4, "—"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "签约日期",
							prop: "signDate",
							width: "120"
						}),
						createVNode(_component_el_table_column, {
							label: "收款方式",
							prop: "payMethod",
							width: "110"
						}),
						createVNode(_component_el_table_column, {
							label: "附件",
							width: "100",
							align: "center"
						}, {
							default: withCtx(({ row }) => [fileCount(row) > 0 ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								type: "success",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode("已传" + toDisplayString(fileCount(row)) + "个", 1)]),
								_: 2
							}, 1024)) : (openBlock(), createElementBlock("span", _hoisted_5, "—"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "100",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								type: statusType(row.status)
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "170",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [canSubmitReview(row) ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								size: "small",
								link: "",
								type: "success",
								onClick: ($event) => submitReview(row)
							}, {
								default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("提交审核", -1)])]),
								_: 1
							}, 8, ["onClick"])) : createCommentVNode("", true), createVNode(_component_el_button, {
								size: "small",
								link: "",
								type: "danger",
								disabled: isLocked(row),
								onClick: ($event) => remove(row)
							}, {
								default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("删除", -1)])]),
								_: 1
							}, 8, ["disabled", "onClick"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dlg.visible,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => dlg.visible = $event),
					title: "新增代理记账提单",
					width: "720px",
					"destroy-on-close": "",
					class: "bk-dialog",
					onClosed: resetWizard
				}, {
					footer: withCtx(() => [step.value > 0 ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						onClick: prevStep
					}, {
						default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("上一步", -1)])]),
						_: 1
					})) : createCommentVNode("", true), step.value < 3 ? (openBlock(), createBlock(_component_el_button, {
						key: 1,
						type: "primary",
						onClick: nextStep
					}, {
						default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("下一步", -1)])]),
						_: 1
					})) : (openBlock(), createBlock(_component_el_button, {
						key: 2,
						type: "primary",
						loading: dlg.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("提交", -1)])]),
						_: 1
					}, 8, ["loading"]))]),
					default: withCtx(() => [
						createVNode(_component_el_steps, {
							active: step.value,
							"align-center": "",
							"finish-status": "success",
							class: "bk-steps"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_step, { title: "选择线索" }),
								createVNode(_component_el_step, { title: "合同信息" }),
								createVNode(_component_el_step, { title: "上传附件" }),
								createVNode(_component_el_step, { title: "确认提交" })
							]),
							_: 1
						}, 8, ["active"]),
						withDirectives(createBaseVNode("div", _hoisted_6, [
							createBaseVNode("div", _hoisted_7, [createVNode(_component_el_input, {
								modelValue: leadKw.value,
								"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => leadKw.value = $event),
								class: "bk-search",
								placeholder: "搜公司名/法人/电话…",
								clearable: ""
							}, {
								prefix: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(search_default))]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"]), _cache[23] || (_cache[23] = createBaseVNode("span", { class: "bk-muted" }, "选中一条线索,自动带入公司/法人/电话/信用代码", -1))]),
							withDirectives((openBlock(), createBlock(_component_el_table, {
								data: filteredLeads.value,
								border: "",
								height: "280",
								"highlight-current-row": "",
								onCurrentChange: onPickLead,
								"row-class-name": leadRowClass
							}, {
								empty: withCtx(() => [createVNode(_component_el_empty, {
									description: "没有可选线索",
									"image-size": 60
								})]),
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										width: "48",
										align: "center"
									}, {
										default: withCtx(({ row }) => [picked.value && picked.value.id === row.id ? (openBlock(), createBlock(_component_el_icon, {
											key: 0,
											color: "var(--el-color-primary)"
										}, {
											default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
											_: 1
										})) : (openBlock(), createBlock(_component_el_icon, {
											key: 1,
											color: "var(--el-text-color-placeholder)"
										}, {
											default: withCtx(() => [createVNode(unref(circle_check_default))]),
											_: 1
										}))]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "公司名称",
										prop: "company",
										"min-width": "180",
										"show-overflow-tooltip": ""
									}),
									createVNode(_component_el_table_column, {
										label: "法人",
										prop: "legalPerson",
										width: "100"
									}),
									createVNode(_component_el_table_column, {
										label: "电话",
										prop: "phone",
										width: "130"
									}),
									createVNode(_component_el_table_column, {
										label: "信用代码",
										prop: "creditCode",
										"min-width": "170",
										"show-overflow-tooltip": ""
									})
								]),
								_: 1
							}, 8, ["data"])), [[_directive_loading, leadLoading.value]]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("带入信息(可编辑)", -1)])]),
								_: 1
							}),
							createVNode(_component_el_form, {
								model: form,
								"label-width": "92px"
							}, {
								default: withCtx(() => [createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "公司名称",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.companyName,
													"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.companyName = $event),
													placeholder: "公司名称"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "联系人/法人",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.contactName,
													"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.contactName = $event),
													placeholder: "联系人或法人"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "联系电话",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.phone,
													"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.phone = $event),
													placeholder: "联系电话"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "信用代码",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.creditCode,
													"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.creditCode = $event),
													placeholder: "统一社会信用代码"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								})]),
								_: 1
							}, 8, ["model"])
						], 512), [[vShow, step.value === 0]]),
						withDirectives(createBaseVNode("div", _hoisted_8, [createVNode(_component_el_form, {
							model: form,
							"label-width": "100px"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "合同金额",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input_number, {
													modelValue: form.contractAmount,
													"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.contractAmount = $event),
													min: 0,
													precision: 2,
													"controls-position": "right",
													style: { "width": "100%" },
													placeholder: "合同金额"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "签约日期",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: form.signDate,
													"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.signDate = $event),
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "选择签约日期",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 24 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "服务周期",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: serviceRange.value,
													"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => serviceRange.value = $event),
													type: "daterange",
													"range-separator": "至",
													"start-placeholder": "开始日期",
													"end-placeholder": "结束日期",
													"value-format": "YYYY-MM-DD",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "收款方式",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: form.payMethod,
													"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.payMethod = $event),
													placeholder: "选择收款方式",
													style: { "width": "100%" }
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PAY_METHODS, (m) => {
														return createVNode(_component_el_option, {
															key: m,
															label: m,
															value: m
														}, null, 8, ["label", "value"]);
													}), 64))]),
													_: 1
												}, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "服务内容",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.serviceContent,
										"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.serviceContent = $event),
										type: "textarea",
										rows: 3,
										placeholder: "例如:小规模纳税人代理记账、月度报税、年度汇算清缴…"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_divider, { "content-position": "left" }, {
									default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("补充信息", -1)])]),
									_: 1
								}),
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "公司性质" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: form.companyNature,
													"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.companyNature = $event),
													placeholder: "选择公司性质",
													clearable: "",
													style: { "width": "100%" }
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(COMPANY_NATURES, (n) => {
														return createVNode(_component_el_option, {
															key: n,
															label: n,
															value: n
														}, null, 8, ["label", "value"]);
													}), 64))]),
													_: 1
												}, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "代账金额" }, {
												default: withCtx(() => [createVNode(_component_el_input_number, {
													modelValue: form.bookkeepingAmount,
													"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.bookkeepingAmount = $event),
													min: 0,
													precision: 2,
													"controls-position": "right",
													style: { "width": "100%" },
													placeholder: "代账金额"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作周期" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: form.coopPeriod,
													"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.coopPeriod = $event),
													placeholder: "选择合作周期",
													clearable: "",
													style: { "width": "100%" }
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(COOP_PERIODS, (p) => {
														return createVNode(_component_el_option, {
															key: p,
															label: p,
															value: p
														}, null, 8, ["label", "value"]);
													}), 64))]),
													_: 1
												}, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作起止" }, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: coopRange.value,
													"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => coopRange.value = $event),
													type: "daterange",
													"range-separator": "至",
													"start-placeholder": "开始时间",
													"end-placeholder": "到期时间",
													"value-format": "YYYY-MM-DD",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 16 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "注册地址" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.regAddress,
													"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.regAddress = $event),
													placeholder: "注册地址"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "地址归属" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: form.regAddressOwner,
													"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.regAddressOwner = $event),
													placeholder: "归属",
													clearable: "",
													style: { "width": "100%" }
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(REG_ADDRESS_OWNERS, (o) => {
														return createVNode(_component_el_option, {
															key: o,
															label: o,
															value: o
														}, null, 8, ["label", "value"]);
													}), 64))]),
													_: 1
												}, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "特殊备注" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.specialRemark,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.specialRemark = $event),
										type: "textarea",
										rows: 2,
										maxlength: "500",
										"show-word-limit": "",
										placeholder: "特殊备注(选填)"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["model"])], 512), [[vShow, step.value === 1]]),
						withDirectives(createBaseVNode("div", _hoisted_9, [createVNode(_component_el_upload, {
							"show-file-list": false,
							"http-request": doUpload,
							multiple: "",
							drag: "",
							accept: "image/*,.pdf,.doc,.docx"
						}, {
							tip: withCtx(() => [..._cache[26] || (_cache[26] = [createBaseVNode("div", { class: "el-upload__tip" }, "支持图片 / PDF / Word,至少上传 1 个", -1)])]),
							default: withCtx(() => [createVNode(_component_el_icon, { class: "el-icon--upload" }, {
								default: withCtx(() => [createVNode(unref(upload_filled_default))]),
								_: 1
							}), _cache[27] || (_cache[27] = createBaseVNode("div", { class: "el-upload__text" }, [createTextVNode("把合同文件拖到这里,或"), createBaseVNode("em", null, "点击上传")], -1))]),
							_: 1
						}), contractFiles.value.length ? (openBlock(), createElementBlock("div", _hoisted_10, [(openBlock(true), createElementBlock(Fragment, null, renderList(contractFiles.value, (f, i) => {
							return openBlock(), createElementBlock("div", {
								key: i,
								class: "bk-file"
							}, [
								createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(document_default))]),
									_: 1
								}),
								createBaseVNode("span", {
									class: "bk-file-name",
									title: f.name
								}, toDisplayString(f.name), 9, _hoisted_11),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => removeFile(i)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(close_default))]),
										_: 1
									})]),
									_: 1
								}, 8, ["onClick"])
							]);
						}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
							key: 1,
							description: "还没有上传合同附件(必填)",
							"image-size": 70
						}))], 512), [[vShow, step.value === 2]]),
						withDirectives(createBaseVNode("div", _hoisted_12, [
							createVNode(_component_el_descriptions, {
								title: "基础信息",
								column: 2,
								border: "",
								size: "small"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_descriptions_item, { label: "公司名称" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.companyName), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "联系人/法人" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.contactName), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "联系电话" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.phone), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "信用代码" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.creditCode), 1)]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_descriptions, {
								title: "合同信息",
								column: 2,
								border: "",
								size: "small",
								style: { "margin-top": "14px" }
							}, {
								default: withCtx(() => [
									createVNode(_component_el_descriptions_item, { label: "合同金额" }, {
										default: withCtx(() => [createTextVNode("¥" + toDisplayString(fmtMoney(form.contractAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "签约日期" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.signDate), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "服务周期" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.serviceStart) + " ~ " + toDisplayString(form.serviceEnd), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "收款方式" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.payMethod), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "公司性质" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.companyNature || "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "代账金额" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.bookkeepingAmount != null ? "¥" + fmtMoney(form.bookkeepingAmount) : "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "合作周期" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.coopPeriod || "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "合作起止" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.coopStart || "—") + " ~ " + toDisplayString(form.coopEnd || "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, { label: "地址归属" }, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.regAddressOwner || "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, {
										label: "注册地址",
										span: 2
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.regAddress || "—"), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, {
										label: "服务内容",
										span: 2
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.serviceContent), 1)]),
										_: 1
									}),
									createVNode(_component_el_descriptions_item, {
										label: "特殊备注",
										span: 2
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(form.specialRemark || "—"), 1)]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_descriptions, {
								title: "合同附件",
								column: 1,
								border: "",
								size: "small",
								style: { "margin-top": "14px" }
							}, {
								default: withCtx(() => [createVNode(_component_el_descriptions_item, { label: `共 ${contractFiles.value.length} 个` }, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(contractFiles.value, (f, i) => {
										return openBlock(), createElementBlock("div", {
											key: i,
											class: "bk-confirm-file"
										}, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(document_default))]),
											_: 1
										}), createTextVNode(" " + toDisplayString(f.name), 1)]);
									}), 128))]),
									_: 1
								}, 8, ["label"])]),
								_: 1
							})
						], 512), [[vShow, step.value === 3]])
					]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-a2dd889b"]]);
//#endregion
export { bookkeeping_default as default };

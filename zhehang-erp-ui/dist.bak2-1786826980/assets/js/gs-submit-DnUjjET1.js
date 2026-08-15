import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, B as ElDivider, F as ElEmpty, H as ElDescriptions, J as ElCol, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, Tr as vShow, U as ElDescriptionsItem, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, b as ElSteps, et as ElCheckboxGroup, g as ElTable, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, o as ElMessage, ot as ElButton, s as vLoading, vt as ElAlert, y as ElStep, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
//#region src/api/gs.ts
var gsOrderApi = {
	list: (params) => get("/gs/order/list", params),
	create: (data) => post("/gs/order", data),
	update: (data) => put("/gs/order", data),
	updateProgress: (id, status, progressNote) => post("/gs/order/progress", {
		id,
		status,
		progressNote
	}),
	remove: (id) => del(`/gs/order/${id}`),
	/** 当前登录人是否为「分配人」视角(工商主管/管理员) */
	isAssigner: () => get("/gs/order/is-assigner"),
	/** 可分配的办事员列表 */
	colleagues: () => get("/gs/order/colleagues"),
	/** 审核工单:pass=true 通过(→待分配) / false 驳回 */
	review: (id, pass, progressNote) => post("/gs/order/review", {
		id,
		pass,
		progressNote
	}),
	/** 分配办事员:设 assigneeId + 置办理中 */
	assign: (id, assigneeId, handler) => post("/gs/order/assign", {
		id,
		assigneeId,
		handler
	})
};
//#endregion
//#region src/views/order/gs-submit.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "gss-page" };
var _hoisted_2 = { class: "gss-head" };
var _hoisted_3 = { class: "gss-stats" };
var _hoisted_4 = ["onClick"];
var _hoisted_5 = {
	key: 0,
	class: "gss-muted"
};
var _hoisted_6 = {
	key: 1,
	class: "gss-muted"
};
var _hoisted_7 = { class: "gss-step" };
var _hoisted_8 = { class: "gss-step" };
var _hoisted_9 = { class: "gss-id-uploads" };
var _hoisted_10 = {
	key: 0,
	class: "gss-doc-tags"
};
var _hoisted_11 = { class: "gss-step" };
var _hoisted_12 = { class: "gss-step" };
//#endregion
//#region src/views/order/gs-submit.vue
var gs_submit_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "gs-submit",
	setup(__props) {
		const GS_TYPE_GROUPS = [
			{
				value: "register",
				label: "公司注册",
				items: [
					{
						value: "company_register",
						label: "公司注册"
					},
					{
						value: "individual_register",
						label: "个体户注册"
					},
					{
						value: "individual_to_company",
						label: "个转企"
					}
				]
			},
			{
				value: "change",
				label: "工商变更",
				items: [
					{
						value: "address_change",
						label: "地址变更"
					},
					{
						value: "scope_change",
						label: "经营范围变更"
					},
					{
						value: "equity_change",
						label: "股权转让"
					},
					{
						value: "legal_person_change",
						label: "法人变更"
					},
					{
						value: "capital_change",
						label: "增资/减资"
					},
					{
						value: "name_change",
						label: "名称变更"
					}
				]
			},
			{
				value: "cancel",
				label: "公司注销",
				items: [{
					value: "company_cancel",
					label: "公司注销"
				}, {
					value: "individual_cancel",
					label: "个体户注销"
				}]
			},
			{
				value: "bank",
				label: "银行业务",
				items: [
					{
						value: "bank_open",
						label: "银行开户"
					},
					{
						value: "bank_change",
						label: "银行变更"
					},
					{
						value: "bank_cancel",
						label: "银行注销"
					}
				]
			},
			{
				value: "license",
				label: "许可证",
				items: [
					{
						value: "food_license",
						label: "食品经营许可证"
					},
					{
						value: "import_export_record",
						label: "进出口备案"
					},
					{
						value: "health_license",
						label: "卫生许可证"
					},
					{
						value: "hr_license",
						label: "人力资源许可证"
					},
					{
						value: "labor_dispatch_license",
						label: "劳务派遣"
					},
					{
						value: "medical_device_record",
						label: "二类医疗器械备案"
					}
				]
			},
			{
				value: "other",
				label: "其他",
				items: [
					{
						value: "annual_exception",
						label: "解除年报异常"
					},
					{
						value: "address_exception",
						label: "解除地址异常"
					},
					{
						value: "tax_exception",
						label: "解除税务异常"
					},
					{
						value: "other_manual",
						label: "其他手动备注"
					}
				]
			}
		];
		const GS_TYPES = GS_TYPE_GROUPS.map(({ value, label }) => ({
			value,
			label
		}));
		const BUSINESS_ITEM_LABELS = GS_TYPE_GROUPS.reduce((map, group) => {
			group.items.forEach((item) => {
				map[item.value] = item.label;
			});
			return map;
		}, {});
		const GS_STATUS = [
			{
				value: "reviewing",
				label: "待审核"
			},
			{
				value: "pending",
				label: "待分配"
			},
			{
				value: "processing",
				label: "办理中"
			},
			{
				value: "submitted",
				label: "已提交工商"
			},
			{
				value: "done",
				label: "已完成"
			},
			{
				value: "rejected",
				label: "已驳回"
			}
		];
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const typeLabel = (v) => {
			var _GS_TYPES$find;
			return ((_GS_TYPES$find = GS_TYPES.find((t) => t.value === v)) === null || _GS_TYPES$find === void 0 ? void 0 : _GS_TYPES$find.label) || (v === "annual" ? "工商年报" : v) || "—";
		};
		const statusLabel = (v) => {
			var _GS_STATUS$find;
			return ((_GS_STATUS$find = GS_STATUS.find((s) => s.value === v)) === null || _GS_STATUS$find === void 0 ? void 0 : _GS_STATUS$find.label) || (v === "rejected" ? "已驳回" : v === "cancelled" ? "已取消" : v || "—");
		};
		const statusType = (v) => v === "done" ? "success" : v === "rejected" || v === "cancelled" ? "danger" : v === "reviewing" ? "info" : "warning";
		const typeHint = computed(() => {
			return {
				register: "新公司注册:可勾选公司注册、个体户注册、个转企等具体项目。",
				change: "工商变更:法人/股东/地址/经营范围/注册资本/公司名称等变更。",
				cancel: "公司注销:含清算、税务注销、工商注销、公示登报等。",
				bank: "银行业务:开户、变更、注销;预约时间和银行要求可写在补充项目或备注里。",
				license: "许可证:食品经营、道路运输、医疗器械等前置/后置审批。",
				other: "其他工商相关业务,可勾选异常解除并在补充项目里手动说明。"
			}[form.businessType || "register"] || "选择要办理的工商业务类型。";
		});
		const remarkHint = computed(() => {
			const t = form.businessType;
			if (t === "register") return "如:注册资本、经营范围、股东出资比例、注册地址来源(自有/挂靠)等";
			if (t === "change") return "如:具体变更项、变更前→变更后内容";
			if (t === "cancel") return "如:是否有欠税、是否简易注销";
			if (t === "bank") return "如:预约银行、开户许可证/网银/印鉴卡等银行具体要求";
			return "补充说明或客户特殊要求";
		});
		const selectedItems = ref([]);
		const businessItemOptions = computed(() => {
			var _GS_TYPE_GROUPS$find;
			return ((_GS_TYPE_GROUPS$find = GS_TYPE_GROUPS.find((t) => t.value === form.businessType)) === null || _GS_TYPE_GROUPS$find === void 0 ? void 0 : _GS_TYPE_GROUPS$find.items) || [];
		});
		const parseBusinessItems = (s) => (s || "").split(",").map((v) => v.trim()).filter(Boolean);
		const businessItemsText = (row) => {
			const labels = parseBusinessItems(row === null || row === void 0 ? void 0 : row.businessItems).map((v) => BUSINESS_ITEM_LABELS[v] || v);
			if (row === null || row === void 0 ? void 0 : row.businessItemRemark) labels.push(row.businessItemRemark);
			return labels.length ? labels.join("、") : "—";
		};
		const onBusinessTypeChange = () => {
			selectedItems.value = [];
			form.businessItems = "";
		};
		watch(selectedItems, (items) => {
			form.businessItems = items.join(",");
		}, { deep: true });
		const rows = ref([]);
		const loading = ref(false);
		const filterStatus = ref("");
		const allRows = ref([]);
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield gsOrderApi.list({
						pageNum: 1,
						pageSize: 200,
						scope: "mine"
					});
					const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					allRows.value = (page === null || page === void 0 ? void 0 : page.records) || [];
					applyFilter();
				} catch (_unused) {
					allRows.value = [];
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const applyFilter = () => {
			rows.value = filterStatus.value ? allRows.value.filter((r) => r.status === filterStatus.value) : allRows.value;
		};
		const statCount = (s) => allRows.value.filter((r) => r.status === s).length;
		const toggleStatus = (s) => {
			filterStatus.value = filterStatus.value === s ? "" : s;
			applyFilter();
		};
		const dlg = reactive({
			visible: false,
			saving: false
		});
		const step = ref(0);
		const blankForm = () => ({
			businessType: "register",
			businessItems: "",
			businessItemRemark: "",
			companyName: "",
			customer: "",
			phone: "",
			legalPhone: "",
			recipient: "",
			recipientPhone: "",
			recipientAddress: "",
			fee: void 0,
			receivedDate: "",
			deadline: "",
			remark: ""
		});
		const form = reactive(blankForm());
		const assignForm = (data) => {
			Object.keys(form).forEach((k) => delete form[k]);
			Object.assign(form, data);
		};
		const docs = ref({});
		const otherDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith("other-")).map(([k, v]) => _objectSpread2({ key: k }, v)));
		const docCount = computed(() => Object.keys(docs.value).length);
		const parseDocMap = (s) => {
			if (!s) return {};
			try {
				const obj = JSON.parse(s);
				return obj && typeof obj === "object" ? obj : {};
			} catch (_unused2) {
				return {};
			}
		};
		const uploadDoc = function() {
			var _ref2 = _asyncToGenerator(function* (key, options) {
				try {
					var _res$data2;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { [key]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused3) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadDoc(_x, _x2) {
				return _ref2.apply(this, arguments);
			};
		}();
		let otherSeq = 0;
		const uploadOther = function() {
			var _ref3 = _asyncToGenerator(function* (options) {
				try {
					var _res$data3;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					otherSeq++;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { [`other-${Date.now()}-${otherSeq}`]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused4) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadOther(_x3) {
				return _ref3.apply(this, arguments);
			};
		}();
		const removeDoc = (key) => {
			const d = _objectSpread2({}, docs.value);
			delete d[key];
			docs.value = d;
		};
		const openWizard = (row) => {
			resetWizard();
			if (row) {
				dlg.editingId = row.id;
				assignForm(_objectSpread2(_objectSpread2(_objectSpread2({}, blankForm()), row), {}, { status: "reviewing" }));
				selectedItems.value = parseBusinessItems(row.businessItems);
				docs.value = parseDocMap(row.documents);
			}
			dlg.visible = true;
		};
		const resetWizard = () => {
			step.value = 0;
			dlg.editingId = void 0;
			assignForm(blankForm());
			selectedItems.value = [];
			docs.value = {};
		};
		const validateStep = (s) => {
			if (s === 0) {
				if (!form.businessType) {
					ElMessage.warning("请选择业务类型");
					return false;
				}
				if (!selectedItems.value.length && !form.businessItemRemark) {
					ElMessage.warning("请选择业务细分或填写补充项目");
					return false;
				}
			} else if (s === 1) {
				if (!form.companyName) {
					ElMessage.warning("请填写公司名称");
					return false;
				}
			}
			return true;
		};
		const nextStep = () => {
			if (validateStep(step.value)) step.value++;
		};
		const prevStep = () => {
			if (step.value > 0) step.value--;
		};
		const submit = function() {
			var _ref4 = _asyncToGenerator(function* () {
				for (let s = 0; s <= 2; s++) if (!validateStep(s)) {
					step.value = s;
					return;
				}
				dlg.saving = true;
				try {
					const payload = _objectSpread2(_objectSpread2({}, form), {}, {
						businessItems: selectedItems.value.join(","),
						documents: JSON.stringify(docs.value),
						status: "reviewing"
					});
					if (dlg.editingId) yield gsOrderApi.update(payload);
					else yield gsOrderApi.create(payload);
					ElMessage.success(dlg.editingId ? "已保存并重新提交审核" : "提交成功,已进入待审核");
					dlg.visible = false;
					load();
				} catch (_unused5) {
					ElMessage.error("提交失败");
				} finally {
					dlg.saving = false;
				}
			});
			return function submit() {
				return _ref4.apply(this, arguments);
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
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_form_item = ElFormItem;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_checkbox_group = ElCheckboxGroup;
			const _component_el_input = ElInput;
			const _component_el_alert = ElAlert;
			const _component_el_form = ElForm;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_divider = ElDivider;
			const _component_el_upload = ElUpload;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[19] || (_cache[19] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "gss-title" }, "工商业务提单"), createBaseVNode("p", { class: "gss-sub" }, "提交客户委托的工商业务(注册/变更/注销/银行/许可证等)。提交后自动进入「待审核」,由工商办理人员接手办理,你可在此跟踪进度。")], -1)), createVNode(_component_el_button, {
					type: "primary",
					onClick: openWizard
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[18] || (_cache[18] = createTextVNode(" 提交工商订单", -1))]),
					_: 1
				})]),
				createBaseVNode("div", _hoisted_3, [(openBlock(), createElementBlock(Fragment, null, renderList(GS_STATUS, (s) => {
					return createBaseVNode("div", {
						key: s.value,
						class: normalizeClass(["gss-stat", { active: filterStatus.value === s.value }]),
						onClick: ($event) => toggleStatus(s.value)
					}, [createBaseVNode("b", null, toDisplayString(statCount(s.value)), 1), createBaseVNode("span", null, toDisplayString(s.label), 1)], 10, _hoisted_4);
				}), 64))]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有提交工商订单,点右上角「提交工商订单」开始",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: openWizard
						}, {
							default: withCtx(() => [..._cache[21] || (_cache[21] = [createTextVNode("提交工商订单", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "提交日期",
							width: "120"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString((row.createTime || "").slice(0, 10) || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "公司名称",
							prop: "companyName",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "业务类型",
							width: "110"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(typeLabel(row.businessType)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "业务细分",
							"min-width": "170",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(businessItemsText(row)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "客户联系人",
							width: "140"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.customer || "—"), 1), row.phone ? (openBlock(), createElementBlock("span", _hoisted_5, " / " + toDisplayString(row.phone), 1)) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "收费",
							width: "110",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.fee != null ? "¥" + fmtMoney(row.fee) : "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "办理期限",
							width: "120"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.deadline || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "办理进度",
							width: "120",
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
							label: "办事员",
							width: "100"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.assigneeName || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "110",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [row.status === "rejected" ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								size: "small",
								type: "primary",
								onClick: ($event) => openWizard(row)
							}, {
								default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("修改", -1)])]),
								_: 1
							}, 8, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_6, "—"))]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				createVNode(_component_el_dialog, {
					modelValue: dlg.visible,
					"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => dlg.visible = $event),
					title: dlg.editingId ? "修改工商订单" : "提交工商订单",
					width: "760px",
					"destroy-on-close": "",
					class: "gss-dialog",
					onClosed: resetWizard
				}, {
					footer: withCtx(() => [step.value > 0 ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						onClick: prevStep
					}, {
						default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("上一步", -1)])]),
						_: 1
					})) : createCommentVNode("", true), step.value < 3 ? (openBlock(), createBlock(_component_el_button, {
						key: 1,
						type: "primary",
						onClick: nextStep
					}, {
						default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("下一步", -1)])]),
						_: 1
					})) : (openBlock(), createBlock(_component_el_button, {
						key: 2,
						type: "primary",
						loading: dlg.saving,
						onClick: submit
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(dlg.editingId ? "保存并重新提交" : "提交订单"), 1)]),
						_: 1
					}, 8, ["loading"]))]),
					default: withCtx(() => [
						createVNode(_component_el_steps, {
							active: step.value,
							"align-center": "",
							"finish-status": "success",
							class: "gss-steps"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_step, { title: "业务类型" }),
								createVNode(_component_el_step, { title: "客户信息" }),
								createVNode(_component_el_step, { title: "收费与期限" }),
								createVNode(_component_el_step, { title: "确认提交" })
							]),
							_: 1
						}, 8, ["active"]),
						withDirectives(createBaseVNode("div", _hoisted_7, [createVNode(_component_el_form, { "label-width": "88px" }, {
							default: withCtx(() => [
								createVNode(_component_el_form_item, {
									label: "业务类型",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_group, {
										modelValue: form.businessType,
										"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.businessType = $event),
										onChange: onBusinessTypeChange
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(GS_TYPES), (t) => {
											return openBlock(), createBlock(_component_el_radio_button, {
												key: t.value,
												value: t.value
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(t.label), 1)]),
												_: 2
											}, 1032, ["value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "业务细分",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_checkbox_group, {
										modelValue: selectedItems.value,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => selectedItems.value = $event),
										class: "gss-checks"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(businessItemOptions.value, (item) => {
											return openBlock(), createBlock(_component_el_checkbox, {
												key: item.value,
												value: item.value
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(item.label), 1)]),
												_: 2
											}, 1032, ["value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "补充项目" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.businessItemRemark,
										"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.businessItemRemark = $event),
										type: "textarea",
										rows: 2,
										maxlength: "500",
										"show-word-limit": "",
										placeholder: "其他项目或特殊情况,例如:解除年报异常、地址异常、税务异常、银行开户需预约等"
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_alert, {
									closable: false,
									type: "info",
									title: typeHint.value,
									"show-icon": "",
									style: { "margin-top": "6px" }
								}, null, 8, ["title"])
							]),
							_: 1
						})], 512), [[vShow, step.value === 0]]),
						withDirectives(createBaseVNode("div", _hoisted_8, [createVNode(_component_el_form, {
							model: form,
							"label-width": "88px"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 24 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "公司名称",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.companyName,
													"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.companyName = $event),
													placeholder: "客户公司全称(或拟注册名称)"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户联系人" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.customer,
													"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.customer = $event),
													placeholder: "联系人姓名"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系电话" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.phone,
													"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => form.phone = $event),
													placeholder: "联系电话"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "法人手机号" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.legalPhone,
													"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.legalPhone = $event),
													placeholder: "法人手机号"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件人" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.recipient,
													"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.recipient = $event),
													placeholder: "收件人姓名"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件电话" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.recipientPhone,
													"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.recipientPhone = $event),
													placeholder: "收件电话"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件地址" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.recipientAddress,
													"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.recipientAddress = $event),
													placeholder: "收件地址"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								}),
								createVNode(_component_el_divider, { "content-position": "left" }, {
									default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("客户资料上传", -1)])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "法人身份证" }, {
									default: withCtx(() => [createBaseVNode("div", _hoisted_9, [
										createVNode(_component_el_upload, {
											"show-file-list": false,
											"http-request": (o) => uploadDoc("legalIdFront", o),
											accept: "image/*"
										}, {
											default: withCtx(() => [createVNode(_component_el_button, { type: docs.value["legalIdFront"] ? "success" : "default" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(docs.value["legalIdFront"] ? "正面 已上传 ✓" : "上传正面"), 1)]),
												_: 1
											}, 8, ["type"])]),
											_: 1
										}, 8, ["http-request"]),
										docs.value["legalIdFront"] ? (openBlock(), createBlock(_component_el_button, {
											key: 0,
											size: "small",
											type: "danger",
											link: "",
											onClick: _cache[10] || (_cache[10] = ($event) => removeDoc("legalIdFront"))
										}, {
											default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("删除正面", -1)])]),
											_: 1
										})) : createCommentVNode("", true),
										createVNode(_component_el_upload, {
											"show-file-list": false,
											"http-request": (o) => uploadDoc("legalIdBack", o),
											accept: "image/*"
										}, {
											default: withCtx(() => [createVNode(_component_el_button, { type: docs.value["legalIdBack"] ? "success" : "default" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(docs.value["legalIdBack"] ? "反面 已上传 ✓" : "上传反面"), 1)]),
												_: 1
											}, 8, ["type"])]),
											_: 1
										}, 8, ["http-request"]),
										docs.value["legalIdBack"] ? (openBlock(), createBlock(_component_el_button, {
											key: 1,
											size: "small",
											type: "danger",
											link: "",
											onClick: _cache[11] || (_cache[11] = ($event) => removeDoc("legalIdBack"))
										}, {
											default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("删除反面", -1)])]),
											_: 1
										})) : createCommentVNode("", true)
									])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "其他附件" }, {
									default: withCtx(() => [
										createVNode(_component_el_upload, {
											"show-file-list": false,
											"http-request": (o) => uploadOther(o),
											accept: "image/*,.pdf,.doc,.docx,.xls,.xlsx",
											multiple: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_button, {
												size: "small",
												plain: "",
												type: "info"
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(plus_default))]),
													_: 1
												}), _cache[25] || (_cache[25] = createTextVNode(" 上传其他附件(可多张)", -1))]),
												_: 1
											})]),
											_: 1
										}, 8, ["http-request"]),
										otherDocs.value.length ? (openBlock(), createElementBlock("div", _hoisted_10, [(openBlock(true), createElementBlock(Fragment, null, renderList(otherDocs.value, (d) => {
											return openBlock(), createBlock(_component_el_tag, {
												key: d.key,
												size: "small",
												closable: "",
												onClose: ($event) => removeDoc(d.key)
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(d.fileName), 1)]),
												_: 2
											}, 1032, ["onClose"]);
										}), 128))])) : createCommentVNode("", true),
										_cache[26] || (_cache[26] = createBaseVNode("span", { class: "gss-doc-hint" }, "营业执照、委托书、场地证明、股东信息、地址材料、进场资金、经营范围等辅助材料;支持图片/PDF/Office。办事员办理时可在此下载查看。", -1))
									]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["model"])], 512), [[vShow, step.value === 1]]),
						withDirectives(createBaseVNode("div", _hoisted_11, [createVNode(_component_el_form, {
							model: form,
							"label-width": "88px"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "收费金额" }, {
												default: withCtx(() => [createVNode(_component_el_input_number, {
													modelValue: form.fee,
													"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.fee = $event),
													min: 0,
													precision: 2,
													"controls-position": "right",
													style: { "width": "100%" },
													placeholder: "收费金额"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "接单日期" }, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: form.receivedDate,
													"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.receivedDate = $event),
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "接单日期",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "办理期限" }, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: form.deadline,
													"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.deadline = $event),
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "希望完成日期",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "备注/要求" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.remark,
										"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.remark = $event),
										type: "textarea",
										rows: 3,
										placeholder: remarkHint.value,
										maxlength: "500",
										"show-word-limit": ""
									}, null, 8, ["modelValue", "placeholder"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "备注2" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.remark2,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.remark2 = $event),
										type: "textarea",
										rows: 2,
										maxlength: "255",
										"show-word-limit": "",
										placeholder: "第二备注"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["model"])], 512), [[vShow, step.value === 2]]),
						withDirectives(createBaseVNode("div", _hoisted_12, [createVNode(_component_el_descriptions, {
							title: "订单确认",
							column: 2,
							border: "",
							size: "small"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_descriptions_item, { label: "业务类型" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(typeLabel(form.businessType)), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "业务细分" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(businessItemsText(form)), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "公司名称" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.companyName), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "客户联系人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.customer || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "联系电话" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.phone || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "法人手机号" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.legalPhone || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "收件人" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.recipient || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "收件电话" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.recipientPhone || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "收件地址",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.recipientAddress || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "收费金额" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.fee != null ? "¥" + fmtMoney(form.fee) : "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "接单日期" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.receivedDate || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, { label: "办理期限" }, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.deadline || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "上传资料",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(docCount.value ? `已上传 ${docCount.value} 个文件` : "未上传"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "备注",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.remark || "—"), 1)]),
									_: 1
								}),
								createVNode(_component_el_descriptions_item, {
									label: "备注2",
									span: 2
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(form.remark2 || "—"), 1)]),
									_: 1
								})
							]),
							_: 1
						}), createVNode(_component_el_alert, {
							closable: false,
							type: "success",
							title: "提交后进入「待审核」,工商办理人员会审核并分配办事员办理,进度会显示在上面的列表里。",
							"show-icon": "",
							style: { "margin-top": "14px" }
						})], 512), [[vShow, step.value === 3]])
					]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-d0222d09"]]);
//#endregion
export { gs_submit_default as default };

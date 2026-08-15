import { r as __toESM } from "./rolldown-runtime-Ce7cXt08.js";
import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, h as _objectWithoutProperties, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, B as ElDivider, D as ElPagination, Er as withKeys, F as ElEmpty, J as ElCol, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, Un as search_default, V as ElDialog, Vt as close_default, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gr as view_default, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { l as require_dayjs_min } from "./vendor-dayjs-QmXXJDJb.js";
import { n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { n as downloadAttachment, t as createAttachmentPreview } from "./file-viewer-CSEUV4IJ.js";
//#region src/api/address-order.ts
var import_dayjs_min = /* @__PURE__ */ __toESM(require_dayjs_min(), 1);
var addressOrderApi = {
	list: (params) => get("/order/address-order/list", params),
	detail: (id) => get(`/order/address-order/${id}`),
	rebate: (id) => get(`/order/address-order/${id}/rebate`),
	save: (data) => post("/order/address-order", data),
	submit: (id) => post(`/order/address-order/${id}/submit`),
	remove: (id) => del(`/order/address-order/${id}`),
	colleagues: () => get("/order/address-order/colleagues")
};
//#endregion
//#region src/views/order/address-order.vue?vue&type=script&setup=true&lang.ts
var _excluded = [
	"registerType",
	"bizYear",
	"bizMonth"
];
var _hoisted_1 = { class: "ao-page" };
var _hoisted_2 = { class: "ao-head" };
var _hoisted_3 = { class: "ao-filter" };
var _hoisted_4 = {
	key: 1,
	class: "ao-muted"
};
var _hoisted_5 = {
	key: 0,
	class: "ao-pager"
};
var _hoisted_6 = { class: "ao-service-contract" };
var _hoisted_7 = { class: "ao-service-foot" };
var _hoisted_8 = { class: "ao-sum" };
var _hoisted_9 = { class: "ao-contract-fields" };
var _hoisted_10 = { class: "ao-rebate-box" };
var _hoisted_11 = { class: "ao-rebate-upload" };
var _hoisted_12 = ["src", "alt"];
var _hoisted_13 = ["src"];
//#endregion
//#region src/views/order/address-order.vue
var address_order_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "address-order",
	setup(__props) {
		const CUSTOMER_SOURCES = [
			"老客户-新签/转介绍",
			"老客-续费",
			"抖音新签",
			"美团新签"
		];
		const ADDRESS_TYPES = ["新签", "续签"];
		/** 2026-07 地址续费.docx:付款周期/收款类型/收款账户改下拉,收款日期到分钟,对接人号码11位 */
		const PAY_CYCLES = [
			"单次业务收费",
			"年度收费",
			"两年版套餐",
			"三年版套餐"
		];
		const COLLECT_TYPES = [
			"全款",
			"定金",
			"尾款"
		];
		const COLLECT_ACCOUNTS = [
			"丰收互联丨扫码",
			"招商银行丨对公",
			"光大银行丨浙杭",
			"浙杭扫码丨微信",
			"浙杭扫码丨支付宝",
			"美团丨第三方平台收款",
			"淘宝丨第三方平台收款",
			"抖音丨第三方平台收款",
			"微信丨陈总个人收款"
		];
		/** 付款周期 → 月数(单次业务收费不自动算截止) */
		const CYCLE_MONTHS = {
			年度收费: 12,
			两年版套餐: 24,
			三年版套餐: 36
		};
		/** 服务事项下拉(用户2026-07-23截图批注) */
		const SERVICE_MATTERS = ["地址新签", "地址续费"];
		const PHONE_RE = /^\d{11}$/;
		const loading = ref(false);
		const rows = ref([]);
		const total = ref(0);
		const colleagues = ref([]);
		const query = reactive({
			pageNum: 1,
			pageSize: 10,
			keyword: "",
			customerSource: "",
			stewardId: void 0,
			salesId: void 0
		});
		const dlg = reactive({
			visible: false,
			saving: false
		});
		const formRef = ref();
		const emptyForm = () => ({ hasRebate: 0 });
		const form = reactive(emptyForm());
		const rebatePreview = ref({
			visible: false,
			title: "支付宝收款码",
			url: "",
			type: "other"
		});
		/** 合同截止自动算:开始+周期月数+赠送月-1天(对齐文档示例 07-12→次年07-11);
		*  编辑回显期间抑制,避免覆盖库里手改过的截止日期;单次业务收费不自动算。 */
		let suppressAutoEnd = false;
		watch(() => [
			form.contractStart,
			form.payCycle,
			form.giftMonths
		], ([start, cycle]) => {
			if (suppressAutoEnd) return;
			const months = CYCLE_MONTHS[cycle || ""];
			if (!start || !months) return;
			const gift = Math.max(0, Number(form.giftMonths) || 0);
			form.contractEnd = (0, import_dayjs_min.default)(start).add(months + gift, "month").subtract(1, "day").format("YYYY-MM-DD");
		});
		const collectItems = ref([]);
		const payerUnits = ref([]);
		const serviceItems = ref([]);
		const balanceItems = ref([]);
		const rules = {
			companyName: [{
				required: true,
				message: "请填写企业名称",
				trigger: "blur"
			}],
			customerSource: [{
				required: true,
				message: "请选择客户来源",
				trigger: "change"
			}],
			companyAddress: [{
				required: true,
				message: "请填写企业地址",
				trigger: "blur"
			}],
			legalName: [{
				required: true,
				message: "请填写法人姓名",
				trigger: "blur"
			}],
			legalPhone: [{
				required: true,
				message: "请填写法人联系方式",
				trigger: "blur"
			}],
			rebateRecipient: [{
				validator: (_rule, value, callback) => form.hasRebate === 1 && !String(value || "").trim() ? callback(/* @__PURE__ */ new Error("有返款时必须填写返款对象")) : callback(),
				trigger: "blur"
			}],
			rebateAlipayQrFileId: [{
				validator: (_rule, value, callback) => form.hasRebate === 1 && !Number(value) ? callback(/* @__PURE__ */ new Error("有返款时必须上传支付宝收款码")) : callback(),
				trigger: "change"
			}]
		};
		const collectTotal = computed(() => serviceItems.value.reduce((sum, r) => sum + (Number(r.amount) || 0), 0));
		const fmtMoney = (v) => (Number(v) || 0).toFixed(2);
		const rebateFile = () => ({
			fileId: form.rebateAlipayQrFileId,
			fileName: "支付宝收款码"
		});
		function onHasRebateChange(value) {
			form.hasRebate = Number(value) === 1 ? 1 : 0;
			if (form.hasRebate === 0) {
				form.rebateRecipient = void 0;
				form.rebateAlipayQrFileId = void 0;
				clearRebatePreview();
			}
		}
		const isAllowedRebateQr = (file) => {
			if (!file || file.size > 10 * 1024 * 1024) return false;
			const type = (file.type || "").toLowerCase();
			const name = (file.name || "").toLowerCase();
			return [
				"image/jpeg",
				"image/png",
				"application/pdf"
			].includes(type) || /\.(jpe?g|png|pdf)$/i.test(name);
		};
		function uploadRebateQr(_x) {
			return _uploadRebateQr.apply(this, arguments);
		}
		function _uploadRebateQr() {
			_uploadRebateQr = _asyncToGenerator(function* (options) {
				const file = options === null || options === void 0 ? void 0 : options.file;
				if (!isAllowedRebateQr(file)) {
					ElMessage.warning("支付宝收款码仅支持JPG、PNG或PDF，且不能超过10MB");
					return;
				}
				try {
					var _res$data, _formRef$value, _formRef$value$clearV;
					const res = yield fileInfoApi.upload(file, void 0, { silentError: true });
					const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					const id = Number(data === null || data === void 0 ? void 0 : data.id);
					if (!Number.isFinite(id) || id <= 0) throw new Error("missing file id");
					form.rebateAlipayQrFileId = id;
					(_formRef$value = formRef.value) === null || _formRef$value === void 0 || (_formRef$value$clearV = _formRef$value.clearValidate) === null || _formRef$value$clearV === void 0 || _formRef$value$clearV.call(_formRef$value, "rebateAlipayQrFileId");
					ElMessage.success("支付宝收款码上传成功");
				} catch (_unused) {
					ElMessage.error("支付宝收款码上传失败，请重试");
				}
			});
			return _uploadRebateQr.apply(this, arguments);
		}
		function removeRebateQr() {
			form.rebateAlipayQrFileId = void 0;
			clearRebatePreview();
			ElMessage.success("已移除支付宝收款码");
		}
		function previewRebateQr() {
			return _previewRebateQr.apply(this, arguments);
		}
		function _previewRebateQr() {
			_previewRebateQr = _asyncToGenerator(function* () {
				try {
					clearRebatePreview();
					const preview = yield createAttachmentPreview(rebateFile());
					if (!preview) return;
					rebatePreview.value = {
						visible: true,
						title: preview.title,
						url: preview.url,
						type: preview.type
					};
				} catch (_unused2) {
					ElMessage.error("收款码预览失败");
				}
			});
			return _previewRebateQr.apply(this, arguments);
		}
		function downloadRebateQr() {
			return _downloadRebateQr.apply(this, arguments);
		}
		function _downloadRebateQr() {
			_downloadRebateQr = _asyncToGenerator(function* () {
				try {
					yield downloadAttachment(rebateFile());
				} catch (_unused3) {
					ElMessage.error("收款码下载失败");
				}
			});
			return _downloadRebateQr.apply(this, arguments);
		}
		function clearRebatePreview() {
			if (rebatePreview.value.url) URL.revokeObjectURL(rebatePreview.value.url);
			rebatePreview.value = {
				visible: false,
				title: "支付宝收款码",
				url: "",
				type: "other"
			};
		}
		/** 地址报单合同日期以整单字段为唯一事实源，服务事项只保留事项、天数和金额。 */
		const serializeServiceItems = (items) => JSON.stringify(items.map((item) => ({
			serviceMatter: item.serviceMatter,
			serviceDays: item.serviceDays,
			amount: item.amount
		})));
		const STATUS_MAP = {
			draft: {
				label: "草稿",
				type: "info"
			},
			pending: {
				label: "待审批",
				type: "warning"
			},
			reviewing: {
				label: "审核中",
				type: "warning"
			},
			confirmed: {
				label: "已确认",
				type: "success"
			},
			rejected: {
				label: "已驳回",
				type: "danger"
			}
		};
		const statusLabel = (s) => {
			var _STATUS_MAP;
			return ((_STATUS_MAP = STATUS_MAP[s || "draft"]) === null || _STATUS_MAP === void 0 ? void 0 : _STATUS_MAP.label) || s || "草稿";
		};
		const statusType = (s) => {
			var _STATUS_MAP2;
			return ((_STATUS_MAP2 = STATUS_MAP[s || "draft"]) === null || _STATUS_MAP2 === void 0 ? void 0 : _STATUS_MAP2.type) || "info";
		};
		const isEditableStatus = (s) => s === "draft" || s === "rejected";
		const parseJson = (s) => {
			if (!s) return [];
			try {
				const v = JSON.parse(s);
				return Array.isArray(v) ? v : [];
			} catch (_unused4) {
				return [];
			}
		};
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data2;
					const res = yield addressOrderApi.list(query);
					const d = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					rows.value = (d === null || d === void 0 ? void 0 : d.records) || (d === null || d === void 0 ? void 0 : d.list) || [];
					total.value = Number((d === null || d === void 0 ? void 0 : d.total) || 0);
				} catch (e) {
					rows.value = [];
				} finally {
					loading.value = false;
				}
			});
			return _loadList.apply(this, arguments);
		}
		function loadColleagues() {
			return _loadColleagues.apply(this, arguments);
		}
		function _loadColleagues() {
			_loadColleagues = _asyncToGenerator(function* () {
				try {
					var _res$data3;
					const res = yield addressOrderApi.colleagues();
					const d = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					colleagues.value = Array.isArray(d) ? d : [];
				} catch (e) {
					colleagues.value = [];
				}
			});
			return _loadColleagues.apply(this, arguments);
		}
		function onPageChange(p) {
			query.pageNum = p;
			loadList();
		}
		function onStewardChange(id) {
			const c = colleagues.value.find((x) => x.userId === id);
			form.stewardName = c === null || c === void 0 ? void 0 : c.name;
		}
		function onSalesChange(id) {
			const c = colleagues.value.find((x) => x.userId === id);
			form.salesName = c === null || c === void 0 ? void 0 : c.name;
		}
		function openForm(_x2) {
			return _openForm.apply(this, arguments);
		}
		function _openForm() {
			_openForm = _asyncToGenerator(function* (row) {
				suppressAutoEnd = true;
				Object.keys(form).forEach((k) => delete form[k]);
				Object.assign(form, emptyForm());
				collectItems.value = [];
				payerUnits.value = [];
				serviceItems.value = [];
				balanceItems.value = [];
				if (row === null || row === void 0 ? void 0 : row.id) {
					let full = row;
					try {
						var _res$data4;
						const res = yield addressOrderApi.detail(row.id);
						full = ((_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) || row;
					} catch (e) {
						ElMessage.error("加载详情失败,请重试");
						suppressAutoEnd = false;
						return;
					}
					Object.assign(form, full);
					collectItems.value = parseJson(full.collectItems);
					payerUnits.value = parseJson(full.payerUnits);
					serviceItems.value = parseJson(full.serviceItems);
					balanceItems.value = parseJson(full.balanceItems);
					if (row.id && row.hasRebate === 1) try {
						var _rebateRes$data;
						const rebateRes = yield addressOrderApi.rebate(row.id);
						const rebate = (_rebateRes$data = rebateRes === null || rebateRes === void 0 ? void 0 : rebateRes.data) !== null && _rebateRes$data !== void 0 ? _rebateRes$data : rebateRes;
						form.hasRebate = Number(rebate === null || rebate === void 0 ? void 0 : rebate.hasRebate) === 1 ? 1 : 0;
						form.rebateRecipient = rebate === null || rebate === void 0 ? void 0 : rebate.rebateRecipient;
						form.rebateAlipayQrFileId = rebate === null || rebate === void 0 ? void 0 : rebate.rebateAlipayQrFileId;
					} catch (_unused5) {
						ElMessage.warning("返款资料加载失败，请关闭后重试");
					}
				}
				dlg.visible = true;
				yield nextTick();
				suppressAutoEnd = false;
			});
			return _openForm.apply(this, arguments);
		}
		function buildPayload() {
			const { registerType: _legacyRegisterType, bizYear: _legacyBizYear, bizMonth: _legacyBizMonth } = form;
			return _objectSpread2(_objectSpread2({}, _objectWithoutProperties(form, _excluded)), {}, {
				collectItems: JSON.stringify(collectItems.value),
				payerUnits: JSON.stringify(payerUnits.value),
				serviceItems: serializeServiceItems(serviceItems.value),
				balanceItems: JSON.stringify(balanceItems.value),
				collectTotal: collectTotal.value
			});
		}
		function persistDraft() {
			return _persistDraft.apply(this, arguments);
		}
		function _persistDraft() {
			_persistDraft = _asyncToGenerator(function* () {
				var _res$data5;
				if (!String(form.companyName || "").trim()) {
					ElMessage.warning("暂存草稿至少需要填写企业名称");
					return;
				}
				const res = yield addressOrderApi.save(buildPayload());
				const data = (_res$data5 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data5 !== void 0 ? _res$data5 : res;
				const savedId = Number(data);
				if (Number.isFinite(savedId) && savedId > 0) form.id = savedId;
				return form.id;
			});
			return _persistDraft.apply(this, arguments);
		}
		function saveDraft() {
			return _saveDraft.apply(this, arguments);
		}
		function _saveDraft() {
			_saveDraft = _asyncToGenerator(function* () {
				dlg.saving = true;
				try {
					if (!(yield persistDraft())) return;
					ElMessage.success("草稿已保存");
					dlg.visible = false;
					loadList();
				} finally {
					dlg.saving = false;
				}
			});
			return _saveDraft.apply(this, arguments);
		}
		function saveAndSubmit() {
			return _saveAndSubmit.apply(this, arguments);
		}
		function _saveAndSubmit() {
			_saveAndSubmit = _asyncToGenerator(function* () {
				var _formRef$value2;
				yield (_formRef$value2 = formRef.value) === null || _formRef$value2 === void 0 ? void 0 : _formRef$value2.validate();
				if (form.hasRebate === 1 && !String(form.rebateRecipient || "").trim()) {
					ElMessage.warning("有返款时必须填写返款对象");
					return;
				}
				if (form.hasRebate === 1 && !form.rebateAlipayQrFileId) {
					ElMessage.warning("有返款时必须上传支付宝收款码");
					return;
				}
				const badPhone = payerUnits.value.find((u) => u.contactPhone && !PHONE_RE.test(u.contactPhone));
				if (badPhone) {
					ElMessage.warning(`对接人号码必须是11位数字:${badPhone.contactPhone}`);
					return;
				}
				dlg.saving = true;
				try {
					const id = yield persistDraft();
					if (!id) return;
					yield addressOrderApi.submit(id);
					ElMessage.success("已提交,主管可在「审单中心」进行合同审理");
					dlg.visible = false;
					loadList();
				} finally {
					dlg.saving = false;
				}
			});
			return _saveAndSubmit.apply(this, arguments);
		}
		function submitSavedDraft(_x3) {
			return _submitSavedDraft.apply(this, arguments);
		}
		function _submitSavedDraft() {
			_submitSavedDraft = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认将「${row.companyName}」提交审批？提交后不能继续编辑或删除。`, "提交审批", { type: "warning" });
				yield addressOrderApi.submit(row.id);
				ElMessage.success("已提交,主管可在「审单中心」进行合同审理");
				loadList();
			});
			return _submitSavedDraft.apply(this, arguments);
		}
		function remove(_x4) {
			return _remove.apply(this, arguments);
		}
		function _remove() {
			_remove = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认删除「${row.companyName}」的地址报单?`, "提示", { type: "warning" });
				yield addressOrderApi.remove(row.id);
				ElMessage.success("已删除");
				loadList();
			});
			return _remove.apply(this, arguments);
		}
		onMounted(() => {
			loadList();
			loadColleagues();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_divider = ElDivider;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input_number = ElInputNumber;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_upload = ElUpload;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[30] || (_cache[30] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "ao-title" }, "挂靠地址提单"), createBaseVNode("p", { class: "ao-sub" }, "地址业务新签/续签报单：可先暂存草稿，资料确认后再提交审批。")], -1)), createVNode(_component_el_button, {
					type: "primary",
					onClick: _cache[0] || (_cache[0] = ($event) => openForm())
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(plus_default))]),
						_: 1
					}), _cache[29] || (_cache[29] = createTextVNode(" 新增地址报单", -1))]),
					_: 1
				})]),
				createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_input, {
						modelValue: query.keyword,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => query.keyword = $event),
						class: "ao-kw",
						placeholder: "搜企业名称…",
						clearable: "",
						onKeyup: withKeys(loadList, ["enter"]),
						onClear: loadList
					}, {
						prefix: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: query.customerSource,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => query.customerSource = $event),
						placeholder: "客户来源",
						clearable: "",
						style: { "width": "170px" },
						onChange: loadList
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CUSTOMER_SOURCES, (s) => {
							return createVNode(_component_el_option, {
								key: s,
								label: s,
								value: s
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: query.stewardId,
						"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => query.stewardId = $event),
						placeholder: "服务管家",
						clearable: "",
						filterable: "",
						style: { "width": "150px" },
						onChange: loadList
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
							return openBlock(), createBlock(_component_el_option, {
								key: c.userId,
								label: c.name,
								value: c.userId
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: query.salesId,
						"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => query.salesId = $event),
						placeholder: "销售人员",
						clearable: "",
						filterable: "",
						style: { "width": "150px" },
						onChange: loadList
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
							return openBlock(), createBlock(_component_el_option, {
								key: c.userId,
								label: c.name,
								value: c.userId
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, { onClick: loadList }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						}), _cache[31] || (_cache[31] = createTextVNode(" 查询", -1))]),
						_: 1
					})
				]),
				withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有地址报单,点右上角「新增地址报单」开始",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[5] || (_cache[5] = ($event) => openForm())
						}, {
							default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("新增地址报单", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "企业名称",
							prop: "companyName",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "客户来源",
							prop: "customerSource",
							width: "140",
							"show-overflow-tooltip": ""
						}),
						createVNode(_component_el_table_column, {
							label: "地址类型",
							prop: "addressType",
							width: "90",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "法人",
							prop: "legalName",
							width: "90"
						}),
						createVNode(_component_el_table_column, {
							label: "服务管家",
							prop: "stewardName",
							width: "100"
						}),
						createVNode(_component_el_table_column, {
							label: "销售",
							prop: "salesName",
							width: "100"
						}),
						createVNode(_component_el_table_column, {
							label: "收款汇总",
							width: "120",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.collectTotal)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "90",
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
							width: "190",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [isEditableStatus(row.status) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => openForm(row)
								}, {
									default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "success",
									onClick: ($event) => submitSavedDraft(row)
								}, {
									default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("提交审批", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])
							], 64)) : (openBlock(), createElementBlock("span", _hoisted_4, "已提交"))]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]),
				total.value > 0 ? (openBlock(), createElementBlock("div", _hoisted_5, [createVNode(_component_el_pagination, {
					background: "",
					layout: "total, prev, pager, next",
					total: total.value,
					"current-page": query.pageNum,
					"page-size": query.pageSize,
					onCurrentChange: onPageChange
				}, null, 8, [
					"total",
					"current-page",
					"page-size"
				])])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: dlg.visible,
					"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => dlg.visible = $event),
					title: form.id ? "编辑地址报单" : "新增地址报单",
					width: "920px",
					top: "4vh",
					"destroy-on-close": "",
					class: "ao-dialog"
				}, {
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[26] || (_cache[26] = ($event) => dlg.visible = false) }, {
							default: withCtx(() => [..._cache[55] || (_cache[55] = [createTextVNode("取消", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							loading: dlg.saving,
							onClick: saveDraft
						}, {
							default: withCtx(() => [..._cache[56] || (_cache[56] = [createTextVNode("暂存草稿", -1)])]),
							_: 1
						}, 8, ["loading"]),
						createVNode(_component_el_button, {
							type: "primary",
							loading: dlg.saving,
							onClick: saveAndSubmit
						}, {
							default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("提交审批", -1)])]),
							_: 1
						}, 8, ["loading"])
					]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "formRef",
						ref: formRef,
						model: form,
						rules,
						"label-width": "110px",
						class: "ao-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode("客户基础 · 申请详情", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "企业名称",
											prop: "companyName"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.companyName,
												"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.companyName = $event),
												placeholder: "企业名称"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "客户来源",
											prop: "customerSource"
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.customerSource,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.customerSource = $event),
												placeholder: "选择客户来源",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(CUSTOMER_SOURCES, (s) => {
													return createVNode(_component_el_option, {
														key: s,
														label: s,
														value: s
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "地址类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.addressType,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.addressType = $event),
												placeholder: "新签/续签",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(ADDRESS_TYPES, (a) => {
													return createVNode(_component_el_option, {
														key: a,
														label: a,
														value: a
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "企业地址",
											prop: "companyAddress"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.companyAddress,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.companyAddress = $event),
												placeholder: "新出地址或续签地址"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "法人姓名",
											prop: "legalName"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.legalName,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.legalName = $event),
												placeholder: "法人姓名"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "法人联系方式",
											prop: "legalPhone"
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.legalPhone,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.legalPhone = $event),
												placeholder: "手机号"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "法人身份证号" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.legalIdCard,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.legalIdCard = $event),
												placeholder: "身份证号(可空)"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "服务管家" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.stewardId,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.stewardId = $event),
												placeholder: "选择服务管家",
												clearable: "",
												filterable: "",
												style: { "width": "100%" },
												onChange: onStewardChange
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
													return openBlock(), createBlock(_component_el_option, {
														key: c.userId,
														label: c.deptName ? `${c.name}(${c.deptName})` : c.name,
														value: c.userId
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "销售人员" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.salesId,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.salesId = $event),
												placeholder: "选择销售人员",
												clearable: "",
												filterable: "",
												style: { "width": "100%" },
												onChange: onSalesChange
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
													return openBlock(), createBlock(_component_el_option, {
														key: c.userId,
														label: c.deptName ? `${c.name}(${c.deptName})` : c.name,
														value: c.userId
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
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode("服务单位收款详情", -1)])]),
								_: 1
							}),
							createVNode(_component_el_table, {
								data: collectItems.value,
								border: "",
								size: "small"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "收款类型",
										width: "120"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_select, {
											modelValue: row.collectType,
											"onUpdate:modelValue": ($event) => row.collectType = $event,
											placeholder: "选择",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(COLLECT_TYPES, (t) => {
												return createVNode(_component_el_option, {
													key: t,
													label: t,
													value: t
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "收款账户",
										"min-width": "190"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_select, {
											modelValue: row.account,
											"onUpdate:modelValue": ($event) => row.account = $event,
											placeholder: "选择收款账户",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(COLLECT_ACCOUNTS, (a) => {
												return createVNode(_component_el_option, {
													key: a,
													label: a,
													value: a
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "收款日期(到分钟)",
										width: "200"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_date_picker, {
											modelValue: row.collectDate,
											"onUpdate:modelValue": ($event) => row.collectDate = $event,
											type: "datetime",
											"value-format": "YYYY-MM-DD HH:mm",
											format: "YYYY-MM-DD HH:mm",
											placeholder: "如 2026-07-20 16:20",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "客户单号/付款单号",
										"min-width": "150"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.orderNo,
											"onUpdate:modelValue": ($event) => row.orderNo = $event,
											placeholder: "单号"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										width: "60",
										align: "center"
									}, {
										default: withCtx(({ $index }) => [createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => collectItems.value.splice($index, 1)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(close_default))]),
												_: 1
											})]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"]),
							createVNode(_component_el_button, {
								class: "ao-add",
								size: "small",
								onClick: _cache[15] || (_cache[15] = ($event) => collectItems.value.push({}))
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[38] || (_cache[38] = createTextVNode(" 添加收款行", -1))]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("付款单位信息", -1)])]),
								_: 1
							}),
							createVNode(_component_el_table, {
								data: payerUnits.value,
								border: "",
								size: "small"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "企业名称",
										"min-width": "200"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.companyName,
											"onUpdate:modelValue": ($event) => row.companyName = $event,
											placeholder: "付款企业名称"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "对接人姓名",
										"min-width": "140"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.contactName,
											"onUpdate:modelValue": ($event) => row.contactName = $event,
											placeholder: "对接人"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "对接人号码(11位)",
										"min-width": "160"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.contactPhone,
											"onUpdate:modelValue": ($event) => row.contactPhone = $event,
											placeholder: "11位手机号",
											maxlength: "11",
											class: normalizeClass({ "ao-phone-bad": row.contactPhone && !PHONE_RE.test(row.contactPhone) }),
											onInput: ($event) => row.contactPhone = String(row.contactPhone || "").replace(/\D/g, "")
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"class",
											"onInput"
										])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										width: "60",
										align: "center"
									}, {
										default: withCtx(({ $index }) => [createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => payerUnits.value.splice($index, 1)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(close_default))]),
												_: 1
											})]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"]),
							createVNode(_component_el_button, {
								class: "ao-add",
								size: "small",
								onClick: _cache[16] || (_cache[16] = ($event) => payerUnits.value.push({}))
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[40] || (_cache[40] = createTextVNode(" 添加付款单位", -1))]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("服务事项、合同与收款", -1)])]),
								_: 1
							}),
							createBaseVNode("section", _hoisted_6, [
								_cache[45] || (_cache[45] = createBaseVNode("div", { class: "ao-section-heading" }, [createBaseVNode("strong", null, "服务事项收款明细"), createBaseVNode("span", null, "逐项填写服务内容、服务时长和对应收款金额")], -1)),
								createVNode(_component_el_table, {
									data: serviceItems.value,
									border: "",
									size: "small"
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "服务事项",
											"min-width": "260"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_select, {
												modelValue: row.serviceMatter,
												"onUpdate:modelValue": ($event) => row.serviceMatter = $event,
												placeholder: "选择服务事项",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SERVICE_MATTERS, (m) => {
													return createVNode(_component_el_option, {
														key: m,
														label: m,
														value: m
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue", "onUpdate:modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "服务时长(天)",
											width: "180"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_input, {
												modelValue: row.serviceDays,
												"onUpdate:modelValue": ($event) => row.serviceDays = $event,
												modelModifiers: { number: true },
												placeholder: "天数"
											}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "收款金额",
											width: "200"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
												modelValue: row.amount,
												"onUpdate:modelValue": ($event) => row.amount = $event,
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											width: "60",
											align: "center"
										}, {
											default: withCtx(({ $index }) => [createVNode(_component_el_button, {
												link: "",
												type: "danger",
												size: "small",
												onClick: ($event) => serviceItems.value.splice($index, 1)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(close_default))]),
													_: 1
												})]),
												_: 1
											}, 8, ["onClick"])]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"]),
								createBaseVNode("div", _hoisted_7, [createVNode(_component_el_button, {
									class: "ao-add",
									size: "small",
									onClick: _cache[17] || (_cache[17] = ($event) => serviceItems.value.push({}))
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(plus_default))]),
										_: 1
									}), _cache[42] || (_cache[42] = createTextVNode(" 添加服务事项", -1))]),
									_: 1
								}), createBaseVNode("span", _hoisted_8, [_cache[43] || (_cache[43] = createTextVNode("收款汇总:", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(collectTotal.value)), 1)])]),
								createBaseVNode("div", _hoisted_9, [_cache[44] || (_cache[44] = createBaseVNode("div", { class: "ao-section-heading" }, [createBaseVNode("strong", null, "合同与付款周期"), createBaseVNode("span", null, "合同截止日期会按付款周期和赠送月份自动计算，仍可手动调整")], -1)), createVNode(_component_el_row, { gutter: 14 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, {
											xs: 24,
											sm: 12,
											lg: 6
										}, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "付款周期" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: form.payCycle,
													"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.payCycle = $event),
													placeholder: "选择周期",
													clearable: "",
													style: { "width": "100%" }
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PAY_CYCLES, (p) => {
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
										createVNode(_component_el_col, {
											xs: 24,
											sm: 12,
											lg: 6
										}, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "赠送月份" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: form.giftMonths,
													"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.giftMonths = $event),
													modelModifiers: { number: true },
													placeholder: "赠送月数"
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
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "合同开始" }, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: form.contractStart,
													"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.contractStart = $event),
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "开始日期",
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
													modelValue: form.contractEnd,
													"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => form.contractEnd = $event),
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "自动计算，可手改",
													style: { "width": "100%" }
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								})])
							]),
							createBaseVNode("div", _hoisted_10, [createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 8 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否有返款" }, {
										default: withCtx(() => [createVNode(_component_el_radio_group, {
											modelValue: form.hasRebate,
											"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => form.hasRebate = $event),
											onChange: onHasRebateChange
										}, {
											default: withCtx(() => [createVNode(_component_el_radio_button, { value: 0 }, {
												default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("否", -1)])]),
												_: 1
											}), createVNode(_component_el_radio_button, { value: 1 }, {
												default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("是", -1)])]),
												_: 1
											})]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), form.hasRebate === 1 ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_col, { span: 8 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "返款对象",
										prop: "rebateRecipient"
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.rebateRecipient,
											"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => form.rebateRecipient = $event),
											maxlength: "100",
											placeholder: "填写实际收款人姓名"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 8 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "支付宝收款码",
										prop: "rebateAlipayQrFileId"
									}, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_11, [createVNode(_component_el_upload, {
											"show-file-list": false,
											"http-request": uploadRebateQr,
											accept: ".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
										}, {
											default: withCtx(() => [createVNode(_component_el_button, { type: form.rebateAlipayQrFileId ? "success" : "default" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(form.rebateAlipayQrFileId ? "已上传，可重传" : "上传收款码"), 1)]),
												_: 1
											}, 8, ["type"])]),
											_: 1
										}), form.rebateAlipayQrFileId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
											createVNode(_component_el_button, {
												link: "",
												type: "primary",
												onClick: previewRebateQr
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(view_default))]),
													_: 1
												}), _cache[48] || (_cache[48] = createTextVNode("预览", -1))]),
												_: 1
											}),
											createVNode(_component_el_button, {
												link: "",
												onClick: downloadRebateQr
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(download_default))]),
													_: 1
												}), _cache[49] || (_cache[49] = createTextVNode("下载", -1))]),
												_: 1
											}),
											createVNode(_component_el_button, {
												link: "",
												type: "danger",
												onClick: removeRebateQr
											}, {
												default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("删除", -1)])]),
												_: 1
											})
										], 64)) : createCommentVNode("", true)]), _cache[51] || (_cache[51] = createBaseVNode("span", { class: "ao-hint" }, "仅支持 JPG、PNG 或 PDF，最大10MB。", -1))]),
										_: 1
									})]),
									_: 1
								})], 64)) : createCommentVNode("", true)]),
								_: 1
							})]),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[52] || (_cache[52] = [createTextVNode("尾款情况", -1)])]),
								_: 1
							}),
							createVNode(_component_el_table, {
								data: balanceItems.value,
								border: "",
								size: "small"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "尾款事项",
										"min-width": "260"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.matter,
											"onUpdate:modelValue": ($event) => row.matter = $event,
											placeholder: "尾款事项"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "尾款金额",
										width: "160"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
											modelValue: row.amount,
											"onUpdate:modelValue": ($event) => row.amount = $event,
											min: 0,
											precision: 2,
											"controls-position": "right",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										width: "60",
										align: "center"
									}, {
										default: withCtx(({ $index }) => [createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => balanceItems.value.splice($index, 1)
										}, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(close_default))]),
												_: 1
											})]),
											_: 1
										}, 8, ["onClick"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["data"]),
							createVNode(_component_el_button, {
								class: "ao-add",
								size: "small",
								onClick: _cache[24] || (_cache[24] = ($event) => balanceItems.value.push({}))
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(plus_default))]),
									_: 1
								}), _cache[53] || (_cache[53] = createTextVNode(" 添加尾款行", -1))]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("备注", -1)])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "备注",
								"label-width": "60px"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: form.remark,
									"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => form.remark = $event),
									type: "textarea",
									rows: 2,
									placeholder: "备注(选填)"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: rebatePreview.value.visible,
					"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => rebatePreview.value.visible = $event),
					title: rebatePreview.value.title,
					width: "680px",
					"append-to-body": "",
					"destroy-on-close": "",
					onClosed: clearRebatePreview
				}, {
					default: withCtx(() => [rebatePreview.value.type === "image" ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: rebatePreview.value.url,
						alt: rebatePreview.value.title,
						class: "ao-rebate-preview-image"
					}, null, 8, _hoisted_12)) : rebatePreview.value.type === "pdf" ? (openBlock(), createElementBlock("iframe", {
						key: 1,
						src: rebatePreview.value.url,
						class: "ao-rebate-preview-pdf",
						title: "支付宝收款码预览"
					}, null, 8, _hoisted_13)) : (openBlock(), createBlock(_component_el_empty, {
						key: 2,
						description: "该文件不能在线预览，请下载查看"
					}))]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-271fa094"]]);
//#endregion
export { address_order_default as default };

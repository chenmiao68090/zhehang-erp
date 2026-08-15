import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, $t as download_default, D as ElPagination, Er as withKeys, F as ElEmpty, In as price_tag_default, J as ElCol, M as ElInputNumber, Nn as plus_default, Ot as calendar_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gr as view_default, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { n as partnerPriceApi, t as partnerApi } from "./partner-1NcvZ1yG.js";
import { n as downloadAttachment, t as createAttachmentPreview } from "./file-viewer-CSEUV4IJ.js";
//#region src/views/partner/index.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "partner" };
var _hoisted_2 = { class: "pt-head" };
var _hoisted_3 = { class: "pt-actions" };
var _hoisted_4 = { class: "pt-metrics" };
var _hoisted_5 = { class: "pt-metric-label" };
var _hoisted_6 = { class: "pt-metric-value" };
var _hoisted_7 = { class: "pt-metric-note" };
var _hoisted_8 = { class: "pt-workbench" };
var _hoisted_9 = { class: "pt-table-card" };
var _hoisted_10 = { class: "pt-company" };
var _hoisted_11 = { class: "pt-meta-line" };
var _hoisted_12 = {
	key: 0,
	class: "pt-address"
};
var _hoisted_13 = { class: "pt-contact" };
var _hoisted_14 = { class: "pt-contact pt-contact--sub" };
var _hoisted_15 = { class: "pt-price-chips" };
var _hoisted_16 = {
	key: 0,
	class: "pt-risk-text"
};
var _hoisted_17 = { class: "pt-money" };
var _hoisted_18 = { class: "pt-muted" };
var _hoisted_19 = { class: "pt-status-stack" };
var _hoisted_20 = { class: "pt-remark-text" };
var _hoisted_21 = { class: "pt-row-actions" };
var _hoisted_22 = { class: "pt-side" };
var _hoisted_23 = { class: "pt-side-card" };
var _hoisted_24 = {
	key: 0,
	class: "pt-action-list"
};
var _hoisted_25 = ["onClick"];
var _hoisted_26 = { class: "pt-pager" };
var _hoisted_27 = { class: "pt-level-hint" };
var _hoisted_28 = { key: 0 };
var _hoisted_29 = { class: "pt-price-section" };
var _hoisted_30 = { class: "pt-price-bar" };
var _hoisted_31 = { class: "pt-price-ops" };
var _hoisted_32 = { class: "pt-price-bar" };
var _hoisted_33 = { key: 1 };
var _hoisted_34 = { key: 1 };
var _hoisted_35 = { key: 1 };
var _hoisted_36 = { key: 1 };
var _hoisted_37 = { class: "pt-price-bar" };
var _hoisted_38 = { class: "pt-muted" };
var _hoisted_39 = { class: "pt-remark-text pt-remark-text--small" };
var _hoisted_40 = {
	key: 0,
	class: "pt-vouchers"
};
var _hoisted_41 = ["onClick"];
var _hoisted_42 = {
	key: 0,
	class: "pt-vouchers"
};
var _hoisted_43 = ["onClick"];
var _hoisted_44 = { class: "pt-preview" };
var _hoisted_45 = ["src"];
var _hoisted_46 = ["src"];
//#endregion
//#region src/views/partner/index.vue
var partner_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "index",
	setup(__props) {
		const bizOptions = [
			{
				value: "seal",
				label: "刻章"
			},
			{
				value: "bill",
				label: "提单"
			},
			{
				value: "gs",
				label: "工商"
			},
			{
				value: "mixed",
				label: "综合"
			}
		];
		const levelOptions = [
			{
				value: "normal",
				label: "普通"
			},
			{
				value: "vip",
				label: "重要(VIP)"
			},
			{
				value: "strategic",
				label: "战略"
			}
		];
		const settleOptions = [
			"月结",
			"现结",
			"季结",
			"预付"
		];
		const MAIL_METHODS = [
			"京东寄付",
			"顺丰到付",
			"闪送寄付",
			"顺丰寄付",
			"客户自取"
		];
		/** 根据月度均价自动分级:1000以内=普通 / 1000-2000=银牌 / 2000-3000=金牌 / 3000-5000=钻石 / 5000以上=战略 */
		const levelByAmount = (amt) => {
			const n = Number(amt) || 0;
			if (n >= 5e3) return {
				value: "strategic",
				label: "战略"
			};
			if (n >= 3e3) return {
				value: "strategic",
				label: "钻石"
			};
			if (n >= 2e3) return {
				value: "vip",
				label: "金牌"
			};
			if (n >= 1e3) return {
				value: "vip",
				label: "银牌"
			};
			return {
				value: "normal",
				label: "普通"
			};
		};
		const rows = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(10);
		const keyword = ref("");
		const levelFilter = ref();
		const bizFilter = ref();
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _page$total;
					const res = yield partnerApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value || void 0,
						level: levelFilter.value || void 0,
						bizType: bizFilter.value || void 0
					});
					const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (page === null || page === void 0 ? void 0 : page.records) || [];
					total.value = Number((_page$total = page === null || page === void 0 ? void 0 : page.total) !== null && _page$total !== void 0 ? _page$total : rows.value.length);
				} catch (_unused) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
			});
			return function loadData() {
				return _ref.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
			loadData();
		};
		const dialog = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const dialogPriceRows = ref([]);
		const dialogPriceLoading = ref(false);
		const changeSameAsNew = ref(true);
		watch([dialogPriceRows, changeSameAsNew], () => {
			if (!changeSameAsNew.value) return;
			const n = dialogPriceRows.value.find((r) => (r.itemName || "").includes("新设") && !(r.itemName || "").includes("变更"));
			const c = dialogPriceRows.value.find((r) => (r.itemName || "").includes("变更") && !(r.itemName || "").includes("新设"));
			if (n && c && c.price !== n.price) c.price = n.price;
		}, { deep: true });
		const addDialogPriceRow = () => {
			dialogPriceRows.value.push({
				itemName: "",
				price: 0,
				unit: "个",
				remark: ""
			});
		};
		const removeDialogPriceRow = (index) => {
			dialogPriceRows.value.splice(index, 1);
		};
		const loadDialogPrices = function() {
			var _ref2 = _asyncToGenerator(function* (partnerId) {
				dialogPriceLoading.value = true;
				try {
					var _res$data2;
					const res = yield partnerPriceApi.list(partnerId);
					dialogPriceRows.value = (((_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) || []).map((p) => _objectSpread2({}, p));
				} catch (_unused2) {
					dialogPriceRows.value = [];
				} finally {
					dialogPriceLoading.value = false;
				}
			});
			return function loadDialogPrices(_x) {
				return _ref2.apply(this, arguments);
			};
		}();
		const openForm = (row) => {
			form.value = row ? _objectSpread2({}, row) : {
				level: "normal",
				bizType: "seal",
				needInvoice: 0,
				decisionMaker: "",
				decisionPhone: "",
				bizOwnerName: "",
				bizOwnerPhone: "",
				settleMethod: "",
				invoiceInfo: "",
				monthlyAvg: void 0
			};
			dialog.value = {
				visible: true,
				saving: false
			};
			changeSameAsNew.value = true;
			if (row === null || row === void 0 ? void 0 : row.id) {
				dialogPriceRows.value = [];
				loadDialogPrices(row.id);
			} else dialogPriceRows.value = [
				{
					itemName: "新设:公财法",
					price: 0,
					unit: "套",
					remark: ""
				},
				{
					itemName: "变更:公财法",
					price: 0,
					unit: "套",
					remark: ""
				},
				{
					itemName: "单章",
					price: 0,
					unit: "个",
					remark: ""
				}
			];
		};
		/** 合作等级自动分级文案(随月度均价变化) */
		const autoLevel = computed(() => levelByAmount(form.value.monthlyAvg));
		/** 月度均价变动时,自动把表单等级设为对应区间 */
		watch(() => form.value.monthlyAvg, (v) => {
			if (v == null) return;
			form.value.level = levelByAmount(v).value;
		});
		const submit = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!form.value.companyName) {
					ElMessage.warning("请填写公司名称");
					return;
				}
				const validPrices = dialogPriceRows.value.filter((p) => (p.itemName || "").trim());
				if (validPrices.some((p) => Number(p.price) < 0)) {
					ElMessage.warning("协议价不能为负");
					return;
				}
				dialog.value.saving = true;
				try {
					let partnerId = form.value.id;
					if (form.value.id) yield partnerApi.update(form.value);
					else {
						var _res$data3;
						const res = yield partnerApi.create(form.value);
						partnerId = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					}
					if (partnerId != null && partnerId !== "") yield partnerPriceApi.batchSave(partnerId, validPrices);
					ElMessage.success("已保存");
					dialog.value.visible = false;
					loadData();
				} catch (_unused3) {
					ElMessage.error("保存失败");
				} finally {
					dialog.value.saving = false;
				}
			});
			return function submit() {
				return _ref3.apply(this, arguments);
			};
		}();
		const remove = function() {
			var _ref4 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除客户「${row.companyName}」及其协议价?`, "删除", { type: "warning" });
				} catch (_unused4) {
					return;
				}
				try {
					yield partnerApi.remove(row.id);
					ElMessage.success("已删除");
					loadData();
				} catch (_unused5) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x2) {
				return _ref4.apply(this, arguments);
			};
		}();
		const priceDrawer = ref({ visible: false });
		const priceRows = ref([]);
		const priceLoading = ref(false);
		const openPrices = function() {
			var _ref5 = _asyncToGenerator(function* (row) {
				priceDrawer.value = {
					visible: true,
					partner: row
				};
				loadPrices(row.id);
			});
			return function openPrices(_x3) {
				return _ref5.apply(this, arguments);
			};
		}();
		const loadPrices = function() {
			var _ref6 = _asyncToGenerator(function* (partnerId) {
				priceLoading.value = true;
				try {
					var _res$data4;
					const res = yield partnerApi.prices(partnerId);
					priceRows.value = (((_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res) || []).map((p) => _objectSpread2(_objectSpread2({}, p), {}, { _editing: false }));
				} catch (_unused6) {
					priceRows.value = [];
				} finally {
					priceLoading.value = false;
				}
			});
			return function loadPrices(_x4) {
				return _ref6.apply(this, arguments);
			};
		}();
		const addPriceRow = () => {
			var _priceDrawer$value$pa;
			priceRows.value.unshift({
				partnerId: (_priceDrawer$value$pa = priceDrawer.value.partner) === null || _priceDrawer$value$pa === void 0 ? void 0 : _priceDrawer$value$pa.id,
				itemName: "",
				price: 0,
				unit: "个",
				_editing: true
			});
		};
		const savePriceRow = function() {
			var _ref7 = _asyncToGenerator(function* (row) {
				if (!row.itemName) {
					ElMessage.warning("请填写项目名");
					return;
				}
				try {
					var _priceDrawer$value$pa2;
					if (row.id) yield partnerApi.updatePrice(row);
					else yield partnerApi.addPrice(_objectSpread2(_objectSpread2({}, row), {}, { partnerId: (_priceDrawer$value$pa2 = priceDrawer.value.partner) === null || _priceDrawer$value$pa2 === void 0 ? void 0 : _priceDrawer$value$pa2.id }));
					ElMessage.success("已保存");
					loadPrices(priceDrawer.value.partner.id);
				} catch (_unused7) {
					ElMessage.error("保存失败");
				}
			});
			return function savePriceRow(_x5) {
				return _ref7.apply(this, arguments);
			};
		}();
		const cancelPriceRow = (row, index) => {
			if (row.id) row._editing = false;
			else priceRows.value.splice(index, 1);
		};
		const removePriceRow = function() {
			var _ref8 = _asyncToGenerator(function* (row, index) {
				if (!row.id) {
					priceRows.value.splice(index, 1);
					return;
				}
				try {
					yield ElMessageBox.confirm(`删除「${row.itemName}」这条价格?`, "删除", { type: "warning" });
				} catch (_unused8) {
					return;
				}
				try {
					yield partnerApi.removePrice(row.id);
					ElMessage.success("已删除");
					loadPrices(priceDrawer.value.partner.id);
				} catch (_unused9) {
					ElMessage.error("删除失败");
				}
			});
			return function removePriceRow(_x6, _x7) {
				return _ref8.apply(this, arguments);
			};
		}();
		const bizLabel = (v) => {
			var _bizOptions$find;
			return ((_bizOptions$find = bizOptions.find((o) => o.value === v)) === null || _bizOptions$find === void 0 ? void 0 : _bizOptions$find.label) || "—";
		};
		const levelLabel = (v) => {
			var _levelOptions$find;
			return ((_levelOptions$find = levelOptions.find((o) => o.value === v)) === null || _levelOptions$find === void 0 ? void 0 : _levelOptions$find.label) || "普通";
		};
		const levelType = (v) => ({
			normal: "info",
			vip: "warning",
			strategic: "danger"
		})[v || ""] || "info";
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		const moneyValue = (n) => {
			const value = Number(n) || 0;
			if (value >= 1e4) return `¥${(value / 1e4).toFixed(value >= 1e5 ? 1 : 2).replace(/\.0+$/, "").replace(/(\.\d)0$/, "$1")}万`;
			return `¥${value.toLocaleString(void 0, { maximumFractionDigits: 0 })}`;
		};
		const findPriceItem = (row, key) => (row.prices || []).find((p) => (p.itemName || "").includes(key));
		const PRICE_BASELINES = [
			{
				key: "新设",
				floor: 45
			},
			{
				key: "变更",
				floor: 45
			},
			{
				key: "单章",
				floor: 20
			}
		];
		const standardPriceCards = (row) => PRICE_BASELINES.map((item) => {
			const priceRow = findPriceItem(row, item.key);
			const price = (priceRow === null || priceRow === void 0 ? void 0 : priceRow.price) == null ? null : Number(priceRow.price);
			return {
				label: item.key,
				text: price == null ? "未设" : `${moneyValue(price)}${(priceRow === null || priceRow === void 0 ? void 0 : priceRow.unit) ? `/${priceRow.unit}` : ""}`,
				missing: price == null,
				low: price != null && price < item.floor
			};
		});
		const priceRiskMessages = (row) => {
			const messages = [];
			standardPriceCards(row).forEach((item) => {
				if (item.missing) messages.push(`缺${item.label}价`);
				if (item.low) messages.push(`${item.label}低于底线`);
			});
			return messages;
		};
		const priceRiskText = (row) => priceRiskMessages(row).slice(0, 2).join("、");
		const rowAction = (row) => {
			const remark = row.remark || "";
			const risks = priceRiskMessages(row);
			if (/未结|逾期|催|缺凭证|待确认/.test(remark)) return {
				label: "催结算",
				type: "danger",
				score: 95
			};
			if (risks.some((r) => r.includes("低于"))) return {
				label: "调价复核",
				type: "danger",
				score: 85
			};
			if (risks.length) return {
				label: "补价格项",
				type: "warning",
				score: 75
			};
			if (row.level === "strategic" || Number(row.monthlyAvg || 0) >= 5e3) return {
				label: "重点维护",
				type: "primary",
				score: 62
			};
			return {
				label: "正常维护",
				type: "success",
				score: 20
			};
		};
		const partnerRowClass = ({ row }) => rowAction(row).score >= 75 ? "pt-risk-row" : "";
		const attentionReason = (row) => {
			const risk = priceRiskText(row);
			if (risk) return risk;
			if (/未结|逾期|催|缺凭证|待确认/.test(row.remark || "")) return "备注里有结算/凭证待处理";
			if (Number(row.monthlyAvg || 0) >= 5e3) return `月均 ${moneyValue(row.monthlyAvg)}`;
			return "建议保持月度维护";
		};
		const attentionRows = computed(() => rows.value.map((row) => ({
			row,
			action: rowAction(row),
			reason: attentionReason(row)
		})).filter((item) => item.action.score >= 60).sort((a, b) => b.action.score - a.action.score || Number(b.row.monthlyAvg || 0) - Number(a.row.monthlyAvg || 0)).slice(0, 5));
		const statCards = computed(() => {
			const monthlyTotal = rows.value.reduce((sum, row) => sum + Number(row.monthlyAvg || 0), 0);
			const vipCount = rows.value.filter((row) => row.level === "vip" || row.level === "strategic").length;
			const priceReviewCount = rows.value.filter((row) => priceRiskMessages(row).length).length;
			const actionCount = attentionRows.value.length;
			return [
				{
					label: "合作客户",
					value: `${total.value || rows.value.length}`,
					note: `当前页 ${rows.value.length} 家`,
					tone: "blue"
				},
				{
					label: "当前页月均合计",
					value: moneyValue(monthlyTotal),
					note: "用于快速估算维护价值",
					tone: "green"
				},
				{
					label: "战略/VIP",
					value: `${vipCount}`,
					note: "建议老板或负责人月度维护",
					tone: "amber"
				},
				{
					label: "价格需复核",
					value: `${priceReviewCount}`,
					note: "缺价格项或低于底线",
					tone: "red"
				},
				{
					label: "优先动作",
					value: `${actionCount}`,
					note: "右侧列出处理清单",
					tone: "purple"
				}
			];
		});
		const historyDrawer = ref({ visible: false });
		const historyRows = ref([]);
		const historyLoading = ref(false);
		const openHistory = (row) => {
			historyDrawer.value = {
				visible: true,
				partner: row
			};
			loadHistory(row.id);
		};
		const loadHistory = function() {
			var _ref9 = _asyncToGenerator(function* (pid) {
				historyLoading.value = true;
				try {
					var _res$data5;
					const res = yield partnerApi.history(pid);
					historyRows.value = ((_res$data5 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data5 !== void 0 ? _res$data5 : res) || [];
				} catch (_unused10) {
					historyRows.value = [];
				} finally {
					historyLoading.value = false;
				}
			});
			return function loadHistory(_x8) {
				return _ref9.apply(this, arguments);
			};
		}();
		const filePreview = ref({
			visible: false,
			title: "",
			url: "",
			type: "other"
		});
		const clearPreview = () => {
			if (filePreview.value.url) URL.revokeObjectURL(filePreview.value.url);
			filePreview.value = {
				visible: false,
				title: "",
				url: "",
				type: "other"
			};
		};
		const previewFile = function() {
			var _ref10 = _asyncToGenerator(function* (file) {
				try {
					clearPreview();
					const preview = yield createAttachmentPreview(file);
					if (!preview) return;
					filePreview.value = {
						visible: true,
						title: preview.title,
						url: preview.url,
						type: preview.type,
						file
					};
				} catch (_unused11) {
					ElMessage.error("预览失败");
				}
			});
			return function previewFile(_x9) {
				return _ref10.apply(this, arguments);
			};
		}();
		const downloadFile = function() {
			var _ref11 = _asyncToGenerator(function* (file) {
				try {
					yield downloadAttachment(file);
				} catch (_unused12) {
					ElMessage.error("下载失败");
				}
			});
			return function downloadFile(_x10) {
				return _ref11.apply(this, arguments);
			};
		}();
		const parseVouchers = (v) => {
			try {
				const parsed = JSON.parse(v || "[]");
				if (Array.isArray(parsed)) return {
					settle: parsed || [],
					invoice: []
				};
				if (parsed && typeof parsed === "object") return {
					settle: Array.isArray(parsed.settle) ? parsed.settle : [],
					invoice: Array.isArray(parsed.invoice) ? parsed.invoice : []
				};
			} catch (_unused13) {}
			return {
				settle: [],
				invoice: []
			};
		};
		const voucherCount = (v) => {
			const p = parseVouchers(v);
			return p.settle.length + p.invoice.length;
		};
		const historyEdit = ref({
			visible: false,
			saving: false,
			form: {}
		});
		const voucherList = ref([]);
		const invoiceVoucherList = ref([]);
		const openHistoryEdit = (row) => {
			var _historyDrawer$value$;
			historyEdit.value = {
				visible: true,
				saving: false,
				form: row ? _objectSpread2({}, row) : {
					partnerId: (_historyDrawer$value$ = historyDrawer.value.partner) === null || _historyDrawer$value$ === void 0 ? void 0 : _historyDrawer$value$.id,
					settled: 0,
					invoiceDone: 0,
					amount: void 0
				}
			};
			const p = parseVouchers(row === null || row === void 0 ? void 0 : row.vouchers);
			voucherList.value = p.settle;
			invoiceVoucherList.value = p.invoice;
		};
		const uploadVoucher = function() {
			var _ref12 = _asyncToGenerator(function* (options) {
				try {
					var _res$data6;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data6 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data6 !== void 0 ? _res$data6 : res;
					voucherList.value.push({
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					});
					ElMessage.success("凭证已上传");
				} catch (_unused14) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadVoucher(_x11) {
				return _ref12.apply(this, arguments);
			};
		}();
		const removeVoucher = (i) => voucherList.value.splice(i, 1);
		const uploadInvoiceVoucher = function() {
			var _ref13 = _asyncToGenerator(function* (options) {
				try {
					var _res$data7;
					const res = yield fileInfoApi.upload(options.file);
					const data = (_res$data7 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data7 !== void 0 ? _res$data7 : res;
					invoiceVoucherList.value.push({
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					});
					ElMessage.success("开票凭证已上传");
				} catch (_unused15) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadInvoiceVoucher(_x12) {
				return _ref13.apply(this, arguments);
			};
		}();
		const removeInvoiceVoucher = (i) => invoiceVoucherList.value.splice(i, 1);
		const saveHistory = function() {
			var _ref14 = _asyncToGenerator(function* () {
				if (!historyEdit.value.form.coopMonth) {
					ElMessage.warning("请选择合作月份");
					return;
				}
				historyEdit.value.saving = true;
				try {
					const payload = _objectSpread2(_objectSpread2({}, historyEdit.value.form), {}, { vouchers: JSON.stringify({
						settle: voucherList.value,
						invoice: invoiceVoucherList.value
					}) });
					if (payload.id) yield partnerApi.updateHistory(payload);
					else yield partnerApi.addHistory(payload);
					ElMessage.success("已保存");
					historyEdit.value.visible = false;
					loadHistory(historyDrawer.value.partner.id);
				} catch (_unused16) {
					ElMessage.error("保存失败");
				} finally {
					historyEdit.value.saving = false;
				}
			});
			return function saveHistory() {
				return _ref14.apply(this, arguments);
			};
		}();
		const removeHistoryRow = function() {
			var _ref15 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`删除 ${row.coopMonth || ""} 的合作记录?`, "删除", { type: "warning" });
				} catch (_unused17) {
					return;
				}
				try {
					yield partnerApi.removeHistory(row.id);
					ElMessage.success("已删除");
					loadHistory(historyDrawer.value.partner.id);
				} catch (_unused18) {
					ElMessage.error("删除失败");
				}
			});
			return function removeHistoryRow(_x13) {
				return _ref15.apply(this, arguments);
			};
		}();
		onMounted(loadData);
		return (_ctx, _cache) => {
			var _priceDrawer$value$pa3, _historyDrawer$value$2;
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_input_number = ElInputNumber;
			const _component_el_switch = ElSwitch;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_dialog = ElDialog;
			const _component_el_drawer = ElDrawer;
			const _component_el_upload = ElUpload;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[38] || (_cache[38] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "pt-title" }, "长期合作客户"), createBaseVNode("p", { class: "pt-sub" }, "把长期合作客户、协议价、邮寄规则和结算动作放到一张台账里,减少员工反复确认。")], -1)), createBaseVNode("div", _hoisted_3, [
					createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						class: "pt-search",
						placeholder: "搜公司名/决策人/负责人",
						clearable: "",
						onKeyup: withKeys(reload, ["enter"]),
						onClear: reload
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: levelFilter.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => levelFilter.value = $event),
						placeholder: "等级",
						clearable: "",
						class: "pt-filter",
						onChange: reload
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(levelOptions, (l) => {
							return createVNode(_component_el_option, {
								key: l.value,
								label: l.label,
								value: l.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_select, {
						modelValue: bizFilter.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => bizFilter.value = $event),
						placeholder: "业务",
						clearable: "",
						class: "pt-filter",
						onChange: reload
					}, {
						default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(bizOptions, (b) => {
							return createVNode(_component_el_option, {
								key: b.value,
								label: b.label,
								value: b.value
							}, null, 8, ["label", "value"]);
						}), 64))]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						onClick: _cache[3] || (_cache[3] = ($event) => openForm())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[37] || (_cache[37] = createTextVNode(" 新增客户", -1))]),
						_: 1
					})
				])]),
				createBaseVNode("section", _hoisted_4, [(openBlock(true), createElementBlock(Fragment, null, renderList(statCards.value, (card) => {
					return openBlock(), createElementBlock("div", {
						key: card.label,
						class: normalizeClass(["pt-metric", `pt-metric--${card.tone}`])
					}, [
						createBaseVNode("div", _hoisted_5, toDisplayString(card.label), 1),
						createBaseVNode("div", _hoisted_6, toDisplayString(card.value), 1),
						createBaseVNode("div", _hoisted_7, toDisplayString(card.note), 1)
					], 2);
				}), 128))]),
				_cache[76] || (_cache[76] = createBaseVNode("section", { class: "pt-rule-strip" }, [createBaseVNode("div", null, [
					createBaseVNode("strong", null, "邮寄合作规则"),
					createBaseVNode("span", null, "满 3 个:京东包邮 / 顺丰 +6"),
					createBaseVNode("span", null, "不满 3 个:京东 +8 / 顺丰 +12")
				]), createBaseVNode("p", null, "每个客户可维护默认邮寄方式与地址,报价时先看台账,不要在备注里反复找规则。")], -1)),
				createBaseVNode("section", _hoisted_8, [createBaseVNode("div", _hoisted_9, [_cache[45] || (_cache[45] = createBaseVNode("div", { class: "pt-card-head" }, [createBaseVNode("div", null, [createBaseVNode("strong", null, "合作客户台账"), createBaseVNode("span", null, "按“客户 - 价格 - 结算动作”查看,备注只保留摘要。")]), createBaseVNode("span", { class: "pt-head-tip" }, "建议优先处理低价、缺价格项、未结算/缺凭证客户")], -1)), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: rows.value,
					border: "",
					stripe: "",
					class: "pt-table",
					"row-class-name": partnerRowClass
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: "还没有长期合作客户",
						"image-size": 80
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[4] || (_cache[4] = ($event) => openForm())
						}, {
							default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("新增第一个客户", -1)])]),
							_: 1
						})]),
						_: 1
					})]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "客户",
							"min-width": "230"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_10, [
								createBaseVNode("strong", null, toDisplayString(row.companyName || "未命名客户"), 1),
								createBaseVNode("div", _hoisted_11, [createBaseVNode("span", null, "合作 " + toDisplayString(row.sinceDate || "未填") + " 起", 1), createBaseVNode("span", null, toDisplayString(row.mailMethod || "未设邮寄"), 1)]),
								row.mailAddress ? (openBlock(), createElementBlock("div", _hoisted_12, toDisplayString(row.mailAddress), 1)) : createCommentVNode("", true)
							])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "关键联系人",
							"min-width": "170"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_13, [createBaseVNode("b", null, toDisplayString(row.decisionMaker || "未填决策人"), 1), createBaseVNode("span", null, toDisplayString(row.decisionPhone || "—"), 1)]), createBaseVNode("div", _hoisted_14, [createBaseVNode("b", null, "业务:" + toDisplayString(row.bizOwnerName || "未分配"), 1), createBaseVNode("span", null, toDisplayString(row.bizOwnerPhone || ""), 1)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "协议价摘要",
							"min-width": "238"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_15, [(openBlock(true), createElementBlock(Fragment, null, renderList(standardPriceCards(row), (item) => {
								return openBlock(), createElementBlock("span", {
									key: item.label,
									class: normalizeClass(["pt-price-chip", {
										"is-missing": item.missing,
										"is-low": item.low
									}])
								}, [createBaseVNode("em", null, toDisplayString(item.label), 1), createBaseVNode("b", null, toDisplayString(item.text), 1)], 2);
							}), 128))]), priceRiskText(row) ? (openBlock(), createElementBlock("div", _hoisted_16, toDisplayString(priceRiskText(row)), 1)) : createCommentVNode("", true)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "业务",
							width: "96"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								size: "small",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(bizLabel(row.bizType)), 1)]),
								_: 2
							}, 1024)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "月均",
							width: "118",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_17, toDisplayString(row.monthlyAvg != null ? moneyValue(row.monthlyAvg) : "—"), 1), createBaseVNode("div", _hoisted_18, toDisplayString(row.settleMethod || "未设结算"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "等级/状态",
							width: "138"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_19, [
								createVNode(_component_el_tag, {
									size: "small",
									type: levelType(row.level)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(levelLabel(row.level)), 1)]),
									_: 2
								}, 1032, ["type"]),
								row.needInvoice ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									size: "small",
									type: "success",
									effect: "plain"
								}, {
									default: withCtx(() => [..._cache[39] || (_cache[39] = [createTextVNode("需开票", -1)])]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_tag, {
									size: "small",
									type: rowAction(row).type,
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(rowAction(row).label), 1)]),
									_: 2
								}, 1032, ["type"])
							])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "备注摘要",
							"min-width": "260"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_20, toDisplayString(row.remark || "暂无备注"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "动作",
							width: "220",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_21, [
								createVNode(_component_el_button, {
									size: "small",
									type: "primary",
									plain: "",
									onClick: ($event) => openPrices(row)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(price_tag_default))]),
										_: 1
									}), _cache[40] || (_cache[40] = createTextVNode("报价", -1))]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									plain: "",
									onClick: ($event) => openHistory(row)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(calendar_default))]),
										_: 1
									}), _cache[41] || (_cache[41] = createTextVNode("历史", -1))]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									plain: "",
									onClick: ($event) => openForm(row)
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])
							])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]])]), createBaseVNode("aside", _hoisted_22, [createBaseVNode("div", _hoisted_23, [_cache[46] || (_cache[46] = createBaseVNode("div", { class: "pt-side-head" }, [createBaseVNode("strong", null, "优先处理"), createBaseVNode("span", null, "从当前列表自动判断")], -1)), attentionRows.value.length ? (openBlock(), createElementBlock("div", _hoisted_24, [(openBlock(true), createElementBlock(Fragment, null, renderList(attentionRows.value, (item) => {
					return openBlock(), createElementBlock("button", {
						key: item.row.id || item.row.companyName,
						type: "button",
						class: "pt-action-item",
						onClick: ($event) => openPrices(item.row)
					}, [createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(item.row.companyName), 1), createBaseVNode("em", null, toDisplayString(item.reason), 1)]), createVNode(_component_el_tag, {
						size: "small",
						type: item.action.type
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(item.action.label), 1)]),
						_: 2
					}, 1032, ["type"])], 8, _hoisted_25);
				}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
					key: 1,
					description: "当前列表暂无明显风险",
					"image-size": 58
				}))]), _cache[47] || (_cache[47] = createBaseVNode("div", { class: "pt-side-card" }, [createBaseVNode("div", { class: "pt-side-head" }, [createBaseVNode("strong", null, "标准化建议"), createBaseVNode("span", null, "减少内部扯皮")]), createBaseVNode("ul", { class: "pt-check-list" }, [
					createBaseVNode("li", null, "报价以协议价摘要为准,复杂地区价拆成独立价格项。"),
					createBaseVNode("li", null, "客户默认邮寄方式和地址必须填,不要只写在备注。"),
					createBaseVNode("li", null, "历史合作里按月补结算和开票凭证,财务不用再追问。")
				])], -1))])]),
				createBaseVNode("div", _hoisted_26, [createVNode(_component_el_pagination, {
					"current-page": pageNum.value,
					"onUpdate:currentPage": _cache[5] || (_cache[5] = ($event) => pageNum.value = $event),
					"page-size": pageSize.value,
					"onUpdate:pageSize": _cache[6] || (_cache[6] = ($event) => pageSize.value = $event),
					total: total.value,
					"page-sizes": [
						10,
						20,
						50
					],
					layout: "total, sizes, prev, pager, next, jumper",
					onCurrentChange: loadData,
					onSizeChange: reload
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])]),
				createVNode(_component_el_dialog, {
					modelValue: dialog.value.visible,
					"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => dialog.value.visible = $event),
					title: form.value.id ? "编辑客户" : "新增长期客户",
					width: "720px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[23] || (_cache[23] = ($event) => dialog.value.visible = false) }, {
						default: withCtx(() => [..._cache[53] || (_cache[53] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: dialog.value.saving,
						onClick: submit
					}, {
						default: withCtx(() => [..._cache[54] || (_cache[54] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-width": "116px",
						class: "pt-customer-form"
					}, {
						default: withCtx(() => [createVNode(_component_el_row, { gutter: 14 }, {
							default: withCtx(() => [
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, {
										label: "公司名称",
										required: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.companyName,
											"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.companyName = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "决策人姓名" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.decisionMaker,
											"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.decisionMaker = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "决策人电话" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.decisionPhone,
											"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.decisionPhone = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "业务负责人" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.bizOwnerName,
											"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.value.bizOwnerName = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "负责人电话" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.bizOwnerPhone,
											"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.bizOwnerPhone = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "结算方式" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.settleMethod,
											"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.settleMethod = $event),
											style: { "width": "100%" },
											clearable: ""
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(settleOptions, (s) => {
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
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "月度均价" }, {
										default: withCtx(() => [createVNode(_component_el_input_number, {
											modelValue: form.value.monthlyAvg,
											"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.monthlyAvg = $event),
											min: 0,
											precision: 2,
											controls: false,
											style: { "width": "100%" },
											placeholder: "¥/月"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否开票" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: form.value.needInvoice,
											"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.needInvoice = $event),
											"active-value": 1,
											"inactive-value": 0
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								form.value.needInvoice === 1 ? (openBlock(), createBlock(_component_el_col, {
									key: 0,
									span: 24
								}, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "开票信息" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.invoiceInfo,
											"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.invoiceInfo = $event),
											type: "textarea",
											rows: 2,
											placeholder: "抬头 / 税号 / 开户行等"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作业务" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.bizType,
											"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.value.bizType = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(bizOptions, (b) => {
												return createVNode(_component_el_option, {
													key: b.value,
													label: b.label,
													value: b.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作等级" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.level,
											"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.value.level = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(levelOptions, (l) => {
												return createVNode(_component_el_option, {
													key: l.value,
													label: l.label,
													value: l.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"]), createBaseVNode("div", _hoisted_27, [
											_cache[48] || (_cache[48] = createTextVNode("建议等级:", -1)),
											createBaseVNode("b", null, toDisplayString(autoLevel.value.label), 1),
											form.value.monthlyAvg != null ? (openBlock(), createElementBlock("span", _hoisted_28, "(月均¥" + toDisplayString(fmtMoney(form.value.monthlyAvg)) + ")", 1)) : createCommentVNode("", true),
											_cache[49] || (_cache[49] = createBaseVNode("span", { class: "pt-muted" }, "(仅参考)", -1))
										])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "合作起始" }, {
										default: withCtx(() => [createVNode(_component_el_date_picker, {
											modelValue: form.value.sinceDate,
											"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.value.sinceDate = $event),
											type: "date",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}),
								createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "默认邮寄方式" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.mailMethod,
											"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => form.value.mailMethod = $event),
											style: { "width": "100%" },
											clearable: "",
											placeholder: "选择"
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(MAIL_METHODS, (m) => {
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
								}),
								createVNode(_component_el_col, { span: 24 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "默认邮寄地址" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.mailAddress,
											"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => form.value.mailAddress = $event),
											placeholder: "该客户默认收件地址(邮寄时带出)"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})
							]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: form.value.remark,
								"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => form.value.remark = $event),
								type: "textarea",
								autosize: {
									minRows: 2,
									maxRows: 8
								}
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					}, 8, ["model"]), createBaseVNode("div", _hoisted_29, [createBaseVNode("div", _hoisted_30, [_cache[52] || (_cache[52] = createBaseVNode("div", null, [createBaseVNode("span", { class: "pt-price-title" }, "合作价格(协议价)"), createBaseVNode("span", { class: "pt-muted" }, "登记各项目的约定价格,保存客户时一并保存")], -1)), createBaseVNode("div", _hoisted_31, [createVNode(_component_el_checkbox, {
						modelValue: changeSameAsNew.value,
						"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => changeSameAsNew.value = $event),
						size: "small"
					}, {
						default: withCtx(() => [..._cache[50] || (_cache[50] = [createTextVNode("变更价 = 新设价", -1)])]),
						_: 1
					}, 8, ["modelValue"]), createVNode(_component_el_button, {
						type: "primary",
						size: "small",
						plain: "",
						onClick: addDialogPriceRow
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[51] || (_cache[51] = createTextVNode(" 新增一行", -1))]),
						_: 1
					})])]), withDirectives((openBlock(), createBlock(_component_el_table, {
						data: dialogPriceRows.value,
						border: "",
						size: "small",
						"empty-text": "暂无协议价,点击「新增一行」添加"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "项目",
								"min-width": "130"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_input, {
									modelValue: row.itemName,
									"onUpdate:modelValue": ($event) => row.itemName = $event,
									size: "small",
									placeholder: "如:公章"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "单价",
								width: "130"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
									modelValue: row.price,
									"onUpdate:modelValue": ($event) => row.price = $event,
									min: 0,
									precision: 2,
									controls: false,
									size: "small",
									style: { "width": "100%" },
									placeholder: "¥"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "单位",
								width: "90"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_input, {
									modelValue: row.unit,
									"onUpdate:modelValue": ($event) => row.unit = $event,
									size: "small",
									placeholder: "个"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "备注",
								"min-width": "120"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_input, {
									modelValue: row.remark,
									"onUpdate:modelValue": ($event) => row.remark = $event,
									size: "small"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "60",
								align: "center"
							}, {
								default: withCtx(({ $index }) => [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => removeDialogPriceRow($index)
								}, {
									default: withCtx(() => [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(delete_default))]),
										_: 1
									})]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, dialogPriceLoading.value]])])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_drawer, {
					modelValue: priceDrawer.value.visible,
					"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => priceDrawer.value.visible = $event),
					title: `协议价 · ${((_priceDrawer$value$pa3 = priceDrawer.value.partner) === null || _priceDrawer$value$pa3 === void 0 ? void 0 : _priceDrawer$value$pa3.companyName) || ""}`,
					size: "46%",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_32, [_cache[56] || (_cache[56] = createBaseVNode("span", { class: "pt-muted" }, "为该客户登记各项目的约定价格", -1)), createVNode(_component_el_button, {
						type: "primary",
						size: "small",
						onClick: addPriceRow
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[55] || (_cache[55] = createTextVNode(" 新增价格项", -1))]),
						_: 1
					})]), withDirectives((openBlock(), createBlock(_component_el_table, {
						data: priceRows.value,
						border: "",
						size: "small"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "项目",
								"min-width": "130"
							}, {
								default: withCtx(({ row }) => [row._editing ? (openBlock(), createBlock(_component_el_input, {
									key: 0,
									modelValue: row.itemName,
									"onUpdate:modelValue": ($event) => row.itemName = $event,
									size: "small",
									placeholder: "如:公章"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createElementBlock("span", _hoisted_33, toDisplayString(row.itemName), 1))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "协议价",
								width: "120"
							}, {
								default: withCtx(({ row }) => [row._editing ? (openBlock(), createBlock(_component_el_input_number, {
									key: 0,
									modelValue: row.price,
									"onUpdate:modelValue": ($event) => row.price = $event,
									min: 0,
									precision: 2,
									size: "small",
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createElementBlock("span", _hoisted_34, "¥" + toDisplayString(fmtMoney(row.price)), 1))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "单位",
								width: "80"
							}, {
								default: withCtx(({ row }) => [row._editing ? (openBlock(), createBlock(_component_el_input, {
									key: 0,
									modelValue: row.unit,
									"onUpdate:modelValue": ($event) => row.unit = $event,
									size: "small"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createElementBlock("span", _hoisted_35, toDisplayString(row.unit), 1))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "备注",
								"min-width": "110"
							}, {
								default: withCtx(({ row }) => [row._editing ? (openBlock(), createBlock(_component_el_input, {
									key: 0,
									modelValue: row.remark,
									"onUpdate:modelValue": ($event) => row.remark = $event,
									size: "small"
								}, null, 8, ["modelValue", "onUpdate:modelValue"])) : (openBlock(), createElementBlock("span", _hoisted_36, toDisplayString(row.remark), 1))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "118",
								fixed: "right"
							}, {
								default: withCtx(({ row, $index }) => [row._editing ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_button, {
									size: "small",
									type: "primary",
									link: "",
									onClick: ($event) => savePriceRow(row)
								}, {
									default: withCtx(() => [..._cache[57] || (_cache[57] = [createTextVNode("保存", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									size: "small",
									link: "",
									onClick: ($event) => cancelPriceRow(row, $index)
								}, {
									default: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("取消", -1)])]),
									_: 1
								}, 8, ["onClick"])], 64)) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => row._editing = true
								}, {
									default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("改", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => removePriceRow(row, $index)
								}, {
									default: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("删", -1)])]),
									_: 1
								}, 8, ["onClick"])], 64))]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, priceLoading.value]])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_drawer, {
					modelValue: historyDrawer.value.visible,
					"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => historyDrawer.value.visible = $event),
					title: `历史合作 · ${((_historyDrawer$value$2 = historyDrawer.value.partner) === null || _historyDrawer$value$2 === void 0 ? void 0 : _historyDrawer$value$2.companyName) || ""}`,
					size: "52%",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_37, [_cache[62] || (_cache[62] = createBaseVNode("span", { class: "pt-muted" }, "按月记录合作金额、结算与发票情况,结算凭证可放多张", -1)), createVNode(_component_el_button, {
						type: "primary",
						size: "small",
						onClick: _cache[26] || (_cache[26] = ($event) => openHistoryEdit())
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(plus_default))]),
							_: 1
						}), _cache[61] || (_cache[61] = createTextVNode(" 新增记录", -1))]),
						_: 1
					})]), withDirectives((openBlock(), createBlock(_component_el_table, {
						data: historyRows.value,
						border: "",
						size: "small",
						"empty-text": "暂无历史合作记录"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "月份",
								prop: "coopMonth",
								width: "88"
							}),
							createVNode(_component_el_table_column, {
								label: "月度金额",
								width: "110",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.amount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "是否结算",
								width: "86",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									size: "small",
									type: row.settled ? "success" : "info",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.settled ? "已结" : "未结"), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "发票",
								width: "76",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									size: "small",
									type: row.invoiceDone ? "success" : "info",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(row.invoiceDone ? "已开" : "未开"), 1)]),
									_: 2
								}, 1032, ["type"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "凭证",
								width: "66",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_38, toDisplayString(voucherCount(row.vouchers)) + "张", 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "备注",
								"min-width": "240"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_39, toDisplayString(row.remark || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "92",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => openHistoryEdit(row)
								}, {
									default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("改", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => removeHistoryRow(row)
								}, {
									default: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("删", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, historyLoading.value]])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: historyEdit.value.visible,
					"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => historyEdit.value.visible = $event),
					title: historyEdit.value.form.id ? "编辑合作记录" : "新增合作记录",
					width: "560px",
					"destroy-on-close": "",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[33] || (_cache[33] = ($event) => historyEdit.value.visible = false) }, {
						default: withCtx(() => [..._cache[73] || (_cache[73] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: historyEdit.value.saving,
						onClick: saveHistory
					}, {
						default: withCtx(() => [..._cache[74] || (_cache[74] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: historyEdit.value.form,
						"label-width": "90px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "合作月份",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: historyEdit.value.form.coopMonth,
									"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => historyEdit.value.form.coopMonth = $event),
									type: "month",
									"value-format": "YYYY-MM",
									placeholder: "选择月份",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "月度金额" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: historyEdit.value.form.amount,
									"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => historyEdit.value.form.amount = $event),
									min: 0,
									precision: 2,
									controls: false,
									style: { "width": "100%" },
									placeholder: "¥"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否结算" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: historyEdit.value.form.settled,
											"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => historyEdit.value.form.settled = $event),
											"active-value": 1,
											"inactive-value": 0
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 12 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "发票已开" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: historyEdit.value.form.invoiceDone,
											"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => historyEdit.value.form.invoiceDone = $event),
											"active-value": 1,
											"inactive-value": 0
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "结算凭证" }, {
								default: withCtx(() => [
									createVNode(_component_el_upload, {
										"show-file-list": false,
										"http-request": (o) => uploadVoucher(o),
										accept: "image/*,.pdf",
										multiple: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_button, { size: "small" }, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(plus_default))]),
												_: 1
											}), _cache[65] || (_cache[65] = createTextVNode(" 上传凭证(可多张)", -1))]),
											_: 1
										})]),
										_: 1
									}, 8, ["http-request"]),
									voucherList.value.length ? (openBlock(), createElementBlock("div", _hoisted_40, [(openBlock(true), createElementBlock(Fragment, null, renderList(voucherList.value, (v, i) => {
										return openBlock(), createElementBlock("div", {
											key: `${v.fileId}-${i}`,
											class: "pt-file-chip"
										}, [
											createBaseVNode("button", {
												type: "button",
												class: "pt-file-name",
												onClick: ($event) => previewFile(v)
											}, toDisplayString(v.fileName), 9, _hoisted_41),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												type: "primary",
												onClick: ($event) => previewFile(v)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(view_default))]),
													_: 1
												}), _cache[66] || (_cache[66] = createTextVNode("预览", -1))]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												onClick: ($event) => downloadFile(v)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(download_default))]),
													_: 1
												}), _cache[67] || (_cache[67] = createTextVNode("下载", -1))]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												type: "danger",
												onClick: ($event) => removeVoucher(i)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(delete_default))]),
													_: 1
												})]),
												_: 1
											}, 8, ["onClick"])
										]);
									}), 128))])) : createCommentVNode("", true),
									_cache[68] || (_cache[68] = createBaseVNode("span", { class: "pt-muted" }, "对应李会计那边的结算凭证。", -1))
								]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "开票凭证" }, {
								default: withCtx(() => [
									createVNode(_component_el_upload, {
										"show-file-list": false,
										"http-request": (o) => uploadInvoiceVoucher(o),
										accept: "image/*,.pdf",
										multiple: ""
									}, {
										default: withCtx(() => [createVNode(_component_el_button, { size: "small" }, {
											default: withCtx(() => [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(plus_default))]),
												_: 1
											}), _cache[69] || (_cache[69] = createTextVNode(" 上传开票凭证(可多张)", -1))]),
											_: 1
										})]),
										_: 1
									}, 8, ["http-request"]),
									invoiceVoucherList.value.length ? (openBlock(), createElementBlock("div", _hoisted_42, [(openBlock(true), createElementBlock(Fragment, null, renderList(invoiceVoucherList.value, (v, i) => {
										return openBlock(), createElementBlock("div", {
											key: `${v.fileId}-${i}`,
											class: "pt-file-chip pt-file-chip--success"
										}, [
											createBaseVNode("button", {
												type: "button",
												class: "pt-file-name",
												onClick: ($event) => previewFile(v)
											}, toDisplayString(v.fileName), 9, _hoisted_43),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												type: "primary",
												onClick: ($event) => previewFile(v)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(view_default))]),
													_: 1
												}), _cache[70] || (_cache[70] = createTextVNode("预览", -1))]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												onClick: ($event) => downloadFile(v)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(download_default))]),
													_: 1
												}), _cache[71] || (_cache[71] = createTextVNode("下载", -1))]),
												_: 1
											}, 8, ["onClick"]),
											createVNode(_component_el_button, {
												size: "small",
												link: "",
												type: "danger",
												onClick: ($event) => removeInvoiceVoucher(i)
											}, {
												default: withCtx(() => [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(delete_default))]),
													_: 1
												})]),
												_: 1
											}, 8, ["onClick"])
										]);
									}), 128))])) : createCommentVNode("", true),
									_cache[72] || (_cache[72] = createBaseVNode("span", { class: "pt-muted" }, "已开发票的凭证/发票图片,可多张。", -1))
								]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: historyEdit.value.form.remark,
									"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => historyEdit.value.form.remark = $event),
									type: "textarea",
									autosize: {
										minRows: 3,
										maxRows: 10
									}
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: filePreview.value.visible,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => filePreview.value.visible = $event),
					title: filePreview.value.title,
					width: "72vw",
					"destroy-on-close": "",
					"append-to-body": "",
					onClosed: clearPreview
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_44, [filePreview.value.type === "image" ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: filePreview.value.url,
						alt: "附件预览",
						class: "pt-preview-img"
					}, null, 8, _hoisted_45)) : filePreview.value.type === "pdf" ? (openBlock(), createElementBlock("iframe", {
						key: 1,
						src: filePreview.value.url,
						class: "pt-preview-frame",
						title: "附件预览"
					}, null, 8, _hoisted_46)) : (openBlock(), createBlock(_component_el_empty, {
						key: 2,
						description: "这个格式不能在线预览，可下载后查看"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[35] || (_cache[35] = ($event) => filePreview.value.file && downloadFile(filePreview.value.file))
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(download_default))]),
								_: 1
							}), _cache[75] || (_cache[75] = createTextVNode(" 下载附件", -1))]),
							_: 1
						})]),
						_: 1
					}))])]),
					_: 1
				}, 8, ["modelValue", "title"])
			]);
		};
	}
}), [["__scopeId", "data-v-54d4017a"]]);
//#endregion
export { partner_default as default };

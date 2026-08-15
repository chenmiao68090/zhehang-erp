import { n as __exportAll } from "./rolldown-runtime-Ce7cXt08.js";
import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, st as defineComponent, yt as onBeforeUnmount, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, $t as download_default, B as ElDivider, D as ElPagination, Er as withKeys, F as ElEmpty, J as ElCol, Ln as promotion_default, M as ElInputNumber, Nn as plus_default, Q as ElRadioGroup, V as ElDialog, W as ElDatePicker, Y as ElRow, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, et as ElCheckboxGroup, g as ElTable, gr as view_default, gt as ElForm, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { y as hasImpersonationSessionMarker } from "./request-CZ5tKmxn.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { i as sealOrderApi } from "./seal-ChbS7lCl.js";
import { t as partnerApi } from "./partner-1NcvZ1yG.js";
import { n as downloadAttachment, t as createAttachmentPreview } from "./file-viewer-CSEUV4IJ.js";
import QRCode from "qrcode";
//#region src/views/seal/registration.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "sr-head" };
var _hoisted_2 = { key: 0 };
var _hoisted_3 = { class: "sr-actions" };
var _hoisted_4 = { class: "sr-stats" };
var _hoisted_5 = { class: "sr-stat" };
var _hoisted_6 = { class: "sr-stat-num" };
var _hoisted_7 = { class: "sr-stat" };
var _hoisted_8 = { class: "sr-stat-num" };
var _hoisted_9 = { class: "sr-stat sr-stat--fee" };
var _hoisted_10 = { class: "sr-stat-num" };
var _hoisted_11 = { class: "sr-pager" };
var _hoisted_12 = {
	key: 0,
	class: "sr-type-groups"
};
var _hoisted_13 = { class: "sr-type-mat" };
var _hoisted_14 = {
	key: 1,
	class: "sr-hint"
};
var _hoisted_15 = {
	key: 2,
	class: "sr-hint"
};
var _hoisted_16 = { class: "sr-id-uploads" };
var _hoisted_17 = {
	key: 0,
	class: "sr-hint"
};
var _hoisted_18 = { class: "sr-doc-grid" };
var _hoisted_19 = {
	key: 0,
	class: "sr-file-actions"
};
var _hoisted_20 = ["onClick"];
var _hoisted_21 = {
	key: 0,
	class: "sr-pasted"
};
var _hoisted_22 = ["onClick"];
var _hoisted_23 = {
	key: 0,
	class: "sr-pasted"
};
var _hoisted_24 = ["onClick"];
var _hoisted_25 = { class: "sr-templates" };
var _hoisted_26 = ["href", "download"];
var _hoisted_27 = { class: "sr-id-uploads" };
var _hoisted_28 = { class: "sr-id-uploads" };
var _hoisted_29 = { class: "sr-cost" };
var _hoisted_30 = { class: "sr-cost-total" };
var _hoisted_31 = { class: "sr-preview" };
var _hoisted_32 = ["src"];
var _hoisted_33 = ["src"];
var _hoisted_34 = { style: { "text-align": "center" } };
var _hoisted_35 = ["src"];
var _hoisted_36 = {
	key: 1,
	style: {
		"margin": "0 0 8px",
		"color": "var(--el-color-warning)",
		"font-size": "12px"
	}
};
var SEAL_UPLOAD_ACCEPT = ".jpg,.jpeg,.pdf,image/jpeg,application/pdf";
var SEAL_UPLOAD_TIP = "只能上传 JPG/JPEG 图片或 PDF 文件，PNG 请先另存/转换为 JPG 后上传";
var RECORD_QUERY_URL = "https://yzgl.gat.zj.gov.cn/page/3/ch02/index.html";
var DRAFT_KEY = "seal_draft";
var registration_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
	__name: "registration",
	props: {
		createOnly: {
			type: Boolean,
			default: false
		},
		embedded: {
			type: Boolean,
			default: false
		},
		initialData: {}
	},
	emits: ["closed", "saved"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const PERF_DEPTS = [
			"刻章部",
			"会计部",
			"工商部",
			"总经办",
			"人力行政部",
			"运营支持部",
			"销售部"
		];
		const SEAL_STATUSES = [
			"新设刻章",
			"变更刻章",
			"损坏重刻",
			"遗失声明",
			"遗失登报",
			"萝卜章",
			"仅备案"
		];
		const RECORD_STATUSES = [
			"备案刻章",
			"仅备案",
			"萝卜章",
			"仅登报"
		];
		const SEAL_CITIES = [
			"杭州",
			"台州",
			"温州",
			"金华",
			"宁波",
			"湖州",
			"绍兴",
			"嘉兴",
			"衢州",
			"丽水",
			"舟山"
		];
		const MATERIALS = [
			"光敏",
			"牛角",
			"回墨"
		];
		const SEAL_TEMPLATES = {
			"变更刻章": [{
				name: "变更后重新刻章申请及情况说明",
				file: "change"
			}],
			"损坏重刻": [{
				name: "印章损坏情况说明及重新刻章申请",
				file: "damaged"
			}],
			"遗失声明": [{
				name: "印章遗失情况说明及重刻申请",
				file: "lost"
			}],
			"遗失登报": [{
				name: "印章遗失情况说明及重刻申请",
				file: "lost"
			}]
		};
		const relevantTemplates = computed(() => {
			const list = [...SEAL_TEMPLATES[form.value.sealStatus || ""] || []];
			if (form.value.handlerIsLegal === 0) list.push({
				name: "印章刻制委托情况说明",
				file: "entrust"
			});
			list.push({
				name: "印章缴销申请书",
				file: "cancel"
			});
			return list.map((t) => _objectSpread2(_objectSpread2({}, t), {}, { url: `/seal-templates/${t.file}.docx` }));
		});
		const MATERIAL_TYPES = {
			光敏: [
				"法定名称章",
				"合同专用章",
				"发票专用章",
				"某某专用章"
			],
			牛角: ["财务专用章", "法定代表人名章"],
			回墨: [
				"法定名称章",
				"合同专用章",
				"某某专用章"
			]
		};
		const PAY_METHODS = [
			"待结算",
			"浙杭刻章码丨微信",
			"浙杭刻章码丨支付宝",
			"周结算丨累计结算",
			"月度待结算",
			"线上核销",
			"浙杭对公丨光大",
			"主营业务扣款",
			"赠送",
			"诚路扫码丨丰收银联",
			"陈总丨个人微信收款",
			"收支抵扣"
		];
		const DELIVERY_TYPES = [
			"顺丰到付",
			"顺丰寄付",
			"京东寄付",
			"闪送寄付",
			"客户自取",
			"同事自取"
		];
		const DELIVERY_FEE = {
			顺丰到付: 0,
			顺丰寄付: 10,
			京东寄付: 8,
			闪送寄付: 15
		};
		const MATERIAL_COST = {
			光敏: 2,
			牛角: 2,
			回墨: 15
		};
		const statusOptions = [
			{
				value: "lack",
				label: "缺资料"
			},
			{
				value: "recorded",
				label: "已备案"
			},
			{
				value: "pending",
				label: "待刻章"
			},
			{
				value: "engraved",
				label: "已刻制"
			},
			{
				value: "mailed",
				label: "已邮寄"
			},
			{
				value: "taken",
				label: "已取走"
			},
			{
				value: "done",
				label: "已完成"
			}
		];
		const userStore = useUserStore();
		const rows = ref([]);
		const loading = ref(false);
		const total = ref(0);
		const pageNum = ref(1);
		const pageSize = ref(10);
		const keyword = ref("");
		const statusFilter = ref();
		const invoiceFilter = ref(false);
		const partners = ref([]);
		const loadData = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data, _page$total;
					const res = yield sealOrderApi.list({
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value || void 0,
						status: statusFilter.value || void 0,
						needInvoice: invoiceFilter.value ? 1 : void 0,
						invoiceDone: invoiceFilter.value ? 0 : void 0
					});
					const page = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					rows.value = (page === null || page === void 0 ? void 0 : page.records) || (page === null || page === void 0 ? void 0 : page.list) || [];
					total.value = Number((_page$total = page === null || page === void 0 ? void 0 : page.total) !== null && _page$total !== void 0 ? _page$total : rows.value.length);
				} catch (_unused) {
					rows.value = [];
					total.value = 0;
				} finally {
					loading.value = false;
				}
				loadStats();
			});
			return function loadData() {
				return _ref.apply(this, arguments);
			};
		}();
		const reload = () => {
			pageNum.value = 1;
			loadData();
		};
		const stats = ref({
			monthCount: 0,
			monthFee: 0,
			todayCount: 0
		});
		const loadStats = function() {
			var _ref3 = _asyncToGenerator(function* () {
				try {
					var _ref2, _res$data2;
					const res = yield sealOrderApi.list({
						pageNum: 1,
						pageSize: 1e3
					});
					const list = ((_ref2 = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res) === null || _ref2 === void 0 ? void 0 : _ref2.records) || [];
					const ym = todayStr().slice(0, 7);
					const today = todayStr();
					let mc = 0, mf = 0, tc = 0;
					list.forEach((r) => {
						const d = String(r.regDate || "");
						if (d.slice(0, 7) === ym) {
							mc++;
							mf += Number(r.fee || 0);
						}
						if (d === today) tc++;
					});
					stats.value = {
						monthCount: mc,
						monthFee: mf,
						todayCount: tc
					};
				} catch (_unused2) {}
			});
			return function loadStats() {
				return _ref3.apply(this, arguments);
			};
		}();
		const loadPartners = function() {
			var _ref5 = _asyncToGenerator(function* () {
				try {
					var _ref4, _res$data3;
					const res = yield partnerApi.list({
						pageNum: 1,
						pageSize: 1e3
					});
					partners.value = ((_ref4 = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res) === null || _ref4 === void 0 ? void 0 : _ref4.records) || [];
				} catch (_unused3) {
					partners.value = [];
				}
			});
			return function loadPartners() {
				return _ref5.apply(this, arguments);
			};
		}();
		const todayStr = () => {
			const d = /* @__PURE__ */ new Date();
			const pad = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
		};
		const disabledBeforeToday = (date) => {
			const t = /* @__PURE__ */ new Date();
			t.setHours(0, 0, 0, 0);
			return date.getTime() < t.getTime();
		};
		const dialog = ref({
			visible: false,
			saving: false
		});
		const form = ref({});
		const qrVisible = ref(false);
		const qrDataUrl = ref("");
		const qrLoading = ref(false);
		const selfServiceUrl = ref("");
		const selfServiceExpiresAt = ref(0);
		const selfServiceExpiresText = computed(() => selfServiceExpiresAt.value ? new Date(selfServiceExpiresAt.value).toLocaleString("zh-CN", { hour12: false }) : "");
		function openQr() {
			return _openQr.apply(this, arguments);
		}
		function _openQr() {
			_openQr = _asyncToGenerator(function* () {
				qrLoading.value = true;
				try {
					var _res$data4;
					const res = yield sealOrderApi.issuePublicToken();
					const ticket = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res;
					if (!(ticket === null || ticket === void 0 ? void 0 : ticket.token) || !/^[0-9a-f]{64}$/.test(ticket.token)) throw new Error("安全链接签发失败");
					selfServiceUrl.value = `${window.location.origin}/seal/submit#ticket=${ticket.token}`;
					selfServiceExpiresAt.value = Number(ticket.expiresAt || 0);
					qrDataUrl.value = yield QRCode.toDataURL(selfServiceUrl.value, {
						width: 280,
						margin: 2
					});
					qrVisible.value = true;
				} catch (error) {
					var _error$response;
					selfServiceUrl.value = "";
					selfServiceExpiresAt.value = 0;
					qrDataUrl.value = "";
					ElMessage.error((error === null || error === void 0 || (_error$response = error.response) === null || _error$response === void 0 || (_error$response = _error$response.data) === null || _error$response === void 0 ? void 0 : _error$response.message) || (error === null || error === void 0 ? void 0 : error.message) || "安全链接生成失败，请稍后重试");
				} finally {
					qrLoading.value = false;
				}
			});
			return _openQr.apply(this, arguments);
		}
		function downloadQr() {
			const a = document.createElement("a");
			a.href = qrDataUrl.value;
			a.download = "刻章客户自助二维码.png";
			a.click();
		}
		function copySelfUrl() {
			return _copySelfUrl.apply(this, arguments);
		}
		function _copySelfUrl() {
			_copySelfUrl = _asyncToGenerator(function* () {
				if (!selfServiceUrl.value) return;
				try {
					yield navigator.clipboard.writeText(selfServiceUrl.value);
					ElMessage.success("链接已复制,可直接发给客户");
				} catch (_unused4) {
					ElMessage.error("复制失败,请手动选中链接复制");
				}
			});
			return _copySelfUrl.apply(this, arguments);
		}
		const sealTypeList = ref([]);
		const sealMaterialList = ref([]);
		const luoboConfirmed = ref(false);
		let prevSealStatus = "";
		const yearMonthText = computed(() => {
			const d = String(form.value.regDate || "");
			if (d.length < 7) return "";
			return `${d.slice(0, 4)}年 ${Number(d.slice(5, 7))}月`;
		});
		const materialTypeGroups = computed(() => sealMaterialList.value.map((m) => ({
			material: m,
			combos: (MATERIAL_TYPES[m] || []).map((t) => ({
				type: t,
				value: `${m}-${t}`
			}))
		})));
		const dupWarning = computed(() => {
			if (form.value.bizType !== "new" || !form.value.companyName) return "";
			const name = String(form.value.companyName).trim();
			if (name.length < 3) return "";
			const hit = partners.value.find((p) => p.companyName && (p.companyName === name || String(p.companyName).includes(name) || name.includes(String(p.companyName))));
			return hit ? `系统里已有「${hit.companyName}」(长期合作客户),这可能是老客户,建议改选「老客户」从长期合作里挑。` : "";
		});
		const docs = ref({});
		const simpleFile = (fileId, fileName = "附件") => ({
			fileId,
			fileName
		});
		const isSealAllowedFile = (file) => {
			if (!file) return false;
			const type = (file.type || "").toLowerCase();
			const name = (file.name || "").toLowerCase();
			return type === "image/jpeg" || type === "application/pdf" || /\.(jpe?g|pdf)$/i.test(name);
		};
		const uploadSealAttachment = function() {
			var _ref6 = _asyncToGenerator(function* (file) {
				var _res$data5;
				if (!isSealAllowedFile(file)) {
					ElMessage.warning(SEAL_UPLOAD_TIP);
					return null;
				}
				const res = yield fileInfoApi.upload(file);
				return (_res$data5 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data5 !== void 0 ? _res$data5 : res;
			});
			return function uploadSealAttachment(_x) {
				return _ref6.apply(this, arguments);
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
		const previewAttachment = function() {
			var _ref7 = _asyncToGenerator(function* (file) {
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
				} catch (_unused5) {
					ElMessage.error("预览失败");
				}
			});
			return function previewAttachment(_x2) {
				return _ref7.apply(this, arguments);
			};
		}();
		const downloadFile = function() {
			var _ref8 = _asyncToGenerator(function* (file) {
				try {
					yield downloadAttachment(file);
				} catch (_unused6) {
					ElMessage.error("下载失败");
				}
			});
			return function downloadFile(_x3) {
				return _ref8.apply(this, arguments);
			};
		}();
		const docSlots = computed(() => {
			const slots = [{
				key: "license",
				label: "营业执照/电子执照",
				required: true
			}];
			const outRegion = form.value.sealCity && form.value.sealCity !== "杭州";
			slots.push({
				key: "legalHalfBody",
				label: "法人靠白墙半身照",
				required: !!outRegion
			});
			const st = form.value.sealStatus;
			if (st === "变更刻章") {
				slots.push({
					key: "changeForm",
					label: "变更情况表(浙里办)",
					required: true
				});
				slots.push({
					key: "changeReapply",
					label: "变更后重新刻章申请及情况说明",
					required: true
				});
			}
			if (st === "损坏重刻") slots.push({
				key: "damageDesc",
				label: "损坏说明及重刻申请",
				required: true
			});
			if (st === "遗失声明") {
				slots.push({
					key: "publicNotice",
					label: "浙里办电子公告声明",
					required: true
				});
				slots.push({
					key: "lostReapply",
					label: "印章遗失情况说明及重刻申请",
					required: true
				});
			}
			if (st === "遗失登报") {
				slots.push({
					key: "newspaper",
					label: "报纸照片(登报后)",
					required: false
				});
				slots.push({
					key: "lostReapply",
					label: "印章遗失情况说明及重刻申请",
					required: true
				});
			}
			if (form.value.handlerIsLegal === 0) {
				slots.push({
					key: "agentId",
					label: "经办人身份证",
					required: true
				});
				slots.push({
					key: "agentHalfBody",
					label: "经办人半身照",
					required: true
				});
				slots.push({
					key: "authLetter",
					label: "授权委托说明",
					required: true
				});
			}
			return slots;
		});
		const uploadDoc = function() {
			var _ref9 = _asyncToGenerator(function* (key, options) {
				try {
					const data = yield uploadSealAttachment(options.file);
					if (!data) return;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { [key]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused7) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadDoc(_x4, _x5) {
				return _ref9.apply(this, arguments);
			};
		}();
		let otherSeq = 0;
		const uploadOther = function() {
			var _ref10 = _asyncToGenerator(function* (options) {
				try {
					const data = yield uploadSealAttachment(options.file);
					if (!data) return;
					otherSeq++;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { [`other-${otherSeq}`]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused8) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadOther(_x6) {
				return _ref10.apply(this, arguments);
			};
		}();
		const otherDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith("other-")).map(([k, v]) => _objectSpread2({ key: k }, v)));
		const openRecordQuery = () => window.open(RECORD_QUERY_URL, "_blank");
		let pasteSeq = 0;
		const onWindowPaste = function() {
			var _ref11 = _asyncToGenerator(function* (e) {
				if (!dialog.value.visible) return;
				const cd = e.clipboardData;
				if (!cd) return;
				const images = [];
				const items = cd.items;
				if (items && items.length) for (let i = 0; i < items.length; i++) {
					const it = items[i];
					if (it.kind === "file" && it.type && it.type.startsWith("image/")) {
						const f = it.getAsFile();
						if (f) images.push(f);
					}
				}
				if (!images.length && cd.files && cd.files.length) for (let i = 0; i < cd.files.length; i++) {
					const f = cd.files[i];
					if (f && f.type && f.type.startsWith("image/")) images.push(f);
				}
				if (!images.length) return;
				e.preventDefault();
				for (const file of images) try {
					const data = yield uploadSealAttachment(file);
					if (!data) continue;
					pasteSeq++;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { [`paste-${Date.now()}-${pasteSeq}`]: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || file.name || `粘贴图片${pasteSeq}`
					} });
					ElMessage.success("已粘贴");
				} catch (_unused9) {
					ElMessage.error("粘贴上传失败");
				}
			});
			return function onWindowPaste(_x7) {
				return _ref11.apply(this, arguments);
			};
		}();
		const pastedDocs = computed(() => Object.entries(docs.value).filter(([k]) => k.startsWith("paste-")).map(([k, v]) => _objectSpread2({ key: k }, v)));
		const removeDoc = (key) => {
			const d = _objectSpread2({}, docs.value);
			delete d[key];
			docs.value = d;
		};
		const sealCount = computed(() => sealTypeList.value.length);
		const outRegionFee = computed(() => {
			const manual = Number(form.value.outRegionFee);
			if (Number.isFinite(manual) && manual > 0) return manual;
			return form.value.sealCity && form.value.sealCity !== "杭州" ? 25 * sealCount.value : 0;
		});
		const deliveryFee = computed(() => DELIVERY_FEE[form.value.deliveryType || ""] || 0);
		const materialCost = computed(() => {
			return sealMaterialList.value.reduce((mx, m) => Math.max(mx, MATERIAL_COST[m] || 0), 0) * sealCount.value;
		});
		const opCostTotal = computed(() => outRegionFee.value + deliveryFee.value + materialCost.value + Number(form.value.publishFee || 0));
		const onRegDate = () => {
			const d = String(form.value.regDate || "");
			if (d.length >= 7) {
				form.value.billYear = d.slice(0, 4);
				form.value.billMonth = String(Number(d.slice(5, 7)));
			}
		};
		const onMaterial = () => {
			const mats = sealMaterialList.value;
			sealTypeList.value = sealTypeList.value.filter((c) => mats.some((m) => c.startsWith(m + "-")));
		};
		const confirmLuobo = () => ElMessageBox.confirm("萝卜章属于私下刻制,无印章编码,无备案记录,官方系统查不到,不具备合法效力。非不可抗因素禁止刻制。刻制后浙杭刻章店不承担任何责任,后果刻章单位自负。是否确认刻制?", "温馨提示", {
			confirmButtonText: "确认刻制",
			cancelButtonText: "否",
			type: "warning"
		}).then(() => true).catch(() => false);
		const onSealStatus = function() {
			var _ref12 = _asyncToGenerator(function* (val) {
				if (val === "萝卜章") if (yield confirmLuobo()) {
					luoboConfirmed.value = true;
					prevSealStatus = val;
					form.value.isRecord = 0;
				} else {
					form.value.sealStatus = prevSealStatus || "";
					luoboConfirmed.value = false;
				}
				else {
					luoboConfirmed.value = false;
					prevSealStatus = val;
				}
			});
			return function onSealStatus(_x8) {
				return _ref12.apply(this, arguments);
			};
		}();
		const onRecordStatus = function() {
			var _ref13 = _asyncToGenerator(function* (val) {
				if (val === "萝卜章") if (yield confirmLuobo()) {
					luoboConfirmed.value = true;
					form.value.isRecord = 0;
				} else form.value.recordStatus = "";
			});
			return function onRecordStatus(_x9) {
				return _ref13.apply(this, arguments);
			};
		}();
		const onBizType = () => {
			if (form.value.bizType === "new") form.value.partnerId = void 0;
			else if (!partners.value.length) loadPartners();
		};
		const onPickPartner = (id) => {
			const p = partners.value.find((x) => x.id === id);
			if (p) {
				form.value.companyName = p.companyName;
				form.value.phone = form.value.phone || p.phone;
				form.value.legalPerson = form.value.legalPerson || p.contact || p.decisionMaker;
				if (p.bizOwnerName) form.value.ownerName = p.bizOwnerName;
				if (p.mailMethod && !form.value.deliveryType) form.value.deliveryType = p.mailMethod;
				if (p.mailAddress && !form.value.address) {
					form.value.address = p.mailAddress;
					form.value.isMail = 1;
				}
			}
		};
		const openForm = (row) => {
			if (row) {
				form.value = _objectSpread2({}, row);
				sealTypeList.value = splitTypes(row.sealTypes);
				sealMaterialList.value = splitTypes(row.sealMaterial);
				luoboConfirmed.value = !!row.luoboConfirmed;
				prevSealStatus = row.sealStatus || "";
				docs.value = parseDocuments(row.documents);
				if (row.bizType === "old") loadPartners();
			} else {
				var _userStore$userInfo, _userStore$userInfo2, _userStore$userInfo3;
				const me = ((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.name) || ((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.nickName) || ((_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.username) || "";
				const initial = props.initialData || {};
				const prefill = {};
				if (initial.regDate && initial.regDate >= todayStr()) prefill.regDate = initial.regDate;
				if (initial.companyName) prefill.companyName = initial.companyName;
				if (initial.phone) prefill.phone = initial.phone;
				if (initial.address) prefill.address = initial.address;
				if (initial.ownerName) prefill.ownerName = initial.ownerName;
				if (initial.perfDept && PERF_DEPTS.includes(initial.perfDept)) prefill.perfDept = initial.perfDept;
				form.value = _objectSpread2({
					regDate: todayStr(),
					bizType: "new",
					sealCity: "杭州",
					recordStatus: "",
					isMail: 0,
					isRecord: 0,
					isShipped: 0,
					isDelivered: 0,
					handlerIsLegal: 1,
					isWePublish: 0,
					status: "pending",
					fee: 0,
					ownerName: me
				}, prefill);
				sealTypeList.value = [];
				sealMaterialList.value = [];
				luoboConfirmed.value = false;
				prevSealStatus = "";
				docs.value = {};
				onRegDate();
				restoreDraft();
			}
			dialog.value = {
				visible: true,
				saving: false
			};
		};
		const onDialogClosed = () => {
			if (props.createOnly) emit("closed");
		};
		const restoreDraft = () => {
			if (hasImpersonationSessionMarker()) return;
			try {
				const raw = localStorage.getItem(DRAFT_KEY);
				if (!raw) return;
				const d = JSON.parse(raw);
				if (!d || typeof d !== "object") return;
				form.value = _objectSpread2(_objectSpread2({}, form.value), d.form);
				sealTypeList.value = Array.isArray(d.sealTypeList) ? d.sealTypeList : [];
				sealMaterialList.value = Array.isArray(d.sealMaterialList) ? d.sealMaterialList : [];
				docs.value = d.docs && typeof d.docs === "object" ? d.docs : {};
				luoboConfirmed.value = !!d.luoboConfirmed;
				prevSealStatus = form.value.sealStatus || "";
				ElMessage.info("已恢复上次未提交的草稿");
			} catch (_unused10) {}
		};
		const clearDraft = () => {
			if (hasImpersonationSessionMarker()) return;
			try {
				localStorage.removeItem(DRAFT_KEY);
			} catch (_unused11) {}
		};
		watch([
			form,
			sealTypeList,
			sealMaterialList,
			docs,
			luoboConfirmed
		], () => {
			if (!dialog.value.visible || form.value.id || hasImpersonationSessionMarker()) return;
			try {
				localStorage.setItem(DRAFT_KEY, JSON.stringify({
					form: form.value,
					sealTypeList: sealTypeList.value,
					sealMaterialList: sealMaterialList.value,
					docs: docs.value,
					luoboConfirmed: luoboConfirmed.value
				}));
			} catch (_unused12) {}
		}, { deep: true });
		const uploadId = function() {
			var _ref14 = _asyncToGenerator(function* (side, options) {
				try {
					const data = yield uploadSealAttachment(options.file);
					if (!data) return;
					const id = data === null || data === void 0 ? void 0 : data.id;
					if (side === "front") form.value.idCardFront = id != null ? String(id) : options.file.name;
					else form.value.idCardBack = id != null ? String(id) : options.file.name;
					ElMessage.success("上传成功");
				} catch (_unused13) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadId(_x10, _x11) {
				return _ref14.apply(this, arguments);
			};
		}();
		const removeId = (side) => {
			if (side === "front") form.value.idCardFront = "";
			else form.value.idCardBack = "";
			ElMessage.success("已删除");
		};
		const uploadAlipayQr = function() {
			var _ref15 = _asyncToGenerator(function* (options) {
				try {
					const data = yield uploadSealAttachment(options.file);
					if (!data) return;
					form.value.customerAlipayQr = (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : options.file.name;
					ElMessage.success("上传成功");
				} catch (_unused14) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadAlipayQr(_x12) {
				return _ref15.apply(this, arguments);
			};
		}();
		const removeAlipayQr = () => {
			form.value.customerAlipayQr = "";
			ElMessage.success("已删除");
		};
		const uploadPayVoucher = function() {
			var _ref16 = _asyncToGenerator(function* (options) {
				try {
					const data = yield uploadSealAttachment(options.file);
					if (!data) return;
					docs.value = _objectSpread2(_objectSpread2({}, docs.value), {}, { payVoucher: {
						fileId: (data === null || data === void 0 ? void 0 : data.id) != null ? String(data.id) : "",
						fileName: (data === null || data === void 0 ? void 0 : data.originalName) || (data === null || data === void 0 ? void 0 : data.fileName) || options.file.name
					} });
					ElMessage.success("上传成功");
				} catch (_unused15) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadPayVoucher(_x13) {
				return _ref16.apply(this, arguments);
			};
		}();
		const submit = function() {
			var _ref17 = _asyncToGenerator(function* () {
				if (!form.value.companyName || !form.value.regDate) {
					ElMessage.warning("请填写提单日期和公司名称");
					return;
				}
				if (!form.value.perfDept) {
					ElMessage.warning("请选择业绩归属部门");
					return;
				}
				form.value.sealTypes = sealTypeList.value.join(",");
				form.value.sealMaterial = sealMaterialList.value.join(",");
				form.value.luoboConfirmed = luoboConfirmed.value ? 1 : 0;
				form.value.documents = JSON.stringify(docs.value);
				form.value.opCostTotal = opCostTotal.value;
				onRegDate();
				dialog.value.saving = true;
				try {
					if (form.value.id) yield sealOrderApi.update(form.value);
					else yield sealOrderApi.create(form.value);
					clearDraft();
					ElMessage.success("已保存");
					emit("saved");
					dialog.value.visible = false;
					if (!props.createOnly) loadData();
				} catch (_unused16) {
					ElMessage.error("保存失败");
				} finally {
					dialog.value.saving = false;
				}
			});
			return function submit() {
				return _ref17.apply(this, arguments);
			};
		}();
		const submitAndNext = function() {
			var _ref18 = _asyncToGenerator(function* () {
				if (!form.value.companyName || !form.value.regDate) {
					ElMessage.warning("请填写提单日期和公司名称");
					return;
				}
				if (!form.value.perfDept) {
					ElMessage.warning("请选择业绩归属部门");
					return;
				}
				form.value.sealTypes = sealTypeList.value.join(",");
				form.value.sealMaterial = sealMaterialList.value.join(",");
				form.value.luoboConfirmed = luoboConfirmed.value ? 1 : 0;
				form.value.documents = JSON.stringify(docs.value);
				form.value.opCostTotal = opCostTotal.value;
				onRegDate();
				dialog.value.saving = true;
				try {
					yield sealOrderApi.create(form.value);
					clearDraft();
					emit("saved");
					ElMessage.success("已保存,继续加同对接人的下一个单位");
					form.value = _objectSpread2(_objectSpread2({}, {
						regDate: form.value.regDate,
						perfDept: form.value.perfDept,
						ownerName: form.value.ownerName,
						bizType: form.value.bizType,
						legalPerson: form.value.legalPerson,
						phone: form.value.phone,
						payMethod: form.value.payMethod,
						payAccount: form.value.payAccount
					}), {}, {
						sealCity: "杭州",
						recordStatus: "",
						isMail: 0,
						isRecord: 0,
						isShipped: 0,
						isDelivered: 0,
						handlerIsLegal: 1,
						isWePublish: 0,
						status: "pending",
						fee: 0
					});
					sealTypeList.value = [];
					sealMaterialList.value = [];
					luoboConfirmed.value = false;
					prevSealStatus = "";
					docs.value = {};
					if (!props.createOnly) loadData();
				} catch (_unused17) {
					ElMessage.error("保存失败");
				} finally {
					dialog.value.saving = false;
				}
			});
			return function submitAndNext() {
				return _ref18.apply(this, arguments);
			};
		}();
		const remove = function() {
			var _ref19 = _asyncToGenerator(function* (row) {
				try {
					yield ElMessageBox.confirm(`确定删除「${row.companyName}」的这条提单?`, "删除", { type: "warning" });
				} catch (_unused18) {
					return;
				}
				try {
					yield sealOrderApi.remove(row.id);
					ElMessage.success("已删除");
					loadData();
				} catch (_unused19) {
					ElMessage.error("删除失败");
				}
			});
			return function remove(_x14) {
				return _ref19.apply(this, arguments);
			};
		}();
		const parseDocuments = (s) => {
			if (!s) return {};
			try {
				return JSON.parse(s) || {};
			} catch (_unused20) {
				return {};
			}
		};
		const splitTypes = (s) => s ? s.split(",").filter(Boolean) : [];
		const fmtMaterial = (s) => s ? s.split(",").filter(Boolean).join("、") : "";
		const onRowStatusChange = function() {
			var _ref20 = _asyncToGenerator(function* (row) {
				row._statusSaving = true;
				try {
					yield sealOrderApi.update(row);
					ElMessage.success("状态已更新");
				} catch (_unused21) {
					ElMessage.error("状态更新失败");
					loadData();
				} finally {
					row._statusSaving = false;
				}
			});
			return function onRowStatusChange(_x15) {
				return _ref20.apply(this, arguments);
			};
		}();
		const fmtMoney = (n) => n == null ? "0.00" : Number(n).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		});
		onMounted(() => {
			loadPartners();
			if (props.createOnly) openForm();
			else loadData();
			window.addEventListener("paste", onWindowPaste);
		});
		onBeforeUnmount(() => window.removeEventListener("paste", onWindowPaste));
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_divider = ElDivider;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_alert = ElAlert;
			const _component_el_row = ElRow;
			const _component_el_checkbox_group = ElCheckboxGroup;
			const _component_el_upload = ElUpload;
			const _component_el_switch = ElSwitch;
			const _component_el_input_number = ElInputNumber;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", { class: normalizeClass(["seal-reg", { "seal-reg--embedded": props.embedded }]) }, [
				!props.createOnly ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createBaseVNode("header", _hoisted_1, [!props.embedded ? (openBlock(), createElementBlock("div", _hoisted_2, [..._cache[58] || (_cache[58] = [createBaseVNode("h2", { class: "sr-title" }, "刻章提单登记", -1), createBaseVNode("p", { class: "sr-sub" }, "每天来刻章的客户提单:基本信息、印章状态与材质、收款、备案与配送。", -1)])])) : createCommentVNode("", true), createBaseVNode("div", _hoisted_3, [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
							class: "sr-search",
							placeholder: "搜公司名…",
							clearable: "",
							onKeyup: withKeys(reload, ["enter"]),
							onClear: reload
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: statusFilter.value,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => statusFilter.value = $event),
							placeholder: "状态",
							clearable: "",
							class: "sr-filter",
							onChange: reload
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (s) => {
								return createVNode(_component_el_option, {
									key: s.value,
									label: s.label,
									value: s.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_checkbox, {
							modelValue: invoiceFilter.value,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => invoiceFilter.value = $event),
							border: "",
							onChange: reload
						}, {
							default: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("仅看待开票", -1)])]),
							_: 1
						}, 8, ["modelValue"]),
						!props.embedded ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							loading: qrLoading.value,
							onClick: openQr
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(promotion_default))]),
								_: 1
							}), _cache[60] || (_cache[60] = createTextVNode(" 客户自助码", -1))]),
							_: 1
						}, 8, ["loading"])) : createCommentVNode("", true),
						!props.embedded ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							type: "primary",
							onClick: _cache[3] || (_cache[3] = ($event) => openForm())
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(plus_default))]),
								_: 1
							}), _cache[61] || (_cache[61] = createTextVNode(" 新增提单", -1))]),
							_: 1
						})) : createCommentVNode("", true)
					])]),
					createBaseVNode("div", _hoisted_4, [
						createBaseVNode("div", _hoisted_5, [createBaseVNode("span", _hoisted_6, toDisplayString(stats.value.todayCount), 1), _cache[62] || (_cache[62] = createBaseVNode("span", { class: "sr-stat-label" }, "今日提单", -1))]),
						createBaseVNode("div", _hoisted_7, [createBaseVNode("span", _hoisted_8, toDisplayString(stats.value.monthCount), 1), _cache[63] || (_cache[63] = createBaseVNode("span", { class: "sr-stat-label" }, "本月提单", -1))]),
						createBaseVNode("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, "¥" + toDisplayString(fmtMoney(stats.value.monthFee)), 1), _cache[64] || (_cache[64] = createBaseVNode("span", { class: "sr-stat-label" }, "本月收款", -1))])
					]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: rows.value,
						border: "",
						stripe: ""
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: "今天还没有刻章提单",
							"image-size": 80
						}, {
							default: withCtx(() => [!props.embedded ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								type: "primary",
								onClick: _cache[4] || (_cache[4] = ($event) => openForm())
							}, {
								default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode("新增提单", -1)])]),
								_: 1
							})) : createCommentVNode("", true)]),
							_: 1
						})]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "提单日期",
								prop: "regDate",
								width: "106"
							}),
							createVNode(_component_el_table_column, {
								label: "公司名称",
								prop: "companyName",
								"min-width": "170",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "业绩部门",
								prop: "perfDept",
								width: "96"
							}),
							createVNode(_component_el_table_column, {
								label: "印章状态",
								prop: "sealStatus",
								width: "96"
							}),
							createVNode(_component_el_table_column, {
								label: "备案状态",
								prop: "recordStatus",
								width: "96"
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.recordStatus || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "材质/类型",
								"min-width": "150"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(fmtMaterial(row.sealMaterial)), 1), (openBlock(true), createElementBlock(Fragment, null, renderList(splitTypes(row.sealTypes), (t) => {
									return openBlock(), createBlock(_component_el_tag, {
										key: t,
										size: "small",
										effect: "plain",
										style: { "margin": "2px" }
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(t), 1)]),
										_: 2
									}, 1024);
								}), 128))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "应刻法人章姓名",
								prop: "legalPerson",
								width: "120",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "快递单号",
								prop: "trackingNo",
								width: "140",
								"show-overflow-tooltip": ""
							}, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.trackingNo || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "城市",
								prop: "sealCity",
								width: "72"
							}),
							createVNode(_component_el_table_column, {
								label: "收费",
								width: "84",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(fmtMoney(row.fee)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "收款方式",
								prop: "payMethod",
								width: "120",
								"show-overflow-tooltip": ""
							}),
							createVNode(_component_el_table_column, {
								label: "备案/寄出/交付",
								width: "130",
								align: "center"
							}, {
								default: withCtx(({ row }) => [
									createVNode(_component_el_tag, {
										size: "small",
										type: row.isRecord ? "success" : "info",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode("备" + toDisplayString(row.isRecord ? "✓" : "—"), 1)]),
										_: 2
									}, 1032, ["type"]),
									createVNode(_component_el_tag, {
										size: "small",
										type: row.isShipped ? "success" : "info",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode("寄" + toDisplayString(row.isShipped ? "✓" : "—"), 1)]),
										_: 2
									}, 1032, ["type"]),
									createVNode(_component_el_tag, {
										size: "small",
										type: row.isDelivered ? "success" : "info",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode("付" + toDisplayString(row.isDelivered ? "✓" : "—"), 1)]),
										_: 2
									}, 1032, ["type"])
								]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_select, {
									modelValue: row.status,
									"onUpdate:modelValue": ($event) => row.status = $event,
									size: "small",
									disabled: row._statusSaving,
									onChange: ($event) => onRowStatusChange(row)
								}, {
									default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (s) => {
										return createVNode(_component_el_option, {
											key: s.value,
											label: s.label,
											value: s.value
										}, null, 8, ["label", "value"]);
									}), 64))]),
									_: 1
								}, 8, [
									"modelValue",
									"onUpdate:modelValue",
									"disabled",
									"onChange"
								])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "120",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "primary",
									onClick: ($event) => openForm(row)
								}, {
									default: withCtx(() => [..._cache[65] || (_cache[65] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"]), createVNode(_component_el_button, {
									size: "small",
									link: "",
									type: "danger",
									onClick: ($event) => remove(row)
								}, {
									default: withCtx(() => [..._cache[66] || (_cache[66] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_11, [createVNode(_component_el_pagination, {
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
					])])
				], 64)) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: dialog.value.visible,
					"onUpdate:modelValue": _cache[54] || (_cache[54] = ($event) => dialog.value.visible = $event),
					title: form.value.id ? "编辑刻章提单" : "新增刻章提单",
					width: "720px",
					"destroy-on-close": "",
					top: "5vh",
					"close-on-click-modal": false,
					onClosed: onDialogClosed
				}, {
					footer: withCtx(() => [
						createVNode(_component_el_button, { onClick: _cache[53] || (_cache[53] = ($event) => dialog.value.visible = false) }, {
							default: withCtx(() => [..._cache[118] || (_cache[118] = [createTextVNode("取消", -1)])]),
							_: 1
						}),
						!form.value.id ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							loading: dialog.value.saving,
							onClick: submitAndNext
						}, {
							default: withCtx(() => [..._cache[119] || (_cache[119] = [createTextVNode("保存并加下一单位", -1)])]),
							_: 1
						}, 8, ["loading"])) : createCommentVNode("", true),
						createVNode(_component_el_button, {
							type: "primary",
							loading: dialog.value.saving,
							onClick: submit
						}, {
							default: withCtx(() => [..._cache[120] || (_cache[120] = [createTextVNode("保存", -1)])]),
							_: 1
						}, 8, ["loading"])
					]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: form.value,
						"label-width": "116px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("基本信息", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "提单日期",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.value.regDate,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.value.regDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												"disabled-date": disabledBeforeToday,
												placeholder: "默认今天",
												style: { "width": "100%" },
												onChange: onRegDate
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "年/月" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												"model-value": yearMonthText.value,
												disabled: ""
											}, null, 8, ["model-value"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "业绩归属部门",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.perfDept,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form.value.perfDept = $event),
												placeholder: "选择部门",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(PERF_DEPTS, (d) => {
													return createVNode(_component_el_option, {
														key: d,
														label: d,
														value: d
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "业务归属人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.ownerName,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form.value.ownerName = $event),
												placeholder: "默认提交人"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 16 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "业务类型" }, {
											default: withCtx(() => [createVNode(_component_el_radio_group, {
												modelValue: form.value.bizType,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.value.bizType = $event),
												onChange: onBizType
											}, {
												default: withCtx(() => [createVNode(_component_el_radio_button, { value: "new" }, {
													default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("新客户", -1)])]),
													_: 1
												}), createVNode(_component_el_radio_button, { value: "old" }, {
													default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("老客户(长期合作)", -1)])]),
													_: 1
												})]),
												_: 1
											}, 8, ["modelValue"]), form.value.bizType === "old" ? (openBlock(), createBlock(_component_el_select, {
												key: 0,
												modelValue: form.value.partnerId,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.value.partnerId = $event),
												filterable: "",
												placeholder: "从长期合作客户选",
												style: {
													"width": "240px",
													"margin-left": "12px"
												},
												onChange: onPickPartner
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(partners.value, (p) => {
													return openBlock(), createBlock(_component_el_option, {
														key: p.id,
														label: p.companyName,
														value: p.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])) : createCommentVNode("", true)]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "公司名称",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.companyName,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.value.companyName = $event),
												placeholder: "刻章单位公司全称(含中文括号也要写进去,如:杭州XX(个体工商户))"
											}, null, 8, ["modelValue"]), dupWarning.value ? (openBlock(), createBlock(_component_el_alert, {
												key: 0,
												type: "warning",
												closable: false,
												"show-icon": "",
												title: dupWarning.value,
												style: { "margin-top": "6px" }
											}, null, 8, ["title"])) : createCommentVNode("", true)]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "法人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.legalPerson,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.value.legalPerson = $event),
												placeholder: "法定代表人"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系电话" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.phone,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.value.phone = $event),
												placeholder: "对接人手机号"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[71] || (_cache[71] = [createTextVNode("印章信息", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "印章状态",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.sealStatus,
												"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.value.sealStatus = $event),
												placeholder: "选择",
												style: { "width": "100%" },
												onChange: onSealStatus
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SEAL_STATUSES, (s) => {
													return createVNode(_component_el_option, {
														key: s,
														label: s,
														value: s
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"]), luoboConfirmed.value ? (openBlock(), createBlock(_component_el_tag, {
												key: 0,
												type: "danger",
												effect: "dark",
												size: "small",
												style: { "margin-top": "6px" }
											}, {
												default: withCtx(() => [..._cache[72] || (_cache[72] = [createTextVNode("⚠ 已确认萝卜章(私下刻制)", -1)])]),
												_: 1
											})) : createCommentVNode("", true)]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "备案状态" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.recordStatus,
												"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.value.recordStatus = $event),
												placeholder: "选择",
												clearable: "",
												style: { "width": "100%" },
												onChange: onRecordStatus
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(RECORD_STATUSES, (s) => {
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
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "刻章城市" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.sealCity,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.value.sealCity = $event),
												placeholder: "选择城市",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(SEAL_CITIES, (c) => {
													return createVNode(_component_el_option, {
														key: c,
														label: c,
														value: c
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "印章材质" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: sealMaterialList.value,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => sealMaterialList.value = $event),
												multiple: "",
												placeholder: "可多选(公财法一起刻)",
												style: { "width": "100%" },
												onChange: onMaterial
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(MATERIALS, (m) => {
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
									form.value.sealCity && form.value.sealCity !== "杭州" ? (openBlock(), createBlock(_component_el_col, {
										key: 0,
										span: 24
									}, {
										default: withCtx(() => [createVNode(_component_el_alert, {
											type: "warning",
											closable: false,
											"show-icon": "",
											title: "刻章区域为杭州以外:加收 80 元/个,且必须提交法人靠白墙半身照。",
											style: { "margin-bottom": "12px" }
										})]),
										_: 1
									})) : createCommentVNode("", true),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "印章类型" }, {
											default: withCtx(() => [sealMaterialList.value.length ? (openBlock(), createElementBlock("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(materialTypeGroups.value, (g) => {
												return openBlock(), createElementBlock("div", {
													key: g.material,
													class: "sr-type-group"
												}, [createBaseVNode("span", _hoisted_13, toDisplayString(g.material), 1), createVNode(_component_el_checkbox_group, {
													modelValue: sealTypeList.value,
													"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => sealTypeList.value = $event),
													class: "sr-type-checks"
												}, {
													default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(g.combos, (c) => {
														return openBlock(), createBlock(_component_el_checkbox, {
															key: c.value,
															value: c.value,
															border: ""
														}, {
															default: withCtx(() => [createTextVNode(toDisplayString(c.type), 1)]),
															_: 2
														}, 1032, ["value"]);
													}), 128))]),
													_: 2
												}, 1032, ["modelValue"])]);
											}), 128))])) : createCommentVNode("", true), sealMaterialList.value.length ? (openBlock(), createElementBlock("span", _hoisted_14, "已按\"材质-类型\"记录(如 光敏-法定名称章);取消某个材质,它名下的类型会自动取消。法定名称章=公章,法定代表人名章=法人章,某某专用章=业务专用章(备注说明)。")) : (openBlock(), createElementBlock("span", _hoisted_15, "先选印章材质,再勾选对应的印章类型"))]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "身份证" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_16, [
												createVNode(_component_el_upload, {
													"show-file-list": false,
													"http-request": (o) => uploadId("front", o),
													accept: SEAL_UPLOAD_ACCEPT
												}, {
													default: withCtx(() => [createVNode(_component_el_button, null, {
														default: withCtx(() => [createTextVNode(toDisplayString(form.value.idCardFront ? "正面 已上传 ✓" : "上传正面"), 1)]),
														_: 1
													})]),
													_: 1
												}, 8, ["http-request"]),
												form.value.idCardFront ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
													createVNode(_component_el_button, {
														size: "small",
														link: "",
														type: "primary",
														onClick: _cache[20] || (_cache[20] = ($event) => previewAttachment(simpleFile(form.value.idCardFront, "身份证正面")))
													}, {
														default: withCtx(() => [createVNode(_component_el_icon, null, {
															default: withCtx(() => [createVNode(unref(view_default))]),
															_: 1
														}), _cache[73] || (_cache[73] = createTextVNode("预览正面", -1))]),
														_: 1
													}),
													createVNode(_component_el_button, {
														size: "small",
														link: "",
														onClick: _cache[21] || (_cache[21] = ($event) => downloadFile(simpleFile(form.value.idCardFront, "身份证正面")))
													}, {
														default: withCtx(() => [createVNode(_component_el_icon, null, {
															default: withCtx(() => [createVNode(unref(download_default))]),
															_: 1
														}), _cache[74] || (_cache[74] = createTextVNode("下载正面", -1))]),
														_: 1
													}),
													createVNode(_component_el_button, {
														size: "small",
														type: "danger",
														link: "",
														onClick: _cache[22] || (_cache[22] = ($event) => removeId("front"))
													}, {
														default: withCtx(() => [..._cache[75] || (_cache[75] = [createTextVNode("删除正面", -1)])]),
														_: 1
													})
												], 64)) : createCommentVNode("", true),
												createVNode(_component_el_upload, {
													"show-file-list": false,
													"http-request": (o) => uploadId("back", o),
													accept: SEAL_UPLOAD_ACCEPT
												}, {
													default: withCtx(() => [createVNode(_component_el_button, null, {
														default: withCtx(() => [createTextVNode(toDisplayString(form.value.idCardBack ? "反面 已上传 ✓" : "上传反面"), 1)]),
														_: 1
													})]),
													_: 1
												}, 8, ["http-request"]),
												form.value.idCardBack ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
													createVNode(_component_el_button, {
														size: "small",
														link: "",
														type: "primary",
														onClick: _cache[23] || (_cache[23] = ($event) => previewAttachment(simpleFile(form.value.idCardBack, "身份证反面")))
													}, {
														default: withCtx(() => [createVNode(_component_el_icon, null, {
															default: withCtx(() => [createVNode(unref(view_default))]),
															_: 1
														}), _cache[76] || (_cache[76] = createTextVNode("预览反面", -1))]),
														_: 1
													}),
													createVNode(_component_el_button, {
														size: "small",
														link: "",
														onClick: _cache[24] || (_cache[24] = ($event) => downloadFile(simpleFile(form.value.idCardBack, "身份证反面")))
													}, {
														default: withCtx(() => [createVNode(_component_el_icon, null, {
															default: withCtx(() => [createVNode(unref(download_default))]),
															_: 1
														}), _cache[77] || (_cache[77] = createTextVNode("下载反面", -1))]),
														_: 1
													}),
													createVNode(_component_el_button, {
														size: "small",
														type: "danger",
														link: "",
														onClick: _cache[25] || (_cache[25] = ($event) => removeId("back"))
													}, {
														default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("删除反面", -1)])]),
														_: 1
													})
												], 64)) : createCommentVNode("", true),
												_cache[79] || (_cache[79] = createBaseVNode("span", { class: "sr-hint" }, "仅支持 JPG/JPEG 图片或 PDF。PNG 请先另存为 JPG 后上传。", -1))
											])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[80] || (_cache[80] = [createTextVNode("办理资料", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "办理人" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.handlerIsLegal,
												"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => form.value.handlerIsLegal = $event),
												"active-value": 1,
												"inactive-value": 0,
												"active-text": "法人本人",
												"inactive-text": "非法人",
												"inline-prompt": ""
											}, null, 8, ["modelValue"]), form.value.handlerIsLegal === 0 ? (openBlock(), createElementBlock("span", _hoisted_17, "非法人需加传:经办人身份证、经办人半身照、授权委托说明")) : createCommentVNode("", true)]),
											_: 1
										})]),
										_: 1
									}),
									form.value.sealStatus === "遗失登报" ? (openBlock(), createBlock(_component_el_col, {
										key: 0,
										span: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否我们登报" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.isWePublish,
												"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => form.value.isWePublish = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})) : createCommentVNode("", true),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [
											createVNode(_component_el_form_item, { label: "资料上传" }, {
												default: withCtx(() => [
													createBaseVNode("div", _hoisted_18, [(openBlock(true), createElementBlock(Fragment, null, renderList(docSlots.value, (d) => {
														return openBlock(), createElementBlock("div", {
															key: d.key,
															class: "sr-doc-slot"
														}, [createVNode(_component_el_upload, {
															"show-file-list": false,
															"http-request": (o) => uploadDoc(d.key, o),
															accept: SEAL_UPLOAD_ACCEPT
														}, {
															default: withCtx(() => [createVNode(_component_el_button, {
																size: "small",
																plain: "",
																type: docs.value[d.key] ? "success" : d.required ? "warning" : "info"
															}, {
																default: withCtx(() => [createTextVNode(toDisplayString(docs.value[d.key] ? "✓ " : d.required ? "※ " : "") + toDisplayString(d.label), 1)]),
																_: 2
															}, 1032, ["type"])]),
															_: 2
														}, 1032, ["http-request"]), docs.value[d.key] ? (openBlock(), createElementBlock("div", _hoisted_19, [
															createBaseVNode("button", {
																type: "button",
																class: "sr-file-name",
																onClick: ($event) => previewAttachment(docs.value[d.key])
															}, toDisplayString(docs.value[d.key].fileName), 9, _hoisted_20),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "primary",
																onClick: ($event) => previewAttachment(docs.value[d.key])
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(view_default))]),
																	_: 1
																}), _cache[81] || (_cache[81] = createTextVNode("预览", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																onClick: ($event) => downloadFile(docs.value[d.key])
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(download_default))]),
																	_: 1
																}), _cache[82] || (_cache[82] = createTextVNode("下载", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "danger",
																onClick: ($event) => removeDoc(d.key)
															}, {
																default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("删除", -1)])]),
																_: 1
															}, 8, ["onClick"])
														])) : createCommentVNode("", true)]);
													}), 128))]),
													_cache[88] || (_cache[88] = createBaseVNode("span", { class: "sr-hint" }, "标 ※ 为必传;仅支持 JPG/JPEG 图片或 PDF。资料随印章状态、是否外区域、是否法人本人自动变化。", -1)),
													pastedDocs.value.length ? (openBlock(), createElementBlock("div", _hoisted_21, [_cache[87] || (_cache[87] = createBaseVNode("span", {
														class: "sr-hint",
														style: { "margin": "0" }
													}, "粘贴的附件:", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(pastedDocs.value, (d) => {
														return openBlock(), createElementBlock("div", {
															key: d.key,
															class: "sr-file-chip"
														}, [
															createBaseVNode("button", {
																type: "button",
																class: "sr-file-name",
																onClick: ($event) => previewAttachment(d)
															}, toDisplayString(d.fileName), 9, _hoisted_22),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "primary",
																onClick: ($event) => previewAttachment(d)
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(view_default))]),
																	_: 1
																}), _cache[84] || (_cache[84] = createTextVNode("预览", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																onClick: ($event) => downloadFile(d)
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(download_default))]),
																	_: 1
																}), _cache[85] || (_cache[85] = createTextVNode("下载", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "danger",
																onClick: ($event) => removeDoc(d.key)
															}, {
																default: withCtx(() => [..._cache[86] || (_cache[86] = [createTextVNode("删除", -1)])]),
																_: 1
															}, 8, ["onClick"])
														]);
													}), 128))])) : createCommentVNode("", true),
													_cache[89] || (_cache[89] = createBaseVNode("span", { class: "sr-hint" }, "📋 可粘贴 JPG/JPEG 图片;PNG 截图请先转换成 JPG,PDF 请点击上传。", -1))
												]),
												_: 1
											}),
											createVNode(_component_el_form_item, { label: "其他资料" }, {
												default: withCtx(() => [
													createVNode(_component_el_upload, {
														"show-file-list": false,
														"http-request": (o) => uploadOther(o),
														accept: SEAL_UPLOAD_ACCEPT,
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
															}), _cache[90] || (_cache[90] = createTextVNode(" 上传其他资料(可多张)", -1))]),
															_: 1
														})]),
														_: 1
													}, 8, ["http-request"]),
													otherDocs.value.length ? (openBlock(), createElementBlock("div", _hoisted_23, [(openBlock(true), createElementBlock(Fragment, null, renderList(otherDocs.value, (d) => {
														return openBlock(), createElementBlock("div", {
															key: d.key,
															class: "sr-file-chip"
														}, [
															createBaseVNode("button", {
																type: "button",
																class: "sr-file-name",
																onClick: ($event) => previewAttachment(d)
															}, toDisplayString(d.fileName), 9, _hoisted_24),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "primary",
																onClick: ($event) => previewAttachment(d)
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(view_default))]),
																	_: 1
																}), _cache[91] || (_cache[91] = createTextVNode("预览", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																onClick: ($event) => downloadFile(d)
															}, {
																default: withCtx(() => [createVNode(_component_el_icon, null, {
																	default: withCtx(() => [createVNode(unref(download_default))]),
																	_: 1
																}), _cache[92] || (_cache[92] = createTextVNode("下载", -1))]),
																_: 1
															}, 8, ["onClick"]),
															createVNode(_component_el_button, {
																size: "small",
																link: "",
																type: "danger",
																onClick: ($event) => removeDoc(d.key)
															}, {
																default: withCtx(() => [..._cache[93] || (_cache[93] = [createTextVNode("删除", -1)])]),
																_: 1
															}, 8, ["onClick"])
														]);
													}), 128))])) : createCommentVNode("", true),
													_cache[94] || (_cache[94] = createBaseVNode("span", { class: "sr-hint" }, "任何印章状态都可用的备用资料位:补充说明、承诺书、其他辅助材料等。", -1))
												]),
												_: 1
											}),
											relevantTemplates.value.length ? (openBlock(), createBlock(_component_el_form_item, {
												key: 0,
												label: "申请模板"
											}, {
												default: withCtx(() => [createBaseVNode("div", _hoisted_25, [(openBlock(true), createElementBlock(Fragment, null, renderList(relevantTemplates.value, (t) => {
													return openBlock(), createElementBlock("a", {
														key: t.file,
														href: t.url,
														download: t.name + ".docx",
														class: "sr-tpl-link"
													}, [createVNode(_component_el_button, {
														size: "small",
														type: "primary",
														plain: ""
													}, {
														default: withCtx(() => [createVNode(_component_el_icon, null, {
															default: withCtx(() => [createVNode(unref(download_default))]),
															_: 1
														}), createTextVNode(" " + toDisplayString(t.name), 1)]),
														_: 2
													}, 1024)], 8, _hoisted_26);
												}), 128))]), _cache[95] || (_cache[95] = createBaseVNode("span", { class: "sr-hint" }, "按当前印章状态/办理人匹配的申请模板,点击下载填写盖章。", -1))]),
												_: 1
											})) : createCommentVNode("", true)
										]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[96] || (_cache[96] = [createTextVNode("收款", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收费金额" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.fee,
												"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => form.value.fee = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"]), _cache[97] || (_cache[97] = createBaseVNode("span", { class: "sr-hint" }, "参考售价:公章/合同章 80 元/个,法人章 40 元/个", -1))]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款方式" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.payMethod,
												"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => form.value.payMethod = $event),
												filterable: "",
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
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款日期" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.value.payDate,
												"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => form.value.payDate = $event),
												type: "date",
												"value-format": "YYYY-MM-DD",
												placeholder: "具体收款日期",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收款凭证" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_27, [createVNode(_component_el_upload, {
												"show-file-list": false,
												"http-request": (o) => uploadPayVoucher(o),
												accept: SEAL_UPLOAD_ACCEPT
											}, {
												default: withCtx(() => [createVNode(_component_el_button, { type: docs.value["payVoucher"] ? "success" : "default" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(docs.value["payVoucher"] ? "已上传 ✓ 可重传" : "上传收款凭证"), 1)]),
													_: 1
												}, 8, ["type"])]),
												_: 1
											}, 8, ["http-request"]), docs.value["payVoucher"] ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													type: "primary",
													onClick: _cache[31] || (_cache[31] = ($event) => previewAttachment(docs.value["payVoucher"]))
												}, {
													default: withCtx(() => [createVNode(_component_el_icon, null, {
														default: withCtx(() => [createVNode(unref(view_default))]),
														_: 1
													}), _cache[98] || (_cache[98] = createTextVNode("预览", -1))]),
													_: 1
												}),
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													onClick: _cache[32] || (_cache[32] = ($event) => downloadFile(docs.value["payVoucher"]))
												}, {
													default: withCtx(() => [createVNode(_component_el_icon, null, {
														default: withCtx(() => [createVNode(unref(download_default))]),
														_: 1
													}), _cache[99] || (_cache[99] = createTextVNode("下载", -1))]),
													_: 1
												}),
												createVNode(_component_el_button, {
													size: "small",
													type: "danger",
													link: "",
													onClick: _cache[33] || (_cache[33] = ($event) => removeDoc("payVoucher"))
												}, {
													default: withCtx(() => [..._cache[100] || (_cache[100] = [createTextVNode("删除", -1)])]),
													_: 1
												})
											], 64)) : createCommentVNode("", true)]), _cache[101] || (_cache[101] = createBaseVNode("span", { class: "sr-hint" }, "收款截图/转账凭证等,存入本单资料。", -1))]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "支付宝收款码" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_28, [createVNode(_component_el_upload, {
												"show-file-list": false,
												"http-request": (o) => uploadAlipayQr(o),
												accept: SEAL_UPLOAD_ACCEPT
											}, {
												default: withCtx(() => [createVNode(_component_el_button, { type: form.value.customerAlipayQr ? "success" : "default" }, {
													default: withCtx(() => [createTextVNode(toDisplayString(form.value.customerAlipayQr ? "已上传 ✓ 可重传" : "上传客户支付宝收款码"), 1)]),
													_: 1
												}, 8, ["type"])]),
												_: 1
											}, 8, ["http-request"]), form.value.customerAlipayQr ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													type: "primary",
													onClick: _cache[34] || (_cache[34] = ($event) => previewAttachment(simpleFile(form.value.customerAlipayQr, "客户支付宝收款码")))
												}, {
													default: withCtx(() => [createVNode(_component_el_icon, null, {
														default: withCtx(() => [createVNode(unref(view_default))]),
														_: 1
													}), _cache[102] || (_cache[102] = createTextVNode("预览", -1))]),
													_: 1
												}),
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													onClick: _cache[35] || (_cache[35] = ($event) => downloadFile(simpleFile(form.value.customerAlipayQr, "客户支付宝收款码")))
												}, {
													default: withCtx(() => [createVNode(_component_el_icon, null, {
														default: withCtx(() => [createVNode(unref(download_default))]),
														_: 1
													}), _cache[103] || (_cache[103] = createTextVNode("下载", -1))]),
													_: 1
												}),
												createVNode(_component_el_button, {
													size: "small",
													type: "danger",
													link: "",
													onClick: removeAlipayQr
												}, {
													default: withCtx(() => [..._cache[104] || (_cache[104] = [createTextVNode("删除", -1)])]),
													_: 1
												})
											], 64)) : createCommentVNode("", true)]), _cache[105] || (_cache[105] = createBaseVNode("span", { class: "sr-hint" }, "客户的支付宝收款二维码,退款/返点给客户打款时使用。仅支持 JPG/JPEG 或 PDF。", -1))]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[106] || (_cache[106] = [createTextVNode("备案与配送", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否备案" }, {
											default: withCtx(() => [
												createVNode(_component_el_switch, {
													modelValue: form.value.isRecord,
													"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => form.value.isRecord = $event),
													"active-value": 1,
													"inactive-value": 0
												}, null, 8, ["modelValue"]),
												_cache[108] || (_cache[108] = createTextVNode()),
												createVNode(_component_el_button, {
													size: "small",
													link: "",
													type: "primary",
													onClick: openRecordQuery
												}, {
													default: withCtx(() => [..._cache[107] || (_cache[107] = [createTextVNode("查浙江省印章备案↗", -1)])]),
													_: 1
												})
											]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否寄出" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.isShipped,
												"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => form.value.isShipped = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									form.value.isShipped ? (openBlock(), createBlock(_component_el_col, {
										key: 0,
										span: 12
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "快递单号" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.trackingNo,
												"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => form.value.trackingNo = $event),
												placeholder: "快递单号"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})) : createCommentVNode("", true),
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否交付" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.isDelivered,
												"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => form.value.isDelivered = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否邮寄" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.isMail,
												"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => form.value.isMail = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									form.value.isMail ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.recipient,
												"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => form.value.recipient = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "收件地址" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.address,
												"onUpdate:modelValue": _cache[42] || (_cache[42] = ($event) => form.value.address = $event),
												type: "textarea",
												rows: 2
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})], 64)) : createCommentVNode("", true)
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[109] || (_cache[109] = [createTextVNode("运营成本(自动估算)", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "快递类型" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.value.deliveryType,
												"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => form.value.deliveryType = $event),
												placeholder: "选择",
												clearable: "",
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(DELIVERY_TYPES, (d) => {
													return createVNode(_component_el_option, {
														key: d,
														label: d,
														value: d
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "登报费用" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.publishFee,
												"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => form.value.publishFee = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "印章个数" }, {
											default: withCtx(() => [createTextVNode(toDisplayString(sealCount.value) + " 个", 1)]),
											_: 1
										})]),
										_: 1
									}),
									form.value.sealCity && form.value.sealCity !== "杭州" ? (openBlock(), createBlock(_component_el_col, {
										key: 0,
										span: 8
									}, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "外区域备案费" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.outRegionFee,
												"onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => form.value.outRegionFee = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												placeholder: "默认25/个",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"]), _cache[110] || (_cache[110] = createBaseVNode("span", { class: "sr-hint" }, "默认按 25 元/个估算,可手动改成实际成本", -1))]),
											_: 1
										})]),
										_: 1
									})) : createCommentVNode("", true),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_29, [
											createBaseVNode("span", null, [_cache[111] || (_cache[111] = createTextVNode("外区域备案费 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(outRegionFee.value)), 1)]),
											createBaseVNode("span", null, [_cache[112] || (_cache[112] = createTextVNode("快递费 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(deliveryFee.value)), 1)]),
											createBaseVNode("span", null, [_cache[113] || (_cache[113] = createTextVNode("印章消耗 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(materialCost.value)), 1)]),
											createBaseVNode("span", null, [_cache[114] || (_cache[114] = createTextVNode("登报费 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(Number(form.value.publishFee || 0))), 1)]),
											createBaseVNode("span", _hoisted_30, [_cache[115] || (_cache[115] = createTextVNode("运营成本合计 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(fmtMoney(opCostTotal.value)), 1)])
										])]),
										_: 1
									})
								]),
								_: 1
							}),
							createVNode(_component_el_divider, { "content-position": "left" }, {
								default: withCtx(() => [..._cache[116] || (_cache[116] = [createTextVNode("发票与业务支出", -1)])]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否开票" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.needInvoice,
												"onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => form.value.needInvoice = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									form.value.needInvoice ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "开票信息" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.value.invoiceInfo,
												"onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => form.value.invoiceInfo = $event),
												placeholder: "抬头/税号/开票内容"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}), createVNode(_component_el_col, { span: 6 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "开票已完成" }, {
											default: withCtx(() => [createVNode(_component_el_switch, {
												modelValue: form.value.invoiceDone,
												"onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => form.value.invoiceDone = $event),
												"active-value": 1,
												"inactive-value": 0
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})], 64)) : createCommentVNode("", true),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "返点成本" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.rebateCost,
												"onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => form.value.rebateCost = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "刻章退款" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.value.refundAmount,
												"onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => form.value.refundAmount = $event),
												min: 0,
												precision: 2,
												"controls-position": "right",
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									form.value.needInvoice && !form.value.invoiceDone ? (openBlock(), createBlock(_component_el_col, {
										key: 1,
										span: 24
									}, {
										default: withCtx(() => [..._cache[117] || (_cache[117] = [createBaseVNode("span", { class: "sr-hint" }, "勾了\"需开票\"保存后,会给会计生成一条「刻章待开票」站内待办;也可在列表上方「仅看待开票」筛选。", -1)])]),
										_: 1
									})) : createCommentVNode("", true)
								]),
								_: 1
							}),
							createVNode(_component_el_row, { gutter: 14 }, {
								default: withCtx(() => [createVNode(_component_el_col, { span: 8 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "状态" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: form.value.status,
											"onUpdate:modelValue": _cache[51] || (_cache[51] = ($event) => form.value.status = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusOptions, (s) => {
												return createVNode(_component_el_option, {
													key: s.value,
													label: s.label,
													value: s.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								}), createVNode(_component_el_col, { span: 16 }, {
									default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: form.value.remark,
											"onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => form.value.remark = $event),
											placeholder: "可选"
										}, null, 8, ["modelValue"])]),
										_: 1
									})]),
									_: 1
								})]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: filePreview.value.visible,
					"onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => filePreview.value.visible = $event),
					title: filePreview.value.title,
					width: "72vw",
					"destroy-on-close": "",
					"append-to-body": "",
					onClosed: clearPreview
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_31, [filePreview.value.type === "image" ? (openBlock(), createElementBlock("img", {
						key: 0,
						src: filePreview.value.url,
						alt: "附件预览",
						class: "sr-preview-img"
					}, null, 8, _hoisted_32)) : filePreview.value.type === "pdf" ? (openBlock(), createElementBlock("iframe", {
						key: 1,
						src: filePreview.value.url,
						class: "sr-preview-frame",
						title: "附件预览"
					}, null, 8, _hoisted_33)) : (openBlock(), createBlock(_component_el_empty, {
						key: 2,
						description: "这个格式不能在线预览，可下载后查看"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: _cache[55] || (_cache[55] = ($event) => filePreview.value.file && downloadFile(filePreview.value.file))
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(download_default))]),
								_: 1
							}), _cache[121] || (_cache[121] = createTextVNode(" 下载附件", -1))]),
							_: 1
						})]),
						_: 1
					}))])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: qrVisible.value,
					"onUpdate:modelValue": _cache[57] || (_cache[57] = ($event) => qrVisible.value = $event),
					title: "客户自助提交二维码",
					width: "380px"
				}, {
					default: withCtx(() => [createBaseVNode("div", _hoisted_34, [
						qrDataUrl.value ? (openBlock(), createElementBlock("img", {
							key: 0,
							src: qrDataUrl.value,
							alt: "刻章客户自助二维码",
							style: {
								"width": "280px",
								"height": "280px"
							}
						}, null, 8, _hoisted_35)) : createCommentVNode("", true),
						_cache[124] || (_cache[124] = createBaseVNode("p", { style: {
							"margin": "12px 0 6px",
							"color": "var(--el-text-color-secondary)",
							"font-size": "13px"
						} }, "客户扫码后可免登录填写一份刻章资料；安全链接绑定当前公司，提交成功后立即失效", -1)),
						selfServiceExpiresText.value ? (openBlock(), createElementBlock("p", _hoisted_36, "有效期至 " + toDisplayString(selfServiceExpiresText.value) + "，过期后请重新生成", 1)) : createCommentVNode("", true),
						createVNode(_component_el_input, {
							"model-value": selfServiceUrl.value,
							readonly: "",
							size: "small",
							style: { "margin-bottom": "10px" }
						}, {
							append: withCtx(() => [createVNode(_component_el_button, { onClick: copySelfUrl }, {
								default: withCtx(() => [..._cache[122] || (_cache[122] = [createTextVNode("复制链接", -1)])]),
								_: 1
							})]),
							_: 1
						}, 8, ["model-value"]),
						createVNode(_component_el_button, {
							type: "primary",
							onClick: downloadQr
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(download_default))]),
								_: 1
							}), _cache[123] || (_cache[123] = createTextVNode(" 下载二维码(可打印/发群)", -1))]),
							_: 1
						})
					])]),
					_: 1
				}, 8, ["modelValue"])
			], 2);
		};
	}
});
//#endregion
//#region src/views/seal/registration.vue
var registration_exports = /* @__PURE__ */ __exportAll({ default: () => registration_default });
var registration_default = /* @__PURE__ */ _plugin_vue_export_helper_default(registration_vue_vue_type_script_setup_true_lang_default, [["__scopeId", "data-v-947ca159"]]);
//#endregion
export { registration_exports as n, registration_default as t };

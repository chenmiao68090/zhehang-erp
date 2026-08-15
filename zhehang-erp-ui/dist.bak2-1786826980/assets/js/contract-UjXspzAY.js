import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, kn as normalizeClass, kt as resolveComponent, rt as createStaticVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { D as ElPagination, M as ElInputNumber, Q as ElRadioGroup, V as ElDialog, W as ElDatePicker, Z as ElRadioButton, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, v as ElSwitch, vt as ElAlert, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as orderApi } from "./order-BHZ2ZADL.js";
import { t as BusinessDetailDrawer_default } from "./BusinessDetailDrawer-t9PlYR5q.js";
import { t as contractMgmtApi } from "./contract-mgmt-Dk4ZOG47.js";
//#region src/views/order/contract.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "contract-mgmt" };
var _hoisted_2 = { class: "page-header" };
var _hoisted_3 = { class: "header-meta" };
var _hoisted_4 = { class: "meta-time" };
var _hoisted_5 = { class: "header-actions" };
var _hoisted_6 = { class: "stat-strip" };
var _hoisted_7 = { class: "stat-cell s-active" };
var _hoisted_8 = { class: "cell-num" };
var _hoisted_9 = { class: "stat-cell s-warn" };
var _hoisted_10 = { class: "cell-num" };
var _hoisted_11 = { class: "stat-cell s-pending" };
var _hoisted_12 = { class: "cell-num" };
var _hoisted_13 = { class: "stat-cell s-renew" };
var _hoisted_14 = { class: "cell-num" };
var _hoisted_15 = { class: "stat-cell s-term" };
var _hoisted_16 = { class: "cell-num" };
var _hoisted_17 = {
	key: 0,
	class: "panel stage-panel"
};
var _hoisted_18 = {
	key: 0,
	class: "empty-cell"
};
var _hoisted_19 = {
	key: 1,
	class: "stage-list"
};
var _hoisted_20 = { class: "si-head" };
var _hoisted_21 = { class: "si-meta" };
var _hoisted_22 = { class: "si-no mono" };
var _hoisted_23 = { class: "si-cust" };
var _hoisted_24 = { class: "si-tpl" };
var _hoisted_25 = { class: "si-end" };
var _hoisted_26 = { class: "si-end-v mono" };
var _hoisted_27 = { class: "stage-track" };
var _hoisted_28 = { class: "sc-day" };
var _hoisted_29 = { class: "sc-action" };
var _hoisted_30 = { class: "sc-target" };
var _hoisted_31 = { class: "sc-status" };
var _hoisted_32 = {
	key: 0,
	class: "sc-handler"
};
var _hoisted_33 = {
	key: 1,
	class: "sc-note"
};
var _hoisted_34 = { class: "panel" };
var _hoisted_35 = { class: "panel-head" };
var _hoisted_36 = { class: "ph-right" };
var _hoisted_37 = { class: "mono" };
var _hoisted_38 = { class: "cust-name" };
var _hoisted_39 = { class: "muted-line" };
var _hoisted_40 = { class: "amount" };
var _hoisted_41 = { class: "sign-way" };
var _hoisted_42 = { class: "pager-wrap" };
var _hoisted_43 = { class: "panel timeline-panel" };
var _hoisted_44 = { class: "timeline-track" };
var _hoisted_45 = { class: "tl-day" };
var _hoisted_46 = { class: "tl-title" };
var _hoisted_47 = { class: "tl-desc" };
var _hoisted_48 = { class: "contract-amount-pill" };
var _hoisted_49 = { class: "bd-kv-grid" };
var _hoisted_50 = { class: "bd-kv" };
var _hoisted_51 = { class: "bd-kv" };
var _hoisted_52 = { class: "bd-kv" };
var _hoisted_53 = { class: "bd-kv" };
var _hoisted_54 = { class: "bd-kv" };
var _hoisted_55 = { class: "bd-kv" };
var _hoisted_56 = { class: "bd-kv" };
var _hoisted_57 = { class: "bd-kv" };
var _hoisted_58 = { class: "bd-kv" };
var _hoisted_59 = { class: "bd-kv" };
var _hoisted_60 = { class: "contract-content-grid" };
var _hoisted_61 = { class: "contract-info-card wide" };
var _hoisted_62 = { class: "contract-info-card" };
var _hoisted_63 = { class: "contract-info-card" };
var _hoisted_64 = { class: "contract-info-card" };
var _hoisted_65 = { class: "contract-info-card" };
var _hoisted_66 = { class: "contract-sign-grid" };
var _hoisted_67 = { class: "contract-sign-card" };
var _hoisted_68 = { class: "contract-sign-card" };
var _hoisted_69 = { class: "contract-sign-card" };
var _hoisted_70 = { class: "contract-expiry-grid" };
var _hoisted_71 = { class: "contract-expiry-cell" };
var _hoisted_72 = { class: "contract-expiry-cell" };
var _hoisted_73 = { class: "contract-expiry-cell" };
var _hoisted_74 = {
	key: 0,
	class: "bd-section-title section-gap"
};
var _hoisted_75 = {
	key: 1,
	class: "contract-version-list"
};
var _hoisted_76 = {
	key: 0,
	class: "bd-timeline-item"
};
var _hoisted_77 = { class: "contract-footer-summary" };
var _hoisted_78 = { class: "tpl-head" };
var _hoisted_79 = { class: "tpl-sub" };
var _hoisted_80 = { class: "var-count" };
var _hoisted_81 = { class: "var-tags" };
var _hoisted_82 = { class: "date-range-row" };
var _hoisted_83 = { class: "stage-dialog-head" };
var _hoisted_84 = { class: "sd-day" };
var _hoisted_85 = { class: "sd-action" };
//#endregion
//#region src/views/order/contract.vue
var contract_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "contract",
	setup(__props) {
		const loading = ref(false);
		const list = ref([]);
		const templates = ref([]);
		const orders = ref([]);
		const searchKey = ref("");
		const activeTab = ref("all");
		const page = reactive({
			current: 1,
			size: 10,
			total: 0
		});
		const currentDate = (() => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
		})();
		const tabDefs = [
			{
				label: "全部",
				value: "all"
			},
			{
				label: "草稿",
				value: "draft"
			},
			{
				label: "待签署",
				value: "sent"
			},
			{
				label: "已签署",
				value: "signed"
			},
			{
				label: "履行中",
				value: "performing"
			},
			{
				label: "即将到期",
				value: "expiring"
			},
			{
				label: "已到期",
				value: "expired"
			},
			{
				label: "已续签",
				value: "renewed"
			},
			{
				label: "已终止",
				value: "terminated"
			}
		];
		const serviceTypeOptions = [
			{
				label: "代理记账",
				value: "bookkeeping"
			},
			{
				label: "注册公司",
				value: "registration"
			},
			{
				label: "税务筹划",
				value: "tax_planning"
			},
			{
				label: "资质代办",
				value: "qualification"
			},
			{
				label: "审计报告",
				value: "audit"
			},
			{
				label: "公司注销",
				value: "cancellation"
			},
			{
				label: "其他",
				value: "other"
			}
		];
		const serviceTypeLabel = (v) => {
			var _serviceTypeOptions$f, _serviceTypeOptions$f2;
			return (_serviceTypeOptions$f = (_serviceTypeOptions$f2 = serviceTypeOptions.find((s) => s.value === v)) === null || _serviceTypeOptions$f2 === void 0 ? void 0 : _serviceTypeOptions$f2.label) !== null && _serviceTypeOptions$f !== void 0 ? _serviceTypeOptions$f : v;
		};
		const tplVariables = [
			"partyAName",
			"partyBName",
			"startDate",
			"endDate",
			"contractAmount",
			"serviceContent"
		];
		const STAGE_DEFS = [
			{
				stage: 60,
				action: "首次提醒：标记即将到期",
				target: "销售"
			},
			{
				stage: 45,
				action: "销售联系客户确认续签意向",
				target: "销售"
			},
			{
				stage: 30,
				action: "通知主管，制定续签计划",
				target: "销售 + 主管"
			},
			{
				stage: 15,
				action: "主管每周检查续签进度",
				target: "主管"
			},
			{
				stage: 7,
				action: "最后续签努力，高优触达",
				target: "销售 + 主管"
			},
			{
				stage: 0,
				action: "未续签→入藏金阁；已续签→生效新合同",
				target: "全员"
			}
		];
		const stageDef = (s) => STAGE_DEFS.find((x) => x.stage === s) || STAGE_DEFS[STAGE_DEFS.length - 1];
		const statusText = (s) => {
			var _pending$done$overdue;
			return (_pending$done$overdue = {
				pending: "待处理",
				done: "已处理",
				overdue: "已过期"
			}[s]) !== null && _pending$done$overdue !== void 0 ? _pending$done$overdue : s;
		};
		const linkageTypeLabel = (t) => {
			var _renew$terminate$stag;
			return (_renew$terminate$stag = {
				renew: "续签",
				terminate: "终止",
				stage_alert: "阶梯",
				sign: "签署"
			}[t]) !== null && _renew$terminate$stag !== void 0 ? _renew$terminate$stag : t;
		};
		const formatMoney = (n) => (n !== null && n !== void 0 ? n : 0).toLocaleString("zh-CN", {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2
		});
		const dayDiff = (dateStr) => {
			if (!dateStr) return 0;
			const a = new Date(dateStr).setHours(0, 0, 0, 0);
			const b = (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
			return Math.round((a - b) / 864e5);
		};
		const daysLeft = (row) => dayDiff(row.endDate);
		const formatDays = (d) => d < 0 ? `逾期 ${-d} 天` : `${d} 天`;
		const daysClass = (d) => {
			if (d <= 0) return "d-expired";
			if (d <= 7) return "d-red";
			if (d <= 15) return "d-orange";
			if (d <= 30) return "d-yellow";
			if (d <= 60) return "d-blue";
			return "d-normal";
		};
		const signMethodLabel = (m) => {
			var _unset$paper$electron;
			return (_unset$paper$electron = {
				unset: "未登记",
				paper: "线下签署",
				electronic: "邮寄签署",
				fadada: "线上送签登记",
				esign: "线上送签登记"
			}[m]) !== null && _unset$paper$electron !== void 0 ? _unset$paper$electron : m;
		};
		function deriveStatus(row) {
			if (row.signStatus === "draft") return "draft";
			if (row.signStatus === "sent" || row.signStatus === "partial_signed") return "sent";
			if (row.signStatus === "renewed") return "renewed";
			if (row.signStatus === "terminated") return "terminated";
			if (row.signStatus === "expired") return "expired";
			if (row.signStatus === "signed") {
				const left = dayDiff(row.endDate);
				if (left < 0) return "expired";
				if (left <= 30) return "expiring";
				if (dayDiff(row.startDate) <= 0) return "performing";
				return "signed";
			}
			return "draft";
		}
		const statusMap = {
			draft: {
				label: "草稿",
				type: "info"
			},
			sent: {
				label: "待签署",
				type: "warning"
			},
			signed: {
				label: "已签署",
				type: "success"
			},
			performing: {
				label: "履行中",
				type: "primary"
			},
			expiring: {
				label: "即将到期",
				type: "warning"
			},
			expired: {
				label: "已到期",
				type: "danger"
			},
			renewed: {
				label: "已续签",
				type: "success"
			},
			terminated: {
				label: "已终止",
				type: "info"
			}
		};
		const statusTag = (s) => statusMap[s];
		function contractAvatarClass(row) {
			const status = deriveStatus(row);
			if (status === "expired" || status === "terminated") return "danger";
			if (status === "expiring" || status === "sent") return "warning";
			if (status === "signed" || status === "performing" || status === "renewed") return "success";
			return "company";
		}
		const filteredList = computed(() => {
			let arr = list.value;
			if (activeTab.value !== "all") arr = arr.filter((c) => deriveStatus(c) === activeTab.value);
			if (searchKey.value.trim()) {
				const k = searchKey.value.trim();
				arr = arr.filter((c) => c.contractNo.includes(k) || (c.customerName || "").includes(k) || (c.contractName || "").includes(k));
			}
			page.total = arr.length;
			const start = (page.current - 1) * page.size;
			return arr.slice(start, start + page.size);
		});
		const statActive = computed(() => list.value.filter((c) => ["signed"].includes(c.signStatus) && dayDiff(c.endDate) > 0).length);
		const statExpiring = computed(() => list.value.filter((c) => c.signStatus === "signed" && dayDiff(c.endDate) <= 30 && dayDiff(c.endDate) >= 0).length);
		const statPending = computed(() => list.value.filter((c) => ["sent", "partial_signed"].includes(c.signStatus)).length);
		const statRenewed = computed(() => list.value.filter((c) => c.signStatus === "renewed").length);
		const statTerminated = computed(() => list.value.filter((c) => c.signStatus === "terminated").length);
		const timelineNodes = [
			{
				day: "60 天",
				title: "即将到期标记",
				desc: "系统自动标识到期合同",
				tone: "tone-yellow"
			},
			{
				day: "45 天",
				title: "销售联系客户",
				desc: "触发外呼任务，留下沟通记录",
				tone: "tone-orange"
			},
			{
				day: "30 天",
				title: "通知主管",
				desc: "主管介入跟进续签进展",
				tone: "tone-orange"
			},
			{
				day: "15 天",
				title: "周检查",
				desc: "每周复盘客户续签意向",
				tone: "tone-red"
			},
			{
				day: "7 天",
				title: "最后努力",
				desc: "高优触达，必要时安排面谈",
				tone: "tone-red"
			},
			{
				day: "到期",
				title: "未续签 → 藏金阁",
				desc: "客户进入他司服务即将到期池",
				tone: "tone-dark"
			}
		];
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					list.value = (yield contractMgmtApi.list({
						page: 1,
						pageSize: 999
					})).list;
				} finally {
					loading.value = false;
				}
			});
			return _loadList.apply(this, arguments);
		}
		function loadTemplates() {
			return _loadTemplates.apply(this, arguments);
		}
		function _loadTemplates() {
			_loadTemplates = _asyncToGenerator(function* () {
				templates.value = yield contractMgmtApi.getTemplates();
			});
			return _loadTemplates.apply(this, arguments);
		}
		function loadOrders() {
			return _loadOrders.apply(this, arguments);
		}
		function _loadOrders() {
			_loadOrders = _asyncToGenerator(function* () {
				orders.value = (yield orderApi.list({
					page: 1,
					pageSize: 200
				})).list;
			});
			return _loadOrders.apply(this, arguments);
		}
		const completedOrders = computed(() => orders.value.filter((o) => o.status === "completed"));
		const enabledTemplates = computed(() => templates.value.filter((t) => t.enabled));
		const detailDrawer = reactive({
			visible: false,
			data: null
		});
		const detailHistory = computed(() => {
			const d = detailDrawer.data;
			if (!d) return [];
			const items = [];
			items.push({
				time: d.createTime,
				action: "合同创建（草稿）",
				by: "系统",
				color: "#909399"
			});
			if (d.partyBSignTime) items.push({
				time: d.partyBSignTime,
				action: "送签状态已登记",
				by: "系统记录",
				color: "#409eff"
			});
			if (d.partyASignTime) items.push({
				time: d.partyASignTime,
				action: "客户签署已确认",
				by: d.partyASigner || "客户",
				color: "#67c23a"
			});
			if (d.signStatus === "renewed") items.push({
				time: d.createTime,
				action: "已续签",
				by: "系统",
				color: "#67c23a",
				note: d.remark
			});
			if (d.signStatus === "terminated") items.push({
				time: d.createTime,
				action: "合同终止",
				by: "管理员",
				color: "#f56c6c",
				note: d.remark
			});
			return items.sort((a, b) => (a.time || "").localeCompare(b.time || ""));
		});
		function openDetail(row) {
			detailDrawer.data = row;
			detailDrawer.visible = true;
			loadHistory(row);
		}
		const historyVersions = ref([]);
		function loadHistory(_x) {
			return _loadHistory.apply(this, arguments);
		}
		function _loadHistory() {
			_loadHistory = _asyncToGenerator(function* (row) {
				try {
					historyVersions.value = yield contractMgmtApi.history(row.id);
				} catch (_unused) {
					historyVersions.value = [];
				}
			});
			return _loadHistory.apply(this, arguments);
		}
		const linkageRecords = computed(() => {
			const d = detailDrawer.data;
			if (!d || !d.linkageRecords) return [];
			return [...d.linkageRecords].sort((a, b) => (b.time || "").localeCompare(a.time || ""));
		});
		const expiringContracts = computed(() => list.value.filter((c) => c.signStatus === "signed" && dayDiff(c.endDate) <= 60 && dayDiff(c.endDate) >= 0).sort((a, b) => dayDiff(a.endDate) - dayDiff(b.endDate)));
		function resolveStages(row) {
			const stages = row.renewStages && row.renewStages.length ? row.renewStages : STAGE_DEFS.map((d) => ({
				stage: d.stage,
				status: "pending"
			}));
			const left = dayDiff(row.endDate);
			return stages.map((s) => {
				let active = false;
				if (s.stage === 0 && left <= 0) active = true;
				else if (s.stage === 7 && left > 0 && left <= 7) active = true;
				else if (s.stage === 15 && left > 7 && left <= 15) active = true;
				else if (s.stage === 30 && left > 15 && left <= 30) active = true;
				else if (s.stage === 45 && left > 30 && left <= 45) active = true;
				else if (s.stage === 60 && left > 45 && left <= 60) active = true;
				let status = s.status;
				if (status === "pending" && left < s.stage - 7) status = "overdue";
				return _objectSpread2(_objectSpread2({}, s), {}, {
					status,
					active
				});
			});
		}
		const genFormRef = ref();
		const genDialog = reactive({ visible: false });
		const genForm = reactive({
			orderId: void 0,
			templateId: void 0,
			title: ""
		});
		const genRules = {
			orderId: [{
				required: true,
				message: "请选择关联订单",
				trigger: "change"
			}],
			templateId: [{
				required: true,
				message: "请选择合同模板",
				trigger: "change"
			}],
			title: [{
				required: true,
				message: "请填写合同名称",
				trigger: "blur"
			}]
		};
		function openGenerateDialog() {
			Object.assign(genForm, {
				orderId: void 0,
				templateId: void 0,
				title: ""
			});
			genDialog.visible = true;
		}
		function syncGeneratedTitle() {
			const order = orders.value.find((x) => x.id === genForm.orderId);
			const template = templates.value.find((x) => x.id === genForm.templateId);
			if (order && template) genForm.title = `${order.customerName || ""}${template.templateName || "服务合同"}`;
		}
		function onOrderSelected() {
			syncGeneratedTitle();
		}
		function onTemplateSelected() {
			syncGeneratedTitle();
		}
		function submitGenerate() {
			return _submitGenerate.apply(this, arguments);
		}
		function _submitGenerate() {
			_submitGenerate = _asyncToGenerator(function* () {
				if (!genFormRef.value) return;
				if (!(yield genFormRef.value.validate().catch(() => false))) return;
				yield contractMgmtApi.generate({
					orderId: genForm.orderId,
					templateId: genForm.templateId,
					title: genForm.title.trim()
				});
				ElMessage.success("合同已生成（草稿）");
				genDialog.visible = false;
				yield loadList();
			});
			return _submitGenerate.apply(this, arguments);
		}
		const editDialog = reactive({
			visible: false,
			form: {
				id: 0,
				contractName: "",
				contractAmount: 0,
				startDate: "",
				endDate: "",
				remark: ""
			}
		});
		function editContract(row) {
			editDialog.form = {
				id: row.id,
				contractName: row.contractName,
				contractAmount: row.contractAmount,
				startDate: row.startDate,
				endDate: row.endDate,
				remark: row.remark
			};
			editDialog.visible = true;
		}
		function submitEdit() {
			return _submitEdit.apply(this, arguments);
		}
		function _submitEdit() {
			_submitEdit = _asyncToGenerator(function* () {
				yield contractMgmtApi.update(_objectSpread2({}, editDialog.form));
				ElMessage.success("已保存");
				editDialog.visible = false;
				yield loadList();
			});
			return _submitEdit.apply(this, arguments);
		}
		function sendSign(_x2) {
			return _sendSign.apply(this, arguments);
		}
		function _sendSign() {
			_sendSign = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认登记合同「${row.contractNo}」已线下送交客户签署？本操作只记录送签状态和时间，不会发送文件或调用电子签平台。`, "登记已送签", {
					type: "warning",
					confirmButtonText: "确认登记"
				}).then(_asyncToGenerator(function* () {
					yield contractMgmtApi.sendSign({
						id: row.id,
						signMethod: "paper"
					});
					ElMessage.success("送签状态和时间已登记");
					yield loadList();
				})).catch(() => {});
			});
			return _sendSign.apply(this, arguments);
		}
		function confirmSign(_x4) {
			return _confirmSign.apply(this, arguments);
		}
		function _confirmSign() {
			_confirmSign = _asyncToGenerator(function* (row) {
				var _row$customerName;
				yield ElMessageBox.prompt("请输入甲方签署人姓名以确认签署完成", "确认签署", {
					inputValue: row.partyASigner || ((_row$customerName = row.customerName) === null || _row$customerName === void 0 ? void 0 : _row$customerName.slice(0, 3)) || "客户",
					inputValidator: (v) => !!v || "签署人不能为空"
				}).then(function() {
					var _ref = _asyncToGenerator(function* ({ value }) {
						var _detailDrawer$data;
						yield contractMgmtApi.confirmSign({
							id: row.id,
							signer: value
						});
						ElMessage.success("客户签署状态已确认");
						yield loadList();
						if (((_detailDrawer$data = detailDrawer.data) === null || _detailDrawer$data === void 0 ? void 0 : _detailDrawer$data.id) === row.id) {
							const fresh = yield contractMgmtApi.detail(row.id);
							if (fresh) detailDrawer.data = fresh;
						}
					});
					return function(_x3) {
						return _ref.apply(this, arguments);
					};
				}()).catch(() => {});
			});
			return _confirmSign.apply(this, arguments);
		}
		const renewDialog = reactive({
			visible: false,
			form: {
				id: 0,
				oldNo: "",
				contractAmount: 0,
				startDate: "",
				endDate: "",
				adjustService: false,
				serviceContent: ""
			}
		});
		function renewContract(row) {
			const start = new Date(row.endDate);
			start.setDate(start.getDate() + 1);
			const end = new Date(start);
			end.setFullYear(end.getFullYear() + 1);
			renewDialog.form = {
				id: row.id,
				oldNo: row.contractNo,
				contractAmount: row.contractAmount,
				startDate: start.toISOString().slice(0, 10),
				endDate: end.toISOString().slice(0, 10),
				adjustService: false,
				serviceContent: ""
			};
			renewDialog.visible = true;
		}
		function submitRenew() {
			return _submitRenew.apply(this, arguments);
		}
		function _submitRenew() {
			_submitRenew = _asyncToGenerator(function* () {
				yield contractMgmtApi.renew({
					id: renewDialog.form.id,
					contractAmount: renewDialog.form.contractAmount,
					startDate: renewDialog.form.startDate,
					endDate: renewDialog.form.endDate,
					adjustService: renewDialog.form.adjustService,
					serviceContent: renewDialog.form.serviceContent
				});
				ElMessage.success("已生成续签合同（草稿状态，请补签）");
				renewDialog.visible = false;
				yield loadList();
			});
			return _submitRenew.apply(this, arguments);
		}
		const termDialog = reactive({
			visible: false,
			form: {
				id: 0,
				reason: ""
			}
		});
		function terminateContract(row) {
			termDialog.form = {
				id: row.id,
				reason: ""
			};
			termDialog.visible = true;
		}
		function submitTerminate() {
			return _submitTerminate.apply(this, arguments);
		}
		function _submitTerminate() {
			_submitTerminate = _asyncToGenerator(function* () {
				var _detailDrawer$data2;
				if (!termDialog.form.reason.trim()) {
					ElMessage.warning("请填写终止原因");
					return;
				}
				yield contractMgmtApi.terminate(termDialog.form);
				ElMessage.success("合同已终止，关联进行中任务请同步取消");
				termDialog.visible = false;
				yield loadList();
				if (((_detailDrawer$data2 = detailDrawer.data) === null || _detailDrawer$data2 === void 0 ? void 0 : _detailDrawer$data2.id) === termDialog.form.id) {
					const fresh = yield contractMgmtApi.detail(termDialog.form.id);
					if (fresh) detailDrawer.data = fresh;
				}
			});
			return _submitTerminate.apply(this, arguments);
		}
		const stageDialog = reactive({
			visible: false,
			form: {
				id: 0,
				stage: 60,
				status: "done",
				handler: "",
				note: ""
			}
		});
		function openStageDialog(row, stage) {
			stageDialog.form = {
				id: row.id,
				stage,
				status: "done",
				handler: "",
				note: ""
			};
			stageDialog.visible = true;
		}
		function submitStage() {
			return _submitStage.apply(this, arguments);
		}
		function _submitStage() {
			_submitStage = _asyncToGenerator(function* () {
				if (!stageDialog.form.handler.trim()) {
					ElMessage.warning("请填写实际处理人");
					return;
				}
				yield contractMgmtApi.updateStage({
					id: stageDialog.form.id,
					stage: stageDialog.form.stage,
					status: stageDialog.form.status,
					handler: stageDialog.form.handler.trim(),
					note: stageDialog.form.note
				});
				ElMessage.success("阶梯处理记录已保存");
				stageDialog.visible = false;
				yield loadList();
			});
			return _submitStage.apply(this, arguments);
		}
		const tplDialog = reactive({ visible: false });
		const tplFormDialog = reactive({
			visible: false,
			id: 0
		});
		const tplForm = reactive({
			templateName: "",
			serviceType: "bookkeeping",
			templateContent: "",
			version: "v1.0",
			enabled: true
		});
		function openTemplateDialog() {
			tplDialog.visible = true;
		}
		function openTplForm(row) {
			if (row) {
				tplFormDialog.id = row.id;
				Object.assign(tplForm, row);
			} else {
				tplFormDialog.id = 0;
				Object.assign(tplForm, {
					id: void 0,
					templateName: "",
					serviceType: "bookkeeping",
					templateContent: "",
					version: "v1.0",
					enabled: true
				});
			}
			tplFormDialog.visible = true;
		}
		function submitTplForm() {
			return _submitTplForm.apply(this, arguments);
		}
		function _submitTplForm() {
			_submitTplForm = _asyncToGenerator(function* () {
				const payload = _objectSpread2({}, tplForm);
				if (tplFormDialog.id) payload.id = tplFormDialog.id;
				yield contractMgmtApi.saveTemplate(payload);
				ElMessage.success("已保存模板");
				tplFormDialog.visible = false;
				yield loadTemplates();
			});
			return _submitTplForm.apply(this, arguments);
		}
		function toggleTpl(_x5) {
			return _toggleTpl.apply(this, arguments);
		}
		function _toggleTpl() {
			_toggleTpl = _asyncToGenerator(function* (row) {
				yield contractMgmtApi.saveTemplate({
					id: row.id,
					enabled: !row.enabled
				});
				ElMessage.success(row.enabled ? "已停用" : "已启用");
				yield loadTemplates();
			});
			return _toggleTpl.apply(this, arguments);
		}
		/** 模板变量数量统计 */
		function countTplVars(row) {
			try {
				const arr = JSON.parse(row.variableJson || "[]");
				return Array.isArray(arr) ? arr.length : 0;
			} catch (_unused2) {
				return 0;
			}
		}
		onMounted(_asyncToGenerator(function* () {
			yield Promise.all([
				loadList(),
				loadTemplates(),
				loadOrders()
			]);
		}));
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_input = ElInput;
			const _component_RefreshRight = resolveComponent("RefreshRight");
			const _component_el_icon = ElIcon;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_alert = ElAlert;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_input_number = ElInputNumber;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_switch = ElSwitch;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [
						_cache[45] || (_cache[45] = createBaseVNode("span", { class: "meta-tag" }, "CONTRACT OPS", -1)),
						_cache[46] || (_cache[46] = createBaseVNode("span", { class: "meta-divider" }, null, -1)),
						createBaseVNode("span", _hoisted_4, toDisplayString(unref(currentDate)) + " · 合同运营台", 1)
					]),
					_cache[49] || (_cache[49] = createStaticVNode("<div class=\"header-main\" data-v-9b55a81c><h1 class=\"page-title\" data-v-9b55a81c><span class=\"title-cn\" data-v-9b55a81c>合同管理</span><span class=\"title-en\" data-v-9b55a81c>Lifecycle Operations</span></h1><p class=\"page-desc\" data-v-9b55a81c>从起草、签署、履约到续签归档，统一管理客户服务链路</p></div>", 1)),
					createBaseVNode("div", _hoisted_5, [createVNode(_component_el_button, {
						class: "btn-ghost",
						onClick: openTemplateDialog
					}, {
						default: withCtx(() => [..._cache[47] || (_cache[47] = [createTextVNode("模板管理", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						class: "btn-seal",
						type: "primary",
						onClick: openGenerateDialog
					}, {
						default: withCtx(() => [..._cache[48] || (_cache[48] = [createTextVNode("生成合同", -1)])]),
						_: 1
					})]),
					_cache[50] || (_cache[50] = createBaseVNode("div", { class: "seal-decor" }, [createBaseVNode("div", { class: "seal-circle" }, [createBaseVNode("span", { class: "seal-inner" }, [
						createTextVNode("合同"),
						createBaseVNode("br"),
						createTextVNode("管理")
					])])], -1))
				]),
				createBaseVNode("section", _hoisted_6, [
					createBaseVNode("div", _hoisted_7, [
						_cache[51] || (_cache[51] = createBaseVNode("span", { class: "cell-idx" }, "／甲", -1)),
						createBaseVNode("div", _hoisted_8, toDisplayString(statActive.value), 1),
						_cache[52] || (_cache[52] = createBaseVNode("div", { class: "cell-label" }, "已签署合同", -1))
					]),
					createBaseVNode("div", _hoisted_9, [
						_cache[53] || (_cache[53] = createBaseVNode("span", { class: "cell-idx" }, "／乙", -1)),
						createBaseVNode("div", _hoisted_10, toDisplayString(statExpiring.value), 1),
						_cache[54] || (_cache[54] = createBaseVNode("div", { class: "cell-label" }, "即将到期 · 30 天内", -1))
					]),
					createBaseVNode("div", _hoisted_11, [
						_cache[55] || (_cache[55] = createBaseVNode("span", { class: "cell-idx" }, "／丙", -1)),
						createBaseVNode("div", _hoisted_12, toDisplayString(statPending.value), 1),
						_cache[56] || (_cache[56] = createBaseVNode("div", { class: "cell-label" }, "待签署", -1))
					]),
					createBaseVNode("div", _hoisted_13, [
						_cache[57] || (_cache[57] = createBaseVNode("span", { class: "cell-idx" }, "／丁", -1)),
						createBaseVNode("div", _hoisted_14, toDisplayString(statRenewed.value), 1),
						_cache[58] || (_cache[58] = createBaseVNode("div", { class: "cell-label" }, "已续签", -1))
					]),
					createBaseVNode("div", _hoisted_15, [
						_cache[59] || (_cache[59] = createBaseVNode("span", { class: "cell-idx" }, "／戊", -1)),
						createBaseVNode("div", _hoisted_16, toDisplayString(statTerminated.value), 1),
						_cache[60] || (_cache[60] = createBaseVNode("div", { class: "cell-label" }, "已终止", -1))
					])
				]),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeTab.value = $event),
					class: "ct-tabs"
				}, {
					default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(tabDefs, (t) => {
						return createVNode(_component_el_tab_pane, {
							key: t.value,
							label: t.label,
							name: t.value
						}, null, 8, ["label", "name"]);
					}), 64))]),
					_: 1
				}, 8, ["modelValue"]),
				activeTab.value === "expiring" ? (openBlock(), createElementBlock("section", _hoisted_17, [_cache[64] || (_cache[64] = createStaticVNode("<div class=\"panel-head\" data-v-9b55a81c><div class=\"ph-left\" data-v-9b55a81c><span class=\"ph-num\" data-v-9b55a81c>／零</span><h3 class=\"ph-title\" data-v-9b55a81c>续签跟进看板</h3><span class=\"ph-sub\" data-v-9b55a81c>RENEWAL STAGE BOARD</span></div><div class=\"ph-right stage-legend\" data-v-9b55a81c><span data-v-9b55a81c><i class=\"dot dot-done\" data-v-9b55a81c></i>已处理</span><span data-v-9b55a81c><i class=\"dot dot-pending\" data-v-9b55a81c></i>待处理</span><span data-v-9b55a81c><i class=\"dot dot-overdue\" data-v-9b55a81c></i>已过期</span></div></div>", 1)), !expiringContracts.value.length ? (openBlock(), createElementBlock("div", _hoisted_18, [..._cache[61] || (_cache[61] = [createBaseVNode("span", { class: "empty-mark" }, "冷", -1), createBaseVNode("span", { class: "empty-text" }, "当前无即将到期合同", -1)])])) : (openBlock(), createElementBlock("div", _hoisted_19, [(openBlock(true), createElementBlock(Fragment, null, renderList(expiringContracts.value, (row) => {
					return openBlock(), createElementBlock("div", {
						key: row.id,
						class: "stage-item"
					}, [createBaseVNode("div", _hoisted_20, [createBaseVNode("div", _hoisted_21, [
						createBaseVNode("span", _hoisted_22, toDisplayString(row.contractNo), 1),
						createBaseVNode("span", _hoisted_23, toDisplayString(row.customerName), 1),
						createBaseVNode("span", _hoisted_24, toDisplayString(row.templateName), 1)
					]), createBaseVNode("div", _hoisted_25, [
						_cache[62] || (_cache[62] = createBaseVNode("span", { class: "si-end-k" }, "到期日", -1)),
						createBaseVNode("span", _hoisted_26, toDisplayString(row.endDate), 1),
						createBaseVNode("span", { class: normalizeClass(["si-days", daysClass(daysLeft(row))]) }, toDisplayString(formatDays(daysLeft(row))), 3)
					])]), createBaseVNode("ul", _hoisted_27, [(openBlock(true), createElementBlock(Fragment, null, renderList(resolveStages(row), (st) => {
						return openBlock(), createElementBlock("li", {
							key: st.stage,
							class: normalizeClass(["stage-cell", ["st-" + st.status, st.active ? "st-active" : ""]])
						}, [
							createBaseVNode("div", _hoisted_28, toDisplayString(st.stage === 0 ? "到期" : st.stage + " 天"), 1),
							createBaseVNode("div", _hoisted_29, toDisplayString(stageDef(st.stage).action), 1),
							createBaseVNode("div", _hoisted_30, "对象：" + toDisplayString(stageDef(st.stage).target), 1),
							createBaseVNode("div", _hoisted_31, [createBaseVNode("i", { class: normalizeClass(["dot", "dot-" + st.status]) }, null, 2), createTextVNode(" " + toDisplayString(statusText(st.status)), 1)]),
							st.handler ? (openBlock(), createElementBlock("div", _hoisted_32, toDisplayString(st.handler) + " · " + toDisplayString(st.handledAt || "—"), 1)) : createCommentVNode("", true),
							st.note ? (openBlock(), createElementBlock("div", _hoisted_33, "“" + toDisplayString(st.note) + "”", 1)) : createCommentVNode("", true),
							st.status === "pending" && st.active ? (openBlock(), createBlock(_component_el_button, {
								key: 2,
								size: "small",
								class: "sc-btn",
								onClick: ($event) => openStageDialog(row, st.stage)
							}, {
								default: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("标记处理", -1)])]),
								_: 1
							}, 8, ["onClick"])) : createCommentVNode("", true)
						], 2);
					}), 128))])]);
				}), 128))]))])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_34, [
					createBaseVNode("div", _hoisted_35, [_cache[66] || (_cache[66] = createBaseVNode("div", { class: "ph-left" }, [
						createBaseVNode("span", { class: "ph-num" }, "／壹"),
						createBaseVNode("h3", { class: "ph-title" }, "合同列表"),
						createBaseVNode("span", { class: "ph-sub" }, "CONTRACT REGISTER")
					], -1)), createBaseVNode("div", _hoisted_36, [createVNode(_component_el_input, {
						modelValue: searchKey.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchKey.value = $event),
						placeholder: "编号 / 客户 检索",
						clearable: "",
						style: { "width": "220px" },
						size: "default"
					}, null, 8, ["modelValue"]), createVNode(_component_el_button, { onClick: _cache[2] || (_cache[2] = ($event) => loadList()) }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(_component_RefreshRight)]),
							_: 1
						}), _cache[65] || (_cache[65] = createTextVNode("刷新", -1))]),
						_: 1
					})])]),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: filteredList.value,
						class: "ct-table",
						stripe: ""
					}, {
						empty: withCtx(() => [..._cache[73] || (_cache[73] = [createBaseVNode("div", { class: "empty-cell" }, [createBaseVNode("span", { class: "empty-mark" }, "无"), createBaseVNode("span", { class: "empty-text" }, "该状态下暂无合同记录")], -1)])]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								prop: "contractNo",
								label: "合同编号",
								width: "160"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_37, toDisplayString(row.contractNo), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "customerName",
								label: "客户名称",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_38, toDisplayString(row.customerName), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "服务内容",
								"min-width": "180"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_39, toDisplayString(row.contractName || row.templateName), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "合同金额",
								width: "130",
								align: "right"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_40, "¥ " + toDisplayString(formatMoney(row.contractAmount)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "状态",
								width: "118"
							}, {
								default: withCtx(({ row }) => [createVNode(_component_el_tag, {
									type: statusTag(deriveStatus(row)).type,
									class: normalizeClass(["ct-tag", deriveStatus(row) === "expiring" ? "blink" : ""]),
									effect: "plain",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(statusTag(deriveStatus(row)).label), 1)]),
									_: 2
								}, 1032, ["type", "class"])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "签署方式",
								width: "110"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_41, toDisplayString(signMethodLabel(row.signMethod)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "startDate",
								label: "开始日期",
								width: "115"
							}),
							createVNode(_component_el_table_column, {
								prop: "endDate",
								label: "到期日期",
								width: "115"
							}),
							createVNode(_component_el_table_column, {
								label: "剩余天数",
								width: "100",
								align: "center"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass(["days-left", daysClass(daysLeft(row))]) }, toDisplayString(formatDays(daysLeft(row))), 3)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "操作",
								width: "280",
								fixed: "right"
							}, {
								default: withCtx(({ row }) => [
									createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => openDetail(row)
									}, {
										default: withCtx(() => [..._cache[67] || (_cache[67] = [createTextVNode("查看", -1)])]),
										_: 1
									}, 8, ["onClick"]),
									row.signStatus === "draft" ? (openBlock(), createBlock(_component_el_button, {
										key: 0,
										link: "",
										type: "warning",
										onClick: ($event) => editContract(row)
									}, {
										default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									row.signStatus === "draft" ? (openBlock(), createBlock(_component_el_button, {
										key: 1,
										link: "",
										type: "success",
										onClick: ($event) => sendSign(row)
									}, {
										default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("登记已送签", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									row.signStatus === "sent" || row.signStatus === "partial_signed" ? (openBlock(), createBlock(_component_el_button, {
										key: 2,
										link: "",
										type: "success",
										onClick: ($event) => confirmSign(row)
									}, {
										default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("确认签署", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									row.signStatus === "signed" ? (openBlock(), createBlock(_component_el_button, {
										key: 3,
										link: "",
										type: "primary",
										onClick: ($event) => renewContract(row)
									}, {
										default: withCtx(() => [..._cache[71] || (_cache[71] = [createTextVNode("续签", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true),
									[
										"signed",
										"sent",
										"partial_signed"
									].includes(row.signStatus) ? (openBlock(), createBlock(_component_el_button, {
										key: 4,
										link: "",
										type: "danger",
										onClick: ($event) => terminateContract(row)
									}, {
										default: withCtx(() => [..._cache[72] || (_cache[72] = [createTextVNode("终止", -1)])]),
										_: 1
									}, 8, ["onClick"])) : createCommentVNode("", true)
								]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					createBaseVNode("div", _hoisted_42, [createVNode(_component_el_pagination, {
						"current-page": page.current,
						"onUpdate:currentPage": _cache[3] || (_cache[3] = ($event) => page.current = $event),
						"page-size": page.size,
						"onUpdate:pageSize": _cache[4] || (_cache[4] = ($event) => page.size = $event),
						total: page.total,
						layout: "total, prev, pager, next",
						background: ""
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])])
				]),
				createBaseVNode("section", _hoisted_43, [_cache[75] || (_cache[75] = createStaticVNode("<div class=\"panel-head\" data-v-9b55a81c><div class=\"ph-left\" data-v-9b55a81c><span class=\"ph-num\" data-v-9b55a81c>／贰</span><h3 class=\"ph-title\" data-v-9b55a81c>到期提醒时间线</h3><span class=\"ph-sub\" data-v-9b55a81c>EXPIRY ALERT TIMELINE</span></div></div>", 1)), createBaseVNode("div", _hoisted_44, [(openBlock(), createElementBlock(Fragment, null, renderList(timelineNodes, (node, idx) => {
					return createBaseVNode("div", {
						key: idx,
						class: normalizeClass(["tl-node", node.tone])
					}, [
						_cache[74] || (_cache[74] = createBaseVNode("div", { class: "tl-dot" }, null, -1)),
						createBaseVNode("div", _hoisted_45, toDisplayString(node.day), 1),
						createBaseVNode("div", _hoisted_46, toDisplayString(node.title), 1),
						createBaseVNode("div", _hoisted_47, toDisplayString(node.desc), 1)
					], 2);
				}), 64))])]),
				createVNode(_component_el_dialog, {
					modelValue: genDialog.visible,
					"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => genDialog.visible = $event),
					title: "生成合同",
					width: "780px",
					class: "ct-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[8] || (_cache[8] = ($event) => genDialog.visible = false) }, {
						default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						class: "btn-seal",
						type: "primary",
						onClick: submitGenerate
					}, {
						default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("生成合同", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "genFormRef",
						ref: genFormRef,
						model: genForm,
						rules: genRules,
						"label-width": "120px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "关联订单",
								prop: "orderId"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: genForm.orderId,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => genForm.orderId = $event),
									placeholder: "仅可选择已完成的订单",
									filterable: "",
									style: { "width": "100%" },
									onChange: onOrderSelected
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(completedOrders.value, (o) => {
										return openBlock(), createBlock(_component_el_option, {
											key: o.id,
											label: `${o.orderNo} · ${o.customerName} · ¥${formatMoney(o.finalAmount)}`,
											value: o.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "合同模板",
								prop: "templateId"
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: genForm.templateId,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => genForm.templateId = $event),
									placeholder: "请选择模板",
									style: { "width": "100%" },
									onChange: onTemplateSelected
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(enabledTemplates.value, (t) => {
										return openBlock(), createBlock(_component_el_option, {
											key: t.id,
											label: `${t.templateName} · ${t.version}`,
											value: t.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "合同名称",
								prop: "title"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: genForm.title,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => genForm.title = $event),
									maxlength: "200",
									"show-word-limit": ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_alert, {
								type: "info",
								"show-icon": "",
								closable: false,
								title: "生成范围说明",
								description: "生成操作只创建合同草稿：客户、金额和服务期限取所选订单，正文取所选模板；不会发送合同、发起电子签或创建服务任务。"
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: editDialog.visible,
					"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => editDialog.visible = $event),
					title: "编辑草稿合同",
					width: "560px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[15] || (_cache[15] = ($event) => editDialog.visible = false) }, {
						default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitEdit
					}, {
						default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("保存", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: editDialog.form,
						"label-width": "110px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "合同名称" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: editDialog.form.contractName,
									"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => editDialog.form.contractName = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "合同金额" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: editDialog.form.contractAmount,
									"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => editDialog.form.contractAmount = $event),
									min: 0,
									precision: 2,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "开始日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: editDialog.form.startDate,
									"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => editDialog.form.startDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "到期日期" }, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: editDialog.form.endDate,
									"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => editDialog.form.endDate = $event),
									type: "date",
									"value-format": "YYYY-MM-DD",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: editDialog.form.remark,
									"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => editDialog.form.remark = $event),
									type: "textarea",
									rows: 3
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				detailDrawer.data ? (openBlock(), createBlock(BusinessDetailDrawer_default, {
					key: 1,
					modelValue: detailDrawer.visible,
					"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => detailDrawer.visible = $event),
					title: detailDrawer.data.contractName,
					subtitle: `${detailDrawer.data.contractNo} · ${detailDrawer.data.orderNo || "未关联订单"}`,
					eyebrow: "合同详情",
					avatar: (detailDrawer.data.partyAName || detailDrawer.data.customerName || "合同").slice(0, 2),
					"avatar-class": contractAvatarClass(detailDrawer.data),
					"status-text": statusTag(deriveStatus(detailDrawer.data)).label,
					"status-type": statusTag(deriveStatus(detailDrawer.data)).type,
					size: "780px"
				}, {
					actions: withCtx(() => [createBaseVNode("span", _hoisted_48, "¥ " + toDisplayString(formatMoney(detailDrawer.data.contractAmount)), 1), createBaseVNode("span", { class: normalizeClass(["contract-days-pill", daysClass(daysLeft(detailDrawer.data))]) }, toDisplayString(formatDays(daysLeft(detailDrawer.data))), 3)]),
					meta: withCtx(() => [createBaseVNode("div", _hoisted_49, [
						createBaseVNode("div", _hoisted_50, [_cache[80] || (_cache[80] = createBaseVNode("span", null, "合同编号", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.contractNo), 1)]),
						createBaseVNode("div", _hoisted_51, [_cache[81] || (_cache[81] = createBaseVNode("span", null, "关联订单", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.orderNo || "—"), 1)]),
						createBaseVNode("div", _hoisted_52, [_cache[82] || (_cache[82] = createBaseVNode("span", null, "合同模板", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.templateName || "—"), 1)]),
						createBaseVNode("div", _hoisted_53, [_cache[83] || (_cache[83] = createBaseVNode("span", null, "创建时间", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.createTime || "—"), 1)]),
						createBaseVNode("div", _hoisted_54, [_cache[84] || (_cache[84] = createBaseVNode("span", null, "甲方客户", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyAName || detailDrawer.data.customerName || "—"), 1)]),
						createBaseVNode("div", _hoisted_55, [_cache[85] || (_cache[85] = createBaseVNode("span", null, "乙方主体", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyBName || "—"), 1)]),
						createBaseVNode("div", _hoisted_56, [_cache[86] || (_cache[86] = createBaseVNode("span", null, "签署方式", -1)), createBaseVNode("b", null, toDisplayString(signMethodLabel(detailDrawer.data.signMethod)), 1)]),
						createBaseVNode("div", _hoisted_57, [_cache[87] || (_cache[87] = createBaseVNode("span", null, "合同金额", -1)), createBaseVNode("b", null, "¥ " + toDisplayString(formatMoney(detailDrawer.data.contractAmount)), 1)]),
						createBaseVNode("div", _hoisted_58, [_cache[88] || (_cache[88] = createBaseVNode("span", null, "开始日期", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.startDate || "—"), 1)]),
						createBaseVNode("div", _hoisted_59, [_cache[89] || (_cache[89] = createBaseVNode("span", null, "到期日期", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.endDate || "—"), 1)])
					])]),
					timeline: withCtx(() => [
						(openBlock(true), createElementBlock(Fragment, null, renderList(detailHistory.value, (h, i) => {
							return openBlock(), createElementBlock("div", {
								key: "h-" + i,
								class: "bd-timeline-item"
							}, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: h.color === "#67c23a" || h.color === "#409eff" }]) }, null, 2), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(h.action), 1), createBaseVNode("p", null, toDisplayString(h.time || "—") + " · " + toDisplayString(h.by) + toDisplayString(h.note ? ` · ${h.note}` : ""), 1)])]);
						}), 128)),
						!linkageRecords.value.length ? (openBlock(), createElementBlock("div", _hoisted_76, [..._cache[103] || (_cache[103] = [createBaseVNode("i", { class: "bd-timeline-dot" }, null, -1), createBaseVNode("div", null, [createBaseVNode("strong", null, "联动事件"), createBaseVNode("p", null, "暂无联动记录。")], -1)])])) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(linkageRecords.value, (rec, i) => {
							return openBlock(), createElementBlock("div", {
								key: "lk-" + i,
								class: "bd-timeline-item"
							}, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: rec.type === "sign" || rec.type === "renew" }]) }, null, 2), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(linkageTypeLabel(rec.type)) + " · " + toDisplayString(rec.title), 1), createBaseVNode("p", null, toDisplayString(rec.time) + toDisplayString(rec.detail ? ` · ${rec.detail}` : "") + toDisplayString(rec.by ? ` · ${rec.by}` : ""), 1)])]);
						}), 128))
					]),
					footer: withCtx(() => [
						createBaseVNode("div", _hoisted_77, [
							createBaseVNode("span", null, [_cache[104] || (_cache[104] = createTextVNode("金额 ", -1)), createBaseVNode("b", null, "¥ " + toDisplayString(formatMoney(detailDrawer.data.contractAmount)), 1)]),
							createBaseVNode("span", null, [_cache[105] || (_cache[105] = createTextVNode("状态 ", -1)), createBaseVNode("b", null, toDisplayString(statusTag(deriveStatus(detailDrawer.data)).label), 1)]),
							createBaseVNode("span", null, [_cache[106] || (_cache[106] = createTextVNode("剩余 ", -1)), createBaseVNode("b", null, toDisplayString(formatDays(daysLeft(detailDrawer.data))), 1)])
						]),
						createVNode(_component_el_button, { onClick: _cache[17] || (_cache[17] = ($event) => detailDrawer.visible = false) }, {
							default: withCtx(() => [..._cache[107] || (_cache[107] = [createTextVNode("关闭", -1)])]),
							_: 1
						}),
						detailDrawer.data.signStatus === "sent" || detailDrawer.data.signStatus === "partial_signed" ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "success",
							onClick: _cache[18] || (_cache[18] = ($event) => confirmSign(detailDrawer.data))
						}, {
							default: withCtx(() => [..._cache[108] || (_cache[108] = [createTextVNode("确认签署", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					]),
					default: withCtx(() => [
						_cache[109] || (_cache[109] = createBaseVNode("div", { class: "bd-section-title" }, "合同内容", -1)),
						createBaseVNode("div", _hoisted_60, [
							createBaseVNode("div", _hoisted_61, [_cache[90] || (_cache[90] = createBaseVNode("span", null, "服务内容", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.contractName || "—"), 1)]),
							createBaseVNode("div", _hoisted_62, [_cache[91] || (_cache[91] = createBaseVNode("span", null, "甲方", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyAName || "—"), 1)]),
							createBaseVNode("div", _hoisted_63, [_cache[92] || (_cache[92] = createBaseVNode("span", null, "乙方", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyBName || "—"), 1)]),
							createBaseVNode("div", _hoisted_64, [_cache[93] || (_cache[93] = createBaseVNode("span", null, "服务期限", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.startDate) + " 至 " + toDisplayString(detailDrawer.data.endDate), 1)]),
							createBaseVNode("div", _hoisted_65, [_cache[94] || (_cache[94] = createBaseVNode("span", null, "备注", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.remark || "暂无备注"), 1)])
						]),
						_cache[110] || (_cache[110] = createBaseVNode("div", { class: "bd-section-title section-gap" }, "签署信息", -1)),
						createBaseVNode("div", _hoisted_66, [
							createBaseVNode("div", _hoisted_67, [
								_cache[95] || (_cache[95] = createBaseVNode("span", null, "甲方签署", -1)),
								createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyASigner || "待签署"), 1),
								createBaseVNode("small", null, toDisplayString(detailDrawer.data.partyASignTime || "—"), 1)
							]),
							createBaseVNode("div", _hoisted_68, [
								_cache[96] || (_cache[96] = createBaseVNode("span", null, "送签登记", -1)),
								createBaseVNode("b", null, toDisplayString(detailDrawer.data.partyBSignTime ? signMethodLabel(detailDrawer.data.signMethod) : "未登记"), 1),
								createBaseVNode("small", null, toDisplayString(detailDrawer.data.partyBSignTime || "—"), 1)
							]),
							createBaseVNode("div", _hoisted_69, [
								_cache[97] || (_cache[97] = createBaseVNode("span", null, "附件记录", -1)),
								createBaseVNode("b", null, toDisplayString(detailDrawer.data.contractFileUrl ? "已有附件字段" : "未记录附件"), 1),
								_cache[98] || (_cache[98] = createBaseVNode("small", null, "当前页面未接入鉴权下载", -1))
							])
						]),
						_cache[111] || (_cache[111] = createBaseVNode("div", { class: "bd-section-title section-gap" }, "到期管理", -1)),
						createBaseVNode("div", _hoisted_70, [
							createBaseVNode("div", _hoisted_71, [_cache[99] || (_cache[99] = createBaseVNode("span", null, "开始日", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.startDate), 1)]),
							createBaseVNode("div", _hoisted_72, [_cache[100] || (_cache[100] = createBaseVNode("span", null, "到期日", -1)), createBaseVNode("b", null, toDisplayString(detailDrawer.data.endDate), 1)]),
							createBaseVNode("div", _hoisted_73, [_cache[101] || (_cache[101] = createBaseVNode("span", null, "剩余时间", -1)), createBaseVNode("b", { class: normalizeClass(daysClass(daysLeft(detailDrawer.data))) }, toDisplayString(formatDays(daysLeft(detailDrawer.data))), 3)])
						]),
						historyVersions.value.length > 1 ? (openBlock(), createElementBlock("div", _hoisted_74, " 合同版本历史 (" + toDisplayString(historyVersions.value.length) + ") ", 1)) : createCommentVNode("", true),
						historyVersions.value.length > 1 ? (openBlock(), createElementBlock("ol", _hoisted_75, [(openBlock(true), createElementBlock(Fragment, null, renderList(historyVersions.value, (v) => {
							return openBlock(), createElementBlock("li", {
								key: v.id,
								class: normalizeClass({ current: v.id === detailDrawer.data.id })
							}, [
								createBaseVNode("span", null, "v" + toDisplayString(v.version || 1), 1),
								createBaseVNode("b", null, toDisplayString(v.contractNo), 1),
								createBaseVNode("em", null, toDisplayString(v.contractName), 1),
								createBaseVNode("strong", null, "¥ " + toDisplayString(formatMoney(v.contractAmount)), 1),
								createBaseVNode("small", null, toDisplayString(v.startDate) + " 至 " + toDisplayString(v.endDate), 1),
								v.id !== detailDrawer.data.id ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "primary",
									onClick: ($event) => openDetail(v)
								}, {
									default: withCtx(() => [..._cache[102] || (_cache[102] = [createTextVNode("查看", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)
							], 2);
						}), 128))])) : createCommentVNode("", true)
					]),
					_: 1
				}, 8, [
					"modelValue",
					"title",
					"subtitle",
					"avatar",
					"avatar-class",
					"status-text",
					"status-type"
				])) : createCommentVNode("", true),
				createVNode(_component_el_dialog, {
					modelValue: tplDialog.visible,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => tplDialog.visible = $event),
					title: "合同模板管理",
					width: "900px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => tplDialog.visible = false) }, {
						default: withCtx(() => [..._cache[116] || (_cache[116] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_78, [createBaseVNode("span", _hoisted_79, "合同模板库 · 共 " + toDisplayString(templates.value.length) + " 项", 1), createVNode(_component_el_button, {
							type: "primary",
							size: "small",
							onClick: _cache[20] || (_cache[20] = ($event) => openTplForm())
						}, {
							default: withCtx(() => [..._cache[112] || (_cache[112] = [createTextVNode("＋ 新建模板", -1)])]),
							_: 1
						})]),
						createVNode(_component_el_table, {
							data: templates.value,
							class: "ct-table",
							stripe: ""
						}, {
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									prop: "templateName",
									label: "模板名称",
									"min-width": "180"
								}),
								createVNode(_component_el_table_column, {
									label: "适用服务类型",
									width: "140"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(serviceTypeLabel(row.serviceType)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "变量数",
									width: "90",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_80, toDisplayString(countTplVars(row)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "状态",
									width: "90"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										type: row.enabled ? "success" : "info",
										effect: "plain",
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "启用" : "停用"), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									prop: "version",
									label: "版本",
									width: "90"
								}),
								createVNode(_component_el_table_column, {
									prop: "updateTime",
									label: "最后更新",
									width: "160"
								}),
								createVNode(_component_el_table_column, {
									label: "操作",
									width: "170",
									fixed: "right"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_button, {
										link: "",
										type: "primary",
										onClick: ($event) => openTplForm(row)
									}, {
										default: withCtx(() => [..._cache[113] || (_cache[113] = [createTextVNode("编辑", -1)])]),
										_: 1
									}, 8, ["onClick"]), createVNode(_component_el_button, {
										link: "",
										type: row.enabled ? "warning" : "success",
										onClick: ($event) => toggleTpl(row)
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(row.enabled ? "停用" : "启用"), 1)]),
										_: 2
									}, 1032, ["type", "onClick"])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["data"]),
						createVNode(_component_el_dialog, {
							modelValue: tplFormDialog.visible,
							"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => tplFormDialog.visible = $event),
							title: tplFormDialog.id ? "编辑模板" : "新建模板",
							width: "640px",
							"append-to-body": "",
							"destroy-on-close": ""
						}, {
							footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[26] || (_cache[26] = ($event) => tplFormDialog.visible = false) }, {
								default: withCtx(() => [..._cache[114] || (_cache[114] = [createTextVNode("取消", -1)])]),
								_: 1
							}), createVNode(_component_el_button, {
								type: "primary",
								onClick: submitTplForm
							}, {
								default: withCtx(() => [..._cache[115] || (_cache[115] = [createTextVNode("保存", -1)])]),
								_: 1
							})]),
							default: withCtx(() => [createVNode(_component_el_form, {
								model: tplForm,
								"label-width": "120px"
							}, {
								default: withCtx(() => [
									createVNode(_component_el_form_item, { label: "模板名称" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: tplForm.templateName,
											"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => tplForm.templateName = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "适用服务类型" }, {
										default: withCtx(() => [createVNode(_component_el_select, {
											modelValue: tplForm.serviceType,
											"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => tplForm.serviceType = $event),
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(serviceTypeOptions, (s) => {
												return createVNode(_component_el_option, {
													key: s.value,
													label: s.label,
													value: s.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "模板内容" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: tplForm.templateContent,
											"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => tplForm.templateContent = $event),
											type: "textarea",
											rows: 8,
											placeholder: "支持模板变量插入"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "可用变量" }, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_81, [(openBlock(), createElementBlock(Fragment, null, renderList(tplVariables, (v) => {
											return createBaseVNode("span", {
												class: "var-chip",
												key: v
											}, "$" + toDisplayString("{") + toDisplayString(v) + toDisplayString("}"), 1);
										}), 64))])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "排序号" }, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: tplForm.version,
											"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => tplForm.version = $event),
											placeholder: "如 v1.0"
										}, null, 8, ["modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_form_item, { label: "启用" }, {
										default: withCtx(() => [createVNode(_component_el_switch, {
											modelValue: tplForm.enabled,
											"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => tplForm.enabled = $event)
										}, null, 8, ["modelValue"])]),
										_: 1
									})
								]),
								_: 1
							}, 8, ["model"])]),
							_: 1
						}, 8, ["modelValue", "title"])
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: renewDialog.visible,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => renewDialog.visible = $event),
					title: "续签合同",
					width: "560px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[35] || (_cache[35] = ($event) => renewDialog.visible = false) }, {
						default: withCtx(() => [..._cache[118] || (_cache[118] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitRenew
					}, {
						default: withCtx(() => [..._cache[119] || (_cache[119] = [createTextVNode("生成续签合同", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "info",
						"show-icon": "",
						closable: false,
						title: "续签后原合同将标记为「已续签」，新合同以草稿状态生成并保留版本号关联",
						style: { "margin-bottom": "14px" }
					}), createVNode(_component_el_form, {
						model: renewDialog.form,
						"label-width": "120px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "原合同编号" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									"model-value": renewDialog.form.oldNo,
									readonly: ""
								}, null, 8, ["model-value"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "新合同金额" }, {
								default: withCtx(() => [createVNode(_component_el_input_number, {
									modelValue: renewDialog.form.contractAmount,
									"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => renewDialog.form.contractAmount = $event),
									min: 0,
									precision: 2,
									"controls-position": "right",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "服务期限" }, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_82, [
									createVNode(_component_el_date_picker, {
										modelValue: renewDialog.form.startDate,
										"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => renewDialog.form.startDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "flex": "1" }
									}, null, 8, ["modelValue"]),
									_cache[117] || (_cache[117] = createBaseVNode("span", { class: "range-arrow" }, "→", -1)),
									createVNode(_component_el_date_picker, {
										modelValue: renewDialog.form.endDate,
										"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => renewDialog.form.endDate = $event),
										type: "date",
										"value-format": "YYYY-MM-DD",
										style: { "flex": "1" }
									}, null, 8, ["modelValue"])
								])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "调整服务内容" }, {
								default: withCtx(() => [createVNode(_component_el_switch, {
									modelValue: renewDialog.form.adjustService,
									"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => renewDialog.form.adjustService = $event)
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							renewDialog.form.adjustService ? (openBlock(), createBlock(_component_el_form_item, {
								key: 0,
								label: "新服务内容"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: renewDialog.form.serviceContent,
									"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => renewDialog.form.serviceContent = $event),
									type: "textarea",
									rows: 3,
									placeholder: "请说明续签后服务内容的调整点"
								}, null, 8, ["modelValue"])]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: termDialog.visible,
					"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => termDialog.visible = $event),
					title: "终止合同",
					width: "500px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[38] || (_cache[38] = ($event) => termDialog.visible = false) }, {
						default: withCtx(() => [..._cache[120] || (_cache[120] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						onClick: submitTerminate
					}, {
						default: withCtx(() => [..._cache[121] || (_cache[121] = [createTextVNode("确认终止", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_alert, {
						type: "warning",
						"show-icon": "",
						closable: false,
						title: "终止后该合同将不可恢复，关联进行中任务建议同步取消"
					}), createVNode(_component_el_form, {
						model: termDialog.form,
						"label-width": "100px",
						style: { "margin-top": "16px" }
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, { label: "终止原因" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: termDialog.form.reason,
								"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => termDialog.form.reason = $event),
								type: "textarea",
								rows: 4,
								placeholder: "请说明终止原因（必填）"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: stageDialog.visible,
					"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => stageDialog.visible = $event),
					title: "阶梯处理记录",
					width: "520px",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[43] || (_cache[43] = ($event) => stageDialog.visible = false) }, {
						default: withCtx(() => [..._cache[124] || (_cache[124] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitStage
					}, {
						default: withCtx(() => [..._cache[125] || (_cache[125] = [createTextVNode("保存处理记录", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_83, [createBaseVNode("span", _hoisted_84, toDisplayString(stageDialog.form.stage === 0 ? "到期当天" : stageDialog.form.stage + " 天阶梯"), 1), createBaseVNode("span", _hoisted_85, toDisplayString(stageDef(stageDialog.form.stage).action), 1)]), createVNode(_component_el_form, {
						model: stageDialog.form,
						"label-width": "100px",
						style: { "margin-top": "12px" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "处理人" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: stageDialog.form.handler,
									"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => stageDialog.form.handler = $event),
									maxlength: "50",
									placeholder: "请输入实际处理人姓名"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "处理状态" }, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: stageDialog.form.status,
									"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => stageDialog.form.status = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_button, { label: "done" }, {
										default: withCtx(() => [..._cache[122] || (_cache[122] = [createTextVNode("已处理", -1)])]),
										_: 1
									}), createVNode(_component_el_radio_button, { label: "overdue" }, {
										default: withCtx(() => [..._cache[123] || (_cache[123] = [createTextVNode("已过期", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "处理备注" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: stageDialog.form.note,
									"onUpdate:modelValue": _cache[42] || (_cache[42] = ($event) => stageDialog.form.note = $event),
									type: "textarea",
									rows: 3,
									placeholder: "记录本阶梯的客户反馈与后续动作"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-9b55a81c"]]);
//#endregion
export { contract_default as default };

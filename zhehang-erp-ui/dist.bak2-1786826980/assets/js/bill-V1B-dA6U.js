import { $ as createCommentVNode, At as resolveDirective, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, rt as createStaticVNode, st as defineComponent, yt as onBeforeUnmount } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, D as ElPagination, F as ElEmpty, It as circle_close_default, J as ElCol, Ln as promotion_default, M as ElInputNumber, Nn as plus_default, Pt as circle_check_default, Qn as stamp_default, Qt as document_default, Rt as circle_plus_default, Sn as money_default, Un as search_default, V as ElDialog, W as ElDatePicker, Xt as delete_default, Y as ElRow, _ as ElTableColumn, _r as wallet_default, _t as ElFormItem, a as ElMessageBox, b as ElSteps, dr as upload_filled_default, fn as info_filled_default, g as ElTable, gt as ElForm, h as ElTabs, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, rn as files_default, rt as ElSelect, s as vLoading, y as ElStep, yr as warning_default, yt as ElIcon, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as customerApi } from "./crm-DKTvHmZR.js";
import { a as orderApi, i as isOverdue, n as approvalLevelLabel, r as calcApprovalLevel, t as approvalLevelChain } from "./order-BHZ2ZADL.js";
import { t as BusinessDetailDrawer_default } from "./BusinessDetailDrawer-t9PlYR5q.js";
//#region src/views/order/bill.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "order-bill" };
var _hoisted_2 = { class: "page-header" };
var _hoisted_3 = { class: "header-meta" };
var _hoisted_4 = { class: "meta-time" };
var _hoisted_5 = { class: "header-actions" };
var _hoisted_6 = { class: "stat-row" };
var _hoisted_7 = ["onClick"];
var _hoisted_8 = { class: "stat-index" };
var _hoisted_9 = { class: "stat-icon" };
var _hoisted_10 = { class: "stat-num" };
var _hoisted_11 = { class: "stat-label" };
var _hoisted_12 = { class: "tab-strip" };
var _hoisted_13 = { class: "tab-label" };
var _hoisted_14 = { class: "tab-badge" };
var _hoisted_15 = { class: "tab-search" };
var _hoisted_16 = { class: "table-wrap" };
var _hoisted_17 = { class: "order-no" };
var _hoisted_18 = { class: "cell-customer" };
var _hoisted_19 = { class: "customer-name" };
var _hoisted_20 = { class: "customer-id" };
var _hoisted_21 = { class: "service-summary" };
var _hoisted_22 = {
	key: 0,
	class: "more-count"
};
var _hoisted_23 = { class: "amount-cell" };
var _hoisted_24 = { class: "amount-value" };
var _hoisted_25 = {
	key: 0,
	class: "amount-origin"
};
var _hoisted_26 = { class: "status-stack" };
var _hoisted_27 = { class: "level-cell" };
var _hoisted_28 = { class: "level-chain" };
var _hoisted_29 = { class: "deadline-time" };
var _hoisted_30 = { class: "deadline-remain" };
var _hoisted_31 = {
	key: 1,
	class: "deadline-muted"
};
var _hoisted_32 = { class: "action-cell" };
var _hoisted_33 = { class: "pagination-wrap" };
var _hoisted_34 = { class: "form-tip" };
var _hoisted_35 = { class: "form-section" };
var _hoisted_36 = { class: "form-section" };
var _hoisted_37 = { class: "section-head" };
var _hoisted_38 = { class: "cell-final" };
var _hoisted_39 = { class: "items-summary-bar" };
var _hoisted_40 = { class: "sum-chip" };
var _hoisted_41 = { class: "sum-chip" };
var _hoisted_42 = { class: "sum-chip emph" };
var _hoisted_43 = { class: "sum-chip emph" };
var _hoisted_44 = {
	key: 0,
	class: "sum-chip"
};
var _hoisted_45 = { class: "form-section split-section" };
var _hoisted_46 = { class: "split-col" };
var _hoisted_47 = { class: "split-col" };
var _hoisted_48 = { class: "form-section" };
var _hoisted_49 = { class: "upload-placeholder" };
var _hoisted_50 = { class: "dialog-footer" };
var _hoisted_51 = {
	key: 0,
	class: "approve-summary"
};
var _hoisted_52 = { class: "summary-row" };
var _hoisted_53 = { class: "val" };
var _hoisted_54 = { class: "val" };
var _hoisted_55 = { class: "summary-row" };
var _hoisted_56 = { class: "val price" };
var _hoisted_57 = { class: "val" };
var _hoisted_58 = { class: "summary-row" };
var _hoisted_59 = { class: "val" };
var _hoisted_60 = { class: "chain-inline" };
var _hoisted_61 = { class: "summary-row" };
var _hoisted_62 = { class: "val" };
var _hoisted_63 = { class: "approve-tip" };
var _hoisted_64 = { class: "dialog-footer" };
var _hoisted_65 = { class: "reject-tip" };
var _hoisted_66 = { class: "dialog-footer" };
var _hoisted_67 = {
	key: 0,
	class: "order-overdue-pill"
};
var _hoisted_68 = { class: "bd-kv-grid" };
var _hoisted_69 = { class: "bd-kv" };
var _hoisted_70 = { class: "bd-kv" };
var _hoisted_71 = { class: "bd-kv" };
var _hoisted_72 = { class: "bd-kv" };
var _hoisted_73 = { class: "bd-kv" };
var _hoisted_74 = { class: "bd-kv" };
var _hoisted_75 = { class: "bd-kv" };
var _hoisted_76 = { class: "bd-kv" };
var _hoisted_77 = { class: "bd-kv" };
var _hoisted_78 = { class: "bd-kv" };
var _hoisted_79 = { class: "order-flow-card" };
var _hoisted_80 = { class: "order-flow-head" };
var _hoisted_81 = {
	key: 0,
	class: "order-reject-note"
};
var _hoisted_82 = { key: 0 };
var _hoisted_83 = { class: "bd-section-title section-gap" };
var _hoisted_84 = { class: "order-agreement-box" };
var _hoisted_85 = { class: "bd-timeline-item" };
var _hoisted_86 = {
	key: 0,
	class: "bd-timeline-item"
};
var _hoisted_87 = {
	key: 1,
	class: "bd-timeline-item"
};
var _hoisted_88 = {
	key: 2,
	class: "bd-timeline-item"
};
var _hoisted_89 = { class: "order-footer-summary" };
//#endregion
//#region src/views/order/bill.vue
var bill_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "bill",
	setup(__props) {
		const route = useRoute();
		const now = ref(Date.now());
		let tickerId = null;
		const currentDate = (() => {
			const d = /* @__PURE__ */ new Date();
			return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
		})();
		const serviceTypeOptions = [
			{
				value: "bookkeeping",
				label: "代理记账"
			},
			{
				value: "registration",
				label: "工商注册"
			},
			{
				value: "tax_planning",
				label: "税务筹划"
			},
			{
				value: "qualification",
				label: "资质代办"
			},
			{
				value: "audit",
				label: "审计报告"
			},
			{
				value: "cancellation",
				label: "注销公司"
			},
			{
				value: "other",
				label: "其他"
			}
		];
		const servicePeriodOptions = [
			{
				value: "1month",
				label: "1 个月"
			},
			{
				value: "3month",
				label: "3 个月"
			},
			{
				value: "6month",
				label: "6 个月"
			},
			{
				value: "1year",
				label: "1 年"
			},
			{
				value: "2year",
				label: "2 年"
			},
			{
				value: "3year",
				label: "3 年"
			},
			{
				value: "one_time",
				label: "一次性"
			}
		];
		const paymentMethodOptions = [
			{
				value: "lump_sum",
				label: "一次性付清"
			},
			{
				value: "monthly",
				label: "按月付款"
			},
			{
				value: "quarterly",
				label: "按季付款"
			},
			{
				value: "semi_annual",
				label: "半年付款"
			},
			{
				value: "annual",
				label: "按年付款"
			},
			{
				value: "installment",
				label: "分期付款"
			}
		];
		const confirmMethodOptions = [
			{
				value: "wechat",
				label: "微信确认"
			},
			{
				value: "phone",
				label: "电话确认"
			},
			{
				value: "meeting",
				label: "面谈确认"
			},
			{
				value: "email",
				label: "邮件确认"
			}
		];
		const itemStatusOptions = [
			{
				value: "pending",
				label: "待执行"
			},
			{
				value: "in_progress",
				label: "执行中"
			},
			{
				value: "completed",
				label: "已完成"
			},
			{
				value: "paused",
				label: "已暂停"
			}
		];
		function itemStatusLabel(v) {
			var _itemStatusOptions$fi;
			return ((_itemStatusOptions$fi = itemStatusOptions.find((o) => o.value === v)) === null || _itemStatusOptions$fi === void 0 ? void 0 : _itemStatusOptions$fi.label) || v;
		}
		function itemStatusType(v) {
			return {
				pending: "info",
				in_progress: "warning",
				completed: "success",
				paused: "danger"
			}[v] || "info";
		}
		const statusTabs = [
			{
				key: "",
				label: "全部"
			},
			{
				key: "draft",
				label: "草稿"
			},
			{
				key: "pending_approval",
				label: "待主管审批"
			},
			{
				key: "pending_finance",
				label: "待财务确认"
			},
			{
				key: "completed",
				label: "已完成"
			},
			{
				key: "rejected",
				label: "已驳回"
			},
			{
				key: "cancelled",
				label: "已取消"
			},
			{
				key: "overdue",
				label: "审批超期"
			}
		];
		const customerOptions = ref([]);
		function loadCustomerOptions() {
			return _loadCustomerOptions.apply(this, arguments);
		}
		function _loadCustomerOptions() {
			_loadCustomerOptions = _asyncToGenerator(function* () {
				try {
					var _res$data, _res$data2;
					const res = yield customerApi.list({
						pageNum: 1,
						pageSize: 200
					});
					customerOptions.value = ((res === null || res === void 0 || (_res$data = res.data) === null || _res$data === void 0 ? void 0 : _res$data.records) || (res === null || res === void 0 || (_res$data2 = res.data) === null || _res$data2 === void 0 ? void 0 : _res$data2.list) || (res === null || res === void 0 ? void 0 : res.records) || (Array.isArray(res === null || res === void 0 ? void 0 : res.data) ? res.data : Array.isArray(res) ? res : [])).map((c) => ({
						id: Number(c.id),
						name: c.name || c.customerName || c.companyName || c.enterpriseName || "",
						contact: c.contact || c.contactName || c.linkman || c.bossName || "",
						phone: c.phone || c.mobile || c.contactPhone || ""
					})).filter((c) => c.id && c.name);
				} catch (_unused) {
					customerOptions.value = [];
					ElMessage.error("客户列表加载失败,请检查网络或重新登录");
				}
			});
			return _loadCustomerOptions.apply(this, arguments);
		}
		const loading = ref(false);
		const tableData = ref([]);
		const stats = ref({
			totalCount: 0,
			draftCount: 0,
			pendingApprovalCount: 0,
			pendingFinanceCount: 0,
			pendingBossCount: 0,
			rejectedCount: 0,
			completedCount: 0,
			cancelledCount: 0,
			overdueCount: 0,
			totalAmount: 0,
			finalAmount: 0,
			monthAmount: 0
		});
		const activeTab = ref("");
		const searchForm = reactive({
			orderNo: "",
			dateRange: null
		});
		const page = reactive({
			current: 1,
			size: 10,
			total: 0
		});
		const statCards = computed(() => [
			{
				key: "draft",
				label: "草稿",
				value: stats.value.draftCount,
				theme: "theme-info",
				icon: files_default
			},
			{
				key: "pending_approval",
				label: "待审批",
				value: stats.value.pendingApprovalCount,
				theme: "theme-warning",
				icon: stamp_default
			},
			{
				key: "pending_finance",
				label: "待财务确认",
				value: stats.value.pendingFinanceCount,
				theme: "theme-primary",
				icon: wallet_default
			},
			{
				key: "overdue",
				label: "审批超期",
				value: stats.value.overdueCount,
				theme: "theme-danger",
				icon: clock_default
			},
			{
				key: "completed",
				label: "已完成",
				value: stats.value.completedCount,
				theme: "theme-success",
				icon: circle_check_default
			},
			{
				key: "",
				label: "本月成交额",
				value: "¥" + formatAmount(stats.value.monthAmount),
				theme: "theme-gold",
				icon: money_default
			}
		]);
		function changeTab(key) {
			activeTab.value = key;
			applyFilters();
		}
		function applyFilters() {
			page.current = 1;
			loadList();
		}
		function tabCount(key) {
			switch (key) {
				case "": return stats.value.totalCount;
				case "draft": return stats.value.draftCount;
				case "pending_approval": return stats.value.pendingApprovalCount;
				case "pending_finance": return stats.value.pendingFinanceCount;
				case "completed": return stats.value.completedCount;
				case "rejected": return stats.value.rejectedCount;
				case "cancelled": return stats.value.cancelledCount;
				case "overdue": return stats.value.overdueCount;
				default: return 0;
			}
		}
		function loadStats() {
			return _loadStats.apply(this, arguments);
		}
		function _loadStats() {
			_loadStats = _asyncToGenerator(function* () {
				stats.value = yield orderApi.stats();
			});
			return _loadStats.apply(this, arguments);
		}
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _searchForm$dateRange, _searchForm$dateRange2;
					const isOverdueTab = activeTab.value === "overdue";
					const res = yield orderApi.list({
						page: page.current,
						pageSize: page.size,
						status: isOverdueTab ? void 0 : activeTab.value || void 0,
						keyword: searchForm.orderNo || void 0,
						startDate: (_searchForm$dateRange = searchForm.dateRange) === null || _searchForm$dateRange === void 0 ? void 0 : _searchForm$dateRange[0],
						endDate: (_searchForm$dateRange2 = searchForm.dateRange) === null || _searchForm$dateRange2 === void 0 ? void 0 : _searchForm$dateRange2[1],
						overdueOnly: isOverdueTab
					});
					tableData.value = res.list;
					page.total = res.total;
				} finally {
					loading.value = false;
				}
			});
			return _loadList.apply(this, arguments);
		}
		function loadAll() {
			return _loadAll.apply(this, arguments);
		}
		function _loadAll() {
			_loadAll = _asyncToGenerator(function* (showToast = false) {
				yield Promise.all([loadStats(), loadList()]);
				if (showToast) ElMessage.success("数据已刷新");
			});
			return _loadAll.apply(this, arguments);
		}
		function statusLabel(status) {
			return {
				draft: "草稿",
				pending_approval: "待主管审批",
				pending_finance: "待财务确认",
				completed: "已完成",
				rejected: "已驳回",
				cancelled: "已取消"
			}[status] || status;
		}
		function statusType(status) {
			return {
				draft: "info",
				pending_approval: "warning",
				pending_finance: "primary",
				completed: "success",
				rejected: "danger",
				cancelled: "info"
			}[status] || "info";
		}
		function orderAvatarClass(row) {
			if (isOverdueRow(row) || row.status === "rejected") return "danger";
			if (row.status === "completed") return "success";
			if (row.status === "pending_finance") return "warning";
			return "company";
		}
		function statusStep(status) {
			var _draft$pending_approv;
			return (_draft$pending_approv = {
				draft: 0,
				pending_approval: 1,
				pending_finance: 2,
				completed: 3,
				rejected: 1,
				cancelled: 0
			}[status]) !== null && _draft$pending_approv !== void 0 ? _draft$pending_approv : 0;
		}
		function serviceTypeLabel(v) {
			var _serviceTypeOptions$f;
			return ((_serviceTypeOptions$f = serviceTypeOptions.find((o) => o.value === v)) === null || _serviceTypeOptions$f === void 0 ? void 0 : _serviceTypeOptions$f.label) || v;
		}
		function servicePeriodLabel(v) {
			var _servicePeriodOptions;
			return ((_servicePeriodOptions = servicePeriodOptions.find((o) => o.value === v)) === null || _servicePeriodOptions === void 0 ? void 0 : _servicePeriodOptions.label) || v;
		}
		function paymentMethodLabel(v) {
			var _paymentMethodOptions;
			return ((_paymentMethodOptions = paymentMethodOptions.find((o) => o.value === v)) === null || _paymentMethodOptions === void 0 ? void 0 : _paymentMethodOptions.label) || v;
		}
		function confirmMethodLabel(v) {
			var _confirmMethodOptions;
			return ((_confirmMethodOptions = confirmMethodOptions.find((o) => o.value === v)) === null || _confirmMethodOptions === void 0 ? void 0 : _confirmMethodOptions.label) || v;
		}
		function formatAmount(n) {
			return (n || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 0,
				maximumFractionDigits: 2
			});
		}
		function rowClassName({ row }) {
			if (isOverdue(row)) return "row-overdue";
			if (row.status === "rejected") return "row-rejected";
			if (row.status === "completed") return "row-completed";
			return "";
		}
		function canCancel(status) {
			return status !== "completed" && status !== "cancelled";
		}
		function approvalLevelOf(row) {
			return row.approvalLevel || calcApprovalLevel(row.finalAmount);
		}
		function approvalLevelText(row) {
			return approvalLevelLabel(approvalLevelOf(row));
		}
		function approvalChainText(row) {
			return approvalLevelChain(approvalLevelOf(row)).join(" → ");
		}
		function isOverdueRow(row) {
			now.value;
			return isOverdue(row);
		}
		function deadlineRemain(row) {
			if (!row.approvalDeadline) return "—";
			const diff = new Date(row.approvalDeadline.replace(" ", "T")).getTime() - now.value;
			if (diff <= 0) {
				const over = Math.abs(diff);
				return `超期 ${Math.floor(over / 36e5)}h ${Math.floor(over % 36e5 / 6e4)}m`;
			}
			return `还剩 ${Math.floor(diff / 36e5)}h ${Math.floor(diff % 36e5 / 6e4)}m`;
		}
		function deadlineHint(row) {
			if (!row.submitMoment) return "";
			return row.submitMoment === "am" ? "上午提交 · 需当天 18:00 前审完" : "下午提交 · 需次日 12:00 前审完";
		}
		function levelTagType(level) {
			return level <= 1 ? "success" : "warning";
		}
		const formVisible = ref(false);
		const formMode = ref("create");
		const form = reactive({
			orderNo: "",
			customerId: void 0,
			customerName: "",
			submitterName: "当前用户",
			_contact: "",
			_phone: "",
			status: "draft",
			totalAmount: 0,
			discountRate: 100,
			finalAmount: 0,
			depositAmount: 0,
			pendingAmount: 0,
			paymentMethod: "monthly",
			paymentTimeReq: "签约后3日内支付定金",
			commissionRate: 8,
			commissionAmount: 0,
			confirmMethod: "wechat",
			confirmScreenshot: "",
			expectedSignDate: "",
			specialAgreement: "",
			remark: "",
			items: []
		});
		const itemsOriginal = computed(() => form.items.reduce((s, i) => s + (i.amount || 0), 0));
		const totalAmount = computed(() => form.items.reduce((s, i) => s + (i.amount || 0), 0));
		const itemsFinal = computed(() => form.items.reduce((s, i) => s + (i.finalAmount || 0), 0));
		const finalAmount = computed(() => Math.round(itemsFinal.value * (form.discountRate || 100) / 100));
		const pendingAmount = computed(() => Math.max(0, finalAmount.value - (form.depositAmount || 0)));
		const commissionAmount = computed(() => Math.round(finalAmount.value * (form.commissionRate || 0) / 100));
		function itemsSummary({ columns, data }) {
			return columns.map((_col, idx) => {
				if (idx === 0) return "子项合计";
				if (idx === 4) return "¥" + formatAmount(data.reduce((s, r) => s + (r.amount || 0), 0));
				if (idx === 6) return "¥" + formatAmount(data.reduce((s, r) => s + (r.finalAmount || 0), 0));
				return "";
			});
		}
		function resetForm() {
			form.id = void 0;
			form.orderNo = "";
			form.customerId = void 0;
			form.customerName = "";
			form._contact = "";
			form._phone = "";
			form.submitterName = "当前用户";
			form.status = "draft";
			form.discountRate = 100;
			form.depositAmount = 0;
			form.paymentMethod = "monthly";
			form.paymentTimeReq = "签约后3日内支付定金";
			form.commissionRate = 8;
			form.confirmMethod = "wechat";
			form.confirmScreenshot = "";
			form.expectedSignDate = "";
			form.specialAgreement = "";
			form.remark = "";
			form.items = [];
		}
		function openCreateDialog() {
			resetForm();
			formMode.value = "create";
			addItem();
			formVisible.value = true;
		}
		function openEditDialog(row) {
			resetForm();
			formMode.value = "edit";
			Object.assign(form, {
				id: row.id,
				orderNo: row.orderNo,
				customerId: row.customerId,
				customerName: row.customerName || "",
				submitterName: row.submitterName || "当前用户",
				status: row.status,
				discountRate: row.discountRate,
				depositAmount: row.depositAmount,
				paymentMethod: row.paymentMethod,
				paymentTimeReq: row.paymentTimeReq,
				commissionRate: row.commissionRate,
				confirmMethod: row.confirmMethod,
				confirmScreenshot: row.confirmScreenshot,
				expectedSignDate: row.expectedSignDate,
				specialAgreement: row.specialAgreement,
				remark: row.remark,
				items: JSON.parse(JSON.stringify(row.items))
			});
			const c = customerOptions.value.find((x) => x.id === row.customerId);
			if (c) {
				form._contact = c.contact;
				form._phone = c.phone;
			}
			formVisible.value = true;
		}
		function onCustomerChange(id) {
			const c = customerOptions.value.find((x) => x.id === id);
			if (c) {
				form.customerName = c.name;
				form._contact = c.contact;
				form._phone = c.phone;
			}
		}
		function addItem() {
			const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
			form.items.push({
				id: 0,
				itemNo: "",
				orderId: 0,
				serviceType: "bookkeeping",
				servicePeriod: "1year",
				startDate: today,
				endDate: today,
				description: "",
				specialRequirement: "",
				amount: 0,
				discountRate: 100,
				finalAmount: 0,
				itemStatus: "pending"
			});
		}
		function removeItem(idx) {
			if (form.items.length <= 1) {
				ElMessage.warning("至少保留 1 条服务子项");
				return;
			}
			form.items.splice(idx, 1);
		}
		function recalcItem(row) {
			row.finalAmount = Math.round((row.amount || 0) * (row.discountRate || 100) / 100);
		}
		function handleSave(_x) {
			return _handleSave.apply(this, arguments);
		}
		function _handleSave() {
			_handleSave = _asyncToGenerator(function* (action) {
				if (!form.customerId) {
					ElMessage.warning("请选择客户");
					return;
				}
				if (!form.items.length) {
					ElMessage.warning("请至少添加一条服务子项");
					return;
				}
				for (const it of form.items) if (!it.amount || it.amount <= 0) {
					ElMessage.warning("请填写每条子项的金额");
					return;
				}
				form.items.forEach(recalcItem);
				const payload = {
					customerId: form.customerId,
					customerName: form.customerName,
					submitterName: form.submitterName,
					status: "draft",
					discountRate: form.discountRate,
					depositAmount: form.depositAmount,
					paymentMethod: form.paymentMethod,
					paymentTimeReq: form.paymentTimeReq,
					commissionRate: form.commissionRate,
					confirmMethod: form.confirmMethod,
					confirmScreenshot: form.confirmScreenshot,
					expectedSignDate: form.expectedSignDate,
					specialAgreement: form.specialAgreement,
					remark: form.remark,
					items: form.items
				};
				let saved;
				if (formMode.value === "create") saved = yield orderApi.create(payload);
				else if (form.id) saved = yield orderApi.update(_objectSpread2({ id: form.id }, payload));
				else return;
				if (action === "submit") {
					yield orderApi.submit(saved.id);
					ElMessage.success("已提交主管审批");
				} else ElMessage.success("草稿已保存");
				formVisible.value = false;
				yield loadAll();
			});
			return _handleSave.apply(this, arguments);
		}
		function handleSubmit(_x2) {
			return _handleSubmit.apply(this, arguments);
		}
		function _handleSubmit() {
			_handleSubmit = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确认将订单【${row.orderNo}】提交审批？`, "提交审批", { type: "warning" });
				yield orderApi.submit(row.id);
				ElMessage.success("提交成功");
				yield loadAll();
			});
			return _handleSubmit.apply(this, arguments);
		}
		function handleCancel(_x3) {
			return _handleCancel.apply(this, arguments);
		}
		function _handleCancel() {
			_handleCancel = _asyncToGenerator(function* (row) {
				try {
					const { value } = yield ElMessageBox.prompt(`请填写取消原因`, `取消订单 · ${row.orderNo}`, {
						confirmButtonText: "确认取消",
						cancelButtonText: "关闭",
						inputType: "textarea",
						inputPlaceholder: "请输入取消原因（必填）",
						inputValidator: (v) => !!v || "取消原因不能为空"
					});
					yield orderApi.cancel(row.id, value);
					ElMessage.success("订单已取消");
					yield loadAll();
				} catch (_unused2) {}
			});
			return _handleCancel.apply(this, arguments);
		}
		const approveVisible = ref(false);
		const approveMode = ref("manager");
		const approveTarget = ref(null);
		const approveOpinion = ref("");
		const rejectVisible = ref(false);
		const rejectStage = ref("manager");
		const rejectReasonType = ref("");
		const rejectReasonText = ref("");
		const MANAGER_REASONS = [
			{
				value: "价格过低",
				label: "价格过低"
			},
			{
				value: "服务内容不清晰",
				label: "服务内容不清晰"
			},
			{
				value: "客户资质不符",
				label: "客户资质不符"
			},
			{
				value: "折扣超限",
				label: "折扣超限"
			},
			{
				value: "其他",
				label: "其他（自定义）"
			}
		];
		const FINANCE_REASONS = [
			{
				value: "金额计算错误",
				label: "金额计算错误"
			},
			{
				value: "付款方式不合规",
				label: "付款方式不合规"
			},
			{
				value: "折扣超限",
				label: "折扣超限"
			},
			{
				value: "其他",
				label: "其他（自定义）"
			}
		];
		const rejectReasonOptions = computed(() => {
			return rejectStage.value === "manager" ? MANAGER_REASONS : FINANCE_REASONS;
		});
		const approveDialogTitle = computed(() => {
			var _approveTarget$value;
			const no = ((_approveTarget$value = approveTarget.value) === null || _approveTarget$value === void 0 ? void 0 : _approveTarget$value.orderNo) || "";
			if (approveMode.value === "manager") return `主管审批 · ${no}`;
			return `财务确认 · ${no}`;
		});
		const approveButtonText = computed(() => {
			if (approveMode.value === "manager") return "主管通过";
			return "财务确认";
		});
		const rejectDialogTitle = computed(() => {
			var _approveTarget$value2;
			return `${rejectStage.value === "manager" ? "主管" : "财务"}驳回 · ${((_approveTarget$value2 = approveTarget.value) === null || _approveTarget$value2 === void 0 ? void 0 : _approveTarget$value2.orderNo) || ""}`;
		});
		function openApprove(row) {
			approveTarget.value = row;
			approveMode.value = "manager";
			approveOpinion.value = "";
			approveVisible.value = true;
		}
		function openFinance(row) {
			approveTarget.value = row;
			approveMode.value = "finance";
			approveOpinion.value = "";
			approveVisible.value = true;
		}
		function handleApprove() {
			return _handleApprove.apply(this, arguments);
		}
		function _handleApprove() {
			_handleApprove = _asyncToGenerator(function* () {
				if (!approveTarget.value) return;
				const t = approveTarget.value;
				if (approveMode.value === "manager") {
					yield orderApi.approve({
						id: t.id,
						opinion: approveOpinion.value || "主管审批通过"
					});
					if (approvalLevelOf(t) === 1) ElMessage.success("订单已完成，合同草稿已自动生成");
					else ElMessage.success(`主管审批通过·流转下一节点`);
				} else {
					yield orderApi.financeConfirm({
						id: t.id,
						opinion: approveOpinion.value || "财务已确认"
					});
					ElMessage.success("订单已完成，合同草稿已自动生成");
				}
				approveVisible.value = false;
				yield loadAll();
			});
			return _handleApprove.apply(this, arguments);
		}
		function openReject() {
			if (!approveTarget.value) return;
			rejectStage.value = approveMode.value;
			rejectReasonType.value = "";
			rejectReasonText.value = approveOpinion.value || "";
			rejectVisible.value = true;
		}
		function handleReject() {
			return _handleReject.apply(this, arguments);
		}
		function _handleReject() {
			_handleReject = _asyncToGenerator(function* () {
				if (!approveTarget.value) return;
				if (!rejectReasonType.value) {
					ElMessage.warning("请选择驳回原因");
					return;
				}
				const isOther = rejectReasonType.value === "其他";
				const opinion = isOther ? rejectReasonText.value.trim() : rejectReasonText.value.trim() ? `${rejectReasonType.value}・${rejectReasonText.value.trim()}` : rejectReasonType.value;
				if (isOther && !rejectReasonText.value.trim()) {
					ElMessage.warning("选择“其他”时请填写详细驳回说明");
					return;
				}
				yield orderApi.reject({
					id: approveTarget.value.id,
					opinion,
					reasonType: rejectReasonType.value,
					stage: rejectStage.value
				});
				ElMessage.success("已驳回·客户退回原跟进阶段");
				rejectVisible.value = false;
				approveVisible.value = false;
				yield loadAll();
			});
			return _handleReject.apply(this, arguments);
		}
		const detailVisible = ref(false);
		const detailTarget = ref(null);
		function openDetail(_x4) {
			return _openDetail.apply(this, arguments);
		}
		function _openDetail() {
			_openDetail = _asyncToGenerator(function* (row) {
				yield openDetailById(row.id);
			});
			return _openDetail.apply(this, arguments);
		}
		function openDetailById(_x5) {
			return _openDetailById.apply(this, arguments);
		}
		function _openDetailById() {
			_openDetailById = _asyncToGenerator(function* (orderId) {
				const data = yield orderApi.detail(orderId);
				if (!data) return;
				detailTarget.value = data;
				detailVisible.value = true;
			});
			return _openDetailById.apply(this, arguments);
		}
		function resubmitFromDetail() {
			if (!detailTarget.value) return;
			const target = detailTarget.value;
			detailVisible.value = false;
			openEditDialog(target);
		}
		onMounted(_asyncToGenerator(function* () {
			loadCustomerOptions();
			yield loadAll();
			const queryId = Array.isArray(route.query.orderId) ? route.query.orderId[0] : route.query.orderId;
			const deepLinkOrderId = Number(queryId);
			if (Number.isSafeInteger(deepLinkOrderId) && deepLinkOrderId > 0) try {
				yield openDetailById(deepLinkOrderId);
			} catch (_unused3) {
				ElMessage.warning("该提单不存在或您无权查看");
			}
			tickerId = window.setInterval(() => {
				now.value = Date.now();
			}, 3e4);
		}));
		onBeforeUnmount(() => {
			if (tickerId !== null) {
				clearInterval(tickerId);
				tickerId = null;
			}
		});
		return (_ctx, _cache) => {
			const _component_el_button = ElButton;
			const _component_el_icon = ElIcon;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_input = ElInput;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_form = ElForm;
			const _component_el_input_number = ElInputNumber;
			const _component_el_dialog = ElDialog;
			const _component_el_step = ElStep;
			const _component_el_steps = ElSteps;
			const _directive_hasRole = resolveDirective("hasRole");
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [
						_cache[32] || (_cache[32] = createBaseVNode("span", { class: "meta-tag" }, "ORDER OPS", -1)),
						_cache[33] || (_cache[33] = createBaseVNode("span", { class: "meta-divider" }, null, -1)),
						createBaseVNode("span", _hoisted_4, toDisplayString(unref(currentDate)), 1),
						_cache[34] || (_cache[34] = createBaseVNode("span", { class: "meta-divider" }, null, -1)),
						_cache[35] || (_cache[35] = createBaseVNode("span", { class: "meta-time" }, "提单审批台", -1))
					]),
					_cache[38] || (_cache[38] = createStaticVNode("<div class=\"header-main\" data-v-bd8c68ee><h1 class=\"page-title\" data-v-bd8c68ee><span class=\"title-cn\" data-v-bd8c68ee>提单系统</span><span class=\"title-en\" data-v-bd8c68ee>Submission Workflow</span></h1><p class=\"page-desc\" data-v-bd8c68ee>客户成交提单、审批、财务确认与合同生成联动</p></div>", 1)),
					createBaseVNode("div", _hoisted_5, [createVNode(_component_el_button, {
						type: "primary",
						icon: unref(plus_default),
						class: "primary-btn",
						onClick: openCreateDialog
					}, {
						default: withCtx(() => [..._cache[36] || (_cache[36] = [createTextVNode(" 新建订单 ", -1)])]),
						_: 1
					}, 8, ["icon"]), createVNode(_component_el_button, {
						icon: unref(refresh_default),
						plain: "",
						class: "ghost-btn",
						onClick: _cache[0] || (_cache[0] = ($event) => loadAll(true))
					}, {
						default: withCtx(() => [..._cache[37] || (_cache[37] = [createTextVNode(" 刷新 ", -1)])]),
						_: 1
					}, 8, ["icon"])])
				]),
				createBaseVNode("section", _hoisted_6, [(openBlock(true), createElementBlock(Fragment, null, renderList(statCards.value, (s, idx) => {
					return openBlock(), createElementBlock("div", {
						class: normalizeClass(["stat-card", [s.theme, { active: activeTab.value === s.key }]]),
						key: s.key,
						onClick: ($event) => changeTab(s.key)
					}, [
						createBaseVNode("div", _hoisted_8, "0" + toDisplayString(idx + 1), 1),
						createBaseVNode("div", _hoisted_9, [createVNode(_component_el_icon, { size: 18 }, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(s.icon)))]),
							_: 2
						}, 1024)]),
						createBaseVNode("div", _hoisted_10, toDisplayString(s.value), 1),
						createBaseVNode("div", _hoisted_11, toDisplayString(s.label), 1),
						_cache[39] || (_cache[39] = createBaseVNode("div", { class: "stat-bar" }, null, -1))
					], 10, _hoisted_7);
				}), 128))]),
				createBaseVNode("section", _hoisted_12, [createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => activeTab.value = $event),
					class: "status-tabs",
					onTabChange: applyFilters
				}, {
					default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(statusTabs, (t) => {
						return createVNode(_component_el_tab_pane, {
							key: t.key,
							name: t.key
						}, {
							label: withCtx(() => [createBaseVNode("span", _hoisted_13, [createBaseVNode("span", null, toDisplayString(t.label), 1), createBaseVNode("span", _hoisted_14, toDisplayString(tabCount(t.key)), 1)])]),
							_: 2
						}, 1032, ["name"]);
					}), 64))]),
					_: 1
				}, 8, ["modelValue"]), createBaseVNode("div", _hoisted_15, [createVNode(_component_el_input, {
					modelValue: searchForm.orderNo,
					"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => searchForm.orderNo = $event),
					placeholder: "订单编号 / 客户 / 提单人",
					clearable: "",
					"prefix-icon": unref(search_default),
					style: { "width": "280px" },
					onInput: applyFilters,
					onClear: applyFilters
				}, null, 8, ["modelValue", "prefix-icon"]), createVNode(_component_el_date_picker, {
					modelValue: searchForm.dateRange,
					"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => searchForm.dateRange = $event),
					type: "daterange",
					"range-separator": "至",
					"start-placeholder": "开始日期",
					"end-placeholder": "结束日期",
					"value-format": "YYYY-MM-DD",
					style: {
						"width": "240px",
						"margin-left": "12px"
					},
					onChange: applyFilters
				}, null, 8, ["modelValue"])])]),
				createBaseVNode("section", _hoisted_16, [withDirectives((openBlock(), createBlock(_component_el_table, {
					data: tableData.value,
					stripe: "",
					border: "",
					height: "560",
					class: "order-table",
					"row-class-name": rowClassName
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, { description: "暂无订单，点击新建订单开始" })]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "订单编号",
							prop: "orderNo",
							width: "170",
							fixed: "left"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_17, toDisplayString(row.orderNo), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "客户名称",
							prop: "customerName",
							"min-width": "200"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_18, [createBaseVNode("span", _hoisted_19, toDisplayString(row.customerName), 1), createBaseVNode("span", _hoisted_20, "ID · " + toDisplayString(row.customerId), 1)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "服务类型",
							"min-width": "220"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_21, [(openBlock(true), createElementBlock(Fragment, null, renderList(row.items.slice(0, 2), (it) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: it.id,
									size: "small",
									effect: "plain",
									class: "service-tag"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(serviceTypeLabel(it.serviceType)), 1)]),
									_: 2
								}, 1024);
							}), 128)), row.items.length > 2 ? (openBlock(), createElementBlock("span", _hoisted_22, "+" + toDisplayString(row.items.length - 2), 1)) : createCommentVNode("", true)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "折后金额",
							prop: "finalAmount",
							width: "140",
							align: "right"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_23, [createBaseVNode("span", _hoisted_24, "¥" + toDisplayString(formatAmount(row.finalAmount)), 1), row.totalAmount !== row.finalAmount ? (openBlock(), createElementBlock("span", _hoisted_25, " 原价 ¥" + toDisplayString(formatAmount(row.totalAmount)), 1)) : createCommentVNode("", true)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "状态",
							width: "130",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_26, [createVNode(_component_el_tag, {
								type: statusType(row.status),
								effect: "dark",
								class: "status-tag"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"]), isOverdueRow(row) ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								type: "danger",
								effect: "plain",
								size: "small",
								class: "overdue-chip"
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(warning_default))]),
									_: 1
								}), _cache[40] || (_cache[40] = createBaseVNode("span", { class: "chip-text" }, "审批超期", -1))]),
								_: 1
							})) : createCommentVNode("", true)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "审批级别",
							width: "150",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_27, [createVNode(_component_el_tag, {
								type: levelTagType(approvalLevelOf(row)),
								effect: "plain",
								size: "small",
								class: "level-tag"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(approvalLevelText(row)), 1)]),
								_: 2
							}, 1032, ["type"]), createBaseVNode("span", _hoisted_28, toDisplayString(approvalChainText(row)), 1)])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "审批截止",
							width: "170",
							align: "center"
						}, {
							default: withCtx(({ row }) => [row.status === "pending_approval" || row.status === "pending_finance" ? (openBlock(), createElementBlock("div", {
								key: 0,
								class: normalizeClass(["deadline-cell", { "is-overdue": isOverdueRow(row) }])
							}, [createBaseVNode("span", _hoisted_29, toDisplayString(row.approvalDeadline ? row.approvalDeadline.slice(5, 16) : "—"), 1), createBaseVNode("span", _hoisted_30, toDisplayString(deadlineRemain(row)), 1)], 2)) : (openBlock(), createElementBlock("span", _hoisted_31, "—"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "提单人",
							prop: "submitterName",
							width: "110",
							align: "center"
						}),
						createVNode(_component_el_table_column, {
							label: "提交时间",
							prop: "submitTime",
							width: "170"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "260",
							fixed: "right",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_32, [
								createVNode(_component_el_button, {
									link: "",
									type: "primary",
									size: "small",
									onClick: ($event) => openDetail(row)
								}, {
									default: withCtx(() => [..._cache[41] || (_cache[41] = [createTextVNode("详情", -1)])]),
									_: 1
								}, 8, ["onClick"]),
								row.status === "draft" || row.status === "rejected" ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									link: "",
									type: "success",
									size: "small",
									onClick: ($event) => openEditDialog(row)
								}, {
									default: withCtx(() => [..._cache[42] || (_cache[42] = [createTextVNode("编辑", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								row.status === "draft" || row.status === "rejected" ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									link: "",
									type: "warning",
									size: "small",
									onClick: ($event) => handleSubmit(row)
								}, {
									default: withCtx(() => [..._cache[43] || (_cache[43] = [createTextVNode("提交审批", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								row.status === "pending_approval" ? withDirectives((openBlock(), createBlock(_component_el_button, {
									key: 2,
									link: "",
									type: "primary",
									size: "small",
									onClick: ($event) => openApprove(row)
								}, {
									default: withCtx(() => [..._cache[44] || (_cache[44] = [createTextVNode("审批", -1)])]),
									_: 1
								}, 8, ["onClick"])), [[_directive_hasRole, [
									"admin",
									"boss",
									"manager",
									"finance"
								]]]) : createCommentVNode("", true),
								row.status === "pending_finance" ? withDirectives((openBlock(), createBlock(_component_el_button, {
									key: 3,
									link: "",
									type: "primary",
									size: "small",
									onClick: ($event) => openFinance(row)
								}, {
									default: withCtx(() => [..._cache[45] || (_cache[45] = [createTextVNode("财务确认", -1)])]),
									_: 1
								}, 8, ["onClick"])), [[_directive_hasRole, [
									"admin",
									"boss",
									"manager",
									"finance"
								]]]) : createCommentVNode("", true),
								canCancel(row.status) ? withDirectives((openBlock(), createBlock(_component_el_button, {
									key: 4,
									link: "",
									type: "danger",
									size: "small",
									onClick: ($event) => handleCancel(row)
								}, {
									default: withCtx(() => [..._cache[46] || (_cache[46] = [createTextVNode("取消", -1)])]),
									_: 1
								}, 8, ["onClick"])), [[_directive_hasRole, ["admin", "manager"]]]) : createCommentVNode("", true)
							])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]), createBaseVNode("div", _hoisted_33, [createVNode(_component_el_pagination, {
					"current-page": page.current,
					"onUpdate:currentPage": _cache[4] || (_cache[4] = ($event) => page.current = $event),
					"page-size": page.size,
					"onUpdate:pageSize": _cache[5] || (_cache[5] = ($event) => page.size = $event),
					"page-sizes": [
						10,
						20,
						50
					],
					total: page.total,
					layout: "total, sizes, prev, pager, next, jumper",
					background: "",
					onSizeChange: loadList,
					onCurrentChange: loadList
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])]),
				createVNode(_component_el_dialog, {
					modelValue: formVisible.value,
					"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => formVisible.value = $event),
					title: formMode.value === "create" ? "新建订单" : "编辑订单 · " + form.orderNo,
					width: "1100px",
					top: "6vh",
					class: "order-dialog",
					"close-on-click-modal": false,
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createBaseVNode("div", _hoisted_50, [
						createVNode(_component_el_button, { onClick: _cache[19] || (_cache[19] = ($event) => formVisible.value = false) }, {
							default: withCtx(() => [..._cache[68] || (_cache[68] = [createTextVNode("取消", -1)])]),
							_: 1
						}),
						createVNode(_component_el_button, {
							type: "info",
							icon: unref(document_default),
							onClick: _cache[20] || (_cache[20] = ($event) => handleSave("draft"))
						}, {
							default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("保存草稿", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(promotion_default),
							onClick: _cache[21] || (_cache[21] = ($event) => handleSave("submit"))
						}, {
							default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode(" 保存并提交审批 ", -1)])]),
							_: 1
						}, 8, ["icon"])
					])]),
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_34, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(info_filled_default))]),
							_: 1
						}), _cache[47] || (_cache[47] = createBaseVNode("span", null, "提单时效要求：上午 12:00 前提交需当天审批完毕；客户确认截图为必要凭证", -1))]),
						createBaseVNode("div", _hoisted_35, [_cache[48] || (_cache[48] = createBaseVNode("div", { class: "section-head" }, [
							createBaseVNode("span", { class: "section-bar" }),
							createBaseVNode("span", { class: "section-title" }, "客户信息"),
							createBaseVNode("span", { class: "section-en" }, "CUSTOMER")
						], -1)), createVNode(_component_el_form, {
							model: form,
							"label-width": "100px",
							size: "default"
						}, {
							default: withCtx(() => [createVNode(_component_el_row, { gutter: 18 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, {
											label: "选择客户",
											required: ""
										}, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.customerId,
												"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => form.customerId = $event),
												filterable: "",
												placeholder: "搜索客户名称",
												style: { "width": "100%" },
												onChange: onCustomerChange
											}, {
												default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(customerOptions.value, (c) => {
													return openBlock(), createBlock(_component_el_option, {
														key: c.id,
														label: c.name,
														value: c.id
													}, null, 8, ["label", "value"]);
												}), 128))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户名称" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.customerName,
												"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => form.customerName = $event),
												disabled: ""
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form._contact,
												"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => form._contact = $event),
												disabled: "",
												placeholder: "选择客户后自动带出"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "联系电话" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form._phone,
												"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => form._phone = $event),
												disabled: ""
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "提单人" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.submitterName,
												"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => form.submitterName = $event)
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "预计签约" }, {
											default: withCtx(() => [createVNode(_component_el_date_picker, {
												modelValue: form.expectedSignDate,
												"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => form.expectedSignDate = $event),
												type: "date",
												style: { "width": "100%" },
												"value-format": "YYYY-MM-DD"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})]),
							_: 1
						}, 8, ["model"])]),
						createBaseVNode("div", _hoisted_36, [
							createBaseVNode("div", _hoisted_37, [
								_cache[50] || (_cache[50] = createBaseVNode("span", { class: "section-bar" }, null, -1)),
								_cache[51] || (_cache[51] = createBaseVNode("span", { class: "section-title" }, "服务子项", -1)),
								_cache[52] || (_cache[52] = createBaseVNode("span", { class: "section-en" }, "ITEMS", -1)),
								createVNode(_component_el_button, {
									type: "primary",
									link: "",
									icon: unref(circle_plus_default),
									class: "section-action",
									onClick: addItem
								}, {
									default: withCtx(() => [..._cache[49] || (_cache[49] = [createTextVNode("添加子项", -1)])]),
									_: 1
								}, 8, ["icon"])
							]),
							createVNode(_component_el_table, {
								data: form.items,
								border: "",
								size: "small",
								class: "items-table",
								"show-summary": "",
								"summary-method": itemsSummary
							}, {
								default: withCtx(() => [
									createVNode(_component_el_table_column, {
										label: "#",
										type: "index",
										width: "50",
										align: "center"
									}),
									createVNode(_component_el_table_column, {
										label: "服务类型",
										"min-width": "140"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_select, {
											modelValue: row.serviceType,
											"onUpdate:modelValue": ($event) => row.serviceType = $event,
											size: "small",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(serviceTypeOptions, (opt) => {
												return createVNode(_component_el_option, {
													key: opt.value,
													label: opt.label,
													value: opt.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "服务周期",
										"min-width": "120"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_select, {
											modelValue: row.servicePeriod,
											"onUpdate:modelValue": ($event) => row.servicePeriod = $event,
											size: "small",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(servicePeriodOptions, (opt) => {
												return createVNode(_component_el_option, {
													key: opt.value,
													label: opt.label,
													value: opt.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "开始日期",
										width: "150"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_date_picker, {
											modelValue: row.startDate,
											"onUpdate:modelValue": ($event) => row.startDate = $event,
											type: "date",
											size: "small",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "金额",
										width: "130"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
											modelValue: row.amount,
											"onUpdate:modelValue": ($event) => row.amount = $event,
											min: 0,
											step: 100,
											size: "small",
											controls: false,
											style: { "width": "100%" },
											onChange: ($event) => recalcItem(row)
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"onChange"
										])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "折扣%",
										width: "100"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input_number, {
											modelValue: row.discountRate,
											"onUpdate:modelValue": ($event) => row.discountRate = $event,
											min: 0,
											max: 100,
											step: 5,
											size: "small",
											controls: false,
											style: { "width": "100%" },
											onChange: ($event) => recalcItem(row)
										}, null, 8, [
											"modelValue",
											"onUpdate:modelValue",
											"onChange"
										])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "折后金额",
										width: "120"
									}, {
										default: withCtx(({ row }) => [createBaseVNode("span", _hoisted_38, "¥" + toDisplayString(formatAmount(row.finalAmount)), 1)]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "子项状态",
										width: "130"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_select, {
											modelValue: row.itemStatus,
											"onUpdate:modelValue": ($event) => row.itemStatus = $event,
											size: "small",
											style: { "width": "100%" }
										}, {
											default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(itemStatusOptions, (opt) => {
												return createVNode(_component_el_option, {
													key: opt.value,
													label: opt.label,
													value: opt.value
												}, null, 8, ["label", "value"]);
											}), 64))]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "描述",
										"min-width": "160"
									}, {
										default: withCtx(({ row }) => [createVNode(_component_el_input, {
											modelValue: row.description,
											"onUpdate:modelValue": ($event) => row.description = $event,
											size: "small",
											placeholder: "服务说明"
										}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
										_: 1
									}),
									createVNode(_component_el_table_column, {
										label: "操作",
										width: "60",
										align: "center"
									}, {
										default: withCtx(({ $index }) => [createVNode(_component_el_button, {
											link: "",
											type: "danger",
											size: "small",
											onClick: ($event) => removeItem($index)
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
							}, 8, ["data"]),
							createBaseVNode("div", _hoisted_39, [
								createBaseVNode("span", _hoisted_40, [
									_cache[53] || (_cache[53] = createTextVNode("子项合计 · ", -1)),
									createBaseVNode("b", null, toDisplayString(form.items.length), 1),
									_cache[54] || (_cache[54] = createTextVNode(" 项", -1))
								]),
								createBaseVNode("span", _hoisted_41, [_cache[55] || (_cache[55] = createTextVNode("子项原价·", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(itemsOriginal.value)), 1)]),
								createBaseVNode("span", _hoisted_42, [_cache[56] || (_cache[56] = createTextVNode("子项折后·", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(totalAmount.value)), 1)]),
								createBaseVNode("span", _hoisted_43, [createTextVNode("整单折扣 " + toDisplayString(form.discountRate) + "%·", 1), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(finalAmount.value)), 1)]),
								form.items.length ? (openBlock(), createElementBlock("span", _hoisted_44, [_cache[57] || (_cache[57] = createTextVNode(" 预期审批 · ", -1)), createVNode(_component_el_tag, {
									type: levelTagType(unref(calcApprovalLevel)(finalAmount.value)),
									size: "small",
									effect: "plain",
									class: "level-tag"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(unref(approvalLevelLabel)(unref(calcApprovalLevel)(finalAmount.value))), 1)]),
									_: 1
								}, 8, ["type"])])) : createCommentVNode("", true)
							])
						]),
						createBaseVNode("div", _hoisted_45, [createBaseVNode("div", _hoisted_46, [_cache[61] || (_cache[61] = createBaseVNode("div", { class: "section-head" }, [
							createBaseVNode("span", { class: "section-bar" }),
							createBaseVNode("span", { class: "section-title" }, "金额汇总"),
							createBaseVNode("span", { class: "section-en" }, "AMOUNT")
						], -1)), createVNode(_component_el_form, {
							model: form,
							"label-width": "100px",
							size: "default"
						}, {
							default: withCtx(() => [createVNode(_component_el_row, { gutter: 18 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "总金额" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												"model-value": formatAmount(totalAmount.value),
												disabled: ""
											}, {
												prepend: withCtx(() => [..._cache[58] || (_cache[58] = [createTextVNode("¥", -1)])]),
												_: 1
											}, 8, ["model-value"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "整单折扣" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.discountRate,
												"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => form.discountRate = $event),
												min: 0,
												max: 100,
												step: 5,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "折后金额" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												"model-value": formatAmount(finalAmount.value),
												disabled: ""
											}, {
												prepend: withCtx(() => [..._cache[59] || (_cache[59] = [createTextVNode("¥", -1)])]),
												_: 1
											}, 8, ["model-value"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "已收定金" }, {
											default: withCtx(() => [createVNode(_component_el_input_number, {
												modelValue: form.depositAmount,
												"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => form.depositAmount = $event),
												min: 0,
												step: 500,
												style: { "width": "100%" }
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "待收金额" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												"model-value": formatAmount(pendingAmount.value),
												disabled: ""
											}, {
												prepend: withCtx(() => [..._cache[60] || (_cache[60] = [createTextVNode("¥", -1)])]),
												_: 1
											}, 8, ["model-value"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 12 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "付款方式" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.paymentMethod,
												"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => form.paymentMethod = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(paymentMethodOptions, (opt) => {
													return createVNode(_component_el_option, {
														key: opt.value,
														label: opt.label,
														value: opt.value
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
							})]),
							_: 1
						}, 8, ["model"])]), createBaseVNode("div", _hoisted_47, [_cache[65] || (_cache[65] = createBaseVNode("div", { class: "section-head" }, [
							createBaseVNode("span", { class: "section-bar" }),
							createBaseVNode("span", { class: "section-title" }, "提成信息"),
							createBaseVNode("span", { class: "section-en" }, "COMMISSION")
						], -1)), createVNode(_component_el_form, {
							model: form,
							"label-width": "100px",
							size: "default"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_form_item, { label: "提成比例" }, {
									default: withCtx(() => [createVNode(_component_el_input_number, {
										modelValue: form.commissionRate,
										"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => form.commissionRate = $event),
										min: 0,
										max: 50,
										step: 1,
										style: { "width": "100%" }
									}, {
										suffix: withCtx(() => [..._cache[62] || (_cache[62] = [createTextVNode("%", -1)])]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "参考提成" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										"model-value": formatAmount(commissionAmount.value),
										disabled: ""
									}, {
										prepend: withCtx(() => [..._cache[63] || (_cache[63] = [createTextVNode("¥", -1)])]),
										append: withCtx(() => [..._cache[64] || (_cache[64] = [createTextVNode("预估", -1)])]),
										_: 1
									}, 8, ["model-value"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "付款时效" }, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: form.paymentTimeReq,
										"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => form.paymentTimeReq = $event),
										placeholder: "如：签约后3日内支付定金"
									}, null, 8, ["modelValue"])]),
									_: 1
								})
							]),
							_: 1
						}, 8, ["model"])])]),
						createBaseVNode("div", _hoisted_48, [_cache[67] || (_cache[67] = createBaseVNode("div", { class: "section-head" }, [
							createBaseVNode("span", { class: "section-bar" }),
							createBaseVNode("span", { class: "section-title" }, "客户确认"),
							createBaseVNode("span", { class: "section-en" }, "CONFIRMATION")
						], -1)), createVNode(_component_el_form, {
							model: form,
							"label-width": "100px",
							size: "default"
						}, {
							default: withCtx(() => [createVNode(_component_el_row, { gutter: 18 }, {
								default: withCtx(() => [
									createVNode(_component_el_col, { span: 8 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "确认方式" }, {
											default: withCtx(() => [createVNode(_component_el_select, {
												modelValue: form.confirmMethod,
												"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => form.confirmMethod = $event),
												style: { "width": "100%" }
											}, {
												default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(confirmMethodOptions, (opt) => {
													return createVNode(_component_el_option, {
														key: opt.value,
														label: opt.label,
														value: opt.value
													}, null, 8, ["label", "value"]);
												}), 64))]),
												_: 1
											}, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 16 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "确认截图" }, {
											default: withCtx(() => [createBaseVNode("div", _hoisted_49, [createVNode(_component_el_icon, { size: 22 }, {
												default: withCtx(() => [createVNode(unref(upload_filled_default))]),
												_: 1
											}), _cache[66] || (_cache[66] = createBaseVNode("span", null, "点击或拖拽上传客户确认截图", -1))])]),
											_: 1
										})]),
										_: 1
									}),
									createVNode(_component_el_col, { span: 24 }, {
										default: withCtx(() => [createVNode(_component_el_form_item, { label: "特殊约定" }, {
											default: withCtx(() => [createVNode(_component_el_input, {
												modelValue: form.specialAgreement,
												"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => form.specialAgreement = $event),
												type: "textarea",
												rows: 3,
												placeholder: "如客户特殊要求、补充协议、补充说明等"
											}, null, 8, ["modelValue"])]),
											_: 1
										})]),
										_: 1
									})
								]),
								_: 1
							})]),
							_: 1
						}, 8, ["model"])])
					]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: approveVisible.value,
					"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => approveVisible.value = $event),
					title: approveDialogTitle.value,
					width: "680px",
					class: "approve-dialog"
				}, {
					footer: withCtx(() => [createBaseVNode("div", _hoisted_64, [
						createVNode(_component_el_button, { onClick: _cache[24] || (_cache[24] = ($event) => approveVisible.value = false) }, {
							default: withCtx(() => [..._cache[78] || (_cache[78] = [createTextVNode("关闭", -1)])]),
							_: 1
						}),
						withDirectives((openBlock(), createBlock(_component_el_button, {
							type: "danger",
							icon: unref(circle_close_default),
							onClick: openReject
						}, {
							default: withCtx(() => [..._cache[79] || (_cache[79] = [createTextVNode("驳回", -1)])]),
							_: 1
						}, 8, ["icon"])), [[_directive_hasRole, [
							"admin",
							"boss",
							"manager",
							"finance"
						]]]),
						withDirectives((openBlock(), createBlock(_component_el_button, {
							type: "primary",
							icon: unref(circle_check_default),
							onClick: handleApprove
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(approveButtonText.value), 1)]),
							_: 1
						}, 8, ["icon"])), [[_directive_hasRole, [
							"admin",
							"boss",
							"manager",
							"finance"
						]]])
					])]),
					default: withCtx(() => [
						approveTarget.value ? (openBlock(), createElementBlock("div", _hoisted_51, [
							createBaseVNode("div", _hoisted_52, [
								_cache[71] || (_cache[71] = createBaseVNode("span", { class: "lab" }, "客户", -1)),
								createBaseVNode("span", _hoisted_53, toDisplayString(approveTarget.value.customerName), 1),
								_cache[72] || (_cache[72] = createBaseVNode("span", { class: "lab" }, "提单人", -1)),
								createBaseVNode("span", _hoisted_54, toDisplayString(approveTarget.value.submitterName), 1)
							]),
							createBaseVNode("div", _hoisted_55, [
								_cache[73] || (_cache[73] = createBaseVNode("span", { class: "lab" }, "折后金额", -1)),
								createBaseVNode("span", _hoisted_56, "¥" + toDisplayString(formatAmount(approveTarget.value.finalAmount)), 1),
								_cache[74] || (_cache[74] = createBaseVNode("span", { class: "lab" }, "折扣率", -1)),
								createBaseVNode("span", _hoisted_57, toDisplayString(approveTarget.value.discountRate) + "%", 1)
							]),
							createBaseVNode("div", _hoisted_58, [
								_cache[75] || (_cache[75] = createBaseVNode("span", { class: "lab" }, "审批级别", -1)),
								createBaseVNode("span", _hoisted_59, [createVNode(_component_el_tag, {
									type: levelTagType(approvalLevelOf(approveTarget.value)),
									effect: "plain",
									size: "small"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(approvalLevelText(approveTarget.value)), 1)]),
									_: 1
								}, 8, ["type"]), createBaseVNode("span", _hoisted_60, toDisplayString(approvalChainText(approveTarget.value)), 1)]),
								_cache[76] || (_cache[76] = createBaseVNode("span", { class: "lab" }, "审批截止", -1)),
								createBaseVNode("span", { class: normalizeClass(["val", { "val-overdue": isOverdueRow(approveTarget.value) }]) }, toDisplayString(approveTarget.value.approvalDeadline || "—") + " · " + toDisplayString(deadlineRemain(approveTarget.value)), 3)
							]),
							createBaseVNode("div", _hoisted_61, [_cache[77] || (_cache[77] = createBaseVNode("span", { class: "lab" }, "服务子项", -1)), createBaseVNode("span", _hoisted_62, [(openBlock(true), createElementBlock(Fragment, null, renderList(approveTarget.value.items, (it) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: it.id,
									size: "small",
									effect: "plain",
									class: "summary-tag"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(serviceTypeLabel(it.serviceType)) + " · ¥" + toDisplayString(formatAmount(it.finalAmount)), 1)]),
									_: 2
								}, 1024);
							}), 128))])])
						])) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_63, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(clock_default))]),
							_: 1
						}), createBaseVNode("span", null, "审批时效：" + toDisplayString(approveTarget.value ? deadlineHint(approveTarget.value) || "上午提交当天完·下午提交次日 12:00 前" : "上午提交当天完·下午提交次日 12:00 前"), 1)]),
						createVNode(_component_el_form, { "label-width": "80px" }, {
							default: withCtx(() => [createVNode(_component_el_form_item, { label: "审批意见" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: approveOpinion.value,
									"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => approveOpinion.value = $event),
									type: "textarea",
									rows: 4,
									placeholder: "请输入审批意见"
								}, null, 8, ["modelValue"])]),
								_: 1
							})]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: rejectVisible.value,
					"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => rejectVisible.value = $event),
					title: rejectDialogTitle.value,
					width: "560px",
					class: "reject-dialog",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createBaseVNode("div", _hoisted_66, [createVNode(_component_el_button, { onClick: _cache[28] || (_cache[28] = ($event) => rejectVisible.value = false) }, {
						default: withCtx(() => [..._cache[81] || (_cache[81] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						icon: unref(circle_close_default),
						onClick: handleReject
					}, {
						default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("确认驳回", -1)])]),
						_: 1
					}, 8, ["icon"])])]),
					default: withCtx(() => [createBaseVNode("div", _hoisted_65, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(warning_default))]),
						_: 1
					}), _cache[80] || (_cache[80] = createBaseVNode("span", null, "驳回后客户将退回原跟进阶段，15天回收规则重新生效", -1))]), createVNode(_component_el_form, {
						"label-width": "100px",
						size: "default"
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "驳回原因",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: rejectReasonType.value,
								"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => rejectReasonType.value = $event),
								placeholder: "选择驳回原因",
								style: { "width": "100%" }
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(rejectReasonOptions.value, (opt) => {
									return openBlock(), createBlock(_component_el_option, {
										key: opt.value,
										label: opt.label,
										value: opt.value
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: rejectReasonType.value === "其他" ? "详细说明" : "补充备注" }, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: rejectReasonText.value,
								"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => rejectReasonText.value = $event),
								type: "textarea",
								rows: 4,
								placeholder: rejectReasonType.value === "其他" ? "请填写详细驳回说明（必填）" : "选填·供提单人作为修改参考"
							}, null, 8, ["modelValue", "placeholder"])]),
							_: 1
						}, 8, ["label"])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue", "title"]),
				detailTarget.value ? (openBlock(), createBlock(BusinessDetailDrawer_default, {
					key: 0,
					modelValue: detailVisible.value,
					"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => detailVisible.value = $event),
					title: detailTarget.value.customerName || "订单详情",
					subtitle: `${detailTarget.value.orderNo} · ${detailTarget.value.submitterName || "提单人"}`,
					eyebrow: "订单提单",
					avatar: (detailTarget.value.customerName || "订单").slice(0, 2),
					"avatar-class": orderAvatarClass(detailTarget.value),
					"status-text": statusLabel(detailTarget.value.status),
					"status-type": statusType(detailTarget.value.status),
					size: "780px"
				}, {
					actions: withCtx(() => [createVNode(_component_el_tag, {
						type: levelTagType(approvalLevelOf(detailTarget.value)),
						effect: "plain"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(approvalLevelText(detailTarget.value)), 1)]),
						_: 1
					}, 8, ["type"]), isOverdueRow(detailTarget.value) ? (openBlock(), createElementBlock("span", _hoisted_67, "审批超期 · " + toDisplayString(deadlineRemain(detailTarget.value)), 1)) : createCommentVNode("", true)]),
					meta: withCtx(() => [createBaseVNode("div", _hoisted_68, [
						createBaseVNode("div", _hoisted_69, [_cache[83] || (_cache[83] = createBaseVNode("span", null, "订单编号", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.orderNo), 1)]),
						createBaseVNode("div", _hoisted_70, [_cache[84] || (_cache[84] = createBaseVNode("span", null, "客户名称", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.customerName || "—"), 1)]),
						createBaseVNode("div", _hoisted_71, [_cache[85] || (_cache[85] = createBaseVNode("span", null, "提交时间", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.submitTime || "—"), 1)]),
						createBaseVNode("div", _hoisted_72, [_cache[86] || (_cache[86] = createBaseVNode("span", null, "预计签约", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.expectedSignDate || "—"), 1)]),
						createBaseVNode("div", _hoisted_73, [_cache[87] || (_cache[87] = createBaseVNode("span", null, "折后金额", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(detailTarget.value.finalAmount)), 1)]),
						createBaseVNode("div", _hoisted_74, [_cache[88] || (_cache[88] = createBaseVNode("span", null, "待收金额", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(detailTarget.value.pendingAmount)), 1)]),
						createBaseVNode("div", _hoisted_75, [_cache[89] || (_cache[89] = createBaseVNode("span", null, "付款方式", -1)), createBaseVNode("b", null, toDisplayString(paymentMethodLabel(detailTarget.value.paymentMethod)), 1)]),
						createBaseVNode("div", _hoisted_76, [_cache[90] || (_cache[90] = createBaseVNode("span", null, "确认方式", -1)), createBaseVNode("b", null, toDisplayString(confirmMethodLabel(detailTarget.value.confirmMethod)), 1)]),
						createBaseVNode("div", _hoisted_77, [_cache[91] || (_cache[91] = createBaseVNode("span", null, "提成比例", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.commissionRate) + "%", 1)]),
						createBaseVNode("div", _hoisted_78, [_cache[92] || (_cache[92] = createBaseVNode("span", null, "参考提成", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(detailTarget.value.commissionAmount)), 1)])
					])]),
					timeline: withCtx(() => [
						createBaseVNode("div", _hoisted_85, [_cache[94] || (_cache[94] = createBaseVNode("i", { class: "bd-timeline-dot success" }, null, -1)), createBaseVNode("div", null, [_cache[93] || (_cache[93] = createBaseVNode("strong", null, "订单创建", -1)), createBaseVNode("p", null, toDisplayString(detailTarget.value.createTime || "—") + " · " + toDisplayString(detailTarget.value.submitterName) + " 创建草稿。", 1)])]),
						detailTarget.value.submitTime && detailTarget.value.status !== "draft" ? (openBlock(), createElementBlock("div", _hoisted_86, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: ["pending_finance", "completed"].includes(detailTarget.value.status) }]) }, null, 2), createBaseVNode("div", null, [createBaseVNode("strong", null, "提交审批 · " + toDisplayString(approvalLevelText(detailTarget.value)), 1), createBaseVNode("p", null, toDisplayString(detailTarget.value.submitTime) + " · " + toDisplayString(approvalChainText(detailTarget.value)) + " · 截止 " + toDisplayString(detailTarget.value.approvalDeadline || "—"), 1)])])) : createCommentVNode("", true),
						detailTarget.value.approvalTime ? (openBlock(), createElementBlock("div", _hoisted_87, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: detailTarget.value.rejectStage !== "manager" }]) }, null, 2), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(detailTarget.value.rejectStage === "manager" ? "主管驳回" : "主管已审批"), 1), createBaseVNode("p", null, toDisplayString(detailTarget.value.approvalTime) + " · " + toDisplayString(detailTarget.value.approvalOpinion || "—"), 1)])])) : createCommentVNode("", true),
						detailTarget.value.financeConfirmTime ? (openBlock(), createElementBlock("div", _hoisted_88, [createBaseVNode("i", { class: normalizeClass(["bd-timeline-dot", { success: detailTarget.value.rejectStage !== "finance" }]) }, null, 2), createBaseVNode("div", null, [createBaseVNode("strong", null, toDisplayString(detailTarget.value.rejectStage === "finance" ? "财务驳回" : "财务确认完成"), 1), createBaseVNode("p", null, toDisplayString(detailTarget.value.financeConfirmTime) + " · " + toDisplayString(detailTarget.value.financeOpinion || "—"), 1)])])) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(detailTarget.value.linkageLogs || [], (log, i) => {
							return openBlock(), createElementBlock("div", {
								key: "lk-" + i,
								class: "bd-timeline-item"
							}, [_cache[95] || (_cache[95] = createBaseVNode("i", { class: "bd-timeline-dot" }, null, -1)), createBaseVNode("div", null, [createBaseVNode("strong", null, "联动 · " + toDisplayString(log.title), 1), createBaseVNode("p", null, toDisplayString(log.time) + " · " + toDisplayString(log.desc), 1)])]);
						}), 128))
					]),
					footer: withCtx(() => [
						createBaseVNode("div", _hoisted_89, [
							createBaseVNode("span", null, [_cache[96] || (_cache[96] = createTextVNode("折后 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(detailTarget.value.finalAmount)), 1)]),
							createBaseVNode("span", null, [_cache[97] || (_cache[97] = createTextVNode("待收 ", -1)), createBaseVNode("b", null, "¥" + toDisplayString(formatAmount(detailTarget.value.pendingAmount)), 1)]),
							createBaseVNode("span", null, [_cache[98] || (_cache[98] = createTextVNode("子项 ", -1)), createBaseVNode("b", null, toDisplayString(detailTarget.value.items.length), 1)])
						]),
						createVNode(_component_el_button, { onClick: _cache[30] || (_cache[30] = ($event) => detailVisible.value = false) }, {
							default: withCtx(() => [..._cache[99] || (_cache[99] = [createTextVNode("关闭", -1)])]),
							_: 1
						}),
						detailTarget.value.status === "rejected" ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "warning",
							onClick: resubmitFromDetail
						}, {
							default: withCtx(() => [..._cache[100] || (_cache[100] = [createTextVNode("修改后重新提交", -1)])]),
							_: 1
						})) : createCommentVNode("", true)
					]),
					default: withCtx(() => [
						_cache[101] || (_cache[101] = createBaseVNode("div", { class: "bd-section-title" }, "流程状态", -1)),
						createBaseVNode("div", _hoisted_79, [createBaseVNode("div", _hoisted_80, [createBaseVNode("span", null, toDisplayString(approvalChainText(detailTarget.value)), 1), createBaseVNode("b", null, toDisplayString(detailTarget.value.approvalDeadline ? `${deadlineHint(detailTarget.value)} · ${deadlineRemain(detailTarget.value)}` : "暂无审批截止"), 1)]), createVNode(_component_el_steps, {
							active: statusStep(detailTarget.value.status),
							"finish-status": "success",
							status: detailTarget.value.status === "rejected" ? "error" : detailTarget.value.status === "cancelled" ? "wait" : "process",
							"align-center": ""
						}, {
							default: withCtx(() => [
								createVNode(_component_el_step, { title: "提交草稿" }),
								createVNode(_component_el_step, { title: "主管审批" }),
								approvalLevelOf(detailTarget.value) >= 2 ? (openBlock(), createBlock(_component_el_step, {
									key: 0,
									title: "财务确认"
								})) : createCommentVNode("", true),
								createVNode(_component_el_step, { title: "订单完成" })
							]),
							_: 1
						}, 8, ["active", "status"])]),
						detailTarget.value.status === "rejected" ? (openBlock(), createElementBlock("div", _hoisted_81, [createBaseVNode("strong", null, "订单被" + toDisplayString(detailTarget.value.rejectStage === "finance" ? "财务" : "主管") + "驳回", 1), createBaseVNode("p", null, [detailTarget.value.rejectReasonType ? (openBlock(), createElementBlock("span", _hoisted_82, "[" + toDisplayString(detailTarget.value.rejectReasonType) + "]", 1)) : createCommentVNode("", true), createTextVNode(" " + toDisplayString(detailTarget.value.rejectReason || detailTarget.value.approvalOpinion || "审批未通过"), 1)])])) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_83, "服务子项 (" + toDisplayString(detailTarget.value.items.length) + ")", 1),
						createVNode(_component_el_table, {
							data: detailTarget.value.items,
							border: "",
							size: "small",
							class: "drawer-table"
						}, {
							default: withCtx(() => [
								createVNode(_component_el_table_column, {
									label: "子项编号",
									prop: "itemNo",
									width: "150"
								}),
								createVNode(_component_el_table_column, {
									label: "服务类型",
									"min-width": "120"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(serviceTypeLabel(row.serviceType)), 1)]),
										_: 2
									}, 1024)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "周期",
									"min-width": "100"
								}, {
									default: withCtx(({ row }) => [createTextVNode(toDisplayString(servicePeriodLabel(row.servicePeriod)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "金额",
									width: "100",
									align: "right"
								}, {
									default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(formatAmount(row.amount)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "折后",
									width: "100",
									align: "right"
								}, {
									default: withCtx(({ row }) => [createTextVNode("¥" + toDisplayString(formatAmount(row.finalAmount)), 1)]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "状态",
									width: "110",
									align: "center"
								}, {
									default: withCtx(({ row }) => [createVNode(_component_el_tag, {
										type: itemStatusType(row.itemStatus),
										effect: "plain",
										size: "small"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(itemStatusLabel(row.itemStatus)), 1)]),
										_: 2
									}, 1032, ["type"])]),
									_: 1
								}),
								createVNode(_component_el_table_column, {
									label: "描述",
									"min-width": "170",
									"show-overflow-tooltip": "",
									prop: "description"
								})
							]),
							_: 1
						}, 8, ["data"]),
						_cache[102] || (_cache[102] = createBaseVNode("div", { class: "bd-section-title section-gap" }, "特殊约定", -1)),
						createBaseVNode("div", _hoisted_84, toDisplayString(detailTarget.value.specialAgreement || "暂无特殊约定"), 1)
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
				])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-bd8c68ee"]]);
//#endregion
export { bill_default as default };

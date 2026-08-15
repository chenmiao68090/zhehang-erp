import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, st as defineComponent, yt as onBeforeUnmount, zt as watch } from "./vendor-Cuzsyfny.js";
import { $t as download_default, Bn as refresh_default, D as ElPagination, Er as withKeys, H as ElDescriptions, I as ElDropdown, J as ElCol, Jn as setting_default, L as ElDropdownItem, M as ElInputNumber, Q as ElRadioGroup, R as ElDropdownMenu, St as arrow_down_default, U as ElDescriptionsItem, Un as search_default, V as ElDialog, Vn as refresh_left_default, W as ElDatePicker, X as ElRadio, Xt as delete_default, Y as ElRow, _ as ElTableColumn, _t as ElFormItem, a as ElMessageBox, c as ElSegmented, dt as ElBadge, g as ElTable, gt as ElForm, in as filter_default, it as ElTag, l as ElUpload, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pt as ElScrollbar, rt as ElSelect, s as vLoading, ur as upload_default, vt as ElAlert, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as get } from "./request-CZ5tKmxn.js";
import { l as useUserStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { i as poolConfigApi, r as leadApi } from "./crm-DKTvHmZR.js";
import { a as leadSourceLabel, n as LEAD_SOURCE_OPTIONS, o as leadSourceTagType, r as LEAD_SOURCE_PLATFORM_OPTIONS } from "./lead-source-B8JVaFME.js";
import { i as escapeCsvCell } from "./lead-import-BToiZPuH.js";
import { t as useFieldOptions } from "./useFieldOptions-Ck3wetP1.js";
//#region src/composables/useCrmPermission.ts
/**
* CRM 联系方式展示口径。
*
* 这里只读取后端登录态返回的权限，不允许 localStorage、调试角色或前端角色切换覆盖。
* 后端仍负责最终数据范围与接口授权；前端脱敏只用于避免页面误展示。
*/
var LEAD_LIST_PERMISSION = "crm:lead:list";
function maskPhone(phone) {
	const value = String(phone || "").trim();
	if (!value) return "";
	if (value.length <= 4) return "*".repeat(value.length);
	if (value.length < 7) return `${value.slice(0, 2)}***${value.slice(-2)}`;
	return `${value.slice(0, 3)}****${value.slice(-4)}`;
}
function maskWechat(wechat) {
	const value = String(wechat || "").trim();
	if (!value) return "";
	if (value.length <= 2) return "*".repeat(value.length);
	return `${value.slice(0, 2)}****${value.slice(-2)}`;
}
function useCrmPermission() {
	const userStore = useUserStore();
	const canViewFullPhone = computed(() => userStore.permissions.includes("*:*:*") || userStore.permissions.includes(LEAD_LIST_PERMISSION));
	const formatPhone = (phone, isOwn = false) => {
		if (!phone) return "";
		return canViewFullPhone.value || isOwn ? phone : maskPhone(phone);
	};
	const formatWechat = (wechat, isOwn = false) => {
		if (!wechat) return "";
		return canViewFullPhone.value || isOwn ? wechat : maskWechat(wechat);
	};
	return {
		canViewFullPhone,
		formatPhone,
		formatWechat
	};
}
//#endregion
//#region src/views/crm/lead.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "lead-page" };
var _hoisted_2 = { class: "resource-header" };
var _hoisted_3 = { class: "resource-title" };
var _hoisted_4 = { class: "resource-summary" };
var _hoisted_5 = {
	key: 0,
	class: "conv-stats"
};
var _hoisted_6 = { class: "filter-bar" };
var _hoisted_7 = { class: "filter-left" };
var _hoisted_8 = { class: "filter-right" };
var _hoisted_9 = {
	key: 1,
	class: "batch-bar"
};
var _hoisted_10 = { class: "batch-info" };
var _hoisted_11 = { class: "batch-actions" };
var _hoisted_12 = { class: "table-wrap" };
var _hoisted_13 = ["onClick"];
var _hoisted_14 = { key: 0 };
var _hoisted_15 = {
	key: 1,
	class: "muted"
};
var _hoisted_16 = { class: "follow-cell" };
var _hoisted_17 = { class: "follow-time" };
var _hoisted_18 = { class: "follow-tip" };
var _hoisted_19 = {
	key: 0,
	class: "tip-overdue"
};
var _hoisted_20 = {
	key: 1,
	class: "tip-soon"
};
var _hoisted_21 = { class: "pagination-wrap" };
var _hoisted_22 = { class: "lead-form-section" };
var _hoisted_23 = { class: "lead-form-section" };
var _hoisted_24 = { class: "lead-doc-list" };
var _hoisted_25 = {
	key: 0,
	class: "field-tip"
};
var _hoisted_26 = { class: "lead-form-section" };
var _hoisted_27 = { class: "lead-form-section" };
var _hoisted_28 = {
	key: 0,
	class: "dup-result"
};
var _hoisted_29 = { key: 0 };
var _hoisted_30 = { style: {
	"margin-top": "14px",
	"text-align": "right"
} };
var _hoisted_31 = { style: {
	"display": "flex",
	"align-items": "center",
	"gap": "8px",
	"width": "100%"
} };
var _hoisted_32 = { style: {
	"display": "flex",
	"align-items": "center",
	"gap": "8px",
	"width": "100%"
} };
//#endregion
//#region src/views/crm/lead.vue
var lead_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "lead",
	setup(__props) {
		var _useRoute$meta;
		const followFrequencyStandard = {
			A: 2,
			B: 5,
			C: 15,
			D: 30,
			E: 30
		};
		const userStore = useUserStore();
		const SALES_MANAGER_ROLES = new Set([
			"admin",
			"super_admin",
			"sys_admin",
			"boss",
			"manager",
			"dept_manager"
		]);
		const canManageSales = computed(() => (userStore.roles || []).some((role) => {
			const baseRole = String(role).split("__", 1)[0];
			return SALES_MANAGER_ROLES.has(String(role)) || SALES_MANAGER_ROLES.has(baseRole);
		}));
		const BULK_IMPORT_ROLES = new Set([
			"admin",
			"boss",
			"manager",
			"dept_manager"
		]);
		const canBulkImport = computed(() => (userStore.roles || []).some((role) => {
			const baseRole = String(role).split("__", 1)[0];
			return BULK_IMPORT_ROLES.has(String(role)) || BULK_IMPORT_ROLES.has(baseRole);
		}));
		const canExportLeads = computed(() => (userStore.roles || []).includes("super_admin"));
		const canManageRules = computed(() => [
			"admin",
			"super_admin",
			"sys_admin",
			"boss"
		].some((r) => (userStore.roles || []).includes(r)));
		const currentUserId = computed(() => {
			var _userStore$userInfo$i, _userStore$userInfo;
			return (_userStore$userInfo$i = (_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id) !== null && _userStore$userInfo$i !== void 0 ? _userStore$userInfo$i : null;
		});
		const currentUserName = computed(() => {
			var _userStore$userInfo2, _userStore$userInfo3;
			return ((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.nickname) || ((_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.username) || "我";
		});
		const ownerOptions = ref([]);
		const ownerNameMap = computed(() => {
			const m = /* @__PURE__ */ new Map();
			ownerOptions.value.forEach((u) => m.set(u.id, u.name));
			return m;
		});
		const loadOwners = function() {
			var _ref = _asyncToGenerator(function* () {
				try {
					const resp = yield get("/system/user/list", {
						pageNum: 1,
						pageSize: 200
					}, { silentError: true });
					const page = resp && resp.data || resp;
					const records = page && (page.records || page.list);
					if (Array.isArray(records)) ownerOptions.value = records.map((u) => ({
						id: u.id,
						name: u.nickname || u.username || "用户" + u.id
					}));
				} catch (_unused) {
					ownerOptions.value = [];
				}
			});
			return function loadOwners() {
				return _ref.apply(this, arguments);
			};
		}();
		const resolveOwnerName = (ownerId) => {
			if (ownerId == null) return "";
			if (currentUserId.value != null && ownerId === currentUserId.value) return currentUserName.value;
			return ownerNameMap.value.get(ownerId) || "";
		};
		const looksLikeCompany = (value) => /公司|集团|企业|事务所|中心|工作室|商行|店|厂|合伙/.test(value || "");
		const extractRemarkFields = (remark) => {
			const fields = {};
			if (!remark) return fields;
			remark.split(/\r?\n/).forEach((line) => {
				const match = line.match(/^\s*([^:：]+)\s*[:：]\s*(.+?)\s*$/);
				if (match) fields[match[1].trim()] = match[2].trim();
			});
			return fields;
		};
		const firstRemarkValue = (fields, labels) => {
			for (const label of labels) if (fields[label]) return fields[label];
			return "";
		};
		const leadCompanyName = (row) => row.company || (looksLikeCompany(row.name) ? row.name : "") || row.name || "";
		const leadContactName = (row) => row.legalPerson || (!looksLikeCompany(row.name) ? row.name : "") || "—";
		const leadAddressText = (row) => row.registerAddress || row.latestAddress || "";
		const GS_REMARK_LABELS = [
			"登记状态",
			"法定代表人",
			"企业(机构)类型",
			"实缴资本",
			"核准日期",
			"统一社会信用代码",
			"企业联系电话",
			"参保人数",
			"参保人数所属年报",
			"注册地址",
			"最新地址",
			"邮箱",
			"经营范围"
		];
		const isAutoGsRemark = (remark) => {
			if (!remark) return false;
			const lines = String(remark).split("\n").map((s) => s.trim()).filter(Boolean);
			if (!lines.length) return false;
			return lines.every((line) => GS_REMARK_LABELS.some((label) => line.startsWith(label + ":") || line.startsWith(label + "：")));
		};
		const normalizeLeadForForm = (row) => {
			const remarkFields = extractRemarkFields(row.remark);
			const backendName = row.name || "";
			const backendCompany = row.company || "";
			const companyName = looksLikeCompany(backendCompany) ? backendCompany : looksLikeCompany(backendName) ? backendName : backendCompany || backendName;
			const legalPerson = row.legalPerson || firstRemarkValue(remarkFields, [
				"法定代表人",
				"法人",
				"法人代表"
			]) || (!looksLikeCompany(backendName) ? backendName : "") || (!looksLikeCompany(backendCompany) ? backendCompany : "");
			return _objectSpread2(_objectSpread2({}, row), {}, {
				company: companyName,
				name: legalPerson,
				legalPerson,
				companyPhone: row.companyPhone || firstRemarkValue(remarkFields, ["企业联系电话", "联系电话"]),
				registerStatus: row.registerStatus || firstRemarkValue(remarkFields, ["登记状态", "经营状态"]),
				enterpriseType: row.enterpriseType || firstRemarkValue(remarkFields, ["企业(机构)类型", "企业类型"]),
				paidCapital: row.paidCapital || firstRemarkValue(remarkFields, ["实缴资本"]),
				approvedDate: row.approvedDate || firstRemarkValue(remarkFields, ["核准日期"]),
				creditCode: row.creditCode || firstRemarkValue(remarkFields, ["统一社会信用代码", "信用代码"]),
				insuredCount: row.insuredCount || firstRemarkValue(remarkFields, ["参保人数"]),
				insuredYear: row.insuredYear || firstRemarkValue(remarkFields, ["参保人数所属年报"]),
				registerAddress: row.registerAddress || firstRemarkValue(remarkFields, ["注册地址"]),
				latestAddress: row.latestAddress || firstRemarkValue(remarkFields, ["最新地址"]),
				businessScope: row.businessScope || firstRemarkValue(remarkFields, ["经营范围"]),
				establishedDate: row.establishedDate || row.registerDate || "",
				email: row.email && String(row.email).includes("@") ? row.email : "",
				remark: isAutoGsRemark(row.remark) ? "" : row.remark || ""
			});
		};
		function normalizeLeadTab(tab) {
			return tab === "treasure" || tab === "history" ? tab : "pool";
		}
		const activeTab = ref(normalizeLeadTab(useRoute().query.tab || ((_useRoute$meta = useRoute().meta) === null || _useRoute$meta === void 0 ? void 0 : _useRoute$meta.tab)));
		const resourceTabOptions = [
			{
				label: "可领取客户",
				value: "pool"
			},
			{
				label: "高价值客户",
				value: "treasure"
			},
			{
				label: "历史客资",
				value: "history"
			}
		];
		computed(() => [
			"my",
			"todo",
			"warning"
		].includes(activeTab.value));
		const isPublicPoolTab = computed(() => ["pool", "treasure"].includes(activeTab.value));
		const isHistoryTab = computed(() => activeTab.value === "history");
		const isOnlineTab = computed(() => activeTab.value === "online");
		const { formatPhone } = useCrmPermission();
		const router = useRouter();
		const route = useRoute();
		function changeResourceTab(value) {
			const tab = normalizeLeadTab(value);
			router.replace({
				path: "/customer/lead",
				query: tab === "pool" ? {} : { tab }
			});
		}
		watch(() => route.fullPath, () => {
			var _route$meta;
			const t = normalizeLeadTab(route.query.tab || ((_route$meta = route.meta) === null || _route$meta === void 0 ? void 0 : _route$meta.tab));
			if (t !== activeTab.value) {
				activeTab.value = t;
				selectedRows.value = [];
				queryParams.page = 1;
				fetchLeads();
				if (t === "online") {
					loadLeadSummary();
					startSummaryRoll();
				} else stopSummaryRoll();
			}
		});
		const loading = ref(false);
		const tableRef = ref();
		const allLeads = ref([]);
		const selectedRows = ref([]);
		const getLeadLevel = (lead) => lead.level || null;
		const daysBetween = (a, b) => Math.floor((a.getTime() - b.getTime()) / 864e5);
		const computeFollowFrequencyState = (lead) => {
			const level = getLeadLevel(lead);
			if (!level) return {
				level: null,
				limit: 0,
				overdueDays: 0,
				daysToDue: 0,
				status: "unclassified"
			};
			const limit = followFrequencyStandard[level];
			if (!lead.lastFollowTime) return {
				level,
				limit,
				overdueDays: 0,
				daysToDue: limit,
				status: "never"
			};
			const last = new Date(lead.lastFollowTime.replace(/-/g, "/"));
			const remaining = limit - daysBetween(/* @__PURE__ */ new Date(), last);
			if (remaining < 0) return {
				level,
				limit,
				overdueDays: -remaining,
				daysToDue: 0,
				status: "overdue"
			};
			if (remaining <= 2) return {
				level,
				limit,
				overdueDays: 0,
				daysToDue: remaining,
				status: "soon"
			};
			return {
				level,
				limit,
				overdueDays: 0,
				daysToDue: remaining,
				status: "ok"
			};
		};
		const nowTick = ref(Date.now());
		let nowTimer = null;
		const queryParams = reactive({
			page: 1,
			size: 20,
			source: null,
			status: null,
			keyword: typeof route.query.keyword === "string" ? route.query.keyword : "",
			level: null,
			ownerId: null,
			validity: null,
			region: "",
			industry: "",
			scale: "",
			capitalMin: null,
			capitalMax: null,
			establishedStart: "",
			establishedEnd: "",
			createRange: null
		});
		const treasurePoolId = ref(null);
		const poolConfigLoaded = ref(false);
		const loadPoolIdByType = function() {
			var _ref2 = _asyncToGenerator(function* (type) {
				try {
					const resp = yield poolConfigApi.getByType(type);
					const pool = resp && resp.data || resp;
					const id = Number(pool === null || pool === void 0 ? void 0 : pool.id);
					return Number.isFinite(id) && id > 0 ? id : null;
				} catch (_unused2) {
					return null;
				}
			});
			return function loadPoolIdByType(_x) {
				return _ref2.apply(this, arguments);
			};
		}();
		const loadResourcePoolIds = function() {
			var _ref3 = _asyncToGenerator(function* () {
				treasurePoolId.value = yield loadPoolIdByType("treasure");
				poolConfigLoaded.value = true;
			});
			return function loadResourcePoolIds() {
				return _ref3.apply(this, arguments);
			};
		}();
		const fetchLeads = function() {
			var _ref4 = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _queryParams$source, _queryParams$status, _queryParams$status2;
					let resp = null;
					const params = {
						pageNum: queryParams.page,
						pageSize: queryParams.size,
						name: queryParams.keyword || void 0,
						source: (_queryParams$source = queryParams.source) !== null && _queryParams$source !== void 0 ? _queryParams$source : void 0,
						status: (_queryParams$status = queryParams.status) !== null && _queryParams$status !== void 0 ? _queryParams$status : void 0,
						customerLevel: queryParams.level || void 0
					};
					if (activeTab.value === "pool") resp = yield leadApi.poolList(params);
					else if (activeTab.value === "treasure") resp = treasurePoolId.value ? yield leadApi.poolList(_objectSpread2(_objectSpread2({}, params), {}, { poolId: treasurePoolId.value })) : {
						records: [],
						total: 0
					};
					else if (activeTab.value === "history") resp = yield leadApi.myList(_objectSpread2(_objectSpread2({}, params), {}, {
						status: 4,
						scope: "all"
					}));
					else if (activeTab.value === "todo") resp = yield leadApi.todoFollow(params);
					else if (activeTab.value === "warning") resp = yield leadApi.recycleWarning(params);
					else resp = yield leadApi.myList(_objectSpread2(_objectSpread2({}, params), {}, { status: (_queryParams$status2 = queryParams.status) !== null && _queryParams$status2 !== void 0 ? _queryParams$status2 : void 0 }));
					const page = resp && resp.data || resp;
					const records = page && (page.records || page.list);
					if (Array.isArray(records)) {
						var _page$total;
						allLeads.value = records.map(mapBackendLead);
						totalCount.value = Number((_page$total = page.total) !== null && _page$total !== void 0 ? _page$total : records.length);
					} else {
						allLeads.value = [];
						totalCount.value = 0;
					}
				} catch (_unused3) {
					allLeads.value = [];
					totalCount.value = 0;
					ElMessage.error("线索数据加载失败,请检查后端服务是否正常");
				} finally {
					loading.value = false;
				}
			});
			return function fetchLeads() {
				return _ref4.apply(this, arguments);
			};
		}();
		const mapBackendLead = (r) => {
			var _r$ownerId, _r$registeredCapital, _r$source, _r$status, _r$dealAmount;
			const isPool = r.ownership !== "private";
			const ownerId = (_r$ownerId = r.ownerId) !== null && _r$ownerId !== void 0 ? _r$ownerId : null;
			const remarkFields = extractRemarkFields(r.remark || "");
			const backendName = r.name || "";
			const backendCompany = r.company || "";
			const companyName = looksLikeCompany(backendCompany) ? backendCompany : looksLikeCompany(backendName) ? backendName : backendCompany || backendName;
			const legalPerson = r.legalPerson || firstRemarkValue(remarkFields, [
				"法定代表人",
				"法人",
				"法人代表"
			]) || (!looksLikeCompany(backendName) ? backendName : "");
			return {
				id: r.id,
				name: legalPerson || "",
				company: companyName || "",
				legalPerson: legalPerson || "",
				phone: r.phone || "",
				companyPhone: r.companyPhone || firstRemarkValue(remarkFields, ["企业联系电话", "联系电话"]),
				registerDate: r.establishedDate || (r.createTime || "").slice(0, 10),
				establishedDate: r.establishedDate || "",
				approvedDate: r.approvedDate || firstRemarkValue(remarkFields, ["核准日期"]),
				email: r.email || "",
				registerStatus: r.registerStatus || firstRemarkValue(remarkFields, ["登记状态", "经营状态"]),
				enterpriseScale: r.enterpriseScale || "",
				enterpriseType: r.enterpriseType || firstRemarkValue(remarkFields, ["企业(机构)类型", "企业类型"]),
				registeredCapital: (_r$registeredCapital = r.registeredCapital) !== null && _r$registeredCapital !== void 0 ? _r$registeredCapital : "",
				paidCapital: r.paidCapital || firstRemarkValue(remarkFields, ["实缴资本"]),
				creditCode: r.creditCode || firstRemarkValue(remarkFields, ["统一社会信用代码", "信用代码"]),
				insuredCount: r.insuredCount || firstRemarkValue(remarkFields, ["参保人数"]),
				insuredYear: r.insuredYear || firstRemarkValue(remarkFields, ["参保人数所属年报"]),
				registerAddress: r.registerAddress || firstRemarkValue(remarkFields, ["注册地址"]),
				latestAddress: r.latestAddress || firstRemarkValue(remarkFields, ["最新地址"]),
				businessScope: r.businessScope || firstRemarkValue(remarkFields, ["经营范围"]),
				region: r.region || "",
				sourceDetail: r.sourceDetail || "",
				source: (_r$source = r.source) !== null && _r$source !== void 0 ? _r$source : 1,
				status: (_r$status = r.status) !== null && _r$status !== void 0 ? _r$status : 1,
				pool: isPool ? 1 : 0,
				ownerId,
				ownerName: resolveOwnerName(ownerId),
				lastFollowTime: r.lastFollowTime || "",
				lastFollowContent: r.lastFollowContent || "",
				invalidReason: r.invalidReason || "",
				createTime: r.createTime || "",
				remark: r.remark || "",
				level: r.customerLevel || void 0,
				followUpRecords: Array.isArray(r.followUpRecords) ? r.followUpRecords : [],
				leadNo: r.leadNo || "",
				sourcePlatform: r.sourcePlatform || "",
				storeBrand: r.storeBrand || "",
				consultBusiness: r.consultBusiness || "",
				nickname: r.nickname || "",
				wechatNo: r.wechatNo || "",
				virtualPhone: r.virtualPhone || "",
				validity: r.validity || "",
				followStatus: r.followStatus || "",
				receiveTime: r.receiveTime || "",
				dealAmount: (_r$dealAmount = r.dealAmount) !== null && _r$dealAmount !== void 0 ? _r$dealAmount : "",
				dealBusiness: r.dealBusiness || "",
				attachments: r.attachments || ""
			};
		};
		const parseCapitalWan = (raw) => {
			if (raw == null || raw === "") return null;
			if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
			const m = String(raw).replace(/,/g, "").match(/-?\d+(\.\d+)?/);
			if (!m) return null;
			const n = Number(m[0]);
			return Number.isFinite(n) ? n : null;
		};
		const dateOnly = (v) => v ? String(v).slice(0, 10) : "";
		const filteredList = computed(() => {
			let list = allLeads.value;
			if (isOnlineTab.value) {
				if (queryParams.ownerId != null) list = list.filter((l) => l.ownerId === queryParams.ownerId);
				if (queryParams.validity === "has") list = list.filter((l) => !!(l.phone && String(l.phone).trim()));
				if (queryParams.validity === "none") list = list.filter((l) => !(l.phone && String(l.phone).trim()));
				if (queryParams.region.trim()) {
					const kw = queryParams.region.trim();
					list = list.filter((l) => (l.region || l.registerAddress || "").includes(kw));
				}
				if (queryParams.industry.trim()) {
					const kw = queryParams.industry.trim();
					list = list.filter((l) => (l.businessScope || l.enterpriseType || "").includes(kw));
				}
				if (queryParams.scale.trim()) {
					const kw = queryParams.scale.trim();
					list = list.filter((l) => (l.enterpriseScale || "").includes(kw));
				}
				if (queryParams.capitalMin != null || queryParams.capitalMax != null) list = list.filter((l) => {
					const cap = parseCapitalWan(l.registeredCapital);
					if (cap == null) return false;
					if (queryParams.capitalMin != null && cap < queryParams.capitalMin) return false;
					if (queryParams.capitalMax != null && cap > queryParams.capitalMax) return false;
					return true;
				});
				if (queryParams.establishedStart) list = list.filter((l) => dateOnly(l.establishedDate) && dateOnly(l.establishedDate) >= queryParams.establishedStart);
				if (queryParams.establishedEnd) list = list.filter((l) => dateOnly(l.establishedDate) && dateOnly(l.establishedDate) <= queryParams.establishedEnd);
				if (queryParams.createRange && queryParams.createRange[0] && queryParams.createRange[1]) {
					const [start, end] = queryParams.createRange;
					list = list.filter((l) => {
						const d = dateOnly(l.createTime);
						return d && d >= start && d <= end;
					});
				}
			}
			return list;
		});
		const totalCount = ref(0);
		const sourceLabel = (val) => {
			return leadSourceLabel(val, "-");
		};
		const sourceTagType = (val) => {
			return leadSourceTagType(val);
		};
		const statusLabel = (val) => {
			return {
				1: "新建",
				2: "跟进中",
				3: "已转化",
				4: "无效"
			}[val] || "-";
		};
		const statusTagType = (val) => {
			return {
				1: "info",
				2: "primary",
				3: "success",
				4: "danger"
			}[val] || "";
		};
		const levelTagType = (lv) => ({
			A: "danger",
			B: "warning",
			C: "primary",
			D: "info",
			E: "info"
		})[lv] || "info";
		const handleSearch = () => {
			queryParams.page = 1;
			fetchLeads();
		};
		const handleSizeChange = () => {
			queryParams.page = 1;
			fetchLeads();
		};
		const handleReset = () => {
			queryParams.source = null;
			queryParams.status = null;
			queryParams.keyword = "";
			queryParams.level = null;
			queryParams.ownerId = null;
			queryParams.validity = null;
			queryParams.region = "";
			queryParams.industry = "";
			queryParams.scale = "";
			queryParams.capitalMin = null;
			queryParams.capitalMax = null;
			queryParams.establishedStart = "";
			queryParams.establishedEnd = "";
			queryParams.createRange = null;
			queryParams.page = 1;
			fetchLeads();
		};
		const handleRefresh = () => {
			queryParams.page = 1;
			fetchLeads();
		};
		const moreFilterVisible = ref(false);
		const openMoreFilter = () => {
			moreFilterVisible.value = true;
		};
		const applyMoreFilter = () => {
			queryParams.page = 1;
			moreFilterVisible.value = false;
		};
		const resetMoreFilter = () => {
			queryParams.region = "";
			queryParams.industry = "";
			queryParams.scale = "";
			queryParams.capitalMin = null;
			queryParams.capitalMax = null;
			queryParams.establishedStart = "";
			queryParams.establishedEnd = "";
		};
		const moreFilterCount = computed(() => {
			let n = 0;
			if (queryParams.region.trim()) n++;
			if (queryParams.industry.trim()) n++;
			if (queryParams.scale.trim()) n++;
			if (queryParams.capitalMin != null || queryParams.capitalMax != null) n++;
			if (queryParams.establishedStart || queryParams.establishedEnd) n++;
			return n;
		});
		const handleSelectionChange = (rows) => {
			selectedRows.value = rows;
		};
		const clearSelection = () => {
			var _tableRef$value;
			(_tableRef$value = tableRef.value) === null || _tableRef$value === void 0 || _tableRef$value.clearSelection();
		};
		const rowSelectable = () => true;
		const formRef = ref();
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
		const formDialog = reactive({
			visible: false,
			isEdit: false
		});
		const formData = reactive({
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
		});
		const dealBusinessArr = ref([]);
		const fieldOptionsReady = computed(() => consultBusinessResolved.value);
		const consultBusinessSelectOptions = computed(() => withConsultBusinessHistory(formData.consultBusiness || ""));
		const dealBusinessSelectOptions = computed(() => withConsultBusinessHistory(dealBusinessArr.value));
		const leadDocs = ref({});
		const leadDocList = computed(() => Object.entries(leadDocs.value).map(([key, v]) => _objectSpread2({ key }, v)));
		let leadDocSeq = 0;
		const uploadLeadDoc = function() {
			var _ref5 = _asyncToGenerator(function* (options) {
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
				} catch (_unused4) {
					ElMessage.error("上传失败");
				}
			});
			return function uploadLeadDoc(_x2) {
				return _ref5.apply(this, arguments);
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
		const resetFormData = () => {
			Object.assign(formData, {
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
			});
			dealBusinessArr.value = [];
			leadDocs.value = {};
		};
		const applyFieldDefaultsToNewForm = () => {
			if (!fieldOptionsReady.value || formDialog.isEdit) return;
			if (!formData.consultBusiness && consultBusinessDefault.value) formData.consultBusiness = consultBusinessDefault.value;
		};
		watch([fieldOptionsReady, consultBusinessDefault], () => {
			if (formDialog.visible) applyFieldDefaultsToNewForm();
		});
		watch(() => formDialog.visible, (visible) => {
			if (visible) applyFieldDefaultsToNewForm();
		});
		const validateFieldOptionSelections = () => {
			if (!fieldOptionsReady.value) {
				ElMessage.warning("字段选项正在加载，请稍后保存");
				return false;
			}
			if (formDialog.isEdit) return true;
			const invalid = formData.consultBusiness && !isConsultBusinessSelectable(formData.consultBusiness) || dealBusinessArr.value.some((value) => !isConsultBusinessSelectable(value));
			if (invalid) ElMessage.warning("所选字段值已停用，请重新选择");
			return !invalid;
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
		const gsDrawer = reactive({
			visible: false,
			row: null
		});
		const openGs = (row) => {
			gsDrawer.row = row;
			gsDrawer.visible = true;
		};
		const editFromGs = () => {
			const r = gsDrawer.row;
			gsDrawer.visible = false;
			if (r) openEdit(r);
		};
		const openEdit = (row) => {
			formDialog.isEdit = true;
			resetFormData();
			Object.assign(formData, normalizeLeadForForm(row));
			dealBusinessArr.value = (row.dealBusiness || "").split(",").map((s) => s.trim()).filter(Boolean);
			leadDocs.value = parseLeadAttachments(row.attachments);
			formDialog.visible = true;
		};
		const parseLeadAttachments = (raw) => {
			const out = {};
			if (!raw) return out;
			try {
				const arr = JSON.parse(raw);
				if (Array.isArray(arr)) arr.forEach((it, i) => {
					if (it && it.fileId != null) out[`doc-old-${i}`] = {
						fileId: String(it.fileId),
						fileName: it.fileName || `附件${i + 1}`
					};
				});
			} catch (_unused5) {}
			return out;
		};
		const buildLeadPayload = () => {
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
		};
		const submitForm = function() {
			var _ref7 = _asyncToGenerator(function* () {
				if (!formRef.value) return;
				if (!validateFieldOptionSelections()) return;
				yield formRef.value.validate(function() {
					var _ref6 = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						const payload = buildLeadPayload();
						if (formDialog.isEdit) {
							try {
								yield leadApi.update(payload);
							} catch (_unused6) {
								return;
							}
							ElMessage.success("已更新");
						} else {
							payload.ownerId = currentUserId.value;
							payload.status = 1;
							try {
								yield leadApi.create(payload);
							} catch (_unused7) {
								return;
							}
							ElMessage.success("已创建");
						}
						formDialog.visible = false;
						yield fetchLeads();
					});
					return function(_x3) {
						return _ref6.apply(this, arguments);
					};
				}());
			});
			return function submitForm() {
				return _ref7.apply(this, arguments);
			};
		}();
		const handleDelete = function() {
			var _ref8 = _asyncToGenerator(function* (row) {
				yield ElMessageBox.confirm(`确定删除线索「${leadCompanyName(row)}」？`, "提示", { type: "warning" });
				try {
					yield leadApi.remove(row.id);
				} catch (_unused8) {
					return;
				}
				ElMessage.success("已删除");
				yield fetchLeads();
			});
			return function handleDelete(_x4) {
				return _ref8.apply(this, arguments);
			};
		}();
		const handleBatchDelete = function() {
			var _ref9 = _asyncToGenerator(function* () {
				const count = selectedRows.value.length;
				if (!count) return;
				try {
					yield ElMessageBox.confirm(`确定删除选中的 ${count} 条线索？删除后不可恢复。`, "批量删除", {
						type: "warning",
						confirmButtonText: "删除",
						cancelButtonText: "取消"
					});
				} catch (_unused9) {
					return;
				}
				const ids = selectedRows.value.map((r) => r.id);
				const ok = (yield Promise.allSettled(ids.map((id) => leadApi.remove(id)))).filter((r) => r.status === "fulfilled").length;
				const fail = count - ok;
				selectedRows.value = [];
				yield fetchLeads();
				if (fail === 0) ElMessage.success(`已删除 ${ok} 条`);
				else if (ok === 0) ElMessage.error("删除失败，请重试");
				else ElMessage.warning(`已删除 ${ok} 条，${fail} 条失败`);
			});
			return function handleBatchDelete() {
				return _ref9.apply(this, arguments);
			};
		}();
		const BATCH_LEVEL_OPTIONS = [
			{
				value: "A",
				label: "A 高意向"
			},
			{
				value: "B",
				label: "B 意向"
			},
			{
				value: "C",
				label: "C 潜在意向"
			},
			{
				value: "D",
				label: "D 无意向"
			},
			{
				value: "E",
				label: "E 无效客户"
			}
		];
		const handleBatchLevel = function() {
			var _ref10 = _asyncToGenerator(function* (level) {
				var _BATCH_LEVEL_OPTIONS$;
				if (!selectedRows.value.length) return;
				const count = selectedRows.value.length;
				const label = ((_BATCH_LEVEL_OPTIONS$ = BATCH_LEVEL_OPTIONS.find((o) => o.value === level)) === null || _BATCH_LEVEL_OPTIONS$ === void 0 ? void 0 : _BATCH_LEVEL_OPTIONS$.label) || level;
				try {
					const historyTip = ["D", "E"].includes(level) ? "，并转入历史客资" : "";
					yield ElMessageBox.confirm(`确定把选中的 ${count} 条线索都设为「${label}」${historyTip}?`, "批量设置意向", { type: "warning" });
				} catch (_unused10) {
					return;
				}
				const ids = selectedRows.value.map((r) => r.id);
				try {
					yield Promise.all(ids.map((id) => leadApi.update({
						id,
						customerLevel: level
					})));
				} catch (_unused11) {
					ElMessage.error("部分打级失败，请重试");
					return;
				}
				selectedRows.value = [];
				ElMessage.success(`已给 ${count} 条线索打「${label}」`);
				yield fetchLeads();
			});
			return function handleBatchLevel(_x5) {
				return _ref10.apply(this, arguments);
			};
		}();
		const actionCountdown = ref(0);
		let actionCountdownTimer = null;
		function clearActionCountdown() {
			if (actionCountdownTimer) {
				clearInterval(actionCountdownTimer);
				actionCountdownTimer = null;
			}
			actionCountdown.value = 0;
		}
		const recycleConfirm = reactive({
			visible: false,
			submitting: false,
			row: null
		});
		const confirmRecycle = function() {
			var _ref11 = _asyncToGenerator(function* () {
				if (actionCountdown.value > 0 || !recycleConfirm.row) return;
				recycleConfirm.submitting = true;
				try {
					yield leadApi.returnToPool([recycleConfirm.row.id], "");
				} catch (_unused12) {
					recycleConfirm.submitting = false;
					return ElMessage.error("移入公海失败");
				}
				recycleConfirm.submitting = false;
				recycleConfirm.visible = false;
				ElMessage.success("已移入公海");
				yield fetchLeads();
			});
			return function confirmRecycle() {
				return _ref11.apply(this, arguments);
			};
		}();
		const deleteConfirm = reactive({
			visible: false,
			submitting: false,
			row: null
		});
		const confirmDelete = function() {
			var _ref12 = _asyncToGenerator(function* () {
				if (actionCountdown.value > 0 || !deleteConfirm.row) return;
				deleteConfirm.submitting = true;
				try {
					yield leadApi.remove(deleteConfirm.row.id);
				} catch (_unused13) {
					deleteConfirm.submitting = false;
					return;
				}
				deleteConfirm.submitting = false;
				deleteConfirm.visible = false;
				ElMessage.success("已删除");
				yield fetchLeads();
			});
			return function confirmDelete() {
				return _ref12.apply(this, arguments);
			};
		}();
		const handleClaimSingle = function() {
			var _ref13 = _asyncToGenerator(function* (row) {
				try {
					yield leadApi.claim([row.id]);
				} catch (_unused14) {
					return;
				}
				ElMessage.success(`已领取「${leadCompanyName(row)}」`);
				yield fetchLeads();
			});
			return function handleClaimSingle(_x6) {
				return _ref13.apply(this, arguments);
			};
		}();
		const handleClaim = function() {
			var _ref14 = _asyncToGenerator(function* () {
				const ids = selectedRows.value.map((r) => r.id);
				if (!ids.length) return;
				try {
					yield leadApi.claim(ids);
				} catch (_unused15) {
					return;
				}
				selectedRows.value = [];
				ElMessage.success(`已领取 ${ids.length} 条`);
				yield fetchLeads();
			});
			return function handleClaim() {
				return _ref14.apply(this, arguments);
			};
		}();
		const reactivateHistoryLeads = function() {
			var _ref15 = _asyncToGenerator(function* (rows) {
				const ids = rows.map((row) => row.id);
				if (!ids.length) return;
				const subject = ids.length === 1 ? `「${leadCompanyName(rows[0])}」` : `选中的 ${ids.length} 条历史客资`;
				try {
					yield ElMessageBox.confirm(`确定将${subject}领取到“我的客户”吗？原负责人和全部跟进记录会完整保留在审计中。`, "领取历史客资", {
						type: "warning",
						confirmButtonText: "确认领取",
						cancelButtonText: "取消"
					});
				} catch (_unused16) {
					return;
				}
				try {
					yield leadApi.reactivateHistory(ids);
				} catch (_unused17) {
					return;
				}
				clearSelection();
				selectedRows.value = [];
				ElMessage.success(`已领取 ${ids.length} 条，可在“我的客户”中继续跟进`);
				yield fetchLeads();
			});
			return function reactivateHistoryLeads(_x7) {
				return _ref15.apply(this, arguments);
			};
		}();
		const handleHistoryReactivateSingle = (row) => reactivateHistoryLeads([row]);
		const handleHistoryReactivate = () => reactivateHistoryLeads(selectedRows.value);
		const distributeDialog = reactive({
			visible: false,
			ownerId: null
		});
		const openDistribute = () => {
			distributeDialog.ownerId = null;
			distributeDialog.visible = true;
		};
		const submitDistribute = function() {
			var _ref16 = _asyncToGenerator(function* () {
				if (!distributeDialog.ownerId) return ElMessage.warning("请选择负责人");
				const ids = selectedRows.value.map((r) => r.id);
				if (!ids.length) return;
				try {
					yield leadApi.distribute({
						ids,
						ownerId: distributeDialog.ownerId
					});
				} catch (_unused18) {
					return ElMessage.error("分配失败");
				}
				selectedRows.value = [];
				distributeDialog.visible = false;
				ElMessage.success("已分配");
				yield fetchLeads();
			});
			return function submitDistribute() {
				return _ref16.apply(this, arguments);
			};
		}();
		const handleMore = (cmd) => {
			if (cmd === "import") router.push({ path: "/customer/lead/import" });
			else if (cmd === "export") doExport();
			else if (cmd === "rules") router.push("/sys-flow/pool-admin");
			else if (cmd === "recycle") handleRunRecycle();
			else if (cmd === "duplicate") {
				dupDialog.field = "phone";
				dupDialog.value = "";
				dupDialog.searched = false;
				dupDialog.results = [];
				dupDialog.visible = true;
			}
		};
		const normalizeMoneyText = (value) => {
			if (!value) return "";
			const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
			return match ? match[0] : "";
		};
		const doExport = () => {
			if (!canExportLeads.value) return ElMessage.error("仅超级管理员可导出线索");
			const rows = filteredList.value;
			if (!rows.length) return ElMessage.warning("当前没有可导出数据");
			const lines = [[
				"公司名称",
				"联系人(法定代表人)",
				"有效手机号",
				"企业联系电话",
				"成立日期",
				"登记状态",
				"统一社会信用代码",
				"注册地址",
				"来源",
				"跟进状态",
				"负责人",
				"最近跟进",
				"创建时间"
			].join(",")];
			rows.forEach((r) => {
				lines.push([
					leadCompanyName(r),
					leadContactName(r),
					r.phone,
					r.companyPhone || "",
					r.registerDate || "",
					r.registerStatus || "",
					r.creditCode || "",
					leadAddressText(r),
					sourceLabel(r.source),
					statusLabel(r.status),
					r.ownerName || "公海",
					r.lastFollowTime || "",
					r.createTime
				].map(escapeCsvCell).join(","));
			});
			const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `线索导出_${Date.now()}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			ElMessage.success(`已导出 ${rows.length} 条`);
		};
		const dupDialog = reactive({
			visible: false,
			field: "phone",
			value: "",
			searched: false,
			results: []
		});
		const runDuplicate = function() {
			var _ref17 = _asyncToGenerator(function* () {
				const v = dupDialog.value.trim();
				if (!v) return ElMessage.warning("请输入查重值");
				try {
					const resp = yield leadApi.checkDuplicate({ [dupDialog.field]: v });
					const data = resp && resp.data || resp;
					dupDialog.results = Array.isArray(data) ? data.map(mapBackendLead) : [];
				} catch (_unused19) {
					dupDialog.results = [];
				}
				dupDialog.searched = true;
			});
			return function runDuplicate() {
				return _ref17.apply(this, arguments);
			};
		}();
		const rowFreqState = (row) => computeFollowFrequencyState(row);
		const convStats = ref(null);
		const loadClosedLoopStats = function() {
			var _ref18 = _asyncToGenerator(function* () {
				try {
					convStats.value = yield leadApi.conversionStats();
				} catch (_unused20) {}
			});
			return function loadClosedLoopStats() {
				return _ref18.apply(this, arguments);
			};
		}();
		const leadSummary = ref(null);
		const summaryIndex = ref(0);
		let summaryRollTimer = null;
		const loadLeadSummary = function() {
			var _ref19 = _asyncToGenerator(function* () {
				try {
					const res = yield leadApi.summary();
					if (res && res.month && res.year) leadSummary.value = res;
				} catch (_unused21) {}
			});
			return function loadLeadSummary() {
				return _ref19.apply(this, arguments);
			};
		}();
		const fmtAmount = (n) => {
			const v = Number(n || 0);
			return v % 1 === 0 ? v.toLocaleString("zh-CN") : v.toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			});
		};
		computed(() => {
			if (!leadSummary.value) return "";
			const scope = summaryIndex.value === 0 ? "本月" : "本年";
			const b = summaryIndex.value === 0 ? leadSummary.value.month : leadSummary.value.year;
			return `${scope}有效客资 ${b.validLeads} 条、非刻章有效 ${b.nonSealValidLeads} 条、刻章有效 ${b.sealValidLeads} 条、非刻章转化 ${b.nonSealConverted} 条、非刻章转化率 ${b.nonSealConvRate}%、非刻章成交 ${fmtAmount(b.nonSealDealAmount)} 元`;
		});
		const startSummaryRoll = () => {
			stopSummaryRoll();
			summaryRollTimer = window.setInterval(() => {
				summaryIndex.value = summaryIndex.value === 0 ? 1 : 0;
			}, 4e3);
		};
		const stopSummaryRoll = () => {
			if (summaryRollTimer) {
				clearInterval(summaryRollTimer);
				summaryRollTimer = null;
			}
		};
		const handleRunRecycle = function() {
			var _ref20 = _asyncToGenerator(function* () {
				yield ElMessageBox.confirm("立即扫描\"超15天未跟进且已过保护期\"的客资并退回公海(定时任务每日02:00也会自动执行)。确认现在执行？", "立即执行回收", { type: "warning" });
				try {
					const n = yield leadApi.runRecycle();
					ElMessage.success(`本次回收 ${n !== null && n !== void 0 ? n : 0} 条线索回公海`);
					fetchLeads();
					loadClosedLoopStats();
				} catch (_unused22) {}
			});
			return function handleRunRecycle() {
				return _ref20.apply(this, arguments);
			};
		}();
		onMounted(_asyncToGenerator(function* () {
			yield loadOwners();
			yield loadResourcePoolIds();
			fetchLeads();
			loadClosedLoopStats();
			if (isOnlineTab.value) {
				loadLeadSummary();
				startSummaryRoll();
			}
			nowTimer = window.setInterval(() => {
				nowTick.value = Date.now();
			}, 1e3);
		}));
		onBeforeUnmount(() => {
			if (nowTimer) {
				clearInterval(nowTimer);
				nowTimer = null;
			}
			stopSummaryRoll();
			clearActionCountdown();
		});
		return (_ctx, _cache) => {
			const _component_el_segmented = ElSegmented;
			const _component_el_alert = ElAlert;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_badge = ElBadge;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_table_column = ElTableColumn;
			const _component_el_tag = ElTag;
			const _component_el_table = ElTable;
			const _component_el_pagination = ElPagination;
			const _component_el_form_item = ElFormItem;
			const _component_el_col = ElCol;
			const _component_el_row = ElRow;
			const _component_el_input_number = ElInputNumber;
			const _component_el_upload = ElUpload;
			const _component_el_form = ElForm;
			const _component_el_scrollbar = ElScrollbar;
			const _component_el_dialog = ElDialog;
			const _component_el_radio = ElRadio;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_descriptions_item = ElDescriptionsItem;
			const _component_el_descriptions = ElDescriptions;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [_cache[64] || (_cache[64] = createBaseVNode("h1", null, "找客户", -1)), createBaseVNode("p", null, toDisplayString(isHistoryTab.value ? "查看权限范围内已经拨打并回收的历史客资，让客户重新轮转。" : "从公司公海和高价值客资中寻找客户"), 1)]),
					createVNode(_component_el_segmented, {
						class: "resource-tabs",
						"model-value": activeTab.value,
						options: resourceTabOptions,
						onChange: changeResourceTab
					}, null, 8, ["model-value"]),
					createBaseVNode("div", _hoisted_4, [convStats.value ? (openBlock(), createElementBlock("div", _hoisted_5, [
						_cache[65] || (_cache[65] = createTextVNode(" 线索 ", -1)),
						createBaseVNode("b", null, toDisplayString(convStats.value.total), 1),
						_cache[66] || (_cache[66] = createTextVNode(" · 转化中 ", -1)),
						createBaseVNode("b", null, toDisplayString(convStats.value.converting), 1),
						_cache[67] || (_cache[67] = createTextVNode(" · 已转化 ", -1)),
						createBaseVNode("b", null, toDisplayString(convStats.value.converted), 1),
						_cache[68] || (_cache[68] = createTextVNode(" · 转化率 ", -1)),
						createBaseVNode("b", null, toDisplayString(convStats.value.conversionRate) + "%", 1)
					])) : createCommentVNode("", true)])
				]),
				poolConfigLoaded.value && activeTab.value === "treasure" && !treasurePoolId.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					class: "pool-config-alert",
					title: "当前租户没有启用的高价值公海池",
					description: "本页不会使用历史固定编号代替真实配置；请由管理员先维护公海池配置。",
					type: "warning",
					closable: false,
					"show-icon": ""
				})) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_6, [createBaseVNode("div", _hoisted_7, [
					createVNode(_component_el_select, {
						modelValue: queryParams.source,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => queryParams.source = $event),
						placeholder: "来源",
						clearable: "",
						style: { "width": "120px" },
						onChange: handleSearch
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(LEAD_SOURCE_OPTIONS), (item) => {
							return openBlock(), createBlock(_component_el_option, {
								key: item.value,
								label: item.label,
								value: item.value
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]),
					!isHistoryTab.value ? (openBlock(), createBlock(_component_el_select, {
						key: 0,
						modelValue: queryParams.status,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => queryParams.status = $event),
						placeholder: "生命周期",
						clearable: "",
						style: { "width": "120px" },
						onChange: handleSearch
					}, {
						default: withCtx(() => [
							createVNode(_component_el_option, {
								label: "新建",
								value: 1
							}),
							createVNode(_component_el_option, {
								label: "跟进中",
								value: 2
							}),
							createVNode(_component_el_option, {
								label: "已转化",
								value: 3
							}),
							createVNode(_component_el_option, {
								label: "无效",
								value: 4
							})
						]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true),
					isOnlineTab.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
						createVNode(_component_el_select, {
							modelValue: queryParams.level,
							"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => queryParams.level = $event),
							placeholder: "客资分级",
							clearable: "",
							style: { "width": "110px" },
							onChange: handleSearch
						}, {
							default: withCtx(() => [
								createVNode(_component_el_option, {
									label: "A 级",
									value: "A"
								}),
								createVNode(_component_el_option, {
									label: "B 级",
									value: "B"
								}),
								createVNode(_component_el_option, {
									label: "C 级",
									value: "C"
								}),
								createVNode(_component_el_option, {
									label: "D 级",
									value: "D"
								})
							]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: queryParams.ownerId,
							"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => queryParams.ownerId = $event),
							placeholder: "负责人 / 归属",
							clearable: "",
							filterable: "",
							style: { "width": "140px" }
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(ownerOptions.value, (u) => {
								return openBlock(), createBlock(_component_el_option, {
									key: u.id,
									label: u.name,
									value: u.id
								}, null, 8, ["label", "value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_select, {
							modelValue: queryParams.validity,
							"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => queryParams.validity = $event),
							placeholder: "有效性",
							clearable: "",
							style: { "width": "120px" }
						}, {
							default: withCtx(() => [createVNode(_component_el_option, {
								label: "有手机号",
								value: "has"
							}), createVNode(_component_el_option, {
								label: "无手机号",
								value: "none"
							})]),
							_: 1
						}, 8, ["modelValue"]),
						createVNode(_component_el_date_picker, {
							modelValue: queryParams.createRange,
							"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => queryParams.createRange = $event),
							type: "daterange",
							"range-separator": "至",
							"start-placeholder": "创建开始",
							"end-placeholder": "创建结束",
							"value-format": "YYYY-MM-DD",
							"unlink-panels": "",
							style: { "width": "240px" }
						}, null, 8, ["modelValue"])
					], 64)) : createCommentVNode("", true),
					createVNode(_component_el_input, {
						modelValue: queryParams.keyword,
						"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => queryParams.keyword = $event),
						placeholder: "公司名称 / 手机号",
						clearable: "",
						style: { "width": "240px" },
						onKeyup: withKeys(handleSearch, ["enter"])
					}, {
						prefix: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						})]),
						_: 1
					}, 8, ["modelValue"]),
					createVNode(_component_el_button, {
						type: "primary",
						plain: "",
						onClick: handleSearch
					}, {
						default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("查询", -1)])]),
						_: 1
					}),
					createVNode(_component_el_button, {
						plain: "",
						onClick: handleReset
					}, {
						default: withCtx(() => [..._cache[70] || (_cache[70] = [createTextVNode("重置", -1)])]),
						_: 1
					}),
					isOnlineTab.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [createVNode(_component_el_button, {
						plain: "",
						onClick: handleRefresh
					}, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(refresh_default))]),
							_: 1
						}), _cache[71] || (_cache[71] = createTextVNode("刷新客资 ", -1))]),
						_: 1
					}), createVNode(_component_el_badge, {
						value: moreFilterCount.value,
						hidden: moreFilterCount.value === 0,
						type: "primary"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							plain: "",
							onClick: openMoreFilter
						}, {
							default: withCtx(() => [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(filter_default))]),
								_: 1
							}), _cache[72] || (_cache[72] = createTextVNode("更多筛选 ", -1))]),
							_: 1
						})]),
						_: 1
					}, 8, ["value", "hidden"])], 64)) : createCommentVNode("", true)
				]), createBaseVNode("div", _hoisted_8, [createVNode(_component_el_dropdown, {
					trigger: "click",
					onCommand: handleMore
				}, {
					dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
						default: withCtx(() => [
							canBulkImport.value ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 0,
								command: "import"
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(upload_default))]),
									_: 1
								}), _cache[74] || (_cache[74] = createTextVNode("批量导入", -1))]),
								_: 1
							})) : createCommentVNode("", true),
							canExportLeads.value ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 1,
								command: "export"
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(download_default))]),
									_: 1
								}), _cache[75] || (_cache[75] = createTextVNode("导出线索", -1))]),
								_: 1
							})) : createCommentVNode("", true),
							canManageRules.value ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 2,
								divided: "",
								command: "rules"
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(setting_default))]),
									_: 1
								}), _cache[76] || (_cache[76] = createTextVNode("设置公海规则", -1))]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_dropdown_item, { command: "duplicate" }, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(search_default))]),
									_: 1
								}), _cache[77] || (_cache[77] = createTextVNode("查重工具", -1))]),
								_: 1
							}),
							canManageRules.value ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 3,
								divided: "",
								command: "recycle"
							}, {
								default: withCtx(() => [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(refresh_left_default))]),
									_: 1
								}), _cache[78] || (_cache[78] = createTextVNode("立即执行回收(管理员)", -1))]),
								_: 1
							})) : createCommentVNode("", true)
						]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_button, { plain: "" }, {
						default: withCtx(() => [_cache[73] || (_cache[73] = createTextVNode(" 更多", -1)), createVNode(_component_el_icon, { class: "el-icon--right" }, {
							default: withCtx(() => [createVNode(unref(arrow_down_default))]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				})])]),
				selectedRows.value.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_9, [createBaseVNode("span", _hoisted_10, [
					_cache[79] || (_cache[79] = createTextVNode("已选 ", -1)),
					createBaseVNode("em", null, toDisplayString(selectedRows.value.length), 1),
					_cache[80] || (_cache[80] = createTextVNode(" 条", -1))
				]), createBaseVNode("div", _hoisted_11, [
					isHistoryTab.value ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						type: "primary",
						size: "small",
						onClick: handleHistoryReactivate
					}, {
						default: withCtx(() => [..._cache[81] || (_cache[81] = [createTextVNode(" 领取到我的客户 ", -1)])]),
						_: 1
					})) : isPublicPoolTab.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createVNode(_component_el_button, {
						type: "primary",
						size: "small",
						onClick: handleClaim
					}, {
						default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("领取", -1)])]),
						_: 1
					}), canManageSales.value ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						size: "small",
						onClick: openDistribute
					}, {
						default: withCtx(() => [..._cache[83] || (_cache[83] = [createTextVNode("分配", -1)])]),
						_: 1
					})) : createCommentVNode("", true)], 64)) : createCommentVNode("", true),
					!isHistoryTab.value && (!isPublicPoolTab.value || canManageSales.value) ? (openBlock(), createBlock(_component_el_dropdown, {
						key: 2,
						trigger: "click",
						onCommand: handleBatchLevel
					}, {
						dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(BATCH_LEVEL_OPTIONS, (lv) => {
								return createVNode(_component_el_dropdown_item, {
									key: lv.value,
									command: lv.value
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(lv.label), 1)]),
									_: 2
								}, 1032, ["command"]);
							}), 64))]),
							_: 1
						})]),
						default: withCtx(() => [createVNode(_component_el_button, {
							size: "small",
							type: "warning",
							plain: ""
						}, {
							default: withCtx(() => [..._cache[84] || (_cache[84] = [createTextVNode("批量打分级 ▾", -1)])]),
							_: 1
						})]),
						_: 1
					})) : createCommentVNode("", true),
					!isHistoryTab.value && canManageSales.value ? (openBlock(), createBlock(_component_el_button, {
						key: 3,
						size: "small",
						type: "danger",
						plain: "",
						icon: unref(delete_default),
						onClick: handleBatchDelete
					}, {
						default: withCtx(() => [..._cache[85] || (_cache[85] = [createTextVNode("批量删除", -1)])]),
						_: 1
					}, 8, ["icon"])) : createCommentVNode("", true),
					createVNode(_component_el_button, {
						text: "",
						onClick: clearSelection
					}, {
						default: withCtx(() => [..._cache[86] || (_cache[86] = [createTextVNode("取消选择", -1)])]),
						_: 1
					})
				])])) : createCommentVNode("", true),
				createBaseVNode("div", _hoisted_12, [withDirectives((openBlock(), createBlock(_component_el_table, {
					ref_key: "tableRef",
					ref: tableRef,
					data: filteredList.value,
					stripe: "",
					border: "",
					height: "calc(100vh - 320px)",
					onSelectionChange: handleSelectionChange
				}, {
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							type: "selection",
							width: "50",
							selectable: rowSelectable
						}),
						createVNode(_component_el_table_column, {
							label: "公司名称",
							"min-width": "180",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createBaseVNode("a", {
								class: "link-text",
								onClick: ($event) => isPublicPoolTab.value && !canManageSales.value ? openGs(row) : openEdit(row)
							}, toDisplayString(leadCompanyName(row)), 9, _hoisted_13), createVNode(_component_el_button, {
								link: "",
								type: "primary",
								size: "small",
								class: "gs-link",
								onClick: ($event) => openGs(row),
								title: "查看工商信息"
							}, {
								default: withCtx(() => [..._cache[87] || (_cache[87] = [createTextVNode("工商", -1)])]),
								_: 1
							}, 8, ["onClick"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "联系人（法定代表人）",
							"min-width": "150",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(leadContactName(row)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "phone",
							label: "联系电话",
							width: "180"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(unref(formatPhone)(row.phone, false)), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							prop: "registerDate",
							label: "公司注册日期",
							width: "130"
						}),
						createVNode(_component_el_table_column, {
							label: "来源",
							width: "100"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: sourceTagType(row.source),
								effect: "dark"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(sourceLabel(row.source)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "生命周期",
							width: "100"
						}, {
							default: withCtx(({ row }) => [createVNode(_component_el_tag, {
								type: statusTagType(row.status),
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(statusLabel(row.status)), 1)]),
								_: 2
							}, 1032, ["type"])]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "销售阶段",
							width: "128",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.followStatus || (row.status === 1 ? "线索接收" : row.status === 2 ? "需求沟通" : "-")), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "分级",
							width: "64",
							align: "center"
						}, {
							default: withCtx(({ row }) => [row.level ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								type: levelTagType(row.level),
								effect: "dark"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(row.level), 1)]),
								_: 2
							}, 1032, ["type"])) : (openBlock(), createBlock(_component_el_tag, {
								key: 1,
								size: "small",
								type: "info",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[88] || (_cache[88] = [createTextVNode("未分级", -1)])]),
								_: 1
							}))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "负责人",
							prop: "ownerName",
							width: "110"
						}, {
							default: withCtx(({ row }) => [row.ownerName ? (openBlock(), createElementBlock("span", _hoisted_14, toDisplayString(row.ownerName), 1)) : (openBlock(), createElementBlock("span", _hoisted_15, "— 公海 —"))]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "最近跟进",
							prop: "lastFollowTime",
							width: "220"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_16, [createBaseVNode("span", _hoisted_17, toDisplayString(row.lastFollowTime || "—"), 1), createBaseVNode("div", _hoisted_18, [rowFreqState(row).status === "overdue" ? (openBlock(), createElementBlock("span", _hoisted_19, "⚠️ 已超期 " + toDisplayString(rowFreqState(row).overdueDays) + " 天（" + toDisplayString(rowFreqState(row).level) + "级:" + toDisplayString(rowFreqState(row).limit) + "天/次）", 1)) : rowFreqState(row).status === "soon" ? (openBlock(), createElementBlock("span", _hoisted_20, "⏰ 还有 " + toDisplayString(rowFreqState(row).daysToDue) + " 天截止", 1)) : createCommentVNode("", true)])])]),
							_: 1
						}),
						isHistoryTab.value ? (openBlock(), createBlock(_component_el_table_column, {
							key: 0,
							label: "结束原因",
							"min-width": "190",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createBaseVNode("span", null, toDisplayString(row.invalidReason || row.lastFollowContent || "未记录原因"), 1)]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_table_column, {
							label: "创建时间",
							prop: "createTime",
							width: "160"
						}),
						createVNode(_component_el_table_column, {
							label: "操作",
							width: "280",
							fixed: "right"
						}, {
							default: withCtx(({ row }) => [
								isPublicPoolTab.value ? (openBlock(), createBlock(_component_el_button, {
									key: 0,
									size: "small",
									type: "primary",
									link: "",
									onClick: ($event) => handleClaimSingle(row)
								}, {
									default: withCtx(() => [..._cache[89] || (_cache[89] = [createTextVNode("领取", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								isHistoryTab.value ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									size: "small",
									type: "primary",
									link: "",
									onClick: ($event) => handleHistoryReactivateSingle(row)
								}, {
									default: withCtx(() => [..._cache[90] || (_cache[90] = [createTextVNode("领取", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true),
								!isPublicPoolTab.value || canManageSales.value ? (openBlock(), createBlock(_component_el_button, {
									key: 2,
									size: "small",
									link: "",
									onClick: ($event) => openEdit(row)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(isHistoryTab.value ? "查看 / 编辑" : "编辑"), 1)]),
									_: 1
								}, 8, ["onClick"])) : isPublicPoolTab.value && canManageSales.value ? (openBlock(), createBlock(_component_el_button, {
									key: 3,
									size: "small",
									type: "danger",
									link: "",
									onClick: ($event) => handleDelete(row)
								}, {
									default: withCtx(() => [..._cache[91] || (_cache[91] = [createTextVNode("删除", -1)])]),
									_: 1
								}, 8, ["onClick"])) : createCommentVNode("", true)
							]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, loading.value]]), createBaseVNode("div", _hoisted_21, [createVNode(_component_el_pagination, {
					"current-page": queryParams.page,
					"onUpdate:currentPage": _cache[7] || (_cache[7] = ($event) => queryParams.page = $event),
					"page-size": queryParams.size,
					"onUpdate:pageSize": _cache[8] || (_cache[8] = ($event) => queryParams.size = $event),
					"page-sizes": [
						10,
						20,
						50,
						100
					],
					total: totalCount.value,
					layout: "total, sizes, prev, pager, next, jumper",
					background: "",
					onCurrentChange: fetchLeads,
					onSizeChange: handleSizeChange
				}, null, 8, [
					"current-page",
					"page-size",
					"total"
				])])]),
				createVNode(_component_el_dialog, {
					modelValue: formDialog.visible,
					"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => formDialog.visible = $event),
					title: formDialog.isEdit ? "编辑线索" : "新建线索",
					width: "980px",
					top: "5vh",
					class: "lead-form-dialog",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[42] || (_cache[42] = ($event) => formDialog.visible = false) }, {
						default: withCtx(() => [..._cache[98] || (_cache[98] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						disabled: !fieldOptionsReady.value,
						onClick: submitForm
					}, {
						default: withCtx(() => [..._cache[99] || (_cache[99] = [createTextVNode("保存", -1)])]),
						_: 1
					}, 8, ["disabled"])]),
					default: withCtx(() => [createVNode(_component_el_scrollbar, { "max-height": "70vh" }, {
						default: withCtx(() => [createVNode(_component_el_form, {
							ref_key: "formRef",
							ref: formRef,
							model: formData,
							rules: formRules,
							"label-position": "top",
							class: "lead-form"
						}, {
							default: withCtx(() => [
								createBaseVNode("section", _hoisted_22, [_cache[92] || (_cache[92] = createBaseVNode("div", { class: "section-title" }, "基础信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "公司名称",
												prop: "company"
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.company,
													"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => formData.company = $event),
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
													modelValue: formData.legalPerson,
													"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => formData.legalPerson = $event),
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
													modelValue: formData.phone,
													"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => formData.phone = $event),
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
													modelValue: formData.source,
													"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => formData.source = $event),
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
								createBaseVNode("section", _hoisted_23, [_cache[94] || (_cache[94] = createBaseVNode("div", { class: "section-title" }, "投流客资信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户编号" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.leadNo,
													"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => formData.leadNo = $event),
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
													modelValue: formData.createTime,
													"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => formData.createTime = $event),
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
													"model-value": derivedMonth.value,
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
													modelValue: formData.sourcePlatform,
													"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => formData.sourcePlatform = $event),
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
													modelValue: formData.storeBrand,
													"onUpdate:modelValue": _cache[16] || (_cache[16] = ($event) => formData.storeBrand = $event),
													placeholder: "门店 / 品牌词"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "咨询业务" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: formData.consultBusiness,
													"onUpdate:modelValue": _cache[17] || (_cache[17] = ($event) => formData.consultBusiness = $event),
													placeholder: "请选择咨询业务",
													clearable: "",
													filterable: "",
													style: { "width": "100%" },
													loading: unref(consultBusinessLoading),
													disabled: !unref(consultBusinessResolved)
												}, {
													default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(consultBusinessSelectOptions.value, (b) => {
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
													modelValue: formData.nickname,
													"onUpdate:modelValue": _cache[18] || (_cache[18] = ($event) => formData.nickname = $event),
													placeholder: "客户昵称"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "客户微信" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.wechatNo,
													"onUpdate:modelValue": _cache[19] || (_cache[19] = ($event) => formData.wechatNo = $event),
													placeholder: "微信号（可含 -）"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "虚拟电话" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.virtualPhone,
													"onUpdate:modelValue": _cache[20] || (_cache[20] = ($event) => formData.virtualPhone = $event),
													placeholder: "虚拟电话（可含 -）"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "是否有效" }, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: formData.validity,
													"onUpdate:modelValue": _cache[21] || (_cache[21] = ($event) => formData.validity = $event),
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
													modelValue: formData.followStatus,
													"onUpdate:modelValue": _cache[22] || (_cache[22] = ($event) => formData.followStatus = $event),
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
													modelValue: dealAmountNum.value,
													"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => dealAmountNum.value = $event),
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
													modelValue: dealBusinessArr.value,
													"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => dealBusinessArr.value = $event),
													multiple: "",
													placeholder: "可多选",
													filterable: "",
													"collapse-tags": "",
													"collapse-tags-tooltip": "",
													style: { "width": "100%" },
													loading: unref(consultBusinessLoading),
													disabled: !unref(consultBusinessResolved)
												}, {
													default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(dealBusinessSelectOptions.value, (b) => {
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
														default: withCtx(() => [..._cache[93] || (_cache[93] = [createTextVNode("上传附件", -1)])]),
														_: 1
													}, 8, ["icon"])]),
													_: 1
												}, 8, ["http-request"]), createBaseVNode("div", _hoisted_24, [(openBlock(true), createElementBlock(Fragment, null, renderList(leadDocList.value, (d) => {
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
												}), 128)), !leadDocList.value.length ? (openBlock(), createElementBlock("span", _hoisted_25, "可点击上传或在此区域直接粘贴（Ctrl+V）图片")) : createCommentVNode("", true)])], 32)]),
												_: 1
											})]),
											_: 1
										})
									]),
									_: 1
								})]),
								createBaseVNode("section", _hoisted_26, [_cache[95] || (_cache[95] = createBaseVNode("div", { class: "section-title" }, "工商信息", -1)), createVNode(_component_el_row, { gutter: 16 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "登记状态" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.registerStatus,
													"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => formData.registerStatus = $event),
													placeholder: "如：存续、在业、注销"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业规模" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.enterpriseScale,
													"onUpdate:modelValue": _cache[26] || (_cache[26] = ($event) => formData.enterpriseScale = $event),
													placeholder: "如：1-49人"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "企业类型" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.enterpriseType,
													"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => formData.enterpriseType = $event),
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
													modelValue: formData.registeredCapital,
													"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => formData.registeredCapital = $event),
													placeholder: "金额或数值"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 8 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "实缴资本" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.paidCapital,
													"onUpdate:modelValue": _cache[29] || (_cache[29] = ($event) => formData.paidCapital = $event),
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
													modelValue: formData.creditCode,
													"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => formData.creditCode = $event),
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
													modelValue: formData.establishedDate,
													"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => formData.establishedDate = $event),
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
													modelValue: formData.approvedDate,
													"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => formData.approvedDate = $event),
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
													modelValue: formData.insuredCount,
													"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => formData.insuredCount = $event),
													placeholder: "人数"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 4 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属年报" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.insuredYear,
													"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => formData.insuredYear = $event),
													placeholder: "年份"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "所属区域" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.region,
													"onUpdate:modelValue": _cache[35] || (_cache[35] = ($event) => formData.region = $event),
													placeholder: "省 / 市 / 区县"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "来源说明/来源细分" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.sourceDetail,
													"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => formData.sourceDetail = $event),
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
								createBaseVNode("section", _hoisted_27, [_cache[97] || (_cache[97] = createBaseVNode("div", { class: "section-title" }, "地址与经营范围", -1)), createVNode(_component_el_row, { gutter: 16 }, {
									default: withCtx(() => [
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, {
												label: "注册地址",
												prop: "registerAddress"
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.registerAddress,
													"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => formData.registerAddress = $event),
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
													modelValue: formData.latestAddress,
													"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => formData.latestAddress = $event),
													type: "textarea",
													rows: 2,
													placeholder: "实际经营地址/客户联系地址（区别于注册地址）"
												}, null, 8, ["modelValue"]), _cache[96] || (_cache[96] = createBaseVNode("div", { class: "field-tip" }, "填写客户当前实际经营地址或联系地址，与工商注册地址区分", -1))]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "邮箱" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.email,
													"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => formData.email = $event),
													placeholder: "企业邮箱"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 12 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "备注" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.remark,
													"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => formData.remark = $event),
													placeholder: "补充说明"
												}, null, 8, ["modelValue"])]),
												_: 1
											})]),
											_: 1
										}),
										createVNode(_component_el_col, { span: 24 }, {
											default: withCtx(() => [createVNode(_component_el_form_item, { label: "经营范围" }, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: formData.businessScope,
													"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => formData.businessScope = $event),
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
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: distributeDialog.visible,
					"onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => distributeDialog.visible = $event),
					title: "分配线索",
					width: "420px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[45] || (_cache[45] = ($event) => distributeDialog.visible = false) }, {
						default: withCtx(() => [..._cache[100] || (_cache[100] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: submitDistribute
					}, {
						default: withCtx(() => [..._cache[101] || (_cache[101] = [createTextVNode("确认分配", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-width": "90px" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, { label: "负责人" }, {
							default: withCtx(() => [createVNode(_component_el_select, {
								modelValue: distributeDialog.ownerId,
								"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => distributeDialog.ownerId = $event),
								placeholder: "请选择负责人",
								style: { "width": "100%" },
								filterable: ""
							}, {
								default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(ownerOptions.value, (u) => {
									return openBlock(), createBlock(_component_el_option, {
										key: u.id,
										label: u.name,
										value: u.id
									}, null, 8, ["label", "value"]);
								}), 128))]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: recycleConfirm.visible,
					"onUpdate:modelValue": _cache[48] || (_cache[48] = ($event) => recycleConfirm.visible = $event),
					title: "线索回收公海",
					width: "440px",
					onClosed: clearActionCountdown
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[47] || (_cache[47] = ($event) => recycleConfirm.visible = false) }, {
						default: withCtx(() => [..._cache[102] || (_cache[102] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "warning",
						disabled: actionCountdown.value > 0,
						loading: recycleConfirm.submitting,
						onClick: confirmRecycle
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(actionCountdown.value > 0 ? `确认移入公海(${actionCountdown.value}s)` : "确认移入公海"), 1)]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					default: withCtx(() => [_cache[103] || (_cache[103] = createBaseVNode("div", { class: "danger-confirm" }, [createBaseVNode("p", { class: "danger-confirm-text" }, " 确定要将该客资释放放到公海池吗?释放后您将失去该线索跟进权限,后续其他销售可重新领取跟进,是否确认? ")], -1))]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: deleteConfirm.visible,
					"onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => deleteConfirm.visible = $event),
					title: "删除线索风险提示",
					width: "440px",
					onClosed: clearActionCountdown
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[49] || (_cache[49] = ($event) => deleteConfirm.visible = false) }, {
						default: withCtx(() => [..._cache[104] || (_cache[104] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "danger",
						disabled: actionCountdown.value > 0,
						loading: deleteConfirm.submitting,
						onClick: confirmDelete
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(actionCountdown.value > 0 ? `永久删除(${actionCountdown.value}s)` : "永久删除"), 1)]),
						_: 1
					}, 8, ["disabled", "loading"])]),
					default: withCtx(() => [_cache[105] || (_cache[105] = createBaseVNode("div", { class: "danger-confirm" }, [createBaseVNode("p", { class: "danger-confirm-text" }, " 删除后该客户跟进记录、联系方式、业务信息将永久删除,数据无法恢复,是否确认删除? ")], -1))]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: dupDialog.visible,
					"onUpdate:modelValue": _cache[54] || (_cache[54] = ($event) => dupDialog.visible = $event),
					title: "查重工具",
					width: "640px"
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[53] || (_cache[53] = ($event) => dupDialog.visible = false) }, {
						default: withCtx(() => [..._cache[109] || (_cache[109] = [createTextVNode("关闭", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, { inline: "" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "查重字段" }, {
								default: withCtx(() => [createVNode(_component_el_radio_group, {
									modelValue: dupDialog.field,
									"onUpdate:modelValue": _cache[51] || (_cache[51] = ($event) => dupDialog.field = $event)
								}, {
									default: withCtx(() => [createVNode(_component_el_radio, { label: "phone" }, {
										default: withCtx(() => [..._cache[106] || (_cache[106] = [createTextVNode("手机号", -1)])]),
										_: 1
									}), createVNode(_component_el_radio, { label: "name" }, {
										default: withCtx(() => [..._cache[107] || (_cache[107] = [createTextVNode("公司名称", -1)])]),
										_: 1
									})]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "查重值" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: dupDialog.value,
									"onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => dupDialog.value = $event),
									placeholder: "请输入要查重的内容",
									style: { "width": "240px" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_button, {
								type: "primary",
								onClick: runDuplicate
							}, {
								default: withCtx(() => [..._cache[108] || (_cache[108] = [createTextVNode("查重", -1)])]),
								_: 1
							})
						]),
						_: 1
					}), dupDialog.searched ? (openBlock(), createElementBlock("div", _hoisted_28, [createVNode(_component_el_alert, {
						title: `匹配到 ${dupDialog.results.length} 条记录`,
						type: dupDialog.results.length ? "warning" : "success",
						closable: false,
						"show-icon": ""
					}, null, 8, ["title", "type"]), dupDialog.results.length ? (openBlock(), createBlock(_component_el_table, {
						key: 0,
						data: dupDialog.results,
						size: "small",
						border: "",
						style: { "margin-top": "12px" }
					}, {
						default: withCtx(() => [
							createVNode(_component_el_table_column, { label: "公司名称" }, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(leadCompanyName(row)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, { label: "联系人" }, {
								default: withCtx(({ row }) => [createTextVNode(toDisplayString(leadContactName(row)), 1)]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								prop: "phone",
								label: "手机号"
							}),
							createVNode(_component_el_table_column, {
								prop: "ownerName",
								label: "负责人"
							})
						]),
						_: 1
					}, 8, ["data"])) : createCommentVNode("", true)])) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: gsDrawer.visible,
					"onUpdate:modelValue": _cache[55] || (_cache[55] = ($event) => gsDrawer.visible = $event),
					title: `工商信息 · ${gsDrawer.row ? leadCompanyName(gsDrawer.row) : ""}`,
					size: "600px",
					"destroy-on-close": ""
				}, {
					default: withCtx(() => [gsDrawer.row ? (openBlock(), createBlock(_component_el_descriptions, {
						key: 0,
						column: 1,
						border: "",
						size: "small"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_descriptions_item, { label: "公司名称" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(leadCompanyName(gsDrawer.row)), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "法定代表人" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.legalPerson || leadContactName(gsDrawer.row) || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "统一社会信用代码" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.creditCode || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "登记状态" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.registerStatus || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "企业类型" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.enterpriseType || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "注册资本" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.registeredCapital || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "实缴资本" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.paidCapital || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "成立日期" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.establishedDate || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "核准日期" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.approvedDate || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "参保人数" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.insuredCount || "—"), 1), gsDrawer.row.insuredYear ? (openBlock(), createElementBlock("span", _hoisted_29, "（" + toDisplayString(gsDrawer.row.insuredYear) + "）", 1)) : createCommentVNode("", true)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "联系电话" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.phone || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "邮箱" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.email || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "注册地址" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.registerAddress || "—"), 1)]),
								_: 1
							}),
							createVNode(_component_el_descriptions_item, { label: "经营范围" }, {
								default: withCtx(() => [createTextVNode(toDisplayString(gsDrawer.row.businessScope || "—"), 1)]),
								_: 1
							})
						]),
						_: 1
					})) : createCommentVNode("", true), createBaseVNode("div", _hoisted_30, [createVNode(_component_el_button, {
						size: "small",
						type: "primary",
						plain: "",
						onClick: editFromGs
					}, {
						default: withCtx(() => [..._cache[110] || (_cache[110] = [createTextVNode("去编辑", -1)])]),
						_: 1
					})])]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_drawer, {
					modelValue: moreFilterVisible.value,
					"onUpdate:modelValue": _cache[63] || (_cache[63] = ($event) => moreFilterVisible.value = $event),
					title: "更多筛选",
					size: "420px",
					"append-to-body": true
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: resetMoreFilter }, {
						default: withCtx(() => [..._cache[114] || (_cache[114] = [createTextVNode("清空更多", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						onClick: applyMoreFilter
					}, {
						default: withCtx(() => [..._cache[115] || (_cache[115] = [createTextVNode("应用筛选", -1)])]),
						_: 1
					})]),
					default: withCtx(() => [createVNode(_component_el_form, {
						"label-position": "top",
						class: "more-filter-form"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, { label: "所属地区 / 注册地址(关键词)" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.region,
									"onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => queryParams.region = $event),
									placeholder: "如:杭州、余杭、浙江",
									clearable: ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "行业 / 经营范围(关键词)" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.industry,
									"onUpdate:modelValue": _cache[57] || (_cache[57] = ($event) => queryParams.industry = $event),
									placeholder: "如:科技、贸易、餐饮",
									clearable: ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "企业规模(关键词)" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: queryParams.scale,
									"onUpdate:modelValue": _cache[58] || (_cache[58] = ($event) => queryParams.scale = $event),
									placeholder: "如:1-49人、50-99人",
									clearable: ""
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "注册资本区间(万)" }, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_31, [
									createVNode(_component_el_input_number, {
										modelValue: queryParams.capitalMin,
										"onUpdate:modelValue": _cache[59] || (_cache[59] = ($event) => queryParams.capitalMin = $event),
										min: 0,
										controls: false,
										placeholder: "最小",
										style: { "width": "130px" }
									}, null, 8, ["modelValue"]),
									_cache[111] || (_cache[111] = createBaseVNode("span", { class: "muted" }, "—", -1)),
									createVNode(_component_el_input_number, {
										modelValue: queryParams.capitalMax,
										"onUpdate:modelValue": _cache[60] || (_cache[60] = ($event) => queryParams.capitalMax = $event),
										min: 0,
										controls: false,
										placeholder: "最大",
										style: { "width": "130px" }
									}, null, 8, ["modelValue"])
								]), _cache[112] || (_cache[112] = createBaseVNode("div", { class: "field-tip" }, "按注册资本文本解析出的数值(万)过滤,无法解析的记录会被排除", -1))]),
								_: 1
							}),
							createVNode(_component_el_form_item, { label: "成立日期区间" }, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_32, [
									createVNode(_component_el_date_picker, {
										modelValue: queryParams.establishedStart,
										"onUpdate:modelValue": _cache[61] || (_cache[61] = ($event) => queryParams.establishedStart = $event),
										type: "date",
										placeholder: "开始日期",
										"value-format": "YYYY-MM-DD",
										style: { "width": "150px" }
									}, null, 8, ["modelValue"]),
									_cache[113] || (_cache[113] = createBaseVNode("span", { class: "muted" }, "—", -1)),
									createVNode(_component_el_date_picker, {
										modelValue: queryParams.establishedEnd,
										"onUpdate:modelValue": _cache[62] || (_cache[62] = ($event) => queryParams.establishedEnd = $event),
										type: "date",
										placeholder: "结束日期",
										"value-format": "YYYY-MM-DD",
										style: { "width": "150px" }
									}, null, 8, ["modelValue"])
								])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-97f9b3e4"]]);
//#endregion
export { lead_default as default };

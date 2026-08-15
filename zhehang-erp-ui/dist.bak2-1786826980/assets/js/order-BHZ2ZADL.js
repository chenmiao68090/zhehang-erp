import { V as _asyncToGenerator, g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { i as put, n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/api/order.ts
function calcApprovalLevel(finalAmount) {
	if (finalAmount > 200) return 2;
	return 1;
}
function approvalLevelLabel(level) {
	return level <= 1 ? "一级审批" : "二级审批";
}
function approvalLevelChain(level) {
	if (level === 1) return ["主管审批"];
	return ["主管审批", "财务确认"];
}
function calcApprovalDeadline(submitISO) {
	const d = new Date(submitISO.replace(" ", "T"));
	const hour = d.getHours();
	const dl = new Date(d);
	if (hour < 12) {
		dl.setHours(18, 0, 0, 0);
		return {
			deadline: fmtTime(dl),
			moment: "am"
		};
	}
	dl.setDate(dl.getDate() + 1);
	dl.setHours(12, 0, 0, 0);
	return {
		deadline: fmtTime(dl),
		moment: "pm"
	};
}
function fmtTime(d) {
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
/** 拦截器 resolve 的是 R 信封 data 载荷，这里兜底取 data（兼容已直接返回载荷的情况） */
function unwrap(res) {
	if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
	return res;
}
/** IPage -> {list,total} */
function toPage(data) {
	const list = Array.isArray(data === null || data === void 0 ? void 0 : data.records) ? data.records : Array.isArray(data === null || data === void 0 ? void 0 : data.list) ? data.list : [];
	return {
		list,
		total: Number((data === null || data === void 0 ? void 0 : data.total) || list.length || 0)
	};
}
var num = (v) => v === null || v === void 0 || v === "" ? 0 : Number(v) || 0;
var fmtDateTime = (v) => v ? String(v).replace("T", " ").slice(0, 19) : "";
var fmtDate = (v) => v ? String(v).slice(0, 10) : "";
var BACKEND_STATUS_TO_VIEW = {
	1: "draft",
	2: "pending_approval",
	3: "pending_finance",
	4: "completed",
	5: "completed",
	6: "cancelled",
	7: "rejected"
};
/** 前端状态筛选值 → 后端整数 status（用于列表筛选下传） */
function viewStatusToBackend(status) {
	switch (status) {
		case "draft": return 1;
		case "pending_approval": return 2;
		case "pending_finance": return 3;
		case "completed": return 4;
		case "cancelled": return 6;
		case "rejected": return 7;
		default: return;
	}
}
var PERIOD_TO_MONTHS = {
	"1month": 1,
	"3month": 3,
	"6month": 6,
	"1year": 12,
	"2year": 24,
	"3year": 36,
	one_time: 0
};
function monthsToPeriod(m) {
	switch (Number(m)) {
		case 1: return "1month";
		case 3: return "3month";
		case 6: return "6month";
		case 12: return "1year";
		case 24: return "2year";
		case 36: return "3year";
		default: return "one_time";
	}
}
var SERVICE_TYPES = [
	"bookkeeping",
	"registration",
	"tax_planning",
	"qualification",
	"audit",
	"cancellation",
	"other"
];
function normServiceType(v) {
	return SERVICE_TYPES.includes(v) ? v : "other";
}
function parseMeta(attachments) {
	if (!attachments) return {};
	try {
		const v = JSON.parse(attachments);
		return v && typeof v === "object" && !Array.isArray(v) ? v : {};
	} catch (_unused) {
		return {};
	}
}
function adaptItem(it, idx, orderNo) {
	const amount = num(it.unitPrice) * (Number(it.quantity) || 1);
	const discountRate = it.discountRate === null || it.discountRate === void 0 ? 100 : num(it.discountRate);
	const finalAmount = it.subtotal !== null && it.subtotal !== void 0 ? num(it.subtotal) : Math.round(amount * discountRate / 100);
	return {
		id: Number(it.id || 0),
		itemNo: it.itemCode || `${orderNo}-${String(idx + 1).padStart(3, "0")}`,
		orderId: Number(it.orderId || 0),
		serviceType: normServiceType(it.itemType),
		servicePeriod: monthsToPeriod(num(it.serviceMonths)),
		startDate: "",
		endDate: "",
		description: it.description || it.itemName || "",
		specialRequirement: "",
		amount,
		discountRate,
		finalAmount,
		itemStatus: "pending"
	};
}
function adaptOrder(o, items = [], approvals = []) {
	var _meta$discountRate, _meta$depositAmount, _meta$commissionRate;
	const meta = parseMeta(o.attachments);
	const statusInt = Number(o.status || 1);
	const status = BACKEND_STATUS_TO_VIEW[statusInt] || "draft";
	const orderNo = o.orderNo || "";
	const viewItems = (items || []).map((it, idx) => adaptItem(it, idx, orderNo));
	const totalAmount = o.totalAmount !== null && o.totalAmount !== void 0 ? num(o.totalAmount) : viewItems.reduce((s, i) => s + i.amount, 0);
	const finalAmount = o.payableAmount !== null && o.payableAmount !== void 0 ? num(o.payableAmount) : viewItems.reduce((s, i) => s + i.finalAmount, 0);
	const discountRate = (_meta$discountRate = meta.discountRate) !== null && _meta$discountRate !== void 0 ? _meta$discountRate : totalAmount > 0 ? Math.round(finalAmount / totalAmount * 100) : 100;
	const depositAmount = (_meta$depositAmount = meta.depositAmount) !== null && _meta$depositAmount !== void 0 ? _meta$depositAmount : 0;
	const commissionRate = (_meta$commissionRate = meta.commissionRate) !== null && _meta$commissionRate !== void 0 ? _meta$commissionRate : 0;
	const submitTime = fmtDateTime(o.submitTime) || fmtDateTime(o.createTime);
	const approvalLevel = calcApprovalLevel(finalAmount);
	const deadlineInfo = submitTime ? calcApprovalDeadline(submitTime) : {
		deadline: "",
		moment: ""
	};
	const pending = status === "pending_approval" || status === "pending_finance";
	const approveAp = approvals.find((a) => a.node === "approve");
	const financeAp = approvals.find((a) => a.node === "finance_confirm");
	const rejectAp = approvals.find((a) => a.node === "reject");
	approvals.find((a) => a.node === "cancel");
	const linkageLogs = (approvals || []).filter((a) => a.node !== "submit").map((a) => ({
		time: fmtDateTime(a.approveTime) || fmtDateTime(a.createTime),
		type: "approval",
		title: {
			approve: "主管审批",
			finance_confirm: "财务确认",
			reject: "审批驳回",
			cancel: "订单取消"
		}[a.node] || a.node,
		desc: [a.approverRole, a.comment].filter(Boolean).join(" · ") || "—"
	}));
	return {
		id: Number(o.id || 0),
		orderNo,
		customerId: Number(o.customerId || 0),
		customerName: o.customerName || "",
		submitterId: Number(o.salesmanId || 0),
		submitterName: o.salesmanName || meta.submitterName || "",
		submitTime,
		status,
		totalAmount,
		discountRate,
		finalAmount,
		depositAmount,
		pendingAmount: Math.max(0, finalAmount - depositAmount),
		paymentMethod: meta.paymentMethod || "lump_sum",
		paymentTimeReq: meta.paymentTimeReq || "",
		commissionRate,
		commissionAmount: Math.round(finalAmount * commissionRate / 100),
		confirmMethod: meta.confirmMethod || "wechat",
		confirmScreenshot: meta.confirmScreenshot || "",
		expectedSignDate: meta.expectedSignDate || fmtDate(o.serviceStartDate),
		specialAgreement: meta.specialAgreement || "",
		approverId: Number((approveAp === null || approveAp === void 0 ? void 0 : approveAp.approverId) || 0),
		approvalTime: fmtDateTime(o.approveTime) || fmtDateTime(approveAp === null || approveAp === void 0 ? void 0 : approveAp.approveTime),
		approvalOpinion: (approveAp === null || approveAp === void 0 ? void 0 : approveAp.comment) || ((rejectAp === null || rejectAp === void 0 ? void 0 : rejectAp.comment) && statusInt === 7 ? rejectAp.comment : ""),
		financeConfirmerId: Number((financeAp === null || financeAp === void 0 ? void 0 : financeAp.approverId) || 0),
		financeConfirmTime: fmtDateTime(o.financeConfirmTime) || fmtDateTime(financeAp === null || financeAp === void 0 ? void 0 : financeAp.approveTime),
		financeOpinion: (financeAp === null || financeAp === void 0 ? void 0 : financeAp.comment) || "",
		bossApproverId: 0,
		bossApprovalTime: "",
		bossOpinion: "",
		approvalLevel,
		approvalDeadline: pending ? deadlineInfo.deadline : "",
		submitMoment: pending ? deadlineInfo.moment : "",
		rejectStage: statusInt === 7 ? financeAp ? "finance" : "manager" : "",
		rejectReasonType: "",
		rejectReason: statusInt === 7 ? (rejectAp === null || rejectAp === void 0 ? void 0 : rejectAp.comment) || "" : "",
		linkageLogs,
		items: viewItems,
		remark: statusInt === 6 ? o.cancelReason ? `${o.remark || ""}【取消原因】${o.cancelReason}` : o.remark || "" : o.remark || "",
		createTime: fmtDateTime(o.createTime)
	};
}
function toBackendItems(items = []) {
	return items.map((it, idx) => {
		var _it$discountRate, _it$finalAmount, _it$discountRate2, _PERIOD_TO_MONTHS$it$;
		return {
			itemCode: it.itemNo || void 0,
			itemName: it.description || "",
			itemType: it.serviceType,
			unitPrice: it.amount || 0,
			quantity: 1,
			discountRate: (_it$discountRate = it.discountRate) !== null && _it$discountRate !== void 0 ? _it$discountRate : 100,
			subtotal: (_it$finalAmount = it.finalAmount) !== null && _it$finalAmount !== void 0 ? _it$finalAmount : Math.round((it.amount || 0) * ((_it$discountRate2 = it.discountRate) !== null && _it$discountRate2 !== void 0 ? _it$discountRate2 : 100) / 100),
			serviceMonths: (_PERIOD_TO_MONTHS$it$ = PERIOD_TO_MONTHS[it.servicePeriod]) !== null && _PERIOD_TO_MONTHS$it$ !== void 0 ? _PERIOD_TO_MONTHS$it$ : 0,
			description: it.description || "",
			sortOrder: idx
		};
	});
}
/** 视图表单 -> 后端 body（含 items 与寄存 attachments 的 meta） */
function toBackendBody(data) {
	var _data$discountRate, _items$;
	const items = Array.isArray(data.items) ? data.items : [];
	const totalAmount = items.reduce((s, i) => s + (i.amount || 0), 0);
	const itemsFinal = items.reduce((s, i) => s + (i.finalAmount || 0), 0);
	const orderRate = (_data$discountRate = data.discountRate) !== null && _data$discountRate !== void 0 ? _data$discountRate : 100;
	const finalAmount = Math.round(itemsFinal * orderRate / 100);
	const meta = {
		discountRate: data.discountRate,
		depositAmount: data.depositAmount,
		commissionRate: data.commissionRate,
		paymentMethod: data.paymentMethod,
		paymentTimeReq: data.paymentTimeReq,
		confirmMethod: data.confirmMethod,
		confirmScreenshot: data.confirmScreenshot,
		expectedSignDate: data.expectedSignDate,
		specialAgreement: data.specialAgreement,
		submitterName: data.submitterName
	};
	const body = {
		customerId: data.customerId,
		customerName: data.customerName,
		salesmanName: data.submitterName,
		orderType: "new",
		serviceType: ((_items$ = items[0]) === null || _items$ === void 0 ? void 0 : _items$.serviceType) || "other",
		totalAmount,
		discountAmount: Math.max(0, totalAmount - finalAmount),
		payableAmount: finalAmount,
		remark: data.remark || "",
		attachments: JSON.stringify(meta),
		items: toBackendItems(items)
	};
	if (data.expectedSignDate) body.serviceStartDate = data.expectedSignDate;
	return body;
}
var orderApi = {
	/**
	* GET /order/list
	* 后端支持 status(整数)/customerId/orderNo 过滤；
	* keyword(客户/编号/提单人) 与 客户名/提单人/日期范围/overdueOnly 由本地在当前页结果上过滤（后端无该维度）。
	*/
	list() {
		return _asyncToGenerator(function* (params = {}) {
			const page = toPage(unwrap(yield get("/order/list", {
				pageNum: params.page || 1,
				pageSize: params.pageSize || 10,
				status: viewStatusToBackend(params.status),
				orderNo: params.orderNo || (params.keyword && /^[A-Za-z]/.test(params.keyword.trim()) ? params.keyword.trim() : void 0)
			})));
			let list = page.list.map((o) => adaptOrder(o));
			let total = page.total;
			if (params.status === "pending_boss") return {
				list: [],
				total: 0
			};
			const k = (params.keyword || "").trim();
			if (k && !/^[A-Za-z]/.test(k)) list = list.filter((o) => o.orderNo.includes(k) || (o.customerName || "").includes(k) || (o.submitterName || "").includes(k));
			if (params.customerName) list = list.filter((o) => (o.customerName || "").includes(params.customerName));
			if (params.submitterName) list = list.filter((o) => (o.submitterName || "").includes(params.submitterName));
			if (params.startDate) list = list.filter((o) => o.submitTime >= params.startDate);
			if (params.endDate) list = list.filter((o) => o.submitTime <= params.endDate + " 23:59:59");
			if (params.overdueOnly) list = list.filter((o) => isOverdue(o));
			if (list.length !== page.list.length) total = list.length;
			return {
				list,
				total
			};
		}).apply(this, arguments);
	},
	/** GET /order/{id}（后端返回 {order,items,approvals}，合并成单一视图对象） */
	detail(id) {
		return _asyncToGenerator(function* () {
			const data = unwrap(yield get(`/order/${id}`));
			if (!data || !data.order) return null;
			return adaptOrder(data.order, data.items || [], data.approvals || []);
		})();
	},
	/** POST /order（返回新建 id，再拉详情回视图形状） */
	create(data) {
		var _this = this;
		return _asyncToGenerator(function* () {
			const id = unwrap(yield post("/order", toBackendBody(data)));
			return (yield _this.detail(Number(id))) || _objectSpread2(_objectSpread2({}, data), {}, {
				id: Number(id),
				status: "draft"
			});
		})();
	},
	/** PUT /order/{id}（后端状态 >=4 不可改） */
	update(data) {
		var _this2 = this;
		return _asyncToGenerator(function* () {
			yield put(`/order/${data.id}`, toBackendBody(data));
			return (yield _this2.detail(data.id)) || _objectSpread2({}, data);
		})();
	},
	/** POST /order/{id}/submit（草稿/驳回 → 待审批；后端记审批流水） */
	submit(id) {
		var _this3 = this;
		return _asyncToGenerator(function* () {
			yield post(`/order/${id}/submit`, {});
			return yield _this3.detail(id);
		})();
	},
	/** POST /order/{id}/approve（主管审批通过 → 状态 3 待财务确认） */
	approve(payload) {
		var _this4 = this;
		return _asyncToGenerator(function* () {
			yield post(`/order/${payload.id}/approve`, {
				approverId: payload.approverId || void 0,
				comment: payload.opinion || void 0
			});
			return yield _this4.detail(payload.id);
		})();
	},
	/**
	* POST /order/{id}/reject（驳回 → 状态 7）
	* 后端只接收 {approverId,comment}；reasonType/stage 不持久化（合入 comment 文案）。
	*/
	reject(payload) {
		var _this5 = this;
		return _asyncToGenerator(function* () {
			yield post(`/order/${payload.id}/reject`, {
				approverId: payload.approverId || void 0,
				comment: payload.opinion || void 0
			});
			return yield _this5.detail(payload.id);
		})();
	},
	/**
	* POST /order/{id}/finance-confirm（财务确认 → 状态 4，前端视为 completed）
	* 后端财务确认即闭环：合同处理/提成等由后端自动编排，无需前端触发。
	*/
	financeConfirm(payload) {
		var _this6 = this;
		return _asyncToGenerator(function* () {
			yield post(`/order/${payload.id}/finance-confirm`, {
				approverId: payload.financeConfirmerId || void 0,
				comment: payload.opinion || void 0
			});
			return yield _this6.detail(payload.id);
		})();
	},
	/** 兼容旧调用：老板终审节点已取消，财务确认即闭环。 */
	bossApprove(payload) {
		var _this7 = this;
		return _asyncToGenerator(function* () {
			const o = yield _this7.detail(payload.id);
			if (o && o.status === "pending_finance") return _this7.financeConfirm({
				id: payload.id,
				financeConfirmerId: payload.bossApproverId,
				opinion: payload.opinion
			});
			return o || { id: payload.id };
		})();
	},
	/** POST /order/{id}/cancel（→ 状态 6） */
	cancel(id, reason) {
		var _this8 = this;
		return _asyncToGenerator(function* () {
			yield post(`/order/${id}/cancel`, { reason: reason || void 0 });
			return yield _this8.detail(id);
		})();
	},
	/**
	* GET /order/stats（后端返回各状态计数 status_1..7 与 total）。
	* 金额类（totalAmount/finalAmount/monthAmount）与 overdueCount 后端不提供，
	* 这里拉一页较大列表在前端聚合（保持原 mock 的 OrderStats 形状）。
	*/
	stats() {
		return _asyncToGenerator(function* () {
			const [statRes, listRes] = yield Promise.all([get("/order/stats"), get("/order/list", {
				pageNum: 1,
				pageSize: 1e3
			})]);
			const s = unwrap(statRes) || {};
			const page = toPage(unwrap(listRes));
			const orders = page.list.map((o) => adaptOrder(o));
			const cnt = (key) => Number(s[key] || 0);
			const monthStart = /* @__PURE__ */ new Date();
			monthStart.setDate(1);
			monthStart.setHours(0, 0, 0, 0);
			return {
				totalCount: Number(s.total || page.total || orders.length),
				draftCount: cnt("status_1"),
				pendingApprovalCount: cnt("status_2"),
				pendingFinanceCount: cnt("status_3"),
				pendingBossCount: 0,
				rejectedCount: cnt("status_7"),
				completedCount: cnt("status_4") + cnt("status_5"),
				cancelledCount: cnt("status_6"),
				overdueCount: orders.filter((o) => isOverdue(o)).length,
				totalAmount: orders.reduce((acc, o) => acc + o.totalAmount, 0),
				finalAmount: orders.reduce((acc, o) => acc + o.finalAmount, 0),
				monthAmount: orders.filter((o) => o.submitTime && new Date(o.submitTime.replace(" ", "T")).getTime() >= monthStart.getTime()).reduce((acc, o) => acc + o.finalAmount, 0)
			};
		})();
	}
};
/** 审批超期判断（纯前端展示口径：待审批/待财务且已过 calcApprovalDeadline 计算的截止时刻） */
function isOverdue(order) {
	if (!order.approvalDeadline) return false;
	if (order.status !== "pending_approval" && order.status !== "pending_finance") return false;
	return Date.now() > new Date(order.approvalDeadline.replace(" ", "T")).getTime();
}
//#endregion
export { orderApi as a, isOverdue as i, approvalLevelLabel as n, calcApprovalLevel as r, approvalLevelChain as t };

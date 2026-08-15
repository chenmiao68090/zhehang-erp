import { i as put, n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/views/feige-order-contract/options.ts
var businessTypes = [
	{
		value: "bookkeeping",
		label: "代理记账"
	},
	{
		value: "registration",
		label: "工商注册"
	},
	{
		value: "change",
		label: "工商变更"
	},
	{
		value: "cancellation",
		label: "工商注销"
	},
	{
		value: "address",
		label: "挂靠地址"
	},
	{
		value: "seal",
		label: "刻章业务"
	},
	{
		value: "invoice",
		label: "开票服务"
	},
	{
		value: "tax",
		label: "税务咨询"
	},
	{
		value: "license",
		label: "许可证办理"
	},
	{
		value: "qualification",
		label: "资质办理"
	},
	{
		value: "other",
		label: "其他业务"
	}
];
var orderStatuses = [
	{
		value: "pending",
		label: "待处理",
		type: "info"
	},
	{
		value: "in_progress",
		label: "办理中",
		type: "primary"
	},
	{
		value: "completed",
		label: "已完成",
		type: "success"
	},
	{
		value: "refund_pending",
		label: "退费中",
		type: "warning"
	},
	{
		value: "refunding",
		label: "退费中",
		type: "warning"
	},
	{
		value: "refunded",
		label: "已退费",
		type: "danger"
	},
	{
		value: "rejected",
		label: "已驳回",
		type: "danger"
	},
	{
		value: "cancelled",
		label: "已取消",
		type: "info"
	}
];
var refundStatuses = [
	{
		value: "pending",
		label: "待审核",
		type: "warning"
	},
	{
		value: "approved",
		label: "待退款",
		type: "primary"
	},
	{
		value: "completed",
		label: "已完成",
		type: "success"
	},
	{
		value: "rejected",
		label: "已驳回",
		type: "danger"
	}
];
var contractStatuses = [
	{
		value: "draft",
		label: "草稿",
		type: "info"
	},
	{
		value: "executing",
		label: "履约中",
		type: "primary"
	},
	{
		value: "completed",
		label: "已到期",
		type: "warning"
	},
	{
		value: "terminated",
		label: "已终止",
		type: "danger"
	}
];
function optionLabel(options, value) {
	var _options$find;
	return ((_options$find = options.find((item) => item.value === value)) === null || _options$find === void 0 ? void 0 : _options$find.label) || value || "-";
}
function optionType(options, value) {
	var _options$find2;
	return ((_options$find2 = options.find((item) => item.value === value)) === null || _options$find2 === void 0 ? void 0 : _options$find2.type) || "info";
}
function money(value) {
	return `¥${Number(value || 0).toLocaleString("zh-CN", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	})}`;
}
function formatDateTime(value) {
	return value ? value.replace("T", " ").slice(0, 19) : "-";
}
//#endregion
//#region src/api/feige-order-contract.ts
var feigeOrderApi = {
	dashboard: () => get("/feige-order-contract/dashboard"),
	staffOptions: () => get("/feige-order-contract/staff-options"),
	orders: (params) => get("/feige-order-contract/orders", params),
	order: (id) => get(`/feige-order-contract/orders/${id}`),
	createOrder: (data) => post("/feige-order-contract/orders", data),
	updateOrder: (id, data) => put(`/feige-order-contract/orders/${id}`, data),
	auditOrders: (params) => get("/feige-order-contract/audit-orders", params),
	auditOrder: (id, data) => post(`/feige-order-contract/orders/${id}/audit`, data),
	rejectOrder: (id, reason) => post(`/feige-order-contract/orders/${id}/reject`, { reason }),
	confirmOrder: (id) => post(`/feige-order-contract/orders/${id}/confirm`),
	completeOrder: (id) => post(`/feige-order-contract/orders/${id}/complete`),
	steps: (id) => get(`/feige-order-contract/orders/${id}/steps`),
	payments: (id) => get(`/feige-order-contract/orders/${id}/payments`),
	addPayment: (id, data) => post(`/feige-order-contract/orders/${id}/payments`, data),
	logs: (id) => get(`/feige-order-contract/orders/${id}/logs`),
	unreceived: (params) => get("/feige-order-contract/unreceived", params),
	refunds: (params) => get("/feige-order-contract/refunds", params),
	applyRefund: (orderId, data) => post(`/feige-order-contract/orders/${orderId}/refunds`, data),
	approveRefund: (id, comment) => post(`/feige-order-contract/refunds/${id}/approve`, { comment }),
	rejectRefund: (id, comment) => post(`/feige-order-contract/refunds/${id}/reject`, { comment }),
	completeRefund: (id, comment) => post(`/feige-order-contract/refunds/${id}/complete`, { comment }),
	contracts: (params) => get("/feige-order-contract/contracts", params),
	contract: (id) => get(`/feige-order-contract/contracts/${id}`),
	contractRenewals: (id) => get(`/feige-order-contract/contracts/${id}/renewals`),
	contractChanges: (id) => get(`/feige-order-contract/contracts/${id}/changes`),
	createContract: (data) => post("/feige-order-contract/contracts", data),
	updateContract: (id, data) => put(`/feige-order-contract/contracts/${id}`, data),
	renewContract: (id, data) => post(`/feige-order-contract/contracts/${id}/renewals`, data),
	terminateContract: (id, reason) => post(`/feige-order-contract/contracts/${id}/terminate`, { reason }),
	restoreContract: (id, reason) => post(`/feige-order-contract/contracts/${id}/restore`, { reason }),
	handoverPreview: (data) => post("/feige-order-contract/contracts/handover/preview", data),
	handover: (data) => post("/feige-order-contract/contracts/handover", data),
	handoverHistory: () => get("/feige-order-contract/contracts/handover/history"),
	revokeHandover: (id) => post(`/feige-order-contract/contracts/handover/${id}/revoke`)
};
//#endregion
//#region src/views/feige-order-contract/data-source.production.ts
var feigeOrderData = feigeOrderApi;
//#endregion
export { formatDateTime as a, optionType as c, contractStatuses as i, orderStatuses as l, feigeOrderApi as n, money as o, businessTypes as r, optionLabel as s, feigeOrderData as t, refundStatuses as u };

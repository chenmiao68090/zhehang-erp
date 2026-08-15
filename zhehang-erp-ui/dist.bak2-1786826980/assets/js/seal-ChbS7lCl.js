import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/seal.ts
var sealOrderApi = {
	list: (params) => get("/seal/order/list", params),
	create: (data) => post("/seal/order", data),
	update: (data) => put("/seal/order", data),
	remove: (id) => del(`/seal/order/${id}`),
	/** 登录经办人生成绑定当前公司、24小时有效的一次性客户链接 */
	issuePublicToken: () => post("/seal/public/token")
};
var sealStockApi = {
	list: (keyword) => get("/seal/stock/list", { keyword }),
	create: (data) => post("/seal/stock", data),
	update: (data) => put("/seal/stock", data),
	adjust: (id, delta, reason) => post("/seal/stock/adjust", {
		id,
		delta,
		reason
	}),
	logs: (id) => get(`/seal/stock/${id}/logs`),
	remove: (id) => del(`/seal/stock/${id}`)
};
var stockCheckApi = {
	list: () => get("/seal/stock-check/list"),
	save: (data) => post("/seal/stock-check", data),
	remove: (id) => del(`/seal/stock-check/${id}`)
};
var sealPurchaseApi = {
	list: (params) => get("/seal/purchase/list", params),
	create: (data) => post("/seal/purchase", data),
	update: (data) => put("/seal/purchase", data),
	arrive: (id) => post(`/seal/purchase/${id}/arrive`),
	remove: (id) => del(`/seal/purchase/${id}`)
};
var outRegionApi = {
	list: (keyword) => get("/seal/out-region/list", { keyword }),
	save: (data) => post("/seal/out-region", data),
	remove: (id) => del(`/seal/out-region/${id}`)
};
var sealCostApi = {
	/** 查某月成本明细 */
	list: (month, year) => get("/seal/cost/list", {
		month,
		year
	}),
	/** 批量保存某月成本明细(先删该月旧明细再整表插入) */
	batchSave: (year, month, lines) => post("/seal/cost/batch", {
		year,
		month,
		lines
	}),
	remove: (id) => del(`/seal/cost/${id}`)
};
/** 印章业务看板·某年各月指标 */
var sealBoardApi = { summary: (year) => get("/seal/board/summary", { year }) };
//#endregion
export { sealPurchaseApi as a, sealOrderApi as i, sealBoardApi as n, sealStockApi as o, sealCostApi as r, stockCheckApi as s, outRegionApi as t };

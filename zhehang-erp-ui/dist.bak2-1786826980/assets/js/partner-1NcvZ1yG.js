import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/partner.ts
var partnerApi = {
	list: (params) => get("/partner/list", params),
	create: (data) => post("/partner", data),
	update: (data) => put("/partner", data),
	remove: (id) => del(`/partner/${id}`),
	prices: (id) => get(`/partner/${id}/prices`),
	addPrice: (data) => post("/partner/price", data),
	updatePrice: (data) => put("/partner/price", data),
	removePrice: (id) => del(`/partner/price/${id}`),
	history: (id) => get(`/partner/${id}/history`),
	addHistory: (data) => post("/partner/history", data),
	updateHistory: (data) => put("/partner/history", data),
	removeHistory: (id) => del(`/partner/history/${id}`)
};
/** 协议价行内编辑:列表 + 批量保存 */
var partnerPriceApi = {
	/** 查某客户的协议价列表 */
	list: (partnerId) => get("/partner/price/list", { partnerId }),
	/** 批量保存某客户的协议价(先删旧价再批量插入) */
	batchSave: (partnerId, prices) => post("/partner/price/batch", {
		partnerId,
		prices
	})
};
//#endregion
export { partnerPriceApi as n, partnerApi as t };

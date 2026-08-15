import { n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/admin.ts
var sealUseApi = {
	list: (keyword) => get("/admin/seal-use/list", { keyword }),
	save: (data) => post("/admin/seal-use", data),
	remove: (id) => del(`/admin/seal-use/${id}`)
};
var supplyApi = {
	list: (keyword) => get("/admin/supply/list", { keyword }),
	save: (data) => post("/admin/supply", data),
	remove: (id) => del(`/admin/supply/${id}`)
};
var hrExpenseApi = {
	list: (params) => get("/admin/hr-expense/list", params),
	nextNo: (date) => get("/admin/hr-expense/next-no", date ? { date } : void 0),
	save: (data) => post("/admin/hr-expense/save", data),
	remove: (id) => del(`/admin/hr-expense/${id}`)
};
var assetApi = {
	list: (params) => get("/admin/asset/list", params),
	save: (data) => post("/admin/asset", data),
	remove: (id) => del(`/admin/asset/${id}`),
	/** 领用 → 流水type=领用,资产 holderId/holder/status=在用 */
	claim: (id, data) => post(`/admin/asset/${id}/claim`, data),
	/** 归还 → 流水type=归还,资产 holderId=null/status=闲置 */
	return: (id, data) => post(`/admin/asset/${id}/return`, data),
	/** 维保 → 流水type=维保 */
	maintain: (id, data) => post(`/admin/asset/${id}/maintain`, data),
	/** 报废 → 流水type=报废,资产 status=报废 */
	scrap: (id, data) => post(`/admin/asset/${id}/scrap`, data),
	/** 该资产全部流水(按id倒序) */
	records: (id) => get(`/admin/asset/${id}/records`),
	/** 某员工名下未归还资产(离职归还校验) */
	unreturned: (employeeId) => get("/admin/asset/unreturned", { employeeId })
};
//#endregion
export { supplyApi as i, hrExpenseApi as n, sealUseApi as r, assetApi as t };

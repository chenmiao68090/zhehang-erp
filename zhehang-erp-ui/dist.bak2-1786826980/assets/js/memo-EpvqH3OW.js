import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/memo.ts
var memoApi = {
	list: (params) => get("/dashboard/memo/list", params),
	summary: () => get("/dashboard/memo/summary"),
	create: (data) => post("/dashboard/memo", data),
	update: (data) => put("/dashboard/memo", data),
	complete: (id, completed) => put(`/dashboard/memo/${id}/complete`, { completed }),
	remove: (id) => del(`/dashboard/memo/${id}`)
};
//#endregion
export { memoApi as t };

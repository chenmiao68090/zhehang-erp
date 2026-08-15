import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/org.ts
var deptApi = {
	tree: () => get("/org/dept/tree"),
	detail: (id) => get(`/org/dept/${id}`),
	create: (data) => post("/org/dept", data),
	update: (data) => put("/org/dept", data),
	remove: (id) => del(`/org/dept/${id}`)
};
var postApi = {
	list: (params) => get("/org/post/list", params),
	all: () => get("/org/post/all"),
	detail: (id) => get(`/org/post/${id}`),
	create: (data) => post("/org/post", data),
	update: (data) => put("/org/post", data),
	remove: (id) => del(`/org/post/${id}`)
};
var employeeApi = {
	list: (params = {}) => get("/org/employee/list", params),
	options: () => get("/org/employee/options"),
	roster: () => get("/org/employee/roster"),
	me: () => get("/org/employee/me"),
	contractExpiring: (days) => get("/org/employee/contract-expiring", { days }),
	nextCode: () => get("/org/employee/next-code"),
	detail: (id) => get(`/org/employee/${id}`),
	create: (data) => post("/org/employee", data),
	update: (data) => put("/org/employee", data),
	remove: (id) => del(`/org/employee/${id}`),
	resetPwd: (id) => put(`/org/employee/${id}/account/resetPwd`, {}),
	changeAccountStatus: (id, accountEnabled) => put(`/org/employee/${id}/account/status`, null, { params: { accountEnabled } }),
	/** 专用离职入口：后端在同一事务内登记离职、停用账号并使当前会话失效。 */
	resign: (id, resignDate) => put(`/org/employee/${id}/resign`, { resignDate })
};
var transferApi = {
	list: (params) => get("/org/transfer/list", params),
	create: (data) => post("/org/transfer", data)
};
var structureApi = { tree: () => get("/org/structure/tree") };
//#endregion
export { transferApi as a, structureApi as i, employeeApi as n, postApi as r, deptApi as t };

import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/system.ts
var userApi = {
	list: (params) => get("/system/user/list", params),
	detail: (id) => get(`/system/user/${id}`),
	create: (data) => post("/system/user", data),
	update: (data) => put("/system/user", data),
	remove: (id) => del(`/system/user/${id}`),
	resetPwd: (data) => put("/system/user/resetPwd", data),
	resetMfa: (data) => put("/system/user/resetMfa", data),
	updateMyPwd: (data) => put("/system/user/profile/updatePwd", data),
	changeStatus: (data) => put("/system/user/status", null, { params: data }),
	export: (params) => get("/system/user/export", params, { responseType: "blob" })
};
var roleApi = {
	list: (params) => get("/system/role/list", params),
	detail: (id) => get(`/system/role/${id}`),
	create: (data) => post("/system/role", data),
	update: (data) => put("/system/role", data),
	remove: (id) => del(`/system/role/${id}`),
	savePermissionSettings: (data) => put("/system/role/permissionSettings", data),
	all: () => get("/system/role/all"),
	members: (roleId) => get(`/system/role/${roleId}/members`),
	memberCandidates: (keyword) => get("/system/role/candidates", { keyword }),
	addMembers: (roleId, userIds) => post(`/system/role/${roleId}/members`, { userIds }),
	removeMember: (roleId, userId) => del(`/system/role/${roleId}/members/${userId}`)
};
var menuApi = {
	list: (params) => get("/system/menu/list", params),
	detail: (id) => get(`/system/menu/${id}`),
	create: (data) => post("/system/menu", data),
	update: (data) => put("/system/menu", data),
	remove: (id) => del(`/system/menu/${id}`),
	treeselect: () => get("/system/menu/tree"),
	deptTreeselect: () => get("/org/dept/tree"),
	roleMenuTreeselect: (roleId) => get(`/system/menu/tree/role/${roleId}`),
	getRouters: () => get("/system/menu/routers")
};
var loginLogApi = {
	list: (params) => get("/system/log/login/list", params),
	clean: () => del("/system/log/login/clean"),
	export: (params) => get("/system/log/login/export", params, { responseType: "blob" })
};
var operLogApi = {
	list: (params) => get("/system/log/oper/list", params),
	detail: (id) => get(`/system/log/oper/${id}`),
	clean: () => del("/system/log/oper/clean"),
	export: (params) => get("/system/log/oper/export", params, { responseType: "blob" })
};
//#endregion
export { userApi as a, roleApi as i, menuApi as n, operLogApi as r, loginLogApi as t };

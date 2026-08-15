import { i as put, n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/api/customer-issue.ts
var customerIssueApi = {
	list: (params) => get("/crm/issue/list", params),
	detail: (id) => get(`/crm/issue/${id}`),
	stats: () => get("/crm/issue/stats"),
	create: (data) => post("/crm/issue", data),
	createFromMessage: (data) => post("/crm/issue/from-message", data),
	update: (data) => put("/crm/issue", data),
	assign: (id, data) => post(`/crm/issue/${id}/assign`, data),
	changeStatus: (id, data) => post(`/crm/issue/${id}/status`, data),
	close: (id, data) => post(`/crm/issue/${id}/close`, data || {})
};
/** 员工候选(给工单选负责人/协助人用,免 system:user:list 权限,返回 [{id,name,phone}]) */
var staffCandidatesApi = () => get("/crm/yunke/staff-candidates");
//#endregion
export { staffCandidatesApi as n, customerIssueApi as t };

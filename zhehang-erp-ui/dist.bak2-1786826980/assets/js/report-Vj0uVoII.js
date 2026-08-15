import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/report.ts
var reportDefinitionApi = {
	list: (params) => get("/report/definition/list", params),
	detail: (id) => get(`/report/definition/${id}`),
	create: (data) => post("/report/definition", data),
	update: (data) => put("/report/definition", data),
	remove: (id) => del(`/report/definition/${id}`),
	copy: (id) => post(`/report/definition/copy/${id}`),
	listByCategory: (category) => get("/report/definition/category", { category })
};
var reportDataApi = {
	execute: (reportId) => get(`/report/data/execute/${reportId}`),
	listDatasets: (reportId) => get(`/report/data/dataset/${reportId}`),
	addDataset: (data) => post("/report/data/dataset", data),
	updateDataset: (data) => put("/report/data/dataset", data),
	removeDataset: (id) => del(`/report/data/dataset/${id}`)
};
var reportScheduleApi = {
	list: (reportId) => get(`/report/schedule/${reportId}`),
	create: (data) => post("/report/schedule", data),
	update: (data) => put("/report/schedule", data),
	remove: (id) => del(`/report/schedule/${id}`)
};
//#endregion
export { reportDefinitionApi as n, reportScheduleApi as r, reportDataApi as t };

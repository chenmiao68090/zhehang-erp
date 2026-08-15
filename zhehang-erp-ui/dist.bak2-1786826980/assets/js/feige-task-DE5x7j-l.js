import { g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/feige-task.ts
function unwrapResponse(request) {
	return request.then((response) => {
		if (response && typeof response === "object" && "code" in response && "data" in response) return response.data;
		return response;
	});
}
function normalizeCapabilities(value) {
	return {
		manager: Boolean(value === null || value === void 0 ? void 0 : value.manager),
		bridgeManage: Boolean(value === null || value === void 0 ? void 0 : value.bridgeManage),
		bridgeTriggerSupported: Boolean(value === null || value === void 0 ? void 0 : value.bridgeTriggerSupported),
		contractConversionSupported: Boolean(value === null || value === void 0 ? void 0 : value.contractConversionSupported),
		addressConversionSupported: Boolean(value === null || value === void 0 ? void 0 : value.addressConversionSupported)
	};
}
function normalizeBridgeRunPage(page) {
	return _objectSpread2(_objectSpread2({}, page), {}, { records: ((page === null || page === void 0 ? void 0 : page.records) || []).map((row) => {
		var _row$retryCount;
		return _objectSpread2(_objectSpread2({}, row), {}, {
			status: row.status || row.runStatus,
			retryCount: (_row$retryCount = row.retryCount) !== null && _row$retryCount !== void 0 ? _row$retryCount : row.attemptCount,
			ruleName: row.ruleName || row.ruleCode
		});
	}) });
}
var feigeTaskApi = {
	capabilities: () => unwrapResponse(get("/feige-task/capabilities")).then(normalizeCapabilities),
	staffOptions: () => unwrapResponse(get("/feige-task/staff-options")),
	roleTree: () => unwrapResponse(get("/feige-task/role-tree")),
	orderOptions: (params = {}) => unwrapResponse(get("/feige-task/order-options", params)),
	businessTasks: (params) => unwrapResponse(get("/feige-task/business", params)),
	createBusinessTask: (payload) => unwrapResponse(post("/feige-task/business", payload)),
	businessAction: (id, action, payload = {}) => unwrapResponse(post(`/feige-task/business/${id}/${action}`, payload)),
	auditTasks: (params) => unwrapResponse(get("/feige-task/audit", params)),
	createAuditTask: (payload) => unwrapResponse(post("/feige-task/audit", payload)),
	auditTaskDetail: (id) => unwrapResponse(get(`/feige-task/audit/${id}`)),
	auditAction: (id, payload) => unwrapResponse(post(`/feige-task/audit/${id}/action`, payload)),
	auditTaskPayments: (orderId) => unwrapResponse(get(`/feige-task/audit/order/${orderId}/payments`)),
	auditTaskSteps: (orderId) => unwrapResponse(get(`/feige-task/audit/order/${orderId}/steps`)),
	auditProcesses: (params = {}) => unwrapResponse(get("/feige-task/audit/processes", params)),
	auditProcess: (id) => unwrapResponse(get(`/feige-task/audit/processes/${id}`)),
	createAuditProcess: (payload) => unwrapResponse(post("/feige-task/audit/processes", payload)),
	updateAuditProcess: (id, payload) => unwrapResponse(put(`/feige-task/audit/processes/${id}`, payload)),
	bridgeRules: (params = {}) => unwrapResponse(get("/feige-task/bridge-rules", params)),
	createBridgeRule: (payload) => unwrapResponse(post("/feige-task/bridge-rules", payload)),
	updateBridgeRule: (id, payload) => unwrapResponse(put(`/feige-task/bridge-rules/${id}`, payload)),
	bridgeRuns: (params = {}) => unwrapResponse(get("/feige-task/bridge-runs", params)).then(normalizeBridgeRunPage),
	retryBridgeRun: (id) => unwrapResponse(post(`/feige-task/bridge-runs/${id}/retry`, {})),
	workflowTasks: (params) => unwrapResponse(get("/feige-task/workflow/tasks", params)),
	workflowMonthStats: (params) => unwrapResponse(get("/feige-task/workflow/month-stats", params)),
	workflowAction: (id, action, payload = {}) => unwrapResponse(post(`/feige-task/workflow/tasks/${id}/${action}`, payload)),
	workflowSummary: (payload) => unwrapResponse(post("/feige-task/workflow/summary", payload)),
	workflowReport: (params) => unwrapResponse(get("/feige-task/workflow/report", params)),
	requiredScopes: () => unwrapResponse(get("/feige-task/workflow/required-scopes")),
	saveRequiredScope: (payload) => unwrapResponse(post("/feige-task/workflow/required-scopes", payload)),
	deleteRequiredScope: (id) => unwrapResponse(del(`/feige-task/workflow/required-scopes/${id}`)),
	goals: (params) => unwrapResponse(get("/feige-task/goals", params)),
	createGoal: (payload) => unwrapResponse(post("/feige-task/goals", payload)),
	updateGoal: (id, payload) => unwrapResponse(put(`/feige-task/goals/${id}`, payload)),
	changeGoalStatus: (id, status, payload = {}) => unwrapResponse(post(`/feige-task/goals/${id}/status`, _objectSpread2({ status }, payload))),
	deleteGoal: (id) => unwrapResponse(del(`/feige-task/goals/${id}`)),
	templates: (params) => unwrapResponse(get("/feige-task/templates", params)),
	createTemplate: (payload) => unwrapResponse(post("/feige-task/templates", payload)),
	updateTemplate: (id, payload) => unwrapResponse(put(`/feige-task/templates/${id}`, payload)),
	deleteTemplate: (id) => unwrapResponse(del(`/feige-task/templates/${id}`)),
	subordinates: (params) => unwrapResponse(get("/feige-task/subordinates", params)),
	subordinateDetail: (params) => unwrapResponse(get("/feige-task/subordinates/detail", params))
};
feigeTaskApi.workflowTasks;
feigeTaskApi.workflowMonthStats;
feigeTaskApi.workflowAction;
feigeTaskApi.workflowSummary;
//#endregion
export { feigeTaskApi as t };

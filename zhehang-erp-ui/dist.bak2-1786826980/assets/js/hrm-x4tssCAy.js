import { i as put, n as get, r as post, s as service, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/hrm.ts
var publicGuestRequest = {
	silentError: true,
	skipAuthRedirect: true
};
var recruitApi = {
	list: (params) => get("/hrm/recruit/list", params),
	detail: (id) => get(`/hrm/recruit/${id}`),
	create: (data) => post("/hrm/recruit", data),
	update: (data) => put("/hrm/recruit", data),
	remove: (id) => del(`/hrm/recruit/${id}`),
	changeStatus: (data) => put("/hrm/recruit/status", data),
	colleagues: () => get("/hrm/recruit/colleagues")
};
var resumeApi = {
	list: (params) => get("/hrm/resume/list", params),
	create: (data) => post("/hrm/resume", data),
	update: (data) => put("/hrm/resume", data),
	remove: (id) => del(`/hrm/resume/${id}`),
	changeStatus: (data) => put("/hrm/resume/status", data)
};
var interviewRecordApi = {
	list: (resumeId) => get("/hrm/interview-record/list", { resumeId }),
	create: (data) => post("/hrm/interview-record", data)
};
var onboardingApi = {
	list: (params) => get("/hrm/onboarding/list", params),
	detail: (id) => get(`/hrm/onboarding/${id}`),
	createFromResume: (resumeId) => post(`/hrm/onboarding/from-resume/${resumeId}`),
	update: (data) => put("/hrm/onboarding", data),
	refreshToken: (id) => post(`/hrm/onboarding/${id}/refresh-token`),
	confirmForm: (id) => post(`/hrm/onboarding/${id}/confirm-form`),
	generateOffer: (id, data) => post(`/hrm/onboarding/${id}/generate-offer`, data),
	markOfferSent: (id) => post(`/hrm/onboarding/${id}/mark-offer-sent`),
	createEmployeeDraft: (id) => post(`/hrm/onboarding/${id}/employee-draft`),
	markOnboarded: (id) => post(`/hrm/onboarding/${id}/onboarded`),
	publicInfo: (token) => get(`/hrm/onboarding/public/${encodeURIComponent(token)}`, void 0, publicGuestRequest),
	publicSubmit: (token, data) => post(`/hrm/onboarding/public/${encodeURIComponent(token)}/submit`, data, publicGuestRequest)
};
var attendanceApi = {
	list: (params) => get("/hrm/attendance/list", params),
	clockIn: (employeeId) => post("/hrm/attendance/clock-in", { employeeId }),
	clockOut: (employeeId) => post("/hrm/attendance/clock-out", { employeeId }),
	stats: (params) => get("/hrm/attendance/stats", params)
};
var attendanceSummaryApi = {
	generate: (month) => post(`/hrm/attendance-summary/generate?month=${month}`),
	list: (month) => get("/hrm/attendance-summary/list", { month }),
	edit: (data) => put("/hrm/attendance-summary", data),
	hrConfirm: (id) => post(`/hrm/attendance-summary/${id}/hr-confirm`),
	confirmAll: (month) => post(`/hrm/attendance-summary/confirm-all?month=${month}`),
	employeeConfirm: (id) => post(`/hrm/attendance-summary/${id}/employee-confirm`),
	employeeDispute: (id, remark) => post(`/hrm/attendance-summary/${id}/employee-dispute`, { remark })
};
var leaveBalanceApi = {
	listAll: () => get("/hrm/leave-balance/list"),
	byEmployee: (employeeId) => get(`/hrm/leave-balance/by-employee/${employeeId}`),
	my: () => get("/hrm/leave-balance/my"),
	save: (data) => post("/hrm/leave-balance", data),
	remove: (id) => del(`/hrm/leave-balance/${id}`)
};
var leaveTypeApi = {
	list: () => get("/hrm/leave-type/list"),
	save: (data) => post("/hrm/leave-type", data),
	toggle: (id) => post(`/hrm/leave-type/${id}/toggle`),
	remove: (id) => del(`/hrm/leave-type/${id}`)
};
var payslipApi = {
	list: (params) => get("/hrm/payslip/list", params),
	save: (data) => post("/hrm/payslip/save", data),
	batchSave: (list) => post("/hrm/payslip/batch-save", list),
	remove: (id) => del(`/hrm/payslip/${id}`),
	distribute: (data) => post("/hrm/payslip/distribute", data),
	my: (payMonth) => get("/hrm/payslip/my", payMonth ? { payMonth } : void 0),
	confirm: (id) => post(`/hrm/payslip/${id}/confirm`),
	feedback: (id, content) => post(`/hrm/payslip/${id}/feedback`, { content })
};
var socialFundApi = {
	list: (params) => get("/hrm/social-fund/list", params),
	save: (data) => post("/hrm/social-fund/save", data),
	batchSave: (list) => post("/hrm/social-fund/batch-save", list),
	remove: (id) => del(`/hrm/social-fund/${id}`)
};
var laborContractApi = {
	list: (params) => get("/hrm/labor-contract/list", params),
	save: (data) => post("/hrm/labor-contract/save", data),
	remove: (id) => del(`/hrm/labor-contract/${id}`),
	expiring: (days = 30) => get("/hrm/labor-contract/expiring", { days }),
	remindExpiring: (days = 30) => post(`/hrm/labor-contract/remind-expiring?days=${days}`),
	my: () => get("/hrm/labor-contract/my")
};
var resignHandoverApi = {
	center: (params = {}) => get("/hrm/resign-handover/center", params),
	summary: () => get("/hrm/resign-handover/summary"),
	centerDetail: (employeeId) => get(`/hrm/resign-handover/center/${employeeId}`),
	list: (params = {}) => get("/hrm/resign-handover/list", params),
	save: (data) => post("/hrm/resign-handover/save", data),
	uploadSop: (file) => {
		const formData = new FormData();
		formData.append("file", file);
		return service.post("/hrm/resign-handover/sop/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
	},
	byEmployee: (employeeId) => get(`/hrm/resign-handover/by-employee/${employeeId}`)
};
//#endregion
export { leaveBalanceApi as a, payslipApi as c, resumeApi as d, socialFundApi as f, laborContractApi as i, recruitApi as l, attendanceSummaryApi as n, leaveTypeApi as o, interviewRecordApi as r, onboardingApi as s, attendanceApi as t, resignHandoverApi as u };

import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/workflow.ts
var processApi = {
	list: (params) => get("/workflow/process/list", params),
	detail: (id) => get(`/workflow/process/${id}`),
	create: (data) => post("/workflow/process", data),
	update: (data) => put("/workflow/process", data),
	publish: (id) => put(`/workflow/process/publish/${id}`),
	disable: (id) => put(`/workflow/process/disable/${id}`),
	remove: (id) => del(`/workflow/process/${id}`),
	templates: () => get("/workflow/process/templates"),
	/** 发布预检:返回审批链解析不到人的问题清单(空=通过) */
	precheck: (id) => get(`/workflow/process/precheck/${id}`),
	/** 设计器选审批人即时预警:{ok, count, warning} */
	assigneePreview: (assigneeType, assigneeValue) => get("/workflow/process/assignee-preview", {
		assigneeType,
		assigneeValue
	})
};
var instanceApi = {
	start: (data) => post("/workflow/instance/start", data),
	detail: (id) => get(`/workflow/instance/detail/${id}`),
	cancel: (id) => put(`/workflow/instance/cancel/${id}`),
	remove: (id) => del(`/workflow/instance/${id}`),
	/** 重新提交:发起人修改被退回(待修改)的申请后重新从头流转 */
	resubmit: (id, data) => put(`/workflow/instance/resubmit/${id}`, data)
};
var taskApi = {
	todo: (params) => get("/workflow/task/todo", params),
	done: (params) => get("/workflow/task/done", params),
	started: (params) => get("/workflow/task/started", params),
	/** 四个列表一次性计数(角标用) */
	counts: () => get("/workflow/task/counts"),
	approve: (id, data) => put(`/workflow/task/approve/${id}`, data),
	reject: (id, data) => put(`/workflow/task/reject/${id}`, data),
	transfer: (id, data) => put(`/workflow/task/transfer/${id}`, data),
	/** 退回修改:把申请退给发起人改表单(必须带修改意见) */
	returnForRevision: (id, data) => put(`/workflow/task/return/${id}`, data),
	/** 催办:发起人提醒当前审批人(同任务4小时限频) */
	urge: (id) => post(`/workflow/task/urge/${id}`),
	/** 批量审批:多个待办一次性通过,返回 {success, failed[]} */
	batchApprove: (taskIds, comment) => put("/workflow/task/batch-approve", {
		taskIds,
		comment
	}),
	/** 标记一条抄送为已读 */
	markCcRead: (id) => put(`/workflow/task/cc/read/${id}`),
	/** 审批选人下拉(抄送/转交用) */
	colleagues: () => get("/workflow/task/colleagues"),
	/** 补充抄送:把实例抄送给指定同事 */
	addCc: (instanceId, userIds) => post(`/workflow/task/cc/${instanceId}`, userIds)
};
//#endregion
export { processApi as n, taskApi as r, instanceApi as t };

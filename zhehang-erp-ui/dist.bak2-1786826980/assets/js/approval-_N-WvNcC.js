import { V as _asyncToGenerator } from "./vendor-Cuzsyfny.js";
import { n as get } from "./request-CZ5tKmxn.js";
import { n as processApi, r as taskApi, t as instanceApi } from "./workflow-CeqrP-pL.js";
//#region src/api/approval.ts
/** 拦截器已 resolve 出 data 载荷；这里兼容“万一拿到的是整包 R 信封”的情况 */
function unwrap(res) {
	if (res && typeof res === "object" && "code" in res && "data" in res) return res.data;
	return res;
}
/** IPage / {records,total} -> {list,total} */
function toPage(data) {
	var _ref, _payload$total;
	const payload = unwrap(data);
	const list = Array.isArray(payload === null || payload === void 0 ? void 0 : payload.records) ? payload.records : Array.isArray(payload === null || payload === void 0 ? void 0 : payload.list) ? payload.list : Array.isArray(payload) ? payload : [];
	return {
		list,
		total: Number((_ref = (_payload$total = payload === null || payload === void 0 ? void 0 : payload.total) !== null && _payload$total !== void 0 ? _payload$total : list.length) !== null && _ref !== void 0 ? _ref : 0)
	};
}
var approvalCenterApi = {
	/** 待办（我审批的）分页 */
	todo(params) {
		return _asyncToGenerator(function* () {
			return toPage(yield taskApi.todo(params));
		})();
	},
	/** 已办（我处理过的）分页 */
	done(params) {
		return _asyncToGenerator(function* () {
			return toPage(yield taskApi.done(params));
		})();
	},
	/** 我发起的 分页 */
	started(params) {
		return _asyncToGenerator(function* () {
			return toPage(yield taskApi.started(params));
		})();
	},
	/** 抄送我的（node_type=cc 的抄送记录) */
	cc(params) {
		return _asyncToGenerator(function* () {
			return toPage(yield get("/workflow/task/cc", params));
		})();
	},
	/** 已发布、可发起的流程定义（用于把发起卡片映射到真实 processKey） */
	publishedProcesses() {
		return _asyncToGenerator(function* () {
			return unwrap(yield processApi.list({ status: 1 })) || [];
		})();
	},
	/** 流程实例详情（表单数据 + 审批轨迹） */
	detail(instanceId) {
		return _asyncToGenerator(function* () {
			return unwrap(yield instanceApi.detail(instanceId));
		})();
	},
	/** 待办数量（用于 Tab 角标）：取 total 即可，避免拉全量 */
	todoCount() {
		return _asyncToGenerator(function* () {
			return toPage(yield get("/workflow/task/todo", {
				pageNum: 1,
				pageSize: 1
			}, { silentError: true })).total;
		})();
	},
	/** 审批选人下拉(抄送/转交用,已开通账号的员工) */
	colleagues() {
		return _asyncToGenerator(function* () {
			return unwrap(yield taskApi.colleagues()) || [];
		})();
	},
	approve: (taskId, comment) => taskApi.approve(taskId, { comment }),
	reject: (taskId, comment) => taskApi.reject(taskId, { comment }),
	transfer: (taskId, targetUserId, comment) => taskApi.transfer(taskId, {
		targetUserId,
		comment
	}),
	/** 补充抄送 */
	addCc: (instanceId, userIds) => taskApi.addCc(instanceId, userIds),
	start: (processKey, title, formData) => instanceApi.start({
		processKey,
		title,
		formData
	}),
	cancel: (instanceId) => instanceApi.cancel(instanceId),
	removeStarted: (instanceId) => instanceApi.remove(instanceId)
};
//#endregion
export { approvalCenterApi as t };

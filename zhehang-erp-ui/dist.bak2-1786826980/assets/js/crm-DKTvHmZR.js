import { V as _asyncToGenerator } from "./vendor-Cuzsyfny.js";
import { i as put, n as get, r as post, t as del } from "./request-CZ5tKmxn.js";
//#region src/api/crm.ts
function unwrapEnvelope(response) {
	if (response && typeof response === "object" && "code" in response && "data" in response) return response.data;
	return response;
}
function requireTrueMutation(response, message) {
	if (unwrapEnvelope(response) !== true) throw new Error(message);
	return true;
}
var leadApi = {
	list: (params) => get("/crm/lead/list", params),
	detail: (id, config) => get(`/crm/lead/${id}`, void 0, config),
	/** 客户360:仅返回当前用户数据范围内的沟通、商机、交易和服务记录。 */
	customer360: (id) => get(`/crm/lead/${id}/360`, void 0, { silentError: true }),
	create: (data) => post("/crm/lead", data),
	update: (data) => put("/crm/lead", data),
	remove: (id) => del(`/crm/lead/${id}`),
	convert: (id, config) => post(`/crm/lead/convert/${id}`, void 0, config),
	assign: (data) => post("/crm/lead/assign", data),
	poolList: (params) => get("/crm/lead/pool", params, { silentError: true }),
	myList: (params) => get("/crm/lead/my", params, { silentError: true }),
	claim: (ids) => post("/crm/lead/claim", { ids }),
	reactivateHistory: (ids) => post("/crm/lead/history/reactivate", { ids }),
	/** 给线索写跟进(type:1电话 2微信 3面谈 4邮件 5其他) */
	follow: (id, data, config) => post(`/crm/lead/${id}/follow`, data, config),
	/** 取某线索的跟进历史记录(按时间倒序) */
	followHistory: (id) => get(`/crm/follow/lead/${id}`, void 0, { silentError: true }),
	returnToPool: (ids, reason) => post("/crm/lead/return", {
		ids,
		reason
	}, { silentError: true }),
	markInvalid: (id, reason) => post("/crm/lead/invalid", {
		id,
		reason
	}),
	distribute: (data) => post("/crm/lead/distribute", data, { silentError: true }),
	importPreflight: (data) => post("/crm/lead/import/preflight", data),
	importConfirm: (data) => post("/crm/lead/import/confirm", data),
	exportLeads: (params) => get("/crm/lead/export", params),
	checkDuplicate: (params) => get("/crm/lead/duplicate", params),
	/** 线索来源分布(营销统计) */
	sourceStats: () => get("/crm/lead/stats/source"),
	/** 线索阶段漏斗(营销统计) */
	stageStats: () => get("/crm/lead/stats/stage"),
	/** 今天该打谁:数据范围内待跟进(逾期/今天到期/从未跟进)线索,按紧迫度排序 */
	todoFollow: (params) => get("/crm/lead/todo-follow", params, { silentError: true }),
	/** 回收预警:保护期3天内到期的客资(再不跟进将被自动回收) */
	recycleWarning: (params) => get("/crm/lead/recycle-warning", params, { silentError: true }),
	/** 销售工作台全量统计(含客户分级),不受当前分页限制 */
	workbenchSummary: (params) => get("/crm/lead/workbench-summary", params, { silentError: true }),
	/** 手动触发自动回收(仅管理员),返回本次回收条数 */
	runRecycle: () => post("/crm/lead/recycle/run"),
	/** 从工商库按关键词批量导入企业为公海线索(新公司入池),返回新建数量 */
	importCompanies: (data) => post("/crm/lead/import-companies", data),
	/** 转化率汇总(数据范围内):total/newLeads/converting/converted/invalid/conversionRate */
	conversionStats: () => get("/crm/lead/stats/conversion"),
	/** 投流客资汇总(164 顶部滚动播报):{ month:{...}, year:{...} },每组含有效/刻章有效/非刻章有效/非刻章转化/转化率/成交额 */
	summary: () => get("/crm/lead/summary", void 0, { silentError: true })
};
var customerApi = {
	list: (params) => get("/crm/customer/list", params),
	/** 正式客户工作台:服务端按数据范围聚合跟进、合同、交接和应收风险。 */
	portfolio: (params) => get("/crm/customer/portfolio", params, { silentError: true }),
	detail: (id) => get(`/crm/customer/${id}`),
	customer360: (id) => get(`/crm/customer/${id}/360`, void 0, { silentError: true }),
	follow: (id, data, config) => post(`/crm/customer/${id}/follow`, data, config),
	create: (data) => post("/crm/customer", data),
	update: (data) => put("/crm/customer", data),
	remove: (id) => del(`/crm/customer/${id}`),
	toPool: (id, reason) => post(`/crm/customer/toPool/${id}`, { reason })
};
var poolConfigApi = {
	list: function() {
		var _ref = _asyncToGenerator(function* () {
			return unwrapEnvelope(yield get("/crm/pool-config/list"));
		});
		return function list() {
			return _ref.apply(this, arguments);
		};
	}(),
	detail: (id) => get(`/crm/pool-config/${id}`),
	create: function() {
		var _ref2 = _asyncToGenerator(function* (data) {
			return requireTrueMutation(yield post("/crm/pool-config", data), "公海池未创建，服务器没有确认写入成功");
		});
		return function create(_x) {
			return _ref2.apply(this, arguments);
		};
	}(),
	update: function() {
		var _ref3 = _asyncToGenerator(function* (data) {
			return requireTrueMutation(yield put("/crm/pool-config", data), "公海池未更新，配置可能已不存在");
		});
		return function update(_x2) {
			return _ref3.apply(this, arguments);
		};
	}(),
	remove: function() {
		var _ref4 = _asyncToGenerator(function* (id) {
			return requireTrueMutation(yield del(`/crm/pool-config/${id}`), "公海池未删除，配置可能已不存在");
		});
		return function remove(_x3) {
			return _ref4.apply(this, arguments);
		};
	}(),
	getByType: (type) => get(`/crm/pool-config/by-type/${type}`)
};
var poolRuleApi = {
	overview: function() {
		var _ref5 = _asyncToGenerator(function* () {
			return unwrapEnvelope(yield get("/crm/pool-rules/overview"));
		});
		return function overview() {
			return _ref5.apply(this, arguments);
		};
	}(),
	versions: function() {
		var _ref6 = _asyncToGenerator(function* () {
			return unwrapEnvelope(yield get("/crm/pool-rules/versions"));
		});
		return function versions() {
			return _ref6.apply(this, arguments);
		};
	}(),
	saveDraft: function() {
		var _ref7 = _asyncToGenerator(function* (data) {
			return unwrapEnvelope(yield post("/crm/pool-rules/draft", data));
		});
		return function saveDraft(_x4) {
			return _ref7.apply(this, arguments);
		};
	}(),
	simulate: function() {
		var _ref8 = _asyncToGenerator(function* (data) {
			return unwrapEnvelope(yield post("/crm/pool-rules/simulate", data));
		});
		return function simulate(_x5) {
			return _ref8.apply(this, arguments);
		};
	}(),
	publish: function() {
		var _ref9 = _asyncToGenerator(function* (id, mode = "NEXT_DAY") {
			return unwrapEnvelope(yield post(`/crm/pool-rules/${id}/publish?mode=${mode}`));
		});
		return function publish(_x6) {
			return _ref9.apply(this, arguments);
		};
	}()
};
var collisionApi = {
	checkDuplicate: (params) => post("/crm/collision/check", params),
	resolveConflict: (data) => post("/crm/collision/resolve/" + data.id, data, { silentError: true }),
	getCollisionLog: (params) => get("/crm/collision/log", params, { silentError: true })
};
//#endregion
export { poolRuleApi as a, poolConfigApi as i, customerApi as n, leadApi as r, collisionApi as t };

import { n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/api/call-record.ts
/** 由后端短时票据生成系统内播放地址，不包含云客原始地址。 */
function callRecordingStreamUrl(recordId, token) {
	return `${String("/api").replace(/\/$/, "")}/call-record/recordings/stream/${recordId}?ticket=${encodeURIComponent(token)}`;
}
/** 云客微信语音使用同一受控代理，浏览器不接触原始 OSS 地址。 */
function callRecordingExternalStreamUrl(token) {
	return `${String("/api").replace(/\/$/, "")}/call-record/recordings/stream/external?ticket=${encodeURIComponent(token)}`;
}
/**
* 电销外呼工作台 API。
* 与后端约定:响应拦截器对 code 200 直接返回 data;调用处统一用 res?.data ?? res 兜底。
*/
var callRecordApi = {
	/** 通话记录列表,可按线索/关键词过滤 */
	list: (params) => get("/call-record/list", params),
	/** 顶部统计条数据 */
	stats: () => get("/call-record/stats"),
	/** 坐席排名 */
	agentRank: () => get("/call-record/agent-rank"),
	/** 保存一条通话记录 */
	save: (data) => post("/call-record", data),
	/** 保存小结并同步 CRM 跟进/下一步动作 */
	saveSummary: (data) => post("/call-record/summary", data),
	/** 发起外呼(占位,接入外呼平台后真实拨号) */
	dial: (data) => post("/call-record/dial", data),
	/** 云客同步话单列表(全公司,含时长+录音),按号码/坐席搜索、分页 */
	syncList: (params) => get("/call-record/sync-list", params),
	/** 云客同步话单统计(总量/今日/接通率/总时长) */
	syncStats: () => get("/call-record/sync-stats"),
	/** 销售体系电销外呼看板 */
	dashboard: (params) => get("/call-record/dashboard", params),
	/** 全公司通话排行，只返回坐席与汇总数 */
	leaderboard: (params) => get("/call-record/leaderboard", params),
	/** 通话录音数据范围内的人员与部门选项 */
	recordingOptions: () => get("/call-record/recordings/options"),
	/** 通话录音分页列表，响应不包含云客原始录音地址 */
	recordings: (params) => get("/call-record/recordings", params),
	/** 申请短时、当前浏览器绑定的播放票据 */
	recordingTicket: (recordId) => get(`/call-record/recordings/${recordId}/play-ticket`),
	/** 立即从云客未同步队列补拉通话记录 */
	syncYunkeFailed: (maxBatches = 20) => post("/call-record/sync-yunke-failed", null, { params: { maxBatches } })
};
//#endregion
export { callRecordingExternalStreamUrl as n, callRecordingStreamUrl as r, callRecordApi as t };

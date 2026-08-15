import { n as get } from "./request-CZ5tKmxn.js";
//#region src/api/cockpit.ts
var BASE = "/dashboard/cockpit";
/** 业绩排行 */
function getSalesRank(params) {
	return get(BASE + "/sales-rank", params);
}
/**
* 业绩看板数据
* @param period 时间范围 month/year，默认 year
* @param scope 数据范围 person/team，可选
*/
function getBizPerf(period, scope) {
	return get(BASE + "/biz-perf", {
		period,
		scope
	});
}
/**
* 业绩排行(我的结果页):按业务员统计区间内已到款金额/单数,含上一等长周期名次对比。
* @param startDate yyyy-MM-dd,为空默认本月1日
* @param endDate   yyyy-MM-dd,为空默认今天
*/
function getPerfRank(startDate, endDate) {
	return get(BASE + "/perf-rank", {
		startDate,
		endDate
	});
}
/**
* cockpit 接口聚合对象（业绩看板页按 cockpitApi.getBizPerf 方式调用）
*/
var cockpitApi = {
	getBizPerf,
	getPerfRank
};
//#endregion
export { getSalesRank as n, cockpitApi as t };

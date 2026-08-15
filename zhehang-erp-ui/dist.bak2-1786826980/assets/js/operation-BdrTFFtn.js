import { g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { n as get, r as post } from "./request-CZ5tKmxn.js";
//#region src/api/operation.ts
var opMetricApi = {
	/** 最近 N 天各平台指标;可按 platform / category 过滤 */
	recent: (arg = 30) => {
		return get("/op/channel-metric/recent", typeof arg === "number" ? { days: arg } : _objectSpread2({ days: 30 }, arg));
	},
	/** 录入/更新某平台某天某类别指标 */
	save: (data) => post("/op/channel-metric/save", data),
	/** 触发某平台接口同步(未配置凭证时返回"待接入") */
	sync: (platform) => post(`/op/channel-metric/sync/${platform}`, {}, { silentError: true })
};
//#endregion
export { opMetricApi as t };

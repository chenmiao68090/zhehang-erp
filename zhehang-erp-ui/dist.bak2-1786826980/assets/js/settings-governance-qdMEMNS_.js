import { n as get } from "./request-CZ5tKmxn.js";
//#region src/api/settings-governance.ts
function unwrapGovernanceData(response) {
	if (response && typeof response === "object" && "data" in response) return response.data;
	return response;
}
var settingsGovernanceApi = {
	rules: () => get("/system/settings-governance/rules"),
	fields: () => get("/system/settings-governance/fields"),
	options: (dictType, silentError = false) => get(`/system/settings-governance/options/${encodeURIComponent(dictType)}`, void 0, { silentError })
};
//#endregion
export { unwrapGovernanceData as n, settingsGovernanceApi as t };

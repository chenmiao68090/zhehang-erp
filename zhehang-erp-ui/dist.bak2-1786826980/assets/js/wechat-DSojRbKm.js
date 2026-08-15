import { n as get } from "./request-CZ5tKmxn.js";
//#region src/api/wechat.ts
var wechatFriendApi = {
	list: (params) => get("/crm/wechat-friend/list", params),
	stats: () => get("/crm/wechat-friend/stats")
};
//#endregion
export { wechatFriendApi as t };

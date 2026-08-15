//#region src/utils/im-presence.ts
function pad(value) {
	return String(value).padStart(2, "0");
}
function sameDay(left, right) {
	return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}
function formatImPresence(online, lastActiveAt, compact = false, now = /* @__PURE__ */ new Date()) {
	if (online) return "在线";
	if (!lastActiveAt) return "离线";
	const activeAt = new Date(lastActiveAt);
	if (Number.isNaN(activeAt.getTime())) return "离线";
	const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - activeAt.getTime()) / 6e4));
	if (elapsedMinutes < 1) return compact ? "刚刚" : "刚刚在线";
	if (elapsedMinutes < 60) return compact ? `${elapsedMinutes}分钟前` : `${elapsedMinutes}分钟前在线`;
	const time = `${pad(activeAt.getHours())}:${pad(activeAt.getMinutes())}`;
	if (sameDay(activeAt, now)) return compact ? time : `今天 ${time}在线`;
	const yesterday = new Date(now);
	yesterday.setDate(now.getDate() - 1);
	if (sameDay(activeAt, yesterday)) return compact ? "昨天" : `昨天 ${time}在线`;
	if (activeAt.getFullYear() === now.getFullYear()) return compact ? `${activeAt.getMonth() + 1}/${activeAt.getDate()}` : `${activeAt.getMonth() + 1}月${activeAt.getDate()}日 ${time}在线`;
	return compact ? `${activeAt.getFullYear()}/${activeAt.getMonth() + 1}/${activeAt.getDate()}` : `${activeAt.getFullYear()}年${activeAt.getMonth() + 1}月${activeAt.getDate()}日在线`;
}
//#endregion
export { formatImPresence as t };

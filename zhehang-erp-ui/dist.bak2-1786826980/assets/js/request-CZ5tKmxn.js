import { V as _asyncToGenerator, g as _objectSpread2 } from "./vendor-Cuzsyfny.js";
import { a as ElMessageBox, o as ElMessage } from "./vendor-element-plus-CqO9XRGg.js";
import { t as axios } from "./vendor-axios-CsdGTjXP.js";
//#region src/utils/safe-storage.ts
function getStorage() {
	try {
		return window.localStorage;
	} catch (_unused) {
		return null;
	}
}
var memory = /* @__PURE__ */ new Map();
function storageGet(key) {
	var _memory$get;
	const storage = getStorage();
	if (!storage) return (_memory$get = memory.get(key)) !== null && _memory$get !== void 0 ? _memory$get : null;
	try {
		return storage.getItem(key);
	} catch (_unused2) {
		var _memory$get2;
		return (_memory$get2 = memory.get(key)) !== null && _memory$get2 !== void 0 ? _memory$get2 : null;
	}
}
function storageSet(key, value) {
	memory.set(key, value);
	const storage = getStorage();
	if (!storage) return;
	try {
		storage.setItem(key, value);
	} catch (_unused3) {}
}
function storageRemove(key) {
	memory.delete(key);
	const storage = getStorage();
	if (!storage) return;
	try {
		storage.removeItem(key);
	} catch (_unused4) {}
}
//#endregion
//#region src/utils/impersonation-session.ts
var IMPERSONATION_SESSION_KEY = "zhehang_erp_impersonation_session";
var TAB_ID_PREFIX = "zhehang-erp-tab:";
var restorePending = false;
var ownedSessionId = "";
var releaseOwnership;
var ownershipChannel = null;
var pageRestoreGuardInstalled = false;
function isAllowedImpersonationTargetUserId(value) {
	const userId = Number(value);
	return Number.isSafeInteger(userId) && userId > 1 && userId !== 3;
}
function getSessionStorage() {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage;
	} catch (_unused) {
		return null;
	}
}
function parseImpersonationSession(raw) {
	if (!raw) return null;
	try {
		const value = JSON.parse(raw);
		if (!value || typeof value !== "object") return null;
		if (!String(value.token || "").trim() || !String(value.sessionId || "").trim()) return null;
		if (Number(value.actorUserId) !== 3 || !isAllowedImpersonationTargetUserId(value.targetUserId)) return null;
		if (!String(value.expireTime || "").trim() || !String(value.tabId || "").trim()) return null;
		return {
			token: String(value.token),
			sessionId: String(value.sessionId),
			actorUserId: 3,
			actorName: String(value.actorName || "超级管理员"),
			targetUserId: Number(value.targetUserId),
			targetName: String(value.targetName || "员工"),
			targetDeptName: String(value.targetDeptName || ""),
			roleNames: Array.isArray(value.roleNames) ? value.roleNames.map(String).filter(Boolean) : [],
			multipleRoles: Boolean(value.multipleRoles),
			reason: String(value.reason || ""),
			startTime: String(value.startTime || ""),
			expireTime: String(value.expireTime),
			returnUrl: sanitizeReturnUrl(value.returnUrl),
			tabId: String(value.tabId)
		};
	} catch (_unused2) {
		return null;
	}
}
/**
* 只要当前标签页存在代登录标记，就必须保持 fail-closed。
* 即使记录损坏或令牌过期，也不能静默回退到 localStorage 中的超级管理员令牌。
*/
function selectAuthentication(baseToken, rawSession) {
	if (rawSession === null) return {
		mode: "base",
		token: baseToken,
		session: null
	};
	const session = parseImpersonationSession(rawSession);
	return {
		mode: "impersonation",
		token: (session === null || session === void 0 ? void 0 : session.token) || "",
		session
	};
}
function getAuthenticationSelection(baseToken) {
	var _storage$getItem;
	if (restorePending) return {
		mode: "impersonation",
		token: "",
		session: null
	};
	const storage = getSessionStorage();
	return selectAuthentication(baseToken, (_storage$getItem = storage === null || storage === void 0 ? void 0 : storage.getItem("zhehang_erp_impersonation_session")) !== null && _storage$getItem !== void 0 ? _storage$getItem : null);
}
function markImpersonationRestorePending() {
	restorePending = true;
}
function hasImpersonationSessionMarker() {
	const storage = getSessionStorage();
	if (!storage) return false;
	try {
		return storage.getItem(IMPERSONATION_SESSION_KEY) !== null;
	} catch (_unused3) {
		return false;
	}
}
function shouldReloadImpersonationAfterPageRestore(persisted, hasMarker) {
	return persisted && hasMarker;
}
/**
* BFCache 会连同 Pinia 的 bootstrapped 状态一起恢复，但 pagehide 已释放标签页所有权。
* 代登录页从 BFCache 返回时必须进行一次完整重载，重新竞争所有权并向后端校验 /current；
* 普通刷新、普通管理员页面和没有代登录标记的历史页面不受影响。
*/
function installImpersonationPageRestoreGuard() {
	if (typeof window === "undefined" || pageRestoreGuardInstalled) return;
	pageRestoreGuardInstalled = true;
	window.addEventListener("pageshow", (event) => {
		if (shouldReloadImpersonationAfterPageRestore(event.persisted, hasImpersonationSessionMarker())) window.location.reload();
	});
}
function readImpersonationSession() {
	const storage = getSessionStorage();
	if (!storage) return null;
	try {
		return parseImpersonationSession(storage.getItem(IMPERSONATION_SESSION_KEY));
	} catch (_unused4) {
		return null;
	}
}
function writeImpersonationSession(session) {
	const storage = getSessionStorage();
	if (!storage) throw new Error("当前浏览器不支持安全的标签页会话存储");
	storage.setItem(IMPERSONATION_SESSION_KEY, JSON.stringify(session));
}
function assertImpersonationStorageAvailable() {
	const storage = getSessionStorage();
	if (!storage) throw new Error("当前浏览器不支持安全的标签页会话存储");
	const probeKey = `${IMPERSONATION_SESSION_KEY}:probe`;
	try {
		storage.setItem(probeKey, "1");
		storage.removeItem(probeKey);
	} catch (_unused5) {
		throw new Error("当前浏览器禁止标签页会话存储，无法安全切换员工视角");
	}
}
function clearImpersonationSession() {
	const storage = getSessionStorage();
	if (!storage) return;
	try {
		storage.removeItem(IMPERSONATION_SESSION_KEY);
	} catch (_unused6) {}
}
function getOrCreateTabId() {
	if (typeof window === "undefined") return "";
	try {
		if (window.name.startsWith(TAB_ID_PREFIX)) return window.name.slice(16);
		const tabId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
		window.name = `${TAB_ID_PREFIX}${tabId}`;
		return tabId;
	} catch (_unused7) {
		return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
	}
}
function createOwnershipClaimId() {
	const randomPart = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).slice(2);
	return `${Date.now().toString(36)}:${randomPart}`;
}
function readOwnershipMessage(value) {
	if (!value || typeof value !== "object") return null;
	const candidate = value;
	if (![
		"claim",
		"contender",
		"occupied"
	].includes(String(candidate.type))) return null;
	if (!String(candidate.claimId || "").trim()) return null;
	return {
		type: candidate.type,
		claimId: String(candidate.claimId),
		targetId: candidate.targetId ? String(candidate.targetId) : void 0
	};
}
function releaseOwnershipOnPageHide() {
	if (typeof window === "undefined") return;
	window.addEventListener("pagehide", releaseImpersonationTabOwnership, { once: true });
}
/**
* Web Locks 不可用时，通过同源 BroadcastChannel 竞选唯一所有者。
* 已持有者会拒绝后来者；同时启动的标签页按随机 claimId 确定唯一胜者。
*/
function claimWithBroadcastChannel(_x) {
	return _claimWithBroadcastChannel.apply(this, arguments);
}
function _claimWithBroadcastChannel() {
	_claimWithBroadcastChannel = _asyncToGenerator(function* (sessionId) {
		if (typeof BroadcastChannel === "undefined") return null;
		const claimId = createOwnershipClaimId();
		const contenders = new Set([claimId]);
		let occupied = false;
		let channel;
		try {
			channel = new BroadcastChannel(`zhehang-impersonation-owner:${sessionId}`);
		} catch (_unused8) {
			return null;
		}
		channel.onmessage = (event) => {
			const message = readOwnershipMessage(event.data);
			if (!message || message.claimId === claimId) return;
			if (message.type === "claim") {
				contenders.add(message.claimId);
				channel.postMessage({
					type: "contender",
					claimId,
					targetId: message.claimId
				});
				return;
			}
			if (message.targetId !== claimId) return;
			if (message.type === "contender") contenders.add(message.claimId);
			if (message.type === "occupied") occupied = true;
		};
		channel.postMessage({
			type: "claim",
			claimId
		});
		yield new Promise((resolve) => setTimeout(resolve, 180));
		const winner = Array.from(contenders).sort()[0];
		if (occupied || winner !== claimId) {
			channel.close();
			return false;
		}
		ownedSessionId = sessionId;
		ownershipChannel = channel;
		channel.onmessage = (event) => {
			const message = readOwnershipMessage(event.data);
			if ((message === null || message === void 0 ? void 0 : message.type) !== "claim" || message.claimId === claimId) return;
			channel.postMessage({
				type: "occupied",
				claimId,
				targetId: message.claimId
			});
		};
		releaseOwnershipOnPageHide();
		return true;
	});
	return _claimWithBroadcastChannel.apply(this, arguments);
}
/** Web Locks（或 BroadcastChannel 兼容层）保证同一代登录会话最多由一个标签页持有。 */
function claimImpersonationTabOwnership(_x3) {
	return _claimImpersonationTabOwnership.apply(this, arguments);
}
function _claimImpersonationTabOwnership() {
	_claimImpersonationTabOwnership = _asyncToGenerator(function* (sessionId) {
		if (ownedSessionId === sessionId) return true;
		if (ownedSessionId) return false;
		const lockManager = typeof navigator === "undefined" ? void 0 : navigator.locks;
		if (!(lockManager === null || lockManager === void 0 ? void 0 : lockManager.request)) {
			const claimed = yield claimWithBroadcastChannel(sessionId);
			if (claimed !== null) return claimed;
			return false;
		}
		return new Promise((resolve) => {
			lockManager.request(`zhehang-impersonation:${sessionId}`, {
				mode: "exclusive",
				ifAvailable: true
			}, function() {
				var _ref = _asyncToGenerator(function* (lock) {
					if (!lock) {
						resolve(false);
						return;
					}
					ownedSessionId = sessionId;
					releaseOwnershipOnPageHide();
					yield new Promise((release) => {
						releaseOwnership = release;
						resolve(true);
					});
					if (ownedSessionId === sessionId) ownedSessionId = "";
					releaseOwnership = void 0;
				});
				return function(_x2) {
					return _ref.apply(this, arguments);
				};
			}());
		});
	});
	return _claimImpersonationTabOwnership.apply(this, arguments);
}
function releaseImpersonationTabOwnership() {
	const release = releaseOwnership;
	releaseOwnership = void 0;
	release === null || release === void 0 || release();
	ownershipChannel === null || ownershipChannel === void 0 || ownershipChannel.close();
	ownershipChannel = null;
	ownedSessionId = "";
}
function isImpersonationExpired(session, now = Date.now()) {
	if (!session) return true;
	const expiresAt = new Date(session.expireTime).getTime();
	return !Number.isFinite(expiresAt) || expiresAt <= now;
}
function isCurrentImpersonationValid(current, stored) {
	return (current === null || current === void 0 ? void 0 : current.active) === true && String(current.sessionId || "") === stored.sessionId && Number(current.targetUserId) === stored.targetUserId;
}
function sanitizeReturnUrl(value) {
	const path = typeof value === "string" ? value : "/";
	if (!path.startsWith("/") || path.startsWith("//") || path.startsWith("/login")) return "/";
	return path;
}
//#endregion
//#region src/utils/auth.ts
var TOKEN_KEY = "zhehang_erp_token";
var REFRESH_TOKEN_KEY = "refreshToken";
var baseToken = "";
var authLifecycleVersion = 0;
storageRemove(TOKEN_KEY);
if (typeof window !== "undefined") window.addEventListener("storage", (event) => {
	if (event.key === TOKEN_KEY || event.key === REFRESH_TOKEN_KEY) authLifecycleVersion += 1;
});
function getAuthLifecycleVersion() {
	return authLifecycleVersion;
}
function advanceAuthLifecycleVersion() {
	authLifecycleVersion += 1;
}
function getToken() {
	return getCurrentAuthentication().token;
}
function getCurrentAuthentication() {
	return getAuthenticationSelection(getBaseToken());
}
function getBaseToken() {
	return baseToken;
}
function setToken(token) {
	baseToken = token;
}
function getRefreshToken() {
	return storageGet(REFRESH_TOKEN_KEY) || "";
}
function clearLegacyRefreshToken() {
	storageRemove(REFRESH_TOKEN_KEY);
}
function removeToken() {
	advanceAuthLifecycleVersion();
	baseToken = "";
	storageRemove(TOKEN_KEY);
	storageRemove(REFRESH_TOKEN_KEY);
}
//#endregion
//#region src/api/base-url.ts
/**
* Source-only releases intentionally do not carry local `.env.*` files.
* Use the same-origin API gateway as the safe default while still allowing
* an explicit development or staging override.
*/
function resolveApiBaseUrl(configured) {
	return String(configured || "").trim().replace(/\/+$/, "") || "/api";
}
function getApiBaseUrl() {
	return resolveApiBaseUrl("/api");
}
function resolveApiUrl(path, configured) {
	const value = String(path || "").trim();
	if (!value) return resolveApiBaseUrl(configured);
	if (/^https?:\/\//i.test(value)) return value;
	if (value === "/api" || value.startsWith("/api/")) return value;
	return `${resolveApiBaseUrl(configured)}/${value.replace(/^\/+/, "")}`;
}
//#endregion
//#region src/api/request.ts
function apiError(message, code, data) {
	return Object.assign(new Error(message), {
		code,
		data
	});
}
var service = axios.create({
	baseURL: getApiBaseUrl(),
	withCredentials: true,
	timeout: 3e4,
	headers: { "Content-Type": "application/json;charset=UTF-8" }
});
service.interceptors.request.use((config) => {
	var _authentication$sessi, _authentication$sessi2;
	const requestConfig = config;
	const authentication = getCurrentAuthentication();
	const token = authentication.token;
	requestConfig._authMode = authentication.mode;
	requestConfig._impersonationSessionId = ((_authentication$sessi = authentication.session) === null || _authentication$sessi === void 0 ? void 0 : _authentication$sessi.sessionId) || null;
	requestConfig._authAccessFingerprint = accessTokenFingerprint(token);
	requestConfig._authLifecycleVersion = getAuthLifecycleVersion();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	if (authentication.mode === "impersonation" && ((_authentication$sessi2 = authentication.session) === null || _authentication$sessi2 === void 0 ? void 0 : _authentication$sessi2.tabId)) config.headers["X-Impersonation-Tab-Id"] = authentication.session.tabId;
	return config;
}, (error) => {
	return Promise.reject(error);
});
var isRefreshing = false;
var REFRESH_SUPERSEDED = Symbol("refresh-superseded");
var refreshWaiters = [];
function tokenClaims(token) {
	try {
		const payload = token.split(".")[1];
		if (!payload) return null;
		const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
		return JSON.parse(window.atob(padded));
	} catch (_unused) {
		return null;
	}
}
function accessTokenFingerprint(token) {
	var _claims$jti, _claims$iat, _claims$exp;
	const claims = tokenClaims(token);
	if (!claims || claims.userId == null || !claims.uuid) return null;
	return [
		claims.userId,
		claims.uuid,
		(_claims$jti = claims.jti) !== null && _claims$jti !== void 0 ? _claims$jti : "",
		(_claims$iat = claims.iat) !== null && _claims$iat !== void 0 ? _claims$iat : "",
		(_claims$exp = claims.exp) !== null && _claims$exp !== void 0 ? _claims$exp : ""
	].map(String).join(":");
}
function requestNewToken(_x) {
	return _requestNewToken.apply(this, arguments);
}
function _requestNewToken() {
	_requestNewToken = _asyncToGenerator(function* (expectedLifecycleVersion) {
		const lockManager = navigator.locks;
		if (lockManager === null || lockManager === void 0 ? void 0 : lockManager.request) try {
			return yield lockManager.request("zhehang-auth-refresh", () => performTokenRefresh(expectedLifecycleVersion));
		} catch (_unused2) {
			return REFRESH_SUPERSEDED;
		}
		return performTokenRefresh(expectedLifecycleVersion);
	});
	return _requestNewToken.apply(this, arguments);
}
function performTokenRefresh(_x2) {
	return _performTokenRefresh.apply(this, arguments);
}
function _performTokenRefresh() {
	_performTokenRefresh = _asyncToGenerator(function* (expectedLifecycleVersion) {
		const legacyRefreshToken = getRefreshToken();
		const lifecycleVersion = expectedLifecycleVersion !== null && expectedLifecycleVersion !== void 0 ? expectedLifecycleVersion : getAuthLifecycleVersion();
		if (getAuthLifecycleVersion() !== lifecycleVersion) return REFRESH_SUPERSEDED;
		try {
			var _resp$data;
			const resp = yield service.post("/auth/refresh", legacyRefreshToken ? { refreshToken: legacyRefreshToken } : {}, {
				_skipRefresh: true,
				silentError: true,
				skipAuthRedirect: true
			});
			const data = (_resp$data = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _resp$data !== void 0 ? _resp$data : resp;
			const newAccess = (data === null || data === void 0 ? void 0 : data.accessToken) || (data === null || data === void 0 ? void 0 : data.token);
			if (newAccess) {
				if (getAuthLifecycleVersion() !== lifecycleVersion) return REFRESH_SUPERSEDED;
				setToken(newAccess);
				clearLegacyRefreshToken();
				return newAccess;
			}
		} catch (_unused3) {}
		return getAuthLifecycleVersion() === lifecycleVersion ? null : REFRESH_SUPERSEDED;
	});
	return _performTokenRefresh.apply(this, arguments);
}
/** Restores a page reload from the HttpOnly refresh cookie without exposing it to JavaScript. */
function restoreAccessToken() {
	return _restoreAccessToken.apply(this, arguments);
}
function _restoreAccessToken() {
	_restoreAccessToken = _asyncToGenerator(function* () {
		const result = yield requestNewToken(getAuthLifecycleVersion());
		return typeof result === "string" ? result : null;
	});
	return _restoreAccessToken.apply(this, arguments);
}
function performCookieOnlyTokenRefresh(_x3) {
	return _performCookieOnlyTokenRefresh.apply(this, arguments);
}
function _performCookieOnlyTokenRefresh() {
	_performCookieOnlyTokenRefresh = _asyncToGenerator(function* (lifecycleVersion) {
		if (getAuthLifecycleVersion() !== lifecycleVersion) return null;
		try {
			var _resp$data2;
			const resp = yield service.post("/auth/refresh", {}, {
				_skipRefresh: true,
				silentError: true,
				skipAuthRedirect: true
			});
			const data = (_resp$data2 = resp === null || resp === void 0 ? void 0 : resp.data) !== null && _resp$data2 !== void 0 ? _resp$data2 : resp;
			const newAccess = (data === null || data === void 0 ? void 0 : data.accessToken) || (data === null || data === void 0 ? void 0 : data.token);
			if (newAccess && getAuthLifecycleVersion() === lifecycleVersion) {
				setToken(newAccess);
				clearLegacyRefreshToken();
				return newAccess;
			}
		} catch (_unused4) {}
		return null;
	});
	return _performCookieOnlyTokenRefresh.apply(this, arguments);
}
/**
* V214 login compatibility path. The request body is deliberately empty and never reads the
* one-time legacy refresh storage used by the general V210 migration path above. It shares the
* same cross-tab Web Lock as normal refresh so the single-consumption Cookie cannot race itself.
*/
function restoreAccessTokenFromHttpOnlyCookie() {
	return _restoreAccessTokenFromHttpOnlyCookie.apply(this, arguments);
}
function _restoreAccessTokenFromHttpOnlyCookie() {
	_restoreAccessTokenFromHttpOnlyCookie = _asyncToGenerator(function* () {
		const lifecycleVersion = getAuthLifecycleVersion();
		const lockManager = navigator.locks;
		if (lockManager === null || lockManager === void 0 ? void 0 : lockManager.request) try {
			return yield lockManager.request("zhehang-auth-refresh", () => performCookieOnlyTokenRefresh(lifecycleVersion));
		} catch (_unused5) {
			return null;
		}
		return performCookieOnlyTokenRefresh(lifecycleVersion);
	});
	return _restoreAccessTokenFromHttpOnlyCookie.apply(this, arguments);
}
function redirectToLogin() {
	removeToken();
	if (window.location.pathname !== "/login") window.location.href = "/login";
}
var impersonationRestoreScheduled = false;
function restoreAdministratorView(message = "员工视角已到期，已恢复超级管理员身份") {
	var _readImpersonationSes;
	if (impersonationRestoreScheduled) return;
	impersonationRestoreScheduled = true;
	const returnUrl = ((_readImpersonationSes = readImpersonationSession()) === null || _readImpersonationSes === void 0 ? void 0 : _readImpersonationSes.returnUrl) || "/";
	markImpersonationRestorePending();
	clearImpersonationSession();
	advanceAuthLifecycleVersion();
	ElMessage.warning(message);
	if (typeof window !== "undefined") window.location.replace(sanitizeReturnUrl(returnUrl));
}
service.interceptors.response.use((response) => {
	if (response.config.responseType === "blob") return response.data;
	const { code, message, data } = response.data;
	if (code === 200 || code === 0) {
		if (data && typeof data === "object" && Array.isArray(data.records) && data.list === void 0) data.list = data.records;
		return response.data;
	}
	if (code === 401) {
		const config = response.config;
		if (config._authMode === "impersonation") {
			restoreAdministratorView(message || "员工视角已到期，已恢复超级管理员身份");
			return Promise.reject(apiError(message || "员工视角已到期", code, data));
		}
		if (config._skipRefresh) return Promise.reject(apiError(message || "刷新令牌无效", code, data));
		if (config.skipAuthRedirect) {
			if (!config.silentError) ElMessage.error(message || "未授权");
			return Promise.reject(apiError(message || "未授权", code, data));
		}
		ElMessageBox.confirm("登录已过期，请重新登录", "提示", {
			confirmButtonText: "重新登录",
			cancelButtonText: "取消",
			type: "warning"
		}).then(() => {
			removeToken();
			window.location.href = "/login";
		});
		return Promise.reject(apiError(message || "未授权", code, data));
	}
	if (!response.config.silentError) ElMessage.error(message || "请求失败");
	return Promise.reject(apiError(message || "请求失败", code, data));
}, (error) => {
	var _error$config, _error$config2;
	const { response } = error;
	const silentError = !!((_error$config = error.config) === null || _error$config === void 0 ? void 0 : _error$config.silentError);
	const skipAuthRedirect = !!((_error$config2 = error.config) === null || _error$config2 === void 0 ? void 0 : _error$config2.skipAuthRedirect);
	if (response) switch (response.status) {
		case 401: {
			const cfg = error.config || {};
			if (cfg._authMode === "impersonation") {
				var _response$data;
				restoreAdministratorView(((_response$data = response.data) === null || _response$data === void 0 ? void 0 : _response$data.message) || "员工视角已到期，已恢复超级管理员身份");
				return Promise.reject(error);
			}
			if (skipAuthRedirect) {
				var _response$data2;
				if (!silentError) ElMessage.error(((_response$data2 = response.data) === null || _response$data2 === void 0 ? void 0 : _response$data2.message) || "未授权");
				break;
			}
			if (cfg._skipRefresh) return Promise.reject(error);
			if (cfg._retried) {
				if (!(cfg._authAccessFingerprint === accessTokenFingerprint(getToken()) && cfg._authLifecycleVersion === getAuthLifecycleVersion())) return Promise.reject(error);
				redirectToLogin();
				break;
			}
			cfg._retried = true;
			return _asyncToGenerator(function* () {
				let newToken;
				if (isRefreshing) newToken = yield new Promise((resolve) => refreshWaiters.push(resolve));
				else {
					isRefreshing = true;
					try {
						newToken = yield requestNewToken(cfg._authLifecycleVersion);
					} finally {
						isRefreshing = false;
					}
					refreshWaiters.forEach((cb) => cb(newToken));
					refreshWaiters = [];
				}
				if (newToken) {
					if (newToken === REFRESH_SUPERSEDED) return Promise.reject(error);
					return service(cfg);
				}
				redirectToLogin();
				return Promise.reject(error);
			})();
		}
		case 403:
			if (!silentError) {
				var _response$data3, _error$config3;
				const message = (_response$data3 = response.data) === null || _response$data3 === void 0 ? void 0 : _response$data3.message;
				ElMessage.error(message || (((_error$config3 = error.config) === null || _error$config3 === void 0 ? void 0 : _error$config3._authMode) === "impersonation" ? "员工视角为查看模式，禁止执行该操作" : "没有权限访问"));
			}
			break;
		case 404:
			if (!silentError) ElMessage.error("请求的资源不存在");
			break;
		case 500:
			if (!silentError) ElMessage.error("服务器内部错误");
			break;
		default:
			var _response$data4;
			if (!silentError) ElMessage.error(((_response$data4 = response.data) === null || _response$data4 === void 0 ? void 0 : _response$data4.message) || "请求失败");
	}
	else if (!silentError) ElMessage.error("网络连接异常，请稍后重试");
	if ((response === null || response === void 0 ? void 0 : response.data) && typeof response.data === "object") {
		var _response$data$code;
		error.code = (_response$data$code = response.data.code) !== null && _response$data$code !== void 0 ? _response$data$code : response.status;
		error.data = response.data.data;
		if (response.data.message) error.message = response.data.message;
	}
	return Promise.reject(error);
});
function get(url, params, config) {
	return service.get(url, _objectSpread2({ params }, config));
}
function post(url, data, config) {
	return service.post(url, data, config);
}
function put(url, data, config) {
	return service.put(url, data, config);
}
function del(url, config) {
	return service.delete(url, config);
}
//#endregion
export { storageRemove as A, isImpersonationExpired as C, sanitizeReturnUrl as D, releaseImpersonationTabOwnership as E, writeImpersonationSession as O, isCurrentImpersonationValid as S, readImpersonationSession as T, clearImpersonationSession as _, restoreAccessToken as a, installImpersonationPageRestoreGuard as b, getApiBaseUrl as c, getRefreshToken as d, getToken as f, claimImpersonationTabOwnership as g, assertImpersonationStorageAvailable as h, put as i, storageSet as j, storageGet as k, resolveApiUrl as l, setToken as m, get as n, restoreAccessTokenFromHttpOnlyCookie as o, removeToken as p, post as r, service as s, del as t, advanceAuthLifecycleVersion as u, getOrCreateTabId as v, markImpersonationRestorePending as w, isAllowedImpersonationTargetUserId as x, hasImpersonationSessionMarker as y };

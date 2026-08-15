import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, kt as resolveComponent, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { At as chat_dot_round_default, Bn as refresh_default, Er as withKeys, F as ElEmpty, N as ElImage, T as ElProgress, Un as search_default, W as ElDatePicker, _ as ElTableColumn, d as ElTree, ft as ElAvatar, g as ElTable, h as ElTabs, it as ElTag, j as ElLink, m as ElTabPane, nt as ElOption, o as ElMessage, ot as ElButton, rt as ElSelect, s as vLoading, vt as ElAlert, wr as vModelText, yt as ElIcon, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as yunkeApi } from "./yunke-DhOFgmEW.js";
import { t as wechatFriendApi } from "./wechat-DSojRbKm.js";
//#region src/views/customer/WechatChatDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "wx-chat" };
var _hoisted_2$1 = { class: "wx-nav" };
var _hoisted_3$1 = {
	key: 1,
	class: "wx-me wx-me-txt"
};
var _hoisted_4$1 = {
	key: 0,
	class: "wx-sess"
};
var _hoisted_5$1 = { class: "wx-sess-top" };
var _hoisted_6$1 = { class: "wx-search" };
var _hoisted_7$1 = { class: "wx-sess-scroll" };
var _hoisted_8$1 = ["onClick"];
var _hoisted_9$1 = { class: "wx-si-body" };
var _hoisted_10$1 = { class: "wx-si-name" };
var _hoisted_11$1 = { class: "wx-si-last" };
var _hoisted_12$1 = { class: "wx-si-meta" };
var _hoisted_13$1 = { class: "wx-si-time" };
var _hoisted_14$1 = { class: "wx-si-cnt" };
var _hoisted_15$1 = {
	key: 1,
	class: "wx-main"
};
var _hoisted_16$1 = {
	key: 0,
	class: "wx-empty"
};
var _hoisted_17$1 = { class: "wx-main-hd" };
var _hoisted_18$1 = { class: "wx-tools" };
var _hoisted_19$1 = { class: "wx-search sm" };
var _hoisted_20$1 = { class: "wx-ba" };
var _hoisted_21$1 = { class: "wx-bubble" };
var _hoisted_22$1 = {
	key: 2,
	class: "wx-file"
};
var _hoisted_23$1 = ["href"];
var _hoisted_24$1 = ["href"];
var _hoisted_25$1 = ["href"];
var _hoisted_26$1 = {
	key: 6,
	class: "wx-file"
};
var _hoisted_27$1 = {
	key: 7,
	class: "wx-file"
};
var _hoisted_28$1 = {
	key: 8,
	class: "wx-sys"
};
var _hoisted_29$1 = { class: "wx-time" };
var _hoisted_30$1 = {
	key: 2,
	class: "wx-panel"
};
var _hoisted_31$1 = { class: "wx-panel-hd" };
var _hoisted_32$1 = { class: "wx-panel-body" };
var _hoisted_33$1 = {
	key: 1,
	class: "wx-ba"
};
var _hoisted_34$1 = { class: "wx-mom-main" };
var _hoisted_35$1 = { class: "wx-mom-name" };
var _hoisted_36$1 = {
	key: 0,
	class: "wx-mom-text"
};
var _hoisted_37$1 = {
	key: 1,
	class: "wx-mom-imgs"
};
var _hoisted_38$1 = { class: "wx-mom-time" };
var _hoisted_39$1 = {
	key: 3,
	class: "wx-panel"
};
var _hoisted_40$1 = { class: "wx-panel-hd" };
var _hoisted_41$1 = { class: "wx-panel-t" };
var _hoisted_42$1 = {
	key: 0,
	class: "wx-panel-n"
};
var _hoisted_43$1 = { class: "wx-search sm" };
var _hoisted_44$1 = { class: "wx-panel-body" };
var _hoisted_45$1 = {
	key: 1,
	class: "wx-av"
};
var _hoisted_46$1 = { class: "wx-ct-main" };
var _hoisted_47$1 = { class: "wx-ct-name" };
var _hoisted_48$1 = {
	key: 0,
	class: "wx-ct-nick"
};
var _hoisted_49$1 = { class: "wx-ct-sub" };
var _hoisted_50 = { class: "wx-ct-tags" };
var _hoisted_51 = {
	key: 0,
	class: "wx-more"
};
var _hoisted_52 = {
	key: 4,
	class: "wx-panel"
};
var _hoisted_53 = { class: "wx-panel-body" };
var _hoisted_54 = { class: "wx-st-grid" };
var _hoisted_55 = { class: "wx-st" };
var _hoisted_56 = { class: "wx-st" };
var _hoisted_57 = { class: "wx-st" };
var _hoisted_58 = { class: "wx-st" };
var _hoisted_59 = { class: "wx-st" };
var _hoisted_60 = { class: "wx-st" };
var CT_SIZE = 50;
//#endregion
//#region src/views/customer/WechatChatDrawer.vue
var WechatChatDrawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "WechatChatDrawer",
	setup(__props, { expose: __expose }) {
		const visible = ref(false);
		const wechatId = ref("");
		const staffName = ref("");
		const staffHead = ref("");
		const sessions = ref([]);
		const messages = ref([]);
		const cur = ref("");
		const curRoom = ref(false);
		const loading = ref(false);
		const msgLoading = ref(false);
		const scrollEl = ref(null);
		const nav = ref("single");
		const isChat = computed(() => nav.value === "single" || nav.value === "room");
		const sessKeyword = ref("");
		const msgKeyword = ref("");
		const msgType = ref("");
		const msgRange = ref([]);
		const filteredSessions = computed(() => {
			let list = sessions.value.filter((s) => nav.value === "room" ? s.roomid : !s.roomid);
			const k = sessKeyword.value.trim();
			if (k) list = list.filter((s) => (s.talker || "").includes(k) || (s.lastContent || "").includes(k));
			return list;
		});
		const open = (wid, name, head) => {
			wechatId.value = wid;
			staffName.value = name;
			staffHead.value = head || "";
			nav.value = "single";
			cur.value = "";
			messages.value = [];
			sessions.value = [];
			sessKeyword.value = "";
			moments.value = [];
			momRange.value = [];
			momLoaded.value = false;
			momError.value = "";
			contacts.value = [];
			ctTotal.value = 0;
			ctKeyword.value = "";
			ctPage.value = 0;
			visible.value = true;
			loadSessions();
		};
		__expose({ open });
		const loadSessions = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield yunkeApi.wechatChat({ wechatId: wechatId.value });
					const d = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					sessions.value = (d === null || d === void 0 ? void 0 : d.sessions) || [];
				} catch (_unused) {
					sessions.value = [];
				} finally {
					loading.value = false;
				}
			});
			return function loadSessions() {
				return _ref.apply(this, arguments);
			};
		}();
		const curName = ref("");
		const sessName = (s) => s.name || (s.roomid ? "群聊" : shortName(s.talker));
		const openSession = (talker, roomid, name) => {
			cur.value = talker;
			curName.value = name || "";
			curRoom.value = !!roomid;
			msgKeyword.value = "";
			msgType.value = "";
			msgRange.value = [];
			loadMsg();
		};
		const loadMsg = function() {
			var _ref2 = _asyncToGenerator(function* () {
				if (!cur.value) return;
				msgLoading.value = true;
				try {
					var _msgRange$value, _res$data2;
					const params = { wechatId: wechatId.value };
					if (curRoom.value) params.roomid = cur.value;
					else params.talker = cur.value;
					if (msgKeyword.value.trim()) params.keyword = msgKeyword.value.trim();
					if (msgType.value !== "") params.msgType = msgType.value;
					if (((_msgRange$value = msgRange.value) === null || _msgRange$value === void 0 ? void 0 : _msgRange$value.length) === 2) {
						params.beginYmd = msgRange.value[0];
						params.endYmd = msgRange.value[1];
					}
					const res = yield yunkeApi.wechatChat(params);
					const d = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					messages.value = (d === null || d === void 0 ? void 0 : d.messages) || [];
					yield nextTick();
					if (scrollEl.value) scrollEl.value.scrollTop = scrollEl.value.scrollHeight;
				} catch (_unused2) {
					messages.value = [];
				} finally {
					msgLoading.value = false;
				}
			});
			return function loadMsg() {
				return _ref2.apply(this, arguments);
			};
		}();
		const shortName = (t) => {
			if (!t) return "—";
			return t.length > 14 ? t.slice(0, 10) + "…" : t;
		};
		const fmtTime = (t) => t ? String(t).replace("T", " ").slice(5, 16) : "";
		const fmtDay = (t) => t ? String(t).replace("T", " ").slice(5, 10) : "";
		const typeName = (ty) => ({
			1: "文本",
			2: "图片",
			3: "语音",
			4: "视频",
			8: "GIF",
			9: "文件",
			10: "链接",
			13: "名片",
			14: "位置",
			15: "系统",
			18: "小程序",
			21: "引用",
			22: "拍一拍"
		})[ty] || "消息";
		const preview = (ty, content) => {
			if ([
				1,
				21,
				22
			].includes(ty)) return content || "";
			return "[" + typeName(ty) + "]";
		};
		const moments = ref([]);
		const momRange = ref([]);
		const momLoading = ref(false);
		const momLoaded = ref(false);
		const momError = ref("");
		const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		const loadMoments = function() {
			var _ref3 = _asyncToGenerator(function* () {
				if (!wechatId.value) return;
				if (!momRange.value || momRange.value.length !== 2) {
					const end = /* @__PURE__ */ new Date();
					momRange.value = [ymd(/* @__PURE__ */ new Date(end.getTime() - 29 * 864e5)), ymd(end)];
				}
				momLoading.value = true;
				momError.value = "";
				try {
					var _res$data3;
					const res = yield yunkeApi.moments({
						wechatId: wechatId.value,
						beginYmd: momRange.value[0],
						endYmd: momRange.value[1]
					});
					const d = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					moments.value = (d === null || d === void 0 ? void 0 : d.list) || (d === null || d === void 0 ? void 0 : d.moments) || (Array.isArray(d) ? d : []);
					momLoaded.value = true;
				} catch (_unused3) {
					moments.value = [];
					momLoaded.value = true;
					momError.value = "云客接口暂时没响应,稍后再试";
				} finally {
					momLoading.value = false;
				}
			});
			return function loadMoments() {
				return _ref3.apply(this, arguments);
			};
		}();
		const momText = (m) => (m === null || m === void 0 ? void 0 : m.content) || (m === null || m === void 0 ? void 0 : m.text) || (m === null || m === void 0 ? void 0 : m.title) || (m === null || m === void 0 ? void 0 : m.desc) || "";
		const momImgs = (m) => {
			var _ref4, _ref5, _ref6, _ref7, _m$images;
			const raw = (_ref4 = (_ref5 = (_ref6 = (_ref7 = (_m$images = m === null || m === void 0 ? void 0 : m.images) !== null && _m$images !== void 0 ? _m$images : m === null || m === void 0 ? void 0 : m.imgUrls) !== null && _ref7 !== void 0 ? _ref7 : m === null || m === void 0 ? void 0 : m.imageUrls) !== null && _ref6 !== void 0 ? _ref6 : m === null || m === void 0 ? void 0 : m.imgs) !== null && _ref5 !== void 0 ? _ref5 : m === null || m === void 0 ? void 0 : m.urls) !== null && _ref4 !== void 0 ? _ref4 : m === null || m === void 0 ? void 0 : m.picUrls;
			if (!raw) return [];
			if (Array.isArray(raw)) return raw.filter(Boolean).map((x) => typeof x === "string" ? x : (x === null || x === void 0 ? void 0 : x.url) || "").filter(Boolean);
			if (typeof raw === "string") return raw.split(",").map((s) => s.trim()).filter(Boolean);
			return [];
		};
		const momTime = (m) => {
			const t = (m === null || m === void 0 ? void 0 : m.createTime) || (m === null || m === void 0 ? void 0 : m.time) || (m === null || m === void 0 ? void 0 : m.publishTime) || (m === null || m === void 0 ? void 0 : m.sendTime) || "";
			return t ? String(t).replace("T", " ").slice(0, 16) : "";
		};
		const contacts = ref([]);
		const ctTotal = ref(0);
		const ctKeyword = ref("");
		const ctLoading = ref(false);
		const ctPage = ref(0);
		const loadContacts = function() {
			var _ref8 = _asyncToGenerator(function* (reset) {
				if (!wechatId.value) return;
				ctLoading.value = true;
				try {
					var _res$data4, _d$total;
					const page = reset ? 1 : ctPage.value + 1;
					const params = {
						pageNum: page,
						pageSize: CT_SIZE,
						wxId: wechatId.value
					};
					if (ctKeyword.value.trim()) params.keyword = ctKeyword.value.trim();
					const res = yield wechatFriendApi.list(params);
					const d = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res;
					const rows = (d === null || d === void 0 ? void 0 : d.records) || (d === null || d === void 0 ? void 0 : d.list) || (d === null || d === void 0 ? void 0 : d.rows) || [];
					contacts.value = reset ? rows : contacts.value.concat(rows);
					ctTotal.value = Number((_d$total = d === null || d === void 0 ? void 0 : d.total) !== null && _d$total !== void 0 ? _d$total : contacts.value.length);
					ctPage.value = page;
				} catch (_unused4) {
					if (reset) {
						contacts.value = [];
						ctTotal.value = 0;
					}
				} finally {
					ctLoading.value = false;
				}
			});
			return function loadContacts(_x) {
				return _ref8.apply(this, arguments);
			};
		}();
		const reloadContacts = () => loadContacts(true);
		const ctLabels = (f) => {
			const raw = f === null || f === void 0 ? void 0 : f.contactLabelValues;
			if (!raw) return [];
			return String(raw).split(/[,，]/).map((s) => s.trim()).filter(Boolean).slice(0, 4);
		};
		const statSingle = computed(() => sessions.value.filter((s) => !s.roomid).length);
		const statRoom = computed(() => sessions.value.filter((s) => s.roomid).length);
		const statMsg = computed(() => sessions.value.reduce((sum, s) => sum + (Number(s.count) || 0), 0));
		const statLastDay = computed(() => {
			let max = "";
			for (const s of sessions.value) {
				const t = s.lastTime ? String(s.lastTime) : "";
				if (t && t > max) max = t;
			}
			return max ? max.replace("T", " ").slice(0, 10) : "";
		});
		watch(nav, (v) => {
			if (v === "moments" && !momLoaded.value) loadMoments();
			if (v === "contacts" && !ctPage.value) loadContacts(true);
			if (v === "stats") {
				if (!momLoaded.value) loadMoments();
				if (!ctPage.value) loadContacts(true);
			}
		});
		return (_ctx, _cache) => {
			const _component_el_avatar = ElAvatar;
			const _component_el_icon = ElIcon;
			const _component_el_empty = ElEmpty;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_button = ElButton;
			const _component_el_image = ElImage;
			const _component_el_tag = ElTag;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => visible.value = $event),
				title: `${staffName.value || wechatId.value} · 微信聊天`,
				size: "1080px",
				"append-to-body": "",
				class: "wx-drawer"
			}, {
				default: withCtx(() => [createBaseVNode("div", _hoisted_1$1, [
					createBaseVNode("div", _hoisted_2$1, [
						staffHead.value ? (openBlock(), createBlock(_component_el_avatar, {
							key: 0,
							src: staffHead.value,
							size: 42,
							shape: "square",
							class: "wx-me"
						}, null, 8, ["src"])) : (openBlock(), createElementBlock("div", _hoisted_3$1, toDisplayString((staffName.value || "微").slice(0, 1)), 1)),
						createBaseVNode("a", {
							class: normalizeClass({ on: nav.value === "single" }),
							onClick: _cache[0] || (_cache[0] = ($event) => nav.value = "single")
						}, [..._cache[13] || (_cache[13] = [createBaseVNode("span", { class: "ni" }, "💬", -1), createTextVNode("单聊", -1)])], 2),
						createBaseVNode("a", {
							class: normalizeClass({ on: nav.value === "room" }),
							onClick: _cache[1] || (_cache[1] = ($event) => nav.value = "room")
						}, [..._cache[14] || (_cache[14] = [createBaseVNode("span", { class: "ni" }, "👥", -1), createTextVNode("群聊", -1)])], 2),
						createBaseVNode("a", {
							class: normalizeClass({ on: nav.value === "moments" }),
							onClick: _cache[2] || (_cache[2] = ($event) => nav.value = "moments")
						}, [..._cache[15] || (_cache[15] = [createBaseVNode("span", { class: "ni" }, "🌤️", -1), createTextVNode("朋友圈", -1)])], 2),
						createBaseVNode("a", {
							class: normalizeClass({ on: nav.value === "contacts" }),
							onClick: _cache[3] || (_cache[3] = ($event) => nav.value = "contacts")
						}, [..._cache[16] || (_cache[16] = [createBaseVNode("span", { class: "ni" }, "📇", -1), createTextVNode("通讯录", -1)])], 2),
						createBaseVNode("a", {
							class: normalizeClass({ on: nav.value === "stats" }),
							onClick: _cache[4] || (_cache[4] = ($event) => nav.value = "stats")
						}, [..._cache[17] || (_cache[17] = [createBaseVNode("span", { class: "ni" }, "📊", -1), createTextVNode("统计", -1)])], 2)
					]),
					isChat.value ? withDirectives((openBlock(), createElementBlock("div", _hoisted_4$1, [createBaseVNode("div", _hoisted_5$1, [createBaseVNode("div", _hoisted_6$1, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(search_default))]),
						_: 1
					}), withDirectives(createBaseVNode("input", {
						"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => sessKeyword.value = $event),
						placeholder: "搜会话 / 内容"
					}, null, 512), [[vModelText, sessKeyword.value]])])]), createBaseVNode("div", _hoisted_7$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(filteredSessions.value, (s) => {
						return openBlock(), createElementBlock("div", {
							key: s.talker,
							class: normalizeClass(["wx-sitem", { on: cur.value === s.talker }]),
							onClick: ($event) => openSession(s.talker, s.roomid, sessName(s))
						}, [
							s.headUrl ? (openBlock(), createBlock(_component_el_avatar, {
								key: 0,
								src: s.headUrl,
								size: 36,
								shape: "square",
								class: "wx-av-img"
							}, null, 8, ["src"])) : (openBlock(), createElementBlock("div", {
								key: 1,
								class: normalizeClass(["wx-av", { room: s.roomid }])
							}, toDisplayString(s.roomid ? "群" : (s.name || shortName(s.talker)).slice(0, 1)), 3)),
							createBaseVNode("div", _hoisted_9$1, [createBaseVNode("div", _hoisted_10$1, toDisplayString(sessName(s)), 1), createBaseVNode("div", _hoisted_11$1, toDisplayString(preview(s.lastType, s.lastContent)), 1)]),
							createBaseVNode("div", _hoisted_12$1, [createBaseVNode("span", _hoisted_13$1, toDisplayString(fmtDay(s.lastTime)), 1), createBaseVNode("span", _hoisted_14$1, toDisplayString(s.count), 1)])
						], 10, _hoisted_8$1);
					}), 128)), !filteredSessions.value.length && !loading.value ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: sessions.value.length ? "没有匹配的会话" : "暂无聊天(后台正在同步)",
						"image-size": 60
					}, null, 8, ["description"])) : createCommentVNode("", true)])])), [[_directive_loading, loading.value]]) : createCommentVNode("", true),
					isChat.value ? (openBlock(), createElementBlock("div", _hoisted_15$1, [!cur.value ? (openBlock(), createElementBlock("div", _hoisted_16$1, [createVNode(_component_el_icon, { size: 42 }, {
						default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
						_: 1
					}), _cache[18] || (_cache[18] = createBaseVNode("p", null, "← 选一个会话,看聊天记录", -1))])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
						createBaseVNode("div", _hoisted_17$1, toDisplayString(curName.value || (curRoom.value ? "群聊" : shortName(cur.value))) + " · " + toDisplayString(messages.value.length) + " 条", 1),
						createBaseVNode("div", _hoisted_18$1, [
							createBaseVNode("div", _hoisted_19$1, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(search_default))]),
								_: 1
							}), withDirectives(createBaseVNode("input", {
								"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => msgKeyword.value = $event),
								placeholder: "搜聊天内容",
								onKeyup: withKeys(loadMsg, ["enter"])
							}, null, 544), [[vModelText, msgKeyword.value]])]),
							createVNode(_component_el_select, {
								modelValue: msgType.value,
								"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => msgType.value = $event),
								size: "small",
								placeholder: "全部类型",
								clearable: "",
								class: "wx-type",
								onChange: loadMsg
							}, {
								default: withCtx(() => [
									createVNode(_component_el_option, {
										label: "文本",
										value: 1
									}),
									createVNode(_component_el_option, {
										label: "图片",
										value: 2
									}),
									createVNode(_component_el_option, {
										label: "语音",
										value: 3
									}),
									createVNode(_component_el_option, {
										label: "视频",
										value: 4
									}),
									createVNode(_component_el_option, {
										label: "文件",
										value: 9
									}),
									createVNode(_component_el_option, {
										label: "链接",
										value: 10
									})
								]),
								_: 1
							}, 8, ["modelValue"]),
							createVNode(_component_el_date_picker, {
								modelValue: msgRange.value,
								"onUpdate:modelValue": _cache[8] || (_cache[8] = ($event) => msgRange.value = $event),
								type: "daterange",
								size: "small",
								"range-separator": "~",
								"start-placeholder": "开始",
								"end-placeholder": "结束",
								"value-format": "YYYY-MM-DD",
								class: "wx-date",
								onChange: loadMsg
							}, null, 8, ["modelValue"]),
							createVNode(_component_el_button, {
								size: "small",
								class: "wx-query",
								onClick: loadMsg
							}, {
								default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("查询", -1)])]),
								_: 1
							})
						]),
						withDirectives((openBlock(), createElementBlock("div", {
							class: "wx-stream",
							ref_key: "scrollEl",
							ref: scrollEl
						}, [(openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (m, i) => {
							return openBlock(), createElementBlock("div", {
								key: i,
								class: normalizeClass(["wx-row", m.mine === 1 ? "mine" : "other"])
							}, [
								createBaseVNode("div", _hoisted_20$1, toDisplayString(m.mine === 1 ? "我" : curRoom.value ? shortName(m.talker).slice(0, 1) : shortName(cur.value).slice(0, 1)), 1),
								createBaseVNode("div", _hoisted_21$1, [[
									1,
									21,
									22
								].includes(m.msgType) ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(toDisplayString(m.content || ""), 1)], 64)) : [2, 8].includes(m.msgType) ? (openBlock(), createBlock(_component_el_image, {
									key: 1,
									src: m.fileTh || m.fileUrl,
									"preview-src-list": [m.fileUrl || m.fileTh],
									fit: "cover",
									class: "wx-img",
									"hide-on-click-modal": "",
									"preview-teleported": ""
								}, null, 8, ["src", "preview-src-list"])) : m.msgType === 3 ? (openBlock(), createElementBlock("span", _hoisted_22$1, "🎤 语音 " + toDisplayString(m.content || "") + "″", 1)) : m.msgType === 9 ? (openBlock(), createElementBlock("a", {
									key: 3,
									href: m.fileUrl,
									target: "_blank",
									class: "wx-file"
								}, "📎 " + toDisplayString(m.content || "文件"), 9, _hoisted_23$1)) : m.msgType === 4 ? (openBlock(), createElementBlock("a", {
									key: 4,
									href: m.fileUrl,
									target: "_blank",
									class: "wx-file"
								}, "🎬 视频", 8, _hoisted_24$1)) : m.msgType === 10 ? (openBlock(), createElementBlock("a", {
									key: 5,
									href: m.fileUrl,
									target: "_blank",
									class: "wx-file"
								}, "🔗 " + toDisplayString(m.content || "链接"), 9, _hoisted_25$1)) : m.msgType === 13 ? (openBlock(), createElementBlock("span", _hoisted_26$1, "👤 名片 " + toDisplayString(m.content || ""), 1)) : m.msgType === 14 ? (openBlock(), createElementBlock("span", _hoisted_27$1, "📍 " + toDisplayString(m.content || "位置"), 1)) : (openBlock(), createElementBlock("span", _hoisted_28$1, "[" + toDisplayString(typeName(m.msgType)) + "]", 1))]),
								createBaseVNode("div", _hoisted_29$1, toDisplayString(fmtTime(m.msgTime)), 1)
							], 2);
						}), 128)), !messages.value.length && !msgLoading.value ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							description: "该条件下无消息",
							"image-size": 60
						})) : createCommentVNode("", true)])), [[_directive_loading, msgLoading.value]])
					], 64))])) : nav.value === "moments" ? (openBlock(), createElementBlock("div", _hoisted_30$1, [createBaseVNode("div", _hoisted_31$1, [
						_cache[21] || (_cache[21] = createBaseVNode("span", { class: "wx-panel-t" }, "🌤️ 朋友圈", -1)),
						createVNode(_component_el_date_picker, {
							modelValue: momRange.value,
							"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => momRange.value = $event),
							type: "daterange",
							size: "small",
							"range-separator": "~",
							"start-placeholder": "开始",
							"end-placeholder": "结束",
							"value-format": "YYYY-MM-DD",
							class: "wx-date",
							onChange: loadMoments
						}, null, 8, ["modelValue"]),
						createVNode(_component_el_button, {
							size: "small",
							class: "wx-query",
							onClick: loadMoments
						}, {
							default: withCtx(() => [..._cache[20] || (_cache[20] = [createTextVNode("查询", -1)])]),
							_: 1
						})
					]), withDirectives((openBlock(), createElementBlock("div", _hoisted_32$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(moments.value, (m, i) => {
						return openBlock(), createElementBlock("div", {
							key: i,
							class: "wx-mom"
						}, [staffHead.value ? (openBlock(), createBlock(_component_el_avatar, {
							key: 0,
							src: staffHead.value,
							size: 32,
							shape: "square",
							class: "wx-av-img"
						}, null, 8, ["src"])) : (openBlock(), createElementBlock("div", _hoisted_33$1, toDisplayString((staffName.value || "我").slice(0, 1)), 1)), createBaseVNode("div", _hoisted_34$1, [
							createBaseVNode("div", _hoisted_35$1, toDisplayString(staffName.value || wechatId.value), 1),
							momText(m) ? (openBlock(), createElementBlock("div", _hoisted_36$1, toDisplayString(momText(m)), 1)) : createCommentVNode("", true),
							momImgs(m).length ? (openBlock(), createElementBlock("div", _hoisted_37$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(momImgs(m), (img, j) => {
								return openBlock(), createBlock(_component_el_image, {
									key: j,
									src: img,
									"preview-src-list": momImgs(m),
									"initial-index": j,
									fit: "cover",
									class: "wx-mom-img",
									"hide-on-click-modal": "",
									"preview-teleported": ""
								}, null, 8, [
									"src",
									"preview-src-list",
									"initial-index"
								]);
							}), 128))])) : createCommentVNode("", true),
							createBaseVNode("div", _hoisted_38$1, toDisplayString(momTime(m)), 1)
						])]);
					}), 128)), !moments.value.length && !momLoading.value ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: momError.value || "该时段没发朋友圈",
						"image-size": 60
					}, null, 8, ["description"])) : createCommentVNode("", true)])), [[_directive_loading, momLoading.value]])])) : nav.value === "contacts" ? (openBlock(), createElementBlock("div", _hoisted_39$1, [createBaseVNode("div", _hoisted_40$1, [
						createBaseVNode("span", _hoisted_41$1, [_cache[22] || (_cache[22] = createTextVNode("📇 通讯录", -1)), ctTotal.value ? (openBlock(), createElementBlock("em", _hoisted_42$1, toDisplayString(ctTotal.value) + " 人", 1)) : createCommentVNode("", true)]),
						createBaseVNode("div", _hoisted_43$1, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						}), withDirectives(createBaseVNode("input", {
							"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => ctKeyword.value = $event),
							placeholder: "搜昵称 / 备注 / 微信号",
							onKeyup: withKeys(reloadContacts, ["enter"])
						}, null, 544), [[vModelText, ctKeyword.value]])]),
						createVNode(_component_el_button, {
							size: "small",
							class: "wx-query",
							onClick: reloadContacts
						}, {
							default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("查询", -1)])]),
							_: 1
						})
					]), withDirectives((openBlock(), createElementBlock("div", _hoisted_44$1, [
						(openBlock(true), createElementBlock(Fragment, null, renderList(contacts.value, (f) => {
							return openBlock(), createElementBlock("div", {
								key: f.id,
								class: "wx-ct"
							}, [
								f.headUrl ? (openBlock(), createBlock(_component_el_avatar, {
									key: 0,
									src: f.headUrl,
									size: 36,
									shape: "square",
									class: "wx-av-img"
								}, null, 8, ["src"])) : (openBlock(), createElementBlock("div", _hoisted_45$1, toDisplayString((f.friendRemark || f.friendNickname || "友").slice(0, 1)), 1)),
								createBaseVNode("div", _hoisted_46$1, [createBaseVNode("div", _hoisted_47$1, [createTextVNode(toDisplayString(f.friendRemark || f.friendNickname || "未命名"), 1), f.friendRemark && f.friendNickname ? (openBlock(), createElementBlock("span", _hoisted_48$1, "(" + toDisplayString(f.friendNickname) + ")", 1)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_49$1, [createTextVNode(toDisplayString(f.friendAlias || "—"), 1), f.friendWxPhone ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · " + toDisplayString(f.friendWxPhone), 1)], 64)) : createCommentVNode("", true)])]),
								createBaseVNode("div", _hoisted_50, [(openBlock(true), createElementBlock(Fragment, null, renderList(ctLabels(f), (tg) => {
									return openBlock(), createBlock(_component_el_tag, {
										key: tg,
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(tg), 1)]),
										_: 2
									}, 1024);
								}), 128))])
							]);
						}), 128)),
						contacts.value.length && contacts.value.length < ctTotal.value ? (openBlock(), createElementBlock("div", _hoisted_51, [createVNode(_component_el_button, {
							size: "small",
							text: "",
							loading: ctLoading.value,
							onClick: _cache[11] || (_cache[11] = ($event) => loadContacts(false))
						}, {
							default: withCtx(() => [createTextVNode("加载更多(" + toDisplayString(contacts.value.length) + "/" + toDisplayString(ctTotal.value) + ")", 1)]),
							_: 1
						}, 8, ["loading"])])) : createCommentVNode("", true),
						!contacts.value.length && !ctLoading.value ? (openBlock(), createBlock(_component_el_empty, {
							key: 1,
							description: "暂无该员工的好友数据(可能未同步)",
							"image-size": 60
						})) : createCommentVNode("", true)
					])), [[_directive_loading, ctLoading.value && !contacts.value.length]])])) : (openBlock(), createElementBlock("div", _hoisted_52, [_cache[31] || (_cache[31] = createBaseVNode("div", { class: "wx-panel-hd" }, [createBaseVNode("span", { class: "wx-panel-t" }, "📊 统计")], -1)), withDirectives((openBlock(), createElementBlock("div", _hoisted_53, [createBaseVNode("div", _hoisted_54, [
						createBaseVNode("div", _hoisted_55, [createBaseVNode("b", null, toDisplayString(statSingle.value), 1), _cache[24] || (_cache[24] = createBaseVNode("span", null, "单聊会话", -1))]),
						createBaseVNode("div", _hoisted_56, [createBaseVNode("b", null, toDisplayString(statRoom.value), 1), _cache[25] || (_cache[25] = createBaseVNode("span", null, "群聊", -1))]),
						createBaseVNode("div", _hoisted_57, [createBaseVNode("b", null, toDisplayString(statMsg.value), 1), _cache[26] || (_cache[26] = createBaseVNode("span", null, "消息总数", -1))]),
						createBaseVNode("div", _hoisted_58, [createBaseVNode("b", null, toDisplayString(ctTotal.value || "—"), 1), _cache[27] || (_cache[27] = createBaseVNode("span", null, "微信好友", -1))]),
						createBaseVNode("div", _hoisted_59, [createBaseVNode("b", null, toDisplayString(momLoaded.value ? moments.value.length : "—"), 1), _cache[28] || (_cache[28] = createBaseVNode("span", null, "近30天朋友圈", -1))]),
						createBaseVNode("div", _hoisted_60, [createBaseVNode("b", null, toDisplayString(statLastDay.value || "—"), 1), _cache[29] || (_cache[29] = createBaseVNode("span", null, "最近聊天日", -1))])
					]), _cache[30] || (_cache[30] = createBaseVNode("p", { class: "wx-st-note" }, "口径:会话/消息来自已同步的聊天记录;好友数来自好友库;朋友圈为最近30天实时拉取。", -1))])), [[_directive_loading, momLoading.value || ctLoading.value]])]))
				])]),
				_: 1
			}, 8, ["modelValue", "title"]);
		};
	}
}), [["__scopeId", "data-v-dccae544"]]);
//#endregion
//#region src/views/customer/wechat-staff-list.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ws" };
var _hoisted_2 = { class: "ws-head" };
var _hoisted_3 = {
	key: 0,
	class: "ws-layout"
};
var _hoisted_4 = { class: "ws-dept" };
var _hoisted_5 = { class: "ws-tnode" };
var _hoisted_6 = { class: "ws-tcnt" };
var _hoisted_7 = { class: "ws-main" };
var _hoisted_8 = { class: "ws-filter" };
var _hoisted_9 = {
	key: 0,
	class: "ws-range-tip"
};
var _hoisted_10 = { class: "staff" };
var _hoisted_11 = ["onClick"];
var _hoisted_12 = { class: "staff-info" };
var _hoisted_13 = { class: "s-nick" };
var _hoisted_14 = {
	key: 1,
	style: {
		"margin-left": "6px",
		"font-size": "11px",
		"color": "var(--el-text-color-placeholder)"
	}
};
var _hoisted_15 = { class: "s-sub" };
var _hoisted_16 = { class: "s-sub" };
var _hoisted_17 = {
	key: 0,
	style: {
		"display": "inline-flex",
		"align-items": "center",
		"gap": "4px",
		"font-weight": "600",
		"color": "var(--el-text-color-primary)"
	}
};
var _hoisted_18 = {
	key: 1,
	style: { "color": "var(--el-text-color-placeholder)" },
	title: "该工作手机未在组织架构中匹配到员工"
};
var _hoisted_19 = { class: "mcell" };
var _hoisted_20 = { class: "mrow" };
var _hoisted_21 = { class: "mrow" };
var _hoisted_22 = { class: "mcell" };
var _hoisted_23 = { class: "mrow" };
var _hoisted_24 = { class: "mrow" };
var _hoisted_25 = { class: "mcell" };
var _hoisted_26 = { class: "mrow" };
var _hoisted_27 = { class: "mv blue" };
var _hoisted_28 = { class: "mrow" };
var _hoisted_29 = { class: "mv" };
var _hoisted_30 = { class: "mrow" };
var _hoisted_31 = { class: "mv blue" };
var _hoisted_32 = { class: "mrow" };
var _hoisted_33 = { class: "mv blue" };
var _hoisted_34 = {
	key: 1,
	class: "ws-foot-note"
};
var _hoisted_35 = { class: "ws-filter" };
var _hoisted_36 = {
	key: 0,
	class: "ws-range-tip"
};
var _hoisted_37 = { class: "s-nick" };
var _hoisted_38 = { class: "s-sub" };
var _hoisted_39 = { class: "ws-filter" };
var _hoisted_40 = { class: "ws-range-tip" };
var _hoisted_41 = { class: "s-nick" };
var _hoisted_42 = { class: "ws-filter" };
var _hoisted_43 = {
	key: 0,
	class: "ws-range-tip"
};
var _hoisted_44 = { class: "mo-wrap" };
var _hoisted_45 = {
	key: 0,
	class: "mo-text"
};
var _hoisted_46 = {
	key: 1,
	class: "mo-text muted"
};
var _hoisted_47 = {
	key: 2,
	class: "mo-text muted"
};
var _hoisted_48 = {
	key: 3,
	class: "mo-imgs"
};
var _hoisted_49 = { class: "mo-meta" };
//#endregion
//#region src/views/customer/wechat-staff-list.vue
var wechat_staff_list_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "wechat-staff-list",
	setup(__props) {
		const chatDrawer = ref(null);
		const openChat = (row) => {
			var _chatDrawer$value;
			if (!row.wechatId) {
				ElMessage.info("该员工微信暂无 id,无法查聊天");
				return;
			}
			(_chatDrawer$value = chatDrawer.value) === null || _chatDrawer$value === void 0 || _chatDrawer$value.open(row.wechatId, row.nickname || row.alias, row.headUrl);
		};
		const tab = ref("list");
		const tabLabel = computed(() => ({
			moments: "朋友圈统计",
			newfriend: "新增好友",
			newtime: "每日新增好友时间段"
		})[tab.value] || "");
		const loading = ref(false);
		const rows = ref([]);
		const range = ref([]);
		const info = ref({});
		const errMsg = ref("");
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				errMsg.value = "";
				try {
					var _range$value, _res$data;
					const params = {};
					if (((_range$value = range.value) === null || _range$value === void 0 ? void 0 : _range$value.length) === 2) {
						params.beginYmd = range.value[0];
						params.endYmd = range.value[1];
					}
					const res = yield yunkeApi.wechatStaffList(params);
					const d = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					if (d && Array.isArray(d.list)) {
						rows.value = d.list;
						info.value = d;
					} else {
						rows.value = [];
						info.value = {};
					}
				} catch (e) {
					rows.value = [];
					errMsg.value = ((e === null || e === void 0 ? void 0 : e.message) || "拉取失败") + "(若提示未配置,请先到「云客对接配置」保存凭证并测试连接)";
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const avatarBg = (name) => {
			const colors = [
				"#409EFF",
				"#67C23A",
				"#E6A23C",
				"#F56C6C",
				"#909399",
				"#7B68EE"
			];
			let h = 0;
			const s = name || "微";
			for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % colors.length;
			return colors[h];
		};
		const nfRows = ref([]);
		const nfLoading = ref(false);
		const nfRange = ref([]);
		const nfTotal = ref(0);
		const loadNewFriends = function() {
			var _ref2 = _asyncToGenerator(function* () {
				nfLoading.value = true;
				try {
					var _nfRange$value, _res$data2;
					const params = {};
					if (((_nfRange$value = nfRange.value) === null || _nfRange$value === void 0 ? void 0 : _nfRange$value.length) === 2) {
						params.beginYmd = nfRange.value[0];
						params.endYmd = nfRange.value[1];
					}
					const res = yield yunkeApi.newFriends(params);
					const d = (_res$data2 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data2 !== void 0 ? _res$data2 : res;
					nfRows.value = (d === null || d === void 0 ? void 0 : d.list) || [];
					nfTotal.value = (d === null || d === void 0 ? void 0 : d.total) || 0;
				} catch (_unused) {
					nfRows.value = [];
					nfTotal.value = 0;
				} finally {
					nfLoading.value = false;
				}
			});
			return function loadNewFriends() {
				return _ref2.apply(this, arguments);
			};
		}();
		const ntBuckets = ref([]);
		const ntTotal = ref(0);
		const ntRange = ref([]);
		const ntLoading = ref(false);
		const loadNewTime = function() {
			var _ref3 = _asyncToGenerator(function* () {
				ntLoading.value = true;
				try {
					var _ntRange$value, _res$data3;
					const params = { pageSize: 500 };
					if (((_ntRange$value = ntRange.value) === null || _ntRange$value === void 0 ? void 0 : _ntRange$value.length) === 2) {
						params.beginYmd = ntRange.value[0];
						params.endYmd = ntRange.value[1];
					}
					const res = yield yunkeApi.newFriends(params);
					const d = (_res$data3 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data3 !== void 0 ? _res$data3 : res;
					const list = (d === null || d === void 0 ? void 0 : d.list) || [];
					const b = new Array(24).fill(0);
					list.forEach((f) => {
						const t = f.addFriendTime;
						if (t) {
							const h = parseInt(String(t).slice(11, 13));
							if (!isNaN(h) && h >= 0 && h < 24) b[h]++;
						}
					});
					ntBuckets.value = b;
					ntTotal.value = list.length;
				} catch (_unused2) {
					ntBuckets.value = [];
					ntTotal.value = 0;
				} finally {
					ntLoading.value = false;
				}
			});
			return function loadNewTime() {
				return _ref3.apply(this, arguments);
			};
		}();
		const ntTableData = computed(() => {
			const max = Math.max(1, ...ntBuckets.value);
			return ntBuckets.value.map((c, h) => ({
				hour: h,
				count: c,
				pct: Math.round(c / max * 100)
			})).filter((r) => r.count > 0);
		});
		watch(tab, (t) => {
			if (t === "newfriend" && !nfRows.value.length) loadNewFriends();
			if (t === "newtime" && !ntTotal.value) loadNewTime();
		});
		const mWechatId = ref("");
		const mList = ref([]);
		const mLoading = ref(false);
		const loadMoments = function() {
			var _ref4 = _asyncToGenerator(function* () {
				if (!mWechatId.value) {
					mList.value = [];
					return;
				}
				mLoading.value = true;
				try {
					var _res$data4;
					const res = yield yunkeApi.moments({ wechatId: mWechatId.value });
					const d = (_res$data4 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data4 !== void 0 ? _res$data4 : res;
					mList.value = (d === null || d === void 0 ? void 0 : d.list) || [];
				} catch (_unused3) {
					mList.value = [];
				} finally {
					mLoading.value = false;
				}
			});
			return function loadMoments() {
				return _ref4.apply(this, arguments);
			};
		}();
		const fmtTs = (ts) => {
			if (!ts) return "";
			const d = /* @__PURE__ */ new Date(Number(ts) * 1e3);
			const p = (n) => String(n).padStart(2, "0");
			return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
		};
		const moTypeName = (t) => ({
			1: "图文",
			2: "文本",
			3: "链接",
			15: "视频",
			28: "视频号"
		})[t] || "朋友圈";
		const deptTreeData = ref([]);
		const currentDeptPhones = ref([]);
		const currentDeptName = ref("");
		const loadDeptTree = function() {
			var _ref5 = _asyncToGenerator(function* () {
				try {
					var _res$data5;
					const res = yield yunkeApi.deptTree();
					deptTreeData.value = ((_res$data5 = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data5 !== void 0 ? _res$data5 : res) || [];
				} catch (_unused4) {
					deptTreeData.value = [];
				}
			});
			return function loadDeptTree() {
				return _ref5.apply(this, arguments);
			};
		}();
		const onDeptClick = (data) => {
			currentDeptName.value = data.name;
			currentDeptPhones.value = data.phones || [];
		};
		const clearDept = () => {
			currentDeptName.value = "";
			currentDeptPhones.value = [];
		};
		const deptFilteredRows = computed(() => {
			if (!currentDeptPhones.value.length) return rows.value;
			const set = new Set(currentDeptPhones.value);
			return rows.value.filter((r) => set.has(r.userPhone) || set.has(r.phone));
		});
		onMounted(() => {
			load();
			loadDeptTree();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_tree = ElTree;
			const _component_el_empty = ElEmpty;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_tag = ElTag;
			const _component_el_avatar = ElAvatar;
			const _component_el_link = ElLink;
			const _component_el_table_column = ElTableColumn;
			const _component_UserFilled = resolveComponent("UserFilled");
			const _component_el_table = ElTable;
			const _component_el_progress = ElProgress;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_image = ElImage;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("div", _hoisted_2, [_cache[6] || (_cache[6] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "ws-title" }, "员工微信列表"), createBaseVNode("p", { class: "ws-sub" }, "每个销售的微信运营数据,从云客实时拉取:沟通人数、有效沟通、跟进客户等。")], -1)), createVNode(_component_el_button, {
					onClick: load,
					plain: "",
					loading: loading.value
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[5] || (_cache[5] = createTextVNode(" 刷新", -1))]),
					_: 1
				}, 8, ["loading"])]),
				createVNode(_component_el_alert, {
					type: "info",
					closable: false,
					"show-icon": "",
					class: "ws-alert"
				}, {
					title: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("关于数据来源", -1)])]),
					default: withCtx(() => [
						_cache[8] || (_cache[8] = createTextVNode(" 下方均为 ", -1)),
						_cache[9] || (_cache[9] = createBaseVNode("b", null, "云客真实数据", -1)),
						_cache[10] || (_cache[10] = createTextVNode(":好友数 / 消息数(发送·接收) / 沟通人数 / 群数 已接入。回复率 / 未回复 云客开放接口不提供,已去除,不造假数据。消息数由后台每 3 小时同步近 30 天,刚配置好需稍等。 ", -1))
					]),
					_: 1
				}),
				createVNode(_component_el_tabs, {
					modelValue: tab.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => tab.value = $event),
					class: "ws-tabs"
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "员工微信列表",
							name: "list"
						}),
						createVNode(_component_el_tab_pane, {
							label: "朋友圈统计",
							name: "moments"
						}),
						createVNode(_component_el_tab_pane, {
							label: "新增好友",
							name: "newfriend"
						}),
						createVNode(_component_el_tab_pane, {
							label: "每日新增好友时间段",
							name: "newtime"
						})
					]),
					_: 1
				}, 8, ["modelValue"]),
				tab.value === "list" ? (openBlock(), createElementBlock("div", _hoisted_3, [createBaseVNode("div", _hoisted_4, [
					_cache[11] || (_cache[11] = createBaseVNode("div", { class: "ws-dept-hd" }, "组织架构", -1)),
					createVNode(_component_el_tree, {
						data: deptTreeData.value,
						props: {
							label: "name",
							children: "children"
						},
						"node-key": "id",
						"highlight-current": "",
						"default-expand-all": "",
						class: "ws-tree",
						onNodeClick: onDeptClick
					}, {
						default: withCtx(({ data }) => [createBaseVNode("span", _hoisted_5, [createTextVNode(toDisplayString(data.name), 1), createBaseVNode("span", _hoisted_6, toDisplayString(data.count), 1)])]),
						_: 1
					}, 8, ["data"]),
					!deptTreeData.value.length ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: "无部门数据",
						"image-size": 50
					})) : createCommentVNode("", true)
				]), createBaseVNode("div", _hoisted_7, [
					createBaseVNode("div", _hoisted_8, [
						createVNode(_component_el_date_picker, {
							modelValue: range.value,
							"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => range.value = $event),
							type: "daterange",
							"range-separator": "至",
							"start-placeholder": "开始日期",
							"end-placeholder": "结束日期",
							"value-format": "YYYY-MM-DD",
							class: "f-date",
							onChange: load
						}, null, 8, ["modelValue"]),
						info.value.beginYmd ? (openBlock(), createElementBlock("span", _hoisted_9, "统计区间 " + toDisplayString(info.value.beginYmd) + " ~ " + toDisplayString(info.value.endYmd), 1)) : createCommentVNode("", true),
						currentDeptName.value ? (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							closable: "",
							size: "small",
							type: "success",
							onClose: clearDept,
							style: { "margin-left": "8px" }
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(currentDeptName.value) + " · " + toDisplayString(deptFilteredRows.value.length) + "人", 1)]),
							_: 1
						})) : createCommentVNode("", true)
					]),
					errMsg.value ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						title: errMsg.value,
						type: "warning",
						closable: false,
						"show-icon": "",
						style: { "margin-bottom": "12px" }
					}, null, 8, ["title"])) : createCommentVNode("", true),
					withDirectives((openBlock(), createBlock(_component_el_table, {
						data: deptFilteredRows.value,
						border: "",
						class: "ws-table",
						"header-cell-style": {
							background: "#F5F7FA",
							color: "#606266"
						}
					}, {
						empty: withCtx(() => [createVNode(_component_el_empty, {
							description: loading.value ? "正在从云客拉取…" : "暂无数据(确认云客对接配置已保存并测试通过)",
							"image-size": 80
						}, null, 8, ["description"])]),
						default: withCtx(() => [
							createVNode(_component_el_table_column, {
								label: "员工信息",
								"min-width": "230"
							}, {
								default: withCtx(({ row }) => [createBaseVNode("div", _hoisted_10, [row.headUrl ? (openBlock(), createBlock(_component_el_avatar, {
									key: 0,
									src: row.headUrl,
									size: 38,
									shape: "square",
									style: {
										"cursor": "pointer",
										"flex": "0 0 auto"
									},
									onClick: ($event) => openChat(row),
									title: "点头像看聊天"
								}, null, 8, ["src", "onClick"])) : (openBlock(), createElementBlock("div", {
									key: 1,
									class: "avatar",
									style: normalizeStyle({
										background: avatarBg(row.nickname || row.alias),
										cursor: "pointer"
									}),
									onClick: ($event) => openChat(row),
									title: "点头像看聊天"
								}, toDisplayString((row.nickname || row.alias || "微").slice(0, 1)), 13, _hoisted_11)), createBaseVNode("div", _hoisted_12, [
									createBaseVNode("div", _hoisted_13, [createTextVNode(toDisplayString(row.nickname || "—") + " ", 1), row.chatCount ? (openBlock(), createBlock(_component_el_link, {
										key: 0,
										type: "primary",
										underline: false,
										style: {
											"margin-left": "6px",
											"font-size": "11px",
											"vertical-align": "middle"
										},
										onClick: ($event) => openChat(row)
									}, {
										default: withCtx(() => [createTextVNode("看聊天(" + toDisplayString(row.chatCount) + ")", 1)]),
										_: 2
									}, 1032, ["onClick"])) : (openBlock(), createElementBlock("span", _hoisted_14, "无聊天记录"))]),
									createBaseVNode("div", _hoisted_15, "微信号 " + toDisplayString(row.alias || "—"), 1),
									createBaseVNode("div", _hoisted_16, "手机 " + toDisplayString(row.phone || "—"), 1)
								])])]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "实际使用人",
								width: "104"
							}, {
								default: withCtx(({ row }) => [row.staffName ? (openBlock(), createElementBlock("span", _hoisted_17, [createVNode(_component_el_icon, { style: { "color": "var(--el-color-primary)" } }, {
									default: withCtx(() => [createVNode(_component_UserFilled)]),
									_: 1
								}), createTextVNode(toDisplayString(row.staffName), 1)])) : (openBlock(), createElementBlock("span", _hoisted_18, "—"))]),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "好友/群",
								width: "108"
							}, {
								default: withCtx(({ row }) => {
									var _row$friendCount, _row$groupCount;
									return [createBaseVNode("div", _hoisted_19, [createBaseVNode("div", _hoisted_20, [_cache[12] || (_cache[12] = createBaseVNode("span", { class: "ml" }, "好友数", -1)), createBaseVNode("b", { class: normalizeClass(["mv", { na: row.friendCount == null }]) }, toDisplayString((_row$friendCount = row.friendCount) !== null && _row$friendCount !== void 0 ? _row$friendCount : "—"), 3)]), createBaseVNode("div", _hoisted_21, [_cache[13] || (_cache[13] = createBaseVNode("span", { class: "ml" }, "微信群数", -1)), createBaseVNode("b", { class: normalizeClass(["mv", { na: row.groupCount == null }]) }, toDisplayString((_row$groupCount = row.groupCount) !== null && _row$groupCount !== void 0 ? _row$groupCount : "—"), 3)])])];
								}),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "消息数",
								width: "110"
							}, {
								default: withCtx(({ row }) => {
									var _row$sendMsg, _row$recvMsg;
									return [createBaseVNode("div", _hoisted_22, [createBaseVNode("div", _hoisted_23, [_cache[14] || (_cache[14] = createBaseVNode("span", { class: "ml" }, "发送", -1)), createBaseVNode("b", { class: normalizeClass(["mv", { na: row.sendMsg == null }]) }, toDisplayString((_row$sendMsg = row.sendMsg) !== null && _row$sendMsg !== void 0 ? _row$sendMsg : "—"), 3)]), createBaseVNode("div", _hoisted_24, [_cache[15] || (_cache[15] = createBaseVNode("span", { class: "ml" }, "接收", -1)), createBaseVNode("b", { class: normalizeClass(["mv", { na: row.recvMsg == null }]) }, toDisplayString((_row$recvMsg = row.recvMsg) !== null && _row$recvMsg !== void 0 ? _row$recvMsg : "—"), 3)])])];
								}),
								_: 1
							}),
							createVNode(_component_el_table_column, {
								label: "沟通数(真实)",
								width: "150"
							}, {
								default: withCtx(({ row }) => {
									var _row$talkCount, _row$sendTalker, _row$receiveTalker, _row$contactCount, _row$followCount;
									return [createBaseVNode("div", _hoisted_25, [
										createBaseVNode("div", _hoisted_26, [_cache[16] || (_cache[16] = createBaseVNode("span", { class: "ml" }, "沟通人数", -1)), createBaseVNode("b", _hoisted_27, toDisplayString((_row$talkCount = row.talkCount) !== null && _row$talkCount !== void 0 ? _row$talkCount : 0), 1)]),
										createBaseVNode("div", _hoisted_28, [_cache[17] || (_cache[17] = createBaseVNode("span", { class: "ml" }, "主动/被动", -1)), createBaseVNode("b", _hoisted_29, toDisplayString((_row$sendTalker = row.sendTalker) !== null && _row$sendTalker !== void 0 ? _row$sendTalker : 0) + "/" + toDisplayString((_row$receiveTalker = row.receiveTalker) !== null && _row$receiveTalker !== void 0 ? _row$receiveTalker : 0), 1)]),
										createBaseVNode("div", _hoisted_30, [_cache[18] || (_cache[18] = createBaseVNode("span", { class: "ml" }, "有效沟通", -1)), createBaseVNode("b", _hoisted_31, toDisplayString((_row$contactCount = row.contactCount) !== null && _row$contactCount !== void 0 ? _row$contactCount : 0), 1)]),
										createBaseVNode("div", _hoisted_32, [_cache[19] || (_cache[19] = createBaseVNode("span", { class: "ml" }, "跟进客户", -1)), createBaseVNode("b", _hoisted_33, toDisplayString((_row$followCount = row.followCount) !== null && _row$followCount !== void 0 ? _row$followCount : 0), 1)])
									])];
								}),
								_: 1
							})
						]),
						_: 1
					}, 8, ["data"])), [[_directive_loading, loading.value]]),
					rows.value.length ? (openBlock(), createElementBlock("p", _hoisted_34, "共 " + toDisplayString(info.value.total || rows.value.length) + " 个员工微信 · 数据来自云客", 1)) : createCommentVNode("", true)
				])])) : tab.value === "newfriend" ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createBaseVNode("div", _hoisted_35, [
					createVNode(_component_el_date_picker, {
						modelValue: nfRange.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => nfRange.value = $event),
						type: "daterange",
						"range-separator": "至",
						"start-placeholder": "开始日期",
						"end-placeholder": "结束日期",
						"value-format": "YYYY-MM-DD",
						class: "f-date",
						onChange: loadNewFriends
					}, null, 8, ["modelValue"]),
					createVNode(_component_el_button, { onClick: loadNewFriends }, {
						default: withCtx(() => [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(search_default))]),
							_: 1
						}), _cache[20] || (_cache[20] = createTextVNode(" 查询", -1))]),
						_: 1
					}),
					nfTotal.value ? (openBlock(), createElementBlock("span", _hoisted_36, "共 " + toDisplayString(nfTotal.value) + " 条新增好友", 1)) : createCommentVNode("", true)
				]), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: nfRows.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: nfLoading.value ? "加载中…" : "该时段暂无新增好友",
						"image-size": 70
					}, null, 8, ["description"])]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "员工",
							"min-width": "140"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_37, toDisplayString(row.userName || "—"), 1), createBaseVNode("div", _hoisted_38, toDisplayString(row.userPhone || ""), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "新增好友",
							"min-width": "150",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.nickName || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "好友微信号",
							width: "150",
							"show-overflow-tooltip": ""
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.alias || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "好友手机",
							width: "140"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.wxPhone || "—"), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "添加时间",
							width: "170"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.addFriendTime || "—"), 1)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, nfLoading.value]])], 64)) : tab.value === "newtime" ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [createBaseVNode("div", _hoisted_39, [createVNode(_component_el_date_picker, {
					modelValue: ntRange.value,
					"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => ntRange.value = $event),
					type: "daterange",
					"range-separator": "至",
					"start-placeholder": "开始日期",
					"end-placeholder": "结束日期",
					"value-format": "YYYY-MM-DD",
					class: "f-date",
					onChange: loadNewTime
				}, null, 8, ["modelValue"]), createBaseVNode("span", _hoisted_40, "共 " + toDisplayString(ntTotal.value) + " 条新增好友,按加好友的时段分布", 1)]), withDirectives((openBlock(), createBlock(_component_el_table, {
					data: ntTableData.value,
					border: "",
					stripe: ""
				}, {
					empty: withCtx(() => [createVNode(_component_el_empty, {
						description: ntLoading.value ? "加载中…" : "该时段暂无新增好友",
						"image-size": 70
					}, null, 8, ["description"])]),
					default: withCtx(() => [
						createVNode(_component_el_table_column, {
							label: "时段",
							width: "140"
						}, {
							default: withCtx(({ row }) => [createTextVNode(toDisplayString(String(row.hour).padStart(2, "0")) + ":00 - " + toDisplayString(String(row.hour).padStart(2, "0")) + ":59", 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, {
							label: "新增好友数",
							width: "120",
							align: "center"
						}, {
							default: withCtx(({ row }) => [createBaseVNode("b", _hoisted_41, toDisplayString(row.count), 1)]),
							_: 1
						}),
						createVNode(_component_el_table_column, { label: "占比" }, {
							default: withCtx(({ row }) => [createVNode(_component_el_progress, {
								percentage: row.pct,
								"stroke-width": 14
							}, null, 8, ["percentage"])]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["data"])), [[_directive_loading, ntLoading.value]])], 64)) : tab.value === "moments" ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [createBaseVNode("div", _hoisted_42, [createVNode(_component_el_select, {
					modelValue: mWechatId.value,
					"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => mWechatId.value = $event),
					placeholder: "选择员工微信看朋友圈",
					filterable: "",
					clearable: "",
					onChange: loadMoments,
					style: { "width": "260px" }
				}, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(rows.value, (r) => {
						return openBlock(), createBlock(_component_el_option, {
							key: r.wechatId,
							label: r.nickname || r.alias || r.wechatId,
							value: r.wechatId
						}, null, 8, ["label", "value"]);
					}), 128))]),
					_: 1
				}, 8, ["modelValue"]), mWechatId.value && mList.value.length ? (openBlock(), createElementBlock("span", _hoisted_43, "共 " + toDisplayString(mList.value.length) + " 条朋友圈", 1)) : createCommentVNode("", true)]), withDirectives((openBlock(), createElementBlock("div", _hoisted_44, [
					(openBlock(true), createElementBlock(Fragment, null, renderList(mList.value, (m, i) => {
						return openBlock(), createElementBlock("div", {
							key: i,
							class: "mo-card"
						}, [
							m.content ? (openBlock(), createElementBlock("div", _hoisted_45, toDisplayString(m.content), 1)) : m.type == 3 ? (openBlock(), createElementBlock("div", _hoisted_46, "[链接] " + toDisplayString(m.title || ""), 1)) : m.type == 15 || m.type == 28 ? (openBlock(), createElementBlock("div", _hoisted_47, "[视频]")) : createCommentVNode("", true),
							m.urls && m.urls.length ? (openBlock(), createElementBlock("div", _hoisted_48, [(openBlock(true), createElementBlock(Fragment, null, renderList(m.urls, (u, j) => {
								return openBlock(), createBlock(_component_el_image, {
									key: j,
									src: u,
									"preview-src-list": m.urls,
									fit: "cover",
									class: "mo-img",
									"preview-teleported": "",
									"hide-on-click-modal": ""
								}, null, 8, ["src", "preview-src-list"]);
							}), 128))])) : createCommentVNode("", true),
							createBaseVNode("div", _hoisted_49, toDisplayString(fmtTs(m.createTime)) + " · 👍 " + toDisplayString(m.praiseNum || 0) + " · 💬 " + toDisplayString(m.commentNum || 0) + " · " + toDisplayString(moTypeName(m.type)), 1)
						]);
					}), 128)),
					mWechatId.value && !mList.value.length && !mLoading.value ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						description: "该员工暂无朋友圈数据",
						"image-size": 70
					})) : createCommentVNode("", true),
					!mWechatId.value ? (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: "↑ 选一个员工,看他发的朋友圈",
						"image-size": 80
					})) : createCommentVNode("", true)
				])), [[_directive_loading, mLoading.value]])], 64)) : (openBlock(), createBlock(_component_el_empty, {
					key: 4,
					description: `「${tabLabel.value}」页待接入(会用云客对应接口做)`,
					"image-size": 90
				}, null, 8, ["description"])),
				createVNode(WechatChatDrawer_default, {
					ref_key: "chatDrawer",
					ref: chatDrawer
				}, null, 512)
			]);
		};
	}
}), [["__scopeId", "data-v-7794c875"]]);
//#endregion
export { wechat_staff_list_default as default };

import { $ as createCommentVNode, Ct as onUnmounted, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, kt as resolveComponent, st as defineComponent, yt as onBeforeUnmount, zt as watch } from "./vendor-Cuzsyfny.js";
import { A as ElSubMenu, At as chat_dot_round_default, Bn as refresh_default, En as mute_notification_default, Er as withKeys, F as ElEmpty, Ft as circle_check_filled_default, I as ElDropdown, L as ElDropdownItem, O as ElMenu, R as ElDropdownMenu, Sr as Transition, Tt as arrow_up_default, Un as search_default, V as ElDialog, _t as ElFormItem, a as ElMessageBox, at as ClickOutside, dt as ElBadge, fr as user_default, ft as ElAvatar, gr as view_default, gt as ElForm, hn as lock_default, it as ElTag, jt as chat_line_round_default, k as ElMenuItem, lt as ElBreadcrumb, mt as ElInput, nn as expand_default, o as ElMessage, on as fold_default, ot as ElButton, pt as ElScrollbar, rr as switch_button_default, s as vLoading, u as ElTreeSelect, ut as ElBreadcrumbItem, vt as ElAlert, wt as arrow_right_default, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { x as isAllowedImpersonationTargetUserId } from "./request-CZ5tKmxn.js";
import { _ as MODULE_GROUP, a as impersonationApi, l as useUserStore, n as useImpersonationStore, o as usePermissionStore, r as useImStore, t as markLogoutTransition, v as NAV_GROUPS, x as useAppStore } from "./index-C4y3JnUs.js";
import "./logo-Bgp5DlLw.js";
import { t as approvalCenterApi } from "./approval-_N-WvNcC.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { a as userApi } from "./system-CuP08T_i.js";
import { t as formatImPresence } from "./im-presence-b9dJFRRS.js";
import { t as deptApi } from "./org-DaVetSL-.js";
//#region src/components/layout/TopNav.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$8 = { class: "tn-tabs" };
var _hoisted_2$7 = ["onClick"];
var _hoisted_3$3 = { class: "tn-tab-label" };
var _hoisted_4$3 = {
	key: 0,
	class: "tn-tab-badge"
};
//#endregion
//#region src/components/layout/TopNav.vue
var TopNav_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "TopNav",
	setup(__props) {
		const route = useRoute();
		const router = useRouter();
		const permissionStore = usePermissionStore();
		const appStore = useAppStore();
		/** 当前用户有权限且可出现在导航的顶层模块；navigationHidden 不改变路由权限。 */
		const topModules = computed(() => permissionStore.routes.filter((r) => {
			var _r$meta, _r$meta2;
			return !((_r$meta = r.meta) === null || _r$meta === void 0 ? void 0 : _r$meta.hidden) && !((_r$meta2 = r.meta) === null || _r$meta2 === void 0 ? void 0 : _r$meta2.navigationHidden);
		}));
		/** 顶栏只显示"有可见模块"的大类 */
		const visibleGroups = computed(() => NAV_GROUPS.filter((g) => topModules.value.some((r) => MODULE_GROUP[r.path] === g.name)));
		/** 当前所在大类 = 当前路由的顶层模块所属大类 */
		const activeGroup = computed(() => {
			const top = route.matched[0];
			return top ? MODULE_GROUP[top.path] : void 0;
		});
		function visibleChildren(r) {
			return (r.children || []).filter((c) => {
				var _c$meta;
				return !((_c$meta = c.meta) === null || _c$meta === void 0 ? void 0 : _c$meta.hidden);
			});
		}
		function normalizePath(p) {
			return p.replace(/\/+/g, "/");
		}
		/** 模块落地页:优先 redirect,否则第一个可见子页 */
		function landingOf(r) {
			if (typeof r.redirect === "string") return r.redirect;
			const first = visibleChildren(r)[0];
			if (!first) return r.path;
			const cp = first.path;
			if (cp.startsWith("/")) return cp;
			return normalizePath(r.path === "/" ? `/${cp}` : `${r.path}/${cp}`);
		}
		/** 合并大类的原默认落地模块；目标路由不可见时仍按当前用户第一个可见模块回退。 */
		const PREFERRED_MODULE_PATH = {
			"任务管理": "/task-workbench",
			"系统管理": "/sys-flow"
		};
		function goGroup(g) {
			if (g.name === activeGroup.value) return;
			const preferredPath = PREFERRED_MODULE_PATH[g.name];
			const mod = (preferredPath ? topModules.value.find((route) => route.path === preferredPath) : void 0) || topModules.value.find((r) => MODULE_GROUP[r.path] === g.name);
			if (mod) router.push(landingOf(mod));
		}
		const approvalTodo = ref(0);
		let approvalTimer;
		function loadApprovalTodo() {
			return _loadApprovalTodo.apply(this, arguments);
		}
		function _loadApprovalTodo() {
			_loadApprovalTodo = _asyncToGenerator(function* () {
				try {
					approvalTodo.value = yield approvalCenterApi.todoCount();
				} catch (_unused) {}
			});
			return _loadApprovalTodo.apply(this, arguments);
		}
		onMounted(() => {
			loadApprovalTodo();
			approvalTimer = window.setInterval(loadApprovalTodo, 6e4);
		});
		onBeforeUnmount(() => {
			if (approvalTimer) window.clearInterval(approvalTimer);
		});
		watch(() => route.path, (p) => {
			if (p.startsWith("/approval")) loadApprovalTodo();
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_scrollbar = ElScrollbar;
			return openBlock(), createElementBlock("div", { class: normalizeClass(["topnav", { collapsed: unref(appStore).sidebarCollapsed }]) }, [_cache[0] || (_cache[0] = createBaseVNode("div", { class: "tn-logo" }, [createBaseVNode("img", {
				class: "tn-logo-icon",
				src: "/logo.svg",
				alt: "浙杭集团"
			}), createBaseVNode("span", { class: "tn-logo-text" }, "浙杭集团")], -1)), createVNode(_component_el_scrollbar, { class: "tn-scroll" }, {
				default: withCtx(() => [createBaseVNode("div", _hoisted_1$8, [(openBlock(true), createElementBlock(Fragment, null, renderList(visibleGroups.value, (g) => {
					return openBlock(), createElementBlock("div", {
						key: g.name,
						class: normalizeClass(["tn-tab", { active: g.name === activeGroup.value }]),
						onClick: ($event) => goGroup(g)
					}, [
						createBaseVNode("span", {
							class: "tn-tile",
							style: normalizeStyle({ background: g.color })
						}, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(g.icon)))]),
							_: 2
						}, 1024)], 4),
						createBaseVNode("span", _hoisted_3$3, toDisplayString(g.name), 1),
						g.name === "审批中心" && approvalTodo.value > 0 ? (openBlock(), createElementBlock("sup", _hoisted_4$3, toDisplayString(approvalTodo.value > 99 ? "99+" : approvalTodo.value), 1)) : createCommentVNode("", true)
					], 10, _hoisted_2$7);
				}), 128))])]),
				_: 1
			})], 2);
		};
	}
}), [["__scopeId", "data-v-abd0cb6d"]]);
//#endregion
//#region src/utils/menu-icon.ts
/**
* 菜单图标自动匹配:子类目没显式 meta.icon 时,按标题关键词自动配一个 Element Plus 图标。
* 以后新增子类目无需手动加图标——有 meta.icon 用它,没有就按标题自动匹配,再兜底 Menu。
* 颜色由 Sidebar 的 tileColor(按路径)自动分配,所以新菜单图标+颜色都是自动的。
*/
var KEYWORD_ICONS = [
	[/首页|工作台|个人中心|主页/, "HomeFilled"],
	[/客户|线索|crm|公海|私域|资源库/i, "User"],
	[/合同/, "Document"],
	[/提单|订单|开单|单据/, "Tickets"],
	[/凭证|记账|总账|账簿|日记账/, "Notebook"],
	[/发票/, "Document"],
	[/税/, "Money"],
	[/薪|工资|提成|奖金/, "Coin"],
	[/财务|资金|核对|支出|报销|备用金|成本/, "Wallet"],
	[/报表|统计|分析|看板|大盘|投产|投流|roi|业绩/i, "TrendCharts"],
	[/数据/, "DataLine"],
	[/刻章|印章|盖章|用印|^章/, "Stamp"],
	[/库存|采购|补充|入库|资源池/, "Box"],
	[/资产|用品|物资|固定资产/, "Goods"],
	[/工商|执照|注册|代办/, "OfficeBuilding"],
	[/交接/, "Switch"],
	[/任务|交付|派单/, "List"],
	[/满意|回访|评价/, "Star"],
	[/同行|渠道/, "Share"],
	[/地址|区域|外区|地图/, "MapLocation"],
	[/供应商|供应|厂商/, "Shop"],
	[/续费|续约/, "RefreshRight"],
	[/绩效|考核|目标|kpi/i, "Aim"],
	[/招聘|面试|入职|花名册/, "UserFilled"],
	[/人力|人事|员工|档案|通讯录/, "Avatar"],
	[/部门|组织|架构/, "OfficeBuilding"],
	[/岗位|职位/, "Postcard"],
	[/考勤|假勤|假期|请假|打卡/, "Calendar"],
	[/到期|提醒|日历|预警/, "AlarmClock"],
	[/知识|文库|文档|文章|资料|手册/, "Collection"],
	[/培训|课程|学习|考试|测评/, "Reading"],
	[/问答|智能|ai|机器人/i, "MagicStick"],
	[/审批|流程|审核/, "Stamp"],
	[/角色|权限|授权/, "Lock"],
	[/菜单/, "Menu"],
	[/日志|记录/, "Document"],
	[/规则|配置|设置|参数/, "SetUp"],
	[/系统|平台|后台/, "Setting"],
	[/监控|实时/, "Monitor"],
	[/外呼|呼叫|电话|通话|坐席|号码/, "Phone"],
	[/消息|通知|公告/, "Bell"],
	[/运营|服务/, "TrendCharts"],
	[/文件|附件|资料库/, "Folder"]
];
/** 返回该菜单项应显示的图标名:优先显式 icon,否则按标题关键词匹配,再兜底 Menu。 */
function resolveMenuIcon(title, explicit) {
	if (explicit) return explicit;
	const t = title || "";
	for (const [re, icon] of KEYWORD_ICONS) if (re.test(t)) return icon;
	return "Menu";
}
//#endregion
//#region src/components/MessageCenter.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$7 = {
	key: 0,
	class: "im-popover"
};
var _hoisted_2$6 = { class: "im-popover-head" };
var _hoisted_3$2 = { class: "im-summary" };
var _hoisted_4$2 = { class: "im-recent-title" };
var _hoisted_5$2 = { class: "im-recent-list" };
var _hoisted_6$1 = ["onClick"];
var _hoisted_7$1 = { class: "im-avatar-wrap" };
var _hoisted_8 = { class: "im-recent-body" };
var _hoisted_9 = { class: "im-recent-line" };
var _hoisted_10 = { class: "im-recent-line preview" };
var _hoisted_11 = { key: 0 };
var _hoisted_12 = { key: 1 };
var _hoisted_13 = { key: 4 };
var _hoisted_14 = { key: 5 };
var _hoisted_15 = {
	key: 0,
	class: "im-empty"
};
//#endregion
//#region src/components/MessageCenter.vue
var MessageCenter_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "MessageCenter",
	props: { placement: { default: "top-right" } },
	setup(__props) {
		const props = __props;
		const router = useRouter();
		const imStore = useImStore();
		const visible = ref(false);
		const connectionText = computed(() => ({
			connected: "实时连接正常",
			connecting: "正在连接",
			reconnecting: "正在恢复连接",
			offline: "离线，内容会保留",
			idle: "准备连接"
		})[imStore.connectionState]);
		onMounted(() => imStore.initialize());
		function toggle() {
			visible.value = !visible.value;
			if (visible.value) refresh();
		}
		function close() {
			visible.value = false;
		}
		function refresh() {
			return _refresh.apply(this, arguments);
		}
		function _refresh() {
			_refresh = _asyncToGenerator(function* () {
				yield Promise.allSettled([imStore.refreshSummary(), imStore.refreshRecent()]);
			});
			return _refresh.apply(this, arguments);
		}
		function goCenter(filter) {
			close();
			router.push({
				path: "/message/center",
				query: filter === "all" ? {} : { filter }
			});
		}
		function openConversation(id) {
			close();
			router.push({
				path: "/message/center",
				query: { conversationId: String(id) }
			});
		}
		function presenceText(online, lastActiveAt) {
			return formatImPresence(online, lastActiveAt, true, new Date(imStore.presenceClock));
		}
		function formatTime(value) {
			if (!value) return "";
			const date = new Date(value);
			const now = /* @__PURE__ */ new Date();
			if (date.toDateString() === now.toDateString()) return date.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
			return `${date.getMonth() + 1}/${date.getDate()}`;
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_badge = ElBadge;
			const _component_el_button = ElButton;
			const _component_el_avatar = ElAvatar;
			return withDirectives((openBlock(), createElementBlock("div", { class: normalizeClass(["im-entry", { "sidebar-bottom": props.placement === "sidebar-bottom" }]) }, [createBaseVNode("button", {
				class: "im-trigger",
				type: "button",
				title: "消息",
				onClick: toggle
			}, [createVNode(_component_el_badge, {
				value: unref(imStore).badgeText,
				hidden: unref(imStore).summary.badgeCount === 0,
				class: "im-badge"
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, { size: 20 }, {
					default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
					_: 1
				})]),
				_: 1
			}, 8, ["value", "hidden"])]), createVNode(Transition, { name: "im-pop" }, {
				default: withCtx(() => [visible.value ? (openBlock(), createElementBlock("section", _hoisted_1$7, [
					createBaseVNode("header", _hoisted_2$6, [createBaseVNode("div", null, [_cache[5] || (_cache[5] = createBaseVNode("h3", null, "消息", -1)), createBaseVNode("p", null, [createBaseVNode("span", { class: normalizeClass(["connection-dot", unref(imStore).connectionState]) }, null, 2), createTextVNode(" " + toDisplayString(connectionText.value), 1)])]), createVNode(_component_el_button, {
						text: "",
						icon: unref(refresh_default),
						title: "刷新",
						onClick: refresh
					}, null, 8, ["icon"])]),
					createBaseVNode("div", _hoisted_3$2, [
						createBaseVNode("button", {
							type: "button",
							onClick: _cache[0] || (_cache[0] = ($event) => goCenter("unread"))
						}, [createBaseVNode("strong", null, toDisplayString(unref(imStore).summary.totalUnread), 1), _cache[6] || (_cache[6] = createBaseVNode("span", null, "未读消息", -1))]),
						createBaseVNode("button", {
							type: "button",
							onClick: _cache[1] || (_cache[1] = ($event) => goCenter("mention"))
						}, [createBaseVNode("strong", null, toDisplayString(unref(imStore).summary.mentionUnread), 1), _cache[7] || (_cache[7] = createBaseVNode("span", null, "@我的", -1))]),
						createBaseVNode("button", {
							type: "button",
							onClick: _cache[2] || (_cache[2] = ($event) => goCenter("all"))
						}, [createBaseVNode("strong", null, toDisplayString(unref(imStore).summary.unreadConversations), 1), _cache[8] || (_cache[8] = createBaseVNode("span", null, "待查看会话", -1))])
					]),
					createBaseVNode("div", _hoisted_4$2, [_cache[9] || (_cache[9] = createBaseVNode("span", null, "最近消息", -1)), createBaseVNode("button", {
						type: "button",
						onClick: _cache[3] || (_cache[3] = ($event) => goCenter("all"))
					}, "全部会话")]),
					createBaseVNode("div", _hoisted_5$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(unref(imStore).recent, (conversation) => {
						return openBlock(), createElementBlock("button", {
							key: conversation.id,
							class: "im-recent-row",
							type: "button",
							onClick: ($event) => openConversation(conversation.id)
						}, [createBaseVNode("span", _hoisted_7$1, [createVNode(_component_el_avatar, {
							size: 38,
							src: conversation.avatarUrl,
							class: "im-avatar"
						}, {
							default: withCtx(() => {
								var _conversation$name;
								return [createTextVNode(toDisplayString(((_conversation$name = conversation.name) === null || _conversation$name === void 0 ? void 0 : _conversation$name.slice(0, 1)) || "消"), 1)];
							}),
							_: 2
						}, 1032, ["src"]), conversation.type === "direct" ? (openBlock(), createElementBlock("i", {
							key: 0,
							class: normalizeClass({ online: conversation.peerOnline })
						}, null, 2)) : createCommentVNode("", true)]), createBaseVNode("span", _hoisted_8, [createBaseVNode("span", _hoisted_9, [createBaseVNode("b", null, toDisplayString(conversation.name), 1), createBaseVNode("time", null, toDisplayString(formatTime(conversation.lastMessageAt)), 1)]), createBaseVNode("span", _hoisted_10, [
							conversation.draft ? (openBlock(), createElementBlock("em", _hoisted_11, "[草稿] " + toDisplayString(conversation.draft), 1)) : (openBlock(), createElementBlock("span", _hoisted_12, toDisplayString(conversation.lastSenderName ? `${conversation.lastSenderName}：` : "") + toDisplayString(conversation.lastMessageText || "开始沟通"), 1)),
							conversation.type === "direct" ? (openBlock(), createElementBlock("small", {
								key: 2,
								class: normalizeClass(["im-presence", { online: conversation.peerOnline }])
							}, toDisplayString(presenceText(conversation.peerOnline, conversation.peerLastActiveAt)), 3)) : createCommentVNode("", true),
							conversation.muted ? (openBlock(), createBlock(_component_el_icon, {
								key: 3,
								title: "免打扰"
							}, {
								default: withCtx(() => [createVNode(unref(mute_notification_default))]),
								_: 1
							})) : createCommentVNode("", true),
							conversation.mentionCount ? (openBlock(), createElementBlock("i", _hoisted_13, "@我")) : createCommentVNode("", true),
							conversation.unreadCount ? (openBlock(), createElementBlock("u", _hoisted_14, toDisplayString(conversation.unreadCount > 99 ? "99+" : conversation.unreadCount), 1)) : createCommentVNode("", true)
						])])], 8, _hoisted_6$1);
					}), 128)), !unref(imStore).recent.length ? (openBlock(), createElementBlock("div", _hoisted_15, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(chat_line_round_default))]),
						_: 1
					}), _cache[10] || (_cache[10] = createBaseVNode("span", null, "暂无会话", -1))])) : createCommentVNode("", true)]),
					createBaseVNode("footer", null, [createBaseVNode("button", {
						type: "button",
						onClick: _cache[4] || (_cache[4] = ($event) => goCenter("all"))
					}, [_cache[11] || (_cache[11] = createTextVNode(" 进入内部沟通 ", -1)), createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_right_default))]),
						_: 1
					})])])
				])) : createCommentVNode("", true)]),
				_: 1
			})], 2)), [[unref(ClickOutside), close]]);
		};
	}
}), [["__scopeId", "data-v-c2558804"]]);
//#endregion
//#region src/components/impersonation/ImpersonationSwitcher.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$6 = { class: "switch-filters" };
var _hoisted_2$5 = { class: "candidate-list" };
var _hoisted_3$1 = ["onClick"];
var _hoisted_4$1 = { class: "candidate-main" };
var _hoisted_5$1 = { class: "candidate-roles" };
//#endregion
//#region src/components/impersonation/ImpersonationSwitcher.vue
var ImpersonationSwitcher_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ImpersonationSwitcher",
	props: { modelValue: { type: Boolean } },
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const impersonationStore = useImpersonationStore();
		const keyword = ref("");
		const deptId = ref();
		const deptTree = ref([]);
		const candidates = ref([]);
		const selectedId = ref();
		const reason = ref("");
		const loading = ref(false);
		let searchTimer;
		const selected = computed(() => candidates.value.find((item) => item.userId === selectedId.value));
		const canStart = computed(() => Boolean(selected.value && reason.value.trim() && !impersonationStore.switching));
		function unwrapData(response) {
			var _value$data;
			const value = response;
			return (_value$data = value === null || value === void 0 ? void 0 : value.data) !== null && _value$data !== void 0 ? _value$data : value;
		}
		function hasMultipleRoles(item) {
			return Boolean(item.multipleRoles || item.roleCount > 1 || item.roleNames.length > 1);
		}
		function loadDeptTree() {
			return _loadDeptTree.apply(this, arguments);
		}
		function _loadDeptTree() {
			_loadDeptTree = _asyncToGenerator(function* () {
				if (deptTree.value.length) return;
				try {
					const data = unwrapData(yield deptApi.tree());
					deptTree.value = Array.isArray(data) ? data : [];
				} catch (_unused) {
					deptTree.value = [];
				}
			});
			return _loadDeptTree.apply(this, arguments);
		}
		function loadCandidates() {
			return _loadCandidates.apply(this, arguments);
		}
		function _loadCandidates() {
			_loadCandidates = _asyncToGenerator(function* () {
				if (!props.modelValue) return;
				loading.value = true;
				try {
					const data = unwrapData(yield impersonationApi.candidates({
						keyword: keyword.value.trim() || void 0,
						deptId: deptId.value
					}));
					candidates.value = (Array.isArray(data) ? data : []).filter((item) => isAllowedImpersonationTargetUserId(item.userId)).map((item) => _objectSpread2(_objectSpread2({}, item), {}, {
						userId: Number(item.userId),
						displayName: String(item.displayName || "员工"),
						roleNames: Array.isArray(item.roleNames) ? item.roleNames.map(String).filter(Boolean) : [],
						roleKeys: Array.isArray(item.roleKeys) ? item.roleKeys.map(String).filter(Boolean) : [],
						roleCount: Number(item.roleCount || 0),
						multipleRoles: Boolean(item.multipleRoles)
					}));
					if (selectedId.value && !candidates.value.some((item) => item.userId === selectedId.value)) selectedId.value = void 0;
				} catch (_unused2) {
					candidates.value = [];
				} finally {
					loading.value = false;
				}
			});
			return _loadCandidates.apply(this, arguments);
		}
		function scheduleSearch() {
			if (searchTimer !== void 0) window.clearTimeout(searchTimer);
			searchTimer = window.setTimeout(loadCandidates, 260);
		}
		function start() {
			return _start.apply(this, arguments);
		}
		function _start() {
			_start = _asyncToGenerator(function* () {
				if (!selected.value) {
					ElMessage.warning("请先选择一名员工");
					return;
				}
				if (!reason.value.trim()) {
					ElMessage.warning("请填写本次切换原因");
					return;
				}
				try {
					yield impersonationStore.start(selected.value.userId, reason.value);
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "切换员工视角失败");
				}
			});
			return _start.apply(this, arguments);
		}
		function resetDialog() {
			keyword.value = "";
			deptId.value = void 0;
			selectedId.value = void 0;
			reason.value = "";
			candidates.value = [];
		}
		watch(() => props.modelValue, (visible) => {
			if (visible) Promise.all([loadDeptTree(), loadCandidates()]);
		}, { immediate: true });
		onBeforeUnmount(() => {
			if (searchTimer !== void 0) window.clearTimeout(searchTimer);
		});
		return (_ctx, _cache) => {
			const _component_el_alert = ElAlert;
			const _component_el_input = ElInput;
			const _component_el_tree_select = ElTreeSelect;
			const _component_el_avatar = ElAvatar;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_empty = ElEmpty;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_button = ElButton;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_dialog, {
				"model-value": __props.modelValue,
				title: "切换员工视角",
				width: "min(780px, 94vw)",
				"append-to-body": "",
				"destroy-on-close": "",
				"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => emit("update:modelValue", $event)),
				onClosed: resetDialog
			}, {
				footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[3] || (_cache[3] = ($event) => emit("update:modelValue", false)) }, {
					default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("取消", -1)])]),
					_: 1
				}), createVNode(_component_el_button, {
					type: "primary",
					loading: unref(impersonationStore).switching,
					disabled: !canStart.value,
					onClick: start
				}, {
					default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode(" 进入员工视角 ", -1)])]),
					_: 1
				}, 8, ["loading", "disabled"])]),
				default: withCtx(() => [
					createVNode(_component_el_alert, {
						title: "仅用于检查员工真实权限，进入后为查看模式，不会修改该员工的角色或登录状态。",
						type: "warning",
						closable: false,
						"show-icon": "",
						class: "switch-alert"
					}),
					createBaseVNode("div", _hoisted_1$6, [createVNode(_component_el_input, {
						modelValue: keyword.value,
						"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
						"prefix-icon": unref(search_default),
						clearable: "",
						placeholder: "搜索员工姓名",
						onInput: scheduleSearch,
						onClear: loadCandidates,
						onKeyup: withKeys(loadCandidates, ["enter"])
					}, null, 8, ["modelValue", "prefix-icon"]), createVNode(_component_el_tree_select, {
						modelValue: deptId.value,
						"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => deptId.value = $event),
						data: deptTree.value,
						props: {
							label: "name",
							children: "children",
							value: "id"
						},
						"check-strictly": "",
						clearable: "",
						filterable: "",
						placeholder: "全部部门",
						onChange: loadCandidates
					}, null, 8, ["modelValue", "data"])]),
					withDirectives((openBlock(), createElementBlock("div", _hoisted_2$5, [(openBlock(true), createElementBlock(Fragment, null, renderList(candidates.value, (item) => {
						return openBlock(), createElementBlock("button", {
							key: item.userId,
							type: "button",
							class: normalizeClass(["candidate-row", { selected: selectedId.value === item.userId }]),
							onClick: ($event) => selectedId.value = item.userId
						}, [
							createVNode(_component_el_avatar, { size: 38 }, {
								default: withCtx(() => [createTextVNode(toDisplayString(item.displayName.slice(0, 1) || "员"), 1)]),
								_: 2
							}, 1024),
							createBaseVNode("span", _hoisted_4$1, [createBaseVNode("strong", null, toDisplayString(item.displayName), 1), createBaseVNode("small", null, toDisplayString(item.deptName || "未设置部门"), 1)]),
							createBaseVNode("span", _hoisted_5$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(item.roleNames, (role) => {
								return openBlock(), createBlock(_component_el_tag, {
									key: role,
									size: "small",
									effect: "plain"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(role), 1)]),
									_: 2
								}, 1024);
							}), 128)), !item.roleNames.length ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								size: "small",
								type: "info",
								effect: "plain"
							}, {
								default: withCtx(() => [..._cache[5] || (_cache[5] = [createTextVNode("未分配角色", -1)])]),
								_: 1
							})) : createCommentVNode("", true)]),
							hasMultipleRoles(item) ? (openBlock(), createBlock(_component_el_tag, {
								key: 0,
								type: "danger",
								size: "small"
							}, {
								default: withCtx(() => [..._cache[6] || (_cache[6] = [createTextVNode("历史多角色", -1)])]),
								_: 1
							})) : createCommentVNode("", true),
							createVNode(_component_el_icon, { class: "candidate-check" }, {
								default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
								_: 1
							})
						], 10, _hoisted_3$1);
					}), 128)), !loading.value && !candidates.value.length ? (openBlock(), createBlock(_component_el_empty, {
						key: 0,
						"image-size": 64,
						description: "没有符合条件的在职员工"
					})) : createCommentVNode("", true)])), [[_directive_loading, loading.value]]),
					selected.value && hasMultipleRoles(selected.value) ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						title: "该员工存在多个有效角色。系统将严格按后端当前合并后的真实权限展示，不能在前端任选某个角色。",
						type: "error",
						closable: false,
						"show-icon": "",
						class: "role-warning"
					})) : createCommentVNode("", true),
					createVNode(_component_el_form, {
						"label-position": "top",
						class: "reason-form"
					}, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "切换原因（必填）",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: reason.value,
								"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => reason.value = $event),
								type: "textarea",
								rows: 3,
								maxlength: "200",
								"show-word-limit": "",
								placeholder: "例如：检查销售人员权限"
							}, null, 8, ["modelValue"])]),
							_: 1
						})]),
						_: 1
					})
				]),
				_: 1
			}, 8, ["model-value"]);
		};
	}
}), [["__scopeId", "data-v-c958eadb"]]);
//#endregion
//#region src/components/layout/SidebarAccount.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$5 = {
	class: "account-trigger",
	type: "button",
	title: "账户菜单"
};
var _hoisted_2$4 = {
	key: 0,
	class: "account-name"
};
//#endregion
//#region src/components/layout/SidebarAccount.vue
var SidebarAccount_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SidebarAccount",
	setup(__props) {
		const router = useRouter();
		const appStore = useAppStore();
		const imStore = useImStore();
		const impersonationStore = useImpersonationStore();
		const userStore = useUserStore();
		const displayName = computed(() => {
			var _userStore$userInfo;
			return ((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.nickname) || "管理员";
		});
		const switcherVisible = ref(false);
		const canStartImpersonation = computed(() => {
			var _userStore$userInfo$i, _userStore$userInfo2, _userStore$userInfo3;
			return Number((_userStore$userInfo$i = (_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.id) !== null && _userStore$userInfo$i !== void 0 ? _userStore$userInfo$i : (_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.userId) === 3 && !impersonationStore.active;
		});
		function goProfile() {
			router.push("/dashboard/home");
		}
		function handleLogout() {
			return _handleLogout.apply(this, arguments);
		}
		function _handleLogout() {
			_handleLogout = _asyncToGenerator(function* () {
				yield ElMessageBox.confirm("确定退出登录吗？", "提示", { type: "warning" });
				imStore.disconnect();
				try {
					yield userStore.logout();
					markLogoutTransition();
					window.location.replace("/login");
				} catch (_error) {
					yield ElMessageBox.alert("退出未完全完成，系统将刷新当前页面，请稍后重试。", "退出失败", {
						type: "error",
						confirmButtonText: "知道了"
					}).catch(() => void 0);
					window.location.reload();
				}
			});
			return _handleLogout.apply(this, arguments);
		}
		const pwdVisible = ref(false);
		const pwdLoading = ref(false);
		const pwdFormRef = ref();
		const pwdForm = reactive({
			oldPassword: "",
			newPassword: "",
			confirmPassword: ""
		});
		const pwdRules = {
			oldPassword: [{
				required: true,
				message: "请输入原密码",
				trigger: "blur"
			}],
			newPassword: [{
				required: true,
				message: "请输入新密码",
				trigger: "blur"
			}, {
				min: 10,
				max: 128,
				message: "新密码长度必须为 10 至 128 位",
				trigger: "blur"
			}],
			confirmPassword: [{
				required: true,
				message: "请再次输入新密码",
				trigger: "blur"
			}, {
				validator: (_rule, value, callback) => {
					if (value !== pwdForm.newPassword) callback(/* @__PURE__ */ new Error("两次输入的新密码不一致"));
					else callback();
				},
				trigger: "blur"
			}]
		};
		function openPwdDialog() {
			var _pwdFormRef$value;
			pwdForm.oldPassword = "";
			pwdForm.newPassword = "";
			pwdForm.confirmPassword = "";
			(_pwdFormRef$value = pwdFormRef.value) === null || _pwdFormRef$value === void 0 || _pwdFormRef$value.clearValidate();
			pwdVisible.value = true;
		}
		function submitPwd() {
			return _submitPwd.apply(this, arguments);
		}
		function _submitPwd() {
			_submitPwd = _asyncToGenerator(function* () {
				if (!pwdFormRef.value) return;
				yield pwdFormRef.value.validate(function() {
					var _ref = _asyncToGenerator(function* (valid) {
						if (!valid) return;
						pwdLoading.value = true;
						try {
							yield userApi.updateMyPwd({
								oldPassword: pwdForm.oldPassword,
								newPassword: pwdForm.newPassword
							});
							ElMessage.success("密码修改成功，所有登录会话已失效，请重新登录");
							pwdVisible.value = false;
							userStore.resetState();
							yield router.replace("/login");
						} catch (error) {
							ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "修改失败");
						} finally {
							pwdLoading.value = false;
						}
					});
					return function(_x) {
						return _ref.apply(this, arguments);
					};
				}());
			});
			return _submitPwd.apply(this, arguments);
		}
		return (_ctx, _cache) => {
			const _component_el_avatar = ElAvatar;
			const _component_el_icon = ElIcon;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_input = ElInput;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_button = ElButton;
			const _component_el_dialog = ElDialog;
			return openBlock(), createElementBlock(Fragment, null, [
				createBaseVNode("div", { class: normalizeClass(["sidebar-account", { collapsed: unref(appStore).sidebarCollapsed }]) }, [!unref(impersonationStore).active ? (openBlock(), createBlock(MessageCenter_default, {
					key: 0,
					placement: "sidebar-bottom"
				})) : createCommentVNode("", true), createVNode(_component_el_dropdown, {
					trigger: "click",
					placement: "top-start",
					teleported: true
				}, {
					dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
						default: withCtx(() => [
							canStartImpersonation.value ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 0,
								icon: unref(view_default),
								onClick: _cache[0] || (_cache[0] = ($event) => switcherVisible.value = true)
							}, {
								default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("切换员工视角", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true),
							createVNode(_component_el_dropdown_item, {
								icon: unref(user_default),
								onClick: goProfile
							}, {
								default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("个人中心", -1)])]),
								_: 1
							}, 8, ["icon"]),
							!unref(impersonationStore).active ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 1,
								icon: unref(lock_default),
								onClick: openPwdDialog
							}, {
								default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("修改密码", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true),
							!unref(impersonationStore).active ? (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 2,
								divided: "",
								icon: unref(switch_button_default),
								onClick: handleLogout
							}, {
								default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("退出登录", -1)])]),
								_: 1
							}, 8, ["icon"])) : (openBlock(), createBlock(_component_el_dropdown_item, {
								key: 3,
								divided: "",
								icon: unref(switch_button_default),
								onClick: unref(impersonationStore).end
							}, {
								default: withCtx(() => [..._cache[11] || (_cache[11] = [createTextVNode("退出员工视角", -1)])]),
								_: 1
							}, 8, ["icon", "onClick"]))
						]),
						_: 1
					})]),
					default: withCtx(() => [createBaseVNode("button", _hoisted_1$5, [
						createVNode(_component_el_avatar, {
							size: 32,
							class: "account-avatar"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(displayName.value.charAt(0)), 1)]),
							_: 1
						}),
						!unref(appStore).sidebarCollapsed ? (openBlock(), createElementBlock("span", _hoisted_2$4, toDisplayString(displayName.value), 1)) : createCommentVNode("", true),
						!unref(appStore).sidebarCollapsed ? (openBlock(), createBlock(_component_el_icon, {
							key: 1,
							class: "account-caret"
						}, {
							default: withCtx(() => [createVNode(unref(arrow_up_default))]),
							_: 1
						})) : createCommentVNode("", true)
					])]),
					_: 1
				})], 2),
				createVNode(_component_el_dialog, {
					modelValue: pwdVisible.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => pwdVisible.value = $event),
					title: "修改密码",
					width: "420px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[4] || (_cache[4] = ($event) => pwdVisible.value = false) }, {
						default: withCtx(() => [..._cache[12] || (_cache[12] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: pwdLoading.value,
						onClick: submitPwd
					}, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("确定", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						ref_key: "pwdFormRef",
						ref: pwdFormRef,
						model: pwdForm,
						rules: pwdRules,
						"label-width": "92px"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "原密码",
								prop: "oldPassword"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: pwdForm.oldPassword,
									"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => pwdForm.oldPassword = $event),
									type: "password",
									"show-password": "",
									placeholder: "请输入当前密码"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "新密码",
								prop: "newPassword"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: pwdForm.newPassword,
									"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => pwdForm.newPassword = $event),
									type: "password",
									"show-password": "",
									placeholder: "至少 10 位，建议混合大小写、数字和符号"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "确认新密码",
								prop: "confirmPassword"
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: pwdForm.confirmPassword,
									"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => pwdForm.confirmPassword = $event),
									type: "password",
									"show-password": "",
									placeholder: "再次输入新密码",
									onKeyup: withKeys(submitPwd, ["enter"])
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(ImpersonationSwitcher_default, {
					modelValue: switcherVisible.value,
					"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => switcherVisible.value = $event)
				}, null, 8, ["modelValue"])
			], 64);
		};
	}
}), [["__scopeId", "data-v-d8fd17de"]]);
//#endregion
//#region src/components/layout/Sidebar.vue
var Sidebar_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "Sidebar",
	setup(__props) {
		const route = useRoute();
		const router = useRouter();
		const appStore = useAppStore();
		const permissionStore = usePermissionStore();
		const userStore = useUserStore();
		const activeMenu = computed(() => route.path);
		const TILE_COLORS = {
			"/": "#3370ff",
			"/dashboard": "#7c5cff",
			"/customer": "#00b3a4",
			"/approval": "#ff8800",
			"/culture": "#f5505f",
			"/order": "#36b37e",
			"/feige-order-contract": "#0f766e",
			"/hrm": "#4c6ef5",
			"/file": "#ff7452",
			"/system": "#8c9bab",
			"/sys-org": "#3370ff",
			"/sys-account": "#00b3a4",
			"/sys-authority": "#ff8800",
			"/sys-flow": "#7c5cff",
			"/sys-integration": "#0aa5ff",
			"/sys-log": "#8c9bab",
			"/order/bookkeeping": "#3370ff",
			"/order/address": "#00b3a4",
			"/order/seal-order": "#f97316",
			"/order/gs-order": "#6366f1",
			"/order/legal": "#c0c4cc",
			"/order/bank": "#c0c4cc",
			"/order/project-apply": "#c0c4cc",
			"/order/other-value": "#c0c4cc",
			"/order/guide": "#8b5cf6",
			"/feige-order-contract/orders": "#0f766e",
			"/feige-order-contract/new-order": "#2563eb",
			"/feige-order-contract/refunds": "#dc2626",
			"/feige-order-contract/unreceived": "#d97706",
			"/feige-order-contract/contracts": "#7c3aed"
		};
		const PALETTE = [
			"#3370ff",
			"#7c5cff",
			"#00b3a4",
			"#ff8800",
			"#f5505f",
			"#36b37e",
			"#ffab00",
			"#9b5cff",
			"#0aa5ff",
			"#ff7452",
			"#20c997"
		];
		function tileColor(path) {
			if (TILE_COLORS[path]) return TILE_COLORS[path];
			let h = 0;
			for (let i = 0; i < path.length; i++) h = h * 31 + path.charCodeAt(i) >>> 0;
			return PALETTE[h % PALETTE.length];
		}
		/** 当前所在大类 = 当前路由顶层模块所属大类 */
		const activeGroup = computed(() => {
			const top = route.matched[0];
			return top ? MODULE_GROUP[top.path] : void 0;
		});
		/** 仅显示「当前大类」下的顶级模块；navigationHidden 只隐藏菜单，不参与权限过滤。 */
		const menuRoutes = computed(() => permissionStore.routes.filter((r) => {
			var _r$meta, _r$meta2;
			return !((_r$meta = r.meta) === null || _r$meta === void 0 ? void 0 : _r$meta.hidden) && !((_r$meta2 = r.meta) === null || _r$meta2 === void 0 ? void 0 : _r$meta2.navigationHidden) && MODULE_GROUP[r.path] === activeGroup.value;
		}));
		/** 单模块大类:把该模块的子菜单直接平铺(去掉模块那层下拉,如"销售体系"不再套"CRM库") */
		const soleModule = computed(() => menuRoutes.value.length === 1 ? menuRoutes.value[0] : null);
		const flatItems = computed(() => {
			if (!soleModule.value) return null;
			const kids = visibleChildren(soleModule.value);
			if (!kids.length) return null;
			return kids.map((c) => ({
				child: c,
				index: childIndex(soleModule.value, c)
			}));
		});
		function visibleChildren(route) {
			const roles = /* @__PURE__ */ new Set();
			(userStore.roles || []).forEach((role) => {
				roles.add(role);
				const separator = role.indexOf("__");
				if (separator > 0) roles.add(role.slice(0, separator));
			});
			return (route.children || []).filter((child) => {
				var _child$meta, _child$meta2;
				if ((_child$meta = child.meta) === null || _child$meta === void 0 ? void 0 : _child$meta.hidden) return false;
				const hiddenRoles = (_child$meta2 = child.meta) === null || _child$meta2 === void 0 ? void 0 : _child$meta2.hideForRoles;
				return !(hiddenRoles === null || hiddenRoles === void 0 ? void 0 : hiddenRoles.some((role) => roles.has(role)));
			});
		}
		function normalizePath(path) {
			return path.replace(/\/+/g, "/");
		}
		function childIndex(parent, child) {
			const childPath = child.path;
			if (childPath.startsWith("/")) return childPath;
			return normalizePath(parent.path === "/" ? `/${childPath}` : `${parent.path}/${childPath}`);
		}
		function routeIndex(route) {
			if (typeof route.redirect === "string") return route.redirect;
			const firstChild = visibleChildren(route)[0];
			return firstChild ? childIndex(route, firstChild) : route.path;
		}
		function handleSelect(index) {
			router.push(index);
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_menu_item = ElMenuItem;
			const _component_el_sub_menu = ElSubMenu;
			const _component_el_menu = ElMenu;
			const _component_el_scrollbar = ElScrollbar;
			return openBlock(), createElementBlock("aside", { class: normalizeClass(["sidebar", { collapsed: unref(appStore).sidebarCollapsed }]) }, [createVNode(_component_el_scrollbar, { class: "sidebar-menu-scroll" }, {
				default: withCtx(() => [createVNode(_component_el_menu, {
					"default-active": activeMenu.value,
					collapse: unref(appStore).sidebarCollapsed,
					"collapse-transition": false,
					"unique-opened": "",
					"background-color": "transparent",
					"text-color": "#4E5969",
					"active-text-color": "#3370FF",
					onSelect: handleSelect
				}, {
					default: withCtx(() => [flatItems.value ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(flatItems.value, (it) => {
						return openBlock(), createBlock(_component_el_menu_item, {
							key: it.index,
							index: it.index
						}, {
							title: withCtx(() => {
								var _it$child$meta;
								return [createBaseVNode("span", null, toDisplayString((_it$child$meta = it.child.meta) === null || _it$child$meta === void 0 ? void 0 : _it$child$meta.title), 1)];
							}),
							default: withCtx(() => [createBaseVNode("span", {
								class: "nav-tile",
								style: normalizeStyle({ background: tileColor(it.index) })
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => {
									var _it$child$meta2, _it$child$meta3;
									return [(openBlock(), createBlock(resolveDynamicComponent(unref(resolveMenuIcon)((_it$child$meta2 = it.child.meta) === null || _it$child$meta2 === void 0 ? void 0 : _it$child$meta2.title, (_it$child$meta3 = it.child.meta) === null || _it$child$meta3 === void 0 ? void 0 : _it$child$meta3.icon))))];
								}),
								_: 2
							}, 1024)], 4)]),
							_: 2
						}, 1032, ["index"]);
					}), 128)) : createCommentVNode("", true), !flatItems.value ? (openBlock(true), createElementBlock(Fragment, { key: 1 }, renderList(menuRoutes.value, (route) => {
						return openBlock(), createElementBlock(Fragment, { key: route.path }, [visibleChildren(route).length > 1 ? (openBlock(), createBlock(_component_el_sub_menu, {
							key: 0,
							index: route.path
						}, {
							title: withCtx(() => {
								var _route$meta3;
								return [createBaseVNode("span", {
									class: "nav-tile",
									style: normalizeStyle({ background: tileColor(route.path) })
								}, [createVNode(_component_el_icon, null, {
									default: withCtx(() => {
										var _route$meta, _route$meta2;
										return [(openBlock(), createBlock(resolveDynamicComponent(unref(resolveMenuIcon)((_route$meta = route.meta) === null || _route$meta === void 0 ? void 0 : _route$meta.title, (_route$meta2 = route.meta) === null || _route$meta2 === void 0 ? void 0 : _route$meta2.icon))))];
									}),
									_: 2
								}, 1024)], 4), createBaseVNode("span", null, toDisplayString((_route$meta3 = route.meta) === null || _route$meta3 === void 0 ? void 0 : _route$meta3.title), 1)];
							}),
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(visibleChildren(route), (child) => {
								return openBlock(), createBlock(_component_el_menu_item, {
									key: child.path,
									index: childIndex(route, child)
								}, {
									title: withCtx(() => {
										var _child$meta3;
										return [createBaseVNode("span", null, toDisplayString((_child$meta3 = child.meta) === null || _child$meta3 === void 0 ? void 0 : _child$meta3.title), 1)];
									}),
									default: withCtx(() => [createVNode(_component_el_icon, {
										class: "nav-child-icon",
										style: normalizeStyle({ color: tileColor(childIndex(route, child)) })
									}, {
										default: withCtx(() => {
											var _child$meta4, _child$meta5;
											return [(openBlock(), createBlock(resolveDynamicComponent(unref(resolveMenuIcon)((_child$meta4 = child.meta) === null || _child$meta4 === void 0 ? void 0 : _child$meta4.title, (_child$meta5 = child.meta) === null || _child$meta5 === void 0 ? void 0 : _child$meta5.icon))))];
										}),
										_: 2
									}, 1032, ["style"])]),
									_: 2
								}, 1032, ["index"]);
							}), 128))]),
							_: 2
						}, 1032, ["index"])) : (openBlock(), createBlock(_component_el_menu_item, {
							key: 1,
							index: routeIndex(route)
						}, {
							title: withCtx(() => {
								var _route$meta4;
								return [createBaseVNode("span", null, toDisplayString((_route$meta4 = route.meta) === null || _route$meta4 === void 0 ? void 0 : _route$meta4.title), 1)];
							}),
							default: withCtx(() => [createBaseVNode("span", {
								class: "nav-tile",
								style: normalizeStyle({ background: tileColor(route.path) })
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => {
									var _route$meta5, _route$meta6;
									return [(openBlock(), createBlock(resolveDynamicComponent(unref(resolveMenuIcon)((_route$meta5 = route.meta) === null || _route$meta5 === void 0 ? void 0 : _route$meta5.title, (_route$meta6 = route.meta) === null || _route$meta6 === void 0 ? void 0 : _route$meta6.icon))))];
								}),
								_: 2
							}, 1024)], 4)]),
							_: 2
						}, 1032, ["index"]))], 64);
					}), 128)) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["default-active", "collapse"])]),
				_: 1
			}), createVNode(SidebarAccount_default)], 2);
		};
	}
}), [["__scopeId", "data-v-1f52366d"]]);
//#endregion
//#region src/components/layout/Breadcrumb.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = { key: 0 };
var _hoisted_2$3 = { key: 1 };
//#endregion
//#region src/components/layout/Breadcrumb.vue
var Breadcrumb_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "Breadcrumb",
	setup(__props) {
		const route = useRoute();
		const breadcrumbs = computed(() => {
			return route.matched.filter((item) => {
				var _item$meta, _item$meta2;
				return ((_item$meta = item.meta) === null || _item$meta === void 0 ? void 0 : _item$meta.title) && ((_item$meta2 = item.meta) === null || _item$meta2 === void 0 ? void 0 : _item$meta2.breadcrumb) !== false;
			});
		});
		return (_ctx, _cache) => {
			const _component_router_link = resolveComponent("router-link");
			const _component_el_breadcrumb_item = ElBreadcrumbItem;
			const _component_el_breadcrumb = ElBreadcrumb;
			return openBlock(), createBlock(_component_el_breadcrumb, { separator: "/" }, {
				default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(breadcrumbs.value, (item) => {
					return openBlock(), createBlock(_component_el_breadcrumb_item, { key: item.path }, {
						default: withCtx(() => {
							var _item$meta4;
							return [item.redirect ? (openBlock(), createElementBlock("span", _hoisted_1$4, [createVNode(_component_router_link, { to: item.redirect }, {
								default: withCtx(() => {
									var _item$meta3;
									return [createTextVNode(toDisplayString((_item$meta3 = item.meta) === null || _item$meta3 === void 0 ? void 0 : _item$meta3.title), 1)];
								}),
								_: 2
							}, 1032, ["to"])])) : (openBlock(), createElementBlock("span", _hoisted_2$3, toDisplayString((_item$meta4 = item.meta) === null || _item$meta4 === void 0 ? void 0 : _item$meta4.title), 1))];
						}),
						_: 2
					}, 1024);
				}), 128))]),
				_: 1
			});
		};
	}
}), [["__scopeId", "data-v-010d6b23"]]);
//#endregion
//#region src/components/layout/Header.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "header" };
var _hoisted_2$2 = { class: "header-left" };
//#endregion
//#region src/components/layout/Header.vue
var Header_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "Header",
	setup(__props) {
		const appStore = useAppStore();
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			return openBlock(), createElementBlock("header", _hoisted_1$3, [createBaseVNode("div", _hoisted_2$2, [createVNode(_component_el_icon, {
				class: "collapse-btn",
				onClick: unref(appStore).toggleSidebar
			}, {
				default: withCtx(() => [!unref(appStore).sidebarCollapsed ? (openBlock(), createBlock(unref(fold_default), { key: 0 })) : (openBlock(), createBlock(unref(expand_default), { key: 1 }))]),
				_: 1
			}, 8, ["onClick"]), createVNode(Breadcrumb_default)])]);
		};
	}
}), [["__scopeId", "data-v-11cfef0a"]]);
//#endregion
//#region src/components/layout/Watermark.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "wm-badge" };
//#endregion
//#region src/components/layout/Watermark.vue
var Watermark_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent(_objectSpread2(_objectSpread2({}, { name: "AppWatermark" }), {}, {
	__name: "Watermark",
	setup(__props) {
		const u = useUserStore();
		const name = computed(() => {
			var _u$userInfo, _u$userInfo2;
			return ((_u$userInfo = u.userInfo) === null || _u$userInfo === void 0 ? void 0 : _u$userInfo.nickname) || ((_u$userInfo2 = u.userInfo) === null || _u$userInfo2 === void 0 ? void 0 : _u$userInfo2.username) || "";
		});
		const phone = computed(() => {
			var _u$userInfo3;
			return ((_u$userInfo3 = u.userInfo) === null || _u$userInfo3 === void 0 ? void 0 : _u$userInfo3.phone) || "";
		});
		const now = ref("");
		let timer = null;
		const formatTime = (d) => {
			const p = (n) => String(n).padStart(2, "0");
			return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
		};
		const tileText = computed(() => [
			name.value,
			phone.value,
			now.value
		].filter(Boolean).join(" "));
		const badgeText = computed(() => [name.value, now.value].filter(Boolean).join(" · "));
		const tileBg = computed(() => {
			const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="260" height="150"><text x="0" y="75" transform="rotate(-22 130 75)" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="13" fill="#1f2329" fill-opacity="0.06">${escapeXml(tileText.value || " ")}</text></svg>`;
			return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
		});
		function escapeXml(s) {
			return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
		}
		onMounted(() => {
			now.value = formatTime(/* @__PURE__ */ new Date());
			timer = setInterval(() => {
				now.value = formatTime(/* @__PURE__ */ new Date());
			}, 1e3);
		});
		onUnmounted(() => {
			if (timer) {
				clearInterval(timer);
				timer = null;
			}
		});
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock(Fragment, null, [createBaseVNode("div", {
				class: "wm-overlay",
				style: normalizeStyle({ backgroundImage: unref(tileBg) })
			}, null, 4), createBaseVNode("div", _hoisted_1$2, toDisplayString(unref(badgeText)), 1)], 64);
		};
	}
})), [["__scopeId", "data-v-239b5336"]]);
//#endregion
//#region src/components/impersonation/ImpersonationBanner.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = {
	key: 0,
	class: "impersonation-banner",
	role: "status",
	"aria-live": "polite"
};
var _hoisted_2$1 = { class: "ib-main" };
var _hoisted_3 = { class: "ib-copy" };
var _hoisted_4 = {
	key: 0,
	class: "ib-dept"
};
var _hoisted_5 = {
	key: 1,
	class: "ib-multi-role"
};
var _hoisted_6 = { class: "ib-actions" };
var _hoisted_7 = { class: "ib-countdown" };
//#endregion
//#region src/components/impersonation/ImpersonationBanner.vue
var ImpersonationBanner_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ImpersonationBanner",
	setup(__props) {
		const impersonationStore = useImpersonationStore();
		const now = ref(Date.now());
		let timer;
		const targetName = computed(() => {
			var _impersonationStore$c;
			return ((_impersonationStore$c = impersonationStore.current) === null || _impersonationStore$c === void 0 ? void 0 : _impersonationStore$c.targetName) || "员工";
		});
		const targetDeptName = computed(() => {
			var _impersonationStore$c2;
			return ((_impersonationStore$c2 = impersonationStore.current) === null || _impersonationStore$c2 === void 0 ? void 0 : _impersonationStore$c2.targetDeptName) || "";
		});
		const actorName = computed(() => {
			var _impersonationStore$c3;
			return ((_impersonationStore$c3 = impersonationStore.current) === null || _impersonationStore$c3 === void 0 ? void 0 : _impersonationStore$c3.actorName) || "超级管理员";
		});
		const remainingText = computed(() => {
			var _impersonationStore$c4;
			const expireTime = (_impersonationStore$c4 = impersonationStore.current) === null || _impersonationStore$c4 === void 0 ? void 0 : _impersonationStore$c4.expireTime;
			const remaining = Math.max(0, new Date(expireTime || "").getTime() - now.value);
			if (!Number.isFinite(remaining)) return "--:--";
			const totalSeconds = Math.ceil(remaining / 1e3);
			const minutes = Math.floor(totalSeconds / 60);
			const seconds = totalSeconds % 60;
			return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
		});
		onMounted(() => {
			timer = window.setInterval(() => {
				now.value = Date.now();
			}, 1e3);
		});
		onBeforeUnmount(() => {
			if (timer !== void 0) window.clearInterval(timer);
		});
		return (_ctx, _cache) => {
			var _unref$current;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			return unref(impersonationStore).active ? (openBlock(), createElementBlock("section", _hoisted_1$1, [createBaseVNode("div", _hoisted_2$1, [createVNode(_component_el_icon, { class: "ib-icon" }, {
				default: withCtx(() => [createVNode(unref(view_default))]),
				_: 1
			}), createBaseVNode("div", _hoisted_3, [
				createBaseVNode("strong", null, "正在以【" + toDisplayString(targetName.value) + "】身份查看", 1),
				createBaseVNode("span", null, "实际操作人：" + toDisplayString(actorName.value) + " · 查看模式", 1),
				targetDeptName.value ? (openBlock(), createElementBlock("span", _hoisted_4, "部门：" + toDisplayString(targetDeptName.value), 1)) : createCommentVNode("", true),
				((_unref$current = unref(impersonationStore).current) === null || _unref$current === void 0 ? void 0 : _unref$current.multipleRoles) ? (openBlock(), createElementBlock("span", _hoisted_5, "多角色账号：按后端真实合并权限展示")) : createCommentVNode("", true)
			])]), createBaseVNode("div", _hoisted_6, [createBaseVNode("span", _hoisted_7, "剩余 " + toDisplayString(remainingText.value), 1), createVNode(_component_el_button, {
				type: "danger",
				plain: "",
				loading: unref(impersonationStore).ending,
				onClick: unref(impersonationStore).end
			}, {
				default: withCtx(() => [..._cache[0] || (_cache[0] = [createTextVNode(" 退出员工视角 ", -1)])]),
				_: 1
			}, 8, ["loading", "onClick"])])])) : createCommentVNode("", true);
		};
	}
}), [["__scopeId", "data-v-8471892e"]]);
//#endregion
//#region src/components/layout/MainLayout.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ml-body" };
var _hoisted_2 = { class: "main-content" };
//#endregion
//#region src/components/layout/MainLayout.vue
var MainLayout_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "MainLayout",
	setup(__props) {
		const route = useRoute();
		const contentClasses = computed(() => ({
			"sales-system": route.path.startsWith("/customer"),
			"message-system": route.path.startsWith("/message")
		}));
		return (_ctx, _cache) => {
			const _component_router_view = resolveComponent("router-view");
			return openBlock(), createElementBlock("div", { class: normalizeClass(["main-layout", {
				"is-message-layout": unref(route).path.startsWith("/message"),
				"is-review-layout": unref(route).path === "/business-review" || unref(route).path.startsWith("/order/review"),
				"is-sales-console-layout": unref(route).path === "/customer/perf-board",
				"is-offboarding-layout": unref(route).path === "/sys-org/resigned-staff" || unref(route).path === "/hrm/resigned-staff"
			}]) }, [
				createVNode(TopNav_default),
				createVNode(ImpersonationBanner_default),
				createBaseVNode("div", _hoisted_1, [createVNode(Sidebar_default), createBaseVNode("div", _hoisted_2, [createVNode(Header_default), createBaseVNode("main", { class: normalizeClass(["content-area", contentClasses.value]) }, [createVNode(_component_router_view, null, {
					default: withCtx(({ Component, route }) => [createVNode(Transition, {
						name: "fade",
						mode: "out-in"
					}, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(Component), { key: route.path }))]),
						_: 2
					}, 1024)]),
					_: 1
				})], 2)])]),
				createVNode(Watermark_default)
			], 2);
		};
	}
}), [["__scopeId", "data-v-724d6d0c"]]);
//#endregion
export { MainLayout_default as default };

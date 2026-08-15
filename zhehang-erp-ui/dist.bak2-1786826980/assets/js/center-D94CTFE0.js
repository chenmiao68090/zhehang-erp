import { $ as createCommentVNode, Dt as renderList, G as Fragment, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, gt as nextTick, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, yt as onBeforeUnmount, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, $t as download_default, At as chat_dot_round_default, Bn as refresh_default, Ct as arrow_left_default, Dr as withModifiers, Dt as briefcase_default, En as mute_notification_default, Er as withKeys, F as ElEmpty, Ft as circle_check_filled_default, I as ElDropdown, L as ElDropdownItem, M as ElInputNumber, Mt as chat_line_square_default, Nn as plus_default, Ot as calendar_default, P as ElImageViewer, Pt as circle_check_default, Q as ElRadioGroup, Qt as document_default, R as ElDropdownMenu, S as ElSkeleton, St as arrow_down_default, T as ElProgress, Tn as more_filled_default, Un as search_default, Ut as connection_default, V as ElDialog, Vt as close_default, W as ElDatePicker, Wt as copy_document_default, Yn as share_default, Z as ElRadioButton, _t as ElFormItem, a as ElMessageBox, cr as top_default, dn as hide_default, et as ElCheckboxGroup, f as ElTimeline, fr as user_default, ft as ElAvatar, gt as ElForm, h as ElTabs, hn as lock_default, in as filter_default, it as ElTag, jn as picture_default, kn as paperclip_default, m as ElTabPane, mn as loading_default, mt as ElInput, nr as sunny_default, nt as ElOption, o as ElMessage, ot as ElButton, p as ElTimelineItem, pn as list_default, pr as user_filled_default, r as ElPopover, rr as switch_button_default, rt as ElSelect, v as ElSwitch, wn as more_default, wt as arrow_right_default, yr as warning_default, yt as ElIcon, z as ElDrawer, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { i as useRouter, r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { i as imApi, l as useUserStore, r as useImStore } from "./index-C4y3JnUs.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as formatImPresence } from "./im-presence-b9dJFRRS.js";
import { n as staffCandidatesApi, t as customerIssueApi } from "./customer-issue-ZVBFkyDD.js";
//#region src/utils/im-message-merge.ts
function serverId(message) {
	if (message.id === null || message.id === void 0 || message.id === "") return "";
	const value = String(message.id);
	return value.startsWith("-") || value === "0" ? "" : value;
}
function clientKey(message) {
	var _message$clientMessag, _message$conversation;
	const clientId = (_message$clientMessag = message.clientMessageId) === null || _message$clientMessag === void 0 ? void 0 : _message$clientMessag.trim();
	if (!clientId) return "";
	return `${String((_message$conversation = message.conversationId) !== null && _message$conversation !== void 0 ? _message$conversation : "")}:${clientId}`;
}
function identities(message) {
	const keys = [];
	const client = clientKey(message);
	const id = serverId(message);
	if (client) keys.push(`client:${client}`);
	if (id) keys.push(`id:${id}`);
	return keys;
}
function mergeRecord(current, incoming) {
	const currentServer = Boolean(serverId(current));
	const incomingServer = Boolean(serverId(incoming));
	const merged = currentServer && !incomingServer ? _objectSpread2(_objectSpread2({}, incoming), current) : _objectSpread2(_objectSpread2({}, current), incoming);
	if (serverId(merged) && merged.status !== "failed") delete merged.error;
	return merged;
}
/**
* 合并本地乐观消息、HTTP ACK、WebSocket、历史分页和断线补拉。
* clientMessageId 是首选身份，正式 messageId 只作兼容兜底。
*/
function mergeImMessages(...groups) {
	const result = [];
	for (const message of groups.flat()) {
		const messageKeys = new Set(identities(message));
		const matches = [];
		result.forEach((existing, index) => {
			if (identities(existing).some((key) => messageKeys.has(key))) matches.push(index);
		});
		if (!matches.length) {
			result.push(message);
			continue;
		}
		const target = matches[0];
		let merged = result[target];
		for (const index of matches.slice(1)) merged = mergeRecord(merged, result[index]);
		merged = mergeRecord(merged, message);
		for (const index of matches.slice(1).sort((a, b) => b - a)) result.splice(index, 1);
		result[target] = merged;
	}
	return result.sort((a, b) => {
		const seqDiff = Number(a.seq || 0) - Number(b.seq || 0);
		if (seqDiff) return seqDiff;
		return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
	});
}
//#endregion
//#region src/components/im/ConversationDetails.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$4 = { class: "im-details" };
var _hoisted_2$4 = { class: "detail-profile" };
var _hoisted_3$3 = { key: 0 };
var _hoisted_4$2 = {
	key: 0,
	class: "business-link"
};
var _hoisted_5$2 = { class: "business-icon" };
var _hoisted_6$2 = { class: "detail-section-head" };
var _hoisted_7$2 = { class: "member-list" };
var _hoisted_8$2 = { class: "avatar-wrap" };
var _hoisted_9$2 = { class: "member-copy" };
var _hoisted_10$2 = {
	key: 0,
	class: "file-list"
};
var _hoisted_11$2 = ["onClick"];
var _hoisted_12$1 = { class: "file-icon" };
var _hoisted_13$1 = { class: "setting-list" };
var _hoisted_14$1 = { class: "setting-select" };
//#endregion
//#region src/components/im/ConversationDetails.vue
var ConversationDetails_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ConversationDetails",
	props: {
		conversation: {},
		members: {},
		files: {},
		preference: {}
	},
	emits: [
		"setting",
		"preference",
		"add-members",
		"leave",
		"download"
	],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const activeTab = ref("members");
		const imStore = useImStore();
		const canManageMembers = computed(() => ["owner", "admin"].includes(props.conversation.memberRole));
		const typeLabel = computed(() => ({
			direct: "单聊",
			group: "普通群",
			department: "部门群",
			business: "业务群",
			announcement: "公告群",
			system: "系统通知"
		})[props.conversation.type] || "会话");
		const businessLabel = computed(() => ({
			customer: "客户",
			lead: "线索",
			order: "提单",
			review: "审单",
			receipt: "收款",
			task: "待办",
			training: "培训"
		})[props.conversation.businessType || ""] || props.conversation.businessType);
		function emitSetting(key, value) {
			emit("setting", key, value);
		}
		function emitPreference(key, value) {
			emit("preference", key, Boolean(value));
		}
		function presenceText(online, lastActiveAt) {
			return formatImPresence(online, lastActiveAt, true, new Date(imStore.presenceClock));
		}
		function formatBytes(size = 0) {
			if (size < 1024) return `${size} B`;
			if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
			return `${(size / 1024 / 1024).toFixed(1)} MB`;
		}
		function formatDate(value) {
			return value ? new Date(value).toLocaleDateString("zh-CN") : "";
		}
		return (_ctx, _cache) => {
			const _component_el_avatar = ElAvatar;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_tag = ElTag;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_empty = ElEmpty;
			const _component_el_switch = ElSwitch;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_tabs = ElTabs;
			return openBlock(), createElementBlock("div", _hoisted_1$4, [
				createBaseVNode("div", _hoisted_2$4, [createVNode(_component_el_avatar, {
					size: 58,
					src: __props.conversation.avatarUrl
				}, {
					default: withCtx(() => {
						var _props$conversation$n;
						return [createTextVNode(toDisplayString((_props$conversation$n = __props.conversation.name) === null || _props$conversation$n === void 0 ? void 0 : _props$conversation$n.slice(0, 1)), 1)];
					}),
					_: 1
				}, 8, ["src"]), createBaseVNode("div", null, [createBaseVNode("h3", null, toDisplayString(__props.conversation.name), 1), createBaseVNode("p", null, [createTextVNode(toDisplayString(typeLabel.value), 1), __props.conversation.memberCount > 2 ? (openBlock(), createElementBlock("span", _hoisted_3$3, " · " + toDisplayString(__props.conversation.memberCount) + " 人", 1)) : createCommentVNode("", true)])])]),
				__props.conversation.businessType ? (openBlock(), createElementBlock("div", _hoisted_4$2, [
					createBaseVNode("div", _hoisted_5$2, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(briefcase_default))]),
						_: 1
					})]),
					createBaseVNode("div", null, [_cache[8] || (_cache[8] = createBaseVNode("small", null, "关联业务", -1)), createBaseVNode("strong", null, toDisplayString(businessLabel.value) + " #" + toDisplayString(__props.conversation.businessId), 1)]),
					createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_right_default))]),
						_: 1
					})
				])) : createCommentVNode("", true),
				createVNode(_component_el_tabs, {
					modelValue: activeTab.value,
					"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => activeTab.value = $event),
					stretch: ""
				}, {
					default: withCtx(() => [
						createVNode(_component_el_tab_pane, {
							label: "成员",
							name: "members"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_6$2, [createBaseVNode("span", null, toDisplayString(__props.members.length) + " 名成员", 1), canManageMembers.value ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								text: "",
								icon: unref(user_filled_default),
								title: "添加成员",
								onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("add-members"))
							}, null, 8, ["icon"])) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_7$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.members, (member) => {
								return openBlock(), createElementBlock("div", {
									key: member.userId,
									class: "member-row"
								}, [
									createBaseVNode("span", _hoisted_8$2, [createVNode(_component_el_avatar, {
										size: 34,
										src: member.avatar
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(member.name.slice(0, 1)), 1)]),
										_: 2
									}, 1032, ["src"]), createBaseVNode("i", { class: normalizeClass({ online: member.online }) }, null, 2)]),
									createBaseVNode("span", _hoisted_9$2, [createBaseVNode("b", null, toDisplayString(member.name), 1), createBaseVNode("small", null, [createTextVNode(toDisplayString(member.deptName || "未设置部门") + " · ", 1), createBaseVNode("em", { class: normalizeClass({ online: member.online }) }, toDisplayString(presenceText(member.online, member.lastActiveAt)), 3)])]),
									member.memberRole !== "member" ? (openBlock(), createBlock(_component_el_tag, {
										key: 0,
										size: "small",
										effect: "plain"
									}, {
										default: withCtx(() => [createTextVNode(toDisplayString(member.memberRole === "owner" ? "群主" : "管理员"), 1)]),
										_: 2
									}, 1024)) : createCommentVNode("", true)
								]);
							}), 128))])]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "文件",
							name: "files"
						}, {
							default: withCtx(() => [__props.files.length ? (openBlock(), createElementBlock("div", _hoisted_10$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.files, (file) => {
								return openBlock(), createElementBlock("button", {
									key: file.id,
									type: "button",
									class: "file-row",
									onClick: ($event) => _ctx.$emit("download", file)
								}, [
									createBaseVNode("span", _hoisted_12$1, [createVNode(_component_el_icon, null, {
										default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(file.image ? unref(picture_default) : unref(document_default))))]),
										_: 2
									}, 1024)]),
									createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(file.originalName), 1), createBaseVNode("small", null, toDisplayString(formatBytes(file.fileSize)) + " · " + toDisplayString(formatDate(file.createdAt)), 1)]),
									createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(download_default))]),
										_: 1
									})
								], 8, _hoisted_11$2);
							}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
								key: 1,
								"image-size": 64,
								description: "暂无共享文件"
							}))]),
							_: 1
						}),
						createVNode(_component_el_tab_pane, {
							label: "设置",
							name: "settings"
						}, {
							default: withCtx(() => [createBaseVNode("div", _hoisted_13$1, [
								createBaseVNode("label", null, [_cache[9] || (_cache[9] = createBaseVNode("span", null, [createBaseVNode("b", null, "置顶会话"), createBaseVNode("small", null, "固定在会话列表顶部")], -1)), createVNode(_component_el_switch, {
									"model-value": __props.conversation.pinned,
									onChange: _cache[1] || (_cache[1] = ($event) => emitSetting("pinned", $event))
								}, null, 8, ["model-value"])]),
								createBaseVNode("label", null, [_cache[10] || (_cache[10] = createBaseVNode("span", null, [createBaseVNode("b", null, "消息免打扰"), createBaseVNode("small", null, "@我仍会进入提醒")], -1)), createVNode(_component_el_switch, {
									"model-value": __props.conversation.muted,
									onChange: _cache[2] || (_cache[2] = ($event) => emitSetting("muted", $event))
								}, null, 8, ["model-value"])]),
								createBaseVNode("label", null, [_cache[11] || (_cache[11] = createBaseVNode("span", null, [createBaseVNode("b", null, "通知声音"), createBaseVNode("small", null, "当前账号的消息提示音")], -1)), createVNode(_component_el_switch, {
									"model-value": __props.preference.soundEnabled,
									onChange: _cache[3] || (_cache[3] = ($event) => emitPreference("soundEnabled", $event))
								}, null, 8, ["model-value"])]),
								createBaseVNode("label", null, [_cache[12] || (_cache[12] = createBaseVNode("span", null, [createBaseVNode("b", null, "浏览器通知"), createBaseVNode("small", null, "页面不活跃时显示")], -1)), createVNode(_component_el_switch, {
									"model-value": __props.preference.browserNotification,
									onChange: _cache[4] || (_cache[4] = ($event) => emitPreference("browserNotification", $event))
								}, null, 8, ["model-value"])]),
								createBaseVNode("div", _hoisted_14$1, [_cache[13] || (_cache[13] = createBaseVNode("span", null, [createBaseVNode("b", null, "会话提醒范围"), createBaseVNode("small", null, "可只接收@消息")], -1)), createVNode(_component_el_select, {
									"model-value": __props.conversation.notificationLevel,
									onChange: _cache[5] || (_cache[5] = ($event) => emitSetting("notificationLevel", $event))
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "全部消息",
											value: "all"
										}),
										createVNode(_component_el_option, {
											label: "仅@我的",
											value: "mention"
										}),
										createVNode(_component_el_option, {
											label: "不提醒",
											value: "none"
										})
									]),
									_: 1
								}, 8, ["model-value"])])
							]), __props.conversation.canLeave ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								class: "leave-button",
								plain: "",
								type: "danger",
								onClick: _cache[6] || (_cache[6] = ($event) => _ctx.$emit("leave"))
							}, {
								default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("退出群聊", -1)])]),
								_: 1
							})) : createCommentVNode("", true)]),
							_: 1
						})
					]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-5fde5665"]]);
//#endregion
//#region src/components/im/BusinessCard.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$3 = { class: "business-card" };
var _hoisted_2$3 = { key: 0 };
//#endregion
//#region src/components/im/BusinessCard.vue
var BusinessCard_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "BusinessCard",
	props: {
		card: {},
		messageText: {}
	},
	emits: ["open"],
	setup(__props) {
		const props = __props;
		const typeLabel = computed(() => ({
			customer: "客户事项",
			lead: "销售线索",
			order: "提单事项",
			review: "审单事项",
			receipt: "收款事项",
			contract: "合同事项",
			issue: "客户问题",
			training: "培训任务"
		})[props.card.businessType || ""] || "业务通知");
		const statusText = computed(() => ({
			pending: "待接单",
			processing: "处理中",
			waiting: "等待反馈",
			completed: "已完成",
			closed: "已关闭",
			rejected: "已驳回",
			reviewing: "待审核",
			pending_finance: "待财务确认",
			confirmed: "已确认",
			pending_assign: "待分配",
			pending_accept: "待接收",
			pending_confirm: "待验收",
			accept_rejected: "资料退回",
			complete_rejected: "验收驳回"
		})[props.card.currentStatus || ""] || props.card.currentStatus || "-");
		const occurredAtText = computed(() => props.card.occurredAt ? new Date(props.card.occurredAt).toLocaleString("zh-CN", { hour12: false }) : "");
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			return openBlock(), createElementBlock("section", _hoisted_1$3, [
				createBaseVNode("header", null, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(briefcase_default))]),
					_: 1
				})]), createBaseVNode("div", null, [createBaseVNode("small", null, toDisplayString(typeLabel.value), 1), createBaseVNode("b", null, toDisplayString(__props.card.title || __props.messageText), 1)])]),
				createBaseVNode("dl", null, [
					__props.card.businessId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[1] || (_cache[1] = createBaseVNode("dt", null, "业务编号", -1)), createBaseVNode("dd", null, "#" + toDisplayString(__props.card.businessId), 1)], 64)) : createCommentVNode("", true),
					__props.card.currentStatus ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [_cache[2] || (_cache[2] = createBaseVNode("dt", null, "当前状态", -1)), createBaseVNode("dd", null, toDisplayString(statusText.value), 1)], 64)) : createCommentVNode("", true),
					__props.card.responsibleName || __props.card.responsibleId ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [_cache[3] || (_cache[3] = createBaseVNode("dt", null, "责任人", -1)), createBaseVNode("dd", null, toDisplayString(__props.card.responsibleName || `员工 #${__props.card.responsibleId}`), 1)], 64)) : createCommentVNode("", true),
					__props.card.operatorName || __props.card.operatorId ? (openBlock(), createElementBlock(Fragment, { key: 3 }, [_cache[4] || (_cache[4] = createBaseVNode("dt", null, "操作人", -1)), createBaseVNode("dd", null, toDisplayString(__props.card.operatorName || `员工 #${__props.card.operatorId}`), 1)], 64)) : createCommentVNode("", true),
					__props.card.occurredAt ? (openBlock(), createElementBlock(Fragment, { key: 4 }, [_cache[5] || (_cache[5] = createBaseVNode("dt", null, "发生时间", -1)), createBaseVNode("dd", null, toDisplayString(occurredAtText.value), 1)], 64)) : createCommentVNode("", true),
					__props.card.requirement ? (openBlock(), createElementBlock(Fragment, { key: 5 }, [_cache[6] || (_cache[6] = createBaseVNode("dt", null, "处理要求", -1)), createBaseVNode("dd", null, toDisplayString(__props.card.requirement), 1)], 64)) : createCommentVNode("", true)
				]),
				createBaseVNode("footer", null, [__props.card.eventId ? (openBlock(), createElementBlock("small", _hoisted_2$3, "事件 " + toDisplayString(__props.card.eventId), 1)) : createCommentVNode("", true), __props.card.actionUrl ? (openBlock(), createBlock(_component_el_button, {
					key: 1,
					type: "primary",
					text: "",
					onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("open", __props.card.actionUrl))
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(__props.card.actionLabel || "去处理"), 1), createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_right_default))]),
						_: 1
					})]),
					_: 1
				})) : createCommentVNode("", true)])
			]);
		};
	}
}), [["__scopeId", "data-v-0a12d055"]]);
//#endregion
//#region src/components/im/TaskCard.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "task-mark" };
var _hoisted_2$2 = { class: "task-meta" };
var _hoisted_3$2 = { key: 0 };
//#endregion
//#region src/components/im/TaskCard.vue
var TaskCard_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "TaskCard",
	props: { task: {} },
	emits: [
		"open",
		"accept",
		"submit",
		"review"
	],
	setup(__props) {
		const props = __props;
		const statusMeta = computed(() => ({
			pending_accept: {
				label: "待接收",
				type: "warning"
			},
			in_progress: {
				label: "进行中",
				type: "primary"
			},
			pending_review: {
				label: "待验收",
				type: "warning"
			},
			completed: {
				label: "已完成",
				type: "success"
			},
			rejected: {
				label: "已驳回",
				type: "danger"
			},
			cancelled: {
				label: "已取消",
				type: "info"
			},
			overdue: {
				label: "已逾期",
				type: "danger"
			}
		})[props.task.status] || {
			label: props.task.status,
			type: "info"
		});
		const responsibleNames = computed(() => {
			const names = props.task.participants.filter((item) => item.role === "responsible").map((item) => item.name);
			return names.length > 2 ? `${names.slice(0, 2).join("、")} 等${names.length}人` : names.join("、") || "未指定";
		});
		const deadlineText = computed(() => new Date(props.task.deadlineAt).toLocaleString("zh-CN", {
			month: "numeric",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false
		}));
		const priorityLabel = computed(() => ({
			urgent: "紧急",
			important: "重要",
			normal: "普通"
		})[props.task.priority]);
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			return openBlock(), createElementBlock("section", {
				class: normalizeClass(["task-card", [`priority-${__props.task.priority}`, { overdue: __props.task.overdue }]]),
				onClick: _cache[5] || (_cache[5] = ($event) => _ctx.$emit("open", __props.task))
			}, [
				createBaseVNode("header", null, [
					createBaseVNode("span", _hoisted_1$2, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(list_default))]),
						_: 1
					})]),
					createBaseVNode("div", null, [_cache[6] || (_cache[6] = createBaseVNode("small", null, "工作待办", -1)), createBaseVNode("b", null, toDisplayString(__props.task.title), 1)]),
					createVNode(_component_el_tag, {
						size: "small",
						type: statusMeta.value.type,
						effect: "light"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(statusMeta.value.label), 1)]),
						_: 1
					}, 8, ["type"])
				]),
				createBaseVNode("div", _hoisted_2$2, [createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(user_filled_default))]),
					_: 1
				}), createTextVNode(toDisplayString(responsibleNames.value), 1)]), createBaseVNode("span", { class: normalizeClass({ late: __props.task.overdue }) }, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(clock_default))]),
					_: 1
				}), createTextVNode(toDisplayString(deadlineText.value), 1)], 2)]),
				__props.task.acceptanceStandard ? (openBlock(), createElementBlock("p", _hoisted_3$2, "验收标准：" + toDisplayString(__props.task.acceptanceStandard), 1)) : createCommentVNode("", true),
				createBaseVNode("footer", null, [createBaseVNode("span", null, toDisplayString(priorityLabel.value), 1), createBaseVNode("div", { onClick: _cache[4] || (_cache[4] = withModifiers(() => {}, ["stop"])) }, [
					__props.task.canAccept ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						size: "small",
						type: "primary",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("accept", __props.task))
					}, {
						default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("接收", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.task.canSubmit ? (openBlock(), createBlock(_component_el_button, {
						key: 1,
						size: "small",
						type: "primary",
						onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("submit", __props.task))
					}, {
						default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("提交完成", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.task.canReview ? (openBlock(), createBlock(_component_el_button, {
						key: 2,
						size: "small",
						type: "success",
						onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("review", __props.task))
					}, {
						default: withCtx(() => [..._cache[9] || (_cache[9] = [createTextVNode("验收", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					createVNode(_component_el_button, {
						size: "small",
						text: "",
						onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("open", __props.task))
					}, {
						default: withCtx(() => [..._cache[10] || (_cache[10] = [createTextVNode("查看详情", -1)])]),
						_: 1
					})
				])])
			], 2);
		};
	}
}), [["__scopeId", "data-v-e69250be"]]);
//#endregion
//#region src/components/im/TaskDetailPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "task-detail-panel" };
var _hoisted_2$1 = { class: "title-line" };
var _hoisted_3$1 = { class: "detail-section" };
var _hoisted_4$1 = { class: "detail-section" };
var _hoisted_5$1 = { class: "long-text" };
var _hoisted_6$1 = {
	key: 0,
	class: "detail-section"
};
var _hoisted_7$1 = {
	key: 1,
	class: "detail-section result-section"
};
var _hoisted_8$1 = { class: "long-text" };
var _hoisted_9$1 = {
	key: 0,
	class: "evidence-list"
};
var _hoisted_10$1 = ["onClick"];
var _hoisted_11$1 = { class: "detail-section timeline-section" };
//#endregion
//#region src/components/im/TaskDetailPanel.vue
var TaskDetailPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "TaskDetailPanel",
	props: { task: {} },
	emits: [
		"source",
		"download",
		"accept",
		"submit",
		"review",
		"cancel"
	],
	setup(__props) {
		const props = __props;
		const statusMeta = computed(() => {
			var _props$task;
			return {
				pending_accept: {
					label: "待接收",
					type: "warning"
				},
				in_progress: {
					label: "进行中",
					type: "primary"
				},
				pending_review: {
					label: "待验收",
					type: "warning"
				},
				completed: {
					label: "已完成",
					type: "success"
				},
				rejected: {
					label: "已驳回",
					type: "danger"
				},
				cancelled: {
					label: "已取消",
					type: "info"
				},
				overdue: {
					label: "已逾期",
					type: "danger"
				}
			}[((_props$task = props.task) === null || _props$task === void 0 ? void 0 : _props$task.status) || "pending_accept"];
		});
		const priorityMeta = computed(() => {
			var _props$task2;
			return {
				urgent: {
					label: "紧急",
					type: "danger"
				},
				important: {
					label: "重要",
					type: "warning"
				},
				normal: {
					label: "普通",
					type: "info"
				}
			}[((_props$task2 = props.task) === null || _props$task2 === void 0 ? void 0 : _props$task2.priority) || "normal"];
		});
		const businessLabel = computed(() => {
			var _props$task3, _props$task4;
			return {
				customer: "客户",
				lead: "线索",
				order: "提单",
				review: "审单",
				receipt: "收款",
				contract: "合同",
				issue: "客户问题",
				training: "培训"
			}[((_props$task3 = props.task) === null || _props$task3 === void 0 ? void 0 : _props$task3.businessType) || ""] || ((_props$task4 = props.task) === null || _props$task4 === void 0 ? void 0 : _props$task4.businessType) || "业务事项";
		});
		function people(role) {
			var _props$task5;
			return ((_props$task5 = props.task) === null || _props$task5 === void 0 ? void 0 : _props$task5.participants.filter((item) => item.role === role).map((item) => item.name).join("、")) || "";
		}
		function formatTime(value) {
			return value ? new Date(value).toLocaleString("zh-CN", { hour12: false }) : "-";
		}
		function actionLabel(action) {
			return {
				created: "创建待办",
				accepted: "接收待办",
				submitted: "提交完成",
				approved: "验收通过",
				rejected: "验收驳回",
				cancelled: "取消待办",
				overdue: "系统标记逾期"
			}[action] || action;
		}
		return (_ctx, _cache) => {
			var _props$task$resultAtt;
			const _component_el_tag = ElTag;
			const _component_el_icon = ElIcon;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_button = ElButton;
			const _component_el_skeleton = ElSkeleton;
			return openBlock(), createElementBlock("div", _hoisted_1$1, [__props.task ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
				createBaseVNode("header", null, [
					createBaseVNode("div", _hoisted_2$1, [createVNode(_component_el_tag, { type: statusMeta.value.type }, {
						default: withCtx(() => [createTextVNode(toDisplayString(statusMeta.value.label), 1)]),
						_: 1
					}, 8, ["type"]), createVNode(_component_el_tag, {
						type: priorityMeta.value.type,
						effect: "plain"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(priorityMeta.value.label), 1)]),
						_: 1
					}, 8, ["type"])]),
					createBaseVNode("h2", null, toDisplayString(__props.task.title), 1),
					createBaseVNode("p", null, "由 " + toDisplayString(__props.task.creatorName) + " 创建 · " + toDisplayString(formatTime(__props.task.createdAt)), 1)
				]),
				createBaseVNode("section", _hoisted_3$1, [_cache[10] || (_cache[10] = createBaseVNode("h3", null, "执行信息", -1)), createBaseVNode("dl", null, [
					_cache[5] || (_cache[5] = createBaseVNode("dt", null, "责任人", -1)),
					createBaseVNode("dd", null, toDisplayString(people("responsible")), 1),
					_cache[6] || (_cache[6] = createBaseVNode("dt", null, "协同人", -1)),
					createBaseVNode("dd", null, toDisplayString(people("collaborator") || "无"), 1),
					_cache[7] || (_cache[7] = createBaseVNode("dt", null, "所属部门", -1)),
					createBaseVNode("dd", null, toDisplayString(__props.task.deptName || "未设置"), 1),
					_cache[8] || (_cache[8] = createBaseVNode("dt", null, "截止时间", -1)),
					createBaseVNode("dd", { class: normalizeClass({ danger: __props.task.overdue }) }, toDisplayString(formatTime(__props.task.deadlineAt)), 3),
					_cache[9] || (_cache[9] = createBaseVNode("dt", null, "验收人", -1)),
					createBaseVNode("dd", null, toDisplayString(__props.task.reviewerName), 1)
				])]),
				createBaseVNode("section", _hoisted_4$1, [_cache[11] || (_cache[11] = createBaseVNode("h3", null, "验收标准", -1)), createBaseVNode("p", _hoisted_5$1, toDisplayString(__props.task.acceptanceStandard), 1)]),
				__props.task.businessType || __props.task.customerId ? (openBlock(), createElementBlock("section", _hoisted_6$1, [_cache[12] || (_cache[12] = createBaseVNode("h3", null, "关联业务", -1)), createBaseVNode("p", null, [
					createTextVNode(toDisplayString(businessLabel.value), 1),
					__props.task.businessId ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" #" + toDisplayString(__props.task.businessId), 1)], 64)) : createCommentVNode("", true),
					__props.task.customerId ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [createTextVNode(" · 客户 #" + toDisplayString(__props.task.customerId), 1)], 64)) : createCommentVNode("", true)
				])])) : createCommentVNode("", true),
				__props.task.resultText || __props.task.rejectReason ? (openBlock(), createElementBlock("section", _hoisted_7$1, [
					createBaseVNode("h3", null, toDisplayString(__props.task.rejectReason ? "驳回原因" : "处理结果"), 1),
					createBaseVNode("p", _hoisted_8$1, toDisplayString(__props.task.rejectReason || __props.task.resultText), 1),
					((_props$task$resultAtt = __props.task.resultAttachments) === null || _props$task$resultAtt === void 0 ? void 0 : _props$task$resultAtt.length) ? (openBlock(), createElementBlock("div", _hoisted_9$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.task.resultAttachments, (file) => {
						return openBlock(), createElementBlock("button", {
							key: file.id,
							type: "button",
							onClick: ($event) => _ctx.$emit("download", file)
						}, [
							createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(document_default))]),
								_: 1
							}),
							createBaseVNode("span", null, toDisplayString(file.originalName), 1),
							createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(download_default))]),
								_: 1
							})
						], 8, _hoisted_10$1);
					}), 128))])) : createCommentVNode("", true)
				])) : createCommentVNode("", true),
				createBaseVNode("section", _hoisted_11$1, [_cache[13] || (_cache[13] = createBaseVNode("h3", null, "处理时间线", -1)), createVNode(_component_el_timeline, null, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.task.timeline || [], (item) => {
						return openBlock(), createBlock(_component_el_timeline_item, {
							key: item.id,
							timestamp: formatTime(item.createdAt),
							placement: "top"
						}, {
							default: withCtx(() => [createBaseVNode("b", null, toDisplayString(actionLabel(item.actionType)), 1), createBaseVNode("p", null, [createTextVNode(toDisplayString(item.operatorName), 1), item.comment ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · " + toDisplayString(item.comment), 1)], 64)) : createCommentVNode("", true)])]),
							_: 2
						}, 1032, ["timestamp"]);
					}), 128))]),
					_: 1
				})]),
				createBaseVNode("footer", null, [
					createVNode(_component_el_button, {
						text: "",
						onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("source", __props.task.sourceMessageId))
					}, {
						default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("查看来源消息", -1)])]),
						_: 1
					}),
					_cache[19] || (_cache[19] = createBaseVNode("span", null, null, -1)),
					__props.task.canCancel ? (openBlock(), createBlock(_component_el_button, {
						key: 0,
						type: "danger",
						plain: "",
						onClick: _cache[1] || (_cache[1] = ($event) => _ctx.$emit("cancel", __props.task))
					}, {
						default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("取消待办", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.task.canAccept ? (openBlock(), createBlock(_component_el_button, {
						key: 1,
						type: "primary",
						onClick: _cache[2] || (_cache[2] = ($event) => _ctx.$emit("accept", __props.task))
					}, {
						default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("接收待办", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.task.canSubmit ? (openBlock(), createBlock(_component_el_button, {
						key: 2,
						type: "primary",
						onClick: _cache[3] || (_cache[3] = ($event) => _ctx.$emit("submit", __props.task))
					}, {
						default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("提交完成", -1)])]),
						_: 1
					})) : createCommentVNode("", true),
					__props.task.canReview ? (openBlock(), createBlock(_component_el_button, {
						key: 3,
						type: "success",
						onClick: _cache[4] || (_cache[4] = ($event) => _ctx.$emit("review", __props.task))
					}, {
						default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("验收处理", -1)])]),
						_: 1
					})) : createCommentVNode("", true)
				])
			], 64)) : (openBlock(), createBlock(_component_el_skeleton, {
				key: 1,
				rows: 8,
				animated: ""
			}))]);
		};
	}
}), [["__scopeId", "data-v-61fea86e"]]);
//#endregion
//#region src/views/message/center.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "conversation-pane" };
var _hoisted_2 = { class: "conversation-head" };
var _hoisted_3 = { class: "conversation-title-row" };
var _hoisted_4 = { class: "conversation-create-actions" };
var _hoisted_5 = { class: "filter-strip" };
var _hoisted_6 = ["onClick"];
var _hoisted_7 = { key: 0 };
var _hoisted_8 = {
	key: 0,
	class: "quick-contact-results"
};
var _hoisted_9 = ["onClick"];
var _hoisted_10 = { class: "quick-contact-avatar" };
var _hoisted_11 = { class: "quick-contact-copy" };
var _hoisted_12 = ["onClick"];
var _hoisted_13 = { class: "conversation-avatar-wrap" };
var _hoisted_14 = { class: "conversation-copy" };
var _hoisted_15 = { class: "conversation-name-line" };
var _hoisted_16 = { class: "conversation-preview-line" };
var _hoisted_17 = { key: 0 };
var _hoisted_18 = { key: 1 };
var _hoisted_19 = { key: 4 };
var _hoisted_20 = { key: 5 };
var _hoisted_21 = {
	key: 0,
	class: "business-chip"
};
var _hoisted_22 = {
	type: "button",
	title: "会话操作"
};
var _hoisted_23 = {
	key: 1,
	class: "list-loading"
};
var _hoisted_24 = { class: "chat-pane" };
var _hoisted_25 = { class: "chat-head" };
var _hoisted_26 = { class: "chat-avatar-wrap" };
var _hoisted_27 = { class: "chat-head-copy" };
var _hoisted_28 = { key: 0 };
var _hoisted_29 = { key: 2 };
var _hoisted_30 = { class: "chat-head-actions" };
var _hoisted_31 = { class: "message-list" };
var _hoisted_32 = ["disabled"];
var _hoisted_33 = {
	key: 1,
	class: "history-start"
};
var _hoisted_34 = {
	key: 2,
	class: "message-state"
};
var _hoisted_35 = {
	key: 3,
	class: "message-state error"
};
var _hoisted_36 = {
	key: 4,
	class: "message-state empty"
};
var _hoisted_37 = {
	key: 0,
	class: "date-divider"
};
var _hoisted_38 = {
	key: 1,
	class: "unread-divider"
};
var _hoisted_39 = [
	"id",
	"data-message-seq",
	"onContextmenu"
];
var _hoisted_40 = { class: "message-column" };
var _hoisted_41 = { class: "message-meta" };
var _hoisted_42 = {
	key: 0,
	class: "forward-source"
};
var _hoisted_43 = ["onClick"];
var _hoisted_44 = {
	key: 2,
	class: "message-text"
};
var _hoisted_45 = {
	key: 5,
	class: "attachment-grid"
};
var _hoisted_46 = ["onClick"];
var _hoisted_47 = ["src", "alt"];
var _hoisted_48 = { key: 1 };
var _hoisted_49 = ["onClick"];
var _hoisted_50 = { class: "file-type" };
var _hoisted_51 = {
	key: 6,
	class: "edited-label"
};
var _hoisted_52 = {
	key: 0,
	class: "reaction-list"
};
var _hoisted_53 = ["title", "onClick"];
var _hoisted_54 = {
	key: 1,
	class: "delivery-status"
};
var _hoisted_55 = ["onClick"];
var _hoisted_56 = { key: 1 };
var _hoisted_57 = ["disabled", "onClick"];
var _hoisted_58 = {
	key: 2,
	class: "message-actions"
};
var _hoisted_59 = {
	key: 0,
	class: "offline-notice"
};
var _hoisted_60 = {
	key: 1,
	class: "composer-reply"
};
var _hoisted_61 = {
	key: 2,
	class: "upload-queue"
};
var _hoisted_62 = { class: "upload-file-icon" };
var _hoisted_63 = { class: "composer-toolbar" };
var _hoisted_64 = { class: "emoji-grid" };
var _hoisted_65 = ["onClick"];
var _hoisted_66 = { class: "composer-main" };
var _hoisted_67 = {
	key: 3,
	class: "mention-picker"
};
var _hoisted_68 = ["onClick"];
var _hoisted_69 = {
	key: 1,
	class: "conversation-readonly"
};
var _hoisted_70 = {
	key: 1,
	class: "chat-empty"
};
var _hoisted_71 = { class: "chat-empty-icon" };
var _hoisted_72 = {
	key: 0,
	class: "details-pane"
};
var _hoisted_73 = { class: "contact-picker" };
var _hoisted_74 = ["onClick"];
var _hoisted_75 = { class: "avatar-wrap" };
var _hoisted_76 = { class: "contact-picker compact" };
var _hoisted_77 = ["onClick"];
var _hoisted_78 = { class: "avatar-wrap" };
var _hoisted_79 = { class: "search-result-list" };
var _hoisted_80 = ["onClick"];
var _hoisted_81 = { class: "receipt-users" };
var _hoisted_82 = { class: "receipt-users" };
var _hoisted_83 = { class: "forward-list" };
var _hoisted_84 = ["onClick"];
var _hoisted_85 = {
	key: 0,
	class: "task-source-preview"
};
var _hoisted_86 = { class: "task-form-grid" };
var _hoisted_87 = { class: "business-form-row" };
var _hoisted_88 = {
	key: 0,
	class: "task-source-preview"
};
var _hoisted_89 = { class: "issue-form-row" };
var _hoisted_90 = { class: "task-board-toolbar" };
var _hoisted_91 = { class: "task-stats-strip" };
var _hoisted_92 = { class: "danger" };
var _hoisted_93 = { class: "task-board-list" };
var _hoisted_94 = {
	key: 0,
	class: "task-evidence-upload"
};
//#endregion
//#region src/views/message/center.vue
var center_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "center",
	setup(__props) {
		const route = useRoute();
		const router = useRouter();
		const imStore = useImStore();
		const userStore = useUserStore();
		const conversations = ref([]);
		const activeConversation = ref(null);
		const members = ref([]);
		const messages = ref([]);
		const conversationCursor = ref();
		const conversationHasMore = ref(false);
		const conversationLoading = ref(false);
		const messageLoading = ref(false);
		const messageLoadError = ref("");
		const hasEarlierMessages = ref(false);
		const activeFilter = ref(String(route.query.filter || "all"));
		const conversationKeyword = ref("");
		const quickContacts = ref([]);
		const initialLastReadSeq = ref(0);
		const highlightedMessageId = ref();
		const newMessageCount = ref(0);
		const mobilePane = ref("list");
		const detailsDrawer = ref(false);
		const peerContact = computed(() => members.value.find((member) => {
			var _activeConversation$v;
			return Number(member.userId) === Number((_activeConversation$v = activeConversation.value) === null || _activeConversation$v === void 0 ? void 0 : _activeConversation$v.peerUserId);
		}));
		const peerOnline = computed(() => {
			var _activeConversation$v2, _peerContact$value$on, _peerContact$value, _activeConversation$v3;
			return ((_activeConversation$v2 = activeConversation.value) === null || _activeConversation$v2 === void 0 ? void 0 : _activeConversation$v2.type) === "direct" && Boolean((_peerContact$value$on = (_peerContact$value = peerContact.value) === null || _peerContact$value === void 0 ? void 0 : _peerContact$value.online) !== null && _peerContact$value$on !== void 0 ? _peerContact$value$on : (_activeConversation$v3 = activeConversation.value) === null || _activeConversation$v3 === void 0 ? void 0 : _activeConversation$v3.peerOnline);
		});
		const peerLastActiveAt = computed(() => {
			var _peerContact$value2, _activeConversation$v4;
			return ((_peerContact$value2 = peerContact.value) === null || _peerContact$value2 === void 0 ? void 0 : _peerContact$value2.lastActiveAt) || ((_activeConversation$v4 = activeConversation.value) === null || _activeConversation$v4 === void 0 ? void 0 : _activeConversation$v4.peerLastActiveAt);
		});
		const peerPresenceText = computed(() => presenceText(peerOnline.value, peerLastActiveAt.value));
		const conversationReadOnly = computed(() => {
			var _activeConversation$v5;
			return ((_activeConversation$v5 = activeConversation.value) === null || _activeConversation$v5 === void 0 ? void 0 : _activeConversation$v5.type) === "system";
		});
		const conversationListRef = ref();
		const messageScroller = ref();
		const composerInput = ref();
		const imageInput = ref();
		const fileInput = ref();
		const taskSubmitFileInput = ref();
		const draftText = ref("");
		const sending = ref(false);
		const replyMessage = ref(null);
		const selectedMentions = ref([]);
		const mentionAll = ref(false);
		const mentionPickerVisible = ref(false);
		const mentionKeyword = ref("");
		const emojiVisible = ref(false);
		const composerDragging = ref(false);
		const uploadQueue = ref([]);
		const failedPayloads = /* @__PURE__ */ new Map();
		const presenceByUser = /* @__PURE__ */ new Map();
		const attachmentUrls = reactive({});
		let conversationSearchTimer;
		let draftSaveTimer;
		let missingMessageTimer;
		let conversationRefreshTimer;
		let visibleReadTimer;
		let readReportInFlight = false;
		let pendingReadSeq = 0;
		let pendingReadConversationId = 0;
		let suppressDraftPersistence = false;
		let conversationLoadVersion = 0;
		const primaryFilters = [
			{
				key: "all",
				label: "全部"
			},
			{
				key: "unread",
				label: "未读"
			},
			{
				key: "mention",
				label: "@我"
			},
			{
				key: "important",
				label: "重要"
			}
		];
		const moreFilters = [
			{
				key: "todo",
				label: "待办消息"
			},
			{
				key: "direct",
				label: "单聊"
			},
			{
				key: "group",
				label: "群聊"
			},
			{
				key: "department",
				label: "部门群"
			},
			{
				key: "business",
				label: "业务群"
			},
			{
				key: "announcement",
				label: "公告"
			},
			{
				key: "system",
				label: "系统通知"
			}
		];
		const emojis = [
			"😀",
			"😄",
			"👍",
			"👌",
			"🙏",
			"🎉",
			"✅",
			"📌",
			"💪",
			"👀",
			"❤️",
			"🤝",
			"⚠️",
			"🔥",
			"💡",
			"📣"
		];
		const canSend = computed(() => !conversationReadOnly.value && !sending.value && !uploadQueue.value.some((item) => item.status === "uploading") && (draftText.value.trim() || uploadQueue.value.some((item) => item.status === "done")));
		const filteredMentionMembers = computed(() => {
			const keyword = mentionKeyword.value.trim().toLowerCase();
			return members.value.filter((member) => {
				var _userStore$userInfo;
				return member.userId !== Number((_userStore$userInfo = userStore.userInfo) === null || _userStore$userInfo === void 0 ? void 0 : _userStore$userInfo.id);
			}).filter((member) => !keyword || `${member.name} ${member.deptName || ""} ${member.empCode || ""}`.toLowerCase().includes(keyword));
		});
		const conversationFiles = computed(() => {
			const seen = /* @__PURE__ */ new Set();
			return messages.value.flatMap((message) => message.attachments || []).filter((file) => !seen.has(file.id) && seen.add(file.id)).slice().reverse();
		});
		const latestTaskSource = computed(() => [...messages.value].reverse().find((message) => message.id > 0 && !message.recalled && message.messageType !== "task") || null);
		const taskDepartmentOptions = computed(() => {
			const map = /* @__PURE__ */ new Map();
			members.value.forEach((member) => {
				if (member.deptId && member.deptName) map.set(member.deptId, member.deptName);
			});
			return Array.from(map, ([id, name]) => ({
				id,
				name
			}));
		});
		const connectionText = computed(() => ({
			connected: "实时在线",
			connecting: "正在连接",
			reconnecting: "正在重连",
			offline: "离线",
			idle: "准备连接"
		})[imStore.connectionState]);
		const createDialog = reactive({
			visible: false,
			mode: "direct",
			name: "",
			selected: [],
			loading: false
		});
		const contacts = ref([]);
		const contactKeyword = ref("");
		const addMemberDialog = ref(false);
		const addMemberSelected = ref([]);
		const availableAddMembers = computed(() => contacts.value.filter((contact) => !members.value.some((member) => member.userId === contact.userId)));
		const messageSearch = reactive({
			visible: false,
			keyword: "",
			results: [],
			loading: false,
			searched: false
		});
		const receiptDialog = reactive({
			visible: false,
			data: null
		});
		const forwardDialog = reactive({
			visible: false,
			message: null,
			targetId: 0,
			keyword: ""
		});
		const forwardTargets = computed(() => conversations.value.filter((c) => {
			var _forwardDialog$messag;
			return c.id !== ((_forwardDialog$messag = forwardDialog.message) === null || _forwardDialog$messag === void 0 ? void 0 : _forwardDialog$messag.conversationId) && (!forwardDialog.keyword || c.name.includes(forwardDialog.keyword));
		}));
		const imagePreview = reactive({
			visible: false,
			url: "",
			name: ""
		});
		const emptyTaskStats = () => ({
			pendingAccept: 0,
			inProgress: 0,
			pendingReview: 0,
			completed: 0,
			rejected: 0,
			overdue: 0
		});
		const taskCreate = reactive({
			visible: false,
			source: null,
			title: "",
			responsibleIds: [],
			collaboratorIds: [],
			deptId: void 0,
			priority: "normal",
			deadlineAt: "",
			reminderRules: [
				"before_2h",
				"due",
				"overdue_1h"
			],
			customerId: void 0,
			businessType: "",
			businessId: void 0,
			acceptanceStandard: "",
			loading: false
		});
		const messageCtx = reactive({
			visible: false,
			x: 0,
			y: 0,
			message: null
		});
		const issueCreate = reactive({
			visible: false,
			source: null,
			description: "",
			ownerId: void 0,
			deadline: "",
			priority: "P2",
			customerName: "",
			loading: false
		});
		const issueStaffCandidates = ref([]);
		const canCreateIssue = computed(() => {
			var _issueCreate$source;
			return Boolean(((_issueCreate$source = issueCreate.source) === null || _issueCreate$source === void 0 ? void 0 : _issueCreate$source.id) && issueCreate.description.trim() && issueCreate.ownerId && issueCreate.deadline);
		});
		const taskBoard = reactive({
			visible: false,
			scope: "all_mine",
			state: "all",
			items: [],
			cursor: void 0,
			hasMore: false,
			loading: false,
			stats: emptyTaskStats()
		});
		const taskDetail = reactive({
			visible: false,
			data: null
		});
		const taskSubmit = reactive({
			visible: false,
			task: null,
			result: "",
			uploads: [],
			loading: false
		});
		const taskReview = reactive({
			visible: false,
			task: null,
			pass: true,
			comment: "",
			loading: false
		});
		const canCreateTask = computed(() => {
			var _taskCreate$source;
			return Boolean(((_taskCreate$source = taskCreate.source) === null || _taskCreate$source === void 0 ? void 0 : _taskCreate$source.id) && taskCreate.title.trim() && taskCreate.responsibleIds.length && taskCreate.deadlineAt && taskCreate.acceptanceStandard.trim());
		});
		const canSubmitTaskResult = computed(() => Boolean(taskSubmit.result.trim() && !taskSubmit.uploads.some((item) => item.status === "uploading") && !taskSubmit.loading));
		const taskScopeOptions = computed(() => {
			var _userStore$userInfo2;
			const options = [
				{
					value: "all_mine",
					label: "与我相关"
				},
				{
					value: "responsible",
					label: "我负责"
				},
				{
					value: "created",
					label: "我创建"
				},
				{
					value: "participating",
					label: "我参与"
				}
			];
			const roles = userStore.roles || [];
			if (roles.some((role) => ["manager", "dept_manager"].includes(role))) options.push({
				value: "department",
				label: "本部门"
			});
			if (roles.some((role) => [
				"admin",
				"super_admin",
				"boss"
			].includes(role)) || Number((_userStore$userInfo2 = userStore.userInfo) === null || _userStore$userInfo2 === void 0 ? void 0 : _userStore$userInfo2.id) === 1) options.push({
				value: "company",
				label: "全公司"
			});
			return options;
		});
		const taskStateOptions = [
			{
				value: "all",
				label: "全部状态"
			},
			{
				value: "pending_accept",
				label: "待接收"
			},
			{
				value: "in_progress",
				label: "进行中"
			},
			{
				value: "pending_review",
				label: "待验收"
			},
			{
				value: "overdue",
				label: "已逾期"
			},
			{
				value: "rejected",
				label: "已驳回"
			},
			{
				value: "completed",
				label: "已完成"
			},
			{
				value: "cancelled",
				label: "已取消"
			}
		];
		const businessTypes = [
			{
				value: "customer",
				label: "客户"
			},
			{
				value: "lead",
				label: "线索"
			},
			{
				value: "order",
				label: "提单"
			},
			{
				value: "review",
				label: "审单"
			},
			{
				value: "receipt",
				label: "收款"
			},
			{
				value: "contract",
				label: "合同"
			},
			{
				value: "issue",
				label: "客户问题"
			},
			{
				value: "training",
				label: "培训"
			}
		];
		onMounted(_asyncToGenerator(function* () {
			yield imStore.initialize();
			yield loadConversations(true);
			const requested = Number(route.query.conversationId);
			if (requested) {
				const found = conversations.value.find((c) => c.id === requested);
				if (found) yield selectConversation(found);
				else try {
					const { data } = yield imApi.conversation(requested);
					yield selectConversation(data);
				} catch (_unused) {}
			}
			window.addEventListener("zhehang-im-event", handleRealtimeEvent);
			window.addEventListener("focus", scheduleVisibleRead);
			document.addEventListener("visibilitychange", scheduleVisibleRead);
			document.addEventListener("click", closeMessageContextMenu);
			missingMessageTimer = window.setInterval(() => {
				if (imStore.connectionState !== "connected") syncMissingMessages().catch(() => {});
			}, 1e4);
		}));
		onBeforeUnmount(() => {
			window.removeEventListener("zhehang-im-event", handleRealtimeEvent);
			window.removeEventListener("focus", scheduleVisibleRead);
			document.removeEventListener("visibilitychange", scheduleVisibleRead);
			document.removeEventListener("click", closeMessageContextMenu);
			if (conversationSearchTimer) window.clearTimeout(conversationSearchTimer);
			if (draftSaveTimer) window.clearTimeout(draftSaveTimer);
			if (missingMessageTimer) window.clearInterval(missingMessageTimer);
			if (conversationRefreshTimer) window.clearTimeout(conversationRefreshTimer);
			if (visibleReadTimer) window.clearTimeout(visibleReadTimer);
			Object.values(attachmentUrls).forEach((url) => URL.revokeObjectURL(url));
			if (imagePreview.url) URL.revokeObjectURL(imagePreview.url);
		});
		watch(draftText, () => {
			var _composerInput$value;
			if (!activeConversation.value || suppressDraftPersistence) return;
			if (draftSaveTimer) window.clearTimeout(draftSaveTimer);
			draftSaveTimer = window.setTimeout(saveDraft, 800);
			const match = draftText.value.slice(0, ((_composerInput$value = composerInput.value) === null || _composerInput$value === void 0 || (_composerInput$value = _composerInput$value.textarea) === null || _composerInput$value === void 0 ? void 0 : _composerInput$value.selectionStart) || draftText.value.length).match(/(?:^|\s)@([^\s@]*)$/);
			if (match) {
				mentionKeyword.value = match[1] || "";
				mentionPickerVisible.value = true;
			}
		});
		watch(() => route.query.filter, (value) => {
			const next = String(value || "all");
			if (next !== activeFilter.value) {
				activeFilter.value = next;
				loadConversations(true);
			}
		});
		watch(() => [...taskCreate.responsibleIds], (ids) => {
			taskCreate.collaboratorIds = taskCreate.collaboratorIds.filter((id) => !ids.includes(id));
			const first = members.value.find((member) => member.userId === ids[0]);
			if (first === null || first === void 0 ? void 0 : first.deptId) taskCreate.deptId = first.deptId;
		});
		function loadConversations() {
			return _loadConversations.apply(this, arguments);
		}
		function _loadConversations() {
			_loadConversations = _asyncToGenerator(function* (reset = false) {
				if (conversationLoading.value || !reset && !conversationHasMore.value) return;
				conversationLoading.value = true;
				try {
					if (reset) conversationCursor.value = void 0;
					const { data } = yield imApi.conversations({
						filter: activeFilter.value,
						keyword: conversationKeyword.value.trim() || void 0,
						cursor: conversationCursor.value,
						pageSize: 40
					});
					const items = data.items.map(withKnownConversationPresence);
					conversations.value = reset ? items : mergeConversations(conversations.value, items);
					if (reset && activeConversation.value) {
						const refreshedActive = conversations.value.find((item) => {
							var _activeConversation$v6;
							return item.id === ((_activeConversation$v6 = activeConversation.value) === null || _activeConversation$v6 === void 0 ? void 0 : _activeConversation$v6.id);
						});
						if (refreshedActive) activeConversation.value = _objectSpread2(_objectSpread2({}, activeConversation.value), refreshedActive);
					}
					conversationCursor.value = data.nextCursor;
					conversationHasMore.value = data.hasMore;
				} finally {
					conversationLoading.value = false;
				}
			});
			return _loadConversations.apply(this, arguments);
		}
		function mergeConversations(base, incoming) {
			const map = new Map(base.map((item) => [item.id, item]));
			incoming.forEach((item) => map.set(item.id, item));
			return Array.from(map.values());
		}
		function scheduleConversationSearch() {
			if (conversationSearchTimer) window.clearTimeout(conversationSearchTimer);
			conversationSearchTimer = window.setTimeout(_asyncToGenerator(function* () {
				yield loadConversations(true);
				if (conversationKeyword.value.trim()) try {
					quickContacts.value = (yield imApi.contacts({
						keyword: conversationKeyword.value.trim(),
						limit: 8
					})).data.map(withKnownContactPresence);
				} catch (_unused2) {
					quickContacts.value = [];
				}
				else quickContacts.value = [];
			}), 320);
		}
		function startDirectFromSearch(_x) {
			return _startDirectFromSearch.apply(this, arguments);
		}
		function _startDirectFromSearch() {
			_startDirectFromSearch = _asyncToGenerator(function* (contact) {
				const { data } = yield imApi.createDirect(contact.userId);
				conversationKeyword.value = "";
				quickContacts.value = [];
				yield loadConversations(true);
				yield selectConversation(data);
			});
			return _startDirectFromSearch.apply(this, arguments);
		}
		function changeFilter(filter) {
			activeFilter.value = filter;
			router.replace({ query: _objectSpread2(_objectSpread2({}, route.query), {}, { filter: filter === "all" ? void 0 : filter }) });
			loadConversations(true);
		}
		function onConversationScroll() {
			const el = conversationListRef.value;
			if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 160) loadConversations(false);
		}
		function selectConversation(_x2) {
			return _selectConversation.apply(this, arguments);
		}
		function _selectConversation() {
			_selectConversation = _asyncToGenerator(function* (conversation) {
				var _activeConversation$v7;
				conversation = withKnownConversationPresence(conversation);
				if (((_activeConversation$v7 = activeConversation.value) === null || _activeConversation$v7 === void 0 ? void 0 : _activeConversation$v7.id) === conversation.id) {
					mobilePane.value = "chat";
					if (!messages.value.length && !messageLoading.value) yield retryActiveConversation();
					return;
				}
				const loadVersion = ++conversationLoadVersion;
				activeConversation.value = _objectSpread2({}, conversation);
				mobilePane.value = "chat";
				initialLastReadSeq.value = conversation.lastReadSeq || 0;
				draftText.value = conversation.draft || "";
				replyMessage.value = null;
				selectedMentions.value = [];
				mentionAll.value = false;
				messages.value = [];
				members.value = [];
				hasEarlierMessages.value = false;
				messageLoadError.value = "";
				newMessageCount.value = 0;
				router.replace({ query: _objectSpread2(_objectSpread2({}, route.query), {}, { conversationId: String(conversation.id) }) });
				yield Promise.allSettled([loadInitialMessages(conversation.id, loadVersion), loadMembers(conversation.id, loadVersion)]);
			});
			return _selectConversation.apply(this, arguments);
		}
		function backToConversationList() {
			mobilePane.value = "list";
			router.replace({ query: _objectSpread2(_objectSpread2({}, route.query), {}, { conversationId: void 0 }) });
		}
		function retryActiveConversation() {
			return _retryActiveConversation.apply(this, arguments);
		}
		function _retryActiveConversation() {
			_retryActiveConversation = _asyncToGenerator(function* () {
				var _activeConversation$v8;
				const conversationId = (_activeConversation$v8 = activeConversation.value) === null || _activeConversation$v8 === void 0 ? void 0 : _activeConversation$v8.id;
				if (!conversationId || messageLoading.value) return;
				const loadVersion = ++conversationLoadVersion;
				messageLoadError.value = "";
				yield Promise.allSettled([loadInitialMessages(conversationId, loadVersion), loadMembers(conversationId, loadVersion)]);
				scheduleConversationRefresh();
			});
			return _retryActiveConversation.apply(this, arguments);
		}
		function loadInitialMessages(_x3, _x4) {
			return _loadInitialMessages.apply(this, arguments);
		}
		function _loadInitialMessages() {
			_loadInitialMessages = _asyncToGenerator(function* (conversationId, loadVersion) {
				messageLoading.value = true;
				messageLoadError.value = "";
				try {
					const { data } = yield imApi.messages(conversationId, { pageSize: 50 });
					if (!isCurrentConversationLoad(conversationId, loadVersion)) return;
					messages.value = mergeImMessages(data.items.map(normalizeMine));
					hasEarlierMessages.value = data.hasMore;
					yield nextTick();
					yield hydrateAttachmentUrls(messages.value);
					const firstUnread = messages.value.find((message) => message.seq > initialLastReadSeq.value && !isMine(message));
					if (firstUnread) jumpToMessage(firstUnread.id, false);
					else scrollToBottom(false);
					yield markVisibleRead(conversationId);
					if (!messages.value.length) scheduleConversationRefresh();
				} catch (_unused3) {
					if (isCurrentConversationLoad(conversationId, loadVersion)) messageLoadError.value = "暂时无法取得消息记录，请稍后重试";
				} finally {
					if (isCurrentConversationLoad(conversationId, loadVersion)) messageLoading.value = false;
				}
			});
			return _loadInitialMessages.apply(this, arguments);
		}
		function loadEarlierMessages() {
			return _loadEarlierMessages.apply(this, arguments);
		}
		function _loadEarlierMessages() {
			_loadEarlierMessages = _asyncToGenerator(function* () {
				if (!activeConversation.value || !messages.value.length || messageLoading.value) return;
				const conversationId = activeConversation.value.id;
				const loadVersion = conversationLoadVersion;
				const scroller = messageScroller.value;
				const previousHeight = (scroller === null || scroller === void 0 ? void 0 : scroller.scrollHeight) || 0;
				const before = messages.value[0].seq;
				messageLoading.value = true;
				try {
					const { data } = yield imApi.messages(conversationId, {
						beforeSeq: before,
						pageSize: 50
					});
					if (!isCurrentConversationLoad(conversationId, loadVersion)) return;
					messages.value = mergeImMessages(data.items.map(normalizeMine), messages.value);
					hasEarlierMessages.value = data.hasMore;
					yield nextTick();
					if (scroller) scroller.scrollTop += scroller.scrollHeight - previousHeight;
					hydrateAttachmentUrls(data.items);
				} finally {
					if (isCurrentConversationLoad(conversationId, loadVersion)) messageLoading.value = false;
				}
			});
			return _loadEarlierMessages.apply(this, arguments);
		}
		function syncMissingMessages() {
			return _syncMissingMessages.apply(this, arguments);
		}
		function _syncMissingMessages() {
			_syncMissingMessages = _asyncToGenerator(function* () {
				var _messages$value$at;
				if (!activeConversation.value) return;
				const conversationId = activeConversation.value.id;
				const loadVersion = conversationLoadVersion;
				const lastSeq = ((_messages$value$at = messages.value.at(-1)) === null || _messages$value$at === void 0 ? void 0 : _messages$value$at.seq) || 0;
				const { data } = yield imApi.messages(conversationId, {
					afterSeq: lastSeq,
					pageSize: 100
				});
				if (!isCurrentConversationLoad(conversationId, loadVersion)) return;
				if (data.items.length) {
					const atBottom = isNearBottom();
					messages.value = mergeImMessages(messages.value, data.items.map(normalizeMine));
					yield nextTick();
					hydrateAttachmentUrls(data.items);
					if (atBottom) {
						scrollToBottom(false);
						markVisibleRead();
					} else newMessageCount.value += data.items.length;
				}
			});
			return _syncMissingMessages.apply(this, arguments);
		}
		function reloadLatestMessages() {
			return _reloadLatestMessages.apply(this, arguments);
		}
		function _reloadLatestMessages() {
			_reloadLatestMessages = _asyncToGenerator(function* () {
				if (!activeConversation.value) return;
				const conversationId = activeConversation.value.id;
				const loadVersion = conversationLoadVersion;
				const { data } = yield imApi.messages(conversationId, { pageSize: 50 });
				if (!isCurrentConversationLoad(conversationId, loadVersion)) return;
				messages.value = mergeImMessages(messages.value, data.items.map(normalizeMine));
				hydrateAttachmentUrls(data.items);
			});
			return _reloadLatestMessages.apply(this, arguments);
		}
		function loadMembers() {
			return _loadMembers.apply(this, arguments);
		}
		function _loadMembers() {
			_loadMembers = _asyncToGenerator(function* (conversationId = (() => {
				var _activeConversation$v9;
				return (_activeConversation$v9 = activeConversation.value) === null || _activeConversation$v9 === void 0 ? void 0 : _activeConversation$v9.id;
			})(), loadVersion = conversationLoadVersion) {
				if (!conversationId) return;
				try {
					const { data } = yield imApi.members(conversationId);
					if (isCurrentConversationLoad(conversationId, loadVersion)) members.value = data.map(withKnownContactPresence);
				} catch (_unused4) {
					if (isCurrentConversationLoad(conversationId, loadVersion)) members.value = [];
				}
			});
			return _loadMembers.apply(this, arguments);
		}
		function markVisibleRead() {
			return _markVisibleRead.apply(this, arguments);
		}
		function _markVisibleRead() {
			_markVisibleRead = _asyncToGenerator(function* (conversationId = (() => {
				var _activeConversation$v10;
				return (_activeConversation$v10 = activeConversation.value) === null || _activeConversation$v10 === void 0 ? void 0 : _activeConversation$v10.id;
			})()) {
				var _activeConversation$v11;
				if (!conversationId || ((_activeConversation$v11 = activeConversation.value) === null || _activeConversation$v11 === void 0 ? void 0 : _activeConversation$v11.id) !== conversationId || !messages.value.length) return;
				if (document.visibilityState !== "visible" || !document.hasFocus()) return;
				const seq = highestVisibleMessageSeq();
				if (!seq) return;
				if (seq <= (activeConversation.value.lastReadSeq || 0) && !activeConversation.value.manualUnreadSeq) return;
				if (pendingReadConversationId !== conversationId) pendingReadSeq = 0;
				pendingReadConversationId = conversationId;
				pendingReadSeq = Math.max(pendingReadSeq, seq);
				if (readReportInFlight) return;
				readReportInFlight = true;
				try {
					while (pendingReadSeq > 0 && pendingReadConversationId === conversationId) {
						var _activeConversation$v12;
						const targetSeq = pendingReadSeq;
						pendingReadSeq = 0;
						yield imApi.read(conversationId, targetSeq);
						if (((_activeConversation$v12 = activeConversation.value) === null || _activeConversation$v12 === void 0 ? void 0 : _activeConversation$v12.id) !== conversationId) return;
						activeConversation.value.lastReadSeq = Math.max(activeConversation.value.lastReadSeq || 0, targetSeq);
						activeConversation.value.manualUnreadSeq = 0;
						const reachedLatest = targetSeq >= activeConversation.value.lastSeq;
						if (reachedLatest) {
							activeConversation.value.unreadCount = 0;
							activeConversation.value.mentionCount = 0;
						}
						const row = conversations.value.find((c) => c.id === conversationId);
						if (row) Object.assign(row, {
							lastReadSeq: activeConversation.value.lastReadSeq,
							manualUnreadSeq: 0,
							unreadCount: reachedLatest ? 0 : row.unreadCount,
							mentionCount: reachedLatest ? 0 : row.mentionCount
						});
						imStore.refreshSummary();
						scheduleConversationRefresh();
					}
				} finally {
					readReportInFlight = false;
					if (pendingReadSeq > 0) scheduleVisibleRead();
				}
			});
			return _markVisibleRead.apply(this, arguments);
		}
		function highestVisibleMessageSeq() {
			const scroller = messageScroller.value;
			if (!scroller) return 0;
			const viewport = scroller.getBoundingClientRect();
			let highest = 0;
			scroller.querySelectorAll(".message-row[data-message-seq]").forEach((row) => {
				const rect = row.getBoundingClientRect();
				if (rect.bottom > viewport.top && rect.top < viewport.bottom) highest = Math.max(highest, Number(row.dataset.messageSeq || 0));
			});
			return highest;
		}
		function scheduleVisibleRead() {
			if (visibleReadTimer) window.clearTimeout(visibleReadTimer);
			visibleReadTimer = window.setTimeout(() => void markVisibleRead(), 120);
		}
		function isCurrentConversationLoad(conversationId, loadVersion) {
			var _activeConversation$v13;
			return ((_activeConversation$v13 = activeConversation.value) === null || _activeConversation$v13 === void 0 ? void 0 : _activeConversation$v13.id) === conversationId && conversationLoadVersion === loadVersion;
		}
		function scheduleConversationRefresh() {
			if (conversationRefreshTimer) window.clearTimeout(conversationRefreshTimer);
			conversationRefreshTimer = window.setTimeout(() => {
				if (conversationLoading.value) {
					scheduleConversationRefresh();
					return;
				}
				loadConversations(true).catch(() => {});
			}, 120);
		}
		function onMessageScroll() {
			if (isNearBottom()) newMessageCount.value = 0;
			scheduleVisibleRead();
		}
		function isNearBottom() {
			const el = messageScroller.value;
			return !el || el.scrollHeight - el.scrollTop - el.clientHeight < 90;
		}
		function scrollToBottom(smooth) {
			nextTick(() => {
				var _messageScroller$valu;
				return (_messageScroller$valu = messageScroller.value) === null || _messageScroller$valu === void 0 ? void 0 : _messageScroller$valu.scrollTo({
					top: messageScroller.value.scrollHeight,
					behavior: smooth ? "smooth" : "auto"
				});
			});
			newMessageCount.value = 0;
		}
		function jumpToMessage(id, highlight = true) {
			nextTick(() => {
				var _document$getElementB;
				(_document$getElementB = document.getElementById(`im-message-${id}`)) === null || _document$getElementB === void 0 || _document$getElementB.scrollIntoView({
					block: "center",
					behavior: "smooth"
				});
				if (highlight) {
					highlightedMessageId.value = id;
					window.setTimeout(() => highlightedMessageId.value = void 0, 1600);
				}
			});
		}
		function showDateDivider(index) {
			if (index === 0) return true;
			return new Date(messages.value[index].createdAt).toDateString() !== new Date(messages.value[index - 1].createdAt).toDateString();
		}
		function showUnreadDivider(message, index) {
			if (isMine(message) || message.seq <= initialLastReadSeq.value) return false;
			return !messages.value.slice(0, index).some((item) => !isMine(item) && item.seq > initialLastReadSeq.value);
		}
		function openCreate(mode) {
			createDialog.mode = mode;
			createDialog.name = "";
			createDialog.selected = [];
			createDialog.visible = true;
			contactKeyword.value = "";
			loadContacts();
		}
		function loadContacts() {
			return _loadContacts.apply(this, arguments);
		}
		function _loadContacts() {
			_loadContacts = _asyncToGenerator(function* () {
				const { data } = yield imApi.contacts({
					keyword: contactKeyword.value || void 0,
					limit: 100
				});
				contacts.value = data.map(withKnownContactPresence);
			});
			return _loadContacts.apply(this, arguments);
		}
		function toggleContact(contact) {
			if (createDialog.mode === "direct") createDialog.selected = [contact.userId];
			else createDialog.selected = createDialog.selected.includes(contact.userId) ? createDialog.selected.filter((id) => id !== contact.userId) : [...createDialog.selected, contact.userId];
		}
		function submitCreate() {
			return _submitCreate.apply(this, arguments);
		}
		function _submitCreate() {
			_submitCreate = _asyncToGenerator(function* () {
				createDialog.loading = true;
				try {
					const response = createDialog.mode === "direct" ? yield imApi.createDirect(createDialog.selected[0]) : yield imApi.createGroup({
						name: createDialog.name.trim(),
						memberIds: createDialog.selected
					});
					createDialog.visible = false;
					yield loadConversations(true);
					yield selectConversation(response.data);
				} finally {
					createDialog.loading = false;
				}
			});
			return _submitCreate.apply(this, arguments);
		}
		function openAddMembers() {
			addMemberSelected.value = [];
			contactKeyword.value = "";
			addMemberDialog.value = true;
			loadContacts();
		}
		function toggleAddMember(id) {
			addMemberSelected.value = addMemberSelected.value.includes(id) ? addMemberSelected.value.filter((item) => item !== id) : [...addMemberSelected.value, id];
		}
		function submitAddMembers() {
			return _submitAddMembers.apply(this, arguments);
		}
		function _submitAddMembers() {
			_submitAddMembers = _asyncToGenerator(function* () {
				if (!activeConversation.value) return;
				yield imApi.addMembers(activeConversation.value.id, addMemberSelected.value);
				ElMessage.success("成员已加入群聊");
				addMemberDialog.value = false;
				yield loadMembers();
			});
			return _submitAddMembers.apply(this, arguments);
		}
		function handleConversationCommand(_x5, _x6) {
			return _handleConversationCommand.apply(this, arguments);
		}
		function _handleConversationCommand() {
			_handleConversationCommand = _asyncToGenerator(function* (command, conversation) {
				if (command === "pin") yield setConversation(conversation, "pinned", !conversation.pinned);
				if (command === "mute") yield setConversation(conversation, "muted", !conversation.muted);
				if (command === "hide") yield setConversation(conversation, "hidden", true);
				if (command === "read") if (conversation.unreadCount || conversation.manualUnreadSeq) yield imApi.read(conversation.id, conversation.lastSeq);
				else yield setConversation(conversation, "manualUnread", true);
				if (command === "leave") yield leaveConversation(conversation);
				yield loadConversations(true);
			});
			return _handleConversationCommand.apply(this, arguments);
		}
		function setConversation(_x7, _x8, _x9) {
			return _setConversation.apply(this, arguments);
		}
		function _setConversation() {
			_setConversation = _asyncToGenerator(function* (conversation, key, value) {
				yield imApi.settings(conversation.id, { [key]: value });
				if (key in conversation) conversation[key] = value;
			});
			return _setConversation.apply(this, arguments);
		}
		function updateConversationSetting(_x10, _x11) {
			return _updateConversationSetting.apply(this, arguments);
		}
		function _updateConversationSetting() {
			_updateConversationSetting = _asyncToGenerator(function* (key, value) {
				if (!activeConversation.value) return;
				if (key === "hidden") return setConversation(activeConversation.value, key, value);
				yield setConversation(activeConversation.value, key, value);
				const row = conversations.value.find((c) => {
					var _activeConversation$v14;
					return c.id === ((_activeConversation$v14 = activeConversation.value) === null || _activeConversation$v14 === void 0 ? void 0 : _activeConversation$v14.id);
				});
				if (row && key in row) row[key] = value;
			});
			return _updateConversationSetting.apply(this, arguments);
		}
		function updatePreference(_x12, _x13) {
			return _updatePreference.apply(this, arguments);
		}
		function _updatePreference() {
			_updatePreference = _asyncToGenerator(function* (key, value) {
				if (key === "browserNotification" && value && "Notification" in window && Notification.permission !== "granted") {
					if ((yield Notification.requestPermission()) !== "granted") {
						ElMessage.warning("浏览器通知未获授权");
						return;
					}
				}
				yield imStore.savePreference({ [key]: value });
			});
			return _updatePreference.apply(this, arguments);
		}
		function leaveConversation(_x14) {
			return _leaveConversation.apply(this, arguments);
		}
		function _leaveConversation() {
			_leaveConversation = _asyncToGenerator(function* (conversation) {
				var _activeConversation$v15;
				yield ElMessageBox.confirm(`确定退出「${conversation.name}」吗？历史消息仍会保留。`, "退出群聊", { type: "warning" });
				yield imApi.leave(conversation.id);
				if (((_activeConversation$v15 = activeConversation.value) === null || _activeConversation$v15 === void 0 ? void 0 : _activeConversation$v15.id) === conversation.id) {
					activeConversation.value = null;
					messages.value = [];
					mobilePane.value = "list";
				}
				yield loadConversations(true);
			});
			return _leaveConversation.apply(this, arguments);
		}
		function openFilePicker(type) {
			var _ref;
			(_ref = type === "image" ? imageInput.value : fileInput.value) === null || _ref === void 0 || _ref.click();
		}
		function onFileInput(event) {
			const input = event.target;
			enqueueFiles(Array.from(input.files || []));
			input.value = "";
		}
		function onDropFiles(event) {
			var _event$dataTransfer;
			composerDragging.value = false;
			enqueueFiles(Array.from(((_event$dataTransfer = event.dataTransfer) === null || _event$dataTransfer === void 0 ? void 0 : _event$dataTransfer.files) || []));
		}
		function onPaste(event) {
			var _event$clipboardData;
			const files = Array.from(((_event$clipboardData = event.clipboardData) === null || _event$clipboardData === void 0 ? void 0 : _event$clipboardData.files) || []).filter((file) => file.type.startsWith("image/"));
			if (files.length) {
				event.preventDefault();
				enqueueFiles(files);
			}
		}
		function enqueueFiles(files) {
			if (!activeConversation.value) return;
			files.slice(0, 10).forEach((file) => {
				const item = {
					key: createClientId(),
					file,
					progress: 0,
					status: "uploading"
				};
				uploadQueue.value.push(item);
				uploadOne(item);
			});
		}
		function uploadOne(_x15) {
			return _uploadOne.apply(this, arguments);
		}
		function _uploadOne() {
			_uploadOne = _asyncToGenerator(function* (item) {
				if (!activeConversation.value) return;
				item.status = "uploading";
				item.progress = 0;
				item.error = void 0;
				try {
					const { data } = yield imApi.uploadAttachment(activeConversation.value.id, item.file, (percent) => {
						item.progress = percent;
					});
					item.attachment = data;
					item.status = "done";
					item.progress = 100;
				} catch (error) {
					item.status = "failed";
					item.error = (error === null || error === void 0 ? void 0 : error.message) || "上传失败";
				}
			});
			return _uploadOne.apply(this, arguments);
		}
		function removeUpload(key) {
			uploadQueue.value = uploadQueue.value.filter((item) => item.key !== key);
		}
		function onComposerKeydown(event) {
			if (event.key === "Escape") {
				mentionPickerVisible.value = false;
				emojiVisible.value = false;
				return;
			}
			if (event.key === "Enter" && !event.shiftKey) {
				event.preventDefault();
				if (mentionPickerVisible.value && filteredMentionMembers.value[0]) insertMention(filteredMentionMembers.value[0]);
				else sendMessage();
			}
		}
		function openMentionPicker() {
			var _composerInput$value2;
			mentionKeyword.value = "";
			mentionPickerVisible.value = true;
			(_composerInput$value2 = composerInput.value) === null || _composerInput$value2 === void 0 || _composerInput$value2.focus();
		}
		function insertMention(member) {
			var _composerInput$value3, _textarea$selectionSt;
			const label = member ? member.name : "所有人";
			const textarea = (_composerInput$value3 = composerInput.value) === null || _composerInput$value3 === void 0 ? void 0 : _composerInput$value3.textarea;
			const start = (_textarea$selectionSt = textarea === null || textarea === void 0 ? void 0 : textarea.selectionStart) !== null && _textarea$selectionSt !== void 0 ? _textarea$selectionSt : draftText.value.length;
			draftText.value = `${draftText.value.slice(0, start).replace(/@[^\s@]*$/, "")}@${label} ${draftText.value.slice(start)}`;
			if (member) {
				if (!selectedMentions.value.some((item) => item.userId === member.userId)) selectedMentions.value.push(member);
			} else mentionAll.value = true;
			mentionPickerVisible.value = false;
			nextTick(() => {
				var _composerInput$value4;
				return (_composerInput$value4 = composerInput.value) === null || _composerInput$value4 === void 0 ? void 0 : _composerInput$value4.focus();
			});
		}
		function insertEmoji(emoji) {
			var _composerInput$value5;
			draftText.value += emoji;
			emojiVisible.value = false;
			(_composerInput$value5 = composerInput.value) === null || _composerInput$value5 === void 0 || _composerInput$value5.focus();
		}
		function sendMessage() {
			return _sendMessage.apply(this, arguments);
		}
		function _sendMessage() {
			_sendMessage = _asyncToGenerator(function* () {
				var _replyMessage$value, _messages$value$at2, _userStore$userInfo3, _userStore$userInfo4, _userStore$userInfo5, _userStore$userInfo6;
				if (!activeConversation.value || !canSend.value) return;
				if (!navigator.onLine) {
					ElMessage.warning("当前网络已断开，内容已保留为草稿");
					return;
				}
				const conversationId = activeConversation.value.id;
				const readyAttachments = uploadQueue.value.filter((item) => item.status === "done" && item.attachment);
				const clientMessageId = createClientId();
				const validMentions = selectedMentions.value.filter((member) => draftText.value.includes(`@${member.name}`)).map((member) => member.userId);
				const type = readyAttachments.length ? readyAttachments.every((item) => item.file.type.startsWith("image/")) ? "image" : "file" : "text";
				const payload = {
					clientMessageId,
					messageType: type,
					text: draftText.value,
					replyToMessageId: (_replyMessage$value = replyMessage.value) === null || _replyMessage$value === void 0 ? void 0 : _replyMessage$value.id,
					mentionedUserIds: validMentions,
					mentionAll: mentionAll.value && draftText.value.includes("@所有人"),
					attachmentIds: readyAttachments.map((item) => item.attachment.id)
				};
				failedPayloads.set(clientMessageId, payload);
				const optimistic = {
					id: -Date.now(),
					conversationId,
					clientMessageId,
					seq: (((_messages$value$at2 = messages.value.at(-1)) === null || _messages$value$at2 === void 0 ? void 0 : _messages$value$at2.seq) || activeConversation.value.lastSeq || 0) + 1,
					senderId: Number((_userStore$userInfo3 = userStore.userInfo) === null || _userStore$userInfo3 === void 0 ? void 0 : _userStore$userInfo3.id),
					senderName: ((_userStore$userInfo4 = userStore.userInfo) === null || _userStore$userInfo4 === void 0 ? void 0 : _userStore$userInfo4.nickname) || ((_userStore$userInfo5 = userStore.userInfo) === null || _userStore$userInfo5 === void 0 ? void 0 : _userStore$userInfo5.username) || "我",
					senderAvatar: (_userStore$userInfo6 = userStore.userInfo) === null || _userStore$userInfo6 === void 0 ? void 0 : _userStore$userInfo6.avatar,
					messageType: type,
					text: draftText.value,
					status: "sending",
					important: false,
					edited: false,
					recalled: false,
					createdAt: (/* @__PURE__ */ new Date()).toISOString(),
					mine: true,
					favorite: false,
					replyTo: replyMessage.value ? {
						id: replyMessage.value.id,
						senderId: replyMessage.value.senderId,
						senderName: replyMessage.value.senderName,
						text: replyMessage.value.text,
						status: replyMessage.value.status
					} : void 0,
					attachments: readyAttachments.map((item) => item.attachment),
					mentions: [],
					reactions: [],
					readCount: 0,
					deliveredCount: 0,
					unreadCount: Math.max(0, activeConversation.value.memberCount - 1)
				};
				messages.value = mergeImMessages(messages.value, [optimistic]);
				suppressDraftPersistence = true;
				draftText.value = "";
				uploadQueue.value = [];
				replyMessage.value = null;
				selectedMentions.value = [];
				mentionAll.value = false;
				scrollToBottom(false);
				sending.value = true;
				try {
					var _activeConversation$v16;
					const { data } = yield imApi.send(conversationId, payload);
					failedPayloads.delete(clientMessageId);
					if (((_activeConversation$v16 = activeConversation.value) === null || _activeConversation$v16 === void 0 ? void 0 : _activeConversation$v16.id) !== conversationId) return;
					replaceOptimistic(clientMessageId, normalizeMine(data));
					activeConversation.value.lastSeq = data.seq;
					suppressDraftPersistence = false;
					yield saveDraft();
					yield nextTick();
					hydrateAttachmentUrls([data]);
					scrollToBottom(false);
				} catch (error) {
					var _activeConversation$v17;
					if (((_activeConversation$v17 = activeConversation.value) === null || _activeConversation$v17 === void 0 ? void 0 : _activeConversation$v17.id) !== conversationId) return;
					const item = messages.value.find((message) => message.clientMessageId === clientMessageId);
					if (item) {
						item.status = "failed";
						item.error = (error === null || error === void 0 ? void 0 : error.message) || "发送失败";
					}
					suppressDraftPersistence = false;
					yield saveDraft();
				} finally {
					suppressDraftPersistence = false;
					sending.value = false;
				}
			});
			return _sendMessage.apply(this, arguments);
		}
		function retryMessage(_x16) {
			return _retryMessage.apply(this, arguments);
		}
		function _retryMessage() {
			_retryMessage = _asyncToGenerator(function* (message) {
				if (!activeConversation.value || activeConversation.value.id !== message.conversationId || sending.value) return;
				const conversationId = message.conversationId;
				const payload = failedPayloads.get(message.clientMessageId);
				if (!payload) {
					ElMessage.warning("重试信息已失效，请重新发送");
					return;
				}
				message.status = "sending";
				sending.value = true;
				try {
					var _activeConversation$v18;
					const { data } = yield imApi.send(conversationId, payload);
					if (((_activeConversation$v18 = activeConversation.value) === null || _activeConversation$v18 === void 0 ? void 0 : _activeConversation$v18.id) !== conversationId) return;
					replaceOptimistic(message.clientMessageId, normalizeMine(data));
					failedPayloads.delete(message.clientMessageId);
					yield saveDraft();
				} catch (error) {
					message.status = "failed";
					message.error = (error === null || error === void 0 ? void 0 : error.message) || "发送失败";
				} finally {
					sending.value = false;
				}
			});
			return _retryMessage.apply(this, arguments);
		}
		function replaceOptimistic(clientId, message) {
			messages.value = mergeImMessages(messages.value, [_objectSpread2(_objectSpread2({}, message), {}, { clientMessageId: clientId })]);
		}
		function saveDraft() {
			return _saveDraft.apply(this, arguments);
		}
		function _saveDraft() {
			_saveDraft = _asyncToGenerator(function* () {
				if (!activeConversation.value) return;
				yield imApi.settings(activeConversation.value.id, { draft: draftText.value }).catch(() => {});
				activeConversation.value.draft = draftText.value;
				const row = conversations.value.find((item) => {
					var _activeConversation$v19;
					return item.id === ((_activeConversation$v19 = activeConversation.value) === null || _activeConversation$v19 === void 0 ? void 0 : _activeConversation$v19.id);
				});
				if (row) row.draft = draftText.value;
			});
			return _saveDraft.apply(this, arguments);
		}
		function handleMessageCommand(_x17, _x18) {
			return _handleMessageCommand.apply(this, arguments);
		}
		function _handleMessageCommand() {
			_handleMessageCommand = _asyncToGenerator(function* (command, message) {
				if (command === "reaction") yield toggleReaction(message, "like");
				if (command === "favorite") {
					yield imApi.favorite(message.id);
					message.favorite = !message.favorite;
				}
				if (command === "important") {
					yield imApi.important(message.id);
					message.important = !message.important;
				}
				if (command === "task") openTaskCreate(message);
				if (command === "edit") yield editMessage(message);
				if (command === "recall") yield recallMessage(message);
				if (command === "receipt") yield showReceipt(message);
			});
			return _handleMessageCommand.apply(this, arguments);
		}
		function editMessage(_x19) {
			return _editMessage.apply(this, arguments);
		}
		function _editMessage() {
			_editMessage = _asyncToGenerator(function* (message) {
				const { value } = yield ElMessageBox.prompt("修改消息内容", "编辑消息", {
					inputValue: message.text,
					inputType: "textarea",
					inputValidator: (value) => value.trim() ? true : "内容不能为空"
				});
				const { data } = yield imApi.edit(message.id, value);
				Object.assign(message, normalizeMine(data));
			});
			return _editMessage.apply(this, arguments);
		}
		function recallMessage(_x20) {
			return _recallMessage.apply(this, arguments);
		}
		function _recallMessage() {
			_recallMessage = _asyncToGenerator(function* (message) {
				yield ElMessageBox.confirm("撤回后会保留操作记录，群成员将看到撤回提示。", "撤回消息", { type: "warning" });
				yield imApi.recall(message.id);
				Object.assign(message, {
					status: "recalled",
					recalled: true,
					text: "消息已撤回",
					attachments: []
				});
			});
			return _recallMessage.apply(this, arguments);
		}
		function toggleReaction(_x21, _x22) {
			return _toggleReaction.apply(this, arguments);
		}
		function _toggleReaction() {
			_toggleReaction = _asyncToGenerator(function* (message, code) {
				yield imApi.reaction(message.id, code);
				yield reloadLatestMessages();
			});
			return _toggleReaction.apply(this, arguments);
		}
		function copyMessage(_x23) {
			return _copyMessage.apply(this, arguments);
		}
		function _copyMessage() {
			_copyMessage = _asyncToGenerator(function* (message) {
				yield navigator.clipboard.writeText(message.text);
				ElMessage.success("已复制");
			});
			return _copyMessage.apply(this, arguments);
		}
		function showReceipt(_x24) {
			return _showReceipt.apply(this, arguments);
		}
		function _showReceipt() {
			_showReceipt = _asyncToGenerator(function* (message) {
				if (message.id <= 0) return;
				const { data } = yield imApi.receipt(message.id);
				receiptDialog.data = data;
				receiptDialog.visible = true;
			});
			return _showReceipt.apply(this, arguments);
		}
		function isMessageRead(message) {
			return message.readCount > 0 && message.unreadCount === 0;
		}
		function deliveryLabel(message) {
			var _activeConversation$v20;
			const total = message.readCount + message.unreadCount;
			if (!total) return "已发送";
			if (((_activeConversation$v20 = activeConversation.value) === null || _activeConversation$v20 === void 0 ? void 0 : _activeConversation$v20.type) === "direct") return isMessageRead(message) ? "已读" : "未读";
			if (message.unreadCount === 0) return "全部已读";
			return `${message.readCount}/${total}人已读`;
		}
		function openForward(message) {
			forwardDialog.message = message;
			forwardDialog.targetId = 0;
			forwardDialog.keyword = "";
			forwardDialog.visible = true;
		}
		function submitForward() {
			return _submitForward.apply(this, arguments);
		}
		function _submitForward() {
			_submitForward = _asyncToGenerator(function* () {
				if (!forwardDialog.message || !forwardDialog.targetId) return;
				yield imApi.send(forwardDialog.targetId, {
					clientMessageId: createClientId(),
					messageType: "forward",
					forwardedMessageId: forwardDialog.message.id,
					text: forwardDialog.message.text
				});
				forwardDialog.visible = false;
				ElMessage.success("已转发");
			});
			return _submitForward.apply(this, arguments);
		}
		function openTaskCreate(source) {
			var _userStore$userInfo7, _activeConversation$v21, _source$business, _source$business2, _activeConversation$v22, _source$business3, _activeConversation$v23;
			if (!source || source.id <= 0 || source.recalled) {
				ElMessage.warning("请先选择一条已发送消息");
				return;
			}
			const currentUserId = Number((_userStore$userInfo7 = userStore.userInfo) === null || _userStore$userInfo7 === void 0 ? void 0 : _userStore$userInfo7.id);
			const fallbackResponsible = !isMine(source) && source.senderId > 0 ? source.senderId : (_activeConversation$v21 = activeConversation.value) === null || _activeConversation$v21 === void 0 ? void 0 : _activeConversation$v21.peerUserId;
			const responsibleIds = fallbackResponsible && fallbackResponsible !== currentUserId ? [fallbackResponsible] : [];
			const responsible = members.value.find((member) => member.userId === responsibleIds[0]);
			taskCreate.source = source;
			taskCreate.title = summarizeTaskTitle(((_source$business = source.business) === null || _source$business === void 0 ? void 0 : _source$business.title) || source.text || `${source.senderName}发送的${source.messageType}消息`);
			taskCreate.responsibleIds = responsibleIds;
			taskCreate.collaboratorIds = [];
			taskCreate.deptId = responsible === null || responsible === void 0 ? void 0 : responsible.deptId;
			taskCreate.priority = "normal";
			taskCreate.deadlineAt = defaultTaskDeadline();
			taskCreate.reminderRules = [
				"before_2h",
				"due",
				"overdue_1h"
			];
			taskCreate.customerId = void 0;
			taskCreate.businessType = ((_source$business2 = source.business) === null || _source$business2 === void 0 ? void 0 : _source$business2.businessType) || ((_activeConversation$v22 = activeConversation.value) === null || _activeConversation$v22 === void 0 ? void 0 : _activeConversation$v22.businessType) || "";
			taskCreate.businessId = ((_source$business3 = source.business) === null || _source$business3 === void 0 ? void 0 : _source$business3.businessId) || ((_activeConversation$v23 = activeConversation.value) === null || _activeConversation$v23 === void 0 ? void 0 : _activeConversation$v23.businessId);
			taskCreate.acceptanceStandard = "";
			taskCreate.visible = true;
		}
		function submitTaskCreate() {
			return _submitTaskCreate.apply(this, arguments);
		}
		function _submitTaskCreate() {
			_submitTaskCreate = _asyncToGenerator(function* () {
				if (!taskCreate.source || !canCreateTask.value) return;
				const payload = {
					title: taskCreate.title.trim(),
					responsibleIds: taskCreate.responsibleIds,
					collaboratorIds: taskCreate.collaboratorIds.filter((id) => !taskCreate.responsibleIds.includes(id)),
					deptId: taskCreate.deptId,
					priority: taskCreate.priority,
					deadlineAt: taskCreate.deadlineAt,
					reminderRules: taskCreate.reminderRules,
					customerId: taskCreate.customerId,
					businessType: taskCreate.businessType || void 0,
					businessId: taskCreate.businessType ? taskCreate.businessId : void 0,
					acceptanceStandard: taskCreate.acceptanceStandard.trim()
				};
				if (Boolean(payload.businessType) !== Boolean(payload.businessId)) {
					ElMessage.warning("关联业务类型和业务ID需要同时填写");
					return;
				}
				taskCreate.loading = true;
				try {
					const { data } = yield imApi.createTask(taskCreate.source.id, payload);
					taskCreate.visible = false;
					ElMessage.success("待办已创建并通知责任人");
					yield Promise.all([reloadLatestMessages(), loadConversations(true)]);
					yield openTaskDetail(data);
				} finally {
					taskCreate.loading = false;
				}
			});
			return _submitTaskCreate.apply(this, arguments);
		}
		function openMessageContextMenu(event, message) {
			event.preventDefault();
			messageCtx.message = message;
			messageCtx.x = Math.max(8, Math.min(event.clientX, window.innerWidth - 224));
			messageCtx.y = Math.max(8, Math.min(event.clientY, window.innerHeight - 330));
			messageCtx.visible = true;
		}
		function closeMessageContextMenu() {
			messageCtx.visible = false;
			messageCtx.message = null;
		}
		function runContext(action) {
			const message = messageCtx.message;
			closeMessageContextMenu();
			if (message) action(message);
		}
		function replyFromContext() {
			runContext((m) => {
				replyMessage.value = m;
			});
		}
		function forwardFromContext() {
			runContext(openForward);
		}
		function taskFromContext() {
			runContext(openTaskCreate);
		}
		function issueFromContext() {
			runContext(openIssueCreate);
		}
		function favoriteFromContext() {
			runContext((m) => handleMessageCommand("favorite", m));
		}
		function importantFromContext() {
			runContext((m) => handleMessageCommand("important", m));
		}
		function copyFromContext() {
			runContext(copyMessage);
		}
		function editFromContext() {
			runContext((m) => handleMessageCommand("edit", m));
		}
		function recallFromContext() {
			runContext((m) => handleMessageCommand("recall", m));
		}
		function receiptFromContext() {
			runContext((m) => handleMessageCommand("receipt", m));
		}
		function openIssueCreate(source) {
			var _source$business4, _activeConversation$v24;
			if (!source || source.id <= 0 || source.recalled) {
				ElMessage.warning("请先选择一条有效消息");
				return;
			}
			issueCreate.source = source;
			issueCreate.description = summarizeTaskTitle(((_source$business4 = source.business) === null || _source$business4 === void 0 ? void 0 : _source$business4.title) || source.text || `${source.senderName}发送的${source.messageType}消息`);
			issueCreate.ownerId = !isMine(source) && source.senderId > 0 ? source.senderId : ((_activeConversation$v24 = activeConversation.value) === null || _activeConversation$v24 === void 0 ? void 0 : _activeConversation$v24.peerUserId) || void 0;
			issueCreate.deadline = defaultTaskDeadline();
			issueCreate.priority = "P2";
			issueCreate.customerName = "";
			loadIssueStaffCandidates();
			issueCreate.visible = true;
		}
		function loadIssueStaffCandidates() {
			return _loadIssueStaffCandidates.apply(this, arguments);
		}
		function _loadIssueStaffCandidates() {
			_loadIssueStaffCandidates = _asyncToGenerator(function* () {
				const fromMembers = members.value.map((member) => ({
					id: member.userId,
					name: member.name
				}));
				try {
					const staff = yield staffCandidatesApi();
					const seen = new Set(fromMembers.map((s) => s.id));
					const merged = [...fromMembers];
					for (const s of staff) if (!seen.has(s.id)) {
						merged.push({
							id: s.id,
							name: s.name
						});
						seen.add(s.id);
					}
					issueStaffCandidates.value = merged;
				} catch (_unused5) {
					issueStaffCandidates.value = fromMembers;
				}
			});
			return _loadIssueStaffCandidates.apply(this, arguments);
		}
		function submitIssueCreate() {
			return _submitIssueCreate.apply(this, arguments);
		}
		function _submitIssueCreate() {
			_submitIssueCreate = _asyncToGenerator(function* () {
				if (!issueCreate.source || !canCreateIssue.value) return;
				issueCreate.loading = true;
				try {
					yield customerIssueApi.createFromMessage({
						messageId: issueCreate.source.id,
						description: issueCreate.description.trim(),
						ownerId: issueCreate.ownerId,
						deadline: issueCreate.deadline,
						priority: issueCreate.priority,
						customerName: issueCreate.customerName.trim() || void 0
					});
					issueCreate.visible = false;
					ElMessage.success("任务工单已下发并通知主办人");
					yield Promise.all([reloadLatestMessages(), loadConversations(true)]);
				} finally {
					issueCreate.loading = false;
				}
			});
			return _submitIssueCreate.apply(this, arguments);
		}
		function openTaskBoard() {
			return _openTaskBoard.apply(this, arguments);
		}
		function _openTaskBoard() {
			_openTaskBoard = _asyncToGenerator(function* () {
				taskBoard.visible = true;
				yield loadTaskBoard(true);
			});
			return _openTaskBoard.apply(this, arguments);
		}
		function loadTaskBoard(_x25) {
			return _loadTaskBoard.apply(this, arguments);
		}
		function _loadTaskBoard() {
			_loadTaskBoard = _asyncToGenerator(function* (reset) {
				if (taskBoard.loading || !reset && !taskBoard.hasMore) return;
				taskBoard.loading = true;
				try {
					if (reset) taskBoard.cursor = void 0;
					const [listResponse, statsResponse] = yield Promise.all([imApi.tasks({
						scope: taskBoard.scope,
						state: taskBoard.state,
						cursor: taskBoard.cursor,
						pageSize: 30
					}), imApi.taskStats(taskBoard.scope)]);
					taskBoard.items = reset ? listResponse.data.items : mergeTasks(taskBoard.items, listResponse.data.items);
					taskBoard.cursor = listResponse.data.nextCursor;
					taskBoard.hasMore = listResponse.data.hasMore;
					taskBoard.stats = statsResponse.data || emptyTaskStats();
				} finally {
					taskBoard.loading = false;
				}
			});
			return _loadTaskBoard.apply(this, arguments);
		}
		function openTaskDetail(_x26) {
			return _openTaskDetail.apply(this, arguments);
		}
		function _openTaskDetail() {
			_openTaskDetail = _asyncToGenerator(function* (task) {
				taskDetail.visible = true;
				taskDetail.data = task;
				try {
					taskDetail.data = (yield imApi.taskDetail(task.taskId)).data;
				} catch (_unused6) {
					taskDetail.visible = false;
				}
			});
			return _openTaskDetail.apply(this, arguments);
		}
		function acceptTask(_x27) {
			return _acceptTask.apply(this, arguments);
		}
		function _acceptTask() {
			_acceptTask = _asyncToGenerator(function* (task) {
				const { data } = yield imApi.acceptTask(task.taskId);
				replaceTaskEverywhere(data);
				ElMessage.success("已接收，待办进入进行中");
				if (taskBoard.visible) yield loadTaskBoard(true);
			});
			return _acceptTask.apply(this, arguments);
		}
		function openTaskSubmit(task) {
			taskSubmit.task = task;
			taskSubmit.result = "";
			taskSubmit.uploads = [];
			taskSubmit.visible = true;
		}
		function onTaskSubmitFiles(event) {
			const input = event.target;
			Array.from(input.files || []).slice(0, Math.max(0, 10 - taskSubmit.uploads.length)).forEach((file) => {
				const item = {
					key: createClientId(),
					file,
					progress: 0,
					status: "uploading"
				};
				taskSubmit.uploads.push(item);
				uploadTaskEvidence(item);
			});
			input.value = "";
		}
		function uploadTaskEvidence(_x28) {
			return _uploadTaskEvidence.apply(this, arguments);
		}
		function _uploadTaskEvidence() {
			_uploadTaskEvidence = _asyncToGenerator(function* (item) {
				if (!taskSubmit.task) return;
				item.status = "uploading";
				item.progress = 0;
				item.error = void 0;
				try {
					const { data } = yield imApi.uploadTaskAttachment(taskSubmit.task.taskId, item.file, (percent) => {
						item.progress = percent;
					});
					item.attachment = data;
					item.status = "done";
					item.progress = 100;
				} catch (error) {
					item.status = "failed";
					item.error = (error === null || error === void 0 ? void 0 : error.message) || "上传失败";
				}
			});
			return _uploadTaskEvidence.apply(this, arguments);
		}
		function removeTaskEvidence(key) {
			taskSubmit.uploads = taskSubmit.uploads.filter((item) => item.key !== key);
		}
		function submitTaskResult() {
			return _submitTaskResult.apply(this, arguments);
		}
		function _submitTaskResult() {
			_submitTaskResult = _asyncToGenerator(function* () {
				if (!taskSubmit.task || !canSubmitTaskResult.value) return;
				taskSubmit.loading = true;
				try {
					const { data } = yield imApi.submitTask(taskSubmit.task.taskId, {
						result: taskSubmit.result.trim(),
						attachmentIds: taskSubmit.uploads.filter((item) => item.status === "done" && item.attachment).map((item) => item.attachment.id)
					});
					taskSubmit.visible = false;
					replaceTaskEverywhere(data);
					ElMessage.success("处理结果已提交，等待验收");
					if (taskBoard.visible) yield loadTaskBoard(true);
				} finally {
					taskSubmit.loading = false;
				}
			});
			return _submitTaskResult.apply(this, arguments);
		}
		function openTaskReview(task) {
			taskReview.task = task;
			taskReview.pass = true;
			taskReview.comment = "";
			taskReview.visible = true;
		}
		function submitTaskReview() {
			return _submitTaskReview.apply(this, arguments);
		}
		function _submitTaskReview() {
			_submitTaskReview = _asyncToGenerator(function* () {
				if (!taskReview.task || !taskReview.pass && !taskReview.comment.trim()) return;
				taskReview.loading = true;
				try {
					const { data } = yield imApi.reviewTask(taskReview.task.taskId, {
						pass: taskReview.pass,
						comment: taskReview.comment.trim() || void 0
					});
					taskReview.visible = false;
					replaceTaskEverywhere(data);
					ElMessage.success(taskReview.pass ? "待办已验收完成" : "已驳回责任人重新处理");
					if (taskBoard.visible) yield loadTaskBoard(true);
				} finally {
					taskReview.loading = false;
				}
			});
			return _submitTaskReview.apply(this, arguments);
		}
		function cancelTask(_x29) {
			return _cancelTask.apply(this, arguments);
		}
		function _cancelTask() {
			_cancelTask = _asyncToGenerator(function* (task) {
				const { value } = yield ElMessageBox.prompt("请填写取消原因，操作将保留在时间线中。", "取消待办", {
					inputType: "textarea",
					inputValidator: (value) => value.trim() ? true : "取消原因不能为空",
					confirmButtonText: "确认取消",
					cancelButtonText: "返回",
					type: "warning"
				});
				const { data } = yield imApi.cancelTask(task.taskId, value.trim());
				replaceTaskEverywhere(data);
				ElMessage.success("待办已取消");
				if (taskBoard.visible) yield loadTaskBoard(true);
			});
			return _cancelTask.apply(this, arguments);
		}
		function openTaskSource(_x30) {
			return _openTaskSource.apply(this, arguments);
		}
		function _openTaskSource() {
			_openTaskSource = _asyncToGenerator(function* (messageId) {
				var _activeConversation$v25;
				const task = taskDetail.data;
				if (!task) return;
				let conversation = conversations.value.find((item) => item.id === task.conversationId);
				if (!conversation) conversation = (yield imApi.conversation(task.conversationId)).data;
				if (((_activeConversation$v25 = activeConversation.value) === null || _activeConversation$v25 === void 0 ? void 0 : _activeConversation$v25.id) !== conversation.id) yield selectConversation(conversation);
				const source = (yield imApi.message(messageId)).data;
				const { data } = yield imApi.messages(conversation.id, {
					beforeSeq: source.seq + 26,
					pageSize: 50
				});
				messages.value = mergeImMessages(data.items.map(normalizeMine));
				hasEarlierMessages.value = data.hasMore;
				taskDetail.visible = false;
				yield nextTick();
				hydrateAttachmentUrls(messages.value);
				jumpToMessage(messageId);
			});
			return _openTaskSource.apply(this, arguments);
		}
		function replaceTaskEverywhere(task) {
			var _taskDetail$data;
			messages.value.forEach((message) => {
				var _message$task;
				if (((_message$task = message.task) === null || _message$task === void 0 ? void 0 : _message$task.taskId) === task.taskId) message.task = task;
			});
			const boardIndex = taskBoard.items.findIndex((item) => item.taskId === task.taskId);
			if (boardIndex >= 0) taskBoard.items.splice(boardIndex, 1, task);
			if (((_taskDetail$data = taskDetail.data) === null || _taskDetail$data === void 0 ? void 0 : _taskDetail$data.taskId) === task.taskId) taskDetail.data = task;
		}
		function mergeTasks(base, incoming) {
			const map = new Map(base.map((item) => [item.taskId, item]));
			incoming.forEach((item) => map.set(item.taskId, item));
			return Array.from(map.values());
		}
		function summarizeTaskTitle(text) {
			const compact = text.replace(/\s+/g, " ").trim();
			return compact.length > 80 ? `${compact.slice(0, 80)}…` : compact || "处理聊天中的工作事项";
		}
		function defaultTaskDeadline() {
			const date = new Date(Date.now() + 1440 * 60 * 1e3);
			date.setSeconds(0, 0);
			const pad = (value) => String(value).padStart(2, "0");
			return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
		}
		function disablePastDate(date) {
			return date.getTime() < (/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0);
		}
		function openBusinessAction(path) {
			if (!path.startsWith("/") || path.startsWith("//")) {
				ElMessage.warning("业务入口地址无效");
				return;
			}
			router.push(path);
		}
		function openMessageSearch() {
			messageSearch.visible = true;
			messageSearch.keyword = "";
			messageSearch.results = [];
			messageSearch.searched = false;
		}
		function searchInConversation() {
			return _searchInConversation.apply(this, arguments);
		}
		function _searchInConversation() {
			_searchInConversation = _asyncToGenerator(function* () {
				if (!activeConversation.value || !messageSearch.keyword.trim()) return;
				messageSearch.loading = true;
				try {
					const { data } = yield imApi.searchMessages(activeConversation.value.id, {
						keyword: messageSearch.keyword.trim(),
						pageSize: 50
					});
					messageSearch.results = mergeImMessages(data.items.map(normalizeMine));
					messageSearch.searched = true;
				} finally {
					messageSearch.loading = false;
				}
			});
			return _searchInConversation.apply(this, arguments);
		}
		function openSearchResult(_x31) {
			return _openSearchResult.apply(this, arguments);
		}
		function _openSearchResult() {
			_openSearchResult = _asyncToGenerator(function* (message) {
				if (!activeConversation.value) return;
				const { data } = yield imApi.messages(activeConversation.value.id, {
					beforeSeq: message.seq + 26,
					pageSize: 50
				});
				messages.value = mergeImMessages(data.items.map(normalizeMine));
				hasEarlierMessages.value = data.hasMore;
				messageSearch.visible = false;
				yield nextTick();
				hydrateAttachmentUrls(messages.value);
				jumpToMessage(message.id);
			});
			return _openSearchResult.apply(this, arguments);
		}
		function hydrateAttachmentUrls(_x33) {
			return _hydrateAttachmentUrls.apply(this, arguments);
		}
		function _hydrateAttachmentUrls() {
			_hydrateAttachmentUrls = _asyncToGenerator(function* (items) {
				const imageAttachments = items.flatMap((item) => item.attachments || []).filter((item) => item.image && !attachmentUrls[item.id]);
				yield Promise.allSettled(imageAttachments.map(function() {
					var _ref2 = _asyncToGenerator(function* (attachment) {
						const blob = yield imApi.attachmentBlob(attachment.id, Boolean(attachment.thumbnailUrl));
						attachmentUrls[attachment.id] = URL.createObjectURL(blob);
					});
					return function(_x32) {
						return _ref2.apply(this, arguments);
					};
				}()));
			});
			return _hydrateAttachmentUrls.apply(this, arguments);
		}
		function previewImage(_x34) {
			return _previewImage.apply(this, arguments);
		}
		function _previewImage() {
			_previewImage = _asyncToGenerator(function* (attachment) {
				const blob = yield imApi.attachmentBlob(attachment.id);
				if (imagePreview.url) URL.revokeObjectURL(imagePreview.url);
				imagePreview.url = URL.createObjectURL(blob);
				imagePreview.name = attachment.originalName;
				imagePreview.visible = true;
			});
			return _previewImage.apply(this, arguments);
		}
		function closeImagePreview() {
			imagePreview.visible = false;
			if (imagePreview.url) URL.revokeObjectURL(imagePreview.url);
			imagePreview.url = "";
		}
		function downloadAttachment(_x35) {
			return _downloadAttachment.apply(this, arguments);
		}
		function _downloadAttachment() {
			_downloadAttachment = _asyncToGenerator(function* (attachment) {
				const blob = yield imApi.downloadAttachment(attachment.id);
				const url = URL.createObjectURL(blob);
				const anchor = document.createElement("a");
				anchor.href = url;
				anchor.download = attachment.originalName;
				anchor.click();
				URL.revokeObjectURL(url);
			});
			return _downloadAttachment.apply(this, arguments);
		}
		function handleRealtimeEvent(event) {
			var _payload$data, _payload$data2, _activeConversation$v27;
			const payload = event.detail;
			if (!(payload === null || payload === void 0 ? void 0 : payload.type)) return;
			if (payload.type === "connection.ready") {
				presenceByUser.clear();
				syncMissingMessages().catch(() => {});
				loadMembers();
				scheduleConversationRefresh();
				return;
			}
			if (payload.type === "presence.changed") {
				applyPresenceUpdate(payload.data);
				return;
			}
			const conversationId = Number(((_payload$data = payload.data) === null || _payload$data === void 0 ? void 0 : _payload$data.conversationId) || ((_payload$data2 = payload.data) === null || _payload$data2 === void 0 || (_payload$data2 = _payload$data2.message) === null || _payload$data2 === void 0 ? void 0 : _payload$data2.conversationId));
			if (payload.type === "message.created") {
				var _payload$data3, _activeConversation$v26;
				const incoming = (_payload$data3 = payload.data) === null || _payload$data3 === void 0 ? void 0 : _payload$data3.message;
				if (((_activeConversation$v26 = activeConversation.value) === null || _activeConversation$v26 === void 0 ? void 0 : _activeConversation$v26.id) === conversationId && incoming) {
					const atBottom = isNearBottom();
					incoming.mine = isMine(incoming);
					messages.value = mergeImMessages(messages.value, [incoming]);
					nextTick(() => hydrateAttachmentUrls([incoming]));
					if (atBottom) {
						scrollToBottom(false);
						if (!incoming.mine) nextTick(scheduleVisibleRead);
					} else if (!incoming.mine) newMessageCount.value += 1;
				}
				scheduleConversationRefresh();
			} else if (((_activeConversation$v27 = activeConversation.value) === null || _activeConversation$v27 === void 0 ? void 0 : _activeConversation$v27.id) === conversationId && [
				"message.updated",
				"message.recalled",
				"receipt.delivered",
				"receipt.read",
				"task.updated"
			].includes(payload.type)) reloadLatestMessages();
			if (payload.type === "task.updated") {
				var _payload$data4, _payload$data5, _taskDetail$data2;
				const taskId = Number(((_payload$data4 = payload.data) === null || _payload$data4 === void 0 || (_payload$data4 = _payload$data4.task) === null || _payload$data4 === void 0 ? void 0 : _payload$data4.taskId) || ((_payload$data5 = payload.data) === null || _payload$data5 === void 0 ? void 0 : _payload$data5.taskId));
				if (taskDetail.visible && ((_taskDetail$data2 = taskDetail.data) === null || _taskDetail$data2 === void 0 ? void 0 : _taskDetail$data2.taskId) === taskId) imApi.taskDetail(taskId).then(({ data }) => {
					taskDetail.data = data;
				}).catch(() => {});
				if (taskBoard.visible) loadTaskBoard(true);
			}
			if ([
				"conversation.updated",
				"member.joined",
				"member.left",
				"notification.updated"
			].includes(payload.type)) {
				var _activeConversation$v28;
				scheduleConversationRefresh();
				if (((_activeConversation$v28 = activeConversation.value) === null || _activeConversation$v28 === void 0 ? void 0 : _activeConversation$v28.id) === conversationId) loadMembers();
			}
		}
		function applyPresenceUpdate(data = {}) {
			const userId = Number(data.userId);
			if (!userId) return;
			const online = Boolean(data.online);
			presenceByUser.set(userId, {
				online,
				lastActiveAt: data.lastActiveAt
			});
			contacts.value = contacts.value.map(withKnownContactPresence);
			quickContacts.value = quickContacts.value.map(withKnownContactPresence);
			members.value = members.value.map(withKnownContactPresence);
			conversations.value = conversations.value.map(withKnownConversationPresence);
			if (activeConversation.value) activeConversation.value = withKnownConversationPresence(activeConversation.value);
		}
		function normalizeMine(message) {
			return _objectSpread2(_objectSpread2({}, message), {}, { mine: isMine(message) });
		}
		function withKnownContactPresence(contact) {
			const presence = presenceByUser.get(Number(contact.userId));
			return presence ? _objectSpread2(_objectSpread2({}, contact), {}, {
				online: presence.online,
				lastActiveAt: presence.lastActiveAt || contact.lastActiveAt
			}) : contact;
		}
		function withKnownConversationPresence(conversation) {
			if (conversation.type !== "direct" || !conversation.peerUserId) return conversation;
			const presence = presenceByUser.get(Number(conversation.peerUserId));
			return presence ? _objectSpread2(_objectSpread2({}, conversation), {}, {
				peerOnline: presence.online,
				peerLastActiveAt: presence.lastActiveAt || conversation.peerLastActiveAt
			}) : conversation;
		}
		function presenceText(online, lastActiveAt, compact = false) {
			return formatImPresence(online, lastActiveAt, compact, new Date(imStore.presenceClock));
		}
		function isMine(message) {
			var _userStore$userInfo8;
			return Number(message.senderId) === Number((_userStore$userInfo8 = userStore.userInfo) === null || _userStore$userInfo8 === void 0 ? void 0 : _userStore$userInfo8.id);
		}
		function createClientId() {
			var _globalThis$crypto, _globalThis$crypto$ra;
			return (((_globalThis$crypto = globalThis.crypto) === null || _globalThis$crypto === void 0 || (_globalThis$crypto$ra = _globalThis$crypto.randomUUID) === null || _globalThis$crypto$ra === void 0 ? void 0 : _globalThis$crypto$ra.call(_globalThis$crypto)) || `${Date.now()}-${Math.random().toString(16).slice(2)}`).replace(/[^A-Za-z0-9._:-]/g, "");
		}
		function businessName(type) {
			return {
				customer: "客户",
				lead: "线索",
				order: "提单",
				review: "审单",
				receipt: "收款",
				contract: "合同",
				issue: "客户问题",
				training: "培训",
				task: "待办"
			}[type || ""] || type || "业务";
		}
		function reactionIcon(code) {
			return {
				like: "👍",
				ok: "👌",
				thanks: "🙏",
				done: "✅",
				eyes: "👀",
				support: "💪"
			}[code] || "👍";
		}
		function formatConversationTime(value) {
			if (!value) return "";
			const d = new Date(value);
			const n = /* @__PURE__ */ new Date();
			if (d.toDateString() === n.toDateString()) return d.toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
			return `${d.getMonth() + 1}/${d.getDate()}`;
		}
		function formatMessageDate(value) {
			const d = new Date(value);
			const today = /* @__PURE__ */ new Date();
			if (d.toDateString() === today.toDateString()) return "今天";
			const yesterday = new Date(today);
			yesterday.setDate(today.getDate() - 1);
			if (d.toDateString() === yesterday.toDateString()) return "昨天";
			return d.toLocaleDateString("zh-CN", {
				year: d.getFullYear() === today.getFullYear() ? void 0 : "numeric",
				month: "long",
				day: "numeric"
			});
		}
		function formatMessageTime(value) {
			return new Date(value).toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			});
		}
		function formatBytes(size = 0) {
			if (size < 1024) return `${size} B`;
			if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
			return `${(size / 1024 / 1024).toFixed(1)} MB`;
		}
		return (_ctx, _cache) => {
			var _messageCtx$message, _messageCtx$message2;
			const _component_el_button = ElButton;
			const _component_el_input = ElInput;
			const _component_el_icon = ElIcon;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_avatar = ElAvatar;
			const _component_el_empty = ElEmpty;
			const _component_el_tag = ElTag;
			const _component_el_progress = ElProgress;
			const _component_el_popover = ElPopover;
			const _component_el_drawer = ElDrawer;
			const _component_el_form_item = ElFormItem;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_radio_button = ElRadioButton;
			const _component_el_radio_group = ElRadioGroup;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_checkbox_group = ElCheckboxGroup;
			const _component_el_input_number = ElInputNumber;
			const _component_el_image_viewer = ElImageViewer;
			return openBlock(), createElementBlock("div", { class: normalizeClass(["im-shell", `mobile-${mobilePane.value}`]) }, [
				createBaseVNode("aside", _hoisted_1, [createBaseVNode("header", _hoisted_2, [
					createBaseVNode("div", _hoisted_3, [createBaseVNode("div", null, [_cache[73] || (_cache[73] = createBaseVNode("h1", null, "内部沟通", -1)), createBaseVNode("p", null, [createBaseVNode("span", { class: normalizeClass(unref(imStore).connectionState) }, null, 2), createTextVNode(toDisplayString(connectionText.value), 1)])]), createBaseVNode("div", _hoisted_4, [
						createVNode(_component_el_button, {
							circle: "",
							icon: unref(calendar_default),
							title: "我的待办",
							onClick: openTaskBoard
						}, null, 8, ["icon"]),
						createVNode(_component_el_button, {
							circle: "",
							icon: unref(user_default),
							title: "发起单聊",
							onClick: _cache[0] || (_cache[0] = ($event) => openCreate("direct"))
						}, null, 8, ["icon"]),
						createVNode(_component_el_button, {
							circle: "",
							type: "primary",
							icon: unref(plus_default),
							title: "新建群聊",
							onClick: _cache[1] || (_cache[1] = ($event) => openCreate("group"))
						}, null, 8, ["icon"])
					])]),
					createVNode(_component_el_input, {
						modelValue: conversationKeyword.value,
						"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => conversationKeyword.value = $event),
						clearable: "",
						"prefix-icon": unref(search_default),
						placeholder: "搜索员工、群聊、消息或业务编号",
						onInput: scheduleConversationSearch
					}, null, 8, ["modelValue", "prefix-icon"]),
					createBaseVNode("div", _hoisted_5, [(openBlock(), createElementBlock(Fragment, null, renderList(primaryFilters, (item) => {
						return createBaseVNode("button", {
							key: item.key,
							type: "button",
							class: normalizeClass({ active: activeFilter.value === item.key }),
							onClick: ($event) => changeFilter(item.key)
						}, [createTextVNode(toDisplayString(item.label), 1), item.key === "unread" && unref(imStore).summary.unreadConversations ? (openBlock(), createElementBlock("sup", _hoisted_7, toDisplayString(unref(imStore).summary.unreadConversations), 1)) : createCommentVNode("", true)], 10, _hoisted_6);
					}), 64)), createVNode(_component_el_dropdown, {
						trigger: "click",
						onCommand: changeFilter
					}, {
						dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(moreFilters, (item) => {
								return createVNode(_component_el_dropdown_item, {
									key: item.key,
									command: item.key,
									class: normalizeClass({ "is-selected": activeFilter.value === item.key })
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(item.label), 1)]),
									_: 2
								}, 1032, ["command", "class"]);
							}), 64))]),
							_: 1
						})]),
						default: withCtx(() => [createBaseVNode("button", {
							type: "button",
							class: normalizeClass(["more-filter", { active: !primaryFilters.some((i) => i.key === activeFilter.value) }])
						}, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(filter_default))]),
							_: 1
						})], 2)]),
						_: 1
					})])
				]), createBaseVNode("div", {
					ref_key: "conversationListRef",
					ref: conversationListRef,
					class: "conversation-list",
					onScroll: onConversationScroll
				}, [
					conversationKeyword.value.trim() && quickContacts.value.length ? (openBlock(), createElementBlock("div", _hoisted_8, [
						_cache[74] || (_cache[74] = createBaseVNode("h3", null, "联系人", -1)),
						(openBlock(true), createElementBlock(Fragment, null, renderList(quickContacts.value, (contact) => {
							return openBlock(), createElementBlock("button", {
								key: contact.userId,
								type: "button",
								onClick: ($event) => startDirectFromSearch(contact)
							}, [
								createBaseVNode("span", _hoisted_10, [createVNode(_component_el_avatar, {
									size: 34,
									src: contact.avatar
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(contact.name.slice(0, 1)), 1)]),
									_: 2
								}, 1032, ["src"]), createBaseVNode("i", { class: normalizeClass(["presence-dot", { online: contact.online }]) }, null, 2)]),
								createBaseVNode("span", _hoisted_11, [createBaseVNode("b", null, toDisplayString(contact.name), 1), createBaseVNode("small", null, toDisplayString(contact.deptName || contact.empCode), 1)]),
								createBaseVNode("small", { class: normalizeClass(["quick-contact-presence", { online: contact.online }]) }, toDisplayString(presenceText(contact.online, contact.lastActiveAt, true)), 3),
								createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
									_: 1
								})
							], 8, _hoisted_9);
						}), 128)),
						_cache[75] || (_cache[75] = createBaseVNode("h3", null, "会话与消息", -1))
					])) : createCommentVNode("", true),
					(openBlock(true), createElementBlock(Fragment, null, renderList(conversations.value, (conversation) => {
						var _activeConversation$v29;
						return openBlock(), createElementBlock("article", {
							key: conversation.id,
							class: normalizeClass(["conversation-row", {
								active: ((_activeConversation$v29 = activeConversation.value) === null || _activeConversation$v29 === void 0 ? void 0 : _activeConversation$v29.id) === conversation.id,
								unread: conversation.unreadCount || conversation.manualUnreadSeq,
								pinned: conversation.pinned
							}]),
							onClick: ($event) => selectConversation(conversation)
						}, [
							createBaseVNode("span", _hoisted_13, [createVNode(_component_el_avatar, {
								size: 44,
								src: conversation.avatarUrl
							}, {
								default: withCtx(() => {
									var _conversation$name;
									return [createTextVNode(toDisplayString(((_conversation$name = conversation.name) === null || _conversation$name === void 0 ? void 0 : _conversation$name.slice(0, 1)) || "消"), 1)];
								}),
								_: 2
							}, 1032, ["src"]), conversation.type === "direct" ? (openBlock(), createElementBlock("i", {
								key: 0,
								class: normalizeClass(["presence-dot", { online: conversation.peerOnline }])
							}, null, 2)) : createCommentVNode("", true)]),
							createBaseVNode("span", _hoisted_14, [
								createBaseVNode("span", _hoisted_15, [
									createBaseVNode("b", null, toDisplayString(conversation.name), 1),
									conversation.pinned ? (openBlock(), createBlock(_component_el_icon, {
										key: 0,
										title: "已置顶"
									}, {
										default: withCtx(() => [createVNode(unref(top_default))]),
										_: 1
									})) : createCommentVNode("", true),
									createBaseVNode("time", null, toDisplayString(formatConversationTime(conversation.lastMessageAt)), 1)
								]),
								createBaseVNode("span", _hoisted_16, [
									conversation.draft ? (openBlock(), createElementBlock("em", _hoisted_17, "[草稿] " + toDisplayString(conversation.draft), 1)) : (openBlock(), createElementBlock("span", _hoisted_18, toDisplayString(conversation.lastMessageText || "开始一段工作沟通"), 1)),
									conversation.type === "direct" ? (openBlock(), createElementBlock("small", {
										key: 2,
										class: normalizeClass(["conversation-presence", { online: conversation.peerOnline }])
									}, toDisplayString(presenceText(conversation.peerOnline, conversation.peerLastActiveAt, true)), 3)) : createCommentVNode("", true),
									conversation.muted ? (openBlock(), createBlock(_component_el_icon, {
										key: 3,
										title: "免打扰"
									}, {
										default: withCtx(() => [createVNode(unref(mute_notification_default))]),
										_: 1
									})) : createCommentVNode("", true),
									conversation.mentionCount ? (openBlock(), createElementBlock("i", _hoisted_19, "@我")) : createCommentVNode("", true),
									conversation.unreadCount || conversation.manualUnreadSeq ? (openBlock(), createElementBlock("u", _hoisted_20, toDisplayString(conversation.unreadCount > 99 ? "99+" : Math.max(1, conversation.unreadCount)), 1)) : createCommentVNode("", true)
								]),
								conversation.businessType ? (openBlock(), createElementBlock("span", _hoisted_21, toDisplayString(businessName(conversation.businessType)), 1)) : createCommentVNode("", true)
							]),
							createVNode(_component_el_dropdown, {
								trigger: "click",
								class: "conversation-menu",
								onCommand: (command) => handleConversationCommand(command, conversation),
								onClick: _cache[3] || (_cache[3] = withModifiers(() => {}, ["stop"]))
							}, {
								dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
									default: withCtx(() => [
										createVNode(_component_el_dropdown_item, {
											command: "pin",
											icon: unref(top_default)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(conversation.pinned ? "取消置顶" : "置顶会话"), 1)]),
											_: 2
										}, 1032, ["icon"]),
										createVNode(_component_el_dropdown_item, {
											command: "read",
											icon: unref(circle_check_default)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(conversation.unreadCount ? "标记已读" : "标记未读"), 1)]),
											_: 2
										}, 1032, ["icon"]),
										createVNode(_component_el_dropdown_item, {
											command: "mute",
											icon: unref(mute_notification_default)
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(conversation.muted ? "关闭免打扰" : "消息免打扰"), 1)]),
											_: 2
										}, 1032, ["icon"]),
										createVNode(_component_el_dropdown_item, {
											command: "hide",
											icon: unref(hide_default)
										}, {
											default: withCtx(() => [..._cache[76] || (_cache[76] = [createTextVNode("隐藏会话", -1)])]),
											_: 1
										}, 8, ["icon"]),
										conversation.canLeave ? (openBlock(), createBlock(_component_el_dropdown_item, {
											key: 0,
											divided: "",
											command: "leave",
											icon: unref(switch_button_default)
										}, {
											default: withCtx(() => [..._cache[77] || (_cache[77] = [createTextVNode("退出群聊", -1)])]),
											_: 1
										}, 8, ["icon"])) : createCommentVNode("", true)
									]),
									_: 2
								}, 1024)]),
								default: withCtx(() => [createBaseVNode("button", _hoisted_22, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(more_filled_default))]),
									_: 1
								})])]),
								_: 2
							}, 1032, ["onCommand"])
						], 10, _hoisted_12);
					}), 128)),
					conversationLoading.value ? (openBlock(), createElementBlock("div", _hoisted_23, [createVNode(_component_el_icon, { class: "is-loading" }, {
						default: withCtx(() => [createVNode(unref(loading_default))]),
						_: 1
					}), _cache[78] || (_cache[78] = createTextVNode("加载会话", -1))])) : !conversations.value.length ? (openBlock(), createBlock(_component_el_empty, {
						key: 2,
						"image-size": 72,
						description: "没有找到会话"
					})) : createCommentVNode("", true)
				], 544)]),
				createBaseVNode("main", _hoisted_24, [activeConversation.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [
					createBaseVNode("header", _hoisted_25, [
						createBaseVNode("button", {
							class: "mobile-back",
							type: "button",
							title: "返回会话列表",
							onClick: backToConversationList
						}, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(arrow_left_default))]),
							_: 1
						})]),
						createBaseVNode("span", _hoisted_26, [createVNode(_component_el_avatar, {
							size: 40,
							src: activeConversation.value.avatarUrl
						}, {
							default: withCtx(() => {
								var _activeConversation$v30;
								return [createTextVNode(toDisplayString((_activeConversation$v30 = activeConversation.value.name) === null || _activeConversation$v30 === void 0 ? void 0 : _activeConversation$v30.slice(0, 1)), 1)];
							}),
							_: 1
						}, 8, ["src"]), activeConversation.value.type === "direct" ? (openBlock(), createElementBlock("i", {
							key: 0,
							class: normalizeClass(["presence-dot", { online: peerOnline.value }])
						}, null, 2)) : createCommentVNode("", true)]),
						createBaseVNode("div", _hoisted_27, [createBaseVNode("h2", null, toDisplayString(activeConversation.value.name), 1), createBaseVNode("p", null, [conversationReadOnly.value ? (openBlock(), createElementBlock("span", _hoisted_28, "系统自动通知")) : activeConversation.value.type === "direct" ? (openBlock(), createElementBlock("span", {
							key: 1,
							class: normalizeClass(["chat-presence", { online: peerOnline.value }])
						}, toDisplayString(peerPresenceText.value), 3)) : (openBlock(), createElementBlock("span", _hoisted_29, toDisplayString(activeConversation.value.memberCount) + " 名成员", 1)), activeConversation.value.businessType ? (openBlock(), createBlock(_component_el_tag, {
							key: 3,
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(businessName(activeConversation.value.businessType)) + " #" + toDisplayString(activeConversation.value.businessId), 1)]),
							_: 1
						})) : createCommentVNode("", true)])]),
						createBaseVNode("div", _hoisted_30, [
							createVNode(_component_el_button, {
								text: "",
								icon: unref(search_default),
								title: "搜索聊天记录",
								onClick: openMessageSearch
							}, null, 8, ["icon"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(circle_check_default),
								title: "把最新消息转为待办",
								disabled: !latestTaskSource.value,
								onClick: _cache[4] || (_cache[4] = ($event) => openTaskCreate(latestTaskSource.value))
							}, null, 8, ["icon", "disabled"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(top_default),
								class: normalizeClass({ active: activeConversation.value.pinned }),
								title: "置顶",
								onClick: _cache[5] || (_cache[5] = ($event) => updateConversationSetting("pinned", !activeConversation.value.pinned))
							}, null, 8, ["icon", "class"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(mute_notification_default),
								class: normalizeClass({ active: activeConversation.value.muted }),
								title: "免打扰",
								onClick: _cache[6] || (_cache[6] = ($event) => updateConversationSetting("muted", !activeConversation.value.muted))
							}, null, 8, ["icon", "class"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(more_default),
								title: "会话详情",
								onClick: _cache[7] || (_cache[7] = ($event) => detailsDrawer.value = true)
							}, null, 8, ["icon"])
						])
					]),
					createBaseVNode("section", {
						ref_key: "messageScroller",
						ref: messageScroller,
						class: "message-scroller",
						onScroll: onMessageScroll,
						onDragover: _cache[9] || (_cache[9] = withModifiers(() => {}, ["prevent"])),
						onDrop: withModifiers(onDropFiles, ["prevent"])
					}, [createBaseVNode("div", _hoisted_31, [
						hasEarlierMessages.value ? (openBlock(), createElementBlock("button", {
							key: 0,
							class: "load-earlier",
							type: "button",
							disabled: messageLoading.value,
							onClick: loadEarlierMessages
						}, [messageLoading.value ? (openBlock(), createBlock(_component_el_icon, {
							key: 0,
							class: "is-loading"
						}, {
							default: withCtx(() => [createVNode(unref(loading_default))]),
							_: 1
						})) : createCommentVNode("", true), createTextVNode(toDisplayString(messageLoading.value ? "正在加载" : "加载更早消息"), 1)], 8, _hoisted_32)) : messages.value.length ? (openBlock(), createElementBlock("div", _hoisted_33, "已到达当前可见记录起点")) : createCommentVNode("", true),
						messageLoading.value && !messages.value.length ? (openBlock(), createElementBlock("div", _hoisted_34, [createVNode(_component_el_icon, { class: "is-loading" }, {
							default: withCtx(() => [createVNode(unref(loading_default))]),
							_: 1
						}), _cache[79] || (_cache[79] = createBaseVNode("b", null, "正在加载消息", -1))])) : messageLoadError.value && !messages.value.length ? (openBlock(), createElementBlock("div", _hoisted_35, [
							createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(warning_default))]),
								_: 1
							}),
							_cache[81] || (_cache[81] = createBaseVNode("b", null, "消息加载失败", -1)),
							createBaseVNode("p", null, toDisplayString(messageLoadError.value), 1),
							createVNode(_component_el_button, {
								type: "primary",
								plain: "",
								icon: unref(refresh_default),
								onClick: retryActiveConversation
							}, {
								default: withCtx(() => [..._cache[80] || (_cache[80] = [createTextVNode("重新加载", -1)])]),
								_: 1
							}, 8, ["icon"])
						])) : !messages.value.length ? (openBlock(), createElementBlock("div", _hoisted_36, [
							createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
								_: 1
							}),
							createBaseVNode("b", null, toDisplayString(conversationReadOnly.value ? "暂无系统通知" : "还没有消息"), 1),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(refresh_default),
								onClick: retryActiveConversation
							}, {
								default: withCtx(() => [..._cache[82] || (_cache[82] = [createTextVNode("刷新", -1)])]),
								_: 1
							}, 8, ["icon"])
						])) : createCommentVNode("", true),
						(openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (message, index) => {
							var _message$attachments, _message$reactions;
							return openBlock(), createElementBlock(Fragment, { key: `${message.conversationId}:${message.clientMessageId || message.id}` }, [
								showDateDivider(index) ? (openBlock(), createElementBlock("div", _hoisted_37, [createBaseVNode("span", null, toDisplayString(formatMessageDate(message.createdAt)), 1)])) : createCommentVNode("", true),
								showUnreadDivider(message, index) ? (openBlock(), createElementBlock("div", _hoisted_38, [..._cache[83] || (_cache[83] = [createBaseVNode("span", null, "以下是未读消息", -1)])])) : createCommentVNode("", true),
								createBaseVNode("article", {
									id: `im-message-${message.id}`,
									"data-message-seq": message.id > 0 ? message.seq : void 0,
									class: normalizeClass(["message-row", {
										mine: isMine(message),
										recalled: message.recalled,
										highlighted: highlightedMessageId.value === message.id
									}]),
									onContextmenu: withModifiers(($event) => openMessageContextMenu($event, message), ["prevent"])
								}, [createVNode(_component_el_avatar, {
									size: 34,
									src: message.senderAvatar
								}, {
									default: withCtx(() => {
										var _message$senderName;
										return [createTextVNode(toDisplayString((_message$senderName = message.senderName) === null || _message$senderName === void 0 ? void 0 : _message$senderName.slice(0, 1)), 1)];
									}),
									_: 2
								}, 1032, ["src"]), createBaseVNode("div", _hoisted_40, [
									createBaseVNode("div", _hoisted_41, [createBaseVNode("b", null, toDisplayString(message.senderName), 1), createBaseVNode("time", null, toDisplayString(formatMessageTime(message.createdAt)), 1)]),
									createBaseVNode("div", { class: normalizeClass(["message-bubble", message.messageType]) }, [
										message.forwardedFrom ? (openBlock(), createElementBlock("div", _hoisted_42, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(share_default))]),
											_: 1
										}), createBaseVNode("span", null, "转发自 " + toDisplayString(message.forwardedFrom.senderName) + " · " + toDisplayString(message.forwardedFrom.conversationName), 1)])) : createCommentVNode("", true),
										message.replyTo ? (openBlock(), createElementBlock("button", {
											key: 1,
											type: "button",
											class: "reply-quote",
											onClick: ($event) => jumpToMessage(message.replyTo.id)
										}, [createBaseVNode("b", null, toDisplayString(message.replyTo.senderName), 1), createBaseVNode("span", null, toDisplayString(message.replyTo.text), 1)], 8, _hoisted_43)) : createCommentVNode("", true),
										(message.text || message.recalled) && !["task", "business"].includes(message.messageType) ? (openBlock(), createElementBlock("p", _hoisted_44, toDisplayString(message.text), 1)) : createCommentVNode("", true),
										message.task ? (openBlock(), createBlock(TaskCard_default, {
											key: 3,
											task: message.task,
											onOpen: openTaskDetail,
											onAccept: acceptTask,
											onSubmit: openTaskSubmit,
											onReview: openTaskReview
										}, null, 8, ["task"])) : createCommentVNode("", true),
										message.business ? (openBlock(), createBlock(BusinessCard_default, {
											key: 4,
											card: message.business,
											"message-text": message.text,
											onOpen: openBusinessAction
										}, null, 8, ["card", "message-text"])) : createCommentVNode("", true),
										((_message$attachments = message.attachments) === null || _message$attachments === void 0 ? void 0 : _message$attachments.length) ? (openBlock(), createElementBlock("div", _hoisted_45, [(openBlock(true), createElementBlock(Fragment, null, renderList(message.attachments, (attachment) => {
											return openBlock(), createElementBlock(Fragment, { key: attachment.id }, [attachment.image ? (openBlock(), createElementBlock("button", {
												key: 0,
												class: "image-attachment",
												type: "button",
												onClick: ($event) => previewImage(attachment)
											}, [attachmentUrls[attachment.id] ? (openBlock(), createElementBlock("img", {
												key: 0,
												src: attachmentUrls[attachment.id],
												alt: attachment.originalName,
												loading: "lazy"
											}, null, 8, _hoisted_47)) : (openBlock(), createElementBlock("span", _hoisted_48, [createVNode(_component_el_icon, { class: "is-loading" }, {
												default: withCtx(() => [createVNode(unref(loading_default))]),
												_: 1
											})]))], 8, _hoisted_46)) : (openBlock(), createElementBlock("button", {
												key: 1,
												class: "file-attachment",
												type: "button",
												onClick: ($event) => downloadAttachment(attachment)
											}, [
												createBaseVNode("span", _hoisted_50, [createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(document_default))]),
													_: 1
												})]),
												createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(attachment.originalName), 1), createBaseVNode("small", null, toDisplayString(formatBytes(attachment.fileSize)), 1)]),
												createVNode(_component_el_icon, null, {
													default: withCtx(() => [createVNode(unref(download_default))]),
													_: 1
												})
											], 8, _hoisted_49))], 64);
										}), 128))])) : createCommentVNode("", true),
										message.edited && !message.recalled ? (openBlock(), createElementBlock("small", _hoisted_51, "已编辑")) : createCommentVNode("", true)
									], 2),
									((_message$reactions = message.reactions) === null || _message$reactions === void 0 ? void 0 : _message$reactions.length) ? (openBlock(), createElementBlock("div", _hoisted_52, [(openBlock(true), createElementBlock(Fragment, null, renderList(message.reactions, (reaction) => {
										return openBlock(), createElementBlock("button", {
											key: reaction.code,
											type: "button",
											class: normalizeClass({ active: reaction.reactedByMe }),
											title: reaction.userNames.join("、"),
											onClick: ($event) => toggleReaction(message, reaction.code)
										}, [createTextVNode(toDisplayString(reactionIcon(reaction.code)) + " ", 1), createBaseVNode("span", null, toDisplayString(reaction.count), 1)], 10, _hoisted_53);
									}), 128))])) : createCommentVNode("", true),
									isMine(message) && message.status !== "recalled" ? (openBlock(), createElementBlock("div", _hoisted_54, [message.status === "failed" ? (openBlock(), createElementBlock("button", {
										key: 0,
										type: "button",
										class: "failed",
										onClick: ($event) => retryMessage(message)
									}, [createVNode(_component_el_icon, null, {
										default: withCtx(() => [createVNode(unref(warning_default))]),
										_: 1
									}), _cache[84] || (_cache[84] = createTextVNode("发送失败，点击重试", -1))], 8, _hoisted_55)) : message.status === "sending" ? (openBlock(), createElementBlock("span", _hoisted_56, [createVNode(_component_el_icon, { class: "is-loading" }, {
										default: withCtx(() => [createVNode(unref(loading_default))]),
										_: 1
									}), _cache[85] || (_cache[85] = createTextVNode("发送中", -1))])) : (openBlock(), createElementBlock("button", {
										key: 2,
										type: "button",
										class: normalizeClass({ read: isMessageRead(message) }),
										disabled: message.id <= 0 || message.readCount + message.unreadCount === 0,
										onClick: ($event) => showReceipt(message)
									}, toDisplayString(deliveryLabel(message)), 11, _hoisted_57))])) : createCommentVNode("", true),
									!message.recalled ? (openBlock(), createElementBlock("div", _hoisted_58, [
										createVNode(_component_el_button, {
											text: "",
											icon: unref(chat_line_square_default),
											title: "回复",
											onClick: ($event) => replyMessage.value = message
										}, null, 8, ["icon", "onClick"]),
										createVNode(_component_el_button, {
											text: "",
											icon: unref(copy_document_default),
											title: "复制",
											onClick: ($event) => copyMessage(message)
										}, null, 8, ["icon", "onClick"]),
										createVNode(_component_el_button, {
											text: "",
											icon: unref(share_default),
											title: "转发",
											onClick: ($event) => openForward(message)
										}, null, 8, ["icon", "onClick"]),
										createVNode(_component_el_dropdown, {
											trigger: "click",
											onCommand: (command) => handleMessageCommand(command, message)
										}, {
											dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
												default: withCtx(() => [
													createVNode(_component_el_dropdown_item, { command: "reaction" }, {
														default: withCtx(() => [..._cache[86] || (_cache[86] = [createTextVNode("添加回应", -1)])]),
														_: 1
													}),
													createVNode(_component_el_dropdown_item, { command: "favorite" }, {
														default: withCtx(() => [createTextVNode(toDisplayString(message.favorite ? "取消收藏" : "收藏"), 1)]),
														_: 2
													}, 1024),
													createVNode(_component_el_dropdown_item, { command: "important" }, {
														default: withCtx(() => [createTextVNode(toDisplayString(message.important ? "取消重要" : "标记重要"), 1)]),
														_: 2
													}, 1024),
													message.messageType !== "task" ? (openBlock(), createBlock(_component_el_dropdown_item, {
														key: 0,
														command: "task"
													}, {
														default: withCtx(() => [..._cache[87] || (_cache[87] = [createTextVNode("转为待办", -1)])]),
														_: 1
													})) : createCommentVNode("", true),
													isMine(message) ? (openBlock(), createBlock(_component_el_dropdown_item, {
														key: 1,
														command: "edit"
													}, {
														default: withCtx(() => [..._cache[88] || (_cache[88] = [createTextVNode("编辑", -1)])]),
														_: 1
													})) : createCommentVNode("", true),
													isMine(message) ? (openBlock(), createBlock(_component_el_dropdown_item, {
														key: 2,
														command: "recall"
													}, {
														default: withCtx(() => [..._cache[89] || (_cache[89] = [createTextVNode("撤回", -1)])]),
														_: 1
													})) : createCommentVNode("", true),
													isMine(message) ? (openBlock(), createBlock(_component_el_dropdown_item, {
														key: 3,
														command: "receipt"
													}, {
														default: withCtx(() => [..._cache[90] || (_cache[90] = [createTextVNode("查看已读人员", -1)])]),
														_: 1
													})) : createCommentVNode("", true)
												]),
												_: 2
											}, 1024)]),
											default: withCtx(() => [createVNode(_component_el_button, {
												text: "",
												icon: unref(more_filled_default),
												title: "更多操作"
											}, null, 8, ["icon"])]),
											_: 2
										}, 1032, ["onCommand"])
									])) : createCommentVNode("", true)
								])], 42, _hoisted_39)
							], 64);
						}), 128))
					]), newMessageCount.value ? (openBlock(), createElementBlock("button", {
						key: 0,
						class: "new-message-float",
						type: "button",
						onClick: _cache[8] || (_cache[8] = ($event) => scrollToBottom(true))
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(arrow_down_default))]),
						_: 1
					}), createTextVNode(toDisplayString(newMessageCount.value) + " 条新消息 ", 1)])) : createCommentVNode("", true)], 544),
					!conversationReadOnly.value ? (openBlock(), createElementBlock("section", {
						key: 0,
						class: normalizeClass(["composer", { dragging: composerDragging.value }]),
						onDragenter: _cache[17] || (_cache[17] = withModifiers(($event) => composerDragging.value = true, ["prevent"])),
						onDragleave: _cache[18] || (_cache[18] = withModifiers(($event) => composerDragging.value = false, ["prevent"])),
						onDragover: _cache[19] || (_cache[19] = withModifiers(() => {}, ["prevent"])),
						onDrop: withModifiers(onDropFiles, ["prevent"])
					}, [
						unref(imStore).connectionState === "offline" || unref(imStore).connectionState === "reconnecting" ? (openBlock(), createElementBlock("div", _hoisted_59, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(connection_default))]),
							_: 1
						}), createTextVNode(toDisplayString(unref(imStore).connectionState === "offline" ? "网络已断开，草稿已保留" : "正在恢复实时连接，发送仍会通过接口重试"), 1)])) : createCommentVNode("", true),
						replyMessage.value ? (openBlock(), createElementBlock("div", _hoisted_60, [createBaseVNode("span", null, [createBaseVNode("b", null, "回复 " + toDisplayString(replyMessage.value.senderName), 1), createBaseVNode("small", null, toDisplayString(replyMessage.value.text), 1)]), createVNode(_component_el_button, {
							text: "",
							icon: unref(close_default),
							title: "取消回复",
							onClick: _cache[10] || (_cache[10] = ($event) => replyMessage.value = null)
						}, null, 8, ["icon"])])) : createCommentVNode("", true),
						uploadQueue.value.length ? (openBlock(), createElementBlock("div", _hoisted_61, [(openBlock(true), createElementBlock(Fragment, null, renderList(uploadQueue.value, (item) => {
							return openBlock(), createElementBlock("div", {
								key: item.key,
								class: normalizeClass(item.status)
							}, [
								createBaseVNode("span", _hoisted_62, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.file.type.startsWith("image/") ? unref(picture_default) : unref(document_default))))]),
									_: 2
								}, 1024)]),
								createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(item.file.name), 1), createBaseVNode("small", null, toDisplayString(item.status === "failed" ? item.error : item.status === "done" ? "上传完成" : `上传中 ${item.progress}%`), 1)]),
								item.status === "uploading" ? (openBlock(), createBlock(_component_el_progress, {
									key: 0,
									percentage: item.progress,
									"show-text": false
								}, null, 8, ["percentage"])) : createCommentVNode("", true),
								item.status === "failed" ? (openBlock(), createBlock(_component_el_button, {
									key: 1,
									text: "",
									icon: unref(refresh_default),
									title: "重试上传",
									onClick: ($event) => uploadOne(item)
								}, null, 8, ["icon", "onClick"])) : createCommentVNode("", true),
								createVNode(_component_el_button, {
									text: "",
									icon: unref(close_default),
									title: "移除附件",
									onClick: ($event) => removeUpload(item.key)
								}, null, 8, ["icon", "onClick"])
							], 2);
						}), 128))])) : createCommentVNode("", true),
						createBaseVNode("div", _hoisted_63, [
							createVNode(_component_el_popover, {
								visible: emojiVisible.value,
								"onUpdate:visible": _cache[11] || (_cache[11] = ($event) => emojiVisible.value = $event),
								placement: "top-start",
								width: 260,
								trigger: "click"
							}, {
								reference: withCtx(() => [createVNode(_component_el_button, {
									text: "",
									icon: unref(sunny_default),
									title: "表情"
								}, null, 8, ["icon"])]),
								default: withCtx(() => [createBaseVNode("div", _hoisted_64, [(openBlock(), createElementBlock(Fragment, null, renderList(emojis, (emoji) => {
									return createBaseVNode("button", {
										key: emoji,
										type: "button",
										onClick: ($event) => insertEmoji(emoji)
									}, toDisplayString(emoji), 9, _hoisted_65);
								}), 64))])]),
								_: 1
							}, 8, ["visible"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(picture_default),
								title: "发送图片",
								onClick: _cache[12] || (_cache[12] = ($event) => openFilePicker("image"))
							}, null, 8, ["icon"]),
							createVNode(_component_el_button, {
								text: "",
								icon: unref(paperclip_default),
								title: "发送文件",
								onClick: _cache[13] || (_cache[13] = ($event) => openFilePicker("file"))
							}, null, 8, ["icon"]),
							createVNode(_component_el_button, {
								text: "",
								class: "at-button",
								title: "@成员",
								onClick: openMentionPicker
							}, {
								default: withCtx(() => [..._cache[91] || (_cache[91] = [createTextVNode("@", -1)])]),
								_: 1
							})
						]),
						createBaseVNode("div", _hoisted_66, [createVNode(_component_el_input, {
							ref_key: "composerInput",
							ref: composerInput,
							modelValue: draftText.value,
							"onUpdate:modelValue": _cache[14] || (_cache[14] = ($event) => draftText.value = $event),
							type: "textarea",
							autosize: {
								minRows: 3,
								maxRows: 7
							},
							resize: "none",
							placeholder: "输入工作消息，Enter 发送，Shift+Enter 换行",
							onKeydown: onComposerKeydown,
							onPaste
						}, null, 8, ["modelValue"]), createVNode(_component_el_button, {
							type: "primary",
							disabled: !canSend.value,
							loading: sending.value,
							onClick: sendMessage
						}, {
							default: withCtx(() => [..._cache[92] || (_cache[92] = [createTextVNode("发送", -1)])]),
							_: 1
						}, 8, ["disabled", "loading"])]),
						mentionPickerVisible.value ? (openBlock(), createElementBlock("div", _hoisted_67, [
							createBaseVNode("header", null, [_cache[93] || (_cache[93] = createBaseVNode("b", null, "选择群成员", -1)), createVNode(_component_el_input, {
								modelValue: mentionKeyword.value,
								"onUpdate:modelValue": _cache[15] || (_cache[15] = ($event) => mentionKeyword.value = $event),
								size: "small",
								clearable: "",
								placeholder: "姓名、部门或工号"
							}, null, 8, ["modelValue"])]),
							activeConversation.value.canMentionAll ? (openBlock(), createElementBlock("button", {
								key: 0,
								type: "button",
								onClick: _cache[16] || (_cache[16] = ($event) => insertMention(null))
							}, [..._cache[94] || (_cache[94] = [createBaseVNode("span", { class: "mention-all" }, "@", -1), createBaseVNode("span", null, [createBaseVNode("b", null, "所有人"), createBaseVNode("small", null, "提醒当前会话全部成员")], -1)])])) : createCommentVNode("", true),
							(openBlock(true), createElementBlock(Fragment, null, renderList(filteredMentionMembers.value, (member) => {
								return openBlock(), createElementBlock("button", {
									key: member.userId,
									type: "button",
									onClick: ($event) => insertMention(member)
								}, [createVNode(_component_el_avatar, {
									size: 30,
									src: member.avatar
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(member.name.slice(0, 1)), 1)]),
									_: 2
								}, 1032, ["src"]), createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(member.name), 1), createBaseVNode("small", null, toDisplayString(member.deptName || member.empCode), 1)])], 8, _hoisted_68);
							}), 128))
						])) : createCommentVNode("", true),
						createBaseVNode("input", {
							ref_key: "imageInput",
							ref: imageInput,
							hidden: "",
							type: "file",
							accept: "image/*",
							multiple: "",
							onChange: onFileInput
						}, null, 544),
						createBaseVNode("input", {
							ref_key: "fileInput",
							ref: fileInput,
							hidden: "",
							type: "file",
							multiple: "",
							onChange: onFileInput
						}, null, 544)
					], 34)) : (openBlock(), createElementBlock("section", _hoisted_69, [
						createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(lock_default))]),
							_: 1
						}),
						_cache[95] || (_cache[95] = createBaseVNode("span", null, "系统通知", -1)),
						_cache[96] || (_cache[96] = createBaseVNode("small", null, "仅供查看", -1))
					]))
				], 64)) : (openBlock(), createElementBlock("div", _hoisted_70, [
					createBaseVNode("div", _hoisted_71, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(chat_dot_round_default))]),
						_: 1
					})]),
					_cache[98] || (_cache[98] = createBaseVNode("h2", null, "选择一条会话开始沟通", -1)),
					_cache[99] || (_cache[99] = createBaseVNode("p", null, "业务沟通、阅读确认和工作记录都会保存在公司系统中", -1)),
					createVNode(_component_el_button, {
						type: "primary",
						icon: unref(user_default),
						onClick: _cache[20] || (_cache[20] = ($event) => openCreate("direct"))
					}, {
						default: withCtx(() => [..._cache[97] || (_cache[97] = [createTextVNode("发起消息", -1)])]),
						_: 1
					}, 8, ["icon"])
				]))]),
				activeConversation.value ? (openBlock(), createElementBlock("aside", _hoisted_72, [createVNode(ConversationDetails_default, {
					conversation: activeConversation.value,
					members: members.value,
					files: conversationFiles.value,
					preference: unref(imStore).preference,
					onSetting: updateConversationSetting,
					onPreference: updatePreference,
					onAddMembers: openAddMembers,
					onLeave: _cache[21] || (_cache[21] = ($event) => leaveConversation(activeConversation.value)),
					onDownload: downloadAttachment
				}, null, 8, [
					"conversation",
					"members",
					"files",
					"preference"
				])])) : createCommentVNode("", true),
				createVNode(_component_el_drawer, {
					modelValue: detailsDrawer.value,
					"onUpdate:modelValue": _cache[23] || (_cache[23] = ($event) => detailsDrawer.value = $event),
					class: "im-detail-drawer",
					size: "320px",
					title: "会话详情",
					"append-to-body": ""
				}, {
					default: withCtx(() => [activeConversation.value ? (openBlock(), createBlock(ConversationDetails_default, {
						key: 0,
						conversation: activeConversation.value,
						members: members.value,
						files: conversationFiles.value,
						preference: unref(imStore).preference,
						onSetting: updateConversationSetting,
						onPreference: updatePreference,
						onAddMembers: openAddMembers,
						onLeave: _cache[22] || (_cache[22] = ($event) => leaveConversation(activeConversation.value)),
						onDownload: downloadAttachment
					}, null, 8, [
						"conversation",
						"members",
						"files",
						"preference"
					])) : createCommentVNode("", true)]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: createDialog.visible,
					"onUpdate:modelValue": _cache[27] || (_cache[27] = ($event) => createDialog.visible = $event),
					title: createDialog.mode === "direct" ? "发起单聊" : "新建群聊",
					width: "520px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[26] || (_cache[26] = ($event) => createDialog.visible = false) }, {
						default: withCtx(() => [..._cache[100] || (_cache[100] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: createDialog.loading,
						disabled: !createDialog.selected.length || createDialog.mode === "group" && !createDialog.name.trim(),
						onClick: submitCreate
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(createDialog.mode === "direct" ? "进入会话" : `创建群聊${createDialog.selected.length ? `（${createDialog.selected.length + 1}人）` : ""}`), 1)]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [
						createDialog.mode === "group" ? (openBlock(), createBlock(_component_el_form, {
							key: 0,
							"label-position": "top"
						}, {
							default: withCtx(() => [createVNode(_component_el_form_item, { label: "群聊名称" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: createDialog.name,
									"onUpdate:modelValue": _cache[24] || (_cache[24] = ($event) => createDialog.name = $event),
									maxlength: "120",
									"show-word-limit": "",
									placeholder: "例如：7月审单异常协作群"
								}, null, 8, ["modelValue"])]),
								_: 1
							})]),
							_: 1
						})) : createCommentVNode("", true),
						createVNode(_component_el_input, {
							modelValue: contactKeyword.value,
							"onUpdate:modelValue": _cache[25] || (_cache[25] = ($event) => contactKeyword.value = $event),
							clearable: "",
							"prefix-icon": unref(search_default),
							placeholder: "搜索姓名、部门或员工编号",
							onInput: loadContacts
						}, null, 8, ["modelValue", "prefix-icon"]),
						createBaseVNode("div", _hoisted_73, [(openBlock(true), createElementBlock(Fragment, null, renderList(contacts.value, (contact) => {
							return openBlock(), createElementBlock("button", {
								key: contact.userId,
								type: "button",
								class: normalizeClass({ selected: createDialog.selected.includes(contact.userId) }),
								onClick: ($event) => toggleContact(contact)
							}, [
								createBaseVNode("span", _hoisted_75, [createVNode(_component_el_avatar, {
									size: 38,
									src: contact.avatar
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(contact.name.slice(0, 1)), 1)]),
									_: 2
								}, 1032, ["src"]), createBaseVNode("i", { class: normalizeClass(["presence-dot", { online: contact.online }]) }, null, 2)]),
								createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(contact.name), 1), createBaseVNode("small", null, [createTextVNode(toDisplayString(contact.deptName || "未设置部门"), 1), contact.empCode ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · " + toDisplayString(contact.empCode), 1)], 64)) : createCommentVNode("", true)])]),
								createBaseVNode("small", { class: normalizeClass(["contact-presence", { online: contact.online }]) }, toDisplayString(presenceText(contact.online, contact.lastActiveAt, true)), 3),
								createDialog.selected.includes(contact.userId) ? (openBlock(), createBlock(_component_el_icon, {
									key: 0,
									class: "selected-icon"
								}, {
									default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
									_: 1
								})) : createCommentVNode("", true)
							], 10, _hoisted_74);
						}), 128))])
					]),
					_: 1
				}, 8, ["modelValue", "title"]),
				createVNode(_component_el_dialog, {
					modelValue: addMemberDialog.value,
					"onUpdate:modelValue": _cache[30] || (_cache[30] = ($event) => addMemberDialog.value = $event),
					title: "添加群成员",
					width: "500px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[29] || (_cache[29] = ($event) => addMemberDialog.value = false) }, {
						default: withCtx(() => [..._cache[101] || (_cache[101] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						disabled: !addMemberSelected.value.length,
						onClick: submitAddMembers
					}, {
						default: withCtx(() => [..._cache[102] || (_cache[102] = [createTextVNode("添加", -1)])]),
						_: 1
					}, 8, ["disabled"])]),
					default: withCtx(() => [createVNode(_component_el_input, {
						modelValue: contactKeyword.value,
						"onUpdate:modelValue": _cache[28] || (_cache[28] = ($event) => contactKeyword.value = $event),
						clearable: "",
						"prefix-icon": unref(search_default),
						placeholder: "搜索员工",
						onInput: loadContacts
					}, null, 8, ["modelValue", "prefix-icon"]), createBaseVNode("div", _hoisted_76, [(openBlock(true), createElementBlock(Fragment, null, renderList(availableAddMembers.value, (contact) => {
						return openBlock(), createElementBlock("button", {
							key: contact.userId,
							type: "button",
							class: normalizeClass({ selected: addMemberSelected.value.includes(contact.userId) }),
							onClick: ($event) => toggleAddMember(contact.userId)
						}, [
							createBaseVNode("span", _hoisted_78, [createVNode(_component_el_avatar, {
								size: 36,
								src: contact.avatar
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(contact.name.slice(0, 1)), 1)]),
								_: 2
							}, 1032, ["src"]), createBaseVNode("i", { class: normalizeClass(["presence-dot", { online: contact.online }]) }, null, 2)]),
							createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(contact.name), 1), createBaseVNode("small", null, toDisplayString(contact.deptName), 1)]),
							createBaseVNode("small", { class: normalizeClass(["contact-presence", { online: contact.online }]) }, toDisplayString(presenceText(contact.online, contact.lastActiveAt, true)), 3),
							addMemberSelected.value.includes(contact.userId) ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
								default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
								_: 1
							})) : createCommentVNode("", true)
						], 10, _hoisted_77);
					}), 128))])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: messageSearch.visible,
					"onUpdate:modelValue": _cache[32] || (_cache[32] = ($event) => messageSearch.visible = $event),
					title: "搜索聊天记录",
					size: "420px",
					"append-to-body": ""
				}, {
					default: withCtx(() => [
						createVNode(_component_el_input, {
							modelValue: messageSearch.keyword,
							"onUpdate:modelValue": _cache[31] || (_cache[31] = ($event) => messageSearch.keyword = $event),
							clearable: "",
							"prefix-icon": unref(search_default),
							placeholder: "输入消息内容",
							onKeyup: withKeys(searchInConversation, ["enter"])
						}, null, 8, ["modelValue", "prefix-icon"]),
						createVNode(_component_el_button, {
							class: "search-submit",
							type: "primary",
							loading: messageSearch.loading,
							onClick: searchInConversation
						}, {
							default: withCtx(() => [..._cache[103] || (_cache[103] = [createTextVNode("搜索", -1)])]),
							_: 1
						}, 8, ["loading"]),
						createBaseVNode("div", _hoisted_79, [(openBlock(true), createElementBlock(Fragment, null, renderList(messageSearch.results, (result) => {
							return openBlock(), createElementBlock("button", {
								key: result.id,
								type: "button",
								onClick: ($event) => openSearchResult(result)
							}, [createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(result.senderName), 1), createBaseVNode("time", null, toDisplayString(formatMessageDate(result.createdAt)), 1)]), createBaseVNode("p", null, toDisplayString(result.text), 1)], 8, _hoisted_80);
						}), 128)), messageSearch.searched && !messageSearch.results.length ? (openBlock(), createBlock(_component_el_empty, {
							key: 0,
							"image-size": 64,
							description: "未找到相关消息"
						})) : createCommentVNode("", true)])
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: receiptDialog.visible,
					"onUpdate:modelValue": _cache[33] || (_cache[33] = ($event) => receiptDialog.visible = $event),
					title: "消息阅读情况",
					width: "520px",
					"append-to-body": ""
				}, {
					default: withCtx(() => [createVNode(_component_el_tabs, null, {
						default: withCtx(() => {
							var _receiptDialog$data, _receiptDialog$data3;
							return [createVNode(_component_el_tab_pane, { label: `已读 ${((_receiptDialog$data = receiptDialog.data) === null || _receiptDialog$data === void 0 ? void 0 : _receiptDialog$data.readCount) || 0}` }, {
								default: withCtx(() => {
									var _receiptDialog$data2;
									return [createBaseVNode("div", _hoisted_81, [(openBlock(true), createElementBlock(Fragment, null, renderList(((_receiptDialog$data2 = receiptDialog.data) === null || _receiptDialog$data2 === void 0 ? void 0 : _receiptDialog$data2.readUsers) || [], (user) => {
										return openBlock(), createElementBlock("span", { key: user.userId }, [createVNode(_component_el_avatar, {
											size: 32,
											src: user.avatar
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(user.name.slice(0, 1)), 1)]),
											_: 2
										}, 1032, ["src"]), createTextVNode(toDisplayString(user.name), 1)]);
									}), 128))])];
								}),
								_: 1
							}, 8, ["label"]), createVNode(_component_el_tab_pane, { label: `未读 ${((_receiptDialog$data3 = receiptDialog.data) === null || _receiptDialog$data3 === void 0 ? void 0 : _receiptDialog$data3.unreadCount) || 0}` }, {
								default: withCtx(() => {
									var _receiptDialog$data4;
									return [createBaseVNode("div", _hoisted_82, [(openBlock(true), createElementBlock(Fragment, null, renderList(((_receiptDialog$data4 = receiptDialog.data) === null || _receiptDialog$data4 === void 0 ? void 0 : _receiptDialog$data4.unreadUsers) || [], (user) => {
										return openBlock(), createElementBlock("span", { key: user.userId }, [createVNode(_component_el_avatar, {
											size: 32,
											src: user.avatar
										}, {
											default: withCtx(() => [createTextVNode(toDisplayString(user.name.slice(0, 1)), 1)]),
											_: 2
										}, 1032, ["src"]), createTextVNode(toDisplayString(user.name), 1)]);
									}), 128))])];
								}),
								_: 1
							}, 8, ["label"])];
						}),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: forwardDialog.visible,
					"onUpdate:modelValue": _cache[36] || (_cache[36] = ($event) => forwardDialog.visible = $event),
					title: "转发消息",
					width: "480px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[35] || (_cache[35] = ($event) => forwardDialog.visible = false) }, {
						default: withCtx(() => [..._cache[104] || (_cache[104] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						disabled: !forwardDialog.targetId,
						onClick: submitForward
					}, {
						default: withCtx(() => [..._cache[105] || (_cache[105] = [createTextVNode("转发", -1)])]),
						_: 1
					}, 8, ["disabled"])]),
					default: withCtx(() => [createVNode(_component_el_input, {
						modelValue: forwardDialog.keyword,
						"onUpdate:modelValue": _cache[34] || (_cache[34] = ($event) => forwardDialog.keyword = $event),
						clearable: "",
						"prefix-icon": unref(search_default),
						placeholder: "搜索目标会话"
					}, null, 8, ["modelValue", "prefix-icon"]), createBaseVNode("div", _hoisted_83, [(openBlock(true), createElementBlock(Fragment, null, renderList(forwardTargets.value, (conversation) => {
						return openBlock(), createElementBlock("button", {
							key: conversation.id,
							type: "button",
							class: normalizeClass({ selected: forwardDialog.targetId === conversation.id }),
							onClick: ($event) => forwardDialog.targetId = conversation.id
						}, [
							createVNode(_component_el_avatar, {
								size: 36,
								src: conversation.avatarUrl
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(conversation.name.slice(0, 1)), 1)]),
								_: 2
							}, 1032, ["src"]),
							createBaseVNode("span", null, toDisplayString(conversation.name), 1),
							forwardDialog.targetId === conversation.id ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
								default: withCtx(() => [createVNode(unref(circle_check_filled_default))]),
								_: 1
							})) : createCommentVNode("", true)
						], 10, _hoisted_84);
					}), 128))])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: taskCreate.visible,
					"onUpdate:modelValue": _cache[49] || (_cache[49] = ($event) => taskCreate.visible = $event),
					title: "转为工作待办",
					width: "720px",
					class: "task-create-dialog",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[48] || (_cache[48] = ($event) => taskCreate.visible = false) }, {
						default: withCtx(() => [..._cache[113] || (_cache[113] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: taskCreate.loading,
						disabled: !canCreateTask.value,
						onClick: submitTaskCreate
					}, {
						default: withCtx(() => [..._cache[114] || (_cache[114] = [createTextVNode("创建并发送待办", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [taskCreate.source ? (openBlock(), createElementBlock("div", _hoisted_85, [
						_cache[106] || (_cache[106] = createBaseVNode("span", null, "来源消息", -1)),
						createBaseVNode("b", null, toDisplayString(taskCreate.source.senderName), 1),
						createBaseVNode("p", null, toDisplayString(taskCreate.source.text || `[${taskCreate.source.messageType}]`), 1)
					])) : createCommentVNode("", true), createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "待办标题",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: taskCreate.title,
									"onUpdate:modelValue": _cache[37] || (_cache[37] = ($event) => taskCreate.title = $event),
									maxlength: "200",
									"show-word-limit": "",
									placeholder: "用一句话说明需要完成什么"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_86, [
								createVNode(_component_el_form_item, {
									label: "责任人",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: taskCreate.responsibleIds,
										"onUpdate:modelValue": _cache[38] || (_cache[38] = ($event) => taskCreate.responsibleIds = $event),
										multiple: "",
										filterable: "",
										"collapse-tags": "",
										"max-collapse-tags": 2,
										placeholder: "选择一人或多人"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(members.value, (member) => {
											return openBlock(), createBlock(_component_el_option, {
												key: member.userId,
												label: `${member.name}${member.deptName ? ` · ${member.deptName}` : ""}`,
												value: member.userId
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "协同人" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: taskCreate.collaboratorIds,
										"onUpdate:modelValue": _cache[39] || (_cache[39] = ($event) => taskCreate.collaboratorIds = $event),
										multiple: "",
										filterable: "",
										"collapse-tags": "",
										"max-collapse-tags": 2,
										placeholder: "选填"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(members.value, (member) => {
											return openBlock(), createBlock(_component_el_option, {
												key: member.userId,
												label: `${member.name}${member.deptName ? ` · ${member.deptName}` : ""}`,
												value: member.userId,
												disabled: taskCreate.responsibleIds.includes(member.userId)
											}, null, 8, [
												"label",
												"value",
												"disabled"
											]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "所属部门" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: taskCreate.deptId,
										"onUpdate:modelValue": _cache[40] || (_cache[40] = ($event) => taskCreate.deptId = $event),
										clearable: "",
										placeholder: "按责任人自动带出"
									}, {
										default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(taskDepartmentOptions.value, (dept) => {
											return openBlock(), createBlock(_component_el_option, {
												key: dept.id,
												label: dept.name,
												value: dept.id
											}, null, 8, ["label", "value"]);
										}), 128))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "优先级",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_radio_group, {
										modelValue: taskCreate.priority,
										"onUpdate:modelValue": _cache[41] || (_cache[41] = ($event) => taskCreate.priority = $event)
									}, {
										default: withCtx(() => [
											createVNode(_component_el_radio_button, { value: "urgent" }, {
												default: withCtx(() => [..._cache[107] || (_cache[107] = [createTextVNode("紧急", -1)])]),
												_: 1
											}),
											createVNode(_component_el_radio_button, { value: "important" }, {
												default: withCtx(() => [..._cache[108] || (_cache[108] = [createTextVNode("重要", -1)])]),
												_: 1
											}),
											createVNode(_component_el_radio_button, { value: "normal" }, {
												default: withCtx(() => [..._cache[109] || (_cache[109] = [createTextVNode("普通", -1)])]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, {
									label: "截止时间",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_date_picker, {
										modelValue: taskCreate.deadlineAt,
										"onUpdate:modelValue": _cache[42] || (_cache[42] = ($event) => taskCreate.deadlineAt = $event),
										type: "datetime",
										"value-format": "YYYY-MM-DD HH:mm:ss",
										format: "YYYY-MM-DD HH:mm",
										placeholder: "选择截止时间",
										"disabled-date": disablePastDate
									}, null, 8, ["modelValue"])]),
									_: 1
								}),
								createVNode(_component_el_form_item, { label: "提醒规则" }, {
									default: withCtx(() => [createVNode(_component_el_checkbox_group, {
										modelValue: taskCreate.reminderRules,
										"onUpdate:modelValue": _cache[43] || (_cache[43] = ($event) => taskCreate.reminderRules = $event),
										class: "reminder-options"
									}, {
										default: withCtx(() => [
											createVNode(_component_el_checkbox, { value: "before_2h" }, {
												default: withCtx(() => [..._cache[110] || (_cache[110] = [createTextVNode("提前2小时", -1)])]),
												_: 1
											}),
											createVNode(_component_el_checkbox, { value: "due" }, {
												default: withCtx(() => [..._cache[111] || (_cache[111] = [createTextVNode("到期提醒", -1)])]),
												_: 1
											}),
											createVNode(_component_el_checkbox, { value: "overdue_1h" }, {
												default: withCtx(() => [..._cache[112] || (_cache[112] = [createTextVNode("逾期升级", -1)])]),
												_: 1
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})
							]),
							createVNode(_component_el_form_item, { label: "关联业务（选填）" }, {
								default: withCtx(() => [createBaseVNode("div", _hoisted_87, [
									createVNode(_component_el_select, {
										modelValue: taskCreate.businessType,
										"onUpdate:modelValue": _cache[44] || (_cache[44] = ($event) => taskCreate.businessType = $event),
										clearable: "",
										placeholder: "业务类型"
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(businessTypes, (item) => {
											return createVNode(_component_el_option, {
												key: item.value,
												label: item.label,
												value: item.value
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"]),
									createVNode(_component_el_input_number, {
										modelValue: taskCreate.businessId,
										"onUpdate:modelValue": _cache[45] || (_cache[45] = ($event) => taskCreate.businessId = $event),
										min: 1,
										controls: false,
										placeholder: "业务ID"
									}, null, 8, ["modelValue"]),
									createVNode(_component_el_input_number, {
										modelValue: taskCreate.customerId,
										"onUpdate:modelValue": _cache[46] || (_cache[46] = ($event) => taskCreate.customerId = $event),
										min: 1,
										controls: false,
										placeholder: "客户ID"
									}, null, 8, ["modelValue"])
								])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "验收标准",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: taskCreate.acceptanceStandard,
									"onUpdate:modelValue": _cache[47] || (_cache[47] = ($event) => taskCreate.acceptanceStandard = $event),
									type: "textarea",
									rows: 3,
									maxlength: "5000",
									"show-word-limit": "",
									placeholder: "写清完成结果、凭证或可验收的标准"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: issueCreate.visible,
					"onUpdate:modelValue": _cache[56] || (_cache[56] = ($event) => issueCreate.visible = $event),
					title: "下发任务工单",
					width: "560px",
					"append-to-body": "",
					"destroy-on-close": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[55] || (_cache[55] = ($event) => issueCreate.visible = false) }, {
						default: withCtx(() => [..._cache[116] || (_cache[116] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: issueCreate.loading,
						disabled: !canCreateIssue.value,
						onClick: submitIssueCreate
					}, {
						default: withCtx(() => [..._cache[117] || (_cache[117] = [createTextVNode("下发工单", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [issueCreate.source ? (openBlock(), createElementBlock("div", _hoisted_88, [
						_cache[115] || (_cache[115] = createBaseVNode("span", null, "来源消息", -1)),
						createBaseVNode("b", null, toDisplayString(issueCreate.source.senderName), 1),
						createBaseVNode("p", null, toDisplayString(issueCreate.source.text || `[${issueCreate.source.messageType}]`), 1)
					])) : createCommentVNode("", true), createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [
							createVNode(_component_el_form_item, {
								label: "任务内容",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: issueCreate.description,
									"onUpdate:modelValue": _cache[50] || (_cache[50] = ($event) => issueCreate.description = $event),
									type: "textarea",
									rows: 3,
									maxlength: "500",
									"show-word-limit": "",
									placeholder: "写清要完成什么、交付或验收标准"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(_component_el_form_item, {
								label: "主办人",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: issueCreate.ownerId,
									"onUpdate:modelValue": _cache[51] || (_cache[51] = ($event) => issueCreate.ownerId = $event),
									filterable: "",
									placeholder: "选择主办人",
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(issueStaffCandidates.value, (s) => {
										return openBlock(), createBlock(_component_el_option, {
											key: s.id,
											label: s.name,
											value: s.id
										}, null, 8, ["label", "value"]);
									}), 128))]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							}),
							createBaseVNode("div", _hoisted_89, [createVNode(_component_el_form_item, {
								label: "截止时间",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: issueCreate.deadline,
									"onUpdate:modelValue": _cache[52] || (_cache[52] = ($event) => issueCreate.deadline = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									format: "YYYY-MM-DD HH:mm",
									placeholder: "选择截止时间",
									"disabled-date": disablePastDate,
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}), createVNode(_component_el_form_item, { label: "优先级" }, {
								default: withCtx(() => [createVNode(_component_el_select, {
									modelValue: issueCreate.priority,
									"onUpdate:modelValue": _cache[53] || (_cache[53] = ($event) => issueCreate.priority = $event),
									style: { "width": "100%" }
								}, {
									default: withCtx(() => [
										createVNode(_component_el_option, {
											label: "P0 紧急",
											value: "P0"
										}),
										createVNode(_component_el_option, {
											label: "P1 普通",
											value: "P1"
										}),
										createVNode(_component_el_option, {
											label: "P2 低",
											value: "P2"
										})
									]),
									_: 1
								}, 8, ["modelValue"])]),
								_: 1
							})]),
							createVNode(_component_el_form_item, { label: "关联客户（选填）" }, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: issueCreate.customerName,
									"onUpdate:modelValue": _cache[54] || (_cache[54] = ($event) => issueCreate.customerName = $event),
									placeholder: "客户名称，可留空",
									maxlength: "100"
								}, null, 8, ["modelValue"])]),
								_: 1
							})
						]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				messageCtx.visible ? (openBlock(), createElementBlock("div", {
					key: 1,
					class: "message-ctx",
					style: normalizeStyle({
						left: messageCtx.x + "px",
						top: messageCtx.y + "px"
					}),
					onClick: _cache[57] || (_cache[57] = withModifiers(() => {}, ["stop"]))
				}, [
					createBaseVNode("button", {
						type: "button",
						onClick: replyFromContext
					}, [..._cache[118] || (_cache[118] = [createBaseVNode("i", { "data-lucide": "reply" }, null, -1), createTextVNode("回复", -1)])]),
					createBaseVNode("button", {
						type: "button",
						onClick: forwardFromContext
					}, [..._cache[119] || (_cache[119] = [createBaseVNode("i", { "data-lucide": "send" }, null, -1), createTextVNode("转发", -1)])]),
					messageCtx.message && messageCtx.message.messageType !== "task" ? (openBlock(), createElementBlock("button", {
						key: 0,
						type: "button",
						onClick: taskFromContext
					}, [..._cache[120] || (_cache[120] = [createBaseVNode("i", { "data-lucide": "check-square" }, null, -1), createTextVNode("转为待办", -1)])])) : createCommentVNode("", true),
					_cache[128] || (_cache[128] = createBaseVNode("div", { class: "ctx-sep" }, null, -1)),
					messageCtx.message && messageCtx.message.messageType !== "task" ? (openBlock(), createElementBlock("button", {
						key: 1,
						type: "button",
						class: "ctx-issue",
						onClick: issueFromContext
					}, [..._cache[121] || (_cache[121] = [createBaseVNode("i", { "data-lucide": "clipboard-list" }, null, -1), createTextVNode("下发任务工单", -1)])])) : createCommentVNode("", true),
					createBaseVNode("button", {
						type: "button",
						onClick: favoriteFromContext
					}, [_cache[122] || (_cache[122] = createBaseVNode("i", { "data-lucide": "star" }, null, -1)), createTextVNode(toDisplayString(((_messageCtx$message = messageCtx.message) === null || _messageCtx$message === void 0 ? void 0 : _messageCtx$message.favorite) ? "取消收藏" : "收藏"), 1)]),
					createBaseVNode("button", {
						type: "button",
						onClick: importantFromContext
					}, [_cache[123] || (_cache[123] = createBaseVNode("i", { "data-lucide": "bell" }, null, -1)), createTextVNode(toDisplayString(((_messageCtx$message2 = messageCtx.message) === null || _messageCtx$message2 === void 0 ? void 0 : _messageCtx$message2.important) ? "取消重要" : "标记重要"), 1)]),
					createBaseVNode("button", {
						type: "button",
						onClick: copyFromContext
					}, [..._cache[124] || (_cache[124] = [createBaseVNode("i", { "data-lucide": "copy" }, null, -1), createTextVNode("复制", -1)])]),
					messageCtx.message && isMine(messageCtx.message) ? (openBlock(), createElementBlock("button", {
						key: 2,
						type: "button",
						onClick: editFromContext
					}, [..._cache[125] || (_cache[125] = [createBaseVNode("i", { "data-lucide": "pencil" }, null, -1), createTextVNode("编辑", -1)])])) : createCommentVNode("", true),
					messageCtx.message && isMine(messageCtx.message) ? (openBlock(), createElementBlock("button", {
						key: 3,
						type: "button",
						onClick: recallFromContext
					}, [..._cache[126] || (_cache[126] = [createBaseVNode("i", { "data-lucide": "rotate-ccw" }, null, -1), createTextVNode("撤回", -1)])])) : createCommentVNode("", true),
					messageCtx.message && messageCtx.message.id > 0 ? (openBlock(), createElementBlock("button", {
						key: 4,
						type: "button",
						onClick: receiptFromContext
					}, [..._cache[127] || (_cache[127] = [createBaseVNode("i", { "data-lucide": "eye" }, null, -1), createTextVNode("查看已读", -1)])])) : createCommentVNode("", true)
				], 4)) : createCommentVNode("", true),
				createVNode(_component_el_drawer, {
					modelValue: taskBoard.visible,
					"onUpdate:modelValue": _cache[63] || (_cache[63] = ($event) => taskBoard.visible = $event),
					title: "工作待办",
					size: "min(680px, 100vw)",
					class: "task-board-drawer",
					"append-to-body": ""
				}, {
					default: withCtx(() => [
						createBaseVNode("div", _hoisted_90, [createVNode(_component_el_radio_group, {
							modelValue: taskBoard.scope,
							"onUpdate:modelValue": _cache[58] || (_cache[58] = ($event) => taskBoard.scope = $event),
							size: "small",
							onChange: _cache[59] || (_cache[59] = ($event) => loadTaskBoard(true))
						}, {
							default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(taskScopeOptions.value, (scope) => {
								return openBlock(), createBlock(_component_el_radio_button, {
									key: scope.value,
									value: scope.value
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(scope.label), 1)]),
									_: 2
								}, 1032, ["value"]);
							}), 128))]),
							_: 1
						}, 8, ["modelValue"]), createVNode(_component_el_select, {
							modelValue: taskBoard.state,
							"onUpdate:modelValue": _cache[60] || (_cache[60] = ($event) => taskBoard.state = $event),
							size: "small",
							onChange: _cache[61] || (_cache[61] = ($event) => loadTaskBoard(true))
						}, {
							default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(taskStateOptions, (state) => {
								return createVNode(_component_el_option, {
									key: state.value,
									label: state.label,
									value: state.value
								}, null, 8, ["label", "value"]);
							}), 64))]),
							_: 1
						}, 8, ["modelValue"])]),
						createBaseVNode("div", _hoisted_91, [
							createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(taskBoard.stats.pendingAccept), 1), _cache[129] || (_cache[129] = createTextVNode("待接收", -1))]),
							createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(taskBoard.stats.inProgress), 1), _cache[130] || (_cache[130] = createTextVNode("进行中", -1))]),
							createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(taskBoard.stats.pendingReview), 1), _cache[131] || (_cache[131] = createTextVNode("待验收", -1))]),
							createBaseVNode("span", _hoisted_92, [createBaseVNode("b", null, toDisplayString(taskBoard.stats.overdue), 1), _cache[132] || (_cache[132] = createTextVNode("已逾期", -1))])
						]),
						createBaseVNode("div", _hoisted_93, [
							(openBlock(true), createElementBlock(Fragment, null, renderList(taskBoard.items, (task) => {
								return openBlock(), createBlock(TaskCard_default, {
									key: task.taskId,
									task,
									onOpen: openTaskDetail,
									onAccept: acceptTask,
									onSubmit: openTaskSubmit,
									onReview: openTaskReview
								}, null, 8, ["task"]);
							}), 128)),
							!taskBoard.loading && !taskBoard.items.length ? (openBlock(), createBlock(_component_el_empty, {
								key: 0,
								"image-size": 76,
								description: "当前范围没有待办"
							})) : createCommentVNode("", true),
							taskBoard.hasMore ? (openBlock(), createBlock(_component_el_button, {
								key: 1,
								text: "",
								loading: taskBoard.loading,
								onClick: _cache[62] || (_cache[62] = ($event) => loadTaskBoard(false))
							}, {
								default: withCtx(() => [..._cache[133] || (_cache[133] = [createTextVNode("加载更多", -1)])]),
								_: 1
							}, 8, ["loading"])) : createCommentVNode("", true)
						])
					]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_drawer, {
					modelValue: taskDetail.visible,
					"onUpdate:modelValue": _cache[64] || (_cache[64] = ($event) => taskDetail.visible = $event),
					title: "待办详情",
					size: "min(640px, 100vw)",
					class: "task-detail-drawer",
					"append-to-body": ""
				}, {
					default: withCtx(() => [createVNode(TaskDetailPanel_default, {
						task: taskDetail.data,
						onSource: openTaskSource,
						onDownload: downloadAttachment,
						onAccept: acceptTask,
						onSubmit: openTaskSubmit,
						onReview: openTaskReview,
						onCancel: cancelTask
					}, null, 8, ["task"])]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: taskSubmit.visible,
					"onUpdate:modelValue": _cache[68] || (_cache[68] = ($event) => taskSubmit.visible = $event),
					title: "提交完成结果",
					width: "600px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[67] || (_cache[67] = ($event) => taskSubmit.visible = false) }, {
						default: withCtx(() => [..._cache[135] || (_cache[135] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: taskSubmit.loading,
						disabled: !canSubmitTaskResult.value,
						onClick: submitTaskResult
					}, {
						default: withCtx(() => [..._cache[136] || (_cache[136] = [createTextVNode("提交验收", -1)])]),
						_: 1
					}, 8, ["loading", "disabled"])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "处理结果",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: taskSubmit.result,
								"onUpdate:modelValue": _cache[65] || (_cache[65] = ($event) => taskSubmit.result = $event),
								type: "textarea",
								rows: 5,
								maxlength: "10000",
								"show-word-limit": "",
								placeholder: "说明完成内容、处理结论和需要验收人关注的事项"
							}, null, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, { label: "处理凭证" }, {
							default: withCtx(() => [
								createVNode(_component_el_button, {
									icon: unref(paperclip_default),
									onClick: _cache[66] || (_cache[66] = ($event) => {
										var _taskSubmitFileInput$;
										return (_taskSubmitFileInput$ = taskSubmitFileInput.value) === null || _taskSubmitFileInput$ === void 0 ? void 0 : _taskSubmitFileInput$.click();
									})
								}, {
									default: withCtx(() => [..._cache[134] || (_cache[134] = [createTextVNode("上传图片或文件", -1)])]),
									_: 1
								}, 8, ["icon"]),
								createBaseVNode("input", {
									ref_key: "taskSubmitFileInput",
									ref: taskSubmitFileInput,
									hidden: "",
									type: "file",
									multiple: "",
									onChange: onTaskSubmitFiles
								}, null, 544),
								taskSubmit.uploads.length ? (openBlock(), createElementBlock("div", _hoisted_94, [(openBlock(true), createElementBlock(Fragment, null, renderList(taskSubmit.uploads, (item) => {
									return openBlock(), createElementBlock("div", { key: item.key }, [
										createBaseVNode("span", null, [createBaseVNode("b", null, toDisplayString(item.file.name), 1), createBaseVNode("small", null, toDisplayString(item.status === "failed" ? item.error : item.status === "done" ? "上传完成" : `上传中 ${item.progress}%`), 1)]),
										item.status === "uploading" ? (openBlock(), createBlock(_component_el_progress, {
											key: 0,
											percentage: item.progress,
											"show-text": false
										}, null, 8, ["percentage"])) : createCommentVNode("", true),
										item.status === "failed" ? (openBlock(), createBlock(_component_el_button, {
											key: 1,
											text: "",
											icon: unref(refresh_default),
											onClick: ($event) => uploadTaskEvidence(item)
										}, null, 8, ["icon", "onClick"])) : createCommentVNode("", true),
										createVNode(_component_el_button, {
											text: "",
											icon: unref(close_default),
											onClick: ($event) => removeTaskEvidence(item.key)
										}, null, 8, ["icon", "onClick"])
									]);
								}), 128))])) : createCommentVNode("", true)
							]),
							_: 1
						})]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: taskReview.visible,
					"onUpdate:modelValue": _cache[72] || (_cache[72] = ($event) => taskReview.visible = $event),
					title: "待办验收",
					width: "560px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[71] || (_cache[71] = ($event) => taskReview.visible = false) }, {
						default: withCtx(() => [..._cache[139] || (_cache[139] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: taskReview.pass ? "success" : "danger",
						loading: taskReview.loading,
						disabled: !taskReview.pass && !taskReview.comment.trim(),
						onClick: submitTaskReview
					}, {
						default: withCtx(() => [..._cache[140] || (_cache[140] = [createTextVNode("确认提交", -1)])]),
						_: 1
					}, 8, [
						"type",
						"loading",
						"disabled"
					])]),
					default: withCtx(() => [createVNode(_component_el_form, { "label-position": "top" }, {
						default: withCtx(() => [createVNode(_component_el_form_item, {
							label: "验收结论",
							required: ""
						}, {
							default: withCtx(() => [createVNode(_component_el_radio_group, {
								modelValue: taskReview.pass,
								"onUpdate:modelValue": _cache[69] || (_cache[69] = ($event) => taskReview.pass = $event)
							}, {
								default: withCtx(() => [createVNode(_component_el_radio_button, { value: true }, {
									default: withCtx(() => [..._cache[137] || (_cache[137] = [createTextVNode("验收通过", -1)])]),
									_: 1
								}), createVNode(_component_el_radio_button, { value: false }, {
									default: withCtx(() => [..._cache[138] || (_cache[138] = [createTextVNode("驳回重做", -1)])]),
									_: 1
								})]),
								_: 1
							}, 8, ["modelValue"])]),
							_: 1
						}), createVNode(_component_el_form_item, {
							label: taskReview.pass ? "验收意见" : "驳回原因",
							required: !taskReview.pass
						}, {
							default: withCtx(() => [createVNode(_component_el_input, {
								modelValue: taskReview.comment,
								"onUpdate:modelValue": _cache[70] || (_cache[70] = ($event) => taskReview.comment = $event),
								type: "textarea",
								rows: 4,
								maxlength: "1000",
								"show-word-limit": "",
								placeholder: taskReview.pass ? "选填，可补充验收结论" : "必须说明不符合哪项标准以及修改要求"
							}, null, 8, ["modelValue", "placeholder"])]),
							_: 1
						}, 8, ["label", "required"])]),
						_: 1
					})]),
					_: 1
				}, 8, ["modelValue"]),
				imagePreview.visible && imagePreview.url ? (openBlock(), createBlock(_component_el_image_viewer, {
					key: 2,
					"url-list": [imagePreview.url],
					"hide-on-click-modal": true,
					onClose: closeImagePreview
				}, null, 8, ["url-list"])) : createCommentVNode("", true)
			], 2);
		};
	}
}), [["__scopeId", "data-v-eddf7ea8"]]);
//#endregion
export { center_default as default };

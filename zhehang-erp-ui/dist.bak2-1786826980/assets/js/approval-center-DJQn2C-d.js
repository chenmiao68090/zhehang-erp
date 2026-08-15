import { $ as createCommentVNode, Ct as onUnmounted, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { $ as ElCheckbox, Bt as close_bold_default, Cn as moon_night_default, Ct as arrow_left_default, D as ElPagination, Dn as office_building_default, Dr as withModifiers, Et as bell_default, F as ElEmpty, Fn as present_default, Gn as sell_default, Gt as credit_card_default, Ht as coin_default, I as ElDropdown, Jt as data_analysis_default, L as ElDropdownItem, Ln as promotion_default, M as ElInputNumber, N as ElImage, Nn as plus_default, Ot as calendar_default, Pn as position_default, Pt as circle_check_default, Qn as stamp_default, Qt as document_default, R as ElDropdownMenu, Rt as circle_plus_default, S as ElSkeleton, Sn as money_default, St as arrow_down_default, Tr as vShow, Un as search_default, V as ElDialog, Vn as refresh_left_default, Vt as close_default, W as ElDatePicker, Wn as select_default, Wt as copy_document_default, Xn as shopping_cart_default, Xt as delete_default, Yn as share_default, Zn as sort_default, _r as wallet_default, _t as ElFormItem, a as ElMessageBox, an as finished_default, ar as takeaway_box_default, cr as top_default, f as ElTimeline, ft as ElAvatar, gt as ElForm, h as ElTabs, ht as ElTooltip, ir as switch_default, it as ElTag, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, or as tickets_default, ot as ElButton, p as ElTimelineItem, rr as switch_button_default, rt as ElSelect, s as vLoading, tn as edit_pen_default, tr as suitcase_default, ur as upload_default, vn as memo_default, vr as wallet_filled_default, vt as ElAlert, xt as alarm_clock_default, yt as ElIcon, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { r as useRoute } from "./vendor-vue-iXxhUOfN.js";
import { n as get, y as hasImpersonationSessionMarker } from "./request-CZ5tKmxn.js";
import { n as useI18n } from "./vendor-i18n-CjJLjKpl.js";
import { r as taskApi, t as instanceApi } from "./workflow-CeqrP-pL.js";
import { t as approvalCenterApi } from "./approval-_N-WvNcC.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as fileInfoApi } from "./file-BNSD7Sq1.js";
import { a as leaveBalanceApi } from "./hrm-x4tssCAy.js";
import { t as hasRole } from "./permission-WmkjwRL4.js";
import { n as downloadFileById, r as objectUrlForFile } from "./download-DmWzpvAG.js";
//#region src/components/workflow/ApprovalTrack.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$2 = { class: "approval-track" };
var _hoisted_2$2 = {
	key: 0,
	class: "flow-progress"
};
var _hoisted_3$2 = { class: "flow-steps" };
var _hoisted_4$2 = { class: "flow-step__dot" };
var _hoisted_5$2 = { key: 3 };
var _hoisted_6$2 = { key: 4 };
var _hoisted_7$2 = { class: "flow-step__body" };
var _hoisted_8$2 = { class: "flow-step__name" };
var _hoisted_9$2 = {
	key: 0,
	class: "flow-step__handler"
};
var _hoisted_10$2 = {
	key: 1,
	class: "flow-step__handler"
};
var _hoisted_11$2 = { key: 0 };
var _hoisted_12$2 = { key: 1 };
var _hoisted_13$2 = { key: 2 };
var _hoisted_14$2 = {
	key: 0,
	class: "flow-cc"
};
var _hoisted_15$2 = {
	key: 1,
	class: "track-sub-title"
};
var _hoisted_16$2 = { class: "track-item__header" };
var _hoisted_17$2 = { class: "track-item__avatar" };
var _hoisted_18$2 = { class: "track-item__info" };
var _hoisted_19$2 = { class: "track-item__name" };
var _hoisted_20$2 = {
	key: 0,
	class: "track-item__comment"
};
var _hoisted_21$2 = { class: "track-item__node" };
var _hoisted_22$2 = { class: "track-item__node-label" };
//#endregion
//#region src/components/workflow/ApprovalTrack.vue
var ApprovalTrack_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ApprovalTrack",
	props: {
		histories: { default: () => [] },
		currentNodeName: { default: "" },
		processConfig: { default: "" },
		currentAssigneeName: { default: "" },
		currentAssigneeNames: { default: () => [] },
		initiatorName: { default: "" },
		ccNames: { default: () => [] },
		preview: {
			type: Boolean,
			default: false
		},
		showHistory: {
			type: Boolean,
			default: true
		},
		currentTaskId: { default: void 0 },
		canUrge: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		const { t } = useI18n();
		const props = __props;
		const urging = ref(false);
		function doUrge() {
			return _doUrge.apply(this, arguments);
		}
		function _doUrge() {
			_doUrge = _asyncToGenerator(function* () {
				if (!props.currentTaskId) return;
				urging.value = true;
				try {
					yield taskApi.urge(props.currentTaskId);
					ElMessage.success("已催办,审批人会收到提醒");
				} catch (e) {
					ElMessage.warning((e === null || e === void 0 ? void 0 : e.message) || "催办失败");
				}
				urging.value = false;
			});
			return _doUrge.apply(this, arguments);
		}
		const ROLE_LABELS = {
			dept_leader: "部门主管",
			dept_manager: "部门主管",
			manager: "经理",
			hr: "人事",
			boss: "总经办",
			finance: "财务",
			finance_hq: "财务部",
			super_admin: "管理员",
			admin: "管理员",
			staff: "员工"
		};
		function roleLabel(v) {
			if (!v) return "";
			return ROLE_LABELS[v] || v;
		}
		const flowNodes = computed(() => {
			let nodes = [];
			try {
				const cfg = JSON.parse(props.processConfig || "{}");
				nodes = Array.isArray(cfg.nodes) ? cfg.nodes : [];
			} catch (_unused) {
				nodes = [];
			}
			const finished = !props.preview && !props.currentNodeName;
			const histNames = new Set((props.histories || []).map((h) => h.nodeName));
			let stepNo = 0;
			return nodes.map((n) => {
				let state = "pending";
				let handler = "";
				let result = "";
				let role = "";
				let handlers = [];
				if (n.type === "condition") return {
					name: n.name || "条件分支",
					type: "condition",
					state: "branch",
					roleLabel: ""
				};
				stepNo++;
				if (n.type === "start") {
					state = "done";
					handler = props.initiatorName || "发起人";
				} else if (n.type === "end") state = finished ? "done" : "pending";
				else {
					role = n.assigneeType === "dept_leader" || n.assigneeType === "dept_manager" ? "部门主管" : n.assigneeType === "supervisor" ? "直属上级" : n.assigneeType === "role" ? roleLabel(n.assigneeValue) : "";
					const hs = (props.histories || []).filter((x) => x.nodeName === n.name && (x.action === "approve" || x.action === "reject"));
					if (hs.length) {
						state = "done";
						handler = hs[hs.length - 1].operatorName || "";
						result = hs[hs.length - 1].action;
					} else if (n.name === props.currentNodeName) {
						state = "current";
						handlers = props.currentAssigneeNames && props.currentAssigneeNames.length ? props.currentAssigneeNames.slice() : props.currentAssigneeName ? [props.currentAssigneeName] : [];
						handler = props.currentAssigneeName || "";
					} else if (finished && !histNames.has(n.name)) state = "skipped";
					else state = "pending";
				}
				return {
					name: n.name,
					type: n.type,
					state,
					handler,
					handlers,
					result,
					roleLabel: role,
					stepNo
				};
			});
		});
		function getTimelineType(action) {
			switch (action) {
				case "start": return "primary";
				case "approve": return "success";
				case "reject": return "danger";
				case "transfer": return "warning";
				case "return": return "warning";
				case "resubmit": return "primary";
				case "urge": return "info";
				case "cancel": return "info";
				default: return "primary";
			}
		}
		function getActionTagType(action) {
			switch (action) {
				case "start": return "";
				case "approve": return "success";
				case "reject": return "danger";
				case "transfer": return "warning";
				case "return": return "warning";
				case "resubmit": return "";
				case "urge": return "info";
				case "cancel": return "info";
				default: return "";
			}
		}
		function getActionLabel(action) {
			switch (action) {
				case "start": return t("workflow.actionStart");
				case "approve": return t("workflow.actionApprove");
				case "reject": return t("workflow.actionReject");
				case "transfer": return t("workflow.actionTransfer");
				case "return": return t("workflow.actionReturn");
				case "resubmit": return t("workflow.actionResubmit");
				case "urge": return t("workflow.actionUrge");
				case "cancel": return t("workflow.actionCancel");
				default: return action;
			}
		}
		function isCurrentNode(item) {
			return props.currentNodeName && item.nodeName === props.currentNodeName;
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_avatar = ElAvatar;
			const _component_el_timeline_item = ElTimelineItem;
			const _component_el_timeline = ElTimeline;
			const _component_el_empty = ElEmpty;
			return openBlock(), createElementBlock("div", _hoisted_1$2, [
				flowNodes.value.length ? (openBlock(), createElementBlock("div", _hoisted_2$2, [
					_cache[5] || (_cache[5] = createBaseVNode("div", { class: "flow-progress__title" }, "流程进度", -1)),
					createBaseVNode("div", _hoisted_3$2, [(openBlock(true), createElementBlock(Fragment, null, renderList(flowNodes.value, (n, i) => {
						return openBlock(), createElementBlock("div", {
							key: i,
							class: normalizeClass(["flow-step", "flow-step--" + n.state])
						}, [createBaseVNode("div", _hoisted_4$2, [n.state === "done" ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
							default: withCtx(() => [createVNode(unref(circle_check_default))]),
							_: 1
						})) : n.state === "current" ? (openBlock(), createBlock(_component_el_icon, { key: 1 }, {
							default: withCtx(() => [createVNode(unref(clock_default))]),
							_: 1
						})) : n.type === "condition" ? (openBlock(), createBlock(_component_el_icon, { key: 2 }, {
							default: withCtx(() => [createVNode(unref(sort_default))]),
							_: 1
						})) : n.state === "skipped" ? (openBlock(), createElementBlock("span", _hoisted_5$2, "–")) : (openBlock(), createElementBlock("span", _hoisted_6$2, toDisplayString(n.stepNo), 1))]), createBaseVNode("div", _hoisted_7$2, [createBaseVNode("div", _hoisted_8$2, [createTextVNode(toDisplayString(n.name) + " ", 1), n.type === "condition" ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: "info",
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[0] || (_cache[0] = [createTextVNode("条件分支", -1)])]),
							_: 1
						})) : n.state === "current" ? (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							type: "warning",
							size: "small",
							effect: "dark"
						}, {
							default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("审批中", -1)])]),
							_: 1
						})) : n.state === "done" ? (openBlock(), createBlock(_component_el_tag, {
							key: 2,
							type: n.result === "reject" ? "danger" : "success",
							size: "small"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(n.result === "reject" ? "已驳回" : "已通过"), 1)]),
							_: 2
						}, 1032, ["type"])) : n.state === "skipped" ? (openBlock(), createBlock(_component_el_tag, {
							key: 3,
							type: "info",
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[2] || (_cache[2] = [createTextVNode("未经过", -1)])]),
							_: 1
						})) : (openBlock(), createBlock(_component_el_tag, {
							key: 4,
							type: "info",
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[3] || (_cache[3] = [createTextVNode("待处理", -1)])]),
							_: 1
						}))]), n.type === "condition" ? (openBlock(), createElementBlock("div", _hoisted_9$2, "按金额/表单自动分流")) : (openBlock(), createElementBlock("div", _hoisted_10$2, [n.handlers && n.handlers.length ? (openBlock(), createElementBlock("span", _hoisted_11$2, toDisplayString(n.roleLabel ? n.roleLabel + "·" : "") + toDisplayString(n.handlers.join("、")), 1)) : n.handler ? (openBlock(), createElementBlock("span", _hoisted_12$2, toDisplayString(n.roleLabel ? n.roleLabel + "·" : "") + toDisplayString(n.handler), 1)) : n.roleLabel ? (openBlock(), createElementBlock("span", _hoisted_13$2, toDisplayString(n.roleLabel), 1)) : createCommentVNode("", true), n.state === "current" && __props.canUrge && __props.currentTaskId ? (openBlock(), createBlock(_component_el_button, {
							key: 3,
							type: "warning",
							size: "small",
							plain: "",
							loading: urging.value,
							class: "flow-urge",
							onClick: doUrge
						}, {
							default: withCtx(() => [..._cache[4] || (_cache[4] = [createTextVNode("催办", -1)])]),
							_: 1
						}, 8, ["loading"])) : createCommentVNode("", true)]))])], 2);
					}), 128))]),
					__props.ccNames && __props.ccNames.length ? (openBlock(), createElementBlock("div", _hoisted_14$2, "抄送:" + toDisplayString(__props.ccNames.join("、")), 1)) : createCommentVNode("", true)
				])) : createCommentVNode("", true),
				__props.showHistory && __props.histories && __props.histories.length ? (openBlock(), createElementBlock("div", _hoisted_15$2, "审批轨迹")) : createCommentVNode("", true),
				__props.showHistory ? (openBlock(), createBlock(_component_el_timeline, { key: 2 }, {
					default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.histories, (item) => {
						return openBlock(), createBlock(_component_el_timeline_item, {
							key: item.id,
							type: getTimelineType(item.action),
							hollow: false,
							timestamp: item.operTime,
							placement: "top"
						}, {
							default: withCtx(() => [createBaseVNode("div", { class: normalizeClass(["track-item", { "track-item--active": isCurrentNode(item) }]) }, [
								createBaseVNode("div", _hoisted_16$2, [createBaseVNode("div", _hoisted_17$2, [createVNode(_component_el_avatar, {
									size: 32,
									src: item.operatorAvatar
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString((item.operatorName || "系统").charAt(0)), 1)]),
									_: 2
								}, 1032, ["src"])]), createBaseVNode("div", _hoisted_18$2, [createBaseVNode("span", _hoisted_19$2, toDisplayString(item.operatorName || _ctx.$t("workflow.actionStart")), 1), createVNode(_component_el_tag, {
									type: getActionTagType(item.action),
									size: "small",
									class: "track-item__action"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(getActionLabel(item.action)), 1)]),
									_: 2
								}, 1032, ["type"])])]),
								item.comment ? (openBlock(), createElementBlock("div", _hoisted_20$2, toDisplayString(item.comment), 1)) : createCommentVNode("", true),
								createBaseVNode("div", _hoisted_21$2, [createBaseVNode("span", _hoisted_22$2, toDisplayString(item.nodeName), 1)])
							], 2)]),
							_: 2
						}, 1032, ["type", "timestamp"]);
					}), 128))]),
					_: 1
				})) : createCommentVNode("", true),
				__props.showHistory && (!__props.histories || __props.histories.length === 0) ? (openBlock(), createBlock(_component_el_empty, {
					key: 3,
					description: _ctx.$t("common.noData")
				}, null, 8, ["description"])) : createCommentVNode("", true)
			]);
		};
	}
}), [["__scopeId", "data-v-39deeab5"]]);
//#endregion
//#region src/views/approval/index.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "approval-initiate" };
var _hoisted_2$1 = { class: "ac-header" };
var _hoisted_3$1 = { class: "ac-header__actions" };
var _hoisted_4$1 = { class: "ac-manage" };
var _hoisted_5$1 = { class: "ac-cats" };
var _hoisted_6$1 = ["onClick"];
var _hoisted_7$1 = { class: "ac-group__title" };
var _hoisted_8$1 = { class: "ac-group__count" };
var _hoisted_9$1 = { class: "ac-cards" };
var _hoisted_10$1 = ["onClick"];
var _hoisted_11$1 = { class: "ac-card__icon" };
var _hoisted_12$1 = { class: "ac-card__body" };
var _hoisted_13$1 = { class: "ac-card__name" };
var _hoisted_14$1 = { class: "ac-card__desc" };
var _hoisted_15$1 = { class: "ac-dialog-heading" };
var _hoisted_16$1 = { class: "ac-dialog-kicker" };
var _hoisted_17$1 = { class: "ac-form-section" };
var _hoisted_18$1 = { class: "ac-section-head" };
var _hoisted_19$1 = {
	key: 1,
	class: "ac-form-section ac-expense-section"
};
var _hoisted_20$1 = { class: "ac-section-head" };
var _hoisted_21$1 = { class: "expense-summary" };
var _hoisted_22$1 = { class: "expense-total-card" };
var _hoisted_23$1 = { class: "expense-type-list" };
var _hoisted_24$1 = {
	key: 0,
	class: "expense-type-empty"
};
var _hoisted_25$1 = { class: "expense-lines" };
var _hoisted_26$1 = { class: "expense-line__head" };
var _hoisted_27$1 = { class: "expense-grid" };
var _hoisted_28$1 = {
	key: 2,
	class: "ac-form-section"
};
var _hoisted_29$1 = { class: "ac-halfday" };
var _hoisted_30$1 = {
	key: 9,
	class: "ac-attach"
};
var _hoisted_31$1 = {
	key: 0,
	class: "ac-attach-list"
};
var _hoisted_32$1 = { class: "ac-attach-name" };
var _hoisted_33$1 = { class: "ac-attach-actions" };
var _hoisted_34$1 = {
	key: 3,
	class: "ac-form-section"
};
var _hoisted_35$1 = {
	key: 4,
	class: "ac-form-section"
};
var _hoisted_36$1 = { class: "ac-attach" };
var _hoisted_37$1 = {
	key: 0,
	class: "ac-attach-list"
};
var _hoisted_38$1 = { class: "ac-attach-name" };
var _hoisted_39$1 = { class: "ac-attach-actions" };
var ATTACH_LIMIT_MB = 10;
//#endregion
//#region src/views/approval/index.vue
var approval_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "index",
	emits: ["submitted"],
	setup(__props, { expose: __expose, emit: __emit }) {
		const myBalances = ref([]);
		function loadMyBalances() {
			return _loadMyBalances.apply(this, arguments);
		}
		function _loadMyBalances() {
			_loadMyBalances = _asyncToGenerator(function* () {
				try {
					myBalances.value = (yield leaveBalanceApi.my()).data || [];
				} catch (_unused) {
					myBalances.value = [];
				}
			});
			return _loadMyBalances.apply(this, arguments);
		}
		function balanceOf(leaveType) {
			var _b$totalDays, _b$usedDays;
			const b = myBalances.value.find((x) => x.leaveType === leaveType);
			if (!b) return null;
			const total = Number((_b$totalDays = b.totalDays) !== null && _b$totalDays !== void 0 ? _b$totalDays : 0);
			const used = Number((_b$usedDays = b.usedDays) !== null && _b$usedDays !== void 0 ? _b$usedDays : 0);
			return {
				total,
				used,
				remaining: Math.max(0, total - used)
			};
		}
		const attachments = ref([]);
		const attachInput = ref();
		const attachUploading = ref(false);
		function triggerAttach() {
			var _attachInput$value;
			(_attachInput$value = attachInput.value) === null || _attachInput$value === void 0 || _attachInput$value.click();
		}
		function uploadAttachFile(_x) {
			return _uploadAttachFile.apply(this, arguments);
		}
		function _uploadAttachFile() {
			_uploadAttachFile = _asyncToGenerator(function* (f) {
				if (f.size > ATTACH_LIMIT_MB * 1024 * 1024) {
					ElMessage.warning(`「${f.name}」超过 ${ATTACH_LIMIT_MB}MB,已跳过`);
					return;
				}
				attachUploading.value = true;
				try {
					const res = yield fileInfoApi.upload(f);
					const info = res && typeof res === "object" && "data" in res ? res.data : res;
					if (!info || !info.id) throw new Error("上传返回异常");
					const url = f.type.startsWith("image/") ? URL.createObjectURL(f) : void 0;
					attachments.value.push({
						fileId: Number(info.id),
						name: f.name,
						url
					});
				} catch (e) {
					ElMessage.error(`「${f.name}」上传失败` + ((e === null || e === void 0 ? void 0 : e.message) ? ":" + e.message : ""));
				}
				attachUploading.value = false;
			});
			return _uploadAttachFile.apply(this, arguments);
		}
		function onAttachPick(_x2) {
			return _onAttachPick.apply(this, arguments);
		}
		function _onAttachPick() {
			_onAttachPick = _asyncToGenerator(function* (e) {
				const input = e.target;
				const files = input.files ? Array.from(input.files) : [];
				for (const f of files) yield uploadAttachFile(f);
				input.value = "";
			});
			return _onAttachPick.apply(this, arguments);
		}
		/** 发起弹窗打开时,支持 Ctrl+V 直接粘贴截图为附件(即传即用) */
		function onApprovalPaste(_x3) {
			return _onApprovalPaste.apply(this, arguments);
		}
		function _onApprovalPaste() {
			_onApprovalPaste = _asyncToGenerator(function* (e) {
				var _e$clipboardData;
				if (!startVisible.value) return;
				const items = (_e$clipboardData = e.clipboardData) === null || _e$clipboardData === void 0 ? void 0 : _e$clipboardData.items;
				if (!items) return;
				for (const it of Array.from(items)) if (it.type && it.type.startsWith("image/")) {
					const blob = it.getAsFile();
					if (!blob) continue;
					yield uploadAttachFile(new File([blob], `粘贴图片_${attachments.value.length + 1}.png`, { type: blob.type }));
				}
			});
			return _onApprovalPaste.apply(this, arguments);
		}
		/** 附件是否可图片预览:只有拿得到本地 objectURL(blob:)或老单内嵌 data:image 的才渲染缩略图 */
		function isImgAttach(f) {
			const u = (f === null || f === void 0 ? void 0 : f.url) || "";
			return u.startsWith("blob:") || /^data:image\//i.test(u);
		}
		const CATEGORIES = [
			{
				value: "all",
				label: "全部"
			},
			{
				value: "attendance",
				label: "假勤"
			},
			{
				value: "finance",
				label: "财务"
			},
			{
				value: "admin",
				label: "行政"
			},
			{
				value: "hr",
				label: "人事"
			},
			{
				value: "biz",
				label: "业务"
			},
			{
				value: "other",
				label: "其他"
			}
		];
		/** 分组视觉配置(分组本身由后端 group_name 决定) */
		const GROUP_META = {
			attendance: {
				label: "假勤",
				color: "#3370ff",
				soft: "rgba(51,112,255,0.1)"
			},
			finance: {
				label: "财务",
				color: "#409EFF",
				soft: "rgba(64,158,255,0.1)"
			},
			admin: {
				label: "行政",
				color: "#67C23A",
				soft: "rgba(103,194,58,0.1)"
			},
			hr: {
				label: "人事",
				color: "#909399",
				soft: "rgba(144,147,153,0.12)"
			},
			biz: {
				label: "业务",
				color: "#E6A23C",
				soft: "rgba(230,162,60,0.1)"
			},
			other: {
				label: "其他",
				color: "#606266",
				soft: "rgba(96,98,102,0.1)"
			}
		};
		const GROUP_ORDER = [
			"attendance",
			"finance",
			"admin",
			"hr",
			"biz",
			"other"
		];
		/** 后端 icon 名 → 图标组件(后端存的是 Element Plus 图标名) */
		const ICON_MAP = {
			Calendar: calendar_default,
			Suitcase: suitcase_default,
			Position: position_default,
			MoonNight: moon_night_default,
			AlarmClock: alarm_clock_default,
			Money: money_default,
			Wallet: wallet_default,
			Coin: coin_default,
			CreditCard: credit_card_default,
			RefreshLeft: refresh_left_default,
			WalletFilled: wallet_filled_default,
			Sell: sell_default,
			Tickets: tickets_default,
			Stamp: stamp_default,
			TakeawayBox: takeaway_box_default,
			ShoppingCart: shopping_cart_default,
			OfficeBuilding: office_building_default,
			Document: document_default,
			Share: share_default,
			Present: present_default,
			Memo: memo_default,
			CirclePlus: circle_plus_default,
			CircleCheck: circle_check_default,
			Top: top_default,
			Switch: switch_default,
			SwitchButton: switch_button_default
		};
		function iconOf(name) {
			return name && ICON_MAP[name] || memo_default;
		}
		const emit = __emit;
		const keyword = ref("");
		const activeCat = ref("all");
		const processLoading = ref(false);
		const publishedProcesses = ref([]);
		const visibleGroups = computed(() => {
			const kw = keyword.value.trim().toLowerCase();
			const byGroup = /* @__PURE__ */ new Map();
			publishedProcesses.value.filter((p) => !kw || (p.name || "").toLowerCase().includes(kw) || (p.processKey || "").toLowerCase().includes(kw)).forEach((p) => {
				const g = GROUP_META[p.groupName || ""] ? p.groupName : "other";
				const item = {
					key: p.processKey || "proc_" + p.id,
					name: p.name || p.processKey || "流程" + p.id,
					icon: iconOf(p.icon),
					resolved: true,
					process: p
				};
				byGroup.set(g, [...byGroup.get(g) || [], item]);
			});
			return GROUP_ORDER.filter((g) => activeCat.value === "all" || g === activeCat.value).filter((g) => (byGroup.get(g) || []).length > 0).map((g) => {
				const items = (byGroup.get(g) || []).sort((a, b) => {
					var _a$process$sort, _a$process, _b$process$sort, _b$process, _a$process$id, _a$process2, _b$process$id, _b$process2;
					return ((_a$process$sort = (_a$process = a.process) === null || _a$process === void 0 ? void 0 : _a$process.sort) !== null && _a$process$sort !== void 0 ? _a$process$sort : 99) - ((_b$process$sort = (_b$process = b.process) === null || _b$process === void 0 ? void 0 : _b$process.sort) !== null && _b$process$sort !== void 0 ? _b$process$sort : 99) || ((_a$process$id = (_a$process2 = a.process) === null || _a$process2 === void 0 ? void 0 : _a$process2.id) !== null && _a$process$id !== void 0 ? _a$process$id : 0) - ((_b$process$id = (_b$process2 = b.process) === null || _b$process2 === void 0 ? void 0 : _b$process2.id) !== null && _b$process$id !== void 0 ? _b$process$id : 0);
				});
				return _objectSpread2(_objectSpread2({ value: g }, GROUP_META[g]), {}, { items });
			});
		});
		function loadProcesses() {
			return _loadProcesses.apply(this, arguments);
		}
		function _loadProcesses() {
			_loadProcesses = _asyncToGenerator(function* () {
				processLoading.value = true;
				try {
					publishedProcesses.value = yield approvalCenterApi.publishedProcesses();
				} catch (_unused2) {
					publishedProcesses.value = [];
				}
				processLoading.value = false;
			});
			return _loadProcesses.apply(this, arguments);
		}
		const startVisible = ref(false);
		const submitting = ref(false);
		const selectedProcess = ref(null);
		const processTitle = ref("");
		const formFields = ref([]);
		const formValues = reactive({});
		const hasAttachmentField = computed(() => formFields.value.some((f) => f.type === "attachment"));
		const visibleFormFields = computed(() => isLeaveProcess.value ? formFields.value.filter((f) => f.field !== "startAmpm" && f.field !== "endAmpm") : formFields.value);
		const EXPENSE_TYPES = [
			"交通费",
			"餐饮费",
			"住宿费",
			"办公用品",
			"通讯费",
			"招待费",
			"培训费",
			"市场费",
			"其他"
		];
		const expenseDetails = ref([]);
		const isExpenseProcess = computed(() => {
			var _selectedProcess$valu, _selectedProcess$valu2;
			const key = (((_selectedProcess$valu = selectedProcess.value) === null || _selectedProcess$valu === void 0 ? void 0 : _selectedProcess$valu.processKey) || "").toLowerCase();
			const name = ((_selectedProcess$valu2 = selectedProcess.value) === null || _selectedProcess$valu2 === void 0 ? void 0 : _selectedProcess$valu2.name) || "";
			return key === "expense" || key === "reimburse" || name.includes("报销");
		});
		const isLeaveProcess = computed(() => {
			var _selectedProcess$valu3;
			return ((_selectedProcess$valu3 = selectedProcess.value) === null || _selectedProcess$valu3 === void 0 ? void 0 : _selectedProcess$valu3.processKey) === "leave";
		});
		const leaveHalf = reactive({
			startDay: "",
			startAmpm: "上午",
			endDay: "",
			endAmpm: "下午"
		});
		const expenseTotal = computed(() => expenseDetails.value.reduce((sum, item) => sum + moneyNumber(item.amount), 0));
		const expenseSummary = computed(() => summarizeExpenseDetails(expenseDetails.value));
		function makeDetailId() {
			return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		}
		function createExpenseDetail(seed) {
			var _seed$amount;
			return {
				id: makeDetailId(),
				type: (seed === null || seed === void 0 ? void 0 : seed.type) || "",
				content: (seed === null || seed === void 0 ? void 0 : seed.content) || "",
				expenseDate: (seed === null || seed === void 0 ? void 0 : seed.expenseDate) || "",
				amount: (_seed$amount = seed === null || seed === void 0 ? void 0 : seed.amount) !== null && _seed$amount !== void 0 ? _seed$amount : null,
				remark: (seed === null || seed === void 0 ? void 0 : seed.remark) || ""
			};
		}
		function resetExpenseDetails() {
			expenseDetails.value = [createExpenseDetail()];
		}
		function addExpenseDetail() {
			expenseDetails.value.push(createExpenseDetail());
		}
		function copyExpenseDetail(index) {
			const item = expenseDetails.value[index];
			if (!item) return;
			expenseDetails.value.splice(index + 1, 0, createExpenseDetail(item));
		}
		function removeExpenseDetail(index) {
			if (expenseDetails.value.length <= 1) {
				ElMessage.info("至少保留一条费用明细");
				return;
			}
			expenseDetails.value.splice(index, 1);
		}
		function moneyNumber(value) {
			const n = Number(value);
			return Number.isFinite(n) ? n : 0;
		}
		function moneyText(value) {
			return moneyNumber(value).toFixed(2);
		}
		function summarizeExpenseDetails(details) {
			const map = /* @__PURE__ */ new Map();
			details.forEach((item) => {
				const type = item.type || "未分类";
				const amount = moneyNumber(item.amount);
				if (amount > 0) map.set(type, (map.get(type) || 0) + amount);
			});
			return Array.from(map.entries()).map(([type, amount]) => ({
				type,
				amount: Number(amount.toFixed(2))
			}));
		}
		function normalizedExpenseDetails() {
			return expenseDetails.value.map((item, index) => ({
				index: index + 1,
				type: item.type,
				content: item.content.trim(),
				expenseDate: item.expenseDate,
				amount: Number(moneyNumber(item.amount).toFixed(2)),
				remark: item.remark.trim()
			}));
		}
		function validateExpenseDetails() {
			for (let i = 0; i < expenseDetails.value.length; i++) {
				const item = expenseDetails.value[i];
				if (!item.type) {
					ElMessage.warning(`请选择第 ${i + 1} 条费用类型`);
					return false;
				}
				if (!item.expenseDate) {
					ElMessage.warning(`请选择第 ${i + 1} 条发生日期`);
					return false;
				}
				if (!item.content.trim()) {
					ElMessage.warning(`请填写第 ${i + 1} 条内容/用途`);
					return false;
				}
				if (moneyNumber(item.amount) <= 0) {
					ElMessage.warning(`请填写第 ${i + 1} 条有效金额`);
					return false;
				}
			}
			return true;
		}
		function buildExpensePayload() {
			const details = normalizedExpenseDetails();
			const summary = summarizeExpenseDetails(expenseDetails.value);
			const total = Number(expenseTotal.value.toFixed(2));
			return {
				amount: total,
				totalAmount: total,
				expenseType: summary.map((item) => item.type).join("、"),
				description: details.map((item) => `${item.expenseDate} ${item.type} ${item.content} ¥${moneyText(item.amount)}`).join("\n"),
				detailCount: details.length,
				expenseDetails: details,
				expenseSummary: summary
			};
		}
		function handleCardClick(item) {
			if (!item.resolved || !item.process) {
				ElMessage.info(`「${item.name}」审批流程待接入，请联系管理员在「审批设置」中发布对应流程`);
				return;
			}
			openStart(item.process);
		}
		function openStart(proc) {
			resubmitInstanceId.value = null;
			selectedProcess.value = proc;
			if (proc.processKey === "leave") {
				loadMyBalances();
				leaveHalf.startDay = "";
				leaveHalf.startAmpm = "上午";
				leaveHalf.endDay = "";
				leaveHalf.endAmpm = "下午";
			}
			processTitle.value = "";
			attachments.value = [];
			Object.keys(formValues).forEach((k) => delete formValues[k]);
			try {
				const config = JSON.parse(proc.formConfig || "[]");
				formFields.value = Array.isArray(config) ? config : [];
			} catch (_unused3) {
				formFields.value = [];
			}
			for (const f of formFields.value) {
				if (f.type === "attachment") continue;
				formValues[f.field] = f.type === "number" ? null : "";
			}
			if (!hasImpersonationSessionMarker()) try {
				const raw = localStorage.getItem("approval_draft_" + proc.processKey);
				if (raw) {
					const d = JSON.parse(raw);
					if (d && typeof d === "object") {
						if (d.title) processTitle.value = d.title;
						if (d.values && typeof d.values === "object") Object.assign(formValues, d.values);
						if (proc.processKey === "leave") {
							const parsed = parseHalfDay(formValues.startDate);
							if (parsed) {
								leaveHalf.startDay = parsed.day;
								leaveHalf.startAmpm = formValues.startAmpm || parsed.ampm;
							}
							const parsedEnd = parseHalfDay(formValues.endDate);
							if (parsedEnd) {
								leaveHalf.endDay = parsedEnd.day;
								leaveHalf.endAmpm = formValues.endAmpm || parsedEnd.ampm;
							}
						}
						ElMessage.info("已恢复上次未提交的草稿");
					}
				}
			} catch (_unused4) {}
			if (isExpenseProcess.value) resetExpenseDetails();
			startVisible.value = true;
		}
		const resubmitInstanceId = ref(null);
		function openResubmit(_x4) {
			return _openResubmit.apply(this, arguments);
		}
		function _openResubmit() {
			_openResubmit = _asyncToGenerator(function* (instanceId) {
				const inst = yield approvalCenterApi.detail(instanceId);
				if (!inst) {
					ElMessage.error("找不到该申请");
					return;
				}
				if (inst.status !== 4) {
					ElMessage.info("该申请不是「待修改」状态,无法重新提交");
					return;
				}
				const def = publishedProcesses.value.find((p) => p.id === inst.processDefId);
				const pseudo = def ? _objectSpread2(_objectSpread2({}, def), {}, {
					formConfig: inst.formConfig || def.formConfig,
					processConfig: inst.processConfig || def.processConfig
				}) : {
					id: inst.processDefId,
					processKey: "",
					name: inst.processName,
					category: "",
					formConfig: inst.formConfig || "[]",
					processConfig: inst.processConfig || ""
				};
				openStart(pseudo);
				resubmitInstanceId.value = instanceId;
				processTitle.value = inst.title || "";
				try {
					const data = JSON.parse(inst.formData || "{}");
					Object.keys(data).forEach((k) => {
						if (!k.startsWith("__")) formValues[k] = data[k];
					});
					if (pseudo.processKey === "leave") {
						const s = parseHalfDay(formValues.startDate);
						if (s) {
							leaveHalf.startDay = s.day;
							leaveHalf.startAmpm = formValues.startAmpm || s.ampm;
						}
						const e = parseHalfDay(formValues.endDate);
						if (e) {
							leaveHalf.endDay = e.day;
							leaveHalf.endAmpm = formValues.endAmpm || e.ampm;
						}
					}
					if (isExpenseProcess.value && Array.isArray(data.expenseDetails) && data.expenseDetails.length) expenseDetails.value = data.expenseDetails.map((d) => createExpenseDetail(d));
				} catch (_unused5) {}
				attachments.value = (inst.attachments || []).map((a) => ({
					fileId: a.fileId,
					name: a.fileName
				}));
			});
			return _openResubmit.apply(this, arguments);
		}
		function submitStart() {
			return _submitStart.apply(this, arguments);
		}
		function _submitStart() {
			_submitStart = _asyncToGenerator(function* () {
				var _selectedProcess$valu4;
				if (!selectedProcess.value) return;
				if (!processTitle.value.trim()) {
					ElMessage.warning("请输入审批标题");
					return;
				}
				if (isExpenseProcess.value) {
					if (!validateExpenseDetails()) return;
				} else for (const f of formFields.value) {
					if (!f.required) continue;
					if (f.type === "attachment") {
						if (!attachments.value.length) {
							ElMessage.warning(`「${f.label}」请至少上传一个附件`);
							return;
						}
						continue;
					}
					const v = formValues[f.field];
					if (v == null || v === "" || Array.isArray(v) && !v.length) {
						ElMessage.warning(`「${f.label}」不能为空`);
						return;
					}
				}
				if (((_selectedProcess$valu4 = selectedProcess.value) === null || _selectedProcess$valu4 === void 0 ? void 0 : _selectedProcess$valu4.processKey) === "leave") {
					const bal = balanceOf(formValues["leaveType"]);
					if (bal) {
						const days = Number(formValues["days"] || 0);
						if (days > bal.remaining + 1e-6) {
							ElMessage.warning(`${formValues["leaveType"]}余额不足:剩余 ${bal.remaining} 天,本次申请 ${days} 天`);
							return;
						}
					}
				}
				if (attachUploading.value) {
					ElMessage.warning("附件还在上传中,请稍候");
					return;
				}
				submitting.value = true;
				try {
					const payload = isExpenseProcess.value ? buildExpensePayload() : _objectSpread2({}, formValues);
					if (attachments.value.length) payload.__attachmentFileIds = attachments.value.map((a) => a.fileId);
					if (resubmitInstanceId.value) {
						yield instanceApi.resubmit(resubmitInstanceId.value, {
							title: processTitle.value.trim(),
							formData: payload
						});
						ElMessage.success("已重新提交,流程重新开始审批");
						resubmitInstanceId.value = null;
					} else {
						yield approvalCenterApi.start(selectedProcess.value.processKey, processTitle.value.trim(), payload);
						ElMessage.success("提交成功");
					}
					try {
						if (!hasImpersonationSessionMarker() && selectedProcess.value) localStorage.removeItem("approval_draft_" + selectedProcess.value.processKey);
					} catch (_unused6) {}
					startVisible.value = false;
					emit("submitted");
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "提交失败");
				}
				submitting.value = false;
			});
			return _submitStart.apply(this, arguments);
		}
		onMounted(_asyncToGenerator(function* () {
			yield loadProcesses();
			window.addEventListener("paste", onApprovalPaste);
		}));
		onUnmounted(() => {
			window.removeEventListener("paste", onApprovalPaste);
		});
		__expose({
			openStart,
			openResubmit,
			reloadProcesses: loadProcesses
		});
		function parseHalfDay(val) {
			if (!val) return null;
			const m = /^(\d{4}-\d{2}-\d{2})(?:\s*(上午|下午))?/.exec(String(val).trim());
			if (!m) return null;
			return {
				day: m[1],
				ampm: m[2] || "上午"
			};
		}
		function halfSlotIndex(day, ampm) {
			const t = new Date(day.slice(0, 10)).getTime();
			if (isNaN(t)) return null;
			return Math.round(t / 864e5) * 2 + (ampm === "下午" ? 1 : 0);
		}
		watch(() => {
			var _selectedProcess$valu5;
			return [
				leaveHalf.startDay,
				leaveHalf.startAmpm,
				leaveHalf.endDay,
				leaveHalf.endAmpm,
				(_selectedProcess$valu5 = selectedProcess.value) === null || _selectedProcess$valu5 === void 0 ? void 0 : _selectedProcess$valu5.processKey
			];
		}, () => {
			var _selectedProcess$valu6;
			if (((_selectedProcess$valu6 = selectedProcess.value) === null || _selectedProcess$valu6 === void 0 ? void 0 : _selectedProcess$valu6.processKey) !== "leave") return;
			formValues.startDate = leaveHalf.startDay || "";
			formValues.startAmpm = leaveHalf.startDay ? leaveHalf.startAmpm : "";
			formValues.endDate = leaveHalf.endDay || "";
			formValues.endAmpm = leaveHalf.endDay ? leaveHalf.endAmpm : "";
			if (!leaveHalf.startDay || !leaveHalf.endDay) {
				formValues.days = null;
				return;
			}
			const si = halfSlotIndex(leaveHalf.startDay, leaveHalf.startAmpm);
			const ei = halfSlotIndex(leaveHalf.endDay, leaveHalf.endAmpm);
			if (si == null || ei == null || ei < si) {
				formValues.days = null;
				return;
			}
			formValues.days = (ei - si + 1) * .5;
		}, { deep: true });
		watch([formValues, processTitle], () => {
			if (!startVisible.value || !selectedProcess.value || hasImpersonationSessionMarker()) return;
			try {
				localStorage.setItem("approval_draft_" + selectedProcess.value.processKey, JSON.stringify({
					title: processTitle.value,
					values: _objectSpread2({}, formValues)
				}));
			} catch (_unused7) {}
		}, { deep: true });
		return (_ctx, _cache) => {
			const _component_el_input = ElInput;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_form_item = ElFormItem;
			const _component_el_alert = ElAlert;
			const _component_el_button = ElButton;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_input_number = ElInputNumber;
			const _component_el_image = ElImage;
			const _component_el_form = ElForm;
			const _component_el_dialog = ElDialog;
			return openBlock(), createElementBlock("div", _hoisted_1$1, [
				createBaseVNode("div", _hoisted_2$1, [_cache[6] || (_cache[6] = createBaseVNode("div", { class: "ac-header__title" }, "发起申请", -1)), createBaseVNode("div", _hoisted_3$1, [createVNode(_component_el_input, {
					modelValue: keyword.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
					placeholder: "搜索审批类型 / 标题",
					clearable: "",
					class: "ac-search",
					"prefix-icon": unref(search_default)
				}, null, 8, ["modelValue", "prefix-icon"])])]),
				createBaseVNode("div", _hoisted_4$1, [createBaseVNode("div", _hoisted_5$1, [(openBlock(), createElementBlock(Fragment, null, renderList(CATEGORIES, (cat) => {
					return createBaseVNode("span", {
						key: cat.value,
						class: normalizeClass(["ac-cat", { "ac-cat--active": activeCat.value === cat.value }]),
						onClick: ($event) => activeCat.value = cat.value
					}, toDisplayString(cat.label), 11, _hoisted_6$1);
				}), 64))]), processLoading.value ? (openBlock(), createBlock(_component_el_skeleton, {
					key: 0,
					rows: 6,
					animated: "",
					style: { "margin-top": "16px" }
				})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [(openBlock(true), createElementBlock(Fragment, null, renderList(visibleGroups.value, (group) => {
					return openBlock(), createElementBlock("div", {
						key: group.value,
						class: "ac-group"
					}, [createBaseVNode("div", _hoisted_7$1, [
						createBaseVNode("span", {
							class: "ac-group__bar",
							style: normalizeStyle({ background: group.color })
						}, null, 4),
						createTextVNode(" " + toDisplayString(group.label) + " ", 1),
						createBaseVNode("span", _hoisted_8$1, toDisplayString(group.items.length), 1)
					]), createBaseVNode("div", _hoisted_9$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(group.items, (item) => {
						return openBlock(), createElementBlock("div", {
							key: item.key,
							class: normalizeClass(["ac-card", { "ac-card--disabled": !item.resolved }]),
							style: normalizeStyle({ "--c": group.color }),
							onClick: ($event) => handleCardClick(item)
						}, [createBaseVNode("div", _hoisted_11$1, [createVNode(_component_el_icon, { size: 20 }, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.icon)))]),
							_: 2
						}, 1024)]), createBaseVNode("div", _hoisted_12$1, [createBaseVNode("div", _hoisted_13$1, toDisplayString(item.name), 1), createBaseVNode("div", _hoisted_14$1, [item.resolved ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: "success",
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[7] || (_cache[7] = [createTextVNode("可发起", -1)])]),
							_: 1
						})) : (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							type: "info",
							size: "small",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[8] || (_cache[8] = [createTextVNode("待接入", -1)])]),
							_: 1
						}))])])], 14, _hoisted_10$1);
					}), 128))])]);
				}), 128)), visibleGroups.value.length === 0 ? (openBlock(), createBlock(_component_el_empty, {
					key: 0,
					description: "该分类暂无审批类型"
				})) : createCommentVNode("", true)], 64))]),
				createVNode(_component_el_dialog, {
					modelValue: startVisible.value,
					"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => startVisible.value = $event),
					width: "780px",
					top: "5vh",
					class: "ac-flow-dialog ac-start-dialog",
					"close-on-click-modal": false
				}, {
					header: withCtx(() => {
						var _selectedProcess$valu7;
						return [createBaseVNode("div", _hoisted_15$1, [createBaseVNode("span", _hoisted_16$1, toDisplayString(resubmitInstanceId.value ? "修改并重新提交" : "发起审批"), 1), createBaseVNode("strong", null, toDisplayString(((_selectedProcess$valu7 = selectedProcess.value) === null || _selectedProcess$valu7 === void 0 ? void 0 : _selectedProcess$valu7.name) || "审批"), 1)])];
					}),
					footer: withCtx(() => [createVNode(_component_el_button, {
						size: "large",
						plain: "",
						onClick: _cache[4] || (_cache[4] = ($event) => startVisible.value = false)
					}, {
						default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						size: "large",
						loading: submitting.value,
						onClick: submitStart,
						style: {
							"padding-left": "30px",
							"padding-right": "30px",
							"font-weight": "600"
						}
					}, {
						default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("提交审批", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_form, {
						model: formValues,
						"label-position": "top",
						class: "ac-start-form"
					}, {
						default: withCtx(() => {
							var _selectedProcess$valu8, _selectedProcess$valu9, _selectedProcess$valu10, _selectedProcess$valu11;
							return [
								createBaseVNode("section", _hoisted_17$1, [createBaseVNode("div", _hoisted_18$1, [_cache[9] || (_cache[9] = createBaseVNode("span", null, "基本信息", -1)), createBaseVNode("em", null, toDisplayString(((_selectedProcess$valu8 = selectedProcess.value) === null || _selectedProcess$valu8 === void 0 ? void 0 : _selectedProcess$valu8.category) || "workflow"), 1)]), createVNode(_component_el_form_item, {
									label: "审批标题",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_input, {
										modelValue: processTitle.value,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => processTitle.value = $event),
										placeholder: "例如: 6月客户拜访交通费报销"
									}, null, 8, ["modelValue"])]),
									_: 1
								})]),
								((_selectedProcess$valu9 = selectedProcess.value) === null || _selectedProcess$valu9 === void 0 ? void 0 : _selectedProcess$valu9.processKey) === "leave" && formValues["leaveType"] && balanceOf(formValues["leaveType"]) ? (openBlock(), createBlock(_component_el_alert, {
									key: 0,
									title: `${formValues["leaveType"]}余额:剩余 ${balanceOf(formValues["leaveType"]).remaining} 天(总 ${balanceOf(formValues["leaveType"]).total} · 已用 ${balanceOf(formValues["leaveType"]).used})`,
									type: balanceOf(formValues["leaveType"]).remaining > 0 ? "info" : "warning",
									closable: false,
									"show-icon": "",
									class: "ac-balance-alert"
								}, null, 8, ["title", "type"])) : createCommentVNode("", true),
								isExpenseProcess.value ? (openBlock(), createElementBlock("section", _hoisted_19$1, [
									createBaseVNode("div", _hoisted_20$1, [_cache[10] || (_cache[10] = createBaseVNode("span", null, "费用明细", -1)), createBaseVNode("em", null, "同类型自动汇总 · " + toDisplayString(expenseDetails.value.length) + " 笔", 1)]),
									createBaseVNode("div", _hoisted_21$1, [createBaseVNode("div", _hoisted_22$1, [
										_cache[11] || (_cache[11] = createBaseVNode("span", null, "费用汇总", -1)),
										createBaseVNode("strong", null, "¥" + toDisplayString(moneyText(expenseTotal.value)), 1),
										_cache[12] || (_cache[12] = createBaseVNode("small", null, "提交时自动写入报销金额", -1))
									]), createBaseVNode("div", _hoisted_23$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(expenseSummary.value, (item) => {
										return openBlock(), createElementBlock("span", {
											key: item.type,
											class: "expense-type-pill"
										}, toDisplayString(item.type) + " ¥" + toDisplayString(moneyText(item.amount)), 1);
									}), 128)), !expenseSummary.value.length ? (openBlock(), createElementBlock("span", _hoisted_24$1, "填写明细后自动按类型归集")) : createCommentVNode("", true)])]),
									createBaseVNode("div", _hoisted_25$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(expenseDetails.value, (detail, index) => {
										return openBlock(), createElementBlock("div", {
											key: detail.id,
											class: "expense-line"
										}, [createBaseVNode("div", _hoisted_26$1, [createBaseVNode("span", null, "明细 " + toDisplayString(index + 1), 1), createBaseVNode("div", null, [createVNode(_component_el_button, {
											text: "",
											type: "primary",
											icon: unref(copy_document_default),
											onClick: ($event) => copyExpenseDetail(index)
										}, {
											default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("复制", -1)])]),
											_: 1
										}, 8, ["icon", "onClick"]), createVNode(_component_el_button, {
											text: "",
											type: "danger",
											icon: unref(delete_default),
											disabled: expenseDetails.value.length === 1,
											onClick: ($event) => removeExpenseDetail(index)
										}, {
											default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("删除", -1)])]),
											_: 1
										}, 8, [
											"icon",
											"disabled",
											"onClick"
										])])]), createBaseVNode("div", _hoisted_27$1, [
											createVNode(_component_el_form_item, {
												label: "费用类型",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_select, {
													modelValue: detail.type,
													"onUpdate:modelValue": ($event) => detail.type = $event,
													placeholder: "请选择类型"
												}, {
													default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(EXPENSE_TYPES, (type) => {
														return createVNode(_component_el_option, {
															key: type,
															label: type,
															value: type
														}, null, 8, ["label", "value"]);
													}), 64))]),
													_: 1
												}, 8, ["modelValue", "onUpdate:modelValue"])]),
												_: 2
											}, 1024),
											createVNode(_component_el_form_item, {
												label: "发生日期",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_date_picker, {
													modelValue: detail.expenseDate,
													"onUpdate:modelValue": ($event) => detail.expenseDate = $event,
													type: "date",
													"value-format": "YYYY-MM-DD",
													placeholder: "请选择日期"
												}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
												_: 2
											}, 1024),
											createVNode(_component_el_form_item, {
												label: "金额",
												required: ""
											}, {
												default: withCtx(() => [createVNode(_component_el_input_number, {
													modelValue: detail.amount,
													"onUpdate:modelValue": ($event) => detail.amount = $event,
													min: 0,
													precision: 2,
													controls: false,
													placeholder: "0.00"
												}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
												_: 2
											}, 1024),
											createVNode(_component_el_form_item, {
												label: "内容/用途",
												required: "",
												class: "expense-grid__wide"
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: detail.content,
													"onUpdate:modelValue": ($event) => detail.content = $event,
													placeholder: "例如: 拜访客户往返打车费"
												}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
												_: 2
											}, 1024),
											createVNode(_component_el_form_item, {
												label: "备注",
												class: "expense-grid__wide"
											}, {
												default: withCtx(() => [createVNode(_component_el_input, {
													modelValue: detail.remark,
													"onUpdate:modelValue": ($event) => detail.remark = $event,
													placeholder: "可填写客户名、项目名、票据说明等"
												}, null, 8, ["modelValue", "onUpdate:modelValue"])]),
												_: 2
											}, 1024)
										])]);
									}), 128))]),
									createVNode(_component_el_button, {
										class: "expense-add-btn",
										icon: unref(plus_default),
										onClick: addExpenseDetail
									}, {
										default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("添加明细", -1)])]),
										_: 1
									}, 8, ["icon"])
								])) : (openBlock(), createElementBlock("section", _hoisted_28$1, [_cache[20] || (_cache[20] = createBaseVNode("div", { class: "ac-section-head" }, [createBaseVNode("span", null, "申请内容"), createBaseVNode("em", null, "按流程表单填写")], -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(visibleFormFields.value, (field) => {
									return openBlock(), createElementBlock(Fragment, { key: field.field }, [field.type === "description" ? (openBlock(), createBlock(_component_el_alert, {
										key: 0,
										title: field.label,
										type: "info",
										closable: false,
										"show-icon": "",
										style: { "margin-bottom": "14px" }
									}, null, 8, ["title"])) : isLeaveProcess.value && (field.field === "startDate" || field.field === "endDate") ? (openBlock(), createBlock(_component_el_form_item, {
										key: 1,
										label: field.label,
										required: field.required
									}, {
										default: withCtx(() => [createBaseVNode("div", _hoisted_29$1, [createVNode(_component_el_date_picker, {
											modelValue: leaveHalf[field.field === "startDate" ? "startDay" : "endDay"],
											"onUpdate:modelValue": ($event) => leaveHalf[field.field === "startDate" ? "startDay" : "endDay"] = $event,
											type: "date",
											"value-format": "YYYY-MM-DD",
											placeholder: "请选择日期",
											class: "ac-halfday__date"
										}, null, 8, ["modelValue", "onUpdate:modelValue"]), createVNode(_component_el_select, {
											modelValue: leaveHalf[field.field === "startDate" ? "startAmpm" : "endAmpm"],
											"onUpdate:modelValue": ($event) => leaveHalf[field.field === "startDate" ? "startAmpm" : "endAmpm"] = $event,
											placeholder: "上午/下午",
											class: "ac-halfday__ampm"
										}, {
											default: withCtx(() => [createVNode(_component_el_option, {
												label: "上午",
												value: "上午"
											}), createVNode(_component_el_option, {
												label: "下午",
												value: "下午"
											})]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"])])]),
										_: 2
									}, 1032, ["label", "required"])) : isLeaveProcess.value && field.field === "days" ? (openBlock(), createBlock(_component_el_form_item, {
										key: 2,
										label: field.label,
										required: field.required
									}, {
										default: withCtx(() => [createVNode(_component_el_input, {
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											readonly: "",
											placeholder: "按开始/结束自动计算"
										}, {
											suffix: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("天", -1)])]),
											_: 1
										}, 8, ["modelValue", "onUpdate:modelValue"]), _cache[17] || (_cache[17] = createBaseVNode("span", { class: "ac-halfday__hint" }, "按开始/结束(半天)自动计算,最小 0.5 天", -1))]),
										_: 2
									}, 1032, ["label", "required"])) : (openBlock(), createBlock(_component_el_form_item, {
										key: 3,
										label: field.label,
										required: field.required
									}, {
										default: withCtx(() => [field.type === "text" ? (openBlock(), createBlock(_component_el_input, {
											key: 0,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "textarea" ? (openBlock(), createBlock(_component_el_input, {
											key: 1,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											type: "textarea",
											rows: 3
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "number" ? (openBlock(), createBlock(_component_el_input_number, {
											key: 2,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											min: 0,
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "amount" ? (openBlock(), createBlock(_component_el_input_number, {
											key: 3,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											min: 0,
											precision: 2,
											step: 100,
											"controls-position": "right",
											placeholder: "0.00",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "date" ? (openBlock(), createBlock(_component_el_date_picker, {
											key: 4,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											type: "date",
											"value-format": "YYYY-MM-DD",
											placeholder: "请选择日期",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "datetime" ? (openBlock(), createBlock(_component_el_date_picker, {
											key: 5,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											type: "datetime",
											"value-format": "YYYY-MM-DD HH:mm",
											placeholder: "请选择时间",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "daterange" ? (openBlock(), createBlock(_component_el_date_picker, {
											key: 6,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											type: "daterange",
											"range-separator": "~",
											"start-placeholder": "开始日期",
											"end-placeholder": "结束日期",
											"value-format": "YYYY-MM-DD",
											style: { "width": "100%" }
										}, null, 8, ["modelValue", "onUpdate:modelValue"])) : field.type === "select" ? (openBlock(), createBlock(_component_el_select, {
											key: 7,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											style: { "width": "100%" },
											placeholder: "请选择"
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (opt) => {
												return openBlock(), createBlock(_component_el_option, {
													key: opt,
													label: opt,
													value: opt
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 2
										}, 1032, ["modelValue", "onUpdate:modelValue"])) : field.type === "multiselect" ? (openBlock(), createBlock(_component_el_select, {
											key: 8,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event,
											multiple: "",
											filterable: "",
											"collapse-tags": "",
											style: { "width": "100%" },
											placeholder: "可多选"
										}, {
											default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(field.options || [], (opt) => {
												return openBlock(), createBlock(_component_el_option, {
													key: opt,
													label: opt,
													value: opt
												}, null, 8, ["label", "value"]);
											}), 128))]),
											_: 2
										}, 1032, ["modelValue", "onUpdate:modelValue"])) : field.type === "attachment" ? (openBlock(), createElementBlock("div", _hoisted_30$1, [attachments.value.length ? (openBlock(), createElementBlock("div", _hoisted_31$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(attachments.value, (f, i) => {
											return openBlock(), createElementBlock("div", {
												class: "ac-attach-item",
												key: i
											}, [
												isImgAttach(f) ? (openBlock(), createBlock(_component_el_image, {
													key: 0,
													src: f.url,
													"preview-src-list": [f.url],
													fit: "cover",
													class: "ac-attach-thumb",
													"preview-teleported": "",
													"hide-on-click-modal": "",
													onClick: _cache[2] || (_cache[2] = withModifiers(() => {}, ["stop"]))
												}, null, 8, ["src", "preview-src-list"])) : (openBlock(), createBlock(_component_el_icon, { key: 1 }, {
													default: withCtx(() => [createVNode(unref(document_default))]),
													_: 1
												})),
												createBaseVNode("span", _hoisted_32$1, toDisplayString(f.name), 1),
												createVNode(_component_el_icon, {
													class: "ac-attach-del",
													onClick: ($event) => attachments.value.splice(i, 1)
												}, {
													default: withCtx(() => [createVNode(unref(close_default))]),
													_: 1
												}, 8, ["onClick"])
											]);
										}), 128))])) : createCommentVNode("", true), createBaseVNode("div", _hoisted_33$1, [createVNode(_component_el_button, {
											icon: unref(upload_default),
											loading: attachUploading.value,
											onClick: triggerAttach
										}, {
											default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("上传附件", -1)])]),
											_: 1
										}, 8, ["icon", "loading"]), _cache[19] || (_cache[19] = createBaseVNode("span", { class: "ac-attach-tip" }, "支持多个文件，单个 ≤ 10MB；也可直接 Ctrl+V 粘贴截图", -1))])])) : (openBlock(), createBlock(_component_el_input, {
											key: 10,
											modelValue: formValues[field.field],
											"onUpdate:modelValue": ($event) => formValues[field.field] = $event
										}, null, 8, ["modelValue", "onUpdate:modelValue"]))]),
										_: 2
									}, 1032, ["label", "required"]))], 64);
								}), 128))])),
								((_selectedProcess$valu10 = selectedProcess.value) === null || _selectedProcess$valu10 === void 0 ? void 0 : _selectedProcess$valu10.processConfig) ? (openBlock(), createElementBlock("section", _hoisted_34$1, [_cache[21] || (_cache[21] = createBaseVNode("div", { class: "ac-section-head" }, [createBaseVNode("span", null, "审批流程"), createBaseVNode("em", null, "提交后按此流程流转")], -1)), createVNode(ApprovalTrack_default, {
									histories: [],
									"process-config": ((_selectedProcess$valu11 = selectedProcess.value) === null || _selectedProcess$valu11 === void 0 ? void 0 : _selectedProcess$valu11.processConfig) || "",
									"initiator-name": "发起人",
									preview: "",
									"show-history": false
								}, null, 8, ["process-config"])])) : createCommentVNode("", true),
								!hasAttachmentField.value ? (openBlock(), createElementBlock("section", _hoisted_35$1, [_cache[24] || (_cache[24] = createBaseVNode("div", { class: "ac-section-head" }, [createBaseVNode("span", null, "附件"), createBaseVNode("em", null, "发票、截图、行程单等")], -1)), createBaseVNode("div", _hoisted_36$1, [attachments.value.length ? (openBlock(), createElementBlock("div", _hoisted_37$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(attachments.value, (f, i) => {
									return openBlock(), createElementBlock("div", {
										class: "ac-attach-item",
										key: i
									}, [
										isImgAttach(f) ? (openBlock(), createBlock(_component_el_image, {
											key: 0,
											src: f.url,
											"preview-src-list": [f.url],
											fit: "cover",
											class: "ac-attach-thumb",
											"preview-teleported": "",
											"hide-on-click-modal": "",
											onClick: _cache[3] || (_cache[3] = withModifiers(() => {}, ["stop"]))
										}, null, 8, ["src", "preview-src-list"])) : (openBlock(), createBlock(_component_el_icon, { key: 1 }, {
											default: withCtx(() => [createVNode(unref(document_default))]),
											_: 1
										})),
										createBaseVNode("span", _hoisted_38$1, toDisplayString(f.name), 1),
										createVNode(_component_el_icon, {
											class: "ac-attach-del",
											onClick: ($event) => attachments.value.splice(i, 1)
										}, {
											default: withCtx(() => [createVNode(unref(close_default))]),
											_: 1
										}, 8, ["onClick"])
									]);
								}), 128))])) : createCommentVNode("", true), createBaseVNode("div", _hoisted_39$1, [createVNode(_component_el_button, {
									icon: unref(upload_default),
									loading: attachUploading.value,
									onClick: triggerAttach
								}, {
									default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("上传附件", -1)])]),
									_: 1
								}, 8, ["icon", "loading"]), _cache[23] || (_cache[23] = createBaseVNode("span", { class: "ac-attach-tip" }, "支持多个文件，单个 ≤ 10MB；也可直接 Ctrl+V 粘贴截图", -1))])])])) : createCommentVNode("", true),
								createBaseVNode("input", {
									ref_key: "attachInput",
									ref: attachInput,
									type: "file",
									multiple: "",
									style: { "display": "none" },
									onChange: onAttachPick
								}, null, 544)
							];
						}),
						_: 1
					}, 8, ["model"])]),
					_: 1
				}, 8, ["modelValue"])
			]);
		};
	}
}), [["__scopeId", "data-v-717d3b2b"]]);
//#endregion
//#region src/views/approval/approval-center.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "lk-nav" };
var _hoisted_2 = ["onClick"];
var _hoisted_3 = { class: "lk-nav__label" };
var _hoisted_4 = {
	key: 0,
	class: "lk-nav__badge"
};
var _hoisted_5 = { class: "lk-list" };
var _hoisted_6 = { class: "lk-list__toolbar" };
var _hoisted_7 = { class: "lk-filter__btn" };
var _hoisted_8 = { class: "lk-list__scroll" };
var _hoisted_9 = ["onClick"];
var _hoisted_10 = { class: "lk-card__head" };
var _hoisted_11 = { class: "lk-card__title" };
var _hoisted_12 = {
	key: 0,
	class: "lk-card__fields"
};
var _hoisted_13 = { class: "lk-card__field-label" };
var _hoisted_14 = { class: "lk-card__foot" };
var _hoisted_15 = { class: "lk-card__initiator" };
var _hoisted_16 = { class: "lk-card__time" };
var _hoisted_17 = {
	key: 0,
	class: "lk-batchbar"
};
var _hoisted_18 = { class: "lk-batchbar__count" };
var _hoisted_19 = {
	key: 1,
	class: "lk-list__pager"
};
var _hoisted_20 = { class: "lk-detail" };
var _hoisted_21 = {
	key: 1,
	class: "lk-detail__loading"
};
var _hoisted_22 = { class: "lk-detail__header" };
var _hoisted_23 = { class: "lk-detail__no" };
var _hoisted_24 = { class: "lk-detail__titleline" };
var _hoisted_25 = { class: "lk-detail__title" };
var _hoisted_26 = { class: "lk-detail__meta" };
var _hoisted_27 = { class: "lk-detail__meta-text" };
var _hoisted_28 = { class: "lk-detail__meta-name" };
var _hoisted_29 = {
	key: 0,
	class: "lk-detail__meta-dept"
};
var _hoisted_30 = { class: "lk-detail__meta-sub" };
var _hoisted_31 = { class: "lk-detail__body" };
var _hoisted_32 = { class: "lk-form" };
var _hoisted_33 = { class: "lk-form__label" };
var _hoisted_34 = {
	key: 1,
	class: "lk-form__attach"
};
var _hoisted_35 = { class: "lk-form__attach-grid" };
var _hoisted_36 = ["onClick"];
var _hoisted_37 = { class: "lk-form__attach-file" };
var _hoisted_38 = { class: "lk-track" };
var _hoisted_39 = {
	key: 0,
	class: "lk-actions"
};
var _hoisted_40 = {
	key: 1,
	class: "lk-actions"
};
var _hoisted_41 = {
	key: 3,
	class: "lk-detail__empty"
};
//#endregion
//#region src/views/approval/approval-center.vue
var approval_center_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "approval-center",
	setup(__props) {
		const canMonitor = hasRole([
			"boss",
			"hr",
			"super_admin"
		]);
		const NAV_TABS = [
			{
				key: "initiate",
				label: "发起申请",
				icon: edit_pen_default
			},
			{
				key: "todo",
				label: "待办",
				icon: clock_default
			},
			{
				key: "done",
				label: "已办",
				icon: finished_default
			},
			{
				key: "cc",
				label: "抄送我",
				icon: bell_default
			},
			{
				key: "started",
				label: "已发起",
				icon: promotion_default
			},
			...canMonitor ? [{
				key: "admin",
				label: "全公司",
				icon: data_analysis_default
			}] : []
		];
		const initiateRef = ref(null);
		function onInitiateSubmitted() {
			loadCounts();
			switchTab("started");
		}
		const isMobile = ref(false);
		let mql = null;
		function syncMobile() {
			isMobile.value = !!mql && mql.matches;
		}
		const activeTab = ref("todo");
		const keyword = ref("");
		const sortAsc = ref(false);
		const timeFilter = ref("all");
		const timeFilterLabel = computed(() => ({
			all: "所有时间",
			week: "最近一周",
			month: "最近一月"
		})[timeFilter.value]);
		const listLoading = ref(false);
		const list = ref([]);
		const totals = reactive({
			todo: 0,
			done: 0,
			cc: 0,
			started: 0,
			admin: 0
		});
		const pageNum = ref(1);
		const pageSize = ref(20);
		const badges = reactive({
			todo: 0,
			done: 0,
			cc: 0,
			started: 0,
			admin: 0,
			initiate: 0
		});
		const emptyText = computed(() => ({
			todo: "暂无待办审批",
			done: "暂无已办记录",
			cc: "暂无抄送记录",
			started: "暂无发起记录",
			admin: "全公司暂无审批"
		})[activeTab.value]);
		function navBadge(key) {
			const n = badges[key];
			if (!n) return "";
			return n > 99 ? "99+" : String(n);
		}
		function loadCounts() {
			return _loadCounts.apply(this, arguments);
		}
		function _loadCounts() {
			_loadCounts = _asyncToGenerator(function* () {
				try {
					const res = yield taskApi.counts();
					const c = res && typeof res === "object" && "data" in res ? res.data : res;
					if (c) {
						badges.todo = Number(c.todo || 0);
						badges.done = Number(c.done || 0);
						badges.cc = Number(c.cc || 0);
						badges.started = Number(c.started || 0);
					}
				} catch (_unused) {}
			});
			return _loadCounts.apply(this, arguments);
		}
		const selectedRow = ref(null);
		const detailInstance = ref(null);
		const detailLoading = ref(false);
		const detailTab = ref("form");
		/** 实例ID:已发起/全公司列表项本身是实例(row.id);待办/已办/抄送项是任务(取 row.instanceId) */
		function instanceIdOf(row) {
			return activeTab.value === "started" || activeTab.value === "admin" ? row.id : row.instanceId;
		}
		/** 当前选中项对应的任务ID(仅待办需要):待办列表行本身就是 task,id 即 taskId */
		const selectedTaskId = computed(() => {
			var _selectedRow$value$id;
			if (activeTab.value !== "todo" || !selectedRow.value) return null;
			return (_selectedRow$value$id = selectedRow.value.id) !== null && _selectedRow$value$id !== void 0 ? _selectedRow$value$id : null;
		});
		const detailInstanceId = computed(() => selectedRow.value ? instanceIdOf(selectedRow.value) : "");
		function rowKey(row) {
			var _row$instanceId;
			return `${activeTab.value}-${row.id}-${(_row$instanceId = row.instanceId) !== null && _row$instanceId !== void 0 ? _row$instanceId : ""}`;
		}
		function isSelected(row) {
			return !!selectedRow.value && rowKey(selectedRow.value) === rowKey(row);
		}
		/** 时间筛选 → 起始日期(yyyy-MM-dd);all 不传 */
		function timeFilterStartDate() {
			if (timeFilter.value === "all") return void 0;
			const days = timeFilter.value === "week" ? 7 : 30;
			const d = /* @__PURE__ */ new Date(Date.now() - days * 864e5);
			return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
		}
		function loadList() {
			return _loadList.apply(this, arguments);
		}
		function _loadList() {
			_loadList = _asyncToGenerator(function* (preserveSelection = false) {
				const tab = activeTab.value;
				if (tab === "initiate") return;
				listLoading.value = true;
				try {
					const params = {
						pageNum: pageNum.value,
						pageSize: pageSize.value,
						keyword: keyword.value.trim() || void 0,
						startDate: timeFilterStartDate()
					};
					let res;
					if (tab === "todo") res = yield approvalCenterApi.todo(params);
					else if (tab === "done") res = yield approvalCenterApi.done(params);
					else if (tab === "cc") res = yield approvalCenterApi.cc(params);
					else if (tab === "admin") {
						const raw = yield get("/workflow/instance/admin/list", params);
						const payload = raw && typeof raw === "object" && "data" in raw ? raw.data : raw;
						res = {
							list: (payload === null || payload === void 0 ? void 0 : payload.records) || [],
							total: Number((payload === null || payload === void 0 ? void 0 : payload.total) || 0)
						};
					} else res = yield approvalCenterApi.started(params);
					list.value = res.list || [];
					totals[tab] = res.total || 0;
				} catch (_unused2) {
					list.value = [];
					totals[tab] = 0;
				}
				listLoading.value = false;
				if (preserveSelection && selectedRow.value) {
					const same = list.value.find((r) => rowKey(r) === rowKey(selectedRow.value));
					if (same) {
						selectRow(same);
						return;
					}
				}
				if (visibleList.value.length) selectRow(visibleList.value[0]);
				else {
					selectedRow.value = null;
					detailInstance.value = null;
				}
			});
			return _loadList.apply(this, arguments);
		}
		const batchMode = ref(false);
		const batchIds = ref([]);
		const batching = ref(false);
		const allPicked = computed(() => visibleList.value.length > 0 && visibleList.value.every((r) => batchIds.value.includes(r.id)));
		const somePicked = computed(() => batchIds.value.length > 0 && !allPicked.value);
		function toggleBatch() {
			batchMode.value = !batchMode.value;
			batchIds.value = [];
		}
		function toggleBatchPick(row) {
			const i = batchIds.value.indexOf(row.id);
			if (i >= 0) batchIds.value.splice(i, 1);
			else batchIds.value.push(row.id);
		}
		function toggleBatchAll(v) {
			batchIds.value = v ? visibleList.value.map((r) => r.id) : [];
		}
		function doBatchApprove() {
			return _doBatchApprove.apply(this, arguments);
		}
		function _doBatchApprove() {
			_doBatchApprove = _asyncToGenerator(function* () {
				if (!batchIds.value.length) return;
				try {
					yield ElMessageBox.confirm(`确认批量同意选中的 ${batchIds.value.length} 条待办?`, "批量同意", { type: "warning" });
				} catch (_unused3) {
					return;
				}
				batching.value = true;
				try {
					var _d$success;
					const res = yield taskApi.batchApprove(batchIds.value.slice());
					const d = res && typeof res === "object" && "data" in res ? res.data : res;
					const ok = (_d$success = d === null || d === void 0 ? void 0 : d.success) !== null && _d$success !== void 0 ? _d$success : 0;
					const failed = (d === null || d === void 0 ? void 0 : d.failed) || [];
					if (failed.length) ElMessage.warning(`成功 ${ok} 条,${failed.length} 条未通过:${failed[0]}`);
					else ElMessage.success(`已批量同意 ${ok} 条`);
					batchIds.value = [];
					batchMode.value = false;
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "批量审批失败");
				}
				batching.value = false;
			});
			return _doBatchApprove.apply(this, arguments);
		}
		function switchTab(key) {
			if (activeTab.value === key) return;
			activeTab.value = key;
			selectedRow.value = null;
			detailInstance.value = null;
			detailTab.value = "form";
			pageNum.value = 1;
			batchMode.value = false;
			batchIds.value = [];
			loadList();
		}
		let searchTimer = null;
		watch([keyword, timeFilter], () => {
			if (searchTimer) clearTimeout(searchTimer);
			searchTimer = setTimeout(() => {
				pageNum.value = 1;
				loadList();
			}, 350);
		});
		function selectRow(_x) {
			return _selectRow.apply(this, arguments);
		}
		function _selectRow() {
			_selectRow = _asyncToGenerator(function* (row) {
				selectedRow.value = row;
				detailTab.value = "form";
				detailLoading.value = true;
				detailInstance.value = null;
				try {
					detailInstance.value = yield approvalCenterApi.detail(instanceIdOf(row));
				} catch (_unused4) {
					detailInstance.value = null;
				}
				detailLoading.value = false;
				if (activeTab.value === "cc" && row && row.id && (row.readFlag === 0 || row.readFlag == null)) try {
					yield taskApi.markCcRead(row.id);
					row.readFlag = 1;
					if (badges.cc > 0) badges.cc--;
				} catch (_unused5) {}
			});
			return _selectRow.apply(this, arguments);
		}
		function onTimeFilter(cmd) {
			timeFilter.value = cmd;
		}
		const visibleList = computed(() => {
			const arr = list.value.slice();
			arr.sort((a, b) => {
				const ta = parseTime(a.startTime) || 0;
				const tb = parseTime(b.startTime) || 0;
				return sortAsc.value ? ta - tb : tb - ta;
			});
			return arr;
		});
		function cardTitle(row) {
			return row.title || row.instanceTitle || row.processName || "审批申请";
		}
		function cardInitiator(row) {
			return row.initiatorName || (row.initiatorId ? "用户" + row.initiatorId : "未知");
		}
		/** 卡片状态文案/颜色:已发起按实例 status;待办固定"待处理";已办按"我的操作";抄送固定"抄送" */
		/** 全公司监控:进行中且当前任务已过时限 → 超时标红 */
		function isOverdue(row) {
			if (row.status !== 0 || !row.currentTaskDeadline) return false;
			const t = parseTime(row.currentTaskDeadline);
			return !!t && t < Date.now();
		}
		function cardStatusText(row) {
			if (activeTab.value === "admin") return isOverdue(row) ? "已超时" : statusText(row.status);
			if (activeTab.value === "started") return statusText(row.status);
			if (activeTab.value === "todo") return "待处理";
			if (activeTab.value === "cc") return "抄送";
			return {
				1: "已同意",
				2: "已拒绝",
				3: "已转交",
				6: "已退回"
			}[row.status] || "已处理";
		}
		function cardTagStyle(row) {
			let color = STATUS_COLORS.processing;
			if (activeTab.value === "admin") color = isOverdue(row) ? STATUS_COLORS.rejected : statusColor(row.status);
			else if (activeTab.value === "started") color = statusColor(row.status);
			else if (activeTab.value === "todo") color = STATUS_COLORS.processing;
			else if (activeTab.value === "cc") color = STATUS_COLORS.canceled;
			else color = {
				1: STATUS_COLORS.passed,
				2: STATUS_COLORS.rejected,
				3: STATUS_COLORS.processing
			}[row.status] || STATUS_COLORS.canceled;
			return tagStyleOf(color);
		}
		/** 卡片摘要 2-3 条关键字段:任务行用服务端抽好的金额/天数;已发起实例行解析 formData */
		function cardFields(row) {
			const entries = [];
			if (row.formData == null) {
				if (row.amount != null && row.amount !== "") entries.push({
					label: "金额",
					value: formatMoney(row.amount),
					money: true
				});
				if (row.days != null && row.days !== "") entries.push({
					label: "天数",
					value: row.days + "天"
				});
				if (row.deadline) entries.push({
					label: "时限",
					value: String(row.deadline).slice(5, 16)
				});
				return entries;
			}
			let parsed;
			try {
				parsed = typeof row.formData === "string" ? JSON.parse(row.formData) : row.formData;
			} catch (_unused6) {
				return [];
			}
			if (!parsed || typeof parsed !== "object") return [];
			for (const key of Object.keys(parsed)) {
				if (ALWAYS_HIDDEN_FIELDS.has(key)) continue;
				if (key === "__attachmentFileIds") continue;
				if (key === "totalAmount" && parsed.amount != null) continue;
				const v = isMoneyField(key) ? formatMoney(parsed[key]) : formatFieldValue(parsed[key]);
				if (v === "") continue;
				entries.push({
					label: fieldLabel(key, row.formConfig),
					value: v,
					money: isMoneyField(key)
				});
				if (entries.length >= 3) break;
			}
			return entries;
		}
		const FIELD_LABELS = {
			expenseType: "费用类型",
			description: "费用说明",
			leaveType: "请假类型",
			days: "请假天数",
			reason: "申请事由",
			item: "采购物品",
			quantity: "数量",
			sealType: "印章类型",
			usage: "用途说明",
			copies: "份数",
			amount: "申请金额",
			totalAmount: "报销金额",
			startDate: "开始时间",
			endDate: "结束时间",
			account: "转账账户",
			payee: "收款方"
		};
		function formLabelMap(formConfig) {
			try {
				const fields = JSON.parse(formConfig || "[]");
				if (!Array.isArray(fields)) return {};
				return fields.reduce((map, field) => {
					if ((field === null || field === void 0 ? void 0 : field.field) && (field === null || field === void 0 ? void 0 : field.label)) map[field.field] = field.label;
					return map;
				}, {});
			} catch (_unused7) {
				return {};
			}
		}
		function fieldLabel(key, formConfig) {
			return formLabelMap(formConfig)[key] || FIELD_LABELS[key] || key;
		}
		const ALWAYS_HIDDEN_FIELDS = new Set([
			"__attachments",
			"__attachmentFileIds",
			"expenseDetails",
			"expenseSummary",
			"detailCount"
		]);
		const MONEY_FIELDS = new Set(["amount", "totalAmount"]);
		function isMoneyField(key) {
			return MONEY_FIELDS.has(key);
		}
		function formatMoney(value) {
			const n = Number(value);
			if (!Number.isFinite(n)) return formatFieldValue(value);
			return "¥" + n.toLocaleString("zh-CN", {
				minimumFractionDigits: n % 1 ? 2 : 0,
				maximumFractionDigits: 2
			});
		}
		function formatFieldValue(value) {
			if (value == null) return "";
			if (Array.isArray(value)) return value.map((v) => typeof v === "object" ? JSON.stringify(v) : String(v)).join("、");
			if (typeof value === "object") return JSON.stringify(value);
			return String(value);
		}
		/** 从某审批实例的表单数据里取附件数组(同 index.vue attachmentsOf,字段名 __attachments) */
		function attachmentsOf(formData) {
			const a = formData && formData.__attachments;
			return Array.isArray(a) ? a : [];
		}
		const detailFormData = computed(() => {
			try {
				var _detailInstance$value;
				if (!((_detailInstance$value = detailInstance.value) === null || _detailInstance$value === void 0 ? void 0 : _detailInstance$value.formData)) return {};
				const parsed = JSON.parse(detailInstance.value.formData);
				return parsed && typeof parsed === "object" ? parsed : {};
			} catch (_unused8) {
				return {};
			}
		});
		const detailDisplayEntries = computed(() => {
			const data = detailFormData.value;
			return Object.entries(data).filter(([key]) => !ALWAYS_HIDDEN_FIELDS.has(key)).filter(([key]) => !(key === "totalAmount" && data.amount != null)).map(([key, value]) => {
				var _detailInstance$value2;
				return {
					key,
					label: fieldLabel(key, (_detailInstance$value2 = detailInstance.value) === null || _detailInstance$value2 === void 0 ? void 0 : _detailInstance$value2.formConfig),
					value: isMoneyField(key) ? formatMoney(value) : formatFieldValue(value),
					money: isMoneyField(key)
				};
			}).filter((item) => item.value !== "");
		});
		const detailAttachments = computed(() => attachmentsOf(detailFormData.value));
		const realAttachments = computed(() => {
			var _detailInstance$value3;
			return ((_detailInstance$value3 = detailInstance.value) === null || _detailInstance$value3 === void 0 ? void 0 : _detailInstance$value3.attachments) || [];
		});
		/** fileId -> objectURL(仅图片类生成预览;组件卸载/切换时释放) */
		const attachmentPreviews = reactive({});
		const realPreviewList = computed(() => realAttachments.value.map((f) => attachmentPreviews[f.fileId]).filter(Boolean));
		function loadAttachmentPreviews() {
			return _loadAttachmentPreviews.apply(this, arguments);
		}
		function _loadAttachmentPreviews() {
			_loadAttachmentPreviews = _asyncToGenerator(function* () {
				Object.keys(attachmentPreviews).forEach((k) => {
					URL.revokeObjectURL(attachmentPreviews[Number(k)]);
					delete attachmentPreviews[Number(k)];
				});
				for (const f of realAttachments.value) {
					if (!((f.mimeType || "").startsWith("image/") || /\.(png|jpe?g|gif|webp|bmp)$/i.test(f.fileName || ""))) continue;
					const url = yield objectUrlForFile(f.fileId);
					if (url) attachmentPreviews[f.fileId] = url;
				}
			});
			return _loadAttachmentPreviews.apply(this, arguments);
		}
		watch(realAttachments, () => {
			loadAttachmentPreviews();
		});
		const initiatorDept = computed(() => {
			var _detailInstance$value4, _detailInstance$value5;
			return ((_detailInstance$value4 = detailInstance.value) === null || _detailInstance$value4 === void 0 ? void 0 : _detailInstance$value4.initiatorDept) || ((_detailInstance$value5 = detailInstance.value) === null || _detailInstance$value5 === void 0 ? void 0 : _detailInstance$value5.deptName) || "";
		});
		const STATUS_COLORS = {
			processing: "#3370ff",
			passed: "#10b981",
			rejected: "#ef4444",
			canceled: "#909399"
		};
		function statusText(s) {
			return {
				0: "审批中",
				1: "已通过",
				2: "已拒绝",
				3: "已撤销",
				4: "待修改"
			}[s] || "审批中";
		}
		function statusColor(s) {
			return {
				0: STATUS_COLORS.processing,
				1: STATUS_COLORS.passed,
				2: STATUS_COLORS.rejected,
				3: STATUS_COLORS.canceled,
				4: "#f59e0b"
			}[s] || STATUS_COLORS.processing;
		}
		function tagStyleOf(color) {
			return {
				color,
				background: hexToSoft(color),
				border: "none",
				fontWeight: "500"
			};
		}
		function statusTagStyle(s) {
			return tagStyleOf(statusColor(s));
		}
		function hexToSoft(hex) {
			const m = /^#?([0-9a-f]{6})$/i.exec(hex);
			if (!m) return "rgba(51,112,255,0.12)";
			const n = parseInt(m[1], 16);
			return `rgba(${n >> 16 & 255}, ${n >> 8 & 255}, ${n & 255}, 0.12)`;
		}
		const AVATAR_COLORS = [
			"#3370ff",
			"#10b981",
			"#f59e0b",
			"#ef4444",
			"#8b5cf6",
			"#06b6d4",
			"#ec4899",
			"#14b8a6"
		];
		function avatarChar(name) {
			if (!name) return "?";
			return name.charAt(0).toUpperCase();
		}
		function avatarStyle(name) {
			const key = name || "?";
			let hash = 0;
			for (let i = 0; i < key.length; i++) hash = hash * 31 + key.charCodeAt(i) >>> 0;
			return { background: AVATAR_COLORS[hash % AVATAR_COLORS.length] };
		}
		function parseTime(s) {
			if (!s) return null;
			const t = new Date(String(s).replace(/-/g, "/")).getTime();
			return Number.isNaN(t) ? null : t;
		}
		/** 相对时间:X分钟/小时/天前(到达 X 天前) */
		function relativeTime(s) {
			const t = parseTime(s);
			if (!t) return "-";
			const diff = Date.now() - t;
			if (diff < 0) return "刚刚";
			const min = Math.floor(diff / 6e4);
			if (min < 1) return "刚刚";
			if (min < 60) return `${min}分钟前`;
			const hour = Math.floor(min / 60);
			if (hour < 24) return `${hour}小时前`;
			const day = Math.floor(hour / 24);
			if (day < 30) return `${day}天前`;
			const month = Math.floor(day / 30);
			if (month < 12) return `${month}个月前`;
			return `${Math.floor(month / 12)}年前`;
		}
		function formatFullTime(s) {
			return s ? String(s).slice(0, 16) : "-";
		}
		const acting = ref(false);
		function doApprove() {
			return _doApprove.apply(this, arguments);
		}
		function _doApprove() {
			_doApprove = _asyncToGenerator(function* () {
				const taskId = selectedTaskId.value;
				if (!taskId) return;
				let comment = "";
				try {
					const { value } = yield ElMessageBox.prompt("请输入审批意见(可选)", "同意审批", {
						confirmButtonText: "确认同意",
						cancelButtonText: "取消",
						inputType: "textarea",
						inputPlaceholder: "请输入审批意见"
					});
					comment = value || "";
				} catch (_unused9) {
					return;
				}
				acting.value = true;
				try {
					yield approvalCenterApi.approve(taskId, comment);
					ElMessage.success("已同意");
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "操作失败");
				}
				acting.value = false;
			});
			return _doApprove.apply(this, arguments);
		}
		function doReject() {
			return _doReject.apply(this, arguments);
		}
		function _doReject() {
			_doReject = _asyncToGenerator(function* () {
				const taskId = selectedTaskId.value;
				if (!taskId) return;
				let comment = "";
				try {
					const { value } = yield ElMessageBox.prompt("请输入拒绝理由(必填)", "拒绝审批", {
						confirmButtonText: "确认拒绝",
						cancelButtonText: "取消",
						inputType: "textarea",
						inputPlaceholder: "请输入拒绝理由",
						inputValidator: (v) => v && v.trim() ? true : "拒绝理由不能为空"
					});
					comment = value;
				} catch (_unused10) {
					return;
				}
				acting.value = true;
				try {
					yield approvalCenterApi.reject(taskId, comment);
					ElMessage.success("已拒绝");
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "操作失败");
				}
				acting.value = false;
			});
			return _doReject.apply(this, arguments);
		}
		/** 退回修改:不是拒绝——发起人改完表单可重新提交,流程从头再走 */
		function doReturn() {
			return _doReturn.apply(this, arguments);
		}
		function _doReturn() {
			_doReturn = _asyncToGenerator(function* () {
				const taskId = selectedTaskId.value;
				if (!taskId) return;
				let comment = "";
				try {
					const { value } = yield ElMessageBox.prompt("请写明需要修改什么(必填,发起人会看到)", "退回修改", {
						confirmButtonText: "确认退回",
						cancelButtonText: "取消",
						inputType: "textarea",
						inputPlaceholder: "例如:请补充发票照片/金额与发票不符请更正",
						inputValidator: (v) => v && v.trim() ? true : "修改意见不能为空"
					});
					comment = value;
				} catch (_unused11) {
					return;
				}
				acting.value = true;
				try {
					yield taskApi.returnForRevision(taskId, { comment });
					ElMessage.success("已退回给发起人修改");
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "操作失败");
				}
				acting.value = false;
			});
			return _doReturn.apply(this, arguments);
		}
		/** 待修改(被退回)的申请:切到"发起申请"tab,复用其动态表单改并重新提交(双页合一,页内直接调用,不再跳路由) */
		function goResubmit() {
			var _detailInstance$value6;
			if (!((_detailInstance$value6 = detailInstance.value) === null || _detailInstance$value6 === void 0 ? void 0 : _detailInstance$value6.id)) return;
			const id = detailInstance.value.id;
			activeTab.value = "initiate";
			setTimeout(() => {
				var _initiateRef$value, _initiateRef$value$op;
				(_initiateRef$value = initiateRef.value) === null || _initiateRef$value === void 0 || (_initiateRef$value$op = _initiateRef$value.openResubmit) === null || _initiateRef$value$op === void 0 || _initiateRef$value$op.call(_initiateRef$value, id);
			}, 60);
		}
		const colleagues = ref([]);
		let colleaguesLoaded = false;
		function ensureColleagues() {
			return _ensureColleagues.apply(this, arguments);
		}
		function _ensureColleagues() {
			_ensureColleagues = _asyncToGenerator(function* () {
				if (colleaguesLoaded) return;
				try {
					colleagues.value = yield approvalCenterApi.colleagues();
					colleaguesLoaded = true;
				} catch (_unused12) {
					colleagues.value = [];
				}
			});
			return _ensureColleagues.apply(this, arguments);
		}
		const ccDlg = reactive({
			visible: false,
			saving: false,
			userIds: []
		});
		function openCc() {
			return _openCc.apply(this, arguments);
		}
		function _openCc() {
			_openCc = _asyncToGenerator(function* () {
				if (!detailInstanceId.value) return;
				ccDlg.userIds = [];
				ccDlg.visible = true;
				yield ensureColleagues();
			});
			return _openCc.apply(this, arguments);
		}
		function submitCc() {
			return _submitCc.apply(this, arguments);
		}
		function _submitCc() {
			_submitCc = _asyncToGenerator(function* () {
				if (!ccDlg.userIds.length) {
					ElMessage.warning("请选择抄送人");
					return;
				}
				ccDlg.saving = true;
				try {
					yield approvalCenterApi.addCc(Number(detailInstanceId.value), ccDlg.userIds);
					ElMessage.success("已抄送");
					ccDlg.visible = false;
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "抄送失败");
				}
				ccDlg.saving = false;
			});
			return _submitCc.apply(this, arguments);
		}
		const transferDlg = reactive({
			visible: false,
			saving: false,
			userId: null,
			comment: ""
		});
		function openTransfer() {
			return _openTransfer.apply(this, arguments);
		}
		function _openTransfer() {
			_openTransfer = _asyncToGenerator(function* () {
				if (!selectedTaskId.value) return;
				transferDlg.userId = null;
				transferDlg.comment = "";
				transferDlg.visible = true;
				yield ensureColleagues();
			});
			return _openTransfer.apply(this, arguments);
		}
		function submitTransfer() {
			return _submitTransfer.apply(this, arguments);
		}
		function _submitTransfer() {
			_submitTransfer = _asyncToGenerator(function* () {
				const taskId = selectedTaskId.value;
				if (!taskId) return;
				if (!transferDlg.userId) {
					ElMessage.warning("请选择转交对象");
					return;
				}
				transferDlg.saving = true;
				try {
					yield approvalCenterApi.transfer(taskId, transferDlg.userId, transferDlg.comment);
					ElMessage.success("已转交");
					transferDlg.visible = false;
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "操作失败");
				}
				transferDlg.saving = false;
			});
			return _submitTransfer.apply(this, arguments);
		}
		function cancelStarted() {
			return _cancelStarted.apply(this, arguments);
		}
		function _cancelStarted() {
			_cancelStarted = _asyncToGenerator(function* () {
				var _detailInstance$value7;
				if (!((_detailInstance$value7 = detailInstance.value) === null || _detailInstance$value7 === void 0 ? void 0 : _detailInstance$value7.id)) return;
				try {
					yield ElMessageBox.confirm("确认撤销这条审批申请？撤销后审批人将不再处理。", "撤销申请", { type: "warning" });
				} catch (_unused13) {
					return;
				}
				acting.value = true;
				try {
					yield approvalCenterApi.cancel(detailInstance.value.id);
					ElMessage.success("已撤销");
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "撤销失败");
				}
				acting.value = false;
			});
			return _cancelStarted.apply(this, arguments);
		}
		function deleteStarted() {
			return _deleteStarted.apply(this, arguments);
		}
		function _deleteStarted() {
			_deleteStarted = _asyncToGenerator(function* () {
				var _detailInstance$value8;
				if (!((_detailInstance$value8 = detailInstance.value) === null || _detailInstance$value8 === void 0 ? void 0 : _detailInstance$value8.id)) return;
				try {
					yield ElMessageBox.confirm("确认删除这条已发起记录？删除后不可在列表中恢复。", "删除记录", { type: "warning" });
				} catch (_unused14) {
					return;
				}
				acting.value = true;
				try {
					yield approvalCenterApi.removeStarted(detailInstance.value.id);
					ElMessage.success("已删除");
					yield afterAction();
				} catch (e) {
					ElMessage.error((e === null || e === void 0 ? void 0 : e.message) || "删除失败");
				}
				acting.value = false;
			});
			return _deleteStarted.apply(this, arguments);
		}
		function afterAction() {
			return _afterAction.apply(this, arguments);
		}
		function _afterAction() {
			_afterAction = _asyncToGenerator(function* () {
				yield loadCounts();
				yield loadList(false);
			});
			return _afterAction.apply(this, arguments);
		}
		const route = useRoute();
		onMounted(() => {
			mql = window.matchMedia("(max-width: 768px)");
			syncMobile();
			mql.addEventListener("change", syncMobile);
			const t = route.query.tab;
			if (t && [
				"todo",
				"done",
				"cc",
				"started",
				"admin",
				"initiate"
			].includes(t) && (t !== "admin" || canMonitor)) activeTab.value = t;
			loadCounts();
			loadList();
		});
		onUnmounted(() => {
			mql === null || mql === void 0 || mql.removeEventListener("change", syncMobile);
		});
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_dropdown_item = ElDropdownItem;
			const _component_el_dropdown_menu = ElDropdownMenu;
			const _component_el_dropdown = ElDropdown;
			const _component_el_tooltip = ElTooltip;
			const _component_el_button = ElButton;
			const _component_el_checkbox = ElCheckbox;
			const _component_el_tag = ElTag;
			const _component_el_empty = ElEmpty;
			const _component_el_pagination = ElPagination;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_tabs = ElTabs;
			const _component_el_image = ElImage;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_dialog = ElDialog;
			const _directive_loading = vLoading;
			return openBlock(), createElementBlock("div", { class: normalizeClass(["lk-approval", { "is-mobile-detail": isMobile.value && selectedRow.value && activeTab.value !== "initiate" }]) }, [
				createBaseVNode("aside", _hoisted_1, [_cache[14] || (_cache[14] = createBaseVNode("div", { class: "lk-nav__title" }, "审批中心", -1)), (openBlock(), createElementBlock(Fragment, null, renderList(NAV_TABS, (nav) => {
					return createBaseVNode("div", {
						key: nav.key,
						class: normalizeClass(["lk-nav__item", { "is-active": activeTab.value === nav.key }]),
						onClick: ($event) => switchTab(nav.key)
					}, [
						createVNode(_component_el_icon, { class: "lk-nav__icon" }, {
							default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(nav.icon)))]),
							_: 2
						}, 1024),
						createBaseVNode("span", _hoisted_3, toDisplayString(nav.label), 1),
						navBadge(nav.key) ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(navBadge(nav.key)), 1)) : createCommentVNode("", true)
					], 10, _hoisted_2);
				}), 64))]),
				activeTab.value === "initiate" ? (openBlock(), createBlock(approval_default, {
					key: 0,
					ref_key: "initiateRef",
					ref: initiateRef,
					class: "lk-initiate",
					onSubmitted: onInitiateSubmitted
				}, null, 512)) : createCommentVNode("", true),
				withDirectives(createBaseVNode("section", _hoisted_5, [
					createBaseVNode("div", _hoisted_6, [
						createVNode(_component_el_input, {
							modelValue: keyword.value,
							"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => keyword.value = $event),
							placeholder: "搜索",
							clearable: "",
							size: "default",
							class: "lk-search",
							"prefix-icon": unref(search_default)
						}, null, 8, ["modelValue", "prefix-icon"]),
						createVNode(_component_el_dropdown, {
							trigger: "click",
							class: "lk-filter",
							onCommand: onTimeFilter
						}, {
							dropdown: withCtx(() => [createVNode(_component_el_dropdown_menu, null, {
								default: withCtx(() => [
									createVNode(_component_el_dropdown_item, { command: "all" }, {
										default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("所有时间", -1)])]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, { command: "week" }, {
										default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("最近一周", -1)])]),
										_: 1
									}),
									createVNode(_component_el_dropdown_item, { command: "month" }, {
										default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("最近一月", -1)])]),
										_: 1
									})
								]),
								_: 1
							})]),
							default: withCtx(() => [createBaseVNode("span", _hoisted_7, [createTextVNode(toDisplayString(timeFilterLabel.value) + " ", 1), createVNode(_component_el_icon, { class: "lk-filter__caret" }, {
								default: withCtx(() => [createVNode(unref(arrow_down_default))]),
								_: 1
							})])]),
							_: 1
						}),
						createVNode(_component_el_tooltip, {
							content: sortAsc.value ? "最早优先" : "最新优先",
							placement: "top"
						}, {
							default: withCtx(() => [createBaseVNode("span", {
								class: "lk-sort",
								onClick: _cache[1] || (_cache[1] = ($event) => sortAsc.value = !sortAsc.value)
							}, [createVNode(_component_el_icon, null, {
								default: withCtx(() => [createVNode(unref(sort_default))]),
								_: 1
							})])]),
							_: 1
						}, 8, ["content"]),
						activeTab.value === "todo" ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							size: "small",
							type: batchMode.value ? "primary" : "default",
							plain: "",
							onClick: toggleBatch
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(batchMode.value ? "退出批量" : "批量"), 1)]),
							_: 1
						}, 8, ["type"])) : createCommentVNode("", true)
					]),
					withDirectives((openBlock(), createElementBlock("div", _hoisted_8, [visibleList.value.length ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(visibleList.value, (row) => {
						return openBlock(), createElementBlock("div", {
							key: rowKey(row),
							class: normalizeClass(["lk-card", {
								"is-active": isSelected(row),
								"is-checked": batchMode.value && batchIds.value.includes(row.id)
							}]),
							onClick: ($event) => batchMode.value ? toggleBatchPick(row) : selectRow(row)
						}, [
							createBaseVNode("div", _hoisted_10, [
								batchMode.value && activeTab.value === "todo" ? (openBlock(), createBlock(_component_el_checkbox, {
									key: 0,
									"model-value": batchIds.value.includes(row.id),
									class: "lk-card__check",
									onClick: withModifiers(($event) => toggleBatchPick(row), ["stop"])
								}, null, 8, ["model-value", "onClick"])) : createCommentVNode("", true),
								createBaseVNode("span", _hoisted_11, toDisplayString(cardTitle(row)), 1),
								createVNode(_component_el_tag, {
									size: "small",
									effect: "light",
									style: normalizeStyle(cardTagStyle(row)),
									class: "lk-card__status"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(cardStatusText(row)), 1)]),
									_: 2
								}, 1032, ["style"])
							]),
							cardFields(row).length ? (openBlock(), createElementBlock("div", _hoisted_12, [(openBlock(true), createElementBlock(Fragment, null, renderList(cardFields(row), (f) => {
								return openBlock(), createElementBlock("div", {
									key: f.label,
									class: "lk-card__field"
								}, [createBaseVNode("span", _hoisted_13, toDisplayString(f.label), 1), createBaseVNode("span", { class: normalizeClass(["lk-card__field-value", { "lk-card__field-value--money": f.money }]) }, toDisplayString(f.value), 3)]);
							}), 128))])) : createCommentVNode("", true),
							createBaseVNode("div", _hoisted_14, [
								createBaseVNode("span", {
									class: "lk-avatar lk-avatar--sm",
									style: normalizeStyle(avatarStyle(cardInitiator(row)))
								}, toDisplayString(avatarChar(cardInitiator(row))), 5),
								createBaseVNode("span", _hoisted_15, toDisplayString(cardInitiator(row)), 1),
								createBaseVNode("span", _hoisted_16, toDisplayString(relativeTime(row.startTime)) + "到达", 1)
							])
						], 10, _hoisted_9);
					}), 128)) : (openBlock(), createBlock(_component_el_empty, {
						key: 1,
						description: emptyText.value,
						"image-size": 90
					}, null, 8, ["description"]))])), [[_directive_loading, listLoading.value]]),
					batchMode.value && activeTab.value === "todo" ? (openBlock(), createElementBlock("div", _hoisted_17, [
						createVNode(_component_el_checkbox, {
							"model-value": allPicked.value,
							indeterminate: somePicked.value,
							onChange: toggleBatchAll
						}, {
							default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("全选本页", -1)])]),
							_: 1
						}, 8, ["model-value", "indeterminate"]),
						createBaseVNode("span", _hoisted_18, "已选 " + toDisplayString(batchIds.value.length), 1),
						createVNode(_component_el_button, {
							type: "primary",
							size: "small",
							disabled: !batchIds.value.length,
							loading: batching.value,
							onClick: doBatchApprove
						}, {
							default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("批量同意", -1)])]),
							_: 1
						}, 8, ["disabled", "loading"])
					])) : (openBlock(), createElementBlock("div", _hoisted_19, [createVNode(_component_el_pagination, {
						"current-page": pageNum.value,
						"onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => pageNum.value = $event),
						"page-size": pageSize.value,
						"onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => pageSize.value = $event),
						total: totals[activeTab.value],
						layout: "total, prev, pager, next",
						"page-sizes": [
							10,
							20,
							50
						],
						small: "",
						onChange: _cache[4] || (_cache[4] = () => loadList())
					}, null, 8, [
						"current-page",
						"page-size",
						"total"
					])]))
				], 512), [[vShow, activeTab.value !== "initiate"]]),
				withDirectives(createBaseVNode("section", _hoisted_20, [isMobile.value ? (openBlock(), createElementBlock("div", {
					key: 0,
					class: "lk-detail__back",
					onClick: _cache[5] || (_cache[5] = ($event) => {
						selectedRow.value = null;
						detailInstance.value = null;
					})
				}, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(arrow_left_default))]),
					_: 1
				}), _cache[20] || (_cache[20] = createTextVNode(" 返回列表 ", -1))])) : createCommentVNode("", true), detailLoading.value ? (openBlock(), createElementBlock("div", _hoisted_21, [createVNode(_component_el_skeleton, {
					rows: 8,
					animated: ""
				})])) : detailInstance.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [
					createBaseVNode("header", _hoisted_22, [
						createBaseVNode("div", _hoisted_23, "编号 " + toDisplayString(detailInstanceId.value), 1),
						createBaseVNode("div", _hoisted_24, [createBaseVNode("h2", _hoisted_25, toDisplayString(detailInstance.value.title || detailInstance.value.processName), 1), createVNode(_component_el_tag, {
							size: "default",
							effect: "light",
							style: normalizeStyle(statusTagStyle(detailInstance.value.status)),
							class: "lk-detail__status"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(statusText(detailInstance.value.status)), 1)]),
							_: 1
						}, 8, ["style"])]),
						createBaseVNode("div", _hoisted_26, [createBaseVNode("span", {
							class: "lk-avatar",
							style: normalizeStyle(avatarStyle(detailInstance.value.initiatorName))
						}, toDisplayString(avatarChar(detailInstance.value.initiatorName)), 5), createBaseVNode("div", _hoisted_27, [createBaseVNode("div", _hoisted_28, [createTextVNode(toDisplayString(detailInstance.value.initiatorName || "用户" + (detailInstance.value.initiatorId || "")) + " ", 1), initiatorDept.value ? (openBlock(), createElementBlock("span", _hoisted_29, toDisplayString(initiatorDept.value), 1)) : createCommentVNode("", true)]), createBaseVNode("div", _hoisted_30, "提交于 " + toDisplayString(formatFullTime(detailInstance.value.startTime)), 1)])]),
						createVNode(_component_el_tabs, {
							modelValue: detailTab.value,
							"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => detailTab.value = $event),
							class: "lk-detail__tabs"
						}, {
							default: withCtx(() => [createVNode(_component_el_tab_pane, {
								label: "审批详情",
								name: "form"
							}), createVNode(_component_el_tab_pane, {
								label: "审批记录",
								name: "track"
							})]),
							_: 1
						}, 8, ["modelValue"])
					]),
					createBaseVNode("div", _hoisted_31, [withDirectives(createBaseVNode("div", _hoisted_32, [
						detailDisplayEntries.value.length ? (openBlock(true), createElementBlock(Fragment, { key: 0 }, renderList(detailDisplayEntries.value, (item) => {
							return openBlock(), createElementBlock("div", {
								key: item.key,
								class: "lk-form__row"
							}, [createBaseVNode("span", _hoisted_33, toDisplayString(item.label), 1), createBaseVNode("span", { class: normalizeClass(["lk-form__value", { "lk-form__value--money": item.money }]) }, toDisplayString(item.value), 3)]);
						}), 128)) : createCommentVNode("", true),
						detailAttachments.value.length || realAttachments.value.length ? (openBlock(), createElementBlock("div", _hoisted_34, [_cache[21] || (_cache[21] = createBaseVNode("div", { class: "lk-form__attach-title" }, "附件", -1)), createBaseVNode("div", _hoisted_35, [(openBlock(true), createElementBlock(Fragment, null, renderList(realAttachments.value, (f) => {
							return openBlock(), createElementBlock(Fragment, { key: "real-" + f.id }, [attachmentPreviews[f.fileId] ? (openBlock(), createBlock(_component_el_image, {
								key: 0,
								src: attachmentPreviews[f.fileId],
								"preview-src-list": realPreviewList.value,
								fit: "cover",
								class: "lk-form__attach-img",
								"preview-teleported": ""
							}, null, 8, ["src", "preview-src-list"])) : (openBlock(), createElementBlock("div", {
								key: 1,
								class: "lk-form__attach-file lk-form__attach-file--clickable",
								onClick: ($event) => unref(downloadFileById)(f.fileId, f.fileName)
							}, [createVNode(_component_el_icon, { size: 22 }, {
								default: withCtx(() => [createVNode(unref(document_default))]),
								_: 1
							}), createBaseVNode("span", null, toDisplayString(f.fileName), 1)], 8, _hoisted_36))], 64);
						}), 128)), (openBlock(true), createElementBlock(Fragment, null, renderList(detailAttachments.value, (f, i) => {
							return openBlock(), createBlock(_component_el_image, {
								key: "legacy-" + i,
								src: f.url,
								"preview-src-list": detailAttachments.value.map((a) => a.url),
								"initial-index": i,
								fit: "cover",
								class: "lk-form__attach-img",
								"preview-teleported": ""
							}, {
								error: withCtx(() => [createBaseVNode("div", _hoisted_37, [createVNode(_component_el_icon, { size: 22 }, {
									default: withCtx(() => [createVNode(unref(document_default))]),
									_: 1
								}), createBaseVNode("span", null, toDisplayString(f.name), 1)])]),
								_: 2
							}, 1032, [
								"src",
								"preview-src-list",
								"initial-index"
							]);
						}), 128))])])) : createCommentVNode("", true),
						!detailDisplayEntries.value.length && !detailAttachments.value.length ? (openBlock(), createBlock(_component_el_empty, {
							key: 2,
							description: "无表单数据",
							"image-size": 70
						})) : createCommentVNode("", true)
					], 512), [[vShow, detailTab.value === "form"]]), withDirectives(createBaseVNode("div", _hoisted_38, [createVNode(ApprovalTrack_default, {
						histories: detailInstance.value.histories || [],
						"current-node-name": detailInstance.value.currentNodeName,
						"process-config": detailInstance.value.processConfig,
						"current-assignee-name": detailInstance.value.currentAssigneeName,
						"current-assignee-names": detailInstance.value.currentAssigneeNames || [],
						"initiator-name": detailInstance.value.initiatorName,
						"cc-names": detailInstance.value.ccNames || [],
						"current-task-id": detailInstance.value.currentTaskId,
						"can-urge": activeTab.value === "started" && detailInstance.value.status === 0
					}, null, 8, [
						"histories",
						"current-node-name",
						"process-config",
						"current-assignee-name",
						"current-assignee-names",
						"initiator-name",
						"cc-names",
						"current-task-id",
						"can-urge"
					])], 512), [[vShow, detailTab.value === "track"]])]),
					activeTab.value === "todo" && selectedTaskId.value ? (openBlock(), createElementBlock("footer", _hoisted_39, [
						createVNode(_component_el_button, {
							type: "primary",
							icon: unref(select_default),
							loading: acting.value,
							onClick: doApprove
						}, {
							default: withCtx(() => [..._cache[22] || (_cache[22] = [createTextVNode("同意", -1)])]),
							_: 1
						}, 8, ["icon", "loading"]),
						createVNode(_component_el_button, {
							type: "danger",
							icon: unref(close_bold_default),
							loading: acting.value,
							onClick: doReject
						}, {
							default: withCtx(() => [..._cache[23] || (_cache[23] = [createTextVNode("拒绝", -1)])]),
							_: 1
						}, 8, ["icon", "loading"]),
						createVNode(_component_el_button, {
							type: "warning",
							plain: "",
							icon: unref(refresh_left_default),
							loading: acting.value,
							onClick: doReturn
						}, {
							default: withCtx(() => [..._cache[24] || (_cache[24] = [createTextVNode("退回修改", -1)])]),
							_: 1
						}, 8, ["icon", "loading"]),
						createVNode(_component_el_button, {
							icon: unref(promotion_default),
							onClick: openCc
						}, {
							default: withCtx(() => [..._cache[25] || (_cache[25] = [createTextVNode("抄送", -1)])]),
							_: 1
						}, 8, ["icon"]),
						createVNode(_component_el_button, {
							icon: unref(switch_default),
							onClick: openTransfer
						}, {
							default: withCtx(() => [..._cache[26] || (_cache[26] = [createTextVNode("转交", -1)])]),
							_: 1
						}, 8, ["icon"])
					])) : activeTab.value === "started" && selectedRow.value ? (openBlock(), createElementBlock("footer", _hoisted_40, [
						detailInstance.value.status === 4 ? (openBlock(), createBlock(_component_el_button, {
							key: 0,
							type: "primary",
							icon: unref(edit_pen_default),
							onClick: goResubmit
						}, {
							default: withCtx(() => [..._cache[27] || (_cache[27] = [createTextVNode("修改并重新提交", -1)])]),
							_: 1
						}, 8, ["icon"])) : createCommentVNode("", true),
						detailInstance.value.status === 0 || detailInstance.value.status === 4 ? (openBlock(), createBlock(_component_el_button, {
							key: 1,
							type: "warning",
							loading: acting.value,
							onClick: cancelStarted
						}, {
							default: withCtx(() => [..._cache[28] || (_cache[28] = [createTextVNode("撤销申请", -1)])]),
							_: 1
						}, 8, ["loading"])) : createCommentVNode("", true),
						detailInstance.value.status !== 0 && detailInstance.value.status !== 4 ? (openBlock(), createBlock(_component_el_button, {
							key: 2,
							type: "danger",
							loading: acting.value,
							onClick: deleteStarted
						}, {
							default: withCtx(() => [..._cache[29] || (_cache[29] = [createTextVNode("删除记录", -1)])]),
							_: 1
						}, 8, ["loading"])) : createCommentVNode("", true)
					])) : createCommentVNode("", true)
				], 64)) : (openBlock(), createElementBlock("div", _hoisted_41, [createVNode(_component_el_empty, {
					description: "选择左侧审批查看详情",
					"image-size": 120
				})]))], 512), [[vShow, activeTab.value !== "initiate"]]),
				createVNode(_component_el_dialog, {
					modelValue: ccDlg.visible,
					"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => ccDlg.visible = $event),
					title: "抄送给同事",
					width: "420px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[8] || (_cache[8] = ($event) => ccDlg.visible = false) }, {
						default: withCtx(() => [..._cache[30] || (_cache[30] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: ccDlg.saving,
						onClick: submitCc
					}, {
						default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("确认抄送", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_select, {
						modelValue: ccDlg.userIds,
						"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => ccDlg.userIds = $event),
						multiple: "",
						filterable: "",
						placeholder: "选择要抄送的同事(可多选)",
						style: { "width": "100%" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
							return openBlock(), createBlock(_component_el_option, {
								key: c.userId,
								label: c.name + (c.deptName ? " · " + c.deptName : ""),
								value: c.userId
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]), _cache[32] || (_cache[32] = createBaseVNode("div", { style: {
						"margin-top": "10px",
						"font-size": "12px",
						"color": "var(--el-text-color-secondary)"
					} }, "抄送后,对方在「抄送我」里可以看到这条审批。", -1))]),
					_: 1
				}, 8, ["modelValue"]),
				createVNode(_component_el_dialog, {
					modelValue: transferDlg.visible,
					"onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => transferDlg.visible = $event),
					title: "转交审批",
					width: "420px",
					"append-to-body": ""
				}, {
					footer: withCtx(() => [createVNode(_component_el_button, { onClick: _cache[12] || (_cache[12] = ($event) => transferDlg.visible = false) }, {
						default: withCtx(() => [..._cache[33] || (_cache[33] = [createTextVNode("取消", -1)])]),
						_: 1
					}), createVNode(_component_el_button, {
						type: "primary",
						loading: transferDlg.saving,
						onClick: submitTransfer
					}, {
						default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("确认转交", -1)])]),
						_: 1
					}, 8, ["loading"])]),
					default: withCtx(() => [createVNode(_component_el_select, {
						modelValue: transferDlg.userId,
						"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => transferDlg.userId = $event),
						filterable: "",
						placeholder: "选择转交给谁",
						style: { "width": "100%" }
					}, {
						default: withCtx(() => [(openBlock(true), createElementBlock(Fragment, null, renderList(colleagues.value, (c) => {
							return openBlock(), createBlock(_component_el_option, {
								key: c.userId,
								label: c.name + (c.deptName ? " · " + c.deptName : ""),
								value: c.userId
							}, null, 8, ["label", "value"]);
						}), 128))]),
						_: 1
					}, 8, ["modelValue"]), createVNode(_component_el_input, {
						modelValue: transferDlg.comment,
						"onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => transferDlg.comment = $event),
						type: "textarea",
						rows: 2,
						placeholder: "转交说明(可选)",
						style: { "margin-top": "10px" }
					}, null, 8, ["modelValue"])]),
					_: 1
				}, 8, ["modelValue"])
			], 2);
		};
	}
}), [["__scopeId", "data-v-daaf4090"]]);
//#endregion
export { approval_center_default as default };

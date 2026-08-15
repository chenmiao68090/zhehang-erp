import { r as __toESM } from "./rolldown-runtime-Ce7cXt08.js";
import { $ as createCommentVNode, Dt as renderList, G as Fragment, Ht as withDirectives, Jt as reactive, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, g as _objectSpread2, it as createTextVNode, jt as resolveDynamicComponent, kn as normalizeClass, st as defineComponent, zt as watch } from "./vendor-Cuzsyfny.js";
import { An as phone_default, Bn as refresh_default, C as ElResult, Dn as office_building_default, F as ElEmpty, Jt as data_analysis_default, Kn as service_default, Ln as promotion_default, On as opportunity_default, Ot as calendar_default, Qt as document_default, St as arrow_down_default, Tt as arrow_up_default, Vt as close_default, W as ElDatePicker, Wt as copy_document_default, _ as ElTableColumn, _r as wallet_default, _t as ElFormItem, a as ElMessageBox, fr as user_default, g as ElTable, gn as magic_stick_default, gt as ElForm, h as ElTabs, ht as ElTooltip, ir as switch_default, it as ElTag, lr as trend_charts_default, m as ElTabPane, mt as ElInput, nt as ElOption, o as ElMessage, ot as ElButton, pr as user_filled_default, rt as ElSelect, s as vLoading, tn as edit_pen_default, un as headset_default, vt as ElAlert, yt as ElIcon, z as ElDrawer, zt as clock_default } from "./vendor-element-plus-CqO9XRGg.js";
import { l as require_dayjs_min } from "./vendor-dayjs-QmXXJDJb.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { r as post } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { r as callRecordingStreamUrl, t as callRecordApi } from "./call-record-vMQDzD4r.js";
import { n as customerApi, r as leadApi } from "./crm-DKTvHmZR.js";
//#region src/api/sales-ai.ts
var import_dayjs_min = /* @__PURE__ */ __toESM(require_dayjs_min(), 1);
function generateSalesFollowDraft(data) {
	return post("/crm/sales-ai/follow-draft", data, { silentError: true });
}
function generateSalesManagementInsight(query) {
	return post("/crm/sales-ai/management-insight", { query }, { silentError: true });
}
function submitSalesAiFeedback(data) {
	return post("/crm/sales-ai/feedback", data, { silentError: true });
}
//#endregion
//#region src/components/sales/SalesAiDraftPanel.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1$1 = { class: "ai-title" };
var _hoisted_2$1 = { class: "ai-meta" };
var _hoisted_3$1 = { class: "ai-summary" };
var _hoisted_4$1 = { class: "ai-facts" };
var _hoisted_5$1 = { key: 0 };
var _hoisted_6$1 = {
	key: 0,
	class: "ai-lists"
};
var _hoisted_7$1 = { key: 0 };
var _hoisted_8$1 = { key: 1 };
var _hoisted_9$1 = { key: 2 };
var _hoisted_10$1 = { class: "ai-next" };
var _hoisted_11$1 = {
	key: 0,
	class: "materials"
};
var _hoisted_12$1 = { key: 1 };
var _hoisted_13$1 = { class: "feedback" };
var _hoisted_14$1 = { key: 1 };
//#endregion
//#region src/components/sales/SalesAiDraftPanel.vue
var SalesAiDraftPanel_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "SalesAiDraftPanel",
	props: {
		leadId: {},
		callRecordId: {},
		platformCallId: {},
		connected: {},
		result: {},
		userNote: {},
		localDemo: { type: Boolean },
		demoDraft: {}
	},
	emits: ["apply"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const loading = ref(false);
		const errorMessage = ref("");
		const draft = ref(props.demoDraft || null);
		const feedbackSent = ref(false);
		watch(() => props.leadId, () => {
			draft.value = props.demoDraft || null;
			errorMessage.value = "";
			feedbackSent.value = false;
		});
		watch(() => props.demoDraft, (value) => {
			if (props.localDemo) draft.value = value || null;
		}, { deep: true });
		const transcriptionLabel = computed(() => {
			var _draft$value;
			const status = (_draft$value = draft.value) === null || _draft$value === void 0 ? void 0 : _draft$value.transcriptionStatus;
			if (status === "ready") return "录音已转写";
			if (status === "missing") return "平台暂未生成录音";
			if (status === "failed") return "录音转写失败，已用其他事实";
			if (status === "unavailable") return "未配置录音转写";
			return "未关联录音";
		});
		const nextActionText = computed(() => {
			var _draft$value2;
			if (!((_draft$value2 = draft.value) === null || _draft$value2 === void 0 ? void 0 : _draft$value2.nextActionType)) {
				var _draft$value3, _draft$value4;
				if (((_draft$value3 = draft.value) === null || _draft$value3 === void 0 ? void 0 : _draft$value3.intentLevel) === "D") return "建议转长期培育或历史客资";
				if (((_draft$value4 = draft.value) === null || _draft$value4 === void 0 ? void 0 : _draft$value4.intentLevel) === "E") return "建议暂停拨打并进入历史客资";
				return "事实不足，暂未生成下一步建议";
			}
			return [
				draft.value.nextActionType,
				dateTime(draft.value.nextActionTime),
				draft.value.nextActionContent
			].filter(Boolean).join(" · ");
		});
		function generate() {
			return _generate.apply(this, arguments);
		}
		function _generate() {
			_generate = _asyncToGenerator(function* () {
				const leadId = Number(props.leadId || 0);
				if (!leadId) return;
				if (props.localDemo && props.demoDraft) {
					draft.value = props.demoDraft;
					errorMessage.value = "";
					feedbackSent.value = false;
					return;
				}
				loading.value = true;
				errorMessage.value = "";
				feedbackSent.value = false;
				try {
					var _response$data, _draft$value5, _draft$value6;
					const response = yield generateSalesFollowDraft({
						leadId,
						callRecordId: Number(props.callRecordId || 0) || void 0,
						platformCallId: props.platformCallId || void 0,
						connected: Number(props.connected) === 1 ? 1 : 0,
						result: props.result || void 0,
						userNote: props.userNote || void 0
					});
					draft.value = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
					if (!((_draft$value5 = draft.value) === null || _draft$value5 === void 0 ? void 0 : _draft$value5.available)) errorMessage.value = ((_draft$value6 = draft.value) === null || _draft$value6 === void 0 ? void 0 : _draft$value6.message) || "AI服务暂时不可用，可继续手工填写";
				} catch (error) {
					errorMessage.value = (error === null || error === void 0 ? void 0 : error.message) || "AI服务暂时不可用，可继续手工填写";
				} finally {
					loading.value = false;
				}
			});
			return _generate.apply(this, arguments);
		}
		function applyDraft() {
			return _applyDraft.apply(this, arguments);
		}
		function _applyDraft() {
			_applyDraft = _asyncToGenerator(function* () {
				if (!draft.value) return;
				emit("apply", draft.value);
				ElMessage.success("已填入当前草稿，请核对后再保存");
				yield sendFeedback({
					useful: true,
					adopted: true
				});
			});
			return _applyDraft.apply(this, arguments);
		}
		function feedback(_x) {
			return _feedback.apply(this, arguments);
		}
		function _feedback() {
			_feedback = _asyncToGenerator(function* (useful) {
				yield sendFeedback({
					useful,
					adopted: false,
					reasonCode: useful ? "" : "NOT_RELEVANT"
				});
				ElMessage.success("已记录反馈");
			});
			return _feedback.apply(this, arguments);
		}
		function sendFeedback(_x2) {
			return _sendFeedback.apply(this, arguments);
		}
		function _sendFeedback() {
			_sendFeedback = _asyncToGenerator(function* (payload) {
				var _draft$value7;
				if (!((_draft$value7 = draft.value) === null || _draft$value7 === void 0 ? void 0 : _draft$value7.draftId) || feedbackSent.value) return;
				if (props.localDemo) {
					feedbackSent.value = true;
					return;
				}
				try {
					yield submitSalesAiFeedback(_objectSpread2({ draftId: draft.value.draftId }, payload));
					feedbackSent.value = true;
				} catch (_unused) {}
			});
			return _sendFeedback.apply(this, arguments);
		}
		function dateTime(value) {
			return value && (0, import_dayjs_min.default)(value).isValid() ? (0, import_dayjs_min.default)(value).format("MM-DD HH:mm") : "";
		}
		return (_ctx, _cache) => {
			var _draft$value8, _draft$value9, _draft$value$objectio, _draft$value$commitme, _draft$value$riskSign, _draft$value$objectio2, _draft$value$commitme2, _draft$value$riskSign2, _draft$value$recommen, _draft$value$citation;
			const _component_el_icon = ElIcon;
			const _component_el_tag = ElTag;
			const _component_el_button = ElButton;
			const _component_el_alert = ElAlert;
			const _component_el_tooltip = ElTooltip;
			return openBlock(), createElementBlock("section", { class: normalizeClass(["ai-draft-panel", { "is-ready": (_draft$value8 = draft.value) === null || _draft$value8 === void 0 ? void 0 : _draft$value8.available }]) }, [
				createBaseVNode("header", null, [createBaseVNode("div", null, [createBaseVNode("div", _hoisted_1$1, [
					createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(magic_stick_default))]),
						_: 1
					}),
					_cache[4] || (_cache[4] = createBaseVNode("strong", null, "AI 销售教练", -1)),
					createVNode(_component_el_tag, {
						size: "small",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[2] || (_cache[2] = [createTextVNode("草稿", -1)])]),
						_: 1
					}),
					__props.localDemo ? (openBlock(), createBlock(_component_el_tag, {
						key: 0,
						size: "small",
						type: "warning",
						effect: "plain"
					}, {
						default: withCtx(() => [..._cache[3] || (_cache[3] = [createTextVNode("LOCAL-DEMO", -1)])]),
						_: 1
					})) : createCommentVNode("", true)
				]), _cache[5] || (_cache[5] = createBaseVNode("p", null, "依据当前客户、历史跟进和有权录音生成，不会自动保存正式记录。", -1))]), createVNode(_component_el_button, {
					type: "primary",
					plain: "",
					loading: loading.value,
					disabled: !__props.leadId,
					onClick: generate
				}, {
					default: withCtx(() => [createTextVNode(toDisplayString(draft.value ? "重新生成" : "生成建议"), 1)]),
					_: 1
				}, 8, ["loading", "disabled"])]),
				errorMessage.value ? (openBlock(), createBlock(_component_el_alert, {
					key: 0,
					type: "warning",
					closable: false,
					"show-icon": "",
					title: errorMessage.value
				}, null, 8, ["title"])) : createCommentVNode("", true),
				((_draft$value9 = draft.value) === null || _draft$value9 === void 0 ? void 0 : _draft$value9.available) ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createBaseVNode("div", _hoisted_2$1, [
						createBaseVNode("span", null, [_cache[6] || (_cache[6] = createTextVNode("置信度 ", -1)), createBaseVNode("b", null, toDisplayString(draft.value.confidence) + "%", 1)]),
						createBaseVNode("span", null, "数据截至 " + toDisplayString(dateTime(draft.value.dataTime || draft.value.generatedAt)), 1),
						createBaseVNode("span", null, toDisplayString(transcriptionLabel.value), 1)
					]),
					createBaseVNode("div", _hoisted_3$1, [_cache[7] || (_cache[7] = createBaseVNode("span", null, "建议小结", -1)), createBaseVNode("p", null, toDisplayString(draft.value.summary || "事实不足，未生成小结"), 1)]),
					createBaseVNode("div", _hoisted_4$1, [
						createBaseVNode("article", null, [_cache[8] || (_cache[8] = createBaseVNode("span", null, "需求", -1)), createBaseVNode("p", null, toDisplayString(draft.value.demand || "未识别"), 1)]),
						createBaseVNode("article", null, [_cache[9] || (_cache[9] = createBaseVNode("span", null, "预算", -1)), createBaseVNode("p", null, toDisplayString(draft.value.budget || "未识别"), 1)]),
						createBaseVNode("article", null, [_cache[10] || (_cache[10] = createBaseVNode("span", null, "决策人", -1)), createBaseVNode("p", null, toDisplayString(draft.value.decisionMaker || "未识别"), 1)]),
						createBaseVNode("article", null, [_cache[11] || (_cache[11] = createBaseVNode("span", null, "意向建议", -1)), createBaseVNode("p", null, [draft.value.intentLevel ? (openBlock(), createElementBlock("b", _hoisted_5$1, toDisplayString(draft.value.intentLevel) + " 类", 1)) : createCommentVNode("", true), createTextVNode(toDisplayString(draft.value.intentReason ? ` · ${draft.value.intentReason}` : "证据不足，暂不建议分级"), 1)])])
					]),
					((_draft$value$objectio = draft.value.objections) === null || _draft$value$objectio === void 0 ? void 0 : _draft$value$objectio.length) || ((_draft$value$commitme = draft.value.commitments) === null || _draft$value$commitme === void 0 ? void 0 : _draft$value$commitme.length) || ((_draft$value$riskSign = draft.value.riskSignals) === null || _draft$value$riskSign === void 0 ? void 0 : _draft$value$riskSign.length) ? (openBlock(), createElementBlock("div", _hoisted_6$1, [
						((_draft$value$objectio2 = draft.value.objections) === null || _draft$value$objectio2 === void 0 ? void 0 : _draft$value$objectio2.length) ? (openBlock(), createElementBlock("div", _hoisted_7$1, [_cache[12] || (_cache[12] = createBaseVNode("span", null, "客户异议", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.objections, (item) => {
							return openBlock(), createBlock(_component_el_tag, {
								key: item,
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(item), 1)]),
								_: 2
							}, 1024);
						}), 128))])) : createCommentVNode("", true),
						((_draft$value$commitme2 = draft.value.commitments) === null || _draft$value$commitme2 === void 0 ? void 0 : _draft$value$commitme2.length) ? (openBlock(), createElementBlock("div", _hoisted_8$1, [_cache[13] || (_cache[13] = createBaseVNode("span", null, "客户承诺", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.commitments, (item) => {
							return openBlock(), createBlock(_component_el_tag, {
								key: item,
								type: "success",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(item), 1)]),
								_: 2
							}, 1024);
						}), 128))])) : createCommentVNode("", true),
						((_draft$value$riskSign2 = draft.value.riskSignals) === null || _draft$value$riskSign2 === void 0 ? void 0 : _draft$value$riskSign2.length) ? (openBlock(), createElementBlock("div", _hoisted_9$1, [_cache[14] || (_cache[14] = createBaseVNode("span", null, "风险提醒", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.riskSignals, (item) => {
							return openBlock(), createBlock(_component_el_tag, {
								key: item,
								type: "warning",
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(item), 1)]),
								_: 2
							}, 1024);
						}), 128))])) : createCommentVNode("", true)
					])) : createCommentVNode("", true),
					createBaseVNode("div", _hoisted_10$1, [
						_cache[16] || (_cache[16] = createBaseVNode("span", null, "下一最佳动作", -1)),
						createBaseVNode("p", null, toDisplayString(nextActionText.value), 1),
						((_draft$value$recommen = draft.value.recommendedMaterials) === null || _draft$value$recommen === void 0 ? void 0 : _draft$value$recommen.length) ? (openBlock(), createElementBlock("div", _hoisted_11$1, [_cache[15] || (_cache[15] = createBaseVNode("span", null, "推荐资料", -1)), (openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.recommendedMaterials, (item) => {
							return openBlock(), createBlock(_component_el_tag, {
								key: item,
								effect: "plain"
							}, {
								default: withCtx(() => [createTextVNode(toDisplayString(item), 1)]),
								_: 2
							}, 1024);
						}), 128))])) : createCommentVNode("", true),
						draft.value.callbackScript ? (openBlock(), createElementBlock("small", _hoisted_12$1, "建议话术：" + toDisplayString(draft.value.callbackScript), 1)) : createCommentVNode("", true)
					]),
					createBaseVNode("footer", null, [createVNode(_component_el_tooltip, {
						content: "只填入当前表单，仍需人工核对并点击原保存按钮",
						placement: "top"
					}, {
						default: withCtx(() => [createVNode(_component_el_button, {
							type: "primary",
							onClick: applyDraft
						}, {
							default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("采用到草稿", -1)])]),
							_: 1
						})]),
						_: 1
					}), createBaseVNode("div", _hoisted_13$1, [
						_cache[20] || (_cache[20] = createBaseVNode("span", null, "这条建议有用吗？", -1)),
						createVNode(_component_el_button, {
							text: "",
							disabled: feedbackSent.value,
							onClick: _cache[0] || (_cache[0] = ($event) => feedback(true))
						}, {
							default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("有用", -1)])]),
							_: 1
						}, 8, ["disabled"]),
						createVNode(_component_el_button, {
							text: "",
							disabled: feedbackSent.value,
							onClick: _cache[1] || (_cache[1] = ($event) => feedback(false))
						}, {
							default: withCtx(() => [..._cache[19] || (_cache[19] = [createTextVNode("没用", -1)])]),
							_: 1
						}, 8, ["disabled"])
					])]),
					((_draft$value$citation = draft.value.citations) === null || _draft$value$citation === void 0 ? void 0 : _draft$value$citation.length) ? (openBlock(), createElementBlock("details", _hoisted_14$1, [createBaseVNode("summary", null, "查看 " + toDisplayString(draft.value.citations.length) + " 条事实来源", 1), createBaseVNode("ul", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(draft.value.citations, (item) => {
						return openBlock(), createElementBlock("li", { key: `${item.type}-${item.id || item.label}` }, toDisplayString(item.label) + " · " + toDisplayString(dateTime(item.occurredAt)), 1);
					}), 128))])])) : createCommentVNode("", true)
				], 64)) : createCommentVNode("", true)
			], 2);
		};
	}
}), [["__scopeId", "data-v-ac6e82aa"]]);
//#endregion
//#region src/components/sales/Customer360Drawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "drawer-title" };
var _hoisted_2 = { class: "drawer-title-mark" };
var _hoisted_3 = { class: "customer360-shell" };
var _hoisted_4 = { class: "customer-hero" };
var _hoisted_5 = { class: "customer-avatar" };
var _hoisted_6 = { class: "customer-identity" };
var _hoisted_7 = { class: "customer-name-line" };
var _hoisted_8 = ["title"];
var _hoisted_9 = { class: "customer-contact-line" };
var _hoisted_10 = { class: "phone-value" };
var _hoisted_11 = { class: "customer-meta-line" };
var _hoisted_12 = { class: "hero-actions" };
var _hoisted_13 = {
	key: 1,
	class: "metric-band",
	"aria-label": "客户经营概览"
};
var _hoisted_14 = { class: "is-positive" };
var _hoisted_15 = { class: "next-action-icon" };
var _hoisted_16 = { key: 0 };
var _hoisted_17 = {
	key: 3,
	class: "inline-follow"
};
var _hoisted_18 = { class: "section-heading" };
var _hoisted_19 = { class: "follow-grid" };
var _hoisted_20 = {
	key: 1,
	class: "follow-grid follow-grid-bottom"
};
var _hoisted_21 = { class: "follow-submit-row" };
var _hoisted_22 = { class: "tab-label" };
var _hoisted_23 = {
	key: 0,
	class: "rail-list"
};
var _hoisted_24 = { class: "rail-date" };
var _hoisted_25 = {
	key: 0,
	class: "rail-node"
};
var _hoisted_26 = { class: "fold-block" };
var _hoisted_27 = ["onClick"];
var _hoisted_28 = { class: "fold-toggle" };
var _hoisted_29 = {
	key: 0,
	class: "fold-items"
};
var _hoisted_30 = { class: "call-line" };
var _hoisted_31 = {
	key: 0,
	class: "dur-pill"
};
var _hoisted_32 = { class: "call-meta" };
var _hoisted_33 = { key: 0 };
var _hoisted_34 = {
	key: 1,
	class: "rail-node"
};
var _hoisted_35 = { class: "call-line" };
var _hoisted_36 = {
	key: 0,
	class: "dur-pill"
};
var _hoisted_37 = {
	key: 0,
	class: "timeline-content"
};
var _hoisted_38 = { class: "call-meta" };
var _hoisted_39 = { key: 0 };
var _hoisted_40 = ["src"];
var _hoisted_41 = {
	key: 2,
	class: "rail-node"
};
var _hoisted_42 = { class: "event-block" };
var _hoisted_43 = { class: "call-line" };
var _hoisted_44 = { key: 1 };
var _hoisted_45 = {
	key: 0,
	class: "timeline-content"
};
var _hoisted_46 = { class: "call-meta" };
var _hoisted_47 = { key: 0 };
var _hoisted_48 = { class: "tab-label" };
var _hoisted_49 = { class: "tab-label" };
var _hoisted_50 = { key: 0 };
var _hoisted_51 = { class: "tab-label" };
var _hoisted_52 = { class: "tab-label" };
var _hoisted_53 = { class: "profile-card" };
var _hoisted_54 = { class: "profile-card-head" };
var _hoisted_55 = { class: "profile-grid" };
var _hoisted_56 = ["title"];
var _hoisted_57 = { class: "profile-card" };
var _hoisted_58 = { class: "profile-card-head" };
var _hoisted_59 = { class: "profile-grid" };
var _hoisted_60 = ["title"];
var _hoisted_61 = ["title"];
var _hoisted_62 = ["title"];
var _hoisted_63 = ["title"];
var _hoisted_64 = { class: "profile-grid profile-grid-full" };
var _hoisted_65 = { class: "wrap-text" };
var _hoisted_66 = { class: "wrap-text" };
var _hoisted_67 = { class: "wrap-text" };
var _hoisted_68 = { class: "profile-card" };
var _hoisted_69 = { class: "profile-card-head" };
var _hoisted_70 = { class: "profile-card-count" };
//#endregion
//#region src/components/sales/Customer360Drawer.vue
var Customer360Drawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "Customer360Drawer",
	props: {
		modelValue: { type: Boolean },
		leadId: {},
		customerId: {},
		showDial: { type: Boolean }
	},
	emits: [
		"update:modelValue",
		"changed",
		"dial"
	],
	setup(__props, { emit: __emit }) {
		const router = useRouter();
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		const loading = ref(false);
		const errorMessage = ref("");
		const data = ref(null);
		const activeTab = ref("timeline");
		const followExpanded = ref(false);
		const savingFollow = ref(false);
		let requestSerial = 0;
		const emptyStats = {
			followCount: 0,
			callCount: 0,
			opportunityCount: 0,
			orderCount: 0,
			openIssueCount: 0,
			opportunityAmount: 0,
			orderAmount: 0,
			receivedAmount: 0,
			arrearsAmount: 0
		};
		const overview = computed(() => {
			var _data$value;
			return ((_data$value = data.value) === null || _data$value === void 0 ? void 0 : _data$value.overview) || {
				leadId: Number(props.leadId || 0),
				customerId: Number(props.customerId || 0) || void 0,
				companyName: "",
				converted: false,
				customerDataRestricted: false
			};
		});
		const stats = computed(() => {
			var _data$value2;
			return ((_data$value2 = data.value) === null || _data$value2 === void 0 ? void 0 : _data$value2.stats) || emptyStats;
		});
		const isFormalCustomer = computed(() => overview.value.converted && !!overview.value.customerId);
		const canFollow = computed(() => overview.value.ownership !== "pool" && !overview.value.customerDataRestricted && overview.value.customerStatus !== 1 && (isFormalCustomer.value || overview.value.lifecycleStatus !== 3 && overview.value.lifecycleStatus !== 4));
		const canConvert = computed(() => canFollow.value && !isFormalCustomer.value);
		const canHandover = computed(() => overview.value.converted && !!overview.value.customerId && overview.value.customerStatus !== 1 && !overview.value.customerDataRestricted);
		const canDial = computed(() => !!overview.value.phone && !(overview.value.ownership === "pool" && overview.value.customerDataRestricted));
		const ownerDisplay = computed(() => overview.value.ownership === "pool" ? "公海待领取" : overview.value.ownerName || "未分配");
		const restrictedDescription = computed(() => overview.value.ownership === "pool" ? "公海线索需先按规则领取；领取前不会返回历史负责人、跟进、报价、成交和正式客户资料。" : "关联的正式客户、交易或服务记录不在你的数据范围内，请联系主管核对客户归属。");
		const followStatusOptions = [
			"线索接收",
			"需求沟通",
			"需求答疑",
			"签单收款"
		];
		const customerLevelOptions = [
			{
				value: "A",
				label: "A 高意向（1-2天跟进）"
			},
			{
				value: "B",
				label: "B 意向"
			},
			{
				value: "C",
				label: "C 潜在意向"
			},
			{
				value: "D",
				label: "D 无意向（转历史）"
			},
			{
				value: "E",
				label: "E 无效客户（转历史）"
			}
		];
		const nextActionOptions = [
			"电话",
			"微信",
			"发方案",
			"报价",
			"签约",
			"收款",
			"其他"
		];
		const followForm = reactive({
			type: 1,
			followStatus: "需求沟通",
			customerLevel: "",
			content: "",
			nextActionType: "电话",
			nextTime: "",
			nextContent: ""
		});
		const leadMovesToHistory = computed(() => !isFormalCustomer.value && ["D", "E"].includes(followForm.customerLevel));
		function normalizeIntentLevel(value) {
			const level = String(value || "").trim().toUpperCase();
			return [
				"A",
				"B",
				"C",
				"D",
				"E"
			].includes(level) ? level : "";
		}
		function applyAiFollowDraft(draft) {
			var _draft$summary;
			if ((_draft$summary = draft.summary) === null || _draft$summary === void 0 ? void 0 : _draft$summary.trim()) followForm.content = draft.summary.trim();
			if (draft.intentLevel && [
				"A",
				"B",
				"C",
				"D",
				"E"
			].includes(draft.intentLevel)) followForm.customerLevel = draft.intentLevel;
			if (!["D", "E"].includes(followForm.customerLevel)) {
				var _draft$nextActionCont;
				if (draft.nextActionType && nextActionOptions.includes(draft.nextActionType)) followForm.nextActionType = draft.nextActionType;
				if (draft.nextActionTime) followForm.nextTime = normalizeDateTime(draft.nextActionTime);
				if ((_draft$nextActionCont = draft.nextActionContent) === null || _draft$nextActionCont === void 0 ? void 0 : _draft$nextActionCont.trim()) followForm.nextContent = draft.nextActionContent.trim();
			}
		}
		const nextActionTitle = computed(() => {
			if (!overview.value.nextActionTime) return "尚未安排下一步";
			return overview.value.nextActionType || "客户跟进";
		});
		const nextActionClass = computed(() => {
			if (!overview.value.nextActionTime) return "is-missing";
			const due = new Date(String(overview.value.nextActionTime).replace(" ", "T")).getTime();
			if (!Number.isNaN(due) && due < Date.now()) return "is-overdue";
			return "is-scheduled";
		});
		watch(() => [
			props.modelValue,
			props.leadId,
			props.customerId
		], ([open, leadId, customerId]) => {
			if (open && (leadId || customerId)) {
				followExpanded.value = false;
				activeTab.value = "timeline";
				loadData();
			}
			if (!open) followExpanded.value = false;
		}, { immediate: true });
		function loadData() {
			return _loadData.apply(this, arguments);
		}
		function _loadData() {
			_loadData = _asyncToGenerator(function* () {
				var _data$value3, _data$value4;
				const leadId = Number(props.leadId || 0);
				const customerId = Number(props.customerId || 0);
				if (!leadId && !customerId) {
					data.value = null;
					errorMessage.value = "缺少客户编号";
					return;
				}
				const serial = ++requestSerial;
				if (customerId ? ((_data$value3 = data.value) === null || _data$value3 === void 0 || (_data$value3 = _data$value3.overview) === null || _data$value3 === void 0 ? void 0 : _data$value3.customerId) !== customerId : ((_data$value4 = data.value) === null || _data$value4 === void 0 || (_data$value4 = _data$value4.overview) === null || _data$value4 === void 0 ? void 0 : _data$value4.leadId) !== leadId) data.value = null;
				loading.value = true;
				errorMessage.value = "";
				try {
					var _response$data;
					const response = customerId ? yield customerApi.customer360(customerId) : yield leadApi.customer360(leadId);
					if (serial !== requestSerial) return;
					const payload = (_response$data = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data !== void 0 ? _response$data : response;
					if (!(payload === null || payload === void 0 ? void 0 : payload.overview)) throw new Error("客户数据为空");
					data.value = _objectSpread2(_objectSpread2({}, payload), {}, {
						stats: payload.stats || _objectSpread2({}, emptyStats),
						contacts: Array.isArray(payload.contacts) ? payload.contacts : [],
						opportunities: Array.isArray(payload.opportunities) ? payload.opportunities : [],
						transactions: Array.isArray(payload.transactions) ? payload.transactions : [],
						services: Array.isArray(payload.services) ? payload.services : [],
						timeline: Array.isArray(payload.timeline) ? payload.timeline : []
					});
					if (payload.overview.converted || payload.overview.customerDataRestricted) followExpanded.value = false;
				} catch (error) {
					if (serial !== requestSerial) return;
					data.value = null;
					errorMessage.value = (error === null || error === void 0 ? void 0 : error.message) || "请稍后重试";
				} finally {
					if (serial === requestSerial) loading.value = false;
				}
			});
			return _loadData.apply(this, arguments);
		}
		function startFollow() {
			if (!canFollow.value) return;
			followForm.type = 1;
			followForm.followStatus = overview.value.followStatus || "需求沟通";
			followForm.customerLevel = normalizeIntentLevel(overview.value.customerLevel);
			followForm.content = "";
			followForm.nextActionType = overview.value.nextActionType || "电话";
			followForm.nextTime = overview.value.nextActionTime && parseDateTime(overview.value.nextActionTime) > Date.now() ? normalizeDateTime(overview.value.nextActionTime) : tomorrowAtTen();
			followForm.nextContent = overview.value.nextActionContent || "";
			followExpanded.value = true;
		}
		function saveFollow() {
			return _saveFollow.apply(this, arguments);
		}
		function _saveFollow() {
			_saveFollow = _asyncToGenerator(function* () {
				const leadId = Number(overview.value.leadId || props.leadId || 0);
				const customerId = Number(overview.value.customerId || props.customerId || 0);
				if (!leadId && !customerId) return;
				if (!followForm.content.trim()) {
					ElMessage.warning("请填写本次沟通内容");
					return;
				}
				if (!leadMovesToHistory.value && (!followForm.nextTime || !isFormalCustomer.value && !followForm.nextActionType)) {
					ElMessage.warning("请安排下一步动作和具体时间");
					return;
				}
				if (isFormalCustomer.value && !followForm.nextContent.trim()) {
					ElMessage.warning("请写清下一步具体计划");
					return;
				}
				savingFollow.value = true;
				try {
					if (isFormalCustomer.value && customerId) yield customerApi.follow(customerId, {
						type: followForm.type,
						content: followForm.content.trim(),
						nextTime: followForm.nextTime,
						nextContent: followForm.nextContent.trim(),
						customerLevel: followForm.customerLevel || void 0
					}, { silentError: true });
					else yield leadApi.follow(leadId, {
						type: followForm.type,
						content: followForm.content.trim(),
						nextTime: leadMovesToHistory.value ? void 0 : followForm.nextTime,
						nextContent: leadMovesToHistory.value ? void 0 : followForm.nextContent.trim() || void 0,
						followStatus: followForm.followStatus,
						customerLevel: followForm.customerLevel || void 0,
						nextActionType: leadMovesToHistory.value ? void 0 : followForm.nextActionType
					}, { silentError: true });
					ElMessage.success(leadMovesToHistory.value ? "跟进已保存，客户已进入历史客资" : "跟进已保存，下一步已安排");
					followExpanded.value = false;
					yield loadData();
					emit("changed", {
						leadId,
						customerId: customerId || void 0,
						action: "follow"
					});
				} catch (error) {
					ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "跟进保存失败");
				} finally {
					savingFollow.value = false;
				}
			});
			return _saveFollow.apply(this, arguments);
		}
		function convertLead() {
			return _convertLead.apply(this, arguments);
		}
		function _convertLead() {
			_convertLead = _asyncToGenerator(function* () {
				const leadId = Number(props.leadId || 0);
				if (!leadId || !canConvert.value) return;
				try {
					yield ElMessageBox.confirm(`确认把「${overview.value.companyName || "该线索"}」转为正式客户？系统会建立客户档案和主联系人。`, "转为正式客户", {
						confirmButtonText: "确认转客户",
						cancelButtonText: "取消",
						type: "success"
					});
					yield leadApi.convert(leadId, { silentError: true });
					ElMessage.success("已转为正式客户");
					yield loadData();
					emit("changed", {
						leadId,
						action: "convert"
					});
				} catch (error) {
					if (error !== "cancel" && error !== "close") ElMessage.error((error === null || error === void 0 ? void 0 : error.message) || "转客户失败");
				}
			});
			return _convertLead.apply(this, arguments);
		}
		function startHandover() {
			if (!canHandover.value) return;
			visible.value = false;
			router.push({
				path: "/customer/handover",
				query: {
					customerId: String(overview.value.customerId),
					create: "1"
				}
			});
		}
		function beforeDrawerClose(done) {
			if (savingFollow.value) return;
			if (!followExpanded.value || !followForm.content.trim()) {
				done();
				return;
			}
			ElMessageBox.confirm("本次跟进还没有保存，确定关闭吗？", "跟进未保存", {
				confirmButtonText: "放弃填写",
				cancelButtonText: "继续填写",
				type: "warning"
			}).then(done).catch(() => {});
		}
		function dialCustomer() {
			const phone = firstPhone(overview.value.phone);
			if (!phone || !canDial.value) {
				ElMessage.warning(overview.value.ownership === "pool" ? "请先按规则领取公海线索" : "该客户暂无电话");
				return;
			}
			emit("dial", {
				leadId: Number(overview.value.leadId || props.leadId || 0),
				phone,
				companyName: overview.value.companyName || "未命名客户"
			});
		}
		function copyPhone() {
			return _copyPhone.apply(this, arguments);
		}
		function _copyPhone() {
			_copyPhone = _asyncToGenerator(function* () {
				const phone = overview.value.phone || "";
				if (!phone) return;
				try {
					yield navigator.clipboard.writeText(phone);
					ElMessage.success("电话号码已复制");
				} catch (_unused) {
					ElMessage.info(`电话号码：${phone}`);
				}
			});
			return _copyPhone.apply(this, arguments);
		}
		const foldOpen = ref({});
		function toggleFold(key) {
			foldOpen.value[key] = !foldOpen.value[key];
		}
		function timelineDateLabel(date) {
			if (!date) return "未知日期";
			const [y, m, d] = date.split("-");
			return y === String((/* @__PURE__ */ new Date()).getFullYear()) ? `${Number(m)}月${Number(d)}日` : `${y}年${Number(m)}月${Number(d)}日`;
		}
		const isFoldableMissedCall = (item) => item.type === "call" && item.status !== "已接通" && !item.recordingAvailable;
		const timelineGroups = computed(() => {
			var _data$value5;
			const groups = [];
			let current = null;
			for (const item of ((_data$value5 = data.value) === null || _data$value5 === void 0 ? void 0 : _data$value5.timeline) || []) {
				const date = (item.occurredAt || "").slice(0, 10);
				if (!current || current.date !== date) {
					current = {
						date,
						label: timelineDateLabel(date),
						nodes: []
					};
					groups.push(current);
				}
				const last = current.nodes[current.nodes.length - 1];
				if (isFoldableMissedCall(item)) {
					if (last && last.kind === "fold") {
						last.items.push(item);
						continue;
					}
					if (last && last.kind === "item" && isFoldableMissedCall(last.item)) {
						current.nodes.pop();
						current.nodes.push({
							kind: "fold",
							key: `${date}-${last.item.id}`,
							items: [last.item, item],
							actorLabel: ""
						});
						continue;
					}
				}
				current.nodes.push({
					kind: "item",
					item
				});
			}
			for (const group of groups) for (const node of group.nodes) if (node.kind === "fold") {
				const names = [...new Set(node.items.map((it) => it.actorName).filter(Boolean))];
				node.actorLabel = names.length === 0 ? "" : names.length === 1 ? names[0] : `${names[0]}等${names.length}人`;
			}
			return groups;
		});
		const playingRecordId = ref(null);
		const playingAudioSrc = ref("");
		function openRecord(_x) {
			return _openRecord.apply(this, arguments);
		}
		function _openRecord() {
			_openRecord = _asyncToGenerator(function* (recordId) {
				if (!recordId) return;
				if (playingRecordId.value === recordId) {
					playingRecordId.value = null;
					playingAudioSrc.value = "";
					return;
				}
				try {
					var _response$data2;
					const response = yield callRecordApi.recordingTicket(recordId);
					playingAudioSrc.value = callRecordingStreamUrl(recordId, ((_response$data2 = response === null || response === void 0 ? void 0 : response.data) !== null && _response$data2 !== void 0 ? _response$data2 : response).token);
					playingRecordId.value = recordId;
				} catch (_unused2) {
					ElMessage.warning("当前录音无权访问或暂时不可用");
				}
			});
			return _openRecord.apply(this, arguments);
		}
		function timelineIcon(type) {
			return {
				call: phone_default,
				follow: edit_pen_default,
				opportunity: opportunity_default,
				order: document_default,
				contract: document_default,
				receipt: wallet_default,
				receivable: wallet_default,
				issue: service_default,
				conversion: promotion_default,
				lead: data_analysis_default
			}[type] || clock_default;
		}
		function timelineTypeLabel(type) {
			return {
				lead: "线索",
				follow: "跟进",
				call: "通话",
				opportunity: "商机",
				order: "订单",
				contract: "合同",
				receipt: "收款",
				receivable: "应收",
				issue: "客户问题",
				conversion: "转客户"
			}[type];
		}
		function transactionTypeLabel(type) {
			return {
				order: "订单",
				contract: "合同",
				receipt: "收款",
				receivable: "应收"
			}[type] || "交易";
		}
		function transactionTagType(type) {
			if (type === "receipt") return "success";
			if (type === "receivable") return "warning";
			if (type === "contract") return "info";
			return "primary";
		}
		function priorityTagType(priority) {
			if (priority === "P0") return "danger";
			if (priority === "P1") return "warning";
			return "info";
		}
		function levelTagType(level) {
			if (level === "A") return "danger";
			if (level === "B") return "warning";
			if (level === "C") return "primary";
			return "info";
		}
		function lifecycleLabel(status) {
			return {
				1: "新建",
				2: "跟进中",
				3: "已转化",
				4: "无效"
			}[Number(status)] || "线索";
		}
		function dateTime(value) {
			return value ? String(value).replace("T", " ").slice(0, 16) : "-";
		}
		function normalizeDateTime(value) {
			return value ? `${String(value).replace("T", " ").slice(0, 16)}:00` : "";
		}
		function parseDateTime(value) {
			if (!value) return 0;
			const timestamp = new Date(String(value).replace(" ", "T")).getTime();
			return Number.isNaN(timestamp) ? 0 : timestamp;
		}
		function tomorrowAtTen() {
			const date = /* @__PURE__ */ new Date();
			date.setDate(date.getDate() + 1);
			date.setHours(10, 0, 0, 0);
			return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} 10:00:00`;
		}
		function firstPhone(value) {
			return String(value || "").split(/[,，、/\s]+/)[0];
		}
		function firstChar(value) {
			return String(value || "客").trim().charAt(0) || "客";
		}
		function hasAmount(value) {
			return value !== null && value !== void 0;
		}
		function money(value) {
			return `¥${Number(value || 0).toLocaleString("zh-CN", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			})}`;
		}
		function moneyOrDash(value) {
			return value === null || value === void 0 ? "-" : money(value);
		}
		function moneyCompact(value) {
			const amount = Number(value || 0);
			if (Math.abs(amount) >= 1e4) return `¥${(amount / 1e4).toFixed(amount % 1e4 === 0 ? 0 : 1)}万`;
			return `¥${amount.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
		}
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_result = ElResult;
			const _component_el_tag = ElTag;
			const _component_el_tooltip = ElTooltip;
			const _component_el_alert = ElAlert;
			const _component_el_option = ElOption;
			const _component_el_select = ElSelect;
			const _component_el_form_item = ElFormItem;
			const _component_el_input = ElInput;
			const _component_el_date_picker = ElDatePicker;
			const _component_el_form = ElForm;
			const _component_el_empty = ElEmpty;
			const _component_el_tab_pane = ElTabPane;
			const _component_el_table_column = ElTableColumn;
			const _component_el_table = ElTable;
			const _component_el_tabs = ElTabs;
			const _component_el_drawer = ElDrawer;
			const _directive_loading = vLoading;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => visible.value = $event),
				class: "customer-360-drawer",
				size: "min(880px, 94vw)",
				"append-to-body": "",
				"destroy-on-close": "",
				"close-on-click-modal": false,
				"before-close": beforeDrawerClose,
				onClosed: _cache[11] || (_cache[11] = ($event) => followExpanded.value = false)
			}, {
				header: withCtx(() => [createBaseVNode("div", _hoisted_1, [createBaseVNode("div", _hoisted_2, [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(user_filled_default))]),
					_: 1
				})]), createBaseVNode("div", null, [_cache[12] || (_cache[12] = createBaseVNode("h2", null, "客户360", -1)), createBaseVNode("p", null, toDisplayString(overview.value.companyName || "销售客户档案"), 1)])])]),
				default: withCtx(() => [withDirectives((openBlock(), createElementBlock("div", _hoisted_3, [!loading.value && errorMessage.value ? (openBlock(), createBlock(_component_el_result, {
					key: 0,
					icon: "warning",
					title: "客户360加载失败",
					"sub-title": errorMessage.value
				}, {
					extra: withCtx(() => [createVNode(_component_el_button, {
						type: "primary",
						icon: unref(refresh_default),
						onClick: loadData
					}, {
						default: withCtx(() => [..._cache[13] || (_cache[13] = [createTextVNode("重新加载", -1)])]),
						_: 1
					}, 8, ["icon"])]),
					_: 1
				}, 8, ["sub-title"])) : data.value ? (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createBaseVNode("section", _hoisted_4, [
						createBaseVNode("div", _hoisted_5, toDisplayString(firstChar(overview.value.companyName)), 1),
						createBaseVNode("div", _hoisted_6, [
							createBaseVNode("div", _hoisted_7, [
								createBaseVNode("h3", { title: overview.value.companyName }, toDisplayString(overview.value.companyName || "未命名客户"), 9, _hoisted_8),
								overview.value.customerLevel ? (openBlock(), createBlock(_component_el_tag, {
									key: 0,
									effect: "dark",
									type: levelTagType(overview.value.customerLevel)
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(overview.value.customerLevel) + "类 ", 1)]),
									_: 1
								}, 8, ["type"])) : (openBlock(), createBlock(_component_el_tag, {
									key: 1,
									effect: "plain",
									type: "info"
								}, {
									default: withCtx(() => [..._cache[14] || (_cache[14] = [createTextVNode("未分级", -1)])]),
									_: 1
								})),
								createVNode(_component_el_tag, {
									effect: "plain",
									type: overview.value.customerStatus === 1 ? "danger" : overview.value.converted ? "success" : "primary"
								}, {
									default: withCtx(() => [createTextVNode(toDisplayString(overview.value.customerStatus === 1 ? "已停用" : overview.value.converted ? "正式客户" : overview.value.followStatus || lifecycleLabel(overview.value.lifecycleStatus)), 1)]),
									_: 1
								}, 8, ["type"])
							]),
							createBaseVNode("div", _hoisted_9, [
								createBaseVNode("span", null, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(user_default))]),
									_: 1
								}), createTextVNode(toDisplayString(overview.value.contactName || "联系人待补"), 1)]),
								createBaseVNode("span", _hoisted_10, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(phone_default))]),
									_: 1
								}), createTextVNode(toDisplayString(overview.value.phone || "电话待补"), 1)]),
								overview.value.phone && canDial.value ? (openBlock(), createBlock(_component_el_tooltip, {
									key: 0,
									content: "复制电话号码",
									placement: "top"
								}, {
									default: withCtx(() => [createVNode(_component_el_button, {
										class: "copy-button",
										text: "",
										circle: "",
										icon: unref(copy_document_default),
										"aria-label": "复制电话号码",
										onClick: copyPhone
									}, null, 8, ["icon"])]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							createBaseVNode("div", _hoisted_11, [
								createBaseVNode("span", null, "负责人：" + toDisplayString(ownerDisplay.value), 1),
								createBaseVNode("span", null, "来源：" + toDisplayString(overview.value.source || "未记录"), 1),
								createBaseVNode("span", null, "业务：" + toDisplayString(overview.value.serviceType || "待确认"), 1)
							])
						]),
						createBaseVNode("div", _hoisted_12, [
							createVNode(_component_el_tooltip, {
								content: "重新读取客户最新记录",
								placement: "top"
							}, {
								default: withCtx(() => [createVNode(_component_el_button, {
									class: "icon-command",
									icon: unref(refresh_default),
									circle: "",
									"aria-label": "刷新客户360",
									loading: loading.value,
									onClick: loadData
								}, null, 8, ["icon", "loading"])]),
								_: 1
							}),
							canFollow.value ? (openBlock(), createBlock(_component_el_button, {
								key: 0,
								icon: unref(edit_pen_default),
								onClick: startFollow
							}, {
								default: withCtx(() => [..._cache[15] || (_cache[15] = [createTextVNode("写跟进", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true),
							canConvert.value ? (openBlock(), createBlock(_component_el_button, {
								key: 1,
								icon: unref(promotion_default),
								onClick: convertLead
							}, {
								default: withCtx(() => [..._cache[16] || (_cache[16] = [createTextVNode("转客户", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true),
							canHandover.value ? (openBlock(), createBlock(_component_el_button, {
								key: 2,
								icon: unref(switch_default),
								onClick: startHandover
							}, {
								default: withCtx(() => [..._cache[17] || (_cache[17] = [createTextVNode("发起交接", -1)])]),
								_: 1
							}, 8, ["icon"])) : createCommentVNode("", true),
							props.showDial !== false ? (openBlock(), createBlock(_component_el_button, {
								key: 3,
								type: "primary",
								icon: unref(phone_default),
								disabled: !canDial.value,
								onClick: dialCustomer
							}, {
								default: withCtx(() => [..._cache[18] || (_cache[18] = [createTextVNode("拨打", -1)])]),
								_: 1
							}, 8, ["icon", "disabled"])) : createCommentVNode("", true)
						])
					]),
					overview.value.customerDataRestricted ? (openBlock(), createBlock(_component_el_alert, {
						key: 0,
						class: "restricted-alert",
						type: "warning",
						closable: false,
						"show-icon": "",
						title: "当前只展示你有权查看的线索资料",
						description: restrictedDescription.value
					}, null, 8, ["description"])) : createCommentVNode("", true),
					!overview.value.customerDataRestricted ? (openBlock(), createElementBlock("section", _hoisted_13, [
						createBaseVNode("div", null, [
							_cache[19] || (_cache[19] = createBaseVNode("span", null, "跟进", -1)),
							createBaseVNode("strong", null, toDisplayString(stats.value.followCount || 0), 1),
							_cache[20] || (_cache[20] = createBaseVNode("small", null, "条记录", -1))
						]),
						createBaseVNode("div", null, [
							_cache[21] || (_cache[21] = createBaseVNode("span", null, "通话", -1)),
							createBaseVNode("strong", null, toDisplayString(stats.value.callCount || 0), 1),
							_cache[22] || (_cache[22] = createBaseVNode("small", null, "次沟通", -1))
						]),
						createBaseVNode("div", null, [
							_cache[23] || (_cache[23] = createBaseVNode("span", null, "商机", -1)),
							createBaseVNode("strong", null, toDisplayString(stats.value.opportunityCount || 0), 1),
							createBaseVNode("small", null, toDisplayString(money(stats.value.opportunityAmount)), 1)
						]),
						createBaseVNode("div", null, [
							_cache[24] || (_cache[24] = createBaseVNode("span", null, "订单", -1)),
							createBaseVNode("strong", null, toDisplayString(stats.value.orderCount || 0), 1),
							createBaseVNode("small", null, toDisplayString(money(stats.value.orderAmount)), 1)
						]),
						createBaseVNode("div", _hoisted_14, [
							_cache[25] || (_cache[25] = createBaseVNode("span", null, "已收", -1)),
							createBaseVNode("strong", null, toDisplayString(moneyCompact(stats.value.receivedAmount)), 1),
							_cache[26] || (_cache[26] = createBaseVNode("small", null, "确认收款", -1))
						]),
						createBaseVNode("div", { class: normalizeClass({ "is-danger": Number(stats.value.arrearsAmount || 0) > 0 }) }, [
							_cache[27] || (_cache[27] = createBaseVNode("span", null, "待收", -1)),
							createBaseVNode("strong", null, toDisplayString(moneyCompact(stats.value.arrearsAmount)), 1),
							createBaseVNode("small", null, toDisplayString(Number(stats.value.arrearsAmount || 0) > 0 ? "需要跟进" : "暂无欠费"), 1)
						], 2),
						createBaseVNode("div", { class: normalizeClass({ "is-warning": Number(stats.value.openIssueCount || 0) > 0 }) }, [
							_cache[28] || (_cache[28] = createBaseVNode("span", null, "服务问题", -1)),
							createBaseVNode("strong", null, toDisplayString(stats.value.openIssueCount || 0), 1),
							_cache[29] || (_cache[29] = createBaseVNode("small", null, "未关闭", -1))
						], 2)
					])) : createCommentVNode("", true),
					!overview.value.customerDataRestricted ? (openBlock(), createElementBlock("section", {
						key: 2,
						class: normalizeClass(["next-action-band", nextActionClass.value])
					}, [
						createBaseVNode("div", _hoisted_15, [createVNode(_component_el_icon, null, {
							default: withCtx(() => [createVNode(unref(calendar_default))]),
							_: 1
						})]),
						createBaseVNode("div", null, [
							_cache[30] || (_cache[30] = createBaseVNode("span", null, "下一步动作", -1)),
							createBaseVNode("strong", null, toDisplayString(nextActionTitle.value), 1),
							createBaseVNode("p", null, toDisplayString(overview.value.nextActionContent || overview.value.lastFollowContent || "还没有写具体计划"), 1)
						]),
						overview.value.nextActionTime ? (openBlock(), createElementBlock("time", _hoisted_16, toDisplayString(dateTime(overview.value.nextActionTime)), 1)) : (openBlock(), createBlock(_component_el_tag, {
							key: 1,
							type: "warning",
							effect: "plain"
						}, {
							default: withCtx(() => [..._cache[31] || (_cache[31] = [createTextVNode("待安排", -1)])]),
							_: 1
						}))
					], 2)) : createCommentVNode("", true),
					followExpanded.value ? (openBlock(), createElementBlock("section", _hoisted_17, [createBaseVNode("div", _hoisted_18, [_cache[33] || (_cache[33] = createBaseVNode("div", null, [createBaseVNode("h4", null, "记录本次跟进"), createBaseVNode("p", null, "本次沟通与下一步计划")], -1)), createVNode(_component_el_button, {
						text: "",
						icon: unref(close_default),
						onClick: _cache[0] || (_cache[0] = ($event) => followExpanded.value = false)
					}, {
						default: withCtx(() => [..._cache[32] || (_cache[32] = [createTextVNode("收起", -1)])]),
						_: 1
					}, 8, ["icon"])]), createVNode(_component_el_form, {
						"label-position": "top",
						class: "follow-form"
					}, {
						default: withCtx(() => [
							createBaseVNode("div", _hoisted_19, [
								createVNode(_component_el_form_item, {
									label: "跟进方式",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: followForm.type,
										"onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => followForm.type = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [
											createVNode(_component_el_option, {
												label: "电话",
												value: 1
											}),
											createVNode(_component_el_option, {
												label: "微信",
												value: 2
											}),
											createVNode(_component_el_option, {
												label: "面谈",
												value: 3
											}),
											createVNode(_component_el_option, {
												label: "邮件",
												value: 4
											}),
											createVNode(_component_el_option, {
												label: "其他",
												value: 5
											})
										]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								!isFormalCustomer.value ? (openBlock(), createBlock(_component_el_form_item, {
									key: 0,
									label: "销售阶段",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: followForm.followStatus,
										"onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => followForm.followStatus = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(followStatusOptions, (item) => {
											return createVNode(_component_el_option, {
												key: item,
												label: item,
												value: item
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})) : createCommentVNode("", true),
								createVNode(_component_el_form_item, { label: "意向等级" }, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: followForm.customerLevel,
										"onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => followForm.customerLevel = $event),
										clearable: "",
										placeholder: "暂不分级",
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(customerLevelOptions, (item) => {
											return createVNode(_component_el_option, {
												key: item.value,
												label: item.label,
												value: item.value
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								}),
								!isFormalCustomer.value && !leadMovesToHistory.value ? (openBlock(), createBlock(_component_el_form_item, {
									key: 1,
									label: "下一步动作",
									required: ""
								}, {
									default: withCtx(() => [createVNode(_component_el_select, {
										modelValue: followForm.nextActionType,
										"onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => followForm.nextActionType = $event),
										style: { "width": "100%" }
									}, {
										default: withCtx(() => [(openBlock(), createElementBlock(Fragment, null, renderList(nextActionOptions, (item) => {
											return createVNode(_component_el_option, {
												key: item,
												label: item,
												value: item
											}, null, 8, ["label", "value"]);
										}), 64))]),
										_: 1
									}, 8, ["modelValue"])]),
									_: 1
								})) : createCommentVNode("", true)
							]),
							createVNode(_component_el_form_item, {
								label: "本次沟通内容",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: followForm.content,
									"onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => followForm.content = $event),
									type: "textarea",
									rows: 4,
									maxlength: "500",
									"show-word-limit": "",
									placeholder: "写清客户反馈、当前需求和已达成的共识"
								}, null, 8, ["modelValue"])]),
								_: 1
							}),
							createVNode(SalesAiDraftPanel_default, {
								"lead-id": overview.value.leadId,
								connected: 1,
								result: "客户跟进",
								"user-note": followForm.content,
								onApply: applyAiFollowDraft
							}, null, 8, ["lead-id", "user-note"]),
							leadMovesToHistory.value ? (openBlock(), createBlock(_component_el_alert, {
								key: 0,
								type: "warning",
								closable: false,
								"show-icon": "",
								title: "D/E 类保存后进入历史客资，全部客户记录继续保留"
							})) : createCommentVNode("", true),
							!leadMovesToHistory.value ? (openBlock(), createElementBlock("div", _hoisted_20, [createVNode(_component_el_form_item, {
								label: "下次跟进时间",
								required: ""
							}, {
								default: withCtx(() => [createVNode(_component_el_date_picker, {
									modelValue: followForm.nextTime,
									"onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => followForm.nextTime = $event),
									type: "datetime",
									"value-format": "YYYY-MM-DD HH:mm:ss",
									placeholder: "选择具体时间",
									style: { "width": "100%" }
								}, null, 8, ["modelValue"])]),
								_: 1
							}), createVNode(_component_el_form_item, {
								label: isFormalCustomer.value ? "下一步具体计划" : "下次计划",
								required: isFormalCustomer.value
							}, {
								default: withCtx(() => [createVNode(_component_el_input, {
									modelValue: followForm.nextContent,
									"onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => followForm.nextContent = $event),
									maxlength: "200",
									placeholder: isFormalCustomer.value ? "例如：发送续费合同并确认付款日期" : "例如：电话确认报价方案"
								}, null, 8, ["modelValue", "placeholder"])]),
								_: 1
							}, 8, ["label", "required"])])) : createCommentVNode("", true),
							createBaseVNode("div", _hoisted_21, [createVNode(_component_el_button, { onClick: _cache[8] || (_cache[8] = ($event) => followExpanded.value = false) }, {
								default: withCtx(() => [..._cache[34] || (_cache[34] = [createTextVNode("取消", -1)])]),
								_: 1
							}), createVNode(_component_el_button, {
								type: "primary",
								loading: savingFollow.value,
								onClick: saveFollow
							}, {
								default: withCtx(() => [..._cache[35] || (_cache[35] = [createTextVNode("保存跟进", -1)])]),
								_: 1
							}, 8, ["loading"])])
						]),
						_: 1
					})])) : createCommentVNode("", true),
					!overview.value.customerDataRestricted ? (openBlock(), createBlock(_component_el_tabs, {
						key: 4,
						modelValue: activeTab.value,
						"onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => activeTab.value = $event),
						class: "customer-tabs"
					}, {
						default: withCtx(() => [
							createVNode(_component_el_tab_pane, { name: "timeline" }, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_22, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(clock_default))]),
									_: 1
								}), _cache[36] || (_cache[36] = createTextVNode("时间线", -1))])]),
								default: withCtx(() => [data.value.timeline.length ? (openBlock(), createElementBlock("div", _hoisted_23, [(openBlock(true), createElementBlock(Fragment, null, renderList(timelineGroups.value, (group) => {
									return openBlock(), createElementBlock(Fragment, { key: group.date }, [createBaseVNode("div", _hoisted_24, [_cache[37] || (_cache[37] = createBaseVNode("span", { class: "rail-date-dot" }, null, -1)), createTextVNode(toDisplayString(group.label), 1)]), (openBlock(true), createElementBlock(Fragment, null, renderList(group.nodes, (node) => {
										return openBlock(), createElementBlock(Fragment, { key: node.kind === "fold" ? node.key : `${node.item.type}-${node.item.id}-${node.item.occurredAt}` }, [node.kind === "fold" ? (openBlock(), createElementBlock("div", _hoisted_25, [_cache[38] || (_cache[38] = createBaseVNode("span", { class: "rail-dot miss" }, null, -1)), createBaseVNode("div", _hoisted_26, [createBaseVNode("button", {
											type: "button",
											class: "fold-row",
											onClick: ($event) => toggleFold(node.key)
										}, [
											createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(phone_default))]),
												_: 1
											}),
											createBaseVNode("span", null, [createTextVNode("连续 " + toDisplayString(node.items.length) + " 次未接通", 1), node.actorLabel ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createTextVNode(" · " + toDisplayString(node.actorLabel), 1)], 64)) : createCommentVNode("", true)]),
											createBaseVNode("span", _hoisted_28, [createTextVNode(toDisplayString(foldOpen.value[node.key] ? "收起" : "展开"), 1), createVNode(_component_el_icon, null, {
												default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(foldOpen.value[node.key] ? unref(arrow_up_default) : unref(arrow_down_default))))]),
												_: 2
											}, 1024)])
										], 8, _hoisted_27), foldOpen.value[node.key] ? (openBlock(), createElementBlock("div", _hoisted_29, [(openBlock(true), createElementBlock(Fragment, null, renderList(node.items, (it) => {
											return openBlock(), createElementBlock("div", {
												key: `${it.id}-${it.occurredAt}`,
												class: "call-card miss"
											}, [createBaseVNode("div", _hoisted_30, [
												createBaseVNode("strong", null, toDisplayString(it.title || "电话外呼"), 1),
												it.durationSeconds != null ? (openBlock(), createElementBlock("span", _hoisted_31, toDisplayString(it.durationSeconds) + "秒", 1)) : createCommentVNode("", true),
												createBaseVNode("time", null, toDisplayString(dateTime(it.occurredAt)), 1)
											]), createBaseVNode("div", _hoisted_32, [it.actorName ? (openBlock(), createElementBlock("span", _hoisted_33, "经办：" + toDisplayString(it.actorName), 1)) : createCommentVNode("", true)])]);
										}), 128))])) : createCommentVNode("", true)])])) : node.item.type === "call" ? (openBlock(), createElementBlock("div", _hoisted_34, [createBaseVNode("span", { class: normalizeClass(["rail-dot", node.item.status === "已接通" ? "ok" : "miss"]) }, null, 2), createBaseVNode("div", { class: normalizeClass(["call-card", {
											miss: node.item.status !== "已接通",
											hl: node.item.recordingAvailable
										}]) }, [
											createBaseVNode("div", _hoisted_35, [
												createBaseVNode("strong", null, toDisplayString(node.item.title || "电话外呼"), 1),
												createVNode(_component_el_tag, {
													size: "small",
													effect: "plain",
													type: node.item.status === "已接通" ? "success" : "info"
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(node.item.status), 1)]),
													_: 2
												}, 1032, ["type"]),
												node.item.durationSeconds != null ? (openBlock(), createElementBlock("span", _hoisted_36, toDisplayString(node.item.durationSeconds) + "秒", 1)) : createCommentVNode("", true),
												createBaseVNode("time", null, toDisplayString(dateTime(node.item.occurredAt)), 1)
											]),
											node.item.content ? (openBlock(), createElementBlock("p", _hoisted_37, toDisplayString(node.item.content), 1)) : createCommentVNode("", true),
											createBaseVNode("div", _hoisted_38, [node.item.actorName ? (openBlock(), createElementBlock("span", _hoisted_39, "经办：" + toDisplayString(node.item.actorName), 1)) : createCommentVNode("", true), node.item.recordingAvailable ? (openBlock(), createBlock(_component_el_button, {
												key: 1,
												link: "",
												type: "primary",
												icon: unref(headset_default),
												onClick: ($event) => openRecord(node.item.id)
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(playingRecordId.value === node.item.id ? "收起录音" : "听录音"), 1)]),
												_: 2
											}, 1032, ["icon", "onClick"])) : createCommentVNode("", true)]),
											playingRecordId.value === node.item.id && playingAudioSrc.value ? (openBlock(), createElementBlock("audio", {
												key: 1,
												class: "timeline-audio",
												src: playingAudioSrc.value,
												controls: "",
												autoplay: "",
												preload: "none"
											}, null, 8, _hoisted_40)) : createCommentVNode("", true)
										], 2)])) : (openBlock(), createElementBlock("div", _hoisted_41, [_cache[39] || (_cache[39] = createBaseVNode("span", { class: "rail-dot other" }, null, -1)), createBaseVNode("div", _hoisted_42, [
											createBaseVNode("div", _hoisted_43, [
												createVNode(_component_el_icon, { class: "event-type-icon" }, {
													default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(timelineIcon(node.item.type))))]),
													_: 2
												}, 1024),
												createBaseVNode("strong", null, toDisplayString(node.item.title || timelineTypeLabel(node.item.type)), 1),
												node.item.status ? (openBlock(), createBlock(_component_el_tag, {
													key: 0,
													size: "small",
													effect: "plain"
												}, {
													default: withCtx(() => [createTextVNode(toDisplayString(node.item.status), 1)]),
													_: 2
												}, 1024)) : createCommentVNode("", true),
												hasAmount(node.item.amount) ? (openBlock(), createElementBlock("b", _hoisted_44, toDisplayString(money(node.item.amount)), 1)) : createCommentVNode("", true),
												createBaseVNode("time", null, toDisplayString(dateTime(node.item.occurredAt)), 1)
											]),
											node.item.content ? (openBlock(), createElementBlock("p", _hoisted_45, toDisplayString(node.item.content), 1)) : createCommentVNode("", true),
											createBaseVNode("div", _hoisted_46, [node.item.actorName ? (openBlock(), createElementBlock("span", _hoisted_47, "经办：" + toDisplayString(node.item.actorName), 1)) : createCommentVNode("", true)])
										])]))], 64);
									}), 128))], 64);
								}), 128))])) : (openBlock(), createBlock(_component_el_empty, {
									key: 1,
									description: "还没有沟通或业务记录",
									"image-size": 72
								}))]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, { name: "opportunities" }, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_48, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(trend_charts_default))]),
									_: 1
								}), createTextVNode("商机 " + toDisplayString(data.value.opportunities.length), 1)])]),
								default: withCtx(() => [data.value.opportunities.length ? (openBlock(), createBlock(_component_el_table, {
									key: 0,
									data: data.value.opportunities,
									class: "detail-table",
									stripe: ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "商机",
											"min-width": "180",
											"show-overflow-tooltip": ""
										}, {
											default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.name || "未命名商机"), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "阶段",
											"min-width": "108"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, { effect: "plain" }, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.stageName), 1)]),
												_: 2
											}, 1024)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "预计金额",
											"min-width": "120"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(moneyOrDash(row.amount)), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "赢单率",
											"min-width": "90"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.winRate == null ? "-" : `${row.winRate}%`), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "预计成交",
											"min-width": "112",
											prop: "expectedDate"
										}),
										createVNode(_component_el_table_column, {
											label: "负责人",
											"min-width": "100",
											prop: "ownerName",
											"show-overflow-tooltip": ""
										})
									]),
									_: 1
								}, 8, ["data"])) : (openBlock(), createBlock(_component_el_empty, {
									key: 1,
									description: "暂无商机",
									"image-size": 72
								}))]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, { name: "transactions" }, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_49, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(wallet_default))]),
									_: 1
								}), createTextVNode("交易 " + toDisplayString(data.value.transactions.length), 1)])]),
								default: withCtx(() => [data.value.transactions.length ? (openBlock(), createBlock(_component_el_table, {
									key: 0,
									data: data.value.transactions,
									class: "detail-table",
									stripe: ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "类型",
											"min-width": "92"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, {
												type: transactionTagType(row.type),
												effect: "plain"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(transactionTypeLabel(row.type)), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "单号 / 内容",
											"min-width": "210",
											"show-overflow-tooltip": ""
										}, {
											default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.number || row.title || "-"), 1), row.number && row.title ? (openBlock(), createElementBlock("small", _hoisted_50, toDisplayString(row.title), 1)) : createCommentVNode("", true)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "状态",
											"min-width": "102",
											prop: "status"
										}),
										createVNode(_component_el_table_column, {
											label: "金额",
											"min-width": "120"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(moneyOrDash(row.amount)), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "待收",
											"min-width": "110"
										}, {
											default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "amount-danger": Number(row.arrearsAmount || 0) > 0 }) }, toDisplayString(moneyOrDash(row.arrearsAmount)), 3)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "时间",
											"min-width": "148"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(dateTime(row.eventTime)), 1)]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])) : (openBlock(), createBlock(_component_el_empty, {
									key: 1,
									description: "暂无授权可见的订单、合同或收款记录",
									"image-size": 72
								}))]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, { name: "services" }, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_51, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(service_default))]),
									_: 1
								}), createTextVNode("服务 " + toDisplayString(data.value.services.length), 1)])]),
								default: withCtx(() => [data.value.services.length ? (openBlock(), createBlock(_component_el_table, {
									key: 0,
									data: data.value.services,
									class: "detail-table",
									stripe: ""
								}, {
									default: withCtx(() => [
										createVNode(_component_el_table_column, {
											label: "工单",
											"min-width": "130",
											prop: "number",
											"show-overflow-tooltip": ""
										}),
										createVNode(_component_el_table_column, {
											label: "问题",
											"min-width": "220",
											"show-overflow-tooltip": ""
										}, {
											default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.title || "-"), 1)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "类型",
											"min-width": "88",
											prop: "type"
										}),
										createVNode(_component_el_table_column, {
											label: "优先级",
											"min-width": "86"
										}, {
											default: withCtx(({ row }) => [createVNode(_component_el_tag, {
												type: priorityTagType(row.priority),
												effect: "plain"
											}, {
												default: withCtx(() => [createTextVNode(toDisplayString(row.priority || "P2"), 1)]),
												_: 2
											}, 1032, ["type"])]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "状态",
											"min-width": "94"
										}, {
											default: withCtx(({ row }) => [createBaseVNode("span", { class: normalizeClass({ "amount-danger": row.overdue }) }, toDisplayString(row.status || "-"), 3)]),
											_: 1
										}),
										createVNode(_component_el_table_column, {
											label: "负责人",
											"min-width": "100",
											prop: "ownerName",
											"show-overflow-tooltip": ""
										}),
										createVNode(_component_el_table_column, {
											label: "截止时间",
											"min-width": "148"
										}, {
											default: withCtx(({ row }) => [createTextVNode(toDisplayString(dateTime(row.deadline)), 1)]),
											_: 1
										})
									]),
									_: 1
								}, 8, ["data"])) : (openBlock(), createBlock(_component_el_empty, {
									key: 1,
									description: "暂无任务工单记录",
									"image-size": 72
								}))]),
								_: 1
							}),
							createVNode(_component_el_tab_pane, { name: "profile" }, {
								label: withCtx(() => [createBaseVNode("span", _hoisted_52, [createVNode(_component_el_icon, null, {
									default: withCtx(() => [createVNode(unref(document_default))]),
									_: 1
								}), _cache[40] || (_cache[40] = createTextVNode("资料", -1))])]),
								default: withCtx(() => {
									var _overview$value$regis;
									return [
										createBaseVNode("section", _hoisted_53, [createBaseVNode("div", _hoisted_54, [createVNode(_component_el_icon, null, {
											default: withCtx(() => [createVNode(unref(data_analysis_default))]),
											_: 1
										}), _cache[41] || (_cache[41] = createBaseVNode("h4", null, "跟进信息", -1))]), createBaseVNode("dl", _hoisted_55, [
											createBaseVNode("div", null, [_cache[42] || (_cache[42] = createBaseVNode("dt", null, "线索编号", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.leadNo || "-"), 1)]),
											createBaseVNode("div", null, [_cache[43] || (_cache[43] = createBaseVNode("dt", null, "当前阶段", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.followStatus || lifecycleLabel(overview.value.lifecycleStatus)), 1)]),
											createBaseVNode("div", null, [_cache[44] || (_cache[44] = createBaseVNode("dt", null, "意向等级", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.intentLevel || "-"), 1)]),
											createBaseVNode("div", null, [_cache[45] || (_cache[45] = createBaseVNode("dt", null, "报价状态", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.quoteStatus || "-"), 1)]),
											createBaseVNode("div", null, [_cache[46] || (_cache[46] = createBaseVNode("dt", null, "报价金额", -1)), createBaseVNode("dd", null, toDisplayString(moneyOrDash(overview.value.quotedPrice)), 1)]),
											createBaseVNode("div", null, [_cache[47] || (_cache[47] = createBaseVNode("dt", null, "成交金额", -1)), createBaseVNode("dd", null, toDisplayString(moneyOrDash(overview.value.dealAmount)), 1)]),
											createBaseVNode("div", null, [_cache[48] || (_cache[48] = createBaseVNode("dt", null, "微信", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.wechat || "-"), 1)]),
											createBaseVNode("div", null, [_cache[49] || (_cache[49] = createBaseVNode("dt", null, "邮箱", -1)), createBaseVNode("dd", { title: overview.value.email }, toDisplayString(overview.value.email || "-"), 9, _hoisted_56)]),
											createBaseVNode("div", null, [_cache[50] || (_cache[50] = createBaseVNode("dt", null, "服务到期", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.serviceExpireDate || "-"), 1)]),
											createBaseVNode("div", null, [_cache[51] || (_cache[51] = createBaseVNode("dt", null, "最近跟进", -1)), createBaseVNode("dd", null, toDisplayString(dateTime(overview.value.lastFollowTime)), 1)])
										])]),
										createBaseVNode("section", _hoisted_57, [
											createBaseVNode("div", _hoisted_58, [createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(office_building_default))]),
												_: 1
											}), _cache[52] || (_cache[52] = createBaseVNode("h4", null, "工商信息", -1))]),
											createBaseVNode("dl", _hoisted_59, [
												createBaseVNode("div", null, [_cache[53] || (_cache[53] = createBaseVNode("dt", null, "法定代表人", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.legalPerson || "-"), 1)]),
												createBaseVNode("div", null, [_cache[54] || (_cache[54] = createBaseVNode("dt", null, "企业联系电话", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.companyPhone || "-"), 1)]),
												createBaseVNode("div", null, [_cache[55] || (_cache[55] = createBaseVNode("dt", null, "登记状态", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.registerStatus || "-"), 1)]),
												createBaseVNode("div", null, [_cache[56] || (_cache[56] = createBaseVNode("dt", null, "企业类型", -1)), createBaseVNode("dd", { title: overview.value.enterpriseType }, toDisplayString(overview.value.enterpriseType || "-"), 9, _hoisted_60)]),
												createBaseVNode("div", null, [_cache[57] || (_cache[57] = createBaseVNode("dt", null, "企业规模", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.enterpriseScale || "-"), 1)]),
												createBaseVNode("div", null, [_cache[58] || (_cache[58] = createBaseVNode("dt", null, "注册资本", -1)), createBaseVNode("dd", null, toDisplayString((_overview$value$regis = overview.value.registeredCapital) !== null && _overview$value$regis !== void 0 ? _overview$value$regis : "-"), 1)]),
												createBaseVNode("div", null, [_cache[59] || (_cache[59] = createBaseVNode("dt", null, "实缴资本", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.paidCapital || "-"), 1)]),
												createBaseVNode("div", null, [_cache[60] || (_cache[60] = createBaseVNode("dt", null, "统一社会信用代码", -1)), createBaseVNode("dd", { title: overview.value.creditCode }, toDisplayString(overview.value.creditCode || "-"), 9, _hoisted_61)]),
												createBaseVNode("div", null, [_cache[61] || (_cache[61] = createBaseVNode("dt", null, "成立日期", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.establishedDate || "-"), 1)]),
												createBaseVNode("div", null, [_cache[62] || (_cache[62] = createBaseVNode("dt", null, "所属区域", -1)), createBaseVNode("dd", { title: overview.value.region }, toDisplayString(overview.value.region || "-"), 9, _hoisted_62)]),
												createBaseVNode("div", null, [_cache[63] || (_cache[63] = createBaseVNode("dt", null, "行业门类", -1)), createBaseVNode("dd", { title: overview.value.industry }, toDisplayString(overview.value.industry || "-"), 9, _hoisted_63)]),
												createBaseVNode("div", null, [_cache[64] || (_cache[64] = createBaseVNode("dt", null, "参保人数", -1)), createBaseVNode("dd", null, toDisplayString(overview.value.insuredCount ? `${overview.value.insuredCount}${overview.value.insuredYear ? `（${overview.value.insuredYear}年报）` : ""}` : "-"), 1)])
											]),
											createBaseVNode("dl", _hoisted_64, [
												createBaseVNode("div", null, [_cache[65] || (_cache[65] = createBaseVNode("dt", null, "注册地址", -1)), createBaseVNode("dd", _hoisted_65, toDisplayString(overview.value.registerAddress || "-"), 1)]),
												createBaseVNode("div", null, [_cache[66] || (_cache[66] = createBaseVNode("dt", null, "最新地址", -1)), createBaseVNode("dd", _hoisted_66, toDisplayString(overview.value.latestAddress || "-"), 1)]),
												createBaseVNode("div", null, [_cache[67] || (_cache[67] = createBaseVNode("dt", null, "经营范围", -1)), createBaseVNode("dd", _hoisted_67, toDisplayString(overview.value.businessScope || "-"), 1)])
											])
										]),
										createBaseVNode("section", _hoisted_68, [createBaseVNode("div", _hoisted_69, [
											createVNode(_component_el_icon, null, {
												default: withCtx(() => [createVNode(unref(user_default))]),
												_: 1
											}),
											_cache[68] || (_cache[68] = createBaseVNode("h4", null, "联系人", -1)),
											createBaseVNode("span", _hoisted_70, toDisplayString(data.value.contacts.length) + " 人", 1)
										]), data.value.contacts.length ? (openBlock(), createBlock(_component_el_table, {
											key: 0,
											data: data.value.contacts,
											class: "detail-table",
											stripe: ""
										}, {
											default: withCtx(() => [
												createVNode(_component_el_table_column, {
													label: "姓名",
													"min-width": "120"
												}, {
													default: withCtx(({ row }) => [createBaseVNode("strong", null, toDisplayString(row.name || "-"), 1), row.primary ? (openBlock(), createBlock(_component_el_tag, {
														key: 0,
														class: "primary-contact",
														size: "small",
														type: "success",
														effect: "plain"
													}, {
														default: withCtx(() => [..._cache[69] || (_cache[69] = [createTextVNode("主要", -1)])]),
														_: 1
													})) : createCommentVNode("", true)]),
													_: 1
												}),
												createVNode(_component_el_table_column, {
													label: "职位",
													"min-width": "100",
													prop: "position",
													"show-overflow-tooltip": ""
												}),
												createVNode(_component_el_table_column, {
													label: "手机",
													"min-width": "135"
												}, {
													default: withCtx(({ row }) => [createTextVNode(toDisplayString(row.mobile || row.phone || "-"), 1)]),
													_: 1
												}),
												createVNode(_component_el_table_column, {
													label: "微信",
													"min-width": "120",
													prop: "wechat",
													"show-overflow-tooltip": ""
												}),
												createVNode(_component_el_table_column, {
													label: "邮箱",
													"min-width": "180",
													prop: "email",
													"show-overflow-tooltip": ""
												})
											]),
											_: 1
										}, 8, ["data"])) : (openBlock(), createBlock(_component_el_empty, {
											key: 1,
											description: "暂无联系人资料",
											"image-size": 72
										}))])
									];
								}),
								_: 1
							})
						]),
						_: 1
					}, 8, ["modelValue"])) : createCommentVNode("", true)
				], 64)) : createCommentVNode("", true)])), [[_directive_loading, loading.value]])]),
				_: 1
			}, 8, ["modelValue"]);
		};
	}
}), [["__scopeId", "data-v-aa4f9c38"]]);
//#endregion
export { SalesAiDraftPanel_default as n, generateSalesManagementInsight as r, Customer360Drawer_default as t };

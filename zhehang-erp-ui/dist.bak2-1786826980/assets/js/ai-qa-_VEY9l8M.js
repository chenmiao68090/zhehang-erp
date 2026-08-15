import { $ as createCommentVNode, Dt as renderList, G as Fragment, Mn as toDisplayString, Q as createBlock, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, gt as nextTick, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Dr as withModifiers, Er as withKeys, Nn as plus_default, cr as top_default, jt as chat_line_round_default, mt as ElInput, o as ElMessage, ot as ElButton, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { r as post } from "./request-CZ5tKmxn.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { t as sanitizeHtml } from "./sanitize-html-BVsHt3EZ.js";
//#region src/api/ai.ts
/** 发送聊天消息 */
function sendChat(data) {
	return post("/ai/chat", data);
}
//#endregion
//#region src/views/file/ai-qa.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "ai-qa" };
var _hoisted_2 = {
	key: 0,
	class: "qa-welcome"
};
var _hoisted_3 = { class: "qa-examples" };
var _hoisted_4 = ["onClick"];
var _hoisted_5 = {
	key: 1,
	class: "qa-msgs"
};
var _hoisted_6 = ["innerHTML"];
var _hoisted_7 = {
	key: 0,
	class: "qa-msg ai"
};
var _hoisted_8 = { class: "qa-input-wrap" };
var _hoisted_9 = { class: "qa-input-box" };
var _hoisted_10 = { class: "qa-input-actions" };
//#endregion
//#region src/views/file/ai-qa.vue
var ai_qa_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "ai-qa",
	setup(__props) {
		const input = ref("");
		const messages = ref([]);
		const loading = ref(false);
		const conversationId = ref();
		const scrollArea = ref();
		const examples = [
			"公司的代理记账服务包含哪些内容?",
			"新员工入职流程是怎样的?",
			"客户续费的优惠政策有哪些?"
		];
		const scrollToBottom = () => {
			nextTick(() => {
				if (scrollArea.value) scrollArea.value.scrollTop = scrollArea.value.scrollHeight;
			});
		};
		const ask = (text) => {
			input.value = text;
			send();
		};
		const send = function() {
			var _ref = _asyncToGenerator(function* () {
				const text = input.value.trim();
				if (!text || loading.value) return;
				messages.value.push({
					role: "user",
					content: text
				});
				input.value = "";
				loading.value = true;
				scrollToBottom();
				try {
					var _res$data;
					const res = yield sendChat({
						message: text,
						conversationId: conversationId.value
					});
					const data = (_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res;
					const reply = (data === null || data === void 0 ? void 0 : data.reply) || (data === null || data === void 0 ? void 0 : data.content) || "抱歉,我没有找到相关答案。";
					if (data === null || data === void 0 ? void 0 : data.conversationId) conversationId.value = data.conversationId;
					messages.value.push({
						role: "ai",
						content: reply
					});
				} catch (_unused) {
					messages.value.push({
						role: "ai",
						content: "⚠️ AI 服务暂时不可用,请稍后再试或联系管理员检查 AI 配置。"
					});
					ElMessage.error("AI 回答失败");
				} finally {
					loading.value = false;
					scrollToBottom();
				}
			});
			return function send() {
				return _ref.apply(this, arguments);
			};
		}();
		const newChat = () => {
			messages.value = [];
			conversationId.value = void 0;
			input.value = "";
		};
		const escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
		const renderText = (s) => sanitizeHtml(escapeHtml(s || "").replace(/\n/g, "<br>"));
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			return openBlock(), createElementBlock("div", _hoisted_1, [createBaseVNode("div", {
				ref_key: "scrollArea",
				ref: scrollArea,
				class: "qa-main"
			}, [!messages.value.length ? (openBlock(), createElementBlock("div", _hoisted_2, [
				_cache[1] || (_cache[1] = createBaseVNode("div", { class: "qa-logo" }, null, -1)),
				_cache[2] || (_cache[2] = createBaseVNode("h2", { class: "qa-title" }, "AI 知识问答", -1)),
				_cache[3] || (_cache[3] = createBaseVNode("p", { class: "qa-sub" }, "基于公司知识库,AI 帮你快速找到答案", -1)),
				createBaseVNode("div", _hoisted_3, [(openBlock(), createElementBlock(Fragment, null, renderList(examples, (ex) => {
					return createBaseVNode("span", {
						key: ex,
						class: "qa-ex",
						onClick: ($event) => ask(ex)
					}, [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(chat_line_round_default))]),
						_: 1
					}), createTextVNode(" " + toDisplayString(ex), 1)], 8, _hoisted_4);
				}), 64))])
			])) : (openBlock(), createElementBlock("div", _hoisted_5, [(openBlock(true), createElementBlock(Fragment, null, renderList(messages.value, (m, i) => {
				return openBlock(), createElementBlock("div", {
					key: i,
					class: normalizeClass(["qa-msg", m.role])
				}, [createBaseVNode("div", { class: normalizeClass(["qa-avatar", m.role]) }, toDisplayString(m.role === "user" ? "我" : "AI"), 3), createBaseVNode("div", {
					class: "qa-bubble",
					innerHTML: unref(sanitizeHtml)(renderText(m.content))
				}, null, 8, _hoisted_6)], 2);
			}), 128)), loading.value ? (openBlock(), createElementBlock("div", _hoisted_7, [..._cache[4] || (_cache[4] = [createBaseVNode("div", { class: "qa-avatar ai" }, "AI", -1), createBaseVNode("div", { class: "qa-bubble qa-typing" }, [
				createBaseVNode("span"),
				createBaseVNode("span"),
				createBaseVNode("span")
			], -1)])])) : createCommentVNode("", true)]))], 512), createBaseVNode("div", _hoisted_8, [createBaseVNode("div", _hoisted_9, [createVNode(_component_el_input, {
				modelValue: input.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => input.value = $event),
				type: "textarea",
				autosize: {
					minRows: 1,
					maxRows: 5
				},
				resize: "none",
				placeholder: "试试输入问题,AI 帮你从知识库找答案…",
				onKeydown: withKeys(withModifiers(send, ["exact", "prevent"]), ["enter"])
			}, null, 8, ["modelValue", "onKeydown"]), createBaseVNode("div", _hoisted_10, [messages.value.length ? (openBlock(), createBlock(_component_el_button, {
				key: 0,
				text: "",
				size: "small",
				onClick: newChat
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(plus_default))]),
					_: 1
				}), _cache[5] || (_cache[5] = createTextVNode(" 新对话 ", -1))]),
				_: 1
			})) : createCommentVNode("", true), createVNode(_component_el_button, {
				class: "qa-send",
				type: "primary",
				circle: "",
				loading: loading.value,
				disabled: !input.value.trim(),
				onClick: send
			}, {
				default: withCtx(() => [createVNode(_component_el_icon, null, {
					default: withCtx(() => [createVNode(unref(top_default))]),
					_: 1
				})]),
				_: 1
			}, 8, ["loading", "disabled"])])]), _cache[6] || (_cache[6] = createBaseVNode("div", { class: "qa-hint" }, "回车发送 · Shift + 回车换行 · 回答由 AI 生成,请自行核实", -1))])]);
		};
	}
}), [["__scopeId", "data-v-d199dee1"]]);
//#endregion
export { ai_qa_default as default };

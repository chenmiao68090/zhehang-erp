import { $ as createCommentVNode, Mn as toDisplayString, Ot as renderSlot, Q as createBlock, Tt as openBlock, Vt as withCtx, X as computed, Z as createBaseVNode, et as createElementBlock, it as createTextVNode, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { it as ElTag, z as ElDrawer } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
//#region src/components/common/BusinessDetailDrawer.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "bd-shell" };
var _hoisted_2 = { class: "bd-head" };
var _hoisted_3 = { class: "bd-title" };
var _hoisted_4 = {
	key: 0,
	class: "bd-eyebrow"
};
var _hoisted_5 = { key: 1 };
var _hoisted_6 = { class: "bd-head-actions" };
var _hoisted_7 = {
	key: 0,
	class: "bd-card bd-meta"
};
var _hoisted_8 = {
	key: 1,
	class: "bd-card bd-content"
};
var _hoisted_9 = {
	key: 2,
	class: "bd-card bd-timeline"
};
var _hoisted_10 = {
	key: 3,
	class: "bd-footer"
};
//#endregion
//#region src/components/common/BusinessDetailDrawer.vue
var BusinessDetailDrawer_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "BusinessDetailDrawer",
	props: {
		modelValue: { type: Boolean },
		title: {},
		subtitle: { default: "" },
		eyebrow: { default: "" },
		avatar: { default: "详" },
		avatarClass: { default: "" },
		statusText: { default: "" },
		statusType: { default: "info" },
		size: { default: "560px" },
		destroyOnClose: {
			type: Boolean,
			default: true
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const visible = computed({
			get: () => props.modelValue,
			set: (value) => emit("update:modelValue", value)
		});
		return (_ctx, _cache) => {
			const _component_el_tag = ElTag;
			const _component_el_drawer = ElDrawer;
			return openBlock(), createBlock(_component_el_drawer, {
				modelValue: visible.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => visible.value = $event),
				size: __props.size,
				"with-header": false,
				"destroy-on-close": __props.destroyOnClose,
				class: "business-detail-drawer"
			}, {
				default: withCtx(() => [createBaseVNode("div", _hoisted_1, [
					createBaseVNode("header", _hoisted_2, [
						createBaseVNode("div", { class: normalizeClass(["bd-avatar", __props.avatarClass]) }, toDisplayString(__props.avatar), 3),
						createBaseVNode("div", _hoisted_3, [
							__props.eyebrow ? (openBlock(), createElementBlock("span", _hoisted_4, toDisplayString(__props.eyebrow), 1)) : createCommentVNode("", true),
							createBaseVNode("h2", null, toDisplayString(__props.title), 1),
							__props.subtitle ? (openBlock(), createElementBlock("p", _hoisted_5, toDisplayString(__props.subtitle), 1)) : createCommentVNode("", true)
						]),
						createBaseVNode("div", _hoisted_6, [__props.statusText ? (openBlock(), createBlock(_component_el_tag, {
							key: 0,
							type: __props.statusType,
							effect: "plain"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(__props.statusText), 1)]),
							_: 1
						}, 8, ["type"])) : createCommentVNode("", true), renderSlot(_ctx.$slots, "actions")])
					]),
					_ctx.$slots.meta ? (openBlock(), createElementBlock("section", _hoisted_7, [renderSlot(_ctx.$slots, "meta")])) : createCommentVNode("", true),
					_ctx.$slots.default ? (openBlock(), createElementBlock("section", _hoisted_8, [renderSlot(_ctx.$slots, "default")])) : createCommentVNode("", true),
					_ctx.$slots.timeline ? (openBlock(), createElementBlock("section", _hoisted_9, [_cache[1] || (_cache[1] = createBaseVNode("div", { class: "bd-section-title" }, "流转记录", -1)), renderSlot(_ctx.$slots, "timeline")])) : createCommentVNode("", true),
					_ctx.$slots.footer ? (openBlock(), createElementBlock("footer", _hoisted_10, [renderSlot(_ctx.$slots, "footer")])) : createCommentVNode("", true)
				])]),
				_: 3
			}, 8, [
				"modelValue",
				"size",
				"destroy-on-close"
			]);
		};
	}
}), [["__scopeId", "data-v-83c15b3a"]]);
//#endregion
export { BusinessDetailDrawer_default as t };

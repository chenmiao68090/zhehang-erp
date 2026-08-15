import { $ as createCommentVNode, Dt as renderList, G as Fragment, Mn as toDisplayString, Q as createBlock, Tt as openBlock, Vt as withCtx, X as computed, Z as createBaseVNode, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, jt as resolveDynamicComponent, kn as normalizeClass, nt as createSlots, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { mt as ElInput, ot as ElButton, r as ElPopover, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
//#region src/components/IconPicker.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "icon-picker" };
var _hoisted_2 = { class: "icon-picker-preview" };
var _hoisted_3 = { key: 1 };
var _hoisted_4 = { class: "icon-picker-panel" };
var _hoisted_5 = ["onClick"];
var _hoisted_6 = {
	key: 1,
	class: "icon-picker-emoji"
};
var _hoisted_7 = { key: 2 };
//#endregion
//#region src/components/IconPicker.vue
var IconPicker_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "IconPicker",
	props: {
		modelValue: { default: "" },
		mode: { default: "emoji" },
		options: {},
		placeholder: { default: "可手动输入，也可以点右侧选择图标" },
		maxlength: { default: 32 },
		columns: { default: 8 },
		panelWidth: { default: 420 }
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const defaultEmojiOptions = [
			"🏢",
			"🎯",
			"💎",
			"🛡️",
			"🚀",
			"🤝",
			"📈",
			"❤️",
			"🕘",
			"💰",
			"📌",
			"📣",
			"🎉",
			"🏆",
			"⭐",
			"🔥",
			"📚",
			"📝",
			"🔒",
			"📊",
			"🧾",
			"✅",
			"💡",
			"🌱",
			"🎁",
			"☕",
			"🧭",
			"🔔",
			"📅",
			"👥",
			"🧑‍💼",
			"🏅"
		];
		const defaultElementOptions = [
			{
				label: "个人中心",
				value: "House"
			},
			{
				label: "数字总部",
				value: "Monitor"
			},
			{
				label: "客户",
				value: "User"
			},
			{
				label: "审批",
				value: "Stamp"
			},
			{
				label: "人文",
				value: "Star"
			},
			{
				label: "订单",
				value: "Document"
			},
			{
				label: "交付",
				value: "Tickets"
			},
			{
				label: "渠道",
				value: "Connection"
			},
			{
				label: "财务",
				value: "Wallet"
			},
			{
				label: "组织",
				value: "Avatar"
			},
			{
				label: "知识库",
				value: "Notebook"
			},
			{
				label: "表格",
				value: "Grid"
			},
			{
				label: "系统",
				value: "Setting"
			},
			{
				label: "菜单",
				value: "Menu"
			},
			{
				label: "消息",
				value: "Bell"
			},
			{
				label: "搜索",
				value: "Search"
			},
			{
				label: "电话",
				value: "Phone"
			},
			{
				label: "合同",
				value: "Files"
			},
			{
				label: "日历",
				value: "Calendar"
			},
			{
				label: "报表",
				value: "DataAnalysis"
			},
			{
				label: "任务",
				value: "Checked"
			},
			{
				label: "文件",
				value: "Folder"
			},
			{
				label: "安全",
				value: "Lock"
			},
			{
				label: "帮助",
				value: "QuestionFilled"
			}
		];
		const isElementMode = computed(() => props.mode === "element");
		const sourceOptions = computed(() => {
			var _props$options;
			return ((_props$options = props.options) === null || _props$options === void 0 ? void 0 : _props$options.length) ? props.options : isElementMode.value ? defaultElementOptions : defaultEmojiOptions;
		});
		const normalizedOptions = computed(() => sourceOptions.value.map((item) => typeof item === "string" ? {
			label: "",
			value: item
		} : item));
		const gridStyle = computed(() => ({ "--icon-picker-columns": String(props.columns) }));
		const innerValue = computed({
			get: () => props.modelValue || "",
			set: (value) => emit("update:modelValue", value)
		});
		const choose = (value) => {
			emit("update:modelValue", value);
		};
		return (_ctx, _cache) => {
			const _component_el_icon = ElIcon;
			const _component_el_input = ElInput;
			const _component_el_button = ElButton;
			const _component_el_popover = ElPopover;
			return openBlock(), createElementBlock("div", _hoisted_1, [createVNode(_component_el_input, {
				modelValue: innerValue.value,
				"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => innerValue.value = $event),
				class: "icon-picker-input",
				maxlength: __props.maxlength,
				placeholder: __props.placeholder,
				clearable: ""
			}, createSlots({ _: 2 }, [innerValue.value ? {
				name: "prepend",
				fn: withCtx(() => [createBaseVNode("span", _hoisted_2, [isElementMode.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
					default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(innerValue.value)))]),
					_: 1
				})) : (openBlock(), createElementBlock("span", _hoisted_3, toDisplayString(innerValue.value), 1))])]),
				key: "0"
			} : void 0]), 1032, [
				"modelValue",
				"maxlength",
				"placeholder"
			]), createVNode(_component_el_popover, {
				placement: "bottom-start",
				trigger: "click",
				width: __props.panelWidth,
				"popper-class": "icon-picker-popover"
			}, {
				reference: withCtx(() => [createVNode(_component_el_button, { plain: "" }, {
					default: withCtx(() => [..._cache[1] || (_cache[1] = [createTextVNode("选择图标", -1)])]),
					_: 1
				})]),
				default: withCtx(() => [createBaseVNode("div", _hoisted_4, [_cache[2] || (_cache[2] = createBaseVNode("div", { class: "icon-picker-title" }, "常用图标", -1)), createBaseVNode("div", {
					class: "icon-picker-grid",
					style: normalizeStyle(gridStyle.value)
				}, [(openBlock(true), createElementBlock(Fragment, null, renderList(normalizedOptions.value, (item) => {
					return openBlock(), createElementBlock("button", {
						key: item.value,
						type: "button",
						class: normalizeClass(["icon-picker-option", {
							active: innerValue.value === item.value,
							"is-element": isElementMode.value
						}]),
						onClick: ($event) => choose(item.value)
					}, [isElementMode.value ? (openBlock(), createBlock(_component_el_icon, { key: 0 }, {
						default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(item.value)))]),
						_: 2
					}, 1024)) : (openBlock(), createElementBlock("span", _hoisted_6, toDisplayString(item.value), 1)), item.label ? (openBlock(), createElementBlock("small", _hoisted_7, toDisplayString(item.label), 1)) : createCommentVNode("", true)], 10, _hoisted_5);
				}), 128))], 4)])]),
				_: 1
			}, 8, ["width"])]);
		};
	}
}), [["__scopeId", "data-v-164ccd44"]]);
//#endregion
export { IconPicker_default as t };

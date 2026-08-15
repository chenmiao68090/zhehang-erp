import { Tt as openBlock, Z as createBaseVNode, et as createElementBlock, rt as createStaticVNode, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { i as useRouter } from "./vendor-vue-iXxhUOfN.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
//#region src/views/error/404.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "error-page" };
//#endregion
//#region src/views/error/404.vue
var _404_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "404",
	setup(__props) {
		const router = useRouter();
		const goHome = () => {
			router.push("/");
		};
		const goBack = () => {
			if (window.history.length > 1) router.back();
			else router.push("/");
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1, [
				_cache[4] || (_cache[4] = createBaseVNode("div", {
					class: "error-page__noise",
					"aria-hidden": "true"
				}, null, -1)),
				_cache[5] || (_cache[5] = createBaseVNode("div", {
					class: "error-page__glow",
					"aria-hidden": "true"
				}, null, -1)),
				createBaseVNode("div", { class: "error-page__frame" }, [
					_cache[2] || (_cache[2] = createStaticVNode("<span class=\"error-page__corner error-page__corner--tl\" data-v-9b15387e></span><span class=\"error-page__corner error-page__corner--tr\" data-v-9b15387e></span><span class=\"error-page__corner error-page__corner--bl\" data-v-9b15387e></span><span class=\"error-page__corner error-page__corner--br\" data-v-9b15387e></span><div class=\"error-page__eyebrow\" data-v-9b15387e><span class=\"error-page__line\" data-v-9b15387e></span><span class=\"error-page__eyebrow-text\" data-v-9b15387e>ZHEHANG · ERROR REPORT</span><span class=\"error-page__line\" data-v-9b15387e></span></div><h1 class=\"error-page__code\" data-v-9b15387e><span class=\"error-page__digit\" style=\"--i:0;\" data-v-9b15387e>4</span><span class=\"error-page__digit error-page__digit--accent\" style=\"--i:1;\" data-v-9b15387e>0</span><span class=\"error-page__digit\" style=\"--i:2;\" data-v-9b15387e>4</span></h1><p class=\"error-page__title\" data-v-9b15387e>抱歉，您访问的页面不存在</p><p class=\"error-page__subtitle\" data-v-9b15387e> Page Not Found · 请检查地址是否正确，或返回首页继续浏览 </p>", 8)),
					createBaseVNode("div", { class: "error-page__actions" }, [createBaseVNode("button", {
						type: "button",
						class: "error-page__btn",
						onClick: goHome
					}, [..._cache[0] || (_cache[0] = [createBaseVNode("span", { class: "error-page__btn-text" }, "返回首页", -1), createBaseVNode("span", {
						class: "error-page__btn-arrow",
						"aria-hidden": "true"
					}, "→", -1)])]), createBaseVNode("button", {
						type: "button",
						class: "error-page__btn error-page__btn--ghost",
						onClick: goBack
					}, [..._cache[1] || (_cache[1] = [createBaseVNode("span", { class: "error-page__btn-text" }, "返回上一页", -1)])])]),
					_cache[3] || (_cache[3] = createBaseVNode("div", { class: "error-page__meta" }, [
						createBaseVNode("span", null, "STATUS · 404"),
						createBaseVNode("span", { class: "error-page__dot" }),
						createBaseVNode("span", null, "ZHEHANG ERP SYSTEM")
					], -1))
				])
			]);
		};
	}
}), [["__scopeId", "data-v-9b15387e"]]);
//#endregion
export { _404_default as default };

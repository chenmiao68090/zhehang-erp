import DOMPurify from "dompurify";
//#region src/utils/sanitize-html.ts
var HTML_TAGS = [
	"a",
	"b",
	"blockquote",
	"br",
	"code",
	"col",
	"colgroup",
	"del",
	"div",
	"em",
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"hr",
	"i",
	"img",
	"li",
	"ol",
	"p",
	"pre",
	"s",
	"span",
	"strong",
	"sub",
	"sup",
	"table",
	"tbody",
	"td",
	"th",
	"thead",
	"tr",
	"u",
	"ul"
];
var HTML_ATTRIBUTES = [
	"alt",
	"class",
	"colspan",
	"height",
	"href",
	"rel",
	"rowspan",
	"src",
	"style",
	"target",
	"title",
	"width"
];
var SVG_TAGS = [
	"svg",
	"circle",
	"text"
];
var SVG_ATTRIBUTES = [
	"cx",
	"cy",
	"dominant-baseline",
	"fill",
	"font-size",
	"font-weight",
	"height",
	"r",
	"stroke",
	"stroke-dasharray",
	"stroke-dashoffset",
	"stroke-linecap",
	"stroke-width",
	"text-anchor",
	"transform",
	"viewBox",
	"width",
	"x",
	"y"
];
var SAFE_STYLE_PROPERTIES = new Set([
	"align-items",
	"background",
	"background-color",
	"border",
	"border-left",
	"border-radius",
	"color",
	"display",
	"flex",
	"flex-wrap",
	"font-size",
	"font-weight",
	"gap",
	"line-height",
	"margin",
	"margin-bottom",
	"margin-left",
	"margin-right",
	"margin-top",
	"min-width",
	"padding",
	"white-space"
]);
var DANGEROUS_STYLE = /(?:url\s*\(|expression\s*\(|@import|javascript\s*:|data\s*:|behavior\s*:|-moz-binding)/i;
var SAFE_URL = /^(?:https?:|mailto:|tel:|\/|\.\/|\.\.\/|#)/i;
var hooksInstalled = false;
function installHooks() {
	if (hooksInstalled) return;
	hooksInstalled = true;
	DOMPurify.addHook("uponSanitizeAttribute", (_node, data) => {
		const name = data.attrName.toLowerCase();
		if (name.startsWith("on")) {
			data.keepAttr = false;
			return;
		}
		if (name === "href" || name === "src") {
			const value = data.attrValue.replace(/[\u0000-\u001f\u007f\s]+/g, "").trim();
			if (!SAFE_URL.test(value)) data.keepAttr = false;
			return;
		}
		if (name === "style") {
			data.attrValue = data.attrValue.split(";").map((entry) => entry.trim()).filter(Boolean).filter((entry) => {
				const separator = entry.indexOf(":");
				if (separator <= 0 || DANGEROUS_STYLE.test(entry)) return false;
				return SAFE_STYLE_PROPERTIES.has(entry.slice(0, separator).trim().toLowerCase());
			}).join(";");
			if (!data.attrValue) data.keepAttr = false;
		}
	});
	DOMPurify.addHook("afterSanitizeAttributes", (node) => {
		if (node instanceof HTMLAnchorElement && node.getAttribute("target") === "_blank") node.setAttribute("rel", "noopener noreferrer");
	});
}
function sanitizeHtml(value) {
	installHooks();
	return DOMPurify.sanitize(String(value !== null && value !== void 0 ? value : ""), {
		ALLOWED_TAGS: HTML_TAGS,
		ALLOWED_ATTR: HTML_ATTRIBUTES,
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
		FORBID_TAGS: [
			"base",
			"embed",
			"form",
			"iframe",
			"input",
			"link",
			"math",
			"meta",
			"object",
			"script",
			"style",
			"template"
		],
		FORBID_ATTR: ["srcdoc"]
	});
}
function sanitizeSvg(value) {
	installHooks();
	return DOMPurify.sanitize(String(value !== null && value !== void 0 ? value : ""), {
		USE_PROFILES: {
			svg: true,
			svgFilters: false
		},
		ALLOWED_TAGS: SVG_TAGS,
		ALLOWED_ATTR: SVG_ATTRIBUTES,
		ALLOW_DATA_ATTR: false,
		ALLOW_ARIA_ATTR: false,
		FORBID_TAGS: [
			"animate",
			"foreignObject",
			"script",
			"style",
			"use"
		]
	});
}
//#endregion
export { sanitizeSvg as n, sanitizeHtml as t };

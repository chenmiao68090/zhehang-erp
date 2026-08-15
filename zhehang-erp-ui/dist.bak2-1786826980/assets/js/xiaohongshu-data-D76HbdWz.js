import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as PlatformDataPage_default } from "./PlatformDataPage-BrsYY5Wk.js";
//#endregion
//#region src/views/operation/xiaohongshu-data.vue
var xiaohongshu_data_default = /* @__PURE__ */ defineComponent({
	__name: "xiaohongshu-data",
	setup(__props) {
		const categories = [
			{
				key: "overview",
				label: "数据概览",
				desc: "账号整体浏览 / 访问 / 咨询与推广消耗(与运营数据总表口径一致)",
				fields: [
					{
						key: "views",
						label: "浏览量"
					},
					{
						key: "visits",
						label: "访问量"
					},
					{
						key: "inquiries",
						label: "咨询量"
					},
					{
						key: "adCost",
						label: "推广消耗",
						money: true
					}
				]
			},
			{
				key: "note",
				label: "内容营销 · 笔记",
				desc: "笔记 / 曝光 / 阅读 / 互动",
				fields: [
					{
						key: "note",
						label: "笔记数"
					},
					{
						key: "exposure",
						label: "曝光量"
					},
					{
						key: "read",
						label: "阅读量"
					},
					{
						key: "interact",
						label: "互动数"
					}
				]
			},
			{
				key: "message",
				label: "服务转化 · 私信留资",
				desc: "私信 / 留资 / 转化",
				fields: [
					{
						key: "message",
						label: "私信数"
					},
					{
						key: "lead",
						label: "留资数"
					},
					{
						key: "convert",
						label: "转化数"
					}
				]
			}
		];
		return (_ctx, _cache) => {
			return openBlock(), createBlock(PlatformDataPage_default, {
				platform: "xiaohongshu",
				"platform-label": "小红书",
				categories
			});
		};
	}
});
//#endregion
export { xiaohongshu_data_default as default };

import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as PlatformDataPage_default } from "./PlatformDataPage-BrsYY5Wk.js";
//#endregion
//#region src/views/operation/shipinhao-data.vue
var shipinhao_data_default = /* @__PURE__ */ defineComponent({
	__name: "shipinhao-data",
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
				key: "video",
				label: "内容营销 · 短视频",
				desc: "视频 / 播放 / 互动",
				fields: [
					{
						key: "video",
						label: "视频数"
					},
					{
						key: "play",
						label: "播放量"
					},
					{
						key: "interact",
						label: "互动数"
					}
				]
			},
			{
				key: "live",
				label: "内容营销 · 直播",
				desc: "直播 / 观看 / 转化",
				fields: [
					{
						key: "sessions",
						label: "直播场次"
					},
					{
						key: "watch",
						label: "观看人次"
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
				platform: "shipinhao",
				"platform-label": "视频号",
				categories
			});
		};
	}
});
//#endregion
export { shipinhao_data_default as default };

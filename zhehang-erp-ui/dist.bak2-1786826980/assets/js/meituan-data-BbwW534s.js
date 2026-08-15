import { Q as createBlock, Tt as openBlock, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { t as PlatformDataPage_default } from "./PlatformDataPage-BrsYY5Wk.js";
//#endregion
//#region src/views/operation/meituan-data.vue
var meituan_data_default = /* @__PURE__ */ defineComponent({
	__name: "meituan-data",
	setup(__props) {
		const categories = [{
			key: "overview",
			label: "美团数据概览",
			desc: "浏览 / 访问 / 咨询与推广消耗(与运营数据总表口径一致,数据互通)",
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
		}, {
			key: "dianping",
			label: "大众点评综合",
			desc: "曝光 / 访问 / 收藏 / 转化 / 推广消耗",
			fields: [
				{
					key: "exposure",
					label: "曝光量"
				},
				{
					key: "visits",
					label: "访问量"
				},
				{
					key: "favorite",
					label: "收藏数"
				},
				{
					key: "convert",
					label: "转化数"
				},
				{
					key: "adCost",
					label: "推广消耗",
					money: true
				}
			]
		}];
		return (_ctx, _cache) => {
			return openBlock(), createBlock(PlatformDataPage_default, {
				platform: "meituan",
				"platform-label": "美团 · 大众点评",
				categories
			});
		};
	}
});
//#endregion
export { meituan_data_default as default };

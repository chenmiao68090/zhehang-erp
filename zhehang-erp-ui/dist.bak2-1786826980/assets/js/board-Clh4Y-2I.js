import { Dt as renderList, G as Fragment, Mn as toDisplayString, Q as createBlock, St as onMounted, Tt as openBlock, V as _asyncToGenerator, Vt as withCtx, X as computed, Xt as ref, Z as createBaseVNode, an as unref, at as createVNode, et as createElementBlock, it as createTextVNode, jn as normalizeStyle, kn as normalizeClass, st as defineComponent } from "./vendor-Cuzsyfny.js";
import { Bn as refresh_default, F as ElEmpty, S as ElSkeleton, W as ElDatePicker, it as ElTag, o as ElMessage, ot as ElButton, yt as ElIcon } from "./vendor-element-plus-CqO9XRGg.js";
import { t as _plugin_vue_export_helper_default } from "./_plugin-vue_export-helper-a0essBwH.js";
import { n as sealBoardApi } from "./seal-ChbS7lCl.js";
//#region src/views/seal/board.vue?vue&type=script&setup=true&lang.ts
var _hoisted_1 = { class: "seal-board" };
var _hoisted_2 = { class: "sb-head" };
var _hoisted_3 = { class: "sb-actions" };
var _hoisted_4 = { class: "sb-kpis" };
var _hoisted_5 = { class: "sb-kpi-label" };
var _hoisted_6 = { class: "sb-kpi-value" };
var _hoisted_7 = { class: "sb-kpi-foot" };
var _hoisted_8 = { class: "sb-main-grid" };
var _hoisted_9 = { class: "sb-panel sb-trend" };
var _hoisted_10 = { class: "sb-panel-head" };
var _hoisted_11 = { class: "sb-bars" };
var _hoisted_12 = { class: "sb-bar-wrap" };
var _hoisted_13 = { class: "sb-bar-value" };
var _hoisted_14 = { class: "sb-summary-strip" };
var _hoisted_15 = { class: "sb-panel" };
var _hoisted_16 = { class: "sb-panel-head" };
var _hoisted_17 = { class: "sb-insights" };
var _hoisted_18 = { class: "sb-month-cards" };
var _hoisted_19 = { class: "sb-ledger" };
var _hoisted_20 = { class: "sb-panel-head" };
var _hoisted_21 = { class: "sb-table-scroll" };
var _hoisted_22 = { class: "sb-table" };
//#endregion
//#region src/views/seal/board.vue
var board_default = /* @__PURE__ */ _plugin_vue_export_helper_default(/* @__PURE__ */ defineComponent({
	__name: "board",
	setup(__props) {
		const year = ref(String((/* @__PURE__ */ new Date()).getFullYear()));
		const months = ref([]);
		const loading = ref(false);
		const toNum = (v) => {
			const n = Number(v);
			return Number.isFinite(n) ? n : 0;
		};
		const emptyMonth = (month) => ({
			month,
			revenue: 0,
			cost: 0,
			profit: 0,
			profitRate: 0,
			sealCount: 0,
			avgPrice: 0,
			dailyCount: 0,
			newCount: 0,
			newAmount: 0
		});
		const normalizeMonth = (raw) => ({
			month: String((raw === null || raw === void 0 ? void 0 : raw.month) || ""),
			revenue: toNum(raw === null || raw === void 0 ? void 0 : raw.revenue),
			cost: toNum(raw === null || raw === void 0 ? void 0 : raw.cost),
			profit: toNum(raw === null || raw === void 0 ? void 0 : raw.profit),
			profitRate: toNum(raw === null || raw === void 0 ? void 0 : raw.profitRate),
			sealCount: toNum(raw === null || raw === void 0 ? void 0 : raw.sealCount),
			avgPrice: toNum(raw === null || raw === void 0 ? void 0 : raw.avgPrice),
			dailyCount: toNum(raw === null || raw === void 0 ? void 0 : raw.dailyCount),
			newCount: toNum(raw === null || raw === void 0 ? void 0 : raw.newCount),
			newAmount: toNum(raw === null || raw === void 0 ? void 0 : raw.newAmount)
		});
		const load = function() {
			var _ref = _asyncToGenerator(function* () {
				loading.value = true;
				try {
					var _res$data;
					const res = yield sealBoardApi.summary(year.value);
					months.value = (((_res$data = res === null || res === void 0 ? void 0 : res.data) !== null && _res$data !== void 0 ? _res$data : res) || []).map(normalizeMonth).filter((m) => /^\d{4}-\d{2}$/.test(m.month)).sort((a, b) => a.month.localeCompare(b.month));
				} catch (_unused) {
					months.value = [];
					ElMessage.error("印章业务看板加载失败");
				} finally {
					loading.value = false;
				}
			});
			return function load() {
				return _ref.apply(this, arguments);
			};
		}();
		const fullMonths = computed(() => {
			const byMonth = new Map(months.value.map((m) => [m.month, m]));
			return Array.from({ length: 12 }, (_, i) => {
				const month = `${year.value}-${String(i + 1).padStart(2, "0")}`;
				return byMonth.get(month) || emptyMonth(month);
			});
		});
		const hasData = computed(() => fullMonths.value.some((m) => m.revenue || m.cost || m.profit || m.sealCount || m.newCount || m.newAmount));
		const activeMonthCount = computed(() => fullMonths.value.filter((m) => m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount).length);
		const sum = (key) => fullMonths.value.reduce((s, m) => s + toNum(m[key]), 0);
		const totalRevenue = computed(() => sum("revenue"));
		const totalCost = computed(() => sum("cost"));
		const totalProfit = computed(() => totalRevenue.value - totalCost.value);
		const totalSealCount = computed(() => sum("sealCount"));
		const totalNewCount = computed(() => sum("newCount"));
		const totalNewAmount = computed(() => sum("newAmount"));
		const yearProfitRate = computed(() => totalRevenue.value > 0 ? totalProfit.value / totalRevenue.value : 0);
		const yearAvgPrice = computed(() => totalSealCount.value > 0 ? totalRevenue.value / totalSealCount.value : 0);
		const yearDailyCount = computed(() => {
			const list = fullMonths.value.filter((m) => m.dailyCount > 0);
			return list.length ? list.reduce((s, m) => s + m.dailyCount, 0) / list.length : 0;
		});
		const newAmountRate = computed(() => totalRevenue.value > 0 ? totalNewAmount.value / totalRevenue.value : 0);
		const maxBy = (getter, onlyPositive = true) => {
			const list = fullMonths.value.filter((m) => !onlyPositive || getter(m) > 0);
			if (!list.length) return void 0;
			return list.reduce((best, item) => getter(item) > getter(best) ? item : best, list[0]);
		};
		const minBy = (getter, onlyPositive = true) => {
			const list = fullMonths.value.filter((m) => !onlyPositive || getter(m) > 0);
			if (!list.length) return void 0;
			return list.reduce((best, item) => getter(item) < getter(best) ? item : best, list[0]);
		};
		const bestRevenueMonth = computed(() => maxBy((m) => m.revenue));
		const highestCostMonth = computed(() => maxBy((m) => m.cost));
		const worstProfitRateMonth = computed(() => minBy((m) => m.profitRate, true));
		const bestRevenueLabel = computed(() => bestRevenueMonth.value ? `${monthLabel(bestRevenueMonth.value.month)}收款最高` : "暂无趋势");
		const focusMonth = computed(() => {
			const now = /* @__PURE__ */ new Date();
			const currentMonth = `${year.value}-${String(now.getMonth() + 1).padStart(2, "0")}`;
			const current = fullMonths.value.find((m) => m.month === currentMonth);
			if (current && (current.revenue || current.cost || current.sealCount || current.newCount)) return current;
			const list = fullMonths.value.filter((m) => m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount);
			return list.length ? list[list.length - 1] : void 0;
		});
		const previousFocusMonth = computed(() => {
			if (!focusMonth.value) return void 0;
			const index = fullMonths.value.findIndex((m) => {
				var _focusMonth$value;
				return m.month === ((_focusMonth$value = focusMonth.value) === null || _focusMonth$value === void 0 ? void 0 : _focusMonth$value.month);
			});
			if (index <= 0) return void 0;
			return fullMonths.value[index - 1];
		});
		const monthCards = computed(() => {
			const active = fullMonths.value.filter((m) => m.revenue || m.cost || m.sealCount || m.newCount || m.newAmount);
			if (active.length >= 6) return active.slice(Math.max(active.length - 6, 0));
			return fullMonths.value.slice(0, 6);
		});
		const mom = (current, previous) => {
			if (!previous) return "";
			const rate = ((current || 0) - previous) / previous;
			return `${rate >= 0 ? "+" : ""}${(rate * 100).toFixed(1)}%`;
		};
		const momClass = (current, previous) => {
			if (!previous) return "";
			return (current || 0) >= previous ? "is-up" : "is-down";
		};
		const kpis = computed(() => {
			var _focusMonth$value2, _focusMonth$value3, _previousFocusMonth$v;
			return [
				{
					key: "revenue",
					label: "年度收款",
					value: fmtMoney(totalRevenue.value),
					note: `覆盖 ${activeMonthCount.value} 个月`,
					delta: bestRevenueMonth.value ? `峰值 ${monthLabel(bestRevenueMonth.value.month)}` : "暂无",
					deltaClass: "is-up",
					tone: "blue"
				},
				{
					key: "profit",
					label: "年度利润",
					value: fmtMoney(totalProfit.value),
					note: `平均利润率 ${fmtPct(yearProfitRate.value)}`,
					delta: totalProfit.value >= 0 ? "盈利" : "亏损",
					deltaClass: totalProfit.value >= 0 ? "is-up" : "is-down",
					tone: "green"
				},
				{
					key: "seal",
					label: "刻章数量",
					value: `${fmtInt(totalSealCount.value)} 枚`,
					note: `日均 ${fmtNum1(yearDailyCount.value)} 枚`,
					delta: maxBy((m) => m.sealCount) ? `${monthLabel(maxBy((m) => m.sealCount).month)}峰值` : "暂无",
					deltaClass: "is-warn",
					tone: "orange"
				},
				{
					key: "avg",
					label: "单章均价",
					value: fmtMoney(yearAvgPrice.value),
					note: previousFocusMonth.value ? `较上月 ${mom((_focusMonth$value2 = focusMonth.value) === null || _focusMonth$value2 === void 0 ? void 0 : _focusMonth$value2.avgPrice, previousFocusMonth.value.avgPrice)}` : "等待对比",
					delta: focusMonth.value ? `${monthLabel(focusMonth.value.month)} ${fmtMoney(focusMonth.value.avgPrice)}` : "暂无",
					deltaClass: momClass((_focusMonth$value3 = focusMonth.value) === null || _focusMonth$value3 === void 0 ? void 0 : _focusMonth$value3.avgPrice, (_previousFocusMonth$v = previousFocusMonth.value) === null || _previousFocusMonth$v === void 0 ? void 0 : _previousFocusMonth$v.avgPrice),
					tone: "teal"
				},
				{
					key: "new",
					label: "新签贡献",
					value: fmtMoney(totalNewAmount.value),
					note: `新签 ${fmtInt(totalNewCount.value)} 个`,
					delta: `占收款 ${fmtPct(newAmountRate.value)}`,
					deltaClass: "is-up",
					tone: "purple"
				}
			];
		});
		const focusAction = computed(() => {
			const m = focusMonth.value;
			if (!m) return "暂无数据";
			if (m.profitRate > 0 && m.profitRate < .25) return "复核成本";
			if (previousFocusMonth.value && m.avgPrice < previousFocusMonth.value.avgPrice) return "关注低价";
			if (m.newCount > 0) return "跟进新签";
			return "稳定复盘";
		});
		const insights = computed(() => {
			const list = [];
			if (bestRevenueMonth.value) list.push({
				title: "收款峰值已定位",
				desc: `${monthLabel(bestRevenueMonth.value.month)}收款 ${fmtMoney(bestRevenueMonth.value.revenue)}，可复盘当月来源、对接人和业务类型。`,
				tag: "增长",
				tone: "green"
			});
			if (worstProfitRateMonth.value && worstProfitRateMonth.value.profitRate < .3) list.push({
				title: "低利润月份需复核",
				desc: `${monthLabel(worstProfitRateMonth.value.month)}利润率 ${fmtPct(worstProfitRateMonth.value.profitRate)}，建议检查固定成本、外区域登报或返点费用。`,
				tag: "利润",
				tone: "orange"
			});
			if (highestCostMonth.value && highestCostMonth.value.cost > 0) {
				const costRate = highestCostMonth.value.revenue > 0 ? highestCostMonth.value.cost / highestCostMonth.value.revenue : 0;
				list.push({
					title: "成本最高月可单独追踪",
					desc: `${monthLabel(highestCostMonth.value.month)}成本 ${fmtMoney(highestCostMonth.value.cost)}${costRate ? `，占当月收款 ${fmtPct(costRate)}` : ""}，请确认成本附件是否齐全。`,
					tag: "成本",
					tone: costRate > .75 ? "red" : "blue"
				});
			}
			if (totalNewCount.value > 0) list.push({
				title: "新签客户可以转后续经营",
				desc: `全年新签 ${fmtInt(totalNewCount.value)} 个，贡献 ${fmtMoney(totalNewAmount.value)}，建议把高价值新签同步到长期合作客户或CRM跟进。`,
				tag: "新签",
				tone: "green"
			});
			if (previousFocusMonth.value && focusMonth.value && focusMonth.value.avgPrice < previousFocusMonth.value.avgPrice) list.push({
				title: "单章均价出现下滑",
				desc: `${monthLabel(focusMonth.value.month)}单章均价 ${fmtMoney(focusMonth.value.avgPrice)}，较上月 ${mom(focusMonth.value.avgPrice, previousFocusMonth.value.avgPrice)}，建议排查低价套章。`,
				tag: "价格",
				tone: "orange"
			});
			return list.slice(0, 4);
		});
		const detailRows = computed(() => [
			{
				key: "revenue",
				label: "总收款",
				fmt: "money",
				yearValue: totalRevenue.value,
				action: bestRevenueMonth.value ? `复盘${monthLabel(bestRevenueMonth.value.month)}` : "等待数据"
			},
			{
				key: "cost",
				label: "总成本",
				fmt: "money",
				yearValue: totalCost.value,
				action: highestCostMonth.value ? `核对${monthLabel(highestCostMonth.value.month)}成本` : "补成本"
			},
			{
				key: "profit",
				label: "月度利润",
				fmt: "money",
				yearValue: totalProfit.value,
				action: totalProfit.value >= 0 ? "保持利润" : "压降成本"
			},
			{
				key: "profitRate",
				label: "利润率",
				fmt: "pct",
				yearValue: yearProfitRate.value,
				action: "守住利润率"
			},
			{
				key: "sealCount",
				label: "总刻章数量",
				fmt: "int",
				yearValue: totalSealCount.value,
				action: "按峰值排产"
			},
			{
				key: "avgPrice",
				label: "单章均价",
				fmt: "money",
				yearValue: yearAvgPrice.value,
				action: "排查低价单"
			},
			{
				key: "dailyCount",
				label: "日刻章量",
				fmt: "num1",
				yearValue: yearDailyCount.value,
				action: "优化排班"
			},
			{
				key: "newCount",
				label: "新签个数",
				fmt: "int",
				yearValue: totalNewCount.value,
				action: "转长期跟进"
			},
			{
				key: "newAmount",
				label: "新签金额",
				fmt: "money",
				yearValue: totalNewAmount.value,
				action: "复购触达"
			}
		]);
		const maxRevenue = computed(() => Math.max(...fullMonths.value.map((m) => m.revenue), 0));
		const barHeight = (v) => {
			if (!maxRevenue.value || !v) return "8px";
			return `${Math.max(12, Math.round(v / maxRevenue.value * 180))}px`;
		};
		const monthLabel = (m) => {
			const mm = Number(m.slice(5, 7));
			return Number.isFinite(mm) && mm > 0 ? `${mm}月` : "—";
		};
		const fmtMoney = (n) => `¥${Number(n || 0).toLocaleString(void 0, {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		})}`;
		const shortMoney = (n) => {
			const v = Number(n || 0);
			if (!v) return "¥0";
			if (Math.abs(v) >= 1e4) return `¥${(v / 1e4).toFixed(1)}万`;
			return `¥${Math.round(v).toLocaleString()}`;
		};
		const fmtPct = (n) => `${(Number(n || 0) * 100).toFixed(0)}%`;
		const fmtInt = (n) => Math.round(Number(n || 0)).toLocaleString();
		const fmtNum1 = (n) => Number(n || 0).toFixed(1);
		const formatByType = (v, fmt) => {
			if (fmt === "money") return fmtMoney(v);
			if (fmt === "pct") return fmtPct(v);
			if (fmt === "int") return fmtInt(v);
			return fmtNum1(v);
		};
		const valueOf = (key, m) => toNum(m[key]);
		const profitClass = (v) => {
			if (v < 0) return "is-down";
			if (v > 0 && v < .3) return "is-warn";
			return "is-up";
		};
		const cellClass = (key, value) => {
			if (key === "profit" || key === "profitRate") return profitClass(value);
			if ((key === "revenue" || key === "sealCount" || key === "newCount" || key === "newAmount") && value > 0) return "is-up-soft";
			return "";
		};
		onMounted(load);
		return (_ctx, _cache) => {
			const _component_el_date_picker = ElDatePicker;
			const _component_el_icon = ElIcon;
			const _component_el_button = ElButton;
			const _component_el_skeleton = ElSkeleton;
			const _component_el_empty = ElEmpty;
			const _component_el_tag = ElTag;
			return openBlock(), createElementBlock("div", _hoisted_1, [
				createBaseVNode("header", _hoisted_2, [_cache[2] || (_cache[2] = createBaseVNode("div", null, [createBaseVNode("h2", { class: "sb-title" }, "印章业务看板"), createBaseVNode("p", { class: "sb-sub" }, "按年汇总刻章收款、成本、利润、新签与效率，底部保留月度明细表用于复盘。")], -1)), createBaseVNode("div", _hoisted_3, [createVNode(_component_el_date_picker, {
					modelValue: year.value,
					"onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => year.value = $event),
					type: "year",
					"value-format": "YYYY",
					placeholder: "选择年份",
					clearable: false,
					class: "sb-year",
					onChange: load
				}, null, 8, ["modelValue"]), createVNode(_component_el_button, {
					loading: loading.value,
					onClick: load
				}, {
					default: withCtx(() => [createVNode(_component_el_icon, null, {
						default: withCtx(() => [createVNode(unref(refresh_default))]),
						_: 1
					}), _cache[1] || (_cache[1] = createTextVNode(" 刷新 ", -1))]),
					_: 1
				}, 8, ["loading"])])]),
				createBaseVNode("section", _hoisted_4, [(openBlock(true), createElementBlock(Fragment, null, renderList(kpis.value, (item) => {
					return openBlock(), createElementBlock("article", {
						key: item.key,
						class: normalizeClass(["sb-kpi", `sb-kpi--${item.tone}`])
					}, [createBaseVNode("div", null, [createBaseVNode("span", _hoisted_5, toDisplayString(item.label), 1), createBaseVNode("strong", _hoisted_6, toDisplayString(item.value), 1)]), createBaseVNode("div", _hoisted_7, [createBaseVNode("span", null, toDisplayString(item.note), 1), createBaseVNode("b", { class: normalizeClass(item.deltaClass) }, toDisplayString(item.delta), 3)])], 2);
				}), 128))]),
				loading.value && !months.value.length ? (openBlock(), createBlock(_component_el_skeleton, {
					key: 0,
					rows: 8,
					animated: ""
				})) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [!hasData.value ? (openBlock(), createBlock(_component_el_empty, {
					key: 0,
					description: `${year.value} 年还没有刻章提单或成本数据`,
					"image-size": 96
				}, null, 8, ["description"])) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [
					createBaseVNode("section", _hoisted_8, [createBaseVNode("article", _hoisted_9, [
						createBaseVNode("div", _hoisted_10, [_cache[3] || (_cache[3] = createBaseVNode("div", null, [createBaseVNode("h3", null, "月度收款趋势"), createBaseVNode("p", null, "根据刻章提单收款汇总，帮助判断哪个月份业务拉动最明显。")], -1)), createVNode(_component_el_tag, {
							type: "success",
							effect: "light"
						}, {
							default: withCtx(() => [createTextVNode(toDisplayString(bestRevenueLabel.value), 1)]),
							_: 1
						})]),
						createBaseVNode("div", _hoisted_11, [(openBlock(true), createElementBlock(Fragment, null, renderList(fullMonths.value, (m) => {
							var _focusMonth$value4;
							return openBlock(), createElementBlock("div", {
								key: m.month,
								class: "sb-bar-item"
							}, [createBaseVNode("div", _hoisted_12, [createBaseVNode("div", _hoisted_13, toDisplayString(shortMoney(m.revenue)), 1), createBaseVNode("div", {
								class: normalizeClass(["sb-bar", { "is-focus": m.month === ((_focusMonth$value4 = focusMonth.value) === null || _focusMonth$value4 === void 0 ? void 0 : _focusMonth$value4.month) }]),
								style: normalizeStyle({ height: barHeight(m.revenue) })
							}, null, 6)]), createBaseVNode("span", null, toDisplayString(monthLabel(m.month)), 1)]);
						}), 128))]),
						createBaseVNode("div", _hoisted_14, [
							createBaseVNode("div", null, [_cache[4] || (_cache[4] = createBaseVNode("span", null, "最佳月份", -1)), createBaseVNode("b", null, toDisplayString(bestRevenueMonth.value ? `${monthLabel(bestRevenueMonth.value.month)} · ${fmtMoney(bestRevenueMonth.value.revenue)}` : "—"), 1)]),
							createBaseVNode("div", null, [_cache[5] || (_cache[5] = createBaseVNode("span", null, "最低利润率", -1)), createBaseVNode("b", { class: normalizeClass(worstProfitRateMonth.value ? profitClass(worstProfitRateMonth.value.profitRate) : "") }, toDisplayString(worstProfitRateMonth.value ? `${monthLabel(worstProfitRateMonth.value.month)} · ${fmtPct(worstProfitRateMonth.value.profitRate)}` : "—"), 3)]),
							createBaseVNode("div", null, [_cache[6] || (_cache[6] = createBaseVNode("span", null, "成本最高月", -1)), createBaseVNode("b", null, toDisplayString(highestCostMonth.value ? `${monthLabel(highestCostMonth.value.month)} · ${fmtMoney(highestCostMonth.value.cost)}` : "—"), 1)]),
							createBaseVNode("div", null, [_cache[7] || (_cache[7] = createBaseVNode("span", null, "当前关注", -1)), createBaseVNode("b", null, toDisplayString(focusMonth.value ? `${monthLabel(focusMonth.value.month)} · ${focusAction.value}` : "暂无"), 1)])
						])
					]), createBaseVNode("article", _hoisted_15, [createBaseVNode("div", _hoisted_16, [_cache[8] || (_cache[8] = createBaseVNode("div", null, [createBaseVNode("h3", null, "经营提示"), createBaseVNode("p", null, "把月度数据自动翻译成下一步要看的问题。")], -1)), createVNode(_component_el_tag, {
						type: "warning",
						effect: "light"
					}, {
						default: withCtx(() => [createTextVNode(toDisplayString(insights.value.length) + " 条提示", 1)]),
						_: 1
					})]), createBaseVNode("div", _hoisted_17, [(openBlock(true), createElementBlock(Fragment, null, renderList(insights.value, (item) => {
						return openBlock(), createElementBlock("div", {
							key: item.title,
							class: "sb-insight"
						}, [
							createBaseVNode("i", { class: normalizeClass(`is-${item.tone}`) }, null, 2),
							createBaseVNode("div", null, [createBaseVNode("b", null, toDisplayString(item.title), 1), createBaseVNode("span", null, toDisplayString(item.desc), 1)]),
							createBaseVNode("em", { class: normalizeClass(`is-${item.tone}`) }, toDisplayString(item.tag), 3)
						]);
					}), 128))])])]),
					createBaseVNode("section", _hoisted_18, [(openBlock(true), createElementBlock(Fragment, null, renderList(monthCards.value, (m) => {
						var _focusMonth$value5;
						return openBlock(), createElementBlock("article", {
							key: m.month,
							class: normalizeClass(["sb-month-card", { "is-focus": m.month === ((_focusMonth$value5 = focusMonth.value) === null || _focusMonth$value5 === void 0 ? void 0 : _focusMonth$value5.month) }])
						}, [
							createBaseVNode("strong", null, toDisplayString(monthLabel(m.month)), 1),
							createBaseVNode("span", null, "收款 " + toDisplayString(shortMoney(m.revenue)), 1),
							createBaseVNode("span", null, [_cache[9] || (_cache[9] = createTextVNode("利润率 ", -1)), createBaseVNode("b", { class: normalizeClass(profitClass(m.profitRate)) }, toDisplayString(fmtPct(m.profitRate)), 3)])
						], 2);
					}), 128))]),
					createBaseVNode("section", _hoisted_19, [createBaseVNode("div", _hoisted_20, [_cache[10] || (_cache[10] = createBaseVNode("div", null, [createBaseVNode("h3", null, "月度指标明细"), createBaseVNode("p", null, "保留原有“指标 × 月份”口径，并补充全年汇总与动作建议。")], -1)), createVNode(_component_el_tag, { effect: "plain" }, {
						default: withCtx(() => [createTextVNode("共 " + toDisplayString(activeMonthCount.value) + " 个月有数据", 1)]),
						_: 1
					})]), createBaseVNode("div", _hoisted_21, [createBaseVNode("table", _hoisted_22, [createBaseVNode("thead", null, [createBaseVNode("tr", null, [
						_cache[11] || (_cache[11] = createBaseVNode("th", null, "指标", -1)),
						(openBlock(true), createElementBlock(Fragment, null, renderList(fullMonths.value, (m) => {
							return openBlock(), createElementBlock("th", { key: m.month }, toDisplayString(monthLabel(m.month)), 1);
						}), 128)),
						_cache[12] || (_cache[12] = createBaseVNode("th", null, "全年", -1)),
						_cache[13] || (_cache[13] = createBaseVNode("th", null, "动作建议", -1))
					])]), createBaseVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(detailRows.value, (row) => {
						return openBlock(), createElementBlock("tr", { key: row.key }, [
							createBaseVNode("td", null, toDisplayString(row.label), 1),
							(openBlock(true), createElementBlock(Fragment, null, renderList(fullMonths.value, (m) => {
								return openBlock(), createElementBlock("td", {
									key: m.month,
									class: normalizeClass(cellClass(row.key, valueOf(row.key, m)))
								}, toDisplayString(formatByType(valueOf(row.key, m), row.fmt)), 3);
							}), 128)),
							createBaseVNode("td", { class: normalizeClass(cellClass(row.key, row.yearValue)) }, toDisplayString(formatByType(row.yearValue, row.fmt)), 3),
							createBaseVNode("td", null, toDisplayString(row.action), 1)
						]);
					}), 128))])])])]),
					_cache[14] || (_cache[14] = createBaseVNode("p", { class: "sb-tip" }, "数据说明：收款、刻章数量、新签来自「刻章业务提单」；总成本来自「刻章成本明细」。利润 = 收款 - 成本，日刻章量 = 当月刻章数 ÷ 当月有提单的天数。", -1))
				], 64))], 64))
			]);
		};
	}
}), [["__scopeId", "data-v-8ba454cb"]]);
//#endregion
export { board_default as default };
